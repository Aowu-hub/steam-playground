/* 🏷️ LC LOGO (lc-logo) START — Aowu's Lettercraft picture as the style guide, drawn in code (no picture file) */
/* 🏷️ LcLogo (lc-logo) — the Lettercraft logo, DRAWN IN CODE (Aowu's picture 2026-11-16 = the style guide, no picture file).
   LcLogo.pic(kind, look, px) → cached canvas · LcLogo.url(kind, look, px) → data URL for <img> · LcLogo.draw(g, kind, x, y, px, look) (x, y = centre)
   kind: 'main' (hex board + wordmark + sparkles, for a 🎬 cover) · 'wide' (title-row wordmark with a small hex tile) · 'badge' (hex board only — result card, icons)
   look: a Lettercraft board look key (paper · garden · ocean · candy · space · castle) or 'classic' (= the picture's colours; paper uses it too). Unknown → classic.
   Everything you may want to tune is in LOOK (colours) and BOX (sizes) — the page's own placement sizes are in LC_LOGO_CFG. */
const LcLogo = (() => {
  // letter materials: [light, mid, dark] + grain (wood lines) — one per letter of "Lettercraft"
  const MAT = {
    wood:   ['#FFD08A', '#E0892E', '#8E4A14', 'wood'],
    wood2:  ['#F7C27A', '#C9772A', '#7A3E10', 'wood'],
    green:  ['#C8FF9A', '#46C23A', '#1C6E1E'],
    steel:  ['#E6F6FF', '#7FB2C6', '#2E5568', 'steel'],
    red:    ['#FFB0A0', '#EE3B2E', '#8E1610'],
    orange: ['#FFD89A', '#FF8E1E', '#B24A06'],
    gold:   ['#FFF6B0', '#FFC93A', '#B47A06'],
    lime:   ['#EEFFA8', '#98D628', '#4A7E0C'],
    blue:   ['#BDEBFF', '#2E8EFF', '#123C9E'],
    teal:   ['#C2FFF4', '#21C2B0', '#0A6B66'],
    coral:  ['#FFD2C2', '#FF7A59', '#A8361C'],
    pink:   ['#FFD6EC', '#FF5FAE', '#A11864'],
    purple: ['#E6D6FF', '#9A5BFF', '#4A1E9E'],
    sky:    ['#E2F6FF', '#5BC8FF', '#1A6EA8'],
    mint:   ['#DFFFF0', '#4FDDA0', '#167A50'],
    sun:    ['#FFF4C0', '#FFB21E', '#A86406'],
    lilac:  ['#F2E8FF', '#C29BFF', '#6A3EB4'],
    stone:  ['#F2EEE6', '#B7AC98', '#5E5446'],
    neon:   ['#E6FFFF', '#3CF2FF', '#1A6AD8'],
    magenta:['#FFE0FA', '#FF3CD2', '#8E0E7A']
  };
  // one LOOK per board: 11 letter materials · frame plank colours · glow left / right · inside of the hex · tile colours · sparkle colours
  const LOOK = {
    classic: {mats: ['wood', 'wood2', 'wood', 'wood2', 'green', 'steel', 'red', 'orange', 'gold', 'lime', 'blue'],
              frame: ['#F2B266', '#B8662A', '#6E3A12'], glowL: '#FF9A2A', glowR: '#3CC8FF', back: ['#1E3466', '#0A1430'], grid: 'rgba(120,170,255,.22)',
              tile: ['#FFF4D8', '#E8C98E'], tink: '#3A2410', spark: ['#FFD54A', '#7CF2FF', '#FF6AD5', '#9BFF6A'], ink: '#2A1206', rim: '#FFE7A8'},
    garden:  {mats: ['lime', 'green', 'sun', 'mint', 'green', 'wood', 'coral', 'sun', 'gold', 'lime', 'sky'],
              frame: ['#CDE58A', '#6E9A2A', '#3A5410'], glowL: '#FFD23F', glowR: '#7CFF7A', back: ['#24502A', '#0C2410'], grid: 'rgba(170,255,140,.2)',
              tile: ['#FFFBEA', '#E6D9A0'], tink: '#2E4A1A', spark: ['#FFE14A', '#9BFF6A', '#FF8AC0', '#FFFFFF'], ink: '#1E2E0A', rim: '#F4FFC8'},
    ocean:   {mats: ['sky', 'teal', 'blue', 'sky', 'mint', 'steel', 'coral', 'teal', 'sun', 'sky', 'blue'],
              frame: ['#B8E6F2', '#4A90A8', '#1E4E66'], glowL: '#3CE0FF', glowR: '#7AFFE0', back: ['#0E4A78', '#03182E'], grid: 'rgba(140,220,255,.22)',
              tile: ['#FFFFFF', '#CFEAF5'], tink: '#0B3A5C', spark: ['#9FF2FF', '#FFFFFF', '#FF9A7A', '#7AFFE0'], ink: '#062236', rim: '#E6FBFF'},
    candy:   {mats: ['pink', 'lilac', 'sky', 'pink', 'mint', 'lilac', 'red', 'sun', 'gold', 'mint', 'sky'],
              frame: ['#FFC2E0', '#E0569B', '#8E1E5A'], glowL: '#FF6AD5', glowR: '#7CD8FF', back: ['#6A1E58', '#2A0822'], grid: 'rgba(255,170,220,.22)',
              tile: ['#FFFFFF', '#FFD6EA'], tink: '#7A1050', spark: ['#FFE14A', '#FFFFFF', '#FF6AD5', '#7CD8FF'], ink: '#4A0A30', rim: '#FFE6F4'},
    space:   {mats: ['purple', 'neon', 'magenta', 'purple', 'neon', 'steel', 'magenta', 'sky', 'gold', 'neon', 'purple'],
              frame: ['#B8A8FF', '#5A4AB8', '#241A5C'], glowL: '#FF3CD2', glowR: '#3CF2FF', back: ['#1E1450', '#05031A'], grid: 'rgba(160,140,255,.24)',
              tile: ['#EDE8FF', '#B8ACEA'], tink: '#22195C', spark: ['#FFFFFF', '#3CF2FF', '#FF3CD2', '#FFE14A'], ink: '#0E0830', rim: '#E6E0FF'},
    castle:  {mats: ['stone', 'lilac', 'gold', 'stone', 'purple', 'steel', 'red', 'gold', 'sun', 'lilac', 'blue'],
              frame: ['#E8E0D0', '#9A8E78', '#4E4638'], glowL: '#FFC94A', glowR: '#B89BFF', back: ['#3A2E66', '#120C2A'], grid: 'rgba(200,180,255,.22)',
              tile: ['#FFFBF0', '#E2D6BC'], tink: '#2E2450', spark: ['#FFD54A', '#FFFFFF', '#C29BFF', '#FF8A6A'], ink: '#1A1230', rim: '#FFF0C8'}
  };
  LOOK.paper = LOOK.classic;   // 📒 Notebook (the default board) wears the picture's colours
  const WORD = 'Lettercraft';
  const FONT = (px) => '700 ' + px + 'px Fredoka, Nunito, "Arial Rounded MT Bold", sans-serif';
  const cache = {}; let SC = 1;   // SC = current scale (shadowBlur is not scaled by the canvas transform)
  const lin = (g, x0, y0, x1, y1, st) => { const q = g.createLinearGradient(x0, y0, x1, y1); st.forEach((c, i) => q.addColorStop(i / (st.length - 1), c)); return q; };
  const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };   // fixed "random" → the same picture every time

  function hexPath(g, r){ g.beginPath(); for(let i = 0; i < 6; i++){ const a = -Math.PI / 2 + i * Math.PI / 3; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); }   // pointy top, flat sides
  function star(g, x, y, r, c){ g.save(); g.translate(x, y); g.fillStyle = c; g.shadowColor = c; g.shadowBlur = r * 1.6 * SC; g.beginPath();
    for(let i = 0; i < 8; i++){ const a = i * Math.PI / 4, rr = i % 2 ? r * 0.22 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.restore(); }
  function gear(g, x, y, r, c, teeth){ g.save(); g.translate(x, y); g.fillStyle = c; g.beginPath();
    for(let i = 0; i < teeth * 2; i++){ const a = i * Math.PI / teeth, rr = i % 2 ? r * 0.8 : r; g.lineTo(Math.cos(a - 0.12) * rr, Math.sin(a - 0.12) * rr); g.lineTo(Math.cos(a + 0.12) * rr, Math.sin(a + 0.12) * rr); }
    g.closePath(); g.arc(0, 0, r * 0.36, 0, 7, true); g.fill('evenodd'); g.restore(); }

  function tile(g, L, x, y, s, ch, pts){   // one cream letter tile with its points (like the game's tiles)
    g.save(); g.translate(x, y);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.roundRect(-s / 2 + s * 0.04, -s / 2 + s * 0.08, s, s, s * 0.16); g.fill();
    g.fillStyle = lin(g, 0, -s / 2, 0, s / 2, L.tile); g.beginPath(); g.roundRect(-s / 2, -s / 2, s, s, s * 0.16); g.fill();
    g.lineWidth = s * 0.05; g.strokeStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.moveTo(-s * 0.36, -s * 0.42); g.lineTo(s * 0.36, -s * 0.42); g.stroke();
    g.fillStyle = L.tink; g.font = FONT(Math.round(s * 0.62)); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, -s * 0.04, s * 0.04);
    if(pts){ g.font = FONT(Math.round(s * 0.24)); g.fillText(String(pts), s * 0.32, s * 0.3); }
    g.restore();
  }
  const PTS = {W: 4, O: 1, R: 1, D: 2, P: 3, L: 1, A: 1, Y: 4, M: 3, C: 3};
  function board(g, L, R, plain){   // the hex board: glow, inside, grid, tiles, wooden frame — centre (0,0), radius R
    // outer glow: warm on the left, cool on the right
    [[L.glowL, -1], [L.glowR, 1]].forEach(([c, side]) => {
      g.save(); g.beginPath(); g.rect(side < 0 ? -R * 1.6 : 0, -R * 1.6, R * 1.6, R * 3.2); g.clip();
      g.shadowColor = c; g.shadowBlur = R * 0.22 * SC; g.lineWidth = R * 0.07; g.strokeStyle = c; hexPath(g, R * 1.03); g.stroke(); g.restore();
    });
    hexPath(g, R); g.fillStyle = lin(g, 0, -R, 0, R, L.back); g.fill();
    g.save(); hexPath(g, R * 0.93); g.clip();
    const cs = R * 0.24;   // cells
    g.strokeStyle = L.grid; g.lineWidth = R * 0.008;
    for(let k = -5; k <= 5; k++){ g.beginPath(); g.moveTo(k * cs, -R); g.lineTo(k * cs, R); g.stroke(); g.beginPath(); g.moveTo(-R, k * cs); g.lineTo(R, k * cs); g.stroke(); }
    for(let j = -3; j <= 3; j++) for(let i = -3; i <= 3; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.03 + 0.04 * rnd(i * 7 + j)) + ')'; g.fillRect(i * cs - cs / 2 + 2, j * cs - cs / 2 + 2, cs - 4, cs - 4); }
    // a little crossword: WORD across the top, PLAY across the bottom, joined by a down word (CRAFT) — the wordmark sits over the middle row
    const s = cs * 0.9, put = (w, i0, j0, di, dj) => [...w].forEach((ch, k) => tile(g, L, (i0 + k * di) * cs, (j0 + k * dj) * cs, s, ch, PTS[ch]));
    if(plain){ g.save(); g.rotate(-0.08); tile(g, L, -cs * 0.3, -cs * 0.25, cs * 3.1, 'L', 1); g.restore(); tile(g, L, cs * 1.55, cs * 1.45, cs * 1.45, 'C', 3); }   // small sizes: one big tile you can read
    else { put('WORD', -2, -2, 1, 0); put('DRAMA', 1, -2, 0, 1); put('PLAY', -1, 2, 1, 0); }   // WORD ⟂ DRAMA ⟂ PLAY (a real crossword)
    g.restore();
    // wooden plank frame: 6 planks with bolts
    for(let i = 0; i < 6; i++){
      const a0 = -Math.PI / 2 + i * Math.PI / 3, a1 = a0 + Math.PI / 3, ro = R * 1.0, ri = R * 0.88;
      const p = [[Math.cos(a0) * ro, Math.sin(a0) * ro], [Math.cos(a1) * ro, Math.sin(a1) * ro], [Math.cos(a1) * ri, Math.sin(a1) * ri], [Math.cos(a0) * ri, Math.sin(a0) * ri]];
      g.beginPath(); p.forEach(([x, y]) => g.lineTo(x, y)); g.closePath();
      const mx = (p[0][0] + p[1][0]) / 2, my = (p[0][1] + p[1][1]) / 2;
      g.fillStyle = lin(g, mx * 0.88, my * 0.88, mx, my, [L.frame[1], L.frame[0], L.frame[1]]); g.fill();
      g.lineWidth = R * 0.012; g.strokeStyle = L.frame[2]; g.stroke();
      g.save(); g.clip(); g.strokeStyle = 'rgba(80,36,8,.28)'; g.lineWidth = R * 0.006;   // grain
      for(let q = 0; q < 3; q++){ const t = 0.25 + q * 0.25; g.beginPath(); g.moveTo(p[0][0] + (p[3][0] - p[0][0]) * t, p[0][1] + (p[3][1] - p[0][1]) * t); g.lineTo(p[1][0] + (p[2][0] - p[1][0]) * t, p[1][1] + (p[2][1] - p[1][1]) * t); g.stroke(); }
      g.restore();
      [0.18, 0.82].forEach(t => { const bx = p[0][0] + (p[1][0] - p[0][0]) * t, by = p[0][1] + (p[1][1] - p[0][1]) * t, cx = bx * 0.94, cy = by * 0.94;
        g.fillStyle = L.frame[2]; g.beginPath(); g.arc(cx, cy, R * 0.022, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(cx - R * 0.006, cy - R * 0.006, R * 0.009, 0, 7); g.fill(); });
    }
    g.lineWidth = R * 0.016; g.strokeStyle = L.frame[2]; hexPath(g, R); g.stroke();
  }

  // the wordmark: every letter its own material, a dark outline + a light rim, a soft glow, a little bounce
  let LETTER = null;   // one scratch canvas for the per-letter fill
  function wordmark(g, L, cx, cy, px, maxW){
    g.save(); g.font = FONT(px);
    const big = 1.2, sizes = [...WORD].map((ch, i) => i === 0 ? px * big : px);
    const ws = [...WORD].map((ch, i) => { g.font = FONT(sizes[i]); return g.measureText(ch).width; });
    const gap = -px * 0.02, tot = ws.reduce((a, b) => a + b, 0) + gap * (WORD.length - 1), k = Math.min(1, maxW / tot);
    g.translate(cx, cy); g.scale(k, k);
    let x = -tot / 2; const lay = [...WORD].map((ch, i) => { const o = {ch, x: x + ws[i] / 2, y: Math.sin(i * 1.3) * px * 0.05 + (i === 0 ? px * 0.06 : 0), r: (i % 2 ? 1 : -1) * 0.05 + (i === 0 ? -0.06 : 0), px: sizes[i], m: MAT[L.mats[i]] || MAT.wood}; x += ws[i] + gap; return o; });
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    const each = (fn) => lay.forEach(o => { g.save(); g.translate(o.x, o.y); g.rotate(o.r); g.font = FONT(o.px); fn(o); g.restore(); });
    // 1 glow + rim + outline (whole word first, so letters never cut each other's outline)
    g.save(); g.shadowColor = L.glowL; g.shadowBlur = px * 0.24 * SC * k; each(o => { g.lineWidth = o.px * 0.34; g.strokeStyle = L.ink; g.strokeText(o.ch, 0, 0); }); g.restore();
    each(o => { g.lineWidth = o.px * 0.34; g.strokeStyle = L.rim; g.strokeText(o.ch, 0, o.px * 0.02); });
    each(o => { g.lineWidth = o.px * 0.24; g.strokeStyle = L.ink; g.strokeText(o.ch, 0, o.px * 0.05); g.strokeText(o.ch, 0, 0); });
    // 2 fills, each letter on the scratch canvas (gradient + wood grain / steel lines + gloss)
    const sc = SC * k, side = Math.ceil(px * big * 1.6 * sc) + 4;
    if(!LETTER) LETTER = document.createElement('canvas');
    each(o => {
      const c = LETTER; c.width = side; c.height = side; const q = c.getContext('2d'), h = o.px;
      q.setTransform(sc, 0, 0, sc, side / 2, side / 2); q.font = FONT(o.px); q.textAlign = 'center'; q.textBaseline = 'middle';
      q.fillStyle = lin(q, 0, -h * 0.45, 0, h * 0.45, [o.m[0], o.m[1], o.m[2]]); q.fillText(o.ch, 0, 0);
      q.globalCompositeOperation = 'source-atop';
      if(o.m[3] === 'wood'){ q.strokeStyle = 'rgba(110,50,10,.35)'; q.lineWidth = h * 0.025; for(let n = 0; n < 7; n++){ const yy = -h * 0.5 + n * h * 0.16; q.beginPath(); q.moveTo(-h, yy); q.bezierCurveTo(-h * 0.3, yy + h * 0.06 * (n % 2 ? 1 : -1), h * 0.3, yy - h * 0.05, h, yy + h * 0.03); q.stroke(); } }
      if(o.m[3] === 'steel'){ q.fillStyle = 'rgba(255,255,255,.25)'; for(let n = -3; n <= 3; n++) q.fillRect(n * h * 0.16, -h, h * 0.05, h * 2); }
      q.fillStyle = lin(q, 0, -h * 0.5, 0, 0, ['rgba(255,255,255,.75)', 'rgba(255,255,255,0)']); q.beginPath(); q.ellipse(-h * 0.06, -h * 0.22, h * 0.42, h * 0.16, -0.15, 0, 7); q.fill();   // gloss
      q.fillStyle = 'rgba(0,0,0,.18)'; q.fillRect(-h, h * 0.18, h * 2, h);   // shade at the bottom
      g.drawImage(c, -side / 2 / sc, -side / 2 / sc, side / sc, side / sc);
    });
    g.restore();
  }

  function main(g, L){   // unit box 680 × 420: hex board, the wordmark across it, gears, floating letters + sparkles
    gear(g, -150, -150, 34, 'rgba(255,200,90,.28)', 9); gear(g, 160, 150, 28, 'rgba(120,220,255,.25)', 8); gear(g, 185, -128, 18, 'rgba(255,200,90,.22)', 7);
    board(g, L, 172, false);
    [['A', -270, -120, 0], ['B', 262, 118, 1], ['C', -232, 132, 2], ['+', 250, -140, 3], ['×', 292, -36, 1], ['?', -300, 20, 3]].forEach(([ch, x, y, n]) => {
      g.save(); g.font = FONT(ch.length && /[A-Z]/.test(ch) ? 34 : 30); g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = L.spark[n]; g.shadowBlur = 14 * SC; g.lineWidth = 6; g.strokeStyle = L.ink; g.strokeText(ch, x, y); g.fillStyle = L.spark[n]; g.fillText(ch, x, y); g.restore(); });
    [[-210, -175, 9, 0], [214, -186, 7, 1], [-306, -60, 6, 2], [306, 74, 8, 0], [-196, 186, 7, 3], [120, 196, 6, 1], [-60, -205, 5, 2]].forEach(([x, y, r, n]) => star(g, x, y, r, L.spark[n]));
    wordmark(g, L, 0, 6, 104, 640);
  }
  function wide(g, L){   // unit box 760 × 190: a small hex board on the left, the wordmark on the right
    g.save(); g.translate(-300, 0); board(g, L, 76, true); g.restore();
    star(g, -232, -70, 7, L.spark[0]); star(g, -360, 66, 5, L.spark[1]);
    wordmark(g, L, 76, 4, 118, 560);
  }
  function badge(g, L){ board(g, L, 118, true); star(g, 96, -104, 9, L.spark[0]); star(g, -104, 92, 7, L.spark[1]); }   // unit box 272 × 280

  const BOX = {main: [680, 420], wide: [760, 190], badge: [272, 280]};   // room for the glow
  function draw(g, kind, x, y, px, look){   // px = width on screen
    const L = LOOK[look] || LOOK.classic, [bw] = BOX[kind] || BOX.badge, s = px / bw; SC = s;
    g.save(); g.translate(x, y); g.scale(s, s);
    kind === 'main' ? main(g, L) : kind === 'wide' ? wide(g, L) : badge(g, L);
    g.restore();
  }
  function pic(kind, look, px){
    px = Math.max(16, Math.round(px)); const key = kind + ':' + (LOOK[look] ? look : 'classic') + ':' + px; if(cache[key]) return cache[key];
    const [bw, bh] = BOX[kind] || BOX.badge, c = document.createElement('canvas'); c.width = px; c.height = Math.round(px * bh / bw);
    draw(c.getContext('2d'), kind, px / 2, c.height / 2, px, look);
    return (cache[key] = c);
  }
  const url = (kind, look, px) => pic(kind, look, px).toDataURL('image/png');
  const clear = () => { for(const k in cache) delete cache[k]; };   // after the web fonts arrive
  return {draw, pic, url, clear, LOOK, MAT, BOX, WORD};
})();
if(typeof window !== 'undefined') window.LcLogo = LcLogo;

/* 🎛️ LC_LOGO_CFG — the ONE place to control how the logo sits in this page (Aowu 2026-11-16: "so the design can be controlled") */
const LC_LOGO_CFG = {
  title:  {kind: 'wide', h: 74, hPhone: 58, hShort: 40, maxW: 520, follow: true},   // title rows (👋 Who's playing + start page) · px tall · follow = recolour with the picked board look
  result: {kind: 'badge', w: 58, wPhone: 46, on: true},                          // corner badge on the 🏁 result card (look = the board you played)
  cover:  {kind: 'main', look: 'classic'}                                         // for the 🎬 cover later (🧱 B3): LcLogo.draw(g, 'main', x, y, px, look)
};
function lcLook(){ try { return theme || 'classic'; } catch(e){ return 'classic'; } }
function lcLogos(){
  try {
    const C = LC_LOGO_CFG.title, short = innerHeight < 520 && innerWidth > innerHeight, phone = innerWidth < 640;
    const h = short ? C.hShort : phone ? C.hPhone : C.h, dpr = Math.min(3, window.devicePixelRatio || 1), [bw, bh] = LcLogo.BOX[C.kind], w = Math.round(h * bw / bh);
    ['scr-player', 'scr-menu'].forEach(id => {
      const t = document.querySelector('#' + id + ' .title'); if(!t) return;
      let im = t.querySelector('.lcl-word');
      if(!im){ im = document.createElement('img'); im.className = 'lcl-word'; im.alt = ''; im.setAttribute('aria-hidden', 'true'); im.draggable = false; t.insertBefore(im, t.querySelector('h1')); }
      const look = id === 'scr-menu' && C.follow ? lcLook() : 'classic', key = look + ':' + w + ':' + dpr;
      if(im.dataset.k !== key){ im.src = LcLogo.url(C.kind, look, w * dpr); im.dataset.k = key; }
      t.style.setProperty('--lcl-h', h + 'px'); t.style.setProperty('--lcl-maxw', C.maxW + 'px'); t.classList.add('has-logo');
    });
  } catch(e){ document.querySelectorAll('.title.has-logo').forEach(t => t.classList.remove('has-logo')); }   // any failure → today's 🔤 + text title
}
function lcResultBadge(){
  try {
    const C = LC_LOGO_CFG.result, card = document.getElementById('result-card'); if(!C.on || !card || !card.querySelector('.standings') || card.querySelector('.lcl-badge')) return;   // real results only (not the setup cards)
    let look = lcLook(); try { if(G && G.theme) look = G.theme; } catch(e){}
    const w = innerWidth < 640 ? C.wPhone : C.w, dpr = Math.min(3, window.devicePixelRatio || 1), im = document.createElement('img');
    im.className = 'lcl-badge'; im.alt = ''; im.setAttribute('aria-hidden', 'true'); im.draggable = false; im.src = LcLogo.url(C.kind, look, w * dpr); im.style.setProperty('--lcl-badge', w + 'px');
    card.prepend(im);
  } catch(e){}
}
(function(){
  const ss = showScreen; showScreen = function(){ const r = ss.apply(this, arguments); lcLogos(); return r; };
  const sr = showResult; showResult = function(){ const r = sr.apply(this, arguments); lcResultBadge(); return r; };
  const tl = document.getElementById('theme-list'); if(tl) tl.addEventListener('click', () => setTimeout(lcLogos, 0));   // the board pick recolours the title
  let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(lcLogos, 120); });
  lcLogos();
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(() => { LcLogo.clear(); document.querySelectorAll('.lcl-word').forEach(im => delete im.dataset.k); lcLogos(); });   // Fredoka arrives → redraw
})();
/* 🏷️ LC LOGO END */