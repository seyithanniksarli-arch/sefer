// BL-105 basit service worker: kabuk onbellegi, html/js icin ag-oncelikli.
// Surum degisince CACHE adini artir.
const VERSION = 'v7';
const CACHE = 'bl105-kabuk-' + VERSION;
const KABUK = [
  './', 'index.html', 'yolcu.html',
  'saat.js', 'ekle.js', 'sofor.js', 'izin.js', 'iett.js', 'trafik.js', 'ogren.js', 'sekme.js',
  'sofor-ikon.svg', 'sofor-ikon.png',
  'icon-sofor-192.png', 'icon-sofor-512.png', 'icon-sofor-maskable-192.png', 'icon-sofor-maskable-512.png',
  'icon-yolcu-192.png', 'icon-yolcu-512.png', 'icon-yolcu-maskable-192.png', 'icon-yolcu-maskable-512.png',
  'manifest-sofor.json', 'manifest-yolcu.json'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // Biri eksik/basarisiz olsa da kurulum bozulmasin
      return Promise.all(KABUK.map(function (u) { return c.add(u).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf('bl105-kabuk-') === 0 && k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  // Capraz-origin (Firebase, TomTom, Worker, harita, unpkg...) ASLA ele alinmaz
  if (u.origin !== self.location.origin) return;
  // Ag-oncelikli, ag yoksa onbellek
  e.respondWith(
    fetch(r).then(function (res) {
      if (res && res.ok && res.type === 'basic') {
        var kopya = res.clone();
        caches.open(CACHE).then(function (c) { c.put(r, kopya); }).catch(function () {});
      }
      return res;
    }).catch(function () {
      return caches.match(r, { ignoreSearch: true }).then(function (m) {
        if (m) return m;
        if (r.mode === 'navigate') return caches.match('index.html');
        return Response.error();
      });
    })
  );
});

// Bildirime dokununca uygulamayi ac / one getir (yonetici: yeni telefon kayit istegi)
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) return list[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
