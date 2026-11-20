
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
   🔨 mo-4 C = Motion.charge(who, key, {t0, side, element, calm, over, wall, auto, onContact}) = button DOWN → f = C.at(t) → Acting.draw · C.level(t) 0..1 · C.tier(t) 0 ⚪ / 1 🟡 / 2 🔴
       C.release(t, {onContact(C, info), wall, over}) = button UP → ONE contact, info = {level, tier, power 1 / 1.5 / 2, weight (FULL = one step heavier), charged}
       full after the anticipation: light 450 · medium 700 · heavy 1000 ms (Motion.CHARGE) · held past full = 1 px tremble, never fires by itself (o.auto = release at full)
   🏃 overcommit (FULL heavy / medium): f.dx = the slide so far (avatar units, heavy 30 · medium 14), drawn into the frame — or {inPlace: true} = the game moves its avatar by f.dx itself · f.open = the opening · C.moved = the whole slide once f.done · {wall: units} stops it
   🛡️ mo-5 G = Motion.guard(who, {t0, calm, wall, inPlace}) → f = G.at(t) (f.guard = the shield is up) · G.hit(t, {weight}) → {blocked, push} (shudder + slide back 4 / 8 / 14 + spark) · G.drop(t)
       D = Motion.shieldDash(who, {t0, dist 80, run 420, calm, wall, inPlace, onContact}) → f = D.at(t): raise → tuck → RUN (shield in front, f.guard) → BASH → push → settle
       D.bash(t) when the shield meets the target (else it bashes at the end of the run / at the wall) → ONE contact, info = {hit, wall, speed 0..1, weight light / medium / heavy} → the game calls Motion.hit + Motion.knock on the target
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
        if (X.o && X.o.from) f.smear.from = X.o.from;   /* 🦶 mo-6 */
        if (X.o && X.o.fx && (X.o.element || A.element)) { f.smear.el = X.o.element || A.element; f.smear.ms = el - s0; }   /* ⚡🔥 mo-6 element trail */
        f.id += '~s' + Math.round((el - s0) / 16);
      }
    }
  }
  // 🔄 a swing that went over the top ends with angles past ±π: show the same picture with angles in (−π, π] so the next act blends the short way
  if (W) ['armR', 'armL', 'holdRot'].forEach(k2 => { let v = P[k2]; if (v != null && Math.abs(v) > Math.PI) { v = ((v + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; P[k2] = v; } });
  // ⚡ mo-2 wind-up glow: enemies (and heavy player moves) light up from the anticipation start to contact
  const o2 = X.o || {};
  if (o2.from && !f.from) f.from = o2.from;   /* 🦶 mo-6: glow + sparks sit on that limb */
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
function points(P, L, from) {
  if (from && from !== 'handR' && LIMB[from]) return LIMB[from](Object.assign({armR: 0.15, armL: 0.35}, P));   /* 🦶 mo-6 limb anchor */
  const Q = Object.assign({armR: 0.15}, P), h = AKJ.frontHand(Q, 1, 16 * (Q.reach || 1)), a = BASE + (Q.holdRot || 0), s = Math.sin(a), c = Math.cos(a);
  if (window.Motion && Motion.shoulderOff && (Q.twist || Q.shrugR)) { const o = Motion.shoulderOff(Q, 'R'); h[0] += o[0]; h[1] += o[1]; }   /* 🦴 mo-7b: the front shoulder moved */
  return {hand: bodyPoint(Q, h[0], h[1]), tip: bodyPoint(Q, h[0] + s * L, h[1] - c * L), mid: bodyPoint(Q, h[0] + s * L * 0.45, h[1] - c * L * 0.45)};
}
// 🦶 mo-6 limb anchors (📨 ⚽ BlasOff): {from: 'footR' | 'footL' | 'handL' | 'head'} → hand = the limb's root · mid = knee / elbow · tip = foot / hand / head top
const LEGJ = (x, a, bend) => { const kn = AKJ.end(x, -20, a, 9); return {r: [x, -20], m: kn, e: AKJ.end(kn[0], kn[1], a + bend, 9)}; };
const LIMB = {
  footR: Q => { const L = LEGJ(5, Q.legR || 0, Q.kneeR || 0); return {hand: bodyPoint(Q, L.r[0], L.r[1]), mid: bodyPoint(Q, L.m[0], L.m[1]), tip: bodyPoint(Q, L.e[0], L.e[1])}; },
  footL: Q => { const L = LEGJ(-5, -(Q.legL || 0), Q.kneeL || 0); return {hand: bodyPoint(Q, L.r[0], L.r[1]), mid: bodyPoint(Q, L.m[0], L.m[1]), tip: bodyPoint(Q, L.e[0], L.e[1])}; },
  handL: Q => { const o = window.Motion && Motion.shoulderOff && (Q.twist || Q.shrugL) ? Motion.shoulderOff(Q, 'L') : [0, 0], e = AKJ.end(-10 + o[0], -42 + o[1], Q.armL, 8), h = AKJ.end(e[0], e[1], Q.armL + (Q.elbowL || 0), 8); return {hand: bodyPoint(Q, -10 + o[0], -42 + o[1]), mid: bodyPoint(Q, e[0], e[1]), tip: bodyPoint(Q, h[0], h[1])}; },   /* 🦴 mo-7b: + the shoulder offset */
  head: Q => ({hand: bodyPoint(Q, 0, -44), mid: bodyPoint(Q, 0, -58), tip: bodyPoint(Q, 0, -78)})};
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
  if (f.charge) chargeFx(g, x0, y, k, dir, f, who);   /* 🔨 mo-4 */
  if (f.block) blockFx(g, x0, y, k, dir, f);   /* 🛡️ mo-5 */
  if (f.bash) bashFx(g, x0, y, k, dir, f);   /* 🛡️ mo-5 */
}
function smearOnly(g, x0, y, k, dir, f, who, opt, under) {
  const S = f.smear; if (!S || !S.poses || S.poses.length < 2) return;
  const L = (f.act && f.act.reach) || reach(who), W = p => [x0 + p[0] * k * dir, y + p[1] * k];
  const path = S.poses.map(P => { const q = points(P, L, S.from); return {hand: W(q.hand), tip: W(q.tip), mid: W(q.mid)}; });
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
  if (S.el && Motion.trailFx) Motion.trailFx(g, path.map(p => p.tip), S.el, S.alpha, k, S.ms || 0);   /* ⚡🔥 mo-6 element trail */
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
  if (f.dust) overDust(g, x0, y, k, dir, f);   /* 🏃 mo-4 */
  if (f.puffs || f.speed > 0.35) runFx(g, x0, y, k, dir, f);   /* 🛡️ mo-5 */
}
function glowFx(g, x0, y, k, dir, f, who) {
  const q = f.glow; if (!(q > 0)) return; const P = Object.assign({}, f.pose); if (P.wristR) P.holdRot = (P.holdRot || 0) + P.wristR;
  const h = points(P, reach(who), f.from)[f.from ? 'tip' : 'hand'], x = x0 + h[0] * k * dir, yy = y + h[1] * k, r = (10 + 14 * q) * k, hot = q > 0.7;
  const col = hot ? '255,77,77' : '255,159,28', gr = g.createRadialGradient(x, yy, 0, x, yy, r * 1.6);
  gr.addColorStop(0, 'rgba(' + col + ',' + (0.55 * q) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)');
  g.save(); g.fillStyle = gr; g.beginPath(); g.arc(x, yy, r * 1.6, 0, TAU); g.fill();
  g.lineWidth = 2.2 * k; g.strokeStyle = 'rgba(' + col + ',' + (0.4 + 0.5 * q) + ')'; g.beginPath(); g.arc(x, yy, r, 0, TAU); g.stroke(); g.restore();
}
function drawSparks(g, x0, y, k, dir, f, who) {
  const q = f.sparks, P = Object.assign({}, f.pose); if (P.wristR) P.holdRot = (P.holdRot || 0) + P.wristR;
  const tp = points(P, reach(who), f.from).tip, x = x0 + tp[0] * k * dir, yy = y + tp[1] * k;
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

// ======================= 🎬 mo-4 (🎬 Motion chat, 2026-11-18): 🔨 hold-to-charge + 🏃 overcommit (Motion rules §17 / M24) =======================
// C = Motion.charge(who, key, {t0, side, element, calm, over, wall, auto, onContact}) = button DOWN · f = C.at(t) → Acting.draw · C.release(t, {onContact}) = button UP
// The act's ready + anticipation play as today, then the coil keeps CREEPING while held (slows into the apex); a tap = the act exactly as today.
// The glow (f.charge) + the overcommit dust (f.dust) reach the Acting.draw hooks through f.mo. Nothing changes for an act played without Motion.charge.
const CHARGE = {
  light:  {full: 450,  deep: 0.22, over: 0,  slide: 0,   catchMs: 0},
  medium: {full: 700,  deep: 0.25, over: 14, slide: 200, catchMs: 100},
  heavy:  {full: 1000, deep: 0.30, over: 30, slide: 320, catchMs: 180}};
const POWER = [1, 1.5, 2], UPW = {light: 'medium', medium: 'heavy', heavy: 'heavy'};
const CANG = ['armR', 'armL', 'elbowR', 'elbowL', 'holdRot', 'wristR', 'bend', 'rot', 'kneeL', 'kneeR', 'legL', 'legR'];
const tierOf = lv => lv >= 1 ? 2 : lv >= 0.5 ? 1 : 0;
const creepE = q => 1 - Math.pow(1 - cl(q, 0, 1), 2);
function charge(who, key, o) {
  o = Object.assign({}, o || {}); const t0 = o.t0 != null ? o.t0 : performance.now() / 1000;
  const run = Acting.play(who, key, Object.assign({}, o, {t0, onContact: null, onBeat: null, contactAt: null}));
  const X = run._m, A = X.A, ci = X.ci, w = CHARGE[A.weight] ? A.weight : 'medium', CW = Object.assign({}, CHARGE[w], (A.charge && typeof A.charge === 'object') ? A.charge : {});
  const ai = ci - 1, aS = ai >= 0 ? run.start[ai] : 0, aE = run.start[ci], calm = !!o.calm;
  const P0 = Object.assign({}, run.at(t0 + (aE - 0.5) / 1000).pose), PR = Object.assign({}, run.at(t0 + Math.max(0, aS - 0.5) / 1000).pose);
  const CP = CW.pose ? (typeof CW.pose === 'string' ? Acting.T.poses[CW.pose] : CW.pose) : null;
  const deepen = c => { const Q = Object.assign({}, P0);   // the coil keeps winding the same way (or toward the act's own charge pose)
    if (CP) { Object.keys(CP).forEach(k2 => { if (typeof CP[k2] === 'number') Q[k2] = lerp(P0[k2] != null ? P0[k2] : (k2 === 'sx' || k2 === 'sy' ? 1 : 0), CP[k2], c); }); return Q; }
    CANG.forEach(k2 => { if (P0[k2] != null || PR[k2] != null) { const a = P0[k2] || 0, b = PR[k2] || 0; Q[k2] = a + (a - b) * CW.deep * c; } });
    Q.dy = (P0.dy || 0) + 3 * c; Q.sy = (P0.sy || 1) * (1 - 0.035 * c); Q.sx = (P0.sx || 1) * (1 + 0.02 * c); return Q; };
  const C = {key, who, run, weight: w, times: CW, t0, antStart: t0 + aS / 1000, antEnd: t0 + aE / 1000, fullT: t0 + (aE + CW.full) / 1000, rel: null, H: 0, fired: false, moved: 0, o,
    onContact: o.onContact || null};
  C.level = t => { const e = (Math.min(t, C.rel != null ? C.rel : Infinity) - C.antEnd) * 1000; return e <= 0 ? 0 : Math.min(1, e / CW.full); };
  C.tier = t => tierOf(C.level(t));
  C.release = (t, o2) => {
    if (C.rel != null) return C; o2 = o2 || {}; t = t != null ? t : performance.now() / 1000;
    C.rel = Math.max(t, t0); C.H = Math.max(0, (C.rel - C.antEnd) * 1000);
    const lv = C.level(C.rel), tier = tierOf(lv);
    C.info = {level: lv, tier, power: POWER[tier], weight: tier === 2 ? UPW[w] : w, charged: C.H > 0};
    C.over = tier === 2 && CW.over > 0 && o.over !== false && o2.over !== false;
    C.PD = C.H > 0 ? deepen(creepE(lv)) : null;
    C.contactT = t0 + (run.contactMs + C.H) / 1000;
    C.slide0 = run.contactMs + C.H + run.stop; C.slideEnd = C.slide0 + (C.over ? CW.slide : 0); C.catchEnd = C.slideEnd + (C.over ? CW.catchMs : 0);
    const wall = o2.wall != null ? o2.wall : o.wall;
    C.dist = C.over ? Math.min(CW.over, wall != null ? Math.max(0, wall) : Infinity) : 0; C.wall = C.over && wall != null && wall < CW.over;
    C.wallAt = C.wall ? C.slide0 + CW.slide * (1 - Math.cbrt(1 - C.dist / CW.over)) : Infinity;   // ms (act clock) the slide reaches the wall
    C.total = run.total + C.H + (C.over ? (CW.slide + CW.catchMs) * 0.55 : 0); C.endT = t0 + C.total / 1000;
    if (o2.onContact) C.onContact = o2.onContact;
    return C;
  };
  const warp = el => { if (!C.over || el <= C.slide0) return el - C.H; const p = el - C.slide0, sl = CW.slide + CW.catchMs; return run.contactMs + run.stop + (p < sl ? p * 0.45 : sl * 0.45 + (p - sl)); };
  C.at = t => {
    if (C.rel == null && o.auto && t >= C.fullT) C.release(C.fullT);
    const el = (t - t0) * 1000, rel = C.rel != null ? (C.rel - t0) * 1000 : Infinity;
    let f;
    if (C.rel != null && C.H === 0) f = run.at(t);                               // a tap = today's act
    else if (el < aE) f = run.at(t);                                             // ready + anticipation as today
    else if (el < rel) {                                                         // 🔨 held: the coil creeps, the glow gathers
      const lv = C.level(t), F = run.at(t0 + (aE - 0.5) / 1000); f = Object.assign({}, F); f.pose = deepen(creepE(lv)); delete f.glow;
      f.id = F.id + '~c' + Math.round(lv * 24);
      if (lv >= 1 && !calm) { f.pose.shift = (f.pose.shift || 0) + 0.7 * Math.sin(el * 0.13); f.pose.dy += 0.4 * Math.cos(el * 0.17); f.id += '~t' + Math.round(el / 40); }   // held past full: 1 px tremble
      f.charge = {lv, tier: tierOf(lv), t: el - aE, full: CW.full, side: o.side || 'player', element: o.element || null, calm, ms: el};
      if (o.from) f.charge.from = o.from; if (o.fx && o.element) f.charge.fx = 1;   /* 🦶 ⚡🔥 mo-6 */
      f.mo = 1; f.contact = false; f.done = false;
    } else {                                                                     // 🔓 released: the strike from the charged pose (+ 🏃 overcommit)
      const e2 = Math.min(warp(el), run.total), F = run.at(t0 + e2 / 1000); f = Object.assign({}, F); const P = f.pose = Object.assign({}, F.pose), e1 = el - C.H;
      if (e1 < run.contactMs) { const u = cl((e1 - aE) / Math.max(1, run.contactMs - aE), 0, 1);
        CANG.concat(['dy', 'sy', 'sx']).forEach(k2 => { if (C.PD[k2] != null && P[k2] != null) P[k2] += (C.PD[k2] - (P0[k2] != null ? P0[k2] : (k2 === 'sx' || k2 === 'sy' ? 1 : 0))) * (1 - u); }); f.id += '~r' + Math.round(u * 8); }
      let dx = 0;
      if (C.over && el > C.slide0) {
        const q = Math.min(1, (el - C.slide0) / CW.slide); dx = Math.min(C.dist, CW.over * outC(q)); if (!o.inPlace) P.shift = (P.shift || 0) + dx;
        if (el < C.catchEnd) P.bend = (P.bend || 0) + 0.12 * Math.sin(Math.min(1, (el - C.slide0) / (CW.slide + CW.catchMs)) * Math.PI);
        if (el > C.slideEnd && el < C.catchEnd) { const u = (el - C.slideEnd) / CW.catchMs; P.armL = (P.armL || 0) + 0.9 * Math.sin(u * Math.PI); f.face = 'surprised'; }   // catch the balance
        if (C.wall && el >= C.wallAt && el < C.wallAt + 90) { const b = Math.sin((el - C.wallAt) / 90 * Math.PI); P.sx = (P.sx || 1) * (1 - 0.07 * b); f.wallBump = b; }
        if (el < C.slideEnd + 260) { f.dust = {q: (el - C.slide0) / (CW.slide + 260), dx, calm}; f.mo = 1; }
        f.id += '~o' + Math.round(dx * 2) + (f.dust ? '~d' + Math.round(f.dust.q * 16) : '');
      }
      f.dx = dx; f.open = !!C.over && el >= C.slide0 && el < C.catchEnd + 120;
      f.done = el >= C.total; f.contact = el >= run.contactMs + C.H;
      if (f.done) C.moved = C.dist;
    }
    if (C.rel != null && !C.fired && t >= C.contactT) { C.fired = true; if (C.onContact) C.onContact(C, C.info); }
    if (!Object.getOwnPropertyDescriptor(f, '_mo')) Object.defineProperty(f, '_mo', {value: {poseAt: ms => C.at(t - ms / 1000).pose}});
    C.last = f; return f;
  };
  return C;
}
// ✨ charge look: a glow ball at the blade (cached sprite) + motes pulled IN along a spiral + a ring ping at 🟡 50 % and 🔴 FULL
const CCOL = {player: [['#E6ECFF', '#FFFFFF'], ['#FFC83D', '#FFF0AA'], ['#FF7828', '#FFFFEB']], enemy: [['#FF9F1C', '#FFC878'], ['#FF6E28', '#FFB478'], ['#FF3C3C', '#FFBEAA']]};
const GLOW = {};
function glowSprite(col, core, r) {
  const R = Math.max(2, Math.round(r)), key = col + core + R; if (GLOW[key]) return GLOW[key];
  if (Object.keys(GLOW).length > 400) for (const k2 in GLOW) delete GLOW[k2];
  const c = document.createElement('canvas'); c.width = c.height = R * 4; const g = c.getContext('2d'), gr = g.createRadialGradient(R * 2, R * 2, 0, R * 2, R * 2, R * 1.9);
  const [r1, g1, b1] = hexRgb(core), [r2, g2, b2] = hexRgb(col);
  gr.addColorStop(0, 'rgba(' + r1 + ',' + g1 + ',' + b1 + ',0.9)'); gr.addColorStop(0.35, 'rgba(' + r2 + ',' + g2 + ',' + b2 + ',0.7)'); gr.addColorStop(1, 'rgba(' + r2 + ',' + g2 + ',' + b2 + ',0)');
  g.fillStyle = gr; g.fillRect(0, 0, R * 4, R * 4); return (GLOW[key] = c);
}
function chargeFx(g, x0, y, k, dir, f, who) {
  const c = f.charge; if (!c) return; const P = Object.assign({}, f.pose); if (P.wristR) P.holdRot = (P.holdRot || 0) + P.wristR;
  const tp = points(P, reach(who) * 0.8, c.from).tip, x = x0 + tp[0] * k * dir, yy = y + tp[1] * k;
  let [col, core] = CCOL[c.side === 'enemy' ? 'enemy' : 'player'][c.tier];
  const E = c.element && c.tier > 0 && window.ActionFX && ActionFX.EL && ActionFX.EL[c.element]; if (E) { col = E[0]; core = E[2]; }
  const q = creepE(c.lv), pulse = c.lv >= 1 && !c.calm ? 0.85 + 0.15 * Math.sin(c.ms * 0.025) : 1, r = (6 + 18 * q) * k * pulse * (c.calm ? 0.5 : 1), a = (0.45 + 0.55 * q) * (c.calm ? 0.6 : 1);
  g.save();
  const Hd = window.AK && AK.head;   /* 🙂 mo-6 (FX Bible F11): the glow never sits on the face — the head circle is cut out */
  if (Hd && Hd.m && g.getTransform) { const m = g.getTransform().inverse().multiply(Hd.m), cc = m.transformPoint({x: 0, y: Hd.hy}), rr = 21 * Hd.k * Math.hypot(m.a, m.b); g.beginPath(); g.rect(-1e5, -1e5, 2e5, 2e5); g.arc(cc.x, cc.y, rr, 0, TAU, true); g.clip('evenodd'); }
  const S = glowSprite(col, core, r); g.globalAlpha = a; g.drawImage(S, x - S.width / 2, yy - S.height / 2);
  g.globalAlpha = (0.35 + 0.6 * q) * (c.calm ? 0.6 : 1); g.lineWidth = (1.2 + 1.4 * q) * k; g.strokeStyle = col; g.beginPath(); g.arc(x, yy, r, 0, TAU); g.stroke();
  const n = 3 + Math.round(9 * q) * (c.calm ? 0.5 : 1) | 0;   // motes spiral IN (gathering), never out
  g.lineWidth = Math.max(0.5, 0.6 * k); g.strokeStyle = 'rgba(43,45,66,0.5)'; g.fillStyle = col;
  for (let i = 0; i < n; i++) { const ph = ((c.ms / 600) + i / n) % 1, an = i * 2.39996 + ph * 2.2, d = r * (1.1 + 2.2 * (1 - ph)), s = (1.2 + 1.6 * ph) * k, mx = x + Math.cos(an) * d, my = yy + Math.sin(an) * d;
    g.globalAlpha = 0.25 + 0.75 * ph; g.beginPath(); g.moveTo(mx, my - s); g.lineTo(mx + s * 0.6, my); g.lineTo(mx, my + s); g.lineTo(mx - s * 0.6, my); g.closePath(); g.fill(); g.stroke(); }
  [[0.5, 1], [1, 2]].forEach(([lv, ti]) => { const since = c.t - lv * c.full; if (since < 0 || since > 220) return; const u = since / 220;
    g.globalAlpha = 1 - u; g.strokeStyle = CCOL[c.side === 'enemy' ? 'enemy' : 'player'][ti][0]; g.lineWidth = (3 - 2 * u) * k; g.beginPath(); g.arc(x, yy, (12 + 34 * outC(u)) * k, 0, TAU); g.stroke(); });
  g.restore();
  if (c.fx && Motion.chargeBits) Motion.chargeBits(g, x, yy, r, k, c);   /* ⚡🔥 mo-6 */
}
function overDust(g, x0, y, k, dir, f) {   // 🏃 the slide's dust trail: puffs left behind at the feet's old spots, cooling to grey
  const d = f.dust; if (!d) return; const n = d.calm ? 3 : 5, fx = x0 + d.dx * k * dir; g.save(); g.lineWidth = Math.max(0.8, 1.2 * k);
  for (let i = 0; i < n; i++) { const t = d.q - i * 0.12; if (t < 0 || t > 1) continue; const xx = fx - d.dx * (1 - i / n) * k * dir - i * 3 * k * dir, r = (4 + 9 * t) * k;
    g.globalAlpha = (1 - t) * 0.8; g.fillStyle = i % 2 ? '#E9E4D8' : '#F4F0E6'; g.strokeStyle = '#B9B2A0'; g.beginPath(); g.arc(xx, y - r * 0.5 - t * 6 * k, r, 0, TAU); g.fill(); g.stroke(); }
  g.restore();
}

// ======================= 🛡️ mo-5 (🎬 Motion chat, 2026-11-18): 🛡️ block · 🏃 shield dash · 💥 push + bash (Motion rules §19) =======================
// G = Motion.guard(who, {t0, calm, wall, inPlace}) = shield UP (fast, then held) · G.hit(t, {weight}) = a blocked hit (shudder + slide back + spark) · G.drop(t) = shield down
// D = Motion.shieldDash(who, {t0, dist, run, calm, wall, inPlace, onContact}) = raise → tuck → RUN with the shield in front → BASH (D.bash(t) when the shield meets the target, or by itself at the end) → push → settle
// Frames are made here (no act) and drawn with Acting.draw like any frame; FX reach the Acting.draw hooks through f.mo. The avatar carries the shield in eq.off (AvWeapons shield v 12–15).
const SHP = {
  READY:  {},
  GUARD:  {armR: 0.45, holdRot: 0.9, elbowR: -0.5, armL: -0.75, elbowL: -0.55, bend: 0.06, dy: 2.5, legR: -0.25, legL: -0.2, kneeL: 0.3, kneeR: 0.25},
  BRACE:  {armR: 0.3, holdRot: 0.9, elbowR: -0.5, armL: -0.55, elbowL: -0.8, bend: -0.08, dy: 4.5, legR: -0.35, legL: -0.35, kneeL: 0.55, kneeR: 0.4},
  TUCK:   {armR: 0.9, holdRot: 1.5, armL: -0.45, elbowL: -1.0, bend: -0.12, dy: 4, legR: -0.2, legL: -0.25, kneeL: 0.6, kneeR: 0.5},
  RUN:    {armR: 1.0, holdRot: 1.5, armL: -1.25, elbowL: -0.35, bend: 0.3},
  BASH:   {armR: 0.8, holdRot: 1.6, armL: -1.4, elbowL: 0.05, bend: 0.38, dy: 2, shift: 6, legR: -0.7, legL: 0.45, kneeR: 0.35, kneeL: 0.3},
  PUSH:   {armR: 0.8, holdRot: 1.6, armL: -1.35, elbowL: -0.1, bend: 0.32, dy: 2.5, shift: 9, legR: -0.6, legL: 0.5, kneeR: 0.4, kneeL: 0.35},
  SETTLE: {armR: 0.4, holdRot: 0.8, armL: -0.55, elbowL: -0.5, bend: 0.05, dy: 1.5, kneeL: 0.2, kneeR: 0.15}};
const ONE = {sx: 1, sy: 1, headSc: 1};
function mixP(A, B, q) { const o = {}; Object.keys(A).concat(Object.keys(B)).forEach(k2 => { if (k2 in o) return; const a = A[k2] != null ? A[k2] : (ONE[k2] || 0), b = B[k2] != null ? B[k2] : (ONE[k2] || 0); o[k2] = a + (b - a) * q; }); return o; }
const bkOut = q => { q = cl(q, 0, 1); const c = 1.70158; return 1 + (c + 1) * Math.pow(q - 1, 3) + c * Math.pow(q - 1, 2); };
const BLOCK = {light: {push: 4, ms: 160, shake: 0}, medium: {push: 8, ms: 200, shake: 2}, heavy: {push: 14, ms: 260, shake: 4}};
const mkF = (id, P, face) => ({id, act: {}, pose: P, face: face || null, marks: [], tricks: [], ride: 'keep', hold: 'keep', mo: 1});
const poseKey = P => Object.keys(P).sort().map(k2 => k2 + Math.round(P[k2] * 50)).join(',');
const withMo = (f, at, t) => { Object.defineProperty(f, '_mo', {value: {poseAt: ms => at(t - ms / 1000).pose}}); return f; };
function guard(who, o) {
  o = Object.assign({}, o || {}); const t0 = o.t0 != null ? o.t0 : performance.now() / 1000;
  const G = {who, t0, hits: [], down: null, o, raiseMs: 70, dropMs: 150, moved: 0};
  G.up = t => (t - t0) * 1000 >= 50 && (G.down == null || t < G.down);
  G.hit = (t, h) => { h = h || {}; const w = BLOCK[h.weight] ? h.weight : 'medium', up = G.up(t); G.hits.push({t, w, B: BLOCK[w], up}); return {weight: w, push: BLOCK[w].push, blocked: up}; };
  G.drop = t => { if (G.down == null) G.down = t != null ? t : performance.now() / 1000; return G; };
  G.at = t => {
    const el = (t - t0) * 1000; let P = el < G.raiseMs ? mixP(SHP.READY, SHP.GUARD, bkOut(el / G.raiseMs)) : mixP(SHP.GUARD, {}, 0);
    if (el >= G.raiseMs) P.dy += 0.5 * Math.sin(el * 0.006);   // 🫁 alive while held
    let dx = 0, fx = null, shake = 0, dust = null, face = el >= 40 ? 'determined' : null;
    G.hits.forEach(H => { const e = (t - H.t) * 1000; if (e < 0) return; const B = H.B, push = H.up ? B.push : B.push * 1.6;
      const room = o.wall != null ? Math.max(0, o.wall - (-dx)) : Infinity; dx -= Math.min(room, push * outC(e / B.ms));
      if (e < B.ms + 120) { const bump = Math.sin(Math.min(1, e / B.ms) * Math.PI); P = mixP(P, SHP.BRACE, bump * 0.9); P.armL += 0.12 * Math.sin(e * 0.09) * Math.exp(-e / 80); }
      if (e < 240 && H.up) fx = {e, w: H.w, calm: !!o.calm};
      if (e < 120 && B.shake && !o.calm) shake = Math.max(shake, B.shake * (1 - e / 120));
      if (H.w !== 'light' && e < B.ms + 260) dust = {q: e / (B.ms + 260), dx, calm: !!o.calm};
      if (e < 300) face = H.up ? 'determined' : 'surprised'; });
    if (G.down != null && t >= G.down) { const e2 = (t - G.down) * 1000; P = mixP(P, SHP.READY, sIO(e2 / G.dropMs)); if (e2 > 60) face = null; }
    if (!o.inPlace) P.shift = (P.shift || 0) + dx;
    const done = G.down != null && (t - G.down) * 1000 >= G.dropMs; if (done) G.moved = dx;
    const f = mkF('motion.guard~' + poseKey(P) + (fx ? '~b' + Math.round(fx.e / 20) : '') + (dust ? '~d' + Math.round(dust.q * 16) : ''), P, face);
    Object.assign(f, {guard: G.up(t), dx, block: fx, dust, shake: shake || 0, done, contact: false});
    return withMo(f, G.at, t);
  };
  return G;
}
const DASH = {dist: 80, run: 420, raise: 80, tuck: 140, strike: 50, stop: 70, push: 180, settle: 220, rest: 160, step: 130, lunge: 6};
function shieldDash(who, o) {
  o = Object.assign({}, o || {}); const t0 = o.t0 != null ? o.t0 : performance.now() / 1000, T = Object.assign({}, DASH, o.times || {});
  if (o.dist != null) T.dist = o.dist; if (o.run != null) T.run = o.run;
  const r0 = T.raise + T.tuck, runQ = e => Math.pow(cl(e / T.run, 0, 1), 1.7);   // accelerates: fastest when it hits
  let runEnd = r0 + T.run, wallHit = false;
  if (o.wall != null && o.wall < T.dist) { runEnd = r0 + T.run * Math.pow(Math.max(0, o.wall) / T.dist, 1 / 1.7); wallHit = true; }
  const D = {who, t0, times: T, o, fired: false, bashAt: null, moved: 0, onContact: o.onContact || null};
  const setBash = (e, hit, wall) => { D.bashAt = e; D.hit = hit; D.wall = wall; D.dxB = T.dist * runQ(e - r0);
    D.speed = e <= r0 ? 0 : 1.7 * Math.pow(cl((e - r0) / T.run, 0, 1), 0.7) / 1.7; D.contactT = t0 + (e + T.strike) / 1000;
    const sp = D.speed; D.info = {hit, wall, speed: +sp.toFixed(3), weight: sp >= 0.75 ? 'heavy' : sp >= 0.4 ? 'medium' : 'light'};
    D.end = e + T.strike + T.stop + T.push + T.settle + T.rest; D.total = D.end; };
  D.bash = (t, o2) => { if (D.bashAt == null) { const e = Math.max(r0, (t - t0) * 1000); if (e < runEnd) setBash(e, true, false); if (o2 && o2.onContact) D.onContact = o2.onContact; } return D; };
  D.at = t => {
    const el = (t - t0) * 1000; if (D.bashAt == null && el >= runEnd) setBash(runEnd, false, wallHit);
    const bA = D.bashAt != null && el >= D.bashAt ? D.bashAt : null;
    let P, dx = 0, face = 'determined', bash = null, puffs = [], speed = 0, shake = 0, phase;
    if (el < T.raise) { P = mixP(SHP.READY, SHP.GUARD, bkOut(el / T.raise)); phase = 'raise'; face = null; }
    else if (el < r0) { P = mixP(SHP.GUARD, SHP.TUCK, outC((el - T.raise) / T.tuck)); phase = 'tuck'; }
    else if (bA == null) {   // 🏃 run with the shield in front (a 2-step leg cycle, the body bobs)
      const e = el - r0, s = Math.sin(Math.PI * e / T.step), q = Math.min(1, e / 90);
      P = mixP(SHP.TUCK, Object.assign({}, SHP.RUN, {legR: -0.6 * s, legL: -0.6 * s, kneeR: 0.55 - 0.35 * s, kneeL: 0.55 + 0.35 * s, dy: -1 + 2 * Math.abs(s)}), q);
      dx = T.dist * runQ(e); speed = runQ(e) > 0 ? Math.min(1, e / T.run) : 0; phase = 'run';
    } else {
      const e = el - bA; dx = D.dxB; phase = 'bash';
      if (e < T.strike) P = mixP(SHP.RUN, SHP.BASH, Math.pow(e / T.strike, 3));
      else if (e < T.strike + T.stop) { P = mixP(SHP.BASH, {}, 0); }                                                   // 💥 contact pose held (hit-stop)
      else if (e < T.strike + T.stop + T.push) { const u = (e - T.strike - T.stop) / T.push; P = mixP(SHP.BASH, SHP.PUSH, bkOut(u)); dx += D.wall ? -3 * Math.sin(u * Math.PI / 2) : T.lunge * outC(u) * (0.5 + D.speed / 2); phase = 'push'; }
      else { const u = (e - T.strike - T.stop - T.push); dx += D.wall ? -3 : T.lunge * (0.5 + D.speed / 2);
        P = u < T.settle ? mixP(SHP.PUSH, SHP.SETTLE, sIO(u / T.settle)) : mixP(SHP.SETTLE, SHP.READY, sIO((u - T.settle) / T.rest)); phase = 'settle'; if (u > T.settle) face = null; }
      if (e >= T.strike && e < T.strike + 220) bash = {e: e - T.strike, hit: D.hit, calm: !!o.calm, sp: D.speed};
      if (e >= T.strike && e < T.strike + 120 && !o.calm) shake = (D.hit || D.wall ? 3 : 1.5) * (1 - (e - T.strike) / 120);
    }
    // 👣 a dust puff at every footfall of the run, left behind on the ground
    const runTo = bA != null ? bA : Math.min(el, runEnd);
    for (let k2 = 0; r0 + T.step / 2 + k2 * T.step < runTo; k2++) { const ef = r0 + T.step / 2 + k2 * T.step, age = (el - ef) / 260; if (age < 0 || age > 1) continue;
      puffs.push({rx: T.dist * runQ(ef - r0) - (o.inPlace ? dx : 0), age}); }
    if (!o.inPlace) P.shift = (P.shift || 0) + dx;
    const done = D.end != null && el >= D.end; if (done) D.moved = dx;
    const contact = D.contactT != null && t >= D.contactT;
    const f = mkF('motion.dash~' + poseKey(P) + '~' + puffs.map(p => Math.round(p.age * 10)).join('.') + (bash ? '~x' + Math.round(bash.e / 20) : '') + '~s' + Math.round(speed * 8), P, face);
    Object.assign(f, {guard: el >= T.raise * 0.6 && !(phase === 'settle' && el - D.bashAt - T.strike - T.stop - T.push > T.settle * 0.5), dx, bash, puffs: puffs.length ? puffs : null, speed, shake, phase, contact, done,
      stop: !!(bA != null && el - bA >= T.strike && el - bA < T.strike + T.stop)});
    if (D.contactT != null && !D.fired && t >= D.contactT) { D.fired = true; if (D.onContact) D.onContact(D, D.info); }
    return withMo(f, D.at, t);
  };
  return D;
}
// 🛡️ FX — where the shield face is (avatar units, before the body turn): the off hand + a little forward
function shieldAt(f) { const P = f.pose || {}, a = P.armL || 0, b = a + (P.elbowL || 0), ex = -10 - Math.sin(a) * 8 - Math.sin(b) * 8, ey = -42 + Math.cos(a) * 8 + Math.cos(b) * 8;
  const bd = P.bend || 0, px = ex, py = ey + 22, rx = px * Math.cos(bd) - py * Math.sin(bd), ry = px * Math.sin(bd) + py * Math.cos(bd);   // the body leans round the hips
  return [rx + 6 + (P.shift || 0), ry - 22 + (P.dy || 0)]; }
function blockFx(g, x0, y, k, dir, f) {   // a blocked hit: 1 white star frame → a blue ring that grows and breaks → sparks fly back toward the attacker
  const B = f.block, s = shieldAt(f), x = x0 + s[0] * k * dir, yy = y + s[1] * k, big = B.w === 'heavy' ? 1.35 : B.w === 'light' ? 0.75 : 1, c = B.calm ? 0.5 : 1, e = B.e;
  g.save(); g.lineCap = 'round';
  if (e < 45 && !B.calm) { g.fillStyle = '#FFFFFF'; g.strokeStyle = '#2B2D42'; g.lineWidth = 1.2 * k; g.beginPath(); for (let i = 0; i < 12; i++) { const r = (i % 2 ? 4 : 11) * k * big, an = i * Math.PI / 6; g.lineTo(x + Math.cos(an) * r, yy + Math.sin(an) * r); } g.closePath(); g.fill(); g.stroke(); }
  const u = cl(e / 240, 0, 1), R = (6 + 18 * outC(u)) * k * big;
  g.globalAlpha = (1 - u) * c; g.strokeStyle = u < 0.4 ? '#BFE9FF' : '#7FB7FF'; g.lineWidth = (3.2 - 2.4 * u) * k; g.setLineDash(u > 0.45 ? [3 * k, 4 * k] : []);
  g.beginPath(); g.arc(x, yy, R, -1.2, 1.2); g.stroke(); g.beginPath(); g.arc(x, yy, R, Math.PI - 0.6, Math.PI + 0.6); g.stroke(); g.setLineDash([]);
  const n = B.w === 'heavy' ? 8 : 6; for (let i = 0; i < n; i++) { const an = (-0.9 + 1.8 * i / (n - 1)) + (dir < 0 ? Math.PI : 0), d0 = (8 + 26 * outC(u)) * k * big, L = (7 - 6 * u) * k;
    g.globalAlpha = (1 - u) * c; g.strokeStyle = i % 2 ? '#FFE08A' : '#FFFFFF'; g.lineWidth = 1.8 * k; g.beginPath(); g.moveTo(x + Math.cos(an) * d0, yy + Math.sin(an) * d0); g.lineTo(x + Math.cos(an) * (d0 + L), yy + Math.sin(an) * (d0 + L)); g.stroke(); }
  g.restore();
}
function bashFx(g, x0, y, k, dir, f) {   // 💥 the bash: a forward shockwave crescent + speed dashes (the TARGET's own hit comes from Motion.hit)
  const B = f.bash, s = shieldAt(f), x = x0 + s[0] * k * dir, yy = y + s[1] * k, u = cl(B.e / 220, 0, 1), c = B.calm ? 0.5 : 1, big = 0.8 + 0.5 * B.sp;
  g.save(); g.lineCap = 'round'; const a0 = dir > 0 ? 0 : Math.PI;
  for (let j = 0; j < 2; j++) { const R = (8 + (22 + j * 10) * outC(u)) * k * big; g.globalAlpha = (1 - u) * c * (j ? 0.6 : 1); g.strokeStyle = j ? '#7FB7FF' : '#FFFFFF'; g.lineWidth = (4 - 3 * u) * k;
    g.beginPath(); g.arc(x, yy, R, a0 - 0.95, a0 + 0.95); g.stroke(); }
  if (u < 0.6) { g.globalAlpha = (1 - u / 0.6) * c; g.strokeStyle = '#FFFFFF'; g.lineWidth = 2 * k; [-10, 0, 10].forEach((oy, i) => { const d = (14 + 20 * u) * k; g.beginPath(); g.moveTo(x + dir * d, yy + oy * k); g.lineTo(x + dir * (d + (9 - i * 2) * k), yy + oy * k); g.stroke(); }); }
  g.restore();
}
function runFx(g, x0, y, k, dir, f) {   // 👣 footfall puffs + speed lines behind the runner (under the body)
  g.save(); if (f.puffs) f.puffs.forEach(p => { const r = (3 + 6 * p.age) * k, xx = x0 + (p.rx - 6 - 4 * p.age) * k * dir; g.globalAlpha = (1 - p.age) * 0.75; g.fillStyle = '#F2EEE3'; g.strokeStyle = '#B9B2A0'; g.lineWidth = Math.max(0.8, 1.1 * k);
    g.beginPath(); g.arc(xx, y - r * 0.6 - p.age * 4 * k, r, 0, TAU); g.fill(); g.stroke(); });
  if (f.speed > 0.35) { const q = (f.speed - 0.35) / 0.65, bx = x0 + ((f.pose && f.pose.shift) || 0) * k * dir; g.strokeStyle = '#9AA3C7'; g.lineWidth = 1.6 * k;
    [-44, -32, -18].forEach((oy, i) => { const L = (10 + 18 * q) * k, xs = bx - dir * (16 + i * 3) * k; g.globalAlpha = 0.6 * q; g.beginPath(); g.moveTo(xs, y + oy * k); g.lineTo(xs - dir * L, y + oy * k); g.stroke(); }); }
  g.restore();
}

window.Motion = {VERSION: 'mo-5', WEIGHTS, PHASE_EASE, FADE, prep, frame, drawSmear, shake, reach, points,
  hit, drawHit, drawHitFx, flash, knock, drawKnockFx, land, landInfo, drawUnder, RAMP, HIT, ENEMY_ANT, KNOCK_KEYS: Object.keys(KNOCK),
  hang, akPre, akPaint, HANG, spin, paintRing, VIEWS, viewOf, viewPose, view8, idle, PHI0, TILT, easeTurn,
  charge, CHARGE, POWER, chargeFx, overDust,
  guard, shieldDash, BLOCK, DASH, SHIELD_POSES: SHP, blockFx, bashFx, runFx};
})();
/* ================= ⚡🔥 MotionFX (mo-6, 🎬 Motion chat, 2026-11-18) — element effects for every game =================
   Rules: `FX Bible.md` (F1–F16, the learning curve) + `Motion rules.md` §21–22. Built INTO AvatarMotion.html after the main Motion layer (build_motion.py).
   E = Motion.fx(kind, {x, y (px on your canvas), k (px per avatar unit), dir, element, to: [x, y], pts: [[x, y]…], r, w, h, top, box: [x, y, w, h],
                        t0 (s, default now), seed, calm, day, step: 33, flash: false, ms (loops: stop by itself), onContact(E)})
     kinds: ⚡ bolt · arc · crackle · zapped · ✨ sparks · clash · 🔥 flame · fireball · eruption · vortex · aura · burning · 🌀 spiral · 🫧 bubble · 💠 ground · 🌟 pillar (Motion.FX = the list + meta)
     each frame: Motion.drawFxBack(g, E, t) BEFORE the body (aura) · Motion.drawFx(g, E, t) after it (fires onContact ONCE at the pop) · E.at(t) → {e, on, contact, flash, shake {x, y}, amp, done}
     loops run until E.stop(t) (200 ms fade) · E.move(x, y) follows a body · E.aim(x, y) moves the target · E.end() = when it is gone
   Motion.status('burn' | 'zap', {x, y (feet), w, h, k, ms}) = a status loop on a body that stops by itself (never on the face — F11)
   LINKS (opt-in with {fx: true, element} — without it nothing changes):
     Motion.hit({…, element, fx: true[, status: false]}) → element bits on the burst + 🔥 burning 600 / ⚡ zapped 500 ms on the body (drawHit)
     Motion.charge(who, key, {…, element, fx: true}) → flame licks / crackle / bits round the charge glow
     Acting.play(who, act, {element, fx: true}) → an ember / crackle / drop / shard / leaf / star trail along the smear
     🦶 {from: 'footR' | 'footL' | 'handL' | 'head'} on Acting.play / Motion.charge → smear, glow, sparks + trails sit on that limb (a 🔥 fire kick)
   Safety: whole-area flash ≤ 2 an effect · ≤ 3 a second (granted when the effect is made) · calm = no area flash, fewer bits · day = normal paint + dark rims.
   Speed: plain canvas + ONE cached glow sprite per colour, no shadowBlur · pure (same t = same picture). */
(function () {
  if (!window.Motion || window.Motion.fx) return;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const outBack = q => { const c = 1.7; q = clamp(q, 0, 1) - 1; return Math.max(0, 1 + (c + 1) * q * q * q + c * q * q); };
  const outQ = q => 1 - (1 - clamp(q, 0, 1)) ** 3;
  const inQ = q => clamp(q, 0, 1) ** 2;
  const lerp = (a, b, q) => a + (b - a) * q;
  function rng(seed) { let s = (seed >>> 0) % 2147483647 || 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  const hex = c => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const rgba = (c, a) => { const [r, g, b] = hex(c); return 'rgba(' + r + ',' + g + ',' + b + ',' + clamp(a, 0, 1).toFixed(3) + ')'; };
  function rampAt(R, q) { q = clamp(q, 0, 0.9999) * (R.length - 1); const i = Math.floor(q), f = q - i, A = hex(R[i]), B = hex(R[i + 1]);
    return '#' + [0, 1, 2].map(j => Math.round(A[j] + (B[j] - A[j]) * f).toString(16).padStart(2, '0')).join(''); }
  // hot → cool ramps per element (index 0 = white core … last = the darkest edge)
  const EL = {
    fire:   {ramp: ['#FFFFFF', '#FFF4B8', '#FFC83D', '#FF8A3D', '#F0502A', '#B8322A', '#5E2340'], glow: '#FF7A2E', smoke: '#5C4A6B'},
    zap:    {ramp: ['#FFFFFF', '#EAF8FF', '#A8E8FF', '#5CC8FF', '#3A86FF', '#4B3FC4', '#22205E'], glow: '#59C3FF', smoke: '#3B3F7A'},
    ice:    {ramp: ['#FFFFFF', '#E7F8FF', '#B8ECFF', '#7FD1F5', '#4DABF7', '#3A6FC4', '#283C7A'], glow: '#8FDCFF', smoke: '#A9C6E8'},
    water:  {ramp: ['#FFFFFF', '#DDF6FF', '#8EE3F5', '#3BC9DB', '#1C9AD6', '#1A5FA8', '#1B2F6B'], glow: '#3BC9DB', smoke: '#6CA0C8'},
    nature: {ramp: ['#FFFFFF', '#F1FFD9', '#C6F27A', '#7ED957', '#2FB86B', '#1F8A5B', '#1B4D3E'], glow: '#7ED957', smoke: '#6B8F5E'},
    light:  {ramp: ['#FFFFFF', '#FFFBE0', '#FFEE99', '#FFD43B', '#FFB020', '#E08A1E', '#8A5A20'], glow: '#FFE066', smoke: '#C9B37A'},
    shadow: {ramp: ['#FFFFFF', '#EEE6FF', '#C9B3FF', '#9B7BFF', '#7048E8', '#4B2A9E', '#24154F'], glow: '#9B7BFF', smoke: '#3B2A5E'},
    candy:  {ramp: ['#FFFFFF', '#FFF0F8', '#FFC9E3', '#FF8CC6', '#F06595', '#C2408A', '#6B2358'], glow: '#FF8CC6', smoke: '#B07AA8'},
    spirit: {ramp: ['#FFFFFF', '#E3FFFC', '#9FFBF0', '#3FE0D0', '#18A8C4', '#155E9C', '#0E2A5E'], glow: '#3FE0D0', smoke: '#1D4E7A'},
  };
  const E_ = el => EL[el] || EL.fire;
  let DAY = false;   // {day: true} = a light game background: normal paint (no 'lighter') + a dark rim under lines, softer glows
  const lite = g => { g.globalCompositeOperation = DAY ? 'source-over' : 'lighter'; };
  // ---------- ONE cached glow sprite per colour (replaces shadowBlur) ----------
  const GC = {};
  function glowSprite(col) { if (GC[col]) return GC[col]; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, rgba(col, 0.9)); gr.addColorStop(0.25, rgba(col, 0.45)); gr.addColorStop(0.6, rgba(col, 0.12)); gr.addColorStop(1, rgba(col, 0));
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return (GC[col] = c); }
  function glow(g, x, y, r, col, a, sy) { if (r <= 0 || a <= 0) return; g.save(); lite(g); g.globalAlpha = clamp(a * (DAY ? 0.45 : 1), 0, 1); g.drawImage(glowSprite(col), x - r, y - r * (sy || 1), r * 2, r * 2 * (sy || 1)); g.restore(); }
  // ---------- ⚡ jagged lines ----------
  function jag(ax, ay, bx, by, rough, depth, R, out, br, lvl) {   // midpoint displacement + forks
    const pts = [[ax, ay], [bx, by]];
    for (let d = 0; d < depth; d++) { for (let i = pts.length - 1; i > 0; i--) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / (L || 1), ny = (x1 - x0) / (L || 1), off = (R() - 0.5) * L * rough;
      pts.splice(i, 0, [(x0 + x1) / 2 + nx * off, (y0 + y1) / 2 + ny * off]); } }
    out.push({pts, lvl: lvl || 0});
    if (br && (lvl || 0) < 2) for (let i = 2; i < pts.length - 2; i++) if (R() < br) { const [x, y] = pts[i], ang = Math.atan2(by - ay, bx - ax) + (R() - 0.5) * 1.6, L = Math.hypot(bx - ax, by - ay) * (0.18 + R() * 0.25);
      jag(x, y, x + Math.cos(ang) * L, y + Math.sin(ang) * L, rough * 1.1, Math.max(2, depth - 2), R, out, br * 0.5, (lvl || 0) + 1); }
    return out; }
  function path(g, pts, from, to) { g.beginPath(); const n = pts.length - 1, a = Math.floor(n * (from || 0)), b = Math.ceil(n * (to == null ? 1 : to)); for (let i = a; i <= b; i++) g.lineTo(pts[i][0], pts[i][1]); }
  function strokeBolt(g, line, w, E, a, from, to) {   // 3 passes: wide soft colour · mid colour · white core
    const lw = w / (1 + line.lvl * 0.9); g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; lite(g);
    path(g, line.pts, from, to); if (DAY) { g.strokeStyle = rgba(E.ramp[6], 0.85 * a); g.lineWidth = lw * 2.6 + 1.5; g.stroke(); } g.strokeStyle = rgba(E.ramp[4], 0.35 * a); g.lineWidth = lw * 3.2; g.stroke();
    g.strokeStyle = rgba(E.ramp[3], 0.85 * a); g.lineWidth = lw * 1.5; g.stroke();
    g.strokeStyle = rgba(E.ramp[0], a); g.lineWidth = Math.max(0.8, lw * 0.55); g.stroke(); g.restore(); }
  // ---------- 🔥 one cel-shaded flame tongue (base centre x,y · width w · height h · sway s) ----------
  function tongue(g, x, y, w, h, s, col, curl) { const c = curl || 0; g.beginPath(); g.moveTo(x - w / 2, y);
    g.bezierCurveTo(x - w * 0.6, y - h * 0.35, x - w * 0.15 + s * 0.4, y - h * 0.62, x + s + c, y - h);
    g.bezierCurveTo(x + w * 0.2 + s * 0.5, y - h * 0.55, x + w * 0.62, y - h * 0.3, x + w / 2, y);
    g.quadraticCurveTo(x, y + w * 0.18, x - w / 2, y); g.fillStyle = col; g.fill(); }
  function flameStack(g, x, y, w, h, s, E, a, cool) {   // 4 nested tongues: dark edge → orange → yellow → white core
    const R = E.ramp, c0 = cool || 0; g.save(); g.globalAlpha = a;
    tongue(g, x, y, w, h, s, R[Math.min(6, 4 + c0)]); tongue(g, x, y, w * 0.78, h * 0.82, s * 0.9, R[Math.min(6, 3 + c0)]);
    tongue(g, x, y, w * 0.55, h * 0.6, s * 0.75, R[Math.min(6, 2 + c0)]); tongue(g, x, y, w * 0.3, h * 0.36, s * 0.5, R[Math.min(6, c0)]); g.restore(); }
  const noise = (t, s) => Math.sin(t * 7.1 + s) * 0.6 + Math.sin(t * 13.7 + s * 2.3) * 0.4;
  // particles that rise (embers) — pure: same t = same picture
  function embers(g, x, y, W, H, n, t, E, seed, a, size) { const R = rng(seed); g.save(); lite(g);
    for (let i = 0; i < n; i++) { const life = 0.7 + R() * 0.8, ph = R() * life, q = ((t + ph) % life) / life, ex = x + (R() - 0.5) * W + Math.sin((t + ph) * 5 + i) * 6 * q, ey = y - q * H * (0.6 + R() * 0.6), s = (size || 2.2) * (0.6 + R() * 0.8) * (1 - q * 0.6);
      g.globalAlpha = a * (q < 0.15 ? q / 0.15 : 1 - (q - 0.15) / 0.85); g.fillStyle = rampAt(E.ramp, 0.25 + q * 0.6); g.beginPath(); g.arc(ex, ey, s, 0, TAU); g.fill(); } g.restore(); }
  function smoke(g, x, y, r, q, E, seed, a) { const R = rng(seed); g.save(); for (let i = 0; i < 5; i++) { const ang = -Math.PI / 2 + (R() - 0.5) * 1.8, d = r * (0.3 + q * 1.2) * (0.6 + R() * 0.6), rr = r * (0.35 + q * 0.5) * (0.6 + R() * 0.5);
    g.globalAlpha = a * (1 - q) * 0.55; g.fillStyle = E.smoke; g.beginPath(); g.arc(x + Math.cos(ang) * d, y + Math.sin(ang) * d - q * r * 0.8, rr, 0, TAU); g.fill(); } g.restore(); }
  function ellipse(g, x, y, rx, ry, col, w, a0, a1) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, a0 || 0, a1 == null ? TAU : a1); g.strokeStyle = col; g.lineWidth = w; g.stroke(); }
  // ==================== the effects ====================
  const K = {};
  // ⚡ BOLT — a strike from the sky onto a point (thunder). 0–0.22 s leader + sparks gather · 0.22 STRIKE (white) · branches glow · breaks into pieces · scorch + crackle
  K.bolt = {el: 'zap', life: 1.1, contact: 0.22, flashAt: 0.22, shake: [0.22, 3, 250], draw(g, P, t) { const E = P.E, k = P.k, x = P.x, y = P.y, top = P.top == null ? y - 260 * k : P.top, c = this.contact;
    if (t < c) { const q = t / c; const R = rng(P.seed + Math.floor(t / 0.06)); const L = jag(x + (R() - 0.5) * 40 * k, top, x, y, 0.42, 5, R, []);   // stepped leader: thin, flickers down
      strokeBolt(g, L[0], 1.2 * k, E, 0.35 + q * 0.3, 0, q * 0.8); glow(g, x, y, (10 + q * 16) * k, E.glow, q * 0.8, 0.5);
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t * 3, d = (24 - q * 20) * k; g.save(); lite(g); g.fillStyle = E.ramp[1]; g.globalAlpha = q; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.4, 1.6 * k, 0, TAU); g.fill(); g.restore(); }
      return; }
    const e = t - c, R0 = rng(P.seed), lines = jag(x + (R0() - 0.5) * 40 * k, top, x, y, 0.42, 6, R0, [], 0.22);
    const re = !P.calm && e > 0.16 && e < 0.22;   // ONE re-strike (2 flashes in all)
    if (e < 0.05 && P._flash) areaFlash(g, P, 0.45 * (1 - e / 0.05), '#FFFFFF');   // area flash, 1 frame
    if (e < 0.16 || re) { const a = re ? 0.8 : 1; lines.forEach(L => strokeBolt(g, L, (re ? 3 : 4.2) * k, E, a)); glow(g, x, y, 46 * k, E.glow, a, 0.45); glow(g, x, top + 30 * k, 30 * k, E.glow, 0.35 * a); }
    else if (e < 0.55) { const q = (e - 0.16) / 0.39; lines.forEach((L, j) => { if (L.lvl > 0 && q > 0.3) return; const segs = 7; for (let s = 0; s < segs; s++) { if (rng(P.seed + s * 13 + j)() < q) continue;   // breaks into pieces
        const f0 = s / segs, f1 = f0 + (1 / segs) * (1 - q * 0.7); g.save(); g.translate((s - 3) * q * 3 * k, -q * 8 * k * (s % 2)); strokeBolt(g, L, 2.6 * k * (1 - q * 0.6), E, 1 - q * 0.5, f0, f1); g.restore(); } }); }
    // ground: scorch ring + crackles that hop (re-seeded every 60 ms)
    const q = clamp(e / 0.9, 0, 1); g.save(); lite(g); ellipse(g, x, y, (14 + outQ(q) * 44) * k, (5 + outQ(q) * 15) * k, rgba(E.ramp[3], 0.9 * (1 - q)), 2.4 * k * (1 - q) + 0.5); g.restore();
    if (e < 0.8) { const R = rng(P.seed + 99 + Math.floor(e / 0.06) * 7); for (let i = 0; i < (P.calm ? 2 : 4); i++) { const a = R() * TAU, d = (8 + R() * 26) * k; const L = jag(x + Math.cos(a) * 4 * k, y + Math.sin(a) * 2 * k, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.35 - R() * 10 * k, 0.6, 3, R, []); strokeBolt(g, L[0], 1.2 * k, E, 1 - e / 0.8); } }
    glow(g, x, y, 30 * k * (1 - q), E.glow, 0.6 * (1 - q), 0.45); }};
  // ⚡ ARC — chain lightning between points (hand → target → target), re-jagged every 50 ms
  K.arc = {el: 'zap', life: 0.7, loop: true, draw(g, P, t) { const E = P.E, k = P.k, pts = P.pts; const R = rng(P.seed + Math.floor(t / (P.calm ? 0.1 : 0.05)) * 31);
    const grow = clamp(t / 0.08, 0, 1);
    for (let i = 0; i + 1 < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], d = Math.hypot(bx - ax, by - ay); const L = jag(ax, ay, bx, by, 0.35, 5, R, [], 0.12);
      L.forEach(l => strokeBolt(g, l, (2.6 + Math.sin(t * 40) * 0.6) * k, E, 1, 0, grow)); glow(g, bx, by, 18 * k, E.glow, 0.8 * grow); }
    glow(g, pts[0][0], pts[0][1], 16 * k, E.glow, 0.9); }};
  // ⚡ CRACKLE — an electric orb / ring with arcs crawling off it (loop)
  K.crackle = {el: 'zap', life: 1, loop: true, draw(g, P, t) { const E = P.E, k = P.k, x = P.x, y = P.y, r = (P.r || 26) * k;
    glow(g, x, y, r * 2.2, E.glow, 0.5); g.save(); lite(g);
    for (let pass = 0; pass < 2; pass++) { g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, w = 1 + 0.06 * noise(t * 2 + a * 3, pass * 5); g.lineTo(x + Math.cos(a) * r * w, y + Math.sin(a) * r * w); }
      g.strokeStyle = pass ? E.ramp[0] : rgba(E.ramp[3], 0.8); g.lineWidth = pass ? 1.6 * k : 5 * k; g.stroke(); }
    g.fillStyle = rgba(E.ramp[6], 0.55); g.beginPath(); g.arc(x, y, r * 0.92, 0, TAU); g.fill(); g.restore();
    const R = rng(P.seed + Math.floor(t / (P.calm ? 0.12 : 0.06)) * 17); for (let i = 0; i < (P.calm ? 4 : 7); i++) { const a = R() * TAU, len = r * (0.5 + R() * 1.1);
      const L = jag(x + Math.cos(a) * r, y + Math.sin(a) * r, x + Math.cos(a + (R() - 0.5) * 0.9) * (r + len), y + Math.sin(a + (R() - 0.5) * 0.9) * (r + len), 0.55, 4, R, [], 0.15);
      L.forEach(l => strokeBolt(g, l, 1.4 * k, E, 0.9)); } }};
  // ⚡ ZAPPED — status on a body box [x, y(feet), w, h]: arcs hop across the body, the body flickers light/dark
  K.zapped = {el: 'zap', life: 1.2, loop: true, draw(g, P, t) { const E = P.E, k = P.k, [x, y, w, h] = [P.x, P.y, P.w * k, P.h * k]; const R = rng(P.seed + Math.floor(t / 0.07) * 11);
    for (let i = 0; i < (P.calm ? 2 : 3); i++) { const ax = x + (R() - 0.5) * w, ay = y - R() * h, bx = x + (R() - 0.5) * w, by = y - R() * h; jag(ax, ay, bx, by, 0.5, 4, R, [], 0.2).forEach(l => strokeBolt(g, l, 1.5 * k, E, 0.95)); }
    for (let i = 0; i < 5; i++) { const sx = x + (R() - 0.5) * w * 1.3, sy = y - R() * h; glow(g, sx, sy, 5 * k, E.glow, 0.9); } }};
  // ✨ SPARKS — metal sparks: hot dashes with gravity that bounce once on the floor and cool (forge · grind · blade on stone)
  K.sparks = {el: 'fire', life: 0.9, draw(g, P, t) { const E = P.E, k = P.k, R = rng(P.seed), n = P.calm ? 10 : P.n || 22, fy = P.floor == null ? P.y + 30 * k : P.floor, dir = P.dir || 1;
    g.save(); lite(g); g.lineCap = 'round';
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (R() - 0.35) * 2.2 * (P.spread || 1), v = (120 + R() * 220) * k, vx = Math.cos(a) * v * dir, vy = Math.sin(a) * v, life = 0.35 + R() * 0.5; if (t > life) continue;
      const pos = s => { let px = P.x + vx * s, py = P.y + vy * s + 420 * k * s * s; if (py > fy) { const tb = s; py = fy - (py - fy) * 0.35; } return [px, py]; };
      const [x1, y1] = pos(t), [x0, y0] = pos(Math.max(0, t - 0.035)), q = t / life; g.globalAlpha = 1 - q * q;
      if (DAY) { g.strokeStyle = E.ramp[6]; g.lineWidth = (2.2 - q * 1.2) * k + 1.6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
      g.strokeStyle = rampAt(E.ramp, 0.05 + q * 0.75); g.lineWidth = (2.2 - q * 1.2) * k; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    g.restore(); if (t < 0.12) glow(g, P.x, P.y, 26 * k * (1 - t / 0.12), E.glow, 1 - t / 0.12); }};
  // ✨ CLASH — two blades meet: white 4-point star + radial dashes + a little spark spray
  K.clash = {el: 'light', life: 0.5, draw(g, P, t) { const E = P.E, k = P.k, x = P.x, y = P.y, q = t / this.life, s = outBack(q / 0.18) * (1 - inQ((q - 0.4) / 0.6));
    glow(g, x, y, 40 * k * s, E.glow, 0.9 * (1 - q)); g.save(); g.translate(x, y); g.rotate(0.3); lite(g); g.fillStyle = E.ramp[0]; g.globalAlpha = 1 - q * 0.6;
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = (i % 2 ? 4 : 26) * k * s; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill();
    const R = rng(P.seed); g.strokeStyle = E.ramp[2]; g.lineCap = 'round'; for (let i = 0; i < 10; i++) { const a = R() * TAU, d0 = (10 + outQ(q) * 26) * k, d1 = d0 + (10 + R() * 12) * k * (1 - q); g.lineWidth = 2 * k * (1 - q); g.beginPath(); g.moveTo(Math.cos(a) * d0, Math.sin(a) * d0); g.lineTo(Math.cos(a) * d1, Math.sin(a) * d1); g.stroke(); }
    g.restore(); K.sparks.draw(g, Object.assign({}, P, {n: 10, E: EL.fire, spread: 1.3}), t); }};
  // 🔥 FLAME — a fire that keeps burning (torch · camp fire · burning ground), cel-shaded tongues + embers
  K.flame = {el: 'fire', life: 1, loop: true, draw(g, P, t) { const E = P.E, k = P.k, x = P.x, y = P.y, W = (P.w || 30) * k, H = (P.h || 46) * k, n = P.calm ? 3 : 5;
    glow(g, x, y - H * 0.35, H * 0.9, E.glow, 0.45, 0.9);
    for (let i = 0; i < n; i++) { const f = n === 1 ? 0.5 : i / (n - 1), off = (f - 0.5) * W * 0.8, c = 1 - Math.abs(f - 0.5) * 1.3, h = H * (0.55 + 0.45 * c) * (0.85 + 0.15 * noise(t * 1.3, i * 2.1)), s = noise(t, i * 3.3) * W * 0.18;
      flameStack(g, x + off, y, W * (0.32 + 0.25 * c), h, s, E, 1); }
    embers(g, x, y - H * 0.5, W, H * 1.2, P.calm ? 4 : 9, t, E, P.seed, 1, 1.8 * k); }};
  // 🔥 FIREBALL — flies from → to with a tongue tail, then BURSTS (white → biggest burst → tongues out → smoke + embers)
  K.fireball = {el: 'fire', life: 1.25, contact: 0.45, shake: [0.45, 2, 200], draw(g, P, t) { const E = P.E, k = P.k, [ax, ay] = [P.x, P.y], [bx, by] = P.to, c = this.contact;
    if (t < c) { const q = t / c, x = lerp(ax, bx, q), y = lerp(ay, by, q) - Math.sin(q * Math.PI) * 18 * k, ang = Math.atan2(by - ay, bx - ax);
      g.save(); g.translate(x, y); g.rotate(ang - Math.PI / 2); for (let i = 0; i < 3; i++) flameStack(g, (i - 1) * 4 * k, -2 * k, 14 * k, (34 + 8 * noise(t, i)) * k, noise(t * 2, i) * 4 * k, E, 1); g.restore();
      glow(g, x, y, 22 * k, E.glow, 0.9); g.save(); g.fillStyle = E.ramp[1]; g.beginPath(); g.arc(x, y, 7 * k, 0, TAU); g.fill(); g.restore();
      embers(g, (x + ax) / 2, (y + ay) / 2 + 10 * k, Math.abs(bx - ax) * q, 30 * k, 6, t, E, P.seed, 0.8, 1.6 * k); return; }
    const e = t - c, x = bx, y = by;
    if (e < 0.05 && !P.calm) { g.save(); g.fillStyle = '#FFFFFF'; g.globalAlpha = 0.95; g.beginPath(); g.arc(x, y, 22 * k, 0, TAU); g.fill(); g.restore(); return; }
    const q = clamp((e - 0.05) / 0.75, 0, 1), R = rng(P.seed + 5); glow(g, x, y, 60 * k * (1 - q * 0.5), E.glow, 0.8 * (1 - q));
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + R() * 0.4; g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2); flameStack(g, 0, -6 * k, (16 - q * 8) * k, (34 * outBack(q / 0.25) * (1 - q * 0.6)) * k, noise(e, i) * 3 * k, E, 1 - q, q > 0.5 ? 1 : 0); g.restore(); }
    smoke(g, x, y, 26 * k, q, E, P.seed, 1); embers(g, x, y, 50 * k, 70 * k, 10, e, E, P.seed + 1, 1 - q, 2 * k); }};
  // 🔥 ERUPTION — a crown of fire spikes bursts up from the ground in a fan (ref territory-effect), holds, sinks
  K.eruption = {el: 'fire', life: 1.4, contact: 0.12, shake: [0.12, 2, 300], draw(g, P, t) { const E = P.E, k = P.k, x = P.x, y = P.y, R = rng(P.seed), n = P.calm ? 5 : 7, q = t / this.life;
    const sink = 1 - inQ((q - 0.72) / 0.28); glow(g, x, y, 80 * k * sink, E.glow, 0.55, 0.32);
    g.save(); lite(g); ellipse(g, x, y, 60 * k * outQ(q / 0.2), 14 * k * outQ(q / 0.2), rgba(E.ramp[2], 0.9 * sink), 3 * k); g.restore();
    for (let i = 0; i < n; i++) { const f = i / (n - 1) - 0.5, delay = Math.abs(f) * 0.12 + R() * 0.04, gq = outBack((t - delay) / 0.16) * sink; if (gq <= 0) continue;
      const tilt = f * 1.25, len = (i === (n >> 1) ? 120 : 70 + R() * 40) * k * gq, bx = x + f * 70 * k;
      g.save(); g.translate(bx, y); g.rotate(tilt); flameStack(g, 0, 0, (i === (n >> 1) ? 30 : 16) * k, len, noise(t, i) * 4 * k, E, 1, q > 0.8 ? 1 : 0); g.restore(); }
    K.sparks.draw(g, Object.assign({}, P, {n: 12, floor: y + 4 * k, spread: 1.6}), t % 0.6);
    embers(g, x, y - 40 * k, 140 * k, 160 * k, P.calm ? 6 : 14, t, E, P.seed + 3, sink, 2.4 * k); }};
  // 🔥 VORTEX — a swirl of fire lying on the ground (2.5D, ref va-va): curved tongues travel round an ellipse
  K.vortex = {el: 'fire', life: 2, loop: true, draw(g, P, t) { const E = P.E, k = P.k, x = P.x, y = P.y, r = (P.r || 60) * k, sy = 0.36;
    glow(g, x, y, r * 1.5, E.glow, 0.6, sy); g.save(); lite(g);
    for (let ring = 0; ring < 3; ring++) { const rr = r * (0.45 + ring * 0.27), sp = (1.6 - ring * 0.35) * (P.calm ? 0.5 : 1), m = 5 + ring * 2;
      for (let i = 0; i < m; i++) { const a0 = i / m * TAU + t * sp + ring, a1 = a0 + 0.9 + 0.3 * noise(t, i + ring * 9); g.beginPath();
        for (let s = 0; s <= 12; s++) { const u = s / 12, a = lerp(a0, a1, u), rad = rr * (1 + 0.12 * Math.sin(u * Math.PI)); g.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad * sy - Math.sin(u * Math.PI) * 6 * k * (ring === 2 ? 2.4 : 1)); }
        g.strokeStyle = rampAt(E.ramp, 0.62 - ring * 0.2); g.lineWidth = (8 - ring * 1.8) * k; g.lineCap = 'round'; g.globalAlpha = 0.85; g.stroke(); } }
    g.restore(); embers(g, x, y, r * 1.6, r * 1.1, P.calm ? 5 : 12, t, E, P.seed, 1, 1.8 * k);
    // licks that rise off the rim now and then
    for (let i = 0; i < 4; i++) { const ph = ((t * 0.9 + i * 0.27) % 1), a = i * 1.7 + t * 0.8, lx = x + Math.cos(a) * r * 0.95, ly = y + Math.sin(a) * r * 0.95 * sy;
      flameStack(g, lx, ly, 12 * k, 40 * k * Math.sin(ph * Math.PI), noise(t, i) * 6 * k, E, Math.sin(ph * Math.PI)); } }};
  // 🔥 AURA — power-up flames round a standing avatar (ref u-n-e-a-s-y): tongues rise from the feet + sides, a fire hoop climbs the body, embers, rocks lift
  K.aura = {el: 'fire', life: 2, loop: true, back(g, P, t) { const E = P.E, k = P.k, x = P.x, y = P.y, H = (P.h || 70) * k, W = (P.w || 34) * k;
      glow(g, x, y, W * 2.4, E.glow, 0.55, 0.3); glow(g, x, y - H * 0.5, H * 0.95, E.glow, 0.4, 1);
      for (let i = 0; i < 7; i++) { const f = i / 6 - 0.5, h = H * (1.05 + 0.25 * (1 - Math.abs(f) * 2)) * (0.85 + 0.15 * noise(t * 1.6, i * 1.9)); flameStack(g, x + f * W * 1.7, y, W * 0.5, h, noise(t * 1.2, i) * W * 0.25 + f * W * 0.5, E, 0.95); } },
    draw(g, P, t) { const E = P.E, k = P.k, x = P.x, y = P.y, H = (P.h || 70) * k, W = (P.w || 34) * k;
      for (let i = 0; i < 2; i++) { const f = i ? 0.42 : -0.42; flameStack(g, x + f * W * 1.5, y, W * 0.32, H * (0.45 + 0.1 * noise(t * 2, i * 4)), f * W * 0.6, E, 0.9); }
      // hoop: climbs the body, front half drawn here (over the avatar), fades at the top
      for (let j = 0; j < (P.calm ? 1 : 2); j++) { const q = ((t * 0.7 + j * 0.5) % 1), hy = y - q * H * 1.05, rx = W * (1.25 - q * 0.35), ry = rx * 0.28;
        g.save(); lite(g); g.lineCap = 'round'; ellipse(g, x, hy, rx, ry, rgba(E.ramp[3], 0.7 * (1 - q)), 6 * k, 0, Math.PI); ellipse(g, x, hy, rx, ry, rgba(E.ramp[1], 1 - q), 2 * k, 0.15, Math.PI - 0.15); g.restore(); }
      embers(g, x, y - H * 0.3, W * 2.6, H * 1.6, P.calm ? 6 : 16, t, E, P.seed, 1, 2 * k);
      const R = rng(P.seed + 7); for (let i = 0; i < 4; i++) { const ph = (t * 0.5 + R()) % 1, rx = x + (R() - 0.5) * W * 3, ry = y - ph * H * 0.9 + 6 * k; g.save(); g.translate(rx, ry); g.rotate(t * 2 + i); g.globalAlpha = Math.sin(ph * Math.PI); g.fillStyle = '#6B5560';
        g.beginPath(); g.moveTo(-3 * k, -2 * k); g.lineTo(2 * k, -3 * k); g.lineTo(4 * k, 1 * k); g.lineTo(-1 * k, 3 * k); g.closePath(); g.fill(); g.restore(); } }};
  // 🔥 BURNING — status: little flames on a body + smoke puffs (cartoon "hot pants", no harm shown)
  K.burning = {el: 'fire', life: 1, loop: true, draw(g, P, t) { const E = P.E, k = P.k, x = P.x, y = P.y, w = P.w * k, h = P.h * k;
    [[-0.34, 0.04], [0.3, 0.1], [-0.42, 0.48], [0.42, 0.44]].slice(0, P.calm ? 2 : 4)   /* hands + feet, never the head (F11) */.forEach(([fx, fy], i) => flameStack(g, x + fx * w, y - fy * h, 10 * k, (16 + 6 * noise(t, i)) * k, noise(t * 1.5, i * 2) * 3 * k, E, 0.95));
    smoke(g, x + w * 0.5, y - h * 0.7, 8 * k, (t % 0.8) / 0.8, E, P.seed + Math.floor(t / 0.8), 0.8); }};
  // 🌀 SPIRAL — tornado aura: rune ring on the ground + ribbons that wind up round the body + floating stones (ref magic aura)
  K.spiral = {el: 'water', life: 2, loop: true, draw(g, P, t) { const E = P.E, k = P.k, x = P.x, y = P.y, r = (P.r || 46) * k, H = (P.h || 100) * k, sy = 0.3;
    glow(g, x, y, r * 1.5, E.glow, 0.7, sy); g.save(); lite(g);
    ellipse(g, x, y, r, r * sy, rgba(E.ramp[2], 0.9), 2 * k); ellipse(g, x, y, r * 1.12, r * 1.12 * sy, rgba(E.ramp[3], 0.7), 1.2 * k);
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + t * 0.6; g.fillStyle = rgba(E.ramp[1], 0.8); g.fillRect(x + Math.cos(a) * r * 1.06 - k, y + Math.sin(a) * r * 1.06 * sy - k, 2 * k, 2 * k); }
    for (let rib = 0; rib < 3; rib++) { let prev = null; for (let s = 0; s <= 48; s++) { const u = s / 48, a = u * TAU * 1.6 + t * 3.2 + rib * TAU / 3, rad = r * (1 - u * 0.55), px = x + Math.cos(a) * rad, py = y - u * H + Math.sin(a) * rad * sy;
      if (prev) { const front = Math.sin(a) > 0; g.strokeStyle = rampAt(E.ramp, front ? 0.3 : 0.55); g.globalAlpha = (front ? 1 : 0.45) * Math.sin(u * Math.PI) ; g.lineWidth = (front ? 4 : 2.5) * k * (1 - u * 0.6); g.lineCap = 'round'; g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(px, py); g.stroke(); } prev = [px, py]; } }
    g.restore(); const R = rng(P.seed); for (let i = 0; i < (P.calm ? 4 : 9); i++) { const ph = (t * 0.35 + R()) % 1, a = R() * TAU + t * 1.5, d = r * (0.7 + R() * 0.6); g.save(); g.globalAlpha = Math.sin(ph * Math.PI); g.fillStyle = '#5F6B85';
      g.translate(x + Math.cos(a) * d, y - ph * H * 0.8 + Math.sin(a) * d * sy); g.rotate(t * 3 + i); g.fillRect(-2.5 * k, -2 * k, 5 * k, 4 * k); g.restore(); } }};
  // 🫧 BUBBLE — a wobbly shield orb with bright rim streaks running round it (ref 09302) — pairs with Motion.guard
  K.bubble = {el: 'water', life: 2, loop: true, draw(g, P, t) { const E = P.E, k = P.k, x = P.x, y = P.y, r = (P.r || 44) * k; const pop = clamp(t / 0.18, 0, 1), s = outBack(pop);
    const shape = (rr, ph) => { g.beginPath(); for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, w = 1 + 0.035 * Math.sin(a * 3 + t * 2.4 + ph) + 0.025 * Math.sin(a * 5 - t * 3.1); g.lineTo(x + Math.cos(a) * rr * w, y + Math.sin(a) * rr * w); } g.closePath(); };
    glow(g, x, y, r * 1.6 * s, E.glow, 0.35); g.save(); shape(r * s, 0); g.fillStyle = rgba(E.ramp[5], 0.18); g.fill(); lite(g); g.strokeStyle = rgba(E.ramp[3], 0.8); g.lineWidth = 3 * k; g.stroke();
    g.lineCap = 'round'; for (let i = 0; i < 6; i++) { const a0 = i * 1.13 + t * (0.8 + i * 0.13) * (i % 2 ? 1 : -1), len = 0.5 + 0.4 * Math.sin(t * 1.7 + i); g.beginPath(); g.ellipse(x, y, r * s * (0.97 - i * 0.012), r * s * (0.97 - i * 0.012), 0, a0, a0 + len);
      g.strokeStyle = rgba(E.ramp[i % 2 ? 1 : 0], 0.85); g.lineWidth = (i % 2 ? 1.2 : 2.2) * k; g.stroke(); }
    g.beginPath(); g.ellipse(x - r * 0.38 * s, y - r * 0.42 * s, r * 0.22 * s, r * 0.1 * s, -0.7, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fill(); g.restore(); }};
  // 💠 GROUND burst — a cel-shaded spirit flame bursting from the ground + ripple rings (ref lexan) — recolours to any element
  K.ground = {el: 'spirit', life: 1.4, contact: 0.08, draw(g, P, t) { const E = P.E, k = P.k, x = P.x, y = P.y, q = t / this.life, R = rng(P.seed), up = outBack(q / 0.15) * (1 - inQ((q - 0.7) / 0.3));
    glow(g, x, y, 70 * k * up, E.glow, 0.7, 0.35);
    g.save(); lite(g); for (let i = 0; i < 2; i++) { const rq = clamp((q - i * 0.18) / 0.6, 0, 1); if (rq > 0 && rq < 1) ellipse(g, x, y + 2 * k, (30 + rq * 50) * k, (9 + rq * 15) * k, rgba(E.ramp[3], 0.8 * (1 - rq)), 3 * k * (1 - rq) + 0.5); } g.restore();
    for (let i = 0; i < 9; i++) { const f = i / 8 - 0.5, h = (26 + R() * 22) * (1 - Math.abs(f) * 0.9) * k * up * (0.85 + 0.15 * noise(t * 1.5, i)); flameStack(g, x + f * 64 * k, y, 16 * k, h, f * 10 * k + noise(t, i) * 3 * k, E, 1); }
    // wisps: long thin curls that rise and curl over
    for (let i = 0; i < (P.calm ? 1 : 3); i++) { const wq = clamp((q - 0.05 - i * 0.12) / 0.6, 0, 1); if (wq <= 0 || wq >= 1) continue; g.save(); lite(g); g.strokeStyle = rgba(E.ramp[2], 1 - wq); g.lineCap = 'round'; g.lineWidth = (5 - i) * k * (1 - wq * 0.5);
      g.beginPath(); const hh = 90 * k * outQ(wq), bx = x + (i - 1) * 14 * k; g.moveTo(bx, y - 8 * k); g.bezierCurveTo(bx - 8 * k, y - hh * 0.5, bx + 30 * k * (i % 2 ? -1 : 1), y - hh, bx + 44 * k * (i % 2 ? -1 : 1), y - hh * 0.75); g.stroke(); g.restore(); } }};
  // 🌟 PILLAR — the ULTIMATE (ref anime cast, kid-safe): halo above the caster → light pillars rise round them → soft area flash → a beam slams onto the target → crater ring + debris
  K.pillar = {el: 'shadow', life: 2.2, contact: 1.2, flashAt: 1.2, shake: [1.2, 6, 400], draw(g, P, t) { const E = P.E, k = P.k, [cx, cy] = [P.x, P.y], [tx, ty] = P.to, c = this.contact;
    if (t < c) { const q = t / c; ellipse(g, cx, cy - 96 * k, 34 * k * outBack(q / 0.3), 8 * k * outBack(q / 0.3), rgba(E.ramp[1], 0.95), 2.4 * k); glow(g, cx, cy - 96 * k, 40 * k, E.glow, 0.6 * q, 0.4);
      const R = rng(P.seed); for (let i = 0; i < 7; i++) { const px = cx + (R() - 0.5) * 220 * k, h = (120 + R() * 140) * k * outQ((q - R() * 0.4) / 0.4); if (h <= 0) continue;
        g.save(); lite(g); const gr = g.createLinearGradient(0, cy, 0, cy - h); gr.addColorStop(0, rgba(E.ramp[2], 0.9)); gr.addColorStop(1, rgba(E.ramp[4], 0)); g.fillStyle = gr; g.fillRect(px - 2 * k, cy - h, 4 * k, h); g.restore(); }
      glow(g, cx, cy, 90 * k * q, E.glow, 0.5 * q, 0.35); return; }
    const e = t - c; if (e < 0.06 && P._flash) areaFlash(g, P, 0.55, E.ramp[1]);
    const q = clamp(e / (this.life - c), 0, 1), bw = 38 * k * outBack(q / 0.12) * (1 - inQ((q - 0.6) / 0.4)), top = P.top != null ? P.top : ty - 420 * k;
    if (bw > 0) { g.save(); lite(g); const gr = g.createLinearGradient(tx - bw, 0, tx + bw, 0); gr.addColorStop(0, rgba(E.ramp[4], 0)); gr.addColorStop(0.3, rgba(E.ramp[3], 0.85)); gr.addColorStop(0.5, rgba(E.ramp[0], 1)); gr.addColorStop(0.7, rgba(E.ramp[3], 0.85)); gr.addColorStop(1, rgba(E.ramp[4], 0));
      g.fillStyle = gr; g.fillRect(tx - bw, top, bw * 2, ty - top); g.restore(); }
    g.save(); lite(g); for (let i = 0; i < 3; i++) { const rq = clamp((q - i * 0.1) / 0.6, 0, 1); if (rq < 1) ellipse(g, tx, ty, (30 + rq * 110) * k, (8 + rq * 30) * k, rgba(E.ramp[2 + i], 0.9 * (1 - rq)), 4 * k * (1 - rq) + 0.5); } g.restore();
    const R = rng(P.seed + 9); for (let i = 0; i < (P.calm ? 5 : 10); i++) { const a = -Math.PI * (0.15 + R() * 0.7), v = (90 + R() * 120) * k, s = e, px = tx + Math.cos(a) * v * s, py = ty + Math.sin(a) * v * s + 260 * k * s * s; if (py > ty + 4) continue;
      g.save(); g.translate(px, py); g.rotate(s * 8 + i); g.fillStyle = '#3B2F55'; g.globalAlpha = 1 - q; g.fillRect(-3 * k, -2.5 * k, 6 * k, 5 * k); g.restore(); }
    glow(g, tx, ty, 90 * k * (1 - q * 0.6), E.glow, 0.8 * (1 - q), 0.4); }};
  // ==================== shape glyphs (FX Bible §2.3 shape language) ====================
  const SH = {
    drop(g, x, y, s, R, a) { g.save(); g.translate(x, y); g.rotate(a || 0); g.beginPath(); g.moveTo(0, -s); g.bezierCurveTo(s * 0.6, -s * 0.2, s * 0.6, s * 0.7, 0, s * 0.7); g.bezierCurveTo(-s * 0.6, s * 0.7, -s * 0.6, -s * 0.2, 0, -s); g.fillStyle = R[3]; g.fill(); g.beginPath(); g.arc(-s * 0.15, s * 0.25, s * 0.16, 0, TAU); g.fillStyle = R[0]; g.fill(); g.restore(); },
    shard(g, x, y, s, R, a) { g.save(); g.translate(x, y); g.rotate(a || 0); g.beginPath(); g.moveTo(0, -s); g.lineTo(s * 0.28, 0); g.lineTo(0, s * 0.45); g.closePath(); g.fillStyle = R[2]; g.fill(); g.beginPath(); g.moveTo(0, -s); g.lineTo(-s * 0.28, 0); g.lineTo(0, s * 0.45); g.closePath(); g.fillStyle = R[4]; g.fill(); g.restore(); },
    leaf(g, x, y, s, R, a) { g.save(); g.translate(x, y); g.rotate(a || 0); g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * 0.7, 0, 0, s); g.quadraticCurveTo(-s * 0.7, 0, 0, -s); g.fillStyle = R[3]; g.fill(); g.beginPath(); g.moveTo(0, -s * 0.8); g.lineTo(0, s * 0.85); g.strokeStyle = R[5]; g.lineWidth = Math.max(0.6, s * 0.12); g.stroke(); g.restore(); },
    star4(g, x, y, s, R, a) { g.save(); g.translate(x, y); g.rotate(a || 0); g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? s * 0.22 : s, an = i * Math.PI / 4; g.lineTo(Math.cos(an) * r, Math.sin(an) * r); } g.closePath(); g.fillStyle = R[1]; g.fill(); g.restore(); },
    star5(g, x, y, s, R, a) { g.save(); g.translate(x, y); g.rotate(a || 0); g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? s * 0.45 : s, an = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(Math.cos(an) * r, Math.sin(an) * r); } g.closePath(); g.fillStyle = R[3]; g.fill(); g.restore(); },
    heart(g, x, y, s, R, a) { g.save(); g.translate(x, y); g.rotate(a || 0); g.beginPath(); g.moveTo(0, s * 0.8); g.bezierCurveTo(-s * 1.2, -s * 0.1, -s * 0.5, -s * 1.0, 0, -s * 0.35); g.bezierCurveTo(s * 0.5, -s * 1.0, s * 1.2, -s * 0.1, 0, s * 0.8); g.fillStyle = R[4]; g.fill(); g.restore(); },
    wisp(g, x, y, s, R) { g.save(); g.lineCap = 'round'; g.strokeStyle = R[3]; g.lineWidth = s * 0.16; g.beginPath(); g.moveTo(x, y + s); g.bezierCurveTo(x - s * 0.9, y + s * 0.3, x + s * 0.9, y - s * 0.2, x - s * 0.2, y - s); g.stroke(); g.strokeStyle = R[1]; g.lineWidth = s * 0.05; g.stroke(); g.restore(); }
  };
  // one little "bit" of an element at (x, y), size s, age q 0..1, seed i — the shape language in one call (trails · hit bits · charge bits)
  const BITX = {}, TRAILX = {}, POPX = {};   // 🪨🌪️ mo-8: element add-ons (MotionEl.js) — bits · swing trails · hit pops
  function bit(g, el, x, y, s, q, i, t) {
    if (BITX[el]) return BITX[el](g, x, y, s, q, i, t);
    const E = E_(el), R = E.ramp, a = 1 - q; if (a <= 0 || s <= 0.2) return; g.save(); g.globalAlpha *= a;
    if (el === 'fire' || el === 'spirit') flameStack(g, x, y + s * 0.6, s * 0.9, s * (2.2 - q), noise(t || 0, i) * s * 0.3, E, 1, q > 0.6 ? 1 : 0);
    else if (el === 'zap') { const Rn = rng(i * 97 + Math.floor((t || 0) / 0.06)); jag(x - s, y, x + s, y + (Rn() - 0.5) * s, 0.6, 3, Rn, []).forEach(l => strokeBolt(g, l, Math.max(0.8, s * 0.22), E, 1)); }
    else if (el === 'water') SH.drop(g, x, y, s * 0.8, R, i);
    else if (el === 'ice') SH.shard(g, x, y, s * 1.2, R, i * 1.7);
    else if (el === 'nature') SH.leaf(g, x, y, s * 0.9, R, i * 1.3 + (t || 0) * 3);
    else if (el === 'shadow') SH.wisp(g, x, y, s * 1.2, R);
    else if (el === 'candy') (i % 2 ? SH.heart : SH.star5)(g, x, y, s * 0.8, R, i);
    else SH.star4(g, x, y, s, R, i + (t || 0) * 2);   // light + anything else
    g.restore();
  }
  // 🌍 area flash (bolt / pillar): the box, or the whole canvas when no box is given
  function areaFlash(g, P, a, col) { g.save(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = Math.min(0.55, a); g.fillStyle = col;
    if (P.box) g.fillRect(P.box[0], P.box[1], P.box[2], P.box[3]); else { g.setTransform(1, 0, 0, 1, 0, 0); g.fillRect(0, 0, g.canvas.width, g.canvas.height); } g.restore(); }

  // ==================== the API ====================
  let SEED = 11; const now = () => performance.now() / 1000;
  const FLASHES = [];   // absolute times (s) of granted area flashes — ≤ 3 in any 1 s window (F12)
  function claimFlash(T) { for (let i = FLASHES.length - 1; i >= 0; i--) if (FLASHES[i] < T - 2 || FLASHES[i] > T + 2) FLASHES.splice(i, 1);
    if (FLASHES.filter(x => Math.abs(x - T) < 1).length >= 3) return false; FLASHES.push(T); return true; }
  const STOP_MS = 200;
  function fx(kind, o) {
    const D = K[kind]; if (!D) { const m = '⚡ Motion.fx: unknown effect "' + kind + '"'; if (window.Acting && Acting.ERRORS && Acting.ERRORS.indexOf(m) < 0) Acting.ERRORS.push(m); return null; }
    o = Object.assign({}, o || {}); const t0 = o.t0 != null ? o.t0 : now(), el = o.element && EL[o.element] ? o.element : D.el;
    const P = Object.assign({k: 1, dir: 1, seed: (SEED = (SEED * 48271) % 2147483647)}, o, {kind, D, E: E_(el), el});
    P._flash = !!(D.flashAt != null && !o.calm && o.flash !== false && claimFlash(t0 + D.flashAt));
    const E = {kind, P, t0, el, life: D.life, contact: D.contact != null ? D.contact : null, loop: !!D.loop, stopT: null, fired: false, onContact: o.onContact || null,
      flash: P._flash ? 1 : 0};
    if (o.ms != null) E.stopT = t0 + o.ms / 1000;   // a timed loop (status): stops by itself
    E.stop = t => { if (E.stopT == null || (t != null && t < E.stopT)) E.stopT = t != null ? t : now(); return E; };
    E.move = (x, y) => { P.x = x; P.y = y; return E; };
    E.aim = (x, y) => { if (P.to) P.to = [x, y]; else if (P.pts && P.pts.length) P.pts[P.pts.length - 1] = [x, y]; return E; };
    E.end = () => E.loop ? (E.stopT != null ? E.stopT + STOP_MS / 1000 : Infinity) : t0 + D.life;
    E.at = t => { const e = t - t0, done = t >= E.end(), sh = D.shake;
      let shake = {x: 0, y: 0}, amp = 0;
      if (sh && !o.calm && e >= sh[0] && e < sh[0] + sh[2] / 1000) { amp = sh[1] * (1 - (e - sh[0]) / (sh[2] / 1000)); shake = {x: Math.sin(e * 91) * amp, y: Math.cos(e * 77) * amp * 0.6}; }
      const fl = P._flash && e >= D.flashAt && e < D.flashAt + 0.06;
      return {e, on: e >= 0 && !done, contact: E.contact != null && e >= E.contact, flash: fl, shake, amp, done}; };
    return E;
  }
  function fireContact(E, t) { if (!E.fired && E.contact != null && t - E.t0 >= E.contact) { E.fired = true; if (E.onContact) E.onContact(E); } }
  function alphaOf(E, t) { return E.stopT != null && t > E.stopT ? Math.max(0, 1 - (t - E.stopT) * 1000 / STOP_MS) : 1; }
  function eOf(E, t) { const e = t - E.t0, st = E.P.step; return st ? Math.floor(e * 1000 / st) * st / 1000 : e; }   // F9: one-shots may step at 30 fps (step: 33)
  function drawFx(g, E, t) {
    if (!E) return; t = t != null ? t : now(); fireContact(E, t); const e = eOf(E, t); if (e < 0 || t >= E.end()) return;
    const a = alphaOf(E, t); if (a <= 0) return; DAY = !!E.P.day; g.save(); g.globalAlpha *= a; try { statusClip(g, E.P); E.P.D.draw(g, E.P, e); } finally { g.restore(); DAY = false; }
  }
  function drawFxBack(g, E, t) {
    if (!E || !E.P.D.back) return; t = t != null ? t : now(); const e = eOf(E, t); if (e < 0 || t >= E.end()) return;
    const a = alphaOf(E, t); if (a <= 0) return; DAY = !!E.P.day; g.save(); g.globalAlpha *= a; try { statusClip(g, E.P); E.P.D.back(g, E.P, e); } finally { g.restore(); DAY = false; }
  }
  // 🔥⚡ status loops on a body: Motion.status('burn' | 'zap', {x, y (feet), w: 30, h: 60, k, ms, t0, calm}) → an effect that stops by itself after ms
  const STATUS = {burn: 'burning', zap: 'zapped', fire: 'burning', toasty: 'burning'};   // + soaked · rooted · dizzy · pushed · dazzled · hushed (MotionEl.js, mo-8)
  const STATUS_MS = {burning: 600, zapped: 500};
  function status(kind, o) { o = Object.assign({w: 30, h: 60}, o || {}); const k2 = STATUS[kind] || kind; if (o.ms == null) o.ms = STATUS_MS[k2] || 600; if (o.face === undefined) o.face = true; return fx(k2, o); }
  // F11 (mo-8): a status sits on a body — keep its face clear. face: true = an avatar (head 60 units over the feet, r 21) · [x, y, r] = your own · false = none
  function statusClip(g, P) { const f = P.face; if (!f) return; const c = f === true ? [P.x, P.y - 60 * P.k, 21 * P.k] : f;
    g.beginPath(); g.rect(-1e5, -1e5, 2e5, 2e5); g.arc(c[0], c[1], c[2], 0, TAU, true); g.clip('evenodd'); }

  // ⚡🔥 trails along a smear (tips = the smear's tip points in px, newest last) — Acting.draw's smear hook calls it when the act was played with {fx: true, element}
  function trailFx(g, tips, el, alpha, k, ms) {
    if (!tips || tips.length < 2) return; const n = Math.min(6, tips.length - 1), t = (ms || 0) / 1000;
    if (TRAILX[el]) { g.save(); g.globalAlpha *= alpha; try { TRAILX[el](g, tips, k, t); } finally { g.restore(); } return; }
    g.save(); g.globalAlpha *= alpha;
    if (el === 'zap') { const Rn = rng(7 + Math.floor(t / 0.06)); for (let i = 1; i < tips.length; i += 2) { const [ax, ay] = tips[i - 1], [bx, by] = tips[Math.min(tips.length - 1, i + 1)]; jag(ax, ay, bx, by, 0.6, 3, Rn, []).forEach(l => strokeBolt(g, l, 1.3 * k, EL.zap, 0.9)); } }
    else for (let j = 0; j < n; j++) { const i = Math.round((j + 1) / (n + 1) * (tips.length - 1)), p = tips[i], q = 1 - i / (tips.length - 1); bit(g, el, p[0], p[1] - q * 6 * k, (3.2 + 1.6 * (1 - q)) * k, q * 0.7, j + 3, t); }
    g.restore();
  }
  // ⚡🔥 charge bits round the glow (Motion.charge with {fx: true, element})
  function chargeBits(g, x, y, r, k, c) {
    const t = c.ms / 1000, n = c.calm ? 2 : 3 + c.tier; g.save(); faceClip(g);   // F11 (drawn by Acting.draw's front hook, right after the body)
    if (c.element === 'zap') { const Rn = rng(5 + Math.floor(t / (c.calm ? 0.12 : 0.06))); for (let i = 0; i < n; i++) { const a = Rn() * TAU, d = r * (1.2 + Rn() * 0.9); jag(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, x + Math.cos(a) * d, y + Math.sin(a) * d, 0.6, 3, Rn, []).forEach(l => strokeBolt(g, l, 1.2 * k, EL.zap, 0.9)); } }
    else for (let i = 0; i < n; i++) { const a = i / n * TAU + t * 2.2, d = r * 1.25; if (c.element === 'fire' || c.element === 'spirit') { const E2 = E_(c.element); flameStack(g, x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.5 + r * 0.4, r * 0.45, r * (0.8 + 0.25 * noise(t, i)), noise(t * 1.5, i) * r * 0.2, E2, 0.9); }
      else bit(g, c.element, x + Math.cos(a) * d, y + Math.sin(a) * d, 3 * k * (0.8 + c.lv * 0.6), 0, i, t); }
    g.restore();
  }
  // ⚡🔥 element bits on a hit burst (Motion.hit with {fx: true, element}): 50 → 320 ms, thrown out from the burst, then cool away
  function hitBits(g, H, t, x, y, k, dir) {
    const el = H.fxEl; if (el && POPX[el]) POPX[el](g, H, t, x, y, k, dir);   /* 💥 mo-8 hit pops */
    if (!el || t < 50 || t > 380) return; const q = (t - 50) / 330, n = H.o.calm ? 3 : 6, Rr = H.size * k, ts = t / 1000;
    g.save(); g.translate(x, y);
    if (el === 'zap') { const Rn = rng(31 + Math.floor(t / 60)); for (let i = 0; i < (H.o.calm ? 2 : 4); i++) { const a = Rn() * TAU, d = Rr * (1.4 + outQ(q) * 1.4); jag(Math.cos(a) * Rr * 0.5, Math.sin(a) * Rr * 0.5, Math.cos(a) * d, Math.sin(a) * d, 0.55, 3, Rn, [], 0.2).forEach(l => strokeBolt(g, l, 1.4 * k, EL.zap, 1 - q)); } }
    else for (let i = 0; i < n; i++) { const a = i / n * TAU + 0.4, d = Rr * (0.9 + outQ(q) * 1.6), up = el === 'water' ? -Math.sin(q * Math.PI) * Rr * 0.6 + q * q * Rr : 0;
      if (el === 'fire' || el === 'spirit') { g.save(); g.translate(Math.cos(a) * d, Math.sin(a) * d * 0.85); g.rotate(a + Math.PI / 2); flameStack(g, 0, 0, Rr * 0.38 * (1 - q * 0.5), Rr * 0.9 * outBack(q / 0.3) * (1 - q * 0.6), 0, E_(el), 1 - q, q > 0.5 ? 1 : 0); g.restore(); }
      else bit(g, el, Math.cos(a) * d, Math.sin(a) * d * 0.85 + up, Rr * 0.32, q, i, ts); }
    g.restore();
  }
  function faceClip(g) { const Hd = window.AK && AK.head; if (!Hd || !Hd.m || !g.getTransform) return; const m = g.getTransform().inverse().multiply(Hd.m), c = m.transformPoint({x: 0, y: Hd.hy}), r = 21 * Hd.k * Math.hypot(m.a, m.b);
    g.beginPath(); g.rect(-1e5, -1e5, 2e5, 2e5); g.arc(c.x, c.y, r, 0, TAU, true); g.clip('evenodd'); }   // F11: nothing on a face (the body was just painted)
  const M = window.Motion, _hit = M.hit, _drawHit = M.drawHit, _drawHitFx = M.drawHitFx;
  const STATUS_OF = {fire: 'burning', zap: 'zapped'}, STATUS_AUTO = {fire: 1, zap: 1};   // + water soaked · nature rooted · stone dizzy · wind pushed · light dazzled · shadow hushed (mo-8, only with status: true)
  M.hit = function (a, b) { const H = _hit(a, b), o = H.o; if (o.fx && o.element) { H.fxEl = o.element; const sk = STATUS_OF[o.element]; if (sk && o.status !== false && (STATUS_AUTO[o.element] || o.status === true)) H.status = {kind: sk, from: 100, ms: STATUS_MS[sk] || 600}; } return H; };
  M.drawHitFx = function (g, H, t, x, y, k, dir) { _drawHitFx(g, H, t, x, y, k, dir); if (H && H.fxEl) hitBits(g, H, t, x, y, k, dir); };
  M.drawHit = function (g, H, t, paint, o) {
    const a = _drawHit(g, H, t, paint, o); o = o || {};
    if (!H.fxEl || !(o.at || o.x != null)) return a;
    g.save(); faceClip(g);
    if (H.fxEl) { const k = o.k || 1, hgt = (o.h || 80) * k, x = o.at ? o.at[0] : o.x + 2 * k * (o.dir || 1), y = o.at ? o.at[1] : o.y - (o.h ? hgt * 0.5 : 40 * k); hitBits(g, H, t, x, y, k, -(o.dir || 1)); }
    const S = H.status; if (S && o.x != null && t >= S.from && t < S.from + S.ms + STOP_MS) {
      const P = Object.assign({k: o.k || 1, x: o.x, y: o.y, w: 30, h: (o.h || 80) * 0.75, seed: 3, calm: H.o.calm}, {kind: S.kind, D: K[S.kind], E: E_(H.fxEl), el: H.fxEl});
      const e = (t - S.from) / 1000, fade = t > S.from + S.ms ? 1 - (t - S.from - S.ms) / STOP_MS : 1; g.save(); g.globalAlpha *= Math.max(0, fade); K[S.kind].draw(g, P, e); g.restore(); }
    g.restore(); return a; };
  const FXLIST = {}; Object.keys(K).forEach(k2 => { const D = K[k2]; FXLIST[k2] = {el: D.el, life: D.life, contact: D.contact != null ? D.contact : null, loop: !!D.loop, back: !!D.back, flash: D.flashAt != null, shake: D.shake ? D.shake[1] : 0}; });
  // 🧩 mo-8: add-on files (MotionEl.js now, a later MotionTop add-on) register effects / statuses / element parts here — the effect table stays private
  function fxAdd(kind, D, o) { K[kind] = D; FXLIST[kind] = {el: D.el, life: D.life, contact: D.contact != null ? D.contact : null, loop: !!D.loop, back: !!D.back, flash: D.flashAt != null, shake: D.shake ? D.shake[1] : 0};
    o = o || {}; if (o.status) { (Array.isArray(o.status) ? o.status : [o.status]).forEach(n => { STATUS[n] = kind; }); STATUS[kind] = kind; if (o.ms) STATUS_MS[kind] = o.ms; }
    if (o.hitOf) { STATUS_OF[o.hitOf] = kind; } return FXLIST[kind]; }
  function elAdd(el, def, parts) { EL[el] = def; parts = parts || {}; if (parts.bit) BITX[el] = parts.bit; if (parts.trail) TRAILX[el] = parts.trail; if (parts.pop) POPX[el] = parts.pop; }
  function popAdd(el, fn) { POPX[el] = fn; }
  Object.assign(M, {VERSION: 'mo-8', fx, drawFx, drawFxBack, status, trailFx, chargeBits, hitBits, FX: FXLIST, FX_EL: EL, LIMBS: ['handR', 'handL', 'footR', 'footL', 'head'],
    fxAdd, elAdd, popAdd, STATUS_KINDS: STATUS,
    fxTools: {glow, jag, strokeBolt, tongue, flameStack, embers, smoke, ellipse, rampAt, bit, SH, rng, noise, outBack, outQ, inQ, rgba, faceClip, day: v => { DAY = !!v; }}, _flashes: FLASHES});
})();
/* ================= 🦴 MotionRig (mo-7b, 🎬 Motion chat, 2026-11-19) — the rig upgrade for every avatar =================
   Method + laws: 🎬 `Motion Bible.md` §2.4–2.6 (joint map · range of motion · body language) + §5.4 (R1–R6). API: `Motion rules.md` §25.
   Built INTO AvatarMotion.html after MotionFX (build_motion.py). AvatarKit has 3 inert hook lines (patch_mo7b_kit.py); without this file — or
   with every new field at 0 / 'mitt' — every avatar draws exactly as before (motion.test part 1 pixel proof).

   NEW POSE FIELDS (all optional, default 0 / 'mitt' = today) — side view facing right (dir 1), R = the near / front side
     neckTilt  −0.45 … 0.45   the head rolls round the neck (+ = toward the facing side)
     neckTurn  −0.7 … 0.7     the face slides to ¾ (+ = looks the way it faces, − = looks back over the shoulder); hair behind slides the other way
     nod       −0.3 … 0.4     + = chin down (looks down), − = chin up
     twist     −0.4 … 0.4     the chest turns against the hips: + = into the move (shoulders narrow, the back arm hides more), − = opens to the viewer
     shrugL / shrugR  0 … 1   the shoulder lifts ≈ 3 units, the neck gets shorter
     handL / handR            'mitt' (today) · 'fist' · 'open' · 'point' · 'grip' · 'thumb' · 'peace' — drawn in skin at the wrist, turned by the forearm + wristR / wristL
                              (gloves stay round gloves; clasped hands — platform — stay clasped)
   CALLS
     Motion.LIMITS                       {avatar: {field: [lo, hi]}, creature: {field: [lo, hi]}, family: {slime: [fields] …}, HANDS}
     Motion.poseCheck(P, who)            → {ok, bad: [{law, f, v, why}], look: […]} — who = 'avatar' (default) | {family: 'beast'} | 'creature'
                                           bad = can't happen (R1 out of range · R2 knee forward · leg through the body · foot under the floor · head in the torso · unknown hand)
                                           look = report only (R2 elbow folded the "other" way — a turned arm hides it in 2D · R3 both feet off the floor · R4 hand over the face)
     Motion.rigOf(P)                     → {bo, fo, cs, …} the shoulder offsets (avatar units) or null — Motion.shoulderOff(P, 'R' | 'L') → [dx, dy]
     Motion.rigPoints(P)                 → {head: [x, y], footL, footR, handR, handL} body points (avatar units, feet 0, 0) — the same maths as the drawing
     Motion.drawHand(g, shape, x, y, ang, u, skin, rim)   one hand picture (cards, sheets)
   AvatarKit hook calls (patch_mo7b_kit.py): Motion.rig (start) · neckIn / neckOut (inside the head's hsIn / hsOut) · rigBody (after the back arm) · rigHand (after the front arm)
   ========================================================================================= */
(function(){
const M = window.Motion; if (!M) return;
const NUM = ['neckTilt', 'neckTurn', 'nod', 'twist', 'shrugL', 'shrugR'];
const HANDS = ['mitt', 'fist', 'open', 'point', 'grip', 'thumb', 'peace'];
const cl = (v, a, b) => v < a ? a : v > b ? b : v;
const hasRig = P => !!(P && (P.neckTilt || P.neckTurn || P.nod || P.twist || P.shrugL || P.shrugR || (P.handL && P.handL !== 'mitt') || (P.handR && P.handR !== 'mitt')));

// ---------- the numbers (one place: the drawing, rigPoints and poseCheck all read them) ----------
function rigOf(P){
  if (!hasRig(P)) return null;
  const tw = cl(+P.twist || 0, -0.4, 0.4), sL = cl(+P.shrugL || 0, 0, 1), sR = cl(+P.shrugR || 0, 0, 1);
  const w = tw > 0 ? 1 - 0.55 * tw : 1 - 0.25 * tw, cs = tw > 0 ? 1 - 0.5 * tw : 1 - 0.12 * tw;   // shoulder half-width factor · chest width
  const R = {tw, sL, sR, w, cs, bo: [-10 * w + 10, -3 * sL], fo: [10 * w - 10, -3 * sR],
    tilt: cl(+P.neckTilt || 0, -0.45, 0.45), turn: cl(+P.neckTurn || 0, -0.7, 0.7), nod: cl(+P.nod || 0, -0.3, 0.4), drop: 0.8 * (sL + sR),
    hL: HANDS.indexOf(P.handL) > 0 ? P.handL : null, hR: HANDS.indexOf(P.handR) > 0 ? P.handR : null};
  R.neck = !!(R.tilt || R.turn || R.nod || R.drop);
  return R;
}
// the head transform round the neck (0, −48) — layer 0 = back hair (slides the other way when turning), 1 = the head
function headXf(R, layer){
  const tx = (layer ? 4.5 : -2) * R.turn + 1.2 * R.nod, ty = 2.6 * R.nod + R.drop, rot = R.tilt + 0.35 * R.nod, sx = 1 - 0.14 * Math.abs(R.turn), sy = 1 - 0.08 * Math.abs(R.nod);
  return {tx, ty, rot, sx, sy};
}
function headPoint(R, x, y, layer){   // a head point (avatar units) through the neck transform
  const X = headXf(R, layer), dx = x * X.sx, dy = (y + 48) * X.sy, c = Math.cos(X.rot), s = Math.sin(X.rot);
  return [dx * c - dy * s + X.tx, dx * s + dy * c - 48 + X.ty];
}

// ---------- AvatarKit hooks ----------
let CUR = null;
function rig(g, P, k, L, C){
  const R = rigOf(P); if (!R) return null;
  R.k = k; R.P = P; R.n = 0; R.skin = C && C.skin; R.gloves = !!(L && L.gloves); R.tiny = !!(L && L.tinyArms);
  if (R.gloves || P.platform) R.hL = null; if (R.gloves || P.platform > 0.5) R.hR = null;   // gloves stay round gloves · clasped hands stay clasped
  if (R.bo[0] || R.bo[1]) g.translate(R.bo[0] * k, R.bo[1] * k);   // the back shoulder: the back arm is drawn next
  CUR = R; return R;
}
function neckIn(g, R){
  const k = R.k, i = R.n++; g.save();
  if (i === 0 && (R.bo[0] || R.bo[1])) g.translate(-R.bo[0] * k, -R.bo[1] * k);   // back hair: undo the back-shoulder offset
  if (i === 1 && R.cs !== 1) {   // the head: undo the chest width — but first a soft shade on the side of the chest that turns away
    if (R.tw) chestShade(g, R);
    g.scale(1 / R.cs, 1);
  }
  if (R.neck) { const X = headXf(R, i ? 1 : 0); g.translate(X.tx * k, (-48 + X.ty) * k); g.rotate(X.rot); g.scale(X.sx, X.sy); g.translate(0, 48 * k); }
}
function neckOut(g, R){
  g.restore();
  if (R.n === 2) { const k = R.k; if (R.cs !== 1) g.scale(1 / R.cs, 1); if (R.fo[0] || R.fo[1]) g.translate(R.fo[0] * k, R.fo[1] * k); R.front = true; }   // → the front shoulder
}
function chestShade(g, R){
  const k = R.k, a = Math.min(0.24, Math.abs(R.tw) * 0.55); g.save();
  const gr = g.createLinearGradient(-11 * k, 0, 11 * k, 0);
  if (R.tw > 0) { gr.addColorStop(0, 'rgba(0,0,0,' + a.toFixed(3) + ')'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(255,255,255,' + (a * 0.35).toFixed(3) + ')'); }
  else { gr.addColorStop(0, 'rgba(255,255,255,' + (a * 0.4).toFixed(3) + ')'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,' + (a * 0.6).toFixed(3) + ')'); }
  g.fillStyle = gr; g.beginPath(); g.rect(-11 * k, -46 * k, 22 * k, 26 * k); g.fill(); g.restore();
}
function backHandAt(P, k, len){
  const a = P.armL || 0, e = P.elbowL || 0;
  if (!e) return {p: AKJ.end(-10 * k, -42 * k, a, len), a};
  const j = AKJ.end(-10 * k, -42 * k, a, len / 2); return {p: AKJ.end(j[0], j[1], a + e, len / 2), a: a + e};
}
function rigBody(g, R){
  const k = R.k, P = R.P;
  if (R.hL) { const len = R.tiny ? 9 * k : 16 * k, H = backHandAt(P, k, len), s = R.skin || '#F2C9A0'; drawHand(g, R.hL, H.p[0], H.p[1], H.a - (P.wristL || 0), k, shadeHex(s, 0.86), shadeHex(s, 0.6)); }
  if (R.bo[0] || R.bo[1]) g.translate(-R.bo[0] * k, -R.bo[1] * k);
  if (R.cs !== 1) g.scale(R.cs, 1);
}
function rigHand(g, R, hand, foreR){
  const k = R.k, P = R.P;
  if (!R.front) { if (R.cs !== 1) g.scale(1 / R.cs, 1); if (R.fo[0] || R.fo[1]) g.translate(R.fo[0] * k, R.fo[1] * k); }   // (no head drawn?) still reach the front shoulder
  if (R.hR) { const s = R.skin || '#F2C9A0'; drawHand(g, R.hR, hand[0], hand[1], -(foreR || 0) - (P.wristR || 0), k, s, shadeHex(s, 0.62)); }
  if (R.fo[0] || R.fo[1]) { g.translate(-R.fo[0] * k, -R.fo[1] * k); hand[0] += R.fo[0] * k; hand[1] += R.fo[1] * k; }   // back to the body frame; the held thing follows the hand
  CUR = null;
}
// 🧣 mo-3 hanging parts painted over the body sit on the HEAD / body, not on the shifted front shoulder
const akPaint0 = M.akPaint;
if (akPaint0) M.akPaint = function(g, M3, layer){
  const R = CUR; if (!R || layer !== 'front' || !R.front || !(R.fo[0] || R.fo[1])) return akPaint0.apply(this, arguments);
  g.save(); g.translate(-R.fo[0] * R.k, -R.fo[1] * R.k); try { return akPaint0.apply(this, arguments); } finally { g.restore(); }
};

// ---------- ✋ hand shapes (local frame: origin = the end of the forearm, +y = out along the forearm, +x = the thumb side) ----------
// ✋ mo-8 hand floor: a fist is 6.6 units wide; on small avatars (an upright phone ≈ 56 px tall) that is ≈ 5 px and every shape looks the same.
// Grow ONLY the hand (×1.7 max) until it is M.HAND_MIN (9) CSS px wide. CSS px = device px × (canvas CSS width ÷ canvas width) for a canvas on the page,
// ÷ devicePixelRatio for an off-screen bake. M.HAND_MIN = 0 turns it off. Mitt hands never come here (today's picture).
function handFloor(g, u){
  const min = M.HAND_MIN; if (!min || !g.getTransform) return 1;
  const m = g.getTransform(), cv = g.canvas, css = cv && cv.clientWidth ? cv.clientWidth / cv.width : 1 / (window.devicePixelRatio || 1);
  const px = 6.6 * u * Math.hypot(m.a, m.b) * css; return px > 0 && px < min ? Math.min(1.7, min / px) : 1;
}
function shadeHex(h, f){
  if (typeof h !== 'string' || h[0] !== '#') return h; let s = h.slice(1); if (s.length === 3) s = s.split('').map(c => c + c).join('');
  const n = parseInt(s.slice(0, 6), 16), r = Math.round(((n >> 16) & 255) * f), gg = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
  return '#' + ((1 << 24) | (cl(r, 0, 255) << 16) | (cl(gg, 0, 255) << 8) | cl(b, 0, 255)).toString(16).slice(1);
}
function drawHand(g, shape, x, y, ang, u, skin, rim){
  if (!shape || shape === 'mitt') return;
  u *= handFloor(g, u);   /* ✋ mo-8: a hand SHAPE never reads narrower than M.HAND_MIN screen px */
  g.save(); g.translate(x, y); g.rotate(ang || 0); g.scale(u, u);
  g.fillStyle = skin; g.strokeStyle = rim; g.lineWidth = 0.65; g.lineCap = 'round'; g.lineJoin = 'round';
  const rr = (x0, y0, w, h, r) => { g.beginPath(); g.moveTo(x0 + r, y0); g.arcTo(x0 + w, y0, x0 + w, y0 + h, r); g.arcTo(x0 + w, y0 + h, x0, y0 + h, r); g.arcTo(x0, y0 + h, x0, y0, r); g.arcTo(x0, y0, x0 + w, y0, r); g.closePath(); };
  const finger = (x0, y0, a, len, w) => { const x1 = x0 - Math.sin(a) * len, y1 = y0 + Math.cos(a) * len;   // a stroked finger: rim first, skin over it
    g.lineWidth = w + 1.1; g.strokeStyle = rim; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.lineWidth = w; g.strokeStyle = skin; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = rim; g.lineWidth = 0.65; };
  const fist = () => { rr(-3.3, -1.7, 6.6, 5.9, 2.5); g.fill(); g.stroke();
    g.beginPath(); [-1.1, 1.1].forEach(cx => { g.moveTo(cx, 2.4); g.lineTo(cx, 4.0); }); g.stroke(); };
  const thumbOver = () => { g.beginPath(); g.moveTo(3.0, -0.6); g.quadraticCurveTo(1.6, 0.9, 0.2, 1.4); g.stroke(); };
  if (shape === 'fist') { fist(); thumbOver(); }
  else if (shape === 'grip') { rr(-3.2, -1.6, 6.4, 5.6, 2.4); g.fill(); g.stroke(); g.beginPath(); [0.4, 1.8, 3.1].forEach(yy => { g.moveTo(-3.0, yy); g.lineTo(1.6, yy); }); g.stroke(); finger(2.6, -0.8, -0.15, 2.4, 1.9); }
  else if (shape === 'open') { [-0.42, -0.14, 0.14, 0.42].forEach((a, i) => finger(-1.9 + i * 1.25, 1.6, a, [3.0, 3.8, 3.9, 3.4][i], 1.45)); finger(2.5, 0.4, -1.05, 3.0, 1.6);
    g.beginPath(); g.ellipse(0, 0.8, 3.1, 3.2, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
  else if (shape === 'point') { finger(1.3, 3.0, 0, 4.6, 1.55); fist(); thumbOver(); }
  else if (shape === 'peace') { finger(-0.2, 3.0, 0.24, 4.5, 1.45); finger(1.6, 3.0, -0.2, 4.5, 1.45); fist(); thumbOver(); }
  else if (shape === 'thumb') { fist(); finger(2.6, 0.6, -1.57, 4.2, 1.9); }
  g.restore();
}

// ---------- 📐 LIMITS + poseCheck (R1–R4) ----------
const LIMITS = {
  avatar: {neckTilt: [-0.45, 0.45], neckTurn: [-0.7, 0.7], nod: [-0.3, 0.4], twist: [-0.4, 0.4], shrugL: [0, 1], shrugR: [0, 1],
    wristL: [-1, 1], wristR: [-1, 1], footL: [-0.75, 1], footR: [-0.75, 1], kneeL: [-0.1, 2.6], kneeR: [-0.1, 2.6], elbowL: [-2.95, 2.95], elbowR: [-2.95, 2.95],
    bend: [-0.8, 1.4], headSc: [0.5, 2], legFwd: 2.75, legBack: 1.0, elbowWrong: -0.35, floor: 6, air: -4, headLow: -53},
  creature: {lean: [-0.7, 0.6], head: [-0.7, 0.5], jaw: [0, 1], eye: [0, 1], fl: [-0.8, 1.4], bl: [-1.4, 0.8], tail: [-0.9, 1.1], wing: [0, 1], arm: [-2.8, 1.6], wrist: [-0.6, 0.8],
    y: [-40, 6], sx: [0.55, 1.5], sy: [0.55, 1.5], two: [0, 1], quake: [0, 1]},
  family: {slime: ['lean', 'jaw', 'eye'], beast: ['lean', 'head', 'jaw', 'fl', 'bl', 'tail', 'wing'], bird: ['lean', 'head', 'jaw', 'wing', 'tail', 'y'], plant: ['lean', 'head', 'jaw', 'arm', 'y'],
    bug: ['lean', 'head', 'jaw', 'fl', 'y'], spirit: ['lean', 'arm', 'jaw', 'tail', 'wing', 'y'], construct: ['lean', 'head', 'arm', 'fl', 'bl'], reptile: ['lean', 'head', 'jaw', 'arm', 'fl', 'tail', 'wing', 'y'],
    giant: ['lean', 'head', 'arm', 'wrist', 'two', 'quake', 'cA', 'cs', 'nA', 'nE']},
  HANDS};
// body points (avatar units, feet line 0, facing right) — the same maths as drawAvatar
function bodyPt(P, x, y, upper){
  const rotAbout = (cx, cy, a) => { const dx = x - cx, dy = y - cy, c = Math.cos(a), s = Math.sin(a); x = cx + dx * c - dy * s; y = cy + dx * s + dy * c; };
  if (upper && P.bend) rotAbout(0, -20, P.bend); if (P.rot) rotAbout(0, 0, P.rot); if (P.rotFull) rotAbout(0, -34, P.rotFull);
  return [x * (P.sx || 1) + (P.shift || 0), y * (P.sy || 1) + (P.dy || 0)];
}
const end = (x, y, a, len) => [x - Math.sin(a) * len, y + Math.cos(a) * len];
function rigPoints(P){
  P = Object.assign({armL: 0.15, armR: 0.15}, P || {}); const R = rigOf(P) || {bo: [0, 0], fo: [0, 0], tilt: 0, turn: 0, nod: 0, drop: 0};
  const legs = !!(P.kneeL || P.kneeR || P.footL || P.footR);
  const foot = (hx, a, kn) => { if (!legs) return [hx - Math.sin(a) * 18, -2]; const j = end(hx, -20, a, 9); return end(j[0], j[1], a + kn, 9); };
  const fL = foot(-5, -(P.legL || 0), P.kneeL || 0), fR = foot(5, P.legR || 0, P.kneeR || 0);
  const len = 16 * (P.reach || 1), fh = AKJ_frontHand(P, len), bj = end(-10, -42, P.armL, P.elbowL ? 8 : 16), bh = P.elbowL ? end(bj[0], bj[1], P.armL + P.elbowL, 8) : bj;
  const hd = headPoint(R, 0, -60, 1);
  return {head: bodyPt(P, hd[0], hd[1], true), headLocal: hd, footL: bodyPt(P, fL[0], fL[1], false), footR: bodyPt(P, fR[0], fR[1], false),
    handR: bodyPt(P, fh[0] + R.fo[0], fh[1] + R.fo[1], true), handL: bodyPt(P, bh[0] + R.bo[0], bh[1] + R.bo[1], true), handRLocal: [fh[0] + R.fo[0], fh[1] + R.fo[1]]};
}
function AKJ_frontHand(P, len){ if (!P.elbowR) return [10 + Math.sin(P.armR) * len, -42 + Math.cos(P.armR) * len]; const j = end(10, -42, -P.armR, len / 2); return end(j[0], j[1], -P.armR - P.elbowR, len / 2); }
function poseCheck(P, who){
  P = P || {}; const out = {bad: [], look: []}, put = (lvl, law, f, v, why) => out[lvl].push({law, f, v: typeof v === 'number' ? Math.round(v * 1000) / 1000 : v, why});
  const fam = who && typeof who === 'object' ? who.family : null;
  if (who === 'creature' || fam) {
    Object.keys(P).forEach(f => { const v = P[f], L = LIMITS.creature[f]; if (typeof v !== 'number' || !L) return; if (v < L[0] - 1e-9 || v > L[1] + 1e-9) put('bad', 'R1', f, v, 'outside ' + L[0] + ' … ' + L[1]); });
    if (fam && LIMITS.family[fam]) Object.keys(P).forEach(f => { if (typeof P[f] === 'number' && LIMITS.creature[f] && LIMITS.family[fam].indexOf(f) < 0 && !/^(sx|sy|y|shift)$/.test(f) && P[f]) put('look', 'R6', f, P[f], 'a ' + fam + ' has no ' + f); });
    out.ok = !out.bad.length; return out;
  }
  const A = LIMITS.avatar;
  Object.keys(A).forEach(f => { const L = A[f], v = P[f]; if (!Array.isArray(L) || typeof v !== 'number') return;
    if (v < L[0] - 1e-9 || v > L[1] + 1e-9) put('bad', f === 'kneeL' || f === 'kneeR' ? 'R2' : 'R1', f, v, f.indexOf('knee') === 0 && v < L[0] ? 'the knee bends forward' : f === 'bend' && v < L[0] ? 'folds backwards' : 'outside ' + L[0] + ' … ' + L[1]); });
  ['handL', 'handR'].forEach(f => { if (P[f] != null && HANDS.indexOf(P[f]) < 0) put('bad', 'R1', f, P[f], 'not a hand shape (' + HANDS.join(' · ') + ')'); });
  const lean = Math.max(0, P.bend || 0) + Math.max(0, P.rot || 0);
  const fwdL = P.legL || 0, fwdR = -(P.legR || 0);
  if (fwdL > A.legFwd || fwdR > A.legFwd) put('bad', 'R1', fwdL > A.legFwd ? 'legL' : 'legR', Math.max(fwdL, fwdR), 'a kick past ' + A.legFwd);
  if (-fwdL > A.legBack + lean + 1e-9 || -fwdR > A.legBack + lean + 1e-9) put('bad', 'R2', -fwdL > -fwdR ? 'legL' : 'legR', Math.max(-fwdL, -fwdR), 'the leg goes back through the body (more than ' + A.legBack + ' + the lean)');
  ['elbowL', 'elbowR'].forEach(f => { if ((P[f] || 0) < A.elbowWrong) put('look', 'R2', f, P[f], 'the elbow folds the "other" way (fine when the arm is turned)'); });
  const pts = rigPoints(P), low = Math.max(pts.footL[1], pts.footR[1]);
  if (!P.rotFull && low > A.floor) put(Math.abs(P.rot || 0) > 0.9 ? 'look' : 'bad', 'R2', 'feet', low, 'a foot is ' + (Math.round(low * 10) / 10) + ' units under the floor');
  if (!P.rotFull && low < A.air) put('look', 'R3', 'feet', low, 'both feet off the floor (fine for a jump / dive / knock-back)');
  if (pts.headLocal[1] > A.headLow) put('bad', 'R2', 'head', pts.headLocal[1], 'the head sinks into the torso');
  const hd = pts.headLocal, hr = pts.handRLocal;   // R4: the front hand over the face (upper body frame)
  if (Math.hypot(hr[0] - (hd[0] + 4), hr[1] - (hd[1] + 1)) < 7) put('look', 'R4', 'handR', Math.round(Math.hypot(hr[0] - hd[0] - 4, hr[1] - hd[1] - 1) * 10) / 10, 'the hand is over the face');
  out.ok = !out.bad.length; return out;
}

Object.assign(M, {VERSION: 'mo-7b', HAND_MIN: 9, rig, neckIn, neckOut, rigBody, rigHand, rigOf, headXf, rigPoints, poseCheck, LIMITS, HANDS, drawHand, RIG_FIELDS: NUM.concat(['handL', 'handR']),
  shoulderOff: (P, side) => { const R = rigOf(P); return R ? (side === 'L' ? R.bo.slice() : R.fo.slice()) : [0, 0]; }});
})();
/* ================= 🪨🌪️ MotionEl (mo-8, 🎬 Motion chat, 2026-11-20) — 2 new elements · quake · gust · hit pops · item aura · 6 kid statuses =================
   Rules: `FX Bible.md` (F1–F16, §2.2a ramps · §2.3 shapes · §6.3 catalogue) · `Motion rules.md` §26 (plan) · §27 (as built). Built INTO AvatarMotion.html after MotionRig (build_motion.py).
   🪨 stone + 🌪️ wind = Motion.FX_EL.stone / .wind (every effect takes {element: 'stone' | 'wind'}; their bits = pebbles / curls, trails = pebbles / a ribbon, hit pops = rock chunks / a gust ring)
   💥 hit pops for 💧 water (splash ring + drops) · 🌱 nature (leaf burst) · 🪨 stone (rock chunks) · 🌪️ wind (gust ring + curls) — Motion.hit({…, fx: true, element}) draws them
   Motion.fx('quake', {x, y (ground), k, calm, onContact}) — ground slam: white ground pop → crack lines + 5 rock spikes → pebbles + dust arcs · contact 40 ms · 1.1 s · shake 4 px
   Motion.fx('gust', {x, y (middle of the push), k, dir, calm, onContact}) — a rolling gust front + curls + speed lines · contact 80 ms (= push the target 1 tile — the GAME moves it) · 0.8 s
   🗡️ ITEM AURA (FX Bible §6.3): the element lives on the held blade —
     drawAvatar(g, a, x, y, k, {…, aura: {element, lv: 1 | 3 | 5, calm, day, t}}) or Acting.draw(g, who, x, y, k, act, {…, aura}) → painted after the body, face kept clear
     Motion.itemAura(g, {element, lv, pts: [[hx, hy], [tx, ty]], k, t, calm, day, dir, seed}) — the same on any blade line (item cards · bag · loot reveal)
     Lv 1 = the edge in the element colour + 2 bits · Lv 3 = + its idle life · Lv 5 = + a glow (never for stone) + 6 bits, ×1.17 · calm = half bits
   😵 STATUSES (1 turn): Motion.status('soaked' | 'rooted' | 'dizzy' | 'pushed' | 'dazzled' | 'hushed' (+ 'toasty' = burning · 'zapped'), {x, y (feet), k, ms, dir, calm, face})
     ms defaults: soaked / rooted / dizzy / hushed 900 · dazzled 700 · pushed 450 · ms: Infinity = until E.stop(t) (turn games) · the face stays clear (face: true / [x, y, r] / false)
     Motion.hit({…, fx: true, element, status: true}) → water soaked · nature rooted · stone dizzy · wind pushed · light dazzled · shadow hushed (🔥 / ⚡ stay automatic like today)
   Pure (same t = same picture) · plain canvas + the cached glow sprite · ≤ 0.3 ms an effect. */
(function () {
  const M = window.Motion; if (!M || !M.fxAdd || M.itemAura) return;
  const T = M.fxTools, EL = M.FX_EL, TAU = Math.PI * 2, rng = T.rng, noise = T.noise, outBack = T.outBack, outQ = T.outQ, inQ = T.inQ, rgba = T.rgba;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  // ---------- 🪨🌪️ the ramps (index 0 = white core → 6 = darkest edge, never pure black — Avateer EF7) ----------
  const STONE = {ramp: ['#FFFFFF', '#F3E9D8', '#D9C3A0', '#B08A5E', '#8A6A44', '#5E4A34', '#3A2E26'], glow: '#D9C3A0', smoke: '#8A7A66'};
  const WIND  = {ramp: ['#FFFFFF', '#EFFFF8', '#C9F5E6', '#8FE3CC', '#52C7AE', '#2E9C8C', '#1F5E5E'], glow: '#8FE3CC', smoke: '#A9D8CC'};
  const GOLD = ['#FFFFFF', '#FFB020'];   // glints on a light screen (ramp 1 of light vanishes on white)
  // ---------- shapes (FX Bible §2.3) ----------
  function pebble(g, x, y, s, R, a, seed) {   // 🪨 a faceted rock: lit top face + dark bottom face + rim + one crack
    const Rn = rng(seed || 3), n = 6 + (Rn() > 0.5 ? 1 : 0), P = [];
    for (let i = 0; i < n; i++) { const an = i / n * TAU + (Rn() - 0.5) * 0.5, r = s * (0.75 + Rn() * 0.35); P.push([Math.cos(an) * r, Math.sin(an) * r * 0.82]); }
    g.save(); g.translate(x, y); g.rotate(a || 0); g.beginPath(); P.forEach(p => g.lineTo(p[0], p[1])); g.closePath(); g.fillStyle = R[4]; g.fill();
    g.beginPath(); P.forEach(p => g.lineTo(p[0] * 0.92, Math.min(p[1], s * 0.12) * 0.92 - s * 0.1)); g.closePath(); g.fillStyle = R[3]; g.fill();
    g.beginPath(); g.moveTo(-s * 0.35, -s * 0.38); g.lineTo(s * 0.1, -s * 0.5); g.lineTo(s * 0.3, -s * 0.3); g.strokeStyle = R[1]; g.lineWidth = Math.max(0.6, s * 0.14); g.lineCap = 'round'; g.stroke();
    if (s > 3) { g.beginPath(); g.moveTo(-s * 0.1, -s * 0.05); g.lineTo(s * 0.12, s * 0.22); g.lineTo(0, s * 0.45); g.strokeStyle = R[6]; g.lineWidth = Math.max(0.5, s * 0.09); g.stroke(); }
    g.beginPath(); P.forEach(p => g.lineTo(p[0], p[1])); g.closePath(); g.strokeStyle = R[6]; g.lineWidth = Math.max(0.6, s * 0.12); g.stroke(); g.restore(); }
  function dustArc(g, x, y, r, a0, a1, R, w, alpha) {   // 🪨 a heavy dust arc = lumpy flat puffs along an arc (erodes — F5)
    for (let i = 0; i < 4; i++) { const u = i / 3, an = a0 + (a1 - a0) * u, px = x + Math.cos(an) * r, py = y + Math.sin(an) * r * 0.45, s = w * (1 - Math.abs(u - 0.5) * 0.8);
      g.save(); g.globalAlpha *= alpha; g.fillStyle = R[2]; g.beginPath(); g.arc(px, py - s * 0.15, s, 0, TAU); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.arc(px + s * 0.25, py + s * 0.2, s * 0.7, 0, TAU); g.fill(); g.restore(); } }
  function curl(g, x, y, s, R, a, q) {   // 🌪️ a wind curl: a spiral line that unrolls (q 0..1 = how far), 2 passes
    g.save(); g.translate(x, y); g.rotate(a || 0); g.lineCap = 'round'; const n = 22, end = Math.max(2, Math.round(n * (q == null ? 1 : q)));
    [[R[3], s * 0.28], [R[1], s * 0.11]].forEach(([c, w]) => { g.beginPath(); for (let i = 0; i <= end; i++) { const u = i / n, an = -u * TAU * 1.15, rr = s * (1 - u * 0.78); g.lineTo(-s + u * s * 1.6 + Math.cos(an) * rr * 0.55, Math.sin(an) * rr * 0.55); }
      g.strokeStyle = c; g.lineWidth = w; g.stroke(); }); g.restore(); }
  function ribbon(g, pts, w, R, alpha) {   // 🌪️ a tapered ribbon, 2 cel passes (colour + white core)
    g.save(); g.globalAlpha *= alpha; g.lineCap = 'round'; for (let i = 1; i < pts.length; i++) { const u = i / (pts.length - 1);
      g.strokeStyle = R[3]; g.lineWidth = w * (1 - u * 0.85); g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke(); }
    for (let i = 1; i < pts.length; i++) { const u = i / (pts.length - 1); g.strokeStyle = R[1]; g.lineWidth = Math.max(0.6, w * 0.3 * (1 - u)); g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke(); }
    g.restore(); }
  function speed(g, x, y, len, R, a, w) { g.save(); g.translate(x, y); g.rotate(a); g.lineCap = 'round'; g.strokeStyle = R[3]; g.lineWidth = w; g.beginPath(); g.moveTo(0, 0); g.lineTo(-len, 0); g.stroke(); g.strokeStyle = R[0]; g.lineWidth = w * 0.4; g.beginPath(); g.moveTo(-len * 0.1, 0); g.lineTo(-len * 0.6, 0); g.stroke(); g.restore(); }
  // ---------- element parts: bits · swing trails · hit pops ----------
  const bitStone = (g, x, y, s, q, i, t) => { const a = 1 - q; if (a <= 0 || s <= 0.2) return; g.save(); g.globalAlpha *= a; pebble(g, x, y, s * 0.9, STONE.ramp, i * 1.1 + (t || 0) * 4, i + 5); g.restore(); };
  const bitWind = (g, x, y, s, q, i, t) => { const a = 1 - q; if (a <= 0 || s <= 0.2) return; g.save(); g.globalAlpha *= a; curl(g, x, y, s * 1.3, WIND.ramp, i * 0.7, clamp(0.35 + q * 1.4, 0, 1)); g.restore(); };
  function trailWind(g, pts, k, t) { ribbon(g, pts.map((p, i) => [p[0], p[1] + Math.sin(i * 0.8 + t * 9) * 3 * k]), 6 * k, WIND.ramp, 0.9);
    const n = Math.min(5, pts.length - 1); for (let j = 1; j <= n; j++) { const i = Math.round(j / (n + 1) * (pts.length - 1)), p = pts[i], q = 1 - i / (pts.length - 1); speed(g, p[0], p[1], 14 * k * (1 - q), WIND.ramp, Math.atan2(p[1] - pts[i - 1][1], p[0] - pts[i - 1][0]), 1.6 * k); } }
  function pop(el) { return (g, H, tms, x, y, k) => { const t = tms / 1000, q = clamp((t - 0.05) / 0.4, 0, 1); if (t < 0.05 || q >= 1) return; const E = EL[el], R = E.ramp, Rn = rng(41), n = H.o.calm ? 3 : 6, s0 = (H.size || 20) / 20;
    g.save(); g.translate(x, y); g.scale(s0, s0);
    if (el === 'water') { g.save(); g.strokeStyle = R[3]; g.lineWidth = 3 * k * (1 - q) + 0.5; g.beginPath(); g.ellipse(0, 22 * k, (10 + q * 30) * k, (3 + q * 9) * k, 0, 0, TAU); g.stroke(); g.restore();
      for (let i = 0; i < n; i++) { const a = -Math.PI * (0.1 + i / (n - 1) * 0.8), v = (50 + Rn() * 30) * k, s = t - 0.05; T.SH.drop(g, Math.cos(a) * v * s, Math.sin(a) * v * s + 260 * k * s * s, 4 * k * (1 - q * 0.5), R, a + Math.PI * 1.5); } }
    else if (el === 'nature') for (let i = 0; i < n + 2; i++) { const a = i / (n + 2) * TAU + 0.3, d = (10 + outQ(q) * 34) * k; T.SH.leaf(g, Math.cos(a) * d, Math.sin(a) * d * 0.85 + q * q * 12 * k, 4.5 * k * (1 - q * 0.4), R, a + q * 6 + Math.sin(t * 12 + i) * 0.5); }
    else if (el === 'stone') for (let i = 0; i < n; i++) { const a = -Math.PI * (0.05 + Rn() * 0.9), v = (70 + Rn() * 50) * k, s = t - 0.05; pebble(g, Math.cos(a) * v * s, Math.sin(a) * v * s + 320 * k * s * s, (3.5 + Rn() * 3) * k * (1 - q * 0.4), R, s * 10 + i, i + 9); }
    else if (el === 'wind') { g.save(); g.lineCap = 'round'; g.strokeStyle = R[3]; g.lineWidth = 3 * k * (1 - q) + 0.5; g.beginPath(); g.arc(0, 0, (12 + outQ(q) * 30) * k, 0, TAU); g.stroke(); g.restore();
      for (let i = 0; i < n; i++) { const a = i / n * TAU, d = (16 + outQ(q) * 30) * k; curl(g, Math.cos(a) * d, Math.sin(a) * d, 5 * k, R, a + Math.PI / 2, clamp(q * 1.6 + 0.2, 0, 1)); } }
    g.restore(); }; }
  M.elAdd('stone', STONE, {bit: bitStone, pop: pop('stone')});
  M.elAdd('wind', WIND, {bit: bitWind, trail: trailWind, pop: pop('wind')});
  M.popAdd('water', pop('water')); M.popAdd('nature', pop('nature'));
  // ---------- 🪨 QUAKE · 🌪️ GUST ----------
  M.fxAdd('quake', {el: 'stone', life: 1.1, contact: 0.04, shake: [0.04, 4, 250], draw(g, P, t) { const k = P.k, x = P.x, y = P.y, R = P.E.ramp, q = t / this.life, Rn = rng(P.seed);
    if (t < 0.05 && !P.calm) { g.save(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(x, y, 46 * k, 13 * k, 0, 0, TAU); g.fill(); g.restore(); }   // F1 white pop, 1–2 frames
    g.save(); g.strokeStyle = R[5]; g.lineCap = 'round'; for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + Rn() * 0.4, L = (34 + Rn() * 26) * k * outQ(q / 0.12) * (1 - inQ((q - 0.75) / 0.25)); let px = x, py = y;
      g.lineWidth = 2.4 * k * (1 - q) + 0.3; g.beginPath(); g.moveTo(px, py); for (let j = 1; j <= 4; j++) { px = x + Math.cos(a + (Rn() - 0.5) * 0.5) * L * j / 4; py = y + Math.sin(a + (Rn() - 0.5) * 0.5) * L * j / 4 * 0.32; g.lineTo(px, py); } g.stroke(); } g.restore();
    const up = outBack(q / 0.11) * (1 - inQ((q - 0.35) / 0.3)); for (let i = 0; i < 5; i++) { const f = i / 4 - 0.5, h = (30 - Math.abs(f) * 30 + Rn() * 10) * k * up, bx = x + f * 70 * k; if (h <= 1) continue;
      g.save(); g.beginPath(); g.moveTo(bx - 7 * k, y); g.lineTo(bx - 1.5 * k, y - h); g.lineTo(bx + 7 * k, y); g.closePath(); g.fillStyle = R[4]; g.fill(); g.beginPath(); g.moveTo(bx - 7 * k, y); g.lineTo(bx - 1.5 * k, y - h); g.lineTo(bx + 0.5 * k, y); g.closePath(); g.fillStyle = R[2]; g.fill();
      g.strokeStyle = R[6]; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(bx - 7 * k, y); g.lineTo(bx - 1.5 * k, y - h); g.lineTo(bx + 7 * k, y); g.stroke(); g.restore(); }
    if (q > 0.25) for (let i = 0; i < (P.calm ? 4 : 9); i++) { const a = -Math.PI * (0.12 + Rn() * 0.76), v = (60 + Rn() * 80) * k, s = t - 0.25 * this.life, px = x + Math.cos(a) * v * s, py = y - 20 * k + Math.sin(a) * v * s + 300 * k * s * s; if (py > y + 2) continue; pebble(g, px, py, (2.2 + Rn() * 2.4) * k, R, s * 9 + i, i); }
    if (q > 0.18) { const dq = clamp((q - 0.18) / 0.7, 0, 1); dustArc(g, x - 30 * k, y, (20 + dq * 26) * k, Math.PI * 0.9, Math.PI * 1.35, R, 7 * k * (1 - dq * 0.5), 1 - dq); dustArc(g, x + 30 * k, y, (20 + dq * 26) * k, -Math.PI * 0.35, Math.PI * 0.1, R, 7 * k * (1 - dq * 0.5), 1 - dq); } }});
  M.fxAdd('gust', {el: 'wind', life: 0.8, contact: 0.08, draw(g, P, t) { const k = P.k, x = P.x, y = P.y, R = P.E.ramp, q = t / this.life, dir = P.dir || 1, Rn = rng(P.seed);
    T.glow(g, x, y, 60 * k * (1 - q), P.E.glow, 0.5 * (1 - q), 0.6);
    g.save(); g.lineCap = 'round'; for (let i = 0; i < 2; i++) { const rq = clamp((q - i * 0.12) / 0.7, 0, 1); if (rq <= 0 || rq >= 1) continue; g.strokeStyle = R[i ? 2 : 3]; g.lineWidth = (5 - i * 2) * k * (1 - rq) + 0.5;
      g.beginPath(); g.ellipse(x + dir * rq * 20 * k, y, (16 + rq * 44) * k, (24 + rq * 50) * k, 0, dir > 0 ? -Math.PI * 0.42 : Math.PI * 0.58, dir > 0 ? Math.PI * 0.42 : Math.PI * 1.42); g.stroke(); } g.restore();
    for (let i = 0; i < (P.calm ? 3 : 6); i++) { const s = (6 + Rn() * 5) * k, d = (20 + q * 70 + Rn() * 20) * k * dir, yy = y + (Rn() - 0.5) * 70 * k; curl(g, x + d, yy, s, R, dir < 0 ? Math.PI : 0, clamp(q * 2 + 0.2, 0, 1)); }
    for (let i = 0; i < (P.calm ? 3 : 7); i++) { const yy = y + (Rn() - 0.5) * 80 * k, L = (18 + Rn() * 30) * k * (1 - q), xx = x + dir * (30 + q * 90 + Rn() * 30) * k; g.save(); g.globalAlpha = 1 - q; speed(g, xx, yy, L, R, dir < 0 ? Math.PI : 0, 2 * k); g.restore(); } }});
  // ---------- 🗡️ ITEM AURA ----------
  function faceClip(g, face) { if (Array.isArray(face)) { g.beginPath(); g.rect(-1e5, -1e5, 2e5, 2e5); g.arc(face[0], face[1], face[2], 0, TAU, true); g.clip('evenodd'); } else if (face !== false) T.faceClip(g); }
  function itemAura(g, o) { o = o || {}; const el = EL[o.element] ? o.element : 'fire', lv = o.lv >= 5 ? 5 : o.lv >= 3 ? 3 : 1, pts = o.pts; if (!pts || pts.length < 2) return;
    const k0 = o.k || 1, t = o.t != null ? o.t : performance.now() / 1000; g.save(); if (o.day) T.day(true);
    try { faceClip(g, o.face); aura(g, el, lv, pts[0], pts[pts.length - 1], k0 * (lv >= 5 ? 1.75 : 1.5), t, o, k0); } finally { T.day(false); g.restore(); } }
  function aura(g, el, lv, hand, tip, k, t, o, k0) { const E = EL[el], R = E.ramp, P = u => [hand[0] + (tip[0] - hand[0]) * u, hand[1] + (tip[1] - hand[1]) * u];
    const ang = Math.atan2(tip[1] - hand[1], tip[0] - hand[0]), L = Math.hypot(tip[0] - hand[0], tip[1] - hand[1]), nx = Math.cos(ang + Math.PI / 2), ny = Math.sin(ang + Math.PI / 2), dir = o.dir || 1;
    const bits = o.calm ? (lv >= 5 ? 3 : 1) : (lv >= 5 ? 6 : 2), life = lv >= 3, Rn = rng(o.seed || 51);
    if (lv >= 5 && el !== 'stone') for (let i = 0; i < 3; i++) { const p = P(0.35 + i * 0.25); T.glow(g, p[0], p[1], 16 * k, E.glow, 0.7, 1); }   // rocks never glow
    g.save(); g.lineCap = 'round'; const e0 = P(0.3), e1 = P(0.98); g.strokeStyle = R[3]; g.globalAlpha *= 0.9; g.lineWidth = 1.8 * k0; g.beginPath(); g.moveTo(e0[0] + nx * 1.2 * k0, e0[1] + ny * 1.2 * k0); g.lineTo(e1[0], e1[1]); g.stroke();
    g.strokeStyle = R[0]; g.lineWidth = 0.7 * k0; g.stroke(); g.restore();   // Lv 1+: the edge in the element colour
    if (el === 'fire' || el === 'spirit') { if (life) for (let i = 0; i < 4; i++) { const p = P(0.3 + i * 0.2); T.flameStack(g, p[0] + nx * 2 * k, p[1] + ny * 2 * k, 3.4 * k, (6 + 2.5 * noise(t, i)) * k, noise(t * 1.4, i) * 1.5 * k, E, 0.95); }
      for (let i = 0; i < bits; i++) { const ph = (t * 0.7 + i / bits) % 1, p = P(0.25 + Rn() * 0.7); T.bit(g, el, p[0] + Math.sin(t * 3 + i) * 3 * k, p[1] - ph * 22 * k, 2.2 * k, ph, i, t); } }
    else if (el === 'water' || el === 'ice') { if (life) for (let i = 0; i < 3; i++) { const u = ((t * 0.6 + i / 3) % 1) * 0.75 + 0.2, a = P(u), b = P(Math.min(0.98, u + 0.1)); g.save(); g.strokeStyle = R[0]; g.globalAlpha *= 0.9; g.lineWidth = 1.3 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.restore(); }
      for (let i = 0; i < bits; i++) { const per = 1.4, ph = ((t + i * per / bits) % per) / per, p = P(i % 2 ? 0.96 : 0.6), grow = clamp(ph / 0.55, 0, 1), fall = clamp((ph - 0.55) / 0.45, 0, 1);
        if (el === 'ice') T.SH.shard(g, p[0], p[1] + 2 * k + fall * fall * 28 * k, 3 * k * (0.4 + 0.6 * grow), R, 0); else T.SH.drop(g, p[0], p[1] + 2 * k + fall * fall * 28 * k, 2.6 * k * (0.4 + 0.6 * grow), R, 0); } }
    else if (el === 'nature') { if (life) { g.save(); g.strokeStyle = R[4]; g.lineWidth = 1.4 * k; g.lineCap = 'round'; g.beginPath(); for (let s = 0; s <= 24; s++) { const u = s / 24 * 0.45 + 0.05, p = P(u), w = Math.sin(u * 40) * 3 * k; g.lineTo(p[0] + nx * w, p[1] + ny * w); } g.stroke(); g.restore(); }
      for (let i = 0; i < bits; i++) { const ph = (t * 0.5 + i / bits) % 1, p = P(0.3 + (i % 3) * 0.25); T.SH.leaf(g, p[0] + Math.sin(ph * 9 + i) * 6 * k, p[1] + ph * 18 * k, 3 * k * (1 - ph * 0.4), R, Math.sin(ph * 8 + i) * 0.9); }
      if (lv >= 5) { const p = P(0.98); T.SH.star5(g, p[0], p[1], 3.2 * k * (0.8 + 0.2 * Math.sin(t * 3)), EL.candy.ramp, 0); } }
    else if (el === 'stone') { if (life) for (let i = 0; i < 3; i++) { const a = t * 2.2 + i / 3 * TAU, c = P(0.6); pebble(g, c[0] + Math.cos(a) * (L * 0.3) * Math.cos(ang) - Math.sin(a) * 6 * k * nx, c[1] + Math.cos(a) * (L * 0.3) * Math.sin(ang) - Math.sin(a) * 6 * k * ny, 2.4 * k, R, a, i + 2); }
      for (let i = 0; i < bits; i++) { const ph = (t * 0.6 + i / bits) % 1, p = P(0.3 + Rn() * 0.6); g.save(); g.globalAlpha *= 1 - ph; g.fillStyle = R[3]; g.fillRect(p[0] - k, p[1] + ph * 16 * k, 2 * k, 2 * k); g.restore(); } }
    else if (el === 'wind') { const tp = P(1), pts = []; for (let s = 0; s <= 14; s++) { const u = s / 14; pts.push([tp[0] + u * 20 * k * dir, tp[1] - u * 16 * k + Math.sin(u * 7 - t * 8) * 4 * k * u]); }
      if (life) ribbon(g, pts, 4.5 * k, R, 0.95); for (let i = 0; i < bits; i++) { const ph = (t * 1.1 + i / bits) % 1, p = P(0.3 + (i % 3) * 0.25); g.save(); g.globalAlpha *= 1 - ph; speed(g, p[0] - ph * 18 * k * dir, p[1], 9 * k, R, dir > 0 ? Math.PI : 0, 1.3 * k); g.restore(); } }
    else if (el === 'zap') { const Rz = rng(7 + Math.floor(t / 0.06)); if (life) for (let i = 0; i < 2; i++) { const u = 0.25 + ((Math.floor(t / 0.18) + i) % 3) * 0.24, a = P(u), b = P(u + 0.2); T.jag(a[0] + nx * 3 * k, a[1] + ny * 3 * k, b[0] + nx * 3 * k, b[1] + ny * 3 * k, 0.7, 3, Rz, []).forEach(l => T.strokeBolt(g, l, 1.2 * k, E, 0.95)); }
      for (let i = 0; i < bits; i++) { const p = P(0.3 + Rz() * 0.65); g.save(); g.fillStyle = R[1]; g.fillRect(p[0] + (Rz() - 0.5) * 10 * k, p[1] + (Rz() - 0.5) * 10 * k, 1.6 * k, 1.6 * k); g.restore(); } }
    else if (el === 'shadow') { if (life) for (let i = 0; i < 2; i++) { const ph = (t * 0.45 + i / 2) % 1, p = P(0.4 + i * 0.35); g.save(); g.globalAlpha *= Math.sin(ph * Math.PI); T.SH.wisp(g, p[0] - ph * 8 * k, p[1] - ph * 14 * k, 7 * k, R); g.restore(); }
      for (let i = 0; i < bits; i++) { const ph = (t * 0.7 + i / bits) % 1, p = P(0.3 + Rn() * 0.7); T.SH.star4(g, p[0] + (Rn() - 0.5) * 6 * k, p[1] + (Rn() - 0.5) * 6 * k, 1.8 * k * Math.sin(ph * Math.PI), R, 0); } }
    else { if (life) { const u = (t * 0.8) % 1, p = P(0.2 + u * 0.8); T.SH.star4(g, p[0], p[1], 5 * k * Math.sin(u * Math.PI), R, t * 3); }   // ✨ light · 🍬 candy · anything else
      for (let i = 0; i < bits; i++) { const ph = (t * 0.9 + i / bits) % 1, p = P(0.3 + Rn() * 0.7); T.SH.star4(g, p[0] + nx * 6 * k * (i % 2 ? 1 : -1), p[1] + ny * 6 * k, 2.6 * k * Math.sin(ph * Math.PI), R, ph * 2); } } }
  // the blade line of what an avatar holds, in canvas px (drawAvatar's x is after the body shift; Motion.points adds the shift itself)
  function bladeOf(a, x, y, k, P) { const who = {name: a.name, av: a.av}; if (!a.av || !a.av.eq || !a.av.eq.hand) return null; const dir = a.dir || 1, xb = x - (P.shift || 0) * k * dir;
    const pp = M.points(P, M.reach(who)), W = p => [xb + p[0] * k * dir, y + p[1] * k]; return [W(pp.hand), W(pp.tip)]; }
  let CUR = null;   // the aura Acting.draw was asked for — its paint() calls drawAvatar without our option
  if (typeof window.drawAvatar === 'function') { const _da = window.drawAvatar;
    window.drawAvatar = function (g, a, x, y, k, o) { const r = _da.apply(this, arguments), A = (o && o.aura) || CUR;
      if (A && A.element && a) { const pts = bladeOf(a, x, y, k, (o && o.pose) || {}); if (pts) itemAura(g, Object.assign({k, dir: a.dir || 1, t: o && o.t}, A, {pts})); }
      return r; }; }
  if (window.Acting && Acting.draw) { const _ad = Acting.draw; Acting.draw = function (g, who, x, y, k, act, opt) { const prev = CUR; CUR = opt && opt.aura ? Object.assign({t: opt.t}, opt.aura) : null; try { return _ad.apply(this, arguments); } finally { CUR = prev; } }; }
  // ---------- 😵 the 6 kid statuses (x, y = feet · avatar ≈ 70 units, head centre 60 up) ----------
  const ST = {
    soaked(g, x, y, k, t, P) { const R = EL.water.ramp; g.save(); g.strokeStyle = R[3]; g.lineWidth = 1.6 * k; g.beginPath(); g.ellipse(x, y + k, (16 + Math.sin(t * 4) * 1.5) * k, 4 * k, 0, 0, TAU); g.stroke(); g.restore();
      [[-13, -26], [13, -26], [-6, -18], [7, -18]].slice(0, P.calm ? 2 : 4).forEach(([dx, dy], i) => { const ph = ((t + i * 0.23) % 0.9) / 0.9; T.SH.drop(g, x + dx * k, y + dy * k + ph * ph * (-dy) * k * 0.95, 3.2 * k * (1 - ph * 0.3), R, 0); });
      for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i / 3) % 1; g.save(); g.globalAlpha *= 1 - ph; g.strokeStyle = R[0]; g.lineWidth = 1.2 * k; g.beginPath(); g.ellipse(x + (i - 1) * 7 * k, y + k, 3 * k * (1 + ph * 2), k * (1 + ph * 2), 0, 0, TAU); g.stroke(); g.restore(); } },
    rooted(g, x, y, k, t, P) { const R = EL.nature.ramp; g.save(); g.lineCap = 'round'; [-5, 5].forEach((fx, j) => { for (let v = 0; v < 2; v++) { g.strokeStyle = R[v ? 3 : 4]; g.lineWidth = (v ? 1.2 : 2.2) * k; g.beginPath();
        for (let s = 0; s <= 20; s++) { const u = s / 20, a = u * TAU * 1.5 + j + v * 0.6, h = u * 14 * k * outQ(t / 0.25); g.lineTo(x + fx * k + Math.cos(a) * 5 * k, y - h + Math.sin(a) * 1.6 * k); } g.stroke(); } });
      g.restore(); [[-9, -10], [9, -12], [0, -16]].slice(0, P.calm ? 1 : 3).forEach(([dx, dy], i) => T.SH.leaf(g, x + dx * k, y + dy * k * outQ(t / 0.3), 3.2 * k, R, (dx < 0 ? -0.8 : 0.8) + Math.sin(t * 3 + i) * 0.2)); },
    dizzy(g, x, y, k, t, P) { const R = STONE.ramp, cy = y - 86 * k, n = P.calm ? 2 : 3; g.save(); g.strokeStyle = rgba(R[3], 0.6); g.lineWidth = k; g.setLineDash([2 * k, 3 * k]); g.beginPath(); g.ellipse(x, cy, 18 * k, 5 * k, 0, 0, TAU); g.stroke(); g.restore();
      for (let i = 0; i < n * 2; i++) { const a = t * 4.2 + i / (n * 2) * TAU, px = x + Math.cos(a) * 18 * k, py = cy + Math.sin(a) * 5 * k, s = Math.sin(a) > 0 ? 1 : 0.75; if (i % 2) T.SH.star4(g, px, py, 5.5 * k * s, GOLD, a); else pebble(g, px, py, 3.2 * k * s, R, a, i); } },
    pushed(g, x, y, k, t, P) { const R = WIND.ramp, dir = P.dir || 1, q = clamp(t / 0.45, 0, 1); for (let i = 0; i < (P.calm ? 3 : 5); i++) { const yy = y - (12 + i * 11) * k, L = (24 - i * 2) * k * (1 - q * 0.6); g.save(); g.globalAlpha *= 1 - q * 0.7; speed(g, x - dir * (14 + (i % 2) * 6) * k, yy, L, R, dir > 0 ? 0 : Math.PI, 1.8 * k); g.restore(); }
      curl(g, x - dir * 22 * k, y - 30 * k, 6 * k, R, dir > 0 ? Math.PI : 0, clamp(q * 2, 0.3, 1)); dustArc(g, x - dir * 8 * k, y, 10 * k, Math.PI * 0.85, Math.PI * 1.15, STONE.ramp, 3.5 * k, 1 - q); },
    dazzled(g, x, y, k, t, P) { [[-30, -66], [30, -70], [-24, -84], [26, -88]].slice(0, P.calm ? 2 : 4).forEach(([dx, dy], i) => { const ph = (t * 1.6 + i * 0.27) % 1, s = 7 * k * (0.35 + 0.65 * Math.sin(ph * Math.PI));
        T.SH.star4(g, x + dx * k, y + dy * k, s, GOLD, ph * 1.6); T.SH.star4(g, x + dx * k, y + dy * k, s * 0.45, ['#FFFFFF', '#FFFFFF'], ph * 1.6); if (s > 2 * k) T.glow(g, x + dx * k, y + dy * k, s * 2.2, '#FFE066', 0.6); }); },
    hushed(g, x, y, k, t, P) { const R = EL.shadow.ramp, cy = y - 88 * k; for (let i = 0; i < 3; i++) { const ph = (t * 0.5 + i / 3) % 1; g.save(); g.globalAlpha *= Math.sin(ph * Math.PI) * 0.9; T.SH.wisp(g, x + (i - 1) * 18 * k, y - (30 + ph * 14) * k, 7 * k, R); g.restore(); }
      g.save(); g.fillStyle = rgba(R[3], 0.9); for (let i = 0; i < 3; i++) { const a = Math.PI + i * Math.PI / 2 + 0.1 * Math.sin(t * 3); g.beginPath(); g.arc(x + Math.cos(a) * 9 * k, cy + Math.sin(a) * 4 * k + 4 * k, 1.8 * k, 0, TAU); g.fill(); }
      g.strokeStyle = R[4]; g.lineWidth = 1.6 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 6 * k, cy - 2 * k); g.lineTo(x + 6 * k, cy + 6 * k); g.stroke(); g.restore(); T.SH.star4(g, x + 14 * k, cy - 6 * k, 3 * k, R, t); }
  };
  const ST_EL = {soaked: 'water', rooted: 'nature', dizzy: 'stone', pushed: 'wind', dazzled: 'light', hushed: 'shadow'}, ST_MS = {soaked: 900, rooted: 900, dizzy: 900, pushed: 450, dazzled: 700, hushed: 900};
  Object.keys(ST).forEach(n => M.fxAdd(n, {el: ST_EL[n], life: 1, loop: true, draw(g, P, t) { ST[n](g, P.x, P.y, P.k, t, P); }}, {status: n, ms: ST_MS[n], hitOf: ST_EL[n]}));
  Object.assign(M, {VERSION: 'mo-8', itemAura, bladeOf, STATUSES: ['toasty', 'zapped'].concat(Object.keys(ST)), EL_SHAPES: {pebble, curl, ribbon, speed, dustArc}});
})();

// ======================= 🫁 mo-9 (🎬 Motion chat, 2026-11-20): Motion.alive — stand + breathe · heavy things take a moment · walk / run by weight · a little idle story · weapon gimmicks (Motion rules §28–29) =======================
/* A = Motion.alive(who, {place: 'battle' | 'map' | 'menu' | 'card', seed, calm, stance: 'relax' | 'ready', t0})
     each frame  Acting.draw(g, who, x, y, k, A.at(t), {hang, view, aura})      — a normal frame (pose · face · marks); _mo.poseAt feeds 🧣 hang
     any input   A.poke(t)                    — the moment eases out (light 120 · medium 180 · heavy 250 ms; a planted heavy item = the 900 ms lift); the story starts again at 🙂
     stance      A.stance('ready' | 'relax' | 'plant', t)   — light 180 · medium 320 · heavy 900 up / 600 down (sag → heave → overshoot → wobble · drop → THUD → knees give)
     moving      A.moving('walk' | 'run' | false, t)        — the gait acts the weight (speed is the game's): light swings · medium keeps the shield up · heavy trudges with the load bouncing on the shoulder; stopping = the load swings on and settles
     jump        A.jump(t, {air, lift})        — 🦘 (Aowu 09:10) the jump starts AT ONCE (fair, M4); in the air the knees tuck and the load lags (a heavy one dips on the way up, swings up late);
                                               landing squash + hold + recover by weight (light 6 % · 60 / 180 ms · medium 10 % · 90 / 260 · heavy 16 % · 140 / 420 + THUD) — the game moves the real height
     read        A.state(t) → {stage, moment, moving, thud, breath} · A.on('thud', fn) (called once per thud from at())
   Idle story (clock = since the last input / stop): 🙂 settle 0–3 s → 👀 curious 3–12 → 🤹 fidget 12–30 (YOUR weapon's 3–5 gimmicks) → 🥱 bored 30–60 → 😴 doze 60+ → startle → 👀 again.
   A shuffle bag per stage, never the same moment twice in a row; places: battle = 👀 only (+ battle-safe gimmicks) · map = up to 🥱 · menu / card = all.
   Weapon gimmicks: Motion.GIMMICKS[typeId] (≈ 50 Avateer types — the ones AvatarWeapons does not draw yet wait for their type id) · Motion.GIM (the shared gesture library) · Motion.gearOf(who).
   Motion.idle (mo-3) is unchanged — games switch to Motion.alive in their own rounds. */
(function () {
  const M = window.Motion; if (!M) return;
  const TAU = Math.PI * 2, cl = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, u) => a + (b - a) * u;
  const hsh = (s, i) => { let h = 2166136261 ^ Math.imul(i | 0, 374761393); for (let j = 0; j < s.length; j++) h = Math.imul(h ^ s.charCodeAt(j), 16777619); h ^= h >>> 13; h = Math.imul(h, 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const E = {sio: u => 0.5 - 0.5 * Math.cos(Math.PI * cl(u, 0, 1)), co: u => 1 - Math.pow(1 - cl(u, 0, 1), 3), qi: u => cl(u, 0, 1) ** 2,
    cio: u => { u = cl(u, 0, 1); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }, bo: u => { u = cl(u, 0, 1); const c = 1.4; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); }};

  // ---------- ⚖️ gear: what the hands hold → weight + hold style (ids = AvatarWeapons type ids; the Avateer §17e / 17e-2 types not drawn yet use these ids too) ----------
  const W8 = {heavy: 'greatsword odachi greathammer wok mechaarm knuckles greathorn', medium: 'shield potlid gadget can longspear naginata bo greatstaff rake scroll mace yumi compoundbow twinmaces handdrum'};
  const STYLE = {blade: 'sword katana kunai knife moonblade spatula', great: 'greatsword odachi', pole: 'longspear naginata bo greatstaff rake shortspear scroll', bow: 'shortbow yumi compoundbow crossbow slingshot',
    fist: 'knuckles auragloves dragonclaws katar', heavyhead: 'greathammer wok mechaarm mace', twin: 'twinblades twinwands twinladles twinshears boomerangs flashcards bubbleblasters twindaggers twinsticks twinmaces nito twinbells'};
  const lookup = src => { const o = {}; for (const k in src) src[k].split(' ').forEach(id => { if (!o[id]) o[id] = k; }); return o; };
  const WOF = lookup(W8), SOF = lookup(STYLE);
  const ALIAS = {};   // a renamed AvatarWeapons id → the id used here (Motion.GIMMICK_ALIAS)
  function gearOf(who) {
    const eq = (who && who.av && who.av.eq) || {}, AW = window.AvWeapons, h = eq.hand, o = eq.off;
    const I = h && h.id === 'weapon' && AW ? AW.info(h.v) : null, J = o && o.id === 'weapon' && AW ? AW.info(o.v) : null;
    const id = I ? (ALIAS[I.id] || I.id) : h ? 'item' : 'none', off = J ? (ALIAS[J.id] || J.id) : null;
    const w = WOF[id] || (off && WOF[off] === 'medium' ? 'medium' : 'light');
    return {id, off, fam: I ? I.fam : null, w, style: SOF[id] || (id === 'none' ? 'none' : 'blade'), two: !!(I && I.hand === 'two')};
  }

  // ---------- pose code: 'aR1.2 eR.6 h-.4 fc:curious fe:closed/whistle hR:open mk:notes' ----------
  const CODE = {aR: 'armR', aL: 'armL', eR: 'elbowR', eL: 'elbowL', h: 'holdRot', wR: 'wristR', wL: 'wristL', nd: 'nod', nt: 'neckTilt', nT: 'neckTurn', tw: 'twist', sL: 'shrugL', sR: 'shrugR',
    b: 'bend', r: 'rot', dy: 'dy', sy: 'sy', sx: 'sx', kL: 'kneeL', kR: 'kneeR', fL: 'footL', fR: 'footR', lL: 'legL', lR: 'legR'};
  const PC = new Map();
  function pc(s) {
    if (PC.has(s)) return PC.get(s); const P = {}, mk = [];
    (s || '').split(' ').forEach(t => { if (!t) return; const i = t.indexOf(':');
      if (i > 0) { const k = t.slice(0, i), v = t.slice(i + 1); if (k === 'fc') P.face = v; else if (k === 'fe') { const q = v.split('/'); P.face = {eyes: q[0]}; if (q[1]) P.face.mouth = q[1]; } else if (k === 'hR') P.handR = v; else if (k === 'hL') P.handL = v; else if (k === 'mk') v.split('+').forEach(x => mk.push(x)); return; }
      const m = /^([a-zA-Z]+)(-?\d*\.?\d+)$/.exec(t); if (m && CODE[m[1]]) P[CODE[m[1]]] = +m[2]; });
    const r = {P, mk}; PC.set(s, r); return r;
  }
  // a gesture = 'ms|code;ms|code;…' (the last key = back to the stance) · flags in the code: dn (put the item down — heavy timing) · up (pick it up)
  function keysOf(src) { return src.split(';').map(k => { const i = k.indexOf('|'), ms = +k.slice(0, i), c = k.slice(i + 1); const fl = {dn: / ?\bdn\b/.test(c), up: / ?\bup\b/.test(c)}; const q = pc(c.replace(/ ?\b(dn|up)\b/g, '').trim()); return {ms, pose: q.P, marks: q.mk, dn: fl.dn, up: fl.up}; }); }

  // ---------- 🧍 stances (by weight · hold style) ----------
  const ST = {
    relax: {none: 'aR.12 aL.1 eR.12 eL-.1', light: 'aR.18 aL.1 eL-.1 h2.5', medium: 'aR.16 aL.14 eL-.12 h2.3', heavy: 'aR.35 eR.5 h2.5 aL.1',
      pole: 'aR.3 eR.4 h.05 aL.1', bow: 'aR.2 aL.1 h2.7', fist: 'aR.25 eR.5 aL.25 eL-.5', heavyhead: 'aR.35 eR.5 h2.6 aL.1'},   // a heavy load hangs low (on the shoulder it hid the face — R4)
    ready: {none: 'aR.6 eR1.4 aL-.5 eL-1.4 kL.12 kR.12', light: 'aR.9 eR.6 h.15 aL-.4 eL-1.2 kL.15 kR.15', medium: 'aR.8 eR.6 h.2 aL-.3 kL.15 kR.15', heavy: 'aR1 eR.6 h.1 aL-.3 eL-.5 kL.2 kR.2',
      pole: 'aR.9 eR.5 h.6 aL-.4 eL-.8 kL.18 kR.18', bow: 'aR1.3 eR.2 h.1 aL-.6 eL-1.6 kL.12 kR.12', fist: 'aR.7 eR1.6 aL-.6 eL-1.6 kL.18 kR.18'},
    plant: {heavy: 'aR.55 eR.5 aL-.4 eL-.6 h2.9', heavyhead: 'aR.5 eR.5 aL-.4 eL-.6 h3', pole: 'aR.3 eR.3 h0'}};
  const stanceKey = g => g.id === 'none' ? 'none' : (g.style === 'pole' || g.style === 'bow' || g.style === 'fist' || g.style === 'heavyhead') ? g.style : g.w;
  function stancePose(name, g) { const S = ST[name] || ST.relax, k = stanceKey(g); return Object.assign({}, pc(S[k] || S[g.w] || S.light || ST.relax.light).P); }
  const plantable = g => g.w === 'heavy';

  // ---------- 🏋️ how long a pose change takes, by weight ----------
  const CHANGE = {light: {up: 180, down: 180, out: 120, stop: 220, start: 120}, medium: {up: 320, down: 320, out: 180, stop: 320, start: 180}, heavy: {up: 900, down: 600, out: 250, stop: 600, start: 300}};
  function heavyLift(u) {
    if (u < 0.18) { const s = E.sio(u / 0.18); return {w: -0.06 * s, x: {kneeL: 0.3 * s, kneeR: 0.3 * s, bend: 0.1 * s, dy: 2.4 * s}}; }
    if (u < 0.62) { const s = E.cio((u - 0.18) / 0.44); return {w: lerp(-0.06, 1.08, s), x: {kneeL: 0.3 * (1 - s), kneeR: 0.3 * (1 - s), bend: lerp(0.1, -0.06, s), dy: 2.4 * (1 - s)}}; }
    if (u < 0.8) { const s = E.sio((u - 0.62) / 0.18); return {w: lerp(1.08, 0.98, s), x: {bend: lerp(-0.06, 0, s)}}; }
    const s = (u - 0.8) / 0.2; return {w: lerp(0.98, 1, E.sio(s)), x: {wristR: 0.06 * Math.sin(s * TAU * 2) * (1 - s), dy: 0.8 * Math.sin(s * Math.PI)}};
  }
  function heavyLower(u) {
    if (u < 0.2) { const s = E.sio(u / 0.2); return {w: -0.05 * s, x: {bend: -0.03 * s}}; }
    if (u < 0.5) { const s = E.qi((u - 0.2) / 0.3); return {w: lerp(-0.05, 1, s), x: {bend: lerp(-0.03, 0.06, s)}}; }
    if (u < 0.75) { const s = Math.sin(((u - 0.5) / 0.25) * Math.PI * 0.5); return {w: 1, thud: true, x: {kneeL: 0.16 * (1 - s * 0.4), kneeR: 0.16 * (1 - s * 0.4), sy: 1 - 0.016 * (1 - s), dy: 1.6 * (1 - s * 0.5), bend: 0.06}}; }
    const s = E.sio((u - 0.75) / 0.25); return {w: 1, x: {kneeL: 0.1 * (1 - s), kneeR: 0.1 * (1 - s), dy: 0.8 * (1 - s), bend: 0.06 * (1 - s)}};
  }
  function changeAt(w, dir, u) { if (w === 'heavy') return dir === 'down' ? heavyLower(u) : heavyLift(u); if (w === 'medium') return {w: E.bo(u) * 0.97 + 0.03 * u, x: {}}; return {w: E.co(u), x: {}}; }

  // ---------- pose maths ----------
  const NUMK = ['armL', 'armR', 'elbowL', 'elbowR', 'kneeL', 'kneeR', 'footL', 'footR', 'legL', 'legR', 'holdRot', 'wristL', 'wristR', 'nod', 'neckTilt', 'neckTurn', 'twist', 'shrugL', 'shrugR', 'bend', 'rot', 'dy', 'sx', 'sy'];
  const ONE = {sx: 1, sy: 1};
  function blend(A, B, u) { const P = {}; for (const k of NUMK) { const a = A[k], b = B[k]; if (a == null && b == null) continue; const d = ONE[k] || 0; P[k] = (a == null ? d : a) + ((b == null ? d : b) - (a == null ? d : a)) * u; }
    for (const k of ['face', 'handL', 'handR']) { const v = u < 0.5 ? A[k] : B[k]; if (v != null) P[k] = v; } return P; }
  function add(P, X) { for (const k in X) { if (k === 'sy' || k === 'sx') P[k] = (P[k] == null ? 1 : P[k]) * X[k]; else P[k] = (P[k] || 0) + X[k]; } return P; }

  // ---------- 🫁 breath (2.6–3.4 s each, a sigh ~1 in 6) · 👀 blink (2.2–5.5 s, 1 in 5 double) · ⚖️ weight shift (5–9 s) ----------
  const BC = new Map();
  function breathAt(t, seed, fast) {
    t = Math.max(0, t); let C = BC.get(seed); if (!C) BC.set(seed, C = [0]); let i = 0;
    if (C.length > 2) { let lo = 0, hi = C.length - 2; if (t >= C[hi]) i = hi; else { while (lo < hi) { const m = (lo + hi + 1) >> 1; if (C[m] <= t) lo = m; else hi = m - 1; } i = lo; } }
    while (true) { if (C[i + 1] == null) { const s = hsh('b' + seed, i) < 0.16 && i > 1; C[i + 1] = C[i] + (2.6 + 0.8 * hsh('d' + seed, i)) * (s ? 1.5 : 1); } if (t < C[i + 1]) break; i++; }
    const sigh = hsh('b' + seed, i) < 0.16 && i > 1, u = (t - C[i]) / (C[i + 1] - C[i]), b = u < 0.4 ? E.sio(u / 0.4) : u < 0.45 ? 1 : 1 - E.sio((u - 0.45) / 0.55);
    return {b: b * (sigh ? 1.8 : 1), sigh, i, u, d: C[i + 1] - C[i]};
  }
  function blinkAt(t, seed) { let c = 0.8 + hsh('k' + seed, 0) * 2, i = 0; if (t > 600) { const n = Math.floor((t - 600) / 3.85); c += n * 3.85; i = n; }
    while (c <= t) { const dbl = hsh('kd' + seed, i) < 0.2, e = c + 0.11 + (dbl ? 0.29 : 0); if (t < e) return (t - c) < 0.11 || (dbl && t - c > 0.18) ? 1 : 0; c += 2.2 + 3.3 * hsh('k' + seed, i + 1); i++; } return 0; }
  function shiftAt(t, seed, w) {
    let c = 0, i = 0, side = hsh('s' + seed, 0) < 0.5 ? 1 : -1, prev = 0; const tr = w === 'heavy' ? 1.0 : 0.7; if (t > 600) { const n = 2 * Math.floor((t - 600) / 14); c = n * 7; i = n; }
    while (true) { const d = 5 + 4 * hsh('s' + seed, i + 1); if (t < c + d) break; c += d; prev = side; side = -side; i++; }
    const s = i === 0 ? side * E.sio((t - c) / tr) : lerp(prev, side, E.cio((t - c) / tr));
    return {kneeR: Math.max(0, s) * 0.26, kneeL: Math.max(0, -s) * 0.26, rot: s * 0.022, neckTilt: -s * 0.04, twist: s * 0.03};
  }

  // ---------- 📖 the idle story: generic moments (any gear) ----------
  const GEN = {
    glance: [1, 'b', '260|nT-.4 fe:side;520|nT-.4 fe:side;300|nT.35;500|nT.35;260|'],
    lookUp: [1, '', '320|nd-.26 nt.12 fe:up;900|nd-.28 nt.14 fc:curious mk:birds;300|'],
    hum: [1, '', '300|r.04 nt.14 fe:closed/whistle mk:notes;450|r-.04 nt-.14 fe:closed/whistle mk:notes;450|r.04 nt.14 fe:closed/whistle mk:notes;300|'],
    bounce: [1, 'b', '160|kL.22 kR.22 dy2;160|dy-2 fL-.2 fR-.2;160|kL.22 kR.22 dy2;160|dy-2 fL-.2 fR-.2;200|'],
    stretch: [2, 'L', '380|aR2.95 aL2.95 eR-.25 eL.25 sy1.03 nd-.12;500|aR2.95 aL2.95 eR-.25 eL.25 sy1.035 nd-.14 fc:content;420|'],
    wave: [2, '', '240|aL-2.6 eL-.5 hL:open fc:delighted;180|aL-2.6 eL-.8 wL-.5 hL:open fc:delighted;180|aL-2.6 eL-.3 wL.4 hL:open fc:delighted;180|aL-2.6 eL-.8 wL-.5 hL:open fc:delighted;280|'],
    yawn: [3, 'L', '380|aR2.7 aL2.7 eR.6 eL-.6 nd-.2 fe:closed/O sy1.02;700|aR2.7 aL2.7 eR.6 eL-.6 nd-.22 fe:closed/O sy1.03;420|fc:tired'],
    sigh: [3, '', '500|sL.7 sR.7 nd-.1 sy1.02 fc:bored;260|sL.7 sR.7 nd-.1 fc:bored;700|nd.16 sy.985 b.06 fc:bored;300|'],
    tap: [3, 'L', '200|aL-.5 eL-1.8 aR.5 eR1.8 fc:bored;140|aL-.5 eL-1.8 aR.5 eR1.8 fR-.6 kR.15 fc:bored;140|aL-.5 eL-1.8 aR.5 eR1.8 fc:bored;140|aL-.5 eL-1.8 aR.5 eR1.8 fR-.6 kR.15 fc:bored;140|aL-.5 eL-1.8 aR.5 eR1.8 fc:bored;300|'],
    shoulderRoll: [3, 'H', '300|sR.8 nt-.12;300|sR.2 sL.6 nt.12;300|sR.7 nt-.1 fc:bored;400|'],
    shade: [3, 'L', '320|aL-2.3 eL-1.9 hL:open nd-.15 fe:side;700|aL-2.3 eL-1.9 hL:open nd-.15 nT.3 fe:side;320|'],
    doze: [4, '', '1400|nd.3 nt.18 b.08 kL.12 kR.12 fc:sleepy mk:zzz;2600|nd.36 nt.22 b.1 kL.14 kR.14 fc:sleepy mk:zzz;90|nd-.12 dy-5 fc:shock sL.8 sR.8 mk:exclaim;500|nd-.05 dy-1 fc:embarrassed mk:exclaim;400|fc:silly']};
  // flags: b = battle-safe · L = not with a heavy load · H = heavy load only
  // ---------- 🗡️ the shared gesture library for weapon gimmicks (each type picks 3–5 below — Aowu 2026-11-20 09:00 "3–5 random proper gestures for each type") ----------
  const GIM = {
    // blades
    twirl: 'b|160|aR1.1 eR.3 h.4;150|aR1.2 eR.2 h2.2 wR.4 mk:sparkles;150|aR1.2 eR.2 h4.3 wR-.2;200|aR1 eR.4 h6.4 fc:proud;260|',
    flip: '|200|aR1.1 eR.3 h.4 kL.15 kR.15;160|aR1.7 eR.1 h3.4 dy-2 mk:sparkles;160|aR1.5 eR.1 h6.4 dy-2;220|aR1 eR.4 h6.48 fc:proud;320|',
    polish: '|260|aR.9 eR.5 h1.25 aL-1.3 eL-.9 nd.18;260|aR.9 eR.5 h1.25 aL-.9 eL-1.5 nd.18;260|aR.9 eR.5 h1.25 aL-1.3 eL-.9 nd.18;320|aR1.6 eR.2 h.1 aL.1 fc:proud mk:sparkles;500|aR1.6 eR.2 h.1 fc:proud mk:sparkles;300|',
    edgeLook: '|300|aR1.3 eR.9 h-.6 nd.1 nT.3 fe:side;600|aR1.3 eR.9 h-.6 nd.1 nT.35 fc:focused;300|',
    salute: 'b|280|aR1.2 eR1.9 h0 nd.06 fc:focused;600|aR1.2 eR1.9 h0 nd.1 fc:brave;300|',
    sheathe: '|260|aR.4 eR1.4 h2.8 tw.15;220|aR.2 eR1 h3.1 tw.15 mk:sparkles;300|aR.3 eR.4 h2.9 tw.05 fc:content;300|',
    quickDraw: 'b|220|aR.3 eR1.3 h2.9 b.08 tw.2 kL.2 kR.2 fc:focused;120|aR1.7 eR.1 h.2 tw-.15 mk:sparkles;400|aR1.6 eR.2 h.2 tw-.1 fc:brave;300|',
    hamon: '|300|aR1 eR1.1 h-.9 nd.16 aL-1.2 eL-1;700|aR1 eR1.1 h-.9 nd.2 aL-1.2 eL-1 fc:amazed mk:sparkles;300|',
    // great / heavy
    plantLean: '|600|dn;2600|b.12 r.04 kL.22 fc:content;900|up',
    heft: '|300|kL.25 kR.25 dy2 b.06 aR.4 eR1.5 h-.4;260|aR.45 eR1.6 h-.3 dy-1 fc:proud;220|aR.4 eR1.5 h-.45 wR.06;360|',
    groundTap: '|600|dn;300|aR.6 eR.6 h2.8 dy-1;160|aR.55 eR.5 h2.9 mk:notes;300|aR.6 eR.6 h2.8 dy-1;160|aR.55 eR.5 h2.9 mk:notes;900|up',
    flex: 'H|300|aL-2.2 eL-2.3 hL:fist sL.4 fc:proud;500|aL-2.2 eL-2.5 hL:fist sL.5 nT-.3 fc:proud mk:sparkles;300|',
    // poles
    poleSpin: '|200|aR1.2 eR.4 h.6 kL.15 kR.15;180|aR1.3 eR.3 h2.2 mk:sparkles;180|aR1.3 eR.3 h3.9;180|aR1.2 eR.4 h5.6;240|aR1 eR.4 h6.88 fc:proud;260|',
    poleLean: '|300|aR.5 eR.6 h-.2 b.06 r.05 kR.2 nt.12;1200|aR.5 eR.6 h-.2 b.08 r.06 kR.22 nt.14 fc:content;300|',
    tasselFlick: 'b|200|aR1 eR.4 h.4 wR.4;140|aR1 eR.4 h.3 wR-.4 mk:sparkles;140|aR1 eR.4 h.4 wR.4;240|',
    poleStamp: '|240|aR.4 eR.4 h0 dy-3;140|aR.35 eR.35 h0 dy1 kL.12 kR.12 mk:notes;300|aR.35 eR.4 h0 fc:proud;260|',
    hookPull: '|260|aR1.4 eR.2 h.9 nT.3 fe:side;300|aR.9 eR1.2 h.5 b-.05 mk:sparkles;300|',
    // bows
    stringCheck: '|300|aR1.3 eR.3 h.1 aL-.9 eL-1.2 nd.12 nT.25;160|aR1.3 eR.3 h.1 aL-.7 eL-1.5 nd.12 nT.3 mk:notes;160|aR1.3 eR.3 h.1 aL-.9 eL-1.2 nd.12 nT.3 fe:closed;160|aR1.3 eR.3 h.1 aL-.7 eL-1.5 mk:notes fe:closed/smile;400|nd.1 fc:content;260|',
    sight: 'b|300|aR1.5 eR.1 h0 aL-1.3 eL-2 nT.35 fe:slit;600|aR1.5 eR.1 h0 aL-1.3 eL-2.1 nT.4 fc:focused;300|',
    nock: '|260|aL-1.1 eL-1.6 nd.12 aR1.2 eR.3 h.1;220|aL-1.3 eL-1.9 nd.14 aR1.2 eR.3 h.1 mk:sparkles;400|aL-1.6 eL-2.3 aR1.4 eR.1 h0 fc:focused;300|',
    bowRest: '|320|aR.4 eR.2 h2.7 r.03 nt.1;900|aR.35 eR.2 h2.8 r.04 nt.12 fc:content mk:notes;300|',
    windTest: '|300|aL-2.4 eL-.3 hL:point nd-.1 fe:up;600|aL-2.5 eL-.2 hL:point nd-.14 nT.2 fc:thinking;300|',
    reload: 'b|220|aR.6 eR1.4 h1.1 aL-.8 eL-1.6 nd.15;200|aR.6 eR1.4 h1.1 aL-.6 eL-1.2 nd.15 mk:notes;260|aR1 eR.6 h.3 fc:focused;260|',
    // fists
    knuckleCrack: '|240|aR.9 eR2 aL-.9 eL-2 hR:fist hL:fist nd.1;120|aR.95 eR2.2 aL-.95 eL-2.2 hR:fist hL:fist mk:notes;120|aR.9 eR2 aL-.9 eL-2;260|fc:brave',
    shadowBox: 'b|140|aR1.4 eR.3 aL-.6 eL-1.7 hR:fist hL:fist kL.15 kR.15;140|aR.6 eR1.7 aL-1.4 eL-.3 hR:fist hL:fist;140|aR1.4 eR.3 aL-.6 eL-1.7 hR:fist hL:fist;240|kL.1 kR.1 fc:brave',
    clawFlex: '|240|aR1.4 eR1 hR:open wR.4 nd.08;300|aR1.5 eR.9 hR:open wR-.3 fc:sneaky mk:sparkles;240|',
    auraPuff: '|260|aR1 eR1.4 aL-1 eL-1.4 hR:open hL:open nd.1;300|aR1.1 eR1.3 aL-1.1 eL-1.3 hR:open hL:open fc:amazed mk:sparkles;300|',
    // tools / magic / music
    wandDoodle: '|240|aR1.8 eR.3 wR.4;220|aR2.1 eR.1 wR-.3 mk:sparkles;220|aR1.6 eR.5 wR.5 mk:sparkles;220|aR2 eR.2 wR-.2 fc:delighted mk:sparkles;300|',
    orbGaze: '|300|aL-1.1 eL-1.6 nd.18 fe:wide;700|aL-1.2 eL-1.7 nd.2 fc:amazed mk:sparkles;300|',
    spinItem: 'b|200|aR1.2 eR.6 h.3;180|aR1.3 eR.5 h3.3 mk:sparkles;200|aR1.2 eR.6 h6.58 fc:silly;260|',
    tasteTest: '|280|aR1.6 eR1.9 h-1.1 nd.05;300|aR1.7 eR2 h-1.2 nd.08 fe:closed/cat mk:hearts;400|fc:content',
    flipCatch: '|200|aR1 eR.6 h.5 nd-.1;180|aR1.4 eR.3 h1 nd-.25 fe:up mk:sparkles;200|aR1 eR.6 h.5 dy1 fc:delighted;260|',
    waterPlants: '|300|aR.9 eR.4 h1.4 nd.2 b.06;700|aR.9 eR.4 h1.7 nd.22 b.08 fc:content mk:sparkles;300|',
    seedToss: '|240|aL-.8 eL-1.6 nd.15;200|aL-1.9 eL-.4 hL:open nd-.1 mk:sparkles;300|aL-1.6 eL-.5 hL:open fc:delighted;260|',
    pageFlip: '|300|aR1 eR1.7 aL-1 eL-1.7 nd.22;200|aR1 eR1.7 aL-.8 eL-1.4 wL.3 nd.22 mk:sparkles;400|aR1 eR1.7 aL-1 eL-1.7 nd.24 fc:thinking;260|',
    scribble: '|260|aL-1 eL-1.8 nd.2 aR.9 eR1.6;160|aL-1.05 eL-1.7 wL.3 nd.2;160|aL-1 eL-1.8 wL-.3 nd.2;160|aL-1.05 eL-1.7 wL.3 nd.2 fc:focused;300|',
    tinker: '|260|aR1 eR1.6 h.6 nd.2 aL-1 eL-1.7;160|aR1 eR1.6 h1.2 wR.4 nd.2 mk:notes;160|aR1 eR1.6 h.6 wR-.4 nd.2;300|aR1.2 eR1 h.4 fc:proud mk:sparkles;260|',
    tune: '|300|aR1.4 eR1.9 h-1.5 nd-.05 fe:closed/whistle mk:notes;500|aR1.4 eR1.9 h-1.5 r.04 fe:closed/whistle mk:notes;300|',
    drumPat: '|160|aL-.9 eL-1.5 aR1 eR1.5 h.8;120|aR1.1 eR1.3 h.6 mk:notes;120|aR1 eR1.5 h.8;120|aR1.1 eR1.3 h.6 mk:notes;300|fc:content',
    bellRing: '|200|aR1.6 eR.4 wR.4;140|aR1.6 eR.4 wR-.4 mk:notes;140|aR1.6 eR.4 wR.4 mk:notes;300|',
    // dual
    clackTwin: 'b|200|aR1.2 eR.8 aL-1.2 eL-.8 h.3;120|aR1.3 eR.7 aL-1.3 eL-.7 mk:sparkles;120|aR1.2 eR.8 aL-1.2 eL-.8;260|fc:proud',
    juggle: '|200|aR1.2 eR.6 h.3 nd-.15;180|aR1.4 eR.3 h3.4 dy-1 fe:up;180|aR1.2 eR.6 h6.58 mk:sparkles;260|fc:silly',
    crossGuard: 'b|260|aR1.3 eR1.1 aL-1.3 eL-1.1 h-.7 kL.15 kR.15 fc:focused;500|aR1.3 eR1.1 aL-1.3 eL-1.1 h-.7 kL.18 kR.18 fc:brave;260|',
    // off-hands
    shieldKnock: '|220|aR1.3 eR1.6 nd.12;120|aR1.15 eR1.9 nd.12 mk:notes;120|aR1.3 eR1.6;120|aR1.15 eR1.9 mk:notes;280|fc:content',
    shieldShine: '|280|aL-.6 eL-1.4 nd.15 aR1 eR1.7;400|aL-.6 eL-1.4 nd.15 aR1.1 eR1.5 wR.3 mk:sparkles;300|aL-.8 eL-1.6 fc:proud;260|',
    lanternUp: '|300|aL-2.3 eL-.4 nd-.12 fe:up;600|aL-2.4 eL-.3 nd-.16 nT.25 fc:curious mk:sparkles;300|',
    spyglass: '|300|aL-1.6 eL-2.4 nd-.05 nT.3 fe:slit;700|aL-1.6 eL-2.5 nT.4 fc:focused mk:question;300|',
    sayaCheck: '|260|aL-.4 eL-1.2 nd.25 nT-.2 fe:down;300|aL-.4 eL-1.2 wL.3 nd.25 fc:content;300|',
    smokePuff: '|200|aL-.7 eL-1.4 nd.1;160|aL-1.4 eL-.4 hL:open fe:side mk:steam;400|fc:sneaky;260|'};
  const GL = {}; for (const k in GIM) { const s = GIM[k], i = s.indexOf('|'); GL[k] = {flag: s.slice(0, i), keys: null, src: s.slice(i + 1)}; }
  // ---------- 🗡️ every Avateer weapon type → its 3–5 gimmicks (§17e + §17e-2 + §17e-3 ids; families fall back to their family list) ----------
  const GIMMICKS = {
    // 🗡️ Knight
    sword: 'twirl flip polish edgeLook salute', greatsword: 'plantLean heft polish groundTap flex', twinblades: 'clackTwin juggle crossGuard twirl', shield: 'shieldKnock shieldShine',
    // 🪄 Mage
    wand: 'wandDoodle twirl spinItem salute', orb: 'orbGaze', greatstaff: 'poleStamp poleLean wandDoodle poleSpin', twinwands: 'wandDoodle clackTwin juggle',
    // 🍳 Chef
    spatula: 'flipCatch tasteTest spinItem twirl', potlid: 'shieldKnock shieldShine', wok: 'tasteTest plantLean heft flipCatch', twinladles: 'drumPat tasteTest clackTwin juggle',
    // 🚿 Gardener
    can: 'waterPlants spinItem bowRest', seedpouch: 'seedToss', rake: 'poleLean poleStamp waterPlants poleSpin', twinshears: 'clackTwin juggle crossGuard',
    // 🏹 Ranger
    slingshot: 'stringCheck sight reload spinItem', lantern: 'lanternUp', shortbow: 'stringCheck nock sight bowRest windTest', boomerangs: 'juggle spinItem clackTwin sight',
    // 📖 Scholar
    book: 'pageFlip orbGaze tasteTest', quill: 'scribble', scroll: 'pageFlip poleStamp spinItem', flashcards: 'juggle pageFlip clackTwin',
    // 🔧 Inventor
    wrench: 'tinker spinItem flipCatch twirl', gadget: 'shieldKnock tinker', mechaarm: 'flex tinker plantLean heft', bubbleblasters: 'clackTwin juggle tinker spinItem',
    // 🥷 Ninja
    kunai: 'twirl flip quickDraw edgeLook', smokebombs: 'smokePuff', moonblade: 'twirl edgeLook polish salute', twindaggers: 'clackTwin juggle crossGuard twirl', knife: 'sayaCheck twirl', katar: 'shadowBox clawFlex knuckleCrack crossGuard',
    // 🥊 Brawler
    knuckles: 'knuckleCrack shadowBox flex crossGuard', auragloves: 'auraPuff shadowBox knuckleCrack', dragonclaws: 'clawFlex shadowBox knuckleCrack auraPuff',
    // 🔱 Lancer
    shortspear: 'twirl poleStamp sight flip', longspear: 'tasselFlick poleLean poleStamp sight', naginata: 'poleSpin hookPull poleLean polish', bo: 'poleSpin poleStamp poleLean flex', twinsticks: 'clackTwin drumPat crossGuard juggle',
    // 🎯 Sharpshooter
    crossbow: 'reload sight edgeLook bowRest', spyglass: 'spyglass', compoundbow: 'stringCheck nock sight windTest', yumi: 'stringCheck nock bowRest sight windTest',
    // ⚔️ Ronin
    katana: 'quickDraw sheathe hamon salute edgeLook', saya: 'sayaCheck', odachi: 'plantLean hamon heft salute', nito: 'crossGuard clackTwin quickDraw sheathe',
    // 🔨 Smasher
    mace: 'heft groundTap spinItem flex', greathammer: 'plantLean groundTap heft flex', twinmaces: 'drumPat clackTwin flex juggle',
    // 🎶 Summoner
    flute: 'tune spinItem bowRest', handdrum: 'drumPat', greathorn: 'tune plantLean heft', twinbells: 'bellRing drumPat juggle'};
  const FAMILY = {sword: 'twirl polish salute', wand: 'wandDoodle spinItem', spatula: 'flipCatch tasteTest spinItem'};
  M.GIMMICK_ALIAS = ALIAS;

  // ---------- the story of one idle spell: [start, end, key, stage] — a shuffle bag per stage, never the same moment twice in a row ----------
  const STAGE_AT = [0, 3, 12, 30, 60], STAGE = ['settle', 'curious', 'fidget', 'bored', 'doze'], GAP = [[0, 0], [2.5, 5], [3, 6], [4, 7], [0, 0]], PLACE_MAX = {battle: 1, map: 3, menu: 4, card: 4};
  const MOM = new Map();   // key → {st, flag, keys, len}
  function mom(key) { let m = MOM.get(key); if (m) return m;
    if (GEN[key]) { const [st, flag, src] = GEN[key]; m = {st, flag, keys: keysOf(src)}; }
    else if (key.startsWith('g:') && GL[key.slice(2)]) { const G = GL[key.slice(2)]; m = {st: 2, flag: G.flag, keys: keysOf(G.src)}; }
    if (!m) return null; m.len = m.keys.reduce((a, k) => a + k.ms, 0) / 1000; m.plant = m.keys.some(k => k.dn); MOM.set(key, m); return m; }
  function gimsOf(g) { const L = []; const add2 = s => (s || '').split(' ').forEach(n => { if (n && GL[n] && L.indexOf('g:' + n) < 0) L.push('g:' + n); });
    add2(GIMMICKS[g.id] || (g.fam && FAMILY[g.fam]) || ''); if (g.off) add2(GIMMICKS[g.off]); return L; }
  function fits(key, g, place) { const m = mom(key); if (!m) return false; const heavy = plantable(g);
    if (m.flag.indexOf('L') >= 0 && heavy) return false; if (m.flag.indexOf('H') >= 0 && !heavy) return false;
    if (m.plant && (!plantable(g) || place === 'battle')) return false; return true; }
  const SC = new Map();
  function story(seed, g, place, upto) {
    const ck = seed + '|' + g.id + '|' + g.off + '|' + place; let S = SC.get(ck); if (S && S.upto >= upto) return S.list;
    const maxSt = PLACE_MAX[place] || 4, out = [], bags = {}, gims = gimsOf(g); let c = 3, loop = 0, last = null, n = 0;
    const pool = st => { let L;
      if (st === 2) { L = gims.slice(); ['stretch', 'wave'].forEach(k => L.push(k)); }
      else L = Object.keys(GEN).filter(k => GEN[k][0] === st);
      if (place === 'battle') L = Object.keys(GEN).filter(k => GEN[k][0] === 1 && GEN[k][1].indexOf('b') >= 0).concat(gims.filter(k => mom(k).flag.indexOf('b') >= 0));
      return L.filter(k => fits(k, g, place)); };
    const pick = st => { let B = bags[st]; if (!B || !B.length) { const L = pool(st); if (!L.length) return null; B = bags[st] = L.slice(); for (let i = B.length - 1; i > 0; i--) { const j = Math.floor(hsh(seed + ':' + st, n * 31 + i) * (i + 1)); const x = B[i]; B[i] = B[j]; B[j] = x; } if (B[0] === last && B.length > 1) B.push(B.shift()); }
      if (B[0] === last) return null; n++; return B.shift(); };
    while (c < upto && out.length < 600) {
      let st = 0; for (let i = 1; i <= 4; i++) if (c - loop >= STAGE_AT[i]) st = i; st = Math.min(st, maxSt);
      const key = pick(st); if (!key) { c += 2; continue; }
      const d = mom(key).len; out.push([c, c + d, key, st]); last = key; c += d;
      if (key === 'doze') { loop = c - 3; c += 1.2; continue; }
      const G2 = GAP[Math.max(1, st)]; c += G2[0] + (G2[1] - G2[0]) * hsh('g' + seed, out.length);
    }
    SC.set(ck, {upto: c, list: out}); if (SC.size > 200) SC.delete(SC.keys().next().value); return out;
  }
  // where a moment is s seconds in → {P, marks, thud} · a 'dn' key puts the load down (heavy timing) and the keys after it stay planted until 'up'
  function momentAt(m, s, base, plantP) {
    let a = 0, prev = base, bb = base; const K = m.keys;
    for (let i = 0; i < K.length; i++) { const k = K[i], d = k.ms / 1000, last = i === K.length - 1; let tgt;
      if (k.dn) { bb = Object.assign({}, base, plantP); tgt = bb; } else if (k.up) { bb = base; tgt = base; }
      else if (last) tgt = k.pose.face ? Object.assign({}, base, {face: k.pose.face}) : base; else tgt = Object.assign({}, bb, k.pose);
      if (s < a + d || last) { const u = cl((s - a) / d, 0, 1);
        if (k.dn || k.up) { const C = changeAt('heavy', k.dn ? 'down' : 'up', u); return {P: add(blend(prev, tgt, C.w), C.x), marks: k.marks, thud: !!C.thud}; }
        return {P: blend(prev, tgt, E.sio(u)), marks: k.marks}; }
      a += d; prev = tgt; }
    return {P: base, marks: []};
  }

  // ---------- 🚶 walk / 🏃 run by weight (the game moves the avatar; this is only how the body + the load act) ----------
  function gait(mode, ph, g, base) {
    const P = Object.assign({}, base), heavy = plantable(g), run = mode === 'run', w = Math.sin(ph), c = Math.cos(ph);
    if (!run) {
      P.legL = w * (heavy ? 0.36 : 0.42); P.legR = -P.legL; P.kneeL = Math.max(0, -c) * (heavy ? 0.42 : 0.3) + (heavy ? 0.08 : 0); P.kneeR = Math.max(0, c) * (heavy ? 0.42 : 0.3) + (heavy ? 0.08 : 0);
      P.dy = -Math.abs(c) * (heavy ? 1.6 : 2.2) + (heavy ? Math.pow(Math.abs(w), 6) * 1.6 : 0);   // heavy: a little thump at each footfall
      P.armL = (g.off === 'shield' || g.off === 'potlid' || g.off === 'gadget') ? (base.armL || 0) + w * 0.05 : 0.12 - w * (g.two ? 0.12 : 0.35);
      if (g.id === 'none') { P.armR = 0.12 + w * 0.35; }
      else if (heavy) { P.holdRot = (base.holdRot || 0) + 0.13 * Math.sin(2 * ph - 0.9); P.armR = (base.armR || 0) + 0.06 * Math.sin(ph - 0.6); P.bend = (base.bend || 0) + 0.08; P.rot = (base.rot || 0) + 0.03; P.nod = 0.06; P.face = 'focused'; }
      else { P.armR = (base.armR || 0) + w * (g.w === 'medium' ? 0.1 : 0.2); P.holdRot = (base.holdRot || 0) + 0.12 * Math.sin(ph - 0.8); }
    } else {
      P.legL = w * 0.85; P.legR = -P.legL; P.kneeL = w < 0 ? -w * 1.3 : 0.2; P.kneeR = w > 0 ? w * 1.3 : 0.2; P.footL = w > 0 ? -0.2 : 0.3; P.footR = w < 0 ? -0.2 : 0.3;
      P.dy = -Math.abs(c) * 5; P.bend = (base.bend || 0) + (heavy ? 0.26 : 0.18); P.nod = -0.06;
      P.armL = (g.off === 'shield' || g.off === 'potlid' || g.off === 'gadget') ? -0.8 + w * 0.08 : -w * 0.9; P.elbowL = (g.off ? -1.6 : -1.5);
      if (g.id === 'none') { P.armR = w * 0.9; P.elbowR = 1.5; }
      else if (heavy) { P.armR = (base.armR || 0) + 0.2 + w * 0.12; P.elbowR = 0.8; P.holdRot = (base.holdRot || 0) - 0.3 + 0.25 * Math.sin(2 * ph - 1); P.face = 'focused'; P.armL = -0.5 - w * 0.4; }
      else { P.armR = 0.6 + w * 0.5; P.elbowR = 1.2; P.holdRot = (base.holdRot || 0) - 0.4 + 0.18 * Math.sin(ph - 0.8); }
    }
    return P;
  }

  // ---------- 🦘 jump by weight (overlay on whatever the body does; the game owns the real height) ----------
  const JUMP = {light: {land: 60, rec: 180, sq: 0.06, push: 70}, medium: {land: 90, rec: 260, sq: 0.10, push: 85}, heavy: {land: 140, rec: 420, sq: 0.16, push: 100}};
  function jumpAt(e, t, g, P0) {
    const J = JUMP[plantable(g) ? 'heavy' : g.w] || JUMP.light, air = e.air, dt = t - e.t, heavy = plantable(g), P = Object.assign({}, P0);
    if (dt < air) { const a = dt / air, pu = cl(dt / (J.push / 1000), 0, 1), tk = Math.sin(Math.PI * a), pz = J.push / 1000;
      const str = (heavy ? 0.03 : 0.06) * (dt < pz ? pu : Math.max(0, 1 - (dt - pz) / (air * 0.3)));   // 🫸 stretch out of the push, back to round by a third of the way up
      P.sy = (P0.sy == null ? 1 : P0.sy) * (1 + str); P.sx = (P0.sx == null ? 1 : P0.sx) * (1 - str * 0.5);
      if (e.lift) P.dy = (P0.dy || 0) - e.lift * tk;   // a page without its own height (menus · covers) lets the body rise — 🧣 cloth then feels the arc too
      P.kneeL = lerp(0.25, 0.85 * tk, pu); P.kneeR = lerp(0.25, 0.7 * tk, pu); P.legL = 0.3 * tk; P.legR = -0.15 * tk; P.footL = 0.2 * tk; P.footR = 0.2 * tk;
      P.armL = lerp(P0.armL || 0, -(1.4 - 1.8 * a), pu); P.elbowL = -0.5;
      if (g.id === 'none') { P.armR = lerp(P0.armR || 0, 1.4 - 1.8 * a, pu); P.elbowR = 0.5; }
      else { const lag = Math.sin(Math.PI * (a - 0.25)) * (heavy ? 0.4 : 0.15); P.holdRot = (P0.holdRot || 0) + lag; P.armR = (P0.armR || 0) + (heavy ? -0.12 * Math.cos(Math.PI * a) : 0.25 * tk); }
      P.bend = (P0.bend || 0) + (heavy ? 0.1 : 0.04) * tk; P.face = heavy ? 'focused' : 'excited'; return {P, phase: 'air'}; }
    const l = dt - air;
    if (l < J.land / 1000) { const s = Math.sin(cl(l / (J.land / 1000), 0, 1) * Math.PI * 0.5);
      add(P, {kneeL: 0.5 * s, kneeR: 0.5 * s, bend: (heavy ? 0.14 : 0.08) * s, sy: 1 - J.sq * s, dy: 1.8 * J.sq / 0.06 * s}); if (g.id !== 'none') P.holdRot = (P.holdRot || 0) + (heavy ? 0.3 : 0.1) * s;
      return {P, phase: 'land', thud: heavy && l < 0.06}; }
    const r = (l - J.land / 1000) / (J.rec / 1000); if (r >= 1) return null;
    const k = 1 - E.bo(r); add(P, {kneeL: 0.5 * Math.max(0, k), kneeR: 0.5 * Math.max(0, k), bend: (heavy ? 0.14 : 0.08) * k, sy: 1 - J.sq * Math.max(0, k)}); if (g.id !== 'none') P.holdRot = (P.holdRot || 0) + (heavy ? 0.3 : 0.1) * k;
    return {P, phase: 'recover'};
  }

  // ---------- 🪢 follow-through (12 principles: follow-through + overlapping action, M6 · M12+): the BODY leads, the held things follow ----------
  // the weapon / held item (holdRot · wristR) and the off hand's wrist take the body's angle from `lag` ago + the speed they still carry → they trail while it moves and swing past when it stops
  // the head (nod · neckTilt) trails a third as much. Light 40 · medium 60 · heavy 90 ms. Cloth + hair = 🧣 Motion.hang (it reads the body's history from _mo.poseAt).
  const FOLLOW = {light: 0.04, medium: 0.06, heavy: 0.09}, FK = ['holdRot', 'wristR', 'wristL'], FH = ['nod', 'neckTilt'];
  function follow(P, at, t, w) {
    const L = FOLLOW[w] || FOLLOW.light, a = at(t - L), b = at(t - 2 * L), a3 = at(t - L / 3), b3 = at(t - 2 * L / 3), Q = Object.assign({}, P);
    for (const k of FK) { if (a[k] == null && b[k] == null && P[k] == null) continue; const va = a[k] || 0, vb = b[k] || 0, p = P[k] || 0; Q[k] = p + cl(va + 0.6 * (va - vb) - p, -0.45, 0.45); }   // trails ≤ 0.45 rad (a bigger lag read as a sideways blade)
    for (const k of FH) { if (a3[k] == null && P[k] == null) continue; const va = a3[k] || 0, vb = b3[k] || 0, p = P[k] || 0; Q[k] = p + cl(va + 0.5 * (va - vb) - p, -0.12, 0.12); }
    return Q;
  }

  // ---------- the engine ----------
  function alive(who, o) {
    o = o || {}; const g = gearOf(who), seed = o.seed != null ? String(o.seed) : ((who && who.name) || ''), place = o.place || 'menu', CH = CHANGE[plantable(g) ? 'heavy' : g.w] || CHANGE.light, t0 = o.t0 || 0;
    const ev = [{t: -1e9, k: 'stance', v: o.stance || (place === 'battle' ? 'ready' : 'relax'), from: null}, {t: -1e9, k: 'move', v: false, from: false}, {t: t0, k: 'start'}];
    const thudSeen = new Set(), fns = {thud: []}, plantP = stancePose('plant', Object.assign({}, g, {w: 'heavy'}));
    const A = {who, gear: g, place, seed, calm: !!o.calm};
    const push = e => { let i = ev.length; while (i > 0 && ev[i - 1].t > e.t) i--; ev.splice(i, 0, e); return A; };
    const last = (k, t) => { let r = null; for (const e of ev) { if (e.t > t) break; if (e.k === k) r = e; } return r; };
    A.poke = t => push({t, k: 'poke'});
    A.stance = (name, t) => { const cur = last('stance', t); return cur && cur.v === name ? A : push({t, k: 'stance', v: name, from: cur ? cur.v : null}); };
    A.moving = (mode, t) => { mode = mode || false; const cur = last('move', t); return cur && cur.v === mode ? A : push({t, k: 'move', v: mode, from: cur ? cur.v : false}); };
    A.jump = (t, jo) => push({t, k: 'jump', air: Math.max(0.15, (jo && jo.air) || 0.5), lift: (jo && jo.lift) || 0});
    A.on = (k, fn) => { (fns[k] || (fns[k] = [])).push(fn); return A; };
    const sessionOf = t => { let s = null; for (const e of ev) { if (e.t > t) break; if (e.t > -1e8) s = e; } return s || ev.find(e => e.k === 'start'); };
    const sIndex = s => ev.indexOf(s);
    // core pose at t (no session-boundary blend) → {P, marks, thud, moment, stage, moving}
    function core(t) {
      const se = last('stance', t), me = last('move', t); let base = stancePose(se.v, g), thud = false;
      let mStart = 0;
      if (se.from && se.t > -1e8) { const dir = se.v === 'plant' ? 'down' : 'up', u = (t - se.t) / (CH[dir] / 1000);
        if (u < 1) { const C = changeAt(plantable(g) ? 'heavy' : g.w, dir, u); base = add(blend(stancePose(se.from, g), base, C.w), C.x); thud = !!C.thud; mStart = se.t; } }
      if (me.v) {   // 🚶 moving: no story
        const sp = me.v === 'run' ? 15 : 11, ph = (t - me.t) * sp, Gp = gait(me.v, ph, g, base), us = (t - me.t) / (CH.start / 1000);
        let P = us < 1 ? blend(me.from ? gait(me.from, ph, g, base) : base, Gp, E.sio(us)) : Gp;
        if (us < 1 && plantable(g) && !me.from) P.bend = (P.bend || 0) - 0.08 * Math.sin(Math.PI * us);   // heave into motion
        return {P, marks: [], thud, moment: null, stage: 0, moving: me.v, mStart};
      }
      let P = add(base, shiftAt(t, seed, g.w));
      if (me.from && me.t > -1e8) {   // just stopped: the load swings on and settles
        const u = (t - me.t) / (CH.stop / 1000);
        if (u < 1) { const sp = me.from === 'run' ? 15 : 11, Gs = gait(me.from, 0, g, base), amp = plantable(g) ? 0.18 : g.w === 'medium' ? 0.1 : 0.06, sw = Math.sin(Math.PI * u) * (1 - u);
          P = blend(Gs, P, E.co(u)); P.bend = (P.bend || 0) + amp * sw * (me.from === 'run' ? 1.4 : 1); if (g.id !== 'none') P.holdRot = (P.holdRot || 0) + (plantable(g) ? 0.5 : 0.2) * sw; P.dy = (P.dy || 0) + 1.2 * sw; }
      }
      const s = sessionOf(t), dt = t - s.t, list = story(seed + ':' + sIndex(s), g, place, dt + 1);
      let st = 0; for (let i = 1; i <= 4; i++) if (dt >= STAGE_AT[i]) st = i;
      let cur = null; for (const x of list) { if (dt < x[0]) break; if (dt < x[1]) { cur = x; break; } }
      if (cur) { const R = momentAt(mom(cur[2]), dt - cur[0], P, plantP); return {P: R.P, marks: R.marks, thud: thud || R.thud, moment: cur[2], stage: st, moving: false, mStart: s.t + cur[0]}; }
      return {P, marks: [], thud, moment: null, stage: st, moving: false, mStart};
    }
    function pose(t) {
      let R = core(t); const s = sessionOf(t), je = last('jump', t);
      if (je) { const J = jumpAt(je, t, g, R.P); if (J) return {P: J.P, marks: [], thud: !!J.thud, moment: null, stage: 0, moving: R.moving, mStart: je.t, jump: J.phase}; }
      if (s.k === 'poke' && t - s.t < 1) {   // 🛑 a poke ends the moment it caught: ease out
        const B = core(s.t - 1e-4); if (B.moment) { const m = mom(B.moment), ms = m.plant ? 900 : CH.out, u = (t - s.t) / (ms / 1000);
          if (u < 1) { if (m.plant) { const C = heavyLift(u); R = Object.assign({}, R, {P: add(blend(B.P, R.P, C.w), C.x)}); } else R = Object.assign({}, R, {P: blend(B.P, R.P, E.co(u))}); } }
      }
      return R;
    }
    const raw = t => pose(t).P;
    A.poseAt = t => { const P = follow(pose(t).P, raw, t, plantable(g) ? 'heavy' : g.w); delete P.face; return P; };
    A.state = t => { const R = pose(t), B = breathAt(t, seed); return {stage: STAGE[R.stage], moment: R.moment, moving: R.moving, thud: R.thud, breath: B}; };
    A.at = t => {
      const R = pose(t), P = follow(R.P, raw, t, plantable(g) ? 'heavy' : g.w);
      // 🫁 breath on top (after a run: quicker breaths for a moment; a heavy load's arm breathes half)
      const me = last('move', t), puff = !me.v && me.from === 'run' && t - me.t < 4 ? 1 - (t - me.t) / 4 : 0;
      const B = breathAt(puff ? t * (1 + puff) : t, seed), b = R.moving ? B.b * 0.5 : B.b * (1 + puff * 0.5), hv = plantable(g) ? 0.5 : 1;
      P.sy = (P.sy == null ? 1 : P.sy) * (1 + 0.018 * b); P.shrugL = cl((P.shrugL || 0) + 0.1 * b, 0, 1); P.shrugR = cl((P.shrugR || 0) + 0.1 * b * hv, 0, 1);
      P.armL = (P.armL || 0) + 0.035 * b; P.armR = (P.armR || 0) + 0.035 * b * hv; P.nod = (P.nod || 0) - 0.025 * b; P.dy = (P.dy || 0) - 0.7 * b;
      // 👀 blink (not while the eyes are already shut)
      let face = P.face || null; delete P.face; const FP = typeof AK_FACE_PRESETS !== 'undefined' ? AK_FACE_PRESETS : {}, fo = typeof face === 'string' ? FP[face] : face;
      if (blinkAt(t, seed) && !(fo && fo.eyes === 'closed')) face = Object.assign({}, fo || {}, {eyes: 'closed'});
      P.alive = false;
      if (R.thud && fns.thud.length) { const key = Math.round((R.mStart || 0) * 1000) + ':' + (R.moment || (R.jump ? 'jump' : 'stance')); if (!thudSeen.has(key)) { thudSeen.add(key); fns.thud.forEach(fn => { try { fn(t, A); } catch (e) {} }); } }
      const f = {id: 'motion.alive#' + (R.moment || (R.moving ? 'move.' + R.moving : 'idle')), act: {}, pose: P, face, marks: R.marks || [], tricks: [], ride: 'keep', hold: 'keep', beat: 'idle', i: 0, q: 0};
      Object.defineProperty(f, '_mo', {value: {poseAt: ms => A.poseAt(t - ms / 1000)}});
      Object.defineProperty(f, '_al', {value: {stage: STAGE[R.stage], moment: R.moment, moving: R.moving, thud: R.thud, breath: B, jump: R.jump || null}});
      return f;
    };
    return A;
  }
  // 🫁 mo-15 (📨 Pokadif pk-7m1 ask): Motion.aliveLoop(who, {secs, seed, frames}) → {at(u)} — ONE calm breath + ONE blink per loop, at(0) = at(1) (seamless),
  // the same frame shape as Motion.alive(who).at(t) so Acting.draw paints it · seeded per person (the blink sits at its own spot of the loop) · frames = snap u to that many pictures
  function aliveLoop(who, o) {
    o = o || {}; const seed = String(o.seed != null ? o.seed : (who && who.name) || 'loop'), A = alive({name: who && who.name, av: who && who.av, dir: 1}, {place: o.place || 'battle', seed, calm: true}), f0 = A.at(0);
    const sio2 = u => u * u * (3 - 2 * u), breath = u => { u = ((u % 1) + 1) % 1; return u < 0.4 ? sio2(u / 0.4) : u < 0.45 ? 1 : 1 - sio2((u - 0.45) / 0.55); };
    let h = 2166136261; for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    const F = o.frames | 0, bAt = 0.5 + (h % 1000) / 1000 * 0.45, bW = F > 0 ? 1 / F : 0.045;
    const at = u => { u = ((u % 1) + 1) % 1; if (F > 0) u = Math.round(u * F) % F / F; const b = breath(u), P = Object.assign({}, f0.pose);
      P.sy = (P.sy == null ? 1 : P.sy) * (1 + 0.018 * b); P.shrugL = Math.min(1, (P.shrugL || 0) + 0.1 * b); P.shrugR = Math.min(1, (P.shrugR || 0) + 0.1 * b);
      P.armL = (P.armL || 0) + 0.035 * b; P.armR = (P.armR || 0) + 0.035 * b; P.nod = (P.nod || 0) - 0.025 * b; P.dy = (P.dy || 0) - 0.7 * b;
      const blink = u >= bAt && u < bAt + bW, face = blink ? Object.assign({}, typeof f0.face === 'object' && f0.face || {}, {eyes: 'closed'}) : f0.face;
      return Object.assign({}, f0, {pose: P, face, breath: b, blink}); };
    return {at, secs: o.secs || 3.2, frames: F, blinkAt: bAt};
  }
  Object.assign(M, {aliveLoop});
  Object.assign(M, {alive, gearOf, GIMMICKS, GIM: GL, GEN, ALIVE: {JUMP, jumpAt, FOLLOW, follow, STAGE, STAGE_AT, PLACE_MAX, CHANGE, ST, W8, STYLE, FAMILY, story, mom, gimsOf, keysOf, pc, breathAt, blinkAt, shiftAt, heavyLift, heavyLower, changeAt, gait, stancePose, momentAt}});
  M.VERSION = 'mo-9';
})();
/* ================= 🦴 MotionPoints (mo-11, 🎬 Motion chat, 2026-11-20) — wear rig points: every worn piece rides its rig part =================
   Rule 🦴 "Wear rides the rig" (Aowu 2026-11-20 10:43) · plan + look test: `Motion rules.md` §32 (picture `Claude outputs/mo-11p/mo11-plan.png`) · as built §33.
   Built INTO AvatarMotion.html after MotionAlive (build_motion.py). PURE: draws nothing, never changes P, no AvatarKit hook — nothing old changes.

   ⭐ m = Motion.rigXf(P, part, {frame, turn, hang, swing, tiny})   → ONE 2D matrix [a, b, c, d, e, f] in avatar units.
        In a wear hook:  g.save(); g.scale(k, k); g.transform(m[0], m[1], m[2], m[3], m[4], m[5]); paint the piece AS IF STANDING (units); g.restore();
        → the piece lands on the posed part. Standing pose (armL = armR = 0.15, nothing else) = the identity.
          turn 0…1  how much a held piece turns with the forearm / shin (🛡️ shield 0.45 · 🔮 orb / lantern 0 = always upright · 🧤 glove / bracer 1 = default)
          hang      neck · chest · hips: true (default) = the piece hangs straight DOWN round its anchor whatever the body leans · false = flat on the body (identity, squashes with a twist like the body)
          swing     extra radians on top of hang (a game / Motion.hang can feed a follow-through angle)
   ⭐ Motion.rigAt(P, part, k, {frame, tiny})  → {x, y (px in that frame), a (turn vs standing, rad), frame, seen, …} + per part:
          hands / wrists: grip ('mitt' · 'fist' · 'open' · 'point' · 'grip' · 'thumb' · 'peace') · wrist · hold (front) · fore (forearm angle, AKJ angle)
          elbows: a (upper arm turn) · b (forearm turn)   ·   head: s (scale: chibi head × turn squeeze) · tilt   ·   face: r (px — the open-face circle)
          neck · chest · hips · back: down (the angle that points at the ground in that frame) · breath (sy − 1) · w (chest width of a twist)
          back: front (true = seen from behind → paint the pack OVER the body, in the neck hook)   ·   feet: shin (shin angle) — the same answer as 🧳 AKJ.feetAt
   ⭐ Motion.rigAll(P, k, {tiny}) → {part: rigAt(…)} for all 15 parts (one call a frame)
   PARTS + default frame (= the drawAvatar hook that paints that slot today):
     body  : back · footL · footR                       (🎒 back hook · legs · 👟 feet hook)          = feet · dir · sx / sy · rotFull · rot
     upper : handR · wristR · elbowR · shoulderR · head · face   (✋ hand / wrist hooks)          = body + bend about the hips (0, −20)
     chest : handL · wristL · elbowL · shoulderL · neck · chest · hips   (👕 suit · 📿 neck hooks)  = upper + the chest width of a twist (scale cs, 1)
     {frame: 'body' | 'upper' | 'chest'} moves any part into another hook's frame. The head hook (🪖) already draws inside the head frame — head wear rides by itself;
     rigXf(P, 'head') = head frame → upper (for halos · crowns · comics · FX painted OUTSIDE the head).
   P = the pose drawAvatar draws with (AK_WEAR gets it as o.P once 🧳's av-wear5 line is live; Acting frames: f.pose filled the same way).
   Arms: P.reach stretches the front arm only (like AvatarKit) · {tiny: true} = the tinyArms look (9 units) · P.platform = the back hand reaches for the front one.
   ========================================================================================= */
(function(){
const M = window.Motion; if (!M) return;
const end = (x, y, a, l) => [x - Math.sin(a) * l, y + Math.cos(a) * l];
const REST = Object.freeze({armL: 0.15, armR: 0.15});
const PARTS = ['handL', 'handR', 'wristL', 'wristR', 'elbowL', 'elbowR', 'shoulderL', 'shoulderR', 'head', 'face', 'neck', 'chest', 'hips', 'back', 'footL', 'footR'];
const FRAME = {handL: 'chest', wristL: 'chest', elbowL: 'chest', shoulderL: 'chest', neck: 'chest', chest: 'chest', hips: 'chest',
  handR: 'upper', wristR: 'upper', elbowR: 'upper', shoulderR: 'upper', head: 'upper', face: 'upper', back: 'body', footL: 'body', footR: 'body'};
const FACE0 = {cx: 5, cy: -56, r: 6};   // = AvatarWear.FACE (the eyes + mouth, avatar units, facing +x) — read from AvatarWear when it is there
const ID = [1, 0, 0, 1, 0, 0];
const R0 = P => (M.rigOf && M.rigOf(P)) || {bo: [0, 0], fo: [0, 0], cs: 1, tw: 0, sL: 0, sR: 0, tilt: 0, turn: 0, nod: 0, drop: 0, neck: false, hL: null, hR: null};
const pose = P => { const Q = Object.assign({}, P || {}); if (Q.armL == null) Q.armL = REST.armL; if (Q.armR == null) Q.armR = REST.armR; return Q; };

// ---------- the arms, in 'upper' units — the SAME maths as drawAvatar + MotionRig (shoulder offsets bo / fo) ----------
function reach(x, y, tx, ty, len, sign){   // = AKJ.reach without drawing → {j, e, a1, a2}
  const dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy), base = Math.atan2(-dx, dy), h = len / 2;
  if (d >= len - 0.01) { const j = end(x, y, base, h); return {j, e: end(x, y, base, len), a1: base, a2: base}; }
  const off = Math.acos(Math.min(1, Math.max(-1, d / len))) * (sign || 1), a1 = base - off, j = end(x, y, a1, h), a2 = Math.atan2(-(tx - j[0]), ty - j[1]);
  return {j, e: end(j[0], j[1], a2, h), a1, a2};
}
function arms(P, tiny){
  const R = R0(P), bl = tiny ? 9 : 16, aL = P.armL || 0, eL = P.elbowL || 0, aR = P.armR || 0, eR = P.elbowR || 0, lenR = bl * (P.reach || 1);
  const bo = R.bo, fo = R.fo, A = {R};
  // front: shoulder (10, −42) + fo · AKJ.limb(−armR, −elbowR) · rigHand moves the hand by fo
  A.sR = [10 + fo[0], -42 + fo[1]]; A.jR = end(A.sR[0], A.sR[1], -aR, lenR / 2);
  A.hR = eR ? end(A.jR[0], A.jR[1], -aR - eR, lenR / 2) : end(A.sR[0], A.sR[1], -aR, lenR); A.upR = -aR; A.foreR = -aR - eR;
  // back: shoulder (−10, −42) + bo · AKJ.limb(armL, elbowL) — or AKJ.reach toward the front hand (platform)
  A.sL = [-10 + bo[0], -42 + bo[1]];
  if (P.platform) { const pl = Math.min(1, P.platform), n = end(-10, -42, aL, bl), fh = eR ? end(...end(10, -42, -aR, bl / 2), -aR - eR, bl / 2) : end(10, -42, -aR, bl);
    const r = reach(-10, -42, n[0] + (fh[0] - n[0]) * pl, n[1] + (fh[1] - n[1]) * pl, bl, -1);
    A.jL = [r.j[0] + bo[0], r.j[1] + bo[1]]; A.hL = [r.e[0] + bo[0], r.e[1] + bo[1]]; A.upL = r.a1; A.foreL = r.a2; }
  else { A.jL = end(A.sL[0], A.sL[1], aL, bl / 2); A.hL = eL ? end(A.jL[0], A.jL[1], aL + eL, bl / 2) : end(A.sL[0], A.sL[1], aL, bl); A.upL = aL; A.foreL = aL + eL; }
  return A;
}
const REST_ARMS = {n: arms(REST, false), t: arms(REST, true)};
function headM(P){   // head frame → 'upper' = MotionRig.neckIn (tilt · turn · nod · shrug drop) then AvatarKit headSc about (0, −48)
  const R = R0(P), HS = P.headSc || 1; let X = {tx: 0, ty: 0, rot: 0, sx: 1, sy: 1};
  if (R.neck && M.headXf) X = M.headXf(R, 1);
  if (!R.neck && HS === 1) return ID.slice();
  const c = Math.cos(X.rot), s = Math.sin(X.rot), sx = X.sx * HS, sy = X.sy * HS, cc = -s * sy, d = c * sy;
  return [c * sx, s * sx, cc, d, X.tx + cc * 48, -48 + X.ty + d * 48];
}
const ap = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
const T = (x, y) => [1, 0, 0, 1, x, y], Rm = a => { const c = Math.cos(a), s = Math.sin(a); return [c, s, -s, c, 0, 0]; };
const about = (x, y, a) => a ? mul(T(x, y), mul(Rm(a), T(-x, -y))) : ID.slice();
const lean = P => (P.rot || 0) + (P.bend || 0) + (P.rotFull || 0);
const face = () => (window.AvatarWear && AvatarWear.FACE) || FACE0;

// one part in 'upper' units → {p (posed), p0 (standing), a (turn vs standing), …}
function partU(P, part, tiny){
  const A = arms(P, tiny), R = A.R, Z = tiny ? REST_ARMS.t : REST_ARMS.n, seen = !P.back;
  switch (part) {
    case 'handL': case 'wristL': return {p: A.hL, p0: Z.hL, a: (A.foreL - (P.wristL || 0)) - Z.foreL, fore: A.foreL, grip: R.hL || 'mitt', wrist: P.wristL || 0, seen: true};
    case 'handR': case 'wristR': return {p: A.hR, p0: Z.hR, a: (A.foreR - (P.wristR || 0)) - Z.foreR, fore: A.foreR, grip: R.hR || 'mitt', wrist: P.wristR || 0, hold: P.holdRot || 0, seen: true};
    case 'elbowL': return {p: A.jL, p0: Z.jL, a: A.upL - Z.upL, b: A.foreL - Z.foreL, seen: true};
    case 'elbowR': return {p: A.jR, p0: Z.jR, a: A.upR - Z.upR, b: A.foreR - Z.foreR, seen: true};
    case 'shoulderL': return {p: A.sL, p0: [-10, -42], a: 0, shrug: R.sL || 0, seen: true};
    case 'shoulderR': return {p: A.sR, p0: [10, -42], a: 0, shrug: R.sR || 0, seen: true};
    case 'neck': case 'chest': case 'hips': { const y = part === 'neck' ? -46 : part === 'chest' ? -38 : -22;
      return {p: [0, y], p0: [0, y], a: 0, down: -lean(P), breath: (P.sy || 1) - 1, w: R.cs, seen}; }
    case 'back': return {p: [-11 * R.cs, -40 - 1.5 * ((R.sL || 0) + (R.sR || 0))], p0: [-11, -40], a: 0, down: -lean(P), breath: (P.sy || 1) - 1, w: R.cs, front: !!P.back, seen: true};
    case 'head': case 'face': { const m = headM(P), F = face(), q = part === 'face' ? [F.cx, F.cy] : [0, -60], s = Math.hypot(m[0], m[1]);
      return {p: ap(m, q[0], q[1]), p0: q, a: Math.atan2(m[1], m[0]), s, tilt: R.tilt || 0, r: part === 'face' ? F.r * s : undefined, m, seen: part === 'face' ? seen : true}; }
  }
  return null;
}
function toFrame(P, frame, p){   // 'upper' → frame
  if (frame === 'chest') { const cs = R0(P).cs; return cs === 1 ? p.slice() : [p[0] / cs, p[1]]; }
  if (frame === 'body') { const b = P.bend || 0; if (!b) return p.slice(); const dx = p[0], dy = p[1] + 20, c = Math.cos(b), s = Math.sin(b); return [dx * c - dy * s, dx * s + dy * c - 20]; }
  return p.slice();
}
function upperOf(P, frame, p){   // frame → 'upper'
  if (frame === 'chest') { const cs = R0(P).cs; return [p[0] * cs, p[1]]; }
  if (frame === 'body') { const b = P.bend || 0; if (!b) return p.slice(); const dx = p[0], dy = p[1] + 20, c = Math.cos(-b), s = Math.sin(-b); return [dx * c - dy * s, dx * s + dy * c - 20]; }
  return p.slice();
}
function feet(P){   // [back, front] {x, y, s, a} in body units — 🧳 AKJ.feetAt when it is there (same maths as the legs + shoes)
  if (window.AKJ && AKJ.feetAt) return AKJ.feetAt(P, 1);
  const legs = !!(P.kneeL || P.kneeR || P.footL || P.footR);
  if (legs) return [[-5, -(P.legL || 0), P.kneeL || 0, P.footL || 0], [5, P.legR || 0, P.kneeR || 0, P.footR || 0]].map(([x, a, b, f]) => { const j = end(x, -20, a, 9), e = end(j[0], j[1], a + b, 9); return {x: e[0], y: e[1], s: a + b, a: a + b + f}; });
  if (P.feet === 'follow' || !P.feet) return [[-5, -(P.legL || 0)], [5, P.legR || 0]].map(([x, a]) => { const e = end(x, -20, a, 18); return {x: e[0], y: e[1], s: a, a: a * 0.5}; });
  return [[-5, 0], [5, 0]].map(([x]) => ({x, y: -2, s: 0, a: 0}));
}
const FEET0 = () => feet(pose({}));

// ⭐ rigAt
function rigAt(P, part, k, o){
  k = k || 1; o = o || {}; P = pose(P); const frame = o.frame || FRAME[part];
  if (!FRAME[part]) return null;
  if (part === 'footL' || part === 'footR') { const i = part === 'footL' ? 0 : 1, f = feet(P)[i], f0 = FEET0()[i];
    let q = [f.x, f.y], a = f.a - f0.a; if (frame !== 'body') { const b = P.bend || 0; q = toFrame(Object.assign({}, P, {bend: -b}), 'body', q); if (frame === 'chest') q = toFrame(P, 'chest', q); a -= b; }
    return {x: q[0] * k, y: q[1] * k, a, shin: f.s, frame, seen: true}; }
  const U = partU(P, part, o.tiny), q = toFrame(P, frame, U.p), out = {x: q[0] * k, y: q[1] * k, frame};
  for (const key in U) if (key !== 'p' && key !== 'p0' && key !== 'm' && U[key] !== undefined) out[key] = U[key];
  if (frame === 'body') { out.a += P.bend || 0; if (out.down != null) out.down += P.bend || 0; }
  if (U.r != null) out.r = U.r * k;
  return out;
}
// ⭐ rigXf
function rigXf(P, part, o){
  o = o || {}; P = pose(P); const frame = o.frame || FRAME[part], cs = R0(P).cs;
  if (!FRAME[part]) return ID.slice();
  let m;
  if (part === 'footL' || part === 'footR') { const i = part === 'footL' ? 0 : 1, f = feet(P)[i], f0 = FEET0()[i], tn = o.turn == null ? 1 : o.turn;
    m = mul(T(f.x, f.y), mul(Rm((f.a - f0.a) * tn), T(-f0.x, -f0.y)));   // in 'body' units
    if (frame === 'upper' || frame === 'chest') m = mul(about(0, -20, -(P.bend || 0)), m);
    if (frame === 'chest' && cs !== 1) m = mul([1 / cs, 0, 0, 1, 0, 0], m);
    return m; }
  const U = partU(P, part, o.tiny);
  if (part === 'neck' || part === 'chest' || part === 'hips') {
    if (o.hang === false && !o.swing) {   // flat on the body = the chest frame itself (squashes with a twist like the body)
      m = frame !== 'chest' && cs !== 1 ? [cs, 0, 0, 1, 0, 0] : ID.slice(); if (frame === 'body' && P.bend) m = mul(about(0, -20, P.bend), m); return m; }
    m = about(U.p[0], U.p[1], (o.hang === false ? 0 : U.down) + (o.swing || 0));   // hangs: built in 'upper' (a hanging piece is not squashed)
  }
  else if (part === 'head' || part === 'face') m = U.m;
  else if (part === 'back') m = mul(T(U.p[0], U.p[1]), T(-U.p0[0], -U.p0[1]));
  else { const tn = o.turn == null ? 1 : o.turn; m = mul(T(U.p[0], U.p[1]), mul(Rm(U.a * tn), T(-U.p0[0], -U.p0[1]))); }
  if (frame === 'chest' && cs !== 1) m = mul([1 / cs, 0, 0, 1, 0, 0], m);
  if (frame === 'body' && P.bend) m = mul(about(0, -20, P.bend), m);
  return m;
}
function rigAll(P, k, o){ const out = {}; PARTS.forEach(p => out[p] = rigAt(P, p, k, o)); return out; }

Object.assign(M, {VERSION: 'mo-11', rigAt, rigXf, rigAll, RIG_PARTS: PARTS, RIG_FRAME: FRAME, RIG_REST: REST,
  RIGPTS: {arms, headM, partU, toFrame, upperOf, feet, ap, mul}});
})();
