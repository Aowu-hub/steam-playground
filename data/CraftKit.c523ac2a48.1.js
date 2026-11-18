
/* 🔨 CraftKit — window.Craft   (include AFTER UiKit + AvatarKit + LootKit — it spends what 🎁 LootKit gives: items · rarity · the materials pouch · cores · foods)
   ─ Materials ─ FAM = 8 families × 3 grades (🪵 Mango wood · Teak · Sky-ash · 🪨 Copper · Iron · Star iron · 🌿 Basil · Moon herb · Sun lotus · 🧵 Cotton · Silk · Cloud silk · 💎 Quartz · Ruby · Sky diamond
            · 🦴 Bone · Shell · Dragon scale · 📘 Blue · Green · Gold book · ☁️ Sky Shard (= the bag's shards) · Shard cluster · Sky heart), registered into Loot.MATS · matPic(g, id, x, y, k, t) = the 2.5D picture (IsoProps rules)
            have(bag, id) · take(bag, id, n) · check(bag, {mats, coins}) → {ok, rows: [{id, icon, name, need, have, ok}], missing} · pay(bag, cost) · where(id) = where a missing one comes from
   ─ Places ─ PLACES shop · smith · cook (keeper = an AvatarKit avatar) · ONE level per place shared by every town and every game: S = state(save) → S.lv('smith') · S.gain(k, xp) · S.toJSON() (keep it in your save)
   ─ ⚒️ Blacksmith ─ addRecipe(pack, {id: {base: LootKit item id, tiers: [lo, hi], mats: {id: n}, coins, smith: lv, town: lv}}) → '<pack>.<id>' · canCraft(bag, S, id, {town}) → {ok | why: smith|town|mats}
            craft(bag, S, id, {seed, town}) (tier rolled ON contact — odds(R, S): low end most often, +4 % to the top per Smith level above the recipe's) · upCost(it) / upgrade(bag, S, i) ★1 → ★5 (+8 % power each, LootKit power())
            mergeGroups(bag) / merge(bag, S, base, tier) 3 → 1 tier up (never above capOf(base), never ☀️, 🔒 never) · recycle(bag, S, i, {sure}) · forgeCost(it, el) / forge(bag, S, i, el, {sure}) (cores + coins, 🔄 swap = half back)
   ─ 🍳 Cook ─ cookList() (LootKit foods with a cook recipe) · learn(S, bag) (FOUND the first time you hold one of its ingredients) · canCook / cook(bag, S, id, n) (×99 stacks)
   ─ 🛒 Shop ─ stock({town 1–5, day, region}) (basic things only, a 📅 deal −30 % per day) · buy(bag, S, row, n) · 🔁 buy back = LootKit bag.buyBack
   ─ UI ─ open(box, 'shop'|'smith'|'cook', {bag, state, town, basic, theme, tab, backLabel, onChange, onCraft, onEquip, onClose}) → {el, close, tab(k), pick(i), render, V}
          wide = keeper · list · detail side by side; upright = keeper strip · list · detail below; lists page with ‹ dots › (no page scroll, no sideways rows) · 💬 Tell us hidden while open
          🎬 moments on the beat clock: ⚒️ craft 5 beats (ready · wind-up · 💥 CLANG = contact · follow · settle) · 🔥 forge 3 hammer hits · 🍳 cook 4 beats (add · stir · 💥 bubble · pop on a plate)
          ⭐ Junior+ (not basic): a ring glows before each contact — tap it = perfect (same result, sparkle + bigger sound) · 🌱 basic: the hammer hits by itself · window.CK_FAST = instant (tests) · LOG = last moments */
(function(){
'use strict';
if(window.Craft) return;
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
let CD = null;
/* 🔨 av-r0i — CraftKit painters (no emoji inside canvas art). In the sheets page this file sets window.CraftDraft; in CraftKit.html the build turns it into the kit's CD.
   🧱 materials = 8 families × 3 grades as 2.5D pictures on the IsoProps rules (2 : 1 iso · top +25 % / left +12 % / right −16 % · ONE rim #2A1C14) · 🔥 the 8 element cores (a shape each)
   · ⚒️ anvil + hammer · 🍳 cook pot · 🧺 gathering spots. Sources: the av-r0h picture sheets (9o common · 9w materials). */
(function(){
'use strict';
const D = (typeof AVD !== 'undefined' && AVD) ? AVD : window.AVD;
if(!D) return;
const RIM = '#2A1C14', TAU = Math.PI * 2;
const P = (g, parts, rw) => D.piece(g, parts, RIM, rw || 1.6);
const top = c => D.sh(c, 0.25), lft = c => D.sh(c, 0.12), rgt = c => D.sh(c, -0.16);
const PC = (g, parts) => D.piece(g, parts, RIM, 1.5);
// iso point: u → right-down, v → left-down, z up (k px per unit, 2 : 1)
const IP = (k, u, v, z) => [(u - v) * k, (u + v) * k / 2 - z * k];
function box(k, u0, v0, z0, w, d, h, col){ const p = (u, v, z) => IP(k, u, v, z), poly = pts => g => { g.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(q => g.lineTo(q[0], q[1])); g.closePath(); };
  return [{path: poly([p(u0 + w, v0, z0 + h), p(u0 + w, v0 + d, z0 + h), p(u0 + w, v0 + d, z0), p(u0 + w, v0, z0)]), fill: rgt(col)},
          {path: poly([p(u0, v0 + d, z0 + h), p(u0 + w, v0 + d, z0 + h), p(u0 + w, v0 + d, z0), p(u0, v0 + d, z0)]), fill: lft(col)},
          {path: poly([p(u0, v0, z0 + h), p(u0 + w, v0, z0 + h), p(u0 + w, v0 + d, z0 + h), p(u0, v0 + d, z0 + h)]), fill: top(col)}]; }
function shadow(g, k, r){ g.fillStyle = 'rgba(30,40,20,0.18)'; g.beginPath(); D.ell(g, 0, 0, r * k, r * k / 2); g.fill(); }
function log(k, u0, v, z, len, r, col){ const a = IP(k, u0, v, z + r), b = IP(k, u0 + len, v, z + r), rx = r * k * 0.72, ry = r * k;
  return [{path: g => { g.moveTo(a[0] + ry * 0.45, a[1] - ry * 0.9); g.lineTo(b[0] + ry * 0.45, b[1] - ry * 0.9); g.lineTo(b[0] - ry * 0.45, b[1] + ry * 0.9); g.lineTo(a[0] - ry * 0.45, a[1] + ry * 0.9); g.closePath(); D.ell(g, a[0], a[1], rx, ry, 0.4636); }, fill: g => D.lin(g, a[0], a[1] - ry, a[0], a[1] + ry, [top(col), col, rgt(col)])},
          {path: g => D.ell(g, b[0], b[1], rx, ry, 0.4636), fill: D.sh(col, 0.45), after: g => { g.strokeStyle = D.rgba(D.sh(col, -0.35).replace(/^rgb\((\d+),(\d+),(\d+)\)$/, (m, r, gg, bb) => '#' + [r, gg, bb].map(x => (+x).toString(16).padStart(2, '0')).join('')), 0.6); g.lineWidth = 1.2; [0.62, 0.3].forEach(f => { g.beginPath(); D.ell(g, b[0], b[1], rx * f, ry * f, 0.4636); g.stroke(); }); }}]; }
function crystal(k, u, v, h, w, col, lean){ const b = IP(k, u, v, 0), t = [b[0] + (lean || 0) * k, b[1] - h * k];
  return [{path: g => { g.moveTo(b[0] - w * k, b[1] - h * k * 0.3); g.lineTo(t[0], t[1]); g.lineTo(b[0] + w * k * 0.05, b[1] + w * k * 0.35); g.closePath(); }, fill: lft(col)},
          {path: g => { g.moveTo(b[0] + w * k, b[1] - h * k * 0.3); g.lineTo(t[0], t[1]); g.lineTo(b[0] + w * k * 0.05, b[1] + w * k * 0.35); g.closePath(); }, fill: rgt(col)},
          {path: g => { g.moveTo(b[0] - w * k * 0.35, b[1] - h * k * 0.62); g.lineTo(t[0], t[1]); g.lineTo(b[0] + w * k * 0.35, b[1] - h * k * 0.62); g.closePath(); }, fill: top(col)}]; }
function rockLump(k, col, s){ s = s || 1; return [{path: g => { const Q = [[-1.1, 0.2, 0], [-0.9, -0.5, 0.9], [-0.2, -0.9, 1.4], [0.7, -0.6, 1.2], [1.1, 0.1, 0.4], [0.6, 0.6, 0], [-0.4, 0.6, 0]].map(([u, v, z]) => IP(k, u * s, v * s, z * s));
    g.moveTo(Q[0][0], Q[0][1]); Q.slice(1).forEach(q => g.lineTo(q[0], q[1])); g.closePath(); }, fill: g => D.lin(g, -k, -k * 1.4 * s, k, k * 0.5, [top(col), col, rgt(col)])}]; }
function shardGem(g, x, y, r){ g.save(); g.translate(x, y); P(g, [{path: g => { g.moveTo(0, -r); g.lineTo(r * 0.62, -r * 0.1); g.lineTo(0, r); g.lineTo(-r * 0.62, -r * 0.1); g.closePath(); }, fill: g => D.lin(g, -r, -r, r, r, ['#FFFFFF', '#BFE9FF', '#7FC8F0'])}], 1.4);
  g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.moveTo(-r * 0.2, -r * 0.6); g.lineTo(0, -r * 0.1); g.lineTo(-r * 0.36, -r * 0.1); g.closePath(); g.fill(); g.restore(); }
/* ---- 🧱 the 8 × 3 materials (Aowu §21c pick 5 = these names) — id · name · colour · where it comes from ---- */
const FAM = [
  ['wood', '🪵', 'Wood', [['wood', 'Mango wood', '#C8874A', 'jungle trees · 🛒 shop'], ['teak', 'Teak', '#8A4A2A', 'big trees · Town Lv 3 shop'], ['skyash', 'Sky-ash', '#E8EEF2', 'sky islands · glows']]],
  ['ore', '🪨', 'Ore', [['ore', 'Copper ore', '#B07850', 'rocks · 🛒 shop'], ['iron', 'Iron ore', '#7A8494', 'mountain rocks · Town Lv 3 shop'], ['stariron', 'Star iron', '#3A3550', 'meteor rocks at night']]],
  ['herb', '🌿', 'Herb', [['herb', 'Basil leaf', '#4CB13A', 'bushes · 🛒 shop'], ['moonherb', 'Moon herb', '#8FB8E8', 'night bushes'], ['sunlotus', 'Sun lotus', '#FF8FB8', 'ponds (rare)']]],
  ['cloth', '🧵', 'Cloth', [['cotton', 'Cotton', '#F2E6CC', 'farm · 🛒 shop'], ['silk', 'Silk', '#A45BFF', 'silk moths · Town Lv 4 shop'], ['cloudsilk', 'Cloud silk', '#DFF4FF', 'Sky Pop isles']]],
  ['gem', '💎', 'Gem', [['gem', 'Quartz', '#E8F0FF', 'any rock (rare)'], ['ruby', 'Ruby', '#E8303A', 'lava rocks'], ['skydiamond', 'Sky diamond', '#BFF2FF', 'bosses']]],
  ['part', '🦴', 'Monster part', [['bone', 'Bone', '#F4ECD8', 'beasts · reptiles'], ['shell', 'Shell', '#FFB27A', 'bugs · coral'], ['scale', 'Dragon scale', '#7A5CC8', 'mini bosses']]],
  ['book', '📘', 'Skill book', [['book1', 'Blue book', '#3A8DFF', 'ranks 1–2'], ['book2', 'Green book', '#4CC764', 'ranks 3–4'], ['book3', 'Gold book', '#FFC21A', 'rank 5']]],
  ['shard', '☁️', 'Sky Shard', [['skyshard', 'Sky Shard', '#BFE9FF', 'duplicate gear'], ['skycluster', 'Shard cluster', '#9AD8FF', '5 shards'], ['skyheart', 'Sky heart', '#FFFFFF', 'Sky God gear']]]];
const MATDEF = {}; FAM.forEach(f => f[3].forEach((m, gr) => { MATDEF[m[0]] = {id: m[0], fam: f[0], gr, name: m[1], col: m[2], where: m[3], icon: f[0] === 'book' ? ['📘', '📗', '📙'][gr] : f[1]}; }));
function mat(g, id, x, y, k, t){ const M = MATDEF[id]; if(!M) return false; const fam = M.fam, gr = M.gr, col = M.col; g.save(); g.translate(x, y); shadow(g, k, 1.5);
  if(fam === 'wood'){ PC(g, [].concat(log(k, -1.2, 0.5, 0, 2.2, 0.42, col), log(k, -1.2, -0.4, 0, 2.2, 0.42, col), log(k, -1.0, 0.05, 0.78, 2.0, 0.42, col))); if(gr === 2){ D.glow(g, 0, -k, k * 2.2, '#BFE9FF', 0.4); D.sparkle(g, k * 0.9, -k * 1.6, k * 0.25, '#FFFFFF'); } }
  if(fam === 'ore'){ PC(g, rockLump(k, gr === 2 ? '#3A3550' : '#8A8070', 1.1)); const fl = gr === 0 ? '#FF9F4A' : gr === 1 ? '#C8D8EC' : '#FFE58A';
    [[-0.5, -0.9], [0.2, -1.1], [0.5, -0.6], [-0.2, -0.45]].forEach(([a, b], i) => { g.fillStyle = fl; g.beginPath(); D.star(g, a * k, b * k, k * (gr === 2 ? 0.22 : 0.15), k * 0.07, gr === 2 ? 4 : 5, i); g.fill(); }); if(gr === 2) D.glow(g, 0, -k * 0.8, k * 1.8, '#FFE58A', 0.3); }
  if(fam === 'herb'){ const lv = n => ({path: g => { const a = -1.9 + n * 0.45, L = k * (1.5 + (n % 2) * 0.3); g.save(); g.translate(0, -k * 0.3); g.rotate(a + Math.PI / 2); g.moveTo(0, 0); g.quadraticCurveTo(k * 0.45, -L * 0.5, 0, -L); g.quadraticCurveTo(-k * 0.45, -L * 0.5, 0, 0); g.restore(); }, fill: n % 2 ? D.sh(gr === 2 ? '#4CB13A' : col, 0.15) : gr === 2 ? '#3E9A35' : col});
    const ps = [0, 1, 2, 3, 4, 5, 6].map(lv); ps.push({path: g => D.rr(g, -k * 0.35, -k * 0.55, k * 0.7, k * 0.32, k * 0.1), fill: '#C8874A'}); PC(g, ps);
    if(gr === 2) PC(g, [{path: g => { for(let i = 0; i < 6; i++){ g.save(); g.translate(0, -k * 1.7); g.rotate(i * TAU / 6); g.moveTo(0, 0); g.quadraticCurveTo(k * 0.3, -k * 0.35, 0, -k * 0.6); g.quadraticCurveTo(-k * 0.3, -k * 0.35, 0, 0); g.restore(); } }, fill: g => D.rad(g, 0, -k * 1.7, 1, k * 0.6, ['#FFF3B0', '#FF8FB8'])}]);
    if(gr === 1) D.glow(g, 0, -k, k * 1.6, '#BFE0FF', 0.4); }
  if(fam === 'cloth'){ PC(g, [].concat(box(k, -1, -0.7, 0, 2, 1.4, 0.35, col), box(k, -0.9, -0.65, 0.35, 1.8, 1.3, 0.35, ['#E8D8B8', '#C49BFF', '#C8EAFF'][gr]), box(k, -0.8, -0.6, 0.7, 1.6, 1.2, 0.35, col)));
    if(gr === 1){ g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-k * 0.6, -k * 0.9); g.quadraticCurveTo(0, -k * 1.2, k * 0.8, -k * 0.7); g.stroke(); }
    if(gr === 2){ g.fillStyle = '#FFFFFF'; [[-0.7, -1.25], [0, -1.45], [0.7, -1.2]].forEach(([a, b]) => { g.beginPath(); D.ell(g, a * k, b * k, k * 0.38, k * 0.24); g.fill(); }); } }
  if(fam === 'gem'){ PC(g, [].concat(crystal(k, -0.5, 0.1, 1.3, 0.4, col, -0.3), crystal(k, 0.5, -0.2, 1.1, 0.36, col, 0.3), crystal(k, 0, 0.3, 2.0, 0.5, col, 0))); D.sparkle(g, k * 0.2, -k * 1.6, k * 0.26, '#FFFFFF'); if(gr === 2) D.glow(g, 0, -k, k * 2, '#BFF2FF', 0.5); }
  if(fam === 'part'){ if(gr === 0) PC(g, [{path: g => { [[-1, -0.2], [1, 0.3]].forEach(([a, b]) => { D.ell(g, a * k, (b - 0.35) * k, k * 0.32, k * 0.32); D.ell(g, a * k, (b + 0.05) * k, k * 0.32, k * 0.32); }); g.moveTo(-k, -k * 0.35); g.lineTo(k, k * 0.1); g.lineTo(k, k * 0.45); g.lineTo(-k, -k * 0.05); g.closePath(); }, fill: g => D.lin(g, 0, -k, 0, k * 0.5, [top(col), col, rgt(col)])}]);
    if(gr === 1) PC(g, [{path: g => { g.moveTo(-k * 1.1, 0); g.quadraticCurveTo(-k * 1.2, -k * 1.4, 0, -k * 1.5); g.quadraticCurveTo(k * 1.2, -k * 1.4, k * 1.1, 0); g.quadraticCurveTo(0, k * 0.4, -k * 1.1, 0); g.closePath(); }, fill: g => D.lin(g, 0, -k * 1.5, 0, 0, [top(col), col, rgt(col)]),
      after: g => { g.strokeStyle = D.rgba(RIM, 0.35); g.lineWidth = 1.4; [-0.6, 0, 0.6].forEach(a => { g.beginPath(); g.moveTo(a * k * 1.2, 0); g.quadraticCurveTo(a * k, -k * 0.8, 0, -k * 1.45); g.stroke(); }); }}]);
    if(gr === 2){ const sc = (x, y, s) => ({path: g => { g.moveTo(x, y - s); g.quadraticCurveTo(x + s * 0.9, y - s * 0.4, x, y + s); g.quadraticCurveTo(x - s * 0.9, y - s * 0.4, x, y - s); }, fill: g => D.lin(g, x - s, y - s, x + s, y + s, [top(col), col, rgt(col)])}); PC(g, [sc(-k * 0.5, -k * 0.6, k * 0.7), sc(k * 0.5, -k * 0.75, k * 0.7), sc(0, -k * 1.1, k * 0.8)]); D.glow(g, 0, -k * 0.8, k * 1.6, '#C69CFF', 0.35); } }
  if(fam === 'book'){ const ps = [].concat(box(k, -0.9, -0.6, 0, 1.8, 1.2, 0.36, '#FFF6E2'), box(k, -0.95, -0.65, 0.36, 1.9, 1.3, 0.12, col)); ps.unshift.apply(ps, box(k, -0.95, -0.65, -0.02, 1.9, 1.3, 0.12, col)); PC(g, ps);
    const c = IP(k, 0, 0, 0.5); g.fillStyle = gr === 2 ? '#FFFFFF' : '#FFE58A'; g.beginPath(); D.star(g, c[0], c[1], k * 0.32, k * 0.14, 5); g.fill(); if(gr === 2) D.glow(g, 0, -k * 0.6, k * 1.6, '#FFE58A', 0.4); }
  if(fam === 'shard'){ const n = [1, 3, 5][gr]; for(let i = 0; i < n; i++){ const a = i / n * TAU, rr = n === 1 ? 0 : k * 0.7; shardGem(g, Math.cos(a) * rr, -k * 0.9 + Math.sin(a) * rr * 0.5, k * (gr === 2 ? 0.95 : 0.75) * (i ? 0.75 : 1)); }
    if(gr === 2){ D.glow(g, 0, -k, k * 2.4, '#FFF6C8', 0.6); D.glow(g, 0, -k, k * 1.6, '#FFC21A', 0.25); } }
  g.restore(); return true; }
/* ---- 🔥 the 8 element cores (each its own SHAPE, reads without colour) ---- */
const EC = {fire: ['#FF7A2E', '#FFC23D', '#C8361A', '#FFF0A0'], water: ['#3A9BFF', '#8FD3FF', '#1F5FB0', '#E8FBFF'], leaf: ['#4CB13A', '#9BE07A', '#2E7A26', '#FFE14D'], rock: ['#A07850', '#D2B48C', '#6A4A2E', '#F2E3C4'],
  wind: ['#3FC9B8', '#B8F2EA', '#1F8A80', '#FFFFFF'], bolt: ['#FFC81A', '#FFF08A', '#C08A00', '#5A3AFF'], star: ['#FF8FD8', '#FFE0F4', '#C0479A', '#FFF3B0'], dark: ['#7A5CC8', '#B9A3F0', '#3E2A78', '#FFD23F']};
function core(g, el, x, y, s){ const E = EC[el]; if(!E) return; g.save(); g.translate(x, y); g.scale(s, s); D.glow(g, 0, 0, 46, E[0], 0.45);
  const F = g => D.rad(g, -8, -10, 2, 34, [E[3], E[1], E[0], E[2]]), path = {
    fire: g => { g.moveTo(0, -30); g.bezierCurveTo(16, -12, 22, 2, 14, 16); g.quadraticCurveTo(0, 28, -14, 16); g.bezierCurveTo(-22, 2, -10, -8, -6, -18); g.quadraticCurveTo(-2, -6, 0, -30); g.closePath(); },
    water: g => D.ell(g, 0, 0, 22, 22), leaf: g => { g.moveTo(0, -28); g.quadraticCurveTo(22, -6, 0, 24); g.quadraticCurveTo(-22, -6, 0, -28); g.closePath(); },
    rock: g => { g.moveTo(0, 22); g.lineTo(-22, -2); g.lineTo(-16, -20); g.lineTo(0, -12); g.lineTo(16, -20); g.lineTo(22, -2); g.closePath(); },
    wind: g => { g.moveTo(-4, 28); g.quadraticCurveTo(-6, -4, 10, -30); g.quadraticCurveTo(22, -4, 2, 20); g.closePath(); },
    bolt: g => { g.moveTo(6, -30); g.lineTo(-14, 4); g.lineTo(-2, 4); g.lineTo(-8, 30); g.lineTo(14, -6); g.lineTo(2, -6); g.closePath(); },
    star: g => D.star(g, 0, 0, 26, 11, 5), dark: g => { g.moveTo(0, -26); g.lineTo(20, 0); g.lineTo(0, 26); g.lineTo(-20, 0); g.closePath(); }}[el];
  P(g, [{path, fill: F}]); g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); D.ell(g, -6, -8, 4, 6); g.fill(); g.restore(); }
/* ---- ⚒️ props ---- */
function anvil(g, x, y, k){ g.save(); g.translate(x, y); g.scale(k, k);
  P(g, [{path: g => { g.moveTo(-26, 30); g.lineTo(26, 30); g.lineTo(16, 12); g.lineTo(-16, 12); g.closePath(); }, fill: '#4A4E5E'}, {path: g => { g.moveTo(-50, -8); g.lineTo(40, -8); g.quadraticCurveTo(52, -4, 50, 6); g.lineTo(22, 6); g.lineTo(14, 14); g.lineTo(-14, 14); g.lineTo(-22, 6); g.lineTo(-44, 4); g.quadraticCurveTo(-56, -2, -50, -8); g.closePath(); }, fill: g => D.lin(g, 0, -8, 0, 14, ['#9AA3B8', '#5A6278'])}], 1.8); g.restore(); }
function hammer(g, x, y, k, a){ g.save(); g.translate(x, y); g.rotate(a || 0); g.scale(k, k); P(g, [{path: g => D.rr(g, -3, -2, 6, 40, 3), fill: '#9A6A3A'}, {path: g => D.rr(g, -14, -12, 28, 14, 4), fill: g => D.lin(g, 0, -12, 0, 2, ['#C8D0DE', '#6A7288'])}], 1.6); g.restore(); }
function pot(g, x, y, k, t, glow){ g.save(); g.translate(x, y); g.scale(k, k); if(glow) D.glow(g, 0, -10, 70, '#FF9F1A', 0.35 * glow);
  P(g, [{path: g => { g.moveTo(-44, -24); g.lineTo(44, -24); g.bezierCurveTo(46, 6, 30, 22, 0, 22); g.bezierCurveTo(-30, 22, -46, 6, -44, -24); g.closePath(); D.rr(g, -50, -30, 100, 10, 5); D.rr(g, -60, -22, 14, 8, 4); D.rr(g, 46, -22, 14, 8, 4); }, fill: g => D.lin(g, -44, 0, 44, 0, ['#5A5E72', '#3A3E50', '#2A2E3E'])}], 2);
  g.fillStyle = D.lin(g, 0, -30, 0, -20, ['#FFE9A0', '#FFB23D']); g.beginPath(); D.ell(g, 0, -26, 42, 6); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.75)'; for(let i = 0; i < 4; i++){ const bx = -24 + i * 16, by = -30 - ((t * 30 + i * 9) % 26); g.beginPath(); D.ell(g, bx, by, 4 + i % 2 * 2, 4 + i % 2 * 2); g.fill(); }
  g.fillStyle = '#FF7A2E'; [-20, 0, 20].forEach((fx, i) => { const fl = 1 + Math.sin(t * 12 + i * 2) * 0.12; g.beginPath(); g.moveTo(fx - 9, 30); g.quadraticCurveTo(fx - 4, 30 - (16 + i % 2 * 6) * fl, fx, 30 - 22 * fl); g.quadraticCurveTo(fx + 4, 30 - 16 * fl, fx + 9, 30); g.fill(); });
  g.restore(); }
// 🍽️ a plate (cook moment end)
function plate(g, x, y, r){ g.save(); g.fillStyle = 'rgba(30,40,60,0.18)'; g.beginPath(); D.ell(g, x, y + r * 0.18, r * 1.05, r * 0.32); g.fill();
  g.fillStyle = D.lin(g, x, y - r * 0.3, x, y + r * 0.3, ['#FFFFFF', '#E6ECF6']); g.beginPath(); D.ell(g, x, y, r, r * 0.3); g.fill(); g.strokeStyle = '#C9D3E6'; g.lineWidth = 2; g.stroke(); g.restore(); }
// 🧺 a gathering spot (refills each day)
function spot(g, kind, x, y, k){ g.save(); g.translate(x, y); shadow(g, k, 1.8);
  if(kind === 'ore'){ PC(g, rockLump(k * 1.3, '#9A9080', 1.1)); [[-0.6, -1.2], [0.3, -1.5], [0.7, -0.8]].forEach(([a, b]) => { g.fillStyle = '#FF9F4A'; g.beginPath(); D.star(g, a * k, b * k, k * 0.2, k * 0.08, 5); g.fill(); }); }
  if(kind === 'herb'){ PC(g, [{path: g => { [[-0.7, -0.6, 0.8], [0.6, -0.5, 0.85], [0, -1, 1]].forEach(([a, b, r]) => D.ell(g, a * k, b * k, r * k, r * k * 0.8)); }, fill: g => D.lin(g, 0, -k * 1.8, 0, 0, ['#7CCB55', '#3E9A35'])}]); g.fillStyle = '#FFFFFF'; [[-0.6, -1], [0.4, -1.3], [0.7, -0.4]].forEach(([a, b]) => { g.beginPath(); D.ell(g, a * k, b * k, k * 0.12, k * 0.12); g.fill(); }); }
  g.restore(); }
// a small spark burst (contact) — n rays, fading by f (0..1)
function sparks(g, x, y, r, f, col, n){ n = n || 10; g.save(); g.globalAlpha = Math.max(0, 1 - f); g.strokeStyle = col || '#FFC21A'; g.lineCap = 'round'; g.lineWidth = Math.max(1.5, r * 0.08);
  for(let i = 0; i < n; i++){ const a = i / n * TAU + 0.3, r0 = r * (0.25 + f * 0.6), r1 = r * (0.5 + f * 0.9); g.beginPath(); g.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); g.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); g.stroke(); }
  g.fillStyle = '#FFFFFF'; g.globalAlpha = Math.max(0, 1 - f * 1.6); g.beginPath(); D.star(g, x, y, r * 0.45, r * 0.12, 4, 0); g.fill(); g.restore(); }
const API = {RIM, FAM, MATDEF, mat, EC, core, anvil, hammer, pot, plate, spot, sparks, IP};
if(typeof CD !== 'undefined') CD = API; else window.CraftDraft = API;
})();
/* 🔨 av-r0i — CraftKit core: the town places where you SPEND what 🎁 LootKit gives you (Avateer plan §21 · §21c pictures · §21d picks).
   Wave 1 = 🛒 Shop · ⚒️ Blacksmith (🔨 Craft · ⬆️ ★ Upgrade · 🔥 Forge · 🔀 Merge · ♻️ Recycle) · 🍳 Cook. Next waves: 🐾 Tamer → 🎓 Trainer + 📚 room → 💍 Jeweler → 🏘️ town board + 🏴 raids.
   Engine (recipes · costs · rolls · levels · shop stock) is pure + seeded; the station sheet + craft moments are DOM + canvas. No emoji inside canvas art (DOM labels may use them). */
(function(){
'use strict';
const L = window.Loot, P = (typeof CD !== 'undefined' && CD) ? CD : window.CraftDraft, D = (typeof AVD !== 'undefined' && AVD) ? AVD : window.AVD;
if(!L || !P || !D) return;
const VERSION = 'av-r0j-b', TAU = Math.PI * 2, RAR = L.RAR;
/* ---------------- 🧱 materials: Avateer's own 8 × 3 list (§21d pick 5), registered in LootKit's pouch so drops / bag / book all use the same names ---------------- */
Object.keys(P.MATDEF).forEach(id => { if(id === 'skyshard') return; const M = P.MATDEF[id]; const def = {}; def[id] = {name: M.name, icon: M.icon, where: M.where, fam: M.fam, gr: M.gr}; L.addMat('', def); });
const SHARD = 'skyshard';   // ☁️ grade 1 of the Sky family = LootKit's own shard counter (bag.st.shards) — one currency, never two
function have(B, id){ return id === SHARD ? (B.st.shards | 0) : id === 'coins' ? (B.c | 0) : (B.m[id] | 0); }
function take(B, id, n){ if(id === SHARD) B.st.shards = Math.max(0, (B.st.shards | 0) - n); else if(id === 'coins') B.c = Math.max(0, (B.c | 0) - n); else B.mat(id, -n); }
function matName(id){ return id === SHARD ? 'Sky Shard' : id === 'coins' ? 'Coins' : L.matName(id); }
function matIcon(id){ return id === SHARD ? '☁️' : id === 'coins' ? '🪙' : L.matIcon(id); }
function where(id){ const M = P.MATDEF[id] || L.MATS[id]; if(M && M.where) return M.where; if(/^core\./.test(id)) return (L.ELS[id.slice(5)] || {}).name + ' monsters'; return 'drops · gathering'; }
// cost = {mats: {id: n}, coins} → rows with have / need / ok
// 🔧 what a material is used for — the real recipes, ★ costs, forge cores and cook recipes (av-r0j-b, notes #2 + #8)
function usedFor(id){ const out = [];
  Object.keys(RECIPES).forEach(k => { const R = RECIPES[k]; if(R.mats && R.mats[id]) out.push({icon: '⚒️', what: (L.get(R.base) || {}).name || k, n: R.mats[id], kind: 'craft', id: k}); });
  STAR_COST.forEach((c, i) => { if(c.mats && c.mats[id]) out.push({icon: '⬆️', what: '★' + (i + 1) + '→' + (i + 2), n: c.mats[id], kind: 'up'}); });
  if(/^core\./.test(id)) out.push({icon: '🔥', what: 'element forge', n: 1, kind: 'forge'});
  Object.keys(L.USES).forEach(k => { const u = L.USES[k]; if(u.cook && u.cook[id]) out.push({icon: '🍳', what: u.name, n: u.cook[id], kind: 'cook', id: k}); });
  return out; }
function shopOf(id, town){ const r = SHOP.find(x => x[1] === id); return r ? {kind: r[0], id: r[1], price: r[2], town: r[3], open: (town || 5) >= r[3]} : null; }
function dropsOf(id){ if(/^core\./.test(id)){ const el = id.slice(5), E = L.ELS[el]; let names = ''; if(window.Creatures && Creatures.LIST) names = Object.keys(Creatures.LIST).map(k => Creatures.LIST[k]).filter(d => d.el === el && !d.pet).map(d => d.name).slice(0, 3).join(' · ');
    return (names || (E ? E.name + ' monsters' : 'monsters')); }
  if(L.MAT_POOL && L.MAT_POOL.indexOf(id) >= 0) return 'any monster · elites · bosses';
  const M = P.MATDEF[id]; if(!M) return ''; if(M.fam === 'part') return M.where; if(M.fam === 'gem' && M.gr === 2) return 'bosses'; if(M.fam === 'shard') return M.where; return ''; }
function gatherOf(id){ const M = P.MATDEF[id]; if(!M) return ''; return M.fam === 'part' || M.fam === 'book' || M.fam === 'shard' ? '' : M.where.replace(/\s*·\s*(🛒 )?shop\b.*$/i, '').replace(/·\s*Town Lv \d shop/, '').trim(); }
function check(B, cost){ cost = cost || {}; const rows = Object.keys(cost.mats || {}).map(id => { const need = cost.mats[id], h = have(B, id); return {id, icon: matIcon(id), name: matName(id), need, have: h, ok: h >= need}; });
  const coins = cost.coins | 0, c = {id: 'coins', icon: '🪙', name: 'Coins', need: coins, have: B.c | 0, ok: (B.c | 0) >= coins}; if(coins) rows.push(c);
  return {ok: rows.every(r => r.ok), rows, missing: rows.filter(r => !r.ok)}; }
function pay(B, cost){ const ck = check(B, cost); if(!ck.ok) return false; Object.keys(cost.mats || {}).forEach(id => take(B, id, cost.mats[id])); if(cost.coins) take(B, 'coins', cost.coins | 0); return true; }
function times(cost, n){ const m = {}; Object.keys(cost.mats || {}).forEach(k => { m[k] = cost.mats[k] * n; }); return {mats: m, coins: (cost.coins | 0) * n}; }
/* ---------------- 🏠 places + their ONE shared level (every town, every game) ---------------- */
const PLACES = {
  shop:  {icon: '🛒', name: 'Shop', keeper: 'Auntie Pim', lv: null, bg: ['#EAF7FF', '#FFF6E0'], tabs: [['buy', '🛒', 'Buy'], ['back', '🔁', 'Buy back']]},
  smith: {icon: '⚒️', name: 'Blacksmith', keeper: 'Uncle Tong', lv: 'smith', lvName: 'Smith', bg: ['#FFF2DA', '#F6D9B0'], tabs: [['craft', '🔨', 'Craft'], ['up', '⬆️', 'Upgrade'], ['forge', '🔥', 'Forge'], ['merge', '🔀', 'Merge'], ['recycle', '♻️', 'Recycle']]},
  cook:  {icon: '🍳', name: 'Cook', keeper: 'Auntie Mali', lv: 'cook', lvName: 'Cook', bg: ['#FFF6E2', '#FDE9C8'], tabs: [['cook', '🍳', 'Cook']]}};
const LV_XP = [0, 20, 60, 140, 300], MAX_LV = LV_XP.length;
const XP = {craft: t => 5 + 3 * t, up: 4, merge: 6, recycle: 1, forge: 5, cook: n => 3 * n};
function lvOf(xp){ let lv = 1; for(let i = 1; i < LV_XP.length; i++) if(xp >= LV_XP[i]) lv = i + 1; return lv; }
function state(save){ save = save || {}; const S = {xp: Object.assign({smith: 0, cook: 0}, save.xp), known: Object.assign({}, save.known), made: save.made | 0, perf: save.perf | 0};
  S.lv = k => lvOf(S.xp[k] | 0);
  S.next = k => { const lv = S.lv(k); return lv >= MAX_LV ? null : LV_XP[lv]; };
  S.gain = (k, n) => { const was = S.lv(k); S.xp[k] = (S.xp[k] | 0) + (n | 0); const now = S.lv(k); return {k, xp: S.xp[k], lv: now, up: now > was}; };
  S.toJSON = () => ({v: 1, xp: S.xp, known: S.known, made: S.made, perf: S.perf});
  return S; }
/* ---------------- ⚒️ recipes (a game adds its own with Craft.addRecipe — ids '<pack>.<id>') ---------------- */
const RECIPES = {}, BLOCKS = [];
function addRecipe(pack, defs, meta){ const ids = []; Object.keys(defs || {}).forEach(k => { const id = pack + '.' + k, d = Object.assign({id, pack, tiers: [0, 1], mats: {}, coins: 0, smith: 1, town: 1}, defs[k]);
    if(!d.base) throw new Error('Craft.addRecipe: ' + id + ' needs base (a LootKit item id)'); d.tiers = [Math.max(0, d.tiers[0] | 0), Math.min(5, Math.max(d.tiers[0] | 0, d.tiers[1] | 0))]; RECIPES[id] = d; ids.push(id); });
  BLOCKS.push(Object.assign({pack, ids}, meta || {})); return ids; }
function recipe(id){ return RECIPES[id] || null; }
function recipes(o){ o = o || {}; return Object.keys(RECIPES).filter(id => !o.pack || RECIPES[id].pack === o.pack); }
function costOf(R){ return {mats: R.mats, coins: R.coins}; }
function capOf(base){ let cap = -1; Object.keys(RECIPES).forEach(id => { if(RECIPES[id].base === base) cap = Math.max(cap, RECIPES[id].tiers[1]); }); return cap < 0 ? 4 : cap; }   // no recipe → never above 🟡
// why a recipe can't be made right now: null | 'smith' | 'town' | 'mats'
function canCraft(B, S, rid, o){ o = o || {}; const R = RECIPES[rid]; if(!R) return {ok: false, why: 'none'}; if(S.lv('smith') < R.smith) return {ok: false, why: 'smith', need: R.smith};
  if((o.town || 1) < R.town) return {ok: false, why: 'town', need: R.town}; const ck = check(B, costOf(R)); return ck.ok ? {ok: true, rows: ck.rows} : {ok: false, why: 'mats', rows: ck.rows, missing: ck.missing}; }
// tier odds inside the recipe range: the low end most often; every Smith level above the recipe's need moves 4 % toward the top
function odds(R, S){ const lo = R.tiers[0], hi = R.tiers[1], n = hi - lo + 1, w = []; for(let i = 0; i < n; i++) w.push(Math.pow(0.42, i)); let tot = w.reduce((a, b) => a + b, 0);
  const bonus = n > 1 ? Math.min(0.2, Math.max(0, S.lv('smith') - R.smith) * 0.04) : 0; w[n - 1] += bonus * tot; tot = w.reduce((a, b) => a + b, 0); return w.map((x, i) => ({tier: lo + i, p: x / tot})); }
function rollTier(R, S, r){ const o = odds(R, S); let v = r(); for(const x of o){ v -= x.p; if(v < 0) return x.tier; } return o[o.length - 1].tier; }
function craft(B, S, rid, o){ o = o || {}; const c = canCraft(B, S, rid, o); if(!c.ok) return c; const R = RECIPES[rid]; pay(B, costOf(R));
  const r = L.rng(o.seed != null ? o.seed : 'craft:' + rid + ':' + S.made + ':' + Date.now()), tier = rollTier(R, S, r);
  const it = {base: R.base, tier, lv: o.lv || 1, seed: Math.floor(r() * 1e9), sock: L.SOCK[tier], runes: []}; const where = B.add(it); S.made++; const xp = S.gain('smith', XP.craft(tier));
  return {ok: true, item: it, tier, where, xp}; }
/* ---------------- ⬆️ ★1 → ★5 (each ★ = +8 % gear power, LootKit power()) ---------------- */
const STAR_COST = [{mats: {ore: 2}, coins: 50}, {mats: {ore: 4}, coins: 120}, {mats: {ore: 6, iron: 1}, coins: 300}, {mats: {iron: 4, stariron: 1}, coins: 600}];
function starOf(it){ return Math.max(1, Math.min(L.STAR_MAX || 5, it.star | 0 || 1)); }
function upCost(it){ const s = starOf(it); if(s >= (L.STAR_MAX || 5)) return null; const c = STAR_COST[s - 1]; return {mats: Object.assign({}, c.mats), coins: Math.round(c.coins * (1 + it.tier * 0.25)), from: s, to: s + 1}; }
function upgrade(B, S, i){ const it = B.g[i]; if(!it) return {ok: false, why: 'none'}; const c = upCost(it); if(!c) return {ok: false, why: 'max'}; const ck = check(B, c); if(!ck.ok) return {ok: false, why: 'mats', rows: ck.rows};
  const was = L.power(it); pay(B, c); it.star = c.to; return {ok: true, item: it, star: it.star, power: [was, L.power(it)], xp: S.gain('smith', XP.up)}; }
/* ---------------- 🔀 merge 3 of the SAME item (base + tier) → one tier up, never above the recipe's cap, never ☀️ ---------------- */
function mergeCost(tier){ return {mats: {}, coins: 40 * (tier + 1)}; }
function mergeGroups(B){ const map = {}; B.g.forEach((it, i) => { if(it.lock || it.tier >= 6) return; const k = it.base + '|' + it.tier; (map[k] = map[k] || {base: it.base, tier: it.tier, idx: []}).idx.push(i); });
  return Object.keys(map).map(k => map[k]).filter(m => m.idx.length >= 3).map(m => Object.assign(m, {cap: capOf(m.base), n: m.idx.length, can: m.tier < capOf(m.base)}))
    .sort((a, b) => (b.can ? 1 : 0) - (a.can ? 1 : 0) || b.tier - a.tier || String(a.base).localeCompare(String(b.base))); }
function merge(B, S, base, tier, o){ o = o || {}; const grp = mergeGroups(B).find(m => m.base === base && m.tier === tier); if(!grp) return {ok: false, why: 'three'}; if(!grp.can) return {ok: false, why: 'cap', cap: grp.cap};
  const cost = mergeCost(tier), ck = check(B, cost); if(!ck.ok) return {ok: false, why: 'mats', rows: ck.rows};
  const pick = grp.idx.slice().sort((a, b) => (B.g[b].lv - B.g[a].lv) || (starOf(B.g[b]) - starOf(B.g[a]))).slice(0, 3), three = pick.map(i => B.g[i]);
  pay(B, cost); pick.slice().sort((a, b) => b - a).forEach(i => B.g.splice(i, 1));
  const best = three[0], r = L.rng(o.seed != null ? o.seed : 'merge:' + base + ':' + tier + ':' + S.made + ':' + Date.now()), nt = tier + 1;
  const it = {base, tier: nt, lv: Math.max.apply(null, three.map(x => x.lv || 1)), seed: Math.floor(r() * 1e9), sock: L.SOCK[nt], runes: []};
  const st = Math.max.apply(null, three.map(starOf)); if(st > 1) it.star = st;
  const el = three.filter(x => x.el).sort((a, b) => (b.elv | 0) - (a.elv | 0))[0]; if(el){ it.el = el.el; it.elv = el.elv; }
  const runes = [].concat.apply([], three.map(x => x.runes || [])); it.runes = runes.slice(0, it.sock); const back = runes.slice(it.sock);   // 💍 runes kept up to the new sockets — the rest come back to the pouch
  back.forEach(r2 => B.mat('rune.' + (r2.k || r2), 1)); S.made++; const where = B.add(it); return {ok: true, item: it, from: three, where, back: back.length, xp: S.gain('smith', XP.merge)}; }
/* ---------------- ♻️ recycle (LootKit rules: 🔒 never · 🔵+ asks first · ☀️ → shards) ---------------- */
function recycle(B, S, i, o){ const r = B.recycle(i, o || {}); if(r.ok) r.xp = S.gain('smith', XP.recycle); return r; }
/* ---------------- 🔥 element forge = a tab of the Blacksmith (§21d pick 1) — LootKit forge() + its cores + coins ---------------- */
const FORGE_COINS = 40;
function forgeCost(it, el){ if(!L.ELS[el] || !it) return null; const was = it.el === el ? (it.elv | 0) : 0, max = 5; if(was >= max) return {el, max: true, lv: was};
  const to = was + 1, swap = !!(it.el && it.el !== el), back = swap ? Math.floor(L.FORGE_COST.slice(0, it.elv || 1).reduce((a, b) => a + b, 0) / 2) : 0, m = {}; m['core.' + el] = L.FORGE_COST[to - 1];
  return {el, from: was, to, swap, back, backCore: swap ? 'core.' + it.el : null, mats: m, coins: FORGE_COINS * to}; }
function forge(B, S, i, el, o){ o = o || {}; const it = B.g[i]; if(!it) return {ok: false, why: 'none'}; const c = forgeCost(it, el); if(!c) return {ok: false, why: 'element'}; if(c.max) return {ok: false, why: 'max'};
  const ck = check(B, c); if(!ck.ok) return {ok: false, why: 'mats', rows: ck.rows}; if(c.swap && !o.sure) return {ok: false, ask: true, back: c.back, backCore: c.backCore, from: it.el};
  pay(B, c); const r = L.forge(it, el, c.to); if(r.back && r.backCore) B.mat(r.backCore, r.back); return {ok: true, item: it, el, lv: r.lv, back: r.back, backCore: r.backCore, xp: S.gain('smith', XP.forge)}; }
function weapons(B){ return B.g.map((it, i) => ({it, i})).filter(x => { const d = L.get(x.it.base); return d && d.kind === 'weapon'; }); }
function gear(B){ return B.g.map((it, i) => ({it, i})).filter(x => !!L.get(x.it.base)); }
/* ---------------- 🍳 cook: LootKit's 10 island foods (cook: {mat: n}) — a recipe is FOUND the first time you hold one of its ingredients ---------------- */
function cookList(){ return Object.keys(L.USES).filter(id => L.USES[id].cook); }
function learn(S, B){ const got = []; cookList().forEach(id => { if(S.known[id]) return; if(Object.keys(L.USES[id].cook).some(m => have(B, m) > 0)){ S.known[id] = 1; got.push(id); } }); return got; }
function cookCost(id, n){ const d = L.USES[id]; if(!d || !d.cook) return null; return times({mats: d.cook, coins: 0}, n || 1); }
function canCook(B, S, id, n){ n = n || 1; const d = L.USES[id]; if(!d || !d.cook) return {ok: false, why: 'none'}; if(!S.known[id]) return {ok: false, why: 'unknown', island: d.island};
  if(((B.u[id] | 0) + n) > L.USE_MAX) return {ok: false, why: 'full'}; const ck = check(B, cookCost(id, n)); return ck.ok ? {ok: true, rows: ck.rows} : {ok: false, why: 'mats', rows: ck.rows, missing: ck.missing}; }
function cook(B, S, id, n){ n = n || 1; const c = canCook(B, S, id, n); if(!c.ok) return c; pay(B, cookCost(id, n)); B.use(id, n); return {ok: true, id, n, left: B.u[id] | 0, xp: S.gain('cook', XP.cook(n))}; }
/* ---------------- 🛒 shop: stock = town level (1–5) · basic things only (rare ones come from drops, gathering, quests) · 📅 one daily deal −30 % · 🔁 buy back = LootKit ---------------- */
const SHOP = [['mat', 'wood', 8, 1], ['mat', 'ore', 10, 1], ['mat', 'herb', 6, 1], ['mat', 'grain', 5, 1], ['mat', 'cotton', 8, 1], ['use', 'potion.heal', 30, 1],
  ['mat', 'bone', 12, 2], ['mat', 'mango', 6, 2], ['mat', 'fish', 7, 2], ['mat', 'banana', 6, 2], ['use', 'potion.shield', 40, 2],
  ['mat', 'teak', 22, 3], ['mat', 'iron', 26, 3], ['mat', 'coconut', 8, 3], ['mat', 'honey', 10, 3], ['use', 'potion.power', 50, 3],
  ['mat', 'silk', 40, 4], ['mat', 'moonherb', 35, 4], ['mat', 'chili', 9, 4], ['mat', 'cactus', 9, 4], ['use', 'potion.aura', 60, 4],
  ['mat', 'strawberry', 12, 5], ['mat', 'moonmilk', 14, 5], ['mat', 'seagrape', 12, 5], ['use', 'potion.lucky', 90, 5]];
const DEAL_OFF = 0.3;
function stock(o){ o = o || {}; const town = Math.max(1, Math.min(5, o.town | 0 || 1)), day = o.day || L.today(), rows = SHOP.filter(r => r[3] <= town && (r[0] !== 'use' || L.useDef(r[1])))
    .map(r => ({kind: r[0], id: r[1], price: r[2], town: r[3], name: r[0] === 'use' ? L.useName(r[1]) : matName(r[1]), icon: r[0] === 'use' ? (L.useDef(r[1]) || {}).icon : matIcon(r[1])}));
  if(rows.length){ const k = Math.floor(L.rng('deal:' + day + ':' + town + ':' + (o.region || ''))() * rows.length); rows[k].deal = true; rows[k].was = rows[k].price; rows[k].price = Math.max(1, Math.round(rows[k].price * (1 - DEAL_OFF))); }
  return rows; }
function buy(B, S, row, n){ n = Math.max(1, n | 0); const cost = row.price * n; if((B.c | 0) < cost) return {ok: false, why: 'coins', cost};
  if(row.kind === 'use' && ((B.u[row.id] | 0) + n) > L.USE_MAX) return {ok: false, why: 'full'}; B.c -= cost; if(row.kind === 'use') B.use(row.id, n); else B.mat(row.id, n); const found = learn(S, B);
  return {ok: true, n, cost, found}; }
/* ================= 🎨 UI ================= */
const LOG = [];
function css(){ L.react(); if(document.getElementById('ck-css')) return; const s = document.createElement('style'); s.id = 'ck-css'; s.textContent = [
  '.ck-ov{position:absolute;inset:0;z-index:58;font-family:Fredoka,Nunito,sans-serif;color:#24324A;-webkit-user-select:none;user-select:none;touch-action:manipulation;}',
  '.ck-ov.ck-fixed{position:fixed;}',
  '.ck-sheet{position:absolute;inset:calc(6px + env(safe-area-inset-top,0px)) 6px var(--safe-b,10px) 6px;border-radius:22px;display:flex;flex-direction:column;overflow:hidden;padding:8px;gap:6px;box-shadow:0 10px 30px rgba(20,50,100,.35),0 0 0 3px #FFD54A,0 0 0 5px #8A5A00;}',
  '.ck-head{display:flex;align-items:center;gap:6px;min-height:44px;flex:0 0 auto;flex-wrap:nowrap;}',
  '.ck-head b.ck-ttl{font-size:19px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}',
  '.ck-head .ck-sp{flex:1 1 0;min-width:0;}',
  '.ck-lvl{display:inline-flex;align-items:center;gap:6px;background:#FFF4D6;border-radius:999px;padding:4px 10px;font-weight:800;font-size:13.5px;white-space:nowrap;box-shadow:inset 0 0 0 2px #E0A81A;}',
  '.ck-lvl i{display:inline-block;width:46px;height:8px;border-radius:999px;background:#E4EAF4;overflow:hidden;font-style:normal;} .ck-lvl i b{display:block;height:100%;background:linear-gradient(90deg,#FFC21A,#FF7A2E);}',
  '.ck-coin{background:#2B2D42;color:#FFF3B0;border-radius:999px;padding:5px 11px;font-weight:800;font-size:14px;white-space:nowrap;}',
  '.ck-tabs{display:flex;flex-wrap:wrap;gap:6px;flex:0 0 auto;}',
  '.ck-tabs .lk-tab{min-height:40px;}',
  '.ck-body{position:relative;flex:1 1 auto;min-height:0;display:flex;gap:8px;}',
  '.ck-keep{position:relative;flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;min-width:0;}',
  '.ck-keep canvas{display:block;}',
  '.ck-bub{position:relative;background:#fff;border-radius:14px;padding:7px 10px;font-weight:700;font-size:14px;line-height:1.25;box-shadow:0 3px 10px rgba(40,60,90,.18);}',
  '.ck-keep .ck-bub{position:absolute;left:4px;right:4px;top:4px;}',
  '.ck-keep .ck-bub::after{content:"";position:absolute;left:30%;bottom:-9px;border:9px solid transparent;border-bottom:0;border-top-color:#fff;}',
  '.ck-kname{font-size:12px;font-weight:800;color:#6A4A1A;white-space:nowrap;text-align:center;}',
  '.ck-strip{display:flex;align-items:center;gap:8px;flex:0 0 auto;min-height:0;}',
  '.ck-strip canvas{flex:0 0 auto;} .ck-strip .ck-bub{flex:1 1 auto;min-width:0;font-size:13px;}',
  '.ck-strip .ck-bub::after{content:"";position:absolute;left:-8px;top:50%;margin-top:-8px;border:8px solid transparent;border-left:0;border-right-color:#fff;}',
  '.ck-list{position:relative;flex:0 0 auto;display:flex;flex-direction:column;gap:6px;min-height:0;min-width:0;}',
  '.ck-rows{display:flex;flex-direction:column;gap:6px;flex:1 1 auto;min-height:0;}',
  '.ck-row{position:relative;display:flex;align-items:center;gap:8px;border:none;cursor:pointer;text-align:left;background:#fff;border-radius:14px;padding:4px 10px 4px 4px;box-shadow:inset 0 0 0 1.5px #E2E8F2;font-family:inherit;color:inherit;min-height:44px;transition:transform .08s;}',
  '.ck-row.on{background:#FFF4D6;box-shadow:inset 0 0 0 3px #E0A81A;}',
  '.ck-row.dim{opacity:.55;} .ck-row canvas{flex:0 0 auto;}',
  '.ck-row .tx{display:flex;flex-direction:column;min-width:0;flex:1 1 auto;} .ck-row .nm{font-weight:800;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .ck-row .sb{font-weight:700;font-size:12.5px;color:#4A5A76;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
  '.ck-row .bd{position:absolute;right:6px;top:4px;font:800 11px Fredoka,sans-serif;background:#2B2D42;color:#fff;border-radius:8px;padding:1px 6px;} .ck-row .bd.deal{background:#E8303A;} .ck-row .bd.ok{background:#2E9E46;}',
  '.ck-row.lk-press{transform:scale(.97);}',
  '.ck-pager{display:flex;align-items:center;justify-content:center;gap:8px;flex:0 0 auto;} .ck-pager .lk-b{min-height:40px;min-width:48px;padding:2px 12px;font-size:20px;}',
  '.ck-dots{display:flex;gap:4px;} .ck-dots span{width:8px;height:8px;border-radius:50%;background:#C9D6E6;} .ck-dots span.on{background:#E0A81A;}',
  '.ck-det{position:relative;flex:1 1 auto;min-width:0;min-height:0;display:flex;flex-direction:column;gap:6px;background:linear-gradient(#FFFFFF,#FFF6E2);border-radius:18px;padding:10px;box-shadow:0 0 0 3px #FFD54A,0 0 0 5px #8A5A00,0 5px 14px rgba(90,60,0,.18);overflow:hidden;}',
  '.ck-top{display:flex;gap:10px;align-items:center;flex:0 0 auto;} .ck-top canvas{flex:0 0 auto;}',
  '.ck-top .tx{display:flex;flex-direction:column;gap:2px;min-width:0;}',
  '.ck-dn{font-weight:800;font-size:21px;line-height:1.1;font-family:"Baloo 2",Fredoka,sans-serif;} .ck-ds{font-weight:700;font-size:13px;color:#4A5A76;line-height:1.25;}',
  '.ck-lab{font-weight:800;font-size:14px;}',
  '.ck-chips{display:flex;flex-wrap:wrap;gap:6px;}',
  '.ck-chip{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:3px 10px 3px 6px;font-weight:700;font-size:13.5px;white-space:nowrap;background:#F2F6FF;box-shadow:inset 0 0 0 2px #C9D6EC;}',
  '.ck-chip.ok{background:#E6F8E8;box-shadow:inset 0 0 0 2px #4CC764;} .ck-chip.need{background:#FFE6E2;box-shadow:inset 0 0 0 2px #FF6A5A;}',
  '.ck-chip .ic{font-size:1.15em;} .ck-chip .mk{font-weight:800;} .ck-chip.ok .mk{color:#2E9E46;} .ck-chip.need .mk{color:#E0453A;}',
  '.ck-miss{font-weight:700;font-size:13px;color:#C0392B;line-height:1.25;}',
  '.ck-note{font-weight:700;font-size:12.5px;color:#4A5A76;line-height:1.25;}',
  '.ck-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;justify-content:flex-end;flex:0 0 auto;} .ck-acts .lk-b{min-height:48px;font-size:17px;}',
  '.ck-eff{display:flex;flex-direction:column;gap:2px;} .ck-eff div{display:flex;justify-content:space-between;gap:10px;font-size:13.5px;font-weight:700;padding:1px 8px;border-radius:8px;background:#F2F8FF;} .ck-eff div:nth-child(odd){background:#FFF4D6;} .ck-eff b{color:#2E9E46;}',
  '.ck-cores{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;} .ck-core{position:relative;border:none;border-radius:14px;background:#fff;box-shadow:inset 0 0 0 1.5px #E2E8F2;cursor:pointer;padding:2px;display:flex;flex-direction:column;align-items:center;font:800 11.5px Fredoka,sans-serif;color:#24324A;min-height:44px;}',
  '.ck-core.on{background:#FFF4D6;box-shadow:inset 0 0 0 3px #E0A81A;} .ck-core.none{opacity:.45;} .ck-core i{font-style:normal;position:absolute;right:3px;top:2px;background:#2B2D42;color:#fff;border-radius:7px;padding:0 4px;font-size:10px;}',
  '.ck-vs{display:flex;flex-wrap:wrap;gap:4px;} .ck-vs span{font-size:12.5px;font-weight:700;padding:1px 7px;border-radius:8px;background:#F2F8FF;white-space:nowrap;} .ck-vs .up{color:#2E9E46;background:#E6F8E8;} .ck-vs .dn{color:#C0392B;background:#FFE6E2;}',
  '.ck-bar{height:12px;border-radius:999px;background:#E4EAF4;display:flex;gap:3px;padding:2px;} .ck-bar span{flex:1;border-radius:999px;background:#fff;} .ck-bar span.on{background:#FF7A2E;} .ck-bar span.nx{background:#FFD9B8;box-shadow:inset 0 0 0 1.5px #FF7A2E;}',
  '.ck-stars{font-size:22px;letter-spacing:2px;color:#DDE3EC;white-space:nowrap;} .ck-stars b{color:#FFC21A;text-shadow:0 1px 0 #B07800;font-weight:400;}',
  '.ck-qty{display:flex;gap:6px;flex-wrap:wrap;} .ck-qty .lk-tab{min-height:40px;}',
  '.ck-empty{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:700;opacity:.7;padding:10px;font-size:15px;}',
  '.ck-body.up{flex-direction:column;} .ck-body.up .ck-list{flex:1 1 auto;} .ck-body.up .ck-det{flex:0 0 auto;}',
  '.ck-det.tight .ck-dn{font-size:17px;} .ck-det.tight .ck-ds,.ck-det.tight .ck-note{font-size:11.5px;} .ck-det.tight .ck-chip{font-size:12px;padding:2px 8px 2px 5px;} .ck-det.tight{gap:4px;padding:8px;} .ck-det.tight .ck-acts .lk-b{min-height:44px;font-size:15px;}',
  '.ck-det.roomy{gap:10px;padding:16px;} .ck-det.roomy .ck-dn{font-size:30px;} .ck-det.roomy .ck-ds,.ck-det.roomy .ck-note,.ck-det.roomy .ck-miss{font-size:15.5px;} .ck-det.roomy .ck-lab{font-size:17px;} .ck-det.roomy .ck-chip{font-size:16px;padding:5px 12px 5px 8px;} .ck-det.roomy .ck-eff div,.ck-det.roomy .ck-vs span{font-size:15px;} .ck-det.roomy .ck-acts .lk-b{min-height:58px;font-size:20px;padding:8px 26px;} .ck-det.roomy .ck-core{min-height:64px;}',
  '.ck-det.tighter .ck-note,.ck-det.tighter .ck-vs,.ck-det.tighter .ck-lab{display:none;}',
  '.ck-mo{position:absolute;inset:0;z-index:6;border-radius:18px;background:radial-gradient(ellipse at 50% 55%,rgba(255,226,150,.92),rgba(120,80,30,.9) 60%,rgba(43,30,10,.94));}',
  '.ck-mo canvas{position:absolute;inset:0;width:100%;height:100%;}',
  '.ck-mo .ck-mh{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);color:#fff;font-weight:800;font-size:15px;text-shadow:0 2px 0 rgba(0,0,0,.4);white-space:nowrap;pointer-events:none;}',
  '.ck-mo .ck-mn{position:absolute;left:50%;top:10px;transform:translateX(-50%);color:#FFF3B0;font-weight:800;font-size:20px;text-shadow:0 2px 0 rgba(0,0,0,.45);white-space:nowrap;pointer-events:none;max-width:94%;overflow:hidden;text-overflow:ellipsis;}',
  '.ck-ask{position:absolute;inset:0;z-index:7;display:flex;align-items:center;justify-content:center;background:rgba(30,50,90,.45);border-radius:18px;}',
  '.ck-ask>div{background:#fff;border-radius:18px;padding:14px;max-width:92%;text-align:center;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:10px;align-items:center;font-size:15px;}',
  '.ck-ask .row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}',
  '@media (max-width:560px),(max-height:460px){.ck-head b.ck-ttl{font-size:16px;} .ck-lvl{font-size:12px;padding:3px 8px;} .ck-lvl i{width:30px;} .ck-coin{font-size:13px;padding:4px 9px;} .ck-tabs .lk-tab{min-height:38px;padding:3px 10px;font-size:13px;} .ck-sheet{box-shadow:0 10px 30px rgba(20,50,100,.35),0 0 0 2px #FFD54A,0 0 0 3px #8A5A00;}}',
  '.ck-tabs.icons .lk-tab .lb{display:none;} .ck-lvl .nm{display:inline;}',
  '.ck-tap{cursor:pointer;} .ck-chip.need.ck-tap{outline:2.5px dashed #FFC21A;outline-offset:2px;animation:ck-wig .6s ease-in-out 1 .3s;} @keyframes ck-wig{0%,100%{transform:none;}25%{transform:rotate(-4deg);}75%{transform:rotate(4deg);}}',
  '.ck-tiles{margin-top:4px;} .ck-det .lk-tiles{grid-template-columns:repeat(auto-fit,minmax(118px,1fr));} .ck-vs .lk-tile.up{background:#EAFBEA;border-color:#7FD48A;} .ck-vs .lk-tile.up b{color:#2E9E46;} .ck-vs .lk-tile.dn{background:#FFEDEA;border-color:#FF9A8A;} .ck-vs .lk-tile.dn b{color:#C0392B;}',
  '.ck-det.tighter .ck-vs.lk-tiles{display:grid !important;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;} .ck-det.tighter .ck-vs .lk-stat.lk-tile{grid-template-columns:auto 1fr;padding:2px 5px;} .ck-det.tighter .ck-vs .lk-tile small,.ck-det.tighter .ck-vs .lk-tile span{display:none;} .ck-det.tightest .ck-vs.lk-tiles{display:none !important;} .ck-det.tight .lk-tile i{font-size:17px;} .ck-det.tight .lk-stat.lk-tile b{font-size:15px;} .ck-det.tight .lk-stat.lk-tile{padding:3px 6px;}',
  '.ck-cores{grid-template-columns:repeat(auto-fill,minmax(78px,1fr)) !important;gap:6px;} .ck-core{display:flex;flex-direction:column;align-items:center;gap:1px;padding:5px 3px 4px !important;min-height:84px;}',
  '.ck-core .tok{display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#fff,var(--ec));box-shadow:inset 0 0 0 2.5px var(--ec);} .ck-core.on .tok{box-shadow:0 0 0 4px #FFC21A,0 0 0 6px #B07800;}',
  '.ck-core.none .tok{background:#E9EDF3;box-shadow:inset 0 0 0 2px #C8D0DC;filter:grayscale(1);} .ck-core.none{opacity:1 !important;} .ck-core b{font-size:11.5px;font-weight:800;white-space:nowrap;} .ck-core s{text-decoration:none;font-size:9.5px;font-weight:700;color:#7A8AA6;line-height:1.1;text-align:center;}',
  '.ck-core i.lk{background:transparent;color:inherit;font-size:16px;top:30px;right:auto;left:50%;transform:translate(-50%,-50%);} .ck-core u{position:absolute;left:4px;top:3px;text-decoration:none;background:#2E9E46;color:#fff;border-radius:999px;font:800 11px Fredoka,sans-serif;padding:0 5px;}',
  '.ck-det.tight .ck-core{min-height:70px;} .ck-det.tight .ck-core .tok{width:40px;height:40px;} .ck-det.tighter .ck-core s{display:none;}',
  '.ck-det.tighter .ck-cores{grid-template-columns:repeat(8,minmax(0,1fr)) !important;gap:3px;} .ck-det.tighter .ck-core{min-height:0;padding:2px 1px !important;} .ck-det.tighter .ck-core b{display:none;} .ck-det.tighter .ck-core .tok{width:34px;height:34px;} .ck-det.tighter .ck-core .tok canvas{width:30px !important;height:30px !important;} .ck-det.tighter .ck-core i.lk{top:19px;}',
  '.ck-mats .ck-sheet{background:linear-gradient(#FFF6DA,#FFFDF6 40%,#EEF8FF);}',
  '.ck-row .uf{font-weight:800;font-size:11.5px;color:#B07800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
  '.ck-uf .ck-chip{background:#FFF8EC;box-shadow:inset 0 0 0 2px #FFD54A;}',
  '.ck-grade{display:inline-flex;gap:3px;vertical-align:middle;margin-left:4px;} .ck-grade i{display:inline-block;width:9px;height:9px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(42,28,20,.35);}',
  '.ck-info{position:absolute;inset:0;z-index:8;display:flex;align-items:center;justify-content:center;background:rgba(30,50,90,.42);border-radius:18px;padding:8px;}',
  '.ck-icard{position:relative;width:min(520px,100%);max-height:100%;overflow:hidden;background:linear-gradient(#FFF6DA,#FFFFFF 140px);border-radius:22px;box-shadow:0 0 0 4px #FFD54A,0 10px 30px rgba(0,0,0,.3);padding:14px;display:flex;flex-direction:column;gap:8px;animation:ck-up .22s ease-out;}',
  '@keyframes ck-up{from{transform:translateY(30px);opacity:0;}to{transform:none;opacity:1;}} .ck-ix{position:absolute;right:8px;top:8px;min-height:40px;min-width:44px;padding:2px 10px;} .ck-itop{display:flex;gap:12px;align-items:center;padding-right:48px;} .ck-itop .tx{display:flex;flex-direction:column;gap:2px;min-width:0;}',
  '.ck-icard .ck-acts .lk-b{min-height:46px;} .ck-icard.tight{gap:5px;padding:10px;} .ck-icard.tight .ck-ipic canvas{width:60px !important;height:60px !important;} .ck-icard.tighter .ck-lab{display:none;} .ck-icard.tighter .lk-stat.lk-tile{padding:2px 6px;}',
  '.ck-mats .ck-mgrid{flex:1 1 auto;min-height:0;display:grid;gap:8px;align-content:start;}',
  '.ck-mcard{position:relative;display:flex;align-items:center;gap:8px;border:none;cursor:pointer;text-align:left;background:#FFFDF6;border-radius:18px;padding:8px 10px;box-shadow:inset 0 0 0 2.5px #FFD54A;font-family:inherit;color:inherit;min-width:0;}',
  '.ck-mcard.none{background:#F6F7FA;box-shadow:inset 0 0 0 2px #DDE3EC;} .ck-mcard.none .ck-mpic{opacity:.55;} .ck-mcard .tx{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1 1 auto;} .ck-mcard .nm{font:800 17px "Baloo 2",Fredoka,sans-serif;line-height:1.05;}',
  '.ck-mcard .wh{font-size:12px;font-weight:700;color:#3A4A66;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;} .ck-mcard .ck-grade{margin-left:0;}',
  '.ck-mn{position:absolute;right:8px;top:8px;background:#24324A;color:#fff;border-radius:999px;padding:1px 8px;font:800 12px Fredoka,sans-serif;} .ck-mcard.none .ck-mn{background:#B8C2D2;} .ck-muf{position:absolute;left:12px;bottom:6px;font-size:11.5px;font-weight:800;color:#B07800;}',
  '@media (max-width:480px){.ck-lvl .nm,.ck-lvl i{display:none;} .ck-head{gap:4px;} .ck-head .lk-x{padding:4px 8px;}}',
  '@media (max-height:460px){.ck-head{min-height:40px;} .ck-sheet{padding:6px;gap:4px;} .ck-tabs{flex-wrap:nowrap;}}'].join('\n'); document.head.appendChild(s); }
// sounds through the shared tone maker (never our own AudioContext)
function snd(k, x){ try { const U = window.UISound; if(!U || (U.isOn && !U.isOn())) return;
  if(k === 'clang'){ U.noise && U.noise(0.09, {from: 3200, to: 900, gain: 0.28}); U.tone && U.tone(x ? 1320 : 880, 0.16, {type: 'triangle', gain: 0.22}); }
  else if(k === 'perfect'){ U.note && U.note('E6', 0.22, {instrument: 'bell'}); U.note && U.note('B6', 0.3, {instrument: 'bell', delay: 0.08}); }
  else if(k === 'bubble'){ U.tone && U.tone(260, 0.14, {type: 'sine', slide: 640, gain: 0.25}); }
  else if(k === 'pop'){ U.tone && U.tone(660, 0.1, {type: 'triangle', slide: 990, gain: 0.2}); }
  else if(k === 'coin'){ U.note && U.note('A6', 0.12, {instrument: 'bell'}); }
  else if(k === 'whoosh'){ U.noise && U.noise(0.14, {from: 600, to: 2400, gain: 0.12}); } } catch(e){} }
function cvs(w, h){ const c = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1); c.width = Math.max(1, Math.round(w * dpr)); c.height = Math.max(1, Math.round(h * dpr)); c.style.width = w + 'px'; c.style.height = h + 'px'; const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return {c, g}; }
// one picture painter for anything in a list: an item · a material · a core · a food / potion
function pic(g, thing, x, y, w, h, t){ if(thing.item){ L.card(g, thing.item, x, y, w, h, t || 0.3); return; }
  const id = thing.mat || thing.use || thing.core, s = Math.min(w, h);
  if(thing.use){ L.usePic(g, thing.use, x + w * 0.08, y + h * 0.1, w * 0.84, h * 0.8); return; }
  if(thing.core || /^core\./.test(id)){ P.core(g, (thing.core || id).replace(/^core\./, ''), x + w / 2, y + h / 2, s / 64); return; }
  if(P.MATDEF[id]){ P.mat(g, id, x + w / 2, y + h * 0.72, s * 0.24, t || 0); return; }
  g.save(); g.font = Math.round(s * 0.62) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(matIcon(id), x + w / 2, y + h / 2 + 2); g.restore(); }
function picCanvas(thing, w, h){ const C = cvs(w, h); pic(C.g, thing, 0, 0, w, h, 0.3); C.c.className = 'ck-pic'; return C.c; }
function itemName(it){ const d = L.get(it.base); return d ? d.name : it.base; }
function tierGems(lo, hi, cur, w){ const n = 7, gw = Math.max(18, Math.min(30, w / 7)), C = cvs(gw * n + 4, gw + 4); for(let i = 0; i < n; i++){ C.g.save(); C.g.globalAlpha = i >= lo && i <= hi ? 1 : 0.2; L.gem(C.g, 2 + gw * i + gw / 2, 2 + gw / 2, gw * 0.36, i, 0.3); C.g.restore(); }
  C.g.strokeStyle = '#E0A81A'; C.g.lineWidth = 2.5; C.g.beginPath(); D.rr(C.g, 2 + gw * lo + 1, 2, gw * (hi - lo + 1) - 2, gw, gw / 2); C.g.stroke(); if(cur != null){ C.g.fillStyle = '#2B2D42'; C.g.beginPath(); D.ell(C.g, 2 + gw * cur + gw / 2, gw + 1, 3, 3); C.g.fill(); } return C.c; }
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
function chipsHtml(rows){ return '<div class="ck-chips">' + rows.map(r => '<span role="button" tabindex="0" class="ck-chip ck-tap ' + (r.ok ? 'ok' : 'need') + '" data-m="' + esc(r.id) + '"><span class="ic">' + r.icon + '</span>' + esc(r.name) + ' ' + (r.id === 'coins' ? r.need : r.have + ' / ' + r.need) + ' <span class="mk">' + (r.ok ? '✓' : '✗') + '</span></span>').join('') + '</div>'; }
function missHtml(rows){ const m = rows.filter(r => !r.ok); if(!m.length) return ''; return '<div class="ck-miss">' + m.slice(0, 2).map(r => r.icon + ' ' + (r.id === 'coins' ? (r.need - r.have) + ' more coins' : (r.need - r.have) + ' more ' + esc(r.name) + ' — ' + esc(where(r.id)))).join('<br>') + '</div>'; }
// the keeper = an AvatarKit avatar (so Acting moves work); feet on (x, y), painted height h
const KEEP = new Map();
function keeperWho(name){ let w = KEEP.get(name); if(!w){ const av = typeof defaultAvatar === 'function' ? Object.assign(defaultAvatar(name), {acc: 0}) : null; w = {name, av, dir: 1}; KEEP.set(name, w); } return w; }
function drawKeeper(g, name, x, y, h, t, cheer){ const who = keeperWho(name); if(!who.av || typeof drawAvatar !== 'function'){ g.save(); g.fillStyle = '#FFC21A'; g.beginPath(); D.ell(g, x, y - h * 0.8, h * 0.18, h * 0.18); g.fill(); g.fillRect(x - h * 0.15, y - h * 0.62, h * 0.3, h * 0.62); g.restore(); return; }
  const e = D.box('ck-keep:' + name, q => drawAvatar(q, who, 0, 0, 1, {t: 0.5, still: true})), k = h / e.h, G = cheer && typeof GESTURES !== 'undefined' ? GESTURES.find(q => q.k === 'cheer') : null;
  if(G) who.gest = {g: G, t: cheer}; else delete who.gest; drawAvatar(g, who, x, y, k, {t}); }
/* ---------------- 🎬 a craft moment: beats on one clock — the game step happens ON contact (onContact), ⭐ Junior+ may tap each glowing beat (same result, sparkle + bigger sound) ---------------- */
const FAST = () => !!window.CK_FAST;
// 🔨 the hammer held at its GRIP (the smith's hand): the head sits at (0, -L) and swings round the grip (av-r0j-b, note #1)
function hammerGrip(g, gx, gy, k, a, L){ g.save(); g.translate(gx, gy); g.rotate(a); g.scale(k, k);
  D.piece(g, [{path: q => D.rr(q, -3, -L, 6, L + 6, 3), fill: '#9A6A3A'}, {path: q => D.rr(q, -4, -9, 8, 15, 3), fill: '#5A3A22'}, {path: q => D.rr(q, -13, -L - 8, 26, 16, 3), fill: q => D.lin(q, -13, 0, 13, 0, ['#6A7288', '#D8DEEA', '#6A7288'])}, {path: q => D.rr(q, -16, -L - 9, 5, 18, 2), fill: '#8A92A6'}, {path: q => D.rr(q, 11, -L - 9, 5, 18, 2), fill: '#8A92A6'}], '#2A1C14', 1.6); g.restore(); }
function moment(host, kind, o){ o = o || {}; const ov = document.createElement('div'); ov.className = 'ck-mo'; host.appendChild(ov); const r = ov.getBoundingClientRect(), W = Math.max(1, r.width), H = Math.max(1, r.height), C = cvs(W, H); ov.appendChild(C.c);
  const hint = document.createElement('div'); hint.className = 'ck-mh'; ov.appendChild(hint); const nm = document.createElement('div'); nm.className = 'ck-mn'; nm.textContent = o.title || ''; ov.appendChild(nm);
  // beats: [name, ms, contact?]
  const B = kind === 'cook' ? [['add', 300], ['stir', 320], ['bubble', 90, 1], ['stop', 100], ['pop', 300], ['settle', 200]]
    : kind === 'forge' ? [['ready', 80], ['wind', 220], ['hit', 80, 1], ['stop', 80], ['follow', 160], ['wind', 220], ['hit', 80, 1], ['stop', 80], ['follow', 160], ['wind', 220], ['hit', 80, 1], ['stop', 120], ['follow', 240], ['settle', 240]]
    : [['ready', 80], ['wind', 250], ['hit', 90, 1], ['stop', 120], ['follow', 280], ['settle', 220]];
  let tt = 0; const beats = B.map(b => { const x = {name: b[0], t0: tt, ms: b[1], contact: !!b[2]}; tt += b[1]; return x; }), total = tt, contacts = beats.filter(b => b.contact).map(b => b.t0);
  const st = {t: 0, hits: 0, perfect: 0, tapped: {}, result: null, done: false, fx: []}, basic = !!o.basic;
  hint.textContent = basic ? (kind === 'cook' ? '🍳 Cooking…' : '🔨 Hammering…') : '⭐ Tap when the ring glows!';
  const rec = {kind, beats: beats.map(b => b.name + ':' + b.ms), contacts: contacts.slice(), total, perfect: 0, at: []}; LOG.push(rec); if(LOG.length > 30) LOG.shift();
  function contactNow(i){ st.hits++; rec.at.push(Math.round(st.t)); snd(kind === 'cook' ? 'bubble' : 'clang', st.tapped[i]); if(i === contacts.length - 1 && o.onContact){ try { st.result = o.onContact(); } catch(e){ st.result = {ok: false, err: e.message}; } }
    // 💥 the 🎬 Motion chat's hit package on the CLANG (av-r0j-b, note #3): blunt · medium (★4–5 / forge Lv 5 = heavy) · a forge hit in its element's colours. No AvatarMotion → today's sparks
    let H = null; if(kind !== 'cook' && window.Motion && Motion.hit){ try { const E = kind === 'forge' && o.el ? L.ELS[o.el] : null; H = Motion.hit({kind: 'blunt', weight: o.weight || 'medium', element: E ? o.el : undefined, col: E ? E.c : '#FFB020', seed: 7 + i, calm: !!o.calm}); rec.hit = (rec.hit | 0) + 1; } catch(e){ H = null; } }
    st.fx.push({t: st.t, big: !!st.tapped[i], H}); }
  ov.addEventListener('pointerdown', () => { if(basic || st.done) return; for(let i = 0; i < contacts.length; i++){ const d = st.t - contacts[i]; if(d > -190 && d < 130 && !st.tapped[i]){ st.tapped[i] = 1; st.perfect++; rec.perfect++; snd('perfect'); const rr = ov.getBoundingClientRect(); L.sparkle(rr.left + rr.width / 2, rr.top + rr.height * 0.55, 12, null, true); } } });
  function paint(){ const g = C.g, t = st.t; g.clearRect(0, 0, W, H); const s = Math.min(W / 360, H / 300), cx = W / 2, cy = H * 0.58;
    let shk = null; st.fx.forEach(e => { if(e.H){ const a = e.H.at(t - e.t); if(a && a.shake && (a.shake.x || a.shake.y)) shk = a.shake; } }); g.save(); if(shk) g.translate(shk.x * s, shk.y * s);
    const cur = beats.find(b => t >= b.t0 && t < b.t0 + b.ms) || beats[beats.length - 1], f = Math.min(1, (t - cur.t0) / cur.ms);
    if(kind === 'cook'){ P.pot(g, cx, cy + 40 * s, 1.5 * s, t / 1000, 1); const ings = o.ings || [];
      if(cur.name === 'add') ings.forEach((m, i) => { const yy = cy - 140 * s + f * 120 * s - i * 10 * s, xx = cx + (i - (ings.length - 1) / 2) * 44 * s; pic(g, {mat: m}, xx - 22 * s, yy - 22 * s, 44 * s, 44 * s, 0); });
      if(cur.name === 'stir'){ const a = f * TAU * 1.5; g.save(); g.strokeStyle = '#B07842'; g.lineWidth = 7 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx + Math.cos(a) * 26 * s, cy - 10 * s + Math.sin(a) * 8 * s); g.lineTo(cx + Math.cos(a) * 12 * s + 30 * s, cy - 90 * s); g.stroke(); g.restore(); }
      const after = t >= contacts[0];
      if(after && o.use){ const pf = Math.min(1, (t - contacts[0] - 90) / 300), py = cy - 20 * s - Math.sin(Math.max(0, pf) * Math.PI) * 90 * s * (1 - pf * 0.4) - Math.max(0, pf) * 30 * s; P.plate(g, cx, cy - 76 * s, 70 * s); if(pf > 0) L.usePic(g, o.use, cx - 50 * s, py - 92 * s + 0 * s, 100 * s, 78 * s); }
      if(!after && contacts[0] - t < 260 && !basic){ const k = Math.max(0, (contacts[0] - t) / 260); g.save(); g.strokeStyle = 'rgba(255,240,170,' + (1 - k * 0.6) + ')'; g.lineWidth = 5 * s; g.beginPath(); D.ell(g, cx, cy - 20 * s, (34 + k * 70) * s, (34 + k * 70) * s * 0.6); g.stroke(); g.restore(); } }
    else { P.anvil(g, cx, cy + 34 * s, 1.6 * s); const thing = o.item ? {item: o.item} : null, rise = (cur.name === 'follow' || cur.name === 'settle') && t >= contacts[contacts.length - 1];
      if(kind === 'forge' && o.el){ const E = L.ELS[o.el] || {c: '#FF7A2E'}, lvl = Math.min(1, st.hits / 3); D.glow(g, cx, cy - 6 * s, (60 + lvl * 80) * s, E.c, 0.25 + lvl * 0.35);
        if(st.hits === 0){ const ff = Math.min(1, t / Math.max(1, contacts[0])); P.core(g, o.el, cx + (1 - ff) * 120 * s, cy - (1 - ff) * 120 * s - 20 * s, 0.9 * s); } }
      if(thing){ const sz = 110 * s, lift = rise ? Math.min(1, (t - contacts[contacts.length - 1] - 120) / 260) : 0, yy = cy - 18 * s - sz - Math.max(0, lift) * 40 * s;
        g.save(); if(!rise && kind === 'craft'){ g.globalAlpha = 0.35; } L.card(g, o.item, cx - sz * 0.5, yy, sz, sz, t / 1000); g.restore(); }
      // 🔥 the hot blank lies ON the anvil face, in the middle — that is where every hit lands (av-r0j-b, note #1)
      const face = cy + 34 * s - 8 * 1.6 * s, mid = cx - 4 * s, hot = Math.min(1, st.hits / Math.max(1, contacts.length)), lastHit = st.fx.length ? t - st.fx[st.fx.length - 1].t : 999;
      if(lastHit < 260) D.glow(g, mid, face - 6 * s, 60 * s, '#FF9F1A', 0.45 * (1 - lastHit / 260));
      g.save(); g.fillStyle = D.lin(g, 0, face - 10 * s, 0, face, ['#FFE9A0', '#FF7A2E']); g.beginPath(); D.rr(g, mid - 30 * s, face - 10 * s, 60 * s, 10 * s, 5 * s); g.fill(); g.strokeStyle = '#2A1C14'; g.lineWidth = 1.5; g.stroke(); g.restore();
      // the hammer: held at the GRIP, the head arcs up + back on the wind-up (anticipation), comes down onto the blank on contact, a small rebound on follow-through
      let a = -0.2; if(cur.name === 'ready') a = -0.2 - f * 0.2; else if(cur.name === 'wind') a = -0.4 - (1 - Math.pow(1 - f, 3)) * 1.25; else if(cur.name === 'hit') a = -1.65 + Math.pow(f, 2) * 2.1; else if(cur.name === 'stop') a = 0.45; else if(cur.name === 'follow') a = 0.45 - Math.sin(f * Math.PI) * 0.3 - f * 0.3; else a = 0.15 - f * 0.35;
      // at contact the handle lies level (grip to the right), so the head's END face comes straight down onto the blank — like a real hammer
      const hk = 2.0 * s, HL = 50, T = [mid, face - 10 * s - 14 * hk], G = [mid + HL * hk, T[1]];
      hammerGrip(g, G[0], G[1], hk, -Math.PI / 2 + (0.45 - a) * (0.95 / 2.1), HL); st.hx = mid; st.hy = face - 10 * s;
      if(!basic){ contacts.forEach((c0, i) => { const d = c0 - t; if(d > 0 && d < 260){ const k = d / 260; g.save(); g.strokeStyle = 'rgba(255,240,170,' + (1 - k * 0.6) + ')'; g.lineWidth = 5 * s; g.beginPath(); D.ell(g, cx, cy - 2 * s, (30 + k * 70) * s, (30 + k * 70) * s * 0.55); g.stroke(); g.restore(); } }); } }
    st.fx.forEach(e => { const ff = (t - e.t) / 380; if(e.H && kind !== 'cook'){ if(t - e.t < 700) Motion.drawHitFx(g, e.H, t - e.t, st.hx || cx, st.hy || cy, (e.big ? 1.9 : 1.6) * s, 1); return; }
      if(ff < 1) P.sparks(g, cx, cy - (kind === 'cook' ? 20 : 4) * s, (e.big ? 90 : 62) * s, ff, kind === 'forge' && o.el ? (L.ELS[o.el] || {}).c : '#FFC21A', e.big ? 16 : 10); });
    g.restore();
  }
  return new Promise(res => { const t0 = performance.now(); let ci = 0;
    function end(){ st.done = true; ov.remove(); res({result: st.result, perfect: st.perfect, hits: st.hits}); }
    if(FAST()){ for(let i = 0; i < contacts.length; i++){ st.t = contacts[i]; contactNow(i); } st.t = total; paint(); setTimeout(end, 0); return; }
    function step(now){ if(!ov.isConnected){ st.done = true; res({result: st.result, perfect: st.perfect, hits: st.hits}); return; } st.t = now - t0; while(ci < contacts.length && st.t >= contacts[ci]){ contactNow(ci); ci++; } paint(); if(st.t >= total){ end(); return; } requestAnimationFrame(step); }
    requestAnimationFrame(step); }); }
/* ---------------- 🧱 the ONE material info card (av-r0j-b, note #2) — opens from every recipe chip, shop row, material card and the bag's 🧱 Craft tab ----------------
   Craft.info(host, id, {bag, town, onShop(row)}) → {close} · picture · family + grade 1–3 · 🎒 have · 🛒 shop price + Town Lv · 👾 drops · 🧺 gathering · 🔧 used for · (📜 quests via o.quests(id)) */
function grade(gr, col){ return '<span class="ck-grade" aria-label="grade ' + (gr + 1) + ' of 3">' + [0, 1, 2].map(i => '<i style="background:' + (i <= gr ? col : '#DDE3EC') + '"></i>').join('') + '</span>'; }
function info(host, id, o){ o = o || {}; css(); const B = o.bag || null, M = P.MATDEF[id], core = /^core\./.test(id), E = core ? L.ELS[id.slice(5)] : null;
  const el = document.createElement('div'); el.className = 'ck-info'; host.appendChild(el); const town = o.town || 5, S0 = shopOf(id, town), uf = usedFor(id), dr = dropsOf(id), ga = gatherOf(id), have0 = B ? have(B, id) : null;
  const fam = M ? (P.FAM.find(f => f[0] === M.fam) || [])[2] : core ? 'Element core' : '';
  const tiles = [];
  if(have0 != null) tiles.push({icon: '🎒', v: '×' + have0, label: 'you have', cls: have0 ? '' : 'need'});
  tiles.push(S0 ? {icon: '🛒', v: '🪙 ' + S0.price, label: S0.town > 1 ? 'shop · Town Lv ' + S0.town : 'shop'} : {icon: '🛒', v: '—', label: 'not in shops'});
  if(dr) tiles.push({icon: '👾', v: 'drops', label: dr, col: '#7A4BD6'}); if(ga) tiles.push({icon: '🧺', v: 'gather', label: ga, col: '#2E9E46'});
  const q = typeof o.quests === 'function' ? o.quests(id) : null;
  el.innerHTML = '<div class="ck-icard"><button class="lk-b ck-ix" aria-label="Close">✕</button><div class="ck-itop"><span class="ck-ipic"></span><div class="tx"><div class="ck-dn">' + esc(matName(id)) + '</div><div class="ck-ds">' + (M ? M.icon + ' ' + esc(fam) + ' · grade ' + (M.gr + 1) + ' of 3 ' + grade(M.gr, M.col) : core ? (E ? E.icon + ' ' : '') + 'Element core · for the 🔥 forge' : '') + '</div></div></div>'
    + '<div class="lk-stats lk-tiles">' + L.tilesHtml(tiles) + '</div>'
    + '<div class="ck-lab">🔧 Used for</div><div class="ck-chips ck-uf">' + (uf.length ? uf.map(u => '<span class="ck-chip">' + u.icon + ' ' + esc(u.what) + ' ×' + u.n + '</span>').join('') : '<span class="ck-note">nothing yet — later rounds</span>') + '</div>'
    + (q ? '<div class="ck-lab">📜 Quests</div><div class="ck-note">' + esc(q) + '</div>' : '') + '<div class="ck-acts"></div></div>';
  el.querySelector('.ck-ipic').appendChild(picCanvas(core ? {core: id.slice(5)} : {mat: id}, 84, 84));
  const close = () => { el.remove(); if(o.onClose) o.onClose(); }; el.querySelector('.ck-ix').onclick = close; el.addEventListener('pointerdown', e => { if(e.target === el) close(); });
  if(S0 && S0.open && o.onShop){ const b = document.createElement('button'); b.className = 'lk-b lk-react main ck-ishop'; b.textContent = '🛒 Buy at the shop'; b.onclick = () => { close(); o.onShop(S0); }; el.querySelector('.ck-acts').appendChild(b); }
  L.iconize(el); const card = el.querySelector('.ck-icard'); for(let k = 0; k < 4 && card.scrollHeight > card.clientHeight + 1; k++) card.classList.add(k ? 'tighter' : 'tight');
  return {el, close}; }
// 🧱 the materials page (note #10): a card per material — picture · name · grade dots · ×have · where · "🔧 n things"; families as wrapping chips, cards in pages ‹ · › (no scroll)
function mats(box, o){ o = o || {}; css(); const B = o.bag || L.bag({c: 0}), ov = document.createElement('div'); ov.className = 'ck-ov ck-mats' + (box === document.body ? ' ck-fixed' : ''); box.appendChild(ov);
  const V = {fam: o.fam || 'all', page: 0, closed: false}, FAMS = [['all', '🧱', 'All']].concat(P.FAM.map(f => [f[0], f[1], f[2]]));
  ov.innerHTML = '<div class="ck-sheet"><div class="ck-head"><button class="lk-b lk-react ck-back">◀ ' + esc(o.backLabel || 'Back') + '</button><b class="ck-ttl">🧱 Materials</b><span class="ck-sp"></span><span class="ck-coin"></span></div><div class="ck-tabs ck-fams"></div><div class="ck-mgrid"></div><div class="ck-pager"></div></div><span class="ui-modal on" style="display:none!important"></span>';
  const $ = q => ov.querySelector(q), list = () => Object.keys(P.MATDEF).filter(id => V.fam === 'all' || P.MATDEF[id].fam === V.fam);
  function render(){ if(V.closed) return; $('.ck-coin').textContent = '🪙 ' + (B.c | 0); const F = $('.ck-fams'); F.innerHTML = FAMS.map(f => '<button class="lk-tab lk-react' + (f[0] === V.fam ? ' on' : '') + '" data-f="' + f[0] + '">' + f[1] + ' <span class="lb">' + esc(f[2]) + '</span></button>').join('');
    F.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { V.fam = b.dataset.f; V.page = 0; render(); }); L.iconize(F); F.classList.toggle('icons', F.scrollHeight > 96);
    const G = $('.ck-mgrid'), r = G.getBoundingClientRect(), wide = r.width >= 700, cols = r.width >= 1000 ? 4 : r.width >= 640 ? 3 : 2, cw = (r.width - (cols - 1) * 8) / cols, ch = Math.max(118, Math.min(wide ? 210 : 170, cw * 0.62)), rows = Math.max(1, Math.floor((r.height + 8) / (ch + 8))), per = cols * rows;
    const L0 = list(), pages = Math.max(1, Math.ceil(L0.length / per)); V.page = Math.min(V.page, pages - 1); G.style.gridTemplateColumns = 'repeat(' + cols + ', minmax(0, 1fr))'; G.innerHTML = '';
    L0.slice(V.page * per, V.page * per + per).forEach(id => { const M = P.MATDEF[id], n = have(B, id), S0 = shopOf(id, o.town || 5), uf = usedFor(id), dr = dropsOf(id), ga = gatherOf(id);
      const wh = S0 ? '🛒 🪙 ' + S0.price + (S0.town > 1 ? ' · Town ' + S0.town : '') : dr ? '👾 ' + dr : ga ? '🧺 ' + ga : M.where;
      const c = document.createElement('button'); c.className = 'ck-mcard lk-react' + (n ? '' : ' none'); c.dataset.m = id; c.style.height = ch + 'px';
      c.innerHTML = '<span class="ck-mpic"></span><span class="tx"><span class="nm">' + esc(M.name) + '</span>' + grade(M.gr, M.col) + '<span class="wh">' + esc(wh) + '</span></span><span class="ck-mn">×' + n + '</span><span class="ck-muf">🔧 ' + (uf.length ? uf.length + ' thing' + (uf.length > 1 ? 's' : '') : 'later') + '</span>';
      c.querySelector('.ck-mpic').appendChild(picCanvas({mat: id}, Math.round(ch * 0.5), Math.round(ch * 0.5))); c.onclick = () => info(ov.querySelector('.ck-sheet'), id, {bag: B, town: o.town, onShop: o.onShop, quests: o.quests}); G.appendChild(c); });
    const pg = $('.ck-pager'); pg.innerHTML = ''; pg.style.display = pages > 1 ? '' : 'none'; if(pages > 1){ const pv = document.createElement('button'); pv.className = 'lk-b ck-prev'; pv.textContent = '‹'; pv.disabled = V.page === 0; pv.onclick = () => { V.page--; render(); };
      const dots = document.createElement('div'); dots.className = 'ck-dots'; for(let q2 = 0; q2 < pages; q2++){ const d = document.createElement('span'); if(q2 === V.page) d.className = 'on'; dots.appendChild(d); }
      const nx = document.createElement('button'); nx.className = 'lk-b ck-next'; nx.textContent = '›'; nx.disabled = V.page >= pages - 1; nx.onclick = () => { V.page++; render(); }; pg.append(pv, dots, nx); }
    L.iconize(ov); }
  const close = () => { if(V.closed) return; V.closed = true; window.removeEventListener('resize', onR); ov.remove(); if(o.onClose) o.onClose(); }; $('.ck-back').onclick = close;
  let rt = 0; const onR = () => { clearTimeout(rt); rt = setTimeout(render, 60); }; window.addEventListener('resize', onR); render();
  const api = {el: ov, V, close, render, fam: f => { V.fam = f; V.page = 0; render(); }, info: id => info(ov.querySelector('.ck-sheet'), id, {bag: B, town: o.town})}; ov._ck = api; return api; }
/* ---------------- the station sheet ---------------- */
function open(box, place, o){ o = o || {}; css(); const PL = PLACES[place]; if(!PL) throw new Error('Craft.open: unknown place ' + place);
  const B = o.bag || L.bag({}), S = o.state || state({}), town = Math.max(1, Math.min(5, o.town | 0 || 1)), basic = !!o.basic;
  const ov = document.createElement('div'); ov.className = 'ck-ov'; if(o.theme) L.theme(o.theme, ov);
  if(!box || box === document.body || box === document.documentElement){ box = document.body; ov.classList.add('ck-fixed'); } else if(getComputedStyle(box).position === 'static') box.style.position = 'relative';
  ov.innerHTML = '<div class="ck-sheet" style="background:linear-gradient(' + PL.bg[0] + ',' + PL.bg[1] + ')"><div class="ck-head"><button class="lk-x ck-back">◀ ' + esc(o.backLabel || 'Town') + '</button><b class="ck-ttl">' + PL.icon + ' ' + PL.name + '</b><span class="ck-lvl"></span><span class="ck-sp"></span><span class="ck-coin"></span></div>'
    + '<div class="ck-tabs"></div><div class="ck-body"><div class="ck-keep"><div class="ck-bub"></div></div><div class="ck-list"><div class="ck-rows"></div><div class="ck-pager"></div></div><div class="ck-det"></div></div></div>';
  const mk = document.createElement('span'); mk.className = 'ui-modal on ck-mark'; mk.setAttribute('aria-hidden', 'true'); mk.style.setProperty('display', 'none', 'important'); ov.appendChild(mk);   // UiKit hides 💬 Tell us! while a sheet is open
  box.appendChild(ov); const $ = s => ov.querySelector(s), KEEPEL = ov.querySelector('.ck-keep');
  const V = {place, tab: o.tab && PL.tabs.some(t => t[0] === o.tab) ? o.tab : PL.tabs[0][0], page: 0, sel: 0, up: false, raf: 0, cheer: 0, busy: false, closed: false, el: null, perRow: 1, per: 6, kc: null, msg: '', forgeEl: null, qty: 1, stock: null};
  learn(S, B);
  function lvlHtml(){ if(!PL.lv) return '🏘️ Town Lv ' + town; const lv = S.lv(PL.lv), nx = S.next(PL.lv), pv = LV_XP[lv - 1], f = nx == null ? 1 : ((S.xp[PL.lv] | 0) - pv) / (nx - pv); return PL.icon + ' <span class="nm">' + PL.lvName + ' </span>Lv ' + lv + ' <i><b style="width:' + Math.round(f * 100) + '%"></b></i>'; }
  function head(){ $('.ck-lvl').innerHTML = lvlHtml(); $('.ck-coin').textContent = '🪙 ' + (B.c | 0) + (place === 'smith' ? '  ☁️ ' + (B.st.shards | 0) : ''); }
  function tabs(){ const T = $('.ck-tabs'); if(PL.tabs.length < 2){ T.style.display = 'none'; return; } T.innerHTML = PL.tabs.map(t => '<button class="lk-tab' + (t[0] === V.tab ? ' on' : '') + '" data-t="' + t[0] + '">' + t[1] + '<span class="lb"> ' + t[2] + '</span></button>').join('');
    T.querySelectorAll('.lk-tab').forEach(b => b.onclick = () => { if(V.busy) return; V.tab = b.dataset.t; V.page = 0; V.sel = 0; V.forgeEl = null; V.qty = 1; tabs(); render(); }); fitTabs(); }
  function fitTabs(){ const T = $('.ck-tabs'); if(T.style.display === 'none') return; L.iconize(T); T.classList.remove('icons'); if(innerHeight <= 460 && T.scrollWidth > T.clientWidth + 1) T.classList.add('icons'); }
  // ---- what each tab lists ----
  function items(){ const t = V.tab;
    if(t === 'craft') return recipes().map(id => { const R = RECIPES[id], c = canCraft(B, S, id, {town}), it = {base: R.base, tier: R.tiers[0], lv: 1, seed: 1, sock: 0, runes: []};
      return {key: id, thing: {item: it}, name: itemName(it), sub: RAR[R.tiers[0]].icon + '–' + RAR[R.tiers[1]].icon + '  ' + (c.why === 'smith' ? '🔒 Smith Lv ' + R.smith : c.why === 'town' ? '🔒 Town Lv ' + R.town : Object.keys(R.mats).map(m => matIcon(m) + ' ' + R.mats[m]).join(' · ')), dim: c.why === 'smith' || c.why === 'town', badge: c.ok ? '✓' : null, ok: c.ok}; });
    if(t === 'up') return gear(B).map(x => ({key: 'g' + x.i, i: x.i, thing: {item: x.it}, name: itemName(x.it), sub: RAR[x.it.tier].icon + ' ' + '★'.repeat(starOf(x.it)) + '☆'.repeat(5 - starOf(x.it)) + ' · ⭐ ' + L.power(x.it), badge: starOf(x.it) >= 5 ? 'MAX' : null}));
    if(t === 'forge') return weapons(B).map(x => ({key: 'w' + x.i, i: x.i, thing: {item: x.it}, name: itemName(x.it), sub: '⚔️ Lv ' + (x.it.lv || 1) + ' · ' + (x.it.el ? L.ELS[x.it.el].icon + ' ' + L.ELS[x.it.el].name + ' Lv ' + (x.it.elv || 1) : 'plain') + ((L.get(x.it.base) || {}).staff ? ' 🧙' : '')}));
    if(t === 'merge') return mergeGroups(B).map(m => ({key: m.base + '|' + m.tier, grp: m, thing: {item: {base: m.base, tier: m.tier, lv: 1, seed: 1, sock: 0, runes: []}}, name: (L.get(m.base) || {}).name || m.base, sub: RAR[m.tier].icon + ' ×' + m.n + (m.can ? '  →  ' + RAR[m.tier + 1].icon : '  · 🔒 cap ' + RAR[m.cap].icon), dim: !m.can, badge: m.can ? '3→1' : null}));
    if(t === 'recycle') return gear(B).map(x => ({key: 'r' + x.i, i: x.i, thing: {item: x.it}, name: itemName(x.it), sub: RAR[x.it.tier].icon + ' ' + RAR[x.it.tier].name + (x.it.lock ? ' · 🔒' : ''), dim: !!x.it.lock}));
    if(t === 'cook') return cookList().map(id => { const d = L.USES[id], k = !!S.known[id], c = canCook(B, S, id, 1); return {key: id, use: id, thing: {use: id}, name: k ? d.name : (L.ISLES[d.island] || '🏝️ ' + d.island), sub: k ? Object.keys(d.cook).map(m => matIcon(m) + ' ' + d.cook[m]).join(' · ') + (B.u[id] ? ' · have ×' + B.u[id] : '') : 'find its food on this island', dim: !k, unknown: !k, badge: c.ok ? '✓' : null, ok: c.ok}; });
    if(t === 'buy'){ V.stock = V.stock || stock({town, day: o.day}); return V.stock.map((r, n) => ({key: 's' + n, row: r, thing: r.kind === 'use' ? {use: r.id} : {mat: r.id}, name: r.name, sub: '🪙 ' + r.price + (r.deal ? ' (was ' + r.was + ')' : '') + ' · have ' + (r.kind === 'use' ? (B.u[r.id] | 0) : have(B, r.id)), uf: r.kind === 'mat' ? ufLine(r.id) : (L.USES[r.id] ? L.USES[r.id].eff.map(e => L.effRow(e)[0] + ' ' + L.effRow(e)[2]).join(' · ') : ''), badge: r.deal ? '📅 deal' : null, deal: !!r.deal})); }
    if(t === 'back') return B.buy.map((it, k) => ({key: 'b' + k, k, thing: {item: it}, name: itemName(it), sub: RAR[it.tier].icon + ' · 🪙 ' + L.price(it)}));
    return []; }
  function ufLine(id){ const u = usedFor(id); return u.length ? '🔧 ' + u.slice(0, 3).map(x => x.icon + ' ' + x.what).join(' · ') + (u.length > 3 ? ' +' + (u.length - 3) : '') : ''; }
  // ---- the keeper's line ----
  function line(list, cur){ if(V.msg) return V.msg; const t = V.tab;
    if(t === 'craft') return cur ? (cur.ok ? 'Ready! Tap 🔨 Craft and watch the sparks.' : cur.dim ? 'That one needs more practice first.' : 'Bring me the missing things and I\'ll make it shine!') : 'Pick a recipe.';
    if(t === 'up') return list.length ? 'Each ★ makes it 8 % stronger.' : 'Bring me some gear to polish!';
    if(t === 'forge') return list.length ? 'Pick a core — I\'ll hammer its power into the blade.' : 'Bring me a weapon and some cores!';
    if(t === 'merge') return list.length ? 'Three the same? I can make one better!' : 'Merge needs 3 of the SAME item.';
    if(t === 'recycle') return list.length ? 'Old gear turns back into materials.' : 'Nothing to recycle.';
    if(t === 'cook') return cur && cur.unknown ? 'Find its food on that island first!' : 'Mango + rice? My grandma\'s recipe! Sweet AND lucky.';
    if(t === 'buy') return 'Fresh today! The 📅 deal is 30 % off.';
    if(t === 'back') return list.length ? 'Sold by mistake? Buy it back.' : 'Nothing to buy back.';
    return ''; }
  // ---- layout: wide = keeper · list · detail side by side; upright = keeper strip · list · detail below (no page scroll, no sideways rows) ----
  function layout(){ const body = $('.ck-body'), r = body.getBoundingClientRect(), W = r.width, H = r.height, sheet = $('.ck-sheet').getBoundingClientRect();
    V.up = sheet.width < 640 || sheet.width / Math.max(1, sheet.height) < 1.15; body.classList.toggle('up', V.up); const K = KEEPEL, Lst = $('.ck-list'), Dt = $('.ck-det');
    if(V.up){ K.className = 'ck-strip'; const kh = Math.max(46, Math.min(78, H * 0.14)); K.style.height = kh + 'px'; K.style.width = ''; Lst.style.width = ''; V.kw = kh * 0.8; V.kh = kh;
      V.detH = Math.round(Math.max(Math.min(170, H * 0.5), (H - kh) * 0.56)); Dt.style.height = V.detH + 'px'; }
    else { K.className = 'ck-keep'; const kw = Math.max(110, Math.min(210, W * 0.2)); K.style.width = kw + 'px'; K.style.height = ''; Lst.style.width = Math.max(220, Math.min(340, W * 0.32)) + 'px'; V.kw = kw; V.kh = H; Dt.style.height = ''; V.detH = 0; } }
  function keeperCanvas(){ const K = KEEPEL; let c = K.querySelector('canvas'); const w = Math.round(V.up ? V.kw : V.kw), h = Math.round(V.up ? V.kh : Math.max(60, V.kh - 22));
    if(!c || V.kc !== w + 'x' + h){ if(c) c.remove(); const C = cvs(w, h); c = C.c; V.kg = C.g; V.kc = w + 'x' + h; if(V.up) K.insertBefore(c, K.firstChild); else K.insertBefore(c, K.querySelector('.ck-kname') || null); V.kW = w; V.kH = h; }
    let nmEl = K.querySelector('.ck-kname'); if(!V.up){ if(!nmEl){ nmEl = document.createElement('div'); nmEl.className = 'ck-kname'; K.appendChild(nmEl); } nmEl.textContent = PL.icon + ' ' + PL.keeper; } else if(nmEl) nmEl.remove(); }
  function drawK(now){ if(!V.kg) return; const g = V.kg, w = V.kW, h = V.kH; g.clearRect(0, 0, w, h); const t = now / 1000, ch = V.cheer && now - V.cheer < 1400 ? (now - V.cheer) / 1400 : 0;
    const kh = V.up ? h * 0.96 : Math.min(h * 0.72, w * 1.6), kx = V.up ? w * 0.5 : w * 0.36;
    if(place === 'smith' && !V.up) D.glow(g, w * 0.5, h * 0.92, w * 0.8, '#FF9F1A', 0.22);
    if(place === 'cook' && !V.up) D.glow(g, w * 0.7, h * 0.9, w * 0.6, '#FF9F1A', 0.18);
    drawKeeper(g, PL.keeper, kx, h - 2, kh, t, ch || 0);
    if(place === 'smith' && !V.up) P.anvil(g, w * 0.8, h - 22, Math.min(0.7, w / 260));
    if(place === 'cook' && !V.up) P.pot(g, w * 0.8, h - 20, Math.min(0.6, w / 300), t, 0.6); }
  function loop(now){ if(V.closed) return; drawK(now); V.raf = requestAnimationFrame(loop); }
  // ---- list + pages ----
  function render(){ head(); layout(); keeperCanvas(); const list = items(), Rw = $('.ck-rows'), pg = $('.ck-pager');
    if(V.sel >= list.length) V.sel = Math.max(0, list.length - 1);
    if(V.up){ Rw.innerHTML = ''; detail(list[V.sel] || null, list); }
    const lh = $('.ck-list').getBoundingClientRect().height;
    const rowH = V.up ? (lh < 200 ? 46 : 52) : (V.tab === 'buy' ? 66 : 58), need = list.length * (rowH + 6); let per = Math.max(1, Math.floor((lh + 6) / (rowH + 6)));
    if(need > lh + 6) per = Math.max(1, Math.floor((lh - 46 + 6) / (rowH + 6)));
    V.per = per; const pages = Math.max(1, Math.ceil(list.length / per)); V.page = Math.min(V.page, pages - 1); if(V.sel >= list.length) V.sel = Math.max(0, list.length - 1);
    Rw.innerHTML = ''; list.slice(V.page * per, V.page * per + per).forEach((x, n) => { const i = V.page * per + n, b = document.createElement('button'); b.className = 'ck-row lk-react' + (i === V.sel ? ' on' : '') + (x.dim ? ' dim' : ''); b.dataset.k = x.key; b.style.height = rowH + 'px';
      b.appendChild(picCanvas(x.thing, rowH - 6, rowH - 6)); const tx = document.createElement('span'); tx.className = 'tx'; tx.innerHTML = '<span class="nm">' + esc(x.name) + '</span><span class="sb">' + esc(x.sub) + '</span>' + (x.uf && rowH >= 58 ? '<span class="uf">' + esc(x.uf) + '</span>' : ''); b.appendChild(tx);
      if(x.badge){ const bd = document.createElement('span'); bd.className = 'bd' + (x.deal ? ' deal' : x.ok ? ' ok' : ''); bd.textContent = x.badge; b.appendChild(bd); }
      b.onclick = () => { if(V.busy) return; const pg0 = V.page; V.sel = i; V.msg = ''; V.forgeEl = null; V.qty = 1; render(); if(V.up && V.page !== pg0){ V.page = pg0; } }; Rw.appendChild(b); });
    if(!list.length){ Rw.innerHTML = '<div class="ck-empty">' + esc(line(list, null)) + '</div>'; }
    pg.innerHTML = ''; pg.style.display = pages > 1 ? '' : 'none'; if(pages > 1){ const pv = document.createElement('button'); pv.className = 'lk-b ck-prev'; pv.textContent = '‹'; pv.disabled = V.page === 0; pv.onclick = () => { V.page--; V.sel = V.page * V.per; render(); };
      const dots = document.createElement('div'); dots.className = 'ck-dots'; for(let p = 0; p < pages; p++){ const d = document.createElement('span'); if(p === V.page) d.className = 'on'; dots.appendChild(d); }
      const nx = document.createElement('button'); nx.className = 'lk-b ck-next'; nx.textContent = '›'; nx.disabled = V.page >= pages - 1; nx.onclick = () => { V.page++; V.sel = V.page * V.per; render(); }; pg.append(pv, dots, nx); }
    const cur = list[V.sel] || null; $('.ck-bub').textContent = line(list, cur); if(!V.up) detail(cur, list); L.iconize(ov); }
  // ---- the detail card for the picked row ----
  function detail(cur, list){ const Dt = $('.ck-det'); Dt.classList.remove('tight', 'tighter', 'tightest'); Dt.innerHTML = ''; if(!cur){ Dt.innerHTML = '<div class="ck-empty">' + esc(line(list, null)) + '</div>'; return; }
    const dr = Dt.getBoundingClientRect(), roomy = !V.up && dr.height > 560 && dr.width > 560; Dt.classList.toggle('roomy', roomy);
    const ps = V.up ? Math.max(56, Math.min(96, dr.width * 0.24)) : Math.max(64, Math.min(roomy ? 230 : 150, dr.height * 0.34, dr.width * 0.34));
    const topEl = document.createElement('div'); topEl.className = 'ck-top'; const t = V.tab; let thing = cur.thing, html = '', acts = [];
    if(t === 'craft'){ const R = RECIPES[cur.key], c = canCraft(B, S, cur.key, {town}), rows = check(B, costOf(R)).rows, o2 = odds(R, S);
      topEl.innerHTML = '<div class="tx"><div class="ck-dn">' + esc(cur.name) + '</div><div class="lk-stats lk-tiles ck-tiles">' + L.tilesHtml([{icon: '⭐', v: L.power({base: R.base, tier: R.tiers[0], lv: 1}) + '–' + L.power({base: R.base, tier: R.tiers[1], lv: 1}), label: 'Gear power', cls: 'main'}, {icon: '◇', v: L.SOCK[R.tiers[0]] + '–' + L.SOCK[R.tiers[1]], label: 'Rune sockets', cls: 'sock'}]) + '</div><div class="ck-gems"></div><div class="ck-note">can come out ' + o2.map(x => RAR[x.tier].icon + ' ' + Math.round(x.p * 100) + ' %').join(' · ') + ' · never above ' + RAR[R.tiers[1]].name + '</div></div>';
      html = '<div class="ck-lab">You need</div>' + chipsHtml(rows) + (c.why === 'smith' ? '<div class="ck-miss">🔒 Smith Lv ' + R.smith + ' — craft, upgrade and forge to level up.</div>' : c.why === 'town' ? '<div class="ck-miss">🔒 Town Lv ' + R.town + ' — help the town grow first.</div>' : missHtml(rows));
      acts.push(['🔨 Craft', 'main ck-go', c.ok, () => doCraft(cur.key)]); }
    else if(t === 'up'){ const it = B.g[cur.i], c = upCost(it), s = starOf(it);
      topEl.innerHTML = '<div class="tx"><div class="ck-dn">' + esc(cur.name) + '</div><div class="lk-chips">' + L.headHtml(it) + '</div><div class="lk-stats lk-tiles ck-tiles">' + L.tilesHtml([{icon: '⭐', v: L.power(it) + (c ? ' → ' + L.power(Object.assign({}, it, {star: c.to})) : ''), label: 'Gear power', cls: 'main'}, {icon: '★', v: s + ' / 5', label: 'each ★ = +8 %', col: '#B07800'}]) + '</div></div>';
      if(c){ const rows = check(B, c).rows; html = '<div class="ck-lab">★' + c.from + ' → ★' + c.to + '</div>' + chipsHtml(rows) + missHtml(rows) + (c.to === 5 ? '<div class="ck-note">★5 = a gold glint on the gear.</div>' : ''); acts.push(['⬆️ ★' + c.from + ' → ★' + c.to, 'main ck-go', check(B, c).ok, () => doUp(cur.i)]); }
      else html = '<div class="ck-note">★5 — the best it can be! ✨</div>'; }
    else if(t === 'forge'){ const it = B.g[cur.i], sel = V.forgeEl || it.el || Object.keys(L.ELS).find(e => have(B, 'core.' + e) > 0) || 'fire'; V.forgeEl = sel; const c = forgeCost(it, sel), E = L.ELS[sel];
      topEl.innerHTML = '<div class="tx"><div class="ck-dn">' + esc(cur.name) + '</div><div class="lk-chips">' + L.headHtml(it) + '</div><div class="ck-ds">' + (it.el ? '' : 'plain — no element yet') + ((L.get(it.base) || {}).staff ? (it.el ? '' : ' · ') + '🧙 staff: +10 % a level to its element\'s spells' : '') + '</div></div>';
      html = '<div class="ck-lab">Pick a core</div><div class="ck-cores">' + Object.keys(L.ELS).map(e => { const n = have(B, 'core.' + e), Ee = L.ELS[e]; return '<button class="ck-core lk-react' + (e === sel ? ' on' : '') + (n ? '' : ' none') + '" data-e="' + e + '" style="--ec:' + Ee.c + '" aria-label="' + esc(Ee.name + ' core ×' + n) + '"><span class="tok"></span>' + (n ? '<i>×' + n + '</i>' : '<i class="lk">🔒</i>') + '<b>' + Ee.icon + ' ' + esc(Ee.name) + '</b>' + (n ? '' : '<s>' + esc(dropsOf('core.' + e)) + '</s>') + (e === sel ? '<u>✓</u>' : '') + '</button>'; }).join('') + '</div>';
      if(c && !c.max){ const rows = check(B, c).rows, bars = [0, 1, 2, 3, 4].map(n => '<span class="' + (n < c.from ? 'on' : n === c.from ? 'nx' : '') + '"></span>').join('');
        html += '<div class="ck-lab">' + E.icon + ' ' + E.name + (c.from ? ' Lv ' + c.from + ' → ' + c.to : ' · new, Lv 1') + (c.swap ? ' · 🔄 swap (½ of the ' + L.ELS[it.el].icon + ' cores back)' : '') + '</div><div class="ck-bar">' + bars + '</div>' + chipsHtml(rows) + missHtml(rows)
          + '<div class="lk-stats lk-tiles ck-tiles ck-vs">' + L.tilesHtml(Object.keys(L.ELS).filter(d => L.elVs(sel, d) !== 'normal').map(d => { const m = L.elMult(sel, d, c.to); return {icon: m.k === 'strong' ? '⬆️' : m.k === 'same' ? '🟰' : '⬇️', v: L.ELS[d].icon + ' ×' + (+m.x).toFixed(2), label: m.k === 'strong' ? 'strong vs ' + L.ELS[d].name : m.k === 'same' ? 'same element' : 'weak vs ' + L.ELS[d].name, cls: m.k === 'strong' ? 'up' : 'dn'}; })) + '</div>';
        acts.push(['🔥 Forge!', 'main ck-go', check(B, c).ok, () => doForge(cur.i, sel)]); }
      else html += '<div class="ck-note">' + E.icon + ' ' + E.name + ' Lv 5 — full power!</div>'; }
    else if(t === 'merge'){ const m = cur.grp, cost = mergeCost(m.tier), rows = check(B, cost).rows; thing = {item: {base: m.base, tier: Math.min(6, m.can ? m.tier + 1 : m.tier), lv: 1, seed: 1, sock: 0, runes: []}};
      topEl.innerHTML = '<div class="tx"><div class="ck-dn">' + esc(cur.name) + '</div><div class="ck-ds">3 × ' + RAR[m.tier].icon + ' ' + RAR[m.tier].name + (m.can ? ' → 1 × ' + RAR[m.tier + 1].icon + ' ' + RAR[m.tier + 1].name : '') + '</div><div class="ck-note">keeps the best level, ★ and element · never above ' + RAR[m.cap].name + '</div></div>';
      html = m.can ? chipsHtml(rows) + missHtml(rows) : '<div class="ck-miss">🔒 ' + esc(cur.name) + ' stops at ' + RAR[m.cap].icon + ' ' + RAR[m.cap].name + '.</div>'; if(m.can) acts.push(['🔀 Merge', 'main ck-go', check(B, cost).ok, () => doMerge(m.base, m.tier)]); }
    else if(t === 'recycle'){ const it = B.g[cur.i], m = L.recycleOf(it);
      topEl.innerHTML = '<div class="tx"><div class="ck-dn">' + esc(cur.name) + '</div><div class="lk-chips">' + L.headHtml(it) + '</div><div class="ck-ds">⭐ ' + L.power(it) + ' power</div></div>';
      html = '<div class="ck-lab">You get</div><div class="ck-chips">' + Object.keys(m).map(k => '<span class="ck-chip ok"><span class="ic">' + matIcon(k) + '</span>' + esc(matName(k)) + ' ×' + m[k] + '</span>').join('') + (it.tier >= 6 ? '<span class="ck-chip ok"><span class="ic">☁️</span>Sky Shard ×5</span>' : '') + '</div>'
        + (it.lock ? '<div class="ck-miss">🔒 Locked — unlock it in the 🎒 bag first.</div>' : '<div class="ck-note">rare ones ask "sure?" first</div>'); acts.push(['♻️ Recycle', 'warn ck-go', !it.lock, () => doRecycle(cur.i)]); }
    else if(t === 'cook'){ const d = L.USES[cur.use], k = !!S.known[cur.use];
      topEl.innerHTML = '<div class="tx"><div class="ck-dn">' + esc(k ? d.name : '???') + '</div><div class="ck-ds">' + (L.ISLES[d.island] || d.island) + ' · you have ×' + (B.u[cur.use] | 0) + ' (max ' + L.USE_MAX + ')</div></div>';
      if(!k){ html = '<div class="ck-miss">🏝️ Not found yet — pick up one of its foods on ' + esc(L.ISLES[d.island] || d.island) + ' and the recipe appears.</div>'; }
      else { const c1 = canCook(B, S, cur.use, 1), c5 = canCook(B, S, cur.use, 5), rows = check(B, cookCost(cur.use, 1)).rows;
        html = '<div class="lk-stats lk-tiles ck-tiles ck-eff">' + L.tilesHtml(d.eff.map(e => { const r2 = L.effRow(e); return {icon: r2[0], v: r2[2], label: r2[1]}; })) + '</div>' + chipsHtml(rows) + (c1.ok ? '' : c1.why === 'full' ? '<div class="ck-miss">🎒 ×99 — eat some first!</div>' : missHtml(rows));
        acts.push(['🍳 Cook ×1', 'main ck-go', c1.ok, () => doCook(cur.use, 1)], ['🍳 ×5', 'ck-go5', c5.ok, () => doCook(cur.use, 5)]); } }
    else if(t === 'buy'){ const r = cur.row, n = V.qty, cost = r.price * n, ok = (B.c | 0) >= cost && !(r.kind === 'use' && ((B.u[r.id] | 0) + n) > L.USE_MAX);
      topEl.innerHTML = '<div class="tx"><div class="ck-dn">' + esc(r.name) + '</div><div class="ck-ds">🪙 ' + r.price + ' each' + (r.deal ? ' · 📅 today\'s deal (was ' + r.was + ')' : '') + ' · have ' + (r.kind === 'use' ? (B.u[r.id] | 0) : have(B, r.id)) + '</div>' + (r.kind === 'mat' ? '<div class="ck-note">' + esc(where(r.id)) + '</div>' : '') + '</div>';
      html += '<div class="ck-qty">' + [1, 5, 10].map(q => '<button class="lk-tab' + (q === n ? ' on' : '') + '" data-q="' + q + '">×' + q + '</button>').join('') + '</div>' + (ok ? '' : '<div class="ck-miss">' + ((B.c | 0) < cost ? '🪙 ' + (cost - (B.c | 0)) + ' more coins' : '🎒 ×99 is the most') + '</div>');
      acts.push(['🪙 Buy ×' + n + ' · ' + cost, 'main ck-go', ok, () => doBuy(r, n)]); }
    else if(t === 'back'){ const it = B.buy[cur.k], pr = L.price(it); topEl.innerHTML = '<div class="tx"><div class="ck-dn">' + esc(cur.name) + '</div><div class="ck-ds">' + RAR[it.tier].icon + ' ' + RAR[it.tier].name + ' · ⭐ ' + L.power(it) + '</div></div>';
      html = '<div class="ck-note">You sold it — get it back for the same 🪙 ' + pr + '.</div>'; acts.push(['🔁 Buy back · ' + pr, 'main ck-go', (B.c | 0) >= pr, () => doBack(cur.k)]); }
    const pc = picCanvas(thing, ps, ps); topEl.insertBefore(pc, topEl.firstChild); Dt.appendChild(topEl); const g2 = topEl.querySelector('.ck-gems'); if(g2 && t === 'craft'){ const R = RECIPES[cur.key]; g2.appendChild(tierGems(R.tiers[0], R.tiers[1], null, Math.min(210, dr.width - ps - 40))); }
    const mid = document.createElement('div'); mid.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex:0 0 auto;'; mid.innerHTML = html; Dt.appendChild(mid);
    mid.querySelectorAll('.ck-core').forEach(b => { b.querySelector('.tok').appendChild(picCanvas({core: b.dataset.e}, 46, 46)); b.onclick = () => { if(V.busy) return; V.forgeEl = b.dataset.e; render(); }; });
    mid.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { V.qty = +b.dataset.q; render(); });
    mid.querySelectorAll('.ck-chip[data-m]').forEach(b => { const id = b.dataset.m; if(id === 'coins') return; b.onclick = () => { if(V.busy) return; info($('.ck-sheet'), id, {bag: B, town, quests: o.quests, onShop: PL.tabs.indexOf('buy') >= 0 ? row => { V.tab = 'buy'; V.page = 0; V.stock = null; tabs(); const L2 = items(); V.sel = Math.max(0, L2.findIndex(x => x.row && x.row.id === row.id)); V.page = Math.floor(V.sel / Math.max(1, V.per || 1)); render(); } : (o.onShop || null)}); }; });
    const A = document.createElement('div'); A.className = 'ck-acts'; acts.forEach(a => { const b = document.createElement('button'); b.className = 'lk-b lk-react ' + a[1]; b.textContent = a[0]; b.disabled = !a[2]; b.onclick = () => { if(!V.busy && !b.disabled) a[3](); }; A.appendChild(b); }); Dt.appendChild(A);
    // fit: never scroll — tighten, then hide the extra lines, then shrink the picture
    if(Dt.scrollHeight > Dt.clientHeight + 1) Dt.classList.add('tight'); if(Dt.scrollHeight > Dt.clientHeight + 1) Dt.classList.add('tighter'); if(Dt.scrollHeight > Dt.clientHeight + 1) Dt.classList.add('tightest');   // av-r0j-b: 3rd step (cores in one row, beats tiles last to go)
    let k = ps; while(Dt.scrollHeight > Dt.clientHeight + 1 && k > 40){ k -= 8; pc.style.width = k + 'px'; pc.style.height = k + 'px'; }
    if(V.up && V.detH){ Dt.style.height = 'auto'; const want = Dt.scrollHeight + 2; Dt.style.height = Math.max(110, Math.min(V.detH, want)) + 'px';
      if(Dt.scrollHeight > Dt.clientHeight + 1){ Dt.classList.add('tight'); if(Dt.scrollHeight > Dt.clientHeight + 1) Dt.classList.add('tighter'); } } }
  function ask(msg, yes, yesTxt){ const A = document.createElement('div'); A.className = 'ck-ask'; A.innerHTML = '<div><div class="m"></div><div class="row"></div></div>'; A.querySelector('.m').textContent = msg; const row = A.querySelector('.row');
    if(yes){ const y = document.createElement('button'); y.className = 'lk-b main ck-yes'; y.textContent = yesTxt || '✓ Yes'; y.onclick = () => { A.remove(); yes(); }; row.appendChild(y); }
    const n = document.createElement('button'); n.className = 'lk-b ck-no'; n.textContent = yes ? '✕ No' : '✓ OK'; n.onclick = () => A.remove(); row.appendChild(n); $('.ck-sheet').appendChild(A); L.iconize(A); }
  function changed(r){ if(r && r.xp && r.xp.up){ V.msg = '🎉 ' + PL.lvName + ' Lv ' + r.xp.lv + '! New things open up.'; snd('perfect'); } if(o.onChange) o.onChange(B, S); render(); }
  function cheer(msg){ V.cheer = performance.now(); V.msg = msg || ''; }
  async function run(kind, title, mo, then){ V.busy = true; ov.classList.add('ck-busy'); let out = null;
    try { out = await moment($('.ck-sheet'), kind, Object.assign({title, basic}, mo)); } finally { V.busy = false; ov.classList.remove('ck-busy'); }
    if(out && out.perfect) S.perf = (S.perf | 0) + out.perfect; if(then) await then(out); return out; }
  // ---- actions ----
  async function doCraft(rid){ const R = RECIPES[rid]; let res = null;
    await run('craft', '🔨 ' + itemName({base: R.base}), {item: {base: R.base, tier: R.tiers[0], lv: 1, seed: 1, sock: 0, runes: []}, onContact: () => { res = craft(B, S, rid, {town, seed: o.seed != null ? o.seed + ':' + S.made : undefined}); return res; }});
    if(!res || !res.ok){ render(); return; } cheer((res.tier >= 3 ? '🌟 ' : '✨ ') + RAR[res.tier].name + ' ' + itemName(res.item) + (res.where === 'mail' ? ' — bag full, it went to 📬 mail.' : '!'));
    if(res.tier >= 3 && !FAST()){ try { const r2 = await L.show($('.ck-sheet'), res.item, {kind: 'beam', basic}); if(r2 === 'equip' && o.onEquip) o.onEquip(res.item); } catch(e){} }
    if(o.onCraft) o.onCraft(res); changed(res); }
  async function doUp(i){ let res = null; const it = B.g[i]; await run('craft', '⬆️ ★' + starOf(it) + ' → ★' + (starOf(it) + 1), {item: it, weight: starOf(it) + 1 >= 4 ? 'heavy' : 'medium', onContact: () => (res = upgrade(B, S, i))});
    if(res && res.ok){ cheer('★' + res.star + '! ⭐ ' + res.power[0] + ' → ' + res.power[1]); } changed(res); }
  async function doForge(i, el, sure){ const it = B.g[i], c = forgeCost(it, el); if(c && c.swap && !sure){ ask('Change ' + L.ELS[it.el].icon + ' ' + L.ELS[it.el].name + ' to ' + L.ELS[el].icon + ' ' + L.ELS[el].name + '? You get ' + c.back + ' ' + L.ELS[it.el].core + ' back (half).', () => doForge(i, el, true), '🔄 Change'); return; }
    let res = null; await run('forge', '🔥 ' + L.ELS[el].name + ' Lv ' + (c ? c.to : ''), {item: it, el, weight: c && c.to >= 5 ? 'heavy' : 'medium', onContact: () => (res = forge(B, S, i, el, {sure: true}))});
    if(res && res.ok) cheer(L.ELS[el].icon + ' ' + L.ELS[el].name + ' Lv ' + res.lv + '!' + (res.back ? ' (+' + res.back + ' ' + matName(res.backCore) + ' back)' : '')); changed(res); }
  async function doMerge(base, tier){ let res = null; await run('craft', '🔀 3 → 1', {item: {base, tier: tier + 1, lv: 1, seed: 1, sock: 0, runes: []}, onContact: () => (res = merge(B, S, base, tier))});
    if(res && res.ok){ cheer('🔀 ' + RAR[res.item.tier].icon + ' ' + RAR[res.item.tier].name + ' ' + itemName(res.item) + '!'); if(res.item.tier >= 3 && !FAST()){ try { await L.show($('.ck-sheet'), res.item, {kind: 'beam', basic}); } catch(e){} } } V.sel = 0; changed(res); }
  function doRecycle(i, sure){ const it = B.g[i], r = recycle(B, S, i, {sure}); if(r.ask) return ask('Recycle ' + RAR[it.tier].icon + ' ' + RAR[it.tier].name + ' ' + itemName(it) + '?', () => doRecycle(i, true), '♻️ Recycle');
    if(r.ok){ snd('pop'); cheer('♻️ ' + Object.keys(r.mats).map(k => matIcon(k) + ' ×' + r.mats[k]).join(' ') + (r.shards ? ' ☁️ ×' + r.shards : '')); } changed(r); }
  async function doCook(id, n){ let res = null; const d = L.USES[id]; await run('cook', '🍳 ' + d.name + (n > 1 ? ' ×' + n : ''), {use: id, ings: Object.keys(d.cook).slice(0, 3), onContact: () => (res = cook(B, S, id, n))});
    if(res && res.ok){ snd('pop'); cheer('🍽️ ' + d.name + ' ×' + n + '! (have ×' + res.left + ')'); } changed(res); }
  function doBuy(row, n){ const r = buy(B, S, row, n); if(r.ok){ snd('coin'); const rr = ov.querySelector('.ck-go').getBoundingClientRect(); L.sparkle(rr.left + rr.width / 2, rr.top, 10); cheer('Thank you! ×' + n + ' ' + row.name + (r.found.length ? ' — 🍳 new recipe found!' : '')); } changed(r); }
  function doBack(k){ const r = B.buyBack(k); if(r.ok){ snd('coin'); cheer('Welcome back!'); V.sel = 0; } changed(r); }
  const close = () => { if(V.closed) return; V.closed = true; cancelAnimationFrame(V.raf); window.removeEventListener('resize', onR); ov.remove(); if(o.onClose) o.onClose(B, S); };
  $('.ck-back').onclick = () => { if(!V.busy) close(); };
  let rt = 0; const onR = () => { clearTimeout(rt); rt = setTimeout(() => { if(!V.closed && !V.busy) render(); }, 60); }; window.addEventListener('resize', onR);
  tabs(); render(); V.raf = requestAnimationFrame(loop);
  const api = {el: ov, V, S, B, close, render, tab: k => { V.tab = k; V.page = 0; V.sel = 0; V.forgeEl = null; tabs(); render(); }, pick: i => { V.sel = i; V.page = Math.floor(i / V.per); render(); }, items, busy: () => V.busy, ask}; ov._ck = api; return api; }
/* ---------------- starter recipes (🧳 Avateer pack — the 4 starter jobs + more, AvatarKit 🗡️ Weapons family pictures) ---------------- */
function wpaint(type, look){ return (g, tier, t) => { if(window.AvWeapons && AvWeapons.idx && AvWeapons.idx(type, look) >= 0){ AvWeapons.draw(g, AvWeapons.idx(type, look), 0, 0, 110, {t, tilt: 0.5}); return; }
  g.save(); g.rotate(0.5); g.fillStyle = '#2A1C14'; g.fillRect(-7, -62, 14, 92); g.fillStyle = ['#C8874A', '#C8D0DE', '#8FD3FF', '#C69CFF', '#FFC21A', '#FF8FD8', '#FFFFFF'][tier] || '#C8D0DE'; g.fillRect(-4, -59, 8, 64); g.fillStyle = '#8A5A2B'; g.fillRect(-14, 4, 28, 6); g.restore(); }; }
L.add('craft', {
  woodsword: {name: 'Wooden Sword', kind: 'weapon', slot: 'hand', paint: wpaint('sword', 0)}, steelblade: {name: 'Steel Blade', kind: 'weapon', slot: 'hand', paint: wpaint('sword', 1)},
  crystalwand: {name: 'Crystal Wand', kind: 'weapon', slot: 'hand', staff: true, paint: wpaint('wand', 1)}, ironflipper: {name: 'Iron Flipper', kind: 'weapon', slot: 'hand', paint: wpaint('spatula', 1)},
  sprinkler: {name: 'Rainbow Sprinkler', kind: 'weapon', slot: 'hand', paint: wpaint('can', 2)}, potlid: {name: 'Pot-lid Shield', kind: 'weapon', slot: 'off', paint: wpaint('potlid', 0)},
  seedpouch: {name: 'Seed Pouch', kind: 'weapon', slot: 'off', paint: wpaint('seedpouch', 0)}, twinblades: {name: 'Twin Blades', kind: 'weapon', slot: 'hand', paint: wpaint('twinblades', 1)},
  greatsword: {name: 'Great Sword', kind: 'weapon', slot: 'hand', paint: wpaint('greatsword', 2)}, starorb: {name: 'Star Orb', kind: 'weapon', slot: 'hand', staff: true, paint: wpaint('orb', 3)}}, {by: 'CraftKit', date: '2026-11-18'});
addRecipe('avateer', {
  woodsword: {base: 'craft.woodsword', tiers: [0, 1], mats: {wood: 4}, coins: 20},
  steelblade: {base: 'craft.steelblade', tiers: [1, 2], mats: {ore: 3, wood: 2, bone: 2}, coins: 120},
  crystalwand: {base: 'craft.crystalwand', tiers: [1, 3], mats: {gem: 2, wood: 3}, coins: 140},
  ironflipper: {base: 'craft.ironflipper', tiers: [1, 2], mats: {ore: 4}, coins: 90},
  potlid: {base: 'craft.potlid', tiers: [0, 2], mats: {wood: 3, ore: 1}, coins: 40},
  seedpouch: {base: 'craft.seedpouch', tiers: [0, 2], mats: {cotton: 2, herb: 2}, coins: 40},
  twinblades: {base: 'craft.twinblades', tiers: [1, 3], mats: {ore: 4, bone: 2}, coins: 160, smith: 2},
  sprinkler: {base: 'craft.sprinkler', tiers: [2, 4], mats: {teak: 2, iron: 2, gem: 1}, coins: 260, smith: 2, town: 3},
  greatsword: {base: 'craft.greatsword', tiers: [2, 3], mats: {iron: 4, teak: 2}, coins: 300, smith: 3},
  starorb: {base: 'craft.starorb', tiers: [2, 4], mats: {gem: 2, ruby: 1, skyash: 1}, coins: 380, smith: 4, town: 3}}, {by: 'CraftKit', date: '2026-11-18'});
const API = {VERSION, PLACES, LV_XP, MAX_LV, XP, STAR_COST, SHOP, DEAL_OFF, FORGE_COINS, RECIPES, BLOCKS, LOG, FAM: P.FAM, MATDEF: P.MATDEF, SHARD,
  have, take, check, pay, matName, matIcon, where, state, lvOf, addRecipe, recipe, recipes, capOf, canCraft, odds, craft, starOf, upCost, upgrade, mergeCost, mergeGroups, merge, recycle,
  forgeCost, forge, weapons, gear, cookList, learn, cookCost, canCook, cook, stock, buy, open, moment, pic, usedFor, shopOf, dropsOf, gatherOf, info, mats, matPic: P.mat, core: P.core, anvil: P.anvil, pot: P.pot, spot: P.spot};
window.Craft = API;
})();
})();
