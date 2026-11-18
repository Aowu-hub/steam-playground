
/* 📏 s4a tests#1 */
function tTime(h, m, L){ return L === 'th' ? h + '.' + pad2(m) + ' น.' : h + ':' + pad2(m); }
/* 📏 s4a tests#2 */
// ---------- 🪜 column working for + and − ----------
function colWork(a, b, op, L){
  const names = L === 'th' ? ['หลักหน่วย', 'หลักสิบ', 'หลักร้อย', 'หลักพัน'] : ['ones', 'tens', 'hundreds', 'thousands'], out = [], da = String(a).split('').reverse().map(Number), db = String(b).split('').reverse().map(Number);
  let c = 0;
  for(let i = 0; i < da.length; i++){ const x = da[i], y = db[i] || 0;
    if(op === 'add'){ const s = x + y + c; out.push(names[i] + ' ' + x + ' + ' + y + (c ? ' + 1' : '') + ' = ' + s + (s >= 10 && i < da.length - 1 ? (L === 'th' ? ' ทด 1' : ' carry 1') : '')); c = s >= 10 && i < da.length - 1 ? 1 : 0; }
    else { let xx = x - c; c = 0; if(xx < y){ xx += 10; c = 1; } if(i >= db.length && xx === 0 && i === da.length - 1) break; out.push(names[i] + ' ' + xx + ' − ' + y + ' = ' + (xx - y) + (c ? (L === 'th' ? ' (กระจายจากหลักถัดไป)' : ' (regroup 1 from the next place)') : '')); } }
  return out.join(' · ') + ' → ' + fN(op === 'add' ? a + b : a - b);
}
const TT_EN_PETS = ['Cat', 'Dog', 'Fish', 'Bird', 'Rabbit'], TT_TH_PETS = ['แมว', 'หมา', 'ปลา', 'นก', 'กระต่าย'];
const TT_FRUIT = {en: [['Apples', '🍎'], ['Bananas', '🍌'], ['Grapes', '🍇'], ['Mangoes', '🥭'], ['Oranges', '🍊']], th: [['แอปเปิล', '🍎'], ['กล้วย', '🍌'], ['องุ่น', '🍇'], ['มะม่วง', '🥭'], ['ส้ม', '🍊']]};
const TT_SHAPES = {en: {tri: 'triangle', sq: 'square', rect: 'rectangle', circ: 'circle', pent: 'pentagon', hex: 'hexagon'}, th: {tri: 'รูปสามเหลี่ยม', sq: 'รูปสี่เหลี่ยมจัตุรัส', rect: 'รูปสี่เหลี่ยมผืนผ้า', circ: 'วงกลม', pent: 'รูปห้าเหลี่ยม', hex: 'รูปหกเหลี่ยม'}};
// ---------- ➗ mq-t2: helpers for Grade 5–8 / ป.5–ม.2 (decimals, negatives, fractions as text) ----------
const tGcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while(b){ const t = a % b; a = b; b = t; } return a; };
const tLcm = (a, b) => a / tGcd(a, b) * b;
/* 📏 s4a tests#3 */
function tFr(n, d){ if(d < 0){ n = -n; d = -d; } const g = tGcd(n, d) || 1; n /= g; d /= g; if(d === 1) return tN(n);   // simplest form; improper → mixed number (1 1/2)
  const neg = n < 0, a = Math.abs(n), w = Math.floor(a / d), r = a % d; return (neg ? '−' : '') + (w ? w + ' ' : '') + r + '/' + d; }
const tSup = n => String(n).replace(/-/g, '⁻').replace(/[0-9]/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]);
const tMoney = c => '$' + Math.floor(c / 100).toLocaleString('en-US') + '.' + pad2(c % 100);   // cents → $48.60
const tPar = x => x < 0 ? '(' + tN(x) + ')' : tN(x);   // (−8) in sums
// 🖼️ more figures for grades 5–8: box, triangle, parallelogram, coordinate plane, right triangle, pie chart, cylinder, angles on a line, triangle angles
Object.assign(TF, {
  lab: (x, y, t, a, c) => '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="14" font-weight="800" text-anchor="' + (a || 'middle') + '" fill="' + (c || '#2a3247') + '">' + t + '</text>',
  box(l, w, h, u){ const k = Math.min(150 / (l + w * 0.5), 90 / (h + w * 0.5), 14), L = Math.max(60, l * k), H = Math.max(40, h * k), D = Math.max(22, w * k * 0.5), x = 64, y = 12 + D;   /* x: room for the height label */
    let s = '<polygon points="' + x + ',' + y + ' ' + (x + D) + ',' + (y - D) + ' ' + (x + L + D) + ',' + (y - D) + ' ' + (x + L) + ',' + y + '" fill="#dff0ff" stroke="#2a3247" stroke-width="2.5" stroke-linejoin="round"/>';
    s += '<polygon points="' + (x + L) + ',' + y + ' ' + (x + L + D) + ',' + (y - D) + ' ' + (x + L + D) + ',' + (y + H - D) + ' ' + (x + L) + ',' + (y + H) + '" fill="#a9d4ff" stroke="#2a3247" stroke-width="2.5" stroke-linejoin="round"/>';
    s += '<rect x="' + x + '" y="' + y + '" width="' + L.toFixed(1) + '" height="' + H.toFixed(1) + '" fill="#c9e6ff" stroke="#2a3247" stroke-width="2.5"/>';
    s += TF.lab(x + L / 2, y + H + 17, l + ' ' + u) + TF.lab(x - 5, y + H / 2 + 4, h + ' ' + u, 'end') + TF.lab(x + L + D + 6, y + H - D / 2 + 9, w + ' ' + u, 'start');   /* width: right of the back edge, off the slanted line */
    return TF.wrap(x + L + D + 70, y + H + 24, s, 'box'); },
  tri(b, h, u){ const k = Math.min(200 / b, 110 / h, 16), B = Math.max(170, b * k), H = Math.max(58, h * k), x = 12, y = 10 + H, ax = x + B * 0.22;
    let s = '<polygon points="' + x + ',' + y + ' ' + (x + B).toFixed(1) + ',' + y + ' ' + ax.toFixed(1) + ',' + (y - H).toFixed(1) + '" fill="#ffe2b8" stroke="#2a3247" stroke-width="2.5" stroke-linejoin="round"/>';
    s += '<line x1="' + ax.toFixed(1) + '" y1="' + (y - H).toFixed(1) + '" x2="' + ax.toFixed(1) + '" y2="' + y + '" stroke="#e5484d" stroke-width="2" stroke-dasharray="5 3"/><path d="M' + (ax + 9).toFixed(1) + ' ' + y + ' V' + (y - 9) + ' H' + ax.toFixed(1) + '" fill="none" stroke="#e5484d" stroke-width="1.5"/>';
    s += TF.lab(x + B / 2, y + 17, b + ' ' + u) + TF.lab(ax + 6, y - H * 0.34, h + ' ' + u, 'start', '#c0262d');
    return TF.wrap(x + B + 16, y + 24, s, 'triangle'); },
  para(b, h, u){ const k = Math.min(170 / b, 100 / h, 16), B = Math.max(140, b * k), H = Math.max(46, h * k), sh = Math.min(50, B * 0.3), x = 10, y = 10 + H;
    let s = '<polygon points="' + x + ',' + y + ' ' + (x + B).toFixed(1) + ',' + y + ' ' + (x + B + sh).toFixed(1) + ',' + (y - H).toFixed(1) + ' ' + (x + sh).toFixed(1) + ',' + (y - H).toFixed(1) + '" fill="#d6f5d0" stroke="#2a3247" stroke-width="2.5" stroke-linejoin="round"/>';
    s += '<line x1="' + (x + sh).toFixed(1) + '" y1="' + (y - H).toFixed(1) + '" x2="' + (x + sh).toFixed(1) + '" y2="' + y + '" stroke="#e5484d" stroke-width="2" stroke-dasharray="5 3"/>';
    s += TF.lab(x + B / 2, y + 17, b + ' ' + u) + TF.lab(x + sh + 6, y - H / 2 + 4, h + ' ' + u, 'start', '#c0262d');
    return TF.wrap(x + B + sh + 12, y + 24, s, 'parallelogram'); },
  plane(pts, lo, hi){ const c = 22, X = v => 30 + (v - lo) * c, Y = v => 34 + (hi - v) * c; let s = '';   /* numbers every 2 lines in 15px type: still readable when the card shrinks the picture */
    for(let v = lo; v <= hi; v++) s += '<line x1="' + X(v) + '" x2="' + X(v) + '" y1="' + Y(hi) + '" y2="' + Y(lo) + '" stroke="#dde3ee" stroke-width="1"/><line y1="' + Y(v) + '" y2="' + Y(v) + '" x1="' + X(lo) + '" x2="' + X(hi) + '" stroke="#dde3ee" stroke-width="1"/>';
    s += '<line x1="' + X(lo) + '" x2="' + X(hi) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="#2a3247" stroke-width="2"/><line x1="' + X(0) + '" x2="' + X(0) + '" y1="' + Y(hi) + '" y2="' + Y(lo) + '" stroke="#2a3247" stroke-width="2"/>';
    for(let v = lo; v <= hi; v++) if(v && v % 2 === 0) s += '<text x="' + X(v) + '" y="' + (Y(0) + 19) + '" font-size="15" font-weight="800" text-anchor="middle" fill="#555">' + tN(v) + '</text><text x="' + (X(0) - 7) + '" y="' + (Y(v) + 5) + '" font-size="15" font-weight="800" text-anchor="end" fill="#555">' + tN(v) + '</text>';
    s += '<text x="' + (X(hi) + 5) + '" y="' + (Y(0) + 5) + '" font-size="15" font-weight="800">x</text><text x="' + (X(0) + 6) + '" y="' + (Y(hi) - 6) + '" font-size="15" font-weight="800">y</text>';
    pts.forEach(p => { const up = p.y > 0, right = p.x > 0; s += '<circle cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="6" fill="#e5484d" stroke="#fff" stroke-width="1.5"/>' + '<text x="' + (X(p.x) + (right ? 9 : -9)) + '" y="' + (Y(p.y) + (up ? -9 : 21)) + '" font-size="17" font-weight="900" text-anchor="' + (right ? 'start' : 'end') + '" fill="#c0262d">' + p.lab + '</text>'; });
    return TF.wrap(X(hi) + 30, Y(lo) + 32, s, 'coordinate plane'); },
  rtri(a, b, c, u, miss){ const k = Math.min(170 / a, 110 / b), A = Math.max(64, a * k), B = Math.max(48, b * k), x = 64,   /* true proportions (3-4-5 looks 3 : 4) */ y = 10 + B, t = key => key === miss ? '?' : {a, b, c}[key] + ' ' + u;   /* the side's length, or ? for the one to find */
    let s = '<polygon points="' + x + ',' + y + ' ' + (x + A).toFixed(1) + ',' + y + ' ' + x + ',' + (y - B).toFixed(1) + '" fill="#f1e2ff" stroke="#2a3247" stroke-width="2.5" stroke-linejoin="round"/><path d="M' + (x + 11) + ' ' + y + ' V' + (y - 11) + ' H' + x + '" fill="none" stroke="#2a3247" stroke-width="1.5"/>';
    s += TF.lab(x + A / 2, y + 17, t('a'), 'middle', miss === 'a' ? '#c0262d' : 0) + TF.lab(x - 5, y - B / 2 + 4, t('b'), 'end', miss === 'b' ? '#c0262d' : 0) + TF.lab(x + A / 2 + 8, y - B / 2 - 4, t('c'), 'start', miss === 'c' ? '#c0262d' : 0);
    return TF.wrap(x + A + 84, y + 24, s.replace(/fill="0"/g, 'fill="#2a3247"'), 'right triangle'); },
  pie(sl){ let s = '', a0 = -Math.PI / 2; const cols = ['#5aa9ff', '#ffb347', '#7ed957', '#ff7aa8', '#b48cff'];
    sl.forEach((p, i) => { const a1 = a0 + p.pct / 100 * 2 * Math.PI, big = p.pct > 50 ? 1 : 0, m = (a0 + a1) / 2;
      s += '<path d="M70 70 L' + (70 + 60 * Math.cos(a0)).toFixed(1) + ' ' + (70 + 60 * Math.sin(a0)).toFixed(1) + ' A60 60 0 ' + big + ' 1 ' + (70 + 60 * Math.cos(a1)).toFixed(1) + ' ' + (70 + 60 * Math.sin(a1)).toFixed(1) + ' Z" fill="' + cols[i % 5] + '" stroke="#fff" stroke-width="2"/>';
      s += p.pct <= 12 ? '<text x="' + (70 + 45 * Math.cos(m)).toFixed(1) + '" y="' + (70 + 45 * Math.sin(m) + 4).toFixed(1) + '" font-size="11" font-weight="800" text-anchor="middle" fill="#2a3247">' + p.pct + '%</text>' : TF.lab(70 + 38 * Math.cos(m), 70 + 38 * Math.sin(m) + 4, p.pct + '%');   /* small slices: smaller label, further out */
      s += '<rect x="144" y="' + (14 + i * 24) + '" width="14" height="14" rx="3" fill="' + cols[i % 5] + '"/>' + TF.lab(164, 26 + i * 24, p.label, 'start'); a0 = a1; });
    return TF.wrap(250, Math.max(140, sl.length * 24 + 20), s, 'pie chart'); },
  cyl(r, h, u){ const k = Math.min(60 / r, 110 / h, 12), R = r * k, H = h * k, x = 20 + R, ry = Math.max(8, R * 0.3), y = ry + 30;   /* radius label sits above the top */
    let s = '<path d="M' + (x - R) + ' ' + y + ' V' + (y + H) + ' A' + R + ' ' + ry + ' 0 0 0 ' + (x + R) + ' ' + (y + H) + ' V' + y + '" fill="#c9e6ff" stroke="#2a3247" stroke-width="2.5"/><ellipse cx="' + x + '" cy="' + y + '" rx="' + R + '" ry="' + ry + '" fill="#dff0ff" stroke="#2a3247" stroke-width="2.5"/>';
    s += '<line x1="' + x + '" y1="' + y + '" x2="' + (x + R) + '" y2="' + y + '" stroke="#e5484d" stroke-width="2"/>' + TF.lab(x + R / 2, y - ry - 11, r + ' ' + u, 'middle', '#c0262d') + TF.lab(x + R + 6, y + H / 2 + 4, h + ' ' + u, 'start');
    return TF.wrap(x + R + 70, y + H + ry + 8, s, 'cylinder'); },
  // a label for an angle at P between unit directions u and v: on the bisector, out where the opening is wide enough for the text
  angLab(P, u, v, t, c, arc, out){ const bx = u[0] + v[0], by = u[1] + v[1], bl = Math.hypot(bx, by) || 1, half = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1]))) / 2, d = Math.max(36, Math.min(104, 23 / Math.max(Math.sin(half), 0.05)));
    let s = ''; if(arc){ const r = 16, a0 = [P[0] + r * u[0], P[1] + r * u[1]], a1 = [P[0] + r * v[0], P[1] + r * v[1]], sw = u[0] * v[1] - u[1] * v[0] > 0 ? 1 : 0; s += '<path d="M' + a0[0].toFixed(1) + ' ' + a0[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 0 ' + sw + ' ' + a1[0].toFixed(1) + ' ' + a1[1].toFixed(1) + '" fill="none" stroke="' + (c || '#2a3247') + '" stroke-width="1.6"/>'; }
    return s + (out ? TF.lab(P[0] - 18 * bx / bl, P[1] - 18 * by / bl + 5, t, 'middle', c) : TF.lab(P[0] + d * bx / bl, P[1] + d * by / bl + 5, t, 'middle', c)); },   /* out: a wide angle gets its label just outside the corner */
  line2(deg, known){ const a = deg * Math.PI / 180, cx = 120, cy = 112, R = [Math.cos(a), -Math.sin(a)]; let s = '<line x1="8" y1="' + cy + '" x2="232" y2="' + cy + '" stroke="#2a3247" stroke-width="4" stroke-linecap="round"/><line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + 100 * R[0]).toFixed(1) + '" y2="' + (cy + 100 * R[1]).toFixed(1) + '" stroke="#2a3247" stroke-width="4" stroke-linecap="round"/>';
    s += TF.angLab([cx, cy], [1, 0], R, known ? deg + '°' : '?', known ? '#2a3247' : '#c0262d', true) + TF.angLab([cx, cy], R, [-1, 0], known ? '?' : deg + '°', known ? '#c0262d' : '#2a3247', true);
    return TF.wrap(240, 124, s + '<circle cx="' + cx + '" cy="' + cy + '" r="3.5" fill="#2a3247"/>', 'angles on a line'); },
  triA(A, B){ let dA = Math.max(A, 45), dB = Math.max(B, 45); if(dA + dB > 150){ const f = 150 / (dA + dB); dA *= f; dB *= f; }   /* drawn angles: wide enough for the labels, not to scale */
    const pA = [14, 124], pB = [226, 124], ta = Math.tan(dA * Math.PI / 180), tb = Math.tan(dB * Math.PI / 180), px = (212 * tb) / (ta + tb), py = Math.min(px * ta, 104), C = [14 + px, 124 - py];
    const un = (P, Q) => { const dx = Q[0] - P[0], dy = Q[1] - P[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
    let s = '<polygon points="' + pA.join(',') + ' ' + pB.join(',') + ' ' + C[0].toFixed(1) + ',' + C[1].toFixed(1) + '" fill="#ffe2b8" stroke="#2a3247" stroke-width="2.5" stroke-linejoin="round"/>';
    s += TF.angLab(pA, un(pA, pB), un(pA, C), A + '°', 0, true) + TF.angLab(pB, un(pB, C), un(pB, pA), B + '°', 0, true) + TF.angLab(C, un(C, pA), un(C, pB), '?', '#c0262d', true, 180 - dA - dB >= 100);
    return TF.wrap(240, 136, s, 'triangle angles'); }
});
// ---------- ➗ mq-t3: helpers for Grade 9–12 / ม.3–ม.6 ----------
const tSupX = s => String(s).replace(/[0-9x+n\-−]/g, c => ({'+': '⁺', '-': '⁻', '−': '⁻', x: 'ˣ', n: 'ⁿ'})[c] || '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]);
const tSub = s => String(s).replace(/[0-9]/g, c => '₀₁₂₃₄₅₆₇₈₉'[c]);
// polynomial text from [coef, power] pairs: [[1, 2], [-5, 1], [6, 0]] → "x² − 5x + 6" (v = the letter)
function tPoly(terms, v){ v = v || 'x'; let out = '';
  terms.forEach(([c, p]) => { if(!c) return; const neg = c < 0, a = Math.abs(c), body = p === 0 ? String(a) : (a === 1 ? '' : a) + v + (p === 1 ? '' : tSup(p));
    out += out ? (neg ? ' − ' : ' + ') + body : (neg ? '−' : '') + body; });
  return out || '0'; }
const tLin = (m, b) => 'y = ' + tPoly([[m, 1], [b, 0]]);   // y = 2x − 3
const tFac = r => '(x ' + (r < 0 ? '+ ' + (-r) : '− ' + r) + ')';   // root 3 → (x − 3)
const tPt = (a, b) => '(' + tN(a) + ', ' + tN(b) + ')';
const tCx = (re, im) => im === 0 ? tN(re) : (re ? tN(re) + (im < 0 ? ' − ' : ' + ') : (im < 0 ? '−' : '')) + (Math.abs(im) === 1 ? '' : Math.abs(im)) + 'i';   // 7 − 4i
const TRIG_V = {sin: {0: '0', 30: '1/2', 45: '√2/2', 60: '√3/2', 90: '1'}, cos: {0: '1', 30: '√3/2', 45: '√2/2', 60: '1/2', 90: '0'}, tan: {0: '0', 30: '√3/3', 45: '1', 60: '√3'}};
// 🖼️ figures for grades 9–12: right triangle with θ, similar triangles, inscribed angle, cone, pyramid, sphere, 2×2 matrix
Object.assign(TF, {
  rtriA(a, b, c, u){ const k = Math.min(170 / a, 110 / b), A = Math.max(64, a * k), B = Math.max(48, b * k), x = 64,   /* true proportions (3-4-5 looks 3 : 4) */ y = 12 + B, P = [x + A, y], hl = Math.hypot(A, B);
    let s = '<polygon points="' + x + ',' + y + ' ' + (x + A).toFixed(1) + ',' + y + ' ' + x + ',' + (y - B).toFixed(1) + '" fill="#f1e2ff" stroke="#2a3247" stroke-width="2.5" stroke-linejoin="round"/><path d="M' + (x + 11) + ' ' + y + ' V' + (y - 11) + ' H' + x + '" fill="none" stroke="#2a3247" stroke-width="1.5"/>';
    s += TF.lab(x + A / 2, y + 19, a + ' ' + u) + TF.lab(x - 6, y - B / 2 + 5, b + ' ' + u, 'end') + TF.lab(x + A / 2 + 10, y - B / 2 - 6, c + ' ' + u, 'start');
    s += TF.angLab(P, [-1, 0], [-A / hl, -B / hl], 'θ', '#c0262d', true, true);   /* θ just outside its own corner (a narrow angle has no room inside) */
    return TF.wrap(x + A + 86, y + 26, s, 'right triangle'); },
  sim(s1, k, miss, u){ const t = (v, i) => i === miss ? '?' : v + ' ' + u, sc = 7, tri = (ox, f, big) => { const a = s1[0] * sc * f, h = Math.max(s1[1] * sc * f, (big ? k : 1) * 40), y = Y0, top = [ox + a * 0.25, y - h];
      let s = '<polygon points="' + ox + ',' + y + ' ' + (ox + a).toFixed(1) + ',' + y + ' ' + top[0].toFixed(1) + ',' + top[1].toFixed(1) + '" fill="' + (big ? '#ffe2b8' : '#dff0ff') + '" stroke="#2a3247" stroke-width="2.5" stroke-linejoin="round"/>';
      const L = big ? [s1[0] * k, s1[1] * k] : s1, off = big ? 2 : 0;
      s += TF.lab(ox + a / 2, y + 19, t(L[0], off), 'middle', miss === off ? '#c0262d' : 0) + TF.lab(ox + a * 0.125 - 12, y - h / 2 + 5, t(L[1], off + 1), 'end', miss === off + 1 ? '#c0262d' : 0);
      return {s, w: a}; };
    const f1 = Math.min(1, 90 / (s1[0] * sc), 60 / (s1[1] * sc)), Y0 = 16 + k * Math.max(s1[1] * sc * f1, 40), A1 = tri(70, f1, false), A2 = tri(70 + A1.w + 90, f1 * k, true);
    return TF.wrap(70 + A1.w + 90 + A2.w + 20, Y0 + 28, A1.s + A2.s, 'similar triangles'); },
  circAng(cen, askIns){ const cx = 110, cy = 100, R = 76, a0 = -Math.PI / 2 + Math.PI, P = d => [cx + R * Math.cos(d), cy + R * Math.sin(d)];
    const half = cen * Math.PI / 360, A = P(Math.PI / 2 - half), B = P(Math.PI / 2 + half), C = P(-Math.PI / 2), un = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
    let s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#f4fbff" stroke="#2a3247" stroke-width="2.5"/>';
    [[cx, cy, A], [cx, cy, B], [C[0], C[1], A], [C[0], C[1], B]].forEach(([x1, y1, p], i) => { s += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="' + (i < 2 ? '#2f6fd0' : '#2a3247') + '" stroke-width="2.2"/>'; });
    s += TF.angLab([cx, cy], un([cx, cy], A), un([cx, cy], B), askIns ? cen + '°' : '?', askIns ? '#2f6fd0' : '#c0262d', true) + TF.angLab(C, un(C, A), un(C, B), askIns ? '?' : cen / 2 + '°', askIns ? '#c0262d' : '#2a3247', true);
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#2a3247"/>';   /* the dot is O */
    return TF.wrap(220, 196, s, 'circle angles'); },
  cone(r, h, u){ const k = Math.min(60 / r, 120 / h, 14), R = Math.max(30, r * k), H = Math.max(60, h * k), cx = 30 + R, y = 22 + H, ry = Math.max(8, R * 0.28);
    let s = '<path d="M' + (cx - R) + ' ' + y + ' L' + cx + ' ' + (y - H) + ' L' + (cx + R) + ' ' + y + '" fill="#ffe2b8" stroke="#2a3247" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="' + cx + '" cy="' + y + '" rx="' + R + '" ry="' + ry + '" fill="#ffd59a" stroke="#2a3247" stroke-width="2.5"/>';
    s += '<line x1="' + cx + '" y1="' + (y - H) + '" x2="' + cx + '" y2="' + y + '" stroke="#e5484d" stroke-width="2" stroke-dasharray="5 3"/><line x1="' + cx + '" y1="' + y + '" x2="' + (cx + R) + '" y2="' + y + '" stroke="#2f6fd0" stroke-width="2"/>';
    s += TF.lab(cx + R / 2, y + ry + 18, r + ' ' + u, 'middle', '#2f6fd0') + TF.lab(cx + R + 10, y - H / 2 + 5, 'h = ' + h + ' ' + u, 'start', '#c0262d');
    return TF.wrap(cx + R + 110, y + ry + 26, s, 'cone'); },
  pyr(sd, h, u){ const k = Math.min(110 / sd, 110 / h, 14), S = Math.max(70, sd * k), H = Math.max(70, h * k), x = 20, y = 30 + H, d = S * 0.35, ap = [x + S / 2 + d / 2, y - H];
    let s = '<polygon points="' + x + ',' + y + ' ' + (x + S) + ',' + y + ' ' + (x + S + d) + ',' + (y - d) + ' ' + (x + d) + ',' + (y - d) + '" fill="#d6f5d0" stroke="#2a3247" stroke-width="2" stroke-linejoin="round"/>';
    [[x, y], [x + S, y], [x + S + d, y - d]].forEach(p => { s += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + ap[0].toFixed(1) + '" y2="' + ap[1] + '" stroke="#2a3247" stroke-width="2.5"/>'; });
    s += '<line x1="' + ap[0].toFixed(1) + '" y1="' + ap[1] + '" x2="' + ap[0].toFixed(1) + '" y2="' + (y - d / 2).toFixed(1) + '" stroke="#e5484d" stroke-width="2" stroke-dasharray="5 3"/>';
    s += TF.lab(x + S / 2, y + 19, sd + ' ' + u) + TF.lab(x + S + d + 10, y - H / 2, 'h = ' + h + ' ' + u, 'start', '#c0262d');
    return TF.wrap(x + S + d + 120, y + 26, s, 'pyramid'); },
  sph(r, u){ const R = 64, cx = 84, cy = 84;
    let s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#dff0ff" stroke="#2a3247" stroke-width="2.5"/><path d="M' + (cx - R) + ' ' + cy + ' A' + R + ' 18 0 0 0 ' + (cx + R) + ' ' + cy + '" fill="none" stroke="#2a3247" stroke-width="1.8"/><path d="M' + (cx - R) + ' ' + cy + ' A' + R + ' 18 0 0 1 ' + (cx + R) + ' ' + cy + '" fill="none" stroke="#2a3247" stroke-width="1.2" stroke-dasharray="4 3"/>';
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + R * 0.72).toFixed(1) + '" y2="' + (cy - R * 0.69).toFixed(1) + '" stroke="#e5484d" stroke-width="2.2"/><circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#2a3247"/>' + TF.lab(cx + R + 12, cy - R * 0.55, 'r = ' + r + ' ' + u, 'start', '#c0262d');
    return TF.wrap(cx + R + 110, cy + R + 10, s, 'sphere'); },
  mat(m){ const w = 46, h = 34, x = 30, y = 14, H = h * 2 + 8, W = w * 2 + 8;
    let s = '<path d="M' + (x + 8) + ' ' + y + ' H' + x + ' V' + (y + H) + ' H' + (x + 8) + '" fill="none" stroke="#2a3247" stroke-width="3"/><path d="M' + (x + W + 12) + ' ' + y + ' H' + (x + W + 20) + ' V' + (y + H) + ' H' + (x + W + 12) + '" fill="none" stroke="#2a3247" stroke-width="3"/>';
    m.forEach((row, i) => row.forEach((v, j) => { s += '<text x="' + (x + 14 + w / 2 + j * w).toFixed(1) + '" y="' + (y + 25 + i * (h + 8)) + '" font-size="20" font-weight="800" text-anchor="middle" fill="#2a3247">' + tN(v) + '</text>'; }));
    return TF.wrap(x + W + 50, y + H + 14, s, 'matrix'); }
});
// ---------- the topics ----------
const TESTS = [
  // ===== Grade 1 / ป.1 =====
  {id: 'a1add', g: 1, mk: (R, L) => { const a = R.r(2, 9), b = R.r(2, 9), s = a + b;
    return {q: L === 'th' ? `${a} + ${b} = □  □ แทนจำนวนใด` : `What is ${a} + ${b}?`, a: s, o: [s - 1, s + 1, Math.abs(a - b), s + 10], how: L === 'th' ? `นับต่อจาก ${a} ไปอีก ${b} → ${s}` : `Count on ${b} from ${a} → ${s}.`}; }},
  {id: 'a1sub', g: 1, mk: (R, L) => { const a = R.r(10, 18), b = R.r(2, 9), d = a - b;
    return {q: L === 'th' ? `${a} − ${b} = □  □ แทนจำนวนใด` : `What is ${a} − ${b}?`, a: d, o: [d + 1, d - 1, a + b], how: L === 'th' ? `นับถอยหลังจาก ${a} ไป ${b} → ${d}` : `Count back ${b} from ${a} → ${d}.`}; }},
  {id: 'a1miss', g: 1, mk: (R, L) => { const a = R.r(3, 9), s = R.r(a + 2, Math.min(20, a + 10));
    return {q: L === 'th' ? `${a} + □ = ${s}  □ แทนจำนวนใด` : `${a} + □ = ${s}. What number goes in the box?`, a: s - a, o: [s + a, s - a + 1, s - a - 1, s], how: L === 'th' ? `${s} − ${a} = ${s - a} ดังนั้น ${a} + ${s - a} = ${s}` : `${s} − ${a} = ${s - a}, so ${a} + ${s - a} = ${s}.`,
      say: L === 'th' ? `${a} บวก อะไร เท่ากับ ${s}` : `${a} plus what number equals ${s}?`}; }},
  {id: 'a1tens', g: 1, mk: (R, L) => { const t = R.r(1, 8), o = R.r(1, 9), n = 10 * t + o, fig = Math.random() < 0.6;
    return {q: fig ? (L === 'th' ? 'จากภาพ มีบล็อกทั้งหมดเท่าไร (แท่งยาว 1 แท่ง = 10)' : 'How many blocks are there? (Each long rod is 10.)') : (L === 'th' ? `จำนวนที่มี ${t} สิบ และ ${o} หน่วย คือจำนวนใด` : `What number has ${t} tens and ${o} ones?`),
      fig: fig ? TF.blocks(t, o) : null, a: n, o: [10 * o + t, t + o, n + 10], how: L === 'th' ? `${t} สิบ = ${10 * t} และ ${o} หน่วย = ${o} → ${10 * t} + ${o} = ${n}` : `${t} tens = ${10 * t} and ${o} ones = ${o} → ${10 * t} + ${o} = ${n}.`}; }},
  {id: 'a1cmp', g: 1, mk: (R, L) => { const x = R.r(10, 99); let y = R.r(10, 99); if(Math.random() < 0.4 && x % 10 && Math.floor(x / 10) !== x % 10) y = (x % 10) * 10 + Math.floor(x / 10); if(y === x) return null;
    const sg = x > y ? '>' : '<', tx = Math.floor(x / 10), ty = Math.floor(y / 10);
    return {q: L === 'th' ? `ควรเติมเครื่องหมายใดใน □   ${x} □ ${y}` : `Which sign makes this true?   ${x} □ ${y}`, a: sg, o: [sg === '>' ? '<' : '>', '='],
      how: tx !== ty ? (L === 'th' ? `เทียบหลักสิบก่อน: ${tx} สิบ กับ ${ty} สิบ → ${x} ${sg} ${y}` : `Compare the tens first: ${tx} tens and ${ty} tens → ${x} ${sg} ${y}.`) : (L === 'th' ? `หลักสิบเท่ากัน เทียบหลักหน่วย: ${x % 10} กับ ${y % 10} → ${x} ${sg} ${y}` : `Same tens, so compare the ones: ${x % 10} and ${y % 10} → ${x} ${sg} ${y}.`),
      say: L === 'th' ? `${x} กับ ${y} ควรใช้เครื่องหมายใด` : `Which sign goes between ${x} and ${y}?`}; }},
  {id: 'a1clock', g: 1, mk: (R, L) => { const h = R.r(1, 12), m = R.pick([0, 30]), nx = h % 12 + 1;
    return {q: L === 'th' ? 'นาฬิกาบอกเวลาเท่าไร' : 'What time does the clock show?', fig: TF.clock(h, m), a: tTime(h, m, L), o: [tTime(nx, m, L), tTime(h, 30 - m, L), tTime(h === 1 ? 12 : h - 1, m, L)],
      how: m ? (L === 'th' ? `เข็มสั้นอยู่ระหว่าง ${h} กับ ${nx} เข็มยาวชี้เลข 6 → ${tTime(h, 30, L)}` : `The short hand is between ${h} and ${nx}, the long hand points to 6 → half past ${h} = ${h}:30.`) : (L === 'th' ? `เข็มสั้นชี้เลข ${h} เข็มยาวชี้เลข 12 → ${tTime(h, 0, L)}` : `The short hand points to ${h}, the long hand to 12 → ${h} o'clock = ${h}:00.`)}; }},
  {id: 'a1pict', g: 1, mk: (R, L) => { const F = shuffle(TT_FRUIT[L].slice()).slice(0, 3), n = F.map(() => R.r(1, 8)); if(n[0] === n[1]) return null; const [i, j] = n[0] > n[1] ? [0, 1] : [1, 0], d = n[i] - n[j];
    return {q: L === 'th' ? `แผนภูมิรูปภาพแสดงผลไม้ที่นักเรียนชอบ นักเรียนที่ชอบ${F[i][0]}มากกว่านักเรียนที่ชอบ${F[j][0]}กี่คน` : `The picture graph shows the fruit children like. How many more children like ${F[i][0].toLowerCase()} than ${F[j][0].toLowerCase()}?`,
      fig: TF.pict(F.map((f, k) => ({label: f[0], icon: f[1], n: n[k]})), L === 'th' ? '1 รูป แทน นักเรียน 1 คน' : 'Each picture = 1 child'), a: d, o: [n[i], n[j], n[i] + n[j]],
      how: L === 'th' ? `${F[i][0]} ${n[i]} คน ${F[j][0]} ${n[j]} คน → ${n[i]} − ${n[j]} = ${d}` : `${F[i][0]}: ${n[i]}, ${F[j][0].toLowerCase()}: ${n[j]} → ${n[i]} − ${n[j]} = ${d}.`}; }},
  {id: 'a1shape', g: 1, mk: (R, L) => { const k = R.pick(['tri', 'sq', 'rect', 'circ', 'pent', 'hex']), names = TT_SHAPES[L];
    if(k !== 'circ' && Math.random() < 0.5){ const n = {tri: 3, sq: 4, rect: 4, pent: 5, hex: 6}[k];
      return {q: L === 'th' ? 'รูปนี้มีด้านกี่ด้าน' : 'How many sides does this shape have?', fig: TF.shape(k), a: n, o: [n + 1, n - 1, n + 2], how: L === 'th' ? `นับด้านตรงได้ ${n} ด้าน` : `Count the straight sides: ${n}.`}; }
    return {q: L === 'th' ? 'รูปนี้คือรูปอะไร' : 'What is the name of this shape?', fig: TF.shape(k), a: names[k], o: shuffle(Object.keys(names).filter(x => x !== k)).map(x => names[x]),
      how: L === 'th' ? `${names[k]}` + ({tri: ' มี 3 ด้าน', sq: ' มี 4 ด้านยาวเท่ากัน', rect: ' มี 4 ด้าน ด้านตรงข้ามยาวเท่ากัน', circ: ' ไม่มีด้านตรง ไม่มีมุม', pent: ' มี 5 ด้าน', hex: ' มี 6 ด้าน'}[k]) : `A ${names[k]}` + ({tri: ' has 3 sides.', sq: ' has 4 equal sides.', rect: ' has 4 sides, opposite sides equal.', circ: ' is round — no sides, no corners.', pent: ' has 5 sides.', hex: ' has 6 sides.'}[k])}; }},
  {id: 'a1ruler', g: 1, mk: (R, L) => { const len = R.r(3, 11), inch = L === 'en' && Math.random() < 0.4, u = inch ? 'inches' : L === 'th' ? 'เซนติเมตร' : 'centimeters';
    return {q: L === 'th' ? 'สีเทียนยาวกี่เซนติเมตร' : `How long is the crayon, in ${u}?`, fig: TF.ruler(len, 12, inch ? 'in' : 'cm'), a: len, o: [len + 1, len - 1, 12], how: L === 'th' ? `เริ่มที่ 0 สิ้นสุดที่ ${len} → ยาว ${len} เซนติเมตร` : `It starts at 0 and ends at ${len} → ${len} ${u}.`}; }},
  {id: 'a1patt', g: 1, mk: (R, L) => { const s = R.r(1, 12), d = R.r(2, 5), seq = [0, 1, 2, 3].map(i => s + i * d), nx = s + 4 * d;
    return {q: L === 'th' ? `จำนวนถัดไปคือจำนวนใด   ${seq.join(', ')}, □` : `What number comes next?   ${seq.join(', ')}, □`, a: nx, o: [nx + 1, seq[3] + 1, nx + d], how: L === 'th' ? `เพิ่มขึ้นทีละ ${d}: ${seq[3]} + ${d} = ${nx}` : `Each number is ${d} more: ${seq[3]} + ${d} = ${nx}.`,
      say: L === 'th' ? `${seq.join(' ')} จำนวนถัดไปคือ` : `${seq.join(', ')}. What comes next?`}; }},
  {id: 'a1money', g: 1, only: 'th', mk: (R, L) => { const list = []; let t = 0; const n = R.r(3, 6); for(let i = 0; i < n; i++){ const v = R.pick([100, 50, 20, 10, 5, 2, 1]); if(t + v > 300) continue; list.push(v); t += v; } if(list.length < 3) return null; list.sort((a, b) => b - a);
    return {q: 'จากภาพ มีเงินทั้งหมดกี่บาท', fig: TF.money(list, 'th'), a: t, o: [t + 10, t - 5, list.length, t + 1], how: `นับรวม ${list.join(' + ')} = ${t} บาท`}; }},
  // ===== Grade 2 / ป.2 =====
  {id: 'a2add', g: 2, mk: (R, L) => { let a, b; for(let k = 0; k < 30; k++){ a = R.r(15, 79); b = R.r(12, 98 - a); if(b >= 10 && a % 10 + b % 10 >= 10) break; } if(!(b >= 10 && a % 10 + b % 10 >= 10)) return null; const s = a + b;
    return {q: L === 'th' ? `${a} + ${b} = □  □ แทนจำนวนใด` : `What is ${a} + ${b}?`, a: s, o: [s - 10, s + 10, s + 1], how: colWork(a, b, 'add', L)}; }},
  {id: 'a2sub', g: 2, mk: (R, L) => { let a, b; for(let k = 0; k < 30; k++){ a = R.r(41, 98); b = R.r(12, a - 10); if(a % 10 < b % 10) break; } if(!(a % 10 < b % 10)) return null; const d = a - b, wrong = 10 * (Math.floor(a / 10) - Math.floor(b / 10)) + (b % 10 - a % 10);
    return {q: L === 'th' ? `${a} − ${b} = □  □ แทนจำนวนใด` : `What is ${a} − ${b}?`, a: d, o: [wrong, d + 10, d - 1], how: colWork(a, b, 'sub', L)}; }},
  {id: 'a2place', g: 2, mk: (R, L) => { let ds; do { ds = [R.r(1, 9), R.r(0, 9), R.r(0, 9)]; } while(new Set(ds).size < 3 || ds.includes(0)); const n = ds[0] * 100 + ds[1] * 10 + ds[2], i = R.r(0, 1), dg = ds[i], val = dg * (i === 0 ? 100 : 10);
    return {q: L === 'th' ? `เลขโดด ${dg} ใน ${n} มีค่าเท่าใด` : `What is the value of the digit ${dg} in ${n}?`, a: val, o: [dg, i === 0 ? dg * 10 : dg * 100, dg * 1000], how: L === 'th' ? `${dg} อยู่ในหลัก${i === 0 ? 'ร้อย' : 'สิบ'} → มีค่า ${val}` : `${dg} is in the ${i === 0 ? 'hundreds' : 'tens'} place → ${val}.`}; }},
  {id: 'a2odd', g: 2, mk: (R, L) => { const odd = Math.random() < 0.5, pick = () => { let x; do { x = R.r(11, 99); } while((x % 2 === 1) !== odd); return x; }, other = () => { let x; do { x = R.r(11, 99); } while((x % 2 === 1) === odd); return x; };
    const a = pick(), o = []; while(o.length < 3){ const x = other(); if(!o.includes(x)) o.push(x); }
    return {q: L === 'th' ? `จำนวนใดเป็นจำนวน${odd ? 'คี่' : 'คู่'}` : `Which number is ${odd ? 'odd' : 'even'}?`, a: String(a), o: o.map(String), how: L === 'th' ? `${a} มีหลักหน่วยเป็น ${a % 10} → เป็นจำนวน${odd ? 'คี่' : 'คู่'}` : `${a} ends in ${a % 10} → ${odd ? 'odd' : 'even'}.`}; }},
  {id: 'a2coins', g: 2, only: 'en', mk: (R, L) => { const list = []; let t = 0; const n = R.r(3, 7); for(let i = 0; i < n; i++){ const v = R.pick([25, 25, 10, 10, 5, 1]); if(t + v > 99) continue; list.push(v); t += v; } if(list.length < 3) return null; list.sort((a, b) => b - a);
    return {q: 'How much money is shown?', fig: TF.money(list, 'en'), a: t + '¢', o: [(t + 5) + '¢', list.length + '¢', (t - 10) + '¢', (t + 10) + '¢'], how: `Add the coins: ${list.map(v => v + '¢').join(' + ')} = ${t}¢.`}; }},
  {id: 'a2clock', g: 2, mk: (R, L) => { const h = R.r(1, 12), m = 5 * R.r(1, 11); if(m === 30) return null; const nx = h % 12 + 1;
    return {q: L === 'th' ? 'นาฬิกาบอกเวลาเท่าไร' : 'What time does the clock show?', fig: TF.clock(h, m), a: tTime(h, m, L), o: [tTime(h, m / 5, L), tTime(nx, m, L), tTime(h, (m + 30) % 60, L)],
      how: L === 'th' ? `เข็มสั้นเลย ${h} มาแล้ว → ${h} นาฬิกา · เข็มยาวชี้เลข ${m / 5}: ${m / 5} × 5 = ${m} นาที → ${tTime(h, m, L)}` : `The short hand is past ${h} → ${h}. The long hand points to ${m / 5}: ${m / 5} × 5 = ${m} minutes → ${h}:${pad2(m)}.`}; }},
  {id: 'a2array', g: 2, mk: (R, L) => { const r = R.r(2, 5), c = R.r(2, 6);
    return {q: L === 'th' ? 'จากภาพ มีจุดทั้งหมดกี่จุด' : 'How many dots are in the array?', fig: TF.dots(r, c), a: r * c, o: [r + c, r * c + r, r * c - c], how: L === 'th' ? `${r} แถว แถวละ ${c} จุด: ${Array(r).fill(c).join(' + ')} = ${r * c}` : `${r} rows of ${c}: ${Array(r).fill(c).join(' + ')} = ${r * c}.`}; }},
  {id: 'a2unit', g: 2, mk: (R, L) => { const U = L === 'th' ? ['เซนติเมตร', 'เมตร', 'กิโลเมตร'] : ['centimeters', 'meters', 'kilometers'];
    const items = L === 'th' ? [['ความยาวของดินสอ', 0], ['ความยาวของยางลบ', 0], ['ความยาวของห้องเรียน', 1], ['ความสูงของต้นมะพร้าว', 1], ['ระยะทางจากกรุงเทพฯ ไปเชียงใหม่', 2], ['ระยะทางจากบ้านไปทะเล', 2]] : [['the length of a pencil', 0], ['the length of an eraser', 0], ['the length of a classroom', 1], ['the height of a tree', 1], ['the distance between two cities', 2], ['the length of a long road trip', 2]];
    const [what, i] = R.pick(items);
    return {q: L === 'th' ? `ควรใช้หน่วยใดวัด${what}` : `Which unit is best for measuring ${what}?`, a: U[i], o: U.filter((_, k) => k !== i), how: L === 'th' ? `${what} ${['สั้น ใช้เซนติเมตร', 'ยาวพอสมควร ใช้เมตร', 'ไกลมาก ใช้กิโลเมตร'][i]}` : `${what[0].toUpperCase() + what.slice(1)} is ${['short — centimeters', 'quite long — meters', 'very far — kilometers'][i]}.`}; }},
  {id: 'a2bars', g: 2, mk: (R, L) => { const P = shuffle((L === 'th' ? TT_TH_PETS : TT_EN_PETS).slice()).slice(0, 4), v = P.map(() => R.r(1, 10)), i = R.r(0, 3); let j = R.r(0, 3); if(j === i) j = (i + 1) % 4;
    const kind = R.r(0, 2), fig = TF.bars(P.map((p, k) => ({label: p, v: v[k]})), 2, 10), intro = L === 'th' ? 'แผนภูมิแท่งแสดงสัตว์เลี้ยงที่นักเรียนชอบ ' : "The bar graph shows children's favorite pets. ";
    if(kind === 0) return {q: intro + (L === 'th' ? `มีนักเรียนชอบ${P[i]}กี่คน` : `How many children chose ${P[i].toLowerCase()}?`), fig, a: v[i], o: [v[i] + 1, v[i] - 1, v[j]], how: L === 'th' ? `แท่งของ${P[i]}สูงถึง ${v[i]}` : `The ${P[i].toLowerCase()} bar reaches ${v[i]}.`};
    if(kind === 1) return {q: intro + (L === 'th' ? `นักเรียนที่ชอบ${P[i]}และ${P[j]}รวมกันมีกี่คน` : `How many children chose ${P[i].toLowerCase()} or ${P[j].toLowerCase()} altogether?`), fig, a: v[i] + v[j], o: [Math.abs(v[i] - v[j]), v[i] + v[j] + 1, v[i]], how: `${v[i]} + ${v[j]} = ${v[i] + v[j]}`};
    const [a, b] = v[i] >= v[j] ? [i, j] : [j, i]; if(v[a] === v[b]) return null;
    return {q: intro + (L === 'th' ? `นักเรียนที่ชอบ${P[a]}มากกว่าที่ชอบ${P[b]}กี่คน` : `How many more children chose ${P[a].toLowerCase()} than ${P[b].toLowerCase()}?`), fig, a: v[a] - v[b], o: [v[a] + v[b], v[a], v[a] - v[b] + 1], how: `${v[a]} − ${v[b]} = ${v[a] - v[b]}`}; }},
  {id: 'a2word', g: 2, mk: (R, L) => { const k = R.r(0, 2), N = pick(TK_NAMES[L]);
    if(k === 0){ const g = R.r(11, 19), b = R.r(11, 19); return {q: L === 'th' ? `ห้องเรียนหนึ่งมีนักเรียนหญิง ${g} คน นักเรียนชาย ${b} คน ห้องนี้มีนักเรียนทั้งหมดกี่คน` : `A class has ${g} girls and ${b} boys. How many children are in the class?`, a: g + b, o: [g + b - 10, Math.abs(g - b), g + b + 1], how: colWork(g, b, 'add', L)}; }
    if(k === 1){ const p = R.r(40, 95), r = R.r(12, p - 10); return {q: L === 'th' ? `หนังสือเล่มหนึ่งมี ${p} หน้า ${N}อ่านไปแล้ว ${r} หน้า เหลืออีกกี่หน้า` : `A book has ${p} pages. ${N} has read ${r} pages. How many pages are left?`, a: p - r, o: [p + r, p - r + 10, p - r - 1], how: colWork(p, r, 'sub', L)}; }
    const a = R.r(20, 60), b = R.r(10, 35); return {q: L === 'th' ? `ร้านขายไข่ไก่ตอนเช้า ${a} ฟอง ตอนบ่าย ${b} ฟอง ทั้งวันขายไข่ได้กี่ฟอง` : `A shop sold ${a} apples in the morning and ${b} in the afternoon. How many apples did it sell?`, a: a + b, o: [a + b - 10, a - b, a + b + 10], how: colWork(a, b, 'add', L)}; }},
  {id: 'a2khit', g: 2, only: 'th', mk: (R, L) => { const k = R.r(1, 5), x = R.r(1, 9);
    return {q: `ส้มหนัก ${k} กิโลกรัม ${x} ขีด คิดเป็นกี่ขีด`, a: 10 * k + x, o: [k + x, 100 * k + x, 10 * x + k], how: `1 กิโลกรัม = 10 ขีด → ${k} × 10 + ${x} = ${10 * k + x} ขีด`}; }},
  // ===== Grade 3 / ป.3 =====
  {id: 'a3mul', g: 3, mk: (R, L) => { const a = R.r(2, 9), b = R.r(3, 10);
    return {q: L === 'th' ? `${a} × ${b} = □  □ แทนจำนวนใด` : `What is ${a} × ${b}?`, a: a * b, o: [a * (b - 1), a * (b + 1), a + b], how: L === 'th' ? `${a} × ${b} คือ ${b} จำนวน ${a} ชุด → ${a * b}` : `${a} × ${b} is ${a} groups of ${b} → ${a * b}.`}; }},
  {id: 'a3div', g: 3, mk: (R, L) => { const b = R.r(2, 9), q = R.r(2, 10), a = b * q;
    return {q: L === 'th' ? `${a} ÷ ${b} = □  □ แทนจำนวนใด` : `What is ${a} ÷ ${b}?`, a: q, o: [q + 1, q - 1, a - b], how: L === 'th' ? `เพราะ ${b} × ${q} = ${a} ดังนั้น ${a} ÷ ${b} = ${q}` : `${b} × ${q} = ${a}, so ${a} ÷ ${b} = ${q}.`}; }},
  {id: 'a3missf', g: 3, mk: (R, L) => { const b = R.r(3, 9), q = R.r(3, 9), p = b * q;
    return {q: L === 'th' ? `□ × ${b} = ${p}  □ แทนจำนวนใด` : `□ × ${b} = ${p}. What number goes in the box?`, a: q, o: [p - b, q + 1, q - 1], how: L === 'th' ? `${p} ÷ ${b} = ${q} ดังนั้น ${q} × ${b} = ${p}` : `${p} ÷ ${b} = ${q}, so ${q} × ${b} = ${p}.`, say: L === 'th' ? `อะไร คูณ ${b} เท่ากับ ${p}` : `What number times ${b} equals ${p}?`}; }},
  {id: 'a3round', g: 3, only: 'en', mk: (R, L) => { let n; do { n = R.r(101, 989); } while(n % 10 === 0 || n % 10 === 5); const o = n % 10, r = Math.round(n / 10) * 10;
    return {q: `Round ${n} to the nearest ten.`, a: r, o: [o >= 5 ? r - 10 : r + 10, Math.round(n / 100) * 100, n - o], how: `The ones digit is ${o}: ${o >= 5 ? '5 or more → round up' : 'less than 5 → round down'} → ${r}.`}; }},
  {id: 'a3add3', g: 3, mk: (R, L) => { let a, b; for(let k = 0; k < 30; k++){ a = R.r(125, 689); b = R.r(118, 999 - a); if(b > 100 && (a % 10 + b % 10 >= 10 || Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10 >= 10)) break; } if(!(b > 100)) return null; const s = a + b;
    const noCarry = [0, 1, 2].reduce((t, i) => t + ((Math.floor(a / 10 ** i) % 10 + Math.floor(b / 10 ** i) % 10) % 10) * 10 ** i, 0);
    return {q: L === 'th' ? `${a} + ${b} = □  □ แทนจำนวนใด` : `What is ${a} + ${b}?`, a: s, o: [noCarry, s + 100, s - 10], how: colWork(a, b, 'add', L)}; }},
  {id: 'a3sub3', g: 3, mk: (R, L) => { let a, b; for(let k = 0; k < 30; k++){ a = R.r(402, 987); b = R.r(118, a - 50); if(a % 10 < b % 10) break; } if(!(a % 10 < b % 10)) return null; const d = a - b;
    const dw = [0, 1, 2].reduce((t, i) => t + Math.abs(Math.floor(a / 10 ** i) % 10 - Math.floor(b / 10 ** i) % 10) * 10 ** i, 0);
    return {q: L === 'th' ? `${a} − ${b} = □  □ แทนจำนวนใด` : `What is ${a} − ${b}?`, a: d, o: [dw, d + 10, d - 100], how: colWork(a, b, 'sub', L)}; }},
  {id: 'a3frac', g: 3, mk: (R, L) => { const n = R.pick([2, 3, 4, 5, 6, 8]), k = R.r(1, n - 1), round = Math.random() < 0.5;
    return {q: L === 'th' ? 'ส่วนที่แรเงาคิดเป็นเศษส่วนเท่าใด' : 'What fraction of the shape is shaded?', fig: TF.frac(n, k, round), a: `${k}/${n}`, o: [`${n - k}/${n}`, `${k}/${n - k}`, `${n}/${k}`, `${k}/${n + 1}`],
      how: L === 'th' ? `แบ่งเป็น ${n} ส่วนเท่า ๆ กัน แรเงา ${k} ส่วน → ${k}/${n}` : `${n} equal parts, ${k} shaded → ${k}/${n}.`}; }},
  {id: 'a3fcmp', g: 3, mk: (R, L) => { if(Math.random() < 0.5){ const n = R.pick([4, 5, 6, 8, 10]); let a = R.r(1, n - 1), b = R.r(1, n - 1); if(a === b) return null; const big = Math.max(a, b);
      return {q: L === 'th' ? `เศษส่วนใดมากกว่า   ${a}/${n} หรือ ${b}/${n}` : `Which fraction is greater:  ${a}/${n} or ${b}/${n}?`, a: `${big}/${n}`, o: [`${Math.min(a, b)}/${n}`, L === 'th' ? 'เท่ากัน' : 'They are equal'], how: L === 'th' ? `ตัวส่วนเท่ากัน ตัวเศษมากกว่าก็มากกว่า → ${big}/${n}` : `Same bottom number: more parts is greater → ${big}/${n}.`}; }
    const x = R.pick([2, 3, 4]), y = x + R.r(1, 5);
    return {q: L === 'th' ? `เศษส่วนใดมากกว่า   1/${x} หรือ 1/${y}` : `Which fraction is greater:  1/${x} or 1/${y}?`, a: `1/${x}`, o: [`1/${y}`, L === 'th' ? 'เท่ากัน' : 'They are equal'], how: L === 'th' ? `แบ่ง ${x} ส่วน ชิ้นใหญ่กว่าแบ่ง ${y} ส่วน → 1/${x} มากกว่า` : `Cutting into ${x} parts makes bigger pieces than ${y} parts → 1/${x} is greater.`}; }},
  {id: 'a3elapsed', g: 3, mk: (R, L) => { const h = R.r(1, 10), sm = 5 * R.r(4, 11), d = 5 * R.r(3, 11), t = h * 60 + sm + d, eh = Math.floor(t / 60), em = t % 60; if(eh === h) return null;
    const naive = (eh * 100 + em) - (h * 100 + sm);
    return {q: L === 'th' ? `เริ่มเรียนเวลา ${tTime(h, sm, L)} เลิกเรียนเวลา ${tTime(eh, em, L)} เรียนนานกี่นาที` : `A lesson starts at ${h}:${pad2(sm)} and ends at ${eh}:${pad2(em)}. How many minutes long is it?`, a: d, o: [naive, d + 10, d - 5],
      how: L === 'th' ? `${tTime(h, sm, L)} ถึง ${tTime(h + 1, 0, L)} = ${60 - sm} นาที แล้วต่ออีก ${em} นาที → ${60 - sm} + ${em} = ${d} นาที` : `${h}:${pad2(sm)} → ${h + 1}:00 is ${60 - sm} min, then ${em} more → ${60 - sm} + ${em} = ${d} minutes.`}; }},
  {id: 'a3area', g: 3, mk: (R, L) => { const a = R.r(2, 7), b = R.r(2, 6), fig = TF.grid(a, b);
    if(Math.random() < 0.5) return {q: L === 'th' ? 'แต่ละช่องมีพื้นที่ 1 ตารางหน่วย รูปสี่เหลี่ยมผืนผ้านี้มีพื้นที่กี่ตารางหน่วย' : 'Each square is 1 square unit. What is the area of the rectangle?', fig, a: a * b, o: [2 * (a + b), a + b, a * b + a], how: L === 'th' ? `${b} แถว แถวละ ${a} ช่อง → ${a} × ${b} = ${a * b} ตารางหน่วย` : `${b} rows of ${a} squares → ${a} × ${b} = ${a * b} square units.`};
    return {q: L === 'th' ? 'ด้านของแต่ละช่องยาว 1 หน่วย รูปสี่เหลี่ยมผืนผ้านี้มีความยาวรอบรูปกี่หน่วย' : 'Each square side is 1 unit. What is the perimeter of the rectangle?', fig, a: 2 * (a + b), o: [a * b, a + b, 2 * a + b], how: L === 'th' ? `${a} + ${b} + ${a} + ${b} = ${2 * (a + b)} หน่วย` : `${a} + ${b} + ${a} + ${b} = ${2 * (a + b)} units.`}; }},
  {id: 'a3liter', g: 3, mk: (R, L) => { const l = R.r(1, 5), ml = 50 * R.r(1, 19);
    if(L === 'th') return {q: `น้ำ ${l} ลิตร ${ml} มิลลิลิตร คิดเป็นกี่มิลลิลิตร`, a: 1000 * l + ml, o: [100 * l + ml, l + ml, 1000 * l + ml * 10], how: `1 ลิตร = 1,000 มิลลิลิตร → ${l} × 1,000 + ${ml} = ${fN(1000 * l + ml)} มิลลิลิตร`};
    return {q: `A jug holds ${l} liters and ${ml} milliliters of juice. How many milliliters is that?`, a: 1000 * l + ml, o: [100 * l + ml, l + ml, 1000 * l + ml * 10], how: `1 liter = 1,000 mL → ${l} × 1,000 + ${ml} = ${fN(1000 * l + ml)} mL.`}; }},
  {id: 'a3pictkey', g: 3, mk: (R, L) => { const k = R.pick([2, 5, 10]), cls = L === 'th' ? ['ป.3/1', 'ป.3/2', 'ป.3/3'] : ['Class A', 'Class B', 'Class C'], n = cls.map(() => R.r(2, 7)), i = R.r(0, 2);
    return {q: L === 'th' ? `แผนภูมิรูปภาพแสดงจำนวนหนังสือที่แต่ละห้องอ่าน ห้อง ${cls[i]} อ่านหนังสือกี่เล่ม` : `The picture graph shows the books each class read. How many books did ${cls[i]} read?`,
      fig: TF.pict(cls.map((c, j) => ({label: c, icon: '📚', n: n[j]})), L === 'th' ? `กำหนดให้ 📚 แทนหนังสือ ${k} เล่ม` : `Key: each 📚 = ${k} books`), a: n[i] * k, o: [n[i], n[i] * k + k, n[i] + k],
      how: L === 'th' ? `มี 📚 ${n[i]} รูป รูปละ ${k} เล่ม → ${n[i]} × ${k} = ${n[i] * k} เล่ม` : `${n[i]} pictures × ${k} books = ${n[i] * k} books.`}; }},
  {id: 'a3change', g: 3, mk: (R, L) => { const N = pick(TK_NAMES[L]);
    if(L === 'th'){ const p = R.r(12, 45), k = R.r(2, 4), m = [100, 500].find(x => x > p * k);
      return {q: `ตั๋วรถไฟฟ้าราคาใบละ ${p} บาท ${N}ซื้อ ${k} ใบ จ่ายเงิน ${m} บาท จะได้เงินทอนกี่บาท`, a: m - p * k, o: [m - p, p * k, m - p * k + 10], how: `${p} × ${k} = ${p * k} บาท → ${m} − ${p * k} = ${m - p * k} บาท`}; }
    const p = R.r(3, 9), k = R.r(2, 4), m = [10, 20, 50].find(x => x > p * k);
    return {q: `Tickets cost $${p} each. ${N} buys ${k} tickets and pays with a $${m} bill. How much change does ${N} get?`, a: '$' + (m - p * k), o: ['$' + (m - p), '$' + (p * k), '$' + (m - p * k + 1)], how: `$${p} × ${k} = $${p * k} → $${m} − $${p * k} = $${m - p * k}.`}; }},
  {id: 'a3satang', g: 3, only: 'th', mk: (R, L) => { const b1 = R.r(5, 30), s1 = R.pick([25, 50, 75]), b2 = R.r(3, 20), s2 = R.pick([25, 50, 75]), tot = (b1 + b2) * 100 + s1 + s2, B = Math.floor(tot / 100), S = tot % 100;
    const fmt = (b, s) => s ? `${b} บาท ${s} สตางค์` : `${b} บาท`;
    return {q: `ดินสอราคา ${fmt(b1, s1)} สมุดราคา ${fmt(b2, s2)} รวมเป็นเงินเท่าใด`, a: fmt(B, S), o: [s1 + s2 >= 100 ? `${b1 + b2} บาท ${s1 + s2} สตางค์` : fmt(B + 1, S), fmt(B, S + 25 < 100 ? S + 25 : S - 25), fmt(B - 1, S)],
      how: `${b1} + ${b2} = ${b1 + b2} บาท · ${s1} + ${s2} = ${s1 + s2} สตางค์${s1 + s2 >= 100 ? ' = 1 บาท ' + (s1 + s2 - 100) + ' สตางค์' : ''} → ${fmt(B, S)} (100 สตางค์ = 1 บาท)`}; }},
  // ===== Grade 4 / ป.4 =====
  {id: 'a4mul', g: 4, mk: (R, L) => { const a = R.r(112, 489), b = R.r(3, 9), h = Math.floor(a / 100), t = Math.floor(a / 10) % 10, o = a % 10;
    return {q: L === 'th' ? `${a} × ${b} = □  □ แทนจำนวนใด` : `What is ${a} × ${b}?`, a: a * b, o: [a * b - 100, a * b + 10, a * (b - 1)], how: `${h * 100} × ${b} + ${t * 10} × ${b} + ${o} × ${b} = ${h * 100 * b} + ${t * 10 * b} + ${o * b} = ${fN(a * b)}`}; }},
  {id: 'a4mul22', g: 4, mk: (R, L) => { const a = R.r(12, 49), b = R.r(13, 29), bt = Math.floor(b / 10) * 10, bo = b % 10; if(!bo) return null;
    return {q: L === 'th' ? `${a} × ${b} = □  □ แทนจำนวนใด` : `What is ${a} × ${b}?`, a: a * b, o: [a * bo + a * (bt / 10), a * b + 10, a * b - a], how: `${a} × ${bt} + ${a} × ${bo} = ${a * bt} + ${a * bo} = ${fN(a * b)}`}; }},
  {id: 'a4divr', g: 4, mk: (R, L) => { const b = R.r(3, 9), q = R.r(3, 12), r = R.r(1, b - 1), n = b * q + r, w = (x, y) => L === 'th' ? `${x} เศษ ${y}` : `${x} R ${y}`;
    return {q: L === 'th' ? `${n} ÷ ${b} ได้ผลหารและเศษเท่าใด` : `What is ${n} ÷ ${b}?`, a: w(q, r), o: [w(q, r + 1 < b ? r + 1 : r - 1), w(q + 1, r), w(q - 1, r + b)], how: L === 'th' ? `${b} × ${q} = ${b * q} และ ${n} − ${b * q} = ${r} → ${q} เศษ ${r}` : `${b} × ${q} = ${b * q}, and ${n} − ${b * q} = ${r} → ${q} R ${r}.`}; }},
  {id: 'a4factor', g: 4, only: 'en', mk: (R, L) => { const n = R.pick([12, 18, 20, 24, 30, 36, 40, 42, 48]), fs = []; for(let f = 2; f <= n / 2; f++) if(n % f === 0) fs.push(f); const f = R.pick(fs), non = []; for(let x = 4; x < n && non.length < 12; x++) if(n % x) non.push(x);
    return {q: `Which number is a factor of ${n}?`, a: String(f), o: shuffle(non).slice(0, 3).map(String), how: `${n} ÷ ${f} = ${n / f} with no remainder, so ${f} is a factor of ${n}.`}; }},
  {id: 'a4prime', g: 4, only: 'en', mk: (R, L) => { const p = R.pick([7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]);
    return {q: 'Which number is prime?', a: String(p), o: shuffle([9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51]).slice(0, 3).map(String), how: `${p} has only two factors, 1 and ${p} — so it is prime. The others can be divided by 3, 5 or 7.`}; }},
  {id: 'a4place', g: 4, mk: (R, L) => { const big = Math.random() < 0.5, ds = big ? [R.r(1, 9), R.r(0, 9), R.r(0, 9), R.r(0, 9), R.r(0, 9), R.r(0, 9)] : [R.r(1, 9), R.r(0, 9), R.r(0, 9), R.r(0, 9), R.r(0, 9)]; ds[R.r(1, ds.length - 2)] = 0; const n = Number(ds.join(''));
    const TH = ['หน่วย', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'], parts = ds.map((d, i) => [d, ds.length - 1 - i]).filter(x => x[0]);
    const q = L === 'th' ? `จำนวนที่ประกอบด้วย ${parts.map(([d, p]) => d + ' ' + TH[p]).join(' ')} คือจำนวนใด` : `What is ${parts.map(([d, p]) => fN(d * 10 ** p)).join(' + ')}?`;
    return {q, a: n, o: [Number(ds.filter(Boolean).join('')), n + 10 ** (ds.length - 2), n - 10 ** (ds.length - 1) / 10], how: L === 'th' ? `${parts.map(([d, p]) => fN(d * 10 ** p)).join(' + ')} = ${fN(n)} (หลักที่ไม่มีใส่ 0)` : `${parts.map(([d, p]) => fN(d * 10 ** p)).join(' + ')} = ${fN(n)} (a 0 keeps each empty place).`}; }},
  {id: 'a4round', g: 4, mk: (R, L) => { let n; do { n = R.r(1010, 9890); } while(n % 100 === 50 || n % 100 === 0); const r = Math.round(n / 100) * 100, t = Math.floor(n / 10) % 10;
    return {q: L === 'th' ? `ค่าประมาณเป็นจำนวนเต็มร้อยของ ${fN(n)} คือจำนวนใด` : `Round ${fN(n)} to the nearest hundred.`, a: r, o: [t >= 5 ? r - 100 : r + 100, Math.round(n / 10) * 10, Math.round(n / 1000) * 1000], how: L === 'th' ? `ดูหลักสิบ: ${t} ${t >= 5 ? 'ตั้งแต่ 5 ขึ้นไป ปัดขึ้น' : 'น้อยกว่า 5 ปัดลง'} → ${fN(r)}` : `Look at the tens digit: ${t} ${t >= 5 ? '(5 or more) → round up' : '(less than 5) → round down'} → ${fN(r)}.`}; }},
  {id: 'a4equiv', g: 4, mk: (R, L) => { const b = R.r(2, 6), a = R.r(1, b - 1), k = R.r(2, 4);
    return {q: L === 'th' ? `${a}/${b} = □/${b * k}  □ แทนจำนวนใด` : `${a}/${b} = □/${b * k}. What number goes in the box?`, a: a * k, o: [a + b * k - b, a * k + 1, b * k - a], how: L === 'th' ? `${b} × ${k} = ${b * k} จึงต้องคูณตัวเศษด้วย ${k}: ${a} × ${k} = ${a * k}` : `${b} × ${k} = ${b * k}, so multiply the top by ${k} too: ${a} × ${k} = ${a * k}.`,
      say: L === 'th' ? `${a} ส่วน ${b} เท่ากับ อะไร ส่วน ${b * k}` : `${a} over ${b} equals what over ${b * k}?`}; }},
  {id: 'a4fadd', g: 4, mk: (R, L) => { const n = R.pick([5, 6, 7, 8, 9, 10, 12]), a = R.r(1, n - 2), b = R.r(1, n - 1 - a), sub = Math.random() < 0.35;
    if(sub){ const x = a + b; return {q: L === 'th' ? `${x}/${n} − ${b}/${n} = ?` : `What is ${x}/${n} − ${b}/${n}?`, a: `${a}/${n}`, o: [`${a}/${2 * n}`, `${a + 1}/${n}`, `${x + b}/${n}`], how: L === 'th' ? `ตัวส่วนเท่ากัน ลบเฉพาะตัวเศษ: ${x} − ${b} = ${a} → ${a}/${n}` : `Same bottom number: subtract the tops, ${x} − ${b} = ${a} → ${a}/${n}.`}; }
    return {q: L === 'th' ? `${a}/${n} + ${b}/${n} = ?` : `What is ${a}/${n} + ${b}/${n}?`, a: `${a + b}/${n}`, o: [`${a + b}/${2 * n}`, `${a * b}/${n}`, `${a + b + 1}/${n}`], how: L === 'th' ? `ตัวส่วนเท่ากัน บวกเฉพาะตัวเศษ: ${a} + ${b} = ${a + b} → ${a + b}/${n}` : `Same bottom number: add the tops, ${a} + ${b} = ${a + b} → ${a + b}/${n}.`}; }},
  {id: 'a4dec', g: 4, mk: (R, L) => { let h; do { h = R.r(11, 99); } while(h % 10 === 0);
    return {q: L === 'th' ? `${h}/100 เขียนเป็นทศนิยมได้อย่างไร` : `Which decimal is equal to ${h}/100?`, a: '0.' + h, o: [(h / 10).toFixed(1), '0.0' + h, h + '.0'], how: L === 'th' ? `ส่วน 100 → ทศนิยม 2 ตำแหน่ง: ${h}/100 = 0.${h}` : `Hundredths fill 2 places after the point: ${h}/100 = 0.${h}.`}; }},
  {id: 'a4conv', g: 4, mk: (R, L) => {
    if(L === 'th'){ const k = R.r(0, 3);
      if(k === 0){ const m = R.r(1, 9), c = R.r(5, 95); return {q: `${m} เมตร ${c} เซนติเมตร = □ เซนติเมตร`, a: 100 * m + c, o: [10 * m + c, m + c, 1000 * m + c], how: `1 เมตร = 100 เซนติเมตร → ${m} × 100 + ${c} = ${100 * m + c}`}; }
      if(k === 1){ const h = R.r(1, 4), m = 5 * R.r(1, 11); return {q: `${h} ชั่วโมง ${m} นาที = □ นาที`, a: 60 * h + m, o: [100 * h + m, h + m, 60 * h], how: `1 ชั่วโมง = 60 นาที → ${h} × 60 + ${m} = ${60 * h + m}`}; }
      if(k === 2){ const km = R.r(2, 9), m = 50 * R.r(1, 19); return {q: `${km} กิโลเมตร ${m} เมตร = □ เมตร`, a: 1000 * km + m, o: [100 * km + m, km + m, 1000 * km + 10 * m], how: `1 กิโลเมตร = 1,000 เมตร → ${km} × 1,000 + ${m} = ${fN(1000 * km + m)}`}; }
      const kg = R.r(2, 9), g = 50 * R.r(1, 19); return {q: `${kg} กิโลกรัม ${g} กรัม = □ กรัม`, a: 1000 * kg + g, o: [100 * kg + g, kg + g, 10 * kg + g], how: `1 กิโลกรัม = 1,000 กรัม → ${kg} × 1,000 + ${g} = ${fN(1000 * kg + g)}`}; }
    const C = R.pick([['feet', 'inches', 12, 10], ['yards', 'feet', 3, 12], ['pounds', 'ounces', 16, 10], ['hours', 'minutes', 60, 100], ['minutes', 'seconds', 60, 100], ['kilometers', 'meters', 1000, 100], ['kilograms', 'grams', 1000, 100]]), k = R.r(2, 9);
    return {q: `${k} ${C[0]} = □ ${C[1]}. What number goes in the box?`, a: k * C[2], o: [k * C[3], k + C[2], k * C[2] + C[2]], how: `1 ${C[0].replace(/s$/, '').replace(/^feet$/, 'foot')} = ${C[2]} ${C[1]} → ${k} × ${C[2]} = ${fN(k * C[2])}.`,
      say: `${k} ${C[0]} equals how many ${C[1]}?`}; }},
  {id: 'a4angle', g: 4, mk: (R, L) => { const kind = R.r(0, 2), deg = [R.r(3, 8) * 10, 90, R.r(10, 16) * 10][kind], N = L === 'th' ? ['มุมแหลม', 'มุมฉาก', 'มุมป้าน', 'มุมตรง'] : ['acute angle', 'right angle', 'obtuse angle', 'straight angle'];
    return {q: L === 'th' ? 'มุมนี้เป็นมุมชนิดใด' : 'What kind of angle is this?', fig: TF.angle(deg), a: N[kind], o: N.filter((_, i) => i !== kind),
      how: L === 'th' ? ['มุมที่เล็กกว่า 90 องศา คือมุมแหลม', 'มุมที่เท่ากับ 90 องศา (มีสัญลักษณ์ ⌐) คือมุมฉาก', 'มุมที่มากกว่า 90 องศา แต่น้อยกว่า 180 องศา คือมุมป้าน'][kind] : ['Less than 90° → an acute angle.', 'Exactly 90° (the little square) → a right angle.', 'More than 90° but less than 180° → an obtuse angle.'][kind]}; }},
  {id: 'a4garden', g: 4, mk: (R, L) => { const l = R.r(8, 25), w = R.r(3, l - 2), per = Math.random() < 0.5;
    if(L === 'th') return {q: `สวนรูปสี่เหลี่ยมผืนผ้ายาว ${l} เมตร กว้าง ${w} เมตร ${per ? 'มีความยาวรอบรูปกี่เมตร' : 'มีพื้นที่กี่ตารางเมตร'}`, a: per ? 2 * (l + w) : l * w, o: per ? [l * w, l + w, 2 * l + w] : [2 * (l + w), l + w, l * w + l],
      how: per ? `ความยาวรอบรูป = ${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} เมตร` : `พื้นที่ = กว้าง × ยาว = ${w} × ${l} = ${l * w} ตารางเมตร`};
    return {q: `A rectangular garden is ${l} m long and ${w} m wide. What is its ${per ? 'perimeter, in meters' : 'area, in square meters'}?`, a: per ? 2 * (l + w) : l * w, o: per ? [l * w, l + w, 2 * l + w] : [2 * (l + w), l + w, l * w + l],
      how: per ? `Perimeter = ${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} m.` : `Area = length × width = ${l} × ${w} = ${l * w} square meters.`}; }},
  {id: 'a4clock24', g: 4, only: 'th', mk: (R, L) => { const k = R.r(0, 2);
    if(k === 0){ const h = R.r(1, 3), m = R.pick([0, 0, 15, 30, 45]); const w = (h === 1 ? 'บ่ายโมง' : `บ่าย ${h} โมง`) + (m ? ` ${m} นาที` : ''); return {q: `เวลา${w} เขียนแบบ 24 ชั่วโมงได้อย่างไร`, a: tTime(12 + h, m, 'th'), o: [tTime(h, m, 'th'), tTime(10 + h, m, 'th'), tTime(13 + h, m, 'th')], how: `บ่าย ${h} โมง = 12 + ${h} = ${12 + h} นาฬิกา → ${tTime(12 + h, m, 'th')}`}; }
    if(k === 1){ const h = R.r(4, 6); return {q: `เวลา ${h} โมงเย็น เขียนแบบ 24 ชั่วโมงได้อย่างไร`, a: tTime(12 + h, 0, 'th'), o: [tTime(h, 0, 'th'), tTime(10 + h, 0, 'th'), tTime(13 + h, 0, 'th')], how: `${h} โมงเย็น = 12 + ${h} = ${12 + h}.00 น.`}; }
    const t = R.r(1, 5); return {q: `เวลา ${t} ทุ่ม เขียนแบบ 24 ชั่วโมงได้อย่างไร`, a: tTime(18 + t, 0, 'th'), o: [tTime(t, 0, 'th'), tTime(12 + t, 0, 'th'), tTime(19 + t, 0, 'th')], how: `${t} ทุ่ม = 18 + ${t} = ${18 + t}.00 น. (1 ทุ่ม = 19.00 น.)`}; }},
  {id: 'a4ampm', g: 4, only: 'en', mk: (R, L) => { const h = R.r(1, 8), m = 5 * R.r(0, 11), dh = R.r(1, 2), dm = 5 * R.r(1, 11), t = h * 60 + m + dh * 60 + dm, eh = Math.floor(t / 60), em = t % 60; if(eh > 11) return null;
    const f = (x, y) => `${x}:${pad2(y)} PM`;
    return {q: `A movie starts at ${f(h, m)} and lasts ${dh} hour${dh > 1 ? 's' : ''} ${dm} minutes. What time does it end?`, a: f(eh, em), o: [f(eh - 1, em), f(h + dh, m), f(eh, (em + 10) % 60)], how: `${f(h, m)} + ${dh} h = ${f(h + dh, m)}, + ${dm} min = ${f(eh, em)}.`}; }},
  {id: 'a4cal', g: 4, mk: (R, L) => { const k = R.r(0, 2);
    if(k === 0){ const w = R.r(2, 9); return {q: L === 'th' ? `${w} สัปดาห์ มีกี่วัน` : `How many days are in ${w} weeks?`, a: 7 * w, o: [5 * w, 7 * w + 7, w + 7], how: L === 'th' ? `1 สัปดาห์ = 7 วัน → ${w} × 7 = ${7 * w} วัน` : `1 week = 7 days → ${w} × 7 = ${7 * w} days.`}; }
    if(k === 1){ const y = R.r(2, 6); return {q: L === 'th' ? `${y} ปี มีกี่เดือน` : `How many months are in ${y} years?`, a: 12 * y, o: [10 * y, 12 * y + 12, 365], how: L === 'th' ? `1 ปี = 12 เดือน → ${y} × 12 = ${12 * y} เดือน` : `1 year = 12 months → ${y} × 12 = ${12 * y} months.`}; }
    return {q: L === 'th' ? 'ปีที่เดือนกุมภาพันธ์มี 29 วัน ทั้งปีมีกี่วัน' : 'In a leap year, February has 29 days. How many days are in a leap year?', a: 366, o: [365, 364, 360], how: L === 'th' ? 'ปีปกติมี 365 วัน ปีอธิกสุรทินเพิ่ม 1 วัน → 366 วัน' : 'A normal year has 365 days; a leap year has 1 more → 366.'}; }},
  {id: 'a4rule', g: 4, mk: (R, L) => { const s = R.r(2, 15), d = R.r(3, 9), k = R.r(6, 10), v = s + (k - 1) * d;
    return {q: L === 'th' ? `แบบรูป ${s}, ${s + d}, ${s + 2 * d}, ${s + 3 * d}, … จำนวนที่ ${k} คือจำนวนใด` : `The pattern ${s}, ${s + d}, ${s + 2 * d}, ${s + 3 * d}, … keeps adding ${d}. What is the ${tkOrd(k)} number?`, a: v, o: [s + k * d, k * d, v - 1],
      how: L === 'th' ? `เพิ่มทีละ ${d} จากจำนวนแรก ${k - 1} ครั้ง: ${s} + ${k - 1} × ${d} = ${v}` : `From the 1st number, add ${d} (${k} − 1) times: ${s} + ${k - 1} × ${d} = ${v}.`}; }},
  {id: 'a4dollars', g: 4, only: 'en', mk: (R, L) => { const a = R.r(150, 899), b = R.r(125, 699), s = a + b, m = x => '$' + Math.floor(x / 100) + '.' + pad2(x % 100); if((a % 100) + (b % 100) < 100) return null;
    return {q: `A book costs ${m(a)} and a pen costs ${m(b)}. How much do they cost together?`, a: m(s), o: [m(s - 100), m(s + 10), m(s + 100)], how: `Cents: ${a % 100} + ${b % 100} = ${(a % 100) + (b % 100)}¢ = $1 and ${pad2((a + b) % 100)}¢. Dollars: ${Math.floor(a / 100)} + ${Math.floor(b / 100)} + 1 = ${Math.floor(s / 100)} → ${m(s)}.`}; }},
  // ===== ➗ mq-t2 · Grade 5 / ป.5 =====   (gt = the Thai grade when the Thai curriculum teaches it in another year)
  {id: 'b5fadd', g: 5, mk: (R, L) => { const [b, d] = R.pick([[2, 3], [3, 4], [2, 5], [4, 6], [3, 5], [2, 7], [4, 5], [6, 8], [3, 8], [5, 6], [4, 10], [6, 9]]), a = R.r(1, b - 1), c = R.r(1, d - 1), m = tLcm(b, d), n = a * m / b + c * m / d, ans = tFr(n, m);
    return {q: L === 'th' ? `${a}/${b} + ${c}/${d} มีค่าเท่าใด (ตอบในรูปอย่างต่ำ)` : `What is ${a}/${b} + ${c}/${d}? Give the answer in simplest form.`, a: ans, o: [(a + c) + '/' + (b + d), tFr(a + c, m), tFr(a * c, b * d), tFr(n + 1, m)],
      how: L === 'th' ? `ทำตัวส่วนให้เท่ากัน (ค.ร.น. ของ ${b} และ ${d} = ${m}): ${a * m / b}/${m} + ${c * m / d}/${m} = ${n}/${m}${n + '/' + m === ans ? '' : ' = ' + ans}` : `Common denominator ${m}: ${a * m / b}/${m} + ${c * m / d}/${m} = ${n}/${m}${n + '/' + m === ans ? '' : ' = ' + ans}. (Never add the bottoms!)`}; }},
  {id: 'b5fsub', g: 5, mk: (R, L) => { let [b, d] = R.pick([[2, 3], [3, 4], [2, 5], [4, 6], [3, 5], [4, 5], [6, 8], [3, 8], [5, 6], [2, 9]]), a = R.r(1, b - 1), c = R.r(1, d - 1); if(a * d === c * b) return null; if(a * d < c * b){ [a, b, c, d] = [c, d, a, b]; }
    const m = tLcm(b, d), n = a * m / b - c * m / d, ans = tFr(n, m);
    return {q: L === 'th' ? `${a}/${b} − ${c}/${d} มีค่าเท่าใด (ตอบในรูปอย่างต่ำ)` : `What is ${a}/${b} − ${c}/${d}? Give the answer in simplest form.`, a: ans, o: [a === c ? tFr(a + c, b * d) : Math.abs(a - c) + '/' + Math.abs(b - d), tFr(a * m / b + c * m / d, m), tFr(n + 1, m), tFr(Math.abs(a - c), m)],
      how: L === 'th' ? `ตัวส่วนร่วม ${m}: ${a * m / b}/${m} − ${c * m / d}/${m} = ${n}/${m}${n + '/' + m === ans ? '' : ' = ' + ans}` : `Common denominator ${m}: ${a * m / b}/${m} − ${c * m / d}/${m} = ${n}/${m}${n + '/' + m === ans ? '' : ' = ' + ans}.`}; }},
  {id: 'b5fof', g: 5, mk: (R, L) => { const d = R.pick([3, 4, 5, 6, 8, 10]), k = R.r(1, d - 1), N = d * R.r(2, 12), one = N / d, ans = one * k; if(tGcd(k, d) !== 1) return null;
    const th = R.pick([['นักเรียน', 'คน', 'children', ''], ['ลูกอม', 'เม็ด', 'candies', ''], ['หนังสือ', 'เล่ม', 'books', '']]);
    return {q: L === 'th' ? `มี${th[0]} ${N} ${th[1]} ${k}/${d} ของ${th[0]}ทั้งหมดคิดเป็นกี่${th[1]}` : `There are ${N} ${th[2]}. How many is ${k}/${d} of them?`, a: ans, o: [one, N - ans, N * k / 10, ans + one],
      how: L === 'th' ? `${N} ÷ ${d} = ${one} (1 ส่วน) → ${one} × ${k} = ${ans} ${th[1]}` : `${N} ÷ ${d} = ${one} (one part) → ${one} × ${k} = ${ans}.`}; }},
  {id: 'b5decadd', g: 5, mk: (R, L) => { const a = R.r(105, 999), b = R.r(11, 99), sub = R.r(0, 1) && a > b * 10, ans = tRd((sub ? a - b * 10 : a + b * 10) / 100), A = tN(a / 100), B = tN(b / 10);
    return {q: L === 'th' ? `${A} ${sub ? '−' : '+'} ${B} = □  □ แทนจำนวนใด` : `What is ${A} ${sub ? '−' : '+'} ${B}?`, a: ans, o: [tRd((sub ? a - b : a + b) / 100), tRd(ans + 1), tRd(ans - 0.1), tRd(ans + 0.01)],
      how: L === 'th' ? `ตั้งจุดทศนิยมให้ตรงกัน: ${(a / 100).toFixed(2)} ${sub ? '−' : '+'} ${(b / 10).toFixed(2)} = ${tN(ans)}` : `Line up the decimal points: ${(a / 100).toFixed(2)} ${sub ? '−' : '+'} ${(b / 10).toFixed(2)} = ${tN(ans)}.`}; }},
  {id: 'b5decmul', g: 5, mk: (R, L) => { const two = R.r(0, 1), n = two ? R.r(11, 99) : R.r(2, 9), p = two ? 100 : 10, w = R.r(3, 9), ans = tRd(n * w / p), A = tN(n / p);
    return {q: L === 'th' ? `${A} × ${w} มีค่าเท่าใด` : `What is ${A} × ${w}?`, a: ans, o: [n * w, tRd(ans / 10), tRd(n / p + w), tRd(ans * 10)],
      how: L === 'th' ? `${n} × ${w} = ${n * w} แล้วใส่ทศนิยม ${two ? 2 : 1} ตำแหน่ง → ${tN(ans)}` : `${n} × ${w} = ${n * w}, then put back ${two ? 2 : 1} decimal place${two ? 's' : ''} → ${tN(ans)}.`}; }},
  {id: 'b5decdiv', g: 5, mk: (R, L) => { if(R.r(0, 1)){ const N = R.r(12, 9999), p = R.pick([10, 100, 1000]), ans = tRd(N / p), z = String(p).length - 1;
      return {q: L === 'th' ? `${tN(N)} ÷ ${tN(p)} มีค่าเท่าใด` : `What is ${tN(N)} ÷ ${tN(p)}?`, a: ans, o: [tRd(ans * 10), tRd(ans / 10), N * p],
        how: L === 'th' ? `หารด้วย ${tN(p)} เลื่อนจุดทศนิยมไปทางซ้าย ${z} ตำแหน่ง → ${tN(ans)}` : `Dividing by ${tN(p)} moves the decimal point ${z} place${z > 1 ? 's' : ''} to the left → ${tN(ans)}.`}; }
    const w = R.r(2, 9), ans = tRd(R.r(11, 99) / 10), A = tRd(ans * w);
    return {q: L === 'th' ? `${tN(A)} ÷ ${w} มีค่าเท่าใด` : `What is ${tN(A)} ÷ ${w}?`, a: ans, o: [tRd(ans * 10), tRd(ans / 10), tRd(ans + 1)],
      how: L === 'th' ? `${tRd(A * 10)} ÷ ${w} = ${tRd(ans * 10)} แล้วใส่ทศนิยม 1 ตำแหน่ง → ${tN(ans)}` : `${tRd(A * 10)} ÷ ${w} = ${tRd(ans * 10)}, then put back 1 decimal place → ${tN(ans)}.`}; }},
  {id: 'b5vol', g: 5, mk: (R, L) => { const l = R.r(3, 12), w = R.r(2, 8), h = R.r(2, 10), v = l * w * h, inch = L === 'en' && R.r(0, 1), u = L === 'th' ? 'ซม.' : inch ? 'in' : 'cm';
    return {q: L === 'th' ? `กล่องทรงสี่เหลี่ยมมุมฉาก ยาว ${l} ซม. กว้าง ${w} ซม. สูง ${h} ซม. มีปริมาตรกี่ลูกบาศก์เซนติเมตร` : `A box is ${l} ${u} long, ${w} ${u} wide and ${h} ${u} high. What is its volume in cubic ${inch ? 'inches' : 'centimeters'}?`, a: v, o: [l * w + h, l * w, 2 * (l * w + w * h + l * h), v + l * w], fig: TF.box(l, w, h, u),
      how: L === 'th' ? `ปริมาตร = กว้าง × ยาว × สูง = ${w} × ${l} × ${h} = ${fN(v)} ลูกบาศก์เซนติเมตร` : `Volume = length × width × height = ${l} × ${w} × ${h} = ${fN(v)} cubic ${inch ? 'inches' : 'centimeters'}.`}; }},
  {id: 'b5ooo', g: 5, mk: (R, L) => { const k = R.r(0, 3); let e, ans, wrong, w1;
    if(k === 0){ const a = R.r(2, 20), b = R.r(2, 9), c = R.r(2, 9); e = `${a} + ${b} × ${c}`; ans = a + b * c; wrong = (a + b) * c; w1 = `${b} × ${c} = ${b * c} → ${a} + ${b * c} = ${ans}`; }
    else if(k === 1){ const a = R.r(2, 12), b = R.r(2, 9), c = R.r(2, 9); e = `(${a} + ${b}) × ${c}`; ans = (a + b) * c; wrong = a + b * c; w1 = `${a} + ${b} = ${a + b} → ${a + b} × ${c} = ${ans}`; }
    else if(k === 2){ const c = R.r(2, 9), q = R.r(2, 9), b = c * q, a = R.r(q + 1, 40); e = `${a} − ${b} ÷ ${c}`; ans = a - q; wrong = (a - b) / c; w1 = `${b} ÷ ${c} = ${q} → ${a} − ${q} = ${ans}`; }
    else { const a = R.r(3, 9), b = R.r(3, 9), c = R.r(2, 5), d = R.r(2, 5); if(a * b <= c * d) return null; e = `${a} × ${b} − ${c} × ${d}`; ans = a * b - c * d; wrong = (a * b - c) * d; w1 = `${a} × ${b} = ${a * b}, ${c} × ${d} = ${c * d} → ${a * b} − ${c * d} = ${ans}`; }
    return {q: L === 'th' ? `จงหาค่าของ ${e}` : `What is the value of ${e}?`, a: ans, o: [wrong, ans + 1, ans + 10],
      how: (L === 'th' ? 'ทำในวงเล็บก่อน แล้ว × ÷ ก่อน + − : ' : 'Brackets first, then × and ÷ before + and −: ') + w1}; }},
  {id: 'b5round', g: 5, mk: (R, L) => { const n = R.r(1001, 9999), x = n / 100, whole = R.r(0, 1), ans = whole ? Math.round(n / 100) : tRd(Math.round(n / 10) / 10), dig = whole ? Math.floor(n / 10) % 10 : n % 10;
    return {q: L === 'th' ? `ปัด ${tN(x)} ให้เป็น${whole ? 'จำนวนเต็ม' : 'ทศนิยมหนึ่งตำแหน่ง'}` : `Round ${tN(x)} to the nearest ${whole ? 'whole number' : 'tenth'}.`, a: ans, o: whole ? [Math.floor(n / 100), Math.floor(n / 100) + 1, Math.round(n / 1000) * 10] : [tRd(Math.floor(n / 10) / 10), tRd(Math.floor(n / 10) / 10 + 0.1), Math.round(n / 100)],
      how: L === 'th' ? `ดูหลัก${whole ? 'ส่วนสิบ' : 'ส่วนร้อย'} = ${dig} ${dig >= 5 ? '(5 ขึ้นไป ปัดขึ้น)' : '(น้อยกว่า 5 ปัดทิ้ง)'} → ${tN(ans)}` : `Look at the ${whole ? 'tenths' : 'hundredths'} digit: ${dig} ${dig >= 5 ? '(5 or more → round up)' : '(less than 5 → round down)'} → ${tN(ans)}.`}; }},
  {id: 'b5conv', g: 5, mk: (R, L) => { const k = R.r(0, 3), th = L === 'th';
    const U = [[R.r(11, 99) / 10, 1000, 'km', 'm', 'kilometers', 'meters', 'กิโลเมตร', 'เมตร'], [R.r(11, 99) * 100, 1 / 1000, 'g', 'kg', 'grams', 'kilograms', 'กรัม', 'กิโลกรัม'], [R.r(11, 49) / 10, 1000, 'L', 'mL', 'liters', 'milliliters', 'ลิตร', 'มิลลิลิตร'], [R.r(105, 995), 1 / 100, 'cm', 'm', 'centimeters', 'meters', 'เซนติเมตร', 'เมตร']][k];
    const [x, f] = U, ans = tRd(x * f), big = f > 1, m = big ? f : 1 / f;
    return {q: th ? `${tN(x)} ${U[6]} เท่ากับกี่${U[7]}` : `How many ${U[5]} are in ${tN(x)} ${U[4]}?`, a: ans, o: big ? [tRd(x * f / 10), tRd(x / f), tRd(x * 100)] : [tRd(x * f * 10), tRd(x * f / 10), x * m],
      how: th ? `1 ${big ? U[6] : U[7]} = ${tN(m)} ${big ? U[7] : U[6]} → ${tN(x)} ${big ? '×' : '÷'} ${tN(m)} = ${tN(ans)} ${U[7]}` : `1 ${big ? U[4].replace(/s$/, '') : U[5].replace(/s$/, '')} = ${tN(m)} ${big ? U[5] : U[4]} → ${tN(x)} ${big ? '×' : '÷'} ${tN(m)} = ${tN(ans)} ${U[5]}.`}; }},
  {id: 'b5coord', g: 5, gt: 7, mk: (R, L) => { const th = L === 'th', lo = th ? -5 : 0, hi = th ? 5 : 9; let x = R.r(lo, hi), y = R.r(lo, hi); if(x === y || !x || !y || (th && x > 0 && y > 0)) return null;
    const P = (a, b) => '(' + tN(a) + ', ' + tN(b) + ')', ans = P(x, y);
    return {q: th ? 'จุด A ในรูปมีพิกัดเป็นคู่อันดับใด' : 'What are the coordinates of point A?', a: ans, o: [P(y, x), P(-x, y), P(x, -y), P(x + 1, y), P(x, y + 1)].filter(s => th || !/−/.test(s)), fig: TF.plane([{x, y, lab: 'A'}], lo, hi),
      how: th ? `อ่านค่าบนแกน X ก่อน (${tN(x)}) แล้วจึงอ่านแกน Y (${tN(y)}) → ${ans}` : `Go along the x-axis first (${x}), then up the y-axis (${y}) → ${ans}.`}; }},
  {id: 'b5dec2frac', g: 5, mk: (R, L) => { if(R.r(0, 1)){ const n = R.pick([25, 75, 40, 60, 20, 80, 5, 35, 45, 12, 8, 125, 150, 175, 250]), ans = tFr(n, 100);
      return {q: L === 'th' ? `${tN(n / 100)} เขียนเป็นเศษส่วนอย่างต่ำได้อย่างไร` : `Write ${tN(n / 100)} as a fraction in simplest form.`, a: ans, o: [n + '/10', tFr(n, 1000), tFr(n + 5, 100), n % 10 ? tFr(100 - n % 100, 100) : '1/' + n],
        how: L === 'th' ? `${tN(n / 100)} = ${n}/100 = ${ans} (ตัดทอนด้วย ${tGcd(n, 100)})` : `${tN(n / 100)} = ${n}/100 = ${ans} (divide top and bottom by ${tGcd(n, 100)}).`}; }
    const [a, b] = R.pick([[1, 4], [3, 4], [1, 8], [3, 8], [5, 8], [7, 8], [2, 5], [3, 5], [4, 5], [1, 5], [7, 20], [9, 25], [1, 2]]), ans = tRd(a / b);
    return {q: L === 'th' ? `${a}/${b} เขียนเป็นทศนิยมได้เท่าใด` : `Write ${a}/${b} as a decimal.`, a: ans, o: [tRd(a + b / 10), tRd(a / 10), tRd(ans * 10), tRd(ans + 0.1)],
      how: L === 'th' ? `${a} ÷ ${b} = ${tN(ans)}` : `${a} ÷ ${b} = ${tN(ans)}.`}; }},
  // ===== Grade 6 / ป.6 =====
  {id: 'b6mean', g: 6, gt: 7, mk: (R, L) => { const m = R.r(8, 40), v = [0, 1, 2, 3].map(() => m + R.r(-7, 7)), last = 5 * m - v.reduce((a, b) => a + b, 0); if(last < 1 || last > 99) return null; const all = v.concat(last), sum = 5 * m;
    if(R.r(0, 1)) return {q: L === 'th' ? `คะแนนสอบย่อย 5 ครั้ง ได้ ${all.join(', ')} คะแนนเฉลี่ยเป็นเท่าใด` : `The scores on 5 quizzes were ${all.join(', ')}. What is the mean score?`, a: m, o: [all.slice().sort((a, b) => a - b)[2], Math.round(sum / 4), m + 1],
      how: L === 'th' ? `รวม = ${all.join(' + ')} = ${sum} แล้วหารด้วย 5 → ${sum} ÷ 5 = ${m}` : `Add: ${all.join(' + ')} = ${sum}. Divide by 5: ${sum} ÷ 5 = ${m}.`};
    return {q: L === 'th' ? `ค่าเฉลี่ยของจำนวน 5 จำนวนเท่ากับ ${m} ถ้า 4 จำนวนคือ ${v.join(', ')} จำนวนที่ 5 คือจำนวนใด` : `The mean of five numbers is ${m}. Four of them are ${v.join(', ')}. What is the fifth number?`, a: last, o: [m, sum - last - m, last + 5],
      how: L === 'th' ? `ผลรวมทั้งหมด = ${m} × 5 = ${sum}; ${sum} − (${v.join(' + ')}) = ${last}` : `Total = ${m} × 5 = ${sum}. ${sum} − (${v.join(' + ')}) = ${last}.`}; }},
  {id: 'b6median', g: 6, gt: 7, mk: (R, L) => { const k = R.r(0, 2), th = L === 'th';
    if(k === 1){ const md = R.r(2, 20), rest = []; while(rest.length < 4){ const x = R.r(1, 25); if(x !== md && !rest.includes(x)) rest.push(x); } const all = shuffle([md, md, md].concat(rest)), s = all.slice().sort((a, b) => a - b);
      return {q: th ? `ข้อมูล ${all.join(', ')} มีฐานนิยมเท่าใด` : `What is the mode of ${all.join(', ')}?`, a: md, o: [s[3], Math.max(...all), 3], how: th ? `ฐานนิยม = ค่าที่ซ้ำมากที่สุด: ${md} ซ้ำ 3 ครั้ง → ${md}` : `The mode is the number that appears most often: ${md} appears 3 times → ${md}.`}; }
    const all = []; while(all.length < 7){ const x = R.r(2, 60); if(!all.includes(x)) all.push(x); } const s = all.slice().sort((a, b) => a - b);
    if(k === 2) return {q: th ? `ข้อมูล ${all.join(', ')} มีพิสัยเท่าใด` : `What is the range of ${all.join(', ')}?`, a: s[6] - s[0], o: [s[6], s[3], s[6] + s[0]], how: th ? `พิสัย = ค่ามากที่สุด − ค่าน้อยที่สุด = ${s[6]} − ${s[0]} = ${s[6] - s[0]}` : `Range = greatest − least = ${s[6]} − ${s[0]} = ${s[6] - s[0]}.`};
    return {q: th ? `ข้อมูล ${all.join(', ')} มีมัธยฐานเท่าใด` : `What is the median of ${all.join(', ')}?`, a: s[3], o: [all[3], Math.round(all.reduce((a, b) => a + b, 0) / 7), Math.round((s[0] + s[6]) / 2)],
      how: th ? `เรียงจากน้อยไปมาก: ${s.join(', ')} → ตัวกลาง (ตัวที่ 4) = ${s[3]}` : `In order: ${s.join(', ')} → the middle (4th) number is ${s[3]}.`}; }},
  {id: 'b6ratio', g: 6, mk: (R, L) => { const a = R.r(1, 5), b = R.r(2, 7), k = R.r(2, 9), N = (a + b) * k; if(a === b || tGcd(a, b) !== 1) return null;
    return {q: L === 'th' ? `อัตราส่วนจำนวนนักเรียนชายต่อนักเรียนหญิงในชมรมเป็น ${a} : ${b} มีนักเรียนทั้งหมด ${N} คน มีนักเรียนหญิงกี่คน` : `The ratio of boys to girls in a club is ${a} : ${b}. There are ${N} children. How many are girls?`, a: b * k, o: [a * k, N - b, Math.round(N * b / (a + b + 1)), b * (k + 1)],
      how: L === 'th' ? `${a} + ${b} = ${a + b} ส่วน → 1 ส่วน = ${N} ÷ ${a + b} = ${k} คน → หญิง ${b} × ${k} = ${b * k} คน` : `${a} + ${b} = ${a + b} parts. One part = ${N} ÷ ${a + b} = ${k}. Girls = ${b} × ${k} = ${b * k}.`}; }},
  {id: 'b6pct', g: 6, mk: (R, L) => { const p = R.pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), N = R.r(2, 20) * (100 / tGcd(p, 100)), ans = N * p / 100;
    return {q: L === 'th' ? `ร้อยละ ${p} ของ ${fN(N)} เท่ากับเท่าใด` : `What is ${p}% of ${fN(N)}?`, a: ans, o: [N - ans, p, ans * 10, Math.round(N / p)],
      how: L === 'th' ? `ร้อยละ ${p} = ${p}/100 → ${fN(N)} × ${p} ÷ 100 = ${fN(ans)}` : `${p}% = ${p}/100 → ${fN(N)} × ${p} ÷ 100 = ${fN(ans)}.`}; }},
  {id: 'b6disc', g: 6, mk: (R, L) => { const p = R.pick([10, 20, 25, 30, 40, 50]), P = R.r(2, 30) * (p === 25 ? 20 : 10) * (L === 'th' ? 10 : 1), d = P * p / 100, s = P - d;
    const it = L === 'th' ? R.pick(['เสื้อ', 'รองเท้า', 'กระเป๋า', 'นาฬิกา']) : R.pick(['jacket', 'pair of shoes', 'backpack', 'watch']);
    return {q: L === 'th' ? `${it}ราคา ${fN(P)} บาท ลดราคาร้อยละ ${p} ต้องจ่ายเงินกี่บาท` : `A ${it} costs $${fN(P)}. It is on sale for ${p}% off. What is the sale price in dollars?`, a: s, o: [d, P - p, P + d],
      how: L === 'th' ? `ส่วนลด = ${fN(P)} × ${p} ÷ 100 = ${fN(d)} บาท → จ่าย ${fN(P)} − ${fN(d)} = ${fN(s)} บาท` : `Discount: ${p}% of $${fN(P)} = $${fN(d)}. Sale price: $${fN(P)} − $${fN(d)} = $${fN(s)}.`}; }},
  {id: 'b6gcf', g: 6, mk: (R, L) => { const g = R.r(2, 15), m = R.r(2, 9), n = R.r(2, 9); if(m === n || tGcd(m, n) !== 1) return null; const a = g * m, b = g * n, story = R.r(0, 1);
    return {q: L === 'th' ? (story ? `ริบบิ้น 2 เส้น ยาว ${a} ซม. และ ${b} ซม. ต้องการตัดเป็นท่อนยาวเท่ากันให้ยาวที่สุดโดยไม่เหลือเศษ แต่ละท่อนยาวกี่เซนติเมตร` : `ห.ร.ม. ของ ${a} และ ${b} คือจำนวนใด`) : (story ? `Two ribbons are ${a} cm and ${b} cm long. They are cut into equal pieces, as long as possible, with nothing left over. How long is each piece in cm?` : `What is the greatest common factor (GCF) of ${a} and ${b}?`),
      a: g, o: [a * b / g, m * n, g * 2, Math.abs(a - b) === g ? g + 1 : Math.abs(a - b)],
      how: L === 'th' ? `${a} = ${g} × ${m} และ ${b} = ${g} × ${n} (${m} กับ ${n} ไม่มีตัวประกอบร่วม) → ห.ร.ม. = ${g}` : `${a} = ${g} × ${m} and ${b} = ${g} × ${n} (${m} and ${n} share no factor) → GCF = ${g}.`}; }},
  {id: 'b6lcm', g: 6, mk: (R, L) => { const a = R.r(3, 15), b = R.r(4, 20); if(a === b || b % a === 0 || a % b === 0) return null; const l = tLcm(a, b), story = R.r(0, 1), th = L === 'th';
    return {q: th ? (story ? `ระฆัง 2 ใบ ใบแรกตีทุก ${a} นาที ใบที่สองตีทุก ${b} นาที ตีพร้อมกันเวลา 8.00 น. อีกอย่างน้อยกี่นาทีจะตีพร้อมกันอีกครั้ง` : `ค.ร.น. ของ ${a} และ ${b} คือจำนวนใด`) : (story ? `Bus A leaves every ${a} minutes and Bus B every ${b} minutes. They both leave at 8:00. After how many minutes do they next leave together?` : `What is the least common multiple (LCM) of ${a} and ${b}?`),
      a: l, o: [a * b === l ? l + a : a * b, tGcd(a, b), a + b, l * 2],
      how: th ? `พหุคูณของ ${b}: ${b}, ${2 * b}, ${3 * b}, … ตัวแรกที่ ${a} หารลงตัวคือ ${l} → ค.ร.น. = ${l}` : `Multiples of ${b}: ${b}, ${2 * b}, ${3 * b}, … the first one ${a} also divides is ${l} → LCM = ${l}.`}; }},
  {id: 'b6tri', g: 6, mk: (R, L) => { const b = R.r(3, 16), h = R.r(2, 12); if((b * h) % 2) return null; const ar = b * h / 2, u = L === 'th' ? 'ซม.' : 'cm';
    return {q: L === 'th' ? 'จงหาพื้นที่ของรูปสามเหลี่ยม (หน่วยเป็นตารางเซนติเมตร)' : 'Find the area of the triangle in square centimeters.', a: ar, o: [b * h, b + h, ar + b], fig: TF.tri(b, h, u),
      how: L === 'th' ? `พื้นที่ = 1/2 × ฐาน × สูง = 1/2 × ${b} × ${h} = ${ar} ตารางเซนติเมตร` : `Area = 1/2 × base × height = 1/2 × ${b} × ${h} = ${ar} square centimeters.`}; }},
  {id: 'b6para', g: 6, gt: 5, mk: (R, L) => { const b = R.r(4, 15), h = R.r(2, 10), ar = b * h, u = L === 'th' ? 'ซม.' : 'cm';
    return {q: L === 'th' ? 'จงหาพื้นที่ของรูปสี่เหลี่ยมด้านขนาน (หน่วยเป็นตารางเซนติเมตร)' : 'Find the area of the parallelogram in square centimeters.', a: ar, o: [(b * h) % 2 ? ar + h : ar / 2, 2 * (b + h), b + h], fig: TF.para(b, h, u),
      how: L === 'th' ? `พื้นที่ = ฐาน × สูง = ${b} × ${h} = ${ar} ตารางเซนติเมตร` : `Area = base × height = ${b} × ${h} = ${ar} square centimeters.`}; }},
  {id: 'b6neg', g: 6, only: 'en', mk: (R, L) => { const k = R.r(0, 2);
    if(k === 2){ const a = R.r(2, 15), b = R.r(2, 15); return {q: `What is |−${a}| + |${b}|?`, a: a + b, o: [b - a, Math.abs(b - a), a * b], neg: true, how: `|−${a}| = ${a} (distance from 0), |${b}| = ${b} → ${a} + ${b} = ${a + b}.`}; }
    const t = R.r(-12, 8), d = R.r(3, 15), up = k === 0, ans = up ? t + d : t - d; if(!ans || !t) return null;
    return {q: `At 6 a.m. the temperature was ${tN(t)}°F. By noon it was ${up ? d + ' degrees warmer' : d + ' degrees colder'}. What was the temperature at noon, in °F?`, a: ans, o: [up ? t - d : t + d, -ans, Math.abs(t) + d], neg: true,
      how: `${tN(t)} ${up ? '+' : '−'} ${d} = ${tN(ans)} — on a number line, move ${d} ${up ? 'up' : 'down'} from ${tN(t)}.`}; }},
  {id: 'b6eq', g: 6, mk: (R, L) => { const k = R.r(0, 3), x = R.r(2, 15), a = R.r(2, k === 1 ? 9 : k === 3 ? 6 : 25), th = L === 'th'; let e, ans, w, o;
    if(k === 0){ e = `x + ${a} = ${x + a}`; ans = x; w = th ? `นำ ${a} มาลบทั้งสองข้าง: x = ${x + a} − ${a} = ${x}` : `Subtract ${a} from both sides: x = ${x + a} − ${a} = ${x}`; o = [x + 2 * a, x + a, a]; }
    else if(k === 1){ e = `${a}x = ${a * x}`; ans = x; w = th ? `นำ ${a} มาหารทั้งสองข้าง: x = ${a * x} ÷ ${a} = ${x}` : `Divide both sides by ${a}: x = ${a * x} ÷ ${a} = ${x}`; o = [a * a * x, a * x - a, a * x + a]; }
    else if(k === 2){ e = `x − ${a} = ${x}`; ans = x + a; w = th ? `นำ ${a} มาบวกทั้งสองข้าง: x = ${x} + ${a} = ${ans}` : `Add ${a} to both sides: x = ${x} + ${a} = ${ans}`; o = [Math.abs(x - a), x, a]; }
    else { e = `x ÷ ${a} = ${x}`; ans = x * a; w = th ? `นำ ${a} มาคูณทั้งสองข้าง: x = ${x} × ${a} = ${ans}` : `Multiply both sides by ${a}: x = ${x} × ${a} = ${ans}`; o = [x + a, Math.floor(x / a) || x + 1, ans + a]; }
    return {q: th ? `จงแก้สมการ ${e}` : `Solve for x: ${e}`, a: ans, o, how: w + (th ? '' : '.')}; }},
  {id: 'b6fdiv', g: 6, mk: (R, L) => { if(R.r(0, 1)){ const N = R.r(2, 9), c = R.pick([2, 3, 4, 5, 8, 10]), ans = N * c;
      return {q: L === 'th' ? `เชือกยาว ${N} เมตร ตัดเป็นท่อน ท่อนละ 1/${c} เมตร ได้กี่ท่อน` : `A rope is ${N} m long. It is cut into pieces 1/${c} m long. How many pieces?`, a: ans, o: [N + c, ans - 1, N * (c + 1)],
        how: L === 'th' ? `${N} ÷ 1/${c} = ${N} × ${c} = ${ans} ท่อน` : `${N} ÷ 1/${c} = ${N} × ${c} = ${ans} pieces.`}; }
    const [c, d] = R.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 8], [5, 6]]), k = R.r(2, 9), top = tFr(k * c, d);
    return {q: L === 'th' ? `${top} ÷ ${c}/${d} มีค่าเท่าใด` : `What is ${top} ÷ ${c}/${d}?`, a: k, o: [k + 1, k * 2, k * d],
      how: L === 'th' ? `หารด้วย ${c}/${d} = คูณด้วย ${d}/${c}: ${k * c}/${d} × ${d}/${c} = ${k}` : `Dividing by ${c}/${d} = multiplying by ${d}/${c}: ${k * c}/${d} × ${d}/${c} = ${k}.`}; }},
  {id: 'b6pctof', g: 6, mk: (R, L) => { const n = R.pick([20, 25, 40, 50, 80, 200]), st = 100 / tGcd(n, 100), p = st * R.r(Math.ceil(10 / st), Math.floor(95 / st)), s = n * p / 100; if(!s || s >= n) return null;
    return {q: L === 'th' ? `สอบได้ ${s} คะแนน จากคะแนนเต็ม ${n} คะแนน คิดเป็นร้อยละเท่าใด` : `Ann scored ${s} points out of ${n} on a test. What percent is that?`, a: p, o: [s, n - s, 100 - p],
      how: L === 'th' ? `${s}/${n} × 100 = ${p} → ร้อยละ ${p}` : `${s}/${n} × 100 = ${p} → ${p}%.`}; }},
  {id: 'b6exp', g: 6, only: 'en', mk: (R, L) => { const b = R.r(2, 9), e = b <= 3 ? R.r(2, 5) : R.r(2, 3), ans = Math.pow(b, e);
    return {q: `What is ${b}${tSup(e)}?`, a: ans, o: [b * e, b + e, Math.pow(b, e - 1)], how: `${b}${tSup(e)} = ${Array(e).fill(b).join(' × ')} = ${fN(ans)} (not ${b} × ${e}).`}; }},
  {id: 'b6circle', g: 6, only: 'th', mk: (R, L) => { const r = 7 * R.r(1, 5), area = R.r(0, 1), d = R.r(0, 1) && !area, ans = area ? 22 * r * r / 7 : 44 * r / 7;
    return {q: `วงกลมมี${d ? 'เส้นผ่านศูนย์กลาง ' + 2 * r : 'รัศมี ' + r} เซนติเมตร ${area ? 'มีพื้นที่กี่ตารางเซนติเมตร' : 'ความยาวรอบวงกี่เซนติเมตร'} (ใช้ π ≈ 22/7)`, a: ans, o: area ? [44 * r / 7, 22 * r / 7 * 2 * r, 22 * r / 7] : [22 * r / 7, 22 * r * r / 7, 88 * r / 7],
      how: area ? `พื้นที่ = πr² = 22/7 × ${r} × ${r} = ${fN(ans)} ตารางเซนติเมตร` : `ความยาวรอบวง = 2πr = 2 × 22/7 × ${r} = ${fN(ans)} เซนติเมตร${d ? ' (รัศมี = ' + 2 * r + ' ÷ 2 = ' + r + ')' : ''}`}; }},
  {id: 'b6pie', g: 6, only: 'th', mk: (R, L) => { const P = shuffle([[40, 25, 20, 15], [50, 20, 20, 10], [30, 30, 25, 15], [45, 25, 20, 10], [35, 30, 20, 15]].map(x => x)[0]), f = shuffle(['มะม่วง', 'ทุเรียน', 'มังคุด', 'เงาะ', 'ส้ม']).slice(0, 4);
    const N = R.pick([40, 80, 120, 200, 400, 360]), i = R.r(0, 3), ans = N * P[i] / 100; if(ans % 1) return null;
    return {q: `แผนภูมิรูปวงกลมแสดงผลไม้ที่นักเรียน ${N} คนชอบ มีนักเรียนชอบ${f[i]}กี่คน`, a: ans, o: [P[i], N * P[(i + 1) % 4] / 100, ans * 2], fig: TF.pie(P.map((p, k) => ({pct: p, label: f[k]}))),
      how: `${f[i]} = ร้อยละ ${P[i]} → ${N} × ${P[i]} ÷ 100 = ${ans} คน`}; }},
  {id: 'c8tri', g: 8, gt: 6, mk: (R, L) => { const A = R.r(25, 85), B = R.r(25, 85), C = 180 - A - B; if(C < 15) return null; const ext = L === 'en' && R.r(0, 2) === 0;
    if(ext) return {q: `Two angles of a triangle are ${A}° and ${B}°. What is the exterior angle at the third corner, in degrees?`, a: A + B, o: [C, 180 - A, 360 - A - B], fig: TF.triA(A, B), how: `Exterior angle = sum of the two far angles = ${A}° + ${B}° = ${A + B}° (or 180° − ${C}°).`};
    return {q: L === 'th' ? `รูปสามเหลี่ยมมีมุมสองมุมขนาด ${A}° และ ${B}° มุมที่เหลือมีขนาดกี่องศา` : `Two angles of a triangle are ${A}° and ${B}°. What is the third angle, in degrees?`, a: C, o: [A + B, 360 - A - B, 90 - Math.abs(A - B)], fig: TF.triA(A, B),
      how: L === 'th' ? `มุมภายในรูปสามเหลี่ยมรวมกันได้ 180° → 180 − ${A} − ${B} = ${C}°` : `The angles of a triangle add up to 180°: 180 − ${A} − ${B} = ${C}°.`}; }},
  // ===== Grade 7 / ม.1 =====
  {id: 'c7int', g: 7, mk: (R, L) => { const k = R.r(0, 3), th = L === 'th'; let a, b, e, ans, w;
    if(k === 0){ a = -R.r(2, 20); b = R.r(2, 20); if(-a === b) return null; e = `${tPar(a)} + ${b}`; ans = a + b; w = th ? `เครื่องหมายต่างกัน: ${-a} กับ ${b} นำมาลบกัน ได้ ${Math.abs(-a - b)} ใช้เครื่องหมายของจำนวนที่ค่าสัมบูรณ์มากกว่า → ${tN(ans)}` : `Different signs: ${Math.max(-a, b)} − ${Math.min(-a, b)} = ${Math.abs(-a - b)}, keep the sign of the bigger one → ${tN(ans)}`; }
    else if(k === 1){ a = R.r(-15, 10); b = -R.r(2, 15); if(!a) return null; e = `${tPar(a)} − ${tPar(b)}`; ans = a - b; w = th ? `ลบจำนวนลบ = บวกจำนวนบวก: ${tPar(a)} + ${-b} = ${tN(ans)}` : `Subtracting a negative = adding: ${tPar(a)} + ${-b} = ${tN(ans)}`; }
    else if(k === 2){ a = -R.r(2, 12); b = R.r(-12, 12); if(!b || b === 1 || b === -1) return null; e = `${tPar(a)} × ${tPar(b)}`; ans = a * b; w = th ? `${-a} × ${Math.abs(b)} = ${Math.abs(ans)} เครื่องหมาย${b < 0 ? 'เหมือนกันได้บวก' : 'ต่างกันได้ลบ'} → ${tN(ans)}` : `${-a} × ${Math.abs(b)} = ${Math.abs(ans)}; ${b < 0 ? 'same signs → positive' : 'different signs → negative'} → ${tN(ans)}`; }
    else { b = R.r(2, 12) * (R.r(0, 1) ? -1 : 1); const qv = R.r(2, 12) * (R.r(0, 1) ? -1 : 1); a = b * qv; ans = qv; e = `${tPar(a)} ÷ ${tPar(b)}`; w = th ? `${Math.abs(a)} ÷ ${Math.abs(b)} = ${Math.abs(qv)} เครื่องหมาย${(a < 0) === (b < 0) ? 'เหมือนกันได้บวก' : 'ต่างกันได้ลบ'} → ${tN(ans)}` : `${Math.abs(a)} ÷ ${Math.abs(b)} = ${Math.abs(qv)}; ${(a < 0) === (b < 0) ? 'same signs → positive' : 'different signs → negative'} → ${tN(ans)}`; }
    return {q: th ? `${e} มีค่าเท่าใด` : `What is ${e}?`, a: ans, o: [-ans, k === 0 ? Math.abs(a) + b : k === 1 ? a + b : ans + (ans > 0 ? -1 : 1) * 2, ans + 10], neg: true, how: w + (th ? '' : '.')}; }},
  {id: 'c7eq2', g: 7, mk: (R, L) => { const a = R.r(2, 9), x = R.r(-6, 12), b = R.r(1, 20), plus = R.r(0, 1); if(!x) return null; const c = plus ? a * x + b : a * x - b, e = `${a}x ${plus ? '+' : '−'} ${b} = ${tN(c)}`, mid = plus ? c - b : c + b;
    return {q: L === 'th' ? `จงแก้สมการ ${e}` : `Solve for x: ${e}`, a: x, o: [plus ? c + b : c - b, mid, -x, x + 1], neg: true,
      how: L === 'th' ? `${plus ? 'ลบ' : 'บวก'} ${b} ทั้งสองข้าง: ${a}x = ${tN(mid)} → หารด้วย ${a}: x = ${tN(x)}` : `${plus ? 'Subtract' : 'Add'} ${b} ${plus ? 'from' : 'to'} both sides: ${a}x = ${tN(mid)}. Divide by ${a}: x = ${tN(x)}.`}; }},
  {id: 'c7prop', g: 7, mk: (R, L) => { const th = L === 'th';
    if(R.r(0, 1)){ const n1 = R.r(2, 6), u = R.r(3, 25) * (th ? 5 : 1), n2 = R.r(n1 + 1, 12), P1 = n1 * u, ans = n2 * u, it = th ? R.pick([['ปากกา', 'ด้าม'], ['สมุด', 'เล่ม'], ['ไข่ไก่', 'ฟอง']]) : R.pick(['pens', 'notebooks', 'muffins']);
      return {q: th ? `${it[0]} ${n1} ${it[1]} ราคา ${fN(P1)} บาท ถ้าซื้อ ${n2} ${it[1]} ต้องจ่ายกี่บาท` : `${n1} ${it} cost $${P1}. At the same price, how many dollars do ${n2} ${it} cost?`, a: ans, o: [P1 + (n2 - n1), P1 * n2, ans + u],
        how: th ? `ราคา 1 ${it[1]} = ${fN(P1)} ÷ ${n1} = ${u} บาท → ${n2} × ${u} = ${fN(ans)} บาท` : `1 costs $${P1} ÷ ${n1} = $${u}. ${n2} × $${u} = $${fN(ans)}.`}; }
    const h1 = R.r(2, 4), v = R.r(4, 18) * 5, h2 = R.r(h1 + 1, 8), d1 = h1 * v, ans = h2 * v, un = th ? 'กิโลเมตร' : 'miles';
    return {q: th ? `รถยนต์แล่นได้ทาง ${fN(d1)} กิโลเมตร ใน ${h1} ชั่วโมง ถ้าแล่นด้วยอัตราเร็วเท่าเดิม ${h2} ชั่วโมงจะได้ระยะทางกี่กิโลเมตร` : `A car travels ${d1} miles in ${h1} hours. At the same speed, how many miles does it travel in ${h2} hours?`, a: ans, o: [d1 + (h2 - h1), d1 * h2, ans - v],
      how: th ? `1 ชั่วโมง = ${fN(d1)} ÷ ${h1} = ${v} ${un} → ${h2} × ${v} = ${fN(ans)} ${un}` : `1 hour = ${d1} ÷ ${h1} = ${v} ${un}. ${h2} × ${v} = ${fN(ans)} ${un}.`}; }},
  {id: 'c7pctchg', g: 7, mk: (R, L) => { const p = R.pick([10, 20, 25, 50, -10, -20, -25, -40, 30, 15]), O = R.r(2, 30) * 20, N = O * (100 + p) / 100, up = p > 0, th = L === 'th'; if(N % 1) return null;
    return {q: th ? `ราคาสินค้า${up ? 'เพิ่มขึ้น' : 'ลดลง'}จาก ${fN(O)} บาท เป็น ${fN(N)} บาท ${up ? 'เพิ่มขึ้น' : 'ลดลง'}ร้อยละเท่าใด` : `A price ${up ? 'went up' : 'went down'} from $${fN(O)} to $${fN(N)}. By what percent did it ${up ? 'increase' : 'decrease'}?`, a: Math.abs(p), o: [Math.abs(N - O), Math.abs(p) + 5, Math.round(Math.abs(N - O) / N * 100)],
      how: th ? `เปลี่ยนไป ${fN(Math.abs(N - O))} บาท → ${fN(Math.abs(N - O))} ÷ ${fN(O)} × 100 = ${Math.abs(p)} (เทียบกับราคาเดิมเสมอ)` : `Change = $${fN(Math.abs(N - O))}. ${fN(Math.abs(N - O))} ÷ ${fN(O)} × 100 = ${Math.abs(p)}% (always compare with the old price).`}; }},
  {id: 'c7tax', g: 7, mk: (R, L) => { if(L === 'th'){ const P = R.r(1, 30) * 100, v = P * 7 / 100, ans = P + v;
      return {q: `สินค้าราคา ${fN(P)} บาท ยังไม่รวมภาษีมูลค่าเพิ่มร้อยละ 7 ต้องจ่ายเงินทั้งหมดกี่บาท`, a: ans, o: [v, P + 7, P * 17 / 10, ans + 7], how: `ภาษี = ${fN(P)} × 7 ÷ 100 = ${fN(v)} บาท → ${fN(P)} + ${fN(v)} = ${fN(ans)} บาท`}; }
    const P = R.r(12, 120), t = R.pick([5, 6, 8, 10]), tax = P * t, tot = P * 100 + tax, it = R.pick(['game', 'lamp', 'toy robot', 'skateboard']);
    return {q: `A ${it} costs $${P}. The sales tax is ${t}%. What is the total cost?`, a: tMoney(tot), o: [tMoney(tax), tMoney((P + t) * 100), tMoney(P * 100 - tax), tMoney(tot + 100)],
      how: `Tax: ${t}% of $${P} = ${tMoney(tax)}. Total: $${P}.00 + ${tMoney(tax)} = ${tMoney(tot)}.`}; }},
  {id: 'c7circle', g: 7, only: 'en', mk: (R, L) => { const r = R.r(1, 10), area = R.r(0, 1), d = R.r(0, 1), ans = tRd(area ? 3.14 * r * r : 2 * 3.14 * r);
    return {q: `A circle has a ${d ? 'diameter of ' + 2 * r : 'radius of ' + r} cm. What is its ${area ? 'area in square cm' : 'circumference in cm'}? Use 3.14 for π.`, a: ans, o: area ? [tRd(2 * 3.14 * r), tRd(3.14 * 4 * r * r), tRd(3.14 * r)] : [tRd(3.14 * r * r), tRd(3.14 * r), tRd(4 * 3.14 * r)],
      how: (d ? `Radius = ${2 * r} ÷ 2 = ${r}. ` : '') + (area ? `A = πr² = 3.14 × ${r} × ${r} = ${tN(ans)} square cm.` : `C = 2πr = 2 × 3.14 × ${r} = ${tN(ans)} cm.`)}; }},
  {id: 'c7angles', g: 7, mk: (R, L) => { const k = R.r(0, 2), th = L === 'th';
    if(k === 0){ const a = R.r(25, 155); if(a === 90) return null; return {q: th ? `จากรูป มุมที่ไม่ทราบค่ามีขนาดกี่องศา` : `The angles in the picture are on a straight line. What is the missing angle, in degrees?`, a: 180 - a, o: [90 - a > 0 ? 90 - a : a + 10, a, 360 - a], fig: TF.line2(a, true),
      how: th ? `มุมบนเส้นตรงรวมกันได้ 180° → 180 − ${a} = ${180 - a}°` : `Angles on a straight line add to 180°: 180 − ${a} = ${180 - a}°.`}; }
    const a = R.r(12, 78);
    if(k === 1) return {q: th ? `มุมสองมุมเป็นมุมประกอบกันเป็นมุมฉาก มุมหนึ่งมีขนาด ${a}° อีกมุมหนึ่งมีขนาดกี่องศา` : `Two angles are complementary. One is ${a}°. What is the other, in degrees?`, a: 90 - a, o: [180 - a, a, 360 - a], how: th ? `มุมประกอบกันเป็นมุมฉากรวมกันได้ 90° → 90 − ${a} = ${90 - a}°` : `Complementary angles add to 90°: 90 − ${a} = ${90 - a}°.`};
    const b = R.r(20, 160); if(b === 90) return null;
    return {q: th ? `เส้นตรงสองเส้นตัดกัน มุมหนึ่งมีขนาด ${b}° มุมตรงข้ามกับมุมนี้มีขนาดกี่องศา` : `Two straight lines cross. One angle is ${b}°. What is the vertical (opposite) angle, in degrees?`, a: b, o: [180 - b, 360 - b, b > 90 ? b - 90 : 90 - b], how: th ? `มุมตรงข้ามมีขนาดเท่ากัน → ${b}°` : `Vertical angles are equal → ${b}°.`}; }},
  {id: 'c7prob', g: 7, only: 'en', mk: (R, L) => { const r = R.r(1, 8), b = R.r(1, 8), gr = R.r(1, 6), T = r + b + gr, col = R.pick([['red', r], ['blue', b], ['green', gr]]), ans = tFr(col[1], T);
    return {q: `A bag has ${r} red, ${b} blue and ${gr} green marble${gr > 1 ? 's' : ''}. You pick one without looking. What is the probability it is ${col[0]}?`, a: ans, o: [col[1] < T - col[1] ? tFr(col[1], T - col[1]) : tFr(col[1], T + 1), tFr(T - col[1], T), '1/3', tFr(1, col[1] + 1)],
      how: `Probability = ${col[0]} marbles ÷ all marbles = ${col[1]}/${T}${col[1] + '/' + T === ans ? '' : ' = ' + ans}.`}; }},
  {id: 'c7expr', g: 7, mk: (R, L) => { const a = R.r(2, 9), b = R.r(1, 9), x = R.r(-5, 8); if(!x) return null; const ans = a * (x + b);
    return {q: L === 'th' ? `ถ้า x = ${tN(x)} แล้ว ${a}(x + ${b}) มีค่าเท่าใด` : `What is the value of ${a}(x + ${b}) when x = ${tN(x)}?`, a: ans, o: [a * x + b, a + x + b, ans + a], neg: true,
      how: L === 'th' ? `แทน x = ${tN(x)}: ${a}(${tN(x)} + ${b}) = ${a} × ${tN(x + b)} = ${tN(ans)}` : `Put in x = ${tN(x)}: ${a}(${tN(x)} + ${b}) = ${a} × ${tN(x + b)} = ${tN(ans)}.`}; }},
  {id: 'c7like', g: 7, gt: 8, mk: (R, L) => { const a = R.r(2, 9), c = R.r(2, 9), b = R.r(1, 9), d = R.r(1, 9); if(b === d) return null; const k = b - d, T = (p, q) => p + 'x' + (q ? (q > 0 ? ' + ' + q : ' − ' + (-q)) : ''), ans = T(a + c, k);
    return {q: L === 'th' ? `(${a}x + ${b}) + (${c}x − ${d}) เท่ากับข้อใด` : `Simplify: ${a}x + ${b} + ${c}x − ${d}`, a: ans, o: [(a + c + k) + 'x', T(a + c, b + d), T(a * c, k), T(a + c + 1, k)],
      how: L === 'th' ? `รวมพจน์ที่คล้ายกัน: ${a}x + ${c}x = ${a + c}x และ ${b} − ${d} = ${tN(k)} → ${ans}` : `Combine like terms: ${a}x + ${c}x = ${a + c}x and ${b} − ${d} = ${tN(k)} → ${ans}.`}; }},
  {id: 'c7scale', g: 7, mk: (R, L) => { if(L === 'th'){ const S = R.pick([10000, 20000, 25000, 50000, 100000, 200000]), d = R.r(2, 12), ans = tRd(d * S / 100000);
      return {q: `แผนที่ใช้มาตราส่วน 1 : ${fN(S)} ระยะทางบนแผนที่ ${d} ซม. เป็นระยะทางจริงกี่กิโลเมตร`, a: ans, o: [tRd(ans * 10), tRd(ans / 10), d * S], how: `1 ซม. แทน ${fN(S)} ซม. = ${tN(S / 100000)} กม. → ${d} × ${tN(S / 100000)} = ${tN(ans)} กิโลเมตร`}; }
    const s = R.pick([10, 20, 25, 40, 50]), d = R.r(3, 19) / 2, ans = tRd(d * s);
    return {q: `On a map, 1 inch represents ${s} miles. Two towns are ${tN(d)} inches apart on the map. How many miles apart are they?`, a: ans, o: [tRd(s + d), tRd(ans / 2), tRd(ans + s)], how: `${tN(d)} × ${s} = ${tN(ans)} miles.`}; }},
  {id: 'c7interest', g: 7, mk: (R, L) => { const P = R.r(2, 20) * 500, r = R.pick([2, 3, 4, 5, 6]), t = R.r(2, 4), I = P * r * t / 100, tot = R.r(0, 1), th = L === 'th';
    return {q: th ? `ฝากเงิน ${fN(P)} บาท ได้ดอกเบี้ยร้อยละ ${r} ต่อปี (ดอกเบี้ยคงต้น) เป็นเวลา ${t} ปี ${tot ? 'จะมีเงินรวมทั้งหมดกี่บาท' : 'จะได้ดอกเบี้ยกี่บาท'}` : `You save $${fN(P)} at ${r}% simple interest per year for ${t} years. ${tot ? 'How much money will you have in total?' : 'How much interest will you earn?'}`, a: tot ? P + I : I, o: tot ? [I, P + P * r / 100, P + I * 2] : [P * r / 100, P + I, I * 2],
      how: th ? `ดอกเบี้ย = ${fN(P)} × ${r} ÷ 100 × ${t} = ${fN(I)} บาท${tot ? ' → รวม ' + fN(P) + ' + ' + fN(I) + ' = ' + fN(P + I) + ' บาท' : ''}` : `Interest = $${fN(P)} × ${r}% × ${t} = $${fN(I)}${tot ? '. Total = $' + fN(P) + ' + $' + fN(I) + ' = $' + fN(P + I) : ''}.`}; }},
  {id: 'c7profit', g: 7, only: 'th', mk: (R, L) => { const p = R.pick([10, 20, 25, 40, 50, -10, -20, -25]), C = R.r(2, 40) * 20, S = C * (100 + p) / 100, gain = p > 0; if(S % 1) return null;
    return {q: `ซื้อสินค้ามา ${fN(C)} บาท ขายไป ${fN(S)} บาท ${gain ? 'ได้กำไร' : 'ขาดทุน'}ร้อยละเท่าใด`, a: Math.abs(p), o: [Math.abs(S - C), Math.round(Math.abs(S - C) / S * 100), Math.abs(p) + 5],
      how: `${gain ? 'กำไร' : 'ขาดทุน'} ${fN(Math.abs(S - C))} บาท → ${fN(Math.abs(S - C))} ÷ ${fN(C)} × 100 = ${Math.abs(p)} (คิดจากราคาทุนเสมอ)`}; }},
  {id: 'c7ineq', g: 7, only: 'en', mk: (R, L) => { const a = R.r(2, 6), x = R.r(-4, 9), b = R.r(1, 12), flip = R.r(0, 2) === 0, s = R.pick(['>', '<']), o2 = s === '>' ? '<' : '>', S = v => 'x ' + v + ' ' + tN(x);
    if(flip){ const c = -a * x; return {q: `Solve: −${a}x ${s} ${tN(c)}`, a: S(o2), o: [S(s), 'x ' + o2 + ' ' + tN(-x), 'x ' + s + ' ' + tN(c + a)], how: `Divide both sides by −${a} and FLIP the sign: x ${o2} ${tN(c)} ÷ (−${a}) → ${S(o2)}.`}; }
    const c = a * x + b; return {q: `Solve: ${a}x + ${b} ${s} ${tN(c)}`, a: S(s), o: [S(o2), 'x ' + s + ' ' + tN(c - b), 'x ' + s + ' ' + tN(x + b)], how: `Subtract ${b}: ${a}x ${s} ${tN(c - b)}. Divide by ${a} → ${S(s)}.`}; }},
  // ===== Grade 8 / ม.2 =====
  {id: 'c8pyth', g: 8, mk: (R, L) => { const [p, q, h] = R.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [12, 16, 20], [9, 40, 41], [20, 21, 29]]), m = R.r(0, 2), u = L === 'th' ? 'ซม.' : 'cm', miss = m === 2 ? 'c' : m ? 'b' : 'a', ans = miss === 'c' ? h : miss === 'b' ? q : p;
    const t = miss === 'c' ? `${p}² + ${q}² = ${p * p} + ${q * q} = ${h * h} → √${h * h} = ${h}` : `${h}² − ${miss === 'a' ? q : p}² = ${h * h} − ${(miss === 'a' ? q : p) ** 2} = ${ans * ans} → √${ans * ans} = ${ans}`;
    return {q: L === 'th' ? 'รูปสามเหลี่ยมมุมฉากในรูป ด้านที่ไม่ทราบความยาวยาวกี่เซนติเมตร' : 'In the right triangle, how long is the missing side in cm?', a: ans, o: miss === 'c' ? [p + q, p * p + q * q, h + 1] : [h - (miss === 'a' ? q : p), h + (miss === 'a' ? q : p), ans + 1], fig: TF.rtri(p, q, h, u, miss),
      how: (L === 'th' ? 'ทฤษฎีบทพีทาโกรัส a² + b² = c²: ' : 'Pythagoras a² + b² = c²: ') + t + (L === 'th' ? ' เซนติเมตร' : ' cm.')}; }},
  {id: 'c8sci', g: 8, gt: 7, mk: (R, L) => { const th = L === 'th', F = (m, e) => tN(m) + ' × 10' + tSup(e);
    if(R.r(0, 2) === 0){ const a = R.r(2, 9), b = R.r(2, 4), e1 = R.r(2, 6), e2 = R.r(2, 6), pr = a * b, m = pr >= 10 ? pr / 10 : pr, e = e1 + e2 + (pr >= 10 ? 1 : 0), ans = F(m, e);
      return {q: th ? `(${a} × 10${tSup(e1)}) × (${b} × 10${tSup(e2)}) เท่ากับข้อใด (ในรูปสัญกรณ์วิทยาศาสตร์)` : `What is (${a} × 10${tSup(e1)}) × (${b} × 10${tSup(e2)}) in scientific notation?`, a: ans, o: [F(pr, e1 + e2), F(m, e1 * e2), F(a + b, e1 + e2), F(m, e + 1), F(m, e - 1)],
        how: (th ? 'คูณตัวเลข: ' : 'Multiply the numbers: ') + `${a} × ${b} = ${pr}; ` + (th ? 'บวกเลขชี้กำลัง: ' : 'add the powers: ') + `10${tSup(e1)} × 10${tSup(e2)} = 10${tSup(e1 + e2)}` + (pr >= 10 ? ` → ${pr} × 10${tSup(e1 + e2)} = ${ans}` : ` → ${ans}`)}; }
    const m = R.r(11, 99) / 10, small = R.r(0, 2) === 0, e = small ? -R.r(2, 5) : R.r(3, 7), x = tRd(m * Math.pow(10, e)), ans = F(m, e);
    return {q: th ? `${tN(x)} เขียนในรูปสัญกรณ์วิทยาศาสตร์ได้อย่างไร` : `Write ${tN(x)} in scientific notation.`, a: ans, o: [F(m * 10, e - 1), F(m, e + (small ? -1 : 1)), F(m, -e), F(tRd(m / 10), e + 1)],
      how: th ? `เลื่อนจุดทศนิยมไป${small ? 'ทางขวา' : 'ทางซ้าย'} ${Math.abs(e)} ตำแหน่งให้ได้ ${tN(m)} (อยู่ระหว่าง 1 ถึง 10) → ${ans}` : `Move the decimal point ${Math.abs(e)} places to the ${small ? 'right' : 'left'} to get ${tN(m)} (between 1 and 10) → ${ans}.`}; }},
  {id: 'c8exp', g: 8, gt: 7, mk: (R, L) => { const k = R.r(0, 3), th = L === 'th', b = R.r(2, 9), m = R.r(2, 9), n = R.r(2, 9);
    if(k === 0) return {q: th ? `ถ้า ${b}${tSup(m)} × ${b}${tSup(n)} = ${b}ⁿ แล้ว n มีค่าเท่าใด` : `${b}${tSup(m)} × ${b}${tSup(n)} = ${b}ⁿ. What is n?`, a: m + n, o: [m * n, Math.abs(m - n) || m + n + 1, m + n + 1], how: th ? `ฐานเท่ากัน คูณกัน → นำเลขชี้กำลังมาบวกกัน: ${m} + ${n} = ${m + n}` : `Same base, multiply → add the powers: ${m} + ${n} = ${m + n}.`};
    if(k === 1){ if(m <= n) return null; return {q: th ? `ถ้า ${b}${tSup(m)} ÷ ${b}${tSup(n)} = ${b}ⁿ แล้ว n มีค่าเท่าใด` : `${b}${tSup(m)} ÷ ${b}${tSup(n)} = ${b}ⁿ. What is n?`, a: m - n, o: [m + n, Math.floor(m / n) === m - n ? m - n + 2 : Math.floor(m / n), m - n + 1], how: th ? `ฐานเท่ากัน หารกัน → นำเลขชี้กำลังมาลบกัน: ${m} − ${n} = ${m - n}` : `Same base, divide → subtract the powers: ${m} − ${n} = ${m - n}.`}; }
    if(k === 2){ const c = R.r(2, 5), p = R.r(2, 3), ans = Math.pow(-c, p); return {q: th ? `(${'−' + c})${tSup(p)} มีค่าเท่าใด` : `What is (−${c})${tSup(p)}?`, a: ans, o: [-ans, -c * p, c * p], neg: true, how: `(−${c})${tSup(p)} = ${Array(p).fill('(−' + c + ')').join(' × ')} = ${tN(ans)}` + (th ? (p % 2 ? ' (คูณจำนวนลบคี่ครั้งได้ลบ)' : ' (คูณจำนวนลบคู่ครั้งได้บวก)') : (p % 2 ? ' (odd number of negatives → negative).' : ' (even number of negatives → positive).'))}; }
    return {q: th ? `${b}⁰ + ${n}¹ มีค่าเท่าใด` : `What is ${b}⁰ + ${n}¹?`, a: 1 + n, o: [n, b + n, 1], how: th ? `จำนวนใด ๆ (ที่ไม่ใช่ 0) ยกกำลัง 0 ได้ 1 และ ${n}¹ = ${n} → 1 + ${n} = ${1 + n}` : `Any number (not 0) to the power 0 is 1, and ${n}¹ = ${n} → 1 + ${n} = ${1 + n}.`}; }},
  {id: 'c8sqrt', g: 8, mk: (R, L) => { const th = L === 'th';
    if(R.r(0, 1)){ const n = R.r(11, 25); return {q: th ? `√${n * n} มีค่าเท่าใด` : `What is √${fN(n * n)}?`, a: n, o: [n * n / 2 % 1 ? n + 1 : n * n / 2, n - 1, n + 2], how: th ? `${n} × ${n} = ${n * n} → √${n * n} = ${n}` : `${n} × ${n} = ${fN(n * n)} → √${fN(n * n)} = ${n}.`}; }
    const a = R.r(3, 12), x = R.r(a * a + 1, (a + 1) * (a + 1) - 1), J = (p, q) => th ? `${p} กับ ${q}` : `${p} and ${q}`, ans = J(a, a + 1);
    return {q: th ? `√${x} อยู่ระหว่างจำนวนเต็มคู่ใด` : `√${x} is between which two whole numbers?`, a: ans, o: [J(a - 1, a), J(a + 1, a + 2), J(Math.floor(x / 2), Math.floor(x / 2) + 1)],
      how: th ? `${a}² = ${a * a} และ ${a + 1}² = ${(a + 1) * (a + 1)} โดย ${a * a} < ${x} < ${(a + 1) * (a + 1)} → ${ans}` : `${a}² = ${a * a} and ${a + 1}² = ${(a + 1) * (a + 1)}, and ${a * a} < ${x} < ${(a + 1) * (a + 1)} → ${ans}.`}; }},
  {id: 'c8slope', g: 8, only: 'en', mk: (R, L) => { const m = R.r(-4, 4), x1 = R.r(-3, 3), y1 = R.r(-5, 5), dx = R.r(1, 4), x2 = x1 + dx, y2 = y1 + m * dx; if(!m) return null; const P = (a, b) => '(' + tN(a) + ', ' + tN(b) + ')';
    return {q: `What is the slope of the line through ${P(x1, y1)} and ${P(x2, y2)}?`, a: m, o: [-m, m * dx, dx, m + 1], neg: true,
      how: `Slope = rise ÷ run = (${tN(y2)} − ${tPar(y1)}) ÷ (${tN(x2)} − ${tPar(x1)}) = ${tN(m * dx)} ÷ ${dx} = ${tN(m)}.`}; }},
  {id: 'c8linear', g: 8, gt: 7, mk: (R, L) => { const a = R.r(-5, 6), b = R.r(-9, 9), x = R.r(-4, 6); if(!a || a === 1 || !b) return null; const ans = a * x + b, f = `y = ${a < 0 ? '−' + (-a) : a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)}`;
    return {q: L === 'th' ? `กำหนด ${f} ถ้า x = ${tN(x)} แล้ว y มีค่าเท่าใด` : `For the line ${f}, what is y when x = ${tN(x)}?`, a: ans, o: [a * x - b, a + x + b, -ans], neg: true,
      how: `y = ${tN(a)} × ${tPar(x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${tN(a * x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${tN(ans)}`}; }},
  {id: 'c8cyl', g: 8, mk: (R, L) => { const th = L === 'th', h = R.r(2, 10);
    if(th){ const r = 7 * R.r(1, 2), ans = 22 * r * r * h / 7; return {q: `ทรงกระบอกรัศมีฐาน ${r} ซม. สูง ${h} ซม. มีปริมาตรกี่ลูกบาศก์เซนติเมตร (ใช้ π ≈ 22/7)`, a: ans, o: [44 * r * h / 7, 22 * r * h / 7, 22 * r * r / 7], fig: TF.cyl(r, h, 'ซม.'),
      how: `ปริมาตร = πr²h = 22/7 × ${r} × ${r} × ${h} = ${fN(ans)} ลูกบาศก์เซนติเมตร`}; }
    const r = R.r(1, 5), ans = tRd(3.14 * r * r * h);
    return {q: `A cylinder has radius ${r} cm and height ${h} cm. What is its volume in cubic cm? Use 3.14 for π.`, a: ans, o: [tRd(2 * 3.14 * r * h), tRd(3.14 * r * h), tRd(3.14 * 4 * r * r * h)], fig: TF.cyl(r, h, 'cm'),
      how: `V = πr²h = 3.14 × ${r} × ${r} × ${h} = ${tN(ans)} cubic cm.`}; }},
  {id: 'c8system', g: 8, only: 'en', mk: (R, L) => { const x = R.r(-3, 12), y = R.r(-3, 9); if(x === y || !x || !y) return null; const s = x + y, d = x - y;
    return {q: `x + y = ${tN(s)} and x − y = ${tN(d)}. What is x?`, a: x, o: [y, s, d, -x], neg: true, how: `Add the two equations: 2x = ${tN(s)} + ${tPar(d)} = ${tN(2 * x)}, so x = ${tN(x)} (and y = ${tN(y)}).`}; }},
  {id: 'c8transform', g: 8, mk: (R, L) => { const th = L === 'th', x = R.r(-6, 6), y = R.r(-6, 6), k = R.r(0, 2), P = (a, b) => '(' + tN(a) + ', ' + tN(b) + ')'; if(!x || !y || x === y || x === -y) return null;
    if(k === 2){ const h = R.r(-5, 5), v = R.r(-5, 5); if(!h || !v) return null; const ans = P(x + h, y + v);
      return {q: th ? `เลื่อนขนานจุด A${P(x, y)} ไปทาง${h > 0 ? 'ขวา' : 'ซ้าย'} ${Math.abs(h)} หน่วย และ${v > 0 ? 'ขึ้น' : 'ลง'} ${Math.abs(v)} หน่วย ได้จุดใด` : `Point A${P(x, y)} moves ${Math.abs(h)} ${h > 0 ? 'right' : 'left'} and ${Math.abs(v)} ${v > 0 ? 'up' : 'down'}. Where is it now?`, a: ans, o: [P(x + v, y + h), P(x - h, y - v), P(x + h, y - v)],
        how: th ? `x: ${tN(x)} ${h > 0 ? '+' : '−'} ${Math.abs(h)} = ${tN(x + h)}, y: ${tN(y)} ${v > 0 ? '+' : '−'} ${Math.abs(v)} = ${tN(y + v)} → ${ans}` : `x: ${tN(x)} ${h > 0 ? '+' : '−'} ${Math.abs(h)} = ${tN(x + h)}, y: ${tN(y)} ${v > 0 ? '+' : '−'} ${Math.abs(v)} = ${tN(y + v)} → ${ans}.`}; }
    const overX = k === 0, ans = overX ? P(x, -y) : P(-x, y);
    return {q: th ? `สะท้อนจุด A${P(x, y)} โดยมีแกน ${overX ? 'X' : 'Y'} เป็นเส้นสะท้อน ได้จุดใด` : `Reflect point A${P(x, y)} over the ${overX ? 'x' : 'y'}-axis. Where is the image?`, a: ans, o: [overX ? P(-x, y) : P(x, -y), P(-x, -y), P(y, x)],
      how: th ? `สะท้อนข้ามแกน ${overX ? 'X: ค่า x เท่าเดิม ค่า y เปลี่ยนเครื่องหมาย' : 'Y: ค่า y เท่าเดิม ค่า x เปลี่ยนเครื่องหมาย'} → ${ans}` : `Over the ${overX ? 'x-axis, x stays and y changes sign' : 'y-axis, y stays and x changes sign'} → ${ans}.`}; }},
  // ===== ➗ mq-t3 · Grade 9–12 / ม.3–ม.6 (gt = Thai year: ม.3 = 9 · ม.4 = 10 · ม.5 = 11 · ม.6 = 12) =====
  {id: 'd9quad', g: 9, gt: 9, mk: (R, L) => { let r1 = R.r(-9, 9), r2 = R.r(-9, 9); if(!r1 || !r2 || r1 === r2) return null; if(r1 > r2) [r1, r2] = [r2, r1]; const th = L === 'th', OR = th ? ' หรือ ' : ' or ', S = (a, b) => { const [p, q] = a < b ? [a, b] : [b, a]; return 'x = ' + tN(p) + OR + 'x = ' + tN(q); };
    const e = tPoly([[1, 2], [-(r1 + r2), 1], [r1 * r2, 0]]) + ' = 0', ans = S(r1, r2);
    return {q: th ? `จงแก้สมการ ${e}` : `Solve: ${e}`, a: ans, o: [S(-r1, -r2), S(-r1, r2), S(r1, -r2), S(r1 + r2, r1 * r2)],
      how: (th ? 'แยกตัวประกอบ: ' : 'Factor: ') + tFac(r1) + tFac(r2) + ' = 0 → ' + ans}; }},
  {id: 'd9factor', g: 9, gt: 9, mk: (R, L) => { const r1 = R.r(-9, 9), r2 = R.r(-9, 9); if(!r1 || !r2 || r1 === r2 || r1 === -r2) return null; const P = tPoly([[1, 2], [-(r1 + r2), 1], [r1 * r2, 0]]), F = (a, b) => tFac(a) + tFac(b), ans = F(r1, r2);
    return {q: L === 'th' ? `${P} แยกตัวประกอบได้เท่ากับข้อใด` : `Factor: ${P}`, a: ans, o: [F(-r1, -r2), F(-r1, r2), F(r1, -r2)],
      how: L === 'th' ? `หาจำนวนสองจำนวนที่คูณกันได้ ${tN(r1 * r2)} และบวกกันได้ ${tN(-(r1 + r2))}: ${tN(-r1)} กับ ${tN(-r2)} → ${ans}` : `Find two numbers that multiply to ${tN(r1 * r2)} and add to ${tN(-(r1 + r2))}: ${tN(-r1)} and ${tN(-r2)} → ${ans}`}; }},
  {id: 'd9system', g: 9, gt: 9, mk: (R, L) => { const x = R.r(-5, 9), y = R.r(-5, 9), a1 = R.r(1, 5), b1 = R.r(1, 5), a2 = R.r(1, 5), b2 = -R.r(1, 5), D = a1 * b2 - a2 * b1; if(!D || !x || !y) return null; const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y, E = (a, b, c) => tPoly([[a, 1]], 'x') + (b < 0 ? ' − ' : ' + ') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'y = ' + tN(c), askY = R.r(0, 1), ans = askY ? y : x;
    return {q: L === 'th' ? `กำหนด ${E(a1, b1, c1)} และ ${E(a2, b2, c2)} ค่าของ ${askY ? 'y' : 'x'} เท่ากับเท่าใด` : `${E(a1, b1, c1)} and ${E(a2, b2, c2)}. What is ${askY ? 'y' : 'x'}?`, a: ans, o: [askY ? x : y, -ans, ans + 1], neg: true,
      how: (L === 'th' ? 'กำจัดตัวแปรทีละตัว: ' : 'Eliminate one letter: ') + `x = (${tN(c1)}·${tN(b2)} − ${tN(c2)}·${tN(b1)}) ÷ (${a1}·${tN(b2)} − ${a2}·${b1}) = ${tN(x)}, y = ${tN(y)} → ${askY ? 'y' : 'x'} = ${tN(ans)}`}; }},
  {id: 'd9ineq', g: 9, only: 'th', mk: (R, L) => { const a = R.r(2, 7), x = R.r(-5, 9), b = R.r(1, 15), flip = R.r(0, 2) === 0, s = R.pick(['>', '<', '≥', '≤']), o2 = {'>': '<', '<': '>', '≥': '≤', '≤': '≥'}[s], S = v => 'x ' + v + ' ' + tN(x);
    if(flip){ const c = -a * x + b; return {q: `คำตอบของอสมการ ${b} − ${a}x ${s} ${tN(c)} คือข้อใด`, a: S(o2), o: [S(s), 'x ' + o2 + ' ' + tN(-x), 'x ' + s + ' ' + tN(x + 1)], how: `ลบ ${b} ทั้งสองข้าง: −${a}x ${s} ${tN(c - b)} หารด้วย −${a} ต้องกลับเครื่องหมาย → ${S(o2)}`}; }
    const c = a * x + b; return {q: `คำตอบของอสมการ ${a}x + ${b} ${s} ${tN(c)} คือข้อใด`, a: S(s), o: [S(o2), 'x ' + s + ' ' + tN(c - b), 'x ' + s + ' ' + tN(x + b)], how: `ลบ ${b} ทั้งสองข้าง: ${a}x ${s} ${tN(c - b)} หารด้วย ${a} → ${S(s)}`}; }},
  {id: 'd9vertex', g: 9, gt: 9, mk: (R, L) => { const h = R.r(-6, 6), k = R.r(-9, 9); if(!h) return null; const b = -2 * h, c = h * h + k, f = 'y = ' + tPoly([[1, 2], [b, 1], [c, 0]]), ans = tPt(h, k);
    return {q: L === 'th' ? `จุดยอดของพาราโบลา ${f} คือจุดใด` : `What is the vertex of the parabola ${f}?`, a: ans, o: [tPt(-h, k), tPt(h, c), tPt(-h, -k), tPt(b, c)],
      how: `x = −b ÷ 2a = ${tN(-b)} ÷ 2 = ${tN(h)}; y = ${tPar(h)}² ${b < 0 ? '−' : '+'} ${Math.abs(b)}·${tPar(h)} ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${tN(k)} → ${ans}`}; }},
  {id: 'd9slope', g: 9, gt: 10, mk: (R, L) => { const m = R.r(-4, 5), b = R.r(-8, 8), x1 = R.r(-4, 2), x2 = x1 + R.r(1, 4); if(!m) return null; const y1 = m * x1 + b, y2 = m * x2 + b, ans = tLin(m, b);
    return {q: L === 'th' ? `สมการของเส้นตรงที่ผ่านจุด ${tPt(x1, y1)} และ ${tPt(x2, y2)} คือข้อใด` : `Which equation is the line through ${tPt(x1, y1)} and ${tPt(x2, y2)}?`, a: ans, o: [tLin(m, -b), tLin(-m, b), tLin(b || m + 1, m), tLin(m, b + m)],
      how: (L === 'th' ? 'ความชัน' : 'Slope') + ` m = (${tN(y2)} − ${tPar(y1)}) ÷ (${tN(x2)} − ${tPar(x1)}) = ${tN(m)}; b = ${tN(y1)} − ${tN(m)}·${tPar(x1)} = ${tN(b)} → ${ans}`}; }},
  {id: 'd9root', g: 9, gt: 10, mk: (R, L) => { const k = R.r(2, 9), m = R.pick([2, 3, 5, 6, 7]); if(k === m) return null; const ans = k + '√' + m;
    return {q: L === 'th' ? `√${k * k * m} เขียนในรูปอย่างง่ายได้เท่าใด` : `Simplify √${k * k * m}.`, a: ans, o: [m + '√' + k, (k + 1) + '√' + m, k * k + '√' + m, k + '√' + (m + 1)],
      how: `√${k * k * m} = √(${k * k} × ${m}) = √${k * k} × √${m} = ${ans}`}; }},
  {id: 'd9abs', g: 9, gt: 10, mk: (R, L) => { const a = R.r(-6, 8), b = R.r(1, 9), th = L === 'th', OR = th ? ' หรือ ' : ' or ', S = (p, q) => { const [u, v] = p < q ? [p, q] : [q, p]; return 'x = ' + tN(u) + OR + 'x = ' + tN(v); }, ans = S(a - b, a + b), e = '|x ' + (a < 0 ? '+ ' + (-a) : '− ' + a) + '| = ' + b;
    if(!a) return null;
    return {q: th ? `จงแก้สมการ ${e}` : `Solve: ${e}`, a: ans, o: [S(-a - b, -a + b), 'x = ' + tN(a + b), S(b - a, -(a + b)), S(a, b)],
      how: `x ${a < 0 ? '+ ' + (-a) : '− ' + a} = ${b} ${th ? 'หรือ' : 'or'} x ${a < 0 ? '+ ' + (-a) : '− ' + a} = −${b} → ${ans}`}; }},
  {id: 'd9func', g: 9, gt: 10, mk: (R, L) => { if(R.r(0, 1)){ const a = R.r(-3, 4), b = R.r(-6, 6), c = R.r(-9, 9), x = R.r(-3, 4); if(!a) return null; const v = a * x * x + b * x + c, f = 'f(x) = ' + tPoly([[a, 2], [b, 1], [c, 0]]);
      return {q: L === 'th' ? `กำหนด ${f} ค่าของ f(${tN(x)}) เท่ากับเท่าใด` : `${f}. What is f(${tN(x)})?`, a: v, o: [a * x * x - b * x + c, -v, a * 2 * x + b * x + c], neg: true, how: `f(${tN(x)}) = ${tN(a)}·${tPar(x)}² + ${tPar(b)}·${tPar(x)} + ${tPar(c)} = ${tN(v)}`}; }
    const a = R.r(2, 5), b = R.r(-6, 6), c = R.r(2, 4), d = R.r(-5, 5), x = R.r(-3, 4), gx = c * x + d, v = a * gx + b, f = 'f(x) = ' + tPoly([[a, 1], [b, 0]]), g = 'g(x) = ' + tPoly([[c, 1], [d, 0]]);
    return {q: L === 'th' ? `กำหนด ${f} และ ${g} ค่าของ f(g(${tN(x)})) เท่ากับเท่าใด` : `${f} and ${g}. What is f(g(${tN(x)}))?`, a: v, o: [c * (a * x + b) + d, gx, -v], neg: true, how: `g(${tN(x)}) = ${tN(gx)} → f(${tN(gx)}) = ${a}·${tPar(gx)} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${tN(v)}`}; }},
  {id: 'd10trig', g: 10, gt: 9, mk: (R, L) => { const [a, b, c] = R.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [7, 24, 25], [24, 7, 25]]), fn = R.pick(['sin', 'cos', 'tan']), V = {sin: [b, c], cos: [a, c], tan: [b, a]}, ans = tFr(...V[fn]), u = L === 'th' ? 'ซม.' : 'cm';
    return {q: L === 'th' ? `จากรูป ${fn} θ มีค่าเท่าใด` : `In the right triangle, what is ${fn} θ?`, a: ans, o: ['sin', 'cos', 'tan'].filter(x => x !== fn).map(x => tFr(...V[x])).concat([tFr(V[fn][1], V[fn][0])]), fig: TF.rtriA(a, b, c, u),
      how: (fn === 'sin' ? (L === 'th' ? 'sin θ = ข้าม ÷ ฉาก' : 'sin θ = opposite ÷ hypotenuse') : fn === 'cos' ? (L === 'th' ? 'cos θ = ชิด ÷ ฉาก' : 'cos θ = adjacent ÷ hypotenuse') : (L === 'th' ? 'tan θ = ข้าม ÷ ชิด' : 'tan θ = opposite ÷ adjacent')) + ` = ${V[fn][0]}/${V[fn][1]}${V[fn][0] + '/' + V[fn][1] === ans ? '' : ' = ' + ans}`}; }},
  {id: 'd10solid', g: 10, gt: 9, mk: (R, L) => { const th = L === 'th', k = R.r(0, 2), u = th ? 'ซม.' : 'cm', cu = th ? 'ลูกบาศก์เซนติเมตร' : 'cubic cm';
    if(k === 1){ const sd = R.r(3, 12), h = 3 * R.r(1, 5), v = sd * sd * h / 3; return {q: th ? `พีระมิดฐานสี่เหลี่ยมจัตุรัสยาวด้านละ ${sd} ซม. สูง ${h} ซม. มีปริมาตรกี่${cu}` : `A square pyramid has a base ${sd} cm by ${sd} cm and height ${h} cm. What is its volume in cubic cm?`, a: v, o: [sd * sd * h, sd * h, v * 2], fig: TF.pyr(sd, h, u),
      how: (th ? 'ปริมาตร = 1/3 × พื้นที่ฐาน × สูง' : 'V = 1/3 × base area × height') + ` = 1/3 × ${sd * sd} × ${h} = ${fN(v)}`}; }
    if(k === 0){ if(th){ const r = 7 * R.r(1, 2), h = 3 * R.r(1, 5), v = 22 * r * r * h / 21; return {q: `กรวยรัศมีฐาน ${r} ซม. สูง ${h} ซม. มีปริมาตรกี่${cu} (ใช้ π ≈ 22/7)`, a: v, o: [3 * v, 22 * r * h / 21, v + 22 * r / 7], fig: TF.cone(r, h, u), how: `ปริมาตร = 1/3 πr²h = 1/3 × 22/7 × ${r} × ${r} × ${h} = ${fN(v)}`}; }
      const r = R.r(2, 6), h = 3 * R.r(1, 4), v = tRd(3.14 * r * r * h / 3); return {q: `A cone has radius ${r} cm and height ${h} cm. What is its volume in cubic cm? Use 3.14 for π.`, a: v, o: [tRd(3.14 * r * r * h), tRd(3.14 * r * h / 3), tRd(2 * 3.14 * r * h / 3)], fig: TF.cone(r, h, u), how: `V = 1/3 πr²h = 1/3 × 3.14 × ${r} × ${r} × ${h} = ${tN(v)}`}; }
    if(th){ const r = 7 * R.r(1, 3), v = 88 * r * r / 7; return {q: `ทรงกลมรัศมี ${r} ซม. มีพื้นที่ผิวกี่ตารางเซนติเมตร (ใช้ π ≈ 22/7)`, a: v, o: [22 * r * r / 7, 44 * r / 7, 2 * v], fig: TF.sph(r, u), how: `พื้นที่ผิว = 4πr² = 4 × 22/7 × ${r} × ${r} = ${fN(v)}`}; }
    const r = 3 * R.r(1, 2), v = tRd(4 / 3 * 3.14 * r * r * r); return {q: `A sphere has radius ${r} cm. What is its volume in cubic cm? Use 3.14 for π.`, a: v, o: [tRd(4 * 3.14 * r * r), tRd(3.14 * r * r * r), tRd(4 / 3 * 3.14 * r * r)], fig: TF.sph(r, u), how: `V = 4/3 πr³ = 4/3 × 3.14 × ${r}³ = ${tN(v)}`}; }},
  {id: 'd10sim', g: 10, gt: 9, mk: (R, L) => { const s1 = [R.r(3, 8), R.r(2, 6)], k = R.r(2, 3), miss = R.pick([2, 3]), ans = s1[miss - 2] * k, u = L === 'th' ? 'ซม.' : 'cm';
    return {q: L === 'th' ? 'รูปสามเหลี่ยมสองรูปคล้ายกัน ด้านที่มีเครื่องหมาย ? ยาวกี่เซนติเมตร' : 'The two triangles are similar. How long is the side marked ? in cm?', a: ans, o: [s1[miss - 2] + k, s1[3 - miss] * k, ans + k], fig: TF.sim(s1, k, miss, u),
      how: (L === 'th' ? 'อัตราส่วนความยาวด้านที่สมนัยกัน = ' : 'Scale factor = ') + `${s1[miss === 2 ? 1 : 0] * k} ÷ ${s1[miss === 2 ? 1 : 0]} = ${k} → ${s1[miss - 2]} × ${k} = ${ans}`}; }},
  {id: 'd10circ', g: 10, gt: 9, mk: (R, L) => { const cen = 2 * R.r(50, 80), ins = R.r(0, 1), ans = ins ? cen / 2 : cen;
    return {q: L === 'th' ? 'จากรูป จุด O (จุดดำตรงกลาง) เป็นจุดศูนย์กลางของวงกลม มุมที่มีเครื่องหมาย ? มีขนาดกี่องศา' : 'O (the dot) is the centre of the circle. What is the angle marked ?, in degrees?', a: ans, o: ins ? [cen, 180 - cen, 90 - cen / 2] : [cen / 4, 180 - cen / 2, 360 - cen / 2], fig: TF.circAng(cen, !!ins),
      how: L === 'th' ? `มุมที่จุดศูนย์กลาง = 2 × มุมในส่วนโค้งที่รองรับด้วยส่วนโค้งเดียวกัน → ${ins ? cen + ' ÷ 2 = ' + ans : (cen / 2) + ' × 2 = ' + ans}°` : `The angle at the centre is twice the angle at the circle on the same arc → ${ins ? cen + ' ÷ 2 = ' + ans : (cen / 2) + ' × 2 = ' + ans}°`}; }},
  {id: 'd10dice', g: 10, gt: 9, mk: (R, L) => { const s = R.r(3, 11), n = 6 - Math.abs(7 - s), ans = tFr(n, 36);
    return {q: L === 'th' ? `ทอดลูกเต๋า 2 ลูกพร้อมกัน ความน่าจะเป็นที่ผลรวมของแต้มเท่ากับ ${s} เป็นเท่าใด` : `Two dice are rolled. What is the probability that the total is ${s}?`, a: ans, o: [tFr(n, 12), tFr(1, 6), tFr(n + 1, 36), tFr(s, 36)].filter(x => x !== ans),
      how: L === 'th' ? `ผลลัพธ์ทั้งหมด 6 × 6 = 36 แบบ รวมได้ ${s} มี ${n} แบบ → ${n}/36${n + '/36' === ans ? '' : ' = ' + ans}` : `36 equally likely outcomes; ${n} of them total ${s} → ${n}/36${n + '/36' === ans ? '' : ' = ' + ans}`}; }},
  {id: 'd10dist', g: 10, gt: 10, mk: (R, L) => { const [p, q] = R.pick([[3, 4], [6, 8], [5, 12], [8, 6], [4, 3], [12, 5], [9, 12]]), x1 = R.r(-5, 5), y1 = R.r(-5, 5), sx = R.pick([1, -1]), sy = R.pick([1, -1]), x2 = x1 + sx * p, y2 = y1 + sy * q;
    if(R.r(0, 2) === 0){ if((x1 + x2) % 2 || (y1 + y2) % 2) return null; const ans = tPt((x1 + x2) / 2, (y1 + y2) / 2);
      return {q: L === 'th' ? `จุดกึ่งกลางของส่วนของเส้นตรงที่เชื่อม ${tPt(x1, y1)} กับ ${tPt(x2, y2)} คือจุดใด` : `What is the midpoint of ${tPt(x1, y1)} and ${tPt(x2, y2)}?`, a: ans, o: [tPt((x2 - x1) / 2, (y2 - y1) / 2), tPt(x1 + x2, y1 + y2), tPt((y1 + y2) / 2, (x1 + x2) / 2), tPt((x1 + x2) / 2 + 1, (y1 + y2) / 2), tPt((x1 + x2) / 2, (y1 + y2) / 2 - 1)], how: `((${tN(x1)} + ${tPar(x2)}) ÷ 2, (${tN(y1)} + ${tPar(y2)}) ÷ 2) = ${ans}`}; }
    const d = Math.hypot(p, q);
    return {q: L === 'th' ? `ระยะห่างระหว่างจุด ${tPt(x1, y1)} กับ ${tPt(x2, y2)} เท่ากับเท่าใด` : `What is the distance between ${tPt(x1, y1)} and ${tPt(x2, y2)}?`, a: d, o: [p + q, p * p + q * q, d + 1], how: `√((${tN(x2)} − ${tPar(x1)})² + (${tN(y2)} − ${tPar(y1)})²) = √(${p * p} + ${q * q}) = √${p * p + q * q} = ${d}`}; }},
  {id: 'd10circeq', g: 10, gt: 10, mk: (R, L) => { const h = R.r(-6, 6), k = R.r(-6, 6), r = R.r(2, 9); if(!h || !k) return null; const th = L === 'th', P = (a, b) => (a < 0 ? '(x + ' + (-a) + ')²' : '(x − ' + a + ')²') + ' + ' + (b < 0 ? '(y + ' + (-b) + ')²' : '(y − ' + b + ')²'), C = (a, b, rr) => th ? `จุดศูนย์กลาง ${tPt(a, b)} รัศมี ${rr}` : `centre ${tPt(a, b)}, radius ${rr}`, ans = C(h, k, r);
    return {q: th ? `วงกลม ${P(h, k)} = ${r * r} มีจุดศูนย์กลางและรัศมีเท่าใด` : `The circle ${P(h, k)} = ${r * r}: what are its centre and radius?`, a: ans, o: [C(-h, -k, r), C(h, k, r * r), C(-h, -k, r * r), C(k, h, r)],
      how: th ? `รูป (x − h)² + (y − k)² = r² → h = ${tN(h)}, k = ${tN(k)}, r = √${r * r} = ${r} → ${ans}` : `Form (x − h)² + (y − k)² = r² → h = ${tN(h)}, k = ${tN(k)}, r = √${r * r} = ${r} → ${ans}`}; }},
  {id: 'd11set', g: 11, gt: 10, mk: (R, L) => { const both = R.r(2, 12), a = both + R.r(3, 15), b = both + R.r(3, 15), none = R.r(0, 10), N = a + b - both + none, askNone = R.r(0, 1), ans = askNone ? none : a + b - both, th = L === 'th';
    return {q: th ? `นักเรียน ${N} คน ชอบฟุตบอล ${a} คน ชอบบาสเกตบอล ${b} คน ชอบทั้งสองอย่าง ${both} คน ${askNone ? 'มีนักเรียนที่ไม่ชอบทั้งสองอย่างกี่คน' : 'มีนักเรียนที่ชอบอย่างน้อยหนึ่งอย่างกี่คน'}` : `In a class of ${N}, ${a} like football, ${b} like basketball and ${both} like both. How many like ${askNone ? 'neither' : 'at least one of them'}?`,
      a: ans, o: askNone ? [N - a - b, N - (a + b - both) + both, both] : [a + b, a + b + both, N - both], neg: false,
      how: (th ? 'n(A ∪ B) = n(A) + n(B) − n(A ∩ B)' : 'n(A ∪ B) = n(A) + n(B) − n(A ∩ B)') + ` = ${a} + ${b} − ${both} = ${a + b - both}` + (askNone ? ` → ${N} − ${a + b - both} = ${none}` : '')}; }},
  {id: 'd10logic', g: 10, only: 'th', mk: (R, L) => { const p = R.r(0, 1) === 1, q = R.r(0, 1) === 1, op = R.pick(['∧', '∨', '→', '↔']), v = op === '∧' ? p && q : op === '∨' ? p || q : op === '→' ? !p || q : p === q, T = b => b ? 'จริง' : 'เท็จ', ans = T(v);
    return {q: `ถ้า p มีค่าความจริงเป็น${T(p)} และ q มีค่าความจริงเป็น${T(q)} แล้ว p ${op} q มีค่าความจริงเป็นอย่างไร`, a: ans, o: [T(!v), 'บอกไม่ได้'],
      how: (op === '∧' ? 'p ∧ q เป็นจริงเมื่อทั้งสองเป็นจริงเท่านั้น' : op === '∨' ? 'p ∨ q เป็นเท็จเมื่อทั้งสองเป็นเท็จเท่านั้น' : op === '→' ? 'p → q เป็นเท็จกรณีเดียว คือ p จริง และ q เท็จ' : 'p ↔ q เป็นจริงเมื่อ p กับ q มีค่าความจริงเหมือนกัน') + ` → ${ans}`}; }},
  {id: 'd11count', g: 11, gt: 10, mk: (R, L) => { const k = R.r(0, 2), th = L === 'th', P = (n, r) => { let v = 1; for(let i = 0; i < r; i++) v *= n - i; return v; }, F = n => P(n, n);
    if(k === 2){ const n = R.r(4, 6), w = th ? R.pick(['หนังสือ', 'ตุ๊กตา', 'แก้วน้ำ']) : R.pick(['books', 'toys', 'cups']); return {q: th ? `จัดเรียง${w}ที่แตกต่างกัน ${n} ชิ้นเป็นแถวยาว ได้กี่วิธี` : `In how many ways can ${n} different ${w} be lined up on a shelf?`, a: F(n), o: [n * n, F(n - 1), n * (n - 1)], how: `${n}! = ${Array.from({length: n}, (_, i) => n - i).join(' × ')} = ${fN(F(n))}`}; }
    const n = R.r(5, 9), r = R.r(2, 3), Pn = P(n, r), Cn = Pn / F(r);
    if(k === 0) return {q: th ? `เลือกนักเรียน ${r} คน จาก ${n} คน เป็นตัวแทนห้อง (ไม่สนใจลำดับ) ได้กี่วิธี` : `In how many ways can ${r} students be chosen from ${n} for a team (order does not matter)?`, a: Cn, o: [Pn, n * r, Math.pow(n, r)], how: `C(${n}, ${r}) = ${n}! ÷ (${r}! × ${n - r}!) = ${Pn} ÷ ${F(r)} = ${Cn}`};
    return {q: th ? `เลือกนักเรียน ${r} คน จาก ${n} คน มาเป็นประธาน รองประธาน${r === 3 ? ' และเลขานุการ' : ''} ได้กี่วิธี` : `From ${n} students, a president${r === 3 ? ', a vice president and a secretary' : ' and a vice president'} are chosen. In how many ways?`, a: Pn, o: [Cn, n * r, Math.pow(n, r)], how: `P(${n}, ${r}) = ${Array.from({length: r}, (_, i) => n - i).join(' × ')} = ${Pn}`}; }},
  {id: 'd11pow', g: 11, gt: 10, mk: (R, L) => { if(R.r(0, 1)){ const k = R.r(2, 5), q = R.r(2, 3), p = R.pick([1, 2, 3].filter(x => x !== q)), n = Math.pow(k, q), ans = Math.pow(k, p);
      return {q: L === 'th' ? `${n}^(${p}/${q}) มีค่าเท่าใด` : `What is ${n}^(${p}/${q})?`, a: ans, o: [n * p / q, Math.pow(k, q - p) || k + 1, ans * k], how: (q === 2 ? '√' : '∛') + `${n} = ${k} → ${k}${tSup(p)} = ${ans}`}; }
    const k = R.r(2, 6) * (R.r(0, 2) ? 1 : -1), ans = k * k * k;
    return {q: L === 'th' ? `∛(${tN(ans)}) มีค่าเท่าใด` : `What is ∛(${tN(ans)})?`, a: k, o: [-k, ans / 3, k * k], neg: true, how: `${tPar(k)} × ${tPar(k)} × ${tPar(k)} = ${tN(ans)} → ∛(${tN(ans)}) = ${tN(k)}`}; }},
  {id: 'd12mat', g: 12, gt: 10, mk: (R, L) => { const a = R.r(-5, 7), b = R.r(-5, 7), c = R.r(-5, 7), d = R.r(-5, 7), v = a * d - b * c; if(!a || !d) return null;
    return {q: L === 'th' ? 'ดีเทอร์มิแนนต์ของเมทริกซ์ในรูปเท่ากับเท่าใด' : 'What is the determinant of the matrix?', a: v, o: [a * d + b * c, b * c - a * d, a * b - c * d], neg: true, fig: TF.mat([[a, b], [c, d]]),
      how: `${L === 'th' ? 'ดีเทอร์มิแนนต์' : 'det'} = a·d − b·c = ${tPar(a)}·${tPar(d)} − ${tPar(b)}·${tPar(c)} = ${tN(a * d)} − ${tPar(b * c)} = ${tN(v)}`}; }},
  {id: 'd11log', g: 11, gt: 11, mk: (R, L) => { const k = R.r(0, 2), th = L === 'th';
    if(k === 0){ const b = R.pick([2, 3, 5, 10]), n = R.r(2, b === 10 ? 6 : b === 2 ? 7 : 4), v = Math.pow(b, n); return {q: th ? `log${tSub(b)} ${fN(v)} มีค่าเท่าใด` : `What is log${tSub(b)} ${fN(v)}?`, a: n, o: [n + 1, v / b, b * n], how: `${b}${tSup(n)} = ${fN(v)} → log${tSub(b)} ${fN(v)} = ${n}`}; }
    if(k === 1){ const b = R.pick([2, 3]), m = R.r(1, 4), n = R.r(1, 4), x = Math.pow(b, m), y = Math.pow(b, n); return {q: th ? `log${tSub(b)} ${x} + log${tSub(b)} ${y} มีค่าเท่าใด` : `What is log${tSub(b)} ${x} + log${tSub(b)} ${y}?`, a: m + n, o: [m * n, x + y, m + n + 1], how: `log${tSub(b)} ${x} + log${tSub(b)} ${y} = log${tSub(b)} ${x * y} = ${m} + ${n} = ${m + n}`}; }
    const n = R.r(2, 5), v = Math.pow(10, n); return {q: th ? `log ${fN(v)} มีค่าเท่าใด` : `What is log ${fN(v)} (base 10)?`, a: n, o: [n + 1, n * 10, v / 10], how: `10${tSup(n)} = ${fN(v)} → log ${fN(v)} = ${n}`}; }},
  {id: 'd11expeq', g: 11, gt: 11, mk: (R, L) => { const b = R.pick([2, 3, 5]), m = R.r(2, b === 2 ? 7 : 4), kk = R.r(-3, 3), x = m - kk; if(!kk) return null; const v = Math.pow(b, m);
    return {q: L === 'th' ? `จงแก้สมการ ${b}${tSupX('x' + (kk < 0 ? '−' : '+') + Math.abs(kk))} = ${fN(v)}` : `Solve: ${b}${tSupX('x' + (kk < 0 ? '−' : '+') + Math.abs(kk))} = ${fN(v)}`, a: x, o: [m, m + kk, x + 1], neg: true,
      how: `${fN(v)} = ${b}${tSup(m)} → x ${kk < 0 ? '−' : '+'} ${Math.abs(kk)} = ${m} → x = ${tN(x)}`}; }},
  {id: 'd11trig', g: 11, gt: 11, mk: (R, L) => { const fn = R.pick(['sin', 'cos', 'tan']), ang = R.pick(Object.keys(TRIG_V[fn]).map(Number)), ans = TRIG_V[fn][ang], pool = ['0', '1/2', '√2/2', '√3/2', '1', '√3', '√3/3'].filter(x => x !== ans);
    return {q: L === 'th' ? `${fn} ${ang}° มีค่าเท่าใด` : `What is ${fn} ${ang}°?`, a: ans, o: shuffle(pool).slice(0, 4),
      how: (ang === 30 || ang === 60 ? (L === 'th' ? 'สามเหลี่ยม 30°-60°-90° ด้าน 1 : √3 : 2' : '30°-60°-90° triangle, sides 1 : √3 : 2') : ang === 45 ? (L === 'th' ? 'สามเหลี่ยม 45°-45°-90° ด้าน 1 : 1 : √2' : '45°-45°-90° triangle, sides 1 : 1 : √2') : (L === 'th' ? 'บนวงกลมหนึ่งหน่วย' : 'on the unit circle')) + ` → ${fn} ${ang}° = ${ans}`}; }},
  {id: 'd11cx', g: 11, gt: 11, mk: (R, L) => { const k = R.r(0, 2), th = L === 'th';
    if(k === 2){ const n = R.r(2, 15), I = ['1', 'i', '−1', '−i'], ans = I[n % 4]; return {q: th ? `i${tSup(n)} มีค่าเท่าใด (i² = −1)` : `What is i${tSup(n)}? (i² = −1)`, a: ans, o: I.filter(x => x !== ans), how: `i⁴ = 1 → i${tSup(n)} = i${tSup(n % 4)} = ${ans}`}; }
    const a = R.r(-4, 5), b = R.r(-4, 5), c = R.r(-4, 5), d = R.r(-4, 5); if(!b || !d) return null; const A = '(' + tCx(a, b) + ')', B = '(' + tCx(c, d) + ')';
    if(k === 0){ const re = a * c - b * d, im = a * d + b * c, ans = tCx(re, im); return {q: th ? `${A}${B} มีค่าเท่าใด` : `What is ${A}${B}?`, a: ans, o: [tCx(a * c + b * d, im), tCx(re, a * d - b * c), tCx(a * c, b * d)], how: `${a * c ? tN(a * c) : '0'} + ${tPar(a * d)}i + ${tPar(b * c)}i + ${tPar(b * d)}i² = ${tN(a * c)} − ${tPar(b * d)} + ${tPar(a * d + b * c)}i = ${ans}`}; }
    const ans = tCx(a + c, b + d); return {q: th ? `${A} + ${B} มีค่าเท่าใด` : `What is ${A} + ${B}?`, a: ans, o: [tCx(a + d, b + c), tCx(a - c, b - d), tCx(a + c, b - d)], how: (th ? 'รวมส่วนจริงกับส่วนจริง ส่วนจินตภาพกับส่วนจินตภาพ' : 'Add real parts, then imaginary parts') + `: ${tN(a)} + ${tPar(c)} = ${tN(a + c)}, ${tN(b)} + ${tPar(d)} = ${tN(b + d)} → ${ans}`}; }},
  {id: 'd12sd', g: 12, gt: 11, mk: (R, L) => { const m = R.r(10, 60), d = R.r(1, 9), n = R.pick([2, 3, 4]), data = shuffle(Array(n).fill(m - d).concat(Array(n).fill(m + d))), th = L === 'th';
    if(R.r(0, 2) === 0) return {q: th ? `ความแปรปรวนของข้อมูล ${data.join(', ')} เท่ากับเท่าใด` : `What is the variance (population) of ${data.join(', ')}?`, a: d * d, o: [d, 2 * d, m], how: (th ? `ค่าเฉลี่ย = ${m} ทุกค่าห่างจากค่าเฉลี่ย ${d}` : `Mean = ${m}; every value is ${d} from the mean`) + ` → σ² = ${d}² = ${d * d}`};
    return {q: th ? `ส่วนเบี่ยงเบนมาตรฐานของข้อมูล ${data.join(', ')} เท่ากับเท่าใด` : `What is the standard deviation (population) of ${data.join(', ')}?`, a: d, o: [d * d, 2 * d, m], how: (th ? `ค่าเฉลี่ย = ${m} ทุกค่าห่างจากค่าเฉลี่ย ${d}` : `Mean = ${m}; every value is ${d} from the mean`) + ` → σ = √(${d * d}) = ${d}`}; }},
  {id: 'd12z', g: 12, gt: 12, mk: (R, L) => { const mu = R.r(40, 80), s = R.pick([2, 4, 5, 8, 10]), z = R.pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3]), x = tRd(mu + z * s), th = L === 'th';
    if(R.r(0, 1)) return {q: th ? `คะแนนสอบมีค่าเฉลี่ย ${mu} ส่วนเบี่ยงเบนมาตรฐาน ${s} คะแนน ${tN(x)} มีค่ามาตรฐาน (z) เท่าใด` : `Test scores have mean ${mu} and standard deviation ${s}. What is the z-score of ${tN(x)}?`, a: z, o: [-z, tRd(x - mu), tRd(z * 2)], neg: true, how: `z = (x − μ) ÷ σ = (${tN(x)} − ${mu}) ÷ ${s} = ${tN(z)}`};
    return {q: th ? `คะแนนสอบมีค่าเฉลี่ย ${mu} ส่วนเบี่ยงเบนมาตรฐาน ${s} คะแนนที่มีค่ามาตรฐาน z = ${tN(z)} คือกี่คะแนน` : `Test scores have mean ${mu} and standard deviation ${s}. Which score has z = ${tN(z)}?`, a: x, o: [tRd(mu - z * s), tRd(mu + z), tRd(mu * z)], how: `x = μ + zσ = ${mu} + ${tPar(z)} × ${s} = ${tN(x)}`}; }},
  {id: 'd11arith', g: 11, gt: 12, mk: (R, L) => { const a = R.r(-10, 20), d = R.r(-5, 9), n = R.r(8, 30), th = L === 'th'; if(!d) return null; const an = a + (n - 1) * d, sum = n * (2 * a + (n - 1) * d) / 2, seq = [a, a + d, a + 2 * d].map(tN).join(', ');
    if(R.r(0, 1)) return {q: th ? `ลำดับเลขคณิต ${seq}, … พจน์ที่ ${n} คือจำนวนใด` : `The arithmetic sequence ${seq}, … What is term ${n}?`, a: an, o: [a + n * d, an - d, n * d], neg: true, how: `aₙ = a₁ + (n − 1)d = ${tN(a)} + ${n - 1} × ${tPar(d)} = ${tN(an)}`};
    return {q: th ? `ผลบวก ${n} พจน์แรกของอนุกรมเลขคณิต ${[a, a + d, a + 2 * d].map(tN).join(' + ')} + … เท่ากับเท่าใด` : `What is the sum of the first ${n} terms of ${[a, a + d, a + 2 * d].map(tN).join(' + ')} + …?`, a: sum, o: [n * an, sum + an, n * (a + an)], neg: true, how: `Sₙ = n/2 × (2a₁ + (n − 1)d) = ${n}/2 × (${tN(2 * a)} + ${tN((n - 1) * d)}) = ${fN(sum).replace('-', '−')}`}; }},
  {id: 'd11geo', g: 11, gt: 12, mk: (R, L) => { const a = R.r(1, 5), r = R.pick([2, 3, -2]), n = R.r(4, r === 3 ? 6 : 8), th = L === 'th', an = a * Math.pow(r, n - 1), seq = [a, a * r, a * r * r].map(tN).join(', ');
    if(R.r(0, 1) || r < 0) return {q: th ? `ลำดับเรขาคณิต ${seq}, … พจน์ที่ ${n} คือจำนวนใด` : `The geometric sequence ${seq}, … What is term ${n}?`, a: an, o: [a * Math.pow(r, n), an / r * (r - 1) + a, a * r * n], neg: true, how: `aₙ = a₁ × r${tSupX('n−1')} = ${a} × ${tPar(r)}${tSup(n - 1)} = ${tN(an)}`};
    const sum = a * (Math.pow(r, n) - 1) / (r - 1);
    return {q: th ? `ผลบวก ${n} พจน์แรกของอนุกรมเรขาคณิต ${[a, a * r, a * r * r].join(' + ')} + … เท่ากับเท่าใด` : `What is the sum of the first ${n} terms of ${[a, a * r, a * r * r].join(' + ')} + …?`, a: sum, o: [an, sum - an, a * Math.pow(r, n)], how: `Sₙ = a₁(r${tSupX('n')} − 1) ÷ (r − 1) = ${a} × (${r}${tSup(n)} − 1) ÷ ${r - 1} = ${fN(sum)}`}; }},
  {id: 'd12compound', g: 12, gt: 12, mk: (R, L) => { const [r, n, step] = R.pick([[10, 2, 100], [10, 3, 1000], [20, 2, 100], [5, 2, 400], [20, 3, 1000]]), P = step * R.r(5, 50), th = L === 'th', tot = Math.round(P * Math.pow(1 + r / 100, n)), simple = P + P * r * n / 100, asked = R.r(0, 1);
    return {q: th ? `ฝากเงิน ${fN(P)} บาท ได้ดอกเบี้ยร้อยละ ${r} ต่อปี ทบต้นทุกปี เมื่อครบ ${n} ปี ${asked ? 'ได้ดอกเบี้ยทั้งหมดกี่บาท' : 'จะมีเงินรวมกี่บาท'}` : `$${fN(P)} is saved at ${r}% interest per year, compounded yearly. ${asked ? 'How much interest is earned' : 'How much is in the account'} after ${n} years?`, a: asked ? tot - P : tot, o: asked ? [simple - P, tot, P * r / 100] : [simple, tot - P, P * (1 + r * n)],
      how: `${th ? 'เงินรวม' : 'Total'} = P(1 + r)${tSupX('n')} = ${fN(P)} × ${tN(1 + r / 100)}${tSup(n)} = ${fN(tot)}` + (asked ? (th ? ` → ดอกเบี้ย ${fN(tot)} − ${fN(P)} = ${fN(tot - P)}` : ` → interest ${fN(tot)} − ${fN(P)} = ${fN(tot - P)}`) : '')}; }},
  {id: 'd12deriv', g: 12, gt: 12, mk: (R, L) => { const a = R.r(-3, 4), b = R.r(-5, 5), c = R.r(-6, 6), d = R.r(-9, 9), x = R.r(-3, 3); if(!a) return null; const f = 'f(x) = ' + tPoly([[a, 3], [b, 2], [c, 1], [d, 0]]), fp = 3 * a * x * x + 2 * b * x + c, fx = a * x * x * x + b * x * x + c * x + d;
    if(R.r(0, 2) === 0){ const ans = tPoly([[3 * a, 2], [2 * b, 1], [c, 0]]); return {q: L === 'th' ? `กำหนด ${f} แล้ว f′(x) คือข้อใด` : `${f}. What is f′(x)?`, a: ans, o: [tPoly([[a, 2], [b, 1], [c, 0]]), tPoly([[3 * a, 2], [2 * b, 1], [c + d, 0]]), tPoly([[3 * a, 3], [2 * b, 2], [c, 1]])], how: (L === 'th' ? 'อนุพันธ์ของ a·xⁿ คือ n·a·xⁿ⁻¹' : 'The derivative of a·xⁿ is n·a·xⁿ⁻¹') + ` → f′(x) = ${ans}`}; }
    return {q: L === 'th' ? `กำหนด ${f} ค่าของ f′(${tN(x)}) เท่ากับเท่าใด` : `${f}. What is f′(${tN(x)})?`, a: fp, o: [fx === fp ? fp + 3 : fx, fp + c, -fp], neg: true, how: `f′(x) = ${tPoly([[3 * a, 2], [2 * b, 1], [c, 0]])} → f′(${tN(x)}) = ${tN(fp)}`}; }},
  {id: 'd12int', g: 12, gt: 12, mk: (R, L) => { const a = 2 * R.r(1, 4), b = R.r(-3, 6), k = R.r(1, 5), v = a * k * k / 2 + b * k, f = '(' + tPoly([[a, 1], [b, 0]]) + ')';
    return {q: L === 'th' ? `∫ ${f} dx จาก x = 0 ถึง x = ${k} มีค่าเท่าใด` : `What is ∫ ${f} dx from x = 0 to x = ${k}?`, a: v, o: [a * k + b, a * k * k + b * k, v + b], neg: true,
      how: `∫ ${f} dx = ${tPoly([[a / 2, 2], [b, 1]])} → ${a / 2 === 1 ? '' : a / 2}·${k}² ${b < 0 ? '−' : '+'} ${Math.abs(b)}·${k} − 0 = ${tN(v)}`}; }},
  {id: 'd12lim', g: 12, gt: 12, mk: (R, L) => { if(R.r(0, 1)){ const a = R.r(-6, 9); if(!a) return null; const P = a < 0 ? 'x + ' + (-a) : 'x − ' + a;
      return {q: L === 'th' ? `lim (x² − ${a * a}) ÷ (${P}) เมื่อ x → ${tN(a)} มีค่าเท่าใด` : `What is lim (x² − ${a * a}) ÷ (${P}) as x → ${tN(a)}?`, a: 2 * a, o: [a, 0, a * a], neg: true, how: `(x² − ${a * a}) ÷ (${P}) = x ${a < 0 ? '− ' + (-a) : '+ ' + a} → ${tN(a)} ${a < 0 ? '− ' + (-a) : '+ ' + a} = ${tN(2 * a)}`}; }
    const b = R.r(-8, 9), c = R.r(2, 6); if(!b) return null;
    return {q: L === 'th' ? `lim (${tPoly([[c, 2], [b, 1]])}) ÷ x เมื่อ x → 0 มีค่าเท่าใด` : `What is lim (${tPoly([[c, 2], [b, 1]])}) ÷ x as x → 0?`, a: b, o: [c, 0, b + c], neg: true, how: `(${tPoly([[c, 2], [b, 1]])}) ÷ x = ${tPoly([[c, 1], [b, 0]])} → ${c}·0 ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${tN(b)}`}; }},
  {id: 'd12exp', g: 12, gt: 12, mk: (R, L) => { const th = L === 'th';
    if(R.r(0, 1)){ const k = 2 * R.r(1, 5), v = 3.5 * k; return {q: th ? `ทอดลูกเต๋า 1 ลูก ได้เงิน ${k} บาท × แต้มที่ออก ค่าคาดหมายของเงินที่ได้เท่ากับกี่บาท` : `Roll one die and win $${k} × the number shown. What is the expected amount won, in dollars?`, a: v, o: [k * 6, k * 3, k], how: `E = ${k} × (1 + 2 + 3 + 4 + 5 + 6) ÷ 6 = ${k} × 3.5 = ${tN(v)}`}; }
    const vals = [R.r(0, 5) * 10, R.r(1, 6) * 10, R.r(2, 8) * 10, R.r(5, 12) * 10]; if(vals.reduce((a, b) => a + b, 0) % 4) return null; const e = vals.reduce((a, b) => a + b, 0) / 4;
    return {q: th ? `วงล้อแบ่ง 4 ช่องเท่า ๆ กัน มีรางวัล ${vals.join(', ')} บาท หมุน 1 ครั้ง ค่าคาดหมายของรางวัลเท่ากับกี่บาท` : `A spinner has 4 equal parts worth $${vals.join(', $')}. What is the expected prize for one spin, in dollars?`, a: e, o: [Math.max(...vals), vals.reduce((a, b) => a + b, 0), (Math.max(...vals) + Math.min(...vals)) / 2],
      how: `E = (${vals.join(' + ')}) ÷ 4 = ${tN(e)}`}; }}
];
/* 📏 s4a tests#4 */
// ---------- ➗ mq-t4: 💀 real-life scenarios / สถานการณ์จริง — case cards, 3 linked questions each ----------
// A case = id · mk(R, L) → {icon, title, ctx, fig?, qs: [{q, a, o, how} × 3]} or null (R rolls again). Q2 / Q3 build on the earlier answers.
// Numbers are rolled so every answer is exact (whole dollars / baht, or cents shown as $12.34); money in EN = US style, TH = บาท.
const caseW = s => [...String(s)].reduce((w, ch) => w + (/[ัิ-ฺ็-๎]/.test(ch) ? 0 : /[฀-๿]/.test(ch) ? 9.6 : /[A-Z$%¢×]/.test(ch) ? 11 : /[ .,:]/.test(ch) ? 5 : 9.4), 0);   // width of 14px bold text (Thai marks take none)
Object.assign(TF, {
  table(rows, label){ const rh = 30, cols = rows[0].length, cw = [];   /* 📋 a fact table: header row, grey grid, first column left, the rest centred */
    for(let j = 0; j < cols; j++) cw.push(Math.max(48, Math.ceil(Math.max(...rows.map(r => caseW(r[j] === undefined ? '' : r[j]))) + 30)));
    const W = cw.reduce((a, b) => a + b, 0), H = rows.length * rh, x0 = 2, y0 = 2; let s = '<rect x="' + x0 + '" y="' + y0 + '" width="' + W + '" height="' + rh + '" fill="#ffe9b8"/>';
    for(let i = 2; i < rows.length; i += 2) s += '<rect x="' + x0 + '" y="' + (y0 + i * rh) + '" width="' + W + '" height="' + rh + '" fill="#f2f6fc"/>';
    for(let i = 1; i < rows.length; i++) s += '<line x1="' + x0 + '" y1="' + (y0 + i * rh) + '" x2="' + (x0 + W) + '" y2="' + (y0 + i * rh) + '" stroke="#b9c3d6" stroke-width="1.2"/>';
    let x = x0; for(let j = 0; j < cols - 1; j++){ x += cw[j]; if(rows.some((r, i) => i && r[j + 1] !== '')) s += '<line x1="' + x + '" y1="' + y0 + '" x2="' + x + '" y2="' + (y0 + H) + '" stroke="#b9c3d6" stroke-width="1.2"/>'; }
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + W + '" height="' + H + '" rx="6" fill="none" stroke="#2a3247" stroke-width="2"/>';
    rows.forEach((r, i) => { let cx = x0; r.forEach((t, j) => { if(t !== '' && t !== undefined) s += '<text x="' + (j ? cx + cw[j] / 2 : cx + 12).toFixed(1) + '" y="' + (y0 + i * rh + 20) + '" font-size="14" font-weight="' + (i ? 700 : 900) + '" text-anchor="' + (j ? 'middle' : 'start') + '" fill="#2a3247">' + UI.esc(String(t)) + '</text>'; cx += cw[j]; }); });
    return TF.wrap(W + 4, H + 4, s, label || 'table'); },
  yard(L, W, u, g, gw){ const k = Math.min(220 / L, 110 / W), A = Math.max(150, L * k), B = Math.max(70, W * k), x = 16, y = 12, gap = Math.max(26, g * k), gx = x + A * 0.3;   /* 🏡 a garden: fence with a gate gap at the bottom */
    let s = '<rect x="' + x + '" y="' + y + '" width="' + A.toFixed(1) + '" height="' + B.toFixed(1) + '" fill="#cdeec0"/>';
    s += '<path d="M' + gx.toFixed(1) + ' ' + (y + B).toFixed(1) + ' H' + x + ' V' + y + ' H' + (x + A).toFixed(1) + ' V' + (y + B).toFixed(1) + ' H' + (gx + gap).toFixed(1) + '" fill="none" stroke="#8a5a2b" stroke-width="3.5" stroke-linejoin="round"/>';
    s += TF.lab(x + A * 0.62, y + B + 20, L + ' ' + u) + TF.lab(x + A + 10, y + B / 2 + 5, W + ' ' + u, 'start') + TF.lab(gx + gap / 2, y + B - 12, gw + ' ' + g + ' ' + u, 'middle', '#8a5a2b');
    return TF.wrap(x + A + 70, y + B + 28, s, 'garden'); }
});
/* 📏 s4a tests#5 */
const tmE = m => Math.floor(m / 60) + ':' + pad2(m % 60), tmT = m => pad2(Math.floor(m / 60)) + '.' + pad2(m % 60);   // 7:05 · 07.05
const cD = n => '$' + tN(n), cB = n => tN(n) + ' บาท';
const caseUp = (a, b) => Math.ceil(a / b);
const MONTHS = {en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], th: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']};
const CASES = [
  {id: 'trip', mk: (R, L) => { const th = L === 'th';   // 🚗 a trip on a budget: fuel there and back → fuel + hotel → money left
    if(!th){ const mpg = R.pick([20, 25, 30]), k = R.r(3, 8), d = mpg * k, p = R.pick([3, 4, 5]), h = R.r(8, 16) * 10, n = R.r(2, 4), gal = 2 * k, gas = gal * p, hot = h * n, tot = gas + hot, B = Math.ceil((tot + R.r(3, 30) * 10) / 100) * 100, left = B - tot;
      return {icon: '🚗', title: 'Road trip on a budget', ctx: 'The Lee family drives to the beach and then back home.',
        fig: TF.table([['Trip facts', ''], ['Beach (one way)', d + ' miles'], ['Car', mpg + ' miles a gallon'], ['Gas', cD(p) + ' a gallon'], ['Hotel', cD(h) + ' a night × ' + n], ['Budget', cD(B)]], 'trip facts'),
        qs: [{q: 'How many gallons of gas do they need for the whole trip, there and back?', a: gal, o: [k, gal + 2, 2 * gal], how: `There and back: 2 × ${d} = ${2 * d} miles; ${2 * d} ÷ ${mpg} = ${gal} gallons`},
          {q: 'How many dollars do the gas and the hotel cost altogether?', a: tot, o: [k * p + hot, gas + h, tot + h], how: `Gas: ${gal} × ${cD(p)} = ${cD(gas)}; hotel: ${cD(h)} × ${n} = ${cD(hot)}; ${cD(gas)} + ${cD(hot)} = ${cD(tot)}`},
          {q: 'How many dollars of the budget are left over?', a: left, o: [B - k * p - hot, B - gas, left + h], how: `${cD(B)} − ${cD(tot)} = ${cD(left)}`}]}; }
    const kpl = R.pick([12, 15, 20]), k = R.r(5, 15), d = kpl * k, p = R.pick([32, 35, 38, 40]), h = R.r(8, 20) * 100, n = R.r(2, 3), lit = 2 * k, gas = lit * p, hot = h * n, tot = gas + hot, B = Math.ceil((tot + R.r(3, 20) * 100) / 1000) * 1000, left = B - tot, N = R.pick(CASE_NAMES.th);
    return {icon: '🚗', title: 'เที่ยวด้วยงบจำกัด', ctx: `ครอบครัวของ${N}ขับรถไปเที่ยวหัวหิน แล้วขับกลับบ้าน`,
      fig: TF.table([['ข้อมูลการเดินทาง', ''], ['ระยะทางขาไป', d + ' กม.'], ['รถวิ่งได้', kpl + ' กม. ต่อลิตร'], ['น้ำมัน', 'ลิตรละ ' + p + ' บาท'], ['ที่พัก', 'คืนละ ' + tN(h) + ' บาท × ' + n + ' คืน'], ['งบประมาณ', cB(B)]], 'ข้อมูลการเดินทาง'),
      qs: [{q: 'ไปและกลับต้องใช้น้ำมันทั้งหมดกี่ลิตร', a: lit, o: [k, lit + 2, 2 * lit], how: `ไปและกลับ 2 × ${d} = ${2 * d} กม. → ${2 * d} ÷ ${kpl} = ${lit} ลิตร`},
        {q: 'ค่าน้ำมันรวมกับค่าที่พักเป็นเงินกี่บาท', a: tot, o: [k * p + hot, gas + h, tot + h], how: `ค่าน้ำมัน ${lit} × ${p} = ${cB(gas)} ค่าที่พัก ${tN(h)} × ${n} = ${cB(hot)} รวม ${cB(tot)}`},
        {q: 'เหลือเงินจากงบประมาณกี่บาท', a: left, o: [B - k * p - hot, B - gas, left + h], how: `${tN(B)} − ${tN(tot)} = ${cB(left)}`}]}; }},
  {id: 'sale', mk: (R, L) => { const th = L === 'th';   // 🏷️ a sale: discount → sale price → with sales tax / VAT 7 %
    if(!th){ const P = R.r(3, 12) * 20, pct = R.pick([10, 20, 25, 50]), disc = P * pct / 100, sale = P - disc, t = R.pick([5, 6, 8]), tax = sale * t, totC = sale * 100 + tax, item = R.pick(['jacket', 'pair of sneakers', 'backpack', 'scooter']);
      return {icon: '🏷️', title: 'The big sale', ctx: `A store has ${pct}% off everything. A ${item} has a price tag of ${cD(P)}. A ${t}% sales tax is added to the sale price.`,
        qs: [{q: 'How many dollars is the discount?', a: disc, o: [sale, pct, disc + 10], how: `${pct}% of ${cD(P)} = ${P} × ${pct} ÷ 100 = ${cD(disc)}`},
          {q: 'What is the sale price, in dollars?', a: sale, o: [P + disc, disc, P - pct], how: `${cD(P)} − ${cD(disc)} = ${cD(sale)}`},
          {q: 'How much do you pay at the register, with the tax?', a: tMoney(totC), o: [tMoney(sale * 100), tMoney(sale * 100 + P * t), tMoney(P * 100 + P * t)], how: `Tax: ${t}% of ${cD(sale)} = ${tMoney(tax)}; ${cD(sale)} + ${tMoney(tax)} = ${tMoney(totC)}`}]}; }
    const pct = R.pick([10, 20, 25, 50]), P = ({10: 1000, 20: 500, 25: 400, 50: 200})[pct] * R.r(1, pct === 10 ? 5 : pct === 50 ? 20 : 10), disc = P * pct / 100, sale = P - disc, vat = sale * 7 / 100, tot = sale + vat, item = R.pick(['เสื้อแจ็กเก็ต', 'รองเท้าผ้าใบ', 'กระเป๋านักเรียน', 'พัดลม']);
    if(P < 400) return null;
    return {icon: '🏷️', title: 'ห้างลดราคา', ctx: `ห้างลดราคาสินค้าทุกชิ้น ${pct}% ${item}ราคาป้าย ${cB(P)} และต้องจ่ายภาษีมูลค่าเพิ่ม 7% ของราคาหลังลด`,
      qs: [{q: 'ส่วนลดเป็นเงินกี่บาท', a: disc, o: [sale, pct, disc + 10], how: `${pct}% ของ ${tN(P)} = ${tN(P)} × ${pct} ÷ 100 = ${cB(disc)}`},
        {q: 'ราคาหลังลดเป็นเงินกี่บาท', a: sale, o: [P + disc, disc, P - pct], how: `${tN(P)} − ${tN(disc)} = ${cB(sale)}`},
        {q: 'รวมภาษีมูลค่าเพิ่มแล้ว ต้องจ่ายทั้งหมดกี่บาท', a: tot, o: [P * 107 / 100, sale, sale + P * 7 / 100], how: `ภาษี 7% ของ ${tN(sale)} = ${tN(vat)} บาท → ${tN(sale)} + ${tN(vat)} = ${cB(tot)}`}]}; }},
  {id: 'phone', mk: (R, L) => { const th = L === 'th', N = R.pick(CASE_NAMES[L]), even = R.r(0, 1) === 1;   // 📱 two phone plans: one month → a year → cheaper / same price
    const a = th ? R.r(10, 30) * 10 : R.r(10, 25), x = th ? R.r(1, 5) * 10 : R.r(2, 6), g = R.r(3, 12), cost = a + x * g; let b, eq = 0;
    if(even){ eq = R.r(3, 15); if(eq === g) return null; b = a + x * eq; } else { b = cost + R.pick([-1, 1]) * (th ? R.r(2, 12) * 10 : R.r(2, 12)); if(b <= a || b === cost) return null; }
    const cheap = cost < b ? (th ? 'แพ็กเกจ A' : 'Plan A') : (th ? 'แพ็กเกจ B' : 'Plan B'), M = th ? cB : cD;
    const q3 = even ? (th ? {q: 'ใช้เน็ตเดือนละกี่กิกะไบต์ ทั้งสองแพ็กเกจจึงจะราคาเท่ากัน', a: eq, o: [Math.round(b / x), eq + 1, b - a], how: `${a} + ${x} × กิกะไบต์ = ${b} → (${b} − ${a}) ÷ ${x} = ${eq} กิกะไบต์`}
        : {q: 'At how many GB a month would both plans cost the same?', a: eq, o: [Math.round(b / x), eq + 1, b - a], how: `${cD(a)} + ${cD(x)} × GB = ${cD(b)} → GB = (${b} − ${a}) ÷ ${x} = ${eq}`})
      : (th ? {q: `แพ็กเกจใดถูกกว่าสำหรับ${N}`, a: cheap, o: [cheap === 'แพ็กเกจ A' ? 'แพ็กเกจ B' : 'แพ็กเกจ A', 'ราคาเท่ากัน', 'ข้อมูลไม่พอ'], how: `แพ็กเกจ A เดือนละ ${cB(cost)} แพ็กเกจ B เดือนละ ${cB(b)} → ${cheap} ถูกกว่า`}
        : {q: `Which plan is cheaper for ${N}?`, a: cheap, o: [cheap === 'Plan A' ? 'Plan B' : 'Plan A', 'Same price', 'Not enough facts'], how: `Plan A costs ${cD(cost)} a month, Plan B costs ${cD(b)} → ${cheap} is cheaper`});
    return {icon: '📱', title: th ? 'เลือกแพ็กเกจโทรศัพท์' : 'Pick a phone plan', ctx: th ? `${N}ใช้เน็ตเดือนละประมาณ ${g} กิกะไบต์ ร้านมีให้เลือก 2 แบบ` : `${N} uses about ${g} GB of data a month. The shop has two plans.`,
      fig: TF.table(th ? [['', 'แพ็กเกจ A', 'แพ็กเกจ B'], ['ค่าบริการต่อเดือน', cB(a), cB(b)], ['เน็ตกิกะไบต์ละ', cB(x), 'ไม่คิดเงิน']] : [['', 'Plan A', 'Plan B'], ['Each month', cD(a), cD(b)], ['Each GB', cD(x), 'free']], th ? 'แพ็กเกจ' : 'phone plans'),
      qs: [th ? {q: `ถ้า${N}ใช้แพ็กเกจ A จะเสียเงินเดือนละกี่บาท`, a: cost, o: [a * g, x * g, a + x * (g + 1)], how: `${a} + ${g} × ${x} = ${cB(cost)}`} : {q: `How many dollars would Plan A cost ${N} for one month?`, a: cost, o: [a * g, x * g, a + x * (g + 1)], how: `${cD(a)} + ${g} × ${cD(x)} = ${cD(cost)}`},
        th ? {q: 'ใช้แพ็กเกจ A ครบ 1 ปี (12 เดือน) เสียเงินกี่บาท', a: 12 * cost, o: [12 * a + x * g, 10 * cost, 12 * cost + 12], how: `12 × ${tN(cost)} = ${cB(12 * cost)}`} : {q: 'How many dollars would Plan A cost for a whole year (12 months)?', a: 12 * cost, o: [12 * a + x * g, 10 * cost, 12 * cost + 12], how: `12 × ${cD(cost)} = ${M(12 * cost)}`},
        q3]}; }},
  {id: 'save', mk: (R, L) => { const th = L === 'th', N = R.pick(CASE_NAMES[L]), r = R.pick([5, 10]);   // 🐷 savings: one year's interest → after n years (simple) → compound for 2 years
    const P = (r === 5 ? 400 : 100) * (th ? R.r(r === 5 ? 3 : 10, r === 5 ? 40 : 150) : R.r(2, 15)), I = P * r / 100, n = R.r(2, 5), simple = P + n * I, comp = P * (100 + r) * (100 + r) / 10000, M = th ? cB : cD;
    return {icon: '🐷', title: th ? 'ฝากเงินกับธนาคาร' : 'Saving at the bank', ctx: th ? `${N}ฝากเงิน ${cB(P)} ได้ดอกเบี้ยแบบคงต้น ${r}% ต่อปี` : `${N} puts ${cD(P)} in a savings account. The bank pays ${r}% simple interest each year.`,
      qs: [{q: th ? 'ปีแรกได้ดอกเบี้ยกี่บาท' : 'How many dollars of interest does the money earn in one year?', a: I, o: [P * r / 10, 2 * I, r], how: th ? `${r}% ของ ${tN(P)} = ${cB(I)}` : `${r}% of ${cD(P)} = ${cD(I)}`},
        {q: th ? `เมื่อครบ ${n} ปี จะมีเงินในบัญชีกี่บาท` : `How many dollars are in the account after ${n} years?`, a: simple, o: [n * I, P + I, P + (n + 1) * I], how: th ? `${tN(P)} + ${n} × ${tN(I)} = ${cB(simple)}` : `${cD(P)} + ${n} × ${cD(I)} = ${cD(simple)}`},
        {q: th ? `อีกธนาคารให้ดอกเบี้ย ${r}% ต่อปีแบบทบต้น (ดอกเบี้ยปีแรกนำไปรวมกับเงินต้น) ครบ 2 ปีจะมีเงินกี่บาท` : `Another bank pays ${r}% compound interest (each year's interest is added on). How many dollars would be in that account after 2 years?`,
          a: comp, o: [P + 2 * I, P + I, comp + I], how: th ? `ปีที่ 1: ${tN(P)} + ${tN(I)} = ${tN(P + I)} ปีที่ 2: ${tN(P + I)} + ${r}% = ${cB(comp)}` : `Year 1: ${cD(P)} + ${cD(I)} = ${cD(P + I)}; year 2: ${cD(P + I)} + ${r}% = ${M(comp)}`}]}; }},
  {id: 'pay', mk: (R, L) => { const th = L === 'th', n = R.pick([6, 10, 12]);   // 🧾 pay later: total paid → extra over the cash price → extra as a %
    const C = th ? R.r(40, 150) * 100 : R.r(20, 60) * 10, d = th ? R.r(5, 20) * 100 : R.r(2, 6) * 10; if(d >= C / 2) return null;
    const m = th ? Math.ceil((C - d) / n / 10) * 10 + R.r(1, 5) * 10 : Math.ceil((C - d) / n) + R.r(2, 6), paid = d + m * n, extra = paid - C, pc = Math.round(extra * 100 / C); if(pc < 2) return null;
    const item = th ? R.pick(['โทรศัพท์มือถือ', 'แท็บเล็ต', 'จักรยาน']) : R.pick(['bike', 'tablet', 'guitar']);
    return {icon: '🧾', title: th ? 'ผ่อนหรือจ่ายสด' : 'Pay now or pay later', ctx: th ? `${item}ราคาเงินสด ${cB(C)} ร้านนี้มีแบบผ่อนจ่ายให้เลือกด้วย` : `A ${item} costs ${cD(C)} in cash. The shop also has a pay-later plan.`,
      fig: TF.table(th ? [['แบบผ่อนจ่าย', ''], ['ราคาเงินสด', cB(C)], ['จ่ายวันแรก', cB(d)], ['ผ่อนเดือนละ', tN(m) + ' บาท × ' + n + ' เดือน']] : [['Pay-later plan', ''], ['Cash price', cD(C)], ['Pay today', cD(d)], ['Then each month', cD(m) + ' × ' + n]], th ? 'แบบผ่อนจ่าย' : 'pay-later plan'),
      qs: [{q: th ? 'ถ้าผ่อนจนครบ จะจ่ายเงินทั้งหมดกี่บาท' : 'How many dollars do you pay in all with the plan?', a: paid, o: [m * n, d + m * (n - 1), C], how: th ? `${tN(d)} + ${n} × ${tN(m)} = ${cB(paid)}` : `${cD(d)} + ${n} × ${cD(m)} = ${cD(paid)}`},
        {q: th ? 'จ่ายแพงกว่าราคาเงินสดกี่บาท' : 'How many dollars more than the cash price is that?', a: extra, o: [m * n - C, paid, extra + d], how: th ? `${tN(paid)} − ${tN(C)} = ${cB(extra)}` : `${cD(paid)} − ${cD(C)} = ${cD(extra)}`},
        {q: th ? 'ส่วนที่จ่ายเพิ่มคิดเป็นประมาณกี่เปอร์เซ็นต์ของราคาเงินสด (ปัดเป็นจำนวนเต็ม)' : 'About what percent of the cash price is the extra cost? (Round to a whole percent.)', a: pc, o: [Math.round(extra * 100 / paid), pc + 10, Math.round(extra / 10)], how: `${tN(extra)} ÷ ${tN(C)} × 100 ≈ ${pc}%`}]}; }},
  {id: 'recipe', mk: (R, L) => { const th = L === 'th', N = R.pick(CASE_NAMES[L]), s = R.pick([2, 4]), mult = s === 4 ? R.pick([1.5, 2, 3]) : R.pick([2, 3]), t = s * mult;   // 🥞 scale a recipe: eggs → flour → bags to buy
    const e = mult === 1.5 ? R.pick([2, 4]) : R.r(1, 3), f = th ? (mult === 1.5 ? R.pick([200, 400]) : R.r(1, 4) * 100) : (mult === 1.5 ? R.pick([2, 4]) : R.r(1, 3)), milk = th ? R.r(2, 5) * 50 : R.r(1, 3), eggs = e * mult, flour = f * mult;
    const bag = th ? R.pick([500, 1000]) : R.pick([3, 4, 5]), bags = caseUp(flour, bag), u = th ? ' กรัม' : (flour === 1 ? ' cup' : ' cups'), how3 = flour % bag === 0 ? `${tN(flour)} ÷ ${tN(bag)} = ${bags}` : `${bags - 1} × ${tN(bag)} = ${tN((bags - 1) * bag)}${u} ${th ? 'ไม่พอ' : 'is not enough'} → ${bags}`;
    if(bags < 1) return null;
    return {icon: '🥞', title: th ? 'ทำแพนเค้กให้พอ' : 'Pancakes for everyone', ctx: th ? `สูตรนี้ทำแพนเค้กได้ ${s} คน ${N}ต้องทำให้ ${t} คน` : `This recipe makes pancakes for ${s} people. ${N} is cooking for ${t} people.`,
      fig: TF.table(th ? [['แพนเค้ก ' + s + ' คน', ''], ['ไข่', e + ' ฟอง'], ['แป้ง', f + ' กรัม'], ['นม', milk + ' มล.']] : [['Pancakes for ' + s, ''], ['Eggs', String(e)], ['Flour', f + (f === 1 ? ' cup' : ' cups')], ['Milk', milk + (milk === 1 ? ' cup' : ' cups')]], th ? 'สูตรแพนเค้ก' : 'recipe'),
      qs: [{q: th ? 'ต้องใช้ไข่กี่ฟอง' : 'How many eggs does the bigger batch need?', a: eggs, o: [e + (t - s), eggs + 1, e], how: th ? `${t} ÷ ${s} = ${tN(mult)} เท่าของสูตร → ${e} × ${tN(mult)} = ${eggs} ฟอง` : `${t} ÷ ${s} = ${tN(mult)} times the recipe; ${e} × ${tN(mult)} = ${eggs} eggs`},
        {q: th ? 'ต้องใช้แป้งกี่กรัม' : 'How many cups of flour does it need?', a: flour, o: [f * t, flour + (th ? 100 : 1), f], how: th ? `${tN(f)} × ${tN(mult)} = ${tN(flour)} กรัม` : `${f} × ${tN(mult)} = ${flour} cups`},
        {q: th ? `แป้งขายเป็นถุง ถุงละ ${tN(bag)} กรัม ต้องซื้ออย่างน้อยกี่ถุง` : `Flour comes in bags of ${bag} cups. How many bags must ${N} buy?`, a: bags, o: [Math.floor(flour / bag), bags + 1, bags + 2], how: how3 + (th ? ' ถุง' : (bags === 1 ? ' bag' : ' bags'))}]}; }},
  {id: 'train', mk: (R, L) => { const th = L === 'th', N = R.pick(CASE_NAMES[L]), T0 = 6 * 60 + R.r(6, 18) * 5, gp = [R.r(5, 10) * 5, R.r(5, 10) * 5];   // 🚆 a timetable: how long → the next train → the wait
    const dep = [T0, T0 + gp[0], T0 + gp[0] + gp[1]], dur = [R.r(8, 19) * 5, R.r(8, 19) * 5, R.r(8, 19) * 5]; if(new Set(dur).size < 3) return null;
    const arr = dep.map((d, i) => d + dur[i]), i = R.r(0, 2), j = R.r(1, 2), T = dep[j - 1] + R.r(1, gp[j - 1] / 5 - 1) * 5, wait = dep[j] - T, tm = th ? tmT : tmE, nm = k => (th ? 'ขบวน ' : 'Train ') + (k + 1);
    const naive = (Math.floor(arr[i] / 60) * 100 + arr[i] % 60) - (Math.floor(dep[i] / 60) * 100 + dep[i] % 60);   /* the "subtract the clock digits" slip */
    return {icon: '🚆', title: th ? 'นั่งรถไฟเข้าเมือง' : 'Catch the train', ctx: th ? `${N}จะไปธุระในเมือง ตารางเวลารถไฟรอบเช้าเป็นดังนี้` : `${N} is taking a train to the city. Here is the morning timetable.`,
      fig: TF.table([th ? ['ขบวน', 'ออก', 'ถึง'] : ['Train', 'Leaves', 'Arrives']].concat(dep.map((d, k) => [nm(k), tm(d), tm(arr[k])])), th ? 'ตารางเวลารถไฟ' : 'timetable'),
      qs: [{q: th ? `${nm(i)} ใช้เวลาเดินทางกี่นาที` : `How many minutes does ${nm(i)} take?`, a: dur[i], o: [naive, dur[(i + 1) % 3], dur[i] + 10], how: th ? `${tm(dep[i])} น. ถึง ${tm(arr[i])} น. = ${dur[i]} นาที` : `${tm(dep[i])} to ${tm(arr[i])} = ${dur[i]} minutes`},
        {q: th ? `${N}มาถึงสถานีเวลา ${tm(T)} น. ขบวนถัดไปที่ยังทันคือขบวนใด` : `${N} gets to the station at ${tm(T)}. Which is the next train ${N} can still catch?`, a: nm(j), o: [nm(j - 1), nm(j === 1 ? 2 : 0), th ? 'ไม่ทันสักขบวน' : 'None of them'],
          how: th ? `${nm(j - 1)} ออกไปแล้วตอน ${tm(dep[j - 1])} น. ${nm(j)} ออก ${tm(dep[j])} น. → ${nm(j)}` : `${nm(j - 1)} already left at ${tm(dep[j - 1])}; ${nm(j)} leaves at ${tm(dep[j])} → ${nm(j)}`},
        {q: th ? `${N}ต้องรอขบวนนั้นกี่นาที` : `How many minutes does ${N} wait for that train?`, a: wait, o: [T - dep[j - 1], wait + 5, arr[j] - T], how: th ? `${tm(T)} น. ถึง ${tm(dep[j])} น. = ${wait} นาที` : `${tm(T)} to ${tm(dep[j])} = ${wait} minutes`}]}; }},
  {id: 'garden', mk: (R, L) => { const th = L === 'th', N = R.pick(CASE_NAMES[L]);   // 🏡 a garden: fence length (minus the gate) → fence cost → grass
    const Lg = th ? R.r(6, 20) : R.r(10, 30), Wd = th ? R.r(4, 12) : R.r(6, 18); if(Wd >= Lg) return null; const g = th ? R.pick([1, 2]) : R.pick([3, 4]), per = 2 * (Lg + Wd), len = per - g, area = Lg * Wd;
    const f = th ? R.r(15, 40) * 10 : R.r(3, 9), u = th ? 'ม.' : 'ft';
    const q3 = th ? (() => { const s = R.r(3, 9) * 10; return {q: `หญ้าราคาตารางเมตรละ ${s} บาท ปูหญ้าเต็มสวน ค่าหญ้ากี่บาท`, a: area * s, o: [per * s, area * s + s, area + s], how: `พื้นที่ ${Lg} × ${Wd} = ${area} ตร.ม. → ${area} × ${s} = ${cB(area * s)}`}; })()
      : (() => { const c = R.pick([20, 25, 30, 40]), bags = caseUp(area, c); return {q: `One bag of grass seed covers ${c} square feet. How many bags do they need for the whole garden?`, a: bags, o: [Math.floor(area / c), bags + 1, Math.round(per / c) + bags + 2], how: `Area: ${Lg} × ${Wd} = ${area} sq ft; ` + (area % c ? `${bags - 1} bags cover ${(bags - 1) * c} sq ft, not enough → ${bags} bags` : `${area} ÷ ${c} = ${bags} bags`)}; })();
    return {icon: '🏡', title: th ? 'จัดสวนหลังบ้าน' : 'The garden project', ctx: th ? `ครอบครัวของ${N}จะล้อมรั้วรอบสวน โดยเว้นช่องประตูไว้ ${g} เมตร แล้วปูหญ้าให้เต็มสวน` : `${N}'s family will put a fence around a garden, leaving a ${g} ft gap for the gate. Then they will plant grass.`,
      fig: TF.yard(Lg, Wd, u, g, th ? 'ประตู' : 'gate'),
      qs: [{q: th ? 'ต้องใช้รั้วยาวกี่เมตร' : 'How many feet of fence do they need?', a: len, o: [per, Lg + Wd, area], how: th ? `2 × (${Lg} + ${Wd}) = ${per} ม. ลบช่องประตู ${g} ม. = ${len} ม.` : `2 × (${Lg} + ${Wd}) = ${per} ft; ${per} − ${g} for the gate = ${len} ft`},
        {q: th ? `รั้วราคาเมตรละ ${f} บาท ค่ารั้วทั้งหมดกี่บาท` : `Fence costs $${f} a foot. How many dollars is the fence?`, a: len * f, o: [per * f, (Lg + Wd) * f, len * f + f], how: th ? `${len} × ${f} = ${cB(len * f)}` : `${len} × ${cD(f)} = ${cD(len * f)}`},
        q3]}; }},
  {id: 'data', mk: (R, L) => { const th = L === 'th', m0 = R.r(0, 8), v = [R.r(20, 90), R.r(20, 90), R.r(20, 90), R.r(20, 90)];   // 📊 read a table: total → mean → the month that grew most
    const sum = v.reduce((a, b) => a + b, 0); if(sum % 4) return null; const mean = sum / 4, ch = [v[1] - v[0], v[2] - v[1], v[3] - v[2]], top = Math.max(...ch); if(top <= 0 || ch.filter(c => c === top).length > 1) return null;
    const M = MONTHS[L].slice(m0, m0 + 4), best = M[ch.indexOf(top) + 1], sg = c => (c < 0 ? '−' : '+') + Math.abs(c);
    return {icon: '📊', title: th ? 'อ่านตารางยอดขาย' : 'Read the sales table', ctx: th ? 'สหกรณ์โรงเรียนจดจำนวนนมกล่องที่ขายได้ในแต่ละเดือน' : 'The school shop counts how many juice boxes it sells each month.',
      fig: TF.table([th ? ['เดือน', 'ขายได้ (กล่อง)'] : ['Month', 'Juice boxes']].concat(M.map((m, i) => [m, String(v[i])])), th ? 'ยอดขาย' : 'sales table'),
      qs: [{q: th ? 'สี่เดือนนี้ขายได้รวมกี่กล่อง' : 'How many juice boxes were sold in these 4 months?', a: sum, o: [sum - v[0], sum + 10, Math.max(...v) * 4], how: `${v.join(' + ')} = ${sum}`},
        {q: th ? 'เฉลี่ยขายได้เดือนละกี่กล่อง' : 'What is the mean (average) number sold each month?', a: mean, o: [Math.round(sum / 3), mean + 5, (v[1] + v[2]) / 2], how: th ? `${sum} ÷ 4 = ${mean} กล่อง` : `${sum} ÷ 4 = ${mean}`},
        {q: th ? 'เดือนใดขายได้เพิ่มขึ้นจากเดือนก่อนมากที่สุด' : 'Which month grew the most from the month before?', a: best, o: M.filter(m => m !== best), how: M.slice(1).map((m, i) => m + ' ' + sg(ch[i])).join(', ') + (th ? ' → ' + best + ' เพิ่มมากที่สุด' : ' → ' + best + ' grew the most')}]}; }},
  {id: 'power', mk: (R, L) => { const th = L === 'th', r0 = R.r(10000, 40000), u = R.r(15, 60) * 10, r1 = r0 + u, k = R.pick([10, 20, 50]), less = u * (100 - k) / 100;   // 💡 the electric bill: units used → the bill → next month with k % less
    if(!th){ const p = R.pick([12, 15, 18, 20]), f = R.pick([8, 10, 12]), bill = u * p + f * 100;
      return {icon: '💡', title: 'The electric bill', ctx: `Electricity costs ${p}¢ for each kWh, plus a ${cD(f)} service fee every month.`,
        fig: TF.table([['Electric meter', 'kWh'], ['Last month', tN(r0)], ['This month', tN(r1)]], 'meter readings'),
        qs: [{q: 'How many kWh did the family use this month?', a: u, o: [u + 100, u - 10, u + 1000], how: `${tN(r1)} − ${tN(r0)} = ${u} kWh`},
          {q: 'How much is this month\'s bill?', a: tMoney(bill), o: [tMoney(u * p), tMoney(u * p + 2 * f * 100), tMoney(u * (p + 1) + f * 100)], how: `${u} × ${p}¢ = ${tMoney(u * p)}; + ${cD(f)} fee = ${tMoney(bill)}`},
          {q: `Next month they plan to use ${k}% less. How many kWh is that?`, a: less, o: [u * k / 100, u - k, u], how: `${k}% of ${u} = ${u * k / 100}; ${u} − ${u * k / 100} = ${less} kWh`}]}; }
    const p = R.pick([4, 5]), f = R.pick([24, 38]), bill = u * p + f;
    return {icon: '💡', title: 'ค่าไฟฟ้าประจำเดือน', ctx: `ค่าไฟหน่วยละ ${p} บาท และมีค่าบริการเดือนละ ${f} บาท`,
      fig: TF.table([['มิเตอร์ไฟฟ้า', 'หน่วย'], ['เดือนที่แล้ว', tN(r0)], ['เดือนนี้', tN(r1)]], 'มิเตอร์ไฟฟ้า'),
      qs: [{q: 'เดือนนี้บ้านนี้ใช้ไฟไปกี่หน่วย', a: u, o: [u + 100, u - 10, u + 1000], how: `${tN(r1)} − ${tN(r0)} = ${u} หน่วย`},
        {q: 'ค่าไฟเดือนนี้ต้องจ่ายกี่บาท', a: bill, o: [u * p, u * p + 2 * f, u * (p + 1) + f], how: `${u} × ${p} = ${tN(u * p)} บาท + ค่าบริการ ${f} บาท = ${cB(bill)}`},
        {q: `เดือนหน้าตั้งใจใช้ไฟลดลง ${k}% จะใช้ไฟกี่หน่วย`, a: less, o: [u * k / 100, u - k, u], how: `${k}% ของ ${u} = ${u * k / 100} → ${u} − ${u * k / 100} = ${less} หน่วย`}]}; }},
  {id: 'bulk', mk: (R, L) => { const th = L === 'th', n1 = R.pick([4, 5, 6]), n2 = R.pick([10, 12, 15, 20]), N = tLcm(n1, n2); if(N > 60) return null;   // 🛒 two pack sizes: price each → price each → money saved
    const pa = th ? R.r(6, 15) : R.r(2, 6), pb = th ? R.r(5, 14) : R.r(1, 5); if(pa === pb) return null; const hi = Math.max(pa, pb), lo = Math.min(pa, pb), saved = N * (hi - lo), M = th ? cB : cD;
    return {icon: '🛒', title: th ? 'ซื้อแพ็กไหนคุ้มกว่า' : 'Which pack is the better deal?', ctx: th ? `ห้องเรียนต้องใช้น้ำดื่ม ${N} ขวด ร้านมีให้เลือก 2 แพ็ก` : `The class needs ${N} notebooks. The store sells two packs.`,
      fig: TF.table(th ? [['', 'แพ็ก A', 'แพ็ก B'], ['จำนวน', n1 + ' ขวด', n2 + ' ขวด'], ['ราคา', cB(n1 * pa), cB(n2 * pb)]] : [['', 'Pack A', 'Pack B'], ['Notebooks', String(n1), String(n2)], ['Price', cD(n1 * pa), cD(n2 * pb)]], th ? 'แพ็กน้ำดื่ม' : 'packs'),
      qs: [{q: th ? 'แพ็ก A ตกขวดละกี่บาท' : 'How many dollars is one notebook in Pack A?', a: pa, o: [pb, pa + 1, n1 * pa - n1], how: th ? `${tN(n1 * pa)} ÷ ${n1} = ${cB(pa)}` : `${cD(n1 * pa)} ÷ ${n1} = ${cD(pa)}`},
        {q: th ? 'แพ็ก B ตกขวดละกี่บาท' : 'How many dollars is one notebook in Pack B?', a: pb, o: [pa, pb + 1, n2 * pb - n2], how: th ? `${tN(n2 * pb)} ÷ ${n2} = ${cB(pb)}` : `${cD(n2 * pb)} ÷ ${n2} = ${cD(pb)}`},
        {q: th ? `ถ้าซื้อครบ ${N} ขวดจากแพ็กที่ถูกกว่า จะประหยัดกว่าอีกแพ็กกี่บาท` : `How many dollars does the class save by buying all ${N} notebooks in the cheaper pack?`, a: saved, o: [hi - lo, N * lo, saved + N],
          how: th ? `${N} × ${hi} = ${tN(N * hi)} บาท, ${N} × ${lo} = ${tN(N * lo)} บาท → ประหยัด ${cB(saved)}` : `${N} × ${cD(hi)} = ${cD(N * hi)}, ${N} × ${cD(lo)} = ${cD(N * lo)} → save ${M(saved)}`}]}; }},
  {id: 'stand', mk: (R, L) => { const th = L === 'th', N = R.pick(CASE_NAMES[L]), n = R.r(20, 60);   // 🍋 a lemonade stand: money in → profit → cups for a profit goal
    const p = th ? R.pick([15, 20, 25]) : R.pick([3, 4, 5]), c = th ? R.r(6, 12) : R.r(1, p - 2 || 1); if(c >= p) return null; const pc = p - c, G = th ? R.r(5, 20) * 100 : R.r(5, 20) * 10, need = caseUp(G, pc), M = th ? cB : cD;
    const how3 = G % pc === 0 ? `${tN(G)} ÷ ${pc} = ${need}` : `${need - 1} × ${pc} = ${tN((need - 1) * pc)} ${th ? 'ยังไม่ถึง' : 'is not enough'} → ${need}`;
    return {icon: '🍋', title: th ? 'ร้านน้ำมะนาว' : 'The lemonade stand', ctx: th ? `${N}ขายน้ำมะนาวแก้วละ ${p} บาท ต้นทุนแก้วละ ${c} บาท วันเสาร์ขายได้ ${n} แก้ว` : `${N} runs a lemonade stand. A cup sells for ${cD(p)} and costs ${cD(c)} to make. On Saturday ${N} sold ${n} cups.`,
      qs: [{q: th ? 'วันเสาร์ขายได้เงินทั้งหมดกี่บาท' : `How many dollars did ${N} take in on Saturday?`, a: n * p, o: [n * c, n * pc, n * p + p], how: th ? `${n} × ${p} = ${cB(n * p)}` : `${n} × ${cD(p)} = ${cD(n * p)}`},
        {q: th ? 'วันเสาร์ได้กำไรกี่บาท' : `How many dollars of profit did ${N} make?`, a: n * pc, o: [n * p, n * c, n * p - c], how: th ? `${n} × (${p} − ${c}) = ${n} × ${pc} = ${cB(n * pc)}` : `${n} × (${cD(p)} − ${cD(c)}) = ${n} × ${cD(pc)} = ${cD(n * pc)}`},
        {q: th ? `ครั้งหน้าอยากได้กำไรอย่างน้อย ${tN(G)} บาท ต้องขายอย่างน้อยกี่แก้ว` : `How many cups must ${N} sell next time to make at least ${M(G)} profit?`, a: need, o: [Math.floor(G / pc), need + 1, caseUp(G, p)], how: (th ? 'แก้วละกำไร ' + pc + ' บาท: ' : 'Each cup makes ' + cD(pc) + ': ') + how3 + (th ? ' แก้ว' : ' cups')}]}; }}
];
/* 📏 s4a tests#6 */
function makeCaseQ(mode, L){   // 💀 one case = its 3 questions; the first comes back now, the other two wait in q.caseRest (nextQ queues them)
  const lang = mode === 'testth' ? 'th' : 'en', th = lang === 'th', pool = CASES.filter(c => !c.only || c.only === lang), cid = c => 'c' + c.id;
  const used = (G && G.mode === mode && G.tkUsed) || new Set(), seen = new Set(trickSeen[lang] || []);
  let fresh = pool.filter(c => !seen.has(cid(c)) && !used.has(cid(c)));
  if(!fresh.length){ const ids = new Set(pool.map(cid)); trickSeen[lang] = (trickSeen[lang] || []).filter(id => !ids.has(id) || used.has(id)); fresh = pool.filter(c => !used.has(cid(c))); }
  if(!fresh.length) fresh = pool;
  const bold = x => UI.esc(x).replace(/−?\$?[0-9][0-9,]*(\.[0-9]+)?/g, m => '<b>' + m + '</b>'), sayFix = t => t.replace(/−(?=[0-9(])/g, th ? 'ลบ ' : 'minus ');
  for(let k = 0; k < 60; k++){
    const c = pick(fresh), cs = c.mk({r: randInt, pick}, lang); if(!cs) continue;
    const qs = cs.qs.map((it, i) => { const num = typeof it.a === 'number', head = cs.icon + ' ' + cs.title;
      const q = {test: true, cased: true, caseStep: i, caseIcon: cs.icon, caseTitle: cs.title, id: cid(c), lang, mode, grade: 99, gradeLabel: '', padX: true, op: 'add', a: 0, b: 0, missing: '',
        word: head + ' — ' + cs.ctx + ' ' + it.q, say: sayFix((i === 0 ? cs.title + '. ' + cs.ctx + ' ' : '') + it.q), storyHtml: '<span class="cctx"><span class="ct">' + UI.esc(head) + '</span> ' + bold(cs.ctx) + '</span><span class="cq">' + bold(it.q) + '</span>',
        fig: cs.fig || null, how: it.how, vis: null, right: num ? tN(it.a) : String(it.a), key: 'cs' + c.id + '-' + i + '-' + ((cs.ctx + it.q).match(/[0-9]+/g) || []).join('_').slice(0, 60)};
      if(num){ q.ans = q.ask = tRd(it.a); q.choices = testChoices(it, L.choices); if(q.choices.length < 3) return null; }
      else { q.ans = q.ask = 0; q.wordAns = true; q.wchoices = testChoices(it, L.choices); q.choices = q.wchoices.map(x => x.w); if(q.wchoices.length < 3) return null; }
      return q; });
    if(qs.some(x => !x)) continue;
    qs[0].caseRest = qs.slice(1); qs.forEach(q => { q.gradeLabel = caseLabel(q, ((G && G.caseN) || 0) + 1); }); return qs[0];   // nextQ sets the real case number
  }
  return null;
}
/* 📏 s4a tests#7 */
function makeTestQ(mode, lvl, L){
  if(lvl >= 5){ const cq = makeCaseQ(mode, L); if(cq) return cq; }   // ➗ mq-t4 💀 a case card
  const lang = mode === 'testth' ? 'th' : 'en', band = Math.min(lvl, TEST_BUILT), [g0, g1] = TEST_BANDS[band], gOf = t => (lang === 'th' && t.gt) || t.g; let pool = TESTS.filter(t => gOf(t) >= g0 && gOf(t) <= g1 && (!t.only || t.only === lang));
  if(band === 4 && testGrade !== 'mix'){ const one = pool.filter(t => gOf(t) === Number(testGrade)); if(one.length) pool = one; }   // ➗ mq-t3: 🌋 grade chip   // ➗ mq-t2: gt = Thai grade
  if(!pool.length) return null;
  const used = (G && G.mode === mode && G.tkUsed) || new Set(), seen = new Set(trickSeen[lang] || []), tid = t => 'x' + t.id;
  let fresh = pool.filter(t => !seen.has(tid(t)) && !used.has(tid(t)));
  if(!fresh.length){ const ids = new Set(pool.map(tid)); trickSeen[lang] = (trickSeen[lang] || []).filter(id => !ids.has(id) || used.has(id)); fresh = pool.filter(t => !used.has(tid(t))); }
  if(!fresh.length) fresh = pool;
  for(let k = 0; k < 40; k++){
    const t = pick(fresh), it = t.mk({r: randInt, pick}, lang);
    if(!it) continue;
    const num = typeof it.a === 'number', bold = x => UI.esc(x).replace(/−?[0-9][0-9,]*(\.[0-9]+)?/g, m => '<b>' + m + '</b>');   // ➗ mq-t2: 2.75 / −8 stay one number
    const q = {test: true, id: tid(t), lang, mode, grade: gOf(t), gradeLabel: gradeLabel(gOf(t), lang), padX: gOf(t) >= 5, op: 'add', a: 0, b: 0, missing: '', word: it.q, say: (it.say || it.q).replace(/□/g, lang === 'th' ? 'อะไร' : 'what').replace(/−(?=[0-9(])/g, lang === 'th' ? 'ลบ ' : 'minus ').replace(/√/g, lang === 'th' ? 'รากที่สองของ ' : 'square root of '), storyHtml: bold(it.q), fig: it.fig || null, how: it.how, vis: null,
      right: num ? tN(it.a) : String(it.a), key: 'tt' + t.id + '-' + (((it.q + (it.fig ? it.fig.length : '')).match(/[0-9]+/g) || []).join('_').slice(0, 60) || '0')};
    if(num){ q.ans = q.ask = tRd(it.a); q.choices = testChoices(it, L.choices); if(q.choices.length < 3) continue; }
    else { q.ans = q.ask = 0; q.wordAns = true; q.wchoices = testChoices(it, L.choices); q.choices = q.wchoices.map(c => c.w); if(q.wchoices.length < 3) continue; }
    return q;
  }
  return null;
}
GameParts.loaded('MathQuest_tests', 's4a');
