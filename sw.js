/* Cache-first app shell so the game plays offline in parks/neighborhoods.
   Bump CACHE on every release. Map tiles are runtime-cached opportunistically;
   the QR/code + fallback unlock paths work with zero connectivity.

   NOTE: Leaflet is expected to be vendored locally (see AGENTS.md). If it is
   still loaded from a CDN, the map will not work offline — the text stop list
   in app.js is the offline fallback. */
const CACHE = "lantern-v27";
const SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./global-story.js",
  "./i18n.js",
  "./i18n/en.json",
  "./i18n/es.json",
  "./i18n/fr.json",
  "./i18n/de.json",
  "./i18n/pt.json",
    "./i18n/it.json",
    "./i18n/ru.json",
  "./styles.css",
  "./manifest.webmanifest",
  "./vendor/leaflet.css",
  "./vendor/leaflet.js",
  "./assets/img/drz-afterdark.webp",
  "./assets/img/drz-cozy.webp",
  "./assets/img/drz-overdrive.webp",
  "./assets/img/drz-spooky.webp",
  "./assets/img/drz-finale.webp",
  "./assets/img/drz-hint.webp",
  "./assets/img/drz-welcome.webp",
  "./assets/img/finale-lantern-parade.webp",
  "./assets/img/logo-primary-evergreen.webp",
  "./assets/img/logo-primary.webp",
  "./assets/img/stop-1-pumpkin-afterdark.webp",
  "./assets/img/stop-1-pumpkin-cozy.webp",
  "./assets/img/stop-1-pumpkin-overdrive.webp",
  "./assets/img/stop-1-pumpkin-spooky.webp",
  "./assets/img/stop-1-wreath-afterdark.webp",
  "./assets/img/stop-1-wreath-cozy.webp",
  "./assets/img/stop-1-wreath-overdrive.webp",
  "./assets/img/stop-1-wreath-spooky.webp",
  "./assets/img/stop-2-oak-afterdark.webp",
  "./assets/img/stop-2-oak-cozy.webp",
  "./assets/img/stop-2-oak-overdrive.webp",
  "./assets/img/stop-2-oak-spooky.webp",
  "./assets/img/stop-2-tree-afterdark.webp",
  "./assets/img/stop-2-tree-cozy.webp",
  "./assets/img/stop-2-tree-overdrive.webp",
  "./assets/img/stop-2-tree-spooky.webp",
  "./assets/img/stop-3-graveyard-afterdark.webp",
  "./assets/img/stop-3-graveyard-cozy.webp",
  "./assets/img/stop-3-graveyard-overdrive.webp",
  "./assets/img/stop-3-graveyard-spooky.webp",
  "./assets/img/stop-3-green-afterdark.webp",
  "./assets/img/stop-3-green-cozy.webp",
  "./assets/img/stop-3-green-overdrive.webp",
  "./assets/img/stop-3-green-spooky.webp",
  "./assets/img/stop-4-spider-afterdark.webp",
  "./assets/img/stop-4-spider-cozy.webp",
  "./assets/img/stop-4-spider-overdrive.webp",
  "./assets/img/stop-4-spider-spooky.webp",
  "./assets/img/stop-4-workshop-afterdark.webp",
  "./assets/img/stop-4-workshop-cozy.webp",
  "./assets/img/stop-4-workshop-overdrive.webp",
  "./assets/img/stop-4-workshop-spooky.webp",
  "./assets/img/stop-5-owl-afterdark.webp",
  "./assets/img/stop-5-owl-cozy.webp",
  "./assets/img/stop-5-owl-overdrive.webp",
  "./assets/img/stop-5-owl-spooky.webp",
  "./assets/img/stop-5-stable-afterdark.webp",
  "./assets/img/stop-5-stable-cozy.webp",
  "./assets/img/stop-5-stable-overdrive.webp",
  "./assets/img/stop-5-stable-spooky.webp",
  "./assets/img/stop-6-lantern-afterdark.webp",
  "./assets/img/stop-6-lantern-cozy.webp",
  "./assets/img/stop-6-lantern-overdrive.webp",
  "./assets/img/stop-6-lantern-spooky.webp",
  "./assets/img/stop-6-parade-afterdark.webp",
  "./assets/img/stop-6-parade-cozy.webp",
  "./assets/img/stop-6-parade-overdrive.webp",
  "./assets/img/stop-6-parade-spooky.webp",
  "./assets/img/wisp-hiding-lantern.webp",
  "./assets/img/wisp-leading-parade.webp",
  "./assets/img/wisp-sad-intro.webp",
  "./assets/audio/hoot.ogg",
  "./assets/icon.svg",
];

self.addEventListener("install", e => {
  // Best-effort per-file precache. cache.addAll is atomic: one failed asset
  // (say a dropped 250 KB image on park Wi-Fi) rejects the whole install and
  // the player loses offline play entirely. Cache each shell file on its own
  // instead; anything that misses here is picked up by the runtime cache on
  // first use, so a flaky install still yields a working offline player.
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith("lantern-") && k !== CACHE).map(k => caches.delete(k))))
      // Take control of open pages immediately so updates apply without a reload.
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  // Only handle GETs. Caching a POST/PUT response throws in the Cache API and
  // would swallow the error; API writes must always hit the network.
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // Cross-origin requests (map tiles, etc.) are not ours to cache or
  // mediate: let the browser fetch them natively. Intercepting them here
  // once kept tile images from ever painting in some browsers.
  if (url.origin !== self.location.origin) return;

  // Never serve the app shell in place of an asset. A failed script/style
  // fetch must fail loudly, not return HTML (that yields a silent SyntaxError
  // — the same class of bug as an origin catch-all).
  const isAsset = /\.(js|css|webmanifest|png|webp|svg|ogg|mp3)$/.test(url.pathname);

  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        // Only cache successful, same-origin, basic responses.
        if (res && res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      }).catch(err => {
        // Offline. For navigations, fall back to the cached shell.
        if (e.request.mode === "navigate") return caches.match("./index.html");
        // For assets, fail rather than masquerade HTML as JS/CSS.
        if (isAsset) throw err;
        return caches.match("./index.html");
      });
    })
  );
});
