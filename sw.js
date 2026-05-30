const CACHE_NAME = 'baseball-sim-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// 1. 서비스 워커 설치 및 파일 캐싱
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. 네트워크 요청 가로채기 (오프라인 상태일 때 캐시된 파일 제공)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 파일이 있으면 반환하고, 없으면 서버(네트워크)에 요청
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// 3. 오래된 캐시 삭제 및 서비스 워커 업데이트
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
