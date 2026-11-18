
const CURRENT_PLAYER = SP_TV[0]; window.SP_PAGE = SP_TV[1];
try { UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true}); } catch(e){}
UI.navBar(document.getElementById('back-btn'), {});
(function navRoom(){ const n = document.getElementById('back-btn-nav'), app = document.getElementById('app'); if(!n) return; const fix = getComputedStyle(n).position === 'fixed';
  document.getElementById('top').style.setProperty('--nav-w', fix ? Math.ceil(n.getBoundingClientRect().right - app.getBoundingClientRect().left + 6) + 'px' : '0px'); })();
(function(){
'use strict';
const L = window.Loot, $ = id => document.getElementById(id), cv = $('cv'), g = cv.getContext('2d'); L.react();   // ☁️ Sky Pop tap reaction on every button
const VIEWS = [['tiers', '🎁', 'Rarities'], ['roll', '🎲', 'Roll'], ['bag', '🎒', 'Bag'], ['fight', '⚔️', 'Fight'], ['book', '📖', 'Book']];
// 🧙 a lab staff (a game marks its mage weapons with staff: true) — a forged staff powers up spells of ITS element (av-r0g)
L.add('lab', {staff: {name: 'Oak Staff', kind: 'weapon', slot: 'hand', staff: true, paint: (q, tier) => { const c = ['#B07842', '#7CCB55', '#5AA8FF', '#C69CFF', '#FFC21A', '#FF8FD8', '#FFFFFF'][tier] || '#B07842';
  q.lineCap = 'round'; q.strokeStyle = '#2A1C14'; q.lineWidth = 14; q.beginPath(); q.moveTo(-26, 60); q.lineTo(20, -40); q.stroke(); q.strokeStyle = '#8A5A2B'; q.lineWidth = 9; q.stroke();
  q.fillStyle = '#2A1C14'; q.beginPath(); q.arc(24, -50, 21, 0, 7); q.fill(); const gr = q.createRadialGradient(18, -56, 2, 24, -50, 18); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, c); q.fillStyle = gr; q.beginPath(); q.arc(24, -50, 17, 0, 7); q.fill(); }}}, {by: 'LootLab'});
const SRCS = Object.keys(L.SRC), POOL = ['demo.blade', 'demo.helm', 'demo.amulet'];
const SETS = {boss: {id: 'jungle-gold', tier: 4, pieces: POOL}, eboss: {id: 'jungle-rainbow', tier: 5, pieces: POOL}, awaken: {id: 'temple-sky', tier: 6, pieces: POOL}, hidden: {id: 'jungle-gold', tier: 4, pieces: POOL}};
const S = {view: 'tiers', src: 'mini', basic: false, dayN: 0, W: 0, H: 0, dpr: 1, last: null, stats: null, busy: false, sheet: null, drawn: [], frameMs: 0, rolls: 0};
// a demo bag: 30 things, some materials, 2 in the 📬 mailbox, 2 to buy back
function demoBag(){ const r = L.rng('lab-bag'), B = L.bag({slots: 40, c: 250});
  for(let i = 0; i < 30; i++){ const tier = [0, 0, 0, 1, 1, 1, 2, 2, 3, 4, 5, 6][Math.floor(r() * 12)]; B.add({base: POOL[i % 3], tier, lv: 1 + Math.floor(r() * 9), seed: Math.floor(r() * 1e9), sock: L.SOCK[tier], runes: []}); }
  B.lock(0, true); B.mat('scrap', 12); B.mat('spark', 3); B.mat('evolve', 1); B.quest('mango-wood', 5);
  // 🍙 food + 🧪 potions (×99 stacks) · ⚔️ quick bar · 🔥 cores · a forged 🔥 blade + a forged ⚡ staff (av-r0g)
  B.use('food.rice', 6); B.use('food.fish', 3); B.use('food.coconut', 12); B.use('food.chili', 1); B.use('food.cake', 2); B.use('potion.heal', 9); B.use('potion.shield', 2); B.use('potion.lucky', 1);
  B.quick(0, 'potion.heal'); B.quick(1, 'food.rice'); B.quick(2, 'potion.shield'); B.mat('core.fire', 4); B.mat('core.bolt', 2); B.mat('herb', 3); B.mat('mango', 4);
  const fb = {base: 'demo.blade', tier: 3, lv: 6, seed: 21, sock: L.SOCK[3], runes: []}; L.forge(fb, 'fire', 2); B.g.unshift(fb);
  const st = {base: 'lab.staff', tier: 2, lv: 5, seed: 22, sock: L.SOCK[2], runes: []}; L.forge(st, 'bolt', 3); B.g.unshift(st);
  B.mail.push({base: 'demo.helm', tier: 3, lv: 4, seed: 11, sock: 1, runes: []}, {base: 'demo.amulet', tier: 2, lv: 2, seed: 12, sock: 1, runes: []});
  B.buy.push({base: 'demo.blade', tier: 1, lv: 3, seed: 13, sock: 0, runes: []}, {base: 'demo.helm', tier: 0, lv: 1, seed: 14, sock: 0, runes: []}); return B; }
let BAG = demoBag();
function chipRow(box, list, cur, on){ box.innerHTML = ''; list.forEach(([k, ic, lb, cls]) => { const b = document.createElement('button'); b.className = 'chip lk-react' + (k === cur ? ' on' : '') + (cls ? ' ' + cls : ''); b.dataset.k = k;
    b.innerHTML = ic + '<span class="lb"> ' + lb + '</span>'; b.onclick = () => on(k, b); box.appendChild(b); }); L.iconize(box); }
function day(){ const d = new Date(); d.setDate(d.getDate() + S.dayN); return L.today(d); }
function dock(){ const D = $('dock'); D.innerHTML = '';
  if(S.view === 'roll'){ const row = document.createElement('div'); row.className = 'chips'; row.id = 'srcs'; D.appendChild(row);
    chipRow(row, SRCS.map(k => [k, L.SRC[k].icon, L.SRC[k].name]), S.src, k => { S.src = k; S.stats = null; dock(); });
    const row2 = document.createElement('div'); row2.className = 'chips'; D.appendChild(row2);
    chipRow(row2, [['go', '▶', 'Roll', 'go'], ['basic', '🌱', S.basic ? 'Basic on' : 'Basic off'], ['stats', '📊', '10 000 rolls'], ['day', '⏭', 'Next day']], S.basic ? 'basic' : null, k => {
      if(k === 'go') doRoll(); else if(k === 'basic'){ S.basic = !S.basic; dock(); } else if(k === 'stats') stats(); else { S.dayN++; note(); } }); }
  else if(S.view === 'fight'){ const bar = L.quickBar(D, BAG, {onUse: r => { toastEff(r); note(); }}); S.bar = bar;
    const row = document.createElement('div'); row.className = 'chips'; row.id = 'hits'; D.appendChild(row);
    chipRow(row, [['blade', '🔥', 'Blade hit'], ['staff', '⚡', 'Staff spell'], ['turn', '⏭', 'Next turn']], null, k => { if(k === 'turn'){ bar.newTurn(); S.hits = null; return; } fight(k); }); }
  else if(S.view === 'bag' || S.view === 'book'){ chipRow(D, [['open', S.view === 'bag' ? '🎒' : '📖', S.view === 'bag' ? 'Open bag' : 'Open book'], ['reset', '🔄', 'New demo bag']], null, k => { if(k === 'reset'){ BAG = demoBag(); } openSheet(); }); } }
function openSheet(){ if(S.sheet){ S.sheet.close(); S.sheet = null; }
  if(S.view === 'bag') S.sheet = L.bagSheet(document.body, BAG, {onUse: r => toastEff(r), onEquip: it => UI.toast ? UI.toast('⭐ ' + L.get(it.base).name + ' equipped') : 0, onClose: () => { S.sheet = null; }, onChange: note});
  else if(S.view === 'book') S.sheet = L.book(document.body, BAG, {list: POOL, onClose: () => { S.sheet = null; }}); note(); }
function themeRow(){ const cur = L.theme(); chipRow($('themes'), Object.keys(L.THEMES).map(k => [k, L.THEMES[k].icon, L.THEMES[k].name]), cur, k => { L.theme(k); try { localStorage.setItem('sp_loot_theme', k); } catch(e){} themeRow(); if(S.sheet) openSheet(); }); }
function setView(v){ S.view = v; if(S.sheet){ S.sheet.close(); S.sheet = null; } chipRow($('views'), VIEWS, v, setView); dock(); if(v === 'bag' || v === 'book') openSheet(); note(); }
function toastEff(r){ const t = (L.useDef(r.id) || {}).name + ': ' + r.eff.map(e => L.effRow(e)).map(x => x[0] + ' ' + x[1] + ' ' + x[2]).join(' · ') + ' · ×' + r.left + ' left'; if(window.UI && UI.toast) UI.toast(t); S.lastUse = t; }
// ⚔️ the same hit vs the 8 elements: the forged 🔥 blade (Lv 2) or a ⚡ spell from the forged ⚡ staff (Lv 3)
const FOES = ['leaf', 'water', 'fire', 'rock', 'bolt', 'wind', 'star', 'dark'];
function fight(k){ const fb = BAG.g.find(i => i.base === 'demo.blade' && i.el), st = BAG.g.find(i => i.base === 'lab.staff'), base = 100;
  S.hits = {k, list: FOES.map(e => { const m = k === 'staff' ? L.spellMult(st, 'bolt', e) : L.hitMult(fb, e); return {e, n: Math.round(base * m.x), m}; })}; }
function vFight(){ const W = S.W, H = S.H, h = S.hits; txt(h ? (h.k === 'staff' ? '⚡ Bolt spell · staff ⚡ Lv 3 (+30 %)' : '🔥 Blade · 🔥 Lv 2 (+10 %)') + ' — base 100' : '⚔️ tap 🔥 Blade hit or ⚡ Staff spell · the quick bar is below', W / 2, 26, Math.max(12, Math.min(16, W / 30)));
  if(!h) return; const n = h.list.length, cols = W > H ? 8 : 4, rows = Math.ceil(n / cols), cw = W / cols, ch = Math.min(110, (H - 46) / rows);
  h.list.forEach((x, i) => { const cx = cw * (i % cols) + cw / 2, cy = 46 + ch * Math.floor(i / cols) + ch / 2, E = L.ELS[x.e], r = Math.min(cw, ch) * 0.3;
    g.fillStyle = E.c; g.globalAlpha = 0.25; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.globalAlpha = 1; txt(E.icon, cx, cy + r * 0.35, r * 0.9); rec(cx - r, cy - r, r * 2, r * 2);
    txt(x.n + (x.m.arrow ? ' ' + x.m.arrow : ''), cx, cy - r - 4, Math.max(13, r * 0.6), x.m.k === 'strong' ? '#E09A00' : x.m.k === 'normal' ? '#24324A' : '#8A93A8'); txt(E.name, cx, cy + r + 14, 12, '#566A84'); }); }
function note(){ const n = $('note'); if(S.view === 'tiers') n.textContent = '🎁 7 tiers · the item keeps its look — frame, glow, gem shape tell the tier';
  else if(S.view === 'roll') n.textContent = L.SRC[S.src].icon + ' ' + L.SRC[S.src].name + ' · 🍀 ' + BAG.luck().toFixed(1) + ' / ' + L.LUCK_STEPS + ' · ☁️ ' + BAG.shards() + ' · 📅 ' + day();
  else if(S.view === 'fight') n.textContent = '⚔️ quick bar: ' + BAG.qb.map((id, i) => (i + 1) + ' ' + (id ? (L.useDef(id) || {}).icon + ' ×' + (BAG.u[id] || 0) : '—')).join(' · ') + (S.lastUse ? ' · last: ' + S.lastUse : '');
  else n.textContent = '🎒 ' + BAG.count() + ' / ' + BAG.slots + ' · 📬 ' + BAG.mail.length + ' · save ' + BAG.size() + ' chars'; }
async function doRoll(){ if(S.busy) return; S.busy = true; S.rolls++;
  const res = L.roll(S.src, {seed: 'lab:' + S.rolls + ':' + Date.now(), luck: 20, lv: 5, state: BAG.st, pool: POOL, boss: S.src === 'monster' || S.src === 'elite' ? null : 'lab-' + S.src, day: day(), set: SETS[S.src], relic: 'demo.amulet'});
  if(res.choose){ const piece = await pickPiece(res.choose); L.choose(res, piece, {set: SETS.awaken, lv: 5}); }
  S.last = res; if(res.daily === 'done' && window.UI && UI.toast) UI.toast('📅 Already claimed today — fight any time, the reward comes back tomorrow');
  try { await L.reveal($('stage'), res, {basic: S.basic}); } catch(e){ S.err = e.message; }
  BAG.take(res); S.busy = false; note(); }
function pickPiece(list){ return new Promise(res => { const box = document.createElement('div'); box.className = 'lk-ov lk-dim'; box.id = 'lab-pick'; box.style.flexDirection = 'column'; box.style.gap = '10px';
  box.innerHTML = '<div style="color:#fff;font:700 20px Fredoka;text-shadow:0 2px 0 rgba(0,0,0,.35)">☀️ First win — choose your Sky God piece!</div><div class="chips" style="justify-content:center"></div>';
  list.forEach(id => { const b = document.createElement('button'); b.className = 'chip go'; b.textContent = L.get(id).name; b.onclick = () => { box.remove(); res(id); }; box.querySelector('.chips').appendChild(b); }); $('stage').appendChild(box); }); }
function stats(){ const N = 10000, cnt = new Array(7).fill(0); let items = 0, t0 = performance.now();
  for(let i = 0; i < N; i++){ const r = L.roll(S.src, {seed: 'st:' + i, pool: POOL}); r.items.forEach(it => { cnt[it.tier]++; items++; }); }
  S.stats = {src: S.src, N, cnt, items, ms: performance.now() - t0}; }
function size(){ const r = $('stage').getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1); if(r.width === S.W && r.height === S.H && dpr === S.dpr) return;
  S.W = r.width; S.H = r.height; S.dpr = dpr; cv.width = Math.round(S.W * dpr); cv.height = Math.round(S.H * dpr); }
function rec(x, y, w, h){ S.drawn.push({x, y, w, h}); }
function txt(s, x, y, px, col, al){ g.font = '700 ' + px + 'px Fredoka'; g.fillStyle = col || '#24324A'; g.textAlign = al || 'center'; g.fillText(s, x, y); }
function vTiers(){ const cols = 7, rows = 3, top = 34, lab = 18, cw = S.W / cols, ch = (S.H - top - 6) / rows, sz = Math.min(cw * 0.86, (ch - lab) * 0.86 / 1.25);
  for(let i = 0; i < cols; i++){ const x = cw * (i + 0.5); txt(L.RAR[i].name, x, 22, Math.max(10, Math.min(15, cw / 7)), i >= 5 ? '#7A4FD0' : L.RAR[i].dark);
    for(let r = 0; r < rows; r++){ const w = sz * 0.8, h = sz, y = top + ch * r + (ch - h - lab) / 2; L.card(g, {base: POOL[r], tier: i, lv: 1}, x - w / 2, y, w, h, S.t); rec(x - w / 2, y, w, h); } } }
function vRoll(){ const pad = 12, W = S.W, H = S.H; txt('🍀 lucky meter', pad, 26, 14, '#2A8F43', 'left'); L.lucky(g, pad, 34, Math.min(220, W * 0.4), L.LUCK_STEPS, Math.floor(BAG.luck())); rec(pad, 34, Math.min(220, W * 0.4), 26);
  const res = S.last; let y = 80;
  if(res){ txt(L.SRC[res.src].icon + ' ' + L.SRC[res.src].name + (res.first ? ' · first win!' : '') + (res.luckUp ? ' · 🍀 lucky!' : '') + (res.daily ? ' · 📅 done today' : '') + ' · 🪙 ' + res.coins + (res.shards ? ' · ☁️ +' + res.shards : ''), pad, y, Math.max(11, Math.min(15, W / 40)), '#24324A', 'left');
    const n = Math.max(1, res.items.length), cs = Math.min(120, (W - pad * 2) / Math.max(4, n) - 10, H * 0.32); res.items.forEach((it, i) => { const x = pad + i * (cs * 0.8 + 10); L.card(g, it, x, y + 10, cs * 0.8, cs, S.t); rec(x, y + 10, cs * 0.8, cs); });
    if(!res.items.length) txt(res.daily ? '📅 reward already taken today' : 'no gear this time — coins only', pad, y + 40, 14, '#566A84', 'left'); y += Math.min(120, H * 0.32) + 26; }
  const st = S.stats; if(st && st.src === S.src){ const w = L.SRC[S.src].w, tot = w.reduce((a, b) => a + b, 0), bw = Math.min(W - pad * 2, 520), bh = Math.max(12, Math.min(22, (H - y - 30) / 8));
    txt('📊 ' + st.N.toLocaleString() + ' rolls → ' + st.items.toLocaleString() + ' items (' + Math.round(st.ms) + ' ms) · bar = got · ▏= table', pad, y, 13, '#24324A', 'left'); y += 8;
    for(let i = 0; i < 7; i++){ if(!w[i] && !st.cnt[i]) continue; y += bh + 4; const got = st.items ? st.cnt[i] / st.items : 0, want = (w[i] || 0) / tot;
      g.fillStyle = '#E4ECF5'; g.fillRect(pad + 90, y - bh, bw - 90, bh); g.fillStyle = i === 5 ? '#C69CFF' : L.RAR[i].col; g.fillRect(pad + 90, y - bh, (bw - 90) * got, bh);
      g.fillStyle = '#2B2D42'; g.fillRect(pad + 90 + (bw - 90) * want - 1, y - bh - 2, 2, bh + 4); txt(L.RAR[i].name + ' ' + (got * 100).toFixed(1) + '%', pad, y - 3, 12, '#24324A', 'left'); } } }
const DRAW = {tiers: vTiers, roll: vRoll, fight: vFight, bag: () => {}, book: () => {}};
function frame(now){ size(); S.t = now / 1000; S.drawn = []; const t0 = performance.now(); g.setTransform(S.dpr, 0, 0, S.dpr, 0, 0); g.clearRect(0, 0, S.W, S.H);
  try { DRAW[S.view](); } catch(e){ S.err = e.message; } S.frameMs = S.frameMs * 0.9 + (performance.now() - t0) * 0.1; requestAnimationFrame(frame); }
window.LK_LAB = {S, setView, themeRow, doRoll, stats, bag: () => BAG, setBag: b => { BAG = b; }, demoBag, POOL, SETS, openSheet, fight};
try { L.theme(localStorage.getItem('sp_loot_theme') || 'gold'); } catch(e){ L.theme('gold'); } themeRow();   // 🪙 gold = the one look (av-r0e4)
setView('tiers'); requestAnimationFrame(frame);
})();
