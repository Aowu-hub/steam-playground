
window.PieceSkins = (function(){
  const TYPES = ['k', 'q', 'r', 'b', 'n', 'p'];
  const SIZE_OF = {k: 6, q: 5, r: 4, b: 3, n: 2, p: 1}, TYPE_OF = {6: 'k', 5: 'q', 4: 'r', 3: 'b', 2: 'n', 1: 'p'};
  const NAMES = {k: 'King', q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn'};
  const GLYPH = {k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'};
  // [emoji, name] per chess type, plus the medallion colours of side 1 / side 2 and a little painted extra (acc) for a few
  const SKINS = {
    dino:  {name: 'Dino', icon: '🦖', ring: ['#7BC24F', '#8A5A2B'], pieces: {k: ['🦖', 'T-Rex'], q: ['🐊', 'Spinosaurus', 'sail'], r: ['🦕', 'Brachiosaurus'], b: ['🦅', 'Pterodactyl', 'crest'], n: ['🦏', 'Triceratops', 'horns'], p: ['🥚', 'Dino egg']}},
    sea:   {name: 'Sea', icon: '🐙', ring: ['#4FC3F7', '#0B4F8A'], pieces: {k: ['🦑', 'Kraken'], q: ['🧜', 'Mermaid'], r: ['⛵', 'Ship'], b: ['🐬', 'Dolphin'], n: ['🦈', 'Shark'], p: ['🦀', 'Crab']}},
    dance: {name: 'Dance', icon: '🪩', ring: ['#FF3DA5', '#3A0E5C'], pieces: {k: ['🎧', 'DJ'], q: ['🎤', 'Diva singer'], r: ['🔊', 'Speaker tower'], b: ['🪩', 'Disco ball'], n: ['🕺', 'Breakdancer'], p: ['💿', 'Vinyl record']}},
    robot: {name: 'Robot', icon: '🤖', ring: ['#7FD8FF', '#34495E'], pieces: {k: ['🤖', 'Mega-bot'], q: ['🦾', 'Android'], r: ['🕰️', 'Clock tower'], b: ['🚁', 'Drone'], n: ['🐎', 'Robo-horse', 'bolt'], p: ['⚙️', 'Gear bot']}},
    space: {name: 'Space', icon: '🪐', ring: ['#B9C6FF', '#1B1F4B'], pieces: {k: ['☀️', 'Sun'], q: ['🪐', 'Ringed planet'], r: ['🚀', 'Rocket'], b: ['☄️', 'Comet'], n: ['🛸', 'UFO'], p: ['⭐', 'Little star']}},
    sky:   {name: 'Sky', icon: '⚡', ring: ['#FFE38A', '#5A6B85'], pieces: {k: ['⚡', 'Zeus'], q: ['👑', 'Hera'], r: ['🏛️', 'Temple column'], b: ['🦉', 'Athena\'s owl'], n: ['🦄', 'Pegasus'], p: ['👼', 'Cloud cherub']}},
  };
  const KEYS = Object.keys(SKINS);

  /* 🏭 crafted skins (Artifactory af-4): things the family made in Artifactory become skins here, "made by …" (list = localStorage sp_artskins, written by Artifactory + Collection) */
  let ART_DONE = false;
  function artList(kinds){ let L = []; try{ L = JSON.parse(localStorage.getItem('sp_artskins') || '{}').list || []; }catch(e){} return L.filter(a => a && a.id && /^[a-z0-9]+$/i.test(a.id) && (!kinds || kinds.indexOf(a.k) >= 0)).slice(0, 24); }
  function artHex(h, f){ h = /^#[0-9a-f]{6}$/i.test(h || '') ? h : '#C08A4E'; const n = parseInt(h.slice(1), 16), m = c => Math.max(0, Math.min(255, Math.round(f > 0 ? c + (255 - c) * f : c * (1 + f)))); return '#' + ((1 << 24) + (m(n >> 16) << 16) + (m((n >> 8) & 255) << 8) + m(n & 255)).toString(16).slice(1); }
  function artMix(a, b, t){ const p = h => { h = /^#[0-9a-f]{6}$/i.test(h || '') ? h : '#888888'; const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }, A = p(a), B = p(b); return '#' + ((1 << 24) + A.reduce((s, v, i) => s + (Math.round(v + (B[i] - v) * t) << (16 - i * 8)), 0)).toString(16).slice(1); }
  function craftLink(mode){ const base = typeof WEBAPP_URL !== 'undefined' ? WEBAPP_URL : '', who = typeof CURRENT_PLAYER !== 'undefined' && CURRENT_PLAYER ? '&player=' + encodeURIComponent(CURRENT_PLAYER) : ''; const u = base + '?page=artifactory&mode=' + mode + who; if(window.UI && UI.go) UI.go(u, 'craft', 'Opening Artifactory'); else location.href = u; }
  function craftChip(box, mode, cls){ if(!box || box.querySelector('.art-craft')) return; const b = document.createElement('button'); b.className = (cls || '') + ' art-craft'; b.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:6px 12px;margin:3px;border-radius:999px;border:2px dashed currentColor;background:transparent;font:inherit;font-weight:800;cursor:pointer;color:inherit;'; b.setAttribute('data-sound', 'pop'); b.title = 'Make your own in 🏭 Artifactory'; b.innerHTML = '<span>✨ Craft a new one</span>'; b.onclick = e => { e.stopPropagation(); craftLink(mode); }; box.appendChild(b); }
  function artSkins(){ if(ART_DONE) return; ART_DONE = true; artList(['piece', 'figure', 'trophy']).forEach(a => { const k = 'art_' + a.id; if(SKINS[k]) return; const c = artHex(a.col, 0);
    SKINS[k] = {name: a.n, by: a.by, icon: '🏭', ring: [c, artHex(c, -0.45)], art: a.look, pieces: SKINS.robot.pieces}; KEYS.push(k); }); }
  const key = name => 'sp_pieceskin:' + (name || '');
  function get(name){ artSkins(); try{ const v = localStorage.getItem(key(name)); return SKINS[v] || v === 'classic' ? v : 'classic'; }catch(e){ return 'classic'; } }
  function set(name, skin){ try{ localStorage.setItem(key(name), SKINS[skin] ? skin : 'classic'); }catch(e){} }
  function shade(hex, f){ const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, m = c => Math.max(0, Math.min(255, Math.round(f > 0 ? c + (255 - c) * f : c * (1 + f)))); return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')'; }
  function emoji(g, ch, x, y, size){ if(typeof emo === 'function'){ g.fillStyle = '#000'; emo(g, ch, x, y, size); return; } g.save(); g.font = Math.round(size) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000'; g.fillText(ch, x, y + size * 0.05); g.restore(); }
  // a piece: medallion in the side colour (col overrides it — Alignext uses the player colours), the skin picture, painted extras, rank pips
  // opts: {col, pips: true (show the size as dots, for Stack), alpha}
  function draw(g, skin, t, side, x, y, size, opts){
    artSkins(); opts = opts || {}; const S = SKINS[skin] || SKINS.dino, P = S.pieces[t] || S.pieces.p, col = opts.col || S.ring[side === 2 ? 1 : 0], r = size / 2;
    g.save(); if(opts.alpha != null) g.globalAlpha = opts.alpha;
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(x, y + r * 0.92, r * 0.8, r * 0.2, 0, 0, 7); g.fill();
    const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); gr.addColorStop(0, shade(col, 0.55)); gr.addColorStop(0.8, col); gr.addColorStop(1, shade(col, -0.25));
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.strokeStyle = side === 2 ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.35)'; g.lineWidth = Math.max(1, r * 0.09); g.beginPath(); g.arc(x, y, r * 0.86, 0, 7); g.stroke();
    // painted extras that make a stand-in picture read right
    if(P[2] === 'sail'){ g.fillStyle = '#FF8A3D'; g.beginPath(); g.moveTo(x - r * 0.45, y - r * 0.05); g.quadraticCurveTo(x - r * 0.05, y - r * 0.95, x + r * 0.35, y - r * 0.05); g.closePath(); g.fill(); }
    if(P[2] === 'crest'){ g.fillStyle = '#C0612B'; g.beginPath(); g.moveTo(x + r * 0.05, y - r * 0.55); g.lineTo(x + r * 0.55, y - r * 0.8); g.lineTo(x + r * 0.2, y - r * 0.35); g.fill(); }
    if(P[2] === 'bolt'){ g.fillStyle = '#FFE066'; g.beginPath(); g.moveTo(x + r * 0.45, y - r * 0.75); g.lineTo(x + r * 0.25, y - r * 0.35); g.lineTo(x + r * 0.42, y - r * 0.35); g.lineTo(x + r * 0.22, y + r * 0.05); g.lineTo(x + r * 0.62, y - r * 0.48); g.lineTo(x + r * 0.45, y - r * 0.48); g.closePath(); g.fill(); }
    if(S.art && typeof artDraw === 'function'){ g.save(); g.beginPath(); g.arc(x, y, r * 0.86, 0, 7); g.clip(); artDraw(g, S.art, x, y + r * 0.72, r * 1.4, 1); g.restore(); } else emoji(g, P[0], x, y + r * 0.04, r * 1.25);   // 🏭 crafted piece
    if(P[2] === 'horns'){ g.strokeStyle = '#FFF6E0'; g.lineWidth = Math.max(1.5, r * 0.1); g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r * 0.25, y - r * 0.35); g.lineTo(x - r * 0.42, y - r * 0.7); g.moveTo(x + r * 0.05, y - r * 0.4); g.lineTo(x + r * 0.05, y - r * 0.78); g.stroke(); }
    if(t === 'k'){ g.fillStyle = '#FFD84D'; g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = Math.max(1, r * 0.04); const cy = y - r * 0.98, w = r * 0.5; g.beginPath(); g.moveTo(x - w, cy + r * 0.2); g.lineTo(x - w, cy - r * 0.05); g.lineTo(x - w * 0.5, cy + r * 0.08); g.lineTo(x, cy - r * 0.12); g.lineTo(x + w * 0.5, cy + r * 0.08); g.lineTo(x + w, cy - r * 0.05); g.lineTo(x + w, cy + r * 0.2); g.closePath(); g.fill(); g.stroke(); }
    if(opts.pips){ const n = SIZE_OF[t], pr = Math.max(1.6, r * 0.09); g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1; for(let i = 0; i < n; i++){ const a = Math.PI * 0.62 + (i - (n - 1) / 2) * 0.36; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86, pr, 0, 7); g.fill(); g.stroke(); } }
    g.restore();
  }
  // a picture of one piece (cached) for pages that build pieces as HTML (Chess)
  const URLS = {};
  function url(skin, t, side, px, col, pips){
    const k = [skin, t, side, px || 96, col || '', pips ? 1 : 0].join('|'); if(URLS[k]) return URLS[k];
    const c = document.createElement('canvas'), s = px || 96; c.width = c.height = Math.round(s * 1.25);
    const g = c.getContext('2d'); draw(g, skin, t, side, c.width / 2, c.height * 0.55, s * 0.92, {col, pips});
    try { URLS[k] = c.toDataURL('image/png'); } catch(e){ URLS[k] = ''; }
    return URLS[k];
  }
  // HTML <img> of a piece; '' for the classic shapes (the page keeps its own glyphs)
  function img(skin, t, side, cls, col, pips){ if(!SKINS[skin]) return ''; const u = url(skin, t, side, 96, col, pips); return u ? '<img class="psk ' + (cls || '') + '" alt="' + NAMES[t] + '" title="' + SKINS[skin].pieces[t][1] + '" src="' + u + '">' : ''; }
  // chips to pick a skin (+ 'classic'), with a little King picture each; onPick(skinKey)
  function chips(box, current, onPick, withClassic, classicLabel){
    artSkins(); box.innerHTML = '';
    (withClassic ? ['classic'] : []).concat(KEYS).forEach(k => {
      const b = document.createElement('button'); b.className = 'chip psk-chip' + (k === current ? ' on' : ''); b.setAttribute('data-sound', 'pop'); b.setAttribute('data-skin', k);
      b.innerHTML = (k === 'classic' ? '<span class="psk-gl">♚</span>' : img(k, 'k', 1, 'psk-mini')) + '<span>' + (k === 'classic' ? (classicLabel || 'Classic') : SKINS[k].name) + (SKINS[k] && SKINS[k].by ? '<small class="art-by"> 🏭 by ' + String(SKINS[k].by).replace(/[<>&"]/g, '') + '</small>' : '') + '</span>';
      b.onclick = () => { box.querySelectorAll('.psk-chip').forEach(x => x.classList.toggle('on', x === b)); onPick(k); };
      box.appendChild(b);
    });
    craftChip(box, 'lathe', 'psk-craft');
  }
  // 🔴 DISC skins (Drop + 🔴 Checkers, plan 11x-4): the disc picture and what it turns into (a line in Drop / a King in Checkers).
  // One pick per player for both games: localStorage sp_discskin:<Name> ('classic' = the game's own look: the world in Drop, the board design in Checkers).
  const DISCS = {
    dino:  {name: 'Dino eggs', disc: '🥚', king: '🦖'},
    sea:   {name: 'Pearl bubbles', disc: '🫧', king: '🐙'},
    dance: {name: 'Vinyl records', disc: '💿', king: '🪩'},
    robot: {name: 'Gears', disc: '⚙️', king: '🕰️'},
    space: {name: 'Planets', disc: '🪐', king: '⭐'},
    sky:   {name: 'Clouds', disc: '☁️', king: '⚡'},
  };
  const dkey = name => 'sp_discskin:' + (name || '');
  function getDisc(name){ try{ const v = localStorage.getItem(dkey(name)); return DISCS[v] ? v : 'classic'; }catch(e){ return 'classic'; } }
  function setDisc(name, skin){ try{ localStorage.setItem(dkey(name), DISCS[skin] ? skin : 'classic'); }catch(e){} }
  function discChips(box, current, onPick, classicLabel){
    box.innerHTML = '';
    ['classic'].concat(Object.keys(DISCS)).forEach(k => {
      const b = document.createElement('button'); b.className = 'chip psk-chip' + (k === current ? ' on' : ''); b.setAttribute('data-sound', 'pop'); b.setAttribute('data-disc', k);
      b.innerHTML = k === 'classic' ? '<span>' + (classicLabel || 'Classic') + '</span>' : '<span class="psk-disc">' + DISCS[k].disc + '</span><span>' + DISCS[k].name + ' → ' + DISCS[k].king + '</span>';
      b.onclick = () => { box.querySelectorAll('.psk-chip').forEach(x => x.classList.toggle('on', x === b)); onPick(k); };
      box.appendChild(b);
    });
  }
  return {artSkins, craftLink, SKINS, KEYS, TYPES, NAMES, GLYPH, SIZE_OF, TYPE_OF, get, set, draw, url, img, chips, DISCS, getDisc, setDisc, discChips};
})();
