// Service worker E-LAB: menyimpan "cangkang" aplikasi (ikon, halaman pembuka) supaya cepat terbuka.
// Data tetap selalu diambil langsung dari Google (tidak disimpan di sini).
var CACHE = 'e-lab-v3';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
             'maskable-512.png', 'apple-touch-icon.png', 'favicon.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(FILES); }).then(function() { return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
  }).then(function() { return self.clients.claim(); }));
});
// Halaman sendiri: coba internet dulu (versi terbaru), kalau gagal pakai simpanan.
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(function(r) {
      var copy = r.clone();
      caches.open(CACHE).then(function(c) { c.put(e.request, copy); });
      return r;
    }).catch(function() {
      return caches.match(e.request).then(function(m) { return m || caches.match('index.html'); });
    })
  );
});
