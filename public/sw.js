const CACHE_NAME = 'zglospomnik-v4';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing v4...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Force activation
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating v4...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
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
  
  // Skip external domains (Azure Blob Storage, API endpoints, etc.)
  const externalDomains = [
    'drzewaapistorage2024.blob.core.windows.net',
    'drzewaapi-app-2024.azurewebsites.net',
    'images.pexels.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ];
  
  if (externalDomains.some(domain => url.hostname.includes(domain))) {
    console.log('Service Worker: Skipping external domain:', url.hostname);
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
    console.log('Service Worker: Skipping different origin:', url.origin);
    return;
  }

  console.log('Service Worker: Handling same-origin request:', url.href);

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
            console.log('Fetch failed for:', event.request.url, error);
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