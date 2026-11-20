
/* 📏 pk-7f fx#1 */
/* ================= 🎆 POKADIF FX (pk-7f, 🔍 Pokadif chat, 2026-11-20) — Pokadif plan §22h + §25 · FX Bible §6–§7 · Motion rules §35 =================
   BORN SPLIT: its own part (PokadifParts → Pokadif_fx). Only moment → effect glue: every painter is the shared 🎬 Motion.fx catalogue
   (✨ glint · ☀️ levelup · 💨 puff / poof · ❄️ shatter from MotionFX2, ✨ sparks from AvatarMotion) — no painter of its own except the two word stickers.
   It LISTENS to the game's moments (GameComic.listen) and paints on ONE top layer of its own (canvas #pk-fx, fixed, pointer-events none, z 350:
   above the pictures + 👥 Race screen, under confetti 390 + the result card 400). It NEVER paints into #cv-a / #cv-b — the pixel fairness tests stay the same.
   🛡️ Fairness guard: while a picture still has hidden changes, every effect is clipped so it can never touch an unfound change (its circle × 1.25 + 4 px),
   and a ✅ found effect also stays inside its own found circle × 1.6. Big effects (⭐ burst, ☀️ levelup, 💨 poof) only come when nothing is left to hide.
   | moment              | effect                                   | where                                          |
   | ✅ found            | the ring (page) + ✨ glint r = 0.65 × circle | both pictures (A only on a 🕵️ find step) · 👁️ Blink = ring only |
   | ❌ oops             | 💨 puff (no white pop)                    | the poke point · 🎯 the wrong card · 👉 the wrong suspect |
   | 🖼️ picture done     | ⭐ burst (sparks + 8 glints) + "AHA!"      | over the board (Arcade: burst only, no word)    |
   | ⏱️ checkpoint       | ☀️ levelup                                 | under the ⏱ clock (never pauses it)            |
   | 👉 right accuse     | 💨 poof (face kept clear) + "CAUGHT!"     | the suspect card                               |
   | 👥 Race found       | ✨ glint 🔵 zap / 🟠 fire                   | the 4 pictures                                 |
   | ❄️ Race freeze      | ❄️ shatter                                 | that player's name strip, never on pictures    |
   ☀️ day look on light scenes (from the scene's own colours) · 🌱 calm on Basic + prefers-reduced-motion · seeded by picture seed + change → same seed = same pixels.
   FX = 0 (harness) or no Motion → nothing at all. Never delays rings / score / clock, never takes a tap. PKFX.stats() = frame cost (≤ 2 ms). */
const PKFX = (function () {
  const NOW = () => performance.now() / 1000;
  const live = () => !!(FX && window.Motion && Motion.fx && Motion.FX2);
  let cv = null, g = null, dpr = 1, items = [], raf = 0, hook = null;
  const ST = {frames: 0, maxMs: 0, sumMs: 0, made: 0, kinds: {}};
  function layer() {
    if (cv && cv.isConnected) return true;
    cv = document.createElement('canvas'); cv.id = 'pk-fx'; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:350;';
    document.body.appendChild(cv); g = cv.getContext('2d'); fit(); return true;
  }
  function fit() { if (!cv) return; dpr = Math.min(2, window.devicePixelRatio || 1); const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } }
  window.addEventListener('resize', () => { if (cv) { fit(); paint(NOW()); } });
  const rectOf = el => el && el.isConnected && el.offsetParent !== null ? el.getBoundingClientRect() : null;
  // a picture's box WITHOUT its own animation (❌ oops shake · 🖼️ slide in): the parent's box + the layout offsets — the guard + the glints use
  // where the picture really sits, not where a shake frame happened to be at the moment
  function stillRect(el) { const P = el && el.isConnected && el.offsetParent; if (!P) return null; const r = P.getBoundingClientRect(), l = r.left + P.clientLeft + el.offsetLeft, t = r.top + P.clientTop + el.offsetTop;
    return {left: l, top: t, width: el.offsetWidth, height: el.offsetHeight, right: l + el.offsetWidth, bottom: t + el.offsetHeight}; }
  const centre = r => [r.left + r.width / 2, r.top + r.height / 2];
  const hash = (a, b) => (((a | 0) * 2654435761 + (b | 0) * 40503 + 977) >>> 0) % 2147483646 + 1;

  // ---------- looks for THIS moment: ☀️ day (light scene) · 🌱 calm ----------
  function lum(hex) { const n = parseInt(String(hex || '#000').slice(1), 16); const c = [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => { v /= 255; return v <= 0.04 ? v / 12.9 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function isDay(theme) { const T = PK.THEMES[theme]; return !!T && (lum(T.top) + lum(T.bot)) / 2 > 0.3; }
  function reduced() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function look() { return {day: !!(G && G.scene && isDay(G.scene.theme)), calm: !!(G && G.level === 0) || reduced()}; }

  // ---------- 🛡️ where the hidden changes are on screen (every visible picture) ----------
  function pics() {
    if (G && G.mode === 'race' && typeof RC !== 'undefined' && RC) {
      const out = []; [0, 1].forEach(p => { const h = $('rc-h' + p); if (!h) return; ['.rc-a', '.rc-b'].forEach(s => { const r = rectOf(h.querySelector(s)); if (r) out.push({r, turned: typeof raceTurned === 'function' && raceTurned(p)}); }); }); return out;
    }
    return ['pic-a', 'pic-b'].map(id => $(id)).filter(e => e && !e.classList.contains('hidden')).map(e => ({id: e.id, r: stillRect(e), turned: false})).filter(q => q.r);
  }
  function toScreen(P, x, y) { const k = P.r.width / PK.W; return P.turned ? [P.r.right - x * k, P.r.bottom - y * k, k] : [P.r.left + x * k, P.r.top + y * k, k]; }
  function hiddenCircles() {
    if (!G || !G.scene || !G.scene.diffs || G.mode === 'odd') return [];
    const race = G.mode === 'race' && typeof RC !== 'undefined' && RC, P = pics(), out = [];
    G.scene.diffs.forEach((d, i) => { const open = race ? !(RC.owner[i] >= 0) : !(G.found && G.found[i]); if (!open) return;
      P.forEach(p => { const [x, y, k] = toScreen(p, d.x, d.y); out.push([x, y, d.hit * k * 1.25 + 4]); }); });
    return out;
  }
  function guard(own) {   // own = [x, y, R] found circle (or null) → a clip function, worked out NOW (the moment) so it is the same every frame
    const holes = hiddenCircles();
    return gg => {
      if (own) { gg.beginPath(); gg.arc(own[0], own[1], own[2] * 1.6, 0, Math.PI * 2); gg.clip(); }
      if (holes.length) { gg.beginPath(); gg.rect(-10, -10, innerWidth + 20, innerHeight + 20); holes.forEach(c => { gg.moveTo(c[0] + c[2], c[1]); gg.arc(c[0], c[1], c[2], 0, Math.PI * 2); }); gg.clip('evenodd'); }
    };
  }

  // ---------- the effect list + ONE animation loop (only while something plays) ----------
  function add(kind, o, clip, tag) {
    if (!live() || !layer()) return null;
    const t0 = NOW(), L = look(), E = Motion.fx(kind, Object.assign({k: 1, t0, day: L.day, calm: L.calm}, o));
    items.push({E, clip, end: E.end(), tag: tag || kind}); ST.made++; ST.kinds[kind] = (ST.kinds[kind] || 0) + 1; run(); return E;
  }
  function addDraw(draw, life, clip, tag) { if (!live() || !layer()) return null; const t0 = NOW(), it = {draw, t0, end: t0 + life, clip, tag}; items.push(it); ST.made++; run(); return it; }
  function run() { if (!raf) raf = requestAnimationFrame(frame); }
  function paint(t, gg, list) {
    gg = gg || g; list = list || items; if (!gg) return;
    gg.setTransform(1, 0, 0, 1, 0, 0); gg.clearRect(0, 0, gg.canvas.width, gg.canvas.height); gg.setTransform(dpr, 0, 0, dpr, 0, 0);
    list.forEach(it => { if (t >= it.end) return; gg.save(); if (it.clip) it.clip(gg); if (it.draw) it.draw(gg, t - it.t0); else Motion.drawFx(gg, it.E, t); gg.restore(); });
  }
  function frame() {
    raf = 0; const t = NOW(), a = performance.now();
    items = items.filter(it => t < it.end);
    paint(t); const ms = performance.now() - a;
    if (items.length) { ST.frames++; ST.sumMs += ms; if (ms > ST.maxMs) ST.maxMs = ms; run(); }
  }
  function clear() { items = []; if (g) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); } }

  // ---------- 💬 the two word stickers (Pokadif's own, ActionFX look: thick outline, pop + settle, hold, shrink away) ----------
  function word(txt, x, y, size, cols, life) {
    const L = look();
    return addDraw((gg, e) => {
      const q = e / life, pop = e < 0.16 ? 1.22 * (e / 0.16) : e < 0.26 ? 1.22 - 0.22 * (e - 0.16) / 0.1 : 1, out = q > 0.78 ? 1 - (q - 0.78) / 0.22 : 1;
      const s = size * (L.calm ? Math.min(1, pop) : pop) * (0.6 + 0.4 * out); if (s < 2) return;
      gg.globalAlpha = Math.max(0, Math.min(1, out * 1.4)); gg.translate(x, y); gg.rotate(-0.08);
      gg.font = '900 ' + Math.round(s) + "px 'Fredoka','Baloo 2',sans-serif"; gg.textAlign = 'center'; gg.textBaseline = 'middle';
      gg.lineJoin = 'round'; gg.lineWidth = s * 0.26; gg.strokeStyle = cols[2]; gg.strokeText(txt, 0, s * 0.06);
      gg.lineWidth = s * 0.14; gg.strokeStyle = '#FFFFFF'; gg.strokeText(txt, 0, 0);
      const gr = gg.createLinearGradient(0, -s / 2, 0, s / 2); gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1]); gg.fillStyle = gr; gg.fillText(txt, 0, 0);
    }, life, null, 'word');
  }

  // ---------- moment → effect ----------
  function seedOf(i, k) { return hash((G && G.scene && G.scene.seed) || 7, (i | 0) * 31 + (k | 0)); }
  function marksFor(i) {
    const d = G.scene && G.scene.diffs[i]; if (!d) return [];
    const list = G.mode === 'race' && typeof RC !== 'undefined' && RC ? RC.marks : G.marks;
    return (list || []).filter(m => m.el && m.el.isConnected && m.el.classList.contains('found') && m.x === d.x && m.y === d.y && m.r === d.hit);
  }
  function foundFx(e) {
    if (G.mode === 'blink') return;   // 👁️ Blink = ring only (pick)
    if (G.mode === 'odd') { const b = $('ogrid') && $('ogrid').children[e.i]; const r = rectOf(b); if (r) { const [x, y] = centre(r); add('glint', {x, y, r: Math.min(r.width, r.height) * 0.3, seed: seedOf(e.i, 1)}); } return; }
    const d = G.scene && G.scene.diffs[e.i]; if (!d) return;
    const el = e.player === 0 ? 'zap' : e.player === 1 ? 'fire' : 'light';
    const race = G.mode === 'race';
    marksFor(e.i).forEach((m, j) => {
      const host = m.el.parentElement; let x, y, R;
      if (race) { const hr = rectOf(host); if (!hr) return; [x, y] = centre(m.el.getBoundingClientRect()); R = d.hit * hr.width / PK.W; }   // 👥 a turned half: the ring's own box
      else { const P = {r: stillRect(host)}; if (!P.r) return; [x, y, R] = toScreen(P, d.x, d.y); R = d.hit * R; }
      add('glint', {x, y, r: R * 0.65, element: el, seed: seedOf(e.i, 2 + j)}, guard([x, y, R]), 'found');
    });
  }
  function oopsFx(e) {
    if (G.mode === 'race') return freezeFx(e);
    if (G.mode === 'odd') { const r = rectOf($('ogrid') && $('ogrid').children[e.i]); if (r) { const [x, y] = centre(r); add('puff', {x, y, r: Math.min(r.width, r.height) * 0.22, seed: seedOf(e.i, 9)}); } return; }
    if (e.x == null || !e.side) return;
    const pic = $(e.side === 'A' ? 'pic-a' : 'pic-b'), r = stillRect(pic); if (!r) return;
    const k = r.width / PK.W, x = r.left + e.x * k, y = r.top + e.y * k, rad = Math.max(12, Math.min(26, 16 * k * 1.4));
    add('puff', {x, y, r: rad, seed: seedOf(Math.round(e.x) * 7 + Math.round(e.y), 9)}, guard(null), 'oops');
  }
  function freezeFx(e) {
    if (e.freeze == null || e.player == null) return;   // the 2nd oops moment of a Race poke (no freeze) = the ✗ mark only
    const h = $('rc-h' + e.player), r = rectOf(h && h.querySelector('.rc-head')); if (!r) return;
    const [x, y] = centre(r); add('shatter', {x, y, k: 0.7, seed: seedOf(e.player, 40 + (RC ? RC.score[0] + RC.score[1] : 0))}, gg => { gg.beginPath(); gg.rect(r.left - 40, r.top - 30, r.width + 80, r.height + 60); gg.clip(); }, 'freeze');
  }
  function picdoneFx(e) {
    let r;
    if (G.mode === 'race') r = rectOf($('rc-big')) || rectOf($('scr-race'));
    else r = rectOf($('board'));
    if (!r) return;
    const [x, y] = centre(r), R = Math.max(40, Math.min(r.width, r.height) * 0.26), L = look();
    add('sparks', {x, y, element: 'light', k: Math.max(1, R / 60), seed: seedOf(99, 1)}, null, 'picdone');
    for (let j = 0; j < 8; j++) { const a = j / 8 * Math.PI * 2 + 0.3; add('glint', {x: x + Math.cos(a) * R, y: y + Math.sin(a) * R * 0.75, r: R * 0.22, seed: seedOf(99, 10 + j), t0: NOW() + j * 0.03}, null, 'picdone'); }
    if (G.mode !== 'race' && G.mode !== 'arcade') word('AHA!', x, y, Math.max(34, Math.min(84, R * 0.8)), L.day ? ['#FFE36A', '#FF9E1F', '#5A2A00'] : ['#FFF6A8', '#FFC23A', '#3A1E00'], 1.1);
  }
  function checkpointFx() {
    const r = rectOf(document.querySelector('#gbar .gb-time')); if (!r) return;
    // the ground ring sits just UNDER the game bar, so the light column rises up over the ⏱ clock (a ring ON the bar's edge shot off the top of the screen)
    add('levelup', {x: r.left + r.width / 2, y: r.bottom + 34, k: 0.55, seed: seedOf(G.cps || 1, 50)}, null, 'checkpoint');
  }
  function accuseFx(e) {
    const K = G.K; if (!K) return; const box = $('sopts'); if (!box) return;
    const i = e.right ? K.culprit : K.people.findIndex(p => p.name === e.who); const b = box.children[i], r = rectOf(b); if (!r) return;
    const [x, y] = centre(r);
    if (!e.right) { add('puff', {x, y, r: Math.min(r.width, r.height) * 0.22, seed: seedOf(i, 60)}, null, 'oops'); return; }
    const f = rectOf(b.querySelector('.e')), face = f ? [f.left + f.width / 2, f.top + f.height / 2, Math.max(f.width, f.height) * 0.55] : null;
    add('poof', {x, y: r.bottom - r.height * 0.18, r: Math.min(r.width, r.height) * 0.42, size: 1.1, face, seed: seedOf(i, 61)}, null, 'caught');
    if (face) add('glint', {x: face[0] + face[2] * 0.7, y: face[1] - face[2] * 0.6, r: face[2] * 0.35, seed: seedOf(i, 62), t0: NOW() + 0.25}, null, 'caught');
    word('CAUGHT!', x, Math.max(30, r.top - Math.min(40, r.height * 0.25)), Math.max(26, Math.min(56, r.width * 0.3)), ['#FFFFFF', '#FFD6E0', '#B0103A'], 1.3);
  }
  function onMoment(id, e) {
    if (!live() || !G || G.over) return;
    switch (e.k) {
      case 'found': return foundFx(e);
      case 'oops': return oopsFx(e);
      case 'picdone': return picdoneFx(e);
      case 'checkpoint': return checkpointFx(e);
      case 'accuse': return accuseFx(e);
      case 'start': case 'picture': case 'story': return clear();
    }
  }
  function attach() { if (!hook && window.GameComic && GameComic.listen) hook = GameComic.listen(onMoment); }
  attach();
  return {
    VERSION: 'pk-7f', ready: () => live() && !!hook, aha: () => live() && !!hook && !!(G && G.mode !== 'race' && G.mode !== 'arcade'),
    stats: () => Object.assign({}, ST, {avgMs: ST.frames ? ST.sumMs / ST.frames : 0, live: items.length}),
    list: () => items.map(it => ({tag: it.tag, kind: it.E ? it.E.kind : 'word', end: it.end})),
    paint, clear, isDay, guard, hiddenCircles, stillRect, canvas: () => cv, now: NOW, _items: () => items
  };
})();
GameParts.loaded('Pokadif_fx', 'pk-7f');
