const CACHE_NAME = 'proseka-tool-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/7.css'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('Cache addAll failed:', err);
      });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
    ])
  );
});

self.addEventListener('fetch', event => {
  // 外部CDNリソースもキャッシュから優先的に返すように設定
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        // 動的キャッシュ（アイコンなど外部URLが含まれるため）
        if (event.request.url.startsWith('https://via.placeholder.com/')) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
});
