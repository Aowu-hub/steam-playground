
var Comic = (function(){
  'use strict';
  const KEY = n => 'sp_comics:' + (n || 'Guest');
  function enabled(name){ try{ return localStorage.getItem(KEY(name)) !== '0'; }catch(e){ return true; } }
  function set(name, on){ try{ localStorage.setItem(KEY(name), on ? '1' : '0'); }catch(e){} }
  function chip(btn, name, onChange){ if(!btn) return; const paint = () => { const on = enabled(name); btn.textContent = '💬 Comics: ' + (on ? 'On' : 'Off'); btn.classList.toggle('ck-chipoff', !on); btn.setAttribute('aria-pressed', on ? 'true' : 'false'); };
    btn.onclick = () => { set(name, !enabled(name)); paint(); if(onChange) onChange(enabled(name)); }; paint(); }

  // ---------- 11 premade designs ----------
  // bg: two colours · fx: background effect · ink: bubble colour · words: default bubble per panel (3 panels; winner = 4)
  const DESIGNS = {
    pow:      {name: '💥 POW smash',      bg: ['#FFD23F', '#FF5D3A'], fx: 'burst',    ink: '#FFE14D', words: ['Here it comes…', 'Sla… SMASH!!!', 'POW!']},
    divemiss: {name: '😱 Diving miss',    bg: ['#9AD1FF', '#3A6FD8'], fx: 'drops',    ink: '#FFFFFF', words: ['It\'s going wide…', 'Sla… DIVE!', 'Sla… so close!']},
    bullseye: {name: '🎯 Bullseye',       bg: ['#FFF4D6', '#FF8A3D'], fx: 'rings',    ink: '#FFE14D', words: ['Aim…', 'Sla… ACE!', 'Bullseye!']},
    rally:    {name: '🔁 Long rally',     bg: ['#C9F7C1', '#2FA36B'], fx: 'arcs',     ink: '#FFFFFF', words: ['Back…', '…and forth…', 'Sla… RALLY!']},
    power:    {name: '⚡ Power play',      bg: ['#E3C9FF', '#6A3DE8'], fx: 'bolt',     ink: '#FFE14D', words: ['Power up!', 'Sla… ZAP!', 'Too strong!']},
    jump:     {name: '🦘 Jump hit',        bg: ['#FFE7A8', '#FF7A1A'], fx: 'uplines',  ink: '#FFFFFF', words: ['High ball!', 'Sla… JUMP!', 'SMASH!!!']},
    slowmo:   {name: '🐢 Slow-mo drop',    bg: ['#D7FBF5', '#18B8A6'], fx: 'dots',     ink: '#FFFFFF', words: ['Soft touch…', 'Sla… plop.', 'Can\'t reach it!']},
    winner:   {name: '🏆 Match winner',    bg: ['#FFF0A6', '#F2B705'], fx: 'confetti', ink: '#FFFFFF', words: ['Game on!', 'The big moment…', 'MATCH POINT!', 'SLA-BRALL!!!']},
    glitch:   {name: '🤖 Robot glitch',    bg: ['#E6E9F0', '#5B6478'], fx: 'glitch',   ink: '#7CFFB2', words: ['Robot calculating…', 'ERROR 404', 'Sla… OOPS!']},
    close:    {name: '🥵 Close call',      bg: ['#FFD6D6', '#E63946'], fx: 'sweat',    ink: '#FFFFFF', words: ['So close…', 'Just in!', 'Sla… PHEW!']},
    dive:     {name: '🤸 Dive!',           bg: ['#BFF3FF', '#0EA5C6'], fx: 'speed',    ink: '#FFFFFF', words: ['Too far!', 'Sla… DIVE!', 'Sla… DIVE… WINNER!!']}
  };
  // what happened → which design (the game passes what it saw in the point)
  function pick(m){ m = m || {};
    if(m.dive) return 'dive'; if(m.diveMiss) return 'divemiss'; if(m.jumpPerfect || m.jump) return 'jump'; if(m.glitch) return 'glitch'; if(m.power) return 'power';
    if(m.ace) return 'bullseye'; if((m.rally || 0) >= 10) return 'rally'; if(m.close) return 'close'; if(m.drop) return 'slowmo'; if(m.smash) return 'pow';
    return ['pow', 'bullseye', 'close', 'rally'][Math.floor(Math.random() * 4)]; }

  // ---------- painting one panel ----------
  function rng(seed){ let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function paintBg(g, w, h, D, t, seed){
    const R = rng(seed), gr = g.createRadialGradient(w * 0.5, h * 0.62, 4, w * 0.5, h * 0.62, Math.max(w, h) * 0.75);
    gr.addColorStop(0, D.bg[0]); gr.addColorStop(1, D.bg[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const cx = w * 0.5, cy = h * 0.6, L = Math.max(w, h);
    g.save();
    if(D.fx === 'burst' || D.fx === 'bolt'){ g.fillStyle = 'rgba(255,255,255,0.28)'; const n = 18; for(let i = 0; i < n; i++){ const a = (i / n) * Math.PI * 2 + t * 0.4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L); g.lineTo(cx + Math.cos(a + 0.12) * L, cy + Math.sin(a + 0.12) * L); g.fill(); } }
    if(D.fx === 'speed' || D.fx === 'dive'){ g.strokeStyle = 'rgba(255,255,255,0.65)'; for(let i = 0; i < 22; i++){ const y = R() * h, x = ((R() * w * 1.4 + t * 900) % (w * 1.4)) - w * 0.2; g.lineWidth = 1 + R() * 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x - w * (0.15 + R() * 0.3), y); g.stroke(); } }
    if(D.fx === 'uplines'){ g.strokeStyle = 'rgba(255,255,255,0.6)'; for(let i = 0; i < 20; i++){ const x = R() * w, y = ((R() * h * 1.4 - t * 700) % (h * 1.4) + h * 1.4) % (h * 1.4) - h * 0.2; g.lineWidth = 1 + R() * 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + h * (0.12 + R() * 0.25)); g.stroke(); } }
    if(D.fx === 'rings'){ g.lineWidth = Math.max(4, w * 0.025); [0.62, 0.46, 0.3, 0.15].forEach((r, i) => { g.strokeStyle = i % 2 ? '#FFFFFF' : '#E63946'; g.beginPath(); g.arc(w * 0.72, h * 0.62, Math.min(w, h) * r * (1 + 0.04 * Math.sin(t * 6)), 0, 7); g.stroke(); }); }
    if(D.fx === 'arcs'){ g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 3; g.setLineDash([8, 7]); for(let i = 0; i < 4; i++){ g.beginPath(); g.ellipse(cx, cy, w * (0.25 + i * 0.09), h * (0.12 + i * 0.07), 0, Math.PI, Math.PI * 2); g.stroke(); } g.setLineDash([]); }
    if(D.fx === 'bolt'){ g.strokeStyle = '#FFE14D'; g.lineWidth = Math.max(3, w * 0.012); g.shadowColor = '#FFF'; g.shadowBlur = 12; for(let k = 0; k < 2; k++){ let x = w * (0.15 + k * 0.7), y = 0; g.beginPath(); g.moveTo(x, y); while(y < h * 0.8){ x += (R() - 0.5) * w * 0.12; y += h * 0.12; g.lineTo(x, y); } g.stroke(); } g.shadowBlur = 0; }
    if(D.fx === 'dots' || D.fx === 'divemiss'){ g.fillStyle = 'rgba(255,255,255,0.35)'; for(let y = 6; y < h; y += 12) for(let x = 6 + (y % 24 ? 6 : 0); x < w; x += 12){ g.beginPath(); g.arc(x, y, 2.2, 0, 7); g.fill(); } }
    if(D.fx === 'drops' || D.fx === 'sweat'){ g.fillStyle = D.fx === 'sweat' ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.55)'; for(let i = 0; i < 9; i++){ const x = R() * w, y = (R() * h + t * 120 * (0.5 + R())) % h, s = 4 + R() * 6; g.beginPath(); g.moveTo(x, y - s * 1.6); g.quadraticCurveTo(x + s, y, x, y + s); g.quadraticCurveTo(x - s, y, x, y - s * 1.6); g.fill(); } }
    if(D.fx === 'confetti'){ const cols = ['#E63946', '#2CA6DE', '#7BC74D', '#FF7EB6', '#FFFFFF', '#6A3DE8']; for(let i = 0; i < 40; i++){ g.fillStyle = cols[i % cols.length]; const x = R() * w, y = (R() * h + t * 90) % h; g.save(); g.translate(x, y); g.rotate(R() * 6 + t * 3); g.fillRect(-4, -2, 8, 4); g.restore(); } }
    if(D.fx === 'glitch'){ for(let i = 0; i < 9; i++){ const y = R() * h, hh = 3 + R() * 10; g.fillStyle = ['rgba(255,0,80,0.35)', 'rgba(0,255,200,0.35)', 'rgba(60,60,255,0.3)'][i % 3]; g.fillRect((R() - 0.5) * 30, y, w, hh); } }
    // halftone in a corner + ink frame
    g.fillStyle = 'rgba(0,0,0,0.12)'; for(let y = 4; y < h * 0.35; y += 9) for(let x = w - 4; x > w * 0.6; x -= 9){ const r = 2.6 * (1 - y / (h * 0.35)) * ((x - w * 0.6) / (w * 0.4)); if(r > 0.2){ g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } }
    g.restore();
  }
  const POSES = {   // poses for AvatarKit drawAvatar (opts.pose) + a tilt
    smash: {armR: 2.9, holdRot: -1.2, armL: 1.2, mouth: 'open'}, jump: {armR: 2.8, armL: 2.2, legL: 0.5, legR: -0.4, mouth: 'open'},
    dive: {armR: 1.6, armL: 1.4, legL: -0.4, legR: 0.6, mouth: 'open', rot: -1.25}, cheer: {armR: 2.7, armL: 2.7, mouth: 'open'},
    sad: {armR: 0.1, armL: 0.1, mouth: 'sad', eyes: 'closed'}, ready: {armR: 0.9, holdRot: 0.4, armL: 0.5}, glitch: {armR: 1.5, armL: -0.6, rot: 0.12, eyes: 'closed'}
  };
  function paintWho(g, w, h, P, t){
    const who = P.who, pose = P.pose || 'ready', base = POSES[pose] || POSES.ready, lift = pose === 'jump' || pose === 'smash' ? h * 0.12 : 0;
    const x = w * (P.x != null ? P.x : 0.36) + (pose === 'dive' ? w * 0.22 : 0), y = h * (pose === 'dive' ? 0.97 : 0.93) - lift, k = h / 118;   // a dive falls sideways from the feet: start it further right
    if(who && who.av && typeof drawAvatar === 'function'){
      try{ drawAvatar(g, {name: who.name || '', av: who.av, dir: P.dir || 1, held: who.held}, x, y, k, {t, pose: Object.assign({}, base), still: true}); }catch(e){}
    } else {   // no avatar: a big emoji (drawn ONCE per panel, never per frame)
      const ch = (who && who.icon) || P.icon || '🤖'; g.font = Math.round(h * 0.45) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(ch, x, y);
    }
    if(P.ball){ const bx = w * (P.ballX || 0.72), by = h * (P.ballY || 0.35), br = Math.max(6, h * 0.06);
      if(typeof P.ball === 'function') P.ball(g, bx, by, br, t); else { g.fillStyle = '#F2FF7A'; g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath(); g.arc(bx, by, br, 0, 7); g.fill(); g.stroke(); }
      g.strokeStyle = 'rgba(17,17,17,0.6)'; g.lineWidth = 2; for(let i = 1; i <= 3; i++){ g.beginPath(); g.moveTo(bx - br * (1.4 + i * 0.7), by + br * (0.4 * i - 0.6)); g.lineTo(bx - br * (2.2 + i * 1.1), by + br * (0.4 * i - 0.6)); g.stroke(); } }
    if(P.who2 && P.who2.av && typeof drawAvatar === 'function'){ try{ drawAvatar(g, {name: P.who2.name || '', av: P.who2.av, dir: -1}, w * 0.8, h * 0.95, k * 0.8, {t, pose: Object.assign({}, POSES[P.pose2 || 'ready'] || POSES.ready), still: true}); }catch(e){} }
  }
  function panelCanvas(D, P, w, h, seed, t){
    const c = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1); c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    const g = c.getContext('2d'); g.scale(dpr, dpr); paintBg(g, w, h, D, t || 0, seed); paintWho(g, w, h, P, t || 0); return c;
  }

  // ---------- state ----------
  let busyUntil = 0, layer = null;
  function busy(){ return performance.now() < busyUntil; }
  function host(tap){ if(!layer){ layer = document.createElement('div'); layer.className = 'ck-layer'; document.body.appendChild(layer); } layer.classList.toggle('tap', !!tap); return layer; }
  function clear(){ if(layer){ layer.innerHTML = ''; layer.classList.remove('tap'); } busyUntil = 0; }
  function speak(text){ try{ if(!window.UISound || !UISound.get().enabled || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(text).replace(/…/g, ', ').replace(/[^\w\s,!?'.-]/g, '')); u.rate = 1.05; u.pitch = 1.2; speechSynthesis.speak(u); }catch(e){} }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const slaHtml = s => esc(s).replace(/…/g, '<span class="dots">…</span>');

  // ⚡ impact panel — slow-mo moment, the game pauses while busy()
  function impact(o){
    o = o || {}; const D = DESIGNS[o.design] || DESIGNS.pow, ms = Math.max(600, Math.min(1500, o.ms || 1000));
    const H = host(false); H.innerHTML = ''; const box = document.createElement('div'); box.className = 'ck-impact'; H.appendChild(box);
    const W = Math.min(innerWidth * 0.92, 640), Hh = Math.min(W * 9 / 16, innerHeight * 0.62);
    const c = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1); c.width = Math.round(W * dpr); c.height = Math.round(Hh * dpr); box.appendChild(c);
    box.insertAdjacentHTML('beforeend', (o.sub ? '<div class="ck-sub">' + esc(o.sub) + '</div>' : '') + '<div class="ck-words">' + slaHtml(o.words || 'Sla… WOW!') + '</div>');
    const g = c.getContext('2d'), t0 = performance.now(), P = {who: o.who, pose: o.pose || 'smash', ball: o.ball, ballX: 0.74, ballY: 0.4, x: 0.34};
    busyUntil = t0 + ms + 200;
    const tick = now => { if(!box.isConnected) return; const t = (now - t0) / 1000;   // slow-mo: the picture creeps (zoom) while the words pop
      g.setTransform(dpr, 0, 0, dpr, 0, 0); const z = 1 + t * 0.06; g.translate(W / 2, Hh / 2); g.scale(z, z); g.translate(-W / 2, -Hh / 2);
      paintBg(g, W, Hh, D, t * 0.25, 7); paintWho(g, W, Hh, P, t * 0.25); if(now - t0 < ms) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    if(o.say !== false) speak(o.words);
    return new Promise(res => setTimeout(() => { box.classList.add('out'); setTimeout(() => { box.remove(); res(); }, 190); }, ms));
  }

  // 🗞️ strip — 3 panels (winner: 4). Tap anywhere to close (or it closes by itself).
  function layoutCols(n, W, H){ let best = {c: n, pw: 0}; for(let c = 1; c <= n; c++){ if(n % c) continue; const rows = Math.ceil(n / c), pw = Math.min((W - (c - 1) * 6) / c, ((H - (rows - 1) * 6) / rows) * 4 / 3); if(pw > best.pw) best = {c, pw}; } return best; }
  function buildStrip(design, o, W, H){
    const D = DESIGNS[design] || DESIGNS.pow, panels = (o.panels || []).slice(0, design === 'winner' ? 4 : 3), n = panels.length || 3;
    const el = document.createElement('div'); el.className = 'ck-strip';
    el.insertAdjacentHTML('beforeend', '<div class="ck-title">' + (o.title ? esc(o.title) : '💥 <b>SLA</b>-COMICS') + ' · ' + esc(D.name) + '</div>');
    const L = layoutCols(n, W - 26, H - 60), pw = Math.floor(L.pw), ph = Math.floor(pw * 0.75), grid = document.createElement('div'); grid.className = 'ck-grid'; grid.style.gridTemplateColumns = 'repeat(' + L.c + ', ' + pw + 'px)'; el.appendChild(grid);
    for(let i = 0; i < n; i++){
      const P = panels[i] || {}, cell = document.createElement('div'); cell.className = 'ck-panel'; cell.style.width = pw + 'px'; cell.style.height = ph + 'px'; cell.style.animationDelay = (o.instant ? 0 : i * 0.45) + 's';
      cell.appendChild(panelCanvas(D, P, pw, ph, 11 + i * 17, i * 0.3));
      cell.insertAdjacentHTML('beforeend', (P.cap ? '<div class="ck-cap">' + esc(P.cap) + '</div>' : '') + '<div class="ck-bub">' + slaHtml(P.words != null ? P.words : D.words[i] || '') + '</div>');
      grid.appendChild(cell);
    }
    return el;
  }
  function strip(design, o){
    o = o || {}; const H = host(true); H.innerHTML = ''; const n = design === 'winner' ? 4 : 3, ms = o.ms || (n === 4 ? 5200 : 3800);
    const el = buildStrip(design, o, innerWidth * 0.96, innerHeight * 0.9); el.insertAdjacentHTML('beforeend', '<div class="ck-hint">tap to close</div>'); H.appendChild(el);
    busyUntil = performance.now() + 60000;
    const words = (o.panels || []).map(p => p.words).filter(Boolean); const last = words[words.length - 1] || (DESIGNS[design] || DESIGNS.pow).words.slice(-1)[0];
    if(o.say !== false) setTimeout(() => speak(last), n * 450);
    return new Promise(res => { let done = false; const close = () => { if(done) return; done = true; clear(); res(); }; H.onclick = close; setTimeout(close, ms); });
  }
  function stripEl(design, o){ const w = Math.min(innerWidth * 0.86, 520); const el = buildStrip(design, Object.assign({instant: true}, o || {}), w, w * 0.62); el.style.boxShadow = '5px 5px 0 rgba(0,0,0,.35)'; el.style.margin = '8px auto'; return el; }

  // 🗯️ Sla… callout
  function callout(text, o){
    o = o || {}; const H = host(false); const d = document.createElement('div'); d.className = 'ck-call' + (o.small ? ' small' : ''); d.innerHTML = slaHtml(text);
    if(o.color) d.style.color = o.color; H.appendChild(d); setTimeout(() => d.remove(), o.small ? 1000 : 1150);
    if(!o.small && o.say !== false) speak(text);
  }
  return {enabled, set, chip, impact, strip, stripEl, callout, busy, clear, pick, DESIGNS, POSES};
})();
