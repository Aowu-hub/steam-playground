
/* ================= 🎬 AvatarMotion (mo-1, 🎬 Motion chat, 2026-11-18) =================
   The shared MOTION layer on the 🎬 beat timeline (Acting.play → run.at → Acting.draw). Rules: `Motion rules.md` (M1–M24).
   Comes WITH include('AvatarKit') right after AvatarActing (Code.gs INCLUDE_ALSO_). It plugs into 5 hook points in AvatarActing;
   without this file every act draws exactly as before, and an act that asks for nothing new draws exactly as before too.

   ACT FIELDS (all optional — default = today)
     weight: 'light' | 'medium' | 'heavy'   ⚖️ fills missing beat times + phase eases (M3 · M17), weapon lag on the strike, 📳 shake (heavy)
     lag: false                             no weapon lag on the strike (thrusts, jabs). Tip: weight acts set drag: false so the old B1a drag doesn't stack on it
     reach: avatar units                    how far the smear reaches from the hand (default: the held thing's length)
     smearCol / element                     💨 colour: '#hex' or an ActionFX element ('fire', 'ice' …); default white
   BEAT FIELDS
     hold: ms        ⏸️ hold-then-snap: the body keeps the previous pose this long, then moves (M2)
     smear: true | 'heavy' | 'light'        💨 ONLY on the contact beat (= the strike's travel) — anywhere else it is ignored + an Acting.ERRORS line (M7)
   POSE FIELDS
     wristR / wristL (radians)              🖐️ the held thing turns at the wrist (+ = forward). wristL is kept for the off-hand painter (later round).
   FRAME (run.at(t)) gets
     f.smear = {kind, poses, alpha, col}    drawn by Acting.draw (in front of the body, never over the face)
     f.shake = px (avatar units)            📳 heavy acts — the game moves its camera / sprite by Motion.shake(f)
   CALLS
     Motion.shake(f, t) → {x, y}            a shake offset in avatar units (× k for pixels); {0, 0} when there is none
     Motion.reach(who)                      the smear reach of what the avatar holds
     Motion.WEIGHTS / PHASE_EASE            the preset tables (read-only)
   Options on Acting.play(who, act, {calm: true})  = 🌱 Basic / reduced motion: half-length smear, no shake.
   ── mo-2 (Motion rules §14) ──
   Acting.play(who, act, {side: 'enemy'})      ⚡ wind-up ≥ 300 / 400 / 550 ms (light / medium / heavy) + f.glow 0 → 1 (ring at the weapon hand, drawn UNDER the body)
   Acting.play(who, act, {side: 'player'})     light wind-up ≤ 100 ms · heavy player moves glow too · {glow: true} forces the glow
   Acting.play(who, act, {combo: 'mid'|'last'}) 🔗 mid = no ready, follow 60 + settle 40 (≤ 100 ms recover) · last = follow × 1.5 + f.sparks (stars from the tip)
   H = Motion.hit([target,] {kind: 'slash'|'thrust'|'blunt'|'fist', weight, ko, element, col, calm, seed, ang})
       H.at(t) (t = ms since contact) → {freeze, flash, shake {x, y}, amp, frame (the hit avatar's reaction — Acting.draw it), ck {act, ms} (creatures), done}
       Motion.drawHit(g, H, t, paintBody, {x, y, k, dir, at, h}) = body with the 🤍 flash + the FX (never on the face) · Motion.drawHitFx(g, H, t, x, y, k, dir) = FX only
       FX: white shape (1 frame) → biggest burst (1 frame) → the cloud breaks into pieces + cools · sparks → dashes · slash / thrust = a cut that breaks into dashes ·
           fist / blunt / KO = a ring that breaks into dots · blunt / heavy = debris chunks. Colour ramp from ActionFX.EL[element] or col, else white → yellow → orange → pink → purple → navy.
   K = Motion.knock([target,] {weight, ko, wall: free units behind, creature, loot: false, grace: 300})
       K.at(t) → {dx, lift (avatar units — the GAME moves the real position), frame, phase, safe (🛡️ can't be hit), wall, dust, ring, puff, coin, gone, ck, done}
       Motion.drawKnockFx(g, K, t, feetX, feetY, k, flyDir) = dust · ground ring · 💫 KO puff · 🪙 loot coin
   run = Motion.land(who, {height (m) | vy (m/s), g, calm, t0, onContact})  🦘 squash 6 % @ 0.5 m · 15 % @ 1 m · 28 % @ 3 m (≤ 30) · hold · dust · ring ≥ 2 m · 📳 ≥ 3 m → f.land
   Motion.landInfo({height | vy}) → {h, squash, hold, dust, ring, shake} · Motion.flash(g, paint, amt, box)
   ── mo-3 (Motion rules §15) ──
   H = Motion.hang(who, {parts: ['cape', 'hair', 'scarf', 'tail']})  🧣 capes · scarf ends · hair (Long · Ponytail · Braids · Pigtails) · costume tails trail the body:
       Acting.draw(…, {hang: H}) / drawAvatar(…, {hang: H}) — a 3D spring chain per part over the last 0.6 s (same t = same picture), behind or OVER the body by depth.
       Acts drive it by themselves; a game that MOVES the avatar adds H.feed(x, y, t, k) each frame (feet px, avatar scale, seconds). No hang = today, pixel for pixel.
   key = Motion.spin({weight: 'light'|'medium'|'heavy', turns: 1|2}) → Acting.play(who, key, …)  🌀 hold → coil → turn → front = CONTACT → overshoot → hold · f.ring (💨 2 crescents
       round the shoulders, back half under the body) · f.spin = the turn angle (hit-all-round games) · pose field yaw (0 = today's picture) picks front / back × mirror
   Acting.draw(…, {view: 'NE'}) / Motion.view8(dx, dy, last) / Motion.viewOf(key)  🧭 8 views = 4 pictures + tweaks (squeeze · reach · smear behind in back views · cape over the back)
       pose fields back: 1 (back picture) · reach (arm length ×) — both only from the view
   f = Motion.idle(who, t, {seed}) → 🫁 an alive idle frame (200 · 200 · 200 · 260 ms, 1 px bob) — draw it with Acting.draw like any frame
   ========================================================================================= */
(function(){
if (window.Motion) return;
if (!window.Acting) { console.error('🎬 AvatarMotion needs AvatarActing first'); return; }

// ⚖️ weight presets inside the 5 beats + the B1a time guide (anticipation 120–250 · contact 60–100 · follow 150–300 · settle 100–200).
// The strike = the contact beat's own travel (tr ms, accelerating into the contact pose — the "one-frame strike"); the rest of the contact beat = the hold.
const WEIGHTS = {
  light:  {ready: 60, anticipation: 120, contact: 60,  strike: 40, follow: 160, followTr: 0.45, settle: 100, followEase: 'backOut',   lag: 0.45, shake: 0},
  medium: {ready: 70, anticipation: 200, contact: 80,  strike: 45, follow: 220, followTr: 0.4,  settle: 150, followEase: 'backOut',   lag: 0.6,  shake: 0},
  heavy:  {ready: 80, anticipation: 250, contact: 100, strike: 50, follow: 300, followTr: 0.4,  settle: 200, followEase: 'bounceOut', lag: 0.75, shake: 6},
};
// 🎚️ M17 eases by phase: the wind-up settles INTO the coil · the strike accelerates INTO contact · overshoot on the follow-through · slow recover
const PHASE_EASE = {ready: 'sineInOut', anticipation: 'cubicOut', contact: 'cubicIn', follow: 'backOut', settle: 'sineOut'};
const NAMES = ['ready', 'anticipation', 'contact', 'follow', 'settle'];
const FADE = 110;
const ENEMY_ANT = {light: 300, medium: 400, heavy: 550};   /* ⚡ mo-2 M4: enemies wind up at least this long */   // ms the smear takes to shrink away after contact (2–3 frames)
const err = m => { if (Acting.ERRORS.indexOf(m) < 0) { Acting.ERRORS.push(m); console.warn(m); } };

// ---------- 1 · prep (hook in Acting.play): returns the same list when the act asks for nothing new ----------
function prep(A, beats, key, o) {
  const W = A && A.weight ? WEIGHTS[A.weight] : null;
  if (A && A.weight && !W) err('🎬 unknown weight "' + A.weight + '" (' + key + ')');
  const SIDE = o && (o.side || o.combo);   /* 🔗 ⚡ mo-2 */
  const wants = W || SIDE || beats.some(b => b.hold > 0 || b.smear);
  if (!wants) return beats;
  const ci0 = beats.findIndex(b => b.contact), ci = ci0 >= 0 ? ci0 : Math.min(2, beats.length - 1);
  const ai = beats.findIndex(b => b.name === 'anticipation');
  return beats.map((b0, i) => {
    const b = Object.assign({}, b0), name = b.name || NAMES[i];
    if (W) {
      if (b.ms == null) b.ms = name === 'contact' ? W.contact : name === 'follow' ? W.follow : (W[name] != null ? W[name] : 120);
      if (i === ci && b.tr == null) b.tr = Math.min(b.ms, W.strike);
      if (name === 'follow' && b.tr == null) b.tr = Math.round(b.ms * W.followTr);
      if (!b.ease) b.ease = name === 'follow' ? W.followEase : (i === ci ? PHASE_EASE.contact : PHASE_EASE[name]);
    }
    if (SIDE) {   /* 🔗 ⚡ mo-2: fair wind-ups (M4) + combo recover (M5 · M22) */
      const ms0 = b.ms != null ? b.ms : 120;
      if (name === 'anticipation' && o.side === 'enemy') b.ms = Math.max(ms0, ENEMY_ANT[A.weight] || 300);
      if (name === 'anticipation' && o.side === 'player' && A.weight === 'light') { b.ms = Math.min(ms0, 100); if (b.tr != null) b.tr = Math.min(b.tr, b.ms); }
      if (o.combo === 'mid') { if (name === 'ready') { b.ms = 0; b.tr = 0; } if (name === 'follow') { b.ms = Math.min(ms0, 60); b.tr = Math.min(b.tr != null ? b.tr : b.ms, b.ms); } if (name === 'settle') { b.ms = Math.min(ms0, 40); b.tr = Math.min(b.tr != null ? b.tr : b.ms, b.ms); } }
      if (o.combo === 'last' && name === 'follow') { b.ms = Math.round(ms0 * 1.5); if (b.tr != null) b.tr = Math.round(b.tr * 1.5); }
    }
    if (b.smear && !(i === ci && i > ai)) { err('💨 smear only on the strike (contact) beat — ignored on "' + name + '" (' + key + ')'); delete b.smear; }
    if (b.hold > 0) {   // ⏸️ hold-then-snap = an ease that stays at 0, then runs the beat's own ease in the time left
      const base = Acting.ease(b.ease || Acting.DEF_EASE[name] || (i === ci ? 'snap' : 'inout'));
      const total = b.tr != null ? b.tr : (b.ms != null ? b.ms : 120), h = Math.min(0.95, b.hold / Math.max(1, total));
      b.ease = q => q <= h ? 0 : base((q - h) / (1 - h));
    }
    return b;
  });
}

// ---------- 2 · frame (hook in run.at) ----------
const armA = P => (P.armR != null ? P.armR : 0.15) + (P.elbowR || 0);
function frame(run, f, el) {
  const X = run._m; if (!X) return;
  const A = X.A, W = A.weight ? WEIGHTS[A.weight] : null, P = f.pose, ci = X.ci, calm = X.o && X.o.calm;
  // 🖐️ wrist: the held thing turns at the wrist on top of the hold angle + drag
  if (P.wristR) P.holdRot = (P.holdRot || 0) + P.wristR;
  // 🗡️ weapon lag on the strike (weight acts): the hand leads, the blade catches up ~1 frame later, then whips past
  if (W && A.lag !== false && f.i === ci && el < run.contactMs) {   // before contact only: at contact the blade LANDS
    const d = Math.max(-0.9, Math.min(0.9, (armA(X.sample(el - 45).pose) - armA(P)) * W.lag));
    if (Math.abs(d) > 1e-4) P.holdRot = (P.holdRot || 0) + d;
  }
  const cMs = run.contactMs, s0 = X.start[ci], stop = X.STOP;
  // 💨 smear: the contact beat's travel; grows with the swing, stays through the hit-stop, then shrinks + fades (FADE ms)
  const B = run.beats[ci];
  if (B && B.smear && el >= s0) {
    const fade = calm ? FADE / 2 : FADE, end = cMs + stop + fade;
    if (el < end) {
      let a = s0, b = Math.min(el, cMs), alpha = 1;
      if (el > cMs + stop) { const q = (el - cMs - stop) / fade; a = s0 + (cMs - s0) * q; alpha = 1 - 0.7 * q; }
      if (calm) a = Math.max(a, b - (cMs - s0) / 2);
      if (b - a > 0.5) {
        const n = 10, poses = [];
        for (let j = 0; j <= n; j++) { const Q = Object.assign({}, X.sample(a + (b - a) * j / n).pose); if (Q.wristR) Q.holdRot = (Q.holdRot || 0) + Q.wristR; poses.push(Q); }
        const kind = B.smear === true ? (A.weight === 'heavy' ? 'heavy' : 'light') : B.smear;
        f.smear = {kind, poses, alpha, col: colOf(A, X.o)};
        f.id += '~s' + Math.round((el - s0) / 16);
      }
    }
  }
  // 🔄 a swing that went over the top ends with angles past ±π: show the same picture with angles in (−π, π] so the next act blends the short way
  if (W) ['armR', 'armL', 'holdRot'].forEach(k2 => { let v = P[k2]; if (v != null && Math.abs(v) > Math.PI) { v = ((v + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; P[k2] = v; } });
  // ⚡ mo-2 wind-up glow: enemies (and heavy player moves) light up from the anticipation start to contact
  const o2 = X.o || {};
  if (o2.glow || o2.side === 'enemy' || (o2.side === 'player' && A.weight === 'heavy')) {
    const ai = run.beats.findIndex(b => b.name === 'anticipation'), g0 = ai >= 0 ? X.start[ai] : 0;
    if (el >= g0 && el < cMs) { const q = Math.min(1, (el - g0) / Math.max(1, cMs - g0)); f.glow = q; f.id += '~g' + Math.round(q * 10); }
  }
  // 🔗 mo-2 the LAST hit of a combo throws sparks from the tip
  if ((o2.combo === 'last' || o2.sparks) && el >= cMs) { const q = (el - cMs) / (stop + 240); if (q < 1) { f.sparks = q; f.id += '~k' + Math.round(q * 12); } }
  // 🦘 mo-2 landing dust + ring (Motion.land acts)
  if (A.land && el >= cMs) { const q = (el - cMs) / 460; if (q < 1) { f.land = {q, n: A.land.dust, ring: A.land.ring}; f.id += '~l' + Math.round(q * 12); } }
  // 📳 shake: heavy acts, from contact, through the hit-stop, then 160 ms down to 0
  // 🌀 mo-3 spin (yaw through the turn, arms out, 💨 ring) + 🧣 the act's own history for the hang parts (non-enumerable: never copied / sent)
  if (A.spin) spinFrame(run, X, f, el);
  if (!f._mo) Object.defineProperty(f, '_mo', {value: {poseAt: ms => { const Q = Object.assign({}, X.sample(el - ms).pose); if (Q.wristR) Q.holdRot = (Q.holdRot || 0) + Q.wristR; if (A.spin) spinPose(run, X, Q, el - ms); return Q; }}});
  const amp = calm ? 0 : (A.shake != null ? A.shake : (W ? W.shake : 0));
  if (amp > 0 && el >= cMs) { const q = (el - cMs) / (stop + 160); if (q < 1) f.shake = amp * (1 - q); }
}
function colOf(A, o) {
  const c = (o && o.smearCol) || A.smearCol, e = (o && o.element) || A.element;
  if (c) return c;
  if (e && window.ActionFX && ActionFX.EL && ActionFX.EL[e]) return ActionFX.EL[e][1];
  return '#FFFFFF';
}

// ---------- 3 · drawSmear (hook in Acting.draw) ----------
// where the hand + blade tip are for a pose (avatar units, facing +x, feet at 0, 0) — the same transforms as drawAvatar
function bodyPoint(P, x, y) {
  const rotAbout = (cx, cy, a) => { const dx = x - cx, dy = y - cy, c = Math.cos(a), s = Math.sin(a); x = cx + dx * c - dy * s; y = cy + dx * s + dy * c; };
  if (P.bend) rotAbout(0, -20, P.bend); if (P.rot) rotAbout(0, 0, P.rot); if (P.rotFull) rotAbout(0, -34, P.rotFull);
  return [x * (P.sx || 1) + (P.shift || 0), y * (P.sy || 1) + (P.dy || 0)];
}
const BASE = 0.27;   // a held thing points 0.27 rad clockwise from straight up when holdRot = 0 (fx-1b note)
function points(P, L) {
  const Q = Object.assign({armR: 0.15}, P), h = AKJ.frontHand(Q, 1, 16 * (Q.reach || 1)), a = BASE + (Q.holdRot || 0), s = Math.sin(a), c = Math.cos(a);
  return {hand: bodyPoint(Q, h[0], h[1]), tip: bodyPoint(Q, h[0] + s * L, h[1] - c * L), mid: bodyPoint(Q, h[0] + s * L * 0.45, h[1] - c * L * 0.45)};
}
// reach of what the avatar holds (avatar units at k = 1): weapons by type size, rackets / bats, else the fist (a short swoosh)
function reach(who) {
  const av = who && who.av, h = av && av.eq && av.eq.hand;
  if (!h) return 7;
  if (h.id === 'weapon' && window.AvWeapons && AvWeapons.info) { const I = AvWeapons.info(h.v), t = I && I.type; if (t) return t.hand === 'two' ? 36 : Math.round(t.size * 0.64); }
  if (h.id === 'racket' || h.id === 'bat') return 24;
  return 20;
}
function drawSmear(g, x0, y, k, dir, f, who, opt) {   // the Acting.draw hook: smear (mo-1) + combo sparks + landing dust (mo-2)
  if (f.smear && !viewBehind(opt)) smearOnly(g, x0, y, k, dir, f, who, opt);
  if (f.ring) ringFx(g, x0, y, k, dir, f, 'front');   /* 🌀 mo-3 */
  if (f.sparks != null) drawSparks(g, x0, y, k, dir, f, who);
  if (f.land) landFx(g, x0, y, k, f.land, (opt && opt.calm) || false);
}
function smearOnly(g, x0, y, k, dir, f, who, opt, under) {
  const S = f.smear; if (!S || !S.poses || S.poses.length < 2) return;
  const L = (f.act && f.act.reach) || reach(who), W = p => [x0 + p[0] * k * dir, y + p[1] * k];
  const path = S.poses.map(P => { const q = points(P, L); return {hand: W(q.hand), tip: W(q.tip), mid: W(q.mid)}; });
  g.save();
  // never over the face: cut the head circle out (AK.head = where drawAvatar just put the head)
  const H = window.AK && AK.head;
  if (H && H.m && g.getTransform && !under) {
    const m = g.getTransform().inverse().multiply(H.m), c = m.transformPoint({x: 0, y: H.hy}), r = 21 * H.k * Math.hypot(m.a, m.b);
    g.beginPath(); g.rect(-1e5, -1e5, 2e5, 2e5); g.arc(c.x, c.y, r, 0, Math.PI * 2, true); g.clip('evenodd');
  }
  g.globalAlpha *= S.alpha;
  if (S.kind === 'heavy') {   // ONE filled angular crescent: the tips outside, the blade middles inside (thin at the old end)
    g.beginPath(); path.forEach((p, i) => i ? g.lineTo(p.tip[0], p.tip[1]) : g.moveTo(p.tip[0], p.tip[1]));
    for (let i = path.length - 1; i >= 0; i--) { const p = path[i], q = i / (path.length - 1), w = 0.55 - 0.45 * q; g.lineTo(p.mid[0] + (p.tip[0] - p.mid[0]) * w, p.mid[1] + (p.tip[1] - p.mid[1]) * w); }
    g.closePath(); g.lineJoin = 'miter'; g.fillStyle = S.col; g.fill(); g.lineWidth = Math.max(1, 1.4 * k); g.strokeStyle = 'rgba(43,45,66,0.55)'; g.stroke();
  } else {                    // thin straight-edged arc lines at the tip and a little inside it, dark under-line so they read on any ground
    g.lineJoin = 'miter'; g.lineCap = 'butt';
    [[1, 2.6], [0.84, 1.7], [0.68, 1.1]].forEach(([fr, w], n) => {
      const pts = path.slice(n).map(p => [p.hand[0] + (p.tip[0] - p.hand[0]) * fr, p.hand[1] + (p.tip[1] - p.hand[1]) * fr]); if (pts.length < 2) return;
      [['rgba(43,45,66,0.45)', w * 1.9], [S.col, w]].forEach(([col, lw]) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.strokeStyle = col; g.lineWidth = Math.max(0.8, lw * k * 0.9); g.stroke(); });
    });
  }
  g.restore();
}
function shake(f, t) {
  const a = f && f.shake; if (!a) return {x: 0, y: 0};
  t = t != null ? t : performance.now() / 1000;
  return {x: Math.sin(t * 91) * a, y: Math.cos(t * 77) * a * 0.6};
}

// ======================= 🎬 mo-2 (🎬 Motion chat, 2026-11-18): 💥 hit · 🤕 knock-back · 🦘 landing · 🔗 sparks · ⚡ glow =======================
// FX look from Aowu's FX samples (Animation References 2aYriR · PuXDlJ · SlzOMK · XVd5sg · iX4Ge4 · oOx3wD): a WHITE shape first (1 frame) →
// the BIGGEST full-colour burst (1 frame) → the cloud BREAKS into pieces while its colour COOLS (white → yellow → orange → pink → purple → navy);
// sparks become thin dashes, rings grow + break into dots. Units: avatar units × k. Times: ms. No emoji, no shadowBlur (M15).
const TAU = Math.PI * 2;
const RAMP = ['#FFFFFF', '#FFF4B8', '#FFC83D', '#FF8A3D', '#F2558F', '#9B5CD0', '#4D5B9E'];   // hot → cool
const HIT = {   // freeze ms · shake px · burst radius (units) · FX life after the burst (ms) · sparks · reaction
  light:  {stop: 60,  shake: 2, R: 13, life: 260, sparks: 6,  react: 'light'},
  medium: {stop: 80,  shake: 3, R: 17, life: 340, sparks: 8,  react: 'medium'},
  heavy:  {stop: 120, shake: 6, R: 23, life: 440, sparks: 10, react: 'heavy'}};
let SEED = 1;
function rnd(seed) { let s = (seed >>> 0) || 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function hexRgb(h) { const n = parseInt(String(h).replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mixHex(a, b, q) { const A = hexRgb(a), B = hexRgb(b); return '#' + A.map((v, i) => (256 + Math.round(v + (B[i] - v) * q)).toString(16).slice(1)).join(''); }   // stays '#rrggbb' so ramps can mix again
function rampOf(el, col) {   // an element ramp keeps the white → … → navy shape
  const E = el && window.ActionFX && ActionFX.EL && ActionFX.EL[el];
  if (E) return ['#FFFFFF', E[2], E[1], E[0], mixHex(E[0], '#4D5B9E', 0.45), mixHex(E[0], '#4D5B9E', 0.75), '#4D5B9E'];
  if (col) return ['#FFFFFF', mixHex(col, '#FFFFFF', 0.7), mixHex(col, '#FFFFFF', 0.35), col, mixHex(col, '#4D5B9E', 0.45), mixHex(col, '#4D5B9E', 0.75), '#4D5B9E'];
  return RAMP;
}
const rampAt = (R, q) => { const x = Math.max(0, Math.min(0.999, q)) * (R.length - 1), i = Math.floor(x); return mixHex(R[i], R[i + 1], x - i); };
const cl = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, q) => a + (b - a) * q;
const outC = q => 1 - Math.pow(1 - cl(q, 0, 1), 3), sIO = q => 0.5 - Math.cos(Math.PI * cl(q, 0, 1)) / 2;
const RP = n => { const P = Acting.pose && Acting.pose('fx.' + n); return Object.assign({}, P || {}, {shift: 0}); };
const STAND = {armR: 0.35, armL: 0.35};
function mixP(A, B, q) { const o = {}; new Set(Object.keys(A).concat(Object.keys(B))).forEach(k => { const a = A[k], b = B[k];
  if (typeof a !== 'number' && a != null || typeof b !== 'number' && b != null) { o[k] = q < 0.5 ? (a != null ? a : b) : (b != null ? b : a); return; }
  const n = (k === 'sx' || k === 'sy' || k === 'headSc') ? 1 : 0; o[k] = lerp(a == null ? n : a, b == null ? n : b, q); }); return o; }
function keysAt(K, t, poseOf) {   // [[ms, pose, extra]] → mixed pose + the segment
  t = cl(t, 0, K[K.length - 1][0]); let i = 1; while (i < K.length - 1 && t >= K[i][0]) i++;
  const a = K[i - 1], b = K[i], q = cl((t - a[0]) / Math.max(1, b[0] - a[0]), 0, 1); return {a, b, q, pose: mixP(poseOf(a[1]), poseOf(b[1]), sIO(q))};
}
const poseOf = n => typeof n === 'object' ? Object.assign({}, n) : n === 'stand' ? Object.assign({}, STAND) : RP(n);

// ---------- 💥 HIT (M9 · M9+) ----------
// Motion.hit([target,] {kind: 'slash' | 'thrust' | 'blunt' | 'fist', weight, ko, element, col, calm, seed, ang}) → H
function hit(a, b) {
  const o = Object.assign({kind: 'slash', weight: 'medium', ko: false, calm: false}, b || a || {});
  const W = HIT[o.weight] || HIT.medium, stop = o.ko ? 160 : W.stop, amp = o.calm ? 0 : Math.min(8, W.shake + (o.ko ? 2 : 0));
  const R = rnd(o.seed != null ? o.seed : (SEED = (SEED * 48271) % 2147483647)), ramp = rampOf(o.element, o.col);
  const size = W.R * (o.kind === 'blunt' ? 1.15 : o.kind === 'slash' ? 0.8 : o.kind === 'fist' ? 0.85 : 0.9) * (o.ko ? 1.15 : 1);
  const cells = Array.from({length: 16}, (_, i) => ({a: i / 16 * TAU + R() * 0.5, d: 0.25 + R() * 0.65, r: 0.28 + R() * 0.3, th: 0.25 + R() * 0.75}));
  const spikes = Array.from({length: 9}, () => 0.55 + R() * 0.65);
  const nS = o.calm ? Math.ceil(W.sparks / 2) : W.sparks, sparks = Array.from({length: nS}, () => ({a: R() * TAU, v: 1.1 + R() * 1.4, len: 0.35 + R() * 0.4, c: 1 + Math.floor(R() * 3)}));
  const debris = (o.kind === 'blunt' || o.weight === 'heavy') ? Array.from({length: 3 + (o.weight === 'heavy' ? 1 : 0)}, () => ({a: -Math.PI / 2 + (R() - 0.5) * 2.6, v: 1.3 + R() * 0.9, s: 0.12 + R() * 0.08, spin: (R() - 0.5) * 8})) : [];
  const ang = o.ang != null ? o.ang : o.kind === 'slash' ? -0.55 : o.kind === 'thrust' ? 0 : 0, life = W.life + (o.ko ? 120 : 0), end = 100 + life;
  // the hit body's reaction: light = flinch · medium / heavy = impact → stumble → wobble → guard (heavy + KO: the game hands over to Motion.knock after the freeze)
  const RK = W.react === 'light' ? [[0, 'r-flinch'], [stop + 90, 'r-flinch'], [stop + 260, 'stand']]
    : [[0, 'r-impact'], [stop, 'r-impact'], [stop + 140, 'r-stumble'], [stop + 340, 'r-wobble'], [stop + 520, 'stand']];
  function at(t) {
    const fl = t < 0 ? 0 : t < 33 ? 1 : t < 50 ? 0.6 : t < 67 ? 0.35 : t < 84 ? 0.15 : 0;
    const sq = amp && t >= 0 ? Math.max(0, 1 - t / (stop + 160)) : 0, s = keysAt(RK, Math.max(0, t), poseOf);
    return {t, freeze: t >= 0 && t < stop, flash: fl * (o.calm ? 0.5 : 1), amp: amp * sq,
      shake: sq ? {x: Math.sin(t * 0.091) * amp * sq, y: Math.cos(t * 0.077) * amp * sq * 0.6} : {x: 0, y: 0},
      frame: {id: 'hit#' + Math.round(t / 17), pose: s.pose, face: t > stop + 420 ? 'determined' : 'hurt', act: {}, beat: s.a[1]},
      ck: {act: 'hurt', ms: Math.min(400, 60 + Math.max(0, t - stop))}, fxOn: t >= 0 && t < end, done: t >= Math.max(end, RK[RK.length - 1][0])};
  }
  return {o, stop, amp, size, ramp, cells, spikes, sparks, debris, ang, life, end, at, react: RK[RK.length - 1][0]};
}
// 🤍 flash: paint the body into a small scratch box, turn every painted pixel white, put it back (only on the 2–5 flash frames)
let SC = null;
function flash(g, paint, amt, box) {
  if (!(amt > 0)) { paint(g); return; }
  const m = g.getTransform(), bx = box || [-1e4, -1e4, 2e4, 2e4];
  let X0 = Math.floor(m.a * bx[0] + m.e), Y0 = Math.floor(m.d * bx[1] + m.f), w = Math.ceil(m.a * bx[2]) + 2, h = Math.ceil(m.d * bx[3]) + 2;
  const cw = g.canvas.width, ch = g.canvas.height; if (X0 < 0) { w += X0; X0 = 0; } if (Y0 < 0) { h += Y0; Y0 = 0; } w = Math.min(w, cw - X0); h = Math.min(h, ch - Y0);
  if (w <= 0 || h <= 0 || m.b || m.c) { paint(g); return; }
  if (!SC || SC.width < w || SC.height < h) { SC = document.createElement('canvas'); SC.width = Math.max(w, SC ? SC.width : 0); SC.height = Math.max(h, SC ? SC.height : 0); }
  const G = SC.getContext('2d'); G.setTransform(1, 0, 0, 1, 0, 0); G.globalCompositeOperation = 'source-over'; G.globalAlpha = 1; G.clearRect(0, 0, w, h);
  const h0 = window.AK && AK.head; G.setTransform(m.a, 0, 0, m.d, m.e - X0, m.f - Y0); paint(G);
  if (window.AK && AK.head && AK.head !== h0 && AK.head.m) AK.head.m = new DOMMatrix().translate(X0, Y0).multiply(AK.head.m);   // the head as seen on g (face rule)
  G.setTransform(1, 0, 0, 1, 0, 0); G.globalCompositeOperation = 'source-atop'; G.fillStyle = 'rgba(255,255,255,' + amt + ')'; G.fillRect(0, 0, w, h); G.globalCompositeOperation = 'source-over';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(SC, 0, 0, w, h, X0, Y0, w, h); g.restore();
}
// FX of a hit at (x, y) — t = ms since contact (FX keep running during the freeze: M9+)
function drawHitFx(g, H, t, x, y, k, dir) {
  if (!H || t < 0 || t >= H.end) return;
  const o = H.o, Rr = H.size * k, Rm = H.ramp, d = dir || 1;
  g.save(); g.translate(x, y); g.lineJoin = 'miter'; g.lineCap = 'butt';
  const starPath = (r, sp) => { g.beginPath(); const n = H.spikes.length; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU + 0.2, rr = i % 2 ? r * 0.45 : r * H.spikes[i >> 1]; g.lineTo(Math.cos(a) * rr * (sp || 1), Math.sin(a) * rr); } g.closePath(); };
  // 1 · white shape (0–50 ms) — calm skips it
  if (t < 50 && !o.calm) { starPath(Rr * 0.75); g.fillStyle = '#FFFFFF'; g.fill(); g.lineWidth = Math.max(1, 1.2 * k); g.strokeStyle = Rm[2]; g.stroke(); }
  // 2 · the biggest burst (50–100 ms)
  else if (t < 100) { const a0 = o.calm ? 0.8 : 1; g.globalAlpha = a0; starPath(Rr * 1.15); g.fillStyle = Rm[2]; g.fill(); starPath(Rr * 0.8); g.fillStyle = Rm[1]; g.fill();
    g.beginPath(); g.arc(0, 0, Rr * 0.35, 0, TAU); g.fillStyle = '#FFFFFF'; g.fill(); g.globalAlpha = 1; }
  // 3 · the cloud breaks into pieces + cools (100 → end)
  else { const q = (t - 100) / H.life;
    H.cells.forEach(c => { if (q > c.th) return; const fall = q / c.th, r = c.r * Rr * (1 - fall * 0.65), dd = c.d * Rr * (0.9 + q * 0.9);
      g.fillStyle = rampAt(Rm, 0.25 + q * 0.8); g.beginPath(); g.arc(Math.cos(c.a) * dd, Math.sin(c.a) * dd * 0.85, Math.max(0.6, r), 0, TAU); g.fill(); }); }
  // sparks: thin dashes thrown out from 50 ms, they shorten + break in two
  if (t >= 50) { const q = cl((t - 50) / (H.life + 30), 0, 1), e = outC(q);
    H.sparks.forEach(s => { const r0 = Rr * (0.7 + s.v * e * 1.6), L = Rr * s.len * (1 - q), ca = Math.cos(s.a), sa = Math.sin(s.a); if (L < 0.4) return;
      g.strokeStyle = rampAt(Rm, 0.15 + q * 0.75 + s.c * 0.05); g.lineWidth = Math.max(0.8, 2 * k * (1 - q * 0.6));
      const gap = q > 0.4 ? L * 0.35 : 0; g.beginPath(); g.moveTo(ca * r0, sa * r0); g.lineTo(ca * (r0 + (L - gap) / 2), sa * (r0 + (L - gap) / 2));
      g.moveTo(ca * (r0 + (L + gap) / 2), sa * (r0 + (L + gap) / 2)); g.lineTo(ca * (r0 + L), sa * (r0 + L)); g.stroke(); }); }
  // kind marks
  if (o.kind === 'slash' || o.kind === 'thrust') {   // a bright cut that thins, then breaks into dashes that drift along it
    const q = cl(t / (H.life * 0.75), 0, 1), L = Rr * (o.kind === 'slash' ? 5.2 : 4.6) * (0.6 + 0.4 * Math.min(1, t / 50)), w = Rr * 0.42 * (1 - q * 0.7);
    g.save(); g.rotate(o.kind === 'thrust' ? 0 : H.ang * d); if (o.kind === 'thrust' && d < 0) g.scale(-1, 1);
    if (q < 0.45) { [[w * 1.8, Rm[3], 0.5], [w, Rm[1], 1], [w * 0.4, '#FFFFFF', 1]].forEach(([ww, col, al]) => { g.globalAlpha = al * (1 - q); g.fillStyle = col; g.beginPath();
      g.moveTo(-L / 2, 0); g.quadraticCurveTo(0, -ww, L / 2, 0); g.quadraticCurveTo(0, ww * 0.6, -L / 2, 0); g.fill(); }); }
    else { const n = 4; for (let i = 0; i < n; i++) { const u = -L / 2 + (i + 0.5) * L / n + (q - 0.45) * L * 0.5 * (o.kind === 'thrust' ? 1 : 0.6), seg = L / n * (1.15 - q) * 0.85;
      g.globalAlpha = 1 - q; g.strokeStyle = rampAt(Rm, 0.2 + q * 0.7); g.lineWidth = Math.max(1, w * 0.8); g.beginPath(); g.moveTo(u - seg / 2, 0); g.lineTo(u + seg / 2, 0); g.stroke(); } }
    g.restore(); g.globalAlpha = 1;
  }
  if (o.kind === 'fist' || o.kind === 'blunt' || o.ko) {   // a ring that grows, thins and breaks into dots
    const q = cl((t - 40) / (H.life * 0.8), 0, 1); if (t >= 40 && q < 1) { const r = Rr * (0.8 + q * 1.7), n = q < 0.35 ? 0 : 14;
      g.strokeStyle = rampAt(Rm, 0.2 + q * 0.7); g.lineWidth = Math.max(0.8, 3 * k * (1 - q));
      if (!n) { g.beginPath(); g.ellipse(0, 0, r, r * 0.85, 0, 0, TAU); g.stroke(); }
      else { const on = (1 - q) * 0.75; for (let i = 0; i < n; i++) { const a = i / n * TAU; g.beginPath(); g.ellipse(0, 0, r, r * 0.85, 0, a, a + TAU / n * on); g.stroke(); } } }
  }
  // debris chunks: thrown, fall, spin, fade (blunt + heavy)
  if (t >= 50 && H.debris.length) { const tt = (t - 50) / 1000;
    H.debris.forEach(c => { const vx = Math.cos(c.a) * c.v * Rr * 3.2, vy = Math.sin(c.a) * c.v * Rr * 3.2, px = Math.cos(c.a) * Rr * 0.9 + vx * tt, py = Math.sin(c.a) * Rr * 0.9 + vy * tt + 0.5 * Rr * 40 * tt * tt,   /* thrown from the burst edge */ a = 1 - cl((t - 50) / H.life, 0, 1);
      if (a <= 0) return; g.save(); g.translate(px, py); g.rotate(c.spin * tt); g.globalAlpha = a; const s = c.s * Rr * 2.4;
      g.fillStyle = '#8F96B0'; g.strokeStyle = '#4D5B9E'; g.lineWidth = Math.max(0.8, k); g.beginPath(); g.moveTo(-s, -s * 0.5); g.lineTo(s * 0.6, -s * 0.7); g.lineTo(s, s * 0.4); g.lineTo(-s * 0.4, s * 0.7); g.closePath(); g.fill(); g.stroke(); g.restore(); }); }
  g.restore();
}
// body + flash + FX in one call. paint(G) draws the hit body (Acting.draw / Creatures.draw); o = {x, y (feet), k, dir (the way the body faces), at: [x, y], h (body height units)}
function drawHit(g, H, t, paint, o) {
  o = o || {}; const k = o.k || 1, hgt = (o.h || 80) * k, a = H.at(t), head0 = window.AK && AK.head;
  flash(g, paint, a.flash, o.x != null ? [o.x - hgt * 0.9, o.y - hgt * 1.15, hgt * 1.8, hgt * 1.3] : null);
  const head = window.AK && AK.head, x = o.at ? o.at[0] : o.x + 2 * k * (o.dir || 1), y = o.at ? o.at[1] : o.y - (o.h ? hgt * 0.5 : 40 * k);
  g.save();
  if (head && head !== head0 && head.m && g.getTransform) {   // 😊 never on the face: cut the head circle of the body just painted
    const m = g.getTransform().inverse().multiply(head.m), c = m.transformPoint({x: 0, y: head.hy}), r = 21 * head.k * Math.hypot(m.a, m.b);
    g.beginPath(); g.rect(-1e5, -1e5, 2e5, 2e5); g.arc(c.x, c.y, r, 0, TAU, true); g.clip('evenodd');
  }
  drawHitFx(g, H, t, x, y, k, -(o.dir || 1)); g.restore();
  return a;
}

// ---------- 🤕 KNOCK (M10) — keys [ms, dx, lift, pose, extra]: dx / lift in avatar units ----------
const KNOCK = {
  light:  [[0, 0, 0, 'r-flinch'], [120, 7, 0, 'r-stumble'], [220, 11, 0, 'r-stumble', {dust: 1}], [420, 12, 0, 'stand']],
  medium: [[0, 0, 0, 'r-impact'], [130, 13, 15, 'r-air'], [260, 26, 0, 'r-land', {sq: 0.12, dust: 2}], [380, 34, 0, 'r-skid', {dust: 1}], [560, 36, 0, 'r-wobble'], [700, 36, 0, 'stand']],
  heavy:  [[0, 0, 0, 'r-impact'], [200, 28, 44, 'r-air', {rot: -0.6}], [420, 60, 0, 'r-down', {sq: 0.2, dust: 3, ring: 1, safe: 1}], [520, 70, 9, 'r-down', {safe: 1}], [640, 78, 0, 'r-down', {safe: 1, dust: 1}],
           [860, 96, 0, 'r-down', {safe: 1, dust: 2}], [1160, 96, 0, 'r-down', {safe: 1}], [1460, 96, 0, 'r-up', {safe: 1}], [1640, 96, 0, 'stand']]};
// Motion.knock([target,] {weight, ko, wall: free units behind, creature, loot, grace: ms}) → K · K.at(t) = {dx, lift, frame, phase, safe, wall, dust, ring, puff, coin, gone, done, ck}
function knock(a, b) {
  const o = Object.assign({weight: 'medium', ko: false, wall: Infinity, grace: 300}, b || a || {});
  let K = (KNOCK[o.weight] || KNOCK.medium).map(r => r.slice());
  if (o.ko && o.weight === 'heavy') {   // KO: stays down longer; avatars get up dizzy, creatures puff away (+ 🪙 loot)
    K[6][0] = 1460; K[6][4] = {safe: 1, puff: 1}; K[7][0] = 1760; K[8][0] = 2000; K[8][3] = o.creature ? 'r-down' : 'r-wobble';
  }
  let hitWall = null;
  if (o.wall < Infinity) for (let i = 1; i < K.length; i++) if (K[i][1] > o.wall) {
    const A = K[i - 1], B = K[i], q = (o.wall - A[1]) / (B[1] - A[1]), tw = A[0] + (B[0] - A[0]) * q, lw = A[2] + (B[2] - A[2]) * q, W2 = Math.max(0, o.wall - 9);
    hitWall = tw; K = K.slice(0, i).concat([[tw, o.wall, lw, 'r-impact', {wall: 1}], [tw + 90, o.wall, lw, 'r-impact', {wall: 1, dust: 2}], [tw + 260, W2, 0, 'r-down', {sq: 0.15, safe: 1, dust: 2}],
      [tw + 600, W2, 0, 'r-down', {safe: 1}], [tw + 900, W2, 0, 'r-up', {safe: 1}], [tw + 1080, W2, 0, 'stand']]); break; }
  const end = K[K.length - 1][0], downAt = (K.find(r => r[4] && r[4].safe) || [null])[0];
  function at(t) {
    const tc = cl(t, 0, end); let i = 1; while (i < K.length - 1 && tc >= K[i][0]) i++;
    const A = K[i - 1], B = K[i], q = cl((tc - A[0]) / Math.max(1, B[0] - A[0]), 0, 1), air = A[2] > 0 || B[2] > 0;
    const lift = !air ? 0 : A[2] > 0 && B[2] === 0 ? A[2] * (1 - q * q) : B[2] > 0 && A[2] === 0 ? B[2] * Math.sin(q * Math.PI / 2) : lerp(A[2], B[2], q);
    const dx = lerp(A[1], B[1], air ? q : outC(q)), E = A[4] || {}, pose = mixP(poseOf(A[3]), poseOf(B[3]), sIO(q));
    if (E.sq && q < 0.5) { const s = E.sq * (1 - q * 2); pose.sy = (pose.sy || 1) * (1 - s); pose.sx = (pose.sx || 1) * (1 + s * 0.6); }
    if (E.wall) { pose.sx = (pose.sx || 1) * 0.82; pose.sy = (pose.sy || 1) * 1.05; }
    if ((B[4] || {}).rot) pose.rotFull = (pose.rotFull || 0) + B[4].rot * Math.sin(q * Math.PI);
    const puff = E.puff ? q : (o.ko && o.creature && tc >= end && downAt != null ? 1 : 0), gone = o.ko && o.creature && (E.puff ? q > 0.55 : tc >= K[K.length - 2][0]);
    const safe = (t < end && !!E.safe) || (downAt != null && t >= downAt && t < end + o.grace);
    const pk = K.find(r => r[4] && r[4].puff), coin = o.ko && o.creature && o.loot !== false && pk && t >= pk[0] + 120 && t < pk[0] + 820 ? (t - pk[0] - 120) / 700 : 0;
    const ph = t >= end ? B[3] : A[3];
    return {t, dx, lift, pose, phase: ph, safe, wall: !!E.wall, dust: E.dust ? {n: E.dust, q} : null, ring: E.ring ? q : null, puff, coin, gone,
      frame: {id: 'knock#' + i + ':' + Math.round(q * 6), pose, face: ph === 'stand' ? 'determined' : ph === 'r-wobble' ? 'dizzy' : 'hurt', act: {}, beat: ph},
      ck: {act: ph === 'r-down' ? 'ko' : 'hurt', ms: ph === 'r-down' ? 400 : 120}, done: t >= end};
  }
  return {o, K, end, at, hitWall};
}
// dust · ground ring · KO puff · 🪙 loot coin at the body's feet (x, y). dir = the way it flies (dust kicks back the other way)
function drawKnockFx(g, K, t, x, y, k, dir) {
  const s = K.at(t); if (s.dust) dustFx(g, x, y, k, s.dust.n, Math.min(0.75, s.dust.q), -(dir || 1));
  if (s.ring != null) groundRing(g, x, y, k, s.ring, 1.4);
  if (s.puff > 0) puffFx(g, x, y - 20 * k, 26 * k, s.puff, K.o.element);
  if (s.coin > 0 && s.coin < 1) coinFx(g, x + 10 * k * (dir || 1), y, k, s.coin);
  return s;
}
function dustFx(g, x, y, k, n, q, back) {   // soft puffs that grow, rise a little, cool to grey and break up
  g.save(); for (let i = 0; i < n * 2; i++) { const s = i % 2 ? 1 : -1, d = (10 + (i >> 1) * 9 + q * 14) * k * (s === back ? 1 : 0.6), r = (5 + n * 1.2 - (i >> 1)) * k * (1 - q * 0.55);
    if ((i * 0.37) % 1 < q * 0.8 - 0.2) continue; g.globalAlpha = 1 - q * 0.6; g.fillStyle = mixHex('#F3EAD9', '#B9BEDA', q); g.strokeStyle = mixHex('#C9B79C', '#8F96B0', q); g.lineWidth = Math.max(0.8, 1.2 * k);
    g.beginPath(); g.arc(x + s * d, y - (2 + (i % 3) * 2 + q * 4) * k, Math.max(1.2, r), 0, TAU); g.fill(); g.stroke(); } g.restore(); }
function groundRing(g, x, y, k, q, size) {   // a half dome on the floor that grows, thins and breaks into dashes (SlzOMK)
  if (q >= 1) return; const r = (14 + 40 * outC(q)) * k * (size || 1), n = q < 0.3 ? 1 : 10, on = n === 1 ? 1 : (1 - q) * 0.8;
  g.save(); g.strokeStyle = rampAt(RAMP, 0.3 + q * 0.6); g.lineWidth = Math.max(0.8, 3 * k * (1 - q)); g.globalAlpha = 1 - q * 0.5;
  for (let i = 0; i < n; i++) { const a0 = Math.PI + i / n * Math.PI, a1 = a0 + Math.PI / n * on; g.beginPath(); g.ellipse(x, y, r, r * 0.38, 0, a0, a1); g.stroke(); }
  g.restore(); }
function puffFx(g, x, y, r, q, el) {   // 💫 KO: a candy cloud that breaks into cool pieces + 3 little 4-point stars (shapes, no emoji)
  const R = rnd(91), Rm = el ? rampOf(el) : ['#FFFFFF', '#F4F1FF', '#DCD6FF', '#B9B1F0', '#9B8FD6', '#7166B4', '#4D5B9E'];
  g.save(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + R() * 0.4, d = r * (0.3 + R() * 0.5) * (0.8 + q * 0.9), th = 0.35 + R() * 0.65, rr = r * (0.3 + R() * 0.2) * (1 - q * 0.6);
    if (q > th) continue; g.fillStyle = rampAt(Rm, q * 0.95); g.strokeStyle = 'rgba(77,91,158,' + (0.35 * (1 - q)) + ')'; g.lineWidth = 1.2;
    g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.75, Math.max(0.8, rr), 0, TAU); g.fill(); g.stroke(); }
  if (q < 0.85) [-0.9, 0, 0.9].forEach((a, i) => { const sx = x + Math.cos(a - Math.PI / 2) * r * (0.9 + q * 0.8), sy = y + Math.sin(a - Math.PI / 2) * r * (0.9 + q * 0.8) - q * r * 0.4, s = r * (i === 1 ? 0.28 : 0.2) * (1 - q * 0.5);
    g.fillStyle = '#FFD84D'; g.strokeStyle = '#B07A00'; g.lineWidth = 1.2; g.beginPath(); for (let j = 0; j < 8; j++) { const b = j / 8 * TAU, rr = j % 2 ? s * 0.38 : s; g.lineTo(sx + Math.cos(b) * rr, sy + Math.sin(b) * rr); } g.closePath(); g.fill(); g.stroke(); });
  g.restore(); }
function coinFx(g, x, y, k, q) {   // 🪙 loot pop: fast up, slow at the top, fall, squash, small bounce, a shine sweeps across (61-Idle)
  let h, sq = 1; const u = q * 700;
  if (u < 160) h = 30 * Math.sin(u / 160 * Math.PI / 2); else if (u < 360) h = 30 * (1 - Math.pow((u - 160) / 200, 2)); else if (u < 420) { h = 0; sq = 1 - 0.3 * Math.sin((u - 360) / 60 * Math.PI); }
  else if (u < 560) h = 7 * Math.sin((u - 420) / 140 * Math.PI); else h = 0;
  const r = 6 * k, cy = y - h * k - r * sq, turn = Math.abs(Math.cos(u / 90)) * 0.7 + 0.3;
  g.save(); g.translate(x, cy); g.scale(turn / sq, sq); g.fillStyle = '#FFC83D'; g.strokeStyle = '#B07A00'; g.lineWidth = 1.4 / Math.max(0.3, turn);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#FFE58A'; g.beginPath(); g.arc(0, 0, r * 0.55, 0, TAU); g.fill();
  if (u > 520) { const sx = -r + (u - 520) / 180 * r * 2; g.save(); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.clip(); g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(sx - r * 0.2, -r, r * 0.35, r * 2); g.restore(); }
  g.restore(); }

// ---------- 🦘 LAND (M11) ----------
const SQ = [[0, 0], [0.5, 6], [1, 15], [3, 28]];
function landInfo(o) { o = o || {}; const h = o.height != null ? o.height : (o.vy || 0) * (o.vy || 0) / (2 * (o.g || 9.8));
  let s = 28; if (h >= 3) s = Math.min(30, 28 + (h - 3)); else for (let i = 1; i < SQ.length; i++) if (h <= SQ[i][0]) { s = lerp(SQ[i - 1][1], SQ[i][1], (h - SQ[i - 1][0]) / (SQ[i][0] - SQ[i - 1][0])); break; }
  return {h, squash: Math.round(s), hold: Math.round(Math.min(120, 40 + h * 25)), dust: Math.min(7, Math.round(1 + h * 2)), ring: h >= 2, shake: o.calm ? 0 : h >= 3 ? Math.min(6, 3 + (h - 3)) : 0}; }
// Motion.land(who, {height | vy, g, calm, t0, onContact, from}) → a beat run (ready stretch · contact squash + hold · follow pop · settle); f.land = dust + ring
function land(who, o) {
  o = o || {}; const I = landInfo(o), s = I.squash / 100, lvl = I.h >= 3 ? 2 : I.h >= 1 ? 1 : 0, key = 'motion.land.' + I.squash + (I.ring ? 'r' : '') + (I.shake ? 's' + I.shake : '');
  if (!Acting.T.acts[key]) Acting.add({acts: {[key]: {drag: false, shake: I.shake, land: {dust: I.dust, ring: I.ring}, beats: [
    {name: 'ready', ms: 40, ease: 'sineOut', pose: {armR: 2.3, armL: 2.3, legL: 0.25, legR: -0.25, kneeL: 0.3, kneeR: 0.3, sy: 1 + s * 0.15, sx: 1 - s * 0.1}},
    {name: 'contact', contact: true, ms: 60 + I.hold, tr: 50, ease: 'cubicIn', pose: {armR: 1.2 + s * 2, armL: 1.2 + s * 2, legL: 0.35 + s * 1.2, legR: 0.35 + s * 1.2, kneeL: 0.5 + s * 3, kneeR: 0.5 + s * 3, bend: 0.06 + s * 0.6, sy: 1 - s, sx: 1 + s * 0.55, dy: 2 + s * 30}},
    {name: 'follow', ms: 160 + lvl * 40, ease: 'backOut', pose: {armR: 0.7, armL: 0.7, kneeL: 0.12, kneeR: 0.12, sy: 1.03, sx: 0.99}},
    {name: 'settle', ms: 140, ease: 'sineOut', pose: Object.assign({}, STAND)}]}}}, {by: 'motion', block: 'motion-land'});
  const run = Acting.play(who, key, o); run.land = I; return run;
}
function landFx(g, x, y, k, L, calm) { dustFx(g, x, y, k, Math.max(1, Math.ceil(L.n / 2)), Math.min(0.8, L.q), 0); if (L.ring && !calm) groundRing(g, x, y, k, L.q, 1.2); }

// ---------- ⚡ glow (under the body) + 🔗 sparks (in front) ----------
function drawUnder(g, x0, y, k, dir, f, who, opt) {   // the Acting.draw hook UNDER the body: ⚡ glow (mo-2) · 🌀 back half of the ring + 🧭 a smear seen from behind (mo-3)
  if (f.ring) ringFx(g, x0, y, k, dir, f, 'back');
  if (f.smear && viewBehind(opt)) smearOnly(g, x0, y, k, dir, f, who, opt, true);
  if (f.glow > 0) glowFx(g, x0, y, k, dir, f, who);
}
function glowFx(g, x0, y, k, dir, f, who) {
  const q = f.glow; if (!(q > 0)) return; const P = Object.assign({}, f.pose); if (P.wristR) P.holdRot = (P.holdRot || 0) + P.wristR;
  const h = points(P, reach(who)).hand, x = x0 + h[0] * k * dir, yy = y + h[1] * k, r = (10 + 14 * q) * k, hot = q > 0.7;
  const col = hot ? '255,77,77' : '255,159,28', gr = g.createRadialGradient(x, yy, 0, x, yy, r * 1.6);
  gr.addColorStop(0, 'rgba(' + col + ',' + (0.55 * q) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)');
  g.save(); g.fillStyle = gr; g.beginPath(); g.arc(x, yy, r * 1.6, 0, TAU); g.fill();
  g.lineWidth = 2.2 * k; g.strokeStyle = 'rgba(' + col + ',' + (0.4 + 0.5 * q) + ')'; g.beginPath(); g.arc(x, yy, r, 0, TAU); g.stroke(); g.restore();
}
function drawSparks(g, x0, y, k, dir, f, who) {
  const q = f.sparks, P = Object.assign({}, f.pose); if (P.wristR) P.holdRot = (P.holdRot || 0) + P.wristR;
  const tp = points(P, reach(who)).tip, x = x0 + tp[0] * k * dir, yy = y + tp[1] * k;
  g.save(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.6, d = (10 + 26 * outC(q)) * k, s = (5 + 3 * (1 - q)) * k * (1 - q * 0.4);
    const sx = x + Math.cos(a) * d * dir, sy = yy + Math.sin(a) * d; g.globalAlpha = 1 - q; g.fillStyle = q < 0.3 ? '#FFFFFF' : '#FFD84D'; g.strokeStyle = '#B07A00'; g.lineWidth = Math.max(0.8, k);
    g.beginPath(); for (let j = 0; j < 8; j++) { const b = j / 8 * TAU, rr = j % 2 ? s * 0.35 : s; g.lineTo(sx + Math.cos(b) * rr, sy + Math.sin(b) * rr); } g.closePath(); g.fill(); g.stroke(); }
  g.restore();
}

// ======================= 🎬 mo-3 (🎬 Motion chat, 2026-11-18): 🧣 hang · 🌀 spin · 🧭 8 views · 🫁 alive idle (Motion rules §15) =======================
// AvatarKit hook points (patch_mo3_kit.py): drawAvatar → Motion.akPre (after the shadow, when opts.hang / pose yaw / pose back) · Motion.akPaint(g, M, 'back')
// before the body · Motion.akPaint(g, M, 'front') after the head (before the front arm). Without them nothing changes.
const PHI0 = 0.35, TILT = 0.3, HGRAV = 600, HDT = 0.01, HWIN = 0.6, SQ0 = 0.58 + 0.42 * Math.cos(0.35);
// 🧣 parts (avatar units at k = 1; roots in the body's frame: x forward, y = AvatarKit y, z side [, own rest]) · rest = rad from straight down toward the BACK
// stiff = pull back to the rest shape per 10 ms step · damp = speed kept per step (less = more air drag) · wind = how much the body's own speed tilts the felt pull
// (running → trails, falling → streams UP) · head: hangs from the back of the head (behind it unless the back shows)
const HANG = {
  cape:     {n: 6, len: 36, roots: [[-6, -46, 0]], rest: 0.10, curl: 0.03, stiff: 0.12, damp: 0.96, w: [15, 24], wind: 4, kind: 'sheet'},
  scarf:    {n: 4, len: 20, roots: [[-6, -48, 2], [-6, -47, -2]], rest: 0.35, curl: 0.10, stiff: 0.1, damp: 0.95, w: [6, 5], wind: 4, kind: 'strip'},
  long:     {n: 4, len: 28, roots: [[-6, -64, 0]], rest: 0.05, curl: 0.02, stiff: 0.12, damp: 0.95, w: [27, 24], wind: 3, kind: 'sheet', head: 1},
  ponytail: {n: 4, len: 22, roots: [[-13, -68, 0]], rest: 0.55, curl: -0.10, stiff: 0.1, damp: 0.97, w: [9, 4], wind: 5, kind: 'strip', head: 1},
  braids:   {n: 4, len: 24, roots: [[12, -56, 0], [-12, -56, 0]], rest: 0.02, curl: 0, stiff: 0.1, damp: 0.95, w: [7.2, 6.4], wind: 3, kind: 'beads', head: 1},
  pigtails: {n: 3, len: 14, roots: [[15, -64, 0, -0.35], [-15, -64, 0, 0.35]], rest: 0.30, curl: 0, stiff: 0.15, damp: 0.93, w: [10, 6], wind: 2.5, kind: 'strip'},
  tail:     {n: 5, len: 30, roots: [[-8, -24, 0]], rest: 1.25, curl: -0.12, stiff: 0.25, damp: 0.9, w: [8, 2], wind: 1.5, kind: 'strip'},
};
// what this avatar wears that hangs → [[part, colour, from]] (from: 'cape' = costume cape · 'cw' = crafted cape · 'hair' · 'tail' · '')
function hangParts(av, C, H) {
  const L = (C && C.look) || {}, want = H && H.parts, on = n => !want || want.indexOf(n) >= 0, cw = av.cw || {}, out = [];
  if (on('cape')) { if (L.cape) out.push(['cape', L.cape, 'cape']); else if (cw.back && cw.back.k === 'cape') out.push(['cape', cw.back.c || '#E86A9A', 'cw']); }
  if (on('scarf') && cw.neck && cw.neck.k === 'scarf') out.push(['scarf', cw.neck.c || '#E86A9A', '']);
  if (on('hair') && !L.hood) { const h = av.hair, p = h === 1 ? 'long' : h === 7 ? 'braids' : h === 8 ? 'ponytail' : h === 9 ? 'pigtails' : null; if (p) out.push([p, typeof C.hc === 'string' ? C.hc : '#3B2A20', 'hair']); }
  if (on('tail') && L.tail) out.push(['tail', L.tail, 'tail']);
  return out;
}
// H = Motion.hang(who, {parts: ['cape', 'hair', 'scarf', 'tail']}) — pass {hang: H} to Acting.draw / drawAvatar. A game that MOVES the avatar adds
// H.feed(x, y, t, k) every frame (feet on screen in px + the avatar scale k → avatar units; t = seconds). Acts drive it by themselves.
function hang(who, o) {
  o = o || {}; const H = {who, parts: o.parts || null, buf: [],
    feed(x, y, t, k) { k = k || 1; t = t != null ? t : performance.now() / 1000; const b = H.buf; if (b.length && t < b[b.length - 1][0]) b.length = 0;
      b.push([t, x / k, y / k]); while (b.length > 2 && b[1][0] < t - HWIN - 0.05) b.shift(); return H; },
    reset() { H.buf.length = 0; return H; }};
  return H;
}
function feedAt(b, t) { if (t <= b[0][0]) return [b[0][1], b[0][2]]; for (let i = 1; i < b.length; i++) if (t <= b[i][0]) { const A = b[i - 1], B = b[i], q = (t - A[0]) / Math.max(1e-6, B[0] - A[0]); return [lerp(A[1], B[1], q), lerp(A[2], B[2], q)]; } const L = b[b.length - 1]; return [L[1], L[2]]; }
// 🧭 the facing angle φ (screen x = cos φ, toward the camera = sin φ) of a picture: today's 3/4 picture = PHI0
function akPre(g, a, P, opts, sx, sy, k, lift, av, C) {
  const d0 = a.dir || 1; let dir = d0, back = !!P.back, phi;
  if (P.yaw) { const ph = PHI0 - P.yaw, c = Math.cos(ph), s = Math.sin(ph); if (c < 0) dir = -dir; if (s < -0.02) back = !back;
    P.sx = (P.sx || 1) * Math.min(1, (0.58 + 0.42 * Math.abs(c)) / SQ0); phi = d0 > 0 ? ph : Math.PI - ph; }
  else phi = back ? (dir > 0 ? -PHI0 : Math.PI + PHI0) : (dir > 0 ? PHI0 : Math.PI - PHI0);
  if (back) P.back = 1;
  const H = opts.hang && typeof opts.hang === 'object' ? opts.hang : null, parts = (opts.hang || back || P.yaw) ? hangParts(av, C, H) : [];
  const skip = {cape: parts.some(p => p[2] === 'cape'), cw: parts.some(p => p[2] === 'cw'), tail: parts.some(p => p[0] === 'tail'), pig: parts.some(p => p[0] === 'pigtails')};
  const hp = parts.some(p => p[2] === 'hair' && p[0] !== 'pigtails');
  if (window.AK) AK.noPig = skip.pig;
  return {a: dir === d0 && !back ? a : Object.assign({}, a, {dir, fromBack: a.fromBack || back}), m0: g.getTransform ? g.getTransform() : null,
    sx, sy, k, lift, P, d0, phi, back, parts, H, f: opts.hangF, skip, hairAv: hp ? Object.assign({}, av, {hair: 0}) : null, chains: null};
}
// body states over the last HWIN seconds (oldest first): the act's own poses (frame._mo.poseAt) + the game's feed
function hangStates(M) {
  const n = Math.round(HWIN / HDT), out = [], P = M.P, mo = M.f && M.f._mo, b = M.H && M.H.buf.length ? M.H.buf : null, now = b ? b[b.length - 1] : null;
  for (let i = 0; i <= n; i++) {
    const ago = (n - i) * HDT, Q = mo && i < n ? mo.poseAt(ago * 1000) : P;
    let x = ((Q.shift || 0) - (P.shift || 0)) * M.d0, y = 0;
    if (b) { const p = feedAt(b, now[0] - ago); x += p[0] - now[1]; y += p[1] - now[2]; }
    const phi = M.phi - ((Q.yaw || 0) - (P.yaw || 0)) * M.d0;
    out.push({x, y, lift: M.lift, phi, bend: Q.bend || 0, rot: Q.rot || 0, rotFull: Q.rotFull || 0, dy: Q.dy || 0, sy: Q.sy || 1});
  }
  return out;
}
function hLean(st, lx, ly) { let x = lx, y = ly; const r = (cx, cy, a) => { const dx = x - cx, dy = y - cy, c = Math.cos(a), s = Math.sin(a); x = cx + dx * c - dy * s; y = cy + dx * s + dy * c; };
  if (st.bend && ly < -20) r(0, -20, st.bend); if (st.rot) r(0, 0, st.rot); if (st.rotFull) r(0, -34, st.rotFull); return [x, y * st.sy + st.dy]; }
function hWorld(st, R) { const f = hLean(st, R[0], R[1]), c = Math.cos(st.phi), s = Math.sin(st.phi); return [st.x + f[0] * c - R[2] * s, st.y - st.lift + f[1], f[0] * s + R[2] * c]; }
// rest direction of link i: 'down' = the felt pull (gravity + the wind of the body's own speed: running → it trails, falling → it streams UP), turned toward the back
function hRest(st, p, R, i, W) { const a = (R[3] != null ? R[3] : p.rest) + p.curl * i, s = Math.sin(a), c = Math.cos(a), bx = -Math.cos(st.phi), bz = -Math.sin(st.phi);
  const D = W || [0, 1, 0], x = D[0] * c + bx * s, y = D[1] * c, z = D[2] * c + bz * s, L = Math.hypot(x, y, z) || 1; return [x / L, y / L, z / L]; }
function hSim(part, S) {
  const p = HANG[part], seg = p.len / p.n;
  return p.roots.map(R => {
    let st = S[0]; const pts = [hWorld(st, R)], prev = [], v = [0, 0, 0]; let W = [0, 1, 0], root0 = pts[0].slice();
    for (let i = 1; i <= p.n; i++) { const d = hRest(st, p, R, i - 1, W), q = pts[i - 1]; pts.push([q[0] + d[0] * seg, q[1] + d[1] * seg, q[2] + d[2] * seg]); }
    pts.forEach(q => prev.push(q.slice()));
    for (let s = 1; s < S.length; s++) {
      st = S[s]; pts[0] = hWorld(st, R);
      for (let j = 0; j < 3; j++) { v[j] += ((pts[0][j] - root0[j]) / HDT - v[j]) * 0.25; root0[j] = pts[0][j]; }   // the body's speed (smoothed) → the wind it feels
      { const fx = -v[0] * p.wind, fy = HGRAV - v[1] * p.wind, fz = -v[2] * p.wind, L = Math.hypot(fx, fy, fz) || 1; W = [fx / L, fy / L, fz / L]; }
      for (let i = 1; i <= p.n; i++) { const q = pts[i], o = prev[i], vx = (q[0] - o[0]) * p.damp, vy = (q[1] - o[1]) * p.damp, vz = (q[2] - o[2]) * p.damp;
        o[0] = q[0]; o[1] = q[1]; o[2] = q[2]; q[0] += vx; q[1] += vy + HGRAV * HDT * HDT; q[2] += vz; }
      for (let it = 0; it < 3; it++) for (let i = 1; i <= p.n; i++) {
        const a = pts[i - 1], q = pts[i];
        if (it === 0) { const d = hRest(st, p, R, i - 1, W); q[0] += (a[0] + d[0] * seg - q[0]) * p.stiff; q[1] += (a[1] + d[1] * seg - q[1]) * p.stiff; q[2] += (a[2] + d[2] * seg - q[2]) * p.stiff; }
        const dx = q[0] - a[0], dy = q[1] - a[1], dz = q[2] - a[2], L = Math.hypot(dx, dy, dz) || 1, f = seg / L; q[0] = a[0] + dx * f; q[1] = a[1] + dy * f; q[2] = a[2] + dz * f; }
    }
    return pts;
  });
}
function hangChains(M) {
  const S = hangStates(M), out = [];
  M.parts.forEach(([part, col]) => hSim(part, S).forEach(pts => {
    const front = HANG[part].head ? M.back : pts.reduce((s, q) => s + q[2], 0) / pts.length > 0.5;
    out.push({part, col, pts, front}); }));
  return out;
}
function paintChain(g, part, pts, phi, ox, oy, k, col) {
  const p = HANG[part], S = pts.map(q => [ox + q[0] * k, oy + (q[1] + q[2] * TILT) * k]), n = S.length;
  g.fillStyle = col; g.strokeStyle = 'rgba(25,15,45,0.55)'; g.lineWidth = Math.max(0.8, 1.3 * k);
  if (p.kind === 'beads') { for (let i = 1; i < n; i++) { const r = (p.w[0] + (p.w[1] - p.w[0]) * i / n) / 2 * k; g.beginPath(); g.arc(S[i][0], S[i][1], r, 0, TAU); g.fill(); } return; }
  const side = [-Math.sin(phi), TILT * Math.cos(phi)], sheet = p.kind === 'sheet', Lp = [], Rp = [];
  S.forEach((q, i) => { const a = S[Math.max(0, i - 1)], b = S[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, w = (p.w[0] + (p.w[1] - p.w[0]) * i / (n - 1)) * k / 2;
    const ox2 = (sheet ? side[0] * w : 0) + (-dy / d) * w * (sheet ? 0.4 : 1), oy2 = (sheet ? side[1] * w : 0) + (dx / d) * w * (sheet ? 0.4 : 1);
    Lp.push([q[0] + ox2, q[1] + oy2]); Rp.push([q[0] - ox2, q[1] - oy2]); });
  g.beginPath(); Lp.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]));
  if (!sheet) { const e = S[n - 1], e2 = S[n - 2]; g.quadraticCurveTo(e[0] + (e[0] - e2[0]) * 0.5, e[1] + (e[1] - e2[1]) * 0.5, Rp[n - 1][0], Rp[n - 1][1]); }
  for (let i = n - 1; i >= 0; i--) g.lineTo(Rp[i][0], Rp[i][1]); g.closePath(); g.fill(); g.stroke();
  if (sheet) { g.strokeStyle = 'rgba(0,0,0,0.13)'; g.lineWidth = 1.4 * k; [0.33, 0.66].forEach(fr => { g.beginPath(); S.forEach((q, i) => { const X = Lp[i][0] + (Rp[i][0] - Lp[i][0]) * fr, Y = Lp[i][1] + (Rp[i][1] - Lp[i][1]) * fr; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.stroke(); }); }
}
function akPaint(g, M, layer) {
  if (layer === 'front' && window.AK) AK.noPig = false;
  if (!M || !M.parts.length) return;
  if (!M.chains) M.chains = hangChains(M);
  const fr = layer === 'front'; g.save(); if (M.m0) g.setTransform(M.m0);
  M.chains.forEach(c => { if (c.front === fr) paintChain(g, c.part, c.pts, M.phi, M.sx, M.sy, M.k, c.col); });
  g.restore();
}
// ---------- 🌀 spin (act field spin: {turns, coil, ring, size, arm}) ----------
const easeTurn = u => u * u * (1.6 - 0.6 * u);   // slow → fastest near the end
function spinYaw(run, X, el) {
  const S = X.A.spin, s0 = X.start[X.ci], c = run.contactMs; if (el < s0 || el >= c) return null;
  const T = TAU * (S.turns || 1), coil = S.coil != null ? S.coil : 0.6, q = (el - s0) / Math.max(1, c - s0);
  return -coil - T + (T + coil) * easeTurn(q);   // −coil − T ≡ −coil → 0 at contact (no full turns left over, so the next act blends the short way)
}
function spinPose(run, X, P, el) {
  const y = spinYaw(run, X, el); if (y == null) return; P.yaw = y;
  const q = (el - X.start[X.ci]) / Math.max(1, run.contactMs - X.start[X.ci]), m = cl((q - 0.8) / 0.2, 0, 1), arm = X.A.spin.arm || {armR: 1.6, elbowR: 0.05, holdRot: 1.15};
  Object.keys(arm).forEach(f2 => { const v = P[f2] != null ? P[f2] : (f2 === 'armR' || f2 === 'armL' ? 0.15 : 0); P[f2] = arm[f2] + (v - arm[f2]) * m; });
}
function spinFrame(run, X, f, el) {
  const S = X.A.spin, s0 = X.start[X.ci], c = run.contactMs, life = S.ring || 110, calm = X.o && X.o.calm, T = TAU * (S.turns || 1);
  spinPose(run, X, f.pose, el); f.spin = f.pose.yaw || 0;
  if (el < s0 || el >= c + X.STOP + life) return;
  const yawAt = e => { const y = spinYaw(run, X, e); return y != null ? y : e < s0 ? -(S.coil != null ? S.coil : 0.6) - T : 0; };
  const y1 = yawAt(Math.min(el, c - 0.001)), y0 = yawAt(Math.max(s0, Math.min(el, c - 0.001) - 80)), sweep = cl(Math.abs(y1 - y0), 0.25, 1.7 * Math.PI);
  const age = el <= c + X.STOP ? 0 : (el - c - X.STOP) / life;
  f.ring = {lead: PHI0 - y1, sweep: sweep * (1 - age * 0.6) * (calm ? 0.5 : 1), alpha: 1 - age, size: S.size || 1, col: colOf(X.A, X.o)};
  f.id += '~r' + Math.round(el / 16);
}
function paintRing(g, R, cx, cy, k, half, dir) {
  if (!R || !(R.alpha > 0)) return; const rx = 50 * k * R.size, ry = rx * TILT * 1.1;
  g.save(); g.globalAlpha *= cl(R.alpha, 0, 1) * 0.95;
  [[1, 0.26, R.col || '#FFFFFF', 'rgba(70,100,170,0.75)'], [0.7, 0.16, '#FFFFFF', 'rgba(70,100,170,0.45)']].forEach(([rr, th, fill, edge]) => {
    const N = 28, out = [], inn = [];
    for (let i = 0; i <= N; i++) { const u = i / N, a = R.lead + R.sweep * u, z = Math.sin(a);
      if ((half === 'back') !== (z < 0)) { out.push(null); inn.push(null); continue; }
      const w = th * (1 - u) * (u < 0.08 ? u / 0.08 * 0.6 + 0.4 : 1);
      out.push([cx + Math.cos(a) * rx * rr * dir, cy + z * ry * rr]); inn.push([cx + Math.cos(a) * rx * (rr - w) * dir, cy + z * ry * (rr - w)]); }
    let i = 0; while (i <= N) { while (i <= N && !out[i]) i++; const s = i; while (i <= N && out[i]) i++; const e = i - 1; if (e - s < 1) continue;
      g.beginPath(); for (let j = s; j <= e; j++) j === s ? g.moveTo(out[j][0], out[j][1]) : g.lineTo(out[j][0], out[j][1]); for (let j = e; j >= s; j--) g.lineTo(inn[j][0], inn[j][1]); g.closePath();
      g.fillStyle = fill; g.fill(); g.strokeStyle = edge; g.lineWidth = Math.max(0.8, 1.3 * k); g.stroke(); }
  });
  g.restore();
}
function ringFx(g, x0, y, k, dir, f, half) { const P = f.pose || {}; paintRing(g, f.ring, x0 + (P.shift || 0) * k * dir, y + ((P.dy || 0) - 40 * (P.sy || 1)) * k, k, half, dir); }
// Motion.spin({weight: 'light' | 'medium' | 'heavy', turns: 1 | 2}) → the act key to play (a 2-turn copy is made once; heavy = 1 turn)
function spin(o) {
  o = o || {}; const w = ['light', 'medium', 'heavy'].indexOf(o.weight) >= 0 ? o.weight : 'light', two = o.turns === 2 && w !== 'heavy', base = 'motion.spin.' + w, key = base + (two ? '.2' : '');
  if (two && !Acting.has('acts', key)) { const B = Acting.get('acts', base); if (B) { const A2 = JSON.parse(JSON.stringify(B)); delete A2.by; delete A2.block;
    A2.spin = Object.assign({}, A2.spin, {turns: 2}); const cb = A2.beats.find(b => b.contact); const tr = cb.tr || 160; cb.tr = Math.round(tr * 1.8); cb.ms = (cb.ms || tr) + (cb.tr - tr);
    Acting.add({acts: {[key]: A2}}, {by: '🎬 Motion chat', block: 'motion'}); } }
  return key;
}
// ---------- 🧭 8 views: 4 pictures (front / back × mirror) + small tweaks ----------
const VIEWS = {
  SE: {pic: 'front', dir: 1, sx: 1, reach: 1}, E: {pic: 'front', dir: 1, sx: 0.92, reach: 1}, S: {pic: 'front', dir: 1, sx: 0.94, reach: 0.85},
  NE: {pic: 'back', dir: 1, sx: 1, reach: 0.9}, N: {pic: 'back', dir: -1, sx: 0.94, reach: 0.85},
  SW: {pic: 'front', dir: -1, sx: 1, reach: 1}, W: {pic: 'front', dir: -1, sx: 0.92, reach: 1}, NW: {pic: 'back', dir: -1, sx: 1, reach: 0.9}};
const VCACHE = {};
function viewOf(v) {
  if (!v) return null; if (typeof v === 'object') return v.key ? v : null; if (VCACHE[v]) return VCACHE[v]; const V = VIEWS[v]; if (!V) return null;
  return (VCACHE[v] = {key: v, dir: V.dir, back: V.pic === 'back', sx: V.sx, reach: V.reach, behind: V.pic === 'back'});
}
function viewPose(P, V) { if (V.back) P.back = 1; if (V.sx !== 1) P.sx = (P.sx || 1) * V.sx; if (V.reach !== 1) P.reach = V.reach; }
// a step on the screen (dx, dy) → the nearest of 8; S / N keep the last left / right (pass the last view key)
function view8(dx, dy, last) {
  const i = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8, k2 = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'][i], L = VIEWS[last];
  return k2 === 'S' && L && L.dir < 0 ? 'SW' : k2 === 'N' && L && L.dir > 0 ? 'NE' : k2;
}
const viewBehind = opt => { const V = opt && opt.view ? viewOf(opt.view) : null; return !!(V && V.behind); };
// ---------- 🫁 alive idle (M23): 200 · 200 · 200 · 260 ms, 1 px bob, arms move on different frames ----------
const IDLE = [[200, 0, 1, 0, 0], [200, -1, 1.012, 0.04, 0], [200, -1, 1.018, 0.04, 0.03], [260, 0, 1.008, 0, 0.03]], IDLE_MS = 860;
function idlePose(t, seed) { const ms = ((t * 1000 + seed) % IDLE_MS + IDLE_MS) % IDLE_MS; let a = 0, i = 0; while (i < 3 && ms >= a + IDLE[i][0]) { a += IDLE[i][0]; i++; }
  const r = IDLE[i]; return {armR: 0.3 + r[3], armL: 0.25 + r[4], dy: r[1] * 1.2, sy: r[2], alive: false, _i: i}; }
// f = Motion.idle(who, t) → a frame: Acting.draw(g, who, x, y, k, f, {view, hang}) — the hang parts follow a frame later
function idle(who, t, o) {
  let seed = o && o.seed != null ? o.seed : 0; if (!(o && o.seed != null)) { const s = (who && who.name) || ''; for (let i = 0; i < s.length; i++) seed = (seed * 31 + s.charCodeAt(i)) % IDLE_MS; }
  const P = idlePose(t, seed), f = {id: 'motion.idle#' + P._i, act: {}, pose: P, face: null, marks: [], tricks: [], ride: 'keep', hold: 'keep', beat: 'idle', i: P._i, q: 0};
  delete P._i; Object.defineProperty(f, '_mo', {value: {poseAt: ms => { const Q = idlePose(t - ms / 1000, seed); delete Q._i; return Q; }}});
  return f;
}

window.Motion = {VERSION: 'mo-3', WEIGHTS, PHASE_EASE, FADE, prep, frame, drawSmear, shake, reach, points,
  hit, drawHit, drawHitFx, flash, knock, drawKnockFx, land, landInfo, drawUnder, RAMP, HIT, ENEMY_ANT, KNOCK_KEYS: Object.keys(KNOCK),
  hang, akPre, akPaint, HANG, spin, paintRing, VIEWS, viewOf, viewPose, view8, idle, PHI0, TILT, easeTurn};
})();
