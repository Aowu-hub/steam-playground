
// 💥 ck-1a — the Comic Kits (Manga-pop). Adds to the global `Comic` (old calls unchanged):
//   Comic.MOODS · LINES · CAMS · LAYOUTS · LETTERS (+ THAI) · BUBBLES · RECIPES · ADDONS  (each: key → item with a name; see the 📖 Kit reference in `ComicKit — full plan.md` §2b)
//   Comic.recipe(key, data)            → a filled page recipe (one of 2–4 variants, never the same twice in a row)
//   Comic.render(canvas, page, opt)    → paints a page once ({t, reveal, players}) — Comic Lab, books, result cards
//   Comic.page(page, opt)              → plays it on top of the game (panels pop in, lines / glow / sfx move, tap = skip / close) → Promise
//   Comic.pageEl(page, {w, h})         → a still page element (no overlay)
//   Comic.lang(name) / setLang(name, 'en' | 'th' | 'both')   🇹🇭 sound words per player (localStorage sp_comics_lang:<Name>)
// A page = {layout, title, mood, panels: [{who: 0 | 1 | {name, av}, act, cam, who2, act2, lines: [...], mood, tricks, marks,
//            sfx: {text, style, at: [x, y], rot, size}, bub: {text, kind, at: [x, y], tail: [x, y]}, cap, dir: [dx, dy], sepia, crowd: [...], sign}]}
// Faces / poses / marks / body tricks come from the Avatar System (`Acting`) — an `act` key, or a pose key + face key (made into a private act on the fly).
(function(){
'use strict';
if(!window.Comic || Comic.KITS) return;
const TAU = Math.PI * 2, INK = '#16161D';
function rng(seed){ let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function hashStr(s){ let h = 2166136261; s = String(s); for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const FONT_SFX = "Bangers, 'Nunito', 'Noto Sans Thai', 'Leelawadee UI', sans-serif", FONT_TXT = "'Nunito', 'Noto Sans Thai', 'Leelawadee UI', sans-serif";
(function loadFont(){ try { if(document.querySelector('link[data-ck-font]')) return; const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.ckFont = '1'; l.href = 'https://fonts.googleapis.com/css2?family=Bangers&display=swap'; document.head.appendChild(l); l.onload = () => { try { document.fonts.load('40px Bangers'); } catch(e){} }; } catch(e){} })();

/* ================= 🎨 MoodKit — the colour glow behind the action (white page, smaller colour) ================= */
const MOODS = {
  gold:  {name: '🏆 Gold win',     glow: '#FFC83D', deep: '#F28C00', pop: '#FFE14D'},
  fire:  {name: '🔥 Fire · angry', glow: '#FF6A3D', deep: '#D7263D', pop: '#FFE14D'},
  blue:  {name: '💧 Sad',          glow: '#7DB9FF', deep: '#2F5FD0', pop: '#FFFFFF'},
  power: {name: '⚡ Power',         glow: '#A66BFF', deep: '#5A2DD8', pop: '#FFE14D'},
  lucky: {name: '🍀 Lucky',        glow: '#5EE08A', deep: '#16A35A', pop: '#FFFFFF'},
  cute:  {name: '💖 Cute',         glow: '#FF8AC8', deep: '#E0408A', pop: '#FFFFFF'},
  robot: {name: '🤖 Robot',        glow: '#AEB6C8', deep: '#5B6478', pop: '#7CFFB2'},
  calm:  {name: '🌊 Calm',         glow: '#4FD6C8', deep: '#12998B', pop: '#FFFFFF'},
  shock: {name: '😱 Shock',        glow: '#FFE45C', deep: '#E63946', pop: '#FFFFFF'},
  night: {name: '🌙 Spooky-cute',  glow: '#7E6BFF', deep: '#2B2D6E', pop: '#C9F7FF'}
};
const moodOf = m => MOODS[m] || (typeof m === 'object' && m) || MOODS.gold;
function rgba(hex, a){ const h = String(hex).replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
// panel ground: white → paper gradient, a SMALLER colour glow at the action point (breathes)
function paintGround(g, w, h, mood, o, t){
  const M = moodOf(mood), cx = (o.cx != null ? o.cx : 0.5) * w, cy = (o.cy != null ? o.cy : 0.58) * h, R = Math.min(w, h) * (0.42 + 0.03 * Math.sin(t * 2.4));
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(1, '#F1EFEA'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const gl = g.createRadialGradient(cx, cy, R * 0.05, cx, cy, R); gl.addColorStop(0, rgba(M.glow, 0.85)); gl.addColorStop(0.55, rgba(M.glow, 0.35)); gl.addColorStop(1, rgba(M.glow, 0)); g.fillStyle = gl; g.fillRect(0, 0, w, h);
}

/* ================= 〰️ LineKit — manga lines + effects (each animated by t; o = {cx, cy, mood, seed, dir: [dx, dy]}) ================= */
function wedge(g, cx, cy, a, r0, r1, wd){ g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a - wd) * r1, cy + Math.sin(a - wd) * r1); g.lineTo(cx + Math.cos(a + wd) * r1, cy + Math.sin(a + wd) * r1); g.closePath(); g.fill(); }
function starPath(g, x, y, r1, r2, n, rot){ g.beginPath(); for(let i = 0; i < n * 2; i++){ const a = (rot || 0) + i * Math.PI / n, r = i % 2 ? r2 : r1; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); }
function heartPath(g, x, y, s){ g.beginPath(); g.moveTo(x, y + s); g.bezierCurveTo(x - s * 1.4, y, x - s, y - s * 1.1, x, y - s * 0.45); g.bezierCurveTo(x + s, y - s * 1.1, x + s * 1.4, y, x, y + s); g.closePath(); }
const LINES = {
  focus:    {name: 'Focus lines', tags: ['action', 'shock'], f(g, w, h, t, o){ const R = rng(o.seed + Math.floor(t * 8)), cx = o.cx * w, cy = o.cy * h, L = Math.hypot(w, h); g.fillStyle = INK; for(let i = 0; i < 70; i++){ const a = R() * TAU; wedge(g, cx, cy, a, Math.min(w, h) * (0.3 + R() * 0.15), L, 0.004 + R() * 0.012); } }},
  speed:    {name: 'Speed lines', tags: ['action', 'move'], f(g, w, h, t, o){ const R = rng(o.seed), d = o.dir || [1, 0], a = Math.atan2(d[1], d[0]); g.save(); g.translate(w / 2, h / 2); g.rotate(a); const L = Math.hypot(w, h); g.strokeStyle = INK; for(let i = 0; i < 34; i++){ const y = (R() - 0.5) * L, len = L * (0.15 + R() * 0.35), x = ((R() * L * 1.6 + t * L * 1.8) % (L * 1.6)) - L * 0.8; if(Math.abs(y) < h * 0.12 && Math.abs(x) < w * 0.25) continue; g.lineWidth = 0.8 + R() * 2.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x - len, y); g.stroke(); } g.restore(); }},
  diag:     {name: 'Diagonal action', tags: ['action'], f(g, w, h, t, o){ const R = rng(o.seed); g.strokeStyle = INK; for(let i = 0; i < 22; i++){ const x = ((R() * w * 2 + t * w * 1.2) % (w * 2)) - w * 0.5, wd = 1 + R() * 4; g.lineWidth = wd; g.beginPath(); g.moveTo(x, 0); g.lineTo(x - h * 0.8, h); g.stroke(); } }},
  up:       {name: 'Up-lines', tags: ['jump', 'power'], f(g, w, h, t, o){ const R = rng(o.seed); g.strokeStyle = INK; for(let i = 0; i < 26; i++){ const x = R() * w, y = ((R() * h * 1.5 - t * h * 1.6) % (h * 1.5) + h * 1.5) % (h * 1.5) - h * 0.25; if(Math.abs(x - o.cx * w) < w * 0.12) continue; g.lineWidth = 0.8 + R() * 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + h * (0.15 + R() * 0.3)); g.stroke(); } }},
  down:     {name: 'Down-lines (falling)', tags: ['fall', 'sad'], f(g, w, h, t, o){ const R = rng(o.seed); g.strokeStyle = INK; for(let i = 0; i < 26; i++){ const x = R() * w, y = ((R() * h * 1.5 + t * h * 1.4) % (h * 1.5)) - h * 0.25; g.lineWidth = 0.6 + R() * 1.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + h * (0.12 + R() * 0.25)); g.stroke(); } }},
  boil:     {name: 'Boil / vibration', tags: ['tense', 'angry'], f(g, w, h, t, o){ const R = rng(o.seed + Math.floor(t * 12)), cx = o.cx * w, cy = o.cy * h, r = Math.min(w, h) * 0.34; g.strokeStyle = INK; g.lineWidth = 1.6; for(let k = 0; k < 3; k++){ g.beginPath(); for(let i = 0; i <= 40; i++){ const a = i / 40 * TAU, rr = r * (1 + k * 0.14) + (R() - 0.5) * r * 0.08; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.9); } g.stroke(); } }},
  swirl:    {name: 'Swirl vortex', tags: ['dizzy', 'power'], f(g, w, h, t, o){ const cx = o.cx * w, cy = o.cy * h, L = Math.hypot(w, h) * 0.6; g.strokeStyle = INK; for(let k = 0; k < 6; k++){ g.lineWidth = 1.2 + k * 0.35; g.beginPath(); for(let i = 0; i < 80; i++){ const u = i / 80, a = u * 7 + k * TAU / 6 + t * 2.2, r = u * L; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.stroke(); } }},
  zigzag:   {name: 'Shock zig-zag', tags: ['shock'], f(g, w, h, t, o){ const cx = o.cx * w, cy = o.cy * h, r = Math.min(w, h) * (0.32 + 0.02 * Math.sin(t * 20)); g.fillStyle = '#FFFFFF'; g.strokeStyle = INK; g.lineWidth = 2.5; starPath(g, cx, cy, r * 1.25, r * 0.92, 18, t); g.fill(); g.stroke(); }},
  ripple:   {name: 'Ripple rings', tags: ['calm', 'hit'], f(g, w, h, t, o){ const cx = o.cx * w, cy = o.cy * h, L = Math.hypot(w, h) * 0.6; g.strokeStyle = INK; for(let i = 0; i < 5; i++){ const u = ((t * 0.6 + i / 5) % 1); g.globalAlpha = 1 - u; g.lineWidth = 2.5 * (1 - u) + 0.5; g.beginPath(); g.ellipse(cx, cy, u * L, u * L * 0.6, 0, 0, TAU); g.stroke(); } g.globalAlpha = 1; }},
  burst:    {name: 'Impact star burst', tags: ['hit', 'ko'], f(g, w, h, t, o){ const M = moodOf(o.mood), cx = o.cx * w, cy = o.cy * h, r = Math.min(w, h) * (0.36 + 0.03 * Math.sin(t * 14)); g.fillStyle = M.pop; g.strokeStyle = INK; g.lineWidth = 3; starPath(g, cx, cy, r, r * 0.55, 12, -Math.PI / 2 + t * 0.3); g.fill(); g.stroke(); g.fillStyle = '#FFFFFF'; starPath(g, cx, cy, r * 0.55, r * 0.32, 12, -Math.PI / 2 - t * 0.5); g.fill(); }},
  sunburst: {name: 'Sunburst rays', tags: ['win', 'hero'], f(g, w, h, t, o){ const M = moodOf(o.mood), cx = o.cx * w, cy = o.cy * h, L = Math.hypot(w, h); g.fillStyle = rgba(M.deep, 0.22); for(let i = 0; i < 16; i++) wedge(g, cx, cy, i / 16 * TAU + t * 0.25, 0, L, 0.1); }},
  sparkle:  {name: 'Sparkle field', tags: ['win', 'cute'], f(g, w, h, t, o){ const R = rng(o.seed); g.fillStyle = '#FFFFFF'; g.strokeStyle = INK; g.lineWidth = 1.2; for(let i = 0; i < 14; i++){ const x = R() * w, y = R() * h, s = (4 + R() * 7) * (0.6 + 0.4 * Math.sin(t * 5 + i)); starPath(g, x, y, s, s * 0.3, 4, 0); g.fill(); g.stroke(); } }},
  gloom:    {name: 'Gloom lines', tags: ['sad', 'lose'], f(g, w, h, t, o){ g.strokeStyle = 'rgba(22,22,29,0.55)'; g.lineWidth = 1.4; const R = rng(o.seed); for(let i = 0; i < 40; i++){ const x = R() * w, len = h * (0.2 + R() * 0.35) * (0.85 + 0.15 * Math.sin(t * 2 + i)); g.beginPath(); g.moveTo(x, 0); g.lineTo(x, len); g.stroke(); } const gr = g.createLinearGradient(0, 0, 0, h * 0.6); gr.addColorStop(0, 'rgba(40,40,60,0.35)'); gr.addColorStop(1, 'rgba(40,40,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h * 0.6); }},
  tone:     {name: 'Screentone (fine)', tags: ['calm', 'any'], f(g, w, h, t, o){ g.fillStyle = 'rgba(22,22,29,0.16)'; const s = 7; for(let y = s / 2; y < h; y += s) for(let x = (y / s % 2 ? s / 2 : 0) + s / 2; x < w; x += s){ const r = 1.3 * (0.4 + 0.6 * (y / h)); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } }},
  'tone-big': {name: 'Screentone (big pop dots)', tags: ['pop'], f(g, w, h, t, o){ const M = moodOf(o.mood); g.fillStyle = rgba(M.deep, 0.28); const s = 16; for(let y = s / 2; y < h; y += s) for(let x = (y / s % 2 ? s / 2 : 0); x < w + s; x += s){ const r = s * 0.42 * (1 - Math.hypot(x / w - o.cx, y / h - o.cy) * 0.9); if(r > 0.6){ g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } } }},
  gradient: {name: 'Gradient tone', tags: ['calm', 'night'], f(g, w, h, t, o){ const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(22,22,29,0.32)'); gr.addColorStop(0.5, 'rgba(22,22,29,0.05)'); gr.addColorStop(1, 'rgba(22,22,29,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }},
  flash:    {name: 'White flash', tags: ['hit', 'shock'], f(g, w, h, t, o){ const a = Math.max(0, 1 - (t % 1.4) * 3); g.fillStyle = 'rgba(255,255,255,' + (0.85 * a) + ')'; g.fillRect(0, 0, w, h); }},
  lightning:{name: 'Lightning', tags: ['power', 'shock'], f(g, w, h, t, o){ const R = rng(o.seed + Math.floor(t * 6)); g.strokeStyle = '#FFE14D'; g.lineWidth = Math.max(3, w * 0.012); g.shadowColor = '#FFFFFF'; g.shadowBlur = 10; for(let k = 0; k < 2; k++){ let x = w * (0.12 + k * 0.76), y = 0; g.beginPath(); g.moveTo(x, y); while(y < h * 0.75){ x += (R() - 0.5) * w * 0.14; y += h * 0.11; g.lineTo(x, y); } g.stroke(); } g.shadowBlur = 0; g.strokeStyle = INK; g.lineWidth = 1; }},
  confetti: {name: 'Confetti', tags: ['win', 'party'], f(g, w, h, t, o){ const R = rng(o.seed), cols = ['#E63946', '#2CA6DE', '#7BC74D', '#FF7EB6', '#FFC83D', '#6A3DE8']; for(let i = 0; i < 46; i++){ g.fillStyle = cols[i % cols.length]; const x = R() * w + Math.sin(t * 2 + i) * 6, y = (R() * h + t * h * 0.35) % h; g.save(); g.translate(x, y); g.rotate(R() * 6 + t * 3); g.fillRect(-4, -2, 8, 4); g.restore(); } }},
  rain:     {name: 'Rain (sad)', tags: ['sad', 'lose'], f(g, w, h, t, o){ const R = rng(o.seed); g.strokeStyle = 'rgba(60,90,160,0.55)'; g.lineWidth = 1.4; for(let i = 0; i < 60; i++){ const x = R() * w, y = (R() * h + t * h * 1.6) % h; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 10); g.stroke(); } }},
  snow:     {name: 'Snow', tags: ['calm', 'ice'], f(g, w, h, t, o){ const R = rng(o.seed); g.fillStyle = '#FFFFFF'; g.strokeStyle = 'rgba(22,22,29,0.35)'; g.lineWidth = 0.8; for(let i = 0; i < 36; i++){ const x = R() * w + Math.sin(t + i) * 8, y = (R() * h + t * h * 0.25) % h, r = 1.5 + R() * 2.5; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.stroke(); } }},
  fire:     {name: 'Fire', tags: ['fire', 'power'], f(g, w, h, t, o){ const R = rng(o.seed); for(let i = 0; i < 18; i++){ const x = (i + 0.5) / 18 * w, fh = h * (0.18 + 0.12 * Math.sin(t * 9 + i * 1.7) + R() * 0.1); const gr = g.createLinearGradient(0, h, 0, h - fh); gr.addColorStop(0, '#E63946'); gr.addColorStop(0.6, '#FF8A1A'); gr.addColorStop(1, 'rgba(255,225,77,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - w / 30, h); g.quadraticCurveTo(x - w / 60, h - fh * 0.6, x, h - fh); g.quadraticCurveTo(x + w / 60, h - fh * 0.6, x + w / 30, h); g.fill(); } }},
  bubbles:  {name: 'Bubbles', tags: ['cute', 'water'], f(g, w, h, t, o){ const R = rng(o.seed); g.strokeStyle = 'rgba(22,22,29,0.5)'; g.lineWidth = 1.2; for(let i = 0; i < 16; i++){ const x = R() * w + Math.sin(t * 2 + i) * 5, y = ((R() * h - t * h * 0.3) % h + h) % h, r = 3 + R() * 9; g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, TAU); g.fill(); } }},
  hearts:   {name: 'Hearts', tags: ['love', 'cute'], f(g, w, h, t, o){ const R = rng(o.seed); g.strokeStyle = INK; g.lineWidth = 1.2; for(let i = 0; i < 12; i++){ const x = R() * w, y = ((R() * h - t * h * 0.35) % h + h) % h, s = 4 + R() * 6; g.fillStyle = i % 3 ? '#FF6FAE' : '#FFFFFF'; heartPath(g, x, y, s); g.fill(); g.stroke(); } }},
  glitch:   {name: 'Glitch bars', tags: ['robot', 'oops'], f(g, w, h, t, o){ const R = rng(o.seed + Math.floor(t * 10)); for(let i = 0; i < 9; i++){ const y = R() * h, hh = 2 + R() * 9; g.fillStyle = ['rgba(255,0,80,0.4)', 'rgba(0,230,200,0.4)', 'rgba(60,60,255,0.32)'][i % 3]; g.fillRect((R() - 0.5) * 30, y, w, hh); } }},
  target:   {name: 'Target rings', tags: ['aim', 'ace'], f(g, w, h, t, o){ const cx = o.cx * w, cy = o.cy * h, m = Math.min(w, h); g.lineWidth = Math.max(4, m * 0.03); [0.46, 0.34, 0.22, 0.1].forEach((r, i) => { g.strokeStyle = i % 2 ? '#FFFFFF' : '#E63946'; g.beginPath(); g.arc(cx, cy, m * r * (1 + 0.04 * Math.sin(t * 6)), 0, TAU); g.stroke(); }); }}
};

/* ================= 🎥 CameraKit — where the figure sits in the panel ================= */
// size: body height / panel height (body cams) or head radius / panel height (head cams) · at: [x, y] of feet (body) / head centre (head)
const CAMS = {
  wide:   {name: 'Wide',              body: 0.46, at: [0.5, 0.9]},
  mid:    {name: 'Mid',               body: 0.84, at: [0.5, 0.98]},
  full:   {name: 'Full (fit)',        fit: true},
  close:  {name: 'Close',             head: 0.21, at: [0.5, 0.44]},
  xclose: {name: 'Extreme close',     head: 0.36, at: [0.5, 0.52]},
  eyes:   {name: 'Eyes-only strip',   head: 0.66, at: [0.5, 0.56]},
  low:    {name: 'From below (hero)', body: 1.0, at: [0.5, 1.04], sy: 1.1, horizon: 0.9},
  high:   {name: 'From above',        body: 0.4, at: [0.5, 0.78], sy: 0.9, floor: true},
  dutch:  {name: 'Dutch tilt',        body: 0.82, at: [0.5, 0.98], tilt: -0.2},
  ots:    {name: 'Over-the-shoulder', body: 0.5, at: [0.68, 0.86], ots: true},
  split:  {name: 'Split faces',       head: 0.3, split: true},
  punch:  {name: 'Punch-in zoom',     head: 0.24, at: [0.5, 0.46], punch: true},
  shake:  {name: 'Shake',             body: 0.84, at: [0.5, 0.98], shake: true}
};

/* ================= 🔲 LayoutKit — panel shapes (unit polygons, page gutter added when drawn) ================= */
// each: (portrait) → [{p: [[x, y]…], z?, broken?}] — portrait = taller than wide (phones) → stacked versions
const R4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const LAYOUTS = {
  slash3:   {name: 'Slash 3', n: 3, f: P => P ? [{p: [[0, 0], [1, 0], [1, 0.3], [0, 0.36]]}, {p: [[0, 0.36], [1, 0.3], [1, 0.64], [0, 0.7]]}, {p: [[0, 0.7], [1, 0.64], [1, 1], [0, 1]]}] : [{p: [[0, 0], [0.37, 0], [0.31, 1], [0, 1]]}, {p: [[0.37, 0], [0.7, 0], [0.64, 1], [0.31, 1]]}, {p: [[0.7, 0], [1, 0], [1, 1], [0.64, 1]]}]},
  big2:     {name: 'Big + small', n: 2, f: P => P ? [{p: R4(0, 0, 1, 0.64)}, {p: R4(0, 0.64, 1, 1)}] : [{p: [[0, 0], [0.66, 0], [0.6, 1], [0, 1]]}, {p: [[0.66, 0], [1, 0], [1, 1], [0.6, 1]]}]},
  pano:     {name: 'Panorama + 2', n: 3, f: P => [{p: R4(0, 0, 1, P ? 0.4 : 0.46)}, {p: R4(0, P ? 0.4 : 0.46, 0.5, 1)}, {p: R4(0.5, P ? 0.4 : 0.46, 1, 1)}]},
  stairs:   {name: 'Stairs', n: 3, f: P => P ? [{p: R4(0, 0, 0.7, 0.34)}, {p: R4(0.15, 0.33, 0.85, 0.67)}, {p: R4(0.3, 0.66, 1, 1)}] : [{p: R4(0, 0, 0.36, 0.62)}, {p: R4(0.33, 0.2, 0.68, 0.82)}, {p: R4(0.65, 0.38, 1, 1)}]},
  tallmid:  {name: 'Tall middle', n: 3, f: P => P ? [{p: R4(0, 0, 0.5, 0.3)}, {p: R4(0.5, 0, 1, 0.3)}, {p: R4(0, 0.3, 1, 1)}] : [{p: R4(0, 0, 0.3, 1)}, {p: R4(0.3, 0, 0.7, 1)}, {p: R4(0.7, 0, 1, 1)}]},
  diag:     {name: 'Diagonal 2', n: 2, f: P => P ? [{p: [[0, 0], [1, 0], [1, 0.4], [0, 0.6]]}, {p: [[0, 0.6], [1, 0.4], [1, 1], [0, 1]]}] : [{p: [[0, 0], [0.62, 0], [0.38, 1], [0, 1]]}, {p: [[0.62, 0], [1, 0], [1, 1], [0.38, 1]]}]},
  offset3:  {name: 'Offset (glitch)', n: 3, f: P => P ? [{p: R4(0, 0, 0.9, 0.33)}, {p: R4(0.1, 0.33, 1, 0.66)}, {p: R4(0.03, 0.66, 0.93, 1)}] : [{p: R4(0, 0.06, 0.33, 0.94)}, {p: R4(0.33, 0, 0.67, 0.88)}, {p: R4(0.67, 0.12, 1, 1)}]},
  equal3:   {name: 'Equal 3 (calm)', n: 3, f: P => P ? [{p: R4(0, 0, 1, 1 / 3)}, {p: R4(0, 1 / 3, 1, 2 / 3)}, {p: R4(0, 2 / 3, 1, 1)}] : [{p: R4(0, 0, 1 / 3, 1)}, {p: R4(1 / 3, 0, 2 / 3, 1)}, {p: R4(2 / 3, 0, 1, 1)}]},
  win4:     {name: 'Winner 4', n: 4, f: P => [{p: [[0, 0], [0.55, 0], [0.5, 0.48], [0, 0.5]]}, {p: [[0.55, 0], [1, 0], [1, 0.46], [0.5, 0.48]]}, {p: [[0, 0.5], [0.5, 0.48], [0.46, 1], [0, 1]]}, {p: [[0.5, 0.48], [1, 0.46], [1, 1], [0.46, 1]]}]},
  tall3:    {name: 'Tall 3 (phones)', n: 3, f: P => [{p: [[0, 0], [1, 0], [1, 0.31], [0, 0.35]]}, {p: [[0, 0.35], [1, 0.31], [1, 0.66], [0, 0.7]]}, {p: [[0, 0.7], [1, 0.66], [1, 1], [0, 1]]}]},
  inset:    {name: 'Inset', n: 2, f: P => [{p: R4(0, 0, 1, 1)}, {p: P ? R4(0.56, 0.04, 0.97, 0.36) : R4(0.66, 0.06, 0.97, 0.5), z: 1}]},
  borderless: {name: 'Borderless', n: 1, f: P => [{p: R4(0, 0, 1, 1), noBorder: true}]},
  broken:   {name: 'Broken border (hero bursts out)', n: 2, f: P => P ? [{p: R4(0.06, 0.16, 0.94, 0.68), broken: true}, {p: R4(0, 0.72, 1, 1)}] : [{p: R4(0.04, 0.2, 0.64, 0.97), broken: true}, {p: [[0.68, 0], [1, 0], [1, 1], [0.68, 1]]}]},
  splash:   {name: 'Splash (one big page)', n: 1, f: P => [{p: R4(0, 0, 1, 1)}]},
  versus:   {name: 'Versus 2', n: 2, f: P => P ? [{p: [[0, 0], [1, 0], [1, 0.46], [0, 0.54]]}, {p: [[0, 0.54], [1, 0.46], [1, 1], [0, 1]]}] : [{p: [[0, 0], [0.54, 0], [0.46, 1], [0, 1]]}, {p: [[0.54, 0], [1, 0], [1, 1], [0.46, 1]]}], vs: true},
  story5:   {name: 'Story 5 (comic book)', n: 5, f: P => P ? [{p: R4(0, 0, 1, 0.24)}, {p: R4(0, 0.24, 0.5, 0.5)}, {p: R4(0.5, 0.24, 1, 0.5)}, {p: R4(0, 0.5, 1, 0.76)}, {p: R4(0, 0.76, 1, 1)}] : [{p: R4(0, 0, 0.6, 0.48)}, {p: R4(0.6, 0, 1, 0.48)}, {p: [[0, 0.48], [0.36, 0.48], [0.32, 1], [0, 1]]}, {p: [[0.36, 0.48], [0.7, 0.48], [0.66, 1], [0.32, 1]]}, {p: [[0.7, 0.48], [1, 0.48], [1, 1], [0.66, 1]]}]}
};
// inset a convex polygon by d px (page gutter) — offset each edge inward, intersect neighbours
function insetPoly(pts, d){
  const n = pts.length; let area = 0; for(let i = 0; i < n; i++){ const a = pts[i], b = pts[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
  const s = area > 0 ? 1 : -1, L = pts.map((a, i) => { const b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len * s, ny = dx / len * s; return [[a[0] + nx * d, a[1] + ny * d], [b[0] + nx * d, b[1] + ny * d]]; });
  return L.map((l1, i) => { const l0 = L[(i + n - 1) % n], [p1, p2] = l0, [p3, p4] = l1, den = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
    if(Math.abs(den) < 1e-6) return p3; const u = ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / den; return [p1[0] + u * (p2[0] - p1[0]), p1[1] + u * (p2[1] - p1[1])]; });
}
function layoutPanels(key, W, H, gut){
  const Lk = LAYOUTS[key] || LAYOUTS.slash3, P = H > W * 1.1, list = Lk.f(P);
  return list.map(q => { const px = q.p.map(([x, y]) => [x * W, y * H]); const pts = insetPoly(px, gut); const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    return Object.assign({}, q, {pts, box: {x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys)}}); });
}

/* ================= 🔤 LetterKit — sound words + 🇹🇭 Thai + bubbles ================= */
const THAI = {POW: 'ปัง!', BAM: 'ปัง!', BOOM: 'ตูม!', KABOOM: 'ตูม!!', SWOOSH: 'วื้ด!', WHOOSH: 'ฟิ้ว!', ZOOM: 'ฟิ้ว!', CRACK: 'เปรี้ยง!', ZAP: 'เปรี้ยง!', PLOP: 'แปะ!', SPLAT: 'แปะ!', THUD: 'ตุ้บ!', BONK: 'โป๊ก!', WHAM: 'โครม!', CRASH: 'โครม!', DING: 'ติ๊ง!', YAY: 'เย้!', WOW: 'ว้าว!', OOPS: 'อุ๊ย!', HUH: 'ห๊ะ!?', GULP: 'อึก…', SLAM: 'ปึ้ง!', SNAP: 'แป๊ะ!', TWANG: 'ดึ๋ง!', BOING: 'ดึ๋ง!', SPIN: 'หมุนติ้ว!', HMPH: 'ชิ!', ZZZ: 'คร่อก…'};
function thaiOf(text){ const k = String(text).toUpperCase().replace(/[^A-Z]/g, ''); return THAI[k] || null; }
function lang(name){ try { return localStorage.getItem('sp_comics_lang:' + (name || 'Guest')) || 'en'; } catch(e){ return 'en'; } }
function setLang(name, v){ try { localStorage.setItem('sp_comics_lang:' + (name || 'Guest'), v); } catch(e){} }
function sfxText(text, L){ const th = thaiOf(text); if(!th || !L || L === 'en') return text; return L === 'th' ? th : text + ' ' + th; }
// draw letters one by one so styles can move each letter
const SEG = (window.Intl && Intl.Segmenter) ? new Intl.Segmenter('th', {granularity: 'grapheme'}) : null;   // Thai vowels / tone marks stay on their letter
function graphemes(t){ return SEG ? Array.from(SEG.segment(t), x => x.segment) : Array.from(t).reduce((o, c) => { if(/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/.test(c) && o.length) o[o.length - 1] += c; else o.push(c); return o; }, []); }
function letters(g, text, x, y, size, each){ g.font = size + 'px ' + (each.font || FONT_SFX); const ch = graphemes(text), ws = ch.map(c => g.measureText(c).width), tw = ws.reduce((a, b) => a + b, 0) * (each.track || 1); let cx = x - tw / 2; ch.forEach((c, i) => { each.f(c, cx + ws[i] / 2, y, i, ws[i]); cx += ws[i] * (each.track || 1); }); return tw; }
const LETTERS = {
  impact:  {name: 'Impact 3D', f(g, tx, x, y, s, t, M){ const pop = 1 + 0.06 * Math.sin(t * 9); g.lineJoin = 'round'; letters(g, tx, x, y, s * pop, {f(c, cx, cy, i){ g.textAlign = 'center'; g.textBaseline = 'middle'; for(let d = 6; d > 0; d--){ g.fillStyle = INK; g.fillText(c, cx + d * s / 70, cy + d * s / 70); } const gr = g.createLinearGradient(0, cy - s / 2, 0, cy + s / 2); gr.addColorStop(0, '#FFF27A'); gr.addColorStop(1, M ? M.deep : '#FF7A1A'); g.fillStyle = gr; g.strokeStyle = INK; g.lineWidth = s / 9; g.strokeText(c, cx, cy); g.fillText(c, cx, cy); }}); }},
  wobbly:  {name: 'Wobbly', f(g, tx, x, y, s, t){ letters(g, tx, x, y, s, {f(c, cx, cy, i){ g.save(); g.translate(cx, cy + Math.sin(t * 7 + i) * s * 0.08); g.rotate(Math.sin(t * 5 + i * 1.3) * 0.18); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = s / 8; g.fillStyle = '#FF7EB6'; g.strokeText(c, 0, 0); g.fillText(c, 0, 0); g.restore(); }}); }},
  electric:{name: 'Electric', f(g, tx, x, y, s, t){ const R = rng(Math.floor(t * 14)); letters(g, tx, x, y, s, {f(c, cx, cy){ const jx = (R() - 0.5) * s * 0.06, jy = (R() - 0.5) * s * 0.06; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#7CF4FF'; g.shadowBlur = s / 4; g.strokeStyle = INK; g.lineWidth = s / 9; g.strokeText(c, cx + jx, cy + jy); g.fillStyle = '#7CF4FF'; g.fillText(c, cx + jx, cy + jy); g.shadowBlur = 0; g.fillStyle = '#FFFFFF'; g.fillText(c, cx + jx - s * 0.02, cy + jy - s * 0.03); }}); }},
  soft:    {name: 'Soft dotted (plop)', f(g, tx, x, y, s, t){ s *= 0.8; letters(g, tx, x, y + Math.sin(t * 3) * s * 0.05, s, {font: "700 " + "'Fredoka', " + FONT_TXT, f(c, cx, cy){ g.textAlign = 'center'; g.textBaseline = 'middle'; g.setLineDash([s / 14, s / 12]); g.strokeStyle = INK; g.lineWidth = s / 14; g.fillStyle = '#E8F7FF'; g.fillText(c, cx, cy); g.strokeText(c, cx, cy); g.setLineDash([]); }}); }},
  icy:     {name: 'Icy', f(g, tx, x, y, s, t){ letters(g, tx, x, y, s, {f(c, cx, cy, i){ g.textAlign = 'center'; g.textBaseline = 'middle'; const gr = g.createLinearGradient(0, cy - s / 2, 0, cy + s / 2); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, '#6EC8FF'); g.strokeStyle = '#1D4E89'; g.lineWidth = s / 9; g.strokeText(c, cx, cy); g.fillStyle = gr; g.fillText(c, cx, cy); if(Math.sin(t * 4 + i * 2) > 0.7){ g.fillStyle = '#FFFFFF'; starPath(g, cx + s * 0.2, cy - s * 0.3, s * 0.12, s * 0.03, 4, 0); g.fill(); } }}); }},
  fire:    {name: 'Fire', f(g, tx, x, y, s, t){ letters(g, tx, x, y, s, {f(c, cx, cy, i){ const fy = cy + Math.sin(t * 12 + i * 2) * s * 0.04; g.textAlign = 'center'; g.textBaseline = 'middle'; const gr = g.createLinearGradient(0, fy - s / 2, 0, fy + s / 2); gr.addColorStop(0, '#FFE14D'); gr.addColorStop(0.55, '#FF7A1A'); gr.addColorStop(1, '#D7263D'); g.strokeStyle = INK; g.lineWidth = s / 8; g.strokeText(c, cx, fy); g.fillStyle = gr; g.fillText(c, cx, fy); }}); }},
  bubbly:  {name: 'Bubbly', f(g, tx, x, y, s, t){ letters(g, tx, x, y, s * 0.9, {font: "700 'Fredoka', " + FONT_TXT, f(c, cx, cy, i){ const by = cy - Math.abs(Math.sin(t * 6 + i * 0.8)) * s * 0.1; g.textAlign = 'center'; g.textBaseline = 'middle'; g.strokeStyle = INK; g.lineWidth = s / 7; g.lineJoin = 'round'; g.strokeText(c, cx, by); g.fillStyle = '#FF8AC8'; g.fillText(c, cx, by); g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.ellipse(cx - s * 0.12, by - s * 0.2, s * 0.08, s * 0.04, -0.5, 0, TAU); g.fill(); }}); }},
  pixel:   {name: 'Robot pixel', f(g, tx, x, y, s, t){ letters(g, tx, x, y, s * 0.8, {font: "900 'Courier New', monospace", track: 1.08, f(c, cx, cy, i){ g.textAlign = 'center'; g.textBaseline = 'middle'; const on = (Math.floor(t * 8) + i) % 9 !== 0; g.fillStyle = INK; g.fillText(c, cx + s * 0.05, cy + s * 0.05); g.fillStyle = on ? '#7CFFB2' : '#2E7D5A'; g.fillText(c, cx, cy); }}); }}
};
// draw a sound word: style key, the player's language (Thai), a pop-in scale (reveal 0..1)
function sfx(g, o, x, y, size, t, M, L, reveal){
  if(!o || !o.text) return; const st = LETTERS[o.style] || LETTERS.impact, tx = sfxText(o.text, o.lang || L), r = reveal == null ? 1 : reveal;
  const sc = r < 1 ? (r < 0.6 ? r / 0.6 * 1.25 : 1.25 - (r - 0.6) / 0.4 * 0.25) : 1; if(sc <= 0) return;
  g.save(); g.translate(x, y); g.rotate(o.rot != null ? o.rot : -0.12); g.scale(sc, sc);
  let s = size; g.font = s + 'px ' + FONT_SFX; const tw = g.measureText(tx).width; if(o.maxW && tw > o.maxW) s = s * o.maxW / tw;
  st.f(g, tx, 0, 0, s, t, M); g.restore();
}
function wrap(g, text, maxW){ const words = String(text).split(/\s+/), out = []; let line = ''; words.forEach(wd => { const tst = line ? line + ' ' + wd : wd; if(g.measureText(tst).width > maxW && line){ out.push(line); line = wd; } else line = tst; }); if(line) out.push(line); return out; }
const BUBBLES = {
  speech:   {name: 'Speech'},  shout: {name: 'Shout (jagged)'}, scream: {name: 'Scream (double jagged)'}, think: {name: 'Thought cloud'},
  whisper:  {name: 'Whisper (dashed)'}, robot: {name: 'Robot (square)'}, narration: {name: 'Narration box'}, sign: {name: 'Sign / board'}
};
function bubble(g, b, x, y, maxW, size, t, reveal){
  if(!b || !b.text) return; const kind = b.kind || 'speech', r = reveal == null ? 1 : reveal; if(r <= 0) return;
  const font = kind === 'robot' ? "900 " + size * 0.85 + "px 'Courier New', monospace" : (kind === 'shout' || kind === 'scream' ? '900 italic ' : '800 ') + size + 'px ' + FONT_TXT;
  g.save(); g.font = font; const lines = wrap(g, b.text, maxW - size * 1.4), lh = size * 1.12, tw = Math.max(...lines.map(l => g.measureText(l).width)), bw = tw + size * 1.4, bh = lines.length * lh + size * 0.9;
  const sc = r < 1 ? 0.6 + 0.4 * r + Math.sin(r * Math.PI) * 0.12 : 1; g.translate(x, y); g.scale(sc, sc);
  const tail = b.tail ? [b.tail[0] - x, b.tail[1] - y] : [-bw * 0.2, bh * 0.9];
  g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = Math.max(2, size / 7);
  if(kind === 'shout' || kind === 'scream'){
    const reps = kind === 'scream' ? 2 : 1; for(let k = reps; k >= 1; k--){ g.fillStyle = kind === 'scream' && k === 2 ? '#E63946' : '#FFE14D'; const R = rng(7 + k + Math.floor(t * 6)); g.beginPath(); const n = 18; for(let i = 0; i < n * 2; i++){ const a = i / (n * 2) * TAU, rr = i % 2 ? 1 : 1.22 + R() * 0.12, sk = k === 2 ? 1.14 : 1; g.lineTo(Math.cos(a) * bw * 0.58 * rr * sk, Math.sin(a) * bh * 0.66 * rr * sk); } g.closePath(); g.fill(); g.stroke(); }
  } else if(kind === 'think'){
    g.fillStyle = '#FFFFFF'; for(let i = 0; i < 9; i++){ const a = i / 9 * TAU; g.beginPath(); g.ellipse(Math.cos(a) * bw * 0.42, Math.sin(a) * bh * 0.4, bw * 0.24, bh * 0.32, 0, 0, TAU); g.fill(); g.stroke(); } g.beginPath(); g.ellipse(0, 0, bw * 0.5, bh * 0.5, 0, 0, TAU); g.fill();
    [[0.55, 0.12], [0.75, 0.08], [0.9, 0.05]].forEach(([u, rr]) => { g.beginPath(); g.arc(tail[0] * u, tail[1] * u + bh * 0.2 * (1 - u), size * rr * 4, 0, TAU); g.fill(); g.stroke(); });
  } else if(kind === 'narration' || kind === 'sign' || kind === 'robot'){
    g.fillStyle = kind === 'narration' ? '#FFF3A8' : kind === 'sign' ? '#E9C28B' : '#1B2330';
    if(kind === 'sign'){ g.fillStyle = '#8B5A2B'; g.fillRect(-size * 0.25, 0, size * 0.5, bh * 1.2); g.strokeRect(-size * 0.25, 0, size * 0.5, bh * 1.2); g.fillStyle = '#E9C28B'; }
    g.beginPath(); g.rect(-bw / 2, -bh / 2, bw, bh); g.fill(); g.stroke();
    if(kind === 'robot'){ g.strokeStyle = '#7CFFB2'; g.lineWidth = 1.5; g.strokeRect(-bw / 2 + 4, -bh / 2 + 4, bw - 8, bh - 8); }
  } else {
    g.fillStyle = '#FFFFFF'; if(kind === 'whisper') g.setLineDash([size / 4, size / 5]);
    g.beginPath(); g.ellipse(0, 0, bw * 0.56, bh * 0.62, 0, 0, TAU); g.fill(); g.stroke();
    g.setLineDash([]); const a = Math.atan2(tail[1], tail[0]), bx = Math.cos(a) * bw * 0.4, by = Math.sin(a) * bh * 0.45;
    g.beginPath(); g.moveTo(bx - Math.sin(a) * size * 0.45, by + Math.cos(a) * size * 0.45); g.lineTo(tail[0], tail[1]); g.lineTo(bx + Math.sin(a) * size * 0.45, by - Math.cos(a) * size * 0.45); g.fill();
    if(kind === 'whisper') g.setLineDash([size / 4, size / 5]); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(0, 0, bw * 0.53, bh * 0.58, 0, 0, TAU); g.fill();
  }
  if(kind === 'shout' || kind === 'speech' || kind === 'whisper'){ }
  g.fillStyle = kind === 'robot' ? '#7CFFB2' : INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = font;
  lines.forEach((l, i) => g.fillText(l, 0, (i - (lines.length - 1) / 2) * lh + (kind === 'sign' ? 0 : 0)));
  g.restore();
}

/* ================= 🧍 figures: Acting acts painted into cached frames per panel (never redrawn per frame) ================= */
const FIG = new Map(), HEAD = new Map();
function actKeyFor(F){
  if(F.act && window.Acting && (Acting.has('acts', F.act) || Acting.has('poses', F.act)) && !F.face && !F.tricks && !F.marks) return F.act;
  if(!window.Acting) return 'idle';
  const base = F.act && Acting.act(F.act) ? Acting.act(F.act) : {pose: F.pose || F.act || 'idle'};
  const A = Object.assign({}, base, {face: F.face || base.face, tricks: F.tricks || base.tricks, marks: F.marks || base.marks, ride: 'keep', variants: null}), key = 'ck.' + hashStr(JSON.stringify(A));
  if(!Acting.has('acts', key)) Acting.add({acts: {[key]: A}}, {by: 'comic', block: 'comic-tmp'});
  return key;
}
function headProbe(who, ak){   // where the head sits (units from the feet) + its size
  const key = hashStr(JSON.stringify(who.av || {})) + '|' + ak; if(HEAD.has(key)) return HEAD.get(key);
  let r = {hx: 0, hy: -48, hr: 15};
  try { const c = document.createElement('canvas'); c.width = 300; c.height = 300; const g = c.getContext('2d'); Acting.draw(g, who, 150, 240, 1, ak, {t: 0.3, ride: 'keep'}); const H = window.AK && AK.head;
    if(H && H.m){ const p = new DOMPoint(0, H.hy).matrixTransform(H.m); r = {hx: p.x - 150, hy: p.y - 240, hr: 15 * (H.k || 1)}; } } catch(e){}
  HEAD.set(key, r); return r;
}
// cached frames of one figure in one panel: n canvases of panel size, figure placed by the camera
function figFrames(F, who, w, h, cam, n, loop){
  const ak = actKeyFor(F), C = CAMS[cam] || CAMS.mid, dpr = Math.min(2, window.devicePixelRatio || 1);
  const key = [hashStr(JSON.stringify(who.av || {})), ak, Math.round(w), Math.round(h), cam, n, loop, F.dir || 1, F.x || '', F.y || '', F.scale || '', dpr].join('|');
  if(FIG.has(key)) return FIG.get(key);
  let k, x, y; const fit = Acting.fit(who, [ak], w, h, {ride: 'keep', dir: F.dir || 1}), box = fit.box, BH = box.t + box.b;
  if(C.head){ const hp = headProbe(who, ak); k = h * C.head / hp.hr * (F.scale || 1); const at = C.at || [0.5, 0.5]; x = w * (F.x != null ? F.x : at[0]) - hp.hx * k * (F.dir || 1); y = h * (F.y != null ? F.y : at[1]) - hp.hy * k; }
  else if(C.body){ const BW = box.l + box.r; k = Math.min(h * C.body / BH, w * 0.92 / BW) * (F.scale || 1); const at = C.at; x = w * (F.x != null ? F.x : at[0]) - (box.r - box.l) / 2 * k; y = h * (F.y != null ? F.y : at[1]) - box.b * k; }
  else { k = fit.k * (F.scale || 1); x = F.x != null ? w * F.x : fit.x; y = fit.y; }
  const out = [];
  for(let i = 0; i < n; i++){ const c = document.createElement('canvas'); c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr); const g = c.getContext('2d'); g.scale(dpr, dpr);
    if(C.sy){ g.translate(x, y); g.scale(1, C.sy); g.translate(-x, -y); }
    try { Acting.draw(g, who, x, y, k, ak, {t: (F.t0 || 0.2) + i / n * loop, ride: 'keep', dir: F.dir || 1}); } catch(e){}
    if(i === 0){ const H = window.AK && AK.head; if(H && H.m){ try { const p = new DOMPoint(0, H.hy).matrixTransform(H.m); const sc = Math.hypot(H.m.a, H.m.b) / dpr; out.face = {x: p.x / dpr, y: p.y / dpr, r: 15 * (H.k || k) * sc / (H.k ? 1 : 1), name: who.name}; } catch(e){} } }
    out.push(c); }
  { const d = F.dir || 1, sy = C.sy || 1, bl = (d > 0 ? box.l : box.r) * k, br = (d > 0 ? box.r : box.l) * k; out.body = {x: x - bl, y: y - box.t * k * sy, w: bl + br, h: (box.t + box.b) * k * sy}; }
  if(!out.face){ const hp = headProbe(who, ak); out.face = {x: x + hp.hx * k * (F.dir || 1), y: y + hp.hy * k * (C.sy || 1), r: hp.hr * k, name: who.name}; }
  if(FIG.size > 160) FIG.clear(); FIG.set(key, out); return out;
}

// a dark shape of a figure (over-the-shoulder foreground, dramatic silhouettes) — no canvas filter (Safari)
function silhouette(src){ const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#23233A'; g.fillRect(0, 0, c.width, c.height); return c; }

/* ================= 🗣️ add-ons: banter · thoughts · narrator · gags · funny-loss signs ================= */
const ADDONS = {
  banter: {name: '🗣️ Friendly rival banter', lines: {
    start: ['{A}: "Ready, {B}?" · {B}: "Born ready!"', '{A}: "Last time was luck!" · {B}: "We\'ll see~"', '{B}: "Go easy on me!" · {A}: "Nope!"'],
    revenge: ['{A}: "Revenge time, {B}!"', '{A}: "This time it\'s MY turn!"'],
    streak: ['{A}: "That\'s {N} in a row!"', '{B}: "How are you SO good?!"'],
    close: ['{A}: "Too close!!"', '{B}: "My heart!!"', '{A}: "Don\'t blink…"'],
    win: ['{B}: "Good game, {A}!" · {A}: "You too!"', '{A}: "YES! GG {B}!"', '{B}: "Rematch?!" · {A}: "Anytime!"'],
    lose: ['{A}: "Next time, {B}…"', '{A}: "I was SO close!"']}},
  thoughts: {name: '💭 Inner thoughts', lines: {
    tense: ['Don\'t miss… don\'t miss…', 'Breathe… focus…', 'Okay okay okay…'], hope: ['Please go in…', 'Come on, come on…'],
    smug: ['Too easy~', 'Hehe, watch this.'], oops: ['Wait… what?', 'That was the plan. Totally.'], think: ['Hmm… if I move here…', 'Three moves ahead…']}},
  narrator: {name: '📜 Narrator captions', lines: {
    start: ['Meanwhile…', 'It all began with one shot…', 'The family arena. Today.'], later: ['3 seconds later…', 'A few moves later…', 'Then…'],
    twist: ['Little did {A} know…', 'Nobody saw it coming…'], end: ['TO BE CONTINUED…', 'THE END… or is it?', 'Next time: the rematch!']}},
  gags: {name: '🔁 Running gags', lines: {robot: ['Recalculating…', 'Beep. Boop. Oops.', 'ERROR 404: point not found'], pet: ['(the pet is asleep)', '(the pet wants a snack)'], lucky: ['{A}\'s lucky pose — again!']}},
  funny: {name: '🤪 Funny-loss signs', lines: {sign: ['Next time!', 'Almost!!', 'Practice mode: ON', 'Oopsie daisy']}},
  flashback: {name: '🎞️ Flashback panel (sepia)'}, book: {name: '📚 My Comic Book (ck-1b)'}, cotd: {name: '🏅 Comic of the match / day (ck-1b)'}, crowd: {name: '👨‍👩‍👧 Crowd + pets react'}, moods: {name: '🎨 Emotion colours'}, thai: {name: '🇹🇭 Thai sound words'},
  dutch: {name: '🎬 Dutch angle (match point / boss)'}, sounds: {name: '🔊 Comic sounds (pop · swish · shing · voice)'}, directions: {name: '➡️ Real directions (lines follow the move)'}
};
const LAST = {};
function line(group, kind, data, seed){ const L = ((ADDONS[group] || {}).lines || {})[kind] || []; if(!L.length) return ''; const lk = group + kind; let i = seed != null ? hashStr(seed + lk) % L.length : Math.floor(Math.random() * L.length); if(L.length > 1 && i === LAST[lk]) i = (i + 1) % L.length; LAST[lk] = i; return fill(L[i], data).replace(/"/g, ""); }
function fill(s, d){ d = d || {}; return String(s).replace(/\{A\}/g, d.A || 'You').replace(/\{B\}/g, d.B || 'Robot').replace(/\{N\}/g, d.N || 3).replace(/\{W\}/g, d.W || ''); }

/* ================= 🧾 Recipes — moment → page (2–4 variants each) ================= */
const RECIPES = {
  hit: {name: '🏓 Sport hit / smash', variants: [
    {layout: 'slash3', mood: 'gold', panels: [
      {who: 0, act: 'windup', cam: 'mid', lines: ['tone'], bub: {text: '{thought:tense}', kind: 'think'}, cap: '{narr:start}'},
      {who: 0, pose: 'smash', face: 'fierce', tricks: ['smear'], cam: 'low', lines: ['speed', 'focus'], sfx: {text: 'SWOOSH!', style: 'impact'}},
      {who: 0, act: 'victory', cam: 'close', lines: ['burst'], sfx: {text: 'POW!', style: 'impact', at: [0.7, 0.3]}}]},
    {layout: 'big2', mood: 'fire', panels: [
      {who: 0, pose: 'smash', face: 'determined', tricks: ['afterimage'], cam: 'dutch', lines: ['diag', 'tone-big'], sfx: {text: 'WHAM!', style: 'fire'}},
      {who: 0, pose: 'fist-pump', face: 'joy', marks: ['sparkles'], cam: 'xclose', lines: ['sunburst'], bub: {text: 'YES!!', kind: 'shout'}}]},
    {layout: 'pano', mood: 'power', panels: [
      {who: 0, pose: 'serve-toss', face: 'focused', cam: 'wide', lines: ['up'], cap: '{narr:start}'},
      {who: 0, pose: 'smash', face: 'fierce', tricks: ['impact-flash'], cam: 'punch', lines: ['focus'], sfx: {text: 'ZAP!', style: 'electric'}},
      {who: 1, act: 'shock', cam: 'close', lines: ['zigzag'], bub: {text: 'Too fast!', kind: 'speech'}}]}]},
  ko: {name: '🥊 Fight KO', variants: [
    {layout: 'broken', mood: 'fire', panels: [
      {who: 0, pose: 'uppercut', face: 'rage-cute', tricks: ['smear', 'impact-flash'], cam: 'low', lines: ['focus', 'burst'], sfx: {text: 'KABOOM!', style: 'impact', size: 1.3}},
      {who: 1, act: 'dizzy', cam: 'close', lines: ['swirl'], bub: {text: 'Ooof…', kind: 'whisper'}}]},
    {layout: 'versus', mood: 'power', panels: [
      {who: 0, pose: 'guard', face: 'fierce', cam: 'xclose', lines: ['boil'], bub: {text: '{banter:revenge}', kind: 'shout'}},
      {who: 1, pose: 'guard', face: 'determined', cam: 'xclose', dir: -1, lines: ['boil'], bub: {text: 'Bring it!', kind: 'speech'}}]},
    {layout: 'stairs', mood: 'shock', panels: [
      {who: 0, pose: 'punch', face: 'effort', cam: 'mid', lines: ['speed'], sfx: {text: 'BAM!', style: 'impact'}},
      {who: 1, pose: 'ko-spin', face: 'dizzy', tricks: ['spirit-puff'], cam: 'shake', lines: ['burst'], sfx: {text: 'BONK!', style: 'wobbly'}},
      {who: 0, act: 'flex', cam: 'low', lines: ['sunburst'], bub: {text: 'K.O.!!', kind: 'scream'}}]}]},
  boardwin: {name: '♟️ Board-game win', variants: [
    {layout: 'equal3', mood: 'calm', panels: [
      {who: 0, act: 'think', cam: 'close', lines: ['tone'], bub: {text: '{thought:think}', kind: 'think'}},
      {who: 0, pose: 'point', face: 'smug', cam: 'mid', lines: ['focus'], sfx: {text: 'SNAP!', style: 'impact'}, cap: '{narr:later}'},
      {who: 0, act: 'cheer', cam: 'mid', who2: 1, act2: 'good-game', lines: ['confetti'], bub: {text: '{banter:win}', kind: 'speech'}}]},
    {layout: 'inset', mood: 'gold', panels: [
      {who: 0, act: 'victory', cam: 'low', lines: ['sunburst', 'sparkle'], sfx: {text: 'CHECKMATE!', style: 'impact', size: 0.8}},
      {who: 1, act: 'shock', cam: 'xclose', lines: ['zigzag'], bub: {text: 'Huh?!', kind: 'shout'}}]}]},
  miss: {name: '😱 Miss / so close', variants: [
    {layout: 'diag', mood: 'blue', panels: [
      {who: 0, pose: 'dive', face: 'effort', cam: 'wide', lines: ['speed'], sfx: {text: 'WHOOSH!', style: 'soft'}},
      {who: 0, act: 'facepalm', cam: 'close', lines: ['gloom'], bub: {text: '{thought:oops}', kind: 'think'}}]},
    {layout: 'offset3', mood: 'shock', panels: [
      {who: 0, act: 'gasp', cam: 'eyes', lines: ['focus']},
      {who: 0, pose: 'trip', face: 'shock', cam: 'mid', lines: ['diag'], sfx: {text: 'OOPS!', style: 'wobbly'}},
      {who: 0, act: 'oops', cam: 'close', lines: ['tone'], bub: {text: '{gag:robot}', kind: 'robot'}}]}]},
  comeback: {name: '👻 Comeback', variants: [
    {layout: 'stairs', mood: 'power', panels: [
      {who: 0, act: 'slump', cam: 'high', lines: ['rain'], cap: '{narr:twist}'},
      {who: 0, pose: 'power-charge', face: 'determined', tricks: ['aura'], cam: 'low', lines: ['up', 'lightning'], sfx: {text: 'ZOOM!', style: 'electric'}},
      {who: 0, act: 'hero', cam: 'low', lines: ['sunburst'], bub: {text: 'Not over yet!', kind: 'shout'}}]}]},
  winner: {name: '🏆 Match winner', variants: [
    {layout: 'win4', mood: 'gold', panels: [
      {who: 0, act: 'ready', cam: 'mid', lines: ['tone'], cap: '{narr:start}', bub: {text: '{banter:start}', kind: 'speech'}},
      {who: 0, pose: 'smash', face: 'fierce', cam: 'dutch', lines: ['speed'], sfx: {text: 'SWOOSH!', style: 'impact'}, sepia: true, cap: 'Flashback: the best shot'},
      {who: 1, act: 'shock', cam: 'close', lines: ['zigzag'], bub: {text: 'MATCH POINT!', kind: 'shout'}},
      {who: 0, act: 'victory', cam: 'low', crowd: true, lines: ['confetti', 'sunburst'], sfx: {text: 'YAY!', style: 'bubbly'}, cap: '{narr:end}'}]}]},
  funnyloss: {name: '🤪 Funny-loss', variants: [
    {layout: 'big2', mood: 'cute', panels: [
      {who: 0, pose: 'trip', face: 'dizzy', tricks: ['chibi'], cam: 'wide', lines: ['swirl'], sfx: {text: 'BOING!', style: 'bubbly'}, sign: '{funny:sign}'},
      {who: 0, act: 'shrug', cam: 'close', lines: ['sparkle'], bub: {text: '{banter:lose}', kind: 'speech'}}]}]}
};
function resolveText(s, d, seed){ return String(s).replace(/\{(thought|narr|banter|gag|funny):(\w+)\}/g, (m, grp, k) => line({thought: 'thoughts', narr: 'narrator', banter: 'banter', gag: 'gags', funny: 'funny'}[grp], k, d, seed)); }
// key → a filled page (players = [{name, av}, …]); a different variant each time
function recipe(key, data){
  data = data || {}; const R = RECIPES[key]; if(!R) return null; const vs = R.variants; let i = data.variant != null ? data.variant % vs.length : Math.floor(Math.random() * vs.length);
  if(data.variant == null && vs.length > 1 && LAST['r' + key] === i) i = (i + 1) % vs.length; LAST['r' + key] = i;
  const P = data.players || [], d = {A: (P[0] || {}).name, B: (P[1] || {}).name, N: data.streak};
  const page = JSON.parse(JSON.stringify(vs[i])); page.key = key; page.variant = i; page.players = P; page.title = data.title || R.name;
  if(data.matchPoint) page.panels.forEach(p => { if(p.cam === 'mid') p.cam = 'dutch'; });
  page.panels.forEach((p, j) => { ['cap', 'sign'].forEach(f => { if(p[f]) p[f] = resolveText(p[f], d, data.seed != null ? data.seed + j : null); }); if(p.bub) p.bub.text = resolveText(p.bub.text, d, data.seed != null ? data.seed + j : null); if(data.dir && p.lines) p.dirv = data.dir; });
  if(data.crowd) page.crowd = data.crowd;
  return page;
}

/* ================= 🖼️ render a page ================= */
const SEP = {};
function whoOf(page, v){ if(v == null) return null; if(typeof v === 'object') return v; const P = page.players || []; return P[v] || {name: v ? 'Robot' : 'You', av: window.defaultAvatar ? defaultAvatar(v ? 'Robot' : 'You') : {}}; }
function drawPanel(g, page, Q, P, i, t, o){
  const {w, h} = Q.box, M = moodOf(P.mood || page.mood), L = o.lang || 'en', seed = 97 + i * 31 + (page.variant || 0) * 7;
  const C = CAMS[P.cam] || CAMS.mid, focus = C.head ? [0.5, 0.42] : [0.5, 0.58];
  g.save(); g.translate(Q.box.x, Q.box.y);
  // clip to the panel shape (broken: the figure is drawn again over the border)
  g.save(); g.beginPath(); Q.pts.forEach(([x, y], k) => k ? g.lineTo(x - Q.box.x, y - Q.box.y) : g.moveTo(x - Q.box.x, y - Q.box.y)); g.closePath(); g.clip();
  let shake = [0, 0]; if(C.shake){ const R = rng(Math.floor(t * 20) + i); shake = [(R() - 0.5) * w * 0.03, (R() - 0.5) * h * 0.03]; }
  if(C.tilt){ g.translate(w / 2, h / 2); g.rotate(C.tilt); g.scale(1.25, 1.25); g.translate(-w / 2, -h / 2); }
  g.translate(shake[0], shake[1]);
  paintGround(g, w, h, M, {cx: focus[0], cy: focus[1]}, t);
  const lo = {cx: focus[0], cy: focus[1], mood: M, seed, dir: P.dirv || (P.dir === -1 ? [-1, 0] : [1, 0])};
  (P.lines || []).forEach(k => { const Lk = LINES[k]; if(Lk){ g.save(); try { Lk.f(g, w, h, t, lo); } catch(e){} g.restore(); } });
  if(C.horizon){ g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(0, h * C.horizon); g.lineTo(w, h * C.horizon); g.stroke(); }
  if(C.floor){ g.strokeStyle = 'rgba(22,22,29,0.25)'; g.lineWidth = 1; for(let k = -6; k <= 6; k++){ g.beginPath(); g.moveTo(w / 2 + k * w * 0.08, h * 0.55); g.lineTo(w / 2 + k * w * 0.2, h); g.stroke(); } g.fillStyle = 'rgba(22,22,29,0.18)'; g.beginPath(); g.ellipse(w / 2, h * 0.78, w * 0.12, h * 0.03, 0, 0, TAU); g.fill(); }
  // figures
  const who = whoOf(page, P.who), who2 = whoOf(page, P.who2), n = o.still ? 1 : 6, loop = 1.2, fi = o.still ? 0 : Math.floor((t / loop * n) % n);
  const figs = [], faces = [], bodies = [];
  const addFace = (fr, tf) => { const f = fr && fr.face; if(!f) return; let x = f.x, y = f.y, r = f.r; if(tf) [x, y, r] = tf(x, y, r);
    const B = fr.body; if(B){ let [bx, by] = tf ? tf(B.x, B.y, 0) : [B.x, B.y], [bx2, by2] = tf ? tf(B.x + B.w, B.y + B.h, 0) : [B.x + B.w, B.y + B.h]; if(C.tilt){ const cx = w / 2, cy = h / 2; [bx, bx2] = [cx + (bx - cx) * 1.25, cx + (bx2 - cx) * 1.25]; [by, by2] = [cy + (by - cy) * 1.25, cy + (by2 - cy) * 1.25]; } bodies.push({x: bx, y: by, w: bx2 - bx, h: by2 - by}); }
    if(C.tilt){ const dx = (x - w / 2) * 1.25, dy = (y - h / 2) * 1.25, c = Math.cos(C.tilt), sn = Math.sin(C.tilt); x = w / 2 + dx * c - dy * sn; y = h / 2 + dx * sn + dy * c; r *= 1.25; }
    faces.push({x, y, r, name: f.name}); };
  if(window.Acting && who){
    if(C.split){ const f1 = figFrames({act: P.act, pose: P.pose, face: P.face, tricks: P.tricks, marks: P.marks, x: 0.27, y: 0.52}, who, w, h, 'split', n, loop), f2 = who2 || whoOf(page, 1) ? figFrames({act: P.act2 || P.act, pose: P.pose, face: P.face2 || P.face, x: 0.73, y: 0.52, dir: -1}, who2 || whoOf(page, 1), w, h, 'split', n, loop) : null;
      g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(w * 0.53, 0); g.lineTo(w * 0.47, h); g.lineTo(0, h); g.clip(); g.drawImage(f1[fi], 0, 0, w, h); g.restore(); if(f2){ g.save(); g.beginPath(); g.moveTo(w * 0.53, 0); g.lineTo(w, 0); g.lineTo(w, h); g.lineTo(w * 0.47, h); g.clip(); g.drawImage(f2[fi], 0, 0, w, h); g.restore(); }
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(w * 0.53, 0); g.lineTo(w * 0.47, h); g.stroke(); addFace(f1); addFace(f2); }
    else {
      if(C.ots && (who2 || whoOf(page, 1))){ const fo = figFrames({act: P.act2 || 'idle', dir: 1, x: 0.16, y: 0.86}, who2 || whoOf(page, 1), w, h, 'xclose', 1, loop), sil = silhouette(fo[0]); g.save(); g.globalAlpha = 0.92; g.drawImage(sil, 0, 0, w, h); g.restore(); }
      if(who2 && !C.ots){ const f2 = figFrames({act: P.act2 || 'idle', dir: -1, x: 0.78, scale: 0.8}, who2, w, h, C.head ? 'mid' : P.cam || 'mid', n, loop); figs.push(f2); }
      const f1 = figFrames({act: P.act, pose: P.pose, face: P.face, tricks: P.tricks, marks: P.marks, dir: P.dir || 1, x: who2 && !C.ots ? (C.head ? 0.4 : 0.32) : undefined}, who, w, h, C.punch ? 'punch' : (P.cam || 'mid'), n, loop); figs.push(f1);
      let z = 1; if(C.punch){ const u = clamp((t - (o.t0 || 0)) / 0.35, 0, 1); z = 0.62 + 0.38 * (1 - Math.pow(1 - u, 3)); }
      if(!Q.broken) figs.forEach(fr => { g.save(); if(z !== 1){ g.translate(w / 2, h * 0.45); g.scale(z, z); g.translate(-w / 2, -h * 0.45); } g.drawImage(fr[fi], 0, 0, w, h); g.restore(); addFace(fr, z !== 1 ? (x, y, r) => [w / 2 + (x - w / 2) * z, h * 0.45 + (y - h * 0.45) * z, r * z] : null); });
    }
    // 👨‍👩‍👧 crowd reacts in a corner
    const crowd = P.crowd && (page.crowd || []).slice(0, 3); if(crowd && crowd.length) crowd.forEach((cw, k) => { const fr = figFrames({act: Acting.pick(k % 2 ? 'happy' : 'win', {seed: cw.name + k}), x: 0.07 + k * 0.13, scale: 0.72, y: 1.0}, cw, w, h, 'wide', 1, loop); g.drawImage(fr[0], 0, 0, w, h); addFace(fr); });
  }
  if(P.ball){ const at0 = P.ballAt || [0.78, 0.3], br = Math.max(5, Math.min(w, h) * 0.055), d = P.dirv || [-1, 0.3];   // the ball never sits on a face either
    const fcs = faces.map(f => [f.x, f.y, f.r]), free = q => fcs.every(([fx, fy, fr]) => Math.hypot(q[0] * w - fx, q[1] * h - fy) > fr * 1.15 + br * 1.6);
    const at = [at0, [1 - at0[0], at0[1]], [at0[0], 0.72], [1 - at0[0], 0.72], [0.15, 0.18], [0.85, 0.82], [0.5, 0.12]].find(free) || at0, bx = w * at[0], by = h * at[1];   // 🎾 the game's own ball / puck / shuttle, flying
    g.save(); g.strokeStyle = INK; g.lineCap = 'round'; for(let k = 1; k <= 3; k++){ g.lineWidth = Math.max(1.5, br * 0.22) / k; g.beginPath(); g.moveTo(bx - d[0] * br * (1.5 + k * 0.6), by - d[1] * br * (1.5 + k * 0.6) + (k - 2) * br * 0.5); g.lineTo(bx - d[0] * br * (3 + k * 1.3), by - d[1] * br * (3 + k * 1.3) + (k - 2) * br * 0.5); g.stroke(); }
    try { if(typeof P.ball === 'function') P.ball(g, bx, by, br, t); else { g.fillStyle = '#F2FF7A'; g.lineWidth = 2; g.beginPath(); g.arc(bx, by, br, 0, TAU); g.fill(); g.stroke(); } } catch(e){} g.restore(); }
  if(P.sepia){ g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(-w, -h, w * 3, h * 3); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#E8C99A'; g.fillRect(-w, -h, w * 3, h * 3); g.restore(); }
  g.restore();   // unclip
  if(Q.broken && window.Acting && who){ const f1 = figFrames({act: P.act, pose: P.pose, face: P.face, tricks: P.tricks, marks: P.marks, dir: P.dir || 1, dir2: 1}, who, w, h, P.cam || 'low', n, loop); g.save(); g.translate(w / 2, h); g.scale(1.22, 1.22); g.translate(-w / 2, -h); g.drawImage(f1[fi], 0, 0, w, h); g.restore(); faces.length = 0; addFace(f1, (x, y, r) => [w / 2 + (x - w / 2) * 1.22, h + (y - h) * 1.22, r * 1.22]); }
  g.restore();
  // border
  if(!Q.noBorder){ g.save(); g.lineJoin = 'miter'; g.strokeStyle = INK; g.lineWidth = Math.max(3, Math.min(o.W, o.H) * 0.009); g.beginPath(); Q.pts.forEach(([x, y], k) => k ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.stroke(); g.restore(); }
  // words are NOT drawn here: render() draws every panel first, then all words on top (Aowu 2026-11-13: "text needs to be on the front")
  const m = Math.min(w, h), X = Q.box.x, Y = Q.box.y, rv = o.reveal == null ? 1 : clamp(o.reveal, 0, 1);
  const pf = f => ({x: f.x + X, y: f.y + Y, r: f.r, name: f.name}), F = faces.map(pf), BODY = bodies.map(b => ({x: b.x + X, y: b.y + Y, w: b.w, h: b.h}));
  const FZ = F.map(f => ({x: f.x - f.r * 0.85, y: f.y - f.r * 0.5, w: f.r * 1.7, h: f.r * 1.25}));
  const words = function(g, S){
    // hard: eyes + mouth of everyone, other panels lying over this one, words already placed · soft: bodies (free background is better)
    const hard = (S.allFaces || FZ).concat(S.blockers), B = {x: X, y: Y, w, h, poly: Q.pts}; if(S.faces) S.faces.push(...FZ);
    const spot = (bw, bh, pref, cands) => place(bw, bh, pref, B, hard, BODY, S.placed, cands);
    // no free spot at full size (tight close-ups on phones) → the words get smaller before they ever cover a face
    const fitSpot = (measure, prefOf) => { let pick = null; for(const sc of [1, 0.84, 0.7, 0.58]){ const z = measure(sc), c = place(z.w, z.h, prefOf(z), B, hard, BODY, S.placed, null, true), cov = place.cover;
        if(!pick || cov < pick.cov - 0.005) pick = {sc, z, c, cov}; if(cov <= 0.02) break; } S.placed.push({x: pick.c[0] - pick.z.w / 2, y: pick.c[1] - pick.z.h / 2, w: pick.z.w, h: pick.z.h}); return pick; };
    g.save(); g.globalAlpha = S.alpha == null ? 1 : S.alpha;
    if(P.cap){ g.save(); const fs = clamp(m * 0.065, 9, 16); g.font = '800 ' + fs + 'px ' + FONT_TXT; const tw = Math.min(g.measureText(P.cap).width + 12, w - 12), ch = fs * 1.5;
      const c = spot(tw, ch, [X + 6 + tw / 2, Y + 6 + ch / 2], [[X + 6 + tw / 2, Y + 6 + ch / 2], [X + w - 6 - tw / 2, Y + 6 + ch / 2], [X + 6 + tw / 2, Y + h - 6 - ch / 2], [X + w - 6 - tw / 2, Y + h - 6 - ch / 2]]);
      const cx = c[0] - tw / 2, cy = c[1] - ch / 2; g.fillStyle = '#FFF3A8'; g.strokeStyle = INK; g.lineWidth = 2; g.fillRect(cx, cy, tw, ch); g.strokeRect(cx, cy, tw, ch); g.fillStyle = INK; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(P.cap, cx + 6, cy + ch / 2, tw - 12); g.restore(); }
    if(P.bub && P.bub.text){ const parts = String(P.bub.text).split(' · ').slice(0, 2), fs = clamp(m * 0.075, 10, 22), mw = Math.min(w * (parts.length > 1 ? 0.5 : 0.62), 260);
      parts.forEach((tx, j) => { const kind = j ? 'speech' : P.bub.kind;
        const sp0 = speakerFace(tx, F, j), sp = sp0 && !sp0.off ? sp0 : null;
        const prefOf = sz => P.bub.at && !j ? [X + w * P.bub.at[0], Y + h * P.bub.at[1]] : sp ? [sp.x + (sp.x < X + w / 2 ? 1 : -1) * (sp.r + sz.w / 2), sp.y - sp.r * 0.9 - sz.h * 0.3] : [X + w * (j ? 0.3 : 0.68), Y + h * (j ? 0.72 : 0.2)];
        const pk = fitSpot(sc => bubbleSize(g, {text: tx, kind}, mw * (0.5 + sc / 2), fs * sc), prefOf), c = pk.c, sz = pk.z, bfs = fs * pk.sc, bmw = mw * (0.5 + pk.sc / 2); let tail = [c[0] - sz.w * 0.2, c[1] + sz.h * 0.9];
        if(sp0 && sp0.off) tail = [c[0] < X + w / 2 ? X - 4 : X + w + 4, clamp(c[1] + sz.h * 0.5, Y, Y + h)];
        else if(sp){ const dx = c[0] - sp.x, dy = c[1] - sp.y, d = Math.hypot(dx, dy) || 1; tail = [sp.x + dx / d * sp.r * 1.02, sp.y + dy / d * sp.r * 1.02 + sp.r * 0.25]; }
        bubble(g, {text: tx, kind, tail}, c[0], c[1], bmw, bfs, t, j ? Math.max(0, rv - 0.3) / 0.7 : rv); }); }
    if(P.sfx && P.sfx.text){ const at = P.sfx.at || [0.66, 0.24]; let sz = m * 0.22 * (P.sfx.size || 1); g.font = sz + 'px ' + FONT_SFX; const tw0 = g.measureText(sfxText(P.sfx.text, P.sfx.lang || L)).width * 1.12; if(tw0 > w * 0.9) sz *= w * 0.9 / tw0;
      const tw = Math.min(tw0, w * 0.9), pk = fitSpot(sc => ({w: tw * sc, h: sz * 1.15 * sc}), () => [X + w * at[0], Y + h * at[1]]); sfx(g, P.sfx, pk.c[0], pk.c[1], sz * pk.sc, t, M, L, rv); }
    if(P.sign){ const fs = m * 0.08, sz = bubbleSize(g, {text: P.sign, kind: 'sign'}, w * 0.4, fs), c = spot(sz.w, sz.h * 1.8, [X + w * 0.78, Y + h * 0.5]); bubble(g, {text: P.sign, kind: 'sign'}, c[0], c[1] - sz.h * 0.4, w * 0.4, fs, t, rv); }
    g.restore();
  };
  words.faces = FZ; return words;
}
// the size a bubble takes (same maths as bubble())
function bubbleSize(g, b, maxW, size){ const kind = b.kind || 'speech'; g.save(); g.font = kind === 'robot' ? "900 " + size * 0.85 + "px 'Courier New', monospace" : (kind === 'shout' || kind === 'scream' ? '900 italic ' : '800 ') + size + 'px ' + FONT_TXT;
  const lines = wrap(g, b.text, maxW - size * 1.4), bw = Math.max(...lines.map(l => g.measureText(l).width)) + size * 1.4, bh = lines.length * size * 1.12 + size * 0.9; g.restore();
  const k = {speech: [1.12, 1.24], whisper: [1.12, 1.24], shout: [1.5, 1.7], scream: [1.7, 1.95], think: [1.32, 1.44]}[kind] || [1, 1]; return {w: bw * k[0], h: bh * k[1]}; }
// who is talking: "Ben: …" → Ben's face; else the first figure (second bubble → the other one)
function speakerFace(tx, faces, j){ if(!faces.length) return null; const m = /^\s*([^:]{1,20}):/.exec(tx); if(m){ const f = faces.find(q => q.name && q.name.toLowerCase() === m[1].trim().toLowerCase()); if(f) return f; if(faces.some(q => q.name)) return {off: true}; } return faces[Math.min(j, faces.length - 1)]; }   // a name that isn't in this panel = talking from off-panel
function inPoly(q, P){ let inside = false; for(let i = 0, j = P.length - 1; i < P.length; j = i++){ const [xi, yi] = P[i], [xj, yj] = P[j]; if(((yi > q[1]) !== (yj > q[1])) && q[0] < (xj - xi) * (q[1] - yi) / (yj - yi) + xi) inside = !inside; } return inside; }
// best free spot for a w×h box (page px): never over eyes / mouth, other panels or words already placed; prefers empty background over bodies; close to where it wants to be
function place(bw, bh, pref, B, hard, soft, placed, cands, dry){
  const ov = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const list = (cands || []).slice(); if(!cands){ for(let i = 0; i <= 10; i++) for(let k = 0; k <= 10; k++) list.push([B.x + bw / 2 + 4 + (B.w - bw - 8) * i / 10, B.y + bh / 2 + 4 + (B.h - bh - 8) * k / 10]); list.push(pref); }
  const A = bw * bh; let best = pref, bs = 1e18;
  list.forEach(([cx, cy]) => { cx = B.w > bw + 8 ? clamp(cx, B.x + bw / 2 + 4, B.x + B.w - bw / 2 - 4) : B.x + B.w / 2; cy = B.h > bh + 8 ? clamp(cy, B.y + bh / 2 + 4, B.y + B.h - bh / 2 - 4) : B.y + B.h / 2;
    const r = {x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh}; let sc = Math.hypot(cx - pref[0], cy - pref[1]) / Math.hypot(B.w, B.h) * 0.6;
    if(B.poly){ const pts = [[r.x, r.y], [r.x + bw, r.y], [r.x, r.y + bh], [r.x + bw, r.y + bh], [cx, r.y], [cx, r.y + bh], [r.x, cy], [r.x + bw, cy]]; sc += pts.filter(q => !inPoly(q, B.poly)).length * 4; }
    hard.forEach(z => { sc += ov(r, z) / Math.min(A, z.w * z.h) * 60; }); placed.forEach(p => { sc += ov(r, p) / Math.min(A, p.w * p.h) * 60; }); soft.forEach(z => { sc += ov(r, z) / A * 1.2; });
    if(sc < bs){ bs = sc; best = [cx, cy]; } });
  const rb = {x: best[0] - bw / 2, y: best[1] - bh / 2, w: bw, h: bh}; place.cover = Math.max(0, ...hard.map(z => ov(rb, z) / (z.w * z.h)), ...placed.map(p => ov(rb, p) / Math.min(A, p.w * p.h)));
  if(!dry) placed.push(rb); return best;
}
function render(cv, page, o){
  o = o || {}; const dpr = o.dpr || Math.min(2, window.devicePixelRatio || 1), W = o.w || cv.clientWidth || cv.width / dpr, H = o.h || cv.clientHeight || cv.height / dpr;
  if(cv.width !== Math.round(W * dpr)){ cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  const g = cv.getContext('2d'), t = o.t || 0; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  const tb = page.title ? clamp(Math.min(W, H) * 0.07, 18, 34) : 0;
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H);
  if(tb){ g.fillStyle = INK; g.fillRect(0, 0, W, tb); g.font = Math.round(tb * 0.78) + 'px ' + FONT_SFX; g.fillStyle = '#FFE14D'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(page.title, W / 2, tb / 2 + 1, W - 16); }
  g.save(); g.translate(0, tb); const PH = H - tb, gut = clamp(Math.min(W, PH) * 0.012, 3, 8), Ls = layoutPanels(page.layout, W, PH, gut);
  const order = Ls.map((q, i) => i).sort((a, b) => (Ls[a].z || 0) - (Ls[b].z || 0));
  const jobs = [], placed = [];
  order.forEach(i => { const Q = Ls[i], P = page.panels[i]; if(!P) return; const rv = o.reveal == null ? 1 : o.reveal * page.panels.length - i; if(rv <= 0) return;
    g.save(); if(rv < 1){ const s = 0.85 + 0.15 * rv, cx = Q.box.x + Q.box.w / 2, cy = Q.box.y + Q.box.h / 2; g.globalAlpha = clamp(rv * 2, 0, 1); g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy); }
    const words = drawPanel(g, page, Q, P, i, t, Object.assign({}, o, {W, H: PH, reveal: rv < 1 ? rv : (o.wordReveal != null ? o.wordReveal : 1)})); g.restore();
    // panels lying over this one (an inset) block its words
    const blockers = Ls.filter((q, j) => j !== i && (q.z || 0) > (Q.z || 0)).map(q => ({x: q.box.x - 4, y: q.box.y - 4, w: q.box.w + 8, h: q.box.h + 8}));
    if(words) jobs.push({words, blockers, alpha: clamp(rv * 2, 0, 1)}); });
  if((LAYOUTS[page.layout] || {}).vs && Ls.length === 2){ const a = Ls[0].pts, cx = (a[1][0] + a[2][0]) / 2, cy = (a[1][1] + a[2][1]) / 2, vs = Math.min(W, PH) * 0.16; sfx(g, {text: 'VS', style: 'impact', rot: -0.1}, cx, cy, vs, t, MOODS.fire, 'en', 1); placed.push({x: cx - vs * 0.7, y: cy - vs * 0.6, w: vs * 1.4, h: vs * 1.2}); }
  // 💬 every word on the FRONT, after all pictures (never under another panel, never over a face or another word)
  const faceZones = [], allFaces = [].concat(...jobs.map(J => J.words.faces || [])); jobs.slice().sort((a, b) => b.blockers.length - a.blockers.length).forEach(J => J.words(g, {placed, blockers: J.blockers, alpha: J.alpha, faces: faceZones, allFaces}));
  LAST.layout = {placed, faces: faceZones, panels: Ls.map(q => q.box), tb};   // for tests (comickit.js): words vs faces
  g.restore();
}

/* ================= ▶ play a page over the game ================= */
let PLAY = null;
function sound(k){ try { if(window.UISound) UISound.play(k); } catch(e){} }
function page(pg, o){
  o = o || {}; if(PLAY) PLAY.close();
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = Math.min(innerWidth * 0.96, o.maxW || 760), H = Math.min(innerHeight * 0.86, W * (innerHeight > innerWidth * 1.1 ? 1.55 : 0.62)), wrapEl = document.createElement('div');
  wrapEl.className = 'ck-layer' + (o.noTap ? '' : ' tap'); wrapEl.innerHTML = '<div class="ck-page" style="width:' + Math.round(W) + 'px;height:' + Math.round(H) + 'px"><canvas></canvas>' + (o.noTap ? '' : '<div class="ck-hint ck-page-hint">tap to skip</div>') + '</div>'; document.body.appendChild(wrapEl);
  const cv = wrapEl.querySelector('canvas'), n = pg.panels.length, per = o.per || 0.55, t0 = performance.now(), L = o.lang || lang(((pg.players || [])[0] || {}).name);
  let skip = reduce, done = false, raf = 0, lastPop = -1;
  const total = n * per + (o.hold || 2.6);
  return new Promise(res => {
    const close = () => { if(done) return; done = true; cancelAnimationFrame(raf); wrapEl.remove(); PLAY = null; res(); };
    PLAY = {close};
    if(!o.noTap) wrapEl.onclick = () => { if(!skip){ skip = true; } else close(); };
    const frame = now => { const t = (now - t0) / 1000, rv = skip ? 1 : clamp(t / (n * per), 0, 1), k = Math.floor(rv * n - 0.001);
      if(k > lastPop && !reduce){ lastPop = k; sound(k === n - 1 ? 'success' : 'pop'); }
      render(cv, pg, {w: W, h: H, t: reduce ? 0.3 : t, reveal: rv, lang: L, still: reduce});
      if(skip && !reduce && t > total + 4) return close(); if(!skip && t > total) return close();
      raf = requestAnimationFrame(frame); };
    raf = requestAnimationFrame(frame);
    sound('whoosh'); setTimeout(close, (total + 6) * 1000);
  });
}
function pageEl(pg, o){ o = o || {}; const w = o.w || 360, h = o.h || Math.round(w * 0.62), c = document.createElement('canvas'); c.className = 'ck-pagecv'; c.style.width = w + 'px'; c.style.height = h + 'px'; render(c, pg, {w, h, t: o.t || 0.4, still: true, lang: o.lang}); return c; }

/* ================= 🏓 ck-1c — the old calls (impact / strip / stripEl) now draw Manga-pop pages with the kits ================= */
// each premade design → a page plan: layout, mood, lines + cameras per panel (the game's panels bring who / pose / words / caption / ball)
const DESIGN_PAGE = {
  pow:      {layout: 'slash3', mood: 'fire',  cams: ['mid', 'low', 'close'],  lines: [['tone'], ['speed', 'focus'], ['burst']]},
  divemiss: {layout: 'pano',   mood: 'blue',  cams: ['mid', 'wide', 'close'], lines: [['tone'], ['speed'], ['gloom']]},
  bullseye: {layout: 'slash3', mood: 'gold',  cams: ['close', 'mid', 'mid'],  lines: [['tone'], ['target'], ['sunburst']]},
  rally:    {layout: 'equal3', mood: 'lucky', cams: ['wide', 'wide', 'mid'],  lines: [['speed'], ['speed'], ['sparkle']]},
  power:    {layout: 'stairs', mood: 'power', cams: ['mid', 'low', 'close'],  lines: [['boil'], ['lightning', 'up'], ['burst']]},
  jump:     {layout: 'tallmid', mood: 'gold', cams: ['mid', 'low', 'close'],  lines: [['up'], ['up', 'focus'], ['burst']]},
  slowmo:   {layout: 'equal3', mood: 'calm',  cams: ['close', 'mid', 'mid'],  lines: [['tone'], ['bubbles'], ['ripple']]},
  winner:   {layout: 'win4',   mood: 'gold',  cams: ['mid', 'dutch', 'close', 'low'], lines: [['tone'], ['speed'], ['zigzag'], ['confetti', 'sunburst']]},
  glitch:   {layout: 'offset3', mood: 'robot', cams: ['close', 'mid', 'xclose'], lines: [['tone'], ['glitch'], ['glitch']]},
  close:    {layout: 'stairs', mood: 'shock', cams: ['close', 'mid', 'mid'],  lines: [['boil'], ['focus'], ['sparkle']]},
  dive:     {layout: 'slash3', mood: 'calm',  cams: ['wide', 'mid', 'low'],   lines: [['speed'], ['speed', 'focus'], ['confetti']]}
};
// old pose names → Acting (pose + face, or a whole act)
const OLD_POSE = {ready: {pose: 'ready', face: 'determined'}, smash: {pose: 'smash', face: 'fierce', tricks: ['smear']}, dive: {pose: 'dive', face: 'effort', tricks: ['dust']},
  cheer: {act: 'cheer'}, sad: {act: 'slump'}, jump: {pose: 'jump-up', face: 'determined', tricks: ['stretch']}, glitch: {pose: 'robot-glitch', face: 'glitch'},
  facepalm: {act: 'embarrassed'}};   // ck-2d: losing = a funny facepalm, never a cry
// old words → a sound word (short shout / "Sla… WORD!") or a bubble (a sentence)
function wordsOf(w, i, n, design){
  if(!w) return {}; const t = String(w), shout = /^[A-Z][a-z]+…/.test(t) || (t.length <= 14 && /[!?]$/.test(t) && t === t.toUpperCase());
  if(shout && i > 0){ const pre = (/^([A-Z][a-z]+…)/.exec(t) || [])[1], big = t.replace(/^[A-Z][a-z]+…\s*/, ''); return {sfx: {text: big || t, style: design === 'glitch' ? 'pixel' : design === 'slowmo' ? 'soft' : design === 'power' ? 'electric' : design === 'divemiss' ? 'wobbly' : 'impact'}, bub: pre && big ? {text: pre, kind: 'shout'} : null}; }
  return {bub: {text: t, kind: i === 0 && /…$/.test(t) ? 'think' : (/!!/.test(t) ? 'shout' : 'speech')}};
}
function pageFromDesign(design, o){
  o = o || {}; const D = DESIGN_PAGE[design] || DESIGN_PAGE.pow, old = (Comic.DESIGNS || {})[design] || {}, panels = (o.panels || []).slice(0, design === 'winner' ? 4 : 3), n = panels.length || (design === 'winner' ? 4 : 3);
  const pg = {layout: n === 4 ? 'win4' : n === 2 ? 'big2' : n === 1 ? 'splash' : D.layout, mood: o.mood || D.mood, title: o.title || old.name || '', panels: [], players: [], key: 'design.' + design};
  for(let i = 0; i < n; i++){ const q = panels[i] || {}, pose = OLD_POSE[q.pose] || OLD_POSE.ready, w = wordsOf(q.words != null ? q.words : (old.words || [])[i], i, n, design);
    const P = Object.assign({cam: D.cams[i] || 'mid', lines: (D.lines[i] || ['tone']).slice()}, pose, w);
    if(q.who) P.who = q.who; if(q.who2){ P.who2 = q.who2; const p2 = OLD_POSE[q.pose2] || OLD_POSE.ready; if(p2.act) P.act2 = p2.act; else P.act2 = p2.pose; }
    if(q.cap) P.cap = q.cap; if(q.ball){ P.ball = q.ball; if(q.ballX != null) P.ballAt = [q.ballX, q.ballY != null ? q.ballY : 0.3]; } if(q.icon && !q.who) P.who = {name: '', av: window.defaultAvatar ? defaultAvatar(q.icon) : {}};
    if(design === 'winner' && i === 1) P.sepia = true; if(design === 'winner' && i === n - 1) P.crowd = true;
    pg.panels.push(P); }
  if(o.crowd) pg.crowd = o.crowd; LAST.page = pg; return pg;
}
const OLD = {impact: Comic.impact, strip: Comic.strip, stripEl: Comic.stripEl, busy: Comic.busy, clear: Comic.clear};
const kitsReady = () => !!(window.Acting && window.drawAvatar);
// 🗞️ strip → a Manga-pop page (panels pop in, tap = skip, tap again = close; closes by itself after o.ms)
// 📚 a match-winner page goes into the Comic Book of every real player in it (games need no change: the game id comes from the page's GAME_ID / SP_PAGE)
function bookWinner(pg, only){ try {
  if(!window.google || !google.script || !Comic.save || o_noBook) return; const gid = (typeof GAME_ID !== 'undefined' && GAME_ID) || window.SP_PAGE || 'game';
  const all = Array.from(new Set(pg.panels.map(p => p.who && p.who.name).concat(pg.panels.map(p => p.who2 && p.who2.name)).filter(n => n && !/robot|🤖|^bot\b/i.test(n)))).slice(0, 4), names = Array.isArray(only) ? all.filter(n => only.includes(n)).concat(only.filter(n => !all.includes(n))).slice(0, 4) : all;
  const cast = Array.from(new Set(all.concat(names, pg.panels.map(p => p.who && p.who.name).concat(pg.panels.map(p => p.who2 && p.who2.name)).filter(Boolean)))).slice(0, 4), save = JSON.parse(JSON.stringify(pg, (k, v) => typeof v === 'function' ? undefined : v));   // everyone drawn stays in the page; only `names` get it in their book
  save.players = cast.map(n => ({name: n})); save.panels.forEach(p => { ['who', 'who2'].forEach(f => { if(p[f] && p[f].name != null){ const i = cast.indexOf(p[f].name); if(i >= 0) p[f] = i; else delete p[f]; } }); delete p.ball; });
  names.forEach(n => Comic.save(save, {name: n, game: gid}).catch(() => {}));
} catch(e){} }
let o_noBook = false;
function stripPage(design, o){ o = o || {}; if(!kitsReady()) return OLD.strip(design, o); const pg = pageFromDesign(design, o), n = pg.panels.length; if(design === 'winner' && o.book !== false) bookWinner(pg, o.book); return page(pg, {per: 0.5, hold: Math.max(1.6, (o.ms || (n === 4 ? 5200 : 3800)) / 1000 - n * 0.5), lang: o.lang}); }
function stripElPage(design, o){ o = o || {}; if(!kitsReady()) return OLD.stripEl(design, o); const w = Math.round(o.w || Math.min(innerWidth * 0.86, 520)), pg = pageFromDesign(design, o), el = pageEl(pg, {w, h: Math.round(w * 0.62)}); el.style.margin = '8px auto'; el.style.boxShadow = '5px 5px 0 rgba(0,0,0,.35)'; return el; }
// ⚡ impact → one big panel: punch-in camera, focus lines + burst, the words as a 3D sound word (the game waits while busy())
function impactPage(o){ o = o || {}; if(!kitsReady()) return OLD.impact(o); const D = DESIGN_PAGE[o.design] || DESIGN_PAGE.pow, pose = OLD_POSE[o.pose] || OLD_POSE.smash, ms = Math.max(600, Math.min(1500, o.ms || 1000));
  const words = String(o.words || 'WOW!').replace(/^[A-Z][a-z]+…\s*/, '') || 'WOW!';
  const pg = {layout: 'splash', mood: D.mood, title: '', panels: [Object.assign({who: o.who || {name: '', av: window.defaultAvatar ? defaultAvatar('?') : {}}, cam: 'punch', lines: ['focus', 'burst'], sfx: {text: words, style: o.design === 'power' ? 'electric' : 'impact', size: 1.15}, cap: o.sub || '', ball: o.ball}, pose)]};
  LAST.page = pg; return page(pg, {per: 0.12, hold: ms / 1000 - 0.12, maxW: 640, noTap: true, impact: true}); }
function busyAll(){ return !!PLAY || OLD.busy(); }
function clearAll(){ if(PLAY) PLAY.close(); OLD.clear(); }

/* ================= 🎮 ck-2 — game wiring: a game that offers window.GameComic (listen · hold · log · slots) gets its comics from here ================= */
// The game file only includes ComicKit; Comic wires itself on DOMContentLoaded when Comic.WIRES has the page's GAME_ID / SP_PAGE.
const WIRES = {};
function gameAv(name){ try { if(typeof myAvatar === 'function') return myAvatar(name); } catch(e){} return window.defaultAvatar ? defaultAvatar(name || 'player') : {}; }
function bombBall(g, x, y, r, t){ g.save(); g.font = Math.round(r * 2.3) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('💣', x, y); g.fillStyle = '#FFE14D'; g.beginPath(); g.arc(x + r * 0.75, y - r * 0.95, r * (0.22 + 0.08 * Math.sin(t * 20)), 0, TAU); g.fill(); g.restore(); }
// 👻💣 Soul Bopper (sb-10 = ck-2a): callouts during play (never pause), ⚡ impact when a person wins a round (play has stopped anyway),
// a 3-panel page of the round's best moment every 2nd round won by a person, 🏆 4-panel winner page at the end (+ a copy on the result card, saved to the 📚 book), 👹 BOSS DOWN impact.
WIRES.soulbopper = function(GC){
  const R = {round: [], lastCall: -1e9, roundsShown: 0, match: []}, P = i => (typeof G !== 'undefined' && G && G.M && G.M.P) ? G.M.P[i] : null;
  const human = p => p && p.human, on = () => { try { if(typeof FX !== 'undefined' && !FX) return false; return (G.M.P || []).some(p => p.human && Comic.enabled(p.name)); } catch(e){ return false; } };   // FX off (tests, low-power) = no pages
  const ix = p => { try { return G.M.P.indexOf(p); } catch(e){ return -1; } }, who = p => ({name: p.name, av: (typeof G !== 'undefined' && G.winAvs && G.winAvs[ix(p)]) || gameAv(p.name)});
  const call = (p, text) => { if(!p || !human(p) || typeof FX !== 'undefined' && !FX) return; const now = performance.now(); if(now - R.lastCall < 1100) return; R.lastCall = now; Comic.callout(text, {small: !on(), say: on()}); };
  let stepT = -1, stepCatch = {}, stepChain = 0;
  const flushStep = () => { Object.keys(stepCatch).forEach(by => { const n = stepCatch[by], p = P(+by); if(n >= 3) call(p, 'Bop… TRIPLE!!!'); else if(n === 2) call(p, 'Bop… DOUBLE!!'); else call(p, 'Bop… GOTCHA!'); }); if(stepChain >= 2){ const p = (G.M.P || []).find(human); call(p, 'Bop… CHAIN!!'); } stepCatch = {}; stepChain = 0; };
  const hold = on2 => { try { GC.hold(on2); } catch(e){} };
  const play = (promise) => { hold(true); return Promise.resolve(promise).then(() => hold(false), () => hold(false)); };
  // the round's best moment → design + who
  function best(list, win){
    const M = G.M, W = M.P[win] || M.P.find(human) || M.P[0], opp = M.P.find(p => p !== W) || W, caughtBy = {}, ev = k => list.filter(e => e.k === k);
    ev('caught').forEach(e => { if(e.by !== e.i) caughtBy[e.by] = (caughtBy[e.by] || 0) + 1; });
    const wi = ix(W), self = ev('caught').find(e => e.by === e.i), comeback = ev('comeback').find(e => e.i === wi), swap = ev('swap').length, chains = ev('pop').filter(e => e.chain).length, sudden = ev('sudden').length;
    if(comeback) return {design: 'power', hero: W, opp, words: ['Not over yet…', 'Bop… COMEBACK!!', 'Back from the ghosts!'], cap: '👻 Comeback'};
    if((caughtBy[wi] || 0) >= 3) return {design: 'pow', hero: W, opp, words: ['Here it comes…', 'Bop… TRIPLE!!!', 'Three at once!'], cap: '💥 Triple'};
    if(self && P(self.i) && !P(self.i).human) return {design: 'glitch', hero: P(self.i), opp: W, words: ['Calculating…', 'Bop… SELF BOP!', 'ERROR 404'], cap: '🤖 Robot oops', robot: true};
    if(chains >= 2) return {design: 'rally', hero: W, opp, words: ['Line them up…', 'Bop… CHAIN!!', 'Boom-boom-BOOM!'], cap: '⛓️ Chain'};
    if(swap) return {design: 'slowmo', hero: W, opp, words: ['Shhh…', 'Bop… SOUL SWAP!', 'Who is who?!'], cap: '👻 Soul swap'};
    if(sudden) return {design: 'close', hero: W, opp, words: ['So close…', 'Bop… PHEW!', 'Just made it!'], cap: '⏳ Sudden death'};
    return {design: 'pow', hero: W, opp, words: ['Ready…', 'Bop… BOOM!', 'Got you!'], cap: '💣 Bop!'};
  }
  function roundPage(b){ const M = G.M, sc = M.P.map(p => M.wins[p.i] || 0).join(' – ');
    return [{who: who(b.hero), pose: 'ready', cap: b.cap, words: b.words[0]}, {who: who(b.robot ? b.hero : b.hero), pose: b.robot ? 'glitch' : 'smash', ball: bombBall, ballX: 0.72, ballY: 0.28, words: b.words[1]},
      {who: who(b.robot ? b.opp : b.hero), pose: b.robot ? 'cheer' : 'cheer', words: b.words[2], cap: '🏆 ' + (b.robot ? b.opp : b.hero).name + ' · round ' + M.round}]; }
  function winnerPanels(win){ const M = G.M, W = M.P[win] || M.P[0], L = M.P.find(p => p !== W) || W, b = best(R.match, win);
    return [{who: who(W), who2: who(L), pose: 'ready', pose2: 'ready', cap: '👻💣 Soul Bopper', words: 'Bop time!'}, {who: who(b.robot ? W : b.hero), pose: 'smash', ball: bombBall, ballX: 0.72, ballY: 0.28, cap: 'The big moment', words: b.robot ? 'Bop… BOOM!' : b.words[1]},
      {who: who(L), pose: L.human ? 'sad' : 'glitch', cap: 'Last bomb', words: L.human ? 'Noooo!' : 'BZZT!'}, {who: who(W), pose: 'cheer', cap: W.name + ' · ' + ((M.wins || [])[win] || 0) + ' rounds', words: 'SOUL-BOPPER!!!'}]; }
  GC.listen((mode, e, M) => {
    if(!M) return; if(e.k === 'round' || (e.k === 'go' && !R.round.length)) R.round = [];
    R.round.push(e); R.match.push(e);
    if(M.t !== stepT){ flushStep(); stepT = M.t; }
    if(e.k === 'caught'){ const p = P(e.by); if(e.by === e.i) call(P(e.i), 'Bop… SELF BOP!'); else if(p) stepCatch[e.by] = (stepCatch[e.by] || 0) + 1; }
    else if(e.k === 'pop' && e.chain) stepChain++;
    else if(e.k === 'swap') call(P(e.body != null ? e.body : e.i) || (M.P || []).find(human), 'Bop… SOUL SWAP!');
    else if(e.k === 'comeback') call(P(e.i), 'Bop… COMEBACK!!');
    else if(e.k === 'shieldoff') call(P(e.i), 'Bop… SHIELD!');
    else if(e.k === 'bossdown'){ const p = (M.P || []).find(human); if(p && on()) setTimeout(() => play(Comic.impact({who: who(p), words: 'Bop… BOSS DOWN!!!', design: 'power', pose: 'jump', sub: '👹 Boss down!', ms: 1300})), 120); else call(p, 'Bop… BOSS DOWN!!!'); }
    else if(e.k === 'matchend'){ flushStep(); const W = M.P[e.winner]; if(!on() || e.winner < 0 || !W) return;
      const panels = winnerPanels(e.winner), title = '🏆 ' + W.name + ' · Soul Bopper';
      setTimeout(() => { play(Comic.strip('winner', {panels, title, crowd: M.P.filter(p => p.human && p !== W).slice(0, 2).map(who), book: M.P.filter(p => p.human && p.name && p.name !== 'Guest').map(p => p.name)})); }, 350);   // 📚 book: people only (bots may wear family names)
      let n = 0; const iv = setInterval(() => { const slot = document.getElementById('comic-strip-slot'); if(slot && !slot.firstChild){ clearInterval(iv); slot.appendChild(Comic.stripEl('winner', {panels, title})); } if(++n > 60) clearInterval(iv); }, 250); }
    else if(e.k === 'roundend' && !M.done){ flushStep(); const W = M.P[e.winner]; if(!W || !W.human || !on()){ return; }
      R.roundsShown++; const b = best(R.round, e.winner);
      if(R.roundsShown % 2 === 0) setTimeout(() => play(Comic.strip(b.design, {panels: roundPage(b), title: '💥 BOP-COMICS · ' + b.cap})), 300);
      else setTimeout(() => play(Comic.impact({who: who(W), words: 'Bop… BOOM!', design: 'pow', pose: 'jump', sub: '🏆 ' + W.name + ' wins round ' + e.round + '!', ball: bombBall, ms: 1100})), 200); }
  });
  // 💬 Comics chip in ⚙️ Extras (per player, per device)
  const slot = document.getElementById('comics-slot-setup'); if(slot && !slot.firstChild){ const b = document.createElement('button'); b.className = 'chip'; b.setAttribute('data-sound', 'pop'); b.id = 'comic-chip'; slot.appendChild(b); try { Comic.chip(b, (typeof CURRENT_PLAYER !== 'undefined' && CURRENT_PLAYER) || 'Guest'); } catch(e){} }
  return R;
};
// 🥊🗺️ Brawl Buddies + Brawenture (ck-2b): one file, two loops (GameComic.mode() = 'brawl' | 'adv').
// 🥊 callouts only for moments the game doesn't already shout (counter chain ×3+, grapple slams, perfect), ⚡ impact when a person wins a round,
// a 3-panel page of the round's best moment every 2nd round won by a person, 🏆 4-panel winner page at the end (+ result card copy, 📚 book for people).
// 🗺️ ⚡ BOSS DOWN impact, callouts (×N combo clash, EUREKA, comeback), 🏆 4-panel tale page when the tale is won (+ result card, 📚 book), a kind "to be continued…" page on the result card when it is lost.
// Robots in Brawl are family members in robot helmets: a robot oops glitches the HELMET, never the kid.
function emojiBall(ch){ return (g, x, y, r) => { g.save(); g.font = Math.round(r * 2.4) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, x, y); g.restore(); }; }
WIRES.brawlbuddies = function(GC){
  const R = {round: [], match: [], tale: [], lastCall: -1e9, roundsShown: 0, bosses: {}}, FXon = () => typeof FX === 'undefined' || !!FX;
  const hold = v => { try { GC.hold(v); } catch(e){} }, play = pr => { hold(true); return Promise.resolve(pr).then(() => hold(false), () => hold(false)); };
  const people = list => Array.from(new Set((list || []).filter(p => p && p.human && p.name && p.name !== 'Guest').map(p => p.name)));
  const call = text => { if(!FXon()) return; const now = performance.now(); if(now - R.lastCall < 1100) return; R.lastCall = now; Comic.callout(text, {small: !onAny(), say: onAny()}); };
  // ---------- 🥊 Brawl ----------
  const BM = () => (typeof G !== 'undefined' && G && G.M) ? G.M : null, F = i => { const M = BM(); return M && M.f ? M.f[i] : null; };
  const bAll = () => { const M = BM(); return M && M.sq ? [].concat(...M.sq) : (M && M.f) || []; };
  const bOn = () => { try { return FXon() && bAll().some(p => p.human && Comic.enabled(p.name)); } catch(e){ return false; } };
  const bWho = p => ({name: p.human ? p.name : '🤖 ' + p.name, av: p.avW || gameAv(p.name)}), botPose = p => p.robo ? 'glitch' : 'jump';   // helmet robots are family members: their helmet sparks, the kid never glitches
  const isBot = p => p && !p.human;
  function bBest(list, w){
    const M = BM(), W = M.f[w], L = M.f[1 - w] || W, ev = k => list.filter(e => e.k === k), mine = e => e.p === w, hp = W.maxHp ? W.hp / W.maxHp : 1;
    const slam = ev('slam').filter(mine).sort((a, b) => (b.dmg || 0) - (a.dmg || 0))[0], ctr = Math.max(0, ...ev('counter').filter(mine).map(e => e.n || 1)), combo = Math.max(0, ...ev('combo').filter(mine).map(e => e.n || 0));
    const sky = ev('sky').some(mine), gb = ev('gbreak').some(mine), fooled = isBot(L) && (ev('counter').some(e => mine(e) && e.to === 1 - w) || ev('gbreak').some(mine)), perfect = ev('perfect').some(mine), timeUp = ev('roundEnd').some(e => e.timeUp);
    if(perfect) return {design: 'bullseye', words: ['Not a scratch…', 'Brawl… PERFECT!', 'Full hearts!'], cap: '✨ Perfect'};
    if(hp > 0 && hp < 0.15) return {design: 'close', words: ['So close…', 'Brawl… PHEW!', 'Still standing!'], cap: '🥵 Close call'};
    if(slam) return {design: 'power', words: ['Gotcha…', 'Brawl… ' + String(slam.name || 'SLAM').toUpperCase() + '!!', 'SLAM!'], cap: '🤼 ' + (slam.name || 'Grapple'), ball: emojiBall((ev('grab').filter(e => mine(e) && e.name === slam.name).pop() || {}).icon || '🤼')};
    if(ctr >= 3) return {design: 'rally', words: ['Back…', 'Brawl… COUNTER ×' + ctr + '!', '…and forth!'], cap: '⚡ Counter chain'};
    if(fooled) return {design: 'glitch', loserBot: !!L.robo, words: ['Calculating…', 'Brawl… BZZT!', 'Helmet sparks!'], cap: '🤖 Robot fooled', ball: emojiBall('⚡')};
    if(sky) return {design: 'jump', words: ['Up you go…', 'Brawl… UPPERCUT!', 'Boing boing!'], cap: '🚀 Sky combo'};
    if(gb) return {design: 'power', words: ['Shields up?', 'Bonk… BREAK!', 'Wide open!'], cap: '🔨 Guard break', ball: emojiBall('🛡️')};
    if(combo >= 5) return {design: 'pow', words: ['Here we go…', 'Brawl… ' + combo + ' HITS!', 'Combo!'], cap: '🔥 ' + combo + '-hit combo'};
    return {design: 'pow', words: ['Ready…', timeUp ? 'Brawl… TIME!' : 'Brawl… K.O.!!!', timeUp ? 'More hearts!' : 'Bonked out!'], cap: timeUp ? '⏰ Time' : '💫 K.O.'};
  }
  function bRoundPanels(b, w, n){ const M = BM(), W = M.f[w], L = M.f[1 - w] || W;
    return [{who: bWho(W), who2: bWho(L), pose: 'ready', pose2: 'ready', cap: b.cap, words: b.words[0]}, {who: bWho(b.loserBot ? L : W), pose: b.loserBot ? 'glitch' : 'smash', ball: b.ball, ballX: 0.72, ballY: 0.3, words: b.words[1]},
      {who: bWho(W), pose: 'cheer', words: b.words[2], cap: '🏆 ' + W.name + ' · round ' + (n || M.round)}]; }
  function bWinnerPanels(w){ const M = BM(), W = M.f[w], L = M.f[1 - w] || W, b = bBest(R.match, w);
    return [{who: bWho(W), who2: bWho(L), pose: 'ready', pose2: 'ready', cap: '🥊 Brawl Buddies', words: 'Bonk time!'}, {who: bWho(b.loserBot ? L : W), pose: b.loserBot ? 'glitch' : 'smash', ball: b.ball, ballX: 0.72, ballY: 0.3, cap: b.cap, words: b.words[1]},
      {who: bWho(L), pose: L.human ? 'jump' : botPose(L), ball: L.human ? undefined : emojiBall('⚡'), ballX: 0.5, ballY: 0.16, cap: L.human ? 'Good fight!' : 'Helmet sparks', words: L.human ? 'Next time!' : 'Bzzt… REBOOT!'}, {who: bWho(W), pose: 'cheer', cap: W.name + ' · ' + ((M.wins || [])[w] || 0) + ' – ' + ((M.wins || [])[1 - w] || 0), words: W.human ? 'BRAWL BUDDY!!!' : 'BEEP-BOOP WIN!'}]; }
  function onBrawl(e, M){
    if(e.k === 'round' || e.k === 'fight' && !R.round.length) R.round = [];
    R.round.push(e); R.match.push(e); const P = F(e.p);
    if(e.k === 'counter' && (e.n || 1) >= 3 && P && P.human) call('Brawl… COUNTER ×' + e.n + '!!');
    else if(e.k === 'slam' && P && P.human) call('Brawl… ' + String(e.name || 'SLAM').toUpperCase() + '!!');
    else if(e.k === 'perfect' && P && P.human) call('Brawl… PERFECT!');
    else if(e.k === 'roundEnd'){ if(M.done || e.winner < 0) return; const W = M.f[e.winner]; if(!W || !W.human || !bOn()) return;
      R.roundsShown++; const b = bBest(R.round, e.winner);
      if(R.roundsShown % 2 === 0) setTimeout(() => play(Comic.strip(b.design, {panels: bRoundPanels(b, e.winner, e.n), title: '💥 BRAWL-COMICS · ' + b.cap})), 300);
      else setTimeout(() => play(Comic.impact({who: bWho(W), words: b.words[1], design: b.design === 'glitch' ? 'pow' : b.design, pose: 'jump', sub: '🏆 ' + W.name + ' wins round ' + e.n + '!', ball: b.ball, ms: 1100})), 200); }
    else if(e.k === 'match'){ const W = M.f[e.winner]; if(!W || !bOn()) return;
      const panels = bWinnerPanels(e.winner), title = '🏆 ' + W.name + ' · Brawl Buddies';
      setTimeout(() => play(Comic.strip('winner', {panels, title, crowd: bAll().filter(p => p.human && p !== W).slice(0, 2).map(bWho), book: people(bAll())})), 350);   // 📚 people only (helmet robots wear family names)
      toCard(() => Comic.stripEl('winner', {panels, title})); }
  }
  // ---------- 🗺️ Brawenture ----------
  const AM = () => (typeof AV !== 'undefined' && AV && AV.M) ? AV.M : null, heroes = () => (AM() || {}).heroes || [];
  const aOn = () => { try { return FXon() && heroes().some(h => h.human && Comic.enabled(h.name)); } catch(e){ return false; } };
  const aWho = h => ({name: h.name, av: gameAv(h.name === 'Guest' ? 'Guest' : h.name)}), lead = () => heroes().find(h => h.human) || heroes()[0];
  const foeType = name => { try { return Object.keys(BV.FOES).find(k => BV.FOES[k].name === name); } catch(e){ return null; } };
  const foeWho = name => { const t = foeType(name), F2 = t && BV.FOES[t]; if(F2 && F2.monster) return {who: {name: name, av: Object.assign(gameAv(name), {})}, ball: emojiBall(F2.monster)}; return {who: {name: name || '😈', av: t && typeof foeAvatar === 'function' ? foeAvatar(t, 0) : gameAv(name)}}; };
  function aBig(list){ const ev = k => list.filter(e => e.k === k), cw = ev('clashWin').sort((a, b) => (b.sets || 0) - (a.sets || 0))[0], boss = ev('foeKo').filter(e => e.boss && !R.bosses[e.name]).pop() || ev('foeKo').filter(e => e.boss).pop(), solved = ev('solved').length, back = ev('respawn').length;
    if(cw) return {words: 'Brawen… ×' + (cw.sets || 1) + ' COMBO!!', cap: '⚔️ Team clash vs ' + cw.name, ball: emojiBall('⚔️')};
    if(boss) return {words: 'Brawen… BOSS DOWN!!', cap: '👑 ' + boss.name + ' bonked', ball: emojiBall('💫')};
    if(solved) return {words: 'Brawen… EUREKA!', cap: '🧩 Puzzle solved', ball: emojiBall('💡')};
    if(back) return {words: 'Brawen… COMEBACK!', cap: '❤️ Never give up', ball: emojiBall('❤️')};
    return {words: 'Brawen… BONK!', cap: '😈 ' + ((AM() || {}).kos || 0) + ' baddies bonked'}; }
  function talePanels(win){ const M = AM(), T = M.tale, st = (typeof ADV_STORIES !== 'undefined' && ADV_STORIES[M.ti]) || {}, H = lead(), mates = heroes().filter(h => h !== H), V = foeWho(T.villain && T.villain.split(' & ')[0] || ''), b = aBig(R.tale), cap = M.captive || '';
    const say = String(st.say || '').replace(/\{who\}/g, cap).replace(/\{royal\}/g, M.royal && BV.FOES[M.royal] ? BV.FOES[M.royal].name : '').replace(/\s+—\s+.*$/, ''), end = String((M.ending && st[M.ending]) || st.win || '').replace(/\{who\}/g, cap).replace(/\{royal\}/g, M.royal && BV.FOES[M.royal] ? BV.FOES[M.royal].name : '');
    const short = t => t.length > 34 ? t.slice(0, 33).replace(/\s+\S*$/, '') + '…' : t, vcap = short(say) || T.icon + ' ' + T.name;   // the villain's line sits in the caption box (long lines would cover faces)
    if(!win) return [{who: V.who, pose: 'cheer', ball: V.ball, ballX: 0.72, ballY: 0.3, cap: vcap, words: 'Mwa-ha-ha!'}, {who: aWho(H), pose: 'ready', cap: 'To be continued…', words: 'We will be back!'}];
    return [{who: V.who, pose: 'cheer', ball: V.ball, ballX: 0.72, ballY: 0.3, cap: vcap, words: 'Mwa-ha-ha!'},
      {who: aWho(H), who2: mates[0] ? aWho(mates[0]) : undefined, pose: 'smash', pose2: mates[0] ? 'smash' : undefined, ball: b.ball, ballX: 0.72, ballY: 0.28, cap: b.cap, words: b.words},
      T.noCaptive ? {who: aWho(H), pose: 'jump', cap: '🏘️ The town is safe', words: 'We did it!'} : {who: aWho(H), who2: {name: cap, av: gameAv(cap)}, pose: 'cheer', pose2: 'cheer', cap: '🗝️ ' + cap + ' is free!', words: 'You came!'},
      {who: aWho(H), who2: mates[0] ? aWho(mates[0]) : undefined, pose: 'cheer', pose2: mates[0] ? 'cheer' : undefined, cap: end.length > 70 ? end.slice(0, 68) + '…' : end, words: 'BRAWENTURE!!!'}]; }
  function onAdv(e, M){
    R.tale.push(e);
    if(e.k === 'boss') R.bosses[e.name] = e.mini ? 'mini' : 'boss';
    else if(e.k === 'clashWin' && (e.sets || 0) >= 3) call('Brawen… ×' + e.sets + ' COMBO!!');
    else if(e.k === 'solved') call('Brawen… EUREKA!');
    else if(e.k === 'respawn'){ const h = heroes()[e.h]; if(h && h.human) call('Brawen… COMEBACK!'); }
    else if(e.k === 'foeKo' && e.boss && R.bosses[e.name] !== 'mini'){ const H = lead(); if(!H) return; if(aOn() && !R.bossShown){ R.bossShown = 1; const V = foeWho(e.name); setTimeout(() => play(Comic.impact({who: aWho(H), words: 'Brawen… BOSS DOWN!!', design: 'power', pose: 'jump', sub: '👑 ' + e.name + ' is bonked!', ball: V.ball || emojiBall('💫'), ms: 1300})), 150); } else call('Brawen… BOSS DOWN!!'); }
    else if(e.k === 'mapEnd') R.bossShown = 0;
    else if(e.k === 'win' || e.k === 'lose'){ if(!aOn()) return; const win = e.k === 'win', panels = talePanels(win), T = M.tale, title = (win ? '🏆 ' : '📖 ') + T.name + (win ? '' : ' · to be continued…');
      if(win) setTimeout(() => { Comic.strip('winner', {panels, title, book: people(heroes())}); }, 250);   // the tale is over (no hold needed); 📚 every human hero
      toCard(() => win ? Comic.stripEl('winner', {panels, title}) : Comic.stripEl('divemiss', {panels, title})); }
  }
  // ---------- shared ----------
  function onAny(){ return GC.mode() === 'adv' ? aOn() : bOn(); }
  function toCard(make){ let n = 0; const iv = setInterval(() => { const slot = document.getElementById('comic-strip-slot'); if(slot && !slot.firstChild){ clearInterval(iv); try { slot.appendChild(make()); } catch(err){} } if(++n > 80) clearInterval(iv); }, 250); }
  GC.listen((mode, e, M) => { if(!M) return; if(mode === 'adv'){ if(e.k === 'map' && e.i === 0 && R.tale.length > 40) R.tale = []; onAdv(e, M); } else onBrawl(e, M); });
  const reset = GC._reset; GC._reset = function(mode){ R.round = []; R.match = []; R.tale = []; R.roundsShown = 0; R.bosses = {}; R.bossShown = 0; return reset.apply(this, arguments); };
  // 💬 Comics chip on the Brawl level page + the Brawenture setup (per player, per device)
  ['comics-slot-menu', 'comics-slot-adv'].forEach((id, k) => { const slot = document.getElementById(id); if(slot && !slot.firstChild){ const b = document.createElement('button'); b.className = 'chip'; b.setAttribute('data-sound', 'pop'); b.id = k ? 'comic-chip-adv' : 'comic-chip'; slot.appendChild(b); try { Comic.chip(b, (typeof CURRENT_PLAYER !== 'undefined' && CURRENT_PLAYER) || 'Guest'); } catch(e){} } });
  return R;
};
// 🐍 Snakize (ck-2c): GameComic comes from the game's 💥 block (feed in handleEvents, reset in startGame, hold in loop, 'gameOver' from gameOver()).
// 🗯️ callouts only for moments the game doesn't already shout big (a person pops / cuts a rival, a big castle claim, a shield save, a side quest done),
// ⚡ at most 2 impacts a game (first pop by a person · first big claim), 🏆 4-panel winner page when a person wins (+ result card + 📚 book, people only —
// bot snakes can carry family names), a kind 2-panel "one more go!" page on the result card when the person loses (not saved).
WIRES.snakeast = function(GC){
  const R = {ev: [], lastCall: -1e9, impacts: 0, lastImpact: -1e9, popShown: false, claimShown: false}, FXon = () => typeof FX === 'undefined' || !!FX;
  const hold = v => { try { GC.hold(v); } catch(e){} }, play = pr => { hold(true); return Promise.resolve(pr).then(() => hold(false), () => hold(false)); };
  const GG = () => (typeof G !== 'undefined' && G) ? G : null, snakes = () => (GG() && GG().M && GG().M.snakes) || [], S_ = i => snakes()[i];
  const people = () => Array.from(new Set(snakes().filter(s => s && s.human && s.name && !/^Guest/.test(s.name)).map(s => s.name)));
  const on = () => { try { return FXon() && snakes().some(s => s.human && Comic.enabled(s.name)); } catch(e){ return false; } };
  const who = s => { const g = GG(), i = snakes().indexOf(s); return {name: s.human ? s.name : (s.robo || !s.name ? '🤖 Robo-snake' : '🤖 ' + s.name), av: s.human ? gameAv(/^Guest/.test(s.name) ? 'Guest' : s.name) : ((g && g.avs && g.avs[i]) || gameAv(s.name || 'Robo'))}; };
  const call = text => { if(!on()) return; const now = performance.now(); if(now - R.lastCall < 1100) return; R.lastCall = now; Comic.callout(text, {say: true}); };
  const ball = ch => (g, x, y, r) => { g.save(); g.font = Math.round(r * 2.4) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, x, y); g.restore(); };
  function impact(s, words, design, sub, ch){ const now = performance.now(); if(!on() || R.impacts >= 2 || now - R.lastImpact < 20000) return false; R.impacts++; R.lastImpact = now;
    setTimeout(() => play(Comic.impact({who: who(s), words, design, pose: 'jump', sub, ball: ball(ch), ms: 1100})), 150); return true; }
  function best(i){ const ev = R.ev, mine = e => e.s === i, by = e => e.by === i && e.s !== i, s = S_(i) || {};
    const pops = ev.filter(e => e.k === 'pop' && by(e)), cuts = ev.filter(e => e.k === 'cut' && by(e)), claim = ev.filter(e => e.k === 'claim' && mine(e)).sort((a, b) => (b.cells || 0) - (a.cells || 0))[0],
      shield = ev.some(e => e.k === 'shieldHit' && mine(e)), gold = ev.filter(e => e.k === 'gold' && mine(e)).length, quest = ev.some(e => e.k === 'questDone' && mine(e));
    if(pops.length){ const big = pops.sort((a, b) => (b.len || 0) - (a.len || 0))[0], v = S_(big.s); return {design: 'pow', words: 'Snak… POP!!', cap: '💥 Popped ' + (v ? who(v).name : 'a snake') + (pops.length > 1 ? ' (+' + (pops.length - 1) + ')' : ''), ch: '💥', rival: v}; }
    if(cuts.length){ const v = S_(cuts[0].s); return {design: 'power', words: 'Snak… SNIP!!', cap: '✂️ Cut ' + (v ? who(v).name : 'a trail') + '\'s trail', ch: '✂️', rival: v}; }
    if(claim && (claim.cells || 0) >= 12) return {design: 'bullseye', words: 'Snak… CASTLE!!', cap: '🚩 +' + claim.cells + ' land', ch: '🚩'};
    if(shield) return {design: 'close', words: 'Snak… PHEW!', cap: '🛡️ Shield saved me', ch: '🛡️'};
    if(gold >= 2) return {design: 'bullseye', words: 'Snak… SHINY!', cap: '✨ ' + gold + ' golden', ch: '✨'};
    if(quest) return {design: 'jump', words: 'Snak… QUEST!', cap: '🗺️ Side quest done', ch: '🗺️'};
    return {design: 'jump', words: 'Snak… ' + (s.maxLen || '') + ' LONG!!', cap: '🍎 ' + (s.eaten || 0) + ' eaten', ch: '🍎'}; }
  function winnerPanels(i){ const g = GG(), M = g.M, s = S_(i), b = best(i), others = snakes().filter(o => o !== s && !o.boss),
      rival = b.rival || (M.mode === 'gate' && typeof SN !== 'undefined' && SN.gateRank ? (SN.gateRank(M).map(o => S_(o.i)).find(o => o && o !== s)) : others[0]),
      goal = M.mode === 'castle' ? '🏰 ' + Math.floor(s.land || 0) + ' % land' : M.mode === 'gate' ? '🏅 last snake riding' : g.endless ? '♾️ ' + (s.maxLen || 0) + ' long' : '🎯 grew to ' + (M.target || s.maxLen || '');
    return [{who: who(s), who2: rival ? who(rival) : undefined, pose: 'ready', pose2: rival ? 'ready' : undefined, cap: '🐍 ' + (typeof MODES !== 'undefined' && MODES[g.mode] ? MODES[g.mode].name || 'Snakize' : 'Snakize'), words: 'Ready… slither!'},
      {who: who(s), pose: 'smash', ball: ball(b.ch), ballX: 0.72, ballY: 0.3, cap: b.cap, words: b.words},
      rival ? {who: who(rival), pose: 'jump', cap: rival.human ? 'Good game!' : who(rival).name + ' · hiss…', words: 'Next time!'} : {who: who(s), pose: 'jump', ball: ball('🍎'), ballX: 0.7, ballY: 0.28, cap: '🍎 ' + (s.eaten || 0) + ' eaten', words: 'Munch munch…'},
      {who: who(s), pose: 'cheer', cap: goal, words: 'SNAKIZE!!!'}]; }
  function toCard(make){ let n = 0; const iv = setInterval(() => { const slot = document.getElementById('comic-strip-slot'); if(slot && !slot.firstChild){ clearInterval(iv); try { slot.appendChild(make()); } catch(err){} } if(++n > 80) clearInterval(iv); }, 250); }
  GC.listen((mode, e, M) => {
    if(!M) return; R.ev.push(e); if(R.ev.length > 600) R.ev.splice(0, 200);
    const s = e.s != null ? S_(e.s) : null, by = e.by != null && e.by >= 0 && e.by !== e.s ? S_(e.by) : null;
    if(e.k === 'pop' && by && by.human){ if(!R.popShown && impact(by, 'Snak… POP!!', 'pow', '💥 ' + by.name + ' popped ' + (s ? who(s).name : 'a snake') + '!', '💥')) R.popShown = true; else call('Snak… POP!!'); }
    else if(e.k === 'cut' && by && by.human) call('Snak… SNIP!!');
    else if(e.k === 'claim' && s && s.human && (e.cells || 0) >= 25){ if(!R.claimShown && impact(s, 'Snak… CASTLE!!', 'bullseye', '🚩 +' + e.cells + ' land for ' + s.name + '!', '🚩')) R.claimShown = true; else call('Snak… CASTLE!!'); }
    else if(e.k === 'shieldHit' && s && s.human) call('Snak… PHEW!');
    else if(e.k === 'questDone' && s && s.human) call('Snak… QUEST!');
    else if(e.k === 'gameOver'){ if(!on()) return; const g = GG(), w = e.winner, W = S_(w), hs = snakes().filter(o => o.human);
      if(W && W.human || g.endless){ const i = W && W.human ? w : snakes().indexOf(hs[0]), panels = winnerPanels(i), title = '🏆 ' + S_(i).name + ' · Snakize';
        setTimeout(() => { Comic.strip('winner', {panels, title, crowd: hs.filter(o => o !== S_(i)).slice(0, 2).map(who), book: people()}); }, 250);   // 📚 people only
        toCard(() => Comic.stripEl('winner', {panels, title})); }
      else if(hs.length){ const me = hs[0], b = best(snakes().indexOf(me)), W2 = W && !W.human ? W : null,
          panels = [{who: W2 ? who(W2) : who(me), pose: W2 ? 'cheer' : 'jump', ball: ball(W2 ? '🐍' : '💫'), ballX: 0.72, ballY: 0.3, cap: W2 ? who(W2).name + ' was longer' : hs.length > 1 ? '🤝 Both out' : 'Bonk!', words: W2 ? 'Sss-uper!' : 'Oof!'},
            {who: who(me), pose: 'ready', cap: b.cap + ' · to be continued…', words: 'One more go!'}];
        toCard(() => Comic.stripEl('divemiss', {panels, title: '📖 Snakize · to be continued…'})); }
    }
  });
  const reset = GC._reset; GC._reset = function(){ R.ev = []; R.impacts = 0; R.lastImpact = -1e9; R.popShown = R.claimShown = false; return reset.apply(this, arguments); };
  // 💬 Comics chip on the level page, next to the 📣 crowd chips (per player, per device)
  const slot = document.getElementById('comics-slot-setup'); if(slot && !slot.firstChild){ const b = document.createElement('button'); b.className = 'btn soft sp-btn sp-secondary'; b.setAttribute('data-sound', 'tap'); b.id = 'comic-chip'; slot.appendChild(b); try { Comic.chip(b, (typeof CURRENT_PLAYER !== 'undefined' && CURRENT_PLAYER) || 'Guest'); } catch(e){} }
  return R;
};
// 🔥 PyraDive (ck-2d, from the PyraDive chat's 💥 brief): the page already has window.GameComic (listen → fn('pyraspike', e, M) · hold · log · mode); it only adds include('ComicKit').
// A sunny sports-anime feeling, loud, never mean. 🌱 Basic stays quiet (no callouts / no pop-ups — only the result-card copy + 📚 book) and 🎯 drills only get the result card.
// 🗯️ callouts: "Pyra… DUNK!" (a person's Pyra move) · STUFFED! · EDGE! · ACE! · HOOP! · RALLY ×N! · COMEBACK! — never while the game's own 🔥🔥 Spirit Dive cut-in is on screen.
// ⚡ at most 3 impacts a match (25 s apart), right after a point the PEOPLE won with a big move (rally held quietly, never on a serve countdown or a Spirit cut-in).
// 🏆 a person's team wins → 4-panel page of the real best moment (🔥🔥🔥 Trio = dig → set → spike → the creature smashes down) in the arena's colours + result card + 📚 for G.locals only
// (robots can carry family names) · 🏆 cup champion → CHAMPION! page · lost → a kind 2-panel "Next time!" (facepalm, not a cry) on the card only · 🎯 Training ⭐⭐⭐ → a 2-panel Coach page (+ 📚).
WIRES.pyraspike = function(GC){
  const R = {ev: [], rally: [], lastCall: -1e9, impacts: 0, lastImpact: -1e9, M: null}, FXon = () => typeof FX === 'undefined' || !!FX;
  const GG = () => (typeof G !== 'undefined' && G) ? G : null, P_ = id => { const g = GG(); return g && g.M && g.M.players ? g.M.players[id] : null; };
  const locals = () => ((GG() && GG().locals) || []).filter(p => p && p.human), people = () => Array.from(new Set(locals().filter(p => p.name && p.name !== 'Guest').map(p => p.name)));
  const on = () => { try { return FXon() && locals().some(p => Comic.enabled(p.name)); } catch(e){ return false; } };
  const quiet = () => { const g = GG(); return !g || g.level === 0 || !!(g.M && g.M.drill); };   // 🌱 Basic + 🎯 drills: no pop-ups
  const cutIn = () => { const g = GG(); return !!(g && (g.slow > 0 || document.querySelector('#bigword-host .spirit-card'))); };
  const who = p => p ? {name: p.human ? p.name : '🤖 ' + p.name, av: p.av || (window.defaultAvatar ? defaultAvatar(p.name || 'robo') : {})} : undefined;
  const ball = ch => (g, x, y, r) => { g.save(); g.font = Math.round(r * 2.4) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, x, y); g.restore(); };
  const hold = v => { try { GC.hold(v); } catch(e){} }, play = pr => { hold(true); return Promise.resolve(pr).then(() => hold(false), () => hold(false)); };
  const myTeam = () => { const L = locals(); return L.length ? L[0].team : 0; }, isLocal = id => { const p = P_(id); return !!(p && p.human); };
  const up = s => String(s || '').replace(/^Pyra…\s*/, '').toUpperCase();
  const creature = e => { try { const c = (typeof spiritOf === 'function' && spiritOf(e.creature)) || null; return {icon: (c && c.icon) || e.icon || '🔥', col: (c && c.col) || '#FF6B1A', name: (c && c.name) || e.cname || ''}; } catch(err){ return {icon: e.icon || '🔥', col: '#FF6B1A', name: e.cname || ''}; } };
  const moveOf = e => String(e.name || '').replace(/^Spirit (Duo |Trio )?Dive : /, '');
  function arenaMood(){ try { const g = GG(), k = typeof arenaKey === 'function' ? arenaKey(g.M) : 'classic', A = (typeof ARENA_LOOK !== 'undefined' && ARENA_LOOK[k]) || null; if(!A) return 'fire';
    return {glow: A.light ? A.sky[0] : (A.line && A.line !== '#FFFFFF' ? A.line : A.sky[2]), deep: A.light ? '#2F7BEA' : A.stand[1], pop: '#FFE14D'}; } catch(e){ return 'fire'; } }
  function call(text){ if(!on() || quiet() || cutIn()) return; const now = performance.now(); if(now - R.lastCall < 1100) return; R.lastCall = now; Comic.callout(text, {say: true}); }
  // the big moment of a list of events for team T (best first)
  function moment(list, T){ const mine = e => e.team === T, by = e => P_(e.p), L = k => list.filter(e => e.k === k && mine(e));
    const sp = L('spirit'), trio = sp.filter(e => e.tier === 'trio').pop(), duo = sp.filter(e => e.tier === 'duo').pop(), solo = sp.filter(e => !e.tier || e.tier === 'solo').pop();
    if(trio) return {trio: trio, design: 'power', words: 'Spirit… ' + up(moveOf(trio)) + '!!', cap: '🔥🔥×3 Spirit Trio Dive', p: by(trio), ch: creature(trio).icon};
    if(duo) return {design: 'power', words: 'Spirit… ' + up(moveOf(duo)) + '!!', cap: '🔥🔥×2 Spirit Duo Dive : ' + moveOf(duo), p: by(duo), p2: P_((duo.ids || []).find(id => id !== duo.p)), ch: creature(duo).icon};
    if(solo) return {design: 'power', words: 'Spirit… ' + up(moveOf(solo)) + '!!', cap: '🔥🔥 Spirit Dive : ' + moveOf(solo), p: by(solo), ch: creature(solo).icon};
    const pk = L('kill').filter(e => e.pyra).pop(); if(pk){ const pn = list.filter(e => e.k === 'pyra' && e.p === pk.p).pop(); return {design: 'pow', words: 'Pyra… ' + up(pn ? pn.name : pk.by || 'DUNK') + '!!', cap: '🔥 ' + (pn ? pn.name : 'Pyra move') + ' wins the point', p: by(pk), ch: '🔥'}; }
    const st = L('stuff').pop(); if(st) return {design: 'power', words: 'Pyra… STUFFED!!', cap: '🧱 Straight back down', p: by(st), ch: '🧱'};
    const ed = L('edge').pop(); if(ed) return {design: 'bullseye', words: 'Pyra… EDGE!!', cap: '⚡ Edge ball', p: by(ed), ch: '⚡'};
    const ho = L('hoop').sort((a, b) => (b.pts || 0) - (a.pts || 0))[0]; if(ho) return {design: 'jump', words: 'Pyra… HOOP!!', cap: '⭕ ' + (ho.name || 'Hoop') + ' · +' + (ho.pts || 1), p: by(ho), ch: '⭕'};
    const ac = L('ace').pop(); if(ac) return {design: 'pow', words: 'Pyra… ACE!!', cap: '🚀 Ace serve', p: by(ac), ch: '🚀'};
    const lr = list.filter(e => e.k === 'longRally').sort((a, b) => (b.n || 0) - (a.n || 0))[0]; if(lr && (lr.n || 0) >= 10) return {design: 'rally', words: 'Pyra… RALLY ×' + lr.n + '!', cap: (GG() && GG().M && GG().M.arena === 'moon' ? '🪐 The ball floats forever · ' : '💦 ') + lr.n + ' touches', ch: '💦'};
    const cb = L('comeback').pop(); if(cb) return {design: 'close', words: 'Pyra… COMEBACK!', cap: '💪 From ' + (cb.was || 4) + ' points down', ch: '💪'};
    if(list.filter(e => e.k === 'partyHit' && mine(e)).length >= 4) return {design: 'rally', words: 'Pyra… PARTY!!', cap: '🌀 Balls everywhere!', ch: '🌀'};
    const ki = L('kill').pop(); if(ki) return {design: 'pow', words: 'Pyra… ' + up(ki.by || 'POINT') + '!', cap: '💥 Point winner', p: by(ki), ch: '🏐'};
    return {design: 'pow', words: 'Pyra… POINT!', cap: '🏐 What a match', ch: '🏐'}; }
  const teamOf = T => { const g = GG(); return g ? g.M.players.filter(p => p.team === T) : []; }, starOf = T => { const t = teamOf(T); return t.find(p => p.human) || t[0]; };
  function scoreCap(){ const g = GG(), M = g.M; return M.setsTo > 1 ? 'sets ' + M.teams[0].sets + '–' + M.teams[1].sets : (M.teams[0].score + ' – ' + M.teams[1].score); }
  function winnerPanels(T, title){ const g = GG(), b = moment(R.ev, T), hero = (b.p && b.p.team === T ? b.p : null) || starOf(T), mate = teamOf(T).find(p => p !== hero), opp = starOf(1 - T), mood = arenaMood(), mode = (typeof PD !== 'undefined' && PD.MODES[g.mode]) || {icon: '🔥', name: 'PyraDive'};
    if(b.trio){ const ids = (b.trio.ids || []).map(P_).filter(Boolean), d = ids[0] || hero, s = ids[1] || mate || hero, k = ids[2] || hero;
      return {mood, panels: [{who: who(d), pose: 'dive', cap: '🔥 1 · Dig', words: 'Dig!'}, {who: who(s), pose: 'jump', cap: '🔥 2 · Set', words: 'Set!'},
        {who: who(k), pose: 'smash', ball: ball(b.ch), ballX: 0.74, ballY: 0.26, cap: '🔥🔥×3 Spirit Trio Dive : ' + moveOf(b.trio), words: b.words},
        {who: who(k), who2: who(d), pose: 'cheer', pose2: 'cheer', ball: ball(b.ch), ballX: 0.8, ballY: 0.2, cap: (title ? '👑 ' : '🏆 ') + scoreCap(), words: title ? 'Pyra… CHAMPION!!' : 'PYRADIVE!!!'}]}; }
    return {mood, panels: [{who: who(hero), who2: mate ? who(mate) : who(opp), pose: 'ready', pose2: 'ready', cap: mode.icon + ' ' + mode.name, words: 'Ready… serve!'},
      {who: who(hero), who2: b.p2 ? who(b.p2) : undefined, pose: 'smash', pose2: b.p2 ? 'smash' : undefined, ball: ball(b.ch), ballX: 0.74, ballY: 0.26, cap: b.cap, words: b.words},
      {who: who(opp), pose: 'facepalm', cap: opp && opp.human ? 'Good game!' : (opp ? who(opp).name : '🤖') + ' · reboot…', words: 'Next time!'},
      {who: who(hero), who2: mate ? who(mate) : undefined, pose: 'cheer', pose2: mate ? 'cheer' : undefined, cap: (title ? '👑 ' + title + ' · ' : '🏆 ') + scoreCap(), words: title ? 'Pyra… CHAMPION!!' : 'PYRADIVE!!!'}]}; }
  const cardW = () => { const c = document.getElementById('result-card'); return Math.max(220, Math.min(520, (c ? c.clientWidth : innerWidth) - 36)); };
  function toCard(make){ let n = 0; const iv = setInterval(() => { const host = document.getElementById('result-card'); let slot = document.getElementById('comic-strip-slot');
      if(!slot && host && host.firstChild && document.getElementById('result') && !document.getElementById('result').classList.contains('hidden')){ slot = document.createElement('div'); slot.className = 'comics-slot'; slot.id = 'comic-strip-slot'; const btns = host.querySelector('.res-btns, #res-btns'); if(btns) btns.after(slot); else host.appendChild(slot); }   // 🏆 the cup card has no slot of its own
      if(slot && !slot.firstChild){ clearInterval(iv); try { slot.appendChild(make()); } catch(err){} } if(++n > 80) clearInterval(iv); }, 250); }
  function impact(p, words, design, sub, ch){ const now = performance.now(); if(!on() || quiet() || cutIn() || R.impacts >= 3 || now - R.lastImpact < 25000) return false; R.impacts++; R.lastImpact = now;
    setTimeout(() => play(Comic.impact({who: who(p), words, design, pose: 'jump', sub, ball: ball(ch), ms: 1100})), 120); return true; }
  GC.listen((mode, e, M) => {
    if(!M) return; if(M !== R.M){ R.M = M; R.ev = []; R.rally = []; R.impacts = 0; R.lastImpact = -1e9; }   // a new match (the page has no reset hook)
    R.ev.push(e); R.rally.push(e); if(R.ev.length > 900) R.ev.splice(0, 300);
    const T0 = myTeam(), p = e.p != null ? P_(e.p) : null, mineP = !!(p && p.human);
    switch(e.k){
      case 'pyra': if(mineP) call('Pyra… ' + up(e.name) + '!'); break;
      case 'edge': if(e.team === T0) call('Pyra… EDGE!'); break;
      case 'longRally': if((e.n || 0) % 5 === 0) call('Pyra… RALLY ×' + e.n + '!'); break;
      case 'point': { const list = R.rally; R.rally = []; if(e.team !== T0 || M.drill) break; const L = k => list.filter(x => x.k === k && x.team === T0 && isLocal(x.p)).pop();
        const pk = list.filter(x => x.k === 'kill' && x.pyra && isLocal(x.p)).pop(), st = L('stuff'), ac = L('ace'), ho = list.filter(x => x.k === 'hoop' && x.team === T0 && isLocal(x.p) && (x.pyra || x.spirit || (x.pts || 0) >= 3)).pop(), ed = list.filter(x => x.k === 'edge' && x.team === T0).pop(), lr = (e.rally || 0) >= 12;
        if(list.some(x => x.k === 'spirit')) break;   // the game's own Spirit cut-in already told it
        const pn = pk && list.filter(x => x.k === 'pyra' && x.p === pk.p).pop(), pick = pk ? [P_(pk.p), 'Pyra… ' + up(pn ? pn.name : pk.by || 'DUNK') + '!!', 'pow', '🔥 ' + (pn ? pn.name : 'Pyra move') + '!', '🔥']
          : st ? [P_(st.p), 'Pyra… STUFFED!!', 'power', '🧱 ' + P_(st.p).name + ' blocks it straight down!', '🧱'] : ed ? [locals()[0], 'Pyra… EDGE!!', 'bullseye', '⚡ It clipped the edge!', '⚡']
          : ho ? [P_(ho.p), 'Pyra… HOOP!!', 'jump', '⭕ ' + (ho.name || 'Hoop') + ' +' + (ho.pts || 1), '⭕'] : ac ? [P_(ac.p), 'Pyra… ACE!!', 'pow', '🚀 Ace!', '🚀'] : lr ? [locals()[0], 'Pyra… RALLY ×' + e.rally + '!', 'rally', '💦 ' + e.rally + '-touch rally!', '💦'] : null;
        if(pick && !impact.apply(null, pick)) call(pick[1].replace('!!', '!')); break; }
      case 'comeback': if(e.team === T0 && !impact(locals()[0], 'Pyra… COMEBACK!', 'close', '💪 From ' + (e.was || 4) + ' points down!', '💪')) call('Pyra… COMEBACK!'); break;
      case 'match': { if(!on()) break; const g = GG(), w = e.winner, people0 = teamOf(w).some(p => p.human), cup = !!(g && g.cup);
        setTimeout(() => { const cs = (typeof SET !== 'undefined' && SET.cupState) || null, champ = cup && cs && cs.done && cs.place === 'champion' ? ((typeof CUPS !== 'undefined' && CUPS[cs.k] && CUPS[cs.k].name) || 'Cup') : '';
          if(people0){ const W = winnerPanels(w, champ), title = (champ ? '👑 ' + champ + ' · ' : '🏆 ') + teamOf(w).filter(p => p.human).map(p => p.name).join(' + ') + ' · PyraDive';
            if(!quiet()) Comic.strip('winner', {panels: W.panels, title, mood: W.mood, crowd: locals().filter(p => p.team !== w).slice(0, 2).map(who), book: people()});   // 📚 G.locals only
            else bookWinner(pageFromDesign('winner', {panels: W.panels, title, mood: W.mood}), people());   // 🌱 Basic: no pop-up, the page still goes into the 📚 book
            toCard(() => Comic.stripEl('winner', {w: cardW(), panels: W.panels, title, mood: W.mood})); }
          else { const me = locals()[0], b = moment(R.ev, me ? me.team : 0), opp = starOf(w);
            toCard(() => Comic.stripEl('divemiss', {w: cardW(), mood: arenaMood(), title: '📖 PyraDive · next time!', panels: [{who: who(opp), pose: 'cheer', ball: ball('🏐'), ballX: 0.72, ballY: 0.28, cap: (opp ? who(opp).name : '🤖') + ' · ' + scoreCap(), words: 'Gotcha!'}, {who: who(me), pose: 'facepalm', cap: b.cap + ' · next time!', words: 'Next time!'}]})); } }, cup ? 1900 : 250);
        break; }
      case 'drillEnd': { if(!on()) break; const me = locals()[0], coach = teamOf(1)[0], st = e.stars || 0, title = '🎯 ' + (me ? me.name : '') + ' · Training ' + '⭐'.repeat(st);
        const panels = [{who: who(coach), pose: 'ready', cap: '🧑‍🏫 Coach', words: st >= 3 ? 'Perfect form!' : 'Again — watch the ball!'}, {who: who(me), pose: st >= 3 ? 'cheer' : 'jump', ball: ball(st >= 3 ? '⭐' : '🎯'), ballX: 0.74, ballY: 0.26, cap: '🎯 ' + (e.score || 0) + ' points' + (e.bestStreak ? ' · 🔗 ×' + e.bestStreak : ''), words: st >= 3 ? 'Pyra… ⭐⭐⭐!' : 'One more go!'}];
        if(st >= 3) bookWinner(pageFromDesign('winner', {panels, title, mood: arenaMood()}), people());
        toCard(() => Comic.stripEl(st >= 3 ? 'winner' : 'divemiss', {w: cardW(), panels, title, mood: arenaMood()})); break; }
    }
  });
  // 💬 Comics chip on the level page (under the levels) + the setup ⚙️ Extras (per player, per device)
  ['comics-slot-menu', 'comics-slot-setup'].forEach((id, k) => { const slot = document.getElementById(id); if(slot && !slot.firstChild){ const b = document.createElement('button'); b.className = 'sp-btn sp-secondary sp-sm'; b.setAttribute('data-sound', 'tap'); b.id = k ? 'comic-chip-setup' : 'comic-chip'; slot.appendChild(b);
    const bind = () => { try { Comic.chip(b, (typeof S !== 'undefined' && S.player) || (typeof CURRENT_PLAYER !== 'undefined' && CURRENT_PLAYER) || 'Guest'); } catch(e){} }; bind(); b.addEventListener('pointerdown', bind, true); } });
  return R;
};
function wire(id){ const f = WIRES[id], GC = window.GameComic; if(!f || !GC || GC._ck) return null; GC._ck = f(GC) || true; return GC._ck; }
document.addEventListener('DOMContentLoaded', () => { try { const id = String((typeof GAME_ID !== 'undefined' && GAME_ID) || window.SP_PAGE || '').replace(/[^a-z0-9]/gi, '').toLowerCase(); if(WIRES[id]) wire(id); } catch(e){} });

/* ================= 📚 ck-1b — the Comic Book: save / load pages (names only; pictures redrawn from today's avatars) ================= */
// a page → what the server keeps (players + crowd become names)
function compact(pg){   // panels that carry {name, av} people (old game strips) get an index into players instead
  const names = (pg.players || []).map(p => p && p.name || p), idx = w => { if(w == null || typeof w === 'number') return w; const n = w.name || 'Robot'; let i = names.indexOf(n); if(i < 0 && names.length < 4){ names.push(n); i = names.length - 1; } return i < 0 ? 0 : i; };
  const panels = (pg.panels || []).map(q => { const c = Object.assign({}, q); delete c.ball; if(c.who != null) c.who = idx(c.who); if(c.who2 != null) c.who2 = idx(c.who2); return c; });
  return JSON.parse(JSON.stringify(Object.assign({}, pg, {panels, players: names, crowd: (pg.crowd || []).map(p => p && p.name || p)}))); }
// a saved page + a name → avatar lookup → a page ready to draw
function expand(pg, avOf){ const o = JSON.parse(JSON.stringify(pg || {})), f = n => ({name: n, av: avOf ? avOf(n) : (window.defaultAvatar ? defaultAvatar(n) : {})}); o.players = (o.players || []).map(f); if(o.crowd) o.crowd = o.crowd.map(f); return o; }
// 💾 games: Comic.save(page, {name, game}) — no PIN for games (max 20 a day); 🎨 maker: {name, pin, game: 'maker'}
function save(pg, o){ o = o || {}; return new Promise((res, rej) => { try { google.script.run.withSuccessHandler(res).withFailureHandler(rej).saveComic(o.name, compact(pg), o.pin || '', o.game || 'maker'); } catch(e){ rej(e); } }); }
// a cover: the last panel big + "#issue title"
function cover(pg, o){ o = o || {}; const c = Object.assign({}, pg, {layout: 'splash', title: (o.issue ? '#' + o.issue + ' ' : '') + (pg.title || ''), panels: [pg.panels[pg.panels.length - 1]]}); return c; }

Object.assign(Comic, {KITS: 'ck-1a', BOOK: 'ck-1b', MANGA: 'ck-1c', WIRED: 'ck-2d', WIRES, wire, noBook: v => { o_noBook = !!v; }, impact: impactPage, strip: stripPage, stripEl: stripElPage, busy: busyAll, clear: clearAll, OLD, DESIGN_PAGE, OLD_POSE, pageFromDesign, lastPage: () => LAST.page, compact, expand, save, cover, lastLayout: () => LAST.layout, MOODS, LINES, CAMS, LAYOUTS, LETTERS, THAI, BUBBLES, RECIPES, ADDONS, recipe, render, page, pageEl, lang, setLang, sfxText, line, layoutPanels,
  drawSfx: sfx, drawBubble: bubble, paintGround});
})();
