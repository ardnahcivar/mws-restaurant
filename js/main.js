let restaurants, neighborhoods, cuisines, newMap;
let markers = [];

const dbName = 'resto-view';
const version = 1;
const objectStoreNames = ['restaurants'];

bootApplication = () => {
	fetchNeighborhoods();
	fetchCuisines();
	updateRestaurants();
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
 * Initialize leaflet map, called from HTML.
 */
// initMap = () => {
//   self.newMap = L.map('map', {
//         center: [40.722216, -73.987501],
//         zoom: 12,
//         scrollWheelZoom: false
//       });
//   L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
//     mapboxToken: 'pk.eyJ1IjoicmF2aWNoYW5kcmEtYmhhbmFnZSIsImEiOiJjamlndGl6ajIwbW0zM3FvODFwZWFoZ2ZqIn0.DCkNZCX48Zc-4tIXKS8krA',
//     maxZoom: 30,
//     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
//       '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
//       'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//     id: 'mapbox.streets'
//   }).addTo(newMap);

//   updateRestaurants();
// }
window.initMap = () => {
	let loc = {
		lat: 40.722216,
		lng: -73.987501
	};
	self.map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: loc,
		scrollwheel: false
	});
	updateRestaurants();
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

	// Remove all map markers
	// if (self.markers) {
	//   self.markers.forEach(marker => marker.remove());
	// }
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

	// const more = document.createElement('a');
	// more.innerHTML = 'View Details';
	// more.href = DBHelper.urlForRestaurant(restaurant);
	// li.append(more)
	li.onclick = () => {
		window.location.href = DBHelper.urlForRestaurant(restaurant);
	};
	return li;
};

/**
 * Add markers for current restaurants to the map.
 */
// addMarkersToMap = (restaurants = self.restaurants) => {
//   restaurants.forEach(restaurant => {
//     // Add marker to the map
//     const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
//     marker.on("click", onClick);
//     function onClick() {
//       window.location.href = marker.options.url;
//     }
//     self.markers.push(marker);
//   });
// }

addMarkersToMap = (restaurants = self.restaurants) => {
	restaurants.forEach(restaurant => {
		// Add marker to the map
		const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
		google.maps.event.addListener(marker, 'click', () => {
			window.location.href = marker.url;
		});
		self.markers.push(marker);
	});
};

if ('serviceWorker' in navigator) {
	window.addEventListener('load', function () {
		navigator.serviceWorker.register('service-worker.js').then(function (registration) {
			// Registration was successful
			console.log('ServiceWorker registration successful with scope: ', registration.scope);
		}, function (err) {
			// registration failed :(
			console.log('ServiceWorker registration failed: ', err);
		});
	});
}


function loadMapScript(callback) {
	let head = document.getElementsByTagName('head')[0];
	let script = document.createElement('script');
	script.type = 'text/javascript';
	script.charset = 'utf-8';
	let key = 'AIzaSyBT3oY7Gg7TNAfPZ5WEraGFmWU1sTdomdA';
	script.src = 'https://maps.googleapis.com/maps/api/js?key=' + key + '&libraries=places&callback=initMap';
	head.appendChild(script);
	if (script.readyState) {
		script.onreadystatechange = function () {
			if (script.readyState == 'loaded' || script.readyState == 'complete') {
				script.onreadystatechange = null;
				callback();
			}
		};
	} else {
		script.onload = function () {
			callback();
		};
	}
	// fetch('./configs/credentials.json')
	//   .then(function (response) {
	//     if (response.status != 200) {
	//       console.log('Error loading the json file', response.status);
	//       return;
	//     }
	//     response.json().then(function (data) {
	//       let head = document.getElementsByTagName('head')[0];
	//       let script = document.createElement('script');
	//       script.type = "application/javascript";
	//       script.charset = "utf-8";
	//       script.src = "https://maps.googleapis.com/maps/api/js?key=" + data.key + "&libraries=places&callback=initMap";
	//       head.appendChild(script);
	//       callback();
	//     })
	//   })
	//   .catch(function (err) {
	//     console.log('Got a error', err);
	//   })
}