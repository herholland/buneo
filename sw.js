// Buneo.cl - Service Worker minimo
// Solo necesario para que el navegador permita "Instalar app" (PWA)
// No interfiere con la sincronizacion de datos (Google Sheets sigue funcionando igual via fetch directo)

const CACHE_NAME = 'buneo-cache-v1';
const ASSETS = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key){ return key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Network-first: siempre intenta traer la version online mas reciente
// (importante porque la app sincroniza con Google Sheets en vivo)
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
