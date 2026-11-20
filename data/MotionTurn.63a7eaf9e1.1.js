
/* ================= 🧊 MotionTurn (mo-14, 🎬 Motion chat, 2026-11-20) — the BODY TURNS AS BOXES: a true turn from a flat front + the 4 main 2.5D views =================
   Rules: `Motion rules.md` §38 (study) · §39 (look test, Aowu 15:18 · 15:26 · 15:33 · 15:47 · 15:52 · 16:02 "ok go") · §40 (build plan, Aowu 16:13 "go") · §41 (as built) · Motion Bible M13 · M14 · M15 · R1–R4.
   BORN SPLIT: its own file MotionTurn.html, loads with AvatarKit right after MotionFX2 (Code.gs INCLUDE_ALSO_). Needs AvatarKit's inert part switches (patch_mo14_kit.py:
   drawAvatar opts.parts + drawHead AK.headMode + AK.draw0). Without a turn field NOTHING changes: every drawAvatar call goes straight through (pixel-identical, motion.test part 16).

   📐 The base (Aowu 15:26): a FLAT FRONT — both shoulders, the right / main side on the screen-LEFT like a real person facing you.
      yaw + = the body turns to look RIGHT (R comes near, L goes behind) · yaw − = looks LEFT (the true opposite, no mirror) · dir −1 = the yaws negated.
   🧭 4 MAIN views for 2.5D (Aowu 15:33) = the IsoKit diamond: ↘ SE 45° · ↙ SW −45° · ↗ NE 135° · ↖ NW −135°. 0° / 90° / 180° are only IN-BETWEEN frames (turning).

   ⭐ pose fields (any drawAvatar / Acting pose):  hipYaw · chestYaw · headYaw (radians) · pitch (map camera 0 … 0.6) · feet3 {R: [lat, fwd, up], L: [lat, fwd, up]} · stride (false = no 3D stride on a walk) · hold3 (a held thing in 3D)
        hold3 = {hand: [lat, y, fwd], rest: [lat, y, fwd], hands: {R: grip units, L: grip units}, v, len, face, pole: {R: [x, y, z]}, layer, cut}  (or {g, d} = grip point + blade direction)
   🚶 a turned WALK (who.walkT) steps along the facing direction by itself: feet toward / away from the camera on the floor, the swinging foot lifts, hips + shoulders counter-turn
   ⭐ Acting.draw(g, who, x, y, k, f, {view: 'SE', turn: true})   the view keys of Motion.view8 as TRUE turns (E / S → ↘ · W → ↙ · N → ↗ / ↖ by dir)
   ⭐ Motion.TURN_VIEWS  {SE, SW, NE, NW, E, W, S, N} → yaw (dir decides the side)  ·  Motion.turnView(key, dir) → {hipYaw, chestYaw, headYaw}
   ⭐ Motion.turnTo(from, to, {t0, ms})  → T.at(t) = {hipYaw, chestYaw, headYaw, done} — the in-between frames: the HEAD leads, the chest follows, the hips come last
        (90° ≈ 320 ms: head 0–120 · chest 60–240 · hips 120–320, a small overshoot + settle). from / to = a view key or a yaw.
   ⭐ Motion.turnWarm(who, k)  pre-bakes the 4 main views in idle time (one bake a frame)  ·  Motion.turnCache() → {n, bytes, cap, hits, misses}  ·  Motion.turnClear()
   ⭐ Motion.turnOf(P) → {hip, chest, head, pitch} or null  ·  Motion.turnPts(P) → the turned joints (shoulders · hips · head, avatar units + depth z)
   ⭐ Motion.drawTurned(g, a, sx, sy, k, opts) → {J, W}  (drawAvatar routes here by itself when the pose has a turn field)

   How it draws (one centre line, 3 boxes, 3 layers):
     ① AvatarKit paints its OWN parts flat (AK.draw0 + opts.parts): torso · head shell · face · hair back · back items · each arm · legs — every look / outfit / wear / face works
     ② 🗄️ BAKED once per look × yaw (5° steps) × size: the torso on an oval cylinder (each ROW its own yaw: hips → chest = the twist crease, the back picture past 90°),
        the hair round the head ball, the head shell (round outline kept) + the face decal sliding round it (the face is keyed by its own pixels, so blinks / moods stay live)
     ③ LIVE every frame (vector, cheap): arms by a REAL 3D reach (elbow down + back, a reach toward us is SHORT) · legs + feet3 round the turned hips · the held thing · walk · bend
     🗂️ layers (Aowu 15:52): ① the far arm (darker by depth) · ② body + head + legs · ③ the near arm — a held thing lives with ITS hand (2 hands = the near hand's layer)
     🎚️ shading = a cached darker copy (source-atop), never ctx.filter (iPad Safari). Pooled scratch canvases (no new canvas per frame). LRU cache 24 MB phones · 48 MB desktop.
   Known this round: head / body wear pieces stay flat on the turned parts (they paint INSIDE the parts, so they ride along); a wear painter may read P.chestYaw / P.headYaw.
     The mo-8 item aura is not drawn on a turned held thing yet (mo-13 carry). Crouch / lie stances draw today's picture.
   ========================================================================================= */
(function () {
'use strict';
const M = window.Motion; if (!M || M.TURN) return;
const PI = Math.PI, cl = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, q) => a + (b - a) * q, sstep = (a, b, x) => { const u = cl((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const wrapA = a => { a = (a + PI) % (2 * PI); if (a < 0) a += 2 * PI; return a - PI; };
const FACE0 = 0.2;   // today's face already looks ≈ 11° toward the facing side (eyes at −2 · 5, mouth at 3)
const BOX = {W: 100, H: 120, OY: 108};   // a layer in avatar units: origin (feet) at (W/2, OY) — tight: every blit of a live layer costs its area
const ok0 = () => !!(window.AK && AK.draw0);
let BIG = 1;   // a big look (L.big): AvatarKit scales k itself, the layers here are sized by the scaled k

// ---------- 🧺 pooled scratch canvases (live layers: no new canvas per frame) ----------
const POOL = new Map(); let used = [];
function scratch(w, h) {
  const key = w + 'x' + h; let L = POOL.get(key); if (!L) POOL.set(key, L = []);
  let c = L.find(x => !x._busy); if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; L.push(c); }
  c._busy = true; used.push(c); const q = c.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.globalAlpha = 1; q.globalCompositeOperation = 'source-over'; q.clearRect(0, 0, w, h); return c;
}
function freeAll() { used.forEach(c => { c._busy = false; }); used = []; }
const layerWH = k => [Math.ceil(BOX.W * k), Math.ceil(BOX.H * k)];
const layer = k => { const s = layerWH(k); return scratch(s[0], s[1]); };
const own = k => { const s = layerWH(k), c = document.createElement('canvas'); c.width = s[0]; c.height = s[1]; return c; };   // a canvas that is KEPT (cache)
// 🎚️ a darker copy (= brightness(f), but plain canvas: iPad Safari has no ctx.filter)
function tint(c, f) {
  if (!c || f >= 0.999) return c; const o = scratch(c.width, c.height), q = o.getContext('2d'); q.drawImage(c, 0, 0);
  q.globalCompositeOperation = 'source-atop'; q.fillStyle = 'rgba(0,0,0,' + (1 - f).toFixed(3) + ')'; q.fillRect(0, 0, o.width, o.height); q.globalCompositeOperation = 'source-over'; return o;
}

// ---------- 1. AvatarKit drawn in PARTS (its own code behind the inert switches) ----------
const ALL0 = {shadow: 0, ride: 0, back: 0, legs: 0, hairback: 0, armL: 0, body: 0, off: 0, head: 0, armR: 0, fx: 0};
const FLAT = {dy: 0, rot: 0, rotFull: 0, bend: 0, sx: 1, sy: 1, hipYaw: 0, chestYaw: 0, headYaw: 0, pitch: 0, yaw: 0, slide: 0, shift: 0, feet3: null, hold3: null};
function paintPart(a, P, k, parts, o, keep) {
  o = o || {}; const c = keep ? own(k) : layer(k), q = c.getContext('2d'), ox = BOX.W / 2 * k, oy = BOX.OY * k;
  const pose = Object.assign({}, P, FLAT, o.pose || {});
  if (o.back) pose.back = 1; else delete pose.back;
  const who = Object.assign({}, a, {dir: 1, walkT: 0, jumpH: 0, land: 0, gest: null, stance: null, fromBack: !!o.back}, o.who || {});
  const head = window.AK && AK.head;
  if (o.clip) { q.save(); q.translate(ox, oy); q.beginPath(); o.clip(q, k); q.setTransform(1, 0, 0, 1, 0, 0); q.clip(); }
  AK.draw0(q, who, ox, oy, k / BIG, {pose, still: true, t: o.t != null ? o.t : 1, parts: Object.assign({}, ALL0, parts)});
  if (o.clip) q.restore();
  if (window.AK) AK.head = head;   // the head marker stays where the REAL head is
  return c;
}

// ---------- 2. the turn ----------
function turnOf(P) {
  if (!P) return null; const h = +P.hipYaw || 0, c = +P.chestYaw || 0, d = +P.headYaw || 0, p = cl(+P.pitch || 0, 0, 0.6);
  if (!h && !c && !d && !p) return null; return {hip: h, chest: c, head: d, pitch: p};
}
// a body point (lateral x, height y, depth z: + = toward the camera at yaw 0) turned by yaw → [screen x, y, depth]
const rotY = (x, z, a) => [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
const LAT = {R: -1, L: 1};   // lat: R = −, L = + (the main side on the screen-left) · fwd = in front of the body
const bodyPt = (lat, y, fwd, a, sp) => { const r = rotY(lat, fwd, a); return {x: r[0], y: y + r[1] * sp, z: r[1]}; };
function turnPts(P) {
  const T = turnOf(P) || {hip: 0, chest: 0, head: 0, pitch: 0}, sp = Math.sin(T.pitch);
  // depth z → screen: with the map camera (pitch) a far point (z < 0) rides HIGHER, a near one lower
  return {T, sp, sR: bodyPt(-10, -42, 0, T.chest, sp), sL: bodyPt(10, -42, 0, T.chest, sp), hR: bodyPt(-5, -20, 0, T.hip, sp), hL: bodyPt(5, -20, 0, T.hip, sp), head: {x: 0, y: -60, z: 0},
    pt: (lat, y, fwd) => bodyPt(lat, y, fwd, T.chest, sp)};
}
// 🧭 views (dir decides the side: SW = SE with dir −1 → −45°)
const TURN_VIEWS = Object.freeze({SE: PI / 4, E: PI / 4, S: PI / 4, SW: PI / 4, W: PI / 4, NE: 3 * PI / 4, N: 3 * PI / 4, NW: 3 * PI / 4});
function turnView(key, dir) { const y = TURN_VIEWS[key]; if (y == null) return null; const s = (dir || 1) < 0 ? -1 : 1; return {hipYaw: y * s, chestYaw: y * s, headYaw: y * s}; }
// 🔄 in-between frames: the head leads, the chest follows, the hips come last (Motion Bible M1 beats · M23 uneven timing · R4: the head never turns more than 55° past the chest)
const backOut = q => { const s = 1.4; q -= 1; return q * q * ((s + 1) * q + s) + 1; }, inOut = q => q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2, outC = q => 1 - Math.pow(1 - q, 3);
function turnTo(from, to, o) {
  o = o || {}; const yv = v => typeof v === 'number' ? v : (TURN_VIEWS[v] != null ? TURN_VIEWS[v] * (o.dir && o.dir < 0 ? -1 : 1) : 0);
  const a = yv(from), b = yv(to), d = b - a, ms = o.ms || cl(320 * Math.abs(d) / (PI / 2), 160, 560), t0 = o.t0 || 0;
  const seg = (t, s, e) => cl((t - s) / (e - s), 0, 1);
  return {from: a, to: b, ms, at(t) { const u = (t - t0) * 1000 / ms;
    const hd = backOut(seg(u, 0, 0.45)), ch = inOut(seg(u, 0.15, 0.75)), hp = outC(seg(u, 0.375, 1)), cy = a + d * ch, NK = 0.96;   // the neck turns ≤ 55° past the chest (R4)
    return {headYaw: cl(a + d * hd, cy - NK, cy + NK), chestYaw: cy, hipYaw: a + d * hp, done: u >= 1}; }};
}

// ---------- 3. 🗄️ the bake cache (torso · hair · head per look × yaw × size; LRU by bytes) ----------
const phone = () => { try { return (navigator.maxTouchPoints || 0) > 0 && Math.min(screen.width, screen.height) < 900; } catch (e) { return false; } };
const CACHE = new Map(), ST = {bytes: 0, hits: 0, misses: 0, cap: 0};
const capB = () => ST.cap || (ST.cap = (phone() ? 24 : 48) * 1024 * 1024);
function cGet(key) { const e = CACHE.get(key); if (e) { CACHE.delete(key); CACHE.set(key, e); ST.hits++; } else ST.misses++; return e || null; }
function cPut(key, e) { if (CACHE.has(key)) { ST.bytes -= CACHE.get(key).bytes; CACHE.delete(key); } CACHE.set(key, e); ST.bytes += e.bytes;
  while (ST.bytes > capB() && CACHE.size > 1) { const k0 = CACHE.keys().next().value; ST.bytes -= CACHE.get(k0).bytes; CACHE.delete(k0); } return e; }
// crop a baked canvas to what it really holds → {c, x, y, bytes} (a turned avatar is mostly empty space)
function crop(c) {
  const w = c.width, h = c.height, D = c.getContext('2d').getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) { const o = y * w * 4; for (let x = 0; x < w; x++) if (D[o + x * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  if (x1 < 0) return {c: null, x: 0, y: 0, bytes: 64};
  const o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1; o.getContext('2d').drawImage(c, -x0, -y0); return {c: o, x: x0, y: y0, bytes: o.width * o.height * 4 + 64};
}
const q5 = v => Math.round(v / (PI / 36));   // 5° steps
const LOOKK = new WeakMap();
const lookKey = av => { if (av && typeof av === 'object') { let s = LOOKK.get(av); if (!s) { s = JSON.stringify(av); LOOKK.set(av, s); } return s; } return String(av); };
const TORSO_F = ['float', 'hoop', 'twist', 'shrugL', 'shrugR', 'breath'], HEAD_F = ['neckTilt', 'neckTurn', 'nod', 'headSc', 'float', 'shrugL', 'shrugR'];
const fk = (P, F) => F.map(f => P[f] == null ? '' : typeof P[f] === 'number' ? Math.round(P[f] * 50) : String(P[f])).join(',');
// the face decal: keyed by its own pixels (blinks · moods · talk stay live, each distinct face is baked once)
let FH = null;   // ONE small read-back canvas (reading a pooled layer back would slow every later blit of it)
function faceHash(c, k) {
  const x = Math.max(0, Math.floor((BOX.W / 2 - 17) * k)), y = Math.max(0, Math.floor((BOX.OY - 78) * k)), w = Math.ceil(34 * k), h = Math.ceil(36 * k);
  if (!FH || FH.width !== w || FH.height !== h) { FH = document.createElement('canvas'); FH.width = w; FH.height = h; FH.q = FH.getContext('2d', {willReadFrequently: true}); }
  FH.q.clearRect(0, 0, w, h); FH.q.drawImage(c, -x, -y); const D = FH.q.getImageData(0, 0, w, h).data; let hs = 2166136261 >>> 0; for (let i = 0; i < D.length; i += 2) { hs ^= D[i]; hs = Math.imul(hs, 16777619) >>> 0; } return hs.toString(36);
}
// ---------- 4. the warps (per pixel — run only on a cache miss) ----------
// src front (seen at yaw 0) + back (seen at yaw π) → dst, each row r turned by yawRow(r) round the vertical axis x = 0; depth = width × dRatio
function rowExt(D, w, h) { const e = new Float32Array(h); for (let y = 0; y < h; y++) { let m = 0; const o = y * w * 4; for (let x = 0; x < w; x++) if (D[o + x * 4 + 3] > 8) { const d = Math.abs(x + 0.5 - w / 2); if (d > m) m = d; } e[y] = m; } return e; }
function cylTurn(front, back, yawRow, dRatio, o) {
  o = o || {}; const w = front.width, h = front.height, F = front.getContext('2d').getImageData(0, 0, w, h).data, B = back ? back.getContext('2d').getImageData(0, 0, w, h).data : null;
  const eF = rowExt(F, w, h), eB = B ? rowExt(B, w, h) : null, out = document.createElement('canvas'); out.width = w; out.height = h;
  const oc = out.getContext('2d'), img = oc.createImageData(w, h), Dd = img.data, cx = w / 2, sm = o.smooth || 0;
  // smooth the row widths a little (a wavy silhouette → a steady cylinder)
  // row widths: max of both pictures → a max filter (± sm px) → a box blur, so the cylinder is smooth (no stripes from a wavy outline)
  const e0 = new Float32Array(h), e1 = new Float32Array(h), ext = new Float32Array(h); for (let y = 0; y < h; y++) e0[y] = Math.max(eF[y], eB ? eB[y] : 0);
  for (let y = 0; y < h; y++) { let m = e0[y]; for (let j = -sm; j <= sm; j++) { const yy = y + j; if (yy >= 0 && yy < h && e0[yy] > m) m = e0[yy]; } e1[y] = m; }
  const bl = Math.max(1, Math.round(sm * 0.7)); for (let y = 0; y < h; y++) { if (!e0[y]) continue; let s2 = 0, n = 0; for (let j = -bl; j <= bl; j++) { const yy = y + j; if (yy >= 0 && yy < h) { s2 += e1[yy]; n++; } } ext[y] = Math.max(e0[y], s2 / n); }
  const samp = (S, sx, y) => { const x0 = Math.floor(sx), f = sx - x0, i0 = (y * w + x0) * 4, ok0 = x0 >= 0 && x0 < w, ok1 = x0 + 1 >= 0 && x0 + 1 < w;
    const r = [0, 0, 0, 0]; for (let c = 0; c < 4; c++) { const a = ok0 ? S[i0 + c] : 0, b = ok1 ? S[i0 + 4 + c] : 0; r[c] = a * (1 - f) + b * f; } return r; };
  for (let y = 0; y < h; y++) {
    const A = ext[y]; if (A < 0.5) continue; const th = yawRow(y), Bz = A * dRatio, ct = Math.cos(th), st = Math.sin(th), R = Math.hypot(A * ct, Bz * st), ph = Math.atan2(Bz * st, A * ct);
    for (let x = 0; x < w; x++) {
      const xs = x + 0.5 - cx; if (Math.abs(xs) > R) continue; const s = Math.asin(cl(xs / R, -1, 1));
      let v1 = s - ph, v2 = PI - s - ph; const z1 = -A * Math.sin(v1) * st + Bz * Math.cos(v1) * ct, z2 = -A * Math.sin(v2) * st + Bz * Math.cos(v2) * ct;
      let v = wrapA(z1 >= z2 ? v1 : v2); const front = Math.abs(v) <= PI / 2;
      let S = front ? F : B, sx = (front ? A * Math.sin(v) : -A * Math.sin(v)) + cx - 0.5; if (!S) { S = F; sx = A * Math.sin(v) * -1 + cx - 0.5; }
      const p = samp(S, sx, y); if (p[3] < 1) continue;
      const c0 = Math.abs(Math.cos(v)), c1 = Math.cos(v + th), lit = o.flat ? 1 : (0.8 + 0.2 * cl(c1, -1, 1)) / (0.8 + 0.2 * c0), sh = Math.min(1.08, lit);
      const i = (y * w + x) * 4; Dd[i] = cl(p[0] / Math.max(1, p[3]) * 255 * sh, 0, 255); Dd[i + 1] = cl(p[1] / Math.max(1, p[3]) * 255 * sh, 0, 255); Dd[i + 2] = cl(p[2] / Math.max(1, p[3]) * 255 * sh, 0, 255); Dd[i + 3] = p[3];
    }
  }
  oc.putImageData(img, 0, 0); return out;
}

// 🧊 the HEAD turns as a ball (forward splat + depth test): a pixel inside the skull circle sits on the sphere (front picture: front half · back picture: back half),
// a pixel outside it (buns · brims · puffs · a ponytail) sits at its own side (z = zOut) — so in a profile the near bun comes over the middle, the far one hides
function ballTurn(srcs, cx, cy, R, th, o) {
  o = o || {}; const w = srcs[0].c.width, h = srcs[0].c.height, out = document.createElement('canvas'); out.width = w; out.height = h;
  const oc = out.getContext('2d'), img = oc.createImageData(w, h), Dd = img.data, Z = new Float32Array(w * h).fill(-1e9), ct = Math.cos(th), st = Math.sin(th);
  srcs.forEach(S => { const D = S.c.getContext('2d').getImageData(0, 0, w, h).data, back = S.side === 'back', hairB = S.side === 'behind';
    for (let y = 0; y < h; y++) { const dy = y + 0.5 - cy, rho = R * R > dy * dy ? Math.sqrt(R * R - dy * dy) : 0;
      for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, al = D[i + 3]; if (al < 2) continue; let X = x + 0.5 - cx, z, n0 = 0;
        if (back) X = -X;
        const Rc = R * 1.2, rc = Rc * Rc > dy * dy ? Math.sqrt(Rc * Rc - dy * dy) : 0;
        if (Math.abs(X) < rho - 0.6) { z = Math.sqrt(rho * rho - X * X); if (back || hairB) z = -z; n0 = Math.abs(z) / R; }   // the skull ball
        else if (hairB) z = -(o.zOut || R * 0.5);
        else if (Math.abs(X) < rc - 0.6) { z = Math.sqrt(rc * rc - X * X) * 0.92; if (back) z = -z; }   // hair volume (fringe · cap) on a slightly bigger ball
        else z = 0;   // beyond (buns · brims · puffs): flat at its own side
        const X2 = X * ct + z * st, z2 = -X * st + z * ct, dd = Math.abs(ct + (Math.abs(z) > 0.5 ? (-X / z) * st : 0)), sw = Math.max(1, Math.min(6, Math.ceil(dd + 0.5)));
        const lit = n0 ? Math.min(1.06, (0.82 + 0.18 * cl(z2 / R, -1, 1)) / (0.82 + 0.18 * n0)) : 1, px = Math.round(X2 + cx - 0.5 - (sw - 1) / 2);
        for (let q = 0; q < sw; q++) { const xx = px + q; if (xx < 0 || xx >= w) continue; const j = y * w + xx; if (al < 140) { if (Z[j] > -1e8) continue; Z[j] = -1e7; } else { if (z2 + (S.bias || 0) <= Z[j]) continue; Z[j] = z2 + (S.bias || 0); }
          Dd[j * 4] = cl(D[i] * lit, 0, 255); Dd[j * 4 + 1] = cl(D[i + 1] * lit, 0, 255); Dd[j * 4 + 2] = cl(D[i + 2] * lit, 0, 255); Dd[j * 4 + 3] = al; } } } });
  oc.putImageData(img, 0, 0); return out;
}

// 🧊 the head: ONE ball — the visible point at screen x belongs to the front half when |asin(x / ρ) − yaw| ≤ 90° (else the back picture);
// the shells are NOT warped (a round head keeps its outline, so no seams) · the face decal slides round the ball and hides past the side
function headTurn(shF, shB, face, cx, cy, R, th, slide) {   // slide: the front shell's INSIDE (a hood's face window, a visor) slides round the ball with the face; the round outline stays
  const w = shF.width, h = shF.height, gF = shF.getContext('2d').getImageData(0, 0, w, h).data, gB = shB ? shB.getContext('2d').getImageData(0, 0, w, h).data : gF;
  const fw = ballTurn([{c: face, side: 'front'}], cx, cy, R, th), FW = fw.getContext('2d').getImageData(0, 0, w, h).data;
  const out = document.createElement('canvas'); out.width = w; out.height = h; const oc = out.getContext('2d'), img = oc.createImageData(w, h), D = img.data;
  const st = Math.sin(th), ct = Math.cos(th);
  for (let y = 0; y < h; y++) { const dy = y + 0.5 - cy, rho = R * R > dy * dy ? Math.sqrt(R * R - dy * dy) : 0;
    for (let x = 0; x < w; x++) { const X = x + 0.5 - cx, i = (y * w + x) * 4;
      let lon = rho > 0 && Math.abs(X) < rho ? Math.asin(X / rho) : X >= 0 ? PI / 2 : -PI / 2, front = Math.abs(wrapA(lon - th)) <= PI / 2;
      const S = front ? gF : gB;
      // soft seam: 1.5 px blend across the meridian
      let r = S[i], g2 = S[i + 1], b = S[i + 2], a = S[i + 3];
      if (slide && front && rho > 0 && Math.abs(X) < rho - 0.5) { const sx0 = rho * Math.sin(wrapA(lon - th)) + cx - 0.5, x0 = Math.floor(sx0), f = sx0 - x0, j0 = (y * w + cl(x0, 0, w - 1)) * 4, j1 = (y * w + cl(x0 + 1, 0, w - 1)) * 4;
        const a0 = S[j0 + 3] * (1 - f), a1 = S[j1 + 3] * f; a = a0 + a1; if (a > 0) { r = (S[j0] * a0 + S[j1] * a1) / a; g2 = (S[j0 + 1] * a0 + S[j1 + 1] * a1) / a; b = (S[j0 + 2] * a0 + S[j1 + 2] * a1) / a; } }
      if (front && rho > 0 && Math.abs(X) < rho) { const lit = (0.84 + 0.16 * Math.cos(lon)) / (0.84 + 0.16 * Math.cos(wrapA(lon - th))); r *= lit; g2 *= lit; b *= lit; }
      if (front && FW[i + 3] > 0 && Math.abs(X) < rho) { const fa = FW[i + 3] / 255; r = r * (1 - fa) + FW[i] * fa; g2 = g2 * (1 - fa) + FW[i + 1] * fa; b = b * (1 - fa) + FW[i + 2] * fa; a = Math.max(a, FW[i + 3]); }
      D[i] = cl(r, 0, 255); D[i + 1] = cl(g2, 0, 255); D[i + 2] = cl(b, 0, 255); D[i + 3] = a; } }
  oc.putImageData(img, 0, 0); return out;
}
// NOTE premultiplied rgb in canvas ImageData gets un-premultiplied on put → we keep the premultiplied data in plain arrays instead
function pmCanvas(c) { const q = c.getContext('2d'), d = q.getImageData(0, 0, c.width, c.height); const D = d.data; for (let i = 0; i < D.length; i += 4) { const a = D[i + 3] / 255; D[i] = D[i] * a; D[i + 1] = D[i + 1] * a; D[i + 2] = D[i + 2] * a; } return {width: c.width, height: c.height, getContext: () => ({getImageData: () => ({data: D})})}; }

// ---------- 5. helpers: masks · 2-bone reach · the weapon held in 3D ----------
function capPath(q, k, pts, r) {   // a round capsule round the polyline pts (r units) as a PATH (for a clip) — outline of the stroke
  // every sub-shape winds the SAME way as arc() (nonzero rule: opposite windings would cut holes where they overlap)
  for (let i = 0; i + 1 < pts.length; i++) { const A = pts[i], B = pts[i + 1], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * r, ny = dx / L * r;
    let Q = [[A[0] + nx, A[1] + ny], [B[0] + nx, B[1] + ny], [B[0] - nx, B[1] - ny], [A[0] - nx, A[1] - ny]]; let ar = 0; for (let j = 0; j < 4; j++) { const p = Q[j], n = Q[(j + 1) % 4]; ar += p[0] * n[1] - n[0] * p[1]; }
    if (ar < 0) Q = Q.reverse(); q.moveTo(Q[0][0] * k, Q[0][1] * k); for (let j = 1; j < 4; j++) q.lineTo(Q[j][0] * k, Q[j][1] * k); q.closePath(); }
  pts.forEach(p => { q.moveTo((p[0] + r) * k, p[1] * k); q.arc(p[0] * k, p[1] * k, r * k, 0, 7); });
}
function capsule(c, k, pts, r, ends) {   // keep only what lies within r units of the polyline pts (+ circles at ends [[x, y, r]]) — body units, origin = the layer origin
  const m = scratch(c.width, c.height), q = m.getContext('2d'), ox = BOX.W / 2 * k, oy = BOX.OY * k;
  q.translate(ox, oy); q.strokeStyle = '#000'; q.fillStyle = '#000'; q.lineCap = 'round'; q.lineJoin = 'round'; q.lineWidth = 2 * r * k;
  q.beginPath(); pts.forEach((p, i) => i ? q.lineTo(p[0] * k, p[1] * k) : q.moveTo(p[0] * k, p[1] * k)); q.stroke();
  (ends || []).forEach(([x, y, rr]) => { q.beginPath(); q.arc(x * k, y * k, rr * k, 0, 7); q.fill(); });
  q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-in'; q.drawImage(c, 0, 0); return m;
}
const end = (x, y, a, l) => [x - Math.sin(a) * l, y + Math.cos(a) * l];
// 2-bone reach from S to T (arm 16 = 8 + 8) → AKJ angles {a1 (upper), a2 (lower)} · pick 'down' | 'up' | 'out' (elbow away from x = 0)
function reach(S, T, len, pick) {
  const h = len / 2, dx = T[0] - S[0], dy = T[1] - S[1], d = Math.hypot(dx, dy), base = Math.atan2(-dx, dy);
  if (d >= len - 0.01) return {a1: base, a2: base, j: end(S[0], S[1], base, h)};
  const off = Math.acos(cl(d / len, -1, 1)), sol = [1, -1].map(sg => { const a1 = base - off * sg, j = end(S[0], S[1], a1, h); return {a1, a2: Math.atan2(-(T[0] - j[0]), T[1] - j[1]), j}; });
  // 'back' (Aowu 15:47): an elbow NEVER points toward the facing side when the hand is in front — it hangs down + BACK (pole behind the body), else the arm reads as broken
  const sc = q => pick === 'up' ? -q.j[1] : pick === 'out' ? Math.abs(q.j[0]) : pick === 'back' ? -q.j[0] * (reach.face || 1) + q.j[1] * 0.25 : q.j[1]; return sc(sol[0]) >= sc(sol[1]) ? sol[0] : sol[1];
}
// a 2-bone arm from root to tgt (length len, 8 + 8 scaled) picking the elbow nearest ej (a projected 3D elbow) → AKJ angles {a1, a2, j}
function solve2(root, tgt, ej, len) { const h = len / 2, dx = tgt[0] - root[0], dy = tgt[1] - root[1], dd = Math.hypot(dx, dy), base = Math.atan2(-dx, dy);
  if (dd >= len - 0.01) return {a1: base, a2: base, j: end(root[0], root[1], base, h)}; const off = Math.acos(cl(dd / len, -1, 1));
  const sol = [1, -1].map(sg => { const a1 = base - off * sg, j = end(root[0], root[1], a1, h); return {a1, a2: Math.atan2(-(tgt[0] - j[0]), tgt[1] - j[1]), j}; });
  const di = q => Math.hypot(q.j[0] - ej[0], q.j[1] - ej[1]); return di(sol[0]) <= di(sol[1]) ? sol[0] : sol[1]; }
const asR = q => ({armR: -q.a1, elbowR: -(q.a2 - q.a1)}), asL = q => ({armL: q.a1, elbowL: q.a2 - q.a1});
const WBOX = new Map();
function wBox(v) {   // the drawn size of a weapon look (units of 1 at size 100): blade top above the guard
  let b = WBOX.get(v); if (b) return b; const AW = window.AvWeapons, S = 360, c = document.createElement('canvas'); c.width = S; c.height = S; const q = c.getContext('2d'); AW.draw(q, v, S / 2, S * 0.7, 100, {t: 0});
  const px = q.getImageData(0, 0, S, S).data; let y0 = S, y1 = 0; for (let j = 0; j < S; j += 2) for (let i = 0; i < S; i += 2) if (px[(j * S + i) * 4 + 3] > 20) { if (j < y0) y0 = j; if (j > y1) y1 = j; }
  b = {top: S * 0.7 - y0, bot: y1 - S * 0.7}; WBOX.set(v, b); return b;
}
const norm3 = d => { const L = Math.hypot(d[0], d[1], d[2]) || 1; return [d[0] / L, d[1] / L, d[2] / L]; };
// ---------- 6. 🧊 drawTurned ----------
function walkPose(a) { if (!(a.walkT > 0)) return {}; const w = Math.sin(a.walkT * 11); return {legL: w * 0.5, legR: -w * 0.5, armL: 0.15 - w * 0.4, armR: 0.15 + w * 0.4, dy: -Math.abs(Math.cos(a.walkT * 11)) * 3}; }
const headWarp = y => { const u = Math.abs(y), tri = u <= PI / 2 ? u / (PI / 2) : Math.max(0, (PI - u) / (PI / 2)); return y - FACE0 * tri; };
let RAW = null;   // the drawAvatar we wrapped (AvatarMotion's aura wrapper round AvatarKit's own)
function plain(g, a, sx, sy, k, opts) { return (RAW || AK.draw0)(g, a, sx, sy, k, opts); }
function drawTurned(g, a, sx, sy, k, opts) {
  opts = opts || {}; let P0 = opts.pose || {}; const T0 = turnOf(P0);
  if (!T0 || !ok0() || !a || !a.av || a.gest || a.stance === 'crouch' || a.stance === 'lie' || (a.av.eq && a.av.eq.ride)) return plain(g, a, sx, sy, k, opts);   // riding · gestures · low stances = today's picture
  try { return turned(g, a, sx, sy, k, opts, P0); } finally { freeAll(); BIG = 1; }
}
function turned(g, a, sx, sy, k, opts, P0) {
  const L0 = (avColors(fixAv(a.av)).look || {}); BIG = L0.big || 1; k *= BIG;
  if ((a.dir || 1) < 0) P0 = Object.assign({}, P0, {hipYaw: -(P0.hipYaw || 0), chestYaw: -(P0.chestYaw || 0), headYaw: -(P0.headYaw || 0)});   // facing left = the real turn the other way (not a mirror)
  let T = turnOf(P0) || {hip: 0, chest: 0, head: 0, pitch: 0}, t = opts.t != null ? opts.t : 1, av = a.av, P = Object.assign({armL: 0.15, armR: 0.15, legL: 0, legR: 0, dy: 0, rot: 0, sx: 1, sy: 1}, walkPose(a), P0);
  // 🚶 the 3D stride (Aowu 16:53–16:55): a turned walk steps ALONG the facing direction — the feet go toward / away from the camera on the floor
  // (the near foot lower on screen when it comes toward us), the swinging foot lifts, the hips turn with the leading leg and the shoulders against them,
  // the free arms swing in 3D along the facing, each opposite its own leg (Aowu 17:03: the girl's arms swung together). A pose with its own feet3, or {stride: false}, keeps its feet.
  if (a.walkT > 0 && !P0.feet3 && P0.stride !== false) { const p = a.walkT * 11, w = Math.sin(p), c = Math.cos(p), S = 7;
    P.feet3 = {R: [-5, -S * w, 2.4 * Math.max(0, -c)], L: [5, S * w, 2.4 * Math.max(0, c)]}; P.feetFloor = 0.5; P.dy = (P.dy || 0) + 1.5 * w * w;   // the hips sink a little at the widest step so both feet stay on the floor
    P._walk = w;
    P.hipYaw = (P.hipYaw || 0) - 0.1 * w; P.chestYaw = (P.chestYaw || 0) + 0.06 * w; T = turnOf(P) || T; }
  const J = turnPts(P), sp = J.sp, ox = BOX.W / 2 * k, oy = BOX.OY * k, AW = window.AvWeapons, FR = {who: {dir: -1}}, BK = {back: true, who: {dir: 1}};   // front pictures mirrored (R on the screen-left) · back pictures
  const H = P.hold3 && AW ? P.hold3 : null, hv = H ? (H.v != null ? H.v : av.eq && av.eq.hand && av.eq.hand.v) : null, HI = hv != null ? AW.info(hv) : null;
  const avNo = H ? Object.assign({}, av, {eq: Object.assign({}, av.eq, {hand: null})}) : av, aNo = Object.assign({}, a, {av: avNo});
  const sR = J.sR, sL = J.sL, rFar = sR.z < sL.z - 0.01;
  // arm layers: R = AvatarKit's front arm drawn mirrored (native root (10, −42) → screen (−10, −42)) · L far = AvatarKit's back arm mirrored · L near = the front arm unmirrored
  const dR = [sR.x + 10, sR.y + 42], dL = [sL.x - 10, sL.y + 42], PL = {armR: P.armL, elbowR: P.elbowL || 0, handR: P.handL, wristR: P.wristL};
  // 🙌 the weapon in 3D (chest frame: lat · y · fwd) → screen + both hands by a REAL 3D reach from the TURNED shoulders (the off hand stays locked on the grip)
  let W = null;
  if (HI) {
    const u = HI.type.size / 100;
    // 🗡️ a carry by 2 points (Aowu 15:41 refs): the hand on the grip + the spot the blade RESTS on (top of the shoulder by the neck) → the blade runs from the hand through the rest spot
    let D, G; if (H.rest && H.hand) { D = norm3([H.rest[0] - H.hand[0], H.rest[1] - H.hand[1], H.rest[2] - H.hand[2]]); const hs = (H.hands && H.hands.R) || 0; G = [H.hand[0] + D[0] * hs * u, H.hand[1] + D[1] * hs * u, H.hand[2] + D[2] * hs * u]; }
    else { D = norm3(H.d || [0, -1, 0]); G = H.g || [-6, -36, 6]; }
    // 🤝 both hands must REACH their spots on the grip: a grip out of reach (3D arm 8 + 8) pulls the whole weapon in toward that shoulder (the off hand stays locked on it)
    for (let it = 0; it < 3; it++) ['R', 'L'].forEach(sd => { const hs = H.hands && H.hands[sd]; if (hs == null) return; const S3 = [LAT[sd] * 10, -42, 0], B = [G[0] - D[0] * hs * u, G[1] - D[1] * hs * u, G[2] - D[2] * hs * u];
      const v = [B[0] - S3[0], B[1] - S3[1], B[2] - S3[2]], dd = Math.hypot(v[0], v[1], v[2]); if (dd > 15.8) { const f = (dd - 15.8) / dd; G = [G[0] - v[0] * f, G[1] - v[1] * f, G[2] - v[2] * f]; } });
    const pr = p => { const q = bodyPt(p[0], p[1], p[2], T.chest, sp); return [q.x, q.y, q.z]; };
    const grip = s2 => [G[0] - D[0] * s2 * u, G[1] - D[1] * s2 * u, G[2] - D[2] * s2 * u], Gs = pr(G), tipL = wBox(hv).top * u * (H.len || 1), Tp0 = pr([G[0] + D[0] * tipL, G[1] + D[1] * tipL, G[2] + D[2] * tipL]);
    // 2.5D cheat toward the camera (Aowu 15:21 notes): H.face 0…1 turns the BLADE's direction partly back to the screen plane so it never hides behind the big head
    const fc = H.face || 0, yT = Math.cos(T.chest) >= 0 ? 0 : (T.chest >= 0 ? PI : -PI), yW = T.chest + (yT - T.chest) * fc;
    const Tp = fc ? (() => { const q = bodyPt(D[0] * tipL, D[1] * tipL, D[2] * tipL, yW, sp), o = bodyPt(0, 0, 0, yW, sp); return [Gs[0] + q.x - o.x, Gs[1] + q.y - o.y, Gs[2] + q.z - o.z]; })() : Tp0;
    const dx = Tp[0] - Gs[0], dy = Tp[1] - Gs[1]; W = {Gs, Tz: Tp[2], f0: G[2], f1: G[2] + D[2] * tipL, z: (Gs[2] + Tp[2]) / 2, zAt: fr => pr([G[0] + D[0] * tipL * fr, G[1] + D[1] * tipL * fr, G[2] + D[2] * tipL * fr])[2], tipL, ang: Math.atan2(dx, -dy), fore: cl(Math.hypot(dx, dy) / Math.max(1e-6, tipL), 0.2, 1)};
    // ✋ the elbow is found in 3D (upper + fore 8 + 8, it hangs DOWN + BACK + a little OUT — the pole), then projected; the 2D arm uses that projected length
    // (an arm reaching toward us is SHORT, never folded out) and the elbow solution nearest the projected 3D elbow (Aowu 15:47)
    ['R', 'L'].forEach(sd => { const hs = H.hands && H.hands[sd]; if (hs == null) return; const B = grip(hs), Q = pr(B), S = sd === 'R' ? sR : sL, lat = LAT[sd] * 10;
      const S3 = [lat, -42, 0], v = [B[0] - S3[0], B[1] - S3[1], B[2] - S3[2]], d = Math.hypot(v[0], v[1], v[2]) || 1, u3 = v.map(c => c / d);
      const pole0 = (H.pole && H.pole[sd]) || [LAT[sd] * 0.35, 1, -0.6], pd = pole0[0] * u3[0] + pole0[1] * u3[1] + pole0[2] * u3[2], pp = norm3([pole0[0] - pd * u3[0], pole0[1] - pd * u3[1], pole0[2] - pd * u3[2]]);
      const hh = d >= 16 ? 0 : Math.sqrt(64 - d * d / 4), E3 = [S3[0] + v[0] / 2 + pp[0] * hh, S3[1] + v[1] / 2 + pp[1] * hh, S3[2] + v[2] / 2 + pp[2] * hh], Ep = pr(E3);
      const l1 = Math.hypot(Ep[0] - S.x, Ep[1] - S.y), l2 = Math.hypot(Q[0] - Ep[0], Q[1] - Ep[1]), rch = cl((l1 + l2) / 16, 0.3, 1), len = 16 * rch;
      const near2 = (root, tgt, ej) => { const h2 = len / 2, ddx = tgt[0] - root[0], ddy = tgt[1] - root[1], dd = Math.hypot(ddx, ddy), base = Math.atan2(-ddx, ddy);
        if (dd >= len - 0.01) return {a1: base, a2: base, j: end(root[0], root[1], base, h2)}; const off = Math.acos(cl(dd / len, -1, 1));
        const sol = [1, -1].map(sg => { const a1 = base - off * sg, j = end(root[0], root[1], a1, h2); return {a1, a2: Math.atan2(-(tgt[0] - j[0]), tgt[1] - j[1]), j}; });
        const di = q => Math.hypot(q.j[0] - ej[0], q.j[1] - ej[1]); return di(sol[0]) <= di(sol[1]) ? sol[0] : sol[1]; };
      const q = near2([S.x, S.y], [Q[0], Q[1]], [Ep[0], Ep[1]]); W[sd] = {hand: Q, j: q.j, e3: Ep, E3, M3: [S3[0] + v[0] / 2, S3[1] + v[1] / 2, S3[2] + v[2] / 2], d3: d, reach: rch, len};
      if (sd === 'R') { const m = p2 => [-(p2[0] - dR[0]), p2[1] - dR[1]]; Object.assign(P, asR(near2([10, -42], m(Q), m(Ep))), {reach: rch}); }
      else { const m = p2 => [p2[0] - dL[0], p2[1] - dL[1]], r3 = asR(near2([10, -42], m(Q), m(Ep))); PL.armR = r3.armR; PL.elbowR = r3.elbowR; PL.reach = rch; } });
  }
  // 🙆 the free arms on a turned walk: a REAL 3D swing (forward / back along the facing, each arm opposite its own leg), projected like the held-thing arms —
  // a hand swinging toward us comes lower + the arm looks shorter, never a flat sideways wave
  if (P._walk != null) { const w = P._walk, A = 0.6, spA = Math.max(sp, 0.45), prc = p => { const r = rotY(p[0], p[2], T.chest), rs = rotY(p[0], 0, T.chest); return [r[0], p[1] + r[1] * sp + (r[1] - rs[1]) * (spA - sp)]; };   // seen from a little above: a hand swinging toward us comes LOWER, one swinging back goes higher
    ['R', 'L'].forEach(sd => { if (H && H.hands && H.hands[sd] != null) return; const s = A * w * (sd === 'R' ? 1 : -1), lat = LAT[sd] * 10.5, S = sd === 'R' ? sR : sL;
      const B3 = [lat + LAT[sd] * 1.2, -42 + 15.5 * Math.cos(s), 15.5 * Math.sin(s)], E3 = [lat + LAT[sd] * 0.8, -42 + 7.8 * Math.cos(s * 0.7), 7.8 * Math.sin(s * 0.7) - 0.9];
      const Q = prc(B3), Ep = prc(E3); (P._arms || (P._arms = {}))[sd] = Q; const l1 = Math.hypot(Ep[0] - S.x, Ep[1] - S.y), l2 = Math.hypot(Q[0] - Ep[0], Q[1] - Ep[1]), rch = cl((l1 + l2) / 16, 0.3, 1);
      if (sd === 'R') { const m = q => [-(q[0] - dR[0]), q[1] - dR[1]]; Object.assign(P, asR(solve2([10, -42], m(Q), m(Ep), 16 * rch)), {reach: rch}); }
      else { const m = q => [q[0] - dL[0], q[1] - dL[1]], r3 = asR(solve2([10, -42], m(Q), m(Ep), 16 * rch)); PL.armR = r3.armR; PL.elbowR = r3.elbowR; PL.reach = rch; } }); }
  // 🦶 feet in 3D (P.feet3 = {R: [lat, fwd], L: [lat, fwd]}): the foot lands where it really is round the turned hips, the knee bends toward the facing side
  if (P.feet3) { const fS = Math.sin(T.hip) >= 0 ? 1 : -1, gy = -2 - (P.dy || 0);
    ['R', 'L'].forEach(sd => { const f = P.feet3[sd]; if (!f) return; const R0 = sd === 'R' ? J.hR : J.hL, Ft = bodyPt(f[0], gy - (f[2] || 0), f[1], T.hip, P.feetFloor != null ? Math.max(sp, P.feetFloor) : sp), nat = sd === 'R' ? [-5, -20] : [5, -20], d = [R0.x - nat[0], R0.y - nat[1]];
      const tl = [-(Ft.x - d[0]), Ft.y - d[1]], loc = sd === 'R' ? [5, -20] : [-5, -20], h = 9, dx = tl[0] - loc[0], dy = tl[1] - loc[1], dd = Math.hypot(dx, dy), base = Math.atan2(-dx, dy);
      const off = dd >= 18 - 0.01 ? 0 : Math.acos(cl(dd / 18, -1, 1)), sols = [1, -1].map(sg => { const a1 = base - off * sg, j = end(loc[0], loc[1], a1, h); return {a1, a2: Math.atan2(-(tl[0] - j[0]), tl[1] - j[1]), j}; });
      const q = sols.sort((A, B) => (-B.j[0] * fS) - (-A.j[0] * fS))[0];   // local x is mirrored: the knee toward the facing side on screen
      (P._feet || (P._feet = {}))[sd] = [Ft.x, Ft.y, Ft.z];
      if (sd === 'R') { P.legR = q.a1; P.kneeR = q.a2 - q.a1; P.footR = P.footR || 0; } else { P.legL = -q.a1; P.kneeL = q.a2 - q.a1; P.footL = P.footL || 0; } }); }
  // ---- 🗄️ baked: torso (cylinder, row twist) · hair (round the head ball) · head shell + face ----
  const needBack = th => Math.abs(th) > 0.25, LK = lookKey(av), kq = Math.round(k * 20);   // hq below = the head yaw + FACE0: the front picture's face looks FACE0 to its side, turn it back to the middle
  const chestBack = Math.cos(T.chest) < 0, headBack = Math.cos(T.head) < 0;
  const tKey = 'T|' + LK + '|' + kq + '|' + q5(T.hip) + '|' + q5(T.chest) + '|' + fk(P, TORSO_F);
  let torso = cGet(tKey);
  if (!torso) { const th = q5(T.hip) * PI / 36, tc = q5(T.chest) * PI / 36, bodyPose = {armR: NaN};   // no under-arm shade on a turned chest
    const torF = paintPart(a, P, k, {body: 1}, Object.assign({pose: bodyPose}, FR)), torB = needBack(tc) || needBack(th) ? paintPart(a, P, k, {body: 1}, Object.assign({pose: bodyPose}, BK)) : null;
    const rowYaw = yy => { const yu = (yy - oy) / k; return lerp(th, tc, sstep(-22, -40, yu)); };
    torso = cPut(tKey, crop(cylTurn(pmCanvas(torF), torB ? pmCanvas(torB) : null, rowYaw, 0.64, {smooth: Math.round(3 * k)}))); }
  const HS = P.headSc || 1, hqh = q5(T.head) * PI / 36, hq = hqh + FACE0;
  const hrKey = 'H|' + LK + '|' + kq + '|' + q5(T.head) + '|' + (headBack ? 1 : 0) + '|' + fk(P, HEAD_F);
  let hair = cGet(hrKey);
  if (!hair) { const hl = paintPart(a, P, k, {hairback: 1}, headBack ? BK : FR);
    hair = cPut(hrKey, crop(ballTurn([{c: hl, side: headBack ? 'back' : 'behind'}], ox, oy - 60 * k, 13.2 * k * HS, headBack ? hqh : hq, {zOut: 7 * k}))); }
  const faceL = paintPart(a, P, k, {head: 1, headMode: 'face'}, Object.assign({t}, FR)), fh = faceHash(faceL, k);
  const hdKey = 'D|' + LK + '|' + kq + '|' + q5(T.head) + '|' + fk(P, HEAD_F) + '|' + fh;
  let head = cGet(hdKey);
  // a hood / helmet frames the face: its window must slide round the ball WITH the face (a plain round head keeps its outline, no seams)
  if (!head) { const warpSh = !!(L0.hood || L0.mask || (av.cw && av.cw.head)), hf0 = paintPart(a, P, k, {head: 1, headMode: 'shell'}, FR);
    const headF = hf0, headB = needBack(hq) ? paintPart(a, P, k, {head: 1, headMode: 'shell'}, BK) : null;
    head = cPut(hdKey, crop(headTurn(headF, headB, faceL, ox, oy - 60 * k, 13 * k * HS, hq, warpSh))); }
  // ---- 🎨 live layers ----
  const eq = av.eq || {}, hasBack = !!(chestBack || eq.back || L0.cape || L0.tail || L0.backpack || (av.cw && av.cw.back)), hasOff = !!eq.off;   // skip parts that would paint nothing
  const bItems = hasBack ? paintPart(a, P, k, {back: 1}, Object.assign({t}, chestBack ? BK : FR)) : null;
  const armR = paintPart(H ? aNo : a, P, k, {armR: 1}, Object.assign({t}, FR));
  const armLnear = paintPart(aNo, P, k, {armR: 1}, {t, who: {dir: 1}, pose: Object.assign({item: null, holdRot: 0, slash: null}, PL)});
  const offL = hasOff ? paintPart(a, P, k, {off: 1}, Object.assign({t}, FR)) : null;
  // legs: each one alone (the other leg pointed up out of the way, then cut to its own capsule) · drawn mirrored: AvatarKit's R leg (+5) lands at −5
  // (the capsule is the CLIP while it paints: no mask canvas)
  const legLay = sd => { const other = sd === 'L' ? {legR: -2.6, kneeR: 0, footR: 0} : {legL: -2.6, kneeL: 0, footL: 0};
    const x0 = sd === 'L' ? -5 : 5, a0 = sd === 'L' ? -P.legL : P.legR, kn = sd === 'L' ? (P.kneeL || 0) : (P.kneeR || 0), j = end(x0, -20, a0, 9), e = end(j[0], j[1], a0 + kn, 9), m = q => [-q[0], q[1]];
    const em = m(e), pts = [m([x0, -22]), m(j), em];
    const clip = (q, kk) => { capPath(q, kk, pts, 6.8); q.moveTo((em[0] + 8.5) * kk, em[1] * kk); q.arc(em[0] * kk, em[1] * kk, 8.5 * kk, 0, 7); };
    return {c: paintPart(a, P, k, {legs: 1}, Object.assign({t, pose: other, clip}, FR)), e: em}; };
  const LL = legLay('L'), LR = legLay('R');
  // ---- compose: fig (hips + legs, body frame) · up (the upper body, bent round the hips) ----
  const fig = layer(k), F = fig.getContext('2d'), up = P.bend ? layer(k) : fig, U = up.getContext('2d');   // no bend: the upper body paints straight into fig
  const put = (q, c, dx, dy, o) => { if (!c) return; o = o || {}; q.save(); if (o.alpha != null) q.globalAlpha = o.alpha;
    q.translate(ox + dx * k, oy + dy * k); if (o.sx != null) { q.translate((o.cx || 0) * k, 0); q.scale(o.sx, 1); q.translate(-(o.cx || 0) * k, 0); } q.drawImage(c, -ox, -oy); q.restore(); };
  const putB = (q, B) => { if (B && B.c) q.drawImage(B.c, B.x, B.y); };   // a baked + cropped piece, layer coordinates
  // back items (cape · pack · wings) on the back plane (depth −7): behind the torso unless the back faces us
  const cC = Math.cos(T.chest), sC = Math.sin(T.chest), bScale = Math.max(0.3, Math.abs(cC));
  if (!chestBack) put(F, bItems, -7 * sC, 0, {sx: bScale});
  // legs: far first (darker), near over it · the feet stretch toward the facing side
  const sH = Math.sin(T.hip), fwd = sH >= 0 ? 1 : -1, legs = [['L', LL, J.hL], ['R', LR, J.hR]].sort((p, q) => p[2].z - q[2].z);
  legs.forEach(([sd, Lg, Rt], i) => { const nat = sd === 'L' ? 5 : -5, dx = Rt.x - nat, dy = Rt.y + 20, far = i === 0 && Math.abs(legs[0][2].z - legs[1][2].z) > 0.5;
    const cutY = Lg.e[1] - 1.5, src = far ? tint(Lg.c, 0.86) : Lg.c;
    const st = 1 + 0.42 * Math.abs(sH), heel = Lg.e[0] - fwd * 3.5, yc = Math.round(oy + (cutY + dy) * k);   // split at the ankle: the shin as is, the foot stretched forward (toes point the facing way)
    F.save(); F.beginPath(); F.rect(0, 0, fig.width, yc); F.clip(); put(F, src, dx, dy); F.restore();
    F.save(); F.beginPath(); F.rect(0, yc, fig.width, fig.height); F.clip(); put(F, src, dx + fwd * 1.4 * Math.abs(sH), dy, {sx: st, cx: heel}); F.restore(); });
  // upper body: hair behind · far arm · torso · head · the weapon · near arm
  if (!headBack) putB(U, hair);
  // both arms in the FRONT arm's own colours; the one further away is darker by its depth (flat front = both the same)
  const dz = Math.abs(sR.z - sL.z), shF = 1 - 0.18 * Math.min(1, dz / 10);
  const drawL = f => { put(U, f < 0.999 ? tint(armLnear, f) : armLnear, dL[0], dL[1]); put(U, f < 0.999 ? tint(offL, f) : offL, dL[0], dL[1]); };
  const drawFar = () => { if (rFar) put(U, tint(armR, shF), dR[0], dR[1]); else drawL(dz > 0.5 ? shF : 1); };
  const drawNear = () => { if (rFar) drawL(1); else put(U, armR, dR[0], dR[1]); };
  // 🗂️ Aowu 15:52 — 3 layers: ① the far arm · ② body + head + legs · ③ the near arm; a held thing lives in the layer of the hand that holds it
  // (main hand near → over the body + head, far → under them). The body-plane cut (a blade crossing the chest plane) only on request (H.cut).
  let WP = [];
  if (W) { const cc = Math.cos(T.chest), byBody = Math.abs(cc) > 0.2, z0 = byBody ? W.f0 * Math.sign(cc) : W.Gs[2], z1 = byBody ? W.f1 * Math.sign(cc) : W.Tz;
    if (!H.layer && !H.cut) { const hh = H.hands || {}, near = (hh.R != null && !rFar) || (hh.L != null && rFar); WP = [{half: null, lay: near ? 'front' : 'behind'}]; }
    else if (!H.layer && z0 * z1 < 0) { const f = z0 / (z0 - z1), zt = W.zAt(f + 0.4 * (1 - f)); WP = [{half: 'g', lay: z0 > 0 ? 'front' : 'behind'}, {half: 't', lay: zt > 0 ? 'front' : 'behind'}]; W.cut = f; }
    else WP = [{half: null, lay: H.layer || (W.z < -1 ? 'behind' : 'front')}];
    W.layers = WP.map(p => p.lay); W.rFar = rFar; }
  const drawWeapon = lay => { WP.forEach(pp => { if (pp.lay !== lay) return; const c = layer(k), q = c.getContext('2d');
    q.translate(ox + W.Gs[0] * k, oy + W.Gs[1] * k); q.rotate(W.ang); q.scale(1, W.fore);
    if (pp.half) { const yc = -W.cut * W.tipL * k; q.beginPath(); if (pp.half === 'g') q.rect(-200 * k, yc, 400 * k, 400 * k); else q.rect(-200 * k, yc - 400 * k, 400 * k, 400 * k); q.clip(); }
    AW.draw(q, hv, 0, 0, HI.type.size * k * (H.len || 1), {t, design: av.eq && av.eq.hand && av.eq.hand.o});
    U.drawImage(pp.lay === 'behind' ? tint(c, 0.9) : c, 0, 0); }); };
  drawWeapon('behind');
  drawFar();
  putB(U, torso); if (chestBack) put(U, bItems, -7 * sC, 0, {sx: bScale});
  if (headBack) putB(U, hair);
  drawWeapon('shoulder');   // across the back of the shoulders, behind the neck: over the torso, under the head
  putB(U, head);
  // 👃 profile: a small nose on the edge of the face
  { const v = T.head, C2 = avColors(fixAv(av)); if (Math.abs(Math.sin(v)) > 0.8 && Math.cos(v) > -0.25 && !C2.look.hood) { U.save(); U.fillStyle = C2.skin; U.beginPath(); U.arc(ox + Math.sin(v) * 13.1 * k * HS, oy + -56.5 * k, 1.7 * k, 0, 7); U.fill(); U.restore(); } }
  // 🙌 a far hand that comes round IN FRONT of the body to a grip: its forearm + hand are drawn again over the torso (the off hand crosses over)
  if (W) { const fs = rFar ? 'R' : 'L', fhd = W[fs]; if (fhd && fhd.hand[2] > 1) { const lay = rFar ? armR : armLnear, d = rFar ? dR : dL, j = [fhd.j[0] - d[0], fhd.j[1] - d[1]], hp = [fhd.hand[0] - d[0], fhd.hand[1] - d[1]];
    if (lay) { const cap = capsule(lay, k, [j, hp], 3.4, [[hp[0], hp[1], 4]]); put(U, rFar ? tint(cap, 0.9) : cap, d[0], d[1]); } } }
  drawWeapon('front');
  drawNear();
  // ---- out: hips frame → bend → screen ----
  if (P.bend) { F.save(); F.translate(ox, oy - 20 * k); F.rotate(P.bend * fwd); F.translate(-ox, -(oy - 20 * k)); F.drawImage(up, 0, 0); F.restore(); }
  const lift = (a.jumpH || 0), head0 = window.AK && AK.head;
  AK.draw0(g, a, sx, sy, k / BIG, {pose: {dy: P.dy}, t, still: true, parts: {shadow: 1}});   // AvatarKit's own ground shadow (+ a look's aura / hover glow)
  if (window.AK) AK.head = head0;
  g.save(); g.translate(sx, sy + ((P.dy || 0) - lift) * k); g.scale(P.sx || 1, P.sy || 1); g.rotate((P.rot || 0) * fwd); g.drawImage(fig, -ox, -oy);
  // 🎭 the head marker (AvatarActing marks · comics) sits on the turned head, facing the way the face looks
  if (window.AK) { const hs = Math.sin(T.head) >= 0 ? 1 : -1; g.save(); g.scale(hs, 1); AK.head = {m: g.getTransform(), hy: -60 * k, k, dir: hs, turned: true}; g.restore(); }
  g.restore();
  if (P.fx) { const hm = AK.head; AK.draw0(g, a, sx, sy, k / BIG, {pose: {fx: P.fx, dy: P.dy}, t, still: true, parts: {fx: 1}}); AK.head = hm; }
  return {J, W, T, feet: P._feet || null, arms: P._arms || null};
}

// ---------- 7. 🔌 routing (no AvatarMotion / AvatarActing edit): drawAvatar · Acting.draw {turn: true} · Motion.viewPose ----------
let ON = true, CURT = null;
if (typeof window.drawAvatar === 'function') { RAW = window.drawAvatar;
  window.drawAvatar = function (g, a, sx, sy, k, o) { if (ON && o && !o.parts && o.pose && turnOf(o.pose) && ok0()) return drawTurned(g, a, sx, sy, k, o); return RAW.apply(this, arguments); }; }
if (window.Acting && Acting.draw) { const _ad = Acting.draw;
  Acting.draw = function (g, who, x, y, k, act, opt) { const prev = CURT; CURT = opt && opt.turn && opt.view ? opt : null; try { return _ad.apply(this, arguments); } finally { CURT = prev; } }; }
if (M.viewPose) { const _vp = M.viewPose;
  M.viewPose = function (P, V) { if (!CURT || !V || TURN_VIEWS[V.key] == null) return _vp.apply(this, arguments);
    const y = TURN_VIEWS[V.key]; P.hipYaw = (P.hipYaw || 0) + y; P.chestYaw = (P.chestYaw || 0) + y; P.headYaw = (P.headYaw || 0) + y; }; }
// ---------- 8. 🔥 warm: bake the 4 main views of a look before they are needed (one bake a frame, no hitch) ----------
const WARMQ = []; let warming = false;
function warmStep() { const j = WARMQ.shift(); if (!j) { warming = false; return; }
  try { const c = document.createElement('canvas'); c.width = 4; c.height = 4; drawTurned(c.getContext('2d'), j.who, 2, 2, j.k, {pose: turnView(j.key, 1), t: 1}); } catch (e) { /* a bad look never stops the queue */ }
  (window.requestIdleCallback || (f => setTimeout(f, 16)))(warmStep); }
function turnWarm(who, k, keys) { (keys || ['SE', 'NE']).forEach(key => [1, -1].forEach(dir => WARMQ.push({who: Object.assign({}, who, {dir}), k: k || 1, key})));
  if (!warming) { warming = true; (window.requestIdleCallback || (f => setTimeout(f, 16)))(warmStep); } return WARMQ.length; }
function turnCache() { return {n: CACHE.size, bytes: ST.bytes, cap: capB(), hits: ST.hits, misses: ST.misses}; }
function turnClear(o) { CACHE.clear(); ST.bytes = 0; ST.hits = 0; ST.misses = 0; if (o && o.cap) ST.cap = o.cap; }
M.TURN = {VERSION: 'mo-14', BOX, FACE0, on: v => { if (v != null) ON = !!v; return ON; }, layer: {paintPart, cylTurn, ballTurn, headTurn, pmCanvas, capsule, crop, tint, scratch, freeAll}, keys: {lookKey, faceHash, q5}};
Object.assign(M, {turnOf, turnPts, drawTurned, headWarp, TURN_VIEWS, turnView, turnTo, turnWarm, turnCache, turnClear});
})();
