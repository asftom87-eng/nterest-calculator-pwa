// 每次修改程式碼，請把 v1 改成 v2, v3... 以此類推
const CACHE_NAME = 'interest-calc-v2'; 
const urlsToCache = [
    './',
    './index.html',
    './script.js',
    './manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((keys) => Promise.all(
        keys.map((k) => { if (k !== CACHE_NAME) return caches.delete(k); })
    )));
});