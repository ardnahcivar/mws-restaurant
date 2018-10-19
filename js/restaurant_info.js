let restaurant;


// const dbName = 'resto-view';
// const version = 1;
// const objectStoreNames = ['restaurants'];

navigator.serviceWorker.ready.then((registeration) => {
	return registeration.sync.register('sendReviewData');
}).then(() => {
	console.log('sync registered');
}).catch(() => {
	console.log('sync failed');
});

navigator.serviceWorker.addEventListener('message', event => {
	iDB(event);
});

iDB = (event) => {
	//IndexedDB 
	if (('indexedDB' in window)) {
		let dbPromise = idb.open(`${dbName}-${version}`, 1, function (upgradeDb) {
			console.log(`making a new object store ${objectStoreNames[0]}-${version}`);
			if (!upgradeDb.objectStoreNames.contains(`${objectStoreNames[0]}-${version}`)) {
				const store = upgradeDb.createObjectStore(`${objectStoreNames[0]}-${version}`);
				store.put(event.data.msg, event.data.url);
			}
		});

		dbPromise.then((db) => {
			const tx = db.transaction(`${objectStoreNames[0]}-${version}`, 'readwrite');
			tx.objectStore(`${objectStoreNames[0]}-${version}`).put(event.data.msg, event.data.url);
			return tx.complete;
		})
			.then(() => console.log('Transaction completed'))
			.catch((error) => console.log(`Transaction completed with error ${error}`));

	} else {
		console.log('This browser doesn\'t support IndexedDB');
	}
};


/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
	this.initMap();
});

initMap = () => {
	fetchRestaurantFromURL((error, restaurant) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.map = new google.maps.Map(document.getElementById('map'), {
				zoom: 16,
				center: restaurant.latlng,
				scrollwheel: false
			});
			fillBreadcrumb();
			DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
		}
	});
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
	if (self.restaurant) { // restaurant already fetched!
		callback(null, self.restaurant);
		return;
	}
	const id = getParameterByName('id');
	if (!id) { // no id found in URL
		error = 'No restaurant id in URL';
		callback(error, null);
	} else {
		DBHelper.fetchRestaurantById(id, (error, restaurant) => {
			self.restaurant = restaurant;
			if (!restaurant) {
				console.error(error);
				return;
			}
			fillRestaurantHTML();
			// this.fillBreadcrumb(restaurant);
			callback(null, restaurant);
		});
	}
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
	const name = document.getElementById('restaurant-name');
	name.innerHTML = restaurant.name;

	const address = document.getElementById('restaurant-address');
	address.innerHTML = restaurant.address;

	const image = document.getElementById('restaurant-img');
	image.className = 'restaurant-img';
	image.alt = `${restaurant.name}-picture`;
	image.src = DBHelper.imageUrlForRestaurant(restaurant);

	const cuisine = document.getElementById('restaurant-cuisine');
	cuisine.innerHTML = restaurant.cuisine_type;

	if(restaurant.is_favorite === 'true'){
		document.getElementById('heart-icon').classList.add('fas');
	}

	// fill operating hours
	if (restaurant.operating_hours) {
		fillRestaurantHoursHTML();
	}
	// fill reviews
	// fillReviewsHTML();
	DBHelper.reviewById(restaurant.id, (error, review) => {
		if (error) {
			console.log(error);
		} else {
			fillReviewsHTML(review);
		}
	});
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
	const hours = document.getElementById('restaurant-hours');

	const tablehead = document.createElement('tr');
	tablehead.className = 'table-head';

	const dayhead = document.createElement('th');
	dayhead.innerHTML = 'Day';


	tablehead.appendChild(dayhead);

	const dayhead1 = document.createElement('th');
	dayhead1.innerHTML = 'Status';

	tablehead.appendChild(dayhead1);

	hours.appendChild(tablehead);

	for (let key in operatingHours) {
		const row = document.createElement('tr');

		const day = document.createElement('td');
		day.innerHTML = key;
		row.appendChild(day);

		const time = document.createElement('td');
		time.innerHTML = operatingHours[key];
		row.appendChild(time);

		hours.appendChild(row);
	}
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews) => {

	//validation for checking if reviews is array or not
	if (!(reviews instanceof Array)) {
		let temp = reviews;
		reviews = [];
		reviews.push(temp);
	}
	const container = document.getElementById('reviews-container');
	const title = document.createElement('h3');
	title.innerHTML = 'Reviews';
	container.appendChild(title);

	let review = document.createElement('div');
	review.textContent = 'Add a Review';
	review.className = 'review-add-icon';
	review.onclick = this.closeReviewForm;

	let addReviewicon = document.createElement('i');
	addReviewicon.title = 'Add a review';
	addReviewicon.className = 'far fa-comment-alt';
	review.appendChild(addReviewicon);

	container.appendChild(review);

	let reviewForm = document.getElementById('add-review');
	container.appendChild(reviewForm);

	if (!reviews) {
		const noReviews = document.createElement('p');
		noReviews.innerHTML = 'No reviews yet!';
		container.appendChild(noReviews);
		return;
	}
	const ul = document.getElementById('reviews-list');
	reviews.forEach(review => {
		ul.appendChild(createReviewHTML(review));
	});
	container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
	const li = document.createElement('li');
	li.setAttribute('role', 'listitem');
	const reviews = document.createElement('div');
	reviews.className = 'review';

	const image = document.createElement('img');
	image.src = `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`;
	image.alt = `${review.name}-picture`;
	image.className = 'review-user';
	reviews.appendChild(image);

	const name = document.createElement('p');
	name.className = 'review-name';
	name.innerHTML = review.name;
	reviews.appendChild(name);

	const rating = document.createElement('p');
	rating.className = 'review-rated';
	rating.innerHTML = `Rating: ${review.rating}`;
	reviews.appendChild(rating);

	const date = document.createElement('p');
	date.className = 'review-date';
	date.innerHTML = new Date(review.updatedAt).toDateString();
	reviews.appendChild(date);

	li.appendChild(reviews);

	const comments = document.createElement('p');
	comments.className = 'review-comments';
	comments.innerHTML = review.comments;
	li.appendChild(comments);

	return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
	const breadcrumb = document.getElementById('breadcrumb');
	const li = document.createElement('li');
	li.innerHTML = restaurant.name;
	breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
	if (!url)
		url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);
	if (!results)
		return null;
	if (!results[2])
		return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * get restaurant review by id
 */
reviewById = (id) => {
	let url = DBHelper.REVIEWS_URL(id);
	DBHelper.getMethod();

};

addRestoReview = () => {
	//validation
	let rateIndex = -1;
	let rateList = document.getElementsByName('rating');
	for (let i = 0; i < rateList.length; i++) {
		console.log(rateList[i].hasOwnProperty('checked'));
		if (rateList[i].checked == true) {
			rateIndex = i;
			break;
		}
	}
	if (document.getElementById('reviewer-name').value &&
		document.getElementById('comments').value && rateIndex + 1) {
		let data = {
			'name': document.getElementById('reviewer-name').value,
			'comments': document.getElementById('comments').value,
			'rating': rateIndex + 1,
			'restaurant_id': parseInt(getParameterByName('id'))
		};

		///send form data to service worker for saving offline
		navigator.serviceWorker.controller.postMessage(data);

		DBHelper.addReview(JSON.stringify(data), (error, review) => {
			if (error) {
				alert('ERROR In Adding review');
			} else {
				console.log(review);
				this.clearReviewForm();
				document.getElementById('add-review').classList.toggle('disp-blk');
				this.insertReview(review);
				alert('Successfully added review');

			}
		});
	} else {
		alert('Please enter valid data');
	}
};

clearReviewForm = () => {
	let rateList = document.getElementsByName('rating');
	document.getElementById('reviewer-name').value = null;
	document.getElementById('comments').value = null;
	for (let i = 0; i < rateList.length; i++) {
		rateList[i].checked = false;
	}
};

rateIt = (e) => {
	const rates = document.querySelectorAll('.fa-star');
	for (let i = 0; i < rates.length; i++) {
		if (rates[i].classList == e.classList) {
			e.classList.toggle('fas');
			break;
		} else {
			e.classList.toggle('fas');
		}
	}
};

markFavourite = () => {
	document.getElementById('heart-icon').classList.toggle('ma');
	document.getElementById('heart-icon').classList.toggle('fas');

	DBHelper.markFavouriteRest(parseInt(getParameterByName('id')),
		document.getElementById('heart-icon').classList.contains('fas'),
		(error, restaurant) => {
			if (error) {
				alert('Error in mark favourite');
			} else {
				alert('marked favorite successfully');
			}
		});
};

insertReview = (review) => {
	const ul = document.getElementById('reviews-list');	
	ul.appendChild(this.createReviewHTML(review));
};

closeReviewForm = () => {
	this.clearReviewForm();
	document.getElementById('add-review').classList.toggle('disp-blk');
};