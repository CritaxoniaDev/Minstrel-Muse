// service-worker.js
self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
  });
  
  // This is important for keeping audio playing in the background
  self.addEventListener('fetch', (event) => {
    // You can add custom caching strategies here if needed
    event.respondWith(fetch(event.request));
  });
  