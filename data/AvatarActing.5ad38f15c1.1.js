
(function(){
'use strict';
if(window.Acting) return;
const T = {faces: {}, poses: {}, marks: {}, tricks: {}, acts: {}, pools: {}};
const ERRORS = [], BLOCKS = [];
const clone = o => JSON.parse(JSON.stringify(o));
function hashStr(s){ let h = 2166136261; s = String(s); for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* ---------- registry: add, never overwrite ---------- */
function add(pack, who){
  who = who || {}; const by = who.by || '?', block = who.block || by;
  if(!BLOCKS.some(b => b.id === block)) BLOCKS.push({id: block, by, game: who.game || '', date: who.date || ''});
  Object.keys(pack || {}).forEach(kind => {
    const table = T[kind]; if(!table){ ERRORS.push('unknown kind ' + kind + ' (' + block + ')'); return; }
    Object.keys(pack[kind]).forEach(key => {
      if(kind === 'pools'){ table[key] = (table[key] || []).concat(pack[kind][key].filter(x => !(table[key] || []).includes(x))); return; }   // pools grow from every block
      if(table[key]){ const m = '🎭 Acting.add: ' + kind + ' "' + key + '" already exists — kept the first one (block ' + block + ')'; ERRORS.push(m); console.error(m); return; }
      const v = pack[kind][key]; if(v && typeof v === 'object' && !Array.isArray(v)){ v.by = v.by || by; v.block = block; if(who.game && !v.from) v.from = who.game; if(who.date && !v.added) v.added = who.date; }
      table[key] = v;
      if(kind === 'faces' && window.AK) AK.presets[key] = v;   // AvatarKit paints faces by preset key
    });
  });
}
function get(kind, key){ return T[kind] && T[kind][key]; }
function list(kind, filter){
  const t = T[kind] || {}; filter = filter || {};
  return Object.keys(t).filter(k => { const v = t[k]; if(!v || typeof v !== 'object') return true;
    if(filter.tag && !(v.tags || []).includes(filter.tag)) return false;
    if(filter.shared && !(v.share || v.block && v.block.indexOf('core') === 0)) return false; return true; });
}

/* ---------- acts → pose + face + marks + tricks ---------- */
function resolve(actKey, opt){
  opt = opt || {};
  let A = T.acts[actKey];
  if(!A && T.poses[actKey]) A = {pose: actKey};
  if(!A) return null;
  if(A.variants && A.variants.length && opt.variant !== 0){
    const vs = [A].concat(A.variants.map(v => Object.assign({}, A, {variants: null}, v)));
    const i = opt.variant != null ? opt.variant % vs.length : (hashStr((opt.seed || '') + actKey) % vs.length);
    A = vs[i];
  }
  const base = typeof A.pose === 'string' ? (T.poses[A.pose] || {}) : (A.pose || (A.beats ? Object.assign({face: A.beats[contactIx(A.beats)].face}, beatPose(A.beats[contactIx(A.beats)])) : {}));   /* 🎬 b1a: a beat act by name = its contact pose */
  return {act: A, pose: Object.assign({}, base), face: A.face || base.face || null, marks: A.marks || base.marks || [], tricks: A.tricks || base.tricks || [],
    ride: A.ride || base.ride || 'drop', hold: A.hold || 'keep', pet: A.pet || null, gest: A.gest || null};
}
// gear rules: sport / fight acts step off the ride, held item can be swapped for the game's own item
function gearFor(av, R, opt){
  av = av ? clone(av) : av; if(!av) return av;
  av.eq = av.eq || {};
  const ride = opt.ride || R.ride;
  if(ride === 'drop' && av.eq.ride) delete av.eq.ride;
  const hold = opt.item !== undefined ? opt.item : R.hold;
  if(hold === 'none'){ delete av.eq.hand; if(av.cw) delete av.cw.hand; }
  else if(hold && typeof hold === 'object'){ av.eq.hand = hold; if(av.cw) delete av.cw.hand; }
  if(opt.noPet) delete av.eq.pet;
  return av;
}
function motion(R, t){   // tiny 'alive' loop on top of any pose (breath / bob), plus trick-driven body changes
  const P = R.pose, w = Math.sin(t * 6);
  if(P.alive !== false){ P.sy = (P.sy || 1) * (1 + w * 0.02); P.sx = (P.sx || 1) * (1 - w * 0.015); if(P.armR != null) P.armR += w * 0.05; }
  R.tricks.forEach(tr => { const f = T.tricks[tr]; if(f && f.body) f.body(P, t); });
  return P;
}

/* ---------- drawing ---------- */
const OFF = {};
function offCanvas(id, w, h){ let c = OFF[id]; if(!c){ c = OFF[id] = document.createElement('canvas'); } if(c.width !== w || c.height !== h){ c.width = w; c.height = h; } return c; }
function draw(g, who, x, y, k, actKey, opt){
  opt = opt || {}; const t = opt.t != null ? opt.t : (performance.now() / 1000);
  const R = (actKey && typeof actKey === 'object') ? frameR(actKey) : (resolve(actKey, opt) || resolve('idle', opt)); if(!R) return;   /* 🎬 b1a: a beat frame */
  const P = motion(R, t); if(R.face) P.face = R.face;
  const av = gearFor(who.av, R, opt), dir = opt.dir || who.dir || 1;
  const a = opt.keep ? Object.assign({}, who, {av, dir, gest: null}) : {name: who.name, av, dir};   // as-2: keep = Room people keep pet / tag / jump
  if(R.gest && typeof GESTURES !== 'undefined'){ const gs = GESTURES.find(q => q.k === R.gest); if(gs) a.gest = {g: gs, t: (t % gs.d)}; }
  const ctx = {g, x, y, k, t, dir, P, who, a, opt};
  R.tricks.forEach(tr => { const f = T.tricks[tr]; if(f && f.back) f.back(ctx); });
  const wrap = R.tricks.map(tr => T.tricks[tr]).find(f => f && f.wrap);
  if(P.shift){ x += P.shift * k * dir; }   /* ↔️ b1a2: body shift */
  const paint = (G, X, Y) => drawAvatar(G, a, X, Y, k, {t, pose: P, still: true});
  if(wrap) wrap.wrap(ctx, paint); else paint(g, x, y);
  if(actKey && typeof actKey === 'object' && actKey.prop && !opt.noProp) drawProp(g, x, y, k, dir, actKey.prop, opt);   /* 🎯 b1a: the thrown / kicked object */
  const head = window.AK && AK.head;
  R.marks.forEach(mk => { const f = T.marks[mk]; if(f && head) { g.save(); g.setTransform(head.m); f(g, head.hy, head.k, t, ctx); g.restore(); } });
  R.tricks.forEach(tr => { const f = T.tricks[tr]; if(f && f.front) f.front(ctx); });
  return R;
}
// cached pictures of an act (crowds, comics, cards): n frames over `loop` seconds, sized w × h CSS px at dpr
const FRAMES = {};
function frames(who, actKey, o){
  o = o || {}; const w = o.w || 120, h = o.h || 140, dpr = o.dpr || Math.min(2, window.devicePixelRatio || 1), n = o.n || 6, loop = o.loop || 1;
  const key = [who.name, JSON.stringify(who.av || {}).length, hashStr(JSON.stringify(who.av || {})), actKey, w, h, dpr, n, loop, o.variant, o.dir, JSON.stringify(o.item || '')].join('|');
  if(FRAMES[key]) return FRAMES[key];
  const f = fit(who, [actKey], w, h, o);
  const out = [];
  for(let i = 0; i < n; i++){
    const c = document.createElement('canvas'); c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    const g = c.getContext('2d'); g.scale(dpr, dpr);
    draw(g, who, f.x, f.y, f.k, actKey, Object.assign({}, o, {t: (o.t0 || 0) + i / n * loop}));
    out.push(c);
  }
  return (FRAMES[key] = out);
}
// measure the real painted box (gear + marks + tricks) → k, x, feet y that fit w × h
const FIT = {};
function fit(who, actKeys, w, h, o){
  o = o || {}; const pad = o.pad != null ? o.pad : 4;
  const key = [hashStr(JSON.stringify(who.av || {})), actKeys.map(a => typeof a === 'string' ? a : a.id).join(','), o.dir || 1, JSON.stringify(o.item || ''), o.variant == null ? 'v' : o.variant, o.ride || ''].join('|');
  let box = FIT[key];
  if(!box){
    const c = offCanvas('fit', 420, 420), g = c.getContext('2d'); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    const span = ak => { const A = typeof ak === 'string' && T.acts[ak], gs = A && A.gest && typeof GESTURES !== 'undefined' && GESTURES.find(q => q.k === A.gest); return gs ? gs.d : 1; };
    actKeys.forEach(ak => { const d = span(ak), n = d > 1 ? 12 : 8; return Array.from({length: n}, (_, i) => i / n * d).forEach(tt => {
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 420, 420);
      draw(g, who, 210, 300, 1.6, ak, Object.assign({}, o, {t: tt}));
      const px = g.getImageData(0, 0, 420, 420).data;
      for(let yy = 0; yy < 420; yy += 2) for(let xx = 0; xx < 420; xx += 2) if(px[(yy * 420 + xx) * 4 + 3] > 24){ if(xx < x0) x0 = xx; if(xx > x1) x1 = xx; if(yy < y0) y0 = yy; if(yy > y1) y1 = yy; }
    }); });
    if(x1 < x0){ x0 = 170; x1 = 250; y0 = 160; y1 = 300; }
    box = FIT[key] = {l: (210 - x0) / 1.6, r: (x1 - 210) / 1.6, t: (300 - y0) / 1.6, b: (y1 - 300) / 1.6};
  }
  const bw = box.l + box.r, bh = box.t + box.b, k = Math.min((w - pad * 2) / bw, (h - pad * 2) / bh, o.maxK || 9);
  return {k, x: w / 2 - (box.r - box.l) / 2 * k, y: h - pad - box.b * k, box};
}
// variety: never the same act twice in a row; neighbours differ
const LAST = {};
function pick(pool, o){
  o = o || {}; const L = (T.pools[pool] || []).filter(k => T.acts[k] || T.poses[k]); if(!L.length) return 'idle';
  const avoid = [].concat(o.avoid || []), lastKey = pool + '|' + (o.who || '');
  let cand = L.filter(k => !avoid.includes(k) && k !== LAST[lastKey]); if(!cand.length) cand = L;
  const r = o.seed != null ? (hashStr(o.seed + pool) % 1000) / 1000 : Math.random();
  const k = cand[Math.floor(r * cand.length)]; LAST[lastKey] = k; return k;
}
function sig(av){ const s = av && av.sig; return s && T.acts[s] ? s : 'victory'; }   // 🎭 Signature act (AS-2): av.sig or 🏆 victory
// 🎭 as-2 Signature acts: SIG.free = everyone · SIG.line = the 'sigact' item line (Code.gs SIG_ACTS_, same order) · sigs(have) = the picker list
const SIG = {id: 'sigact', free: [], line: [], names: {}};
function sigs(have){ have = Number(have) || 0; return SIG.free.map(k => ({k, n: SIG.names[k] || k, free: true, own: true}))
  .concat(SIG.line.map((k, i) => ({k, n: SIG.names[k] || k, step: i, own: i < have}))).filter(o => T.acts[o.k]); }
// list of shared acts for shelves / news: [{k, act, by, from, added}] — newest first (blocks with a date)
function shared(o){ o = o || {}; return Object.keys(T.acts).filter(k => { const v = T.acts[k]; return v && v.share && (!o.tag || (v.tags || []).includes(o.tag)) && (!o.since || (v.added || '') >= o.since); })
  .map(k => ({k, act: T.acts[k], by: T.acts[k].by, from: T.acts[k].from || '', added: T.acts[k].added || ''})).sort((a, b) => (b.added || '').localeCompare(a.added || '')); }

/* ---------- 🎬 BEATS (B1a, 🧱 baseline chat) — every avatar ACTION = ready → anticipation → contact → follow-through (→ settle) ----------
   act: {beats: [{pose, face?, marks?, tricks?, ms, ease?, tr?, contact?, name?}], tags}   (pose = a pose key or a pose object)
   A beat's pose is reached `tr` ms into the beat (default: the whole beat; the contact beat snaps in ≤ 40 ms) and held for the rest.
   THE CONTACT MOMENT = when the contact pose arrives. run = Acting.play(who, act, {t0, contactAt, onContact, onBeat, speed, from, hold})
   → each frame f = run.at(t) (t in seconds, same clock as t0 / contactAt) → Acting.draw(g, who, x, y, k, f, opt).
   contactAt: the game owns contact — the ready beat soaks up spare time, the anticipation grows to ≤ 250 ms or shrinks to 60 ms, then is skipped.
   from: a frame / run still playing → the first beat starts from that body (no jump). speed: ×1.15 for 🌱 Basic (the contact snap never slows).
   An act without beats → a run that holds its one pose (`hold` ms, default 400) with contact at the start. */
const BEAT_NAMES = ['ready', 'anticipation', 'contact', 'follow', 'settle'];
/* 🎚️ EASING LIBRARY (B1a+, Aowu 09:05 "easing functions help sport games a lot"): t ∈ [0, 1] → progress (back / elastic may overshoot).
   Value = Start + (End − Start) × f(t). Families × directions: <family>In · <family>Out · <family>InOut for
   quad (gentle) · cubic (momentum) · quart / quint (snappy) · sine (smooth) · expo (from a standstill) · circ (sharp) · back (overshoot) · elastic (spring) · bounce (gravity).
   Out(t) = 1 − In(1 − t) · InOut joins In + Out at t = 0.5. Also: linear · hold (pop to the pose) · 'steps(n)' · 'cubic-bezier(x1, y1, x2, y2)' (CSS, Newton–Raphson + bisection)
   · CSS 'ease' 'ease-in' 'ease-out' 'ease-in-out' · 'back:<c>' (overshoot amount, default 1.70158) · 'elastic:<period>' (default 0.3).
   Short names kept: in = quadIn · out = quadOut · inout = quadInOut · snap = quartOut · back = backOut · elastic = elasticOut · bounce = bounceOut.
   Beat defaults (DEF_EASE): ready sineInOut · anticipation cubicOut (settles INTO the coil) · contact quartOut (snap) · follow backOut (overshoot) · settle sineInOut. */
function bounceOut(t){ const n = 7.5625, d = 2.75; if(t < 1 / d) return n * t * t; if(t < 2 / d){ t -= 1.5 / d; return n * t * t + 0.75; } if(t < 2.5 / d){ t -= 2.25 / d; return n * t * t + 0.9375; } t -= 2.625 / d; return n * t * t + 0.984375; }
const backIn = c => t => (c + 1) * t * t * t - c * t * t;
const elasticIn = per => t => t <= 0 ? 0 : t >= 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI / (per * 10 / 1)));
const EASE_IN = {quad: t => t * t, cubic: t => t * t * t, quart: t => t * t * t * t, quint: t => t * t * t * t * t,
  sine: t => 1 - Math.cos(t * Math.PI / 2), expo: t => t <= 0 ? 0 : Math.pow(2, 10 * t - 10), circ: t => 1 - Math.sqrt(Math.max(0, 1 - t * t)),
  back: backIn(1.70158), elastic: elasticIn(0.3), bounce: t => 1 - bounceOut(1 - t)};
const dirs = i => ({In: i, Out: t => 1 - i(1 - t), InOut: t => t < 0.5 ? i(2 * t) / 2 : 1 - i(2 - 2 * t) / 2});
function bezier(x1, y1, x2, y2){
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = u => ((ax * u + bx) * u + cx) * u, Y = u => ((ay * u + by) * u + cy) * u, dX = u => (3 * ax * u + 2 * bx) * u + cx;
  return t => { if(t <= 0) return 0; if(t >= 1) return 1; let u = t;
    for(let i = 0; i < 8; i++){ const x = X(u) - t; if(Math.abs(x) < 1e-7) return Y(u); const d = dX(u); if(Math.abs(d) < 1e-6) break; const n = u - x / d; if(n < 0 || n > 1) break; u = n; }
    let lo = 0, hi = 1; u = t; for(let i = 0; i < 40; i++){ const x = X(u); if(Math.abs(x - t) < 1e-7) break; if(x < t) lo = u; else hi = u; u = (lo + hi) / 2; }
    return Y(u); };
}
const EASE = (() => {
  const E = {linear: t => t, hold: t => 1};
  Object.keys(EASE_IN).forEach(f => { const D3 = dirs(EASE_IN[f]); E[f + 'In'] = D3.In; E[f + 'Out'] = f === 'bounce' ? bounceOut : D3.Out; E[f + 'InOut'] = D3.InOut; });
  Object.assign(E, {in: E.quadIn, out: E.quadOut, inout: E.quadInOut, snap: E.quartOut, back: E.backOut, elastic: E.elasticOut, bounce: E.bounceOut,
    ease: bezier(0.25, 0.1, 0.25, 1), 'ease-in': bezier(0.42, 0, 1, 1), 'ease-out': bezier(0, 0, 0.58, 1), 'ease-in-out': bezier(0.42, 0, 0.58, 1)});
  return E;
})();
const EASE_MEMO = {};
// any ease: a function · a name · 'cubic-bezier(a, b, c, d)' · 'steps(n)' · 'back:<c>' / 'backIn:<c>' / 'backInOut:<c>' · 'elastic:<period>' (+ In / InOut)
function easeOf(e){
  if(typeof e === 'function') return e; if(!e) return EASE.quadInOut;
  if(EASE[e]) return EASE[e]; if(EASE_MEMO[e]) return EASE_MEMO[e];
  let f = null, m;
  if((m = /^cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/.exec(e))) f = bezier(+m[1], +m[2], +m[3], +m[4]);
  else if((m = /^steps\(\s*(\d+)\s*\)$/.exec(e))) { const n = Math.max(1, +m[1]); f = t => t >= 1 ? 1 : Math.floor(t * n) / n; }
  else if((m = /^(back|elastic)(In|Out|InOut)?:([\d.]+)$/.exec(e))) { const D3 = dirs(m[1] === 'back' ? backIn(+m[3]) : elasticIn(+m[3])); f = D3[m[2] || 'Out']; }
  if(!f){ ERRORS.push('🎚️ unknown ease "' + e + '" → quadInOut'); f = EASE.quadInOut; }
  return (EASE_MEMO[e] = f);
}
const DEF_EASE = {ready: 'sineInOut', anticipation: 'cubicOut', contact: 'quartOut', follow: 'backOut', settle: 'sineInOut'};
const POSE_DEF = {armL: 0.15, armR: 0.15, legL: 0, legR: 0, elbowL: 0, elbowR: 0, kneeL: 0, kneeR: 0, footL: 0, footR: 0, platform: 0,
  bend: 0, rot: 0, rotFull: 0, dy: 0, sx: 1, sy: 1, holdRot: 0, slide: 0, headSc: 1, shift: 0};
const ZERO_OUT = ['elbowL', 'elbowR', 'kneeL', 'kneeR', 'footL', 'footR', 'platform', 'bend', 'rotFull', 'slide', 'holdRot', 'shift'];
function beatPose(b){ if(!b) return {}; const base = typeof b.pose === 'string' ? (T.poses[b.pose] || {}) : (b.pose || {}); return Object.assign({}, base); }
function contactIx(beats){ const i = beats.findIndex(b => b.contact); return i >= 0 ? i : Math.min(2, beats.length - 1); }
function lerpPose(A, B, q){
  const P = {}; Object.keys(A).concat(Object.keys(B)).forEach(f => {
    if(f in P || f === 'tags' || f === 'by' || f === 'block' || f === 'from' || f === 'added' || f === 'share') return;
    const a = A[f], b = B[f];
    if(f in POSE_DEF){ const x = a == null ? POSE_DEF[f] : a, y = b == null ? POSE_DEF[f] : b; P[f] = x + (y - x) * q; }
    else P[f] = q < 0.5 ? (a !== undefined ? a : b) : (b !== undefined ? b : a);
  });
  ZERO_OUT.forEach(f => { if(P[f] != null && Math.abs(P[f]) < 1e-9) delete P[f]; });   // a field back at 0 = the old drawing path again
  return P;
}
function frameR(f){
  return {act: f.act || {}, pose: Object.assign({alive: false}, f.pose), face: f.face || null, marks: f.marks || [], tricks: f.tricks || [],
    ride: f.ride || 'drop', hold: f.hold || 'keep', pet: null, gest: null};
}
// avatar-local point (k = 1, facing right, feet at 0, 0) of the front hand / the front foot — same transforms as drawAvatar (bend → rot → rotFull → scale → dy)
function bodyPoint(P, x, y, upper){
  const rotAbout = (cx, cy, a) => { const dx = x - cx, dy = y - cy, c = Math.cos(a), s = Math.sin(a); x = cx + dx * c - dy * s; y = cy + dx * s + dy * c; };
  if(upper && P.bend) rotAbout(0, -20, P.bend); if(P.rot) rotAbout(0, 0, P.rot); if(P.rotFull) rotAbout(0, -34, P.rotFull);
  return [x * (P.sx || 1) + (P.shift || 0), y * (P.sy || 1) + (P.dy || 0)];   /* shift = body moved along its facing */
}
function handAt(P){ const Q = Object.assign({armR: 0.15}, P), h = typeof AKJ !== 'undefined' ? AKJ.frontHand(Q, 1, 16) : [10 + Math.sin(Q.armR) * 16, -42 + Math.cos(Q.armR) * 16]; return bodyPoint(Q, h[0], h[1], true); }
function footAt(P){ const a = -(P.legL || 0), kn = P.kneeL || 0, j = [-5 - Math.sin(a) * 9, -20 + Math.cos(a) * 9], e = [j[0] - Math.sin(a + kn) * 9, j[1] + Math.cos(a + kn) * 9]; return bodyPoint(P, e[0], e[1], false); }
// the object of a beat frame (f.prop): stretched along its flight, spun, with a short speed trail; opt.drawProp(g, 0, 0, sizePx, prop) = the game's own picture
function drawProp(g, x, y, k, dir, pr, opt){
  const paint = (G, s) => { if(opt.drawProp) opt.drawProp(G, 0, 0, s, pr); else if(typeof emo === 'function') emo(G, pr.ch, 0, 0, s); else { G.fillStyle = '#E8453C'; G.beginPath(); G.arc(0, 0, s / 2, 0, 7); G.fill(); } };
  const s = pr.size * k;
  (pr.trail || []).forEach(t => { g.save(); g.globalAlpha *= t.a; g.translate(x + t.x * k * dir, y + t.y * k); paint(g, s * 0.85); g.restore(); });
  g.save(); g.translate(x + pr.x * k * dir, y + pr.y * k); const a = dir < 0 ? Math.PI - pr.ang : pr.ang;
  g.rotate(a); g.scale(pr.along, pr.across); g.rotate(-a + pr.rot * dir); paint(g, s); g.restore();
}
function play(who, actKey, o){
  o = o || {};
  const A = T.acts[actKey] || (T.poses[actKey] ? {pose: actKey} : null) || T.acts.idle;
  const t0 = o.t0 != null ? o.t0 : performance.now() / 1000, speed = o.speed || 1;
  let beats;
  if(A.beats && A.beats.length) beats = A.beats.map((b, i) => Object.assign({name: BEAT_NAMES[i] || 'beat' + i}, b));
  else { const R = resolve(actKey) || resolve('idle'); beats = [{name: 'contact', pose: R.pose, face: R.face, marks: R.marks, tricks: R.tricks, ms: o.hold || 400, tr: 0, contact: true}]; }
  const ci = contactIx(beats);
  // durations (ms): every beat × speed except the contact snap; tr = time to reach the pose
  const D = beats.map((b, i) => { const ms = Math.max(0, (b.ms != null ? b.ms : 120) * (i === ci ? 1 : speed)); const tr = b.tr != null ? Math.min(ms, b.tr) : i === ci ? Math.min(ms, 40) : ms; return {ms, tr}; });
  // 🎯 contactAt: fit the beats before contact so the contact pose arrives exactly then
  if(o.contactAt != null && ci >= 0){
    const lead = Math.max(0, (o.contactAt - t0) * 1000), ai = ci - 1, ri = ci - 2;
    const pre = D.slice(0, ci).reduce((n, d) => n + d.ms, 0) + D[ci].tr;
    let extra = lead - pre;
    if(extra > 0){ if(ai >= 0){ const g = Math.min(extra, Math.max(0, 250 - D[ai].ms)); D[ai].ms += g; D[ai].tr += g; extra -= g; } if(extra > 0){ const h = ri >= 0 ? ri : 0; D[h].ms += extra; if(h === ci) D[h].tr += extra; } }
    else if(extra < 0){ let cut = -extra;
      for(let i = 0; i < ci - 1 && cut > 0; i++){ const c = Math.min(cut, D[i].ms); D[i].ms -= c; D[i].tr = Math.min(D[i].tr, D[i].ms); cut -= c; }   // ready (+ earlier beats) first
      if(cut > 0 && ai >= 0){ const room = D[ai].ms - 60; if(room >= cut){ D[ai].ms -= cut; D[ai].tr = Math.min(D[ai].tr, D[ai].ms); cut = 0; } else { cut -= D[ai].ms; D[ai].ms = 0; D[ai].tr = 0; } }   // anticipation ≥ 60 ms, else skipped
      if(cut > 0){ const c = Math.min(cut, D[ci].tr); D[ci].tr -= c; D[ci].ms -= c; }
    }
    const pre2 = D.slice(0, ci).reduce((n, d) => n + d.ms, 0) + D[ci].tr;   // a skipped anticipation leaves a gap → the ready beat holds it (3-beat acts: a slower contact move)
    if(pre2 < lead - 1e-9){ const gap = lead - pre2, h = ci >= 2 ? ci - 2 : -1; if(h >= 0) D[h].ms += gap; else { D[ci].tr += gap; D[ci].ms += gap; } }
  }
  const STOP = Math.max(0, (beats[ci] && beats[ci].stop) || A.stop || 0);   /* 💥 hit-stop (b1a2) */
  D[ci].ms += STOP;
  let acc = 0; const start = D.map(d => { const s0 = acc; acc += d.ms; return s0; });
  const total = acc, contactMs = start[ci] + D[ci].tr;
  const fromPose = o.from ? (o.from.pose || (o.from.last && o.from.last.pose) || null) : null;
  const poses = beats.map(beatPose);
  // the body at a moment (pure: no callbacks) — used by at(), the object track and the held-item drag
  const eases = beats.map((b, i) => easeOf(b.ease || DEF_EASE[b.name] || (i === ci ? 'snap' : 'inout')));   /* 🎚️ b1a2 */
  const raw = el => {
    let i = beats.length - 1; for(let j = 0; j < beats.length; j++){ if(el < start[j] + D[j].ms){ i = j; break; } }
    if(el < 0) i = 0;
    const prev = i === 0 ? (fromPose || poses[0]) : poses[i - 1];
    const q = D[i].tr > 0 ? Math.min(1, Math.max(0, (el - start[i]) / D[i].tr)) : 1;
    return {i, q, pose: lerpPose(prev, poses[i], eases[i](q))};
  };
  // 🪢 overlapping action: listed fields take their value from `ms` earlier (arms trail the body, hair / cape later still)
  const ago = (el, ms) => { const c = el < contactMs ? el : el < contactMs + STOP ? contactMs : el - STOP, x = c - ms; return x < contactMs ? x : x + STOP; };   /* ⏸️ b1a2: stopped clock */
  const sample = el => { const S = raw(el), OV = Object.assign({}, A.overlap || {}, beats[S.i].overlap || {});
    Object.keys(OV).forEach(f => { if(OV[f] > 0){ const v = raw(ago(el, OV[f])).pose[f]; if(v != null) S.pose[f] = v; else delete S.pose[f]; } });
    return S; };
  const PR = A.prop || null, LAG = PR && PR.lag != null ? PR.lag : 45;
  // 🎯 the OBJECT has beats too (Aowu 08:53): held → it trails the hand + is squeezed (anticipation); released AT CONTACT with the hand's / foot's
  // speed → squash on impact, stretch along the flight, spin + arc + a short speed trail (follow-through). act.prop = {ch, size, at: 'hand'|'foot',
  // rest: [x, y] (foot: where the ball waits), lag, boost, launch: [vx, vy], gravity, spin, ground}
  let rel = null;
  const anchor = el => { const P = sample(el).pose; return PR && PR.at === 'foot' ? footAt(P) : handAt(P); };
  const propAt = el => {
    if(el < contactMs){
      const ai = ci - 1, inAnti = ai >= 0 && el >= start[ai] && el < contactMs;
      const pos = PR.at === 'foot' ? (PR.rest || [16, -3]) : anchor(Math.max(0, el - LAG));
      const gr = PR.grow && ai >= 0 ? 0.35 + 0.65 * Math.min(1, Math.max(0, (el - start[ai]) / Math.max(1, contactMs - start[ai]))) : 1;   /* 🌱 b1a2: grow */
      return {x: pos[0], y: pos[1], ang: 0, along: (inAnti && PR.at !== 'foot' && !PR.grow ? 0.9 : 1) * gr, across: (inAnti && PR.at !== 'foot' && !PR.grow ? 1.1 : 1) * gr, rot: 0, held: true, trail: []};
    }
    if(!rel){ const p1 = anchor(contactMs), p0 = anchor(contactMs - 30), bo = PR.boost != null ? PR.boost : 1.5, L = PR.launch || [0, 0];
      let vx = (p1[0] - p0[0]) / 0.03 * bo + L[0], vy = (p1[1] - p0[1]) / 0.03 * bo + L[1]; const v = Math.hypot(vx, vy) || 1, cap = Math.max(PR.minSpeed || 150, Math.min(PR.maxSpeed || 420, v)); vx *= cap / v; vy *= cap / v;   /* a readable speed */
      if(PR.aim != null){ const m = PR.aimMix != null ? PR.aimMix : 0.7, a0 = Math.atan2(vy, vx); let da = PR.aim - a0; while(da > Math.PI) da -= 2 * Math.PI; while(da < -Math.PI) da += 2 * Math.PI; const a1 = a0 + da * m; vx = Math.cos(a1) * cap; vy = Math.sin(a1) * cap; }   /* aim: a throw goes mostly forward */
      rel = {x: PR.at === 'foot' ? (PR.rest || [16, -3])[0] : p1[0], y: PR.at === 'foot' ? (PR.rest || [16, -3])[1] : p1[1], vx, vy}; }
    const fly = tt => { const g = PR.gravity != null ? PR.gravity : 320; let x = rel.x + rel.vx * tt, y = rel.y + rel.vy * tt + 0.5 * g * tt * tt; const gr = PR.ground != null ? PR.ground : -3; if(y > gr) y = gr; return [x, y, rel.vy + g * tt]; };
    const tt = Math.max(0, el - contactMs - STOP) / 1000, [x, y, vy] = fly(tt), sp = Math.hypot(rel.vx, vy);   /* waits through the hit-stop */
    const squash = tt < 0.03 && PR.at === 'foot', st = squash ? 0.72 : 1 + Math.min(0.5, sp / 700) * Math.exp(-tt / 0.14);
    return {x, y, ang: Math.atan2(vy, rel.vx), along: st, across: 1 / Math.sqrt(st) / (squash ? 0.75 : 1), rot: (PR.spin != null ? PR.spin : 9) * tt, held: false,
      trail: [1, 2, 3].map(n => tt - n * 0.018).filter(u => u > 0).map((u, n) => { const q = fly(u); return {x: q[0], y: q[1], a: 0.3 - n * 0.09}; })};
  };
  // held things (sword, racket, crafted item) drag behind the arm and whip through (overlapping action)
  const armA = P => (P.armR != null ? P.armR : 0.15) + (P.elbowR || 0);
  const run = {act: actKey, beats, D, start, total, contactMs, contactT: t0 + contactMs / 1000, t0, stop: STOP, fired: false, i: -1, last: null, done: false,
    at(t){
      const el = (t - t0) * 1000, S = sample(el), i = S.i, q = S.q, pose = S.pose;
      if(A.drag !== false){ const d = Math.max(-0.9, Math.min(0.9, (armA(sample(ago(el, 50)).pose) - armA(pose)) * 0.8)); if(Math.abs(d) > 1e-4) pose.holdRot = (pose.holdRot || 0) + d; }
      const b = beats[i], pb = i > 0 ? beats[i - 1] : b;
      const f = {id: actKey + '#' + i + ':' + Math.round(q * 4), act: A, pose, face: (q < 0.5 ? pb.face : b.face) || b.face || pb.face || null,
        marks: (q < 0.5 ? pb.marks : b.marks) || [], tricks: b.tricks || [], ride: A.ride || 'drop', hold: A.hold || 'keep',
        beat: b.name, i, q, contact: el >= contactMs, stop: STOP > 0 && el >= contactMs && el < contactMs + STOP, done: el >= total};
      const showFrom = PR && PR.show === 'contact' ? contactMs : PR && PR.show === 'anticipation' ? (ci >= 1 ? start[ci - 1] : 0) : -1e9;   /* 👁️ b1a2: prop.show */
      if(PR && el >= showFrom){ f.prop = Object.assign({ch: PR.ch || '⚾', size: PR.size || 12}, propAt(el)); f.id += f.prop.held ? '' : '~' + Math.round((el - contactMs) / 20); }
      if(i !== run.i){ run.i = i; if(o.onBeat) o.onBeat(b.name, i, run); }
      if(!run.fired && el >= contactMs){ run.fired = true; if(o.onContact) o.onContact(run); }
      run.last = f; run.done = f.done; return f;
    }};
  return run;
}
function beatsOf(actKey){ const A = T.acts[actKey]; return A && A.beats ? A.beats.slice() : null; }
// cached pictures of a beat act: `steps` pictures per beat (crowds, covers, comics) → [{beat, i, canvas}]
const BFR = {};
function beatFrames(who, actKey, o){
  o = o || {}; const w = o.w || 120, h = o.h || 140, dpr = o.dpr || Math.min(2, window.devicePixelRatio || 1), steps = o.steps || 3;
  const key = [who.name, hashStr(JSON.stringify(who.av || {})), actKey, w, h, dpr, steps, o.dir || 1].join('|');
  if(BFR[key]) return BFR[key];
  const run = play(who, actKey, {t0: 0, speed: 1}), F = [];
  run.beats.forEach((b, i) => { for(let s = 1; s <= steps; s++){ const tt = (run.start[i] + run.D[i].ms * s / steps - 0.01) / 1000; F.push(run.at(Math.max(0, tt))); } });
  const ff = fit(who, F.map((f, n) => Object.assign({}, f, {id: actKey + '@' + n})), w, h, o), out = [];
  F.forEach(f => { const c = document.createElement('canvas'); c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); const g = c.getContext('2d'); g.scale(dpr, dpr);
    draw(g, who, ff.x, ff.y, ff.k, f, Object.assign({}, o, {t: 0})); out.push({beat: f.beat, i: f.i, canvas: c}); });
  return (BFR[key] = out);
}
/* ---------- 🎬 BEATS END ---------- */

window.Acting = {add, get, list, resolve, draw, frames, fit, pick, sig, SIG, sigs, shared, has: (kind, key) => !!get(kind, key),
  face: k => T.faces[k], pose: k => T.poses[k], act: k => T.acts[k], T, ERRORS, BLOCKS, VERSION: 'as-2',
  play, beatsOf, beatFrames, EASE, ease: easeOf, bezier, DEF_EASE, BEATS: 'b1a2'};   /* 🎬 b1a + 🎚️ b1a2 */
})();

// 🎭 BLOCK core-faces (shared · 💥 Comics chat built it, AS-1) START
Acting.add({faces: {
  neutral:   {eyes: 'dot', mouth: 'flat', tags: ['calm']},
  happy:     {eyes: 'dot', mouth: 'smile', tags: ['happy']},
  joy:       {eyes: 'happy', mouth: 'bigD', extras: ['blush'], tags: ['happy', 'win']},
  laugh:     {eyes: 'squeeze', mouth: 'laugh', extras: ['blush'], tags: ['happy', 'funny']},
  cheeky:    {eyes: 'happy', brows: 'oneup', mouth: 'tongue', tags: ['funny']},
  smug:      {eyes: 'halflid', brows: 'oneup', mouth: 'smirk', tags: ['win', 'funny']},
  wink:      {eyes: 'wink', brows: 'oneup', mouth: 'grin', tags: ['happy'], wink: true},
  fierce:    {eyes: 'slit', brows: 'angry', mouth: 'grit', tags: ['sport', 'fight']},
  determined:{eyes: 'fire', brows: 'thick', mouth: 'flat', tags: ['sport', 'fight']},
  effort:    {eyes: 'squeeze', brows: 'angry', mouth: 'grit', extras: ['sweat-drop'], tags: ['sport', 'fight']},
  angry:     {eyes: 'slit', brows: 'angry', mouth: 'zigzag', extras: ['anger-mark'], tags: ['fight']},
  'rage-cute': {eyes: 'whiteout', brows: 'angry', mouth: 'fangs', extras: ['anger-mark', 'steam'], tags: ['funny']},
  shock:     {eyes: 'tiny', brows: 'up', mouth: 'O', extras: ['sweat-drop'], tags: ['miss', 'surprise']},
  gasp:      {eyes: 'wide', brows: 'up', mouth: 'O', tags: ['surprise']},
  scared:    {eyes: 'tiny', brows: 'worried', mouth: 'wobbly', extras: ['anime-sweat'], tags: ['miss']},
  worried:   {eyes: 'dot', brows: 'worried', mouth: 'wobbly', tags: ['close']},
  nervous:   {eyes: 'side', brows: 'worried', mouth: 'grin', extras: ['anime-sweat'], tags: ['close']},
  sad:       {eyes: 'closed', brows: 'worried', mouth: 'sad', tags: ['lose']},
  cry:       {eyes: 'teary', brows: 'worried', mouth: 'wail', extras: ['tears-stream'], tags: ['lose']},
  sulky:     {eyes: 'halflid', brows: 'angry', mouth: 'pout', extras: ['gloom'], tags: ['lose', 'funny']},
  sleepy:    {eyes: 'closed', mouth: 'O', tags: ['calm']},
  dizzy:     {eyes: 'spiral', mouth: 'wobbly', tags: ['miss', 'funny']},
  glitch:    {eyes: 'x', mouth: 'zigzag', tags: ['robot']},
  love:      {eyes: 'heart', mouth: 'smile', extras: ['blush'], tags: ['happy']},
  'star-eyes': {eyes: 'star', brows: 'up', mouth: 'bigD', tags: ['win', 'happy']},
  cool:      {eyes: 'dot', mouth: 'smirk', extras: ['sunglasses'], tags: ['win']},
  sneaky:    {eyes: 'side', brows: 'oneup', mouth: 'smirk', tags: ['funny']},
  thinking:  {eyes: 'side', brows: 'oneup', mouth: 'whistle', tags: ['calm', 'close']},
  proud:     {eyes: 'happy', brows: 'thick', mouth: 'grin', extras: ['shine'], tags: ['win']},
  relieved:  {eyes: 'closed', brows: 'worried', mouth: 'smile', extras: ['sweat-drop'], tags: ['close', 'happy']},
  excited:   {eyes: 'sparkle', brows: 'up', mouth: 'bigD', extras: ['flush'], tags: ['happy']},
  delighted: {eyes: 'happy', brows: 'up', mouth: 'O', extras: ['blush'], tags: ['happy', 'surprise']},
  content:   {eyes: 'happy', mouth: 'cat', tags: ['calm', 'happy']},
  grateful:  {eyes: 'teary', brows: 'worried', mouth: 'smile', extras: ['blush'], tags: ['happy', 'calm']},
  hopeful:   {eyes: 'up', brows: 'worried', mouth: 'smile', tags: ['close']},
  amazed:    {eyes: 'sparkle', brows: 'up', mouth: 'O', tags: ['surprise', 'happy']},
  impressed: {eyes: 'wide', brows: 'oneup', mouth: 'whistle', tags: ['surprise']},
  curious:   {eyes: 'wide', brows: 'oneup', mouth: 'tiny', tags: ['calm']},
  confused:  {eyes: 'side', brows: 'oneup', mouth: 'wobbly', tags: ['surprise', 'funny']},
  focused:   {eyes: 'slit', brows: 'thick', mouth: 'tiny', tags: ['sport', 'calm']},
  brave:     {eyes: 'fire', brows: 'angry', mouth: 'grin', tags: ['fight', 'power']},
  shy:       {eyes: 'down', brows: 'worried', mouth: 'tiny', extras: ['flush'], tags: ['calm']},
  embarrassed: {eyes: 'squeeze', brows: 'worried', mouth: 'grin', extras: ['flush', 'anime-sweat'], tags: ['funny', 'miss']},
  oops:      {eyes: 'side', brows: 'worried', mouth: 'grit', extras: ['sweat-drop'], tags: ['miss', 'funny']},
  silly:     {eyes: 'wink', brows: 'up', mouth: 'tongue', extras: ['blush'], tags: ['funny']},
  bored:     {eyes: 'halflid', mouth: 'flat', tags: ['calm']},
  tired:     {eyes: 'halflid', brows: 'worried', mouth: 'O', extras: ['sweat-drop'], tags: ['calm']},
  yuck:      {eyes: 'squeeze', brows: 'angry', mouth: 'yuck', extras: ['pale'], tags: ['funny']},
  frustrated:{eyes: 'squeeze', brows: 'angry', mouth: 'grit', extras: ['steam'], tags: ['miss', 'lose']},
  disappointed: {eyes: 'down', brows: 'worried', mouth: 'flat', tags: ['lose']},
  jealous:   {eyes: 'side', brows: 'angry', mouth: 'pout', extras: ['gloom'], tags: ['funny']},
  panic:     {eyes: 'whiteout', brows: 'up', mouth: 'wail', extras: ['pale', 'anime-sweat'], tags: ['miss', 'close']},
  hurt:      {eyes: 'squeeze', brows: 'worried', mouth: 'wobbly', extras: ['tears-stream'], tags: ['lose', 'fight']},
  lonely:    {eyes: 'down', brows: 'worried', mouth: 'sad', extras: ['gloom'], tags: ['lose', 'calm']},
  giggle:    {eyes: 'happy', mouth: 'cat', extras: ['blush'], tags: ['funny', 'happy']},
  sick:      {eyes: 'halflid', brows: 'worried', mouth: 'wobbly', extras: ['pale', 'sweat-drop'], tags: ['funny']}
}}, {by: 'core', block: 'core-faces'});
// 🎭 BLOCK core-faces END

// 🎭 BLOCK core-poses (shared · 💥 Comics chat built it, AS-1) START
// armR = front arm, armL = back arm (radians, 0 = down, ~1.6 = forward, ~3 = straight up) · legL / legR · bend (+ forward) · rot (whole body) · dy (up −) · sx / sy (squash / stretch) · holdRot (held item) · headSc (chibi)
Acting.add({poses: {
  ready:   {armR: 0.9, holdRot: 0.4, armL: 0.5, legL: 0.25, legR: -0.25, tags: ['sport']},
  aim:     {armR: -1.9, holdRot: 0.8, armL: 1.6, legL: 0.35, legR: -0.3, bend: -0.1, tags: ['sport']},
  windup:  {armR: -2.75, holdRot: 1.1, armL: 1.75, legL: 0.5, legR: -0.45, bend: -0.3, sx: 1.07, sy: 0.9, tags: ['sport']},
  swing:   {armR: 1.6, holdRot: -0.6, armL: 0.9, legL: 0.45, legR: -0.35, bend: 0.2, tags: ['sport']},
  smash:   {armR: 3.05, holdRot: -1.4, armL: 1.9, legL: 0.6, legR: -0.15, bend: 0.35, dy: -10, sx: 0.92, sy: 1.1, tags: ['sport']},
  backhand:{armR: -1.4, holdRot: 2.2, armL: -0.6, legL: 0.5, legR: -0.4, bend: 0.25, tags: ['sport']},
  follow:  {armR: -1.3, holdRot: 2.4, armL: 0.4, bend: 0.55, legL: 0.55, legR: -0.35, sy: 0.94, tags: ['sport']},
  lunge:   {armR: 2.0, holdRot: -0.4, armL: 1.2, legL: 0.75, legR: -0.5, bend: 0.5, sx: 1.08, sy: 0.92, tags: ['sport']},
  'serve-toss': {armR: -0.8, holdRot: 1.0, armL: 2.9, legL: 0.2, legR: -0.15, bend: -0.12, sy: 1.04, tags: ['sport']},
  volley:  {armR: 1.4, holdRot: -0.2, armL: 1.1, legL: 0.4, legR: -0.4, bend: 0.15, tags: ['sport']},
  run:     {armR: 1.2, armL: -0.9, legL: 0.8, legR: -0.7, bend: 0.25, tags: ['move']},
  sprint:  {armR: 1.6, armL: -1.2, legL: 1.0, legR: -0.9, bend: 0.45, sx: 1.06, sy: 0.95, tags: ['move']},
  skid:    {armR: -1.2, armL: -1.6, legL: 0.9, legR: 0.1, bend: -0.4, sx: 1.08, sy: 0.92, tags: ['move']},
  crouch:  {armR: -0.6, holdRot: 0.6, armL: 0.9, legL: 0.85, legR: -0.85, bend: 0.3, dy: 6, sy: 0.82, sx: 1.12, tags: ['move']},
  'jump-up': {armR: 2.8, armL: 2.2, legL: 0.5, legR: -0.4, dy: -14, sy: 1.1, sx: 0.93, tags: ['move']},
  land:    {armR: 2.2, armL: -1.2, legL: 0.6, legR: -0.6, dy: 4, sy: 0.9, sx: 1.08, tags: ['move']},
  dive:    {armR: 3.1, armL: 2.8, legL: -0.35, legR: 0.55, rot: -1.38, sx: 1.12, sy: 0.9, tags: ['move', 'sport']},
  slide:   {armR: 2.6, armL: 0.4, legL: -0.2, legR: 0.6, rot: -1.1, dy: 4, tags: ['move']},
  trip:    {armR: 2.6, armL: 2.2, legL: -0.6, legR: 0.9, rot: -0.7, tags: ['move', 'funny']},
  fall:    {armR: 2.9, armL: -2.6, legL: 0.6, legR: -0.6, rot: 0.6, tags: ['move']},
  'on-floor': {armR: 2.9, armL: 2.6, legL: 0.15, legR: -0.1, rot: -1.5, dy: -6, tags: ['move']},
  'get-up': {armR: -0.6, armL: 0.9, legL: 1.1, legR: -0.4, bend: 0.8, dy: 5, tags: ['move']},
  guard:   {armR: 2.2, armL: 2.0, legL: 0.4, legR: -0.35, bend: 0.1, tags: ['fight']},
  punch:   {armR: 1.6, armL: 2.3, legL: 0.55, legR: -0.4, bend: 0.25, tags: ['fight']},
  uppercut:{armR: 2.9, armL: 1.4, legL: 0.6, legR: -0.2, bend: -0.2, dy: -6, sy: 1.08, tags: ['fight']},
  kick:    {armR: -1.0, armL: 1.4, legL: 0.05, legR: 1.7, bend: -0.35, tags: ['fight']},
  dodge:   {armR: 1.2, armL: 1.6, legL: 0.6, legR: -0.6, bend: -0.6, tags: ['fight']},
  hurt:    {armR: 2.6, armL: -2.4, legL: 0.3, legR: -0.5, bend: -0.45, sx: 0.94, tags: ['fight']},
  'ko-spin': {armR: 2.8, armL: -2.8, legL: 0.7, legR: -0.7, rot: 0.9, dy: -10, tags: ['fight']},
  flex:    {armR: 2.2, armL: 2.2, legL: 0.35, legR: -0.35, bend: -0.1, sy: 1.04, tags: ['fight', 'win']},
  'toss-up': {armR: 2.9, armL: 0.4, legL: 0.15, legR: -0.1, sy: 1.04, tags: ['throw']},
  'overhead-throw': {armR: -2.9, armL: 1.4, legL: 0.6, legR: -0.4, bend: -0.25, tags: ['throw']},
  carry:   {armR: 1.6, armL: 1.6, legL: 0.15, legR: -0.15, bend: -0.1, tags: ['throw']},
  catch:   {armR: 2.4, armL: 2.4, legL: 0.3, legR: -0.3, bend: 0.2, tags: ['throw']},
  'duck-cover': {armR: 3.0, armL: 3.0, legL: 0.8, legR: -0.8, bend: 0.7, dy: 6, sy: 0.85, tags: ['throw', 'miss']},
  'cheer-jump': {armR: 2.95, armL: 2.6, legL: 0.75, legR: -0.6, bend: -0.18, dy: -12, sy: 1.08, sx: 0.95, tags: ['win']},
  'fist-pump': {armR: 2.9, armL: 0.4, legL: 0.3, legR: -0.3, bend: -0.1, tags: ['win']},
  'arms-up': {armR: 2.7, armL: 2.7, legL: 0.2, legR: -0.2, tags: ['win']},
  bow:     {armR: 0.4, armL: 0.4, legL: 0.05, legR: -0.05, bend: 0.9, tags: ['lose', 'calm']},
  wave:    {armR: 2.6, armL: 0.2, legL: 0.1, legR: -0.1, tags: ['happy']},
  facepalm:{armR: 2.5, armL: 0.3, legL: 0.1, legR: -0.1, bend: 0.25, tags: ['miss', 'funny']},
  slump:   {armR: 0.12, armL: 0.08, legL: 0.08, legR: -0.05, bend: 0.5, sy: 0.92, tags: ['lose']},
  'sit-sulk': {armR: 1.2, armL: 1.2, legL: 1.5, legR: 1.3, bend: 0.3, dy: 18, tags: ['lose', 'funny']},
  shrug:   {armR: 1.0, armL: 1.0, legL: 0.1, legR: -0.1, bend: -0.05, tags: ['funny']},
  'think-chin': {armR: 2.3, armL: 1.3, legL: 0.1, legR: -0.1, bend: 0.05, tags: ['calm', 'close']},
  point:   {armR: 1.65, armL: 0.3, legL: 0.25, legR: -0.2, tags: ['happy']},
  'cover-eyes': {armR: 2.6, armL: 2.6, legL: 0.2, legR: -0.2, bend: 0.2, tags: ['miss', 'close']},
  hug:     {armR: 1.5, armL: 1.5, legL: 0.15, legR: -0.15, bend: 0.1, tags: ['happy']},
  'power-charge': {armR: 2.9, armL: 2.9, legL: 0.45, legR: -0.45, bend: -0.2, dy: -6, sy: 1.08, tags: ['power']},
  float:   {armR: 1.4, armL: 1.4, legL: 0.6, legR: 0.6, dy: -18, tags: ['power', 'calm']},
  'robot-glitch': {armR: 1.5, armL: -0.6, rot: 0.12, legL: 0.2, legR: -0.1, tags: ['robot']},
  frozen:  {armR: 1.0, armL: 0.6, legL: 0.3, legR: -0.3, alive: false, tags: ['power']},
  zapped:  {armR: 2.7, armL: -2.7, legL: 0.6, legR: -0.6, dy: -4, tags: ['power', 'funny']},
  'wobble-dizzy': {armR: 1.2, armL: -1.0, legL: 0.3, legR: -0.4, rot: 0.15, tags: ['funny', 'miss']},
  idle:    {armR: 0.15, armL: 0.15, tags: ['calm']}
}}, {by: 'core', block: 'core-poses'});
// 🎭 BLOCK core-poses END

// 🎭 BLOCK core-marks (shared · 💥 Comics chat built it, AS-1) START
// marks are painted in the HEAD frame (they turn with the head) — (g, hy, k, t, ctx); no emoji, shapes only (emoji lag rule)
(function(){
const INK = '#2B2D42';
function drop(g, x, y, s, col){ g.fillStyle = col || '#9BE3FF'; g.strokeStyle = INK; g.lineWidth = Math.max(0.8, s * 0.22); g.beginPath(); g.moveTo(x, y - s * 1.7); g.quadraticCurveTo(x + s, y, x, y + s); g.quadraticCurveTo(x - s, y, x, y - s * 1.7); g.fill(); g.stroke(); }
function star(g, x, y, r1, r2, n, rot){ g.beginPath(); for(let i = 0; i < n * 2; i++){ const a = (rot || -Math.PI / 2) + i * Math.PI / n, r = i % 2 ? r2 : r1; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); }
function heart(g, x, y, s){ g.beginPath(); g.moveTo(x, y + s); g.bezierCurveTo(x - s * 1.4, y, x - s, y - s * 1.1, x, y - s * 0.45); g.bezierCurveTo(x + s, y - s * 1.1, x + s * 1.4, y, x, y + s); g.closePath(); }
Acting.add({marks: {
  sweat(g, hy, k, t){ [[-14, -4], [16, -8], [19, 6]].forEach(([dx, dy], i) => drop(g, dx * k, hy + dy * k + ((t * 0.9 + i * 0.33) % 1) * 9 * k, (2.6 + i * 0.4) * k)); },
  'big-sweat'(g, hy, k, t){ drop(g, -15 * k, hy - 10 * k + Math.sin(t * 3) * k, 5 * k); },
  steam(g, hy, k, t){ g.fillStyle = 'rgba(240,244,248,0.95)'; g.strokeStyle = 'rgba(43,45,66,0.45)'; g.lineWidth = 0.8 * k; [-9, 9].forEach((x, i) => { for(let j = 0; j < 2; j++){ const u = (t * 1.3 + i * 0.4 + j * 0.5) % 1; g.beginPath(); g.arc(x * k + (i ? 1 : -1) * u * 6 * k, hy - 16 * k - u * 12 * k, (2.4 + u * 3) * k, 0, 7); g.fill(); g.stroke(); } }); },
  'dizzy-stars'(g, hy, k, t){ g.fillStyle = '#FFE14D'; g.strokeStyle = INK; g.lineWidth = 1 * k; for(let i = 0; i < 4; i++){ const a = i / 4 * Math.PI * 2 + t * 4; star(g, Math.cos(a) * 16 * k, hy - 17 * k + Math.sin(a) * 5 * k, 4.2 * k, 1.8 * k, 5); g.fill(); g.stroke(); } },
  birds(g, hy, k, t){ g.strokeStyle = INK; g.fillStyle = '#FFD166'; g.lineWidth = 0.9 * k; for(let i = 0; i < 3; i++){ const a = i / 3 * Math.PI * 2 + t * 3, x = Math.cos(a) * 15 * k, y = hy - 18 * k + Math.sin(a) * 5 * k; g.beginPath(); g.ellipse(x, y, 3.2 * k, 2.4 * k, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x + 2.6 * k, y - 0.4 * k); g.lineTo(x + 4.6 * k, y); g.lineTo(x + 2.6 * k, y + 0.6 * k); g.fillStyle = '#FF7A1A'; g.fill(); g.fillStyle = '#FFD166'; } },
  hearts(g, hy, k, t){ g.fillStyle = '#FF3B6B'; g.strokeStyle = INK; g.lineWidth = 0.8 * k; [[-12, 0], [10, 0.4], [2, 0.7]].forEach(([x, o]) => { const u = (t * 0.7 + o) % 1; g.globalAlpha = 1 - u * 0.6; heart(g, x * k + Math.sin(u * 6) * 2 * k, hy - 16 * k - u * 16 * k, (3 + u * 1.5) * k); g.fill(); g.stroke(); }); g.globalAlpha = 1; },
  exclaim(g, hy, k, t){ const p = 1 + 0.12 * Math.abs(Math.sin(t * 8)); g.save(); g.translate(10 * k, hy - 22 * k); g.scale(p, p); g.fillStyle = '#E63946'; g.strokeStyle = INK; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(-2.4 * k, -9 * k); g.lineTo(2.4 * k, -9 * k); g.lineTo(1 * k, 2 * k); g.lineTo(-1 * k, 2 * k); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.arc(0, 5.5 * k, 1.8 * k, 0, 7); g.fill(); g.stroke(); g.restore(); },
  question(g, hy, k, t){ g.save(); g.translate(12 * k, hy - 22 * k); g.rotate(Math.sin(t * 3) * 0.15); g.strokeStyle = '#3A86FF'; g.lineWidth = 2.4 * k; g.lineCap = 'round'; g.beginPath(); g.arc(0, -4 * k, 3.4 * k, Math.PI * 1.1, Math.PI * 2.35); g.lineTo(0, 1.5 * k); g.stroke(); g.fillStyle = '#3A86FF'; g.beginPath(); g.arc(0, 5.5 * k, 1.5 * k, 0, 7); g.fill(); g.restore(); },
  anger(g, hy, k, t){ const p = 1 + 0.15 * Math.abs(Math.sin(t * 7)); g.save(); g.translate(-12 * k, hy - 13 * k); g.scale(p, p); g.strokeStyle = '#E63946'; g.lineWidth = 2 * k; [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([a, b]) => { g.beginPath(); g.arc(a * 3 * k, b * 3 * k, 2.4 * k, Math.atan2(-b, -a) - 0.9, Math.atan2(-b, -a) + 0.9); g.stroke(); }); g.restore(); },
  'gloom-cloud'(g, hy, k, t){ const y = hy - 26 * k + Math.sin(t * 2) * k; g.fillStyle = '#7A7F95'; [[-6, 0, 5], [0, -3, 6], [6, 0, 5]].forEach(([x, yy, r]) => { g.beginPath(); g.arc(x * k, y + yy * k, r * k, 0, 7); g.fill(); }); g.strokeStyle = '#7CC8FF'; g.lineWidth = 1.2 * k; for(let i = 0; i < 4; i++){ const u = (t * 1.8 + i * 0.25) % 1; g.beginPath(); g.moveTo((-6 + i * 4) * k, y + 5 * k + u * 9 * k); g.lineTo((-7 + i * 4) * k, y + 8 * k + u * 9 * k); g.stroke(); } },
  'idea-bulb'(g, hy, k, t){ const y = hy - 27 * k; g.fillStyle = '#FFE14D'; g.strokeStyle = INK; g.lineWidth = 1 * k; g.beginPath(); g.arc(0, y, 5.5 * k, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#9AA6B2'; g.fillRect(-2.6 * k, y + 5 * k, 5.2 * k, 3.4 * k); g.strokeStyle = '#FFC94D'; g.lineWidth = 1.2 * k; const p = 0.6 + 0.4 * Math.abs(Math.sin(t * 5)); for(let i = 0; i < 5; i++){ const a = -Math.PI / 2 + (i - 2) * 0.5; g.beginPath(); g.moveTo(Math.cos(a) * 7.5 * k, y + Math.sin(a) * 7.5 * k); g.lineTo(Math.cos(a) * (7.5 + 3.5 * p) * k, y + Math.sin(a) * (7.5 + 3.5 * p) * k); g.stroke(); } },
  zzz(g, hy, k, t){ g.fillStyle = '#3A86FF'; g.font = '900 ' + Math.round(7 * k) + 'px Nunito, sans-serif'; [0, 1, 2].forEach(i => { const u = (t * 0.6 + i / 3) % 1; g.globalAlpha = 1 - u; g.save(); g.translate(8 * k + u * 10 * k, hy - 14 * k - u * 16 * k); g.scale(0.6 + u * 0.6, 0.6 + u * 0.6); g.fillText('Z', 0, 0); g.restore(); }); g.globalAlpha = 1; },
  notes(g, hy, k, t){ g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 1.2 * k; [0, 1].forEach(i => { const u = (t * 0.7 + i * 0.5) % 1, x = (8 + i * 6) * k + Math.sin(u * 7) * 2 * k, y = hy - 12 * k - u * 16 * k; g.globalAlpha = 1 - u * 0.7; g.beginPath(); g.ellipse(x, y, 2.2 * k, 1.6 * k, -0.4, 0, 7); g.fill(); g.beginPath(); g.moveTo(x + 2 * k, y); g.lineTo(x + 2 * k, y - 7 * k); g.lineTo(x + 5 * k, y - 5.5 * k); g.stroke(); }); g.globalAlpha = 1; },
  sparkles(g, hy, k, t){ g.fillStyle = '#FFE14D'; g.strokeStyle = '#FFB020'; g.lineWidth = 0.6 * k; [[-15, -8], [14, -14], [17, 4], [-13, -20]].forEach(([x, y], i) => { const p = Math.abs(Math.sin(t * 4 + i)); star(g, x * k, hy + y * k, (1.5 + 2.6 * p) * k, 0.7 * k, 4, t); g.fill(); g.stroke(); }); },
  'tear-fountain'(g, hy, k, t){ g.fillStyle = 'rgba(90,180,255,0.9)'; [-1, 1].forEach(s => { for(let i = 0; i < 5; i++){ const u = (t * 2 + i / 5) % 1; g.beginPath(); g.arc(s * (5 + u * 14) * k + 2 * k, hy + 1 * k - Math.sin(u * Math.PI) * 9 * k + u * 8 * k, (1.6 - u * 0.6) * k, 0, 7); g.fill(); } }); },
  shiver(g, hy, k, t){ g.strokeStyle = INK; g.lineWidth = 1.1 * k; [-1, 1].forEach(s => { for(let i = 0; i < 3; i++){ const x = s * (17 + i * 2.5) * k + Math.sin(t * 40 + i) * 0.6 * k; g.beginPath(); g.moveTo(x, hy + (-4 + i * 3) * k); g.lineTo(x + s * 3 * k, hy + (-5 + i * 3) * k); g.stroke(); } }); }
}}, {by: 'core', block: 'core-marks'});
})();
// 🎭 BLOCK core-marks END

// 🎭 BLOCK core-tricks (shared · 💥 Comics chat built it, AS-1) START
// a trick may change the body (body(P, t)), paint behind (back(ctx)), in front (front(ctx)) or wrap the avatar picture (wrap(ctx, paint))
(function(){
const INK = '#2B2D42';
function off(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function viaCanvas(ctx, paint, after){ const m = ctx.g.getTransform(), sc = Math.max(1, Math.hypot(m.a, m.b)), s = ctx.k, W = Math.ceil(160 * s), H = Math.ceil(200 * s), c = off(Math.ceil(W * sc), Math.ceil(H * sc)), x = c.getContext('2d'), ox = ctx.x - W / 2, oy = ctx.y - (H - 30 * s); x.scale(sc, sc); paint(x, W / 2, H - 30 * s); const h = window.AK && AK.head; if(h) AK.head = Object.assign({}, h, {m: m.multiply(new DOMMatrix().translate(ox, oy).scale(1 / sc)).multiply(h.m)}); after(x, c); ctx.g.drawImage(c, ox, oy, W, H); }
Acting.add({tricks: {
  squash:  {body(P){ P.sx = (P.sx || 1) * 1.12; P.sy = (P.sy || 1) * 0.86; }},
  stretch: {body(P){ P.sx = (P.sx || 1) * 0.9; P.sy = (P.sy || 1) * 1.14; }},
  lean:    {body(P){ P.bend = (P.bend || 0) + 0.25; }},
  anticipation: {body(P, t){ P.sy = (P.sy || 1) * (0.9 + 0.04 * Math.sin(t * 10)); P.dy = (P.dy || 0) + 3; }},
  overshoot: {body(P, t){ P.bend = (P.bend || 0) + 0.12 * Math.sin(t * 9) * Math.exp(-(t % 1) * 2); }},
  jelly:   {body(P, t){ const w = Math.sin(t * 16); P.sx = (P.sx || 1) * (1 + w * 0.06); P.sy = (P.sy || 1) * (1 - w * 0.06); }},
  chibi:   {body(P){ P.headSc = 1.45; P.sy = (P.sy || 1) * 0.82; }},
  shake:   {back(ctx){ const s = Math.sin(ctx.t * 60) * 2 * ctx.k; ctx.g.translate(s, 0); }, front(ctx){ const s = Math.sin(ctx.t * 60) * 2 * ctx.k; ctx.g.translate(-s, 0); }},
  smear:   {back(ctx){ const {g, x, y, k, P, dir} = ctx, cx = x + 9 * k * dir, cy = y - 42 * k + (P.dy || 0) * k, r = 34 * k, a0 = (P.armR || 0) * dir; g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(0,0,0,0.85)'; g.lineWidth = 6 * k; g.beginPath(); g.arc(cx, cy, r, Math.PI / 2 - a0 - 1.1 * dir, Math.PI / 2 - a0, dir < 0); g.stroke(); g.strokeStyle = '#FFF'; g.lineWidth = 3.6 * k; g.stroke(); g.restore(); }},
  'blur-limbs': {back(ctx){ const {g, x, y, k, P, a} = ctx; g.save(); g.globalAlpha = 0.18; [-0.35, -0.7].forEach(d => drawAvatar(g, a, x, y, k, {t: ctx.t, pose: Object.assign({}, P, {armR: (P.armR || 0) + d, legR: (P.legR || 0) + d * 0.5}), still: true})); g.restore(); }},
  afterimage: {back(ctx){ const {g, x, y, k, P, a, dir} = ctx; [3, 2, 1].forEach(i => { g.save(); g.globalAlpha = 0.12 * (4 - i); drawAvatar(g, a, x - i * 9 * k * dir, y, k, {t: ctx.t, pose: P, still: true}); g.restore(); }); }},
  'impact-flash': {back(ctx){ const {g, x, y, k, t} = ctx; const p = 1 + 0.08 * Math.sin(t * 20); g.save(); g.fillStyle = '#FFF'; g.strokeStyle = INK; g.lineWidth = 2 * k; g.beginPath(); for(let i = 0; i < 24; i++){ const a = i / 24 * Math.PI * 2, r = (i % 2 ? 26 : 48) * k * p; g.lineTo(x + Math.cos(a) * r, y - 40 * k + Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); g.restore(); }},
  'hero-giant': {body(P){ P.sx = (P.sx || 1) * 1.08; P.sy = (P.sy || 1) * 1.16; }},
  freeze:  {wrap(ctx, paint){ viaCanvas(ctx, paint, (x, c) => { x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(120,200,255,0.32)'; x.fillRect(0, 0, c.width, c.height); }); const g = ctx.g, {x: X, y: Y, k} = ctx; g.save(); g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1.5 * k; for(let i = 0; i < 5; i++){ const a = i * 1.3, px = X + Math.cos(a) * 18 * k, py = Y - 40 * k + Math.sin(a) * 30 * k; g.beginPath(); g.moveTo(px - 3 * k, py); g.lineTo(px + 3 * k, py); g.moveTo(px, py - 3 * k); g.lineTo(px, py + 3 * k); g.stroke(); } g.restore(); }},
  aura:    {back(ctx){ const {g, x, y, k, t} = ctx; const p = 1 + 0.06 * Math.sin(t * 7); const gr = g.createRadialGradient(x, y - 38 * k, 6 * k, x, y - 38 * k, 46 * k * p); gr.addColorStop(0, 'rgba(255,225,77,0.75)'); gr.addColorStop(0.6, 'rgba(255,150,40,0.35)'); gr.addColorStop(1, 'rgba(255,150,40,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y - 38 * k, 34 * k * p, 50 * k * p, 0, 0, 7); g.fill(); }},
  silhouette: {wrap(ctx, paint){ viaCanvas(ctx, paint, (x, c) => { x.globalCompositeOperation = 'source-atop'; x.fillStyle = '#121218'; x.fillRect(0, 0, c.width, c.height); x.globalCompositeOperation = 'source-over'; }); const h = window.AK && AK.head; if(h){ const g = ctx.g; g.save(); g.setTransform(h.m); g.fillStyle = '#FFF'; [h.k * -2, h.k * 5].forEach(ex => { g.beginPath(); g.ellipse(ex, h.hy + 1 * h.k, 2.2 * h.k, 1.1 * h.k, 0, 0, 7); g.fill(); }); g.restore(); } }},
  'spirit-puff': {front(ctx){ const {g, x, y, k, t} = ctx; const u = (t * 0.5) % 1, px = x + Math.sin(u * 9) * 6 * k, py = y - 70 * k - u * 40 * k; g.save(); g.globalAlpha = 0.85 - u * 0.5; g.fillStyle = '#F4F7FF'; g.strokeStyle = INK; g.lineWidth = 1.2 * k; g.beginPath(); g.arc(px, py, 8 * k, Math.PI, 0); g.lineTo(px + 8 * k, py + 8 * k); for(let i = 0; i < 4; i++) g.lineTo(px + (8 - i * 4 - 2) * k, py + (i % 2 ? 8 : 5) * k); g.lineTo(px - 8 * k, py + 8 * k); g.closePath(); g.fill(); g.stroke(); g.fillStyle = INK; [-3, 3].forEach(d => { g.beginPath(); g.arc(px + d * k, py, 1.2 * k, 0, 7); g.fill(); }); g.restore(); }},
  dust:    {back(ctx){ const {g, x, y, k, t} = ctx; g.save(); g.fillStyle = 'rgba(200,190,170,0.85)'; g.strokeStyle = 'rgba(43,45,66,0.4)'; g.lineWidth = 0.8 * k; for(let i = 0; i < 5; i++){ const u = (t * 1.2 + i / 5) % 1; g.globalAlpha = 1 - u; g.beginPath(); g.arc(x + (i - 2) * 8 * k - u * 6 * k, y - u * 6 * k, (3 + u * 5) * k, 0, 7); g.fill(); g.stroke(); } g.restore(); }},
  'skid-marks': {back(ctx){ const {g, x, y, k, dir} = ctx; g.save(); g.strokeStyle = 'rgba(43,45,66,0.45)'; g.lineWidth = 2.2 * k; g.lineCap = 'round'; [-2, 2].forEach(d => { g.beginPath(); g.moveTo(x - 40 * k * dir, y + d * k); g.lineTo(x - 6 * k * dir, y + d * k); g.stroke(); }); g.restore(); }},
  footprints: {back(ctx){ const {g, x, y, k, dir} = ctx; g.save(); g.fillStyle = 'rgba(43,45,66,0.28)'; for(let i = 1; i <= 4; i++){ g.beginPath(); g.ellipse(x - i * 13 * k * dir, y + (i % 2 ? 2 : -2) * k, 3.4 * k, 1.6 * k, 0, 0, 7); g.fill(); } g.restore(); }},
  'ground-crack': {back(ctx){ const {g, x, y, k} = ctx; g.save(); g.strokeStyle = INK; g.lineWidth = 1.6 * k; g.lineJoin = 'miter'; [[-1, 0.2], [1, -0.1], [-0.6, 0.6], [0.7, 0.55]].forEach(([d, s]) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + d * 14 * k, y + s * 4 * k); g.lineTo(x + d * 22 * k, y + s * 2 * k - 2 * k); g.lineTo(x + d * 32 * k, y + s * 6 * k); g.stroke(); }); g.restore(); }},
  'sparkle-pop': {front(ctx){ const {g, x, y, k, t} = ctx; g.save(); g.fillStyle = '#FFE14D'; g.strokeStyle = '#FFB020'; g.lineWidth = 0.8 * k; for(let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2 + t, r = (28 + 6 * Math.sin(t * 5 + i)) * k, px = x + Math.cos(a) * r, py = y - 40 * k + Math.sin(a) * r * 1.2, s = (2 + 2 * Math.abs(Math.sin(t * 4 + i))) * k; g.beginPath(); for(let j = 0; j < 8; j++){ const b = j * Math.PI / 4, rr = j % 2 ? s * 0.35 : s; g.lineTo(px + Math.cos(b) * rr, py + Math.sin(b) * rr); } g.closePath(); g.fill(); g.stroke(); } g.restore(); }},
  'flower-bloom': {back(ctx){ const {g, x, y, k, t} = ctx; const cols = ['#FF8FB1', '#FFD166', '#9BE3FF', '#C3A6FF']; for(let i = 0; i < 6; i++){ const fx = x + (i - 2.5) * 11 * k, fy = y - 2 * k - (i % 2) * 4 * k, s = (3 + Math.sin(t * 3 + i)) * k; g.fillStyle = cols[i % 4]; for(let p = 0; p < 5; p++){ const a = p / 5 * Math.PI * 2; g.beginPath(); g.arc(fx + Math.cos(a) * s, fy + Math.sin(a) * s, s * 0.7, 0, 7); g.fill(); } g.fillStyle = '#FFE14D'; g.beginPath(); g.arc(fx, fy, s * 0.55, 0, 7); g.fill(); } }},
  'heart-pop': {front(ctx){ const {g, x, y, k, t} = ctx; g.save(); g.fillStyle = '#FF3B6B'; g.strokeStyle = INK; g.lineWidth = 0.8 * k; for(let i = 0; i < 4; i++){ const u = (t * 0.6 + i / 4) % 1, px = x + (i - 1.5) * 12 * k + Math.sin(u * 8) * 3 * k, py = y - 60 * k - u * 30 * k, s = (3 + u * 2) * k; g.globalAlpha = 1 - u * 0.7; g.beginPath(); g.moveTo(px, py + s); g.bezierCurveTo(px - s * 1.4, py, px - s, py - s * 1.1, px, py - s * 0.45); g.bezierCurveTo(px + s, py - s * 1.1, px + s * 1.4, py, px, py + s); g.fill(); g.stroke(); } g.restore(); }}
}}, {by: 'core', block: 'core-tricks'});
})();
// 🎭 BLOCK core-tricks END

// 🎭 BLOCK core-acts (shared · 💥 Comics chat built it, AS-1) START
// act = pose + face + marks + tricks + gear rules (ride: 'drop' steps off the ride-on, 'keep' stays on · hold: 'keep' | 'none' | {id, v, o}) + variants
Acting.add({acts: {
  idle:        {pose: 'idle', face: 'happy', ride: 'keep', tags: ['calm'], variants: [{face: 'neutral'}, {face: 'sleepy', marks: ['zzz']}]},
  wave:        {pose: 'wave', face: 'happy', ride: 'keep', tags: ['happy', 'room'], variants: [{face: 'joy'}, {face: 'wink'}]},
  cheer:       {pose: 'cheer-jump', face: 'joy', tricks: ['stretch'], marks: ['sparkles'], ride: 'keep', tags: ['win', 'happy'], variants: [{pose: 'arms-up', face: 'star-eyes'}, {pose: 'fist-pump', face: 'proud'}]},
  victory:     {pose: 'fist-pump', face: 'proud', tricks: ['aura', 'sparkle-pop'], ride: 'keep', tags: ['win'], variants: [{pose: 'flex', face: 'cool'}, {pose: 'arms-up', face: 'star-eyes'}]},
  flex:        {pose: 'flex', face: 'cool', marks: ['sparkles'], ride: 'keep', tags: ['win', 'funny']},
  dance:       {gest: 'dance', face: 'joy', marks: ['notes'], ride: 'keep', tags: ['dance', 'happy']},
  bow:         {pose: 'bow', face: 'relieved', ride: 'keep', tags: ['lose', 'calm']},
  'good-game': {pose: 'wave', face: 'relieved', marks: ['sweat'], ride: 'keep', tags: ['lose'], variants: [{pose: 'bow'}]},
  facepalm:    {pose: 'facepalm', face: 'sulky', marks: ['gloom-cloud'], tags: ['miss', 'funny']},
  slump:       {pose: 'slump', face: 'sad', marks: ['gloom-cloud'], tags: ['lose'], variants: [{face: 'cry', marks: ['tear-fountain']}]},
  sulk:        {pose: 'sit-sulk', face: 'sulky', marks: ['steam'], tags: ['lose', 'funny']},
  shrug:       {pose: 'shrug', face: 'cheeky', marks: ['question'], ride: 'keep', tags: ['funny']},
  think:       {pose: 'think-chin', face: 'thinking', marks: ['question'], ride: 'keep', tags: ['calm', 'close'], variants: [{marks: ['idea-bulb'], face: 'star-eyes'}]},
  point:       {pose: 'point', face: 'cheeky', ride: 'keep', tags: ['happy']},
  'cover-eyes':{pose: 'cover-eyes', face: 'scared', marks: ['big-sweat'], tags: ['miss', 'close']},
  gasp:        {pose: 'hurt', face: 'gasp', marks: ['exclaim'], tags: ['surprise', 'miss']},
  shock:       {pose: 'hurt', face: 'shock', marks: ['sweat', 'exclaim'], tricks: ['shake'], tags: ['miss', 'surprise']},
  scared:      {pose: 'duck-cover', face: 'scared', marks: ['shiver'], tags: ['miss']},
  nervous:     {pose: 'think-chin', face: 'nervous', marks: ['sweat'], tags: ['close']},
  laugh:       {pose: 'arms-up', face: 'laugh', tricks: ['jelly'], ride: 'keep', tags: ['funny', 'happy']},
  love:        {pose: 'hug', face: 'love', marks: ['hearts'], ride: 'keep', tags: ['happy']},
  cool:        {pose: 'ready', face: 'cool', ride: 'keep', tags: ['win']},
  sneaky:      {pose: 'crouch', face: 'sneaky', tags: ['funny']},
  angry:       {pose: 'guard', face: 'rage-cute', marks: ['anger'], tricks: ['jelly'], tags: ['funny']},
  sleepy:      {pose: 'idle', face: 'sleepy', marks: ['zzz'], ride: 'keep', tags: ['calm']},
  dizzy:       {pose: 'wobble-dizzy', face: 'dizzy', marks: ['dizzy-stars'], tags: ['miss', 'funny'], variants: [{marks: ['birds']}]},
  windup:      {pose: 'windup', face: 'fierce', tricks: ['anticipation', 'smear'], tags: ['sport']},
  smash:       {pose: 'smash', face: 'effort', tricks: ['smear', 'impact-flash'], tags: ['sport']},
  aim:         {pose: 'aim', face: 'determined', tags: ['sport']},
  follow:      {pose: 'follow', face: 'smug', tricks: ['smear'], tags: ['sport']},
  dive:        {pose: 'dive', face: 'effort', tricks: ['afterimage'], tags: ['sport', 'move']},
  floor:       {pose: 'on-floor', face: 'dizzy', marks: ['dizzy-stars'], tricks: ['dust'], tags: ['miss', 'funny']},
  jump:        {pose: 'jump-up', face: 'determined', tricks: ['stretch', 'dust'], tags: ['move', 'sport']},
  land:        {pose: 'land', face: 'joy', tricks: ['squash', 'dust'], tags: ['move']},
  run:         {pose: 'sprint', face: 'determined', tricks: ['blur-limbs', 'footprints'], tags: ['move']},
  skid:        {pose: 'skid', face: 'shock', tricks: ['skid-marks', 'dust'], tags: ['move']},
  trip:        {pose: 'trip', face: 'shock', marks: ['exclaim'], tags: ['move', 'funny']},
  punch:       {pose: 'punch', face: 'fierce', tricks: ['smear', 'impact-flash'], tags: ['fight']},
  uppercut:    {pose: 'uppercut', face: 'effort', tricks: ['stretch', 'smear'], tags: ['fight']},
  kick:        {pose: 'kick', face: 'fierce', tricks: ['blur-limbs'], tags: ['fight']},
  hurt:        {pose: 'hurt', face: 'effort', marks: ['sweat'], tricks: ['shake'], tags: ['fight', 'miss']},
  ko:          {pose: 'ko-spin', face: 'dizzy', marks: ['dizzy-stars'], tricks: ['spirit-puff', 'shake'], tags: ['fight', 'lose'], variants: [{pose: 'on-floor', marks: ['birds'], tricks: ['spirit-puff', 'dust']}]},
  throw:       {pose: 'overhead-throw', face: 'fierce', tricks: ['smear', 'anticipation'], tags: ['throw']},
  catch:       {pose: 'catch', face: 'gasp', tags: ['throw']},
  'power-up':  {pose: 'power-charge', face: 'determined', tricks: ['aura', 'stretch'], marks: ['sparkles'], tags: ['power']},
  float:       {pose: 'float', face: 'relieved', tricks: ['aura'], ride: 'keep', tags: ['power', 'calm']},
  frozen:      {pose: 'frozen', face: 'shock', tricks: ['freeze'], marks: ['shiver'], tags: ['power', 'funny']},
  zapped:      {pose: 'zapped', face: 'shock', tricks: ['silhouette', 'shake'], tags: ['power', 'funny']},
  glitch:      {pose: 'robot-glitch', face: 'glitch', tricks: ['shake'], marks: ['question'], tags: ['robot', 'funny']},
  hero:        {pose: 'flex', face: 'determined', tricks: ['hero-giant', 'aura'], ride: 'keep', tags: ['win', 'power']},
  'funny-loss':{pose: 'trip', face: 'dizzy', tricks: ['chibi', 'dust'], marks: ['birds'], tags: ['lose', 'funny']},
  'chibi-cheer': {pose: 'cheer-jump', face: 'joy', tricks: ['chibi', 'heart-pop'], ride: 'keep', tags: ['happy', 'funny']},
  bloom:       {pose: 'arms-up', face: 'love', tricks: ['flower-bloom'], ride: 'keep', tags: ['happy', 'calm']},
  excited:     {pose: 'cheer-jump', face: 'excited', tricks: ['jelly'], marks: ['sparkles'], ride: 'keep', tags: ['happy']},
  amazed:      {pose: 'arms-up', face: 'amazed', marks: ['exclaim', 'sparkles'], ride: 'keep', tags: ['surprise', 'happy']},
  curious:     {pose: 'think-chin', face: 'curious', marks: ['question'], ride: 'keep', tags: ['calm']},
  confused:    {pose: 'shrug', face: 'confused', marks: ['question'], tags: ['surprise', 'funny'], variants: [{pose: 'think-chin'}]},
  shy:         {pose: 'hug', face: 'shy', ride: 'keep', tags: ['calm']},
  embarrassed: {pose: 'facepalm', face: 'embarrassed', tricks: ['chibi'], tags: ['funny', 'miss']},
  oops:        {pose: 'shrug', face: 'oops', marks: ['sweat'], tags: ['miss', 'funny']},
  silly:       {pose: 'dodge', face: 'silly', tricks: ['jelly'], ride: 'keep', tags: ['funny']},
  bored:       {pose: 'slump', face: 'bored', marks: ['zzz'], ride: 'keep', tags: ['calm']},
  tired:       {pose: 'slump', face: 'tired', marks: ['sweat'], tags: ['calm']},
  yuck:        {pose: 'dodge', face: 'yuck', marks: ['shiver'], tags: ['funny']},
  frustrated:  {pose: 'guard', face: 'frustrated', marks: ['steam', 'anger'], tricks: ['shake'], tags: ['miss', 'lose']},
  disappointed:{pose: 'slump', face: 'disappointed', marks: ['gloom-cloud'], tags: ['lose']},
  jealous:     {pose: 'sit-sulk', face: 'jealous', tags: ['funny']},
  panic:       {pose: 'zapped', face: 'panic', marks: ['big-sweat', 'exclaim'], tricks: ['shake'], tags: ['miss', 'close']},
  hopeful:     {pose: 'cover-eyes', face: 'hopeful', variants: [{pose: 'think-chin'}], tags: ['close']},
  grateful:    {pose: 'bow', face: 'grateful', marks: ['hearts'], ride: 'keep', tags: ['happy', 'calm']},
  brave:       {pose: 'guard', face: 'brave', tricks: ['aura'], tags: ['fight', 'power']},
  focused:     {pose: 'ready', face: 'focused', tags: ['sport', 'calm']},
  giggle:      {pose: 'cover-eyes', face: 'giggle', tricks: ['jelly'], marks: ['notes'], ride: 'keep', tags: ['funny', 'happy']},
  'hurt-feelings': {pose: 'slump', face: 'hurt', marks: ['gloom-cloud'], tags: ['lose']},
  lonely:      {pose: 'sit-sulk', face: 'lonely', marks: ['gloom-cloud'], tags: ['lose', 'calm']},
  sick:        {pose: 'slump', face: 'sick', marks: ['shiver'], tags: ['funny']},
  content:     {pose: 'idle', face: 'content', ride: 'keep', tags: ['calm', 'happy']},
  'high-five': {pose: 'wave', face: 'joy', marks: ['sparkles'], ride: 'keep', pair: true, tags: ['happy', 'win']},
  'hug-pair':  {pose: 'hug', face: 'love', marks: ['hearts'], ride: 'keep', pair: true, tags: ['happy']}
}}, {by: 'core', block: 'core-acts'});
// every AvatarKit gesture is an act too: 'gest.<key>' (old moves keep working and gain a face; shared with the whole app)
if(typeof GESTURES !== 'undefined'){
  const GF = {cheer: 'joy', laugh: 'laugh', yawn: 'sleepy', sleep: 'sleepy', think: 'thinking', heart: 'love', shrug: 'cheeky', sneeze: 'effort', bow: 'relieved', flex: 'proud', dab: 'cool', selfie: 'wink', read: 'thinking', yoga: 'relieved', robot: 'glitch', peekaboo: 'cheeky', magictrick: 'sneaky', kungfu: 'fierce', herolanding: 'determined', worm: 'joy', chicken: 'laugh', penguin: 'joy', sing: 'joy', guitar: 'star-eyes'};
  const acts = {}, dance = [], idle = [];
  GESTURES.forEach(gs => { if(!gs || !gs.k || acts['gest.' + gs.k]) return;
    acts['gest.' + gs.k] = {gest: gs.k, pose: {alive: false}, face: GF[gs.k] || (gs.epic ? 'star-eyes' : 'happy'), ride: 'keep', tags: gs.epic ? ['dance', 'gesture'] : ['gesture'], share: true, about: 'AvatarKit gesture ' + (gs.n || gs.k)};
    (gs.epic ? dance : idle).push('gest.' + gs.k); });
  Acting.add({acts, pools: {'room-dance': dance, 'room-idle': idle.slice(0, 20)}}, {by: 'core', block: 'core-acts'});
}
// 🎭 BLOCK core-acts END

// 🎭 BLOCK core-pools (shared · 💥 Comics chat built it, AS-1) START
// pools = lists of act keys picked with Acting.pick(pool) — every block can ADD to a pool (pools grow, never replace)
Acting.add({pools: {
  idle:       ['idle', 'wave', 'think', 'sleepy', 'shrug', 'point'],
  happy:      ['wave', 'cheer', 'laugh', 'love', 'point', 'chibi-cheer', 'bloom'],
  win:        ['cheer', 'victory', 'flex', 'dance', 'cool', 'hero', 'laugh'],
  lose:       ['bow', 'good-game', 'slump', 'sulk', 'shrug', 'funny-loss'],
  miss:       ['facepalm', 'cover-eyes', 'gasp', 'shock', 'dizzy', 'shrug'],
  close:      ['nervous', 'think', 'cover-eyes'],
  'room-idle':  ['idle', 'wave', 'think', 'sleepy', 'shrug', 'point', 'cool', 'sneaky'],
  'room-happy': ['wave', 'cheer', 'laugh', 'love', 'chibi-cheer', 'bloom', 'flex'],
  'room-dance': ['dance', 'cheer', 'laugh'],
  joy:       ['cheer', 'excited', 'laugh', 'giggle', 'chibi-cheer', 'dance'],
  sadness:   ['slump', 'disappointed', 'lonely', 'hurt-feelings', 'bow'],
  anger:     ['angry', 'frustrated', 'jealous', 'sulk'],
  fear:      ['scared', 'panic', 'cover-eyes', 'nervous', 'shock'],
  surprise:  ['gasp', 'amazed', 'shock', 'confused', 'trip'],
  disgust:   ['yuck', 'sick', 'facepalm'],
  love:      ['love', 'grateful', 'hug-pair', 'bloom', 'high-five'],
  calm:      ['content', 'idle', 'curious', 'focused', 'sleepy', 'bored', 'float'],
  pride:     ['victory', 'flex', 'hero', 'cool', 'brave'],
  silly:     ['silly', 'oops', 'embarrassed', 'shrug', 'funny-loss', 'giggle']
}}, {by: 'core', block: 'core-pools'});
// the emotion wheel every game can ask for: Acting.EMOTIONS.fear → act keys (also pools of the same name)
Acting.EMOTIONS = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'love', 'calm', 'pride', 'silly'];
// 🎭 BLOCK core-pools END

// 🎭 BLOCK core-sig (shared · 💥 Comics chat built it, AS-2) START
// 🎭 Signature acts: each kid picks ONE in 🎒 Wardrobe (avatar field `sig`); it plays on the 👋 tiles, in the Family Room (🎭 button) and later on game result cards.
// 4 free for everyone + 10 from the 🎭 'sigact' item line (Code.gs ITEM_LINES + SIG_ACTS_ — keep the same order). New sig acts from other chats: add them in YOUR block with tags ['sig'] + share: true.
Acting.add({acts: {
  'sig.superstar':    {pose: 'arms-up', face: 'star-eyes', tricks: ['aura', 'sparkle-pop'], marks: ['sparkles'], ride: 'keep', tags: ['sig', 'win', 'joy'], share: true, about: 'Arms up, stars everywhere'},
  'sig.power-up':     {pose: 'power-charge', face: 'determined', tricks: ['aura', 'shake'], marks: ['exclaim'], ride: 'keep', tags: ['sig', 'pride'], share: true, about: 'Charge up a glowing aura'},
  'sig.heart-burst':  {pose: 'hug', face: 'love', tricks: ['heart-pop'], marks: ['hearts'], ride: 'keep', tags: ['sig', 'love'], share: true, about: 'A big hug that bursts into hearts'},
  'sig.genius':       {pose: 'think-chin', face: 'star-eyes', tricks: ['sparkle-pop'], marks: ['idea-bulb'], ride: 'keep', tags: ['sig', 'calm'], share: true, about: 'Hmm… GOT IT!'},
  'sig.ninja':        {pose: 'guard', face: 'fierce', tricks: ['afterimage', 'smear'], ride: 'keep', tags: ['sig', 'pride'], share: true, about: 'Swift ninja guard with after-images'},
  'sig.rockstar':     {gest: 'guitar', face: 'excited', marks: ['notes'], ride: 'keep', tags: ['sig', 'dance', 'joy'], share: true, about: 'Air-guitar solo'},
  'sig.giant-hero':   {pose: 'flex', face: 'proud', tricks: ['hero-giant', 'aura'], ride: 'keep', tags: ['sig', 'pride', 'win'], share: true, about: 'Grow into a giant hero'},
  'sig.flower-twirl': {pose: 'float', face: 'delighted', tricks: ['flower-bloom'], marks: ['sparkles'], ride: 'keep', tags: ['sig', 'calm', 'love'], share: true, about: 'Float up in a ring of flowers'},
  'sig.moonwalk':     {gest: 'moonwalk', face: 'cool', marks: ['notes'], ride: 'keep', tags: ['sig', 'dance'], share: true, about: 'Smooth moonwalk'},
  'sig.robot':        {pose: 'robot-glitch', face: 'glitch', tricks: ['shake'], ride: 'keep', tags: ['sig', 'silly'], share: true, about: 'Beep-boop robot glitch'}
}, pools: {sig: ['victory', 'cheer', 'wave', 'flex', 'sig.superstar', 'sig.power-up', 'sig.heart-burst', 'sig.genius', 'sig.ninja', 'sig.rockstar', 'sig.giant-hero', 'sig.flower-twirl', 'sig.moonwalk', 'sig.robot'],
  'room-happy': ['sig.superstar', 'sig.heart-burst', 'sig.flower-twirl'], 'room-dance': ['sig.rockstar', 'sig.moonwalk'], 'room-idle': ['sig.genius']}
}, {by: 'core', block: 'core-sig', date: '2026-11-13'});
Acting.SIG.free.push('victory', 'cheer', 'wave', 'flex');
Acting.SIG.line.push('sig.superstar', 'sig.power-up', 'sig.heart-burst', 'sig.genius', 'sig.ninja', 'sig.rockstar', 'sig.giant-hero', 'sig.flower-twirl', 'sig.moonwalk', 'sig.robot');
Object.assign(Acting.SIG.names, {victory: '🏆 Victory', cheer: '🙌 Cheer', wave: '👋 Big wave', flex: '💪 Flex', 'sig.superstar': '🌟 Superstar', 'sig.power-up': '⚡ Power up',
  'sig.heart-burst': '💖 Heart burst', 'sig.genius': '💡 Genius', 'sig.ninja': '🥷 Ninja', 'sig.rockstar': '🎸 Rock star', 'sig.giant-hero': '🦸 Giant hero',
  'sig.flower-twirl': '🌸 Flower twirl', 'sig.moonwalk': '🌙 Moonwalk', 'sig.robot': '🤖 Robot'});
// 🎭 BLOCK core-sig END

// 🎭 BLOCK comic-poses (shared · 💥 Comics chat, ck-1a) START
// extra poses comics need (ck-1a) — table / board games, fights, funny moments · keys 'comic.<name>' · shared with every game
Acting.add({poses: {
  'comic.roll':         {armR: 2.2, armL: 2.2, legL: 1.3, legR: 1.1, bend: 0.9, rot: 1.2, dy: 10, sx: 1.05, sy: 0.85, tags: ['move', 'funny']},
  'comic.grab':         {armR: 1.7, armL: 1.5, legL: 0.5, legR: -0.4, bend: 0.35, tags: ['fight']},
  'comic.throw':        {armR: 2.3, holdRot: -1.0, armL: -0.9, legL: 0.6, legR: -0.5, bend: 0.4, tags: ['throw', 'fight']},
  'comic.tantrum':      {armR: 2.5, armL: 2.5, legL: 0.9, legR: -0.2, bend: 0.1, dy: 2, tags: ['funny', 'anger']},
  'comic.ghost-float':  {armR: 1.5, armL: 1.5, legL: 0.25, legR: 0.25, dy: -16, rot: 0.08, tags: ['funny', 'spooky']},
  'comic.sit-table':    {armR: 1.4, armL: 1.3, legL: 1.5, legR: 1.4, bend: 0.2, dy: 16, tags: ['table', 'calm']},
  'comic.move-piece':   {armR: 1.45, holdRot: 0.2, armL: 0.6, legL: 1.5, legR: 1.4, bend: 0.35, dy: 16, tags: ['table']},
  'comic.scratch-head': {armR: 2.75, armL: 0.25, legL: 0.15, legR: -0.1, bend: 0.05, tags: ['table', 'calm', 'funny']},
  'comic.lean-board':   {armR: 1.0, armL: 0.9, legL: 0.2, legR: -0.25, bend: 0.75, tags: ['table']}
}, acts: {
  'comic.roll':         {pose: 'comic.roll', face: 'dizzy', tricks: ['dust'], ride: 'drop', tags: ['funny', 'move'], share: true, about: 'Roll away'},
  'comic.grab':         {pose: 'comic.grab', face: 'determined', ride: 'drop', tags: ['fight'], share: true, about: 'Grab!'},
  'comic.throw':        {pose: 'comic.throw', face: 'fierce', tricks: ['smear'], ride: 'drop', tags: ['throw', 'fight'], share: true, about: 'Big throw'},
  'comic.tantrum':      {pose: 'comic.tantrum', face: 'rage-cute', tricks: ['shake'], marks: ['steam'], ride: 'keep', tags: ['anger', 'funny', 'lose'], share: true, about: 'A cute little tantrum'},
  'comic.ghost-float':  {pose: 'comic.ghost-float', face: 'sleepy', tricks: ['spirit-puff'], ride: 'drop', tags: ['funny', 'lose'], share: true, about: 'Floats away like a ghost'},
  'comic.sit-table':    {pose: 'comic.sit-table', face: 'focused', ride: 'drop', tags: ['table', 'calm'], share: true, about: 'Sits at the table'},
  'comic.move-piece':   {pose: 'comic.move-piece', face: 'smug', ride: 'drop', tags: ['table', 'pride'], share: true, about: 'Moves a piece — hehe'},
  'comic.scratch-head': {pose: 'comic.scratch-head', face: 'confused', marks: ['question'], ride: 'keep', tags: ['table', 'calm', 'surprise'], share: true, about: 'Hmm…?'},
  'comic.lean-board':   {pose: 'comic.lean-board', face: 'thinking', marks: ['sweat'], ride: 'drop', tags: ['table', 'close'], share: true, about: 'Leans over the board'}
}, pools: {sadness: ['comic.ghost-float'], anger: ['comic.tantrum'], calm: ['comic.sit-table'], pride: ['comic.move-piece'], surprise: ['comic.scratch-head'], silly: ['comic.roll', 'comic.tantrum']}
}, {by: '💥 Comics chat', block: 'comic-poses', game: 'comics', date: '2026-11-13'});
// 🎭 BLOCK comic-poses END

// 🎭 BLOCK cheer (📣 Cheer chat · CheerSquad) START
// 📣 CheerSquad crowd moves (cs-1) — keys 'cheer.<name>', pools 'cheer.<kind>' + game extras 'cheer.<game>.<kind>' · shared with every game
Acting.add({poses: {
  'cheer.hands-head': {armR: 2.8, armL: 2.8, legL: 0.05, legR: -0.05, bend: -0.05, tags: ['crowd', 'miss']},
  'cheer.lean':       {armR: 1.05, armL: 1.15, legL: 0.15, legR: -0.15, bend: 0.28, tags: ['crowd', 'close']},
  'cheer.drum':       {armR: 0.75, armL: 0.8, legL: 0.35, legR: -0.35, bend: 0.4, dy: 3, tags: ['crowd', 'close']},
  'cheer.sign':       {armR: 2.95, armL: 2.95, legL: 0.1, legR: -0.1, tags: ['crowd', 'win']},
  'cheer.pompom':     {armR: 2.6, armL: 1.2, legL: 0.3, legR: -0.1, dy: -2, tags: ['crowd', 'win']},
  'cheer.bite':       {armR: 2.2, armL: 2.0, legL: 0.1, legR: -0.1, bend: 0.12, tags: ['crowd', 'close']},
  'cheer.air-swing':  {armR: 2.3, holdRot: -0.9, armL: -0.7, legL: 0.5, legR: -0.4, bend: 0.25, tags: ['crowd', 'sport']},
  'cheer.serve-copy': {armR: 2.6, armL: 2.9, legL: 0.1, legR: -0.2, dy: -3, tags: ['crowd', 'sport']}
}, acts: {
  'cheer.clap':       {gest: 'clap', face: 'joy', ride: 'drop', tags: ['crowd', 'happy'], share: true, about: 'Claps for you'},
  'cheer.hop':        {gest: 'hop', face: 'excited', ride: 'drop', tags: ['crowd', 'happy'], share: true, about: 'Happy hops'},
  'cheer.dab':        {gest: 'dab', face: 'cool', ride: 'drop', tags: ['crowd', 'win'], share: true, about: 'Dab!'},
  'cheer.starjump':   {gest: 'starjump', face: 'star-eyes', marks: ['sparkles'], ride: 'drop', tags: ['crowd', 'win'], share: true, about: 'Star jump'},
  'cheer.floss':      {gest: 'floss', face: 'laugh', ride: 'drop', tags: ['crowd', 'dance'], share: true, about: 'Floss dance'},
  'cheer.shuffle':    {gest: 'shuffle', face: 'joy', marks: ['notes'], ride: 'drop', tags: ['crowd', 'dance'], share: true, about: 'Shuffle'},
  'cheer.chicken':    {gest: 'chicken', face: 'giggle', ride: 'drop', tags: ['crowd', 'dance', 'funny'], share: true, about: 'Chicken dance'},
  'cheer.penguin':    {gest: 'penguin', face: 'happy', ride: 'drop', tags: ['crowd', 'dance', 'funny'], share: true, about: 'Penguin waddle'},
  'cheer.windmill':   {gest: 'windmill', face: 'excited', ride: 'drop', tags: ['crowd', 'big'], share: true, about: 'Windmill arms'},
  'cheer.disco':      {gest: 'disco', face: 'cool', marks: ['sparkles'], ride: 'drop', tags: ['crowd', 'big', 'dance'], share: true, about: 'Disco point'},
  'cheer.electric':   {gest: 'electric', face: 'excited', ride: 'drop', tags: ['crowd', 'big', 'dance'], share: true, about: 'Electric wave'},
  'cheer.heart':      {gest: 'heart', face: 'love', marks: ['hearts'], ride: 'drop', tags: ['crowd', 'lose', 'love'], share: true, about: 'Heart hands'},
  'cheer.snack':      {gest: 'snack', face: 'content', ride: 'drop', tags: ['crowd', 'calm'], share: true, about: 'Popcorn time'},
  'cheer.selfie':     {gest: 'selfie', face: 'cheeky', ride: 'drop', tags: ['crowd', 'calm', 'funny'], share: true, about: 'Selfie with the game'},
  'cheer.fist':       {pose: 'fist-pump', face: 'excited', tricks: ['stretch'], ride: 'drop', tags: ['crowd', 'win'], share: true, about: 'YES!'},
  'cheer.sign':       {pose: 'cheer.sign', face: 'joy', ride: 'drop', tags: ['crowd', 'win'], share: true, about: 'Holds up a sign'},
  'cheer.pompom':     {pose: 'cheer.pompom', face: 'joy', tricks: ['jelly'], ride: 'drop', tags: ['crowd', 'big'], share: true, about: 'Pom-pom shake'},
  'cheer.hands-head': {pose: 'cheer.hands-head', face: 'worried', marks: ['big-sweat'], ride: 'drop', tags: ['crowd', 'miss'], share: true, about: 'Hands on head — so close!'},
  'cheer.lean-in':    {pose: 'cheer.lean', face: 'nervous', marks: ['sweat'], ride: 'drop', tags: ['crowd', 'close'], share: true, about: 'Leans in'},
  'cheer.drumroll':   {pose: 'cheer.drum', face: 'focused', tricks: ['shake'], ride: 'drop', tags: ['crowd', 'close'], share: true, about: 'Drumroll on the knees'},
  'cheer.bite-nails': {pose: 'cheer.bite', face: 'nervous', marks: ['shiver'], ride: 'drop', tags: ['crowd', 'close'], share: true, about: 'Bites nails'},
  'cheer.sb.air-swing':  {pose: 'cheer.air-swing', face: 'fierce', tricks: ['smear'], ride: 'drop', tags: ['crowd', 'sport'], from: 'slabrall', share: true, about: 'Swings an air racket'},
  'cheer.sb.serve-copy': {pose: 'cheer.serve-copy', face: 'focused', ride: 'drop', tags: ['crowd', 'sport'], from: 'slabrall', share: true, about: 'Copies the serve'}
}, pools: {
  'cheer.idle':  ['idle', 'content', 'curious', 'cheer.snack', 'cheer.selfie', 'wave', 'think', 'point'],
  'cheer.start': ['wave', 'cheer.hop', 'cheer.clap', 'point', 'cheer.fist', 'excited', 'cheer.selfie'],
  'cheer.goal':  ['cheer', 'excited', 'chibi-cheer', 'laugh', 'cheer.dab', 'cheer.starjump', 'victory', 'cheer.fist', 'cheer.clap', 'love'],
  'cheer.big':   ['amazed', 'cheer.windmill', 'cheer.disco', 'cheer.electric', 'cheer.floss', 'hero', 'cheer.pompom', 'cheer.starjump'],
  'cheer.miss':  ['cover-eyes', 'facepalm', 'gasp', 'shock', 'cheer.hands-head', 'oops', 'shrug'],
  'cheer.close': ['nervous', 'think', 'hopeful', 'cheer.lean-in', 'cheer.drumroll', 'cover-eyes', 'cheer.bite-nails'],
  'cheer.win':   ['dance', 'victory', 'cheer.floss', 'cheer.shuffle', 'cheer.chicken', 'cheer.penguin', 'flex', 'hero', 'laugh', 'cheer'],
  'cheer.lose':  ['cheer.clap', 'bow', 'good-game', 'cheer.heart', 'wave', 'grateful', 'hopeful'],
  'cheer.comeback': ['cheer.fist', 'brave', 'excited', 'cheer.clap', 'cheer.starjump'],
  'cheer.slabrall.goal':  ['cheer.sb.air-swing'],
  'cheer.slabrall.big':   ['cheer.sb.air-swing', 'cheer.sb.serve-copy'],
  'cheer.slabrall.start': ['cheer.sb.serve-copy'],
  joy: ['cheer.hop', 'cheer.starjump'], calm: ['cheer.snack'], silly: ['cheer.chicken', 'cheer.penguin'], love: ['cheer.heart'], fear: ['cheer.bite-nails'], 'room-dance': ['cheer.floss', 'cheer.shuffle', 'cheer.chicken'], 'room-happy': ['cheer.clap', 'cheer.hop']
}}, {by: '📣 Cheer chat', block: 'cheer', game: 'cheersquad', date: '2026-11-13'});
// 🎭 BLOCK cheer END

// 🎭 BLOCK pokadif (🔍 Pokadif chat) START
// 📸 Family Photo Hunt (pk-4a, 2026-11-14): our own photo acts — mixes of core poses + faces, shared so the Family Room, 🎭 Acts shelf, crowds and comics can use them.
// Keep in step with Pokadif engine PK.PHOTO_ACTS (key → pose + face).
Acting.add({acts: {
  'pk.tada':       {pose: 'arms-up',    face: 'joy',      ride: 'keep', tags: ['photo', 'happy', 'win'],   share: true, from: 'Pokadif', about: 'Ta-da! at the trip spot'},
  'pk.jump-shot':  {pose: 'cheer-jump', face: 'excited',  ride: 'keep', tags: ['photo', 'happy'],          share: true, from: 'Pokadif', about: 'Jump for the photo!'},
  'pk.look-there': {pose: 'point',      face: 'amazed',   ride: 'keep', tags: ['photo', 'curious'],        share: true, from: 'Pokadif', about: 'Look over there!'},
  'pk.strong':     {pose: 'flex',       face: 'proud',    ride: 'keep', tags: ['photo', 'win'],            share: true, from: 'Pokadif', about: 'Strong-arm photo'},
  'pk.hello-bow':  {pose: 'bow',        face: 'happy',    ride: 'keep', tags: ['photo', 'calm'],           share: true, from: 'Pokadif', about: 'A polite hello bow'},
  'pk.wonder':     {pose: 'think-chin', face: 'curious',  ride: 'keep', tags: ['photo', 'curious'],        share: true, from: 'Pokadif', about: 'Hmm, what is that?'},
  'pk.wink-wave':  {pose: 'wave',       face: 'wink',     ride: 'keep', tags: ['photo', 'happy'],          share: true, from: 'Pokadif', about: 'Wave + wink at the camera'},
  'pk.big-hug':    {pose: 'hug',        face: 'love',     ride: 'keep', tags: ['photo', 'happy', 'room'],  share: true, from: 'Pokadif', about: 'Big family hug'},
  'pk.oh-well':    {pose: 'shrug',      face: 'silly',    ride: 'keep', tags: ['photo', 'funny'],          share: true, from: 'Pokadif', about: 'Oh well! (silly shrug)'},
  'pk.we-did-it':  {pose: 'fist-pump',  face: 'laugh',    ride: 'keep', tags: ['photo', 'win', 'sig'],     share: true, from: 'Pokadif', about: 'We made it here!'},
  'pk.cool-pose':  {pose: 'ready',      face: 'cool',     ride: 'keep', tags: ['photo', 'win'],            share: true, from: 'Pokadif', about: 'Cool tourist pose'}
}}, {by: '🔍 Pokadif chat', block: 'pokadif', game: 'pokadif', date: '2026-11-14'});
// 🎭 BLOCK pokadif END

// 🎭 BLOCK core-beats (shared · 🧱 baseline chat, B1a) START
// 🎬 beat acts: ready → anticipation → contact → follow-through → settle (Checklist §17). Poses use the 🦴 b1a joints (elbow / knee / foot).
Acting.add({poses: {
  'b.stand':      {armL: 0.15, armR: 0.15},
  'b.wave-low':   {armR: 1.2, elbowR: 0.9, armL: 0.25, bend: 0.06, sy: 0.97},
  'b.wave-up':    {armR: 2.6, elbowR: 0.5, armL: 0.3, bend: -0.05, sy: 1.03},
  'b.wave-over':  {armR: 2.75, elbowR: -0.55, armL: 0.3, bend: -0.04},
  'b.crouch':     {armL: -0.5, armR: -0.5, elbowL: 0.3, elbowR: 0.3, kneeL: 0.9, kneeR: 0.9, legL: 0.45, legR: -0.45, dy: 7, sy: 0.9, sx: 1.06, bend: 0.25},
  'b.burst':      {armL: 3.0, armR: 3.0, elbowL: -0.1, elbowR: -0.1, legL: 0.12, legR: -0.12, footL: 0.5, footR: 0.5, dy: -10, sy: 1.1, sx: 0.94},
  'b.fist':       {armL: 2.9, armR: 2.9, elbowL: 1.2, elbowR: 1.2, dy: -4, sy: 1.04},
  'b.tuck':       {armL: 1.8, armR: 1.8, elbowL: 0.8, elbowR: 0.8, kneeL: 1.4, kneeR: 1.4, legL: 0.9, legR: -0.9, dy: -34, sy: 0.96},
  'b.stretch':    {armL: 2.9, armR: 2.9, legL: 0.1, legR: -0.1, footL: 0.7, footR: 0.7, dy: -14, sy: 1.12, sx: 0.92},
  'b.land':       {armL: 0.7, armR: 0.7, elbowL: 0.6, elbowR: 0.6, kneeL: 0.9, kneeR: 0.9, legL: 0.45, legR: -0.45, dy: 7, sy: 0.88, sx: 1.08, bend: 0.12},
  'b.throw-back': {armR: -2.3, elbowR: -1.1, armL: 1.2, legL: 0.45, legR: -0.3, kneeR: 0.3, bend: -0.25, rot: -0.06},
  'b.throw-out':  {armR: 2.2, elbowR: -0.1, armL: -0.4, legL: 0.5, legR: -0.4, kneeL: 0.25, footR: 0.4, bend: 0.32, rot: 0.08},
  'b.throw-thru': {armR: 0.3, elbowR: 0.2, armL: -0.6, legL: 0.55, legR: -0.55, kneeR: 0.6, footR: 0.6, bend: 0.4, rot: 0.1},
  'b.kick-back':  {legL: -0.9, kneeL: 1.3, legR: 0.08, kneeR: 0.25, armL: 1.0, armR: -0.7, elbowR: 0.4, bend: -0.12},
  'b.kick-hit':   {legL: 1.05, kneeL: 0.05, footL: 0.55, legR: -0.05, kneeR: 0.3, armL: -0.5, armR: 1.2, bend: -0.18, dy: -2},
  'b.kick-thru':  {legL: 1.7, kneeL: -0.1, footL: 0.4, legR: -0.1, kneeR: 0.2, armL: -0.8, armR: 1.5, bend: -0.3, dy: -4},
  'b.bow-down':   {armL: 0.4, armR: 1.3, elbowR: 1.5, bend: 0.75, kneeL: 0.15, kneeR: 0.15},
  'b.bow-up':     {armL: 0.2, armR: 2.6, elbowR: 0.4, bend: -0.08, sy: 1.02}
}, acts: {
  'beat.wave':  {tags: ['hello', 'happy', 'beat'], share: true, ride: 'keep', beats: [
    {pose: 'b.stand', face: 'happy', ms: 60}, {pose: 'b.wave-low', face: 'happy', ms: 150, ease: 'in'},
    {pose: 'b.wave-up', face: 'joy', ms: 90, contact: true}, {pose: 'b.wave-over', face: 'joy', ms: 220, ease: 'back'},
    {pose: 'b.stand', face: 'happy', ms: 180, ease: 'out'}]},
  'beat.cheer': {tags: ['win', 'happy', 'beat'], share: true, ride: 'keep', beats: [
    {pose: 'b.stand', face: 'happy', ms: 60}, {pose: 'b.crouch', face: 'determined', ms: 200, ease: 'in'},
    {pose: 'b.burst', face: 'joy', ms: 90, contact: true, marks: ['sparkles']}, {pose: 'b.fist', face: 'star-eyes', ms: 260, ease: 'back', marks: ['sparkles']},
    {pose: 'b.stand', face: 'happy', ms: 200, ease: 'out'}]},
  'beat.jump':  {tags: ['move', 'beat'], share: true, beats: [
    {pose: 'b.stand', face: 'determined', ms: 50}, {pose: 'b.crouch', face: 'determined', ms: 180, ease: 'in'},
    {pose: 'b.stretch', face: 'joy', ms: 80, contact: true}, {pose: 'b.tuck', face: 'joy', ms: 300, ease: 'out'},
    {pose: 'b.land', face: 'happy', ms: 200, ease: 'in', name: 'settle'}]},
  'beat.throw': {tags: ['sport', 'beat'], share: true, hold: 'none', prop: {ch: '⚾', size: 12, at: 'hand', lag: 45, boost: 1.4, maxSpeed: 360, aim: -0.3, aimMix: 0.75, gravity: 260, spin: 10}, beats: [
    {pose: 'b.stand', face: 'determined', ms: 70}, {pose: 'b.throw-back', face: 'fierce', ms: 220, ease: 'in'},
    {pose: 'b.throw-out', face: 'effort', ms: 90, contact: true}, {pose: 'b.throw-thru', face: 'proud', ms: 260, ease: 'back'},
    {pose: 'b.stand', face: 'happy', ms: 180, ease: 'out'}]},
  'beat.kick':  {tags: ['sport', 'beat'], share: true, prop: {ch: '⚽', size: 13, at: 'foot', rest: [17, -6], boost: 1.6, maxSpeed: 400, gravity: 300, spin: 12}, beats: [
    {pose: 'b.stand', face: 'determined', ms: 60}, {pose: 'b.kick-back', face: 'fierce', ms: 200, ease: 'in'},
    {pose: 'b.kick-hit', face: 'effort', ms: 80, contact: true}, {pose: 'b.kick-thru', face: 'proud', ms: 260, ease: 'back'},
    {pose: 'b.stand', face: 'happy', ms: 200, ease: 'out'}]},
  'beat.bow':   {tags: ['win', 'calm', 'beat'], share: true, ride: 'keep', beats: [
    {pose: 'b.stand', face: 'happy', ms: 80}, {pose: 'b.wave-low', face: 'happy', ms: 160, ease: 'in'},
    {pose: 'b.bow-down', face: 'proud', ms: 100, contact: true}, {pose: 'b.bow-up', face: 'joy', ms: 280, ease: 'back'},
    {pose: 'b.stand', face: 'happy', ms: 200, ease: 'out'}]}
}, pools: {'beat': ['beat.wave', 'beat.cheer', 'beat.jump', 'beat.throw', 'beat.kick', 'beat.bow']}}, {by: 'core', block: 'core-beats', date: '2026-11-15'});
// 🎬 b1a2 (Aowu 08:56 "skill / force / run / slide / dive / punch / receiving punch"): 8 more acts. `shift` = body moved along its facing (the game moves the real position);
// `stop` = 💥 hit-stop ms on the contact; `overlap` = fields that trail the body (ms); `prop` = the object's own beats (cast ✨ grows, force 💨 pushes out).
Acting.add({poses: {
  'b.run-load':    {bend: -0.15, rot: -0.05, kneeL: 0.6, kneeR: 0.6, legL: 0.25, legR: 0.15, dy: 5, sy: 0.93, sx: 1.04, armR: -0.5, elbowR: 0.6, armL: -0.4, elbowL: 0.5},
  'b.run-push':    {bend: 0.38, rot: 0.1, legL: 1.0, kneeL: 1.3, legR: 0.7, kneeR: 0.1, footR: 0.6, armR: -1.0, elbowR: 1.2, armL: -1.1, elbowL: 1.3, dy: -3, shift: 3, sx: 0.97, sy: 1.04},
  'b.run-stride':  {bend: 0.3, rot: 0.06, legL: -0.35, kneeL: 1.0, legR: -0.8, kneeR: 1.1, armR: 1.1, elbowR: 1.2, armL: 0.9, elbowL: 1.2, dy: -2, shift: 6},
  'b.run-go':      {bend: 0.25, rot: 0.05, legL: 0.6, kneeL: 1.2, legR: 0.4, kneeR: 0.4, armR: -0.8, elbowR: 1.3, armL: -0.8, elbowL: 1.3, shift: 8},
  'b.skid-run':    {bend: 0.25, rot: 0.08, legL: 0.5, kneeL: 1.0, legR: 0.4, kneeR: 0.5, armR: -0.6, elbowR: 1.2, armL: -0.6, elbowL: 1.2},
  'b.skid-brace':  {bend: -0.3, rot: -0.12, legL: 0.75, kneeL: 0.1, footL: -0.5, legR: 0.35, kneeR: 0.7, armR: 1.7, elbowR: 0.2, armL: 1.6, dy: 4, shift: 3},
  'b.skid-stop':   {bend: -0.35, rot: -0.2, legL: 0.95, footL: -0.7, legR: 0.5, kneeR: 1.0, armR: 2.1, elbowR: 0.1, armL: 1.9, dy: 6, sx: 1.08, sy: 0.9, shift: 7},
  'b.skid-wobble': {bend: 0.22, rot: 0.1, armR: 2.5, elbowR: 0.3, armL: 2.4, legL: 0.3, legR: 0.15, kneeR: 0.3, shift: 8},
  'b.skid-done':   {armL: 0.15, armR: 0.15, shift: 8},
  'b.slide-drop':  {bend: -0.25, rot: -0.15, kneeL: 0.6, kneeR: 1.2, legL: 0.6, legR: 0.2, dy: 7, armR: 1.2, elbowR: 0.4, armL: 1.5, shift: 2},
  'b.slide-down':  {rotFull: -1.1, dy: 22, legL: 0.5, footL: -0.3, legR: 0.1, kneeR: 1.3, armR: 0.6, elbowR: 0.5, armL: 2.6, elbowL: 0.3, shift: 6},
  'b.slide-glide': {rotFull: -1.15, dy: 23, legL: 0.5, footL: -0.3, legR: 0.1, kneeR: 1.3, armR: 0.7, elbowR: 0.5, armL: 2.6, elbowL: 0.3, shift: 12},
  'b.slide-up':    {rotFull: -0.3, bend: 0.15, kneeL: 0.9, kneeR: 0.9, legL: 0.45, legR: 0.1, dy: 8, armR: 1.3, armL: 1.0, shift: 14},
  'b.dive-load':   {bend: 0.45, kneeL: 1.0, kneeR: 1.0, legL: 0.45, legR: 0.3, dy: 9, sy: 0.92, armR: -0.9, elbowR: 0.2, armL: 0.9, shift: -1},
  'b.dive-fly':    {rotFull: 1.3, dy: -8, armR: 3.0, elbowR: -0.1, armL: -3.0, legL: 0.15, legR: 0.15, footL: 0.6, footR: 0.6, shift: 8},
  'b.dive-land':   {rotFull: 1.5, dy: 24, armR: 2.7, elbowR: 0.4, armL: -2.7, elbowL: -0.4, legL: 0.1, legR: 0.3, kneeR: 0.4, shift: 16},
  'b.dive-up':     {rotFull: 0.55, bend: 0.25, dy: 12, kneeL: 1.4, kneeR: 1.4, legL: 0.9, legR: 0.4, armR: 1.4, elbowR: 0.6, armL: -1.2, shift: 18},
  'b.guard':       {armR: 1.4, elbowR: 1.8, armL: -1.0, elbowL: -1.6, legL: 0.3, legR: 0.35, kneeL: 0.25, kneeR: 0.3, bend: 0.05, dy: 2},
  'b.punch-cock':  {armR: 0.3, elbowR: 2.2, armL: -1.2, elbowL: -1.6, bend: -0.12, rot: -0.05, legL: 0.3, legR: 0.4, kneeR: 0.45, dy: 3},
  'b.punch-hit':   {armR: 1.6, armL: -0.9, elbowL: -1.7, bend: 0.22, rot: 0.06, legL: 0.5, kneeL: 0.35, legR: 0.45, kneeR: 0.1, footR: 0.3, shift: 4},
  'b.punch-over':  {armR: 1.72, elbowR: 0.05, armL: -0.8, elbowL: -1.7, bend: 0.3, rot: 0.08, legL: 0.55, kneeL: 0.45, legR: 0.5, shift: 6},
  'b.flinch':      {bend: -0.06, sy: 0.97, armR: 0.5, elbowR: 0.6, armL: -0.4, elbowL: -0.5},
  'b.hit-impact':  {bend: -0.4, rot: -0.18, armR: 1.0, elbowR: 0.5, armL: 1.7, elbowL: 0.3, legL: 0.45, kneeL: 0.2, legR: 0.2, kneeR: 0.3, shift: -5, sx: 0.92, sy: 1.06, dy: -2},
  'b.hit-stumble': {bend: -0.2, rot: -0.1, armR: 1.9, elbowR: 0.4, armL: 1.9, legL: 0.6, kneeL: 0.3, legR: 0.6, kneeR: 0.6, shift: -9},
  'b.hit-done':    {armL: 0.15, armR: 0.15, shift: -9},
  'b.cast-gather': {armR: 1.0, elbowR: 1.5, armL: -0.9, elbowL: -1.4, bend: -0.12, dy: 3, kneeL: 0.25, kneeR: 0.25, sy: 0.96},
  'b.cast-push':   {armR: 1.65, armL: -1.55, bend: 0.18, legL: 0.45, kneeL: 0.3, legR: 0.4, footR: 0.3, shift: 3},
  'b.cast-recoil': {armR: 1.75, elbowR: 0.1, armL: -1.6, bend: -0.12, rot: -0.05},
  'b.force-pull':  {armR: -0.7, elbowR: 1.1, armL: 0.8, elbowL: 1.0, bend: -0.22, rot: -0.06, kneeL: 0.35, kneeR: 0.35, legL: 0.3, legR: 0.25, dy: 4},
  'b.force-shove': {armR: 1.55, armL: -1.5, bend: 0.32, rot: 0.08, legL: 0.6, kneeL: 0.4, legR: 0.55, footR: 0.45, shift: 4},
  'b.force-hold':  {armR: 1.6, armL: -1.55, bend: 0.34, rot: 0.09, legL: 0.6, kneeL: 0.45, legR: 0.55, footR: 0.45, shift: 5},
  'b.force-done':  {armL: 0.15, armR: 0.15, shift: 3}
}, acts: {
  'beat.run-start': {tags: ['move', 'sport', 'beat'], share: true, overlap: {armR: 50, armL: 50}, beats: [
    {pose: 'b.stand', face: 'determined', ms: 60}, {pose: 'b.run-load', face: 'determined', ms: 150},
    {pose: 'b.run-push', face: 'effort', ms: 80, contact: true, tricks: ['dust']}, {pose: 'b.run-stride', face: 'determined', ms: 220},
    {pose: 'b.run-go', face: 'determined', ms: 160}]},
  'beat.skid':  {tags: ['move', 'sport', 'beat'], share: true, overlap: {armR: 60, armL: 60}, beats: [
    {pose: 'b.skid-run', face: 'determined', ms: 60}, {pose: 'b.skid-brace', face: 'shock', ms: 160},
    {pose: 'b.skid-stop', face: 'gasp', ms: 100, contact: true, tricks: ['skid-marks', 'dust']}, {pose: 'b.skid-wobble', face: 'oops', ms: 300, ease: 'elasticOut'},
    {pose: 'b.skid-done', face: 'relieved', ms: 180}]},
  'beat.slide': {tags: ['move', 'sport', 'beat'], share: true, overlap: {armL: 50}, beats: [
    {pose: 'b.skid-run', face: 'determined', ms: 60}, {pose: 'b.slide-drop', face: 'determined', ms: 160},
    {pose: 'b.slide-down', face: 'effort', ms: 90, contact: true, tricks: ['dust']}, {pose: 'b.slide-glide', face: 'brave', ms: 280, ease: 'quadOut', tricks: ['dust']},
    {pose: 'b.slide-up', face: 'happy', ms: 200}]},
  'beat.dive':  {tags: ['move', 'sport', 'beat'], share: true, overlap: {legL: 40, legR: 60}, beats: [
    {pose: 'b.stand', face: 'focused', ms: 60}, {pose: 'b.dive-load', face: 'determined', ms: 180},
    {pose: 'b.dive-fly', face: 'brave', ms: 100, contact: true}, {pose: 'b.dive-land', face: 'effort', ms: 280, ease: 'bounceOut', tricks: ['dust']},
    {pose: 'b.dive-up', face: 'relieved', ms: 200}]},
  'beat.punch': {tags: ['fight', 'beat'], share: true, hold: 'none', overlap: {armL: 40}, beats: [
    {pose: 'b.guard', face: 'focused', ms: 60}, {pose: 'b.punch-cock', face: 'fierce', ms: 140},
    {pose: 'b.punch-hit', face: 'effort', ms: 80, contact: true, stop: 60, tricks: ['smear', 'impact-flash']}, {pose: 'b.punch-over', face: 'fierce', ms: 180},
    {pose: 'b.guard', face: 'focused', ms: 160}]},
  'beat.hit':   {tags: ['fight', 'miss', 'beat'], share: true, overlap: {armR: 60, armL: 70}, beats: [
    {pose: 'b.stand', face: 'neutral', ms: 40}, {pose: 'b.flinch', face: 'shock', ms: 60, name: 'flinch', ease: 'hold'},
    {pose: 'b.hit-impact', face: 'hurt', ms: 90, contact: true, stop: 70, tricks: ['shake', 'impact-flash'], marks: ['exclaim']},
    {pose: 'b.hit-stumble', face: 'dizzy', ms: 300, ease: 'elasticOut', marks: ['dizzy-stars']}, {pose: 'b.hit-done', face: 'oops', ms: 200}]},
  'beat.cast':  {tags: ['magic', 'skill', 'beat'], share: true, hold: 'none', prop: {ch: '✨', size: 15, at: 'hand', lag: 25, grow: true, show: 'anticipation', minSpeed: 210, maxSpeed: 230, aim: 0, aimMix: 1, gravity: 0, spin: 5}, beats: [
    {pose: 'b.stand', face: 'focused', ms: 70}, {pose: 'b.cast-gather', face: 'focused', ms: 240, marks: ['sparkles']},
    {pose: 'b.cast-push', face: 'fierce', ms: 90, contact: true, tricks: ['impact-flash']}, {pose: 'b.cast-recoil', face: 'proud', ms: 240},
    {pose: 'b.stand', face: 'happy', ms: 180}]},
  'beat.force': {tags: ['magic', 'skill', 'beat'], share: true, hold: 'none', prop: {ch: '💨', size: 17, at: 'hand', lag: 20, show: 'contact', minSpeed: 260, maxSpeed: 300, aim: 0, aimMix: 1, gravity: 0, spin: 0}, beats: [
    {pose: 'b.stand', face: 'focused', ms: 60}, {pose: 'b.force-pull', face: 'determined', ms: 200},
    {pose: 'b.force-shove', face: 'effort', ms: 90, contact: true, stop: 40}, {pose: 'b.force-hold', face: 'fierce', ms: 220, ease: 'quartOut'},
    {pose: 'b.force-done', face: 'proud', ms: 180}]}
}, pools: {'beat': ['beat.run-start', 'beat.skid', 'beat.slide', 'beat.dive', 'beat.punch', 'beat.hit', 'beat.cast', 'beat.force']}}, {by: 'core', block: 'core-beats', date: '2026-11-15'});
// 🎭 BLOCK core-beats END

// 🎭 BLOCK blasoff (⚽ BlasOff chat · real actions) START
// ⚽ BlasOff real actions (bo-5a): every action = ready → anticipation → contact → follow-through → settle (Checklist §17).
// The BlasOff ENGINE is the clock (p.act / p.bi / p.bq, engine ACT_BEATS): in the air the follow-through lasts until the feet are down and the
// 🛝 dodge's anticipation is a quick 70 ms in play — the times below are the guide times other users (comics, crowds, Room) play.
// Poses use the 🦴 B1 joints (elbow / knee / foot). Side view, facing right: legL = the front / kicking leg (+ = forward), legR (− = forward).
Acting.add({poses: {
  'bo.ready':      {armL: 0.35, armR: 0.3, elbowL: 0.35, elbowR: 0.35, legL: 0.12, legR: -0.08, kneeL: 0.2, kneeR: 0.2, bend: 0.06},
  'bo.crouch':     {armL: -0.7, armR: -0.6, elbowL: 0.25, elbowR: 0.25, legL: 0.4, legR: -0.4, kneeL: 1.0, kneeR: 1.0, dy: 7, sy: 0.9, sx: 1.06, bend: 0.24},
  'bo.takeoff':    {armL: 2.5, armR: 2.2, elbowL: -0.1, elbowR: 0.1, legL: 0.25, legR: 0.25, kneeL: 0.15, kneeR: 0.5, footL: 0.7, footR: 0.6, sy: 1.08, sx: 0.94, bend: -0.05},
  'bo.tuck':       {armL: 1.5, armR: 1.3, elbowL: 0.8, elbowR: 0.8, legL: 1.05, legR: -0.95, kneeL: 1.55, kneeR: 1.55, footL: 0.3, footR: 0.3, sy: 0.97},
  'bo.land':       {armL: 0.8, armR: 0.7, elbowL: 0.6, elbowR: 0.6, legL: 0.42, legR: -0.42, kneeL: 0.95, kneeR: 0.95, dy: 6, sy: 0.88, sx: 1.08, bend: 0.14},
  // 🛝 jump dodge = a hurdle: lead knee up, back leg tucked under, arms out — lands running
  'bo.run-load':   {armL: -0.8, armR: 0.9, elbowL: 0.6, elbowR: 0.9, legL: 0.5, legR: 0.35, kneeL: 0.9, kneeR: 0.5, dy: 4, sy: 0.94, bend: 0.2},
  'bo.hurdle-up':  {armL: 1.9, armR: -0.4, elbowL: 0.2, elbowR: 0.6, legL: 1.25, legR: 0.45, kneeL: 0.9, kneeR: 1.2, footL: -0.2, footR: 0.6, sy: 1.04, bend: 0.12},
  'bo.hurdle':     {armL: 1.7, armR: 1.4, elbowL: 0.2, elbowR: 0.3, legL: 1.35, legR: 0.55, kneeL: 0.35, kneeR: 1.75, footL: -0.25, footR: 0.5, bend: 0.28},
  'bo.land-run':   {armL: -0.5, armR: 0.8, elbowL: 0.7, elbowR: 0.7, legL: 0.55, legR: 0.3, kneeL: 0.5, kneeR: 0.9, dy: 4, sy: 0.93, bend: 0.16},
  // 🧤 keeper
  'bo.gk-ready':   {armL: 1.15, armR: 1.15, elbowL: 0.95, elbowR: 0.95, legL: 0.38, legR: -0.38, kneeL: 0.7, kneeR: 0.7, dy: 4, sy: 0.95, sx: 1.03, bend: 0.2},
  'bo.gk-shuffle': {armL: 1.25, armR: 1.05, elbowL: 0.9, elbowR: 1.0, legL: 0.55, legR: -0.15, kneeL: 0.6, kneeR: 0.8, dy: 3, sy: 0.96, sx: 1.03, bend: 0.18},
  'bo.gk-load':    {armL: -0.5, armR: -0.4, elbowL: 0.6, elbowR: 0.6, legL: 0.5, legR: -0.35, kneeL: 1.1, kneeR: 0.9, dy: 7, sy: 0.9, sx: 1.05, bend: 0.28},
  'bo.gk-reach':   {armL: 3.05, armR: 2.95, elbowL: -0.05, elbowR: 0.05, legL: 1.0, legR: 0.2, kneeL: 1.3, kneeR: 0.1, footR: 0.7, sy: 1.1, sx: 0.94, bend: -0.06},
  'bo.gk-catch-hi':{armL: 2.6, armR: 2.5, elbowL: 0.9, elbowR: 0.9, legL: 0.75, legR: 0.05, kneeL: 1.2, kneeR: 0.35, footR: 0.4, sy: 1.02},
  'bo.gk-step':    {armL: 1.0, armR: 0.8, elbowL: 0.7, elbowR: 0.7, legL: 0.55, legR: -0.25, kneeL: 1.0, kneeR: 0.45, dy: 6, sy: 0.92, sx: 1.05, bend: 0.3},
  'bo.gk-dive':    {armL: 3.0, armR: 2.85, elbowL: -0.08, elbowR: 0.05, legL: 0.1, legR: 0.12, kneeL: 0.05, kneeR: 0.3, footL: 0.6, footR: 0.6, sy: 1.06, sx: 0.95},
  'bo.gk-stretch': {armL: 3.1, armR: 2.95, elbowL: 0, elbowR: 0.12, legL: 0.05, legR: 0.28, kneeL: 0.1, kneeR: 0.5, footL: 0.7, footR: 0.5, sy: 1.08, sx: 0.94},
  'bo.gk-hug':     {armL: 1.55, armR: 1.45, elbowL: 1.1, elbowR: 1.1, legL: 0.6, legR: -0.4, kneeL: 1.0, kneeR: 1.2, sy: 0.96, bend: 0.25}
}, acts: {
  'blasoff.hop':    {tags: ['move', 'sport', 'beat'], beats: [
    {pose: 'bo.ready', face: 'determined', ms: 30}, {pose: 'bo.crouch', face: 'determined', ms: 120, ease: 'in'},
    {pose: 'bo.takeoff', face: 'joy', ms: 60, contact: true}, {pose: 'bo.tuck', face: 'joy', ms: 300, ease: 'out'},
    {pose: 'bo.land', face: 'happy', ms: 120, ease: 'in', name: 'settle'}]},
  'blasoff.dodge':  {tags: ['move', 'sport', 'beat'], share: true, about: '🛝 hurdle over a slide tackle', beats: [
    {pose: 'bo.ready', face: 'focused', ms: 30}, {pose: 'bo.run-load', face: 'determined', ms: 120, ease: 'in'},
    {pose: 'bo.hurdle-up', face: 'brave', ms: 60, contact: true}, {pose: 'bo.hurdle', face: 'cheeky', ms: 300, ease: 'out'},
    {pose: 'bo.land-run', face: 'happy', ms: 100, ease: 'in', name: 'settle'}]},
  'blasoff.gkhigh': {tags: ['sport', 'keeper', 'beat'], share: true, about: '🧤 keeper leaps for a high ball', beats: [
    {pose: 'bo.gk-ready', face: 'focused', ms: 60}, {pose: 'bo.gk-load', face: 'determined', ms: 150, ease: 'in'},
    {pose: 'bo.gk-reach', face: 'brave', ms: 80, contact: true}, {pose: 'bo.gk-catch-hi', face: 'proud', ms: 300, ease: 'out'},
    {pose: 'bo.land', face: 'happy', ms: 150, ease: 'in', name: 'settle'}]},
  'blasoff.gkdive': {tags: ['sport', 'keeper', 'beat'], share: true, about: '🧤 diving save, both arms reaching', beats: [
    {pose: 'bo.gk-ready', face: 'focused', ms: 40}, {pose: 'bo.gk-step', face: 'determined', ms: 150, ease: 'in'},
    {pose: 'bo.gk-dive', face: 'effort', ms: 100, contact: true}, {pose: 'bo.gk-stretch', face: 'brave', ms: 300, ease: 'out'},
    {pose: 'bo.gk-hug', face: 'relieved', ms: 200, ease: 'in', name: 'settle'}]}
}}, {by: '⚽ BlasOff chat', block: 'blasoff', game: 'blasoff', date: '2026-11-15'});
// 🎭 BLOCK blasoff END

// 🎭 BLOCK pyradive (🔥 PyraDive chat · real actions) START
// 🎬 PyraDive real actions (pd-6a, Aowu 2026-11-15 00:37 "proper action … receive in a bump … real represent that action").
// Beat rule (Checklist §17): ready → anticipation → contact → follow-through → settle. Poses use the 🦴 B1 joints (elbow · knee · foot · platform).
// The game owns contact: PyraDive plays these with Acting.play(av, key, {contactAt}) — the touch never waits for the animation.
// Side view, facing right: armL / armR + = forward-up · knee + = bent · dy + = lower · platform 1 = wrists together (bump).
Acting.add({poses: {
  'pd.ready':       {armL: 0.5, armR: 0.42, elbowL: 0.95, elbowR: 0.95, legL: 0.32, legR: -0.32, kneeL: 0.55, kneeR: 0.55, dy: 5, sy: 0.95, sx: 1.03, bend: 0.16},
  'pd.bump-sink':   {armL: 0.55, armR: 0.55, platform: 1, legL: 0.5, legR: -0.5, kneeL: 1.05, kneeR: 1.05, footL: -0.15, footR: -0.15, dy: 11, sy: 0.88, sx: 1.07, bend: 0.3},
  'pd.bump-hit':    {armL: 0.95, armR: 0.95, platform: 1, legL: 0.3, legR: -0.3, kneeL: 0.3, kneeR: 0.3, footL: 0.15, footR: 0.15, dy: 3, sy: 1.0, bend: 0.1},
  'pd.bump-rise':   {armL: 1.35, armR: 1.35, platform: 1, legL: 0.16, legR: -0.16, kneeL: 0.08, kneeR: 0.08, footL: 0.35, footR: 0.35, dy: -2, sy: 1.04, sx: 0.98, bend: -0.04},
  'pd.jump-load':   {armL: -0.55, armR: -0.55, elbowL: 0.2, elbowR: 0.2, legL: 0.45, legR: -0.45, kneeL: 1.1, kneeR: 1.1, dy: 10, sy: 0.88, sx: 1.07, bend: 0.32},
  'pd.jump-up':     {armL: 2.9, armR: 2.9, elbowL: -0.1, elbowR: -0.1, legL: 0.08, legR: -0.08, footL: 0.7, footR: 0.7, dy: -6, sy: 1.1, sx: 0.93},
  'pd.jump-air':    {armL: 2.5, armR: 2.5, elbowL: 0.25, elbowR: 0.25, legL: 0.3, legR: -0.4, kneeL: 0.55, kneeR: 0.8, footL: 0.4, footR: 0.4, dy: -2},
  'pd.land-reach':  {armL: 2.1, armR: 2.0, elbowL: 0.3, elbowR: 0.3, legL: 0.12, legR: -0.12, kneeL: 0.15, kneeR: 0.15, footL: -0.3, footR: -0.3, sy: 1.04},
  'pd.land':        {armL: 0.7, armR: 0.6, elbowL: 0.8, elbowR: 0.8, legL: 0.45, legR: -0.45, kneeL: 0.95, kneeR: 0.95, dy: 9, sy: 0.88, sx: 1.08, bend: 0.2}
}, acts: {
  // 🙌 bump (receive): feet wide, eyes on the ball → sink + arms join (platform) → legs push up, platform to the target → arms keep rising → back to ready
  'pyradive.bump': {tags: ['sport', 'volley', 'beat'], share: true, from: 'PyraDive', about: 'Volleyball bump: sink, platform, push up', beats: [
    {pose: 'pd.ready', face: 'determined', ms: 70},
    {pose: 'pd.bump-sink', face: 'determined', ms: 200, ease: 'cubicOut'},
    {pose: 'pd.bump-hit', face: 'excited', ms: 80, contact: true},
    {pose: 'pd.bump-rise', face: 'happy', ms: 220, ease: 'backOut'},
    {pose: 'pd.ready', face: 'determined', ms: 160, ease: 'sineInOut', name: 'settle'}]},
  // 🦘 jump: crouch (squash) → stretch at take-off → legs tuck in the air (held until the landing act takes over)
  'pyradive.jump': {tags: ['sport', 'move', 'beat'], share: true, from: 'PyraDive', about: 'Take-off: crouch, stretch, tuck', beats: [
    {pose: 'pd.ready', face: 'determined', ms: 50},
    {pose: 'pd.jump-load', face: 'determined', ms: 160, ease: 'cubicOut'},
    {pose: 'pd.jump-up', face: 'excited', ms: 70, contact: true},
    {pose: 'pd.jump-air', face: 'excited', ms: 260, ease: 'backOut'}]},
  // 🛬 landing: legs reach for the floor → squash on touch-down (contact = the engine's touch-down) → back to the ready stance
  'pyradive.land': {tags: ['sport', 'move', 'beat'], share: true, from: 'PyraDive', about: 'Landing: knees soak it up', beats: [
    {pose: 'pd.jump-air', face: 'excited', ms: 40},
    {pose: 'pd.land-reach', face: 'excited', ms: 120, ease: 'sineIn'},
    {pose: 'pd.land', face: 'determined', ms: 70, contact: true},
    {pose: 'pd.ready', face: 'determined', ms: 200, ease: 'backOut', name: 'follow'}]}
}}, {by: '🔥 PyraDive chat', block: 'pyradive', game: 'pyraspike', date: '2026-11-15'});
// 🎭 BLOCK pyradive END

// 🎭 BLOCKS END (AvatarActing — add your own 🎭 BLOCK above this line)
