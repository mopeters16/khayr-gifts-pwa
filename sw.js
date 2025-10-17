// Service Worker for Khayr Gifts & More PWA
const CACHE_NAME = 'khayr-gifts-v1.21';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event with image caching
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // If it's an image, cache it
          if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
// Push event listener for notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body || 'New update from Khayr Gifts!',
        icon: 'icons/icon-192x192.png',
        badge: 'icons/icon-72x72.png',
        image: data.image,
        actions: [
            {
                action: 'shop',
                title: 'Shop Now'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Khayr Gifts', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'shop') {
        event.waitUntil(
            clients.openWindow('/products')
        );
    } else {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});