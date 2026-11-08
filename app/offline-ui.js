/* STEAM Playground 📲 offline app — what the kids and grown-ups see of it (loaded deferred on every built page).
   • a small status chip: 📴 Playing from this iPad · 🔄 Syncing N results… · ⚠️ N results waiting to sync · 🧪 Guest copy · 🆕 Update ready ⟳
     (hidden while a game is being played; shown on top of the 🚀 Welcome Show)
   • 🔑 family key card (grown-up, once per device) · 📲 install guide (Dashboard, until the app is on the home screen)
   • 🆕 "New update ready! ⟳" card on the Dashboard / Gameroom / Archive / Collection — never in a game, never reloads by itself
   • ⚙️ grown-up pages (Setup) = online app only → a friendly card */
(function () {
  'use strict';
  var A = window.OfflineApp; if (!A) return;
  var PAGE = (A.build && A.build.page) || 'home';
  var SHELL = { home: 1, gameroom: 1, achievements: 1, collection: 1 };
  var KIND = /iPad|Macintosh.*Mobile/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 'iPad' : /iPhone/.test(navigator.userAgent) ? 'iPhone' : /Android/.test(navigator.userAgent) ? 'phone' : 'computer';
  var STANDALONE = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  var css = document.createElement('style');
  css.textContent = [
    '.off-chip{position:fixed;right:calc(10px + env(safe-area-inset-right));bottom:var(--safe-b,18px);z-index:950;display:none;align-items:center;gap:6px;max-width:min(70vw,320px);',
    'padding:7px 12px;border-radius:999px;border:0;font:700 12.5px/1.2 Nunito,"Segoe UI",system-ui,sans-serif;color:#fff;background:rgba(40,52,70,.86);box-shadow:0 3px 10px rgba(0,0,0,.22);cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.off-chip.on{display:inline-flex}.off-chip.warn{background:#E0602B}.off-chip.sync{background:#2C8FDE}.off-chip.guest{background:#7B5BD6}.off-chip.upd{background:#1E9E62}',
    '.off-chip.show{z-index:2147483000;bottom:auto;top:calc(12px + env(safe-area-inset-top));right:50%;transform:translateX(50%);font-size:14px}',
    '.off-chip .spin{display:inline-block;animation:offspin 1s linear infinite}@keyframes offspin{to{transform:rotate(360deg)}}',
    '.off-ov{position:fixed;inset:0;z-index:7100;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,14,40,.55);overflow:auto}',
    '.off-card{width:min(440px,100%);max-height:calc(100% - 24px);overflow:auto;background:#fff;color:#2f3b40;border-radius:22px;padding:20px 20px 16px;box-shadow:0 18px 50px rgba(0,0,0,.35);font:500 15px/1.45 Nunito,"Segoe UI",system-ui,sans-serif;margin:auto}',
    '.off-card h3{margin:0 0 6px;font:700 21px/1.2 Fredoka,Nunito,sans-serif;color:#22313a}.off-card p{margin:6px 0}.off-card small{color:#5b6b70}',
    '.off-card ol{margin:8px 0;padding-left:22px}.off-card li{margin:5px 0}',
    '.off-card input{width:100%;box-sizing:border-box;margin:8px 0;padding:12px 14px;border-radius:14px;border:2px solid #d6dde0;font:600 17px Nunito,sans-serif;color:#22313a;background:#fff}',
    '.off-btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.off-btns button,.off-btns a{flex:1 1 140px;min-height:46px;border:0;border-radius:14px;font:700 15px Fredoka,Nunito,sans-serif;cursor:pointer;background:#2CA6DE;color:#fff;text-decoration:none;display:flex;align-items:center;justify-content:center;padding:8px 12px}',
    '.off-btns .ghost{background:#eef2f4;color:#37474f}.off-btns .warnb{background:#fbe3dc;color:#a8401c}',
    '.off-msg{min-height:1.4em;font-weight:700}.off-msg.err{color:#c0392b}.off-msg.good{color:#1e8e5a}',
    '.off-upd{position:fixed;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top));z-index:7050;display:flex;align-items:center;gap:10px;padding:10px 12px 10px 16px;border-radius:18px;background:#1E9E62;color:#fff;font:700 15px Fredoka,Nunito,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:calc(100vw - 24px)}',
    '.off-upd button{border:0;border-radius:12px;min-height:40px;padding:6px 14px;font:700 15px Fredoka,Nunito,sans-serif;cursor:pointer;background:#fff;color:#1E9E62}.off-upd .x{background:transparent;color:#fff;padding:6px 8px}',
    '.off-install{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--safe-b,18px) + 50px);z-index:940;width:min(520px,calc(100vw - 24px));display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:18px;background:#fff;color:#2f3b40;box-shadow:0 8px 26px rgba(0,0,0,.22);font:600 14px/1.3 Nunito,sans-serif}',
    '.off-install .ic{font-size:26px}.off-install .tx{flex:1;min-width:0}.off-install button{border:0;border-radius:12px;min-height:40px;padding:6px 12px;font:700 14px Fredoka,Nunito,sans-serif;cursor:pointer;background:#2CA6DE;color:#fff}.off-install .x{background:#eef2f4;color:#37474f}',
    '#off-online-only .off-card{text-align:center}#off-online-only .big{font-size:56px;line-height:1}',
  ].join('\n');
  document.head.appendChild(css);
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function ago(ms) { if (!ms) return 'never'; var m = Math.round((Date.now() - ms) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : Math.round(m / 1440) + ' days ago'; }

  /* ---------- status chip ---------- */
  var chip = document.createElement('button'); chip.className = 'off-chip'; chip.type = 'button'; chip.id = 'off-chip';
  document.body.appendChild(chip);
  var S = A.status();
  function playing() { return !!document.querySelector('#scr-play:not(.hidden), #scr-game:not(.hidden), #room:not(.hidden), .playing-now'); }
  function showOn() { var w = document.getElementById('welcome-loading'); if (!w || w.classList.contains('hidden')) return false; var cs = getComputedStyle(w); return cs.display !== 'none' && cs.visibility !== 'hidden'; }
  function chipState() {
    var n = S.pending || 0;
    if (S.update && S.update.ready && SHELL[PAGE]) return ['upd', '🆕 Update ready ⟳'];
    if (S.keyBad) return ['warn', '🔑 New family key needed'];
    if (S.mode !== 'family') return ['guest', '🧪 Guest copy'];
    if (S.syncing) return ['sync', '<span class="spin">🔄</span> Syncing' + (n ? ' ' + n + ' result' + (n === 1 ? '' : 's') : '') + '…'];
    if (!S.linked || !S.lastPull) return ['warn', '📶 Connect once to bring the family in'];
    if (!S.online) return [n >= 12 ? 'warn' : '', n ? (n >= 12 ? '⚠️ ' : '📴 ') + n + ' result' + (n === 1 ? '' : 's') + ' waiting to sync' : '📴 Playing from this ' + KIND];
    if (n) return [n >= 12 ? 'warn' : 'sync', (n >= 12 ? '⚠️ ' : '⏳ ') + n + ' result' + (n === 1 ? '' : 's') + ' waiting to sync'];
    if (S.error && S.error !== 'key') return ['warn', '⚠️ Sync problem — tap'];
    return null;
  }
  A.badgeText = function () { var c = chipState(); return c ? c[1].replace(/<[^>]+>/g, '') : ''; };   // for the 🚀 Welcome Show
  // while the 🚀 Welcome Show plays: its own badge bar (UiKit ws-4 UI.appStatus) shows 📴 / 🔄 / 🆕 on top of the show;
  // after it, the bar is cleared (it would sit over page headers and game HUDs) and this small chip takes over
  var barOn = false;
  function appBar(show) {
    if (!window.UI || typeof UI.appStatus !== 'function') return false;
    if (show) { UI.appStatus({ offline: !S.online && S.mode === 'family', device: KIND, sync: S.syncing ? (S.pending || 1) : 0, update: !!(S.update && S.update.ready), onUpdate: applyUpdate }); barOn = true; }
    else if (barOn) { UI.appStatus({ offline: false, sync: 0, update: false }); barOn = false; }
    return true;
  }
  function paint() {
    var c = chipState(), show = showOn(), bar = appBar(show);
    chip.className = 'off-chip' + (c ? ' on ' + c[0] : '') + (show ? ' show' : '');
    if (show && bar && c && /^(upd|sync|)$/.test(c[0]) && !/waiting/.test(c[1])) chip.classList.remove('on');   // the show's bar already says it
    if (c) chip.innerHTML = c[1];
    chip.title = S.mode === 'family' ? 'Last sync ' + ago(S.lastPull) + ' · app ' + (S.ver || '') : 'Guest copy · app ' + (S.ver || '');
    if (c && !show && playing()) chip.classList.remove('on');
  }
  A.on(function (s) { S = s; paint(); });
  setInterval(paint, 900);
  chip.addEventListener('click', function () {
    if (S.update && S.update.ready && SHELL[PAGE]) return applyUpdate();
    if (S.mode !== 'family' || S.keyBad) return keyCard();
    statusCard();
  });

  /* ---------- 🔑 family key ---------- */
  function overlay(id, html) {
    var o = document.getElementById(id); if (o) o.remove();
    o = document.createElement('div'); o.className = 'off-ov'; o.id = id; o.innerHTML = '<div class="off-card" role="dialog">' + html + '</div>';
    o.addEventListener('click', function (e) { if (e.target === o && id !== 'off-online-only') o.remove(); });
    document.body.appendChild(o); return o;
  }
  function keyCard() {
    var fam = S.mode === 'family';
    var o = overlay('off-key-card', '<h3>🔑 Family key</h3>' +
      (fam && !S.keyBad ? '<p>This ' + KIND + ' is linked to the family. 🎉</p>' : S.keyBad ? '<p>The family key was changed. A grown-up types the new one.</p>' :
        '<p>This is the 🧪 <b>guest copy</b>: the games play, but the family’s players and results are not here and nothing is saved to the family Sheet.</p><p><small>A grown-up types the family key once — it links this ' + KIND + ' to the family. Needs the internet the first time.</small></p>') +
      (fam && !S.keyBad ? '' : '<input id="off-key-in" type="password" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="family key (3 or more words)">') +
      '<div class="off-msg" id="off-key-msg"></div><div class="off-btns">' +
      (fam && !S.keyBad ? '<button class="warnb" id="off-forget">Unlink this ' + KIND + '</button>' : '<button id="off-key-go">🔗 Link to the family</button>') +
      '<button class="ghost" id="off-key-x">Close</button></div>');
    var go = o.querySelector('#off-key-go'), msg = o.querySelector('#off-key-msg'), inp = o.querySelector('#off-key-in');
    o.querySelector('#off-key-x').onclick = function () { o.remove(); };
    if (inp) { setTimeout(function () { inp.focus(); }, 50); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go.click(); }); }
    if (go) go.onclick = function () {
      var k = inp.value; if (!k.trim()) { msg.className = 'off-msg err'; msg.textContent = 'Type the family key first.'; return; }
      go.disabled = true; msg.className = 'off-msg'; msg.innerHTML = '<span class="spin">🔑</span> Checking the key…';
      A.link(k).then(function (r) {
        if (r.pulled) { msg.className = 'off-msg good'; msg.textContent = '✅ Linked! Bringing the family in…'; setTimeout(function () { location.href = A.root; }, 900); }
        else { msg.className = 'off-msg'; msg.textContent = '✅ The key is right. ' + (navigator.onLine ? 'The family Sheet did not answer (' + (r.error || '?') + ') — it will try again by itself.' : 'Connect to the internet once to bring the family in.'); go.disabled = false; }
      }, function (e) { msg.className = 'off-msg err'; msg.textContent = e.message; go.disabled = false; });
    };
    var fg = o.querySelector('#off-forget');
    if (fg) fg.onclick = function () {
      if ((S.pending || 0) > 0 && !fg.dataset.sure) { fg.dataset.sure = 1; fg.textContent = '⚠️ ' + S.pending + ' results are not synced — tap again'; return; }
      A.unlink().then(function () { location.href = A.root; });
    };
  }
  A.keyCard = keyCard;
  function statusCard() {
    var o = overlay('off-status-card', '<h3>📲 STEAM Playground app</h3>' +
      '<p>' + (S.online ? '🌐 Online' : '📴 Offline — playing from this ' + KIND) + '</p>' +
      '<p>' + (S.pending ? '⏳ ' + S.pending + ' result' + (S.pending === 1 ? '' : 's') + ' waiting to sync' : '✅ Everything is synced') + '<br><small>Last sync ' + ago(S.lastPull) + ' · app ' + esc(S.ver) + '</small></p>' +
      (S.error && S.error !== 'key' ? '<p class="off-msg err">' + esc(S.error) + '</p>' : '') +
      '<div class="off-msg" id="off-st-msg"></div><div class="off-btns"><button id="off-st-sync">🔄 Sync now</button><button class="ghost" id="off-st-key">🔑 Family key</button><button class="ghost" id="off-st-x">Close</button></div>');
    o.querySelector('#off-st-x').onclick = function () { o.remove(); };
    o.querySelector('#off-st-key').onclick = function () { o.remove(); keyCard(); };
    o.querySelector('#off-st-sync').onclick = function () { var m = o.querySelector('#off-st-msg'); m.textContent = navigator.onLine ? '🔄 Syncing…' : '📴 No internet right now — results stay safe on this ' + KIND + '.'; if (navigator.onLine) A.sync().then(function (ok) { m.className = 'off-msg ' + (ok ? 'good' : 'err'); m.textContent = ok ? '✅ Synced!' : '⚠️ ' + (A.status().error || 'Could not sync'); }); };
  }

  /* ---------- ⚙️ grown-up pages: online app only ---------- */
  if (PAGE === 'setup') {
    var hold = setInterval(function () { if (document.getElementById('off-online-only')) return; build(); }, 400);
    var build = function () {
      var o = overlay('off-online-only', '<div class="big">⚙️</div><h3>Grown-up settings are in the online app</h3>' +
        '<p>Players, PINs, screen time and the family key are changed in the online STEAM Playground (so every device gets the same settings).</p>' +
        '<div class="off-btns"><a id="off-open-online" class="ghost" target="_blank" rel="noopener" style="display:none">🌐 Open the online app</a><button id="off-back">◀ Back</button></div>');
      o.querySelector('#off-back').onclick = function () { location.href = A.root; };
      A.debug().then(function (d) { var u = d && d.meta && d.meta.execUrl; if (u && /^https:\/\/script\.google\.com\//.test(u)) { var a = o.querySelector('#off-open-online'); a.href = u + '?page=setup'; a.style.display = ''; } }).catch(function () { });
    };
    build(); setTimeout(function () { clearInterval(hold); }, 6000);
  }
  if (PAGE === 'poseparty') {
    var note = function () { var n = document.getElementById('off-pose-note'); if (navigator.onLine) { if (n) n.remove(); return; } if (n) return; n = document.createElement('div'); n.id = 'off-pose-note'; n.className = 'off-install'; n.style.bottom = 'auto'; n.style.top = 'calc(10px + env(safe-area-inset-top))'; n.innerHTML = '<span class="ic">📷</span><span class="tx">Pose Party needs the internet — its camera page lives online.</span>'; document.body.appendChild(n); };
    note(); window.addEventListener('online', note); window.addEventListener('offline', note);
  }

  /* ---------- 📲 install guide (Dashboard, until the app is on the home screen) ---------- */
  function installGuide(force) {
    var o = overlay('off-install-card', '<h3>📲 Put STEAM Playground on this ' + KIND + '</h3>' +
      (KIND === 'iPad' || KIND === 'iPhone'
        ? '<ol><li>Open this page in <b>Safari</b>.</li><li>Tap <b>Share</b> <span aria-hidden="true">⬆️</span> (top right on iPad, bottom on iPhone).</li><li>Tap <b>Add to Home Screen</b> → <b>Add</b>.</li><li>Open <b>STEAM Playground</b> 🎮 from the home screen once <b>with internet</b> (it stores every game, ~8 MB).</li><li>A grown-up types the <b>family key</b> (🧪 chip → 🔑).</li></ol>'
        : '<ol><li>In Chrome / Edge tap <b>Install app</b> (the ⊕ icon in the address bar, or menu → <b>Install STEAM Playground</b>).</li><li>Open it once <b>with internet</b> (it stores every game, ~8 MB).</li><li>A grown-up types the <b>family key</b> (🧪 chip → 🔑).</li></ol>') +
      '<p><small>After that it plays without internet and syncs results to the family Sheet whenever it is online.</small></p>' +
      '<div class="off-btns">' + (deferredInstall ? '<button id="off-inst-go">⊕ Install now</button>' : '') + '<button class="ghost" id="off-inst-key">🔑 Family key</button><button class="ghost" id="off-inst-x">Close</button></div>');
    o.querySelector('#off-inst-x').onclick = function () { o.remove(); };
    o.querySelector('#off-inst-key').onclick = function () { o.remove(); keyCard(); };
    var g = o.querySelector('#off-inst-go'); if (g) g.onclick = function () { deferredInstall.prompt(); deferredInstall = null; o.remove(); };
  }
  A.installGuide = installGuide;
  var deferredInstall = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredInstall = e; });
  if (PAGE === 'home' && !STANDALONE) {
    var hideKey = 'sp_off_install_hide'; var hidden = 0; try { hidden = Number(localStorage.getItem(hideKey)) || 0; } catch (e) {}
    if (Date.now() - hidden > 7 * 864e5) setTimeout(function wait() {
      if (showOn()) return setTimeout(wait, 600);
      var b = document.createElement('div'); b.className = 'off-install'; b.id = 'off-install';
      b.innerHTML = '<span class="ic">📲</span><span class="tx"><b>Play without internet?</b><br>Add STEAM Playground to this ' + KIND + '’s home screen.</span><button id="off-install-how">How?</button><button class="x" id="off-install-x" aria-label="Not now">✕</button>';
      document.body.appendChild(b);
      b.querySelector('#off-install-how').onclick = function () { installGuide(); };
      b.querySelector('#off-install-x').onclick = function () { try { localStorage.setItem(hideKey, String(Date.now())); } catch (e) {} b.remove(); };
    }, 1200);
  }

  /* ---------- 🆕 updates (service worker) ---------- */
  var SW = navigator.serviceWorker, upd = null;
  function swAsk(msg) { return new Promise(function (ok) { if (!SW || !SW.controller) return ok(null); var id = Math.random().toString(36).slice(2); msg.id = id; var f = function (e) { if (e.data && e.data.id === id) { SW.removeEventListener('message', f); ok(e.data); } }; SW.addEventListener('message', f); SW.controller.postMessage(msg); setTimeout(function () { SW.removeEventListener('message', f); ok(null); }, 120000); }); }
  function setUpdate(r) { if (r && r.pending) { upd = { ready: true, ver: r.pending }; A._setUpdate(upd); updCard(); } }
  function updCard() {
    if (!upd || !SHELL[PAGE] || playing() || document.getElementById('off-upd')) return;
    var c = document.createElement('div'); c.className = 'off-upd'; c.id = 'off-upd';
    c.innerHTML = '<span>🆕 New update ready!</span><button id="off-upd-go">⟳ Update</button><button class="x" id="off-upd-x" aria-label="Later">✕</button>';
    document.body.appendChild(c);
    c.querySelector('#off-upd-go').onclick = applyUpdate;
    c.querySelector('#off-upd-x').onclick = function () { c.remove(); };
  }
  function applyUpdate() { swAsk({ t: 'apply' }).then(function () { location.reload(); }); }
  A.checkUpdate = function () { return swAsk({ t: 'check' }).then(function (r) { setUpdate(r); return r; }); };
  A.swState = function () { return swAsk({ t: 'state' }); };
  if (SW) {
    var first = false; try { first = !sessionStorage.getItem('sp_off_session'); sessionStorage.setItem('sp_off_session', '1'); } catch (e) {}
    var start = function () {
      if (!SW.controller) return;
      swAsk({ t: 'state' }).then(function (st) {
        if (st && st.pending && first && PAGE === 'home') return applyUpdate();   // app just opened: switch to the waiting update before anyone plays
        if (st && st.pending) setUpdate(st);
        if (navigator.onLine && (SHELL[PAGE] || first)) A.checkUpdate();
      });
    };
    if (SW.controller) start(); else SW.addEventListener('controllerchange', start);
    window.addEventListener('online', function () { if (SHELL[PAGE]) A.checkUpdate(); });
  }
})();
