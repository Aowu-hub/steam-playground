
// ======================= 🧥 MotionWear (mo-13, 🎬 Motion chat, 2026-11-20): 🦴 prop rigs — capes · scarves · flags · tassels get their OWN bones · 👕 back-arm wear hook · 🫁 breathe together (Motion rules §36–37) =======================
// Its OWN file MotionWear.html (born split, build_motion.py) — loads with AvatarKit right after MotionFX2. Never edits AvatarMotion: adds Motion.wearSwing · paintSwing · drawSwingRig · SWING · PROP_RIGS ·
// breatheWith · breathePose · drawBreathe. Pure (same t = same picture), draws nothing unless called. Aowu 12:37: "cape can have its own rig so the follow-through works better — same as other prop items".
//
// ⭐ S = Motion.wearSwing(o, hook, rig)  — inside an AK_WEAR hook (o = the hook's object: {k, t, P, …})
//      hook: 'back' (🎒 back hook, body frame) · 'neck' (📿 neck hook, chest frame) · 'hand' (✋ the held-thing hook: at the front hand, turned by holdRot)
//      rig  = a PROP RIG: {mat: 'cape' | 'scarf' | 'flag' | 'tassel' | 'stiff', bones: [[x, y], …] (2–5 points in the piece's standing units: where it is fixed → … → its free end),
//              lo, max (per bone, rad; + = away from the body / trailing), k, damp, air, drag, grav, frame, shift} — or a name from Motion.PROP_RIGS ('cape' · 'longcape' · 'scarf' · 'flag' · 'tassel' · 'ribbon')
//      → {m (the hook's matrix for that part, units), a: [one angle per bone], bones, rig}. Each bone = a spring back to the worn shape + the cloth's damping + air (× the body's speed)
//      + gravity when the body leans + the body is SOLID (a cape never swings into / under the body). Standing still = all 0 = today's picture, pixel for pixel.
// ⭐ Motion.paintSwing(g, S, paint, {slices, v0, v1})  — paints the piece bent along its bones in thin slices (paint() draws it standing, as today; S.m applied here; call in units = after g.scale(k, k))
// ⭐ Motion.drawSwingRig(g, S, {col})  — the bones as a picture (look tests · tuning) · Motion.PROP_RIGS — ready rigs for AvatarWear / AvatarWeapons pieces
// History: the act's own frames (Acting.draw passes the frame → AvatarKit artWearAt.O.hangF._mo) · Motion.alive travel (_mo.moveAt) · the game's H.feed (opts.hang) · else the pose alone.
//
// 👕 AvatarKit hook (mo-13): artWearAt(g, av, 'wristL', k, t, hy, handL, foreL, armLen) right after the back arm (chest frame, before the body = in its shadow) — only page wear
//      (av.cw.wristL with td) draws; Motion.rigAt(P, 'shoulderL' | 'elbowL' | 'handL', k) are the matching rig points (same frame).
//
// 🫁 B = Motion.breatheWith({t0, need: 3, lag: 0.35, seed})  — two figures breathe together (Avateer Ch. 3: Old Tock · Haboob · Mame)
//      B.hold(t, true | false)  the player's hold (in) / let go (out) · B.at(t) → {you: {lv, phase}, them: {lv, sync, calm, shake}, count, need, done, doneAt}
//      Motion.breathePose(P, lv, {shake, t}) → a pose copy that breathes deep (chest · shoulders · chin · arms) · Motion.drawBreathe(g, B, t, {you: {x, y, k}, them: {x, y, k}, day, calm})
(function () {
'use strict';
const M = window.Motion; if (!M || !M.rigXf || !M.rigAt) return;
const cl = (v, a, b) => v < a ? a : v > b ? b : v, ss = (a, b, x) => { const u = cl((x - a) / ((b - a) || 1e-6), 0, 1); return u * u * (3 - 2 * u); };
const wrap = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
const WIN = 0.6, DT = 1 / 120, GRAV = 980;
// materials: k = spring back to the worn shape (1/s², the free end tipK × it) · damp = the cloth's own damping vs the body (a stop swings past once, then settles) ·
// air + drag = air on the cloth (1/s + × the BODY's speed, the free end tipDrag × it: a walk barely trails, a run streams, the drag stops with the body) ·
// grav = share of the gravity felt when the body leans (hang: true = real gravity, the piece droops when still — flags · tassels) · lo / max = bone limits (rad; + = away from the body / trailing; last value repeats) · run = units/s of a Motion.alive run (walk = 0.42 of it) ·
// len = the chain is simulated at ONE size so a short tail and a long cape answer the same moves with the same angles
const SWING = {
  cape:   {k: 30, tipK: 0.7, tipDrag: 1.3, damp: 3.5, air: 1.0, drag: 0.011, grav: 0.55, lo: [-0.04, -0.1, -0.14], max: [0.85, 0.5, 0.45], run: 210, len: 42},
  scarf:  {k: 18, tipK: 0.7, tipDrag: 1.4, damp: 3, air: 1.0, drag: 0.026, grav: 0.6, lo: [-0.45, -0.4, -0.4], max: [0.85, 0.7, 0.7], run: 210, len: 40},
  flag:   {k: 22, tipK: 0.6, tipDrag: 1.5, damp: 3.2, air: 1.0, drag: 0.02, grav: 0.5, hang: true, lo: [-1.2, -0.8, -0.8], max: [1.2, 0.8, 0.8], run: 210, len: 40},
  tassel: {k: 14, tipK: 0.7, tipDrag: 1.3, damp: 2.4, air: 1.0, drag: 0.012, grav: 1.0, hang: true, lo: [-1.6, -1.0, -1.0], max: [1.6, 1.0, 1.0], run: 210, len: 30},
  stiff:  {k: 90, tipK: 1, tipDrag: 1, damp: 9, air: 1.0, drag: 0.003, grav: 0.25, lo: [-0.02, -0.04], max: [0.3, 0.2], run: 210, len: 40},
};
// 🦴 ready prop rigs (standing units of AvatarWear / AvatarWeapons art): bones from the fixed point to the free end
const PROP_RIGS = {
  cape:     {hook: 'back', mat: 'cape', bones: [[-4, -47], [-8.5, -33], [-13.5, -19], [-19, -6]]},
  longcape: {hook: 'back', mat: 'cape', bones: [[-4, -47], [-9, -30], [-15, -13], [-21, 4]]},
  scarf:    {hook: 'neck', mat: 'scarf', bones: [[-8.5, -47], [-13, -44.6], [-17.5, -42], [-21.5, -39.5]]},
  flag:     {hook: 'hand', mat: 'flag', bones: [[-1, -54], [-10, -54], [-20, -54], [-30, -54]]},
  tassel:   {hook: 'hand', mat: 'tassel', bones: [[0, 4], [0, 9], [0, 14], [0, 19]]},
  ribbon:   {hook: 'hand', mat: 'scarf', bones: [[0, -28], [-6, -24], [-12, -20], [-18, -16], [-24, -12]]},
};
// the hook frame → world (avatar units, facing +x, feet at 0) — AvatarKit: translate(dy) · scale(sx, sy) · rotFull about (0, −34) · rot  [· bend about (0, −20) · chest width]
const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
const about = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return [c, s, -s, c, x - c * x + s * y, y - s * x - c * y]; };
function frameW(Q, hook) {
  let m = [Q.sx || 1, 0, 0, Q.sy || 1, 0, Q.dy || 0];
  if (Q.rotFull) m = mul(m, about(0, -34, Q.rotFull)); if (Q.rot) m = mul(m, about(0, 0, Q.rot));
  if (hook !== 'back' && Q.bend) m = mul(m, about(0, -20, Q.bend));
  if (hook === 'neck') { const cs = (M.rigAt(Q, 'neck').w) || 1; if (cs !== 1) m = mul(m, [cs, 0, 0, 1, 0, 0]); }
  return m;
}
// the hook's own matrix (piece standing units → hook frame units): back + neck = Motion.rigXf · hand = the AvatarKit hand hook (at the front hand, turned by holdRot)
function hookM(Q, hook, rig) {
  if (hook === 'hand') return [1, 0, 0, 1, 0, 0];
  return M.rigXf(Q, hook, Object.assign(hook === 'neck' ? {hang: false} : {}, rig && rig.frame ? {frame: rig.frame} : {}));
}
function hookWorld(Q, hook) {   // hook frame → world, for the physics
  if (hook === 'hand') { const h = M.rigAt(Q, 'handR', 1, {frame: 'upper'}); return mul(mul(frameW(Q, 'upper'), [1, 0, 0, 1, h.x, h.y]), about(0, 0, Q.holdRot || 0)); }
  return mul(frameW(Q, hook), M.rigXf(Q, hook, hook === 'neck' ? {hang: false} : {}));
}
const ap = (m, p) => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
// the body's history over WIN seconds (oldest first) — poses + travel
function history(o) {
  const P = o.P || {}, AW = typeof artWearAt === 'function' && artWearAt.P === P ? artWearAt : null, O = o.O || (AW && AW.O) || {}, F = O.hangF && typeof O.hangF === 'object' ? O.hangF : null,   /* 🧊 mo-13: o.O / o.D = the turned frame's own opts (MotionTurn) */
    mo = F && F._mo, H = O.hang && typeof O.hang === 'object' && O.hang.buf && O.hang.buf.length ? O.hang : null, d0 = o.D || (AW && AW.D) || 1, n = Math.round(WIN / DT), out = [];
  const b = H ? H.buf : null, now = b ? b[b.length - 1] : null;
  const feedAt = tt => { if (tt <= b[0][0]) return [b[0][1], b[0][2]]; for (let i = 1; i < b.length; i++) if (tt <= b[i][0]) { const A = b[i - 1], B = b[i], q = (tt - A[0]) / Math.max(1e-6, B[0] - A[0]); return [A[1] + (B[1] - A[1]) * q, A[2] + (B[2] - A[2]) * q]; } const L = b[b.length - 1]; return [L[1], L[2]]; };
  const sp = []; for (let i = 0; i <= n; i++) sp.push(mo && mo.moveAt && !H ? mo.moveAt((n - i) * DT * 1000) : 0);
  const xs = new Array(n + 1); xs[n] = 0; for (let i = n - 1; i >= 0; i--) xs[i] = xs[i + 1] - (sp[i] + sp[i + 1]) / 2 * DT;   // Motion.alive travel: x = −∫ speed back from now
  for (let i = 0; i <= n; i++) {
    const ago = (n - i) * DT, Q = mo && mo.poseAt ? (i === n ? P : mo.poseAt(ago * 1000) || P) : P;
    let x = 0, y = 0; if (b) { const p = feedAt(now[0] - ago); x = (p[0] - now[1]) * d0; y = p[1] - now[2]; }
    out.push({Q, xn: xs[i], x, y});   // xn × the material's run speed · x, y = the game's feed (units)
  }
  return out;
}
const at = (arr, j) => arr[Math.min(j, arr.length - 1)];
function wearSwing(o, hook, rig) {
  if (typeof rig === 'string') rig = PROP_RIGS[rig]; rig = rig || PROP_RIGS.cape; hook = hook || rig.hook || 'back';
  const P = o.P || {}, mat = Object.assign({}, SWING[rig.mat] || SWING.cape, rig), m0 = hookM(P, hook, rig), sh = rig.shift,
    m = sh ? [m0[0], m0[1], m0[2], m0[3], m0[4] + sh[0] * m0[0] + sh[1] * m0[2], m0[5] + sh[0] * m0[1] + sh[1] * m0[3]] : m0,
    bones = rig.bones || PROP_RIGS.cape.bones, n = bones.length - 1, out = {m, a: new Array(n).fill(0), bones, rig, hook};
  const S = history(o), still = S.every(s => s.Q === P && !s.x && !s.y && !s.xn);
  const upright = Q => !(Q.rot || Q.rotFull || (hook !== 'back' && Q.bend) || (Q.dy || 0) || (hook === 'hand' && (Q.holdRot || Q.armR || Q.elbowR)));
  if (still && upright(P) && hook !== 'hand') return out;   // standing, no history = today's picture
  // simulated at ONE size (mat.len) about the fixed point
  const rl = []; for (let j = 0; j < n; j++) rl.push(Math.hypot(bones[j + 1][0] - bones[j][0], bones[j + 1][1] - bones[j][1]));
  const f = mat.len / (rl.reduce((a, b) => a + b, 0) || 1), L = rl.map(l => l * f), b0 = bones[0], Bs = bones.map(q => [b0[0] + (q[0] - b0[0]) * f, b0[1] + (q[1] - b0[1]) * f]);
  const kj = j => mat.k * (n > 1 ? 1 + (mat.tipK - 1) * j / (n - 1) : 1), dj = j => n > 1 ? 1 + (mat.tipDrag - 1) * j / (n - 1) : 1;
  const rest = s => { const mm = hookWorld(s.Q, hook), x = s.x + s.xn * mat.run, pts = Bs.map(q => { const r = ap(mm, q); return [r[0] + x, r[1] + s.y]; }); return {pts, dn: Math.atan2(mm[1], mm[0])}; };
  const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
  let R = rest(S[0]), R1 = rest(S[1]);
  const p = R.pts.slice(1).map(q => q.slice()), v = R.pts.slice(1).map((q, j) => [(R1.pts[j + 1][0] - q[0]) / DT, (R1.pts[j + 1][1] - q[1]) / DT]);
  let Rp = R;
  for (let s = 1; s < S.length; s++) {
    R = s === 1 ? R1 : rest(S[s]);
    const gx = mat.hang ? 0 : GRAV * mat.grav * Math.sin(R.dn), gy = GRAV * mat.grav * (mat.hang ? 1 : 1 - Math.cos(R.dn));   // gravity felt = true down − the frame's own down (upright = 0) · hang: real gravity (a flag droops when still)
    for (let j = 0; j < n; j++) { const T = R.pts[j + 1], q = p[j], w = v[j], vr = [(T[0] - Rp.pts[j + 1][0]) / DT, (T[1] - Rp.pts[j + 1][1]) / DT], ar = mat.air + mat.drag * Math.hypot(vr[0], vr[1]) * dj(j), kk = kj(j);
      w[0] += (kk * (T[0] - q[0]) + gx - ar * w[0] - mat.damp * (w[0] - vr[0])) * DT; w[1] += (kk * (T[1] - q[1]) + gy - ar * w[1] - mat.damp * (w[1] - vr[1])) * DT; }
    Rp = R;
    const o0 = p.map(q => q.slice());
    for (let j = 0; j < n; j++) { p[j][0] += v[j][0] * DT; p[j][1] += v[j][1] * DT; }
    for (let it = 0; it < 2; it++) for (let j = 0; j < n; j++) { const a = j ? p[j - 1] : R.pts[0], dx = p[j][0] - a[0], dy = p[j][1] - a[1], D = Math.hypot(dx, dy) || 1; p[j] = [a[0] + dx * L[j] / D, a[1] + dy * L[j] / D]; }   // the cloth keeps its length
    // the body is solid + each bone bends only so far: clamp bone by bone (the end keeps its own direction — no whip from the bump)
    let acc = 0;
    for (let j = 0; j < n; j++) { const a = j ? p[j - 1] : R.pts[0], r = ang(R.pts[j], R.pts[j + 1]) + acc, aj = wrap(ang(a, p[j]) - r), c = cl(aj, at(mat.lo, j), at(mat.max, j));
      if (c !== aj) p[j] = [a[0] + Math.cos(r + c) * L[j], a[1] + Math.sin(r + c) * L[j]]; acc += c; }
    for (let j = 0; j < n; j++) { v[j][0] = (p[j][0] - o0[j][0]) / DT; v[j][1] = (p[j][1] - o0[j][1]) / DT; }
  }
  let acc = 0;
  for (let j = 0; j < n; j++) { const a = j ? p[j - 1] : R.pts[0], aj = cl(wrap(ang(a, p[j]) - ang(R.pts[j], R.pts[j + 1]) - acc), at(mat.lo, j), at(mat.max, j)); out.a[j] = aj; acc += aj; }
  return out;
}
// ---------- paint the piece bent along its bones: thin slices across the chain, each turned by the angle there ----------
function bendOf(S) {   // the chain in standing units: u along it, the joint positions, θ(u) (each bone's angle ramps in around its joint)
  const B = S.bones, n = B.length - 1, U = [0]; for (let j = 0; j < n; j++) U.push(U[j] + Math.hypot(B[j + 1][0] - B[j][0], B[j + 1][1] - B[j][1]));
  const th = u => { let t = 0; for (let j = 0; j < n; j++) { const l = U[j + 1] - U[j]; t += S.a[j] * (j ? ss(U[j] - 0.25 * (U[j] - U[j - 1]), U[j] + 0.55 * l, u) : ss(0, 0.85 * l, u)); } return t; };
  const spine = u => { if (u <= 0) return B[0].slice(); for (let j = 0; j < n; j++) if (u <= U[j + 1] || j === n - 1) { const q = (u - U[j]) / ((U[j + 1] - U[j]) || 1); return [B[j][0] + (B[j + 1][0] - B[j][0]) * q, B[j][1] + (B[j + 1][1] - B[j][1]) * q]; } };
  return {U, th, spine, len: U[n]};
}
function paintSwing(g, S, paint, o) {
  o = o || {}; const m = S.m, B = S.bones;
  g.save(); if (m) g.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
  if (S.a.every(a => Math.abs(a) < 1e-3)) { try { paint(); } finally { g.restore(); } return; }
  const C = bendOf(S), p0 = B[0], pe = B[B.length - 1], ax = [pe[0] - p0[0], pe[1] - p0[1]], AL = Math.hypot(ax[0], ax[1]) || 1, Ux = [ax[0] / AL, ax[1] / AL], V = [-Ux[1], Ux[0]];
  const uEnd = C.len + (o.over != null ? o.over : 18), n = o.slices || 14, v0 = o.v0 != null ? o.v0 : -60, v1 = o.v1 != null ? o.v1 : 60, ov = 1.2;
  const band = (ua, ub) => { const c = (u, w) => [p0[0] + Ux[0] * u + V[0] * w, p0[1] + Ux[1] * u + V[1] * w]; const q = [c(ua, v0), c(ub, v0), c(ub, v1), c(ua, v1)];
    g.beginPath(); g.moveTo(q[0][0], q[0][1]); for (let i = 1; i < 4; i++) g.lineTo(q[i][0], q[i][1]); g.closePath(); g.clip(); };
  try {
    g.save(); band(-200, ov); paint(); g.restore();   // above the fixed point: sewn on / held, rigid
    let b = p0.slice(), us = 0; const sub = 4;
    for (let i = 0; i < n; i++) {
      const ua = uEnd * i / n, ub = uEnd * (i + 1) / n, t0 = C.th(ua), s0 = C.spine(ua);
      g.save(); g.translate(b[0], b[1]); g.rotate(t0); g.translate(-s0[0], -s0[1]); band(ua - (i ? ov : 0), i === n - 1 ? 400 : ub + ov); paint(); g.restore();
      for (let j = 1; j <= sub; j++) { const u = ua + (ub - ua) * j / sub, sA = C.spine(us), sB = C.spine(u), tt = C.th((us + u) / 2), dx = sB[0] - sA[0], dy = sB[1] - sA[1], c = Math.cos(tt), s = Math.sin(tt);
        b = [b[0] + dx * c - dy * s, b[1] + dx * s + dy * c]; us = u; }
    }
  } finally { g.restore(); }
}
// the bones as a picture: lines + joints, after the bend (look tests · tuning)
function drawSwingRig(g, S, o) {
  o = o || {}; const C = bendOf(S), B = S.bones, m = S.m; g.save(); if (m) g.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
  let b = B[0].slice(); const pts = [b.slice()], steps = 40; let us = 0;
  for (let i = 1; i <= steps; i++) { const u = C.len * i / steps, sA = C.spine(us), sB = C.spine(u), tt = C.th((us + u) / 2), c = Math.cos(tt), s = Math.sin(tt); b = [b[0] + (sB[0] - sA[0]) * c - (sB[1] - sA[1]) * s, b[1] + (sB[0] - sA[0]) * s + (sB[1] - sA[1]) * c]; us = u; pts.push(b.slice()); }
  g.lineWidth = o.w || 1.1; g.strokeStyle = o.col || '#FF2E88'; g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke();
  C.U.forEach(u => { const q = pts[Math.round(u / C.len * steps)]; g.beginPath(); g.arc(q[0], q[1], o.r || 1.6, 0, 7); g.fillStyle = '#FFFFFF'; g.fill(); g.lineWidth = 0.9; g.strokeStyle = o.col || '#FF2E88'; g.stroke(); });
  g.restore();
}

// ======================= 🫁 breathe together =======================
const TIN = 0.55, TOUT = 0.85;   // the player's breath: in while held (fills in ~1.6 s), out when let go (~2.5 s)
function breatheWith(o) {
  o = o || {}; const t0 = o.t0 || 0, need = o.need || 3, LAG = o.lag != null ? o.lag : 0.35, seed = (o.seed || 7) * 1.37, ev = [];
  const B = {need};
  B.hold = (t, on) => { on = !!on; const L = ev[ev.length - 1]; if (L && t < L.t) { let i = ev.length; while (i > 0 && ev[i - 1].t > t) i--; ev.splice(i, 0, {t, on}); } else if (!L || L.on !== on) ev.push({t, on}); return B; };
  const lvAt = t => { let lv = 0, on = false, ts = t0; for (const e of ev) { if (e.t > t) break; lv = on ? 1 - (1 - lv) * Math.exp(-(e.t - ts) / TIN) : lv * Math.exp(-(e.t - ts) / TOUT); on = e.on; ts = e.t; }
    return {lv: on ? 1 - (1 - lv) * Math.exp(-(t - ts) / TIN) : lv * Math.exp(-(t - ts) / TOUT), on, since: t - ts}; };
  // a breath counts when the player held ≥ 0.8 s and then let go for ≥ 1.0 s (slow out)
  const counted = t => { const out = []; for (let i = 0; i < ev.length; i++) { const e = ev[i], nx = ev[i + 1]; if (!e.on || !nx || nx.on) continue; if (nx.t - e.t < 0.8) continue;
    const back = ev[i + 2], endOut = back ? back.t : Infinity; if (Math.min(endOut, t) - nx.t >= 1.0) out.push(nx.t + 1.0); } return out.filter(x => x <= t); };
  B.at = t => {
    const Y = lvAt(t), cs = counted(t), cnt = Math.min(need, cs.length), ramp = cs.slice(0, need).reduce((s, x) => s + ss(x, x + 0.6, t), 0) / need;
    const s = cl(ramp, 0, 1), tl = Math.max(t0, t - LAG), Ly = lvAt(tl).lv, f = 2.3 - 1.5 * s;   // their breath: fast + shallow → copies yours a beat later
    const pan = 0.42 + 0.22 * Math.sin((t - t0) * f * 2 * Math.PI + seed) + 0.06 * Math.sin((t - t0) * 7.3 + seed * 2);
    const phase = Y.on ? (Y.lv > 0.92 ? 'hold' : 'in') : (Y.lv > 0.06 ? 'out' : 'rest');
    return {you: {lv: Y.lv, phase}, them: {lv: cl(pan * (1 - s) + Ly * s, 0, 1), sync: s, calm: s, shake: (1 - s) * 0.6}, count: cnt, need, done: cnt >= need, doneAt: cnt >= need ? cs[need - 1] : null};
  };
  return B;
}
// a deep breath on a pose (copy): chest rises, shoulders lift, chin up, arms open; shake = a scared tremble that fades as you breathe together
function breathePose(P, lv, o) {
  o = o || {}; const Q = Object.assign({}, P || {}), sh = o.shake || 0, t = o.t || 0;
  Q.sy = (Q.sy == null ? 1 : Q.sy) * (1 + 0.045 * lv); Q.shrugL = cl((Q.shrugL || 0) + 0.28 * lv, 0, 1); Q.shrugR = cl((Q.shrugR || 0) + 0.28 * lv, 0, 1);
  Q.nod = (Q.nod || 0) - 0.07 * lv; Q.armL = (Q.armL || 0) + 0.09 * lv; Q.armR = (Q.armR || 0) + 0.09 * lv; Q.dy = (Q.dy || 0) - 1.6 * lv;
  if (sh) { Q.rot = (Q.rot || 0) + sh * 0.025 * Math.sin(t * 43); Q.shift = (Q.shift || 0) + sh * 0.5 * Math.sin(t * 37 + 1); }
  return Q;
}
const mix = (a, b, q) => { const A = parseInt(a.slice(1), 16), B2 = parseInt(b.slice(1), 16), c = s => Math.round(((A >> s) & 255) + (((B2 >> s) & 255) - ((A >> s) & 255)) * q);
  return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1); };
const shd = (h, f) => mix(h, f < 1 ? '#000000' : '#FFFFFF', f < 1 ? 1 - f : f - 1);
// two balloons over the heads (size = breath) · the strings meet when you breathe together · count dots · a soft star when done
function drawBreathe(g, B, t, o) {
  o = o || {}; const R = B.at(t), day = !!o.day, ink = day ? '#3A3550' : '#FFFFFF';
  const one = (who, lv, col, dots, top) => { if (!who) return null; const k = who.k || 1, x = who.x, y = who.y - (who.h || 96) * k, r = (8 + 11 * lv) * k, bob = Math.sin(t * 2.1 + x * 0.01) * 1.2 * k;
    const bx = x, by = y - r - 6 * k + bob;
    g.save(); g.lineWidth = 1.2 * k; g.strokeStyle = day ? 'rgba(58,53,80,0.55)' : 'rgba(255,255,255,0.6)'; g.beginPath(); g.moveTo(bx, by + r * 1.08);
    g.bezierCurveTo(bx + 3 * k, by + r + 6 * k, bx - 3 * k, y - 3 * k, x, y + 4 * k); g.stroke();
    g.beginPath(); g.ellipse(bx, by, r * 0.94, r * 1.06, 0, 0, 7); g.fillStyle = col; g.fill(); g.lineWidth = 1.6 * k; g.strokeStyle = shd(col, 0.55); g.stroke();
    g.beginPath(); g.ellipse(bx - r * 0.35, by - r * 0.42, r * 0.22, r * 0.34, -0.5, 0, 7); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fill();
    g.beginPath(); g.moveTo(bx - 2.4 * k, by + r * 1.1); g.lineTo(bx + 2.4 * k, by + r * 1.1); g.lineTo(bx, by + r * 1.02 - 1 * k); g.closePath(); g.fillStyle = shd(col, 0.7); g.fill();
    if (dots) for (let i = 0; i < B.need; i++) { const dx = bx + (i - (B.need - 1) / 2) * 7 * k, dy = by - r * 1.06 - 7 * k; g.beginPath(); g.arc(dx, dy, 2.4 * k, 0, 7);
      g.fillStyle = i < R.count ? col : 'rgba(0,0,0,0)'; g.fill(); g.lineWidth = 1.1 * k; g.strokeStyle = day ? shd(col, 0.55) : '#FFFFFF'; g.stroke(); }
    g.restore(); return [bx, by, r, k]; };
  const yc = '#5BC0EB', tc = mix('#FF8A5B', '#5BC0EB', R.them.sync);
  const A = one(o.you, R.you.lv, yc, true), C = one(o.them, R.them.lv, tc, false);
  if (A && C && R.them.sync > 0.05 && !o.calm) {   // the dashed thread between the two balloons: in step = solid
    const q = R.them.sync, gap = Math.abs(R.you.lv - R.them.lv); g.save(); g.globalAlpha = 0.25 + 0.6 * q * (1 - Math.min(1, gap * 2)); g.lineWidth = 1.6 * A[3]; g.strokeStyle = ink;
    g.setLineDash(q > 0.98 ? [] : [4 * A[3], 4 * A[3]]); g.beginPath(); const mx = (A[0] + C[0]) / 2, my = Math.min(A[1], C[1]) - 26 * A[3]; g.moveTo(A[0], A[1] - A[2]); g.quadraticCurveTo(mx, my, C[0], C[1] - C[2]); g.stroke(); g.restore(); }
  if (R.done && R.doneAt != null && A && C) {   // ✨ done: a soft 4-point star pops between them, then twinkles small
    const u = (t - R.doneAt) / 0.7; if (u >= 0 && u < 3) { const k = A[3], sx = (A[0] + C[0]) / 2, sy = (A[1] + C[1]) / 2 - 4 * k, s = u < 1 ? (u < 0.15 ? u / 0.15 * 1.2 : 1.2 - 0.5 * (u - 0.15) / 0.85) : 0.7 + 0.08 * Math.sin(t * 6);
      g.save(); g.globalAlpha = u < 2 ? 1 : 3 - u; g.translate(sx, sy); g.rotate(u < 1 ? u * 0.8 : 0.8); g.beginPath(); for (let i = 0; i < 8; i++) { const rr = (i % 2 ? 2.2 : 8) * s * k, a = i * Math.PI / 4; i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(rr, 0); }
      g.closePath(); g.fillStyle = u < 0.12 ? '#FFFFFF' : '#FFE27A'; g.fill(); g.lineWidth = 1 * k; g.strokeStyle = day ? '#B8860B' : '#FFFFFF'; g.stroke(); g.restore(); } }
  return R;
}

// ======================= 🧊 mo-13 on the box turn: the same prop rigs on a TURNED body (MotionTurn ≥ mo-13) =======================
// The physics stays in the side plane (forward / up — where the cloth really trails), the picture is bent in 3D: each row of the back piece moves by the bone's
// swing (Δ forward, Δ up) turned by the chest yaw → on screen dx = Δfwd · sin(yaw) (÷ the back squeeze), dy = Δup + Δfwd · cos(yaw) · pitch.
// ↘ ↙ the cape flares out BEHIND (screen side away from the facing) · ↗ ↖ it swings toward us, over the back · a flat front = no sideways move (the swing is pure depth).
// Who swings: Motion.swingOf(av) → a PROP_RIGS name or null (🧳 AvatarWear says it per piece; default: capes / cloaks / fern capes on the back). The page wear paints its
// REST shape while MotionTurn paints the parts (Motion.TURN.painting), so nothing swings twice.
let SWING_OF = av => { const b = av && av.cw && av.cw.back; if (!b || !b.wr || !window.AvatarWear || !AvatarWear.look) return null; try { const L = AvatarWear.look(b.wr), s2 = JSON.stringify(L && (L.back || L)), m = s2 && s2.match(/"kind":"([a-z]+)"/); return m && {cape: 1, fern: 1, cloak: 1}[m[1]] ? 'cape' : null; } catch (e) { return null; } };
function turnBack(c0, X) {
  const rig = SWING_OF(X.av); if (!rig || !c0) return null; const R = PROP_RIGS[rig]; if (!R || R.hook !== 'back') return null; const TL = M.TURN && M.TURN.layer; if (!TL) return null;
  const S = wearSwing({P: X.P0, O: X.opts || {}, D: X.dir}, 'back', rig); X.swing = S;
  // the cape strip = AvatarKit's own ¾ picture of it (the FRONT picture's back part: behind the body, trailing to the back) — placed in 3D: each row at its depth behind the back
  // (rest + the bone's swing) and turned by the chest yaw; the rest of the back items (a look's aura · glow) keep their own picture and never bend
  const bk = X.av.cw.back, capeA = Object.assign({}, X.a, {av: Object.assign({}, X.av, {cw: Object.assign({}, X.av.cw, {back: {td: bk.td, wr: bk.wr}})})}),
    restA = Object.assign({}, X.a, {av: Object.assign({}, X.av, {cw: Object.assign({}, X.av.cw, {back: Object.assign({}, bk, {wr: ''})})})});
  const cp = TL.paintPart(capeA, X.P, X.k, {back: 1}, {t: X.t, who: {dir: -1}}), rs = TL.paintPart(restA, X.P, X.k, {back: 1}, X.chestBack ? {t: X.t, back: true, who: {dir: 1}} : {t: X.t, who: {dir: -1}});
  const c = X.chestBack ? cp : TL.tint(cp, 0.84);   // seen from the front, the swinging cape shows its lining (darker)
  const outC = TL.scratch(c.width, c.height), oq = outC.getContext('2d');   // pooled (freed with the frame) oq.drawImage(rs, 0, 0);
  const C = bendOf(S), B = S.bones, n = 48, k = X.k;   // swung point along the chain (standing units, side plane: +x = forward)
  const pts = [], rest = []; let b = B[0].slice(), us = 0; pts.push(b.slice()); rest.push(C.spine(0));
  for (let i = 1; i <= n; i++) { const u = C.len * i / n, sA = C.spine(us), sB = C.spine(u), tt = C.th((us + u) / 2), co = Math.cos(tt), si = Math.sin(tt);
    b = [b[0] + (sB[0] - sA[0]) * co - (sB[1] - sA[1]) * si, b[1] + (sB[0] - sA[0]) * si + (sB[1] - sA[1]) * co]; us = u; pts.push(b.slice()); rest.push(C.spine(u)); }
  const m = S.m || [1, 0, 0, 1, 0, 0], ap2 = q => [m[0] * q[0] + m[2] * q[1] + m[4], m[1] * q[0] + m[3] * q[1] + m[5]];
  const R0 = rest.map(ap2), P1 = pts.map(ap2), y0 = R0[0][1], yN = R0[n][1];
  // a row at height yy → [rest x (forward), swung x, Δup]
  const at2 = yy => { if (yy <= y0) return [R0[0][0], R0[0][0], 0]; let i = 1; while (i < n && R0[i][1] < yy) i++; const A0 = R0[i - 1], A1 = R0[i], q = cl((yy - A0[1]) / ((A1[1] - A0[1]) || 1e-6), 0, 1);
    let xr = A0[0] + (A1[0] - A0[0]) * q, xs = P1[i - 1][0] + (P1[i][0] - P1[i - 1][0]) * q, dy = (P1[i - 1][1] - A0[1]) * (1 - q) + (P1[i][1] - A1[1]) * q;
    if (yy > yN) { const o2 = yy - yN, er = Math.atan2(R0[n][1] - R0[n - 1][1], R0[n][0] - R0[n - 1][0]), es = Math.atan2(P1[n][1] - P1[n - 1][1], P1[n][0] - P1[n - 1][0]);
      xr = R0[n][0] + Math.cos(er) * o2 / Math.max(0.2, Math.sin(er)); xs = P1[n][0] + Math.cos(es) * o2 / Math.max(0.2, Math.sin(es)); dy = P1[n][1] + Math.sin(es) * o2 / Math.max(0.2, Math.sin(es)) - yy; }
    return [xr, xs, dy]; };
  // canvas (front picture, mirrored): the strip sits at x = −xr · k · bs (bs = the pose's own squeeze 1). Turned target: x = (fwd · sin(chest) + 7 · sin(chest)) / squeeze
  // (MotionTurn puts the back items at −7 · sin(chest), squeezed by |cos|) · the depth toward us lowers it a little under the map camera
  const ch = X.T.chest, sq = Math.max(0.3, Math.abs(Math.cos(ch))), sC = Math.sin(ch), fz = Math.cos(ch) * X.sp;
  const o = TL.scratch(c.width, c.height), q = o.getContext('2d'), band = Math.max(1, Math.round(1.2 * k)), oy = X.oy;
  for (let y = 0; y < c.height; y += band) { const yy = (y + band / 2 - oy) / k, A = at2(yy), cur = -A[0], tgt = (A[1] * sC + 7 * sC) / sq, dx = (tgt - cur) * k, dy = (A[2] + (A[1] - A[0]) * fz) * k;
    q.drawImage(c, 0, y, c.width, band + 1, dx, y + dy, c.width, band + 1); }
  oq.drawImage(o, 0, 0); return outC;
}
if (M.TURN && M.TURN.HOOKS) M.turnBack = turnBack;
Object.assign(M, {swingOf: f => { if (typeof f === 'function') SWING_OF = f; return SWING_OF; }});
Object.assign(M, {wearSwing, paintSwing, drawSwingRig, SWING, PROP_RIGS, breatheWith, breathePose, drawBreathe, WEAR13: {VERSION: 'mo-13', frameW, hookWorld, history, bendOf}});
})();
