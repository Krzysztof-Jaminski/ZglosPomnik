const CACHE_NAME = 'zglospomnik-v5-' + Date.now();
const urlsToCache = [
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Force activation
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  const acceptHeader = event.request.headers.get('accept') || '';
  const isNavigationRequest =
    event.request.mode === 'navigate' ||
    (event.request.method === 'GET' && acceptHeader.includes('text/html'));
  
  // Skip external domains (Azure Blob Storage, API endpoints, etc.)
  const externalDomains = [
    'drzewapistorage.blob.core.windows.net',
    'drzewaapi.thankfulmoss-a87bb02c.polandcentral.azurecontainerapps.io',
    'images.pexels.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ];
  
  if (externalDomains.some(domain => url.hostname.includes(domain))) {
    return; // Let external requests pass through normally
  }

  // Skip requests to different ports on localhost
  if (url.hostname === 'localhost' && url.port !== location.port) {
    return;
  }

  // Skip node_modules requests in development
  if (url.pathname.includes('/node_modules/')) {
    return;
  }

  // Skip development server requests
  if (url.pathname.includes('/@vite/') || url.pathname.includes('/@fs/')) {
    return;
  }

  // Only handle requests from the same origin
  if (url.origin !== location.origin) {
    return;
  }

  // Force network-first strategy for navigation/HTML requests to avoid stale shells
  if (isNavigationRequest) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => cachedResponse || caches.match('/'));
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then((fetchResponse) => {
            // Cache successful responses for same-origin requests
            if (fetchResponse.ok) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }
            return fetchResponse;
          })
          .catch((error) => {
            // If fetch fails, return a fallback response only for HTML pages
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            // For other resources, let the browser handle the error naturally
            throw error;
          });
      })
  );
});