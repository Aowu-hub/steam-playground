/* 🏷️ TD LOGO (td-logo) START — Aowu's TD Stories picture as the style guide, drawn in code (no picture file) */
/* 🏷️ TdLogo (td-logo) — the TD-Stories logo, DRAWN IN CODE (Aowu's picture 2026-11-16 14:03 = the style guide, no picture file).
   TdLogo.pic(kind, look, px) → cached canvas · TdLogo.url(kind, look, px) → data URL for <img> · TdLogo.draw(g, kind, x, y, px, look) (x, y = centre, px = width)
   kind: 'main' (open storybook + shield + wordmark + ribbon, for a 🎬 cover) · 'wide' (title row: shield + "Stories") · 'badge' (the TD shield — result card, icons)
   look: a story book (draprincess · farmer · coral · night) or 'classic' (= the picture's colours). Unknown → classic.
   Tune colours in LOOK, sizes in BOX — page placement lives in the page's TD_LOGO_CFG. */
const TdLogo = (() => {
  const LOOK = {
    classic:     {wood: ['#C98A4E', '#94592A', '#5E3414'], rim: ['#F2F6FA', '#9AA8B6', '#4A5664'], steel: ['#F4FAFF', '#9DB8D2', '#3E5874'], stone: ['#F1ECE2', '#B9AE9C', '#6A5F50'],
                  gold: ['#FFF6C2', '#FFC93A', '#C27A0E'], ink: '#3A1E0C', wglow: 'rgba(170,110,255,.55)', page: ['#FFF8E6', '#F2DDB0'], pglow: '#FFE89A', cover: ['#6B3A1E', '#3E1E0C'],
                  land: ['#9EDB6A', '#5FA83A'], sky: '#CFEFFF', roof: '#C8553A', spark: ['#FFE066', '#FFFFFF', '#C9A2FF', '#8FE3FF'], ribbon: ['#7A2E1E', '#4E1A10'], rtext: '#FFE7A8'},
    draprincess: {wood: ['#E58AB0', '#B4507E', '#6E2448'], rim: ['#FFF4FA', '#E2A9C4', '#8A3E62'], steel: ['#FFF0F8', '#F2A2C8', '#9A3A6A'], stone: ['#F6ECF6', '#C9A8C8', '#6E4E70'],
                  gold: ['#FFF6C2', '#FFC93A', '#C27A0E'], ink: '#4A0E2E', wglow: 'rgba(255,92,170,.45)', page: ['#FFF4FA', '#F6D2E2'], pglow: '#FFC8E2', cover: ['#7A2450', '#40102A'],
                  land: ['#B8E68A', '#6EB24A'], sky: '#FFE0EE', roof: '#9A4AD8', spark: ['#FFE066', '#FFFFFF', '#FF8AC8', '#C9A2FF'], ribbon: ['#8A2A5A', '#521234'], rtext: '#FFE0F0'},
    farmer:      {wood: ['#D9A55A', '#A06A28', '#5E3A10'], rim: ['#FFFBEA', '#C8B98A', '#6A5A2A'], steel: ['#F6FFE8', '#A9C98A', '#3E6A24'], stone: ['#F4EEDC', '#C2B48E', '#6E5E3A'],
                  gold: ['#FFF4B8', '#FFB21E', '#B45A06'], ink: '#3A2408', wglow: 'rgba(255,150,40,.4)', page: ['#FFFBEA', '#EEDDA6'], pglow: '#FFE07A', cover: ['#5E7A24', '#2E420C'],
                  land: ['#B4E06A', '#6EA82A'], sky: '#E8F8D0', roof: '#D2602A', spark: ['#FFE066', '#FFFFFF', '#FF9A3A', '#9BFF6A'], ribbon: ['#6E4A14', '#40280A'], rtext: '#FFF0B8'},
    coral:       {wood: ['#5EC8C8', '#2A8E9A', '#0E4E5E'], rim: ['#FFFFFF', '#A8E2EE', '#2E6E84'], steel: ['#F0FFFF', '#8EE6F2', '#1E6E8E'], stone: ['#FFF0E8', '#F2B8A0', '#8E4A3A'],
                  gold: ['#FFF8D6', '#FFD86A', '#C2861E'], ink: '#062A3A', wglow: 'rgba(60,230,255,.45)', page: ['#F2FFFE', '#C8EEF0'], pglow: '#B8FFF6', cover: ['#1E5E7A', '#0A2E44'],
                  land: ['#7AE2D2', '#2EA8A0'], sky: '#BFF2FF', roof: '#FF7A59', spark: ['#9FF2FF', '#FFFFFF', '#FF9A7A', '#FFE066'], ribbon: ['#1E5E7A', '#0A3448'], rtext: '#E6FBFF'},
    night:       {wood: ['#8E6AD8', '#5A3AA0', '#2E1A5E'], rim: ['#FFF4E0', '#E2B87A', '#7A4A1E'], steel: ['#FFF0E0', '#FFB27A', '#A84A1E'], stone: ['#EAE6F6', '#A8A0C8', '#4E466E'],
                  gold: ['#FFF0B8', '#FFB23A', '#C2560E'], ink: '#1E0E3A', wglow: 'rgba(255,90,60,.4)', page: ['#FFF4E0', '#F2D2A8'], pglow: '#FFB866', cover: ['#3A1E6E', '#1A0A3A'],
                  land: ['#5A4E9A', '#3A2E6E'], sky: '#2E2460', roof: '#E5484D', spark: ['#FFD54A', '#FFFFFF', '#FF6A4A', '#FFB0E0'], ribbon: ['#8E1E2A', '#520E16'], rtext: '#FFE0B0'}
  };
  // 📖 which stories sit on the pages (Aowu 17:34 "add stories to the background too")
  const SCENES = {classic: ['dragon', 'pumpkins'], draprincess: ['dragon', 'castle'], farmer: ['farm', 'pumpkins'], coral: ['reef', 'kelp'], night: ['moon', 'market']};
  const CREA = {dragon: ['#8EE07A', '#3E9A3A', '#1E5A1E'], wing: '#B48AF0', rose: '#FF4D7A', pumpkin: ['#FFB04A', '#F07A1E', '#9A400A'], leaf: '#4EB03A', coral: ['#FF8AB0', '#FF5A8A'], kelp: '#3EBE8E',
    lantern: ['#FFD27A', '#FF5A3A', '#9A1E1A'], fish: '#FFB23A', chest: ['#C98A4E', '#6E3A14'], moon: '#FFF2B0', sheep: '#FFFFFF'};
  const cache = {};
  const FONT = (w, px) => w + ' ' + px + "px Fredoka, 'Baloo 2', Nunito, system-ui, sans-serif";
  const lin = (g, x0, y0, x1, y1, cols) => { const gr = g.createLinearGradient(x0, y0, x1, y1); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); return gr; };
  function sparkle(g, x, y, r, col, a){ g.save(); g.globalAlpha = a == null ? 1 : a; g.fillStyle = col; g.beginPath(); g.moveTo(x, y - r);
    g.quadraticCurveTo(x + r * 0.16, y - r * 0.16, x + r, y); g.quadraticCurveTo(x + r * 0.16, y + r * 0.16, x, y + r); g.quadraticCurveTo(x - r * 0.16, y + r * 0.16, x - r, y); g.quadraticCurveTo(x - r * 0.16, y - r * 0.16, x, y - r); g.fill(); g.restore(); }

  // ---------- the open storybook (main only): cover, page stack, two curved pages with a little world on them ----------
  function pagePath(g, side, w, h, lift){   // side -1 = left page, +1 = right page; spine at x = 0 (dips), pages bulge up then curl down at the edge
    g.beginPath(); g.moveTo(0, -h / 2 + lift + 16); g.bezierCurveTo(side * w * 0.22, -h / 2 - 22, side * w * 0.72, -h / 2 - 10, side * w, -h / 2 + 6);
    g.bezierCurveTo(side * (w + 8), -h / 2 + 60, side * (w + 8), h / 2 - 60, side * w, h / 2);
    g.bezierCurveTo(side * w * 0.72, h / 2 - 14, side * w * 0.22, h / 2 - 22, 0, h / 2 + lift * 0.5); g.closePath(); }
  function tower(g, L, x, y, s){   // a round stone tower with a cone roof + window
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = lin(g, -16, 0, 16, 0, [L.stone[0], L.stone[1], L.stone[2]]); g.strokeStyle = L.ink; g.lineWidth = 2.4;
    g.beginPath(); g.rect(-15, -58, 30, 58); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1.4; for(let r = -46; r < 0; r += 12){ g.beginPath(); g.moveTo(-15, r); g.lineTo(15, r); g.stroke(); }
    g.fillStyle = L.roof; g.strokeStyle = L.ink; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-21, -56); g.lineTo(0, -96); g.lineTo(21, -56); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = L.ink; g.beginPath(); g.moveTo(0, -96); g.lineTo(0, -108); g.stroke(); g.fillStyle = L.roof; g.beginPath(); g.moveTo(0, -108); g.lineTo(10, -104); g.lineTo(0, -100); g.fill();
    g.fillStyle = L.pglow; g.beginPath(); g.arc(0, -36, 5, Math.PI, 0); g.lineTo(5, -26); g.lineTo(-5, -26); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  function wallBit(g, L, x, y, w){   // a short crenellated wall
    g.save(); g.translate(x, y); g.fillStyle = lin(g, 0, -18, 0, 0, [L.stone[0], L.stone[1]]); g.strokeStyle = L.ink; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -18); for(let i = 0; i < w; i += 10){ g.lineTo(i, -18); g.lineTo(i, -24); g.lineTo(i + 5, -24); g.lineTo(i + 5, -18); } g.lineTo(w, -18); g.lineTo(w, 0); g.closePath(); g.fill(); g.stroke(); g.restore(); }

  // ---------- 📖 the stories on the pages (props + storybook creatures, drawn small at the outer edge of each page) ----------
  function rnd(seed){ let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
  function pumpkin(g, L, x, y, r){ g.save(); g.translate(x, y); g.strokeStyle = L.ink; g.lineWidth = 2;
    g.fillStyle = lin(g, 0, -r, 0, r, CREA.pumpkin); [[-r * 0.45, 0.7], [r * 0.45, 0.7], [0, 0.85]].forEach(([dx, k]) => { g.beginPath(); g.ellipse(dx, 0, r * k * 0.7, r * 0.8, 0, 0, 7); g.fill(); g.stroke(); });
    g.fillStyle = CREA.leaf; g.beginPath(); g.rect(-2, -r * 0.95, 4, r * 0.35); g.fill(); g.stroke(); g.beginPath(); g.ellipse(r * 0.35, -r * 0.85, r * 0.3, r * 0.13, -0.5, 0, 7); g.fill(); g.restore(); }
  function sprout(g, x, y, s){ g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#2E7A1E'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(2, -10, 0, -18); g.stroke();
    g.fillStyle = CREA.leaf; [[-1, -0.5], [1, 0.5]].forEach(([sd, a]) => { g.beginPath(); g.ellipse(sd * 6, -14, 7, 3.4, a, 0, 7); g.fill(); }); g.restore(); }
  function dragon(g, L, x, y, s){   // a little dragon curled round the tower top: wing, neck, head, tail spade
    g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
    g.fillStyle = CREA.wing; g.strokeStyle = L.ink; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-4, -64); g.lineTo(-40, -98); g.lineTo(-30, -78); g.lineTo(-48, -80); g.lineTo(-30, -66); g.lineTo(-44, -60); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = L.ink; g.lineWidth = 13; g.beginPath(); g.moveTo(-18, -12); g.bezierCurveTo(30, -20, 30, -50, 2, -56); g.bezierCurveTo(-14, -60, -2, -84, 18, -88); g.stroke();
    g.strokeStyle = lin(g, 0, -90, 0, 0, CREA.dragon); g.lineWidth = 9; g.stroke();
    g.fillStyle = CREA.dragon[0]; g.strokeStyle = L.ink; g.lineWidth = 2.2; g.beginPath(); g.ellipse(26, -90, 12, 9, -0.2, 0, 7); g.fill(); g.stroke();   // head
    g.beginPath(); g.ellipse(36, -86, 8, 5.5, 0.1, 0, 7); g.fill(); g.stroke();                                                                   // snout
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(24, -93, 3.6, 0, 7); g.fill(); g.fillStyle = L.ink; g.beginPath(); g.arc(25, -93, 1.8, 0, 7); g.fill();
    g.fillStyle = '#FFE8A0'; [[18, -100], [26, -102]].forEach(([hx, hy]) => { g.beginPath(); g.moveTo(hx - 3, hy + 3); g.lineTo(hx, hy - 6); g.lineTo(hx + 3, hy + 3); g.closePath(); g.fill(); g.stroke(); });
    g.fillStyle = CREA.dragon[1]; g.beginPath(); g.moveTo(-18, -12); g.lineTo(-28, -18); g.lineTo(-26, -6); g.closePath(); g.fill(); g.stroke();      // tail spade
    g.restore(); }
  function roses(g, x, y, n, rr){ for(let i = 0; i < n; i++){ const px = x + (i - (n - 1) / 2) * 10, py = y + (i % 2) * 3; g.fillStyle = '#3E9A3A'; g.beginPath(); g.ellipse(px + 4, py + 3, 4, 2, 0.5, 0, 7); g.fill();
    g.fillStyle = CREA.rose; g.beginPath(); g.arc(px, py, rr, 0, 7); g.fill(); g.strokeStyle = 'rgba(120,0,40,.6)'; g.lineWidth = 1.2; g.beginPath(); g.arc(px, py, rr * 0.5, 0, 5); g.stroke(); } }
  function castle(g, L, x, y, s){ g.save(); g.translate(x, y); g.scale(s, s);
    tower(g, L, -30, 0, 0.62); tower(g, L, 30, 0, 0.62); wallBit(g, L, -21, 0, 42);
    g.fillStyle = L.ink; g.beginPath(); g.moveTo(-7, 0); g.lineTo(-7, -9); g.arc(0, -9, 7, Math.PI, 0); g.lineTo(7, 0); g.closePath(); g.fill(); g.restore(); }
  function farmhouse(g, L, x, y, s){ g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = L.ink; g.lineWidth = 2.2; g.lineJoin = 'round';
    g.fillStyle = L.page[0]; g.beginPath(); g.rect(-24, -30, 48, 30); g.fill(); g.stroke();
    g.fillStyle = L.roof; g.beginPath(); g.moveTo(-30, -28); g.lineTo(0, -52); g.lineTo(30, -28); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#9A5A2A'; g.beginPath(); g.rect(-6, -18, 12, 18); g.fill(); g.stroke(); g.fillStyle = '#BFE8FF'; [-17, 11].forEach(wx => { g.beginPath(); g.rect(wx, -22, 8, 8); g.fill(); g.stroke(); });
    g.strokeStyle = '#8E5A2A'; g.lineWidth = 2.4; for(let i = 0; i < 4; i++){ g.beginPath(); g.moveTo(32 + i * 9, 0); g.lineTo(32 + i * 9, -13); g.stroke(); } g.beginPath(); g.moveTo(30, -9); g.lineTo(62, -9); g.moveTo(30, -4); g.lineTo(62, -4); g.stroke();
    g.fillStyle = CREA.sheep; g.strokeStyle = L.ink; g.lineWidth = 1.6; [[-44, -6]].forEach(([sx, sy]) => { [[-5, 0], [0, -3], [5, 0], [0, 2]].forEach(([a, b]) => { g.beginPath(); g.arc(sx + a, sy + b, 5, 0, 7); g.fill(); }); g.fillStyle = L.ink; g.beginPath(); g.ellipse(sx + 9, sy - 1, 3.4, 4, 0, 0, 7); g.fill(); });
    g.restore(); }
  function lantern(g, L, x, y, r){ g.save(); const gl = g.createRadialGradient(x, y, 0, x, y, r * 2.4); gl.addColorStop(0, 'rgba(255,200,90,.55)'); gl.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = gl; g.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    g.fillStyle = lin(g, x - r, y, x + r, y, [CREA.lantern[2], CREA.lantern[1], CREA.lantern[0], CREA.lantern[1]]); g.strokeStyle = L.ink; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, y, r, r * 1.2, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#FFD24A'; g.fillRect(x - r * 0.5, y - r * 1.35, r, r * 0.3); g.fillRect(x - r * 0.5, y + r * 1.1, r, r * 0.3); g.restore(); }
  function scene(g, L, kind, sd){ g.save(); g.translate(sd * 214, 6); g.scale(1.12, 1.12); scene0(g, L, kind, sd); g.restore(); }
  function scene0(g, L, kind, sd){   // sd = -1 left page · +1 right page; drawn round (0, 0) = the scene's middle, ground at gy (above the wordmark, beside the shield)
    const X = 0, gy = 0;
    if(kind === 'dragon'){ tower(g, L, X - sd * 6, gy + 4, 1.25); dragon(g, L, X - sd * 6, gy - 50, 0.95); roses(g, X + sd * 30, gy + 4, 3, 4.4); roses(g, X - sd * 40, gy + 10, 2, 3.8); }
    else if(kind === 'castle'){ castle(g, L, X, gy - 4, 1.05); roses(g, X - sd * 44, gy + 12, 3, 4); }
    else if(kind === 'pumpkins'){ g.strokeStyle = 'rgba(110,70,20,.35)'; g.lineWidth = 3; for(let i = 0; i < 3; i++){ g.beginPath(); g.moveTo(X - 70, gy + 2 + i * 16); g.quadraticCurveTo(X, gy - 6 + i * 16, X + 70, gy + 2 + i * 16); g.stroke(); }
      pumpkin(g, L, X - 36, gy + 6, 15); pumpkin(g, L, X + 18, gy + 22, 18); pumpkin(g, L, X + 48, gy - 2, 11); sprout(g, X - 6, gy + 2, 1); sprout(g, X + 60, gy + 30, 0.8); sprout(g, X - 60, gy + 30, 0.9);
      farmhouseFar(g, L, X + sd * 34, gy - 36); }
    else if(kind === 'farm'){ farmhouse(g, L, X, gy + 4, 1.15); sprout(g, X - sd * 50, gy + 26, 1); pumpkin(g, L, X + sd * 40, gy + 26, 10); }
    else if(kind === 'reef' || kind === 'kelp'){ const R = rnd(sd > 0 ? 7 : 3);
      if(kind === 'reef'){ g.lineCap = 'round'; [[X - 40, 1], [X + 10, 1.3], [X + 50, 0.9]].forEach(([cx, k], i) => { g.strokeStyle = CREA.coral[i % 2]; g.lineWidth = 6 * k; g.beginPath();
          g.moveTo(cx, gy + 20); g.lineTo(cx, gy - 16 * k); g.moveTo(cx, gy - 2); g.quadraticCurveTo(cx - 14 * k, gy - 8, cx - 14 * k, gy - 26 * k); g.moveTo(cx, gy - 6); g.quadraticCurveTo(cx + 14 * k, gy - 10, cx + 12 * k, gy - 30 * k); g.stroke(); });
        g.fillStyle = '#FFE0D0'; g.strokeStyle = L.ink; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X - 14, gy + 26); g.arc(X - 6, gy + 26, 8, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); }
      else { g.strokeStyle = CREA.kelp; g.lineWidth = 5; g.lineCap = 'round'; [-50, -30, 40].forEach(dx => { g.beginPath(); g.moveTo(X + dx, gy + 26); g.bezierCurveTo(X + dx + 12, gy, X + dx - 12, gy - 30, X + dx + 6, gy - 56); g.stroke(); });
        g.fillStyle = lin(g, 0, gy, 0, gy + 24, CREA.chest); g.strokeStyle = L.ink; g.lineWidth = 2; g.beginPath(); g.rect(X - 4, gy + 6, 34, 20); g.fill(); g.stroke(); g.fillStyle = '#FFD24A'; g.beginPath(); g.rect(X + 10, gy + 10, 6, 8); g.fill();
        g.fillStyle = CREA.fish; g.beginPath(); g.ellipse(X + 4, gy - 40, 11, 6, 0, 0, 7); g.moveTo(X - 6, gy - 40); g.lineTo(X - 15, gy - 46); g.lineTo(X - 15, gy - 34); g.closePath(); g.fill(); g.stroke(); }
      g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1.6; for(let i = 0; i < 7; i++){ g.beginPath(); g.arc(X - 60 + R() * 120, gy - 90 + R() * 90, 2 + R() * 4, 0, 7); g.stroke(); } }
    else if(kind === 'moon' || kind === 'market'){
      if(kind === 'moon'){ g.fillStyle = CREA.moon; g.beginPath(); g.arc(X - sd * 30, gy - 92, 18, 0, 7); g.fill(); g.fillStyle = L.sky; g.globalAlpha = 0.85; g.beginPath(); g.arc(X - sd * 22, gy - 98, 15, 0, 7); g.fill(); g.globalAlpha = 1;
        g.fillStyle = L.cover[1]; g.beginPath(); g.moveTo(X - 66, gy + 10); g.lineTo(X - 66, gy - 20); g.lineTo(X - 80, gy - 20); g.lineTo(X - 46, gy - 44); g.lineTo(X - 12, gy - 20); g.lineTo(X - 26, gy - 20); g.lineTo(X - 26, gy + 10); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(X + 10, gy + 10); g.lineTo(X + 10, gy - 6); g.lineTo(X - 2, gy - 6); g.lineTo(X + 30, gy - 28); g.lineTo(X + 62, gy - 6); g.lineTo(X + 50, gy - 6); g.lineTo(X + 50, gy + 10); g.closePath(); g.fill(); }
      else { g.fillStyle = '#FFF0D8'; g.strokeStyle = L.ink; g.lineWidth = 2; g.beginPath(); g.rect(X - 30, gy - 14, 60, 30); g.fill(); g.stroke();
        for(let i = 0; i < 6; i++){ g.fillStyle = i % 2 ? '#FFFFFF' : '#E5484D'; g.beginPath(); g.moveTo(X - 36 + i * 12, gy - 14); g.lineTo(X - 30 + i * 12, gy - 30); g.lineTo(X - 18 + i * 12, gy - 30); g.lineTo(X - 24 + i * 12, gy - 14); g.closePath(); g.fill(); g.stroke(); } }
      g.strokeStyle = 'rgba(40,20,10,.6)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(X - 80, gy - 70); g.quadraticCurveTo(X, gy - 46, X + 80, gy - 72); g.stroke();
      [-60, -30, 0, 30, 60].forEach((dx, i) => lantern(g, L, X + dx, gy - 64 + Math.abs(dx) * -0.14 + 8, i % 2 ? 6 : 7.5)); }
  }
  function farmhouseFar(g, L, x, y){ g.save(); g.globalAlpha = 0.9; farmhouse(g, L, x, y, 0.7); g.restore(); }
  function book(g, L, look){
    const W = 300, H = 300, cy = 18;
    g.save(); g.translate(0, cy);
    // soft magic glow behind everything
    const glow = g.createRadialGradient(0, -10, 20, 0, -10, 330); glow.addColorStop(0, 'rgba(255,248,225,.5)'); glow.addColorStop(0.45, 'rgba(255,240,200,.14)'); glow.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = glow; g.fillRect(-340, -210, 680, 400);
    // cover (leather) + page stack
    g.fillStyle = lin(g, 0, -H / 2, 0, H / 2 + 20, L.cover); g.strokeStyle = L.ink; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-W - 16, -H / 2 + 12); g.bezierCurveTo(-W * 0.6, -H / 2 - 22, -W * 0.15, -H / 2 - 10, 0, -H / 2 + 14); g.bezierCurveTo(W * 0.15, -H / 2 - 10, W * 0.6, -H / 2 - 22, W + 16, -H / 2 + 12);
    g.lineTo(W + 18, H / 2 + 24); g.bezierCurveTo(W * 0.6, H / 2 + 8, W * 0.15, H / 2 + 4, 0, H / 2 + 22); g.bezierCurveTo(-W * 0.15, H / 2 + 4, -W * 0.6, H / 2 + 8, -W - 18, H / 2 + 24); g.closePath(); g.fill(); g.stroke();
    for(let k = 3; k >= 1; k--){ g.save(); g.translate(0, k * 4.5); [-1, 1].forEach(sd => { pagePath(g, sd, W + 2 - k, H, 8); g.fillStyle = k % 2 ? L.page[1] : L.page[0]; g.fill(); g.strokeStyle = 'rgba(80,50,20,.35)'; g.lineWidth = 1.2; g.stroke(); }); g.restore(); }
    // the two pages
    [-1, 1].forEach(sd => { g.save(); pagePath(g, sd, W, H, 8);
      g.fillStyle = lin(g, sd * W, 0, 0, 0, [L.page[0], L.page[0], L.page[1]]); g.fill(); g.clip();
      // sky wash + rolling land + a winding path
      g.fillStyle = L.sky; g.globalAlpha = 0.55; g.fillRect(sd < 0 ? -W : 0, -H / 2, W, H * 0.62); g.globalAlpha = 1;
      g.fillStyle = lin(g, 0, 10, 0, H / 2, L.land); g.beginPath(); g.moveTo(sd * W, 12); g.bezierCurveTo(sd * W * 0.66, -24, sd * W * 0.33, 34, 0, 6); g.lineTo(0, H / 2 + 10); g.lineTo(sd * W, H / 2 + 10); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,236,190,.95)'; g.lineWidth = 13; g.lineCap = 'round'; g.beginPath(); g.moveTo(sd * W * 0.92, H / 2); g.bezierCurveTo(sd * W * 0.5, 80, sd * W * 0.75, 40, sd * W * 0.3, 22); g.stroke();
      // spine shade
      const sh = g.createLinearGradient(0, 0, sd * 70, 0); sh.addColorStop(0, 'rgba(90,50,10,.32)'); sh.addColorStop(1, 'rgba(90,50,10,0)'); g.fillStyle = sh; g.fillRect(sd < 0 ? -70 : 0, -H, 70, H * 2);
      g.restore(); });
    // little world: the tall tower on the left page, a wall + a small tower on the right
    const SC = SCENES[look] || SCENES.classic; scene(g, L, SC[0], -1); scene(g, L, SC[1], 1);
    // gilded corners + spine
    g.strokeStyle = 'rgba(60,30,10,.55)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, -H / 2 + 24); g.lineTo(0, H / 2 + 4); g.stroke();
    g.restore(); }

  // ---------- the TD shield: wood planks in a steel rim, a castle turret peeking over the right shoulder ----------
  function shieldPath(g, w, h){ g.beginPath(); g.moveTo(-w / 2, -h / 2 + 10); g.quadraticCurveTo(0, -h / 2 - 12, w / 2, -h / 2 + 10);
    g.bezierCurveTo(w / 2, h * 0.1, w * 0.3, h * 0.36, 0, h / 2); g.bezierCurveTo(-w * 0.3, h * 0.36, -w / 2, h * 0.1, -w / 2, -h / 2 + 10); g.closePath(); }
  function turret(g, L, x, y, s){   // square castle turret with battlements (behind the shield)
    g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = lin(g, -30, 0, 30, 0, [L.stone[0], L.stone[1], L.stone[2]]); g.strokeStyle = L.ink; g.lineWidth = 4; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(-30, 40); g.lineTo(-30, -40); [-30, -12, 6, 24].forEach((bx, i) => { g.lineTo(bx, -54); g.lineTo(bx + 12, -54); g.lineTo(bx + 12, -40); if(i < 3) g.lineTo(bx + 18, -40); }); g.lineTo(36, -40); g.lineTo(36, 40); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 2; for(let r = -26; r < 40; r += 14){ g.beginPath(); g.moveTo(-30, r); g.lineTo(36, r); g.stroke(); }
    g.fillStyle = L.ink; g.beginPath(); g.moveTo(-4, 4); g.lineTo(-4, -10); g.arc(3, -10, 7, Math.PI, 0); g.lineTo(10, 4); g.closePath(); g.fill(); g.restore(); }
  // T and D as shapes (glyph box 0..w × 0..110) so each can be its own material
  function pathT(g){ g.beginPath(); g.moveTo(0, 0); g.lineTo(88, 0); g.lineTo(88, 34); g.lineTo(80, 34); g.quadraticCurveTo(76, 24, 58, 24); g.lineTo(58, 98); g.lineTo(66, 104); g.lineTo(66, 110);
    g.lineTo(22, 110); g.lineTo(22, 104); g.lineTo(30, 98); g.lineTo(30, 24); g.quadraticCurveTo(12, 24, 8, 34); g.lineTo(0, 34); g.closePath(); }
  function pathD(g){ g.beginPath(); g.moveTo(0, 0); g.lineTo(46, 0); g.bezierCurveTo(76, 0, 92, 24, 92, 55); g.bezierCurveTo(92, 86, 76, 110, 46, 110); g.lineTo(0, 110); g.lineTo(0, 102); g.lineTo(8, 98);
    g.lineTo(8, 12); g.lineTo(0, 8); g.closePath(); g.moveTo(32, 22); g.lineTo(32, 88); g.lineTo(44, 88); g.bezierCurveTo(60, 88, 66, 74, 66, 55); g.bezierCurveTo(66, 36, 60, 22, 44, 22); g.closePath(); }
  function letter(g, L, which, x, y, s){
    const M = which === 'T' ? L.steel : L.stone, P = which === 'T' ? pathT : pathD;
    g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round';
    P(g); g.lineWidth = 15; g.strokeStyle = L.ink; g.stroke();                      // thick dark outline
    g.save(); g.translate(0, 5); P(g); g.fillStyle = M[2]; g.fill('evenodd'); g.restore();   // bevel shadow (depth)
    P(g); g.fillStyle = lin(g, 0, 0, 0, 110, [M[0], M[1], M[1], M[2]]); g.fill('evenodd');
    g.save(); P(g); g.clip('evenodd');
    if(which === 'D'){ g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 2.4; [[0, 36, 100, 36], [0, 74, 100, 74], [40, 0, 40, 36], [20, 36, 20, 74], [54, 74, 54, 110], [78, 36, 78, 74]].forEach(a => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a[2], a[3]); g.stroke(); }); }
    else { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(-4, 2, 100, 7); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(34, 26, 6, 70); }   // steel shine
    g.restore(); g.restore(); }
  function shield(g, L, s, opts){
    opts = opts || {}; const w = 236, h = 196;
    g.save(); g.scale(s, s);
    turret(g, L, 64, -100, 1.25);
    g.save(); g.translate(0, 6); shieldPath(g, w + 18, h + 18); g.fillStyle = 'rgba(0,0,0,.25)'; g.fill(); g.restore();          // drop shadow
    shieldPath(g, w + 18, h + 18); g.fillStyle = lin(g, 0, -h / 2, 0, h / 2, [L.rim[0], L.rim[1], L.rim[2]]); g.fill(); g.lineWidth = 6; g.strokeStyle = L.ink; g.stroke();   // steel rim
    shieldPath(g, w - 8, h - 8); g.save(); g.clip(); g.fillStyle = lin(g, -w / 2, 0, w / 2, 0, [L.wood[1], L.wood[0], L.wood[1], L.wood[2]]); g.fillRect(-w, -h, w * 2, h * 2);
    g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 3; for(let px = -w / 2 + 39; px < w / 2; px += 39){ g.beginPath(); g.moveTo(px, -h); g.lineTo(px, h); g.stroke(); }   // planks
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.6; for(let px = -w / 2 + 12; px < w / 2; px += 23){ g.beginPath(); g.moveTo(px, -h); g.bezierCurveTo(px + 6, -20, px - 6, 20, px + 2, h); g.stroke(); }   // grain
    g.restore(); shieldPath(g, w - 8, h - 8); g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.35)'; g.stroke();
    g.fillStyle = L.rim[0]; g.strokeStyle = L.ink; g.lineWidth = 2; [[-104, -78], [104, -78], [-96, 10], [96, 10], [0, 92]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill(); g.stroke(); });   // rivets
    letter(g, L, 'T', -90, -56, 0.9); letter(g, L, 'D', 4, -56, 0.9);
    g.restore(); }

  // ---------- the "Stories" wordmark: gold, dark ink outline, magic glow ----------
  function wordmark(g, L, text, x, y, size, maxW){
    g.save(); g.font = FONT(700, size); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    const tw = g.measureText(text).width, sx = maxW && tw > maxW ? maxW / tw : 1; g.translate(x, y); g.scale(sx, 1);
    g.shadowColor = L.wglow; g.shadowBlur = size * 0.16; g.lineWidth = size * 0.2; g.strokeStyle = L.ink; g.strokeText(text, 0, 0); g.shadowBlur = 0;
    g.fillStyle = L.gold[2]; g.fillText(text, 0, size * 0.06);                                                     // depth
    const gr = g.createLinearGradient(0, -size * 0.42, 0, size * 0.4); gr.addColorStop(0, L.gold[0]); gr.addColorStop(0.2, '#FFFFFF'); gr.addColorStop(0.3, L.gold[0]); gr.addColorStop(0.62, L.gold[1]); gr.addColorStop(1, L.gold[2]);
    g.fillStyle = gr; g.fillText(text, 0, 0);
    g.restore(); }
  function ribbon(g, L, text, y, w){
    g.save(); g.translate(0, y); g.lineJoin = 'round';
    [-1, 1].forEach(sd => { g.fillStyle = L.ribbon[1]; g.strokeStyle = L.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(sd * (w / 2 - 6), -12); g.lineTo(sd * (w / 2 + 34), -12); g.lineTo(sd * (w / 2 + 22), 6); g.lineTo(sd * (w / 2 + 34), 24); g.lineTo(sd * (w / 2 - 6), 24); g.closePath(); g.fill(); g.stroke(); });
    g.fillStyle = lin(g, 0, -20, 0, 20, [L.ribbon[0], L.ribbon[1]]); g.strokeStyle = L.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(-w / 2, -18); g.quadraticCurveTo(0, -26, w / 2, -18); g.lineTo(w / 2, 18); g.quadraticCurveTo(0, 10, -w / 2, 18); g.closePath(); g.fill(); g.stroke();
    g.font = FONT(700, 22); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = L.rtext; const tw = g.measureText(text).width; if(tw > w - 30) g.scale((w - 30) / tw, 1); g.fillText(text, 0, -1); g.restore(); }
  function glint(g, x, y, r, a){ g.save(); g.globalAlpha = a == null ? 1 : a; const gl = g.createRadialGradient(x, y, 0, x, y, r * 1.6); gl.addColorStop(0, 'rgba(255,255,255,.9)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(x, y, r * 1.6, 0, 7); g.fill(); sparkle(g, x, y, r, '#FFFFFF'); sparkle(g, x, y, r * 0.55, '#FFFFFF'); g.restore(); }
  // magic dust: two swirls of glittering dots rising out of the book's spine + twinkles all around (seeded, so the picture never changes)
  function magic(g, L, seed){ const R = rnd(seed || 11);
    [-1, 1].forEach(sd => { for(let i = 0; i < 26; i++){ const t = i / 25, a = t * 3.6, x = sd * (30 + t * 250 + Math.sin(a) * 26), y = 120 - t * 300 + Math.cos(a) * 18, r = 1.8 + R() * 3.2 * (1 - t * 0.4);
      g.save(); g.globalAlpha = 0.35 + 0.6 * (1 - t); g.fillStyle = L.spark[(i + (sd > 0 ? 1 : 0)) % L.spark.length]; g.shadowColor = g.fillStyle; g.shadowBlur = 9; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore();
      if(i % 4 === 2) sparkle(g, x, y, 6 + R() * 5, L.spark[i % L.spark.length], 0.95); } });
    for(let i = 0; i < 54; i++){ const x = -330 + R() * 660, y = -200 + R() * 400, r = 2 + R() * 7; if(Math.abs(x) < 120 && y > -150 && y < 130 && r > 4) continue; sparkle(g, x, y, r, L.spark[i % L.spark.length], 0.55 + R() * 0.45); } }
  function sparkles(g, L, pts){ pts.forEach((p, i) => sparkle(g, p[0], p[1], p[2], L.spark[i % L.spark.length], 0.95)); }

  // ---------- kinds ----------
  function main(g, L){   // unit box 680 × 420
    book(g, L, L._look);
    g.save(); g.translate(0, -66); shield(g, L, 0.72); g.restore();
    magic(g, L, 11);
    g.save(); g.translate(0, -66); shieldGlints(g, 0.72); g.restore();
    wordmark(g, L, 'Stories', 0, 82, 116, 470);
    glint(g, -196, 44, 9); glint(g, 52, 32, 7); glint(g, 214, 70, 8);                                     // on "S", "i" and "s"
    ribbon(g, L, 'TOWER DEFENCE & TALES', 168, 330);
    sparkles(g, L, [[-170, -150, 14], [176, -132, 11], [-262, 20, 9], [268, -40, 12], [150, 132, 9], [-160, 136, 8], [-96, -172, 7], [104, -176, 8]]);
  }
  function wide(g, L){   // unit box 760 × 190: the shield on the left, "Stories" on the right
    g.save(); g.translate(-272, 12); shield(g, L, 0.6); g.restore();
    g.save(); g.translate(-272, 12); shieldGlints(g, 0.6); g.restore();
    wordmark(g, L, 'Stories', 92, 10, 118, 500); glint(g, -78, -14, 8); glint(g, 140, -30, 6);
    sparkles(g, L, [[-176, -64, 11], [330, -62, 10], [-350, 62, 7], [250, 66, 7], [-20, -72, 6]]);
  }
  function shieldGlints(g, s){ g.save(); g.scale(s, s); glint(g, -112, -86, 12); glint(g, 100, 40, 8); glint(g, -46, -40, 7, 0.9); g.restore(); }   // on the rim + the T
  function badge(g, L){ g.save(); g.translate(0, 18); shield(g, L, 0.92); shieldGlints(g, 0.92); g.restore(); sparkles(g, L, [[-110, -96, 12], [112, 86, 9], [-118, 70, 6], [116, -40, 7]]); }   // unit box 272 × 280

  const BOX = {main: [680, 420], wide: [760, 190], badge: [272, 280]};
  function draw(g, kind, x, y, px, look){
    const L = Object.assign({_look: LOOK[look] ? look : 'classic'}, LOOK[look] || LOOK.classic), [bw] = BOX[kind] || BOX.badge, s = px / bw;
    g.save(); g.translate(x, y); g.scale(s, s);
    kind === 'main' ? main(g, L) : kind === 'wide' ? wide(g, L) : badge(g, L);
    g.restore(); }
  function pic(kind, look, px){
    px = Math.max(16, Math.round(px)); const key = kind + ':' + (LOOK[look] ? look : 'classic') + ':' + px; if(cache[key]) return cache[key];
    const [bw, bh] = BOX[kind] || BOX.badge, c = document.createElement('canvas'); c.width = px; c.height = Math.round(px * bh / bw);
    draw(c.getContext('2d'), kind, px / 2, c.height / 2, px, look);
    return (cache[key] = c); }
  const url = (kind, look, px) => pic(kind, look, px).toDataURL('image/png');
  const clear = () => { for(const k in cache) delete cache[k]; };
  return {draw, pic, url, clear, LOOK, BOX, SCENES};
})();
if(typeof window !== 'undefined') window.TdLogo = TdLogo;

/* 🎛️ TD_LOGO_CFG — the ONE place to control how the logo sits in this page */
const TD_LOGO_CFG = {
  title:  {kind: 'wide', h: 86, hPhone: 64, hShort: 44, maxW: 540, screens: ['scr-player', 'scr-menu'], look: 'classic'},   // 👤 Who's reading + 📚 book shelf title rows (px tall)
  result: {kind: 'badge', w: 60, wPhone: 48, on: true},                                                                    // corner badge on the 🏁 result card (look = the book you played)
  cover:  {kind: 'main', look: 'book'}                                                                                     // for the 🎬 cover later (🧱 B3): TdLogo.draw(g, 'main', x, y, px, look)
};
function tdBookLook(){ try { return TdLogo.LOOK[S.book] ? S.book : 'classic'; } catch(e){ return 'classic'; } }
function tdLogos(){
  try {
    const C = TD_LOGO_CFG.title, short = innerHeight < 520 && innerWidth > innerHeight, phone = innerWidth < 640;
    const h = short ? C.hShort : phone ? C.hPhone : C.h, dpr = Math.min(3, window.devicePixelRatio || 1), [bw, bh] = TdLogo.BOX[C.kind], w = Math.round(h * bw / bh);
    C.screens.forEach(id => {
      const t = document.querySelector('#' + id + ' .title'); if(!t) return;
      let im = t.querySelector('.tdl-word');
      if(!im){ im = document.createElement('img'); im.className = 'tdl-word'; im.alt = ''; im.setAttribute('aria-hidden', 'true'); im.draggable = false; t.insertBefore(im, t.querySelector('h1')); }
      const look = C.look === 'book' ? tdBookLook() : C.look, key = look + ':' + w + ':' + dpr;
      if(im.dataset.k !== key){ im.src = TdLogo.url(C.kind, look, w * dpr); im.dataset.k = key; }
      t.style.setProperty('--tdl-h', h + 'px'); t.style.setProperty('--tdl-maxw', C.maxW + 'px'); t.classList.add('has-logo');
    });
  } catch(e){ document.querySelectorAll('.title.has-logo').forEach(t => t.classList.remove('has-logo')); }   // any failure → today's 🏰 + text title
}
function tdResultBadge(){
  try {
    const C = TD_LOGO_CFG.result, card = document.getElementById('result-card'); if(!C.on || !card || !card.querySelector('#res-cv') || card.querySelector('.tdl-badge')) return;   // real results only
    const w = innerWidth < 640 ? C.wPhone : C.w, dpr = Math.min(3, window.devicePixelRatio || 1), im = document.createElement('img');
    im.className = 'tdl-badge'; im.alt = ''; im.setAttribute('aria-hidden', 'true'); im.draggable = false; im.src = TdLogo.url(C.kind, tdBookLook(), w * dpr); im.style.setProperty('--tdl-badge', w + 'px');
    card.prepend(im);
  } catch(e){}
}
(function(){
  const ss = showScreen; showScreen = function(){ const r = ss.apply(this, arguments); tdLogos(); return r; };
  const sr = showResult; showResult = function(){ const r = sr.apply(this, arguments); tdResultBadge(); return r; };
  let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(tdLogos, 120); });
  tdLogos();
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(() => { TdLogo.clear(); document.querySelectorAll('.tdl-word').forEach(im => delete im.dataset.k); tdLogos(); });   // Fredoka arrived → redraw sharp
})();
/* 🏷️ TD LOGO END */