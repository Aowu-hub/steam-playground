
/* 🌍 IsoLook_wonder — 🌌 wonder — WONDERS for any look (kind wonder ≤ 420 px): 🗼 Song Spire (the Great Gong's tower, 7 floating drums + note rings, n0 … n7 + song) · 👽 Eclipse Engine (impossible triangle · sun halo · water rains up, asleep · awake · eclipse) — def.wonder powers, see Props.wonders — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['wonder'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/wonder.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_wonder: include IsoProps first'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🌌 IsoLook_wonder — WONDERS: very tall towers + logic-defying megastructures for any map look (🌳 IsoProps chat, IP-7, Aowu 2026-11-20 18:15:
   "a high tower, the tall, very tall tower and also some epic massive infrastructure … interesting shape, weird looking, alien designed, defying logic; if the lore has a thing there, great").
   🌌 ip-7a: def.wonder = the power data (Props.POWERS · Props.wonders — the game makes the rules). Kind 'wonder' (NEW, height ≤ 420 px at zoom 1 — rule 6 grows one row: landmark ≤ 200 · wonder ≤ 420). Every wonder: floats or breaks a rule of the real world on purpose,
   has a live gimmick, glows only in fx parts (no baked dark ring), takes the map look's stone / trim / accent, and handles 🍂 dry + 🏚️ ruined (the magic stops: parts settle).
   Lore hooks (📚 Avateer Lore chat decides — Story Bible Lore 7 §B "The Song of the Realm"):
   🗼 wonder_spire  = the Song Spire — where the Great Gong hung; one floating NOTE RING per region lights when its 🎵 Realm Note comes home (states n0 … n7), 'song' = the finale (the gong's 8th note mends the crack)
   👽 wonder_engine = the Eclipse Engine — Moon Base's Rim Base sun-catcher on an impossible triangle: a halo of mirror petals bends a sunbeam round a corner into the dark crater, crater water rains UP into the halo
                      (Lore 7 §A2 "sun for power, ice for water") · states asleep · awake · eclipse (the finale: Earth covers the sun, a red-orange ring) */
const D = PD, M = MAT, TAU = Math.PI * 2, S2 = Math.SQRT2, ph = (t, p) => ((t || 0) / p) * TAU;
addSet('wonder', {name: 'Wonders', icon: '🌌', accent: '#B79CFF'});
const stoneOf = L => (L && L.key === 'snow') ? '#C9D3DE' : (L && L.key === 'desert') ? '#E2C08A' : (L && L.key === 'moon') ? '#B8B4C8' : (L && L.key === 'lava') ? '#7A6A6E' : (L && L.key === 'cherry') ? '#D8CFC6' : '#BFB5A4';
// the 7 regions of the saga, in story order (Story Bible §5.6): one colour per Realm Note
const NOTES = [['Elephant Jungle', '#3FC16A'], ['Cherry Mountain', '#FF8FB8'], ['Pyramid Sands', '#F2B33D'], ['Aurora North', '#7FD8FF'], ['Lava Isles', '#FF6A3D'], ['Coral Coast', '#2FD3C8'], ['Moon Base', '#B79CFF']];
const ring = (P, cx, cy, z, r, n, a0) => { const pts = []; for(let i = 0; i <= n; i++){ const a = (a0 || 0) + i / n * TAU; pts.push([P(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z), a]); } return pts; };
// far half of a flat ring = the points whose (x + y) is smaller than the centre's (they sit behind the shaft on screen)
const far = a => Math.cos(a) + Math.sin(a) < 0;
function noteGlyph(g, x, y, s, col){ g.fillStyle = col; g.strokeStyle = col; g.lineWidth = Math.max(1, s * 0.22); g.beginPath(); g.ellipse(x, y, s * 0.55, s * 0.4, -0.45, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(x + s * 0.48, y - s * 0.12); g.lineTo(x + s * 0.48, y - s * 1.7); g.quadraticCurveTo(x + s * 1.2, y - s * 1.35, x + s * 1.05, y - s * 0.75); g.stroke(); }

/* ───────────── 🗼 the SONG SPIRE (2 × 2, 380 px) ─────────────
   a square stone gate-block (the door, rule 12) → SEVEN stone drums that float one above the other with nothing holding them (a thin light seam in each gap),
   each drum a little off-centre like a balanced cairn · one NOTE RING per gap, turning (odd rings one way, even rings the other) — grey stone until its Realm Note is home,
   then its region's colour + a bead of light running round + small drawn ♪ drifting up · at the top a crescent yoke holds the cracked Great Gong (sways) → 'song' = the crack fills with gold, rays.
   🍂 dry = dim seams · 🏚️ ruined = the magic is off: the drums have dropped onto each other (no gaps), rings rest tilted on the drums, the gong hangs crooked. */
const SP = [ // [z, h, r0, r1, dx, dy] — the floating drums, bottom → top (gaps ≈ 12 px; drum 3 is TOP-HEAVY: it balances on its narrow end)
  [69, 40, 0.44, 0.39, 0, 0], [121, 36, 0.37, 0.34, 0.04, -0.03], [169, 32, 0.22, 0.34, -0.03, 0.04], [213, 30, 0.29, 0.25, 0.03, 0.03], [255, 26, 0.25, 0.21, -0.04, -0.02], [293, 22, 0.21, 0.17, 0.02, -0.04], [327, 18, 0.17, 0.13, -0.02, 0.02]];
(function(){ const def = add('wonder', 'wonder_spire', {name: 'Song Spire', foot: [2, 2], h: 400, kind: 'wonder', block: true, door: [1, 2],
    states: ['n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'song'], state: 'n0', wonder: {power: 'rally', family: 'boost', kind: 'timed', occupy: 25, secs: 45, saga: true, lean: []}, live: {period: 2.4, frames: 8}, aim: [1, 1, 372], touchAt: [1, 1, 60], tags: ['wonder', 'tower', 'tall', 'saga', 'landmark'],
    diffs: [{by: 'state', a: 'n0', b: 'n3', level: 'bold', name: 'rings lit'}, {by: 'state', a: 'n7', b: 'song', level: 'bold', name: 'gong mended'}]});
  def.notesOf = st => st === 'song' ? 7 : Math.max(0, Math.min(7, parseInt(String(st || 'n0').slice(1), 10) || 0));
  def.build = (B, v, L) => { const c = L.cond, ruined = !!(c && c.holes), dry = !!(c && !c.holes && c.key !== 'fresh'), st = stoneOf(L), st2 = sh(st, -0.12), trim = L.trim || '#5A3418', acc = L.accent || '#F2B731',
      lit0 = def.notesOf(L.state), song = L.state === 'song', magic = !ruined;
    // 🧱 the gate-block (grid corners, rule 1): a low plinth + the block with its arched door on the front (+y) and a slit window each side
    B.box(0.06, 0.06, 0, 1.88, 1.88, 8, st2, {trim: 0});
    const blk = B.box(0.3, 0.3, 8, 1.4, 1.4, 44, st, {trim: 11}); B.door(blk, 'front', 0.78, 0.44, 40); B.win(blk, 'right', 0.86, 0.28, 22, 12); B.win(blk, 'front', 0.36, 0.2, 24, 10); B.win(blk, 'front', 1.44, 0.2, 24, 10);
    B.box(0.24, 0.24, 52, 1.52, 1.52, 5, st2, {trim: 0});   // a cap ledge
    [[0.24, 0.24], [1.62, 0.24], [0.24, 1.62], [1.62, 1.62]].forEach(([x, y]) => B.box(x, y, 57, 0.14, 0.14, 7, st2, {trim: 0}));   // 4 little corner merlons
    // 🪨 three pebbles float round the gate-block (they never fall)
    [[0.05, 0.6, 30, 0], [1.95, 0.5, 44, 2.1], [1.2, 1.98, 36, 4.2]].forEach(([x, y, z, o2], i) => B.custom(x, y, (g, P, k, t) => { const bob = magic ? Math.sin(ph(t, 2.4) + o2) * 2.5 + Math.cos(ph(t, 2.4) * 2 + o2) * 0.6 : -z + 3, q = P(x, y, z + bob), r = (3.2 + i * 0.6) * k;
      g.fillStyle = D.rad(g, q[0] - r * 0.4, q[1] - r * 0.4, 0.5, r * 1.4, [[0, sh(st, 0.3)], [1, sh(st, -0.2)]]); g.beginPath(); g.ellipse(q[0], q[1], r * 1.2, r, 0.3, 0, TAU); g.fill();
      if(magic){ const s0 = P(x, y, 0); g.fillStyle = 'rgba(42,28,20,0.16)'; g.beginPath(); g.ellipse(s0[0], s0[1], r, r * 0.45, 0, 0, TAU); g.fill(); } }, {layer: 3}));
    // 🌀 the floating stack (ONE painter, bottom → top, so every ring's far half is under its drum and its near half over it)
    B.custom(1, 1, (g, P, k, t) => { const a = ph(t, 2.4), drop = ruined ? 1 : 0;
      let zAcc = 57, lastTop = 0;   // ruined: drums sit straight on each other · lastTop = where the top drum ends this frame
      SP.forEach(([z, h, r0, r1, dx, dy], i) => { const bob = magic ? (Math.sin(a + i * 0.9) + Math.cos(a * 2 + i * 1.7) * 0.35) * 2.2 : 0, zz = drop ? zAcc : z + bob; if(drop) zAcc += h - 1;
        const cx = 1 + (drop ? dx * 0.4 : dx), cy = 1 + (drop ? dy * 0.4 : dy), on = i < lit0, col = NOTES[i][1], rr = Math.max(r0, r1) + 0.19, rz = zz + h * 0.42; lastTop = zz + h;
        const ringCol = on ? col : sh(st, -0.28), ringLit = on && !dry;
        const tiltR = drop ? 0.12 : 0;   // a ruined ring rests tilted on its drum
        const RP = (x, y, z2) => P(x, y, z2 + (drop ? (x - cx) * 60 * tiltR : 0));
        const pts = ring(RP, cx, cy, rz, rr, 40, (i % 2 ? -1 : 1) * a * 0.25);
        const band = (keep, w, colr) => { g.strokeStyle = colr; g.lineWidth = w * k; g.lineCap = 'round'; g.beginPath(); let pen = false; pts.forEach(([q, an]) => { if(keep(an)){ pen ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); pen = true; } else pen = false; }); g.stroke(); };
        // far half of the ring (behind the drum)
        band(far, 4.2, sh(ringCol, -0.25)); band(far, 2, sh(ringCol, 0.1));
        // the drum (T.frustum = the kit's lit cut-cone, light from the upper left like the tiles)
        T.frustum(g, P, k, cx, cy, zz, r0, r1, h, st, {topFill: sh(st, 0.3)});
        // carved band + notches on each drum (makes them read as worked stone, and shows the slow turn)
        g.strokeStyle = 'rgba(42,28,20,0.22)'; g.lineWidth = 1 * k; const c0 = P(cx, cy, zz + h * 0.55), ra = (r0 + r1) / 2 * HTW * k * S2; g.beginPath(); g.ellipse(c0[0], c0[1], ra, ra / 2, 0, 0, Math.PI); g.stroke();
        for(let n = 0; n < 5; n++){ const an = n / 5 * Math.PI + (magic ? a * 0.12 * (i % 2 ? -1 : 1) : 0), xx = c0[0] + Math.cos(an) * ra; g.beginPath(); g.moveTo(xx, c0[1] + Math.sin(an) * ra / 2 - h * 0.2 * k); g.lineTo(xx, c0[1] + Math.sin(an) * ra / 2 + h * 0.18 * k); g.stroke(); }
        // the region's mark on the drum's front: a small dot stone (lit = its colour)
        const mk = P(cx + 0.04, cy + (r0 + r1) / 2 * 0.95, zz + h * 0.8); g.fillStyle = on ? col : sh(st, -0.2); g.beginPath(); g.arc(mk[0], mk[1], 2.4 * k, 0, TAU); g.fill();
        // near half of the ring (in front of the drum)
        band(an => !far(an), 4.2, sh(ringCol, -0.25)); band(an => !far(an), 2, sh(ringCol, ringLit ? 0.25 : 0.1));
        // ring teeth (tick marks) that travel = the ring turns
        g.fillStyle = sh(ringCol, ringLit ? 0.55 : -0.05); pts.forEach(([q, an], j) => { if(j % 5 || far(an)) return; g.beginPath(); g.arc(q[0], q[1], 1.1 * k, 0, TAU); g.fill(); });
      });
      // ☾ the crescent cradle sits on the top drum (bobs with it) and holds the Great Gong between its horns (faces the front, rocks gently)
      const top = lastTop, sway = magic ? Math.sin(a) * 0.05 + Math.cos(a * 2) * 0.02 : 0.22, cx6 = 1 + SP[6][4], cy6 = 1 + SP[6][5];
      const cb = P(cx6, cy6, top), u0 = P(cx6 + 1, cy6, top), hw = Math.hypot(u0[0] - cb[0], u0[1] - cb[1]), ex = (u0[0] - cb[0]) / hw, ey = (u0[1] - cb[1]) / hw;
      const Cq = (u, v) => [cb[0] + ex * u * k, cb[1] + ey * u * k - v * k];   // u, v in px at zoom 1 (u along the gong plane, v up) — the plane turns with the prop
      // a short stem, then the crescent (outer r 25 round (0, 30) · inner r 17 round (0, 33)) — horns up
      g.fillStyle = sh(trim, -0.15); g.beginPath(); const s0 = Cq(-4, 0), s1 = Cq(4, 0), s2 = Cq(3, 7), s3 = Cq(-3, 7); g.moveTo(s0[0], s0[1]); g.lineTo(s1[0], s1[1]); g.lineTo(s2[0], s2[1]); g.lineTo(s3[0], s3[1]); g.closePath(); g.fill();
      const N = 20; g.beginPath(); for(let j = 0; j <= N; j++){ const th = j / N * Math.PI, q = Cq(25 * Math.cos(th), 30 - 25 * Math.sin(th)); j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }
      for(let j = N; j >= 0; j--){ const th = j / N * Math.PI, q = Cq(17 * Math.cos(th), 33 - 17 * Math.sin(th)); g.lineTo(q[0], q[1]); }
      g.closePath(); g.fillStyle = D.lin(g, cb[0] - 25 * k, cb[1], cb[0] + 25 * k, cb[1], [[0, sh(trim, 0.3)], [0.5, sh(trim, 0.08)], [1, sh(trim, -0.22)]]); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = k; g.stroke();
      [-1, 1].forEach(sd => { const q = Cq(sd * 21, 31); g.fillStyle = acc; g.beginPath(); g.arc(q[0], q[1], 3 * k, 0, TAU); g.fill(); });   // gold caps on the horns
      // the Great Gong (a gold disc in the gong plane, rocking a little) — its crack is why the song broke · 'song' = the crack fills with light
      const gc = Cq(Math.sin(sway) * 3, 30), R = 15 * k, lean = Math.atan2(ey, ex);
      g.save(); g.translate(gc[0], gc[1]); g.rotate(lean * 0.5 + sway); g.scale(0.84, 1);
      g.fillStyle = D.rad(g, -R * 0.35, -R * 0.35, 1, R * 1.3, [[0, '#FFF0B0'], [0.45, '#F2B731'], [1, '#B8760E']]); g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 1 * k; g.beginPath(); g.arc(0, 0, R * 0.64, 0, TAU); g.stroke();
      g.fillStyle = '#E8A21E'; g.beginPath(); g.arc(0, 0, R * 0.3, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.arc(-R * 0.08, -R * 0.1, R * 0.11, 0, TAU); g.fill();
      g.strokeStyle = song ? '#FFFBE6' : '#3A2412'; g.lineWidth = (song ? 2.2 : 1.6) * k; g.lineJoin = 'round'; g.beginPath(); [[-0.12, -1], [0.06, -0.62], [-0.1, -0.3], [0.16, 0.05], [-0.02, 0.4], [0.2, 0.74]].forEach(([x, y], j) => j ? g.lineTo(x * R, y * R) : g.moveTo(x * R, y * R)); g.stroke();
      g.restore(); }, {layer: 2});
    // ✨ fx (painted after the rim): light seams in the gaps · lit rings glow + a bead of light runs round each · drawn ♪ drift up · the gong's warm glow / 'song' rays
    if(magic) B.custom(1, 1, (g, P, k, t) => { const a = ph(t, 2.4), seamA = dry ? 0.25 : 0.6;
      SP.forEach(([z, h, r0, r1, dx, dy], i) => { const bob = (Math.sin(a + i * 0.9) + Math.cos(a * 2 + i * 1.7) * 0.35) * 1.6, cx = 1 + dx, cy = 1 + dy, on = i < lit0, col = NOTES[i][1];
        // the seam of light under each drum (where it floats)
        const below = i ? SP[i - 1][0] + SP[i - 1][1] + (Math.sin(a + (i - 1) * 0.9) + Math.cos(a * 2 + (i - 1) * 1.7) * 0.35) * 2.2 : 57, gapM = (below + z + bob) / 2, s0 = P(cx, cy, gapM), sr = Math.min(r0, i ? SP[i - 1][3] : 0.5) * HTW * k * S2, gh = Math.max(3, z + bob - below) * k;
        g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = D.rad(g, s0[0], s0[1], 0, sr * 1.1, [[0, D.rgba(on ? col : '#FFF4C8', seamA)], [1, D.rgba(on ? col : '#FFF4C8', 0)]]); g.beginPath(); g.ellipse(s0[0], s0[1], sr * 1.1, gh * 0.75 + sr * 0.2, 0, 0, TAU); g.fill();
        g.fillStyle = D.rgba('#FFFFFF', seamA * 0.8); g.beginPath(); g.ellipse(s0[0], s0[1], sr * 0.55, Math.max(1, gh * 0.22), 0, 0, TAU); g.fill(); g.restore();
        if(!on || dry) return;
        const rr = Math.max(r0, r1) + 0.19, rz = z + bob + h * 0.42, spd = (i % 2 ? -1 : 1), b1 = a * spd + i, q = P(cx + Math.cos(b1) * rr, cy + Math.sin(b1) * rr, rz);
        D.glow(g, q[0], q[1], 7 * k, col, 0.85); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(q[0], q[1], 1.6 * k, 0, TAU); g.fill();
        const cc = P(cx, cy, rz); D.glow(g, cc[0] + rr * HTW * k * S2 * 0.6, cc[1], 9 * k, col, 0.35); D.glow(g, cc[0] - rr * HTW * k * S2 * 0.6, cc[1], 9 * k, col, 0.35);
        // a small ♪ drifts up from each lit ring (drawn, rule 7) and fades
        const f = ((t || 0) / 2.4 + i * 0.37) % 1, gx = cc[0] + (i % 2 ? 1 : -1) * (rr * HTW * k * S2 + 4 * k) + Math.sin(f * TAU) * 2 * k, gy = cc[1] - f * 26 * k;
        g.save(); g.globalAlpha = Math.sin(f * Math.PI) * 0.95; noteGlyph(g, gx, gy, 3.4 * k, '#FFFFFF'); g.globalAlpha *= 0.85; D.glow(g, gx, gy - 2 * k, 6 * k, col, 0.6); g.restore(); });
      const top = SP[6][0] + SP[6][1] + (Math.sin(a + 6 * 0.9) + Math.cos(a * 2 + 6 * 1.7) * 0.35) * 2.2, gc = P(1 + SP[6][4], 1 + SP[6][5], top + 30), pulse = 1 + 0.08 * Math.sin(a) + 0.04 * Math.cos(a * 2);
      if(song){ g.save(); g.globalCompositeOperation = 'lighter'; for(let r = 0; r < 12; r++){ const an = r / 12 * TAU + a * 0.2; g.strokeStyle = D.rgba('#FFE58A', 0.5); g.lineWidth = 2 * k; g.beginPath(); g.moveTo(gc[0] + Math.cos(an) * 16 * k, gc[1] + Math.sin(an) * 16 * k); g.lineTo(gc[0] + Math.cos(an) * 34 * k * pulse, gc[1] + Math.sin(an) * 34 * k * pulse); g.stroke(); } g.restore();
        D.glow(g, gc[0], gc[1], 46 * k * pulse, '#FFE58A', 0.7); }
      else if(lit0 > 0) D.glow(g, gc[0], gc[1], (18 + lit0 * 2.5) * k * pulse, '#FFE58A', 0.22 + lit0 * 0.04);
      // the door's soft light (someone is home)
      const dp = P(1.0, 1.72, 18); D.glow(g, dp[0], dp[1], 14 * k, '#FFD98A', 0.35); }, {fx: true, layer: 9});
  }; })();

/* ───────────── 👽 the ECLIPSE ENGINE (3 × 3, 300 px) ─────────────
   an IMPOSSIBLE TRIANGLE stands on a round stone apron (three square beams that each go behind the next — it can't exist, and yet the robots walk round it) ·
   above it floats a HALO of 12 mirror petals round a small captured sun · its sunbeam falls straight down, then TURNS A CORNER and runs along the ground into the dark crater bowl at the front-right ·
   the crater's ice water rains UP in a ribbon of drops into the halo (no sun → no power · no ice → no water: the base needs both) · four stepping stones float round the triangle and loop back to the start.
   asleep = petals folded shut, the sun a dim ember, the crater frozen, no beam · awake = petals open + turning, the beam on, drops rising · eclipse = Earth slides in front of the sun: a dark disc with a red-orange ring, the petals glow red, everything else hushed.
   🍂 dry = dim · 🏚️ ruined = the halo has dropped onto the triangle (tilted), petals scattered, the crater dry. */
(function(){ const def = add('wonder', 'wonder_engine', {name: 'Eclipse Engine', foot: [3, 3], h: 300, kind: 'wonder', block: true, door: [0, 3],
    states: ['asleep', 'awake', 'eclipse'], state: 'asleep', wonder: {power: 'reveal', family: 'see', kind: 'timed', occupy: 30, secs: 20, saga: true, lean: ['moon']}, liveStates: ['awake', 'eclipse'], live: {period: 3.2, frames: 8}, aim: [1.5, 1.5, 236], touchAt: [1.5, 1.5, 236], tags: ['wonder', 'megastructure', 'alien', 'moon', 'saga', 'landmark'],
    touch: {light: 'awake', fire: 'awake', shadow: {to: 'asleep', from: ['awake']}},
    diffs: [{by: 'state', a: 'asleep', b: 'awake', level: 'bold', name: 'engine on'}, {by: 'state', a: 'awake', b: 'eclipse', level: 'bold', name: 'eclipse'}]});
  def.build = (B, v, L) => { const c = L.cond, ruined = !!(c && c.holes), dry = !!(c && !c.holes && c.key !== 'fresh'), st = stoneOf(L), st2 = sh(st, -0.14), trim = L.trim || '#3A4256', acc = L.accent || '#FFD23F',
      S = L.state || 'asleep', awake = S === 'awake' && !ruined, ecl = S === 'eclipse' && !ruined, metal = '#9AA6C2';
    // the round stone apron + the crater bowl dug into its front-right (blue ice / water / dust)
    B.custom(1.5, 1.5, (g, P, k) => { const c0 = P(1.5, 1.5, 0), a = 1.42 * HTW * k * S2; g.fillStyle = sh(st, -0.06); g.beginPath(); g.ellipse(c0[0], c0[1] + 2 * k, a, a / 2, 0, 0, TAU); g.fill();
      g.fillStyle = sh(st, 0.16); g.beginPath(); g.ellipse(c0[0], c0[1] - 3 * k, a * 0.96, a * 0.48, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.26)'; g.lineWidth = k; g.stroke();
      // rim rings + 12 inlaid tiles (alien glyph paving)
      g.strokeStyle = 'rgba(42,28,20,0.16)'; g.beginPath(); g.ellipse(c0[0], c0[1] - 3 * k, a * 0.72, a * 0.36, 0, 0, TAU); g.stroke();
      for(let i = 0; i < 12; i++){ const an = i / 12 * TAU, q = [c0[0] + Math.cos(an) * a * 0.84, c0[1] - 3 * k + Math.sin(an) * a * 0.42]; g.fillStyle = i % 3 ? sh(st, -0.04) : sh(acc, -0.1); g.beginPath(); g.ellipse(q[0], q[1], 4 * k, 2 * k, 0, 0, TAU); g.fill(); }
      // the crater (front-right)
      const cr = P(2.45, 0.75, 0), ca = 0.5 * HTW * k * S2; g.fillStyle = '#2A2F45'; g.beginPath(); g.ellipse(cr[0], cr[1] - 2 * k, ca, ca / 2, 0, 0, TAU); g.fill();
      g.fillStyle = ruined ? '#4A4458' : (awake || ecl) ? '#3FB6E8' : '#BFE6FF'; g.beginPath(); g.ellipse(cr[0], cr[1] - 1 * k, ca * 0.74, ca * 0.34, 0, 0, TAU); g.fill();
      if(!awake && !ruined){ g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1 * k; [[-0.4, -0.05, 0.1, 0.1], [0.05, -0.12, 0.45, 0.05]].forEach(([x0, y0, x1, y1]) => { g.beginPath(); g.moveTo(cr[0] + x0 * ca, cr[1] + y0 * ca); g.lineTo(cr[0] + x1 * ca, cr[1] + y1 * ca); g.stroke(); }); }   // frozen = cracks in the ice
      g.strokeStyle = sh(st, 0.3); g.lineWidth = 2 * k; g.beginPath(); g.ellipse(cr[0], cr[1] - 2 * k, ca, ca / 2, 0, Math.PI * 0.05, Math.PI * 0.95); g.stroke(); }, {layer: -2});
    // 🔺 the IMPOSSIBLE TRIANGLE (a real Penrose triangle, built from three square beams): beam 1 runs along +x, beam 2 along +y, beam 3 straight UP by 32 × L px.
    //   In this iso view those three moves cancel out on screen, so beam 3's top lands exactly on beam 1's start square — then beam 1's start is painted once more ON TOP:
    //   the far beam now seems to sit in front of the near one. It floats above the apron with nothing holding it. Built in WORLD space (it is an optical trick: it only closes
    //   from the camera's side), so every turn shows the same impossible shape — the apron, crater, stones and halo still turn.
    B.custom(1.5, 1.5, (g, P, k) => { const c0 = P(1.5, 1.5, 0), EX = [32 * k, 16 * k], EY = [-32 * k, 16 * k], Q = (x, y, z) => [c0[0] + (x - 1.5) * EX[0] + (y - 1.5) * EY[0], c0[1] + (x - 1.5) * EX[1] + (y - 1.5) * EY[1] - z * k];
      const L3 = 2.4, w = 0.42, wz = 32 * w, x0 = 0.04, y0 = 0.56, z0 = ruined ? 0 : 70, C = lit(metal), glyph = awake ? '#9FF3FF' : ecl ? '#FF8A5A' : sh(metal, -0.38);
      const quad = (pts, col) => { g.beginPath(); pts.forEach((q, j) => j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = 'rgba(42,28,20,0.28)'; g.lineWidth = Math.max(0.8, k); g.lineJoin = 'round'; g.stroke(); };
      const box = (x, y, z, bw, bd, bh, faces) => { faces = faces || 'LRT';
        if(faces.indexOf('L') >= 0) quad([Q(x, y + bd, z), Q(x + bw, y + bd, z), Q(x + bw, y + bd, z + bh), Q(x, y + bd, z + bh)], C.L);   // +y face
        if(faces.indexOf('R') >= 0) quad([Q(x + bw, y, z), Q(x + bw, y + bd, z), Q(x + bw, y + bd, z + bh), Q(x + bw, y, z + bh)], C.R);   // +x face
        if(faces.indexOf('T') >= 0) quad([Q(x, y, z + bh), Q(x + bw, y, z + bh), Q(x + bw, y + bd, z + bh), Q(x, y + bd, z + bh)], C.top); };
      const dots = (pts) => pts.forEach(q => { g.fillStyle = glyph; g.beginPath(); g.arc(q[0], q[1], 1.9 * k, 0, TAU); g.fill(); });
      if(ruined){ // the magic is off: three beams lie on the apron, nothing impossible any more
        box(x0, y0 + 0.9, 0, L3, w, wz); box(x0 + 1.5, y0, 0, w, L3 * 0.8, wz); box(x0 + 0.3, y0 + 0.2, 0, L3 * 0.7, w, wz); return; }
      const xL = x0 + L3 - w, yL = y0 + L3 - w, ztop = z0 + 32 * L3;
      box(x0, y0, z0, L3, w, wz);                                   // beam 1 (along +x, at the back)
      dots([0.3, 0.55, 0.8].map(u => Q(x0 + L3 * u, y0 + w, z0 + wz / 2)));
      box(xL, y0, z0, w, L3, wz);                                   // beam 2 (along +y)
      dots([0.3, 0.55, 0.8].map(u => Q(xL + w, y0 + L3 * u, z0 + wz / 2)));
      box(xL, yL, z0, w, w, ztop - z0 + wz - 32 * w);               // beam 3 (straight up from the near corner)
      dots([0.3, 0.55, 0.8].map(u => Q(xL + w, yL + w * 0.5, z0 + (ztop - z0) * u)));
      // the trick: beam 1's start, painted again over beam 3's top (its +y face and top only — no seam across the beam)
      box(x0, y0, z0, w * 1.02, w, wz, 'LT');
      // a soft shadow ring on the apron under the floating triangle
      const sc = Q(x0 + L3 * 0.6, y0 + L3 * 0.6, 0); g.fillStyle = 'rgba(42,28,20,0.14)'; g.beginPath(); g.ellipse(sc[0], sc[1], 38 * k, 14 * k, 0, 0, TAU); g.fill(); }, {layer: 1});
    // 🪨 four stepping stones that float round the triangle and loop back (a stair to nowhere — or to the start)
    [[2.55, 2.55, 10], [1.3, 2.62, 26], [0.1, 2.6, 42], [2.62, 1.4, 58]].forEach(([x, y, z], i) => { const s = B.box(x, y, ruined ? 0 : z, 0.34, 0.34, 6, i % 2 ? st : st2, {trim: 0, layer: 3});
      if(!ruined) B.custom(x + 0.18, y + 0.18, (g, P, k) => { const q = P(x + 0.18, y + 0.18, 0); g.fillStyle = 'rgba(42,28,20,0.16)'; g.beginPath(); g.ellipse(q[0], q[1], 7 * k, 3.5 * k, 0, 0, TAU); g.fill(); }, {layer: -1}); });
    // 💍 the HALO of mirror petals + the captured sun + the bent beam + rising drops (one painter: far petals → sun → near petals)
    B.custom(1.5, 1.5, (g, P, k, t) => { const a = ph(t, 3.2), hz = ruined ? 120 : 236, tilt = ruined ? 0.5 : 0, cw = P(1.5, 1.5, 0), c0 = [cw[0] + 0.22 * 32 * k, cw[1] + 0.22 * 16 * k - hz * k], R = 64 * k, Ry = 28 * k, N = 12, open = awake ? 1 : ecl ? 0.9 : 0.25, spin = (awake ? a / 6 : 0) + (ecl ? a / 14 : 0);
      g.save(); g.translate(c0[0], c0[1]); g.rotate(tilt * 0.4);
      const petal = (i, front) => { const an = i / N * TAU + spin, sn = Math.sin(an); if((sn > 0) !== front) return;   // sin > 0 = the near half
        const x = Math.cos(an) * R, y = sn * Ry, w = (7 + open * 9) * k, h = (12 + open * 10) * k, rot = an + Math.PI / 2, mirrorA = '#E8F4FF', mirrorB = '#7E8FB8';
        g.save(); g.translate(x, y); g.rotate(Math.cos(an) * 0.35); g.scale(1, 0.6 + 0.4 * Math.abs(sn));
        g.beginPath(); g.moveTo(0, -h); g.quadraticCurveTo(w, -h * 0.2, 0, h * 0.6); g.quadraticCurveTo(-w, -h * 0.2, 0, -h); g.closePath();
        g.fillStyle = D.lin(g, -w, -h, w, h, ecl ? [[0, '#FFB08A'], [1, '#7A3A4A']] : awake ? [[0, mirrorA], [0.5, '#BFD4F4'], [1, mirrorB]] : [[0, '#B8BCC8'], [1, '#6E7488']]); g.fill();
        g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = k; g.stroke(); if(awake){ g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(-w * 0.3, -h * 0.6); g.lineTo(w * 0.1, -h * 0.1); g.stroke(); }
        g.restore(); };
      // the thin ring the petals hang on
      const hoop = (front) => { g.strokeStyle = sh(trim, 0.1); g.lineWidth = 2.6 * k; g.beginPath(); g.ellipse(0, 0, R, Ry, 0, front ? 0 : Math.PI, front ? Math.PI : TAU); g.stroke(); };
      hoop(false); for(let i = 0; i < N; i++) petal(i, false);
      // the captured sun (asleep = a dim ember · awake = gold · eclipse = Earth's dark disc in front of it)
      const sr = 13 * k; g.fillStyle = ecl ? '#1E1A2E' : awake ? D.rad(g, -sr * 0.3, -sr * 0.3, 1, sr * 1.2, [[0, '#FFFBE0'], [0.5, '#FFD23F'], [1, '#F08A1C']]) : D.rad(g, -sr * 0.3, -sr * 0.3, 1, sr, [[0, '#C9A27A'], [1, '#6E4A3A']]);
      g.beginPath(); g.arc(0, 0, sr, 0, TAU); g.fill(); if(ecl){ g.strokeStyle = '#3A3A5A'; g.lineWidth = k; g.stroke(); }
      // 4 thin spokes from the hoop to the sun
      g.strokeStyle = sh(trim, 0.2); g.lineWidth = 1.2 * k; [0, 1, 2, 3].forEach(j => { const an = j / 4 * TAU + spin + 0.4; g.beginPath(); g.moveTo(Math.cos(an) * sr, Math.sin(an) * sr * 0.6); g.lineTo(Math.cos(an) * R, Math.sin(an) * Ry); g.stroke(); });
      for(let i = 0; i < N; i++) petal(i, true); hoop(true);
      g.restore(); }, {layer: 6});
    // ✨ fx: the bent sunbeam · drops raining UP from the crater · the sun's glow / the eclipse's red-orange ring · glyph glows
    if(!ruined) B.custom(1.5, 1.5, (g, P, k, t) => { const a = ph(t, 3.2), hz = 236, cw = P(1.5, 1.5, 0), Q = (x, y, z) => [cw[0] + ((x - 1.5) - (y - 1.5)) * 32 * k, cw[1] + ((x - 1.5) + (y - 1.5)) * 16 * k - z * k], c0 = Q(1.72, 1.5, hz), dim = dry ? 0.45 : 1;
      if(awake){ // the beam: straight down from the sun to z 34, then a sharp 90° turn along +x (screen down-right) into the crater
        const knee = Q(1.72, 1.5, 40), endq = P(2.45, 0.75, 4), shimmer = 0.85 + 0.15 * Math.sin(a * 3) + 0.05 * Math.cos(a * 2);
        g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'miter';
        [[16, 0.16], [9, 0.32], [4, 0.75]].forEach(([w, al]) => { g.strokeStyle = D.rgba('#FFE58A', al * shimmer * dim); g.lineWidth = w * k; g.beginPath(); g.moveTo(c0[0], c0[1] + 12 * k); g.lineTo(knee[0], knee[1]); g.lineTo(endq[0], endq[1]); g.stroke(); });
        // a little burst of light where the beam turns its corner + where it lands
        D.glow(g, knee[0], knee[1], 16 * k, '#FFE58A', 0.7 * dim); D.glow(g, endq[0], endq[1], 20 * k, '#9FF3FF', 0.6 * dim); g.restore();
        // drops rain UP from the crater into the halo (a soft ribbon + bright drops that loop)
        const cr = P(2.45, 0.75, 0), top = [c0[0] + 40 * k, c0[1] + 8 * k];
        g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = D.rgba('#7FD8FF', 0.22 * dim); g.lineWidth = 10 * k; g.beginPath(); g.moveTo(cr[0], cr[1] - 4 * k); g.bezierCurveTo(cr[0] + 14 * k, cr[1] - 60 * k, top[0] + 30 * k, top[1] + 60 * k, top[0], top[1]); g.stroke(); g.restore();
        for(let i = 0; i < 9; i++){ const f = ((t || 0) / 3.2 * 2 + i / 9) % 1, u = 1 - f, bx = u * u * u * cr[0] + 3 * u * u * f * (cr[0] + 14 * k) + 3 * u * f * f * (top[0] + 30 * k) + f * f * f * top[0], by = u * u * u * (cr[1] - 4 * k) + 3 * u * u * f * (cr[1] - 60 * k) + 3 * u * f * f * (top[1] + 60 * k) + f * f * f * top[1];
          g.fillStyle = D.rgba('#E8FAFF', 0.9 * dim); g.beginPath(); g.ellipse(bx + Math.sin(f * 9 + i) * 2 * k, by, 1.6 * k, 2.4 * k, 0, 0, TAU); g.fill(); D.glow(g, bx, by, 4 * k, '#7FD8FF', 0.5 * dim); }
        D.glow(g, c0[0], c0[1], 40 * k * (1 + 0.06 * Math.sin(a) + 0.03 * Math.cos(a * 2)), '#FFD23F', 0.6 * dim);
        // three tethers of light hold the halo over the triangle's corners (nothing else does)
        [[0.25, 0.77, 83], [2.23, 0.77, 83], [2.23, 2.75, 70]].forEach(([x, y, z], i) => { const q = Q(x, y, z), an = i / 3 * TAU + 1.1, hp = [c0[0] + Math.cos(an) * 60 * k, c0[1] + Math.sin(an) * 26 * k];
          g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = D.rgba('#9FF3FF', (0.25 + 0.15 * Math.sin(a + i * 2)) * dim); g.lineWidth = 2 * k; g.setLineDash([4 * k, 5 * k]); g.lineDashOffset = -a * 8 * k; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(hp[0], hp[1]); g.stroke(); g.restore(); });
        // the beam glyphs on the triangle glow
        const tb = Q(1.72, 1.5, 110); D.glow(g, tb[0], tb[1], 40 * k, '#9FF3FF', 0.16 * dim); }
      else if(S === 'eclipse'){ const rr = 15 * k, pulse = 1 + 0.05 * Math.sin(a) + 0.03 * Math.cos(a * 2);
        g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = D.rgba('#FF7A3A', 0.9 * dim); g.lineWidth = 3 * k; g.beginPath(); g.arc(c0[0], c0[1], rr * pulse, 0, TAU); g.stroke(); g.restore();
        D.glow(g, c0[0], c0[1], 42 * k * pulse, '#FF5A2A', 0.5 * dim); D.glow(g, c0[0], c0[1], 22 * k * pulse, '#FFB347', 0.45 * dim);
        // a few stars come out in the sudden dark
        for(let i = 0; i < 6; i++){ const an = i * 1.7 + 0.4, q = [c0[0] + Math.cos(an) * (70 + i * 6) * k, c0[1] - 30 * k + Math.sin(an) * 34 * k], tw = 0.5 + 0.5 * Math.sin(a * 2 + i); g.fillStyle = D.rgba('#FFFFFF', 0.4 + 0.5 * tw); g.beginPath(); D.star(g, q[0], q[1], 2.6 * k, 1 * k, 4, 0); g.fill(); } }
      else { const e = Q(1.72, 1.5, hz); D.glow(g, e[0], e[1], 16 * k, '#F08A1C', 0.25 * dim); } }, {fx: true, layer: 9});
  }; })();
K.loaded('wonder', 'ip-7a');
})(window.Props && window.Props._K);
