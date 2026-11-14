
// ===== Pokadif ENGINE (pure logic, no DOM) — pasted into Pokadif.html between ENGINE START/END =====
// ENGINE START
var PK = (function () {
  'use strict';
  // A picture = a 400 × 300 world. Scene = background (theme + deco, the SAME in both pictures) + items (picture A) + items (picture B)
  // + the list of differences between them. Every round gets a fresh seed → a new scene (never the same twice).
  var W = 400, H = 300, GROUND = 232;
  var MIN_HIT = 27;   // world units: the smallest poke circle (≈ 24 CSS px on a phone held upright, where 1 unit ≈ 0.93 px)

  // ---------- pieces (the painter in the page draws each kind; here: size, which differences it can show) ----------
  // h = looks different when flipped left ↔ right · r = turns (90° / 180°) show · n = [min, max] things to count
  var KINDS = {
    circle:   { s: 0.9 },  square: { s: 0.9 },  triangle: { s: 1, r: [180] },  star: { s: 1 },  heart: { s: 0.95, r: [180] },
    diamond:  { s: 1, r: [90] },  hexagon: { s: 0.95 },
    fish:     { s: 1.05, h: true },  bird: { s: 1, h: true },  flower: { s: 1, n: [4, 8] },  tree: { s: 1.1 },
    house:    { s: 1.05, h: true, n: [1, 4] },  rocket: { s: 1.05, r: [90, 180] },  mushroom: { s: 1, n: [1, 5] },
    ladybug:  { s: 0.95, r: [90, 180], n: [2, 6] },  balloon: { s: 1 },  cloud: { s: 1.1 },  dice: { s: 0.9, n: [1, 6] },
    crystal:  { s: 1 },  planet: { s: 1, h: true },  boat: { s: 1.05, h: true },  snail: { s: 1, h: true },  gear: { s: 0.95 },
    shell:    { s: 0.95, r: [180], n: [3, 7] },  leaf: { s: 1, r: [90] },
    // R2 (pk-2a): a little sign with a sum or a word · a string of beads in a pattern (only used for those change types)
    sign:     { s: 1, txt: true },  beads: { s: 1, pat: true }
  };
  var SHAPES = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'hexagon'];

  // ---------- the 6 house themes (the same six as GeoScout / GeoRead) ----------
  var THEMES = {
    dino:  { name: 'Dino Quarry',  icon: '🦖', top: '#2E5A2F', bot: '#9CCB5E', ground: '#8B6A43', hill: '#6E9B3A', deco: ['🌿', '🦴', '🌋', '🦕', '🌴'], kinds: ['tree', 'leaf', 'mushroom', 'ladybug', 'snail', 'flower', 'crystal', 'triangle', 'star', 'circle'] },
    sea:   { name: 'Coral Reef',   icon: '🐙', top: '#0A3D6B', bot: '#3AA7D6', ground: '#E2C58A', hill: '#D2B070', deco: ['🐠', '🫧', '🪸', '🐚', '🐡'], kinds: ['fish', 'shell', 'boat', 'star', 'snail', 'crystal', 'circle', 'heart', 'balloon', 'hexagon'] },
    disco: { name: 'Disco Hall',   icon: '🪩', top: '#1B0533', bot: '#6A2290', ground: '#2A0B45', hill: '#3D1260', deco: ['🪩', '🎵', '✨', '💃', '🔊'], kinds: ['star', 'heart', 'diamond', 'balloon', 'dice', 'crystal', 'hexagon', 'circle', 'square', 'flower'] },
    robot: { name: 'Robot Lab',    icon: '🤖', top: '#102534', bot: '#3A6280', ground: '#3B4D60', hill: '#4A6075', deco: ['⚙️', '🔩', '💡', '📡', '🤖'], kinds: ['gear', 'rocket', 'dice', 'square', 'hexagon', 'house', 'crystal', 'diamond', 'ladybug', 'triangle'] },
    space: { name: 'Moon Base',    icon: '🪐', top: '#05061F', bot: '#2A2680', ground: '#6B6F86', hill: '#80849C', deco: ['🪐', '⭐', '☄️', '🛰️', '🌙'], kinds: ['planet', 'rocket', 'star', 'crystal', 'circle', 'diamond', 'cloud', 'gear', 'heart', 'dice'] },
    sky:   { name: 'Cloud Temple', icon: '☁️', top: '#4FA3E0', bot: '#CDEBFF', ground: '#F4F8FF', hill: '#DDEBFB', deco: ['🌈', '🕊️', '🏛️', '☀️', '🪁'], kinds: ['cloud', 'bird', 'balloon', 'house', 'tree', 'flower', 'heart', 'star', 'leaf', 'boat'] }
  };
  // 📖 pk-4c: two scenes only for case books (not houses): 🌱 Greenhouse · ⏰ Clock Tower
  THEMES.garden = { name: 'Greenhouse', icon: '🌱', top: '#7CC6A0', bot: '#E8F7D8', ground: '#6B4A2E', hill: '#8BC86A', deco: ['🌻', '🪴', '🐝', '🦋', '🌷'], kinds: ['flower', 'leaf', 'tree', 'mushroom', 'ladybug', 'snail', 'circle', 'heart', 'star', 'balloon'], caseOnly: true };
  THEMES.clock = { name: 'Clock Tower', icon: '⏰', top: '#3A2A4A', bot: '#B98A5A', ground: '#5A4030', hill: '#7A5A40', deco: ['🔔', '⚙️', '🕯️', '🦉', '🗝️'], kinds: ['gear', 'circle', 'star', 'house', 'diamond', 'hexagon', 'square', 'bird', 'crystal', 'dice'], caseOnly: true };
  var THEME_KEYS = ['dino', 'sea', 'disco', 'robot', 'space', 'sky'];
  // 📸 pk-4a Family Photo Hunt: 7 trip places (the 🧳 Avatraveller regions) — a painted landmark behind the family (painter: pkTrip)
  var TRIP_PROPS = ['suitcase', 'camera', 'icecream', 'balloon', 'flower', 'heart', 'star', 'bird'];
  THEMES.trip_jungle = { name: 'Elephant Jungle', icon: '🐘', top: '#2F7A4A', bot: '#BFE6A0', ground: '#8A6A3F', hill: '#4E8C3A', deco: ['🌴', '🦜', '🌺'], kinds: TRIP_PROPS.concat(['leaf', 'tree']), mark: 'temple' };
  THEMES.trip_cherry = { name: 'Cherry Mountain', icon: '🌸', top: '#7EB8F0', bot: '#FFE3F0', ground: '#8FBF6A', hill: '#F3B5CE', deco: ['🌸', '🎏', '🍡'], kinds: TRIP_PROPS.concat(['leaf', 'cloud']), mark: 'mountain' };
  THEMES.trip_pyramid = { name: 'Pyramid Sands', icon: '🐪', top: '#F7A84A', bot: '#FFE6A8', ground: '#E2B86A', hill: '#D9A85A', deco: ['🌵', '☀️', '🦂'], kinds: TRIP_PROPS.concat(['crystal', 'diamond']), mark: 'pyramids' };
  THEMES.trip_aurora = { name: 'Aurora North', icon: '❄️', top: '#0B1D3A', bot: '#2E6F8E', ground: '#EAF4FF', hill: '#CFE3F5', deco: ['❄️', '🦌', '⛄'], kinds: TRIP_PROPS.concat(['crystal', 'star']), mark: 'aurora' };
  THEMES.trip_lava = { name: 'Lava Isles', icon: '🌋', top: '#3B1020', bot: '#F07A3A', ground: '#4A3530', hill: '#6A4038', deco: ['🔥', '🌴', '🦎'], kinds: TRIP_PROPS.concat(['crystal', 'diamond']), mark: 'volcano' };
  THEMES.trip_coral = { name: 'Coral Coast', icon: '🌊', top: '#38B6FF', bot: '#BDF0FF', ground: '#F5DC9A', hill: '#3AA7D6', deco: ['🐚', '🦀', '⛱️'], kinds: TRIP_PROPS.concat(['shell', 'fish']), mark: 'beach' };
  THEMES.trip_moon = { name: 'Moon Base', icon: '🚀', top: '#05061F', bot: '#2A2680', ground: '#9A9DB0', hill: '#7D8096', deco: ['⭐', '🛰️', '☄️'], kinds: TRIP_PROPS.concat(['planet', 'rocket']), mark: 'moon' };
  var TRIP_KEYS = ['trip_jungle', 'trip_cherry', 'trip_pyramid', 'trip_aurora', 'trip_lava', 'trip_coral', 'trip_moon'];
  // bright colours that stand out on every background
  var PAL = ['#E63946', '#FF8C1A', '#FFD23F', '#8BD346', '#22B573', '#1FB5C4', '#3A6FE8', '#8E5BE8', '#FF5FA8', '#9B5B2E'];

  // ---------- difference types ----------
  // colour · gone (➖ missing / ➕ extra) · size · shape · turn (🔄 turn / flip) · count
  var TYPES6 = ['colour', 'gone', 'size', 'shape', 'turn', 'count'];
  // R2 (pk-2a): 🧮 a sum on a sign changes · 🔤 a word on a sign changes · 🌀 one bead breaks the pattern
  var TYPES = TYPES6.concat(['equation', 'word', 'pattern']);
  var TYPE_INFO = {
    colour: { icon: '🎨', name: 'Colour', tip: 'a different colour' },
    gone:   { icon: '➖➕', name: 'Missing / extra', tip: 'something missing or something extra' },
    size:   { icon: '📏', name: 'Size', tip: 'something bigger or smaller' },
    shape:  { icon: '🔺', name: 'Shape', tip: 'a different shape' },
    turn:   { icon: '🔄', name: 'Turn / flip', tip: 'something turned or flipped' },
    count:  { icon: '🔢', name: 'Count', tip: 'more or fewer spots, petals or dots' },
    equation: { icon: '🧮', name: 'Odd equation', tip: 'a sum on a sign that changed' },
    word:   { icon: '🔤', name: 'Odd word', tip: 'a word on a sign that changed' },
    pattern: { icon: '🌀', name: 'Pattern break', tip: 'a bead that breaks its pattern' }
  };
  // levels (plan §8): n = differences in a picture · items · r = item size · mag = how big a change is (1 = huge, smaller = subtler)
  // hints = 🔍 magnifier per picture · glow = soft glow on a missed difference after s seconds (0 = never) · lives = oops allowed (0 = no limit)
  var LEVELS = [
    { name: 'Basic',        n: 3, items: 8,  r: 31, mag: 1.0,  types: ['colour', 'gone'], hints: 3, glow: 10, pics: 3, lives: 0, guide: true },
    { name: 'Junior',       n: 4, items: 10, r: 28, mag: 0.85, types: ['colour', 'gone', 'size', 'shape'], hints: 2, glow: 20, pics: 3, lives: 0 },
    { name: 'Intermediate', n: 5, items: 12, r: 26, mag: 0.7,  types: TYPES6, hints: 2, glow: 0, pics: 3, lives: 0 },
    { name: 'Hard',         n: 6, items: 14, r: 24, mag: 0.6,  types: TYPES6.concat(['equation', 'word']), hints: 1, glow: 0, pics: 3, lives: 0 },
    { name: 'Extreme',      n: 7, items: 16, r: 22, mag: 0.5,  types: TYPES, hints: 1, glow: 0, pics: 3, lives: 0 },
    { name: 'Hardcore',     n: 7, items: 18, r: 21, mag: 0.4,  types: TYPES, hints: 0, glow: 0, pics: 3, lives: 3, hardcore: true, decoys: true }
  ];

  // ---------- signs: sums + words (pk-2a) ----------
  var WORD_SETS = [['CAT', 'HAT', 'BAT', 'RAT', 'MAT'], ['DOG', 'DIG', 'DUG', 'LOG', 'FOG'], ['SUN', 'RUN', 'BUN', 'FUN'], ['PIG', 'BIG', 'WIG', 'FIG'], ['HEN', 'PEN', 'TEN', 'MEN'],
    ['TOP', 'MOP', 'HOP', 'POP'], ['BUG', 'RUG', 'HUG', 'MUG', 'JUG'], ['MAP', 'CAP', 'TAP', 'NAP'], ['FIN', 'PIN', 'TIN', 'BIN'], ['BOX', 'FOX', 'BOY', 'TOY'], ['CUP', 'PUP', 'PUT', 'CUT']];
  // rhyme families for 🎯 Odd One Out (one word comes from another family)
  var RHYMES = [['CAT', 'HAT', 'BAT', 'MAT', 'RAT', 'SAT', 'PAT', 'FAT', 'FLAT', 'CHAT', 'THAT', 'SPLAT'], ['DOG', 'LOG', 'FOG', 'HOG', 'JOG', 'FROG', 'BOG', 'COG', 'CLOG', 'SMOG', 'BLOG', 'SLOG'],
    ['PIG', 'BIG', 'DIG', 'FIG', 'WIG', 'JIG', 'TWIG', 'RIG', 'GIG', 'ZIG', 'SWIG', 'BRIG'], ['SUN', 'RUN', 'FUN', 'BUN', 'NUN', 'SPUN', 'STUN', 'DONE', 'ONE', 'TON', 'WON', 'GUN'],
    ['TOP', 'MOP', 'HOP', 'POP', 'SHOP', 'STOP', 'DROP', 'CHOP', 'FLOP', 'CROP', 'PLOP', 'SLOP'], ['BUG', 'RUG', 'HUG', 'MUG', 'JUG', 'TUG', 'DUG', 'PLUG', 'SNUG', 'SLUG', 'SHRUG', 'DRUG'],
    ['HEN', 'PEN', 'TEN', 'MEN', 'DEN', 'THEN', 'WHEN', 'WREN', 'GLEN', 'KEN', 'ZEN', 'YEN'], ['CAKE', 'LAKE', 'MAKE', 'BAKE', 'TAKE', 'RAKE', 'SNAKE', 'SHAKE', 'WAKE', 'FAKE', 'FLAKE', 'BRAKE']];
  function makeSum(R, level) {
    var minus = level >= 4 && R() < 0.45, a, b, c;
    if (minus) { a = 5 + Math.floor(R() * (level >= 5 ? 15 : 10)); b = 1 + Math.floor(R() * (a - 1)); c = a - b; }
    else { a = 1 + Math.floor(R() * 9); b = 1 + Math.floor(R() * 9); c = a + b; }
    return { a: a, b: b, op: minus ? '−' : '+', c: c };
  }
  function sumText(e) { return e.a + e.op + e.b + '=' + e.c; }

  // ---------- helpers ----------
  function rng(seed) { var s = (seed >>> 0) || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; var t = s ^ (s >>> 15); t = Math.imul(t, 2246822519) >>> 0; return ((t ^ (t >>> 13)) >>> 0) / 4294967296; }; }
  function pick(R, a) { return a[Math.floor(R() * a.length) % a.length]; }
  function shuffle(R, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function hexRgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function colDist(a, b) { var x = hexRgb(a), y = hexRgb(b); return Math.sqrt(Math.pow(x[0] - y[0], 2) * 0.3 + Math.pow(x[1] - y[1], 2) * 0.59 + Math.pow(x[2] - y[2], 2) * 0.11) * 1.7; }
  function dist(a, b) { return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)); }
  function clone(it) { var o = {}; for (var k in it) o[k] = it[k]; return o; }
  function hash(str) { var h = 2166136261 >>> 0; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
  var SEQ = 0;
  // a new seed every round: clock + a counter + chance (the page also remembers the last seeds so a repeat is skipped)
  function newSeed() { SEQ = (SEQ + 1) % 1e6; return (hash(String(Date.now()) + ':' + SEQ + ':' + Math.random()) >>> 0) || 7; }
  // the size an item shows at (world units) — what the poke circle + the "is it visible" test use
  function radiusOf(it) { return it.r * (KINDS[it.k] ? KINDS[it.k].s : 1); }
  function hitOf(d) { return Math.max(MIN_HIT, d.r * 1.2); }

  // ---------- placing things ----------
  function freeSpot(R, items, deco, r, tries) {
    for (var t = 0; t < (tries || 300); t++) {
      var p = { x: r + 8 + R() * (W - 2 * r - 16), y: r + 10 + R() * (H - 2 * r - 18) };
      var okp = true;
      for (var i = 0; i < items.length && okp; i++) { var q = items[i]; if (dist(p, q) < (radiusOf(q) + r) * 1.08 + 6) okp = false; }
      for (var j = 0; j < deco.length && okp; j++) if (dist(p, deco[j]) < deco[j].r + r + 2) okp = false;
      if (okp) return p;
    }
    return null;
  }
  function colourFor(R, used, avoid) {
    var c = shuffle(R, PAL).filter(function (x) { return !avoid || colDist(x, avoid) > 60; });
    for (var i = 0; i < c.length; i++) if ((used[c[i]] || 0) < 2) return c[i];
    return c[0] || PAL[0];
  }
  function countOf(R, k) { var n = KINDS[k].n; return n ? n[0] + Math.floor(R() * (n[1] - n[0] + 1)) : 0; }

  // ---------- one difference ----------
  // turns item A (in list B) into its changed copy; returns the diff or null when this item can't show that type
  function applyDiff(R, sc, L, type, a, B, deco) {
    var ib = -1; for (var bi = 0; bi < B.length; bi++) if (B[bi].id === a.id) ib = bi;
    if (ib < 0) return null;
    var b = clone(a), d = { t: type, idA: a.id, idB: a.id, x: a.x, y: a.y, r: radiusOf(a) };
    var mag = L.mag, K = KINDS[a.k];
    if (type === 'colour') {
      var need = 110 + 110 * mag, opts = shuffle(R, PAL).filter(function (c) { return c !== a.c && colDist(c, a.c) >= need; });
      if (!opts.length) opts = shuffle(R, PAL).filter(function (c) { return colDist(c, a.c) >= 100; });
      if (!opts.length) return null;
      b.c = opts[0]; d.sub = 'colour';
    } else if (type === 'gone') {
      if (R() < 0.5) { B.splice(ib, 1); d.sub = 'missing'; d.idB = null; return d; }
      // ➕ extra: a new thing in picture B where picture A has empty space
      var r = L.r * (0.9 + R() * 0.2), k = pick(R, sc.kinds), p = freeSpot(R, B.concat(sc.A), deco, r * (KINDS[k].s || 1));
      if (!p) return null;
      var e = { id: 'x' + a.id, k: k, x: p.x, y: p.y, r: r, c: colourFor(R, {}), rot: 0, fl: 1, n: countOf(R, k) };
      B.push(e); d.sub = 'extra'; d.idA = null; d.idB = e.id; d.x = e.x; d.y = e.y; d.r = radiusOf(e); return d;
    } else if (type === 'size') {
      var grow = 1 + 0.55 * mag + 0.2, shrink = 1 / (1 + 0.45 * mag + 0.25);
      var up = R() < 0.5;
      if (up) { b.r = a.r * grow; var room = freeRoom(a, sc.A.concat(B), deco); if (radiusOf(b) > room) up = false; }
      if (!up) { b.r = a.r * shrink; if (radiusOf(b) < 11) return null; }
      d.sub = up ? 'bigger' : 'smaller'; d.r = Math.max(radiusOf(a), radiusOf(b));
    } else if (type === 'shape') {
      var pool = sc.kinds.concat(SHAPES).filter(function (k) { return k !== a.k && !sameLook(k, a.k); });
      b.k = pick(R, pool); b.n = countOf(R, b.k); b.rot = 0; b.fl = 1; d.sub = 'shape';
      d.r = Math.max(radiusOf(a), radiusOf(b));
    } else if (type === 'turn') {
      if (K.h && (!K.r || R() < 0.5)) { b.fl = -a.fl; d.sub = 'flip'; }
      else if (K.r) { b.rot = (a.rot + pick(R, K.r)) % 360; d.sub = 'turn'; }
      else return null;
    } else if (type === 'equation') {
      if (a.k !== 'sign' || a.tt !== 'eq') return null;
      var e = { a: a.eq.a, b: a.eq.b, op: a.eq.op, c: a.eq.c }, st = mag >= 0.7 ? 2 : 1;
      // pk-4c: try every ± change, skip look-alike digit swaps (2↔3, 5↔6 …: < 45 changed pixels on a 💀 tiny sign) when a bolder one exists
      var cands = [], bold = [];
      [['c', st], ['c', -st], ['b', st], ['b', -st]].forEach(function (m) { var v = e[m[0]] + m[1]; if (v < 1) return; var x = { a: e.a, b: e.b, op: e.op, c: e.c }; x[m[0]] = v; var tx = sumText(x); if (tx === a.txt) return; cands.push(x); if (!lookAlike(a.txt, tx)) bold.push(x); });
      if (!cands.length) return null;
      e = pick(R, bold.length ? bold : cands);
      b.eq = e; b.txt = sumText(e); if (b.txt === a.txt) return null; d.sub = 'sum';
    } else if (type === 'word') {
      if (a.k !== 'sign' || a.tt !== 'word') return null;
      var set = null; WORD_SETS.forEach(function (ws) { if (ws.indexOf(a.txt) >= 0) set = ws; });
      if (!set) return null; b.txt = pick(R, set.filter(function (w) { return w !== a.txt; })); d.sub = 'word';
    } else if (type === 'pattern') {
      if (a.k !== 'beads') return null;
      var bi = 2 + Math.floor(R() * 4), cur = a.pat[bi], alt = PAL.filter(function (c) { return c !== cur && colDist(c, cur) >= 110 && a.pat.indexOf(c) < 0; });
      if (!alt.length) return null; b.pat = a.pat.slice(); b.pat[bi] = pick(R, alt); d.sub = 'pattern';
    } else if (type === 'count') {
      if (!K.n || radiusOf(a) < 24) return null;
      var step = mag >= 0.7 ? 2 : 1, n2 = a.n + (R() < 0.5 ? step : -step);
      if (n2 < K.n[0] || n2 > K.n[1]) n2 = a.n + (n2 < K.n[0] ? step : -step);
      if (n2 < K.n[0] || n2 > K.n[1] || n2 === a.n) return null;
      b.n = n2; d.sub = n2 > a.n ? 'more' : 'fewer';
    }
    B[ib] = b; return d;
  }
  function sameLook(a, b) { var g = [['circle', 'planet'], ['star', 'crystal'], ['hexagon', 'gear']]; for (var i = 0; i < g.length; i++) if (g[i].indexOf(a) >= 0 && g[i].indexOf(b) >= 0) return true; return false; }
  // how big an item may grow before it touches a neighbour
  function freeRoom(a, items, deco) {
    var room = Math.min(a.x - 4, W - a.x - 4, a.y - 4, H - a.y - 4);
    items.forEach(function (q) { if (q.id !== a.id) room = Math.min(room, dist(a, q) - radiusOf(q) - 3); });
    deco.forEach(function (q) { room = Math.min(room, dist(a, q) - q.r); });
    return room;
  }
  // can this item carry this type at all? (so the scene gets the right kind of item for it)
  var LOOK_ALIKE = ['23', '38', '56', '68', '89', '08', '17', '35', '69'];
  function lookAlike(t1, t2) {   // the two texts differ only in look-alike digits?
    if (t1.length !== t2.length) return false; var any = false;
    for (var i = 0; i < t1.length; i++) if (t1[i] !== t2[i]) { var pr = [t1[i], t2[i]].sort().join(''); if (LOOK_ALIKE.indexOf(pr) < 0) return false; any = true; }
    return any;
  }
  function fits(type, k) { var K = KINDS[k]; if (type === 'equation' || type === 'word') return k === 'sign'; if (type === 'pattern') return k === 'beads';
    if (k === 'sign' || k === 'beads') return type === 'colour' || type === 'gone';
    if (type === 'turn') return !!(K.h || K.r); if (type === 'count') return !!K.n; return true; }

  // ---------- a whole scene ----------
  // makeScene(seed, level, theme, {force: type, n}) → {seed, level, theme, A: [items], B: [items], diffs: [...], deco: [...]}
  function makeScene(seed, level, theme, opt) {
    opt = opt || {};
    var L = LEVELS[level] || LEVELS[0], T = THEMES[theme] ? theme : THEME_KEYS[seed % 6], TH = THEMES[T];
    for (var attempt = 0; attempt < 40; attempt++) {
      var R = rng(seed + attempt * 7919);
      var sc = { seed: seed, level: level, theme: T, W: W, H: H, ground: GROUND, kinds: TH.kinds.slice(), deco: [], A: [], B: [], diffs: [] };
      // 🌿 deco (background, the same in both pictures): emoji at the edges, never poked
      var nd = 3 + Math.floor(R() * 2);
      for (var i = 0; i < nd; i++) {
        var side = i % 2 === 0, dx = side ? 16 + R() * 40 : W - 16 - R() * 40, dy = 30 + R() * (H - 60);
        sc.deco.push({ ch: pick(R, TH.deco), x: dx, y: dy, r: 15, sz: 22 + R() * 8 });
      }
      // 🧸 decoys (💀 Hardcore): fewer kinds + fewer colours, so look-alike things sit side by side
      var kinds = L.decoys ? shuffle(R, sc.kinds).slice(0, 4) : sc.kinds, cols = L.decoys ? shuffle(R, PAL).slice(0, 4) : null, used = {};
      // the difference types this picture will show (each type once before any repeats)
      var types = [], pool = opt.force ? [opt.force] : L.types;
      var n = opt.n || L.n;
      while (types.length < n) types = types.concat(shuffle(R, pool));
      types = types.slice(0, n);
      // the items: the first n are the ones that will change → each gets a kind that can show its type
      var count = Math.max(L.items, n + 3);
      for (var j = 0; j < count; j++) {
        var ty = types[j];
        var kk = kinds.filter(function (k) { return !ty || fits(ty, k); });
        if (!kk.length) kk = sc.kinds.filter(function (k) { return fits(ty, k); });
        if (!kk.length) kk = Object.keys(KINDS).filter(function (k) { return fits(ty, k); });
        var k = pick(R, kk), r = L.r * (0.88 + R() * 0.24);
        if (KINDS[k].n) r = Math.max(r, 27);
        if (k === 'sign' || k === 'beads') r = Math.max(r, 31);   // words, sums and beads big enough to read on a phone   // things you can count (spots, petals, pips, windows) are big enough to count on a phone
        var p = freeSpot(R, sc.A, sc.deco, r * KINDS[k].s);
        if (!p) continue;
        var c = cols ? pick(R, cols) : colourFor(R, used);
        used[c] = (used[c] || 0) + 1;
        var it = { id: 'i' + j, k: k, x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10, r: Math.round(r * 10) / 10, c: c, rot: 0, fl: R() < 0.5 ? 1 : -1, n: countOf(R, k) };
        if (KINDS[k].r && R() < 0.3) it.rot = 90;
        if (k === 'sign') { it.fl = 1; if (ty === 'word') { var ws = pick(R, WORD_SETS); it.txt = pick(R, ws); it.tt = 'word'; } else { it.eq = makeSum(R, level); it.txt = sumText(it.eq); it.tt = 'eq'; } }
        if (k === 'beads') { it.fl = 1; it.pat = makePattern(R, level, 6).seq; }
        sc.A.push(it);
      }
      // apply the differences (to copies in B) — spaced so poke circles never overlap
      sc.B = sc.A.map(clone);
      var cand = sc.A.slice(0, n).concat(shuffle(R, sc.A.slice(n))), di = 0;
      for (var q = 0; q < cand.length && sc.diffs.length < n; q++) {
        var a = cand[q], type = types[di] || pick(R, pool);
        var tryTypes = [type].concat(shuffle(R, pool));
        for (var z = 0; z < tryTypes.length; z++) {
          var Bsave = sc.B.slice(), d = applyDiff(R, sc, L, tryTypes[z], a, sc.B, sc.deco);
          if (!d) { sc.B = Bsave; continue; }
          var clash = sc.diffs.some(function (o) { return dist(o, d) < hitOf(o) + hitOf(d) + 4; });
          if (clash) { sc.B = Bsave; break; }
          d.i = sc.diffs.length; sc.diffs.push(d); di++; break;
        }
      }
      if (sc.diffs.length === n && (!opt.force || sc.diffs.every(function (d) { return d.t === opt.force; }))) {
        sc.diffs.forEach(function (d) { d.x = Math.round(d.x * 10) / 10; d.y = Math.round(d.y * 10) / 10; d.r = Math.round(d.r * 10) / 10; d.hit = Math.round(hitOf(d) * 10) / 10; });
        sc.sig = signature(sc);
        return sc;
      }
    }
    return null;
  }
  // ---------- 🌀 patterns (beads in a scene + 🎯 Odd One Out rows) ----------
  var UNITS = [[0, 1], [0, 0, 1], [0, 1, 2], [0, 1, 1], [0, 0, 1, 1], [0, 1, 2, 1]];
  function makePattern(R, level, len) {
    var units = UNITS.slice(0, level >= 4 ? 6 : level >= 3 ? 4 : 2), u = pick(R, units), cols = shuffle(R, PAL).slice(0, 3), seq = [];
    for (var i = 0; i < len; i++) seq.push(cols[u[i % u.length]]);
    return { unit: u, cols: cols, seq: seq };
  }

  // ---------- 🎯 ODD ONE OUT (pk-2a): a grid of cards, all alike but one ----------
  // ODD[level]: cards on the grid · types that can show up · mag (how big the odd change is) · hints per case · glow s · lives
  var ODD = [
    { cards: 4,  types: ['colour', 'shape'], mag: 1, hints: 3, glow: 10, lives: 0, guide: true },
    { cards: 6,  types: ['colour', 'shape', 'size'], mag: 0.85, hints: 2, glow: 20, lives: 0 },
    { cards: 8,  types: ['colour', 'shape', 'size', 'turn', 'count'], mag: 0.7, hints: 2, glow: 0, lives: 0 },
    { cards: 9,  types: ['colour', 'shape', 'size', 'turn', 'count', 'equation', 'word'], mag: 0.6, hints: 1, glow: 0, lives: 0 },
    { cards: 12, types: ['colour', 'size', 'turn', 'count', 'equation', 'word', 'pattern'], mag: 0.5, hints: 1, glow: 0, lives: 0 },
    { cards: 12, types: ['colour', 'size', 'turn', 'count', 'equation', 'word', 'pattern'], mag: 0.4, hints: 0, glow: 0, lives: 3, hardcore: true }
  ];
  var ODD_ROUNDS = 6;
  // makeOdd(seed, level, theme, {force}) → {type, sub, cards: [...], odd, goal, say, sig}
  //   picture cards: {k, c, r, rot, fl, n} drawn in a 100 × 100 card · sum cards: {txt, v} · word cards: {txt} · pattern cards: {k, c}
  function makeOdd(seed, level, theme, opt) {
    opt = opt || {};
    var O = ODD[level] || ODD[0], T = THEMES[theme] ? theme : THEME_KEYS[seed % 6], TH = THEMES[T], R = rng(seed), n = O.cards;
    var type = opt.force || pick(R, O.types), out = { seed: seed, level: level, theme: T, type: type, cards: [], odd: 0 };
    var oddAt = Math.floor(R() * n);
    if (type === 'equation') {
      var tgt = level >= 4 ? 8 + Math.floor(R() * 10) : 5 + Math.floor(R() * 8), seen = {};
      var ways = [];
      for (var a = 0; a <= 20; a++) { var b = tgt - a; if (a >= 1 && b >= 1) ways.push(a + '+' + b); if (level >= 4 && a > tgt && a - tgt >= 1 && a <= 20) ways.push(a + '−' + (a - tgt)); }
      ways = shuffle(R, ways);
      var off = (R() < 0.5 ? 1 : -1) * (O.mag >= 0.6 ? 1 + Math.floor(R() * 2) : 1), bad = tgt + off, oa = Math.max(1, Math.min(bad - 1, 1 + Math.floor(R() * (bad - 1))));
      for (var i = 0; i < n; i++) out.cards.push(i === oddAt ? { txt: oa + '+' + (bad - oa), v: bad } : { txt: ways[i % ways.length], v: tgt });
      out.goal = 'Poke the one that isn\'t ' + tgt; out.say = '🧮 ' + out.cards[oddAt].txt + ' makes ' + bad + ', not ' + tgt + '!'; out.target = tgt;
    } else if (type === 'word') {
      var fams = shuffle(R, RHYMES), F = fams[0], G = fams[1], ws = shuffle(R, F.slice(0, Math.max(F.length, n)));
      var other = pick(R, G.filter(function (w) { return F.indexOf(w) < 0; }));
      for (var j = 0; j < n; j++) out.cards.push({ txt: j === oddAt ? other : ws[j % ws.length] });
      // no duplicate words when the family is big enough
      out.goal = 'Which word doesn\'t rhyme?'; out.say = '🔤 ' + other + ' doesn\'t rhyme with ' + F[0] + '!'; out.family = F[0];
    } else if (type === 'pattern') {
      var P = makePattern(R, Math.max(level, 3), n), U = P.unit.length;
      oddAt = 2 * U + Math.floor(R() * Math.max(1, n - 2 * U));
      if (oddAt >= n) oddAt = n - 1;
      var kinds = shuffle(R, SHAPES.filter(function (k) { return k !== 'triangle' && k !== 'heart' && k !== 'diamond'; })), want = P.seq[oddAt];
      var alt = P.cols.filter(function (c) { return c !== want; }).concat(PAL.filter(function (c) { return P.cols.indexOf(c) < 0 && colDist(c, want) >= 110; }));
      var symK = {}; P.cols.forEach(function (c, i) { symK[c] = kinds[i % kinds.length]; });
      for (var q = 0; q < n; q++) { var c = q === oddAt ? alt[0] : P.seq[q]; out.cards.push({ k: symK[c] || kinds[3], c: c, r: 34 }); }
      out.goal = 'Which one breaks the pattern?'; out.say = '🌀 That one breaks the pattern!'; out.unit = P.unit;
    } else {
      // pictures: one kind + colour; the odd card has one change
      var kk = TH.kinds.filter(function (k) { return fits(type, k) && k !== 'sign' && k !== 'beads'; });
      if (!kk.length) kk = Object.keys(KINDS).filter(function (k) { return fits(type, k) && k !== 'sign' && k !== 'beads'; });
      var k0 = pick(R, kk), base = { k: k0, c: pick(R, PAL), r: 28, rot: 0, fl: 1, n: countOf(R, k0) }, odd = clone(base), mag = O.mag;
      if (KINDS[k0].n && base.n === KINDS[k0].n[1]) base.n--;
      odd.n = base.n;
      if (type === 'colour') { var need = 110 + 110 * mag; odd.c = shuffle(R, PAL).filter(function (c) { return colDist(c, base.c) >= need; })[0] || pick(R, PAL.filter(function (c) { return c !== base.c; })); out.sub = 'colour'; }
      else if (type === 'shape') { odd.k = pick(R, TH.kinds.concat(SHAPES).filter(function (k) { return k !== k0 && !sameLook(k, k0) && k !== 'sign' && k !== 'beads'; })); odd.n = countOf(R, odd.k); out.sub = 'shape'; }
      else if (type === 'size') { var up = R() < 0.5; odd.r = base.r * (up ? 1 + 0.2 + 0.3 * mag : 1 / (1 + 0.2 + 0.3 * mag)); out.sub = up ? 'bigger' : 'smaller'; }
      else if (type === 'turn') { var K = KINDS[k0]; if (K.h && (!K.r || R() < 0.5)) { odd.fl = -1; out.sub = 'flip'; } else { odd.rot = pick(R, K.r); out.sub = 'turn'; } }
      else if (type === 'count') { var stp = mag >= 0.7 ? 2 : 1, nn = base.n + stp; if (nn > KINDS[k0].n[1]) nn = base.n - stp; if (nn < KINDS[k0].n[0]) nn = base.n + 1; odd.n = nn; out.sub = nn > base.n ? 'more' : 'fewer'; }
      for (var z = 0; z < n; z++) out.cards.push(z === oddAt ? odd : clone(base));
      out.goal = 'Which one is different?';
    }
    out.odd = oddAt; out.sig = (hash(JSON.stringify([T, type, out.cards])) >>> 0).toString(36);
    return out;
  }
  function oddPoints(level, r) { var p = 100 + Math.max(0, 15 - r.secs) * 8 - r.oops * 15 - r.hints * 40; return Math.max(0, Math.round(p * (1 + level * 0.25) * ((ODD[level] || {}).hardcore ? 3 : 1))); }

  // ---------- ⏱️ PHOTO HUNT ARCADE = a SPEED RUN (pk-3d, Aowu 14:35 "Basic can go on forever → a limit, no seconds added, a speed run") ----------
  // goal = pictures to the 🏁 finish · limit = time limit (s) · par = ⭐⭐⭐ time (⭐⭐ ≤ par × 1.4, ⭐ = finished) · oops = + s on YOUR clock (only from ⚡ Hard)
  // bonus = 🌋 / 💀 only (Aowu 14:44 "harder → add seconds"): each find gives ⏳ + s MORE TIME LEFT before the limit — your run time (the score) never changes
  // n changes a picture · 🔍 per run. ✅ checkpoint every 5 pictures = a split time (no bonus).
  var ARCADE = [
    { goal: 10, limit: 240, par: 120, oops: 0, n: 2, hints: 3 },
    { goal: 10, limit: 240, par: 140, oops: 0, n: 3, hints: 2 },
    { goal: 12, limit: 300, par: 190, oops: 0, n: 3, hints: 2 },
    { goal: 12, limit: 300, par: 210, oops: 3, n: 4, hints: 1 },
    { goal: 15, limit: 360, par: 280, oops: 4, n: 4, hints: 1, bonus: 3 },
    { goal: 15, limit: 360, par: 300, oops: 5, n: 5, hints: 0, bonus: 3, hardcore: true }
  ];
  var CHECK_EVERY = 5;
  // r = {found, pictures, finished, time (s, incl. oops seconds)} — a finished run scores more the faster it is
  function arcadeScore(level, r) {
    var A = ARCADE[level] || ARCADE[0], p = r.found * 100 + r.pictures * 250 + (r.finished ? 1000 + Math.max(0, A.limit - r.time) * 20 : 0);
    return Math.round(p * (1 + level * 0.25) * (A.hardcore ? 3 : 1) * (r.finished ? 1 : 0.5));
  }
  function arcadeStars(level, r) { var A = ARCADE[level] || ARCADE[0]; if (!r.finished) return 0; return r.time <= A.par ? 3 : r.time <= A.par * 1.4 ? 2 : 1; }
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

  function signature(sc) { return (hash(JSON.stringify([sc.theme, sc.A, sc.B])) >>> 0).toString(36); }

  // ---------- poking ----------
  // poke(sc, x, y, found) → the index of the closest difference not found yet within its poke circle, else -1
  function poke(sc, x, y, found, extra) {
    var best = -1, bd = 1e9;
    sc.diffs.forEach(function (d, i) {
      if (found && found[i]) return;
      var dd = Math.sqrt((d.x - x) * (d.x - x) + (d.y - y) * (d.y - y));
      if (dd <= d.hit + (extra || 0) && dd < bd) { bd = dd; best = i; }
    });
    return best;
  }
  // a poke on something already found (so the page can say "you found that one")
  function pokeFound(sc, x, y, found) {
    for (var i = 0; i < sc.diffs.length; i++) { var d = sc.diffs[i]; if (found && found[i] && Math.sqrt((d.x - x) * (d.x - x) + (d.y - y) * (d.y - y)) <= d.hit) return i; }
    return -1;
  }

  // ---------- points ----------
  function picturePoints(level, r) {
    var L = LEVELS[level] || LEVELS[0], par = 30 + L.n * 8;
    var p = r.found * 100 + Math.max(0, par - r.secs) * 4 - r.oops * 15 - r.hints * 40;
    return Math.max(0, Math.round(p * (1 + level * 0.25) * (L.hardcore ? 3 : 1)));
  }

  // ================= 📖 R3 (pk-3a): DETECTIVE ADVENTURE — case books =================
  // A case = 3 chapters · each chapter = 2 steps from the 4 verbs 🔍 find · 📜 read (quiz / accuse) · 🚶 walk · 🔐 crack (+ 🖼️ spot = a camera before / after)
  // makeCase(seed, level, id) shuffles EVERYTHING each run: who did it, boot colours, dropped things, the pictures, the map, the code, the quiz cards.
  // STORY[level]: find = footprints to find · clutter = other things in the picture · fr = footprint size · look = look-alike footprints (other colours)
  // grid = walk map cols × rows · walls = share of blocked tiles · key = 🔑 first · slack = extra steps allowed (0 = no limit) · trail = share of the 👣 path shown
  // digits = 🔐 code length · clues = what each digit is hidden in · suspects · twins = two suspects share ONE clue each (you need BOTH clues) · spot = camera changes · read = quiz cards · hints = 🔍 per step
  var STORY = [
    { find: 3, clutter: 9,  fr: 26, look: 0, grid: [5, 4], walls: 0.14, key: false, slack: 0, trail: 1,   digits: 2, clues: ['count'],                    suspects: 3, twins: false, spot: 2, read: 3, hints: 3, glow: 10, guide: true },
    { find: 4, clutter: 12, fr: 24, look: 0, grid: [6, 4], walls: 0.18, key: true,  slack: 0, trail: 0.5, digits: 3, clues: ['count', 'sum'],             suspects: 3, twins: true,  spot: 3, read: 3, hints: 2, glow: 20 },
    { find: 4, clutter: 15, fr: 22, look: 3, grid: [6, 5], walls: 0.2,  key: true,  slack: 8, trail: 0,   digits: 3, clues: ['sum', 'minus'],             suspects: 4, twins: true,  spot: 3, read: 4, hints: 2, glow: 0 },
    { find: 5, clutter: 18, fr: 21, look: 4, grid: [7, 5], walls: 0.22, key: true,  slack: 5, trail: 0,   digits: 4, clues: ['sum', 'minus', 'count'],    suspects: 4, twins: true,  spot: 4, read: 4, hints: 1, glow: 0, nope: true },
    { find: 5, clutter: 21, fr: 20, look: 5, grid: [8, 5], walls: 0.24, key: true,  slack: 3, trail: 0,   digits: 4, clues: ['minus', 'pattern', 'sum'],  suspects: 5, twins: true,  spot: 5, read: 4, hints: 1, glow: 0, nope: true },
    { find: 6, clutter: 24, fr: 19, look: 6, grid: [8, 6], walls: 0.26, key: true,  slack: 2, trail: 0,   digits: 4, clues: ['pattern', 'cipher', 'minus'], suspects: 5, twins: true, spot: 5, read: 4, hints: 0, glow: 0, nope: true, hardcore: true }
  ];
  var BOOTS = [['#E63946', 'red'], ['#3A6FE8', 'blue'], ['#22B573', 'green'], ['#FFD23F', 'yellow'], ['#8E5BE8', 'purple'], ['#FF8C1A', 'orange']];
  var VERBS = { find: { icon: '🔍', name: 'Find' }, quiz: { icon: '📜', name: 'Read' }, walk: { icon: '🚶', name: 'Walk' }, spot: { icon: '🖼️', name: 'Spot' }, crack: { icon: '🔐', name: 'Crack' }, accuse: { icon: '👉', name: 'Accuse' } };
  var CASES = [
    { id: 'magnet', n: 1, icon: '🧲', name: 'The Missing Magnet', theme: 'robot', topic: 'Magnets', place: 'the Robot Lab', owner: 'Professor Volt', thing: 'super magnet', walkTo: 'storeroom', dropAt: 'by the shelf',
      open: '🧲 Professor Volt\'s super magnet is GONE from the Robot Lab! Someone sneaked in last night…',
      suspects: [['🤖', 'Bolt the Robot'], ['🐱', 'Whiskers the Cat'], ['🧑‍🔬', 'Dr. Nutty'], ['🦜', 'Pip the Parrot'], ['🧒', 'Tinker the Helper']],
      drops: [['🍪', 'cookie crumbs'], ['🐟', 'a fish bone'], ['🍌', 'a banana peel'], ['🪶', 'a green feather'], ['🧦', 'a stripy sock'], ['🍬', 'a sweet wrapper']],
      clutter: ['gear', 'dice', 'hexagon', 'crystal', 'square', 'rocket', 'clip', 'nail'],
      count: '⚙️',
      chapters: [
        { title: 'The empty table', icon: '🧪', say: 'The magnet\'s table is empty — but the floor is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'The trail', icon: '👣', say: 'The footprints lead out of the lab. Follow them to the storeroom — then check the camera!', steps: ['walk', 'spot'] },
        { title: 'The locked box', icon: '🔐', say: 'A locked box in the storeroom… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🧲', title: 'Magnets pull iron', text: 'A magnet pulls things made of iron or steel — paper clips, nails, pins. Wood, plastic, glass and paper? Nothing happens!' },
        { icon: '🧭', title: 'Two poles: N and S', text: 'Every magnet has a North end and a South end. N + S pull together — N + N (or S + S) push apart!' },
        { icon: '🌍', title: 'The Earth is a magnet', text: 'The whole Earth is a giant magnet. That\'s why a compass needle always points North!' }
      ],
      quiz: { ask: 'The thief\'s magnet pulled something along the floor. Which one can a magnet pull?', nope: 'Which one will a magnet NOT pull?',
        yes: [['📎', 'paper clip'], ['🔩', 'steel bolt'], ['🧷', 'safety pin'], ['⛓️', 'iron chain'], ['🪛', 'screwdriver'], ['🪝', 'steel hook']],
        no: [['🦆', 'rubber duck'], ['🧸', 'teddy bear'], ['✏️', 'pencil'], ['🍎', 'apple'], ['📄', 'paper'], ['🎈', 'balloon'], ['🪵', 'wood block'], ['🥤', 'plastic cup']],
        trick: [['💍', 'gold ring'], ['🍪', 'cookie']], why: { yes: 'has iron in it — a magnet pulls it!', no: 'has no iron in it — a magnet can\'t pull it.' } },
      solved: 'The super magnet is back on its table — and it pulls every paper clip in the lab! 📎📎📎' },
    // 🦖 pk-3b
    { id: 'dino', n: 2, icon: '🦖', name: 'The Dino Egg Thief', theme: 'dino', topic: 'Fossils', place: 'the Dino Museum', owner: 'Ranger Rocky', thing: 'golden dino egg', walkTo: 'dig tent', dropAt: 'by the bones',
      open: '🦖 The golden dino egg is GONE from the Dino Museum! Ranger Rocky found muddy prints everywhere…',
      suspects: [['🦕', 'Dotty the Dino'], ['🐒', 'Mango the Monkey'], ['🧑‍🌾', 'Farmer Fern'], ['🦉', 'Hoot the Owl'], ['🐢', 'Shelly the Turtle']],
      drops: [['🍃', 'a big leaf'], ['🍌', 'a banana peel'], ['🌰', 'an acorn'], ['🪶', 'a brown feather'], ['🥕', 'a carrot top'], ['🍓', 'a strawberry']],
      clutter: ['bone', 'leaf', 'tree', 'mushroom', 'crystal', 'triangle', 'snail', 'flower'],
      count: '🥚',
      chapters: [
        { title: 'The empty nest', icon: '🪺', say: 'The golden egg\'s nest is empty — and the mud is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Into the jungle', icon: '🌴', say: 'The prints run into the jungle. Follow them to the dig tent — then check the dig camera!', steps: ['walk', 'spot'] },
        { title: 'The locked crate', icon: '🔐', say: 'A locked crate in the dig tent… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🦴', title: 'What is a fossil?', text: 'A fossil is a bone, shell or footprint from long, long ago that slowly turned into stone.' },
        { icon: '🪨', title: 'Layers of rock', text: 'Rock is made in layers, like a cake. The deeper the layer, the older the fossils inside it!' },
        { icon: '🦖', title: 'Dinosaurs were real', text: 'Dinosaurs lived millions of years ago. We know them from their fossils — bones, teeth, eggs and footprints!' }
      ],
      quiz: { ask: 'Ranger Rocky shows you some finds. Which one is a real fossil?', nope: 'Which one is NOT a fossil?',
        yes: [['🦴', 'dinosaur bone'], ['🦷', 'old dino tooth'], ['🐚', 'stone shell'], ['🌿', 'leaf print in rock'], ['🐾', 'footprint in stone'], ['🥚', 'stone egg']],
        no: [['🧸', 'teddy bear'], ['🍌', 'banana'], ['⚽', 'football'], ['🧦', 'sock'], ['🚗', 'toy car'], ['📱', 'phone'], ['🍕', 'pizza'], ['🎈', 'balloon']],
        trick: [['🪨', 'plain rock'], ['🦕', 'toy dinosaur']], why: { yes: 'is part of a living thing from long ago, turned to stone — a fossil!', no: 'was never a living thing from long ago — not a fossil.' } },
      solved: 'The golden egg is back in its nest — and it just started to wiggle! 🥚✨' },
    // 🐙 pk-3b
    { id: 'ship', n: 3, icon: '🐙', name: 'Secret of the Sunken Ship', theme: 'sea', topic: 'Floating + sinking', place: 'the Sunken Ship', owner: 'Captain Coral', thing: 'treasure map', walkTo: 'shipwreck', dropAt: 'by the treasure chest',
      open: '🐙 Captain Coral\'s treasure map has vanished from the Sunken Ship! Someone swam in at high tide…',
      suspects: [['🐙', 'Inky the Octopus'], ['🦀', 'Pinchy the Crab'], ['🐬', 'Splash the Dolphin'], ['🧜', 'Marina the Mermaid'], ['🐧', 'Waddles the Penguin']],
      drops: [['🐟', 'a fish bone'], ['🫧', 'a trail of bubbles'], ['🪸', 'a bit of coral'], ['🦐', 'a shrimp shell'], ['🌊', 'sea foam'], ['🧽', 'a sponge']],
      clutter: ['coin', 'shell', 'fish', 'star', 'boat', 'crystal', 'hexagon', 'snail'],
      count: '🐚',
      chapters: [
        { title: 'The empty chest', icon: '🧰', say: 'The map\'s treasure chest is empty — and the wet sand is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Down to the wreck', icon: '🚢', say: 'The prints lead down to the old shipwreck. Swim the way there — then check the reef camera!', steps: ['walk', 'spot'] },
        { title: 'The locked trunk', icon: '🔐', say: 'A locked trunk on the shipwreck… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🛟', title: 'Why things float', text: 'Light, airy things float. Heavy, solid things sink. Water pushes up on everything — that push is called buoyancy!' },
        { icon: '🚢', title: 'How ships float', text: 'A steel ship is heavy, but its shape is full of air — so the water can push it up. Shape matters!' },
        { icon: '🌊', title: 'Salty water', text: 'Salty sea water pushes up harder than fresh water — that is why it is easier to float in the sea!' }
      ],
      quiz: { ask: 'Captain Coral drops things into the water. Which one will float?', nope: 'Which one will NOT float — it sinks?',
        yes: [['🪵', 'wood log'], ['🦆', 'rubber duck'], ['🥥', 'coconut'], ['🏐', 'beach ball'], ['🧊', 'ice cube'], ['🍎', 'apple']],
        no: [['🪨', 'rock'], ['⚓', 'anchor'], ['🔑', 'key'], ['🔩', 'steel bolt'], ['💍', 'ring'], ['🪙', 'coin'], ['🧱', 'brick'], ['🥄', 'metal spoon']],
        trick: [['🥚', 'fresh egg'], ['🧲', 'magnet']], why: { yes: 'is light and full of air — it floats!', no: 'is heavy and solid — it sinks.' } },
      solved: 'The treasure map is back in Captain Coral\'s chest — X marks the spot! 🗺️' },
    // 🪩 pk-4b
    { id: 'disco', n: 4, icon: '🪩', name: 'The Stolen Disco Ball', theme: 'disco', topic: 'Light + colour', place: 'the Disco Hall', owner: 'DJ Sparkle', thing: 'disco ball', walkTo: 'light booth', dropAt: 'by the speakers',
      open: '🪩 The giant disco ball is GONE from the Disco Hall! DJ Sparkle found glittery footprints all over the dance floor…',
      suspects: [['🦩', 'Flick the Flamingo'], ['🐈', 'Neon the Cat'], ['🤖', 'Beep-Bop the Robot'], ['🦜', 'Rio the Parrot'], ['🐼', 'Bamboo the Panda']],
      drops: [['✨', 'some glitter'], ['🎧', 'a headphone pad'], ['🍭', 'a lollipop'], ['🎀', 'a ribbon'], ['🕶️', 'sunglasses'], ['🧃', 'a juice box']],
      clutter: ['star', 'diamond', 'balloon', 'heart', 'circle', 'crystal', 'hexagon', 'dice'],
      count: '💡',
      chapters: [
        { title: 'The empty stage', icon: '🎤', say: 'The disco ball is gone from the stage — and the dance floor is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Behind the lights', icon: '💡', say: 'The prints lead past the speakers. Find the way to the light booth — then check the stage camera!', steps: ['walk', 'spot'] },
        { title: 'The locked case', icon: '🔐', say: 'A locked case in the light booth… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🌈', title: 'White light is a rainbow', text: 'White light is really ALL the colours mixed. A raindrop or a prism splits it into a rainbow!' },
        { icon: '🪞', title: 'Mirrors bounce light', text: 'Light goes in straight lines. A mirror bounces it back — a disco ball is hundreds of tiny mirrors!' },
        { icon: '🎨', title: 'Mixing light', text: 'Red, green and blue light mix to make white. A TV screen makes every colour from just those three!' }
      ],
      quiz: { ask: 'DJ Sparkle turns off all the lights. Which one makes its OWN light?', nope: 'Which one does NOT make its own light?',
        yes: [['☀️', 'the Sun'], ['💡', 'light bulb'], ['🔦', 'torch'], ['🕯️', 'candle'], ['🔥', 'campfire'], ['⚡', 'lightning']],
        no: [['🧸', 'teddy bear'], ['🍎', 'apple'], ['📚', 'book'], ['⚽', 'football'], ['🥄', 'spoon'], ['🧦', 'sock'], ['🪨', 'rock'], ['🧢', 'cap']],
        trick: [['🌙', 'the Moon'], ['🪞', 'mirror']], why: { yes: 'makes its own light!', no: 'makes no light — we only see it when light bounces off it.' } },
      solved: 'The disco ball is spinning again — the whole hall sparkles! 🪩✨' },
    // 🪐 pk-4b
    { id: 'moon', n: 5, icon: '🪐', name: 'Moon Base Mystery', theme: 'space', topic: 'Gravity', place: 'Moon Base One', owner: 'Commander Luna', thing: 'shiny moon rock', walkTo: 'rocket dock', dropAt: 'by the airlock',
      open: '🪐 The shiny moon rock is missing from Moon Base One! Commander Luna found bouncy boot prints in the moon dust…',
      suspects: [['👽', 'Zib the Alien'], ['🐶', 'Laika the Space Dog'], ['🤖', 'Rover the Robot'], ['🧑‍🚀', 'Cadet Comet'], ['🐒', 'Astro the Monkey']],
      drops: [['🧃', 'a space juice pouch'], ['🔩', 'a loose bolt'], ['🍦', 'freeze-dried ice cream'], ['🧤', 'a space glove'], ['📡', 'a tiny antenna'], ['⭐', 'a star sticker']],
      clutter: ['planet', 'rocket', 'star', 'crystal', 'circle', 'gear', 'diamond', 'hexagon'],
      count: '🌑',
      chapters: [
        { title: 'The empty glass case', icon: '🗄️', say: 'The moon rock\'s glass case is empty — and the moon dust is full of boot prints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Across the craters', icon: '🌑', say: 'The prints bounce away across the craters. Find the way to the rocket dock — then check the base camera!', steps: ['walk', 'spot'] },
        { title: 'The locked locker', icon: '🔐', say: 'A locked locker at the rocket dock… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🍎', title: 'What is gravity?', text: 'Gravity is a pull. The Earth pulls everything down to the ground — that is why a dropped apple falls.' },
        { icon: '🪶', title: 'Feather and hammer', text: 'On the Moon there is no air. An astronaut dropped a hammer and a feather — they landed at the same time!' },
        { icon: '🌙', title: 'Big jumps on the Moon', text: 'The Moon pulls 6 times weaker than the Earth. You could jump 6 times higher there!' }
      ],
      quiz: { ask: 'Here on Earth, Commander Luna lets go of some things. Which one falls down FAST?', nope: 'Which one does NOT fall fast — the air slows it down?',
        yes: [['🪨', 'rock'], ['🍎', 'apple'], ['⚽', 'football'], ['🔑', 'key'], ['📚', 'book'], ['👟', 'shoe']],
        no: [['🪶', 'feather'], ['🍃', 'leaf'], ['🎈', 'balloon'], ['🫧', 'bubble'], ['❄️', 'snowflake'], ['☁️', 'cloud'], ['🧻', 'tissue'], ['🌬️', 'puff of wind']],
        trick: [['🪂', 'parachute'], ['🍂', 'big dry leaf']], why: { yes: 'is heavy and small — gravity pulls it down fast!', no: 'is light and catches the air — the air slows it down.' } },
      solved: 'The moon rock is back in its glass case — Commander Luna does a giant moon jump! 🌙🦘' },
    // ☁️ pk-4c
    { id: 'cloud', n: 6, icon: '☁️', name: 'The Cloud Castle Code', theme: 'sky', topic: 'Codes + patterns', place: 'the Cloud Castle', owner: 'Queen Nimbus', thing: 'rainbow crown', walkTo: 'tower top', dropAt: 'by the rainbow bridge',
      open: '☁️ Queen Nimbus\'s rainbow crown has vanished from the Cloud Castle! The thief left a secret code — and footprints in the fluffy clouds…',
      suspects: [['🦄', 'Sparkle the Unicorn'], ['🕊️', 'Pip the Dove'], ['🐉', 'Puff the Dragon'], ['🧚', 'Twinkle the Fairy'], ['🦅', 'Swoop the Eagle']],
      drops: [['🪶', 'a white feather'], ['🎀', 'a rainbow ribbon'], ['⭐', 'a star clip'], ['🍬', 'a sweet'], ['🎐', 'a wind chime'], ['🧁', 'a cupcake crumb']],
      clutter: ['cloud', 'bird', 'balloon', 'star', 'heart', 'diamond', 'hexagon', 'circle'],
      count: '🌈',
      chapters: [
        { title: 'The empty cushion', icon: '👑', say: 'The crown\'s cushion is empty — and the clouds are full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Up the rainbow', icon: '🌈', say: 'The prints climb the rainbow bridge. Find the way to the tower top — then check the castle camera!', steps: ['walk', 'spot'] },
        { title: 'The code door', icon: '🔐', say: 'A door with a secret code at the tower top… crack it, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🔁', title: 'Patterns repeat', text: 'A pattern is something that repeats: red, blue, red, blue… If you know the rule, you can guess what comes next!' },
        { icon: '🔐', title: 'Secret codes', text: 'A code swaps letters for numbers or pictures: A = 1, B = 2, C = 3… Spies and computers use codes to keep messages safe.' },
        { icon: '🐝', title: 'Patterns in nature', text: 'Bees build honeycomb from the same 6-sided shape again and again — and every snowflake has 6 arms!' }
      ],
      quiz: { ask: 'Queen Nimbus shows you some things. Which one has a pattern that REPEATS?', nope: 'Which one has NO repeating pattern?',
        yes: [['🦓', 'zebra stripes'], ['🐝', 'honeycomb'], ['❄️', 'snowflake'], ['🕸️', 'spider web'], ['🍍', 'pineapple'], ['🐯', 'tiger stripes']],
        no: [['🪨', 'pebble'], ['💧', 'water drop'], ['☁️', 'cloud'], ['🥔', 'potato'], ['🍞', 'bread'], ['🥚', 'egg'], ['🧈', 'butter'], ['🍦', 'ice cream']],
        trick: [['🧶', 'tangled wool'], ['🎨', 'paint splash']], why: { yes: 'has a pattern that repeats again and again!', no: 'has no repeating pattern — it is all mixed up.' } },
      solved: 'The rainbow crown is back on Queen Nimbus — and a rainbow shines over the castle! 👑🌈' },
    // 🌱 pk-4c
    { id: 'garden', n: 7, icon: '🌱', name: 'The Wilting Garden', theme: 'garden', topic: 'What plants need', place: 'the Greenhouse', owner: 'Grandma Bloom', thing: 'golden watering can', walkTo: 'tool shed', dropAt: 'by the tomato plants',
      open: '🌱 Grandma Bloom\'s golden watering can is gone — and her plants are drooping! Muddy footprints lead out of the Greenhouse…',
      suspects: [['🐌', 'Slowy the Snail'], ['🐰', 'Bun the Rabbit'], ['🐛', 'Wiggles the Caterpillar'], ['🐦', 'Chirp the Sparrow'], ['🦔', 'Spike the Hedgehog']],
      drops: [['🥕', 'a nibbled carrot'], ['🌰', 'a seed'], ['🍓', 'a strawberry'], ['🥬', 'a lettuce leaf'], ['🍄', 'a mushroom'], ['🌼', 'a petal']],
      clutter: ['flower', 'leaf', 'tree', 'mushroom', 'ladybug', 'snail', 'circle', 'heart'],
      count: '🌷',
      chapters: [
        { title: 'The dry pots', icon: '🪴', say: 'The watering can is gone and the pots are dry — the soil is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Through the veggie patch', icon: '🥕', say: 'The prints go through the veggie patch. Find the way to the tool shed — then check the garden camera!', steps: ['walk', 'spot'] },
        { title: 'The locked shed', icon: '🔐', say: 'The tool shed is locked… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '💧', title: 'Plants need water', text: 'Roots drink water from the soil and carry it all the way up to the leaves.' },
        { icon: '☀️', title: 'Food from light', text: 'Leaves use sunlight, air and water to make the plant\'s own food. That is why plants grow toward the light!' },
        { icon: '🪱', title: 'Good soil', text: 'Soil gives plants food and something to hold on to. Worms help by mixing it and making it soft.' }
      ],
      quiz: { ask: 'Grandma Bloom asks: which one does a plant NEED to grow?', nope: 'Which one does a plant NOT need to grow?',
        yes: [['💧', 'water'], ['☀️', 'sunlight'], ['🌬️', 'air'], ['🪱', 'good soil'], ['🌡️', 'warmth']],
        no: [['🍬', 'sweets'], ['🧃', 'juice'], ['🎮', 'video games'], ['🧸', 'teddy bear'], ['📺', 'TV'], ['🍕', 'pizza'], ['🎵', 'loud music'], ['👟', 'shoes']],
        trick: [['🥤', 'fizzy drink'], ['🧂', 'salt']], why: { yes: 'is something every plant needs to grow!', no: 'is not what a plant needs — water, light, air and soil are!' } },
      solved: 'The golden watering can is back — Grandma Bloom\'s flowers stand up tall again! 🌷💧' },
    // ⏰ pk-4c
    { id: 'clock', n: 8, icon: '⏰', name: 'The Clock That Ran Backwards', theme: 'clock', topic: 'Time + gears', place: 'the Clock Tower', owner: 'Mr Tick-Tock', thing: 'golden winding key', walkTo: 'gear room', dropAt: 'by the big bell',
      open: '⏰ The Clock Tower is ticking BACKWARDS! Someone took Mr Tick-Tock\'s golden winding key — dusty footprints climb the stairs…',
      suspects: [['🦉', 'Hoot the Owl'], ['🐭', 'Squeak the Mouse'], ['🦇', 'Flap the Bat'], ['🐿️', 'Nutty the Squirrel'], ['🧙', 'Wizard Whiz']],
      drops: [['🔩', 'a tiny screw'], ['⚙️', 'a little gear'], ['🧀', 'a cheese crumb'], ['🪶', 'a black feather'], ['🌰', 'an acorn'], ['🕯️', 'a candle stub']],
      clutter: ['gear', 'circle', 'star', 'house', 'diamond', 'hexagon', 'square', 'bird'],
      count: '🔔',
      chapters: [
        { title: 'The empty hook', icon: '🗝️', say: 'The golden key\'s hook is empty — and the dusty floor is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Up the stairs', icon: '🪜', say: 'The prints climb the winding stairs. Find the way to the gear room — then check the tower camera!', steps: ['walk', 'spot'] },
        { title: 'The locked clock case', icon: '🔐', say: 'The clock case is locked… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '⚙️', title: 'Gears turn each other', text: 'When one gear turns, the gear touching it turns the OTHER way. A clock uses lots of gears!' },
        { icon: '🕐', title: 'Hours and minutes', text: 'The short hand shows the hour, the long hand shows the minutes. One hour is 60 minutes.' },
        { icon: '🌍', title: 'The Earth is a clock', text: 'One spin of the Earth is one day. One trip all the way around the Sun is one year!' }
      ],
      quiz: { ask: 'Mr Tick-Tock asks: which one helps us tell the TIME?', nope: 'Which one does NOT tell the time?',
        yes: [['⏰', 'alarm clock'], ['⌚', 'watch'], ['⏳', 'sand timer'], ['🕰️', 'old clock'], ['📅', 'calendar'], ['⏱️', 'stopwatch']],
        no: [['🥄', 'spoon'], ['🧸', 'teddy bear'], ['🍎', 'apple'], ['👟', 'shoe'], ['🎈', 'balloon'], ['📚', 'book'], ['🧦', 'sock'], ['🪨', 'rock']],
        trick: [['🧭', 'compass'], ['🌡️', 'thermometer']], why: { yes: 'helps us tell the time!', no: 'does not tell the time.' } },
      solved: 'The golden key is back — tick, tock, the Clock Tower runs forwards again! ⏰✨' }
  ];
  function caseById(id) { for (var i = 0; i < CASES.length; i++) if (CASES[i].id === id) return CASES[i]; return CASES[0]; }
  // 🔐 one code digit + where it hides
  function makeDigit(R, kind, icon) {
    var a, q;
    if (kind === 'count') { a = 1 + Math.floor(R() * 6); q = new Array(a + 1).join(icon); }
    else if (kind === 'sum') { var x = 1 + Math.floor(R() * 5), y = 1 + Math.floor(R() * Math.max(1, 9 - x)); y = Math.min(y, 9 - x); a = x + y; q = x + ' + ' + y; }
    else if (kind === 'minus') { a = 1 + Math.floor(R() * 8); var b = 1 + Math.floor(R() * (9 - a + 1)); b = Math.min(b, 9 - a + 9); var t = a + b; if (t > 12) { b = 12 - a; t = 12; } if (b < 1) { b = 1; t = a + 1; } q = t + ' − ' + b; }
    else if (kind === 'pattern') { var st = 1 + Math.floor(R() * 2); a = 3 + Math.floor(R() * (9 - 3 * st - 2)) + 3 * st; if (a > 9) a = 9; q = (a - 3 * st) + ', ' + (a - 2 * st) + ', ' + (a - st) + ', ?'; }
    else { a = 1 + Math.floor(R() * 9); q = String.fromCharCode(64 + a) + ' = ?'; kind = 'cipher'; }
    return { kind: kind, q: q, a: a };
  }
  // 🚶 the walk map: walls never cut the way (breadth-first check), 🔑 first from Junior
  function bfs(cols, rows, wall, a, b) {
    var D = {}, Q = [a], k = function (p) { return p[0] + ',' + p[1]; }; D[k(a)] = 0;
    while (Q.length) { var p = Q.shift(); if (p[0] === b[0] && p[1] === b[1]) return D[k(p)];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var q = [p[0] + d[0], p[1] + d[1]]; if (q[0] < 0 || q[1] < 0 || q[0] >= cols || q[1] >= rows || wall[q[1]][q[0]] || D[k(q)] != null) return; D[k(q)] = D[k(p)] + 1; Q.push(q); }); }
    return -1;
  }
  function pathOf(cols, rows, wall, a, b) {   // one shortest path (list of tiles, a → b)
    var prev = {}, Q = [a], k = function (p) { return p[0] + ',' + p[1]; }; prev[k(a)] = null;
    while (Q.length) { var p = Q.shift(); if (p[0] === b[0] && p[1] === b[1]) break;
      [[1, 0], [0, 1], [0, -1], [-1, 0]].forEach(function (d) { var q = [p[0] + d[0], p[1] + d[1]]; if (q[0] < 0 || q[1] < 0 || q[0] >= cols || q[1] >= rows || wall[q[1]][q[0]] || prev[k(q)] !== undefined) return; prev[k(q)] = p; Q.push(q); }); }
    if (prev[k(b)] === undefined) return [];
    var out = [], c = b; while (c) { out.unshift(c); c = prev[k(c)]; } return out;
  }
  function makeWalk(R, S) {
    var cols = S.grid[0], rows = S.grid[1];
    for (var t = 0; t < 200; t++) {
      var wall = []; for (var y = 0; y < rows; y++) { wall.push([]); for (var x = 0; x < cols; x++) wall[y].push(R() < S.walls); }
      var start = [0, Math.floor(R() * rows)], door = [cols - 1, Math.floor(R() * rows)];
      wall[start[1]][start[0]] = false; wall[door[1]][door[0]] = false;
      var key = null;
      if (S.key) { for (var u = 0; u < 60 && !key; u++) { var kx = 1 + Math.floor(R() * (cols - 2)), ky = Math.floor(R() * rows); if (!wall[ky][kx] && Math.abs(kx - door[0]) + Math.abs(ky - door[1]) > 1) key = [kx, ky]; } if (!key) continue; }
      var d1 = bfs(cols, rows, wall, start, key || door), d2 = key ? bfs(cols, rows, wall, key, door) : 0;
      if (d1 < 0 || d2 < 0) continue;
      var best = d1 + d2; if (best < cols - 1) continue;
      var path = key ? pathOf(cols, rows, wall, start, key).concat(pathOf(cols, rows, wall, key, door).slice(1)) : pathOf(cols, rows, wall, start, door);
      return { cols: cols, rows: rows, wall: wall, start: start, door: door, key: key, best: best, limit: S.slack ? best + S.slack : 0, path: path };
    }
    return null;
  }
  function storyScene(R, seed, level, C, culprit) {   // 🔍 a busy floor: the thief's footprints + clutter (+ look-alike footprints from 🔦)
    var S = STORY[level] || STORY[0], TH = THEMES[C.theme];
    for (var attempt = 0; attempt < 30; attempt++) {
      var sc = { seed: seed + attempt, level: level, theme: C.theme, W: W, H: H, ground: GROUND, kinds: [], deco: [], A: [], B: [], diffs: [], story: true }, id = 0;
      for (var i = 0; i < 3; i++) { var side = i % 2 === 0; sc.deco.push({ ch: pick(R, TH.deco), x: side ? 16 + R() * 30 : W - 16 - R() * 30, y: 30 + R() * (H - 60), r: 15, sz: 22 + R() * 6 }); }
      var ok = true;
      for (var f = 0; f < S.find && ok; f++) { var p = freeSpot(R, sc.A, sc.deco, S.fr); if (!p) { ok = false; break; }
        var it = { id: 'f' + (id++), k: 'foot', x: p.x, y: p.y, r: S.fr, c: culprit.boot[0], rot: Math.floor(R() * 8) * 45, fl: R() < 0.5 ? -1 : 1, n: 0 };
        sc.A.push(it); sc.diffs.push({ x: p.x, y: p.y, r: S.fr, hit: hitOf({ r: S.fr }), t: 'clue', sub: 'foot', id: it.id }); }
      var others = BOOTS.filter(function (b) { return b[0] !== culprit.boot[0]; });
      for (var l = 0; l < S.look && ok; l++) { var q = freeSpot(R, sc.A, sc.deco, S.fr); if (!q) { ok = false; break; }
        sc.A.push({ id: 'l' + (id++), k: 'foot', x: q.x, y: q.y, r: S.fr, c: pick(R, others)[0], rot: Math.floor(R() * 8) * 45, fl: R() < 0.5 ? -1 : 1, n: 0, look: true }); }
      for (var c = 0; c < S.clutter && ok; c++) { var k = pick(R, C.clutter), r = 18 + R() * 10, s = freeSpot(R, sc.A, sc.deco, r * (KINDS[k] ? KINDS[k].s : 1)); if (!s) continue;
        sc.A.push({ id: 'c' + (id++), k: k, x: s.x, y: s.y, r: r, c: pick(R, PAL.filter(function (x) { return x !== culprit.boot[0]; })), rot: KINDS[k] && KINDS[k].r ? pick(R, [0].concat(KINDS[k].r)) : (k === 'clip' || k === 'nail' ? Math.floor(R() * 4) * 45 : 0), fl: 1, n: KINDS[k] && KINDS[k].n ? KINDS[k].n[0] + Math.floor(R() * (KINDS[k].n[1] - KINDS[k].n[0] + 1)) : 0 }); }
      if (!ok || sc.diffs.length < S.find) continue;
      sc.B = sc.A;
      return sc;
    }
    return null;
  }
  function makeCase(seed, level, id) {
    var S = STORY[level] || STORY[0], C = caseById(id), R = rng(seed ^ 0x2545F491);
    var sus = shuffle(R, C.suspects).slice(0, S.suspects), boots = shuffle(R, BOOTS), drops = shuffle(R, C.drops);
    var people = sus.map(function (s, i) { return { icon: s[0], name: s[1], boot: boots[i], drop: drops[i] }; });
    var culprit = 0;
    if (S.twins && people.length >= 3) { people[1].boot = people[0].boot; people[2].drop = people[0].drop; }   // a twin for each clue: only the thief has BOTH
    people = shuffle(R, people); culprit = people.indexOf(people.filter(function (p) { return p.boot === people[0].boot; })[0]);
    // the thief = the first person whose boot + drop pair is unique… pick the one with both clues shared by nobody else
    var thief = null;
    for (var a = 0; a < people.length && !thief; a++) { var P = people[a], sameBoot = people.filter(function (x) { return x.boot === P.boot; }).length, sameDrop = people.filter(function (x) { return x.drop === P.drop; }).length;
      if (S.twins ? (sameBoot > 1 && sameDrop > 1) : true) thief = P; }
    if (!thief) thief = people[0];
    culprit = people.indexOf(thief);
    var walk = makeWalk(R, S);
    // 📜 the quiz cards
    var Q = C.quiz, nope = !!S.nope, right = nope ? pick(R, Q.no.concat(level >= 4 ? Q.trick : [])) : pick(R, Q.yes);
    var wrongs = shuffle(R, nope ? Q.yes : Q.no.concat(level >= 4 ? Q.trick : [])).slice(0, S.read - 1);
    var opts = shuffle(R, [{ icon: right[0], name: right[1], ok: true }].concat(wrongs.map(function (w) { return { icon: w[0], name: w[1], ok: false }; })));
    var digits = []; for (var d = 0; d < S.digits; d++) digits.push(makeDigit(R, S.clues[d % S.clues.length], C.count));
    var find = storyScene(R, seed, level, C, thief);
    var steps = []; C.chapters.forEach(function (ch, ci) { ch.steps.forEach(function (v, si) { steps.push({ ch: ci, verb: v, first: si === 0, last: si === ch.steps.length - 1 }); }); });
    return { id: C.id, C: C, seed: seed, level: level, S: S, people: people, culprit: culprit, thief: thief, find: find, walk: walk,
      quiz: { q: nope ? Q.nope : Q.ask, nope: nope, why: Q.why, opts: opts, answer: opts.map(function (o) { return o.ok; }).indexOf(true) },
      spotSeed: (seed * 31 + 7) >>> 0, crack: { digits: digits, code: digits.map(function (x) { return x.a; }).join('') }, steps: steps,
      sig: [C.id, thief.name, thief.boot[1], thief.drop[1], digits.map(function (x) { return x.a; }).join(''), find ? signature(find) : ''].join('|') };
  }
  // the clues a suspect card matches (for "explains itself" on a wrong accuse)
  function clueMatch(k, p) { return { boot: p.boot === k.thief.boot, drop: p.drop === k.thief.drop }; }
  function storyPoints(level, r) { var p = 260 - r.oops * 30 - r.hints * 50 + Math.max(0, 40 - r.secs) * 3; return Math.max(40, Math.round(p * (1 + level * 0.25) * ((STORY[level] || {}).hardcore ? 3 : 1))); }
  function caseBonus(level) { return Math.round(1000 * (1 + level * 0.25) * ((STORY[level] || {}).hardcore ? 3 : 1)); }

  // ================= 📸 FAMILY PHOTO HUNT (pk-4a, Aowu 16:32) =================
  // The family's own avatars pose at a trip place; every person = {k: 'person', who (family index), act}. Acts = our own 🎭 BLOCK pokadif photo acts
  // (pose + face mixes) + the shared 🤳 selfie. Changes: 🕺 pose (another photo act) · 😉 face (same pose, another face, ⚡+) · 🔄 turned round (🔦+, lopsided poses only)
  // · 🎨 prop colour · ➖ prop gone · ➕ extra prop. One change per person / prop, never two.
  var PHOTO_ACTS = {   // = BLOCK pokadif in AvatarActing (keep in step) — [pose, face, lopsided?]
    'pk.tada': ['arms-up', 'joy', 0], 'pk.jump-shot': ['cheer-jump', 'excited', 0], 'pk.look-there': ['point', 'amazed', 1], 'pk.strong': ['flex', 'proud', 0],
    'pk.hello-bow': ['bow', 'happy', 1], 'pk.wonder': ['think-chin', 'curious', 1], 'pk.wink-wave': ['wave', 'wink', 1], 'pk.big-hug': ['hug', 'love', 0],
    'pk.oh-well': ['shrug', 'silly', 0], 'pk.we-did-it': ['fist-pump', 'laugh', 1], 'pk.cool-pose': ['ready', 'cool', 0]
  };
  var PHOTO_FACES = ['shock', 'cool', 'love', 'star-eyes', 'silly'];   // only BOLD faces: a face swap must change ≥ 45 pixels (pixel test)
  var SELFIE = 'cheer.selfie';
  var PHOTO_TYPES = [['pose', 'colour', 'gone'], ['pose', 'colour', 'gone', 'extra'], ['pose', 'colour', 'gone', 'extra', 'flip'],
    ['pose', 'colour', 'gone', 'extra', 'flip', 'face'], ['pose', 'colour', 'gone', 'extra', 'flip', 'face'], ['pose', 'colour', 'gone', 'extra', 'flip', 'face']];
  function photoAct(pose, face) { return 'pkp.' + pose + '.' + face; }   // a face-swap act the page registers on the fly
  function actOf(p) { return p.face ? photoAct(PHOTO_ACTS[p.base] ? PHOTO_ACTS[p.base][0] : 'idle', p.face) : p.base; }
  function lopsided(p) { return p.base === SELFIE || (PHOTO_ACTS[p.base] && PHOTO_ACTS[p.base][2] === 1); }
  function makePhoto(seed, level, place, opt) {
    opt = opt || {};
    var L = LEVELS[level] || LEVELS[0], T = THEMES[place] ? place : TRIP_KEYS[seed % TRIP_KEYS.length], TH = THEMES[T];
    var acts = (opt.acts || Object.keys(PHOTO_ACTS)).filter(function (a) { return PHOTO_ACTS[a]; }), np = Math.max(2, Math.min(4, opt.people || 3));
    var n = opt.n || L.n, pool = opt.force ? [opt.force] : PHOTO_TYPES[level] || PHOTO_TYPES[0];
    for (var attempt = 0; attempt < 40; attempt++) {
      var R = rng(seed + attempt * 7919), id = 0;
      var sc = { seed: seed, level: level, theme: T, photo: true, W: W, H: H, ground: GROUND, kinds: TH.kinds.slice(), deco: [], A: [], B: [], diffs: [], people: np };
      for (var i = 0; i < 3; i++) { var side = i % 2 === 0; sc.deco.push({ ch: pick(R, TH.deco), x: side ? 16 + R() * 26 : W - 16 - R() * 26, y: 24 + R() * 70, r: 14, sz: 20 + R() * 6 }); }
      // 👨‍👩‍👧 the family in a row on the ground (one may take a 🤳 selfie)
      var pr = np <= 2 ? 60 : np === 3 ? 54 : 46, gap = (W - 40) / np, used = {}, sel = R() < 0.6 ? Math.floor(R() * np) : -1;
      for (var q = 0; q < np; q++) {
        var a = sel === q ? SELFIE : pick(R, acts.filter(function (x) { return !used[x]; }).length ? acts.filter(function (x) { return !used[x]; }) : acts); used[a] = 1;
        sc.A.push({ id: 'p' + q, k: 'person', who: q, base: a, face: null, x: 20 + gap * (q + 0.5) + (R() - 0.5) * gap * 0.14, y: H - 16 - pr * 1.08, r: pr, c: '#ffffff', rot: 0, fl: R() < 0.5 ? -1 : 1, n: 0 });
      }
      // 🎒 trip props in the free space (sky, sides, between legs never — freeSpot keeps clear of people)
      var nprops = Math.max(4, n + 3 - np + 1);
      for (var j = 0; j < nprops * 3 && sc.A.filter(function (x) { return x.k !== 'person'; }).length < nprops; j++) {
        var k = pick(R, TH.kinds), r = L.r * (0.88 + R() * 0.24) * (k === 'suitcase' || k === 'camera' || k === 'icecream' ? 1 : 0.95), sp = freeSpot(R, sc.A, sc.deco, r * (KINDS[k] ? KINDS[k].s : 1));
        if (!sp) continue;
        sc.A.push({ id: 'i' + (id++), k: k, x: sp.x, y: sp.y, r: r, c: pick(R, PAL), rot: 0, fl: 1, n: KINDS[k] && KINDS[k].n ? KINDS[k].n[0] + Math.floor(R() * (KINDS[k].n[1] - KINDS[k].n[0] + 1)) : 0 });
      }
      sc.B = sc.A.map(clone);
      // the changes
      var types = []; while (types.length < n) types = types.concat(shuffle(R, pool)); types = types.slice(0, n);
      var taken = {}, ok = true;
      for (var t = 0; t < types.length && ok; t++) {
        var ty = types[t], d = null;
        var people = sc.A.filter(function (x) { return x.k === 'person' && !taken[x.id]; }), props = sc.A.filter(function (x) { return x.k !== 'person' && !taken[x.id]; });
        if (ty === 'flip') people = people.filter(lopsided);
        if (ty === 'face') people = pr >= 54 ? people.filter(function (x) { return x.base !== SELFIE; }) : [];   // faces only on big people (≤ 3 in the photo)
        if ((ty === 'pose' || ty === 'flip' || ty === 'face') && !people.length) ty = props.length ? pick(R, ['colour', 'gone']) : 'extra';
        if ((ty === 'colour' || ty === 'gone') && !props.length) ty = 'extra';
        if (ty === 'pose' || ty === 'flip' || ty === 'face') {
          var P = pick(R, people), Bp = sc.B.filter(function (x) { return x.id === P.id; })[0]; taken[P.id] = 1;
          if (ty === 'pose') { var others = acts.filter(function (x) { return x !== P.base && PHOTO_ACTS[x][0] !== (PHOTO_ACTS[P.base] || [])[0]; }); Bp.base = pick(R, others); }
          else if (ty === 'flip') Bp.fl = -P.fl;
          else { var f0 = (PHOTO_ACTS[P.base] || [])[1]; Bp.face = pick(R, PHOTO_FACES.filter(function (f) { return f !== f0; })); }
          d = { t: ty, sub: ty, idA: P.id, idB: P.id, x: P.x, y: P.y, r: P.r };
        } else if (ty === 'colour' || ty === 'gone') {
          var Q = pick(R, props), Bq = sc.B.filter(function (x) { return x.id === Q.id; })[0]; taken[Q.id] = 1;
          if (ty === 'colour') { var cs = shuffle(R, PAL).filter(function (c) { return colDist(c, Q.c) >= 180; }); if (!cs.length) { ok = false; break; } Bq.c = cs[0]; d = { t: 'colour', sub: 'colour', idA: Q.id, idB: Q.id, x: Q.x, y: Q.y, r: radiusOf(Q) }; }
          else { var gi = sc.B.indexOf(Bq); if (R() < 0.5) { sc.B.splice(gi, 1); d = { t: 'gone', sub: 'missing', idA: Q.id, idB: null, x: Q.x, y: Q.y, r: radiusOf(Q) }; }
            else { var ai = sc.A.indexOf(Q); sc.A.splice(ai, 1); d = { t: 'gone', sub: 'extra', idA: null, idB: Q.id, x: Q.x, y: Q.y, r: radiusOf(Q) }; } }
        } else {   // ➕ a brand-new prop only in B
          var k2 = pick(R, TH.kinds), r2 = L.r, sp2 = freeSpot(R, sc.A.concat(sc.B), sc.deco, r2 * (KINDS[k2] ? KINDS[k2].s : 1)); if (!sp2) { ok = false; break; }
          var nw = { id: 'x' + (id++), k: k2, x: sp2.x, y: sp2.y, r: r2, c: pick(R, PAL), rot: 0, fl: 1, n: KINDS[k2] && KINDS[k2].n ? KINDS[k2].n[0] : 0 }; sc.B.push(nw); taken[nw.id] = 1;
          d = { t: 'extra', sub: 'extra', idA: null, idB: nw.id, x: nw.x, y: nw.y, r: radiusOf(nw) };
        }
        d.hit = hitOf(d); sc.diffs.push(d);
      }
      if (!ok || sc.diffs.length < n) continue;
      // fair: poke circles never overlap
      var clash = false; for (var u = 0; u < sc.diffs.length && !clash; u++) for (var v = u + 1; v < sc.diffs.length; v++) if (Math.hypot(sc.diffs[u].x - sc.diffs[v].x, sc.diffs[u].y - sc.diffs[v].y) < sc.diffs[u].hit + sc.diffs[v].hit - 4) { clash = true; break; }
      if (clash) continue;
      sc.A.concat(sc.B).forEach(function (x) { if (x.k === 'person') x.act = actOf(x); });
      sc.sig = signature(sc);
      return sc;
    }
    return null;
  }
  function starsFor(c) { if (!c.cleared) return 0; if (c.oops <= 1 && c.hints === 0) return 3; if (c.oops <= 4 && c.hints <= 1) return 2; return 1; }
  // 🕵️ rank from how many levels are cleared (progress.unlocked)
  var RANKS = [{ at: 0, icon: '🕵️', name: 'Rookie' }, { at: 1, icon: '🔎', name: 'Sleuth' }, { at: 3, icon: '🎖️', name: 'Inspector' }, { at: 6, icon: '👑', name: 'Master Detective' }];
  function rankOf(cleared) { var r = RANKS[0]; RANKS.forEach(function (x) { if (cleared >= x.at) r = x; }); return r; }
  function nextRank(cleared) { for (var i = 0; i < RANKS.length; i++) if (RANKS[i].at > cleared) return RANKS[i]; return null; }

  return { W: W, H: H, GROUND: GROUND, MIN_HIT: MIN_HIT, KINDS: KINDS, SHAPES: SHAPES, THEMES: THEMES, THEME_KEYS: THEME_KEYS, PAL: PAL, TYPES: TYPES, TYPE_INFO: TYPE_INFO,
    LEVELS: LEVELS, RANKS: RANKS, TYPES6: TYPES6, WORD_SETS: WORD_SETS, RHYMES: RHYMES, ODD: ODD, ODD_ROUNDS: ODD_ROUNDS, makeOdd: makeOdd, oddPoints: oddPoints, makePattern: makePattern, sumText: sumText, ARCADE: ARCADE, CHECK_EVERY: CHECK_EVERY, arcadeScore: arcadeScore, arcadeStars: arcadeStars, mmss: mmss, TRIP_KEYS: TRIP_KEYS, PHOTO_ACTS: PHOTO_ACTS, PHOTO_FACES: PHOTO_FACES, SELFIE: SELFIE, photoAct: photoAct, makePhoto: makePhoto, STORY: STORY, BOOTS: BOOTS, VERBS: VERBS, CASES: CASES, caseById: caseById, makeCase: makeCase, makeWalk: makeWalk, makeDigit: makeDigit, bfs: bfs, clueMatch: clueMatch, storyPoints: storyPoints, caseBonus: caseBonus, rng: rng, newSeed: newSeed, makeScene: makeScene, signature: signature, poke: poke, pokeFound: pokeFound, radiusOf: radiusOf, hitOf: hitOf,
    colDist: colDist, picturePoints: picturePoints, starsFor: starsFor, rankOf: rankOf, nextRank: nextRank, fits: fits };
})();
if (typeof module !== 'undefined') module.exports = PK;
// ENGINE END
