// 🏷️ LOGO algebros START — ➗ Algebros, moved word for word from NumberBoard.html AlgLogo (al-1, approved in its game) by move_st2c.py (gl-r22, 📡 st-2c)
// glue only: kit boxes in units (main 1.8 : 1 · wide 4.2 : 1 · badge 0.86 : 1), the small-size details still follow the real px
GameLogos.add('algebros', (function () {
var AL = (function(){
  const BOX = {main: 1 / 1.8, wide: 1 / 4.2, badge: 1 / 0.86};   // height = width × BOX
  // per look: shield rim (light → dark), glow, panel (top → bottom), tile + ink, letters (8, one per letter), accents for symbols
  const LOOK = {
    classic: {rim: ['#BFE6FF', '#3B8BFF', '#1B3F9E'], glow: '#4FB2FF', panel: ['#173A7A', '#0B1E46'], grid: 'rgba(120,190,255,0.28)', tile: '#F4F8FF', tink: '#1B2B55',
      letters: [['#7AD6FF', '#1C72E0'], ['#FFC06A', '#F2700F'], ['#FFB25A', '#EE6410'], ['#FFC861', '#F08A12'], ['#7AD6FF', '#1C72E0'], ['#FFEC8A', '#DDA012'], ['#FFEC8A', '#DDA012'], ['#FFEC8A', '#DDA012']],
      acc: ['#FFB000', '#4FB2FF', '#3DDC97', '#FF6B8A'], gear: ['#FFB43D', '#4F8DFF']},
    wood: {rim: ['#FFE2B0', '#C98A45', '#6B3E17'], glow: '#FFB45E', panel: ['#7A4A22', '#3E230C'], grid: 'rgba(255,215,160,0.25)', tile: '#FFF3D6', tink: '#4A2E12',
      letters: [['#FFD38A', '#C9792A'], ['#9AD3F2', '#3D7DD8'], ['#F7B2BE', '#E5484D'], ['#FFD38A', '#C9792A'], ['#9AD3F2', '#3D7DD8'], ['#FFE59A', '#E0A12A'], ['#FFE59A', '#E0A12A'], ['#FFE59A', '#E0A12A']],
      acc: ['#E0A12A', '#3D7DD8', '#7BBF5A', '#E5484D'], gear: ['#D9A35E', '#8A5A2B']},
    ocean: {rim: ['#CFF6FF', '#2FA8D8', '#0B4A78'], glow: '#5FE0F0', panel: ['#0F5C8E', '#06294A'], grid: 'rgba(150,230,255,0.28)', tile: '#FFFFFF', tink: '#0B3A5C',
      letters: [['#7FE3D4', '#13A89E'], ['#FFC6A8', '#FF7A59'], ['#FFC6A8', '#FF7A59'], ['#7FE3D4', '#13A89E'], ['#9FDBFF', '#2F8CE0'], ['#FFF0A0', '#F0B020'], ['#FFF0A0', '#F0B020'], ['#FFF0A0', '#F0B020']],
      acc: ['#FFD54D', '#7FE3D4', '#FF7A59', '#FFFFFF'], gear: ['#7FE3D4', '#2F8CE0']},
    candy: {rim: ['#FFE3F1', '#E0569B', '#8A1E5C'], glow: '#FF8AC4', panel: ['#B03A7C', '#5E0F3C'], grid: 'rgba(255,200,230,0.3)', tile: '#FFFFFF', tink: '#7A1050',
      letters: [['#BFE9FF', '#5BB8F5'], ['#FFE59A', '#FF9F1C'], ['#FF9AC8', '#E0569B'], ['#BFE9FF', '#5BB8F5'], ['#C9B8FF', '#8A6BEF'], ['#FFE59A', '#FF9F1C'], ['#FFE59A', '#FF9F1C'], ['#FFE59A', '#FF9F1C']],
      acc: ['#FF9F1C', '#5BB8F5', '#B98CFF', '#FFFFFF'], gear: ['#FFB8D9', '#8A6BEF']},
    space: {rim: ['#E6DEFF', '#7A5CFF', '#2A1A7A'], glow: '#A98BFF', panel: ['#2E2466', '#0C0826'], grid: 'rgba(180,160,255,0.28)', tile: '#EDE8FF', tink: '#22195C',
      letters: [['#8FC0FF', '#3F8CFF'], ['#FF8AC0', '#FF4D8D'], ['#E08AFF', '#C04FD8'], ['#8FC0FF', '#3F8CFF'], ['#8FC0FF', '#3F6CE8'], ['#FFF08A', '#FFC21F'], ['#FFF08A', '#FFC21F'], ['#FFF08A', '#FFC21F']],
      acc: ['#FFC21F', '#3F8CFF', '#FF4D8D', '#FFFFFF'], gear: ['#8A7BFF', '#C04FD8']},
    jungle: {rim: ['#E2F7D2', '#5DB43F', '#24461A'], glow: '#9ED97A', panel: ['#2F6B22', '#122C0C'], grid: 'rgba(200,245,170,0.25)', tile: '#FFFBEA', tink: '#24461A',
      letters: [['#9BE0F0', '#2C9CC0'], ['#FFD08A', '#E8742A'], ['#FFB07A', '#E0541F'], ['#9BE0F0', '#2C9CC0'], ['#B8F08A', '#4FA82C'], ['#FFF08A', '#F0B020'], ['#FFF08A', '#F0B020'], ['#FFF08A', '#F0B020']],
      acc: ['#F0B020', '#2C9CC0', '#E8742A', '#FFFFFF'], gear: ['#9ED97A', '#E8742A']},
    robot: {rim: ['#F2F6FA', '#8FA3B6', '#34424F'], glow: '#9EE6FF', panel: ['#4B5A69', '#1E2730'], grid: 'rgba(160,230,255,0.28)', tile: '#FFFFFF', tink: '#22303D',
      letters: [['#9EE6FF', '#2FA8D8'], ['#FFC07A', '#FF8A3D'], ['#FFA07A', '#E8602A'], ['#9EE6FF', '#2FA8D8'], ['#C8D6E4', '#6F8499'], ['#FFE07A', '#F0B020'], ['#FFE07A', '#F0B020'], ['#FFE07A', '#F0B020']],
      acc: ['#FFE07A', '#2FA8D8', '#FF8A3D', '#FFFFFF'], gear: ['#AEBBC8', '#FF8A3D']}
  };
  const WORD = 'Algebros';
  const FONT = "'Fredoka', 'Nunito', 'Arial Rounded MT Bold', system-ui, sans-serif";
  // our own little crossword inside the shield (true sentences): 2 + 6 = 8 across, 8 − 1 = 7 down, x = 9 down, 9 − 2 = 7 across
  const GRID = {c: 7, r: 9, tiles: [
    [0, 1, '2'], [0, 2, '+'], [0, 3, '6'], [0, 4, '='], [0, 5, '8'],
    [1, 1, '×'], [2, 1, '4'], [3, 1, '='], [4, 1, '8'],
    [2, 2, '−'], [2, 3, '3'], [2, 4, '='], [2, 5, '1'], [1, 5, '−'], [3, 5, '='], [4, 5, '7'],
    [4, 2, '−'], [4, 3, '1'], [4, 4, '='],
    [5.75, 2, 'x'], [5.75, 3, '='], [5.75, 4, '9']]};
  const cache = new Map();
  const lk = k => LOOK[k] || LOOK.classic;

  function shieldPath(g, cx, top, w, h){   // flat top with cut corners, curved sides down to a point
    const l = cx - w / 2, r = cx + w / 2, c = w * 0.1, b = top + h;
    g.beginPath();
    g.moveTo(l + c, top); g.lineTo(r - c, top); g.lineTo(r, top + c);
    g.lineTo(r, top + h * 0.5);
    g.bezierCurveTo(r, top + h * 0.78, cx + w * 0.22, top + h * 0.9, cx, b);
    g.bezierCurveTo(cx - w * 0.22, top + h * 0.9, l, top + h * 0.78, l, top + h * 0.5);
    g.lineTo(l, top + c); g.closePath();
  }
  function shield(g, L, cx, top, w, h, opt){
    opt = opt || {};
    const lw = Math.max(2, w * 0.05);
    // glow
    g.save(); g.shadowColor = L.glow; g.shadowBlur = w * 0.16; shieldPath(g, cx, top, w, h); g.fillStyle = L.rim[2]; g.fill(); g.restore();
    // chrome rim
    let gr = g.createLinearGradient(cx - w / 2, top, cx + w / 2, top + h);
    gr.addColorStop(0, L.rim[0]); gr.addColorStop(0.45, L.rim[1]); gr.addColorStop(1, L.rim[2]);
    shieldPath(g, cx, top, w, h); g.fillStyle = gr; g.fill();
    g.lineWidth = Math.max(1, lw * 0.25); g.strokeStyle = 'rgba(10,20,50,0.75)'; g.stroke();
    // inner panel
    const iw = w - lw * 2, ih = h - lw * 2.2, it = top + lw;
    gr = g.createLinearGradient(0, it, 0, it + ih); gr.addColorStop(0, L.panel[0]); gr.addColorStop(1, L.panel[1]);
    shieldPath(g, cx, it, iw, ih); g.fillStyle = gr; g.fill();
    g.save(); shieldPath(g, cx, it, iw, ih); g.clip();
    // grid lines + crossword tiles
    const cs = iw / GRID.c, gx = cx - iw / 2, gy = it + cs * 0.15;
    g.strokeStyle = L.grid; g.lineWidth = Math.max(0.6, cs * 0.04);
    for(let i = 0; i <= GRID.c; i++){ g.beginPath(); g.moveTo(gx + i * cs, it); g.lineTo(gx + i * cs, it + ih); g.stroke(); }
    for(let j = 0; j <= GRID.r + 1; j++){ g.beginPath(); g.moveTo(gx, gy + j * cs); g.lineTo(gx + iw, gy + j * cs); g.stroke(); }
    if(!opt.noTiles){
      g.textAlign = 'center'; g.textBaseline = 'middle';
      GRID.tiles.forEach(([row, col, ch]) => {
        const x = gx + col * cs + cs * 0.08, y = gy + row * cs + cs * 0.08, s = cs * 0.84;
        if(y + s > it + ih) return;
        rr(g, x, y + s * 0.06, s, s, s * 0.16); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fill();
        rr(g, x, y, s, s, s * 0.16); g.fillStyle = L.tile; g.fill();
        g.fillStyle = L.tink; g.font = '700 ' + (s * 0.62) + 'px ' + FONT; g.fillText(ch, x + s / 2, y + s * 0.54);
      });
    }
    // shine
    gr = g.createLinearGradient(cx - iw / 2, it, cx + iw * 0.1, it + ih * 0.6);
    gr.addColorStop(0, 'rgba(255,255,255,0.22)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.04)'); gr.addColorStop(0.5001, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(cx - iw / 2, it, iw, ih);
    g.restore();
    // rim highlight
    g.save(); shieldPath(g, cx, top + lw * 0.3, w - lw * 0.6, h - lw * 0.7); g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = Math.max(0.8, lw * 0.18); g.stroke(); g.restore();
  }
  function rr(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function star(g, x, y, r, col){
    g.save(); g.fillStyle = col; g.shadowColor = col; g.shadowBlur = r * 1.2; g.beginPath();
    for(let i = 0; i < 8; i++){ const a = i * Math.PI / 4 - Math.PI / 2, d = i % 2 ? r * 0.28 : r; g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); }
    g.closePath(); g.fill(); g.restore();
  }
  function gear(g, x, y, r, col, rot){
    g.save(); g.translate(x, y); g.rotate(rot || 0);
    const n = 9; g.beginPath();
    for(let i = 0; i < n * 2; i++){ const a0 = i * Math.PI / n, d = i % 2 ? r * 0.78 : r; g.arc(0, 0, d, a0 - 0.12, a0 + Math.PI / n - 0.12); }
    g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = Math.max(1, r * 0.08); g.strokeStyle = 'rgba(10,20,50,0.6)'; g.stroke();
    g.beginPath(); g.arc(0, 0, r * 0.36, 0, Math.PI * 2); g.fillStyle = 'rgba(10,20,50,0.55)'; g.fill();
    g.beginPath(); g.arc(-r * 0.2, -r * 0.25, r * 0.5, Math.PI * 1.05, Math.PI * 1.6); g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = r * 0.1; g.stroke();
    g.restore();
  }
  function eyes_unused(g, x, y, s, look){   // two googly eyes peeking over a letter (the picture's cheeky letters)
    [-1, 1].forEach(k => {
      const ex = x + k * s * 0.62;
      g.beginPath(); g.ellipse(ex, y, s * 0.58, s * 0.66, 0, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      g.lineWidth = Math.max(1, s * 0.16); g.strokeStyle = '#1A1F3A'; g.stroke();
      g.beginPath(); g.arc(ex + s * 0.14 + look * s * 0.1, y + s * 0.12, s * 0.27, 0, Math.PI * 2); g.fillStyle = '#1A1F3A'; g.fill();
      g.beginPath(); g.arc(ex + s * 0.05 + look * s * 0.1, y - s * 0.02, s * 0.09, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
    });
  }
  // the bubbly 3D word, stroked like Aowu's original: outer bright ring → ONE dark outline round the whole word → extrusion →
  // coloured faces on their own layer (fill over stroke) with an inner light bevel, a faint blueprint grid and a top shine
  function bubbly(g, L, items, size, opt){
    opt = opt || {};
    const bold = size * 0.022, out = size * 0.12 + bold, depth = size * 0.075, ring = Math.max(1.2, size * 0.05);   /* bold = extra weight (the original's letters are chunkier than the font) */
    g.save(); g.font = '700 ' + size + 'px ' + FONT; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.lineJoin = 'round'; g.lineCap = 'round';
    const each = (gg, fn) => items.forEach((p, i) => { gg.save(); gg.translate(p.x + p.w / 2, p.y); gg.rotate(p.rot || 0); fn(gg, p, i); gg.restore(); });
    // 1 · outer ring (the bright edge round the whole word) + glow
    each(g, (gg, p) => { gg.shadowColor = L.glow; gg.shadowBlur = size * 0.18; gg.lineWidth = (out + ring) * 2; gg.strokeStyle = L.rim[1]; gg.strokeText(p.ch, -p.w / 2, depth); gg.strokeText(p.ch, -p.w / 2, 0); });
    each(g, (gg, p) => { gg.lineWidth = (out + ring * 0.45) * 2; gg.strokeStyle = L.rim[0]; gg.globalAlpha = 0.9; gg.strokeText(p.ch, -p.w / 2, depth * 0.5); });
    // 2 · one dark outline for all letters
    each(g, (gg, p) => { gg.lineWidth = out * 2; gg.strokeStyle = '#0B1230'; gg.strokeText(p.ch, -p.w / 2, depth); gg.strokeText(p.ch, -p.w / 2, 0); });
    // 3 · extrusion
    each(g, (gg, p, i) => { const c = L.letters[p.c % L.letters.length]; for(let d = depth; d > 0; d -= Math.max(0.8, depth / 6)){ gg.fillStyle = shade(c[1], -0.42); gg.fillText(p.ch, -p.w / 2, d); } });
    // 4 · faces on their own layer, so the bevel / grid / shine stay inside the letters
    const cv = document.createElement('canvas'); cv.width = g.canvas.width; cv.height = g.canvas.height;
    const f = cv.getContext('2d'); f.setTransform(g.getTransform()); f.font = g.font; f.textBaseline = 'alphabetic'; f.textAlign = 'left'; f.lineJoin = 'round';
    each(f, (gg, p) => { const c = L.letters[p.c % L.letters.length], gr = gg.createLinearGradient(0, -size * 0.74, 0, 0);
      gr.addColorStop(0, c[0]); gr.addColorStop(0.5, c[1]); gr.addColorStop(1, shade(c[1], -0.16)); gg.fillStyle = gr; gg.strokeStyle = gr; gg.lineWidth = bold * 2; gg.strokeText(p.ch, -p.w / 2, 0); gg.fillText(p.ch, -p.w / 2, 0); });
    f.globalCompositeOperation = 'source-atop';
    // blueprint grid (faint, like the original's lines + scribbles)
    const step = size * 0.13, inv = f.getTransform().inverse(), tl = inv.transformPoint({x: 0, y: 0}), br = inv.transformPoint({x: cv.width, y: cv.height});
    f.strokeStyle = 'rgba(255,255,255,0.13)'; f.lineWidth = Math.max(0.5, size * 0.012); f.beginPath();
    for(let x = tl.x - (tl.x % step); x < br.x; x += step){ f.moveTo(x, tl.y); f.lineTo(x, br.y); }
    for(let y = tl.y - (tl.y % step); y < br.y; y += step){ f.moveTo(tl.x, y); f.lineTo(br.x, y); }
    f.stroke();
    // inner light bevel + darker lower edge
    each(f, (gg, p) => { gg.lineWidth = size * 0.05; gg.strokeStyle = 'rgba(255,255,255,0.3)'; gg.strokeText(p.ch, -p.w / 2, -size * 0.01); });
    each(f, (gg, p, i) => { const c = L.letters[p.c % L.letters.length]; gg.lineWidth = size * 0.05; gg.strokeStyle = shade(c[1], -0.3); gg.globalAlpha = 0.5; gg.strokeText(p.ch, -p.w / 2, size * 0.03); });
    each(f, (gg, p) => { gg.lineWidth = Math.max(0.6, size * 0.018); gg.strokeStyle = 'rgba(255,255,255,0.7)'; gg.strokeText(p.ch, -p.w / 2, -size * 0.02); });
    // glossy top shine
    each(f, (gg, p) => { gg.beginPath(); gg.ellipse(-p.w * 0.05, -size * 0.6, p.w * 0.5, size * 0.17, -0.2, 0, Math.PI * 2); gg.fillStyle = 'rgba(255,255,255,0.22)'; gg.fill(); });
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(cv, 0, 0); g.restore();
    g.restore();
  }
  function goggles(g, x, y, s){   // the original's goggles on the A
    g.save(); g.lineWidth = s * 0.22; g.strokeStyle = '#0B1230'; g.beginPath(); g.moveTo(x - s * 0.35, y); g.lineTo(x + s * 0.35, y); g.stroke();
    [-1, 1].forEach(k => { const ex = x + k * s * 0.95;
      g.beginPath(); g.arc(ex, y, s * 0.78, 0, Math.PI * 2); g.fillStyle = '#0B1230'; g.fill();
      g.beginPath(); g.arc(ex, y, s * 0.66, 0, Math.PI * 2); const gr = g.createLinearGradient(0, y - s, 0, y + s); gr.addColorStop(0, '#FFE680'); gr.addColorStop(1, '#F29A12'); g.fillStyle = gr; g.fill();
      g.beginPath(); g.arc(ex, y, s * 0.46, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      g.beginPath(); g.arc(ex + s * 0.1, y + s * 0.06, s * 0.24, 0, Math.PI * 2); g.fillStyle = '#0B1230'; g.fill();
      g.beginPath(); g.arc(ex + s * 0.02, y - s * 0.06, s * 0.08, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); });
    g.restore();
  }
  function oface(g, x, y, s){   // the cheeky face on the o: two eyes + little brows
    g.save(); g.lineCap = 'round';
    [-1, 1].forEach(k => { const ex = x + k * s * 0.62;
      g.beginPath(); g.ellipse(ex, y, s * 0.5, s * 0.6, 0, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); g.lineWidth = s * 0.16; g.strokeStyle = '#0B1230'; g.stroke();
      g.beginPath(); g.arc(ex + k * s * 0.08, y + s * 0.1, s * 0.24, 0, Math.PI * 2); g.fillStyle = '#0B1230'; g.fill();
      g.beginPath(); g.arc(ex + k * s * 0.02, y - s * 0.02, s * 0.08, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      g.beginPath(); g.moveTo(ex - s * 0.35, y - s * 0.95 + k * s * 0.05); g.quadraticCurveTo(ex, y - s * 1.25, ex + s * 0.38, y - s * 0.98 - k * s * 0.05); g.lineWidth = s * 0.2; g.stroke(); });
    g.restore();
  }
  function word(g, L, x0, base, size, maxW, opt){
    opt = opt || {};
    g.save(); g.font = '700 ' + size + 'px ' + FONT;
    const kern = -size * 0.02;
    let ws = [...WORD].map(ch => g.measureText(ch).width), tot = ws.reduce((a, b) => a + b, 0) + kern * (WORD.length - 1);
    const pad = size * 0.2, sc = Math.min(1, (maxW - pad * 2) / tot);
    if(sc < 1){ size *= sc; g.font = '700 ' + size + 'px ' + FONT; ws = ws.map(w => w * sc); tot *= sc; }
    let x = x0 + (maxW - tot) / 2;
    const items = [...WORD].map((ch, i) => { const p = {ch, c: i, x, y: base + (i === 0 || i === 7 ? size * 0.015 : 0), rot: [-0.03, 0, 0.02, -0.01, 0.015, -0.01, 0, 0.03][i], w: ws[i]}; x += ws[i] + kern * sc; return p; });
    g.restore();
    bubbly(g, L, items, size, opt);
    if(!opt.noEyes){
      const A = items[0], O = items[6];
      goggles(g, A.x + A.w * 0.5, A.y - size * 0.52, size * 0.135);
      oface(g, O.x + O.w * 0.5, O.y - size * 0.3, size * 0.11);
    }
    return {left: items[0].x, right: x};
  }
  function shade(hex, f){
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
    const t = f < 0 ? 0 : 255, p = Math.abs(f);
    r = Math.round((t - r) * p + r); gg = Math.round((t - gg) * p + gg); b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (gg << 8) + b).toString(16).slice(1);
  }
  const SYMS = [['+', 0.07, 0.2], ['7', 0.16, 0.08], ['÷', 0.9, 0.72], ['√', 0.95, 0.2], ['x²', 0.86, 0.1], ['3', 0.05, 0.62], ['−', 0.14, 0.86], ['=', 0.8, 0.9], ['5', 0.97, 0.52], ['π', 0.25, 0.94]];
  function paint(g, kind, W, H, look, RW){   /* kit: W, H = the kit box (units); RW = the real width in CSS px (decides the small-size details) */
    RW = RW || W; const L = typeof look === 'object' ? look : lk(look), small = RW < 220, RH = H * RW / W;
    g.clearRect(0, 0, W, H);
    if(kind === 'badge'){
      shield(g, L, W / 2, H * 0.06, W * 0.86, H * 0.9, {});
      const sz = W * 0.56; g.save(); g.font = '700 ' + sz + 'px ' + FONT; const aw = g.measureText('A').width; g.restore();
      bubbly(g, L, [{ch: 'A', c: 0, x: W / 2 - aw / 2, y: H * 0.66, rot: 0, w: aw}], sz, {});
      if(RW >= 60) goggles(g, W / 2, H * 0.66 - sz * 0.5, sz * 0.11);
      return;
    }
    if(kind === 'wide'){
      const sw = H * 0.78;
      shield(g, L, sw / 2 + H * 0.06, H * 0.05, sw, H * 0.9, {noTiles: RH < 44});
      word(g, L, sw + H * 0.2, H * 0.78, H * 0.78, W - sw - H * 0.28, {noEyes: RH < 34});
      return;
    }
    // main
    if(!small){
      gear(g, W * 0.2, H * 0.3, H * 0.13, L.gear[0], 0.3); gear(g, W * 0.82, H * 0.72, H * 0.15, L.gear[1], 0.1); gear(g, W * 0.74, H * 0.2, H * 0.08, L.gear[0], 0.6);
      g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
      SYMS.forEach(([s, fx, fy], i) => { const col = L.acc[i % L.acc.length]; g.font = '700 ' + (H * 0.085) + 'px ' + FONT; g.shadowColor = col; g.shadowBlur = H * 0.03; g.fillStyle = col; g.fillText(s, W * fx, H * fy); });
      g.restore();
    }
    const sw = H * 0.86;
    shield(g, L, W / 2, H * 0.03, sw, H * 0.93, {});
    word(g, L, W * 0.02, H * 0.6, H * 0.36, W * 0.96, {});
    const sp = small ? [[0.18, 0.2, 0.05], [0.84, 0.82, 0.045]] : [[0.12, 0.42, 0.04], [0.33, 0.12, 0.03], [0.7, 0.88, 0.035], [0.9, 0.36, 0.045], [0.62, 0.08, 0.028], [0.4, 0.86, 0.03]];
    sp.forEach(([fx, fy, fr], i) => star(g, W * fx, H * fy, H * fr, i % 2 ? '#FFFFFF' : L.acc[0]));
  }
  function pic(kind, look, px){
    kind = BOX[kind] ? kind : 'main'; look = LOOK[look] ? look : 'classic';
    const w = Math.max(16, Math.round((px || 300) / 4) * 4), dpr = Math.min(3, Math.max(1, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1));
    const key = kind + '|' + look + '|' + w + '|' + dpr;
    if(cache.has(key)) return cache.get(key);
    const h = Math.round(w * BOX[kind]);
    const c = document.createElement('canvas'); c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); c.cssW = w; c.cssH = h;
    const g = c.getContext('2d'); g.scale(dpr, dpr); paint(g, kind, w, h, look);
    if(cache.size > 60) cache.clear();
    cache.set(key, c); return c;
  }
  function url(kind, look, px){ const c = pic(kind, look, px); if(!c.__url) c.__url = c.toDataURL('image/png'); return c.__url; }
  function draw(g, kind, x, y, px, look){ const c = pic(kind, look, px); g.drawImage(c, x, y, c.cssW, c.cssH); }
  return {pic, url, draw, clear: () => cache.clear(), BOX, LOOK, looks: Object.keys(LOOK), paint};
})();
  var BOX = { main: [900, 500], wide: [840, 200], badge: [430, 500] };
  // kit: 'wide' gets a 5 % margin (at 48 px the 4.2 : 1 strip is 11 px tall and the shield touched the corner pixels)
  return { BOX: BOX, LOOK: AL.LOOK, paint: function (g, kind, L, px) { var W = BOX[kind][0], H = BOX[kind][1], m = kind === 'wide' ? 0.05 : 0;
    g.save(); g.translate(W * m, H * m); g.scale(1 - 2 * m, 1 - 2 * m); AL.paint(g, kind, W, H, L, px * (1 - 2 * m)); g.restore(); } };
})());
// 🏷️ LOGO algebros END
