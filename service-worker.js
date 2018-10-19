const CACHE_NAME = 'resto-view-v1';
const urlsToCache = [
	'/',
	'/js/main.js',
	'/js/dbhelper.js',
	'/js/restaurant_info.js',
	'/js/idb.js',
	'/css/main-content.css',
	'/css/mystyles.css',
	'/css/media-query.css',
	'/css/desktop.css',
	'/css/mobile.css',
	'/css/resto-info.css',
	'/data/restaurants.json',
	'/restaurant.html'
];

const idburls = [
	'restaurants',
	'restaurants/?',
	'reviews/?'
];

const dbName = 'resto-view';
const version = 1;
const objectStoreNames = ['restaurants', 'reviews'];
let db,reviewFormData;

self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then(function (cache) {
				return cache.addAll(urlsToCache);
			})
	);
});

self.addEventListener('fetch', function (event) {

	if (event.request.clone().method == 'POST') {
		event.respondWith(fetch(event.request.clone()).catch((error) => {
			//save in indexedDB
			post(event);
			return new Response(JSON.stringify(reviewFormData), { 'status': 201,headers:{'Content-Type':'application/json'}});
		}));
	}
	else{
		event.respondWith(
			caches.match(event.request,{ignoreSearch:true})
				.then(function (response) {
					if (response) {
						updateCache(event);
						return response;
					}
		
					if (event.request.url.indexOf(idburls[0]) > 0 || event.request.url.indexOf(idburls[2]) > 0) {
						let fetchReq = event.request.clone();
						return fetch(fetchReq).then(function (response) {
							if (!response || response.status != 200) {
								return response;
							}
							let responseToCache = response.clone();
							caches.open(CACHE_NAME)
								.then(function (cache) {
									responseToCache.json().then((data) => {
										self.clients.matchAll().then(function (clients) {
											clients.forEach(function (client) {
												client.postMessage({
													msg: data,
													url: event.request.url
												});
											});
										});
									});
								});
							return response;
						}).catch((error) => {
							//in offline 
							return new Promise((resolve, reject) => {
								get(event.request.url)
									.then((val) => {
										return resolve(new Response(JSON.stringify(val), { 'status': 200,headers:{'Content-Type':'application/json'}}));
									});
							}
							, (error) => {
								reject(error);
							});
						});
					}
					return updateCache(event);
				})
		);
	}
});


self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches.keys().then(function (cache) {
			return Promise.all(
				cache.map(function (name) {
					if (urlsToCache.indexOf(name) === -1) {
						return caches.delete(name);
					}
				})
			);
		}).then(() => {
			console.log('V2 now ready to handle fetches!');
		})
	);
});

async function updateCache(event) {
	let fetchReq = event.request.clone();
	return fetch(fetchReq).then(function (response) {
		if (!response || response.status != 200) {
			return response;
		}
		let responseToCache = response.clone();
		caches.open(CACHE_NAME)
			.then(function (cache) {
				cache.put(event.request, responseToCache);
			});
		return response;
	});
}

getDB = (store) => {
	if (!db) {
		db = new Promise((resolve, reject) => {
			const openreq = indexedDB.open(`${dbName}-${version}`, 1);

			openreq.onerror = () => {
				reject(openreq.error);
			};

			openreq.onupgradeneeded = () => {
				// First time setup: create an empty object store
				openreq.result.createObjectStore(`${store}-${version}`);
			};

			openreq.onsuccess = () => {
				resolve(openreq.result);
			};
		});
	}
	return db;
};

async function withStore(store, type, callback) {
	const db = await getDB(objectStoreNames[0]);
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(`${store}-${version}`, type);
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		callback(transaction.objectStore(`${store}-${version}`));
	});
}

async function get(key) {
	let req;
	return new Promise((resolve,reject) => {
		withStore(objectStoreNames[0],'readonly',store => {
			req = store.get(key);
		}).then(() => {
			resolve(req.result);
		});
	});
}


async function post(event) {
	const db = await getDB(objectStoreNames[1]);
	await withStore(objectStoreNames[1], 'readwrite', store => {
		store.put({url:event.request.url,payload:reviewFormData,method:'POST'},`${reviewFormData.name}-${reviewFormData.restaurant_id}`);
	});
}

async function sendReviewsServer(){
	let allSavedReview = [];
	const db = await getDB(objectStoreNames[1]);
	await withStore(objectStoreNames[1], 'readwrite',store => {
		let req = store.openCursor();
		req.onsuccess = async function(event){
			let cursor = event.target.result;
			if(cursor){
				allSavedReview.push(cursor.value);
				cursor.continue();
			}else{
				for(let review of allSavedReview){
					fetch(review.url,{
						headers:{'Content-Type':'application/json'},
						method:review.method,
						body:JSON.stringify(review.payload)
					}).then((response) => {
						if(response.status < 400){
							const tx = db.transaction(`${objectStoreNames[1]}-${version}`,'readwrite');
							tx.objectStore(`${objectStoreNames[1]}-${version}`).delete(`${review.payload.name}-${review.payload.restaurant_id}`);
							tx.complete;
						}
					}).catch((error) => {
						throw Error(`${error} Failed to send review to server`);
					});
				}
			}
		};
	});
}

self.addEventListener('message',(event) => {
	reviewFormData = event.data;
});

self.addEventListener('sync', (event) => {
	if(event.tag == 'sendReviewData'){
		sendReviewsServer(event);
	}
} );