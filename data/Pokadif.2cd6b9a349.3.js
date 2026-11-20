
/* ================= 🎨 PAINTER — one painter for the play pictures, the menu previews, the lens and the tests ================= */
const PK_INK = 'rgba(32,22,58,0.92)';
function pkTone(hex, f){ const n = parseInt(String(hex).slice(1), 16) || 0; let r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
  if(f >= 1){ r += (255 - r) * (f - 1); gg += (255 - gg) * (f - 1); b += (255 - b) * (f - 1); } else { r *= f; gg *= f; b *= f; }
  const c = v => Math.max(0, Math.min(255, Math.round(v))); return 'rgb(' + c(r) + ',' + c(gg) + ',' + c(b) + ')'; }
function pkRR(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function pkOut(g, r){ g.lineWidth = Math.max(1.3, r * 0.085); g.strokeStyle = PK_INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
function pkFill(g, c, r){ g.fillStyle = c; g.fill(); pkOut(g, r); }
function pkShine(g, x, y, s){ g.fillStyle = 'rgba(255,255,255,0.42)'; g.beginPath(); g.ellipse(x, y, s, s * 0.6, -0.6, 0, 7); g.fill(); }
function pkPoly(g, pts){ g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); }
function pkDot(g, x, y, r, c){ g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
function pkSpot(g, x, y, q, c, r){ g.beginPath(); g.arc(x, y, q, 0, 7); pkFill(g, c, r * 0.5); }   // pk-5b: a spot you COUNT — outlined, so it always shows
const PK_DICE = {1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]};
const PK_SPOTS = [[-0.35, -0.05], [0.35, -0.05], [-0.3, 0.42], [0.3, 0.42], [-0.55, 0.2], [0.55, 0.2]];
const PK_PAINT = {
  // ===== 🧩 pk-5b: 33 more pieces (27 → 60 kinds, Aowu 2026-11-15 "add 30 more up to 60"). Each fits its r box; c = the changeable colour =====
  apple(g, r, c){ g.beginPath(); g.moveTo(0, -r * 0.55); g.bezierCurveTo(r * 0.95, -r * 0.95, r * 1.05, r * 0.55, r * 0.2, r * 0.82); g.quadraticCurveTo(0, r * 0.72, -r * 0.2, r * 0.82);
    g.bezierCurveTo(-r * 1.05, r * 0.55, -r * 0.95, -r * 0.95, 0, -r * 0.55); pkFill(g, c, r);
    g.beginPath(); g.moveTo(0, -r * 0.55); g.quadraticCurveTo(r * 0.05, -r * 0.85, r * 0.15, -r * 0.98); g.lineWidth = r * 0.09; g.strokeStyle = '#6B3E1F'; g.stroke();
    g.beginPath(); g.ellipse(r * 0.32, -r * 0.8, r * 0.24, r * 0.11, -0.5, 0, 7); pkFill(g, '#4CAF50', r * 0.5); pkShine(g, -r * 0.35, -r * 0.2, r * 0.18); },
  cherry(g, r, c, n){ n = Math.max(1, Math.min(3, n || 2)); const at = [[-r * 0.42, r * 0.42], [r * 0.42, r * 0.42], [0, r * 0.62]];
    g.strokeStyle = '#3E7A2E'; g.lineWidth = r * 0.07; for(let i = 0; i < n; i++){ g.beginPath(); g.moveTo(r * 0.05, -r * 0.85); g.quadraticCurveTo(at[i][0] * 0.4, -r * 0.2, at[i][0], at[i][1] - r * 0.3); g.stroke(); }
    g.beginPath(); g.ellipse(r * 0.28, -r * 0.82, r * 0.26, r * 0.11, 0.3, 0, 7); pkFill(g, '#4CAF50', r * 0.5);
    for(let i = 0; i < n; i++){ g.beginPath(); g.arc(at[i][0], at[i][1], r * 0.33, 0, 7); pkFill(g, c, r * 0.8); pkShine(g, at[i][0] - r * 0.1, at[i][1] - r * 0.1, r * 0.09); } },
  banana(g, r, c){ g.beginPath(); g.moveTo(-r * 0.9, -r * 0.35); g.quadraticCurveTo(-r * 0.2, r * 0.95, r * 0.95, -r * 0.2); g.quadraticCurveTo(r * 0.85, r * 0.25, r * 0.55, r * 0.35);
    g.quadraticCurveTo(-r * 0.25, r * 0.6, -r * 0.7, -r * 0.42); g.closePath(); pkFill(g, c, r); g.fillStyle = '#5A3A1A'; g.beginPath(); g.arc(-r * 0.86, -r * 0.4, r * 0.08, 0, 7); g.fill(); pkShine(g, -r * 0.1, r * 0.35, r * 0.15); },
  carrot(g, r, c){ pkPoly(g, [[-r * 0.38, -r * 0.45], [r * 0.38, -r * 0.45], [0, r * 0.98]]); pkFill(g, c, r);
    g.strokeStyle = 'rgba(80,30,0,0.35)'; g.lineWidth = r * 0.05; [[-0.2, -0.1, 0.05], [0.18, 0.15, -0.05], [-0.1, 0.45, 0.04]].forEach(([x, y, d]) => { g.beginPath(); g.moveTo(x * r, y * r); g.lineTo((x + 0.18) * r, (y + d) * r); g.stroke(); });
    [-0.22, 0, 0.22].forEach(x => { g.beginPath(); g.ellipse(x * r, -r * 0.68, r * 0.11, r * 0.3, x * 1.6, 0, 7); pkFill(g, '#4CAF50', r * 0.5); }); },
  cupcake(g, r, c, n){ n = Math.max(1, Math.min(6, n || 3)); pkPoly(g, [[-r * 0.66, 0], [r * 0.66, 0], [r * 0.48, r * 0.92], [-r * 0.48, r * 0.92]]); pkFill(g, pkTone(c, 0.7), r);
    g.beginPath(); g.moveTo(-r * 0.8, r * 0.06); g.bezierCurveTo(-r * 0.9, -r * 0.6, -r * 0.2, -r * 0.65, 0, -r * 0.92); g.bezierCurveTo(r * 0.2, -r * 0.65, r * 0.9, -r * 0.6, r * 0.8, r * 0.06); g.closePath(); pkFill(g, '#FFF4FA', r);
    const sp = [[-0.42, -0.12], [0.36, -0.2], [-0.08, -0.5], [0.12, -0.08], [-0.3, -0.38], [0.42, -0.44]]; for(let i = 0; i < n; i++) pkSpot(g, sp[i][0] * r, sp[i][1] * r, r * 0.15, c, r); },
  donut(g, r, c, n){ n = Math.max(1, Math.min(6, n || 3)); g.beginPath(); g.arc(0, 0, r * 0.9, 0, 7); pkFill(g, '#E0A458', r);
    g.beginPath(); for(let i = 0; i <= 24; i++){ const a = i / 24 * Math.PI * 2, q = r * (0.78 + (i % 2) * 0.06); i ? g.lineTo(Math.cos(a) * q, Math.sin(a) * q) : g.moveTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); pkFill(g, c, r * 0.6);
    g.beginPath(); g.arc(0, 0, r * 0.28, 0, 7); g.fillStyle = 'rgba(0,0,0,0.0)'; pkFill(g, '#E0A458', r * 0.6);
    const sp = [[0, -0.55], [0.52, -0.2], [0.4, 0.42], [-0.4, 0.42], [-0.52, -0.2], [0, 0.58]]; for(let i = 0; i < n; i++) pkSpot(g, sp[i][0] * r, sp[i][1] * r, r * 0.14, pkInk(c), r); },
  lollipop(g, r, c){ pkRR(g, -r * 0.06, r * 0.1, r * 0.12, r * 0.9, r * 0.05); pkFill(g, '#F4F1EA', r * 0.6);
    g.beginPath(); g.arc(0, -r * 0.3, r * 0.65, 0, 7); pkFill(g, c, r);
    g.beginPath(); for(let t = 0; t < 14; t += 0.2){ const q = r * 0.045 * t; g.lineTo(Math.cos(t) * q, -r * 0.3 + Math.sin(t) * q); } g.lineWidth = r * 0.1; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.stroke(); },
  cat(g, r, c){ g.beginPath(); g.moveTo(-r * 0.55, r * 0.4); g.quadraticCurveTo(-r * 0.92, r * 0.1, -r * 0.76, -r * 0.4); g.lineWidth = r * 0.16; g.strokeStyle = pkTone(c, 0.75); g.lineCap = 'round'; g.stroke();
    g.beginPath(); g.ellipse(-r * 0.15, r * 0.42, r * 0.58, r * 0.45, 0, 0, 7); pkFill(g, c, r);
    pkPoly(g, [[r * 0.04, -r * 0.32], [r * 0.1, -r * 0.8], [r * 0.32, -r * 0.46]]); pkFill(g, c, r * 0.7); pkPoly(g, [[r * 0.5, -r * 0.46], [r * 0.7, -r * 0.8], [r * 0.78, -r * 0.3]]); pkFill(g, c, r * 0.7);
    g.beginPath(); g.arc(r * 0.4, -r * 0.12, r * 0.42, 0, 7); pkFill(g, c, r);
    pkDot(g, r * 0.27, -r * 0.18, r * 0.07, '#1d1530'); pkDot(g, r * 0.55, -r * 0.18, r * 0.07, '#1d1530'); pkDot(g, r * 0.41, 0, r * 0.06, '#FF7BA8'); },
  frog(g, r, c){ g.beginPath(); g.ellipse(0, r * 0.3, r * 0.85, r * 0.55, 0, 0, 7); pkFill(g, c, r);
    g.beginPath(); g.ellipse(r * 0.55, r * 0.72, r * 0.38, r * 0.16, 0, 0, 7); pkFill(g, pkTone(c, 0.75), r * 0.6);
    [[-r * 0.08, -r * 0.3], [r * 0.48, -r * 0.3]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, r * 0.26, 0, 7); pkFill(g, c, r * 0.7); pkDot(g, x + r * 0.05, y, r * 0.14, '#fff'); pkDot(g, x + r * 0.08, y, r * 0.07, '#1d1530'); });
    g.beginPath(); g.arc(r * 0.3, r * 0.18, r * 0.32, 0.2, Math.PI - 0.4); g.lineWidth = r * 0.06; g.strokeStyle = PK_INK; g.stroke(); },
  turtle(g, r, c, n){ n = Math.max(1, Math.min(5, n || 3)); [[-r * 0.6, r * 0.5], [r * 0.4, r * 0.5]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, r * 0.16, r * 0.22, 0, 0, 7); pkFill(g, '#8BC34A', r * 0.5); });
    g.beginPath(); g.arc(r * 0.78, r * 0.15, r * 0.24, 0, 7); pkFill(g, '#8BC34A', r * 0.6); pkDot(g, r * 0.86, r * 0.08, r * 0.05, '#1d1530');
    g.beginPath(); g.ellipse(-r * 0.1, r * 0.2, r * 0.78, r * 0.62, 0, Math.PI, 0); g.closePath(); pkFill(g, c, r);
    const sp = [[-0.12, -0.3], [-0.5, 0.0], [0.28, 0.0], [-0.4, -0.3], [0.1, 0.02]]; for(let i = 0; i < n; i++) pkSpot(g, sp[i][0] * r, sp[i][1] * r, r * 0.16, pkInk(c), r); },
  butterfly(g, r, c, n){ n = Math.max(1, Math.min(4, n || 2)); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { g.beginPath(); g.ellipse(sx * r * 0.45, sy * r * (sy < 0 ? 0.38 : 0.36), r * (sy < 0 ? 0.48 : 0.36), r * (sy < 0 ? 0.42 : 0.3), sx * sy * 0.5, 0, 7); pkFill(g, sy < 0 ? c : pkTone(c, 0.8), r * 0.8); });
    const sp = [[-0.5, -0.4], [0.5, -0.4], [-0.45, 0.38], [0.45, 0.38]]; for(let i = 0; i < n; i++) pkSpot(g, sp[i][0] * r, sp[i][1] * r, r * 0.15, pkInk(c), r);
    pkRR(g, -r * 0.08, -r * 0.6, r * 0.16, r * 1.2, r * 0.08); pkFill(g, '#3A2A4A', r * 0.6); g.beginPath(); g.moveTo(-r * 0.04, -r * 0.6); g.lineTo(-r * 0.22, -r * 0.92); g.moveTo(r * 0.04, -r * 0.6); g.lineTo(r * 0.22, -r * 0.92); g.lineWidth = r * 0.05; g.strokeStyle = PK_INK; g.stroke(); },
  bee(g, r, c, n){ n = Math.max(1, Math.min(4, n || 2)); [[-0.1, -0.62], [0.25, -0.58]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x * r, y * r, r * 0.26, r * 0.36, x * 2, 0, 7); g.fillStyle = 'rgba(220,240,255,0.85)'; g.fill(); pkOut(g, r * 0.6); });
    g.beginPath(); g.ellipse(0, 0, r * 0.82, r * 0.52, 0, 0, 7); pkFill(g, c, r);
    g.save(); g.beginPath(); g.ellipse(0, 0, r * 0.8, r * 0.5, 0, 0, 7); g.clip(); g.fillStyle = '#2A2140'; for(let i = 0; i < n; i++) g.fillRect(-r * 0.45 + i * r * 0.3, -r * 0.6, r * 0.15, r * 1.2); g.restore();
    pkPoly(g, [[-r * 0.8, -r * 0.08], [-r * 1.05, 0], [-r * 0.8, r * 0.08]]); pkFill(g, '#2A2140', r * 0.4); pkDot(g, r * 0.55, -r * 0.12, r * 0.09, '#1d1530'); },
  crab(g, r, c){ g.strokeStyle = pkTone(c, 0.7); g.lineWidth = r * 0.09; g.lineCap = 'round'; [-1, 1].forEach(s => [0.1, 0.35].forEach(y => { g.beginPath(); g.moveTo(s * r * 0.5, y * r); g.lineTo(s * r * 0.82, (y + 0.28) * r); g.stroke(); }));
    [-1, 1].forEach(s => { g.beginPath(); g.moveTo(s * r * 0.45, -r * 0.1); g.lineTo(s * r * 0.66, -r * 0.5); g.stroke(); g.beginPath(); g.arc(s * r * 0.66, -r * 0.64, r * 0.21, 0, 7); pkFill(g, c, r * 0.6);
      pkPoly(g, [[s * r * 0.75, -r * 0.7], [s * r * 0.95, -r * 0.95], [s * r * 0.6, -r * 0.92]]); g.fillStyle = 'rgba(0,0,0,0.0)'; g.fill(); });
    g.beginPath(); g.ellipse(0, r * 0.15, r * 0.62, r * 0.42, 0, 0, 7); pkFill(g, c, r); pkDot(g, -r * 0.2, -r * 0.08, r * 0.1, '#fff'); pkDot(g, r * 0.2, -r * 0.08, r * 0.1, '#fff'); pkDot(g, -r * 0.2, -r * 0.08, r * 0.05, '#1d1530'); pkDot(g, r * 0.2, -r * 0.08, r * 0.05, '#1d1530'); },
  whale(g, r, c){ pkPoly(g, [[-r * 0.7, 0], [-r * 1.02, -r * 0.42], [-r * 0.85, 0.02], [-r * 1.02, r * 0.38]]); pkFill(g, pkTone(c, 0.8), r);
    g.beginPath(); g.moveTo(-r * 0.75, 0); g.bezierCurveTo(-r * 0.6, -r * 0.75, r * 0.95, -r * 0.7, r * 0.95, r * 0.1); g.bezierCurveTo(r * 0.9, r * 0.6, -r * 0.4, r * 0.55, -r * 0.75, 0); pkFill(g, c, r);
    g.beginPath(); g.moveTo(-r * 0.35, r * 0.3); g.quadraticCurveTo(r * 0.3, r * 0.5, r * 0.88, r * 0.22); g.lineWidth = r * 0.05; g.strokeStyle = 'rgba(255,255,255,0.6)'; g.stroke();
    pkDot(g, r * 0.55, -r * 0.08, r * 0.08, '#1d1530'); g.beginPath(); g.moveTo(r * 0.3, -r * 0.62); g.quadraticCurveTo(r * 0.2, -r * 0.95, r * 0.05, -r * 0.92); g.moveTo(r * 0.3, -r * 0.62); g.quadraticCurveTo(r * 0.42, -r * 0.95, r * 0.58, -r * 0.92); g.lineWidth = r * 0.07; g.strokeStyle = '#8FD3FF'; g.stroke(); },
  duck(g, r, c){ g.beginPath(); g.moveTo(-r * 0.9, r * 0.05); g.quadraticCurveTo(-r * 0.6, r * 0.85, r * 0.45, r * 0.6); g.quadraticCurveTo(r * 0.75, r * 0.2, r * 0.3, r * 0.1); g.lineTo(-r * 0.9, r * 0.05); pkFill(g, c, r);
    g.beginPath(); g.arc(r * 0.35, -r * 0.3, r * 0.38, 0, 7); pkFill(g, c, r); pkPoly(g, [[r * 0.68, -r * 0.32], [r * 1.02, -r * 0.2], [r * 0.68, -r * 0.12]]); pkFill(g, '#FF9A1F', r * 0.6);
    pkDot(g, r * 0.45, -r * 0.4, r * 0.07, '#1d1530'); g.beginPath(); g.ellipse(-r * 0.15, r * 0.3, r * 0.38, r * 0.18, -0.3, 0, 7); pkFill(g, pkTone(c, 0.82), r * 0.5); },
  penguin(g, r, c){ g.beginPath(); g.ellipse(0, r * 0.1, r * 0.6, r * 0.85, 0, 0, 7); pkFill(g, c, r);
    g.beginPath(); g.ellipse(0, r * 0.22, r * 0.4, r * 0.62, 0, 0, 7); g.fillStyle = '#FFFFFF'; g.fill();
    pkDot(g, -r * 0.16, -r * 0.42, r * 0.07, '#1d1530'); pkDot(g, r * 0.16, -r * 0.42, r * 0.07, '#1d1530'); pkPoly(g, [[-r * 0.1, -r * 0.3], [r * 0.1, -r * 0.3], [0, -r * 0.16]]); pkFill(g, '#FF9A1F', r * 0.4);
    [-1, 1].forEach(s => { g.beginPath(); g.ellipse(s * r * 0.22, r * 0.95, r * 0.18, r * 0.08, 0, 0, 7); g.fillStyle = '#FF9A1F'; g.fill(); }); },
  owl(g, r, c){ pkPoly(g, [[-r * 0.6, -r * 0.6], [-r * 0.45, -r * 0.98], [-r * 0.2, -r * 0.7]]); pkFill(g, c, r * 0.6); pkPoly(g, [[r * 0.6, -r * 0.6], [r * 0.45, -r * 0.98], [r * 0.2, -r * 0.7]]); pkFill(g, c, r * 0.6);
    g.beginPath(); g.ellipse(0, r * 0.08, r * 0.72, r * 0.85, 0, 0, 7); pkFill(g, c, r); g.beginPath(); g.ellipse(0, r * 0.38, r * 0.42, r * 0.45, 0, 0, 7); g.fillStyle = pkTone(c, 1.35); g.fill();
    [-1, 1].forEach(s => { pkDot(g, s * r * 0.3, -r * 0.3, r * 0.24, '#FFFFFF'); pkDot(g, s * r * 0.3, -r * 0.3, r * 0.11, '#1d1530'); }); pkPoly(g, [[-r * 0.09, -r * 0.12], [r * 0.09, -r * 0.12], [0, r * 0.06]]); pkFill(g, '#FF9A1F', r * 0.4); },
  car(g, r, c){ pkRR(g, -r * 0.95, -r * 0.1, r * 1.9, r * 0.6, r * 0.18); pkFill(g, c, r); pkPoly(g, [[-r * 0.5, -r * 0.1], [-r * 0.28, -r * 0.6], [r * 0.38, -r * 0.6], [r * 0.62, -r * 0.1]]); pkFill(g, c, r);
    pkPoly(g, [[-r * 0.36, -r * 0.14], [-r * 0.2, -r * 0.48], [r * 0.05, -r * 0.48], [r * 0.05, -r * 0.14]]); pkFill(g, '#BFE6FF', r * 0.5); pkPoly(g, [[r * 0.14, -r * 0.14], [r * 0.14, -r * 0.48], [r * 0.32, -r * 0.48], [r * 0.5, -r * 0.14]]); pkFill(g, '#BFE6FF', r * 0.5);
    [-0.52, 0.52].forEach(x => { g.beginPath(); g.arc(x * r, r * 0.52, r * 0.24, 0, 7); pkFill(g, '#2A2140', r * 0.6); pkDot(g, x * r, r * 0.52, r * 0.09, '#C8C8D8'); }); pkDot(g, r * 0.88, r * 0.08, r * 0.08, '#FFE066'); },
  bus(g, r, c, n){ n = Math.max(1, Math.min(5, n || 3)); pkRR(g, -r * 0.98, -r * 0.62, r * 1.96, r * 1.08, r * 0.18); pkFill(g, c, r);
    for(let i = 0; i < n; i++){ pkRR(g, -r * 0.88 + i * r * 0.36, -r * 0.5, r * 0.3, r * 0.54, r * 0.05); pkFill(g, pkInk(c) === '#FFFFFF' ? '#DFF3FF' : '#2E4A6A', r * 0.6); }
    pkRR(g, r * 0.62, -r * 0.45, r * 0.26, r * 0.62, r * 0.05); pkFill(g, '#BFE6FF', r * 0.5);
    [-0.55, 0.55].forEach(x => { g.beginPath(); g.arc(x * r, r * 0.5, r * 0.22, 0, 7); pkFill(g, '#2A2140', r * 0.6); }); pkDot(g, r * 0.9, r * 0.22, r * 0.07, '#FFE066'); },
  kite(g, r, c){ g.beginPath(); g.moveTo(0, r * 0.75); g.quadraticCurveTo(r * 0.3, r * 0.95, r * 0.1, r * 1.05); g.lineWidth = r * 0.05; g.strokeStyle = PK_INK; g.stroke();
    pkPoly(g, [[0, -r], [r * 0.6, -r * 0.2], [0, r * 0.75], [-r * 0.6, -r * 0.2]]); pkFill(g, c, r);
    pkPoly(g, [[0, -r], [r * 0.6, -r * 0.2], [0, -r * 0.2]]); g.fillStyle = pkTone(c, 0.78); g.fill(); pkPoly(g, [[0, r * 0.75], [-r * 0.6, -r * 0.2], [0, -r * 0.2]]); g.fillStyle = pkTone(c, 0.78); g.fill();
    g.beginPath(); g.moveTo(0, -r); g.lineTo(0, r * 0.75); g.moveTo(-r * 0.6, -r * 0.2); g.lineTo(r * 0.6, -r * 0.2); g.lineWidth = r * 0.04; g.strokeStyle = PK_INK; g.stroke(); },
  umbrella(g, r, c){ g.beginPath(); g.moveTo(0, -r * 0.15); g.lineTo(0, r * 0.75); g.quadraticCurveTo(0, r * 0.98, -r * 0.22, r * 0.9); g.lineWidth = r * 0.08; g.strokeStyle = '#5A3A1A'; g.lineCap = 'round'; g.stroke();
    g.beginPath(); g.moveTo(-r * 0.98, -r * 0.05); g.quadraticCurveTo(-r * 0.9, -r * 0.95, 0, -r * 0.95); g.quadraticCurveTo(r * 0.9, -r * 0.95, r * 0.98, -r * 0.05);
    for(let i = 3; i >= 0; i--){ const x1 = -r * 0.98 + (i + 1) * r * 0.49, x0 = x1 - r * 0.49; g.quadraticCurveTo((x0 + x1) / 2, -r * 0.3, x0, -r * 0.05); } pkFill(g, c, r);
    g.beginPath(); g.moveTo(0, -r * 0.95); g.lineTo(0, -r * 0.1); g.moveTo(0, -r * 0.95); g.quadraticCurveTo(-r * 0.35, -r * 0.6, -r * 0.49, -r * 0.08); g.moveTo(0, -r * 0.95); g.quadraticCurveTo(r * 0.35, -r * 0.6, r * 0.49, -r * 0.08); g.lineWidth = r * 0.04; g.strokeStyle = pkTone(c, 0.65); g.stroke(); },
  crown(g, r, c, n){ n = Math.max(1, Math.min(5, n || 3)); pkPoly(g, [[-r * 0.9, r * 0.6], [-r * 0.9, -r * 0.55], [-r * 0.45, -r * 0.05], [0, -r * 0.8], [r * 0.45, -r * 0.05], [r * 0.9, -r * 0.55], [r * 0.9, r * 0.6]]); pkFill(g, c, r);
    pkRR(g, -r * 0.9, r * 0.32, r * 1.8, r * 0.3, r * 0.04); pkFill(g, pkTone(c, 0.78), r * 0.6);
    const jw = [[0, 0.1], [-0.55, 0.1], [0.55, 0.1], [-0.28, 0.47], [0.28, 0.47]]; const jc = ['#E63946', '#3A6FE8', '#22B573', '#FFFFFF', '#8E5BE8'];
    for(let i = 0; i < n; i++){ g.beginPath(); g.arc(jw[i][0] * r, jw[i][1] * r, r * 0.14, 0, 7); pkFill(g, jc[i], r * 0.4); } pkDot(g, 0, -r * 0.8, r * 0.1, '#FFFFFF'); },
  key(g, r, c){ g.beginPath(); g.arc(-r * 0.5, 0, r * 0.42, 0, 7); g.arc(-r * 0.5, 0, r * 0.18, 0, 7, true); pkFill(g, c, r);
    pkRR(g, -r * 0.12, -r * 0.12, r * 1.08, r * 0.24, r * 0.06); pkFill(g, c, r); pkRR(g, r * 0.55, r * 0.08, r * 0.14, r * 0.3, r * 0.03); pkFill(g, c, r * 0.6); pkRR(g, r * 0.78, r * 0.08, r * 0.14, r * 0.22, r * 0.03); pkFill(g, c, r * 0.6); },
  mug(g, r, c){ g.beginPath(); g.arc(r * 0.62, r * 0.1, r * 0.3, -Math.PI / 2, Math.PI / 2); g.lineWidth = r * 0.16; g.strokeStyle = PK_INK; g.stroke(); g.lineWidth = r * 0.08; g.strokeStyle = c; g.stroke();
    pkRR(g, -r * 0.7, -r * 0.55, r * 1.3, r * 1.35, r * 0.16); pkFill(g, c, r); g.beginPath(); g.ellipse(-r * 0.05, -r * 0.55, r * 0.6, r * 0.12, 0, 0, 7); pkFill(g, '#6B3E1F', r * 0.5);
    g.beginPath(); g.moveTo(-r * 0.25, -r * 0.75); g.quadraticCurveTo(-r * 0.4, -r * 0.88, -r * 0.2, -r * 1.0); g.moveTo(r * 0.12, -r * 0.75); g.quadraticCurveTo(-r * 0.02, -r * 0.88, r * 0.18, -r * 1.0); g.lineWidth = r * 0.05; g.strokeStyle = 'rgba(255,255,255,0.8)'; g.stroke(); },
  teapot(g, r, c){ g.beginPath(); g.moveTo(r * 0.5, r * 0.1); g.quadraticCurveTo(r * 0.78, r * 0.0, r * 0.88, -r * 0.38); g.lineWidth = r * 0.18; g.strokeStyle = PK_INK; g.lineCap = 'round'; g.stroke(); g.lineWidth = r * 0.1; g.strokeStyle = c; g.stroke();
    g.beginPath(); g.arc(-r * 0.68, r * 0.05, r * 0.28, Math.PI / 2, -Math.PI / 2); g.lineWidth = r * 0.14; g.strokeStyle = PK_INK; g.stroke(); g.lineWidth = r * 0.07; g.strokeStyle = c; g.stroke();
    g.beginPath(); g.ellipse(0, r * 0.2, r * 0.65, r * 0.55, 0, 0, 7); pkFill(g, c, r); g.beginPath(); g.ellipse(0, -r * 0.35, r * 0.35, r * 0.12, 0, 0, 7); pkFill(g, pkTone(c, 0.8), r * 0.6); pkDot(g, 0, -r * 0.5, r * 0.09, pkTone(c, 0.8)); pkShine(g, -r * 0.25, r * 0.0, r * 0.15); },
  pencil(g, r, c){ pkPoly(g, [[-r * 0.62, -r * 0.18], [r * 0.6, -r * 0.18], [r * 0.6, r * 0.18], [-r * 0.62, r * 0.18]]); pkFill(g, c, r); pkPoly(g, [[r * 0.6, -r * 0.18], [r * 1.0, 0], [r * 0.6, r * 0.18]]); pkFill(g, '#F4D7A6', r * 0.6);
    pkPoly(g, [[r * 0.88, -r * 0.05], [r * 1.0, 0], [r * 0.88, r * 0.05]]); g.fillStyle = '#2A2140'; g.fill(); pkRR(g, -r * 0.92, -r * 0.18, r * 0.3, r * 0.36, r * 0.06); pkFill(g, '#FF8FB5', r * 0.6); pkRR(g, -r * 0.66, -r * 0.2, r * 0.08, r * 0.4, 0); g.fillStyle = '#C8C8D8'; g.fill(); },
  trophy(g, r, c){ [-1, 1].forEach(s => { g.beginPath(); g.arc(s * r * 0.6, -r * 0.42, r * 0.24, s > 0 ? -Math.PI / 2 : Math.PI / 2, s > 0 ? Math.PI / 2 : -Math.PI / 2, s < 0); g.lineWidth = r * 0.14; g.strokeStyle = PK_INK; g.stroke(); g.lineWidth = r * 0.07; g.strokeStyle = c; g.stroke(); });
    g.beginPath(); g.moveTo(-r * 0.62, -r * 0.8); g.lineTo(r * 0.62, -r * 0.8); g.quadraticCurveTo(r * 0.6, r * 0.05, 0, r * 0.15); g.quadraticCurveTo(-r * 0.6, r * 0.05, -r * 0.62, -r * 0.8); pkFill(g, c, r);
    pkRR(g, -r * 0.12, r * 0.12, r * 0.24, r * 0.42, 0); pkFill(g, pkTone(c, 0.8), r * 0.6); pkRR(g, -r * 0.5, r * 0.52, r * 1.0, r * 0.38, r * 0.08); pkFill(g, '#6B3E1F', r); pkShine(g, -r * 0.28, -r * 0.5, r * 0.14); },
  gift(g, r, c){ pkRR(g, -r * 0.78, -r * 0.35, r * 1.56, r * 1.2, r * 0.1); pkFill(g, c, r); pkRR(g, -r * 0.88, -r * 0.55, r * 1.76, r * 0.3, r * 0.08); pkFill(g, pkTone(c, 0.82), r);
    g.fillStyle = '#FFFFFF'; g.fillRect(-r * 0.12, -r * 0.55, r * 0.24, r * 1.4); [-1, 1].forEach(s => { g.beginPath(); g.ellipse(s * r * 0.28, -r * 0.7, r * 0.28, r * 0.15, s * 0.5, 0, 7); pkFill(g, '#FFFFFF', r * 0.5); }); },
  cactus(g, r, c, n){ n = Math.max(1, Math.min(3, n || 2)); pkPoly(g, [[-r * 0.5, r * 0.5], [r * 0.5, r * 0.5], [r * 0.38, r * 0.98], [-r * 0.38, r * 0.98]]); pkFill(g, '#C9733C', r);
    const arms = [[-1, -0.05], [1, -0.3], [-1, -0.5]]; for(let i = 0; i < n; i++){ const [s, y] = arms[i]; pkRR(g, s < 0 ? -r * 0.72 : r * 0.22, y * r, r * 0.5, r * 0.2, r * 0.1); pkFill(g, c, r * 0.7); pkRR(g, s < 0 ? -r * 0.72 : r * 0.52, (y - 0.35) * r, r * 0.2, r * 0.5, r * 0.1); pkFill(g, c, r * 0.7); }
    pkRR(g, -r * 0.24, -r * 0.92, r * 0.48, r * 1.45, r * 0.24); pkFill(g, c, r); g.beginPath(); g.moveTo(0, -r * 0.8); g.lineTo(0, r * 0.45); g.lineWidth = r * 0.04; g.strokeStyle = 'rgba(0,0,0,0.25)'; g.stroke(); },
  sun(g, r, c, n){ n = Math.max(3, Math.min(10, n || 8)); for(let i = 0; i < n; i++){ const a = i / n * Math.PI * 2 - Math.PI / 2; g.beginPath(); g.arc(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82, r * 0.17, 0, 7); pkFill(g, pkTone(c, 0.85), r * 0.5); }
    g.beginPath(); g.arc(0, 0, r * 0.56, 0, 7); pkFill(g, c, r); pkDot(g, -r * 0.18, -r * 0.08, r * 0.06, '#1d1530'); pkDot(g, r * 0.18, -r * 0.08, r * 0.06, '#1d1530'); g.beginPath(); g.arc(0, r * 0.08, r * 0.22, 0.3, Math.PI - 0.3); g.lineWidth = r * 0.05; g.strokeStyle = PK_INK; g.stroke(); },
  snowman(g, r, c, n){ n = Math.max(1, Math.min(4, n || 2)); g.beginPath(); g.arc(0, r * 0.42, r * 0.52, 0, 7); pkFill(g, '#FFFFFF', r); g.beginPath(); g.arc(0, -r * 0.3, r * 0.36, 0, 7); pkFill(g, '#FFFFFF', r);
    pkRR(g, -r * 0.42, -r * 0.08, r * 0.84, r * 0.18, r * 0.06); pkFill(g, c, r * 0.6); pkRR(g, r * 0.12, -r * 0.02, r * 0.18, r * 0.42, r * 0.05); pkFill(g, c, r * 0.6);
    pkRR(g, -r * 0.3, -r * 0.98, r * 0.6, r * 0.36, r * 0.04); pkFill(g, c, r * 0.6); pkRR(g, -r * 0.42, -r * 0.66, r * 0.84, r * 0.1, r * 0.03); pkFill(g, c, r * 0.6);
    pkDot(g, -r * 0.12, -r * 0.36, r * 0.05, '#1d1530'); pkDot(g, r * 0.12, -r * 0.36, r * 0.05, '#1d1530'); pkPoly(g, [[0, -r * 0.28], [r * 0.24, -r * 0.24], [0, -r * 0.2]]); g.fillStyle = '#FF8C1A'; g.fill();
    for(let i = 0; i < n; i++) pkSpot(g, 0, r * (0.18 + i * 0.19), r * 0.16, '#2A2140', r); },
  ufo(g, r, c, n){ n = Math.max(1, Math.min(5, n || 3)); g.beginPath(); g.ellipse(0, -r * 0.25, r * 0.42, r * 0.38, 0, Math.PI, 0); pkFill(g, '#BFE6FF', r);
    g.beginPath(); g.ellipse(0, 0, r * 0.98, r * 0.32, 0, 0, 7); pkFill(g, c, r); g.beginPath(); g.ellipse(0, r * 0.2, r * 0.5, r * 0.14, 0, 0, Math.PI); pkFill(g, pkTone(c, 0.75), r * 0.6);
    const lx = [-0.66, 0.66, 0, -0.33, 0.33]; for(let i = 0; i < n; i++) pkSpot(g, lx[i] * r, 0, r * 0.14, pkInk(c) === '#FFFFFF' ? '#FFE066' : '#2A2140', r); },
  anchor(g, r, c){ g.strokeStyle = PK_INK; g.lineCap = 'round'; const path = () => { g.beginPath(); g.arc(0, -r * 0.7, r * 0.2, 0, 7); g.moveTo(0, -r * 0.5); g.lineTo(0, r * 0.8); g.moveTo(-r * 0.42, -r * 0.25); g.lineTo(r * 0.42, -r * 0.25); g.moveTo(-r * 0.78, r * 0.25); g.quadraticCurveTo(-r * 0.6, r * 0.85, 0, r * 0.82); g.quadraticCurveTo(r * 0.6, r * 0.85, r * 0.78, r * 0.25); };
    path(); g.lineWidth = r * 0.28; g.stroke(); path(); g.lineWidth = r * 0.17; g.strokeStyle = c; g.stroke(); },
  // 📸 pk-4a trip props: 🧳 suitcase · 📷 camera · 🍦 ice cream (colour = the changeable part)
  suitcase(g, r, c){ g.beginPath(); g.roundRect(-r * 0.62, -r * 0.42, r * 1.24, r * 0.98, r * 0.16); pkFill(g, c, r * 0.6);
    g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = r * 0.1; g.beginPath(); g.moveTo(-r * 0.2, -r * 0.42); g.lineTo(-r * 0.2, -r * 0.62); g.lineTo(r * 0.2, -r * 0.62); g.lineTo(r * 0.2, -r * 0.42); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(-r * 0.62, -r * 0.02, r * 1.24, r * 0.12); g.beginPath(); g.arc(-r * 0.36, r * 0.6, r * 0.09, 0, 7); g.arc(r * 0.36, r * 0.6, r * 0.09, 0, 7); g.fillStyle = '#26203F'; g.fill(); },
  camera(g, r, c){ g.beginPath(); g.roundRect(-r * 0.66, -r * 0.36, r * 1.32, r * 0.86, r * 0.14); pkFill(g, c, r * 0.6); g.beginPath(); g.roundRect(-r * 0.24, -r * 0.56, r * 0.48, r * 0.22, r * 0.06); pkFill(g, c, r * 0.5);
    g.beginPath(); g.arc(0, r * 0.08, r * 0.3, 0, 7); pkFill(g, '#2B2D42', r * 0.5); g.beginPath(); g.arc(0, r * 0.08, r * 0.16, 0, 7); g.fillStyle = '#8EC5FF'; g.fill(); pkShine(g, -r * 0.08, 0, r * 0.06);
    g.fillStyle = '#FFE066'; g.beginPath(); g.arc(r * 0.44, -r * 0.18, r * 0.08, 0, 7); g.fill(); },
  icecream(g, r, c){ g.beginPath(); g.moveTo(-r * 0.32, -r * 0.05); g.lineTo(r * 0.32, -r * 0.05); g.lineTo(0, r * 0.82); g.closePath(); pkFill(g, '#E0A458', r * 0.5);
    g.strokeStyle = 'rgba(120,70,20,0.45)'; g.lineWidth = r * 0.04; for(let i = -1; i <= 1; i++){ g.beginPath(); g.moveTo(i * r * 0.18 - r * 0.1, -r * 0.02); g.lineTo(i * r * 0.18 + r * 0.12, r * 0.4); g.stroke(); }
    g.beginPath(); g.arc(0, -r * 0.24, r * 0.38, 0, 7); pkFill(g, c, r * 0.6); g.beginPath(); g.arc(-r * 0.12, -r * 0.56, r * 0.24, 0, 7); pkFill(g, c, r * 0.5); pkShine(g, -r * 0.18, -r * 0.36, r * 0.08); },
  // 🧑 a family member (pk-4a): drawn by 🎭 Acting at ONE size for every act, so only the pose / face / turn changes between A and B
  person(g, r, c, n, it){
    const fam = window.PK_FAMILY || [], who = fam[it.who % Math.max(1, fam.length)], w = r * 2, h = r * 2.2;
    if(!who || !window.Acting){ emo(g, '🧑', 0, 0, r * 1.5, 1); return; }
    pkPersonAct(it.act);
    const f = Acting.fit(who, PK_FIT_ACTS(), w, h, {t: 0, variant: 0});
    Acting.draw(g, who, -w / 2 + f.x, -h / 2 + f.y, f.k, it.act, {t: 0, variant: 0, noPet: true});
  },
  // 🎲 pk-5c Mix layer 5 "others": 🖼️ a little framed picture (n = stars in it, count them) · 🐜 an ant
  frame(g, r, c, n){ n = Math.max(1, Math.min(4, n || 2)); g.beginPath(); g.moveTo(-r * 0.3, -r * 0.82); g.lineTo(0, -r * 1.0); g.lineTo(r * 0.3, -r * 0.82); g.lineWidth = r * 0.05; g.strokeStyle = PK_INK; g.stroke();
    pkRR(g, -r * 0.9, -r * 0.78, r * 1.8, r * 1.5, r * 0.1); pkFill(g, c, r); pkRR(g, -r * 0.68, -r * 0.56, r * 1.36, r * 1.06, r * 0.05); g.fillStyle = '#BFE4FF'; g.fill();
    g.fillStyle = '#7BC96F'; g.beginPath(); g.moveTo(-r * 0.68, r * 0.5); g.quadraticCurveTo(-r * 0.2, r * 0.05, r * 0.2, r * 0.3); g.quadraticCurveTo(r * 0.5, r * 0.15, r * 0.68, r * 0.3); g.lineTo(r * 0.68, r * 0.5); g.closePath(); g.fill();
    const at = [[-0.36, -0.28], [0.34, -0.3], [0, -0.22], [-0.04, 0.1]].slice(0, n);
    at.forEach(([x, y], i) => { const p = []; for(let k = 0; k < 10; k++){ const a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? r * 0.08 : r * 0.19; p.push([x * r + Math.cos(a) * q, y * r + Math.sin(a) * q]); } pkPoly(g, p); pkFill(g, '#FFD23F', r * 0.45); }); },
  ant(g, r, c){ g.strokeStyle = PK_INK; g.lineWidth = Math.max(1.4, r * 0.08); g.lineCap = 'round';
    [-0.3, 0, 0.3].forEach(x => { g.beginPath(); g.moveTo(x * r, r * 0.05); g.lineTo(x * r - r * 0.18, r * 0.55); g.moveTo(x * r, r * 0.05); g.lineTo(x * r + r * 0.12, r * 0.55); g.stroke(); });
    g.beginPath(); g.moveTo(r * 0.62, -r * 0.18); g.quadraticCurveTo(r * 0.8, -r * 0.7, r * 1.0, -r * 0.62); g.stroke();
    [[-0.58, 0.02, 0.4, 0.3], [0, 0, 0.26, 0.22], [0.55, -0.08, 0.26, 0.24]].forEach(([x, y, a, b]) => { g.beginPath(); g.ellipse(x * r, y * r, a * r, b * r, 0, 0, 7); pkFill(g, c, r * 0.8); });
    pkDot(g, r * 0.66, -r * 0.14, r * 0.07, '#FFFFFF'); pkShine(g, -r * 0.66, -r * 0.1, r * 0.1); },
  // ✨ pk-5c Mix layer 4: a particle (it.pt = confetti · bubble · sparkle · snow · drop · leaflet · star), always outlined so it shows on any sky
  pt(g, r, c, n, it){ const k = (it && it.pt) || 'star';
    if(k === 'confetti'){ pkRR(g, -r * 0.85, -r * 0.48, r * 1.7, r * 0.96, r * 0.12); pkFill(g, c, r * 0.9); return; }
    if(k === 'bubble'){ g.beginPath(); g.arc(0, 0, r * 0.9, 0, 7); g.fillStyle = c; g.globalAlpha = 0.5; g.fill(); g.globalAlpha = 1; pkOut(g, r * 0.9); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(-r * 0.3, -r * 0.32, r * 0.22, 0, 7); g.fill(); return; }
    if(k === 'drop'){ g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(r * 0.85, r * 0.15, 0, r * 0.85); g.quadraticCurveTo(-r * 0.85, r * 0.15, 0, -r); g.closePath(); pkFill(g, c, r * 0.9); pkShine(g, -r * 0.22, r * 0.12, r * 0.14); return; }
    if(k === 'leaflet'){ g.beginPath(); g.ellipse(0, 0, r * 0.95, r * 0.5, 0, 0, 7); pkFill(g, c, r * 0.9); g.beginPath(); g.moveTo(-r * 0.8, 0); g.lineTo(r * 0.8, 0); g.lineWidth = r * 0.1; g.strokeStyle = pkTone(c, 0.6); g.stroke(); return; }
    const pts = k === 'sparkle' ? 4 : k === 'snow' ? 6 : 5, inner = k === 'sparkle' ? 0.42 : k === 'snow' ? 0.55 : 0.46, p = [];
    for(let i = 0; i < pts * 2; i++){ const a = -Math.PI / 2 + i * Math.PI / pts, q = i % 2 ? r * inner : r; p.push([Math.cos(a) * q, Math.sin(a) * q]); }
    pkPoly(g, p); pkFill(g, c, r * 0.9); if(k === 'snow') pkDot(g, 0, 0, r * 0.18, pkTone(c, 0.8)); },
  // 📖 pk-3b story pieces: 🦴 a bone (dino clutter) · 🪙 a coin (sea clutter)
  bone(g, r){ g.fillStyle = '#F4EBD6'; g.beginPath(); g.rect(-r * 0.55, -r * 0.14, r * 1.1, r * 0.28); g.fill(); pkOut(g, r * 0.4);
    [[-0.6, -0.16], [-0.6, 0.16], [0.6, -0.16], [0.6, 0.16]].forEach(p => { g.beginPath(); g.arc(r * p[0], r * p[1], r * 0.2, 0, 7); pkFill(g, '#F4EBD6', r * 0.4); }); },
  coin(g, r, c){ g.beginPath(); g.arc(0, 0, r * 0.55, 0, 7); pkFill(g, '#F2C230', r * 0.6); g.beginPath(); g.arc(0, 0, r * 0.38, 0, 7); g.strokeStyle = '#C9921A'; g.lineWidth = r * 0.08; g.stroke(); pkShine(g, -r * 0.18, -r * 0.2, r * 0.12); },
  // 📖 R3 (pk-3a) story pieces (never in a Spot picture): 👣 a boot print · 📎 a paper clip · 📌 a nail
  foot(g, r, c){ g.beginPath(); g.ellipse(0, -r * 0.18, r * 0.42, r * 0.62, 0, 0, 7); pkFill(g, c, r * 0.8); g.beginPath(); g.ellipse(0, r * 0.66, r * 0.32, r * 0.28, 0, 0, 7); pkFill(g, c, r * 0.8);
    g.fillStyle = 'rgba(0,0,0,0.22)'; [-0.22, 0.02, 0.24].forEach(x => { g.beginPath(); g.rect(r * (x - 0.07), -r * 0.62, r * 0.12, r * 0.7); g.fill(); }); pkShine(g, -r * 0.14, -r * 0.42, r * 0.12); },
  clip(g, r){ g.lineWidth = r * 0.13; g.strokeStyle = '#9AA6B8'; g.lineCap = 'round'; g.beginPath(); g.moveTo(-r * 0.2, r * 0.55); g.lineTo(-r * 0.2, -r * 0.5); g.arc(0, -r * 0.5, r * 0.2, Math.PI, 0); g.lineTo(r * 0.2, r * 0.7); g.arc(r * 0.02, r * 0.7, r * 0.18, 0, Math.PI); g.lineTo(-r * 0.16, -r * 0.25); g.stroke();
    g.lineWidth = r * 0.04; g.strokeStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.moveTo(-r * 0.24, 0); g.lineTo(-r * 0.24, -r * 0.4); g.stroke(); },
  nail(g, r){ g.fillStyle = '#8D99AE'; g.beginPath(); g.moveTo(-r * 0.08, -r * 0.6); g.lineTo(r * 0.08, -r * 0.6); g.lineTo(r * 0.05, r * 0.65); g.lineTo(0, r * 0.9); g.lineTo(-r * 0.05, r * 0.65); g.closePath(); g.fill(); pkOut(g, r * 0.5);
    g.beginPath(); g.ellipse(0, -r * 0.66, r * 0.3, r * 0.1, 0, 0, 7); pkFill(g, '#B8C2D1', r * 0.6); },
  circle(g, r, c){ g.beginPath(); g.arc(0, 0, r * 0.9, 0, 7); pkFill(g, c, r); pkShine(g, -r * 0.32, -r * 0.36, r * 0.24); },
  square(g, r, c){ pkRR(g, -r * 0.8, -r * 0.8, r * 1.6, r * 1.6, r * 0.24); pkFill(g, c, r); pkShine(g, -r * 0.38, -r * 0.4, r * 0.22); },
  triangle(g, r, c){ pkPoly(g, [[0, -r * 0.98], [r * 0.95, r * 0.72], [-r * 0.95, r * 0.72]]); pkFill(g, c, r); pkShine(g, -r * 0.12, -r * 0.2, r * 0.18); },
  star(g, r, c){ const p = []; for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; p.push([Math.cos(a) * q, Math.sin(a) * q + r * 0.06]); } pkPoly(g, p); pkFill(g, c, r); pkShine(g, -r * 0.16, -r * 0.18, r * 0.14); },
  heart(g, r, c){ g.beginPath(); g.moveTo(0, r * 0.88); g.bezierCurveTo(-r * 1.35, -r * 0.08, -r * 0.6, -r * 1.08, 0, -r * 0.42); g.bezierCurveTo(r * 0.6, -r * 1.08, r * 1.35, -r * 0.08, 0, r * 0.88); g.closePath(); pkFill(g, c, r); pkShine(g, -r * 0.42, -r * 0.42, r * 0.18); },
  diamond(g, r, c){ pkPoly(g, [[0, -r], [r * 0.6, 0], [0, r], [-r * 0.6, 0]]); pkFill(g, c, r); g.beginPath(); g.moveTo(-r * 0.6, 0); g.lineTo(r * 0.6, 0); g.lineWidth = r * 0.05; g.strokeStyle = 'rgba(255,255,255,0.5)'; g.stroke(); },
  hexagon(g, r, c){ const p = []; for(let i = 0; i < 6; i++){ const a = i * Math.PI / 3; p.push([Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92]); } pkPoly(g, p); pkFill(g, c, r); pkShine(g, -r * 0.3, -r * 0.34, r * 0.2); },
  fish(g, r, c){ pkPoly(g, [[-r * 0.55, 0], [-r * 1.0, -r * 0.48], [-r * 0.92, 0], [-r * 1.0, r * 0.48]]); pkFill(g, pkTone(c, 0.78), r);
    g.beginPath(); g.ellipse(r * 0.08, 0, r * 0.78, r * 0.5, 0, 0, 7); pkFill(g, c, r);
    g.beginPath(); g.moveTo(-r * 0.1, -r * 0.46); g.quadraticCurveTo(r * 0.1, -r * 0.8, r * 0.3, -r * 0.44); pkFill(g, pkTone(c, 0.78), r * 0.6);
    pkDot(g, r * 0.5, -r * 0.1, r * 0.15, '#fff'); pkDot(g, r * 0.55, -r * 0.1, r * 0.07, '#1d1530'); pkShine(g, -r * 0.05, -r * 0.2, r * 0.2); },
  bird(g, r, c){ pkPoly(g, [[-r * 0.55, r * 0.05], [-r * 1.0, -r * 0.2], [-r * 0.95, r * 0.25]]); pkFill(g, pkTone(c, 0.75), r);
    g.beginPath(); g.arc(-r * 0.05, r * 0.12, r * 0.6, 0, 7); pkFill(g, c, r); g.beginPath(); g.arc(r * 0.42, -r * 0.36, r * 0.36, 0, 7); pkFill(g, c, r);
    pkPoly(g, [[r * 0.72, -r * 0.42], [r * 1.02, -r * 0.3], [r * 0.72, -r * 0.2]]); pkFill(g, '#FFB627', r * 0.6);
    g.beginPath(); g.ellipse(-r * 0.12, r * 0.12, r * 0.36, r * 0.22, -0.3, 0, 7); pkFill(g, pkTone(c, 0.75), r * 0.7);
    pkDot(g, r * 0.5, -r * 0.42, r * 0.09, '#1d1530'); g.beginPath(); g.moveTo(-r * 0.1, r * 0.7); g.lineTo(-r * 0.1, r * 0.92); g.moveTo(r * 0.15, r * 0.7); g.lineTo(r * 0.15, r * 0.92); pkOut(g, r); },
  flower(g, r, c, n){ n = n || 5; g.beginPath(); g.moveTo(0, r * 0.2); g.lineTo(0, r); g.lineWidth = r * 0.12; g.strokeStyle = '#2E8B3A'; g.stroke();
    for(let i = 0; i < n; i++){ const a = -Math.PI / 2 + i * 2 * Math.PI / n; g.save(); g.translate(Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42 - r * 0.12); g.rotate(a); g.beginPath(); g.ellipse(0, 0, r * 0.34, r * 0.19, 0, 0, 7); pkFill(g, c, r * 0.7); g.restore(); }
    g.beginPath(); g.arc(0, -r * 0.12, r * 0.24, 0, 7); pkFill(g, PK.colDist(c, '#FFD23F') < 120 ? '#FF7A1A' : '#FFD23F', r * 0.7); },
  tree(g, r, c){ pkRR(g, -r * 0.15, r * 0.05, r * 0.3, r * 0.92, r * 0.06); pkFill(g, '#8B5A2B', r);
    const cs = [[0, -r * 0.35, r * 0.58], [-r * 0.42, -r * 0.05, r * 0.42], [r * 0.42, -r * 0.05, r * 0.42]];
    cs.forEach(([x, y, q]) => { g.beginPath(); g.arc(x, y, q, 0, 7); pkOut(g, r); }); g.fillStyle = c; cs.forEach(([x, y, q]) => { g.beginPath(); g.arc(x, y, q, 0, 7); g.fill(); });
    pkShine(g, -r * 0.18, -r * 0.55, r * 0.2); },
  house(g, r, c, n){ n = n || 2; pkRR(g, -r * 0.75, -r * 0.25, r * 1.5, r * 1.05, r * 0.06); pkFill(g, c, r);
    pkPoly(g, [[0, -r * 1.0], [r * 0.95, -r * 0.2], [-r * 0.95, -r * 0.2]]); pkFill(g, pkTone(c, 0.62), r);
    pkRR(g, -r * 0.56, r * 0.22, r * 0.36, r * 0.58, r * 0.06); pkFill(g, '#7A4A22', r * 0.7);
    const wp = [[r * 0.18, -r * 0.08], [r * 0.48, -r * 0.08], [r * 0.18, r * 0.38], [r * 0.48, r * 0.38]];
    for(let i = 0; i < Math.min(4, n); i++){ pkRR(g, wp[i][0] - r * 0.12, wp[i][1] - r * 0.12, r * 0.24, r * 0.24, r * 0.04); pkFill(g, '#FFF2A8', r * 0.6); } },
  rocket(g, r, c){ pkPoly(g, [[-r * 0.32, r * 0.35], [-r * 0.62, r * 0.82], [-r * 0.2, r * 0.6]]); pkFill(g, pkTone(c, 0.7), r); pkPoly(g, [[r * 0.32, r * 0.35], [r * 0.62, r * 0.82], [r * 0.2, r * 0.6]]); pkFill(g, pkTone(c, 0.7), r);
    pkPoly(g, [[-r * 0.16, r * 0.62], [0, r * 1.0], [r * 0.16, r * 0.62]]); pkFill(g, '#FF8C1A', r * 0.5);
    g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(r * 0.5, -r * 0.5, r * 0.34, r * 0.62); g.lineTo(-r * 0.34, r * 0.62); g.quadraticCurveTo(-r * 0.5, -r * 0.5, 0, -r); g.closePath(); pkFill(g, c, r);
    g.beginPath(); g.arc(0, -r * 0.12, r * 0.17, 0, 7); pkFill(g, '#BFE8FF', r * 0.6); },
  mushroom(g, r, c, n){ n = n || 3; pkRR(g, -r * 0.26, -r * 0.05, r * 0.52, r * 0.9, r * 0.14); pkFill(g, '#F6E7C8', r);
    g.beginPath(); g.ellipse(0, 0, r * 0.95, r * 0.78, 0, Math.PI, 0); g.closePath(); pkFill(g, c, r);
    const sp = [[0, -r * 0.5], [-r * 0.5, -r * 0.2], [r * 0.5, -r * 0.2], [-r * 0.22, -r * 0.22], [r * 0.22, -r * 0.22]];
    for(let i = 0; i < Math.min(5, n); i++) pkDot(g, sp[i][0], sp[i][1], r * 0.17, '#FFFFFF'); },
  ladybug(g, r, c, n){ n = n || 4; g.beginPath(); g.arc(0, -r * 0.62, r * 0.38, Math.PI, 0); g.closePath(); pkFill(g, '#1d1530', r);
    g.beginPath(); g.arc(0, r * 0.08, r * 0.78, 0, 7); pkFill(g, c, r); g.beginPath(); g.moveTo(0, -r * 0.68); g.lineTo(0, r * 0.84); g.lineWidth = r * 0.07; g.strokeStyle = PK_INK; g.stroke();
    for(let i = 0; i < Math.min(6, n); i++) pkDot(g, PK_SPOTS[i][0] * r, PK_SPOTS[i][1] * r, r * 0.17, '#1d1530');
    pkDot(g, -r * 0.14, -r * 0.72, r * 0.07, '#fff'); pkDot(g, r * 0.14, -r * 0.72, r * 0.07, '#fff'); },
  balloon(g, r, c){ g.beginPath(); g.moveTo(0, r * 0.68); g.quadraticCurveTo(r * 0.25, r * 0.85, 0, r * 1.02); g.lineWidth = r * 0.05; g.strokeStyle = PK_INK; g.stroke();
    pkPoly(g, [[0, r * 0.6], [r * 0.1, r * 0.74], [-r * 0.1, r * 0.74]]); pkFill(g, c, r * 0.5);
    g.beginPath(); g.ellipse(0, -r * 0.12, r * 0.64, r * 0.76, 0, 0, 7); pkFill(g, c, r); pkShine(g, -r * 0.25, -r * 0.42, r * 0.2); },
  cloud(g, r, c){ const cs = [[-r * 0.48, r * 0.12, r * 0.42], [0, -r * 0.16, r * 0.56], [r * 0.48, r * 0.12, r * 0.42], [0, r * 0.2, r * 0.42]], f = pkTone(c, 1.45);
    cs.forEach(([x, y, q]) => { g.beginPath(); g.arc(x, y, q, 0, 7); pkOut(g, r); }); g.fillStyle = f; cs.forEach(([x, y, q]) => { g.beginPath(); g.arc(x, y, q, 0, 7); g.fill(); }); pkShine(g, -r * 0.1, -r * 0.4, r * 0.2); },
  dice(g, r, c, n){ n = Math.max(1, Math.min(6, n || 3)); pkRR(g, -r * 0.82, -r * 0.82, r * 1.64, r * 1.64, r * 0.3); pkFill(g, c, r);
    (PK_DICE[n] || []).forEach(([x, y]) => pkDot(g, x * r * 0.46, y * r * 0.46, r * 0.17, '#FFFFFF')); },
  crystal(g, r, c){ pkPoly(g, [[0, -r], [r * 0.62, -r * 0.32], [r * 0.45, r * 0.85], [-r * 0.45, r * 0.85], [-r * 0.62, -r * 0.32]]); pkFill(g, c, r);
    g.beginPath(); g.moveTo(-r * 0.62, -r * 0.32); g.lineTo(0, -r * 0.05); g.lineTo(r * 0.62, -r * 0.32); g.moveTo(0, -r * 0.05); g.lineTo(0, r * 0.85); g.lineWidth = r * 0.05; g.strokeStyle = 'rgba(255,255,255,0.55)'; g.stroke(); },
  planet(g, r, c){ const ring = pkTone(c, 0.65); g.save(); g.rotate(-0.4); g.beginPath(); g.ellipse(0, 0, r * 1.02, r * 0.3, 0, Math.PI, 0); g.lineWidth = r * 0.14; g.strokeStyle = ring; g.stroke(); g.restore();
    g.beginPath(); g.arc(0, 0, r * 0.62, 0, 7); pkFill(g, c, r); pkShine(g, -r * 0.2, -r * 0.24, r * 0.16);
    g.save(); g.rotate(-0.4); g.beginPath(); g.ellipse(0, 0, r * 1.02, r * 0.3, 0, 0, Math.PI); g.lineWidth = r * 0.14; g.strokeStyle = ring; g.stroke(); g.restore(); },
  boat(g, r, c){ g.beginPath(); g.moveTo(-r * 0.02, -r * 0.95); g.lineTo(-r * 0.02, r * 0.28); g.lineWidth = r * 0.08; g.strokeStyle = '#6B4423'; g.stroke();
    pkPoly(g, [[r * 0.04, -r * 0.9], [r * 0.7, r * 0.18], [r * 0.04, r * 0.18]]); pkFill(g, '#FFFFFF', r * 0.8);
    pkPoly(g, [[-r * 0.04, -r * 0.95], [-r * 0.42, -r * 0.82], [-r * 0.04, -r * 0.7]]); pkFill(g, '#E63946', r * 0.5);
    pkPoly(g, [[-r * 0.95, r * 0.3], [r * 0.95, r * 0.3], [r * 0.6, r * 0.8], [-r * 0.65, r * 0.8]]); pkFill(g, c, r); },
  snail(g, r, c){ g.beginPath(); g.ellipse(r * 0.05, r * 0.55, r * 0.95, r * 0.28, 0, 0, 7); pkFill(g, '#B9E07A', r);
    g.beginPath(); g.moveTo(r * 0.7, r * 0.4); g.lineTo(r * 0.85, -r * 0.2); g.moveTo(r * 0.55, r * 0.4); g.lineTo(r * 0.6, -r * 0.18); pkOut(g, r); pkDot(g, r * 0.85, -r * 0.22, r * 0.08, '#1d1530'); pkDot(g, r * 0.6, -r * 0.2, r * 0.08, '#1d1530');
    g.beginPath(); g.arc(-r * 0.2, r * 0.02, r * 0.62, 0, 7); pkFill(g, c, r);
    g.beginPath(); for(let t = 0; t < 3.3 * Math.PI; t += 0.2){ const q = r * 0.5 * (1 - t / (3.6 * Math.PI)); const x = -r * 0.2 + Math.cos(t) * q, y = r * 0.02 + Math.sin(t) * q; t ? g.lineTo(x, y) : g.moveTo(x, y); } g.lineWidth = r * 0.07; g.strokeStyle = pkTone(c, 0.6); g.stroke(); },
  gear(g, r, c){ const p = []; for(let i = 0; i < 16; i++){ const a = i * Math.PI / 8, q = i % 2 ? r * 0.7 : r * 0.95; p.push([Math.cos(a - 0.1) * q, Math.sin(a - 0.1) * q]); p.push([Math.cos(a + 0.1) * q, Math.sin(a + 0.1) * q]); } pkPoly(g, p); pkFill(g, c, r);
    g.beginPath(); g.arc(0, 0, r * 0.26, 0, 7); g.fillStyle = 'rgba(20,14,40,0.75)'; g.fill(); },
  shell(g, r, c, n){ n = n || 5; g.beginPath(); g.moveTo(-r * 0.2, r * 0.72); g.arc(0, r * 0.72, r * 0.95, Math.PI * 1.08, Math.PI * 1.92); g.lineTo(r * 0.2, r * 0.72); g.closePath(); pkFill(g, c, r);
    for(let i = 1; i < n; i++){ const a = Math.PI * (1.08 + 0.84 * i / n); g.beginPath(); g.moveTo(0, r * 0.68); g.lineTo(Math.cos(a) * r * 0.9, r * 0.72 + Math.sin(a) * r * 0.9); g.lineWidth = r * 0.09; g.strokeStyle = pkTone(c, 0.6); g.stroke(); }
    pkRR(g, -r * 0.24, r * 0.6, r * 0.48, r * 0.26, r * 0.08); pkFill(g, pkTone(c, 0.8), r * 0.6); },
  sign(g, r, c, n, it){ g.beginPath(); g.moveTo(0, r * 0.2); g.lineTo(0, r * 0.98); g.lineWidth = r * 0.14; g.strokeStyle = '#7A4A22'; g.stroke();
    pkRR(g, -r * 0.98, -r * 0.62, r * 1.96, r * 0.92, r * 0.16); pkFill(g, c, r); pkRR(g, -r * 0.84, -r * 0.5, r * 1.68, r * 0.68, r * 0.1); g.fillStyle = '#FFFBEA'; g.fill();
    const t = (it && it.txt) || '?'; g.fillStyle = '#26203F'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = r * 0.6; g.font = '700 ' + fs + 'px Fredoka, Nunito, sans-serif';
    const w = g.measureText(t).width; if(w > r * 1.56){ fs *= r * 1.56 / w; g.font = '700 ' + fs + 'px Fredoka, Nunito, sans-serif'; } g.fillText(t, 0, -r * 0.15); },
  beads(g, r, c, n, it){ const pat = (it && it.pat) || [c, c, c, c, c, c], m = pat.length, sp = r * 1.8 / (m - 1);
    g.beginPath(); g.moveTo(-r * 1.0, -r * 0.1); g.quadraticCurveTo(0, r * 0.35, r * 1.0, -r * 0.1); g.lineWidth = r * 0.05; g.strokeStyle = PK_INK; g.stroke();
    pat.forEach((col, i) => { const x = -r * 0.9 + i * sp, y = -r * 0.08 + Math.sin(Math.PI * i / (m - 1)) * r * 0.32; g.beginPath(); g.arc(x, y, r * 0.2, 0, 7); pkFill(g, col, r * 0.6); pkShine(g, x - r * 0.06, y - r * 0.07, r * 0.05); }); },
  leaf(g, r, c){ g.beginPath(); g.moveTo(0, r * 0.95); g.lineTo(0, r * 0.6); g.lineWidth = r * 0.1; g.strokeStyle = '#6B4423'; g.stroke();
    g.beginPath(); g.moveTo(0, r * 0.65); g.bezierCurveTo(-r * 0.8, r * 0.3, -r * 0.5, -r * 0.6, 0, -r); g.bezierCurveTo(r * 0.5, -r * 0.6, r * 0.8, r * 0.3, 0, r * 0.65); g.closePath(); pkFill(g, c, r);
    g.beginPath(); g.moveTo(0, r * 0.6); g.lineTo(0, -r * 0.8); g.moveTo(0, r * 0.1); g.lineTo(-r * 0.3, -r * 0.15); g.moveTo(0, -r * 0.2); g.lineTo(r * 0.28, -r * 0.45); g.lineWidth = r * 0.05; g.strokeStyle = pkTone(c, 0.6); g.stroke(); }
};
// the background (the SAME in both pictures)

// 📸 pk-4a: face-swap acts ('pkp.<pose>.<face>') are made on the fly from the pose + a new face; the fit box covers every photo act so all share one size
function pkPersonAct(act){ if(!window.Acting || !/^pkp\./.test(act) || Acting.has('acts', act)) return; const m = act.split('.'); Acting.add({acts: {[act]: {pose: m[1], face: m.slice(2).join('.'), ride: 'keep', tags: ['photo']}}}, {by: '🔍 Pokadif', block: 'pokadif-run', game: 'pokadif'}); }
let PK_FIT_LIST = null;
function PK_FIT_ACTS(){ if(!PK_FIT_LIST) PK_FIT_LIST = Object.keys(PK.PHOTO_ACTS).concat([PK.SELFIE]).filter(a => window.Acting && Acting.has('acts', a)); return PK_FIT_LIST.length ? PK_FIT_LIST : ['idle']; }
// 🗺️ the trip landmark behind the family (same in A and B)
function pkTrip(g, sc, R){
  const T = PK.THEMES[sc.theme], W = PK.W, G = PK.GROUND, m = T.mark;
  const tri = (x, y, w, h, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x, y - h); g.lineTo(x + w / 2, y); g.closePath(); g.fill(); };
  if(m === 'temple'){ g.fillStyle = 'rgba(30,60,30,0.35)'; for(let i = 0; i < 7; i++){ g.beginPath(); g.arc(30 + i * 60, G - 10, 30 + (i % 3) * 8, Math.PI, 0); g.fill(); }
    g.fillStyle = '#E8C46A'; g.fillRect(W * 0.62, G - 70, 70, 70); tri(W * 0.62 + 35, G - 70, 86, 60, '#D9A441'); tri(W * 0.62 + 35, G - 118, 30, 40, '#F2D27A'); g.fillStyle = '#7A4A1A'; g.fillRect(W * 0.62 + 27, G - 34, 16, 34);
    g.fillStyle = '#8A8FA0'; g.beginPath(); g.ellipse(W * 0.22, G - 30, 34, 24, 0, 0, 7); g.fill(); g.beginPath(); g.arc(W * 0.22 - 34, G - 40, 16, 0, 7); g.fill(); g.fillRect(W * 0.22 - 52, G - 40, 8, 34); [-22, -6, 10, 24].forEach(x => g.fillRect(W * 0.22 + x, G - 14, 9, 16)); }
  if(m === 'mountain'){ tri(W * 0.5, G, 300, 150, '#6F7FA8'); tri(W * 0.5, G - 105, 66, 45, '#FFFFFF'); [40, 90, 320, 365].forEach((x, i) => { g.fillStyle = '#7A4A2A'; g.fillRect(x - 3, G - 38, 6, 38); g.fillStyle = i % 2 ? '#F7A8C8' : '#FFC2DA'; g.beginPath(); g.arc(x, G - 46, 20, 0, 7); g.fill(); }); }
  if(m === 'pyramids'){ g.fillStyle = 'rgba(255,240,180,0.9)'; g.beginPath(); g.arc(W * 0.82, 50, 24, 0, 7); g.fill(); tri(W * 0.32, G, 210, 120, '#D49A4A'); tri(W * 0.62, G, 150, 86, '#E0AE5E'); tri(W * 0.84, G, 90, 50, '#C98E40');
    g.strokeStyle = 'rgba(120,70,20,0.25)'; g.lineWidth = 1.5; for(let y = 20; y < 120; y += 20){ g.beginPath(); g.moveTo(W * 0.32 - 105 * (y / 120), G - 120 + y); g.lineTo(W * 0.32 + 105 * (y / 120), G - 120 + y); g.stroke(); } }
  if(m === 'aurora'){ ['rgba(80,255,170,0.35)', 'rgba(120,180,255,0.3)', 'rgba(200,120,255,0.25)'].forEach((c, i) => { g.strokeStyle = c; g.lineWidth = 16 - i * 3; g.beginPath(); for(let x = 0; x <= W; x += 20) g.lineTo(x, 50 + i * 22 + Math.sin(x * 0.02 + i) * 18); g.stroke(); });
    g.fillStyle = '#F4FAFF'; g.beginPath(); g.arc(W * 0.7, G, 48, Math.PI, 0); g.fill(); g.strokeStyle = 'rgba(120,160,200,0.6)'; g.lineWidth = 1.5; for(let a = 1; a < 4; a++){ g.beginPath(); g.arc(W * 0.7, G, 48 * a / 4, Math.PI, 0); g.stroke(); } g.fillStyle = '#2E4A6A'; g.beginPath(); g.arc(W * 0.7, G, 14, Math.PI, 0); g.fill(); }
  if(m === 'volcano'){ tri(W * 0.45, G, 280, 140, '#5A3A3A'); g.fillStyle = '#FF7A1A'; g.beginPath(); g.moveTo(W * 0.45 - 20, G - 130); g.lineTo(W * 0.45 + 20, G - 130); g.lineTo(W * 0.45 + 40, G - 60); g.lineTo(W * 0.45 + 10, G - 90); g.lineTo(W * 0.45 - 30, G - 50); g.closePath(); g.fill();
    g.fillStyle = 'rgba(80,60,60,0.5)'; [0, 1, 2].forEach(i => { g.beginPath(); g.arc(W * 0.45 + i * 14 - 10, G - 150 - i * 18, 14 + i * 5, 0, 7); g.fill(); }); }
  if(m === 'beach'){ g.fillStyle = '#2E9BDA'; g.fillRect(0, G - 40, W, 44); g.fillStyle = 'rgba(255,255,255,0.6)'; for(let x = 10; x < W; x += 40){ g.beginPath(); g.ellipse(x, G - 30 + (x % 3) * 8, 12, 2.5, 0, 0, 7); g.fill(); }
    g.fillStyle = '#FFE680'; g.beginPath(); g.arc(W * 0.16, 52, 26, 0, 7); g.fill(); g.strokeStyle = '#8A5A2A'; g.lineWidth = 7; g.beginPath(); g.moveTo(W * 0.86, G); g.quadraticCurveTo(W * 0.84, G - 60, W * 0.8, G - 110); g.stroke();
    g.fillStyle = '#3FA34D'; [[-1, 0.2], [1, 0.2], [-0.6, -0.6], [0.6, -0.6]].forEach(v => { g.beginPath(); g.ellipse(W * 0.8 + v[0] * 26, G - 112 + v[1] * 10, 30, 8, v[0] * 0.5, 0, 7); g.fill(); }); }
  if(m === 'moon'){ g.fillStyle = '#3A7BD5'; g.beginPath(); g.arc(W * 0.8, 60, 30, 0, 7); g.fill(); g.fillStyle = '#4CB050'; g.beginPath(); g.ellipse(W * 0.79, 52, 12, 8, 0.4, 0, 7); g.ellipse(W * 0.83, 72, 9, 6, -0.3, 0, 7); g.fill();
    g.fillStyle = 'rgba(220,235,255,0.55)'; g.beginPath(); g.arc(W * 0.3, G, 54, Math.PI, 0); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#7D8096'; [[60, 12], [150, 8], [330, 10]].forEach(c => { g.beginPath(); g.ellipse(c[0], G + 26, c[1], c[1] * 0.35, 0, 0, 7); g.fill(); }); }
}
function pkBackground(g, sc){
  const T = PK.THEMES[sc.theme], R = PK.rng(sc.seed ^ 0x5bd1e995);
  const gr = g.createLinearGradient(0, 0, 0, PK.GROUND); gr.addColorStop(0, T.top); gr.addColorStop(1, T.bot); g.fillStyle = gr; g.fillRect(0, 0, PK.W, PK.H);
  if(sc.theme === 'space' || sc.theme === 'disco'){ for(let i = 0; i < 26; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.3 + R() * 0.5) + ')'; g.beginPath(); g.arc(R() * PK.W, R() * PK.GROUND * 0.9, 0.6 + R() * 1.4, 0, 7); g.fill(); } }
  if(sc.theme === 'sea'){ for(let i = 0; i < 12; i++){ g.strokeStyle = 'rgba(255,255,255,0.28)'; g.lineWidth = 1.2; g.beginPath(); g.arc(R() * PK.W, R() * PK.GROUND, 2 + R() * 4, 0, 7); g.stroke(); } }
  if(sc.theme === 'sky'){ g.fillStyle = 'rgba(255,255,255,0.35)'; for(let i = 0; i < 3; i++){ const x = R() * PK.W, y = 20 + R() * 80; g.beginPath(); g.ellipse(x, y, 40 + R() * 30, 9, 0, 0, 7); g.fill(); } }
  if(sc.theme === 'robot'){ g.strokeStyle = 'rgba(160,220,255,0.12)'; g.lineWidth = 1; for(let x = 20; x < PK.W; x += 40){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, PK.GROUND); g.stroke(); } for(let y = 20; y < PK.GROUND; y += 40){ g.beginPath(); g.moveTo(0, y); g.lineTo(PK.W, y); g.stroke(); } }
  if(sc.theme === 'dino'){ g.fillStyle = 'rgba(20,40,10,0.25)'; g.beginPath(); g.moveTo(0, PK.GROUND); for(let x = 0; x <= PK.W; x += 25) g.lineTo(x, PK.GROUND - 30 - Math.sin(x * 0.03 + sc.seed % 7) * 18); g.lineTo(PK.W, PK.GROUND); g.fill(); }
  if(sc.theme === 'garden'){ g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 2; for(let x = 0; x <= PK.W; x += 50){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, PK.GROUND); g.stroke(); } g.beginPath(); g.moveTo(0, 70); g.lineTo(PK.W, 70); g.stroke();
    g.fillStyle = 'rgba(60,140,60,0.35)'; for(let x = 12; x < PK.W; x += 34){ g.beginPath(); g.ellipse(x, PK.GROUND - 4, 16, 10, 0, Math.PI, 0); g.fill(); } }   // 🌱 pk-4c greenhouse glass + plant rows
  if(sc.theme === 'clock'){ const cx = PK.W / 2, cy = 92; g.fillStyle = 'rgba(255,240,200,0.18)'; g.beginPath(); g.arc(cx, cy, 72, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,230,180,0.35)'; g.lineWidth = 3; g.stroke();
    g.lineWidth = 2; for(let i = 0; i < 12; i++){ const a = i * Math.PI / 6; g.beginPath(); g.moveTo(cx + Math.cos(a) * 60, cy + Math.sin(a) * 60); g.lineTo(cx + Math.cos(a) * 68, cy + Math.sin(a) * 68); g.stroke(); }
    g.lineWidth = 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx - 26, cy - 30); g.moveTo(cx, cy); g.lineTo(cx + 44, cy + 8); g.stroke();
    g.fillStyle = 'rgba(255,220,160,0.12)'; [[30, 40, 26], [PK.W - 34, 54, 32]].forEach(c => { g.beginPath(); for(let k = 0; k < 16; k++){ const a = k * Math.PI / 8, r = k % 2 ? c[2] : c[2] * 0.78; g.lineTo(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r); } g.closePath(); g.fill(); }); }   // ⏰ pk-4c clock face + gears
  if(sc.theme === 'bakery'){ g.fillStyle = 'rgba(120,70,40,0.22)'; [64, 128].forEach(y => g.fillRect(0, y, PK.W, 6)); g.fillStyle = 'rgba(255,255,255,0.28)'; [[22, 58], [58, 56], [300, 58], [340, 60], [40, 122], [330, 120]].forEach(([x, y]) => { g.beginPath(); g.roundRect ? g.roundRect(x, y - 22, 20, 22, 4) : g.rect(x, y - 22, 20, 22); g.fill(); });
    g.fillStyle = 'rgba(80,40,20,0.10)'; for(let x = 0; x < PK.W; x += 28) for(let y = PK.GROUND; y < PK.H; y += 14) if(((x / 28) + (y - PK.GROUND) / 14) % 2 < 1) g.fillRect(x, y, 28, 14); }   // 🍰 pk-6b shelves with jars + checked floor
  if(sc.theme === 'volcano'){ g.fillStyle = 'rgba(40,20,20,0.45)'; g.beginPath(); g.moveTo(80, PK.GROUND); g.lineTo(175, 70); g.lineTo(225, 70); g.lineTo(320, PK.GROUND); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,140,40,0.35)'; g.beginPath(); g.ellipse(200, 70, 26, 7, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.12)'; [[205, 46, 14], [214, 26, 18], [226, 8, 22]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); }   // 🌋 pk-6b mountain + glow + smoke
  if(sc.theme === 'farm'){ g.fillStyle = 'rgba(180,60,50,0.28)'; g.beginPath(); g.moveTo(318, PK.GROUND); g.lineTo(318, 160); g.lineTo(349, 132); g.lineTo(380, 160); g.lineTo(380, PK.GROUND); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 3; for(let x = 6; x < 300; x += 26){ g.beginPath(); g.moveTo(x, PK.GROUND); g.lineTo(x, PK.GROUND - 22); g.stroke(); } g.beginPath(); g.moveTo(0, PK.GROUND - 15); g.lineTo(300, PK.GROUND - 15); g.stroke(); }   // 🌼 pk-6b barn + fence
  if(sc.theme === 'concert'){ g.fillStyle = 'rgba(170,20,50,0.40)'; [[0, 1], [PK.W, -1]].forEach(([x0, d]) => { g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + d * 52, 0); g.quadraticCurveTo(x0 + d * 30, 110, x0 + d * 44, PK.GROUND); g.lineTo(x0, PK.GROUND); g.closePath(); g.fill(); });
    g.fillStyle = 'rgba(255,240,200,0.10)'; [[120, 230], [280, 170]].forEach(([x, x2]) => { g.beginPath(); g.moveTo(x, 0); g.lineTo(x2 - 45, PK.GROUND); g.lineTo(x2 + 45, PK.GROUND); g.closePath(); g.fill(); }); g.fillStyle = 'rgba(255,220,150,0.25)'; g.fillRect(0, PK.GROUND, PK.W, 4); }   // 🎻 pk-6c curtains + spotlights + stage edge
  if(sc.theme === 'market'){ g.strokeStyle = 'rgba(255,220,180,0.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 18); g.quadraticCurveTo(PK.W / 2, 58, PK.W, 18); g.stroke();
    for(let i = 1; i < 10; i++){ const x = i * PK.W / 10, t = x / PK.W, y = 18 + 4 * 40 * t * (1 - t) * 0.5 + 8; g.fillStyle = 'rgba(255,110,60,0.55)'; g.beginPath(); g.ellipse(x, y, 6, 8, 0, 0, 7); g.fill(); }
    [[0, 150, 110], [PK.W - 110, 150, 110]].forEach(([x, y, w]) => { for(let k = 0; k < w; k += 18){ g.fillStyle = (k / 18) % 2 ? 'rgba(255,255,255,0.14)' : 'rgba(230,60,70,0.22)'; g.fillRect(x + k, y, 18, 12); } }); }   // 🏮 pk-6c lantern string + stall awnings
  if(sc.theme === 'ice'){ g.fillStyle = 'rgba(255,255,255,0.45)'; [[60, 120, 34], [130, 80, 40], [270, 90, 38], [340, 130, 30]].forEach(([x, top, w]) => { g.beginPath(); g.moveTo(x - w / 2, PK.GROUND); g.lineTo(x - w / 2, top); g.lineTo(x, top - 30); g.lineTo(x + w / 2, top); g.lineTo(x + w / 2, PK.GROUND); g.closePath(); g.fill(); });
    g.fillStyle = 'rgba(120,180,230,0.25)'; g.fillRect(0, PK.GROUND, PK.W, 3); }   // ❄️ pk-6c ice towers
  if(T.mark){ if(sc.theme === 'trip_aurora' || sc.theme === 'trip_moon'){ for(let i = 0; i < 22; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.3 + R() * 0.5) + ')'; g.beginPath(); g.arc(R() * PK.W, R() * PK.GROUND * 0.6, 0.6 + R() * 1.3, 0, 7); g.fill(); } } if(sc.zoom){ g.save(); g.translate(PK.W / 2, PK.GROUND); g.scale(sc.zoom, sc.zoom); g.translate(-PK.W / 2, -PK.GROUND); pkTrip(g, sc, R); g.restore(); } else pkTrip(g, sc, R); }   // 🔍 pk-6d close-up: the landmark zoomed in
  else { g.fillStyle = T.hill; g.beginPath(); g.ellipse(PK.W * 0.25, PK.GROUND + 8, PK.W * 0.42, 26, 0, 0, 7); g.ellipse(PK.W * 0.8, PK.GROUND + 12, PK.W * 0.36, 22, 0, 0, 7); g.fill(); }
  g.fillStyle = T.ground; g.fillRect(0, PK.GROUND + 4, PK.W, PK.H - PK.GROUND);
  if(typeof emo === 'function') sc.deco.forEach(d => emo(g, d.ch, d.x, d.y, d.sz, 0.55));
}
function pkItem(g, it){
  if(it.k === 'guest'){ if(window.PKGUEST) PKGUEST.flat(g, it); return; }   // 📌 pk-7c: a guest from another game
  const K = PK.KINDS[it.k] || {s: 1}, r = it.r * K.s, P = PK_PAINT[it.k] || PK_PAINT.circle, sx = it.sx || 1;
  g.save(); g.translate(it.x, it.y);
  if(it.k !== 'pt'){ g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(0, r * 0.92, r * 0.66 * sx, r * 0.14, 0, 0, 7); g.fill(); }   // ✨ particles float: no shadow
  g.rotate((it.rot || 0) * Math.PI / 180); g.scale((it.fl || 1) * sx, 1);
  if(it.ln || it.dt || it.lk) pkDetailed(g, it, r, P); else P(g, r, it.c, it.n, it);
  g.restore();
}
// ✏️🔘 pk-5a: stripes + little dots painted ON the piece only (clipped to its own shape on a small canvas)
let PK_OFF = null;
function pkInk(c){ const x = PK.KINDS ? parseInt(c.slice(1), 16) : 0, lum = (((x >> 16) & 255) * 0.3 + ((x >> 8) & 255) * 0.59 + (x & 255) * 0.11) / 255; return lum > 0.5 ? '#26203F' : '#FFFFFF'; }
function pkDetailed(g, it, r, P){
  const m = g.getTransform(), s = Math.max(1, Math.hypot(m.a, m.b)), S = Math.ceil(r * 2.8 * s) + 4;
  if(!PK_OFF) PK_OFF = document.createElement('canvas');
  const oc = PK_OFF; if(oc.width < S || oc.height < S){ oc.width = Math.max(oc.width, S); oc.height = Math.max(oc.height, S); }
  const o = oc.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, oc.width, oc.height); o.setTransform(s, 0, 0, s, S / 2, S / 2);   // wipe ALL of it: smoothing reads a pixel past the copied square
  P(o, r, it.c, it.n, it);
  o.globalCompositeOperation = 'source-atop'; const ink = pkInk(it.c);
  // 🎨 pk-5b looks (on the piece only): 1 two-tone (lower half darker) · 2 checks
  if(it.lk === 1){ o.fillStyle = pkTone(it.c, 0.78); o.fillRect(-r * 2, r * 0.05, r * 4, r * 2); }
  if(it.lk === 2){ o.fillStyle = 'rgba(255,255,255,0.3)'; const q = r * 0.34; for(let yy = -3; yy < 3; yy++) for(let xx = -3; xx < 3; xx++) if((xx + yy) & 1) o.fillRect(xx * q, yy * q, q, q); }
  if(it.ln){ o.save(); o.rotate((it.la || 0) * Math.PI / 180); o.strokeStyle = ink; o.lineWidth = Math.max(2.7, r * 0.12); o.lineCap = 'round';
    for(let i = 0; i < it.ln; i++){ const y = (i - (it.ln - 1) / 2) * r * 0.34; o.beginPath(); o.moveTo(-r * 0.95, y); o.lineTo(r * 0.95, y); o.stroke(); } o.restore(); }
  o.globalCompositeOperation = 'source-over';
  // 🙂 pk-5b look 3: a cute face
  if(it.lk === 3){ [-1, 1].forEach(sd => { o.fillStyle = '#FFFFFF'; o.beginPath(); o.arc(sd * r * 0.22, -r * 0.1, r * 0.14, 0, 7); o.fill(); o.fillStyle = '#1d1530'; o.beginPath(); o.arc(sd * r * 0.22 + r * 0.03, -r * 0.08, r * 0.07, 0, 7); o.fill(); });
    o.beginPath(); o.arc(0, r * 0.1, r * 0.18, 0.25, Math.PI - 0.25); o.lineWidth = Math.max(1.6, r * 0.06); o.strokeStyle = '#1d1530'; o.lineCap = 'round'; o.stroke(); }
  // 🔘 dots: whole little stickers near the middle (not clipped — a thin piece would cut them away)
  if(it.dt){ o.fillStyle = ink; o.strokeStyle = ink === '#FFFFFF' ? 'rgba(38,32,63,0.55)' : 'rgba(255,255,255,0.7)'; o.lineWidth = 1; const at = [[0.2, -0.16], [-0.2, 0.1], [0.06, 0.24]], dr = Math.max(5, r * 0.19);
    for(let i = 0; i < it.dt; i++){ o.beginPath(); o.arc(at[i][0] * r, at[i][1] * r, dr, 0, 7); o.fill(); o.stroke(); } }
  g.save(); g.scale(1 / s, 1 / s); g.drawImage(oc, 0, 0, S, S, -S / 2, -S / 2, S, S); g.restore();
}
// paint picture 'A' or 'B' of a scene; k = CSS pixels per world unit, dpr = device pixels per CSS pixel
function pkPaint(cv, sc, side, k, dpr){
  if(sc && sc.iso && window.PKISO){ if(sc.loop) pkClock(); return PKISO.paint(cv, sc, side, k, dpr, pkFrameOf(sc)); }   // 🧱 pk-7b · 🎬 pk-7m1: the frame the clock is on
  const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
  g.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
  pkBackground(g, sc);
  (side === 'B' ? sc.B : sc.A).slice().sort((a, b) => (a.z || 0) - (b.z || 0) || a.y - b.y || (a.id < b.id ? -1 : 1)).forEach(it => pkItem(g, it));   // 🥞 pk-5c layers: scenery (−2) · behind (−1) · pieces · in front (1) · particles (2)
  g.setTransform(1, 0, 0, 1, 0, 0);
}
// 🎯 one Odd One Out card: a picture card (one piece in a 100 × 100 card) or a text card (sum / word)
function pkCard(cv, card, px, dpr){
  const g = cv.getContext('2d'); cv.width = cv.height = Math.round(px * dpr); g.setTransform(px * dpr / 100, 0, 0, px * dpr / 100, 0, 0); g.clearRect(0, 0, 100, 100);
  if(card.txt != null){ g.fillStyle = '#26203F'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 30; g.font = '700 ' + fs + 'px Fredoka, Nunito, sans-serif';
    const w = g.measureText(card.txt).width; if(w > 86){ fs *= 86 / w; g.font = '700 ' + fs + 'px Fredoka, Nunito, sans-serif'; } g.fillText(card.txt, 50, 52); g.setTransform(1, 0, 0, 1, 0, 0); return; }
  pkItem(g, Object.assign({x: 50, y: 48, rot: 0, fl: 1}, card)); g.setTransform(1, 0, 0, 1, 0, 0);
}
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const GAME_ID = 'pokadif';
const ARC_ID = 'pokadif-arcade';   // ⏱️ Photo Hunt Arcade has its own board (pk-2b): best per difficulty
// UiKit lists (loader + ❓ card) are registered here, so UiKit itself is not touched (polish lane) — move them into UiKit when that lane is free
if(UI.KINDS && !UI.KINDS.pokadif) UI.KINDS.pokadif = ['🔍', 'Opening the detective file', 'peek'];
if(UI.GAME_HELP && !UI.GAME_HELP.pokadif) UI.GAME_HELP.pokadif = ['Be a little detective! 🖼️ Spot: two pictures, poke every change · 👁️ Blink: one picture flips — what changed? · 🎯 Odd One Out: poke the one that doesn\'t belong · ⏱️ Arcade: race the clock.',
  'Tap (or click) what is different. 🌱 Basic: colours + missing things. More levels add 📏 size, 🔺 shape, 🔄 turn / flip, 🔢 count, then 🧮 sums, 🔤 words and 🌀 patterns.',
  'Stuck? Tap 🔍 — the magnifier shows you one. Fewer oops = more ⭐. Every picture is brand new!'];
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🔍', name: 'Pokadif', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => stopTicker(),
  pause: {pause: () => setPaused(true), resume: () => setPaused(false)}, pauseButton: true,
  onFit: () => { if(G) layout(); }});
var NAV_INNER = {};
UI.navBar(document.getElementById('back-btn'), {onclick: false});
const $ = id => document.getElementById(id);
let FX = 1;   // the harness sets 0 (no waits, no confetti)
const pkWait = ms => new Promise(r => setTimeout(r, FX ? ms : 0));
function pkPick(a){ return a[Math.floor(Math.random() * a.length)]; }
function isTouch(){ return (navigator.maxTouchPoints || 0) > 0 || ('ontouchstart' in window && matchMedia('(pointer:coarse)').matches); }

/* ================= DATA ================= */
const LEVEL_UI = [
  {emoji: '🌱', blurb: 'Colours + missing things. It glows if you get stuck.'},
  {emoji: '🐣', blurb: 'Adds 📏 bigger / smaller and 🔺 new shapes.'},
  {emoji: '🔦', blurb: 'Adds 🔄 turned / flipped and 🔢 counting.'},
  {emoji: '⚡', blurb: 'All six kinds of change, mixed.'},
  {emoji: '🌋', blurb: 'Smaller changes, more things to check.'},
  {emoji: '💀', blurb: 'Tiny changes + look-alikes, no magnifier, 3 oops = case lost. ×3 points.', hardcore: true}
];
const ARC_BLURB = ['Oops cost nothing · 3 magnifiers', '+ 📏 size + 🔺 shape', '+ 🔄 turn + 🔢 count', 'Oops = ⏱ + 3 s · + 🧮 sums + 🔤 words', 'Each find = ⏳ + 3 s time left · oops = ⏱ + 4 s · + 🌀', 'Each find = ⏳ + 3 s time left · oops = ⏱ + 5 s · no 🔍 · ×3'];   // pk-3d: a speed run
const ODD_BLURB = ['🎨 colours + 🔺 shapes, 4 big cards', '+ 📏 bigger / smaller', '+ 🔄 turned + 🔢 counting', '+ 🧮 odd sums + 🔤 odd words', '+ 🌀 patterns, 12 cards', 'Tiny changes, 3 oops = case lost. ×3 points.'];
const BLINK_BLURB = ['The picture flips A ↔ B — changes pop out', 'A tiny blink between the pictures', 'A longer blink — harder!', 'Long blink, + sums + words', '+ patterns, quick flips', 'Quick flips, long blinks, 3 oops. ×3 points.'];
const BLINK = [{show: 1300, gap: 0}, {show: 1200, gap: 80}, {show: 1100, gap: 140}, {show: 1000, gap: 180}, {show: 900, gap: 220}, {show: 750, gap: 260}];   // ms each picture shows · the blank blink between (longer = harder to see the change)
const BADGES = [['🔍', 'Rookie Eye'], ['🔎', 'Sharp Spotter'], ['🧐', 'Clue Finder'], ['🎖️', 'Keen Inspector'], ['🌟', 'Super Sleuth'], ['👑', 'Master Detective']];   // = Code.gs LEVEL_GAMES.pokadif.badges
const AGE_START = {'4-5': 0, '6-7': 0, '8-9': 1, '10+': 2};
/* 🗂️ MODE GROUPS (mg-1) — fixed order; R1 plays 🖼️ Find the Difference, the others come in R2–R4 (shown as 🔜) */
const MODE_GROUPS = [{k: 'spot', icon: '🖼️', en: 'Spot', th: 'จับผิดภาพ', c: '#4B3FD1'}, {k: 'odd', icon: '🎯', en: 'Odd One Out', th: 'หาตัวที่ต่าง', c: '#22B573'},
  {k: 'endless', icon: '⏱️', en: 'Arcade', th: 'อาร์เคด', c: '#FF8A3D'}, {k: 'stories', icon: '📖', en: 'Stories', th: 'นักสืบผจญภัย', c: '#8E5BE8'}, {k: 'friends', icon: '👥', en: 'With friends', th: 'แข่งกับเพื่อน', c: '#E0457B'}];
const MODES = [
  {k: 'spot', g: 'spot', icon: '🖼️', name: 'Find the Difference', type: 'A spot-the-difference game', sub: 'Two pictures — poke every change', next: '👇 then pick a level'},
  {k: 'blink', g: 'spot', icon: '👁️', name: 'Blink', type: 'A flicker-and-find game', sub: 'One picture blinks — what changed?', next: '👇 then pick a level'},
  {k: 'odd', g: 'odd', icon: '🎯', name: 'Odd One Out', type: 'A find-the-odd-one game', sub: 'Poke the one that doesn\'t belong', next: '👇 then pick a level'},
  {k: 'arcade', g: 'endless', icon: '⏱️', name: 'Photo Hunt Arcade', type: 'A race-the-clock game', sub: 'A speed run: race to the 🏁 — beat your best time!', next: '👇 then pick a level'},
  {k: 'detective', g: 'stories', icon: '🕵️', name: 'Detective Adventure', type: 'A detective story game', sub: 'Solve a case: find · read · walk · crack', next: '👇 then pick a case + level'},
  {k: 'race', g: 'friends', icon: '👥', name: 'Race', type: 'A 2-player race', sub: 'One screen, two detectives — first poke wins!', next: '👇 then pick a level'}
];
window.MODE_TYPE = {spot: MODES[0].type, blink: MODES[1].type, odd: MODES[2].type, arcade: MODES[3].type, detective: MODES[4].type};
const MODE_NAME = {spot: '🖼️ Spot', blink: '👁️ Blink', odd: '🎯 Odd One Out', arcade: '⏱️ Arcade', detective: '📖'};   // = the Theme start (Code.gs MODES_ tried.themeStart)
/* 🗂️ END MODE GROUPS */
const HOUSES = [{k: 'mix', icon: '🎲', name: 'Mix'}, {k: 'iso', icon: '🧱', name: '2.5D World'}].concat(PK.THEME_KEYS.map(k => ({k, icon: PK.THEMES[k].icon, name: PK.THEMES[k].name}))).concat([{k: 'trip', icon: '📸', name: 'Family trip'}]);   // 📸 pk-4a
// 📸 Family Photo Hunt (pk-4a): your family's own avatars pose at a trip place. Family = you first, then the others (max 4); a small family gets 🧑 friends.
function familyList(){ const names = [S.player].concat((S.players || []).map(p => p.Name).filter(n => n && n !== S.player)).slice(0, 4);
  while(names.length < 2) names.push('Friend ' + names.length);
  return names.map(n => ({name: n, av: myAvatar(n)})); }
function photoActs(){ return Object.keys(PK.PHOTO_ACTS).filter(a => !window.Acting || Acting.has('acts', a)); }
/* 📌 pk-7c (plan §22c): guests from other games (part Pokadif_guests). A flat picture (🎲 Mix · the house scenes) is made with ONE change less and the
   guest brings the last one — proven fair on the whole 1× picture pair before it is used; no kit in yet / no room → the normal picture, no wait.
   🧱 islands get their guests inside Pokadif_iso (the island engine measures them). 📸 Family trip + 📖 cases + 🎯 Odd One Out: no guests. */
function makePicture(theme, opt){
  const gp = window.PKGUEST && G && theme !== 'trip' && theme !== 'iso' ? PKGUEST.plan(G.level) : null;
  if(!gp) return makePicture0(theme, opt);
  const n = Math.max(1, ((opt && opt.n) || G.L.n) - 1);
  for(let t = 0; t < 2; t++){ const sc = makePicture0(theme, Object.assign({}, opt || {}, {n})); if(sc && sc.iso) return sc; if(sc && PKGUEST.dress(sc, G.level, gp)) return sc; }   // 2 tries, then a picture without guests
  return makePicture0(theme, opt); }
function makePicture0(theme, opt){   // a Spot / Blink / Arcade picture: a normal scene, or a 📸 family photo when the 📸 Family trip scene is picked
  const iz = pkIsoPick(theme); if(iz) return iz; if(theme === 'iso') theme = 'mix';   // 🧱 pk-7b: a ready 2.5D diorama (else a 🎲 Mix picture)
  if(theme === 'mix'){   // 🎲 pk-5c Mix = 5 random layers (scenery · people · props · particles · others) — a new combo every picture
    window.PK_FAMILY = familyList();
    const sc = PK.makeMix(PK.newSeed(), G.level, Object.assign({people: window.PK_FAMILY.length, acts: photoActs(), avoid: G.recentKinds || [], avoidLay: G.lastLay, avoidTheme: G.lastTheme}, opt || {}));
    if(sc){ const ks = Array.from(new Set(sc.A.filter(a => PK.PIECES.indexOf(a.k) >= 0).map(a => a.k))); G.recentKinds = ks.concat((G.lastKinds || [])); G.lastKinds = ks; G.lastLay = sc.layout; }
    return sc; }
  if(theme !== 'trip'){   // 🧩 pk-5b no-repeat: skip the kinds of the last 2 pictures + use another layout than the last one
    window.PK_FAMILY = familyList();   // 🧑 pk-6d: the family stands small in ~6 of 10 house pictures (and may carry a change)
    const sc = PK.makeScene(PK.newSeed(), G.level, theme, Object.assign({avoid: G.recentKinds || [], avoidLay: G.lastLay, people: window.PK_FAMILY.length, acts: photoActs()}, opt || {}));
    if(sc){ const ks = Array.from(new Set(sc.A.map(a => a.k))); G.recentKinds = ks.concat((G.lastKinds || [])); G.lastKinds = ks; G.lastLay = sc.layout; }
    return sc; }
  window.PK_FAMILY = familyList(); const place = pkPick(PK.TRIP_KEYS.filter(k => k !== G.lastPlace)); G.lastPlace = place;
  return PK.makePhoto(PK.newSeed(), G.level, place, Object.assign({people: window.PK_FAMILY.length, acts: photoActs()}, opt || {}));
}
const FOUND_SAY = {tone: '🌗 A different shade!', 'line+': '✏️ A new line!', 'line-': '✏️ A line is gone!', 'dot+': '🔘 A new little dot!', 'dot-': '🔘 A little dot is gone!', tilt: '↪️ It tilted!', wider: '↔️ It got wider!', thinner: '↔️ It got thinner!', pose: '🕺 A new pose!', face: '😉 A new face!', foot: '👣 A thief footprint!', colour: '🎨 A new colour!', missing: '➖ Something is missing!', extra: '➕ Something extra!', bigger: '📏 It got bigger!', smaller: '📏 It got smaller!',
  shape: '🔺 A different shape!', flip: '🔄 It flipped!', turn: '🔄 It turned!', more: '🔢 There are more!', fewer: '🔢 There are fewer!'};
const PRAISE = ['Great eyes!', 'Super sleuth!', 'You got it!', 'Sharp!', 'Nice poke!', 'Detective skills!'];

/* ================= STATE ================= */
let S = {players: [], progress: {}, progressArc: {}, progressCase: {}, settings: {}, avatars: {}, player: '', age: ''};
let SET = {mode: 'spot', level: 0, house: 'mix', caseId: 'magnet'};
let G = null, lockHandle = null, TICK = 0;
const GC_LISTEN = [], GC_LOG = [];
function store(k){ return 'sp_pokadif_' + k + ':' + (S.player || ''); }
function ls(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }
function loadPrefs(){ try{ const p = JSON.parse(ls(store('prefs')) || '{}'); if(HOUSES.some(h => h.k === p.house)) SET.house = p.house; if(PK.CASES.some(c => c.id === p.caseId)) SET.caseId = p.caseId; }catch(e){} }
function savePrefs(){ ls(store('prefs'), JSON.stringify({house: SET.house, caseId: SET.caseId})); }
function myAvatar(name){ const a = S.avatars[name]; return a ? fixAv(a) : defaultAvatar(name || 'player'); }

/* ================= 💥 COMICS + 📣 CROWD HOOKS (for the 💥 Comics chat and the 📣 Cheer chat — the game draws no comics itself) =================
   GameComic.listen(fn) → fn('pokadif', event, info) for every moment: start · picture · found · oops · hint · glow · picdone · win · lose
   .log() = this case's moments · .hold(true|false) pauses the clock quietly · .area() = #board · .mode() = 'pokadif' | null
   Slots: #comics-slot-menu (start page) · #comic-strip-slot (result card). */
window.GameComic = {
  listen(fn){ GC_LISTEN.push(fn); return () => { const i = GC_LISTEN.indexOf(fn); if(i >= 0) GC_LISTEN.splice(i, 1); }; },
  log(){ return GC_LOG.slice(); },
  hold(on){ if(G) G.held = !!on; },
  area(){ return $('board'); },
  mode(){ return G && !G.over ? GAME_ID : null; },
  state(){ return G; }
};
function moment(k, info){ const e = Object.assign({k, t: G ? Math.round(G.secs * 10) / 10 : 0}, info || {}); GC_LOG.push(e); if(GC_LOG.length > 300) GC_LOG.shift(); GC_LISTEN.forEach(f => { try{ f(GAME_ID, e, G); }catch(err){} }); }

/* ================= MENUS ================= */
function showScreen(name){
  ['player', 'menu', 'play'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
  $('back-btn').classList.toggle('hidden', name === 'play'); UI.navScreen($('back-btn'), name, NAV_INNER); window.scrollTo(0, 0);
}
function progressOf(name, board){ const b = board || boardId(), P = b === ARC_ID ? S.progressArc : b === CASE_ID ? S.progressCase : S.progress; return P[name] || {unlocked: 0, tokens: [], best: []}; }
function boardId(mode){ const m = mode || SET.mode; return m === 'arcade' ? ARC_ID : m === 'detective' ? CASE_ID : GAME_ID; }
function canPlay(i){ const p = progressOf(S.player); if(i === 5) return p.unlocked >= 5; if(i === 4) return p.unlocked >= 4; return i <= Math.max(p.unlocked, AGE_START[S.age] || 0); }
function renderPlayers(){
  const box = $('player-list'); box.innerHTML = '';
  if(!S.players.length){ box.innerHTML = '<div class="empty">No players yet — add one on the Dashboard first.</div>'; return; }
  S.players.forEach(p => { const b = document.createElement('button'); b.className = 'pick'; b.setAttribute('data-sound', 'pop');
    const c = document.createElement('canvas'); c.width = 144; c.height = 168; b.appendChild(c);
    b.insertAdjacentHTML('beforeend', '<div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age ? p.Age + ' yrs' : '') + '</div>');
    drawPreviewCanvas(c, myAvatar(p.Name), {name: p.Name, t: 1});
    b.onclick = () => choosePlayer(p.Name); box.appendChild(b); });
}
function choosePlayer(name){
  UI.rememberTheme(name, UI.applyTheme(UI.themeFor(S.settings, name), {kitOnly: true}));
  const p = S.players.find(x => x.Name === name); S.player = name; S.age = p ? p.Age : '';
  loadPrefs(); $('who-name').textContent = name;
  const ml = UI.modeLink ? UI.modeLink(MODE_LINK) : '';
  if(ml && MODES.some(m => m.k === ml && !m.soon)) SET.mode = ml;
  renderMenu(); showScreen('menu'); msAlso(); pkPrefetch(SET.mode);   /* 📏 pk-7a: the linked / current mode's part starts loading */
  if(ml && MODES.some(m => m.k === ml && !m.soon)){ const m = MODES.find(x => x.k === ml); UI.toast(m.icon + ' ' + m.name + ' — now pick a level'); if(UI.modePoint) UI.modePoint($('level-list')); }
}
/* ✨ MODE SPOTLIGHT (built in, pk-1): ?mode=<id> opens that mode ONCE (UI.modeLink, in choosePlayer) · ✨ Also try banner under the
   title · UI.modeTried when a case starts (startCase). MODES_ rows in Code.gs: pokadif spot · blink · odd (pk-2a), arcade (pk-2b). */
function msNow(){ return SET.mode; }
function msOpen(id){ if(!MODES.some(m => m.k === id && !m.soon)) return; SET.mode = id; markModes(); pkPrefetch(id); /* 📏 pk-7a */ if(UI.modePoint) UI.modePoint($('level-list')); }
function msAlso(){ if(UI.alsoTry) UI.alsoTry({player: S.player, game: GAME_ID, at: () => document.querySelector('#scr-menu .title'), current: msNow, noDrop: true, open: msOpen}); }
function changePlayer(){ renderPlayers(); showScreen('player'); }
function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">' + (SET.mode === 'arcade' ? 'No run yet' : 'No case solved yet') + '</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span>' + (SET.mode === 'arcade' && b.timeSec ? '<span>⏱ ' + PK.mmss(b.timeSec) + '</span>' : '') + '<span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }
function renderMenu(){
  const ml = $('mode-list');
  if(!ml.children.length) UI.modeGroups(ml, MODE_GROUPS, MODES.map(m => Object.assign({}, m)), {next: () => $('level-head'), moreText: '👇 Pick a level below',
    onPick: k => { const m = MODES.find(x => x.k === k); if(m && m.soon){ UISound.play('error'); UI.toast('🔜 ' + m.icon + ' ' + m.name + ' comes in Pokadif ' + m.type.toLowerCase() + '!'); return 'stop'; }
      SET.mode = k; markModes(); pkPrefetch(k); /* 📏 pk-7a */ return false; }});
  markModes(); renderHouses(); renderLevels(); renderFile();
  if(window.UI && UI.leaders) UI.leaders($('leaders'), boardId(), S.player);
}
function markModes(){ $('mode-list').querySelectorAll('.ui-mbtn').forEach(b => { const m = MODES.find(x => x.k === b.dataset.k); b.classList.toggle('on', b.dataset.k === SET.mode); b.classList.toggle('soon', !!(m && m.soon)); });
  const m = MODES.find(x => x.k === SET.mode) || MODES[0]; $('level-head').textContent = SET.mode === 'detective' ? 'Pick a case 👆 + a level 👇 — ' + m.icon + ' ' + m.name : 'Pick a level — ' + m.icon + ' ' + m.name; renderHouses(); renderLevels();
  if(window.UI && UI.leaders && $('leaders').dataset.board !== boardId()){ $('leaders').dataset.board = boardId(); UI.leaders($('leaders'), boardId(), S.player); } }
function renderHouses(){
  if(SET.mode === 'detective') return renderCases();
  const box = $('house-list');
  box.innerHTML = HOUSES.map(h => '<button class="house' + (h.k === SET.house ? ' on' : '') + '" data-k="' + h.k + '" data-sound="tap" title="' + UI.esc(h.name) + '">' + h.icon + ' ' + UI.esc(h.name) + '</button>').join('');
  box.querySelectorAll('.house').forEach(b => b.onclick = () => { SET.house = b.dataset.k; savePrefs(); if(SET.house === 'iso') pkIsoPrefetch(); box.querySelectorAll('.house').forEach(x => x.classList.toggle('on', x === b)); });
}
function renderLevels(){
  const box = $('level-list'); box.innerHTML = ''; const p = progressOf(S.player), rec = AGE_START[S.age];
  PK.LEVELS.forEach((L, i) => {
    const U = LEVEL_UI[i], open = canPlay(i), done = p.unlocked > i, b = document.createElement('button');
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (U.hardcore ? ' hardcore' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none'); b.dataset.lv = i;
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">' + BADGES[i][0] + '</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + U.emoji + '</div><div class="nm">' + L.name + '</div><div class="learn">' + (SET.mode === 'detective' ? '📖 3 chapters · 🔍📜🚶🖼️🔐👉' : SET.mode === 'arcade' ? '🏁 ' + PK.ARCADE[i].goal + ' pictures · ⭐⭐⭐ under ' + PK.mmss(PK.ARCADE[i].par) : SET.mode === 'odd' ? PK.ODD[i].cards + ' cards · ' + PK.ODD_ROUNDS + ' rounds' : L.n + ' changes · ' + L.pics + ' pictures') + '</div><div class="sub">' + (U.hardcore && !open ? '🔒 Beat Extreme to open 💀 Hardcore' : SET.mode === 'detective' ? STORY_BLURB[i] : SET.mode === 'arcade' ? ARC_BLURB[i] : SET.mode === 'odd' ? ODD_BLURB[i] : SET.mode === 'blink' ? BLINK_BLURB[i] : U.blurb) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore' : i === 4 ? 'Solve a Hard case to unlock Extreme!' : 'Solve the level before to unlock it'); return; } startCase(i); };
    box.appendChild(b);
  });
}
function renderFile(){
  const p = progressOf(S.player, GAME_ID), n = p.unlocked || 0, r = PK.rankOf(n), nx = PK.nextRank(n);
  $('det-file').innerHTML = '<div class="rank">' + r.icon + ' Detective rank: <b>' + r.name + '</b></div>'
    + '<div class="next">' + (nx ? 'Next: ' + nx.icon + ' ' + nx.name + ' — solve ' + PK.LEVELS[nx.at - 1].name + (nx.at === 6 ? ' 💀' : '') : '🏆 The top rank — the whole family calls you!') + '</div>'
    + '<div class="badges">' + BADGES.map((b, i) => '<div class="bdg' + (n > i ? ' on' : '') + '" title="' + UI.esc(b[1]) + '"><span class="i">' + b[0] + '</span>' + UI.esc(b[1]) + '</div>').join('') + '</div>';
}

/* ================= 📏 PARTS — Pokadif's 📖 Detective Adventure + 👥 Race load when they are played (🔍 Pokadif chat pk-7a, rule 📏 Born split) =================
   📖 Detective Adventure (story steps · walk · crack · accuse · finishStory) → Pokadif_cases · 👥 Race → Pokadif_race (built by Test Harness/parts/
   build_parts.py from parts/Pokadif/<part>.js — edit those). The case shelf, CASE_SHELF, caseSeen, CARD_RES and RC stay HERE (setup page / other code
   reads them). A level card opens a case only after its part is in (GameParts.need, with the 'pokadif' loader); picking the mode starts the download
   early. 📲 offline app + tests: every part is inline (Code.gs INCLUDE_ALSO_ PokadifParts) → it is there at once. New big pieces are born here too. */
function PK_PART_OF(k){ return k === 'detective' ? 'Pokadif_cases' : k === 'race' ? 'Pokadif_race' : null; }
function pkPartReady(k){ const f = PK_PART_OF(k); return !f || (typeof GameParts !== 'undefined' && GameParts.has(f)); }
/* 🎆 pk-7f: the FX part (every mode uses it) starts loading with the menu */
function pkFxLoad(){ if(typeof GameParts !== 'undefined' && !GameParts.has('Pokadif_fx')) GameParts.need('Pokadif_fx'); }
/* 📌 pk-7c: the guests part (+ the first guest kit) loads with the menu, like 🎆 FX — every picture mode can meet a guest */
function pkGuestLoad(){ if(typeof GameParts === 'undefined') return; const go = () => { if(window.PKGUEST) PKGUEST.prefetch(SET.level || 0); }; if(GameParts.has('Pokadif_guests')) go(); else GameParts.need('Pokadif_guests', ok => { if(ok) go(); }); }
function pkPrefetch(k){ pkFxLoad(); pkGuestLoad(); if(SET.house === 'iso' && PK_ISO_MODES.indexOf(k) >= 0) pkIsoPrefetch(); const f = PK_PART_OF(k); if(f && typeof GameParts !== 'undefined' && !GameParts.has(f)) GameParts.need(f, ok => { if(ok) pkMoodWrap(); }); }
function pkMoodWrap(){   // same wraps as the 🎵 MOOD block (its __gmood flags → never twice), for functions that arrived in a part after it ran
  if(typeof GMOOD === 'undefined' || !GMOOD) return;
  const w = (n, fn, after) => { const f = window[n], flag = after ? '__gmoodA' : '__gmood'; if(typeof f !== 'function' || f[flag]) return;
    const g = after ? function(){ const r = f.apply(this, arguments); try{ fn.apply(this, arguments); }catch(e){} return r; }
                    : function(){ try{ fn.apply(this, arguments); }catch(e){} return f.apply(this, arguments); };
    g[flag] = 1; window[n] = g; };
  w('raceGo', GMOOD.start, true); w('finishStory', GMOOD.stop); w('raceEnd', GMOOD.stop); }
function pkNeed(k, go){ const f = PK_PART_OF(k); if(!f) return go();
  if(typeof GameParts === 'undefined') return setTimeout(() => pkNeed(k, go), 40);   // the loader comes right after this script
  if(GameParts.has(f)) return go();
  const m = MODES.find(x => x.k === k) || {}; UI.loading('pokadif', (m.icon || '🔍') + ' Getting ' + (m.name || 'Pokadif') + '…');
  GameParts.need(f, ok => { UI.loaded(); if(ok){ pkMoodWrap(); return go(); } UISound.play('error'); UI.toast('📡 This way to play did not load — check the internet, then pick a level again', 'err'); }); }
/* 🧱 pk-7b: 2.5D dioramas = the part Pokadif_iso (born split, plan §26). 🎲 Mix: ≈ 1 picture in 4 (never two in a row) — the NEXT picture's
   kind is rolled while this one plays, so its island is baked in the background; not ready in time → a flat picture, no wait. 🧱 2.5D World:
   every picture; the next one is baked while you play, a picture that isn't ready yet holds the clock + shows the building card.
   Kits (IsoKit · IsoProps · IsoLook_*) come only when a 🧱 picture is on its way (online: GameParts sources; offline + tests: inline). */
const PK_ISO_PART = 'Pokadif_iso', PK_ISO_MODES = ['spot', 'blink', 'arcade', 'race'];
function pkIsoMode(){ return PK_ISO_MODES.indexOf(G && G.mode ? G.mode : SET.mode) >= 0; }
function pkIsoN(){ return G && G.A ? G.A.n : 0; }
function pkIsoLoad(){ if(window.PKISO) return Promise.resolve(true); if(typeof GameParts === 'undefined') return Promise.resolve(false); return GameParts.need(PK_ISO_PART).then(ok => !!(ok && window.PKISO)); }
function pkIsoPrefetch(){ pkIsoLoad().then(ok => { if(ok) PKISO.kits(); }); }
function pkIsoAhead(){ if(!G) return; const G0 = G, lv = G.level, n = pkIsoN(); pkIsoLoad().then(ok => { if(ok && G === G0 && !G.over) PKISO.want(lv, n); }); }
function pkIsoPick(theme){
  if(!G || !pkIsoMode() || G.mode === 'detective' || (theme !== 'mix' && theme !== 'iso')) return null;
  const n = pkIsoN(); let sc = null;
  if(theme === 'iso'){ sc = window.PKISO ? PKISO.take(G.level, n) : null; if(!G.isoFail) pkIsoAhead(); G.isoLast = !!sc; return sc; }
  if(G.isoWant && window.PKISO) sc = PKISO.take(G.level, n);
  if(sc) G.isoWant = false;
  else if(!G.isoWant && !G.isoLast && !G.isoFail && Math.random() < 1 / 3){ G.isoWant = true; pkIsoAhead(); }   // the NEXT picture will be 🧱
  G.isoLast = !!sc; return sc; }
/* 🧱 2.5D World: hold this picture until its island is built (clock stopped, "Building…" card); a part / kit that can't load → 🎲 Mix pictures */
function pkIsoGate(fn){
  if(!G || G.isoHold || SET.house !== 'iso' || !pkIsoMode() || G.isoFail) return false;
  const n = pkIsoN(); if(window.PKISO && PKISO.has(G.level, n)) return false;
  const G0 = G; G.isoHold = true; G.busy = true; pkIsoWaitCard(true);
  pkIsoLoad().then(ok => ok ? PKISO.want(G0.level, n, {still: true}) : null).then(sc => (sc || !window.PKISO || !PKISO.ready()) ? sc : PKISO.want(G0.level, n, {still: true})).then(sc => {   // an island that gave up → one more try · 🎬 pk-7m1: not ready → a quick STILL island (never a wait for a moving one)
    pkIsoWaitCard(false); if(G !== G0 || G.over) return;
    if(!sc && !(window.PKISO && PKISO.ready())){ G.isoFail = true; UISound.play('error'); UI.toast('🧱 The 2.5D world did not load — playing 🎲 Mix pictures instead', 'err'); }
    fn(); if(G === G0) G.isoHold = false; });
  return true; }
function pkIsoWaitCard(on){ let e = $('pkiso-wait'); if(!on){ if(e) e.remove(); return; } if(e) return; const bd = $('board') || document.body;
  e = document.createElement('div'); e.id = 'pkiso-wait'; e.className = 'pkiso-wait'; e.setAttribute('role', 'status');
  e.innerHTML = '<div class="pw-bricks"><i>🟥</i><i>🟨</i><i>🟦</i></div><b>🧱 Building a 2.5D island…</b><span>houses · trees · your family</span>'; bd.appendChild(e); }
/* 🎬 pk-7m1 (plan §29): the FRAME CLOCK — a moving 🧱 island plays ONE loop (24 frames over 3 s, 8 a second) and A and B always paint the SAME
   frame, so whatever moves the same is identical. ⏸ paused · the tab hidden · reduced motion (OS) → the loop stops on frame 0. The 🔍 lens and
   👁️ Blink read the same frame (they draw from cv-a / cv-b); 👥 Race paints both halves from the same clock. Runs only while a moving scene is up. */
const PKCLK = {f: 0, raf: 0, ms: 0, last: 0, sc: null, paints: 0};
function pkCalm(){ try{ return !!(document.hidden || (G && (G.paused || G.held || G.over)) || window.PK_CALM || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)); }catch(e){ return false; } }
function pkFrameOf(sc){ return sc && sc.loop && PKCLK.sc === sc ? PKCLK.f : 0; }
function pkClock(){ if(PKCLK.raf) return; PKCLK.last = performance.now(); PKCLK.raf = requestAnimationFrame(pkTick); }
function pkTick(ts){ PKCLK.raf = 0; const sc = G && G.scene;
  if(!sc || !sc.loop || G.mode === 'odd'){ PKCLK.sc = null; PKCLK.f = 0; return; }
  if(PKCLK.sc !== sc){ PKCLK.sc = sc; PKCLK.ms = 0; PKCLK.f = 0; }
  const dt = Math.max(0, Math.min(250, ts - PKCLK.last)); PKCLK.last = ts; let f = 0;
  if(pkCalm()) PKCLK.ms = 0; else { const L = sc.loop.L * 1000; PKCLK.ms = (PKCLK.ms + dt) % L; f = Math.floor(PKCLK.ms / L * sc.loop.F) % sc.loop.F; }
  PKCLK.raf = requestAnimationFrame(pkTick);   // scheduled first: a paint that throws never stops the clock
  if(f !== PKCLK.f){ PKCLK.f = f; PKCLK.paints++; try{ if(G.mode === 'race'){ if(typeof raceRepaint === 'function') raceRepaint(); } else paintPics(); if(G.lensDraw) G.lensDraw(); }catch(e){ try{ console.warn('🎬 frame', e && e.message); }catch(_){} } } }
/* ================= 📏 END PARTS ================= */
/* ================= PLAY ================= */
/* 💬 24t-c: words during play (UiKit UI.callout) — never over the two pictures, the detective or the goal line */
function calloutSetup(){ if(!(window.UI && UI.callout)) return;
  const R = id => { const e = $(id); if(!e || e.offsetParent === null) return null; const q = e.getBoundingClientRect(); return q.width > 4 && q.height > 4 ? q : null; };
  const pics = () => ['pic-a', 'pic-b'].map(R).filter(Boolean);
  UI.callout.setup({
    me: null,
    at: () => { const q = R('bd-det'); return q ? {x: q.left + q.width / 2, y: q.top - 4} : null; },
    side: () => 0,
    inside: (x, y) => pics().some(q => x >= q.left && x <= q.right && y >= q.top && y <= q.bottom),
    keep: () => pics().concat(['det', 'goal', 'strip'].map(R).filter(Boolean)).map(r => ({l: r.left - 2, t: r.top - 2, r: r.right + 2, b: r.bottom + 2}))
  }); }
function startCase(lvl){
  if(!pkPartReady(SET.mode)) return pkNeed(SET.mode, () => startCase(lvl));   /* 📏 pk-7a: wait for the mode's part file */
  hideResult(); stopTicker(); if(window.PKGUEST) PKGUEST.reset();   // 📌 pk-7c
  stopBlink(); storyReset(); clearMarks(); calloutSetup(); /* 💬 24t-c */
  if(SET.mode === 'detective') return storyStart(lvl);
  if(SET.mode === 'race') return raceStart(lvl);   // 👥 pk-4d
  const mode = MODES.some(m => m.k === SET.mode && !m.soon) ? SET.mode : 'spot', L = PK.LEVELS[lvl], O = PK.ODD[lvl];
  G = {mode, level: lvl, L, O, pic: -1, over: false, paused: false, held: false, secs: 0, last: performance.now(), found: [], marks: [], scene: null, used: {}, lastTheme: '',
    lives: (mode === 'odd' ? O.lives : mode === 'arcade' ? 0 : L.lives) || 0, rounds: mode === 'odd' ? PK.ODD_ROUNDS : mode === 'arcade' ? PK.ARCADE[lvl].goal : L.pics,
    A: mode === 'arcade' ? Object.assign({}, PK.ARCADE[lvl]) : null, timeLeft: mode === 'arcade' ? PK.ARCADE[lvl].limit : 0, run: 0, pen: 0, extra: 0, cps: 0, splits: [], pics: 0, total: {found: 0, oops: 0, hints: 0, perfect: 0, quick: 0, points: 0}, picLog: [], busy: true, k: 1, dpr: Math.min(2, window.devicePixelRatio || 1)};
  $('scr-play').dataset.mode = mode;
  GC_LOG.length = 0;
  if(UI.modeTried) UI.modeTried(S.player, GAME_ID, SET.mode);
  showScreen('play');
  BAR.level(L.name + (L.hardcore ? ' 💀' : ''));
  BAR.count('pic', MODE_ICON[mode] === '⏱️' ? '📸' : MODE_ICON[mode], mode === 'arcade' ? '0/' + G.rounds : '1/' + G.rounds, mode === 'odd' ? 'Round' : mode === 'arcade' ? 'Pictures to the 🏁' : 'Picture');
  BAR.count('found', '🔎', '0/' + L.n, 'Found'); BAR.hide('found', mode === 'odd');
  BAR.miss(0);
  const hasSlot = k => !!document.querySelector('#scr-play .gb-' + k);   // a slot is only made when this case needs it (old ones from another case are hidden)
  if(mode === 'arcade') BAR.time(0); else if(lvl > 0) BAR.time(0); else if(hasSlot('time')) BAR.hide('time', true);
  $('tbar').classList.toggle('hidden', mode !== 'arcade'); if(mode === 'arcade'){ G.hints = G.A.hints; arcBar(); }
  if(G.lives) BAR.lives(G.lives); else if(hasSlot('lives')) BAR.hide('lives', true);
  BAR.fit();
  bdStart(); layout();
  moment('start', {level: lvl, mode});
  startTicker(); if(mode === 'odd') nextOdd(); else nextPicture();
}
function nextPicture(){
  if(!G) return;
  if(pkIsoGate(nextPicture)) return;   // 🧱 pk-7b: 2.5D World — wait for the island being built
  G.pic++; const L = G.L;
  let theme = SET.house;   // 🎲 pk-5c: Mix builds its own 5-layer picture (its scene = sc.theme)
  let sc = null; for(let i = 0; i < 12 && !sc; i++){ sc = makePicture(theme, G.A ? {n: G.A.n} : null); if(sc && G.used[sc.sig]) sc = null; }
  G.lastTheme = sc.mix ? sc.theme : theme; G.used[sc.sig] = 1; G.scene = sc; if(window.PKGUEST) PKGUEST.seenScene(sc); G.found = sc.diffs.map(() => false); G.pOops = 0; G.pHints = 0; G.pSecs = 0; G.lastFind = performance.now(); G.glowAt = -1;
  if(G.mode !== 'arcade') G.hints = L.hints;
  const nN = sc.diffs.length;
  clearMarks(); if(G.mode === 'arcade') BAR.count('pic', '📸', G.pics + '/' + G.rounds, 'Pictures to the 🏁'); else BAR.count('pic', MODE_ICON[G.mode], (G.pic + 1) + '/' + G.rounds, 'Picture'); BAR.count('found', '🔎', '0/' + nN, 'Found');
  $('dots').innerHTML = sc.diffs.map(() => '<i></i>').join('');
  updHint(); layout(true); if(sc.loop) pkClock();   // 🎬 pk-7m1: a moving island starts the frame clock
  ['pic-a', 'pic-b'].forEach(id => { const e = $(id); e.classList.remove('in'); void e.offsetWidth; e.classList.add('in'); });
  if(G.mode === 'arcade') goal(G.pic === 0 ? (G.A.bonus ? '🏁 ' + G.rounds + ' pictures! Find ⏳+' + G.A.bonus + ' s · oops ⏱+' + G.A.oops + ' s' : '🏁 ' + G.rounds + ' pictures — go, go, go!' + (G.A.oops ? ' Oops = +' + G.A.oops + ' s' : '')) : '📸 ' + (G.pic + 1) + '/' + G.rounds + ' — find ' + nN + '!');
  else if(G.mode === 'blink') goal(G.pic === 0 && G.level === 0 ? '👁️ The picture flips A ↔ B. Poke what changes! (' + L.n + ' to find)' : '👁️ Watch it blink — find ' + L.n + ' changes!' + (G.level < 2 ? ' ' + typeTips() : ''));
  else if(sc.mix && G.pic === 0 && G.level > 0) goal('🔍 Find ' + L.n + ' — anywhere! 🏞️ 🧑 🎒 ✨ 🎲');   // 🎲 pk-5c: changes can be in any layer
  else goal(G.pic === 0 && G.level === 0 ? '👀 Look at A and B. Poke what\'s different! (' + L.n + ' to find)' : '🔍 Find ' + L.n + ' differences!' + (G.level < 2 ? ' ' + typeTips() : G.pic === 0 && L.sub && !G.scene.photo ? ' Some are tiny: ' + L.sub.slice(0, 4).map(t => PK.TYPE_INFO[t].icon).join(' ') : ''));   // pk-5a: warn about the subtle ones
  if(sc.iso && G.mode !== 'arcade' && !(G.mode === 'blink' && G.pic === 0 && G.level === 0) && !(G.pic === 0 && G.level === 0)) goal('🧱 ' + sc.label + ' — find ' + nN + '!' + (sc.moves && !G.moveTold ? ' 🎬 Some are in how things MOVE!' : G.pic === 0 ? ' Houses, trees, people, the ground…' : ''));   // 🧱 pk-7b · 🎬 pk-7m1
  if(sc.iso && sc.moves) G.moveTold = true;
  G.busy = false;
  if(G.mode === 'blink') startBlink();
  if(L.guide && G.pic === 0) guideHand();
  moment('picture', {n: G.pic, theme: sc.theme, seed: sc.seed});
}
const MODE_ICON = {spot: '🖼️', blink: '👁️', odd: '🎯', arcade: '⏱️', detective: '📖', race: '👥'};
function typeTips(){ return G.L.types.map(t => PK.TYPE_INFO[t].icon).join(' '); }
function goal(html, cls){ const e = $('goal'); e.innerHTML = html; e.className = 'goal' + (cls ? ' ' + cls : ''); }
/* layout: two pictures as big as they fit — side by side, or top / bottom on a phone held upright */
let LAST_LAY = '';
function layout(force){
  const bd = $('board'); if(!bd || !G) return;
  const W = bd.clientWidth, H = bd.clientHeight; if(W < 20 || H < 20) return;
  const key = W + 'x' + H; if(!force && key === LAST_LAY && G.k) { return; } LAST_LAY = key;
  const gap = Math.max(8, Math.min(16, Math.round(Math.min(W, H) * 0.025))), ar = PK.W / PK.H;
  const sv = G.mode === 'detective' && G.step ? G.step.verb : '', dom = G.mode === 'detective' && sv !== 'find' && sv !== 'spot';
  $('ogrid').classList.toggle('hidden', G.mode !== 'odd'); $('sbox').classList.toggle('hidden', !dom || !sv);
  $('pic-a').classList.toggle('hidden', G.mode === 'odd' || dom); $('pic-b').classList.toggle('hidden', G.mode === 'odd' || dom || sv === 'find');
  if(G.mode === 'odd') return layoutOdd(W, H, gap);
  if(dom) return sv ? layoutStory(W, H, gap) : undefined;
  if(G.mode === 'blink' || sv === 'find'){ const w = Math.floor(Math.min(W - gap * 2, (H - gap) * ar, 900)), h = Math.floor(w / ar), left = (W - w) / 2, top = Math.max(gap / 2, (H - h) / 2);
    G.vert = false; G.k = w / PK.W; [$('pic-a'), $('pic-b')].forEach(p => Object.assign(p.style, {width: w + 'px', height: h + 'px', left: left + 'px', top: top + 'px'}));
    paintPics(); G.marks.forEach(placeMark); return; }
  const side = Math.min((W - gap * 3) / 2, (H - gap * 2) * ar), stack = Math.min(W - gap * 2, ((H - gap * 3) / 2) * ar);
  const vert = stack > side, w = Math.floor(Math.min(vert ? stack : side, 780)), h = Math.floor(w / ar);
  G.vert = vert; G.k = w / PK.W;
  const A = $('pic-a'), B = $('pic-b');
  [A, B].forEach(p => { p.style.width = w + 'px'; p.style.height = h + 'px'; });
  if(vert){ const top = Math.max(gap, (H - (h * 2 + gap)) / 2), left = (W - w) / 2; Object.assign(A.style, {left: left + 'px', top: top + 'px'}); Object.assign(B.style, {left: left + 'px', top: (top + h + gap) + 'px'}); }
  else { const left = (W - (w * 2 + gap)) / 2, top = Math.max(gap / 2, (H - h) / 2); Object.assign(A.style, {left: left + 'px', top: top + 'px'}); Object.assign(B.style, {left: (left + w + gap) + 'px', top: top + 'px'}); }
  paintPics(); G.marks.forEach(placeMark);
}
function paintPics(){
  if(!G || !G.scene || G.mode === 'odd') return; const w = parseFloat($('pic-a').style.width) || 0; if(!w) return;
  [['cv-a', 'A'], ['cv-b', 'B']].forEach(([id, side]) => { const cv = $(id), pw = Math.round(w * G.dpr), ph = Math.round(w / (PK.W / PK.H) * G.dpr);
    if(cv.width !== pw || cv.height !== ph){ cv.width = pw; cv.height = ph; } pkPaint(cv, G.scene, side, G.k, G.dpr); });
}
/* marks (found rings, glows, oops) are small DOM pieces over the pictures, placed from world units */
function mark(side, cls, x, y, r, txt){ const host = $(side === 'A' ? 'pic-a' : 'pic-b'), e = document.createElement('div'); e.className = 'mk ' + cls; if(txt) e.textContent = txt; host.appendChild(e);
  const m = {el: e, side, x, y, r}; G.marks.push(m); placeMark(m); return m; }
function placeMark(m){ const k = G.k; m.el.style.left = (m.x * k) + 'px'; m.el.style.top = (m.y * k) + 'px'; if(m.r){ m.el.style.width = m.el.style.height = Math.round(m.r * 2 * k) + 'px'; } }
function clearMarks(){ (G ? G.marks : []).forEach(m => m.el.remove()); if(G) G.marks = []; document.querySelectorAll('#pic-a .mk, #pic-b .mk, .lens, .lens-h').forEach(e => e.remove()); }   // also old rounds' rings (Next level / Again made a new G — pk-3a fix)
function dropMark(m){ m.el.remove(); G.marks = G.marks.filter(x => x !== m); }

/* ---------- poking ---------- */
function toWorld(pic, e){ const r = pic.getBoundingClientRect(); return {x: (e.clientX - r.left) / r.width * PK.W, y: (e.clientY - r.top) / r.height * PK.H}; }
function onPoke(side, e){
  if(!G || G.over || G.busy || G.paused || G.held) return;
  if(e.isPrimary === false) return;
  e.preventDefault();
  const pic = $(side === 'A' ? 'pic-a' : 'pic-b'), p = toWorld(pic, e);
  if(p.x < 0 || p.y < 0 || p.x > PK.W || p.y > PK.H) return;
  hideHand();
  const i = PK.poke(G.scene, p.x, p.y, G.found, e.pointerType === 'touch' ? 5 : 0);
  if(i >= 0) return found(i);
  const j = PK.pokeFound(G.scene, p.x, p.y, G.found);
  if(j >= 0){ UISound.play('tap'); goal('✓ You found that one already — look for the others!'); return; }
  oops(side, p);
}
function found(i){
  const d = G.scene.diffs[i]; G.found[i] = true; G.lastFind = performance.now();
  G.marks.filter(m => m.glow === i).forEach(dropMark);
  ['A', 'B'].forEach(s => { const m = mark(s, 'found', d.x, d.y, d.hit); m.found = i; if(G.scene.iso && window.PKISO) PKISO.dress(m.el, G.scene, i); });   // 🧱 pk-7b outline
  const n = G.found.filter(Boolean).length, L = G.L, N = G.scene.diffs.length;
  const dots = $('dots').children; if(dots[n - 1]) dots[n - 1].classList.add('on');
  if(G.mode === 'detective' && G.step && G.step.verb === 'find') BAR.count('found', '👣', n + '/' + N, 'Footprints'); else BAR.count('found', '🔎', n + '/' + N, 'Found');
  if(G.mode === 'arcade'){ G.total.found++; if(G.A.bonus){ G.extra += G.A.bonus; arcClock(); timePop('⏳ +' + G.A.bonus + ' s'); } }   // pk-3d: run time never shrinks; 🌋 / 💀 finds give ⏳ more time LEFT (Aowu 14:44)
  UISound.play('success'); bdReact('happy', 1300);
  goal((FOUND_SAY[d.sub] || '🎉 Found one!') + (d.guest && window.PKGUEST ? PKGUEST.found(d) : '') + ' ' + (n < N ? (N - n) + ' more to find.' : ''), 'yay');   // 📌 pk-7c guest sticker
  moment('found', {i, type: d.t, sub: d.sub, n, guest: d.guest ? d.guest.key : undefined});
  if(n >= N) pictureDone();
}
function oops(side, p){
  G.pOops++; G.total.oops++; BAR.miss(G.total.oops);
  UISound.play('error'); bdReact('miss', 1500);
  const m = mark(side, 'oops', p.x, p.y, 0, '✗'); setTimeout(() => dropMark(m), FX ? 800 : 0);
  const pic = $(side === 'A' ? 'pic-a' : 'pic-b'); pic.classList.remove('shake'); void pic.offsetWidth; pic.classList.add('shake');
  moment('oops', {side, x: Math.round(p.x), y: Math.round(p.y)});
  if(G.mode === 'arcade'){
    if(G.A.oops){ G.pen += G.A.oops; arcClock(); timePop('+' + G.A.oops + ' s', true); goal('Oops! +' + G.A.oops + ' s on your clock — look closely.', 'oops'); if(G.timeLeft <= 0) timeUp(); return; }
    goal('Oops! That part is the same in both. Keep looking!', 'oops'); return;
  }
  if(G.L.lives){
    G.lives--; BAR.lives(Math.max(0, G.lives), G.lives <= 1);
    if(G.lives <= 0){ goal('💀 Out of oops — the case is lost this time.', 'oops'); return caseLost(); }
    goal('Oops! ❤️ ' + G.lives + ' left — look closely.', 'oops'); return;
  }
  const left = G.found.filter(f => !f).length;
  if(G.mode === 'detective'){ goal(G.step && G.step.verb === 'find' ? (G.level < 2 ? 'Oops! That\'s not a ' + G.K.thief.boot[1] + ' footprint 👣 — look again.' : pkPick(['Oops! Not a thief print.', 'Not that one — ' + left + ' ' + G.K.thief.boot[1] + ' prints left.'])) : 'Oops! Same in A and B — keep looking.', 'oops'); return; }
  goal(G.level < 2 ? 'Oops! That part looks the same in both. Look for ' + G.L.types.map(t => PK.TYPE_INFO[t].tip).join(' or ') + '.' : pkPick(['Oops! Same in both — keep looking.', 'Not that one! ' + left + ' left.', 'Oops! Compare A and B again.']), 'oops');
}
function pictureDone(){
  if(G.mode === 'arcade') return arcPictureDone();
  if(G.mode === 'detective'){ G.total.found += G.scene.diffs.length; return stepDone(); }
  G.busy = true; stopBlink(true); G.marks.filter(m => m.cls === 'glow').forEach(dropMark);
  const secs = Math.round(G.pSecs), L = G.L;
  const pts = PK.picturePoints(G.level, {found: L.n, secs, oops: G.pOops, hints: G.pHints});
  G.total.found += L.n; G.total.points += pts; if(!G.pOops && !G.pHints) G.total.perfect++;
  G.total.quick = G.total.quick ? Math.min(G.total.quick, Math.max(1, secs)) : Math.max(1, secs);
  G.picLog.push({theme: G.scene.theme, secs, oops: G.pOops, hints: G.pHints, pts});
  /* 🎆 pk-7f: with the FX part playing, "AHA!" comes in the ⭐ burst → the callout only shows the points (one word) */
  if(typeof PKFX !== 'undefined' && PKFX.aha()) bigWord('⭐ +' + pts + ' points', '', 'good'); else bigWord('🎉 ' + pkPick(PRAISE), '+' + pts + ' points', 'good'); bdReact('joy', 1800); UISound.play('unlock');
  moment('picdone', {n: G.pic, secs, oops: G.pOops, hints: G.pHints});
  pkWait(1500).then(() => {
    if(!G || G.over) return;
    if(G.pic + 1 >= G.rounds) return finishCase(true);
    ['pic-a', 'pic-b'].forEach(id => $(id).classList.add('out'));
    pkWait(320).then(() => { if(!G || G.over) return; ['pic-a', 'pic-b'].forEach(id => $(id).classList.remove('out')); nextPicture(); });
  });
}
function caseLost(){ G.busy = true; stopBlink(true); if(G.mode === 'odd') return oddLost(); if(G.mode === 'detective'){ G.scene.diffs.forEach((d, i) => { if(!G.found[i]) mark('A', 'miss', d.x, d.y, d.hit); }); bdReact('lose', 2200); pkWait(1600).then(() => { if(G && !G.over) finishStory(false); }); return; } G.scene.diffs.forEach((d, i) => { if(!G.found[i]) ['A', 'B'].forEach(s => mark(s, 'miss', d.x, d.y, d.hit)); }); bdReact('lose', 2200); pkWait(1600).then(() => { if(G && !G.over) finishCase(false); }); }

/* ---------- 🔍 magnifier + soft glow + 👆 guide ---------- */
function updHint(){ const b = $('hint-btn'), n = G ? G.hints : 0; $('hint-left').textContent = n; b.disabled = !G || n <= 0; b.classList.toggle('hidden', !!(G && G.L.hardcore)); }
function useHint(){
  if(!G || G.over || G.busy || G.paused) return;
  if(G.hints <= 0){ UISound.play('error'); UI.toast(G.L.hardcore ? '💀 No magnifier in Hardcore' : '🔍 No magnifier left for this picture'); return; }
  if(G.mode === 'odd') return oddHint();
  if(G.mode === 'detective' && G.step && G.step.verb !== 'find' && G.step.verb !== 'spot') return storyHint();
  const i = G.found.findIndex(f => !f); if(i < 0) return;
  G.hints--; G.pHints++; G.total.hints++; updHint(); UISound.play('whoosh');
  const d = G.scene.diffs[i]; showLens(d); glowOn(i);
  goal('🔍 Look in the magnifier — poke the change!');
  moment('hint', {i, type: d.t});
}
function showLens(d){
  document.querySelectorAll('.lens, .lens-h').forEach(e => e.remove());
  if(G.mode === 'blink') blinkShow('B', true);
  const one = G.mode === 'detective' && G.step && G.step.verb === 'find', pic = $(one ? 'pic-a' : 'pic-b'), k = G.k, size = Math.max(84, Math.min(170, d.hit * 2.8 * k)), zoom = 1.7;
  const L = document.createElement('div'); L.className = 'lens'; L.style.width = L.style.height = size + 'px'; L.style.left = (d.x * k) + 'px'; L.style.top = (d.y * k) + 'px';
  const c = document.createElement('canvas'); c.width = c.height = Math.round(size * G.dpr); L.appendChild(c); pic.appendChild(L);
  const src = $(one ? 'cv-a' : 'cv-b'), half = size / 2 / zoom, s = k * G.dpr;
  const draw = () => { const g = c.getContext('2d'); g.setLineDash([]); g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(src, (d.x * k - half) * G.dpr, (d.y * k - half) * G.dpr, half * 2 * G.dpr, half * 2 * G.dpr, 0, 0, c.width, c.height);
    g.strokeStyle = 'rgba(255,214,107,0.9)'; g.lineWidth = 3 * G.dpr; g.setLineDash([8 * G.dpr, 6 * G.dpr]); g.beginPath(); g.arc(c.width / 2, c.height / 2, Math.min(c.width / 2 - 6, d.hit * zoom * s * 0.85), 0, 7); g.stroke(); };
  draw(); const G0 = G; G.lensDraw = G.scene && G.scene.loop ? draw : null;   // 🎬 pk-7m1: a moving island → the lens follows the frame clock
  setTimeout(() => { L.remove(); if(G0 && G0.lensDraw === draw) G0.lensDraw = null; }, 2600);
}
function glowOn(i){ if(G.marks.some(m => m.glow === i)) return; const d = G.scene.diffs[i]; ['A', 'B'].forEach(s => { const m = mark(s, 'glow', d.x, d.y, d.hit); m.glow = i; m.cls = 'glow'; }); moment('glow', {i}); }
let HAND_T = 0;
function guideHand(){
  const h = $('hand'), A = $('pic-a'), B = $('pic-b'), bd = $('board').getBoundingClientRect();
  const at = (p, fx, fy) => { const r = p.getBoundingClientRect(); return [r.left - bd.left + r.width * fx, r.top - bd.top + r.height * fy]; };
  const og = $('ogrid'), spots = G.mode === 'odd' ? [...og.children].slice(0, 4).map(c => at(c, 0.5, 0.55)) : G.mode === 'blink' || G.mode === 'detective' ? [at(A, 0.3, 0.4), at(A, 0.7, 0.4), at(A, 0.3, 0.7), at(A, 0.7, 0.7)] : [at(A, 0.5, 0.5), at(B, 0.5, 0.5), at(A, 0.5, 0.5), at(B, 0.5, 0.5)];
  h.classList.remove('hidden'); let i = 0; clearInterval(HAND_T);
  const go = () => { if(!G || i >= spots.length){ hideHand(); return; } h.style.left = spots[i][0] + 'px'; h.style.top = spots[i][1] + 'px'; h.classList.remove('tap'); void h.offsetWidth; h.classList.add('tap'); i++; };
  go(); HAND_T = setInterval(go, 1100);   // looks only — the game never waits for the hand
}
function hideHand(){ clearInterval(HAND_T); $('hand').classList.add('hidden'); }

/* ---------- clock (no clock shown on 🌱 Basic) ---------- */
function startTicker(){ stopTicker(); G.last = performance.now(); TICK = setInterval(tick, 250); }
function stopTicker(){ clearInterval(TICK); TICK = 0; hideHand(); }
function tick(){
  if(!G || G.over) return stopTicker();
  const now = performance.now(), dt = (now - G.last) / 1000; G.last = now;
  if(G.paused || G.held || G.busy || $('scr-play').classList.contains('hidden')) { G.lastFind += dt * 1000; return; }
  G.secs += dt; G.pSecs += dt;
  if(G.mode === 'arcade'){ arcClock(); if(G.timeLeft <= 0) return timeUp(); }
  else if(G.level > 0) BAR.time(Math.floor(G.secs));
  if(G.mode === 'detective' && !(G.step && (G.step.verb === 'find' || G.step.verb === 'spot'))) return storyTick(now);
  const glowS = G.mode === 'odd' ? G.O.glow : G.L.glow;
  if(G.mode === 'odd'){ if(glowS && now - G.lastFind > glowS * 1000 && G.odd && !G.odd.glow){ oddGlow(); goal('✨ Psst — look where it glows!'); UISound.play('pop'); } return; }
  if(G.L.glow && now - G.lastFind > G.L.glow * 1000){ const i = G.found.findIndex(f => !f); if(i >= 0 && !G.marks.some(m => m.glow === i)){ glowOn(i); goal('✨ Psst — look where it glows!'); UISound.play('pop'); } }
}
function setPaused(on){ if(G){ G.paused = !!on; G.last = performance.now(); } }
function pauseGame(){ setPaused(true); }
function leavePlay(){ /* 💬 24t-c off */ if(window.UI && UI.callout) UI.callout.setup(null); stopTicker(); stopBlink(); storyReset(); if(G) G.over = true; hideResult(); clearMarks(); renderMenu(); showScreen('menu'); }

/* ---------- words + confetti ---------- */
function bigWord(txt, small, rank, stopped){ if(!FX) return; /* 💬 24t-c bigWord */ if(window.UI && UI.callout && UI.callout.active()){ UI.callout(txt + (small ? ' · ' + small : ''), {rank: rank || 'good', stopped: !!stopped}); return; } const e = document.createElement('div'); e.className = 'big-word'; e.innerHTML = UI.esc(txt) + (small ? '<small>' + UI.esc(small) + '</small>' : ''); $('bigword-host').appendChild(e); setTimeout(() => e.remove(), 1300); }
function confetti(list, count){ if(!FX) return; for(let i = 0; i < (count || 24); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = pkPick(list); e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }

/* ================= RESULT + SAVES ================= */
function houseLabel(){ const h = HOUSES.find(x => x.k === SET.house) || HOUSES[0]; return h.icon + ' ' + h.name + (h.k === 'trip' && G && G.lastPlace ? ' · ' + PK.THEMES[G.lastPlace].icon + ' ' + PK.THEMES[G.lastPlace].name : ''); }
function finishCase(won){
  if(!G || G.over) return; if(G.mode === 'arcade') return arcFinish(); if(G.mode === 'detective') return finishStory(won);
  G.over = true; stopTicker(); hideHand();
  stopBlink(); const L = G.L, T = G.total, secs = Math.round(G.secs), hc = !!L.hardcore;
  const cleared = !!won, stars = PK.starsFor({cleared, oops: T.oops, hints: T.hints}), score = cleared ? T.points : Math.round(T.points * 0.5);
  const before = PK.rankOf(progressOf(S.player).unlocked || 0);
  NOTES.length = 0;
  let h = '<div class="res-det" id="res-det"><canvas id="res-av" width="240" height="264"></canvas><svg class="hat" viewBox="0 0 60 30" aria-hidden="true"><path d="M8 23 Q30 1 52 23 Z" fill="#8B5A2B" stroke="#3B2410" stroke-width="2"/><path d="M12 19 Q30 7 48 19" fill="none" stroke="#C99A5B" stroke-width="2" stroke-dasharray="3 3"/><path d="M3 24 H57" stroke="#3B2410" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="5" r="3" fill="#C99A5B"/></svg><span class="glass">🔍</span></div>'
    + '<h2 class="' + (cleared ? 'cheer' : '') + '">' + (cleared ? '📁 Case closed!' : 'So close, detective!') + '</h2>'
    + '<div class="note">' + (MODES.find(m => m.k === G.mode) || MODES[0]).icon + ' ' + (MODES.find(m => m.k === G.mode) || MODES[0]).name + ' · ' + L.name + (hc ? ' 💀' : '') + ' · ' + houseLabel() + '</div>';
  h += '<div class="rating">' + [1, 2, 3].map(i => '<span class="st' + (i <= stars ? '' : ' off') + '">⭐</span>').join('') + '</div><div class="score-big">🏆 ' + score.toLocaleString() + '</div>';
  const pl = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  const finds = G.mode === 'odd' ? T.found : T.found + (cleared ? 0 : G.found.filter(Boolean).length);
  h += '<div class="stats"><span>' + (G.mode === 'odd' ? '🎯 ' + pl(finds, 'odd one') : '🔎 ' + pl(finds, 'find')) + '</span><span>❌ ' + pl(T.oops, 'oops') .replace('oopss', 'oops') + '</span><span>🔍 ' + pl(T.hints, 'hint') + '</span><span>🦅 ' + T.perfect + ' perfect</span>' + (G.level > 0 ? '<span>⏱ ' + Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') + '</span>' : '') + '</div>';
  if(!cleared) h += '<div class="note">💡 ' + pkPick(['Look at one corner of A, then the same corner of B.', 'Check colours first, then count the spots and petals.', 'Things can also be turned around or flipped!', 'Take your time — Hardcore only counts the oops.']) + '</div>';
  h += '<div class="save-note" id="save-note">' + (S.player ? '💾 Saving…' : '') + '</div>';
  h += '<div class="res-btns" id="res-btns"><button class="sp-btn sp-secondary" id="res-levels" data-sound="tap">🎚️ Levels</button><button class="sp-btn sp-secondary" id="res-again" data-sound="pop">🔁 Play again</button>'
    + (cleared && G.level < 5 ? '<button class="sp-btn sp-primary" id="res-next" data-sound="pop">Next level ▶</button>' : '') + '</div><div class="comics-slot" id="comic-strip-slot"></div>';
  showResult(h);
  if(BD.on) UI.buddy($('res-av'), BD.who, {hold: cleared ? 'win' : 'lose'}); else $('res-det').classList.add('hidden');
  $('res-levels').onclick = () => leavePlay();
  $('res-again').onclick = () => startCase(G ? G.level : SET.level);
  if($('res-next')) $('res-next').onclick = () => startCase(Math.min(5, (G ? G.level : SET.level) + 1));
  if(cleared){ confetti(['🔍', '⭐', '🕵️', '🎉', '✨'], 26); UISound.play('success'); } else bdReact('lose', 2000);
  moment(cleared ? 'win' : 'lose', {score, stars, secs});
  const stats = {games: 1, cases: cleared ? 1 : 0, found: finds, perfect: T.perfect, hints: T.hints, oops: T.oops};
  if(G.mode === 'odd') stats.odd = finds; else if(G.mode === 'blink') stats.blinks = finds;
  if(cleared && T.quick && G.mode !== 'odd') stats.quick = T.quick;
  if(S.player) saveWin(S.player, G.level, {score, stars, cleared, timeSec: secs, theme: MODE_NAME[G.mode] + ' · ' + houseLabel(), stats}, before);
  if(UI.alsoTry) UI.alsoTry({player: S.player, game: GAME_ID, at: () => $('res-btns'), current: SET.mode, open: id => { leavePlay(); msOpen(id); }});
  SET.level = G.level;
}
const PENDING_KEY = 'sp_pokadif_pending';
const NOTES = [];
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function flushPending(){ const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => { google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))).saveLevelResult(w.board || GAME_ID, w.name, w.lvl, w.extra); }); }
function putNote(i, html){ NOTES[i] = html; const n = $('save-note'); if(n) n.innerHTML = NOTES.filter(Boolean).join('<br>'); }
function saveWin(name, lvl, extra, before, tries, board){
  board = board || GAME_ID; const P = board === ARC_ID ? S.progressArc : board === CASE_ID ? S.progressCase : S.progress;
  tries = tries || 0; const p = P[name] || (P[name] = {unlocked: 0, tokens: [], best: []});
  google.script.run.withSuccessHandler(res => {
      const best = (p.best || []).slice(); if(res && res.best) best[lvl] = res.best;
      P[name] = {unlocked: res ? res.unlocked : p.unlocked, tokens: res ? res.tokens : p.tokens, best}; flushPending();
      const after = PK.rankOf((S.progress[name] || {}).unlocked || 0);
      putNote(0, saveText(res || {}, extra.cleared) + (before && after.name !== before.name ? '<br><span class="rankup">' + after.icon + ' Rank up: ' + after.name + '!</span>' : ''));
    }).withFailureHandler(() => {
      if(tries < 1){ setTimeout(() => saveWin(name, lvl, extra, before, tries + 1, board), 1200); return; }
      writePending(readPending().concat([{name, lvl, extra, board}])); putNote(0, '⚠️ Could not save yet — it will be sent again next time.');
    }).saveLevelResult(board, name, lvl, extra);
}
function featText(fe, base){ let h = base || ''; if(fe){ (fe.newTitles || []).forEach(t => { h += '<br><span class="title-new">🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name) + '</span>'; }); (fe.newBadges || []).forEach(b => { h += '<br><span class="feat-new">' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName + '</span>'; }); } return h; }
function saveText(res, cleared){
  const h = res.newBadge ? '<span class="new-badge">🏅 New badge: ' + UI.esc(res.newBadge) + '</span>' : res.newHighScore && !res.firstTime ? '🎉 New best for this level!' : cleared ? (res.best && res.best.score ? 'Best: 🏆 ' + Number(res.best.score).toLocaleString() : '✅ Saved') : '✅ Saved — solve the case to unlock the next level';
  return featText(res.feats, h);
}
function showResult(html){ /* 💬 24t-c result */ if(window.UI && UI.callout) UI.callout.setup(null); if(window.PKGUEST && G && G.over) html = PKGUEST.row(html); /* 📌 pk-7c */ $('result-card').innerHTML = html; if(window.PKGUEST) PKGUEST.wire($('result-card')); $('result').classList.remove('hidden'); }
function hideResult(){ $('result').classList.add('hidden'); }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goBack(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }
window.feedbackContext = () => ({page: 'Pokadif', game: GAME_ID, level: G ? G.level : SET.level, mode: SET.mode});

/* ================= 👁️ BLINK (pk-2a): ONE picture that flips A ↔ B — with a blank blink between on harder levels (the change hides!) =================
   Both picture boxes sit on the same spot (layout); the one on top takes the pokes. Looks only — the clock + rules are the same as Spot. */
let BLINK_T = 0;
function blinkShow(side, hold){ const A = $('pic-a'), B = $('pic-b'); A.classList.toggle('bl-off', side !== 'A'); B.classList.toggle('bl-off', side !== 'B'); if(G) G.blinkSide = side; if(hold){ clearTimeout(BLINK_T); BLINK_T = setTimeout(() => { if(G && G.mode === 'blink' && !G.busy && !G.over) blinkStep(); }, 2600); } }
function blinkStep(){
  clearTimeout(BLINK_T); if(!G || G.mode !== 'blink' || G.over) return;
  const P = BLINK[G.level] || BLINK[0];
  if(G.paused || G.held){ BLINK_T = setTimeout(blinkStep, 200); return; }
  const next = G.blinkSide === 'A' ? 'B' : 'A';
  if(P.gap){ blinkShow('none'); BLINK_T = setTimeout(() => { blinkShow(next); BLINK_T = setTimeout(blinkStep, P.show); }, P.gap); }
  else { blinkShow(next); BLINK_T = setTimeout(blinkStep, P.show); }
}
function startBlink(){ clearTimeout(BLINK_T); blinkShow('A'); BLINK_T = setTimeout(blinkStep, (BLINK[G.level] || BLINK[0]).show); }
function stopBlink(keep){ clearTimeout(BLINK_T); BLINK_T = 0; if(!keep){ ['pic-a', 'pic-b'].forEach(id => $(id).classList.remove('bl-off')); } }

/* ================= 🎯 ODD ONE OUT (pk-2a): a grid of cards — all alike but one. 6 rounds a case. ================= */
const ODD_SAY = {colour: '🎨 It\'s a different colour!', shape: '🔺 It\'s a different shape!', bigger: '📏 It\'s bigger!', smaller: '📏 It\'s smaller!', flip: '🔄 It\'s flipped!', turn: '🔄 It\'s turned!', more: '🔢 It has more!', fewer: '🔢 It has fewer!'};
function nextOdd(){
  if(!G) return; G.pic++;
  const theme = SET.house === 'mix' || SET.house === 'trip' || SET.house === 'iso' ? pkPick(PK.THEME_KEYS.filter(k => k !== G.lastTheme)) : SET.house;   // 📸 trip = picture modes only
  let od = null; for(let i = 0; i < 6 && !od; i++){ od = PK.makeOdd(PK.newSeed(), G.level, theme); if(od && G.used[od.sig]) od = null; }
  G.lastTheme = theme; G.used[od.sig] = 1; G.odd = od; G.pOops = 0; G.pHints = 0; G.pSecs = 0; G.lastFind = performance.now();
  if(G.pic === 0) G.hints = G.O.hints;
  BAR.count('pic', '🎯', (G.pic + 1) + '/' + G.rounds, 'Round');
  if(G.pic === 0) $('dots').innerHTML = Array.from({length: G.rounds}, () => '<i></i>').join('');
  const box = $('ogrid'); box.innerHTML = ''; box.dataset.kind = od.type === 'equation' || od.type === 'word' ? 'txt' : 'pic'; box.dataset.type = od.type;
  od.cards.forEach((c, i) => { const b = document.createElement('button'); b.className = 'oc'; b.dataset.i = i; b.type = 'button'; b.setAttribute('data-sound', 'none');
    b.style.animationDelay = (i * 0.04) + 's'; b.appendChild(document.createElement('canvas')); b.addEventListener('pointerdown', e => onOdd(i, e)); box.appendChild(b); });
  updHint(); layout(true);
  goal(G.pic === 0 && G.level === 0 ? '🎯 One card is different. Poke it!' : '🎯 ' + od.goal + (od.type === 'pattern' ? ' 🌀' : ''));
  G.busy = false;
  if(G.O.guide && G.pic === 0) guideHand();
  moment('picture', {n: G.pic, theme, type: od.type});
}
function layoutOdd(W, H, gap){
  const box = $('ogrid'), n = G.odd ? G.odd.cards.length : 0; if(!n) return;
  let best = {s: 0, cols: 1};
  for(let cols = 1; cols <= n; cols++){ const rows = Math.ceil(n / cols), s = Math.min((W - gap * (cols + 1)) / cols, (H - gap * (rows + 1)) / rows); if(s > best.s) best = {s, cols, rows}; }
  const s = Math.floor(Math.min(best.s, 190)); G.cardPx = s;
  Object.assign(box.style, {gridTemplateColumns: 'repeat(' + best.cols + ', ' + s + 'px)', gap: gap + 'px'});
  [...box.children].forEach((b, i) => { b.style.width = b.style.height = s + 'px'; const c = G.odd.cards[i]; pkCard(b.querySelector('canvas'), c, s - 8, G.dpr); b.classList.toggle('txt', c.txt != null); });
}
function onOdd(i, e){
  if(!G || G.over || G.busy || G.paused || G.held || G.mode !== 'odd') return;
  if(e && e.isPrimary === false) return; if(e) e.preventDefault(); hideHand();
  const b = $('ogrid').children[i], od = G.odd;
  if(i === od.odd){
    G.busy = true; G.lastFind = performance.now(); b.classList.add('right'); [...$('ogrid').children].forEach((x, j) => { if(j !== i) x.classList.add('dim'); });
    const secs = Math.round(G.pSecs), pts = PK.oddPoints(G.level, {secs, oops: G.pOops, hints: G.pHints});
    G.total.found++; G.total.points += pts; if(!G.pOops && !G.pHints) G.total.perfect++;
    const dots = $('dots').children; if(dots[G.pic]) dots[G.pic].classList.add('on');
    UISound.play('success'); bdReact('joy', 1400);
    goal((od.say || ODD_SAY[od.sub] || '🎉 Found it!') + ' +' + pts, 'yay'); bigWord('🎯 ' + pkPick(PRAISE), '+' + pts, 'good');
    moment('found', {i, type: od.type, sub: od.sub, n: G.total.found});
    pkWait(1300).then(() => { if(!G || G.over) return; if(G.pic + 1 >= G.rounds) return finishCase(true); nextOdd(); });
    return;
  }
  G.pOops++; G.total.oops++; BAR.miss(G.total.oops); UISound.play('error'); bdReact('miss', 1400);
  b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake', 'nope'); setTimeout(() => b.classList.remove('nope'), FX ? 700 : 0);
  moment('oops', {i});
  if(G.lives){ G.lives--; BAR.lives(Math.max(0, G.lives), G.lives <= 1); if(G.lives <= 0){ goal('💀 Out of oops — the case is lost this time.', 'oops'); return caseLost(); } goal('Oops! ❤️ ' + G.lives + ' left.', 'oops'); return; }
  const why = {equation: 'That sum makes ' + (od.target || '') + ' — look for the one that doesn\'t.', word: 'That word rhymes with the others.', pattern: 'That one fits the pattern — say the pattern out loud!'};
  goal(G.level < 2 ? 'Oops! That one is the same as most. Look at colour, shape and size.' : 'Oops! ' + (why[od.type] || 'That one matches the others.'), 'oops');
}
function oddGlow(){ const b = $('ogrid').children[G.odd.odd]; if(b) b.classList.add('glow'); G.odd.glow = true; moment('glow', {}); }
function oddHint(){
  if(G.hints <= 0){ UISound.play('error'); UI.toast(G.O.hardcore ? '💀 No magnifier in Hardcore' : '🔍 No magnifier left in this case'); return; }
  G.hints--; G.pHints++; G.total.hints++; updHint(); UISound.play('whoosh'); oddGlow(); goal('🔍 The magnifier says: look at the glowing card!');
  moment('hint', {type: G.odd.type});
}
/* ================= ⏱️ PHOTO HUNT ARCADE (pk-2b): pictures in a row against the clock — + time per find, ✅ checkpoint every 5 pictures ================= */
function arcClock(){ G.run = G.secs + G.pen; G.timeLeft = Math.max(0, G.A.limit + (G.extra || 0) - G.run); BAR.time(Math.floor(G.run), G.timeLeft <= 20); arcBar(); }   // ⏱ counts UP (+ oops seconds); the bar = time left before the limit
function arcBar(){ const e = $('tbar'); if(!e || !G || !G.A) return; const f = Math.max(0, Math.min(1, G.timeLeft / G.A.limit)); e.firstElementChild.style.width = (f * 100) + '%'; e.classList.toggle('low', G.timeLeft <= 20); }
function timePop(txt, bad){ if(!FX) return; const e = document.createElement('div'); e.className = 'tpop' + (bad ? ' bad' : ''); e.textContent = txt; $('board').appendChild(e); setTimeout(() => e.remove(), 1000); }
function arcPictureDone(){
  G.busy = true; G.pics++; arcClock(); BAR.count('pic', '📸', G.pics + '/' + G.rounds, 'Pictures to the 🏁');
  if(!G.pOops && !G.pHints) G.total.perfect++;
  G.total.quick = G.total.quick ? Math.min(G.total.quick, Math.max(1, Math.round(G.pSecs))) : Math.max(1, Math.round(G.pSecs));
  if(G.pics >= G.rounds){ G.finished = true; bigWord('🏁 FINISH!', '⏱ ' + PK.mmss(G.run), 'big', true); UISound.play('success'); bdReact('win', 1800); confetti(['🏁', '⏱️', '⭐'], 22); moment('finish', {n: G.pics, time: Math.round(G.run)}); pkWait(1400).then(() => { if(G && !G.over) arcFinish(); }); return; }
  const cp = G.pics % PK.CHECK_EVERY === 0;
  if(cp){ G.cps++; G.splits.push(Math.round(G.run)); bigWord('✅ Checkpoint ' + G.cps + '!', '⏱ ' + PK.mmss(G.run) + ' · ' + (G.rounds - G.pics) + ' to go', 'big'); UISound.play('unlock'); bdReact('joy', 1800); confetti(['⏱️', '✅', '⭐'], 14); }
  else { bigWord('📸 ' + pkPick(PRAISE), G.pics + '/' + G.rounds, 'good'); UISound.play('success'); bdReact('happy', 1200); }
  moment(cp ? 'checkpoint' : 'picdone', {n: G.pics, cps: G.cps, time: Math.round(G.run)});
  pkWait(cp ? 1300 : 800).then(() => {
    if(!G || G.over) return;
    ['pic-a', 'pic-b'].forEach(id => $(id).classList.add('out'));
    pkWait(260).then(() => { if(!G || G.over) return; ['pic-a', 'pic-b'].forEach(id => $(id).classList.remove('out')); nextPicture(); });
  });
}
function timeUp(){ if(!G || G.over || G.timeUp) return; G.timeUp = true; G.busy = true; UISound.play('error');
  G.scene.diffs.forEach((d, i) => { if(!G.found[i]) ['A', 'B'].forEach(s => mark(s, 'miss', d.x, d.y, d.hit)); }); bigWord('⏱️ Time\'s up!', '', 'big', true); moment('timeup', {pics: G.pics, goal: G.rounds}); pkWait(1400).then(() => { if(G && !G.over) arcFinish(); }); }
function arcFinish(){
  if(!G || G.over) return; G.over = true; stopTicker(); hideHand();
  const T = G.total, run = Math.round(G.run || 0), r = {found: T.found, pictures: G.pics, finished: !!G.finished, time: run}, score = PK.arcadeScore(G.level, r), stars = PK.arcadeStars(G.level, r), cleared = !!G.finished, L = G.L, secs = Math.round(G.secs);
  const before = ((progressOf(S.player, ARC_ID) || {}).best || [])[G.level], pb = cleared && before && before.timeSec && run < before.timeSec;
  NOTES.length = 0;
  let h = '<div class="res-det" id="res-det"><canvas id="res-av" width="240" height="264"></canvas><svg class="hat" viewBox="0 0 60 30" aria-hidden="true"><path d="M8 23 Q30 1 52 23 Z" fill="#8B5A2B" stroke="#3B2410" stroke-width="2"/><path d="M12 19 Q30 7 48 19" fill="none" stroke="#C99A5B" stroke-width="2" stroke-dasharray="3 3"/><path d="M3 24 H57" stroke="#3B2410" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="5" r="3" fill="#C99A5B"/></svg><span class="glass">⏱️</span></div>'
    + '<h2 class="' + (cleared ? 'cheer' : '') + '">' + (cleared ? '🏁 Finished in ' + PK.mmss(run) + '!' : '⏱️ Time\'s up!') + '</h2>'
    + (pb ? '<div class="thief">🥇 New best time! (was ' + PK.mmss(before.timeSec) + ')</div>' : '')
    + '<div class="note">⏱️ Photo Hunt Arcade · ' + L.name + (L.hardcore ? ' 💀' : '') + ' · ' + houseLabel() + '</div>'
    + '<div class="rating">' + [1, 2, 3].map(i => '<span class="st' + (i <= stars ? '' : ' off') + '">⭐</span>').join('') + '</div><div class="score-big">🏆 ' + score.toLocaleString() + '</div>'
    + '<div class="stats"><span>📸 ' + G.pics + '/' + G.rounds + ' pictures</span><span>⏱ ' + PK.mmss(run) + '</span>' + (G.splits.length ? '<span>✅ ' + G.splits.map(PK.mmss).join(' · ') + '</span>' : '') + '<span>🔎 ' + T.found + ' finds</span><span>❌ ' + T.oops + ' oops' + (G.pen ? ' (+' + G.pen + ' s)' : '') + '</span></div>'
    + '<div class="note">' + (cleared ? (stars < 3 ? '⭐⭐⭐ under ' + PK.mmss(G.A.par) + ' — can you go faster?' : '⭐⭐⭐ Lightning eyes!') : '💡 Reach the 🏁 (' + G.rounds + ' pictures) within ' + PK.mmss(G.A.limit) + ' to open the next level.') + '</div>';
  h += '<div class="save-note" id="save-note">' + (S.player ? '💾 Saving…' : '') + '</div>'
    + '<div class="res-btns" id="res-btns"><button class="sp-btn sp-secondary" id="res-levels" data-sound="tap">🎚️ Levels</button><button class="sp-btn sp-secondary" id="res-again" data-sound="pop">🔁 Play again</button>'
    + (cleared && G.level < 5 ? '<button class="sp-btn sp-primary" id="res-next" data-sound="pop">Next level ▶</button>' : '') + '</div><div class="comics-slot" id="comic-strip-slot"></div>';
  showResult(h);
  if(BD.on) UI.buddy($('res-av'), BD.who, {hold: cleared ? 'win' : 'lose'}); else $('res-det').classList.add('hidden');
  $('res-levels').onclick = () => leavePlay();
  $('res-again').onclick = () => startCase(G ? G.level : SET.level);
  if($('res-next')) $('res-next').onclick = () => startCase(Math.min(5, (G ? G.level : SET.level) + 1));
  if(cleared){ confetti(['⏱️', '⭐', '🕵️', '🎉'], 22); UISound.play('success'); } else bdReact('lose', 2000);
  moment(cleared ? 'win' : 'lose', {score, stars, pics: G.pics, cps: G.cps});
  const stats = {games: 1, pictures: G.pics, checkpoints: G.cps, finishes: cleared ? 1 : 0, found: T.found, oops: T.oops, hints: T.hints};
  if(S.player) saveWin(S.player, G.level, {score, stars, cleared, timeSec: cleared ? run : 0, theme: '⏱️ Speed run · ' + houseLabel(), stats}, null, 0, ARC_ID);   // timeSec only for a finished run → best time per level
  if(UI.alsoTry) UI.alsoTry({player: S.player, game: GAME_ID, at: () => $('res-btns'), current: SET.mode, open: id => { leavePlay(); msOpen(id); }});
  SET.level = G.level;
}
function oddLost(){ const b = $('ogrid').children[G.odd.odd]; if(b) b.classList.add('missed'); bdReact('lose', 2200); pkWait(1600).then(() => { if(G && !G.over) finishCase(false); }); }

function storyReset(){ CARD_RES = null; const c = $('scard'); if(c){ c.classList.add('hidden'); c.innerHTML = ''; } const b = $('sbox'); if(b){ b.classList.add('hidden'); b.innerHTML = ''; } }
/* ================= 📖 DETECTIVE ADVENTURE (pk-3a): case books — 3 chapters, each 2 steps of 🔍 find · 📜 read · 🚶 walk · 🖼️ spot · 🔐 crack · 👉 accuse =================
   PK.makeCase shuffles everything (thief, boots, dropped things, picture, map, code, quiz). Story cards (chapter · clue · lesson) sit over the board and wait for ▶.
   Own board 'pokadif-case' (best per difficulty, own unlocks). 💥 Comic moments: story · chapter · step · clue · lesson · walk · crack · accuse · caught · win / lose. */
const CASE_ID = 'pokadif-case';
const CASE_KEY = 'sp_pokadif_case';
const STORY_BLURB = ['👣 Big footprints · 2-number code · 3 suspects · guided', '🔑 Key on the map · 3-number code · two clues to match', '👀 Look-alike footprints · 👟 step limit · sums', '📜 "Which one is NOT…?" · 4-number code', '🌀 Patterns in the code · 5 suspects', '🔤 A = 1 code · tight steps · 3 oops = case lost'];
/* 📏 pk-7a cases#1 → Pokadif_cases.html */
function caseSeen(){ try{ return JSON.parse(localStorage.getItem(CASE_KEY + ':' + (S.player || '')) || '{}'); }catch(e){ return {}; } }
/* 📏 pk-7a cases#2 → Pokadif_cases.html */
const CASE_SHELF = [{id: 'magnet'}, {id: 'dino'}, {id: 'ship'}, {id: 'disco'}, {id: 'moon'}, {id: 'cloud'}, {id: 'garden'}, {id: 'clock'}, {id: 'cake'}, {id: 'volcano'}, {id: 'bees'}, {id: 'orchestra'}, {id: 'market'}, {id: 'ice'}];   // pk-6b: + 🍰 🌋 🐝 · pk-6c: + 🎵 🏮 🧊   // pk-3b: 3 case books · pk-4b: + 🪩 🪐 · pk-4c: + ☁️ 🌱 ⏰
function renderCases(){
  const box = $('house-list'), seen = caseSeen();
  box.innerHTML = CASE_SHELF.map(c => { const C = c.soon ? c : PK.caseById(c.id), on = (SET.caseId || 'magnet') === c.id;
    return '<button class="house case' + (on ? ' on' : '') + (c.soon ? ' soon' : '') + '" data-k="' + c.id + '" data-sound="' + (c.soon ? 'none' : 'tap') + '" title="' + UI.esc(C.name) + '">' + C.icon + ' ' + UI.esc(C.name) + (c.soon ? ' 🔜' : seen['C:' + c.id] ? ' ✅' : '') + '</button>'; }).join('');
  box.querySelectorAll('.house').forEach(b => b.onclick = () => { const c = CASE_SHELF.find(x => x.id === b.dataset.k); if(c.soon){ UISound.play('error'); UI.toast('🔜 ' + c.icon + ' ' + c.name + ' — next case book!'); return; }
    SET.caseId = c.id; savePrefs(); box.querySelectorAll('.house').forEach(x => x.classList.toggle('on', x === b)); });
}
/* 📏 pk-7a cases#3 → Pokadif_cases.html */

/* ---------- 🃏 story card (chapter · clue · lesson) — waits for ▶ (or Enter) ---------- */
let CARD_RES = null;
/* 📏 pk-7a cases#4 → Pokadif_cases.html */
/* 📏 pk-7a race#1 → Pokadif_race.html */
let RC = null;
/* 📏 pk-7a race#2 → Pokadif_race.html */
/* ================= 🧑 YOUR AVATAR = the detective (P6 rule: UI.buddy pictures, never painted in a loop) ================= */
const BD = {on: false, who: null, list: []};
function bdStart(){
  BD.list.forEach(b => b && b.stop()); BD.list = []; BD.on = false;
  const c = $('bd-det');
  if(typeof drawAvatar !== 'function' || !UI.buddy || !window.Acting){ $('det').classList.add('hidden'); return; }
  BD.who = {name: S.player, av: myAvatar(S.player)}; const b = UI.buddy(c, BD.who, {}); if(b) BD.list.push(b); BD.on = !!BD.list.length;
}
// 🎩 the detective hat sits on the head the picture really has (avatars differ: tall hair, hats, pets) — found from the painted pixels
function fitHat(cv, hat){
  if(!cv || !hat || !cv.width || cv.offsetParent === null) return;
  try{ const g = cv.getContext('2d'), w = cv.width, h = cv.height, px = g.getImageData(0, 0, w, h).data; let top = -1, xs = 0, xn = 0;
    for(let y = 0; y < h && top < 0; y++){ let n = 0; for(let x = 0; x < w; x++) if(px[(y * w + x) * 4 + 3] > 60) n++; if(n >= Math.max(4, w * 0.15)) top = y; }   // the first WIDE row = the head (not a ❓ mark or sparkles above it)
    if(top < 0) return;
    for(let y = top; y < Math.min(h, top + Math.max(3, h * 0.08)); y++) for(let x = 0; x < w; x++) if(px[(y * w + x) * 4 + 3] > 60){ xs += x; xn++; }
    const sc = cv.getBoundingClientRect().width / w, hh = hat.getBoundingClientRect().height || 12;
    hat.style.top = Math.round(top * sc - hh * 0.6) + 'px'; hat.style.left = Math.round((xn ? xs / xn : w / 2) * sc) + 'px'; hat.style.opacity = 1;
  }catch(e){}
}
setInterval(() => { if(G && !$('scr-play').classList.contains('hidden')) fitHat($('bd-det'), document.querySelector('#det .hat')); const r = $('res-av'); if(r && !$('result').classList.contains('hidden')) fitHat(r, document.querySelector('#res-det .hat')); }, 450);
function bdReact(mood, ms){ if(!BD.on) return false; let a = false; BD.list.forEach(b => { const x = b.react(mood, ms); if(x) a = x; }); return a; }

/* ================= INPUT ================= */
['A', 'B'].forEach(s => $(s === 'A' ? 'pic-a' : 'pic-b').addEventListener('pointerdown', e => onPoke(s, e)));
$('hint-btn').onclick = () => useHint();
document.addEventListener('keydown', e => { if(!G || G.over || $('scr-play').classList.contains('hidden')) return; if(e.key === 'h' || e.key === 'H'){ e.preventDefault(); useHint(); return; }
  if(G.mode !== 'detective') return;
  if(!$('scard').classList.contains('hidden') && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); if(CARD_RES && !G.paused) CARD_RES(); return; }
  const v = G.step && G.step.verb, D = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]}[e.key];
  if(v === 'walk' && D && G.walk){ e.preventDefault(); const x = G.walk.pos[0] + D[0], y = G.walk.pos[1] + D[1]; if(x >= 0 && y >= 0 && x < G.K.walk.cols && y < G.K.walk.rows) walkTo(x, y); }
  if(v === 'crack' && /^[1-9]$/.test(e.key)){ e.preventDefault(); crackKey(e.key); } if(v === 'crack' && e.key === 'Backspace'){ e.preventDefault(); crackKey('del'); } });
let LAST_SZ = '';
if(window.ResizeObserver) new ResizeObserver(() => { const b = $('board'), k = b.clientWidth + 'x' + b.clientHeight; if(k === LAST_SZ) return; LAST_SZ = k; if(G && !$('scr-play').classList.contains('hidden')) layout(); }).observe($('board'));
window.addEventListener('resize', () => { if(G && !$('scr-play').classList.contains('hidden')) layout(); });

/* ================= BOOT ================= */
/* ---------- boot with a watchdog (pk-3c, Aowu 14:27 "stuck sometime in loading"): a phone can lose a server answer
   (5G ↔ Wi-Fi, app in the background) — then neither handler ever runs and the loader spins forever.
   No answer after BOOT_WAIT → ask again quietly (twice); still nothing → a card with 🔄 Try again + ◀ Gameroom. Late answers are ignored once one has landed. ---------- */
const BOOT_WAIT = () => window.PK_BOOT_WAIT || 10000;
let BOOT_DONE = false, BOOT_SEQ = 0;
function bootStuck(on){
  let c = document.getElementById('boot-stuck');
  if(!on){ if(c) c.remove(); return; }
  if(c) return;
  c = document.createElement('div'); c.id = 'boot-stuck'; c.className = 'boot-stuck';
  c.innerHTML = '<div class="bs-in"><div class="bs-ic">🔍💤</div><h3>The detective file is taking too long</h3><p>The connection may have dropped for a moment.</p><div class="bs-btns"><button class="sp-btn sp-primary" id="bs-again" data-sound="pop">🔄 Try again</button><button class="sp-btn sp-secondary" id="bs-back" data-sound="tap">' + UI.esc(UI.backLabel ? UI.backLabel() : '◀ Gameroom') + '</button></div></div>';
  document.body.appendChild(c);
  document.getElementById('bs-again').onclick = () => { bootStuck(false); boot(0); };
  document.getElementById('bs-back').onclick = () => { if(UI.back) UI.back(WEBAPP_URL + '?page=gameroom'); else UI.go(WEBAPP_URL + '?page=gameroom'); };
}
function boot(tries){
  tries = tries || 0;
  if(!tries){ BOOT_DONE = false; UI.loading('pokadif'); }
  const seq = ++BOOT_SEQ; let answered = false;
  const timer = setTimeout(() => { if(answered || BOOT_DONE || seq !== BOOT_SEQ) return;
    if(tries < 2){ UI.toast('⏳ Still opening — asking again…'); boot(tries + 1); } else { UI.loaded(); bootStuck(true); } }, BOOT_WAIT());
  google.script.run.withSuccessHandler(d => {
      answered = true; clearTimeout(timer); if(BOOT_DONE) return; BOOT_DONE = true; bootStuck(false);
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.progressArc = d.progressArcade || {}; S.progressCase = d.progressCase || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {};
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      flushPending();
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)) choosePlayer(CURRENT_PLAYER); else { renderPlayers(); showScreen('player'); }
      if(UI.guideOnce) UI.guideOnce('pokadif', [UI.gameHelp(GAME_ID, 'Pokadif', '🔍')].filter(Boolean));
    }).withFailureHandler(() => {
      answered = true; clearTimeout(timer); if(BOOT_DONE) return;
      if(tries < 2 && seq === BOOT_SEQ){ setTimeout(() => { if(!BOOT_DONE) boot(tries + 1); }, 800); return; }
      BOOT_DONE = true; UI.loaded(); UI.toast('Could not load players — check the connection', 'err'); renderPlayers(); showScreen('player'); })
    .getLevelGameData(GAME_ID, CURRENT_PLAYER);
}
boot();
