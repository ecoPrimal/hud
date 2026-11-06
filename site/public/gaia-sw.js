// GAIA Service Worker — caches diamond lens for offline operation
const CACHE = 'gaia-diamond-v1';
const ASSETS = [
  '/diamond-lens.html',
  '/gaia-manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  // Network-first for data, cache-first for shell
  if (e.request.url.includes('/data/') || e.request.url.includes('/v1/')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
