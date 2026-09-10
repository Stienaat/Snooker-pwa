const CACHE = 'fs-snooker-v29';
const ASSETS = ['./', './index.html', './styles.css?v=29', './src/main.js?v=29', './src/online.js?v=29', './src/table.js?v=29', './manifest.webmanifest', './icons/snooker.svg'];

self.addEventListener('install', (event) => event.waitUntil(
  caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
));
self.addEventListener('activate', (event) => event.waitUntil(
  caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim())
));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(
    caches.open(CACHE).then((cache) => cache.match(event.request).then((cached) => cached || fetch(event.request)))
  );
});
