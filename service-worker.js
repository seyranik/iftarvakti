const CACHE = 'namazvakti-v9';
const ASSETS = ['/iftarvakti/', '/iftarvakti/index.html', '/iftarvakti/style.css', '/iftarvakti/script.js', '/iftarvakti/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('ezanvakti') || e.request.url.includes('workers.dev') || e.request.url.includes('googleapis')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', {headers:{'Content-Type':'application/json'}})));
    return;
  }
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});

// Web Push bildirimi
self.addEventListener('push', e => {
  if (!e.data) return;
  let data = {};
  try { data = e.data.json(); } catch { data = { title: 'Namaz Vakti', body: e.data.text() }; }
  e.waitUntil(
    self.registration.showNotification(data.title || 'Namaz Vakti', {
      body:    data.body || '',
      icon:    '/iftarvakti/icons/icon-192x192.png',
      badge:   '/iftarvakti/icons/icon-192x192.png',
      tag:     data.tag || 'namaz-vakti',
      vibrate: [200, 100, 200],
      data:    { url: '/iftarvakti/' },
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(cls => {
      for (const c of cls) {
        if (c.url.includes('iftarvakti')) { c.focus(); return; }
      }
      return clients.openWindow('/iftarvakti/');
    })
  );
});
