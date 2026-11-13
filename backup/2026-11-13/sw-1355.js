// Epic Streaming: permite instalar la página como app.
// No guarda la página en el celular: siempre carga la versión más nueva desde internet. (v2)
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
