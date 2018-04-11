var staticCacheName = 'restaurants-reviews-content';
var contentImgsCache = 'restaurants-reviews-content-imgs';
var allCaches = [
  staticCacheName,
  contentImgsCache
];


self.addEventListener('install', function(event) {
  const request = new Request('https://maps.googleapis.com/maps/api/js?key=AIzaSyAPNrZ0pb8b1SckgtM9vMumf--fb8t3kkY&libraries=places&callback=initMap', {mode: 'no-cors'});
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      fetch(request).then(response => cache.put(request, response));
      return cache.addAll([
        '/index.html',
        '/restaurant.html',
        'js/main.js',
        'js/dbhelper.js',
        'js/restaurant_info.js',
        'data/restaurants.json',
        'css/styles.css'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurants-') &&
                 !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/') {
      event.respondWith(caches.match('/index.html'));
      return;
    }
    if (requestUrl.pathname.startsWith('/img/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }
  }
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});


function servePhoto(request) {
  var storageUrl = request.url;
  console.log('serving photos...');
  return caches.open(contentImgsCache).then(function(cache) {
    return cache.match(storageUrl).then(function(response) {
      if (response) return response;
      return fetch(request).then(function(networkResponse) {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}
