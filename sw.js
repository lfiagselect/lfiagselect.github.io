// LFIAGtube — Service Worker v3
// Stratégie : network-first pour index.html (toujours la dernière version)
const CACHE_NAME = 'lfiag-shell-202604061444';
const SHELL_ASSETS = [
  '/manifest.json',
  '/icon-192.jpeg',
  '/icon-512.jpeg',
  '/privacy.html',
  '/terms.html'
];

// Install : précache les assets statiques (pas index.html)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()) // activation immédiate sans attendre
  );
});

// Activate : supprimer les anciens caches + prendre le contrôle immédiatement
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // prendre le contrôle de tous les onglets
  );
});

// Message : permet à la page de demander un rechargement après mise à jour
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// Fetch : network-first pour index.html, cache-first pour le reste
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ne jamais mettre en cache les appels Google
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('accounts.google.com') ||
    url.hostname.includes('script.google.com') ||
    url.hostname.includes('drive.google.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // index.html : toujours réseau en priorité, fallback cache
  if (url.pathname === '/' || url.pathname === '/index.html' || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then(response => {
          // Mettre à jour le cache avec la version fraîche
          if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html')) // fallback offline
    );
    return;
  }

  // Autres assets : cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        var clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') return caches.match('/index.html');
    })
  );
});
