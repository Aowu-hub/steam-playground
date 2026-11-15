
window.PieceSkins = (function(){
  const TYPES = ['k', 'q', 'r', 'b', 'n', 'p'];
  const SIZE_OF = {k: 6, q: 5, r: 4, b: 3, n: 2, p: 1}, TYPE_OF = {6: 'k', 5: 'q', 4: 'r', 3: 'b', 2: 'n', 1: 'p'};
  const NAMES = {k: 'King', q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn'};
  const GLYPH = {k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'};
  // [emoji, name] per chess type, plus the medallion colours of side 1 / side 2 and a little painted extra (acc) for a few
  const SKINS = {
    dino:  {name: 'Dino', icon: '🦖', ring: ['#7BC24F', '#8A5A2B'], pieces: {k: ['🦖', 'T-Rex'], q: ['🐊', 'Spinosaurus', 'sail'], r: ['🦕', 'Brachiosaurus'], b: ['🦅', 'Pterodactyl', 'crest'], n: ['🦏', 'Triceratops', 'horns'], p: ['🥚', 'Dino egg']}},
    sea:   {name: 'Sea', icon: '🐙', ring: ['#4FC3F7', '#0B4F8A'], pieces: {k: ['🦑', 'Kraken'], q: ['🧜', 'Mermaid'], r: ['⛵', 'Ship'], b: ['🐬', 'Dolphin'], n: ['🦈', 'Shark'], p: ['🦀', 'Crab']}},
    dance: {name: 'Dance', icon: '🪩', ring: ['#FF3DA5', '#3A0E5C'], pieces: {k: ['🎧', 'DJ'], q: ['🎤', 'Diva singer'], r: ['🔊', 'Speaker tower'], b: ['🪩', 'Disco ball'], n: ['🕺', 'Breakdancer'], p: ['💿', 'Vinyl record']}},
    robot: {name: 'Robot', icon: '🤖', ring: ['#7FD8FF', '#34495E'], pieces: {k: ['🤖', 'Mega-bot'], q: ['🦾', 'Android'], r: ['🕰️', 'Clock tower'], b: ['🚁', 'Drone'], n: ['🐎', 'Robo-horse', 'bolt'], p: ['⚙️', 'Gear bot']}},
    space: {name: 'Space', icon: '🪐', ring: ['#B9C6FF', '#1B1F4B'], pieces: {k: ['☀️', 'Sun'], q: ['🪐', 'Ringed planet'], r: ['🚀', 'Rocket'], b: ['☄️', 'Comet'], n: ['🛸', 'UFO'], p: ['⭐', 'Little star']}},
    sky:   {name: 'Sky', icon: '⚡', ring: ['#FFE38A', '#5A6B85'], pieces: {k: ['⚡', 'Zeus'], q: ['👑', 'Hera'], r: ['🏛️', 'Temple column'], b: ['🦉', 'Athena\'s owl'], n: ['🦄', 'Pegasus'], p: ['👼', 'Cloud cherub']}},
  };
  const KEYS = Object.keys(SKINS);

  /* 🏭 crafted skins (Artifactory af-4): things the family made in Artifactory become skins here, "made by …" (list = localStorage sp_artskins, written by Artifactory + Collection) */
  let ART_DONE = false;
  function artList(kinds){ let L = []; try{ L = JSON.parse(localStorage.getItem('sp_artskins') || '{}').list || []; }catch(e){} return L.filter(a => a && a.id && /^[a-z0-9]+$/i.test(a.id) && (!kinds || kinds.indexOf(a.k) >= 0)).slice(0, 24); }
  function artHex(h, f){ h = /^#[0-9a-f]{6}$/i.test(h || '') ? h : '#C08A4E'; const n = parseInt(h.slice(1), 16), m = c => Math.max(0, Math.min(255, Math.round(f > 0 ? c + (255 - c) * f : c * (1 + f)))); return '#' + ((1 << 24) + (m(n >> 16) << 16) + (m((n >> 8) & 255) << 8) + m(n & 255)).toString(16).slice(1); }
  function artMix(a, b, t){ const p = h => { h = /^#[0-9a-f]{6}$/i.test(h || '') ? h : '#888888'; const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }, A = p(a), B = p(b); return '#' + ((1 << 24) + A.reduce((s, v, i) => s + (Math.round(v + (B[i] - v) * t) << (16 - i * 8)), 0)).toString(16).slice(1); }
  function craftLink(mode){ const base = typeof WEBAPP_URL !== 'undefined' ? WEBAPP_URL : '', who = typeof CURRENT_PLAYER !== 'undefined' && CURRENT_PLAYER ? '&player=' + encodeURIComponent(CURRENT_PLAYER) : ''; const u = base + '?page=artifactory&mode=' + mode + who; if(window.UI && UI.go) UI.go(u, 'craft', 'Opening Artifactory'); else location.href = u; }
  function craftChip(box, mode, cls){ if(!box || box.querySelector('.art-craft')) return; const b = document.createElement('button'); b.className = (cls || '') + ' art-craft'; b.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:6px 12px;margin:3px;border-radius:999px;border:2px dashed currentColor;background:transparent;font:inherit;font-weight:800;cursor:pointer;color:inherit;'; b.setAttribute('data-sound', 'pop'); b.title = 'Make your own in 🏭 Artifactory'; b.innerHTML = '<span>✨ Craft a new one</span>'; b.onclick = e => { e.stopPropagation(); craftLink(mode); }; box.appendChild(b); }
  function artSkins(){ if(ART_DONE) return; ART_DONE = true; artList(['piece', 'figure', 'trophy']).forEach(a => { const k = 'art_' + a.id; if(SKINS[k]) return; const c = artHex(a.col, 0);
    SKINS[k] = {name: a.n, by: a.by, icon: '🏭', ring: [c, artHex(c, -0.45)], art: a.look, pieces: SKINS.robot.pieces}; KEYS.push(k); }); }
  const key = name => 'sp_pieceskin:' + (name || '');
  function get(name){ artSkins(); try{ const v = localStorage.getItem(key(name)); return SKINS[v] || v === 'classic' ? v : 'classic'; }catch(e){ return 'classic'; } }
  function set(name, skin){ try{ localStorage.setItem(key(name), SKINS[skin] ? skin : 'classic'); }catch(e){} }
  function shade(hex, f){ const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, m = c => Math.max(0, Math.min(255, Math.round(f > 0 ? c + (255 - c) * f : c * (1 + f)))); return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')'; }
  function emoji(g, ch, x, y, size){ if(typeof emo === 'function'){ g.fillStyle = '#000'; emo(g, ch, x, y, size); return; } g.save(); g.font = Math.round(size) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000'; g.fillText(ch, x, y + size * 0.05); g.restore(); }
  /* ================= ♟️ COSTUME PIECES (psk-2, ✨ polish chat 2026-11-15 — Aowu 17:45 photo "a wooden knight in a shark hood" + 17:50 "more detail") =================
     Every skin piece = the classic WOODEN chess piece (light wood = side 1, dark wood = side 2; opts.col paints it: ❌⭕ Alignext player colours)
     wearing its character as a costume (6 sets × 6 = 36). COSTUME.draw(g, skin, t, side, x, y, u, col) — u = piece height, x / y = its centre.
     The old round badge is still there: draw(…, {badge: true}). */
  const COSTUME = (function(){
  const W1 = ['#F6E2C2', '#D9A874', '#9A6A3A'], W2 = ['#80563A', '#4A2E1B', '#21130A'];
  /* ---------- colour helpers ---------- */
  function rgb(h){ const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function tone(h, f){ const c = rgb(h).map(v => Math.max(0, Math.min(255, Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f))))); return 'rgb(' + c.join(',') + ')'; }
  /* ---------- the piece silhouettes (u = height, x / y = centre) ---------- */
  function rrect(g, x0, y0, x1, y1, r){ g.moveTo(x0 + r, y0); g.lineTo(x1 - r, y0); g.quadraticCurveTo(x1, y0, x1, y0 + r); g.lineTo(x1, y1 - r); g.quadraticCurveTo(x1, y1, x1 - r, y1); g.lineTo(x0 + r, y1); g.quadraticCurveTo(x0, y1, x0, y1 - r); g.lineTo(x0, y0 + r); g.quadraticCurveTo(x0, y0, x0 + r, y0); g.closePath(); }
  function shapePath(g, t, x, y, u){
    const P = (dx, dy) => [x + dx * u, y + dy * u];
    const poly = pts => { pts.forEach((p, i) => { const q = P(p[0], p[1]); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); };
    const circ = (dx, dy, r) => { const q = P(dx, dy); g.moveTo(q[0] + r * u, q[1]); g.arc(q[0], q[1], r * u, 0, Math.PI * 2); };
    const ell = (dx, dy, rx, ry) => { const q = P(dx, dy); g.moveTo(q[0] + rx * u, q[1]); g.ellipse(q[0], q[1], rx * u, ry * u, 0, 0, Math.PI * 2); };
    g.beginPath(); rrect(g, x - 0.36 * u, y + 0.38 * u, x + 0.36 * u, y + 0.5 * u, 0.05 * u); rrect(g, x - 0.27 * u, y + 0.3 * u, x + 0.27 * u, y + 0.4 * u, 0.03 * u);
    if(t === 'p'){ poly([[-0.2, 0.31], [-0.1, 0.0], [0.1, 0.0], [0.2, 0.31]]); ell(0, -0.01, 0.17, 0.045); circ(0, -0.2, 0.2); }
    if(t === 'r'){ poly([[-0.22, 0.31], [-0.2, -0.24], [0.2, -0.24], [0.22, 0.31]]); poly([[-0.29, -0.22], [-0.29, -0.5], [-0.17, -0.5], [-0.17, -0.4], [-0.06, -0.4], [-0.06, -0.5], [0.06, -0.5], [0.06, -0.4], [0.17, -0.4], [0.17, -0.5], [0.29, -0.5], [0.29, -0.22]]); }
    if(t === 'b'){ poly([[-0.21, 0.31], [-0.09, 0.03], [0.09, 0.03], [0.21, 0.31]]); ell(0, 0.03, 0.16, 0.045);
      const a = P(0, 0.0), tp = P(0, -0.44); g.moveTo(a[0], a[1]); g.bezierCurveTo(a[0] - 0.28 * u, a[1] - 0.05 * u, a[0] - 0.22 * u, tp[1] + 0.12 * u, tp[0], tp[1]); g.bezierCurveTo(a[0] + 0.22 * u, tp[1] + 0.12 * u, a[0] + 0.28 * u, a[1] - 0.05 * u, a[0], a[1]); g.closePath(); circ(0, -0.47, 0.045); }
    if(t === 'n') poly([[0.27, 0.31], [0.3, 0.06], [0.25, -0.18], [0.14, -0.38], [0.08, -0.52], [0.0, -0.42], [-0.15, -0.34], [-0.3, -0.14], [-0.3, -0.03], [-0.22, 0.0], [-0.1, -0.05], [-0.04, 0.06], [-0.2, 0.31]]);
    if(t === 'q'){ poly([[-0.22, 0.31], [-0.1, -0.08], [0.1, -0.08], [0.22, 0.31]]); ell(0, -0.08, 0.16, 0.045); poly([[-0.12, -0.1], [-0.24, -0.37], [-0.12, -0.3], [0, -0.4], [0.12, -0.3], [0.24, -0.37], [0.12, -0.1]]);
      [[-0.24, -0.39], [0, -0.43], [0.24, -0.39], [-0.12, -0.33], [0.12, -0.33]].forEach(p => circ(p[0], p[1], 0.04)); circ(0, -0.49, 0.045); }
    if(t === 'k'){ poly([[-0.22, 0.31], [-0.1, -0.06], [0.1, -0.06], [0.22, 0.31]]); ell(0, -0.07, 0.17, 0.045); poly([[-0.13, -0.08], [-0.22, -0.36], [0.22, -0.36], [0.13, -0.08]]);
      poly([[-0.035, -0.36], [-0.035, -0.43], [-0.09, -0.43], [-0.09, -0.48], [-0.035, -0.48], [-0.035, -0.54], [0.035, -0.54], [0.035, -0.48], [0.09, -0.48], [0.09, -0.43], [0.035, -0.43], [0.035, -0.36]]); }
  }
  /* ---------- the wooden piece (or a painted one: col) ---------- */
  function wood(g, t, x, y, u, side, col){
    const W = col ? [tone(col, 0.45), tone(col, -0.1), tone(col, -0.55)] : side === 2 ? W2 : W1, dark = !col && side === 2;
    g.fillStyle = 'rgba(0,0,0,0.24)'; g.beginPath(); g.ellipse(x, y + 0.5 * u, 0.4 * u, 0.07 * u, 0, 0, 7); g.fill();
    shapePath(g, t, x, y, u);
    const gr = g.createLinearGradient(x - 0.32 * u, y - 0.5 * u, x + 0.32 * u, y + 0.5 * u); gr.addColorStop(0, W[0]); gr.addColorStop(1, W[1]);
    g.fillStyle = gr; g.fill();
    g.save(); g.clip();
    g.strokeStyle = dark ? 'rgba(255,220,180,0.13)' : 'rgba(120,70,30,0.15)'; g.lineWidth = Math.max(0.6, u * 0.011);   // grain
    for(let i = -4; i <= 4; i++){ g.beginPath(); g.moveTo(x + i * 0.07 * u, y + 0.52 * u); g.bezierCurveTo(x + i * 0.07 * u + 0.05 * u, y + 0.1 * u, x + i * 0.07 * u - 0.05 * u, y - 0.2 * u, x + i * 0.07 * u, y - 0.6 * u); g.stroke(); }
    const hl = g.createLinearGradient(x - 0.3 * u, 0, x + 0.05 * u, 0); hl.addColorStop(0, 'rgba(255,255,255,0)'); hl.addColorStop(0.5, dark ? 'rgba(255,235,210,0.18)' : 'rgba(255,255,255,0.38)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = hl; g.fillRect(x - 0.3 * u, y - 0.6 * u, 0.35 * u, 1.1 * u);   // varnish shine down the left
    g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(x - 0.4 * u, y + 0.44 * u, 0.8 * u, 0.08 * u);   // base shade
    g.restore();
    shapePath(g, t, x, y, u); g.lineJoin = 'round'; g.lineWidth = Math.max(1.1, u * 0.03); g.strokeStyle = W[2]; g.stroke();
    return dark;
  }
  /* ---------- drawing helpers ---------- */
  let X = 0, Y = 0, U = 1;
  const p = (dx, dy) => [X + dx * U, Y + dy * U];
  const L = () => Math.max(1, U * 0.026);
  function begin(g){ g.beginPath(); }
  function poly(g, pts){ g.beginPath(); pts.forEach((q, i) => { const r = p(q[0], q[1]); i ? g.lineTo(r[0], r[1]) : g.moveTo(r[0], r[1]); }); g.closePath(); }
  function curve(g, d){   // tiny path language: [['M',x,y],['L',x,y],['Q',cx,cy,x,y],['C',c1x,c1y,c2x,c2y,x,y],['Z']]
    g.beginPath(); d.forEach(s => { const c = s[0], a = s.slice(1).map((v, i) => i % 2 ? Y + v * U : X + v * U);
      if(c === 'M') g.moveTo(a[0], a[1]); else if(c === 'L') g.lineTo(a[0], a[1]); else if(c === 'Q') g.quadraticCurveTo(a[0], a[1], a[2], a[3]); else if(c === 'C') g.bezierCurveTo(a[0], a[1], a[2], a[3], a[4], a[5]); else g.closePath(); });
  }
  function shaded(g, col, line, o){   // fill with light-from-top-left shading + outline (+ plush stitches)
    o = o || {}; const b = o.box || [-0.4, -0.6, 0.4, 0.4];
    const gr = g.createLinearGradient(X + b[0] * U, Y + b[1] * U, X + b[2] * U, Y + b[3] * U); gr.addColorStop(0, tone(col, 0.32)); gr.addColorStop(0.55, col); gr.addColorStop(1, tone(col, -0.25));
    g.fillStyle = gr; g.fill();
    if(o.stitch && U > 30){ g.save(); g.clip(); g.setLineDash([U * 0.022, U * 0.018]); g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = Math.max(0.6, U * 0.01); g.lineDashOffset = 0; g.stroke(); g.setLineDash([]);
      g.lineWidth = U * 0.05; g.strokeStyle = 'rgba(0,0,0,0.0)'; g.restore(); }
    if(line !== false){ g.strokeStyle = line || tone(col, -0.6); g.lineWidth = L(); g.stroke(); }
  }
  function flat(g, col, line){ g.fillStyle = col; g.fill(); if(line){ g.strokeStyle = line; g.lineWidth = L(); g.stroke(); } }
  function dot(g, dx, dy, r, col){ const q = p(dx, dy); g.fillStyle = col; g.beginPath(); g.arc(q[0], q[1], r * U, 0, 7); g.fill(); }
  function ring(g, dx, dy, r, col, w){ const q = p(dx, dy); g.strokeStyle = col; g.lineWidth = Math.max(0.8, w * U); g.beginPath(); g.arc(q[0], q[1], r * U, 0, 7); g.stroke(); }
  function eye(g, dx, dy, r, look){ dot(g, dx, dy, r, '#FFFFFF'); ring(g, dx, dy, r, 'rgba(0,0,0,0.55)', 0.012); dot(g, dx + r * (look || 0.15), dy + r * 0.1, r * 0.58, '#15111C'); dot(g, dx + r * 0.38, dy - r * 0.18, r * 0.22, '#FFFFFF'); }
  function shine(g, dx, dy, rx, ry, a){ const q = p(dx, dy); g.fillStyle = 'rgba(255,255,255,' + (a || 0.45) + ')'; g.beginPath(); g.ellipse(q[0], q[1], rx * U, ry * U, -0.5, 0, 7); g.fill(); }
  function line(g, pts, col, w, dash){ g.beginPath(); pts.forEach((q, i) => { const r = p(q[0], q[1]); i ? g.lineTo(r[0], r[1]) : g.moveTo(r[0], r[1]); }); g.strokeStyle = col; g.lineWidth = Math.max(0.7, w * U); g.lineCap = 'round'; if(dash) g.setLineDash([U * dash, U * dash]); g.stroke(); g.setLineDash([]); }
  function teeth(g, a, b, n, h){
    for(let i = 0; i < n; i++){ const t0 = i / n, t1 = (i + 1) / n, tm = (t0 + t1) / 2; const A = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0], B = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1];
      const nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1, M = [a[0] + (b[0] - a[0]) * tm + nx / l * (h || 0.06), a[1] + (b[1] - a[1]) * tm + ny / l * (h || 0.06)];
      poly(g, [A, B, M]); flat(g, '#FFFFFF', 'rgba(0,0,0,0.35)'); }
  }
  function star(g, dx, dy, r, col, n){ n = n || 5; g.beginPath(); for(let i = 0; i < n * 2; i++){ const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * 0.45 : r, q = p(dx + Math.cos(a) * rr, dy + Math.sin(a) * rr); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.closePath(); g.fillStyle = col; g.fill(); }
  function sparkle(g, dx, dy, r){ star(g, dx, dy, r, '#FFFFFF', 4); }
  function bolt(g, dx, dy, s, col){ poly(g, [[dx + 0.02 * s, dy - 0.12 * s], [dx - 0.05 * s, dy + 0.01 * s], [dx + 0.0, dy + 0.01 * s], [dx - 0.03 * s, dy + 0.12 * s], [dx + 0.06 * s, dy - 0.03 * s], [dx + 0.01 * s, dy - 0.03 * s]]); flat(g, col || '#FFD84D', 'rgba(120,80,0,0.8)'); }
  /* the knight's hood (one shape, every knight costume uses it): covers the back of the head, the face looks out */
  function knightHood(g, col, o){ curve(g, [['M', -0.02, -0.5], ['C', 0.2, -0.56, 0.36, -0.36, 0.33, -0.05], ['L', 0.31, 0.24], ['L', 0.02, 0.24], ['C', 0.08, 0.1, 0.02, -0.02, -0.08, -0.08], ['C', -0.02, -0.25, -0.16, -0.38, -0.02, -0.5], ['Z']]);
    shaded(g, col, null, Object.assign({stitch: true, box: [-0.1, -0.55, 0.35, 0.25]}, o)); }
  function hoodMouth(g, col){ curve(g, [['M', -0.03, -0.49], ['C', -0.18, -0.38, -0.04, -0.24, -0.09, -0.08], ['L', -0.05, -0.1], ['C', 0.0, -0.25, -0.1, -0.38, 0.02, -0.47], ['Z']]); flat(g, col || '#E46A7A'); }
  function horseEye(g){ dot(g, -0.14, -0.27, 0.028, '#1A1008'); dot(g, -0.13, -0.28, 0.009, '#FFFFFF'); dot(g, -0.27, -0.09, 0.012, 'rgba(0,0,0,0.5)'); }
  const PI = Math.PI;

  /* ================= the 36 costumes ================= */
  const COST = {
    /* ---------------- 🐙 SEA ---------------- */
    kraken(g){ const c = '#D25AAE', o = '#6E1F5E';
      [-0.22, -0.08, 0.08, 0.22].forEach((dx, i) => { const e = dx * 1.45 + (i % 2 ? 0.04 : -0.04); curve(g, [['M', dx * 0.85, -0.1], ['C', dx * 1.35, 0.05, dx * 0.55, 0.16, e, 0.3]]);
        g.strokeStyle = o; g.lineCap = 'round'; g.lineWidth = U * 0.085; g.stroke(); g.strokeStyle = c; g.lineWidth = U * 0.06; g.stroke();
        [0.06, 0.14, 0.22].forEach((yy, j) => dot(g, dx * (1.05 + j * 0.12) + (i % 2 ? 0.01 : -0.01) * j, yy, 0.012, '#F7C1E4')); });
      curve(g, [['M', -0.26, -0.08], ['C', -0.3, -0.44, 0.3, -0.44, 0.26, -0.08], ['Q', 0, 0.01, -0.26, -0.08], ['Z']]); shaded(g, c, o, {stitch: true, box: [-0.26, -0.4, 0.26, 0]});
      [[-0.17, -0.3, 0.03], [0.18, -0.27, 0.022], [0.0, -0.33, 0.018], [0.12, -0.12, 0.02]].forEach(s => dot(g, s[0], s[1], s[2], '#F2A6DA'));
      eye(g, -0.09, -0.19, 0.065); eye(g, 0.09, -0.19, 0.065, -0.1); shine(g, -0.14, -0.33, 0.06, 0.025);
      curve(g, [['M', -0.05, -0.09], ['Q', 0, -0.05, 0.05, -0.09]]); g.strokeStyle = o; g.lineWidth = L(); g.stroke(); },
    mermaid(g){ const o = '#145C46';
      [-1, 1].forEach(s => { curve(g, [['M', 0.11 * s, -0.16], ['C', 0.3 * s, -0.16, 0.33 * s, 0.0, 0.24 * s, 0.13], ['L', 0.13 * s, -0.04], ['Z']]); shaded(g, '#E8603C', '#7A2410');
        line(g, [[0.17 * s, -0.12], [0.24 * s, 0.04]], 'rgba(255,200,170,0.6)', 0.012); line(g, [[0.21 * s, -0.12], [0.27 * s, 0.0]], 'rgba(120,30,10,0.4)', 0.01); });
      curve(g, [['M', -0.12, -0.06], ['L', 0.12, -0.06], ['L', 0.2, 0.26], ['L', -0.2, 0.26], ['Z']]); shaded(g, '#2DB38A', o, {box: [-0.2, -0.06, 0.2, 0.26]});
      g.save(); g.clip(); for(let r = 0; r < 5; r++) for(let i = -3; i <= 3; i++){ const q = p(i * 0.065 + (r % 2) * 0.0325, -0.04 + r * 0.06); g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = Math.max(0.6, U * 0.011); g.beginPath(); g.arc(q[0], q[1], U * 0.032, 0, PI); g.stroke(); } g.restore();
      [-1, 1].forEach(s => { curve(g, [['M', 0.13 * s, 0.2], ['Q', 0.3 * s, 0.2, 0.4 * s, 0.32], ['Q', 0.27 * s, 0.31, 0.2 * s, 0.35], ['Z']]); shaded(g, '#2DB38A', o); line(g, [[0.18 * s, 0.25], [0.33 * s, 0.31]], 'rgba(255,255,255,0.45)', 0.01); });
      star(g, 0.1, -0.15, 0.05, '#FFB347');   // starfish hair clip
      curve(g, [['M', -0.06, -0.13], ['Q', 0, -0.06, 0.06, -0.13], ['Q', 0, -0.17, -0.06, -0.13], ['Z']]); flat(g, '#F7C8E0', '#B0607F');   // shell
      dot(g, -0.08, 0.06, 0.012, '#FFFFFF'); dot(g, 0.05, 0.14, 0.01, '#FFFFFF'); },
    ship(g){ const o = '#4E1A12';
      line(g, [[0, -0.44], [0, -0.67]], '#5A3A22', 0.03); line(g, [[0, -0.66], [-0.2, -0.46]], 'rgba(60,40,20,0.7)', 0.008);   // mast + rope
      curve(g, [['M', 0.02, -0.64], ['Q', 0.2, -0.56, 0.25, -0.46], ['L', 0.02, -0.46], ['Z']]); shaded(g, '#FFFFFF', 'rgba(0,0,0,0.45)', {box: [0, -0.64, 0.25, -0.46]});
      g.save(); g.clip(); g.fillStyle = '#E8452C'; [-0.6, -0.53].forEach(dy => { const q = p(0, dy); g.fillRect(q[0], q[1], U * 0.27, U * 0.032); }); g.restore();
      poly(g, [[0.0, -0.69], [0.12, -0.665], [0.0, -0.64]]); flat(g, '#FFD24A', '#8A6A00');
      curve(g, [['M', -0.33, -0.03], ['L', 0.33, -0.03], ['Q', 0.3, 0.12, 0.24, 0.21], ['L', -0.24, 0.21], ['Q', -0.3, 0.12, -0.33, -0.03], ['Z']]); shaded(g, '#B23A2E', o, {box: [-0.33, -0.03, 0.33, 0.21]});
      g.save(); g.clip(); [0.08, 0.14].forEach(yy => line(g, [[-0.33, yy], [0.33, yy]], 'rgba(60,10,5,0.35)', 0.01)); g.restore();   // planks
      const q = p(-0.31, 0.0); g.fillStyle = '#F4EBDD'; g.fillRect(q[0], q[1], U * 0.62, U * 0.04);
      [-0.15, 0, 0.15].forEach(dx => { dot(g, dx, 0.11, 0.034, '#C9A24B'); dot(g, dx, 0.11, 0.024, '#FFE9A8'); dot(g, dx - 0.008, 0.103, 0.008, '#FFFFFF'); });
      line(g, [[-0.33, -0.03], [0.33, -0.03]], '#E9C46A', 0.016); },
    dolphin(g){ const c = '#4FA3E3', o = '#14406E';
      poly(g, [[0.1, -0.3], [0.28, -0.42], [0.2, -0.2]]); shaded(g, '#3E8FD0', o);
      curve(g, [['M', -0.22, 0.0], ['C', -0.28, -0.22, -0.12, -0.32, 0.0, -0.3], ['C', 0.2, -0.3, 0.28, -0.14, 0.22, 0.0], ['Z']]); shaded(g, c, o, {stitch: true, box: [-0.22, -0.3, 0.22, 0]});
      curve(g, [['M', -0.15, -0.02], ['Q', -0.06, -0.18, 0.06, -0.12], ['Q', 0.12, -0.06, 0.12, -0.01], ['Z']]); flat(g, '#D6ECFB');
      curve(g, [['M', -0.16, -0.21], ['Q', -0.36, -0.2, -0.36, -0.13], ['Q', -0.3, -0.1, -0.17, -0.13], ['Z']]); shaded(g, c, o);   // snout
      line(g, [[-0.35, -0.135], [-0.2, -0.155]], 'rgba(20,64,110,0.6)', 0.01);
      eye(g, -0.06, -0.2, 0.04); dot(g, 0.04, -0.27, 0.012, o); shine(g, -0.05, -0.27, 0.05, 0.018);
      curve(g, [['M', -0.1, -0.08], ['Q', -0.06, -0.04, -0.01, -0.08]]); g.strokeStyle = o; g.lineWidth = L(); g.stroke();
      [-1, 1].forEach(s => { poly(g, [[0.2 * s, -0.04], [0.37 * s, 0.05], [0.21 * s, 0.07]]); shaded(g, '#3E8FD0', o); }); },
    shark(g){ const c = '#7F98B3', o = '#1E2C3C';
      curve(g, [['M', 0.3, 0.2], ['L', 0.44, 0.08], ['Q', 0.4, 0.2, 0.45, 0.34], ['Z']]); shaded(g, '#6F86A0', o);
      curve(g, [['M', 0.1, -0.42], ['Q', 0.2, -0.56, 0.3, -0.64], ['Q', 0.27, -0.48, 0.3, -0.36], ['Z']]); shaded(g, '#6F86A0', o);
      knightHood(g, c); hoodMouth(g);
      curve(g, [['M', 0.04, 0.22], ['C', 0.12, 0.08, 0.2, 0.0, 0.3, 0.05], ['L', 0.3, 0.22], ['Z']]); flat(g, '#DDE5EE');
      teeth(g, p(-0.05, -0.47), p(-0.14, -0.3), 3); teeth(g, p(-0.06, -0.07), p(0.02, 0.06), 2);
      poly(g, [[0.2, -0.04], [0.37, 0.06], [0.22, 0.09]]); shaded(g, '#6F86A0', o);
      eye(g, 0.15, -0.38, 0.045); [0.17, 0.22, 0.27].forEach(dx => line(g, [[dx, -0.25], [dx - 0.02, -0.14]], 'rgba(30,44,60,0.6)', 0.014));
      shine(g, 0.2, -0.46, 0.06, 0.02); horseEye(g); },
    crab(g){ const c = '#E8452C', o = '#6A1A0C';
      [-1, 1].forEach(s => { [0, 1, 2].forEach(i => line(g, [[0.17 * s, -0.08 + i * 0.04], [0.29 * s, -0.02 + i * 0.05], [0.31 * s, 0.05 + i * 0.05]], o, 0.02));   // legs
        line(g, [[0.06 * s, -0.37], [0.1 * s, -0.5]], o, 0.025); eye(g, 0.1 * s, -0.53, 0.05, 0.1 * s);
        curve(g, [['M', 0.22 * s, -0.08], ['Q', 0.36 * s, -0.12, 0.38 * s, -0.24], ['L', 0.32 * s, -0.2], ['Q', 0.3 * s, -0.14, 0.24 * s, -0.12]]); shaded(g, c, o);
        g.beginPath(); const q = p(0.33 * s, -0.12); g.arc(q[0], q[1], U * 0.1, 0, 7); shaded(g, c, o, {box: [0.23 * s, -0.22, 0.43 * s, -0.02]});
        poly(g, [[0.33 * s, -0.12], [0.44 * s, -0.25], [0.41 * s, -0.08]]); flat(g, '#F6C8A0', o); shine(g, 0.3 * s, -0.17, 0.035, 0.015); });
      curve(g, [['M', -0.25, -0.18], ['C', -0.25, -0.46, 0.25, -0.46, 0.25, -0.18], ['L', 0.2, -0.03], ['Q', 0, 0.04, -0.2, -0.03], ['Z']]); shaded(g, c, o, {stitch: true, box: [-0.25, -0.42, 0.25, 0]});
      [-0.12, 0, 0.12].forEach(dx => dot(g, dx, -0.32, 0.022, '#F7A08C')); shine(g, -0.1, -0.33, 0.07, 0.025);
      curve(g, [['M', -0.06, -0.13], ['Q', 0, -0.08, 0.06, -0.13]]); g.strokeStyle = o; g.lineWidth = L(); g.stroke(); },

    /* ---------------- 🦖 DINO ---------------- */
    trex(g){ const c = '#4E9E34', o = '#1E4A14';
      curve(g, [['M', -0.23, -0.06], ['C', -0.28, -0.5, 0.28, -0.5, 0.23, -0.06], ['L', 0.2, 0.02], ['L', -0.2, 0.02], ['Z']]); shaded(g, c, o, {stitch: true, box: [-0.25, -0.46, 0.25, 0]});
      [-0.16, -0.06, 0.06, 0.16].forEach(dx => { poly(g, [[dx - 0.05, -0.38 + Math.abs(dx) * 0.6], [dx, -0.5 + Math.abs(dx) * 0.6], [dx + 0.05, -0.38 + Math.abs(dx) * 0.6]]); shaded(g, '#F2A33A', '#7A4A00'); });
      curve(g, [['M', -0.16, -0.17], ['Q', 0, -0.2, 0.16, -0.17], ['L', 0.14, -0.06], ['Q', 0, -0.0, -0.14, -0.06], ['Z']]); flat(g, '#9E2A24');   // open jaw
      curve(g, [['M', -0.14, -0.06], ['Q', 0, -0.02, 0.14, -0.06], ['L', 0.12, -0.1], ['Q', 0, -0.07, -0.12, -0.1], ['Z']]); flat(g, '#E86A6A');   // tongue
      teeth(g, p(-0.16, -0.17), p(0.16, -0.17), 5, 0.05); teeth(g, p(0.14, -0.06), p(-0.14, -0.06), 4, 0.04);
      eye(g, -0.1, -0.29, 0.042); eye(g, 0.1, -0.29, 0.042, -0.1);
      line(g, [[-0.16, -0.36], [-0.05, -0.33]], o, 0.028); line(g, [[0.16, -0.36], [0.05, -0.33]], o, 0.028);   // fierce brows
      dot(g, -0.04, -0.22, 0.014, o); dot(g, 0.04, -0.22, 0.014, o);   // nostrils
      [-1, 1].forEach(s => { curve(g, [['M', 0.17 * s, 0.02], ['Q', 0.27 * s, 0.03, 0.27 * s, 0.1]]); g.strokeStyle = o; g.lineWidth = U * 0.06; g.lineCap = 'round'; g.stroke(); g.strokeStyle = c; g.lineWidth = U * 0.04; g.stroke();
        dot(g, 0.27 * s, 0.11, 0.012, '#FFF6E0'); });   // tiny arms + claws
      [[-0.18, -0.24], [0.18, -0.24], [0, -0.38]].forEach(s => dot(g, s[0], s[1], 0.016, '#3B7E26')); shine(g, -0.12, -0.4, 0.06, 0.02); },
    spino(g){ const c = '#3E9E6A', o = '#14472C';
      curve(g, [['M', -0.17, -0.12], ['Q', -0.12, -0.46, 0.0, -0.5], ['Q', 0.12, -0.46, 0.17, -0.12], ['Z']]); shaded(g, '#F07A3A', '#7A2E0A');   // sail behind
      g.save(); g.clip(); [-0.08, 0, 0.08].forEach(dx => line(g, [[dx, -0.12], [dx * 0.6, -0.48]], 'rgba(120,40,0,0.5)', 0.012)); g.restore();
      curve(g, [['M', -0.21, -0.06], ['C', -0.24, -0.3, 0.24, -0.3, 0.21, -0.06], ['Q', 0, 0.02, -0.21, -0.06], ['Z']]); shaded(g, c, o, {stitch: true, box: [-0.21, -0.3, 0.21, 0]});
      curve(g, [['M', -0.14, -0.13], ['Q', -0.34, -0.12, -0.36, -0.06], ['Q', -0.2, -0.03, -0.12, -0.07], ['Z']]); shaded(g, c, o);   // long croc snout
      teeth(g, p(-0.34, -0.07), p(-0.15, -0.08), 4, 0.03);
      eye(g, -0.04, -0.17, 0.045); dot(g, 0.08, -0.12, 0.016, '#2C7A50'); dot(g, 0.14, -0.18, 0.012, '#2C7A50');
      [-1, 1].forEach(s => poly(g, [[0.17 * s, 0.05], [0.3 * s, 0.12], [0.18 * s, 0.14]]) || shaded(g, c, o)); },
    brachio(g){ const c = '#7DBE58', o = '#2A5A1A';
      curve(g, [['M', -0.04, -0.44], ['C', -0.04, -0.62, 0.06, -0.72, 0.18, -0.72], ['C', 0.28, -0.72, 0.3, -0.62, 0.22, -0.6], ['C', 0.14, -0.6, 0.08, -0.6, 0.06, -0.44], ['Z']]); shaded(g, c, o, {box: [-0.04, -0.72, 0.3, -0.44]});   // long neck + head
      eye(g, 0.18, -0.67, 0.025); dot(g, 0.27, -0.66, 0.008, o); curve(g, [['M', 0.2, -0.62], ['Q', 0.24, -0.6, 0.28, -0.63]]); g.strokeStyle = o; g.lineWidth = L() * 0.8; g.stroke();
      curve(g, [['M', -0.3, -0.04], ['L', 0.3, -0.04], ['Q', 0.28, 0.12, 0.23, 0.2], ['L', -0.23, 0.2], ['Q', -0.28, 0.12, -0.3, -0.04], ['Z']]); shaded(g, c, o, {stitch: true, box: [-0.3, -0.04, 0.3, 0.2]});   // body wrap
      [[-0.18, 0.05, 0.03], [-0.04, 0.11, 0.025], [0.12, 0.04, 0.035], [0.22, 0.13, 0.02]].forEach(s => dot(g, s[0], s[1], s[2], '#4E9A33'));
      curve(g, [['M', 0.28, 0.08], ['Q', 0.42, 0.1, 0.44, 0.0], ['Q', 0.38, 0.06, 0.29, 0.02], ['Z']]); shaded(g, c, o); },   // tail
    ptero(g){ const c = '#B07A4A', o = '#4A2A10';
      [-1, 1].forEach(s => { curve(g, [['M', 0.12 * s, -0.22], ['Q', 0.36 * s, -0.42, 0.46 * s, -0.24], ['Q', 0.4 * s, -0.12, 0.34 * s, -0.08], ['Q', 0.26 * s, -0.14, 0.12 * s, -0.08], ['Z']]); shaded(g, '#C9925E', o, {box: [0.1 * s, -0.4, 0.46 * s, -0.08]});
        line(g, [[0.14 * s, -0.2], [0.44 * s, -0.24]], 'rgba(74,42,16,0.5)', 0.01); line(g, [[0.2 * s, -0.12], [0.38 * s, -0.22]], 'rgba(74,42,16,0.4)', 0.01); });
      curve(g, [['M', -0.17, -0.02], ['C', -0.22, -0.26, -0.06, -0.34, 0.04, -0.3], ['C', 0.2, -0.26, 0.2, -0.1, 0.16, -0.02], ['Z']]); shaded(g, c, o, {stitch: true});
      poly(g, [[0.0, -0.28], [0.18, -0.48], [0.1, -0.25]]); shaded(g, '#E2552D', '#7A1E05');   // crest
      curve(g, [['M', -0.12, -0.2], ['L', -0.38, -0.16], ['L', -0.12, -0.13], ['Z']]); shaded(g, '#F2C14E', '#8A5E00');   // beak
      eye(g, -0.03, -0.21, 0.04); shine(g, -0.08, -0.26, 0.05, 0.018); },
    trike(g){ const c = '#5E8FC4', o = '#1C3A5E';
      curve(g, [['M', -0.06, -0.38], ['C', 0.0, -0.6, 0.34, -0.62, 0.38, -0.36], ['C', 0.4, -0.2, 0.3, -0.12, 0.2, -0.14], ['Z']]); shaded(g, '#F2A33A', '#7A4A00', {box: [-0.06, -0.62, 0.4, -0.12]});   // frill
      [[0.06, -0.52], [0.18, -0.58], [0.3, -0.52], [0.36, -0.4]].forEach(s => dot(g, s[0], s[1], 0.025, '#FFD27A'));
      knightHood(g, c);
      [[-0.02, -0.48, -0.1, -0.64], [0.1, -0.5, 0.06, -0.68]].forEach(h => { poly(g, [[h[0] - 0.03, h[1]], [h[2], h[3]], [h[0] + 0.03, h[1] + 0.01]]); shaded(g, '#FFF6E0', '#8A7A5A'); });
      poly(g, [[-0.27, -0.16], [-0.34, -0.3], [-0.22, -0.2]]); shaded(g, '#FFF6E0', '#8A7A5A');   // nose horn
      eye(g, 0.14, -0.36, 0.04); [0.18, 0.24].forEach(dx => dot(g, dx, -0.2, 0.02, '#4A78AA')); horseEye(g); },
    egg(g){ const o = '#8A6A4A';
      curve(g, [['M', -0.24, -0.16], ['L', -0.17, -0.2], ['L', -0.11, -0.14], ['L', -0.05, -0.21], ['L', 0.01, -0.14], ['L', 0.07, -0.21], ['L', 0.13, -0.14], ['L', 0.19, -0.2], ['L', 0.24, -0.16], ['C', 0.26, 0.04, 0.14, 0.08, 0.0, 0.08], ['C', -0.14, 0.08, -0.26, 0.04, -0.24, -0.16], ['Z']]); shaded(g, '#FFF4E2', o, {box: [-0.24, -0.2, 0.24, 0.08]});   // lower shell
      [[-0.14, -0.04, 0.03], [0.1, 0.0, 0.025], [0.0, -0.08, 0.02]].forEach(s => dot(g, s[0], s[1], s[2], '#7FC36A'));
      eye(g, -0.07, -0.25, 0.04); eye(g, 0.07, -0.25, 0.04, -0.1);   // the baby looks out
      curve(g, [['M', -0.2, -0.36], ['L', -0.14, -0.31], ['L', -0.08, -0.37], ['L', -0.02, -0.31], ['L', 0.04, -0.37], ['L', 0.1, -0.31], ['L', 0.16, -0.36], ['C', 0.16, -0.5, -0.2, -0.5, -0.2, -0.36], ['Z']]); shaded(g, '#FFF4E2', o, {box: [-0.2, -0.48, 0.16, -0.31]});   // shell cap
      dot(g, -0.05, -0.42, 0.022, '#7FC36A'); shine(g, -0.1, -0.43, 0.05, 0.016); },

    /* ---------------- 🪩 DANCE ---------------- */
    dj(g){ const o = '#1C1430';
      curve(g, [['M', -0.21, -0.22], ['C', -0.21, -0.48, 0.21, -0.48, 0.21, -0.22]]); g.strokeStyle = o; g.lineWidth = U * 0.07; g.stroke(); g.strokeStyle = '#7A5CFF'; g.lineWidth = U * 0.045; g.stroke();   // headband
      [-1, 1].forEach(s => { g.beginPath(); const q = p(0.21 * s, -0.2); g.ellipse(q[0], q[1], U * 0.075, U * 0.1, 0, 0, 7); shaded(g, '#2A2340', o); g.beginPath(); g.ellipse(q[0], q[1], U * 0.045, U * 0.065, 0, 0, 7); flat(g, '#FF3DA5'); shine(g, 0.2 * s - 0.02, -0.25, 0.02, 0.03, 0.5); });
      curve(g, [['M', -0.15, -0.24], ['L', 0.15, -0.24], ['L', 0.13, -0.17], ['L', 0.02, -0.17], ['L', 0, -0.2], ['L', -0.02, -0.17], ['L', -0.13, -0.17], ['Z']]); flat(g, '#15111C', '#000');   // shades
      shine(g, -0.09, -0.22, 0.03, 0.01, 0.6); shine(g, 0.07, -0.22, 0.03, 0.01, 0.6);
      [-0.12, 0.0, 0.12].forEach((dx, i) => line(g, [[dx - 0.04, 0.05 + i * 0.03], [dx + 0.04, 0.05 + i * 0.03]], ['#FF3DA5', '#FFD84D', '#3DD9FF'][i], 0.025));   // equalizer stripes
      [[0.3, -0.35], [-0.32, -0.3]].forEach(s => { line(g, [[s[0], s[1]], [s[0], s[1] + 0.08]], '#7A5CFF', 0.015); dot(g, s[0] - 0.02, s[1] + 0.08, 0.025, '#7A5CFF'); }); },   // music notes
    diva(g){ const o = '#5A0E3C';
      curve(g, [['M', -0.12, -0.07], ['L', 0.12, -0.07], ['L', 0.23, 0.28], ['L', -0.23, 0.28], ['Z']]); shaded(g, '#C2185B', o, {box: [-0.23, -0.07, 0.23, 0.28]});   // gown
      g.save(); g.clip(); for(let r = 0; r < 6; r++) for(let i = -4; i <= 4; i++) dot(g, i * 0.055 + (r % 2) * 0.027, -0.04 + r * 0.055, 0.01, r % 2 ? '#FFD84D' : '#FFC1E3'); g.restore();   // sequins
      curve(g, [['M', -0.26, -0.06], ['C', -0.1, 0.02, 0.1, -0.12, 0.26, -0.02]]); g.strokeStyle = '#F06292'; g.lineWidth = U * 0.06; g.lineCap = 'round'; g.stroke(); g.setLineDash([U * 0.02, U * 0.02]); g.strokeStyle = '#FFC1E3'; g.lineWidth = U * 0.03; g.stroke(); g.setLineDash([]);   // feather boa
      line(g, [[0.2, -0.14], [0.27, 0.04]], '#2A2340', 0.03); g.beginPath(); const m = p(0.19, -0.17); g.arc(m[0], m[1], U * 0.05, 0, 7); shaded(g, '#B0B6C8', '#2A2340'); g.save(); g.clip(); for(let i = -2; i <= 2; i++) line(g, [[0.14, -0.17 + i * 0.02], [0.24, -0.17 + i * 0.02]], 'rgba(0,0,0,0.3)', 0.006); g.restore();   // microphone
      sparkle(g, -0.28, -0.3, 0.05); sparkle(g, 0.3, -0.42, 0.04); },
    speaker(g){ const o = '#111';
      curve(g, [['M', -0.23, -0.22], ['L', 0.23, -0.22], ['L', 0.25, 0.27], ['L', -0.25, 0.27], ['Z']]); shaded(g, '#2A2340', o, {box: [-0.25, -0.22, 0.25, 0.27]});   // speaker box
      [[0, -0.1, 0.09], [0, 0.13, 0.12]].forEach(s => { dot(g, s[0], s[1], s[2], '#4A3F66'); dot(g, s[0], s[1], s[2] * 0.72, '#15111C'); dot(g, s[0], s[1], s[2] * 0.28, '#FF3DA5'); ring(g, s[0], s[1], s[2], '#8A7AB8', 0.012); });
      [1, 2].forEach(i => [-1, 1].forEach(s => { curve(g, [['M', (0.3 + i * 0.05) * s, -0.15], ['Q', (0.36 + i * 0.07) * s, 0.0, (0.3 + i * 0.05) * s, 0.15]]); g.strokeStyle = i === 1 ? '#FF3DA5' : '#3DD9FF'; g.lineWidth = Math.max(1, U * 0.02); g.lineCap = 'round'; g.stroke(); }));
      dot(g, 0.17, -0.18, 0.012, '#3DFF8A'); },
    discoball(g){ const o = '#4A4E66';
      line(g, [[0, -0.52], [0, -0.4]], '#8A8FA8', 0.015);
      g.beginPath(); const q = p(0, -0.2); g.arc(q[0], q[1], U * 0.22, 0, 7); shaded(g, '#C9CEDF', o, {box: [-0.22, -0.42, 0.22, 0.02]});
      g.save(); g.clip(); for(let r = -4; r <= 4; r++) for(let i = -4; i <= 4; i++){ const z = p(i * 0.055 + (r % 2) * 0.027, -0.2 + r * 0.05); g.fillStyle = ['#E8ECF8', '#A9B0C8', '#FFFFFF', '#C0A8FF', '#8FE3FF'][(r * 3 + i * 7 + 20) % 5]; g.fillRect(z[0] - U * 0.024, z[1] - U * 0.02, U * 0.046, U * 0.04); } g.restore();
      ring(g, 0, -0.2, 0.22, o, 0.026); sparkle(g, -0.1, -0.3, 0.06); sparkle(g, 0.24, -0.38, 0.05); sparkle(g, -0.28, -0.06, 0.04);
      eye(g, -0.07, -0.18, 0.04); eye(g, 0.07, -0.18, 0.04, -0.1); },
    breakdancer(g){ const o = '#1C1430';
      knightHood(g, '#2B7BF0');   // hoodie
      curve(g, [['M', -0.08, -0.46], ['C', 0.0, -0.58, 0.22, -0.58, 0.26, -0.44], ['L', 0.22, -0.4], ['C', 0.12, -0.46, 0.02, -0.44, -0.08, -0.46], ['Z']]); shaded(g, '#FF3DA5', o);   // cap
      curve(g, [['M', 0.22, -0.44], ['Q', 0.38, -0.44, 0.42, -0.38], ['L', 0.24, -0.38], ['Z']]); flat(g, '#C2185B', o);   // backwards brim
      curve(g, [['M', -0.06, 0.04], ['Q', 0.1, 0.18, 0.3, 0.06]]); g.strokeStyle = '#B8860B'; g.lineWidth = U * 0.035; g.stroke(); g.setLineDash([U * 0.02, U * 0.012]); g.strokeStyle = '#FFD84D'; g.lineWidth = U * 0.025; g.stroke(); g.setLineDash([]);   // gold chain
      star(g, 0.12, 0.17, 0.04, '#FFD84D');
      [0.14, 0.2, 0.26].forEach((dx, i) => line(g, [[dx, -0.28 + i * 0.05], [dx + 0.08, -0.26 + i * 0.05]], '#FFFFFF', 0.015));   // stripes
      horseEye(g); },
    vinyl(g){ const o = '#111';
      g.beginPath(); const q = p(0, -0.36); g.ellipse(q[0], q[1], U * 0.3, U * 0.08, -0.12, 0, 7); shaded(g, '#1C1A22', o, {box: [-0.3, -0.44, 0.3, -0.28]});   // record as a hat
      g.beginPath(); g.ellipse(q[0], q[1], U * 0.22, U * 0.058, -0.12, 0, 7); g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = Math.max(0.6, U * 0.008); g.stroke(); g.beginPath(); g.ellipse(q[0], q[1], U * 0.15, U * 0.04, -0.12, 0, 7); g.stroke();
      g.beginPath(); g.ellipse(q[0], q[1], U * 0.08, U * 0.024, -0.12, 0, 7); flat(g, '#FF3DA5'); dot(g, 0, -0.36, 0.008, '#FFFFFF');
      curve(g, [['M', -0.15, -0.21], ['L', 0.15, -0.21], ['L', 0.13, -0.15], ['L', 0.02, -0.15], ['L', 0, -0.18], ['L', -0.02, -0.15], ['L', -0.13, -0.15], ['Z']]); flat(g, '#3DD9FF', '#0A5A7A');   // party shades
      curve(g, [['M', -0.06, -0.08], ['Q', 0, -0.03, 0.06, -0.08]]); g.strokeStyle = '#5A3A22'; g.lineWidth = L(); g.stroke();
      sparkle(g, 0.26, -0.48, 0.04); },

    /* ---------------- 🤖 ROBOT ---------------- */
    megabot(g){ const c = '#9AA9BF', o = '#2C3446';
      line(g, [[0, -0.36], [0, -0.5]], o, 0.02); dot(g, 0, -0.52, 0.035, '#FF4D4D'); shine(g, -0.01, -0.53, 0.012, 0.008, 0.8);
      curve(g, [['M', -0.24, -0.36], ['L', 0.24, -0.36], ['L', 0.24, -0.06], ['L', -0.24, -0.06], ['Z']]); shaded(g, c, o, {box: [-0.24, -0.36, 0.24, -0.06]});   // square helmet
      curve(g, [['M', -0.18, -0.29], ['L', 0.18, -0.29], ['L', 0.18, -0.17], ['L', -0.18, -0.17], ['Z']]); flat(g, '#15202E', o);   // visor
      [-0.08, 0.08].forEach(dx => { dot(g, dx, -0.23, 0.035, '#5CF2FF'); dot(g, dx, -0.23, 0.018, '#FFFFFF'); });
      [[-0.21, -0.33], [0.21, -0.33], [-0.21, -0.09], [0.21, -0.09]].forEach(s => dot(g, s[0], s[1], 0.014, '#5A6680'));
      [-1, 1].forEach(s => { curve(g, [['M', 0.24 * s, -0.27], ['L', 0.31 * s, -0.27], ['L', 0.31 * s, -0.15], ['L', 0.24 * s, -0.15], ['Z']]); shaded(g, '#7A879E', o); });   // ear bolts
      line(g, [[-0.1, -0.12], [0.1, -0.12]], '#5CF2FF', 0.014, 0.012); shine(g, -0.15, -0.33, 0.06, 0.015); },
    android(g){ const c = '#B9C3D6', o = '#2C3446';
      [-1, 1].forEach(s => { curve(g, [['M', 0.1 * s, -0.08], ['Q', 0.3 * s, -0.12, 0.33 * s, 0.04], ['L', 0.14 * s, 0.06], ['Z']]); shaded(g, c, o); dot(g, 0.24 * s, -0.04, 0.016, '#5A6680'); });   // shoulder plates
      curve(g, [['M', -0.15, -0.22], ['L', 0.15, -0.22], ['L', 0.13, -0.15], ['L', -0.13, -0.15], ['Z']]); flat(g, '#15202E', o); line(g, [[-0.11, -0.185], [0.11, -0.185]], '#FF4DD2', 0.02);   // visor
      curve(g, [['M', 0.2, 0.08], ['L', 0.3, -0.06], ['L', 0.36, -0.2]]); g.strokeStyle = o; g.lineWidth = U * 0.08; g.lineCap = 'round'; g.stroke(); g.strokeStyle = c; g.lineWidth = U * 0.055; g.stroke();   // 🦾 raised arm
      dot(g, 0.3, -0.06, 0.03, '#7A879E'); dot(g, 0.37, -0.24, 0.045, '#9AA9BF'); ring(g, 0.37, -0.24, 0.045, o, 0.014);
      [0.0, 0.08, 0.16].forEach(yy => line(g, [[-0.1, yy], [0.1, yy]], 'rgba(44,52,70,0.35)', 0.01)); dot(g, 0, 0.04, 0.025, '#5CF2FF'); },
    clocktower(g){ const o = '#4A2E12';
      g.beginPath(); const q = p(0, -0.06); g.arc(q[0], q[1], U * 0.15, 0, 7); shaded(g, '#C79A3A', o);   // brass rim
      dot(g, 0, -0.06, 0.12, '#FFF8E6'); for(let i = 0; i < 12; i++){ const a = i * PI / 6; line(g, [[Math.cos(a) * 0.095, -0.06 + Math.sin(a) * 0.095], [Math.cos(a) * 0.11, -0.06 + Math.sin(a) * 0.11]], '#4A2E12', i % 3 ? 0.008 : 0.016); }
      line(g, [[0, -0.06], [0, -0.15]], '#2A1A08', 0.016); line(g, [[0, -0.06], [0.065, -0.02]], '#2A1A08', 0.016); dot(g, 0, -0.06, 0.014, '#E8452C');
      [[-0.22, 0.18, 0.07], [0.22, 0.2, 0.06]].forEach(s => { star(g, s[0], s[1], s[2], '#8A939E', 8); dot(g, s[0], s[1], s[2] * 0.4, '#5A6268'); });   // gears
      poly(g, [[-0.32, -0.5], [0.32, -0.5], [0, -0.7]]); shaded(g, '#3E6E9E', '#1A3450');   // spire roof
      dot(g, 0, -0.71, 0.02, '#FFD84D'); },
    drone(g){ const c = '#E8EDF5', o = '#2C3446';
      [-1, 1].forEach(s => { line(g, [[0.04 * s, -0.42], [0.3 * s, -0.5]], o, 0.025); g.beginPath(); const q = p(0.3 * s, -0.52); g.ellipse(q[0], q[1], U * 0.14, U * 0.025, 0, 0, 7); flat(g, 'rgba(160,180,210,0.55)', 'rgba(44,52,70,0.6)'); dot(g, 0.3 * s, -0.52, 0.02, '#FF4D4D'); });   // rotors
      curve(g, [['M', -0.2, -0.04], ['C', -0.26, -0.3, -0.1, -0.42, 0, -0.42], ['C', 0.1, -0.42, 0.26, -0.3, 0.2, -0.04], ['Z']]); shaded(g, c, o, {box: [-0.2, -0.42, 0.2, 0]});   // shell
      dot(g, 0, -0.2, 0.08, '#15202E'); dot(g, 0, -0.2, 0.05, '#3A6CFF'); dot(g, -0.02, -0.22, 0.016, '#FFFFFF'); ring(g, 0, -0.2, 0.08, '#7A879E', 0.014);   // camera eye
      line(g, [[-0.14, -0.06], [0.14, -0.06]], '#FFB020', 0.02, 0.025); dot(g, 0.13, -0.32, 0.014, '#3DFF8A'); },
    robohorse(g){ const c = '#8D9BB0', o = '#232B3A';
      knightHood(g, c, {stitch: false});
      g.save(); curve(g, [['M', -0.02, -0.5], ['C', 0.2, -0.56, 0.36, -0.36, 0.33, -0.05], ['L', 0.31, 0.24], ['L', 0.02, 0.24], ['C', 0.08, 0.1, 0.02, -0.02, -0.08, -0.08], ['C', -0.02, -0.25, -0.16, -0.38, -0.02, -0.5], ['Z']]); g.clip();
      [-0.3, -0.12, 0.06].forEach(yy => line(g, [[-0.1, yy], [0.4, yy + 0.04]], 'rgba(20,26,36,0.45)', 0.012)); g.restore();   // plate seams
      [[0.08, -0.4], [0.24, -0.3], [0.26, -0.08], [0.1, 0.0], [0.22, 0.14]].forEach(s => dot(g, s[0], s[1], 0.014, '#C9D3E2'));   // rivets
      bolt(g, 0.2, -0.24, 1.2, '#FFD84D'); dot(g, -0.14, -0.27, 0.035, '#FF3B3B'); dot(g, -0.14, -0.27, 0.014, '#FFFFFF');   // LED eye
      line(g, [[0.12, -0.46], [0.18, -0.6]], o, 0.018); dot(g, 0.18, -0.61, 0.022, '#5CF2FF'); },
    gearbot(g){ const o = '#2C3446';
      star(g, 0, -0.02, 0.22, '#8A939E', 10); ring(g, 0, -0.02, 0.15, '#5A6268', 0.02);   // gear collar
      curve(g, [['M', -0.21, -0.2], ['C', -0.21, -0.44, 0.21, -0.44, 0.21, -0.2], ['L', 0.21, -0.12], ['L', -0.21, -0.12], ['Z']]); shaded(g, '#B9C3D6', o, {box: [-0.21, -0.42, 0.21, -0.12]});   // dome helmet
      curve(g, [['M', -0.14, -0.26], ['L', 0.14, -0.26], ['L', 0.14, -0.17], ['L', -0.14, -0.17], ['Z']]); flat(g, '#15202E', o); [-0.06, 0.06].forEach(dx => dot(g, dx, -0.215, 0.028, '#5CF2FF'));
      line(g, [[0, -0.4], [0, -0.5]], o, 0.018); dot(g, 0, -0.52, 0.03, '#FFB020'); shine(g, -0.12, -0.34, 0.05, 0.015); },

    /* ---------------- 🪐 SPACE ---------------- */
    sun(g){ const o = '#A85A00';
      for(let i = 0; i < 12; i++){ if(i === 5 || i === 6) continue; const a = -PI + i * PI / 11, r0 = 0.2, r1 = i % 2 ? 0.3 : 0.36; poly(g, [[Math.cos(a - 0.12) * r0, -0.22 + Math.sin(a - 0.12) * r0], [Math.cos(a) * r1, -0.22 + Math.sin(a) * r1], [Math.cos(a + 0.12) * r0, -0.22 + Math.sin(a + 0.12) * r0]]); shaded(g, i % 2 ? '#FFB020' : '#FF8A1E', o); }   // rays
      g.beginPath(); const q = p(0, -0.2); g.arc(q[0], q[1], U * 0.2, 0, 7); shaded(g, '#FFD84D', o, {stitch: true, box: [-0.2, -0.4, 0.2, 0]});
      curve(g, [['M', -0.15, -0.24], ['L', 0.15, -0.24], ['L', 0.13, -0.17], ['L', 0.02, -0.17], ['L', 0, -0.2], ['L', -0.02, -0.17], ['L', -0.13, -0.17], ['Z']]); flat(g, '#15111C', '#000');   // shades
      curve(g, [['M', -0.07, -0.1], ['Q', 0, -0.04, 0.07, -0.1]]); g.strokeStyle = o; g.lineWidth = L(); g.stroke(); dot(g, -0.13, -0.12, 0.02, '#FF9A6A'); dot(g, 0.13, -0.12, 0.02, '#FF9A6A'); shine(g, -0.1, -0.32, 0.05, 0.016); },
    planet(g){ const o = '#4A3A8A';
      g.beginPath(); const q = p(0, -0.2); g.ellipse(q[0], q[1], U * 0.36, U * 0.09, -0.25, PI, 2 * PI); g.strokeStyle = '#E8B04A'; g.lineWidth = U * 0.05; g.stroke();   // ring (back)
      g.beginPath(); g.arc(q[0], q[1], U * 0.2, 0, 7); shaded(g, '#9A86E8', o, {stitch: true, box: [-0.2, -0.4, 0.2, 0]});
      g.save(); g.beginPath(); g.arc(q[0], q[1], U * 0.2, 0, 7); g.clip(); [-0.3, -0.22, -0.12].forEach((yy, i) => line(g, [[-0.25, yy], [0.25, yy - 0.05]], ['#B9A8FF', '#7A66CC', '#C7B8FF'][i], 0.03)); g.restore();
      g.beginPath(); g.ellipse(q[0], q[1], U * 0.36, U * 0.09, -0.25, 0, PI); g.strokeStyle = '#E8B04A'; g.lineWidth = U * 0.05; g.stroke(); g.strokeStyle = '#FFE08A'; g.lineWidth = U * 0.018; g.stroke();   // ring (front)
      eye(g, -0.07, -0.24, 0.04); eye(g, 0.07, -0.24, 0.04, -0.1); curve(g, [['M', -0.05, -0.15], ['Q', 0, -0.11, 0.05, -0.15]]); g.strokeStyle = o; g.lineWidth = L(); g.stroke();
      star(g, -0.3, 0.05, 0.03, '#FFE08A'); star(g, 0.3, -0.46, 0.025, '#FFE08A'); },
    rocket(g){ const o = '#5A1A1A';
      curve(g, [['M', -0.29, -0.48], ['Q', -0.2, -0.66, 0, -0.71], ['Q', 0.2, -0.66, 0.29, -0.48], ['Z']]); shaded(g, '#E8452C', o, {box: [-0.29, -0.71, 0.29, -0.48]});   // nose cone on the battlements
      line(g, [[-0.26, -0.52], [0.26, -0.52]], '#FFFFFF', 0.02);
      dot(g, 0, -0.1, 0.1, '#C9D3E2'); dot(g, 0, -0.1, 0.075, '#3A6CFF'); dot(g, -0.025, -0.13, 0.025, '#BFE3FF'); ring(g, 0, -0.1, 0.1, '#5A6680', 0.016);   // porthole
      [-1, 1].forEach(s => { curve(g, [['M', 0.2 * s, 0.05], ['Q', 0.38 * s, 0.14, 0.4 * s, 0.34], ['L', 0.24 * s, 0.26], ['Z']]); shaded(g, '#E8452C', o); });   // fins
      [-1, 1].forEach(s => { poly(g, [[0.3 * s, 0.3], [0.37 * s, 0.42], [0.42 * s, 0.3]]); flat(g, '#FFB020'); poly(g, [[0.33 * s, 0.31], [0.37 * s, 0.38], [0.39 * s, 0.31]]); flat(g, '#FFE08A'); }); },   // little flames at the fin tips   // flame under the base
    comet(g){ const o = '#1A3A6E';
      curve(g, [['M', 0.0, -0.4], ['Q', 0.3, -0.5, 0.46, -0.3], ['Q', 0.36, -0.28, 0.4, -0.18], ['Q', 0.26, -0.2, 0.3, -0.06], ['Q', 0.14, -0.14, 0.04, -0.02], ['Z']]); shaded(g, '#7FD3FF', o, {box: [0, -0.5, 0.46, -0.02]});   // icy tail
      g.save(); g.clip(); [0.18, 0.28].forEach((dx, i) => line(g, [[0.06, -0.28 + i * 0.08], [dx + 0.2, -0.4 + i * 0.12]], 'rgba(255,255,255,0.6)', 0.015)); g.restore();
      g.beginPath(); const q = p(-0.02, -0.2); g.arc(q[0], q[1], U * 0.19, 0, 7); shaded(g, '#E6F6FF', o, {stitch: true, box: [-0.2, -0.4, 0.18, 0]});   // icy head
      [[-0.1, -0.3, 0.03], [0.06, -0.12, 0.025], [-0.12, -0.1, 0.02]].forEach(s => dot(g, s[0], s[1], s[2], '#B8E2FA'));
      eye(g, -0.08, -0.21, 0.04); eye(g, 0.05, -0.21, 0.04, -0.1); sparkle(g, -0.3, -0.36, 0.05); sparkle(g, 0.4, -0.02, 0.04); },
    ufo(g){ const o = '#1E2C4A';
      g.beginPath(); const d = p(-0.08, -0.26); g.ellipse(d[0], d[1], U * 0.26, U * 0.26, 0, 0, 7); g.fillStyle = 'rgba(190,240,255,0.35)'; g.fill(); g.strokeStyle = 'rgba(80,140,180,0.85)'; g.lineWidth = L(); g.stroke();   // glass dome helmet
      shine(g, -0.18, -0.4, 0.06, 0.025, 0.7);
      g.beginPath(); const s = p(0.02, 0.0); g.ellipse(s[0], s[1], U * 0.38, U * 0.09, 0, 0, 7); shaded(g, '#8FA3C7', o, {box: [-0.36, -0.09, 0.4, 0.09]});   // saucer collar
      g.beginPath(); g.ellipse(s[0], s[1] - U * 0.03, U * 0.24, U * 0.045, 0, 0, 7); flat(g, '#5CF2C8');
      [-0.26, -0.12, 0.02, 0.16, 0.3].forEach((dx, i) => dot(g, dx, 0.035, 0.018, i % 2 ? '#FFD84D' : '#FF4DD2'));
      poly(g, [[-0.14, 0.09], [-0.24, 0.36], [0.24, 0.36], [0.14, 0.09]]); g.fillStyle = 'rgba(160,255,200,0.22)'; g.fill();   // tractor beam
      horseEye(g); },
    star(g){ const o = '#A86A00';
      star(g, 0, -0.22, 0.32, '#FFB020', 5); star(g, 0, -0.22, 0.28, '#FFD84D', 5);
      dot(g, 0, -0.2, 0.14, '#FFE58A');
      eye(g, -0.06, -0.22, 0.035); eye(g, 0.06, -0.22, 0.035, -0.1); curve(g, [['M', -0.04, -0.14], ['Q', 0, -0.1, 0.04, -0.14]]); g.strokeStyle = o; g.lineWidth = L(); g.stroke();
      dot(g, -0.11, -0.16, 0.016, '#FF9A6A'); dot(g, 0.11, -0.16, 0.016, '#FF9A6A'); sparkle(g, 0.3, -0.44, 0.04); sparkle(g, -0.3, 0.02, 0.035); },

    /* ---------------- ⚡ SKY ---------------- */
    zeus(g){ const o = '#5A6B85';
      curve(g, [['M', -0.17, -0.18], ['C', -0.24, 0.06, -0.1, 0.2, 0, 0.24], ['C', 0.1, 0.2, 0.24, 0.06, 0.17, -0.18], ['Q', 0, -0.08, -0.17, -0.18], ['Z']]); shaded(g, '#F4F6FA', o, {box: [-0.24, -0.18, 0.24, 0.24]});   // white beard
      g.save(); g.clip(); [-0.08, 0, 0.08].forEach(dx => line(g, [[dx, -0.1], [dx * 1.2, 0.2]], 'rgba(120,130,150,0.35)', 0.012)); g.restore();
      curve(g, [['M', -0.07, -0.12], ['Q', 0, -0.17, 0.07, -0.12]]); g.strokeStyle = '#5A6B85'; g.lineWidth = U * 0.035; g.lineCap = 'round'; g.stroke();   // moustache
      [-0.09, 0.09].forEach(dx => line(g, [[dx - 0.04, -0.24], [dx + 0.04, -0.25]], '#5A6B85', 0.02)); dot(g, -0.08, -0.2, 0.022, '#2A3446'); dot(g, 0.08, -0.2, 0.022, '#2A3446');   // brows + eyes
      [-1, 1].forEach(s => { for(let i = 0; i < 4; i++){ const a = -PI / 2 + s * (0.5 + i * 0.32), q = p(Math.cos(a) * 0.26, -0.24 + Math.sin(a) * 0.12); g.fillStyle = '#5BAA4A'; g.beginPath(); g.ellipse(q[0], q[1], U * 0.045, U * 0.022, a + PI / 2, 0, 7); g.fill(); } });   // laurel
      bolt(g, 0.3, -0.12, 1.5, '#FFD84D'); },
    hera(g){ const o = '#1E5A6E';
      [-PI * 0.97, -PI * 0.86, -PI * 0.75, -PI * 0.25, -PI * 0.14, -PI * 0.03].forEach(a => { const i = 0; q0 = p(0, -0.12), q = p(Math.cos(a) * 0.36, -0.12 + Math.sin(a) * 0.36);
        g.strokeStyle = '#2E8B57'; g.lineWidth = Math.max(0.8, U * 0.014); g.beginPath(); g.moveTo(q0[0], q0[1]); g.lineTo(q[0], q[1]); g.stroke();
        g.beginPath(); g.ellipse(q[0], q[1], U * 0.055, U * 0.075, a + PI / 2, 0, 7); flat(g, '#1FA38A', o); g.beginPath(); g.ellipse(q[0], q[1], U * 0.03, U * 0.042, a + PI / 2, 0, 7); flat(g, '#2457C9'); dot(g, (q[0] - X) / U, (q[1] - Y) / U, 0.014, '#FFD84D'); });   // peacock fan (left + right, the crown stays free)
      curve(g, [['M', -0.13, -0.08], ['Q', -0.24, 0.12, -0.2, 0.28], ['L', 0.2, 0.28], ['Q', 0.24, 0.12, 0.13, -0.08], ['Z']]); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fill(); g.strokeStyle = 'rgba(160,180,200,0.8)'; g.lineWidth = L() * 0.8; g.stroke();   // veil
      curve(g, [['M', -0.12, -0.05], ['Q', 0, 0.02, 0.12, -0.05]]); g.strokeStyle = '#FFD84D'; g.lineWidth = U * 0.025; g.stroke(); dot(g, 0, -0.02, 0.025, '#E8452C'); },   // necklace
    temple(g){ const o = '#6A6050';
      poly(g, [[-0.36, -0.5], [0.36, -0.5], [0, -0.68]]); shaded(g, '#F4EEDF', o, {box: [-0.36, -0.68, 0.36, -0.5]});   // pediment
      poly(g, [[-0.2, -0.53], [0.2, -0.53], [0, -0.63]]); flat(g, 'rgba(180,170,150,0.5)'); dot(g, 0, -0.57, 0.022, '#E8B04A');
      poly(g, [[-0.34, -0.5], [0.34, -0.5], [0.34, -0.45], [-0.34, -0.45]]); shaded(g, '#E6DDC8', o);
      g.save(); shapePath(g, 'r', X, Y, U); g.clip(); [-0.15, -0.08, 0, 0.08, 0.15].forEach(dx => line(g, [[dx, -0.22], [dx, 0.3]], 'rgba(255,255,255,0.55)', 0.02)); [-0.115, -0.04, 0.04, 0.115].forEach(dx => line(g, [[dx, -0.22], [dx, 0.3]], 'rgba(90,80,60,0.28)', 0.012)); g.restore();   // flutes
      [-1, 1].forEach(s => { curve(g, [['M', 0.12 * s, 0.0], ['Q', 0.3 * s, -0.05, 0.3 * s, 0.1], ['Q', 0.2 * s, 0.08, 0.14 * s, 0.14]]); g.strokeStyle = '#5BAA4A'; g.lineWidth = U * 0.025; g.stroke(); });   // ivy
      [[0.24, 0.02], [0.27, 0.08], [-0.24, 0.02], [-0.27, 0.08]].forEach(s => dot(g, s[0], s[1], 0.022, '#6BC25A')); },
    owl(g){ const c = '#8A6A4A', o = '#3A2410';
      [-1, 1].forEach(s => { curve(g, [['M', 0.14 * s, -0.16], ['Q', 0.34 * s, -0.12, 0.3 * s, 0.12], ['Q', 0.22 * s, 0.04, 0.14 * s, 0.04], ['Z']]); shaded(g, '#7A5A3A', o); g.save(); g.clip(); [0, 0.05, 0.1].forEach(yy => line(g, [[0.16 * s, -0.06 + yy], [0.3 * s, -0.04 + yy]], 'rgba(255,230,190,0.35)', 0.01)); g.restore(); });   // wings
      curve(g, [['M', -0.2, -0.02], ['C', -0.26, -0.3, -0.16, -0.4, -0.12, -0.42], ['L', -0.06, -0.34], ['Q', 0, -0.36, 0.06, -0.34], ['L', 0.12, -0.42], ['C', 0.16, -0.4, 0.26, -0.3, 0.2, -0.02], ['Z']]); shaded(g, c, o, {stitch: true, box: [-0.2, -0.42, 0.2, 0]});   // ear tufts hood
      [-1, 1].forEach(s => { dot(g, 0.08 * s, -0.22, 0.085, '#F4E2C2'); eye(g, 0.08 * s, -0.22, 0.06, -0.05 * s); });
      poly(g, [[-0.03, -0.17], [0.03, -0.17], [0, -0.1]]); flat(g, '#F2A33A', '#7A4A00');
      [[-0.1, -0.06], [0, -0.04], [0.1, -0.06]].forEach(s => { curve(g, [['M', s[0] - 0.03, s[1]], ['Q', s[0], s[1] + 0.03, s[0] + 0.03, s[1]]]); g.strokeStyle = 'rgba(255,230,190,0.6)'; g.lineWidth = L() * 0.8; g.stroke(); }); },
    pegasus(g){ const o = '#5A4A8A';
      curve(g, [['M', 0.18, -0.12], ['C', 0.3, -0.42, 0.52, -0.46, 0.56, -0.3], ['C', 0.5, -0.32, 0.48, -0.24, 0.5, -0.2], ['C', 0.44, -0.22, 0.42, -0.14, 0.44, -0.1], ['C', 0.36, -0.12, 0.32, -0.04, 0.3, 0.0], ['Z']]); shaded(g, '#FFFFFF', '#8A8AAA', {box: [0.18, -0.46, 0.56, 0]});   // wing
      g.save(); g.clip(); [-0.36, -0.26, -0.16].forEach(yy => line(g, [[0.26, yy + 0.2], [0.5, yy]], 'rgba(150,150,190,0.5)', 0.012)); g.restore();
      [['#FF6FB5', 0], ['#B98CFF', 0.035], ['#6FD3FF', 0.07]].forEach(m => { curve(g, [['M', 0.05 + m[1], -0.44], ['C', 0.2 + m[1], -0.42, 0.26 + m[1], -0.24, 0.24 + m[1], -0.04]]); g.strokeStyle = m[0]; g.lineWidth = U * 0.045; g.lineCap = 'round'; g.stroke(); });   // rainbow mane
      poly(g, [[-0.02, -0.44], [-0.1, -0.66], [0.04, -0.46]]); shaded(g, '#FFD84D', '#A87A00'); line(g, [[-0.07, -0.57], [-0.02, -0.55]], '#A87A00', 0.01); line(g, [[-0.05, -0.51], [0.0, -0.49]], '#A87A00', 0.01);   // horn
      horseEye(g); curve(g, [['M', -0.18, -0.3], ['Q', -0.14, -0.33, -0.1, -0.3]]); g.strokeStyle = '#1A1008'; g.lineWidth = L() * 0.8; g.stroke(); sparkle(g, -0.32, -0.4, 0.04); },
    cherub(g){ const o = '#8A8AAA';
      g.beginPath(); const h = p(0, -0.44); g.ellipse(h[0], h[1], U * 0.15, U * 0.04, 0, 0, 7); g.strokeStyle = '#E8A800'; g.lineWidth = U * 0.04; g.stroke(); g.strokeStyle = '#FFE58A'; g.lineWidth = U * 0.02; g.stroke();   // halo
      [-1, 1].forEach(s => { curve(g, [['M', 0.12 * s, -0.16], ['C', 0.3 * s, -0.3, 0.42 * s, -0.2, 0.38 * s, -0.08], ['C', 0.32 * s, -0.08, 0.3 * s, -0.02, 0.26 * s, 0.0], ['C', 0.2 * s, -0.04, 0.14 * s, -0.04, 0.12 * s, -0.08], ['Z']]); shaded(g, '#FFFFFF', o, {box: [0.12 * s, -0.3, 0.4 * s, 0]}); });   // little wings
      [[-0.18, 0.06, 0.08], [-0.06, 0.08, 0.09], [0.07, 0.08, 0.09], [0.19, 0.06, 0.08]].forEach(c => { g.beginPath(); const q = p(c[0], c[1]); g.arc(q[0], q[1], U * c[2], 0, 7); shaded(g, '#FFFFFF', 'rgba(138,138,170,0.7)', {box: [c[0] - c[2], c[1] - c[2], c[0] + c[2], c[1] + c[2]]}); });   // cloud collar
      [-0.07, 0.07].forEach(dx => { curve(g, [['M', dx - 0.03, -0.22], ['Q', dx, -0.25, dx + 0.03, -0.22]]); g.strokeStyle = '#3A2A1A'; g.lineWidth = L(); g.stroke(); });   // happy closed eyes
      dot(g, -0.11, -0.16, 0.02, '#FF9AB0'); dot(g, 0.11, -0.16, 0.02, '#FF9AB0'); curve(g, [['M', -0.04, -0.14], ['Q', 0, -0.1, 0.04, -0.14]]); g.strokeStyle = '#3A2A1A'; g.lineWidth = L(); g.stroke();
      [-0.06, 0.0, 0.06].forEach(dx => dot(g, dx, -0.39, 0.03, '#F2C14E')); },   // golden curls
  };
  const SETS = {
    sea:   {k: 'kraken', q: 'mermaid', r: 'ship', b: 'dolphin', n: 'shark', p: 'crab'},
    dino:  {k: 'trex', q: 'spino', r: 'brachio', b: 'ptero', n: 'trike', p: 'egg'},
    dance: {k: 'dj', q: 'diva', r: 'speaker', b: 'discoball', n: 'breakdancer', p: 'vinyl'},
    robot: {k: 'megabot', q: 'android', r: 'clocktower', b: 'drone', n: 'robohorse', p: 'gearbot'},
    space: {k: 'sun', q: 'planet', r: 'rocket', b: 'comet', n: 'ufo', p: 'star'},
    sky:   {k: 'zeus', q: 'hera', r: 'temple', b: 'owl', n: 'pegasus', p: 'cherub'},
  };
  function draw(g, skin, t, side, x, y, size, col){
    const u = size, set = SETS[skin] || SETS.sea; g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
    wood(g, t, x, y, u, side, col); X = x; Y = y; U = u; const c = COST[set[t]]; if(c) c(g);
    g.restore();
  }
  return {draw, COST, SETS, shapePath, wood};
})();
  function drawCostume(g, skin, t, side, x, y, size, opts){
    const S = SKINS[skin], u = size, cy = y + size * 0.03;   // as tall as the old badge was wide: fills the square like the classic glyphs
    g.save(); if(opts.alpha != null) g.globalAlpha = opts.alpha;
    if(S && S.art && !COSTUME.SETS[skin]){ COSTUME.wood(g, t, x, cy, u, side, opts.col); if(typeof artDraw === 'function'){ try { artDraw(g, S.art, x, cy - u * 0.3, u * 0.46, 1); } catch(e){} } }   // 🏭 crafted skin = the thing you made, worn as a hat
    else COSTUME.draw(g, skin, t, side, x, cy, u, opts.col);
    if(opts.pips){ const n = SIZE_OF[t], pr = Math.max(1.6, u * 0.032), gap = pr * 2.6; g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 1;
      for(let i = 0; i < n; i++){ const px = x + (i - (n - 1) / 2) * gap, py = cy + u * 0.44; g.beginPath(); g.arc(px, py, pr, 0, 7); g.fill(); g.stroke(); } }   // ❌⭕ Stack: the size as dots on the base
    g.restore();
  }
  /* ================= ♟️ COSTUME PIECES END ================= */
  // a piece: medallion in the side colour (col overrides it — Alignext uses the player colours), the skin picture, painted extras, rank pips
  // opts: {col, pips: true (show the size as dots, for Stack), alpha}
  function draw(g, skin, t, side, x, y, size, opts){
    artSkins(); opts = opts || {};
    if(!opts.badge && SKINS[skin]){ drawCostume(g, skin, t, side, x, y, size, opts); return; }   // ♟️ psk-2: a wooden piece in costume
    const S = SKINS[skin] || SKINS.dino, P = S.pieces[t] || S.pieces.p, col = opts.col || S.ring[side === 2 ? 1 : 0], r = size / 2;
    g.save(); if(opts.alpha != null) g.globalAlpha = opts.alpha;
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(x, y + r * 0.92, r * 0.8, r * 0.2, 0, 0, 7); g.fill();
    const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); gr.addColorStop(0, shade(col, 0.55)); gr.addColorStop(0.8, col); gr.addColorStop(1, shade(col, -0.25));
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.strokeStyle = side === 2 ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.35)'; g.lineWidth = Math.max(1, r * 0.09); g.beginPath(); g.arc(x, y, r * 0.86, 0, 7); g.stroke();
    // painted extras that make a stand-in picture read right
    if(P[2] === 'sail'){ g.fillStyle = '#FF8A3D'; g.beginPath(); g.moveTo(x - r * 0.45, y - r * 0.05); g.quadraticCurveTo(x - r * 0.05, y - r * 0.95, x + r * 0.35, y - r * 0.05); g.closePath(); g.fill(); }
    if(P[2] === 'crest'){ g.fillStyle = '#C0612B'; g.beginPath(); g.moveTo(x + r * 0.05, y - r * 0.55); g.lineTo(x + r * 0.55, y - r * 0.8); g.lineTo(x + r * 0.2, y - r * 0.35); g.fill(); }
    if(P[2] === 'bolt'){ g.fillStyle = '#FFE066'; g.beginPath(); g.moveTo(x + r * 0.45, y - r * 0.75); g.lineTo(x + r * 0.25, y - r * 0.35); g.lineTo(x + r * 0.42, y - r * 0.35); g.lineTo(x + r * 0.22, y + r * 0.05); g.lineTo(x + r * 0.62, y - r * 0.48); g.lineTo(x + r * 0.45, y - r * 0.48); g.closePath(); g.fill(); }
    if(S.art && typeof artDraw === 'function'){ g.save(); g.beginPath(); g.arc(x, y, r * 0.86, 0, 7); g.clip(); artDraw(g, S.art, x, y + r * 0.72, r * 1.4, 1); g.restore(); } else emoji(g, P[0], x, y + r * 0.04, r * 1.25);   // 🏭 crafted piece
    if(P[2] === 'horns'){ g.strokeStyle = '#FFF6E0'; g.lineWidth = Math.max(1.5, r * 0.1); g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r * 0.25, y - r * 0.35); g.lineTo(x - r * 0.42, y - r * 0.7); g.moveTo(x + r * 0.05, y - r * 0.4); g.lineTo(x + r * 0.05, y - r * 0.78); g.stroke(); }
    if(t === 'k'){ g.fillStyle = '#FFD84D'; g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = Math.max(1, r * 0.04); const cy = y - r * 0.98, w = r * 0.5; g.beginPath(); g.moveTo(x - w, cy + r * 0.2); g.lineTo(x - w, cy - r * 0.05); g.lineTo(x - w * 0.5, cy + r * 0.08); g.lineTo(x, cy - r * 0.12); g.lineTo(x + w * 0.5, cy + r * 0.08); g.lineTo(x + w, cy - r * 0.05); g.lineTo(x + w, cy + r * 0.2); g.closePath(); g.fill(); g.stroke(); }
    if(opts.pips){ const n = SIZE_OF[t], pr = Math.max(1.6, r * 0.09); g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1; for(let i = 0; i < n; i++){ const a = Math.PI * 0.62 + (i - (n - 1) / 2) * 0.36; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86, pr, 0, 7); g.fill(); g.stroke(); } }
    g.restore();
  }
  // a picture of one piece (cached) for pages that build pieces as HTML (Chess)
  const URLS = {};
  function url(skin, t, side, px, col, pips){
    const k = [skin, t, side, px || 96, col || '', pips ? 1 : 0].join('|'); if(URLS[k]) return URLS[k];
    const c = document.createElement('canvas'), s = px || 96; c.width = c.height = Math.round(s * 1.25);
    const g = c.getContext('2d'); draw(g, skin, t, side, c.width / 2, c.height * 0.55, s * 0.92, {col, pips});
    try { URLS[k] = c.toDataURL('image/png'); } catch(e){ URLS[k] = ''; }
    return URLS[k];
  }
  // HTML <img> of a piece; '' for the classic shapes (the page keeps its own glyphs)
  function img(skin, t, side, cls, col, pips){ if(!SKINS[skin]) return ''; const u = url(skin, t, side, 96, col, pips); return u ? '<img class="psk ' + (cls || '') + '" alt="' + NAMES[t] + '" title="' + SKINS[skin].pieces[t][1] + '" src="' + u + '">' : ''; }
  // chips to pick a skin (+ 'classic'), with a little King picture each; onPick(skinKey)
  function chips(box, current, onPick, withClassic, classicLabel){
    artSkins(); box.innerHTML = '';
    (withClassic ? ['classic'] : []).concat(KEYS).forEach(k => {
      const b = document.createElement('button'); b.className = 'chip psk-chip' + (k === current ? ' on' : ''); b.setAttribute('data-sound', 'pop'); b.setAttribute('data-skin', k);
      b.innerHTML = (k === 'classic' ? '<span class="psk-gl">♚</span>' : img(k, 'k', 1, 'psk-mini')) + '<span>' + (k === 'classic' ? (classicLabel || 'Classic') : SKINS[k].name) + (SKINS[k] && SKINS[k].by ? '<small class="art-by"> 🏭 by ' + String(SKINS[k].by).replace(/[<>&"]/g, '') + '</small>' : '') + '</span>';
      b.onclick = () => { box.querySelectorAll('.psk-chip').forEach(x => x.classList.toggle('on', x === b)); onPick(k); };
      box.appendChild(b);
    });
    craftChip(box, 'lathe', 'psk-craft');
  }
  // 🔴 DISC skins (Drop + 🔴 Checkers, plan 11x-4): the disc picture and what it turns into (a line in Drop / a King in Checkers).
  // One pick per player for both games: localStorage sp_discskin:<Name> ('classic' = the game's own look: the world in Drop, the board design in Checkers).
  const DISCS = {
    dino:  {name: 'Dino eggs', disc: '🥚', king: '🦖'},
    sea:   {name: 'Pearl bubbles', disc: '🫧', king: '🐙'},
    dance: {name: 'Vinyl records', disc: '💿', king: '🪩'},
    robot: {name: 'Gears', disc: '⚙️', king: '🕰️'},
    space: {name: 'Planets', disc: '🪐', king: '⭐'},
    sky:   {name: 'Clouds', disc: '☁️', king: '⚡'},
  };
  const dkey = name => 'sp_discskin:' + (name || '');
  function getDisc(name){ try{ const v = localStorage.getItem(dkey(name)); return DISCS[v] ? v : 'classic'; }catch(e){ return 'classic'; } }
  function setDisc(name, skin){ try{ localStorage.setItem(dkey(name), DISCS[skin] ? skin : 'classic'); }catch(e){} }
  function discChips(box, current, onPick, classicLabel){
    box.innerHTML = '';
    ['classic'].concat(Object.keys(DISCS)).forEach(k => {
      const b = document.createElement('button'); b.className = 'chip psk-chip' + (k === current ? ' on' : ''); b.setAttribute('data-sound', 'pop'); b.setAttribute('data-disc', k);
      b.innerHTML = k === 'classic' ? '<span>' + (classicLabel || 'Classic') + '</span>' : '<span class="psk-disc">' + DISCS[k].disc + '</span><span>' + DISCS[k].name + ' → ' + DISCS[k].king + '</span>';
      b.onclick = () => { box.querySelectorAll('.psk-chip').forEach(x => x.classList.toggle('on', x === b)); onPick(k); };
      box.appendChild(b);
    });
  }
  return {COSTUME, artSkins, craftLink, SKINS, KEYS, TYPES, NAMES, GLYPH, SIZE_OF, TYPE_OF, get, set, draw, url, img, chips, DISCS, getDisc, setDisc, discChips};
})();
