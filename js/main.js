let restaurants, neighborhoods, cuisines, newMap;
let markers = [];
var map;
const dbName = 'resto-view';
const version = 1;
const objectStoreNames = ['restaurants'];

bootApplication = () => {
	fetchNeighborhoods();
	fetchCuisines();
	// updateRestaurants();
};

iDB = (event) => {
	//IndexedDB 
	if (('indexedDB' in window)) {
		let dbPromise = idb.open(`${dbName}-${version}`, 1, function (upgradeDb) {
			console.log(`making a new object store ${objectStoreNames[0]}-${version}`);
			if (!upgradeDb.objectStoreNames.contains(`${objectStoreNames[0]}-${version}`)) {
				const store = upgradeDb.createObjectStore(`${objectStoreNames[0]}-${version}`);
				console.log(event.data.msg);
				store.put(event.data.msg, event.data.url);
			}
		});

		dbPromise.then((db) => {
			const tx = db.transaction(`${objectStoreNames[0]}-${version}`, 'readwrite');
			console.log(event.data.msg);
			console.log(event.data.url);
			tx.objectStore(`${objectStoreNames[0]}-${version}`).put(event.data.msg, event.data.url);
			return tx.complete;
		})
			.then(() => console.log('Transaction completed'))
			.catch((error) => console.log(`Transaction completed with error ${error}`));

	} else {
		console.log('This browser doesn\'t support IndexedDB');
	}
};

navigator.serviceWorker.addEventListener('message', event => {
	iDB(event);
});

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
	loadMapScript(bootApplication);
	// initMap(); // added
});


/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
	DBHelper.fetchNeighborhoods((error, neighborhoods) => {
		if (error) { // Got an error
			console.error(error);
		} else {
			self.neighborhoods = neighborhoods;
			fillNeighborhoodsHTML();
		}
	});
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
	const select = document.getElementById('neighborhoods-select');
	neighborhoods.forEach(neighborhood => {
		const option = document.createElement('option');
		option.innerHTML = neighborhood;
		option.value = neighborhood;
		select.append(option);
	});
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
	DBHelper.fetchCuisines((error, cuisines) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.cuisines = cuisines;
			fillCuisinesHTML();
		}
	});
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
	const select = document.getElementById('cuisines-select');

	cuisines.forEach(cuisine => {
		const option = document.createElement('option');
		option.innerHTML = cuisine;
		option.value = cuisine;
		select.append(option);
	});
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
	const cSelect = document.getElementById('cuisines-select');
	const nSelect = document.getElementById('neighborhoods-select');

	const cIndex = cSelect.selectedIndex;
	const nIndex = nSelect.selectedIndex;

	const cuisine = cSelect[cIndex].value;
	const neighborhood = nSelect[nIndex].value;

	DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			resetRestaurants(restaurants);
			fillRestaurantsHTML();
		}
	});
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
	// Remove all restaurants
	self.restaurants = [];
	const ul = document.getElementById('restaurants-list');
	ul.innerHTML = '';

	self.markers = [];
	self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
	const ul = document.getElementById('restaurants-list');
	restaurants.forEach(restaurant => {
		ul.append(createRestaurantHTML(restaurant));
	});
	addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
	const li = document.createElement('li');
	li.tabIndex = 0;
	li.setAttribute('role', 'listitem');
	const image = document.createElement('img');
	image.className = 'restaurant-img';
	image.alt = `${restaurant.name}-picture`;
	image.src = DBHelper.imageUrlForRestaurant(restaurant);
	li.append(image);

	const name = document.createElement('h2');
	name.innerHTML = restaurant.name;
	li.append(name);

	const neighborhood = document.createElement('p');
	neighborhood.innerHTML = restaurant.neighborhood;
	li.append(neighborhood);

	const address = document.createElement('p');
	address.innerHTML = restaurant.address;
	li.append(address);

	li.onclick = () => {
		window.location.href = DBHelper.urlForRestaurant(restaurant);
	};
	return li;
};

addMarkersToMap = (restaurants = self.restaurants) => {
	restaurants.forEach(restaurant => {
		// Add marker to the map
		const marker = DBHelper.mapMarkerForRestaurant(restaurant, map);
		google.maps.event.addListener(marker, 'click', () => {
			window.location.href = marker.url;
		});
		self.markers.push(marker);
	});
};

if ('serviceWorker' in navigator) {
	window.addEventListener('load', function () {
		navigator.serviceWorker.register('./service-worker.js').then(function (registration) {
			// Registration was successful
			console.log('ServiceWorker registration successful with scope: ', registration.scope);
		}, function (err) {
			// registration failed :(
			console.log('ServiceWorker registration failed: ', err);
		});
	});
}


function loadMapScript(callback) {
	callback();
}