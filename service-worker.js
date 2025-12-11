const CACHE_NAME = 'interest-calculator-v1';
const urlsToCache = [
    '/', // 根目錄 (通常是 index.html)
    '/index.html',
    '/script.js',
    '/manifest.json',
    '/images/icon-192x192.png', // 確保圖標也被緩存
    '/images/icon-512x512.png',
    // 如果您有 CSS 檔案 (例如 style.css)，請加上它
    // '/style.css' 
];

// 安裝 Service Worker 並快取所有資源
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// 攔截網路請求，嘗試從快取中獲取資源
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// 清理舊的快取
self.addEventListener('activate', function(event) {
    var cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});