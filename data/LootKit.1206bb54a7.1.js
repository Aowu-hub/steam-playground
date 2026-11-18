
/* 🎁 LootKit — window.Loot   (include AFTER UiKit; AvatarKit / AvatarWeapons optional — used for the demo blade only)
   ─ Look ─ RAR (7 tiers: ⚪ common · 🟢 good · 🔵 rare · 🟣 epic · 🟡 legend · 🌈 rainbow · ☀️ sky — colour + a gem SHAPE each) · frame(g, x, y, w, h, tier, t)
            gem(g, x, y, r, tier, t) · card(g, item | {base, tier}, x, y, w, h, t) = frame + the item's own painter (the ITEM keeps its look, only trim / frame follow the tier)
            beam(g, x, y, h, w, tier, t) (map drop) · chest(g, x, y, s, 'wood'|'silver'|'gold'|'sky', lid 0..1, t) · coin · shard · lucky(g, x, y, w, steps, filled)
   ─ Items ─ add(pack, {id: {name, kind: 'weapon'|'wear'|'acc'|…, slot?, paint(g, tier, t) (≈ 100 px tall at 0,0, no text), about?}}, {by, date}) → ids '<pack>.<id>' · get(id) · list({kind, pack})
            item = {base, tier, lv, seed, sock, runes[], set?, relic?, lock?} · power(it) · bonus(it) (stat lines rebuilt from the seed) · price(it) · SOCK (rune sockets per tier, for the 💍 Rune Master)
   ─ Rolls (pure + seeded, node-safe) ─ SRC = monster · elite · mini · boss · hidden · eboss · awaken (Avateer plan §17q weights)
            roll(src, {seed, luck, lv, state, pool: [base ids], boss: id, day: 'YYYY-MM-DD', set: {id, tier, pieces: [base ids]}, relic: base id, mats: {id: [chance, min, max]}})
              → {items, coins, shards, mats, show, chest, first, daily: null|'done', luckUp, choose: null|[pieces], state}
              🍀 lucky meter: a win with no top-of-range drop fills a step (Luck fills faster); full → the next roll is the top of its range (never above)
              sets: first boss win = a set piece · no duplicates until complete → ☁️ shards · ☀️ Sky God first win = you CHOOSE (choose(res, piece)) · eboss / awaken reward once a day
            party(src, [ctx…]) = one roll each (no fighting over loot) · today() · rng(seed) · range(src)
   ─ Bag ─ bag(save, {slots}) → add · mat · quest · lock · sell · recycle · buyBack · claim · claimAll · upgrade · sort · take(res) · buyPiece(set, piece) · toJSON()
            40 slots (+10 per upgrade, max 120) · full → 📬 mail (never lost) · no ground drop · 🔵+ ask "are you sure?" · 🔒 locked = can't sell / recycle · ☀️ = never sold (♻️ → shards) · 🔁 last 10 sold
   ─ UI ─ show(box, item, {kind: 'chest'|'cloud'|'wheel'|'beam', src, chest, basic, skip, auto}) → Promise<'equip'|'bag'> (≤ 2 s, tap skips — not the very first time)
          reveal(box, res, o) = the right shows for a whole roll · showFor(src, item) · bagSheet(box, bag, {onEquip, onChange, matName, matIcon}) · book(box, bag, {list, title})
   ─ 🍙 Use (av-r0g) ─ USES (10 island foods `food.*` + 5 potions `potion.*` incl. 🌟 Aura — Aura = the skill bar, plan §20h) · addUse(pack, {id: {name, icon, island, eff: [{k, v, turns|fights}], cook: {mat: n}, paint(g)}}) · effRow(e) → [icon, words, value]
            bag: use(id, n) (×99 cap, returns {n, over}) · eat(id) → {ok, eff, left} (the GAME applies the effects) · quick(slot, id) · quickUse(slot) · B.u / B.qb saved
            quickBar(el, bag, {onUse(res), onChange}) → {newTurn(), check(hp 0..1), render()} = 3 gold slots + ONE 🤖 auto-heal switch (B.qa; HP < 30 % → the first ❤️ heal on the bar, counts as the turn's use), one use per turn · bagSheet tabs 🎒 Gear · 🍙 Use · 🧱 Craft · 📬 Mail · 🔁 Buy back (+ o.onUse = 🍽️ Use button)
            roll: elites / bosses sometimes drop a potion (USE_DROP, own random → res.uses)
   ─ 🔥 Elements (av-r0g, Aowu 2026-11-18) ─ ELS (8 = the monsters' elements) · roll(src, {el}) drops that element's CORE (`core.<el>`, CORE_DROP, own random) · forge(item, el, lv?) (Lv 1–5, FORGE_COST cores; swap = half back)
            elMult(atkEl, defEl, lv) → {k: strong|normal|weak|same|plain, x, arrow} — strong ×1.5 · normal ×1 · weak ×0.7 · same ×0.75 · plain ×0.9 · ✨↔🌑 ×1.5 · +5 % a forged level
            hitMult(weapon, monsterEl) · spellMult(staff, spellEl, monsterEl) — 🧙 a staff (item def `staff: true`) powers spells of ITS element +10 % a level
   Lab: ?page=loot (hidden; ⚔️ Fight view = quick bar + element hits). Test: Test Harness/loot.js. Plan: Avateer — full plan.md §19 + §20g. */
(function(){
'use strict';
if(window.Loot) return;
const AVD = (function(){
const TAU = Math.PI * 2;
function rgb(h){ const n = parseInt(String(h).replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function sh(h, f){ const c = rgb(h), m = v => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)))); return 'rgb(' + m(c[0]) + ',' + m(c[1]) + ',' + m(c[2]) + ')'; }
function rgba(h, a){ const c = rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
// ONE-PIECE: every part gets the same dark rim first, then all fills → one silhouette, no inner outlines
function piece(g, parts, rim, rw){
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if(rw > 0){ g.strokeStyle = rim; g.lineWidth = rw * 2; parts.forEach(p => { if(p.noRim) return; g.beginPath(); p.path(g); g.stroke(); if(p.closedFill !== false){ g.fillStyle = rim; g.fill(); } }); }
  parts.forEach(p => { g.beginPath(); p.path(g); if(p.fill){ g.fillStyle = typeof p.fill === 'function' ? p.fill(g) : p.fill; g.fill(); } if(p.after) p.after(g); });
  g.restore();
}
function lin(g, x0, y0, x1, y1, stops){ const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => gr.addColorStop(Array.isArray(c) ? c[0] : i / Math.max(1, stops.length - 1), Array.isArray(c) ? c[1] : c)); return gr; }
function rad(g, x, y, r0, r1, stops){ const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach((c, i) => gr.addColorStop(Array.isArray(c) ? c[0] : i / Math.max(1, stops.length - 1), Array.isArray(c) ? c[1] : c)); return gr; }
function glow(g, x, y, r, col, a){ g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rad(g, x, y, 0, r, [[0, rgba(col, a == null ? 0.55 : a)], [1, rgba(col, 0)]]); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore(); }
function star(g, x, y, r1, r2, n, rot){ n = n || 5; rot = rot == null ? -Math.PI / 2 : rot; for(let i = 0; i < n * 2; i++){ const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n; i ? g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); }
function rr(g, x, y, w, h, r){ r = Math.min(r, w / 2, h / 2); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function ell(g, x, y, rx, ry, rot){ g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU); }
function sparkle(g, x, y, r, col){ g.save(); g.fillStyle = col || '#fff'; g.beginPath(); star(g, x, y, r, r * 0.22, 4, 0); g.fill(); g.restore(); }
// seeded random
function rnd(seed){ let s = seed >>> 0 || 1; return () => { s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909); s ^= s >>> 16; return (s >>> 0) / 4294967296; }; }
// text helpers (sheets + mocks)
function txt(g, s, x, y, o){ o = o || {}; g.save(); g.font = (o.w || 700) + ' ' + (o.size || 16) + 'px ' + (o.font || 'Fredoka'); g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
  if(o.max){ let f = o.size || 16; while(g.measureText(s).width > o.max && f > 6){ f -= 0.5; g.font = (o.w || 700) + ' ' + f + 'px ' + (o.font || 'Fredoka'); } }
  if(o.stroke){ g.lineJoin = 'round'; g.strokeStyle = o.stroke; g.lineWidth = o.sw || 4; g.strokeText(s, x, y); }
  if(o.shadow){ g.shadowColor = o.shadow; g.shadowBlur = o.blur || 6; g.shadowOffsetY = o.sy == null ? 2 : o.sy; }
  g.fillStyle = o.col || '#2B2D42'; g.fillText(s, x, y); g.restore(); }
function wrap(g, s, x, y, w, lh, o){ o = o || {}; g.save(); g.font = (o.w || 600) + ' ' + (o.size || 14) + 'px ' + (o.font || 'Fredoka'); const words = s.split(' '); let line = '', yy = y;
  words.forEach(wd => { const t = line ? line + ' ' + wd : wd; if(g.measureText(t).width > w && line){ txt(g, line, x, yy, o); line = wd; yy += lh; } else line = t; }); if(line) txt(g, line, x, yy, o); g.restore(); return yy + lh; }
function card(g, x, y, w, h, o){ o = o || {}; g.save(); if(o.shadow !== false){ g.shadowColor = 'rgba(0,0,0,0.18)'; g.shadowBlur = o.blur || 14; g.shadowOffsetY = 4; }
  g.fillStyle = o.fill || '#fff'; g.beginPath(); rr(g, x, y, w, h, o.r == null ? 16 : o.r); g.fill(); g.shadowColor = 'transparent';
  if(o.line){ g.strokeStyle = o.line; g.lineWidth = o.lw || 2; g.stroke(); } g.restore(); }
function pill(g, s, x, y, o){ o = o || {}; g.save(); g.font = (o.w || 700) + ' ' + (o.size || 13) + 'px Fredoka'; const w = g.measureText(s).width + (o.pad || 12) * 2, h = (o.size || 13) * 1.9;
  const xx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x; card(g, xx, y, w, h, {fill: o.fill || '#2B2D42', r: h / 2, shadow: o.shadow, line: o.line});
  txt(g, s, xx + w / 2, y + h * 0.68, {align: 'center', size: o.size || 13, col: o.col || '#fff', w: o.w || 700}); g.restore(); return w; }
// a canvas of size w × h at device scale s
function cv(w, h, s){ s = s || 1; const c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s); const g = c.getContext('2d'); g.scale(s, s); c.W = w; c.H = h; return c; }
// paint something at a big scale off-screen, find its real painted box, then draw it centred + scaled into (x, y, w, h)
const FITC = new Map();
function box(key, paint){ fit(null, key, paint); return FITC.get(key); }
function fit(g, key, paint, x, y, w, h, o){ o = o || {}; let e = FITC.get(key);
  if(!e){ const S = 600, c = document.createElement('canvas'); c.width = S; c.height = S; const q = c.getContext('2d'); q.translate(S / 2, S / 2); paint(q, 1); const d = q.getImageData(0, 0, S, S).data;
    let x0 = S, y0 = S, x1 = 0, y1 = 0; for(let j = 0; j < S; j++) for(let i = 0; i < S; i++) if(d[(j * S + i) * 4 + 3] > 12){ if(i < x0) x0 = i; if(i > x1) x1 = i; if(j < y0) y0 = j; if(j > y1) y1 = j; }
    e = {x0: x0 - S / 2, y0: y0 - S / 2, w: Math.max(1, x1 - x0 + 1), h: Math.max(1, y1 - y0 + 1)}; FITC.set(key, e); }
  if(!g) return 0;
  const k = o.k || Math.min(w / e.w, h / e.h, o.max || 99), dx = x + (w - e.w * k) / 2 - e.x0 * k, dy = o.bottom ? y + h - (e.y0 + e.h) * k : y + (h - e.h * k) / 2 - e.y0 * k;
  g.save(); g.translate(dx, dy); g.scale(k, k); paint(g, 1); g.restore(); return k; }
return {fit, box, TAU, rgb, sh, rgba, piece, lin, rad, glow, star, rr, ell, sparkle, rnd, txt, wrap, card, pill, cv};
})();
let LD = null;
/* 🧳 Avateer — R0d 🎁 LootKit draft painters (av-r0d pics). Pure canvas, no emoji in the art.
   Becomes LootKit.html after "go": RAR table · frame() · gem() · item painters · chest() · cloudWrap() · wheel() · beam() · coins() · mailbox() · lucky(). */
(function(){
'use strict';
const D = AVD, TAU = Math.PI * 2, RIM = '#2A1C14', INK = '#2B2D42';
// 7 rarity tiers — colour + a gem SHAPE each (colour-blind safe: the shape alone tells the tier)
const RAR = [
  {k: 'common',  icon: '⚪', name: 'Common',    col: '#AEB6C2', dark: '#6F7887', gem: 'dot'},
  {k: 'good',    icon: '🟢', name: 'Good',      col: '#4CC764', dark: '#2A8F43', gem: 'drop'},
  {k: 'rare',    icon: '🔵', name: 'Rare',      col: '#3A8DFF', dark: '#1F5FC4', gem: 'diamond'},
  {k: 'epic',    icon: '🟣', name: 'Epic',      col: '#A45BFF', dark: '#6F2DCB', gem: 'star4'},
  {k: 'legend',  icon: '🟡', name: 'Legendary', col: '#FFC21A', dark: '#C98600', gem: 'star5'},
  {k: 'rainbow', icon: '🌈', name: 'Rainbow',   col: '#C69CFF', dark: '#7A4FD0', gem: 'star6'},
  {k: 'sky',     icon: '☀️', name: 'Sky God',   col: '#FFE58A', dark: '#D9A100', gem: 'sun'}];
const RB = ['#FF5A5A', '#FF9F1A', '#FFE14A', '#4CC764', '#2CA6DE', '#6A6BFF', '#C05BFF'];
function rainbow(g, x0, y0, x1, y1, t){ const sh = ((t || 0) * 0.3) % 1, dx = x1 - x0, dy = y1 - y0, gr = g.createLinearGradient(x0 - dx * sh, y0 - dy * sh, x1 + dx * (1 - sh), y1 + dy * (1 - sh)), n = RB.length;
  for(let i = 0; i <= n; i++) gr.addColorStop(i / n, RB[i % n]); return gr; }
function edgeOf(g, x, y, w, h, tier, t){ return tier === 5 ? rainbow(g, x, y, x + w, y + h, t) : tier === 6 ? D.lin(g, x, y, x + w, y + h, ['#FFFFFF', '#FFE58A', '#FFFFFF', '#FFC21A', '#FFFFFF']) : RAR[tier].col; }

// the gem pip (corner of every frame) — shape per tier
function gem(g, x, y, r, tier, t){ const R = RAR[tier]; g.save(); g.translate(x, y);
  const path = () => { g.beginPath();
    if(R.gem === 'dot') D.ell(g, 0, 0, r * 0.8, r * 0.8);
    else if(R.gem === 'drop'){ g.moveTo(0, -r); g.bezierCurveTo(r * 0.95, -r * 0.1, r * 0.75, r * 0.9, 0, r * 0.9); g.bezierCurveTo(-r * 0.75, r * 0.9, -r * 0.95, -r * 0.1, 0, -r); }
    else if(R.gem === 'diamond'){ g.moveTo(0, -r); g.lineTo(r * 0.8, 0); g.lineTo(0, r); g.lineTo(-r * 0.8, 0); g.closePath(); }
    else if(R.gem === 'star4') D.star(g, 0, 0, r, r * 0.42, 4, -Math.PI / 2);
    else if(R.gem === 'star5') D.star(g, 0, 0, r, r * 0.48, 5);
    else if(R.gem === 'star6') D.star(g, 0, 0, r, r * 0.55, 6);
    else { D.star(g, 0, 0, r, r * 0.66, 10); } };
  path(); g.lineJoin = 'round'; g.strokeStyle = RIM; g.lineWidth = Math.max(1.2, r * 0.28); g.stroke();
  g.fillStyle = tier === 5 ? rainbow(g, -r, -r, r, r, t) : D.rad(g, -r * 0.3, -r * 0.35, r * 0.1, r * 1.1, [D.sh(R.col, 0.55), R.col, R.dark]); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); D.ell(g, -r * 0.25, -r * 0.3, r * 0.22, r * 0.15, -0.6); g.fill(); g.restore(); }

// light rays behind a big item (🟡+)
function rays(g, cx, cy, r, col, a, t, n){ n = n || 12; g.save(); g.globalCompositeOperation = 'lighter';
  for(let i = 0; i < n; i++){ const an = i * TAU / n + (t || 0) * 0.35; g.fillStyle = D.rad(g, cx, cy, 0, r, [[0, D.rgba(col, a)], [1, D.rgba(col, 0)]]); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, an, an + TAU / n * 0.42); g.closePath(); g.fill(); }
  g.restore(); }
// a little wing (☀️ Sky God frames + aura)
function wing(g, x, y, s, side){ g.save(); g.translate(x, y); g.scale(side * s, s);
  D.piece(g, [{path: q => { q.moveTo(0, 0); q.bezierCurveTo(10, -14, 30, -18, 44, -10); q.bezierCurveTo(36, -6, 40, 0, 32, 2); q.bezierCurveTo(34, 6, 26, 10, 20, 8); q.bezierCurveTo(18, 12, 8, 12, 0, 6); q.closePath(); }, fill: q => D.lin(q, 0, -16, 0, 12, ['#FFFFFF', '#FFF2C2'])}], 'rgba(201,150,0,0.9)', 1.1);
  g.strokeStyle = 'rgba(214,166,30,0.6)'; g.lineWidth = 1; [[12, -6, 30, -10], [10, 0, 28, -2], [8, 5, 22, 5]].forEach(l => { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); }); g.restore(); }
function puff(g, x, y, s, fill){ g.save(); g.fillStyle = fill || '#fff'; g.beginPath(); D.ell(g, x, y, 14 * s, 7 * s); D.ell(g, x - 8 * s, y + 1 * s, 8 * s, 5 * s); D.ell(g, x + 8 * s, y + 1 * s, 9 * s, 5 * s); D.ell(g, x - 2 * s, y - 5 * s, 8 * s, 6 * s); g.fill(); g.restore(); }

// ☀️ Sky God extras (more epic, Aowu 17:21): sunburst + light pillar + big 3-row feather wings behind, sun crest + cloud bank + orbiting stars in front
function feather(g, len, wid, a, col){ g.save(); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.35, -wid, len, -wid * 0.15); g.quadraticCurveTo(len * 0.4, wid * 0.7, 0, 0); g.closePath();
  g.fillStyle = col; g.fill(); g.strokeStyle = 'rgba(176,122,0,0.85)'; g.lineWidth = Math.max(0.8, wid * 0.12); g.stroke();
  g.strokeStyle = 'rgba(214,166,30,0.45)'; g.lineWidth = Math.max(0.6, wid * 0.07); g.beginPath(); g.moveTo(wid * 0.3, 0); g.lineTo(len * 0.85, -wid * 0.2); g.stroke(); g.restore(); }
function bigWing(g, x, y, s, side, t){ g.save(); g.translate(x, y); g.scale(side * s, s); g.rotate(-0.08 + Math.sin((t || 0) * 2.2) * 0.05);
  const rows = [[8, 78, 21, -1.2, 0.2, '#FFF3CC'], [7, 58, 19, -1.05, 0.21, '#FFFFFF'], [5, 36, 17, -0.85, 0.24, '#FFFDF0']];
  rows.forEach((r, ri) => { for(let i = 0; i < r[0]; i++){ const a = r[3] + i * r[4]; feather(g, r[1] * (1 - i * 0.06), r[2], a + 0.15 * ri, D.lin(g, 0, -10, r[1], 10, [r[5], ri === 0 ? '#FFE9A8' : '#FFF4D0'])); } });
  g.fillStyle = D.rad(g, 0, 0, 1, 16, ['#FFF6C8', '#FFC21A']); g.beginPath(); D.ell(g, 2, -2, 12, 9); g.fill(); g.strokeStyle = '#B07A00'; g.lineWidth = 1.4; g.stroke(); g.restore(); }
function sunBurst(g, cx, cy, r, t){ g.save(); g.globalCompositeOperation = 'lighter'; const n = 24;
  for(let i = 0; i < n; i++){ const a = i * TAU / n + (t || 0) * 0.25, rr = i % 2 ? r * 0.72 : r, wd = i % 2 ? 0.05 : 0.085;
    g.fillStyle = D.rad(g, cx, cy, r * 0.2, rr, [[0, 'rgba(255,236,150,0.75)'], [1, 'rgba(255,236,150,0)']]); g.beginPath(); g.moveTo(cx + Math.cos(a - wd * 2) * r * 0.2, cy + Math.sin(a - wd * 2) * r * 0.2); g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); g.lineTo(cx + Math.cos(a + wd * 2) * r * 0.2, cy + Math.sin(a + wd * 2) * r * 0.2); g.closePath(); g.fill(); }
  g.restore(); }
function skyBack(g, x, y, w, h, s, t){ const cx = x + w / 2, cy = y + h / 2;
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = D.lin(g, 0, y - h * 0.9, 0, y + h * 0.4, ['rgba(255,250,220,0)', 'rgba(255,246,200,0.55)', 'rgba(255,246,200,0)']); g.beginPath(); g.moveTo(cx - w * 0.16, y - h * 0.9); g.lineTo(cx + w * 0.16, y - h * 0.9); g.lineTo(cx + w * 0.42, y + h * 0.4); g.lineTo(cx - w * 0.42, y + h * 0.4); g.closePath(); g.fill(); g.restore();
  sunBurst(g, cx, cy - h * 0.06, Math.max(w, h) * 1.02, t);
  bigWing(g, x + 8 * s, y + h * 0.34, 1.05 * s, -1, t); bigWing(g, x + w - 8 * s, y + h * 0.34, 1.05 * s, 1, t); }
function sunCrest(g, cx, cy, r, t){ g.save(); g.translate(cx, cy);
  for(let i = 0; i < 16; i++){ const a = i * TAU / 16 + (t || 0) * 0.3, l = i % 2 ? r * 1.35 : r * 1.75; g.fillStyle = i % 2 ? '#FFE07A' : '#FFC21A'; g.beginPath(); g.moveTo(Math.cos(a - 0.17) * r * 0.8, Math.sin(a - 0.17) * r * 0.8); g.lineTo(Math.cos(a) * l, Math.sin(a) * l); g.lineTo(Math.cos(a + 0.17) * r * 0.8, Math.sin(a + 0.17) * r * 0.8); g.closePath(); g.fill(); g.strokeStyle = '#A86E00'; g.lineWidth = Math.max(0.8, r * 0.07); g.stroke(); }
  g.beginPath(); D.ell(g, 0, 0, r, r); g.fillStyle = D.rad(g, -r * 0.3, -r * 0.3, 1, r, ['#FFFDF0', '#FFD54A', '#E0A000']); g.fill(); g.strokeStyle = '#8A5A00'; g.lineWidth = Math.max(1, r * 0.13); g.stroke();
  g.beginPath(); D.ell(g, 0, 0, r * 0.5, r * 0.5); g.fillStyle = D.rad(g, -r * 0.15, -r * 0.15, 0.5, r * 0.5, ['#FFFFFF', '#BFE9FF', '#5BB0FF']); g.fill(); g.strokeStyle = 'rgba(138,90,0,0.7)'; g.lineWidth = Math.max(0.8, r * 0.08); g.stroke();
  D.sparkle(g, -r * 0.18, -r * 0.2, r * 0.22, '#fff'); g.restore(); }
function cloudBank(g, x, y, w, s){ const n = Math.max(4, Math.round(w / (26 * s))); g.save(); g.shadowColor = 'rgba(120,170,220,0.35)'; g.shadowBlur = 8 * s; g.fillStyle = '#FFFFFF'; g.beginPath();
  for(let i = 0; i < n; i++){ const px = x + (i + 0.5) * w / n, r = (11 + (i % 3) * 4) * s; D.ell(g, px, y + (i % 2) * 3 * s, r * 1.15, r * 0.8); } g.fill(); g.restore(); }
// the item frame. The ITEM inside keeps its look; rarity = frame + glow + aura + gem.
function frame(g, x, y, w, h, tier, t, o){ o = o || {}; const R = RAR[tier], s = Math.min(w, h) / 150, cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.16, small = Math.min(w, h) < 70;
  g.save();
  if(tier === 6){ D.glow(g, cx, cy, Math.max(w, h) * 0.95, '#FFF6C8', 0.85); D.glow(g, cx, cy, Math.max(w, h) * 0.7, '#FFC21A', 0.45); }
  else if(tier === 5) D.glow(g, cx, cy, Math.max(w, h) * 0.8, '#C69CFF', 0.5);
  else if(tier >= 3) D.glow(g, cx, cy, Math.max(w, h) * 0.72, R.col, tier === 4 ? 0.55 : 0.4);
  if(tier >= 4 && tier < 6 && !small) rays(g, cx, cy, Math.max(w, h) * 0.85, tier === 5 ? '#E9D6FF' : '#FFE07A', tier === 6 ? 0.55 : 0.4, t);
  if(tier === 6 && !small) skyBack(g, x, y, w, h, s, t);
  // card
  g.shadowColor = tier >= 3 ? D.rgba(tier === 6 ? '#E0A800' : R.col, 0.45) : 'rgba(30,40,70,0.18)'; g.shadowBlur = 10 * Math.max(0.6, s); g.shadowOffsetY = 3 * Math.max(0.6, s);
  g.beginPath(); D.rr(g, x, y, w, h, r);
  g.fillStyle = tier === 6 ? D.lin(g, 0, y, 0, y + h, ['#CDEEFF', '#FFFFFF', '#FFF0B0']) : tier === 5 ? D.lin(g, 0, y, 0, y + h, ['#FFFFFF', '#F1E6FF']) : D.lin(g, 0, y, 0, y + h, ['#FFFFFF', D.rgba(R.col, tier === 0 ? 0.16 : 0.22)]); g.fill(); g.shadowColor = 'transparent';
  if(tier >= 2){ g.save(); g.clip(); D.glow(g, cx, cy + h * 0.1, Math.min(w, h) * 0.5, tier === 6 ? '#FFE58A' : R.col, 0.14 + tier * 0.03); g.restore(); }
  // edge
  const lw = Math.max(2, (3 + tier * 0.45) * Math.max(0.55, s));
  g.beginPath(); D.rr(g, x, y, w, h, r); g.strokeStyle = edgeOf(g, x, y, w, h, tier, t); g.lineWidth = lw; g.stroke();
  if(tier >= 3 && !small){ g.beginPath(); D.rr(g, x + lw * 1.8, y + lw * 1.8, w - lw * 3.6, h - lw * 3.6, r * 0.75); g.strokeStyle = tier === 5 ? 'rgba(198,156,255,0.55)' : D.rgba(tier === 6 ? '#E0A800' : R.col, 0.45); g.lineWidth = Math.max(1, lw * 0.35); g.stroke(); }
  // 🟡+ corner caps
  if(tier >= 4 && !small){ const cc = tier === 4 ? '#FFC21A' : tier === 5 ? '#FFFFFF' : '#FFF4C0', k = 14 * s;
    [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(c => { g.save(); g.translate(c[0], c[1]); g.scale(c[2], c[3]);
      D.piece(g, [{path: q => { q.moveTo(-2 * s, -2 * s); q.lineTo(k * 1.25, -2 * s); q.quadraticCurveTo(k * 0.7, k * 0.25, k * 0.35, k * 0.35); q.quadraticCurveTo(k * 0.25, k * 0.7, -2 * s, k * 1.25); q.closePath(); }, fill: cc}], tier === 4 ? '#A86E00' : '#B98A10', 1.2 * Math.max(0.6, s)); g.restore(); }); }
  // 🌈 shimmer band
  if(tier >= 5 && !small){ g.save(); g.beginPath(); D.rr(g, x, y, w, h, r); g.clip(); const p = ((t || 0) * 0.35) % 1.6 - 0.3, bx = x + p * w; g.fillStyle = D.lin(g, bx - w * 0.25, y, bx + w * 0.25, y + h, ['rgba(255,255,255,0)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']); g.beginPath(); g.moveTo(bx - w * 0.15, y); g.lineTo(bx + w * 0.1, y); g.lineTo(bx - w * 0.1, y + h); g.lineTo(bx - w * 0.35, y + h); g.closePath(); g.fill(); g.restore(); }
  // ☀️ orbiting cloud + sparkles
  if(tier === 6){ g.save(); g.beginPath(); D.rr(g, x - lw, y - lw, w + 2 * lw, h + 2 * lw, r + lw); g.strokeStyle = '#A86E00'; g.lineWidth = Math.max(1, lw * 0.35); g.stroke(); g.restore();
    if(!small){ cloudBank(g, x - 6 * s, y + h - 4 * s, w + 12 * s, s); sunCrest(g, cx, y - 2 * s, 15 * s, t);
      for(let k = 0; k < 3; k++){ const a = (t || 0) * 1.2 + k * TAU / 3; D.sparkle(g, cx + Math.cos(a) * w * 0.62, cy + Math.sin(a) * h * 0.2, (7 - k) * s, k ? '#FFF6C8' : '#FFFFFF'); }
      puff(g, cx + Math.cos((t || 0) * 1.4) * w * 0.55, y + h * 0.18 + Math.sin((t || 0) * 1.4) * h * 0.08, Math.max(0.35, s * 0.8)); D.sparkle(g, x + w * 0.14, y + h * 0.2, 7 * s, '#FFC21A'); D.sparkle(g, x + w * 0.88, y + h * 0.7, 6 * s, '#FFC21A'); }
    else sunCrest(g, cx, y - Math.min(w, h) * 0.02, Math.max(3.5, Math.min(w, h) * 0.11), t); }
  if(tier === 4 && !small){ D.sparkle(g, x + w * 0.86, y + h * 0.18, 6 * s, '#fff'); }
  // gem pip
  if(o.gem !== false) gem(g, x + w - r * 0.75, y + h - r * 0.75, Math.max(5, r * 0.5), tier, t);
  g.restore(); }

/* ---------------- item art (drawn at 0,0, ≈ 100 tall) — the art keeps its look, only the TRIM follows the rarity ---------------- */
function helm(g, tier, t){ const R = RAR[tier], trim = tier === 5 ? rainbow(g, -40, -60, 40, 0, t) : R.col;
  D.piece(g, [
    {path: q => { q.moveTo(-36, -8); q.quadraticCurveTo(-38, -62, 0, -66); q.quadraticCurveTo(38, -62, 36, -8); q.lineTo(28, 4); q.lineTo(10, 6); q.lineTo(6, -18); q.lineTo(-6, -18); q.lineTo(-10, 6); q.lineTo(-28, 4); q.closePath(); }, fill: q => D.lin(q, -36, 0, 36, 0, ['#E9EEF5', '#C3CCD9', '#8E9AAD'])},
    {path: q => { q.moveTo(-2, -66); q.bezierCurveTo(10, -92, 40, -96, 52, -78); q.bezierCurveTo(36, -82, 22, -74, 12, -60); q.closePath(); }, fill: trim}], RIM, 2.4);
  g.fillStyle = tier === 6 ? '#FFE58A' : trim; g.fillRect(-36, -22, 72, 6); g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); D.ell(g, -14, -46, 8, 14, -0.4); g.fill();
  g.fillStyle = '#2B2D42'; g.fillRect(-26, -14, 18, 5); g.fillRect(8, -14, 18, 5);
  gem(g, 0, -30, 6, tier, t); }
function amulet(g, tier, t){ const R = RAR[tier];
  g.strokeStyle = '#C99A2E'; g.lineWidth = 3; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(-34, -86); g.quadraticCurveTo(-30, -26, 0, -18); g.quadraticCurveTo(30, -26, 34, -86); g.stroke(); g.setLineDash([]);
  D.piece(g, [{path: q => D.star(q, 0, 4, 30, 22, 8, -Math.PI / 2), fill: q => D.rad(q, -6, -4, 2, 32, ['#FFF0A8', '#FFC21A', '#B37A00'])}, {path: q => D.ell(q, 0, -20, 7, 6), fill: '#E3B23C'}], RIM, 2.2);
  g.save(); g.translate(0, 4); const r = 16; g.beginPath(); D.ell(g, 0, 0, r, r); g.fillStyle = tier === 5 ? rainbow(g, -r, -r, r, r, t) : D.rad(g, -5, -5, 2, r, [D.sh(R.col, 0.6), R.col, R.dark]); g.fill(); g.strokeStyle = RIM; g.lineWidth = 2; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); D.ell(g, -5, -6, 5, 3.4, -0.6); g.fill(); g.restore(); }
function weapon(g, tier, t){ if(window.AvWeapons && AvWeapons.idx){ AvWeapons.draw(g, AvWeapons.idx('sword', 1), 0, 0, 110, {t, tilt: 0.5}); return; }   // the live 🗡️ Weapons family (AvatarKit)
  if(window.AvWeapons && !AvWeapons.idx){ AvWeapons.draw(g, 'sword', 1, 0, 0, 110, {t, tilt: 0.5}); return; }   // the R0a draft painter (sheets page)
  // no AvWeapons on the page → a simple blade on the same rules (one rim, trim = tier colour)
  const R = RAR[tier], trim = tier === 5 ? rainbow(g, -10, 0, 10, 0, t) : R.col; g.save(); g.rotate(0.5);
  D.piece(g, [{path: q => { q.moveTo(-6, -8); q.lineTo(-5, -92); q.lineTo(0, -104); q.lineTo(5, -92); q.lineTo(6, -8); q.closePath(); }, fill: q => D.lin(q, -6, 0, 6, 0, ['#F4F7FB', '#C3CCD9', '#8E9AAD'])},
    {path: q => D.rr(q, -22, -10, 44, 9, 4), fill: trim}, {path: q => D.rr(q, -4, -2, 8, 26, 3), fill: '#8A5A36'}, {path: q => D.ell(q, 0, 27, 6, 6), fill: trim}], RIM, 2.2);
  g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(-1.5, -88, 2, 74); g.restore(); }
const KINDS = [['⚔️', 'Weapon', 'Steel Blade (one look)', weapon], ['🪖', 'Wear', 'Plume helm', helm], ['📿', 'Accessory', 'Sun amulet', amulet]];
// pouch things (no slots): materials, coins, shards
function coin(g, x, y, r, t, tilt){ const sq = Math.abs(Math.cos((t || 0) * 3 + (tilt || 0))) * 0.75 + 0.25; g.save(); g.translate(x, y); g.scale(sq, 1);
  g.beginPath(); D.ell(g, 0, 0, r, r); g.fillStyle = D.rad(g, -r * 0.3, -r * 0.3, 1, r, ['#FFF3A8', '#FFC21A', '#C98600']); g.fill(); g.strokeStyle = '#8A5A00'; g.lineWidth = Math.max(1, r * 0.14); g.stroke();
  g.beginPath(); D.ell(g, 0, 0, r * 0.62, r * 0.62); g.strokeStyle = 'rgba(138,90,0,0.55)'; g.lineWidth = Math.max(0.8, r * 0.1); g.stroke(); g.restore(); }
function shard(g, x, y, r){ D.piece(g, [{path: q => { q.moveTo(x, y - r); q.lineTo(x + r * 0.55, y - r * 0.1); q.lineTo(x + r * 0.2, y + r); q.lineTo(x - r * 0.45, y + r * 0.3); q.lineTo(x - r * 0.5, y - r * 0.4); q.closePath(); }, fill: q => D.lin(q, x - r, y - r, x + r, y + r, ['#FFFFFF', '#BFE9FF', '#8FD6F5'])}], '#3A6E9A', Math.max(1, r * 0.12)); D.sparkle(g, x + r * 0.5, y - r * 0.6, r * 0.35, '#fff'); }
function ore(g, x, y, r, col){ D.piece(g, [{path: q => { q.moveTo(x - r, y + r * 0.5); q.lineTo(x - r * 0.6, y - r * 0.5); q.lineTo(x + r * 0.1, y - r); q.lineTo(x + r, y - r * 0.2); q.lineTo(x + r * 0.8, y + r * 0.6); q.closePath(); }, fill: q => D.lin(q, x, y - r, x, y + r, [D.sh(col, 0.35), col, D.sh(col, -0.35)])}], RIM, Math.max(1, r * 0.12)); }

/* ---------------- chests (Sky Pop) ---------------- */
const CHEST = {wood: ['#C98A4E', '#8E5A2C', '#7A8494'], silver: ['#DDE4EE', '#9AA6B8', '#5E6A7E'], gold: ['#FFD54A', '#D99A00', '#8A5A00'], sky: ['#FFFFFF', '#F3E3A8', '#D9A100']};
function chest(g, x, y, s, kind, lid, t, o){ o = o || {}; const C = CHEST[kind || 'wood'], band = kind === 'wood' ? '#FFC21A' : kind === 'silver' ? '#3A8DFF' : kind === 'gold' ? '#FFFFFF' : '#FFC21A', w = 70 * s, h = 46 * s;
  g.save(); g.translate(x, y); if(o.rot) g.rotate(o.rot); if(o.sq) g.scale(1 + o.sq, 1 - o.sq);
  g.fillStyle = 'rgba(40,60,90,0.22)'; g.beginPath(); D.ell(g, 0, 4 * s, w * 0.6, 8 * s); g.fill();
  if(kind === 'sky'){ puff(g, -w * 0.5, -6 * s, s * 1.2); puff(g, w * 0.52, -4 * s, s * 1.1); }
  D.piece(g, [{path: q => D.rr(q, -w / 2, -h, w, h, 8 * s), fill: q => D.lin(q, 0, -h, 0, 0, [C[0], C[1]])}], RIM, 2.4 * s);
  g.fillStyle = band; g.fillRect(-w / 2 + 10 * s, -h, 7 * s, h); g.fillRect(w / 2 - 17 * s, -h, 7 * s, h);
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(-w / 2 + 4 * s, -h + 4 * s, w - 8 * s, 4 * s);
  // lid: hinged at the back-top; lid 0 = shut, 1 = wide open
  // opening: dark inside + warm light, lid flung up + back (thinner as it turns away)
  if(lid){ g.fillStyle = '#3A2414'; g.beginPath(); D.ell(g, 0, -h, w * 0.46, 7 * s); g.fill(); }
  g.save(); g.translate(0, -h);
  if(lid){ g.translate(-w * 0.1 * lid, -30 * s * lid); g.rotate(-0.32 * lid); g.scale(1, 1 - lid * 0.42); }
  D.piece(g, [{path: q => { q.moveTo(-w / 2 - 2 * s, 2 * s); q.quadraticCurveTo(-w / 2, -30 * s, 0, -32 * s); q.quadraticCurveTo(w / 2, -30 * s, w / 2 + 2 * s, 2 * s); q.closePath(); }, fill: q => D.lin(q, 0, -32 * s, 0, 2 * s, [D.sh(C[0], 0.25), C[0]])}], RIM, 2.4 * s);
  g.fillStyle = band; g.fillRect(-w / 2 + 10 * s, -28 * s, 7 * s, 30 * s); g.fillRect(w / 2 - 17 * s, -28 * s, 7 * s, 30 * s);
  if(lid){ g.fillStyle = D.sh(C[1], -0.35); g.beginPath(); D.ell(g, 0, 1 * s, w * 0.5, 4 * s); g.fill(); }
  g.restore();
  if(!lid){ D.piece(g, [{path: q => D.rr(q, -9 * s, -h - 8 * s, 18 * s, 20 * s, 4 * s), fill: kind === 'gold' ? '#FFFFFF' : '#FFC21A'}], RIM, 2 * s); g.fillStyle = RIM; g.beginPath(); D.ell(g, 0, -h + 1 * s, 2.6 * s, 3 * s); g.fill(); }
  else { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = D.rad(g, 0, -h, 2, 40 * s, [[0, 'rgba(255,240,180,0.95)'], [1, 'rgba(255,240,180,0)']]); g.beginPath(); D.ell(g, 0, -h, 34 * s, 10 * s); g.fill(); g.restore(); }
  if(kind === 'sky'){ bigWing(g, -w / 2 + 4 * s, -h * 0.55, s * 0.62, -1, t); bigWing(g, w / 2 - 4 * s, -h * 0.55, s * 0.62, 1, t); if(!lid) sunCrest(g, 0, -h - 34 * s, 9 * s, t); }
  g.restore(); }
// a rarity beam (on the map, or out of a chest)
function beam(g, x, y, h, w, tier, t){ const R = RAR[tier], col = tier === 5 ? '#D8B8FF' : tier === 6 ? '#FFF2B0' : R.col; g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = D.lin(g, 0, y - h, 0, y, [D.rgba(col, 0), D.rgba(col, 0.55), D.rgba(col, 0.85)]); g.beginPath(); g.moveTo(x - w * 0.5, y); g.lineTo(x - w * 0.32, y - h); g.lineTo(x + w * 0.32, y - h); g.lineTo(x + w * 0.5, y); g.closePath(); g.fill();
  g.fillStyle = D.lin(g, 0, y - h, 0, y, ['rgba(255,255,255,0)', 'rgba(255,255,255,0.7)']); g.fillRect(x - w * 0.08, y - h * 0.9, w * 0.16, h * 0.9);
  g.fillStyle = D.rgba(col, 0.6); g.beginPath(); D.ell(g, x, y, w * 0.75, w * 0.22); g.fill(); g.restore();
  const r = D.rnd(tier * 7 + 3); for(let i = 0; i < 5; i++){ const yy = y - ((r() * h + (t || 0) * 40) % h); D.sparkle(g, x + (r() - 0.5) * w * 0.7, yy, 2.5 + r() * 3, i % 2 ? '#fff' : col); } }
function coins(g, x, y, n, spread, t, seed){ const r = D.rnd(seed || 9); for(let i = 0; i < n; i++){ const a = -Math.PI / 2 + (r() - 0.5) * 1.6, v = 0.4 + r() * 0.6, p = ((t || 0) * 0.9 + r()) % 1; const px = x + Math.cos(a) * spread * v * p * 1.4, py = y + Math.sin(a) * spread * v * p * 2 + p * p * spread * 1.1; coin(g, px, py, 6 + r() * 4, t, i); } }
// a cloud wrap around a 🌈 / ☀️ drop: taps 0 → 3 (3 = burst)
function cloudWrap(g, x, y, s, taps, t, tier){ const crack = taps, col = tier === 5 ? '#C69CFF' : '#FFC21A';
  g.save(); g.translate(x, y);
  if(taps >= 3){ const r = D.rnd(4); for(let i = 0; i < 9; i++){ const a = i * TAU / 9 + r() * 0.4, d = (70 + r() * 30) * s; puff(g, Math.cos(a) * d, Math.sin(a) * d * 0.8, s * (0.7 + r() * 0.5), 'rgba(255,255,255,0.92)'); } g.restore(); return; }
  const wob = taps ? Math.sin((t || 0) * 30) * 0.06 * taps : 0; g.rotate(wob);
  if(taps) D.glow(g, 0, 0, (60 + taps * 26) * s, col, 0.25 + taps * 0.15);
  g.fillStyle = 'rgba(80,140,200,0.2)'; g.beginPath(); D.ell(g, 0, 58 * s, 56 * s, 10 * s); g.fill();
  const B = [[0, -6, 46], [-36, 8, 32], [36, 10, 33], [-18, -34, 28], [22, -32, 30], [0, 26, 36], [-44, -14, 22], [46, -10, 22]];
  g.save(); g.shadowColor = 'rgba(60,110,170,0.3)'; g.shadowBlur = 14 * s; g.shadowOffsetY = 5 * s; g.fillStyle = '#FFFFFF'; g.beginPath(); B.forEach(b => D.ell(g, b[0] * s, b[1] * s, b[2] * s, b[2] * s)); g.fill(); g.restore();
  g.fillStyle = D.lin(g, 0, -60 * s, 0, 60 * s, ['rgba(255,255,255,0)', 'rgba(143,214,245,0.25)']); g.beginPath(); B.forEach(b => D.ell(g, b[0] * s, b[1] * s, b[2] * s, b[2] * s)); g.fill();
  // ribbon + bow in the tier colour
  g.fillStyle = tier === 5 ? rainbow(g, -50 * s, 0, 50 * s, 0, t) : '#FFC21A'; g.fillRect(-58 * s, -4 * s, 116 * s, 9 * s);
  D.piece(g, [{path: q => { q.moveTo(0, -4 * s); q.bezierCurveTo(-20 * s, -26 * s, -30 * s, 6 * s, 0, 2 * s); q.bezierCurveTo(30 * s, 6 * s, 20 * s, -26 * s, 0, -4 * s); }, fill: tier === 5 ? '#B98BFF' : '#FFB000'}], RIM, 1.6 * s);
  // cracks of light
  if(crack){ g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,250,220,0.95)'; g.lineWidth = 3 * s; g.lineCap = 'round';
    const C = [[[-10, -40], [-4, -24], [-14, -12], [-6, 0]], [[24, -26], [16, -12], [28, -2], [20, 14]], [[-34, 4], [-22, 14], [-30, 26]]];
    for(let i = 0; i < Math.min(3, crack + (crack > 1 ? 1 : 0)); i++){ g.beginPath(); C[i].forEach((p, j) => j ? g.lineTo(p[0] * s, p[1] * s) : g.moveTo(p[0] * s, p[1] * s)); g.stroke(); } g.restore();
    for(let i = 0; i < crack * 3; i++){ const a = i * 2.1; D.sparkle(g, Math.cos(a) * 62 * s, Math.sin(a) * 50 * s, (4 + (i % 3) * 2) * s, i % 2 ? '#fff' : col); } }
  g.restore(); }
// 🎰 the boss wheel: slices = the source's real weights; pointer at the top; ang = wheel turn
function wheel(g, x, y, r, slices, ang, o){ o = o || {}; const tot = slices.reduce((a, b) => a + b[1], 0); g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(40,60,90,0.25)'; g.beginPath(); D.ell(g, 0, r + 14, r * 0.85, 12); g.fill();
  // stand
  D.piece(g, [{path: q => { q.moveTo(-r * 0.32, r + 10); q.lineTo(-r * 0.12, r * 0.2); q.lineTo(r * 0.12, r * 0.2); q.lineTo(r * 0.32, r + 10); q.closePath(); }, fill: '#9B5DE5'}], RIM, 2.4);
  g.beginPath(); D.ell(g, 0, 0, r + 12, r + 12); g.fillStyle = D.lin(g, 0, -r, 0, r, ['#FFE58A', '#FFB000']); g.fill(); g.strokeStyle = RIM; g.lineWidth = 3; g.stroke();
  for(let i = 0; i < 16; i++){ const a = i * TAU / 16; g.fillStyle = i % 2 ? '#FFFFFF' : '#FF7A2E'; g.beginPath(); D.ell(g, Math.cos(a) * (r + 6), Math.sin(a) * (r + 6), 3.2, 3.2); g.fill(); }
  g.save(); g.rotate(ang || 0); let a0 = -Math.PI / 2;
  slices.forEach((sl, i) => { const da = sl[1] / tot * TAU, R = RAR[sl[0]]; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a0, a0 + da); g.closePath();
    if(sl[0] === 5){ g.save(); g.clip(); g.fillStyle = '#F4ECFF'; g.fillRect(-r, -r, 2 * r, 2 * r); RB.forEach((cl, k) => { g.beginPath(); g.arc(0, 0, r * (0.98 - k * 0.09), 0, TAU); g.arc(0, 0, r * (0.9 - k * 0.09), 0, TAU, true); g.fillStyle = cl; g.fill(); }); g.restore(); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a0, a0 + da); g.closePath(); }
    else { g.fillStyle = D.rad(g, 0, 0, r * 0.2, r, [D.sh(R.col, 0.45), R.col]); g.fill(); }
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke();
    const am = a0 + da / 2; g.save(); g.rotate(am); g.translate(r * 0.66, 0); g.rotate(Math.PI / 2); gem(g, 0, 0, Math.max(7, r * 0.1), sl[0], 0);
    if(sl[2]) D.txt(g, sl[2], 0, r * 0.2, {size: Math.max(10, r * 0.1), align: 'center', col: '#fff', stroke: 'rgba(0,0,0,0.35)', sw: 3}); g.restore(); a0 += da; });
  if(o.blur){ g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 4; for(let i = 0; i < 6; i++){ g.beginPath(); g.arc(0, 0, r * (0.3 + i * 0.11), i, i + 1.6); g.stroke(); } }
  g.restore();
  D.piece(g, [{path: q => D.ell(q, 0, 0, r * 0.17, r * 0.17), fill: q => D.rad(q, -4, -4, 1, r * 0.17, ['#FFFFFF', '#CFEFFF'])}], RIM, 2.4); puff(g, 0, 1, r * 0.012);
  // pointer
  D.piece(g, [{path: q => { q.moveTo(-14, -r - 26); q.lineTo(14, -r - 26); q.lineTo(0, -r + 10); q.closePath(); }, fill: q => D.lin(q, 0, -r - 26, 0, -r + 10, ['#FF9A5A', '#FF5A2E'])}], RIM, 2.4);
  g.restore(); }
// 🍀 lucky meter: n steps, f filled
function lucky(g, x, y, w, n, f, o){ o = o || {}; const step = w / n, h = 26; D.card(g, x, y, w, h, {fill: '#EEF7E8', r: h / 2, shadow: false, line: '#9ED38A', lw: 2});
  for(let i = 0; i < n; i++){ const cx = x + step * (i + 0.5), on = i < f; g.save(); g.translate(cx, y + h / 2); const c = on ? '#4CC764' : '#CFD8CA';
    [0, 1, 2, 3].forEach(k => { g.save(); g.rotate(k * Math.PI / 2 + Math.PI / 4); g.fillStyle = c; g.beginPath(); D.ell(g, 0, -5.5, 4.6, 5.8); g.fill(); g.restore(); }); g.fillStyle = on ? '#2A8F43' : '#B7C2B0'; g.beginPath(); D.ell(g, 0, 0, 2, 2); g.fill(); g.restore(); }
  if(o.label) D.txt(g, o.label, x + w + 10, y + h * 0.72, {size: 14, col: INK}); }
// 📬 the inn mailbox
function mailbox(g, x, y, s, n, t){ g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(40,60,90,0.2)'; g.beginPath(); D.ell(g, 0, 2, 26, 6); g.fill();
  D.piece(g, [{path: q => D.rr(q, -4, -56, 8, 58, 2), fill: '#8A5A36'}, {path: q => { q.moveTo(-26, -54); q.lineTo(-26, -80); q.quadraticCurveTo(-26, -96, 0, -96); q.quadraticCurveTo(26, -96, 26, -80); q.lineTo(26, -54); q.closePath(); }, fill: q => D.lin(q, -26, 0, 26, 0, ['#5BB0FF', '#3A8DFF', '#2163C8'])}], RIM, 2.4);
  g.fillStyle = '#FFFFFF'; g.fillRect(-18, -72, 36, 4); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(-20, -90, 6, 30);
  const up = n > 0; g.save(); g.translate(26, -70); g.rotate(up ? -1.35 : 0); D.piece(g, [{path: q => D.rr(q, 0, -3, 22, 6, 2), fill: '#8A5A36'}, {path: q => D.rr(q, 14, -14, 12, 12, 2), fill: '#FF5A5A'}], RIM, 1.6); g.restore();
  if(up){ g.save(); g.translate(-10, -60); g.rotate(-0.25 + Math.sin((t || 0) * 2) * 0.05); D.piece(g, [{path: q => D.rr(q, -14, -12, 30, 20, 2), fill: '#FFF8E8'}], RIM, 1.4); g.strokeStyle = '#E2B07A'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-14, -12); g.lineTo(1, -1); g.lineTo(16, -12); g.stroke(); g.restore();
    D.card(g, 12, -112, 26, 26, {fill: '#FF5A5A', r: 13, shadow: false, line: '#fff', lw: 2.5}); D.txt(g, String(n), 25, -93, {size: 15, align: 'center', col: '#fff'}); }
  g.restore(); }
// an item card (frame + art) at any size
function itemCard(g, x, y, w, h, kind, tier, t, o){ o = o || {}; frame(g, x, y, w, h, tier, t, o); const K = KINDS[kind], pad = Math.min(w, h) * 0.14;
  D.fit(g, 'lk:' + kind + ':' + tier, q => K[3](q, tier, t || 0), x + pad, y + pad * 0.8, w - pad * 2, h - pad * (o.label ? 2.4 : 1.8)); }
LD = {feather, bigWing, sunBurst, skyBack, sunCrest, cloudBank, RAR, RB, rainbow, gem, frame, rays, wing, puff, helm, amulet, weapon, KINDS, coin, shard, ore, chest, CHEST, beam, coins, cloudWrap, wheel, lucky, mailbox, itemCard};
})();
/* 🧳 Avateer — R0d 🎁 LootKit core (av-r0d3). In the sheets page it runs after 14_loot.js (window.LootDraft); in LootKit.html the build makes it the kit body (LD = the painters).
   Engine (rolls · lucky meter · sets · daily · bag) is pure; shows / bag sheet / book are DOM + canvas. No emoji inside canvas art (DOM labels may use them). */
(function(){
'use strict';
const P = (typeof LD !== 'undefined' && LD) ? LD : window.LootDraft, D = window.AVD || (typeof AVD !== 'undefined' ? AVD : null);
if(!P || !D) return;
const TAU = Math.PI * 2, RAR = P.RAR, VERSION = 'av-r0g2';
/* ---------------- rng ---------------- */
function hash(s){ s = String(s); let h = 2166136261 >>> 0; for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed){ let a = (typeof seed === 'number' ? seed >>> 0 : hash(seed)) || 1; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function pickW(w, r){ let tot = 0; w.forEach(x => tot += x || 0); let v = r() * tot; for(let i = 0; i < w.length; i++){ v -= w[i] || 0; if(v < 0) return i; } for(let i = w.length - 1; i >= 0; i--) if(w[i]) return i; return 0; }
function today(d){ d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
const clone = o => JSON.parse(JSON.stringify(o));
/* ---------------- sources (Avateer plan §17q — Aowu's ranges, weights inside) ---------------- */
const SRC = {
  monster: {name: 'Monster',       icon: '👾', drop: 0.12, w: [75, 25],                coins: 3,   show: 'beam'},
  elite:   {name: 'Elite monster', icon: '⭐', drop: 0.30, w: [40, 45, 15],            coins: 8,   show: 'beam'},
  mini:    {name: 'Mini boss',     icon: '⚠️', drop: 1, extra: 0.30, w: [0, 35, 50, 15], coins: 25,  show: 'chest', chest: 'silver', meter: true},
  boss:    {name: 'Boss',          icon: '👑', drop: 1, w: [0, 0, 0, 75, 25],          coins: 80,  show: 'chest', chest: 'gold', meter: true, firstSet: true, setChance: 0.35},
  hidden:  {name: 'Hidden boss',   icon: '🌑', drop: 1, w: [0, 0, 0, 0, 80, 20],       coins: 120, show: 'chest', chest: 'gold', meter: true, relic: true, setChance: 0.25},
  eboss:   {name: 'Elite boss',    icon: '👑', drop: 1, n: 2, w: [0, 0, 0, 0, 60, 40], coins: 150, show: 'wheel', meter: true, daily: true, setTier: 5},
  awaken:  {name: 'Awakened boss', icon: '☀️', drop: 1, w: [0, 0, 0, 0, 0, 0, 100],    coins: 200, show: 'chest', chest: 'sky', daily: true, sky: true}};
const LUCK_STEPS = 5, SOCK = [0, 0, 1, 1, 2, 2, 3], NBONUS = [0, 1, 1, 2, 3, 3, 4], TMUL = [1, 1.15, 1.35, 1.6, 1.9, 2.25, 2.7];
const STATS = [['hp', '❤️', 'HP'], ['pow', '⚔️', 'Power'], ['grd', '🛡️', 'Guard'], ['spd', '💨', 'Speed'], ['lck', '🍀', 'Luck'], ['chm', '💖', 'Charm']];
const SHARDS = {4: 1, 5: 2, 6: 3};
/* 🧱 materials (av-r0d4, Aowu 23:45 "monsters also give materials"): one registry for the 🧪 Pouch — a game adds its own with Loot.addMat(pack, {id: {name, icon}}) */
const MATS = {scrap: {name: 'Scrap', icon: '🔩'}, spark: {name: 'Spark', icon: '✨'}, evolve: {name: 'Evolve stone', icon: '💠'}, herb: {name: 'Herb', icon: '🌿'}, ore: {name: 'Ore', icon: '🪨'},
  wood: {name: 'Wood', icon: '🪵'}, bone: {name: 'Bone', icon: '🦴'}, goo: {name: 'Goo', icon: '🫧'}, feather: {name: 'Feather', icon: '🪶'}, shell: {name: 'Shell', icon: '🐚'}, gem: {name: 'Gem shard', icon: '💎'}};
const MAT_POOL = ['herb', 'ore', 'wood', 'bone'];
// [chance, min, max] per source — every fight can give materials (ctx.matPool = the monster's own list, ctx.noMats = none)
const MAT_DROP = {monster: [0.6, 1, 1], elite: [0.85, 1, 2], mini: [1, 2, 3], boss: [1, 3, 5], hidden: [1, 3, 5], eboss: [1, 4, 6], awaken: [1, 4, 6]};
function addMat(pack, defs){ Object.keys(defs || {}).forEach(k => { MATS[k.indexOf('.') >= 0 || !pack ? k : pack + '.' + k] = Object.assign({name: k, icon: '📦'}, defs[k]); }); return MATS; }
const matName = id => (MATS[id] || {}).name || id, matIcon = id => (MATS[id] || {}).icon || '📦';
/* 🍳 cooking ingredients (av-r0g) — gathered on each island, cooked into its 🍙 food */
Object.assign(MATS, {mango: {name: 'Mango', icon: '🥭'}, grain: {name: 'Rice grain', icon: '🌾'}, fish: {name: 'Fish', icon: '🐟'}, coconut: {name: 'Coconut', icon: '🥥'}, banana: {name: 'Banana', icon: '🍌'},
  cactus: {name: 'Cactus pad', icon: '🌵'}, honey: {name: 'Honey', icon: '🍯'}, chili: {name: 'Chili', icon: '🌶️'}, seagrape: {name: 'Sea grapes', icon: '🍇'}, moonmilk: {name: 'Moon milk', icon: '🥛'}, strawberry: {name: 'Strawberry', icon: '🍓'}});
/* 🔥 the 8 elements (= the monsters' elements, CreatureKit EL) + their CORES (av-r0g, Aowu 2026-11-18 "elemental crafting on weapon, since monsters have 8 elements") */
const ELS = {fire: {icon: '🔥', name: 'Fire', c: '#FF7A2E', core: 'Ember core'}, water: {icon: '💧', name: 'Water', c: '#3A9BFF', core: 'Tide pearl'}, leaf: {icon: '🌱', name: 'Leaf', c: '#4CB13A', core: 'Sprout seed'},
  rock: {icon: '🪨', name: 'Rock', c: '#A07850', core: 'Stone heart'}, wind: {icon: '🌪️', name: 'Wind', c: '#3FC9B8', core: 'Gust feather'}, bolt: {icon: '⚡', name: 'Bolt', c: '#FFC81A', core: 'Spark coil'},
  star: {icon: '✨', name: 'Star', c: '#FF8FD8', core: 'Star dust'}, dark: {icon: '🌑', name: 'Shadow', c: '#7A5CC8', core: 'Shade gem'}};
Object.keys(ELS).forEach(k => { MATS['core.' + k] = {name: ELS[k].core, icon: ELS[k].icon, core: k}; });
// [chance, min, max] of the monster's own element core per source (ctx.el = the monster's element)
const CORE_DROP = {monster: [0.25, 1, 1], elite: [0.5, 1, 1], mini: [1, 1, 2], boss: [1, 2, 3], hidden: [1, 2, 3], eboss: [1, 3, 4], awaken: [1, 3, 4]};
/* ⚔️ element damage (Aowu 2026-11-18 12:52 ✅): strong ×1.5 · normal ×1 · weak ×0.7 · same ×0.75 · plain (no element) ×0.9 · ✨ Star ↔ 🌑 Shadow ×1.5 both ways
   wheels: 🔥 > 🌱 > 💧 > 🔥 · 🪨 > ⚡ > 🌪️ > 🪨 · forged level +5 % each (weapon) · 🧙 a forged STAFF powers up spells of ITS element +10 % a level (Aowu 12:59 "for a wizard mage, a element forge enhances that use element") */
const BEATS = {fire: 'leaf', leaf: 'water', water: 'fire', rock: 'bolt', bolt: 'wind', wind: 'rock', star: 'dark', dark: 'star'};
const EL_MULT = {strong: 1.5, normal: 1, weak: 0.7, same: 0.75, plain: 0.9}, EL_LV = 0.05, SPELL_LV = 0.1, EL_MAX = 5;
function elVs(atk, def){ if(!atk) return 'plain'; if(!def) return 'normal'; if(atk === def) return 'same'; if(BEATS[atk] === def) return 'strong'; if(BEATS[def] === atk) return 'weak'; return 'normal'; }
function elMult(atk, def, lv){ const k = elVs(atk, def); return {k, x: +(EL_MULT[k] * (atk && lv ? 1 + EL_LV * Math.min(EL_MAX, lv) : 1)).toFixed(3), arrow: k === 'strong' ? '⬆️' : k === 'weak' || k === 'same' ? '⬇️' : ''}; }
// weapon hit: the forged element of the weapon vs the monster · spell hit: the spell's element vs the monster, × the staff's boost when the staff carries THAT element
function hitMult(it, defEl){ return elMult(it && it.el || null, defEl, it && it.elv); }
function spellMult(staff, spellEl, defEl){ const m = elMult(spellEl, defEl, 0), b = staff && staff.el && staff.el === spellEl ? 1 + SPELL_LV * Math.min(EL_MAX, staff.elv || 1) : 1; return {k: m.k, x: +(m.x * b).toFixed(3), boost: b, arrow: m.arrow}; }
// cores needed to forge / level an element (Lv 1 · 2 · 3 · 4 · 5)
const FORGE_COST = [3, 5, 8, 12, 18];
function forge(it, el, lv){ if(!ELS[el]) return {ok: false, why: 'element'}; const was = it.el === el ? (it.elv || 0) : 0, to = Math.min(EL_MAX, lv == null ? was + 1 : lv);
  const back = it.el && it.el !== el ? Math.floor(FORGE_COST.slice(0, it.elv || 1).reduce((a, b) => a + b, 0) / 2) : 0;   // swapping gives half the old cores back
  const was_el = it.el; it.el = el; it.elv = to; return {ok: true, el, lv: to, back, backCore: was_el && back ? 'core.' + was_el : null}; }   // a duplicate set piece after the set is complete → ☁️ shards
/* 🍙 consumables (av-r0g, Aowu 2026-11-17 23:45 + 2026-11-18: "consumable, potion / craft / food" · "food based on island, different food different effect")
   Loot.addUse(pack, {id: {name, icon, island, eff: [{k, v, turns | fights | drops}], cook: {mat: n}, paint(g)}}) · stacks ×99 in the 🎒 bag (B.u) · 3-slot ⚔️ quick bar (B.qb)
   eff k: heal · hot (heal each turn) · power · shield · luck · speed · dodge · fire · cost · all · clear · drops — the GAME applies them; LootKit stores, shows and hands them out */
const USE_MAX = 99, QB_N = 3, AUTO_UNDER = 0.3, USES = {}, POTIONS = [];   // 🤖 auto-heal when HP < 30 %
const ISLES = {jungle: '🌴 Jungle', beach: '🏖️ Beach', cove: '🥥 Coconut cove', farm: '🌾 Farm', desert: '🏜️ Desert', snow: '❄️ Snow', lava: '🌋 Lava', coral: '🌊 Coral', moon: '🚀 Moon', kingdom: '🏰 Kingdom'};
const EFF = {heal: ['❤️', 'Heal'], hot: ['❤️', 'Heal each turn'], power: ['⚔️', 'Power'], shield: ['🛡️', 'Shield'], luck: ['🍀', 'Luck'], speed: ['💨', 'Speed'], dodge: ['🌀', 'Dodge'],
  fire: ['🔥', 'Fire damage'], cost: ['🌟', 'Aura cost'], all: ['⭐', 'Everything'], clear: ['✨', 'Clears burn · dizzy'], drops: ['🍀', 'Lucky drops'], aura: ['🌟', 'Aura']};   // 🌟 Aura = the skill bar (Aowu 13:37 "aura ok")
// one row per effect: [icon, words, value]
function effRow(e){ const E = EFF[e.k] || ['•', e.k], when = e.turns ? (e.k === 'hot' ? ' × ' + e.turns : ' · ' + e.turns + ' turns') : e.fights ? (e.fights === 1 ? ' · next fight' : ' · ' + e.fights + ' fights') : '';
  const v = e.k === 'clear' ? '✓' : e.k === 'drops' ? 'next ' + e.v : e.k === 'cost' ? '−' + e.v : e.k === 'luck' || e.k === 'speed' || e.k === 'aura' ? '+' + e.v : e.k === 'shield' ? e.v + ' % HP' : e.k === 'heal' || e.k === 'hot' ? e.v + ' %' : '+' + e.v + ' %';
  return [E[0], E[1] + when, v]; }
function addUse(pack, defs){ const ids = []; Object.keys(defs || {}).forEach(k => { const id = pack ? pack + '.' + k : k; USES[id] = Object.assign({id, name: k, icon: '🍙', eff: []}, defs[k]); ids.push(id); }); return ids; }
const useDef = id => USES[id] || null, useName = id => (USES[id] || {}).name || id;
// rare potions from tough fights (own random, items unchanged)
const USE_DROP = {elite: 0.15, mini: 0.3, boss: 0.5, hidden: 0.5, eboss: 0.6, awaken: 0.6};
function range(src){ const w = SRC[src].w; let lo = 0, hi = 0; w.forEach((x, i) => { if(x){ if(!w.slice(0, i).some(Boolean)) lo = i; hi = i; } }); return [lo, hi]; }
/* ---------------- items ---------------- */
const ITEMS = {}, BLOCKS = [];
function add(pack, defs, meta){ const ids = []; Object.keys(defs || {}).forEach(k => { const id = pack + '.' + k, d = Object.assign({id, pack, kind: 'thing'}, defs[k]);
    if(typeof d.paint !== 'function') throw new Error('Loot.add: ' + id + ' needs paint(g, tier, t)'); ITEMS[id] = d; ids.push(id); });
  BLOCKS.push(Object.assign({pack, ids}, meta || {})); return ids; }
function get(id){ return ITEMS[id] || null; }
function list(o){ o = o || {}; return Object.keys(ITEMS).filter(id => (!o.kind || ITEMS[id].kind === o.kind) && (!o.pack || ITEMS[id].pack === o.pack) && (o.demo || o.pack === 'demo' || ITEMS[id].pack !== 'demo')); }
function mkItem(base, tier, lv, r, extra){ return Object.assign({base, tier, lv: lv || 1, seed: Math.floor(r() * 1e9), sock: SOCK[tier], runes: []}, extra || {}); }
const STAR_MAX = 5, STAR_POW = 0.08;   // ⬆️ ★1 → ★5 at the 🔨 Blacksmith (CraftKit, av-r0i): each ★ = +8 % gear power, saved as x.k
function power(it){ return Math.round((10 + (it.lv || 1) * 4) * TMUL[it.tier] * (1 + STAR_POW * (Math.min(STAR_MAX, it.star || 1) - 1))); }
function price(it){ return Math.round(5 * (it.tier + 1) * (it.tier + 1) * (1 + (it.lv || 1) / 10)); }
function bonus(it){ const r = rng(it.seed + 7), n = NBONUS[it.tier], left = STATS.slice(), out = [];
  for(let i = 0; i < n && left.length; i++){ const s = left.splice(Math.floor(r() * left.length), 1)[0], v = Math.max(1, Math.round((1 + (it.lv || 1) * 0.6) * (1 + it.tier * 0.5) * (0.7 + r() * 0.6) * (s[0] === 'hp' ? 8 : 1)));
    out.push({k: s[0], icon: s[1], name: s[2], v}); } return out; }
function recycleOf(it){ const m = {scrap: (it.tier + 1) * 2}; if(it.tier >= 3) m.spark = it.tier - 2; return m; }
/* ---------------- rolls ---------------- */
function freshState(){ return {luck: 0, sets: {}, day: {}, won: {}, shards: 0}; }
function missing(st, set){ if(!set) return []; const have = st.sets[set.id] || []; return set.pieces.filter(p => have.indexOf(p) < 0); }
function roll(src, ctx){ ctx = ctx || {}; const S = SRC[src]; if(!S) throw new Error('Loot.roll: unknown source ' + src);
  const seed = ctx.seed == null ? Date.now() : ctx.seed, r = rng(seed), st = Object.assign(freshState(), clone(ctx.state || {})), luck = +ctx.luck || 0, lv = ctx.lv || 1, [lo, hi] = range(src);
  const res = {src, seed, items: [], coins: 0, shards: 0, mats: {}, show: S.show, chest: S.chest || null, first: false, daily: null, luckUp: false, choose: null, state: st};
  const key = ctx.boss || src;
  if(S.daily && ctx.day && st.day[key] === ctx.day){ res.daily = 'done'; res.show = 'none'; return res; }   // fight any time — the reward is once a day
  const pool = ctx.pool && ctx.pool.length ? ctx.pool : list({demo: true}), pick = () => pool[Math.floor(r() * pool.length)];
  const first = !!(ctx.boss && !st.won[ctx.boss]);
  res.coins = Math.round(S.coins * (1 + lv / 10) * (0.8 + r() * 0.4));
  const setPiece = (set, tier) => { const miss = missing(st, set); if(!miss.length){ res.shards += SHARDS[tier] || 1; return null; }
    const p = miss[Math.floor(r() * miss.length)]; (st.sets[set.id] = st.sets[set.id] || []).push(p); const it = mkItem(p, tier, lv, r, {set: set.id}); res.items.push(it); return it; };
  const meter = tier => { if(!S.meter) return tier;
    if(tier >= hi){ st.luck = 0; return tier; }
    if(st.luck >= LUCK_STEPS){ st.luck = 0; res.luckUp = true; return hi; }
    st.luck = Math.min(LUCK_STEPS, st.luck + 1 + Math.min(1, luck / 100)); return tier; };
  if(S.sky){   // ☀️ Awakened: one Sky God piece — first win = you choose, then random missing, complete → shards
    const set = ctx.set, miss = missing(st, set); res.first = first;
    if(!set) res.items.push(mkItem(pick(), 6, lv, r));
    else if(!miss.length) res.shards += SHARDS[6];
    else if(first) res.choose = miss.slice();
    else setPiece(set, 6);
  } else if(S.firstSet && first && ctx.set){ res.first = true; setPiece(ctx.set, ctx.set.tier == null ? 4 : ctx.set.tier); res.mats[ctx.evolve || 'evolve'] = 1; }
  else {
    let n = 0; const p = Math.min(1, S.drop * (1 + Math.min(0.5, luck / 200)));
    if(r() < p) n = S.n || 1; if(n && S.extra && r() < S.extra) n++;
    for(let i = 0; i < n; i++){ const tier = meter(pickW(S.w, r));
      if(S.setTier != null && tier === S.setTier && ctx.set) setPiece(ctx.set, tier); else res.items.push(mkItem(pick(), tier, lv, r)); }
    if(S.setChance && ctx.set && r() < S.setChance) setPiece(ctx.set, ctx.set.tier == null ? 4 : ctx.set.tier);
    if(S.relic && first && ctx.relic){ res.first = true; res.items.push(mkItem(ctx.relic, 5, lv, r, {relic: true})); }
  }
  Object.keys(ctx.mats || {}).forEach(id => { const m = ctx.mats[id]; if(r() < m[0]) res.mats[id] = (res.mats[id] || 0) + m[1] + Math.floor(r() * (m[2] - m[1] + 1)); });
  const cd = CORE_DROP[src]; if(cd && ctx.el && ELS[ctx.el]){ const rc = rng(String(seed) + ':core'); if(rc() < cd[0]){ const k = cd[1] + Math.floor(rc() * (cd[2] - cd[1] + 1)); res.mats['core.' + ctx.el] = (res.mats['core.' + ctx.el] || 0) + k; } }   // 🔥 the monster's element core (own random)
  const pd = USE_DROP[src]; if(pd && !ctx.noUses){ const ru = rng(String(seed) + ':use'); if(ru() < pd){ const id = POTIONS[Math.floor(ru() * POTIONS.length)]; res.uses = res.uses || {}; res.uses[id] = (res.uses[id] || 0) + 1; } }   // 🧪 a rare potion from elites / bosses
  const md = MAT_DROP[src]; if(md && !ctx.noMats){ const rm = rng(String(seed) + ':mat'), mp = ctx.matPool && ctx.matPool.length ? ctx.matPool : MAT_POOL;   // own random → the item rolls stay exactly the same
    if(rm() < Math.min(1, md[0] * (1 + Math.min(0.5, luck / 200)))){ let k = md[1] + Math.floor(rm() * (md[2] - md[1] + 1)); while(k-- > 0){ const id = mp[Math.floor(rm() * mp.length)]; res.mats[id] = (res.mats[id] || 0) + 1; } } }
  if(ctx.boss) st.won[ctx.boss] = (st.won[ctx.boss] || 0) + 1;
  if(S.daily && ctx.day) st.day[key] = ctx.day;
  st.shards += res.shards;
  return res; }
function choose(res, piece, ctx){ ctx = ctx || {}; if(!res.choose || res.choose.indexOf(piece) < 0) return null; const st = res.state, set = ctx.set || {id: (ctx.setId || 'sky')};
  (st.sets[set.id] = st.sets[set.id] || []).push(piece); const it = mkItem(piece, 6, ctx.lv || 1, rng(res.seed + ':' + piece), {set: set.id}); res.items.push(it); res.choose = null; return it; }
function party(src, ctxs){ return (ctxs || []).map(c => roll(src, c)); }
function showFor(src, it){ if(it && it.tier >= 5) return 'cloud'; const S = SRC[src]; return S ? S.show : 'beam'; }
/* ---------------- bag ---------------- */
const MAX_SLOTS = 120, BUY_KEEP = 10;
function pack(it){ const x = {}; if(it.runes && it.runes.length) x.r = it.runes; if(it.star > 1) x.k = it.star; if(it.set) x.s = it.set; if(it.relic) x.x = 1; if(it.el) x.e = [it.el, it.elv || 1]; return [it.base, it.tier, it.lv, it.seed, it.lock ? 1 : 0].concat(Object.keys(x).length ? [x] : []); }
function unpack(a){ const x = a[5] || {}; const it = {base: a[0], tier: a[1] | 0, lv: a[2] | 0 || 1, seed: a[3] | 0, sock: SOCK[a[1] | 0], runes: x.r || []}; if(a[4]) it.lock = true; if(x.s) it.set = x.s; if(x.x) it.relic = true; if(x.e){ it.el = x.e[0]; it.elv = x.e[1] | 0 || 1; } if(x.k) it.star = Math.min(STAR_MAX, x.k | 0); return it; }
function bag(save, o){ o = o || {}; save = save || {};
  const B = {g: (save.g || []).map(unpack), slots: Math.min(MAX_SLOTS, save.slots || o.slots || 40), m: Object.assign({}, save.m), q: Object.assign({}, save.q), u: Object.assign({}, save.u), qb: (save.qb || []).concat([null, null, null]).slice(0, QB_N), qa: !!save.qa,
    mail: (save.mail || []).map(unpack), buy: (save.buy || []).map(unpack), c: save.c | 0, st: Object.assign(freshState(), save.st || {}), s: Object.assign({}, save.s), news: 0};
  const seen = it => { if(B.s[it.base] == null || B.s[it.base] < it.tier) B.s[it.base] = it.tier; };
  const askFor = it => it.tier >= 2;
  Object.assign(B, {
    count(){ return B.g.length; }, free(){ return Math.max(0, B.slots - B.g.length); }, full(){ return B.g.length >= B.slots; },
    get(i){ return B.g[i] || null; },
    add(it){ seen(it); if(B.full()){ B.mail.push(it); return 'mail'; } B.g.push(it); B.news++; return 'bag'; },
    mat(id, n){ B.m[id] = Math.max(0, (B.m[id] || 0) + (n == null ? 1 : n)); if(!B.m[id]) delete B.m[id]; return B.m[id] || 0; },
    use(id, n){ const was = B.u[id] || 0, to = Math.max(0, Math.min(USE_MAX, was + (n == null ? 1 : n))); if(to) B.u[id] = to; else delete B.u[id]; return {n: to, over: Math.max(0, was + (n == null ? 1 : n) - USE_MAX)}; },   // 🍙 stacks ×99 (over the cap = kept out, the game can turn it into coins)
    eat(id){ if(!(B.u[id] > 0)) return {ok: false, why: 'none'}; B.use(id, -1); const d = useDef(id); return {ok: true, id, eff: d ? d.eff.slice() : [], left: B.u[id] || 0}; },   // use one → its effects for the game to apply
    quick(slot, id){ if(slot < 0 || slot >= QB_N) return false; if(id != null && !useDef(id)) return false; B.qb = B.qb.map(x => x === id ? null : x); B.qb[slot] = id == null ? null : id; return true; },
    quickUse(slot){ const id = B.qb[slot]; if(!id) return {ok: false, why: 'empty'}; return Object.assign({slot}, B.eat(id)); },
    autoSlot(){ for(let i = 0; i < QB_N; i++){ const id = B.qb[i], d = id && useDef(id); if(d && (B.u[id] || 0) > 0 && d.eff.some(e => e.k === 'heal' || e.k === 'hot')) return i; } return -1; },   // 🤖 the first ❤️ heal thing on the bar
    autoHeal(hp, o){ o = o || {}; if(!B.qa || !(hp < (o.under || AUTO_UNDER))) return {ok: false, why: B.qa ? 'hp' : 'off'}; const k = B.autoSlot(); if(k < 0) return {ok: false, why: 'none'}; return Object.assign({auto: true}, B.quickUse(k)); },
    quest(id, n){ B.q[id] = Math.max(0, (B.q[id] || 0) + (n == null ? 1 : n)); if(!B.q[id]) delete B.q[id]; return B.q[id] || 0; },
    lock(i, on){ const it = B.g[i]; if(!it) return false; it.lock = on == null ? !it.lock : !!on; if(!it.lock) delete it.lock; return !!it.lock; },
    sell(i, a){ a = a || {}; const it = B.g[i]; if(!it) return {ok: false, why: 'none'};
      if(it.lock) return {ok: false, why: 'locked'}; if(it.tier >= 6) return {ok: false, why: 'sky'};
      const pr = price(it); if(askFor(it) && !a.sure) return {ok: false, ask: true, price: pr, item: it};
      B.g.splice(i, 1); B.c += pr; B.buy.unshift(it); if(B.buy.length > BUY_KEEP) B.buy.length = BUY_KEEP; return {ok: true, coins: pr}; },
    recycle(i, a){ a = a || {}; const it = B.g[i]; if(!it) return {ok: false, why: 'none'}; if(it.lock) return {ok: false, why: 'locked'};
      const m = recycleOf(it), sh = it.tier >= 6 ? 5 : 0; if(askFor(it) && !a.sure) return {ok: false, ask: true, mats: m, shards: sh, item: it};
      B.g.splice(i, 1); Object.keys(m).forEach(k => B.mat(k, m[k])); if(sh) B.st.shards += sh; return {ok: true, mats: m, shards: sh}; },
    buyBack(k){ const it = B.buy[k]; if(!it) return {ok: false, why: 'none'}; const pr = price(it); if(B.c < pr) return {ok: false, why: 'coins', price: pr};
      B.c -= pr; B.buy.splice(k, 1); return {ok: true, where: B.add(it), price: pr}; },
    claim(k){ const it = B.mail[k]; if(!it) return {ok: false, why: 'none'}; if(B.full()) return {ok: false, why: 'full'}; B.mail.splice(k, 1); B.g.push(it); return {ok: true}; },
    claimAll(){ let n = 0; while(B.mail.length && !B.full()){ B.g.push(B.mail.shift()); n++; } return n; },
    upgrade(n){ const was = B.slots; B.slots = Math.min(MAX_SLOTS, B.slots + (n || 10)); B.claimAll(); return B.slots - was; },
    sort(by){ const k = by || 'tier', f = {tier: (a, b) => b.tier - a.tier || b.lv - a.lv, lv: (a, b) => b.lv - a.lv || b.tier - a.tier,
        kind: (a, b) => String((get(a.base) || {}).kind).localeCompare(String((get(b.base) || {}).kind)) || b.tier - a.tier}[k] || null;
      if(f) B.g.sort((a, b) => (b.lock ? 1 : 0) - (a.lock ? 1 : 0) || f(a, b)); return B.g; },
    take(res){ const where = []; (res.items || []).forEach(it => where.push(B.add(it))); B.c += res.coins | 0; Object.keys(res.mats || {}).forEach(k => B.mat(k, res.mats[k])); Object.keys(res.uses || {}).forEach(k => B.use(k, res.uses[k]));
      if(res.state){ const sh = B.st.shards; B.st = Object.assign(freshState(), clone(res.state)); B.st.shards = Math.max(B.st.shards, sh + (res.shards | 0)); } else B.st.shards += res.shards | 0; return where; },
    buyPiece(set, piece, cost){ cost = cost || 10; const miss = missing(B.st, set); if(miss.indexOf(piece) < 0) return {ok: false, why: 'have'}; if(B.st.shards < cost) return {ok: false, why: 'shards'};
      B.st.shards -= cost; (B.st.sets[set.id] = B.st.sets[set.id] || []).push(piece); const it = mkItem(piece, set.tier == null ? 6 : set.tier, o.lv || 1, rng(hash(piece) + B.st.shards), {set: set.id}); return {ok: true, where: B.add(it), item: it}; },
    shards(){ return B.st.shards; }, luck(){ return B.st.luck; },
    toJSON(){ return {v: 1, g: B.g.map(pack), slots: B.slots, m: B.m, q: B.q, u: B.u, qb: B.qb, qa: B.qa ? 1 : 0, mail: B.mail.map(pack), buy: B.buy.map(pack), c: B.c, st: B.st, s: B.s}; },
    size(){ return JSON.stringify(B.toJSON()).length; }});
  return B; }
/* ---------------- look ---------------- */
function card(g, it, x, y, w, h, t, o){ o = o || {}; const d = get(it.base); P.frame(g, x, y, w, h, it.tier, t, o); if(!d) return; const pad = Math.min(w, h) * 0.15;
  D.fit(g, 'lk:' + it.base + ':' + it.tier, q => d.paint(q, it.tier, t || 0), x + pad, y + pad * 0.85, w - pad * 2, h - pad * 1.9);
  if(it.lock && o.lock !== false){ const r = Math.max(6, Math.min(w, h) * 0.13); padlock(g, x + r * 1.1, y + r * 1.1, r); } }
function padlock(g, x, y, r){ g.save(); g.translate(x, y); g.fillStyle = 'rgba(43,45,66,0.85)'; g.beginPath(); D.ell(g, 0, 0, r, r); g.fill();
  g.strokeStyle = '#FFC21A'; g.lineWidth = Math.max(1.2, r * 0.18); g.beginPath(); g.arc(0, -r * 0.15, r * 0.32, Math.PI, 0); g.stroke(); g.fillStyle = '#FFC21A'; g.fillRect(-r * 0.45, -r * 0.12, r * 0.9, r * 0.62); g.restore(); }
function sil(g, it, x, y, w, h){ const d = get(it.base || it); if(!d) return; const c = document.createElement('canvas'), s = Math.max(1, Math.round(w)), q = c.getContext('2d'); c.width = s; c.height = Math.max(1, Math.round(h));
  D.fit(q, 'lk:' + d.id + ':0', z => d.paint(z, 0, 0), s * 0.14, h * 0.12, s * 0.72, h * 0.76); q.globalCompositeOperation = 'source-in'; q.fillStyle = '#3A4660'; q.fillRect(0, 0, s, h); g.drawImage(c, x, y, w, h); }
/* ---------------- sound ---------------- */
const NOTE = ['C5', 'D5', 'E5', 'G5', 'C6', 'E6', 'G6'];
function ding(tier){ try { if(window.UISound && UISound.note){ UISound.note(NOTE[tier], 0.22 + tier * 0.04, {instrument: 'bell'}); if(tier >= 4) UISound.note(NOTE[Math.min(6, tier)].replace(/\d/, d => +d + 1), 0.35, {instrument: 'bell', delay: 0.12}); } } catch(e){} }
/* ---------------- CSS (once) ---------------- */
function css(){ if(document.getElementById('lk-css')) return; if(!document.documentElement.hasAttribute('data-lk-theme')) document.documentElement.setAttribute('data-lk-theme', 'gold'); const s = document.createElement('style'); s.id = 'lk-css'; s.textContent = [
  '.lk-ov{position:absolute;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;font-family:Fredoka,Nunito,sans-serif;color:#2B2D42;-webkit-user-select:none;user-select:none;touch-action:none;}',
  '.lk-ov.lk-fixed{position:fixed;}',
  '.lk-ov canvas.lk-cv{position:absolute;inset:0;width:100%;height:100%;display:block;}',
  '.lk-dim{background:radial-gradient(ellipse at 50% 40%,rgba(143,214,245,.55),rgba(30,50,90,.62));}',
  '.lk-name{position:absolute;left:50%;transform:translateX(-50%);max-width:92%;text-align:center;font-weight:700;line-height:1.15;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.35),0 0 8px rgba(0,0,0,.35);pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
  '.lk-name small{display:block;font-weight:600;font-size:.72em;opacity:.95;}',
  '.lk-btns{position:absolute;left:50%;transform:translateX(-50%);display:flex;gap:10px;justify-content:center;}',
  '.lk-b,.lk-tab,.lk-x{position:relative;overflow:visible;border:none;cursor:pointer;font:700 16px Fredoka,sans-serif;white-space:nowrap;color:#1F4E79;border-radius:18px;min-height:44px;min-width:44px;padding:8px 16px;background:linear-gradient(#FFFFFF 0%,#EAF7FF 55%,#BFE6FA 100%);box-shadow:0 5px 0 #7DB8DA,0 8px 14px rgba(40,90,150,.25),inset 0 -3px 0 rgba(255,255,255,.55);text-shadow:0 1px 0 #fff;transition:transform .08s ease-out,box-shadow .08s ease-out,filter .15s;-webkit-tap-highlight-color:transparent;}',
  '.lk-b::before,.lk-tab::before,.lk-x::before{content:"";position:absolute;left:10%;right:10%;top:4px;height:38%;border-radius:999px;background:linear-gradient(rgba(255,255,255,.95),rgba(255,255,255,0));pointer-events:none;}',
  '.lk-b.main{color:#5A2A00;text-shadow:0 1px 0 rgba(255,240,200,.8);background:linear-gradient(#FFE58A 0%,#FFC21A 50%,#FF9F1A 100%);box-shadow:0 5px 0 #C96A00,0 8px 16px rgba(255,140,0,.35),inset 0 -3px 0 rgba(255,255,255,.35);}',
  '.lk-b.warn{color:#fff;text-shadow:0 1px 1px rgba(120,20,0,.45);background:linear-gradient(#FFB4A0 0%,#FF7A5A 55%,#F2503A 100%);box-shadow:0 5px 0 #B8321F,0 8px 14px rgba(240,80,50,.3),inset 0 -3px 0 rgba(255,255,255,.3);}',
  '.lk-b.lk-press,.lk-tab.lk-press,.lk-x.lk-press{transform:translateY(4px) scale(1.05,.9);box-shadow:0 1px 0 #7DB8DA,0 3px 6px rgba(40,90,150,.25),inset 0 -2px 0 rgba(255,255,255,.4);filter:brightness(1.06);}',
  '.lk-b.main.lk-press{box-shadow:0 1px 0 #C96A00,0 3px 8px rgba(255,140,0,.3);} .lk-b.warn.lk-press{box-shadow:0 1px 0 #B8321F,0 3px 8px rgba(240,80,50,.3);}',
  '.lk-pop{animation:lkpop .34s cubic-bezier(.3,1.6,.5,1);}',
  '@keyframes lkpop{0%{transform:translateY(4px) scale(1.05,.9);}45%{transform:translateY(-3px) scale(.96,1.07);}75%{transform:translateY(0) scale(1.02,.98);}100%{transform:none;}}',
  '.lk-cell.lk-press{transform:scale(.9);} .lk-cell.lk-pop{animation:lkcell .3s cubic-bezier(.3,1.6,.5,1);} @keyframes lkcell{0%{transform:scale(.9);}55%{transform:scale(1.08);}100%{transform:none;}}',
  '.lk-spark{position:fixed;z-index:9999;width:10px;height:10px;margin:-5px 0 0 -5px;pointer-events:none;border-radius:50%;animation:lkspark .5s ease-out forwards;}',
  '@keyframes lkspark{0%{opacity:1;transform:translate(0,0) scale(1);}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.2);}}',
  '.lk-b[disabled]{filter:grayscale(.7) opacity(.55);cursor:default;}',
  '.lk-ic{font-style:normal;display:inline-block;}',
  /* 🪙 Gold Trim theme (Aowu 18:0x "add the gold trim to candy cloud as a theme"): same candy buttons + a gold rim + a coin icon + a shine sweep on tap — any island / screen turns it on: Loot.theme('gold') or {theme: 'gold'} */
  '[data-lk-theme=gold] .lk-b:not([data-lk-theme=cloud] *),[data-lk-theme=gold] .lk-tab:not([data-lk-theme=cloud] *),[data-lk-theme=gold] .lk-x:not([data-lk-theme=cloud] *){border:3px solid #FFD54A;box-shadow:0 0 0 2px #8A5A00,0 5px 0 #8A5A00,0 9px 14px rgba(90,60,0,.3),inset 0 2px 0 rgba(255,255,255,.6);}',
  '[data-lk-theme=gold] .lk-b.has-ic:not([data-lk-theme=cloud] *),[data-lk-theme=gold] .lk-tab.has-ic:not([data-lk-theme=cloud] *){padding-left:6px;}',
  '@media (max-width:560px),(max-height:460px){[data-lk-theme=gold] .lk-b:not([data-lk-theme=cloud] *),[data-lk-theme=gold] .lk-tab:not([data-lk-theme=cloud] *),[data-lk-theme=gold] .lk-x:not([data-lk-theme=cloud] *){border-width:2px;box-shadow:0 0 0 1px #8A5A00,0 4px 0 #8A5A00,0 7px 10px rgba(90,60,0,.25),inset 0 1px 0 rgba(255,255,255,.6);} [data-lk-theme=gold] .lk-ic:not([data-lk-theme=cloud] *){box-shadow:inset 0 -2px 0 rgba(0,0,0,.2),0 0 0 1px #8A5A00;}}',   /* 🪙 thinner trim on small screens (Aowu 23:45) */
  '[data-lk-theme=gold] .lk-ic:not([data-lk-theme=cloud] *){width:1.85em;height:1.85em;margin:-5px 6px -5px 0;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:.86em;vertical-align:middle;text-shadow:none;background:radial-gradient(circle at 35% 30%,#FFF6C8,#FFC21A 60%,#C98600);box-shadow:inset 0 -2px 0 rgba(0,0,0,.2),0 0 0 2px #8A5A00;}',
  '[data-lk-theme=gold] .lk-b.lk-press:not([data-lk-theme=cloud] *),[data-lk-theme=gold] .lk-tab.lk-press:not([data-lk-theme=cloud] *),[data-lk-theme=gold] .lk-x.lk-press:not([data-lk-theme=cloud] *){transform:translateY(4px) scale(1.03,.94);box-shadow:0 0 0 2px #8A5A00,0 1px 0 #8A5A00,0 3px 6px rgba(90,60,0,.25);}',
  '.lk-shine::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(110deg,rgba(255,255,255,0) 35%,rgba(255,255,255,.85) 48%,rgba(255,255,255,0) 60%);background-size:260% 100%;animation:lkshine .5s ease-out forwards;}',
  '@keyframes lkshine{from{background-position:120% 0;}to{background-position:-40% 0;}}',
  '.lk-spark.star{border-radius:0;width:13px;height:13px;margin:-6px 0 0 -6px;clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);}',
  '.lk-hint{position:absolute;left:50%;transform:translateX(-50%);font-weight:700;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.35);white-space:nowrap;pointer-events:none;animation:lkbob 1.2s ease-in-out infinite;}',
  '@keyframes lkbob{50%{transform:translate(-50%,-4px);}}',
  '.lk-sheet{position:absolute;inset:6px 6px var(--safe-b,10px) 6px;border-radius:22px;background:linear-gradient(#FFFFFF,#EEF8FF);box-shadow:0 10px 30px rgba(20,50,100,.35),inset 0 0 0 2px rgba(143,214,245,.6);display:flex;flex-direction:column;overflow:hidden;padding:8px;gap:6px;}',
  '.lk-head{display:flex;align-items:center;gap:6px;min-height:40px;flex:0 0 auto;}',
  '.lk-head b{font-size:18px;white-space:nowrap;}',
  '.lk-pill{background:#EAF4FF;border-radius:999px;padding:4px 10px;font-weight:700;font-size:14px;white-space:nowrap;}',
  '.lk-head .lk-sp{flex:1;}',
  '.lk-x{min-width:44px;min-height:40px;padding:4px 10px;font-size:18px;}',
  '.lk-tabs{display:flex;gap:6px;flex:0 0 auto;flex-wrap:wrap;}',
  '.lk-tab{min-height:38px;padding:4px 13px;font-size:14px;border-radius:999px;}',
  '.lk-tab.on{color:#fff;text-shadow:0 1px 1px rgba(60,20,120,.5);background:linear-gradient(#8FD6F5 0%,#7A8CF0 55%,#9B5DE5 100%);box-shadow:0 5px 0 #6234B0,0 8px 14px rgba(110,60,200,.3),inset 0 -3px 0 rgba(255,255,255,.25);}',
  '.lk-short .lk-head b{font-size:15px;} .lk-short .lk-tab{min-height:36px;padding:2px 9px;} .lk-short .lk-head{flex-wrap:nowrap;} .lk-short .lk-head .lk-sp{flex:0 1 0;} .lk-short .lk-tabs{flex-wrap:nowrap;}',
  '.lk-tab i{font-style:normal;background:#FF5A5A;color:#fff;border-radius:999px;padding:0 6px;margin-left:4px;font-size:12px;}',
  '.lk-body{position:relative;flex:1 1 auto;min-height:0;display:flex;gap:8px;}',
  '.lk-body.up .lk-gridwrap{justify-content:flex-start;padding-top:4px;}',
  '.lk-gridwrap{position:relative;flex:1 1 auto;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;}',
  '.lk-grid{display:grid;gap:5px;}',
  '.lk-cell{position:relative;border:none;transition:transform .08s;padding:0;margin:0;background:rgba(143,214,245,.18);border-radius:12px;cursor:pointer;box-shadow:inset 0 0 0 1.5px rgba(143,214,245,.55);}',
  '.lk-cell canvas{position:absolute;inset:0;width:100%;height:100%;}',
  '.lk-cell.on{box-shadow:0 0 0 3px #FF9F1A,inset 0 0 0 1.5px rgba(143,214,245,.55);}',
  '.lk-cell.mat{display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;line-height:1.1;background:#fff;}',
  '.lk-cell.mat .ic{font-size:1.4em;} .lk-cell.mat .n{font-size:.8em;} .lk-cell.mat .nm{font-size:.62em;opacity:.8;max-width:96%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
  '.lk-pager{display:flex;align-items:center;gap:6px;flex:0 0 auto;}',
  '.lk-pager .lk-b{min-height:38px;min-width:48px;padding:2px 12px;font-size:20px;}',
  '.lk-dots{display:flex;gap:4px;} .lk-dots span{width:8px;height:8px;border-radius:50%;background:#C9D6E6;} .lk-dots span.on{background:#9B5DE5;}',
  '.lk-card{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:4px;background:#fff;border-radius:18px;box-shadow:0 4px 14px rgba(30,60,110,.18);padding:8px;overflow:hidden;}',
  '.lk-card canvas{flex:0 0 auto;}',
  '.lk-card .t{font-weight:700;text-align:center;line-height:1.15;max-width:100%;}',
  '.lk-card .s{font-size:13px;font-weight:600;text-align:center;opacity:.85;max-width:100%;line-height:1.25;}',
  '.lk-card .acts{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:auto;}',
  '.lk-stats{display:flex;flex-direction:column;gap:2px;width:100%;min-width:150px;margin-top:2px;}',
  '.lk-stat{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:13.5px;font-weight:700;line-height:1.3;padding:1px 8px;border-radius:8px;background:#F2F8FF;}',
  '.lk-stat span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .lk-stat b{font-weight:800;color:#2E9E46;white-space:nowrap;}',
  '.lk-stat.main{background:#FFF4D6;} .lk-stat.main b{color:#8A5A00;} .lk-stat.sock b{color:#7A4FD0;letter-spacing:1px;}',
  '.lk-cell.use{position:relative;} .lk-cell.use canvas{position:absolute;inset:0;width:100%;height:100%;} .lk-cell.use .n{position:absolute;right:3px;bottom:2px;font:800 11px Fredoka,sans-serif;background:#2B2D42;color:#fff;border-radius:8px;padding:0 5px;}',
  '.lk-cell.use .qb{position:absolute;left:3px;top:2px;font:800 10px Fredoka,sans-serif;background:#8A5A00;color:#FFF3B0;border-radius:8px;padding:0 4px;}',
  '.lk-stat.el b{color:#C8361A;} .lk-a-qb.on{background:linear-gradient(#FFF3B0,#FFD54A);}',
  '.lk-qrow{display:flex;flex-wrap:nowrap;align-items:center;gap:7px;padding:4px 8px 4px 10px;border-radius:999px;background:#F2F8FF;} .lk-ql{font:800 12px/1.1 Fredoka,sans-serif;color:#2B3A55;max-width:72px;}',
  '.lk-qm{position:relative;width:40px;height:40px;flex:none;border-radius:50%;border:0;padding:0;background:#fff;box-shadow:0 0 0 2px #C9D3E6,0 3px 0 #9AA8C0;cursor:pointer;font:800 18px Fredoka,sans-serif;color:#8A93A8;}',
  '.lk-qm canvas{width:34px;height:34px;margin:3px;} .lk-qm i{position:absolute;left:-3px;top:-4px;font:800 10px/1 Fredoka,sans-serif;font-style:normal;background:#2B2D42;color:#fff;border-radius:7px;padding:2px 4px;}',
  '.lk-qm.on{box-shadow:0 0 0 3px #FFD54A,0 0 0 5px #8A5A00,0 0 12px 3px rgba(255,200,40,.75);} .lk-qm.on i{background:#8A5A00;color:#FFF3B0;} .lk-qm.empty{background:rgba(255,255,255,.6);}',
  '.lk-qa{position:relative;width:44px;height:44px;border-radius:50%;border:0;padding:0;background:#E4ECF5;box-shadow:0 0 0 2px #9AA8C0;cursor:pointer;font:22px/1 sans-serif;filter:grayscale(.7);} .lk-qa i{position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);font:800 10px/1 Fredoka,sans-serif;font-style:normal;background:#566A84;color:#fff;border-radius:7px;padding:2px 5px;}',
  '.lk-qa.on{background:#E8FFE8;filter:none;box-shadow:0 0 0 3px #4CC870,0 0 10px 2px rgba(76,200,112,.6);} .lk-qa.on i{background:#2E9E46;} .lk-qs.auto{animation:lkAuto .6s ease-out;} @keyframes lkAuto{0%{transform:scale(1.25);box-shadow:0 0 0 6px #4CC870;}100%{transform:none;}}',
  '.lk-qbar{display:flex;gap:10px;align-items:center;justify-content:center;padding:6px 10px;border-radius:999px;background:rgba(43,45,66,.82);box-shadow:0 0 0 2px #FFD54A,0 0 0 4px #8A5A00;}',
  '.lk-qs{position:relative;width:58px;height:58px;border-radius:50%;border:0;padding:0;background:#fff;box-shadow:0 0 0 3px #FFD54A,0 0 0 5px #8A5A00,0 4px 0 #8A5A00;cursor:pointer;font:800 22px Fredoka,sans-serif;color:#8A93A8;}',
  '.lk-qs canvas{width:56px;height:56px;margin:1px;} .lk-qs i{position:absolute;right:-4px;bottom:-4px;font:800 11px/1 Fredoka,sans-serif;font-style:normal;background:#8A5A00;color:#FFF3B0;border-radius:9px;padding:3px 5px;}',
  '.lk-qs:disabled{opacity:.55;cursor:default;} .lk-qs.empty{background:rgba(255,255,255,.35);} .lk-qs:not(:disabled):active{transform:translateY(3px);box-shadow:0 0 0 3px #FFD54A,0 0 0 5px #8A5A00,0 1px 0 #8A5A00;}',
  '@media (max-width:560px),(max-height:460px){.lk-qs{width:46px;height:46px;box-shadow:0 0 0 2px #FFD54A,0 0 0 3px #8A5A00,0 3px 0 #8A5A00;} .lk-qs canvas{width:44px;height:44px;}}',
  '.lk-short .lk-stat{font-size:12px;line-height:1.2;} .lk-card.tight .lk-stat{font-size:11px;line-height:1.1;padding:0 6px;} .lk-card.tight .lk-stats{gap:1px;} .lk-card.tight .acts .lk-b{min-height:38px;}',
  '.lk-card .acts .lk-b{min-height:42px;padding:4px 12px;font-size:15px;}',
  '.lk-body.up .lk-card{position:absolute;left:0;right:0;bottom:0;z-index:2;flex-direction:row;flex-wrap:wrap;justify-content:center;transform:translateY(110%);transition:transform .22s ease-out;}',
  '.lk-body.up .lk-card.open{transform:none;}',
  '.lk-body.up .lk-card .info{display:flex;flex-direction:column;align-items:flex-start;min-width:0;flex:1 1 120px;}',
  '.lk-body.up .lk-card .t,.lk-body.up .lk-card .s{text-align:left;}',
  '.lk-body.up .lk-card .acts{flex:1 1 100%;margin-top:0;}',
  '.lk-ask{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;background:rgba(30,50,90,.45);border-radius:18px;}',
  '.lk-ask>div{background:#fff;border-radius:18px;padding:14px;max-width:92%;text-align:center;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:10px;align-items:center;}',
  '.lk-ask .row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}',
  '.lk-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:700;opacity:.6;text-align:center;padding:10px;}',
  '.lk-pct{height:10px;border-radius:999px;background:#E4ECF5;overflow:hidden;min-width:60px;flex:1 1 60px;max-width:160px;} .lk-pct>b{display:block;height:100%;background:linear-gradient(90deg,#4CC764,#FFC21A);}'].join('\n');
  document.head.appendChild(s); react(); }
const SPARK = ['#FFC21A', '#FFFFFF', '#8FD6F5', '#FF9F1A', '#9B5DE5'];
function sparkle(x, y, n, cols, stars){ for(let i = 0; i < n; i++){ const e = document.createElement('i'), a = i / n * TAU + Math.random() * 0.5, d = 22 + Math.random() * 18; e.className = 'lk-spark' + (stars && i % 2 === 0 ? ' star' : '');
  e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.background = (cols || SPARK)[i % (cols || SPARK).length]; e.style.setProperty('--dx', Math.cos(a) * d + 'px'); e.style.setProperty('--dy', Math.sin(a) * d + 'px');
  if(i % 2) e.style.borderRadius = '2px'; document.body.appendChild(e); setTimeout(() => e.remove(), 560); } }
function pop(kind){ try { if(window.UISound && UISound.tone && (!UISound.isOn || UISound.isOn())){ if(kind === 'gold'){ UISound.tone(1320, 0.09, {type: 'sine', gain: 0.1, slide: 1760}); UISound.tone(1976, 0.12, {type: 'sine', gain: 0.06, delay: 0.05}); }   // 🪙 coin "ting"
  else UISound.tone(kind === 'main' ? 740 : 620, 0.07, {type: 'triangle', gain: 0.12, slide: kind === 'main' ? 1180 : 930}); } } catch(e){} }
/* ---------------- themes (Aowu 18:0x): ☁️ cloud = the default candy buttons · 🪙 gold = candy + gold rim + coin icon + shine. A game sets one for the whole page (an island / a screen) or per sheet / show ---------------- */
const THEMES = {gold: {name: 'Gold Trim', icon: '🪙'}, cloud: {name: 'Candy Cloud', icon: '☁️'}};   // gold first = the default
function themeOf(el){ const t = el && el.closest && el.closest('[data-lk-theme]'); return t ? t.getAttribute('data-lk-theme') : 'gold'; }   // 🪙 Gold Trim + candy = the one look (Aowu 23:45)
function theme(name, el){ el = el || document.documentElement; if(name == null) return themeOf(el); if(!THEMES[name]) name = 'gold'; el.setAttribute('data-lk-theme', name); return name; }
// wrap a button's leading emoji in <i class="lk-ic"> (the gold theme turns it into a coin icon; the cloud theme leaves it as it was)
const EMO = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:\uFE0F|\u200D(?:\p{Extended_Pictographic})\uFE0F?)*)\s*/u;
function iconize(root){ (root || document).querySelectorAll('.lk-b, .lk-tab, .lk-react').forEach(b => { if(b.querySelector('.lk-ic')) return; const n = b.firstChild; if(!n || n.nodeType !== 3) return;
  const m = n.nodeValue.match(EMO); if(!m) return; const i = document.createElement('i'); i.className = 'lk-ic'; i.textContent = m[1]; n.nodeValue = n.nodeValue.slice(m[0].length); if(!n.nodeValue && !b.lastChild.isSameNode(n)) n.remove(); else if(n.nodeValue) n.nodeValue = ' ' + n.nodeValue.replace(/^\s+/, '');
  b.insertBefore(i, b.firstChild); b.classList.add('has-ic'); }); }
let REACT = null;
function react(){ if(REACT) return; REACT = true; const SEL = '.lk-b, .lk-tab, .lk-x, .lk-cell, .lk-react';
  const up = el => { if(!el.classList.contains('lk-press')) return; el.classList.remove('lk-press'); el.classList.remove('lk-pop'); void el.offsetWidth; el.classList.add('lk-pop'); setTimeout(() => el.classList.remove('lk-pop'), 360); };
  document.addEventListener('pointerdown', ev => { const el = ev.target.closest && ev.target.closest(SEL); if(!el || el.disabled) return; el.classList.add('lk-press');
    const main = el.classList.contains('main') || el.classList.contains('go'), th = themeOf(el), gold = th === 'gold';
    sparkle(ev.clientX, ev.clientY, el.classList.contains('lk-cell') ? 5 : 8, gold ? ['#FFD54A', '#FFFFFF', '#FFC21A'] : main ? ['#FFE58A', '#FFFFFF', '#FF9F1A'] : null, gold); pop(gold ? 'gold' : main ? 'main' : '');
    if(gold && !el.classList.contains('lk-cell')){ el.classList.remove('lk-shine'); void el.offsetWidth; el.classList.add('lk-shine'); setTimeout(() => el.classList.remove('lk-shine'), 520); }
    REACT.last = {t: performance.now(), cls: el.className};
    const done = () => { up(el); window.removeEventListener('pointerup', done, true); window.removeEventListener('pointercancel', done, true); }; window.addEventListener('pointerup', done, true); window.addEventListener('pointercancel', done, true); }, true);
  document.addEventListener('click', ev => { const el = ev.target.closest && ev.target.closest(SEL); if(el && !el.classList.contains('lk-press') && !el.classList.contains('lk-pop') && ev.detail === 0){ el.classList.add('lk-press'); setTimeout(() => up(el), 70); } }, true);
  REACT = {on: true, last: null}; }
function overlay(box, cls, th){ css(); const ov = document.createElement('div'); ov.className = 'lk-ov ' + (cls || ''); if(th) theme(th, ov); if(!box || box === document.body || box === document.documentElement){ box = document.body; ov.classList.add('lk-fixed'); }
  else if(getComputedStyle(box).position === 'static') box.style.position = 'relative';
  const m = document.createElement('span'); m.className = 'ui-modal on lk-mark'; m.setAttribute('aria-hidden', 'true'); m.style.setProperty('display', 'none', 'important'); ov.appendChild(m);   // UiKit hides 💬 Tell us! while a .ui-modal.on is on the page
  box.appendChild(ov); return ov; }
function canvasIn(ov){ const c = document.createElement('canvas'); c.className = 'lk-cv'; ov.appendChild(c); const r = ov.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = Math.max(1, Math.round(r.width * dpr)); c.height = Math.max(1, Math.round(r.height * dpr)); const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return {c, g, W: r.width, H: r.height, dpr}; }
const ease = {out: x => 1 - Math.pow(1 - x, 3), back: x => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }, inq: x => x * x};
const cl = (x, a, b) => Math.max(a, Math.min(b, x)), seg = (ms, a, b) => cl((ms - a) / (b - a), 0, 1);
function seenKind(k, set){ try { const key = 'sp_loot_seen_' + k; if(set){ localStorage.setItem(key, '1'); return true; } return localStorage.getItem(key) === '1'; } catch(e){ return true; } }
function nameOf(it){ const d = get(it.base); return d ? d.name : it.base; }
function tierLine(it){ return RAR[it.tier].name + ' · Lv ' + (it.lv || 1) + (it.star > 1 ? ' · ★' + it.star : '') + (it.set ? ' · set' : '') + (it.relic ? ' · relic' : ''); }
/* ---------------- shows ---------------- */
const LOG = [];
function show(box, it, o){ o = o || {}; const kind = o.kind || showFor(o.src, it), basic = !!o.basic;
  const ov = overlay(box, 'lk-dim lk-show lk-' + kind, o.theme), V = canvasIn(ov), g = V.g, W = V.W, H = V.H;
  const canSkip = o.skip != null ? !!o.skip : seenKind(kind); seenKind(kind, true);
  const cs = Math.min(W * 0.42, H * 0.46, 260), cw = cs * 0.8, ch = cs, cx = W / 2, cy = H * 0.44;
  const name = document.createElement('div'); name.className = 'lk-name'; name.style.top = (cy + ch / 2 + 6) + 'px'; name.style.fontSize = Math.max(15, Math.min(24, cs / 9)) + 'px';
  name.innerHTML = nameOf(it).replace(/</g, '&lt;') + '<small>' + RAR[it.tier].icon + ' ' + tierLine(it) + '</small>'; name.style.opacity = 0; ov.appendChild(name);
  const btns = document.createElement('div'); btns.className = 'lk-btns'; btns.style.top = Math.min(H - 54, cy + ch / 2 + 6 + Math.max(15, Math.min(24, cs / 9)) * 2.6) + 'px'; btns.style.visibility = 'hidden'; ov.appendChild(btns);
  const hint = document.createElement('div'); hint.className = 'lk-hint'; hint.style.top = Math.max(6, cy - ch / 2 - 46) + 'px'; hint.style.fontSize = Math.max(14, Math.min(20, cs / 11)) + 'px'; ov.appendChild(hint);
  const st = {kind, ms: 0, t0: performance.now(), phase: 'play', taps: 0, end: 0, spin: null, burst: 0, done: false};
  const DUR = {chest: 1600, beam: 700, cloud: 600, wheel: 1800}[kind] || 1200;
  // wheel slices = the source's real weights; the roll is already decided — the wheel only shows it
  const slices = kind === 'wheel' ? (SRC[o.src || 'eboss'].w).map((w, i) => [i, w]).filter(s => s[1]) : null;
  let target = 0; if(slices){ const tot = slices.reduce((a, b) => a + b[1], 0); let a0 = 0; slices.forEach(s => { if(s[0] === it.tier){ const r = rng(it.seed)(); target = -((a0 + s[1] * (0.2 + 0.6 * r)) / tot) * TAU; } a0 += s[1]; }); }
  return new Promise(resolve => {
    let raf = 0; const finish = act => { if(st.done) return; st.done = true; cancelAnimationFrame(raf); clearTimeout(st.auto); ov.remove(); LOG.push({kind, tier: it.tier, act}); resolve(act || 'bag'); };
    const toEnd = () => { st.phase = 'card'; st.end = performance.now(); ding(it.tier); name.style.opacity = 1;
      if(kind === 'beam' || o.auto){ st.auto = setTimeout(() => finish('bag'), kind === 'beam' ? 450 : 700); return; }
      btns.innerHTML = ''; if(o.equip !== false){ const e = document.createElement('button'); e.className = 'lk-b main lk-equip'; e.textContent = '⭐ Equip'; e.onclick = ev => { ev.stopPropagation(); finish('equip'); }; btns.appendChild(e); }
      const b = document.createElement('button'); b.className = 'lk-b lk-tobag'; b.textContent = '🎒 Bag'; b.onclick = ev => { ev.stopPropagation(); finish('bag'); }; btns.appendChild(b); iconize(btns); btns.style.visibility = 'visible'; hint.textContent = ''; };
    const tapNeed = basic ? 1 : 3;
    ov.addEventListener('pointerdown', ev => { ev.preventDefault();
      if(st.phase === 'card'){ if(!ev.target.closest('.lk-btns')) finish('bag'); return; }
      if(kind === 'cloud' && st.phase === 'wait'){ st.taps++; st.tapAt = performance.now(); if(st.taps >= tapNeed){ st.phase = 'burst'; st.t0 = performance.now(); } return; }
      if(kind === 'wheel' && st.phase === 'wait'){ st.phase = 'spin'; st.t0 = performance.now(); return; }
      if(canSkip && (st.phase === 'play' || st.phase === 'spin' || st.phase === 'burst')) toEnd(); });
    if(kind === 'cloud'){ st.phase = 'wait'; hint.textContent = basic ? '👆 Tap the cloud!' : '👆 Tap the cloud 3 times!'; }
    if(kind === 'wheel'){ st.phase = 'wait'; hint.textContent = basic ? '🎰 Spinning soon…' : '👆 Tap to spin!'; if(basic) st.auto = setTimeout(() => { if(st.phase === 'wait'){ st.phase = 'spin'; st.t0 = performance.now(); } }, 3000); }
    ov._lk = {st, finish, toEnd, tap: () => ov.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}))};
    const drawCard = (sc, rot, a) => { g.save(); g.globalAlpha = a == null ? 1 : a; g.translate(cx, cy); g.rotate(rot || 0); g.scale(sc, sc); card(g, it, -cw / 2, -ch / 2, cw, ch, st.t); g.restore(); };
    const tick = now => { if(st.done) return; st.t = now / 1000; const ms = now - st.t0; g.clearRect(0, 0, W, H);
      if(st.phase === 'card'){ const k = ease.back(seg(now - st.end, 0, 260)); if(it.tier >= 3) P.rays(g, cx, cy, cs * 1.25, it.tier >= 5 ? '#E9D6FF' : P.RAR[it.tier].col, 0.35, st.t);
        drawCard(0.75 + 0.25 * k, 0); }
      else if(kind === 'chest'){ const C = o.chest || (o.src && SRC[o.src] && SRC[o.src].chest) || 'wood', s = cs / 95, drop = ease.out(seg(ms, 0, 250)), base = cy + ch * 0.42;
        const y = base - (1 - drop) * H * 0.6, wob = ms > 250 && ms < 600 ? Math.sin(ms / 28) * 0.08 * (1 - seg(ms, 250, 600)) : 0, sq = ms < 320 ? (drop >= 1 ? 0.12 * (1 - seg(ms, 250, 320)) : 0) : 0, lid = ease.back(seg(ms, 600, 800));
        if(ms > 600) P.beam(g, cx, base - 40 * s, H * 0.7, cs * 0.55, it.tier, st.t);
        P.chest(g, cx, y, s, C, lid, st.t, {rot: wob, sq});
        if(ms > 1200) P.coins(g, cx, base - 40 * s, 9, cs * 0.75, (ms - 1200) / 600, it.seed);   // coin fountain BEHIND the card
        if(ms > 800){ const k = ease.back(seg(ms, 800, 1200)); g.save(); g.translate(0, (1 - k) * (base - cy) * 0.9); drawCard(0.3 + 0.55 * k, (1 - k) * 6.2, Math.min(1, k * 1.5)); g.restore(); }
        if(ms >= DUR) toEnd(); }
      else if(kind === 'cloud'){ const s = cs / 120;
        if(st.phase === 'wait'){ const sh = st.tapAt && now - st.tapAt < 260 ? Math.sin((now - st.tapAt) / 20) * 6 : 0; g.save(); g.translate(sh, 0); P.cloudWrap(g, cx, cy, s, Math.min(2, st.taps + (basic ? 0 : 0)), st.t, it.tier); g.restore(); }
        else { const k = seg(ms, 0, DUR); P.cloudWrap(g, cx, cy, s * (1 + k * 0.3), 3, st.t, it.tier); g.save(); g.globalCompositeOperation = 'lighter'; D.glow(g, cx, cy, cs * (0.6 + k), it.tier === 6 ? '#FFF2B0' : '#E9D6FF', 0.8 * (1 - k * 0.5)); g.restore(); drawCard(0.4 + 0.6 * ease.back(k), 0, k); if(ms >= DUR) toEnd(); } }
      else if(kind === 'wheel'){ const r = Math.min(W * 0.3, H * 0.34, 170);
        let ang = 0; if(st.phase === 'spin'){ const k = ease.out(seg(ms, 0, DUR)); ang = target - TAU * 4 * (1 - k) ; if(ms >= DUR){ st.phase = 'land'; st.t0 = now; } } else if(st.phase === 'land'){ ang = target; if(ms > 350) toEnd(); }
        P.wheel(g, cx, cy - r * 0.05, r, slices, ang, {blur: st.phase === 'spin' && ms < DUR * 0.6}); if(st.phase === 'land') { g.save(); g.globalAlpha = seg(ms, 0, 350); drawCard(0.55, 0); g.restore(); } }
      else { const k = seg(ms, 0, DUR); P.beam(g, cx, cy + ch * 0.45, H * 0.8 * ease.out(k), cs * 0.6, it.tier, st.t); drawCard(0.5 + 0.3 * ease.back(k), 0, k); P.coins(g, cx, cy + ch * 0.3, 6, cs * 0.5, k, it.seed); if(ms >= DUR) toEnd(); }
      raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); }); }
async function reveal(box, res, o){ o = o || {}; const out = [];
  for(const it of res.items || []){ let kind = res.show === 'wheel' ? 'wheel' : (it.tier >= 5 ? 'cloud' : res.show);
    if(kind === 'wheel'){ out.push(await show(box, it, Object.assign({}, o, {kind: 'wheel', src: res.src}))); if(it.tier >= 5) out[out.length - 1] = await show(box, it, Object.assign({}, o, {kind: 'cloud', src: res.src})); }
    else out.push(await show(box, it, Object.assign({}, o, {kind, src: res.src, chest: res.chest}))); }
  return out; }
/* ---------------- bag sheet ---------------- */
function bagSheet(box, B, o){ o = o || {}; const ov = overlay(box, 'lk-bag', o.theme); ov.style.background = 'rgba(30,50,90,.35)';
  const mName = o.matName || matName, mIcon = o.matIcon || matIcon;
  ov.insertAdjacentHTML('beforeend', '<div class="lk-sheet"><div class="lk-head"><b>' + (o.title || '🎒 Bag') + '</b><span class="lk-pill lk-cnt"></span><span class="lk-pill lk-coins"></span><span class="lk-pill lk-shards"></span><span class="lk-sp"></span><button class="lk-x" aria-label="Close">✕</button></div>' +
    '<div class="lk-tabs"></div><div class="lk-body"><div class="lk-gridwrap"><div class="lk-grid"></div><div class="lk-pager"><button class="lk-b lk-prev" aria-label="Previous page">‹</button><div class="lk-dots"></div><button class="lk-b lk-next" aria-label="Next page">›</button></div></div><div class="lk-card"></div></div></div>');
  const $ = s => ov.querySelector(s), S = {tab: 'gear', page: 0, sel: -1, cells: [], anim: [], raf: 0, cols: 8, rows: 5, wide: true, closed: false};
  const TABS = [['gear', '🎒', 'Gear'], ['use', '🍙', 'Use'], ['pouch', '🧱', 'Craft'], ['mail', '📬', 'Mail'], ['buy', '🔁', 'Buy back']];   // 🍙 Use + 🧱 Craft = the Pouch's 2 tabs (av-r0g)
  const listOf = () => S.tab === 'gear' ? B.g : S.tab === 'mail' ? B.mail : S.tab === 'buy' ? B.buy : S.tab === 'use' ? Object.keys(B.u).filter(k => useDef(k)).map(k => ({use: k, n: B.u[k]})) : Object.keys(B.m).map(k => ({mat: k, n: B.m[k]})).concat(Object.keys(B.q).map(k => ({mat: k, n: B.q[k], quest: true})));
  const slotsOf = () => S.tab === 'gear' ? B.slots : Math.max(1, listOf().length);
  function head(){ $('.lk-cnt').textContent = B.count() + ' / ' + B.slots; $('.lk-coins').textContent = '🪙 ' + B.c; $('.lk-shards').textContent = '☁️ ' + B.st.shards;
    const T = $('.lk-tabs'); T.innerHTML = ''; TABS.forEach(([k, ic, lb]) => { const b = document.createElement('button'); b.className = 'lk-tab' + (k === S.tab ? ' on' : ''); b.dataset.t = k;
      const n = k === 'mail' ? B.mail.length : 0; b.innerHTML = ic + ' ' + lb + (n ? '<i>' + n + '</i>' : ''); b.onclick = () => { S.tab = k; S.page = 0; S.sel = -1; head(); lay(); }; T.appendChild(b); }); iconize(T); }
  function lay(){ const sh = $('.lk-sheet'), short = sh.getBoundingClientRect().height < 430, T = $('.lk-tabs'); sh.classList.toggle('lk-short', short);
    if(short && T.parentNode !== $('.lk-head')) $('.lk-head').insertBefore(T, $('.lk-sp')); else if(!short && T.parentNode === $('.lk-head')) sh.insertBefore(T, $('.lk-body'));
    const body = $('.lk-body'), r = body.getBoundingClientRect(); S.wide = r.width >= r.height * 1.25 && r.width >= 520; body.classList.toggle('up', !S.wide);
    const cardW = S.wide ? Math.min(240, Math.max(170, r.width * 0.3)) : 0, gw = r.width - cardW - (S.wide ? 8 : 0), gh = r.height - 42;
    const want = S.wide ? [8, 5] : (r.width > r.height * 0.9 ? [6, 4] : [5, 5]);
    let cols = want[0], rows = want[1], cell = Math.floor(Math.min((gw - (cols - 1) * 5) / cols, (gh - (rows - 1) * 5) / rows));
    while(cell < 34 && cols * rows > 9){ if(cols >= rows) cols--; else rows--; cell = Math.floor(Math.min((gw - (cols - 1) * 5) / cols, (gh - (rows - 1) * 5) / rows)); }
    S.cols = cols; S.rows = rows; S.cell = Math.max(24, Math.min(cell, 128));
    const C = $('.lk-card'); C.style.width = S.wide ? cardW + 'px' : ''; C.style.maxHeight = S.wide ? '' : Math.round(r.height * 0.72) + 'px';
    render(); }
  function per(){ return S.cols * S.rows; }
  function render(){ const G = $('.lk-grid'), L = listOf(), n = slotsOf(), pages = Math.max(1, Math.ceil(n / per())); S.page = Math.min(S.page, pages - 1); G.innerHTML = ''; S.cells = []; S.anim = [];
    G.style.gridTemplateColumns = 'repeat(' + S.cols + ',' + S.cell + 'px)'; G.style.gridAutoRows = S.cell + 'px';
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    for(let k = 0; k < per(); k++){ const i = S.page * per() + k; if(i >= n) break; const it = L[i], b = document.createElement('button'); b.className = 'lk-cell' + (i === S.sel ? ' on' : ''); b.dataset.i = i;
      if(it && it.use){ b.classList.add('use'); const c = document.createElement('canvas'); c.width = c.height = Math.round(S.cell * dpr); b.appendChild(c); const q = c.getContext('2d'); q.scale(dpr, dpr); usePic(q, it.use, S.cell * 0.12, S.cell * 0.08, S.cell * 0.76, S.cell * 0.7); b.insertAdjacentHTML('beforeend', '<span class="n">×' + it.n + '</span>'); const qi = B.qb.indexOf(it.use); if(qi >= 0) b.insertAdjacentHTML('beforeend', '<span class="qb">⚔️' + (qi + 1) + '</span>'); }
      else if(it && it.mat){ b.classList.add('mat'); b.innerHTML = '<span class="ic">' + mIcon(it.mat) + '</span><span class="n">×' + it.n + '</span><span class="nm">' + mName(it.mat) + '</span>'; b.style.fontSize = Math.max(10, S.cell / 4.2) + 'px'; }
      else if(it){ const c = document.createElement('canvas'); c.width = c.height = Math.round(S.cell * dpr); b.appendChild(c); const q = c.getContext('2d'); q.scale(dpr, dpr); card(q, it, 2, 2, S.cell - 4, S.cell - 4, 0); if(it.tier >= 5) S.anim.push({q, it, c}); }
      b.onclick = () => select(i); G.appendChild(b); S.cells.push(b); }
    if(!L.length && S.tab !== 'gear'){ const e = document.createElement('div'); e.className = 'lk-empty'; e.textContent = {use: '🍙 No food or potions yet — cook at the 🍳 Cook', pouch: '🧱 No materials yet', mail: '📬 No mail — your bag had room', buy: '🔁 Nothing sold yet'}[S.tab]; G.appendChild(e); }
    const dots = $('.lk-dots'); dots.innerHTML = ''; for(let p = 0; p < pages; p++){ const s = document.createElement('span'); if(p === S.page) s.className = 'on'; dots.appendChild(s); }
    $('.lk-prev').disabled = S.page <= 0; $('.lk-next').disabled = S.page >= pages - 1; $('.lk-pager').style.visibility = pages > 1 ? 'visible' : 'hidden';
    cardFill(); }
  function cardFill(){ const C = $('.lk-card'), L = listOf(), it = L[S.sel]; C.innerHTML = ''; C.classList.remove('tight'); C.classList.toggle('open', !!it);
    if(!it){ if(S.wide){ C.innerHTML = '<div class="s" style="margin:auto">👆 Tap a thing to see it</div>'; } return; }
    if(it.mat){ C.innerHTML = '<div class="info"><div class="t" style="font-size:20px">' + mIcon(it.mat) + ' ' + mName(it.mat) + '</div><div class="s">×' + it.n + (it.quest ? ' · 📜 quest item' : (MATS[it.mat] || {}).core ? ' · ⚒️ for the element forge' : ' · for crafting') + '</div></div>'; return; }
    if(it.use){ useCard(C, it); return; }
    let cs = S.wide ? Math.min(150, C.clientWidth - 30) : Math.min(96, S.cell * 1.6); const dpr = Math.min(2, window.devicePixelRatio || 1), cv = document.createElement('canvas'), q = cv.getContext('2d'), an = {q, it, c: cv};
    const draw = () => { cv.width = Math.round(cs * 0.8 * dpr); cv.height = Math.round(cs * dpr); cv.style.width = cs * 0.8 + 'px'; cv.style.height = cs + 'px'; q.setTransform(dpr, 0, 0, dpr, 0, 0); card(q, it, 3, 3, cs * 0.8 - 6, cs - 6, 0); an.w = cs * 0.8 - 6; an.h = cs - 6; };
    draw(); C.appendChild(cv); if(it.tier >= 5) S.anim.push(an);
    const info = document.createElement('div'); info.className = 'info'; const row = (ic, nm, v, cls) => '<div class="lk-stat' + (cls ? ' ' + cls : '') + '"><span>' + ic + ' ' + nm + '</span><b>' + v + '</b></div>';   // 📋 one row per detail (Aowu 23:45 — room for +2 / +3 later)
    const d0 = get(it.base) || {}, er = it.el && ELS[it.el] ? (d0.staff ? row(ELS[it.el].icon, ELS[it.el].name + ' spells · Lv ' + it.elv, '+' + Math.round(SPELL_LV * 100 * it.elv) + ' %', 'el') : row(ELS[it.el].icon, ELS[it.el].name + ' · Lv ' + it.elv, '×' + EL_MULT.strong + ' / +' + Math.round(EL_LV * 100 * it.elv) + ' %', 'el')) : '';   // 🔥 forged element: one row
    const bl = er + bonus(it).map(x => row(x.icon, x.name, '+' + x.v)).join(''), so = it.sock ? row('◇', 'Rune sockets', '◆'.repeat(it.runes.length) + '◇'.repeat(Math.max(0, it.sock - it.runes.length)), 'sock') : '';
    info.innerHTML = '<div class="t" style="color:' + (it.tier >= 5 ? '#7A4FD0' : RAR[it.tier].dark) + ';font-size:' + (S.wide ? 18 : 16) + 'px">' + (it.lock ? '🔒 ' : '') + nameOf(it).replace(/</g, '&lt;') + '</div>' +
      '<div class="s">' + RAR[it.tier].icon + ' ' + tierLine(it) + '</div><div class="lk-stats">' + row('⭐', 'Gear power', power(it), 'main') + bl + so + '</div>'; C.appendChild(info);
    const acts = document.createElement('div'); acts.className = 'acts'; const btn = (cls, txt, fn, dis) => { const b = document.createElement('button'); b.className = 'lk-b ' + cls; b.textContent = txt; b.disabled = !!dis; b.onclick = fn; acts.appendChild(b); return b; };
    if(S.tab === 'gear'){ if(o.onEquip) btn('main lk-a-equip', '⭐ Equip', () => o.onEquip(it, S.sel));
      btn('lk-a-lock', it.lock ? '🔓 Unlock' : '🔒 Lock', () => { B.lock(S.sel); changed(); });
      btn('lk-a-sell', it.tier >= 6 ? '🪙 Keep forever' : '🪙 ' + price(it), () => doSell(false), it.lock || it.tier >= 6);
      btn('lk-a-recycle', it.tier >= 6 ? '♻️ → ☁️ 5' : '♻️ Recycle', () => doRecycle(false), it.lock); }
    else if(S.tab === 'mail'){ btn('main lk-a-claim', '📬 Claim', () => { const r = B.claim(S.sel); if(!r.ok) note('🎒 Bag is full — sell or recycle first'); else { S.sel = -1; changed(); } }, B.full());
      btn('lk-a-claimall', '📬 Claim all', () => { B.claimAll(); S.sel = -1; changed(); }, B.full()); }
    else if(S.tab === 'buy'){ const pr = price(it); btn('main lk-a-buyback', '🔁 Buy back · 🪙 ' + pr, () => { const r = B.buyBack(S.sel); if(!r.ok) note('🪙 Not enough coins'); else { S.sel = -1; changed(); } }, B.c < pr); }
    C.appendChild(acts); iconize(acts);
    // 📋 more stat rows → the picture shrinks first, then the rows tighten — the buttons always stay inside the card (phone sideways)
    for(let k = 0; k < 8 && C.scrollHeight > C.clientHeight + 1; k++){ if(cs > 58){ cs = Math.round(cs * 0.84); draw(); } else { C.classList.add('tight'); break; } } }
  // 🍙 a food / potion card: picture · name · island · one row per effect · 🍽️ Use (when the game says it can) · ⚔️ put it on quick-bar slot 1 · 2 · 3
  function useCard(C, it){ const d = useDef(it.use), dpr = Math.min(2, window.devicePixelRatio || 1); let cs = S.wide ? Math.min(130, C.clientWidth - 40) : Math.min(84, S.cell * 1.4); const cv = document.createElement('canvas'), q = cv.getContext('2d');
    const draw = () => { cv.width = cv.height = Math.round(cs * dpr); cv.style.width = cv.style.height = cs + 'px'; q.setTransform(dpr, 0, 0, dpr, 0, 0); q.clearRect(0, 0, cs, cs); usePic(q, it.use, 4, 4, cs - 8, cs - 8); };
    draw(); C.appendChild(cv); const row = (ic, nm, v) => '<div class="lk-stat"><span>' + ic + ' ' + nm + '</span><b>' + v + '</b></div>';
    const info = document.createElement('div'); info.className = 'info'; info.innerHTML = '<div class="t" style="font-size:' + (S.wide ? 18 : 16) + 'px">' + d.name.replace(/</g, '&lt;') + '</div><div class="s">' + (d.island ? (ISLES[d.island] || d.island) + ' · ' : '') + '×' + it.n + ' / ' + USE_MAX + '</div>' +
      '<div class="lk-stats">' + d.eff.map(e => { const r = effRow(e); return row(r[0], r[1], r[2]); }).join('') + (d.cook ? row('🍳', 'Cook', Object.keys(d.cook).map(k => matIcon(k) + '×' + d.cook[k]).join(' ')) : '') + '</div>'; C.appendChild(info);
    const acts = document.createElement('div'); acts.className = 'acts'; const btn = (cls, txt, fn, dis) => { const b = document.createElement('button'); b.className = 'lk-b ' + cls; b.textContent = txt; b.disabled = !!dis; b.onclick = fn; acts.appendChild(b); return b; };
    if(o.onUse) btn('main lk-a-use', '🍽️ Use', () => { const r = B.eat(it.use); if(r.ok){ o.onUse(r); if(!B.u[it.use]) S.sel = -1; changed(); } });
    // ⚔️ battle quick bar: 3 round slots that look like the real bar — each shows what is in it; tap = put THIS here (it glows gold), tap its own slot again = take it out
    const qr = document.createElement('div'); qr.className = 'lk-qrow'; qr.innerHTML = '<span class="lk-ql">⚔️ Battle quick bar</span>'; const qd = Math.min(2, window.devicePixelRatio || 1);
    for(let k = 0; k < QB_N; k++){ const id = B.qb[k], on = id === it.use, b = document.createElement('button'); b.className = 'lk-qm' + (on ? ' on' : '') + (id ? '' : ' empty'); b.dataset.s = k;
      b.setAttribute('aria-label', 'Quick slot ' + (k + 1) + ': ' + (id ? useName(id) : 'empty') + (on ? ' (this one)' : ''));
      if(id){ const c = document.createElement('canvas'), Q = 34; c.width = c.height = Math.round(Q * qd); b.appendChild(c); const q2 = c.getContext('2d'); q2.scale(qd, qd); usePic(q2, id, 3, 3, Q - 6, Q - 6); } else b.textContent = '+';
      b.insertAdjacentHTML('beforeend', '<i>' + (k + 1) + '</i>'); b.onclick = () => { B.quick(k, on ? null : it.use); changed(); }; qr.appendChild(b); }
    acts.appendChild(qr); C.appendChild(acts); iconize(acts);
    for(let k = 0; k < 8 && C.scrollHeight > C.clientHeight + 1; k++){ if(cs > 48){ cs = Math.round(cs * 0.82); draw(); } else { C.classList.add('tight'); break; } } }
  function note(msg){ if(window.UI && UI.toast) UI.toast(msg); else ask(msg, null); }
  function ask(msg, yes, yesTxt){ const A = document.createElement('div'); A.className = 'lk-ask'; A.innerHTML = '<div><div class="m"></div><div class="row"></div></div>'; A.querySelector('.m').textContent = msg;
    const row = A.querySelector('.row'), mk = (cls, t, fn) => { const b = document.createElement('button'); b.className = 'lk-b ' + cls; b.textContent = t; b.onclick = () => { A.remove(); if(fn) fn(); }; row.appendChild(b); };
    if(yes){ mk('main lk-keep', '💛 Keep it', null); mk('warn lk-yes', yesTxt || 'Yes', yes); } else mk('main lk-ok', 'OK', null); iconize(A); $('.lk-sheet').appendChild(A); }
  function doSell(sure){ const it = B.g[S.sel], r = B.sell(S.sel, {sure}); if(r.ask) return ask('Sell ' + RAR[it.tier].icon + ' ' + RAR[it.tier].name + ' ' + nameOf(it) + ' for 🪙 ' + r.price + '?', () => doSell(true), '🪙 Sell');
    if(r.ok){ S.sel = -1; changed(); } }
  function doRecycle(sure){ const it = B.g[S.sel], r = B.recycle(S.sel, {sure}); if(r.ask) return ask('Recycle ' + RAR[it.tier].icon + ' ' + nameOf(it) + (r.shards ? ' into ☁️ ' + r.shards + ' Sky Shards?' : ' into materials?'), () => doRecycle(true), '♻️ Recycle');
    if(r.ok){ S.sel = -1; changed(); } }
  function changed(){ head(); render(); if(o.onChange) o.onChange(B); }
  function select(i){ S.sel = S.sel === i && !S.wide ? -1 : i; S.cells.forEach(c => c.classList.toggle('on', +c.dataset.i === S.sel)); S.anim = S.anim.filter(a => a.c.closest('.lk-grid')); cardFill(); }
  $('.lk-prev').onclick = () => { S.page--; S.sel = -1; render(); }; $('.lk-next').onclick = () => { S.page++; S.sel = -1; render(); };
  const close = () => { if(S.closed) return; S.closed = true; cancelAnimationFrame(S.raf); window.removeEventListener('resize', onR); ov.remove(); if(o.onClose) o.onClose(B); };
  $('.lk-x').onclick = close; const onR = () => lay(); window.addEventListener('resize', onR);
  let last = 0; const loop = now => { if(S.closed) return; if(now - last > 80){ last = now; S.anim.forEach(a => { const w = a.w || S.cell - 4, h = a.h || S.cell - 4; a.q.clearRect(0, 0, w + 6, h + 6); card(a.q, a.it, a.w ? 3 : 2, a.w ? 3 : 2, w, h, now / 1000); }); } S.raf = requestAnimationFrame(loop); };
  head(); lay(); S.raf = requestAnimationFrame(loop);
  const api = {el: ov, close, S, select, tab: k => { S.tab = k; S.page = 0; S.sel = -1; head(); lay(); }, page: p => { S.page = p; S.sel = -1; render(); }, refresh: changed, lay}; ov._lk = api; return api; }
/* ---------------- 📖 sticker book ---------------- */
function book(box, B, o){ o = o || {}; const ids = o.list || list(), seen = (B && B.s) || o.seen || {}, ov = overlay(box, 'lk-book', o.theme); ov.style.background = 'rgba(30,50,90,.35)';
  const found = ids.filter(id => seen[id] != null).length, pct = ids.length ? Math.round(found / ids.length * 100) : 0;
  ov.insertAdjacentHTML('beforeend', '<div class="lk-sheet"><div class="lk-head"><b>' + (o.title || '📖 Sticker book') + '</b><span class="lk-pill lk-found">' + found + ' / ' + ids.length + '</span><div class="lk-pct"><b style="width:' + pct + '%"></b></div><span class="lk-pill">' + pct + '%</span><span class="lk-sp"></span><button class="lk-x" aria-label="Close">✕</button></div>' +
    '<div class="lk-body"><div class="lk-gridwrap"><div class="lk-grid"></div><div class="lk-pager"><button class="lk-b lk-prev" aria-label="Previous page">‹</button><div class="lk-dots"></div><button class="lk-b lk-next" aria-label="Next page">›</button></div></div></div></div>');
  const $ = s => ov.querySelector(s), S = {page: 0, closed: false};
  function lay(){ const r = $('.lk-body').getBoundingClientRect(), gh = r.height - 42, lab = 18; let best = null;
    for(let cols = 2; cols <= 10; cols++) for(let rows = 1; rows <= 6; rows++){ const cw = (r.width - (cols - 1) * 5) / cols, chh = (gh - (rows - 1) * 5) / rows, cell = Math.min(cw, (chh - lab) / 1.0);
      if(cell < 44) continue; const pages = Math.ceil(ids.length / (cols * rows)), sc = Math.min(cell, 150) - (pages - 1) * 60; if(!best || sc > best.sc) best = {cols, rows, cell: Math.floor(Math.min(cell, 150)), sc}; }
    best = best || {cols: 3, rows: 2, cell: 44}; S.cols = best.cols; S.rows = best.rows; S.cell = best.cell; render(); }
  function render(){ const G = $('.lk-grid'), per = S.cols * S.rows, pages = Math.max(1, Math.ceil(ids.length / per)); S.page = Math.min(S.page, pages - 1); G.innerHTML = '';
    G.style.gridTemplateColumns = 'repeat(' + S.cols + ',' + S.cell + 'px)'; G.style.gridAutoRows = (S.cell + 18) + 'px'; const dpr = Math.min(2, window.devicePixelRatio || 1);
    ids.slice(S.page * per, S.page * per + per).forEach(id => { const d = get(id), tier = seen[id], el = document.createElement('div'); el.className = 'lk-stk' + (tier != null ? ' got' : ''); el.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;';
      const c = document.createElement('canvas'); c.width = c.height = Math.round(S.cell * dpr); c.style.width = c.style.height = S.cell + 'px'; const q = c.getContext('2d'); q.scale(dpr, dpr);
      if(tier != null) card(q, {base: id, tier}, 2, 2, S.cell - 4, S.cell - 4, 0); else { q.fillStyle = 'rgba(58,70,96,0.12)'; q.beginPath(); D.rr(q, 2, 2, S.cell - 4, S.cell - 4, S.cell * 0.16); q.fill(); sil(q, id, 2, 2, S.cell - 4, S.cell - 4); }
      const t = document.createElement('div'); t.style.cssText = 'font-weight:700;font-size:12px;max-width:' + (S.cell + 4) + 'px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'; t.textContent = tier != null ? (d ? d.name : id) : '?';
      el.appendChild(c); el.appendChild(t); G.appendChild(el); });
    const dots = $('.lk-dots'); dots.innerHTML = ''; for(let p = 0; p < pages; p++){ const s = document.createElement('span'); if(p === S.page) s.className = 'on'; dots.appendChild(s); }
    $('.lk-prev').disabled = S.page <= 0; $('.lk-next').disabled = S.page >= pages - 1; $('.lk-pager').style.visibility = pages > 1 ? 'visible' : 'hidden'; }
  $('.lk-prev').onclick = () => { S.page--; render(); }; $('.lk-next').onclick = () => { S.page++; render(); };
  const close = () => { if(S.closed) return; S.closed = true; window.removeEventListener('resize', lay); ov.remove(); if(o.onClose) o.onClose(); };
  $('.lk-x').onclick = close; window.addEventListener('resize', lay); lay();
  const api = {el: ov, close, S, found, pct, page: p => { S.page = p; render(); }}; ov._lk = api; return api; }
/* ---------------- 🍙 food + 🧪 potion pictures (code-drawn, from sheet av-r0f) + the built-in island foods ---------------- */
const UP = (g, parts, rw) => D.piece(g, parts, '#2A1C14', rw || 1.6);
const plateP = (g, w, col) => UP(g, [{path: g => D.ell(g, 0, 6, w, w * 0.32), fill: g => D.lin(g, 0, -4, 0, 16, [col || '#FFFFFF', D.sh(col || '#DDE6F0', -0.1)])}]);
const FOODP = {
  rice: g => { UP(g, [{path: g => { g.moveTo(-44, 4); g.quadraticCurveTo(0, -18, 44, 4); g.quadraticCurveTo(0, 22, -44, 4); g.closePath(); }, fill: g => D.lin(g, -44, 0, 44, 0, ['#5DBB4A', '#2E8A30'])}]);
    UP(g, [{path: g => { g.moveTo(-30, 6); g.quadraticCurveTo(-28, -26, 0, -28); g.quadraticCurveTo(28, -26, 30, 6); g.closePath(); }, fill: g => D.lin(g, 0, -28, 0, 6, ['#FFFFFF', '#E9E4DA'])}]);
    [-14, 0, 14].forEach((x, n) => UP(g, [{path: g => { g.save(); g.translate(x + 8, -4 - n * 3); g.rotate(-0.5 + n * 0.12); D.ell(g, 0, 0, 13, 6.5); g.restore(); }, fill: g => D.lin(g, x - 6, -14, x + 20, 4, ['#FFD84A', '#FF9F1A'])}], 1.3)); },
  fish: g => { g.strokeStyle = '#B07842'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-40, 22); g.lineTo(38, -22); g.stroke();
    UP(g, [{path: g => { g.save(); g.rotate(-0.5); D.ell(g, 0, 0, 30, 13); g.restore(); }, fill: g => D.lin(g, -20, -14, 20, 14, ['#9FC7E8', '#5A86B8'])}, {path: g => { g.save(); g.rotate(-0.5); g.moveTo(-28, 0); g.lineTo(-44, -12); g.lineTo(-42, 12); g.closePath(); g.restore(); }, fill: '#5A86B8'}]);
    g.save(); g.rotate(-0.5); g.strokeStyle = '#3A2A1A'; g.lineWidth = 2.6; [-12, -2, 8].forEach(x => { g.beginPath(); g.moveTo(x, -10); g.lineTo(x + 6, 10); g.stroke(); }); g.restore(); },
  coconut: g => { UP(g, [{path: g => D.ell(g, 0, 0, 30, 28), fill: g => D.rad(g, -10, -10, 4, 34, ['#B07842', '#7A4A2A', '#4A2A14'])}, {path: g => D.ell(g, 0, -20, 20, 7), fill: '#FFFDF4'}]);
    g.strokeStyle = '#FF6FA8'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(4, -20); g.lineTo(14, -46); g.lineTo(22, -48); g.stroke(); },
  pancake: g => { plateP(g, 40); [0, 1, 2].forEach(n => UP(g, [{path: g => D.ell(g, 0, 2 - n * 9, 30, 9), fill: g => D.lin(g, 0, -8 - n * 9, 0, 10 - n * 9, ['#F2C67A', '#C88A3A'])}]));
    [-14, 0, 14].forEach(x => UP(g, [{path: g => D.ell(g, x, -24, 7, 4.5), fill: '#FFF2B0'}], 1.2)); },
  cactus: g => { plateP(g, 40, '#FFF4DA'); UP(g, [{path: g => { g.moveTo(-24, 4); g.lineTo(-24, -26); g.lineTo(0, -36); g.lineTo(24, -26); g.lineTo(24, 4); g.lineTo(0, 14); g.closePath(); }, fill: 'rgba(110,210,120,0.9)'}, {path: g => { g.moveTo(-24, -26); g.lineTo(0, -16); g.lineTo(24, -26); g.lineTo(0, -36); g.closePath(); }, fill: 'rgba(180,250,170,0.95)'}]); },
  soup: g => { UP(g, [{path: g => { g.moveTo(-36, -6); g.quadraticCurveTo(-34, 26, 0, 28); g.quadraticCurveTo(34, 26, 36, -6); g.closePath(); }, fill: g => D.lin(g, -36, 0, 36, 0, ['#E2553A', '#B5372A'])}, {path: g => D.ell(g, 0, -6, 36, 9), fill: '#FFB347'}]);
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 3.4; g.lineCap = 'round'; [-14, 0, 14].forEach(x => { g.beginPath(); g.moveTo(x, -18); g.bezierCurveTo(x - 8, -26, x + 8, -32, x, -42); g.stroke(); }); },
  chili: g => { g.strokeStyle = '#B07842'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-42, 18); g.lineTo(40, -18); g.stroke();
    [[-24, 10, 'c'], [-6, 2, 'm'], [12, -6, 'c'], [28, -13, 'm']].forEach(([x, y, k]) => { if(k === 'c') UP(g, [{path: g => { g.save(); g.translate(x, y); g.rotate(-0.4); g.moveTo(-10, -6); g.quadraticCurveTo(14, -8, 12, 10); g.quadraticCurveTo(0, 2, -10, 6); g.closePath(); g.restore(); }, fill: '#E8262A'}], 1.3);
      else UP(g, [{path: g => D.rr(g, x - 8, y - 8, 16, 16, 4), fill: g => D.lin(g, x, y - 8, x, y + 8, ['#C8743A', '#7A3A1A'])}], 1.3); }); },
  seagrape: g => { UP(g, [{path: g => { g.moveTo(-38, 0); g.quadraticCurveTo(0, 30, 38, 0); g.closePath(); }, fill: g => D.lin(g, 0, 0, 0, 24, ['#FFD0DC', '#FF8FB0'])}]);
    for(let n = 0; n < 16; n++){ const x = -26 + (n % 6) * 10 + (n > 5 ? 5 : 0), y = -4 - Math.floor(n / 6) * 8 - (n % 2) * 3; UP(g, [{path: g => D.ell(g, x, y, 5, 5), fill: g => D.rad(g, x - 2, y - 2, 1, 6, ['#C8F5A0', '#4CB13A'])}], 1); } },
  cheese: g => { UP(g, [{path: g => { g.moveTo(-34, 14); g.lineTo(30, 14); g.lineTo(30, -6); g.closePath(); }, fill: '#F2B728'}, {path: g => { g.moveTo(-34, 14); g.lineTo(30, -6); g.lineTo(22, -22); g.closePath(); }, fill: g => D.lin(g, -34, 0, 30, -20, ['#FFE36A', '#FFC21A'])}]);
    g.fillStyle = '#D99A10'; [[8, 6, 4], [-8, 10, 3], [20, 4, 3]].forEach(([x, y, r]) => { g.beginPath(); D.ell(g, x, y, r, r * 0.8); g.fill(); }); },
  cake: g => { plateP(g, 44); UP(g, [{path: g => D.rr(g, -32, -16, 64, 24, 6), fill: g => D.lin(g, 0, -16, 0, 8, ['#FFD0E4', '#FF9EC4'])}, {path: g => D.rr(g, -20, -38, 40, 22, 6), fill: g => D.lin(g, 0, -38, 0, -16, ['#FFFFFF', '#F2E6EE'])}]);
    UP(g, [{path: g => { g.moveTo(-12, -40); g.lineTo(-12, -54); g.lineTo(-6, -46); g.lineTo(0, -56); g.lineTo(6, -46); g.lineTo(12, -54); g.lineTo(12, -40); g.closePath(); }, fill: '#FFC21A'}], 1.3); }};
function potionP(col){ return g => { UP(g, [{path: g => { g.moveTo(-8, -40); g.lineTo(8, -40); g.lineTo(8, -26); g.quadraticCurveTo(28, -18, 28, 4); g.quadraticCurveTo(28, 26, 0, 26); g.quadraticCurveTo(-28, 26, -28, 4); g.quadraticCurveTo(-28, -18, -8, -26); g.closePath(); }, fill: 'rgba(235,250,255,0.9)'},
    {path: g => { g.moveTo(-26, 0); g.quadraticCurveTo(0, -8, 26, 0); g.quadraticCurveTo(26, 24, 0, 24); g.quadraticCurveTo(-26, 24, -26, 0); g.closePath(); }, fill: g => D.lin(g, 0, -6, 0, 24, [D.sh(col, 0.3), col, D.sh(col, -0.3)])}, {path: g => D.rr(g, -10, -50, 20, 12, 4), fill: '#B07842'}]);
  g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); D.ell(g, -14, -4, 4, 9); g.fill(); }; }
addUse('food', {
  rice: {name: 'Mango sticky rice', icon: '🥭', island: 'jungle', eff: [{k: 'heal', v: 40}, {k: 'luck', v: 10, fights: 1}], cook: {mango: 2, grain: 1}, paint: FOODP.rice},
  fish: {name: 'Grilled fish', icon: '🐟', island: 'beach', eff: [{k: 'heal', v: 30}, {k: 'power', v: 10, turns: 3}], cook: {fish: 1, wood: 1}, paint: FOODP.fish},
  coconut: {name: 'Coconut water', icon: '🥥', island: 'cove', eff: [{k: 'heal', v: 20}, {k: 'clear'}], cook: {coconut: 1}, paint: FOODP.coconut},
  pancake: {name: 'Banana pancake', icon: '🥞', island: 'farm', eff: [{k: 'speed', v: 1, turns: 3}], cook: {banana: 2, grain: 1}, paint: FOODP.pancake},
  cactus: {name: 'Cactus jelly', icon: '🌵', island: 'desert', eff: [{k: 'shield', v: 20}], cook: {cactus: 2, honey: 1}, paint: FOODP.cactus},
  soup: {name: 'Hot soup', icon: '🍲', island: 'snow', eff: [{k: 'hot', v: 5, turns: 5}], cook: {bone: 1, herb: 2}, paint: FOODP.soup},
  chili: {name: 'Chili skewer', icon: '🌶️', island: 'lava', eff: [{k: 'fire', v: 20, turns: 3}], cook: {chili: 2, bone: 1}, paint: FOODP.chili},
  seagrape: {name: 'Sea-grape salad', icon: '🍇', island: 'coral', eff: [{k: 'dodge', v: 10, turns: 3}], cook: {seagrape: 2, shell: 1}, paint: FOODP.seagrape},
  cheese: {name: 'Moon cheese', icon: '🧀', island: 'moon', eff: [{k: 'cost', v: 1, turns: 2}], cook: {moonmilk: 1, spark: 1}, paint: FOODP.cheese},
  cake: {name: 'Royal cake', icon: '🍰', island: 'kingdom', eff: [{k: 'all', v: 5, fights: 1}], cook: {strawberry: 2, grain: 2, gem: 1}, paint: FOODP.cake}});
POTIONS.push(...addUse('potion', {
  heal: {name: 'Heal potion', icon: '❤️', eff: [{k: 'heal', v: 50}], paint: potionP('#FF5A6E')},
  power: {name: 'Power-up', icon: '⚡', eff: [{k: 'power', v: 25, fights: 1}], paint: potionP('#FFC21A')},
  shield: {name: 'Shield potion', icon: '🛡️', eff: [{k: 'shield', v: 30}], paint: potionP('#5AA8FF')},
  lucky: {name: 'Lucky potion', icon: '🍀', eff: [{k: 'drops', v: 3}], paint: potionP('#4CC870')},
  aura: {name: 'Aura potion', icon: '🌟', eff: [{k: 'aura', v: 3}], paint: potionP('#B58CFF')}}));   // 🌟 +3 Aura dots (av-r0g2)
function usePic(g, id, x, y, w, h){ const d = useDef(id); if(!d) return; if(d.paint) D.fit(g, 'use:' + id, q => d.paint(q), x, y, w, h); else { g.font = Math.floor(Math.min(w, h) * 0.7) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(d.icon, x + w / 2, y + h / 2); } }
/* ⚔️ quick bar — 3 round gold slots for battle: tap = use one (once per turn); Loot.quickBar(el, B, {onUse(res), onChange}) → {render, newTurn, el} */
function quickBar(el, B, o){ o = o || {}; css(); const box = document.createElement('div'); box.className = 'lk-qbar'; el.appendChild(box); let used = false;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  function render(){ box.innerHTML = ''; for(let i = 0; i < QB_N; i++){ const id = B.qb[i], n = id ? (B.u[id] || 0) : 0, b = document.createElement('button'); b.className = 'lk-qs' + (id ? '' : ' empty') + (id && !n ? ' out' : ''); b.dataset.s = i;
      b.setAttribute('aria-label', id ? useName(id) + ' ×' + n : 'Empty quick slot'); b.disabled = !id || !n || used;
      if(id){ const c = document.createElement('canvas'), S = 56; c.width = c.height = Math.round(S * dpr); b.appendChild(c); const q = c.getContext('2d'); q.scale(dpr, dpr); usePic(q, id, 6, 6, S - 12, S - 12); b.insertAdjacentHTML('beforeend', '<i>×' + n + '</i>'); } else b.textContent = '+';
      b.onclick = () => { if(used) return; const r = B.quickUse(i); if(!r.ok) return; used = true; b.classList.add('pop'); render(); if(o.onUse) o.onUse(r); if(o.onChange) o.onChange(B); };
      box.appendChild(b); }
    const a = document.createElement('button'); a.className = 'lk-qa' + (B.qa ? ' on' : ''); a.innerHTML = '🤖<i>' + (B.qa ? 'on' : 'off') + '</i>'; a.setAttribute('aria-label', 'Auto-heal ' + (B.qa ? 'on' : 'off') + ': drink a heal when HP is under 30 %');
    a.onclick = () => { B.qa = !B.qa; render(); if(o.onChange) o.onChange(B); }; box.appendChild(a); }
  // 🤖 the game calls check(hp 0..1) each turn: auto-heal on + HP < 30 % + nothing used yet → the first ❤️ heal on the bar is used (it IS this turn's use)
  function check(hp){ if(used) return null; const r = B.autoHeal(hp, o); if(!r.ok) return null; used = true; render(); const s = box.querySelector('[data-s="' + r.slot + '"]'); if(s) s.classList.add('auto'); if(o.onUse) o.onUse(r); if(o.onChange) o.onChange(B); return r; }
  render(); return {el: box, render, check, newTurn(){ used = false; render(); }, used: () => used}; }
/* ---------------- demo items (lab + tests; games add their own with Loot.add) ---------------- */
add('demo', {blade: {name: 'Steel Blade', kind: 'weapon', slot: 'hand', paint: P.weapon}, helm: {name: 'Plume Helm', kind: 'wear', slot: 'head', paint: P.helm}, amulet: {name: 'Sun Amulet', kind: 'acc', slot: 'neck', paint: P.amulet}}, {by: 'LootKit', date: '2026-11-17'});
const API = {VERSION, RAR, RB: P.RB, SRC, SOCK, STATS, LUCK_STEPS, MAX_SLOTS, ITEMS, BLOCKS,
  frame: P.frame, gem: P.gem, card, sil, beam: P.beam, chest: P.chest, coin: P.coin, coins: P.coins, shard: P.shard, lucky: P.lucky, mailbox: P.mailbox, wheel: P.wheel, cloudWrap: P.cloudWrap, rays: P.rays,
  add, get, list, power, price, bonus, recycleOf, rng, hash, today, range, roll, choose, party, showFor, freshState, missing, bag, pack, unpack,
  show, reveal, bagSheet, book, LOG, MATS, MAT_DROP, MAT_POOL, addMat, matName, matIcon,
  USES, USE_MAX, QB_N, ISLES, EFF, addUse, useDef, useName, effRow, usePic, quickBar, USE_DROP, POTIONS, food: FOODP,
  STAR_MAX, STAR_POW, ELS, BEATS, EL_MULT, EL_LV, SPELL_LV, CORE_DROP, FORGE_COST, AUTO_UNDER, elVs, elMult, hitMult, spellMult, forge, react: () => (css(), REACT), sparkle, THEMES, theme: (n, el) => (css(), theme(n, el)), iconize, demo: {paint: {blade: P.weapon, helm: P.helm, amulet: P.amulet}}};
if(typeof LD !== 'undefined' && LD) window.Loot = API; else window.LootKitDraft = API;
})();
})();
