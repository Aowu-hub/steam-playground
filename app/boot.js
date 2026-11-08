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
  function worker() {
    if (W) return W;
    W = new Worker(ROOT + 'app/server.js');
    W.onmessage = function (e) {
      var m = e.data || {};
      if (m.t === 'res') { var w = waiting[m.id]; delete waiting[m.id]; if (w) (m.ok ? w.ok(m.res) : w.no(new Error(m.error))); }
      else if (m.t === 'status') { m.s.update = STATUS.update; STATUS = m.s; try { localStorage.setItem('sp_off_mode', m.s.mode); } catch (er) {} fire(); }
    };
    W.onerror = function (e) { console.error('offline server:', e.message); };
    W.postMessage({ t: 'net', online: navigator.onLine });
    return W;
  }
  function ask(msg) {
    return new Promise(function (ok, no) { var id = ++seq; waiting[id] = { ok: ok, no: no }; msg.id = id; worker().postMessage(msg); });
  }
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
  };
  // 📦 service worker: keeps every file on this device (sw.js)
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register(ROOT + 'sw.js', { scope: ROOT }).catch(function (e) { console.warn('service worker:', e.message); }); });
  }
  worker();   // start the server right away (loads the Sheet while the page parses)
})();
