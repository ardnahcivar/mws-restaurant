/**
 * Common database helper functions.
 */
class DBHelper {

	/**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
	static get DATABASE_URL() {
		const port = 1337; // Change this to your server port
		return `http://localhost:${port}`;
	}

	/**
   * restaurnats api end point url
   */
	static get RESTAURANTS_URL() {
		return `restaurants`;
	}
  
	static get POST_REVIEWS_URL(){
		return `${this.DATABASE_URL}/reviews`;
	}

	static  MARK_FAVOURITE_URL(id,flag){
		return `${this.DATABASE_URL}/${this.RESTAURANTS_URL}/${id}/?is_favorite=${flag}`;
	}
	
	/**
	 * 
	 * alls reviews of a restaurant 
	 */
	static  REVIEWS_URL(id = 0){
		return (id ? `${this.DATABASE_URL}/reviews/?restaurant_id=${id}`: `${this.DATABASE_URL}/reviews/?restaurant_id=`);
	}

	/**
   * Fetch all restaurants.
   */
	static fetchRestaurants(callback) {

		DBHelper.getMethod(`${this.DATABASE_URL}/${this.RESTAURANTS_URL}`)
			.then((restaurants) => {
				callback(null, restaurants);
			}).catch((error) => {
				callback(error, null);
			});
	}

	/**
   * Fetch a restaurant by its ID.
   */
	static fetchRestaurantById(id, callback) {
		// fetch all restaurants with proper error handling.
		DBHelper.getMethod(`${this.DATABASE_URL}/${this.RESTAURANTS_URL}/${id}`)
			.then((restaurant) => {
				callback(null, restaurant);
			}).catch((error) => {
				callback(error, null);
			});
	}

	/**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
	static fetchRestaurantByCuisine(cuisine, callback) {
		// Fetch all restaurants  with proper error handling
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Filter restaurants to have only given cuisine type
				const results = restaurants.filter(r => r.cuisine_type == cuisine);
				callback(null, results);
			}
		});
	}

	/**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
	static fetchRestaurantByNeighborhood(neighborhood, callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Filter restaurants to have only given neighborhood
				const results = restaurants.filter(r => r.neighborhood == neighborhood);
				callback(null, results);
			}
		});
	}

	/**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
	static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				let results = restaurants;
				if (cuisine != 'all') { // filter by cuisine
					results = results.filter(r => r.cuisine_type == cuisine);
				}
				if (neighborhood != 'all') { // filter by neighborhood
					results = results.filter(r => r.neighborhood == neighborhood);
				}
				callback(null, results);
			}
		});
	}

	/**
   * Fetch all neighborhoods with proper error handling.
   */
	static fetchNeighborhoods(callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all neighborhoods from all restaurants
				const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
				// Remove duplicates from neighborhoods
				const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
				callback(null, uniqueNeighborhoods);
			}
		});
	}

	/**
   * Fetch all cuisines with proper error handling.
   */
	static fetchCuisines(callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all cuisines from all restaurants
				const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
				// Remove duplicates from cuisines
				const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
				callback(null, uniqueCuisines);
			}
		});
	}

	/**
   * Restaurant page URL.
   */
	static urlForRestaurant(restaurant) {
		return (`./restaurant.html?id=${restaurant.id}`);
		// return (`http://localhost:1337/restaurants/${restaurant.id}`);
	}

	/**
   * Restaurant image URL.
   */
	static imageUrlForRestaurant(restaurant) {
		// return (`/img/${restaurant.photograph}`);
		return (`/img/${restaurant.photograph}.jpg`);
	}

	/**
   * Map marker for a restaurant.
   */
	//  static mapMarkerForRestaurant(restaurant, map) {
	//   // https://leafletjs.com/reference-1.3.0.html#marker  
	//   const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
	//     {title: restaurant.name,
	//     alt: restaurant.name,
	//     url: DBHelper.urlForRestaurant(restaurant)
	//     })
	//     marker.addTo(newMap);
	//   return marker;
	// } 
	static mapMarkerForRestaurant(restaurant, map) {
		const marker = new google.maps.Marker({
			position: restaurant.latlng,
			title: restaurant.name,
			url: DBHelper.urlForRestaurant(restaurant),
			map: map,
			animation: google.maps.Animation.DROP
		});
		return marker;
	}


	/**
 * fetch restaurnat review by id
 */
	static reviewById(id,callback){
		DBHelper.getMethod(DBHelper.REVIEWS_URL(id))
			.then((review) => {
				callback(null, review);
			}).catch((error) => {
				callback(error, null);
			});
	}

	static addReview(data,callback){
		DBHelper.postMethod(DBHelper.POST_REVIEWS_URL,data)
			.then((review)=>{
				callback(null,review);
			})
			.catch((error) => {
				callback(error,null);
			});
	}

	static markFavouriteRest(id,flag,callback){
		DBHelper.putMethod(DBHelper.MARK_FAVOURITE_URL(id,flag))
			.then((restaurant) => {
				callback(null,restaurant);
			})
			.catch((error) => {
				callback(error,null);
			});
	}
	/**
   * 
   * Fetch api wrapper 
   */
	static async getMethod(url) {
		return fetch(url)
			.then((response) => {
				if (response.status != 200) {
					throw new Error(`Fetch ERROR in get Method with status ${response.status}`);
				}
				console.log(`response for ${url} is ${response}`);
				return response.json();
			})
			.catch((error) => {
				throw new Error(`${error} Fetch ERROR in get Method`);
			});
	}


	/**
   * 
   * post method wrapper 
   */
	static async postMethod(url, data){
		return fetch(url,{
			method:'post',
			body:data
		}).then((response) => {
			return response.json();
		})
			.catch((error) => {
				throw new Error(`${error} in POST Method`);
			});
	}
  
	/**
   * 
   * put method wrapper 
   */
	static async putMethod(url){
		return fetch(url,{
			method:'put'
		}).then((response) => {
			return response.json();
		})
			.catch((error) => {
				throw new Error(`${error} in PUT Method`);
			});
	}
}