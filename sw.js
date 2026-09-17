const CACHE = 'fs-snooker-v33';

const ASSETS = [
  './',
  './index.html',
  './styles.css?v=32',
  './src/main.js?v=32',
  './src/online.js?v=31',
  './src/table.js?v=31',
  './manifest.webmanifest',
  './icons/snooker.svg',
  './icons/snooker-192.png',
  './icons/snooker-512.png',
  './assets/sounds/ball_hit.wav',
  './assets/sounds/cushion_hit.wav',
  './assets/sounds/pocket_drop.wav'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(
        ASSETS.map((url) => new Request(url, {
          cache: 'reload'
        }))
      )
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) =>
            key.startsWith('fs-snooker-') &&
            key !== CACHE
          )
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin
  ) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);

    try {
      const response = await fetch(request, {
        cache: 'no-cache'
      });

      if (response.ok) {
        await cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;

      if (request.mode === 'navigate') {
        const page = await cache.match('./index.html');
        if (page) return page;
      }

      throw error;
    }
  })());
});