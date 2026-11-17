/* STEAM Playground 📲 offline app — page boot (first script on every built page).
   • __SP(k): the values Apps Script's doGet puts into a page (player, sessionStart, durationMin, game, mode, page, webAppUrl)
   • index.html is also the router: ?page=gameroom → gameroom.html (same query), so every WEBAPP_URL + '?page=…' link works
   • google.script.run → the on-device server (app/server.js, a Web Worker running the real Code.gs)
   • window.OfflineApp: status (offline / syncing / waiting results / update ready) for badges + the Welcome Show */
(function () {
  'use strict';
  var B = window.SP_BUILD || {};               // {ver, page, routes, files} — written by build.js just before this script
  var Q = new URLSearchParams(location.search);
  var ROOT = new URL('./', location.href).href;
  if (B.page === 'home') {
    var want = Q.get('page');
    if (want && want !== 'home' && B.routes && B.routes[want]) { location.replace(ROOT + B.routes[want] + location.search + location.hash); return; }
  }
  window.__SP = function (k) {
    if (k === 'webAppUrl') return ROOT;
    if (k === 'page') return B.page || 'home';
    return Q.get(k) || '';
  };
  // 🧪 guest copy flag for the Welcome Show (robo-buddies) — remembered from the last status
  try { if (localStorage.getItem('sp_off_mode') !== 'family') window.SP_GUEST = true; } catch (e) { window.SP_GUEST = true; }

  /* ---------- the on-device server ---------- */
  var W = null, seq = 0, waiting = {}, STATUS = { mode: 'guest', pending: 0, syncing: false, online: navigator.onLine, update: null, ver: '' };
  var listeners = [];
  // 🔧 24w (Aowu 2026-11-17 20:07 "it held me on this page everything I open the first time on iPhone"): the page waited for ever when the
  // on-device server never got its database open (iPhone / WebKit can hang an IndexedDB open on a first load, or while the page before still
  // holds it). Now: the server says 'db' (database open) and 'ready' (Sheet loaded); no 'db' after 6 s → a fresh server, the unanswered
  // calls asked again (nothing ran yet); 3 tries → a "🔁 Open again" card (never an endless loader). A page put away idle lets go of its server.
  var LIFE = { starts: 0, db: false, ready: false, restarts: 0, card: false, t: 0, why: [] };
  function arm() {
    clearTimeout(LIFE.t);
    LIFE.t = setTimeout(function () {
      if (LIFE.ready) return;
      if (!LIFE.db) return restart('no database after ' + (LIFE.starts === 1 ? 6 : 8) + ' s');
      LIFE.t = setTimeout(function () { if (!LIFE.ready) restart('Sheet not loaded after 45 s'); }, 39000);   // a big family Sheet on an old iPad can take a while
    }, LIFE.starts === 1 ? 6000 : 8000);
  }
  function restart(why) {
    LIFE.why.push(why); console.warn('offline server:', why);
    try { if (W) W.terminate(); } catch (e) {}
    W = null; clearTimeout(LIFE.t);
    if (LIFE.ready) {   // it had loaded: its calls may have run → answer them with an error instead of asking twice
      Object.keys(waiting).forEach(function (id) { var w = waiting[id]; delete waiting[id]; w.no(new Error('📲 The app hiccupped — try that again.')); });
    }
    if (LIFE.restarts >= 2) { stuckCard(); return; }
    LIFE.restarts++; worker();
  }
  function stuckCard() {
    if (LIFE.card || !document.body) { if (!document.body) document.addEventListener('DOMContentLoaded', stuckCard); return; }
    LIFE.card = true;
    var el = document.createElement('div'); el.className = 'sp-off-stuck'; el.setAttribute('role', 'alert');
    el.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(10,8,20,.72);font:600 17px/1.35 system-ui,-apple-system,sans-serif;color:#fff;padding:20px';
    el.innerHTML = '<div style="max-width:340px;width:100%;background:#1d1636;border:2px solid #7c5cff;border-radius:18px;padding:22px 18px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.5)">'
      + '<div style="font-size:44px;line-height:1">📲</div><div style="margin:10px 0 4px;font-size:19px">The app got stuck opening</div>'
      + '<div style="font-weight:500;opacity:.8;font-size:15px">Your games and stars are safe.</div>'
      + '<button type="button" style="margin-top:16px;min-height:48px;width:100%;border:0;border-radius:14px;background:#7c5cff;color:#fff;font:700 18px system-ui,-apple-system,sans-serif">🔁 Open again</button></div>';
    el.querySelector('button').onclick = function () { location.reload(); };
    document.body.appendChild(el);
  }
  function worker() {
    if (W) return W;
    LIFE.starts++; LIFE.db = false; LIFE.ready = false;
    var me = W = new Worker(ROOT + 'app/server.js');
    W.onmessage = function (e) {
      if (W !== me) return;
      var m = e.data || {};
      if (m.t === 'res') { var w = waiting[m.id]; delete waiting[m.id]; if (w) (m.ok ? w.ok(m.res) : w.no(new Error(m.error))); }
      else if (m.t === 'db') LIFE.db = true;
      else if (m.t === 'ready') { LIFE.db = LIFE.ready = true; clearTimeout(LIFE.t); }
      else if (m.t === 'status') { m.s.update = STATUS.update; STATUS = m.s; if (LIFE.ready) { try { localStorage.setItem('sp_off_mode', m.s.mode); } catch (er) {} } fire(); }
    };
    W.onerror = function (e) { console.error('offline server:', e.message); if (W === me && !LIFE.ready) restart('server error: ' + e.message); };
    W.postMessage({ t: 'net', online: navigator.onLine });
    Object.keys(waiting).forEach(function (id) { me.postMessage(waiting[id].msg); });   // a fresh server: ask again what nobody answered
    arm();
    return W;
  }
  function ask(msg) {
    return new Promise(function (ok, no) { var id = ++seq; msg.id = id; waiting[id] = { ok: ok, no: no, msg: msg }; worker().postMessage(msg); });
  }
  // 🍎 a page put away (iPhone page memory) keeps its server — and the database — busy: let go of it when nothing is waiting
  window.addEventListener('pagehide', function () {
    if (!W || Object.keys(waiting).length) return;
    try { W.terminate(); } catch (e) {} W = null; clearTimeout(LIFE.t);
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted && !W) { LIFE.restarts = 0; worker(); } });
  function fire() { listeners.slice().forEach(function (f) { try { f(STATUS); } catch (e) {} }); try { window.dispatchEvent(new CustomEvent('sp-offline', { detail: STATUS })); } catch (e) {} }
  function runner(s, f, u) {
    return new Proxy({}, { get: function (t, k) {
      if (k === 'withSuccessHandler') return function (fn) { return runner(fn, f, u); };
      if (k === 'withFailureHandler') return function (fn) { return runner(s, fn, u); };
      if (k === 'withUserObject') return function (o) { return runner(s, f, o); };
      return function () {
        var args; try { args = JSON.parse(JSON.stringify([].slice.call(arguments))); } catch (e) { args = []; }
        ask({ t: 'call', fn: String(k), args: args }).then(function (r) { if (s) s(r, u); }, function (err) { if (f) f(err, u); else console.error(err.message); });
      };
    } });
  }
  window.google = window.google || {};
  window.google.script = window.google.script || {};
  Object.defineProperty(window.google.script, 'run', { configurable: true, get: function () { return runner(null, null, null); } });
  window.google.script.host = { close: function () {}, setHeight: function () {}, setWidth: function () {}, origin: location.origin };
  window.addEventListener('online', function () { STATUS.online = true; fire(); if (W) W.postMessage({ t: 'net', online: true }); });
  window.addEventListener('offline', function () { STATUS.online = false; fire(); if (W) W.postMessage({ t: 'net', online: false }); });

  window.OfflineApp = {
    build: B, root: ROOT,
    status: function () { return STATUS; },
    on: function (fn) { listeners.push(fn); try { fn(STATUS); } catch (e) {} return function () { listeners = listeners.filter(function (x) { return x !== fn; }); }; },
    sync: function () { return ask({ t: 'sync' }); },
    link: function (key) { return ask({ t: 'link', key: key }); },
    unlink: function () { return ask({ t: 'unlink' }); },
    debug: function () { return ask({ t: 'debug' }); },
    rows: function (tab) { return ask({ t: 'rows', tab: tab }); },
    _setUpdate: function (u) { STATUS.update = u; fire(); },
    life: function () { return { starts: LIFE.starts, db: LIFE.db, ready: LIFE.ready, restarts: LIFE.restarts, card: LIFE.card, why: LIFE.why.slice(), live: !!W, waiting: Object.keys(waiting).length }; },   // 🔧 24w (tests + device checks)
  };
  // 📦 service worker: keeps every file on this device (sw.js)
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register(ROOT + 'sw.js', { scope: ROOT }).catch(function (e) { console.warn('service worker:', e.message); }); });
  }
  worker();   // start the server right away (loads the Sheet while the page parses)
})();
