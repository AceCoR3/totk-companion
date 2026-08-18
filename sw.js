const CACHE_NAME = 'totk-companion-v1081-header-fix';
const APP_FILES = [
  "./LOKALISIERUNG.md",
  "./README.md",
  "./app.js",
  "./assets/icons/Y.png",
  "./assets/icons/addison_sign.png",
  "./assets/icons/arrow.png",
  "./assets/icons/bubbul.png",
  "./assets/icons/cave.png",
  "./assets/icons/chasm.png",
  "./assets/icons/cursor.png",
  "./assets/icons/depths.png",
  "./assets/icons/dpad-up.png",
  "./assets/icons/eye.png",
  "./assets/icons/flux_construct.png",
  "./assets/icons/frox.png",
  "./assets/icons/gleeok.png",
  "./assets/icons/hinox.png",
  "./assets/icons/korok_carry.png",
  "./assets/icons/korok_hidden.png",
  "./assets/icons/korok_hidden_start.png",
  "./assets/icons/leaf.png",
  "./assets/icons/lightroot.png",
  "./assets/icons/location.png",
  "./assets/icons/molduga.png",
  "./assets/icons/old_map.png",
  "./assets/icons/sages_will.png",
  "./assets/icons/schema_stone.png",
  "./assets/icons/shrine.png",
  "./assets/icons/sky.png",
  "./assets/icons/surface.png",
  "./assets/icons/sword.png",
  "./assets/icons/talus.png",
  "./assets/icons/up-down.png",
  "./assets/icons/well.png",
  "./assets/icons/yiga_schematic.png",
  "./assets/maps/depths-medium.png",
  "./assets/maps/depths-small.png",
  "./assets/maps/sky-medium.png",
  "./assets/maps/sky-small.png",
  "./assets/maps/surface-medium.png",
  "./assets/maps/surface-small.png",
  "./assets/pwa/apple-touch-icon.png",
  "./assets/pwa/icon-192.png",
  "./assets/pwa/icon-512.png",
  "./assets/pwa/icon-maskable-512.png",
  "./data/ICON_MAPPING.json",
  "./data/LOCALIZATION_REPORT.json",
  "./data/SOURCES.md",
  "./data/locations.js",
  "./data/locations.json",
  "./index.html",
  "./manifest.webmanifest",
  "./patch_v08.py",
  "./styles.css"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
