
/* 📏 GameParts — a game's big extra parts in their own files, loaded when the kid opens that part (S4, 📏 Split chat, 2026-11-19 — File Split plan §S4).
   The same loader as 🔬 SciLab (s2), shared by every split game: each game page writes include('<Game>Parts') after its main script
   (= this loader, built by Test Harness/parts/build_parts.py from parts/src/GameParts.js — edit that, never the built files).
     GameParts.need('MathQuest_tests', cb)  → loads that part file once (site → jsDelivr backup, integrity checked), then cb(ok); also a Promise(ok)
     GameParts.has(name) · GameParts.files() (loaded) · GameParts.version
     GameParts.sources({…})        ← written by Code.gs include('<Game>Parts') online (INCLUDE_LAZY_), never by a page
     GameParts.loaded(name, round) · GameParts.css(name, text)   ← called by the part files themselves
   📲 offline app + tests: every part is inline (Code.gs INCLUDE_ALSO_ <Game>Parts) → need() answers at once.
   A page holds ONE copy (a 2nd copy does nothing — the first one keeps every source and loaded part). */
(function(){
  if(window.GameParts) return;
  const HAVE = {}, SRC = {}, WAIT = {}, CSS = {}, WARNED = {};
  function warnOnce(id, msg){ if(WARNED[id]) return; WARNED[id] = 1; try { console.warn('📏 GameParts: ' + msg); } catch(e){} }
  function loaded(name, round){ HAVE[name] = round || true; const w = WAIT[name]; delete WAIT[name]; if(w) w.forEach(f => f(true)); }
  function sources(map){ Object.keys(map || {}).forEach(k => { SRC[k] = map[k]; }); return Object.assign({}, SRC); }
  function has(name){ return !!HAVE[name]; }
  // a part's CSS goes right after the page's own style element with id "gp-css" when the page has one, else at the end of <head>
  let lastCss = null;
  function css(name, text){ if(CSS[name]) return; CSS[name] = 1;
    const st = document.createElement('style'); st.id = 'gp-css-' + name; st.textContent = text;
    const at = lastCss || document.getElementById('gp-css');
    if(at && at.parentNode) at.parentNode.insertBefore(st, at.nextSibling); else (document.head || document.documentElement).appendChild(st);
    lastCss = st; }
  function loadOne(name, done){
    if(HAVE[name]) return done(true);
    if(WAIT[name]) return WAIT[name].push(done);
    const s = SRC[name];
    if(!s){ warnOnce('src:' + name, 'the part "' + name + '" has no source here — add it to Code.gs INCLUDE_ALSO_ / INCLUDE_LAZY_ (<Game>Parts)'); return done(false); }
    WAIT[name] = [done];
    const fail = () => { const w = WAIT[name] || []; delete WAIT[name]; warnOnce('fail:' + name, name + ' did not load (site + backup copy)'); w.forEach(f => f(false)); };
    const tag = (url, next) => { if(!url) return next(); const el = document.createElement('script'); el.charset = 'utf-8'; el.async = false;
      if(s.integrity){ el.integrity = s.integrity; el.crossOrigin = 'anonymous'; }
      el.onload = () => { if(!HAVE[name]) next(); }; el.onerror = () => { if(el.parentNode) el.parentNode.removeChild(el); next(); };
      el.src = url; (document.head || document.documentElement).appendChild(el); };
    tag(s.src, () => tag(s.alt, fail));
  }
  function need(names, cb){
    const list = [].concat(names == null ? [] : names).map(String).filter((n, i, a) => n && a.indexOf(n) === i);
    return new Promise(res => { let left = list.length, ok = true; const fin = () => { if(typeof cb === 'function') cb(ok); res(ok); };
      if(!left) return fin(); list.forEach(n => loadOne(n, r => { ok = ok && r; if(--left === 0) fin(); })); });
  }
  window.GameParts = {need, sources, has, loaded, css, files: () => Object.assign({}, HAVE), version: 's4a'};
})();
