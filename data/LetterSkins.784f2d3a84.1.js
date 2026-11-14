
window.LetterSkins = (function(){
  // v = vowel colours, c = consonant colours: [box top, box bottom, letter, edge]; house = the GeoRead house theme it belongs to; extra = unlocked by the item line (round 4)
  const SKINS = {
    classic: {name: 'Classic',       icon: '🔤', v: ['#FF7A88', '#E8394D', '#FFFFFF', '#A81E30'], c: ['#6FA3FF', '#2F6BEA', '#FFFFFF', '#1C3F94']},
    stone:   {name: 'Carved stone',  icon: '🦖', house: 'dino',  v: ['#B9CF8E', '#7E9D55', '#2E3A1B', '#55692F'], c: ['#CFC2AC', '#9C8C73', '#3B3024', '#6E604C']},
    coral:   {name: 'Coral boxes',   icon: '🐙', house: 'sea',   v: ['#5FE3D5', '#17A99B', '#FFFFFF', '#0B6E66'], c: ['#FFA28F', '#F2624B', '#FFFFFF', '#B23A27']},
    neon:    {name: 'Neon lights',   icon: '🪩', house: 'disco', v: ['#2A0C3D', '#14051F', '#FF52D9', '#FF52D9'], c: ['#0B1C33', '#050E1C', '#3CF2FF', '#3CF2FF']},
    metal:   {name: 'Metal crates',  icon: '🤖', house: 'robot', v: ['#FFC14D', '#E58A0F', '#3A2400', '#8F5300'], c: ['#B7C3CF', '#7D8B99', '#1E2A36', '#4D5966']},
    star:    {name: 'Star glow',     icon: '🪐', house: 'space', v: ['#8A55E6', '#4E1FA8', '#FFE27A', '#2C0D6B'], c: ['#3552B8', '#1B2A6B', '#E8F1FF', '#0E1640']},
    marble:  {name: 'Marble',        icon: '☁️', house: 'sky',   v: ['#FFF0F3', '#F3C9D3', '#C9930A', '#C79AA6'], c: ['#FFFFFF', '#E3E6EE', '#2C3E70', '#AEB6C8']},
    candy:   {name: 'Candy',         icon: '🍬', extra: 1, v: ['#FF9BD2', '#FF4FA8', '#FFFFFF', '#C21F75'], c: ['#9BF2D6', '#3FD6A8', '#FFFFFF', '#1E8A69']},
    wood:    {name: 'Wood blocks',   icon: '🪵', extra: 2, v: ['#F7C873', '#D99536', '#5A2E0B', '#8A5218'], c: ['#E3B98A', '#B5824F', '#4A2A12', '#7A4F27']},
    jelly:   {name: 'Jelly',         icon: '🟢', extra: 3, v: ['#C79BFF', '#8E4DFF', '#FFFFFF', '#5A1FC2'], c: ['#9DFFB0', '#3CDB63', '#FFFFFF', '#1E8F3A']},
    galaxy:  {name: 'Galaxy',        icon: '🌌', extra: 4, v: ['#FF6FB5', '#6A2BB8', '#FFFFFF', '#2A0B55'], c: ['#4A6BFF', '#120E44', '#FFFFFF', '#08062A']},
    gold:    {name: 'Gold',          icon: '🏆', extra: 5, v: ['#FFE9A8', '#E7B53A', '#7A1E1E', '#9C6A00'], c: ['#FFF4CC', '#D9A925', '#4A3200', '#8C6400']},
    rainbow: {name: 'Rainbow',       icon: '🌈', extra: 6, v: ['#FFFFFF', '#FFE3F6', '#E5297A', '#C21F75'], c: ['#FFFFFF', '#E3F3FF', '#2F6BEA', '#1C3F94']},
  };
  const KEYS = Object.keys(SKINS);

  /* 🏭 crafted skins (Artifactory af-4): things the family made in Artifactory become skins here, "made by …" (list = localStorage sp_artskins, written by Artifactory + Collection) */
  let ART_DONE = false;
  function artList(kinds){ let L = []; try{ L = JSON.parse(localStorage.getItem('sp_artskins') || '{}').list || []; }catch(e){} return L.filter(a => a && a.id && /^[a-z0-9]+$/i.test(a.id) && (!kinds || kinds.indexOf(a.k) >= 0)).slice(0, 24); }
  function artHex(h, f){ h = /^#[0-9a-f]{6}$/i.test(h || '') ? h : '#C08A4E'; const n = parseInt(h.slice(1), 16), m = c => Math.max(0, Math.min(255, Math.round(f > 0 ? c + (255 - c) * f : c * (1 + f)))); return '#' + ((1 << 24) + (m(n >> 16) << 16) + (m((n >> 8) & 255) << 8) + m(n & 255)).toString(16).slice(1); }
  function artMix(a, b, t){ const p = h => { h = /^#[0-9a-f]{6}$/i.test(h || '') ? h : '#888888'; const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }, A = p(a), B = p(b); return '#' + ((1 << 24) + A.reduce((s, v, i) => s + (Math.round(v + (B[i] - v) * t) << (16 - i * 8)), 0)).toString(16).slice(1); }
  function craftLink(mode){ const base = typeof WEBAPP_URL !== 'undefined' ? WEBAPP_URL : '', who = typeof CURRENT_PLAYER !== 'undefined' && CURRENT_PLAYER ? '&player=' + encodeURIComponent(CURRENT_PLAYER) : ''; const u = base + '?page=artifactory&mode=' + mode + who; if(window.UI && UI.go) UI.go(u, 'craft', 'Opening Artifactory'); else location.href = u; }
  function craftChip(box, mode, cls){ if(!box || box.querySelector('.art-craft')) return; const b = document.createElement('button'); b.className = (cls || '') + ' art-craft'; b.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:6px 12px;margin:3px;border-radius:999px;border:2px dashed currentColor;background:transparent;font:inherit;font-weight:800;cursor:pointer;color:inherit;'; b.setAttribute('data-sound', 'pop'); b.title = 'Make your own in 🏭 Artifactory'; b.innerHTML = '<span>✨ Craft a new one</span>'; b.onclick = e => { e.stopPropagation(); craftLink(mode); }; box.appendChild(b); }
  function artSkins(){ if(ART_DONE) return; ART_DONE = true; artList(['pshape', 'pspin', 'sign', 'board', 'scarf', 'flag', 'cape', 'bag', 'basket', 'hat']).forEach(a => { const k = 'art_' + a.id; if(SKINS[k]) return; const c1 = artHex(a.col, 0), c2 = artHex(a.c2 || artHex(a.col, -0.3), 0);
    SKINS[k] = {name: '🏭 ' + a.n, by: a.by, icon: '🏭', v: [artHex(c1, 0.35), c1, '#FFFFFF', artHex(c1, -0.45)], c: [artHex(c2, 0.35), c2, '#FFFFFF', artHex(c2, -0.45)]}; KEYS.push(k); }); }
  const HOUSE = {dino: 'stone', sea: 'coral', disco: 'neon', robot: 'metal', space: 'star', sky: 'marble'};
  const FREE = KEYS.filter(k => !SKINS[k].extra);           // classic + the 6 house looks
  const EXTRAS = KEYS.filter(k => SKINS[k].extra).sort((a, b) => SKINS[a].extra - SKINS[b].extra);   // unlocked in order by the item line "letterskin"
  const key = name => 'sp_letterskin:' + (name || '');
  function get(name){ artSkins(); try{ const v = localStorage.getItem(key(name)); return SKINS[v] || v === 'auto' ? v : 'auto'; }catch(e){ return 'auto'; } }
  function set(name, skin){ try{ localStorage.setItem(key(name), SKINS[skin] ? skin : 'auto'); }catch(e){} }
  // 'auto' → the house look (GeoRead) or classic (Lettercraft has no house)
  function resolve(skin, house){ artSkins(); return SKINS[skin] ? skin : (HOUSE[house] || 'classic'); }
  // owned = number of extras unlocked (item line step count); returns true when the player may use the skin
  function canUse(skin, owned){ if(skin === 'auto' || !SKINS[skin]) return true; const x = SKINS[skin].extra; return !x || x <= (owned || 0); }
  // vowel sound? a e i o u + vowel teams (ai ee igh oa oo ar or ur ow oi er …) + magic-e marks ('a_e'); y and qu count as consonants
  function isVowel(t){ t = String(t || '').toLowerCase(); return /^[aeiou]/.test(t) || t === 'igh'; }
  function rr(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function rng(seed){ let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function hashStr(t){ let h = 2166136261; for(let i = 0; i < t.length; i++){ h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function emoji(g, ch, x, y, size){ if(typeof emo === 'function'){ g.fillStyle = '#000'; emo(g, ch, x, y, size); return; } g.save(); g.font = Math.round(size) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000'; g.fillText(ch, x, y + size * 0.05); g.restore(); }
  // one letter box, centred on (x, y), side = size. opts: {vowel (override), face (eyes + mouth: a letter character), mouth: 'open', state: 'lit'|'wrong'|'dim',
  //   magic (✨ magic-e sparkle), silent (faded letter), upper (show capitals), font, alpha, flat (no 3D top — Lettercraft tiles)}
  function draw(g, skinKey, text, x, y, size, opts){
    artSkins(); opts = opts || {}; const sk = SKINS[skinKey] || SKINS.classic, raw = String(text == null ? '' : text), t = raw.replace('_e', ''), vow = opts.vowel != null ? !!opts.vowel : isVowel(raw), P = vow ? sk.v : sk.c, s = size;
    const depth = opts.flat ? 0 : s * 0.12, w = s - depth, h = s - depth, x0 = x - s / 2, y0 = y - s / 2 + depth, R = s * 0.14, rnd = rng(hashStr(skinKey + raw));
    g.save(); if(opts.alpha != null) g.globalAlpha *= opts.alpha;
    // shadow
    g.fillStyle = 'rgba(0,0,0,0.22)'; rr(g, x0 + s * 0.04, y0 + s * 0.06, w, h, R); g.fill();
    // top + side (3D)
    if(depth){ g.fillStyle = shadeHex(P[0], 0.25); g.beginPath(); g.moveTo(x0 + R * 0.6, y0); g.lineTo(x0 + depth + R * 0.6, y0 - depth); g.lineTo(x0 + w + depth, y0 - depth); g.lineTo(x0 + w, y0 + R * 0.4); g.lineTo(x0 + w - R, y0); g.closePath(); g.fill();
      g.fillStyle = P[3]; g.beginPath(); g.moveTo(x0 + w, y0 + R * 0.4); g.lineTo(x0 + w + depth, y0 - depth); g.lineTo(x0 + w + depth, y0 + h - depth - R * 0.4); g.lineTo(x0 + w, y0 + h - R * 0.5); g.closePath(); g.fill(); }
    // front face
    const gr = g.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, P[0]); gr.addColorStop(1, P[1]); g.fillStyle = gr; rr(g, x0, y0, w, h, R); g.fill();
    g.save(); rr(g, x0, y0, w, h, R); g.clip(); paintMaterial(g, skinKey, vow, P, x0, y0, w, h, rnd); g.restore();
    g.strokeStyle = P[3]; g.lineWidth = Math.max(1, s * 0.035); rr(g, x0, y0, w, h, R); g.stroke();
    // 💎 vowel gem (top-left) — the "vowel hero" mark in every skin
    if(vow){ const gx = x0 + w * 0.15, gy = y0 + h * 0.15, gs = s * 0.07; g.fillStyle = '#FFE066'; g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = Math.max(1, s * 0.012);
      g.beginPath(); g.moveTo(gx, gy - gs); g.lineTo(gx + gs, gy); g.lineTo(gx, gy + gs); g.lineTo(gx - gs, gy); g.closePath(); g.fill(); g.stroke(); }
    if(opts.state === 'lit'){ g.strokeStyle = '#FFE066'; g.lineWidth = s * 0.07; rr(g, x0 - s * 0.02, y0 - s * 0.02, w + s * 0.04, h + s * 0.04, R * 1.1); g.stroke(); }
    if(opts.state === 'wrong'){ g.strokeStyle = '#FF3B3B'; g.lineWidth = s * 0.07; rr(g, x0, y0, w, h, R); g.stroke(); }
    // the letter(s)
    const face = !!opts.face, cx = x0 + w / 2, cy = y0 + h * (face ? 0.6 : 0.53), shown = opts.upper ? t.toUpperCase() : t;
    let fs = s * (shown.length >= 3 ? 0.36 : shown.length === 2 ? 0.46 : 0.62) * (face ? 0.82 : 1);
    g.font = '700 ' + Math.round(fs) + 'px ' + (opts.font || '"Fredoka","Nunito",sans-serif'); g.textAlign = 'center'; g.textBaseline = 'middle';
    const la = opts.silent ? 0.42 : 1;
    letterInk(g, skinKey, vow, P, shown, cx, cy, s, la);
    if(face) drawFace(g, cx, y0 + h * 0.2, s, opts.mouth, P);
    if(opts.magic){ ['✨'].forEach(() => emoji(g, '✨', x0 + w * 0.84, y0 + h * 0.18, s * 0.26)); }
    if(opts.state === 'dim'){ g.fillStyle = 'rgba(255,255,255,0.45)'; rr(g, x0, y0, w, h, R); g.fill(); }
    g.restore();
  }
  function shadeHex(hex, f){ const n = parseInt(String(hex).slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255, m = c => Math.max(0, Math.min(255, Math.round(f > 0 ? c + (255 - c) * f : c * (1 + f)))); return 'rgb(' + m(r) + ',' + m(gg) + ',' + m(b) + ')'; }
  // texture on the front face, per skin
  function paintMaterial(g, k, vow, P, x0, y0, w, h, rnd){
    g.lineCap = 'round';
    if(k === 'stone'){ g.strokeStyle = 'rgba(40,30,20,0.35)'; g.lineWidth = Math.max(1, w * 0.02); for(let i = 0; i < 3; i++){ let x = x0 + rnd() * w, y = y0 + rnd() * h; g.beginPath(); g.moveTo(x, y); for(let j = 0; j < 3; j++){ x += (rnd() - 0.5) * w * 0.3; y += rnd() * h * 0.18; g.lineTo(x, y); } g.stroke(); }
      g.fillStyle = 'rgba(255,255,255,0.12)'; for(let i = 0; i < 7; i++){ g.beginPath(); g.arc(x0 + rnd() * w, y0 + rnd() * h, w * 0.03, 0, 7); g.fill(); } }
    else if(k === 'coral'){ g.fillStyle = 'rgba(255,255,255,0.28)'; for(let i = 0; i < 6; i++){ g.beginPath(); g.arc(x0 + rnd() * w, y0 + rnd() * h, w * (0.03 + rnd() * 0.05), 0, 7); g.fill(); }
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = w * 0.025; g.beginPath(); g.moveTo(x0, y0 + h * 0.85); for(let i = 0; i <= 6; i++) g.lineTo(x0 + w * i / 6, y0 + h * (0.85 + (i % 2 ? -0.05 : 0.04))); g.stroke(); }
    else if(k === 'neon'){ g.strokeStyle = P[3]; g.globalAlpha = 0.9; g.lineWidth = w * 0.04; g.shadowColor = P[3]; g.shadowBlur = w * 0.15; rr(g, x0 + w * 0.08, y0 + h * 0.08, w * 0.84, h * 0.84, w * 0.12); g.stroke(); g.shadowBlur = 0; g.globalAlpha = 1; }
    else if(k === 'metal'){ g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = w * 0.05; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + w, y0 + h); g.stroke(); g.strokeRect(x0 + w * 0.06, y0 + h * 0.06, w * 0.88, h * 0.88);
      g.fillStyle = 'rgba(255,255,255,0.7)'; [[0.12, 0.12], [0.88, 0.12], [0.12, 0.88], [0.88, 0.88]].forEach(p => { g.beginPath(); g.arc(x0 + w * p[0], y0 + h * p[1], w * 0.035, 0, 7); g.fill(); });
      if(vow){ g.fillStyle = 'rgba(0,0,0,0.18)'; for(let i = -2; i < 6; i++){ g.beginPath(); g.moveTo(x0 + i * w * 0.2, y0 + h); g.lineTo(x0 + i * w * 0.2 + w * 0.1, y0 + h); g.lineTo(x0 + i * w * 0.2 + w * 0.2, y0 + h * 0.88); g.lineTo(x0 + i * w * 0.2 + w * 0.1, y0 + h * 0.88); g.fill(); } } }
    else if(k === 'star' || k === 'galaxy'){ for(let i = 0; i < 9; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.4 + rnd() * 0.6) + ')'; g.beginPath(); g.arc(x0 + rnd() * w, y0 + rnd() * h, w * (0.01 + rnd() * 0.02), 0, 7); g.fill(); }
      if(k === 'galaxy'){ const gr = g.createRadialGradient(x0 + w * 0.3, y0 + h * 0.7, 1, x0 + w * 0.3, y0 + h * 0.7, w * 0.6); gr.addColorStop(0, 'rgba(255,120,220,0.5)'); gr.addColorStop(1, 'rgba(255,120,220,0)'); g.fillStyle = gr; g.fillRect(x0, y0, w, h); } }
    else if(k === 'marble'){ g.strokeStyle = vow ? 'rgba(201,147,10,0.45)' : 'rgba(120,128,150,0.35)'; g.lineWidth = w * 0.02; for(let i = 0; i < 3; i++){ g.beginPath(); let x = x0 - w * 0.1, y = y0 + rnd() * h; g.moveTo(x, y); for(let j = 0; j < 4; j++){ x += w * 0.32; y += (rnd() - 0.5) * h * 0.35; g.quadraticCurveTo(x - w * 0.15, y + (rnd() - 0.5) * h * 0.3, x, y); } g.stroke(); } }
    else if(k === 'candy'){ g.fillStyle = 'rgba(255,255,255,0.35)'; for(let i = -3; i < 8; i++){ g.beginPath(); g.moveTo(x0 + i * w * 0.22, y0); g.lineTo(x0 + i * w * 0.22 + w * 0.1, y0); g.lineTo(x0 + i * w * 0.22 + w * 0.1 + h, y0 + h); g.lineTo(x0 + i * w * 0.22 + h, y0 + h); g.fill(); } }
    else if(k === 'wood'){ g.strokeStyle = 'rgba(90,46,11,0.28)'; g.lineWidth = w * 0.018; for(let i = 1; i < 6; i++){ g.beginPath(); const y = y0 + h * i / 6; g.moveTo(x0, y); g.bezierCurveTo(x0 + w * 0.3, y + (rnd() - 0.5) * h * 0.1, x0 + w * 0.7, y + (rnd() - 0.5) * h * 0.1, x0 + w, y); g.stroke(); } }
    else if(k === 'jelly'){ const gr = g.createLinearGradient(x0, y0, x0 + w, y0 + h); gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(0.4, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x0, y0, w, h); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(x0 + w * 0.3, y0 + h * 0.22, w * 0.16, h * 0.06, -0.4, 0, 7); g.fill(); }
    else if(k === 'gold'){ const gr = g.createLinearGradient(x0, y0, x0 + w, y0 + h); gr.addColorStop(0.35, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.65, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x0, y0, w, h); }
    else if(k === 'rainbow'){ const cols = ['#FF5E5E', '#FFA63D', '#FFE14D', '#5EDB6A', '#4FB3FF', '#9B6BFF']; cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(x0, y0 + h * (0.84 + i * 0.027), w, h * 0.028); }); }
    else { g.fillStyle = 'rgba(255,255,255,0.22)'; rr(g, x0 + w * 0.08, y0 + h * 0.06, w * 0.84, h * 0.22, w * 0.1); g.fill(); }   // classic shine
  }
  // the letter ink per skin (carved, glowing, stencil …)
  function letterInk(g, k, vow, P, shown, cx, cy, s, la){
    g.globalAlpha *= la;
    if(k === 'stone'){ g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillText(shown, cx + s * 0.015, cy + s * 0.02); g.fillStyle = P[2]; g.fillText(shown, cx, cy); }
    else if(k === 'neon' || k === 'star' || k === 'galaxy'){ g.shadowColor = P[2]; g.shadowBlur = s * 0.16; g.fillStyle = P[2]; g.fillText(shown, cx, cy); g.shadowBlur = 0; g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = g.font; g.fillText(shown, cx, cy); g.fillStyle = P[2]; g.globalAlpha *= 0.55; g.fillText(shown, cx, cy); }
    else if(k === 'marble' || k === 'gold'){ g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillText(shown, cx + s * 0.012, cy + s * 0.02); g.fillStyle = P[2]; g.fillText(shown, cx, cy); }
    else if(k === 'rainbow'){ const gr = g.createLinearGradient(cx - s * 0.3, 0, cx + s * 0.3, 0); ['#FF4D6D', '#FFA63D', '#3FC46A', '#3A8BFF', '#9B6BFF'].forEach((c, i) => gr.addColorStop(i / 4, c)); g.fillStyle = gr; g.fillText(shown, cx, cy); }
    else { g.lineJoin = 'round'; g.strokeStyle = 'rgba(0,0,0,0.28)'; g.lineWidth = s * 0.06; g.strokeText(shown, cx, cy + s * 0.012); g.fillStyle = P[2]; g.fillText(shown, cx, cy); }
    g.globalAlpha /= la;
  }
  // a friendly letter character: two eyes + a mouth (our own simple design)
  function drawFace(g, cx, ey, s, mouth, P){
    const ex = s * 0.14, er = s * 0.065;
    [-1, 1].forEach(d => { g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(cx + d * ex, ey, er, er * 1.15, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = Math.max(1, s * 0.012); g.stroke();
      g.fillStyle = '#1B1B2B'; g.beginPath(); g.arc(cx + d * ex + er * 0.15, ey + er * 0.15, er * 0.55, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(cx + d * ex + er * 0.35, ey - er * 0.15, er * 0.2, 0, 7); g.fill(); });
    g.fillStyle = 'rgba(255,120,150,0.55)'; [-1, 1].forEach(d => { g.beginPath(); g.ellipse(cx + d * s * 0.27, ey + s * 0.07, s * 0.05, s * 0.03, 0, 0, 7); g.fill(); });
    if(mouth === 'open'){ g.fillStyle = '#7A1E2E'; g.beginPath(); g.ellipse(cx, ey + s * 0.1, s * 0.05, s * 0.04, 0, 0, 7); g.fill(); }
    else { g.strokeStyle = '#3A1E2E'; g.lineWidth = Math.max(1, s * 0.02); g.beginPath(); g.arc(cx, ey + s * 0.06, s * 0.05, 0.2, Math.PI - 0.2); g.stroke(); }
  }
  // cached canvas of one box (for per-frame drawing: drawImage only) — key by skin + text + px + options
  const CV = new Map();
  function canvasFor(skin, text, px, opts){
    opts = opts || {}; const k = [skin, text, px, opts.face ? 1 : 0, opts.mouth || '', opts.magic ? 1 : 0, opts.silent ? 1 : 0, opts.upper ? 1 : 0, opts.vowel == null ? '' : opts.vowel ? 1 : 0, opts.state || '', opts.flat ? 1 : 0].join('|');
    const hit = CV.get(k); if(hit) return hit;
    if(CV.size > 400) CV.clear();
    const c = document.createElement('canvas'), p = Math.max(8, Math.round(px)); c.width = c.height = Math.round(p * 1.18);
    draw(c.getContext('2d'), skin, text, c.width / 2, c.height / 2, p, opts); CV.set(k, c); return c;
  }
  const URLS = new Map();
  function url(skin, text, px, opts){ const c = canvasFor(skin, text, px || 96, opts), k = c; if(URLS.has(k)) return URLS.get(k); let u = ''; try{ u = c.toDataURL('image/png'); }catch(e){} URLS.set(k, u); if(URLS.size > 400) URLS.clear(); return u; }
  function img(skin, text, cls, opts){ const u = url(skin, text, 96, opts); return u ? '<img class="lsk ' + (cls || '') + '" alt="' + String(text).replace(/[<>"&]/g, '') + '" draggable="false" src="' + u + '">' : ''; }
  // chips to pick a skin: 'auto' first (label from autoLabel), then every skin; owned = extras unlocked (number); onPick(skinKey)
  function chips(box, current, onPick, opts){
    artSkins(); opts = opts || {}; box.innerHTML = '';
    (opts.noAuto ? [] : ['auto']).concat(KEYS).forEach(k => {
      const ok = canUse(k, opts.owned), b = document.createElement('button'); b.className = 'chip lsk-chip' + (k === current ? ' on' : '') + (ok ? '' : ' lock'); b.setAttribute('data-sound', ok ? 'pop' : 'none'); b.setAttribute('data-skin', k);
      const show = k === 'auto' ? resolve('auto', opts.house) : k;
      b.innerHTML = '<span class="lsk-pair">' + img(show, 'a', 'lsk-mini') + img(show, 'b', 'lsk-mini') + '</span><span>' + (k === 'auto' ? (opts.autoLabel || '🏠 Auto') : (ok ? '' : '🔒 ') + SKINS[k].name) + '</span>';
      b.onclick = () => { if(!ok){ if(window.UISound) UISound.play('error'); if(window.UI && UI.toast) UI.toast(opts.lockText || '🔒 Unlock it in the 🎨 Letter looks item line (Collection)'); return; } box.querySelectorAll('.lsk-chip').forEach(x => x.classList.toggle('on', x === b)); onPick(k); };
      box.appendChild(b);
    });
    if(!opts.noCraft) craftChip(box, 'print', 'lsk-craft');
  }
  return {artSkins, craftLink, SKINS, KEYS, FREE, EXTRAS, HOUSE, get, set, resolve, canUse, isVowel, draw, canvasFor, url, img, chips};
})();
