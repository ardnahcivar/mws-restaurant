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
];

const idburls = [
	'restaurants',
	'restaurants/?'
];

const dbName = 'resto-view';
const version = 1;
const objectStoreNames = ['restaurants'];
let db;

// const dbPromise = idb.open(`${dbName}-${version}`, 1, function(upgradeDb) {
//     if (!upgradeDb.objectStoreNames.contains(`${objectStoreNames[0]}-${version}`)) {
//       upgradeDb.createObjectStore(`${objectStoreNames[0]}-${version}`);
//     }
// });


self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then(function (cache) {
				return cache.addAll(urlsToCache);
			})
	);
});

self.addEventListener('fetch', function (event) {
	event.respondWith(
		caches.match(event.request)
			.then(function (response) {
				if (response) {
					return response;
				}
				if(event.request.url.indexOf(idburls[0]) > 0){
					let fetchReq = event.request.clone();
					return fetch(fetchReq).then(function (response) {
						if (!response || response.status != 200) {
							return response;
						}
						let responseToCache = response.clone();
						caches.open(CACHE_NAME)
							.then(function (cache) {
								responseToCache.json().then((data) => {
									self.clients.matchAll().then(function (clients){
										clients.forEach(function(client){
											client.postMessage({
												msg: data,
												url: event.request.url
											});
										});
									});
								});
							});
						return response;
					}).catch((error)=>{
						//in offline 
						return new Promise((resolve,reject) => {
							resolve(new Response(new ReadableStream(get(event.request.url)),{'status':200}));
						},(error)=>{
							reject(error);
						});
					});
				}
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
			})
	);
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


getDB = () => {
	if (!db) {
		db = new Promise((resolve, reject) => {
			const openreq = indexedDB.open(`${dbName}-${version}`, 1);

			openreq.onerror = () => {
				reject(openreq.error);
			};

			openreq.onupgradeneeded = () => {
				// First time setup: create an empty object store
				openreq.result.createObjectStore(`${objectStoreNames[0]}-${version}`);
			};

			openreq.onsuccess = () => {
				resolve(openreq.result);
			};
		});
	}
	return db;
};

async function withStore(type, callback) {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(`${objectStoreNames[0]}-${version}`, type);
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		callback(transaction.objectStore(`${objectStoreNames[0]}-${version}`));
	});
}

async function get(key) {
	let req;
	await withStore('readonly', store => {
		req = store.get(key);
	});
	return req.result;  
}



