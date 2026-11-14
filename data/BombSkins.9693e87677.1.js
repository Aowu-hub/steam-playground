
/* 💣 Soul Bopper bomb skins (plan 11l round 4) — shared by SoulBopper (play + picker) and Collection (item line 'bombskin').
   A skin id is 'dino:0'…'dino:4' (Plain · Pattern · Glow · Armored · Legendary, per world), 'x:poo'… (fun extras), '' (= the world's own bomb) or 'random' (❓ mystery bomb).
   Looks only: a skin never changes how a pop works. Needs AvatarKit's emo() (picture cache — no fillText emoji in the game loop). */
window.BombSkins = (function () {
  const STEPS = ['Plain', 'Pattern', 'Glow', 'Armored', 'Legendary'];
  const WORLDS = {
    dino:   {name: 'Dino',   col: '#FF9F1C', bombs: ['🥚', '🥚', '🥚', '🥚', '🥚'], pop: ['🐣', '🦖', '🦕', '🦖', '🐉'], names: ['Egg → baby dinos', 'Spotted egg → baby raptors', 'Glowing amber egg → mini Triceratops', 'Stone-shell egg → T-Rex roar', 'Legendary lava egg → dragon-dino fire'], tint: [null, '#C98A3D', '#FFB300', '#8D8D8D', '#FF3D00']},
    sea:    {name: 'Sea',    col: '#3DA9FC', bombs: ['🐡', '🐡', '🐡', '🐡', '🐙'], pop: ['🐡', '🐠', '🪼', '🦀', '🐙'], names: ['Pufferfish', 'Striped puffer', 'Glowing deep-sea puffer', 'Spiky armored puffer', 'Kraken egg → tentacles slam the +'], tint: [null, '#FFD84D', '#00E5FF', '#607D8B', '#7C4DFF']},
    dance:  {name: 'Dance',  col: '#FF4FA3', bombs: ['🔊', '🔊', '🔊', '🔊', '🪩'], pop: ['🎵', '🎶', '💡', '🥁', '🪩'], names: ['Speaker', 'Sticker speaker', 'Neon speaker', 'Chrome subwoofer', 'Legendary disco tower → laser beams'], tint: [null, '#FF4FA3', '#B388FF', '#B0BEC5', '#FFD84D']},
    robot:  {name: 'Robot',  col: '#4DD0E1', bombs: ['🤖', '🤖', '🤖', '🤖', '⏰'], pop: ['⚙️', '🔧', '💡', '🛡️', '❄️'], names: ['Mini-bot', 'Painted bot', 'LED bot', 'Tank bot', 'Time-core bot → frozen + (looks only)'], tint: [null, '#FF7043', '#00E676', '#546E7A', '#40C4FF']},
    space:  {name: 'Space',  col: '#B388FF', bombs: ['⭐', '⭐', '🌟', '⭐', '🌌'], pop: ['✨', '💫', '🌟', '☄️', '🌌'], names: ['Mini-star', 'Ringed star', 'Pulsar', 'Meteor-shell star', 'Supernova → galaxy swirl'], tint: [null, '#80D8FF', '#FFFFFF', '#795548', '#E040FB']},
    sky:    {name: 'Sky',    col: '#FFD84D', bombs: ['🌩️', '🌩️', '⛈️', '🌩️', '⚡'], pop: ['💨', '🌈', '⛈️', '🌪️', '⚡'], names: ['Thundercloud', 'Rainbow cloud', 'Glowing storm', 'Iron storm', 'Zeus bolt → lightning in the +'], tint: [null, '#FF80AB', '#FFF59D', '#78909C', '#FFC400']},
    zombie: {name: 'Zombie', col: '#7BC043', bombs: ['💀', '💀', '💀', '💀', '💀'], pop: ['🦷', '🧵', '👻', '⛑️', '✋'], names: ['Chomping skull', 'Stitched skull', 'Glow-in-the-dark skull', 'Helmet skull', 'Zombie king\'s crown → a hand grabs on each arm'], tint: [null, '#A1887F', '#B2FF59', '#9E9E9E', '#FFD600']}
  };
  const WORLD_KEYS = Object.keys(WORLDS);

  /* 🏭 crafted skins (Artifactory af-4): things the family made in Artifactory become skins here, "made by …" (list = localStorage sp_artskins, written by Artifactory + Collection) */
  let ART_DONE = false;
  function artList(kinds){ let L = []; try{ L = JSON.parse(localStorage.getItem('sp_artskins') || '{}').list || []; }catch(e){} return L.filter(a => a && a.id && /^[a-z0-9]+$/i.test(a.id) && (!kinds || kinds.indexOf(a.k) >= 0)).slice(0, 24); }
  function artHex(h, f){ h = /^#[0-9a-f]{6}$/i.test(h || '') ? h : '#C08A4E'; const n = parseInt(h.slice(1), 16), m = c => Math.max(0, Math.min(255, Math.round(f > 0 ? c + (255 - c) * f : c * (1 + f)))); return '#' + ((1 << 24) + (m(n >> 16) << 16) + (m((n >> 8) & 255) << 8) + m(n & 255)).toString(16).slice(1); }
  function artMix(a, b, t){ const p = h => { h = /^#[0-9a-f]{6}$/i.test(h || '') ? h : '#888888'; const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }, A = p(a), B = p(b); return '#' + ((1 << 24) + A.reduce((s, v, i) => s + (Math.round(v + (B[i] - v) * t) << (16 - i * 8)), 0)).toString(16).slice(1); }
  function craftLink(mode){ const base = typeof WEBAPP_URL !== 'undefined' ? WEBAPP_URL : '', who = typeof CURRENT_PLAYER !== 'undefined' && CURRENT_PLAYER ? '&player=' + encodeURIComponent(CURRENT_PLAYER) : ''; const u = base + '?page=artifactory&mode=' + mode + who; if(window.UI && UI.go) UI.go(u, 'craft', 'Opening Artifactory'); else location.href = u; }
  function craftChip(box, mode, cls){ if(!box || box.querySelector('.art-craft')) return; const b = document.createElement('button'); b.className = (cls || '') + ' art-craft'; b.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:6px 12px;margin:3px;border-radius:999px;border:2px dashed currentColor;background:transparent;font:inherit;font-weight:800;cursor:pointer;color:inherit;'; b.setAttribute('data-sound', 'pop'); b.title = 'Make your own in 🏭 Artifactory'; b.innerHTML = '<span>✨ Craft a new one</span>'; b.onclick = e => { e.stopPropagation(); craftLink(mode); }; box.appendChild(b); }
  const ART_KINDS = ['lantern', 'ball', 'vase', 'bowl', 'robot', 'yoyo', 'petbowl'];
  function artOf(id){ return artList(ART_KINDS).find(a => a.id === id); }
  // fun extras (no evolution) — order = Collection steps 5–10 (golden poo = the poo's upgrade)
  const EXTRAS = [
    {k: 'poo', name: '💩 Poo', bomb: '💩', pop: '💩', how: 'Play 3 💩 Classic Avatar games'},
    {k: 'melon', name: '🍉 Watermelon', bomb: '🍉', pop: '🍉', how: 'Break 300 blocks'},
    {k: 'cake', name: '🎂 Cake', bomb: '🎂', pop: '🍰', how: 'Win 3 Soul Bopper games'},
    {k: 'balloon', name: '🎈 Balloon', bomb: '🎈', pop: '🎈', how: 'Set off 20 chain pops'},
    {k: 'teddy', name: '🧸 Teddy', bomb: '🧸', pop: '🧸', how: 'Come back 5 times'},
    {k: 'volcano', name: '🌋 Mini volcano', bomb: '🌋', pop: '🔥', how: 'Catch 3 with one pop'},
    {k: 'gold', name: '✨ Golden poo', bomb: '💩', pop: '✨', how: 'Catch 100 players or bots', gold: true}
  ];
  const STEP_HOW = ['Yours from the start', 'Play 5 games in this world', 'Catch 20 players or bots in this world', 'Win on Hard in this world', 'Win on Extreme or 💀 Hardcore in this world, or beat its 👑 boss'];
  function parse(id) {
    if (!id) return null; if (id === 'random') return {random: true};
    if (id.indexOf('art:') === 0) { const a = artOf(id.slice(4)); return a ? {art: a} : null; }   // 🏭 af-4
    if (id.indexOf('x:') === 0) { const e = EXTRAS.find(x => x.k === id.slice(2)); return e ? {extra: e} : null; }
    const p = id.split(':'), W = WORLDS[p[0]], s = Math.max(0, Math.min(4, Number(p[1]) || 0)); return W ? {w: p[0], W, s} : null;
  }
  function nameOf(id) { const o = parse(id); if (!o) return '🌍 World bomb'; if (o.random) return '🎲 Random pop skin'; if (o.art) return '🏭 ' + o.art.n + ' · by ' + o.art.by; if (o.extra) return o.extra.name; return o.W.name + ' · ' + STEPS[o.s]; }
  function popOf(id, world) { const o = parse(id); if (!o || o.random) return null; if (o.art) return '✨'; if (o.extra) return o.extra.pop; return o.W.pop[o.s]; }
  // what a player owns: info = {themes: {dino: 1..5 steps}, extras: [k…]}
  function owned(info) {
    const out = []; info = info || {};
    WORLD_KEYS.forEach(k => { const n = Math.max(1, Math.min(5, Number((info.themes || {})[k]) || 1)); for (let s = 0; s < n; s++) out.push(k + ':' + s); });
    (info.extras || []).forEach(k => { if (EXTRAS.some(e => e.k === k)) out.push('x:' + k); });
    artList(ART_KINDS).forEach(a => out.push('art:' + a.id));   // 🏭 crafted in Artifactory — everyone in the family can use them
    return out;
  }
  function ring(g, x, y, r, col, w) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); }
  // draw a bomb skin centred at (x, y), size = emoji px; fuse 0..1 (1 = about to pop)
  function draw(g, id, x, y, size, t, fuse) {
    t = t || 0; const o = parse(id);
    if (o && o.random) {   // ❓ mystery bomb: wobbles, ? sparks
      const wob = Math.sin(t * 9) * 0.18;
      g.save(); g.translate(x, y); g.rotate(wob);
      const gr = g.createRadialGradient(0, 0, size * 0.1, 0, 0, size * 0.55); gr.addColorStop(0, '#B388FF'); gr.addColorStop(1, '#4A148C'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, size * 0.42, 0, Math.PI * 2); g.fill();
      ring(g, 0, 0, size * 0.42, '#FFD84D', Math.max(1.5, size * 0.06));
      emo(g, '❓', 0, 0, size * 0.55); g.restore();
      for (let i = 0; i < 3; i++) { const a = t * 3 + i * 2.1; emo(g, '❔', x + Math.cos(a) * size * 0.55, y + Math.sin(a) * size * 0.45 - size * 0.1, size * 0.22, 0.75); }
      return;
    }
    if (!o) return false;
    if (o.art) {   // 🏭 a crafted thing as the bomb: it glows faster as the fuse runs down
      const a = 0.3 + 0.25 * Math.sin(t * (4 + (fuse || 0) * 10)), gr = g.createRadialGradient(x, y, size * 0.05, x, y, size * 0.6); gr.addColorStop(0, hexA(o.art.col, a + 0.2)); gr.addColorStop(1, hexA(o.art.col, 0)); g.fillStyle = gr; g.beginPath(); g.arc(x, y, size * 0.6, 0, Math.PI * 2); g.fill();
      if (typeof artDraw === 'function') artDraw(g, o.art.look, x, y + size * 0.42, size * 0.85, t); else emo(g, '🏭', x, y, size);
      return true;
    }
    if (o.extra) {
      if (o.extra.gold) { const gr = g.createRadialGradient(x, y, size * 0.1, x, y, size * 0.6); gr.addColorStop(0, 'rgba(255,214,0,0.75)'); gr.addColorStop(1, 'rgba(255,214,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, size * 0.6, 0, Math.PI * 2); g.fill(); }
      emo(g, o.extra.bomb, x, y, size);
      if (o.extra.gold) { g.save(); g.globalCompositeOperation = 'source-atop'; g.restore(); emo(g, '✨', x + size * 0.32, y - size * 0.32, size * 0.32); }
      return true;
    }
    const W = o.W, s = o.s, tint = W.tint[s], r = size * 0.42;
    if (s >= 2) { const a = 0.35 + 0.2 * Math.sin(t * 5); const gr = g.createRadialGradient(x, y, size * 0.05, x, y, size * (s === 4 ? 0.8 : 0.62)); gr.addColorStop(0, hexA(tint || W.col, a + 0.2)); gr.addColorStop(1, hexA(tint || W.col, 0)); g.fillStyle = gr; g.beginPath(); g.arc(x, y, size * (s === 4 ? 0.8 : 0.62), 0, Math.PI * 2); g.fill(); }
    emo(g, W.bombs[s], x, y, size);
    if (s === 1) {   // pattern: spots / stripes painted on
      g.save(); g.beginPath(); g.arc(x, y + size * 0.04, r * 0.92, 0, Math.PI * 2); g.clip(); g.fillStyle = hexA(tint, 0.6);
      for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.4, d = r * (i % 2 ? 0.55 : 0.3); g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.13, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
    if (s === 3) {   // armored: metal band + rivets
      g.strokeStyle = '#B0BEC5'; g.lineWidth = Math.max(2, size * 0.1); g.beginPath(); g.arc(x, y, r * 0.95, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
      g.fillStyle = '#ECEFF1'; for (let i = 0; i < 4; i++) { const a = (0.2 + i * 0.2) * Math.PI; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95, size * 0.045, 0, Math.PI * 2); g.fill(); }
      ring(g, x, y, r * 1.05, 'rgba(84,110,122,0.8)', Math.max(1, size * 0.04));
    }
    if (s === 4) {   // legendary: orbiting sparks + tiny crown
      for (let i = 0; i < 4; i++) { const a = t * 2.4 + i * Math.PI / 2; emo(g, i % 2 ? '✨' : '🔥', x + Math.cos(a) * size * 0.62, y + Math.sin(a) * size * 0.45, size * 0.22, 0.9); }
      emo(g, '👑', x, y - size * 0.55, size * 0.3);
    }
    return true;
  }
  function hexA(h, a) { if (!/^#[0-9a-f]{6}$/i.test(h || '')) return 'rgba(255,200,80,' + a + ')'; const n = parseInt(h.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
  // Collection card for line step v (0–3 = Pattern…Legendary in three worlds, 4+ = a fun extra; Plain is free)
  function preview(c, v) {
    const g = c.getContext('2d'), w = c.width, h = c.height; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#2A1B4A'); bg.addColorStop(1, '#140C26'); g.fillStyle = bg; g.beginPath(); if (g.roundRect) g.roundRect(4, 4, w - 8, h - 8, 16); else g.rect(4, 4, w - 8, h - 8); g.fill();
    if (v < 4) { ['dino', 'sea', 'zombie'].forEach((k, i) => draw(g, k + ':' + (v + 1), w * (0.25 + i * 0.25), h * (i === 1 ? 0.42 : 0.56), w * 0.24, 1.3 + i, 0)); }
    else { const e = EXTRAS[Math.min(EXTRAS.length - 1, v - 4)]; draw(g, 'x:' + e.k, w / 2, h * 0.48, w * 0.42, 1.2, 0); }
  }
  // picker chips: own skins + locked ones (with how to get them)
  function chips(info, current) {
    const own = owned(info), all = [''].concat(WORLD_KEYS.reduce((a, k) => a.concat([0, 1, 2, 3, 4].map(s => k + ':' + s)), [])).concat(EXTRAS.map(e => 'x:' + e.k)).concat(artList(ART_KINDS).map(a => 'art:' + a.id)).concat(['random']);
    return all.map(id => { const o = parse(id), have = !id || id === 'random' || own.indexOf(id) >= 0, how = !o ? 'The bomb of the world you play in' : o.art ? 'Made in 🏭 Artifactory by ' + o.art.by : o.random ? 'A surprise skin you own — new every bomb' : o.extra ? o.extra.how : STEP_HOW[o.s];
      return {id, have, on: id === (current || ''), name: nameOf(id), how}; });
  }
  return {craftLink, artList: () => artList(ART_KINDS), STEPS, WORLDS, WORLD_KEYS, EXTRAS, STEP_HOW, parse, nameOf, popOf, owned, draw, preview, chips};
})();
