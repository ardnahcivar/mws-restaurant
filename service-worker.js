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
    '/css/resto-info.css',
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
                }
                let fetchReq = event.request.clone();
                return fetch(fetchReq).then(function(response){
                    if(!response || response.status != 200 || response.type !== 'basic'){
                        return response;
                    }
                    let responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                    .then(function(cache) {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                }) 
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
