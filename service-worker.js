// ============================================
// NAMAZ VAKİTLERİ PWA - SERVICE WORKER
// ============================================

const CACHE_NAME = 'namaz-vakitleri-v2';

// Install event - skip waiting
self.addEventListener('install', event => {
    self.skipWaiting();
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - network first, cache fallback
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Skip caching for API requests - always go to network
    if (url.hostname === 'ezanvakti.emushaf.net' || url.hostname === 'api.aladhan.com') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache API responses for offline use
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }
    
    // For static assets - cache first, network fallback
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;
                
                return fetch(event.request).then(response => {
                    if (!response || response.status !== 200 || response.type === 'opaque') {
                        return response;
                    }
                    
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    
                    return response;
                });
            })
    );
});

// Handle notification messages from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, options } = event.data;
        self.registration.showNotification(title, options);
    }
});

// Handle notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                for (const client of clientList) {
                    if ('focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('./');
                }
            })
    );
});
