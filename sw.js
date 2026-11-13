// Epic Streaming: permite instalar la página como app.
// No guarda la página en el celular: siempre carga la versión más nueva desde internet. (v3: + avisos al celular)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.map((c) => caches.delete(c)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;   // solo la página; Firebase, imágenes y el servidor van directo
  const ruta = new URL(e.request.url).pathname;
  if (/\.[a-z0-9]+$/i.test(ruta) && !/\.html?$/i.test(ruta)) return;   // archivos (APK, imágenes, json): el navegador los descarga directo
  // Pide la página sin usar la copia guardada del navegador (así nunca llega una versión vieja, sin trucos en la dirección).
  // Si algo falla, cae al modo de antes, y si no hay internet, muestra el aviso.
  e.respondWith(fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })
    .then((r) => (r.redirected ? Response.redirect(r.url, 302) : r))
    .catch(() => fetch(e.request))
    .catch(() => new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center">' +
    '<div><h2>Sin conexión</h2><p>Revisa tu internet y vuelve a abrir Epic Streaming.</p></div></body>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});
// 🔔 v3 · Avisos al celular (regalos, descuentos y promos). Cada aviso trae su «tag»: si llegara dos veces el mismo, el celular lo muestra UNA sola vez.
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = {}; }
  e.waitUntil(self.registration.showNotification(String(d.t || 'Epic Streaming').slice(0, 80), { body: String(d.c || '').slice(0, 240), icon: '/icon-192.png', badge: '/icon-192.png', tag: String(d.g || 'epic').slice(0, 60), renotify: false, data: { url: String(d.u || '/') } }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close(); const destino = new URL((e.notification.data && e.notification.data.url) || '/', self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((L) => { for (const c of L) { if ('focus' in c) { try { c.navigate(destino); } catch (x) { /* nada */ } return c.focus(); } } return self.clients.openWindow(destino); }));
});
