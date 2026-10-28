// Lightweight PWA Service Worker for SafeZone Calculator Disguise
const CACHE_NAME = 'safezone-calc-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network handle dynamic API requests directly
  if (event.request.url.includes('/api/')) {
    return;
  }
  // Standard network-first strategy for static assets
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
