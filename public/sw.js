// Service Worker — handles background push notifications

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try { payload = event.data.json(); }
  catch { payload = { title: "HRT Tracker", body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(payload.title || "HRT Tracker 💊", {
      body:    payload.body   || "Time to check your HRT schedule",
      icon:    payload.icon   || "/icon-192.png",
      badge:   payload.badge  || "/icon-192.png",
      tag:     payload.tag    || "hrt-reminder",
      renotify: true,
      actions: [{ action: "open", title: "Open app" }],
      data: { url: self.registration.scope }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.startsWith(self.registration.scope) && "focus" in client)
          return client.focus();
      }
      return clients.openWindow(self.registration.scope);
    })
  );
});

const CACHE = "hrt-v1";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["/", "/index.html"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => { e.waitUntil(clients.claim()); });
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
