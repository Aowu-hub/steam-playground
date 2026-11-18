
/* 📏 SciLab — 🔬 Sciencetory's labs, ONE file per lab (S2, 📏 Split chat, 2026-11-18 — File Split plan §S2).
   Sciencetory.html = the hub (cover · setup · ⚙️ Mechanic · the SC-3 lab engine · shared helpers · every lab's level cards).
   Each moved lab = SciLab_<lab>.html (its games + its own CSS), BUILT by Test Harness/scilab/build_scilab.py from
   Test Harness/scilab/labs/<lab>.js + <lab>.css — edit those, never the built files.
     SciLab.need('cosmic', cb)  → loads that lab file once (site → jsDelivr backup, integrity checked), then cb(ok); also a Promise(ok)
     SciLab.has(name) · SciLab.files() (loaded) · SciLab.FILES (all) · SciLab.version
     SciLab.sources({…})        ← written by Code.gs include('SciLab') online (INCLUDE_LAZY_), never by a page
     SciLab.loaded(name, round) · SciLab.css(name, text)   ← called by the lab files themselves
   📲 offline app + tests: every lab file is inline (Code.gs INCLUDE_ALSO_ SciLab) → need() answers at once. */
(function(){
  if(window.SciLab) return;
  const FILES = ['cosmic'];
  const HAVE = {}, SRC = {}, WAIT = {}, CSS = {}, WARNED = {};
  function warnOnce(id, msg){ if(WARNED[id]) return; WARNED[id] = 1; try { console.warn('🔬 SciLab: ' + msg); } catch(e){} }
  function loaded(name, round){ HAVE[name] = round || true; const w = WAIT[name]; delete WAIT[name]; if(w) w.forEach(f => f(true)); }
  function sources(map){ Object.keys(map || {}).forEach(k => { SRC[k] = map[k]; }); return Object.assign({}, SRC); }
  function has(name){ return !!HAVE[name]; }
  // a lab's CSS goes right after the hub's own <style id="sci-css"> (same place in the cascade as before the split)
  let lastCss = null;
  function css(name, text){ if(CSS[name]) return; CSS[name] = 1;
    const st = document.createElement('style'); st.id = 'scilab-css-' + name; st.textContent = text;
    const at = lastCss || document.getElementById('sci-css');
    if(at && at.parentNode) at.parentNode.insertBefore(st, at.nextSibling); else (document.head || document.documentElement).appendChild(st);
    lastCss = st; }
  function loadOne(name, done){
    if(HAVE[name]) return done(true);
    if(WAIT[name]) return WAIT[name].push(done);
    const s = SRC[name];
    if(!s){ warnOnce('src:' + name, FILES.indexOf(name) < 0 ? 'no lab file "' + name + '" (files: ' + FILES.join(', ') + ')'
      : 'the lab file "' + name + '" has no source here — add SciLab_' + name + ' to Code.gs INCLUDE_ALSO_ / INCLUDE_LAZY_ (SciLab)'); return done(false); }
    WAIT[name] = [done];
    const fail = () => { const w = WAIT[name] || []; delete WAIT[name]; warnOnce('fail:' + name, 'SciLab_' + name + ' did not load (site + backup copy)'); w.forEach(f => f(false)); };
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
  window.SciLab = {need, sources, has, loaded, css, files: () => Object.assign({}, HAVE), FILES: FILES.slice(), version: 's2a'};
})();
