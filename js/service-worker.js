let CACHE_NAME = 'resto-view-v1';
let urlsToCache = [
    '/',
    '/css/main-content.css',
    '/css/mystyles.css',
    '/css/media-query.css',
    '/css/desktop.css',
    '/css/mobile.css'
]

self.addEventListener('install',function(event){
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache){
            return cache.addAll(urlsToCache);
        })
    )
})

self.addEventListener('fetch',function(event){
    console.log(event.request);
    event.respondWith(
        caches.match(event.request)
        .then(function(response){
            console.log(response);
            if(response){
                debugger;
                return response;
            }else{
                return fetch(event.request);
            }
        })
    )
})