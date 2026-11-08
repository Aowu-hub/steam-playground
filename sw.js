/* STEAM Playground 📲 offline app — service worker.
   • keeps every file of the app on the device (cache "steam-<version>") → plays without internet
   • updates: files.json lists every file + its hash; a new version downloads ONLY the files whose hash changed
     (the rest is copied from the old cache), then waits as "pending" — the page shows "🆕 New update ready! ⟳".
     It is switched on only when the kid taps ⟳ or the next time the app is opened — never in the middle of a game.
   • ./?page=gameroom&player=… is answered with gameroom.html straight away (no hop through index.html)
   This file rarely changes; the app's own version lives in files.json. */
'use strict';
const SW_REV = 1;
const META = 'steam-meta';
const SCOPE = new URL('./', self.location.href).href;
let STATE = null;   // {current, pending, previous}
async function state() {
  if (STATE) return STATE;
  const c = await caches.open(META); const r = await c.match(SCOPE + '__state');
  STATE = r ? await r.json() : { current: '', pending: '', previous: '' };
  return STATE;
}
async function saveState(s) { STATE = s; const c = await caches.open(META); await c.put(SCOPE + '__state', new Response(JSON.stringify(s), { headers: { 'Content-Type': 'application/json' } })); }
const cacheName = v => 'steam-' + v;
async function listOf(v) { if (!v) return null; const c = await caches.open(cacheName(v)); const r = await c.match(SCOPE + 'files.json'); return r ? r.json() : null; }

// Download version `list` into its own cache, copying unchanged files from `fromVer`.
async function download(list, fromVer, report) {
  const c = await caches.open(cacheName(list.version));
  const old = await listOf(fromVer), oc = fromVer ? await caches.open(cacheName(fromVer)) : null;
  const paths = Object.keys(list.files); let fetched = 0, copied = 0;
  for (let i = 0; i < paths.length; i++) {
    const p = paths[i], url = SCOPE + p;
    if (await c.match(url)) continue;
    if (oc && old && old.files[p] === list.files[p]) { const r = await oc.match(url); if (r) { await c.put(url, r); copied++; continue; } }
    const r = await fetch(url + '?h=' + list.files[p], { cache: 'no-store' });
    if (!r.ok) throw new Error('download ' + p + ' ' + r.status);
    await c.put(url, r); fetched++;
    if (report && i % 10 === 0) report(i, paths.length);
  }
  await c.put(SCOPE + 'files.json', new Response(JSON.stringify(list), { headers: { 'Content-Type': 'application/json' } }));
  return { fetched, copied };
}
async function freshList() { const r = await fetch(SCOPE + 'files.json?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) throw new Error('files.json ' + r.status); return r.json(); }
async function tidy() { const s = await state(); const keep = new Set([META, cacheName(s.current), cacheName(s.pending), cacheName(s.previous)]); for (const k of await caches.keys()) if (k.indexOf('steam-') === 0 && !keep.has(k)) await caches.delete(k); }

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const s = await state();
    if (!s.current) { const list = await freshList(); await download(list, ''); await saveState({ current: list.version, pending: '', previous: '' }); }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => { e.waitUntil((async () => { await tidy(); await self.clients.claim(); })()); });

let CHECKING = null;
async function check(client) {
  const s = await state(); const list = await freshList();
  if (list.version === s.current || list.version === s.pending) return { current: s.current, pending: s.pending, latest: list.version };
  if (s.pending && s.pending !== list.version) await caches.delete(cacheName(s.pending));
  await caches.delete(cacheName(list.version));   // never trust an old cache with the same name
  const r = await download(list, s.current, (i, n) => { if (client) client.postMessage({ t: 'sw-progress', i, n, ver: list.version }); });
  await saveState({ current: s.current, pending: list.version, previous: s.previous });
  return { current: s.current, pending: list.version, latest: list.version, fetched: r.fetched, copied: r.copied };
}
async function apply() {
  const s = await state(); if (!s.pending) return { current: s.current, applied: false };
  const prev = s.current; await saveState({ current: s.pending, pending: '', previous: prev }); await tidy();
  return { current: s.pending, previous: prev, applied: true };
}
self.addEventListener('message', e => {
  const m = e.data || {}, src = e.source;
  const reply = (x) => { if (src) src.postMessage(Object.assign({ t: 'sw-' + m.t, id: m.id }, x)); };
  if (m.t === 'check') { CHECKING = CHECKING || check(src).finally(() => { CHECKING = null; }); e.waitUntil(CHECKING.then(r => reply(r), err => reply({ error: String(err.message || err) }))); }
  else if (m.t === 'apply') e.waitUntil(apply().then(r => reply(r)));
  else if (m.t === 'state') e.waitUntil(state().then(s => reply(Object.assign({ rev: SW_REV }, s))));
});

self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== self.location.origin || req.url.indexOf(SCOPE) !== 0) return;
  let rel = decodeURIComponent(url.pathname.slice(new URL(SCOPE).pathname.length));
  if (rel === 'files.json' || rel === 'sw.js') return;   // always from the network
  e.respondWith((async () => {
    const s = await state();
    const c = s.current ? await caches.open(cacheName(s.current)) : null;
    if (rel === '' || rel === 'index.html') {
      const page = url.searchParams.get('page');
      if (page && page !== 'home' && c) { const list = await listOf(s.current); const f = list && list.routes && list.routes[page]; if (f) rel = f; else rel = 'index.html'; }
      else rel = 'index.html';
    }
    if (c) { const hit = await c.match(SCOPE + rel); if (hit) return hit; }
    try { return await fetch(req); }
    catch (err) {
      if (req.mode === 'navigate' && c) { const home = await c.match(SCOPE + 'index.html'); if (home) return home; }
      return new Response('📴 offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
