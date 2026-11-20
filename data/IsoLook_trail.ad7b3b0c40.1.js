
/* 🌍 IsoLook_trail — 🧭 trail — adventure bits for any look: 🧭 move gates (glide ledge · dig mound · climb wall · dive spot · grapple ring · moon-hop rock) + 👗 mirror stand — a LOOK file of 🌳 IsoProps (ip-4a: the engine + one file per look).
   Load it with Props.need(['trail'], start) (the 📲 offline app + tests have it inline already). Runs after IsoProps with Props._K (the kit's insides).
   Built from Test Harness/isoprops/kit/looks/trail.js by build_isoprops.py — never edit by hand. Same 14 rules as IsoProps (see the top of IsoProps.html). */
(function(K){
'use strict';
if(!K){ console.warn('IsoLook_trail: include IsoProps first'); return; }
const {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T} = K;
/* 🧭 IsoLook_trail — adventure TRAIL bits for any map look (🌳 IsoProps chat, ip-6, 🧳 Avateer av-wear1 asks):
   🧭 MOVE GATES (def.gate, states grey · ready, Props.setGate / Props.gates / Props.moveIcon): 🪁 glide ledge … (roll-out: ⛏️ dig mound · 🧗 climb wall · 🤿 dive spot · 🪝 grapple ring · 🚀 moon-hop rock)
   + (roll-out) 👗 mirror stand. Every piece takes the map's look colours (stone, wood trim, accent), so one file serves every island. */
const D = PD, M = MAT, TAU = Math.PI * 2, ph = (t, p) => ((t || 0) / p) * TAU;
addSet('trail', {name: 'Trail', icon: '🧭', accent: '#2FBFB0'});   // ip-7a: icon apart (the lab tab showed 📦 🧭)
const stoneOf = L => (L && L.key === 'snow') ? '#C9D3DE' : (L && L.key === 'desert') ? '#E2C08A' : (L && L.key === 'moon') ? '#B8B4C8' : (L && L.key === 'lava') ? '#7A6A6E' : '#BFB5A4';
// 🪁 Glide ledge (2 × 1): a carved stone launch step with a plank tongue over the edge, a wind-sock and the move badge.
//   grey = can't glide yet: sock hangs limp, the badge is grey with a lock · ready = the sock streams out and flutters, wind ribbons curl past, the badge glows.
//   it.stand = the plank tip (where the hero jumps from) · door = the back step (walk up from there)
(function(){ const def = add('trail', 'gate_glide', {name: 'Glide ledge', foot: [2, 1], h: 60, kind: 'gate', block: true, door: [0, 1], gate: 'glide',
    states: ['grey', 'ready'], state: 'grey', liveStates: ['ready'], live: {period: 1.6, frames: 6}, stand: [2.3, 0.5, 33], aim: [2.3, 0.5, 48], touchAt: [0.25, 0.89, 40], tags: ['move', 'glide', 'cliff'],
    diffs: [{by: 'state', a: 'grey', b: 'ready', level: 'bold', name: 'can glide / not yet'}]});
  def.build = (B, v, L) => { const c = L.cond, on = (L.state || 'grey') === 'ready', st = stoneOf(L), st2 = sh(st, -0.1), wood = L.trim || '#5A3418', acc = L.accent || '#2FBFB0', plank = M.plank;
    // the stone: a low plinth + one step at the back, then the tall ledge block whose FRONT (+x) face drops straight to the ground = the cliff you glide off
    B.box(0.04, 0.06, 0, 0.62, 0.88, 9, st2, {trim: 0}); B.box(0.12, 0.14, 9, 0.46, 0.72, 9, st, {trim: 0});
    B.box(0.62, 0.08, 0, 1.3, 0.84, 30, st, {trim: 0});
    // carved grooves, a mossy / sandy / snowy lip, vines (or icicles) hanging down the drop face
    B.custom(1.2, 0.9, (g, P, k) => { g.strokeStyle = 'rgba(42,28,20,0.22)'; g.lineWidth = 1 * k; [10, 20].forEach(z => { const a = P(0.62, 0.92, z), b = P(1.92, 0.92, z); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
      const lip = L.key === 'snow' ? '#FFFFFF' : L.key === 'desert' ? '#F2D9A6' : L.key === 'moon' ? '#DCD8EA' : '#7CC15A'; g.fillStyle = lip; for(let i = 0; i < 7; i++){ const p = P(0.66 + i * 0.18, 0.92, 30); g.beginPath(); g.ellipse(p[0], p[1] + 1 * k, (3 + (i % 3)) * k, 1.8 * k, 0, 0, TAU); g.fill(); }
      const hang = L.key === 'snow' ? 'ice' : L.key === 'desert' || L.key === 'moon' ? null : 'vine'; if(!hang) return;
      [0.22, 0.46, 0.7].forEach((y, i) => { const a = P(1.92, y, 30), len = (9 + (i % 2) * 7) * k; if(hang === 'ice'){ g.fillStyle = 'rgba(220,242,255,0.95)'; g.beginPath(); g.moveTo(a[0] - 1.6 * k, a[1]); g.lineTo(a[0] + 1.6 * k, a[1]); g.lineTo(a[0], a[1] + len * 0.7); g.closePath(); g.fill(); return; }
        g.strokeStyle = '#4E9E3A'; g.lineWidth = 1.4 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(a[0] + 3 * k, a[1] + len * 0.5, a[0] + 0.5 * k, a[1] + len); g.stroke();
        g.fillStyle = '#7CC15A'; [0.35, 0.7, 1].forEach(u => { g.beginPath(); g.ellipse(a[0] + 2 * k * Math.sin(u * 3), a[1] + len * u, 1.8 * k, 1 * k, 0.6, 0, TAU); g.fill(); }); }); }, {layer: 2});
    // the plank tongue: rests on the ledge and sticks out well past the drop, two stops at its tip, painted ▶▶ "jump this way"
    B.box(1.28, 0.3, 30, 1.18, 0.4, 3, plank, {trim: 0, layer: 3}); [0.32, 0.62].forEach(y => B.box(2.38, y, 33, 0.06, 0.06, 5, wood, {layer: 3}));
    B.custom(1.9, 0.5, (g, P, k) => { g.fillStyle = on ? '#FFFFFF' : 'rgba(255,255,255,0.55)'; [1.7, 2.02].forEach(x => { const a = P(x, 0.38, 33), b = P(x + 0.2, 0.5, 33), c2 = P(x, 0.62, 33), m = P(x + 0.07, 0.5, 33);
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c2[0], c2[1]); g.lineTo(m[0], m[1]); g.closePath(); g.fill(); }); }, {layer: 4});
    // the wind-sock pole at the back corner
    B.box(0.2, 0.2, 18, 0.07, 0.07, 40, M.dark, {layer: 3}); B.box(0.16, 0.16, 18, 0.15, 0.15, 3, wood, {layer: 3});
    B.custom(0.24, 0.24, (g, P, k, t) => { const top = P(0.235, 0.235, 56), a = ph(t, 1.6), cols = [acc, '#FFFFFF', acc, '#FFFFFF'], N = 4;
      g.lineJoin = 'round';
      for(let i = 0; i < N; i++){ const u0 = i / N, u1 = (i + 1) / N, seg = u => on ? [top[0] + u * 22 * k, top[1] + u * 4 * k + Math.sin(a + u * 5) * 2.6 * k * u + Math.cos(a * 2 + u * 3) * 0.8 * k * u]
          : [top[0] + u * 4 * k + Math.sin(u * 2.4) * 2 * k, top[1] + u * 17 * k], r = u => (on ? 4.2 - 2.4 * u : 3.4 - 1.6 * u) * k;
        const p0 = seg(u0), p1 = seg(u1), r0 = r(u0), r1 = r(u1), nx0 = on ? 0 : 1, ny0 = on ? 1 : 0;
        g.fillStyle = cols[i]; g.beginPath(); g.moveTo(p0[0] - nx0 * r0, p0[1] - ny0 * r0); g.lineTo(p1[0] - nx0 * r1, p1[1] - ny0 * r1); g.lineTo(p1[0] + nx0 * r1, p1[1] + ny0 * r1); g.lineTo(p0[0] + nx0 * r0, p0[1] + ny0 * r0); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 0.8 * k; g.stroke(); }
      g.fillStyle = '#5A5F6A'; g.beginPath(); g.ellipse(top[0], top[1], on ? 1.4 * k : 3.4 * k, on ? 4.2 * k : 1.6 * k, 0, 0, TAU); g.fill(); }, {layer: 4});
    // the move badge on a short post at the front-left corner (drawn icon, rule 7) — grey + lock until the hero can glide
    B.box(0.22, 0.86, 9, 0.06, 0.06, 24, wood, {layer: 4});
    B.bill(0.25, 0.89, 40, (g, x, y, k) => { const P0 = window.Props; if(P0 && P0.moveIcon) P0.moveIcon(g, x, y, 8.6 * k, 'glide', {dim: !on}); }, {layer: 5});
    if(on) B.custom(0.25, 0.89, (g, P, k, t) => { const q = P(0.25, 0.89, 40); g.save(); g.globalCompositeOperation = 'destination-over'; D.glow(g, q[0], q[1], 17 * k * (1 + 0.08 * Math.sin(ph(t, 1.6)) + 0.04 * Math.cos(ph(t, 1.6))), '#7FF5E6', 0.5); g.restore(); }, {fx: true, layer: 8});   // glow in fx (no dark baked ring), BEHIND the badge
    // ready: wind ribbons curl past the plank + two leaves ride them (fx, painted after the rim)
    if(on && !(c && c.still)) B.custom(1.6, 0.5, (g, P, k, t) => { const a = ph(t, 1.6); g.lineCap = 'round';
      [[1.55, 0.5, 42, 0], [1.85, 0.2, 52, 2.1], [1.45, 0.8, 38, 4.2]].forEach(([x, y, z, o2], i) => { const p = P(x, y, z), sx = ((Math.sin(a + o2) + 1) / 2) * 10 * k, L1 = (18 + 6 * Math.cos(a + o2)) * k;
        g.strokeStyle = i === 1 ? 'rgba(230,255,250,0.9)' : 'rgba(160,240,228,0.85)'; g.lineWidth = (i === 1 ? 2 : 1.5) * k; g.beginPath(); g.moveTo(p[0] - 10 * k + sx, p[1]); g.quadraticCurveTo(p[0] + sx + L1 * 0.5, p[1] - 5 * k, p[0] + sx + L1, p[1] - 1 * k);
        g.arc(p[0] + sx + L1, p[1] - 4 * k, 3 * k, Math.PI / 2, -Math.PI * 0.6, true); g.stroke(); });
      [[0, '#7CC15A'], [3.1, '#F2B33D']].forEach(([o2, col]) => { const p = P(2.0, 0.4, 46), x = p[0] + Math.cos(a + o2) * 16 * k, y = p[1] + Math.sin(2 * (a + o2)) * 4 * k; g.fillStyle = col; g.beginPath(); g.ellipse(x, y, 2.4 * k, 1.1 * k, a * 2 + o2, 0, TAU); g.fill(); }); }, {fx: true, layer: 9});
    else if(!on) B.custom(1.4, 0.7, (g, P, k) => { g.fillStyle = 'rgba(42,28,20,0.28)'; [[1.5, 0.74], [1.16, 0.2]].forEach(([x, y]) => { const p = P(x, y, 30); g.beginPath(); g.ellipse(p[0], p[1], 2 * k, 1 * k, 0, 0, TAU); g.fill(); }); }, {layer: 3});
  }; })();
K.loaded('trail', 'ip-7a');
})(window.Props && window.Props._K);
