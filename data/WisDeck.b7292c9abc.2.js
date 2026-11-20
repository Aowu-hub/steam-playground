
// ENGINE START
/* WD = the rules with no screen (the harness loads this part in node). Round 1: deck maths (tiers, rarity), seeded random. Quiz / WisCount / WisJack / WisBuzz / daily join in rounds 2–4. */
const WD = (function(){
  function rng(seed){ let a = (seed >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(a, r){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // deck = {cards: {id: {n: copies won, lv: best quiz level won on}}, rack: [10 ids], side: [...]}
  function emptyDeck(){ return {cards: {}, rack: [], side: []}; }
  function owned(deck, id){ return !!(deck && deck.cards && deck.cards[id] && deck.cards[id].n > 0); }
  function dupsOf(deck, id){ const c = deck && deck.cards && deck.cards[id]; return c ? Math.max(0, (c.n || 0) - 1) : 0; }
  function addCard(deck, id, lv){ const c = deck.cards[id] || (deck.cards[id] = {n: 0, lv: 0}); c.n++; c.lv = Math.max(c.lv || 0, lv || 0); return c; }
  function catCount(deck, list){ return list.filter(c => owned(deck, c.id)).length; }

  /* ---------- 🧠 QUIZ (plan section 4 + 5 + 10) ---------- */
  // choices · timer (s, 0 = none) · cards in play (fame order) · points × · question types that join at this level
  const LEVELS = [
    {k: 'basic', icon: '🌱', name: 'Basic', choices: 3, timer: 0, items: 10, mult: 1},
    {k: 'junior', icon: '🐣', name: 'Junior', choices: 4, timer: 0, items: 20, mult: 1.5},
    {k: 'inter', icon: '🔦', name: 'Intermediate', choices: 4, timer: 20, items: 30, mult: 2},
    {k: 'hard', icon: '⚡', name: 'Hard', choices: 4, timer: 15, items: 40, mult: 3},
    {k: 'extreme', icon: '🌋', name: 'Extreme', choices: 6, timer: 10, items: 40, mult: 4, lookAlike: true},
    {k: 'hardcore', icon: '💀', name: 'Hardcore', choices: 8, timer: 10, items: 40, mult: 5, typed: true, oneLife: true}];
  const QTYPES = {
    pic: {icon: '🖼️', name: 'Picture → name'}, name: {icon: '🔤', name: 'Name → picture'}, listen: {icon: '🔊', name: 'Listen → picture'},
    tf: {icon: '✅', name: 'True or false'}, fact: {icon: '💬', name: 'Fun fact → name'}, order: {icon: '🔢', name: 'Put in order'},
    odd: {icon: '🙃', name: 'Odd one out'}, map: {icon: '🗺️', name: 'Tap the map'}, formula: {icon: '🧪', name: 'Formula → name'}, type: {icon: '⌨️', name: 'Type the name'}};
  const ROUNDS = 10;
  const GEO_CATS = {wisflag: 1, wisshape: 1, wismap: 1, wiscapital: 1};
  // 🎺 WisTune "listen": the instrument plays (a family sound + its own pitch); wrong answers come from OTHER sound families
  const TUNE = {drum: ['drum', 'long drum'], keys: ['piano'], pluck: ['guitar', 'ukulele', 'banjo', 'harp', 'khim', 'sitar'], electric: ['electric guitar'], bowed: ['violin', 'cello', 'saw duang', 'double bass'],
    brass: ['trumpet', 'trombone', 'tuba', 'french horn'], flute: ['flute', 'recorder', 'piccolo'], reed: ['clarinet', 'oboe', 'saxophone', 'harmonica', 'accordion', 'khaen', 'bagpipes'], mallet: ['xylophone', 'ranat ek', 'kalimba'],
    metal: ['cymbals', 'gong', 'ching', 'triangle', 'handbell'], shaker: ['tambourine', 'maracas'], organ: ['pipe organ'], drone: ['didgeridoo']};
  function tuneFamily(en){ const n = String(en || '').toLowerCase(); for(const f of Object.keys(TUNE)) if(TUNE[f].includes(n)) return f; return 'other:' + n; }
  // a category whose pictures repeat (drawn dinos, shared emoji) asks with the fun fact instead of the picture
  function picsUnique(list){ return new Set(list.map(c => c.pk || c.pic)).size >= list.length * 0.8; }   // pk = card id once it has its own drawn picture (wd-13)
  function typesFor(catK, lv, list){
    const L = LEVELS[lv]; if(L.typed) return ['type'];
    const chem = catK === 'wischem';
    let t = chem ? ['formula', 'name', 'tf', 'formula'] : catK === 'wistune' ? ['listen', 'pic', 'listen', 'tf', 'listen'] : ['pic', 'name', 'listen', 'tf'];
    if(lv >= 1) t.push('fact');
    if(lv >= 2) t.push('order', 'odd');
    if(lv >= 3 && GEO_CATS[catK]) t.push('map', 'map');
    return t;
  }
  function maskName(text, cd){   // hide the card's own name inside its fun fact ("T. rex had…" → "___ had…")
    let s = String(text || ''); const names = [cd.en].concat(cd.en.split(/[\s-]+/).filter(w => w.length >= 5));
    names.forEach(n => { const esc = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); s = s.replace(new RegExp(esc + "('s)?", 'gi'), '___'); }); return s;
  }
  // distractors: different name AND different picture; Extreme = look-alikes (closest power first)
  function distractors(target, pool, n, r, lookAlike, picOpts, list){
    let c = pool.filter(x => x.id !== target.id && x.pic !== target.pic && x.en.toLowerCase() !== target.en.toLowerCase());
    if(c.length < n && list) c = list.filter(x => x.id !== target.id && x.pic !== target.pic && x.en.toLowerCase() !== target.en.toLowerCase());   // small pool (Basic 10): borrow from the rest of the category
    c = shuffle(c, r); if(lookAlike) c.sort((a, b) => Math.abs(a.power - target.power) - Math.abs(b.power - target.power));
    const out = [], pics = new Set([target.pic]); for(const x of c){ if(out.length >= n) break; if(picOpts && pics.has(x.pic)) continue; pics.add(x.pic); out.push(x); } return out;
  }
  function picOf(list, cd){ return list.filter(x => x.pic === cd.pic).length === 1; }   // this card's picture is its own in the category
  function makeQuestion(type, target, ctx){
    const {r, lv, list, pool, others} = ctx, L = LEVELS[lv];
    const tune = type === 'listen' && target.cat === 'wistune';
    if((type === 'pic' || type === 'name' || type === 'listen') && !tune && !picOf(list, target)) type = 'fact';
    if(tune){ const fam = new Set([tuneFamily(target.en)]), opts = [target]; for(const x of shuffle(pool.length >= L.choices * 2 ? pool : list, r)){ if(opts.length >= L.choices) break; const f = tuneFamily(x.en); if(!fam.has(f)){ fam.add(f); opts.push(x); } }
      return {type, card: target.id, win: target.id, options: shuffle(opts, r).map(x => x.id), answer: target.id, tune: true}; }   // shared emoji / drawn dino → ask with the fun fact
    const q = {type, card: target.id, win: target.id};
    if(type === 'pic' || type === 'name' || type === 'listen' || type === 'fact' || type === 'formula' || type === 'type'){
      const n = (type === 'type' ? 8 : L.choices) - 1, opts = shuffle([target].concat(distractors(target, lv >= 4 ? list : pool, n, r, L.lookAlike, type === 'name' || type === 'listen', list)), r);
      q.options = opts.map(x => x.id); q.answer = target.id; if(type === 'fact') q.text = maskName(target.fact, target);
      return q;
    }
    if(type === 'tf'){
      const truth = r() < 0.5, other = distractors(target, pool, 1, r, false, false, list)[0] || target;
      q.shown = truth ? target.id : other.id; q.answer = truth || other.id === target.id; q.uni = picOf(list, target) && picOf(list, other); if(!q.uni) q.text = maskName(target.fact, target); return q;
    }
    if(type === 'order'){
      const n = lv >= 3 ? 4 : 3; let pick = [target]; for(const x of shuffle(pool, r)){ if(pick.length >= n) break; if(pick.every(y => y.v !== x.v && y.pic !== x.pic)) pick.push(x); }
      q.options = shuffle(pick, r).map(x => x.id); q.answer = pick.slice().sort((a, b) => a.v - b.v).map(x => x.id); return q;
    }
    if(type === 'odd'){
      const same = [target].concat(distractors(target, pool, 2, r, false, true, list)), oth = others.filter(x => same.every(y => y.pic !== x.pic && y.en !== x.en)), odd = oth.length ? oth[Math.floor(r() * oth.length)] : null;
      if(!odd) return makeQuestion('pic', target, ctx);
      q.options = shuffle(same.concat([odd]), r).map(x => x.id); q.answer = odd.id; return q;
    }
    if(type === 'map'){ q.cc = target.pic; q.answer = target.pic; return q; }
    return makeQuestion('pic', target, ctx);
  }
  // cfg = {cat, level, seed}; W = WisCards (passed in so node tests can use the same data)
  function makeQuiz(W, cfg){
    const lv = Math.max(0, Math.min(5, cfg.level | 0)), L = LEVELS[lv], r = rng(cfg.seed || 1), list = W.cards(cfg.cat), pool = list.slice(0, Math.min(list.length, L.items));
    const others = W.CATS.filter(c => c.k !== cfg.cat).reduce((a, c) => a.concat(W.cards(c.k).slice(0, 12)), []);
    const types = typesFor(cfg.cat, lv, list), targets = shuffle(pool, r).slice(0, ROUNDS), qs = [];
    targets.forEach((t, i) => { const type = i < types.length ? types[i] : types[Math.floor(r() * types.length)]; qs.push(makeQuestion(type, t, {r, lv, list, pool, others})); });
    return {cat: cfg.cat, level: lv, qs: shuffle(qs, r), i: 0, right: 0, wrong: 0, streak: 0, bestStreak: 0, score: 0, won: [], over: false, hints: 0, log: []};
  }
  // typed answers: ignore case / spaces / dots, allow small spelling slips (1 letter from 5 letters, 2 from 9), Thai name counts too
  function norm(s){ return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9฀-๿]+/g, ''); }
  function lev(a, b){ const m = a.length, n = b.length, d = []; for(let i = 0; i <= m; i++){ d[i] = [i]; } for(let j = 1; j <= n; j++) d[0][j] = j;
    for(let i = 1; i <= m; i++) for(let j = 1; j <= n; j++){ d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if(i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); } return d[m][n]; }   // two neighbour letters swapped = one slip
  function typedOk(cd, text){
    const t = norm(text); if(!t) return false; if(t === norm(cd.th)) return true;
    const want = norm(cd.en), slack = want.length >= 9 ? 2 : want.length >= 5 ? 1 : 0; return lev(t, want) <= slack;
  }
  function judge(q, ans, W){
    if(q.type === 'tf') return ans === q.answer;
    if(q.type === 'order') return Array.isArray(ans) && ans.join() === q.answer.join();
    if(q.type === 'map') return !!ans && ans === q.answer;
    if(q.type === 'type' && typeof ans === 'string' && !q.hint) return typedOk(W.card(q.card), ans);
    return ans === q.answer;
  }
  function comboMult(streak){ return streak >= 2 ? Math.min(2, 1 + (streak - 1) * 0.1) : 1; }   // 🔥 ×1.1 at 2 in a row … ×2
  // right = 100 × level bonus, fast (≤ 40 % of the timer, or ≤ 5 s with no timer) +20 %, 🔥 combo, 💡 8 choices on Hardcore = half
  function points(lv, secs, streak, hint){
    const L = LEVELS[lv], fast = L.timer ? secs <= L.timer * 0.4 : secs <= 5; let p = 100 * L.mult; if(fast) p *= 1.2; p *= comboMult(streak); if(hint) p *= 0.5; return {points: Math.round(p), fast};
  }
  function answer(Q, ans, opt, W){
    opt = opt || {}; const q = Q.qs[Q.i], ok = !opt.timeout && judge(q, ans, W), res = {ok, q, points: 0};
    if(ok){ Q.right++; Q.streak++; Q.bestStreak = Math.max(Q.bestStreak, Q.streak); const p = points(Q.level, opt.secs || 0, Q.streak, q.hint); res.points = p.points; res.fast = p.fast; Q.score += p.points; Q.won.push(q.win); }
    else { Q.wrong++; Q.streak = 0; if(LEVELS[Q.level].oneLife) Q.over = true; }
    Q.log.push({type: q.type, ok, points: res.points}); Q.i++; if(Q.i >= Q.qs.length) Q.over = true; res.over = Q.over; return res;
  }
  function useHint(Q){ const q = Q.qs[Q.i]; if(!q || q.type !== 'type' || q.hint) return false; q.hint = true; Q.hints++; return true; }
  function starsFor(right, total){ const p = total ? right / total * 100 : 0; return p >= 100 ? 3 : p >= 85 ? 2 : p >= 60 ? 1 : 0; }
  function result(Q){ const total = Q.qs.length, stars = starsFor(Q.right, total); return {right: Q.right, total, stars, score: Q.score, cleared: stars > 0, bestStreak: Q.bestStreak, won: Q.won.slice()}; }
  // merge cards won into the deck; returns ids that are new (first copy) + tier ups
  function winCards(deck, ids, lv, W){
    const fresh = [], ups = [];
    ids.forEach(id => { const before = owned(deck, id) ? W.tierOf(dupsOf(deck, id)) : -1; addCard(deck, id, lv); const after = W.tierOf(dupsOf(deck, id)); if(before < 0) fresh.push(id); else if(after > before) ups.push({id, tier: after}); });
    return {fresh, ups};
  }
  function fullCats(deck, W){ return W.CATS.filter(c => { const l = W.cards(c.k); return l.length && l.every(x => owned(deck, x.id)); }).map(c => c.k); }

  /* ---------- 🔢 WisCount (plan section 7): rack of 10 → hand of 5 (power ≤ 15, max 2 of one power), best 3 of 5 + sudden death ---------- */
  const HAND = 5, BUDGET = 15, SAME = 2;
  function legalHand(pw, budget){ if(pw.length !== HAND) return false; if(pw.reduce((a, b) => a + b, 0) > (budget || BUDGET)) return false; const c = {}; return pw.every(p => (c[p] = (c[p] || 0) + 1) <= SAME); }
  function combos(n, k){ const out = [], cur = []; (function go(s){ if(cur.length === k){ out.push(cur.slice()); return; } for(let i = s; i < n; i++){ cur.push(i); go(i + 1); cur.pop(); } })(0); return out; }
  const C10 = combos(10, 5);
  function legalHands(rack, budget){ const cs = rack.length === 10 ? C10 : combos(rack.length, HAND); return cs.filter(ix => legalHand(ix.map(i => rack[i].power), budget)).map(ix => ix.map(i => rack[i])); }
  const BOT_BUDGET = [15, 15, 15, 15, 17, 21];   // 🌋 Extreme robot builds its hand with ⚡ 17, 💀 Hardcore with ⚡ 21 (you keep 15) — a handicap you can see
  function randomHand(rack, r){ const h = legalHands(rack); return h.length ? h[Math.floor(r() * h.length)] : null; }
  // a "good shape" (plan: use the full 15, keep one low and one high): most total power, then the widest spread
  function bestHand(rack, budget){ let best = null, bs = -1; legalHands(rack, budget).forEach(h => { const p = h.map(c => c.power), s = p.reduce((a, b) => a + b, 0) * 10 + (Math.max(...p) - Math.min(...p)); if(s > bs){ bs = s; best = h; } }); return best; }
  const COUNT_MODS = [   // 🎴 theme rule cards (Intermediate+), on top of ⬆️ / ⬇️
    {k: 'plus', icon: '➕', n: 2}, {k: 'minus', icon: '➖', n: 2}, {k: 'double', icon: '✖️2'}, {k: 'swap', icon: '🔁'}];
  function countRule(r, lv, shelves){
    const rule = {dir: r() < 0.5 ? 1 : -1, mod: null};
    if(lv >= 2 && r() < 0.45){ const m = COUNT_MODS[Math.floor(r() * COUNT_MODS.length)]; rule.mod = Object.assign({}, m); if(m.k !== 'swap') rule.mod.shelf = shelves[Math.floor(r() * shelves.length)]; }
    return rule;
  }
  function effPower(card, rule, shelfOf){ let p = card.power; const m = rule.mod; if(m && m.shelf && shelfOf(card) === m.shelf){ if(m.k === 'plus') p += m.n; else if(m.k === 'minus') p -= m.n; else if(m.k === 'double') p *= 2; } return p; }
  // cfg {level, seed, hands: [[cards], [cards]], shelfOf(card)}
  function countMatch(cfg){
    const r = rng(cfg.seed || 1), M = {kind: 'count', level: cfg.level | 0, r, shelfOf: cfg.shelfOf || (c => c.shelf || ''), P: cfg.hands.map((h, i) => ({i, hand: h.slice(), full: h.slice(), wins: 0, played: []})),
      round: 0, rule: null, log: [], over: false, winner: -1, sudden: false};
    M.shelves = [...new Set(cfg.hands.flat().map(M.shelfOf))]; countNextRule(M); return M;
  }
  function countNextRule(M){ M.rule = countRule(M.r, M.level, M.shelves); if(M.rule.mod && M.rule.mod.k === 'swap' && M.P.every(p => p.hand.length > 1)){ const a = M.P[0], b = M.P[1], i = Math.floor(M.r() * a.hand.length), j = Math.floor(M.r() * b.hand.length), t = a.hand[i]; a.hand[i] = b.hand[j]; b.hand[j] = t; M.rule.swapped = [a.hand[i].id, b.hand[j].id]; } return M.rule; }
  function countPlay(M, a, b){   // a, b = index into each hand
    const ca = M.P[0].hand.splice(a, 1)[0], cb = M.P[1].hand.splice(b, 1)[0], ea = effPower(ca, M.rule, M.shelfOf), eb = effPower(cb, M.rule, M.shelfOf);
    const w = ea === eb ? -1 : (ea - eb) * M.rule.dir > 0 ? 0 : 1; if(w >= 0) M.P[w].wins++;
    M.P[0].played.push(ca); M.P[1].played.push(cb); M.round++;
    const ev = {round: M.round, rule: M.rule, cards: [ca, cb], eff: [ea, eb], winner: w, sudden: M.sudden}; M.log.push(ev);
    const [x, y] = [M.P[0].wins, M.P[1].wins];
    if(M.sudden){ if(w >= 0){ M.over = true; M.winner = w; } else if(!M.P[0].hand.length){ M.P.forEach(p => { p.hand = p.full.slice(); }); } }
    else if(x >= 3 || y >= 3){ M.over = true; M.winner = x >= 3 ? 0 : 1; }
    else if(M.round >= 5){ if(x !== y){ M.over = true; M.winner = x > y ? 0 : 1; } else { M.sudden = true; M.P.forEach(p => { p.hand = p.full.slice(); }); } }   // ⚡ sudden death: whole hands come back, one round
    if(!M.over) countNextRule(M);
    return ev;
  }
  // 🤖 robot brains (plan): Basic random · Junior the obvious card · Intermediate obvious + rule cards · Hard counts your cards left · Extreme + keeps a low and a high · Hardcore bluffs
  // 🤖 robot brains (plan): Basic random · Junior the obvious card · Intermediate obvious + reads rule cards · Hard counts your cards left · Extreme counts better · Hardcore counts + bluffs
  function countSmart(M, me, ord, e){   // chance to beat each card you still hold, minus the cost of spending a strong card
    const H = M.P[me].hand, O = M.P[1 - me].hand, n = H.length; let bi = ord[0], bs = -1e9;
    ord.forEach((i, rank) => { const v = e(H[i]), win = O.filter(c => v > e(c)).length / O.length, tie = O.filter(c => v === e(c)).length / O.length; const sc = win + tie * 0.4 - (n > 1 ? rank / (n - 1) : 0) * 0.35; if(sc > bs){ bs = sc; bi = i; } });
    return bi;
  }
  function countBot(M, me, lv, r){
    const H = M.P[me].hand, O = M.P[1 - me].hand, rule = M.rule, e = c => effPower(c, rule, M.shelfOf) * rule.dir;
    if(H.length === 1) return 0;
    const ord = H.map((c, i) => i).sort((a, b) => e(H[a]) - e(H[b])), top = ord[ord.length - 1];   // weakest … strongest for this rule
    if(lv <= 0) return Math.floor(r() * H.length);
    if(lv === 1) return r() < 0.6 ? top : Math.floor(r() * H.length);
    if(lv === 2) return r() < 0.8 ? top : ord[Math.floor(r() * ord.length)];
    const best = Math.max(...O.map(e)), beat = ord.filter(i => e(H[i]) > best);
    if(lv >= 4 && beat.length) return beat[0];   // a sure win → cheapest card that beats everything you have left
    if(lv === 5 && M.P[me].wins > M.P[1 - me].wins && r() < 0.1) return ord[0];   // 💀 bluff while ahead: throw the weakest to drain your best card
    return r() < (lv === 3 ? 0.7 : 0.95) ? countSmart(M, me, ord, e) : top;
  }
  function simulateCount(handA, handB, botA, botB, n, seed, lv, shelfOf){
    let wa = 0, wb = 0, sd = 0; const r = rng(seed || 7);
    for(let k = 0; k < n; k++){ const M = countMatch({level: lv || 0, seed: (seed || 7) * 1000 + k, hands: [handA(r), handB(r)], shelfOf}); let g = 0;
      while(!M.over && g++ < 30) countPlay(M, countBot(M, 0, botA, r), countBot(M, 1, botB, r)); if(M.sudden) sd++; if(M.winner === 0) wa++; else if(M.winner === 1) wb++; }
    return {a: wa / n, b: wb / n, sudden: sd / n};
  }

  /* ---------- 🂡 WisJack (plan section 8): Pazaak-style 20 (or 🃏 21), 3 side cards from the rack (+ / − set when building), used = gone for the match ---------- */
  function jackDeck(r, top){ const d = []; for(let v = 1; v <= top; v++) for(let k = 0; k < 4; k++) d.push(v); return shuffle(d, r); }
  // cfg {level, seed, target 20|21, sides: [[{id, v, sign}] × 2]}
  function jackMatch(cfg){
    const target = cfg.target === 21 ? 21 : 20, r = rng(cfg.seed || 1);
    const M = {kind: 'jack', level: cfg.level | 0, r, target, top: 10, P: (cfg.sides || [[], []]).map((s, i) => ({i, side: s.map(x => Object.assign({used: false}, x)), wins: 0, exact: 0})),
      set: 0, over: false, winner: -1, log: [], sudden: false};
    jackNewSet(M); return M;
  }
  function jackNewSet(M){ M.set++; M.deck = jackDeck(M.r, M.top); M.turn = (M.set + 1) % 2; M.S = M.P.map(() => ({table: [], total: 0, stood: false, bust: false, usedSide: false})); M.setOver = false; M.setWinner = -2; jackDraw(M); }
  function jackDraw(M){ const s = M.S[M.turn]; if(s.stood || s.bust) return null; if(!M.deck.length) M.deck = jackDeck(M.r, M.top); const v = M.deck.pop(); s.table.push({v}); s.total += v; s.usedSide = false; return v; }
  function jackSide(M, k){ const p = M.P[M.turn], s = M.S[M.turn], c = p.side[k]; if(!c || c.used || s.usedSide || s.stood) return false; c.used = true; s.usedSide = true; const v = c.v * c.sign; if(s.total + v < 0){ c.used = false; s.usedSide = false; return false; } s.table.push({v, side: true}); s.total += v; return true; }
  function jackBustChance(total, target, top){ const room = target - total; if(room >= top) return 0; return Math.max(0, Math.min(1, (top - Math.max(0, room)) / top)); }   // ⚠️ meter: share of cards 1..top that go over
  function jackEnd(M, stand){   // end my turn (stand or just pass), then the other player draws
    const s = M.S[M.turn]; if(stand) s.stood = true;
    if(s.total > M.target){ s.bust = true; }
    else if(s.table.length >= 9){ return jackFinishSet(M, M.turn); }   // 9 cards and no bust = automatic win (Pazaak rule)
    if(s.bust) return jackFinishSet(M, 1 - M.turn);
    const o = 1 - M.turn, so = M.S[o];
    if(s.stood && so.stood) return jackFinishSet(M, null);
    if(!so.stood){ M.turn = o; } jackDraw(M); return null;
  }
  function jackFinishSet(M, w){
    const [a, b] = M.S; if(w == null){ w = a.total === b.total ? -1 : a.total > b.total ? 0 : 1; }
    M.setOver = true; M.setWinner = w; if(w >= 0){ M.P[w].wins++; if(M.S[w].total === M.target) M.P[w].exact++; }
    M.log.push({set: M.set, totals: [a.total, b.total], winner: w});
    const [x, y] = [M.P[0].wins, M.P[1].wins];
    if(M.sudden){ if(w >= 0){ M.over = true; M.winner = w; } }
    else if(x >= 3 || y >= 3){ M.over = true; M.winner = x >= 3 ? 0 : 1; }
    else if(M.set >= 5){ if(x !== y){ M.over = true; M.winner = x > y ? 0 : 1; } else M.sudden = true; }
    return w;
  }
  const JACK_STAND = [15, 16, 17, 17, 17, 17];
  // 🤖 robot turn: Basic stands at 15 · Junior 16 · Intermediate 17 + fixes a bust with a side card · Hard also uses + cards to hit 19–20 · Extreme reads your total · Hardcore picks the best expected move
  function jackBot(M, lv){
    const me = M.turn, s = M.S[me], o = M.S[1 - me], p = M.P[me], T = M.target, free = p.side.map((c, k) => ({k, v: c.v * c.sign, used: c.used})).filter(c => !c.used);
    if(lv >= 2 && s.total > T){ const fix = free.filter(c => s.total + c.v <= T && s.total + c.v >= T - 6).sort((a, b) => (s.total + b.v) - (s.total + a.v))[0]; if(fix) jackSide(M, fix.k); }
    else if(lv >= 3 && s.total < T && s.total >= T - (lv >= 5 ? 6 : 4)){ const hit = free.filter(c => s.total + c.v === T || (c.v > 0 && s.total + c.v === T - 1 && lv >= 4) || (lv >= 5 && c.v > 0 && s.total + c.v === T - 2 && !o.stood)).sort((a, b) => b.v - a.v)[0]; if(hit && !s.usedSide) jackSide(M, hit.k); }
    let stand = s.total >= JACK_STAND[lv] && s.total <= T;
    if(lv >= 4 && o.stood && o.total <= T){ if(s.total > o.total && s.total <= T) stand = true; else if(s.total < o.total) stand = false; else if(s.total === o.total) stand = s.total >= 18; }
    if(lv >= 5 && !o.stood && s.total <= T){ const bust = jackBustChance(s.total, T, M.top), fix = free.some(c => c.v < 0); stand = s.total >= (fix ? 19 : 18) || (!fix && s.total >= 16 && bust > 0.55); }   // 💀 keeps drawing while a − card can save a bust
    if(s.total > T) stand = false;
    return jackEnd(M, stand);
  }
  function simulateJack(n, seed, cfgA, cfgB){   // cfg = {lv (bot brain), side: [{v, sign}]}
    let wa = 0, wb = 0, bust = 0, exact = 0, sets = 0; const sim = (lv, side) => ({lv, side: (side || []).map((x, i) => Object.assign({id: 's' + i}, x))});
    for(let k = 0; k < n; k++){ const A = sim(cfgA.lv, cfgA.side), B = sim(cfgB.lv, cfgB.side), M = jackMatch({seed: (seed || 3) * 7919 + k, target: cfgA.target || 20, sides: [A.side, B.side]}); let g = 0;
      while(!M.over && g++ < 400){ if(M.setOver){ jackNewSet(M); continue; } jackBot(M, M.turn === 0 ? A.lv : B.lv); if(M.setOver){ sets++; const s0 = M.S[0]; if(s0.bust) bust++; if(s0.total === M.target && !s0.bust) exact++; } }
      if(M.winner === 0) wa++; else if(M.winner === 1) wb++; }
    return {a: wa / n, b: wb / n, bustA: bust / sets, exactA: exact / sets};
  }

  /* ---------- 🔔 WisBuzz (2–4 players, one device): first to buzz answers; right +1, wrong = frozen for the next question; first to 7 ---------- */
  const BUZZ_TYPES = {pic: 1, name: 1, fact: 1, formula: 1, tf: 1, listen: 1};
  function buzzMatch(cfg){ return {n: Math.max(2, Math.min(4, cfg.players | 0)), target: cfg.target || 7, score: [0, 0, 0, 0].slice(0, Math.max(2, Math.min(4, cfg.players | 0))), frozen: [], out: [], turn: -1, qn: 0, over: false, winner: -1, phase: 'buzz', log: []}; }
  function buzzCan(B, p){ return !B.over && B.phase === 'buzz' && p >= 0 && p < B.n && !B.frozen.includes(p) && !B.out.includes(p); }
  function buzzIn(B, p){ if(!buzzCan(B, p)) return false; B.turn = p; B.phase = 'answer'; return true; }
  // after an answer: right → point (+ maybe the win), next question · wrong → that player is out for this question AND frozen for the next one; the others may buzz again
  function buzzAnswer(B, ok){
    const p = B.turn; if(B.phase !== 'answer' || p < 0) return null; B.log.push({q: B.qn, p, ok});
    if(ok){ B.score[p]++; if(B.score[p] >= B.target){ B.over = true; B.winner = p; } B.phase = 'done'; return {p, ok, next: true}; }
    B.out.push(p); B.nextFrozen = (B.nextFrozen || []).concat([p]); B.turn = -1;
    const left = [...Array(B.n).keys()].filter(i => !B.frozen.includes(i) && !B.out.includes(i)); B.phase = left.length ? 'buzz' : 'done'; return {p, ok, next: !left.length};
  }
  function buzzNext(B){ B.qn++; B.frozen = B.nextFrozen || []; B.nextFrozen = []; B.out = []; B.turn = -1; B.phase = 'buzz'; if(B.frozen.length >= B.n) B.frozen = []; return B; }
  function buzzQuestions(W, cat, lv, seed){ const Q = makeQuiz(W, {cat, level: Math.min(2, lv), seed}); return Q.qs.filter(q => BUZZ_TYPES[q.type]); }

  /* ---------- 📅 Daily deck: 5 questions from 5 different categories, the same for everyone on that date ---------- */
  function dateSeed(d){ let h = 2166136261; String(d).split('').forEach(ch => { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }); return h >>> 0; }
  function dailyQuiz(W, date){
    const r = rng(dateSeed('wisdeck:' + date)), cats = shuffle(W.CATS, r).slice(0, 5), qs = [];
    cats.forEach(c => { const list = W.cards(c.k), pool = list.slice(0, 20), t = pool[Math.floor(r() * pool.length)], kinds = c.k === 'wischem' ? ['formula', 'name'] : ['pic', 'name', 'fact', 'tf'];
      qs.push(makeQuestion(kinds[Math.floor(r() * kinds.length)], t, {r, lv: 1, list, pool, others: []})); });
    return {cat: 'daily', level: 1, qs, i: 0, right: 0, wrong: 0, streak: 0, bestStreak: 0, score: 0, won: [], over: false, hints: 0, log: [], daily: date};
  }
  return {BOT_BUDGET, buzzMatch, buzzCan, buzzIn, buzzAnswer, buzzNext, buzzQuestions, dateSeed, dailyQuiz, HAND, BUDGET, SAME, legalHand, legalHands, randomHand, bestHand, countRule, effPower, countMatch, countPlay, countBot, simulateCount, jackDeck, jackMatch, jackNewSet, jackDraw, jackSide, jackBustChance, jackEnd, jackBot, simulateJack, JACK_STAND,
    tuneFamily, TUNE, rng, shuffle, emptyDeck, owned, dupsOf, addCard, catCount, LEVELS, QTYPES, ROUNDS, typesFor, picsUnique, maskName, makeQuiz, typedOk, judge, comboMult, points, answer, useHint, starsFor, result, winCards, fullCats, norm, lev};
})();
// ENGINE END

const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ modes-3: ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const DEEP_GAME = SP_TV[6];
const GAME_ID = 'wisdeck';
const $ = id => document.getElementById(id);
let FX = 1;      // harness sets 0
let SPEED = 1;   // harness sets 0 → every wait is instant
const WC = window.WisCards;

/* ================= STATE ================= */
let S = {players: [], progress: {}, settings: {}, avatars: {}, player: '', age: '', deck: WD.emptyDeck()};
let SET = {mode: 'quiz', shelf: 'world'};
let L = null, lockHandle = null;
function ls(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }
function store(k){ return 'sp_wisdeck_' + k + ':' + (S.player || ''); }
function loadPrefs(){ try{ const p = JSON.parse(ls(store('prefs')) || '{}'); if(WC.SHELVES.some(s => s.k === p.shelf)) SET.shelf = p.shelf; if(CAT_MODES.includes(p.mode)) SET.mode = p.mode; }catch(e){} }
function savePrefs(){ ls(store('prefs'), JSON.stringify({shelf: SET.shelf, mode: SET.mode})); }
function seenSet(){ try{ return JSON.parse(ls(store('seen')) || '{}') || {}; }catch(e){ return {}; } }
function markSeen(id){ const s = seenSet(); if(s[id]) return; s[id] = 1; ls(store('seen'), JSON.stringify(s)); }
function myAvatar(name){ const a = S.avatars[name]; return a ? fixAv(a) : defaultAvatar(name || 'player'); }
const wait = ms => new Promise(r => setTimeout(r, Math.max(0, ms * SPEED)));
function goGameroom(){ UI.back(WEBAPP_URL + '?page=gameroom&player=' + encodeURIComponent(S.player || CURRENT_PLAYER) + (SESSION_START ? '&sessionStart=' + SESSION_START : '') + (DURATION_MIN ? '&durationMin=' + DURATION_MIN : ''), 'rooms'); }
function pauseGame(){ try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} if(QT) cancelAnimationFrame(QT); }

/* ================= DATA ================= */
const MODE_GROUPS = [   // home screen, 3 groups (Aowu wd-10)
  {k: 'quiz', icon: '🧠', en: 'Quiz games', th: 'เกมตอบคำถาม'},
  {k: 'num', icon: '🔢', en: 'Number games', th: 'เกมตัวเลข'},
  {k: 'learn', icon: '📚', en: 'Learn + store', th: 'อ่าน · เรียน · เก็บการ์ด'}];
const MODES = [
  {k: 'quiz', g: 'quiz', icon: '🧠', name: 'WisQuiz', sub: 'Pick a category · win cards'},
  {k: 'buzz', g: 'quiz', icon: '🔔', name: 'WisBuzz', sub: '2–4 players · buzz first'},
  {k: 'daily', g: 'quiz', icon: '📅', name: 'WisDaily', sub: '5 questions · once a day'},
  {k: 'count', g: 'num', icon: '🔢', name: 'WisCount', sub: 'Card battle · best 3 of 5'},
  {k: 'jack', g: 'num', icon: '🂡', name: 'WisJack', sub: 'Get close to 20'},
  {k: 'learn', g: 'learn', icon: '📚', name: 'WisLearn', sub: 'Flip + read the cards'},
  {k: 'book', g: 'learn', icon: '📖', name: 'WisStock', sub: 'Your cards + tiers'}
];
const CAT_MODES = ['quiz', 'learn'];   // the only modes that use the category list below; the others open their own screen

/* ================= 🎺 instrument sounds (WisTune listen) — tiny WebAudio synth per sound family ================= */
const TUNE_PITCH = {'tuba': 65, 'double bass': 55, 'didgeridoo': 70, 'cello': 130, 'trombone': 117, 'french horn': 175, 'bagpipes': 233, 'long drum': 70, 'drum': 90, 'gong': 80, 'saw duang': 392, 'violin': 440, 'piccolo': 1047, 'flute': 784, 'recorder': 659,
  'trumpet': 466, 'clarinet': 294, 'oboe': 440, 'saxophone': 233, 'harmonica': 523, 'accordion': 349, 'khaen': 330, 'xylophone': 784, 'ranat ek': 659, 'kalimba': 523, 'triangle': 2600, 'handbell': 1318, 'ching': 2100, 'cymbals': 3000,
  'guitar': 196, 'ukulele': 392, 'banjo': 294, 'harp': 262, 'khim': 523, 'sitar': 220, 'electric guitar': 165, 'piano': 262, 'pipe organ': 131, 'tambourine': 0, 'maracas': 0};
function playTune(cd){
  try{ if(!UISound.get().enabled) return; const c = UISound.wake(); if(!c) return; const fam = WD.tuneFamily(cd.en), f0 = TUNE_PITCH[cd.en.toLowerCase()] || 262, vol = 0.32 * UISound.get().volume, T = c.currentTime + 0.03, out = c.createGain(); out.gain.value = vol; out.connect(c.destination);
    const note = (f, t, d, type, a, rel, gain, vib) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if(vib){ const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 5.5; lg.gain.value = f * vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + d + rel); }
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain || 1, t + a); g.gain.setValueAtTime(gain || 1, t + Math.max(a, d - 0.02)); g.gain.exponentialRampToValueAtTime(0.0001, t + d + rel); o.connect(g); g.connect(out); o.start(t); o.stop(t + d + rel + 0.05); return o; };
    const noise = (t, d, hp, gain) => { const b = c.createBuffer(1, Math.ceil(c.sampleRate * d), c.sampleRate), x = b.getChannelData(0); for(let i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1; const n = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); n.buffer = b; fl.type = 'highpass'; fl.frequency.value = hp; g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); n.connect(fl); fl.connect(g); g.connect(out); n.start(t); };
    const tune = [1, 1.25, 1.5, 2], mel = (type, a, d, rel, gain, vib, gap) => tune.forEach((m, i) => note(f0 * m, T + i * (gap || 0.32), d, type, a, rel, gain, vib));
    if(fam === 'drum') [0, 0.3, 0.6, 0.75].forEach((t, i) => { const o = note(f0 * (i === 3 ? 1.3 : 1), T + t, 0.05, 'sine', 0.005, 0.25, 1); o.frequency.exponentialRampToValueAtTime(f0 * 0.5, T + t + 0.25); noise(T + t, 0.06, 1500, 0.15); });
    else if(fam === 'keys') mel('triangle', 0.005, 0.05, 0.9, 0.9);
    else if(fam === 'pluck') mel('triangle', 0.003, 0.02, 0.55, 1, 0, 0.26);
    else if(fam === 'electric') mel('sawtooth', 0.01, 0.25, 0.4, 0.5, 0.01, 0.3);
    else if(fam === 'bowed') mel('sawtooth', 0.15, 0.32, 0.2, 0.45, 0.012, 0.42);
    else if(fam === 'brass') mel('sawtooth', 0.06, 0.3, 0.12, 0.55, 0.004, 0.36);
    else if(fam === 'flute'){ mel('sine', 0.08, 0.3, 0.15, 0.8, 0.01, 0.36); tune.forEach((m, i) => noise(T + i * 0.36, 0.2, 3000, 0.04)); }
    else if(fam === 'reed') mel('square', 0.05, 0.3, 0.12, 0.35, 0.006, 0.36);
    else if(fam === 'mallet') mel('sine', 0.002, 0.02, 0.35, 1, 0, 0.22);
    else if(fam === 'metal'){ [0, 0.6].forEach(t => { note(f0, T + t, 0.02, 'sine', 0.002, 1.4, 0.6); note(f0 * 2.76, T + t, 0.02, 'sine', 0.002, 0.9, 0.3); if(f0 > 2000) noise(T + t, 0.6, 6000, 0.12); }); }
    else if(fam === 'shaker') [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(t => noise(T + t, 0.09, cd.en === 'Tambourine' ? 5000 : 3000, 0.5));
    else if(fam === 'organ') [1, 1.25, 1.5].forEach(m => note(f0 * m, T, 1.2, 'square', 0.05, 0.3, 0.25));
    else if(fam === 'drone'){ note(f0, T, 1.6, 'sawtooth', 0.1, 0.3, 0.6, 0.03); note(f0 * 3, T, 1.6, 'sine', 0.2, 0.3, 0.15, 0.05); }
    else mel('triangle', 0.01, 0.2, 0.3, 0.7);
  }catch(e){}
}
/* ================= 🃏 card face ================= */
function cardHtml(cd, opt){
  opt = opt || {}; const c = WC.CAT[cd.cat];
  if(opt.back) return '<div class="wcard back"></div>';
  return '<div class="wcard' + (opt.mini ? ' mini' : '') + '" style="--c:' + c.color + '" data-id="' + cd.id + '"' + (opt.tier != null ? ' data-tier="' + opt.tier + '"' : '') + '>' + (opt.count > 1 ? '<span class="cnt">×' + opt.count + '</span>' : '') + (opt.lv != null && opt.mini ? '<span class="rar">' + WC.RARITY[WC.rarityOfLevel(opt.lv)].icon + '</span>' : '') +
    '<div class="pw" title="Power ' + cd.power + '">' + cd.power + '</div>' +
    '<div class="hd"><span>' + c.icon + '</span><span class="ct">' + c.en + '</span></div>' +
    '<div class="art">' + WC.picHtml(cd) + '</div>' +
    '<div class="nm">' + UI.esc(cd.en) + '</div><div class="nm-th">' + UI.esc(cd.th) + '</div>' +
    '<div class="val">' + WC.valueIcon(cd) + ' ' + UI.esc(WC.valueText(cd)) + ' <span class="rk">· ⚡ ' + cd.power + ' ' + c.rank + '</span></div>' +
    '<div class="fact">' + UI.esc(cd.fact) + '</div><div class="fact-th">' + UI.esc(cd.factTh) + '</div></div>';
}

/* ================= MENUS ================= */
const BACK_TO = {levels: 'menu', book: 'menu', cmenu: 'menu', rack: 'cmenu', bmenu: 'menu', daily: 'menu'};
let CUR_SCREEN = '';
function goBack(){ UISound.play('tap'); const to = BACK_TO[CUR_SCREEN]; if(to === 'cmenu') openTableMenu(TM.kind); else { renderMenu(); showScreen('menu'); } }
// 🎛️ p1d: the game's own top bar becomes the shared bar in place (UiKit UI.gameBarFrom) — ◀ where you came from · 🎚️ Levels · 🏠 | numbers | buttons ❓
const WD_BARS = [...document.querySelectorAll('#scr-play .lhud, #scr-play .qhud')].map(el => UI.gameBarFrom(el, {game: GAME_ID, icon: '🃏', name: 'WisDeck', playing: () => !!(Q || T || B), onFit: () => window.dispatchEvent(new Event('resize'))}));   // 📚 learn · 🧠 quiz · 🃏 table · 🔔 buzz
UI.navBar(document.getElementById('back-btn'), {onclick: false});
function showScreen(name){
  if(name !== 'menu' && name !== 'player' && WdCover) WdCover.hide();   /* 🧱 b3w4 */
  ['player', 'menu', 'levels', 'book', 'cmenu', 'rack', 'bmenu', 'daily', 'play'].forEach(s => { const el = $('scr-' + s); if(el) el.classList.toggle('hidden', s !== name); });
  // ◀ Back: inner WisDeck screens go back to the WisDeck menu (the rack goes back to its game menu); only the menu + player pick go to the Gameroom
  const bb = $('back-btn'), up = BACK_TO[name]; const toCover = name === 'menu' && !!window.GF;   /* 🧱 b3w4: the hub's ◀ goes back to the 🎬 cover */
  bb.textContent = up ? (up === 'cmenu' ? '◀ Game menu' : '◀ WisDeck') : toCover ? '◀ WisDeck' : UI.backLabel();   /* 🧭 p1d: named by where it goes */ bb.onclick = up ? goBack : toCover ? () => openCover() : goGameroom; CUR_SCREEN = name;
  $('back-btn').classList.toggle('hidden', name === 'play'); if(name !== 'play') window.scrollTo(0, 0);
}
function renderPlayers(){
  const box = $('player-list'); box.innerHTML = '';
  if(!S.players.length){ box.innerHTML = '<div class="empty">No players yet — add one on the Dashboard first.</div>'; return; }
  S.players.forEach(p => { const b = document.createElement('button'); b.className = 'pick'; b.setAttribute('data-sound', 'pop');
    const c = document.createElement('canvas'); c.width = 144; c.height = 168; b.appendChild(c);
    b.insertAdjacentHTML('beforeend', '<div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age ? p.Age + ' yrs' : '') + '</div>');
    drawPreviewCanvas(c, myAvatar(p.Name), {name: p.Name, t: 1});
    b.onclick = () => choosePlayer(p.Name); box.appendChild(b); });
}
function choosePlayer(name){
  UI.rememberTheme(name, UI.applyTheme(UI.themeFor(S.settings, name), {kitOnly: true}));
  const p = S.players.find(x => x.Name === name); S.player = name; S.age = p ? p.Age : '';
  S.deck = deckFor(name); loadPrefs(); $('who-name').textContent = name; if(window.Cheer){ Cheer.chip($('cheer-chip'), name); Cheer.langChip($('cheer-lang'), name); } /* 📣 cs-3c */ renderMenu(); showScreen('menu');
  WD_GUIDE = () => { if(window.UI && UI.guideOnce) UI.guideOnce('wisdeck', [
    {icon: '🃏', title: 'Welcome to WisDeck!', text: 'Every card is a real thing — a flag, a dinosaur, a planet, a formula. Each card has a ⚡ power from 1 to 9 that comes from a real fact.'},
    {icon: '📚', title: 'Learn first', text: 'Pick a shelf, then a category, and flip through the cards. 🔊 says the name in English and Thai.'}], {btn: '.gf-cover:not(.gf-hide) .gf-help'}); };   /* 🧱 b3w4: shown after ▶ Play */
  openCover();   /* 🧱 b3w4: the 🎬 cover first */
  if(WD_GUIDE){ const g = WD_GUIDE; WD_GUIDE = null; setTimeout(g, 350); }   /* 🧱 b3fx: the first time, the cover's 📖 How to play glows */
}
/* 🧱 b3w4: 🎬 the cover (GameFrame) first — who's here + champions + how to play; ▶ Play opens the hub */
var WD_GUIDE = null, WdCover = null;
const WD_VERSION = '2.0';   /* shown on the cover footer — bump with each WisDeck round */
function openCover(){
  if(!window.GF){ showScreen('menu'); return; }
  if(WdCover && WdCover.who !== S.player){ WdCover.destroy(); WdCover = null; }
  if(!WdCover){ WdCover = GF.cover(document.body, {game: GAME_ID, title: 'WisDeck', icon: '🃏', version: WD_VERSION, me: S.player, players: S.players, avatarOf: myAvatar, seats: {min: 1, max: 4},   /* 📡 lk-wd1: 👥 / 📱 for 🔔 WisBuzz (2–4) */
      acts: ['beat.wave', 'beat.cheer'], back: () => goGameroom(), backKind: 'rooms',
      own: C => wdOwn(C),   /* 📡 lk-wd1: 🔔 WisBuzz room on the cover (the link part loads on the first tap) */
      onPlay: line => { if(line && line.length > 1) BZ.players = line.slice(0, 4).map(x => x.name);   /* 📡 lk-wd1: 👥 Same device line → 🔔 WisBuzz players */
        WdCover.hide(); renderMenu(); showScreen('menu'); if(WD_GUIDE){ const g = WD_GUIDE; WD_GUIDE = null; setTimeout(g, 350); } } }); WdCover.who = S.player; }
  WdCover.show();
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
function deckFor(name){ const d = deckFor0(name); if(!d.side || !d.side.length){ try{ const loc = JSON.parse(localStorage.getItem('sp_wisdeck_side:' + name) || '[]'); if(Array.isArray(loc) && loc.length) d.side = loc; }catch(e){} } return d; }
function deckFor0(name){ const raw = S.settings && S.settings['Deck_' + name]; try{ const d = JSON.parse(raw || ''); if(d && d.cards) return Object.assign(WD.emptyDeck(), d); }catch(e){} return WD.emptyDeck(); }
function renderMenu(){ renderModes(); renderShelves(); renderCats(); renderHow(); const n = Object.keys(S.deck.cards).filter(id => WD.owned(S.deck, id)).length; $('deck-count').textContent = '🃏 ' + n; /* 🧱 b3w4: 🏆 leaders live on the cover */ }
function renderModes(){
  const box = $('mode-list'), btn = m => '<button class="mode' + (SET.mode === m.k ? ' on' : '') + '" data-k="' + m.k + '" data-sound="tap"><div class="big">' + m.icon + '</div><div class="nm">' + m.name + '</div>' + (window.MODE_TYPE && MODE_TYPE[m.k] ? '<div class="ty">' + MODE_TYPE[m.k] + '</div>' : '') + '<div class="sub">' + m.sub + '</div></button>';   /* 🗂️ p3a type line */
  box.innerHTML = MODE_GROUPS.map(g => { const ms = MODES.filter(m => m.g === g.k);
    return '<div class="mgroup g-' + g.k + '"><div class="gh">' + g.icon + ' ' + g.en + ' <span class="th">' + g.th + '</span></div><div class="gb" style="--n:' + ms.length + '">' + ms.map(btn).join('') + '</div></div>'; }).join('');
  box.querySelectorAll('.mode').forEach(b => b.onclick = () => pickMode(b.dataset.k));
  $('pick-seg').innerHTML = CAT_MODES.map(k => { const m = MODES.find(x => x.k === k); return '<button class="' + (SET.mode === k ? 'on' : '') + '" data-k="' + k + '" data-sound="tap">' + m.icon + ' ' + (k === 'quiz' ? 'quiz it' : 'learn it') + '</button>'; }).join('');
  $('pick-seg').querySelectorAll('button').forEach(b => b.onclick = () => { SET.mode = b.dataset.k; savePrefs(); renderModes(); });
}
function pickMode(k){
  if(CAT_MODES.includes(k)){ SET.mode = k; savePrefs(); renderModes(); const h = $('pick-head'); if(h.scrollIntoView) h.scrollIntoView({behavior: 'smooth', block: 'start'}); return; }   // 🧠 WisQuiz / 📚 WisLearn: choose a category below
  if(k === 'book') openBook(); else if(k === 'count' || k === 'jack') openTableMenu(k); else if(k === 'buzz') openBuzzMenu(); else if(k === 'daily') openDaily();
}
function renderShelves(){
  const box = $('shelf-list');
  box.innerHTML = WC.SHELVES.map(s => '<button class="chip' + (SET.shelf === s.k ? ' on' : '') + '" data-k="' + s.k + '" data-sound="tap">' + s.icon + ' ' + s.en + '<span class="th">' + s.th + '</span></button>').join('');
  box.querySelectorAll('.chip').forEach(b => b.onclick = () => { SET.shelf = b.dataset.k; savePrefs(); box.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); renderCats(); });
}
function renderCats(){
  const sh = WC.SHELVES.find(s => s.k === SET.shelf); $('cat-head').textContent = sh.icon + ' ' + sh.en + ' · ' + sh.th;
  const box = $('cat-list');
  box.innerHTML = WC.catsOf(SET.shelf).map(c => { const list = WC.cards(c.k), have = WD.catCount(S.deck, list), pct = list.length ? Math.round(have * 100 / list.length) : 0, fan = list.slice(0, 3);
    return '<button class="cat" data-k="' + c.k + '" data-sound="pop"><div class="band" style="background:linear-gradient(135deg,' + c.color + ',#13203F)">' + c.icon +
      '<span class="pct">🃏 ' + have + ' / ' + list.length + '</span></div><div class="txt"><span class="nm">' + c.en + '</span><span class="nm-th">' + c.th + '</span><span class="ab">' + c.about + ' · ⚡ ' + c.rank + '</span>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div></div></button>'; }).join('');
  box.querySelectorAll('.cat').forEach(b => b.onclick = () => openCat(b.dataset.k));
}
function renderHow(){
  $('how-list').innerHTML = [
    '⚡ <b>Power 1–9</b> comes from a real fact: the biggest country, the longest dinosaur, the fastest vehicle… are 9s.',
    '🧠 <b>Quiz games</b> — <b>WisQuiz</b>: pick a category, learn 10 cards, then every right answer wins that card. 6 levels, 💀 Hardcore = type the name. <b>WisBuzz</b>: 2–4 players on one device, buzz first (Q · P · Z · M), a wrong answer freezes you for the next question, first to 7. <b>WisDaily</b>: 5 questions, the same for the family, one try a day.',
    '🔢 <b>Number games</b> (play with the cards you won) — <b>WisCount</b>: 🗄️ rack of 10 → hand of 5 (⚡ ≤ 15), a rule card flips each round. <b>WisJack</b>: get close to 20 with 3 side cards. Both vs 🤖 or 👥 a family player.',
    '📚 <b>Learn + store</b> — <b>WisLearn</b>: flip through a category — picture, English + Thai name, fun fact, ⚡ power. <b>WisStock</b>: your cards, grey ? for missing ones, duplicates make tiers 🥉 → 🌌 Cosmic (looks only). A full category = 🎓 professor costume.'].map(x => '<li>' + x + '</li>').join('');
}
function openCat(k){ if(SET.mode === 'buzz'){ BZ.cat = k; BZ.shelf = WC.CAT[k].shelf; openBuzzMenu(); } else if(SET.mode === 'daily') openDaily(); else if(SET.mode === 'count' || SET.mode === 'jack') openTableMenu(SET.mode); else if(SET.mode === 'quiz') openLevels(k); else if(SET.mode === 'book') openBook(k); else startLearn(k); }

/* ================= 📚 LEARN ================= */
function startLearn(k, at){
  const list = WC.cards(k); if(!list.length){ UI.toast('No cards here yet'); return; }
  L = {k, list, i: Math.max(0, Math.min(list.length - 1, at || 0))};
  const c = WC.CAT[k]; $('l-title').textContent = c.icon + ' ' + c.en + ' · ' + c.th;
  $('l-strip').innerHTML = list.map((cd, i) => '<button class="sc" data-i="' + i + '" data-sound="none" aria-label="' + UI.esc(cd.en) + '">' + cardHtml(cd, {mini: true}) + '</button>').join('');
  $('l-strip').querySelectorAll('.sc').forEach(b => b.onclick = () => showCard(Number(b.dataset.i), 0));
  view('learn'); showScreen('play'); showCard(L.i, 0); swipe();
}
function showCard(i, dir){
  if(!L) return; L.i = (i + L.list.length) % L.list.length; const cd = L.list[L.i], box = $('l-card');
  box.innerHTML = cardHtml(cd); box.classList.remove('go-l', 'go-r'); void box.offsetWidth; if(dir) box.classList.add(dir > 0 ? 'go-l' : 'go-r');
  $('l-count').textContent = (L.i + 1) + ' / ' + L.list.length; markSeen(cd.id);
  $('l-strip').querySelectorAll('.sc').forEach((b, j) => { b.classList.toggle('on', j === L.i); if(seenSet()[L.list[j].id]) b.classList.add('seen'); });
  const on = $('l-strip').querySelector('.sc.on'); if(on){ const st = $('l-strip'); if(st.__pr) st.__pr.lay(true); else { const x = on.offsetLeft - st.clientWidth / 2 + on.offsetWidth / 2; st.scrollTo({left: x, behavior: SPEED ? 'smooth' : 'auto'}); } }   /* 📏 p2: the strip shows the page with this card */
  const seen = L.list.filter(x => seenSet()[x.id]).length, c = WC.CAT[L.k];
  $('l-side').innerHTML = '<div class="lnote">📚 <b>' + c.en + '</b> · ' + c.about + '<br>⚡ Power = <b>' + c.rank + '</b> (' + c.rankTh + '): the smallest group is 1, the biggest is 9.' +
    '<div style="margin-top:6px">👀 Seen ' + seen + ' / ' + L.list.length + '</div><div class="bar"><i style="width:' + Math.round(seen * 100 / L.list.length) + '%"></i></div></div>' +
    '<div class="lnote">⌨️ ← → flip · Space = 🔊<br>👆 swipe the card on a phone</div>';
}
function flip(d){ UISound.play('tap'); showCard(L.i + d, d); }
function leaveLearn(){ pauseGame(); L = null; renderCats(); showScreen('menu'); }
function speakCard(){
  if(!L || !window.speechSynthesis) return; const cd = L.list[L.i];
  try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(cd.en + '. ' + cd.fact); u.rate = 0.95; speechSynthesis.speak(u);
    const th = (speechSynthesis.getVoices() || []).filter(v => /^th/i.test(v.lang || '')); if(th.length){ const t = new SpeechSynthesisUtterance(cd.th); t.voice = th[0]; t.lang = th[0].lang; t.rate = 0.9; speechSynthesis.speak(t); } }catch(e){}
}
function swipe(){
  const el = $('l-card'); if(el.dataset.sw) return; el.dataset.sw = 1; let x0 = null, y0 = 0;
  el.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; });
  el.addEventListener('pointerup', e => { if(x0 === null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) flip(dx < 0 ? 1 : -1); });
  el.addEventListener('pointercancel', () => { x0 = null; });
}
document.addEventListener('keydown', e => {
  if(Q && !$('v-quiz').classList.contains('hidden')){ if(e.target && e.target.tagName === 'INPUT') return; const n = Number(e.key); if(n >= 1 && n <= 8){ const b = $('q-box').querySelectorAll('.opt')[n - 1]; if(b && !b.disabled) b.click(); } else if(e.key === 'Enter'){ const nx = $('q-next'); if(nx) nx.click(); } return; }
  if(e.key === 'Escape' && BACK_TO[CUR_SCREEN] && !document.querySelector('.pop:not(.hidden),.lookaway:not(.hidden)')){ goBack(); return; }
  if(!L || $('scr-play').classList.contains('hidden')) return;
  if(e.key === 'ArrowRight'){ e.preventDefault(); flip(1); } else if(e.key === 'ArrowLeft'){ e.preventDefault(); flip(-1); } else if(e.key === ' '){ e.preventDefault(); speakCard(); } else if(e.key === 'Escape') leaveLearn();
});
window.feedbackContext = () => ({page: 'wisdeck', game: GAME_ID, level: Q ? Q.cat + ' ' + WD.LEVELS[Q.level].name : L ? L.k : ''});

/* ================= 🏠 ROOMS + 🧑 PODIUM ================= */
const ROOMS = {
  tent:   {name: 'Explorer tent', icon: '⛺', deco: ['🧭', '🗺️', '🔭', '🌿', '🦜'], pod: ['#8A5A33', '#5E3B1E']},
  sub:    {name: 'Submarine', icon: '🫧', deco: ['🐠', '🫧', '🐙', '⚓', '🐚'], pod: ['#F2B134', '#B5781A']},
  show:   {name: 'TV game show', icon: '📺', deco: ['🎤', '✨', '💡', '🎉', '⭐'], pod: ['#FF4FA3', '#9B1F6B']},
  lab:    {name: 'Time-machine lab', icon: '⏳', deco: ['⚙️', '⏰', '🧪', '🦴', '💡'], pod: ['#6C7A89', '#3C4650']},
  space:  {name: 'Space station', icon: '🛰️', deco: ['🪐', '⭐', '☄️', '🌙', '🚀'], pod: ['#4F5BD5', '#262D80']},
  temple: {name: 'Athena temple', icon: '🦉', deco: ['🦉', '🏛️', '📜', '🫒', '🏺'], pod: ['#E9DDB8', '#B39B60']}};
const SHELF_ROOM = {world: 'tent', time: 'lab', zoo: 'sub', science: 'space', made: 'temple'};
function roomFor(cat){ const r = ls(store('room')); return ROOMS[r] ? r : SHELF_ROOM[WC.CAT[cat].shelf] || 'tent'; }
function paintRoom(k){
  const el = $('q-room'); el.className = 'room ' + k; const R = ROOMS[k];
  el.innerHTML = R.deco.concat(R.deco).map((d, i) => '<span class="deco" style="left:' + ((i * 37 + 7) % 92) + '%;top:' + ((i * 53 + 11) % 80) + '%;animation-delay:-' + (i * 0.7).toFixed(1) + 's">' + d + '</span>').join('');
}
// professor look for the podium (plan section 9): the player's avatar + 🎓 costume step 1 (mortarboard + gown), only for this screen
function profAvatar(name){ const av = JSON.parse(JSON.stringify(myAvatar(name))); av.eq = Object.assign({}, av.eq || {}, {costume: {id: 'professor', v: 1, o: {}}}); return av; }
const OOPS = {k: 'oops', n: 'Oops', d: 1.4, f: p => ({armR: 2.3, armL: 0.4, rot: -0.08, eyes: 'closed', mouth: 'open', dy: Math.sin(p * Math.PI) * 3})};
const FLIP = {k: 'flip', n: 'Flip', d: 0.7, f: p => ({armR: 1.3 + Math.sin(p * Math.PI) * 1.5, armL: 0.35, rot: Math.sin(p * Math.PI) * 0.05, mouth: p > 0.5 ? 'open' : 'smile'})};   // 🃏 the hand goes up and flips a card over
function gestOf(k){ if(k === 'oops') return OOPS; if(k === 'flip') return FLIP; return (typeof GESTURES !== 'undefined' && GESTURES.find(g => g.k === k)) || null; }
const POD = {A: null, raf: 0, t0: 0};
function podStart(){
  POD.A = {name: S.player, av: profAvatar(S.player), dir: 1, walkT: 0, gest: null, until: 0}; POD.t0 = performance.now();
  if(POD.raf) cancelAnimationFrame(POD.raf);
  const loop = now => { POD.raf = requestAnimationFrame(loop); if($('v-quiz').classList.contains('hidden')) return; podDraw(now); };
  POD.raf = requestAnimationFrame(loop);
}
function podStop(){ if(POD.raf) cancelAnimationFrame(POD.raf); POD.raf = 0; }
function podGesture(k){ if(!POD.A) return; const g = gestOf(k); POD.A.gest = g ? {g, t: 0} : null; }
function podDraw(now){
  const A = POD.A; if(!A) return; const t = Math.max(0, now - POD.t0) / 1000, dt = Math.min(0.05, (now - (POD.last || now)) / 1000); POD.last = now;
  if(A.gest){ A.gest.t += dt; if(A.gest.t >= A.gest.g.d) A.gest = null; }
  if(!A.gest && Q && !Q.over && Q.qs[Q.i]) A.gest = {g: gestOf('think') || OOPS, t: 0.4};   // thinking while the question is up
  [['q-pod', 1], ['q-mypod', 0]].forEach(([id, big]) => { const c = $(id); if(!c || !c.offsetWidth) return; const g = c.getContext('2d'), W = c.width, H = c.height; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    const R = ROOMS[Q ? Q.room : 'tent'] || ROOMS.tent;
    if(big){ const pw = W * 0.62, ph = H * 0.3, px = (W - pw) / 2, py = H - ph; g.fillStyle = R.pod[1]; g.beginPath(); g.roundRect(px - 6, py - 10, pw + 12, 18, 8); g.fill();
      const gr = g.createLinearGradient(0, py, 0, H); gr.addColorStop(0, R.pod[0]); gr.addColorStop(1, R.pod[1]); g.fillStyle = gr; g.beginPath(); g.roundRect(px, py, pw, ph, 10); g.fill();
      g.fillStyle = '#FFC845'; g.font = '700 ' + Math.round(W * 0.075) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('WisDeck', W / 2, py + ph * 0.45);
      const P = avatarPlace(A.av, A.name, W, py + 4, W / 2, py + 2, 4, ['cheer', 'think', 'jump', 'dance']); try{ drawAvatar(g, A, P.x, P.y, P.k, {t}); }catch(e){} }
    else { const P = avatarPlace(A.av, A.name, W, H, W / 2, H - 4, 4, ['cheer', 'think']); try{ drawAvatar(g, A, P.x, P.y, P.k, {t}); }catch(e){} } });
}

/* ================= 🎚️ LEVELS ================= */
const AGE_START = {'4-5': 0, '6-7': 0, '8-9': 1, '10+': 2};
const LEARN_NEED = 10;   // flip through 10 cards of a category in 📚 Learn → its quiz opens
function progressOf(name){ return S.progress[name] || {unlocked: 0, best: []}; }
function unlockedOf(name){ return Math.max(progressOf(name).unlocked || 0, Number(ls('sp_wisdeck_won:' + name)) || 0); }
function canPlay(i){ const u = unlockedOf(S.player); if(i === 5) return u >= 5; if(i === 4) return u >= 4; return i <= Math.max(u, AGE_START[S.age] || 0); }
function seenIn(cat){ const s = seenSet(); return WC.cards(cat).filter(c => s[c.id]).length; }
function quizOpen(cat){ return seenIn(cat) >= LEARN_NEED; }
let CUR = null;   // category on the level screen
function openLevels(cat){
  CUR = cat; const c = WC.CAT[cat]; $('lv-ic').textContent = c.icon; $('lv-name').textContent = '🧠 ' + c.en + ' quiz'; $('lv-th').textContent = c.th + ' · ' + c.about;
  const seen = seenIn(cat), open = quizOpen(cat);
  $('lv-note').innerHTML = open ? '🃏 Every right answer wins that card for your deck · you have ' + WD.catCount(S.deck, WC.cards(cat)) + ' / ' + WC.cards(cat).length :
    '📚 Learn first! Flip through ' + LEARN_NEED + ' cards of ' + c.en + ' to open its quiz (' + seen + ' / ' + LEARN_NEED + ').<br><button class="btn sp-btn sp-primary gold" data-sound="pop" onclick="startLearn(\'' + cat + '\')">📚 Learn ' + c.en + '</button>';
  const p = progressOf(S.player);
  $('level-list').innerHTML = WD.LEVELS.map((L, i) => { const lock = !open || !canPlay(i), b = (p.best || [])[i];
    const sub = (L.typed ? '⌨️ type the name (💡 8 choices = ½ points) · one life' : L.choices + ' choices') + ' · ' + (L.timer ? '⏱️ ' + L.timer + ' s' : 'no timer') + ' · ' + (L.items >= 40 ? 'all cards' : 'top ' + L.items) + ' · ×' + L.mult;
    return '<button class="lvl' + (lock ? ' lock' : '') + (i === 5 ? ' hc' : '') + '" data-i="' + i + '" data-sound="' + (lock ? 'none' : 'pop') + '"><div class="big">' + L.icon + '</div><div class="nm">' + L.name + '</div><div class="sub">' + sub + '</div>' +
      (b && b.score ? '<div class="best">🏆 ' + Number(b.score).toLocaleString() + ' ' + '⭐'.repeat(b.stars || 0) + '</div>' : '') + '</button>'; }).join('');
  $('level-list').querySelectorAll('.lvl').forEach(b => b.onclick = () => { const i = Number(b.dataset.i);
    if(!open){ UISound.play('error'); UI.toast('📚 Learn ' + LEARN_NEED + ' cards first'); return; }
    if(!canPlay(i)){ UISound.play('error'); UI.toast(i === 5 ? '💀 Hardcore opens after you pass Extreme' : '🔒 Pass the level before first'); return; }
    chooseLevel(i); });   /* 🧱 b3w4: a tap picks */
  { let i = -1; try{ i = Number(ls(store('lv'))); }catch(e){} const rec = AGE_START[S.age] || 0; if(!(i >= 0 && canPlay(i))) i = canPlay(rec) ? rec : Math.max(0, [0, 1, 2, 3, 4, 5].filter(canPlay).pop() || 0); chosenLevel = i; markPicks(); }
  const rk = roomFor(cat);
  $('room-list').innerHTML = Object.keys(ROOMS).map(k => '<button class="chip' + (k === rk ? ' on' : '') + '" data-k="' + k + '" data-sound="tap">' + ROOMS[k].icon + ' ' + ROOMS[k].name + '</button>').join('');
  $('room-list').querySelectorAll('.chip').forEach(b => b.onclick = () => { ls(store('room'), b.dataset.k); $('room-list').querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); });
  $('pts-list').innerHTML = ['✅ Right = 100 × level bonus (🌱 ×1 · 🐣 ×1.5 · 🔦 ×2 · ⚡ ×3 · 🌋 ×4 · 💀 ×5)', '⚡ Fast answer +20 % · 🔥 answers in a row ×1.1 … ×2', '⭐ 60 % right · ⭐⭐ 85 % · ⭐⭐⭐ all right', '🃏 Each right answer wins that card. Win it again → duplicates → 🥉 Bronze → 🥈 → 🥇 → 💠 → 💎 → 🌌 Cosmic (looks only)',
    'Questions: ' + Object.keys(WD.QTYPES).map(k => WD.QTYPES[k].icon + ' ' + WD.QTYPES[k].name).join(' · ')].map(x => '<li>' + x + '</li>').join('');
  if(window.UI && UI.leaders) UI.leaders($('lv-leaders'), GAME_ID, S.player);
  showScreen('levels');
}

/* 🧱 b3w4 (Game Baseline): the WisQuiz level screen is a setup page — 🎚️ level → 🏠 room → ⚙️ options → ▶ Start */
let chosenLevel = 0;
function chooseLevel(i){ chosenLevel = i; ls(store('lv'), String(i)); markPicks(); const w = $('lv-opt-head'); if(w && w.scrollIntoView) w.scrollIntoView({behavior: 'smooth', block: 'center'}); }
function markPicks(){
  const open = CUR && quizOpen(CUR), st = $('btn-start');
  $('level-list').querySelectorAll('.lvl').forEach(b => { const on = open && Number(b.dataset.i) === chosenLevel; b.classList.toggle('sel', on); if(window.GF && GF.pick) GF.pick(b, on); });
  if(!st || !CUR) return; const L = WD.LEVELS[chosenLevel], c = WC.CAT[CUR];
  st.textContent = open ? '▶ Start · ' + L.icon + ' ' + L.name + ' · ' + c.icon + ' ' + c.en : '📚 Learn ' + c.en + ' first';
}
function startSetup(){ if(!CUR) return; if(!quizOpen(CUR)){ startLearn(CUR); return; } if(!canPlay(chosenLevel)){ UISound.play('error'); UI.toast('Pick a level that is open 🔓'); return; } startQuiz(CUR, chosenLevel); }

/* ================= 🧠 QUIZ ================= */
let Q = null, QT = null, QID = 0;
function view(v){ cheerView(v); /* 📣 cs-3c */ ['learn', 'quiz', 'table', 'buzz'].forEach(x => $('v-' + x).classList.toggle('hidden', x !== v)); }
function startQuiz(cat, lv){
  Q = WD.makeQuiz(WC, {cat, level: lv, seed: (Date.now() ^ (Math.random() * 1e9)) >>> 0}); Q.room = roomFor(cat); Q.gid = ++QID; Q.wonFresh = 0;
  const c = WC.CAT[cat], L = WD.LEVELS[lv]; $('q-title').textContent = c.icon + ' ' + c.en + ' · ' + L.icon + ' ' + L.name;
  paintRoom(Q.room); $('q-res').classList.add('hidden'); view('quiz'); showScreen('play'); podStart(); renderQ();
}
function hud(){ $('q-n').textContent = Math.min(Q.i + 1, Q.qs.length) + ' / ' + Q.qs.length; $('q-streak').textContent = '🔥 ' + Q.streak; $('q-score').textContent = '🏆 ' + Q.score.toLocaleString(); $('q-deck').textContent = '🃏 ' + Q.won.length; }
function C(id){ return WC.card(id); }
function nameHtml(cd){ return UI.esc(cd.en) + '<span class="th">' + UI.esc(cd.th) + '</span>'; }
function bigPic(cd){ return '<div class="qpic">' + WC.picHtml(cd) + '</div>'; }
function askText(cd){
  const k = cd.cat;
  if(k === 'wisflag') return ['Which country has this flag?', 'ธงนี้เป็นของประเทศอะไร'];
  if(k === 'wisshape') return ['Which country has this shape?', 'ประเทศไหนมีรูปร่างแบบนี้'];
  if(k === 'wismap') return ['Which country is red on the map?', 'ประเทศสีแดงคือประเทศอะไร'];
  if(k === 'wiscapital'){ const co = WC.countryOf(cd); return ['What is the capital of ' + co.en + '?', 'เมืองหลวงของ' + co.th + 'คือ']; }
  if(k === 'wischem') return ['Which substance has this formula?', 'สูตรนี้คือสารอะไร'];
  return ['What is this?', 'นี่คืออะไร'];
}
function renderQ(){
  hud(); const q = Q.qs[Q.i], cd = C(q.card), L = WD.LEVELS[Q.level], box = $('q-box'); if(!q) return;
  q.t0 = performance.now(); q.done = false; Q.gid = ++QID;
  let h = '<div class="qtype"><span>' + WD.QTYPES[q.type].icon + ' ' + WD.QTYPES[q.type].name + '</span><span>⚡ ' + WC.CAT[cd.cat].rank + '</span></div><div class="qprompt">';
  const t = askText(cd);
  if(q.type === 'pic' || q.type === 'formula') h += bigPic(cd) + '<div class="qt">' + t[0] + '</div><div class="qt-th">' + t[1] + '</div>';
  else if(q.type === 'name') h += '<div class="qt">Which one is ' + UI.esc(cd.en) + '?</div><div class="qt-th">อันไหนคือ ' + UI.esc(cd.th) + '</div>';
  else if(q.type === 'listen') h += '<button class="btn sp-btn sp-primary gold" data-sound="none" onclick="sayQ()">🔊 Listen again</button><div class="qt">' + (q.tune ? 'Listen! Which instrument is playing?' : 'Listen! Which one is it?') + '</div><div class="qt-th">' + (q.tune ? 'ฟังเสียง แล้วทายเครื่องดนตรี' : 'ฟังแล้วเลือกให้ถูก') + '</div>';
  else if(q.type === 'fact') h += '<div class="qfact">💬 ' + UI.esc(q.text) + '<span class="th">' + UI.esc(WD.maskName(cd.factTh, {en: cd.th})) + '</span></div><div class="qt">Who or what is it?</div>';
  else if(q.type === 'tf'){ const sh = C(q.shown); h += (q.uni ? bigPic(cd) : '<div class="qfact">💬 ' + UI.esc(q.text) + '</div>') + '<div class="qt">' + (q.uni ? 'Is this ' : 'Is it ') + UI.esc(sh.en) + '?</div><div class="qt-th">ใช่ ' + UI.esc(sh.th) + ' ไหม</div>'; }
  else if(q.type === 'order') h += '<div class="qt">Put them in order: smallest ' + WC.CAT[cd.cat].rank + ' first</div><div class="qt-th">เรียงจาก' + WC.CAT[cd.cat].rankTh + 'น้อยไปมาก</div>';
  else if(q.type === 'odd') h += '<div class="qt">Which one is NOT in ' + WC.CAT[cd.cat].en + ' (' + WC.CAT[cd.cat].about + ')?</div><div class="qt-th">อันไหนไม่ใช่' + WC.CAT[cd.cat].th + '</div>';
  else if(q.type === 'map'){ const co = cd.cat === 'wiscapital' ? WC.countryOf(cd) : {en: cd.en, th: cd.th}; h += '<div class="qt">' + (cd.cat === 'wiscapital' ? 'Tap the country whose capital is ' + UI.esc(cd.en) : 'Tap ' + UI.esc(co.en) + ' on the map!') + '</div><div class="qt-th">แตะ' + UI.esc(co.th) + 'บนแผนที่</div>'; }
  else if(q.type === 'type') h += (WD.picsUnique([cd]) && WC.cards(cd.cat).filter(x => (x.pk || x.pic) === (cd.pk || cd.pic)).length === 1 ? bigPic(cd) + '<div class="qt">' + t[0] + '</div>' : '<div class="qfact">💬 ' + UI.esc(WD.maskName(cd.fact, cd)) + '</div><div class="qt">Type its name</div>');
  h += '</div><div id="q-ans"></div><div id="q-after"></div>';
  box.innerHTML = h; renderAnswers(q);
  if(q.type === 'listen') setTimeout(sayQ, 250 * SPEED);
  startTimer();
}
function optBtn(id, pic, i){ const cd = C(id); return '<button class="opt' + (pic ? ' pic' : '') + '" data-id="' + id + '" data-sound="tap">' + (pic ? WC.picHtml(cd) : nameHtml(cd)) + '</button>'; }
function renderAnswers(q){
  const box = $('q-ans'), n = (q.options || []).length;
  if(['pic', 'formula', 'fact'].includes(q.type) || (q.type === 'type' && q.hint)){ box.innerHTML = '<div class="opts n' + n + '">' + q.options.map(id => optBtn(id, false)).join('') + '</div>'; }
  else if(q.type === 'name' || q.type === 'listen'){ box.innerHTML = '<div class="opts n' + n + '">' + q.options.map(id => optBtn(id, !q.tune)).join('') + '</div>'; }   // 🎺 instrument sounds → answer with names
  else if(q.type === 'odd'){ box.innerHTML = '<div class="opts n4">' + q.options.map(id => { const cd = C(id); return '<button class="opt pic" data-id="' + id + '" data-sound="tap">' + WC.picHtml(cd) + '<span>' + UI.esc(cd.en) + '</span></button>'; }).join('') + '</div>'; }
  else if(q.type === 'tf'){ box.innerHTML = '<div class="tf"><button class="opt" data-tf="1" data-sound="tap">✅ True<span class="th">ใช่</span></button><button class="opt" data-tf="0" data-sound="tap">❌ False<span class="th">ไม่ใช่</span></button></div>'; }
  else if(q.type === 'order'){ q.pick = []; box.innerHTML = '<div class="opts n' + (n === 3 ? 3 : 4) + '">' + q.options.map(id => { const cd = C(id); return '<button class="opt pic ord" data-id="' + id + '" data-sound="tap">' + WC.picHtml(cd) + '<span>' + UI.esc(cd.en) + '</span></button>'; }).join('') + '</div><div style="text-align:center;margin-top:8px"><button class="btn sp-btn sp-primary" id="q-ord-ok" data-sound="pop" disabled>✅ Check</button></div>'; }
  else if(q.type === 'map'){ box.innerHTML = '<div class="mapbox" id="q-map"><img alt="world map" draggable="false" src="' + worldUri() + '"></div>'; }
  else if(q.type === 'type'){ const cd = C(q.card); box.innerHTML = '<div class="typebox"><div class="slots" id="q-slots"></div><input id="q-in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the name (English or Thai)"><div class="row"><button class="btn sp-btn sp-primary" data-sound="pop" id="q-type-ok">✅ Check</button><button class="btn soft sp-btn sp-secondary" data-sound="none" id="q-hint">💡 8 choices (½ points)</button></div></div>';
    const fill = () => { const v = $('q-in').value, w = cd.en; let j = 0; $('q-slots').innerHTML = [...w].map((ch, i) => { if(/\s/.test(ch)) return '<span class="sp"></span>'; if(!/[a-z0-9]/i.test(ch)) return '<span>' + UI.esc(ch) + '</span>'; const typed = v.replace(/[^a-z0-9]/gi, '')[j++]; return '<span class="' + (i === 0 && !typed ? 'f' : '') + '">' + UI.esc(typed || (i === 0 ? ch : '')) + '</span>'; }).join(''); };
    fill(); $('q-in').oninput = fill; $('q-in').onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); submit($('q-in').value); } };
    $('q-type-ok').onclick = () => submit($('q-in').value);
    $('q-hint').onclick = () => { if(WD.useHint(Q)){ UISound.play('tap'); renderAnswers(q); } };
    setTimeout(() => { try{ $('q-in').focus({preventScroll: true}); }catch(e){} }, 50); return; }
  box.querySelectorAll('.opt[data-id]').forEach(b => b.onclick = () => {
    if(q.done) return;
    if(q.type === 'order'){ const id = b.dataset.id, k = q.pick.indexOf(id); if(k >= 0) q.pick.splice(k, 1); else q.pick.push(id);
      box.querySelectorAll('.opt').forEach(x => { const j = q.pick.indexOf(x.dataset.id); let nm = x.querySelector('.num'); if(j < 0){ if(nm) nm.remove(); } else { if(!nm){ nm = document.createElement('span'); nm.className = 'num'; x.appendChild(nm); } nm.textContent = j + 1; } });
      $('q-ord-ok').disabled = q.pick.length !== q.options.length; return; }
    submit(b.dataset.id, b); });
  box.querySelectorAll('.opt[data-tf]').forEach(b => b.onclick = () => submit(b.dataset.tf === '1', b));
  if(q.type === 'order') $('q-ord-ok').onclick = () => submit(q.pick.slice());
  if(q.type === 'map') $('q-map').onclick = e => { const r = $('q-map').getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 1000, y = (e.clientY - r.top) / r.height * 420; submit(mapPick(x, y, q.cc), null, {x, y}); };
}
let WORLD_URI = '';
function worldUri(){ return WORLD_URI || (WORLD_URI = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(WC.mapSvg('', {world: true}))); }
function mapPick(x, y, want){ const hit = WC.countryAt(x, y); if(hit) return hit; const c = WC.centerOf(want); return c && Math.hypot(c[0] - x, c[1] - y) <= 14 ? want : ''; }   // a near miss on a tiny country counts
function sayQ(){ const q = Q && Q.qs[Q.i]; if(!q) return; const cd = C(q.card); if(q.tune){ playTune(cd); return; } try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(cd.en); u.rate = 0.9; speechSynthesis.speak(u); }catch(e){} }
function startTimer(){
  const L = WD.LEVELS[Q.level], bar = $('q-tbar'); bar.style.visibility = L.timer ? 'visible' : 'hidden'; if(QT) cancelAnimationFrame(QT); if(!L.timer) return;
  const gid = Q.gid, t0 = performance.now(), tick = now => { if(!Q || Q.gid !== gid || Q.qs[Q.i] && Q.qs[Q.i].done) return; const left = 1 - Math.max(0, now - t0) / (L.timer * 1000); $('q-tfill').style.transform = 'scaleX(' + Math.max(0, left) + ')';
    if(left <= 0){ if(SPEED) submit(null, null, {timeout: true}); return; } QT = requestAnimationFrame(tick); };
  $('q-tfill').style.transform = 'scaleX(1)'; QT = requestAnimationFrame(tick);
}
function submit(ans, btn, extra){
  const q = Q && Q.qs[Q.i]; if(!q || q.done || Q.over && Q.i >= Q.qs.length) return; q.done = true; if(QT) cancelAnimationFrame(QT);
  extra = extra || {}; const secs = (performance.now() - q.t0) / 1000, cd = C(q.card), gid = Q.gid;
  const res = WD.answer(Q, ans, {secs, timeout: extra.timeout}, WC); hud(); cheerSay(res.ok ? 'goal' : 'miss', 0); /* 📣 cs-3c */
  const box = $('q-box');
  // show what was right
  box.querySelectorAll('.opt').forEach(b => { b.disabled = true; const id = b.dataset.id;
    if(q.type === 'tf'){ if((b.dataset.tf === '1') === q.answer) b.classList.add('right'); else if(b === btn) b.classList.add('wrong'); return; }
    if(q.type === 'order'){ const j = q.answer.indexOf(id); let nm = b.querySelector('.num'); if(!nm){ nm = document.createElement('span'); nm.className = 'num'; b.appendChild(nm); } nm.textContent = j + 1; b.classList.add(res.ok ? 'right' : (q.pick[j] === id ? 'right' : 'wrong')); b.insertAdjacentHTML('beforeend', '<span class="vv">' + UI.esc(WC.valueText(C(id))) + '</span>'); return; }
    if(id === q.answer) b.classList.add('right'); else if(b === btn) b.classList.add('wrong'); });
  if(q.type === 'map'){ const m = $('q-map'), c = WC.centerOf(q.cc); if(extra.x != null) m.insertAdjacentHTML('beforeend', '<span class="pin" style="left:' + (extra.x / 10) + '%;top:' + (extra.y / 4.2) + '%">' + (res.ok ? '📍' : '❌') + '</span>');
    if(c) m.insertAdjacentHTML('beforeend', '<span class="ring" style="left:' + (c[0] / 10) + '%;top:' + (c[1] / 4.2) + '%"></span>'); }
  if(q.type === 'map') mapRide(q.cc, extra, res.ok);
  if(q.type === 'type'){ const i = $('q-in'); if(i){ i.disabled = true; i.style.borderColor = res.ok ? '#1FA463' : '#E5484D'; } }
  const learn = '<div class="qlearn">' + (res.ok ? '✅ ' : extra.timeout ? '⏱️ Time! ' : '❌ It was ') + '<b>' + UI.esc(cd.en) + '</b> <span class="th">' + UI.esc(cd.th) + '</span> · ' + WC.valueIcon(cd) + ' ' + UI.esc(WC.valueText(cd)) + ' · ⚡ ' + cd.power + '</div>';
  $('q-after').innerHTML = learn + (res.over ? '' : '<div style="text-align:center;margin-top:8px"><button class="btn sp-btn sp-primary qnext" data-sound="pop" id="q-next">▶ Next</button></div>') + (res.over ? '<div style="text-align:center;margin-top:8px"><button class="btn sp-btn sp-primary qnext gold" data-sound="pop" id="q-next">🏁 See my cards</button></div>' : '');
  $('q-next').onclick = () => next(gid);
  if(res.ok){ UISound.play('success'); podGesture(Q.streak >= 3 ? 'jump' : 'cheer'); if(FX){ floatPts('+' + res.points + (res.fast ? ' ⚡' : '') + (Q.streak >= 2 ? ' 🔥' + Q.streak : ''), btn || $('q-box')); flyCard(q.win, btn || $('q-box')); }
    if(!res.over) setTimeout(() => next(gid), 1500 * SPEED); }
  else { UISound.play('error'); podGesture('oops'); }
}
// 🗺️ WisMap: your avatar rides to the right country (your own ride-on, or a borrowed one just for the trip)
function mapRide(cc, extra, ok){
  const m = $('q-map'), c = WC.centerOf(cc); if(!m || !c || !FX) return; const cv = document.createElement('canvas'), r = m.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;'; m.appendChild(cv);
  const av = JSON.parse(JSON.stringify(myAvatar(S.player))); av.eq = av.eq || {}; if(!av.eq.ride) av.eq.ride = {id: 'rideon', v: 0, o: {}};
  const A = {name: S.player, av, dir: 1, walkT: 0, gest: null}, g = cv.getContext('2d'), W = cv.width, H = cv.height, k = H / 420 * 0.55;
  const x0 = (extra && extra.x != null ? extra.x : 60) / 1000 * W, y0 = (extra && extra.y != null ? extra.y : 380) / 420 * H, x1 = c[0] / 1000 * W, y1 = c[1] / 420 * H, t0 = performance.now(), dur = 1400 * Math.max(0.01, SPEED);
  A.dir = x1 >= x0 ? 1 : -1;
  const step = now => { const p = Math.min(1, Math.max(0, now - t0) / dur), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2, x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e - Math.sin(p * Math.PI) * H * 0.08;
    A.walkT = p * 6; if(p >= 1 && !A.gest) A.gest = {g: gestOf(ok ? 'cheer' : 'wave') || OOPS, t: 0}; if(A.gest) A.gest.t += 0.016;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); try{ drawAvatar(g, A, x, y, k, {t: now / 1000}); }catch(e){}
    if(p < 1 || (A.gest && A.gest.t < 1.6)) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function next(gid){ if(!Q || Q.gid !== gid) return; Q.gid = ++QID; if(Q.over){ finishQuiz(); return; } renderQ(); }
function floatPts(txt, el){ const r = el.getBoundingClientRect(), f = document.createElement('div'); f.className = 'floatpts'; f.textContent = txt; f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = (r.top + 10) + 'px'; document.body.appendChild(f); setTimeout(() => f.remove(), 1100); }
// 🃏 card win: the card flips face up, then flies into the 🃏 counter
function flyCard(id, el){
  const cd = C(id); if(!cd) return; const from = el.getBoundingClientRect(), to = $('q-deck').getBoundingClientRect(), f = document.createElement('div'); f.className = 'winfly';
  f.innerHTML = cardHtml(cd, {mini: true}); document.body.appendChild(f);
  const x0 = from.left + from.width / 2 - 55, y0 = from.top + from.height / 2 - 77, x1 = to.left + to.width / 2 - 55, y1 = to.top + to.height / 2 - 77;
  const a = f.animate([{transform: `translate(${x0}px,${y0}px) rotateY(180deg) scale(.6)`, opacity: 0}, {transform: `translate(${x0}px,${y0 - 40}px) rotateY(0) scale(1.1)`, opacity: 1, offset: 0.35},
    {transform: `translate(${x0}px,${y0 - 40}px) rotateY(0) scale(1.1)`, offset: 0.6}, {transform: `translate(${x1}px,${y1}px) scale(.2)`, opacity: .4}], {duration: 1200, easing: 'ease-in-out'});
  a.onfinish = () => { f.remove(); const d = $('q-deck'); d.animate([{transform: 'scale(1.3)'}, {transform: 'scale(1)'}], {duration: 250}); };
}
function leaveQuiz(to){ if(window.Cheer) Cheer.unmount(); const wasDaily = Q && Q.daily; if(QT) cancelAnimationFrame(QT); podStop(); try{ speechSynthesis.cancel(); }catch(e){} Q = null; view('learn'); if(to === 'daily' || wasDaily) openDaily(); else openLevels(CUR || L && L.k || 'wisflag'); }

/* ================= 🏁 RESULT + SAVE ================= */
function finishQuiz(){
  if(QT) cancelAnimationFrame(QT); if(Q.daily) return finishDaily(); const r = WD.result(Q), lv = Q.level, cat = Q.cat, name = S.player;
  const got = WD.winCards(S.deck, r.won, lv, WC), full = WD.fullCats(S.deck, WC);
  S.deck.full = full; S.deck.tot = S.deck.tot || {}; S.deck.tot[cat] = WC.cards(cat).length;
  podGesture(r.stars >= 3 ? 'dance' : r.stars ? 'cheer' : 'oops'); cheerQuizEnd(r); /* 📣 cs-3c */ if(r.stars) UISound.play('win'); else UISound.play('error');
  if(r.cleared) ls('sp_wisdeck_won:' + name, Math.max(Number(ls('sp_wisdeck_won:' + name)) || 0, Math.min(5, lv + 1)));
  const uniq = [...new Set(r.won)], tierUp = {}; got.ups.forEach(u => { tierUp[u.id] = u.tier; });
  const L = WD.LEVELS[lv], c = WC.CAT[cat];
  $('t-res').innerHTML = ''; $('t-res').classList.add('hidden');
  $('q-res').innerHTML = '<div class="card" id="q-res-card"></div>';   /* 🧱 b3w4: the shared 🏁 card */
  GF.result({wrap: $('q-res'), card: $('q-res-card'), win: r.stars > 0, icon: r.stars >= 3 ? '🏆' : r.stars ? '🎉' : Q.wrong && L.oneLife ? '💀' : '💪', title: r.stars ? 'Well done, ' + name + '!' : Q.wrong && L.oneLife ? 'One life — out!' : 'Keep learning!',
    sub: c.icon + ' ' + c.en + ' · ' + L.icon + ' ' + L.name, stars: r.stars, score: r.score, stats: [['✅', r.right + ' / ' + r.total + ' right'], ['🔥', 'best ' + r.bestStreak + ' in a row'], ['🃏', r.won.length + ' won']],
    save: 'Saving…', buddy: {name, av: myAvatar(name)}, confetti: false,
    levels: () => leaveQuiz(), levelsText: '🎚️ Levels', again: () => startQuiz(cat, lv), againText: '🔁 Again', extra: [{text: '📖 WisStock', fn: () => openBook(cat)}],
    next: r.cleared && lv < 5 ? () => { if(!canPlay(lv + 1)){ UISound.play('error'); UI.toast('🔒 Pass this level first'); return; } chosenLevel = lv + 1; ls(store('lv'), String(lv + 1)); startQuiz(cat, lv + 1); } : null, nextText: lv === 4 ? 'Try 💀 Hardcore ▶' : 'Next level ▶'});
  { const row = $('q-res-card').querySelector('.gf-r-btns'); if(row){ const d = document.createElement('div'); d.className = 'b3-more';
    d.innerHTML = (uniq.length ? '<div><b>🃏 Cards won</b> (' + r.won.length + ')</div><div class="won">' + uniq.map(id => { const cd = C(id), d = WD.dupsOf(S.deck, id); return '<div class="w">' + (got.fresh.includes(id) ? '<span class="tag">NEW</span>' : tierUp[id] != null ? '<span class="tag">' + WC.TIERS[tierUp[id]].icon + ' UP</span>' : '') + cardHtml(cd, {mini: true, tier: WC.tierOf(d)}) + '</div>'; }).join('') + '</div>' : '<div>No cards this time — 📚 Learn and try again!</div>') +
    (full.includes(cat) ? '<div><b>🎓 ' + c.en + ' is full!</b> Professor costume step unlocked in your Wardrobe.</div>' : '') +
      (full.includes(cat) ? '<div><b>🎓 ' + c.en + ' is full!</b> Professor costume step unlocked in your Wardrobe.</div>' : '') +
      (!r.stars ? '<div class="save-note">💡 Tip: open 📚 Learn and read the ⚡ power line — it tells you the fact behind every card.</div>' : '');
    row.parentNode.insertBefore(d, row); } }
  [['btn-levels', 'b-menu'], ['btn-again', 'b-again'], ['btn-next', 'b-next']].forEach(([x, y]) => { const e = $(x); if(e) e.id = y; });   // the old ids
  $('q-res').classList.remove('hidden');
  saveRun(name, lv, {score: r.score, stars: r.stars, theme: c.icon + ' ' + c.en, cleared: r.cleared, stats: {games: 1, right: r.right, bestStreak: r.bestStreak}}, 0);
  saveDeck(name, {won: r.won, lv, full, tot: S.deck.tot, cosmic: cosmicCount()}, 1);
  Q.over = true;
}
function cosmicCount(){ return Object.keys(S.deck.cards).filter(id => WC.tierOf(WD.dupsOf(S.deck, id)) >= 5).length; }
const PENDING_KEY = 'sp_wisdeck_pending', NOTES = [];
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function flushPending(){ const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => { const r = google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))); if(w.deck) r.saveWisDeck(w.name, w.deck); else if(w.feats) r.saveFeats(w.name, w.gid, w.feats); else r.saveLevelResult(w.gid || GAME_ID, w.name, w.lvl, w.extra); }); }
function putNote(i, html){ NOTES[i] = html; const n = $('save-note'); if(n) n.innerHTML = NOTES.filter(Boolean).join('<br>'); }
function featText(fe, base){ let h = base || ''; if(fe){ (fe.newTitles || []).forEach(t => { h += '<br>🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name); }); (fe.newBadges || []).forEach(b => { h += '<br>' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName; }); } return h; }
function saveRun(name, lvl, extra, seat, tries, gid){
  tries = tries || 0; gid = gid || GAME_ID; if(!tries) NOTES.length = 0; const PR = gid === 'wiscount' ? (S.progressCount = S.progressCount || {}) : gid === 'wisjack' ? (S.progressJack = S.progressJack || {}) : S.progress, p = PR[name] || (PR[name] = {unlocked: 0, best: []});
  google.script.run.withSuccessHandler(res => { const best = (p.best || []).slice(); if(res.best) best[lvl] = res.best; PR[name] = {unlocked: res.unlocked, tokens: res.tokens, best}; flushPending();
      putNote(seat, res.newBadge ? '🏅 New badge: ' + UI.esc(res.newBadge) : res.newHighScore && !res.firstTime ? '🎉 New high score!' : '✅ Score saved'); })
    .withFailureHandler(() => { if(tries < 1){ setTimeout(() => saveRun(name, lvl, extra, seat, tries + 1, gid), 1200); return; } writePending(readPending().concat([{name, lvl, extra, gid}])); putNote(seat, '⚠️ Could not save yet — it will be sent next time.'); })
    .saveLevelResult(gid, name, lvl, extra);
}
function saveDeck(name, deck, seat, tries){
  tries = tries || 0;
  google.script.run.withSuccessHandler(res => { if(res && res.deck){ S.settings['Deck_' + name] = JSON.stringify(res.deck); } putNote(seat, featText(res && res.feats, '🃏 Deck saved' + (res && res.deck ? ' (' + Object.keys(res.deck.cards).length + ' cards)' : ''))); })
    .withFailureHandler(() => { if(tries < 1){ setTimeout(() => saveDeck(name, deck, seat, tries + 1), 1200); return; } writePending(readPending().concat([{name, deck}])); putNote(seat, '⚠️ Deck will be sent next time.'); })
    .saveWisDeck(name, deck);
}

/* ================= 📖 DECK BOOK ================= */
let BOOK = {shelf: 'world', cat: 'wisflag'};
function openBook(cat){
  if(QT) cancelAnimationFrame(QT); podStop(); Q = null;
  if(cat && WC.CAT[cat]){ BOOK.cat = cat; BOOK.shelf = WC.CAT[cat].shelf; }
  const all = WC.all(), have = all.filter(c => WD.owned(S.deck, c.id)), tiers = [0, 0, 0, 0, 0, 0]; have.forEach(c => tiers[WC.tierOf(WD.dupsOf(S.deck, c.id))]++);
  $('book-who').textContent = S.player + '\'s cards'; const full = WD.fullCats(S.deck, WC);
  $('book-top').innerHTML = '<span>🃏 ' + have.length + ' / ' + all.length + '</span><span>🎓 ' + full.length + ' full</span>' + WC.TIERS.map((t, i) => '<span title="' + t.en + '">' + t.icon + ' ' + tiers[i] + '</span>').join('');
  $('book-shelves').innerHTML = WC.SHELVES.map(s => { const l = WC.catsOf(s.k).reduce((a, c) => a.concat(WC.cards(c.k)), []), n = WD.catCount(S.deck, l);
    return '<button class="chip' + (s.k === BOOK.shelf ? ' on' : '') + '" data-k="' + s.k + '" data-sound="tap">' + s.icon + ' ' + s.en + ' <span class="th">' + Math.round(n * 100 / l.length) + '%</span></button>'; }).join('');
  $('book-shelves').querySelectorAll('.chip').forEach(b => b.onclick = () => { BOOK.shelf = b.dataset.k; BOOK.cat = WC.catsOf(BOOK.shelf)[0].k; openBook(); });
  if(WC.CAT[BOOK.cat].shelf !== BOOK.shelf) BOOK.cat = WC.catsOf(BOOK.shelf)[0].k;
  $('book-cats').innerHTML = WC.catsOf(BOOK.shelf).map(c => { const l = WC.cards(c.k), n = WD.catCount(S.deck, l); return '<button class="chip' + (c.k === BOOK.cat ? ' on' : '') + '" data-k="' + c.k + '" data-sound="tap">' + c.icon + ' ' + c.en + ' <span class="th">' + n + '/' + l.length + (n === l.length ? ' 🎓' : '') + '</span></button>'; }).join('');
  $('book-cats').querySelectorAll('.chip').forEach(b => b.onclick = () => { BOOK.cat = b.dataset.k; openBook(); });
  const list = WC.cards(BOOK.cat), n = WD.catCount(S.deck, list), c = WC.CAT[BOOK.cat];
  $('book-cat-top').innerHTML = '<span>' + c.icon + ' ' + c.en + ' · ' + c.th + '</span><span>' + Math.round(n * 100 / list.length) + '% · ' + n + ' / ' + list.length + '</span>' + (n === list.length ? '<span>🎓 Full — professor!</span>' : '');
  $('book-grid').innerHTML = list.map(cd => { const own = WD.owned(S.deck, cd.id);
    return '<button data-id="' + cd.id + '" data-sound="' + (own ? 'pop' : 'none') + '" aria-label="' + (own ? UI.esc(cd.en) : 'missing card') + '">' + (own ? cardHtml(cd, {mini: true, tier: WC.tierOf(WD.dupsOf(S.deck, cd.id)), count: S.deck.cards[cd.id].n, lv: S.deck.cards[cd.id].lv}) : '<div class="wcard mini ghost"><span class="gp">' + cd.power + '</span><span class="gq">?</span></div>') + '</button>'; }).join('');
  $('book-grid').querySelectorAll('button').forEach(b => b.onclick = () => { const id = b.dataset.id; if(!WD.owned(S.deck, id)){ UI.toast('🧠 Win this card in the ' + c.en + ' quiz'); return; } bookPop(id); });
  showScreen('book');
}
function bookPop(id){
  const cd = C(id), d = WD.dupsOf(S.deck, id), t = WC.tierOf(d), need = WC.nextTierNeed(d), rar = WC.RARITY[WC.rarityOfLevel(S.deck.cards[id].lv || 0)], p = $('book-pop');
  p.innerHTML = '<div class="in">' + cardHtml(cd, {tier: t}) + '<div class="side"><div class="tierline">' + WC.TIERS[t].icon + ' ' + WC.TIERS[t].en + ' · ' + WC.TIERS[t].th + '<br>' + (need ? need + ' more to ' + WC.TIERS[t + 1].icon + ' ' + WC.TIERS[t + 1].en : '🌌 Top tier!') + '<br>' + rar.icon + ' ' + rar.en + ' · won ×' + S.deck.cards[id].n + '</div>' +
    '<button class="btn sp-btn sp-primary" data-sound="none" onclick="$(\'book-pop\').classList.add(\'hidden\')">✖ Close</button></div></div>';
  p.classList.remove('hidden'); p.onclick = e => { if(e.target === p) p.classList.add('hidden'); };
}

/* ================= 🗄️ WisRack (10 cards from your deck; 🎁 starter cards fill gaps until you own enough) ================= */
const STARTER_POWERS = [1, 1, 2, 2, 3, 4, 5, 6, 7, 9];
const G_LABEL = {count: ['🔢', 'WisCount', 'wiscount'], jack: ['🂡', 'WisJack', 'wisjack']};
function deckOf(name){ return name === S.player ? S.deck : deckFor(name); }
function autoRack(deck){ const own = Object.keys(deck.cards).filter(id => WD.owned(deck, id)).map(id => WC.card(id)).filter(Boolean), used = new Set(), out = [];
  STARTER_POWERS.forEach(p => { const c = own.find(x => x.power === p && !used.has(x.id)); if(c){ used.add(c.id); out.push(c.id); } });
  own.slice().sort((a, b) => a.power - b.power).forEach(c => { if(out.length < 10 && !used.has(c.id)){ used.add(c.id); out.push(c.id); } }); return out; }
function rackFor(name){
  const deck = deckOf(name); let ids = (deck.rack || []).filter(id => WD.owned(deck, id) && WC.card(id)); if(!ids.length) ids = autoRack(deck);
  const cards = ids.slice(0, 10).map(id => WC.card(id)), need = STARTER_POWERS.slice();
  cards.forEach(c => { const k = need.indexOf(c.power); if(k >= 0) need.splice(k, 1); else need.splice(need.length - 1, 1); });
  const pool = WC.cards('wisflag').concat(WC.cards('wisdino'), WC.cards('wismammal'));
  while(cards.length < 10){ const p = need.shift() || 1, c = pool.find(x => x.power === p && !cards.some(y => y.id === x.id)) || pool.find(x => !cards.some(y => y.id === x.id)); cards.push(Object.assign({}, c, {starter: true})); }
  return cards;
}
function rackNote(cards){ const h = WD.legalHands(cards).length; return h ? '<div class="good">✅ ' + h + ' different hands of 5 (⚡ ≤ 15, max 2 of one power)</div>' : '<div class="warn">⚠️ This rack can\'t make a hand of 5 with ⚡ ≤ 15 — add some low cards (1, 2, 3).</div>'; }
function miniBtn(c, cls, extra){ return '<button class="rc ' + (cls || '') + '" data-id="' + c.id + '" data-sound="tap">' + cardHtml(c, {mini: true}) + (c.starter ? '<span class="gift" title="Starter card (borrowed)">🎁</span>' : '') + (extra || '') + '</button>'; }
let RK = {sel: [], shelf: 'all'};
function openRack(){ RK.sel = (S.deck.rack || []).filter(id => WD.owned(S.deck, id)); if(!RK.sel.length) RK.sel = autoRack(S.deck); renderRack(); showScreen('rack'); }
function renderRack(){
  const own = Object.keys(S.deck.cards).filter(id => WD.owned(S.deck, id)).map(id => WC.card(id)).filter(Boolean).sort((a, b) => a.power - b.power || a.en.localeCompare(b.en));
  $('rk-shelves').innerHTML = [['all', '✨ All']].concat(WC.SHELVES.map(s => [s.k, s.icon + ' ' + s.en])).map(x => '<button class="chip' + (RK.shelf === x[0] ? ' on' : '') + '" data-k="' + x[0] + '" data-sound="tap">' + x[1] + '</button>').join('');
  $('rk-shelves').querySelectorAll('.chip').forEach(b => b.onclick = () => { RK.shelf = b.dataset.k; renderRack(); });
  const list = own.filter(c => RK.shelf === 'all' || WC.CAT[c.cat].shelf === RK.shelf);
  $('rk-grid').innerHTML = list.length ? list.map(c => '<button class="' + (RK.sel.includes(c.id) ? 'on' : '') + '" data-id="' + c.id + '" data-sound="tap">' + cardHtml(c, {mini: true}) + '</button>').join('') : '<div class="empty">No cards here yet — win some in the 🧠 Quiz!</div>';
  $('rk-grid').querySelectorAll('button[data-id]').forEach(b => b.onclick = () => { const id = b.dataset.id, k = RK.sel.indexOf(id); if(k >= 0) RK.sel.splice(k, 1); else { if(RK.sel.length >= 10){ UISound.play('error'); UI.toast('🗄️ The rack holds 10 cards — take one out first'); return; } RK.sel.push(id); } renderRack(); });
  const cards = RK.sel.map(id => WC.card(id)); $('rk-count').textContent = '🗄️ ' + RK.sel.length + ' / 10' + (RK.sel.length < 10 ? ' (🎁 starter cards fill the rest)' : '');
  const full = RK.sel.length === 10 ? cards : rackFromIds(RK.sel); $('rk-note').innerHTML = rackNote(full);
}
function rackFromIds(ids){ const save = S.deck.rack; S.deck.rack = ids.slice(); const r = rackFor(S.player); S.deck.rack = save; return r; }
function starterRack(){ RK.sel = autoRack(S.deck); renderRack(); }
function saveRack(){ S.deck.rack = RK.sel.slice(0, 10); saveDeck(S.player, {won: [], rack: S.deck.rack, side: S.deck.side || []}, 0); UI.toast('🗄️ Rack saved'); openTableMenu(TM.kind); }

/* ================= 🔢🂡 table games: menu ================= */
let TM = {kind: 'count', opp: 'bot', target: 20, lv: 0};
function maxSide(lv){ return lv >= 4 ? 6 : 4; }   // plan: ±1 … ±4 on Basic–Hard, ±6 from Extreme
function progG(kind, name){ const P = kind === 'count' ? S.progressCount : S.progressJack; return (P && P[name]) || {unlocked: 0, best: []}; }
function canPlayG(kind, i){ const u = Math.max(progG(kind, S.player).unlocked || 0, Number(ls('sp_wisdeck_won_' + kind + ':' + S.player)) || 0); if(i === 5) return u >= 5; if(i === 4) return u >= 4; return i <= Math.max(u, AGE_START[S.age] || 0); }
function sideFor(name, lv){ const deck = deckOf(name), rack = rackFor(name); let s = (deck.side || []).map(x => ({c: rack.find(c => c.id === x.id) || WC.card(x.id), sign: x.sign < 0 ? -1 : 1})).filter(x => x.c && WD.owned(deck, x.c.id) && x.c.power <= maxSide(lv));
  if(!s.length){ const ok = rack.filter(c => c.power <= maxSide(lv)).sort((a, b) => a.power - b.power); s = [[1, 0], [-1, 1], [-1, 2]].map(([sg, i]) => ok[i] ? {c: ok[i], sign: sg} : null).filter(Boolean); }
  return s.slice(0, 3).map(x => ({id: x.c.id, v: x.c.power, sign: x.sign, en: x.c.en})); }
function openTableMenu(kind){
  TM.kind = kind; const G = G_LABEL[kind]; $('cm-logo').innerHTML = '<span>' + G[0] + '</span><span>🃏</span>'; $('cm-name').textContent = G[1];
  $('cm-sub').textContent = kind === 'count' ? 'Pick 5 cards from your rack, then win rounds — a 🎴 rule card says if higher or lower wins!' : 'Get close to ' + TM.target + ' without going over — 3 side cards from your rack can fix your total.';
  const rack = rackFor(S.player); $('rack-n').textContent = '(' + rack.filter(c => !c.starter).length + ' yours' + (rack.some(c => c.starter) ? ' + 🎁 ' + rack.filter(c => c.starter).length + ' starter' : '') + ')';
  $('cm-rack').innerHTML = rack.map(c => miniBtn(c)).join(''); $('cm-rack-note').innerHTML = kind === 'count' ? rackNote(rack) : '';
  $('cm-side-box').classList.toggle('hidden', kind !== 'jack'); if(kind === 'jack') renderSideBuild();
  const opp = [['bot', '🤖 Robot']].concat(S.players.filter(p => p.Name !== S.player).map(p => [p.Name, '👥 ' + p.Name]));
  if(!opp.some(o => o[0] === TM.opp)) TM.opp = 'bot';
  $('cm-opp').innerHTML = opp.map(o => '<button class="chip' + (TM.opp === o[0] ? ' on' : '') + '" data-k="' + UI.esc(o[0]) + '" data-sound="tap">' + UI.esc(o[1]) + '</button>').join('');
  $('cm-opp').querySelectorAll('.chip').forEach(b => b.onclick = () => { TM.opp = b.dataset.k; openTableMenu(kind); });
  $('cm-target-box').classList.toggle('hidden', kind !== 'jack');
  $('cm-target').innerHTML = [[20, '🎯 20'], [21, '🃏 21']].map(t => '<button class="chip' + (TM.target === t[0] ? ' on' : '') + '" data-k="' + t[0] + '" data-sound="tap">' + t[1] + '</button>').join('');
  $('cm-target').querySelectorAll('.chip').forEach(b => b.onclick = () => { TM.target = Number(b.dataset.k); openTableMenu(kind); });
  const p = progG(kind, S.player), bots = kind === 'count' ? ['plays a random card', 'plays the obvious card', 'obvious + reads rule cards', 'counts your cards left', 'counts + its hand ⚡ 17', 'counts + bluffs + its hand ⚡ 21'] : ['stands at 15', 'stands at 16', 'stands at 17 + side cards', 'uses side cards well', 'reads your total', 'best moves + 4 side cards'];
  $('cm-levels').innerHTML = WD.LEVELS.map((L, i) => { const lock = TM.opp === 'bot' && !canPlayG(kind, i), b = (p.best || [])[i];
    return '<button class="lvl' + (lock ? ' lock' : '') + (i === 5 ? ' hc' : '') + '" data-i="' + i + '" data-sound="' + (lock ? 'none' : 'pop') + '"><div class="big">' + L.icon + '</div><div class="nm">' + L.name + '</div><div class="sub">🤖 ' + bots[i] + (kind === 'count' && i >= 2 ? ' · 🎴 theme rules' : '') + (kind === 'jack' ? ' · side ±1–' + maxSide(i) + (i <= 1 ? ' · ⚠️ bust meter' : '') : '') + '</div>' +
      (b && b.score ? '<div class="best">🏆 ' + Number(b.score).toLocaleString() + ' ' + '⭐'.repeat(b.stars || 0) + '</div>' : '') + '</button>'; }).join('');
  $('cm-levels').querySelectorAll('.lvl').forEach(b => b.onclick = () => { const i = Number(b.dataset.i); if(b.classList.contains('lock')){ UISound.play('error'); UI.toast(i === 5 ? '💀 Hardcore opens after Extreme' : '🔒 Beat the level before first'); return; }
    if(kind === 'count' && !WD.legalHands(rack).length){ UISound.play('error'); UI.toast('⚠️ Your rack can\'t make a hand — change it first'); return; } TM.lv = i; kind === 'count' ? startCount() : startJack(); });
  $('cm-how').innerHTML = (kind === 'count' ? ['🗄️ Your rack = 10 cards you won. Before the match pick 5 (⚡ total ≤ 15, max 2 of one power) — or 🎲 let the game pick.', '🎴 Each round a rule card flips: ⬆️ higher wins or ⬇️ lower wins. From Intermediate theme cards join: ➕2 / ➖2 / ✖️2 for one shelf, 🔁 swap a card.', 'Both pick a card, flip — the winner gets a point. Same power = draw. First to 3; after 5 rounds a draw → ⚡ sudden death with your whole hand.', '💡 Use the whole 15 and keep one low AND one high card for the rule flips.'] :
    ['Each turn you draw a number card 1–10 (the jack rule — also in 🃏 21). Then ✋ stand, 🃏 take your next card, or play ONE side card. A − side card can\'t take you below 0.', '🎴 Side cards: 3 cards from your rack (power ≤ ' + maxSide(TM.lv) + '), + or − set before the match. A used side card is gone for the whole match.', 'Closest to ' + TM.target + ' wins the set; over ' + TM.target + ' = bust. 9 cards on the table without busting = you win the set.', 'Best 3 of 5 sets. ⚠️ The bust meter (Basic + Junior) shows the chance your next card goes over.']).map(x => '<li>' + x + '</li>').join('');
  if(window.UI && UI.leaders) UI.leaders($('cm-leaders'), G[2], S.player);
  showScreen('cmenu');
}
function renderSideBuild(){
  const lv = TM.lv, rack = rackFor(S.player), side = sideFor(S.player, lv), mx = maxSide(lv);
  $('cm-side-note').textContent = '(3 cards ⚡ ≤ ' + mx + ' · tap: + → − → off · used = gone for the match)';
  $('cm-side').innerHTML = rack.map(c => { const s = side.find(x => x.id === c.id), off = c.power > mx || c.starter && false; return miniBtn(c, (s ? 'on' : '') + (c.power > mx ? ' off' : ''), s ? '<span class="sg">' + (s.sign > 0 ? '+' : '−') + c.power + '</span>' : ''); }).join('');
  $('cm-side').querySelectorAll('.rc').forEach(b => b.onclick = () => { const c = rack.find(x => x.id === b.dataset.id); if(c.power > mx){ UISound.play('error'); UI.toast('Side cards need ⚡ ' + mx + ' or less'); return; }
    let cur = sideFor(S.player, lv).map(x => ({id: x.id, sign: x.sign})); const k = cur.findIndex(x => x.id === c.id);
    if(k < 0){ if(cur.length >= 3){ UISound.play('error'); UI.toast('3 side cards — tap one to switch it off'); return; } cur.push({id: c.id, sign: 1}); } else if(cur[k].sign > 0) cur[k].sign = -1; else cur.splice(k, 1);
    if(c.starter){ UI.toast('🎁 Starter cards can\'t be side cards — win your own!'); return; }
    S.deck.side = cur; ls(store('side'), JSON.stringify(cur)); renderSideBuild(); clearTimeout(renderSideBuild.t); renderSideBuild.t = setTimeout(() => saveDeck(S.player, {won: [], side: cur}, 0), 800); });
}

/* ================= 🪑 table seats (both avatars at a card table) — wd-12: bigger table, avatar plays the card, guided 🌱 Basic ================= */
const TB = {A: [null, null], raf: 0, t0: 0, think: false};
function seatHtml(i, name, isBot){ return '<canvas id="t-c' + i + '" width="144" height="168"></canvas><div class="who"><span>' + (isBot ? '🤖 Robot' : UI.esc(name)) + '</span><span class="dots" id="t-dots' + i + '"></span></div><div class="hidden-hand" id="t-hh' + i + '"></div>'; }
function tableStart(names){ TB.A = names.map(n => n ? {name: n, av: myAvatar(n), dir: 1, walkT: 0, gest: null} : null); TB.t0 = performance.now(); if(TB.raf) cancelAnimationFrame(TB.raf);
  const loop = now => { TB.raf = requestAnimationFrame(loop); if($('v-table').classList.contains('hidden')) return; const t = Math.max(0, now - TB.t0) / 1000, dt = Math.min(0.05, (now - (TB.last || now)) / 1000); TB.last = now;
    [0, 1].forEach(i => { const c = $('t-c' + i); if(!c) return; const g = c.getContext('2d'), W = c.width, H = c.height; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); const A = TB.A[i];
      if(!A){ try{ const th = TB.think, bob = Math.sin(t * (th ? 7 : 2)) * (th ? 5 : 3); g.save(); g.translate(W / 2, H * 0.5 + bob); g.rotate(Math.sin(t * (th ? 6 : 1.5)) * (th ? 0.12 : 0.04)); emo(g, '🤖', 0, 0, W * 0.62); g.restore(); if(th) emo(g, '💭', W * 0.82, H * 0.16 + Math.sin(t * 4) * 3, W * 0.3); }catch(e){} return; }   // 🤖 bobs; wobbles + 💭 while thinking
      if(A.gest){ A.gest.t += dt; if(A.gest.t >= A.gest.g.d) A.gest = null; }
      const P = avatarPlace(A.av, A.name, W, H, W / 2, H - 4, 4, ['cheer', 'think', 'jump']); try{ drawAvatar(g, A, P.x, P.y, P.k, {t}); }catch(e){} }); };
  TB.raf = requestAnimationFrame(loop); }
function tableGest(i, k){ const A = TB.A[i]; if(!A) return; const g = gestOf(k); A.gest = g ? {g, t: 0} : null; }
function lookAway(name, then){ const el = $('lookaway'); el.innerHTML = '<div class="big">🙈</div><h2>' + UI.esc(name) + '\'s turn</h2><p>Everyone else looks away!</p><button class="btn sp-btn sp-primary gold" data-sound="pop" id="la-go">👀 I\'m ' + UI.esc(name) + ' — show my cards</button>'; el.classList.remove('hidden'); $('la-go').onclick = () => { el.classList.add('hidden'); then(); }; }
function leaveTable(){ if(window.Cheer) Cheer.unmount(); if(TB.raf) cancelAnimationFrame(TB.raf); TB.raf = 0; TB.think = false; clearInterval(PICK.timer); closePeek(); T = null; view('learn'); openTableMenu(TM.kind); }
/* 📣 CHEERSQUAD (cs-3c) START — the crowd (CheerSquad.html, 📣 Cheer chat). Don't remove: the Cheer chat re-applies it. */
// ❓ quiz: you vs the 🦊 rival · 🃏 table: side 0 = you (bottom seat), side 1 = 🤖 / your friend (top seat)
function cheerTaken(){ const q = !$('v-quiz').classList.contains('hidden');
  return Array.from(document.querySelectorAll(q ? '#v-quiz .qhud, #q-tbar, #q-mypod, #v-quiz .qstage > *, #q-res:not(.hidden), .top-btn' : '#v-table .qhud, #t-seat0 > *, #t-seat1 > *, #t-mid, #t-bottom > *, #t-res:not(.hidden), .top-btn')); }
function cheerMount(kind){
  if(!window.Cheer) return; Cheer.unmount(); const box = $('scr-play'), two = kind === 'table' && T && T.two;
  const players = kind === 'quiz' ? [{name: S.player, side: 0, human: true}, {name: 'Quizzy', side: 1, human: false}] : [{name: S.player, side: 0, human: true}, {name: two ? T.names[1] : 'Robot', side: 1, human: !!two}];
  Cheer.mount(box, {game: 'wisdeck', players, me: {name: S.player}, family: (S.players || []).map(p => p.Name).filter(n => !two || n !== T.names[1]), avatars: S.avatars || {}, mode: 'overlay',
    zones: () => Cheer.freeZones(box, cheerTaken), avoid: cheerTaken, clear: () => true});
}
function cheerView(v){ if(!window.Cheer) return; if(v === 'quiz' || v === 'table') setTimeout(() => cheerMount(v), 0); else Cheer.unmount(); }   /* after T / Q are set */
function cheerHush(on){ if(window.Cheer) Cheer.hush(!!on); }
function cheerSay(kind, side){ if(window.Cheer && Cheer.active()) Cheer.react(kind, {side}); }
function cheerQuizEnd(r){ if(window.Cheer && Cheer.active()) Cheer.react(r.stars ? 'win' : 'lose', {side: 0}); }
function cheerRound(w){ if(!window.Cheer || !Cheer.active()) return; if(w === -1) Cheer.react('goal', {side: -1}); else Cheer.react('goal', {side: w}); }
function cheerJack(M){ if(!window.Cheer || !Cheer.active() || !M || !M.setOver) return; const w = M.setWinner; if(w == null || w < 0) Cheer.react('goal', {side: -1}); else Cheer.react(M.S[w] && M.S[w].total === M.target ? 'big' : 'goal', {side: w}); }
function cheerTableEnd(w){ if(!window.Cheer || !Cheer.active()) return; Cheer.hush(false); if(w === 0) Cheer.react('win', {side: 0}); else if(w === 1) Cheer.react(T && T.two ? 'win' : 'lose', {side: T && T.two ? 1 : 0}); else Cheer.react('goal', {side: -1}); }
/* 📣 CHEERSQUAD END */
function showTable(){ $('t-res').classList.add('hidden'); view('table'); showScreen('play'); }
function dots(n){ return '🟡'.repeat(n) + '⚪'.repeat(Math.max(0, 3 - n)); }
function setDots(i, n){ const el = $('t-dots' + i); if(!el) return; const had = Number(el.dataset.n) || 0; el.dataset.n = n; el.innerHTML = [0, 1, 2].map(k => '<i class="' + (k < n && k >= had ? 'pop' : '') + '">' + (k < n ? '🟡' : '⚪') + '</i>').join(''); }   // a new win dot pops in
// ✈️ a card flies from one spot to another (a copy on top of everything); SPEED 0 (tests) = instant
function fly(html, from, to, ms, rot){ return new Promise(res => { if(!SPEED || !from || !to || !from.width){ res(); return; } const el = document.createElement('div'); el.className = 'flyer'; el.innerHTML = html;
  el.style.left = from.left + 'px'; el.style.top = from.top + 'px'; el.style.width = from.width + 'px'; el.style.transition = 'transform ' + ms + 'ms cubic-bezier(.3,.7,.3,1)'; document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transform = 'translate(' + (to.left - from.left) + 'px,' + (to.top - from.top) + 'px) rotate(' + (rot || 0) + 'deg) scale(' + (to.width / from.width) + ')'; }));
  setTimeout(() => { el.remove(); res(); }, ms * SPEED + 40); }); }
function rectOf(el){ return el ? el.getBoundingClientRect() : null; }
function handSpot(i){ const c = $('t-c' + i); if(!c) return null; const r = c.getBoundingClientRect(); return {left: r.left + r.width * 0.55, top: r.top + r.height * 0.35, width: r.width * 0.45, height: r.width * 0.63}; }   // the avatar's hand
function burst(el, emos){ if(!SPEED || !el) return; const r = el.getBoundingClientRect(); for(let k = 0; k < 12; k++){ const b = document.createElement('div'); b.className = 'burst'; b.textContent = emos[k % emos.length];
  b.style.left = (r.left + r.width / 2) + 'px'; b.style.top = (r.top + r.height / 2) + 'px'; const a = k / 12 * Math.PI * 2; b.style.setProperty('--bx', Math.cos(a) * 140 + 'px'); b.style.setProperty('--by', Math.sin(a) * 110 + 'px'); b.style.setProperty('--br', (k * 50) + 'deg');
  document.body.appendChild(b); setTimeout(() => b.remove(), 1000); } }
function pointAt(el){ document.querySelectorAll('#v-table .pointer').forEach(p => p.remove()); if(!el) return; const p = document.createElement('div'); p.className = 'pointer'; p.textContent = '👆'; const host = $('v-table'), r = el.getBoundingClientRect(), h = host.getBoundingClientRect();
  if(r.bottom > h.bottom - 60){ p.textContent = '👉'; p.style.left = Math.max(2, r.left - h.left - 46) + 'px'; p.style.top = (r.top - h.top + r.height / 2 - 22) + 'px'; }   // near the bottom edge: point from the side
  else { p.style.left = (r.left - h.left + r.width / 2 - 18) + 'px'; p.style.top = (r.bottom - h.top - 18) + 'px'; } host.appendChild(p); }
const BASIC = () => T && T.lv === 0;   // 🌱 Basic = guided: the next move glows, 👆 on the first move, mistakes explain themselves, no timer
const GOAL = {count: '🎯 Win 3 rounds — play a card that beats the other card!', jack: t => '🎯 Get close to ' + t + ' — but don\'t go over!'};
// 🔍 tap a card in your hand = it comes up big with all its facts · tap it again = play it
function openPeek(c, onPlay, note){ closePeek(); const el = document.createElement('div'); el.className = 'peek'; el.id = 'peek';
  el.innerHTML = '<div class="big" id="peek-card">' + cardHtml(c) + '</div><div class="hint">' + (note || '') + '👆 Tap the card again to play it</div><div class="row"><button class="btn sp-btn sp-primary gold" data-sound="pop" id="peek-go">▶ Play this card</button><button class="btn soft sp-btn sp-secondary" data-sound="tap" id="peek-no">↩️ Back to my hand</button></div>';
  document.body.appendChild(el); $('peek-card').onclick = $('peek-go').onclick = () => { closePeek(); onPlay(); }; $('peek-no').onclick = closePeek; el.onclick = e => { if(e.target === el) closePeek(); }; }
function closePeek(){ const el = $('peek'); if(el) el.remove(); }

/* ================= 🔢 WisCount play ================= */
let T = null; const PICK = {timer: 0};
function shelfOfCard(c){ return (WC.CAT[c.cat] || {}).shelf || ''; }
function botRack(r){ for(let k = 0; k < 50; k++){ const all = WC.all(), rk = []; while(rk.length < 10){ const c = all[Math.floor(r() * all.length)]; if(!rk.some(x => x.id === c.id)) rk.push(c); } if(WD.legalHands(rk).length) return rk; } return rackFor(S.player); }
function startCount(){
  const two = TM.opp !== 'bot', names = [S.player, two ? TM.opp : null], r = WD.rng((Date.now() ^ (Math.random() * 1e9)) >>> 0);
  T = {kind: 'count', lv: TM.lv, two, names, r, hands: [null, null], gid: ++QID, dealt: false};
  $('t-title').textContent = '🔢 WisCount · ' + WD.LEVELS[TM.lv].icon + ' ' + WD.LEVELS[TM.lv].name; $('t-round').textContent = '🖐️ pick'; $('t-score').textContent = '0 : 0';
  $('t-seat1').innerHTML = seatHtml(1, names[1], !two); $('t-seat0').innerHTML = seatHtml(0, names[0], false); setDots(0, 0); setDots(1, 0); showTable(); tableStart(names);
  if(!two){ const br = botRack(r); T.hands[1] = TM.lv >= 2 ? WD.bestHand(br, WD.BOT_BUDGET[TM.lv]) : WD.randomHand(br, r); }
  pickHand(0);
}
function pickHand(seat){
  const name = T.names[seat], rack = rackFor(name), sel = []; clearInterval(PICK.timer); let left = 45, first = true; const timed = !BASIC() && SPEED;
  const draw = () => { const pw = sel.map(i => rack[i].power), tot = pw.reduce((a, b) => a + b, 0), same = pw.some(p => pw.filter(q => q === p).length > 2), legal = WD.legalHand(pw);
    $('t-mid').innerHTML = '<div class="goal">' + GOAL.count + '</div><div class="rulecard"><div class="big">🖐️ ' + UI.esc(name) + ': pick 5 cards</div><div class="sm">⚡ ' + tot + ' / 15 · max 2 of one power' + (timed ? ' · ⏱️ ' + left + ' s' : '') + '</div></div>' +
      '<div class="tmsg">' + (tot > 15 ? '⚠️ Too strong — your 5 cards add up to more than ⚡ 15. Swap a big card for a small one.' : same ? '⚠️ Max 2 cards with the same power' : sel.length === 5 ? '✅ Ready!' : BASIC() ? 'Tap 5 cards — or let 🎲 pick for you' : 'Tip: keep one low and one high card') + '</div>' +
      '<div class="tbtns"><button class="btn soft sp-btn sp-secondary" data-sound="pop" id="pk-rand">🎲 Pick for me</button><button class="btn sp-btn sp-primary gold" data-sound="pop" id="pk-go"' + (legal ? '' : ' disabled') + '>✅ Play these 5</button></div>';
    $('t-bottom').innerHTML = '<div class="myhand ten">' + rack.map((c, i) => '<button data-i="' + i + '" class="' + (sel.includes(i) ? 'on' : '') + (first && !T.dealt ? ' deal' : '') + '" data-sound="tap" style="--k:' + (i % 5) + ';--mid:2">' + cardHtml(c, {mini: true, tier: sel.includes(i) ? 2 : null}) + (c.starter ? '<span class="gift" style="position:absolute;left:0;bottom:0">🎁</span>' : '') + '</button>').join('') + '</div>';
    $('t-bottom').querySelectorAll('button[data-i]').forEach(b => b.onclick = () => { const i = Number(b.dataset.i), k = sel.indexOf(i); if(k >= 0) sel.splice(k, 1); else if(sel.length < 5) sel.push(i); first = false; draw(); });
    $('pk-rand').onclick = () => done(WD.randomHand(rack, T.r)); $('pk-go').onclick = () => done(sel.map(i => rack[i]));
    if(BASIC()){ const g = legal ? $('pk-go') : sel.length ? null : $('pk-rand'); if(g){ g.classList.add('glow'); if(first) setTimeout(() => pointAt(g), 30); } } };
  const done = h => { clearInterval(PICK.timer); pointAt(null); if(!h){ UI.toast('⚠️ No legal hand in this rack'); return; } T.hands[seat] = h; T.dealt = false; if(seat === 0 && T.two) lookAway(T.names[1], () => pickHand(1)); else beginCount(); };
  draw(); if(timed) PICK.timer = setInterval(() => { left--; if(left <= 0) done(WD.randomHand(rack, T.r)); else { const sm = $('t-mid').querySelector('.sm'); if(sm) sm.textContent = sm.textContent.replace(/⏱️ \d+ s/, '⏱️ ' + left + ' s'); } }, 1000);
}
function beginCount(){ T.M = WD.countMatch({level: T.lv, seed: Math.floor(T.r() * 1e9), hands: T.hands, shelfOf: shelfOfCard}); renderCount(); }
function ruleText(rule){ const sh = rule.mod && rule.mod.shelf ? WC.SHELVES.find(s => s.k === rule.mod.shelf) : null; let m = '';
  if(rule.mod){ m = rule.mod.k === 'swap' ? '🔁 Swap: each player gave the other one card!' : rule.mod.k === 'double' ? sh.icon + ' ' + sh.en + ' cards ✖️2' : sh.icon + ' ' + sh.en + ' cards ' + (rule.mod.k === 'plus' ? '+' : '−') + rule.mod.n; }
  return '<div class="big">' + (rule.dir > 0 ? '⬆️ Higher wins' : '⬇️ Lower wins') + '</div>' + (m ? '<div class="sm">🎴 ' + m + '</div>' : '<div class="sm">' + (rule.dir > 0 ? 'ยิ่งมากยิ่งชนะ' : 'ยิ่งน้อยยิ่งชนะ') + '</div>'); }
function bestIdx(H, rule){ let b = 0; H.forEach((c, i) => { const e = WD.effPower(c, rule, shelfOfCard), eb = WD.effPower(H[b], rule, shelfOfCard); if(rule.dir > 0 ? e > eb : e < eb) b = i; }); return b; }
function renderCount(seat){
  seat = seat || 0; const M = T.M, P = M.P; $('t-round').textContent = M.sudden ? '⚡ sudden death' : 'Round ' + Math.min(5, M.round + 1) + ' / 5'; $('t-score').textContent = P[0].wins + ' : ' + P[1].wins;
  setDots(0, P[0].wins); setDots(1, P[1].wins); $('t-hh1').innerHTML = P[1].hand.map((c, k) => backHtml(T.names[1]).replace('class="wcard mini back"', 'class="wcard mini back" style="--k:' + k + '"')).join(''); $('t-hh0').innerHTML = '';
  $('t-mid').innerHTML = '<div class="goal">' + GOAL.count + '</div><div class="rulecard flip">' + ruleText(M.rule) + '</div><div class="duel" id="t-duel"><div class="slot" id="t-slot0"></div><div class="vs">⚔️</div><div class="slot" id="t-slot1"></div></div><div class="tmsg" id="t-msg">' + UI.esc(T.names[seat] || '') + ', pick a card!</div><div class="tbtns" id="t-btns"></div>';
  const H = P[seat].hand, deal = !T.dealt, mid = (H.length - 1) / 2; T.dealt = true;
  $('t-bottom').innerHTML = '<div class="myhand">' + H.map((c, i) => { const e = WD.effPower(c, M.rule, shelfOfCard); return '<button data-i="' + i + '" data-sound="tap" class="' + (deal ? 'deal' : '') + '" style="--k:' + i + ';--mid:' + mid + '">' + (e !== c.power ? '<span class="eff">⚡' + e + '</span>' : '') + cardHtml(c, {mini: true}) + '</button>'; }).join('') + '</div>';
  $('t-bottom').querySelectorAll('button[data-i]').forEach(b => b.onclick = () => { const i = Number(b.dataset.i);
    if(!SPEED) return countPick(seat, i);   // tests: one tap plays
    openPeek(H[i], () => countPick(seat, i), BASIC() && i !== bestIdx(H, M.rule) ? '💡 ' + (M.rule.dir > 0 ? 'Higher' : 'Lower') + ' wins this round — the glowing card may be better. ' : ''); });
  if(BASIC()){ const g = $('t-bottom').querySelector('button[data-i="' + bestIdx(H, M.rule) + '"]'); if(g){ g.classList.add('glow'); if(M.round === 0) setTimeout(() => pointAt(g), deal && SPEED ? 600 : 30); } }
}
async function countPick(seat, i){
  if(T.lock) return; pointAt(null);
  if(seat === 0){ T.pick0 = i; if(T.two){ T.lock = true; await playOut(0, i); T.lock = false; $('t-bottom').innerHTML = ''; lookAway(T.names[1], () => renderCount(1)); return; } T.lock = true; const b = WD.countBot(T.M, 1, T.lv, T.r); await Promise.all([playOut(0, i), botOut(b)]); reveal(i, b); }
  else { T.lock = true; await playOut(1, i); reveal(T.pick0, i); }
}
// 🃏 the avatar plays the card: hand → the avatar's hand (flip gesture) → face down on the table
async function playOut(seat, i){ const btn = $('t-bottom').querySelector('button[data-i="' + i + '"]'), c = T.M.P[seat].hand[i], gid = T.gid; if(!btn || !SPEED) return;
  const from = rectOf(btn.querySelector('.wcard')); btn.style.visibility = 'hidden'; await fly(cardHtml(c, {mini: true}), from, handSpot(T.two ? seat : 0), 260, -8); if(!T || T.gid !== gid) return;
  tableGest(T.two ? seat : 0, 'flip'); await fly(backHtml(T.names[seat]), handSpot(T.two ? seat : 0), rectOf($('t-slot' + seat)), 360, 0); }
async function botOut(i){ if(!SPEED) return; TB.think = true; cheerHush(1); await wait(450); TB.think = false; cheerHush(0); const backs = $('t-hh1').querySelectorAll('.wcard'); tableGest(1, 'flip'); await fly(backHtml(null), rectOf(backs[Math.min(i, backs.length - 1)]), rectOf($('t-slot1')), 420, 180); }
async function reveal(a, b){
  const M = T.M, gid = T.gid, before = [M.P[0].hand.slice(), M.rule], ev = WD.countPlay(M, a, b); $('t-bottom').innerHTML = '';
  const slot = (c, e, w, k) => '<div class="slot ' + (ev.winner === -1 ? '' : w ? 'win' : 'lose') + '" id="t-slot' + k + '">' + cardHtml(c, {mini: true}).replace('class="wcard', 'class="wcard flipin') + '<span class="eff">⚡ ' + e + '</span></div>';
  $('t-duel').innerHTML = slot(ev.cards[0], ev.eff[0], ev.winner === 0, 0) + '<div class="vs">⚔️</div>' + slot(ev.cards[1], ev.eff[1], ev.winner === 1, 1);
  cheerRound(ev.winner); /* 📣 cs-3c */
  let who = ev.winner === -1 ? '🤝 Same power — a draw!' : (ev.winner === 0 ? T.names[0] : T.names[1] || '🤖 Robot') + ' wins the round!';
  if(BASIC() && ev.winner === 1 && !T.two){ const rule = before[1], better = before[0].find(c => { const e = WD.effPower(c, rule, shelfOfCard); return rule.dir > 0 ? e > ev.eff[1] : e < ev.eff[1]; });   // 🌱 the mistake explains itself
    who += '<span class="tip">💡 ' + (rule.dir > 0 ? '⬆️ Higher' : '⬇️ Lower') + ' wins: your ⚡' + ev.eff[0] + ' vs ⚡' + ev.eff[1] + '. ' + (better ? 'Your ' + UI.esc(better.en) + ' would have won!' : 'No card could win this one — save your best for later.') + '</span>'; }
  $('t-hh1').innerHTML = M.P[1].hand.map((c, k) => backHtml(T.names[1]).replace('class="wcard mini back"', 'class="wcard mini back" style="--k:' + k + '"')).join('');   // the robot's hand is one card shorter
  $('t-msg').innerHTML = who; $('t-score').textContent = M.P[0].wins + ' : ' + M.P[1].wins; setDots(0, M.P[0].wins); setDots(1, M.P[1].wins);
  tableGest(0, 'flip'); tableGest(1, 'flip');
  if(ev.winner >= 0){ setTimeout(() => { if(!T || T.gid !== gid) return; tableGest(ev.winner, 'cheer'); tableGest(1 - ev.winner, 'oops'); if(ev.winner === 0 || T.two) burst($('t-slot' + ev.winner), ['⭐', '✨', '🎉']); }, 500 * SPEED); UISound.play(ev.winner === 0 || T.two ? 'success' : 'error'); }
  $('t-btns').innerHTML = '<button class="btn sp-btn sp-primary gold" data-sound="pop" id="t-next">' + (M.over ? '🏁 Result' : '🃏 Next card') + '</button>';
  if(BASIC()) $('t-next').classList.add('glow');
  $('t-next').onclick = () => { if(!T || T.gid !== gid) return; T.lock = false; if(M.over) finishTable(); else if(T.two) lookAway(T.names[0], () => renderCount(0)); else renderCount(0); };
}

/* ================= 🂡 WisJack play ================= */
function botSide(r, lv){ const mx = lv <= 2 ? 3 : maxSide(lv); return (lv >= 5 ? [1, -1, -1, -1] : [1, -1, -1]).map((sg, i) => ({id: 'bot' + i, v: 1 + Math.floor(r() * mx), sign: sg})); }   // 💀 Hardcore robot: a 4th side card
function startJack(){
  const two = TM.opp !== 'bot', names = [S.player, two ? TM.opp : null], r = WD.rng((Date.now() ^ (Math.random() * 1e9)) >>> 0);
  T = {kind: 'jack', lv: TM.lv, two, names, r, gid: ++QID, firstTurn: true};
  const sides = [sideFor(S.player, TM.lv), two ? sideFor(TM.opp, TM.lv) : botSide(r, TM.lv)];
  T.M = WD.jackMatch({level: TM.lv, seed: Math.floor(r() * 1e9), target: TM.target, sides});
  $('t-title').textContent = '🂡 WisJack ' + TM.target + ' · ' + WD.LEVELS[TM.lv].icon + ' ' + WD.LEVELS[TM.lv].name;
  $('t-seat1').innerHTML = seatHtml(1, names[1], !two); $('t-seat0').innerHTML = seatHtml(0, names[0], false); setDots(0, 0); setDots(1, 0); showTable(); tableStart(names); renderJack();
}
function jrow(s){ return '<div class="jrow">' + s.table.map((x, i) => { const t = (x.side && x.v > 0 ? '+' : '') + x.v; return '<div class="jcard' + (x.side ? ' side' : '') + (i === s.table.length - 1 ? ' new' : '') + '" data-v="' + t + '">' + t + '</div>'; }).join('') + '</div>'; }
function jtot(s, M){ return '<div class="jtot' + (s.total > M.target ? ' bust' : s.total === M.target ? ' t20' : '') + '">' + s.total + (s.stood ? ' ✋' : '') + (s.total > M.target ? ' 💥' : '') + '</div>'; }
function jackHint(s, P, M){   // 🌱 Basic: which move glows + why
  const T2 = M.target, fix = P.side.findIndex(c => !c.used && !s.usedSide && c.sign < 0 && s.total - c.v <= T2 && s.total - c.v >= 0);
  if(s.total > T2) return fix >= 0 ? {k: 'side', i: fix, msg: '💥 Over ' + T2 + '! Tap the glowing − card to come back down.'} : {k: 'end', msg: '💥 Over ' + T2 + ' — no − card to save it this time.'};
  if(s.total === T2) return {k: 'stand', msg: '🎯 Exactly ' + T2 + '! Stand now!'};
  if(s.total >= T2 - 3) return {k: 'stand', msg: '✋ ' + s.total + ' is close to ' + T2 + ' — a new card will probably go over. Stand!'};
  return {k: 'end', msg: s.total + ' is far from ' + T2 + ' — take the 🃏 next card.'}; }
function placeDraws(){ const pile = $('t-pile'); if(!pile || !SPEED) return; const pr = pile.getBoundingClientRect(); document.querySelectorAll('#v-table .jcard.new').forEach(el => { const r = el.getBoundingClientRect(); el.style.setProperty('--fx', (pr.left - r.left) + 'px'); el.style.setProperty('--fy', (pr.top - r.top) + 'px'); }); }   // 🂠 new cards fly from the draw pile
function renderJack(){
  const M = T.M, me = M.turn, human = !(me === 1 && !T.two), S0 = M.S[0], S1 = M.S[1];
  $('t-round').textContent = (M.sudden ? '⚡ ' : '') + 'Set ' + M.set + (M.sudden ? '' : ' / 5'); $('t-score').textContent = M.P[0].wins + ' : ' + M.P[1].wins;
  setDots(0, M.P[0].wins); setDots(1, M.P[1].wins);
  $('t-hh1').innerHTML = '<div class="tside">' + jrow(S1) + jtot(S1, M) + '</div>'; $('t-hh0').innerHTML = '';
  $('t-mid').innerHTML = '<div class="goal">' + GOAL.jack(M.target) + '</div><div class="rulecard"><div class="big">🎯 ' + M.target + '</div><div class="sm">' + (M.setOver ? '' : human ? UI.esc(T.names[me]) + '\'s turn' : '🤖 Robot is thinking…') + '</div></div><div class="tmsg" id="t-msg"></div><div class="tbtns" id="t-btns"></div>' +
    '<div class="pile" id="t-pile">' + backHtml(null) + backHtml(null) + backHtml(null) + '</div>';
  const s = M.S[me], P = M.P[me];
  if(M.setOver && M.cheerSet !== M.set){ M.cheerSet = M.set; cheerJack(M); } /* 📣 cs-3c */
  if(M.setOver){ const w = M.setWinner, ls = w === 0 ? S1 : S0; let m = w === -1 ? '🤝 Same total — this set is a draw' : (w === 0 ? T.names[0] : T.names[1] || '🤖 Robot') + ' wins set ' + M.set + '!' + (M.S[w] && M.S[w].total === M.target ? ' 🎯 Exactly ' + M.target + '!' : '');
    if(BASIC() && w === 1 && !T.two) m += '<span class="tip">💡 ' + (S0.total > M.target ? S0.total + ' is over ' + M.target + '. Next time stand at 17 or more.' : 'The robot got closer to ' + M.target + '. Take one more card when you are far away.') + '</span>';
    $('t-msg').innerHTML = m; if(w >= 0){ tableGest(w, 'cheer'); tableGest(1 - w, 'oops'); }
    $('t-btns').innerHTML = '<button class="btn sp-btn sp-primary gold' + (BASIC() ? ' glow' : '') + '" data-sound="pop" id="t-next">' + (M.over ? '🏁 Result' : '▶ Next set') + '</button>'; const gid = T.gid; $('t-next').onclick = () => { if(!T || T.gid !== gid) return; if(M.over) finishTable(); else { WD.jackNewSet(M); renderJack(); } };
    $('t-bottom').innerHTML = '<div class="tside">' + jrow(S0) + jtot(S0, M) + '</div>'; placeDraws(); return; }
  const meterOn = T.lv <= 1 && s.total <= M.target, bust = WD.jackBustChance(s.total, M.target, M.top);
  $('t-bottom').innerHTML = '<div class="tside">' + jrow(me === 0 || !human ? S0 : S1) + jtot(me === 0 || !human ? S0 : S1, M) +
    (human && meterOn ? '<div class="meter" title="Chance your next card goes over"><i style="width:' + Math.round(bust * 100) + '%"></i></div><div class="tmsg" style="font-size:.8rem">⚠️ next card goes over: ' + Math.round(bust * 100) + ' %</div>' : '') +
    (human ? '<div class="jside">' + P.side.map((c, k) => '<button data-k="' + k + '" data-sound="pop"' + (c.used || s.usedSide ? ' disabled' : '') + ' title="' + UI.esc(c.en || '') + '">' + (c.sign > 0 ? '+' : '−') + c.v + '<small>' + UI.esc((c.en || '').length > 9 ? c.en.slice(0, 8) + '…' : (c.en || '')) + '</small></button>').join('') + '</div>' +
      '<div class="tbtns" style="margin-top:4px"><button class="btn soft sp-btn sp-secondary" data-sound="pop" id="j-end">🃏 Next card</button><button class="btn sp-btn sp-primary gold" data-sound="pop" id="j-stand"' + (s.total > M.target ? ' disabled' : '') + '>✋ Stand at ' + s.total + '</button></div>' : '') + '</div>';
  placeDraws();
  if(human){ if(s.total > M.target) $('t-msg').textContent = '💥 Over ' + M.target + '! Play a − side card or you bust.';
    if(BASIC()){ const h = jackHint(s, P, M), el = h.k === 'side' ? $('t-bottom').querySelector('.jside button[data-k="' + h.i + '"]') : h.k === 'stand' ? $('j-stand') : $('j-end'); $('t-msg').textContent = h.msg; if(el){ el.classList.add('glow'); if(T.firstTurn) setTimeout(() => pointAt(el), SPEED ? 500 : 30); } }
    $('t-bottom').querySelectorAll('.jside button').forEach(b => b.onclick = () => { if(WD.jackSide(M, Number(b.dataset.k))){ tableGest(M.turn, 'flip'); renderJack(); } else { UISound.play('error'); $('t-msg').textContent = '🚫 That − card would take you below 0.'; } });
    $('j-end').onclick = () => jackAct(false); $('j-stand').onclick = () => jackAct(true); }
  else botTurn();
}
function jackAct(stand){ const M = T.M, prev = M.turn; T.firstTurn = false; pointAt(null); WD.jackEnd(M, stand); if(!M.setOver) tableGest(M.turn, 'flip'); if(!M.setOver && T.two && M.turn !== prev) lookAway(T.names[M.turn], renderJack); else renderJack(); }
async function botTurn(){ const M = T.M, gid = T.gid; TB.think = true; cheerHush(1); await wait(800); TB.think = false; cheerHush(0); if(!T || T.gid !== gid || M.setOver) return; tableGest(1, 'flip'); WD.jackBot(M, T.lv); renderJack(); }

/* ================= 🏁 table result + save ================= */
function finishTable(){
  const M = T.M, kind = T.kind, lv = T.lv, w = M.winner, my = M.P[0].wins, op = M.P[1].wins, L = WD.LEVELS[lv], gidName = G_LABEL[kind][2];
  const exact = kind === 'jack' ? M.P[0].exact : 0, sweep = w === 0 && op === 0;
  const score = w === 0 ? Math.round((500 + (sweep ? 500 : 0) + exact * 100) * L.mult) : Math.round((my * 50 + exact * 100) * L.mult);
  const stars = w !== 0 ? 0 : sweep ? 3 : my - op >= 2 ? 2 : 1;
  cheerTableEnd(w); /* 📣 cs-3c */
  tableGest(w === 0 ? 0 : 1, 'dance'); if(w >= 0) tableGest(1 - w, 'oops'); UISound.play(w === 0 || T.two ? 'win' : 'error'); pointAt(null); closePeek(); if(w === 0 || T.two) burst($('t-score'), ['🎉', '⭐', '🏆', '✨']);
  const winName = w === 0 ? T.names[0] : w === 1 ? (T.names[1] || '🤖 Robot') : '';
  $('q-res').innerHTML = ''; $('q-res').classList.add('hidden');   // one save note on the page at a time
  $('t-res').innerHTML = '<div class="card"><h2>' + (w === 0 ? '🎉 ' + UI.esc(T.names[0]) + ' wins!' : T.two ? '🎉 ' + UI.esc(winName) + ' wins!' : '🤖 Robot wins this time') + '</h2>' + (T.two ? '' : '<div class="stars">' + '⭐'.repeat(stars) + '☆'.repeat(3 - stars) + '</div>') +
    '<div class="sc">' + my + ' : ' + op + (T.two ? '' : ' · 🏆 ' + score.toLocaleString()) + (exact ? ' · 🎯 ' + exact + '× exactly ' + M.target : '') + (sweep ? ' · 🧹 3-0 sweep!' : '') + '</div>' +
    (w !== 0 && !T.two ? '<div class="save-note">💡 ' + (kind === 'count' ? 'Keep one low and one high card — the rule can flip!' : 'Save a − side card for when you go over.') + '</div>' : '') +
    '<div class="save-note" id="save-note">' + (T.two ? '💾 Saving feats…' : '💾 Saving…') + '</div><div class="btns"><button class="btn sp-btn sp-primary" data-sound="pop" onclick="' + (kind === 'count' ? 'startCount()' : 'startJack()') + '">🔁 Again</button><button class="btn soft sp-btn sp-secondary" data-sound="none" onclick="leaveTable()">🎚️ Levels</button></div></div>';
  $('t-res').classList.remove('hidden'); NOTES.length = 0;
  const stats = {games: 1, wins: w === 0 ? 1 : 0, sweeps: sweep ? 1 : 0}; if(kind === 'jack') stats.exact = exact;
  if(T.two){ [0, 1].forEach(i => saveFeatsG(T.names[i], gidName, {games: 1, wins: w === i ? 1 : 0, sweeps: w === i && M.P[1 - i].wins === 0 ? 1 : 0, exact: kind === 'jack' ? M.P[i].exact : undefined}, i)); }
  else { if(w === 0) ls('sp_wisdeck_won_' + kind + ':' + S.player, Math.max(Number(ls('sp_wisdeck_won_' + kind + ':' + S.player)) || 0, Math.min(5, lv + 1)));
    saveRun(S.player, lv, {score, stars, cleared: w === 0, theme: kind === 'jack' ? '🎯 ' + M.target : '🤖 vs robot', stats}, 0, 0, gidName); }
}
function saveFeatsG(name, gid, stats, seat, tries){ tries = tries || 0; Object.keys(stats).forEach(k => stats[k] === undefined && delete stats[k]);
  google.script.run.withSuccessHandler(res => putNote(seat, UI.esc(name) + ': ' + featText(res, '✅ feats saved'))).withFailureHandler(() => { if(tries < 1) setTimeout(() => saveFeatsG(name, gid, stats, seat, tries + 1), 1200); else { writePending(readPending().concat([{name, gid, feats: stats}])); putNote(seat, '⚠️ Will be sent next time.'); } }).saveFeats(name, gid, stats); }

/* ================= 🂠 card backs (item line wdback: the best one you own) ================= */
const WD_BACKS = [['#1E2E5C', '#24366A', '🦉'], ['#1F6B3A', '#2E8B4E', '🌿'], ['#0B4F7A', '#1170A8', '🐙'], ['#7A1E0B', '#C2410C', '🌋'], ['#FF8AC5', '#FFC1E0', '🍬'], ['#2A1B6E', '#0B0A2E', '🪐'], ['#B5781A', '#F2B134', '👑'], ['#FF5C8A', '#3D6BFF', '🌈']];
function backOf(name){ const n = name ? Number((S.wdBack || {})[name]) || 0 : 0; return n > 0 ? Math.min(WD_BACKS.length - 1, n - 1) : -1; }
function backHtml(name){ const v = backOf(name); if(v < 0) return '<div class="wcard mini back"></div>'; const B = WD_BACKS[v]; return '<div class="wcard mini back" data-e="' + B[2] + '" style="background:repeating-linear-gradient(45deg,' + B[0] + ' 0 6%,' + B[1] + ' 6% 12%)"></div>'; }

/* ================= 📅 DAILY DECK ================= */
function dailyInfo(){ return S.wisDaily || {date: '', board: []}; }
function openDaily(){
  const d = dailyInfo(), me = (d.board || []).find(r => r.name === S.player);
  $('dl-date').textContent = d.date ? '📅 ' + d.date + ' · 5 questions · the same for the whole family' : 'Could not read today\'s date — try again';
  $('dl-note').innerHTML = me ? '✅ You played today: 🏆 ' + me.score.toLocaleString() + ' · ✅ ' + me.right + ' / 5 — come back tomorrow!' : '🃏 5 questions from 5 different categories. Right answers win the cards. Only your <b>first</b> try counts!<br><button class="btn sp-btn sp-primary gold" data-sound="pop" onclick="startDaily()">▶ Play today\'s deck</button>';
  $('dl-board').innerHTML = (d.board || []).length ? d.board.map((r, i) => '<div><span>' + (['🥇', '🥈', '🥉'][i] || '🎖️') + ' ' + UI.esc(r.name) + '</span><span>🏆 ' + r.score.toLocaleString() + ' · ✅ ' + r.right + '/5</span></div>').join('') : '<div><span>Nobody played yet today — be first!</span></div>';
  showScreen('daily');
}
function startDaily(){
  const d = dailyInfo(); if(!d.date){ UI.toast('Could not read today\'s date'); return; } if((d.board || []).some(r => r.name === S.player)){ UI.toast('✅ You already played today'); return; }
  Q = WD.dailyQuiz(WC, d.date); Q.room = 'show'; Q.gid = ++QID; $('q-title').textContent = '📅 WisDaily · ' + d.date;
  paintRoom(Q.room); $('q-res').classList.add('hidden'); view('quiz'); showScreen('play'); podStart(); renderQ();
}
function finishDaily(){
  const r = WD.result(Q), name = S.player, date = Q.daily; WD.winCards(S.deck, r.won, 1, WC);
  podGesture(r.right >= 4 ? 'dance' : r.right ? 'cheer' : 'oops'); UISound.play(r.right ? 'win' : 'error');
  $('t-res').innerHTML = ''; $('t-res').classList.add('hidden');
  $('q-res').innerHTML = '<div class="card"><h2>📅 WisDaily done!</h2><div class="sc">🏆 ' + r.score.toLocaleString() + ' · ✅ ' + r.right + ' / 5</div>' +
    (r.won.length ? '<div class="won">' + r.won.map(id => '<div class="w">' + cardHtml(C(id), {mini: true}) + '</div>').join('') + '</div>' : '') +
    '<div class="save-note" id="save-note">💾 Saving on the family board…</div><div class="btns"><button class="btn sp-btn sp-primary" data-sound="pop" onclick="leaveQuiz(\'daily\')">🏆 Family board</button></div></div>';
  $('q-res').classList.remove('hidden'); NOTES.length = 0;
  google.script.run.withSuccessHandler(res => { if(res && res.daily) S.wisDaily = res.daily; if(res && res.deck) S.settings['Deck_' + name] = JSON.stringify(res.deck); putNote(0, res && res.already ? '✅ You already played today — your first try counts.' : featText(res && res.feats, '✅ On today\'s family board')); })
    .withFailureHandler(() => putNote(0, '⚠️ Could not save today\'s deck — check the connection.')).saveWisDaily(name, {date, score: r.score, right: r.right, won: r.won});
  Q.over = true;
}

/* ================= 🔔 WISBUZZ ================= */
const BUZZ_KEYS = ['KeyQ', 'KeyP', 'KeyZ', 'KeyM'], BUZZ_COL = ['#3D6BFF', '#FF5C8A', '#22A867', '#FF8A3D'];
let BZ = {players: [], shelf: 'world', cat: 'wisflag', lv: 0}, B = null;
function openBuzzMenu(){
  if(!BZ.players.length || BZ.players[0] !== S.player){ BZ.players = [S.player].concat(S.players.filter(p => p.Name !== S.player).slice(0, 1).map(p => p.Name)); }
  $('bm-players').innerHTML = S.players.map(p => '<button class="chip' + (BZ.players.includes(p.Name) ? ' on' : '') + '" data-k="' + UI.esc(p.Name) + '" data-sound="tap">' + UI.esc(p.Name) + (BZ.players.includes(p.Name) ? ' · ' + 'QPZM'[BZ.players.indexOf(p.Name)] : '') + '</button>').join('');
  $('bm-players').querySelectorAll('.chip').forEach(b => b.onclick = () => { const n = b.dataset.k, k = BZ.players.indexOf(n); if(n === S.player) return;
    if(k >= 0) BZ.players.splice(k, 1); else if(BZ.players.length < 4) BZ.players.push(n); else { UISound.play('error'); UI.toast('4 players at most'); } openBuzzMenu(); });
  $('bm-shelves').innerHTML = WC.SHELVES.map(s => '<button class="chip' + (s.k === BZ.shelf ? ' on' : '') + '" data-k="' + s.k + '" data-sound="tap">' + s.icon + ' ' + s.en + '</button>').join('');
  $('bm-shelves').querySelectorAll('.chip').forEach(b => b.onclick = () => { BZ.shelf = b.dataset.k; BZ.cat = WC.catsOf(BZ.shelf)[0].k; openBuzzMenu(); });
  $('bm-cats').innerHTML = WC.catsOf(BZ.shelf).map(c => '<button class="chip' + (c.k === BZ.cat ? ' on' : '') + '" data-k="' + c.k + '" data-sound="tap">' + c.icon + ' ' + c.en + '</button>').join('');
  $('bm-cats').querySelectorAll('.chip').forEach(b => b.onclick = () => { BZ.cat = b.dataset.k; $('bm-cats').querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); });
  $('bm-level').innerHTML = WD.LEVELS.slice(0, 3).map((L, i) => '<button class="chip' + (i === BZ.lv ? ' on' : '') + '" data-k="' + i + '" data-sound="tap">' + L.icon + ' ' + L.name + ' · ' + L.choices + ' choices</button>').join('');
  $('bm-level').querySelectorAll('.chip').forEach(b => b.onclick = () => { BZ.lv = Number(b.dataset.k); $('bm-level').querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); });
  showScreen('bmenu');
}
function startBuzz(){
  if(BZ.players.length < 2){ UISound.play('error'); UI.toast('👥 Pick at least one more player'); return; }
  B = WD.buzzMatch({players: BZ.players.length, target: 7}); B.names = BZ.players.slice(); B.cat = BZ.cat; B.lv = BZ.lv; B.seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0; B.qs = []; B.won = B.names.map(() => []); B.gid = ++QID;
  const c = WC.CAT[B.cat]; $('b-title').textContent = '🔔 WisBuzz · ' + c.icon + ' ' + c.en; paintBuzzRoom(); view('buzz'); showScreen('play');
  $('b-buzzers').className = 'buzzers n' + B.n; $('b-buzzers').style.setProperty('--n', B.n);
  $('b-buzzers').innerHTML = B.names.map((n, i) => '<button class="buzz" data-p="' + i + '" data-sound="none" style="background:' + BUZZ_COL[i] + '"><canvas width="104" height="120"></canvas><span class="bn">' + UI.esc(n) + '<small>🔔 key ' + 'QPZM'[i] + '</small></span><span class="bs">0</span></button>').join('');
  $('b-buzzers').querySelectorAll('.buzz').forEach(b => { const i = Number(b.dataset.p); b.addEventListener('pointerdown', e => { e.preventDefault(); buzz(i); }); try{ drawPreviewCanvas(b.querySelector('canvas'), myAvatar(B.names[i]), {name: B.names[i], t: 1}); }catch(e){} });
  buzzQ();
}
function paintBuzzRoom(){ const el = $('b-room'), R = ROOMS.show; el.innerHTML = R.deco.concat(R.deco).map((d, i) => '<span class="deco" style="left:' + ((i * 37 + 7) % 92) + '%;top:' + ((i * 53 + 11) % 70) + '%">' + d + '</span>').join(''); }
function buzzQ(){
  if(!B.qs.length) B.qs = WD.buzzQuestions(WC, B.cat, B.lv, B.seed + B.qn * 7 + 1);
  B.q = B.qs.shift(); const q = B.q, cd = C(q.card), t = askText(cd); $('b-n').textContent = 'Q ' + (B.qn + 1) + ' · first to ' + B.target;
  let h = '<div class="qprompt">';
  if(q.type === 'pic' || q.type === 'formula') h += bigPic(cd) + '<div class="qt">' + t[0] + '</div>';
  else if(q.type === 'name') h += '<div class="qt">Which one is ' + UI.esc(cd.en) + '?</div><div class="qt-th">อันไหนคือ ' + UI.esc(cd.th) + '</div>';
  else if(q.type === 'listen') h += '<button class="btn sp-btn sp-primary gold" data-sound="none" onclick="sayCard(\'' + cd.id + '\',' + (q.tune ? 1 : 0) + ')">🔊 Listen</button><div class="qt">' + (q.tune ? 'Listen! Which instrument is playing?' : 'Listen! Which one is it?') + '</div>';
  else if(q.type === 'fact') h += '<div class="qfact">💬 ' + UI.esc(q.text) + '</div><div class="qt">Who or what is it?</div>';
  else if(q.type === 'tf'){ const sh = C(q.shown); h += (q.uni ? bigPic(cd) : '<div class="qfact">💬 ' + UI.esc(q.text) + '</div>') + '<div class="qt">' + (q.uni ? 'Is this ' : 'Is it ') + UI.esc(sh.en) + '?</div>'; }
  h += '</div><div class="bmsg" id="b-msg">🔔 Buzz to answer!</div><div id="b-ans"></div>';
  $('b-box').innerHTML = h;
  const pic = (q.type === 'name' || q.type === 'listen') && !q.tune;
  $('b-ans').innerHTML = q.type === 'tf' ? '<div class="tf"><button class="opt" data-tf="1" disabled>✅ True</button><button class="opt" data-tf="0" disabled>❌ False</button></div>' : '<div class="opts n' + q.options.length + '">' + q.options.map(id => optBtn(id, pic)).join('') + '</div>';
  $('b-ans').querySelectorAll('.opt').forEach(b => { b.disabled = true; b.onclick = () => buzzPick(b.dataset.tf != null ? b.dataset.tf === '1' : b.dataset.id, b); });
  if(q.type === 'listen') setTimeout(() => sayCard(cd.id, q.tune), 300 * SPEED);
  buzzPaint(); buzzTimer(20, () => buzzReveal(false));
}
function sayCard(id, tune){ const cd = C(id); if(tune){ playTune(cd); return; } try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(cd.en); u.rate = 0.9; speechSynthesis.speak(u); }catch(e){} }
function buzzPaint(){ $('b-buzzers').querySelectorAll('.buzz').forEach(b => { const i = Number(b.dataset.p); b.classList.toggle('on', B.turn === i); b.classList.toggle('cold', B.frozen.includes(i)); b.classList.toggle('outq', B.out.includes(i)); b.querySelector('.bs').textContent = B.score[i]; }); }
let BT = 0;
function buzzTimer(sec, done){ cancelAnimationFrame(BT); const gid = B.gid, t0 = performance.now(), tick = now => { if(!B || B.gid !== gid) return; const left = 1 - (now - t0) / (sec * 1000); $('b-tfill').style.transform = 'scaleX(' + Math.max(0, left) + ')'; if(left <= 0){ if(SPEED) done(); return; } BT = requestAnimationFrame(tick); }; BT = requestAnimationFrame(tick); }
function buzz(p){
  if(!B || B.over || !WD.buzzIn(B, p)){ if(B && B.frozen.includes(p)) UI.toast('🧊 ' + B.names[p] + ' is frozen this question'); return; }
  UISound.play('pop'); B.gid = ++QID; $('b-msg').textContent = '🔔 ' + B.names[p] + ' answers!'; $('b-ans').querySelectorAll('.opt').forEach(b => { b.disabled = false; }); buzzPaint(); buzzTimer(10, () => buzzPick(null, null));
}
function buzzPick(ans, btn){
  if(!B || B.phase !== 'answer') return; const q = B.q, ok = ans !== null && WD.judge(q, ans, WC), p = B.turn, res = WD.buzzAnswer(B, ok);
  if(ok){ B.won[p].push(q.win); UISound.play('success'); if(btn) btn.classList.add('right'); if(FX && btn) floatPts('+1 ' + B.names[p], btn); }
  else { UISound.play('error'); if(btn) btn.classList.add('wrong'); $('b-msg').textContent = '❌ ' + B.names[p] + ' — frozen next question!' + (res.next ? '' : ' Others can buzz…'); $('b-ans').querySelectorAll('.opt').forEach(b => { b.disabled = true; }); }
  buzzPaint(); B.gid = ++QID;
  if(res.next) buzzReveal(ok); else buzzTimer(15, () => buzzReveal(false));
}
function buzzReveal(ok){
  cancelAnimationFrame(BT); const q = B.q, cd = C(q.card), gid = ++QID; B.gid = gid; B.phase = 'done';
  $('b-ans').querySelectorAll('.opt').forEach(b => { b.disabled = true; if(q.type === 'tf' ? (b.dataset.tf === '1') === q.answer : b.dataset.id === q.answer) b.classList.add('right'); });
  if(!ok) $('b-msg').textContent = '💡 It was ' + cd.en + ' · ' + cd.th;
  if(B.over){ setTimeout(() => { if(B && B.gid === gid) finishBuzz(); }, 900 * SPEED); return; }
  $('b-msg').insertAdjacentHTML('afterend', '<div style="text-align:center;margin-top:6px"><button class="btn sp-btn sp-primary" data-sound="pop" id="b-next">▶ Next question</button></div>');
  const go = () => { if(B && B.gid === gid && B.phase === 'done'){ WD.buzzNext(B); buzzQ(); } };   // once only: the auto-next and a ▶ tap can't both move on (that wiped the 🧊 freeze — wd-9)
  $('b-next').onclick = go;
  if(ok) setTimeout(go, 1600 * SPEED);
}
function finishBuzz(){
  cancelAnimationFrame(BT); const w = B.winner, order = B.names.map((n, i) => i).sort((a, b) => B.score[b] - B.score[a]); UISound.play('win');
  $('b-res').innerHTML = '<div class="card"><h2>🏆 ' + UI.esc(B.names[w]) + ' wins WisBuzz!</h2>' + order.map((i, k) => '<div class="sc">' + (['🥇', '🥈', '🥉', '🎖️'][k]) + ' ' + UI.esc(B.names[i]) + ' · ' + B.score[i] + (B.won[i].length ? ' · 🃏 ' + B.won[i].length : '') + '</div>').join('') +
    '<div class="save-note" id="b-save">💾 Saving feats + cards…</div><div class="btns"><button class="btn sp-btn sp-primary" data-sound="pop" onclick="startBuzz()">🔁 Again</button><button class="btn soft sp-btn sp-secondary" data-sound="none" onclick="leaveBuzz()">🎚️ Levels</button></div></div>';
  $('b-res').classList.remove('hidden'); const notes = [];
  B.names.forEach((n, i) => { const st = {buzzRight: B.score[i]}; if(i === w) st.buzzWins = 1; if(!st.buzzRight) delete st.buzzRight;
    google.script.run.withSuccessHandler(fe => { notes[i] = UI.esc(n) + ': ' + featText(fe, '✅ saved'); $('b-save').innerHTML = notes.filter(Boolean).join('<br>'); }).withFailureHandler(() => { writePending(readPending().concat([{name: n, gid: 'wisdeck', feats: st}])); }).saveFeats(n, 'wisdeck', Object.keys(st).length ? st : {buzzRight: 0});
    if(B.won[i].length){ if(n === S.player) WD.winCards(S.deck, B.won[i], B.lv, WC); google.script.run.withFailureHandler(() => writePending(readPending().concat([{name: n, deck: {won: B.won[i], lv: B.lv}}]))).saveWisDeck(n, {won: B.won[i], lv: B.lv}); } });
}
function leaveBuzz(){ cancelAnimationFrame(BT); B = null; view('learn'); openBuzzMenu(); }
document.addEventListener('keydown', e => { if(!B || $('v-buzz').classList.contains('hidden')) return; const p = BUZZ_KEYS.indexOf(e.code); if(p >= 0 && p < B.n){ e.preventDefault(); buzz(p); }
  else if(B.phase === 'answer'){ const n = Number(e.key); if(n >= 1 && n <= 8){ const b = $('b-ans').querySelectorAll('.opt')[n - 1]; if(b && !b.disabled) b.click(); } } });

/* ================= BOOT ================= */
function boot(){
  UI.loading(GAME_ID);
  google.script.run.withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.progressCount = d.progressCount || {}; S.progressJack = d.progressJack || {}; S.wisDaily = d.wisDaily || null; S.wdBack = d.wdBack || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {};
      if(d.wisCards && WC.applyRows) WC.applyRows(d.wisCards);   // round 4: the "WisDeck Cards" sheet tab wins over the built-in list
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      flushPending();
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)){ choosePlayer(CURRENT_PLAYER); if(DEEP_GAME === 'book') openBook(); else if(DEEP_GAME === 'count' || DEEP_GAME === 'jack') openTableMenu(DEEP_GAME); else if(DEEP_GAME === 'daily') openDaily(); else if(DEEP_GAME === 'buzz') openBuzzMenu(); } else { renderPlayers(); showScreen('player'); }
    }).withFailureHandler(() => { UI.loaded(); UI.toast('Could not load players — check the connection', 'err'); renderPlayers(); showScreen('player'); })
    .getLevelGameData(GAME_ID, CURRENT_PLAYER);
}
boot();
/* 🎨 drawn pictures arrive in the background (wd-13): WisArt1, WisArt2 … from the server, one after another; the emoji shows until then */
const ART_LOAD = {n: 0, done: false};
function loadArt(i){ i = i || 1; if(i > 12){ ART_LOAD.done = true; return; }
  google.script.run.withSuccessHandler(body => { if(!body){ ART_LOAD.done = true; return; } UI.loadData(body).catch(() => {}).then(() => { ART_LOAD.n = i; artArrived(); loadArt(i + 1); }); })   /* 📦 size-1: code or {src, alt} */
    .withFailureHandler(() => { ART_LOAD.done = true; }).getWisArt(i); }
function artArrived(){ WC.all().forEach(c => { if(WC.hasArt(c)) c.pk = c.id; });
  try{ if(!$('v-learn').classList.contains('hidden') && L && L.k){ const i = L.i; $('l-strip').innerHTML = L.list.map((cd, k) => '<button class="sc" data-i="' + k + '" data-sound="none" aria-label="' + UI.esc(cd.en) + '">' + cardHtml(cd, {mini: true}) + '</button>').join(''); $('l-strip').querySelectorAll('.sc').forEach(b => b.onclick = () => showCard(Number(b.dataset.i), 0)); showCard(i, 0); } }catch(e){} }
setTimeout(() => loadArt(1), 400);
/* ✨ MODE SPOTLIGHT (modes-3): ?mode=<id> opens this game straight in that mode after the player pick · "✨ Also try" on the start page · started modes → UI.modeTried */
const MS_GAME = 'wisdeck';
function msOpen(id){
  if(['quiz', 'learn', 'buzz', 'daily', 'count', 'jack'].indexOf(id) >= 0) pickMode(id);
}
function msNow(){ return SET.mode; }
function msWrap(fn, idOf){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ try{ const id = idOf.apply(this, arguments); if(id && UI.modeTried) UI.modeTried(S.player || CURRENT_PLAYER, MS_GAME, id); }catch(e){} return f.apply(this, arguments); }; }
function msAfter(fn, after){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; }
msWrap('startQuiz', () => 'quiz');
msWrap('startLearn', () => 'learn');
msWrap('startCount', () => 'count');
msWrap('startJack', () => 'jack');
msWrap('startDaily', () => 'daily');
msWrap('startBuzz', () => 'buzz');
msAfter('choosePlayer', name => {
  if(!window.UI || !UI.modeLink) return;
  const id = UI.modeLink(MODE_LINK); if(id) msOpen(id);
  UI.alsoTry({game: MS_GAME, player: name, current: msNow, at: () => document.querySelector('#scr-menu .title'), open: msOpen});
});
/* ✨ END MODE SPOTLIGHT */
/* 📡 lk-wd1: 🔔 WisBuzz on own devices (LinkKit plan §50) — born split: the link code lives in the part WisDeck_link (GameParts),
   loaded the first time a room is used (📱 Own devices on the cover, or a ?link=<room> QR). Here only the door to it. */
function wdNeed(go){
  if(!(window.Link && Link.cover)){ UI.toast('📡 Own devices need the internet'); return; }
  if(typeof GameParts === 'undefined') return setTimeout(() => wdNeed(go), 40);   // the loader comes right after this script
  if(GameParts.has('WisDeck_link')) return go();
  UI.loading('wisdeck', '📡 Getting the room ready…');
  GameParts.need('WisDeck_link', ok => { UI.loaded(); if(ok) return go(); UISound.play('error'); UI.toast('📡 The room did not load — check the internet, then tap 📱 Own devices again'); });
}
function wdOwn(C){ wdNeed(() => { wbWire(); Link.cover(C, WB_ROOM); }); }
// 🔗 QR: ?page=wisdeck&link=<code> → the cover's 🔗 Join with the number filled in
function wdUrlCode(cb){
  try{ if(window.google && google.script && google.script.url && google.script.url.getLocation){ google.script.url.getLocation(l => cb(((l && l.parameter) || {}).link || '')); return; } }catch(e){}
  try{ cb(new URLSearchParams(location.search).get('link') || ''); }catch(e){ cb(''); }
}
msAfter('choosePlayer', () => wdUrlCode(c => { c = String(c || '').replace(/[^0-9]/g, '').slice(0, 4); if(c.length !== 4) return;
  setTimeout(() => { openCover(); if(WdCover) wdNeed(() => { wbWire(); Link.cover(WdCover, WB_ROOM); Link.cover.join(c); }); }, 0); }));
/* 📡 END lk-wd1 */
