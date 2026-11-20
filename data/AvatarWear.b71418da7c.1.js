
/* 👕 AvatarWear — window.AvatarWear (av-wear2, 🧳 Avateer chat, 2026-11-20) · include AFTER AvatarKit.
   Worn gear for avatars: 14 job outfits × 4 looks · 7 island sets (⚪→🟡 tiers) · 3 camp sets · 49 ☀️ Sky God pieces · 12 ✦ Sky Prime worn + guard forms.
   Plan: Avateer — full plan.md §17h-5 (pictures Claude outputs/av-wear1/wear-1…6). BUILT from Test Harness/avateer/src/20_wear.js by avateer/wear/build_wear.py — never edit AvatarWear.html by hand.

   USE
     av2 = AvatarWear.dress(av, 'job.knight@3')                 // a whole look (all its slots)
     av2 = AvatarWear.dress(av, {head: 'isl.jungle@2', body: 'job.knight@1', feet: 'isl.frost@4', back: 'isl.cherry@3'})   // per slot (👗 show-my-look)
     drawAvatar(g, {av: av2, dir: 1}, x, feet, k, {t})          // AvatarKit draws it through its AK_WEAR hook (works inside Acting acts too — wear is DATA)
   IDS
     job.<job>@<0..3>[~<element>]   looks at job Lv 1 · 7 · 14 · 20 (Lv 14+ gem + trim take the element; default = the job's example element)
     isl.<island>@<0..4>            island set at tier ⚪ 🟢 🔵 🟣 🟡 (shapes never change, only trim + glow)
     camp.<bone|bolt|spring>        🦖🤖 camp sets (lore 27l-3)
     sky.<region>                   ☀️ Sky God set (7 regions)
     prime.<3..14>.<sig|guard>      ✦ Sky Prime worn (signature) / guard form
   API
     AvatarWear.ids(kind?) · look(id) · info(id) → {id, kind, name, names: {slot: name}, slots: [..]} · dress(av, sel) · icon(id, slot, px) → canvas
     lying(id, slot, px) → canvas (the piece flat on the 2.5D ground + ONE rim #2A1C14, for map drops) · SLOTS · FACE (the face box, avatar units) · akWear (the hook)
   Notes: 👟 boots follow the pose (av-wear5: AvatarKit's feet hook + AKJ.feetAt — walk · run · kick · jump · Brawl 'follow' feet; an older AvatarKit = standing boots) · the face is never covered (open-face law, tested by wear.js).
*/
(function(){
'use strict';
const VERSION = 'av-wear5';
const SLOTS = ['head', 'body', 'feet', 'back', 'off', 'acc'];
const FACE = {cx: 5, cy: -56, r: 6};   // avatar units, facing +x: the eyes + mouth — no wear pixel may land here (open-face law); glass pieces (GLASS) may tint it
const sh = (c, f) => (typeof shade === 'function' ? shade(c, f) : c);
const hexA = (h, a) => { const n = parseInt(String(h).slice(1, 7), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; };
function rr(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function fill(g, path, c, edge){ g.beginPath(); path(); g.fillStyle = c; g.fill(); if(edge !== false){ g.lineWidth = 0.75; g.strokeStyle = sh(c, 0.55); g.stroke(); } }
function rect(g, x, y, w, h, r, c){ fill(g, () => { rrPath(g, x, y, w, h, r); }, c); }
function rrPath(g, x, y, w, h, r){ g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function gem(g, x, y, r, c){ g.save(); const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 0.2, x, y, r); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.35, c); gr.addColorStop(1, sh(c, 0.55)); g.fillStyle = gr; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * 0.85, y); g.lineTo(x, y + r); g.lineTo(x - r * 0.85, y); g.closePath(); g.fill(); g.lineWidth = 0.5; g.strokeStyle = sh(c, 0.4); g.stroke(); g.restore(); }
function halo(g, x, y, r, c, a){ const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, hexA(c, 0.55 * (a || 1))); gr.addColorStop(1, hexA(c, 0)); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
function star4(g, x, y, r, c){ g.beginPath(); for(let i = 0; i < 8; i++){ const q = i % 2 ? r * 0.3 : r, a = i / 8 * Math.PI * 2 - Math.PI / 2; i ? g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : g.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fillStyle = c; g.fill(); }
function feather(g, x, y, len, a, c){ g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.35, -len * 0.18, len, 0); g.quadraticCurveTo(len * 0.35, len * 0.18, 0, 0); g.fillStyle = c; g.fill(); g.lineWidth = 0.4; g.strokeStyle = sh(c, 0.5); g.stroke(); g.restore(); }
function fan(g, x, y, n, c, a0, len){ for(let i = 0; i < n; i++) feather(g, x, y, len || 9, a0 + i * 0.35, i % 2 ? c : sh(c, 1.3)); }
function spiral(g, x, y, s, c){ g.lineWidth = s * 0.2; g.strokeStyle = c; g.beginPath(); for(let i = 0; i < 40; i++){ const a = i * 0.3, r = s * i / 40; i ? g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : g.moveTo(x, y); } g.stroke(); }
function coral(g, x, y, s, c){ g.lineCap = 'round'; g.strokeStyle = c; g.lineWidth = s * 0.28; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - s * 2); g.moveTo(x, y - s * 1.2); g.lineTo(x - s * 0.8, y - s * 2); g.moveTo(x, y - s * 1.6); g.lineTo(x + s * 0.8, y - s * 2.4); g.stroke(); }

// ---------- 🎨 region motifs (☀️ Sky God dress) ----------
const MOTIF = {
  kranok(g, x, y, s){ fill(g, () => { g.moveTo(x, y + s); g.bezierCurveTo(x - s, y + s * 0.2, x - s * 0.4, y - s, x + s * 0.3, y - s * 1.2); g.bezierCurveTo(x - s * 0.1, y - s * 0.4, x + s * 0.7, y - s * 0.1, x + s * 0.2, y + s * 0.3); g.quadraticCurveTo(x + s * 0.5, y + s * 0.7, x, y + s); }, '#F2C230'); },
  sakura(g, x, y, s){ for(let i = 0; i < 5; i++){ const a = i * 1.2566 - 1.57; g.fillStyle = '#FF8CC6'; g.beginPath(); g.ellipse(x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.5, s * 0.42, s * 0.3, a, 0, 7); g.fill(); } g.fillStyle = '#FFF4B8'; g.beginPath(); g.arc(x, y, s * 0.2, 0, 7); g.fill(); },
  sundisc(g, x, y, s){ fill(g, () => { g.arc(x, y, s * 0.6, 0, 7); }, '#F2C230'); g.lineWidth = s * 0.18; g.strokeStyle = '#2B5FC9'; g.beginPath(); g.arc(x, y, s * 0.85, 0, 7); g.stroke(); },
  aurora(g, x, y, s){ g.lineCap = 'round'; [['#7ED957', 0], ['#B57BFF', s * 0.35]].forEach(([c, d]) => { g.lineWidth = s * 0.22; g.strokeStyle = c; g.beginPath(); g.moveTo(x - s, y + d); g.bezierCurveTo(x - s * 0.3, y - s * 0.6 + d, x + s * 0.3, y + s * 0.6 + d, x + s, y + d); g.stroke(); }); },
  ember(g, x, y, s){ halo(g, x, y, s * 1.2, '#FF8A3D', 1); fill(g, () => { g.moveTo(x, y - s); g.lineTo(x + s * 0.45, y); g.lineTo(x, y + s * 0.8); g.lineTo(x - s * 0.45, y); g.closePath(); }, '#2B1E2E'); g.fillStyle = '#FF8A3D'; g.fillRect(x - s * 0.05, y - s * 0.5, s * 0.1, s * 0.9); },
  pearl(g, x, y, s){ fill(g, () => { g.arc(x, y, s * 0.55, 0, 7); }, '#FFF4E0'); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x - s * 0.18, y - s * 0.18, s * 0.16, 0, 7); g.fill(); g.lineWidth = s * 0.08; g.strokeStyle = hexA('#8EE3F5', 0.8); g.beginPath(); g.arc(x, y, s * 0.95, 0, 7); g.stroke(); },
  star(g, x, y, s){ star4(g, x, y, s, '#FFFFFF'); g.lineWidth = s * 0.1; g.strokeStyle = '#4B3FC4'; g.beginPath(); for(let i = 0; i < 8; i++){ const q = i % 2 ? s * 0.3 : s, a = i / 8 * 6.283 - 1.57; i ? g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : g.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.stroke(); },
};
// ---------- 🛡️ marks on shields / orbs, chest + head decorations (named, so wear stays DATA) ----------
const MARK = {
  qmark(g, x, y){ g.save(); g.font = '700 10px Fredoka, Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#2B5FC9'; g.fillText('?', x, y + 0.5); g.restore(); },
  drum(g, x, y){ fill(g, () => { g.arc(x, y, 5, 0, 7); }, '#F3E9D8'); spiral(g, x, y, 3.6, '#E2481B'); },
  crow(g, x, y){ fan(g, x - 2, y + 4, 3, '#2B2D42', -2.4, 8); },
  scarab(g, x, y){ g.lineWidth = 0.9; g.strokeStyle = '#0E5E5A'; g.beginPath(); g.moveTo(x, y - 7); g.lineTo(x, y + 7); g.stroke(); MOTIF.sundisc(g, x, y - 3, 2.2); },
  snowstar(g, x, y){ star4(g, x, y, 4.5, '#8EE3F5'); },
  conch(g, x, y){ spiral(g, x, y, 6, '#C2408A'); },
  coral(g, x, y){ coral(g, x, y + 5, 3.4, '#FF7A8A'); },
  lid(g, x, y){ rect(g, x - 2.5, y - 1.5, 5, 3, 1.4, '#5E4A34'); },
  nova(g, x, y){ star4(g, x, y, 4.5, '#FFFFFF'); },
  feather(g, x, y){ fan(g, x - 2, y + 4, 3, '#2B2D42', -2.4, 8); },
};
const DECO = {
  crow(g){ fan(g, -10, -46, 5, '#2B2D42', -3.2, 11); fan(g, 9, -46, 4, '#3A4A6B', -0.7, 9); },
  sunbelt(g){ MOTIF.sundisc(g, 1, -42, 4); g.lineWidth = 0.8; g.strokeStyle = '#0E5E5A'; g.beginPath(); g.moveTo(1, -38); g.lineTo(1, -27); g.stroke(); },
  iceroad(g){ g.save(); g.globalAlpha = 0.7; fill(g, () => { g.ellipse(-2, 0, 22, 3.4, 0, 0, 7); }, '#DDF6FF', false); g.restore(); [-12, 10, 18].forEach(x => star4(g, x, -1, 2, '#FFFFFF')); },
  magma(g){ g.lineWidth = 1; g.strokeStyle = '#FF8A3D'; g.beginPath(); g.moveTo(-8, -44); g.lineTo(-3, -38); g.lineTo(-6, -32); g.moveTo(8, -42); g.lineTo(4, -36); g.stroke(); },
  heart(g){ halo(g, 1, -36, 8, '#FF4D6D', 1.2); fill(g, () => { g.moveTo(1, -32); g.bezierCurveTo(-6, -37, -3, -42, 1, -39); g.bezierCurveTo(5, -42, 8, -37, 1, -32); }, '#FF4D6D'); },
  dish(g){ g.lineWidth = 1; g.strokeStyle = '#4B3FC4'; g.beginPath(); g.ellipse(1, -36, 5, 2, -0.4, 0, Math.PI); g.stroke(); g.beginPath(); g.moveTo(1, -36); g.lineTo(4, -42); g.stroke(); },
};
const HDECO = {
  glassdome(g){ g.save(); g.globalAlpha = 0.3; const gr = g.createLinearGradient(0, -90, 0, -40); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, '#FFE9A8'); g.fillStyle = gr; g.beginPath(); g.arc(0, -56, 26, Math.PI, 0); g.closePath(); g.fill(); g.globalAlpha = 0.85; g.lineWidth = 1; g.strokeStyle = '#E9C46A'; g.beginPath(); g.arc(0, -56, 26, Math.PI, 0); g.stroke(); g.restore(); },
  coral(g){ coral(g, -4, -70, 4, '#FF7A8A'); coral(g, 4, -71, 3.4, '#FF9F8A'); },
  comet(g){ g.lineCap = 'round'; ['#FFFFFF', '#8EE3F5', '#B57BFF'].forEach((c, i) => { g.lineWidth = 2.4 - i * 0.6; g.strokeStyle = c; g.beginPath(); g.moveTo(-6, -84); g.quadraticCurveTo(-18 - i * 3, -80, -26 - i * 3, -68 + i * 2); g.stroke(); }); },
};
const BACKFX = {   // little live layers behind the body (t = time)
  drum(g, t){ [0, 1, 2].forEach(i => { g.lineWidth = 1; g.strokeStyle = hexA('#5CC8FF', Math.max(0, 0.7 - i * 0.2)); g.beginPath(); g.arc(-18, -46, 10 + i * 4 + (t * 6 % 4), -1.2, 1.2); g.stroke(); }); },
  aurora(g, t){ [0, 1].forEach(i => MOTIF.aurora(g, -18 - i * 6, -36 + i * 14 + Math.sin(t * 2 + i) * 2, 6)); },
  bubbles(g, t){ [0, 1, 2].forEach(i => { g.lineWidth = 0.8; g.strokeStyle = hexA('#8EE3F5', 0.8); g.beginPath(); g.arc(-22 + i * 3, -54 - ((t * 10 + i * 5) % 14), 1.4 + i * 0.3, 0, 7); g.stroke(); }); },
  embers(g, t){ for(let i = 0; i < 4; i++) MOTIF.ember(g, -24 + i * 5, -62 + ((t * 8 + i * 6) % 20), 2.2); },
};

// ---------- 🎩 HEAD (open face: nothing below the brow on the +x side) ----------
const HEAD = {
  dome(g, p){ fill(g, () => { g.moveTo(-14.6, -52); g.arc(0, -61, 14.8, Math.PI * 0.95, Math.PI * 1.9); g.lineTo(12.8, -66.5); g.quadraticCurveTo(0, -64.5, -10, -62); g.lineTo(-10, -53); g.closePath(); }, p.c1);
    g.save(); g.globalAlpha = 0.35; fill(g, () => { g.ellipse(-3, -71, 7, 3, -0.3, 0, 7); }, '#FFFFFF', false); g.restore();
    g.lineWidth = 2.2; g.strokeStyle = p.trim; g.lineCap = 'round'; g.beginPath(); g.moveTo(-13.8, -59.5); g.quadraticCurveTo(0, -66, 13.2, -66.2); g.stroke(); },
  helm(g, p){ HEAD.dome(g, p); fill(g, () => { g.moveTo(-14.5, -58); g.lineTo(-8, -58); g.lineTo(-7, -49); g.lineTo(-14, -49); g.closePath(); }, sh(p.c1, 0.85));
    if(p.lv >= 1){ g.fillStyle = p.trim; [-6, 0, 6].forEach(x => { g.beginPath(); g.arc(x, -66.5 + Math.abs(x) * 0.05, 0.9, 0, 7); g.fill(); }); }
    if(p.lv >= 2) gem(g, 7, -68.5, 2.4, p.gem);
    if(p.crest){ const h = p.lv >= 3 ? 16 : 10; for(let i = 0; i < 7; i++) feather(g, -2 - i * 1.6, -74 + i * 0.8, h - i * 0.6, -1.35 - i * 0.22, i % 2 ? p.crest : sh(p.crest, 1.2)); } },
  heavy(g, p){ HEAD.helm(g, p); [[-9, -74], [5, -76]].forEach(([x, y], i) => fill(g, () => { g.moveTo(x - 2.5, y + 3); g.quadraticCurveTo(x - 3 + i * 4, y - 6, x + 3 + i * 3, y - 9); g.quadraticCurveTo(x + 2, y - 2, x + 2.5, y + 3); g.closePath(); }, p.c3 || '#F3E9D8')); },
  plume(g, p){ HEAD.helm(g, Object.assign({}, p, {crest: null})); fill(g, () => { g.moveTo(-3, -75); g.quadraticCurveTo(-1, -86 - p.lv * 2, 4, -88 - p.lv * 2); g.quadraticCurveTo(-10, -86, -16, -70); g.quadraticCurveTo(-8, -74, -3, -75); }, p.crest || '#E2481B'); },
  kabuto(g, p){ HEAD.dome(g, p); fill(g, () => { g.moveTo(-15, -60); g.quadraticCurveTo(-22, -58, -24, -52); g.quadraticCurveTo(-18, -54, -11, -55); g.closePath(); }, sh(p.c1, 0.9));
    fill(g, () => { g.moveTo(-14, -56); g.lineTo(-20, -48); g.lineTo(-9, -49); g.closePath(); }, sh(p.c1, 0.8));
    if(p.lv >= 2){ g.lineWidth = 1.6; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(2, -73); g.quadraticCurveTo(10, -88, 18, -84); g.stroke(); g.beginPath(); g.moveTo(-2, -73); g.quadraticCurveTo(-6, -90, 2, -92); g.stroke(); gem(g, 0, -73.5, 2.2, p.gem); } },
  hood(g, p){ g.save(); g.beginPath(); g.ellipse(-1, -60.5, 16.2, 16, 0, 0, 7); g.ellipse(6.5, -57.5, 9.8, 11.2, 0, 0, 7); g.fillStyle = p.c1; g.fill('evenodd'); g.lineWidth = 0.75; g.strokeStyle = sh(p.c1, 0.55); g.stroke(); g.restore();
    fill(g, () => { g.moveTo(-14, -54); g.quadraticCurveTo(-20, -44, -16, -38); g.lineTo(-8, -44); g.closePath(); }, sh(p.c1, 0.8));
    g.lineWidth = 1.6; g.strokeStyle = p.trim; g.beginPath(); g.ellipse(6.5, -57.5, 10.4, 11.8, 0, -2.2, -1.25); g.stroke(); if(p.lv >= 2) gem(g, 4, -72, 2, p.gem); },
  wizard(g, p){ fill(g, () => { g.ellipse(0, -69, 20, 4.4, -0.08, 0, 7); }, sh(p.c1, 0.85)); fill(g, () => { g.moveTo(-11, -71); g.quadraticCurveTo(-6, -88, -14 - p.lv, -101 - p.lv * 1.5); g.quadraticCurveTo(2, -90, 11, -71); g.closePath(); }, p.c1);
    g.lineWidth = 2.4; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(-10.5, -72); g.quadraticCurveTo(0, -74, 10.5, -72); g.stroke(); for(let i = 0; i < p.lv + 1; i++) star4(g, -5 + i * 3.5, -80 - (i % 2) * 6, 1.8, p.c3 || '#FFD43B'); if(p.lv >= 2) gem(g, 0, -72, 2.2, p.gem); },
  toque(g, p){ rect(g, -12, -76, 24, 9, 2, p.c1); const n = 3 + p.lv; for(let i = 0; i < n; i++) fill(g, () => { g.arc(-10 + i * 20 / (n - 1), -80 - (i % 2) * 3 - p.lv, 5 + p.lv * 0.4, 0, 7); }, p.c1);
    g.lineWidth = 1.4; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(-12, -69.5); g.lineTo(12, -69.5); g.stroke(); if(p.lv >= 2) gem(g, 0, -72.5, 2, p.gem); },
  sunhat(g, p){ fill(g, () => { g.ellipse(0, -68, 22 + p.lv, 4.6, -0.06, 0, 7); }, p.c1); fill(g, () => { g.ellipse(0, -71, 12, 7.5, 0, Math.PI, 0); g.closePath(); }, p.c1); g.lineWidth = 2.2; g.strokeStyle = p.trim; g.beginPath(); g.ellipse(0, -70, 12, 2.2, 0, 0, Math.PI); g.stroke();
    [[8, -73, '#FF8CC6'], [11, -71, '#FFD43B']].slice(0, p.lv).forEach(([x, y, c]) => { for(let i = 0; i < 5; i++){ g.fillStyle = c; g.beginPath(); g.arc(x + Math.cos(i * 1.256) * 1.8, y + Math.sin(i * 1.256) * 1.8, 1.4, 0, 7); g.fill(); } });
    if(p.lv >= 3) fill(g, () => { g.moveTo(-8, -76); g.quadraticCurveTo(-4, -86, 4, -84); g.quadraticCurveTo(-2, -80, -8, -76); }, '#7ED957'); },
  kasa(g, p){ fill(g, () => { g.moveTo(-22 - p.lv, -66); g.quadraticCurveTo(0, -90 - p.lv * 1.5, 22 + p.lv, -66); g.quadraticCurveTo(0, -70, -22 - p.lv, -66); }, p.c1);
    g.lineWidth = 0.5; g.strokeStyle = sh(p.c1, 0.6); for(let i = -3; i <= 3; i++){ g.beginPath(); g.moveTo(i * 2, -83); g.lineTo(i * 6.5, -67); g.stroke(); } if(p.lv >= 2){ g.lineWidth = 1.6; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(-20, -67.5); g.quadraticCurveTo(0, -71.5, 20, -67.5); g.stroke(); } },
  band(g, p){ g.lineWidth = 3.4; g.strokeStyle = p.c1; g.beginPath(); g.ellipse(0, -66, 13.6, 4, -0.12, Math.PI * 0.85, Math.PI * 2.1); g.stroke(); fill(g, () => { g.moveTo(-12, -66); g.quadraticCurveTo(-20, -64, -24, -56 + p.lv); g.lineTo(-21, -55); g.quadraticCurveTo(-18, -61, -12, -63); }, p.c1);
    if(p.lv >= 1){ g.fillStyle = p.trim; g.beginPath(); g.arc(9, -68, 2.2, 0, 7); g.fill(); } if(p.lv >= 2) gem(g, 9, -68, 1.8, p.gem); if(p.lv >= 3){ feather(g, -12, -66, 12, 2.6, p.trim); feather(g, -12, -66, 10, 2.2, sh(p.trim, 1.15)); } },
  goggle(g, p){ fill(g, () => { g.arc(0, -63, 14.2, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); }, p.c1); g.lineWidth = 2.2; g.strokeStyle = '#3A2E26'; g.beginPath(); g.moveTo(-14, -64); g.quadraticCurveTo(0, -71, 13, -69); g.stroke();
    [[5, -71], [11, -69]].forEach(([x, y]) => { fill(g, () => { g.arc(x, y, 3.4, 0, 7); }, p.trim); g.fillStyle = p.lv >= 2 ? hexA(p.gem, 0.8) : 'rgba(160,225,255,0.85)'; g.beginPath(); g.arc(x, y, 2.2, 0, 7); g.fill(); });
    if(p.lv >= 3){ g.lineWidth = 1; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(-3, -77); g.lineTo(-6, -86); g.stroke(); halo(g, -6, -87, 4, p.gem, 1.4); gem(g, -6, -87, 1.6, p.gem); } },
  beret(g, p){ fill(g, () => { g.ellipse(-2, -71, 15, 6.5, -0.15, 0, 7); }, p.c1); g.fillStyle = p.trim; g.beginPath(); g.arc(-2, -77.5, 1.6, 0, 7); g.fill(); if(p.lv >= 1) feather(g, -12, -73, 13 + p.lv * 2, -2.6, p.c3 || '#FFFFFF'); if(p.lv >= 2) gem(g, 6, -71, 2, p.gem); },
  circlet(g, p){ g.lineWidth = 2; g.strokeStyle = p.trim; g.beginPath(); g.ellipse(0, -66, 13.8, 4, -0.12, Math.PI * 0.8, Math.PI * 2.15); g.stroke(); gem(g, 11, -68, 2.4, p.gem);
    for(let i = 0; i <= p.lv; i++){ g.fillStyle = p.c3 || '#FFD43B'; g.beginPath(); g.arc(-12 + i * 3, -60 + i * 1.5, 1.5, 0, 7); g.fill(); g.strokeStyle = sh(p.c3 || '#FFD43B', 0.5); g.lineWidth = 0.4; g.stroke(); }
    feather(g, -10, -68, 14 + p.lv * 3, -2.5, p.c1); if(p.lv >= 2) feather(g, -10, -68, 12 + p.lv * 2, -2.1, sh(p.c1, 1.25)); },
  visorcap(g, p){ fill(g, () => { g.arc(0, -63, 14, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); }, p.c1); fill(g, () => { g.moveTo(9, -66); g.quadraticCurveTo(20, -67, 22, -64); g.quadraticCurveTo(15, -63, 8, -64); g.closePath(); }, sh(p.c1, 0.8));
    if(p.lv >= 1){ g.lineWidth = 1; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(-8, -72); g.lineTo(8, -76); g.stroke(); fill(g, () => { g.arc(8, -76.5, 3, 0, 7); }, p.trim); g.fillStyle = hexA(p.gem, 0.8); g.beginPath(); g.arc(8, -76.5, 1.8, 0, 7); g.fill(); } if(p.lv >= 3) halo(g, 8, -76.5, 8, p.gem); },
  bubble(g, p){ g.save(); const gr = g.createRadialGradient(4, -66, 2, 0, -61, 19); gr.addColorStop(0, 'rgba(255,255,255,0.08)'); gr.addColorStop(0.75, hexA(p.gem || '#8EE3F5', 0.1)); gr.addColorStop(1, hexA(p.gem || '#8EE3F5', 0.42)); g.fillStyle = gr; g.beginPath(); g.arc(0, -61, 18.5, 0, 7); g.fill(); g.lineWidth = 1; g.strokeStyle = hexA('#1A5FA8', 0.6); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1.6; g.beginPath(); g.arc(0, -61, 15.5, -2.4, -1.5); g.stroke(); g.restore(); rect(g, -12, -47, 24, 4, 2, p.trim); },
  hardhat(g, p){ fill(g, () => { g.arc(0, -64, 14.4, Math.PI, 0); g.closePath(); }, p.c1); fill(g, () => { g.ellipse(2, -65.6, 18, 2.4, 0, 0, 7); }, sh(p.c1, 0.85)); g.lineWidth = 2; g.strokeStyle = sh(p.c1, 0.8); g.beginPath(); g.moveTo(0, -78); g.lineTo(0, -66); g.stroke(); rect(g, 2, -74, 13, 5, 2.4, 'rgba(160,225,255,0.85)'); },
  leafhood(g, p){ HEAD.hood(g, p); for(let i = 0; i < 5; i++){ g.save(); g.translate(-12 + i * 5, -74 + Math.abs(i - 2) * 2); g.rotate(-0.6 + i * 0.3); fill(g, () => { g.moveTo(0, 0); g.quadraticCurveTo(3, -4, 0, -9); g.quadraticCurveTo(-3, -4, 0, 0); }, i % 2 ? '#7ED957' : '#2FB86B'); g.restore(); } },
  raptor(g, p){ HEAD.hood(g, p); fill(g, () => { g.moveTo(-6, -75); g.quadraticCurveTo(10, -82, 20, -74); g.lineTo(16, -71); g.lineTo(13, -73); g.lineTo(10, -70); g.lineTo(7, -72); g.quadraticCurveTo(2, -73, -6, -70); g.closePath(); }, p.c1);
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(8, -77, 1.6, 0, 7); g.fill(); g.fillStyle = '#1B2A4A'; g.beginPath(); g.arc(8.4, -77, 0.8, 0, 7); g.fill(); [-8, -12, -15].forEach((x, i) => fill(g, () => { g.moveTo(x, -74 + i * 2); g.lineTo(x - 2, -80 + i * 2); g.lineTo(x + 2, -75 + i * 2); g.closePath(); }, '#F3E9D8')); },
};
// ---------- 👕 BODY (over the body −11…11 × −47…−19) + 👟 FEET (standing feet ±5, −2) ----------
function chest(g, c, w){ w = w || 0; rect(g, -12 - w, -47.5, 24 + w * 2, 25, 7, c); }
function belt(g, y, c, buckle){ g.fillStyle = c; g.fillRect(-12, y, 24, 3.6); if(buckle){ g.fillStyle = buckle; rr(g, 1, y - 0.6, 5, 4.8, 1); g.fill(); } }
const BODY = {
  armor(g, p){ chest(g, p.c1, p.lv >= 2 ? 1 : 0); g.save(); g.globalAlpha = 0.3; fill(g, () => { g.ellipse(3, -40, 6, 4, -0.3, 0, 7); }, '#FFFFFF', false); g.restore();
    belt(g, -25, sh(p.c2, 0.7), p.trim); for(let i = 0; i < 4; i++) rect(g, -12 + i * 6, -21.5, 6, 8 + (i % 2), 1.5, i % 2 ? p.c2 : sh(p.c1, 0.92));
    if(p.lv >= 1){ g.lineWidth = 1.3; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(-10, -46); g.quadraticCurveTo(0, -42, 10, -46); g.stroke(); } if(p.lv >= 2) gem(g, 1, -36, 2.4, p.gem); },
  heavy(g, p){ BODY.armor(g, Object.assign({}, p, {lv: Math.max(p.lv, 1)})); fill(g, () => { g.ellipse(-10, -45, 7, 5.5, 0.2, 0, 7); }, sh(p.c1, 0.85)); },
  scale(g, p){ BODY.armor(g, p); g.save(); g.beginPath(); rrPath(g, -12, -47.5, 24, 22, 7); g.clip(); g.strokeStyle = sh(p.c1, 0.65); g.lineWidth = 0.6; for(let y = -46, j = 0; y < -26; y += 3.4, j++) for(let x = -12 + (j % 2 ? 1.8 : 0); x < 13; x += 3.6){ g.beginPath(); g.arc(x, y, 1.9, 0, Math.PI); g.stroke(); } g.restore(); if(p.lv >= 2) gem(g, 1, -36, 2.4, p.gem); },
  robe(g, p){ fill(g, () => { g.moveTo(-11.5, -47.5); g.lineTo(11.5, -47.5); g.quadraticCurveTo(13, -30, 15 + p.lv * 0.5, -6); g.lineTo(-15 - p.lv * 0.5, -6); g.quadraticCurveTo(-13, -30, -11.5, -47.5); }, p.c1);
    g.lineWidth = 2.2; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(5, -47); g.lineTo(9, -6); g.stroke(); belt(g, -27, p.c2, p.lv >= 1 ? p.trim : null);
    if(p.lv >= 1){ g.lineWidth = 1.6; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(-15, -7); g.lineTo(15, -7); g.stroke(); } for(let i = 0; i < p.lv; i++) star4(g, -8 + i * 4, -14 + (i % 2) * 3, 1.6, p.c3 || '#FFD43B'); if(p.lv >= 2) gem(g, 2, -40, 2.4, p.gem); },
  chef(g, p){ chest(g, p.c1); g.fillStyle = sh(p.c1, 0.75); [[-2, -43], [-2, -37], [-2, -31], [5, -43], [5, -37], [5, -31]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 0.9, 0, 7); g.fill(); });
    rect(g, -10, -27, 20, 19, 2.5, p.c2); g.lineWidth = 1.2; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(-10, -27); g.lineTo(10, -27); g.stroke();
    fill(g, () => { g.moveTo(4, -48); g.lineTo(10, -46); g.lineTo(13, -40); g.lineTo(6, -43); g.closePath(); }, p.c3 || '#FF4D6D'); if(p.lv >= 1) rect(g, -6, -21, 7, 5, 1.2, sh(p.c2, 0.8)); if(p.lv >= 2) gem(g, 0, -17, 2.2, p.gem); },
  tunic(g, p){ fill(g, () => { g.moveTo(-11.5, -47.5); g.lineTo(11.5, -47.5); g.lineTo(13, -14); g.lineTo(5, -16); g.lineTo(0, -12); g.lineTo(-5, -16); g.lineTo(-13, -14); g.closePath(); }, p.c1);
    fill(g, () => { g.moveTo(-3, -47.5); g.lineTo(3, -47.5); g.lineTo(1, -40); g.closePath(); }, sh(p.c1, 0.7)); belt(g, -25, p.c2, p.trim); g.lineWidth = 2.2; g.strokeStyle = p.c2; g.beginPath(); g.moveTo(-10, -46); g.lineTo(9, -26); g.stroke();
    if(p.lv >= 1){ g.lineWidth = 1; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(-13, -15); g.lineTo(-5, -17); g.lineTo(0, -13); g.lineTo(5, -17); g.lineTo(13, -15); g.stroke(); } if(p.lv >= 2) gem(g, 0, -36, 2.2, p.gem); },
  gi(g, p){ chest(g, p.c1); g.lineWidth = 2.6; g.strokeStyle = p.c2; g.beginPath(); g.moveTo(-6, -47); g.lineTo(5, -28); g.moveTo(6, -47); g.lineTo(0, -38); g.stroke(); belt(g, -26, p.trim); if(p.lv >= 1) fill(g, () => { g.moveTo(-12, -24); g.lineTo(-18, -14); g.lineTo(-15, -12); g.lineTo(-10, -22); }, p.trim); if(p.lv >= 2) gem(g, 6, -24.5, 2, p.gem); },
  hakama(g, p){ BODY.gi(g, p); fill(g, () => { g.moveTo(-12, -24); g.lineTo(12, -24); g.lineTo(16, -3); g.lineTo(1, -3); g.lineTo(0, -12); g.lineTo(-1, -3); g.lineTo(-16, -3); g.closePath(); }, p.c3 || sh(p.c1, 0.6)); g.strokeStyle = sh(p.c3 || p.c1, 0.4); g.lineWidth = 0.5; [-9, -5, 5, 9].forEach(x => { g.beginPath(); g.moveTo(x * 0.8, -23); g.lineTo(x * 1.25, -4); g.stroke(); });
    if(p.lv >= 3) fill(g, () => { g.moveTo(-13, -47); g.lineTo(-17, -24); g.lineTo(-11, -24); g.closePath(); }, p.trim); },
  vest(g, p){ chest(g, p.c3 || '#F4F4F4'); [[-12, 8], [4, 8]].forEach(([x, w]) => rect(g, x, -47.5, w, 23, 2.5, p.c1)); belt(g, -24, p.c2, p.trim);
    [[-9, -27, '#9AA6B2'], [-4, -28, p.trim], [8, -28, '#9AA6B2']].slice(0, 1 + p.lv).forEach(([x, y, c]) => rect(g, x, y, 2.4, 7, 1, c));
    if(p.lv >= 2){ g.save(); g.translate(-7, -38); g.strokeStyle = p.trim; g.lineWidth = 1.4; g.beginPath(); for(let i = 0; i < 8; i++){ const a = i / 8 * 6.283; g.moveTo(0, 0); g.lineTo(Math.cos(a) * 3, Math.sin(a) * 3); } g.stroke(); g.restore(); gem(g, -7, -38, 1.6, p.gem); } },
  coat(g, p){ fill(g, () => { g.moveTo(-11.5, -47.5); g.lineTo(11.5, -47.5); g.lineTo(13.5, -10); g.lineTo(2, -10); g.lineTo(0, -24); g.lineTo(-2, -10); g.lineTo(-13.5, -10); g.closePath(); }, p.c1);
    fill(g, () => { g.moveTo(-1, -47.5); g.lineTo(6, -47.5); g.lineTo(2, -36); g.closePath(); }, p.c3 || '#F4F4F4'); g.fillStyle = p.trim; [-41, -35, -29].forEach(y => { g.beginPath(); g.arc(3.5, y, 0.95, 0, 7); g.fill(); });
    if(p.lv >= 1){ g.lineWidth = 1.2; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(-13.5, -11); g.lineTo(-2, -11); g.moveTo(2, -11); g.lineTo(13.5, -11); g.stroke(); } belt(g, -26, p.c2, null); if(p.lv >= 2) gem(g, -6, -40, 2, p.gem); },
  brawl(g, p){ rect(g, -11.5, -47.5, 23, 22, 6, p.c1); rect(g, -12.5, -27, 25, 6, 2, p.trim); fill(g, () => { g.moveTo(-12, -22); g.lineTo(12, -22); g.lineTo(13, -11); g.lineTo(1.5, -11); g.lineTo(0, -16); g.lineTo(-1.5, -11); g.lineTo(-13, -11); g.closePath(); }, p.c2);
    if(p.lv >= 1){ g.lineWidth = 1; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(-13, -12); g.lineTo(-1.5, -12); g.moveTo(1.5, -12); g.lineTo(13, -12); g.stroke(); } if(p.lv >= 2) gem(g, 0, -24, 2.4, p.gem); },
};
let ONE = -1;   // 👟 av-wear5: which foot the FEET painters draw (−1 both · 0 back · 1 front)
const FT = fn => [-5, 5].forEach((x, i) => { if(ONE < 0 || ONE === i) fn(x, i); });
const FEET = {
  boots(g, p){ FT((x, i) => { const c = i ? p.f1 : sh(p.f1, 0.85); rect(g, x - 3.6, -12 - p.lv, 7.2, 10 + p.lv, 2, c); fill(g, () => { g.ellipse(x + 1.6, -2.2, 5.4, 2.8, 0, 0, 7); }, c); g.fillStyle = p.trim; g.fillRect(x - 3.8, -12.6 - p.lv, 7.6, 1.6);
      if(p.wing && p.lv >= 2){ feather(g, x - 3, -8, 7, -2.6, '#FFFFFF'); feather(g, x - 3, -7, 6, -2.95, '#FFF4B8'); } }); },
  greaves(g, p){ FEET.boots(g, p); FT(x => rect(g, x - 2.6, -16 - p.lv, 5.6, 9, 2.4, p.trim)); },
  sandals(g, p){ FT((x, i) => { fill(g, () => { g.ellipse(x + 1.6, -1.5, 5.4, 2, 0, 0, 7); }, sh(p.f1, i ? 1 : 0.85)); g.lineWidth = 1.3; g.strokeStyle = p.f1; g.beginPath(); g.moveTo(x - 2, -4); g.lineTo(x + 4, -2); g.moveTo(x - 2, -7 - p.lv); g.lineTo(x + 2, -6 - p.lv); g.stroke(); }); },
  tabi(g, p){ FT((x, i) => { const c = i ? p.f1 : sh(p.f1, 0.85); rect(g, x - 3.2, -9, 6.4, 7, 2, c); fill(g, () => { g.ellipse(x + 1.6, -2.2, 5, 2.6, 0, 0, 7); }, c); g.lineWidth = 0.7; g.strokeStyle = sh(c, 0.5); g.beginPath(); g.moveTo(x + 4, -4.5); g.lineTo(x + 4, -1); g.stroke(); g.lineWidth = 1.2; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(x - 3.2, -8); g.lineTo(x + 3.2, -8); g.stroke(); }); },
  wraps(g, p){ FT((x, i) => { g.lineWidth = 1.6; g.strokeStyle = i ? p.f1 : sh(p.f1, 0.85); for(let j = 0; j < 3 + p.lv; j++){ g.beginPath(); g.moveTo(x - 3.4, -3.5 - j * 2.2); g.lineTo(x + 3.4, -4.5 - j * 2.2); g.stroke(); } }); },
  thrust(g, p){ FEET.boots(g, p); FT(x => { rect(g, x - 4.4, -6, 2.6, 4, 1, '#9AA6B2'); g.save(); g.globalAlpha = 0.9; fill(g, () => { g.moveTo(x - 4.2, -2); g.quadraticCurveTo(x - 3.1, 4, x - 2, -2); }, '#FFC83D', false); g.restore(); }); },
  spikes(g, p){ FEET.greaves(g, p); g.fillStyle = '#E8EEF4'; FT(x => { for(let i = 0; i < 3; i++){ g.beginPath(); g.moveTo(x - 1 + i * 2.6, 0); g.lineTo(x + i * 2.6, 2.4); g.lineTo(x + 1 + i * 2.6, 0); g.fill(); } }); },
  spring(g, p){ FEET.boots(g, p); g.lineWidth = 0.9; g.strokeStyle = p.trim; FT(x => { g.beginPath(); for(let i = 0; i < 5; i++) g.lineTo(x - 2 + (i % 2) * 6, 0.6 - i * 0.2); g.stroke(); }); },
};
// ---------- 🎒 BACK (behind the body; −x = behind) ----------
const BACK = {
  cape(g, p, t){ const s = Math.sin((t || 0) * 3) * 1.5; fill(g, () => { g.moveTo(-9, -48); g.lineTo(6, -48); g.quadraticCurveTo(-4, -26, -14 + s, -4); g.quadraticCurveTo(-20, -6 + s, -24 + s, -10); g.quadraticCurveTo(-16, -30, -9, -48); }, p.b1);
    g.lineWidth = 1.4; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(-14 + s, -4); g.quadraticCurveTo(-20, -6 + s, -24 + s, -10); g.stroke(); if(p.lv >= 3) for(let i = 0; i < 4; i++) star4(g, -18 + i * 2.5, -16 - i * 6, 1.6, p.c3 || '#FFD43B'); },
  quiver(g, p){ g.save(); g.translate(-12, -36); g.rotate(-0.35); rect(g, -3.5, -12, 7, 22, 2.5, p.b1); g.fillStyle = p.trim; g.fillRect(-3.7, -10, 7.4, 1.4); g.fillRect(-3.7, 4, 7.4, 1.4); for(let i = 0; i < 3 + p.lv; i++) feather(g, -2 + i * 1.3, -12, 6, -1.7 + i * 0.12, i % 2 ? '#FFFFFF' : p.trim); g.restore(); },
  pack(g, p){ rect(g, -21, -47, 11, 24, 3.5, p.b1); rect(g, -21, -41, 11, 6, 2, sh(p.b1, 0.8)); g.fillStyle = p.trim; g.fillRect(-17, -40, 3, 4); },
  potpack(g, p){ BACK.pack(g, p); g.lineWidth = 1.4; g.strokeStyle = '#9AA6B2'; g.beginPath(); g.moveTo(-15.5, -43); g.lineTo(-13.5, -55); g.stroke(); fill(g, () => { g.ellipse(-13, -56, 3, 2, 0.3, 0, 7); }, '#9AA6B2'); },
  scroll(g, p){ g.save(); g.translate(-12, -34); g.rotate(0.55); rect(g, -3, -16, 6, 30, 3, p.b1); g.fillStyle = p.trim; g.fillRect(-3.4, -16, 6.8, 2.6); g.fillRect(-3.4, 11.4, 6.8, 2.6); if(p.lv >= 2) fill(g, () => { g.ellipse(0, -18, 4.5, 2, 0, 0, 7); }, '#F3E9D8'); g.restore(); },
  drum(g, p){ fill(g, () => { g.ellipse(-16, -36, 7.5, 9, 0, 0, 7); }, p.b1); fill(g, () => { g.ellipse(-14.5, -36, 5, 7.4, 0, 0, 7); }, '#F3E9D8'); g.lineWidth = 0.8; g.strokeStyle = p.trim; for(let i = 0; i < 5; i++){ g.beginPath(); g.moveTo(-21, -42 + i * 3); g.lineTo(-11, -44 + i * 3.4); g.stroke(); } },
  gear(g, p){ BACK.pack(g, p); g.save(); g.translate(-15.5, -32); g.fillStyle = p.trim; g.beginPath(); for(let i = 0; i < 16; i++){ const a = i / 16 * 6.283, r = i % 2 ? 3 : 4.4; i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(r, 0); } g.closePath(); g.fill(); g.fillStyle = p.b1; g.beginPath(); g.arc(0, 0, 1.4, 0, 7); g.fill(); g.restore();
    if(p.lv >= 3){ g.lineWidth = 1; g.strokeStyle = '#9AA6B2'; g.beginPath(); g.moveTo(-15.5, -47); g.lineTo(-15.5, -56); g.stroke(); halo(g, -15.5, -57, 5, p.gem, 1.4); gem(g, -15.5, -57, 1.8, p.gem); } },
  banner(g, p){ g.lineWidth = 1.4; g.strokeStyle = '#8A6A44'; g.beginPath(); g.moveTo(-12, -24); g.lineTo(-15, -76); g.stroke(); fill(g, () => { g.moveTo(-15, -76); g.quadraticCurveTo(-26, -72, -33, -74); g.lineTo(-27, -68); g.lineTo(-33, -62); g.quadraticCurveTo(-24, -63, -14.4, -64); g.closePath(); }, p.b1); gem(g, -22, -69, 1.8, p.gem); },
  sling(g, p){ g.lineWidth = 2; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(-10, -46); g.lineTo(-18, -14); g.stroke(); g.save(); g.translate(-14, -31); g.rotate(-0.35); rect(g, -1.8, -22, 3.6, 34, 1.6, p.b1); rect(g, -2.6, 12, 5.2, 6, 1.2, p.trim); g.restore(); },
  wings(g, p, t){ const f = Math.sin((t || 0) * 5) * 0.12; [[-0.2, 1], [0.15, 0.85]].forEach(([a, sc], i) => { g.save(); g.translate(-8, -44); g.rotate(-0.9 + a + f); for(let j = 0; j < 5; j++) feather(g, 0, 0, (16 - j * 2) * sc * (1 + p.lv * 0.15) * (p.big || 1), -0.1 - j * 0.22, i ? sh(p.b1, 0.9) : p.b1); g.restore(); }); },
  kite(g, p){ [[-0.5, 1], [-0.95, 0.85]].forEach(([a, s]) => { g.save(); g.translate(-8, -44); g.rotate(a); fill(g, () => { g.moveTo(0, 0); g.lineTo(-10 * s, -14 * s); g.lineTo(-24 * s, -4 * s); g.lineTo(-12 * s, 6 * s); g.closePath(); }, p.b1); g.lineWidth = 0.6; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(0, 0); g.lineTo(-24 * s, -4 * s); g.moveTo(-10 * s, -14 * s); g.lineTo(-12 * s, 6 * s); g.stroke(); g.restore(); });
    for(let i = 0; i < 3; i++){ g.fillStyle = ['#FF8CC6', '#FFFFFF', '#FF8CC6'][i]; g.beginPath(); g.arc(-30 + i * 3, -38 + i * 4, 1.4, 0, 7); g.fill(); } },
  scoop(g, p){ BACK.pack(g, p); g.lineWidth = 1.4; g.strokeStyle = '#8A6A44'; g.beginPath(); g.moveTo(-16, -46); g.lineTo(-19, -62); g.stroke(); fill(g, () => { g.moveTo(-22, -62); g.quadraticCurveTo(-19, -70, -15, -63); g.closePath(); }, '#C9D3DE'); },
  hook(g, p){ BACK.pack(g, p); g.lineWidth = 1.2; g.strokeStyle = '#6B7A8A'; g.beginPath(); g.moveTo(-15, -47); g.quadraticCurveTo(-24, -58, -18, -62); g.stroke(); g.lineWidth = 1.8; g.strokeStyle = p.trim; g.beginPath(); g.arc(-18, -64, 3, 0.5, 4); g.stroke(); },
  tank(g, p){ rect(g, -21, -48, 9, 26, 4.5, p.b1); g.fillStyle = p.trim; g.fillRect(-21, -42, 9, 2); g.fillRect(-21, -30, 9, 2); g.lineWidth = 1; g.strokeStyle = '#6B7A8A'; g.beginPath(); g.moveTo(-14, -48); g.quadraticCurveTo(-8, -54, -4, -48); g.stroke(); },
  jet(g, p){ BACK.tank(g, p); [-19, -14].forEach(x => { g.save(); g.globalAlpha = 0.9; fill(g, () => { g.moveTo(x - 2, -22); g.quadraticCurveTo(x, -12, x + 2, -22); }, '#FFC83D', false); g.restore(); }); },
  fern(g, p, t){ BACK.cape(g, p, t); for(let i = 0; i < 6; i++){ g.save(); g.translate(-12 - i * 1.6, -40 + i * 5.5); g.rotate(-2.2); fill(g, () => { g.moveTo(0, 0); g.quadraticCurveTo(4, -3, 9, 0); g.quadraticCurveTo(4, 3, 0, 0); }, i % 2 ? '#2FB86B' : '#7ED957'); g.restore(); } },
  shell(g, p){ fill(g, () => { g.moveTo(-10, -48); g.quadraticCurveTo(-30, -44, -26, -22); g.quadraticCurveTo(-18, -18, -10, -24); g.closePath(); }, p.b1); g.lineWidth = 0.7; g.strokeStyle = sh(p.b1, 0.55); for(let i = 0; i < 5; i++){ g.beginPath(); g.moveTo(-10, -36); g.lineTo(-28 + i * 3, -26 - i * 4); g.stroke(); } },
  drumcloud(g, p){ [[-16, -50, 7], [-24, -42, 6], [-12, -40, 6]].forEach(([x, y, r]) => fill(g, () => { g.arc(x, y, r, 0, 7); }, '#EEF4FF')); fill(g, () => { g.ellipse(-18, -46, 7, 8.5, 0, 0, 7); }, p.b1); fill(g, () => { g.ellipse(-16.5, -46, 4.6, 7, 0, 0, 7); }, '#F3E9D8'); g.lineWidth = 1; g.strokeStyle = p.trim; [0, 1, 2].forEach(i => { g.beginPath(); g.arc(-16.5, -46, 2 + i * 1.6, -1.2, 1.2); g.stroke(); }); },
};
const ACC = {
  amulet(g, p){ g.lineWidth = 0.6; g.strokeStyle = p.trim; g.beginPath(); g.moveTo(-6, -47); g.quadraticCurveTo(0, -39, 6, -47); g.stroke(); gem(g, 0.5, -41.5, 2.4, p.gem); },
  scarf(g, p, t){ const s = Math.sin((t || 0) * 4) * 1.2; rect(g, -9, -49.5, 18, 4.2, 2, p.a1); fill(g, () => { g.moveTo(-8, -48); g.quadraticCurveTo(-16, -44 + s, -22, -40 + s); g.lineTo(-20, -37 + s); g.quadraticCurveTo(-14, -42, -7, -45.5); }, p.a1); },
  badge(g, p){ ACC.amulet(g, Object.assign({}, p, {gem: p.trim})); star4(g, -6, -38, 3, p.gem); },
  fang(g){ g.lineWidth = 0.7; g.strokeStyle = '#8A6A44'; g.beginPath(); g.moveTo(-6, -47); g.quadraticCurveTo(0, -38, 6, -47); g.stroke(); [-3, 0, 3].forEach((x, i) => fill(g, () => { g.moveTo(x - 1.2, -42 + Math.abs(x) * 0.4); g.lineTo(x, -37.5 + (i === 1 ? -1 : 0)); g.lineTo(x + 1.2, -42 + Math.abs(x) * 0.4); g.closePath(); }, '#F3E9D8')); },
  ring(g, p, t){ const a = (t || 0) * 1.5; for(let i = 0; i < 3; i++){ const an = a + i * 2.094, x = Math.cos(an) * 20, y = -38 + Math.sin(an) * 6; if(Math.sin(an) < 0) continue; rect(g, x - 2.4, y - 1.6, 4.8, 3.2, 1, '#C9D3DE'); g.fillStyle = p.gem; g.fillRect(x - 4.5, y - 0.6, 2, 1.2); g.fillRect(x + 2.5, y - 0.6, 2, 1.2); } g.lineWidth = 0.6; g.strokeStyle = hexA(p.gem, 0.6); g.beginPath(); g.ellipse(0, -38, 20, 6, 0, 0, Math.PI); g.stroke(); ACC.amulet(g, p); },
};
// 🛡️ OFF HAND worn items (in front of the body at the back hand, standing pose)
const OFF = {
  shield(g, p){ fill(g, () => { g.moveTo(-9, -40); g.quadraticCurveTo(-1, -42, 5, -40); g.quadraticCurveTo(5, -26, -2, -20); g.quadraticCurveTo(-9, -26, -9, -40); }, p.o1 || p.c1); g.lineWidth = 1.4; g.strokeStyle = p.trim; g.stroke(); if(p.mark && MARK[p.mark]) MARK[p.mark](g, -2, -31, p); else if(p.motif && MOTIF[p.motif]) MOTIF[p.motif](g, -2, -31, 3.2); else gem(g, -2, -31, 2.6, p.gem); },
  orb(g, p){ halo(g, -4, -30, 11, p.gem, 1.2); fill(g, () => { g.arc(-4, -30, 5.5, 0, 7); }, p.o1 || p.gem); g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(-6, -32, 1.6, 0, 7); g.fill(); if(p.mark && MARK[p.mark]) MARK[p.mark](g, -4, -30, p); else if(p.motif && MOTIF[p.motif]) MOTIF[p.motif](g, -4, -30, 3.2); },
  round(g, p){ fill(g, () => { g.arc(-3, -31, 8.5, 0, 7); }, p.o1 || p.c1); g.lineWidth = 1.4; g.strokeStyle = p.trim; g.beginPath(); g.arc(-3, -31, 7, 0, 7); g.stroke(); if(p.mark && MARK[p.mark]) MARK[p.mark](g, -3, -31, p); else if(p.motif && MOTIF[p.motif]) MOTIF[p.motif](g, -3, -31, 3.2); },
};
const PAINT = {head: HEAD, body: BODY, feet: FEET, back: BACK, acc: ACC, off: OFF};

// ===================== DATA =====================
const ELC = {fire: '#FF8A3D', water: '#3BC9DB', nature: '#7ED957', stone: '#B08A5E', wind: '#52C7AE', zap: '#5CC8FF', light: '#FFD43B', shadow: '#9B7BFF'};
const JOB_TRIM = ['#B89A6E', '#C98F4A', '#D9DEE8', '#FFD23F'];   // Lv 1 cloth → 7 bronze → 14 silver → 20 gold
const JOB_LV = [1, 7, 14, 20];
const JOBS = {
  knight: {n: 'Knight', el: 'light', oc: 5, head: 'helm', body: 'armor', feet: 'greaves', back: 'cape', c1: '#C9D3DE', c2: '#3A6FD8', crest: '#FF4D6D', b1: '#3A6FD8', sleeve: '#3A6FD8', pad: 1,
    lv0: {head: 'band', body: 'tunic', feet: 'boots', c1: '#C9A27A', c2: '#7A5A3A', sleeve: '#C9A27A', pad: 0}, names: ['Squire Padding', 'Steel Guard', 'Sky-Steel Plate', 'Dawn Paladin']},
  mage: {n: 'Mage', el: 'zap', oc: 6, head: 'wizard', body: 'robe', feet: 'sandals', back: 'cape', c1: '#7048E8', c2: '#4B2A9E', c3: '#FFD43B', b1: '#4B2A9E', sleeve: '#7048E8', lv0: {c1: '#8C7A9E', c2: '#5E4A6B'}, names: ['Apprentice Robe', 'Star Robe', 'Storm-Weave Robe', 'Comet Archmage']},
  chef: {n: 'Chef', el: 'fire', oc: 9, head: 'toque', body: 'chef', feet: 'boots', back: 'potpack', c1: '#F4F4F4', c2: '#FF9F1C', c3: '#FF4D6D', f1: '#6B4426', b1: '#C98F4A', sleeve: '#F4F4F4', lv0: {head: 'band', c2: '#C9A27A'}, names: ['Kitchen Helper', 'Line Cook', 'Ember Chef', 'Feast Master']},
  gardener: {n: 'Gardener', el: 'nature', oc: 3, head: 'sunhat', body: 'tunic', feet: 'boots', back: 'pack', c1: '#4CB963', c2: '#8A6A44', hc: '#E9C46A', f1: '#6B4426', b1: '#C9A15A', sleeve: '#4CB963', lv0: {c1: '#9BB07A'}, names: ['Seedling Overalls', 'Orchard Keeper', 'Bloom Warden', 'Grove Mother']},
  ranger: {n: 'Ranger', el: 'wind', oc: 3, head: 'hood', body: 'tunic', feet: 'boots', back: 'quiver', c1: '#3E8F3A', c2: '#6B4426', hc: '#2F6B3A', f1: '#5E4A34', b1: '#8A6A44', sleeve: '#3E8F3A', lv0: {hc: '#8A7A5A', c1: '#9A8A62'}, names: ['Trail Cloak', 'Forest Scout', 'Gale Ranger', 'Moon Rider']},
  scholar: {n: 'Scholar', el: 'water', oc: 4, head: 'beret', body: 'coat', feet: 'sandals', back: 'scroll', c1: '#1E9E9A', c2: '#5E4A34', c3: '#F4F4F4', hc: '#1E6E8A', f1: '#8A6A44', b1: '#C9A15A', sleeve: '#1E9E9A', lv0: {c1: '#8AA6A4', hc: '#6B7A8A'}, names: ['Study Smock', 'Library Coat', 'Tide-Ink Coat', 'Sage of Pages']},
  inventor: {n: 'Inventor', el: 'zap', oc: 1, head: 'goggle', body: 'vest', feet: 'boots', back: 'gear', c1: '#E2481B', c2: '#6B4426', c3: '#F4F4F4', hc: '#C98F4A', f1: '#3A2E26', b1: '#9AA6B2', sleeve: '#F4F4F4', lv0: {c1: '#B88A6A'}, names: ['Tinker Apron', 'Workshop Vest', 'Coil-Spark Rig', 'Star Engineer']},
  ninja: {n: 'Ninja', el: 'shadow', oc: 8, head: 'hood', body: 'gi', feet: 'tabi', back: 'sling', acc: 'scarf', c1: '#2B3A5E', c2: '#1B2440', hc: '#2B3A5E', f1: '#2B3A5E', b1: '#3A2E26', a1: '#E2481B', sleeve: '#2B3A5E', lv0: {c1: '#6B7A8A', hc: '#6B7A8A'}, names: ['Shadow Practice Gi', 'Night Gi', 'Smoke-Wisp Gi', 'Moonless Shinobi']},
  brawler: {n: 'Brawler', el: 'fire', oc: 0, head: 'band', body: 'brawl', feet: 'wraps', back: 'cape', c1: '#F4F4F4', c2: '#FF4D6D', hc: '#FF4D6D', f1: '#F3E9D8', b1: '#FF4D6D', lv0: {c2: '#4361EE', hc: '#4361EE'}, names: ['Gym Shorts', 'Ring Trunks', 'Blaze Fighter', 'Champion Robe']},
  summoner: {n: 'Summoner', el: 'nature', oc: 7, head: 'circlet', body: 'robe', feet: 'sandals', back: 'drum', c1: '#C2408A', c2: '#7A2A5E', c3: '#FFD43B', hc: '#7ED957', b1: '#8A5A33', sleeve: '#C2408A', lv0: {c1: '#B08AA0'}, names: ['Festival Shawl', 'Song Weaver', 'Bloom Chorus', 'Choir of Beasts']},
  smasher: {n: 'Smasher', el: 'stone', oc: 1, head: 'heavy', body: 'heavy', feet: 'greaves', back: 'pack', c1: '#A8754A', c2: '#5E4A34', c3: '#F3E9D8', f1: '#5E4A34', b1: '#8A6A44', sleeve: '#A8754A', pad: 1, lv0: {head: 'band', body: 'tunic', c1: '#B8A27A', pad: 0}, names: ['Log-Hauler Vest', 'Smith Plate', 'Quake Plate', 'Mountain Breaker']},
  lancer: {n: 'Lancer', el: 'water', oc: 4, head: 'plume', body: 'scale', feet: 'greaves', back: 'banner', c1: '#8EC9C6', c2: '#1E6E8A', crest: '#E2481B', b1: '#E2481B', sleeve: '#1E6E8A', pad: 1, lv0: {head: 'band', body: 'tunic', c1: '#A89A7A', pad: 0}, names: ['Pole Trainee', 'Scale Guard', 'Tide-Scale Lancer', 'Dragon-Reach Knight']},
  sharp: {n: 'Sharpshooter', el: 'wind', oc: 2, head: 'visorcap', body: 'coat', feet: 'boots', back: 'quiver', c1: '#B59A5E', c2: '#5E4A34', c3: '#F4F4F4', hc: '#7A6A3A', f1: '#3A2E26', b1: '#6B4426', sleeve: '#B59A5E', lv0: {c1: '#A8A08A'}, names: ['Range Cadet', 'Marksman Coat', 'Gust-Lens Coat', 'Star-Lock Hunter']},
  ronin: {n: 'Ronin', el: 'nature', oc: 5, head: 'kasa', body: 'hakama', feet: 'tabi', back: 'sling', c1: '#F4F4F4', c2: '#1E2A4A', c3: '#2B3A6B', hc: '#D9B86A', f1: '#F4F4F4', b1: '#3A2E26', sleeve: '#F4F4F4', lv0: {c3: '#6B6A7A'}, names: ['Dojo Keikogi', 'Wanderer Hakama', 'Sakura Haori', 'Moon-Petal Kabuto']},
};
const SLOT_WORD = {head: 'Hat', body: 'Outfit', feet: 'Boots', back: 'Back', acc: 'Charm', off: 'Off hand'};
const TIER_C = ['#C9CED6', '#4CB963', '#3A86FF', '#9B5DE5', '#FFD23F'];
const ISL = {
  jungle: {n: 'Jungle Trek set', isl: 'Elephant Jungle', move: 'jump', gate: 'feet', oc: 3, w: {head: {kind: 'band', c1: '#2FB86B'}, body: {kind: 'tunic'}, feet: {kind: 'spring'}, back: {kind: 'fern'}, acc: {kind: 'amulet'}, c1: '#8FBF6E', c2: '#6B4426', f1: '#8A6A44', b1: '#2FB86B', sleeve: '#8FBF6E', gem: '#C9D3DE'}, names: {head: 'Vine Band', body: 'Trek Tunic', feet: 'Spring-Step Boots', back: 'Leaf Cape', acc: 'Elephant Charm'}},
  cherry: {n: 'Cherry Festival set', isl: 'Cherry Mountain', move: 'glide', gate: 'back', oc: 7, w: {head: {kind: 'band', c1: '#FF8CC6'}, body: {kind: 'gi'}, feet: {kind: 'tabi'}, back: {kind: 'kite'}, acc: {kind: 'badge'}, c1: '#FFE3EF', c2: '#C2408A', f1: '#F4F4F4', b1: '#FF8CC6', sleeve: '#FFE3EF', gem: '#FF8CC6'}, names: {head: 'Petal Band', body: 'Festival Gi', feet: 'Cloud-Step Tabi', back: 'Kite Wings', acc: 'Drum Bell'}},
  sand: {n: 'Sun-Sand set', isl: 'Pyramid Sands', move: 'dig', gate: 'back', oc: 2, w: {head: {kind: 'hood', c1: '#E9C46A'}, body: {kind: 'robe'}, feet: {kind: 'sandals'}, back: {kind: 'scoop'}, acc: {kind: 'amulet'}, c1: '#F3E9D8', c2: '#2B5FC9', f1: '#8A6A44', b1: '#C9A15A', sleeve: '#F3E9D8', gem: '#2B5FC9'}, names: {head: 'Sand Wrap', body: 'Linen Robe', feet: 'Dune Sandals', back: 'Sand-Scoop Pack', acc: 'Lapis Charm'}},
  frost: {n: 'Frost Trail set', isl: 'Aurora North', move: 'climb', gate: 'feet', oc: 4, w: {head: {kind: 'hood', c1: '#F4F4F4'}, body: {kind: 'coat'}, feet: {kind: 'spikes'}, back: {kind: 'cape'}, acc: {kind: 'scarf'}, c1: '#8CCBF2', c2: '#4A6A8A', c3: '#FFFFFF', f1: '#4A6A8A', b1: '#2E9C8C', a1: '#FFFFFF', sleeve: '#8CCBF2', gem: '#8EE3F5'}, names: {head: 'Fur Hood', body: 'Snow Coat', feet: 'Ice-Pick Boots', back: 'Aurora Cape', acc: 'Warm Scarf'}},
  ember: {n: 'Ember Forge set', isl: 'Lava Isles', move: 'grapple', gate: 'back', oc: 0, w: {head: {kind: 'helm', c1: '#4A3A4E'}, body: {kind: 'armor'}, feet: {kind: 'boots'}, back: {kind: 'hook'}, acc: {kind: 'amulet'}, c1: '#6E2A40', c2: '#B8322A', f1: '#3A2E26', b1: '#5E4A34', sleeve: '#6E2A40', pad: '#4A3A4E', gem: '#FF8A3D'}, names: {head: 'Obsidian Helm', body: 'Ember Plate', feet: 'Lava-Walk Boots', back: 'Grapple Pack', acc: 'Ember Charm'}},
  reef: {n: 'Reef Diver set', isl: 'Coral Coast', move: 'dive', gate: 'head', oc: 6, w: {head: {kind: 'bubble'}, body: {kind: 'scale'}, feet: {kind: 'sandals'}, back: {kind: 'tank'}, acc: {kind: 'amulet'}, c1: '#3BC9DB', c2: '#1A5FA8', f1: '#2EC4B6', b1: '#F4F4F4', sleeve: '#3BC9DB', gem: '#8EE3F5'}, names: {head: 'Bubble Helm', body: 'Reef Scale', feet: 'Fin Sandals', back: 'Air Tank', acc: 'Pearl Charm'}},
  star: {n: 'Star Walker set', isl: 'Moon Base', move: 'hop', gate: 'feet', oc: 9, w: {head: {kind: 'goggle', c1: '#E8EEF4'}, body: {kind: 'vest'}, feet: {kind: 'thrust'}, back: {kind: 'jet'}, acc: {kind: 'badge'}, c1: '#4361EE', c2: '#2B2D42', c3: '#E8EEF4', f1: '#C9D3DE', b1: '#E8EEF4', sleeve: '#E8EEF4', gem: '#5CC8FF'}, names: {head: 'Star Goggles', body: 'Suit Vest', feet: 'Moon-Hop Boots', back: 'Jet Pack', acc: 'Star Badge'}},
};
const CAMPS = {
  bone: {n: 'Bone Ranger set', w: {head: {kind: 'raptor', c1: '#4CB963'}, body: {kind: 'tunic'}, feet: {kind: 'wraps'}, back: {kind: 'fern'}, acc: {kind: 'fang'}, c1: '#C9A27A', c2: '#6B4426', f1: '#C9A27A', b1: '#2FB86B', sleeve: '#C9A27A', pad: '#F3E9D8', padTrim: '#C9A27A', trim: '#F3E9D8', gem: '#7ED957', lv: 2}, names: {head: 'Raptor Hood', body: 'Bone-Shoulder Tunic', feet: 'Ridge Wraps', back: 'Fern Cape', acc: 'Fang Necklace'}},
  bolt: {n: 'Bolt Engineer set', w: {head: {kind: 'hardhat', c1: '#FFC83D'}, body: {kind: 'vest'}, feet: {kind: 'boots'}, back: {kind: 'gear'}, c1: '#FF9F1C', c2: '#5E4A34', c3: '#F4F4F4', f1: '#3A2E26', b1: '#9AA6B2', sleeve: '#F4F4F4', trim: '#C98F4A', gem: '#5CC8FF', lv: 2}, names: {head: 'Hard Hat', body: 'Tool-Belt Vest', feet: 'Works Boots', back: 'Gear Pack'}},
  spring: {n: 'Spring Keeper set', w: {head: {kind: 'leafhood', c1: '#2F8A5B'}, body: {kind: 'coat'}, feet: {kind: 'boots'}, back: {kind: 'gear'}, acc: {kind: 'badge'}, c1: '#2EC4B6', c2: '#1A5FA8', c3: '#F4F4F4', f1: '#5E4A34', b1: '#7ED957', sleeve: '#2EC4B6', trim: '#3BC9DB', gem: '#3BC9DB', lv: 3, glow: '#8EE3F5'}, names: {head: 'Leaf Hood', body: 'Keeper Coat', feet: 'Spring Boots', back: 'Filter Pack', acc: 'Water Badge'}},
};
const REG = {
  temple: {n: 'Temple Sky', m: 'kranok', c1: '#F2C230', c2: '#B8322A', oc: 2, k: {head: 'circlet', body: 'armor', feet: 'greaves', back: 'wings', off: 'shield'}, names: ['Flame Circlet', 'Lacquer Plate', 'Gilded Greaves', 'Sky Wings', 'Sun Shield', 'Core Amulet', 'Kranok Charm']},
  cherry: {n: 'Cherry Sky', m: 'sakura', c1: '#FFD6E8', c2: '#4361EE', oc: 7, k: {head: 'kabuto', body: 'scale', feet: 'tabi', back: 'cape', off: 'round'}, names: ['Thunder Kabuto', 'Petal Scale', 'Cloud Tabi', 'Thunder Cape', 'Petal Buckler', 'Core Amulet', 'Petal Charm']},
  sundisc: {n: 'Sun-Disc Sky', m: 'sundisc', c1: '#E9C46A', c2: '#2B5FC9', oc: 2, k: {head: 'hood', body: 'robe', feet: 'sandals', back: 'wings', off: 'shield'}, names: ['Sun Wrap', 'Lapis Robe', 'Dune Sandals', 'Falcon-Sky Wings', 'Disc Shield', 'Core Amulet', 'Lapis Charm']},
  aurora: {n: 'Aurora Sky', m: 'aurora', c1: '#DDF6FF', c2: '#52C7AE', oc: 4, k: {head: 'hood', body: 'coat', feet: 'spikes', back: 'cape', off: 'orb'}, names: ['Glass Hood', 'Frost Coat', 'Star-Ice Boots', 'Aurora Veil', 'Snow-Star Orb', 'Core Amulet', 'Flake Charm']},
  ember: {n: 'Ember Sky', m: 'ember', c1: '#3A2E3E', c2: '#FF8A3D', oc: 8, k: {head: 'heavy', body: 'heavy', feet: 'greaves', back: 'wings', off: 'round'}, names: ['Obsidian Crest', 'Ember Plate', 'Magma Greaves', 'Ember Wings', 'Shard Buckler', 'Core Amulet', 'Ember Charm']},
  pearl: {n: 'Pearl Sky', m: 'pearl', c1: '#FFF4E0', c2: '#FF7A8A', oc: 9, k: {head: 'circlet', body: 'scale', feet: 'sandals', back: 'shell', off: 'orb'}, names: ['Pearl Circlet', 'Nacre Scale', 'Tide Sandals', 'Shell Mantle', 'Pearl Orb', 'Core Amulet', 'Coral Charm']},
  star: {n: 'Star Sky', m: 'star', c1: '#D9DEE8', c2: '#4B3FC4', oc: 5, k: {head: 'goggle', body: 'armor', feet: 'thrust', back: 'wings', off: 'shield'}, names: ['Star Visor-Band', 'Chrome Plate', 'Comet Boots', 'Star Wings', 'Nova Shield', 'Core Amulet', 'Comet Charm']},
};
// ✦ Primes #3–#14 (Island 1 #1–#2 come later with their own art) — 🟡 working names until each island's lore round
const PRIMES = {
  3: {n: 'Thunder Drum Hammer', boss: 'Gorogoro', glow: '#5CC8FF', sig: {f: 'Drum Cloud', back: {kind: 'drumcloud'}, b1: '#E2481B', c1: '#4361EE', trim: '#FFD23F', gem: '#5CC8FF', bfx: 'drum'}, guard: {f: 'Drum-Head Shield', off: {kind: 'round', o1: '#E2481B', mark: 'drum'}, trim: '#FFD23F', gem: '#5CC8FF'}},
  4: {n: 'Storm-Feather Orb', boss: 'Kuro', glow: '#5CC8FF', sig: {f: 'Storm-Feather Orb', off: {kind: 'orb', o1: '#2B2D42', mark: 'crow'}, gem: '#5CC8FF', trim: '#C9D3DE'}, guard: {f: 'Crow-Feather Mantle', body: {kind: 'coat'}, c1: '#2B2D42', c2: '#1B2440', c3: '#5CC8FF', trim: '#C9D3DE', gem: '#5CC8FF', sleeve: '#2B2D42', deco: 'crow'}},
  5: {n: 'Riddle Sphinx Shield', boss: 'Pyramid Sands region boss', glow: '#FFD23F', sig: {f: 'Riddle Sphinx Shield', off: {kind: 'shield', o1: '#E9C46A', mark: 'qmark'}, trim: '#2B5FC9', gem: '#FFD23F'}, guard: {f: 'Glass-Ward Circlet', head: {kind: 'circlet', c1: '#E9C46A', c3: '#2B5FC9'}, trim: '#E9C46A', gem: '#2B5FC9', hdeco: 'glassdome'}},
  6: {n: 'Sun Scarab Armour', boss: 'Pyramid Sands dungeon boss', glow: '#F2C230', sig: {f: 'Sun Scarab Armour', body: {kind: 'armor'}, c1: '#1E9E9A', c2: '#2B5FC9', trim: '#F2C230', gem: '#F2C230', sleeve: '#1E9E9A', pad: '#1E9E9A', padTrim: '#F2C230', deco: 'sunbelt'}, guard: {f: 'Scarab Shell Shield', off: {kind: 'round', o1: '#1E9E9A', mark: 'scarab'}, trim: '#F2C230', gem: '#F2C230'}},
  7: {n: 'Aurora Cape', boss: 'Aurora North region boss', glow: '#7ED957', sig: {f: 'Aurora Cape', back: {kind: 'cape'}, b1: '#2E9C8C', trim: '#B57BFF', c3: '#FFFFFF', gem: '#7ED957', bfx: 'aurora'}, guard: {f: 'Aurora Mail', body: {kind: 'scale'}, c1: '#DDF6FF', c2: '#2E9C8C', trim: '#7ED957', gem: '#B57BFF', sleeve: '#DDF6FF', pad: '#DDF6FF', padTrim: '#7ED957'}},
  8: {n: 'Frost-Glide Boots', boss: 'Aurora North dungeon boss', glow: '#8EE3F5', sig: {f: 'Frost-Glide Boots', feet: {kind: 'spikes', wing: true}, f1: '#8EE3F5', trim: '#FFFFFF', gem: '#8EE3F5', deco: 'iceroad'}, guard: {f: 'Ice Mirror Shield', off: {kind: 'shield', o1: '#DDF6FF', mark: 'snowstar'}, trim: '#8EE3F5', gem: '#8EE3F5'}},
  9: {n: 'Tide Conch Staff', boss: 'Coral Coast region boss', glow: '#3BC9DB', sig: {f: 'Tide Shell Mantle', back: {kind: 'shell'}, b1: '#FFB3A0', trim: '#2EC4B6', gem: '#3BC9DB', bfx: 'bubbles'}, guard: {f: 'Conch Shield', off: {kind: 'round', o1: '#FFB3A0', mark: 'conch'}, trim: '#2EC4B6', gem: '#3BC9DB'}},
  10: {n: 'Coral Spear', boss: 'Coral Coast dungeon boss', glow: '#3BC9DB', sig: {f: 'Coral Circlet', head: {kind: 'circlet', c1: '#3BC9DB', c3: '#FFF4E0'}, trim: '#FF7A8A', gem: '#5CC8FF', hdeco: 'coral'}, guard: {f: 'Reef Shield', off: {kind: 'round', o1: '#3BC9DB', mark: 'coral'}, trim: '#FF7A8A', gem: '#5CC8FF'}},
  11: {n: 'Magma Fang Sword', boss: 'Lava Isles region boss', glow: '#FF8A3D', sig: {f: 'Magma Wings', back: {kind: 'wings', big: 1.7}, b1: '#B8322A', trim: '#FF8A3D', gem: '#FF8A3D', bfx: 'embers'}, guard: {f: 'Obsidian Fang Plate', body: {kind: 'heavy'}, c1: '#3A2E3E', c2: '#B8322A', trim: '#FF8A3D', gem: '#FF8A3D', sleeve: '#3A2E3E', pad: '#3A2E3E', padTrim: '#FF8A3D', deco: 'magma'}},
  12: {n: 'Ember Heart Mail', boss: 'Lava Isles dungeon boss', glow: '#FF8A3D', sig: {f: 'Ember Heart Mail', body: {kind: 'armor'}, c1: '#E2481B', c2: '#5E2340', trim: '#FFD23F', gem: '#FF4D6D', sleeve: '#E2481B', pad: '#E2481B', padTrim: '#FFD23F', deco: 'heart'}, guard: {f: 'Ember Lid Shield', off: {kind: 'round', o1: '#9AA6B2', mark: 'lid'}, trim: '#FFD23F', gem: '#FF8A3D'}},
  13: {n: 'Comet Visor', boss: 'Moon Base region boss', glow: '#5CC8FF', sig: {f: 'Comet Visor', head: {kind: 'goggle', c1: '#4B3FC4'}, trim: '#D9DEE8', gem: '#5CC8FF', hdeco: 'comet'}, guard: {f: 'Meteor Shield', off: {kind: 'shield', o1: '#4B3FC4', mark: 'nova'}, trim: '#D9DEE8', gem: '#5CC8FF'}},
  14: {n: 'Orbit Ring', boss: 'Moon Base sky dungeon', glow: '#5CC8FF', sig: {f: 'Orbit Ring', acc: {kind: 'ring'}, trim: '#D9DEE8', gem: '#5CC8FF'}, guard: {f: 'Satellite Plate', body: {kind: 'armor'}, c1: '#D9DEE8', c2: '#4B3FC4', trim: '#5CC8FF', gem: '#5CC8FF', sleeve: '#D9DEE8', pad: '#D9DEE8', padTrim: '#5CC8FF', deco: 'dish'}},
};
const STANCE = {sig: '#C9B3FF', guard: '#2FB86B'};
const GLASS = {'isl.reef': 1, 'prime.5.guard': 1};   // see-through pieces (🤿 bubble helm · 🦁 glass dome): they may TINT the face, never hide it

// ===================== LOOKS (id → a resolved look: {id, kind, name, names, slots, base, head?, body?, …}) =====================
const CACHE = {};
function mk(id, kind, name, names, base, parts, extra){ const L = Object.assign({id, kind, name, names, base}, extra || {}); L.slots = []; SLOTS.forEach(s => { if(parts[s] && parts[s].kind && PAINT[s][parts[s].kind]){ L[s] = parts[s]; L.slots.push(s); } }); return L; }
function jobLook(key, lv, el){ const J = JOBS[key]; if(!J) return null; const o = Object.assign({}, J, lv === 0 ? J.lv0 : {}), E = el && ELC[el] ? el : J.el, trim = JOB_TRIM[lv], gemc = lv >= 2 ? ELC[E] : '#C9D3DE';
  const base = {lv, c1: o.c1, c2: o.c2, c3: o.c3, trim, gem: gemc, f1: o.f1 || sh(o.c2 || o.c1, 0.9), b1: o.b1, a1: o.a1, sleeve: o.sleeve, cuff: lv >= 1 ? trim : null, pad: o.pad ? o.c1 : null, padTrim: o.pad && lv >= 1 ? trim : null, glow: lv >= 3 ? gemc : null};
  const parts = {head: {kind: (key === 'ronin' && lv === 3) ? 'kabuto' : o.head, c1: (key === 'ronin' && lv === 3) ? '#2B3A6B' : (o.hc || o.c1), crest: lv >= 2 ? o.crest : null}, body: {kind: o.body}, feet: {kind: o.feet, wing: lv >= 3}};
  if(o.back && (lv >= 2 || ['quiver', 'pack', 'potpack', 'scroll', 'drum', 'sling'].includes(o.back))) parts.back = {kind: o.back};
  if(o.acc) parts.acc = {kind: o.acc}; else if(lv >= 3) parts.acc = {kind: 'amulet'};
  const nm = J.names[lv], names = {}; SLOTS.forEach(s => names[s] = nm + ' ' + SLOT_WORD[s]);
  return mk('job.' + key + '@' + lv + (el ? '~' + E : ''), 'job', nm, names, base, parts, {job: key, lv, jobLv: JOB_LV[lv], el: E, oc: J.oc}); }
function islLook(key, tier){ const I = ISL[key]; if(!I) return null; const base = Object.assign({}, I.w); ['head', 'body', 'feet', 'back', 'acc'].forEach(s => delete base[s]);
  Object.assign(base, {lv: Math.min(3, tier), trim: TIER_C[tier], cuff: tier >= 1 ? TIER_C[tier] : null, padTrim: base.pad ? TIER_C[tier] : null, glow: tier === 4 ? '#FFD23F' : null});
  return mk('isl.' + key + '@' + tier, 'island', I.n, Object.assign({}, I.names), base, I.w, {isl: key, tier, gate: I.gate, move: I.move, oc: I.oc}); }
function campLook(key){ const C = CAMPS[key]; if(!C) return null; const base = Object.assign({cuff: C.w.trim}, C.w); ['head', 'body', 'feet', 'back', 'acc'].forEach(s => delete base[s]); return mk('camp.' + key, 'camp', C.n, Object.assign({}, C.names), base, C.w, {camp: key}); }
function skyLook(key){ const R = REG[key]; if(!R) return null; const K = R.k, gold = '#FFE9A8';
  const base = {lv: 3, c1: R.c1, c2: R.c2, c3: '#FFFFFF', trim: gold, gem: '#FFF4B8', f1: R.c1, b1: K.back === 'wings' ? (R.m === 'ember' || R.m === 'star' ? R.c2 : R.c1) : R.c2, sleeve: R.c1, cuff: gold, pad: ['armor', 'heavy', 'scale'].includes(K.body) ? R.c1 : null, padTrim: gold, o1: R.c1, core: true, motif: R.m};
  const parts = {head: {kind: K.head, c1: R.c1, crest: R.c2}, body: {kind: K.body}, feet: {kind: K.feet, wing: true}, back: {kind: K.back}, off: {kind: K.off, motif: R.m}, acc: {kind: 'amulet'}};
  const names = {head: R.names[0], body: R.names[1], feet: R.names[2], back: R.names[3], off: R.names[4], acc: R.names[5], acc2: R.names[6]};
  return mk('sky.' + key, 'sky', R.n + ' set', names, base, parts, {region: key, oc: R.oc, full: {glow: '#FFE066', cloud: true, motif: R.m}}); }
function primeLook(no, form){ const P = PRIMES[no]; if(!P || !P[form]) return null; const F = P[form], base = Object.assign({lv: 3, trim: '#FFE9A8', stance: STANCE[form], glow: P.glow}, F); SLOTS.forEach(s => delete base[s]); delete base.f;
  const names = {}; SLOTS.forEach(s => names[s] = F.f); return mk('prime.' + no + '.' + form, 'prime', F.f, names, base, F, {prime: +no, form, boss: P.boss, piece: P.n}); }
function look(id){ id = String(id || ''); if(CACHE[id] !== undefined) return CACHE[id]; let L = null, m;
  if((m = id.match(/^job\.([a-z]+)@([0-3])(?:~([a-z]+))?$/))) L = jobLook(m[1], +m[2], m[3]);
  else if((m = id.match(/^isl\.([a-z]+)@([0-4])$/))) L = islLook(m[1], +m[2]);
  else if((m = id.match(/^camp\.([a-z]+)$/))) L = campLook(m[1]);
  else if((m = id.match(/^sky\.([a-z]+)$/))) L = skyLook(m[1]);
  else if((m = id.match(/^prime\.(\d+)\.(sig|guard)$/))) L = primeLook(+m[1], m[2]);
  return (CACHE[id] = L); }
function ids(kind){ const out = [];
  if(!kind || kind === 'job') Object.keys(JOBS).forEach(k => [0, 1, 2, 3].forEach(l => out.push('job.' + k + '@' + l)));
  if(!kind || kind === 'island') Object.keys(ISL).forEach(k => [0, 1, 2, 3, 4].forEach(t => out.push('isl.' + k + '@' + t)));
  if(!kind || kind === 'camp') Object.keys(CAMPS).forEach(k => out.push('camp.' + k));
  if(!kind || kind === 'sky') Object.keys(REG).forEach(k => out.push('sky.' + k));
  if(!kind || kind === 'prime') Object.keys(PRIMES).forEach(n => ['sig', 'guard'].forEach(f => out.push('prime.' + n + '.' + f)));
  return out; }
function info(id){ const L = look(id); return L ? {id: L.id, kind: L.kind, name: L.name, names: Object.assign({}, L.names), slots: L.slots.slice(), oc: L.oc} : null; }
function params(L, s){ return Object.assign({}, L.base, L[s] || {}); }

// ===================== DRESS + the AK_WEAR hook =====================
// av.cw slots used: back (behind) · suit (body + feet + off + chest deco + stance ring) · head · neck (acc) · wrist (sleeve) — every value is DATA (strings), so Acting's clone keeps it
function dress(av, sel){ const a = JSON.parse(JSON.stringify(av || {})); a.cw = Object.assign({}, a.cw || {}); ['back', 'suit', 'head', 'neck', 'wrist', 'feet'].forEach(k => { if(a.cw[k] && a.cw[k].wr) delete a.cw[k]; });
  const per = {}; let full = null;
  if(typeof sel === 'string'){ const L = look(sel); if(!L) return a; L.slots.forEach(s => per[s] = L.id); full = L.full ? L.id : null; }
  else if(sel && typeof sel === 'object') SLOTS.forEach(s => { const L = sel[s] && look(sel[s]); if(L && L.slots.includes(s)) per[s] = L.id; });
  if(per.head) a.acc = 0;   // a worn head piece replaces the everyday cap / headphones
  const worn = Object.values(per).map(look).filter(Boolean);
  const glowL = worn.find(L => L.kind === 'prime') || (per.body && look(per.body).base.glow ? look(per.body) : null) || worn.find(L => L.base.glow && L.kind !== 'job');
  const prime = worn.find(L => L.kind === 'prime');
  const anyBack = per.back || glowL || full || worn.some(L => L.base.bfx);
  if(anyBack) a.cw.back = {td: 1, wr: per.back || '', glow: glowL ? glowL.id : '', full: full || '', bfx: (worn.find(L => L.base.bfx) || {id: ''}).id};
  if(per.body || per.feet || per.off || prime || worn.some(L => L.base.core || L.base.deco)) a.cw.suit = {td: 1, wr: {body: per.body || '', feet: per.feet || '', off: per.off || ''}, stance: prime ? prime.id : '', deco: (worn.find(L => L.base.deco) || {id: ''}).id, core: (worn.find(L => L.base.core) || {id: ''}).id};
  if(per.head || full || worn.some(L => L.base.hdeco)) a.cw.head = {td: 1, wr: per.head || '', full: full || '', hdeco: (worn.find(L => L.base.hdeco) || {id: ''}).id};
  if(per.acc) a.cw.neck = {td: 1, wr: per.acc};
  if(per.feet) a.cw.feet = {td: 1, wr: per.feet};   // 👟 av-wear5: AvatarKit's feet hook draws them on the legs
  if(per.body && look(per.body).base.sleeve) a.cw.wrist = {td: 1, wr: per.body};
  return a; }
function paintPiece(g, s, id, t){ const L = look(id); if(!L || !L[s]) return false; const p = params(L, s); PAINT[s][p.kind](g, p, t); return true; }
// 👟 av-wear5: each boot is fixed to the rig — the shaft turns with the SHIN, the foot with the SHOE angle, both pivoting on the leg end (AKJ.feetAt); standing = the old picture
function feetOn(g, id, P, t){ const F = P && typeof AKJ !== 'undefined' && AKJ.feetAt ? AKJ.feetAt(P, 1) : null; if(!F){ paintPiece(g, 'feet', id, t); return; }
  const part = (f, i, ang, y0, y1) => { g.save(); g.translate(f.x, f.y); if(ang) g.rotate(ang); g.translate(i ? -5 : 5, 2); g.beginPath(); g.rect((i ? 5 : -5) - 30, y0, 60, y1 - y0); g.clip(); ONE = i; try{ paintPiece(g, 'feet', id, t); } finally { ONE = -1; } g.restore(); };
  F.forEach((f, i) => { if(Math.abs((f.s || 0) - (f.a || 0)) < 0.02){ part(f, i, f.a, -60, 30); return; } part(f, i, f.a, -5.2, 30); part(f, i, f.s, -60, -3.6); }); }
function akWear(g, slot, it, o){ if(!it || it.wr === undefined) return false; const k = o.k, t = o.t || 0; g.save();
  try{
    if(slot === 'wrist'){ const L = look(it.wr); if(L && L.base.sleeve && o.hand){ const sx = 10 * k, sy = -42 * k, hx = o.hand[0], hy = o.hand[1], ex = sx + (hx - sx) * 0.62, ey = sy + (hy - sy) * 0.62, b = L.base;
        g.lineCap = 'round'; g.lineWidth = 7 * k; g.strokeStyle = b.sleeve; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
        if(b.cuff){ g.lineWidth = 7.4 * k; g.strokeStyle = b.cuff; g.beginPath(); g.moveTo(ex - (ex - sx) * 0.12, ey - (ey - sy) * 0.12); g.lineTo(ex, ey); g.stroke(); }
        if(b.pad){ g.fillStyle = b.pad; g.beginPath(); g.ellipse(sx, sy - 1 * k, 6.4 * k, 5 * k, 0, 0, 7); g.fill(); g.lineWidth = 0.75 * k; g.strokeStyle = sh(b.pad, 0.55); g.stroke(); if(b.padTrim){ g.fillStyle = b.padTrim; g.fillRect(sx - 6 * k, sy + 2 * k, 12 * k, 1.4 * k); } } } }
    else { g.scale(k, k);
      if(slot === 'back'){ const G = it.glow && look(it.glow), F = it.full && look(it.full), B = it.bfx && look(it.bfx);
        if(F && F.full) halo(g, 0, -40, 44, F.full.glow, 0.9); else if(G) halo(g, 0, -40, 44, G.base.glow || '#FFE066', 0.9);
        if(B && BACKFX[B.base.bfx]) BACKFX[B.base.bfx](g, t);
        if(F && F.full && MOTIF[F.full.motif]) for(let i = 0; i < 6; i++){ const a = t * 0.8 + i * 1.047; MOTIF[F.full.motif](g, Math.cos(a) * 26, -40 + Math.sin(a) * 26, 3.4); }
        if(it.wr) paintPiece(g, 'back', it.wr, t); }
      if(slot === 'suit'){ const W = it.wr || {};
        if(W.feet && !o.P) paintPiece(g, 'feet', W.feet, t); /* 👟 av-wear5: an AvatarKit with the pose draws boots in the feet hook instead */ if(W.body) paintPiece(g, 'body', W.body, t);
        const D = it.deco && look(it.deco); if(D && DECO[D.base.deco]) DECO[D.base.deco](g, t);
        const C = it.core && look(it.core); if(C){ halo(g, 1, -38, 9, '#FFF4B8', 1.3); gem(g, 1, -38, 3, '#FFE066'); }
        if(W.off) paintPiece(g, 'off', W.off, t);
        const S = it.stance && look(it.stance); if(S && S.base.stance){ g.save(); g.globalAlpha = 0.85; g.lineWidth = 1.2; g.strokeStyle = S.base.stance; g.setLineDash([2, 2]); g.beginPath(); g.ellipse(0, -2, 17, 4, 0, 0, 7); g.stroke(); g.restore(); } }
      if(slot === 'head'){ if(it.wr) paintPiece(g, 'head', it.wr, t); const H = it.hdeco && look(it.hdeco); if(H && HDECO[H.base.hdeco]) HDECO[H.base.hdeco](g, t);
        const F = it.full && look(it.full); if(F && F.full && F.full.cloud){ const a = t * 2; [0, 1, 2].forEach(i => { const an = a + i * 2.1, x = Math.cos(an) * 19, y = -73 + Math.sin(an) * 4; fill(g, () => { g.arc(x, y, 2.6, 0, 7); g.arc(x + 2.6, y + 0.6, 2, 0, 7); g.arc(x - 2.6, y + 0.6, 2, 0, 7); }, '#FFFFFF'); }); } }
      if(slot === 'neck' && it.wr) paintPiece(g, 'acc', it.wr, t);
      if(slot === 'feet' && it.wr) feetOn(g, it.wr, o.P, t); }
  } catch(e){}
  g.restore(); return true; }
if(typeof window !== 'undefined'){ const prev = window.AK_WEAR; window.AK_WEAR = function(g, slot, it, o){ if(it && it.wr !== undefined) return akWear(g, slot, it, o); if(typeof prev === 'function') return prev(g, slot, it, o); }; }

// ===================== ICONS + LYING FORMS =====================
function pieceDraw(id, s, g, t){ const L = look(id); if(!L) return false; if(s === 'acc2'){ skyCharm(L, g); return true; } return paintPiece(g, s, id, t || 0.3); }
function skyCharm(L, g){ [[0, 0, 5], [5, 1, 4], [-5, 1, 4]].forEach(([x, y, r]) => fill(g, () => { g.arc(x, y - 40, r, 0, 7); }, '#FFFFFF')); feather(g, -6, -42, 9, -2.6, '#FFE9A8'); feather(g, 6, -42, 9, -0.55, '#FFE9A8'); const m = L.base.motif; if(MOTIF[m]) MOTIF[m](g, 0, -44, 4); }
function bbox(c){ const w = c.width, h = c.height, d = c.getContext('2d').getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = -1, y1 = -1; for(let y = 0; y < h; y++) for(let x = 0; x < w; x++) if(d[(y * w + x) * 4 + 3] > 8){ if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y; } return x1 < 0 ? null : {x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1}; }
function raw(id, s, scale){ const S = Math.ceil(140 * scale), c = document.createElement('canvas'); c.width = S; c.height = S; const g = c.getContext('2d'); g.translate(S / 2, S * 0.72); g.scale(scale, scale); if(s === 'acc' || s === 'acc2') g.scale(2.4, 2.4); if(s === 'acc' || s === 'acc2') g.translate(0, 18); pieceDraw(id, s, g); return c; }
const ICONS = new Map();
function icon(id, s, px){ px = px || 96; const key = id + '|' + s + '|' + px; if(ICONS.has(key)) return ICONS.get(key); const c = icon0(id, s, px); if(ICONS.size > 400) ICONS.clear(); ICONS.set(key, c); return c; }
function icon0(id, s, px){ const r = raw(id, s, 4), b = bbox(r), c = document.createElement('canvas'); c.width = px; c.height = px; if(!b) return c; const sc = Math.min(px * 0.86 / b.w, px * 0.86 / b.h); c.getContext('2d').drawImage(r, b.x0, b.y0, b.w, b.h, (px - b.w * sc) / 2, (px - b.h * sc) / 2, b.w * sc, b.h * sc); return c; }
// lying = the same picture flat on the 2.5D ground plane (2 : 1 diamond), ONE rim #2A1C14 baked round it — IsoProps rules: ≤ 50 px at zoom 1 (px = the long side)
function lying(id, s, px){ px = Math.min(px || 48, 64); const ic = icon(id, s, 128), S = Math.ceil(px * 1.6), c = document.createElement('canvas'); c.width = S; c.height = S; const q = c.getContext('2d'), k = px / 128 / 1.414;
  q.setTransform(k, k * 0.5, -k, k * 0.5, S / 2, S / 2); q.drawImage(ic, -64, -64);
  const sil = document.createElement('canvas'); sil.width = S; sil.height = S; const r = sil.getContext('2d'), id0 = q.getImageData(0, 0, S, S), sd = r.createImageData(S, S); for(let i = 3; i < id0.data.length; i += 4){ if(id0.data[i] > 40){ sd.data[i - 3] = 0x2A; sd.data[i - 2] = 0x1C; sd.data[i - 1] = 0x14; sd.data[i] = 255; } else id0.data[i] = 0; } r.putImageData(sd, 0, 0); q.setTransform(1, 0, 0, 1, 0, 0); q.putImageData(id0, 0, 0);   // faint glow tails off the ground form   // solid silhouette (soft glows count too)
  const out = document.createElement('canvas'); out.width = S; out.height = S; const o = out.getContext('2d'); for(let a = 0; a < 8; a++) o.drawImage(sil, Math.cos(a * 0.785) * 1.2, Math.sin(a * 0.785) * 1.2); o.drawImage(c, 0, 0);
  const b = bbox(out); if(!b) return out; const fin = document.createElement('canvas'); fin.width = b.w; fin.height = b.h; fin.getContext('2d').drawImage(out, b.x0, b.y0, b.w, b.h, 0, 0, b.w, b.h); return fin; }

window.AvatarWear = {VERSION, SLOTS, FACE, isGlass: id => !!GLASS[String(id).replace(/@\d$/, '')], ids, look, info, dress, icon, lying, akWear, paintPiece,
  JOBS: Object.keys(JOBS), ISLANDS: Object.keys(ISL), CAMPS: Object.keys(CAMPS), REGIONS: Object.keys(REG), PRIMES: Object.keys(PRIMES).map(Number), ELEMENTS: Object.keys(ELC), TIERS: TIER_C.slice(), JOB_LV: JOB_LV.slice(),
  _k: {HEAD, BODY, FEET, BACK, ACC, OFF, MOTIF, MARK, DECO, HDECO}};
})();
