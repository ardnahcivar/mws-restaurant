let CACHE_NAME = 'resto-view-v1';
let urlsToCache = [
    '/',
    '/js/main.js',
    '/js/dbhelper.js',
    '/js/restaurant_info.js',
    '/css/main-content.css',
    '/css/mystyles.css',
    '/css/media-query.css',
    '/css/desktop.css',
    '/css/mobile.css',
    '/data/restaurants.json',
]

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(urlsToCache);
            })
    )
})

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                if (response) {
                    return response;
                } else {
                    return fetch(event.request);
                }
            })
    )
})


self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cache) {
            return Promise.all(
                cache.map(function (name) {
                    if (urlsToCache.indexOf(name) === -1) {
                        return caches.delete(name);
                    }
                })
            )
        })
    )
})
