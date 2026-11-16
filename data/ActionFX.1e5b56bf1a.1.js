
/* ================= 🎬 ActionFX (fx-1a, 🧱 baseline chat, 2026-11-16) =================
   The shared ACTION library: every move has its OWN feeling — its own contact effect (shape · colour · size · timing),
   its own 💥 hit-stop + gentle screen shake + comic word. Optimistic + artistic (Aowu 12:34): bright colours, stars, rings,
   sparkles — never blood or anything scary. Moves = 🎭 BLOCK fx-moves in AvatarActing (`move.<family>.<style>` beat acts,
   each act carries `fx: {key, at: [x, y]}` = the hit point in avatar units at the contact).
   Plan: Drive `Action FX — full plan.md` · project `claude/action-fx-plan.md` · page `?page=fxgallery` (hidden).

   USE (a canvas game):
     const run = ActionFX.play(who, 'move.punch.uppercut', {x, y, k, dir, element: 'zap', onContact(run){ … the game's hit … }});
     each frame:  const f = run.at(t); const sh = ActionFX.shake(t); g.translate(sh.x, sh.y); Acting.draw(g, who, x, y, k, f, {t}); ActionFX.draw(g, t);
     effect only:  ActionFX.at('punch.straight', {x, y, k, dir, element, t});      // on any canvas point, e.g. where a ball was hit
     reactions:    ActionFX.play(target, 'move.react.knockback', {x, y, k, dir: -dir});   (the target's own beat act + its effect)
   OPTIONS (Aowu 13:27): ActionFX.opts = {words: true, shake: true, calm: false}  — 🌱 Basic + the ⚙️ calm option → shake off (calm = smaller, fewer sparks).
   ELEMENTS recolour any style: fire · ice · zap · nature · light · shadow · candy · water (default = the style's own colours).
   STYLES: ActionFX.list(family?) · ActionFX.style(key) = {family, name, icon, word, ms, stop, shake, col}
   Cost: plain canvas paths, no images; ≤ 1 ms for 6 live effects on a phone (actionfx.js). */
(function(){
  if(window.ActionFX) return;
  const TAU = Math.PI * 2;
  const EL = {fire: ['#FF6B00', '#FFB020', '#FFF3C4'], ice: ['#4DABF7', '#A5D8FF', '#E7F5FF'], zap: ['#FFD43B', '#FFF3BF', '#FFFFFF'], nature: ['#40C057', '#B2F2BB', '#EBFBEE'],
    light: ['#FCC419', '#FFF9DB', '#FFFFFF'], shadow: ['#7048E8', '#B197FC', '#E5DBFF'], candy: ['#F06595', '#FFC9E3', '#FFF0F6'], water: ['#1C7ED6', '#74C0FC', '#E7F5FF']};
  // ---------- little drawing helpers (q = 0 → 1 over the effect's life) ----------
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const outBack = q => { const c = 1.9; q = clamp(q, 0, 1) - 1; return 1 + (c + 1) * q * q * q + c * q * q; };
  const outQ = q => 1 - (1 - clamp(q, 0, 1)) ** 3;
  const grow = (q, a) => outBack(q / (a || 0.18));                 // pops in fast, a tiny overshoot
  const fade = (q, from) => 1 - clamp((q - (from || 0.45)) / (1 - (from || 0.45)), 0, 1);
  function rnd(seed){ let s = seed >>> 0 || 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  function star(g, n, r1, r2, rot, fill){ g.beginPath(); for(let i = 0; i < n * 2; i++){ const a = rot + i * Math.PI / n, r = i % 2 ? r2 : r1; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fillStyle = fill; g.fill(); }
  function ring(g, r, w, col, a0, a1){ if(r <= 0 || w <= 0) return; g.beginPath(); g.arc(0, 0, r, a0 || 0, a1 == null ? TAU : a1); g.lineWidth = w; g.strokeStyle = col; g.stroke(); }
  function twinkle(g, x, y, s, col){ g.fillStyle = col; g.beginPath(); g.moveTo(x, y - s); g.quadraticCurveTo(x, y, x + s, y); g.quadraticCurveTo(x, y, x, y + s); g.quadraticCurveTo(x, y, x - s, y); g.quadraticCurveTo(x, y, x, y - s); g.fill(); }
  function sparks(g, n, r0, r1, col, seed, a0, a1, w){ const R = rnd(seed); g.lineCap = 'round'; for(let i = 0; i < n; i++){ const a = (a0 || 0) + R() * ((a1 == null ? TAU : a1) - (a0 || 0)), d1 = r1 * (0.6 + R() * 0.5);
    g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * d1, Math.sin(a) * d1); g.lineWidth = (w || 2.4) * (0.7 + R() * 0.6); g.strokeStyle = col; g.stroke(); } }
  function dots(g, n, r, col, seed, sz, dy){ const R = rnd(seed); for(let i = 0; i < n; i++){ const a = R() * TAU, d = r * (0.3 + R() * 0.8); g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d * 0.6 + (dy || 0) * R(), (sz || 3) * (0.5 + R()), 0, TAU); g.fillStyle = col; g.fill(); } }
  function speedLines(g, n, len, spread, col, seed){ const R = rnd(seed); g.lineCap = 'round'; for(let i = 0; i < n; i++){ const off = (R() - 0.5) * spread, x0 = -8 - R() * len * 0.5, l = len * (0.5 + R() * 0.6); g.beginPath(); g.moveTo(x0, off); g.lineTo(x0 - l, off); g.lineWidth = 1.6; g.strokeStyle = col; g.stroke(); } }
  function arcTrail(g, r, a0, a1, w, c1, c2){ const n = 26, gr = g.createLinearGradient(Math.cos(a0) * r, Math.sin(a0) * r, Math.cos(a1) * r, Math.sin(a1) * r); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.55, c2); gr.addColorStop(1, c1);
    g.beginPath(); for(let i = 0; i <= n; i++){ const t = i / n, a = a0 + (a1 - a0) * t; g.lineTo(Math.cos(a) * (r + w * t / 2), Math.sin(a) * (r + w * t / 2)); }
    for(let i = n; i >= 0; i--){ const t = i / n, a = a0 + (a1 - a0) * t; g.lineTo(Math.cos(a) * (r - w * t / 2), Math.sin(a) * (r - w * t / 2)); } g.closePath(); g.fillStyle = gr; g.fill(); }
  function flat(g, fn){ g.save(); g.scale(1, 0.3); fn(); g.restore(); }   // things lying on the ground (shock rings)
  function alpha(c, a){ if(c[0] !== '#') return c; const n = parseInt(c.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
  const glow = (g, c, b) => { g.shadowColor = c; g.shadowBlur = b; };
  function word(g, q, txt, col, sz, rot){ if(!txt || !O.words || q > 0.9) return; const s = grow(q, 0.2) * (O.calm ? 0.8 : 1), a = fade(q, 0.6);
    g.save(); g.globalAlpha *= a; g.translate(0, -q * 10); if(g.getTransform && g.getTransform().a < 0) g.scale(-1, 1); g.rotate(rot || 0);   /* words always read left → right, also on a mirrored hit */ g.scale(s, s); g.font = '900 ' + sz + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = sz * 0.24; g.strokeStyle = '#231942'; g.strokeText(txt, 0, 0); g.fillStyle = col; g.fillText(txt, 0, 0); g.restore(); }
  // ---------- the styles: draw(g, q, P) with the hit point at 0,0, facing +x, 1 unit = 1 avatar unit (the avatar is ≈ 60 tall) ----------
  // P = {c: [main, light, core], seed, calm}
  const S = {};
  const def = (key, o) => { S[key] = Object.assign({key, family: key.split('.')[0]}, o); };
  // 👊 PUNCH — every punch its own shape
  def('punch.jab', {name: 'Jab', icon: '👊', ms: 260, stop: 40, shake: 0, col: ['#FFFFFF', '#E7F5FF', '#FFFFFF'], draw(g, q, P){ const s = grow(q, 0.14), a = fade(q, 0.3);
    g.globalAlpha = a; g.save(); g.scale(s, s); glow(g, P.c[0], 10); star(g, 6, 9, 3.6, 0.3, P.c[2]); g.shadowBlur = 0; ring(g, 12 + q * 6, 1.6, alpha(P.c[1], 0.8)); g.restore(); speedLines(g, 5, 12, 14, alpha(P.c[1], 0.7 * a), P.seed); }});
  def('punch.straight', {name: 'Straight', icon: '👊', word: 'POW!', ms: 420, stop: 70, shake: 3, col: ['#FFD43B', '#FFE066', '#FFF7C2'], draw(g, q, P){ const s = grow(q, 0.16), a = fade(q, 0.45);
    g.save(); g.globalAlpha = a; g.scale(s, s); glow(g, P.c[0], 14); star(g, 8, 15, 6, 0.2 + q * 0.4, P.c[0]); star(g, 8, 8.5, 3.4, 0.6, P.c[2]); g.shadowBlur = 0; g.restore();
    g.globalAlpha = a; ring(g, 10 + outQ(q) * 14, 2.4 * (1 - q), alpha(P.c[1], 0.8)); sparks(g, P.calm ? 5 : 9, 9 + q * 8, 18 + outQ(q) * 12, P.c[1], P.seed, 0, TAU, 1.6); g.globalAlpha = 1; g.save(); g.translate(10, -20); word(g, q, this.word, P.c[0], 11, -0.15); g.restore(); }});
  def('punch.hook', {name: 'Hook', icon: '🪝', word: 'WHAP!', ms: 440, stop: 70, shake: 3, col: ['#FF8A3D', '#FFB46B', '#FFE8CC'], draw(g, q, P){ const a = fade(q, 0.4), sweep = outQ(q / 0.5);
    g.globalAlpha = a; g.save(); g.translate(-6, 12); arcTrail(g, 20, Math.PI * 1.02, Math.PI * (1.02 + 0.8 * sweep), 7, P.c[0], alpha(P.c[0], 0.35)); g.restore();
    const s = grow(q, 0.16); g.save(); g.translate(4, -4); g.scale(s, s); glow(g, P.c[0], 12); star(g, 7, 11, 4.5, 0.4, P.c[1]); g.shadowBlur = 0; g.restore(); sparks(g, 7, 6, 18 + q * 8, P.c[2], P.seed, -1.3, 0.9, 1.6); g.globalAlpha = 1; g.save(); g.translate(12, -18); word(g, q, this.word, P.c[1], 10, 0.12); g.restore(); }});
  def('punch.uppercut', {name: 'Uppercut', icon: '⬆️', word: 'UP!', ms: 520, stop: 90, shake: 4, col: ['#3BC9DB', '#99E9F2', '#E3FAFC'], draw(g, q, P){ const a = fade(q, 0.45), h = 34 * outQ(q / 0.35);
    g.globalAlpha = a; const gr = g.createLinearGradient(0, 18, 0, -h); gr.addColorStop(0, alpha(P.c[0], 0)); gr.addColorStop(1, P.c[1]); g.fillStyle = gr; g.beginPath(); g.moveTo(-5, 18); g.quadraticCurveTo(-2, -h * 0.4, 0, -h); g.quadraticCurveTo(2, -h * 0.4, 5, 18); g.fill();
    const s = grow(q, 0.16); g.save(); g.translate(0, -8); g.scale(s, s); glow(g, P.c[0], 14); star(g, 5, 12, 4.6, -Math.PI / 2, P.c[2]); g.shadowBlur = 0; g.restore();
    for(let i = 0; i < (P.calm ? 4 : 7); i++) twinkle(g, (i - 3) * 4.5, -10 - (i % 3) * 8 - q * 24, 2.4, P.c[2]); g.globalAlpha = 1; g.save(); g.translate(14, -26); word(g, q, this.word, P.c[0], 10, 0.1); g.restore(); }});
  def('punch.haymaker', {name: 'Haymaker', icon: '💪', word: 'KA-BOOM!', ms: 640, stop: 120, shake: 8, col: ['#FF6B00', '#FFB020', '#FFF3C4'], draw(g, q, P){ const s = grow(q, 0.18), a = fade(q, 0.5);
    g.save(); g.globalAlpha = a; g.scale(s, s); glow(g, P.c[0], 18); star(g, 12, 22, 9, q * 0.3, P.c[0]); star(g, 12, 15, 6, 0.26 - q * 0.3, P.c[1]); star(g, 10, 7.5, 3.4, 0, P.c[2]); g.shadowBlur = 0; g.restore();
    g.globalAlpha = a; ring(g, 16 + outQ(q) * 22, 3 * (1 - q), alpha(P.c[0], 0.6)); dots(g, P.calm ? 5 : 10, 18 + q * 16, alpha(P.c[2], 0.85), P.seed, 1.8, 10); g.globalAlpha = 1; g.save(); g.translate(0, -30); word(g, q, this.word, P.c[1], 11, -0.08); g.restore(); }});
  def('punch.backfist', {name: 'Backfist', icon: '🔙', word: 'SNAP!', ms: 360, stop: 55, shake: 2, col: ['#B197FC', '#D0BFFF', '#F3F0FF'], draw(g, q, P){ const a = fade(q, 0.35);
    g.globalAlpha = a; g.save(); g.scale(-1, 1); g.translate(-4, 10); arcTrail(g, 16, Math.PI * 1.1, Math.PI * (1.1 + 0.6 * outQ(q / 0.4)), 5, P.c[0], alpha(P.c[0], 0.3)); g.restore();
    const s = grow(q, 0.13); g.save(); g.scale(s, s); glow(g, P.c[0], 10); star(g, 4, 12, 2.5, 0.2, P.c[2]); star(g, 4, 7, 2, 0.98, P.c[1]); g.shadowBlur = 0; g.restore(); g.globalAlpha = 1; g.save(); g.translate(-12, -16); word(g, q, this.word, P.c[1], 9, -0.12); g.restore(); }});
  def('punch.palm', {name: 'Palm strike', icon: '🖐️', word: 'HAA!', ms: 480, stop: 70, shake: 3, col: ['#63E6BE', '#C3FAE8', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.4);
    g.globalAlpha = a; for(let i = 0; i < 3; i++){ const qq = clamp(q * 1.4 - i * 0.12, 0, 1); g.save(); g.translate(qq * 16 + i * 2, 0); g.scale(0.42, 1); ring(g, 6 + qq * 12, 2.4 * (1 - qq), alpha(P.c[0], 0.9 - i * 0.2)); g.restore(); }
    const s = grow(q, 0.15); g.save(); g.scale(s, s); glow(g, P.c[0], 12); g.fillStyle = alpha(P.c[1], 0.9); g.beginPath(); g.ellipse(0, 0, 4.5, 9, 0, 0, TAU); g.fill(); g.shadowBlur = 0; g.restore(); g.globalAlpha = 1; g.save(); g.translate(6, -20); word(g, q, this.word, P.c[0], 10, 0); g.restore(); }});
  def('punch.elbow', {name: 'Elbow', icon: '💢', word: 'BONK!', ms: 400, stop: 80, shake: 4, col: ['#FF8787', '#FFC9C9', '#FFF5F5'], draw(g, q, P){ const a = fade(q, 0.4), s = grow(q, 0.14);
    g.globalAlpha = a; g.save(); g.scale(s, s); glow(g, P.c[0], 10); [0, 1, 2, 3].forEach(i => { g.save(); g.rotate(i * Math.PI / 2 + 0.6); g.fillStyle = P.c[0]; g.beginPath(); g.moveTo(3, -2.4); g.quadraticCurveTo(10, -4, 11, -1); g.quadraticCurveTo(7, 0, 3, 2.4); g.fill(); g.restore(); }); g.shadowBlur = 0; g.restore();
    ring(g, 8 + outQ(q) * 9, 1.8 * (1 - q), alpha(P.c[1], 0.9)); g.globalAlpha = 1; g.save(); g.translate(8, -18); word(g, q, this.word, P.c[0], 10, 0.15); g.restore(); }});
  def('punch.hammer', {name: 'Double-fist hammer', icon: '🔨', word: 'THUD!', ms: 600, stop: 110, shake: 7, col: ['#FFA94D', '#FFD8A8', '#FFF4E6'], draw(g, q, P){ const a = fade(q, 0.45);
    g.globalAlpha = a; g.save(); g.translate(0, 26); flat(g, () => { [0, 1, 2].forEach(i => { const qq = clamp(q * 1.3 - i * 0.1, 0, 1); ring(g, 8 + qq * (22 + i * 8), (5 - i * 1.4) * (1 - qq), alpha(P.c[0], 0.9 - i * 0.25)); }); }); g.restore();
    const s = grow(q, 0.15); g.save(); g.scale(s, s); glow(g, P.c[0], 12); star(g, 6, 13, 5, -Math.PI / 2, P.c[1]); g.shadowBlur = 0; g.restore();
    const R = rnd(P.seed); for(let i = 0; i < (P.calm ? 4 : 7); i++){ const vx = (R() - 0.5) * 50, vy = -20 - R() * 30; g.fillStyle = '#A5876B'; g.beginPath(); g.ellipse(vx * q, 24 + vy * q + 60 * q * q, 1.6 + R() * 1.8, 1.3 + R(), R() * 3, 0, TAU); g.fill(); }
    g.globalAlpha = 1; g.save(); g.translate(0, -22); word(g, q, this.word, P.c[0], 11, 0); g.restore(); }});
  def('punch.flurry', {name: 'Rapid flurry', icon: '🌪️', word: 'ORA ORA!', ms: 620, stop: 30, shake: 2, col: ['#FFD43B', '#FFF3BF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.65), R = rnd(P.seed);
    g.globalAlpha = a; for(let i = 0; i < (P.calm ? 4 : 7); i++){ const born = i * 0.08, qq = (q - born) / 0.25; if(qq < 0 || qq > 1) continue; const x = (R() - 0.3) * 18, y = (R() - 0.5) * 22;
      g.save(); g.translate(x, y); const s = grow(qq, 0.3) * (1 - qq * 0.5); g.scale(s, s); glow(g, P.c[0], 8); star(g, 5, 7, 2.8, R() * 3, i % 2 ? P.c[0] : P.c[2]); g.shadowBlur = 0; g.restore(); }
    speedLines(g, 6, 16, 22, alpha(P.c[1], 0.7), P.seed + 1); g.globalAlpha = 1; g.save(); g.translate(8, -24); word(g, q, this.word, P.c[0], 9, -0.1); g.restore(); }});
  def('punch.charged', {name: 'Charged punch', icon: '⚡', word: 'MEGA!', ms: 700, stop: 130, shake: 8, col: ['#4DABF7', '#A5D8FF', '#FFFFFF'], pre(g, q, P){ const R = rnd(P.seed + 3);   // the fist glows while it charges
      for(let i = 0; i < 8; i++){ const a = R() * TAU, d = 16 * (1 - q) + 3; g.strokeStyle = alpha(P.c[1], 0.8); g.lineWidth = 1.4; g.beginPath(); g.moveTo(Math.cos(a) * d, Math.sin(a) * d); g.lineTo(Math.cos(a) * (d + 4), Math.sin(a) * (d + 4)); g.stroke(); }
      glow(g, P.c[0], 10 + q * 12); g.fillStyle = alpha(P.c[2], 0.5 + q * 0.5); g.beginPath(); g.arc(0, 0, 2 + q * 4, 0, TAU); g.fill(); g.shadowBlur = 0; },
    draw(g, q, P){ const a = fade(q, 0.5), s = grow(q, 0.16);
      g.globalAlpha = a; g.save(); g.scale(s, s); glow(g, P.c[0], 18); const gr = g.createRadialGradient(0, 0, 1, 0, 0, 18); gr.addColorStop(0, P.c[2]); gr.addColorStop(0.5, P.c[1]); gr.addColorStop(1, alpha(P.c[0], 0)); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 18, 0, TAU); g.fill(); g.shadowBlur = 0; g.restore();
      g.strokeStyle = P.c[2]; g.lineWidth = 1.6; const R = rnd(P.seed); for(let i = 0; i < 5; i++){ let a0 = R() * TAU, x = 0, y = 0; g.beginPath(); g.moveTo(0, 0); for(let k = 1; k <= 4; k++){ a0 += (R() - 0.5) * 1.2; x += Math.cos(a0) * 6 * (0.6 + q); y += Math.sin(a0) * 6 * (0.6 + q); g.lineTo(x, y); } g.stroke(); }
      ring(g, 14 + outQ(q) * 20, 2.2 * (1 - q), alpha(P.c[1], 0.8)); g.globalAlpha = 1; g.save(); g.translate(0, -28); word(g, q, this.word, P.c[1], 11, -0.06); g.restore(); }});
  // 🦶 KICK
  def('kick.front', {name: 'Front kick', icon: '🦶', word: 'BAM!', ms: 440, stop: 70, shake: 3, col: ['#51CF66', '#B2F2BB', '#EBFBEE'], draw(g, q, P){ const a = fade(q, 0.4), s = grow(q, 0.15);
    g.globalAlpha = a; g.save(); g.scale(s, s); glow(g, P.c[0], 12); star(g, 6, 13, 5, 0, P.c[0]); star(g, 6, 7, 3, 0.5, P.c[2]); g.shadowBlur = 0; g.restore(); speedLines(g, 6, 14, 12, alpha(P.c[1], 0.8), P.seed);
    g.globalAlpha = 1; g.save(); g.translate(10, -18); word(g, q, this.word, P.c[0], 10, -0.1); g.restore(); }});
  def('kick.side', {name: 'Side kick', icon: '🦵', word: 'WHAM!', ms: 460, stop: 80, shake: 4, col: ['#20C997', '#96F2D7', '#E6FCF5'], draw(g, q, P){ const a = fade(q, 0.42);
    g.globalAlpha = a; const L = 30 * outQ(q / 0.3), gr = g.createLinearGradient(-L, 0, 6, 0); gr.addColorStop(0, alpha(P.c[0], 0)); gr.addColorStop(1, P.c[1]); g.fillStyle = gr; g.beginPath(); g.moveTo(-L, -3); g.lineTo(6, -6); g.lineTo(6, 6); g.lineTo(-L, 3); g.fill();
    for(let i = 0; i < 3; i++){ const qq = clamp(q * 1.3 - i * 0.1, 0, 1); g.save(); g.translate(6 + qq * 10 + i * 3, 0); g.scale(0.4, 1); ring(g, 6 + qq * 10, 2.2 * (1 - qq), alpha(P.c[0], 0.9 - i * 0.2)); g.restore(); }
    g.globalAlpha = 1; g.save(); g.translate(14, -18); word(g, q, this.word, P.c[0], 10, 0.08); g.restore(); }});
  def('kick.roundhouse', {name: 'Roundhouse', icon: '🌀', word: 'WHOOSH!', ms: 520, stop: 80, shake: 4, col: ['#FF922B', '#FFD8A8', '#FFF4E6'], draw(g, q, P){ const a = fade(q, 0.45);
    g.globalAlpha = a; g.save(); g.translate(-10, 6); arcTrail(g, 22, Math.PI * 0.95, Math.PI * (0.95 + 0.95 * outQ(q / 0.45)), 9, P.c[0], alpha(P.c[1], 0.4)); g.restore();
    const s = grow(q, 0.16); g.save(); g.scale(s, s); glow(g, P.c[0], 12); star(g, 7, 12, 5, 0.3, P.c[1]); g.shadowBlur = 0; g.restore(); sparks(g, 7, 6, 20 + q * 8, P.c[2], P.seed, -1.2, 1.2, 1.6);
    g.globalAlpha = 1; g.save(); g.translate(6, -24); word(g, q, this.word, P.c[0], 9, -0.05); g.restore(); }});
  def('kick.spinback', {name: 'Spin back kick', icon: '🔄', word: 'SPIN!', ms: 560, stop: 90, shake: 5, col: ['#845EF7', '#D0BFFF', '#F3F0FF'], draw(g, q, P){ const a = fade(q, 0.45);
    g.globalAlpha = a; g.save(); g.translate(-14, 4); for(let k = 0; k < 2; k++) arcTrail(g, 16 + k * 5, k * 2.4 + q * 2, k * 2.4 + q * 2 + 2.6, 5 - k * 1.5, P.c[0], alpha(P.c[1], 0.35)); g.restore();
    const s = grow(q, 0.16); g.save(); g.scale(s, s); glow(g, P.c[0], 14); star(g, 8, 14, 5, 0, P.c[1]); star(g, 8, 7, 3, 0.4, P.c[2]); g.shadowBlur = 0; g.restore(); g.globalAlpha = 1; g.save(); g.translate(8, -22); word(g, q, this.word, P.c[0], 10, 0.1); g.restore(); }});
  def('kick.axe', {name: 'Axe kick', icon: '🪓', word: 'CHOP!', ms: 520, stop: 100, shake: 6, col: ['#F06595', '#FFC9E3', '#FFF0F6'], draw(g, q, P){ const a = fade(q, 0.45);
    g.globalAlpha = a; g.save(); g.translate(-4, -18); arcTrail(g, 20, -Math.PI * 0.55, -Math.PI * 0.55 + Math.PI * 0.75 * outQ(q / 0.4), 7, P.c[0], alpha(P.c[1], 0.35)); g.restore();
    g.save(); g.translate(0, 24); flat(g, () => ring(g, 10 + outQ(q) * 22, 4 * (1 - q), alpha(P.c[0], 0.8))); g.restore();
    const s = grow(q, 0.15); g.save(); g.scale(s, s); glow(g, P.c[0], 10); star(g, 5, 11, 4, Math.PI / 2, P.c[1]); g.shadowBlur = 0; g.restore(); g.globalAlpha = 1; g.save(); g.translate(10, -20); word(g, q, this.word, P.c[0], 10, 0.1); g.restore(); }});
  def('kick.sweep', {name: 'Sweep', icon: '🧹', word: 'SWOOSH!', ms: 520, stop: 50, shake: 2, col: ['#FCC419', '#FFEC99', '#FFF9DB'], draw(g, q, P){ const a = fade(q, 0.4);
    g.globalAlpha = a; g.save(); flat(g, () => { arcTrail(g, 22, Math.PI * 0.9, Math.PI * (0.9 + 1.1 * outQ(q / 0.45)), 10, P.c[0], alpha(P.c[1], 0.4)); }); g.restore();
    dots(g, P.calm ? 6 : 12, 14 + q * 14, alpha('#E9DCC9', 0.85), P.seed, 1.8, -6); g.globalAlpha = 1; g.save(); g.translate(6, -16); word(g, q, this.word, P.c[0], 9, 0); g.restore(); }});
  def('kick.flying', {name: 'Flying kick', icon: '🛫', word: 'HI-YAH!', ms: 560, stop: 100, shake: 6, col: ['#FF6B6B', '#FFC9C9', '#FFF5F5'], draw(g, q, P){ const a = fade(q, 0.45);
    g.globalAlpha = a; g.save(); g.rotate(0.35); speedLines(g, 9, 26, 22, alpha(P.c[1], 0.8), P.seed); g.restore();
    const s = grow(q, 0.17); g.save(); g.scale(s, s); glow(g, P.c[0], 16); star(g, 9, 16, 6, 0.35, P.c[0]); star(g, 9, 9, 3.6, 0.1, P.c[2]); g.shadowBlur = 0; g.restore(); ring(g, 12 + outQ(q) * 16, 2.4 * (1 - q), alpha(P.c[1], 0.8));
    g.globalAlpha = 1; g.save(); g.translate(8, -26); word(g, q, this.word, P.c[0], 10, -0.12); g.restore(); }});
  def('kick.stomp', {name: 'Stomp', icon: '🐘', word: 'STOMP!', ms: 600, stop: 110, shake: 7, col: ['#A9E34B', '#D8F5A2', '#F4FCE3'], draw(g, q, P){ const a = fade(q, 0.45);
    g.globalAlpha = a; g.save(); flat(g, () => { [0, 1, 2].forEach(i => { const qq = clamp(q * 1.3 - i * 0.12, 0, 1); ring(g, 6 + qq * (20 + i * 10), (5 - i * 1.4) * (1 - qq), alpha(P.c[0], 0.9 - i * 0.25)); }); }); g.restore();
    dots(g, P.calm ? 5 : 10, 12 + q * 18, alpha('#E9DCC9', 0.85), P.seed, 2, -10); for(let i = 0; i < 3; i++) twinkle(g, -10 + i * 10, -6 - q * 16 - (i % 2) * 5, 2.4, P.c[2]);
    g.globalAlpha = 1; g.save(); g.translate(0, -18); word(g, q, this.word, P.c[0], 11, 0); g.restore(); }});
  // 💥 REACTIONS — drawn on the one who is hit (the hit point = their chest), never scary: stars, swirls, puffs
  def('react.flinch', {name: 'Small flinch', icon: '😣', ms: 300, stop: 0, shake: 0, col: ['#FFFFFF', '#FFF3BF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.3); g.globalAlpha = a; for(let i = 0; i < 3; i++){ const an = -2.2 + i * 0.5; g.strokeStyle = P.c[1]; g.lineWidth = 1.6; g.beginPath(); g.moveTo(Math.cos(an) * 8, -14 + Math.sin(an) * 8); g.lineTo(Math.cos(an) * (12 + q * 4), -14 + Math.sin(an) * (12 + q * 4)); g.stroke(); } }});
  def('react.bighit', {name: 'Big hit', icon: '😵', word: 'OOF!', ms: 520, stop: 80, shake: 5, col: ['#FFD43B', '#FFF3BF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.45), s = grow(q, 0.16);
    g.globalAlpha = a; g.save(); g.scale(s, s); glow(g, P.c[0], 12); star(g, 10, 14, 6, 0, alpha(P.c[1], 0.95)); g.shadowBlur = 0; g.restore(); for(let i = 0; i < 4; i++) twinkle(g, Math.cos(i * 1.6 + q * 4) * 16, -18 + Math.sin(i * 1.6 + q * 4) * 5, 2.6, P.c[0]);
    g.globalAlpha = 1; g.save(); g.translate(-10, -26); word(g, q, this.word, P.c[0], 10, -0.1); g.restore(); }});
  def('react.knockback', {name: 'Knockback', icon: '💨', word: 'WHAM!', ms: 560, stop: 80, shake: 5, col: ['#FF8787', '#FFC9C9', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.45);
    g.globalAlpha = a; g.save(); g.scale(-1, 1); speedLines(g, 9, 22, 30, alpha(P.c[2], 0.75), P.seed); g.restore();
    for(let i = 0; i < 3; i++){ const qq = clamp(q * 1.3 - i * 0.1, 0, 1); g.save(); g.translate(-6 + i * 5, 0); g.scale(0.45, 1); ring(g, 8 + qq * 12 + i * 4, (2.6 - i * 0.6) * (1 - qq), alpha(P.c[0], 0.9 - i * 0.22), -1.2, 1.2); g.restore(); }
    g.save(); g.translate(12, 24); dots(g, P.calm ? 4 : 8, 10 + q * 10, alpha('#E9DCC9', 0.85), P.seed, 2, -6); g.restore(); g.globalAlpha = 1; g.save(); g.translate(-8, -26); word(g, q, this.word, P.c[0], 10, 0.1); g.restore(); }});
  def('react.knockup', {name: 'Knock-up', icon: '🚀', word: 'WHEE!', ms: 640, stop: 90, shake: 4, col: ['#74C0FC', '#D0EBFF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5);
    g.globalAlpha = a; g.save(); g.translate(0, 20); flat(g, () => ring(g, 8 + outQ(q) * 18, 4 * (1 - q), alpha(P.c[0], 0.85))); g.restore(); g.save(); g.rotate(-Math.PI / 2); g.scale(-1, 1); speedLines(g, 7, 20, 22, alpha(P.c[1], 0.8), P.seed); g.restore();
    for(let i = 0; i < 4; i++) twinkle(g, (i - 1.5) * 7, 10 - q * 30 - (i % 2) * 6, 2.4, P.c[2]); g.globalAlpha = 1; g.save(); g.translate(12, -22); word(g, q, this.word, P.c[0], 10, 0.15); g.restore(); }});
  def('react.knockdown', {name: 'Knockdown', icon: '💫', word: 'BONK!', ms: 700, stop: 90, shake: 6, col: ['#FFA94D', '#FFE8CC', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.55);
    g.globalAlpha = a; g.save(); g.translate(0, 22); flat(g, () => { ring(g, 10 + outQ(q) * 22, 4 * (1 - q), alpha(P.c[0], 0.8)); }); dots(g, P.calm ? 5 : 10, 16 + q * 14, alpha('#E9DCC9', 0.85), P.seed, 2.2, -8); g.restore();
    for(let i = 0; i < 3; i++){ const an = q * 6 + i * TAU / 3; twinkle(g, Math.cos(an) * 12, -22 + Math.sin(an) * 4, 3, '#FFE066'); } g.globalAlpha = 1; g.save(); g.translate(-10, -30); word(g, q, this.word, P.c[0], 10, -0.1); g.restore(); }});
  def('react.stagger', {name: 'Stagger', icon: '🥴', ms: 520, stop: 40, shake: 2, col: ['#FFD8A8', '#FFF4E6', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5);
    g.globalAlpha = a; for(let i = 0; i < 3; i++){ const qq = clamp(q * 1.2 - i * 0.12, 0, 1); g.save(); g.translate(-qq * 14, 0); g.scale(0.5, 1); ring(g, 8 + i * 3, 1.6 * (1 - qq), alpha(P.c[0], 0.8), Math.PI - 1, Math.PI + 1); g.restore(); } }});
  def('react.spinout', {name: 'Spin-out', icon: '🌀', word: 'WHIRL!', ms: 640, stop: 60, shake: 3, col: ['#B197FC', '#E5DBFF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5);
    g.globalAlpha = a; g.save(); g.translate(0, 6); for(let k = 0; k < 3; k++) arcTrail(g, 12 + k * 5, k * 2 + q * 7, k * 2 + q * 7 + 2.2, 4 - k, P.c[0], alpha(P.c[1], 0.35)); g.restore();
    g.globalAlpha = 1; g.save(); g.translate(0, -28); word(g, q, this.word, P.c[0], 9, 0); g.restore(); }});
  def('react.dizzy', {name: 'Dizzy stars', icon: '💫', ms: 1200, stop: 0, shake: 0, col: ['#FFE066', '#FFF3BF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.75);
    g.globalAlpha = a; g.save(); g.translate(0, -30); g.save(); g.scale(1, 0.3); ring(g, 12, 1, alpha(P.c[1], 0.6)); g.restore(); for(let i = 0; i < 4; i++){ const an = q * 9 + i * TAU / 4; const x = Math.cos(an) * 12, y = Math.sin(an) * 3.6;
      g.save(); g.translate(x, y); g.rotate(an); star(g, 5, 3.6, 1.6, 0, i % 2 ? P.c[0] : '#FFA8D8'); g.restore(); } g.restore(); }});
  def('react.pushslide', {name: 'Push-back slide', icon: '🛷', ms: 560, stop: 30, shake: 2, col: ['#E9DCC9', '#F8F0E3', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.45);
    g.globalAlpha = a; g.save(); g.translate(8, 24); for(let i = 0; i < 2; i++){ g.strokeStyle = alpha('#C2A27A', 0.6); g.lineWidth = 2.2; g.beginPath(); g.moveTo(-4 + i * 7, 0); g.lineTo(-4 + i * 7 + 24 * outQ(q / 0.6), 0); g.stroke(); }
    dots(g, P.calm ? 4 : 8, 6 + q * 12, alpha(P.c[0], 0.9), P.seed, 2, -8); g.restore(); }});
  def('react.frozen', {name: 'Frozen / stuck', icon: '🧊', word: 'BRRR!', ms: 900, stop: 60, shake: 1, col: ['#74C0FC', '#D0EBFF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.7), s = grow(q, 0.2);
    g.globalAlpha = a; g.save(); g.scale(s, s); g.fillStyle = alpha(P.c[1], 0.35); g.strokeStyle = alpha(P.c[0], 0.9); g.lineWidth = 1.4; g.beginPath(); [[-12, 22], [-15, -6], [-6, -30], [8, -32], [15, -4], [12, 22]].forEach(p => g.lineTo(p[0], p[1])); g.closePath(); g.fill(); g.stroke();
    for(let i = 0; i < 5; i++) twinkle(g, -10 + (i * 37 % 22), -24 + (i * 23 % 40), 2, P.c[2]); g.restore(); g.globalAlpha = 1; g.save(); g.translate(14, -34); word(g, q, this.word, P.c[0], 9, 0.1); g.restore(); }});

  // ⚔️ SLASH (fx-1b) — drawn around the SHOULDER (the act's hit point = the shoulder; the blade's tip runs on a circle of ≈ 36 units)
  // sweep(g, q, from, to, …): a crescent that grows from `from` to `to` (radians, canvas: 0 = +x, π/2 = down) during the first part of the life, then fades
  function sweep(g, q, a0, a1, r, w, P, grow0, cx, cy){ const p = outQ(q / (grow0 || 0.35)), a = fade(q, 0.45); g.save(); g.translate(cx || 0, cy || 0); g.globalAlpha *= a;
    glow(g, P.c[0], 10); arcTrail(g, r, a0, a0 + (a1 - a0) * p, w, P.c[2], alpha(P.c[0], 0.45)); g.shadowBlur = 0;
    const ta = a0 + (a1 - a0) * p; twinkle(g, Math.cos(ta) * r, Math.sin(ta) * r, 4.5 * (1 - q * 0.6), P.c[2]); g.restore(); }
  function slashDef(key, name, icon, wd, ms, stop, shake, col, a0, a1, r, w, extra){ def(key, {name, icon, word: wd, ms, stop, shake, col, draw(g, q, P){ sweep(g, q, a0, a1, r || 36, w || 10, P); if(extra) extra.call(this, g, q, P);
    if(this.word){ g.save(); g.translate(Math.cos(a1) * (r || 36) + 6, Math.sin(a1) * (r || 36) - 16); word(g, q, this.word, P.c[0], 10, -0.08); g.restore(); } }}); }
  slashDef('slash.across', 'Slash across', '⚔️', 'SHING!', 460, 60, 3, ['#E7F5FF', '#FFFFFF', '#FFFFFF'], -Math.PI * 0.9, Math.PI * 0.05, 38, 11);
  slashDef('slash.cleave', 'Cleave down', '🪓', 'CLANG!', 520, 90, 5, ['#B197FC', '#E5DBFF', '#FFFFFF'], -Math.PI * 0.55, Math.PI * 0.45, 38, 12, function(g, q, P){
    g.save(); g.translate(30, 40); flat(g, () => ring(g, 6 + outQ(q) * 18, 3.5 * (1 - q), alpha(P.c[0], 0.8))); g.strokeStyle = alpha('#E9DCC9', fade(q, 0.5)); g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(-8, 5); g.moveTo(0, 0); g.lineTo(7, 6); g.moveTo(0, 0); g.lineTo(1, 8); g.stroke(); g.restore(); });
  slashDef('slash.rising', 'Rising slash', '⤴️', 'SWISH!', 480, 70, 3, ['#3BC9DB', '#99E9F2', '#FFFFFF'], Math.PI * 0.4, -Math.PI * 0.55, 38, 11, function(g, q, P){ for(let i = 0; i < 4; i++) twinkle(g, 18 + i * 5, -26 - i * 7 - q * 14, 2.2, P.c[1]); });
  slashDef('slash.diagdown', 'Diagonal down', '↘️', 'SLASH!', 460, 60, 3, ['#F783AC', '#FCC2D7', '#FFFFFF'], -Math.PI * 0.8, Math.PI * 0.25, 38, 11);
  slashDef('slash.diagup', 'Diagonal up', '↗️', 'ZING!', 460, 60, 3, ['#94D82D', '#D8F5A2', '#FFFFFF'], Math.PI * 0.75, -Math.PI * 0.2, 38, 11);
  def('slash.spin', {name: 'Spin slash', icon: '🌀', word: 'WHIRLWIND!', ms: 620, stop: 70, shake: 4, col: ['#9775FA', '#D0BFFF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5), p = outQ(q / 0.45);
    g.globalAlpha = a; for(let k = 0; k < 3; k++) arcTrail(g, 30 + k * 6, k * 2.1 + p * 3, k * 2.1 + p * 3 + 1.9 * p, 9 - k * 2.5, P.c[2], alpha(P.c[0], 0.35)); glow(g, P.c[1], 12); twinkle(g, 0, 0, 7 * (1 - q), P.c[2]); g.shadowBlur = 0;
    sparks(g, P.calm ? 6 : 12, 34, 50 + q * 8, alpha(P.c[1], 0.8), P.seed, 0, TAU, 1.4); g.globalAlpha = 1; g.save(); g.translate(0, -50); word(g, q, this.word, P.c[0], 9, 0); g.restore(); }});
  def('slash.thrust', {name: 'Thrust', icon: '🗡️', word: 'STAB!', ms: 440, stop: 60, shake: 2, col: ['#20C997', '#96F2D7', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.4), L = 52 * outQ(q / 0.25);
    g.globalAlpha = a; const gr = g.createLinearGradient(L - 60, 0, L, 0); gr.addColorStop(0, alpha(P.c[0], 0)); gr.addColorStop(1, P.c[1]); g.fillStyle = gr; g.beginPath(); g.moveTo(L - 60, -2.5); g.lineTo(L, 0); g.lineTo(L - 60, 2.5); g.fill();
    [0, 1, 2].forEach(i => { const qq = clamp(q * 1.3 - i * 0.1, 0, 1); g.save(); g.translate(L + 2 + i * 5, 0); g.scale(0.4, 1); ring(g, 4 + qq * 10, 2 * (1 - qq), alpha(P.c[0], 0.9 - i * 0.25)); g.restore(); });
    glow(g, P.c[0], 10); twinkle(g, L + 2, 0, 5 * (1 - q * 0.5), P.c[2]); g.shadowBlur = 0; g.globalAlpha = 1; g.save(); g.translate(L, -16); word(g, q, this.word, P.c[0], 10, 0); g.restore(); }});
  def('slash.cross', {name: 'Cross slash', icon: '❌', word: 'X-CUT!', ms: 600, stop: 90, shake: 4, col: ['#FF4D8D', '#4DABF7', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5), p1 = outQ(q / 0.18), p2 = outQ((q - 0.16) / 0.18);
    g.globalAlpha = a; g.lineCap = 'round'; g.save(); g.translate(30, 0);
    [[p1, 1, P.c[0]], [p2, -1, P.c[1]]].forEach(([p, k, c]) => { if(p <= 0) return; glow(g, c, 10); g.strokeStyle = c; g.lineWidth = 4.5; g.beginPath(); g.moveTo(-18, -18 * k); g.lineTo(-18 + 36 * p, -18 * k + 36 * k * p); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke(); });
    g.shadowBlur = 0; if(q > 0.34){ const s = grow(q - 0.34, 0.12); g.save(); g.scale(s, s); star(g, 4, 12, 3, Math.PI / 4, P.c[2]); g.restore(); } g.restore(); g.globalAlpha = 1; g.save(); g.translate(40, -26); word(g, q, this.word, P.c[0], 10, -0.08); g.restore(); }});
  def('slash.flurry', {name: 'Blade flurry', icon: '✨', word: 'SLASH SLASH!', ms: 640, stop: 40, shake: 2, col: ['#FCC419', '#FFEC99', '#FFFFFF'], draw(g, q, P){ const R = rnd(P.seed);
    for(let i = 0; i < (P.calm ? 3 : 5); i++){ const born = i * 0.1, qq = (q - born) / 0.35; const a0 = R() * TAU; if(qq < 0 || qq > 1) continue; g.save(); g.translate(24 + R() * 10, -4 + (R() - 0.5) * 20); sweep(g, qq, a0, a0 + 2.0, 14, 5, P, 0.4); g.restore(); }
    g.save(); g.translate(28, -32); word(g, q, this.word, P.c[0], 8, -0.06); g.restore(); }});
  def('slash.dash', {name: 'Dash-through slash', icon: '💨', word: 'ZWIP!', ms: 620, stop: 50, shake: 3, col: ['#FFFFFF', '#A5D8FF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.55);
    g.globalAlpha = a; g.save(); g.translate(40, 0); speedLines(g, 10, 40, 30, alpha(P.c[1], 0.8), P.seed); g.restore();
    const cut = outQ(q / 0.2); g.strokeStyle = P.c[2]; g.lineWidth = 2; glow(g, P.c[1], 12); g.beginPath(); g.moveTo(-30, -8); g.lineTo(-30 + 80 * cut, -8 + 6 * cut); g.stroke(); g.shadowBlur = 0;
    if(q > 0.35){ const s = grow(q - 0.35, 0.15); g.save(); g.translate(10, -6); g.scale(s, s); star(g, 6, 10, 2.4, 0.2, P.c[1]); g.restore(); } g.globalAlpha = 1; g.save(); g.translate(10, -26); word(g, q, this.word, P.c[1], 10, 0); g.restore(); }});
  def('slash.draw', {name: 'Quick-draw', icon: '⚡', word: '…SHAN!', ms: 760, stop: 160, shake: 3, col: ['#FFD43B', '#FF6B6B', '#FFFFFF'], draw(g, q, P){   // a thin line… a beat of stillness… then the flash
    const a = fade(q, 0.6), line = outQ(q / 0.12); g.globalAlpha = a; g.strokeStyle = P.c[2]; g.lineWidth = 1.4; glow(g, P.c[0], 8); g.beginPath(); g.moveTo(-6, 4); g.lineTo(-6 + 64 * line, 4 - 14 * line); g.stroke(); g.shadowBlur = 0;
    if(q > 0.4){ const qq = (q - 0.4) / 0.6, s = grow(qq, 0.2); g.save(); g.translate(28, -4); g.scale(s, s); glow(g, P.c[1], 16); star(g, 4, 18, 3, -0.2, P.c[2]); star(g, 8, 9, 3, 0.2, P.c[0]); g.shadowBlur = 0; g.restore();
      for(let i = 0; i < 6; i++){ const an = -0.2 + i * 1.05; g.fillStyle = alpha(P.c[1], 0.8 * (1 - qq)); g.beginPath(); g.ellipse(28 + Math.cos(an) * qq * 20, -4 + Math.sin(an) * qq * 20, 3, 1.4, an, 0, TAU); g.fill(); } }
    g.globalAlpha = 1; if(q > 0.4){ g.save(); g.translate(30, -28); word(g, (q - 0.4) / 0.6, this.word, P.c[0], 10, 0); g.restore(); } }});
  def('slash.chop', {name: 'Overhead chop', icon: '🔨', word: 'KA-CHUNK!', ms: 640, stop: 120, shake: 7, col: ['#FF922B', '#FFD8A8', '#FFFFFF'], draw(g, q, P){ sweep(g, q, -Math.PI * 0.62, Math.PI * 0.42, 40, 14, P, 0.3);
    g.save(); g.translate(32, 40); g.globalAlpha = fade(q, 0.5); flat(g, () => { [0, 1].forEach(i => { const qq = clamp(q * 1.3 - i * 0.12, 0, 1); ring(g, 6 + qq * (20 + i * 10), (5 - i * 2) * (1 - qq), alpha(P.c[0], 0.85 - i * 0.3)); }); });
    const R = rnd(P.seed); for(let i = 0; i < (P.calm ? 3 : 6); i++){ const vx = (R() - 0.5) * 40, vy = -18 - R() * 22; g.fillStyle = '#A5876B'; g.beginPath(); g.arc(vx * q, vy * q + 50 * q * q, 1.4 + R() * 1.4, 0, TAU); g.fill(); } g.restore();
    g.save(); g.translate(24, -52); word(g, q, this.word, P.c[0], 10, -0.06); g.restore(); }});
  // 🦘 JUMP ATTACKS (fx-1b) — the hit point = where the attack lands (usually the ground in front)
  def('jump.slash', {name: 'Jump slash', icon: '🦘', word: 'HYAAH!', ms: 640, stop: 110, shake: 6, col: ['#FFD43B', '#FFF3BF', '#FFFFFF'], draw(g, q, P){ sweep(g, q, -Math.PI * 0.7, Math.PI * 0.35, 36, 13, P, 0.3, -6, -30);
    g.save(); g.globalAlpha = fade(q, 0.5); flat(g, () => { ring(g, 8 + outQ(q) * 26, 5 * (1 - q), alpha(P.c[0], 0.85)); ring(g, 4 + outQ(q) * 40, 2.5 * (1 - q), alpha(P.c[1], 0.5)); }); dots(g, P.calm ? 5 : 10, 12 + q * 20, alpha('#E9DCC9', 0.85), P.seed, 2, -10); g.restore();
    g.save(); g.translate(8, -60); word(g, q, this.word, P.c[0], 11, -0.1); g.restore(); }});
  def('jump.thrust', {name: 'Jump thrust', icon: '🔻', word: 'PLUNGE!', ms: 600, stop: 100, shake: 6, col: ['#22B8CF', '#99E9F2', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5), L = 56 * outQ(q / 0.25);
    g.globalAlpha = a; const gr = g.createLinearGradient(0, -L, 0, 0); gr.addColorStop(0, alpha(P.c[0], 0)); gr.addColorStop(1, P.c[1]); g.fillStyle = gr; g.beginPath(); g.moveTo(-3, -L); g.lineTo(0, 0); g.lineTo(3, -L); g.fill();
    flat(g, () => { [0, 1, 2].forEach(i => { const qq = clamp(q * 1.3 - i * 0.1, 0, 1); ring(g, 4 + qq * (16 + i * 10), (4.5 - i * 1.3) * (1 - qq), alpha(P.c[0], 0.9 - i * 0.25)); }); });
    glow(g, P.c[0], 12); twinkle(g, 0, -2, 6 * (1 - q * 0.5), P.c[2]); g.shadowBlur = 0; g.globalAlpha = 1; g.save(); g.translate(16, -30); word(g, q, this.word, P.c[0], 10, 0.08); g.restore(); }});
  def('jump.pound', {name: 'Ground pound', icon: '💥', word: 'BOOM!', ms: 720, stop: 140, shake: 9, col: ['#FFA94D', '#FFE8CC', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5);
    g.globalAlpha = a; flat(g, () => { [0, 1, 2].forEach(i => { const qq = clamp(q * 1.2 - i * 0.1, 0, 1); ring(g, 8 + qq * (30 + i * 14), (7 - i * 2) * (1 - qq), alpha(P.c[0], 0.9 - i * 0.25)); }); });
    for(let i = 0; i < 5; i++){ const x = -30 + i * 15, h = (14 + (i % 2) * 8) * outQ(q / 0.4) * (1 - q); g.fillStyle = alpha('#E9DCC9', 0.75); g.beginPath(); g.ellipse(x, -h / 2, 4, h / 2 + 1, 0, 0, TAU); g.fill(); }
    const R = rnd(P.seed); for(let i = 0; i < (P.calm ? 4 : 8); i++){ const vx = (R() - 0.5) * 70, vy = -26 - R() * 34; g.fillStyle = '#A5876B'; g.beginPath(); g.ellipse(vx * q, vy * q + 70 * q * q, 2 + R() * 2, 1.5 + R(), R() * 3, 0, TAU); g.fill(); }
    g.globalAlpha = 1; g.save(); g.translate(0, -40); word(g, q, this.word, P.c[0], 13, 0); g.restore(); }});
  def('jump.aerialspin', {name: 'Aerial spin slash', icon: '🌪️', word: 'TWISTER!', ms: 640, stop: 70, shake: 4, col: ['#748FFC', '#BAC8FF', '#FFFFFF'], draw(g, q, P){ const p = outQ(q / 0.45), a = fade(q, 0.5);
    g.globalAlpha = a; g.save(); g.scale(1, 0.55); for(let k = 0; k < 3; k++) arcTrail(g, 28 + k * 7, k * 2.1 - p * 4, k * 2.1 - p * 4 + 2.2, 9 - k * 2.5, P.c[2], alpha(P.c[0], 0.4)); g.restore();
    sparks(g, P.calm ? 6 : 10, 26, 44 + q * 8, alpha(P.c[1], 0.8), P.seed, 0, TAU, 1.4); g.globalAlpha = 1; g.save(); g.translate(0, -34); word(g, q, this.word, P.c[0], 9, 0); g.restore(); }});
  def('jump.somersault', {name: 'Somersault slash', icon: '🔃', word: 'FLIP!', ms: 640, stop: 80, shake: 4, col: ['#F06595', '#FFC9E3', '#FFFFFF'], draw(g, q, P){ const p = outQ(q / 0.45);
    sweep(g, q, -Math.PI * 0.5, -Math.PI * 0.5 + TAU * 0.92 * p, 30, 11, P, 0.45, 0, -10); for(let i = 0; i < 5; i++) twinkle(g, Math.cos(i * 1.3) * 40, -10 + Math.sin(i * 1.3) * 40, 2.4 * fade(q, 0.4), P.c[1]);
    g.save(); g.translate(26, -46); word(g, q, this.word, P.c[0], 10, 0.1); g.restore(); }});
  def('jump.knee', {name: 'Flying knee', icon: '🦵', word: 'HUP!', ms: 480, stop: 90, shake: 5, col: ['#FF8787', '#FFC9C9', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.45), s = grow(q, 0.15);
    g.globalAlpha = a; g.save(); g.rotate(0.5); speedLines(g, 8, 22, 18, alpha(P.c[1], 0.8), P.seed); g.restore(); g.save(); g.scale(s, s); glow(g, P.c[0], 14); star(g, 7, 15, 6, -0.4, P.c[0]); star(g, 7, 8, 3, 0, P.c[2]); g.shadowBlur = 0; g.restore();
    g.globalAlpha = 1; g.save(); g.translate(10, -24); word(g, q, this.word, P.c[0], 10, -0.1); g.restore(); }});
  def('jump.smash', {name: 'Leap smash', icon: '🔨', word: 'SMASH!', ms: 760, stop: 150, shake: 10, col: ['#FF6B6B', '#FFD43B', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5), s = grow(q, 0.16);
    g.globalAlpha = a; flat(g, () => { ring(g, 10 + outQ(q) * 34, 7 * (1 - q), alpha(P.c[1], 0.9)); g.fillStyle = alpha('#5C4033', 0.35 * (1 - q)); g.beginPath(); g.ellipse(0, 0, 22, 22, 0, 0, TAU); g.fill(); });
    g.save(); g.translate(0, -12); g.scale(s, s); glow(g, P.c[0], 18); star(g, 10, 24, 9, 0, P.c[0]); star(g, 10, 15, 6, 0.3, P.c[1]); star(g, 8, 7, 3, 0, P.c[2]); g.shadowBlur = 0; g.restore();
    dots(g, P.calm ? 6 : 12, 20 + q * 22, alpha('#E9DCC9', 0.85), P.seed, 2.4, -16); g.globalAlpha = 1; g.save(); g.translate(0, -50); word(g, q, this.word, P.c[1], 13, -0.05); g.restore(); }});
  def('jump.rising', {name: 'Rising sky slash', icon: '🚀', word: 'RISE!', ms: 620, stop: 80, shake: 4, col: ['#4DABF7', '#D0EBFF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5), h = 70 * outQ(q / 0.4);
    g.globalAlpha = a; const gr = g.createLinearGradient(0, 10, 0, -h); gr.addColorStop(0, alpha(P.c[0], 0)); gr.addColorStop(1, P.c[1]); g.fillStyle = gr; g.beginPath(); g.moveTo(-8, 10); g.quadraticCurveTo(-3, -h * 0.5, 0, -h); g.quadraticCurveTo(3, -h * 0.5, 8, 10); g.fill();
    for(let i = 0; i < 8; i++){ const an = i * 0.9 + q * 8, y = 4 - i * 9 - q * 12; twinkle(g, Math.cos(an) * 12, y, 2.2, P.c[2]); } g.globalAlpha = 1; g.save(); g.translate(18, -h + 4); word(g, q, this.word, P.c[0], 10, 0.08); g.restore(); }});
  def('jump.upper', {name: 'Sky uppercut', icon: '☄️', word: 'SKY!', ms: 680, stop: 110, shake: 6, col: ['#FF922B', '#FFE066', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5), h = 64 * outQ(q / 0.35);
    g.globalAlpha = a; glow(g, P.c[0], 16); const gr = g.createLinearGradient(0, 16, 0, -h); gr.addColorStop(0, alpha(P.c[0], 0)); gr.addColorStop(0.6, P.c[0]); gr.addColorStop(1, P.c[1]); g.fillStyle = gr;
    g.beginPath(); g.moveTo(-10, 16); g.quadraticCurveTo(-12, -h * 0.4, 0, -h); g.quadraticCurveTo(12, -h * 0.4, 10, 16); g.fill(); g.shadowBlur = 0;
    for(let i = 0; i < 3; i++){ const y = -h * (0.3 + i * 0.25); g.save(); g.translate(0, y); g.scale(1, 0.3); ring(g, 10 + i * 3, 2, alpha(P.c[1], 0.8)); g.restore(); } g.save(); g.translate(0, -h); star(g, 5, 9 * grow(q, 0.2), 3.5, -Math.PI / 2, P.c[2]); g.restore();
    g.globalAlpha = 1; g.save(); g.translate(20, -h + 10); word(g, q, this.word, P.c[0], 11, 0.1); g.restore(); }});
  def('jump.wall', {name: 'Wall-jump strike', icon: '🧗', word: 'BOING-POW!', ms: 600, stop: 80, shake: 4, col: ['#51CF66', '#B2F2BB', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5), s = grow(q, 0.15);
    g.globalAlpha = a; g.strokeStyle = alpha(P.c[1], 0.8); g.lineWidth = 2; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(-50, 10); g.lineTo(-30, -30); g.lineTo(-6, -4); g.stroke(); g.setLineDash([]);
    g.save(); g.translate(-30, -30); flat(g, () => ring(g, 6 + q * 8, 2 * (1 - q), alpha(P.c[1], 0.8))); g.restore();
    g.save(); g.scale(s, s); glow(g, P.c[0], 12); star(g, 6, 13, 5, 0.3, P.c[0]); star(g, 6, 7, 3, 0, P.c[2]); g.shadowBlur = 0; g.restore(); g.globalAlpha = 1; g.save(); g.translate(8, -28); word(g, q, this.word, P.c[0], 9, -0.08); g.restore(); }});
  // 🎯 THROW (fx-1b) — the hit point = the throwing hand at the RELEASE; the thrown thing itself flies as the act's `prop`
  function windRings(g, q, dir, n, col){ for(let i = 0; i < n; i++){ const qq = clamp(q * 1.4 - i * 0.12, 0, 1); g.save(); g.rotate(dir); g.translate(-i * 9 - qq * 6, 0); g.scale(0.35, 1); ring(g, 5 + i * 3 + qq * 5, 2 * (1 - qq), alpha(col, 0.9 - i * 0.25)); g.restore(); } }
  def('throw.overhand', {name: 'Overhand throw', icon: '⚾', word: 'ZOOM!', ms: 440, stop: 30, shake: 0, col: ['#74C0FC', '#D0EBFF', '#FFFFFF'], draw(g, q, P){ g.globalAlpha = fade(q, 0.4); windRings(g, q, -0.3, 3, P.c[0]); g.save(); g.rotate(-0.3); speedLines(g, 6, 18, 14, alpha(P.c[1], 0.8), P.seed); g.restore(); g.globalAlpha = 1; g.save(); g.translate(14, -20); word(g, q, this.word, P.c[0], 9, -0.1); g.restore(); }});
  def('throw.sidearm', {name: 'Sidearm throw', icon: '🥏', word: 'FWIP!', ms: 440, stop: 30, shake: 0, col: ['#FFA94D', '#FFE8CC', '#FFFFFF'], draw(g, q, P){ g.globalAlpha = fade(q, 0.4); g.save(); g.translate(-14, -2); g.scale(1, 0.45); arcTrail(g, 18, Math.PI * 0.9, Math.PI * (0.9 + 0.9 * outQ(q / 0.4)), 7, P.c[2], alpha(P.c[0], 0.4)); g.restore(); windRings(g, q, 0, 2, P.c[0]); g.globalAlpha = 1; g.save(); g.translate(12, -18); word(g, q, this.word, P.c[0], 9, 0); g.restore(); }});
  def('throw.lob', {name: 'Underhand lob', icon: '🎾', word: 'BLOOP!', ms: 520, stop: 0, shake: 0, col: ['#B2F2BB', '#EBFBEE', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.45); g.globalAlpha = a; g.fillStyle = alpha(P.c[1], 0.8); for(let i = 1; i <= 6; i++){ const t = i / 7 * outQ(q / 0.5); g.beginPath(); g.arc(t * 70, -t * 46 + t * t * 40, 1.6, 0, TAU); g.fill(); }
    dots(g, 6, 8 + q * 6, alpha(P.c[1], 0.8), P.seed, 1.8); for(let i = 0; i < 3; i++) twinkle(g, 6 + i * 8, -10 - i * 6 - q * 6, 2, P.c[2]); g.globalAlpha = 1; g.save(); g.translate(10, -24); word(g, q, this.word, P.c[0], 9, 0.08); g.restore(); }});
  def('throw.spear', {name: 'Spear throw', icon: '🔱', word: 'JAVELIN!', ms: 560, stop: 40, shake: 2, col: ['#A5D8FF', '#E7F5FF', '#FFFFFF'], draw(g, q, P){ g.globalAlpha = fade(q, 0.45); g.save(); g.rotate(-0.35); speedLines(g, 10, 34, 20, alpha(P.c[1], 0.85), P.seed); g.restore(); windRings(g, q, -0.35, 3, P.c[0]); g.globalAlpha = 1; g.save(); g.translate(14, -26); word(g, q, this.word, P.c[0], 9, -0.12); g.restore(); }});
  def('throw.jump', {name: 'Jump throw', icon: '🏐', word: 'SKY THROW!', ms: 520, stop: 40, shake: 2, col: ['#FFD43B', '#FFF3BF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.45), s = grow(q, 0.15); g.globalAlpha = a; g.save(); g.scale(s, s); ring(g, 10, 2.4, alpha(P.c[0], 0.8)); star(g, 6, 9, 3.5, 0.2, alpha(P.c[1], 0.9)); g.restore(); windRings(g, q, 0.35, 3, P.c[0]); g.globalAlpha = 1; g.save(); g.translate(10, -24); word(g, q, this.word, P.c[0], 9, -0.08); g.restore(); }});
  def('throw.double', {name: 'Double throw', icon: '🏀', word: 'TWO!', ms: 480, stop: 30, shake: 1, col: ['#FF922B', '#FFD8A8', '#FFFFFF'], draw(g, q, P){ g.globalAlpha = fade(q, 0.45); [-8, 8].forEach((y, i) => { g.save(); g.translate(0, y); windRings(g, clamp(q - i * 0.08, 0, 1), -0.2, 2, P.c[0]); g.restore(); }); g.globalAlpha = 1; g.save(); g.translate(12, -22); word(g, q, this.word, P.c[0], 9, 0); g.restore(); }});
  def('throw.boomerang', {name: 'Boomerang', icon: '🪃', word: 'COME BACK!', ms: 700, stop: 0, shake: 0, col: ['#E599F7', '#F3D9FA', '#FFFFFF'], draw(g, q, P){ const p = outQ(q / 0.6); g.globalAlpha = fade(q, 0.6); g.strokeStyle = alpha(P.c[0], 0.85); g.lineWidth = 2; g.setLineDash([3, 4]);
    g.beginPath(); g.ellipse(36, -10, 36, 14, -0.15, Math.PI, Math.PI + TAU * 0.95 * p); g.stroke(); g.setLineDash([]); for(let i = 0; i < 3; i++) twinkle(g, 36 + Math.cos(Math.PI + p * 6 - i * 0.5) * 36, -10 + Math.sin(Math.PI + p * 6 - i * 0.5) * 14, 2.4 - i * 0.6, P.c[1]);
    g.globalAlpha = 1; g.save(); g.translate(36, -36); word(g, q, this.word, P.c[0], 8, 0); g.restore(); }});
  def('throw.bow', {name: 'Bow shot', icon: '🏹', word: 'TWANG!', ms: 520, stop: 40, shake: 1, col: ['#FFD43B', '#FFF9DB', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.4); g.globalAlpha = a; g.strokeStyle = P.c[1]; g.lineWidth = 1.4; g.beginPath(); for(let i = 0; i <= 12; i++){ const y = -16 + i * 32 / 12; g.lineTo(-6 + Math.sin(i * 1.8 + q * 40) * 3 * (1 - q), y); } g.stroke();
    glow(g, P.c[0], 12); ring(g, 6 + q * 10, 2 * (1 - q), alpha(P.c[0], 0.9)); g.shadowBlur = 0; g.save(); speedLines(g, 6, 20, 8, alpha(P.c[1], 0.8), P.seed); g.restore(); g.globalAlpha = 1; g.save(); g.translate(14, -24); word(g, q, this.word, P.c[0], 9, 0.06); g.restore(); }});
  def('throw.sling', {name: 'Sling spin', icon: '🪨', word: 'WHIRR!', ms: 520, stop: 30, shake: 0, col: ['#ADB5BD', '#E9ECEF', '#FFFFFF'], pre(g, q, P){ g.strokeStyle = alpha(P.c[0], 0.7); g.lineWidth = 1.6; for(let k = 0; k < 2; k++){ g.beginPath(); g.arc(0, -10, 10 + k * 3, q * 14 + k, q * 14 + k + 2.4); g.stroke(); } },
    draw(g, q, P){ g.globalAlpha = fade(q, 0.4); g.strokeStyle = alpha(P.c[0], 0.85); g.lineWidth = 2; for(let k = 0; k < 2; k++){ g.beginPath(); g.arc(-4, -6, 12 + k * 3, -2.4 + k * 0.3, -2.4 + k * 0.3 + 2.4 * outQ(q / 0.3)); g.stroke(); } windRings(g, q, -0.15, 3, P.c[1]);
      g.globalAlpha = 1; g.save(); g.translate(12, -24); word(g, q, this.word, '#868E96', 9, 0); g.restore(); }});
  def('throw.bounce', {name: 'Bounce throw', icon: '🔴', word: 'BOING!', ms: 560, stop: 30, shake: 1, col: ['#FF6B6B', '#FFC9C9', '#FFFFFF'], draw(g, q, P){ g.globalAlpha = fade(q, 0.45); g.save(); g.translate(26, 40); flat(g, () => { ring(g, 4 + outQ(q) * 16, 3 * (1 - q), alpha(P.c[0], 0.85)); }); g.strokeStyle = alpha(P.c[1], 0.8); g.lineWidth = 1.6;
    for(let i = 0; i < 3; i++){ g.beginPath(); g.moveTo(-6 + i * 6, -4); g.lineTo(-6 + i * 6, -10 - q * 6); g.stroke(); } g.restore(); windRings(g, q, 0.9, 2, P.c[0]); g.globalAlpha = 1; g.save(); g.translate(30, 18); word(g, q, this.word, P.c[0], 9, 0.1); g.restore(); }});

  // 🪄 CAST (fx-1c) — every cast GATHERS on the wind-up (`pre`, drawn by games during the anticipation) and RELEASES its own shape at the contact
  function gather(g, q, P, r){ const R = rnd(P.seed + 7); for(let i = 0; i < (P.calm ? 6 : 12); i++){ const a = R() * TAU, d = (r || 18) * (1 - q) + 3; g.strokeStyle = alpha(P.c[1], 0.8); g.lineWidth = 1.3;
      g.beginPath(); g.moveTo(Math.cos(a) * d, Math.sin(a) * d); g.lineTo(Math.cos(a) * (d + 4), Math.sin(a) * (d + 4)); g.stroke(); }
    glow(g, P.c[0], 6 + q * 10); g.fillStyle = alpha(P.c[2], 0.4 + q * 0.6); g.beginPath(); g.arc(0, 0, 1.5 + q * 3.5, 0, TAU); g.fill(); g.shadowBlur = 0; }
  const castPre = function(g, q, P){ gather(g, q, P, 18); };
  def('cast.skycall', {name: 'Sky call (two hands up)', icon: '☀️', word: 'SHINE!', ms: 760, stop: 60, shake: 2, col: ['#FCC419', '#FFF3BF', '#FFFFFF'], pre: castPre, draw(g, q, P){ const a = fade(q, 0.55), s = grow(q, 0.2);
    g.globalAlpha = a; g.save(); g.scale(s, s); glow(g, P.c[0], 18); g.fillStyle = P.c[2]; g.beginPath(); g.arc(0, 0, 9, 0, TAU); g.fill(); g.shadowBlur = 0; ring(g, 13, 2, alpha(P.c[0], 0.8)); for(let i = 0; i < 10; i++){ const an = i / 10 * TAU + q; g.strokeStyle = alpha(P.c[1], 0.8); g.lineWidth = 1.6; g.beginPath(); g.moveTo(Math.cos(an) * 15, Math.sin(an) * 15); g.lineTo(Math.cos(an) * 21, Math.sin(an) * 21); g.stroke(); } g.restore();
    for(let i = 0; i < (P.calm ? 4 : 7); i++){ const x = -36 + i * 12, y0 = 18 + (i % 2) * 8, L = 60 * outQ(q / 0.5); const gr = g.createLinearGradient(0, y0, 0, y0 + L); gr.addColorStop(0, alpha(P.c[1], 0.9)); gr.addColorStop(1, alpha(P.c[1], 0)); g.fillStyle = gr; g.fillRect(x - 1.6, y0, 3.2, L); }
    g.globalAlpha = 1; g.save(); g.translate(26, -10); word(g, q, this.word, P.c[0], 10, 0.08); g.restore(); }});
  def('cast.beam', {name: 'Beam (two hands front)', icon: '🔆', word: 'BEAM!', ms: 700, stop: 50, shake: 3, col: ['#4DABF7', '#A5D8FF', '#FFFFFF'], pre: castPre, draw(g, q, P){ const a = fade(q, 0.55), L = 90 * outQ(q / 0.3), w = 9 * (1 - q * 0.5);
    g.globalAlpha = a; glow(g, P.c[0], 16); const gr = g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, P.c[2]); gr.addColorStop(0.3, P.c[1]); gr.addColorStop(1, alpha(P.c[0], 0)); g.fillStyle = gr;
    g.beginPath(); g.moveTo(0, -w * 0.6); g.quadraticCurveTo(L * 0.5, -w, L, -w * 1.4); g.lineTo(L, w * 1.4); g.quadraticCurveTo(L * 0.5, w, 0, w * 0.6); g.fill(); g.shadowBlur = 0;
    ring(g, 6 + q * 6, 2, alpha(P.c[2], 0.9)); for(let i = 0; i < 6; i++) twinkle(g, i * 14 + (q * 40) % 14, Math.sin(i * 2 + q * 9) * w, 2.4, P.c[2]); g.globalAlpha = 1; g.save(); g.translate(30, -22); word(g, q, this.word, P.c[0], 10, 0); g.restore(); }});
  def('cast.wide', {name: 'Wide burst (arms out)', icon: '↔️', word: 'BURST!', ms: 640, stop: 60, shake: 3, col: ['#F06595', '#FFC9E3', '#FFFFFF'], pre: castPre, draw(g, q, P){ const a = fade(q, 0.5);
    g.globalAlpha = a; for(let i = 0; i < 3; i++){ const qq = clamp(q * 1.3 - i * 0.12, 0, 1); g.save(); g.scale(1.6, 0.6); ring(g, 8 + qq * (22 + i * 8), (4 - i) * (1 - qq), alpha(P.c[i % 2 ? 1 : 0], 0.9 - i * 0.2)); g.restore(); }
    [-1, 1].forEach(k => { for(let i = 0; i < 4; i++) twinkle(g, k * (20 + i * 9 + q * 16), Math.sin(i * 1.7) * 6, 2.6, P.c[2]); }); g.globalAlpha = 1; g.save(); g.translate(0, -26); word(g, q, this.word, P.c[0], 10, 0); g.restore(); }});
  def('cast.raise', {name: 'Raise (one hand up)', icon: '☝️', word: 'RISE UP!', ms: 680, stop: 50, shake: 2, col: ['#20C997', '#96F2D7', '#FFFFFF'], pre: castPre, draw(g, q, P){ const a = fade(q, 0.5), h = 70 * outQ(q / 0.35);
    g.globalAlpha = a; glow(g, P.c[0], 14); const gr = g.createLinearGradient(0, 4, 0, -h); gr.addColorStop(0, P.c[2]); gr.addColorStop(1, alpha(P.c[0], 0)); g.fillStyle = gr; g.beginPath(); g.moveTo(-5, 4); g.lineTo(-9, -h); g.lineTo(9, -h); g.lineTo(5, 4); g.fill(); g.shadowBlur = 0;
    for(let i = 0; i < 7; i++){ const an = i * 0.9 + q * 6; twinkle(g, Math.cos(an) * 12, -i * 9 - q * 10, 2.2, P.c[1]); } g.globalAlpha = 1; g.save(); g.translate(22, -40); word(g, q, this.word, P.c[0], 9, 0.08); g.restore(); }});
  def('cast.bolt', {name: 'Bolt (point)', icon: '⚡', word: 'ZAP!', ms: 520, stop: 70, shake: 3, col: ['#FFD43B', '#FFF3BF', '#FFFFFF'], pre: castPre, draw(g, q, P){ const a = fade(q, 0.4), R = rnd(P.seed + Math.floor(q * 8));
    g.globalAlpha = a; glow(g, P.c[0], 14); g.strokeStyle = P.c[2]; g.lineWidth = 3; g.lineJoin = 'round'; g.beginPath(); let x = 0, y = 0; g.moveTo(0, 0); const L = 80 * outQ(q / 0.2); while(x < L){ x += 9 + R() * 6; y = (R() - 0.5) * 14; g.lineTo(Math.min(x, L), y); } g.stroke();
    g.strokeStyle = P.c[0]; g.lineWidth = 1.2; g.stroke(); g.shadowBlur = 0; g.save(); g.translate(L, y); star(g, 6, 9 * grow(q, 0.25), 3, 0, P.c[1]); g.restore(); g.globalAlpha = 1; g.save(); g.translate(40, -20); word(g, q, this.word, P.c[0], 11, -0.1); g.restore(); }});
  def('cast.sweep', {name: 'Sweep wave (hand to the side)', icon: '🌊', word: 'SPLASH!', ms: 640, stop: 40, shake: 2, col: ['#1C7ED6', '#74C0FC', '#E7F5FF'], pre: castPre, draw(g, q, P){ const a = fade(q, 0.5), p = outQ(q / 0.5);
    g.globalAlpha = a; g.fillStyle = alpha(P.c[1], 0.8); g.beginPath(); g.moveTo(-10, 26); for(let i = 0; i <= 20; i++){ const x = -10 + i * 4 * p * 1.2, y = 26 - Math.sin(i / 20 * Math.PI) * 22 * p - Math.sin(i * 1.3 + q * 10) * 2; g.lineTo(x, y); } g.lineTo(-10 + 80 * p * 1.2, 26); g.closePath(); g.fill();
    g.strokeStyle = P.c[2]; g.lineWidth = 2; g.stroke(); dots(g, P.calm ? 5 : 10, 20 + q * 20, alpha(P.c[2], 0.9), P.seed, 1.8, 0); g.globalAlpha = 1; g.save(); g.translate(36, -10); word(g, q, this.word, P.c[0], 10, 0); g.restore(); }});
  def('cast.orb', {name: 'Chest power orb', icon: '🔮', word: 'POWER!', ms: 700, stop: 80, shake: 4, col: ['#DA77F2', '#EEBEFA', '#FFFFFF'], pre(g, q, P){ gather(g, q, P, 26); }, draw(g, q, P){ const a = fade(q, 0.5), s = grow(q, 0.18);
    g.globalAlpha = a; g.save(); g.scale(s, s); glow(g, P.c[0], 18); const gr = g.createRadialGradient(0, 0, 1, 0, 0, 16); gr.addColorStop(0, P.c[2]); gr.addColorStop(0.5, P.c[1]); gr.addColorStop(1, alpha(P.c[0], 0)); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 16, 0, TAU); g.fill(); g.shadowBlur = 0; g.restore();
    [0, 1].forEach(i => { const qq = clamp(q * 1.3 - i * 0.12, 0, 1); ring(g, 12 + qq * 30, 3 * (1 - qq), alpha(P.c[0], 0.85 - i * 0.3)); }); g.globalAlpha = 1; g.save(); g.translate(0, -30); word(g, q, this.word, P.c[0], 10, 0); g.restore(); }});
  def('cast.slam', {name: 'Ground slam rune', icon: '🌿', word: 'GROW!', ms: 760, stop: 90, shake: 5, col: ['#40C057', '#B2F2BB', '#EBFBEE'], pre: castPre, draw(g, q, P){ const a = fade(q, 0.55), p = outQ(q / 0.3);
    g.globalAlpha = a; g.save(); g.scale(1, 0.32); glow(g, P.c[0], 12); ring(g, 34 * p, 3, P.c[0]); ring(g, 26 * p, 1.5, P.c[1]); for(let i = 0; i < 8; i++){ const an = i / 8 * TAU + q; g.fillStyle = P.c[1]; g.fillRect(Math.cos(an) * 30 * p - 2, Math.sin(an) * 30 * p - 2, 4, 4); } g.shadowBlur = 0; g.restore();
    [-22, 0, 22].forEach((x, i) => { const h = (40 + i % 2 * 12) * outQ((q - 0.1 - i * 0.05) / 0.3); if(h <= 0) return; const gr = g.createLinearGradient(0, 0, 0, -h); gr.addColorStop(0, P.c[0]); gr.addColorStop(1, alpha(P.c[1], 0)); g.fillStyle = gr; g.fillRect(x - 3.5, -h, 7, h); });
    g.globalAlpha = 1; g.save(); g.translate(0, -56); word(g, q, this.word, P.c[0], 10, 0); g.restore(); }});
  def('cast.spin', {name: 'Spin cast (star ring)', icon: '💫', word: 'TWIRL!', ms: 720, stop: 50, shake: 2, col: ['#845EF7', '#D0BFFF', '#FFFFFF'], pre: castPre, draw(g, q, P){ const a = fade(q, 0.55), r = 22 + outQ(q) * 20;
    g.globalAlpha = a; for(let i = 0; i < 8; i++){ const an = i / 8 * TAU + q * 6; g.save(); g.translate(Math.cos(an) * r, Math.sin(an) * r * 0.45); g.rotate(an); star(g, 5, 5, 2.2, 0, i % 2 ? P.c[0] : P.c[1]); g.restore(); }
    g.save(); g.scale(1, 0.45); ring(g, r, 1.4, alpha(P.c[1], 0.7)); g.restore(); g.globalAlpha = 1; g.save(); g.translate(0, -34); word(g, q, this.word, P.c[0], 9, 0); g.restore(); }});
  def('cast.pray', {name: 'Kneel + pray (aura)', icon: '🙏', word: 'BLESS!', ms: 900, stop: 40, shake: 0, col: ['#FFE066', '#FFF9DB', '#FFFFFF'], pre: castPre, draw(g, q, P){ const a = fade(q, 0.6), s = grow(q, 0.25);
    g.globalAlpha = a * 0.9; const gr = g.createRadialGradient(0, 0, 4, 0, 0, 40 * s); gr.addColorStop(0, alpha(P.c[2], 0.7)); gr.addColorStop(0.6, alpha(P.c[1], 0.35)); gr.addColorStop(1, alpha(P.c[0], 0)); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 40 * s, 0, TAU); g.fill();
    g.save(); g.translate(0, -34 - q * 6); g.scale(1, 0.3); ring(g, 10, 2.4, alpha(P.c[0], 0.9)); g.restore(); for(let i = 0; i < 5; i++){ const x = Math.sin(i * 2.1 + q * 4) * 22, y = 10 - q * 40 - i * 7; g.fillStyle = alpha('#FFFFFF', 0.9); g.beginPath(); g.ellipse(x, y, 3, 1.4, 0.6, 0, TAU); g.fill(); }
    g.globalAlpha = 1; g.save(); g.translate(24, -30); word(g, q, this.word, P.c[0], 9, 0.06); g.restore(); }});
  def('cast.snap', {name: 'Finger snap', icon: '🫰', word: 'SNAP!', ms: 420, stop: 40, shake: 0, col: ['#FF922B', '#FFD8A8', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.4), s = grow(q, 0.12);
    g.globalAlpha = a; g.save(); g.scale(s, s); glow(g, P.c[0], 10); star(g, 4, 9, 1.8, q * 2, P.c[2]); g.shadowBlur = 0; g.restore(); sparks(g, 6, 5, 14 + q * 6, P.c[1], P.seed, 0, TAU, 1.4); for(let i = 0; i < 3; i++) twinkle(g, 10 + i * 6, -6 - i * 5 - q * 8, 2, P.c[0]);
    g.globalAlpha = 1; g.save(); g.translate(14, -16); word(g, q, this.word, P.c[0], 9, 0.1); g.restore(); }});
  def('cast.staff', {name: 'Staff point', icon: '🪄', word: 'POOF!', ms: 600, stop: 50, shake: 1, col: ['#E599F7', '#F3D9FA', '#FFFFFF'], pre: castPre, draw(g, q, P){ const a = fade(q, 0.5), x = 70 * outQ(q / 0.4);
    g.globalAlpha = a; g.strokeStyle = alpha(P.c[1], 0.8); g.lineWidth = 2; g.setLineDash([2, 5]); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(x * 0.5, -10, x, 0); g.stroke(); g.setLineDash([]);
    g.save(); g.translate(x, 0); g.rotate(q * 8); glow(g, P.c[0], 12); star(g, 5, 8, 3.4, 0, P.c[0]); g.shadowBlur = 0; g.restore(); dots(g, 6, 8 + q * 8, alpha(P.c[2], 0.9), P.seed, 1.6); g.globalAlpha = 1; g.save(); g.translate(x, -18); word(g, q, this.word, P.c[0], 9, 0); g.restore(); }});
  def('cast.rune', {name: 'Rune drawing', icon: '🔯', word: 'RUNE!', ms: 820, stop: 60, shake: 1, col: ['#22B8CF', '#99E9F2', '#FFFFFF'], pre(g, q, P){ g.strokeStyle = alpha(P.c[1], 0.9); g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, 12, -Math.PI / 2, -Math.PI / 2 + TAU * q); g.stroke(); },
    draw(g, q, P){ const a = fade(q, 0.6), s = grow(q, 0.2); g.globalAlpha = a; g.save(); g.scale(s, s); glow(g, P.c[0], 12); ring(g, 16, 2, P.c[1]); ring(g, 11, 1.2, P.c[0]); g.strokeStyle = P.c[2]; g.lineWidth = 1.6; g.beginPath();
      for(let i = 0; i <= 5; i++){ const an = -Math.PI / 2 + i * TAU * 2 / 5; g.lineTo(Math.cos(an) * 11, Math.sin(an) * 11); } g.stroke(); g.shadowBlur = 0; g.restore(); for(let i = 0; i < 6; i++){ const an = i / 6 * TAU + q * 3; twinkle(g, Math.cos(an) * (20 + q * 10), Math.sin(an) * (20 + q * 10), 2, P.c[1]); }
      g.globalAlpha = 1; g.save(); g.translate(0, -28); word(g, q, this.word, P.c[0], 9, 0); g.restore(); }});
  def('cast.orbthrow', {name: 'Overhead orb throw', icon: '🔵', word: 'KA-POW!', ms: 680, stop: 80, shake: 4, col: ['#5C7CFA', '#BAC8FF', '#FFFFFF'], pre(g, q, P){ glow(g, P.c[0], 10 + q * 10); g.fillStyle = alpha(P.c[1], 0.9); g.beginPath(); g.arc(0, -22, 4 + q * 8, 0, TAU); g.fill(); g.shadowBlur = 0; },
    draw(g, q, P){ const a = fade(q, 0.5), x = 60 * outQ(q / 0.35); g.globalAlpha = a; g.save(); g.translate(x, -4); glow(g, P.c[0], 16); const gr = g.createRadialGradient(0, 0, 1, 0, 0, 12); gr.addColorStop(0, P.c[2]); gr.addColorStop(0.6, P.c[1]); gr.addColorStop(1, alpha(P.c[0], 0)); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 12, 0, TAU); g.fill(); g.shadowBlur = 0;
      if(q > 0.35){ const qq = (q - 0.35) / 0.65; ring(g, 10 + qq * 24, 3 * (1 - qq), alpha(P.c[0], 0.85)); star(g, 8, 18 * grow(qq, 0.2) * (1 - qq * 0.4), 6, 0, alpha(P.c[1], 0.9)); } g.restore(); g.save(); g.rotate(-0.1); speedLines(g, 5, 18, 10, alpha(P.c[1], 0.7), P.seed); g.restore();
      g.globalAlpha = 1; g.save(); g.translate(x, -28); word(g, q, this.word, P.c[0], 10, 0); g.restore(); }});
  def('cast.blast', {name: 'Charge → blast (hands together)', icon: '💠', word: 'HA-AAH!', ms: 760, stop: 110, shake: 6, col: ['#3BC9DB', '#99E9F2', '#FFFFFF'], pre(g, q, P){ gather(g, q, P, 26); glow(g, P.c[0], 16); g.fillStyle = alpha(P.c[1], 0.9); g.beginPath(); g.arc(0, 0, 3 + q * 7, 0, TAU); g.fill(); g.shadowBlur = 0; },
    draw(g, q, P){ const a = fade(q, 0.55), L = 100 * outQ(q / 0.25), w = 16 * (1 - q * 0.4); g.globalAlpha = a; glow(g, P.c[0], 20); const gr = g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, P.c[2]); gr.addColorStop(0.4, P.c[1]); gr.addColorStop(1, alpha(P.c[0], 0.2)); g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, -w * 0.5); g.lineTo(L, -w); g.lineTo(L, w); g.lineTo(0, w * 0.5); g.fill(); g.shadowBlur = 0; for(let i = 0; i < 4; i++){ const x = ((q * 3 + i / 4) % 1) * L; g.save(); g.translate(x, 0); g.scale(0.35, 1); ring(g, w * 0.9, 1.6, alpha(P.c[2], 0.8)); g.restore(); }
      g.globalAlpha = 1; g.save(); g.translate(36, -28); word(g, q, this.word, P.c[0], 11, -0.05); g.restore(); }});
  def('cast.rain', {name: 'Rain call (stars fall)', icon: '🌧️', word: 'SHOWER!', ms: 1000, stop: 30, shake: 0, col: ['#74C0FC', '#D0EBFF', '#FFFFFF'], pre: castPre, draw(g, q, P){ const a = fade(q, 0.7);
    g.globalAlpha = a; cloudPuff(g, 0, 0, 1 + grow(q, 0.25) * 0.2, P.c[1]); const R = rnd(P.seed); for(let i = 0; i < (P.calm ? 8 : 16); i++){ const x = (R() - 0.5) * 70, sp = 60 + R() * 40, y = 10 + ((q * sp + R() * 60) % 90);
      if(i % 3 === 0) twinkle(g, x, y, 2.6, '#FFE066'); else { g.fillStyle = alpha(P.c[0], 0.85); g.beginPath(); g.ellipse(x, y, 1.4, 3.6, 0, 0, TAU); g.fill(); } } g.globalAlpha = 1; g.save(); g.translate(40, -10); word(g, q, this.word, P.c[0], 9, 0.06); g.restore(); }});
  function cloudPuff(g, x, y, s, col){ g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; [[-16, 4, 11], [0, -2, 14], [16, 4, 11], [-6, 8, 10], [8, 8, 10]].forEach(([cx, cy, r]) => { g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); }); g.restore(); }
  // 🛡️ DEFEND (fx-1c) — the hit point = the guard (or the body for dodges)
  def('defend.block', {name: 'Shield block', icon: '🛡️', word: 'TINK!', ms: 520, stop: 70, shake: 2, col: ['#4DABF7', '#A5D8FF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.45), s = grow(q, 0.15);
    g.globalAlpha = a; g.save(); g.scale(s * 0.6, s); glow(g, P.c[0], 14); g.strokeStyle = P.c[1]; g.lineWidth = 2.4; g.beginPath(); for(let i = 0; i <= 6; i++){ const an = i / 6 * TAU + Math.PI / 6; g.lineTo(Math.cos(an) * 26, Math.sin(an) * 26); } g.stroke(); g.fillStyle = alpha(P.c[1], 0.25); g.fill(); g.shadowBlur = 0; g.restore();
    sparks(g, P.calm ? 4 : 8, 6, 22 + q * 8, P.c[2], P.seed, -0.9, 0.9, 1.4); g.globalAlpha = 1; g.save(); g.translate(12, -32); word(g, q, this.word, P.c[0], 10, 0); g.restore(); }});
  def('defend.bash', {name: 'Shield bash', icon: '🧱', word: 'SHOVE!', ms: 520, stop: 90, shake: 4, col: ['#748FFC', '#BAC8FF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.45);
    g.globalAlpha = a; for(let i = 0; i < 3; i++){ const qq = clamp(q * 1.3 - i * 0.1, 0, 1); g.save(); g.translate(qq * 16 + i * 4, 0); g.scale(0.45, 1); ring(g, 14 + i * 4, 3 * (1 - qq), alpha(P.c[0], 0.9 - i * 0.25)); g.restore(); }
    const s = grow(q, 0.15); g.save(); g.translate(8, 0); g.scale(s, s); star(g, 6, 12, 5, 0.3, alpha(P.c[1], 0.95)); g.restore(); speedLines(g, 6, 18, 24, alpha(P.c[1], 0.7), P.seed); g.globalAlpha = 1; g.save(); g.translate(16, -30); word(g, q, this.word, P.c[0], 10, 0.06); g.restore(); }});
  def('defend.parry', {name: 'Parry', icon: '✨', word: 'PARRY!', ms: 600, stop: 160, shake: 0, col: ['#FFFFFF', '#E7F5FF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5), s = grow(q, 0.12);
    g.globalAlpha = a; g.save(); g.scale(s, s); glow(g, '#FFFFFF', 18); star(g, 4, 18, 2.8, q * 0.6, '#FFFFFF'); star(g, 4, 10, 2.2, Math.PI / 4 + q * 0.6, '#FFFFFF'); g.shadowBlur = 0; g.restore(); ring(g, 20 + q * 10, 1.4 * (1 - q), 'rgba(255,255,255,.7)'); ring(g, 30 + q * 14, 1 * (1 - q), 'rgba(255,255,255,.4)');
    g.globalAlpha = 1; g.save(); g.translate(0, -34); word(g, q, this.word, '#FFFFFF', 10, 0); g.restore(); }});
  def('defend.brace', {name: 'Brace / guard', icon: '🧍', word: 'HOLD!', ms: 600, stop: 60, shake: 1, col: ['#FAB005', '#FFEC99', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5);
    g.globalAlpha = a; g.save(); g.translate(0, 34); g.scale(1, 0.3); ring(g, 14 + q * 10, 3 * (1 - q), alpha(P.c[0], 0.8)); g.restore(); glow(g, P.c[0], 10); g.strokeStyle = alpha(P.c[1], 0.9); g.lineWidth = 3; g.beginPath(); g.arc(4, 0, 20, -1.1, 1.1); g.stroke(); g.shadowBlur = 0;
    for(let i = 0; i < 4; i++){ g.strokeStyle = alpha(P.c[0], 0.7); g.lineWidth = 1.4; g.beginPath(); g.moveTo(-14 + i * 9, 36); g.lineTo(-16 + i * 9, 30 - q * 4); g.stroke(); } g.globalAlpha = 1; g.save(); g.translate(14, -28); word(g, q, this.word, P.c[0], 9, 0); g.restore(); }});
  def('defend.roll', {name: 'Dodge roll', icon: '🌀', word: 'ROLL!', ms: 640, stop: 0, shake: 0, col: ['#E9DCC9', '#F8F0E3', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5);
    g.globalAlpha = a; for(let i = 0; i < 5; i++){ const t = clamp(q * 1.5 - i * 0.12, 0, 1); g.fillStyle = alpha(P.c[0], 0.85 * (1 - t)); g.beginPath(); g.arc(-i * 10, 8 - t * 6, 4 + t * 4, 0, TAU); g.fill(); }
    g.save(); g.translate(14, -4); for(let k = 0; k < 2; k++) arcTrail(g, 14 + k * 5, q * 8 + k * 2, q * 8 + k * 2 + 2.2, 3, '#FFFFFF', alpha('#A5D8FF', 0.4)); g.restore(); g.globalAlpha = 1; g.save(); g.translate(10, -30); word(g, q, this.word, '#74C0FC', 9, 0); g.restore(); }});
  def('defend.sidestep', {name: 'Side-step', icon: '👣', word: 'WHIFF!', ms: 520, stop: 0, shake: 0, col: ['#A5D8FF', '#E7F5FF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.4);
    g.globalAlpha = a * 0.5; for(let i = 1; i <= 3; i++){ g.fillStyle = alpha(P.c[0], 0.5 - i * 0.12); g.beginPath(); g.ellipse(i * 9, 0, 9, 22, 0, 0, TAU); g.fill(); } g.globalAlpha = a; speedLines(g, 6, 18, 30, alpha(P.c[1], 0.8), P.seed);
    g.globalAlpha = 1; g.save(); g.translate(16, -30); word(g, q, this.word, P.c[0], 9, 0); g.restore(); }});
  def('defend.backflip', {name: 'Back-flip dodge', icon: '🤸', word: 'WHOA!', ms: 700, stop: 0, shake: 0, col: ['#F783AC', '#FCC2D7', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5), p = outQ(q / 0.5);
    g.globalAlpha = a; g.save(); g.translate(-12, 0); arcTrail(g, 26, -Math.PI * 0.1, -Math.PI * 0.1 - Math.PI * 1.6 * p, 6, P.c[2], alpha(P.c[0], 0.4)); g.restore(); for(let i = 0; i < 5; i++) twinkle(g, -12 + Math.cos(-i * 0.8) * 32, Math.sin(-i * 0.8) * 32, 2.2, P.c[1]);
    g.globalAlpha = 1; g.save(); g.translate(-10, -40); word(g, q, this.word, P.c[0], 9, -0.06); g.restore(); }});
  def('defend.bubble', {name: 'Bubble shield', icon: '🫧', word: 'BLOOP!', ms: 1000, stop: 40, shake: 0, col: ['#66D9E8', '#C5F6FA', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.7), s = grow(q, 0.2), r = 44 * s;
    g.globalAlpha = a; const gr = g.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r); gr.addColorStop(0, alpha(P.c[2], 0.3)); gr.addColorStop(0.8, alpha(P.c[1], 0.18)); gr.addColorStop(1, alpha(P.c[0], 0.55)); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
    g.strokeStyle = alpha(P.c[0], 0.8); g.lineWidth = 1.6; g.stroke(); g.fillStyle = alpha('#FFFFFF', 0.8); g.beginPath(); g.ellipse(-r * 0.4, -r * 0.5, r * 0.18, r * 0.08, -0.6, 0, TAU); g.fill();
    for(let i = 0; i < 4; i++){ const an = i * 1.7 + q * 3; g.beginPath(); g.arc(Math.cos(an) * r * 0.9, Math.sin(an) * r * 0.9, 2 + i % 2, 0, TAU); g.strokeStyle = alpha(P.c[0], 0.7); g.stroke(); } g.globalAlpha = 1; g.save(); g.translate(r * 0.7, -r - 6); word(g, q, this.word, P.c[0], 9, 0.08); g.restore(); }});
  // 🌟 POWER-UPS + FINISHERS (fx-1c)
  def('power.aura', {name: 'Power-up aura', icon: '🔥', word: 'POWER UP!', ms: 1100, stop: 0, shake: 2, col: ['#FF922B', '#FFD43B', '#FFF9DB'], pre(g, q, P){ gather(g, q, P, 30); }, draw(g, q, P){ const a = fade(q, 0.75);
    g.globalAlpha = a; for(let i = 0; i < (P.calm ? 6 : 11); i++){ const x = -22 + i * 4.4, ph = q * 9 + i * 1.3, h = 30 + Math.sin(ph) * 10 + (i % 3) * 6; g.fillStyle = alpha(i % 2 ? P.c[0] : P.c[1], 0.55); g.beginPath(); g.moveTo(x - 5, 40); g.quadraticCurveTo(x - 6, 40 - h * 0.5, x + Math.sin(ph) * 3, 40 - h - 20); g.quadraticCurveTo(x + 6, 40 - h * 0.5, x + 5, 40); g.fill(); }
    for(let i = 0; i < 5; i++) twinkle(g, Math.sin(i * 2.3 + q * 5) * 24, 30 - ((q * 70 + i * 16) % 80), 2.4, P.c[2]); g.globalAlpha = 1; g.save(); g.translate(0, -60); word(g, q, this.word, P.c[0], 10, 0); g.restore(); }});
  def('power.levelup', {name: 'Level-up burst', icon: '⬆️', word: 'LEVEL UP!', ms: 1100, stop: 60, shake: 2, col: ['#FCC419', '#FFF3BF', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.65), s = grow(q, 0.2);
    g.globalAlpha = a; g.save(); g.rotate(q * 0.6); for(let i = 0; i < 12; i++){ const an = i / 12 * TAU; g.fillStyle = alpha(i % 2 ? P.c[0] : P.c[1], 0.5); g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(an - 0.12) * 60 * s, Math.sin(an - 0.12) * 60 * s); g.lineTo(Math.cos(an + 0.12) * 60 * s, Math.sin(an + 0.12) * 60 * s); g.fill(); } g.restore();
    glow(g, P.c[0], 16); star(g, 5, 16 * s, 7 * s, -Math.PI / 2, P.c[0]); g.shadowBlur = 0; for(let i = 0; i < 8; i++){ const an = i / 8 * TAU; twinkle(g, Math.cos(an) * (28 + q * 26), Math.sin(an) * (28 + q * 26), 3, P.c[2]); }
    g.globalAlpha = 1; g.save(); g.translate(0, -48); word(g, q, this.word, P.c[0], 12, 0); g.restore(); }});
  def('power.combo', {name: 'Combo finisher', icon: '🌈', word: 'COMBO!', ms: 800, stop: 130, shake: 7, col: ['#FF6B6B', '#FFD43B', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.5), s = grow(q, 0.16), C = ['#FF6B6B', '#FFA94D', '#FFD43B', '#69DB7C', '#4DABF7', '#B197FC'];
    g.globalAlpha = a; C.forEach((c, i) => { const qq = clamp(q * 1.2 - i * 0.05, 0, 1); ring(g, 6 + qq * (20 + i * 6), 3.4 * (1 - qq), alpha(c, 0.9)); }); g.save(); g.scale(s, s); glow(g, '#FFFFFF', 16); star(g, 8, 16, 6, q, '#FFFFFF'); g.shadowBlur = 0; g.restore();
    sparks(g, P.calm ? 6 : 12, 12, 40 + q * 10, alpha(C[Math.floor(q * 12) % 6], 0.9), P.seed, 0, TAU, 2); g.globalAlpha = 1; g.save(); g.translate(0, -40); word(g, q, this.word, '#FFD43B', 12, -0.06); g.restore(); }});
  def('power.ultimate', {name: 'Ultimate (screen-wide)', icon: '🌟', word: 'ULTIMATE!', ms: 1300, stop: 160, shake: 10, col: ['#FFD43B', '#FF6B9D', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.6), s = grow(q, 0.15);
    g.globalAlpha = a * 0.35 * (1 - q); g.fillStyle = '#FFFFFF'; g.fillRect(-400, -400, 800, 800);   // the whole-screen flash
    g.globalAlpha = a; g.save(); g.rotate(-q * 0.8); for(let i = 0; i < 16; i++){ const an = i / 16 * TAU; g.fillStyle = alpha(i % 2 ? P.c[0] : P.c[1], 0.45); g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(an - 0.08) * 160 * s, Math.sin(an - 0.08) * 160 * s); g.lineTo(Math.cos(an + 0.08) * 160 * s, Math.sin(an + 0.08) * 160 * s); g.fill(); } g.restore();
    [0, 1, 2].forEach(i => { const qq = clamp(q * 1.2 - i * 0.12, 0, 1); ring(g, 10 + qq * (60 + i * 30), 5 * (1 - qq), alpha(i % 2 ? P.c[1] : P.c[0], 0.85)); }); glow(g, P.c[0], 22); star(g, 8, 26 * s, 10 * s, 0, P.c[2]); g.shadowBlur = 0;
    g.globalAlpha = 1; g.save(); g.translate(0, -58); word(g, q, this.word, P.c[0], 15, -0.05); g.restore(); }});
  def('power.heal', {name: 'Heal glow', icon: '💚', word: '+HEAL', ms: 1000, stop: 0, shake: 0, col: ['#51CF66', '#B2F2BB', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.65), s = grow(q, 0.25);
    g.globalAlpha = a * 0.8; const gr = g.createRadialGradient(0, 0, 2, 0, 0, 34 * s); gr.addColorStop(0, alpha(P.c[2], 0.6)); gr.addColorStop(1, alpha(P.c[0], 0)); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 34 * s, 0, TAU); g.fill(); g.globalAlpha = a;
    for(let i = 0; i < (P.calm ? 4 : 7); i++){ const x = Math.sin(i * 2.3) * 22, y = 20 - ((q * 60 + i * 12) % 60), w = 2.4, L = 6; g.fillStyle = i % 2 ? P.c[0] : P.c[1]; g.fillRect(x - w / 2, y - L / 2, w, L); g.fillRect(x - L / 2, y - w / 2, L, w); }
    g.globalAlpha = 1; g.save(); g.translate(18, -34); word(g, q, this.word, P.c[0], 10, 0); g.restore(); }});
  def('power.victory', {name: 'Victory sparkle', icon: '🏆', word: 'YAY!', ms: 1200, stop: 0, shake: 0, col: ['#FCC419', '#FF6B9D', '#FFFFFF'], draw(g, q, P){ const a = fade(q, 0.7), R = rnd(P.seed), C = ['#FF6B6B', '#FFD43B', '#69DB7C', '#4DABF7', '#B197FC', '#FF6B9D'];
    g.globalAlpha = a; for(let i = 0; i < (P.calm ? 12 : 26); i++){ const vx = (R() - 0.5) * 120, vy = -40 - R() * 60, x = vx * q, y = vy * q + 90 * q * q; g.save(); g.translate(x, y); g.rotate(q * 10 + i); g.fillStyle = C[i % 6]; g.fillRect(-2.4, -1.2, 4.8, 2.4); g.restore(); }
    glow(g, P.c[0], 14); star(g, 5, 14 * grow(q, 0.2), 6, -Math.PI / 2, P.c[0]); g.shadowBlur = 0; for(let i = 0; i < 5; i++) twinkle(g, Math.cos(i * 1.3) * 24, Math.sin(i * 1.3) * 18, 2.6, P.c[2]);
    g.globalAlpha = 1; g.save(); g.translate(0, -26); word(g, q, this.word, P.c[1], 12, 0); g.restore(); }});

  // ---------- the engine: live effects, shake, the move ↔ effect link ----------
  const O = {words: true, shake: true, calm: false};
  const live = []; let shakes = [];
  const now = () => performance.now() / 1000;
  function paletteFor(st, element){ return (element && EL[element]) || st.col; }
  function at(key, o){ o = o || {}; const st = S[key]; if(!st) return null; const t = o.t != null ? o.t : now();
    const e = {st, x: o.x || 0, y: o.y || 0, k: o.k || 1, dir: o.dir || 1, t0: t, P: {c: paletteFor(st, o.element), seed: o.seed || (Math.random() * 1e9) | 0, calm: O.calm || !!o.calm}};
    live.push(e); if(live.length > 24) live.shift();
    if(O.shake && !O.calm && st.shake && o.shake !== false) shakes.push({t0: t + (st.stop || 0) / 1000 * 0.3, a: st.shake * Math.min(1.4, o.k || 1) * 0.8, ms: 220});
    if(o.sound !== false && window.UISound && UISound.play) try{ UISound.play(st.shake >= 5 ? 'boom' : 'pop'); }catch(err){}
    return e; }
  function draw(g, t){ t = t != null ? t : now();
    for(let i = live.length - 1; i >= 0; i--){ const e = live[i], q = (t - e.t0) * 1000 / e.st.ms; if(q > 1){ live.splice(i, 1); continue; } if(q < 0) continue;
      g.save(); g.translate(e.x, e.y); g.scale(e.k * e.dir, e.k); try{ e.st.draw.call(e.st, g, q, e.P); }catch(err){} g.restore(); } }
  function drawPre(g, key, q, o){ const st = S[key]; if(!st || !st.pre) return; o = o || {}; g.save(); g.translate(o.x || 0, o.y || 0); g.scale((o.k || 1) * (o.dir || 1), o.k || 1); st.pre(g, clamp(q, 0, 1), {c: paletteFor(st, o.element), seed: o.seed || 1, calm: O.calm}); g.restore(); }
  function paint(g, key, q, o){ const st = S[key]; if(!st) return; o = o || {}; g.save(); g.translate(o.x || 0, o.y || 0); g.scale((o.k || 1) * (o.dir || 1), o.k || 1); st.draw.call(st, g, clamp(q, 0, 1), {c: paletteFor(st, o.element), seed: o.seed || 1, calm: O.calm || !!o.calm}); g.restore(); }   // stateless (pictures, tests)
  function shake(t){ t = t != null ? t : now(); let x = 0, y = 0; shakes = shakes.filter(s => (t - s.t0) * 1000 < s.ms);
    shakes.forEach(s => { const e = (t - s.t0) * 1000; if(e < 0) return; const d = 1 - e / s.ms, a = s.a * d * d; x += Math.sin(e * 0.09) * a; y += Math.cos(e * 0.13) * a * 0.6; }); return {x, y}; }
  // a move = the avatar's beat act (🎭 fx-moves) + its effect at the contact, at the act's hit point (avatar units → canvas)
  function play(who, moveKey, o){ o = o || {}; const A = window.Acting && Acting.act(moveKey); const fx = A && A.fx;
    const run = Acting.play(who, moveKey, Object.assign({}, o, {onContact: r => {
      if(fx && S[fx.key]){ const p = fx.at || [20, -38], k = o.k || 1, dir = o.dir || 1; r.fx = at(fx.key, {x: (o.x || 0) + p[0] * k * dir, y: (o.y || 0) + p[1] * k, k, dir, element: o.element, t: r.contactT, seed: o.seed}); }
      if(o.onContact) o.onContact(r); }}));
    run.fxKey = fx ? fx.key : null; return run; }
  const list = fam => Object.keys(S).filter(k => !fam || S[k].family === fam);
  // the reaction that fits a move (a game may pick its own): ActionFX.reactFor('move.punch.uppercut') → 'move.react.knockup'
  const REACT = {'punch.jab': 'flinch', 'punch.straight': 'bighit', 'punch.hook': 'spinout', 'punch.uppercut': 'knockup', 'punch.haymaker': 'knockback', 'punch.backfist': 'bighit', 'punch.palm': 'pushslide',
    'punch.elbow': 'bighit', 'punch.hammer': 'knockdown', 'punch.flurry': 'stagger', 'punch.charged': 'knockback', 'kick.front': 'knockback', 'kick.side': 'knockback', 'kick.roundhouse': 'spinout',
    'kick.spinback': 'knockback', 'kick.axe': 'knockdown', 'kick.sweep': 'knockdown', 'kick.flying': 'knockback', 'kick.stomp': 'dizzy',
    'slash.across': 'bighit', 'slash.cleave': 'knockdown', 'slash.rising': 'knockup', 'slash.diagdown': 'stagger', 'slash.diagup': 'knockup', 'slash.spin': 'spinout', 'slash.thrust': 'pushslide', 'slash.cross': 'knockback', 'slash.flurry': 'stagger',
    'slash.dash': 'spinout', 'slash.draw': 'dizzy', 'slash.chop': 'knockdown', 'jump.slash': 'knockdown', 'jump.thrust': 'knockdown', 'jump.pound': 'knockup', 'jump.aerialspin': 'spinout', 'jump.somersault': 'knockup', 'jump.knee': 'knockback',
    'jump.smash': 'knockdown', 'jump.rising': 'knockup', 'jump.upper': 'knockup', 'jump.wall': 'knockback', 'throw.overhand': 'bighit', 'throw.sidearm': 'stagger', 'throw.lob': 'dizzy', 'throw.spear': 'knockback', 'throw.jump': 'bighit',
    'throw.double': 'stagger', 'throw.boomerang': 'spinout', 'throw.bow': 'bighit', 'throw.sling': 'bighit', 'throw.bounce': 'knockup',
    'cast.skycall': 'bighit', 'cast.beam': 'knockback', 'cast.wide': 'pushslide', 'cast.raise': 'knockup', 'cast.bolt': 'dizzy', 'cast.sweep': 'spinout', 'cast.orb': 'knockback', 'cast.slam': 'knockup',
    'cast.spin': 'spinout', 'cast.snap': 'flinch', 'cast.staff': 'bighit', 'cast.rune': 'frozen', 'cast.orbthrow': 'knockback', 'cast.blast': 'knockback', 'cast.rain': 'dizzy', 'defend.bash': 'knockback',
    'power.combo': 'knockdown', 'power.ultimate': 'knockup'};
  const NO_TARGET = ['cast.pray', 'defend.block', 'defend.parry', 'defend.brace', 'defend.roll', 'defend.sidestep', 'defend.backflip', 'defend.bubble', 'power.aura', 'power.levelup', 'power.heal', 'power.victory'];   // self moves: nobody is hit
  const reactFor = moveKey => { const k = String(moveKey).replace(/^move\./, ''); return NO_TARGET.indexOf(k) >= 0 ? null : 'move.react.' + (REACT[k] || 'bighit'); };   // null = a self move (defend / heal / aura …)
  const FAM = {punch: ['👊', 'Punch'], kick: ['🦶', 'Kick'], slash: ['⚔️', 'Slash'], jump: ['🦘', 'Jump attack'], throw: ['🎯', 'Throw'], cast: ['🪄', 'Cast'], defend: ['🛡️', 'Defend'], power: ['🌟', 'Power-up'], react: ['💥', 'Hit + knock']};
  window.ActionFX = {VERSION: 'fx-1c', opts: O, EL, FAM, STYLES: S, list, style: k => S[k], REACT, NO_TARGET, reactFor, at, draw, paint, drawPre, shake, play, clear: () => { live.length = 0; shakes = []; }, live: () => live.length};
})();
