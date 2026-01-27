const CACHE_NAME = 'asamblari-v3';
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    // Diagrame tehnice
    './diagram_rivet_1765572763489.png',
    './diagram_weld_symbol_1765572778732.png',
    './diagram_thread_types_1765572794199.png',
    './diagram_splined_shaft_1765572816687.png',
    './diagram_leaf_spring_1765572831839.png',
    // Imagini atelier
    './workshop_welding_1765568398490.png',
    './workshop_tools_1765568415437.png',
    './workshop_assembly_1765568430842.png'
];

// Install - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate - cleanup old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(names =>
            Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
        ).then(() => self.clients.claim())
    );
});

// Fetch - stale-while-revalidate strategy
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Network-First for core files (HTML, CSS, JS) - Ensures updates are seen immediately
    if (event.request.url.includes('index.html') ||
        event.request.url.includes('styles.css') ||
        event.request.url.includes('app.js') ||
        event.request.url.endsWith('/')) {

        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                    return response;
                })
                .catch(() => caches.match(event.request)) // Fallback to cache if offline
        );
        return;
    }

    // Cache-first for other static assets (images, fonts)
    if (STATIC_ASSETS.some(asset => event.request.url.includes(asset.replace('./', '')))) {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
                .catch(() => caches.match('./index.html'))
        );
        return;
    }

    // Network-first for API/dynamic content, fallback to cache
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache successful responses
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(event.request))
            .catch(() => caches.match('./index.html'))
    );
});

// Background sync for offline submissions
self.addEventListener('sync', event => {
    if (event.tag === 'sync-results') {
        console.log('Syncing saved results...');
    }
});
