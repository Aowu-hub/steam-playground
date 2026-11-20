
/* 🌊 CreatureSea — adds 2 families through Creatures.addFamily. Same draw call as every creature:
   Creatures.draw(g, id, x, feetY, size, {act + ms | pose, t, form, face, finish, poseAt, from, heads: {L1: {act, ms}}, layer: 'M', view: 'SW' | 'SE' | 'NW' | 'NE', yaw})
   → anchors (+ serpents: spine · necks · layers · fork · ride · rig.M · dome · cross · tail). Acts: surface · rise · lunge · sweep · bow · dive · gulp · sHurt · home (serpents) · hop · flare · glide (fish).
   Pick a view from a move: Motion.view8(dx, dy, last); ↘ ↗ = ↙ ↖ mirrored. Big serpents cost 2.5–4 ms a raw draw → use {finish: true} (cached) or Creatures.frames. */
(function(){ if(!window.Creatures || !Creatures.addFamily){ console.warn('CreatureSea: CreatureKit with addFamily must load first'); return; }
Creatures.addFamily(function(K){ const {D, TAU, RIM, T, lerp, EL, FAM, POSES, ACTS, LIST, P0, poseOf, sample} = K;
/* ---------- 🐍 serpent family (av-naga1, Avateer plan §23c N4 · 🧳 Avateer chat 2026-11-20) — Phaya Naga · Big Eel · Squirmeel … ----------
   🧠 How real ones move (studied first, 🦴 rule): snakes + eels bend in S-waves that travel from the head to the tail, and every bit of the
   body goes where the head went (lateral undulation). Eels swim with the wave GROWING toward the tail (anguilliform). A cobra / naga lifts
   its front part and keeps the head LEVEL on an S-hooked neck while the rest stays down as the base. A heavy tail lags, then whips.
   🛠️ How it's drawn: a 3D spine (x forward · y up · z toward you) → screen y + z × TILT, painted far → near, ONE dark rim round all of it.
   Link s (0 head … 1 tail) reads the act lag × s ms LATER, so the head leads and the tail follows a beat behind (follow-through for free,
   same t = same picture). A game that moves a serpent passes {poseAt: ms => pose} to feed its own history.
   Shape: {len, r, hr (neck height), neck (front part that lifts), stand (0 lying · 1 standing), lag, head: 'naga' | 'eel' | 'swamp',
           ridge: 'kranok' | 'fin' | 'none', scales: 'gold' | 'plain', spots, crown, links, swim, waves, headK}
   Pose fields (serpents only, 0 = rest): down · up · coil · reach · bow · sweep · sink · wave · look (0 side → 1 faces you) · glow.
   The shared acts (attack · hurt · cheer …) work too: lean −/+ → coil / reach. */
Object.assign(P0, {down: 0, up: 0, coil: 0, reach: 0, bow: 0, sweep: 0, sink: 0, wave: 0, look: 0, glow: 0, go: 0, spring: 0});
Object.assign(FAM, {serpent: {icon: '🐍', name: 'Serpent'}});
Object.assign(POSES, {
  sSwim:   {down: 1, wave: 1},
  sSink:   {sink: 1, down: 0.55},
  sPeek:   {sink: 0.62, down: 0.15, head: -0.15},
  sUp:     {sink: 0.2, up: 0.05, jaw: 0.25, eye: 'angry'},
  sDive:   {sink: 1.05, down: 0.5, head: 0.3},
  sPreDive: {up: 0.1, coil: 0.35, head: -0.3, eye: 'angry'},
  sDiveIn: {sink: 0.28, down: 0.2, head: 0.45},
  sCoil:   {coil: 1, jaw: 0.2, eye: 'angry', head: -0.12},
  sReach:  {reach: 1, jaw: 0.85, eye: 'angry', head: 0.12},
  sReachF: {reach: 0.6, jaw: 0.4, head: 0.05},
  sRear:   {up: 0.12, coil: 0.55, sweep: 1, eye: 'angry', head: -0.25},
  sSweep:  {sweep: -1, coil: 0.1, reach: 0.12, jaw: 0.5, eye: 'angry'},
  sSweepF: {sweep: -1.3, reach: 0.08, jaw: 0.3},
  sCrouch: {sink: 0.86, coil: 0.8, down: 0.3},
  sRoar:   {up: 0.16, look: 1, jaw: 1, glow: 1, head: -0.14, sy: 1.06},
  // 🔥 rise v5 (Aowu 17:41 + 17:43, 12 keys): look → tail winds up under the water (a spring) → SPRING up → peak → falls FORWARD onto the water (hip lands, tail starts up) → body bounces, tail follows up → tail peak → tail slaps down → wobble → settle (a bit in front)
  rLook:   {sink: 0.5, head: -0.06},
  rWind:   {sink: 0.84, coil: 0.7, down: 0.25, spring: 1, eye: 'angry'},
  rSpring: {up: 0.3, look: 1, jaw: 0.8, glow: 1, head: -0.12, sy: 1.08, spring: -0.25},
  rSlam:   {down: 0.88, go: 0.9, reach: 0.25, sweep: 0.7, look: 1, jaw: 0.6, glow: 0.7},
  rBounce: {down: 0.58, up: 0.04, go: 1, sweep: 1.1, look: 1, jaw: 0.3, glow: 0.6},
  rTailUp: {up: 0.04, go: 1, sweep: 1.15, look: 1, jaw: 0.2, glow: 0.5},   /* the neck is already back UP (ready to fight) while the tail is still high */
  rTailHit: {go: 1, sweep: -0.35, look: 0.5, jaw: 0.35, glow: 0.4},
  rWobble: {up: 0.03, go: 1, sweep: 0.1, glow: 0.3},
  rLand:   {go: 1},   /* 🐉 the ready-to-fight guard pose, a bit in front */
  sRoarF:  {up: 0.06, look: 1, jaw: 0.35, glow: 0.6},
  sTall:   {up: 0.16, look: 1, eye: 'shut', head: -0.08},
  sBow:    {bow: 1, look: 1, eye: 'shut'},
  sBowUp:  {bow: 0.3, look: 1, eye: 'happy'},
  sHurt:   {coil: 0.65, head: -0.4, eye: 'shut', jaw: 0.4, shift: 10},
  sHome:   {down: 0.7, reach: -0.2, head: 0.2, shift: 26, eye: 'open'},
});
// 🎬 timings are written for the GIANT naga (size class 6, weight giant — M3 heavy + M19 holds + M17 eases: anticipation cubicOut · strike cubicIn = fastest AT contact ·
//    follow-through backOut HELD · recover sineOut); a lighter serpent plays them faster with shape.pace (Big Eel 1.45 = heavy, a Squirmeel ≈ 2 = light)
Object.assign(ACTS, {
  // 🌊 phase 1: a ripple warns → the crest peeks → the head BREAKS the surface (hit it!) → held → the heavy body dives, the tail follows it down
  surface: [{name: 'ready', pose: 'sSink', ms: 120}, {name: 'anticipation', pose: 'sPeek', ms: 460, ease: 'cubicOut'}, {name: 'contact', pose: 'sUp', ms: 170, contact: true, stop: 90, ease: 'cubicIn'},
            {name: 'follow-through', pose: 'sUp', ms: 760, ease: 'backOut'}, {name: 'settle', pose: 'sDive', ms: 560, ease: 'cubicIn'}],
  // 🔥 phase 2: gathers its weight under the water (slow) → heaves up full size, faces you, crown glows → HOLDS → lets the weight settle
  rise:    [{name: 'ready', pose: 'sSink', ms: 100}, {name: 'look', pose: 'rLook', ms: 420, ease: 'cubicOut'}, {name: 'anticipation', pose: 'rWind', ms: 320, ease: 'cubicOut'},
            {name: 'contact', pose: 'rSpring', ms: 200, contact: true, stop: 100, ease: 'cubicIn'}, {name: 'slam', pose: 'rSlam', ms: 280, ease: 'cubicIn'}, {name: 'bounce', pose: 'rBounce', ms: 160, ease: 'backOut'},
            {name: 'ready again', pose: 'rTailUp', ms: 380, ease: 'cubicOut'}, {name: 'tail slap', pose: 'rTailHit', ms: 180, ease: 'cubicIn'}, {name: 'wobble', pose: 'rWobble', ms: 260, ease: 'sineInOut'},
            {name: 'settle', pose: 'rLand', ms: 520, ease: 'sineOut'}],
  // ⚔️ head bonk (no bite): S-coil back (the body slides forward a little) → strikes (fastest at contact, the body recoils back) → held low → slow recover
  lunge:   [{name: 'ready', pose: 'idle', ms: 100}, {name: 'anticipation', pose: 'sCoil', ms: 440, ease: 'cubicOut'}, {name: 'contact', pose: 'sReach', ms: 120, contact: true, stop: 90, ease: 'cubicIn'},
            {name: 'follow-through', pose: 'sReachF', ms: 480, ease: 'backOut'}, {name: 'settle', pose: 'idle', ms: 560, ease: 'sineOut'}],
  // 🌀 tail sweep: rears back + cocks the tail (the front leans the other way) → sweeps → the light tail WHIPS past and rings → the weight settles
  sweep:   [{name: 'ready', pose: 'idle', ms: 100}, {name: 'anticipation', pose: 'sRear', ms: 640, ease: 'cubicOut'}, {name: 'contact', pose: 'sSweep', ms: 130, contact: true, stop: 120, ease: 'cubicIn'},
            {name: 'follow-through', pose: 'sSweepF', ms: 520, ease: 'backOut'}, {name: 'settle', pose: 'idle', ms: 680, ease: 'sineOut'}],
  // 🙏 calm + bow: stands tall, eyes close → lowers the heavy head slowly → holds the bow (Pearl + Scale drop on contact) → rises, happy
  bow:     [{name: 'ready', pose: 'idle', ms: 120}, {name: 'anticipation', pose: 'sTall', ms: 560, ease: 'sineInOut'}, {name: 'contact', pose: 'sBow', ms: 720, contact: true, ease: 'sineInOut'},
            {name: 'follow-through', pose: 'sBow', ms: 700}, {name: 'settle', pose: 'sBowUp', ms: 640, ease: 'sineOut'}],
  sHurt:   [{name: 'contact', pose: 'sHurt', ms: 90, contact: true, stop: 70}, {name: 'follow-through', pose: 'sHurt', ms: 300}, {name: 'settle', pose: 'idle', ms: 460, ease: 'sineOut'}],
  // 🏠 slips back home (mini boss calmed): curls back, then the body slides into its doorway
  home:    [{name: 'anticipation', pose: 'sCoil', ms: 280, ease: 'cubicOut'}, {name: 'contact', pose: 'sHome', ms: 620, contact: true, ease: 'cubicIn'}, {name: 'settle', pose: 'sHome', ms: 300}],
});
// 🤿 dive (Aowu 16:49 arrows): head → neck → base → tail all go in through ONE hole; the tail lifts, arcs up and OVER and follows the head down
ACTS.dive = [{name: 'ready', pose: 'idle', ms: 100}, {name: 'anticipation', pose: 'sPreDive', ms: 320, ease: 'cubicOut'}, {name: 'contact', pose: 'sDiveIn', ms: 260, contact: true, ease: 'cubicIn'},
             {name: 'follow-through', pose: 'sDive', ms: 1100, ease: 'sineInOut'}, {name: 'settle', pose: 'sSink', ms: 420, ease: 'sineOut'}];
ACTS.surface.from = 'sSink'; ACTS.rise.from = 'sSink';   // these start under the water (a game plays them after a dive)
const SERP = {TILT: 0.42};
const sClamp = (v, a, b) => v < a ? a : v > b ? b : v, sStep = x => { x = sClamp(x, 0, 1); return x * x * (3 - 2 * x); };
function sCubic(a, b, c, d, u){ const v = 1 - u; return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]]; }
function sRot(x, y, a, cx, cy){ const c = Math.cos(a), s = Math.sin(a), dx = x - cx, dy = y - cy; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; }
// the pose a link reads (lagged), with the shared acts mapped onto the serpent fields
function sPose(Q){ Q = poseOf(Q); if(Q.fl || Q.bl){ Q.wave = Math.max(Q.wave, 1); Q.down = Math.max(Q.down, 0.5); } /* map walk frames = glide */ if(Q.lean < 0) Q.coil = Math.max(Q.coil, -Q.lean * 2); if(Q.lean > 0) Q.reach = Math.max(Q.reach, Q.lean * 2.3); return Q; }
// ⚖️ v2 (av-naga1, Aowu 16:12 "the body mass gives the motion"): MASS drives the motion
//  · mass of a link = its thickness² (the chest is heavy, the tail tip almost nothing)
//  · each link is a little SPRING that follows the head: heavy links answer slowly + hardly overshoot, thin links answer fast + WHIP past and ring
//    (a damped spring's step answer, sampled from the act's past = still "same t = same picture", no simulation state)
//  · the motion travels down the body by MASS (the heavy middle takes longest, the light tail catches up and whips)
//  · weight shift: a raised neck presses the base down + it bulges · a lunge pushes the body back (recoil) · a tail sweep swings the front the other way (counter-balance)
//  · gravity: a heavy neck held far forward sags · 🫁 slow breath by size (giant ≈ 4 s, short in-breath, long out-breath) lifts the chest + neck
const SERP_FF = ['down', 'up', 'coil', 'reach', 'bow', 'sweep', 'sink', 'go', 'spring'], SERP_K = {};
function sKernel(m, S){ const key = Math.round(m * 20) + ':' + (S.spring || 1); if(SERP_K[key]) return SERP_K[key];
  const f = Math.min(3.4, (1.25 * (S.spring || 1)) / Math.sqrt(Math.max(0.06, m))), w = TAU * f, z = 0.68 - 0.36 * (1 - m), wd = w * Math.sqrt(1 - z * z), K = 9, dt = 0.06;
  const ws = []; let sum = 0; for(let k = 0; k < K; k++){ const tau = (k + 0.5) * dt, h = Math.exp(-z * w * tau) * Math.sin(wd * tau); ws.push(h); sum += h; }
  return (SERP_K[key] = {ws: ws.map(v => v / sum), dt: dt * 1000}); }
function plan_serpent(S, P, C, t){
  const L = S.len || 170, R = S.r || 11, Hr = S.hr || 58, sr = S.neck || 0.46, lag = S.lag || 240, eel = S.head && S.head !== 'naga', N = Math.max(28, (S.links || 16) * 2);
  const stand = S.stand == null ? 1 : S.stand, at = S._at, Q0 = sPose(P);
  const X0 = -L * 0.40, step = L * 0.8, xb = X0 + sr * step;
  // 🧭 av-naga3 4 main views: o.view SW (↙ ¾ toward you) · NW (↖ ¾ going away) — SE / NE = the same pictures mirrored (kit hook). The 3D spine turns by yaw round the neck base.
  const YAW = typeof S._yaw === 'number' ? sClamp(S._yaw, -Math.PI / 4, Math.PI / 4) : S._view === 'SW' ? -Math.PI / 4 : S._view === 'NW' ? Math.PI / 4 : 0, VW = YAW < -1e-4 ? 'SW' : YAW > 1e-4 ? 'NW' : null, cY = Math.cos(YAW), sY = Math.sin(YAW), BACK = YAW > Math.PI / 8;   /* o.yaw = an in-between (turning) */
  const LFL = 0.72 * sClamp(-YAW / (Math.PI / 4), 0, 1), VSD = YAW > 0 ? Math.cos(4 * YAW) : 1;   // ↙ face floor · the hood's side sign (edge-on at π/8, mirrored at ↖)
  const rotV = (x, z) => YAW ? [xb + (x - xb) * cY - z * sY, (x - xb) * sY + z * cY] : [x, z];
  const shapeR = s => eel ? (s < 0.12 ? lerp(0.86, 1, s / 0.12) : s < 0.72 ? lerp(1, 0.84, (s - 0.12) / 0.6) : lerp(0.84, 0.2, Math.pow((s - 0.72) / 0.28, 1.25)))
                          : (s < 0.2 ? lerp(0.76, 1, s / 0.2) : lerp(1, 0.13, Math.pow((s - 0.2) / 0.8, 1.15)));
  const mass = s => { const r = shapeR(s); return r * r; };
  // cumulative mass from the head → how long the motion takes to reach link s
  const MC = [0]; for(let i = 1; i <= 40; i++) MC.push(MC[i - 1] + mass((i - 0.5) / 40)); const mTot = MC[40], massLag = s => lag * MC[Math.round(s * 40)] / mTot;
  // 🫁 breath: slow by size (S.breath s), short in-breath (40 %), long out-breath — uneven like a real body (M23)
  const bp = ((t / (S.breath || 4)) % 1 + 1) % 1, breath = bp < 0.4 ? Math.sin(bp / 0.4 * Math.PI / 2) : Math.cos((bp - 0.4) / 0.6 * Math.PI / 2);
  const radius = s => R * shapeR(s) * (1 + 0.045 * breath * Math.max(0, 1 - Math.abs(s - 0.24) / 0.2));
  // each link's pose = the head's act, delayed by mass + filtered by its own spring (heavy = slow + steady, light = quick + whips)
  const memo = new Map(), raw = d => { const k = Math.round(d / 10); let v = memo.get(k); if(!v){ v = sPose(at(k * 10)); memo.set(k, v); } return v; };
  const filt = (f, d0, K) => { let v = 0; K.ws.forEach((w, k) => { v += w * raw(d0 + k * K.dt)[f]; }); return v; };
  const PQ = s => { if(!at || s <= 0) return Q0; const d0 = massLag(s), K = sKernel(mass(s), S), out = Object.assign({}, raw(d0)), near = sStep(s / 0.16);   // the neck right behind the head moves WITH it
    SERP_FF.forEach(f => { if(f === 'sweep') return; out[f] = lerp(out[f], filt(f, d0, K), near); });
    // 🌀 the tail sweep is driven from the HIPS (s 0.42), not from the head: the swing travels hips → tip, the thin tip whips past and rings
    const ds = Math.max(0, massLag(s) - massLag(0.42)) * 0.8; out.sweep = s <= 0.42 ? raw(0).sweep : filt('sweep', ds, sKernel(mass(s), S));
    return out; };
  const H = PQ(0), riseH = sClamp(stand * (1 - H.down) + H.up, 0, 1.2), strain = riseH * (1 + 0.7 * Math.max(0, H.reach) + 0.4 * H.bow);   // how much neck the base is holding up
  // 🤿 dive state from the HEAD's sink over the last 1.5 s: how far the body has slid along the dive track (D) and how much the track counts (w)
  const DV = {w: 0, D: 0, h: 0}; if(at){ const hs = raw(0).sink; let mn = hs; for(let d = 50; d <= 3000; d += 50) mn = Math.min(mn, raw(d).sink);   /* av-naga3 🔎 3 s (was 1.5 s): the dive is 2.2 s long, so the track slid BACK near its end */
    DV.w = sClamp((hs - mn) * 4, 0, 1); DV.D = 1.3 * Math.pow(sClamp((hs - mn) / 0.95, 0, 1), 1.25); DV.h = Hr * 0.95 * Math.sin(Math.PI * Math.min(1, DV.D / 1.3)); }
  // 🔥 coming-up state: which way the head's sink moved last (dive or rise) + how far it has come up (F)
  const UP = {w: 0, F: 1, age: 0}; if(at){ const hs = raw(0).sink; let mx = hs, dir = 0; for(let d = 50; d <= 1500; d += 50) mx = Math.max(mx, raw(d).sink);
    for(let d = 0; d < 1500; d += 50){ const a = raw(d).sink, b = raw(d + 50).sink; if(Math.abs(a - b) > 0.002){ dir = a > b ? 1 : -1; break; } }
    let mn = hs; for(let d = 50; d <= 3000; d += 50) mn = Math.min(mn, raw(d).sink);
    const realDive = (dir > 0 || hs > 0.8) && mn < 0.3;   /* av-naga3 🔎 the dive's settle eases back up a hair at the bottom: still a dive (it flipped to the coming-up track = a pop) */   // 🤿 a dive only when it was OUT of the water; sinking back a little while still half under (the 🔥 rise wind-up) stays on the coming-up track
    if(mx > 0.001){ UP.w = dir < 0 ? sClamp(Math.max((mx - hs) * 4, mn > 0.2 ? 1 : 0), 0, 1) : sClamp(mx * 4, 0, 1); UP.F = sClamp(1 - hs, 0, 1); if(!realDive) DV.w = 0; let d = 0; while(d < 1500 && raw(d).sink < 0.02) d += 25; UP.age = d; } }   /* av-naga3 🔎 a dive that starts from a half-up peek keeps the coming-up track UNDER the dive track (it used to switch in one frame = the body popped) */
  function ground(s, Q){ let x = X0 + s * step, y = 0, z = 0;
    const wA = (S.sway || 0.05) + Q.wave * (S.swim || (eel ? 0.13 : 0.1)), grow = eel ? 0.22 + 0.78 * s : 0.5 + 0.5 * Math.min(1, s * 2);
    z = L * wA * grow * Math.sin(TAU * s * (S.waves || 1.35) - t * (1.6 + Q.wave * 5.2));
    z += L * (S.restS == null ? 0.07 : S.restS) * (1 - Q.wave) * Math.sin(TAU * (s - 0.2) * 1.1) * Math.min(1, Math.max(0, (s - sr * 0.6) * 3));   // a resting snake lies in loose S-curves
    if(s > 0.85) y -= Math.pow((s - 0.85) / 0.15, 2) * R * 1.2 * (1 - Q.wave * 0.6);   // tail tip curls up
    if(Q.sweep){ const f = Math.max(0, (s - 0.42) / 0.58); y -= Hr * f * 0.08 * Math.abs(Q.sweep); }   // the turn itself is done as a CHAIN below (each joint follows the joint in front)   /* + = cocked back + up · − = swung round to the front, low */
    // ⚖️ weight shift on the lying body: the head's lunge pushes it back, the coil pulls it forward (recoil), the base presses down under a raised neck
    if(Q.go) x -= L * 0.16 * Q.go;   // 🐍 moves to the front (each joint follows the one in front: the head goes first)
    if(Q.spring){ const u = Math.max(0, (s - sr) / (1 - sr)), xb0 = X0 + sr * step; x -= (x - xb0) * 0.3 * Q.spring * u; y += Q.spring * (R * 2.4 * Math.sin(TAU * u * 1.25) * u + Hr * 0.25 * u * u); }   // 🌀 the tail winds up under the water like a spring
    const wb = sStep((s - sr * 0.7) / 0.35);
    x += L * (0.055 * Q.reach - 0.03 * Q.coil) * wb;
    const press = Math.max(0, 1 - Math.abs(s - (sr + 0.08)) / 0.22); y += press * strain * R * 0.3;
    return [x, y, z]; }
  function at3(s){ return at3Q(s, PQ(s)); }
  function at3Q(s, Q){ const g0 = ground(s, Q); let [x, y, z] = g0;   /* av-naga3: the body at height s for ANY pose (the side necks read the main neck as it was a beat ago) */
    const rise = sClamp(stand * (1 - Q.down) + Q.up, 0, 1.2);
    if(s < sr && rise > 0){ const u = 1 - s / sr, w = sStep(Math.min(1, rise * 1.1)), zb = ground(sr, Q)[2];
      // 🌀 counter-balance: while the tail sweeps one way, the head + neck lean the other way (and lift a little)
      const cb = -(H.sweep || 0) * L * 0.05;
      const Hx = xb - L * 0.13 + Q.coil * L * 0.13 - Q.reach * L * 0.34 - Q.bow * L * 0.2 + cb, Hy = -Hr + Q.coil * Hr * 0.16 + Q.reach * Hr * 0.42 + Q.bow * Hr * 0.76 - Math.max(0, rise - 1) * Hr * 0.5 - breath * Hr * 0.03 - Math.abs(H.sweep || 0) * Hr * 0.05;
      // ⬇️ gravity: the further the heavy head sits out in front of the base, the more the neck sags in the middle
      const out = Math.max(0, (xb - Hx) / (L * 0.3)), sag = Hr * 0.1 * out * (1 - 0.6 * Q.coil);
      const bul = -Q.coil * L * 0.12 + Q.reach * L * 0.03 - Q.bow * L * 0.12;
      const c = sCubic([xb, 0], [xb + L * 0.02 + bul, -Hr * (0.5 + 0.45 * Q.bow) + sag], [Hx + L * 0.12 * (1 - Math.min(1, Q.reach) * 0.5), Hy - Hr * 0.35 * Q.bow + sag * 0.6], [Hx, Hy], u);
      const sw = Math.sin(t * 1.3) * L * 0.01 * (1 - Q.reach) * (1 - 0.5 * strain);   // 🫁 the raised neck sways a little (slower when it carries more)
      x = lerp(x, c[0] + sw * u, Math.min(1, w)); y = lerp(y, c[1], Math.min(1, w)); z = lerp(z, zb * (1 - u), Math.min(1, w)); }
    return [x, y, z, Q.sink]; }   // the body's own shape (no water yet) + this link's sink
  const neckAt = (s, pf) => { const p = at3Q(s, pf(massLag(s))), r = rotV(p[0], p[2]); return [r[0], p[1] + r[1] * SERP.TILT]; };   // 🦴 av-naga3: screen point of the raised neck at s, poses from pf(delay)
  // spine → screen points + normals; squash + stretch keep the volume (a coiled neck thickens, a stretched one thins, the pressed base bulges)
  // 🌊 the water: ONE hole, head → neck → base → tail, both ways (Aowu 16:49 down · 17:00 up)
  //  🤿 going UNDER = the whole body slides like a train on one track: tail end → up over an arch → down into the hole in front of the neck → under
  //  🔥 coming UP = the head bursts out of the hole at the base and climbs the neck's own path, SPINNING (a screw coming out: the neck unwinds as it rises),
  //     then the lying body surfaces in a wave from the base to the tail, and the light tail flicks up + over before it lies down
  const RAW = []; for(let i = 0; i < N; i++) RAW.push(at3(i / (N - 1)));
  // ⛓️ follow-through per joint (Aowu 17:13): the sweep turns each SEGMENT by its own (later) angle and the segments are chained one after another,
  //    so every joint follows the joint in front of it — the bend starts at the hips and rolls down to the tail, which whips round last
  { const ip = Math.round(0.36 * (N - 1)); let any = false; const A = []; for(let i = ip + 1; i < N; i++){ const s = i / (N - 1), f = (s - 0.36) / 0.64, sw = PQ(s).sweep, a = sw * (sw > 0 ? 0.9 : 1.9) * (0.75 + 0.45 * f);   /* the HIP leads: each segment copies the hip's turn a beat later (its own mass lag) — sways one way, tip reaches its peak, the hip snaps back, the tail follows one by one and SMACKS */   /* cocked back a little · swung round to the FRONT a lot (the tail crosses in front of the body = a real sweep) */ A[i] = a; if(Math.abs(a) > 1e-5) any = true; }
    if(any){ const O = RAW.map(p => p.slice()); for(let i = ip + 1; i < N; i++){ const a = A[i], dx = O[i][0] - O[i - 1][0], dz = O[i][2] - O[i - 1][2], c = Math.cos(a), sn = Math.sin(a);
      const dy = O[i][1] - O[i - 1][1];
      if(a >= 0){ RAW[i][0] = RAW[i - 1][0] + dx * c + dy * sn; RAW[i][1] = RAW[i - 1][1] - dx * sn + dy * c; RAW[i][2] = RAW[i - 1][2] + dz; }   /* wind-up: the tail swings UP + back (you see it) */
      else { const b = -a, cb = Math.cos(b), sb = Math.sin(b); RAW[i][0] = RAW[i - 1][0] + dx * cb - dz * sb; RAW[i][1] = RAW[i - 1][1] + dy; RAW[i][2] = RAW[i - 1][2] + (dx * sb + dz * cb) * 1.15; } } } }   /* the smack: low round the FRONT */
  const depth = Hr + R * 2.4, shapeAt = sp => { const f = sClamp(sp, 0, 1) * (N - 1), i = Math.min(N - 2, Math.floor(f)), u = f - i, a = RAW[i], b = RAW[i + 1]; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; };
  const backAt = i => { const s = i / (N - 1), [x, y, z] = RAW[i], u = (s - sr) / (1 - sr), P = UP.F + UP.age / 600, g = sClamp((P - 0.55 - 0.7 * u) / 0.45, 0, 1);   // a surfacing WAVE base → tail that starts while the neck comes out (tail out ≈ 420 ms after the head)
    return [x, lerp(y + depth, y, sStep(g)), z]; };
  function inWater(i){ const s = i / (N - 1), [x, y, z, sk] = RAW[i]; let vx = x, vy = y + sk * depth, vz = z;
    let ru = null; if(UP.w > 0.001){ const F = UP.F; let rx, ry, rz;
      if(s <= sr){ const sp = s + (1 - F) * (sr + 0.32);
        if(sp <= sr){ [rx, ry, rz] = shapeAt(sp); }
        else { const e = sp - sr, P0 = shapeAt(sr); rx = P0[0] + e * L * 0.12; ry = P0[1] + Math.min(depth, e * L * 0.9); rz = P0[2]; } }   // still under: straight down below the hole
      else [rx, ry, rz] = backAt(i);   // the lying body surfaces base → tail (each link by its own mass lag), in one piece
      ru = [lerp(vx, rx, UP.w), lerp(vy, ry, UP.w), lerp(vz, rz, UP.w)]; }
    if(DV.w > 0.001){ if(ru){ vx = ru[0]; vy = ru[1]; vz = ru[2]; } const tau = (1 - s) + DV.D, xA = X0 + step, xE = xb - L * 0.1; let rx, ry;
      if(tau <= 1){ rx = lerp(xA, xE, tau); ry = -DV.h * Math.sin(Math.PI * Math.pow(tau, 0.6)); }
      else { const v = tau - 1; rx = xE - L * 0.32 * (v - Math.sin(Math.min(1, v * 1.6) * Math.PI / 2) * 0.35); ry = depth * Math.sin(Math.min(1, v * 1.6) * Math.PI / 2); }
      return [lerp(vx, rx, DV.w), lerp(vy, ry, DV.w), lerp(vz, 0, DV.w)]; }
    if(ru) return ru;
    return [vx, vy, vz]; }
  const h0Y = i => RAW[i][1] + RAW[i][2] * SERP.TILT;
  const pts = []; for(let i = 0; i < N; i++){ const s = i / (N - 1), p = inWater(i); let r = radius(s);
    if(s < sr) r *= 1 + 0.06 * H.coil - 0.06 * Math.max(0, H.reach);
    r *= 1 + 0.06 * strain * Math.max(0, 1 - Math.abs(s - (sr + 0.08)) / 0.22);
    const rv = rotV(p[0], p[2]); pts.push({s, x: rv[0], y: p[1] + rv[1] * SERP.TILT, z: rv[1], wy: p[1], r}); }
  pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)]; let nx = -(b.y - a.y), ny = b.x - a.x; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    p.bx = nx; p.by = ny; });   // b = the belly side: ALWAYS the same side of the tube, head → tail (the raised neck = the front, the lying body = down) — av-naga3 🔎 a per-point "which side is down/forward" test flipped the stripes frame to frame (the flicks)
  // chunks of the body, painted far → near
  const CH = 4, chunks = []; for(let i = 0; i < N - 1; i += CH - 1){ const seg = pts.slice(i, Math.min(N, i + CH)); if(seg.length < 2) continue; chunks.push({seg, z: seg.reduce((a, p) => a + p.z, 0) / seg.length, i}); }
  chunks.sort((a, b) => a.z - b.z || b.i - a.i);
  const bodyPath = (g, seg) => { g.moveTo(seg[0].x - seg[0].bx * seg[0].r, seg[0].y - seg[0].by * seg[0].r); seg.forEach(p => g.lineTo(p.x - p.bx * p.r, p.y - p.by * p.r));
    for(let j = seg.length - 1; j >= 0; j--){ const p = seg[j]; g.lineTo(p.x + p.bx * p.r, p.y + p.by * p.r); } g.closePath();
    [seg[0], seg[seg.length - 1]].forEach(p => { g.moveTo(p.x + p.r, p.y); g.arc(p.x, p.y, p.r, 0, TAU); }); };
  // top-side extras behind each chunk: 🔥 kranok ridge flames (naga) · 🐟 fin frill (eel)
  const extras = seg => { const out = [];
    if(S.ridge === 'kranok') seg.forEach(p => { const k = Math.round(p.s * (N - 1)); if(k % 3 || p.s < 0.1 || p.s > 0.86) return; const tx = -p.bx, ty = -p.by, h = p.r * (p.s < 0.4 ? 0.85 : 1.1), ax = p.x + tx * p.r * 0.6, ay = p.y + ty * p.r * 0.6, bx2 = ty, by2 = -tx;
      const bk = (p.x < pts[Math.min(N - 1, k + 1)].x ? 1 : -1);   // flames hook toward the tail
      out.push({path: g => { g.moveTo(ax - bx2 * p.r * 0.55 * bk, ay - by2 * p.r * 0.55 * bk); g.quadraticCurveTo(ax + tx * h * 1.1, ay + ty * h * 1.1, ax + tx * h * 1.2 + bx2 * h * 0.6 * bk, ay + ty * h * 1.2 + by2 * h * 0.6 * bk);
        g.quadraticCurveTo(ax + tx * h * 0.45 + bx2 * h * 0.2 * bk, ay + ty * h * 0.45 + by2 * h * 0.2 * bk, ax + bx2 * p.r * 0.55 * bk, ay + by2 * p.r * 0.55 * bk); g.closePath(); },
        fill: g => D.lin(g, ax, ay, ax + tx * h * 1.2, ay + ty * h * 1.2, [C.gold || '#F2C230', C.gold || '#F2C230', C.tip || '#FF8A2A'])}); });
    if(S.ridge === 'fin'){ const fs = seg.filter(p => p.s > 0.1); if(fs.length > 1) out.push({path: g => { const f = p => p.r * (0.8 + 0.18 * Math.sin(p.s * 40 + t * 3)) * (p.s > 0.82 ? 1 + (p.s - 0.82) * 4 : 1);
        g.moveTo(fs[0].x - fs[0].bx * fs[0].r * 0.7, fs[0].y - fs[0].by * fs[0].r * 0.7); fs.forEach(p => g.lineTo(p.x - p.bx * (p.r + f(p)), p.y - p.by * (p.r + f(p))));
        for(let j = fs.length - 1; j >= 0; j--){ const p = fs[j]; g.lineTo(p.x - p.bx * p.r * 0.7, p.y - p.by * p.r * 0.7); } g.closePath();
        const bs = fs.filter(p => p.s > 0.55); if(bs.length > 1){ g.moveTo(bs[0].x + bs[0].bx * bs[0].r * 0.7, bs[0].y + bs[0].by * bs[0].r * 0.7); bs.forEach(p => g.lineTo(p.x + p.bx * (p.r + f(p) * 0.8), p.y + p.by * (p.r + f(p) * 0.8)));
          for(let j = bs.length - 1; j >= 0; j--){ const p = bs[j]; g.lineTo(p.x + p.bx * p.r * 0.7, p.y + p.by * p.r * 0.7); } g.closePath(); } }, fill: C.fin || D.rgba(C.c, 1)}); }
    return out; };
  // 🐉 head (facing left, origin = the neck end): side / ¾ view, or the temple front view when it faces you
  // 🙂 coming up: the head points along its path only while it BREAKS the water (nose-first); once it is out it levels to its own neck shape (Aowu 17:25: a peek looked straight up)
  const angP = sClamp(Math.atan2(-(h0Y(0) - h0Y(2)), -(RAW[0][0] - RAW[2][0])), -1.75, 1.75);
  const h0 = pts[0], h2 = pts[2], angT = sClamp(Math.atan2(-(h0.y - h2.y), -(h0.x - h2.x)), -1.75, 1.75), out = UP.w > 0.001 ? UP.w * sClamp(-h0.wy / (Hr * 0.3), 0, 1) : 0, ang0 = angT + (angP - angT) * out, hk = (R / 11) * (S.headK || 1), Qh = LFL > 0 ? Object.assign({}, Q0, {look: Math.max(Q0.look, LFL)}) : Q0;   /* 🧭 ↙ = a ¾ face (the front face, turned) */
  const look = BACK ? 0 : sClamp(Qh.look, 0, 1), front = !eel && !BACK && look > 0.5, turn = Math.max(0.58, Math.abs(Math.cos(look * Math.PI)));
  const rise0 = sClamp(stand * (1 - Qh.down) + Qh.up, 0, 1), hang = (eel ? (front ? 0 : 1) : 1 - sStep(sClamp((look - 0.3) / 0.4, 0, 1))) * ang0 * (1 - 0.55 * rise0 * (1 - Math.max(DV.w, UP.w * (1 - UP.F)))) + Qh.head * 0.7 * (1 - DV.w),   /* av-naga3 🔎 the side → front turn EASES the head level (it snapped at look 0.5) */ jaw = Math.max(Qh.jaw, eel ? 0.16 + 0.14 * Math.sin(t * 2.6) : 0);   // 🫁 eels breathe by opening + closing the mouth (it pumps water over the gills)
  const RGM = (S.rig || {}).M || {}, hangM = hang + (RGM.tilt || 0), hkM = hk * (RGM.size || 1);   /* av-naga3 🦴 shape.rig.M tunes the main head too */
  const HF = (g, f) => T(g, h0.x, h0.y, BACK && !eel ? hangM * 0.25 : hangM, g => { g.scale(hkM * turn, hkM); f(g); });
  const headParts = [], hd = eel ? eelHead(S, C, jaw, t) : BACK ? nagaBack(S, C, Qh, t) : front ? nagaFront(S, C, Qh, t) : nagaSide(S, C, jaw, Qh, t);
  hd.parts.forEach(p => headParts.push({path: g => HF(g, p.path), fill: typeof p.fill === 'function' ? (g => p.fill(g)) : p.fill}));
  const hx = h0.x + Math.cos(hang + Math.PI) * 18 * hk, hy = h0.y + Math.sin(hang + Math.PI) * 18 * hk - 2 * hk;
  let minY = 0; pts.forEach(p => { minY = Math.min(minY, p.y - p.r); }); minY = Math.min(minY, hy - (front || BACK ? 70 : 38) * hk);
  const cross = []; for(let i = 1; i < N; i++){ const a = pts[i - 1], b = pts[i]; if((a.wy < 0) !== (b.wy < 0)){ const f = a.wy / (a.wy - b.wy); cross.push([lerp(a.x, b.x, f), lerp(a.y, b.y, f) - lerp(a.wy, b.wy, f), lerp(a.r, b.r, f)]); } }
  const A = {view: VW, isBack: BACK, lookFloor: LFL, vsd: VSD, top: [hx, hy - (front || BACK ? 62 : 32) * hk], head: [hx, hy, 14 * hk], back: [pts[N >> 1].x, pts[N >> 1].y - pts[N >> 1].r], hand: [h0.x + Math.cos(hang + Math.PI) * 34 * hk, h0.y + Math.sin(hang + Math.PI) * 34 * hk + 4 * hk],
    belly: [pts[N >> 2].x, pts[N >> 2].y], tail: [pts[N - 1].x, pts[N - 1].y], H: -minY, cross, spine: pts, glow: Qh.glow, hang: hangM, neckAt, rawAt: at ? raw : null, Q0,
    rig: {M: (() => { const sf = sr * (S.forkAt || 0.5), SJ = [sf, sf * 0.62, sf * 0.3, 0], P = sp => { const f = sClamp(sp, 0, 1) * (N - 1), i = Math.min(N - 2, Math.floor(f)), u = f - i; return [lerp(pts[i].x, pts[i + 1].x, u), lerp(pts[i].y, pts[i + 1].y, u)]; };
      return {id: 'M', joints: SJ.map(P), at: SJ, lag: SJ.map(sp => Math.round(massLag(sp)))}; })()},   /* 🦴 av-naga3: the MAIN head = 3 rigs on the shared ① stomach — ② centre body → ③ neck → ④ head (same heights as the side necks' joints; lag = how late each joint answers the head) */};
  const zc = pts[Math.round(sr * (N - 1))].z, isNear = c => c.z > zc + R * 0.6;   // 🧭 a chunk nearer than the neck base
  return {parts: [], A, details(g, part){
    const CHS = part ? chunks.filter(c => (part === 'near') === isNear(c)) : chunks, chunksAll = chunks, headOn = part !== 'near';
    { const chunks = CHS;   /* av-naga3 🧭 part 'far' | 'near' paints one half (the multi-head draws its necks in between) */
    // 1 · one rim round everything (body chunks + their extras + head), 2 · fills far → near, each chunk with its own pattern, 3 · head on top
    const RW = 1.9; g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = RIM; g.fillStyle = RIM; g.lineWidth = RW * 2;
    chunks.forEach(c => { extras(c.seg).forEach(p => { g.beginPath(); p.path(g); g.stroke(); g.fill(); }); g.beginPath(); bodyPath(g, c.seg); g.stroke(); g.fill(); });
    if(headOn) headParts.forEach(p => { if(p.noRim) return; g.beginPath(); p.path(g); g.stroke(); g.fill(); }); g.restore();
    chunks.forEach(c => { extras(c.seg).forEach(p => { g.beginPath(); p.path(g); g.fillStyle = typeof p.fill === 'function' ? p.fill(g) : p.fill; g.fill(); }); g.beginPath(); bodyPath(g, c.seg); g.fillStyle = C.a; g.fill(); });
    g.save(); g.beginPath(); chunks.forEach(c => bodyPath(g, c.seg)); g.clip();
    const line = (off, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach((p, j) => { const x = p.x + p.bx * p.r * off, y = p.y + p.by * p.r * off; j ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); };
    const lineW = (off, k, col) => { for(let j = 1; j < N; j++){ const p = pts[j - 1], q = pts[j]; g.strokeStyle = col; g.lineWidth = (p.r + q.r) / 2 * k; g.beginPath(); g.moveTo(p.x + p.bx * p.r * off, p.y + p.by * p.r * off); g.lineTo(q.x + q.bx * q.r * off, q.y + q.by * q.r * off); g.stroke(); } };
    lineW(-0.74, 0.6, D.rgba(C.d, 0.5));                // dark back stripe
    lineW(-0.3, 0.32, D.rgba(C.b, 0.6));                // light shine
    if(BACK){ for(let j = 1; j < N; j++){ const p = pts[j - 1], q = pts[j]; g.strokeStyle = q.s < sr ? D.rgba(C.c, 0.14) : C.c; g.lineWidth = (p.r + q.r) / 2 * 0.8; g.beginPath(); g.moveTo(p.x + p.bx * p.r * 0.8, p.y + p.by * p.r * 0.8); g.lineTo(q.x + q.bx * q.r * 0.8, q.y + q.by * q.r * 0.8); g.stroke(); } }   // 🧭 ↖ from behind the raised neck shows its BACK (no belly band)
    else lineW(0.8, 0.8, C.c);                               // belly band
    g.strokeStyle = D.rgba(C.belly2 || '#8A6A2A', 0.45);
    pts.forEach(p => { if(p.r < 3) return; g.lineWidth = Math.max(0.8, p.r * 0.09); const cx = p.x + p.bx * p.r * 0.72, cy = p.y + p.by * p.r * 0.72; g.beginPath(); g.moveTo(cx - p.bx * p.r * 0.32, cy - p.by * p.r * 0.32); g.lineTo(cx + p.bx * p.r * 0.32, cy + p.by * p.r * 0.32); g.stroke(); });   // belly scutes
    if(S.scales === 'gold') pts.forEach((p, j) => { if(j === N - 1 || p.r < 4 || j % 2) return; const q = pts[j + 1], a = Math.atan2(q.y - p.y, q.x - p.x);
      [-0.46, 0.0].forEach(f => { const ff = f + (j % 4 ? 0.22 : 0), cx = p.x + p.bx * p.r * ff, cy = p.y + p.by * p.r * ff, rs = p.r * 0.27;
        g.strokeStyle = D.rgba(C.d, 0.45); g.lineWidth = Math.max(0.8, p.r * 0.08); g.beginPath(); g.arc(cx, cy, rs, a - Math.PI / 2 - 0.2, a + Math.PI / 2 + 0.2); g.stroke();
        g.strokeStyle = D.rgba(C.gold || '#F2C230', 0.85); g.lineWidth = Math.max(0.7, p.r * 0.06); g.beginPath(); g.arc(cx - Math.cos(a) * 0.8, cy - Math.sin(a) * 0.8, rs, a - Math.PI / 2, a + Math.PI / 2); g.stroke(); }); });
    if(S.spots) pts.forEach((p, j) => { if(j % 2 || p.s > 0.9) return; g.fillStyle = D.rgba(C.d, 0.7); const o = (j % 4 ? -0.4 : -0.05);
      g.beginPath(); D.ell(g, p.x + p.bx * p.r * o, p.y + p.by * p.r * o, p.r * 0.26, p.r * 0.18, Math.atan2(p.by, p.bx)); g.fill(); });
    g.restore();
    if(S.ridge === 'fin'){ g.strokeStyle = D.rgba(C.d, 0.35); g.lineWidth = 0.9; pts.forEach((p, j) => { if(j % 2 || p.s < 0.12) return; const f = p.r * (0.8 + 0.18 * Math.sin(p.s * 40 + t * 3)) * (p.s > 0.82 ? 1 + (p.s - 0.82) * 4 : 1); g.beginPath(); g.moveTo(p.x - p.bx * p.r * 1.02, p.y - p.by * p.r * 1.02); g.lineTo(p.x - p.bx * (p.r + f * 0.9), p.y - p.by * (p.r + f * 0.9)); g.stroke();
      if(p.s > 0.56){ g.beginPath(); g.moveTo(p.x + p.bx * p.r * 1.02, p.y + p.by * p.r * 1.02); g.lineTo(p.x + p.bx * (p.r + f * 0.7), p.y + p.by * (p.r + f * 0.7)); g.stroke(); } }); }   // fin rays
    if(!headOn) return;
    headParts.forEach(p => { g.beginPath(); p.path(g); if(p.fill){ g.fillStyle = typeof p.fill === 'function' ? p.fill(g) : p.fill; g.fill(); } });
    HF(g, g => hd.details(g));
    if(Qh.glow > 0.05){ D.glow(g, A.top[0], A.top[1] + 6 * hk, 26 * hk, '#FFE68A', 0.55 * Qh.glow); D.sparkle(g, A.top[0] + 9 * hk, A.top[1] - 2 * hk, 4 * hk * Qh.glow, '#FFF6C0'); }
  } }, nearAny: chunks.some(isNear)};
}
// ---------- 🐉 Phaya Naga head, side / ¾ (facing left; units ≈ R 11) — temple look (N1): tall gold kranok crest hooks back · chada crown · gold lip curl · jade + gold, no fangs ----------
function nagaSide(S, C, jaw, Q, t){ const gold = C.gold || '#F2C230', tip = C.tip || '#FF8A2A', parts = [];
  const CREST = [[-14, -14, 15, 0.85], [-5, -13, 20, 1], [4, -10.5, 24, 1.12]].slice(0, S.crest == null ? 3 : S.crest).map(c => S.crestK ? [c[0], c[1], c[2] * S.crestK, c[3]] : c);   /* 🥚 av-naga2: S.crest 0–3 flames (a baby grows them) · S.crestK size */   // 🔥 3 kranok flames: rise, then curl BACK (the tallest at the back)
  CREST.slice().reverse().forEach(([bx, by, L, ln], i) => { const sw = Math.sin(t * 2.2 + i) * 0.5;
    parts.push({path: g => { g.moveTo(bx - 4.5, by + 2); g.quadraticCurveTo(bx - 5.5, by - L * 0.5, bx + L * 0.22 * ln + sw, by - L * 0.94); g.quadraticCurveTo(bx + L * 0.5 * ln + sw, by - L * 1.1, bx + L * 0.64 * ln + sw, by - L * 0.86);
      g.lineTo(bx + L * 0.74 * ln + sw, by - L * 0.6); g.lineTo(bx + L * 0.52 * ln + sw, by - L * 0.7); g.quadraticCurveTo(bx + L * 0.42 * ln, by - L * 0.8, bx + L * 0.32 * ln, by - L * 0.7);
      g.quadraticCurveTo(bx + 4.5, by - L * 0.42, bx + 4.5, by + 2); g.closePath(); }, fill: g => D.lin(g, bx, by, bx + L * 0.3, by - L, [gold, gold, '#FFE27A'])}); });
  if(S.cheek !== false) parts.push({path: g => { g.moveTo(-6, 3); g.quadraticCurveTo(6, 3, 13, 13); g.quadraticCurveTo(19, 8, 18, 0); g.quadraticCurveTo(22, 9, 15, 19); g.quadraticCurveTo(4, 15, -2, 10); g.closePath(); }, fill: gold});   // 🔥 cheek / hood flame
  parts.push({path: g => { g.moveTo(-8, 5.5); g.lineTo(-30, 5); g.quadraticCurveTo(-32, 8, -29, 10); g.lineTo(-8, 12); g.closePath(); }, fill: '#7A2A22'});   // mouth inside
  parts.push({path: g => T(g, -6, 6, -jaw * 0.5, g => { g.moveTo(-2, 0); g.lineTo(-24, 0); g.quadraticCurveTo(-28, 1, -27, 4); g.quadraticCurveTo(-20, 7, -2, 7); g.closePath(); }), fill: g => D.lin(g, 0, 4, 0, 14, [C.c, '#D8C080'])});   // lower jaw
  parts.push({path: g => { g.moveTo(5, -9); g.quadraticCurveTo(-4, -18, -17, -16); g.quadraticCurveTo(-26, -15, -30, -9); g.quadraticCurveTo(-36, -5, -37, 0); g.quadraticCurveTo(-38, 5, -33, 6.5); g.lineTo(-8, 6.5); g.quadraticCurveTo(3, 7, 6, 1); g.closePath(); },
    fill: g => D.lin(g, 0, -18, 0, 7, [C.b, C.a, C.d])});
  if(S.crown) parts.push({path: g => T(g, -14, -15, -0.12, g => { g.moveTo(-8, 2); g.lineTo(8, 2); g.lineTo(6.5, -3); g.lineTo(-6.5, -3); g.closePath(); g.moveTo(-5.5, -3); g.lineTo(5.5, -3); g.lineTo(4, -8); g.lineTo(-4, -8); g.closePath();
      g.moveTo(-3.5, -8); g.lineTo(3.5, -8); g.lineTo(2, -13); g.lineTo(-2, -13); g.closePath(); g.moveTo(-2, -13); g.quadraticCurveTo(0, -15, 2, -13); g.lineTo(0, -23 - (S.crown > 1 ? 8 : 0)); g.closePath(); }), fill: gold});
  return {parts, details(g){
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    CREST.forEach(([bx, by, L, ln]) => { g.strokeStyle = D.rgba('#B07800', 0.7); g.lineWidth = 1; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx - 1, by - L * 0.5, bx + L * 0.26 * ln, by - L * 0.84); g.quadraticCurveTo(bx + L * 0.5 * ln, by - L * 0.95, bx + L * 0.55 * ln, by - L * 0.8); g.stroke(); g.fillStyle = tip; g.beginPath(); g.arc(bx + L * 0.53 * ln, by - L * 0.74, 1.3, 0, TAU); g.fill(); });
    g.fillStyle = D.rgba(C.c, 0.7); g.beginPath(); g.moveTo(-34, 4.6); g.quadraticCurveTo(-22, 4, -12, 5.4); g.lineTo(-12, 6.5); g.lineTo(-33, 6.5); g.closePath(); g.fill();   // pale upper lip
    g.strokeStyle = D.rgba(gold, 0.9); g.lineWidth = 1; [[-10, -11], [-4, -9], [-16, -13]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 3.4, 0.25, Math.PI - 0.25); g.stroke(); });
    if(S.crown){ T(g, -14, -15, -0.12, g => { g.fillStyle = '#E8473A'; g.beginPath(); g.arc(0, -0.5, 1.5, 0, TAU); g.fill(); g.fillStyle = '#2F9BD8'; g.beginPath(); g.arc(0, -5.5, 1.1, 0, TAU); g.fill(); }); }
    g.fillStyle = RIM; g.beginPath(); D.ell(g, -33, -2.2, 1.2, 0.8); g.fill();   // nostril
    // gold lip curl at the mouth corner (temple look)
    const lip = g => { g.moveTo(-14, 6.5); g.quadraticCurveTo(-7, 9, -5, 4); g.quadraticCurveTo(-4.5, 0.5, -8, 1.5); };
    g.strokeStyle = RIM; g.lineWidth = 4.2; g.beginPath(); lip(g); g.stroke(); g.strokeStyle = gold; g.lineWidth = 2.4; g.beginPath(); lip(g); g.stroke();
    // eye (round, kid-safe) + kranok brow curl
    const ex = -20, ey = -6.5, st = Q.eye; if(S.eyeK){ g.translate(ex, ey); g.scale(S.eyeK, S.eyeK); g.translate(-ex, -ey); }   /* 🥚 a baby has bigger eyes */
    if(st === 'shut' || st === 'happy'){ g.strokeStyle = RIM; g.lineWidth = 1.8; g.beginPath(); st === 'happy' ? g.arc(ex, ey + 1.5, 3.4, Math.PI * 1.1, Math.PI * 1.9) : g.arc(ex, ey - 1, 3.4, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); }
    else { g.fillStyle = '#fff'; g.strokeStyle = RIM; g.lineWidth = 1.5; g.beginPath(); D.ell(g, ex, ey, 4.4, 4.8); g.fill(); g.stroke(); g.fillStyle = C.iris || '#E0A21A'; g.beginPath(); D.ell(g, ex - 0.8, ey + 0.4, 3, 3.5); g.fill();
      g.fillStyle = '#1A1A10'; g.beginPath(); D.ell(g, ex - 1, ey + 0.4, 1.2, 3); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - 2.2, ey - 1.8, 1.2, 0, TAU); g.fill(); }
    const fb = st === 'angry' ? 2 : 0; const brow = g => { g.moveTo(ex - 6, ey - 4 + fb * 0.5); g.quadraticCurveTo(ex, ey - 9 + fb, ex + 6, ey - 6); g.quadraticCurveTo(ex + 9, ey - 3.5, ex + 6.5, ey - 1.8); };
    g.strokeStyle = RIM; g.lineWidth = 3.8; g.beginPath(); brow(g); g.stroke(); g.strokeStyle = gold; g.lineWidth = 2.2; g.beginPath(); brow(g); g.stroke();
    if(S.eyeK){ g.restore(); g.save(); g.lineCap = 'round'; }
    if(S.gem !== false){ g.fillStyle = C.gem || '#E8473A'; g.strokeStyle = RIM; g.lineWidth = 1; g.beginPath(); g.moveTo(-27, -14); g.lineTo(-25, -11); g.lineTo(-27, -8.5); g.lineTo(-29, -11); g.closePath(); g.fill(); g.stroke(); }   // forehead gem
    g.restore(); }};
}
// ---------- 🐉 av-naga3 🧭 the BACK of the head (↖ ↗ going away): the same crest fan + crown as the front, seen from behind — no face, jade scales, a gold kranok ridge ----------
function nagaBack(S, C, Q, t){ const F = nagaFront(S, C, Q, t), gold = C.gold || '#F2C230', k = 0.58;
  F.parts.forEach((p, i) => { if(p.fill && typeof p.fill === 'function' && i === F.parts.length - (S.crown ? 2 : 1)) p.fill = g => D.lin(g, 0, -30 * k, 0, 34 * k, [C.a, C.d, fSh2(C.d, -0.25)]); });   // the skull: darker from behind
  return {parts: F.parts, details(g){ g.save(); g.scale(k, k); g.lineCap = 'round'; g.lineJoin = 'round';
    g.save(); g.beginPath(); g.moveTo(0, -30); g.bezierCurveTo(22, -31, 33, -18, 30, -2); g.bezierCurveTo(28, 12, 22, 24, 12, 31); g.quadraticCurveTo(0, 36, -12, 31); g.bezierCurveTo(-22, 24, -28, 12, -30, -2); g.bezierCurveTo(-33, -18, -22, -31, 0, -30); g.closePath(); g.clip();
    g.strokeStyle = D.rgba(gold, 0.85); g.lineWidth = 1.6; for(let r = 0; r < 5; r++) for(let c = -3; c <= 3; c++){ const x = c * 9 + (r % 2 ? 4.5 : 0), y = -20 + r * 11; g.beginPath(); g.arc(x, y, 5, 0.2, Math.PI - 0.2); g.stroke(); }   // scales
    g.fillStyle = D.rgba(gold, 0.9); g.beginPath(); g.moveTo(0, -30); for(let i = 0; i <= 6; i++){ const y = -30 + i * 10; g.lineTo(i % 2 ? 4.5 : 2, y); } g.lineTo(0, 34); for(let i = 6; i >= 0; i--){ const y = -30 + i * 10; g.lineTo(i % 2 ? -4.5 : -2, y); } g.closePath(); g.fill();   // kranok ridge down the back
    g.restore();
    [-1, 1].forEach(sx => { g.strokeStyle = RIM; g.lineWidth = 2.2; g.beginPath(); g.moveTo(sx * 24, 6); g.quadraticCurveTo(sx * 30, 16, sx * 22, 26); g.stroke(); });   // the jaw line just shows at the sides
    g.restore(); }};
}
const fSh2 = (h, f) => { const n = parseInt(String(h).replace('#', ''), 16), m = v => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)))); return '#' + [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => m(v).toString(16).padStart(2, '0')).join(''); };
// ---------- 🐉 the temple FRONT view (when it faces you: rise · roar · bow) — the av-lore5 picked head (N1), on the kit rig ----------
function nagaFront(S, C, Q, t){ const gold = C.gold || '#F2C230', tip = C.tip || '#FF8A2A', k = 0.58, parts = [];
  const KS = f => g => { g.save(); g.scale(k, k); f(g); g.restore(); };
  const n = 7; for(let i = 0; i < n; i++){ const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.4 + Math.sin(t * 2 + i) * 0.02, L = 44 * (1 - Math.abs(i - 3) * 0.09), ex = Math.cos(a) * L, ey = Math.sin(a) * L - 8, px = -Math.sin(a), py = Math.cos(a), w = 9;
    parts.push({path: KS(g => { g.moveTo(px * w, py * w - 8); g.quadraticCurveTo(ex * 0.6 + px * w * 1.4, ey * 0.6 + py * w * 1.4, ex, ey); g.quadraticCurveTo(ex * 0.82 - px * w * 0.9, ey * 0.82 - py * w * 0.9, ex * 0.86 - px * w * 0.2, ey * 0.86 - py * w * 0.2);
      g.quadraticCurveTo(ex * 0.5 - px * w * 0.8, ey * 0.5 - py * w * 0.8, -px * w, -py * w - 8); g.closePath(); }), fill: g => D.lin(g, 0, -8 * k, ex * k, ey * k, [gold, gold, tip])}); }
  [-1, 1].forEach(sx => parts.push({path: KS(g => { g.moveTo(sx * 26, -6); g.quadraticCurveTo(sx * 44, -4, sx * 46, 12); g.quadraticCurveTo(sx * 38, 6, sx * 34, 14); g.quadraticCurveTo(sx * 32, 4, sx * 22, 8); g.closePath(); }), fill: gold}));
  parts.push({path: KS(g => { g.moveTo(0, -30); g.bezierCurveTo(22, -31, 33, -18, 30, -2); g.bezierCurveTo(28, 12, 22, 24, 12, 31); g.quadraticCurveTo(0, 36, -12, 31); g.bezierCurveTo(-22, 24, -28, 12, -30, -2); g.bezierCurveTo(-33, -18, -22, -31, 0, -30); g.closePath(); }), fill: g => D.lin(g, 0, -30 * k, 0, 34 * k, [C.b, C.a, C.d])});
  if(S.crown) parts.push({path: KS(g => { g.translate(0, -28); g.moveTo(-16, 4); g.lineTo(16, 4); g.lineTo(13, -6); g.lineTo(-13, -6); g.closePath(); g.moveTo(-11, -6); g.lineTo(11, -6); g.lineTo(8, -16); g.lineTo(-8, -16); g.closePath();
      g.moveTo(-7, -16); g.lineTo(7, -16); g.lineTo(4, -26); g.lineTo(-4, -26); g.closePath(); g.moveTo(-4, -26); g.quadraticCurveTo(0, -30, 4, -26); g.lineTo(0, -44 - (S.crown > 1 ? 14 : 0)); g.closePath(); }), fill: gold});
  return {parts, details(g){ g.save(); g.scale(k, k); g.lineCap = 'round';
    g.fillStyle = D.rgba(C.c, 0.95); g.beginPath(); D.ell(g, 0, 20, 14, 10.5); g.fill(); g.fillStyle = RIM; [-5, 5].forEach(dx => { g.beginPath(); D.ell(g, dx, 17, 1.8, 1.3); g.fill(); });
    g.strokeStyle = RIM; g.lineWidth = 2; g.beginPath(); if(Q.jaw > 0.3){ g.fillStyle = '#7A2A2A'; D.ell(g, 0, 28, 6 + Q.jaw * 3, 3 + Q.jaw * 3); g.fill(); g.stroke(); } else { g.moveTo(-7, 26); g.quadraticCurveTo(0, 31, 7, 26); g.stroke(); }
    g.strokeStyle = D.rgba(C.d, 0.5); g.lineWidth = 1.2; [[0, -18], [-8, -22], [8, -22]].forEach(([cx, cy]) => { g.beginPath(); g.arc(cx, cy, 5, 0.3, Math.PI - 0.3); g.stroke(); });
    [-1, 1].forEach(sx => { const ex = sx * 13, ey = -4;
      if(Q.eye === 'shut' || Q.eye === 'happy'){ g.strokeStyle = RIM; g.lineWidth = 2.6; g.beginPath(); Q.eye === 'happy' ? g.arc(ex, ey + 3, 6, Math.PI * 1.1, Math.PI * 1.9) : g.arc(ex, ey - 2, 6, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); }
      else { g.fillStyle = '#fff'; g.strokeStyle = RIM; g.lineWidth = 2; g.beginPath(); D.ell(g, ex, ey, 7.5, 8.5); g.fill(); g.stroke(); g.fillStyle = C.iris || '#E0A21A'; g.beginPath(); D.ell(g, ex + sx * 0.5, ey + 1, 5, 6); g.fill();
        g.fillStyle = '#1A1A10'; g.beginPath(); D.ell(g, ex + sx * 0.5, ey + 1, 2, 5); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - 2, ey - 3, 2, 0, TAU); g.fill(); }
      const fb = Q.eye === 'angry' ? 3 : 0; g.strokeStyle = RIM; g.lineWidth = 5.4; const br = g => { g.moveTo(ex - sx * 8, ey - 10 + fb * -1); g.quadraticCurveTo(ex + sx * 4, ey - 15 + fb, ex + sx * 12, ey - 10); g.quadraticCurveTo(ex + sx * 16, ey - 6, ex + sx * 12, ey - 3); };
      g.beginPath(); br(g); g.stroke(); g.strokeStyle = gold; g.lineWidth = 3.4; g.beginPath(); br(g); g.stroke();
      const lp = g => { g.moveTo(sx * 9, 25); g.quadraticCurveTo(sx * 18, 24, sx * 20, 16); g.quadraticCurveTo(sx * 21, 10, sx * 16, 11); }; g.strokeStyle = RIM; g.lineWidth = 5.5; g.beginPath(); lp(g); g.stroke(); g.strokeStyle = gold; g.lineWidth = 3.2; g.beginPath(); lp(g); g.stroke(); });
    g.fillStyle = C.gem || '#E8473A'; g.strokeStyle = RIM; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -27); g.lineTo(5, -21); g.lineTo(0, -15); g.lineTo(-5, -21); g.closePath(); g.fill(); g.stroke();
    if(S.crown){ g.fillStyle = '#E8473A'; g.beginPath(); g.arc(0, -29, 2.6, 0, TAU); g.fill(); g.fillStyle = '#2F9BD8'; g.beginPath(); g.arc(0, -39, 2, 0, TAU); g.fill(); }
    g.restore(); }};
}
// ---------- 🐍 eel head (facing left) — blunt, round eye, fin frill, long mouth line · 'swamp' = plain (no frill) ----------
function eelHead(S, C, jaw, t){ const parts = [];
  if(S.head === 'eel') parts.push({path: g => { const w = Math.sin(t * 3) * 0.8; g.moveTo(-10, -12); g.quadraticCurveTo(-2, -22 + w, 12, -21 + w); g.quadraticCurveTo(8, -15, 10, -9); g.lineTo(2, -9); g.closePath(); }, fill: C.fin || C.c});
  if(S.head !== 'swamp') parts.push({path: g => { const w = Math.sin(t * 5) * 1.5; g.moveTo(3, 2); g.quadraticCurveTo(10, 4 + w, 13, 11 + w); g.quadraticCurveTo(6, 11, 1, 7); g.closePath(); }, fill: C.fin || C.c});   // small pectoral fin (eels are fish!) · 🐍 av-naga2: a swamp eel has NONE (true science: Monopterus lost its side fins)
  parts.push({path: g => { g.moveTo(-6, 4); g.lineTo(-30, 4); g.quadraticCurveTo(-31, 7, -28, 8.5); g.lineTo(-6, 10); g.closePath(); }, fill: '#7A2A22'});
  parts.push({path: g => T(g, -5, 4, -jaw * 0.42, g => { g.moveTo(0, 0); g.lineTo(-25, 0); g.quadraticCurveTo(-28, 1, -27, 3.5); g.quadraticCurveTo(-18, 7, 0, 7); g.closePath(); }), fill: g => D.lin(g, 0, 3, 0, 12, [C.c, C.c2 || '#C8A858'])});
  parts.push({path: g => { g.moveTo(6, -10); g.quadraticCurveTo(-8, -15, -22, -11); g.quadraticCurveTo(-32, -8, -34, -1); g.quadraticCurveTo(-35, 4, -30, 4.5); g.lineTo(-4, 5); g.quadraticCurveTo(7, 6, 7, -2); g.closePath(); }, fill: g => D.lin(g, 0, -15, 0, 6, [C.b, C.a, C.a])});
  return {parts, details(g){ g.save(); g.lineCap = 'round';
    if(S.spots){ g.fillStyle = D.rgba(C.d, 0.7); [[-14, -9, 2], [-6, -8, 1.6], [-20, -7, 1.3], [1, -6, 1.8]].forEach(([x, y, r]) => { g.beginPath(); D.ell(g, x, y, r * 1.2, r); g.fill(); }); }
    g.strokeStyle = D.rgba(C.d, 0.7); g.lineWidth = 1.3; g.beginPath(); g.moveTo(-3, -5); g.quadraticCurveTo(-6, 0, -3, 4); g.stroke();   // gill slit
    g.fillStyle = RIM; g.beginPath(); D.ell(g, -32, -3, 1, 0.8); g.fill();
    const ex = -23, ey = -5; if(S.eyeK){ g.translate(ex, ey); g.scale(S.eyeK, S.eyeK); g.translate(-ex, -ey); } g.fillStyle = '#fff'; g.strokeStyle = RIM; g.lineWidth = 1.4; g.beginPath(); g.arc(ex, ey, 3.6, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = C.iris || '#E8C040'; g.beginPath(); g.arc(ex - 0.6, ey + 0.3, 2.4, 0, TAU); g.fill(); g.fillStyle = '#1A1A10'; g.beginPath(); g.arc(ex - 0.8, ey + 0.3, 1.3, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - 1.8, ey - 1.2, 0.9, 0, TAU); g.fill();
    g.restore(); }};
}
/* ---------- 🐍 av-naga2 roll-out: 🐉 multi-head fork rig · 🪑 rider point · 🥚 baby extras (on top of plan_serpent, which stays as it is) ----------
   🧠 Temple nagas (av-lore5 N1): the necks rise side by side from ONE chest and fan out like a cobra hood — EVERY head faces the way the main head
   faces (Aowu 2026-11-20 22:00 changed N1's "side heads look outward": in profile all look left, in front all face you). A real body: each extra neck is the same chain as the main neck, a beat later
   (follow-through per joint, Aowu 17:13) — the outer necks are lighter, so they answer later and swing a little further.
   Shape: heads (1 · 3 · 7 · 9) · forkAt (where the necks split, share of the raised neck) · fan (how wide) · headCols (one element per side neck,
          'grey' = a bite head, mouth open, no fangs) · aura (glow colour) · lotus (petals at the base) · dome (barrier dome) · rideAt · egg. */
const SEA_EL = {grey: {a: '#9A9AAA', b: '#DADAE4', c: '#4E4E5E', d: '#F2F2F6'}};
function sideCols(C, el){ const E = SEA_EL[el] || EL[el]; if(!E) return C; return Object.assign({}, C, {a: E.a, b: E.b, d: E.c, iris: el === 'grey' ? '#E8E8F0' : C.iris, gem: E.a}); }
function plan_serpentM(S, P, C, t){
  const R = plan_serpent(S, P, C, t), A = R.A, pts = A.spine, N = pts.length, sr = S.neck || 0.46, L = S.len || 170, Hr = S.hr || 58, RR = S.r || 11;
  // 🪑 rider point (river ride): the top of the back just behind the raised neck — x · y · angle of the back · body radius there (the rider rides the rig: it moves + tilts with that spot)
  { const f = sClamp(sr + (S.rideAt == null ? 0.2 : S.rideAt), 0, 0.92) * (N - 1), i = Math.min(N - 3, Math.floor(f)), u = f - i, p = pts[i], q = pts[i + 1], q2 = pts[i + 2];
    const x = lerp(p.x - p.bx * p.r, q.x - q.bx * q.r, u), y = lerp(p.y - p.by * p.r, q.y - q.by * q.r, u), ang = Math.atan2(q2.y - p.y, q2.x - p.x);
    A.ride = [x, y, sClamp(ang, -0.6, 0.6), lerp(p.r, q.r, u)]; }
  const n = S.heads || 1, at = S._at;
  if(n <= 1 && !S.egg && !S.lotus) return R;
  const BACK = !!A.isBack, VS = A.vsd == null ? 1 : A.vsd;   // 🧭 av-naga3: ↖ going away = the hood seen from behind: the near (R) side is on the LEFT (edge-on half way)
  const Q0 = sPose(at ? at(0) : P), sink = sClamp(Q0.sink * 1.15, 0, 1), LOOK = BACK ? 0 : sClamp(Math.max(Q0.look, A.lookFloor || 0), 0, 1), FRONT = !BACK && LOOK > 0.5, TURN = Math.max(0.58, Math.abs(Math.cos(LOOK * Math.PI)));   // = the main head's own switch (plan_serpent)
  const pAt = sp => { const f = sClamp(sp, 0, 1) * (N - 1), i = Math.min(N - 2, Math.floor(f)), u = f - i, a = pts[i], b = pts[i + 1]; return {x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), r: lerp(a.r, b.r, u), wy: lerp(a.wy, b.wy, u)}; };
  // the side necks: m per side, outermost painted first (furthest back)
  const m = (n - 1) >> 1, sf = sr * (S.forkAt || 0.5), NECKS = [];
  if(n > 1){ const open = (1 + 0.22 * Q0.glow + 0.25 * Math.max(0, Q0.up) - 0.3 * Q0.coil + 0.12 * Q0.look) * (1 - sink), Rf = Hr * (S.fan || 1);
    // 🪭 av-naga3: the hood FOLDS IN when it strikes, bows or falls forward (a cobra's hood closes to strike) — the side heads draw in round the main neck and open again standing tall
    const FOLD = 1 - 0.72 * sStep(sClamp(Math.max(0, Q0.reach) * 0.9 + Math.max(0, Q0.bow) * 0.75 + Math.max(0, Q0.down - 0.1) * 0.8 + Math.max(0, Q0.go) * 0.25, 0, 1));
    // 🧅 ONE RIG + ONE LAYER PER HEAD (Aowu 22:04): heads are named by side + step out — L1 L2 … (screen left) · R1 R2 … (screen right) · M = the main head + body.
    //    Painted back → front: L4 … L1 (behind the main) · M (the middle) · R1 … R4 (in front) → 7 heads = 7 layers, 9 heads = 9 layers (A.layers lists them).
    //    shape.rig[id] = {lag, spread, lift, size, tilt} tunes ONE neck · draw o.heads[id] = {act, ms} | {pose} | {jaw, eye, …} drives ONE head · o.layer = id paints only that layer.
    for(let k = m; k >= 1; k--) [1, -1].forEach(side => {
      const id = (side < 0 ? 'L' : 'R') + k, RG = Object.assign({lag: 55 * k + (side > 0 ? 25 : 0), spread: 1, lift: 0, size: 1, tilt: 0}, (S.rig || {})[id] || {}), HC = (S._heads || {})[id] || null;
      const Qown = HC ? sPose(HC.act ? sample(HC.act, HC.ms || 0).pose : HC.pose ? poseOf(HC.pose) : Object.assign({}, Q0, HC)) : null;
      const j = NECKS.length, el = S.headCols ? S.headCols[(side < 0 ? 0 : m) + k - 1] : null;
      // 🪭 the hood fan: heads side by side in an arc round the middle head, the outer ones a little lower + smaller
      // 🪭 the hood fan: heads round the middle head on an arc (the outer ones lower + smaller), like the fingers of a hand
      const ph = (k / m) * (m > 1 ? 1.3 : 0.8) * (0.75 + 0.25 * open);
      let ox = VS * side * Rf * (m > 1 ? 1.02 : 0.8) * Math.sin(ph) * (side > 0 ? 0.92 : 1) * RG.spread * FOLD, oy = (Rf * 0.7 * (1 - Math.cos(ph)) - Rf * 0.06 * (m > 1 ? 1 : 0)) * FOLD + RG.lift * Hr;
      // ⛓️ follow-through (av-naga3 🦴): the joints ② ③ ④ of this neck = the main neck at the same heights AS IT WAS one beat (its lag) ago — the main neck already
      //    moves joint by joint (mass lag), so each side neck inherits that follow-through AND stays one shape (mixing joints from different moments folded it = kinks + flicks).
      //    Its own act (one head bites while the rest keep guard) = the main neck's shape in THAT pose, moved fully (× 1.25 at the head).
      const NA = A.neckAt, RAWF = A.rawAt, base = RAWF || (() => Q0), pfOwn = HC ? (HC.act ? (d => sPose(sample(HC.act, (HC.ms || 0) - d).pose)) : HC.pose ? (() => sPose(poseOf(HC.pose))) : (() => Qown)) : null;
      // 7 samples up the neck (u 0 = ① stomach → 1 = ④ head); the 4 named rig joints are u 0 · 0.38 · 0.7 · 1 (s = sf · 0.62 sf · 0.3 sf · 0) — 7 so a bent main neck copies smoothly (4 made a sharp elbow)
      const UJ = [0, 0.18, 0.38, 0.54, 0.7, 0.85, 1], RJ = [0, 2, 4, 6], SJ = UJ.map(u => sf * (1 - u)), pw = (u, Y) => { const X = [0, 0.38, 0.7, 1]; for(let i = 1; i < 4; i++) if(u <= X[i]){ const f = (u - X[i - 1]) / (X[i] - X[i - 1]); return Y[i - 1] + (Y[i] - Y[i - 1]) * f; } return Y[3]; };
      const EJ = UJ.map(u => pw(u, [0, 0.2, 0.58, 1])), EYJ = UJ.map(u => pw(u, [0, 0.45, 0.85, 1])), NQ = UJ.length - 1, DL = SJ.map((sj, q) => { if(!NA || q === 0 || !(RAWF || pfOwn)) return [0, 0];
        const pf = pfOwn || (d => RAWF(d + RG.lag)), a = NA(sj, pf), b = NA(sj, base), w = pfOwn ? (q === NQ ? 1.25 : 1) : 0.8; return [(a[0] - b[0]) * w, (a[1] - b[1]) * w]; });
      { const XR = Qown ? 1.9 : 1.5, tx = sClamp(ox + DL[NQ][0], -Rf * XR, Rf * XR), ty = sClamp(oy + DL[NQ][1], -Rf * 0.6, Rf * (0.45 + 0.08 * k + (Qown ? 0.4 : 0)));   /* the trail never drops a head below the fan (it read as a broken neck) */
        const fx = (tx - ox) / (DL[NQ][0] || 1e-9), fy = (ty - oy) / (DL[NQ][1] || 1e-9), hx0 = Math.abs(DL[NQ][0]) > 1e-6, hy0 = Math.abs(DL[NQ][1]) > 1e-6; DL.forEach((dq, q) => { if(!q) return; dq[0] *= hx0 ? sClamp(fx, 0, 1) : 1; dq[1] *= hy0 ? sClamp(fy, 0, 1) : 1; }); }   // a clamped head pulls its whole chain back the same share (no fold)
      ox += Math.sin(t * 1.3 + k * 1.1 + side) * Hr * 0.025; oy += Math.cos(t * 1.1 + k * 0.7) * Hr * 0.02;
      // 🦴 4 RIGS per head (Aowu 22:14): ① stomach (the root, on the main body LOWER than the chest) → ② centre body → ③ neck → ④ head.
      //    Each joint = the main spine at its own height + this head's offset growing outward (0 · 0.2 · 0.58 · 1), and each one plays the act a little
      //    later than the one before it (follow-through joint by joint: lag × 0 · ⅓ · ⅔ · 1). A smooth line runs through the 4 joints.
      const J = [];
      SJ.forEach((sj, q) => { const b = q === NQ ? {x: pts[0].x, y: pts[0].y, r: pts[0].r, wy: pts[0].wy} : pAt(sj); const jx = b.x + ox * EJ[q] + DL[q][0] + (q < NQ ? VS * side * b.r * 0.55 * (1 - EJ[q]) : 0), jy = b.y + oy * (oy > 0 ? EYJ[q] : EJ[q]) + DL[q][1];   /* av-naga3: a LOWER outer head lowers its upper neck too (③ rose past the head and hooked back down = R4's broken look) */
        J.push({x: jx, y: jy, r: b.r, wy: b.wy}); });
      const F = J[0], Hx = J[NQ].x, Hy = J[NQ].y, M = 18, np = [];
      const cr = (p0, p1, p2, p3, u) => { const u2 = u * u, u3 = u2 * u; return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3); };
      const JJ = [{x: J[0].x, y: J[0].y + 30}].concat(J, [{x: J[NQ].x + (J[NQ].x - J[NQ - 1].x) * 0.5, y: J[NQ].y + (J[NQ].y - J[NQ - 1].y) * 0.5}]);   // a ghost joint below the root + past the head
      for(let i = 0; i <= M; i++){ const v = i / M, f = v * NQ, seg = Math.min(NQ - 1, Math.floor(f)), u = f - seg, a0 = JJ[seg], a1 = JJ[seg + 1], a2 = JJ[seg + 2], a3 = JJ[seg + 3];
        np.push({x: cr(a0.x, a1.x, a2.x, a3.x, u), y: cr(a0.y, a1.y, a2.y, a3.y, u), r: F.r * lerp(1, 0.62, Math.pow(v, 0.8)) * (S.sideR || 1), wy: F.wy + (Hy - F.y) * v, v}); }
      np.forEach((p, i) => { const a = np[Math.max(0, i - 1)], b = np[Math.min(M, i + 1)]; let nx = b.y - a.y, ny = -(b.x - a.x); const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l; p.bx = nx; p.by = ny; });   /* av-naga3 🔎 belly = ALWAYS the front side of the up-going neck (like the main neck) — the old "keep it pointing down" test flipped it frame to frame = the flicks */
      const h = np[M], h2 = np[M - 3], dir = Math.atan2(h.y - h2.y, h.x - h2.x);
      // 🧭 every head faces the SAME way as the main head (Aowu 22:00: a back head looking the other way reads wrong) — profile: all look left, held fairly level (outer ones dip a little) · front: all face you, the outer ones tip outward a little (a temple fan)
      // av-naga3 🔎 the head sits like the MAIN head (A.hang) + a small lean from its own neck (0 = upright, clamped) — measuring from "facing left" tipped a back-leaning neck's head nose-up (R4 in surface)
      const aUp = Math.atan2(h.x - h2.x, -(h.y - h2.y)), angP = sClamp((A.hang || 0) * 0.85 + sClamp(aUp, -0.8, 0.8) * 0.15 - 0.03 * k, -0.5, 0.5), wF = sStep(sClamp((LOOK - 0.3) / 0.4, 0, 1));   // ③ profile → front eases (no snap)
      const ang = BACK ? -side * 0.06 * k + RG.tilt : lerp(angP, side * 0.07 * k, wF) + RG.tilt + (Qown ? Qown.head * 0.6 : 0);
      const Cj = sideCols(C, el), jaw = Qown ? Math.max(Qown.jaw, el === 'grey' ? 0.5 : 0) : el === 'grey' ? 0.75 : Math.max(Q0.jaw * 0.8, 0.05 + 0.05 * Math.sin(t * 2 + j));
      const Sh = Object.assign({}, S, {crown: 0, crest: 3, crestK: 0.9}), hk = (RR / 11) * (S.headK || 1) * (m > 1 ? 0.76 - 0.035 * k : 0.82) * RG.size;
      const Qj = Object.assign({}, Q0, {eye: Qown ? Qown.eye : el === 'grey' ? 'angry' : Q0.eye});
      NECKS.push({id, rig: RG, joints: RJ.map(q => [J[q].x, J[q].y]), own: !!Qown, lag: RG.lag, np, side, k, Cj, hd: BACK ? nagaBack(Sh, Cj, Qj, t + j * 0.37) : FRONT ? nagaFront(Sh, Cj, Object.assign(Qj, {glow: 0}), t + j * 0.37) : nagaSide(Sh, Cj, jaw, Qj, t + j * 0.37), h, ang, hk, el}); }); }
  const NL = NECKS.filter(N1 => N1.side < 0).sort((a, b) => b.k - a.k), NR = NECKS.filter(N1 => N1.side > 0).sort((a, b) => a.k - b.k);   // 🧅 paint order: L4 … L1 · M · R1 … R4
  if(S.dome) A.dome = [pAt(sr * 0.6).x, L * 0.62, A.H * 1.05];
  if(NECKS.length){ A.fork = [pAt(sf).x, pAt(sf).y]; A.necks = NECKS.map(N1 => ({id: N1.id, layer: N1.side < 0 ? NL.indexOf(N1) + 1 : NL.length + 2 + NR.indexOf(N1), head: [N1.h.x, N1.h.y], side: N1.side, k: N1.k, lag: N1.lag, own: N1.own, el: N1.el, joints: N1.joints, pts: N1.np.map(p => [p.x, p.y]), nrm: N1.np.map(p => [p.bx, p.by]), ang: N1.ang})); A.layers = NL.map(N1 => N1.id).concat('M', NR.map(N1 => N1.id)); }   /* 🎯 every head is its own target (hit boxes, pick-a-head fights) */
  return {parts: [], A, details(g){
    const ring = (g, np, w) => { g.moveTo(np[0].x - np[0].bx * np[0].r * w, np[0].y - np[0].by * np[0].r * w); np.forEach(p => g.lineTo(p.x - p.bx * p.r * w, p.y - p.by * p.r * w));
      for(let i = np.length - 1; i >= 0; i--){ const p = np[i]; g.lineTo(p.x + p.bx * p.r * w, p.y + p.by * p.r * w); } g.closePath(); const e = np[np.length - 1]; g.moveTo(e.x + e.r * w, e.y); g.arc(e.x, e.y, e.r * w, 0, TAU); };
    const HJ = (g, N1, f) => T(g, N1.h.x, N1.h.y, N1.ang, g => { g.scale(N1.hk * TURN, N1.hk); f(g); });   // the same squeeze as the main head while it turns
    // ✨ awakened glow BEHIND the heads (soft, never washes the faces out)
    const only0 = S._layer && S._layer !== 'M';
    if(S.aura && !S.noFx && !only0){ const hs = [A.head].concat(NECKS.map(N1 => [N1.h.x, N1.h.y])); hs.forEach(h => D.glow(g, h[0], h[1] - 4, 22, S.aura, 0.16 + 0.05 * Math.sin(t * 3))); }
    // 🪷 lotus petals round the base (✦✦✦ Prime) — 2 rows, behind the body
    if(S.lotus && !only0){ const b = pAt(sr + 0.04); g.save(); [[11, 2.7, 1.9, 0], [9, 2.1, 1.5, 0.17]].forEach(([n2, rx, ph, off]) => { for(let i = 0; i < n2; i++){ const a = Math.PI * (0.06 + 0.88 * (i + off * 3) / (n2 - 1 + off * 6)), px = b.x + Math.cos(a) * RR * rx * 1.25, py = b.y + 3 - Math.sin(a) * RR * rx * 0.32, PR = RR * ph * 0.8;
        g.save(); g.translate(px, py); g.rotate((a - Math.PI / 2) * 0.7); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-PR * 0.55, -PR * 0.8, 0, -PR * 1.5); g.quadraticCurveTo(PR * 0.55, -PR * 0.8, 0, 0); const RR0 = RR, RRs = PR / 1.5;
        g.fillStyle = D.lin(g, 0, 0, 0, -PR * 1.5, ['#F08AB4', '#FFD0E4', '#FFFFFF']); g.strokeStyle = RIM; g.lineWidth = 1.6; g.fill(); g.stroke(); g.strokeStyle = D.rgba('#D0608A', 0.55); g.lineWidth = 0.9; g.beginPath(); g.moveTo(0, -PR * 0.2); g.lineTo(0, -PR * 1.15); g.stroke(); g.restore(); } }); g.restore(); }
    // 🧅 one LAYER per head, back → front (A.layers): each layer = its own rim, neck, head — so every head stays readable and can be moved alone
    // 🎨 blended root (Aowu 22:14 "like a piece stuck to it"): the rim stops before the stomach, the neck starts in the BODY colours and turns into its element colour
    const hexA = h => { const n = parseInt(String(h).slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }, mixC = (a, b, t) => { if(a[0] !== '#' || b[0] !== '#') return t < 0.5 ? a : b; const A1 = hexA(a), B1 = hexA(b); return '#' + A1.map((v, i) => Math.round(v + (B1[i] - v) * t).toString(16).padStart(2, '0')).join(''); };   // hex, so D.rgba can read it
    const only = S._layer || null, paintNeck = N1 => { const Cj = N1.Cj, np = N1.np, R0 = np[0], ct = v => sClamp((v - 0.12) / 0.4, 0, 1); g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
        // rim: everywhere except round the root (an even-odd hole), so the neck melts into the body
        g.save(); g.beginPath(); g.rect(-4000, -4000, 8000, 8000); g.arc(R0.x, R0.y, R0.r * 2.1, 0, TAU, true); g.clip('evenodd');
        g.strokeStyle = RIM; g.fillStyle = RIM; g.lineWidth = 3.8; g.beginPath(); ring(g, np, 1); g.stroke(); g.restore();
        g.strokeStyle = RIM; g.fillStyle = RIM; g.lineWidth = 3.8; N1.hd.parts.forEach(p => { g.beginPath(); HJ(g, N1, p.path); g.stroke(); g.fill(); });
        g.save(); g.beginPath(); ring(g, np, 1); const gr = g.createLinearGradient(R0.x, R0.y, N1.h.x, N1.h.y); gr.addColorStop(0, C.a); gr.addColorStop(0.18, C.a); gr.addColorStop(0.55, Cj.a); gr.addColorStop(1, Cj.a); g.fillStyle = gr; g.fill(); g.clip();
        const lw = (off, k, cA, cB, al) => { for(let i = 1; i < np.length; i++){ const p = np[i - 1], q = np[i]; g.strokeStyle = D.rgba(mixC(cA, cB, ct(q.v)), al); g.lineWidth = (p.r + q.r) / 2 * k; g.beginPath(); g.moveTo(p.x + p.bx * p.r * off, p.y + p.by * p.r * off); g.lineTo(q.x + q.bx * q.r * off, q.y + q.by * q.r * off); g.stroke(); } };
        lw(-0.7, 0.66, C.d, Cj.d, 0.55); lw(-0.25, 0.34, C.b, Cj.b, 0.6); lw(0.84, 0.5, C.c, Cj.c, BACK ? 0.14 : 1);   /* 🧭 ↖ from behind: no belly band */
        if(S.scales === 'gold') np.forEach((p, i) => { if(i % 2 || i === np.length - 1) return; g.strokeStyle = D.rgba(Cj.gold || '#F2C230', 0.8); g.lineWidth = Math.max(0.7, p.r * 0.06); g.beginPath(); g.arc(p.x - p.bx * p.r * 0.3, p.y - p.by * p.r * 0.3, p.r * 0.27, 0, Math.PI); g.stroke(); });
        g.restore();
        N1.hd.parts.forEach(p => { g.beginPath(); HJ(g, N1, p.path); g.fillStyle = typeof p.fill === 'function' ? p.fill(g) : p.fill; g.fill(); });
        HJ(g, N1, g => N1.hd.details(g)); g.restore(); };
    NL.forEach(N1 => { if(!only || only === N1.id) paintNeck(N1); });
    if(!only || only === 'M'){
      if(NL.length && !only){
        // a dark line where the main neck crosses in front of the side necks (it is nearer)
      g.save(); g.strokeStyle = RIM; g.lineWidth = 3.8; g.lineJoin = 'round'; g.beginPath(); const mp = pts.filter(p => p.s <= sf + 0.04);
      mp.forEach((p, i) => i ? g.lineTo(p.x - p.bx * p.r, p.y - p.by * p.r) : g.moveTo(p.x - p.bx * p.r, p.y - p.by * p.r)); for(let i = mp.length - 1; i >= 0; i--){ const p = mp[i]; g.lineTo(p.x + p.bx * p.r, p.y + p.by * p.r); } g.closePath(); g.stroke(); g.restore(); }
      R.details(g, BACK && R.nearAny ? 'far' : undefined); }
    NR.forEach(N1 => { if(!only || only === N1.id) paintNeck(N1); });
    if(BACK && R.nearAny && (!only || only === 'M')) R.details(g, 'near');   // 🧭 ↖ the tail swims TOWARD you: it paints over the necks
    if(only && only !== 'M') return;
    // 🥚 a hatchling still wears half its eggshell on the tail
    if(S.egg){ const e = pts[N - 1], e2 = pts[N - 4], a = Math.atan2(e.y - e2.y, e.x - e2.x), r = RR * 1.9; T(g, e.x - Math.cos(a) * r * 0.2, e.y - Math.sin(a) * r * 0.2, a - Math.PI / 2, g => {
      g.beginPath(); g.moveTo(-r, -r * 0.2); g.lineTo(-r * 0.6, -r * 0.55); g.lineTo(-r * 0.25, -r * 0.15); g.lineTo(r * 0.15, -r * 0.6); g.lineTo(r * 0.5, -r * 0.2); g.lineTo(r, -r * 0.5); g.quadraticCurveTo(r * 1.15, r * 0.8, 0, r * 1.05); g.quadraticCurveTo(-r * 1.15, r * 0.8, -r, -r * 0.2); g.closePath();
      g.fillStyle = D.lin(g, 0, -r, 0, r, ['#FFFFFF', '#F4ECD8', '#D8C8A8']); g.strokeStyle = RIM; g.lineWidth = 1.9; g.fill(); g.stroke();
      g.fillStyle = D.rgba('#7AC8A0', 0.6); [[-0.4, 0.3, 0.16], [0.35, 0.5, 0.12], [0, 0.75, 0.1]].forEach(([x, y, s]) => { g.beginPath(); g.arc(x * r, y * r, s * r, 0, TAU); g.fill(); }); }); }
    // 🫧 the ✦✦✦ barrier dome is a scene effect (soft, no rim): the kit only gives where it goes → A.dome = [centre x, half width, height]
  }};
}
// 🫧 gulp (swamp eel, true science: it breathes AIR — the head rises to the top, the mouth opens wide, gulps, the cheeks fill) · lunge / sSwim work for every serpent
Object.assign(POSES, {sGulpUp: {up: 0.4, head: 0.5, jaw: 0.15}, sGulp: {up: 0.55, head: 0.7, jaw: 1}, sGulpS: {up: 0.06, head: 0.1, jaw: 0, sy: 1.05, eye: 'happy'}, sRide: {down: 0.42, wave: 1}});
ACTS.gulp = [{name: 'ready', pose: 'idle', ms: 100}, {name: 'anticipation', pose: 'sGulpUp', ms: 320, ease: 'cubicOut'}, {name: 'contact', pose: 'sGulp', ms: 150, contact: true, stop: 60, ease: 'cubicIn'},
             {name: 'follow-through', pose: 'sGulpS', ms: 380, ease: 'backOut'}, {name: 'settle', pose: 'idle', ms: 480, ease: 'sineOut'}];
/* ---------- 🐟 fish family (av-naga2, Avateer plan §23c N4 · 🧳 Avateer Development chat 2026-11-20) — Glidray · Mudhopper · Bettaflare … ----------
   🧠 How real ones move (studied first): most fish swim with the BACK half — the front hardly moves, the bend grows toward the tail and the tail fin
   flicks a beat after the body (follow-through) · rays "fly": a wave runs front → back along the wing edges (rajiform) · mudskippers walk on mud on
   their chest fins like crutches, flick the tail to jump, and keep their goggle eyes on top (they roll them down into a wet cup to blink) ·
   bettas hover with fast little chest fins, their long fins flow AFTER the body, and a male FLARES: gill covers out + every fin spread.
   🛠️ Drawn like the serpent: a 3D spine (x forward · y up · z toward you → screen y + z × TILT), one dark rim, far fins first.
   Shape: {L, H, lift, tail: fork | round | flow, dorsal: on | tall | flow | off, anal: flow, pect: small | legs | flow, eyes: side | top, ray, spots, stripes, shine}
   Pose fields (fish only, 0 = rest): swim · flare · wing · fly · curl · gulp. Shared acts work too (lean ± → dash / back off). */
Object.assign(P0, {swim: 0, flare: 0, wing: 0, fly: 0, curl: 0, gulp: 0});
Object.assign(FAM, {fish: {icon: '🐟', name: 'Fish'}});
Object.assign(POSES, {
  fSwim:   {swim: 1},
  fPuff:   {flare: 0.3, swim: 0.2, jaw: 0.2, eye: 'angry', lean: -0.15},
  fFlare:  {flare: 1, jaw: 0.35, eye: 'angry', sy: 1.04},
  fFlapUp: {wing: 0.32, fly: 0.12},   /* 🪽 a ray is a CALM swimmer (Aowu 22:00): small lift, soft press, long glide */
  fFlapDn: {wing: -0.26, fly: 0.38, lean: 0.05},
  fGlide:  {wing: -0.04, fly: 0.28, lean: 0.03},
  fCrouch: {curl: 1, y: 2, sy: 0.9, sx: 1.06},
  fFlick:  {curl: -0.7, y: -10, sy: 1.08, sx: 0.94, rot: -0.15},
  fHop:    {curl: -0.2, y: -34, rot: -0.1, jaw: 0.3, eye: 'happy'},
  fLand:   {curl: 0.2, y: 1, sy: 0.84, sx: 1.12},
  fGulp:   {gulp: 1, y: -4, rot: -0.25},
});
Object.assign(ACTS, {
  // 🐸 mudskipper hop: tail curls round to the side (the warning) → FLICK → up in an arc → lands with a squash → settles
  hop:   [{name: 'anticipation', pose: 'fCrouch', ms: 260, ease: 'cubicOut'}, {name: 'contact', pose: 'fFlick', ms: 110, contact: true, stop: 40, ease: 'cubicIn'},
          {name: 'follow-through', pose: 'fHop', ms: 300, ease: 'sineOut'}, {name: 'land', pose: 'fLand', ms: 150, ease: 'cubicIn'}, {name: 'settle', pose: 'idle', ms: 300, ease: 'backOut'}],
  // 🐟 betta flare: fins fold + gills puff → FLARE (every fin spread, gill frill out, colours light up) → holds it → relaxes
  flare: [{name: 'ready', pose: 'idle', ms: 100}, {name: 'anticipation', pose: 'fPuff', ms: 320, ease: 'cubicOut'}, {name: 'contact', pose: 'fFlare', ms: 150, contact: true, stop: 120, ease: 'cubicIn'},
          {name: 'follow-through', pose: 'fFlare', ms: 620}, {name: 'settle', pose: 'idle', ms: 560, ease: 'sineOut'}],
  // 🪽 ray glide: wings lift (the warning) → PRESS down (the push) → glides forward, wings flat → settles
  glide: [{name: 'ready', pose: 'idle', ms: 120}, {name: 'anticipation', pose: 'fFlapUp', ms: 460, ease: 'sineOut'}, {name: 'contact', pose: 'fFlapDn', ms: 280, contact: true, ease: 'sineIn'},
          {name: 'follow-through', pose: 'fGlide', ms: 900, ease: 'sineOut'}, {name: 'settle', pose: 'idle', ms: 800, ease: 'sineInOut'}],
});
const FISH = {TILT: 0.42};
function fSh(h, f){ const n = parseInt(String(h).replace('#', ''), 16), m = v => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)))); return 'rgb(' + m(n >> 16 & 255) + ',' + m(n >> 8 & 255) + ',' + m(n & 255) + ')'; }
function fPose(Q){ Q = poseOf(Q); if(Q.fl || Q.bl) Q.swim = Math.max(Q.swim, 1); return Q; }
function plan_fish(S, P, C, t){ const Q = fPose(P), R = S.ray ? fishRay(S, Q, C, t) : fishBody(S, Q, C, t); return S._view ? fishTurn(R, S._view, S) : R; }
// 🧭 av-naga3 4 main views for fish = a "turned card" (the fish are side outlines): ↙ toward you = foreshortened, head end DOWN + the far eye peeks over the snout ·
//    ↖ going away = foreshortened, head end UP, a darker back shows, the eye half hidden · 🪽 a ray (seen from above) just turns on the ground plane
function fishTurn(R, V, S){ const sw = V === 'SW'; let M;
  if(S.ray){ const ph = sw ? -0.55 : 0.55, c = Math.cos(ph), s = Math.sin(ph), q = 0.82; M = g => g.transform(c, s * q, -s, c * q, 0, 0); }
  else { const a = 0.82, b = sw ? -0.13 : 0.13; M = g => g.transform(a, b, 0, 1, 0, 0); }
  const wrap = f => g => { g.save(); M(g); f(g); g.restore(); }, mt = p => { const c = document.createElement('canvas').getContext('2d'); M(c); const m = c.getTransform(); return [m.a * p[0] + m.c * p[1] + m.e, m.b * p[0] + m.d * p[1] + m.f]; };
  const parts = R.parts.map(p => Object.assign({}, p, {path: wrap(p.path), fill: typeof p.fill === 'function' ? wrap0(p.fill, M) : p.fill}));
  const A = Object.assign({}, R.A); ['top', 'head', 'back', 'hand', 'belly', 'tail'].forEach(k => { if(A[k]) A[k] = mt(A[k]).concat(A[k].slice(2)); }); A.view = V;
  const E = R.A._eye;
  return {parts, A, details: g => { g.save(); M(g); R.details(g);
    if(!S.ray && E && S.eyes !== 'top'){ const [ex, ey, er] = E;
      if(sw){ const fx = ex - er * 1.05, fy = ey - er * 0.9; g.fillStyle = '#fff'; g.strokeStyle = RIM; g.lineWidth = Math.max(1, er * 0.25); g.beginPath(); D.ell(g, fx, fy, er * 0.55, er * 0.8); g.fill(); g.stroke(); g.fillStyle = '#1A1A10'; g.beginPath(); D.ell(g, fx - er * 0.12, fy + er * 0.05, er * 0.25, er * 0.42); g.fill(); }   // the far eye peeks over the snout
      else { g.fillStyle = D.rgba(R.A._col || '#334', 0.55); g.beginPath(); D.ell(g, ex - er * 0.1, ey - er * 0.55, er * 1.15, er * 0.7); g.fill(); } }   // ↖ the brow hides half the eye
    g.restore();
    if(!sw && !S.ray && R.A._back){ g.save(); M(g); g.globalAlpha = 0.28; g.strokeStyle = R.A._col || '#223'; g.lineCap = 'round'; g.lineWidth = R.A._back[1]; g.beginPath(); R.A._back[0].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.restore(); } } }; }   // ↖ the darker back shows
function wrap0(fill, M){ return g => { g.save(); M(g); const f = fill(g); g.restore(); return f; }; }
// ---------- a fish body (side / ¾, facing left) ----------
function fishBody(S, P, C, t){
  const L = S.L || 60, H = S.H || 24, lift = S.lift == null ? H * 1.1 : S.lift, K = 18, parts = [];
  const sw = P.swim, om = (S.beat || 1) * (4 + 7 * sw), amp = L * (0.035 + 0.08 * sw) * (S.wag || 1), curl = P.curl;
  // lateral bend (z) grows toward the tail; a mudskipper curls its tail round to one side before a hop
  const zAt = (s, dt) => amp * (0.06 + 0.94 * s * s) * Math.sin(TAU * s * 0.85 - om * (t - (dt || 0))) + curl * L * 0.42 * Math.pow(s, 2.2);
  const prof = S.prof || [0.42, 0.86, 1, 0.94, 0.72, 0.44, 0.3], hAt = s => { const f = s * (prof.length - 1), i = Math.min(prof.length - 2, Math.floor(f)); return H / 2 * lerp(prof[i], prof[i + 1], f - i); };
  const X0 = -L * 0.5, sp = []; for(let i = 0; i <= K; i++){ const s = i / K, z = zAt(s), x = X0 + s * L * 0.8 - Math.abs(z) * 0.25 * s, y = -lift + z * FISH.TILT; sp.push({s, x, y, z, h: hAt(s)}); }
  const top = s => { const f = s * K, i = Math.min(K - 1, Math.floor(f)), a = sp[i], b = sp[i + 1], u = f - i; return [lerp(a.x, b.x, u), lerp(a.y, b.y, u) - lerp(a.h, b.h, u)]; };
  const bot = s => { const f = s * K, i = Math.min(K - 1, Math.floor(f)), a = sp[i], b = sp[i + 1], u = f - i; return [lerp(a.x, b.x, u), lerp(a.y, b.y, u) + lerp(a.h, b.h, u) * (S.belly || 1.05)]; };
  const pe = sp[K], pe2 = sp[K - 2], yaw = Math.atan2(zAt(1, 0.06) - zAt(0.9, 0.06), L * 0.08);   // the tail fin turns a beat AFTER the body (follow-through)
  const fl = P.flare, col2 = C.fin || C.b, finCol = g => D.lin(g, pe.x, pe.y - H, pe.x + L * 0.5, pe.y + H, [D.rgba(col2, 0.95), C.a, C.d]);
  // ---- fins behind the body (far side) ----
  const pectAt = bot(0.3);
  if(S.pect === 'legs'){ // 🦵 mudskipper arm-fins: they plant on the mud and the body swings over them (crutching)
    const ph = Math.sin(t * (sw ? 9 : 2)) * (sw ? 0.6 : 0.08), plant = P.y > -2;
    [[-1, 0.75], [1, 1]].forEach(([side, k]) => { const a = 0.35 + side * ph * 0.5 - (plant ? 0 : 0.9), lx = pectAt[0] + 2 - side * 3, ly = pectAt[1] - 1, L2 = H * 0.75 * k, ex = lx - Math.sin(a) * L2 * 0.5, ey = ly + Math.cos(a) * L2, fx = ex - 6 * k, fy = ey;
      parts.push({path: g => { g.moveTo(lx - 4, ly - 2); g.quadraticCurveTo(lx - 8, ly + L2 * 0.5, ex - 3, ey - 2); g.lineTo(fx - 3, fy + 1); g.quadraticCurveTo(fx + 2, fy + 4, ex + 5, ey + 1); g.quadraticCurveTo(lx + 4, ly + L2 * 0.4, lx + 5, ly); g.closePath(); }, fill: side < 0 ? fSh(C.a, -0.25) : C.a}); }); }
  if(S.pect === 'small'){ const fw = Math.sin(t * (S.flutter || 14)) * 0.35; parts.push({path: g => T(g, pectAt[0] + 6, pectAt[1] - H * 0.25, 0.9 + fw, g => { g.moveTo(0, 0); g.quadraticCurveTo(-3, H * 0.4, 3, H * 0.5); g.quadraticCurveTo(6, H * 0.25, 4, 0); g.closePath(); }), fill: fSh(col2, -0.2)}); }
  // ---- flowing fins (betta): every ray samples the body wave a little LATER the further out it is (follow-through) + spreads when it flares ----
  const flow = (base, a0, a1, len, n, lagK, gk) => { const out = [], ys = Math.cos(yaw); for(let i = 0; i <= n; i++){ const u = i / n, a = lerp(a0, a1, u) + (fl * 0.35) * (lerp(a0, a1, u) - (a0 + a1) / 2), Lr = len * (gk ? 1 - gk + gk * Math.sin(Math.PI * 0.5 * (0.15 + 0.85 * u)) : 0.82 + 0.18 * Math.sin(Math.PI * u)) * (1 + 0.18 * fl) * (1 + 0.06 * Math.sin(7 * u - om * t * 0.6)) * (i % 2 ? 0.96 : 1);
      const lag = zAt(1, lagK * (0.5 + u)) - zAt(1), wx = Math.cos(a) * Lr, wy = Math.sin(a) * Lr; out.push([base[0] + wx * (0.75 + 0.25 * ys) + lag * 0.15, base[1] + wy + lag * FISH.TILT * 1.4 + (1 - fl) * Lr * 0.12 * Math.max(0, Math.cos(a)) ]); } return out; };
  const tailBase = [pe.x - 1, pe.y];
  let tailPath = null;
  if(S.tail === 'flow'){ const pts = flow(tailBase, -1.15, 1.15, L * 0.66, 16, 0.24); tailPath = g => { g.moveTo(tailBase[0], tailBase[1] - pe.h * 0.9); pts.forEach((p, i) => { const q = pts[Math.max(0, i - 1)]; i ? g.quadraticCurveTo(q[0] + (p[0] - q[0]) * 0.5 + 3, q[1] + (p[1] - q[1]) * 0.5, p[0], p[1]) : g.lineTo(p[0], p[1]); }); g.lineTo(tailBase[0], tailBase[1] + pe.h * 0.9); g.closePath(); };
    var tailRays = pts; }
  else { const fw = (S.tailK || 1) * H * 0.85 * Math.max(0.35, Math.abs(Math.cos(yaw))), fx = pe.x + H * 0.75 * (S.tailK || 1), tw = Math.sin(yaw) * H * 0.35;
    tailPath = S.tail === 'round' ? (g => { g.moveTo(pe.x - 2, pe.y - pe.h * 0.8); g.quadraticCurveTo(fx + 6, pe.y - fw - tw, fx + 2, pe.y - tw); g.quadraticCurveTo(fx + 6, pe.y + fw - tw, pe.x - 2, pe.y + pe.h * 0.8); g.closePath(); })
      : (g => { g.moveTo(pe.x - 2, pe.y - pe.h * 0.7); g.quadraticCurveTo(pe.x + H * 0.3, pe.y - fw * 0.5 - tw, fx + 4, pe.y - fw - tw); g.quadraticCurveTo(fx - H * 0.15, pe.y - tw * 0.5, fx + 4, pe.y + fw - tw); g.quadraticCurveTo(pe.x + H * 0.3, pe.y + fw * 0.5 - tw, pe.x - 2, pe.y + pe.h * 0.7); g.closePath(); }); }
  // dorsal (top) + anal (bottom) fins
  let dorPath = null, anaPath = null;
  if(S.dorsal === 'flow'){ const b = top(0.4), pts = flow(b, -1.7, -0.2, L * 0.62, 10, 0.2, 0.6); var dorRays = [b, pts]; dorPath = g => { g.moveTo(b[0] - 3, b[1] + 2); pts.forEach((p, i) => { const q = pts[Math.max(0, i - 1)]; i ? g.quadraticCurveTo((p[0] + q[0]) / 2 - 1, (p[1] + q[1]) / 2 - 2, p[0], p[1]) : g.lineTo(p[0], p[1]); }); const e = top(0.92); g.lineTo(e[0], e[1] + 2); g.closePath(); }; }
  else if(S.dorsal === 'tall'){ const up = 0.55 + 0.45 * Math.max(fl, Math.sin(t * 1.7) > 0.85 ? 1 : 0); const a = top(0.38), b = top(0.62), c = top(0.66), d = top(0.95);
    dorPath = g => { g.moveTo(a[0], a[1] + 2); g.lineTo(a[0] + 2, a[1] - H * 0.75 * up); g.quadraticCurveTo(lerp(a[0], b[0], 0.5), a[1] - H * 0.95 * up, b[0], b[1] - H * 0.55 * up); g.lineTo(b[0], b[1] + 2); g.closePath();
      g.moveTo(c[0], c[1] + 2); g.quadraticCurveTo(lerp(c[0], d[0], 0.4), c[1] - H * 0.55 * up, d[0], d[1] - H * 0.2); g.lineTo(d[0], d[1] + 2); g.closePath(); }; }
  else if(S.dorsal !== 'off'){ const a = top(0.38), b = top(0.68), sz = S.dorsalK || 1; dorPath = g => { g.moveTo(a[0], a[1] + 2); g.quadraticCurveTo(a[0] + 4, a[1] - H * 0.55 * sz, lerp(a[0], b[0], 0.75), a[1] - H * 0.48 * sz); g.quadraticCurveTo(b[0], b[1] - H * 0.2, b[0] + 2, b[1] + 2); g.closePath(); }; }
  if(S.anal === 'flow'){ const b = bot(0.34), pts = flow(b, 1.85, 0.3, L * 0.68, 10, 0.22, 0.6); var anaRays = [b, pts]; anaPath = g => { g.moveTo(b[0] - 3, b[1] - 2); pts.forEach((p, i) => { const q = pts[Math.max(0, i - 1)]; i ? g.quadraticCurveTo((p[0] + q[0]) / 2 - 1, (p[1] + q[1]) / 2 + 2, p[0], p[1]) : g.lineTo(p[0], p[1]); }); const e = bot(0.95); g.lineTo(e[0], e[1] - 2); g.closePath(); }; }
  const finR = (bx, by, r) => g => D.rad(g, bx, by, 2, r, [C.a, col2, D.sh2 ? col2 : col2, C.fin2 || col2]);
  if(dorPath) parts.push({path: dorPath, fill: S.dorsal === 'flow' ? finR(top(0.55)[0], top(0.55)[1], L * 0.6) : (C.fin || C.b)});
  if(anaPath) parts.push({path: anaPath, fill: finR(bot(0.55)[0], bot(0.55)[1], L * 0.65)});
  parts.push({path: tailPath, fill: S.tail === 'flow' ? finR(tailBase[0], tailBase[1], L * 0.68) : finCol});
  // 🌸 betta gill frill (the flare): a dark-red membrane fans out from under the gill cover
  const gc = top(0.24), gb = bot(0.24);
  if(fl > 0.05) parts.push({path: g => { const r = H * (0.25 + 0.55 * fl); g.moveTo(gc[0] + 2, gc[1] + 3); for(let i = 0; i <= 8; i++){ const a = -1.2 + i / 8 * 2.6, rr = r * (0.85 + 0.15 * (i % 2)); g.lineTo(lerp(gc[0], gb[0], 0.5) + 4 + Math.cos(a) * rr, lerp(gc[1], gb[1], 0.5) + Math.sin(a) * rr); } g.lineTo(gb[0] + 2, gb[1] - 3); g.closePath(); }, fill: C.frill || '#6A1A2A'});
  // ---- the body ----
  const bodyPath = g => { const N = 24; const a = top(0); g.moveTo(a[0], a[1]); for(let i = 1; i <= N; i++){ const p = top(i / N); g.lineTo(p[0], p[1]); }
    for(let i = N; i >= 0; i--){ const p = bot(i / N); g.lineTo(p[0], p[1]); } const s0 = sp[0], r0 = s0.h * 1.02; g.quadraticCurveTo(s0.x - r0 * 1.25 * (S.snout || 1), s0.y, top(0)[0], top(0)[1]); g.closePath(); };
  parts.push({path: bodyPath, fill: g => D.lin(g, 0, -lift - H * 0.6, 0, -lift + H * 0.6, [C.b, C.a, C.a, C.c])});
  // near chest fin (betta: long thin pelvic too)
  if(S.pect === 'flow'){ const b = bot(0.28), pts = flow(b, 1.9, 1.5, H * 1.1, 3, 0.1); parts.push({path: g => { g.moveTo(b[0] - 2, b[1] - 1); pts.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(b[0] + 3, b[1]); g.closePath(); }, fill: finCol});
    const fw = Math.sin(t * 16) * 0.4; parts.push({path: g => T(g, gc[0] + 9, lerp(gc[1], gb[1], 0.55), 1 + fw, g => { g.moveTo(0, 0); g.quadraticCurveTo(-2, H * 0.32, 3, H * 0.4); g.quadraticCurveTo(5, H * 0.2, 3, 0); g.closePath(); }), fill: D.rgba(C.b, 0.9)}); }
  // 👀 eyes on top (mudskipper) — part of the one-piece silhouette
  const eyeX = sp[0].x + L * (S.eyes === 'top' ? 0.12 : 0.1), eyeY = (S.eyes === 'top' ? top(0.14)[1] : sp[1].y - H * 0.08), er = H * (S.eyeK || 0.2);
  const blink = S.eyes === 'top' && (P.eye === 'shut' || (t % 3.1) > 2.95);   // a mudskipper "blinks" by pulling its eyes DOWN into their cups
  if(S.eyes === 'top') [[1.1, -0.9], [0.85, 0.6]].forEach(([k, dz]) => { const ex = eyeX + dz * er * 0.9, ey = eyeY - er * (blink ? 0.2 : 0.95) * k; parts.push({path: g => { g.moveTo(ex + er * k, ey); g.arc(ex, ey, er * k, 0, TAU); }, fill: C.b}); });
  const A = {_eye: [eyeX, eyeY, er], _col: C.d, _back: [[0.15, 0.3, 0.45, 0.6, 0.75, 0.88].map(s => { const p = top(s); return [p[0], p[1] + H * 0.14]; }), H * 0.28], top: [eyeX, eyeY - er * 2], head: [sp[0].x + L * 0.08, sp[0].y, H * 0.5], back: [top(0.5)[0], top(0.5)[1]], hand: [sp[0].x - 6, sp[0].y], belly: [bot(0.45)[0], bot(0.45)[1]], tail: [pe.x + H * 0.7, pe.y], H: lift + H * 1.2, spine: sp, fish: true};
  return {parts, A, details(g){ g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    // fin rays
    g.strokeStyle = D.rgba(C.d, 0.35); g.lineWidth = 0.9;
    [dorRays, anaRays].forEach(R2 => { if(!R2) return; const [b, pts] = R2; pts.forEach((p, i) => { if(i % 2) return; const u = i / (pts.length - 1); g.beginPath(); g.moveTo(b[0] + u * L * 0.25, b[1]); g.lineTo(lerp(b[0], p[0], 0.9), lerp(b[1], p[1], 0.9)); g.stroke(); }); });
    if(S.dorsal === 'tall'){ const up = 0.55 + 0.45 * Math.max(fl, Math.sin(t * 1.7) > 0.85 ? 1 : 0), a = top(0.38), b = top(0.62); g.strokeStyle = D.rgba(C.d, 0.55); g.lineWidth = 1.1; for(let i = 0; i <= 5; i++){ const u = i / 5, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1 + u * 2, y - H * (0.8 - 0.3 * u) * up); g.stroke(); }
      g.fillStyle = C.spot || '#3AA8E8'; [[0.3, 0.45], [0.55, 0.5], [0.42, 0.7], [0.75, 0.35]].forEach(([u, v]) => { g.beginPath(); g.arc(lerp(a[0], b[0], u), lerp(a[1], b[1], u) - H * v * up * 0.85, 1.4, 0, TAU); g.fill(); }); }
    if(tailRays) tailRays.forEach((p, i) => { if(i % 2) return; g.beginPath(); g.moveTo(tailBase[0] + 2, tailBase[1] + (i / 14 - 0.5) * pe.h); g.lineTo(lerp(tailBase[0], p[0], 0.92), lerp(tailBase[1], p[1], 0.92)); g.stroke(); });
    // body pattern inside the body
    g.save(); g.beginPath(); bodyPath(g); g.clip();
    if(S.shine){ g.globalAlpha = 0.5; g.fillStyle = D.lin(g, sp[0].x, 0, sp[K].x, 0, [D.rgba('#7AF0FF', 0), D.rgba('#7AF0FF', 0.7), D.rgba('#C080FF', 0.6), D.rgba('#7AF0FF', 0)]); g.fillRect(sp[0].x - 20, -lift - H, L * 1.2, H * 2); g.globalAlpha = 1; }
    if(S.spots) for(let i = 0; i < 14; i++){ const s = 0.18 + (i * 0.618 % 1) * 0.7, p = top(s), q = bot(s), v = 0.15 + (i * 0.37 % 1) * 0.55; g.fillStyle = D.rgba(C.spot || C.d, 0.75); g.beginPath(); g.arc(p[0], lerp(p[1], q[1], v), H * (0.04 + (i % 3) * 0.015), 0, TAU); g.fill(); }
    if(S.stripes) for(let i = 0; i < S.stripes; i++){ const s = 0.3 + i * 0.5 / S.stripes, p = top(s), q = bot(s); g.strokeStyle = D.rgba(C.d, 0.4); g.lineWidth = H * 0.1; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0] + 2, lerp(p[1], q[1], 0.75)); g.stroke(); }
    // scales: soft scallops
    g.strokeStyle = D.rgba(C.d, 0.22); g.lineWidth = 0.8; for(let i = 2; i < K - 1; i += 2) for(let j = -1; j <= 1; j++){ const p = sp[i]; g.beginPath(); g.arc(p.x + (j % 2 ? 2 : 0), p.y + j * p.h * 0.45, p.h * 0.22, -1.2, 1.2); g.stroke(); }
    // pale belly
    g.fillStyle = D.rgba(C.c2 || '#FFF6E0', S.belly2 == null ? 0.5 : S.belly2); g.beginPath(); for(let i = 0; i <= 20; i++){ const p = bot(i / 20 * 0.85); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } for(let i = 20; i >= 0; i--){ const s = i / 20 * 0.85, p = bot(s), q = top(s); g.lineTo(p[0], lerp(q[1], p[1], 0.62)); } g.closePath(); g.fill();
    g.restore();
    // gill line
    g.strokeStyle = D.rgba(C.d, 0.6); g.lineWidth = 1.3; g.beginPath(); g.moveTo(gc[0] + 2, gc[1] + 3); g.quadraticCurveTo(gc[0] + 7, lerp(gc[1], gb[1], 0.5), gb[0] + 2, gb[1] - 3); g.stroke();
    // mouth (a smile, an O when it gulps air)
    const mx = sp[0].x - sp[0].h * 1.05 * (S.snout || 1), my = sp[0].y + sp[0].h * 0.25;
    const mk = S.mouthK || 1; if(P.gulp > 0.3 || P.jaw > 0.3){ g.fillStyle = '#7A2A2A'; g.strokeStyle = RIM; g.lineWidth = 1.2; g.beginPath(); D.ell(g, mx + 3, my, 2 + P.jaw * 2 + P.gulp * 2, 1.6 + P.jaw * 2.4 + P.gulp * 2); g.fill(); g.stroke(); }
    else { g.strokeStyle = RIM; g.lineWidth = 1.4; g.beginPath(); g.moveTo(mx + 1, my - 1); g.quadraticCurveTo(mx + 4 * mk, my + 2.5 * mk, mx + 8 * mk, my + 0.5 * mk); g.stroke(); }
    // eyes
    const eyeDraw = (ex, ey, r, st) => { if(st === 'shut' || st === 'happy'){ g.strokeStyle = RIM; g.lineWidth = Math.max(1.2, r * 0.35); g.beginPath(); st === 'happy' ? g.arc(ex, ey + r * 0.3, r * 0.8, Math.PI * 1.1, Math.PI * 1.9) : g.arc(ex, ey - r * 0.2, r * 0.8, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); return; }
      g.fillStyle = '#fff'; g.strokeStyle = RIM; g.lineWidth = Math.max(1, r * 0.25); g.beginPath(); g.arc(ex, ey, r, 0, TAU); g.fill(); g.stroke(); g.fillStyle = C.iris || '#E0A21A'; g.beginPath(); g.arc(ex - r * 0.15, ey + r * 0.05, r * 0.68, 0, TAU); g.fill();
      g.fillStyle = '#1A1A10'; g.beginPath(); g.arc(ex - r * 0.2, ey + r * 0.05, r * 0.38, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - r * 0.45, ey - r * 0.35, r * 0.24, 0, TAU); g.fill();
      if(st === 'angry'){ g.strokeStyle = RIM; g.lineWidth = r * 0.4; g.beginPath(); g.moveTo(ex - r * 1.1, ey - r * 1.2); g.lineTo(ex + r * 0.9, ey - r * 0.75); g.stroke(); } };
    if(S.eyes === 'top'){ [[1.1, -0.9], [0.85, 0.6]].forEach(([k, dz]) => { const ex = eyeX + dz * er * 0.9, ey = eyeY - er * (blink ? 0.2 : 0.95) * k; if(blink){ g.strokeStyle = RIM; g.lineWidth = 1.4; g.beginPath(); g.arc(ex, ey + 1, er * k * 0.7, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } else eyeDraw(ex - er * 0.1, ey, er * k * 0.82, P.eye); }); }
    else eyeDraw(eyeX, eyeY, er, P.eye);
    g.restore(); }};
}
// ---------- 🪽 a ray (Glidray): a flat disc seen from above-front, wings ripple front → back, a whip tail that follows joint by joint ----------
function fishRay(S, P, C, t){
  const L = S.L || 60, W = L * (S.span || 0.62), lift = (S.lift == null ? 18 : S.lift) + P.fly * 10, parts = [], N = 40;
  const om = 2.6 + 1.2 * Math.abs(P.wing) + P.swim * 1.4, amp = W * (0.08 + 0.05 * P.swim), YW = S.yaw == null ? 0.12 : S.yaw, cY = Math.cos(YW), sY = Math.sin(YW), TL = 0.62;
  const PJ = (x, y, z) => [x * cY - z * sY, -lift + y + (x * sY + z * cY) * TL];   // 👁️ seen ¾ from above-front: the kite shape + both wings read
  // wing edge height: a wave from the front edge to the back + the flap (wing ±1 = both tips up / down)
  const yAt = (x, z, dt) => { const e = Math.pow(Math.abs(z) / W, 1.4); return -e * (amp * Math.sin(TAU * (x / L) * 0.9 - om * (t - (dt || 0))) + W * 0.3 * P.wing); };
  const ring = []; for(let i = 0; i < N; i++){ const a = i / N * TAU, c = Math.cos(a), s = Math.sin(a), d = Math.pow(Math.abs(c) + Math.abs(s), -0.8), x = c * d * L * (c < 0 ? 0.4 : 0.34) + L * 0.03 * Math.abs(s * d), z = s * d * W;   /* a soft kite: round nose, pointed wing tips a little behind the middle */
    const q = PJ(x, yAt(x, z), z); ring.push({x, z, y: -lift + yAt(x, z), sx: q[0], sy: q[1]}); }
  const P2 = (x, z) => PJ(x, yAt(x, z), z);
  // 🦯 the whip tail: each joint follows the joint in front of it (it reads the body's sway a little later)
  const TN = 12, tl = L * (S.tailL || 0.75), tail = []; let tx = L * 0.3, tz = 0, ty = 0; for(let i = 0; i <= TN; i++){ const u = i / TN, sw = Math.sin(-om * (t - u * 0.3) + 1) * u * u * L * 0.12 + P.wing * u * u * L * 0.05;   /* each joint swings a little after the one in front */
    tail.push(PJ(tx, ty - sw * 0.4, tz + sw)); tx += tl / TN; ty += 0.35 * u; }
  const tw = L * 0.022; parts.push({path: g => { g.moveTo(tail[0][0], tail[0][1] - tw * 1.6); tail.forEach((p, i) => g.lineTo(p[0], p[1] - tw * (1.6 - 1.3 * i / TN))); g.arc(tail[TN][0], tail[TN][1], tw * 0.6, -Math.PI / 2, Math.PI / 2); for(let i = TN; i >= 0; i--) g.lineTo(tail[i][0], tail[i][1] + tw * (1.6 - 1.3 * i / TN)); g.closePath(); }, fill: C.d});
  // little back fins (pelvic) behind the disc
  [-1, 1].forEach(sd => { const a = P2(L * 0.24, sd * W * 0.12), b = P2(L * 0.4, sd * W * 0.26), c = P2(L * 0.32, sd * W * 0.05); parts.push({path: g => { g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c[0], c[1]); g.closePath(); }, fill: C.a}); });
  // the disc
  const disc = g => { ring.forEach((p, i) => i ? g.lineTo(p.sx, p.sy) : g.moveTo(p.sx, p.sy)); g.closePath(); };
  parts.push({path: disc, fill: g => D.lin(g, -L * 0.4, -lift - W * 0.4, L * 0.3, -lift + W * 0.5, [C.b, C.a, C.a, C.c])});
  // 👀 eyes bulge on TOP near the front
  const eyes = [-1, 1].map(sd => P2(-L * 0.2, sd * W * 0.16)), er = L * 0.05;
  eyes.forEach(([x, y]) => parts.push({path: g => { g.moveTo(x + er * 1.25, y - er * 0.6); g.arc(x, y - er * 0.6, er * 1.25, 0, TAU); }, fill: C.a}));
  const A = {top: [eyes[0][0], eyes[0][1] - er * 3], head: P2(-L * 0.3, 0).concat(L * 0.15), back: P2(0, 0), hand: P2(-L * 0.42, 0), belly: [0, -lift + 6], tail: tail[TN], H: lift + W * 0.6, ray: true, ring};
  return {parts, A, details(g){ g.save(); g.lineCap = 'round';
    g.save(); g.beginPath(); disc(g); g.clip();
    // spots + a soft shine band that rides the wave
    if(S.spots) for(let i = 0; i < 22; i++){ const u = (i * 0.618) % 1, v = ((i * 0.381) % 1) * 2 - 1, x = lerp(-L * 0.35, L * 0.3, u), z = v * W * 0.75 * (1 - Math.abs(x) / L); const p = P2(x, z); g.fillStyle = D.rgba(C.spot || '#FFFFFF', 0.7); g.beginPath(); D.ell(g, p[0], p[1], L * 0.022 * (1 + i % 3 * 0.4), L * 0.016 * (1 + i % 3 * 0.4)); g.fill(); }
    g.strokeStyle = D.rgba('#FFFFFF', 0.45); g.lineWidth = 3; g.beginPath(); for(let i = 0; i <= 20; i++){ const z = (i / 20 * 2 - 1) * W * 0.9, p = P2(-L * 0.05, z); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke();
    // the near wing's white underside shows when that tip lifts
    ring.forEach((p, i) => { if(p.z < W * 0.55) return; const up = -(p.y + lift); if(up < 2) return; g.fillStyle = D.rgba(C.c2 || '#FFF6E8', Math.min(0.8, up / 12)); g.beginPath(); g.arc(p.sx, p.sy - 2, 4, 0, TAU); g.fill(); });
    g.restore();
    // a crystal ridge down the middle of the back (Crystal River)
    g.fillStyle = C.gem || '#BFF4FF'; g.strokeStyle = D.rgba(C.d, 0.6); g.lineWidth = 0.9; [0, 0.1, 0.2].forEach((x, i) => { const p = P2(-L * 0.02 + x * L, 0), r = L * (0.02 - i * 0.004); g.beginPath(); g.moveTo(p[0] - r, p[1]); g.lineTo(p[0], p[1] - r * 1.8); g.lineTo(p[0] + r, p[1]); g.lineTo(p[0], p[1] + r * 0.6); g.closePath(); g.fill(); g.stroke(); });
    // eyes
    eyes.forEach(([x, y], i) => { const ey = y - er * 0.6, r = er * 0.95; if(P.eye === 'shut' || P.eye === 'happy'){ g.strokeStyle = RIM; g.lineWidth = 1.5; g.beginPath(); g.arc(x, ey + 1, r * 0.8, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); return; }
      g.fillStyle = '#fff'; g.strokeStyle = RIM; g.lineWidth = 1.2; g.beginPath(); g.arc(x, ey, r, 0, TAU); g.fill(); g.stroke(); g.fillStyle = C.iris || '#3A8AD8'; g.beginPath(); g.arc(x - r * 0.2, ey, r * 0.62, 0, TAU); g.fill(); g.fillStyle = '#10141A'; g.beginPath(); g.arc(x - r * 0.25, ey, r * 0.34, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x - r * 0.45, ey - r * 0.35, r * 0.22, 0, TAU); g.fill(); });
    // a smile on the front edge (real rays: the mouth is underneath — the card says so)
    const f = P2(-L * 0.42, W * 0.12); g.strokeStyle = RIM; g.lineWidth = 1.4; g.beginPath(); g.moveTo(f[0] + 2, f[1] - 1); g.quadraticCurveTo(f[0] + 7, f[1] + 3.5, f[0] + 12, f[1] + 1); g.stroke();
    g.restore(); }};
}
// the 2 look-test creatures (core list for now; the Avateer block gets the rest of the cast after "go")
Object.assign(LIST, {
  phayanaga: {name: 'Phaya Naga', fam: 'serpent', role: 'guard', el: 'water', rank: 'boss', cls: 6, gear: false, friend: 0, forms: ['Phaya Naga', '✦ Elite Phaya Naga', '✦✦ Awakened Phaya Naga'],
    shape: {head: 'naga', ridge: 'kranok', scales: 'gold', crown: 1, len: 180, r: 13.5, hr: 60, neck: 0.44, lag: 220, links: 18, headK: 0.85, breath: 4, spring: 1, pace: 1},
    col: {a: '#2FA37A', b: '#9BEFC4', c: '#F4E2A8', d: '#1C6B50', gold: '#F2C230', tip: '#FF8A2A', iris: '#E0A21A', gem: '#E8473A', belly2: '#8A6A2A'}, about: 'Guardian of the waters under River Temple. It tests you — then it bows.'},
  bigeel: {name: 'Big Eel', fam: 'serpent', role: 'striker', el: 'water', rank: 'mini', cls: 5, gear: false, about: '⚠️ Floor 4 mini boss: lunges from a Sunken Temple doorway — it rears back first.',
    shape: {head: 'eel', ridge: 'fin', spots: true, len: 160, r: 11, hr: 48, neck: 0.36, stand: 0.85, lag: 140, links: 16, swim: 0.15, waves: 1.6, restS: 0.09, breath: 3, spring: 1.35, pace: 1.45},
    col: {a: '#6E7A3A', b: '#C8D290', c: '#E8C870', c2: '#B89848', d: '#2E3418', fin: '#9AA250', iris: '#E8C040', belly2: '#7A5A20'}},
});
// 🐍🐟 av-naga2 roll-out cast (look test; the Avateer block owns the final list after "go")
Object.assign(LIST.phayanaga, {forms: ['Phaya Naga', '✦ Elite Phaya Naga', '✦✦ Awakened Phaya Naga', '✦✦✦ Prime Nakkharat'],
  fshape: [{}, {heads: 3, len: 190, forkAt: 0.92}, {heads: 7, len: 200, crown: 2, aura: '#FFE68A', forkAt: 0.92, fan: 1.05},
           {heads: 9, len: 205, crown: 2, aura: '#FFFFFF', forkAt: 0.92, fan: 1.1, lotus: true, dome: true, headCols: ['fire', 'water', 'leaf', 'grey', 'rock', 'wind', 'bolt', 'grey']}]});
Object.assign(LIST, {
  squirmeel: {name: 'Squirmeel', fam: 'serpent', role: 'trickster', el: 'rock', cls: 1, gear: false, about: 'Waits in dry mud, breathing air — wiggles out when you step close.',
    shape: {head: 'eel', ridge: 'fin', len: 120, r: 9, hr: 34, neck: 0.32, stand: 0.75, lag: 90, links: 8, swim: 0.2, waves: 1.9, restS: 0.13, breath: 2, spring: 1.8, pace: 2, headK: 1.15, eyeK: 1.35, spots: true},
    col: {a: '#B88A5A', b: '#E8C898', c: '#F2DCB0', c2: '#D8B888', d: '#5A3A22', fin: '#D8A870', iris: '#FFB830', belly2: '#9A7A50'}},
  gulpeel: {name: 'Gulpeel', fam: 'serpent', role: 'guard', el: 'water', cls: 2, gear: false, about: 'A rice-field swamp eel: no side fins, gulps AIR at the top of the water.',
    shape: {head: 'swamp', ridge: 'none', len: 170, r: 10, hr: 40, neck: 0.3, stand: 0.7, lag: 120, links: 12, swim: 0.15, waves: 1.6, restS: 0.1, breath: 3, spring: 1.4, pace: 1.6, headK: 1.05, eyeK: 1.1},
    col: {a: '#8A7A3A', b: '#C8B870', c: '#E8D890', c2: '#C8A858', d: '#3A3216', iris: '#F0C840', belly2: '#8A6A2A'}},
  babynaga: {name: 'Nagling', fam: 'serpent', role: 'pet', el: 'water', pet: true, cls: [1, 2, 3, 4, 5], gear: false, about: '🌟 Legend companion: hatched from Phaya Naga\'s egg — grows into a little Phaya Naga.',
    names: ['Nagling', 'Ripple Nagling', 'Crowned Nagling', 'Jade Naga', 'Little Phaya Naga'],
    shape: {head: 'naga', ridge: 'kranok', scales: 'gold', crown: 1, len: 180, r: 13.5, hr: 60, neck: 0.44, lag: 220, links: 18, headK: 0.85, breath: 3, spring: 1.3, pace: 1.6},
    col: {a: '#2FA37A', b: '#9BEFC4', c: '#F4E2A8', d: '#1C6B50', gold: '#F2C230', tip: '#FF8A2A', iris: '#E0A21A', gem: '#E8473A', belly2: '#8A6A2A'},
    stages: [
      {len: 92, r: 10, hr: 34, neck: 0.4, links: 10, headK: 1.3, eyeK: 1.4, crown: 0, crest: 0, cheek: false, gem: false, ridge: 'none', scales: 'plain', egg: true, pale: true, lag: 120},
      {len: 112, r: 10.5, hr: 40, neck: 0.42, links: 12, headK: 1.2, eyeK: 1.3, crown: 0, crest: 1, crestK: 0.8, cheek: false, gem: false, ridge: 'kranok', scales: 'plain', pale: true, lag: 140},
      {len: 132, r: 11.5, hr: 46, neck: 0.43, links: 14, headK: 1.1, eyeK: 1.2, crown: 1, crest: 2, crestK: 0.9, cheek: true, gem: false, ridge: 'kranok', scales: 'plain', lag: 170},
      {len: 152, r: 12.5, hr: 52, neck: 0.44, links: 16, headK: 1, eyeK: 1.1, crown: 1, crest: 3, cheek: true, gem: true, ridge: 'kranok', scales: 'gold', lag: 190},
      {len: 172, r: 13, hr: 58, neck: 0.44, links: 18, headK: 0.92, crown: 1, crest: 3, cheek: true, gem: true, ridge: 'kranok', scales: 'gold', halo: true, lag: 210}]},
  glidray: {name: 'Glidray', fam: 'fish', role: 'ranged', el: 'water', cls: 2, gear: false, about: 'Flies through the Crystal River on wide wings — a cousin of sharks (soft cartilage, no bones).',
    shape: {ray: true, L: 62, span: 0.82, lift: 40, tailL: 0.8, spots: true}, col: {a: '#4A8AC8', b: '#9AD0F2', c: '#2A5A90', d: '#1E3E6A', c2: '#F2FAFF', spot: '#E8F8FF', gem: '#BFF4FF', iris: '#3A8AD8'}},
  mudhopper: {name: 'Mudhopper', fam: 'fish', role: 'striker', el: 'leaf', cls: 1, gear: false, about: 'A fish that WALKS on its chest fins over the mud, eyes on top like a frog.',
    shape: {L: 54, H: 19, lift: 14, tail: 'round', tailK: 0.8, dorsal: 'tall', pect: 'legs', eyes: 'top', eyeK: 0.24, prof: [0.62, 0.95, 1, 0.9, 0.7, 0.5, 0.34], snout: 0.75, spots: true, belly: 1.0, wag: 0.6, mouthK: 1.5},
    col: {a: '#8A9A5A', b: '#C8D498', c: '#5A6A34', d: '#3A4420', c2: '#F2EED8', fin: '#B8A060', spot: '#3AA8E8', iris: '#E8C040'}},
  bettaflare: {name: 'Bettaflare', fam: 'fish', role: 'healer', el: 'star', cls: 1, gear: false, friend: 1, about: 'Builds a bubble nest in the paddy water; flares every fin to say "this is MY pond".',
    shape: {L: 46, H: 20, lift: 30, tail: 'flow', dorsal: 'flow', anal: 'flow', pect: 'flow', eyeK: 0.24, prof: [0.5, 0.9, 1, 0.92, 0.72, 0.5, 0.42], shine: true, beat: 0.6, wag: 0.7, flutter: 18},
    col: {a: '#3A4AD8', b: '#8A9AFF', c: '#2A1A8A', d: '#1A1050', fin: '#E8384A', fin2: '#FF8A5A', frill: '#5A0A2A', c2: '#B8C0FF', iris: '#FFD23F'}},
});

/* 🧭 options the kit hands over (one line each in the kit: FX.prep) */
function seaOpts(S, o){ if(o.heads) S._heads = o.heads; if(o.layer) S._layer = o.layer; if(o.view) S._view = {SW: 'SW', SE: 'SW', NW: 'NW', NE: 'NW'}[o.view]; if(typeof o.yaw === 'number') S._yaw = o.yaw; }
return {
  serpent: {plan: plan_serpentM, cls: 3, pace: true, sz: 0.5, shadow: 3, finShadow: 1.8, views: true,
    prep(S, o, MS){ S._at = o.poseAt || (o.act ? (d => sample(o.act, MS - d, o.from).pose) : null); seaOpts(S, o); }},   /* 🐍 each link reads the act a little later (by mass) */
  fish: {plan: plan_fish, cls: 2, views: true, prep(S, o){ seaOpts(S, o); }}};
});
Creatures.SEA = 'av-naga4';
})();
