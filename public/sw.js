const CACHE_NAME = 'zglospomnik-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip requests to different ports or external domains
  const url = new URL(event.request.url);
  if (url.hostname === 'localhost' && url.port !== location.port) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch((error) => {
          console.log('Fetch failed for:', event.request.url, error);
          // If fetch fails, return a fallback response
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
          return new Response('Network error', { status: 408 });
        });
      })
  );
});