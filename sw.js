/* Kletteratlas – service worker. Lets the installed app start without a connection and keeps map tiles that were viewed.
   The cache "finale-atlas-user" belongs to the favourites store and is never touched here.
   The cache names keep the former working name "finale-atlas": renaming them would orphan what is already stored on people's devices. */
const BUILD = "2026.10.07-a57ff55-wx2";
const SHELL = "finale-atlas-shell-" + BUILD;     // the app files; replaced with every build
const TILES = "finale-atlas-tiles-v1";           // map tiles that were looked at (limited number)
const FONTS = "finale-atlas-fonts-v1";
const KEEP = [SHELL, TILES, FONTS, "finale-atlas-user"];
const CORE = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-192.png", "./icon-maskable-512.png",
  "./apple-touch-icon.png", "./favicon-32.png", "./favicon.svg"];
const TILE_HOSTS = /(^|\.)tile\.opentopomap\.org$|(^|\.)tile\.openstreetmap\.org$|^server\.arcgisonline\.com$/;
const FONT_HOSTS = /^fonts\.(googleapis|gstatic)\.com$/;
const TILE_MAX = 900;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL)
    .then(c => Promise.all(CORE.map(u => fetch(new Request(u, {cache: "reload"})).then(r => (r.ok ? c.put(u, r) : null)).catch(() => null))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.indexOf("finale-atlas-") === 0 && KEEP.indexOf(k) < 0).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// The page itself: answer from the cache at once (works offline, starts fast) and fetch a fresh copy in the background.
async function page(e) {
  const cache = await caches.open(SHELL);
  const hit = await cache.match("./");
  const tag = r => r && (r.headers.get("etag") || r.headers.get("last-modified") || r.headers.get("content-length"));
  const fresh = fetch(new Request("./", {cache: "no-cache"})).then(async r => {
    if (!r || !r.ok) return null;
    await cache.put("./", r.clone());
    if (hit && tag(hit) && tag(r) && tag(hit) !== tag(r)) (await self.clients.matchAll()).forEach(c => c.postMessage({type: "UPDATED"}));
    return r;
  }).catch(() => null);
  if (hit) { e.waitUntil(fresh); return hit; }
  return (await fresh) || new Response("Offline – open the page once with a connection.", {status: 503, headers: {"Content-Type": "text/plain; charset=utf-8"}});
}
// Other files of the app: cache first, then network.
async function asset(req) {
  const cache = await caches.open(SHELL);
  const hit = await cache.match(req, {ignoreSearch: true});
  if (hit) return hit;
  const r = await fetch(req);
  if (r.ok) cache.put(req, r.clone());
  return r;
}
// Map tiles: a readable (CORS) copy is stored, so it does not weigh on the storage quota like an opaque answer would.
let trimming = false;
async function trim(cache) {
  if (trimming) return; trimming = true;
  try { const keys = await cache.keys(); if (keys.length > TILE_MAX) for (const k of keys.slice(0, keys.length - TILE_MAX + 60)) await cache.delete(k); }
  catch (err) { /* ignore */ } finally { trimming = false; }
}
async function tile(req) {
  const cache = await caches.open(TILES);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  try {
    const r = await fetch(req.url, {mode: "cors", credentials: "omit"});
    if (r.ok) cache.put(req.url, r.clone()).then(() => trim(cache)).catch(() => {});
    return r;
  } catch (err) { return fetch(req); }             // server without CORS headers: pass through, nothing stored
}
async function font(req) {
  const cache = await caches.open(FONTS);
  const hit = await cache.match(req.url);
  const net = fetch(req.url, {mode: "cors", credentials: "omit"}).then(r => { if (r.ok) cache.put(req.url, r.clone()); return r; }).catch(() => null);
  return hit || (await net) || fetch(req);
}
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (url.pathname.indexOf(new URL("./", self.location).pathname) !== 0) return;      // outside the app's folder
    const isPage = req.mode === "navigate" || /\/(index\.html)?$/.test(url.pathname);
    e.respondWith(isPage ? page(e) : asset(req));
  } else if (TILE_HOSTS.test(url.hostname)) e.respondWith(tile(req));
  else if (FONT_HOSTS.test(url.hostname)) e.respondWith(font(req));
});
