const CACHE_NAME = 'interest-v20';
const urls = ['./', './index.html', './script.js', './manifest.json'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(urls))));
self.addEventListener('fetch', (e) => e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request))));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.map((k) => { if (k !== CACHE_NAME) return caches.delete(k); })))));