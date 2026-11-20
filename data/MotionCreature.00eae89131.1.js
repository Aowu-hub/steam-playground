
// ======================= 🐾 mo-10 (🎬 Motion chat, 2026-11-20): Creatures.alive — monsters · bosses · pets breathe, blink, shift weight, walk / run / jump by SIZE and live a little idle story (Motion rules §30–31) =======================
/* Loads right after CreatureKit (Code.gs INCLUDE_ALSO_ CreatureKit → MotionCreature). Never edits CreatureKit: it ADDS Creatures.alive / Creatures.aliveMarks / Creatures.ALIVE (+ Motion.creatureAlive when Motion is there).
   A = Creatures.alive(def | id, {place: 'battle' | 'map' | 'menu' | 'card', seed, calm, stage, form, pet, t0})
     each frame   Creatures.draw(g, def, x, y, size, Object.assign({face, stage}, A.at(t)))   — A.at(t) = {pose, t, _ca}; t = the creature's OWN clock for the kit's built-in loops
                  with the 2.5D finish: A.at(t, {finish: true, focus}) → snapped looks the finish cache can keep (🪜 24-look breathing ladder; focus true = moments / gait / jump at 10 looks a second, false = breathing only)
     any input    A.poke(t)                          — the moment ends, the story starts again at 🙂 (any game ACT still starts at once: draw the act, then poke)
     moving       A.moving('walk' | 'run' | false, t) — the gait acts the weight (the game keeps its speed); stopping = body + tail carry on, then settle
     jump         A.jump(t, {air, lift})             — leaves AT ONCE (fair), landing squash by weight, ONE thud for heavy / giant
     read         A.state(t) → {stage, moment, mk, thud, jump, moving, w, breath} · A.on('thud', fn(t, kind))
     marks        Creatures.aliveMarks(g, anchors, frame, x, y, dir, size)   — zZ · ♪ · ! · ♥ · bubbles · steam · sparkle · dust (anchors = what Creatures.draw returned; dir −1 when face 'right')
   Weight = size class (Creatures.clsOf): 1–2 light · 3–4 medium · 5 heavy · 6–8 giant. Story: 🙂 0–3 s → 👀 3–12 → 🤹 12–30 → 🥱 30–60 → 😴 60+ (held) → ❗ → 👀.
   Places: battle = 👀 only · map = up to 🥱 · menu / card = all. Pure: same history + same t = same frame. */
(function () {
  const CR = window.Creatures; if (!CR || CR.alive) return;
  const TAU = Math.PI * 2, cl = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, u) => a + (b - a) * u;
  const hsh = (s, i) => { let h = 2166136261 ^ Math.imul(i | 0, 374761393); for (let j = 0; j < s.length; j++) h = Math.imul(h ^ s.charCodeAt(j), 16777619); h ^= h >>> 13; h = Math.imul(h, 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const E = {sio: u => 0.5 - 0.5 * Math.cos(Math.PI * cl(u, 0, 1)), co: u => 1 - Math.pow(1 - cl(u, 0, 1), 3),
    bo: u => { u = cl(u, 0, 1); const c = 1.4; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); }};

  // ---------- ⚖️ weight = size class ----------
  const W = {
    light:  {br: [1.2, 1.6], amp: 0.035, bl: [1.6, 4.0], bms: 90,  sh: [3, 6],  shMs: 450,  shift: 1.6, chg: 150, stop: 200, land: [0.07, 50, 160],  gait: 1.35, lag: 40,  hop: 1},
    medium: {br: [2.0, 2.6], amp: 0.026, bl: [2.2, 5.0], bms: 110, sh: [4.5, 8], shMs: 650,  shift: 1.6, chg: 280, stop: 320, land: [0.10, 80, 240],  gait: 1.0,  lag: 60,  hop: 0.8},
    heavy:  {br: [2.8, 3.4], amp: 0.019, bl: [2.8, 6.0], bms: 140, sh: [6, 10],  shMs: 900,  shift: 1.6, chg: 500, stop: 560, land: [0.15, 130, 400], gait: 0.75, lag: 90,  hop: 0.45},
    giant:  {br: [3.6, 4.4], amp: 0.014, bl: [3.5, 7.0], bms: 170, sh: [7, 12],  shMs: 1200, shift: 2.6, chg: 800, stop: 820, land: [0.18, 160, 520], gait: 0.55, lag: 120, hop: 0.2}};
  const BODY = {sx: 1, sy: 1, y: 1, shift: 1, rot: 1};
  const wOf = c => c <= 2 ? 'light' : c <= 4 ? 'medium' : c === 5 ? 'heavy' : 'giant';
  const FLY = {bird: 1, spirit: 1}, HOPPER = {slime: 1, plant: 1}, HEAVY = {heavy: 1, giant: 1};
  // the joints each family really has (= Motion.LIMITS.family, mo-7b) — a frame only moves those (+ body sx · sy · y · shift · rot); R6
  const FAMF = {slime: 'lean jaw', beast: 'lean head jaw fl bl tail wing', bird: 'lean head jaw wing tail', plant: 'lean head jaw arm', bug: 'lean head jaw fl', spirit: 'lean arm jaw tail wing',
    construct: 'lean head arm fl bl', reptile: 'lean head jaw arm fl tail wing', giant: 'lean head arm wrist'};
  const LIM = {lean: [-0.7, 0.6], head: [-0.7, 0.5], jaw: [0, 1], fl: [-0.8, 1.4], bl: [-1.4, 0.8], tail: [-0.9, 1.1], wing: [0, 1], arm: [-2.8, 1.6], wrist: [-0.6, 0.8], y: [-40, 6], sx: [0.55, 1.5], sy: [0.55, 1.5]};

  // ---------- pose code: 'l.2 h-.3 j.5 f.4 b-.2 a1 t.6 w.8 s3 r.1 y-4 X.05 Y-.1 k.3 e:shut m:zz' (deltas; X / Y = sx / sy, k = wrist) ----------
  const CK = {l: 'lean', h: 'head', j: 'jaw', f: 'fl', b: 'bl', a: 'arm', t: 'tail', w: 'wing', s: 'shift', r: 'rot', y: 'y', X: 'sx', Y: 'sy', k: 'wrist'};
  const NUM = ['lean', 'head', 'jaw', 'fl', 'bl', 'arm', 'tail', 'wing', 'shift', 'rot', 'y', 'sx', 'sy', 'wrist'];
  function pc(s) { const o = {}; (s || '').split(' ').forEach(p => { if (!p) return; if (p.startsWith('e:')) { o.eye = p.slice(2); return; } if (p.startsWith('m:')) { o.mk = p.slice(2); return; } const k = CK[p[0]]; if (k) o[k] = +p.slice(1); }); return o; }
  const keys = src => src.split(';').map(k => { const i = k.indexOf('|'); return {ms: +k.slice(0, i), p: pc(k.slice(i + 1))}; });
  const rep = (t0, n, ms, a, b) => { const o = []; for (let i = 0; i < n; i++) o.push((t0 + i * ms) + '|' + (i % 2 ? b : a)); return o.join(';'); };

  // ---------- 📖 moments: [stage, who ('*' all · family · role · weight · pet · egg), keys] — c curious · f fidget · b bored · d doze (held) · s startle ----------
  const MOM = {
    lookUp:     ['c', '*', '0|;400|h-.28;1500|h-.28;1900|'],
    lookDown:   ['c', '*', '0|;350|h.2;1300|h.22;1650|'],
    tailFlick:  ['c', 'beast reptile spirit bird bug', '0|;120|t.55;260|t-.2;420|t.25;600|'],
    sniff:      ['c', 'beast reptile bug giant', '0|;300|h.26 l.06;420|h.26 l.06 j.18;520|h.26 l.06;640|h.26 l.06 j.18;740|h.26 l.06;1100|'],
    listen:     ['c', '*', '0|;250|h-.14 t.3 w.2;1300|h-.14 t.3 w.2;1600|'],
    perk:       ['c', 'light', '0|;120|y-5 Y.05;260|Y-.06;420|'],
    scratch:    ['f', 'beast', '0|;300|h.22 l.05 e:shut;' + rep(380, 8, 90, 'b-.7 h.22 l.05 e:shut', 'b.15 h.22 l.05 e:shut') + ';1150|h.22 e:shut;1500|'],
    playBow:    ['f', 'beast', '0|;350|l.32 f.6 t.6 y2 Y-.06 e:happy;1100|l.32 f.6 t.6 y2 Y-.06 e:happy;1350|l-.05 y-3;1650|'],
    wag:        ['f', 'beast reptile', '0|;' + rep(150, 8, 110, 't.55 e:happy', 't-.35 e:happy') + ';1150|'],
    shakeOff:   ['f', 'beast bird', '0|;150|Y-.05;' + rep(260, 6, 70, 'r.07 X.03', 'r-.07 X.03') + ';740|;900|'],
    preen:      ['f', 'bird', '0|;400|h.42 w.65;' + rep(500, 6, 160, 'h.42 w.65 j.3', 'h.38 w.65') + ';1500|h.4 w.6;1800|'],
    wingStretch:['f', 'bird', '0|;450|w1 l-.1 Y.05;1300|w1 l-.1 Y.05;1600|w.3;1850|'],
    hopHop:     ['f', 'bird slime light', '0|;120|Y-.08;260|y-7 Y.07;400|Y-.08;520|y-7 Y.07;660|Y-.08;800|'],
    jiggle:     ['f', 'slime', '0|;' + rep(80, 6, 110, 'X.07 Y-.07', 'X-.06 Y.07') + ';760|'],
    bubble:     ['f', 'slime', '0|;300|Y.05 j.3 m:bubble;900|Y.05 j.3 m:bubble;1200|'],
    meltPeek:   ['f', 'slime', '0|;500|Y-.26 X.16 e:shut;1400|Y-.26 X.16 e:shut;1600|Y-.2 X.12;1900|Y.06 X-.04;2150|'],
    sunReach:   ['f', 'plant', '0|;600|l-.2 h-.3 a-1 y-3 e:happy;1700|l-.2 h-.3 a-1 y-3 e:happy;2200|'],
    drink:      ['f', 'plant', '0|;300|h.22 j.5;500|h.22 j.1;700|h.22 j.5;900|h.22 j.1;1200|'],
    leafShake:  ['f', 'plant', '0|;' + rep(100, 8, 90, 'a.6', 'a-.4') + ';820|'],
    legTap:     ['f', 'bug', '0|;' + rep(100, 8, 100, 'f.45', 'f-.1') + ';900|'],
    rearUp:     ['f', 'bug', '0|;350|l-.35 y-4 h-.2 j.5;1100|l-.35 y-4 h-.2 j.5;1400|'],
    loop:       ['f', 'spirit', '0|;500|s-8 y-6 r-.12;1000|s0 y-12 r0;1500|s8 y-6 r.12;2000|'],
    swirl:      ['f', 'spirit', '0|;' + rep(100, 6, 140, 'r.22 t.7 m:sparkle', 'r-.22 t-.4') + ';1000|'],
    scan:       ['f', 'construct', '0|;200|h-.22;600|h-.22;650|h0;1000|h0;1050|h.2;1400|h.2;1450|'],
    selfCheck:  ['f', 'construct', '0|;150|a-1.2;300|a-1.2;350|a-.3;500|a-.3;550|a-1.2;700|a-1.2;900|'],
    vent:       ['f', 'construct', '0|;300|Y.05 m:steam;700|Y-.05 X.04 m:steam;1100|'],
    glitch:     ['f', 'construct', '0|;60|r.04 e:x;120|r-.03 e:x;180|r.02;240|e:open;400|'],
    tongue:     ['f', 'reptile', '0|;100|j.28;180|;280|j.28;360|;600|'],
    bask:       ['f', 'reptile', '0|;600|h-.3 l-.1 e:happy;2000|h-.3 l-.1 e:happy;2500|'],
    stalk:      ['f', 'reptile beast', '0|;500|l.25 y2 Y-.05 t.4 h.15;1400|l.25 y2 Y-.05 t.4 h.15;1550|l.3 y-6 Y.06;1750|Y-.06;2000|'],
    heft:       ['f', 'giant', '0|;350|k-.45 l-.05 Y.03;800|k.25 l.04;1100|k.25;1500|'],
    groundTap:  ['f', 'giant', '0|;300|l.05 h.12 m:dust;600|;900|l.05 h.12 m:dust;1200|'],
    lookAround: ['f', 'giant', '0|;600|h-.22;1600|h-.22;2200|h.15;3000|h.15;3500|'],
    brace:      ['f', 'guard', '0|;250|X.05 Y-.04 l-.05 e:angry;1000|X.05 Y-.04 l-.05 e:angry;1300|'],
    hum:        ['f', 'healer', '0|;' + rep(150, 6, 170, 'j.22 m:notes', 'j.05 m:notes') + ';1300|'],
    giggle:     ['f', 'trickster', '0|;' + rep(80, 8, 70, 'Y.04 j.4', 'Y-.03 j.2') + ';700|'],
    aimTest:    ['f', 'ranged', '0|;350|l-.12 h-.1 a-.6;1100|l-.12 h-.1 a-.6;1350|'],
    paw:        ['f', 'striker', '0|;150|l.08 e:angry;' + rep(250, 4, 150, 'f.5 l.08 e:angry m:dust', 'f-.2 l.08 e:angry') + ';950|'],
    happyHop:   ['f', 'pet', '0|;120|Y-.08 e:happy;260|y-9 Y.08 e:happy;420|Y-.08 e:happy;560|y-9 Y.08 e:happy;720|Y-.06;900|'],
    snackAsk:   ['f', 'pet', '0|;400|Y-.08 y2 h-.25 j.3 e:happy m:heart;1500|Y-.08 y2 h-.25 j.3 e:happy m:heart;1800|'],
    eggWobble:  ['f', 'egg', '0|;' + rep(100, 6, 140, 'r.12', 'r-.12') + ';950|;1100|y-4;1250|'],
    yawn:       ['b', '*', '0|;400|h-.12;900|h-.35 j1 e:shut Y.05;1600|h-.35 j1 e:shut Y.05;2100|j.1 Y-.03;2400|'],
    sigh:       ['b', '*', '0|;700|Y.06 h-.08;1000|Y.06;1800|Y-.05 h.1;2300|'],
    bigStretch: ['b', 'beast reptile', '0|;500|l-.2 f.5 t.5 h-.15;1300|l-.2 f.5 t.5 h-.15;1800|'],
    flop:       ['b', 'slime plant', '0|;500|Y-.12 X.08 l.12;1600|Y-.12 X.08 l.12;2000|'],
    wingFan:    ['b', 'bird spirit', '0|;' + rep(150, 4, 180, 'w.9', 'w.2') + ';900|'],
    curl:       ['d', 'beast reptile bug', '0|;900|Y-.12 X.06 h.35 t.5 l.1 y2 e:shut m:zz'],
    tuck:       ['d', 'bird', '0|;900|h.42 w.2 Y-.06 y3 e:shut m:zz'],
    puddle:     ['d', 'slime', '0|;900|Y-.24 X.18 e:shut m:zz'],
    droop:      ['d', 'plant', '0|;900|l.3 h.4 a.6 e:shut m:zz'],
    powerDown:  ['d', 'construct', '0|;600|h.35 Y-.06 e:shut m:zz'],
    sink:       ['d', 'spirit', '0|;1200|y6 Y-.06 r.1 e:shut m:zz'],
    standNap:   ['d', 'giant', '0|;1400|h.3 l.08 k.3 e:shut m:zz'],
    eggNap:     ['d', 'egg', '0|;900|r.05 m:zz'],
    startle:    ['s', '*', '0|;90|y-10 X.08 Y.1 e:open m:bang;260|y-10 X.06 Y.08 m:bang;420|Y-.07;700|'],
  };
  const MK = new Map(); Object.keys(MOM).forEach(n => { const [st, who, src] = MOM[n], K = keys(src); MK.set(n, {n, st, who: who.split(' '), K, dur: K[K.length - 1].ms, held: st === 'd'}); });
  const BATTLE_OK = {lookUp: 1, lookDown: 1, tailFlick: 1, listen: 1, perk: 1, brace: 1, paw: 1, aimTest: 1, scan: 1, heft: 1, groundTap: 1, wingStretch: 1, swirl: 1, giggle: 1, hum: 1};
  function fits(n, info) { const m = MK.get(n); if (info.egg) return m.who.includes('egg') || n === 'startle'; return m.who.some(f => f === '*' || f === info.fam || f === info.role || f === info.w || (f === 'pet' && info.pet)); }
  // sample a moment's keys at ms (robot = steps, not curves)
  function keyAt(K, ms, robot) { if (ms <= 0) return {}; for (let i = 1; i < K.length; i++) if (ms <= K[i].ms) { const a = K[i - 1], b = K[i], u = (ms - a.ms) / Math.max(1, b.ms - a.ms), e = robot ? (u < 0.5 ? 0 : 1) : E.sio(u), o = {};
      for (const k of NUM) { const va = a.p[k] || 0, vb = b.p[k] || 0; if (va || vb) o[k] = lerp(va, vb, e); } o.eye = (u < 0.5 ? a.p.eye : b.p.eye) || b.p.eye || a.p.eye; o.mk = b.p.mk || a.p.mk; return o; }
    return Object.assign({}, K[K.length - 1].p); }

  // ---------- 🫁 layers (tables built once per creature, 480 s then repeat) ----------
  const LOOP = 480;
  function tables(seed, R) { const br = [], bl = [], sh = []; let c = 0, i = 0;
    while (c < LOOP) { const sig = hsh('s' + seed, i) < 1 / 6, per = lerp(R.br[0], R.br[1], hsh('b' + seed, i)) * (sig ? 1.5 : 1); br.push([c, per, sig]); c += per; i++; }
    c = 0.6 + hsh('k' + seed, 0) * 1.5; i = 0; while (c < LOOP) { bl.push([c, hsh('d' + seed, i) < 0.2]); c += lerp(R.bl[0], R.bl[1], hsh('g' + seed, i++)); }
    c = 0; i = 0; let side = 0; while (c < LOOP) { const gap = lerp(R.sh[0], R.sh[1], hsh('h' + seed, i)); c += gap; const prev = side; side = side >= 0 ? -1 : 1; sh.push([c, prev, side]); i++; }
    return {br, bl, sh}; }
  const find = (A, t) => { let lo = 0, hi = A.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (A[m][0] <= t) lo = m; else hi = m - 1; } return lo; };
  function breathAt(T, t, deep) { t = ((t % LOOP) + LOOP) % LOOP; const [c, per0, sig] = T.br[find(T.br, t)], per = per0 * (deep ? 1.3 : 1), u = cl((t - c) / per, 0, 1);
    const b = u < 0.4 ? E.sio(u / 0.4) : u < 0.45 ? 1 : 1 - E.sio((u - 0.45) / 0.55); return b * (sig ? 1.8 : 1) * (deep ? 1.6 : 1); }
  function blinkAt(T, t, R) { t = ((t % LOOP) + LOOP) % LOOP; const [c, dbl] = T.bl[find(T.bl, t)], d = R.bms / 1000; return (t >= c && t < c + d) || (dbl && t >= c + d * 1.8 && t < c + d * 2.8); }
  function shiftAt(T, t, R) { t = ((t % LOOP) + LOOP) % LOOP; if (t < T.sh[0][0]) return 0; const [c, prev, side] = T.sh[find(T.sh, t)]; return lerp(prev, side, E.sio((t - c) / (R.shMs / 1000))); }
  function breathPose(b, fam, R) { const a = R.amp; switch (fam) {
      case 'slime': return {sy: a * 1.6 * b, sx: -a * 1.2 * b};
      case 'spirit': return {y: -2.6 * b, tail: 0.12 * b, sy: a * 0.5 * b};
      case 'construct': return {sy: a * 0.25 * b};
      case 'plant': return {lean: 0.035 * b, arm: -0.1 * b, sy: a * 0.6 * b};
      case 'bird': return {sy: a * b, sx: a * 0.5 * b, wing: 0.06 * b};
      case 'giant': return {sy: a * b, head: -0.035 * b, y: -0.6 * b, jaw: b > 1.2 ? 0.12 * (b - 1.2) : 0};
      default: return {sy: a * b, sx: -a * 0.35 * b, head: -0.025 * b, y: -0.5 * b}; } }

  // ---------- 📖 the story of one idle spell (seeded; shuffle bag per stage, never twice in a row; restarts at 👀 after a startle) ----------
  const STAGE = [[0, 'settle'], [3, 'curious'], [12, 'fidget'], [30, 'bored'], [60, 'doze']], GAP = {curious: [2.5, 5], fidget: [3, 6], bored: [4, 7]}, SC = {curious: 'c', fidget: 'f', bored: 'b'};
  const capOf = place => place === 'battle' ? 'curious' : place === 'map' ? 'bored' : 'doze';
  function stageAt(c, cap) { if (cap === 'curious') return c < 3 ? 'settle' : 'curious'; if (cap === 'bored' && c >= 60) c = 3 + ((c - 60) % 57); let s = 'settle'; for (const [a, n] of STAGE) if (c >= a) s = n; return s; }
  function story(seed, info, place) { const L = [], cap = capOf(place), bag = {};
    const pick = (st, i, last) => { const all = [...MK.keys()].filter(n => MK.get(n).st === st && fits(n, info) && (place !== 'battle' || BATTLE_OK[n])); if (!all.length) return null;
      let b = bag[st]; if (!b || !b.length) { b = all.slice().sort((p, q) => hsh(seed + p, i) - hsh(seed + q, i)); if (b[0] === last && b.length > 1) b.push(b.shift()); bag[st] = b; } return b.shift(); };
    const slow = (info.calm ? 1.25 : 1) / (info.baby ? 1.25 : 1); let c = 3, off = 0, i = 0, last = null;
    while (c < 600 && L.length < 400) { const sg = stageAt(c - off, cap);
      if (sg === 'doze') { const n = pick('d', i, last); if (n) { const e = c + 14 + hsh(seed, i) * 6; L.push({n, a: c, b: e, sg: 'doze'}); L.push({n: 'startle', a: e, b: e + 0.7, sg: 'startle'}); c = e + 3.2; off = c - 3; last = 'startle'; i++; continue; } }
      const n = pick(SC[sg] || 'c', i++, last); if (!n) break; const d = MK.get(n).dur / 1000 * slow; L.push({n, a: c, b: c + d, sg}); last = n; const gp = GAP[sg] || GAP.curious; c += d + lerp(gp[0], gp[1], hsh('p' + seed, i)); }
    return L; }

  // ---------- 🚶🏃 gait by weight + family ----------
  function gait(mode, ph, info, R) { const run = mode === 'run', A = run ? 1.45 : 1, s = Math.sin(ph), c = Math.cos(ph), o = {};
    if (HOPPER[info.fam]) { const u = ((ph / TAU) % 1 + 1) % 1, air = u > 0.25 && u < 0.85, ua = (u - 0.25) / 0.6; o.y = air ? -Math.sin(ua * Math.PI) * (run ? 14 : 9) * R.hop : 0; o.sy = air ? 0.08 * Math.sin(ua * Math.PI) : (u <= 0.25 ? -0.12 * Math.sin(u / 0.25 * Math.PI) : 0); o.sx = -o.sy * 0.8; o.lean = run ? 0.12 : 0.05; return o; }
    if (FLY[info.fam]) { o.y = -3 - Math.abs(s) * 3 * A; o.wing = 0.35 + 0.45 * Math.sin(ph * 2) * A; o.lean = run ? 0.18 : 0.08; o.tail = -0.2 * c; return o; }
    const hv = HEAVY[info.w] ? 1 : 0;
    o.fl = s * 0.45 * A * (hv ? 0.8 : 1); o.bl = -o.fl; o.arm = s * 0.3 * A; o.y = -Math.abs(s) * (run ? 3.2 : 1.6) * (hv ? 0.6 : 1);
    o.lean = (run ? 0.15 : 0.04) + (hv ? (run ? 0.08 : 0.06) : 0); o.head = -0.04 * c; o.tail = 0.2 * Math.sin(ph - 1.2); o.wing = 0.5 + s * 0.3;
    if (hv) { const foot = Math.pow(1 - Math.abs(s), 6); o.sy = -0.03 * foot; o.sx = 0.02 * foot; }
    return o; }

  // ---------- 🐾 the creature ----------
  function alive(def, opt) { opt = opt || {}; if (typeof def === 'string') def = CR.LIST[def] || CR.get(def); if (!def) return null;
    const w = wOf(CR.clsOf(def, opt)), R = W[w], seed = (def.name || 'x') + '|' + (opt.seed || ''), place = opt.place || 'menu';
    const ST = (def.pet || opt.pet) ? CR.stagesFor(def) : def.stages, S = (ST && ST[Math.min(ST.length - 1, opt.stage | 0)]) || {};
    const info = {fam: def.fam, role: def.role, w, pet: !!(def.pet || opt.pet), egg: !!S.egg, calm: !!opt.calm, baby: !!(def.pet || opt.pet) && (opt.stage | 0) <= 1};
    const own = {}; (FAMF[def.fam] || '').split(' ').forEach(k => { if (k) own[k] = 1; }); if (S.form === 'vine') own.y = 1;
    const fin = (P, F) => { const pose = {}; for (const k of NUM) { let v = (P[k] || 0) + ((F && F[k]) || 0); if (k === 'sx' || k === 'sy') v += 1; else if (!BODY[k] && !own[k]) v = 0; const L = LIM[k]; pose[k] = L ? cl(v, L[0], L[1]) : v; } return pose; };
    const T = tables(seed, R), ev = [{k: 'poke', t: opt.t0 || 0, i: 0}], stories = new Map(), subs = {thud: []}, fired = new Set(); let evn = 1;
    const push = e => { e.i = evn++; ev.push(e); ev.sort((a, b) => a.t - b.t || a.i - b.i); if (ev.length > 48) ev.splice(1, ev.length - 48); };
    const last = (k, t) => { let m = null; for (const e of ev) { if (e.t > t) break; if (e.k === k) m = e; } return m; };
    const spellOf = t => last('poke', t) || ev[0];
    function storyOf(sp) { let L = stories.get(sp.i); if (!L) { L = story(seed + '@' + sp.i, info, place); stories.set(sp.i, L); if (stories.size > 8) stories.delete(stories.keys().next().value); } return L; }
    function body(t, ladder) {   // breath + shift + story + gait + jump — NO follow-through
      const sp = spellOf(t), c = t - sp.t, mv = last('move', t), moving = !!(mv && mv.mode), P = {}, add = X => { for (const k in X) if (typeof X[k] === 'number' && X[k]) P[k] = (P[k] || 0) + X[k]; };
      let stage = c < 3 ? 'settle' : 'curious', moment = null, mk = null, eye = null, deep = false, thud = null, jph = null;
      if (!moving && !ladder) { const L = storyOf(sp); let lastS = null; for (const s of L) { if (s.a > c) break; lastS = s; if (c < s.b) moment = s; }
        stage = moment ? moment.sg : !lastS ? stage : lastS.sg === 'startle' ? 'curious' : lastS.sg;
        if (moment) { const m = MK.get(moment.n); let ms = (c - moment.a) * 1000 / (info.calm ? 1.25 : 1) * (info.baby ? 1.25 : 1); if (m.held) ms = Math.min(ms, m.dur);
          const X = keyAt(m.K, ms, info.fam === 'construct' && m.st === 'f'), sc = info.calm ? 0.6 : 1; for (const k of NUM) if (X[k]) P[k] = X[k] * sc; eye = X.eye || null; mk = X.mk || null; deep = m.held; } }
      const after = mv && !mv.mode && mv.from === 'run' ? cl(1 - (t - mv.t) / 4, 0, 1) : 0;   // quicker, deeper breaths for 4 s after a run
      const b = breathAt(T, t * (1 + after * 0.8), deep) * (1 + after * 0.6); add(breathPose(b, info.fam, R));
      if (!moving && !info.egg) { const sd = shiftAt(T, t, R) * (stage === 'doze' ? 0.3 : 1); add({shift: sd * R.shift, lean: sd * 0.03, head: -sd * 0.03}); }
      if (mv) { if (mv.mode) { const ph = (t - mv.t) * 9 * R.gait * (mv.mode === 'run' ? 1.6 : 1), bl = E.co((t - mv.t) * 1000 / R.chg), G = gait(mv.mode, ph, info, R); for (const k in G) G[k] *= bl;
          if (HEAVY[w]) { const u = (t - mv.t) * 1000 / R.chg; if (u < 0.35) add({lean: -0.06 * Math.sin(u / 0.35 * Math.PI)}); const step = Math.floor(ph / Math.PI); if (step >= 1 && (ph - step * Math.PI) < 0.35) { mk = 'dust'; thud = 'step:' + mv.i + ':' + step; } }
          add(G); }
        else if (mv.from) { const sms = R.stop * (mv.from === 'run' ? 1.4 : 1), u = (t - mv.t) * 1000 / sms; if (u < 1) { const k = Math.sin(u * Math.PI * 1.5) * (1 - u) * (mv.from === 'run' ? 1.4 : 1); add({lean: -0.1 * k, tail: 0.35 * k, wing: 0.2 * k, sy: info.fam === 'slime' ? -0.06 * k : 0}); } } }
      const jp = last('jump', t); if (jp) { const u = (t - jp.t) / jp.air, Ld = R.land;
        if (u < 1) { jph = 'air'; const s = w === 'light' ? 0.07 : w === 'medium' ? 0.05 : 0.03, up = u < 0.33 ? Math.sin(u / 0.33 * Math.PI) : 0;
          add({sy: s * up, sx: -s * 0.6 * up, fl: -0.4 * Math.sin(u * Math.PI), bl: 0.4 * Math.sin(u * Math.PI), tail: 0.5 * Math.cos(u * Math.PI), wing: 0.8 - u * 0.7, y: -(jp.lift || 0) * 4 * u * (1 - u)}); }
        else { const ms = (t - jp.t - jp.air) * 1000;
          if (ms < Ld[1]) { jph = 'land'; const k = E.co(ms / Ld[1]); add({sy: -Ld[0] * k, sx: Ld[0] * 0.6 * k, fl: 0.2 * k, tail: -0.3 * k}); if (HEAVY[w] && ms < 60) { thud = 'land:' + jp.i; mk = 'dust'; } }
          else if (ms < Ld[1] + Ld[2]) { jph = 'recover'; const k = 1 - E.bo((ms - Ld[1]) / Ld[2]); add({sy: -Ld[0] * k, sx: Ld[0] * 0.6 * k, tail: -0.3 * k}); } } }
      return {P, stage, moment: moment && moment.n, mk, eye, thud, jph, moving: moving ? mv.mode : false, b}; }
    function frame(t, ladder) { const B = body(t, ladder), Bl = body(t - R.lag / 1000, ladder), P = B.P, d = k => (Bl.P[k] || 0) - (P[k] || 0);
      // 🪢 follow-through: tail / wings / head take the body's lean + height from lag ms ago → trail while it moves, swing past when it stops
      const F = {tail: cl(d('lean') * 2.4 + d('shift') * 0.03 - d('y') * 0.04, -0.45, 0.45), wing: cl(-d('y') * 0.05, -0.3, 0.3), head: cl(d('lean') * 0.5, -0.12, 0.12)};
      const pose = fin(P, F);
      pose.eye = B.eye || 'open'; if (pose.eye === 'open' && B.stage !== 'doze' && !info.egg && blinkAt(T, t, R)) pose.eye = 'shut';
      return {pose, B}; }
    // 🕰️ own clock for the kit's built-in loops: slow drift (never lines up) and 55 % slower while it dozes (continuous over pokes)
    function dozeIn(sp, upto) { const L = storyOf(sp); let dz = 0; for (const s of L) { if (s.a >= upto) break; if (MK.get(s.n).held) dz += Math.min(upto, s.b) - s.a; } return dz; }
    function tw(t) { let dz = 0; for (let i = 0; i < ev.length; i++) { const e = ev[i]; if (e.k !== 'poke' || e.t > t) continue; let nx = t; for (let j = i + 1; j < ev.length; j++) if (ev[j].k === 'poke' && ev[j].t <= t) { nx = ev[j].t; break; } dz += dozeIn(e, nx - e.t); }
      return t - dz * 0.55 + 0.22 * Math.sin(t * 0.41 + hsh(seed, 9) * 6) + 0.14 * Math.sin(t * 0.23 + 2); }
    const A = {
      at(t, o) { o = o || {}; const ladder = !!o.finish && o.focus === false, {pose, B} = frame(o.finish && !ladder ? Math.round(t * 10) / 10 : t, ladder);   // 🧊 focus = 10 looks a second
        if (B.thud && !fired.has(B.thud)) { fired.add(B.thud); if (fired.size > 64) fired.delete(fired.values().next().value); subs.thud.forEach(f => f(t, B.thud.split(':')[0])); }
        let tt = tw(t);
        if (o.finish) {   // 🧊 looks the finish cache can keep: 🪜 ladder = breath 4 steps × blink 2 × shift 3 (24 looks) · focus = 10 looks a second
          if (ladder) { const bs = Math.round(cl(B.b / 1.8, 0, 1) * 3), sd = Math.round(shiftAt(T, t, R)); const P = {}, add = X => { for (const k in X) P[k] = (P[k] || 0) + X[k]; };
            add(breathPose(bs / 3 * 1.8, info.fam, R)); if (!info.egg) add({shift: sd * R.shift, lean: sd * 0.03, head: -sd * 0.03});
            const Q = fin(P); for (const k of NUM) pose[k] = Q[k]; tt = 0.4 + bs * 0.2; }
          else { tt = Math.round(t * 10) / 10; for (const k of NUM) { const q = k === 'y' || k === 'shift' ? 1 : k === 'sx' || k === 'sy' ? 0.01 : 0.04; pose[k] = Math.round(pose[k] / q) * q; } }
          return {pose, t: tt, finish: true, _ca: {stage: ladder ? 'ladder' : B.stage, moment: ladder ? null : B.moment, mk: null, thud: !!B.thud, jump: B.jph, moving: B.moving, w, breath: B.b}}; }
        return {pose, t: tt, _ca: {stage: B.stage, moment: B.moment, mk: B.mk, thud: !!B.thud, jump: B.jph, moving: B.moving, w, breath: B.b}}; },
      poke(t) { push({k: 'poke', t}); return A; },
      moving(mode, t) { const m = last('move', t); push({k: 'move', t, mode: mode || false, from: m && m.mode}); if (!mode) push({k: 'poke', t}); return A; },
      jump(t, o) { o = o || {}; push({k: 'jump', t, air: o.air || 0.45, lift: o.lift || 0}); push({k: 'poke', t}); return A; },
      state(t) { return A.at(t)._ca; }, on(n, f) { (subs[n] = subs[n] || []).push(f); return A; },
      story(t) { return storyOf(spellOf(t)); }, info, w, R};
    return A; }

  // ---------- ✨ little marks at the creature's anchors (zZ · ♪ · ! · ♥ · bubbles · steam · sparkle · dust) ----------
  function marks(g, An, f, x, y, dir, size) { const mk = f && f._ca && f._ca.mk; if (!mk || !An) return; dir = dir || 1; const u = An.u || (size || 100) / 100, P = f.pose || {}, top = An.top || An.head || [0, -40], s = Math.max(8, u * 14), tt = f.t || 0;
    const X0 = x + (top[0] + (P.shift || 0)) * u * dir, Y0 = y + (top[1] + (P.y || 0)) * u;
    g.save(); g.textAlign = 'center'; g.lineJoin = 'round';
    const txt = (str, X, Y, sz, col) => { g.font = 'bold ' + Math.round(sz) + 'px sans-serif'; g.lineWidth = sz * 0.22; g.strokeStyle = '#fff'; g.strokeText(str, X, Y); g.fillStyle = col; g.fillText(str, X, Y); };
    if (mk === 'zz') for (let i = 0; i < 3; i++) { const p = ((tt * 0.45) + i / 3) % 1; g.globalAlpha = Math.sin(p * Math.PI); txt('z', X0 - dir * (8 + p * 22), Y0 - 6 - p * 26, s * (0.7 + p * 0.6), '#5A6BC8'); }
    if (mk === 'notes') for (let i = 0; i < 2; i++) { const p = ((tt * 0.7) + i / 2) % 1; g.globalAlpha = Math.sin(p * Math.PI); txt('♪', X0 + (i ? -12 : 12) + Math.sin(p * 6) * 4, Y0 - 4 - p * 24, s, '#C0479A'); }
    if (mk === 'bang') txt('!', X0, Y0 - 10, s * 1.5, '#E63946');
    if (mk === 'heart') { g.globalAlpha = 0.6 + 0.4 * Math.sin(tt * 6); txt('♥', X0 + 14, Y0 - 10, s * 1.1, '#FF5A8A'); }
    if (mk === 'bubble') for (let i = 0; i < 3; i++) { const p = ((tt * 0.6) + i / 3) % 1; g.globalAlpha = 1 - p; g.strokeStyle = '#4AA8FF'; g.lineWidth = 1.6; g.beginPath(); g.arc(X0 + (i - 1) * 9, Y0 - p * 26, 2.5 + p * 3, 0, TAU); g.stroke(); }
    if (mk === 'steam') for (let i = 0; i < 3; i++) { const p = ((tt * 0.8) + i / 3) % 1; g.globalAlpha = (1 - p) * 0.7; g.fillStyle = '#C9CED8'; g.beginPath(); g.arc(X0 + 6 + p * 10, Y0 - 2 - p * 22, 3 + p * 5, 0, TAU); g.fill(); }
    if (mk === 'sparkle') for (let i = 0; i < 4; i++) { const p = ((tt * 0.5) + i / 4) % 1; g.globalAlpha = 1 - p; g.fillStyle = '#FFE07A'; const sx = X0 + Math.sin(i * 2.1) * 18, sy = Y0 + 10 - p * 30; g.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, r = k % 2 ? 1 : 4; k ? g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r) : g.moveTo(sx + r, sy); } g.fill(); }
    if (mk === 'dust') { g.globalAlpha = 0.45; g.fillStyle = '#B8A07A'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(x + (i - 2) * u * 12, y - 2 - (i % 2) * 3, u * (5 + (i % 3) * 2), 0, TAU); g.fill(); } }
    g.restore(); }

  // picture / lab helper: one named moment at ms (+ the calm base)
  function moment(def, n, ms, o) { o = o || {}; const m = MK.get(n); if (!m) return null; const X = keyAt(m.K, ms, (typeof def === 'string' ? (CR.LIST[def] || {}) : def).fam === 'construct' && m.st === 'f'), pose = {};
    for (const k of NUM) pose[k] = (k === 'sx' || k === 'sy' ? 1 : 0) + (X[k] || 0); pose.eye = X.eye || 'open'; return {pose, t: o.t || 0.4, _ca: {mk: X.mk, stage: m.st, moment: n}}; }

  CR.alive = alive; CR.aliveMarks = marks;
  CR.ALIVE = {VERSION: 'mo-10', W, MOM, MK, BATTLE_OK, wOf, fits, story, stageAt, tables, breathAt, blinkAt, shiftAt, breathPose, gait, keyAt, moment, NUM};
  if (window.Motion && !window.Motion.creatureAlive) { window.Motion.creatureAlive = alive; window.Motion.creatureMarks = marks; }
})();
