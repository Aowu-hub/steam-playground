
/* 📏 pk-7c guests#1 */
/* ================= 📌 GUESTS FROM OTHER GAMES (pk-7c, 🔍 Pokadif chat, 2026-11-20 — plan §22c, Aowu 08:44 "recheck and go" = all ⭐) =================
   A picture carries GUESTS: real pieces from other games, drawn by THEIR shared kits (only CALLED — never copied, never changed):
     🐾 creature (CreatureKit, 🧳 Avateer) · 🎁 treasure = chest + gem (LootKit, 🧳 Avateer) · 🏷️ logo poster (GameLogos — the game's own approved logo).
   How many: 🌱 🐣 🔦 1 a picture · ⚡ 🌋 2 · 💀 3 — ONE carries a change, the others are look-alike decoys. ONE kit per picture (phones).
   Kits come only when a guest is on its way (Code.gs INCLUDE_LAZY_ PokadifParts → GameParts.sources, like the 🧱 kits); the NEXT picture's kit
   is fetched while you play this one. No kit yet → no guest (never a wait). Flat pictures (🎲 Mix + the house scenes) and 🧱 islands.
   ⚖️ Fair (Pokadif law): a guest change ≥ 45 changed px inside its poke circle and ZERO changed px anywhere else — flat: measured here on the
   whole 1× picture pair before it is used (else the picture is made again without guests) · 🧱: the island engine measures its own pixels.
   Guests are painted STILL (fixed t, noFx) — the 🎆 FX part never paints into the pictures.
   📣 Promotes: a found guest → a sticker in the goal line beside the pictures ("🐾 Mangobble · from 🧳 Avateer") · the 🏁 result card gets
   "📌 Guests today" with ▶ Play chips — ONLY for games the kid can open (Live games, never labs); UI.go keeps the ◀ trail back to Pokadif.
   API window.PKGUEST: plan(level) · prefetch(level) · dress(sc, level, plan) · flat(g, it) · isoPlan(level, seed, o) · isoSpec(spec, plan, free) ·
   isoPic(o) · isoCands(s, want) · found(d) · say · row(html) · wire(box) · reset() · seen() · KINDS · GAMES · stats() */
const PKGUEST = (function(){
  'use strict';
  const STAT = {dress: 0, ok: 0, fail: 0, why: {}, kits: {}, ms: 0};
  const why = k => { STAT.why[k] = (STAT.why[k] || 0) + 1; return false; };
  const NOW = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  function rnd(seed){ let s = (seed >>> 0) || 1; return () => { s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909); s ^= s >>> 16; return (s >>> 0) / 4294967296; }; }
  const pick = (R, a) => a[Math.floor(R() * a.length) % a.length];
  function shuffle(R, a){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ---------- 🗂️ who may come: the games a guest promotes (Live games only — tests check every route against GameData.gs BUILT_IN_GAMES) ---------- */
  const AVATEER = {name: 'Avateer', icon: '🧳', route: null, soon: true};   // 🧳 not Live yet → the sticker says where it is from, no ▶ Play chip
  const GAMES = {   // GameLogos block id → [GameID (icons / loader), PageRoute, name, icon] — approved logos (GameLogos.ok) of Live games, never Pokadif itself
    snakize: ['snakeast', 'snakize', 'Snakize', '🐍'], numbergrid: ['number-grid', 'numbergrid', 'Digitinct', '🔢'], memory: ['memory', 'memory', 'Memories Match', '🃏'],
    wisdeck: ['wisdeck', 'wisdeck', 'WisDeck', '🃏'], polyplot: ['polyplot', 'polyplot', 'Polyplot', '⬛'], soulbopper: ['soul-bopper', 'soulbopper', 'Soul Bopper', '👻'],
    mathquest: ['math-quest', 'mathquest', 'Math Quest', '🧮'], 'eyes-brain': ['eyes-brain', 'eyesbrain', 'Eyes Brain Riot', '👀'], 'brawl-buddies': ['brawl-buddies', 'brawlbuddies', 'Brawl Buddies', '🥊'],
    sciencetory: ['sciencetory', 'sciencetory', 'Sciencetory', '🔬'], 'sweet-swap': ['sweet-swap', 'sweetswap', 'Sweet Swap', '🍬'], 'pop-blocks': ['pop-blocks', 'popblocks', 'Pop Blocks', '🫧'],
    'double-up': ['double-up', 'doubleup', 'Double Up', '🔀'], alignext: ['alignext', 'alignext', 'Alignext', '🔴'], 'robot-adventure': ['robot-adventure', 'robot', 'Code the Robot', '🤖'],
    geoscout: ['geoscout', 'geoscout', 'GeoScout', '🔢'], georead: ['georead', 'georead', 'GeoRead', '🔤'], chess: ['chess', 'chess', 'Chess', '♞'], checkers: ['checkers', 'checkers', 'Checkers', '🔴'],
    maze: ['maze', 'maze', 'Maze Explorer', '🧭'], 'block-drop': ['block-drop', 'blockdrop', 'Block Drop', '🧱'], turbo: ['turbo', 'turbo', 'Turbo Trail', '🏎️'], hopper: ['hopper', 'hopper', 'Dodgy Hopper', '🐸'],
    pinball: ['pinball', 'pinball', 'Pinball', '🎯'], avatarealm: ['avatarealm', 'avatarealm', 'AvataRealm', '🏰']};
  const KINDS = {creature: {icon: '🐾', kit: 'Creatures', src: 'CreatureKit'}, loot: {icon: '🎁', kit: 'Loot', src: 'LootKit'}, logo: {icon: '🏷️', kit: 'GameLogos', src: 'GameLogos'}};
  const ORDER = ['creature', 'logo', 'loot'];
  const COUNT = [1, 1, 1, 2, 2, 3];   // guests a picture by level (⭐ pick ③: 1 a picture, 2–3 from ⚡)

  /* ---------- 📦 kits on demand (online: the GameParts sources line · offline app / tests: already inline) ---------- */
  function srcOf(name){ try{ return (window.GameParts && GameParts.sources && GameParts.sources()[name]) || null; }catch(e){ return null; } }
  function script(s){ return new Promise(res => { const one = (url, next) => { if(!url) return next(); const el = document.createElement('script'); el.charset = 'utf-8'; el.async = false;
      if(s.integrity){ el.integrity = s.integrity; el.crossOrigin = 'anonymous'; } el.onload = () => res(true); el.onerror = () => { if(el.parentNode) el.parentNode.removeChild(el); next(); };
      el.src = url; (document.head || document.documentElement).appendChild(el); }; one(s.src, () => one(s.alt, () => res(false))); }); }
  const KP = {}, LOGO_IN = {};
  function kitIn(kind){ const k = KINDS[kind]; return !!(k && window[k.kit] && (kind !== 'creature' || window.Creatures.drawH) && (kind !== 'loot' || window.Loot.chest)); }
  function kit(kind){
    if(kitIn(kind)) return Promise.resolve(true);
    if(KP[kind]) return KP[kind];
    KP[kind] = (async () => { const s = srcOf(KINDS[kind].src); if(!s) return false; STAT.kits[kind] = 'loading'; const ok = await script(s);
        if(ok && kind === 'logo' && window.GameLogos){ const m = srcOf('GameLogos@lazy'); if(m && GameLogos.sources) try{ GameLogos.sources(m); }catch(e){} }   // 🏷️ the logo files (gl-r24 split)
        STAT.kits[kind] = kitIn(kind) ? 'in' : 'failed'; return kitIn(kind); })().then(ok => { if(!ok) KP[kind] = null; return ok; }, () => { KP[kind] = null; return false; });
    return KP[kind]; }
  // the logos a guest may show: in the kit and APPROVED (GameLogos.ok) — or, online, still on the site (GameLogos@lazy): ok() is checked once it is in
  function logoIds(){ if(!window.GameLogos) return []; const lz = srcOf('GameLogos@lazy') || {};
    return Object.keys(GAMES).filter(id => { try{ return GameLogos.has(id) ? (!GameLogos.ok || GameLogos.ok(id)) : !!lz[id]; }catch(e){ return false; } }); }
  function logo(id){ if(LOGO_IN[id] === true) return Promise.resolve(true); if(LOGO_IN[id]) return LOGO_IN[id];
    let done = false; const p = new Promise(res => { const fin = ok => { if(done) return; done = true; const yes = !!(ok && GameLogos.has(id) && (!GameLogos.ok || GameLogos.ok(id))); LOGO_IN[id] = yes ? true : null; res(yes); };
      try{ GameLogos.need(id, fin); }catch(e){ fin(false); } setTimeout(() => fin(false), 9000); });
    if(!done) LOGO_IN[id] = p;   // (need() may answer at once — then the answer is already stored, keep it)
    return p; }
  const logoReady = id => LOGO_IN[id] === true;   // only after GameLogos.need() said yes — it waits for the web fonts, so the poster never repaints with another font

  /* ---------- 🐾 creatures: normal + ⭐ elite of every family (no bosses, giants, pets — one clear body each) ---------- */
  let CREW = null;
  function crew(){ if(CREW) return CREW; if(!window.Creatures) return [];
    const L = Creatures.LIST || {}; CREW = Object.keys(L).filter(id => { const d = L[id]; if(!d || d.pet || d.role === 'pet' || d.fam === 'giant' || d.forms || d.stages) return false;
      const rk = Creatures.rankOf ? Creatures.rankOf(d) : (d.rank || 'normal'); return rk === 'normal' || rk === 'elite'; });
    return CREW; }
  const CPOSE = {idle: 'idle', cheer: 'cheer', cast: 'cast', walk: 'walkA'};
  const CQUIET = {eyes: {eye: 'happy'}, mouth: {jaw: 0.9}, tail: {tail: 0.9, wing: 1}, lean: {lean: 0.22, head: 0.25}};
  function cPose(o){ const base = (Creatures.poseOf ? Creatures.poseOf(CPOSE[o.pose] || 'idle') : {}); return o.q && CQUIET[o.q] ? Object.assign({}, base, CQUIET[o.q]) : (CPOSE[o.pose] || 'idle'); }
  function cDef(o){ const d = (Creatures.LIST || {})[o.id]; if(!d) return null; if(!o.el) return d; return Object.assign({}, d, {el: o.el, col: undefined}); }
  /* ---------- 🎁 treasure: a LootKit chest + one rarity gem beside it ---------- */
  const MATS = ['wood', 'silver', 'gold'];
  /* ---------- 🏷️ logo poster: a little board on a post, the game's approved logo inside (the logo is never changed) ---------- */
  const FRAMES = ['#C0392B', '#2F80ED', '#27AE60', '#F2994A', '#9B51E0', '#E91E63', '#16A085', '#F2C94C'];
  const FRAME_NEAR = {'#C0392B': '#E91E63', '#E91E63': '#9B51E0', '#2F80ED': '#16A085', '#16A085': '#27AE60', '#27AE60': '#16A085', '#F2994A': '#F2C94C', '#F2C94C': '#F2994A', '#9B51E0': '#2F80ED'};

  /* ---------- 🖌️ one painter for a guest (flat picture, 🧱 sprite and the measuring canvas all use it — they always match) ---------- */
  // (x, y) = the guest's centre · r = its size (world units) · o = its state
  function paint(g, o, x, y, r){
    if(!o || o.gone) return;
    if(o.gk === 'creature'){ const d = cDef(o); if(!d || !window.Creatures) return;
      try{ Creatures.drawH(g, d, x, y + r * 0.95, r * 1.9, {t: 0.5, pose: cPose(o), face: o.face === 'right' ? 'right' : 'left', noFx: true}); }catch(e){} return; }
    if(o.gk === 'loot'){ if(!window.Loot) return; const s = r * 1.55 / 70;
      try{ Loot.chest(g, x - r * 0.2, y + r * 0.62, s, o.mat || 'wood', o.lid ? 1 : 0, 0); Loot.gem(g, x + r * 0.78, y + r * 0.5, r * 0.32, o.tier | 0, 0); }catch(e){} return; }
    if(o.gk === 'logo'){ if(!window.GameLogos || !logoReady(o.id)) return;
      const bx = GameLogos.box(o.id, 'badge') || [400, 400], bw = r * 1.45, bh = Math.min(r * 1.6, bw * bx[1] / bx[0]), x0 = x - bw / 2, y0 = y - r * 0.95, pad = r * 0.12;
      g.save(); g.fillStyle = '#7A4A26'; g.fillRect(x - r * 0.08, y0 + bh, r * 0.16, y + r * 0.95 - (y0 + bh)); g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(x, y + r * 0.95, r * 0.45, r * 0.1, 0, 0, 7); g.fill();
      g.fillStyle = o.frame || FRAMES[0]; g.strokeStyle = '#2B2140'; g.lineWidth = Math.max(1, r * 0.05); g.beginPath(); rr(g, x0 - pad, y0 - pad, bw + pad * 2, bh + pad * 2, r * 0.14); g.fill(); g.stroke();
      g.fillStyle = '#FFF8E8'; g.fillRect(x0, y0, bw, bh);
      const T = g.getTransform ? g.getTransform() : {a: 1}, sc = Math.max(1, Math.abs(T.a) || 1);
      try{ const c = GameLogos.pic(o.id, 'badge', 'classic', Math.round(bw * sc)); if(c && c.width && c.height){ const k = Math.min(bw / c.width, bh / c.height), dw = c.width * k, dh = c.height * k; g.drawImage(c, x - dw / 2, y0 + (bh - dh) / 2, dw, dh); } }catch(e){}
      g.restore(); } }
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)), cdist = (a, b) => { const p = hx(a), q = hx(b); return Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]); };
  function rr(g, x, y, w, h, r){ g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function flat(g, it){ paint(g, it.o, it.x, it.y, it.r); }

  /* ---------- 🎚️ the change a guest takes (bold 🌱 🐣 🔦 · quiet ⚡ 🌋 💀) ---------- */
  function changes(o, quiet, R){ const out = [];
    if(o.gk === 'creature'){
      if(!quiet){ out.push({sub: 'g_turn', set: {face: o.face === 'right' ? 'left' : 'right'}}); out.push({sub: 'g_pose', set: {pose: pick(R, ['cheer', 'cast'].filter(p => p !== o.pose))}}); out.push({sub: 'g_gone', gone: true}); }
      else { Object.keys(CQUIET).forEach(q => { if(q !== o.q) out.push({sub: 'g_bit', set: {q}}); }); out.push({sub: 'g_tint', set: {el: pick(R, ['fire', 'water', 'leaf', 'star', 'rock', 'wind', 'bolt', 'dark'].filter(e => e !== (o.el || ((Creatures.LIST || {})[o.id] || {}).el)))}}); }
    } else if(o.gk === 'loot'){
      if(!quiet){ out.push({sub: 'g_lid', set: {lid: o.lid ? 0 : 1}}); out.push({sub: 'g_chest', set: {mat: pick(R, MATS.filter(m => m !== o.mat))}}); out.push({sub: 'g_gone', gone: true}); }
      else { const t = o.tier | 0; [t - 1, t + 1].filter(x => x >= 0 && x <= 4).forEach(x => out.push({sub: 'g_gem', set: {tier: x}})); }
    } else if(o.gk === 'logo'){
      if(!quiet){ out.push({sub: 'g_gone', gone: true}); out.push({sub: 'g_frame', set: {frame: pick(R, FRAMES.filter(f => f !== o.frame && f !== FRAME_NEAR[o.frame]))}}); }
      else FRAMES.map(f => [f, cdist(f, o.frame)]).filter(x => x[1] >= 100).sort((p, q) => p[1] - q[1]).slice(0, 3).forEach(x => out.push({sub: 'g_frame', set: {frame: x[0]}}));   // the nearest colours that still count (Σ|Δ| ≥ 100)
    }
    return shuffle(R, out); }
  const SAY = {g_turn: '🔄 It turned around!', g_pose: '🕺 A new pose!', g_gone: '➖ Something is gone!', g_extra: '➕ Something new popped up!', g_bit: '👀 A tiny bit changed!', g_tint: '🎨 A new colour!',
    g_lid: '📦 The lid moved!', g_chest: '🎨 A different chest!', g_gem: '💎 A different gem!', g_frame: '🖼️ A new frame colour!'};
  try{ if(typeof FOUND_SAY === 'object') Object.keys(SAY).forEach(k => { if(!FOUND_SAY[k]) FOUND_SAY[k] = SAY[k]; }); }catch(e){}

  /* ---------- 🎲 a guest's look (seeded) + who it promotes ---------- */
  function make(kind, R, like){
    if(kind === 'creature'){ const L = crew(); if(!L.length) return null; let id = like ? like.id : pick(R, L);
      if(like){ const fam = ((Creatures.LIST || {})[like.id] || {}).fam, mates = L.filter(x => x !== like.id && (Creatures.LIST[x] || {}).fam === fam); id = mates.length ? pick(R, mates) : like.id; }
      return {gk: 'creature', id, pose: pick(R, ['idle', 'idle', 'walk']), face: R() < 0.5 ? 'left' : 'right'}; }
    if(kind === 'loot') return {gk: 'loot', mat: like ? like.mat : pick(R, MATS), lid: R() < 0.5 ? 1 : 0, tier: Math.floor(R() * 5)};
    if(kind === 'logo'){ const ids = logoIds().filter(logoReady); if(!ids.length) return null; return {gk: 'logo', id: like ? like.id : pick(R, ids), frame: pick(R, FRAMES)}; }
    return null; }
  function info(o){ if(!o) return null;
    if(o.gk === 'creature'){ const d = (window.Creatures && Creatures.LIST[o.id]) || {}; return {key: 'c:' + o.id, icon: '🐾', name: d.name || 'A creature', from: AVATEER}; }
    if(o.gk === 'loot') return {key: 'l:' + (o.mat || 'wood'), icon: '🎁', name: ({wood: 'Wooden', silver: 'Silver', gold: 'Golden'}[o.mat] || '') + ' treasure chest', from: AVATEER};
    if(o.gk === 'logo'){ const G = GAMES[o.id] || [o.id, null, o.id, '🎮']; return {key: 'g:' + o.id, icon: G[3], name: G[2], from: {name: G[2], icon: G[3], route: G[1], game: G[0]}}; }
    return null; }

  /* ---------- 📋 the page asks: which kind comes next (a kit that is IN, rotating) · fetch the one after ---------- */
  let NEXT = 0;
  function plan(level){ const n = COUNT[level] != null ? COUNT[level] : 1;
    for(let t = 0; t < ORDER.length; t++){ const kind = ORDER[(NEXT + t) % ORDER.length]; if(!kitIn(kind)) continue; if(kind === 'logo' && !logoIds().some(logoReady)) continue; if(kind === 'creature' && !crew().length) continue;
      NEXT = (NEXT + t + 1) % ORDER.length; prefetch(level); return {kind, count: n}; }
    prefetch(level); return null; }
  function prefetch(){ const kind = ORDER[NEXT % ORDER.length];
    kit(kind).then(ok => { if(ok && kind === 'logo'){ const ids = logoIds(), fresh = ids.filter(id => !logoReady(id)); for(let k = 0; k < 2 && fresh.length; k++){ const id = fresh.splice(Math.floor(Math.random() * fresh.length), 1)[0]; if(id) logo(id); } } }); }   // 2 more logos each time

  /* ---------- 🖼️ FLAT pictures: add the guests to a finished scene (made with ONE change less), then prove it fair on the real 1× pixels ---------- */
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  let CA = null, CB = null;
  function pairPx(sc){ if(!CA){ CA = mk(PK.W, PK.H); CB = mk(PK.W, PK.H); } pkPaint(CA, sc, 'A', 1, 1); pkPaint(CB, sc, 'B', 1, 1);
    return [CA.getContext('2d', {willReadFrequently: true}).getImageData(0, 0, PK.W, PK.H).data, CB.getContext('2d', {willReadFrequently: true}).getImageData(0, 0, PK.W, PK.H).data]; }
  const reachOf = q => q.k === 'person' ? q.r * 1.2 : q.k === 'pt' ? q.r * 1.6 : q.k === 'guest' ? q.ext || q.r * 1.3 : q.r * ((PK.KINDS[q.k] || {}).s || 1) * 1.45;
  // a spot for a guest: never on a change, a person, the scenery, a 🥞 pair or another guest — a FREE piece or two may make room
  //   (taken out of BOTH pictures, so nothing new differs) · the spot that needs the fewest taken out wins
  function spot(R, sc, r, ext){
    const lock = new Set(); sc.diffs.forEach(d => { if(d.idA) lock.add(d.idA); if(d.idB) lock.add(d.idB); });
    const all = []; sc.A.concat(sc.B).forEach(q => { if(!all.some(x => x.id === q.id)) all.push(q); });
    const locked = q => lock.has(q.id) || q.k === 'person' || q.k === 'guest' || q.lay === 'scene' || q.pair || (q.z || 0) < 0;
    let best = null;
    for(let t = 0; t < 420; t++){ const p = {x: ext + 6 + R() * (PK.W - 2 * ext - 12), y: ext + 6 + R() * (PK.H - 2 * ext - 12)};
      if((sc.deco || []).some(d => Math.hypot(p.x - d.x, p.y - d.y) < d.r + ext + 4)) continue;
      if(sc.diffs.some(d => Math.hypot(p.x - d.x, p.y - d.y) < d.hit + ext + 8)) continue;
      const near = all.filter(q => Math.hypot(p.x - q.x, p.y - q.y) < reachOf(q) + ext + 4);
      if(near.some(locked) || near.length > 5) continue;
      if(!best || near.length < best.near.length){ best = {p, near}; if(!near.length) break; } }
    if(!best) return null;
    const out = new Set(best.near.map(q => q.id)); if(out.size){ sc.A = sc.A.filter(q => !out.has(q.id)); sc.B = sc.B.filter(q => !out.has(q.id)); }
    return best.p; }
  // how far a guest's paint reaches from its centre (measured once per look — placement keeps that much room)
  const EXT = new Map();
  function extOf(o, r){ const key = JSON.stringify(o) + '|' + r; if(EXT.has(key)) return EXT.get(key); const S = Math.ceil(r * 6), c = mk(S, S), g = c.getContext('2d', {willReadFrequently: true});
    paint(g, o, S / 2, S / 2, r); const d = g.getImageData(0, 0, S, S).data; let e = 0; for(let y = 0; y < S; y++) for(let x = 0; x < S; x++) if(d[(y * S + x) * 4 + 3] > 8) e = Math.max(e, Math.hypot(x + 0.5 - S / 2, y + 0.5 - S / 2));
    e = Math.ceil(e) + 1; EXT.set(key, e); return e; }
  function dress(sc, level, P){ const t0 = NOW(); STAT.dress++;
    try{ const ok = dress0(sc, level, P); if(ok) STAT.ok++; else STAT.fail++; return ok; } finally { STAT.ms += NOW() - t0; } }
  function dress0(sc, level, P){
    if(!sc || sc.iso || !P || typeof pkPaint !== 'function' || typeof PK === 'undefined') return false;
    const L = PK.LEVELS[level] || PK.LEVELS[0], R = rnd((sc.seed ^ 0x6E57) >>> 0), r = Math.round(L.r * 1.12), quiet = !!L.quiet, n = Math.max(1, P.count || 1);
    const A0 = sc.A.slice(), B0 = sc.B.slice(), D0 = sc.diffs.slice();
    const undo = () => { sc.A = A0.slice(); sc.B = B0.slice(); sc.diffs = D0.slice(); return false; };
    let first = null; const placed = [];
    for(let q = 0; q < n; q++){ let o = null, ext = 0; for(let t = 0; t < 4 && !o; t++){ o = make(P.kind, R, first); ext = o ? extOf(o, r) : 0; if(o && ext > r * 1.75) o = null; }   // a creature too wide → another one
      if(!o) break; const p = spot(R, sc, r, ext); if(!p) break;
      const it = {id: 'gu' + q, k: 'guest', o, x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10, r, ext, c: '#ffffff', rot: 0, fl: 1, n: 0, z: 0, lay: 'guests'};
      sc.A.push(it); sc.B.push(Object.assign({}, it, {o: Object.assign({}, o)})); placed.push(it); if(!first) first = o; }
    if(!placed.length){ undo(); return why('room'); }
    /* the change: on the first guest — each candidate painted on the whole picture pair at 1× and counted like the tests do */
    const g0 = placed[0], bi = sc.B.findIndex(x => x.id === g0.id), A1 = sc.A.slice();   // (A after the room was made — a failed try goes back to THIS)
    for(const ch of changes(g0.o, quiet, R)){
      const Bs = sc.B.slice(); let side = 'B';
      if(ch.gone){ side = R() < 0.5 ? 'B' : 'A'; (side === 'B' ? sc.B : sc.A).splice((side === 'B' ? sc.B : sc.A).findIndex(x => x.id === g0.id), 1); }
      else { sc.B[bi] = Object.assign({}, sc.B[bi], {o: Object.assign({}, g0.o, ch.set)}); sc.B[bi].ext = Math.max(g0.ext, extOf(sc.B[bi].o, r)); }
      const m = measure(sc, g0, Math.max(g0.ext, bi >= 0 && sc.B[bi] && sc.B[bi].id === g0.id ? sc.B[bi].ext || 0 : 0));
      if(m && m.ok){ const sub = ch.gone && side === 'A' ? 'g_extra' : ch.sub;
        sc.diffs.push({t: 'guest', sub, idA: side === 'A' && ch.gone ? null : g0.id, idB: side === 'B' && ch.gone ? null : g0.id, x: m.x, y: m.y, r: m.hit / 1.2, hit: m.hit, layer: 'guests', i: sc.diffs.length, guest: info(g0.o), px: m.px});
        sc.guests = placed.map(x => info(x.o)); sc.sig = (sc.sig || '') + '|g:' + placed.map(x => JSON.stringify(x.o)).join(',') + ':' + sub; return true; }
      sc.B = Bs; sc.A = A1.slice(); if(m) why('m:' + String(m.why).replace(/\d+/g, '#')); }
    undo(); return why('change'); }
  // count changed pixels like the tests do (|ΔR|+|ΔG|+|ΔB| ≥ 60 = a changed pixel · ≥ 24 outside every circle = a stray)
  function measure(sc, g0, ge){ ge = ge || g0.ext;
    const [a, b] = pairPx(sc), W = PK.W, H = PK.H; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0; const strong = [];
    const old = sc.diffs;
    for(let y = 0; y < H; y++) for(let x = 0; x < W; x++){ const i = (y * W + x) * 4, dd = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); if(dd < 24) continue;
      if(old.some(d => Math.hypot(d.x - x, d.y - y) <= d.hit + 3)) continue;   // the picture's own changes
      if(Math.hypot(x - g0.x, y - g0.y) > ge + 6) return {ok: false, why: 'stray'};
      if(dd >= 60){ n++; strong.push(x, y); } if(x < x0) x0 = x; if(y < y0) y0 = y; if(x > x1) x1 = x; if(y > y1) y1 = y; }
    if(n < 45) return {ok: false, why: n + 'px'};
    const cx = (x0 + x1 + 1) / 2, cy = (y0 + y1 + 1) / 2; let far = 0; for(let y = y0; y <= y1; y++) for(let x = x0; x <= x1; x++){ const i = (y * W + x) * 4, dd = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); if(dd >= 24) far = Math.max(far, Math.hypot(x + 0.5 - cx, y + 0.5 - cy)); }
    const hit = Math.max(PK.MIN_HIT, Math.ceil(far) + 1);
    if(hit > 70) return {ok: false, why: 'big'};
    if(old.some(d => Math.hypot(d.x - cx, d.y - cy) < d.hit + hit + 4)) return {ok: false, why: 'touch'};
    let inside = 0; for(let k = 0; k < strong.length; k += 2) if(Math.hypot(strong[k] - cx, strong[k + 1] - cy) <= hit + 3) inside++;
    if(inside < 45) return {ok: false, why: 'inside ' + inside};
    return {ok: true, x: Math.round(cx * 10) / 10, y: Math.round(cy * 10) / 10, hit, px: inside}; }

  /* ---------- 🧱 ISLANDS: guests stand on free cells; the island engine measures their changes like every other change ---------- */
  async function isoPlan(level, seed, o){ o = o || {}; const n = COUNT[level] != null ? COUNT[level] : 1, R = rnd((seed ^ 0x15060) >>> 0);
    let kinds = o.guestKind ? [o.guestKind] : shuffle(R, ORDER);
    for(const kind of kinds){ if(!(await kit(kind))) continue;
      if(kind === 'logo'){ const ids = logoIds(); if(!ids.length) continue; const id = pick(R, ids); if(!(await logo(id))) continue; R.logo = id; }   // the seed alone picks the logo (same seed = same island)
      const out = []; let first = null; for(let q = 0; q < n; q++){ const g = make(kind, R, first); if(!g) break; if(kind === 'logo') g.id = R.logo; out.push(g); if(!first) first = g; }
      if(out.length) return out; }
    return null; }
  function isoSpec(spec, plan, free, R){ if(!plan || !plan.length) return spec; const cells = shuffle(R, free).slice(0, plan.length);
    cells.forEach(([i, j], q) => spec.push({id: 'gu' + q, k: '@g', i: i + 0.5, j: j + 0.5, o: Object.assign({}, plan[q], q === 0 ? {chg: 1} : {})}));
    return spec; }
  const ISZ = {creature: [64, 56, 24], loot: [62, 74, 22], logo: [46, 66, 21]};   // sprite w · h · guest size (the 🧱 avatars are 48 tall)
  function isoPic(o){ if(!window.Iso || !Iso.sprite || !o || o.gone) return null; const z = ISZ[o.gk] || ISZ.creature, w = z[0], h = z[1], key = 'pkg:' + JSON.stringify(o);
    return Iso.sprite(key, w, h, g => paint(g, o, w / 2, h - z[2], z[2]), {ax: w / 2, ay: h - z[2] + z[2] * 0.95, outline: 'rgba(40,24,60,.55)'}); }
  function isoCands(s, want, R){ if(!s.o || !s.o.chg) return []; return changes(s.o, want !== 'bold', R).map(ch => ({id: s.id, k: '@g', by: 'guest', grade: want, name: (info(s.o) || {}).name || 'guest',
      set: ch.gone ? null : Object.assign({}, ch.set), gone: !!ch.gone, sub: ch.sub, guest: info(s.o)})); }

  /* ---------- 📣 promotion: the sticker beside the pictures + the 🏁 result row ---------- */
  let SEEN = [];
  function reset(){ SEEN = []; }
  function note(gi, found){ if(!gi) return; let e = SEEN.find(x => x.key === gi.key); if(!e){ e = Object.assign({found: 0}, gi); SEEN.push(e); } if(found) e.found++; }
  function seenScene(sc){ (sc && sc.guests || []).forEach(gi => note(gi, false)); }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  function found(d){ if(!d || !d.guest) return ''; note(d.guest, true); const f = d.guest.from || {};
    return ' <span class="pkg-stk">' + d.guest.icon + ' ' + esc(d.guest.name) + (d.guest.from && f.name !== d.guest.name ? ' · from ' + f.icon + ' ' + esc(f.name) : ' · a game to try!') + '</span>'; }
  function row(html){ if(!SEEN.length || typeof html !== 'string') return html;
    const one = {}, list = SEEN.slice().sort((a, b) => b.found - a.found).filter(x => { const k = (x.from || {}).route ? 'r:' + x.from.route : x.key; if(one[k]) return false; one[k] = 1; return true; }).slice(0, 3);   // one chip a game, found ones first
    const chips = list.map(x => { const f = x.from || {};
      return f.route ? '<button class="pkg-chip" data-route="' + esc(f.route) + '" data-game="' + esc(f.game || '') + '" data-name="' + esc(f.name) + '" data-sound="pop">' + x.icon + ' ' + esc(x.name) + ' <b>▶ Play</b></button>'
        : '<span class="pkg-chip soon">' + x.icon + ' ' + esc(x.name) + ' <i>' + (f.icon || '') + ' ' + esc(f.name || '') + ' · 🔜</i></span>'; }).join('');
    const r = '<div class="pkg-row" id="pkg-row"><span class="pkg-h">📌 Guests today</span>' + chips + '</div>';
    const at = html.indexOf('<div class="save-note"'); return at >= 0 ? html.slice(0, at) + r + html.slice(at) : html + r; }
  function wire(box){ if(!box) return; box.querySelectorAll('.pkg-chip[data-route]').forEach(b => b.onclick = () => {
      const url = (typeof WEBAPP_URL !== 'undefined' ? WEBAPP_URL : '') + '?page=' + encodeURIComponent(b.dataset.route) + (typeof sessionQuery === 'function' ? sessionQuery() : '');
      try{ if(typeof moment === 'function') moment('guest', {go: b.dataset.route}); }catch(e){}
      UI.go(url, (UI.KINDS && UI.KINDS[b.dataset.game]) ? b.dataset.game : 'game', 'Opening ' + b.dataset.name); }); }

  return {plan, prefetch, kit, kitIn, logo, logoIds, dress, flat, paint, extOf, measure, isoPlan, isoSpec, isoPic, isoCands, found, row, wire, reset, seenScene, seen: () => SEEN.slice(),
    make, info, changes, SAY, KINDS, GAMES, COUNT, ORDER, crew, stats: () => Object.assign({}, STAT, {kits: Object.assign({}, STAT.kits), why: Object.assign({}, STAT.why)})};
})();
window.PKGUEST = PKGUEST;
GameParts.loaded('Pokadif_guests', 'pk-7c');
