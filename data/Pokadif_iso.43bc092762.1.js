
/* 🧱 Pokadif_iso — pk-7b (🔍 Pokadif chat, 2026-11-20, plan §22b + §24 + §26): 2.5D dioramas for 🎲 Mix (≈ 1 in 4) and the 🧱 2.5D World scene.
   A 🧱 picture = a small 8 × 8 diamond island drawn by the SHARED kits (IsoKit + IsoProps + IsoLook_*, only CALLED, never changed), baked ONCE into
   two bitmaps (A · B) at 2 × the 400 × 300 world (zoom 1.5, DPR 1, frame 0, shimmer off, a fresh Iso.view per bake, the sky painted in).
   Changes come from Props.diffs (asked at the world zoom 0.75) + 🧑 pose · ➕ extra · 🟫 one tile · 🚩 team colour, graded by level, each one
   BAKED in the scene and MEASURED: ≥ 45 changed world px, its poke zone = the changed shape + 6 px, zones never touch, 0 px changed outside every
   zone, the same seed paints the same bytes. A picture that can't reach its count tries again (5 seeds, the last 2 on a 🏘️ hamlet), tops up with the other grade,
   and only then gives up (→ the game shows a flat picture). FX are never painted in here (Pokadif_fx paints on its own layer).
   Kits come only when a 🧱 picture is on its way: online they are GameParts sources (Code.gs INCLUDE_LAZY_ PokadifParts) loaded with plain script
   tags; the 📲 offline app + tests have them inline. API (global PKISO): want(level, n) → Promise(scene | null) · has(level, n) · take(level, n) ·
   make(seed, level, {n, recipe, look, cond}) · paint(cv, sc, side, k, dpr) · dress(markEl, sc, i) · kits() · COMBOS · stats(). */
const PKISO = (function(){
  'use strict';
  const W0 = 400, H0 = 300, S0 = 2, ZOOM = 1.5, ZDIFF = 0.75, MIN = 45, ZONE = 6, N = 8, TAU = Math.PI * 2;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const NOW = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const STAT = {bakes: 0, ms: 0, made: 0, failed: 0, short: 0, topped: 0}, LOG = [];

  /* ---------- 🎲 seeded random ---------- */
  function rnd(seed){ let s = seed >>> 0 || 1; return () => { s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909); s ^= s >>> 16; return (s >>> 0) / 4294967296; }; }
  const pick = (R, a) => a[Math.floor(R() * a.length) % a.length];
  function shuffle(R, a){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ---------- 📦 kits on demand (online: GameParts sources line · offline / tests: already inline) ---------- */
  function srcOf(name){ try{ return (window.GameParts && GameParts.sources && GameParts.sources()[name]) || null; }catch(e){ return null; } }
  function script(s){ return new Promise(res => { const one = (url, next) => { if(!url) return next(); const el = document.createElement('script'); el.charset = 'utf-8'; el.async = false;
      if(s.integrity){ el.integrity = s.integrity; el.crossOrigin = 'anonymous'; } el.onload = () => res(true); el.onerror = () => { if(el.parentNode) el.parentNode.removeChild(el); next(); };
      el.src = url; (document.head || document.documentElement).appendChild(el); }; one(s.src, () => one(s.alt, () => res(false))); }); }
  let KP = null;
  function kits(){
    if(window.Iso && window.Props && window.Props.diffs) return Promise.resolve(true);
    if(KP) return KP;
    KP = (async () => {
      if(!window.Iso){ const s = srcOf('IsoKit'); if(!s || !(await script(s)) || !window.Iso) return false; }
      if(!window.Props){ const s = srcOf('IsoProps'); if(!s || !(await script(s)) || !window.Props) return false; }
      const map = {}; (Props.FILES || []).forEach(l => { const s = srcOf('IsoLook_' + l); if(s) map[l] = s; }); if(Object.keys(map).length && Props.sources) Props.sources(map);
      return !!(window.Iso && window.Props && Props.diffs); })().then(ok => { if(!ok) KP = null; return ok; }, () => { KP = null; return false; });
    return KP; }
  const looks = list => new Promise(res => { try{ Props.need(list, ok => res(ok !== false)); }catch(e){ res(false); } });

  /* ---------- 🗺️ looks → ground theme + sky (☀️ day / 🌙 night) ---------- */
  const THEME = {desert: 'beach', dust: 'beach', snow: 'snow', cloud: 'snow', lava: 'lava', monster: 'lava', coral: 'coral', reef: 'coral', moon: 'moon', bolt: 'moon', gear: 'moon', castle: 'storybook', myth: 'storybook', toybox: 'storybook', detective: 'detective'};
  const SKY = {
    cherry: ['#FFD9E6', '#FFF6EE'], desert: ['#FFD59A', '#FFF4DC'], snow: ['#BFE3FF', '#F4FBFF'], cloud: ['#C9E8FF', '#FFFFFF'], farm: ['#B9E6FF', '#F2FBEA'],
    jungle: ['#9EE3C8', '#F0FFF4'], grow: ['#B8EBC4', '#F6FFEE'], castle: ['#C8D4FF', '#FFF7EA'], myth: ['#E0D0FF', '#FFF6FF'], detective: ['#AEB9D8', '#F4EEE4'],
    raptor: ['#A8E6B8', '#F4FFF0'], kitchen: ['#FFD8E0', '#FFF8F0'], horde: ['#FFE2A8', '#FFFBEA'], wizard: ['#B8E8C0', '#F4FFF2'], reef: ['#7FD8E8', '#E8FBFF'],
    toybox: ['#FFD9F2', '#FFF8EC'], dust: ['#F2DDB0', '#FFF6E2'],
    lava: ['#3A1830', '#8A3A2A'], monster: ['#2E1A3E', '#7A3A4A'], moon: ['#141A3E', '#3E3A78'], bolt: ['#1A2040', '#46407E'], gear: ['#1E1E3A', '#4E4470'], coral: ['#1E5C8A', '#5CB4D0']};
  const NIGHT = new Set(['lava', 'monster', 'moon', 'bolt', 'gear', 'coral']);
  const NAME = {cherry: '🌸 Cherry Hill', desert: '🏜️ Desert', snow: '❄️ Snowy', cloud: '☁️ Cloud Kingdom', farm: '🌾 Farm', jungle: '🌴 Jungle', grow: '🌱 Grow Garden', castle: '🏰 Castle',
    myth: '🦄 Myth Realm', detective: '🕵️ Detective Town', raptor: '🦖 Raptor Ridge', kitchen: '🍳 Kitchen Crew', horde: '🍽️ Hungry Horde', wizard: '🔮 Spellwood', reef: '🐠 Reef Riders',
    lava: '🌋 Lava Isles', monster: '👹 Monster Mash', moon: '🚀 Moon Base', bolt: '🤖 Bolt Works', gear: '⚙️ Gearhaven', coral: '🌊 Coral Coast', toybox: '🧸 Toybox Troop', dust: '🐰 Dust Bunnies'};
  function role(look, r, n){ const L = (Props.LOOKS || {})[look] || {}, a = L.roles && L.roles[r]; if(Array.isArray(a) && a.length) return a[n % a.length]; if(a) return a;
    const F = {home: ['stilt', 'stilt'], tall: ['jtree', 'palm', 'mango'], small: ['bush', 'flowers', 'rock'], light: ['lantern']}[r]; return F[n % F.length]; }

  /* ---------- 🧑 the family (the real family when the page has one) ---------- */
  const FAM0 = [{name: 'Mom', av: {skin: 1, hair: 3, hairColor: 2, outfit: 4, outfitColor: 6, acc: 0}}, {name: 'Kid', av: {skin: 2, hair: 1, hairColor: 0, outfit: 2, outfitColor: 2, acc: 2}},
    {name: 'Dad', av: {skin: 1, hair: 0, hairColor: 1, outfit: 7, outfitColor: 4, acc: 0}}];
  function family(){ let f = null; try{ if(typeof familyList === 'function') f = familyList(); }catch(e){} if(!f || !f.length) f = (window.PK_FAMILY && window.PK_FAMILY.length) ? window.PK_FAMILY : FAM0;
    return f.map(x => ({name: x.name, av: x.av || {}})); }
  const POSES = ['wave', 'cheer', 'point', 'think', 'jump', 'still', 'walk'];
  const hasAct = p => { try{ return typeof Acting !== 'undefined' && Acting.has && Acting.has('acts', p); }catch(e){ return false; } };
  const avPose = p => hasAct(p) ? p : (p === 'walk' ? 'walk' : 'still');

  /* ---------- 🧱 6 recipes (8 × 8 island): spec = [{id, k: key | '@av', i, j, o}] + ground tiles (from pk-7p, every look rotates) ---------- */
  function groundFor(recipe){ const t = {};
    if(recipe === 'hamlet'){ for(let i = 0; i < N; i++){ t[i + ',4'] = 'path'; } for(let j = 0; j < N; j++) t['3,' + j] = 'path'; t['3,3'] = t['4,3'] = t['3,4'] = t['4,4'] = 'stone'; }
    if(recipe === 'yard'){ for(let j = 2; j < N; j++) t['3,' + j] = 'path'; for(let i = 0; i < 3; i++) for(let j = 5; j < 8; j++) t[i + ',' + j] = 'dirt'; t['6,7'] = t['7,7'] = 'flower'; }
    if(recipe === 'market'){ for(let i = 0; i < N; i++) for(let j = 2; j < 5; j++) t[i + ',' + j] = (i + j) % 2 ? 'stone' : 'path'; }
    if(recipe === 'faceoff'){ for(let k = 0; k < N; k++){ t[k + ',' + k] = 'path'; if(k < N - 1) t[(k + 1) + ',' + k] = 'path'; } }
    if(recipe === 'wild'){ for(let k = 2; k < N; k++) t[k + ',' + Math.min(N - 1, k + 1)] = 'dirt'; t['6,1'] = t['7,1'] = t['7,2'] = 'flower'; }
    if(recipe === 'garden'){ for(let i = 0; i < N; i++) t[i + ',3'] = 'path'; for(let i = 0; i < 6; i++) for(const j of [4, 6]) t[i + ',' + j] = 'dirt'; t['6,6'] = t['7,7'] = 'flower'; }
    return t; }
  const TILES0 = {}; ['hamlet', 'yard', 'market', 'faceoff', 'wild', 'garden'].forEach(r => TILES0[r] = groundFor(r));
  const YARD_X = {farm: ['mango', 'sunflower', 'coop', 'tilled'], jungle: ['banana', 'bamboo', 'log', 'flowers'], castle: ['topiary', 'rosebush', 'fountain_royal', 'rosebush'], snow: ['pine', 'snowman', 'sled', 'firepit']};
  const GARDEN_X = {grow: ['well', 'stall'], cherry: ['koipond', 'stonelantern'], moon: ['moongarden', 'lantern'], castle: ['fountain_royal', 'topiary']};
  const RECIPES = {
    hamlet: {icon: '🏘️', name: 'Hamlet', looks: ['cherry', 'snow', 'desert', 'detective', 'jungle', 'farm', 'castle', 'coral', 'moon', 'lava'], need: l => [l],
      spec(look){ const det = look === 'detective';
        return [ {id: 'h1', k: role(look, 'home', 0), i: 0, j: 0, o: {v: 0}}, {id: 'h2', k: det ? 'det_agency' : role(look, 'home', 1), i: 5, j: 0, o: {v: 1}},
          {id: 'h3', k: role(look, 'home', 2), i: 0, j: 5, o: {v: 2}}, {id: 'h4', k: det ? 'det_cottage' : role(look, 'home', 0), i: 5, j: 5, o: {v: 1, turn: 0}},
          {id: 'well', k: det ? 'det_clockpost' : 'well', i: 4, j: 3}, {id: 'lamp', k: det ? 'det_gaslamp' : 'lantern', i: 2, j: 3}, {id: 'lamp2', k: det ? 'det_gaslamp' : 'lantern', i: 5, j: 4},
          {id: 'board', k: det ? 'det_clueboard' : 'qboard', i: 2, j: 2}, {id: 'crates', k: det ? 'det_crates' : 'crates', i: 7, j: 3},
          {id: 't1', k: role(look, 'tall', 0), i: 7, j: 2}, {id: 't2', k: role(look, 'tall', 1), i: 2, j: 7}, {id: 't3', k: role(look, 'tall', 2), i: 0, j: 3},
          {id: 's1', k: role(look, 'small', 0), i: 4, j: 7}, {id: 's2', k: role(look, 'small', 1), i: 7, j: 7}, {id: 's3', k: det ? 'det_bike' : role(look, 'small', 2), i: 2, j: 5},
          {id: 'x1', k: det ? 'det_basket' : role(look, 'small', 1), i: 6, j: 3, o: det ? {state: '2'} : {}}, {id: 'x2', k: det ? 'det_prints' : 'rock', i: 3, j: 6, o: det ? {state: 'in'} : {}},
          {id: 'x3', k: det ? 'det_planter' : 'flowers', i: 2, j: 6}, {id: 'x4', k: det ? 'det_catwall' : role(look, 'small', 2), i: 7, j: 5, o: det ? {state: 'sit'} : {}}, {id: 'x5', k: det ? 'det_signpost' : 'signpost', i: 2, j: 0},
          {id: 'p1', k: '@av', i: 3.5, j: 4.6, o: {who: 0, pose: 'wave'}}, {id: 'p2', k: '@av', i: 4.6, j: 2.4, o: {who: 1, pose: 'walk'}} ]; }},
    yard: {icon: '🌾', name: 'Yard', looks: ['farm', 'jungle', 'castle', 'snow'], need: l => l === 'farm' ? ['farm'] : ['farm', l],
      spec(look){ const farm = look === 'farm', X = YARD_X[look] || [];
        return [ {id: 'house', k: farm ? 'farmhouse' : role(look, 'home', 0), i: 0, j: 0, o: {v: 0}}, {id: 'barn', k: farm ? 'barn2' : role(look, 'home', 1), i: 4, j: 0, o: {v: 2}},
          {id: 'silo', k: farm ? 'silo' : 'well', i: 7, j: 0}, {id: 'pen', k: 'pigpen', i: 5, j: 4}, {id: 'hay', k: 'haybale', i: 4, j: 3, o: {state: 'whole'}}, {id: 'stall', k: 'stall', i: 6, j: 2, o: {v: 1, turn: 1}},
          {id: 'pump', k: 'pumpkinpile', i: 2, j: 3, o: {state: '5'}}, {id: 'crow', k: 'scarecrow', i: 1, j: 6}, {id: 'gate', k: 'farmgate', i: 3, j: 7, o: {state: 'closed'}},
          {id: 'barrel', k: 'rainbarrel', i: 2, j: 2}, {id: 'wbar', k: 'wheelbarrow', i: 4, j: 6}, {id: 'coop', k: X[2] || 'coop', i: 7, j: 6},
          {id: 'till1', k: 'tilled', i: 0, j: 5}, {id: 'till2', k: 'tilled', i: 2, j: 5}, {id: 'till3', k: X[3] || 'tilled', i: 0, j: 7}, {id: 'till4', k: 'tilled', i: 2, j: 7},
          {id: 't1', k: role(look, 'tall', 0), i: 0, j: 3}, {id: 't2', k: X[0] || role(look, 'tall', 1), i: 7, j: 3}, {id: 'x1', k: X[1] || role(look, 'small', 0), i: 7, j: 4},
          {id: 'p1', k: '@av', i: 3.5, j: 4.5, o: {who: 2, pose: 'still'}}, {id: 'p2', k: '@av', i: 1.5, j: 4.2, o: {who: 1, pose: 'cheer'}} ]; }},
    market: {icon: '🛒', name: 'Market', looks: ['desert', 'lava', 'coral', 'moon', 'cherry', 'snow', 'jungle', 'castle'], need: l => [l],
      spec(look){ return [ {id: 'inn', k: 'inn', i: 0, j: 0, o: {v: 0}}, {id: 'home', k: role(look, 'home', 1), i: 5, j: 0, o: {v: 1}},
          {id: 'st1', k: 'stall', i: 0, j: 5, o: {v: 0}}, {id: 'st2', k: 'stall', i: 3, j: 5, o: {v: 1}}, {id: 'st3', k: 'stall', i: 6, j: 5, o: {v: 2, turn: 1}},
          {id: 'well', k: 'well', i: 4, j: 3}, {id: 'lamp', k: 'lantern', i: 3, j: 1}, {id: 'lamp2', k: 'lantern', i: 7, j: 3}, {id: 'board', k: 'qboard', i: 1, j: 3},
          {id: 'cr1', k: 'crates', i: 2, j: 4}, {id: 'cr2', k: 'crates', i: 6, j: 2}, {id: 'sign', k: 'signpost', i: 5, j: 3},
          {id: 't1', k: role(look, 'tall', 0), i: 0, j: 7}, {id: 't2', k: role(look, 'tall', 1), i: 5, j: 7}, {id: 's1', k: role(look, 'small', 0), i: 2, j: 7}, {id: 's2', k: role(look, 'small', 1), i: 7, j: 7},
          {id: 'p1', k: '@av', i: 2.5, j: 3.4, o: {who: 0, pose: 'point'}}, {id: 'p2', k: '@av', i: 5.6, j: 4.4, o: {who: 1, pose: 'walk'}} ]; }},
    faceoff: {icon: '🏰⚔️', name: 'Face-off', looks: ['raptor|bolt', 'kitchen|horde', 'monster|myth', 'wizard|gear', 'reef|cloud', 'toybox|dust'], need: l => l.split('|'),
      spec(look){ const [a, b] = look.split('|'), K = (s, slot) => { const k = s + '_' + slot; return Props.DEFS[k] ? k : null; }, res = (s, r) => { try{ return Props.AR.resKey(s, r); }catch(e){ return null; } };
        return [ {id: 'aH', k: K(a, 'house'), i: 0, j: 0, o: {team: 'red', state: '3'}}, {id: 'aT', k: K(a, 'tower'), i: 3, j: 0, o: {team: 'red'}},
          {id: 'aW', k: K(a, 'workshop'), i: 0, j: 3, o: {team: 'red'}}, {id: 'aC', k: res(a, 'coin'), i: 3, j: 2, o: {state: 'full'}},
          {id: 'bH', k: K(b, 'house'), i: 5, j: 6, o: {team: 'blue', state: '3', turn: 2}}, {id: 'bT', k: K(b, 'tower'), i: 4, j: 7, o: {team: 'blue'}},
          {id: 'bW', k: K(b, 'workshop'), i: 6, j: 3, o: {team: 'blue', turn: 2}}, {id: 'bC', k: res(b, 'gem'), i: 4, j: 5, o: {state: 'full'}},
          {id: 'shrine', k: 'realm_shrine', i: 3, j: 3, o: {}}, {id: 'gA', k: K(a, 'gate'), i: 2, j: 2, o: {team: 'red', state: 'closed'}}, {id: 'gB', k: K(b, 'gate'), i: 5, j: 5, o: {team: 'blue', state: 'closed'}},
          {id: 'oreA', k: 'gemore', i: 7, j: 0, o: {state: 'full'}}, {id: 'brA', k: 'bricktree', i: 0, j: 7, o: {state: 'full'}},
          {id: 'p1', k: '@av', i: 2.5, j: 4.6, o: {who: 1, pose: 'cheer'}}, {id: 'p2', k: '@av', i: 5.4, j: 2.5, o: {who: 2, pose: 'point'}} ].filter(s => s.k); }},
    wild: {icon: '🐾', name: 'Wild', looks: ['jungle', 'coral', 'moon', 'castle', 'snow', 'desert'], need: l => ['wild', l],
      spec(look){ return [ {id: 'den', k: 'wild_den', i: 1, j: 1, o: {state: 'awake'}}, {id: 'relic', k: 'wild_relic', i: 4, j: 1, o: {state: 'gold', v: 0}}, {id: 'relic2', k: 'wild_relic', i: 5, j: 1, o: {state: 'silver', v: 2}},
          {id: 'egg', k: 'wild_egg', i: 1, j: 4, o: {state: 'whole'}}, {id: 'warn', k: 'wild_warn', i: 4, j: 5, o: {state: 'path', turn: 0}}, {id: 'warn2', k: 'wild_warn', i: 5, j: 6, o: {state: 'stomp', turn: 1}},
          {id: 'drop', k: 'wild_drop', i: 6, j: 4, o: {state: 'bronze', v: 1}},
          {id: 't1', k: role(look, 'tall', 0), i: 0, j: 6}, {id: 't2', k: role(look, 'tall', 1), i: 7, j: 0}, {id: 't3', k: role(look, 'tall', 2), i: 6, j: 7}, {id: 't4', k: role(look, 'tall', 0), i: 3, j: 7},
          {id: 's1', k: role(look, 'small', 0), i: 7, j: 4}, {id: 's2', k: role(look, 'small', 1), i: 0, j: 4}, {id: 's3', k: 'rock', i: 3, j: 3}, {id: 's4', k: role(look, 'small', 2), i: 6, j: 2},
          {id: 'p1', k: '@av', i: 5.5, j: 5.3, o: {who: 1, pose: 'point'}}, {id: 'p2', k: '@av', i: 2.5, j: 5.6, o: {who: 0, pose: 'think'}} ]; }},
    garden: {icon: '🌱', name: 'Garden', looks: ['grow', 'cherry', 'moon', 'castle'], need: l => l === 'grow' ? ['grow'] : ['grow', l],
      spec(look){ const P = ['growmush', 'growcorn', 'growsun', 'growpepper', 'growpump'], st = ['1', '2', '3', '4a', '5a', '4b', '5b'], X = GARDEN_X[look] || ['well', 'lantern'];
        const out = [ {id: 'home', k: look === 'grow' ? 'farmhouse' : role(look, 'home', 0), i: 0, j: 0, o: {v: 1}}, {id: 'hive', k: 'beehive', i: 3, j: 1}, {id: 'barrel', k: 'rainbarrel', i: 4, j: 1},
          {id: 'well', k: X[0], i: 6, j: 1}, {id: 'lamp', k: X[1], i: 5, j: 0}, {id: 't1', k: role(look, 'tall', 0), i: 7, j: 0}, {id: 's1', k: role(look, 'small', 0), i: 7, j: 6}, {id: 's2', k: 'flowerpatch', i: 6, j: 7},
          {id: 'p1', k: '@av', i: 6.5, j: 3.5, o: {who: 0, pose: 'wave'}}, {id: 'p2', k: '@av', i: 6.4, j: 5.2, o: {who: 1, pose: 'still'}} ];
        for(let n = 0; n < 6; n++){ out.push({id: 'g4_' + n, k: P[n % 5], i: n, j: 4, o: {state: st[(n + 1) % 7]}}); out.push({id: 'g6_' + n, k: P[(n + 2) % 5], i: n, j: 6, o: {state: st[(n + 4) % 7]}}); }
        return out; }}
  };
  const COMBOS = []; Object.keys(RECIPES).forEach(r => RECIPES[r].looks.forEach(l => COMBOS.push(r + ':' + l)));
  const CONDS = {hamlet: ['fresh', 'fresh', 'fresh', 'dry'], yard: ['fresh', 'fresh', 'fresh', 'dry'], market: ['fresh'], faceoff: ['fresh'], wild: ['fresh', 'fresh', 'fresh', 'ruined'], garden: ['fresh', 'fresh', 'fresh', 'dry']};
  const lookOf = look => look.indexOf('|') > 0 ? look.split('|')[0] : look;
  const footOf = k => { const d = Props.DEFS[k]; return d && d.foot ? d.foot : [1, 1]; };
  /* ⑥ pk-7p: a few more small things on free cells so ⚡ / 💀 reach their count */
  function scatter(recipe, look, spec, R){ const taken = new Set(), tiles = TILES0[recipe] || {};
    spec.forEach(s => { if(s.k[0] === '@'){ taken.add(Math.floor(s.i) + ',' + Math.floor(s.j)); return; } const f = footOf(s.k); for(let a = 0; a < f[0]; a++) for(let b = 0; b < f[1]; b++) taken.add((Math.floor(s.i) + a) + ',' + (Math.floor(s.j) + b)); });
    const free = []; for(let i = 0; i < N; i++) for(let j = 0; j < N; j++){ const c = i + ',' + j; if(taken.has(c) || tiles[c] === 'path' || tiles[c] === 'stone') continue;
      let near = false; for(let a = -1; a <= 1 && !near; a++) for(let b = -1; b <= 1; b++) if(spec.some(s => s.k === '@av' && Math.floor(s.i) === i + a && Math.floor(s.j) === j + b)){ near = true; break; }
      if(!near) free.push([i, j]); }
    const lk = lookOf(look), pool = [role(lk, 'small', 0), role(lk, 'small', 1), role(lk, 'small', 2), 'crates', 'rock', 'flowers', 'lantern'].filter(k => Props.DEFS[k] && footOf(k)[0] === 1 && footOf(k)[1] === 1);
    shuffle(R, free).slice(0, 3 + Math.floor(R() * 3)).forEach(([i, j], n) => { if(pool.length) spec.push({id: 'sc' + n, k: pick(R, pool), i, j, o: R() < 0.4 ? {v: Math.floor(R() * 3)} : {}}); });
    return spec; }

  /* ---------- 📷 the bake (Pokadif law: DPR 1 · fixed zoom · frame 0 · shimmer off · a FRESH view every time · sky painted in) ---------- */
  function mapFor(recipe, look, cond, tiles){ const L = lookOf(look), th = THEME[L] || 'meadow', theme = (cond && cond !== 'fresh' && Props.ground) ? Props.ground(th, cond) : th;
    return Iso.map({w: N, h: N, theme, seed: 7, cell: (i, j) => ({t: tiles[i + ',' + j] || 'grass', h: 0})}); }
  function itemsFor(M, look, cond, spec, fam){ const L = lookOf(look), items = [];
    for(const s of spec){ if(s.gone) continue;
      if(s.k === '@av'){ const f = fam[s.o.who % fam.length]; items.push({x: s.i, y: s.j, pic: Iso.avatar(f, {pose: avPose(s.o.pose), f: 0, size: 0.6}), id: s.id}); continue; }
      const o = Object.assign({look: L, cond: cond || 'fresh'}, s.o || {}); const side = s.k.split('_')[0];
      if((Props.LOOKS || {})[side] && s.k.indexOf('_') > 0 && Props.AR && Props.AR.sideOf && Props.AR.sideOf(s.k)) o.look = side;
      let it = null; try{ it = Props.place(M, s.k, s.i, s.j, o) || Props.item(s.k, s.i, s.j, o); }catch(e){ it = null; }
      if(it){ it.id = s.id; items.push(it); } }
    return items; }
  const BUDGET_KEYS = ['level', 'fx', 'shimmer', 'fps', 'dprCap', 'gpuDpr', 'ms', 'avg', '_slow', '_fast', '_gpuSlow', '_gapAvg', '_good'];
  async function bake(recipe, look, cond, spec, tiles2, fam, o){ o = o || {};
    const t0 = NOW(), L = lookOf(look), tiles = Object.assign({}, TILES0[recipe] || {}); (tiles2 || []).forEach(([i, j, t]) => tiles[i + ',' + j] = t);
    const B = Iso.budget, keep = {}; if(B) BUDGET_KEYS.forEach(k => keep[k] = B[k]);   // 📌 pin the quality budget for the bake
    const M = mapFor(recipe, look, cond, tiles), items = itemsFor(M, look, cond, spec, fam);
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.className = 'pkiso-bake';
    const SC = S0 * (o.scale || 1); cv.style.cssText = 'position:fixed;left:-' + (W0 * SC + 60) + 'px;top:0;width:' + (W0 * SC) + 'px;height:' + (H0 * SC) + 'px;pointer-events:none;visibility:hidden';
    document.body.appendChild(cv);
    let out = null;
    try{
      const V = Iso.view(cv, M, {bg: SKY[L] || ['#cde', '#fff'], min: 0.2, max: 4, pan: false, snap: true, dprCap: 1});
      if(V._ro) try{ V._ro.disconnect(); }catch(e){}   // its size is fixed — a late ResizeObserver resize would CLEAR the canvas between frames
      V.zoom = Iso.stepFor(ZOOM * (o.scale || 1)); V.centerOn(N / 2, N / 2 - 0.35, 18);
      await Props.warm(items.filter(it => it.pic && it.pic.bake && !/^s:av:/.test(it.pic.key || '')), V);   // 🧑 avatars bake inside the pinned frames below
      /* frames until two in a row are the same (pictures bake on the first one) — then copy at once, no wait in between */
      const sig = () => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let a = 0, b = 0; for(let i = 0; i < d.length; i += 4){ a = (a + d[i] + d[i + 1] * 3 + d[i + 2] * 7) % 1000000007; b = (b * 31 + d[i + 1]) | 0; } return a + ':' + b; };
      /* ⏱️ the clock is pinned while the frames paint: an avatar part that reads the time (hair · cape · blink) then looks the same in EVERY bake */
      const PN = performance.now, DN = Date.now; let last = '';
      try{ performance.now = () => 4321; Date.now = () => 1795100000000; for(let f = 0; f < 8; f++){ Iso.frame(V, {items, t: 0, shimmer: false}); const sg = sig(); if(f > 0 && sg === last) break; last = sg; } }
      finally { performance.now = PN; Date.now = DN; }
      out = document.createElement('canvas'); out.width = cv.width; out.height = cv.height; const og = out.getContext('2d', {willReadFrequently: true});
      paintSky(og, out.width, out.height, SKY[L] || ['#cde', '#fff']); og.drawImage(cv, 0, 0);
    } finally { cv.remove(); if(B) BUDGET_KEYS.forEach(k => { if(k in keep) B[k] = keep[k]; }); }
    STAT.bakes++; STAT.ms += NOW() - t0;
    return out; }
  function paintSky(g, w, h, bg){ const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, bg[0]); gr.addColorStop(1, bg[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const c = bg[0].match(/[0-9a-f]{2}/gi).map(x => parseInt(x, 16)), dark = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11 < 110;
    if(dark){ const R = rnd(5); g.fillStyle = 'rgba(255,255,255,0.75)'; for(let n = 0; n < 26; n++){ g.beginPath(); g.arc(R() * w, R() * h * 0.45, (0.6 + R() * 1.1) * w / W0, 0, TAU); g.fill(); } return; }
    [[0.22, 0.14, 0.30, 0.09, 0.55], [0.74, 0.09, 0.24, 0.07, 0.45]].forEach(([x, y, rx, ry, a]) => { g.save(); g.translate(x * w, y * h); g.scale(rx * w, ry * h); const r = g.createRadialGradient(0, 0, 0, 0, 0, 1);
      r.addColorStop(0, 'rgba(255,255,255,' + a + ')'); r.addColorStop(0.7, 'rgba(255,255,255,0)'); g.fillStyle = r; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); g.restore(); }); }

  /* ---------- 🔍 measuring ---------- */
  const dataOf = c => c.getContext('2d', {willReadFrequently: true}).getImageData(0, 0, c.width, c.height).data;
  function px(da, db, w, h){ const m = new Uint8Array(w * h); let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for(let i = 0, p = 0; i < da.length; i += 4, p++){ if(Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2])) >= 14){ m[p] = 1; n++; const x = p % w, y = (p / w) | 0; if(x < x0) x0 = x; if(y < y0) y0 = y; if(x > x1) x1 = x; if(y > y1) y1 = y; } }
    return {m, n, box: n ? [x0, y0, x1, y1] : null}; }
  function dilate(m, w, h, r){ const t = new Uint8Array(m.length), o = new Uint8Array(m.length);
    for(let y = 0; y < h; y++){ let last = -1e9; for(let x = 0; x < w; x++){ if(m[y * w + x]) last = x; if(x - last <= r) t[y * w + x] = 1; } last = 1e9; for(let x = w - 1; x >= 0; x--){ if(m[y * w + x]) last = x; if(last - x <= r) t[y * w + x] = 1; } }
    for(let x = 0; x < w; x++){ let last = -1e9; for(let y = 0; y < h; y++){ if(t[y * w + x]) last = y; if(y - last <= r) o[y * w + x] = 1; } last = 1e9; for(let y = h - 1; y >= 0; y--){ if(t[y * w + x]) last = y; if(last - y <= r) o[y * w + x] = 1; } }
    return o; }

  /* ---------- 🎚️ levels (plan §22b): 🌱 🐣 bold · 🔦 + turn · ⚡ quiet + tile · 🌋 + 🍂 dry · 💀 + half-hidden first ---------- */
  const LV = [{bold: true, pose: true, extra: true}, {bold: true, pose: true, extra: true}, {bold: true, pose: true, extra: true, turn: true},
    {quiet: true, tile: true}, {quiet: true, tile: true, cond: true}, {quiet: true, tile: true, cond: true, hidden: true}];
  const NICE = k => (Props.DEFS[k] && Props.DEFS[k].name) || k;
  function grade(d){ if(d.by === 'gone' || d.by === 'turn') return 'bold'; if(d.by === 'cond') return d.b === 'dry' ? 'quiet' : 'bold'; if(d.level === 'bold' || d.level === 'quiet') return d.level; return d.px >= 420 ? 'bold' : 'quiet'; }
  function same(o, A){ for(const k of ['v', 'state', 'turn']){ if(o[k] == null) continue; const a = A[k] == null ? (k === 'state' ? null : 0) : A[k]; if(a === null) continue; if(String(a) !== String(o[k])) return false; } return true; }
  function candidates(recipe, look, cond, spec, L, R, wantGrade){ const out = [], lk = lookOf(look), want = wantGrade || (L.bold ? 'bold' : 'quiet'), topup = want !== (L.bold ? 'bold' : 'quiet');
    spec.forEach(s => { s.o = s.o || {};
      if(s.k === '@av'){ if(want === 'bold' && L.pose){ const nxt = POSES.filter(p => p !== s.o.pose && hasAct(p)); if(nxt.length) out.push({id: s.id, by: 'pose', grade: 'bold', name: '🧑 a new pose', set: {pose: pick(R, nxt)}}); } return; }
      let ds = []; const sideLook = s.k.indexOf('_') > 0 && (Props.LOOKS || {})[s.k.split('_')[0]] ? s.k.split('_')[0] : lk;
      try{ ds = Props.diffs(s.k, Object.assign({look: sideLook, k: ZDIFF, cond: cond === 'fresh' ? undefined : cond}, s.o.v != null ? {v: s.o.v} : {}, s.o.state != null ? {state: s.o.state} : {}, s.o.turn != null ? {turn: s.o.turn} : {}, s.o.team ? {pal: {team: s.o.team}} : {})) || []; }catch(e){ return; }
      ds.forEach(d => { if(!d.ok || d.moves) return; if(d.by === 'text') return; if(d.by === 'cond' && (cond !== 'fresh' || !(L.cond || topup))) return; if(d.by === 'turn' && !(L.turn || topup)) return;
        if(!same(s.o, d.A || {})) return; const df = Props.DEFS[s.k], small = df && df.foot && df.foot[0] * df.foot[1] <= 2; let gr = grade(d); if(small && d.by === 'state' && want === 'quiet' && d.px < 520) gr = 'quiet';
        if(gr !== want) return;
        const B = d.B ? Object.assign({}, d.B) : null; if(B){ delete B.look; delete B.k; if(B.state === null) delete B.state; }
        out.push({id: s.id, k: s.k, by: d.by, grade: gr, b: d.b, name: NICE(s.k), set: B, gone: !B, iso: d.px}); }); });
    if(want === 'quiet') spec.filter(s => s.o && s.o.team && s.o.team[0] !== '#').forEach(s => out.push({id: s.id, k: s.k, by: 'team', grade: 'quiet', name: NICE(s.k), set: {team: s.o.team === 'red' ? '#F07A2A' : '#7A4FD8'}}));
    if(want === 'bold' && L.extra) spec.filter(s => s.k[0] !== '@' && Props.DEFS[s.k] && footOf(s.k)[0] === 1 && footOf(s.k)[1] === 1).slice(0, 8).forEach(s => out.push({id: s.id, k: s.k, by: 'extra', grade: 'bold', name: NICE(s.k), extra: true}));
    if(want === 'quiet' && L.tile){ const taken = new Set(); spec.forEach(s => { const f = s.k[0] === '@' ? [1, 1] : footOf(s.k); for(let a = 0; a < f[0]; a++) for(let b = 0; b < f[1]; b++) taken.add((Math.floor(s.i) + a) + ',' + (Math.floor(s.j) + b)); });
      for(let n = 0; n < 14; n++){ const i = Math.floor(R() * N), j = Math.floor(R() * N); if(taken.has(i + ',' + j)) continue; const cur = (TILES0[recipe] || {})[i + ',' + j] || 'grass', nt = cur === 'grass' ? (R() < 0.5 ? 'path' : 'flower') : 'grass';
        out.push({id: 'tile' + i + '_' + j, by: 'tile', grade: 'quiet', name: 'tile', tile: [i, j, nt]}); } }
    const by = {}; out.forEach(c => (by[c.id] = by[c.id] || []).push(c)); const ids = shuffle(R, Object.keys(by)).map(k => shuffle(R, by[k])), rr = [];
    for(let round = 0; round < 3; round++) ids.forEach(a => { if(a[round]) rr.push(a[round]); }); return rr; }
  const clone = spec => spec.map(s => Object.assign({}, s, {o: Object.assign({}, s.o || {})}));
  function apply(spec, chs, side){ const sp = clone(spec), tiles = [];
    chs.forEach(c => { if(c.tile){ if(side === 'B') tiles.push(c.tile); return; } const s = sp.find(x => x.id === c.id); if(!s) return;
      if(c.extra){ if(side === 'A') s.gone = true; return; } if(side !== 'B') return; if(c.gone) s.gone = true; else Object.assign(s.o, c.set); });
    return {sp, tiles}; }
  /* what the kid reads when they find it (FOUND_SAY keys on the page) */
  function subOf(c){ if(c.by === 'gone') return 'iso_gone'; if(c.by === 'extra') return 'iso_extra'; if(c.by === 'pose') return 'iso_pose'; if(c.by === 'tile') return 'iso_tile'; if(c.by === 'team') return 'iso_team';
    if(c.by === 'turn') return 'iso_turn'; if(c.by === 'cond') return c.b === 'ruined' ? 'iso_ruined' : 'iso_dry'; if(c.by === 'v') return 'iso_colour'; return 'iso_state'; }
  const SAY = {iso_gone: '➖ Something is gone!', iso_extra: '➕ Something new popped up!', iso_pose: '🕺 A new pose!', iso_tile: '🟫 A different ground tile!', iso_team: '🚩 A new team colour!',
    iso_turn: '🔄 It turned around!', iso_dry: '🍂 It dried up!', iso_ruined: '🏚️ It fell apart!', iso_colour: '🎨 A new colour!', iso_state: '🔀 It changed!'};
  try{ if(typeof FOUND_SAY === 'object') Object.keys(SAY).forEach(k => { if(!FOUND_SAY[k]) FOUND_SAY[k] = SAY[k]; }); }catch(e){}

  /* ---------- 🧱 one A / B pair ---------- */
  async function pairOf(seed, level, o){
    const R = rnd(seed), L = LV[level] || LV[0], n = o.n || ((typeof PK !== 'undefined' && PK.LEVELS && PK.LEVELS[level]) ? PK.LEVELS[level].n : 3 + level);
    const recipe = o.recipe, look = o.look, cond = o.cond || 'fresh', Rc = RECIPES[recipe], fam = family();
    const spec = scatter(recipe, look, Rc.spec(look, R).filter(s => s.k && (s.k[0] === '@' || Props.DEFS[s.k])), R);
    const side = async (chs, sd) => { const a = apply(spec, chs, sd); return bake(recipe, look, cond, a.sp, a.tiles, fam); };
    /* the FIRST bake of a new look can still be settling (pictures baked on first use) → bake the base until two in a row match */
    let base = await side([], 'A'), da = base && dataOf(base);
    for(let t = 0; t < 3 && base; t++){ const b2 = await side([], 'A'), d2 = dataOf(b2); let same = d2.length === da.length; for(let i = 0; same && i < d2.length; i += 4) if(d2[i] !== da[i] || d2[i + 1] !== da[i + 1] || d2[i + 2] !== da[i + 2]) same = false; base = b2; da = d2; if(same) break; }
    if(!base) return null;
    const w = base.width, h = base.height, S = w / W0, MINP = Math.round(MIN * S * S), Z = Math.round(ZONE * S);
    const used = new Uint8Array(w * h), chosen = [], tried = {}, measured = [];
    const measure = async c => { if((tried[c.id] || 0) >= 2) return null; tried[c.id] = (tried[c.id] || 0) + 1;
      const A = c.extra ? await side([c], 'A') : base, B = await side([c], 'B'), d = px(c.extra ? dataOf(A) : da, dataOf(B), w, h);
      const why = t => { LOG.push(c.by + ' ' + c.name + ' ' + t); if(LOG.length > 80) LOG.shift(); return null; };
      if(d.n < MINP) return why(d.n + 'px'); const [x0, y0, x1, y1] = d.box; if(x1 - x0 > 150 * S || y1 - y0 > 150 * S) return why('big ' + (x1 - x0) + 'x' + (y1 - y0));
      if(L.quiet && c.by === 'v' && (x1 - x0 > 64 * S || y1 - y0 > 64 * S)) return why('bold v');   // a whole building in a new colour is a bold change
      return Object.assign({}, c, {px: d.n, box: d.box, zone: dilate(d.m, w, h, Z), hidden: c.iso ? Math.max(0, Math.round(100 - d.n / (S * S) / c.iso * 100)) : 0}); };
    const fits = m => { if(chosen.some(x => x.id === m.id)) return false; let ov = false; for(let p = 0; p < used.length; p += 3) if(used[p] && m.zone[p]){ ov = true; break; } if(ov) LOG.push('touch ' + m.by + ' ' + m.name); if(chosen.some(x => x.id === m.id)) return false; if(chosen.filter(x => x.by === m.by).length >= (m.by === 'tile' ? 1 : 3)) return false;
      for(let p = 0; p < used.length; p++) if(used[p] && m.zone[p]) return false; return true; };
    const take = m => { LOG.push('✓ ' + m.by + ' ' + m.name); const g = dilate(m.zone, w, h, Math.ceil(S) + 1); for(let p = 0; p < used.length; p++) if(g[p]) used[p] = 1; chosen.push(m); };   // + a 1-world-px gap: zones never share a poke cell
    const run = async (want) => { const cands = candidates(recipe, look, cond, spec, L, R, want).slice(0, 48); LOG.push('run ' + want + ' ' + cands.length + ' cands: ' + cands.map(c => c.by).join(',')); let budget = Math.max(10, (n - chosen.length) * 3 + 4);
      const pool = [];
      for(const c of cands){ if(chosen.length + pool.length >= n * 2 && pool.length >= n - chosen.length + 2) break; if(budget-- <= 0) break; const m = await measure(c); if(m) pool.push(m); }
      if(L.hidden && want === 'quiet') pool.sort((p, q) => (Math.min(q.hidden, 60) - Math.min(p.hidden, 60)));
      const order = want === 'bold' ? ['v', 'gone', 'extra', 'pose', 'state', 'cond', 'turn'] : ['state', 'team', 'v', 'cond', 'tile', 'gone', 'turn'], k = {}; pool.forEach(m => (k[m.by] = k[m.by] || []).push(m));
      const ks = order.map(x => k[x]).filter(Boolean); for(let r = 0; r < 12 && chosen.length < n; r++) ks.forEach(a => { if(a[r] && chosen.length < n && fits(a[r])) take(a[r]); }); };
    await run(L.bold ? 'bold' : 'quiet');
    if(chosen.length < n){ STAT.short++; await run(L.bold ? 'quiet' : 'bold'); if(chosen.length >= n) STAT.topped++; }
    if(chosen.length < n) return null;
    const A = await side(chosen, 'A'), B = await side(chosen, 'B'), dA = dataOf(A), dB = dataOf(B), all = px(dA, dB, w, h);
    let outside = 0; const own = chosen.map(() => 0);
    for(let p = 0; p < all.m.length; p++) if(all.m[p]){ let hit = -1; for(let q = 0; q < chosen.length; q++) if(chosen[q].zone[p]){ hit = q; break; } if(hit < 0) outside++; else own[hit]++; }
    if(outside > 0 || own.some(v => v < MINP)) return null;
    return {A, B, chosen, own, w, h, S, recipe, look, cond, outside}; }

  /* ---------- 🧱 a Pokadif scene from a pair: world-unit diffs + zone masks on the 400 × 300 grid ---------- */
  function sceneOf(P, seed, level){
    const {w, h, S} = P, Wg = W0, Hg = H0, diffs = [], masks = [];
    P.chosen.forEach((c, i) => { const g = new Uint8Array(Wg * Hg); let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for(let p = 0; p < c.zone.length; p++) if(c.zone[p]){ const x = Math.min(Wg - 1, ((p % w) / S) | 0), y = Math.min(Hg - 1, (((p / w) | 0) / S) | 0); g[y * Wg + x] = 1; if(x < x0) x0 = x; if(y < y0) y0 = y; if(x > x1) x1 = x; if(y > y1) y1 = y; }
      const cx = (x0 + x1 + 1) / 2, cy = (y0 + y1 + 1) / 2, hit = Math.max(16, Math.max(x1 - x0 + 1, y1 - y0 + 1) / 2 + 2);
      masks.push(g); diffs.push({x: Math.round(cx * 10) / 10, y: Math.round(cy * 10) / 10, r: Math.round(hit * 10) / 10, hit: Math.round(hit * 10) / 10, t: 'iso', sub: subOf(c), by: c.by, name: c.name, px: Math.round(P.own[i] / (S * S)), i,
        box: [x0, y0, x1 + 1, y1 + 1], zbox: c.box}); });
    const inZ = (q, x, y) => { const xi = Math.floor(x), yi = Math.floor(y); return xi >= 0 && yi >= 0 && xi < Wg && yi < Hg && masks[q][yi * Wg + xi] === 1; };
    const near = (q, x, y, e) => { let best = 1e9; const r = Math.ceil(e); for(let a = -r; a <= r; a++) for(let b = -r; b <= r; b++){ const dd = Math.hypot(a, b); if(dd <= e && dd < best && inZ(q, x + a, y + b)) best = dd; } return best; };
    const zone = {
      poke(x, y, found, extra){ for(let q = 0; q < diffs.length; q++){ if(found && found[q]) continue; if(inZ(q, x, y)) return q; }
        if(!extra) return -1; let best = -1, bd = 1e9; for(let q = 0; q < diffs.length; q++){ if(found && found[q]) continue; const d = near(q, x, y, extra); if(d < bd){ bd = d; best = q; } } return best; },
      found(x, y, found){ for(let q = 0; q < diffs.length; q++) if(found && found[q] && near(q, x, y, 3) < 1e9) return q; return -1; },
      mask: q => masks[q], W: Wg, H: Hg };
    const day = !NIGHT.has(lookOf(P.look)), R = RECIPES[P.recipe];
    return {iso: true, mix: false, seed, level, theme: day ? 'sky' : 'space', day, sig: 'iso:' + P.recipe + ':' + P.look + ':' + P.cond + ':' + seed,
      A: [], B: [], diffs, zone, imgA: P.A, imgB: P.B, S, recipe: P.recipe, look: P.look, cond: P.cond,
      label: R.icon + ' ' + R.name + ' · ' + P.look.split('|').map(l => NAME[l] || l).join(' vs '), _P: P}; }

  /* ---------- 🎲 make one (a combo that isn't one of the last ones, 3 seeds, else null) ---------- */
  const RECENT = [];
  function choose(R, o){ if(o.recipe && o.look) return {recipe: o.recipe, look: o.look, cond: o.cond || 'fresh'};
    const last = RECENT.slice(-2), lastRecipe = RECENT.length ? RECENT[RECENT.length - 1].split(':')[0] : '';
    let pool = COMBOS.filter(c => { const [r, l] = c.split(':'); return (!o.recipe || r === o.recipe) && r !== lastRecipe && !last.some(x => x.split(':')[1] === l); }); if(!pool.length) pool = COMBOS.slice();
    const c = pick(R, pool), [recipe, look] = [c.split(':')[0], c.slice(c.indexOf(':') + 1)]; return {recipe, look, cond: o.cond || pick(R, CONDS[recipe] || ['fresh'])}; }
  async function make(seed, level, o){ o = o || {}; if(!(await kits())) return null;
    for(let t = 0; t < 5; t++){ const s = (seed + t * 7919) >>> 0, R = rnd(s ^ 0x51ED), ch = t < 3 ? choose(R, o) : choose(R, Object.assign({}, o, o.look ? {} : {recipe: 'hamlet'}));   // 2 more tries, the last on the easiest recipe
      if(!(await looks(RECIPES[ch.recipe].need(ch.look)))) continue;
      let P = null; try{ P = await pairOf(s, level, Object.assign({}, o, ch)); }catch(e){ try{ console.warn('🧱 Pokadif_iso', e && e.message); }catch(_){} P = null; }
      if(P){ STAT.made++; if(!o.look){ RECENT.push(ch.recipe + ':' + ch.look); if(RECENT.length > 6) RECENT.shift(); } return sceneOf(P, s, level); } }
    STAT.failed++; return null; }

  /* ---------- 🗂️ the next one, baked while the kid plays this one ---------- */
  const Q = {}, keyOf = (lv, n) => lv + ':' + (n || 0);
  const newSeed = () => (typeof PK !== 'undefined' && PK.newSeed) ? PK.newSeed() : ((Math.random() * 4294967296) >>> 0);
  function want(level, n){ const k = keyOf(level, n); if(Q[k]) return Q[k].p;
    const slot = {sc: null}; slot.p = (async () => { await sleep(0); const sc = await make(newSeed(), level, {n}); slot.sc = sc; if(!sc && Q[k] === slot) delete Q[k]; return sc; })(); Q[k] = slot; return slot.p; }
  function has(level, n){ const s = Q[keyOf(level, n)]; return !!(s && s.sc); }
  function take(level, n){ const k = keyOf(level, n), s = Q[k]; if(!s || !s.sc) return null; delete Q[k]; return s.sc; }

  /* ---------- 🖌️ the page paints a 🧱 picture (the bitmap, scaled) ---------- */
  function paint(cv, sc, side, k, dpr){ const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    const img = side === 'B' ? sc.imgB : sc.imgA; if(!img) return; g.imageSmoothingEnabled = true; try{ g.imageSmoothingQuality = 'high'; }catch(e){}
    g.drawImage(img, 0, 0, img.width, img.height, 0, 0, W0 * k * dpr, H0 * k * dpr); }

  /* ---------- 🟢 a found mark on a 🧱 picture = an outline round the changed SHAPE + a ground ring squashed 0.34 ---------- */
  function outline(sc, q){ const d = sc.diffs[q]; if(d._ol) return d._ol; const P = sc._P, c = P.chosen[q], w = P.w, z = c.zone, [x0, y0, x1, y1] = [Math.max(0, d.zbox[0] - P.S * (ZONE + 2)), Math.max(0, d.zbox[1] - P.S * (ZONE + 2)), Math.min(w - 1, d.zbox[2] + P.S * (ZONE + 2)), Math.min(P.h - 1, d.zbox[3] + P.S * (ZONE + 2))].map(Math.round);
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1, edge = new Uint8Array(cw * ch);
    for(let y = 0; y < ch; y++) for(let x = 0; x < cw; x++){ const p = (y + y0) * w + (x + x0); if(!z[p]) continue; if(x + x0 === 0 || !z[p - 1] || !z[p + 1] || !z[p - w] || !z[p + w]) edge[y * cw + x] = 1; }
    const thick = dilate(edge, cw, ch, Math.max(1, Math.round(P.S * 1.1))), cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const g = cv.getContext('2d'), im = g.createImageData(cw, ch);
    for(let p = 0; p < thick.length; p++) if(thick[p]){ im.data[p * 4] = im.data[p * 4 + 1] = im.data[p * 4 + 2] = 255; im.data[p * 4 + 3] = 255; }
    g.putImageData(im, 0, 0); d._ol = {url: cv.toDataURL('image/png'), box: [x0 / P.S, y0 / P.S, (x1 + 1) / P.S, (y1 + 1) / P.S]}; return d._ol; }
  function dress(el, sc, q){ if(!el || !sc || !sc.iso || !sc.diffs[q]) return; const d = sc.diffs[q], o = outline(sc, q), side = d.hit * 2, L = d.x - d.hit, T = d.y - d.hit;
    el.classList.add('iso'); const i = document.createElement('i'), b = document.createElement('b');
    const pc = (v, base) => ((v - base) / side * 100).toFixed(2) + '%';
    Object.assign(i.style, {left: pc(o.box[0], L), top: pc(o.box[1], T), width: ((o.box[2] - o.box[0]) / side * 100).toFixed(2) + '%', height: ((o.box[3] - o.box[1]) / side * 100).toFixed(2) + '%'});
    i.style.setProperty('-webkit-mask-image', 'url(' + o.url + ')'); i.style.setProperty('mask-image', 'url(' + o.url + ')');
    const bw = (d.box[2] - d.box[0]) * 1.1, bh = bw * 0.34, bx = (d.box[0] + d.box[2]) / 2, by = d.box[3] - 2;
    Object.assign(b.style, {left: pc(bx - bw / 2, L), top: pc(by - bh / 2, T), width: (bw / side * 100).toFixed(2) + '%', height: (bh / side * 100).toFixed(2) + '%'});
    el.appendChild(b); el.appendChild(i); }

  return {want, has, take, make, paint, dress, kits, ready: () => !!(window.Iso && window.Props && Props.diffs), COMBOS, RECIPES, LV, SAY, stats: () => Object.assign({}, STAT), log: () => LOG.slice(), _pair: pairOf, _bake: bake, _recent: RECENT, _q: Q, ZONE, MIN, W: W0, H: H0, S: S0};
})();
window.PKISO = PKISO;
GameParts.loaded('Pokadif_iso', 'pk-7b');
