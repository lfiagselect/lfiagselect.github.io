// LFIAGtube — Service Worker v6 (rollback phase B)
// Stratégie: network-first HTML (freshness), stale-while-revalidate JS/CSS (perf), cache-first assets
const CACHE_VERSION = 'lfiag-v6-202604261330';
const CACHE_NAME = CACHE_VERSION;
const SHELL_ASSETS = [
  '/manifest.json',
  '/icon-192.jpeg',
  '/icon-512.jpeg',
  '/privacy.html',
  '/terms.html'
];

// Install : précache statics + skip waiting
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate : nettoyer vieux caches + claim clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});

// Fetch strategies
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const req = event.request;

  // Jamais cache : APIs Google / Drive / Apps Script / fonts
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('accounts.google.com') ||
    url.hostname.includes('script.google.com') ||
    url.hostname.includes('drive.google.com') ||
    url.hostname.includes('googleusercontent.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdn.jsdelivr.net')
  ) {
    event.respondWith(fetch(req));
    return;
  }

  // Ignorer non-GET
  if (req.method !== 'GET') { event.respondWith(fetch(req)); return; }

  const path = url.pathname;
  const isNav = req.mode === 'navigate' || path === '/' || path === '/index.html' || /\.html$/i.test(path);
  const isJsCss = /\.(js|css|mjs)$/i.test(path);

  // Network-first pour HTML (freshness max: shell change souvent)
  if (isNav) {
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          }
          return response;
        })
        .catch(() => caches.match(req).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // Stale-while-revalidate pour JS/CSS (instant load + background refresh)
  if (isJsCss) {
    event.respondWith(
      caches.match(req).then(cached => {
        const networkFetch = fetch(req).then(fresh => {
          if (fresh && fresh.ok) {
            const clone = fresh.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          }
          return fresh;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Cache-first pour assets statiques (images, fonts, icons, vidéos)
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // Revalidation silencieuse en arrière-plan
        fetch(req).then(fresh => {
          if (fresh && fresh.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(req, fresh.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        // Skip cache for non-http(s) schemes (ex: chrome-extension://)
        if (!/^https?:/.test(req.url)) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone