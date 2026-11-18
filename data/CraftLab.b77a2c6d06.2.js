
const CURRENT_PLAYER = SP_TV[0]; window.SP_PAGE = SP_TV[1];
try { UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true}); } catch(e){}
UI.navBar(document.getElementById('back-btn'), {});
(function navRoom(){ const n = document.getElementById('back-btn-nav'), app = document.getElementById('app'); if(!n) return; const fix = getComputedStyle(n).position === 'fixed';
  document.getElementById('top').style.setProperty('--nav-w', fix ? Math.ceil(n.getBoundingClientRect().right - app.getBoundingClientRect().left + 6) + 'px' : '0px'); })();
(function(){
'use strict';
const L = window.Loot, C = window.Craft, $ = id => document.getElementById(id), cv = $('cv'), g = cv.getContext('2d'); L.react(); L.theme('gold');
const VIEWS = [['shop', '🛒', 'Shop'], ['smith', '⚒️', 'Blacksmith'], ['cook', '🍳', 'Cook'], ['mats', '🧱', 'Materials']];
const S = {view: 'smith', town: 3, basic: false, sheet: null, W: 0, H: 0, dpr: 1};
// a demo bag + a demo craft save (Smith Lv 2): enough to try every tab, and some things missing on purpose
function demo(){ const B = L.bag({slots: 40, c: 900}), mk = (base, tier, lv, seed, x) => Object.assign({base, tier, lv, seed, sock: L.SOCK[tier], runes: []}, x || {});
  [['wood', 9], ['ore', 7], ['bone', 1], ['gem', 2], ['cotton', 2], ['herb', 3], ['iron', 2], ['teak', 1], ['mango', 3], ['grain', 4], ['fish', 1], ['coconut', 2], ['chili', 2],
   ['core.fire', 9], ['core.water', 2], ['core.bolt', 3], ['core.rock', 4]].forEach(m => B.mat(m[0], m[1]));
  B.add(mk('craft.woodsword', 0, 2, 11)); B.add(mk('craft.woodsword', 0, 3, 12)); B.add(mk('craft.woodsword', 0, 1, 13)); B.add(mk('craft.steelblade', 1, 4, 14, {star: 2}));
  const wand = mk('craft.crystalwand', 2, 5, 15); L.forge(wand, 'water', 1); B.add(wand); const fb = mk('demo.blade', 3, 6, 16); L.forge(fb, 'fire', 2); B.add(fb);
  B.add(mk('craft.potlid', 1, 2, 17)); B.add(mk('demo.helm', 2, 3, 18)); B.lock(B.g.length - 1, true); B.st.shards = 3;
  B.buy.push(mk('craft.ironflipper', 1, 3, 19), mk('demo.amulet', 0, 1, 20));
  const st = C.state({xp: {smith: 25, cook: 4}}); C.learn(st, B); return {B, st}; }
let D0 = demo();
window.CK_LAB = {get bag(){ return D0.B; }, get state(){ return D0.st; }, open: v => setView(v), reset: () => { D0 = demo(); if(S.sheet) openSheet(); }};
function chipRow(box, list, cur, on){ box.innerHTML = ''; list.forEach(([k, ic, lb, cls]) => { const b = document.createElement('button'); b.className = 'chip lk-react' + (k === cur ? ' on' : '') + (cls ? ' ' + cls : ''); b.dataset.k = k;
    b.innerHTML = ic + '<span class="lb"> ' + lb + '</span>'; b.onclick = () => on(k, b); box.appendChild(b); }); L.iconize(box); }
function dock(){ const Dk = $('dock'); Dk.innerHTML = ''; const r1 = document.createElement('div'); r1.className = 'chips'; r1.id = 'towns'; Dk.appendChild(r1);
  chipRow(r1, [1, 2, 3, 4, 5].map(n => [String(n), '🏘️', 'Town ' + n]), String(S.town), k => { S.town = +k; dock(); if(S.sheet) openSheet(); note(); });
  const r2 = document.createElement('div'); r2.className = 'chips'; r2.id = 'acts'; Dk.appendChild(r2);
  chipRow(r2, [['open', VIEWS.find(v => v[0] === S.view)[1], 'Open'], ['basic', '🌱', S.basic ? 'Basic on' : 'Basic off'], ['bag', '🎒', 'Bag'], ['reset', '🔄', 'New demo bag']], S.basic ? 'basic' : null, k => {
    if(k === 'open'){ if(S.view !== 'mats') openSheet(); } else if(k === 'basic'){ S.basic = !S.basic; dock(); } else if(k === 'bag'){ closeSheet(); S.sheet = {bag: L.bagSheet(document.body, D0.B, {onClose: () => { S.sheet = null; note(); }, onChange: note})}; }
    else { D0 = demo(); if(S.sheet && !S.sheet.bag) openSheet(); note(); } }); }
function closeSheet(){ if(S.sheet){ (S.sheet.bag || S.sheet).close(); S.sheet = null; } }
function openSheet(){ closeSheet(); if(S.view === 'mats') return; S.sheet = C.open(document.body, S.view, {bag: D0.B, state: D0.st, town: S.town, basic: S.basic, backLabel: 'Lab', onChange: note, onClose: () => { S.sheet = null; note(); }}); note(); }
function setView(v){ S.view = v; closeSheet(); chipRow($('views'), VIEWS, v, setView); dock(); if(v !== 'mats') openSheet(); note(); }
function note(){ const st = D0.st; $('note').textContent = '🪙 ' + D0.B.c + ' · ⚒️ Smith Lv ' + st.lv('smith') + ' (' + st.xp.smith + ' xp) · 🍳 Cook Lv ' + st.lv('cook') + ' · 🏘️ Town ' + S.town + ' · 🎒 ' + D0.B.count() + ' / ' + D0.B.slots + ' · save ' + JSON.stringify(st.toJSON()).length + ' chars'; }
function size(){ const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1); S.W = r.width; S.H = r.height; S.dpr = dpr; cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr)); g.setTransform(dpr, 0, 0, dpr, 0, 0); }
function txt(s, x, y, px, col){ g.save(); g.font = '700 ' + px + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillStyle = col || '#24324A'; g.fillText(s, x, y); g.restore(); }
// 🧱 the 24 materials: 8 families (rows or columns) × 3 grades
function vMats(t){ const W = S.W, H = S.H, F = C.FAM, wide = W > H, cols = wide ? 8 : 3, rows = wide ? 3 : 8, top = 30, cw = W / cols, ch = (H - top - 6) / rows, k = Math.max(6, Math.min(cw, ch) * 0.2);
  F.forEach((f, fi) => f[3].forEach((m, gr) => { const c = wide ? fi : gr, r = wide ? gr : fi, x = cw * c + cw / 2, y = top + ch * r + ch * 0.66;
    C.matPic(g, m[0], x, y, k, t); txt(m[1], x, top + ch * r + ch - 4, Math.max(10, Math.min(14, cw / 9)), '#566A84'); }));
  txt('🧱 8 materials × 3 grades — 2.5D on the IsoProps light + one rim', W / 2, 20, Math.max(11, Math.min(15, W / 50))); }
function vPlace(t){ const W = S.W, H = S.H, k = Math.min(W, H) / 300; if(S.view === 'smith'){ C.anvil(g, W / 2, H * 0.62, 1.4 * k); } else if(S.view === 'cook') C.pot(g, W / 2, H * 0.6, 1.3 * k, t, 1); else { C.matPic(g, 'wood', W / 2 - 60 * k, H * 0.6, 22 * k, t); C.matPic(g, 'ore', W / 2 + 60 * k, H * 0.6, 22 * k, t); }
  txt('Tap ' + VIEWS.find(v => v[0] === S.view)[1] + ' Open to step inside', W / 2, H * 0.86, Math.max(13, Math.min(18, W / 30))); }
function frame(now){ if(!S.W) size(); g.clearRect(0, 0, S.W, S.H); const t = now / 1000; if(S.view === 'mats') vMats(t); else vPlace(t); requestAnimationFrame(frame); }
window.addEventListener('resize', () => { size(); });
size(); setView('smith'); requestAnimationFrame(frame);
})();
