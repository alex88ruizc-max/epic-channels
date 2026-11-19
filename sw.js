// Epic Streaming: permite instalar la página como app.
// No guarda la página en el celular: siempre carga la versión más nueva desde internet. (v4: + logo del producto y corona en los avisos)
const LOGOS = 'epic-logos-v1';   /* v4: única caché que se guarda: logos ya achicados de los avisos (6 h) */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((c) => c !== LOGOS).map((c) => caches.delete(c)))).then(() => self.clients.claim()));
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
/* 🔔 v4 · Imágenes de los avisos (pedido de Alex, 19-nov). El aviso NO trae la imagen (el mensaje del celular tiene límite de ~4 KB):
   trae solo «p» = id del producto. El celular la busca solo, aunque la app esté cerrada:
   · con producto: inventario/<p>.imagenUrl  · sin producto: configuracion/apariencia.logoUrl (logo de Epic)
   Se lee de la base pública de la tienda (la misma que ve cualquier visitante de la página), se achica a 192 px y se guarda 6 h.
   Si algo falla o tarda más de 5 s: el ícono de siempre (/icon-192.png). Icono pequeño = la corona de Epic (blanca sobre transparente). */
const CORONA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAEg0lEQVR4nOydv08UQRTH36HYaMRK7SSamKiJCdpgIZXSaKFYih2NhRUU/gEUJkBl4o+CBqjFwgIstYASSNTESmMDVGopMed3snPG3N3evjc3e2/He5/kZeBud2/nfXfem3nHLgNkqDJAhiomgDImgDImgDImgDImgDImgDImgDImgDImgDImgDImgDImgDImgDImgDKHKWHq9fqEa2u12itKlBolCpx/HM1n/+t5iPCTEiTlELQAO+VtgRIlyRGAq/86mndNL49hFLynxEhOADh/kLLQM9z01hfKQtEBJUSKIWiWWp1P/rVZSoykRgCu/otodmCHcjb5DbuMUfCREiGZEQDnu3NdoXznk39vxW+bBCmFoBnYCGO7Eb9tEiQRgnBFn6Es8R5h7vKLsoT8lSpOKiNgifjOJ7/tEiVA5QXA1T+FZozkjPl9K02hAOjES9gxUgCfexLNPIUz74/Rc5zPnO+KtuOMgBuwLRzsCvWe57AhCmfIH6OneF9tUea7jnAE2IWdg23iwDOwniRufM4tNBPUPRP+WKXjfON8hB83KfPZbtE+HAH2fOtKAHOwtbKHta90LlI8Fv0xS8P7ZI0yHw36l/eK9pMI0GActoMPvEnl0ah0xqLUiqn3hVuhjze9VYoADtehdXzwnC+ORcNXOsuYvUz5Y0fD9d35AD+uU/sLJooAeXHM5QIX7zZwEmcpAl7MMufvS7EuGN/nDcp8kJcXo+aAPK7CtnFC96l78iqdsRimCBVT39dtyvreidJCUDNuneCKYMuwoxSAr3ROU/lM+88S4/rm+khZUZCzNio1BLVjkrLRIFozMCudsQiqmPo+uat+UrBbT0JQMyFrBm6lMxbsimmbub2EQt+xHIQTcNXFkOT1FvYAVcn9DseWVjpjUVgx9XN7F3LGSc4Bjl3YJ+4w/EZhcNYM0kpnLDpWTDvM7bmwfMYVQJIHmsldM3RR6YxFS8WUMbfnwvIZVwBpHmimZc0QodIZi78VU+bcngvLZ9w/TexmBPxLY83wEO0d6q7SGQt3Ds9wTqtoXxBveskhqgD7FA/XwWWqFve8xaSSI6CfYPmMK0C3OaAfiToCTAA5FoKUsRCkDMtn7LluF+WIfoRVhnBIKoKh5Yh+hO0riQCWB/iwfSW5Sc/yAB+2r0yAcjABlClFAMsBfCwHKGMhSBkTQBnLAcqwfSX62s3KESzYZQiH9BYlK0cUI/KRVAALQ8WIfCR9XpAl4mJEPjIB4mMCKFOqAJYDirEcoIyFIGVMAGUsBygj8lGyj638X7An5ypjAihjAihjAihjAigT9PR0fDFzG81j2CXYCepvvsM+wJ7gi5g3JEQ8DYXz3b1dq2S04y5EeC3ZIUQAdxfhKBnt2IQA1yQ7hAjghlwV7m6sIj8ggCgkhwhQJyMXCCDyacgsqPJPo1VE7JsQAbbIyEPsm5AQdIGyR7eU+hTCBHH/w2YUEeiTZKegaihEOI3mEdk6wNFYBzyF88XleitHK2OlCGVMAGVMAGVMAGVMAGVMAGVMAGVMAGX+AAAA//8l8XIYAAAABklEQVQDACYxr9Mg1zdjAAAAAElFTkSuQmCC';
const ICONO = '/icon-192.png';
const BASE = 'https://firestore.googleapis.com/v1/projects/epic-channels/databases/(default)/documents/';
function logoRuta(p) { const id = String(p || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 60); return id ? { doc: 'inventario/' + id, campo: 'imagenUrl' } : { doc: 'configuracion/apariencia', campo: 'logoUrl' }; }
async function achicar(url) {   /* data URL grande → JPEG de 192 px como data URL; si el celular no sabe, devuelve la misma */
  try {
    if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') return url;
    const bm = await createImageBitmap(await (await fetch(url)).blob()), lado = 192, k = Math.min(1, lado / Math.max(bm.width, bm.height));
    const w = Math.max(1, Math.round(bm.width * k)), h = Math.max(1, Math.round(bm.height * k)), cv = new OffscreenCanvas(w, h), cx = cv.getContext('2d');
    cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h); cx.drawImage(bm, 0, 0, w, h);
    const b = new Uint8Array(await (await cv.convertToBlob({ type: 'image/jpeg', quality: 0.85 })).arrayBuffer()); let s = '';
    for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192));
    return 'data:image/jpeg;base64,' + btoa(s);
  } catch (x) { return url; }
}
async function logoDe(p) {
  const r = logoRuta(p), clave = 'https://epic.logo/' + r.doc;
  try { const c = await caches.open(LOGOS), v = await c.match(clave);
    if (v && Date.now() - Number(v.headers.get('x-el') || 0) < 6 * 3600000) { const t = await v.text(); if (t) return t; } } catch (x) { /* sin caché: se busca */ }
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, reloj = setTimeout(() => { try { ctl && ctl.abort(); } catch (x) { /* nada */ } }, 4000);
  let url = '';
  try { const res = await fetch(BASE + r.doc + '?mask.fieldPaths=' + r.campo, ctl ? { signal: ctl.signal } : {});
    if (res.ok) { const j = await res.json(); url = String((j && j.fields && j.fields[r.campo] && j.fields[r.campo].stringValue) || ''); } } catch (x) { url = ''; } finally { clearTimeout(reloj); }
  if (!/^data:image\/|^https:\/\//i.test(url)) return '';
  if (/^data:/i.test(url)) url = await achicar(url);
  try { const c = await caches.open(LOGOS); await c.put(clave, new Response(url, { headers: { 'x-el': String(Date.now()) } })); } catch (x) { /* nada */ }
  return url;
}
function conTope(pr, ms) { return Promise.race([pr, new Promise((ok) => setTimeout(() => ok(''), ms))]); }
// 🔔 Avisos al celular (regalos, descuentos y promos). Cada aviso trae su «tag»: si llegara dos veces el mismo, el celular lo muestra UNA sola vez.
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = {}; }
  const mostrar = (icono) => self.registration.showNotification(String(d.t || 'Epic Streaming').slice(0, 80), { body: String(d.c || '').slice(0, 240), icon: icono || ICONO, badge: CORONA, tag: String(d.g || 'epic').slice(0, 60), renotify: false, data: { url: String(d.u || '/') } });
  e.waitUntil(conTope(logoDe(d.p).catch(() => ''), 5000).then((ic) => mostrar(ic).catch(() => mostrar(ICONO))).catch(() => mostrar(ICONO)));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close(); const destino = new URL((e.notification.data && e.notification.data.url) || '/', self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((L) => { for (const c of L) { if ('focus' in c) { try { c.navigate(destino); } catch (x) { /* nada */ } return c.focus(); } } return self.clients.openWindow(destino); }));
});
