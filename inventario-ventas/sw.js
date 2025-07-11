const CACHE_NAME = 'inventario-cache-v3'; // Versiona la cache
// Rutas AJUSTADAS para reflejar que todo está en la raíz (gracias a la etiqueta <base>)
const urlsToCache = [
    '/',
    'index.html',
    'style.css',        // <-- Si style.css está en la raíz
    'app.js',           // <-- Si app.js está en la raíz
    'manifest.json',
    'favicon.ico',
    'icon-192x192.png', // <-- Si icon-192x192.png está en la raíz
    'icon-512x512.png'  // <-- Si icon-512x512.png está en la raíz
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('SW: Cache abierta. Cacheando recursos...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('SW: Recursos cacheado.');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('SW: Fallo al cachear', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('SW: Activado.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW: Eliminando cache vieja', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
