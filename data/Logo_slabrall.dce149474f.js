// 🏷️ LOGO slabrall START — 🏓 SlaBrall: the main mark moved word for word from SlaBrall.html slaMark + slaWord / slaShield / slaLines / slaBallT / SLA_PAL (lg-1, approved in its game)
// by move_st2c.py (gl-r22, 📡 st-2c) · NEW in the kit: 'wide' (title row) + 'badge' (icon) from the same parts · looks = the 6 court themes
GameLogos.add('slabrall', (function () {
const SLA_PAL = {
  classic: {neon: '#36D6FF', neon2: '#FF8A1F', f1: '#17396D', f2: '#071426', sla: ['#FFFFFF', '#5FE0FF'], rest: ['#FFE45C', '#FF7A1A'], ink: '#06101F'},
  dino:    {neon: '#9BE15D', neon2: '#FFB23F', f1: '#255A2B', f2: '#0C1F0E', sla: ['#F6FFE0', '#A6EE62'], rest: ['#FFE07A', '#FF8A2A'], ink: '#0A1608'},
  sea:     {neon: '#3FF3E0', neon2: '#FF7F6B', f1: '#0C4A70', f2: '#041C2E', sla: ['#E6FFFF', '#3FF3E0'], rest: ['#FFD9B0', '#FF6B5B'], ink: '#03121E'},
  dance:   {neon: '#FF4FE3', neon2: '#FFE14A', f1: '#3D1468', f2: '#12051F', sla: ['#FFFFFF', '#FF8CF0'], rest: ['#FFF27A', '#FFB800'], ink: '#0D0318'},
  space:   {neon: '#8E7CFF', neon2: '#5CF2FF', f1: '#2A2470', f2: '#07051A', sla: ['#FFFFFF', '#B8F3FF'], rest: ['#EDE4FF', '#A585FF'], ink: '#05031A'},
  sky:     {neon: '#FFD34D', neon2: '#3DB2F0', f1: '#2D7FC4', f2: '#0F3F6E', sla: ['#FFFFFF', '#BFE8FF'], rest: ['#FFF0A0', '#F2A81D'], ink: '#0A2440'}
};
const SLA_FONT = (px, it) => (it === false ? '' : 'italic ') + '700 ' + px + 'px Fredoka, Nunito, "Arial Rounded MT Bold", sans-serif';
function slaWord(g, word, cx, cy, maxW, px, P, opt){   // two-tone lettering: "Sla" cool, the rest warm · thick dark edge · thin white line · neon glow
  opt = opt || {}; g.save(); g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.font = SLA_FONT(px);
  const a = word.slice(0, 3), b = word.slice(3); let w = g.measureText(word).width;
  if(w > maxW){ px = px * maxW / w; g.font = SLA_FONT(px); w = g.measureText(word).width; }
  const x0 = cx - w / 2, wa = g.measureText(a).width, top = cy - px * 0.72, bot = cy + px * 0.08;
  g.shadowColor = P.neon; g.shadowBlur = opt.glow == null ? px * 0.35 : opt.glow; g.strokeStyle = P.ink; g.lineWidth = px * 0.2;
  g.strokeText(word, x0, cy); g.shadowBlur = 0; g.lineWidth = px * 0.2; g.strokeText(word, x0, cy);
  const ga = g.createLinearGradient(0, top, 0, bot); ga.addColorStop(0, P.sla[0]); ga.addColorStop(1, P.sla[1]);
  const gb = g.createLinearGradient(0, top, 0, bot); gb.addColorStop(0, P.rest[0]); gb.addColorStop(1, P.rest[1]);
  g.fillStyle = ga; g.fillText(a, x0, cy); g.fillStyle = gb; g.fillText(b, x0 + wa, cy);
  g.lineWidth = Math.max(1, px * 0.03); g.strokeStyle = 'rgba(255,255,255,0.85)'; g.strokeText(word, x0, cy);
  g.restore(); return px;
}
function slaShield(g, inset){   // 240-box shield: flat top with round corners, curved sides to a point
  const k = inset || 0; g.beginPath(); g.moveTo(52 + k, 14 + k); g.lineTo(188 - k, 14 + k); g.quadraticCurveTo(212 - k, 14 + k, 212 - k, 38 + k); g.lineTo(212 - k, 116);
  g.quadraticCurveTo(210 - k, 184 - k * 0.6, 120, 228 - k * 1.3); g.quadraticCurveTo(30 + k, 184 - k * 0.6, 28 + k, 116); g.lineTo(28 + k, 38 + k); g.quadraticCurveTo(28 + k, 14 + k, 52 + k, 14 + k); g.closePath();
}
function slaLines(g, pts, col, w){ g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; pts.forEach(([x0, y0, x1, y1]) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }); }
function slaBallT(g, x, y, r, c1, c2, seam){   // a round ball with a soft light + optional tennis seam
  const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = Math.max(1.5, r * 0.08); g.stroke();
  if(seam){ g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = Math.max(1.5, r * 0.12); g.beginPath(); g.arc(x - r * 1.05, y, r * 0.75, -0.95, 0.95); g.stroke(); g.beginPath(); g.arc(x + r * 1.05, y, r * 0.75, Math.PI - 0.95, Math.PI + 0.95); g.stroke(); }
}
function slaMarkOn(g, P){   // 🏓 the main mark: swoosh + burst + ball, "SlaBrall", tagline — the game's slaMark painted straight onto the kit's canvas (720 × 330 units)
  const bx = 452, by = 108, br = 62;
  // swoosh arc
  g.save(); g.lineCap = 'round'; const sw = g.createLinearGradient(140, 0, 600, 0); sw.addColorStop(0, 'rgba(255,255,255,0)'); sw.addColorStop(0.5, P.sla[1]); sw.addColorStop(1, '#FFFFFF');
  g.strokeStyle = sw; g.lineWidth = 16; g.shadowColor = P.neon; g.shadowBlur = 18; g.beginPath(); g.ellipse(380, 210, 250, 168, 0, Math.PI * 1.08, Math.PI * 1.86); g.stroke();
  g.lineWidth = 6; g.strokeStyle = P.neon2; g.beginPath(); g.ellipse(380, 210, 228, 150, 0, Math.PI * 1.12, Math.PI * 1.8); g.stroke(); g.restore();
  // burst
  g.save(); g.translate(bx + 16, by - 6); const bg = g.createRadialGradient(0, 0, 10, 0, 0, 120); bg.addColorStop(0, '#FFF2A8'); bg.addColorStop(0.5, P.rest[1]); bg.addColorStop(1, 'rgba(255,90,20,0)');
  g.fillStyle = bg; g.beginPath(); for(let i = 0; i < 22; i++){ const a = i * Math.PI / 11, d = i % 2 ? 58 : 112 + (i % 4) * 8; g.lineTo(Math.cos(a) * d, Math.sin(a) * d); } g.closePath(); g.fill(); g.restore();
  // speed streaks
  slaLines(g, [[230, 92, 372, 100], [250, 124, 378, 122], [276, 150, 384, 140], [300, 70, 380, 82]], P.sla[1], 7);
  slaLines(g, [[262, 108, 380, 112], [300, 138, 388, 132]], P.rest[1], 5);
  // the ball
  g.save(); g.shadowColor = P.neon; g.shadowBlur = 24; slaBallT(g, bx, by, br, '#F7FF9C', '#5DBB1A', true); g.restore();
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(bx - 22, by - 28, 20, 11, -0.6, 0, 7); g.fill();
  slaWord(g, 'SlaBrall', 360, 258, 660, 132, P, {glow: 26});
  // tagline
  g.save(); g.font = '700 30px Fredoka, Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.strokeStyle = P.ink; g.lineWidth = 8; g.strokeText('THE ULTIMATE SLAP & RALLY GAME', 360, 300); g.fillStyle = '#FFFFFF'; g.fillText('THE ULTIMATE SLAP & RALLY GAME', 360, 300); g.restore();
}

  // 🆕 gl-r22: the slim title row + the icon (the game only had the 720 × 330 mark) — same parts: burst + tennis ball + streaks + the two-tone word
  function burst(g, P, x, y, s){ g.save(); g.translate(x, y); var bg = g.createRadialGradient(0, 0, 10 * s, 0, 0, 120 * s); bg.addColorStop(0, '#FFF2A8'); bg.addColorStop(0.5, P.rest[1]); bg.addColorStop(1, 'rgba(255,90,20,0)');
    g.fillStyle = bg; g.beginPath(); for (var i = 0; i < 22; i++) { var a = i * Math.PI / 11, d = (i % 2 ? 58 : 112 + (i % 4) * 8) * s; g.lineTo(Math.cos(a) * d, Math.sin(a) * d); } g.closePath(); g.fill(); g.restore(); }
  function ball(g, P, x, y, r){ g.save(); g.shadowColor = P.neon; g.shadowBlur = r * 0.4; slaBallT(g, x, y, r, '#F7FF9C', '#5DBB1A', true); g.restore();
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.45, r * 0.32, r * 0.18, -0.6, 0, 7); g.fill(); }
  function wide(g, P){   // 760 × 190: ball + burst on the left, the word on the right, a neon swoosh under it
    g.save(); g.lineCap = 'round'; var sw = g.createLinearGradient(170, 0, 740, 0); sw.addColorStop(0, 'rgba(255,255,255,0)'); sw.addColorStop(0.5, P.sla[1]); sw.addColorStop(1, '#FFFFFF');
    g.strokeStyle = sw; g.lineWidth = 9; g.shadowColor = P.neon; g.shadowBlur = 12; g.beginPath(); g.ellipse(470, 30, 300, 140, 0, Math.PI * 0.18, Math.PI * 0.82); g.stroke(); g.restore();
    burst(g, P, 102, 94, 0.62);
    slaLines(g, [[176, 70, 236, 74], [182, 96, 240, 96], [176, 122, 232, 116]], P.sla[1], 6);
    ball(g, P, 96, 96, 50);
    slaWord(g, 'SlaBrall', 470, 140, 520, 128, P, {glow: 20});
  }
  function badge(g, P, px){   // 240 × 240: the neon shield with the burst + ball inside; the name banner from 90 px up
    g.save(); slaShield(g); var fg = g.createLinearGradient(0, 14, 0, 228); fg.addColorStop(0, P.f1); fg.addColorStop(1, P.f2); g.fillStyle = fg; g.fill();
    g.clip(); var rg = g.createRadialGradient(120, 80, 6, 120, 80, 120); rg.addColorStop(0, 'rgba(255,255,255,0.22)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, 240, 240);
    var big = px < 90; burst(g, P, 128, big ? 116 : 92, big ? 0.82 : 0.62);
    slaLines(g, [[40, big ? 96 : 74, 82, big ? 100 : 78], [36, big ? 122 : 98, 78, big ? 122 : 98], [44, big ? 148 : 122, 82, big ? 142 : 116]], P.sla[1], 6);
    ball(g, P, 124, big ? 118 : 94, big ? 58 : 46); g.restore();
    g.save(); g.lineJoin = 'round'; g.shadowColor = P.neon; g.shadowBlur = 16; g.strokeStyle = P.neon; g.lineWidth = 7; slaShield(g); g.stroke();
    g.shadowBlur = 0; g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 1.5; slaShield(g); g.stroke();
    g.strokeStyle = P.neon2; g.lineWidth = 3; slaShield(g, 9); g.stroke(); g.restore();
    if (big) return;
    g.save(); g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.moveTo(22, 150); g.lineTo(218, 150); g.lineTo(212, 196); g.lineTo(28, 196); g.closePath(); g.fill(); g.restore();
    slaWord(g, 'SlaBrall', 120, 188, 200, 50, P);
  }
  var BOX = { main: [720, 330], wide: [760, 190], badge: [240, 240] };
  return { BOX: BOX, LOOK: SLA_PAL, paint: function (g, kind, P, px) { if (kind === 'main') slaMarkOn(g, P); else if (kind === 'wide') wide(g, P); else badge(g, P, px); } };
})());
// 🏷️ LOGO slabrall END
