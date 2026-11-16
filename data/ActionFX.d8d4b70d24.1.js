
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
    'kick.spinback': 'knockback', 'kick.axe': 'knockdown', 'kick.sweep': 'knockdown', 'kick.flying': 'knockback', 'kick.stomp': 'dizzy'};
  const reactFor = moveKey => { const k = String(moveKey).replace(/^move\./, ''); return 'move.react.' + (REACT[k] || 'bighit'); };
  const FAM = {punch: ['👊', 'Punch'], kick: ['🦶', 'Kick'], react: ['💥', 'Hit + knock']};
  window.ActionFX = {VERSION: 'fx-1a', opts: O, EL, FAM, STYLES: S, list, style: k => S[k], REACT, reactFor, at, draw, paint, drawPre, shake, play, clear: () => { live.length = 0; shakes = []; }, live: () => live.length};
})();
