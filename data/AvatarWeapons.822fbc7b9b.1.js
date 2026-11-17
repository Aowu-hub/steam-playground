
/* ================= 🗡️ AvatarWeapons — the 🗡️ Weapons family of the shared 🏏 Batstick designer (🧳 Avateer chat, av-r0b 2026-11-17) =================
   Comes WITH include('AvatarKit') (Code.gs INCLUDE_ALSO_) — never include it on its own. Needs AvatarKit (emo, racketPattern, RACKET_STICKERS, BatStick).
   Plan: Drive "Avateer — full plan.md" §17e (10 families × ✋ one-hand + off-hand · 🙌 two-hand · ⚔️ dual) + §17r (looks change at mastery Lv 1 · 7 · 14 · 20).
   🐣 morph rule: each of the 4 looks is a real SHAPE change (length · head · guard · extras), not only a colour.
   R0b set (av-r0b) = 10 types × 4 looks = 40 shapes: 🗡️ Sword · 🙌 Greatsword · ⚔️ Twin Blades · 🛡️ Shield · 🪄 Wand · 🔮 Orb · 🍳 Spatula · 🍲 Pot-lid · 🚿 Watering Can · 🌱 Seed pouch.
   The other 6 families (🏹 📖 🔧 🥷 🥊 🎶) + 🙌 / ⚔️ for 🪄 🍳 🚿 come in Avateer R2 — add a TYPES row + a painter, nothing else changes.

   INDEX   v = type index × 4 + look (0–3) · AvWeapons.idx('sword', look) → v · AvWeapons.info(v) → {v, type, look, lv, name, hand, fam}
           AvWeapons.lookFor(mastery) → 0–3 (Lv 1 · 7 · 14 · 20) · AvWeapons.COUNT = 40
   DESIGN  {v, c1, c2, grip, pat, stk} like a racket design (A shape · B sticker · C colours · D pattern) — AvWeapons.design(v, o) cleans it;
           the default colours ARE the drawn look; other colours re-tint the parts nearest each colour role (c1 = blade / head, c2 = trim / gem, grip = handle).
   DRAW    AvWeapons.draw(g, v, x, y, size, {t, design, pair, tilt}) — an icon, grip at (x, y), pointing up (−y); size ≈ 100 units (the drawings run 60–130 units)
           AvWeapons.fit(g, v, x, y, w, h, {t, design, pair}) — centred + scaled into a box (cards, the designer, item frames)
           AvWeapons.held(g, v, o, k, t, {off}) — what AvatarKit drawHeldItem('weapon', …) / the off hand call (hand at the origin, k = avatar scale)
   AVATAR  AvWeapons.arm(av, main, off) → a COPY of the avatar holding them: eq.hand = {id: 'weapon', v, o} (+ eq.off) — 🙌 two-hand leaves the off hand empty,
           ⚔️ dual puts the twin in the off hand by itself. Page-only (never saved into the avatar).
   DESIGNER BatStick.open({family: 'weapon', name, design, owned: [v…] | fn(v), av, onSave(d)}) — the same 🏏 sheet (A · B · C · D tabs), 🗡️ shapes in tab A. */
(function(){
'use strict';
if(typeof window === 'undefined') return;
const TAU = Math.PI * 2, RIM = '#2A1C14';

/* ---------- 🎨 colour roles: the drawn colours stay unless the design changes c1 / c2 / grip ---------- */
function rgbOf(c){ c = String(c).trim(); if(c[0] === '#'){ const n = parseInt(c.slice(1, 7), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  const m = c.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/); return m ? [+m[1], +m[2], +m[3]] : null; }
function hsl(c){ const r = rgbOf(c); if(!r) return null; const R = r[0] / 255, G = r[1] / 255, B = r[2] / 255, mx = Math.max(R, G, B), mn = Math.min(R, G, B), l = (mx + mn) / 2, d = mx - mn;
  let h = 0, s = 0; if(d > 1e-6){ s = d / (1 - Math.abs(2 * l - 1)); h = mx === R ? ((G - B) / d) % 6 : mx === G ? (B - R) / d + 2 : (R - G) / d + 4; h *= 60; if(h < 0) h += 360; } return {h, s, l}; }
function hex(h, s, l){ const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2; let r = 0, g = 0, b = 0;
  if(h < 60){ r = c; g = x; } else if(h < 120){ r = x; g = c; } else if(h < 180){ g = c; b = x; } else if(h < 240){ g = x; b = c; } else if(h < 300){ r = x; b = c; } else { r = c; b = x; }
  const f = v => ('0' + Math.round(Math.max(0, Math.min(1, v + m)) * 255).toString(16)).slice(-2); return '#' + f(r) + f(g) + f(b); }
const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
function moveTo(x, from, to){ const s = to.s < 0.12 ? to.s : clamp01(to.s + (x.s - from.s)); return hex(to.h, s, Math.max(0.04, Math.min(0.97, to.l + (x.l - from.l)))); }
let MAP = null;                       // the colour map of the weapon being painted (null = drawn colours)
const MAPS = new Map();
function mapFor(look, d){
  const roles = ['c1', 'c2', 'grip'], key = look.join('|') + '>' + roles.map(r => d[r]).join('|');
  if(roles.every((r, i) => String(d[r]).toLowerCase() === String(look[i]).toLowerCase())) return null;
  let m = MAPS.get(key); if(m) return m;
  if(MAPS.size > 240) MAPS.clear();
  m = {cache: new Map(), done: new Set(), A: roles.map((r, i) => ({role: r, from: hsl(look[i]), to: hsl(d[r] || look[i])}))}; MAPS.set(key, m); return m;
}
function remap(c){ const x = hsl(c); if(!x || x.l < 0.13 || x.l > 0.96) return c; let best = null, bd = 1;
  MAP.A.forEach(a => { const f = a.from; let d;
    if(f.s < 0.15){ if(x.s >= 0.18) return; d = Math.pow((x.l - f.l) / 0.45, 2); }
    else { if(x.s < 0.15) return; const dh = Math.min(Math.abs(x.h - f.h), 360 - Math.abs(x.h - f.h)) / 40; d = dh * dh + Math.pow((x.s - f.s) / 0.6, 2) + Math.pow((x.l - f.l) / 0.45, 2); }
    if(d < bd){ bd = d; best = a; } });
  return best ? moveTo(x, best.from, best.to) : c; }
function M(c){ if(!MAP || typeof c !== 'string' || (c[0] !== '#' && c.slice(0, 4) !== 'rgb(') || MAP.done.has(c)) return c; let o = MAP.cache.get(c); if(o === undefined){ o = remap(c); MAP.cache.set(c, o); MAP.done.add(o); } return o; }
function MR(role, c){ if(!MAP) return c; const k = role + c; let o = MAP.cache.get(k); if(o === undefined){ const a = MAP.A.find(z => z.role === role), x = hsl(c); o = a && x ? moveTo(x, a.from, a.to) : c; MAP.cache.set(k, o); MAP.done.add(o); } return o; }   // forced role (grips, pommels)

/* ---------- ✏️ drawing helpers (same as the Avateer painters, every colour through M) ---------- */
const ST = {call: 0, pat: 0, pc: -1, pp: -1, pcol: '#fff', pk: 1, t: 0};
const D = {
  sh(h, f){ const c = rgbOf(h) || [128, 128, 128], m = v => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)))); return 'rgb(' + m(c[0]) + ',' + m(c[1]) + ',' + m(c[2]) + ')'; },
  rgba(h, a){ const c = rgbOf(h) || [255, 255, 255]; return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; },
  piece(g, parts, rim, rw){ const call = ST.call++;
    g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
    if(rw > 0){ g.strokeStyle = rim; g.lineWidth = rw * 2; parts.forEach(p => { if(p.noRim) return; g.beginPath(); p.path(g); g.stroke(); if(p.closedFill !== false){ g.fillStyle = rim; g.fill(); } }); }
    parts.forEach((p, i) => { g.beginPath(); p.path(g); if(p.fill){ g.fillStyle = typeof p.fill === 'function' ? p.fill(g) : M(p.fill); g.fill(); }
      if(ST.pat && call === ST.pc && i === ST.pp && typeof racketPattern === 'function'){ g.beginPath(); p.path(g); racketPattern(g, ST.pat, ST.pcol, ST.pk, 40 * ST.pk, 140 * ST.pk, ST.t); } });
    g.restore(); },
  lin(g, x0, y0, x1, y1, stops){ const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => gr.addColorStop(Array.isArray(c) ? c[0] : i / Math.max(1, stops.length - 1), M(Array.isArray(c) ? c[1] : c))); return gr; },
  rad(g, x, y, r0, r1, stops){ const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach((c, i) => gr.addColorStop(Array.isArray(c) ? c[0] : i / Math.max(1, stops.length - 1), M(Array.isArray(c) ? c[1] : c))); return gr; },
  glow(g, x, y, r, col, a){ col = M(col); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = D.rad(g, x, y, 0, r, [[0, D.rgba(col, a == null ? 0.55 : a)], [1, D.rgba(col, 0)]]); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore(); },
  star(g, x, y, r1, r2, n, rot){ n = n || 5; rot = rot == null ? -Math.PI / 2 : rot; for(let i = 0; i < n * 2; i++){ const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n; i ? g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); },
  rr(g, x, y, w, h, r){ r = Math.min(r, w / 2, h / 2); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); },
  ell(g, x, y, rx, ry, rot){ g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU); },
  sparkle(g, x, y, r, col){ g.save(); g.fillStyle = M(col || '#fff'); g.beginPath(); D.star(g, x, y, r, r * 0.22, 4, 0); g.fill(); g.restore(); },
  txt(g, s, x, y, o){ o = o || {}; g.save(); g.font = (o.w || 700) + ' ' + (o.size || 16) + 'px ' + (o.font || 'Fredoka'); g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic'; g.fillStyle = M(o.col || '#2B2D42'); g.fillText(s, x, y); g.restore(); }
};
function grip(g, u, len, col, wrap, rw){ const f = c => MR('grip', c);   // handle from y = 0 down to len (wrapped) — always the grip colour role
  D.piece(g, [{path: g => D.rr(g, -3.4 * u, -2 * u, 6.8 * u, len + 2 * u, 3 * u), fill: g => D.lin(g, -3.4 * u, 0, 3.4 * u, 0, [f(D.sh(col, 0.15)), f(col), f(D.sh(col, -0.35))])}], RIM, rw);
  if(wrap){ g.strokeStyle = M(wrap); g.lineWidth = 1.6 * u; for(let y = 2 * u; y < len - u; y += 4.2 * u){ g.beginPath(); g.moveTo(-3.2 * u, y); g.lineTo(3.2 * u, y + 2.6 * u); g.stroke(); } } }
function pommel(g, u, y, r, col, rw, gem){ const f = c => MR('c2', c); D.piece(g, [{path: g => D.ell(g, 0, y, r, r), fill: g => D.rad(g, -r * 0.3, y - r * 0.3, r * 0.1, r, [f(D.sh(col, 0.45)), f(col), f(D.sh(col, -0.4))])}], RIM, rw); if(gem){ g.fillStyle = M(gem); g.beginPath(); D.ell(g, 0, y, r * 0.45, r * 0.45); g.fill(); } }
const knob = pommel;

/* ================= 🖌️ painters (from the Avateer R0a / R0a2 look pack, Test Harness/avateer/src/02_weapons.js + 10_swords.js; 🔮 🍲 🌱 off hands new in av-r0b) ================= */
function sword(g, T, u, rw, t){
  if(T === 0){   // Wooden Sword — short, chunky, rounded tip, stick guard, rope grip
    grip(g, u, 15 * u, '#8A5A2B', '#E8C887', rw);
    D.piece(g, [
      {path: g => { g.moveTo(-5.5 * u, -3 * u); g.lineTo(-5.5 * u, -46 * u); g.quadraticCurveTo(0, -60 * u, 5.5 * u, -46 * u); g.lineTo(5.5 * u, -3 * u); g.closePath(); }, fill: g => D.lin(g, -6 * u, 0, 6 * u, 0, ['#E7B77A', '#D49A5C', '#B07842'])},
      {path: g => D.rr(g, -13 * u, -5 * u, 26 * u, 6 * u, 3 * u), fill: '#9B6635'}], RIM, rw);
    g.strokeStyle = M('rgba(120,70,30,0.45)'); g.lineWidth = 1.1 * u; [[-2, -40], [1.5, -28], [-1, -16]].forEach(p => { g.beginPath(); g.moveTo(p[0] * u, -8 * u); g.quadraticCurveTo(p[0] * u + 2 * u, (p[1] + 8) * u, p[0] * u, p[1] * u); g.stroke(); });
    g.fillStyle = M('#7A4A22'); g.beginPath(); D.ell(g, 1.5 * u, -24 * u, 1.6 * u, 2.4 * u); g.fill();
    pommel(g, u, 16 * u, 4.2 * u, '#9B6635', rw);
  } else if(T === 1){   // Steel Blade — longer, straight, fuller line, bar guard with balls, leather grip, round pommel
    grip(g, u, 17 * u, '#6B3F22', '#3B2414', rw);
    D.piece(g, [
      {path: g => { g.moveTo(-5 * u, -4 * u); g.lineTo(-5 * u, -62 * u); g.lineTo(0, -72 * u); g.lineTo(5 * u, -62 * u); g.lineTo(5 * u, -4 * u); g.closePath(); }, fill: g => D.lin(g, -5 * u, 0, 5 * u, 0, ['#F4F8FC', '#C9D3DE', '#8D9AAB'])},
      {path: g => { D.rr(g, -15 * u, -7 * u, 30 * u, 6 * u, 2.5 * u); }, fill: g => D.lin(g, 0, -7 * u, 0, -1 * u, ['#C9D3DE', '#6F7C8E'])},
      {path: g => { D.ell(g, -16 * u, -4 * u, 3.4 * u, 3.4 * u); }, fill: '#B9C4D2'}, {path: g => { D.ell(g, 16 * u, -4 * u, 3.4 * u, 3.4 * u); }, fill: '#B9C4D2'}], RIM, rw);
    g.strokeStyle = M('rgba(90,105,125,0.7)'); g.lineWidth = 1.4 * u; g.beginPath(); g.moveTo(0, -10 * u); g.lineTo(0, -60 * u); g.stroke();
    g.strokeStyle = M('rgba(255,255,255,0.8)'); g.lineWidth = 1.2 * u; g.beginPath(); g.moveTo(-3 * u, -12 * u); g.lineTo(-3 * u, -58 * u); g.stroke();
    pommel(g, u, 19 * u, 4.6 * u, '#B9C4D2', rw, '#3A8DFF');
  } else if(T === 2){   // Flame Saber — curved wavy flame edge, ember guard curls, glow
    D.glow(g, 0, -40 * u, 40 * u, '#FF7A1A', 0.35);
    grip(g, u, 18 * u, '#3B2414', '#C0392B', rw);
    D.piece(g, [
      {path: g => { g.moveTo(-5 * u, -5 * u); g.bezierCurveTo(-9 * u, -30 * u, -4 * u, -58 * u, 6 * u, -80 * u);
        for(let i = 0; i < 5; i++){ const y0 = -80 + i * 15; g.quadraticCurveTo(14 * u, (y0 + 4) * u, 7 * u, (y0 + 10) * u); g.quadraticCurveTo(12 * u, (y0 + 13) * u, 7 * u, (y0 + 15) * u); }
        g.lineTo(5 * u, -5 * u); g.closePath(); }, fill: g => D.lin(g, 0, -80 * u, 0, 0, ['#FFF3B0', '#FFC23D', '#FF6A1A', '#D63A1A'])},
      {path: g => { g.moveTo(-16 * u, -2 * u); g.bezierCurveTo(-20 * u, -12 * u, -10 * u, -14 * u, -8 * u, -7 * u); g.lineTo(8 * u, -7 * u); g.bezierCurveTo(10 * u, -14 * u, 20 * u, -12 * u, 16 * u, -2 * u); g.closePath(); }, fill: g => D.lin(g, 0, -12 * u, 0, 0, ['#FFB23D', '#C0392B'])}], RIM, rw);
    g.fillStyle = M('rgba(255,255,255,0.55)'); g.beginPath(); g.moveTo(-3 * u, -10 * u); g.bezierCurveTo(-6 * u, -32 * u, -2 * u, -55 * u, 4 * u, -70 * u); g.lineTo(1 * u, -48 * u); g.closePath(); g.fill();
    for(let i = 0; i < 6; i++){ const a = t * 2 + i * 1.7, y = -20 * u - ((t * 30 + i * 13) % 70) * u; g.fillStyle = M(i % 2 ? '#FFD23F' : '#FF7A1A'); g.beginPath(); D.ell(g, 12 * u + Math.sin(a) * 6 * u, y, 1.8 * u, 1.8 * u); g.fill(); }
    pommel(g, u, 20 * u, 4.6 * u, '#C0392B', rw, '#FFD23F');
  } else {   // Dragon Edge — broad, curved, notched spine teeth, dragon-wing guard, dragon-head pommel, gold + teal
    D.glow(g, 0, -48 * u, 54 * u, '#FFC21A', 0.32);
    grip(g, u, 20 * u, '#0F6E6A', '#FFD86B', rw);
    D.piece(g, [
      {path: g => { g.moveTo(-6 * u, -6 * u); g.bezierCurveTo(-12 * u, -40 * u, -10 * u, -76 * u, 4 * u, -98 * u); g.bezierCurveTo(20 * u, -80 * u, 16 * u, -40 * u, 9 * u, -6 * u);
        g.closePath(); }, fill: g => D.lin(g, -10 * u, 0, 16 * u, 0, ['#E8FFF8', '#7FE3D2', '#1FA59A'])},
      // spine teeth (back edge)
      {path: g => { for(let i = 0; i < 5; i++){ const y = -22 - i * 14, x = -9 + (i * 0.6); g.moveTo(x * u, y * u); g.lineTo((x - 7) * u, (y - 4) * u); g.lineTo((x - 0.5) * u, (y - 8) * u); g.closePath(); } }, fill: '#FFC21A'},
      // wing guard
      {path: g => { g.moveTo(0, -6 * u); g.bezierCurveTo(-14 * u, -18 * u, -30 * u, -10 * u, -30 * u, 2 * u); g.lineTo(-24 * u, -2 * u); g.lineTo(-22 * u, 4 * u); g.lineTo(-15 * u, 0); g.lineTo(-12 * u, 5 * u); g.lineTo(0, 0);
        g.lineTo(12 * u, 5 * u); g.lineTo(15 * u, 0); g.lineTo(22 * u, 4 * u); g.lineTo(24 * u, -2 * u); g.lineTo(30 * u, 2 * u); g.bezierCurveTo(30 * u, -10 * u, 14 * u, -18 * u, 0, -6 * u); g.closePath(); }, fill: g => D.lin(g, 0, -16 * u, 0, 5 * u, ['#FFE58A', '#FFC21A', '#C98A00'])}], RIM, rw);
    g.fillStyle = M('rgba(255,255,255,0.6)'); g.beginPath(); g.moveTo(-5 * u, -12 * u); g.bezierCurveTo(-9 * u, -42 * u, -6 * u, -72 * u, 3 * u, -90 * u); g.lineTo(-1 * u, -54 * u); g.closePath(); g.fill();
    // dragon head pommel
    D.piece(g, [{path: g => { g.moveTo(-6 * u, 18 * u); g.quadraticCurveTo(-8 * u, 30 * u, 2 * u, 31 * u); g.lineTo(10 * u, 28 * u); g.lineTo(5 * u, 25 * u); g.lineTo(7 * u, 19 * u); g.closePath(); }, fill: g => D.lin(g, 0, 18 * u, 0, 31 * u, ['#FFE58A', '#C98A00'])},
      {path: g => { g.moveTo(-5 * u, 20 * u); g.lineTo(-11 * u, 15 * u); g.lineTo(-3 * u, 17 * u); g.closePath(); }, fill: '#FFC21A'}], RIM, rw);
    g.fillStyle = M('#E63946'); g.beginPath(); D.ell(g, 0, 24 * u, 1.5 * u, 1.5 * u); g.fill();
    [[-14, -70, 4], [15, -54, 3], [-12, -30, 2.6]].forEach((s, i) => D.sparkle(g, s[0] * u, s[1] * u, s[2] * u * (0.8 + 0.3 * Math.sin(t * 4 + i * 2))));
  }
}
function wand(g, T, u, rw, t){
  if(T === 0){   // Twig Wand — crooked twig, a leaf, a knot
    D.piece(g, [{path: g => { g.moveTo(-2.4 * u, 14 * u); g.quadraticCurveTo(-3 * u, -6 * u, 1 * u, -18 * u); g.quadraticCurveTo(-3 * u, -30 * u, 0, -44 * u); g.lineTo(3 * u, -44 * u); g.quadraticCurveTo(0.5 * u, -30 * u, 4 * u, -18 * u); g.quadraticCurveTo(1 * u, -6 * u, 2.4 * u, 14 * u); g.closePath(); }, fill: g => D.lin(g, -3 * u, 0, 3 * u, 0, ['#B07842', '#7A4A22'])},
      {path: g => { g.moveTo(2 * u, -30 * u); g.quadraticCurveTo(14 * u, -38 * u, 16 * u, -30 * u); g.quadraticCurveTo(10 * u, -24 * u, 2 * u, -30 * u); }, fill: '#6FCB4A'}], RIM, rw);
    g.strokeStyle = M('#3F8E2A'); g.lineWidth = 1 * u; g.beginPath(); g.moveTo(3 * u, -30 * u); g.lineTo(13 * u, -31 * u); g.stroke();
    g.fillStyle = M('#5A3418'); g.beginPath(); D.ell(g, 0, -6 * u, 1.6 * u, 2.2 * u); g.fill();
    D.sparkle(g, 1.5 * u, -48 * u, 4 * u * (0.7 + 0.3 * Math.sin(t * 5)), '#FFF3B0');
  } else if(T === 1){   // Crystal Wand — straight, wrapped, a hex crystal held by claws
    D.glow(g, 0, -56 * u, 18 * u, '#5FE1FF', 0.5);
    D.piece(g, [{path: g => D.rr(g, -3 * u, -42 * u, 6 * u, 60 * u, 3 * u), fill: g => D.lin(g, -3 * u, 0, 3 * u, 0, ['#8A5A2B', '#5A3418'])},
      {path: g => { g.moveTo(-7 * u, -44 * u); g.lineTo(-3 * u, -40 * u); g.lineTo(3 * u, -40 * u); g.lineTo(7 * u, -44 * u); g.lineTo(5 * u, -50 * u); g.lineTo(-5 * u, -50 * u); g.closePath(); }, fill: '#C9A04A'},
      {path: g => { g.moveTo(0, -70 * u); g.lineTo(7 * u, -62 * u); g.lineTo(7 * u, -50 * u); g.lineTo(0, -45 * u); g.lineTo(-7 * u, -50 * u); g.lineTo(-7 * u, -62 * u); g.closePath(); }, fill: g => D.lin(g, -7 * u, -70 * u, 7 * u, -45 * u, ['#E8FDFF', '#5FE1FF', '#1C8FD6'])}], RIM, rw);
    g.fillStyle = M('rgba(255,255,255,0.7)'); g.beginPath(); g.moveTo(-4 * u, -61 * u); g.lineTo(0, -66 * u); g.lineTo(0, -52 * u); g.lineTo(-4 * u, -51 * u); g.closePath(); g.fill();
    g.strokeStyle = M('#E8C887'); g.lineWidth = 1.4 * u; for(let y = -2 * u; y < 14 * u; y += 3.6 * u){ g.beginPath(); g.moveTo(-3 * u, y); g.lineTo(3 * u, y + 2 * u); g.stroke(); }
  } else if(T === 2){   // Storm Rod — longer metal rod, copper coil, a cloud ring with a lightning bolt
    D.glow(g, 0, -74 * u, 26 * u, '#9B7BFF', 0.5);
    D.piece(g, [{path: g => D.rr(g, -3.4 * u, -64 * u, 6.8 * u, 84 * u, 3 * u), fill: g => D.lin(g, -3.4 * u, 0, 3.4 * u, 0, ['#D7DEEA', '#7D8AA0', '#4A5468'])},
      {path: g => { const cx = 0, cy = -76 * u; [[-9, 2, 7], [-3, -4, 8], [5, -2, 8], [10, 3, 6], [0, 5, 8]].forEach(p => { g.moveTo(cx + (p[0] + p[2]) * u, cy + p[1] * u); g.arc(cx + p[0] * u, cy + p[1] * u, p[2] * u, 0, TAU); }); }, fill: g => D.lin(g, 0, -86 * u, 0, -68 * u, ['#E6E0FF', '#9B7BFF', '#5B3FCF'])}], RIM, rw);
    g.strokeStyle = M('#D9822B'); g.lineWidth = 1.8 * u; for(let y = -58 * u; y < -38 * u; y += 3.4 * u){ g.beginPath(); g.ellipse(0, y, 4.6 * u, 1.4 * u, 0, 0, TAU); g.stroke(); }
    D.piece(g, [{path: g => { g.moveTo(2 * u, -84 * u); g.lineTo(-5 * u, -72 * u); g.lineTo(0, -72 * u); g.lineTo(-4 * u, -60 * u); g.lineTo(7 * u, -76 * u); g.lineTo(2 * u, -76 * u); g.lineTo(6 * u, -84 * u); g.closePath(); }, fill: '#FFE14D'}], '#7A5A00', 0.8 * u);
    pommel(g, u, 22 * u, 4 * u, '#7D8AA0', rw, '#9B7BFF');
  } else {   // Star Scepter — gold scepter, crescent moon cradling a big star, orbiting stars, ribbon
    D.glow(g, 0, -86 * u, 34 * u, '#FFC21A', 0.45);
    D.piece(g, [{path: g => D.rr(g, -3.6 * u, -70 * u, 7.2 * u, 92 * u, 3.4 * u), fill: g => D.lin(g, -3.6 * u, 0, 3.6 * u, 0, ['#FFF0B0', '#FFC21A', '#B07800'])},
      {path: g => { g.arc(0, -84 * u, 15 * u, Math.PI * 0.15, Math.PI * 0.85, true); g.arc(0, -90 * u, 13 * u, Math.PI * 0.8, Math.PI * 0.2, false); g.closePath(); }, fill: g => D.lin(g, 0, -100 * u, 0, -70 * u, ['#E9F1FF', '#B9C9F0'])},
      {path: g => D.star(g, 0, -92 * u, 12 * u, 5.4 * u, 5), fill: g => D.rad(g, -2 * u, -95 * u, 1 * u, 13 * u, ['#FFFBE0', '#FFD23F', '#F29E00'])},
      {path: g => { D.ell(g, 0, -68 * u, 7 * u, 4 * u); }, fill: '#FFC21A'}], RIM, rw);
    g.fillStyle = M('#9B5DE5'); g.beginPath(); D.ell(g, 0, -68 * u, 2.6 * u, 2.6 * u); g.fill();
    // ribbon
    g.save(); g.strokeStyle = M('#E63946'); g.lineWidth = 3 * u; g.lineCap = 'round'; g.beginPath(); g.moveTo(3 * u, -62 * u); g.bezierCurveTo(16 * u, -56 * u + Math.sin(t * 3) * 3 * u, 8 * u, -44 * u, 18 * u, -36 * u + Math.sin(t * 3 + 1) * 3 * u); g.stroke(); g.restore();
    for(let i = 0; i < 3; i++){ const a = t * 1.6 + i * TAU / 3; D.sparkle(g, Math.cos(a) * 22 * u, -90 * u + Math.sin(a) * 9 * u, 4 * u, i === 1 ? '#FFE58A' : '#fff'); }
    pommel(g, u, 24 * u, 5 * u, '#FFC21A', rw, '#9B5DE5');
  }
}
function spatula(g, T, u, rw, t){
  if(T === 0){   // Kitchen Spatula — plastic handle, small slotted rectangle head
    D.piece(g, [{path: g => D.rr(g, -2.8 * u, -26 * u, 5.6 * u, 42 * u, 2.8 * u), fill: g => D.lin(g, -3 * u, 0, 3 * u, 0, ['#FF8FB0', '#E63E7A'])},
      {path: g => D.rr(g, -9 * u, -48 * u, 18 * u, 22 * u, 4 * u), fill: g => D.lin(g, -9 * u, 0, 9 * u, 0, ['#F1F4F8', '#C3CBD6'])}], RIM, rw);
    g.fillStyle = M('#7D8AA0'); [-4.5, 0, 4.5].forEach(x => { g.beginPath(); D.rr(g, x * u - 1.1 * u, -45 * u, 2.2 * u, 13 * u, 1.1 * u); g.fill(); });
    g.fillStyle = M('rgba(255,255,255,0.8)'); g.beginPath(); D.ell(g, 0, 10 * u, 1.4 * u, 1.4 * u); g.fill();
  } else if(T === 1){   // Iron Flipper — bigger, angled iron head with round holes, riveted wood handle
    D.piece(g, [{path: g => D.rr(g, -3.4 * u, -30 * u, 6.8 * u, 48 * u, 3 * u), fill: g => D.lin(g, -3 * u, 0, 3 * u, 0, ['#B07842', '#7A4A22'])},
      {path: g => { g.moveTo(-3 * u, -30 * u); g.lineTo(-13 * u, -46 * u); g.lineTo(-14 * u, -66 * u); g.quadraticCurveTo(0, -72 * u, 14 * u, -66 * u); g.lineTo(13 * u, -46 * u); g.lineTo(3 * u, -30 * u); g.closePath(); }, fill: g => D.lin(g, -14 * u, 0, 14 * u, 0, ['#A9B4C2', '#6F7C8E', '#4A5468'])}], RIM, rw);
    g.fillStyle = M('#2B2D42'); [[-6, -58], [0, -60], [6, -58], [-4, -50], [4, -50]].forEach(p => { g.beginPath(); D.ell(g, p[0] * u, p[1] * u, 2 * u, 2 * u); g.fill(); });
    g.fillStyle = M('#D7DEEA'); [-20, -6, 8].forEach(y => { g.beginPath(); D.ell(g, 0, y * u, 1.6 * u, 1.6 * u); g.fill(); });
  } else if(T === 2){   // Sizzle Turner — wide head with flame-shaped glowing slots, red-hot edge, steam
    D.glow(g, 0, -64 * u, 28 * u, '#FF5A1A', 0.45);
    D.piece(g, [{path: g => D.rr(g, -3.6 * u, -34 * u, 7.2 * u, 54 * u, 3 * u), fill: g => D.lin(g, -3 * u, 0, 3 * u, 0, ['#3B2414', '#1E120A'])},
      {path: g => D.rr(g, -6 * u, -40 * u, 12 * u, 8 * u, 3 * u), fill: '#C0392B'},
      {path: g => { g.moveTo(-6 * u, -40 * u); g.lineTo(-19 * u, -58 * u); g.lineTo(-18 * u, -80 * u); g.quadraticCurveTo(0, -88 * u, 18 * u, -80 * u); g.lineTo(19 * u, -58 * u); g.lineTo(6 * u, -40 * u); g.closePath(); }, fill: g => D.lin(g, 0, -86 * u, 0, -40 * u, ['#FF7A2E', '#4A5468', '#2B2D42'])}], RIM, rw);
    [-9, 0, 9].forEach((x, i) => { g.fillStyle = M(D.lin(g, 0, -78 * u, 0, -52 * u, ['#FFF3B0', '#FF9F1C', '#FF4A1A'])); g.beginPath(); g.moveTo(x * u, -78 * u + i % 2 * 3 * u); g.quadraticCurveTo((x + 4) * u, -64 * u, x * u, -52 * u); g.quadraticCurveTo((x - 4) * u, -64 * u, x * u, -78 * u + i % 2 * 3 * u); g.fill(); });
    g.strokeStyle = M('rgba(255,255,255,0.6)'); g.lineWidth = 2 * u; g.lineCap = 'round'; [-10, 4].forEach((x, i) => { const o = Math.sin(t * 3 + i) * 2 * u; g.beginPath(); g.moveTo(x * u, -90 * u); g.bezierCurveTo((x - 5) * u + o, -96 * u, (x + 5) * u - o, -100 * u, x * u, -106 * u); g.stroke(); });
    pommel(g, u, 22 * u, 4 * u, '#C0392B', rw);
  } else {   // Golden Feast Ladle — now a deep gold ladle with glowing soup, chef-hat crest, fork + spoon guard
    D.glow(g, 0, -80 * u, 36 * u, '#FFC21A', 0.4);
    D.piece(g, [{path: g => D.rr(g, -3.4 * u, -62 * u, 6.8 * u, 84 * u, 3.4 * u), fill: g => D.lin(g, -3 * u, 0, 3 * u, 0, ['#FFF0B0', '#FFC21A', '#B07800'])},
      // bowl (seen from the side, open to the front)
      {path: g => { g.moveTo(-22 * u, -78 * u); g.quadraticCurveTo(-22 * u, -56 * u, 0, -56 * u); g.quadraticCurveTo(22 * u, -56 * u, 22 * u, -78 * u); g.closePath(); }, fill: g => D.lin(g, 0, -80 * u, 0, -56 * u, ['#FFE58A', '#FFC21A', '#B07800'])},
      {path: g => D.ell(g, 0, -78 * u, 22 * u, 6 * u), fill: g => D.rad(g, 0, -78 * u, 2 * u, 22 * u, ['#FFF7D6', '#FFB23D', '#E26A1A'])},
      // chef-hat crest on the handle
      {path: g => { D.ell(g, -4 * u, -40 * u, 5 * u, 4.6 * u); D.ell(g, 4 * u, -40 * u, 5 * u, 4.6 * u); D.ell(g, 0, -44 * u, 5.4 * u, 5 * u); D.rr(g, -6 * u, -40 * u, 12 * u, 7 * u, 1.5 * u); }, fill: '#FFFFFF'},
      // plate guard (a gold dinner plate seen from the side)
      {path: g => D.ell(g, 0, -4 * u, 15 * u, 4.4 * u), fill: g => D.lin(g, 0, -8 * u, 0, 0, ['#FFF0B0', '#FFC21A', '#B07800'])}], RIM, rw);
    for(let i = 0; i < 4; i++){ const a = t * 2 + i * 1.5; g.fillStyle = M(i % 2 ? '#FFF3B0' : '#FFD23F'); g.beginPath(); D.ell(g, (-12 + i * 8) * u, (-84 - ((t * 20 + i * 9) % 20)) * u, (1.4 + Math.sin(a) * 0.4) * u, (1.4 + Math.sin(a) * 0.4) * u); g.fill(); }
    g.fillStyle = M('#E63946'); g.beginPath(); D.ell(g, 0, -41 * u, 1.6 * u, 1.6 * u); g.fill();
    pommel(g, u, 24 * u, 5 * u, '#FFC21A', rw, '#E63946');
  }
}
function can(g, T, u, rw, t){
  if(T === 0){   // Little Watering Can — small round tin, carried by its top handle (grip = the handle)
    D.piece(g, [
      {path: g => { g.moveTo(-6 * u, -1 * u); g.quadraticCurveTo(-6 * u, -10 * u, 0, -10 * u); g.quadraticCurveTo(6 * u, -10 * u, 6 * u, -1 * u); g.lineTo(3.4 * u, -1 * u); g.quadraticCurveTo(3.4 * u, -7 * u, 0, -7 * u); g.quadraticCurveTo(-3.4 * u, -7 * u, -3.4 * u, -1 * u); g.closePath(); }, fill: '#2EC4B6'},
      {path: g => { g.moveTo(10 * u, 4 * u); g.lineTo(26 * u, -8 * u); g.lineTo(28 * u, -5 * u); g.lineTo(13 * u, 9 * u); g.closePath(); }, fill: '#2EC4B6'},
      {path: g => D.ell(g, 28 * u, -7 * u, 2.6 * u, 3.6 * u, -0.8), fill: '#1C8F86'},
      {path: g => D.rr(g, -12 * u, -1 * u, 24 * u, 20 * u, 6 * u), fill: g => D.lin(g, -12 * u, 0, 12 * u, 0, ['#7FE8DD', '#2EC4B6', '#1C8F86'])}], RIM, rw);
    g.fillStyle = M('rgba(255,255,255,0.55)'); g.beginPath(); D.rr(g, -9 * u, 2 * u, 4 * u, 12 * u, 2 * u); g.fill();
    g.fillStyle = M('#FFD23F'); g.beginPath(); D.star(g, 2 * u, 9 * u, 4 * u, 1.8 * u, 5); g.fill();
    g.fillStyle = M('#7FD3FF'); [0, 1, 2].forEach(i => { const p = (t * 1.5 + i / 3) % 1; g.globalAlpha = 1 - p; g.beginPath(); D.ell(g, (30 + p * 6) * u, (-4 + p * 18) * u, 1.3 * u, 1.8 * u); g.fill(); }); g.globalAlpha = 1;
  } else if(T === 1){   // Bloom Can — petal-shaped body, a rose sprinkler head, a flower on top
    D.piece(g, [
      {path: g => { g.moveTo(-7 * u, -1 * u); g.quadraticCurveTo(-7 * u, -12 * u, 0, -12 * u); g.quadraticCurveTo(7 * u, -12 * u, 7 * u, -1 * u); g.lineTo(4 * u, -1 * u); g.quadraticCurveTo(4 * u, -9 * u, 0, -9 * u); g.quadraticCurveTo(-4 * u, -9 * u, -4 * u, -1 * u); g.closePath(); }, fill: '#4CC764'},
      {path: g => { g.moveTo(12 * u, 6 * u); g.quadraticCurveTo(26 * u, 0, 32 * u, -12 * u); g.lineTo(35 * u, -9 * u); g.quadraticCurveTo(28 * u, 6 * u, 15 * u, 12 * u); g.closePath(); }, fill: '#4CC764'},
      {path: g => D.ell(g, 35 * u, -12 * u, 5 * u, 5 * u), fill: '#FF8FB0'},
      {path: g => { for(let i = 0; i < 6; i++){ const a = i * TAU / 6; g.moveTo(Math.cos(a) * 15 * u, 10 * u + Math.sin(a) * 13 * u); g.arc(Math.cos(a) * 8 * u, 10 * u + Math.sin(a) * 7 * u, 8 * u, 0, TAU); } }, fill: g => D.rad(g, 0, 10 * u, 2 * u, 16 * u, ['#FFE0EC', '#FF8FB0', '#E63E7A'])}], RIM, rw);
    g.fillStyle = M('#FFD23F'); g.beginPath(); D.ell(g, 0, 10 * u, 5 * u, 5 * u); g.fill();
    g.fillStyle = M('#2B2D42'); [[35, -12], [33, -14], [37, -14], [33, -10], [37, -10]].forEach(p => { g.beginPath(); D.ell(g, p[0] * u, p[1] * u, 0.8 * u, 0.8 * u); g.fill(); });
    D.piece(g, [{path: g => { for(let i = 0; i < 5; i++){ const a = i * TAU / 5 - Math.PI / 2; g.moveTo(Math.cos(a) * 7 * u, -16 * u + Math.sin(a) * 7 * u); g.arc(Math.cos(a) * 4 * u, -16 * u + Math.sin(a) * 4 * u, 3.6 * u, 0, TAU); } }, fill: '#FFF3B0'}], RIM, rw * 0.8);
    g.fillStyle = M('#FF9F1C'); g.beginPath(); D.ell(g, 0, -16 * u, 2.4 * u, 2.4 * u); g.fill();
    g.fillStyle = M('#7FD3FF'); for(let i = 0; i < 5; i++){ const p = (t * 1.4 + i / 5) % 1, a = -0.2 + (i - 2) * 0.22; g.globalAlpha = 1 - p; g.beginPath(); D.ell(g, (38 + Math.cos(a) * p * 14) * u, (-10 + p * 16 + Math.sin(a) * p * 10) * u, 1.2 * u, 1.7 * u); g.fill(); } g.globalAlpha = 1;
  } else if(T === 2){   // Rainbow Sprinkler — now a staff: a spinning sprinkler head that throws a rainbow arc
    D.piece(g, [{path: g => D.rr(g, -3 * u, -62 * u, 6 * u, 84 * u, 3 * u), fill: g => D.lin(g, -3 * u, 0, 3 * u, 0, ['#9BE8FF', '#2CA6DE', '#1C6FA8'])},
      {path: g => D.ell(g, 0, -68 * u, 11 * u, 7 * u), fill: g => D.lin(g, 0, -75 * u, 0, -61 * u, ['#E8FAFF', '#7FD3FF', '#2CA6DE'])},
      {path: g => { const a = t * 6; for(let i = 0; i < 3; i++){ const b = a + i * TAU / 3; g.moveTo(0, -72 * u); g.lineTo(Math.cos(b) * 15 * u, -74 * u + Math.sin(b) * 4 * u); g.lineTo(Math.cos(b + 0.3) * 15 * u, -74 * u + Math.sin(b + 0.3) * 4 * u); g.closePath(); } }, fill: '#FFD23F'}], RIM, rw);
    const cols = ['#FF5A5A', '#FF9F1C', '#FFE14D', '#4CC764', '#2CA6DE', '#9B5DE5'];
    g.save(); g.lineCap = 'round'; cols.forEach((c, i) => { g.strokeStyle = M(D.rgba(c, 0.85)); g.lineWidth = 2.4 * u; g.beginPath(); g.arc(18 * u, -64 * u, (26 - i * 2.6) * u, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); }); g.restore();
    g.fillStyle = M('#7FD3FF'); for(let i = 0; i < 8; i++){ const p = (t + i / 8) % 1, a = Math.PI * (1.05 + 0.9 * p); g.beginPath(); D.ell(g, 18 * u + Math.cos(a) * 30 * u, -64 * u + Math.sin(a) * 30 * u, 1.3 * u, 1.8 * u); g.fill(); }
    pommel(g, u, 23 * u, 4.4 * u, '#2CA6DE', rw, '#FFD23F');
  } else {   // World-Tree Staff — a living staff: roots wrap the grip, a little tree crown with glowing fruit
    D.glow(g, 0, -90 * u, 40 * u, '#9BFF8A', 0.35);
    D.piece(g, [
      {path: g => { g.moveTo(-4 * u, 24 * u); g.bezierCurveTo(-6 * u, 0, -2 * u, -40 * u, -4 * u, -74 * u); g.lineTo(4 * u, -74 * u); g.bezierCurveTo(3 * u, -40 * u, 6 * u, 0, 4 * u, 24 * u); g.closePath(); }, fill: g => D.lin(g, -5 * u, 0, 5 * u, 0, ['#C99257', '#8A5A2B', '#5A3418'])},
      {path: g => { g.moveTo(-2 * u, -70 * u); g.quadraticCurveTo(-14 * u, -78 * u, -18 * u, -88 * u); g.lineTo(-15 * u, -89 * u); g.quadraticCurveTo(-8 * u, -80 * u, 0, -76 * u); g.quadraticCurveTo(8 * u, -82 * u, 14 * u, -92 * u); g.lineTo(17 * u, -90 * u); g.quadraticCurveTo(12 * u, -78 * u, 2 * u, -70 * u); g.closePath(); }, fill: '#8A5A2B'},
      {path: g => { [[-16, -96, 13], [0, -108, 16], [16, -98, 13], [-7, -90, 12], [8, -88, 12]].forEach(p => { g.moveTo((p[0] + p[2]) * u, p[1] * u); g.arc(p[0] * u, p[1] * u, p[2] * u, 0, TAU); }); }, fill: g => D.rad(g, -4 * u, -108 * u, 4 * u, 30 * u, ['#C9FF9A', '#5CC94A', '#2E8A2E'])}], RIM, rw);
    g.strokeStyle = M('#5A3418'); g.lineWidth = 2 * u; g.lineCap = 'round'; [[-1, 1], [1, -1]].forEach((s, i) => { g.beginPath(); g.moveTo(s[0] * 5 * u, 22 * u); for(let y = 22; y > -6; y -= 6){ g.quadraticCurveTo(s[1] * 6 * u, (y - 3) * u, s[0] * 5 * u, (y - 6) * u); } g.stroke(); });
    [[-12, -98], [6, -112], [14, -94], [-2, -92]].forEach((p, i) => { D.glow(g, p[0] * u, p[1] * u, 7 * u, '#FFD23F', 0.6); g.fillStyle = M(i % 2 ? '#FF7A5A' : '#FFD23F'); g.beginPath(); D.ell(g, p[0] * u, p[1] * u, 3 * u, 3 * u); g.fill(); });
    g.fillStyle = M('rgba(255,255,255,0.35)'); g.beginPath(); D.ell(g, -6 * u, -110 * u, 7 * u, 4 * u, -0.4); g.fill();
    for(let i = 0; i < 4; i++){ const p = (t * 0.5 + i / 4) % 1; g.globalAlpha = 1 - p; D.piece(g, [{path: g => D.ell(g, (-20 + i * 13 + Math.sin(t * 2 + i) * 4) * u, (-80 + p * 60) * u, 2.6 * u, 1.4 * u, 0.6), fill: '#6FCB4A'}], RIM, 0); } g.globalAlpha = 1;
  }
}
function shield(g, T, u, rw, t){
  if(T === 0){   // Plank buckler — round wooden planks + rope rim
    D.piece(g, [{path: g => D.ell(g, 0, 0, 30 * u, 30 * u), fill: g => D.rad(g, -8 * u, -8 * u, 3 * u, 32 * u, ['#E7B77A', '#C98A4B', '#8A5A2B'])}], RIM, rw);
    g.strokeStyle = M('rgba(90,50,20,0.5)'); g.lineWidth = 1.4 * u; [-10, 0, 10].forEach(x => { g.beginPath(); g.moveTo(x * u, -28 * u); g.lineTo(x * u, 28 * u); g.stroke(); });
    g.strokeStyle = M('#E8C887'); g.lineWidth = 3 * u; g.beginPath(); g.arc(0, 0, 27 * u, 0, TAU); g.stroke(); knob(g, u, 0, 6 * u, '#9B6635', rw);
  } else if(T === 1){   // Steel kite shield — pointed bottom, a blue band + rivets
    D.piece(g, [{path: g => { g.moveTo(-28 * u, -36 * u); g.quadraticCurveTo(0, -44 * u, 28 * u, -36 * u); g.quadraticCurveTo(30 * u, 10 * u, 0, 44 * u); g.quadraticCurveTo(-30 * u, 10 * u, -28 * u, -36 * u); g.closePath(); }, fill: g => D.lin(g, -28 * u, 0, 28 * u, 0, ['#F4F8FC', '#C9D3DE', '#7D8AA0'])}], RIM, rw);
    g.fillStyle = M('#3A8DFF'); g.beginPath(); g.moveTo(-6 * u, -38 * u); g.lineTo(6 * u, -38 * u); g.lineTo(6 * u, 34 * u); g.lineTo(0, 40 * u); g.lineTo(-6 * u, 34 * u); g.closePath(); g.fill();
    g.fillStyle = M('#5A6476'); [[-20, -30], [20, -30], [-18, 4], [18, 4]].forEach(p => { g.beginPath(); D.ell(g, p[0] * u, p[1] * u, 2.2 * u, 2.2 * u); g.fill(); });
  } else if(T === 2){   // Flame shield — a sun-shaped rim of flames around a red-gold face
    D.glow(g, 0, 0, 52 * u, '#FF7A1A', 0.4);
    D.piece(g, [{path: g => { for(let i = 0; i < 10; i++){ const a = i * TAU / 10 - Math.PI / 2, f = Math.sin(t * 8 + i) * 2; g.moveTo(Math.cos(a - 0.22) * 32 * u, Math.sin(a - 0.22) * 32 * u); g.quadraticCurveTo(Math.cos(a) * (50 + f) * u, Math.sin(a) * (50 + f) * u, Math.cos(a + 0.22) * 32 * u, Math.sin(a + 0.22) * 32 * u); g.closePath(); } }, fill: g => D.rad(g, 0, 0, 20 * u, 52 * u, ['#FF6A1A', '#FFC23D', '#FFF3B0'])},
      {path: g => D.ell(g, 0, 0, 34 * u, 34 * u), fill: g => D.rad(g, -8 * u, -8 * u, 4 * u, 36 * u, ['#FF9A5A', '#D63A1A', '#8A1E10'])}], RIM, rw);
    g.fillStyle = M('#FFD23F'); g.beginPath(); g.moveTo(0, -20 * u); g.bezierCurveTo(14 * u, -6 * u, 10 * u, 14 * u, 0, 20 * u); g.bezierCurveTo(-10 * u, 14 * u, -14 * u, -6 * u, 0, -20 * u); g.fill(); g.fillStyle = M('#FFF3B0'); g.beginPath(); D.ell(g, 0, 6 * u, 5 * u, 8 * u); g.fill();
  } else {   // Dragon guard — a gold-rimmed teal shield shaped like a dragon head with wings
    D.glow(g, 0, 0, 62 * u, '#FFC21A', 0.35);
    D.piece(g, [{path: g => { g.moveTo(-30 * u, -30 * u); g.lineTo(-58 * u, -46 * u); g.lineTo(-44 * u, -18 * u); g.lineTo(-56 * u, -8 * u); g.lineTo(-36 * u, 0); g.closePath(); g.moveTo(30 * u, -30 * u); g.lineTo(58 * u, -46 * u); g.lineTo(44 * u, -18 * u); g.lineTo(56 * u, -8 * u); g.lineTo(36 * u, 0); g.closePath(); }, fill: g => D.lin(g, 0, -46 * u, 0, 0, ['#FFE58A', '#FFC21A', '#C98A00'])},
      {path: g => { g.moveTo(-34 * u, -40 * u); g.quadraticCurveTo(0, -52 * u, 34 * u, -40 * u); g.quadraticCurveTo(38 * u, 14 * u, 0, 50 * u); g.quadraticCurveTo(-38 * u, 14 * u, -34 * u, -40 * u); g.closePath(); }, fill: g => D.lin(g, -34 * u, 0, 34 * u, 0, ['#E8FFF8', '#5FD3C2', '#1F8A80'])}], RIM, rw);
    g.strokeStyle = M('#FFC21A'); g.lineWidth = 3.4 * u; g.beginPath(); g.moveTo(-30 * u, -36 * u); g.quadraticCurveTo(0, -46 * u, 30 * u, -36 * u); g.quadraticCurveTo(33 * u, 10 * u, 0, 44 * u); g.quadraticCurveTo(-33 * u, 10 * u, -30 * u, -36 * u); g.stroke();
    // dragon face: horns, eyes, snout
    g.fillStyle = M('#FFC21A'); [[-1], [1]].forEach(s => { g.beginPath(); g.moveTo(s * 12 * u, -30 * u); g.lineTo(s * 22 * u, -50 * u); g.lineTo(s * 18 * u, -28 * u); g.fill(); });
    g.fillStyle = M('#E63946'); [-11, 11].forEach(x => { g.beginPath(); g.moveTo(x * u - 6 * u, -10 * u); g.lineTo(x * u + 6 * u, -14 * u); g.lineTo(x * u + 2 * u, -6 * u); g.closePath(); g.fill(); });
    g.fillStyle = M('#156E66'); g.beginPath(); D.ell(g, 0, 18 * u, 12 * u, 9 * u); g.fill(); g.fillStyle = M('#E8FFF8'); [-5, 5].forEach(x => { g.beginPath(); D.ell(g, x * u, 16 * u, 2 * u, 2.6 * u); g.fill(); });
    [[-40, -54], [44, 30], [-30, 40]].forEach((p, i) => D.sparkle(g, p[0] * u, p[1] * u, 4 * u * (0.8 + 0.3 * Math.sin(t * 4 + i))));
  }
}
function great(g, T, u, rw, t){
  if(T === 0){   // Log Blade — a big carved plank, nails, a rope-wrapped long grip
    grip(g, u, 30 * u, '#8A5A2B', '#E8C887', rw);
    D.piece(g, [{path: g => { g.moveTo(-9 * u, -4 * u); g.lineTo(-10 * u, -70 * u); g.lineTo(0, -84 * u); g.lineTo(10 * u, -70 * u); g.lineTo(9 * u, -4 * u); g.closePath(); }, fill: g => D.lin(g, -10 * u, 0, 10 * u, 0, ['#E7B77A', '#C98A4B', '#9A6A3A'])},
      {path: g => D.rr(g, -18 * u, -8 * u, 36 * u, 8 * u, 3 * u), fill: '#8A5A2B'}], RIM, rw);
    g.strokeStyle = M('rgba(120,70,30,0.45)'); g.lineWidth = 1.2 * u; [-4, 3].forEach(x => { g.beginPath(); g.moveTo(x * u, -10 * u); g.quadraticCurveTo(x * u + 3 * u, -40 * u, x * u, -70 * u); g.stroke(); });
    g.fillStyle = M('#7D8AA0'); [[-5, -50], [5, -30], [-4, -18]].forEach(p => { g.beginPath(); D.ell(g, p[0] * u, p[1] * u, 1.6 * u, 1.6 * u); g.fill(); });
    knob(g, u, 32 * u, 5 * u, '#9B6635', rw);
  } else if(T === 1){   // Iron Claymore — long double-edged steel, swept guard, a ricasso
    grip(g, u, 32 * u, '#5A3418', '#2B1D14', rw);
    D.piece(g, [{path: g => { g.moveTo(-8 * u, -6 * u); g.lineTo(-8 * u, -96 * u); g.lineTo(0, -112 * u); g.lineTo(8 * u, -96 * u); g.lineTo(8 * u, -6 * u); g.closePath(); }, fill: g => D.lin(g, -8 * u, 0, 8 * u, 0, ['#F4F8FC', '#C9D3DE', '#7D8AA0'])},
      {path: g => { g.moveTo(-26 * u, 4 * u); g.quadraticCurveTo(-22 * u, -10 * u, -6 * u, -8 * u); g.lineTo(6 * u, -8 * u); g.quadraticCurveTo(22 * u, -10 * u, 26 * u, 4 * u); g.lineTo(20 * u, 0); g.quadraticCurveTo(10 * u, -2 * u, 6 * u, -2 * u); g.lineTo(-6 * u, -2 * u); g.quadraticCurveTo(-10 * u, -2 * u, -20 * u, 0); g.closePath(); }, fill: '#9AA6B4'}], RIM, rw);
    g.strokeStyle = M('rgba(80,95,115,0.7)'); g.lineWidth = 1.6 * u; g.beginPath(); g.moveTo(0, -18 * u); g.lineTo(0, -96 * u); g.stroke();
    g.fillStyle = M('#6B3F22'); g.fillRect(-8 * u, -18 * u, 16 * u, 8 * u); knob(g, u, 35 * u, 6 * u, '#9AA6B4', rw, '#3A8DFF');
  } else if(T === 2){   // Volcano Cleaver — a wide chopping blade with lava cracks + a molten edge
    D.glow(g, 6 * u, -60 * u, 60 * u, '#FF5A1A', 0.35); grip(g, u, 32 * u, '#2B1D14', '#C0392B', rw);
    D.piece(g, [{path: g => { g.moveTo(-8 * u, -6 * u); g.lineTo(-10 * u, -106 * u); g.quadraticCurveTo(10 * u, -118 * u, 30 * u, -100 * u); g.lineTo(26 * u, -60 * u); g.quadraticCurveTo(14 * u, -30 * u, 10 * u, -6 * u); g.closePath(); }, fill: g => D.lin(g, -10 * u, 0, 30 * u, 0, ['#4A2A22', '#2E1812', '#1E0E08'])},
      {path: g => D.rr(g, -16 * u, -10 * u, 32 * u, 8 * u, 3 * u), fill: '#5A3A2A'}], RIM, rw);
    g.strokeStyle = M(D.lin(g, 0, -110 * u, 0, -10 * u, ['#FFF3B0', '#FF9F1C', '#FF4A1A'])); g.lineWidth = 3.4 * u; g.lineCap = 'round'; g.beginPath(); g.moveTo(30 * u, -100 * u); g.lineTo(26 * u, -60 * u); g.quadraticCurveTo(14 * u, -30 * u, 10 * u, -8 * u); g.stroke();
    g.lineWidth = 2 * u; [[-2, -90, 10, -76, 2, -64], [4, -50, -4, -38, 6, -26], [14, -84, 8, -70]].forEach(c => { g.beginPath(); g.moveTo(c[0] * u, c[1] * u); for(let i = 2; i < c.length; i += 2) g.lineTo(c[i] * u, c[i + 1] * u); g.stroke(); });
    for(let i = 0; i < 5; i++){ const y = -20 * u - ((t * 40 + i * 19) % 90) * u; g.fillStyle = M(i % 2 ? '#FFD23F' : '#FF7A1A'); g.beginPath(); D.ell(g, (30 + Math.sin(t * 3 + i) * 5) * u, y, 1.8 * u, 1.8 * u); g.fill(); }
    knob(g, u, 35 * u, 6 * u, '#C0392B', rw, '#FFD23F');
  } else {   // Titan Cleaver — a giant crescent blade with stone runes, gold wings, a sun gem
    D.glow(g, 0, -70 * u, 70 * u, '#FFC21A', 0.32); grip(g, u, 34 * u, '#0F6E6A', '#FFD86B', rw);
    D.piece(g, [{path: g => { g.moveTo(-10 * u, -8 * u); g.bezierCurveTo(-34 * u, -40 * u, -34 * u, -100 * u, 0, -130 * u); g.bezierCurveTo(14 * u, -112 * u, 30 * u, -96 * u, 38 * u, -70 * u); g.bezierCurveTo(26 * u, -60 * u, 18 * u, -34 * u, 12 * u, -8 * u); g.closePath(); }, fill: g => D.lin(g, -30 * u, 0, 38 * u, 0, ['#E8FFF8', '#9FE3D8', '#4AB8AA', '#1F8A80'])},
      {path: g => { g.moveTo(0, -6 * u); g.bezierCurveTo(-18 * u, -20 * u, -40 * u, -10 * u, -42 * u, 6 * u); g.lineTo(-30 * u, 2 * u); g.lineTo(-26 * u, 10 * u); g.lineTo(-14 * u, 2 * u); g.lineTo(0, 4 * u); g.lineTo(14 * u, 2 * u); g.lineTo(26 * u, 10 * u); g.lineTo(30 * u, 2 * u); g.lineTo(42 * u, 6 * u); g.bezierCurveTo(40 * u, -10 * u, 18 * u, -20 * u, 0, -6 * u); g.closePath(); }, fill: g => D.lin(g, 0, -18 * u, 0, 10 * u, ['#FFE58A', '#FFC21A', '#C98A00'])}], RIM, rw);
    g.fillStyle = M('rgba(31,110,102,0.55)'); [['ᚱ', -12, -50], ['ᛟ', -6, -80], ['ᚦ', 2, -104]].forEach(r => D.txt(g, r[0], r[1] * u, r[2] * u, {size: 12 * u, align: 'center', col: 'rgba(15,90,84,0.6)', font: 'serif'}));
    g.fillStyle = M('rgba(255,255,255,0.6)'); g.beginPath(); g.moveTo(-6 * u, -16 * u); g.bezierCurveTo(-24 * u, -46 * u, -24 * u, -96 * u, -2 * u, -120 * u); g.lineTo(-10 * u, -70 * u); g.closePath(); g.fill();
    D.glow(g, 0, -2 * u, 10 * u, '#E63946', 0.7); g.fillStyle = M('#E63946'); g.beginPath(); D.star(g, 0, -2 * u, 5 * u, 2.4 * u, 8, 0); g.fill();
    [[-30, -110, 4.4], [34, -90, 3.4], [-24, -40, 3]].forEach((s, i) => D.sparkle(g, s[0] * u, s[1] * u, s[2] * u * (0.8 + 0.3 * Math.sin(t * 4 + i * 2))));
    knob(g, u, 37 * u, 6.4 * u, '#FFC21A', rw, '#E63946');
  }
}
function twinOne(g, T, u, rw, t){
  if(T === 0){ grip(g, u, 11 * u, '#8A5A2B', '#E8C887', rw); D.piece(g, [{path: g => { g.moveTo(-3.4 * u, -2 * u); g.lineTo(-3.4 * u, -38 * u); g.quadraticCurveTo(0, -46 * u, 3.4 * u, -38 * u); g.lineTo(3.4 * u, -2 * u); g.closePath(); }, fill: g => D.lin(g, -4 * u, 0, 4 * u, 0, ['#E7B77A', '#B07842'])}, {path: g => D.rr(g, -7 * u, -4 * u, 14 * u, 4 * u, 2 * u), fill: '#9B6635'}], RIM, rw); }
  else if(T === 1){ grip(g, u, 12 * u, '#5A3418', '#2B1D14', rw); D.piece(g, [{path: g => { g.moveTo(-4 * u, -3 * u); g.lineTo(-4 * u, -46 * u); g.lineTo(0, -56 * u); g.lineTo(4 * u, -46 * u); g.lineTo(4 * u, -3 * u); g.closePath(); }, fill: g => D.lin(g, -4 * u, 0, 4 * u, 0, ['#F4F8FC', '#C9D3DE', '#7D8AA0'])}, {path: g => { g.moveTo(-9 * u, -1 * u); g.lineTo(-5 * u, -7 * u); g.lineTo(5 * u, -7 * u); g.lineTo(9 * u, -1 * u); g.closePath(); }, fill: '#9AA6B4'}], RIM, rw); }
  else if(T === 2){ D.glow(g, 0, -30 * u, 26 * u, '#B07CFF', 0.4); grip(g, u, 12 * u, '#2B1D44', '#9B5DE5', rw);   // Twin Fangs — curved purple fang blades
    D.piece(g, [{path: g => { g.moveTo(-4 * u, -3 * u); g.bezierCurveTo(-8 * u, -24 * u, -2 * u, -48 * u, 10 * u, -62 * u); g.bezierCurveTo(6 * u, -44 * u, 8 * u, -22 * u, 5 * u, -3 * u); g.closePath(); }, fill: g => D.lin(g, -6 * u, 0, 10 * u, 0, ['#F3E8FF', '#B07CFF', '#5B3FCF'])},
      {path: g => { g.moveTo(-8 * u, 0); g.quadraticCurveTo(-12 * u, -10 * u, -4 * u, -8 * u); g.lineTo(6 * u, -8 * u); g.quadraticCurveTo(12 * u, -10 * u, 8 * u, 0); g.closePath(); }, fill: '#2B1D44'}], RIM, rw); }
  else { D.glow(g, 0, -36 * u, 34 * u, '#FF8FB0', 0.45); grip(g, u, 13 * u, '#B5172A', '#FFD86B', rw);   // Petal Storm — petal-shaped blades + a blossom guard
    D.piece(g, [{path: g => { g.moveTo(-5 * u, -6 * u); g.bezierCurveTo(-16 * u, -30 * u, -6 * u, -60 * u, 2 * u, -72 * u); g.bezierCurveTo(12 * u, -58 * u, 14 * u, -28 * u, 5 * u, -6 * u); g.closePath(); }, fill: g => D.lin(g, 0, -72 * u, 0, -6 * u, ['#FFFFFF', '#FFC2D8', '#FF6FA0'])},
      {path: g => { for(let i = 0; i < 5; i++){ const a = i * TAU / 5 - Math.PI / 2; g.moveTo(Math.cos(a) * 11 * u, -4 * u + Math.sin(a) * 6 * u); g.arc(Math.cos(a) * 6 * u, -4 * u + Math.sin(a) * 3.6 * u, 5 * u, 0, TAU); } }, fill: '#FFD23F'}], RIM, rw);
    g.strokeStyle = M('rgba(255,255,255,0.75)'); g.lineWidth = 1.4 * u; g.beginPath(); g.moveTo(0, -12 * u); g.quadraticCurveTo(-4 * u, -40 * u, 2 * u, -64 * u); g.stroke(); }
}
/* ---------------- 🔮 Orb (Mage off-hand) — floats over the open palm, origin = the hand ---------------- */
function orb(g, T, u, rw, t){
  const bob = Math.sin(t * 2.4) * 2 * u;
  if(T === 0){   // Glass Marble — a small clear marble on a wooden cup
    D.piece(g, [{path: g => { g.moveTo(-9 * u, -2 * u); g.quadraticCurveTo(0, 8 * u, 9 * u, -2 * u); g.lineTo(6 * u, -6 * u); g.lineTo(-6 * u, -6 * u); g.closePath(); }, fill: g => D.lin(g, 0, -6 * u, 0, 6 * u, ['#C98A4B', '#8A5A2B'])},
      {path: g => D.ell(g, 0, -18 * u + bob, 13 * u, 13 * u), fill: g => D.rad(g, -4 * u, -22 * u + bob, 2 * u, 14 * u, ['#FFFFFF', '#A8E6FF', '#3FA9E0'])}], RIM, rw);
    g.fillStyle = M('rgba(255,255,255,0.8)'); g.beginPath(); D.ell(g, -5 * u, -23 * u + bob, 3.4 * u, 2.2 * u, -0.5); g.fill();
    g.strokeStyle = M('rgba(255,255,255,0.55)'); g.lineWidth = 1.4 * u; g.beginPath(); g.arc(0, -18 * u + bob, 8 * u, 0.3, 1.4); g.stroke();
  } else if(T === 1){   // Crystal Orb — a bigger crystal ball held by 3 gold claws
    D.glow(g, 0, -24 * u + bob, 26 * u, '#7B8BFF', 0.45);
    D.piece(g, [{path: g => { [-1, 0, 1].forEach(s => { g.moveTo(s * 4 * u, 0); g.quadraticCurveTo(s * 18 * u - (s ? 0 : 2 * u), -6 * u, s * 15 * u, -18 * u); g.lineTo(s * 12 * u + (s ? 0 : 2 * u), -16 * u); g.quadraticCurveTo(s * 12 * u, -6 * u, s * 2 * u, 2 * u); g.closePath(); }); }, fill: '#C9A04A'},
      {path: g => D.ell(g, 0, -26 * u + bob, 17 * u, 17 * u), fill: g => D.rad(g, -6 * u, -32 * u + bob, 2 * u, 18 * u, ['#F2F0FF', '#9FA8FF', '#4B4FD6'])}], RIM, rw);
    g.fillStyle = M('rgba(255,255,255,0.75)'); g.beginPath(); D.ell(g, -7 * u, -33 * u + bob, 4.6 * u, 2.8 * u, -0.5); g.fill();
    D.sparkle(g, 9 * u, -36 * u + bob, 3.6 * u * (0.7 + 0.3 * Math.sin(t * 5)), '#FFFFFF');
  } else if(T === 2){   // Storm Orb — dark glass with lightning inside + a copper ring around it
    D.glow(g, 0, -30 * u + bob, 34 * u, '#9B7BFF', 0.5);
    D.piece(g, [{path: g => D.rr(g, -8 * u, -6 * u, 16 * u, 8 * u, 3 * u), fill: '#7D8AA0'},
      {path: g => D.ell(g, 0, -30 * u + bob, 20 * u, 20 * u), fill: g => D.rad(g, -6 * u, -36 * u + bob, 2 * u, 21 * u, ['#C9B8FF', '#6A4BD6', '#2B1D6A'])}], RIM, rw);
    D.piece(g, [{path: g => { const y = -30 * u + bob, f = Math.floor(t * 8) % 2 ? 1 : -1; g.moveTo(-2 * u, y - 14 * u); g.lineTo(-7 * u * f, y - 2 * u); g.lineTo(-1 * u, y - 2 * u); g.lineTo(-5 * u * f, y + 12 * u); g.lineTo(6 * u * f, y - 4 * u); g.lineTo(1 * u, y - 4 * u); g.lineTo(5 * u * f, y - 14 * u); g.closePath(); }, fill: '#FFE14D'}], '#7A5A00', 0.8 * u);
    g.strokeStyle = M('#D9822B'); g.lineWidth = 2.4 * u; g.beginPath(); g.ellipse(0, -30 * u + bob, 27 * u, 7 * u, -0.3 + Math.sin(t) * 0.1, 0, TAU); g.stroke();
    g.fillStyle = M('rgba(255,255,255,0.6)'); g.beginPath(); D.ell(g, -8 * u, -40 * u + bob, 5 * u, 3 * u, -0.5); g.fill();
  } else {   // Star Orb — a little galaxy in a golden crescent cradle, two moons orbit it
    D.glow(g, 0, -34 * u + bob, 42 * u, '#FFC21A', 0.42);
    D.piece(g, [{path: g => { g.arc(0, -30 * u, 22 * u, Math.PI * 0.1, Math.PI * 0.9, false); g.arc(0, -36 * u, 22 * u, Math.PI * 0.85, Math.PI * 0.15, true); g.closePath(); }, fill: g => D.lin(g, 0, -14 * u, 0, -2 * u, ['#FFE58A', '#FFC21A', '#B07800'])},
      {path: g => D.ell(g, 0, -36 * u + bob, 21 * u, 21 * u), fill: g => D.rad(g, -5 * u, -42 * u + bob, 2 * u, 22 * u, ['#E9D8FF', '#7A4BD6', '#1B1046'])}], RIM, rw);
    for(let i = 0; i < 9; i++){ const a = i * 2.39, r = (4 + (i * 7) % 14) * u; D.sparkle(g, Math.cos(a) * r, -36 * u + bob + Math.sin(a) * r, (1.4 + (i % 3) * 0.6) * u * (0.8 + 0.3 * Math.sin(t * 4 + i)), i % 3 ? '#FFFFFF' : '#FFE58A'); }
    [0, Math.PI].forEach((p, i) => { const a = t * 1.6 + p; g.fillStyle = M(i ? '#E9F1FF' : '#FFE58A'); g.beginPath(); D.ell(g, Math.cos(a) * 30 * u, -36 * u + bob + Math.sin(a) * 8 * u, 4 * u, 4 * u); g.fill(); });
  }
}

/* ---------------- 🍲 Pot-lid shield (Chef off-hand) — centred on the hand ---------------- */
function lid(g, T, u, rw, t){
  if(T === 0){   // Tin Pot-lid — a small round lid with a knob
    D.piece(g, [{path: g => D.ell(g, 0, 0, 26 * u, 26 * u), fill: g => D.rad(g, -8 * u, -8 * u, 3 * u, 28 * u, ['#FFFFFF', '#C9D3DE', '#8D9AAB'])},
      {path: g => D.ell(g, 0, 0, 7 * u, 7 * u), fill: '#5A6476'}], RIM, rw);
    g.strokeStyle = M('rgba(90,100,118,0.55)'); g.lineWidth = 2 * u; g.beginPath(); g.arc(0, 0, 21 * u, 0, TAU); g.stroke();
    g.fillStyle = M('rgba(255,255,255,0.7)'); g.beginPath(); D.ell(g, -10 * u, -10 * u, 5 * u, 3 * u, -0.7); g.fill();
  } else if(T === 1){   // Iron Pot-lid — bigger, darker, rivets, a steam hole + wooden knob
    D.piece(g, [{path: g => D.ell(g, 0, 0, 31 * u, 31 * u), fill: g => D.rad(g, -9 * u, -9 * u, 3 * u, 33 * u, ['#A9B4C2', '#6F7C8E', '#3E4656'])},
      {path: g => D.ell(g, 0, 0, 8 * u, 8 * u), fill: g => D.rad(g, -2 * u, -2 * u, 1 * u, 8 * u, ['#E7B77A', '#8A5A2B'])}], RIM, rw);
    g.strokeStyle = M('#4A5468'); g.lineWidth = 3 * u; g.beginPath(); g.arc(0, 0, 25 * u, 0, TAU); g.stroke();
    g.fillStyle = M('#D7DEEA'); for(let i = 0; i < 8; i++){ const a = i * TAU / 8; g.beginPath(); D.ell(g, Math.cos(a) * 28 * u, Math.sin(a) * 28 * u, 1.6 * u, 1.6 * u); g.fill(); }
    g.fillStyle = M('#2B2D42'); g.beginPath(); D.ell(g, 14 * u, -12 * u, 2.4 * u, 2.4 * u); g.fill();
    g.strokeStyle = M('rgba(255,255,255,0.55)'); g.lineWidth = 1.6 * u; g.lineCap = 'round'; const o = Math.sin(t * 3) * 2 * u; g.beginPath(); g.moveTo(14 * u, -16 * u); g.bezierCurveTo(10 * u + o, -24 * u, 18 * u - o, -28 * u, 14 * u, -36 * u); g.stroke();
  } else if(T === 2){   // Sizzle Pan — a black pan with a red-hot rim, flames lick the edge
    D.glow(g, 0, 0, 46 * u, '#FF5A1A', 0.42);
    D.piece(g, [{path: g => { for(let i = 0; i < 12; i++){ const a = i * TAU / 12, f = Math.sin(t * 9 + i) * 2.2; g.moveTo(Math.cos(a - 0.2) * 33 * u, Math.sin(a - 0.2) * 33 * u); g.quadraticCurveTo(Math.cos(a) * (44 + f) * u, Math.sin(a) * (44 + f) * u, Math.cos(a + 0.2) * 33 * u, Math.sin(a + 0.2) * 33 * u); g.closePath(); } }, fill: g => D.rad(g, 0, 0, 30 * u, 46 * u, ['#FFF3B0', '#FF9F1C', '#FF4A1A'])},
      {path: g => D.ell(g, 0, 0, 34 * u, 34 * u), fill: g => D.rad(g, -10 * u, -10 * u, 3 * u, 36 * u, ['#5A6476', '#2B2D42', '#15161F'])}], RIM, rw);
    g.strokeStyle = M('#FF6A1A'); g.lineWidth = 3 * u; g.beginPath(); g.arc(0, 0, 30 * u, 0, TAU); g.stroke();
    g.fillStyle = M('#FFD23F'); g.beginPath(); D.ell(g, 0, 0, 8 * u, 6 * u); g.fill(); g.fillStyle = M('#FFFFFF'); g.beginPath(); D.ell(g, 0, 0, 13 * u, 9 * u); g.globalAlpha = 0.25; g.fill(); g.globalAlpha = 1;
    g.fillStyle = M('#FF9F1C'); g.beginPath(); D.ell(g, 0, 0, 5 * u, 4 * u); g.fill();
  } else {   // Golden Cloche — a shining serving dome with a chef-hat knob
    D.glow(g, 0, -6 * u, 50 * u, '#FFC21A', 0.4);
    D.piece(g, [{path: g => D.ell(g, 0, 18 * u, 40 * u, 9 * u), fill: g => D.lin(g, 0, 10 * u, 0, 26 * u, ['#FFF0B0', '#FFC21A', '#B07800'])},
      {path: g => { g.moveTo(-34 * u, 16 * u); g.bezierCurveTo(-34 * u, -24 * u, 34 * u, -24 * u, 34 * u, 16 * u); g.closePath(); }, fill: g => D.lin(g, -34 * u, 0, 34 * u, 0, ['#FFF7D6', '#FFC21A', '#C98A00'])},
      {path: g => { D.ell(g, -4 * u, -24 * u, 5 * u, 4.6 * u); D.ell(g, 4 * u, -24 * u, 5 * u, 4.6 * u); D.ell(g, 0, -28 * u, 5.4 * u, 5 * u); D.rr(g, -6 * u, -24 * u, 12 * u, 7 * u, 1.5 * u); }, fill: '#FFFFFF'}], RIM, rw);
    g.fillStyle = M('rgba(255,255,255,0.65)'); g.beginPath(); g.moveTo(-22 * u, 8 * u); g.bezierCurveTo(-24 * u, -8 * u, -12 * u, -16 * u, -2 * u, -17 * u); g.bezierCurveTo(-14 * u, -10 * u, -18 * u, 0, -16 * u, 9 * u); g.closePath(); g.fill();
    g.fillStyle = M('#E63946'); g.beginPath(); D.ell(g, 0, -20 * u, 1.8 * u, 1.8 * u); g.fill();
    [[-30, -22, 4], [34, -10, 3.2], [24, -30, 2.6]].forEach((s, i) => D.sparkle(g, s[0] * u, s[1] * u, s[2] * u * (0.8 + 0.3 * Math.sin(t * 4 + i * 2))));
  }
}

/* ---------------- 🌱 Seed pouch (Gardener off-hand) — hangs from the hand ---------------- */
function pouch(g, T, u, rw, t){
  const sw = Math.sin(t * 2) * 0.08; g.save(); g.rotate(sw);
  if(T === 0){   // Seed Pouch — a small burlap bag on a string
    g.strokeStyle = M('#8A5A2B'); g.lineWidth = 1.6 * u; g.beginPath(); g.moveTo(0, -2 * u); g.lineTo(0, 8 * u); g.stroke();
    D.piece(g, [{path: g => { g.moveTo(-6 * u, 8 * u); g.quadraticCurveTo(-16 * u, 16 * u, -14 * u, 28 * u); g.quadraticCurveTo(0, 36 * u, 14 * u, 28 * u); g.quadraticCurveTo(16 * u, 16 * u, 6 * u, 8 * u); g.closePath(); }, fill: g => D.lin(g, -14 * u, 0, 14 * u, 0, ['#E8C887', '#C9A46A', '#9C7C48'])},
      {path: g => D.rr(g, -7 * u, 6 * u, 14 * u, 4 * u, 2 * u), fill: '#8A5A2B'}], RIM, rw);
    g.fillStyle = M('#7A4A22'); [[-5, 20], [3, 24], [6, 17], [-2, 28]].forEach(p => { g.beginPath(); D.ell(g, p[0] * u, p[1] * u, 1.4 * u, 2 * u, 0.4); g.fill(); });
  } else if(T === 1){   // Bloom Bag — a green cloth bag with a flower patch + a sprout peeking out
    D.piece(g, [{path: g => { g.moveTo(-3 * u, 4 * u); g.quadraticCurveTo(-6 * u, -6 * u, 0, -12 * u); g.quadraticCurveTo(10 * u, -16 * u, 12 * u, -8 * u); g.quadraticCurveTo(4 * u, -8 * u, 2 * u, 4 * u); g.closePath(); }, fill: '#6FCB4A'},
      {path: g => { g.moveTo(-8 * u, 6 * u); g.quadraticCurveTo(-20 * u, 16 * u, -17 * u, 32 * u); g.quadraticCurveTo(0, 42 * u, 17 * u, 32 * u); g.quadraticCurveTo(20 * u, 16 * u, 8 * u, 6 * u); g.closePath(); }, fill: g => D.lin(g, -18 * u, 0, 18 * u, 0, ['#9BE07A', '#4CC764', '#2E8A3E'])},
      {path: g => D.rr(g, -9 * u, 3 * u, 18 * u, 5 * u, 2.4 * u), fill: '#FFD23F'}], RIM, rw);
    D.piece(g, [{path: g => { for(let i = 0; i < 5; i++){ const a = i * TAU / 5 - Math.PI / 2; g.moveTo(Math.cos(a) * 9 * u, 22 * u + Math.sin(a) * 9 * u); g.arc(Math.cos(a) * 5 * u, 22 * u + Math.sin(a) * 5 * u, 4.4 * u, 0, TAU); } }, fill: '#FF8FB0'}], RIM, rw * 0.7);
    g.fillStyle = M('#FFD23F'); g.beginPath(); D.ell(g, 0, 22 * u, 3 * u, 3 * u); g.fill();
  } else if(T === 2){   // Rainbow Seed Jar — a glass jar of rainbow seeds on a rope handle
    g.strokeStyle = M('#C9A46A'); g.lineWidth = 2 * u; g.beginPath(); g.moveTo(-10 * u, 10 * u); g.quadraticCurveTo(0, -6 * u, 10 * u, 10 * u); g.stroke();
    D.piece(g, [{path: g => D.rr(g, -15 * u, 12 * u, 30 * u, 34 * u, 8 * u), fill: 'rgba(220,245,255,0.55)'}, {path: g => D.rr(g, -12 * u, 6 * u, 24 * u, 8 * u, 3 * u), fill: '#C98A4B'}], RIM, rw);
    const cols = ['#9B5DE5', '#2CA6DE', '#4CC764', '#FFE14D', '#FF9F1C', '#FF5A5A'];
    g.save(); g.beginPath(); D.rr(g, -13 * u, 14 * u, 26 * u, 30 * u, 7 * u); g.clip(); cols.forEach((c, i) => { g.fillStyle = M(c); g.beginPath(); g.moveTo(-14 * u, (44 - i * 4.4) * u); for(let x = -14; x <= 14; x += 4) g.lineTo(x * u, (44 - i * 4.4 - 4.4 + Math.sin(x + i) * 1.2) * u); g.lineTo(14 * u, 46 * u); g.lineTo(-14 * u, 46 * u); g.closePath(); g.fill(); }); g.restore();
    g.fillStyle = M('rgba(255,255,255,0.7)'); g.beginPath(); D.rr(g, -11 * u, 16 * u, 4 * u, 24 * u, 2 * u); g.fill();
    D.sparkle(g, 10 * u, 18 * u, 3 * u * (0.7 + 0.3 * Math.sin(t * 5)), '#FFFFFF');
  } else {   // World-Seed Lantern — a vine cage with a glowing golden seed, leaves on top
    D.glow(g, 0, 26 * u, 34 * u, '#FFD23F', 0.55);
    D.piece(g, [{path: g => { g.moveTo(-4 * u, -2 * u); g.lineTo(4 * u, -2 * u); g.lineTo(3 * u, 6 * u); g.lineTo(-3 * u, 6 * u); g.closePath(); }, fill: '#8A5A2B'},
      {path: g => { g.moveTo(-2 * u, 4 * u); g.quadraticCurveTo(-18 * u, -2 * u, -20 * u, 6 * u); g.quadraticCurveTo(-10 * u, 10 * u, -2 * u, 6 * u); g.moveTo(2 * u, 4 * u); g.quadraticCurveTo(18 * u, -2 * u, 20 * u, 6 * u); g.quadraticCurveTo(10 * u, 10 * u, 2 * u, 6 * u); }, fill: '#5CC94A'}], RIM, rw);
    D.glow(g, 0, 28 * u, 16 * u, '#FFFBE0', 0.8);
    D.piece(g, [{path: g => D.ell(g, 0, 28 * u + Math.sin(t * 3) * 1.4 * u, 8 * u, 10 * u), fill: g => D.rad(g, -2 * u, 24 * u, 1 * u, 10 * u, ['#FFFBE0', '#FFD23F', '#F29E00'])}], RIM, rw * 0.8);
    g.strokeStyle = M('#2E8A2E'); g.lineWidth = 2.6 * u; g.lineCap = 'round'; [-1, -0.35, 0.35, 1].forEach(s => { g.beginPath(); g.moveTo(s * 4 * u, 6 * u); g.bezierCurveTo(s * 22 * u, 14 * u, s * 22 * u, 40 * u, s * 3 * u, 50 * u); g.stroke(); });
    g.fillStyle = M('#6FCB4A'); [[-14, 20, -0.6], [15, 30, 0.6], [-12, 40, -0.3]].forEach(p => { g.beginPath(); D.ell(g, p[0] * u, p[1] * u, 4 * u, 2 * u, p[2]); g.fill(); });
    for(let i = 0; i < 3; i++){ const a = t * 2 + i * 2.1; D.sparkle(g, Math.cos(a) * 26 * u, 28 * u + Math.sin(a) * 14 * u, 2.6 * u, '#FFE58A'); }
  }
  g.restore();
}


/* ---------- 📋 the families (10 jobs, §11 / §17e) + the R0b types ---------- */
const FAMILIES = [
  {k: 'sword', job: 'Knight', icon: '🗡️'}, {k: 'wand', job: 'Mage', icon: '🪄'}, {k: 'spatula', job: 'Chef', icon: '🍳'}, {k: 'can', job: 'Gardener', icon: '🚿'},
  {k: 'ranger', job: 'Ranger', icon: '🏹', later: 1}, {k: 'scholar', job: 'Scholar', icon: '📖', later: 1}, {k: 'inventor', job: 'Inventor', icon: '🔧', later: 1},
  {k: 'ninja', job: 'Ninja', icon: '🥷', later: 1}, {k: 'brawler', job: 'Brawler', icon: '🥊', later: 1}, {k: 'summoner', job: 'Summoner', icon: '🎶', later: 1}];
// pal = the drawn colours per look [c1 blade / head, c2 trim / gem, grip] · pat = [piece call, part] that takes the 🌈 pattern · stk = sticker [x, y, size] in drawing units
const P4 = (a, b) => [a, a, a, b || a];
const TYPES = [
  {id: 'sword', fam: 'sword', hand: 'one', icon: '🗡️', n: 'Sword', p: 'sword', size: 36, names: ['Wooden Sword', 'Steel Blade', 'Flame Saber', 'Dragon Edge'],
    pal: [['#D49A5C', '#9B6635', '#8A5A2B'], ['#C9D3DE', '#3A8DFF', '#6B3F22'], ['#FF6A1A', '#C0392B', '#3B2414'], ['#7FE3D2', '#FFC21A', '#0F6E6A']], pat: P4([1, 0]), stk: [[0, -30, 12], [0, -36, 12], [0, -40, 12], [2, -50, 14]]},
  {id: 'greatsword', fam: 'sword', hand: 'two', icon: '🙌', n: 'Greatsword', p: 'great', size: 36, names: ['Log Blade', 'Iron Claymore', 'Volcano Cleaver', 'Titan Cleaver'],
    pal: [['#C98A4B', '#9B6635', '#8A5A2B'], ['#C9D3DE', '#3A8DFF', '#5A3418'], ['#4A2A22', '#FF7A1A', '#2B1D14'], ['#4AB8AA', '#FFC21A', '#0F6E6A']], pat: P4([1, 0]), stk: [[0, -44, 16], [0, -56, 16], [8, -60, 18], [0, -70, 20]]},
  {id: 'twinblades', fam: 'sword', hand: 'dual', icon: '⚔️', n: 'Twin Blades', p: 'twinOne', size: 32, names: ['Twin Sticks', 'Twin Steel', 'Twin Fangs', 'Petal Storm'],
    pal: [['#B07842', '#9B6635', '#8A5A2B'], ['#C9D3DE', '#3A8DFF', '#5A3418'], ['#B07CFF', '#FFD23F', '#2B1D44'], ['#FFC2D8', '#FFD23F', '#B5172A']], pat: P4([1, 0]), stk: [[0, -24, 10], [0, -28, 10], [2, -32, 10], [2, -38, 11]]},
  {id: 'shield', fam: 'sword', hand: 'off', icon: '🛡️', n: 'Shield', p: 'shield', size: 26, names: ['Plank Buckler', 'Kite Shield', 'Sun Shield', 'Dragon Guard'],
    pal: [['#C98A4B', '#E8C887', '#9B6635'], ['#C9D3DE', '#3A8DFF', '#5A6476'], ['#D63A1A', '#FFD23F', '#8A1E10'], ['#1F8A80', '#FFC21A', '#156E66']], pat: [[0, 0], [0, 0], [0, 1], [0, 1]], stk: [[0, 0, 22], [0, -4, 24], [0, 0, 24], [0, -6, 26]]},
  {id: 'wand', fam: 'wand', hand: 'one', icon: '🪄', n: 'Wand', p: 'wand', size: 36, names: ['Twig Wand', 'Crystal Wand', 'Storm Rod', 'Star Scepter'],
    pal: [['#B07842', '#6FCB4A', '#7A4A22'], ['#5FE1FF', '#C9A04A', '#8A5A2B'], ['#9B7BFF', '#D9822B', '#7D8AA0'], ['#FFC21A', '#9B5DE5', '#B9C9F0']], pat: [[0, 0], [0, 2], [0, 1], [0, 2]], stk: [[0, -6, 9], [0, -58, 10], [0, -76, 12], [0, -92, 10]]},
  {id: 'orb', fam: 'wand', hand: 'off', icon: '🔮', n: 'Orb', p: 'orb', size: 30, names: ['Glass Marble', 'Crystal Orb', 'Storm Orb', 'Star Orb'],
    pal: [['#A8E6FF', '#C98A4B', '#8A5A2B'], ['#9FA8FF', '#C9A04A', '#4B4FD6'], ['#6A4BD6', '#D9822B', '#7D8AA0'], ['#7A4BD6', '#FFC21A', '#B07800']], pat: P4([0, 1]), stk: [[0, -18, 8], [0, -26, 10], [0, -30, 10], [0, -36, 10]]},
  {id: 'spatula', fam: 'spatula', hand: 'one', icon: '🍳', n: 'Spatula', p: 'spatula', size: 36, names: ['Kitchen Spatula', 'Iron Flipper', 'Sizzle Turner', 'Golden Feast Ladle'],
    pal: [['#C3CBD6', '#7D8AA0', '#E63E7A'], ['#6F7C8E', '#D7DEEA', '#B07842'], ['#4A5468', '#FF9F1C', '#3B2414'], ['#FFC21A', '#E63946', '#B07800']], pat: [[0, 1], [0, 1], [0, 2], [0, 1]], stk: [[0, -38, 10], [0, -58, 12], [0, -68, 12], [0, -70, 12]]},
  {id: 'potlid', fam: 'spatula', hand: 'off', icon: '🍲', n: 'Pot-lid', p: 'lid', size: 26, names: ['Tin Pot-lid', 'Iron Pot-lid', 'Sizzle Pan', 'Golden Cloche'],
    pal: [['#C9D3DE', '#5A6476', '#8D9AAB'], ['#6F7C8E', '#D7DEEA', '#8A5A2B'], ['#2B2D42', '#FF6A1A', '#FFD23F'], ['#FFC21A', '#E63946', '#FFF0B0']], pat: [[0, 0], [0, 0], [0, 1], [0, 1]], stk: [[0, 0, 18], [0, 0, 20], [0, 0, 20], [0, -2, 22]]},
  {id: 'can', fam: 'can', hand: 'one', icon: '🚿', n: 'Watering Can', p: 'can', size: 34, names: ['Little Watering Can', 'Bloom Can', 'Rainbow Sprinkler', 'World-Tree Staff'],
    pal: [['#2EC4B6', '#FFD23F', '#1C8F86'], ['#FF8FB0', '#FFD23F', '#4CC764'], ['#2CA6DE', '#FFD23F', '#1C6FA8'], ['#5CC94A', '#FFD23F', '#8A5A2B']], pat: [[0, 3], [0, 3], [0, 1], [0, 2]], stk: [[2, 9, 10], [0, 10, 10], [0, -68, 10], [0, -102, 12]]},
  {id: 'seedpouch', fam: 'can', hand: 'off', icon: '🌱', n: 'Seed pouch', p: 'pouch', size: 30, names: ['Seed Pouch', 'Bloom Bag', 'Rainbow Seed Jar', 'World-Seed Lantern'],
    pal: [['#C9A46A', '#8A5A2B', '#7A4A22'], ['#4CC764', '#FF8FB0', '#FFD23F'], ['#C98A4B', '#9B5DE5', '#C9A46A'], ['#FFD23F', '#5CC94A', '#8A5A2B']], pat: [[0, 0], [0, 1], [0, 0], [1, 0]], stk: [[0, 22, 9], [0, 30, 10], [0, 30, 10], [0, 28, 9]]},
];
const LOOK_LV = [1, 7, 14, 20], COUNT = TYPES.length * 4;
const PAINT = {sword, great, twinOne, shield, wand, orb, spatula, lid, can, pouch};
const TI = {}; TYPES.forEach((T, i) => TI[T.id] = i);
const okHex = c => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c);
function info(v){ v = Number(v); if(!(v >= 0 && v < COUNT)) return null; v |= 0; const T = TYPES[v >> 2], look = v & 3;
  return {v, type: T, id: T.id, look, lv: LOOK_LV[look], name: T.names[look], hand: T.hand, fam: T.fam, icon: T.icon, family: FAMILIES.find(F => F.k === T.fam)}; }
function idx(id, look){ const i = TI[id]; return i == null ? -1 : i * 4 + Math.max(0, Math.min(3, look | 0)); }
function lookFor(mastery){ mastery = Number(mastery) || 1; return mastery >= 20 ? 3 : mastery >= 14 ? 2 : mastery >= 7 ? 1 : 0; }
function design(v, o){ const I = info(v) || info(0), p = I.type.pal[I.look]; o = o || {};
  const stk = typeof RACKET_STICKERS !== 'undefined' && RACKET_STICKERS.indexOf(o.stk) > 0 ? o.stk : '';
  return {v: I.v, c1: okHex(o.c1) ? o.c1 : p[0], c2: okHex(o.c2) ? o.c2 : p[1], grip: okHex(o.grip) ? o.grip : p[2], pat: Math.max(0, Math.min(9, Number(o.pat) | 0)), stk}; }

/* ---------- 🖌️ paint one weapon (grip / hand at the origin, pointing up) ---------- */
function twin(g, T, u, rw, t){
  ST.call = 0; g.save(); g.translate(-10 * u, 0); g.rotate(-0.38); twinOne(g, T, u, rw, t); g.restore();
  ST.call = 0; ST.pc = -1; g.save(); g.translate(10 * u, 0); g.rotate(0.38); twinOne(g, T, u, rw, t); g.restore();
  if(T === 3){ for(let i = 0; i < 7; i++){ const a = t * 1.5 + i * 0.9, r = (40 + (i % 3) * 14) * u; g.fillStyle = M(i % 2 ? '#FFC2D8' : '#FF8FB0'); g.beginPath(); D.ell(g, Math.cos(a) * r * 0.8, -40 * u + Math.sin(a) * r * 0.5, 3.4 * u, 2 * u, a); g.fill(); } }
}
function paint(g, v, d, u, t, o){ o = o || {}; const I = info(v); if(!I) return; const T = I.type, rw = Math.max(0.9, 2.1 * u);
  d = design(I.v, d);
  const prevMap = MAP, prevST = Object.assign({}, ST);
  MAP = mapFor(T.pal[I.look], d);
  Object.assign(ST, {call: 0, pat: d.pat || 0, pc: T.pat[I.look][0], pp: T.pat[I.look][1], pcol: d.c2, pk: 2.3 * u, t: t || 0});
  try{
    if(T.p === 'twinOne' && o.pair) twin(g, I.look, u, rw, t || 0);
    else PAINT[T.p](g, I.look, u, rw, t || 0);
    if(d.stk && typeof emo === 'function'){ const s = T.stk[I.look]; emo(g, d.stk, s[0] * u, s[1] * u, s[2] * u); }
  } finally { MAP = prevMap; Object.assign(ST, prevST); }
}
function draw(g, v, x, y, size, o){ o = o || {}; g.save(); g.translate(x, y); if(o.tilt) g.rotate(o.tilt); paint(g, v, o.design, size / 100, o.t, {pair: o.pair !== false}); g.restore(); }
// the real painted box of a look at size 100 (measured once off-screen) → centred + scaled into any box
const BOX = new Map();
function boxOf(v, pair){ const key = v + (pair ? 'p' : ''); let b = BOX.get(key); if(b) return b;
  const S = 420, c = document.createElement('canvas'); c.width = S; c.height = S; const q = c.getContext('2d');
  draw(q, v, S / 2, S * 0.66, 100, {t: 0.6, pair});
  const px = q.getImageData(0, 0, S, S).data; let x0 = S, y0 = S, x1 = 0, y1 = 0;
  for(let j = 0; j < S; j += 2) for(let i = 0; i < S; i += 2) if(px[(j * S + i) * 4 + 3] > 16){ if(i < x0) x0 = i; if(i > x1) x1 = i; if(j < y0) y0 = j; if(j > y1) y1 = j; }
  b = x1 > x0 ? {x0: x0 - S / 2 - 2, y0: y0 - S * 0.66 - 2, w: x1 - x0 + 4, h: y1 - y0 + 4} : {x0: -40, y0: -100, w: 80, h: 130}; BOX.set(key, b); return b; }
function fit(g, v, x, y, w, h, o){ o = o || {}; const pair = o.pair !== false, b = boxOf(v, pair), s = Math.min(w / b.w, h / b.h) * (o.fill || 0.92);
  draw(g, v, x + w / 2 - (b.x0 + b.w / 2) * s, y + h / 2 - (b.y0 + b.h / 2) * s, 100 * s, {t: o.t, design: o.design, pair}); return s; }
// in an avatar's hand (AvatarKit drawHeldItem('weapon') + the off hand): the hand is at the origin, k = the avatar's scale
const OFF_AT = {shield: [3, -1], potlid: [3, -1], orb: [1, 1], seedpouch: [0, 1]};
function held(g, v, o, k, t, opt){ opt = opt || {}; const I = info(v); if(!I) return; const T = I.type, u = T.size * k / 100;
  g.save();
  if(T.hand === 'off'){ const p = OFF_AT[T.id] || [0, 0]; g.translate(p[0] * k, p[1] * k); paint(g, v, o, u, t); }
  else { g.translate(1.5 * k, 3 * k); g.rotate(opt.off ? 0.55 : T.hand === 'two' ? 0.2 : 0.35); paint(g, v, o, u, t); }
  g.restore(); }
// a copy of the avatar holding a main weapon (+ off hand). main / off = a v number or a design {v, …}
function arm(av, main, off){ const a = JSON.parse(JSON.stringify(av || {})); a.eq = Object.assign({}, a.eq || {}); delete a.eq.off;
  const dz = x => x == null ? null : typeof x === 'object' ? design(x.v, x) : design(x, {});
  const m = dz(main), f = dz(off), Im = m && info(m.v);
  if(m){ if(Im.hand === 'off') a.eq.off = {id: 'weapon', v: m.v, o: m}; else a.eq.hand = {id: 'weapon', v: m.v, o: m}; }
  if(Im && Im.hand === 'dual') a.eq.off = {id: 'weapon', v: m.v, o: m};                  // ⚔️ the twin goes in the other hand
  else if(f && !(Im && Im.hand === 'two')){ const If = info(f.v); if(If.hand === 'off') a.eq.off = {id: 'weapon', v: f.v, o: f}; }   // 🙌 two-hand = no off hand
  return a; }
function offFor(v){ const I = info(v); return !I ? null : I.hand === 'two' ? 'blocked' : I.hand === 'dual' ? v : I.hand === 'one' ? idx(TYPES.find(T => T.fam === I.fam && T.hand === 'off').id, I.look) : null; }

/* ---------- 🏏 the 🗡️ Weapons family in the shared Batstick designer ---------- */
function register(){
  if(typeof BatStick === 'undefined' || !BatStick.family) return false;
  BatStick.family('weapon', {
    icon: '🗡️', title: 'My Weapon', sub: 'looks only — a new SHAPE at mastery Lv 1 · 7 · 14 · 20', tabA: '🗡️ Shape', save: '💾 Save my weapon', key: 'sp_weapon:', def: 0,
    list: Array.from({length: COUNT}, (_, v) => { const I = info(v), p = I.type.pal[I.look]; return {n: I.name, c1: p[0], c2: p[1], grip: p[2], tag: I.type.icon + ' Lv ' + I.lv}; }),
    clean: design,
    owns: (v, o) => !o.owned ? true : typeof o.owned === 'function' ? !!o.owned(v) : o.owned.indexOf(v) >= 0,
    lock: v => { const I = info(v); return '🔒 Reach ' + I.type.icon + ' ' + I.type.n + ' mastery Lv ' + I.lv + ' to unlock this shape'; },
    mini: (c, v, d, t) => { const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); fit(g, v, 6, 6, c.width - 12, c.height - 12, {t: t || 0.6, design: d}); },
    big: (x, c, v, d, t) => fit(x, v, c.width - 132, 56, 122, c.height - 110, {t, design: d}),
    hold: (av, d) => arm(av, d)
  });
  return true;
}
window.AvWeapons = {FAMILIES, TYPES, LOOK_LV, COUNT, info, idx, lookFor, design, draw, fit, held, arm, offFor, paint, register, _hsl: hsl};
register();
})();
