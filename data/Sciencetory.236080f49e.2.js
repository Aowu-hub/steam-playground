
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
const THING_LINK = SP_TV[4];  // 🧲 Artifactory's "🔬 Test it in Sciencetory" button: ?game=<thing id> opens the lab on that thing
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});
const SESSION_START = Number(SP_TV[5]) || null;
const DURATION_MIN = Number(SP_TV[6]) || null;
const GAME_ID = 'sciencetory';
// UiKit lists (loader + ❓ card) are registered here, so UiKit itself is not touched (polish lane)
if(UI.KINDS && !UI.KINDS.sciencetory) UI.KINDS.sciencetory = ['🔬', 'Warming up the lab', 'bob'];
if(UI.GAME_HELP && !UI.GAME_HELP.sciencetory) UI.GAME_HELP.sciencetory = ['A science lab for the things YOU made in Artifactory: press it, pull it, twist it, drop it, float it… — ⚗️ Chemistry: hunt elements on the periodic table, snap atoms into molecules, collect 📇 element cards — ⚛️ Quantum: build real atoms from protons, neutrons + electrons — and 🔬 Particle: snap quarks into protons, read collider tracks, collect the 17 particle cards — and 🔥 Thermo: thermometers, a melt ladder, cup tests + mixing hot and cold water — and ⚡ Electro: circuits, conductors, magnets + electromagnets — and 🌈 Optics: rainbows, light vs paint, mirror mazes + magnifiers — and 🔊 Acoustics: sound waves, xylophone, echoes + thunder — and 🌍 Geo: scratch tests, rock types, a compass, Earth’s layers + a shake table — and 🧬 Bio: bones + levers, eyes + ears, heartbeats + hollow tubes — and 🌌 Cosmic: weight on other worlds, star shapes, sundials + planets.',
  'Pick a test and a thing (or a 🧪 lab sample) → set it in the rig → guess 👍 / 👎 → watch the gauge → read your 📋 test card.',
  'A test can break a thing — never lost! Fix it with 🔧 Repair in Artifactory. A right guess = bonus points.'];
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🔬', name: 'Sciencetory', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && G.phase !== 'done'), onLeave: () => { stopLoop(); },
  scoreMin: '5ch', onFit: () => { if(G) resize(); }});
BAR.score(0); BAR.miss(0); BAR.count('tests', '🧪', 0, 'Tests run today');
var NAV_INNER = {lab: ['◀ Sciencetory', () => { const f = SET.labFrom; if(f && SEC3[f]){ SET.labFrom = ''; SET.sec = f; openSec3(SET.level); } else showScreen('menu'); }], chem: ['◀ Sciencetory', () => { renderMenu(); showScreen('menu'); }], table: ['◀ Chemistry', () => openChem(SET.level)], qhub: ['◀ Sciencetory', () => { renderMenu(); showScreen('menu'); }], xhub: ['◀ Chemistry', () => openChem(SET.level)], phub: ['◀ Sciencetory', () => { renderMenu(); showScreen('menu'); }], pzoo: ['◀ Particle', () => openParticle(SET.level)]};
UI.navBar(document.getElementById('back-btn'), {onclick: false});
NAV_INNER.menu = ['◀ Sciencetory', () => openCover()];   // 🔬 sc-7: the setup's top button goes back to the 🎬 cover
const $ = id => document.getElementById(id);
let SCI_FX = 1;   // the harness sets 0: no waits, no confetti — whole tests run at once
function scPick(a){ return a[Math.floor(Math.random() * a.length)]; }
function fmtNum(v){ if(v == null) return '—'; if(v >= 99999) return '∞'; if(v >= 100) return Math.round(v).toLocaleString(); if(v >= 10) return String(Math.round(v * 10) / 10); return String(Math.round(v * 100) / 100); }

/* ================= DATA ================= */
const LEVEL_UI = [
  {emoji: '🌱', name: 'Basic', blurb: 'Small loads · your lab buddy gives hints · the next step glows'},
  {emoji: '🐣', name: 'Junior', blurb: 'A bit more · hints for your first few tests'},
  {emoji: '🔥', name: 'Intermediate', blurb: 'Real lab loads · no hints — trust your science!'},
  {emoji: '⚡', name: 'Hard', blurb: 'Guess the RANGE: low · middle · high'},
  {emoji: '🌋', name: 'Extreme', blurb: '4 ranges · huge loads · a faster rig'},
  {emoji: '💀', name: 'Hardcore', blurb: 'Biggest loads, fastest rig, no hints. ×3 points.', hardcore: true}
];
const AGE_START = {'4-5': 0, '6-7': 0, '8-9': 1, '10+': 2};
/* 🗂️ MODE GROUPS (mg-1) — the plan's 4 boxes, a learning path inside each (small → big). SC-1: ⚙️ Mechanic is live, the rest arrive in SC-2 … SC-4 */
const MODE_GROUPS = [{k: 'matter', icon: '⚗️', en: 'Matter', th: 'สสาร', c: '#8E5BD9'}, {k: 'forces', icon: '⚙️', en: 'Forces & Energy', th: 'แรงและพลังงาน', c: '#2F6FDB'},
  {k: 'waves', icon: '🌈', en: 'Waves & Space', th: 'คลื่นและอวกาศ', c: '#E0A21B'}, {k: 'earth', icon: '🌍', en: 'Earth & Life', th: 'โลกและชีวิต', c: '#2FA36B'}];
const SECTIONS = [
  {k: 'chem', g: 'matter', icon: '⚗️', name: 'Chemistry', type: 'A periodic-table lab', sub: 'Hunt elements, build molecules, collect cards', next: '👇 then pick a level'},
  {k: 'quantum', g: 'matter', icon: '⚛️', name: 'Quantum', type: 'An atom-building lab', sub: 'Protons, neutrons, electrons + shells', next: '👇 then pick a level'},
  {k: 'particle', g: 'matter', icon: '🔬', name: 'Particle', type: 'A particle lab', sub: 'Quarks, 17 particle cards, a mini collider', next: '👇 then pick a level'},   // sc-2d
  {k: 'mechanic', g: 'forces', icon: '⚙️', name: 'Mechanic', type: 'A materials test lab', sub: 'Press, pull, drop, spin your crafted things', next: '👇 then pick a level'},
  {k: 'thermo', g: 'forces', icon: '🔥', name: 'Thermo', type: 'A heat lab', sub: 'Thermometers, melting, warm cups, heat flow', next: '👇 then pick a level'},   // 🔥 sc-3a
  {k: 'electro', g: 'forces', icon: '⚡', name: 'Electro', type: 'An electricity lab', sub: 'Circuits, conductors, magnets, electromagnets', next: '👇 then pick a level'},   // ⚡ sc-3b
  {k: 'optics', g: 'waves', icon: '🌈', name: 'Optics', type: 'A light lab', sub: 'Rainbows, colour mixing, mirrors, lenses', next: '👇 then pick a level'},   // 🌈 sc-3c
  {k: 'acoustics', g: 'waves', icon: '🔊', name: 'Acoustics', type: 'A sound lab', sub: 'Sound waves, xylophone, echoes, thunder', next: '👇 then pick a level'},   // 🔊 sc-3d
  {k: 'cosmic', g: 'waves', icon: '🌌', name: 'Cosmic', type: 'A space lab', sub: 'Moon weight, stars, sundials, planets', next: '👇 then pick a level'},   // 🌌 sc-4c
  {k: 'geo', g: 'earth', icon: '🌍', name: 'Geo', type: 'An earth lab', sub: 'Scratch rocks, compass, quakes'},   // 🌍 sc-4a (no 👇 next line: the Earth box sits by the 💬 Tell us! corner on tablets)
  {k: 'bio', g: 'earth', icon: '🧬', name: 'Bio', type: 'A body lab', sub: 'Bones, eyes, ears, heartbeats'}   // 🧬 sc-4b (no 👇 next line: the Earth box sits by the 💬 Tell us! corner on tablets)
];
window.MODE_TYPE = {}; SECTIONS.forEach(s => { window.MODE_TYPE[s.k] = s.type; });
function mgList(){ return SECTIONS.map(s => ({k: s.k, g: s.g, icon: s.icon, name: s.name, type: s.type, sub: s.sub, next: s.next, soon: !!s.soon})); }
/* 🗂️ END MODE GROUPS */
// what each test measures, in kid words (the server SCI_TESTS_ has the numbers)
const TEST_UI = {
  press: 'How much weight it holds pressing down', pull: 'How hard you can pull before it snaps', twist: 'How much twisting it takes',
  flex: 'Does it bend and spring back?', fatigue: 'Little bends again and again', hardness: 'What can scratch it (Mohs scale)',
  sharp: 'Can its edge cut things?', drop: 'How high it can fall from', friction: 'Does it slide down a ramp?',
  balance: 'How far it tilts before it falls', spin: 'How long it keeps spinning', float: 'Does it float — or hold water?'
};
const SUIT = {k: 'labcoat'}, GOGGLES = {k: 'goggles'};   // 🥼 the lab buddy's suit (AvatarKit artSuit, page-only, never saved)
// 🗣️ the lab buddy talks: hints (🌱 Basic, first tests on 🐣 Junior), cheers, lessons
const HINT = {
  press: ['Metal and stone are great at being squeezed.', 'Squishy cloth just squashes flat!', 'Is it hollow? Hollow things squash easier.'],
  pull: ['Rope-like things (cloth, bamboo, metal) love pulling.', 'Stone, glass and clay hate being pulled.', 'A thin neck is where things snap first.'],
  twist: ['Metal twists without breaking.', 'Brittle stone and glass snap when twisted.', 'Wood twists a little, then cracks.'],
  flex: ['Bamboo and steel are springy!', 'Copper and gold bend — and STAY bent.', 'Glass and stone don\'t bend at all.'],
  fatigue: ['Paper clips break if you bend them many times.', 'Springy steel can bend thousands of times.', 'Stone snaps on the very first bend.'],
  hardness: ['The harder thing always scratches the softer one.', 'Gems are super hard — diamonds are the hardest of all.', 'Gold and tin are soft metals.'],
  sharp: ['A thin edge cuts better than a round one.', 'Hard materials keep a sharp edge.', 'Round things like balls can\'t cut.'],
  drop: ['Metal and cloth survive falls.', 'Glass and clay crack when they land.', 'Tough is not the same as hard!'],
  friction: ['Varnish makes things slippery.', 'Rough wood and stone grip the ramp.', 'Round things roll instead of sliding!'],
  balance: ['A wide bottom keeps things standing.', 'Tall and thin things tip over easily.', 'Heavy at the bottom = steady.'],
  spin: ['Round, even things spin longest.', 'Heavy things keep spinning — like a yo-yo!', 'Lumpy things wobble and stop.'],
  float: ['Wood floats, metal sinks.', 'Things lighter than water float.', 'Cups and bowls: does water leak out?']
};
const TALK = {
  set: ['Line it up — right in the green!', 'Centre it in the rig.', 'Steady… clamp it in the middle!'],
  guess: ['What do you think will happen?', 'Scientists guess first — that\'s a hypothesis!', 'Make your best guess!'],
  run: ['Here we go… watch the gauge!', 'Testing… 3, 2, 1!', 'Eyes on the needle!'],
  right: ['You guessed right — great science!', 'Your hypothesis was correct!', 'Spot on!'],
  wrong: ['Surprise! That\'s how we learn.', 'Not what we guessed — now we know!', 'Science is full of surprises!'],
  broke: ['Oops! It broke — never lost, we can fix it.', 'Crash test! Engineers break things on purpose.', 'Snap! Now we know its limit.'],
  pass: ['It held! Strong stuff.', 'It passed the test!', 'Look at that — it did it!']
};
// 💡 why — the lesson on the test card (by test + what happened), kid-safe facts only
const WHY = {
  press: {hold: 'It pushed back as hard as the press pushed down — squeezing is easy for solid metal, stone and thick wood.', crush: 'The press pushed harder than the stuff could push back, so it crushed. Thin walls and hollow shapes crush first.', squish: 'Cloth is soft: it squashes flat and springs back — it can\'t break by squeezing!'},
  pull: {hold: 'Pulling stretches the stuff a tiny bit. Metal, bamboo and cloth hold on tight — that is called tensile strength.', snap: 'Stone, glass and clay are strong when squeezed but weak when pulled — they snap.', stretch: 'Cloth stretches and holds — ropes and nets are made of strong threads.'},
  twist: {hold: 'Twisting turns one end against the other. Metal can twist a lot before it gives up.', snap: 'A twist pulls the stuff sideways — brittle things snap with a crack.', wring: 'Cloth just twists up like a wet towel — no snap!'},
  flex: {spring: 'It bent and sprang back — that is called elasticity. Springs work like this.', bent: 'It bent and stayed bent — soft metals do that. That\'s how blacksmiths shape them!', snap: 'Brittle things can\'t bend — they snap instead.', flop: 'Cloth flops over — it has no stiffness to spring back.'},
  fatigue: {hold: 'Small bends add up, but this one is tough enough. Springy steel can bend thousands of times.', crack: 'Every little bend makes tiny cracks — after many bends they join up and it breaks. That\'s metal fatigue!', flop: 'Cloth folds as often as you like — it never gets tired.'},
  hardness: {clean: 'It is harder than the tool, so the tool slid off. The Mohs scale goes from soft talc (1) to diamond (10).', scratch: 'The tool was harder, so it left a scratch. The harder thing always wins!', tiny: 'Equal hardness: just a tiny mark. Same hardness = they scratch each other a little.'},
  sharp: {cut: 'A thin, hard edge pushes all the force into a tiny line — that\'s why it cuts.', blunt: 'Its edge is too round or too soft to cut — the force spreads out.'},
  drop: {bounce: 'Tough stuff bends a tiny bit when it lands and soaks up the bump.', shatter: 'Brittle things can\'t bend, so the bump cracks them. Hard is not the same as tough!', flutter: 'Cloth is light and floppy — air slows it down and it lands softly.'},
  friction: {grip: 'Friction is the grip between two surfaces. Rough things grip more.', slide: 'Smooth or shiny things have less friction, so they slide. Varnish makes things slippery!', roll: 'Round things roll! Rolling needs much less push than sliding — that\'s why wheels are round.'},
  balance: {stand: 'Its weight stays above its base, so it stays up. Wide and low = steady.', topple: 'When the weight goes past the edge of the base, it tips over. Tall and thin tips first.', roll: 'A ball has no flat bottom — it can\'t stand still on a slope.'},
  spin: {spin: 'Round, even things keep spinning — heavy ones even longer (a yo-yo!).', slow: 'It spins, but friction slows it down.', wobble: 'Lumpy things are heavier on one side — they wobble and stop fast.'},
  float: {float: 'It is lighter than the same amount of water, so the water holds it up. Wood is about 0.7 — water is 1.', sink: 'It is heavier than the same amount of water, so it sinks.', plop: 'Metal is many times heavier than water — it drops straight down! (Ships float because they hold lots of air.)',
    hold: 'No holes, no leaks — a good container! Glaze and varnish seal the tiny holes.', seep: 'Water slowly soaks through tiny holes. Unglazed clay and plain wood are full of them — glaze or varnish fixes that!', pour: 'Water pours straight out — there are gaps, or the wall is too thin.'}
};
const MAT_FACT = {wood: 'Wood is made of long fibres — strong along the grain.', metal: 'Metal atoms slide past each other, so metal bends instead of breaking.', stone: 'Stones and gems are crystals — very hard, but brittle.',
  clay: 'Fired clay is like stone: hard, but brittle.', glass: 'Glass is hard and smooth, but brittle.', fabric: 'Cloth is woven threads — strong when pulled, floppy when pushed.', plastic: 'Printed plastic is light and a bit bendy.', nature: 'Natural stuff is light and soft.', resin: 'Clear resin is a hard plastic, a bit brittle.'};

/* ================= STATE ================= */
let S = {players: [], progress: {}, settings: {}, avatars: {}, player: '', age: '', things: [], sci: {t: {}}, fam: {}, meta: null, tests: 0};
let SET = {sec: 'mechanic', level: 0, test: '', ref: ''};
let G = null, lockHandle = null, RAF = 0, CV = null, CX = null, DPR = 1, W = 0, H = 0, BUD = null;
function store(k){ return 'sp_sci_' + k + ':' + (S.player || ''); }
function ls(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }
function loadPrefs(){ try{ const p = JSON.parse(ls(store('prefs')) || '{}'); if(p.test && TEST_UI[p.test]) SET.test = p.test; }catch(e){} }
function savePrefs(){ ls(store('prefs'), JSON.stringify({test: SET.test})); }
function myAvatar(name){ const a = S.avatars[name]; return a ? fixAv(a) : defaultAvatar(name || 'player'); }
function suitAv(name){ const a = JSON.parse(JSON.stringify(myAvatar(name))); a.cw = Object.assign({}, a.cw || {}, {suit: SUIT, face: GOGGLES}); delete a.ride; return a; }
function META(){ return S.meta || {tests: {}, order: [], samples: [], tools: {}, mats: {}}; }
function matGroup(m){ const M = META().mats[m]; if(m === 'clay') return 'clay'; if(m === 'glass' || m === 'sglass') return 'glass'; if(m === 'fabric' || m === 'leather' || m === 'fdye') return 'fabric'; if(m === 'filament') return 'plastic'; if(m === 'resin') return 'resin'; return M ? M.group : 'wood'; }

/* ================= 💥 COMICS + 📣 CROWD HOOKS (for the 💥 Comics chat and the 📣 Cheer chat — the game draws no comics itself) =================
   GameComic.listen(fn) → fn('sciencetory', event, info) for: set (rig clamped), guess, run, pass, fail, broke, right, wrong, record, card
   .hold(on) pauses the rig animation · .area() = #lab · .mode() = 'sciencetory' while testing · slots: #comics-slot-menu · #comic-strip-slot (test card) */
const GC_LISTEN = [], GC_LOG = [];
function gcEmit(ev, info){ const e = Object.assign({ev, t: Date.now()}, info || {}); GC_LOG.push(e); if(GC_LOG.length > 60) GC_LOG.shift(); GC_LISTEN.forEach(fn => { try{ fn(GAME_ID, ev, e); }catch(x){} }); }
window.GameComic = {
  listen(fn){ GC_LISTEN.push(fn); return () => { const i = GC_LISTEN.indexOf(fn); if(i >= 0) GC_LISTEN.splice(i, 1); }; },
  log(){ return GC_LOG.slice(); }, hold(on){ if(G) G.held = !!on; }, area(){ return $('lab'); }, mode(){ return G && G.phase !== 'done' ? GAME_ID : null; }, state(){ return G; }
};

/* ================= MENUS ================= */
function showScreen(name){
  ['player', 'menu', 'lab', 'play', 'chem', 'table', 'hunt', 'formula', 'qhub', 'atom', 'led', 'glow', 'cat', 'xhub', 'exp', 'phub', 'pzoo', 'qk', 'col', 'shub', 'l3'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
  $('back-btn').classList.toggle('hidden', name === 'play' || name === 'hunt' || name === 'formula' || name === 'atom' || name === 'led' || name === 'glow' || name === 'cat' || name === 'exp' || name === 'qk' || name === 'col' || name === 'l3'); UI.navScreen($('back-btn'), name, NAV_INNER); window.scrollTo(0, 0);
  if(name !== 'lab') labHand(null);
  if(name !== 'menu') coverOff();   /* 🔬 sc-7: any lab / play screen hides the cover */
}
function progressOf(name){ return S.progress[name] || {unlocked: 0, tokens: [], best: []}; }
function canPlay(i){ const p = progressOf(S.player); if(i === 5) return p.unlocked >= 5; if(i === 4) return p.unlocked >= 4; return i <= Math.max(p.unlocked, AGE_START[S.age] || 0); }
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
  const p = S.players.find(x => x.Name === name), same = name === S.player; S.player = name; S.age = p ? p.Age : '';
  loadPrefs(); $('who-name').textContent = name; S.tests = Number(ls(store('today:' + new Date().toDateString()))) || 0; BAR.count('tests', '🧪', S.tests, 'Tests run today');
  const ml = UI.modeLink ? UI.modeLink(MODE_LINK) : '';
  if(ml && SECTIONS.some(s => s.k === ml && !s.soon)){ SET.sec = ml; }
  renderMenu(); showScreen('menu'); msAlso(); if(!ml && !THING_LINK) openCover();   /* 🔬 sc-7: the 🎬 cover first — links go straight on */
  if(!same && S.loadedFor !== name){ UI.call('getSciPlayer', [name], {kind: 'sciencetory', text: 'Opening your lab'}).then(r => { S.things = r.things || []; S.sci = r.sci || {t: {}}; S.fam = r.fam || {}; if(r.chem) CHEM = r.chem; if(r.atomSkins != null) S.atomSkins = r.atomSkins; S.loadedFor = name; afterThings(); }).catch(() => {}); }
  else afterThings();
  if(ml && !THING_LINK){ UI.toast('⚙️ Mechanic lab — now pick a level'); if(UI.modePoint) UI.modePoint($('level-list')); }
}
function afterThings(){
  // 🧲 opened from Artifactory's "🔬 Test it in Sciencetory": straight to the lab, that thing picked
  if(THING_LINK && !S.thingLinked && S.things.some(a => a.id === THING_LINK)){ S.thingLinked = true; const lv = recLevel(); openLevel(lv); pickThing(THING_LINK); UI.toast('🔬 Pick a test for your ' + (S.things.find(a => a.id === THING_LINK) || {}).name); }
}
function recLevel(){ for(let i = 5; i >= 0; i--) if(canPlay(i) && i <= Math.max(progressOf(S.player).unlocked, AGE_START[S.age] || 0) && i < 4) return i; return 0; }
/* ✨ MODE SPOTLIGHT (built in, sc-1): ?mode=<id> opens that section ONCE (UI.modeLink, in choosePlayer) · ✨ Also try banner under the
   title · UI.modeTried when a test starts (startTest). MODES_ row in Code.gs: sciencetory mechanic (more rows arrive with SC-2 … SC-4). */
function msNow(){ return SET.sec; }
function msOpen(id){ const s = SECTIONS.find(x => x.k === id); if(!s || s.soon) return; SET.sec = id; markModes(); if(UI.modePoint) UI.modePoint($('level-list')); }
function msAlso(){ if(UI.alsoTry) UI.alsoTry({player: S.player, game: GAME_ID, at: () => document.querySelector('#scr-menu .title'), current: msNow, noDrop: true, open: msOpen}); }
function changePlayer(){ renderPlayers(); showScreen('player'); }
function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">' + (SEC_LVL() ? 'Not played yet' : 'No test yet') + '</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span><span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }
function renderMenu(){
  const ml = $('mode-list');
  if(!ml.children.length) UI.modeGroups(ml, MODE_GROUPS, mgList(), {next: () => $('level-head'), onPick: k => { const s = SECTIONS.find(x => x.k === k);
    if(s && s.soon){ UISound.play('error'); UI.toast('🔜 ' + s.icon + ' ' + s.name + ' opens in the next lab update (' + s.soon + ') — try ⚙️ Mechanic now!'); return 'stop'; }
    SET.sec = k; markModes(); return false; }});
  ml.querySelectorAll('.ui-mbtn').forEach(b => { if(SECTIONS.find(s => s.k === b.dataset.k && s.soon)) b.classList.add('soon'); });
  markModes(); renderLevels();   /* 🔬 sc-7: 🏆 leaders live on the cover */
}
var QUANT_LVL = [['⚖️ protons + guides', 'The next step glows · atoms H to Ne · LED steps with numbers'], ['🔢 numbers', 'Atomic numbers · pick your own light · 10 cat boxes'], ['⚪ + neutrons', 'Neutrons + mass numbers · LEDs without numbers · odd chances'], ['📛 names', 'Names only · real-world LEDs · glow on a time limit'], ['⚡ ions + mixes', 'Ions · mix LED light · 30 cat boxes'], ['💀 one try', 'Timers + one try in every Quantum game']];   // sc-2b2: covers all four games   // sc-2b
function SEC_LVL(){ return SET.sec === 'chem' ? CHEM_LVL : SET.sec === 'quantum' ? QUANT_LVL : SET.sec === 'particle' ? PART_LVL : SEC3[SET.sec] ? SEC3[SET.sec].lvl : null; }
var CHEM_LVL = [['🔤 letters + glow', 'Match the letters · the row lights up · easy molecules'], ['🔤 letters', 'Find the letters on the whole table · 2–3 kinds of atoms'], ['🔢 numbers', 'Find the atomic number · extra atoms in the kit'], ['📛 names', 'The name only — find its letters yourself · 💡 formula costs points'], ['💡 facts', 'A fact, the name hidden · the molecule name only'], ['💡 facts · ⏱️', '15 s a clue, no numbers · one check per molecule']];   // sc-2a2: ⚗️ level cards
function markModes(){ if($('level-list') && $('level-list').children.length) setTimeout(renderLevels, 0); $('mode-list').querySelectorAll('.ui-mbtn').forEach(b => b.classList.toggle('on', b.dataset.k === SET.sec)); const s = SECTIONS.find(x => x.k === SET.sec) || SECTIONS[3]; $('level-head').textContent = '🎚️ 2. Pick a level — ' + s.icon + ' ' + s.name + ' lab'; if(window.markPicks) markPicks(); }   /* 🔬 sc-7 */
function openSection(lv){ SET.labFrom = ''; if(SET.sec === 'chem') openChem(lv); else if(SET.sec === 'quantum') openQuantum(lv); else if(SET.sec === 'particle') openParticle(lv); else if(SEC3[SET.sec]) openSec3(lv); else openLevel(lv); }
function renderLevels(){
  const box = $('level-list'); box.innerHTML = ''; const p = progressOf(S.player), rec = AGE_START[S.age];
  LEVEL_UI.forEach((U, i) => {
    const open = canPlay(i), done = p.unlocked > i, b = document.createElement('button');
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (U.hardcore ? ' hardcore' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none'); b.dataset.lv = i;
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + U.emoji + '</div><div class="nm">' + U.name + '</div><div class="learn">' + (SEC_LVL() ? SEC_LVL()[i][0] : i >= 3 ? 'guess a range' : 'guess 👍 / 👎') + '</div><div class="sub">' + (U.hardcore && !open ? '🔒 Beat Extreme to open 💀 Hardcore' : SEC_LVL() ? SEC_LVL()[i][1] : U.blurb) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore' : 'Get ⭐⭐ on the level before to unlock it'); return; } chooseLevel(i); };   /* 🔬 sc-7: a tap picks, ▶ Start opens */
    b.dataset.i = i; box.appendChild(b);
  });
  b3Restore();
}

/* 🔬 sc-7 (Game Baseline): ONE setup page — 🔬 lab + 🎚️ level, then ▶ Start; the level is remembered per player */
let chosenLevel = 0;
const setupKey = k => 'sp_sciencetory_' + k + ':' + (S.player || '');
function chooseLevel(i, quiet){
  chosenLevel = i; try{ localStorage.setItem(setupKey('lv'), String(i)); }catch(e){}
  markPicks(); if(!quiet){ const w = $('btn-start'); if(w && w.scrollIntoView) w.scrollIntoView({behavior: 'smooth', block: 'nearest'}); }
}
function markPicks(){
  document.querySelectorAll('#level-list .lvl[data-i]').forEach(b => { const on = String(b.dataset.i) === String(chosenLevel); b.classList.toggle('sel', on); if(window.GF && GF.pick) GF.pick(b, on); });
  const U = LEVEL_UI[chosenLevel], sec = SECTIONS.find(x => x.k === SET.sec) || SECTIONS[3], st = $('btn-start');
  if(st && U) st.textContent = '▶ Start · ' + sec.icon + ' ' + sec.name + ' · ' + U.emoji + ' ' + U.name;
}
function b3Restore(){   // the last level per player (else the age start, else the highest open one)
  let i = -1; try{ const v = localStorage.getItem(setupKey('lv')); i = v === null ? -1 : Number(v); }catch(e){} const rec0 = AGE_START[S.age] || 0;
  chosenLevel = i >= 0 && canPlay(i) ? i : (canPlay(rec0) ? rec0 : Math.max(0, [0, 1, 2, 3, 4, 5].filter(canPlay).pop() || 0)); markPicks();
}
function startSetup(){ if(!canPlay(chosenLevel)){ UISound.play('error'); UI.toast('Pick a level that is open 🔓'); return; } coverOff(); openSection(chosenLevel); }
// 🎬 the cover (GameFrame): who's here + 🏆 champions + 📖 how the lab works; ▶ Play opens the setup page
let SciCover = null;
const SCI_VERSION = '7.0';   /* 🔬 sc-7: shown on the cover footer — bump with each round */
function coverOff(){ if(SciCover) SciCover.hide(); }
function b3Help(){   // the lab's own rules list (bold labels kept) for the cover's 📖 sheet; none → UiKit's 3 lines
  const t = $('b3-rules'); if(!t || !t.content) return undefined;
  const L = [...t.content.querySelectorAll('li')].map(li => { const c = li.cloneNode(true); c.querySelectorAll('b').forEach(b => b.replaceWith('**' + b.textContent.trim() + '**')); return c.textContent.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
  return L.length ? L : undefined;
}
function openCover(){
  if(!window.GF){ showScreen('menu'); return; }
  if(SciCover && SciCover.who !== S.player){ SciCover.destroy(); SciCover = null; }
  if(!SciCover){ SciCover = GF.cover(document.body, {game: GAME_ID, title: 'Sciencetory', icon: '🔬', version: SCI_VERSION, me: S.player, players: S.players, avatarOf: myAvatar, seats: {min: 1, max: 1},
      acts: ['beat.cheer', 'beat.jump'], backTo: WEBAPP_URL + '?page=gameroom' + sessionQuery(), backKind: 'rooms', help: b3Help(),
      onPlay: () => { SciCover.hide(); showScreen('menu'); } }); SciCover.who = S.player; }
  SciCover.show();
}

/* ================= 🧪 LAB SCREEN: pick a test + a thing ================= */
function openLevel(lv){
  SET.level = lv; const U = LEVEL_UI[lv];
  const from = SET.labFrom && SEC3[SET.labFrom]; NAV_INNER.lab[0] = from ? '◀ ' + from.name + ' lab' : '◀ Sciencetory';   // 🧪 sc-4d: back to the hub you came from
  $('lab-title').textContent = (from ? from.icon + ' ' + from.name + ' tests' : '⚙️ Mechanic') + ' · ' + U.emoji + ' ' + U.name; $('lab-sub').textContent = U.blurb;
  if(!SET.test) SET.test = 'press';
  renderTests(); renderThings(); showScreen('lab'); updateGo();
}
function testMeta(k){ return META().tests[k] || {icon: '🧪', name: k, unit: '', ch: [0, 0, 0, 0, 0, 0]}; }
function renderTests(){   // 🧪 sc-4d: two labelled rows — ⚙️ strength tests · 🔬 science tests on your things
  const box = $('test-list'), ord = META().order.length ? META().order : Object.keys(TEST_UI);
  const card = (k, i) => { const T = testMeta(k), r = (S.sci.t || {})[k];
    return '<button class="tcard' + (SET.test === k ? ' on' : '') + (T.br ? ' brk' : '') + (T.sec ? ' xs ' + (MT_ACC[k] || '') : '') + '" data-sound="tap" data-t="' + k + '" style="animation:sc-pop .4s ' + (i * 0.03) + 's both"><span class="ic">' + T.icon + '</span><span class="nm">' + UI.esc(T.name) + '</span><span class="sub">' + UI.esc(TEST_UI[k] || '') + '</span>' +
      (r && r.n ? '<span class="bst">✔ ' + r.n + '× tested' + (r.best ? ' · best ' + fmtNum(r.best) + ' ' + T.unit : '') + '</span>' : '') + '</button>'; };
  const str = ord.filter(k => !testMeta(k).sec), sci = ord.filter(k => testMeta(k).sec);
  box.innerHTML = (sci.length ? '<div class="tgrp">⚙️ Strength tests <small>🧪 = can break your thing</small></div>' : '') + str.map(card).join('') +
    (sci.length ? '<div class="tgrp xs">🔬 Science tests on your things <small>☕ 💡 🧲 🌈 🔔 · nothing breaks</small></div>' + sci.map((k, n) => card(k, n + str.length)).join('') : '');
  box.querySelectorAll('[data-t]').forEach(b => b.onclick = () => pickTest(b.dataset.t));
  $('test-hint').textContent = '🧪 = can break your thing (🔧 repair in Artifactory)';
}
function pickTest(k){
  if(!TEST_UI[k]) return; SET.test = k; savePrefs();
  $('test-list').querySelectorAll('.tcard').forEach(b => b.classList.toggle('on', b.dataset.t === k));
  if(SET.ref && !thingOk(SET.ref, k).ok) SET.ref = '';
  renderThings(); updateGo();
  if(SCI_FX && !SET.ref){ const tb = $('thing-box'); if(tb && tb.scrollIntoView) try{ setTimeout(() => tb.scrollIntoView({behavior: 'smooth', block: 'start'}), 120); }catch(e){} }
}
function sampleThing(m){ const s = META().samples.find(x => x.m === m) || {m, name: m + ' sample', icon: '🧪'}; return {id: 'sample:' + m, kind: 'sample', name: s.name, icon: s.icon, look: {k: 'sample', m, q: 80}, sample: true, sci: {m, no: m === 'fabric' ? {balance: 'Soft cloth flops over — try something that stands.', spin: 'It can’t spin on its own — try something round.', warm: 'Soft cloth can’t hold cocoa — try a cup, bowl or goblet.'} : {}}}; }
function thingOf(ref){ if(/^sample:/.test(ref)) return sampleThing(ref.slice(7)); return S.things.find(a => a.id === ref) || null; }
function thingOk(ref, test){ const a = thingOf(ref); if(!a) return {ok: false, why: 'Pick a thing'}; if(a.look && a.look.br && !a.sample) return {ok: false, why: 'It is broken — 🔧 repair it in Artifactory first.', broken: true};
  const no = a.sci && a.sci.no && a.sci.no[test]; return no ? {ok: false, why: no} : {ok: true}; }
function renderThings(){
  const box = $('thing-box'), mine = S.things.filter(a => a.owners && a.owners.indexOf(S.player) >= 0), test = SET.test;
  let h = '';
  if(mine.length) h += '<div class="things-head">🧰 Things you made (' + mine.length + ')</div><div class="things" id="thing-list">' + mine.map(a => thingBtn(a, test)).join('') + '</div>';
  else h += '<div class="none-yet">🏭 Nothing crafted yet — make something in Artifactory and test it here!<button class="sp-btn sp-secondary sp-sm" data-sound="none" onclick="goArtifactory()">🏭 Go to Artifactory</button></div>';
  h += '<div class="things-head">🧪 Lab samples — everyone can test these (never kept)</div><div class="things" id="sample-list">' + META().samples.map(s => thingBtn(sampleThing(s.m), test)).join('') + '</div>';
  box.innerHTML = h;
  box.querySelectorAll('[data-ref]').forEach(b => { const a = thingOf(b.dataset.ref), cv = b.querySelector('canvas'); if(cv) paintThumb(cv, a); b.onclick = () => pickThing(b.dataset.ref); });
  const hint = $('thing-hint'); hint.textContent = test ? '· for ' + testMeta(test).icon + ' ' + testMeta(test).name : '';
  if(UI.pageRows){ UI.pageRows('#thing-list', {rows: 2}); UI.pageRows('#sample-list', {rows: 1}); }
}
function thingBtn(a, test){ const o = thingOk(a.id, test), on = SET.ref === a.id;
  return '<button class="thing' + (on ? ' on' : '') + (o.ok ? '' : o.broken ? ' brk no' : ' no') + '" data-sound="' + (o.ok ? 'pop' : 'none') + '" data-ref="' + UI.esc(a.id) + '" title="' + UI.esc(o.ok ? a.name : o.why) + '">' + (a.look && a.look.br && !a.sample ? '<span class="tag">💥</span>' : '') +
    '<canvas width="180" height="180"></canvas><span class="nm">' + UI.esc(a.name) + '</span><span class="sub">' + UI.esc(matName(a)) + '</span></button>'; }
function matName(a){ const m = (a.sci && a.sci.m) || (a.look && (a.look.m || a.look.g)) || ''; const M = META().mats[m]; return M ? M.icon + ' ' + M.name : ''; }
function paintThumb(cv, a){ const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); drawThing(g, a, cv.width / 2, cv.height * 0.9, cv.height * 0.72, 1, {}); }
function pickThing(ref){
  const o = thingOk(ref, SET.test);
  if(!o.ok){ UISound.play('error'); UI.toast(o.broken ? '💥 ' + o.why : '🚫 ' + o.why); if(o.broken) say(o.why, 'warn'); return false; }
  SET.ref = ref; document.querySelectorAll('#thing-box .thing').forEach(b => b.classList.toggle('on', b.dataset.ref === ref)); updateGo(); return true;
}
function updateGo(){
  const b = $('go-btn'), ok = !!(SET.test && SET.ref && thingOk(SET.ref, SET.test).ok);
  b.disabled = !ok; b.textContent = ok ? '🔬 Start the ' + testMeta(SET.test).name.toLowerCase() + ' test' : SET.ref ? '🔬 Start the test' : '👆 Pick a thing to test';
  b.onclick = () => startTest();
  // 🌱 guided: the next thing to tap glows + a pointing hand
  const guided = SET.level === 0 && !$('scr-lab').classList.contains('hidden');
  document.querySelectorAll('.glow-next').forEach(e => e.classList.remove('glow-next'));
  if(!guided){ labHand(null); return; }
  const next = ok ? b : document.querySelector('#thing-box .thing:not(.no)');
  if(next){ next.classList.add('glow-next'); labHand(next); }
}
function labHand(el){ let h = document.querySelector('.lab-hand'); if(!el){ if(h) h.remove(); clearInterval(labHand.t); return; }
  if(!h){ h = document.createElement('div'); h.className = 'lab-hand'; h.textContent = '👆'; document.body.appendChild(h); }
  const place = () => { if(!el.isConnected || el.offsetParent === null){ h.style.display = 'none'; return; } const r = el.getBoundingClientRect(); h.style.display = r.bottom < 0 || r.top > innerHeight ? 'none' : ''; h.style.left = (r.left + r.width * 0.6) + 'px'; h.style.top = (r.top + r.height * 0.55) + 'px'; };
  place(); clearInterval(labHand.t); labHand.t = setInterval(place, 200); }
function goArtifactory(){ UI.go(WEBAPP_URL + '?page=artifactory' + sessionQuery(), 'artifactory', 'Opening Artifactory'); }

/* ================= 🖌️ DRAWING: things, samples ================= */
function matCol(m){ return (typeof ART_MAT !== 'undefined' && ART_MAT[m]) || '#9AA6B2'; }
// 🧪 a lab sample = a round test puck in the material's colour, with its icon
function drawPuck(g, m, x, y, h, t, yaw){
  const col = matCol(m), w = h * 0.95, ht = h * 0.5, ry = w * 0.18;
  const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, shade(col, 0.6)); gr.addColorStop(0.35, shade(col, 1.25)); gr.addColorStop(1, shade(col, 0.55));
  g.save(); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y - ry, w / 2, ry, 0, 0, Math.PI); g.lineTo(x - w / 2, y - ht); g.ellipse(x, y - ht, w / 2, ry, 0, Math.PI, 0, true); g.closePath(); g.fill();
  g.fillStyle = shade(col, 1.15); g.beginPath(); g.ellipse(x, y - ht, w / 2, ry, 0, 0, 7); g.fill(); g.strokeStyle = shade(col, 0.5); g.lineWidth = Math.max(1, h * 0.02); g.stroke();
  if(m === 'glass'){ g.globalAlpha = 0.35; g.fillStyle = '#FFFFFF'; g.fillRect(x - w * 0.3, y - ht + ry, w * 0.08, ht - ry * 1.4); g.globalAlpha = 1; }
  if(m === 'fabric'){ g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1; for(let i = 1; i < 6; i++){ g.beginPath(); g.moveTo(x - w / 2 + i * w / 6, y - ht + ry); g.lineTo(x - w / 2 + i * w / 6, y - ry); g.stroke(); } }
  const M = META().mats[m]; if(M){ const a = yaw == null ? 1 : Math.cos(yaw); if(a > 0.2) emo(g, M.icon, x + (yaw == null ? 0 : Math.sin(yaw) * w * 0.25), y - ht / 2 - ry * 0.2, h * 0.24 * a); }
  g.restore();
}
function drawThing(g, a, x, y, h, t, o){
  o = o || {}; if(!a) return;
  const look = Object.assign({}, a.look || {}); if(o.broken) look.br = look.br || 'load'; else if(o.whole) delete look.br;
  if(a.kind === 'sample' || look.k === 'sample'){ drawPuck(g, look.m, x, y, h, t, o.yaw); if(o.broken) crackOver(g, x, y, h); return; }
  if(o.view25 && typeof artView25 === 'function') artView25(g, look, x, y, h, o.yaw || 0, o.pitch == null ? 0.4 : o.pitch, t);
  else artDraw(g, look, x, y, h, t);
}
function crackOver(g, x, y, h){ g.save(); g.strokeStyle = '#1B1B1B'; g.lineWidth = Math.max(1.4, h * 0.03); g.lineJoin = 'round'; g.beginPath();
  [[-0.2, -0.45], [-0.06, -0.33], [-0.12, -0.22], [0.05, -0.15], [0.0, -0.05]].forEach((p, i) => { const px = x + p[0] * h, py = y + p[1] * h; if(i) g.lineTo(px, py); else g.moveTo(px, py); }); g.stroke(); g.restore(); }

/* ================= ▶ PLAY ================= */
function startTest(){
  const a = thingOf(SET.ref), T = testMeta(SET.test);
  if(!a || !thingOk(SET.ref, SET.test).ok){ UI.toast('Pick a test and a thing first'); return; }
  labHand(null);
  const lv = SET.level, guided = lv === 0 || (lv === 1 && (Number(ls(store('juniorHints'))) || 0) < 3);
  G = {test: SET.test, ref: SET.ref, thing: a, lv, T, phase: 'set', t: 0, guided, held: false,
    rig: {x: -0.8, dir: 1, speed: [0.55, 0.7, 0.9, 1.1, 1.35, 1.7][lv], score: 0}, guess: null, res: null, run: null, shown: 0, fx: [], yaw: 0.4};
  if(lv === 1 && guided) ls(store('juniorHints'), String((Number(ls(store('juniorHints'))) || 0) + 1));
  BAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name + ' · ' + T.icon + ' ' + T.name);
  showScreen('play'); hideResult(); BAR.fit(); resize(); buddyStart();
  setPhase('set'); say(scPick(TALK.set), 'tip');
  if(UI.modeTried) UI.modeTried(S.player, GAME_ID, SET.sec);
  gcEmit('start', {test: G.test, thing: a.name}); startLoop();
}
function setPhase(ph){
  if(!G) return; G.phase = ph; G.phaseT = G.t;
  const order = ['set', 'guess', 'run', 'done'], i = order.indexOf(ph);
  document.querySelectorAll('#steps span').forEach(s => { const k = order.indexOf(s.dataset.s); s.classList.toggle('on', k === i); s.classList.toggle('done', k < i); });
  const P = $('panel'), goal = $('goal'); P.innerHTML = ''; $('hand').classList.add('hidden');
  if(ph === 'set'){
    goal.innerHTML = '🗜️ Set the ' + UI.esc(G.thing.name) + ' in the middle of the rig'; goal.classList.remove('off');
    P.innerHTML = '<button class="sp-btn sp-primary sp-lg wide" id="clamp-btn" data-sound="none">🗜️ Clamp it!</button>'; $('clamp-btn').onclick = clampIt;
  } else if(ph === 'guess'){
    const q = questionOf(); goal.innerHTML = '🤔 ' + UI.esc(q); goal.classList.remove('off');
    if(G.lv < 3) P.innerHTML = '<button class="sp-btn sp-primary guess" id="g-yes" data-sound="none">👍 Yes</button><button class="sp-btn sp-secondary guess" id="g-no" data-sound="none">👎 No</button>';
    else P.innerHTML = rangeLabels().map((l, k) => '<button class="sp-btn sp-secondary rng" data-k="' + k + '" data-sound="none">' + l + '</button>').join('');
    P.querySelectorAll('button').forEach(b => b.onclick = () => guess(b.id === 'g-yes' ? 'yes' : b.id === 'g-no' ? 'no' : Number(b.dataset.k)));
    if(G.guided) setTimeout(() => { if(G && G.phase === 'guess') say('💡 ' + hintOf(), 'tip'); }, 500 * SCI_FX);
    else say(scPick(TALK.guess), 'tip');
  } else if(ph === 'run'){
    goal.innerHTML = G.T.icon + ' Testing… watch the gauge!'; P.innerHTML = '<div class="busy">🔬 ' + UI.esc(G.T.name) + ' test running…</div>';
  } else if(ph === 'done'){ goal.classList.add('off'); }
  if(G.guided) guideHand();
}
function guideHand(){ if(!G || G.phase !== 'set' && G.phase !== 'guess') return; const h = $('hand'), b = G.phase === 'set' ? $('clamp-btn') : $('g-yes') || $('panel').querySelector('button'); if(!b) return;
  const r = b.getBoundingClientRect(), L = $('lab').getBoundingClientRect(); h.style.left = (r.left - L.left + r.width * 0.55) + 'px'; h.style.top = (r.top - L.top + r.height * 0.3) + 'px'; h.classList.toggle('hidden', G.phase === 'guess' && !G.guided); if(G.phase === 'set') h.classList.remove('hidden'); }
function questionOf(){
  const T = G.T, a = G.thing, leak = G.test === 'float' && a.sci && a.sci.leak, base = leak ? T.leak : T, ch = base.ch[G.lv], tool = (META().tools[G.test] || [])[G.lv];
  if(G.lv >= 3){ const nm = leak ? 'How long will it hold water?' : {press: 'How much can it hold pressing down?', pull: 'How hard a pull can it take?', twist: 'How much twist can it take?', flex: 'How far can it bend and spring back?', fatigue: 'How many bends can it take?', hardness: 'How hard is it? (Mohs)', sharp: 'How sharp is its edge?', drop: 'How high a drop can it take?', friction: 'How steep can the ramp get before it slides?', balance: 'How far can it tilt before it falls?', spin: 'How long will it spin?', float: 'How heavy is it for its size? (water = 1)', warm: 'How long will it keep cocoa warm?', conduct: 'How bright will the bulb shine?', magnet: 'How many paper clips will it pick up?', light: 'How much torch light will reach the meter?', ring: 'How long will it ring?'}[G.test]; return nm; }
  return ((G.lv < 2 && base.q0) || base.q).replace('{c}', fmtNum(ch)).replace('{t}', tool ? tool[0] + ' ' + tool[1] : '');
}
function rangeLabels(){
  const a = G.thing, leak = G.test === 'float' && a.sci && a.sci.leak, base = leak ? G.T.leak : G.T, e = G.lv >= 4 ? base.bk4 : base.bk3, u = base.unit;
  const L = []; for(let i = 0; i <= e.length; i++){ L.push(i === 0 ? 'under ' + fmtNum(e[0]) + ' ' + u : i === e.length ? fmtNum(e[i - 1]) + '+ ' + u : fmtNum(e[i - 1]) + '–' + fmtNum(e[i]) + ' ' + u); }
  if(G.test === 'conduct') L[0] = '💡 no light'; if(G.test === 'magnet') L[0] = '🧲 no clips';   // 🧪 sc-4d
  return L;
}
function hintOf(){ const m = (G.thing.sci && G.thing.sci.m) || G.thing.look.m, M = META().mats[m]; return 'Think: ' + scPick(HINT[G.test] || ['What is it made of?']) + (M ? ' This one is ' + M.icon + ' ' + M.name + '.' : ''); }
// ① 🗜️ clamp: the thing slides on the rail, tap when it is in the green middle
function clampIt(){
  if(!G || G.phase !== 'set') return;
  const off = Math.abs(G.rig.x); G.rig.score = Math.max(0, Math.min(1, 1 - off / 0.7)); G.rig.done = true;
  const good = G.rig.score >= 0.6; UISound.play(good ? 'success' : 'tap'); bigWord(good ? '🗜️ Perfect!' : '🗜️ Clamped', !good);
  if(BUD) BUD.react(good ? 'happy' : 'close');
  say(good ? 'Right in the middle — a fair test!' : 'A bit off-centre — still OK. Centre = a fair test!', good ? 'good' : 'warn');
  gcEmit('set', {score: G.rig.score}); setPhase('guess');
}
// ② 🤔 guess, then ③ run — the server measures (the animation is the loader)
function guess(v){
  if(!G || G.phase !== 'guess') return; G.guess = v; UISound.play('tap'); gcEmit('guess', {guess: v});
  G.run = {t0: G.t, min: 2.4 * SCI_FX, wait: true}; G.shown = 0; setPhase('run'); say(scPick(TALK.run), 'tip');
  const me = G;
  google.script.run.withSuccessHandler(r => { if(G !== me) return; G.res = r; G.run.wait = false; if(!SCI_FX) finishRun(); })
    .withFailureHandler(e => { if(G !== me) return; UI.toast((e && e.message) || 'The lab could not run the test — try again', 'err'); setPhase('guess'); })
    .sciRun(S.player, G.ref, G.test, G.lv, v, G.rig.score);
}
// the value the gauge climbs to: pass → the level's goal · fail → where it gave up · measure tests → the number itself
function gaugeEnd(r){
  const ch = r.ch, v = r.inf ? ch * 1.5 : r.value;
  if(['hardness', 'sharp', 'spin', 'float', 'warm', 'conduct', 'magnet', 'light', 'ring'].includes(r.test)) return r.inf ? ch * 1.5 : v;
  if(r.test === 'flex') return r.how === 'spring' ? ch : r.how === 'bent' ? ch : Math.min(ch, v);
  return r.pass ? ch : Math.min(ch, v);
}
function gaugeMax(){ const r = G.res, ch = G.res ? G.res.ch : G.T.ch[G.lv]; if(MT_GMAX[G.test]) return MT_GMAX[G.test]; if(!r) return ch * 1.5; if(G.test === 'hardness') return 10; if(G.test === 'sharp') return 10; if(G.test === 'float' && !r.leak) return Math.max(3, Math.min(20, r.value * 1.2)); return Math.max(ch * 1.5, r.inf ? ch * 1.5 : Math.min(r.value, ch * 3)); }
function finishRun(){
  if(!G || !G.res || G.phase !== 'run') return;
  const r = G.res; G.outT0 = G.t; G.phase = 'out'; G.shown = gaugeEnd(r); mtFinish(r);
  S.tests++; ls(store('today:' + new Date().toDateString()), String(S.tests)); BAR.count('tests', '🧪', S.tests, 'Tests run today');
  if(r.broke){ UISound.play('error'); bigWord(r.sample ? '💥 Snap! (just a sample)' : '💥 It broke!', true); if(BUD) BUD.react('surprise'); say(scPick(TALK.broke), 'warn'); burst(); gcEmit('broke', r); }
  else if(r.pass){ UISound.play('success'); bigWord('✅ ' + passWord(r), false); if(BUD) BUD.react('joy'); say(scPick(TALK.pass), 'good'); gcEmit('pass', r); }
  else { UISound.play('tap'); bigWord('❌ ' + failWord(r), true); if(BUD) BUD.react('miss'); gcEmit('fail', r); }
  BAR.score((S.score = (S.score || 0) + r.score)); if(!r.right){ S.miss = (S.miss || 0) + 1; BAR.miss(S.miss); }
  // thing changed (broken) → update my list
  if(r.item && !r.sample){ const i = S.things.findIndex(a => a.id === r.item.id); if(i >= 0) S.things[i] = Object.assign({}, S.things[i], r.item); }
  // the record counts on this device
  const t = S.sci.t[r.test] || (S.sci.t[r.test] = {n: 0, best: 0}); t.n++; if(!r.sample && r.rec && r.rec.best != null && r.test !== 'float') t.best = Math.max(t.best || 0, r.rec.best);
  if(r.rec && r.rec.fam && !r.sample){ S.fam[r.test] = {v: r.rec.best, by: S.player, of: r.item.name}; gcEmit('record', r); }
  setTimeout(() => { if(G && G.res === r) showCard(); }, 1500 * SCI_FX);
}
function passWord(r){ return {press: 'It held!', pull: 'It held!', twist: 'It held!', flex: 'Boing — back!', fatigue: 'Still fine!', hardness: 'No scratch!', sharp: 'It cut!', drop: 'Survived!', friction: 'It stayed!', balance: 'Still standing!', spin: 'Spinning!', float: r.leak ? (r.how === 'hold' ? 'No leaks!' : 'It held long enough!') : 'It floats!', warm: 'Still warm!', conduct: 'It lights up!', magnet: 'It sticks!', light: r.x && r.x.mode === 'through' ? 'Light gets through!' : 'So shiny!', ring: 'Ding-g-g!'}[r.test] || 'Passed!'; }
function failWord(r){ return {flex: r.how === 'flop' ? 'Floppy!' : 'Stayed bent', hardness: 'Scratched', sharp: 'Too blunt', friction: r.how === 'roll' ? 'It rolled!' : 'It slid!', balance: r.how === 'roll' ? 'It rolled!' : 'It fell!', spin: 'Stopped', float: r.leak ? 'It leaks!' : 'It sank!', warm: 'Gone cold!', conduct: r.value ? 'Too dim!' : 'No light!', magnet: r.value ? 'Too few clips!' : 'No pull!', light: 'Too dull!', ring: r.value < 0.5 ? 'Thud!' : 'Too short!'}[r.test] || 'Not this time'; }

/* ================= 📋 THE TEST CARD ================= */
function showCard(){
  const r = G.res, T = G.T, a = G.thing, base = r.leak ? T.leak : T, u = base.unit;
  G.phase = 'done'; setPhase('done'); gcEmit('card', r);
  if(r.right){ if(BUD) BUD.react('win'); } else if(BUD) BUD.react('lose');
  const head = r.broke ? '💥 It broke!' : r.pass ? '✅ ' + passWord(r) : '❌ ' + failWord(r);
  const vText = r.inf ? '∞' : fmtNum(r.value), scale = gaugeMax(), pct = r.inf ? 100 : Math.max(3, Math.min(100, r.value / scale * 100)), chPct = Math.min(98, r.ch / scale * 100);
  const tool = r.tool ? r.tool[0] + ' ' + r.tool[1] : '';
  let h = '<h2>' + head + '</h2><div class="tc-top"><canvas id="tc-cv" width="184" height="184"></canvas><div class="tc-what"><b>' + T.icon + ' ' + UI.esc(T.name) + ' test</b>' + UI.esc(a.name) + ' · ' + UI.esc(matName(a)) +
    '<br>' + LEVEL_UI[G.lv].emoji + ' ' + LEVEL_UI[G.lv].name + ' · goal ' + (tool || mtGoal(r) || fmtNum(r.ch) + ' ' + u) + '</div></div>';
  h += '<div class="tc-num">' + vText + ' <small>' + UI.esc(u) + '</small></div>' + '<div class="tc-bar"><i class="' + (r.pass ? '' : 'bad') + '" style="width:' + pct + '%"></i><em style="left:' + chPct + '%" title="the goal"></em></div>';
  h += '<div class="rating">' + [1, 2, 3].map(i => '<span class="st' + (i <= r.stars ? '' : ' off') + '">⭐</span>').join('') + '</div>';
  h += '<div class="tc-row"><span class="' + (r.right ? 'ok' : 'no') + '">' + (r.right ? '🎯 Your guess was right! +100' : '🤔 Your guess: ' + guessText(r)) + '</span><span class="' + (r.rig >= 0.6 ? 'ok' : '') + '">🗜️ ' + (r.rig >= 0.6 ? 'Fair test' : 'Off-centre') + '</span><span class="gold">🏆 ' + r.score.toLocaleString() + '</span></div>';
  const fam = S.fam[r.test];
  if(!r.sample) h += '<div class="tc-row">' + (r.rec && r.rec.fam ? '<span class="gold">🏆 NEW family record!</span>' : r.rec && r.rec.mine ? '<span class="gold">⭐ Your new best!</span>' : '') + (fam ? '<span>👪 Family best: ' + fmtNum(fam.v) + ' ' + UI.esc(u) + ' · ' + UI.esc(fam.by) + '\'s ' + UI.esc(fam.of) + '</span>' : '') + '</div>';
  else h += '<div class="tc-row"><span>🧪 Lab sample — records are for things you made</span></div>';
  h += '<div class="why"><b>💡 Why?</b>' + UI.esc(whyText(r)) + '</div>';
  if(r.broke && !r.sample) h += '<div class="broke-box">💥 Broken things are never lost — fix it in Artifactory with 🔧 Repair (it may even get gold ✨ kintsugi seams!)<button class="sp-btn sp-primary sp-sm" id="res-repair" data-sound="pop">🔧 Repair it in Artifactory</button></div>';
  h += '<div class="save-note" id="save-note">' + saveText(r.save || {}, r.stars >= 2) + '</div>';
  h += '<div class="res-btns" id="res-btns"><button class="sp-btn sp-secondary" id="res-levels" data-sound="tap">🎚️ Levels</button><button class="sp-btn sp-secondary" id="res-again" data-sound="pop">🔁 Test again</button>' +
    '<button class="sp-btn sp-primary" id="res-next" data-sound="pop">Next test ▶</button></div><div class="comics-slot" id="comic-strip-slot"></div>';
  showResult(h);
  const cv = $('tc-cv'); if(cv) drawThing(cv.getContext('2d'), a, 92, 168, 132, 1, {broken: r.broke});
  $('res-levels').onclick = () => leavePlay();
  $('res-again').onclick = () => { hideResult(); if(thingOk(G.ref, G.test).ok) startTest(); else backToLab(); };
  $('res-next').onclick = () => backToLab();
  if($('res-repair')) $('res-repair').onclick = () => goArtifactory();
  if(r.pass && r.right && SCI_FX) confetti(['🔬', '⭐', '🧪', '🎉'], 22);
  if(r.save && r.save.unlocked != null){ const p = S.progress[S.player] || (S.progress[S.player] = {unlocked: 0, tokens: [], best: []}); p.unlocked = Math.max(p.unlocked, r.save.unlocked); if(r.save.best){ p.best = (p.best || []).slice(); p.best[G.lv] = r.save.best; } }
  if(UI.alsoTry) UI.alsoTry({player: S.player, game: GAME_ID, at: () => $('res-btns'), current: msNow, open: id => { leavePlay(); msOpen(id); }});
}
function guessText(r){ if(r.ranges){ const L = rangeLabels(); return (L[Number(r.guess)] || '?') + ' · it was ' + (L[r.bucket] || '?'); } return (r.guess === 'yes' ? '👍 yes' : '👎 no'); }
function whyText(r){
  const W0 = (WHY[r.test] || {})[r.how] || '', g = matGroup(r.m), extra = [];
  extra.push(isMyTest(r.test) ? mtWhy(r) : MAT_FACT[g] || '');   // 🧪 sc-4d
  const L = (G.thing.look || {});
  if(L.pi && ['press', 'drop'].includes(r.test)) extra.push('It is hollow — less stuff to take the push.');
  if(L.rp && !r.sample && !isMyTest(r.test)) extra.push('It was repaired before — a mended thing is a little weaker.');
  if(L.kg && !r.sample && !isMyTest(r.test)) extra.push('Its gold ✨ kintsugi seams make the mend extra strong.');
  if(L.q != null && L.q >= 90 && !r.sample && ['press', 'pull', 'twist', 'drop', 'fatigue'].includes(r.test)) extra.push('Your careful crafting (quality ' + L.q + ') made it stronger.');
  if(r.test === 'hardness' && r.tool) extra.push(r.tool[0] + ' A ' + r.tool[1] + ' is about ' + fmtNum(r.ch) + ' on the Mohs scale; this is ' + fmtNum(r.value) + '.');
  return [W0].concat(extra.filter(Boolean)).join(' ');
}
function saveText(res, cleared){
  if(res.err) return '⚠️ Could not save this test yet.';
  const h = res.newBadge ? '<span class="new-badge">🏅 New badge: ' + UI.esc(res.newBadge) + '</span>' : res.newHighScore && !res.firstTime ? '🎉 New high score!' : cleared ? '✅ Saved — ' + (G && G.lv < 5 ? 'the next level is open!' : 'great science!') : '✅ Saved — get ⭐⭐ (a right guess or a fair test) to open the next level';
  let o = h; const fe = res.feats; if(fe){ (fe.newTitles || []).forEach(t => { o += '<br><span class="title-new">🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name) + '</span>'; }); (fe.newBadges || []).forEach(b => { o += '<br><span class="feat-new">' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName + '</span>'; }); }
  return o;
}
function backToLab(){ hideResult(); stopLoop(); G = null; if(BUD){ BUD.stop(); BUD = null; } openLevel(SET.level); }
function leavePlay(){ hideResult(); stopLoop(); G = null; if(BUD){ BUD.stop(); BUD = null; } renderMenu(); showScreen('menu'); }
function showResult(html){ $('result-card').innerHTML = html; $('result').classList.remove('hidden'); }
function hideResult(){ $('result').classList.add('hidden'); }

/* ================= 🗣️ buddy + effects ================= */
function buddyStart(){
  const c = $('buddy'); if(BUD){ BUD.stop(); BUD = null; }
  try{ BUD = UI.buddy ? UI.buddy(c, {name: S.player + '·lab', av: suitAv(S.player)}, {per: 2}) : null; }catch(e){ BUD = null; }
}
let SAY_LAST = {};
function say(txt, mood){
  const el = $('say'); if(!el || !txt) return; const now = Date.now(); if(SAY_LAST[txt] && now - SAY_LAST[txt] < 8000) return; SAY_LAST[txt] = now;
  el.textContent = txt; el.className = 'say on ' + (mood || 'tip'); clearTimeout(say.t); say.t = setTimeout(() => { el.className = 'say'; }, 3600);
}
function bigWord(txt, bad){ if(!SCI_FX) return; const host = $('bigword-host'), d = document.createElement('div'); d.className = 'bigword' + (bad ? ' bad' : ''); d.textContent = txt; host.appendChild(d); setTimeout(() => d.remove(), 1200); }
function burst(){ if(!G) return; for(let i = 0; i < 18; i++) G.fx.push({x: 0, y: 0, vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 5 - 1, life: 1, c: matCol(G.res ? G.res.m : 'oak'), r: 2 + Math.random() * 4}); }
function confetti(list, count){ for(let i = 0; i < (count || 24); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = scPick(list); e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }

/* ================= 🔄 LOOP + LAYOUT ================= */
function resize(){
  CV = $('rig'); if(!CV) return; const r = $('lab').getBoundingClientRect(); DPR = Math.min(2, window.devicePixelRatio || 1); W = Math.max(1, r.width); H = Math.max(1, r.height);
  CV.width = Math.round(W * DPR); CV.height = Math.round(H * DPR); CX = CV.getContext('2d'); CX.setTransform(DPR, 0, 0, DPR, 0, 0);
  const pb = $('panel').getBoundingClientRect(), panelH = pb.height || 56, bw = Math.round(Math.max(64, Math.min(132, Math.min(W, H) * 0.24))), c = $('buddy');
  c.style.width = bw + 'px'; c.style.height = Math.round(bw * 1.25) + 'px';
  const land = W > H * 1.15;
  c.style.bottom = (land ? 8 : panelH + 22) + 'px'; if(land) c.style.bottom = 'calc(var(--safe-b, 18px) + ' + (panelH > 70 ? panelH + 8 : 4) + 'px)'; else c.style.bottom = 'calc(var(--safe-b, 18px) + ' + (panelH + 6) + 'px)';
  const sy = $('say'); sy.style.left = (bw + 14) + 'px'; sy.style.bottom = 'calc(var(--safe-b, 18px) + ' + (panelH + bw * 0.8) + 'px)';
  if(land){ sy.style.left = (bw * 0.5) + 'px'; }
  G && guideHand();
}
function rigBox(){
  const top = 72, pb = $('panel').getBoundingClientRect(), L = $('lab').getBoundingClientRect(), bot = Math.max(60, L.bottom - pb.top + 10), land = W > H * 1.15, bw = $('buddy').getBoundingClientRect().width;
  const x0 = land ? bw * 0.9 : 8, x1 = land ? W - 8 : W - 8;
  return {x: x0, y: top, w: x1 - x0, h: Math.max(80, H - top - bot - (land ? 0 : $('buddy').getBoundingClientRect().height * 0.55))};
}
function startLoop(){ stopLoop(); let last = performance.now(); const tick = now => { RAF = requestAnimationFrame(tick); const dt = Math.min(0.05, (now - last) / 1000); last = now; if(G && !G.held) step(dt); drawLab(); }; RAF = requestAnimationFrame(tick); }
function stopLoop(){ if(RAF) cancelAnimationFrame(RAF); RAF = 0; }
function step(dt){
  G.t += dt;
  if(G.phase === 'set'){ const R = G.rig; let sp = R.speed; if(G.guided && Math.abs(R.x) < 0.22) sp *= 0.25; R.x += R.dir * sp * dt; if(R.x > 1){ R.x = 1; R.dir = -1; } if(R.x < -1){ R.x = -1; R.dir = 1; } G.yaw += dt * 0.8; }
  if(G.phase === 'guess') G.yaw += dt * 0.6;
  if(G.phase === 'run'){ const el = G.t - G.run.t0, end = G.res ? gaugeEnd(G.res) : G.T.ch[G.lv] * 0.55;
    const k = Math.min(1, el / Math.max(0.01, G.run.min)); G.shown = G.res ? end * Math.min(1, 0.15 + 0.85 * k) : end * Math.min(1, el / 2.6);
    if(G.res && k >= 1) finishRun(); }
  G.fx.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.life -= dt * 0.8; }); G.fx = G.fx.filter(p => p.life > 0);
}
// ---------- the rig painter: one function per test, all in the same box ----------
function drawLab(){
  if(!CX || !G) return; const g = CX; g.clearRect(0, 0, W, H);
  if(!rigGlassBg(g)){ const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#13263F'); bg.addColorStop(1, '#0B1626'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 1; for(let x = 0; x < W; x += 28){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for(let y = 0; y < H; y += 28){ g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } }
  const R = rigBox(); if(R.h > R.w * 0.95){ const nh = R.w * 0.95; R.y += (R.h - nh) * 0.5; R.h = nh; }   // tall phones: a squarer rig in the middle of the screen, not a thin one on the floor
  const port = R.h > R.w * 0.8, u = Math.min(R.w, R.h) / 10, cx = R.x + R.w * (W > H * 1.15 ? 0.42 : 0.5), floor = R.y + R.h * 0.86, th = Math.min(R.h * 0.42, R.w * (port ? 0.4 : 0.32));
  // bench
  g.fillStyle = '#3A4D6B'; rrect(g, cx - R.w * 0.42, floor, R.w * 0.84, u * 0.7, u * 0.25); g.fill(); g.fillStyle = '#2A3A55'; g.fillRect(cx - R.w * 0.38, floor + u * 0.7, u * 0.5, R.h * 0.12); g.fillRect(cx + R.w * 0.38 - u * 0.5, floor + u * 0.7, u * 0.5, R.h * 0.12);
  const rp = G.res, out = G.phase === 'out' || G.phase === 'done', ok = out ? Math.min(1, (G.t - (G.outT0 || G.t)) / 0.9) : 0, a = G.thing;
  const P = {g, R, u, cx, floor, th, t: G.t, a, rp, out, ok, k: G.shown / (rp ? rp.ch : G.T.ch[G.lv]) || 0};
  if(G.phase === 'set'){ drawSet(P); }
  else (RIGS[G.test] || RIGS.press)(P);
  if(G.phase !== 'set') drawGauge(P);
  G.fx.forEach(p => { g.globalAlpha = Math.max(0, p.life); g.fillStyle = p.c; g.beginPath(); g.arc(cx + p.x * u * 0.6, floor - th * 0.5 + p.y * u * 0.6, p.r, 0, 7); g.fill(); }); g.globalAlpha = 1;
}
function drawSet(P){
  const {g, R, u, cx, floor, th, a} = P, half = R.w * 0.32, zone = half * 0.22, x = cx + G.rig.x * half;
  g.fillStyle = '#5B6F92'; rrect(g, cx - half - u * 0.4, floor - u * 0.35, half * 2 + u * 0.8, u * 0.35, u * 0.15); g.fill();
  g.fillStyle = 'rgba(34,195,161,' + (0.35 + 0.2 * Math.sin(G.t * 6)) + ')'; rrect(g, cx - zone, floor - u * 0.45, zone * 2, u * 0.55, u * 0.2); g.fill();
  g.fillStyle = '#C9D6EA'; [-1, 1].forEach(s => { rrect(g, cx + s * (half + u * 0.2) - u * 0.25, floor - th * 1.25, u * 0.5, th * 1.25, u * 0.2); g.fill(); });
  drawThing(g, a, x, floor - u * 0.3, th, G.t, {view25: true, yaw: G.yaw, pitch: 0.35});
  g.strokeStyle = Math.abs(G.rig.x) < 0.22 ? '#22C3A1' : '#FFC845'; g.lineWidth = 3; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(x, floor - th * 1.15); g.lineTo(x, floor + u * 0.1); g.stroke(); g.setLineDash([]);
  emo(g, '🎯', cx, floor + u * 0.95, u * 0.9);
}
function drawGauge(P){
  const {g, R, u} = P, r = Math.max(26, Math.min(64, Math.min(R.w, R.h) * 0.16)), gx = R.x + R.w - r - 6, gy = R.y + r + 4;
  const mx = gaugeMax(), ch = G.res ? G.res.ch : G.T.ch[G.lv], v = G.shown || 0, ang = q => Math.PI * (0.75 + 1.5 * Math.max(0, Math.min(1, q / mx)));
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(gx, gy, r, 0, 7); g.fill(); g.strokeStyle = '#2F6FDB'; g.lineWidth = 3; g.stroke();
  g.lineWidth = r * 0.16; g.strokeStyle = '#E4EEFB'; g.beginPath(); g.arc(gx, gy, r * 0.78, Math.PI * 0.75, Math.PI * 2.25); g.stroke();
  g.strokeStyle = G.res && !G.res.pass && P.out ? '#F25F5C' : '#22C3A1'; g.beginPath(); g.arc(gx, gy, r * 0.78, Math.PI * 0.75, ang(v)); g.stroke();
  if(G.test !== 'float' || (G.res && G.res.leak)){ const a2 = ang(ch); g.strokeStyle = '#E0A21B'; g.lineWidth = 3; g.beginPath(); g.moveTo(gx + Math.cos(a2) * r * 0.6, gy + Math.sin(a2) * r * 0.6); g.lineTo(gx + Math.cos(a2) * r * 0.98, gy + Math.sin(a2) * r * 0.98); g.stroke(); }
  else { const a2 = ang(1); g.strokeStyle = '#3BA0E8'; g.lineWidth = 3; g.beginPath(); g.moveTo(gx + Math.cos(a2) * r * 0.6, gy + Math.sin(a2) * r * 0.6); g.lineTo(gx + Math.cos(a2) * r * 0.98, gy + Math.sin(a2) * r * 0.98); g.stroke(); }
  const na = ang(v); g.strokeStyle = '#F25F5C'; g.lineWidth = 3; g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + Math.cos(na) * r * 0.7, gy + Math.sin(na) * r * 0.7); g.stroke(); g.fillStyle = '#16233A'; g.beginPath(); g.arc(gx, gy, 4, 0, 7); g.fill();
  const base = G.res && G.res.leak ? G.T.leak : G.T, txt = (G.res && G.res.inf && P.out ? '∞' : fmtNum(v)) + ' ' + base.unit;
  let fs = Math.max(11, r * 0.34); g.font = '800 ' + fs + 'px Fredoka, Nunito, sans-serif'; const tw = g.measureText(txt).width; if(tw > r * 1.5){ fs = Math.max(9, fs * r * 1.5 / tw); g.font = '800 ' + fs + 'px Fredoka, Nunito, sans-serif'; }
  g.textAlign = 'center'; g.fillStyle = '#16233A'; g.fillText(txt, gx, gy + r * 0.62);
}
function lerp(a, b, k){ return a + (b - a) * k; }
function ease(k){ return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
// how far the run is (0-1 while loading, outcome blend after)
const RIGS = {
  press(P){ const {g, R, u, cx, floor, th, a, rp, out, ok} = P, k = Math.min(1.1, P.k), top = floor - th * 1.05;
    g.fillStyle = '#C9D6EA'; g.fillRect(cx - R.w * 0.3, R.y, u * 0.45, floor - R.y); g.fillRect(cx + R.w * 0.3 - u * 0.45, R.y, u * 0.45, floor - R.y); g.fillStyle = '#2F6FDB'; rrect(g, cx - R.w * 0.32, R.y, R.w * 0.64, u * 0.8, u * 0.2); g.fill();
    const crushed = out && rp.broke, squish = out && rp.how === 'squish' ? Math.sin(Math.min(1, ok) * Math.PI) * 0.45 : 0, sq = Math.min(0.08, k * 0.06) + squish + (crushed ? 0.25 * ok : 0);
    const plateY = lerp(R.y + u * 0.8, top + th * sq, Math.min(1, k * 1.1 + (G.phase === 'run' ? 0 : 1))); g.fillStyle = '#7C8597'; g.fillRect(cx - u * 0.2, R.y + u * 0.8, u * 0.4, plateY - R.y - u * 0.8); g.fillStyle = '#A3ACBD'; rrect(g, cx - th * 0.75, plateY - u * 0.45, th * 1.5, u * 0.45, u * 0.12); g.fill();
    g.save(); g.translate(cx, floor); g.scale(1 + sq * 0.6, 1 - sq); drawThing(g, a, 0, 0, th, P.t, {broken: crushed}); g.restore();
    if(G.phase === 'run' || out && !crushed) emo(g, '⬇️', cx + th * 0.9, plateY - u * 0.8, u * 0.8); },
  pull(P){ const {g, R, u, cx, floor, th, a, rp, out, ok} = P, k = Math.min(1, P.k), snap = out && rp.broke, gap = snap ? ok * th * 0.5 : 0, st = 1 + k * 0.05, mid = floor - th * 0.55;
    [-1, 1].forEach(s => { g.fillStyle = '#2F6FDB'; rrect(g, cx + s * (th * 0.75 * st + gap) - u * 0.5 + (s > 0 ? 0 : -u * 0.0), mid - u * 1.1, u, u * 2.2, u * 0.25); g.fill(); emo(g, s < 0 ? '⬅️' : '➡️', cx + s * (th * 0.75 * st + gap + u * 1.4), mid, u * 0.8); });
    const draw1 = (clipL) => { g.save(); g.beginPath(); if(clipL) g.rect(cx - th * 2 - gap, R.y, th * 2, R.h); else g.rect(cx + gap, R.y, th * 2, R.h); g.clip(); g.translate(cx + (clipL ? -gap : gap), mid); g.rotate(-Math.PI / 2); g.scale(1, st); drawThing(g, a, 0, th / 2, th, P.t, {broken: snap}); g.restore(); };
    if(snap){ draw1(true); draw1(false); } else { g.save(); g.translate(cx, mid); g.rotate(-Math.PI / 2); g.scale(1, st); drawThing(g, a, 0, th / 2, th, P.t, {}); g.restore(); } },
  twist(P){ const {g, R, u, cx, floor, th, a, rp, out, ok} = P, k = Math.min(1, P.k), snap = out && rp.broke, top = floor - th;
    g.fillStyle = '#2F6FDB'; rrect(g, cx - th * 0.5, floor - u * 0.2, th, u * 0.5, u * 0.15); g.fill();
    const tw = (G.phase === 'run' ? k : out ? (snap ? 1 : 1 - ok * 0.6) : 0) * 0.35;
    g.save(); g.translate(cx, floor); g.transform(1, 0, -tw * 0.6, 1, 0, 0); if(snap && ok > 0){ g.save(); g.beginPath(); g.rect(-th, -th * 0.55, th * 2, th * 0.6); g.clip(); drawThing(g, a, 0, 0, th, P.t, {broken: true}); g.restore(); g.save(); g.translate(th * 0.3 * ok, -ok * u); g.rotate(ok * 0.5); g.beginPath(); g.rect(-th, -th * 1.2, th * 2, th * 0.66); g.clip(); drawThing(g, a, 0, 0, th, P.t, {broken: true}); g.restore(); }
    else drawThing(g, a, 0, 0, th, P.t, {}); g.restore();
    g.fillStyle = '#2F6FDB'; rrect(g, cx - th * 0.5 + tw * th * 0.6, top - u * 0.6, th, u * 0.5, u * 0.15); g.fill();
    g.strokeStyle = '#FFC845'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, top - u * 0.9, th * 0.6, u * 0.4, 0, Math.PI * 0.1, Math.PI * (0.1 + 1.6 * Math.max(0.1, k))); g.stroke(); emo(g, '🔄', cx + th * 0.8, top - u * 1.2, u * 0.9); },
  flex(P){ const {g, R, u, cx, floor, th, a, rp, out, ok} = P, k = Math.min(1, P.k), ch = rp ? rp.ch : G.T.ch[G.lv], left = cx - th * 0.7, mid = floor - th * 0.6;
    let ang = (G.phase === 'run' ? k : 1) * ch;
    if(out){ if(rp.how === 'spring') ang = ch * (1 - ok) + Math.sin(ok * 18) * (1 - ok) * 4; else if(rp.how === 'bent') ang = ch * (1 - ok * 0.4); else if(rp.how === 'flop') ang = lerp(ch, 70, ok); }
    g.fillStyle = '#2F6FDB'; rrect(g, left - u * 1.1, mid - u, u * 1.1, u * 2, u * 0.2); g.fill();
    const snap = out && rp.broke;
    g.save(); g.translate(left, mid); g.rotate(ang * Math.PI / 180 * (snap ? 1 + ok : 1)); if(snap) g.translate(ok * u, ok * ok * th); g.rotate(Math.PI / 2); drawThing(g, a, 0, th * 0.05, th, P.t, {broken: snap}); g.restore();
    emo(g, '⬇️', left + th * 1.1, mid - u * 1.2 + Math.sin(ang * Math.PI / 180) * th, u * 0.8);
    g.strokeStyle = 'rgba(255,200,69,0.5)'; g.setLineDash([4, 5]); g.beginPath(); g.moveTo(left, mid); g.lineTo(left + th * 1.1, mid); g.stroke(); g.setLineDash([]); },
  fatigue(P){ const {g, u, cx, floor, th, a, rp, out, ok} = P, left = cx - th * 0.7, mid = floor - th * 0.6, crack = out && rp.broke;
    const ang = G.phase === 'run' || !out ? Math.sin(P.t * 16) * 10 : crack ? 10 + ok * 60 : Math.sin(P.t * 16) * 10 * (1 - ok);
    g.fillStyle = '#2F6FDB'; rrect(g, left - u * 1.1, mid - u, u * 1.1, u * 2, u * 0.2); g.fill();
    g.save(); g.translate(left, mid); g.rotate(ang * Math.PI / 180); g.rotate(Math.PI / 2); drawThing(g, a, 0, th * 0.05, th, P.t, {broken: crack}); g.restore();
    g.font = '800 ' + Math.max(12, u * 0.7) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#FFFFFF'; g.fillText('🔁 ×' + fmtNum(Math.round(G.shown || 0)), cx, floor - th * 1.35); },
  hardness(P){ const {g, u, cx, floor, th, a, rp, out, ok} = P, tool = (META().tools.hardness || [])[G.lv] || ['🔩', 'nail'], k = G.phase === 'run' ? (P.t * 0.6) % 1 : out ? 1 : 0;
    drawThing(g, a, cx, floor, th, P.t, {});
    const sx = cx - th * 0.45 + k * th * 0.9, sy = floor - th * 0.5;
    if(out && rp.how !== 'clean'){ g.strokeStyle = rp.how === 'tiny' ? 'rgba(255,255,255,0.45)' : '#FFFFFF'; g.lineWidth = rp.how === 'tiny' ? 1.4 : 3; g.beginPath(); g.moveTo(cx - th * 0.45, sy + 4); g.lineTo(cx - th * 0.45 + th * 0.9 * ok, sy - 6); g.stroke(); }
    if(out && rp.how === 'clean' && ok < 1) for(let i = 0; i < 4; i++) emo(g, '✨', sx + Math.cos(i * 1.6 + P.t * 9) * u, sy + Math.sin(i * 2 + P.t * 7) * u, u * 0.6);
    emo(g, tool[0], sx + u * 0.4, sy - u * 0.6, u * 1.4); },
  sharp(P){ const {g, R, u, cx, floor, th, a, rp, out, ok} = P, tgt = (META().tools.sharp || [])[G.lv] || ['📄', 'paper'], k = G.phase === 'run' ? Math.min(1, P.k * 0.9) : 1, cut = out && rp.how === 'cut';
    const ty = floor - u * 0.8, s = u * 2.2;
    if(cut){ [-1, 1].forEach(d => { g.save(); g.beginPath(); g.rect(d < 0 ? cx - s : cx, ty - s, s, s * 2); g.clip(); emo(g, tgt[0], cx + d * ok * u * 1.2, ty + ok * u * 0.3, s); g.restore(); }); } else emo(g, tgt[0], cx, ty, s);
    const dy = out ? (cut ? 1 : 1 - Math.sin(ok * Math.PI) * 0.4) : k; g.save(); g.translate(cx, lerp(R.y + th * 0.3, ty - s * 0.25, dy)); g.rotate(Math.PI); drawThing(g, a, 0, 0, th * 0.8, P.t, {}); g.restore(); },
  drop(P){ const {g, R, u, cx, floor, th, a, rp, out, ok} = P, ch = rp ? rp.ch : G.T.ch[G.lv], top = R.y + u * 0.6, hgt = floor - top;
    const lx = Math.max(R.x + 52, cx - th * 1.05);   // 📏 height ruler — labels always on screen
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(lx, top); g.lineTo(lx, floor); g.stroke();
    g.font = '800 ' + Math.max(10, Math.min(16, u * 0.5)) + 'px Nunito, sans-serif'; g.fillStyle = '#C9D6EA'; g.textAlign = 'right'; [0, 0.5, 1].forEach(f => g.fillText(fmtNum(ch * f) + ' m', lx - 5, floor - hgt * f + 4));
    const lift = G.phase === 'run' ? Math.min(1, P.k) : 1; let y = floor - hgt * lift * 0.92, rot = 0, sh = false;
    if(out){ const f = Math.min(1, ok * 1.6); y = lerp(floor - hgt * 0.92, floor, ease(f)); if(f >= 1){ sh = rp.broke; if(rp.how === 'bounce'){ const b = (ok - 0.62) / 0.38; y = floor - Math.abs(Math.sin(b * Math.PI * 2)) * th * 0.4 * (1 - b); } if(rp.how === 'flutter') rot = Math.sin(P.t * 3) * 0.2; } else rot = Math.sin(P.t * 8) * 0.15 * (rp.how === 'flutter' ? 2 : 1); }
    g.fillStyle = '#5B6F92'; rrect(g, cx - th * 0.6, floor - hgt * lift * 0.92 - u * 0.2, th * 1.2, u * 0.25, u * 0.1); if(!out) g.fill();
    g.save(); g.translate(cx, y); g.rotate(rot); drawThing(g, a, 0, 0, th * 0.8, P.t, {broken: sh}); g.restore(); },
  friction(P){ const {g, R, u, cx, floor, th, a, rp, out, ok} = P, v = G.shown || 0, ang = v * Math.PI / 180, len = R.w * 0.6, x0 = cx - len / 2;
    g.save(); g.translate(x0, floor); g.rotate(-ang); g.fillStyle = '#C08A4E'; rrect(g, 0, -u * 0.35, len, u * 0.35, u * 0.1); g.fill();
    let pos = len * 0.7, rot = 0; if(out && !rp.pass){ pos = lerp(len * 0.7, th * 0.4, ease(ok)); if(rp.how === 'roll') rot = -(len * 0.7 - pos) / (th * 0.4); }
    g.translate(pos, -u * 0.35); g.rotate(rot); drawThing(g, a, 0, 0, th * 0.7, P.t, {}); g.restore();
    g.fillStyle = '#7C8597'; g.beginPath(); g.moveTo(x0 + len, floor); g.lineTo(x0 + len, floor - Math.sin(ang) * len); g.lineTo(x0 + len + u * 0.4, floor); g.fill();
    g.strokeStyle = '#FFC845'; g.lineWidth = 2; g.beginPath(); g.arc(x0, floor, u * 1.6, -ang, 0); g.stroke(); },
  balance(P){ const {g, R, u, cx, floor, th, a, rp, out, ok} = P, v = G.shown || 0, ang = v * Math.PI / 180, len = th * 1.8;
    g.fillStyle = '#7C8597'; g.beginPath(); g.moveTo(cx - u * 0.6, floor); g.lineTo(cx, floor - u * 0.9); g.lineTo(cx + u * 0.6, floor); g.fill();
    g.save(); g.translate(cx, floor - u * 0.9); g.rotate(ang); g.fillStyle = '#5B6F92'; rrect(g, -len / 2, -u * 0.3, len, u * 0.3, u * 0.1); g.fill();
    let tip = 0; if(out && !rp.pass) tip = ease(ok) * (Math.PI / 2 - ang + 0.2);
    g.translate(th * 0.3, -u * 0.3); g.rotate(tip); drawThing(g, a, 0, 0, th * 0.75, P.t, {}); g.restore(); },
  spin(P){ const {g, u, cx, floor, th, a, rp, out, ok} = P, s = G.shown || 0, wob = rp && rp.how === 'wobble';
    g.fillStyle = '#5B6F92'; g.beginPath(); g.ellipse(cx, floor, th * 0.75, u * 0.45, 0, 0, 7); g.fill(); g.strokeStyle = '#C9D6EA'; g.lineWidth = 2; g.stroke();
    const speed = G.phase === 'run' ? 8 : out ? 8 * (1 - ok) : 0, wb = wob ? Math.sin(P.t * 10) * 0.18 * (out ? 1 - ok : 1) : 0;
    G.yaw += speed * 0.016; g.save(); g.translate(cx, floor); g.rotate(wb); drawThing(g, a, 0, 0, th * 0.85, P.t, {view25: true, yaw: G.yaw, pitch: 0.3}); g.restore();
    if(speed > 1){ g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 2; [0.9, 1.05].forEach(f => { g.beginPath(); g.ellipse(cx, floor - th * 0.45, th * 0.6 * f, u * 0.5, 0, P.t * 3, P.t * 3 + 2); g.stroke(); }); }
    g.font = '800 ' + Math.max(12, u * 0.7) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#FFFFFF'; g.fillText('⏱️ ' + fmtNum(s) + ' s', cx, floor - th * 1.25); },
  float(P){ const {g, R, u, cx, floor, th, a, rp, out, ok} = P, leak = (rp && rp.leak) || (a.sci && a.sci.leak), tw = R.w * 0.5, tt = floor - th * 1.3, water = floor - th * 0.75;
    if(leak){ drawThing(g, a, cx, floor, th, P.t, {}); const lvl = out ? (rp.pass ? 1 : 1 - ok) : 1; g.fillStyle = 'rgba(59,160,232,' + (0.55 * lvl) + ')'; g.beginPath(); g.ellipse(cx, floor - th * 0.7, th * 0.32, u * 0.3, 0, 0, 7); g.fill();
      if(out && !rp.pass) for(let i = 0; i < 3; i++){ const d = (P.t * 1.4 + i / 3) % 1; emo(g, '💧', cx + (i - 1) * u * 0.5, floor + d * u * 1.4, u * 0.55); }
      emo(g, '🫗', cx + th * 0.8, tt + u * 0.3, u * 1.1); return; }
    g.fillStyle = 'rgba(59,160,232,0.28)'; g.fillRect(cx - tw / 2, water, tw, floor - water); g.strokeStyle = '#C9D6EA'; g.lineWidth = 3; g.strokeRect(cx - tw / 2, tt, tw, floor - tt);
    let y = tt + th * 0.2; if(G.phase === 'run') y = lerp(tt + th * 0.2, water, Math.min(1, P.k)); if(out){ const fl = rp.pass, target = fl ? water + th * 0.35 * Math.min(1, rp.value) : floor - u * 0.1; y = lerp(water, target, ease(ok)) + (fl ? Math.sin(P.t * 2) * u * 0.1 : 0); }
    drawThing(g, a, cx, y, th * 0.75, P.t, {}); g.fillStyle = 'rgba(59,160,232,0.22)'; g.fillRect(cx - tw / 2, water, tw, floor - water);
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 2; g.beginPath(); for(let x = -tw / 2; x <= tw / 2; x += 6) g.lineTo(cx + x, water + Math.sin(x * 0.2 + P.t * 3) * 2); g.stroke(); }
};

/* ================= 🧪 SCIENCE TESTS ON YOUR THINGS (sc-4d) =================
   5 more test cards in the ⚙️ Mechanic lab (server SciencetoryCode.gs SCI_X_MAT_ / sciMeasureX_): ☕ Keeps warm · 💡 Conducts · 🧲 Magnetic · 🌈 Clear / shiny · 🔔 Ring tone.
   Same flow (set → guess → run → card), no luck, nothing breaks. Also a "🧪 Test YOUR things" card on the 🔥 ⚡ 🌈 🔊 hubs (openMyTest). */
Object.assign(TEST_UI, {
  warm: 'How long it keeps cocoa warm', conduct: 'Does it light the bulb?', magnet: 'Does a magnet grab it?',
  light: 'Does light shine through — or bounce off?', ring: 'How long it rings when you tap it'
});
Object.assign(HINT, {
  warm: ['Metal lets heat out fast — it’s a conductor.', 'Wood, clay and cloth hold heat in — they’re insulators.', 'Thick walls keep cocoa warm longer.'],
  conduct: ['Electricity flows through metal.', 'Wood, glass, clay and plastic stop electricity.', 'Silver and copper are the best of all.'],
  magnet: ['Only iron and steel stick to a magnet.', 'Gold, silver and copper are metal — but NOT magnetic!', 'Steel keeps a little magnetism after a rub.'],
  light: ['Glass and clear gems let light through.', 'Polished metal bounces light back — it shines.', 'Wood, clay and cloth soak the light up.'],
  ring: ['Hard metal and glass ring like a bell.', 'Wood, clay and cloth just go “thud”.', 'Bowls and cups ring longer — like a singing bowl.']
});
Object.assign(WHY, {
  warm: {metal: 'Metal is a heat CONDUCTOR: the heat runs straight through the wall into the air, so the cocoa cools fast.', mid: 'Glass, stone and clay let heat through slowly — the cocoa stays warm for a while.', insul: 'Wood, plastic and cloth are INSULATORS: heat can hardly get through, so the cocoa stays warm a long time.'},
  conduct: {bright: 'Metals are full of tiny electrons that can move — they carry electricity, so the bulb shines bright.', dim: 'This metal lets electricity through, but not easily — the bulb glows dimly.', faint: 'Charcoal is carbon — a tiny bit of electricity squeezes through, so the bulb just glows. Pencil “lead” is carbon too!', none: 'This stuff is an INSULATOR: its electrons are stuck, so no electricity flows and the bulb stays dark. Wires are wrapped in plastic for this reason.'},
  magnet: {keep: 'Steel is magnetic — and after a rub its tiny magnet bits line up and STAY lined up. Now it is a little magnet itself!', soft: 'Iron is magnetic, but it lets the magnetism go quickly — it only holds a few clips.', none: 'Not magnetic! Magnets only pull iron, steel, nickel and cobalt — everything else just sits there.'},
  light: {through: 'It is see-through: light passes between its particles. That’s why windows and lenses are made of glass.', shine: 'It is smooth and shiny, so light bounces off it like a mirror.', dull: 'Rough or dark stuff soaks up most of the light — almost nothing reaches the meter.'},
  ring: {ring: 'Hard, stiff stuff keeps wobbling very fast after a tap — that wobble is the sound, so it rings like a bell.', short: 'It wobbles a little after the tap, then stops — a short “tink”.', thud: 'Soft or bendy stuff soaks up the wobble at once — you only hear a “thud”.'}
});
const MT_ACC = {warm: 'xt-t', conduct: 'xt-e', magnet: 'xt-e', light: 'xt-o', ring: 'xt-a'};
const MT_GMAX = {conduct: 100, light: 100, magnet: 10};
const MY_TEST = {thermo: ['warm'], electro: ['conduct', 'magnet'], optics: ['light'], acoustics: ['ring']};
function isMyTest(k){ return !!(testMeta(k).sec); }
// 🧪 the hub card: opens the Mechanic lab with this section's test picked (◀ goes back to the hub)
function myTestCard(sec){ const L = MY_TEST[sec]; if(!L || !META().tests[L[0]]) return '';
  return '<button class="pick mytest" data-mt="' + L[0] + '" data-sound="pop"><span class="mt-ic">🧪</span><span class="mt-tx"><span class="nm">Test YOUR things</span><span class="sub">' + L.map(k => testMeta(k).icon + ' ' + UI.esc(testMeta(k).name)).join(' · ') + ' — on the things you crafted</span></span><span class="mt-go">▶</span></button>'; }
function openMyTest(k){ SET.labFrom = SET.sec; SET.test = k; savePrefs(); if(SET.ref && !thingOk(SET.ref, k).ok) SET.ref = ''; openLevel(SET.level); }
function mtGoal(r){ if(r.level < 2 && r.test === 'conduct') return 'the bulb lights'; if(r.level < 2 && r.test === 'magnet') return 'the magnet sticks'; return ''; }
function mtWhy(r){
  const x = r.x || {}, M = META().mats[r.m], nm = M ? M.icon + ' ' + M.name : 'This';
  if(r.test === 'warm') return (x.thin ? 'Its wall is thin — less stuff for the heat to cross. ' : '') + 'The cocoa starts at 70 °C; “warm” means above 40 °C. ' + nm + ' kept it warm for ' + fmtNum(r.value) + ' minutes.';
  if(r.test === 'conduct') return r.value ? nm + ' lit the bulb to ' + fmtNum(r.value) + ' %. Silver is the best conductor of all; copper is in almost every wire.' : 'Try a metal thing next — copper or silver light the bulb brightest.';
  if(r.test === 'magnet'){ const metal = M && M.group === 'metal'; return r.value ? '' : metal ? 'Surprise: ' + nm + ' is a metal, but it is NOT magnetic! Fridge magnets only stick to steel.' : 'Only iron and steel things will move for the magnet.'; }
  if(r.test === 'light') return (x.mode === 'through' ? 'Light through: ' + fmtNum(x.thr) + ' % · bounced: ' + fmtNum(x.sh) + ' %. ' : 'Bounced off: ' + fmtNum(x.sh) + ' % · through: ' + fmtNum(x.thr) + ' %. ') + (x.varnish ? 'The varnish makes it smoother, so it shines more. ' : '') + (x.glaze ? 'The shiny glaze makes clay reflect light. ' : '');
  if(r.test === 'ring') return (r.value ? 'It rings a ' + x.note + ' — smaller things ring higher, bigger things lower. ' : '') + (x.bowl ? 'Bowls and cups ring longer — like a singing bowl. ' : '') + (x.rep ? 'A crack — even a mended one — stops the ring. Shopkeepers tapped pots to find hidden cracks!' : '');
  return '';
}
// 🔔 the card plays the thing’s real note (follows sound on / off, silent in tests)
function mtFinish(r){ if(!r || r.test !== 'ring' || typeof acTone !== 'function') return; const x = r.x || {};
  if(r.value >= 0.5 && x.hz){ acTone(x.hz, Math.min(3, 0.35 + r.value * 0.5), 0.2, 0, 'sine'); acTone(x.hz * 2, Math.min(1.6, 0.2 + r.value * 0.25), 0.06, 0, 'sine'); }
  else acTone(110, 0.14, 0.18, 0, 'triangle'); }

// ---------- the 5 rigs (same box + painter style as the strength tests) ----------
function mtMug(g, m, x, y, h){   // 🧪 a lab sample = a test mug made of that stuff
  const col = matCol(m), w = h * 0.62, top = y - h * 0.8;
  g.save(); g.lineWidth = Math.max(3, h * 0.07); g.strokeStyle = shade(col, 0.75); g.beginPath(); g.ellipse(x + w * 0.55, y - h * 0.42, h * 0.16, h * 0.2, 0, -Math.PI / 2, Math.PI / 2); g.stroke();
  const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, shade(col, 0.65)); gr.addColorStop(0.4, shade(col, 1.2)); gr.addColorStop(1, shade(col, 0.6));
  g.fillStyle = gr; g.beginPath(); g.moveTo(x - w / 2, top); g.lineTo(x - w * 0.42, y); g.lineTo(x + w * 0.42, y); g.lineTo(x + w / 2, top); g.closePath(); g.fill();
  g.fillStyle = shade(col, 1.25); g.beginPath(); g.ellipse(x, top, w / 2, h * 0.07, 0, 0, 7); g.fill();
  const M = META().mats[m]; if(M) emo(g, M.icon, x, y - h * 0.38, h * 0.26); g.restore(); return {x: x, y: top, rx: w * 0.44, ry: h * 0.055};
}
function mtThing(g, a, x, y, h, t, o){ if(a.kind === 'sample') return mtMug(g, a.look.m, x, y, h); drawThing(g, a, x, y, h, t, o || {}); return {x: x, y: y - h * 0.86, rx: h * 0.26, ry: h * 0.05}; }
function mtLabel(g, txt, x, y, u, col){ g.font = '800 ' + Math.max(13, Math.min(22, u * 0.72)) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(11,22,38,0.85)'; g.strokeText(txt, x, y); g.fillStyle = col || '#FFFFFF'; g.fillText(txt, x, y); }
Object.assign(RIGS, {
  // ☕ a cup of cocoa on a warm mat: steam, a falling thermometer and a minute clock
  warm(P){ const {g, R, u, cx, floor, th, a, rp, out, ok} = P, v = G.shown || 0, end = rp ? Math.max(1, rp.value) : (G.T.ch[G.lv] || 10), f = Math.max(0, Math.min(1, v / end));
    g.fillStyle = '#8B5A3C'; rrect(g, cx - th * 0.7, floor - u * 0.2, th * 1.4, u * 0.3, u * 0.12); g.fill();
    const top = mtThing(g, a, cx, floor - u * 0.2, th * 0.95, P.t, {});
    const temp = 70 - 30 * (rp ? f : f * 0.5), warm = (temp - 40) / 30;
    g.fillStyle = '#6B3A1F'; g.beginPath(); g.ellipse(top.x, top.y + top.ry * 0.6, top.rx, top.ry, 0, 0, 7); g.fill();
    for(let i = 0; i < 3; i++){ const ph = (P.t * 0.6 + i / 3) % 1, sx = top.x + (i - 1) * top.rx * 0.6 + Math.sin(P.t * 2 + i) * u * 0.25; g.globalAlpha = Math.max(0, (0.15 + 0.75 * warm) * (1 - ph)); g.strokeStyle = '#FFFFFF'; g.lineWidth = Math.max(2, u * 0.12); g.lineCap = 'round';
      g.beginPath(); g.moveTo(sx, top.y - u * 0.2 - ph * th * 0.6); g.quadraticCurveTo(sx + u * 0.4, top.y - u * 0.2 - ph * th * 0.6 - u * 0.5, sx, top.y - u * 0.2 - ph * th * 0.6 - u); g.stroke(); }
    g.globalAlpha = 1;
    const tx = cx - th * 1.1, ty = floor - th * 1.05, tl = th * 0.95;   // 🌡️ thermometer
    g.fillStyle = '#FFFFFF'; rrect(g, tx - u * 0.22, ty, u * 0.44, tl, u * 0.22); g.fill(); g.beginPath(); g.arc(tx, ty + tl, u * 0.38, 0, 7); g.fill();
    const col = warm > 0.5 ? '#F25F5C' : warm > 0.15 ? '#FF9F45' : '#5BA8FF'; g.fillStyle = col; g.beginPath(); g.arc(tx, ty + tl, u * 0.28, 0, 7); g.fill(); const lvl = (temp - 20) / 60; g.fillRect(tx - u * 0.11, ty + tl - tl * lvl, u * 0.22, tl * lvl);
    mtLabel(g, Math.round(temp) + ' °C', tx, ty - u * 0.35, u, col);
    mtLabel(g, '⏱️ ' + fmtNum(Math.round(v)) + ' min', cx + th * 0.95, floor - th * 1.1, u);
    if(out && ok > 0.6) mtLabel(g, rp.pass ? '☕ still warm!' : '🧊 gone cold', cx, floor + u * 1.25, u, rp.pass ? '#7CFFB2' : '#9CC8FF'); },
  // 💡 battery → clip → YOUR thing → clip → bulb: brightness = how well it conducts
  conduct(P){ const {g, R, u, cx, floor, th, a, rp, out, ok} = P, v = G.shown || 0, lit = rp ? Math.max(0, Math.min(1, v / 100)) * (out || G.phase === 'run' ? 1 : 0) : 0, mid = floor - th * 0.35;
    const gr = Math.max(26, Math.min(64, Math.min(R.w, R.h) * 0.16)), bx = Math.max(R.x + u * 1.2, cx - th * 1.25), lx = Math.min(cx + th * 1.2, R.x + R.w - gr * 2 - u * 1.6), ly = Math.max(floor - th * 1.05, R.y + u * 1.4);   // the bulb stays clear of the gauge
    g.strokeStyle = '#E8B04A'; g.lineWidth = Math.max(3, u * 0.14); g.lineJoin = 'round'; g.beginPath(); g.moveTo(bx, floor - u * 0.9); g.lineTo(bx, ly); g.lineTo(lx, ly); g.lineTo(lx, ly + u * 0.4); g.stroke();
    g.beginPath(); g.moveTo(bx + u * 0.5, floor - u * 0.5); g.lineTo(cx - th * 0.55, mid); g.stroke(); g.beginPath(); g.moveTo(cx + th * 0.55, mid); g.lineTo(lx, mid); g.lineTo(lx, ly + u * 1.4); g.stroke();
    emo(g, '🔋', bx, floor - u * 0.55, u * 1.6);
    if(lit > 0.02){ const gl = g.createRadialGradient(lx, ly + u * 0.9, 1, lx, ly + u * 0.9, u * (1.2 + 3.2 * lit)); gl.addColorStop(0, 'rgba(255,240,150,' + (0.85 * lit + 0.1) + ')'); gl.addColorStop(1, 'rgba(255,220,80,0)'); g.fillStyle = gl; g.beginPath(); g.arc(lx, ly + u * 0.9, u * (1.2 + 3.2 * lit), 0, 7); g.fill(); }
    g.fillStyle = lit > 0.02 ? 'rgb(255,' + Math.round(200 + 50 * lit) + ',' + Math.round(80 + 100 * lit) + ')' : '#8C97A8'; g.beginPath(); g.arc(lx, ly + u * 0.9, u * 0.62, 0, 7); g.fill(); g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#5B6F92'; g.fillRect(lx - u * 0.3, ly + u * 1.35, u * 0.6, u * 0.35);
    if(a.kind === 'sample') drawPuck(g, a.look.m, cx, mid + th * 0.25, th * 0.62, P.t); else { g.save(); g.translate(cx, mid); g.rotate(-Math.PI / 2); drawThing(g, a, 0, th * 0.45, th * 0.9, P.t, {}); g.restore(); }
    [-1, 1].forEach(s => { g.fillStyle = s < 0 ? '#F25F5C' : '#2B2F3A'; rrect(g, cx + s * th * 0.55 - u * 0.35, mid - u * 0.3, u * 0.7, u * 0.6, u * 0.15); g.fill(); });
    if(lit > 0.02 && (G.phase === 'run' || out)) for(let i = 0; i < 4; i++){ const d = (P.t * 0.8 + i / 4) % 1; emo(g, '⚡', lerp(bx, lx, d), ly - u * 0.05, u * 0.55); }
    mtLabel(g, '💡 ' + fmtNum(Math.round(v)) + ' %', lx, ly - u * 0.5, u, lit > 0.02 ? '#FFE27A' : '#C9D6EA'); },
  // 🧲 rub with a magnet, then dip it into the paper clips
  magnet(P){ const {g, R, u, cx, floor, th, a, rp, out, ok} = P, n = rp ? Math.round(rp.value) : 0;
    const pileX = Math.min(cx + th * 0.95, R.x + R.w - u * 1.6); for(let i = 0; i < 9; i++) emo(g, '📎', pileX + ((i * 37) % 5 - 2) * u * 0.32, floor - u * 0.3 - (i % 3) * u * 0.2, u * 0.7);
    let x = cx - th * 0.45, y = floor, lift = 0;
    if(G.phase === 'run'){ const k = (P.t * 1.6) % 1; emo(g, '🧲', x - th * 0.3 + k * th * 0.6, floor - th * 0.95, u * 1.5); }
    if(out){ const f = ease(Math.min(1, ok * 1.4)); x = lerp(cx - th * 0.45, pileX, f); lift = th * 0.55 * Math.sin(Math.min(1, ok * 1.4) * Math.PI) * (n ? 0.6 : 1) + (n && ok > 0.7 ? th * 0.45 * (ok - 0.7) / 0.3 : 0); y = floor - lift; }
    g.save(); g.translate(x, y); mtFlat(g, a, th * 0.75, P.t); g.restore();
    if(out && ok > 0.7 && n) for(let i = 0; i < Math.min(10, n); i++) emo(g, '📎', x + Math.sin(P.t * 3 + i) * u * 0.12 + (i % 2 ? u * 0.25 : -u * 0.25), y + u * 0.35 + i * u * 0.42, u * 0.6);
    if(out && ok > 0.7 && !n) mtLabel(g, '🚫 no pull', x, y - th * 0.85, u, '#9CC8FF');
    mtLabel(g, '📎 ' + (out && ok > 0.7 ? n : '?') + ' clips', cx, R.y + u * 0.9, u); },
  // 🌈 torch → YOUR thing → light meter (through it) or bounce up to a meter (shiny)
  light(P){ const {g, R, u, cx, floor, th, a, rp, out, ok} = P, v = G.shown || 0, x = (rp && rp.x) || {}, ty = floor - th * 0.5, tx = Math.max(R.x + u * 1.1, cx - th * 1.35);
    emo(g, '🔦', tx, ty, u * 1.5);
    g.fillStyle = 'rgba(255,236,140,0.35)'; g.beginPath(); g.moveTo(tx + u * 0.6, ty - u * 0.2); g.lineTo(cx - th * 0.2, ty - u * 0.8); g.lineTo(cx - th * 0.2, ty + u * 0.8); g.lineTo(tx + u * 0.6, ty + u * 0.2); g.fill();
    mtThing(g, a, cx, floor, th * 0.85, P.t, {});
    const f = Math.max(0, Math.min(1, v / 100)), mx = Math.min(cx + th * 1.25, R.x + R.w - u * 0.7), my = ty, sx = cx - th * 0.55, sy = R.y + u * 1.6;
    if((G.phase === 'run' || out) && rp){ const thru = x.mode === 'through';
      g.fillStyle = 'rgba(255,236,140,' + (0.08 + 0.5 * f) + ')'; g.beginPath();
      if(thru){ g.moveTo(cx + th * 0.2, ty - u * 0.6); g.lineTo(mx - u * 0.5, ty - u * 0.4); g.lineTo(mx - u * 0.5, ty + u * 0.4); g.lineTo(cx + th * 0.2, ty + u * 0.6); }
      else { g.moveTo(cx - th * 0.2, ty - u * 0.6); g.lineTo(sx + u * 0.3, sy + u * 0.5); g.lineTo(sx - u * 0.3, sy + u * 0.5); g.lineTo(cx - th * 0.25, ty + u * 0.2); }
      g.fill(); if(!thru && f > 0.3) for(let i = 0; i < 3; i++) emo(g, '✨', cx - th * 0.1 + Math.cos(P.t * 4 + i * 2) * u * 0.6, ty - u * 0.6 + Math.sin(P.t * 5 + i) * u * 0.5, u * 0.5); }
    const meter = (mxx, myy, on) => { g.fillStyle = on ? '#FFFFFF' : '#3A4D6B'; rrect(g, mxx - u * 0.5, myy - u * 0.8, u, u * 1.6, u * 0.2); g.fill(); if(!on){ g.strokeStyle = 'rgba(201,214,234,0.5)'; g.lineWidth = 2; g.stroke(); } emo(g, '📟', mxx, myy - u * 1.2, u * 0.6); g.fillStyle = '#FFC845'; g.fillRect(mxx - u * 0.3, myy + u * 0.6 - u * 1.2 * (on ? f : 0), u * 0.6, u * 1.2 * (on ? f : 0)); };
    meter(mx, my, rp && (G.phase === 'run' || out) && x.mode === 'through'); meter(sx, sy, rp && (G.phase === 'run' || out) && x.mode === 'shine');
    mtLabel(g, '🔆 ' + fmtNum(Math.round(v)) + ' %', cx, R.y + u * 0.9, u, '#FFE27A');
    if(out && ok > 0.5) mtLabel(g, x.mode === 'through' ? '🪟 shines through' : f > 0.2 ? '✨ bounces back' : '🌑 soaks it up', cx, floor + u * 1.25, u); },
  // 🔔 hang it on a string, tap it with a tiny hammer, watch the sound waves fade
  ring(P){ const {g, R, u, cx, floor, th, a, rp, out, ok} = P, v = G.shown || 0, x = (rp && rp.x) || {}, hy = R.y + u * 0.6, by = floor - th * 0.15;
    g.strokeStyle = '#7C8597'; g.lineWidth = Math.max(4, u * 0.25); g.beginPath(); g.moveTo(cx - th * 0.9, floor); g.lineTo(cx - th * 0.9, hy); g.lineTo(cx, hy); g.stroke();
    g.strokeStyle = '#C9D6EA'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, hy); g.lineTo(cx, by - th * 0.75); g.stroke();
    const tapT = G.phase === 'run' ? (P.t * 1.5) % 1 : out ? Math.min(1, ok * 2) : 0, swing = Math.sin(tapT * Math.PI) * 0.9;
    const dur = rp ? Math.max(0.2, rp.value) : 1, since = out ? (G.t - (G.outT0 || G.t)) : 0, amp = rp && out ? Math.max(0, 1 - since / (dur * 1.1)) : G.phase === 'run' ? 0.5 : 0;
    g.save(); g.translate(cx + Math.sin(P.t * 40) * amp * u * 0.08, by); mtThing(g, a, 0, 0, th * 0.8, P.t, {}); g.restore();
    g.save(); g.translate(cx + th * 0.9, by - th * 0.45); g.rotate(-0.4 + swing); emo(g, '🔨', -u * 0.6, 0, u * 1.3); g.restore();
    if(amp > 0.02) for(let i = 0; i < 4; i++){ const ph = (P.t * 1.2 + i / 4) % 1; g.strokeStyle = 'rgba(110,240,200,' + (amp * (1 - ph)) + ')'; g.lineWidth = 3; [-1, 1].forEach(s => { g.beginPath(); g.arc(cx, by - th * 0.4, th * 0.45 + ph * th * 0.9, s < 0 ? Math.PI * 0.75 : -Math.PI * 0.25, s < 0 ? Math.PI * 1.25 : Math.PI * 0.25); g.stroke(); }); }
    mtLabel(g, '🔔 ' + fmtNum(v) + ' s' + (out && ok > 0.4 && rp.value >= 0.5 && x.note ? ' · 🎵 ' + x.note : ''), cx, floor + u * 1.2, u, '#7CFFE0');
    if(out && ok > 0.4 && rp.value < 0.5) mtLabel(g, '🥁 thud!', cx + th * 0.9, by - th * 0.95, u, '#C9D6EA'); }
});
// a thing for the magnet rig (a sample = its puck)
function mtFlat(g, a, h, t){ if(a.kind === 'sample'){ drawPuck(g, a.look.m, 0, 0, h * 0.8, t); return; } drawThing(g, a, 0, 0, h, t, {}); }

/* ================= ⚗️ CHEMISTRY (sc-2a) =================
   Data: ChemTable.html (built by Test Harness/chemtable-build/build_chem.py). Server: SciencetoryCode.gs sciChemSave · SciElements_<Name>.
   🔍 Element hunt = 8 clues, tap the element on the table (the table turns sideways on tall phones) · ⚛️ Formula builder = 5 molecules from atom balls
   · 🧪 Periodic table = every card (⭐ = yours: found in a game or met in an Artifactory material). */
const CT = window.ChemTable || {els: [], comps: [], cats: []};
const EL = CT.els.map(a => ({n: a[0], sym: a[1], name: a[2], cat: a[3], state: a[4], row: a[5], col: a[6], shells: a[7], fact: a[8], where: a[9]}));
const BYSYM = {}; EL.forEach(e => { BYSYM[e.sym] = e; });
const CATS = {}; CT.cats.forEach(c => { CATS[c[0]] = {name: c[1], col: c[2], what: c[3]}; });
const COMPS = CT.comps.map(a => ({id: a[0], name: a[1], f: a[2], icon: a[3], where: a[4], tier: a[5], cnt: a[6]}));
const CPK = {H: '#FFFFFF', C: '#3A3A3A', N: '#3B6FE8', O: '#E8473B', F: '#9BE68B', Cl: '#3FBF3F', Br: '#A0302A', I: '#7A2FBF', S: '#F2D23C', P: '#F29B2C', Na: '#A15CF0', K: '#8F40D4',
  Ca: '#3E9E5A', Mg: '#5CC75C', Fe: '#D9772E', Cu: '#C8783B', Zn: '#7D8BA6', Al: '#C9A3A3', Si: '#E0C08E', Ti: '#A3A9B5', Ag: '#C8CCD4', Au: '#E8B530', W: '#5B6B8C'};
const DARK = {C: 1, N: 1, Br: 1, I: 1, K: 1, Na: 1, Ca: 1, W: 1, Zn: 1};
const STATE = {s: ['🧊', 'Solid'], l: ['💧', 'Liquid'], g: ['💨', 'Gas'], '?': ['❔', 'Nobody knows yet']};
const FAMOUS = [1, 2, 6, 7, 8, 11, 12, 13, 14, 17, 19, 20, 26, 29, 30, 47, 50, 79, 80, 82];
let CHEM = {e: [], c: [], craft: [], all: [], mats: {}};
let HG = null, FG = null, HBUD = null, FBUD = null, PT_LAST = {};
function chemGot(n){ return CHEM.all.indexOf(n) >= 0; }
function rangeN(a, b){ const r = []; for(let i = a; i <= b; i++) r.push(i); return r; }
function shuffle(a){ for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function sub(f){ return UI.esc(f).replace(/(\d+)/g, '<sub>$1</sub>'); }
function ballHtml(sym, size){ if(window.AtomSkins) return '<img class="ball" src="' + AtomSkins.url(sym, CPK[sym] || AtomSkins.colour(sym), atomSkin(), 64) + '" alt="' + sym + '"' + (size ? ' style="width:' + size + 'px;height:' + size + 'px"' : '') + '>';   // 🎨 sc-2b
   const c = CPK[sym] || '#F5A3C7'; return '<span class="ball' + (DARK[sym] ? ' dark' : '') + '" style="background:' + c + (size ? ';width:' + size + 'px;height:' + size + 'px' : '') + '">' + sym + '</span>'; }
const HBAR = UI.gameBar($('hbar'), {game: GAME_ID, icon: '🔍', name: 'Element hunt', levelId: 'hunt-level', levels: () => leaveChem(true), playing: () => !!(HG && !HG.done), onLeave: () => { if(HG) HG.done = true; }, scoreMin: '5ch', onFit: () => layoutHunt()});
HBAR.score(0); HBAR.miss(0); HBAR.count('clue', '🔍', '1/8', 'Clue');
const FBAR = UI.gameBar($('fbar'), {game: GAME_ID, icon: '⚛️', name: 'Formula builder', levelId: 'fm-level', levels: () => leaveChem(true), playing: () => !!(FG && !FG.done), onLeave: () => { if(FG) FG.done = true; }, scoreMin: '5ch', onFit: () => drawMol()});
FBAR.score(0); FBAR.miss(0); FBAR.count('mol', '⚛️', '1/5', 'Molecule');

// ---------- hub ----------
function openChem(lv){
  SET.level = lv; const U = LEVEL_UI[lv];
  $('chem-sub').textContent = U.emoji + ' ' + U.name + ' · ' + {0: '🔤 match the letters — the table glows to help you', 1: '🔤 find the letters', 2: '🔢 find the numbers', 3: '📛 names only', 4: '💡 facts, the name hidden', 5: '💡 facts against the clock'}[lv];
  $('chem-count').innerHTML = '<span>📇 ' + CHEM.all.length + ' / 118 element cards</span><span>⚛️ ' + CHEM.c.length + ' / ' + COMPS.length + ' molecules</span>';
  const H = [['hunt', '🔍', 'Element hunt', 'Find 8 elements on the table from clues — each find = a 📇 card'], ['formula', '⚛️', 'Formula builder', 'Snap atoms together into 5 real molecules'], ['table', '🧪', 'Periodic table', 'All 118 elements — your ⭐ cards + every fact'], ['xlab', '🧫', 'Kitchen lab', '5 safe experiments — colours, crystals, fizz + rust']];
  $('chem-hub').innerHTML = H.map((h, i) => '<button class="pick" data-g="' + h[0] + '" data-sound="pop" style="animation:sc-pop .4s ' + (i * 0.08) + 's both"><div class="big">' + h[1] + '</div><div class="nm">' + h[2] + '</div><div class="sub">' + h[3] + '</div></button>').join('');
  $('chem-hub').querySelectorAll('[data-g]').forEach(b => b.onclick = () => { const g = b.dataset.g; if(g === 'hunt') startHunt(); else if(g === 'formula') startFormula(); else if(g === 'xlab') openXhub(); else openTable(); });
  renderSkins('chem-skins'); showScreen('chem');
  if(lv === 0) setTimeout(() => { if(!$('scr-chem').classList.contains('hidden')){ const b = $('chem-hub').querySelector('[data-g="hunt"]'); b.classList.add('glow-next'); labHand(b); } }, 400 * SCI_FX);
}
function leaveChem(toLevels){ stopHunt(); stopFormula(); stopExp(); hideResult(); labHand(null); if(toLevels){ renderMenu(); showScreen('menu'); } else openChem(SET.level); }

// ---------- the table painter: one layout for explore + hunt (sideways on tall screens) ----------
function rowY(r){ return r <= 7 ? r - 1 : r === 9 ? 7.35 : 8.35; }
function drawTable(box, opt){
  opt = opt || {}; PT_LAST[box.id] = opt;
  const host = opt.host || box.parentElement, R = host.getBoundingClientRect(), pad = 4;
  const W = Math.max(60, R.width - pad * 2), Hh = Math.max(60, (opt.maxH || R.height) - pad * 2);
  const csN = Math.floor(Math.min(W / 18, Hh / 9.35)), csF = Math.floor(Math.min(W / 9.35, Hh / 18)), flip = opt.flip !== false && csF > csN * 1.3;   // sc-2a2: turn sideways only when it gives MUCH bigger squares (phones held upright) — the normal table is easier to read
  const cs = flip ? csF : csN, gw = flip ? cs * 9.35 : cs * 18, gh = flip ? cs * 18 : cs * 9.35;
  box.style.width = gw + 'px'; box.style.height = gh + 'px'; box.dataset.flip = flip ? 1 : 0; box.dataset.cs = cs;
  if(opt.center !== false){ box.style.top = Math.max(0, (R.height - gh) / 2) + 'px'; }
  const g = 2, at = (r, c) => flip ? [(r <= 7 ? r + 1.35 : r - 9) * cs, (r <= 7 ? c - 1 : c - 2) * cs] : [(c - 1) * cs, rowY(r) * cs]; // sideways: the two f-block rows stand on the left, so He (bottom) stays clear of the 💬 bubble
  let h = '';
  [[6, '57–71'], [7, '89–103']].forEach(p => { const xy = at(p[0], 3); h += '<div class="pt-ph" style="left:' + xy[0] + 'px;top:' + xy[1] + 'px;width:' + (cs - g) + 'px;height:' + (cs - g) + 'px">' + (cs >= 34 ? p[1] : '') + '</div>'; });
  const fs = Math.max(9, cs * 0.42), nfs = Math.max(opt.num === 'big' ? 9 : 7, cs * (opt.num === 'big' ? 0.3 : 0.24)), showN = opt.num === 'none' ? false : opt.num === 'big' ? cs >= 18 : cs >= 30;   // sc-2a2: 🔥 numbers always shown · 💀 none
  EL.forEach(e => { const xy = at(e.row, e.col), got = chemGot(e.n), cls = 'pt-cell' + (opt.mode === 'explore' ? (got ? ' got' : ' no') : '');
    h += '<button class="' + cls + '" data-n="' + e.n + '" data-sound="none" aria-label="' + e.name + '" style="left:' + xy[0] + 'px;top:' + xy[1] + 'px;width:' + (cs - g) + 'px;height:' + (cs - g) + 'px;background:' + CATS[e.cat].col + ';font-size:' + fs + 'px">' +
      (showN ? '<i style="font-size:' + nfs + 'px">' + e.n + '</i>' : '') + '<b>' + e.sym + '</b></button>'; });
  box.innerHTML = h;
  box.querySelectorAll('.pt-cell').forEach(b => b.onclick = () => (opt.onTap || openElement)(Number(b.dataset.n), b));
}
function chemResize(){
  if(!$('scr-hunt').classList.contains('hidden')) layoutHunt();
  if(!$('scr-table').classList.contains('hidden')) drawExplore();
  if(!$('scr-formula').classList.contains('hidden')) drawMol();
}

// ---------- 🧪 explore + 📇 cards ----------
function openTable(){
  showScreen('table'); labHand(null);
  $('pt-legend').innerHTML = CT.cats.map(c => '<span style="background:' + c[2] + '" title="' + UI.esc(c[3]) + '">' + UI.esc(c[1]) + '</span>').join('');
  $('table-sub').textContent = '📇 ' + CHEM.all.length + ' / 118 are yours (⭐) — tap any element to see its card';
  drawExplore();
  $('pt-stamps').innerHTML = CT.cats.map(c => { const all = EL.filter(e => e.cat === c[0]), got = all.filter(e => chemGot(e.n)).length; return '<span class="' + (got === all.length ? 'done' : '') + '">' + (got === all.length ? '🏅 ' : '') + UI.esc(c[1]) + ' ' + got + '/' + all.length + '</span>'; }).join('');
}
function drawExplore(){ const box = $('pt-explore'); drawTable(box, {mode: 'explore', host: box.parentElement, maxH: Math.max(300, innerHeight - 220), flip: false, center: false}); box.parentElement.style.minHeight = box.style.height; }
function matsWith(n){ const out = []; Object.keys(CHEM.mats || {}).forEach(m => { if((CHEM.mats[m] || []).indexOf(n) >= 0){ const M = META().mats[m]; out.push((M ? M.icon + ' ' + M.name : m)); } }); return out; }
function openElement(n){
  const e = EL[n - 1]; if(!e) return; const C = CATS[e.cat], got = chemGot(n), mats = matsWith(n), st = STATE[e.state];
  const how = CHEM.craft.indexOf(n) >= 0 ? 'you crafted with it in 🏭 Artifactory' : CHEM.e.indexOf(n) >= 0 ? 'you found it in the lab' : '';
  $('elc-card').innerHTML = '<button class="x" data-sound="tap" aria-label="Close">✖</button><div class="elc-top"><div class="elc-tile" style="background:' + C.col + '"><i>' + e.n + '</i><b>' + e.sym + '</b><small>' + UI.esc(e.name) + '</small></div>' +
    '<div><h3>' + UI.esc(e.name) + '</h3><p>' + UI.esc(C.name) + ' · ' + UI.esc(C.what) + '</p></div></div>' +
    '<div class="row"><span>' + st[0] + ' ' + st[1] + ' at room temperature</span><span>🔢 Atomic number ' + e.n + '</span><span>' + (e.row <= 7 ? '↔️ Row ' + e.row + ' · column ' + e.col : '🧲 ' + (e.row === 9 ? 'Lanthanide' : 'Actinide') + ' row') + '</span></div>' +
    '<div class="txt">💡 ' + UI.esc(e.fact) + '<br>📍 Where you meet it: ' + UI.esc(e.where) + '</div>' +
    (mats.length ? '<div class="row"><span>🏭 In Artifactory: ' + mats.map(UI.esc).join(' · ') + '</span></div>' : '') +
    '<canvas id="elc-atom" width="760" height="240"></canvas><div class="row"><span>⚛️ Electrons per shell: ' + e.shells.join(' · ') + '</span></div>' +
    '<div class="got' + (got ? '' : ' no') + '">' + (got ? '📇 ⭐ In your collection — ' + how : '🔒 Not yours yet — find it in 🔍 Element hunt' + (mats.length ? ' or craft with ' + mats[0] : '')) + '</div>';
  $('elc').classList.remove('hidden'); $('elc-card').querySelector('.x').onclick = closeElement; $('elc').onclick = ev => { if(ev.target.id === 'elc') closeElement(); };
  drawAtom($('elc-atom'), e, 0);
  gcEmit('element', {n: e.n, sym: e.sym});
}
function closeElement(){ $('elc').classList.add('hidden'); }
// a little Bohr atom: nucleus + one ring per shell, electrons as dots
function drawAtom(cv, e, t){
  if(!cv) return; const g = cv.getContext('2d'), W = cv.width, H = cv.height, cx = W / 2, cy = H / 2, n = e.shells.length, rmax = H * 0.46;
  g.clearRect(0, 0, W, H); g.fillStyle = '#F25F5C'; g.beginPath(); g.arc(cx, cy, 14, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '800 14px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e.sym, cx, cy + 1);
  e.shells.forEach((k, i) => { const rx = 24 + (W * 0.42 - 24) * (i + 1) / n, ry = 18 + (rmax - 18) * (i + 1) / n; g.strokeStyle = 'rgba(126,219,196,0.45)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.stroke();
    for(let j = 0; j < k; j++){ const a = j / k * Math.PI * 2 + t * (0.6 / (i + 1)) + i; g.fillStyle = '#FFC845'; g.beginPath(); g.arc(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, k > 18 ? 2.6 : 4, 0, 7); g.fill(); } });
}

// ---------- 🔍 ELEMENT HUNT ----------
function huntPool(lv){   // sc-2a2 ladder: who you hunt grows with the level (famous → first rows → everything)
  if(lv === 0) return FAMOUS.slice(); if(lv === 1) return FAMOUS.concat([3, 9, 10, 15, 16, 18, 22, 24, 27, 28, 53, 54, 74, 78, 86, 92]);
  if(lv === 2) return rangeN(1, 56); if(lv === 3) return rangeN(1, 56).concat([74, 78, 79, 80, 82, 86, 92]); if(lv === 4) return rangeN(1, 86).concat([92, 94]); return rangeN(1, 118); }
function clueOf(e, lv){   // sc-2a2: difficulty = what the clue gives you → {tag, main, sub}
  const fam = CATS[e.cat].name, hide = t => t.replace(new RegExp(e.name, 'ig'), '___');
  if(lv === 0) return {tag: '🔤 Match the letters', main: 'Find ' + e.name + ' — ' + e.sym, sub: 'Look in ' + rowText(e)};
  if(lv === 1) return {tag: '🔤 Letters', main: 'Find ' + e.sym + ' — ' + e.name, sub: 'Look for the big letters ' + e.sym};
  if(lv === 2) return {tag: '🔢 Number', main: 'Find number ' + e.n, sub: 'The small numbers count up row by row'};
  if(lv === 3) return {tag: '📛 Name only', main: 'Find ' + e.name, sub: 'Family: ' + fam};
  if(lv === 4) return {tag: '💡 Fact', main: hide(e.fact), sub: 'Family: ' + fam};
  return {tag: '💡 Fact · ⏱️ 15 s', main: hide(e.fact), sub: 'No numbers on the squares — think!'};
}
function rowText(e){ return e.row <= 7 ? 'row ' + e.row : e.row === 9 ? 'the lanthanide row (under the table)' : 'the actinide row (under the table)'; }
function moreHelp(e, lv, tries){   // one more help after each miss
  if(lv === 0) return {cell: true};
  if(lv === 1) return tries === 1 ? {sub: 'It is in ' + rowText(e), row: true} : {cell: true};
  if(lv === 2) return tries === 1 ? {sub: 'Number ' + e.n + ' is in ' + rowText(e), row: true} : {cell: true};
  if(lv === 3) return tries === 1 ? {sub: 'Its symbol is ' + e.sym} : {sub: 'Its symbol is ' + e.sym + ' · ' + rowText(e), row: true};
  if(lv === 4) return tries === 1 ? {sub: 'It is ' + e.name + ' (' + e.sym + ')'} : {sub: 'It is ' + e.name + ' (' + e.sym + ') · ' + rowText(e), row: true};
  return tries === 1 ? {sub: 'Family: ' + CATS[e.cat].name} : {sub: 'It is ' + e.name};
}
function startHunt(){
  const lv = SET.level, pool = shuffle(huntPool(lv)), fresh = pool.filter(n => !chemGot(n)), old = pool.filter(n => chemGot(n));
  const targets = []; while(targets.length < 8 && (fresh.length || old.length)){ const take = (targets.length % 2 === 0 ? fresh : old).length ? (targets.length % 2 === 0 ? fresh : old) : fresh.length ? fresh : old; targets.push(take.shift()); }
  HG = {lv, targets, i: 0, tries: 0, first: 0, score: 0, miss: 0, found: [], t0: Date.now(), done: false, tm: 0};
  hideResult(); labHand(null); showScreen('hunt'); HBAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); HBAR.score(0); HBAR.miss(0); HBAR.fit();
  try{ if(HBUD) HBUD.stop(); HBUD = UI.buddy ? UI.buddy($('hunt-buddy'), {name: S.player + '·lab', av: suitAv(S.player)}, {per: 2}) : null; }catch(e){ HBUD = null; }
  layoutHunt(); huntNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'chem'); gcEmit('start', {game: 'hunt'});
}
function stopHunt(){ if(HG){ HG.done = true; clearTimeout(HG.tm); clearTimeout(HG.gt); clearTimeout(HG.gt2); } if(HBUD){ HBUD.stop(); HBUD = null; } $('hunt-hand').classList.add('hidden'); huntClueOff(); }   // sc-2a2
function layoutHunt(){   // sc-2a2: wide table → the clue sits in the table's empty middle; tall phones → on top
  if(!HG) return; const cl = $('hunt-clue'), box = $('pt-hunt'), o = {mode: 'hunt', host: $('hunt-box'), onTap: huntTap, num: HG.lv === 2 ? 'big' : HG.lv === 5 ? 'none' : ''};
  cl.classList.add('ingap'); cl.removeAttribute('style'); drawTable(box, o);
  if(box.dataset.flip === '1' || +box.dataset.cs < 26){ cl.classList.remove('ingap'); cl.removeAttribute('style'); drawTable(box, o); }
  placeClue(); huntGuide();
}
function placeClue(){
  const cl = $('hunt-clue'), box = $('pt-hunt'), t = $('hunt-text');
  if(!cl.classList.contains('ingap')){ t.style.fontSize = ''; return; }
  const cs = +box.dataset.cs, r = box.getBoundingClientRect(), f = Math.max(13, Math.min(42, cs * 0.44));
  Object.assign(cl.style, {left: (r.left + 2 * cs + 2) + 'px', top: (r.top + 2) + 'px', width: (10 * cs - 6) + 'px', height: (3 * cs - 6) + 'px'});
  cl.style.setProperty('--cf', f + 'px'); fitClue();
}
function fitClue(){   // shrink a long fact until it fits the card
  const cl = $('hunt-clue'), t = $('hunt-text'); if(!cl.classList.contains('ingap')) return;
  let f = parseFloat(cl.style.getPropertyValue('--cf')) || 18; t.style.setProperty('font-size', f + 'px', 'important');
  for(let i = 0; i < 10 && t.scrollHeight > t.clientHeight + 1; i++){ f *= 0.9; t.style.setProperty('font-size', f + 'px', 'important'); }
}
function huntNext(){
  if(!HG || HG.done) return; clearTimeout(HG.tm); clearTimeout(HG.gt); clearTimeout(HG.gt2);
  if(HG.i >= HG.targets.length) return huntEnd();
  const e = EL[HG.targets[HG.i] - 1], c = clueOf(e, HG.lv); HG.tries = 0; HG.clueT = Date.now();
  const t = $('hunt-text'); t.className = 'clue-t'; void t.offsetWidth;
  t.innerHTML = '<span class="ctag">' + UI.esc(c.tag) + '</span><b class="cmain">' + UI.esc(c.main) + '</b><small class="csub" id="hunt-sub">' + UI.esc(c.sub) + '</small><span class="cfb" id="hunt-fb"></span>';
  fitClue(); HBAR.count('clue', '🔍', (HG.i + 1) + '/' + HG.targets.length, 'Clue');
  HG.rowOn = false; HG.cellOn = false; huntGuide();
  // 🌱 Basic gives time to look first: the row glows after 3 s, the square + 👆 after 8 s · 🐣 the row after 10 s
  if(HG.lv === 0){ HG.gt = setTimeout(() => { if(HG){ HG.rowOn = true; huntGuide(); } }, 3000 * SCI_FX); HG.gt2 = setTimeout(() => { if(HG){ HG.cellOn = true; huntGuide(); } }, 8000 * SCI_FX); }
  if(HG.lv === 1) HG.gt = setTimeout(() => { if(HG){ HG.rowOn = true; huntGuide(); } }, 10000 * SCI_FX);
  if(HG.lv === 5) HG.tm = setTimeout(() => { if(HG && !HG.done && HG.targets[HG.i] === e.n){ HG.miss++; HBAR.miss(HG.miss); huntSay('⏱️ Time! It was ' + e.name + ' (' + e.sym + ')', 'bad'); flashCell(e.n, 'hit'); HG.i++; HG.wait = true; setTimeout(() => { if(HG){ HG.wait = false; huntNext(); } }, 1400 * SCI_FX); } }, 15000);
}
function huntGuide(){
  if(!HG || HG.i >= HG.targets.length) return; const e = EL[HG.targets[HG.i] - 1];
  document.querySelectorAll('#pt-hunt .pt-cell').forEach(b => { const x = EL[b.dataset.n - 1]; b.classList.toggle('rowglow', !!HG.rowOn && x.row === e.row); b.classList.toggle('glow', !!HG.cellOn && x.n === e.n); });
  const hand = $('hunt-hand'); if(HG.cellOn){ const b = document.querySelector('#pt-hunt [data-n="' + e.n + '"]'); if(b){ const r = b.getBoundingClientRect(); hand.style.left = (r.left + r.width * 0.5) + 'px'; hand.style.top = (r.top + r.height * 0.5) + 'px'; hand.classList.remove('hidden'); } } else hand.classList.add('hidden');
}
function flashCell(n, cls){ const b = document.querySelector('#pt-hunt [data-n="' + n + '"]'); if(!b) return; b.classList.remove(cls); void b.offsetWidth; b.classList.add(cls); setTimeout(() => b.classList.remove(cls), 800); }
function huntSay(t, mood){ const el = $('hunt-fb'); if(!el) return; el.className = 'cfb ' + (mood || ''); el.textContent = t; fitClue(); }   // sc-2a2: the clue stays, the answer goes in the strip under it
function huntTap(n){
  if(!HG || HG.done || HG.i >= HG.targets.length || HG.wait) return; const want = HG.targets[HG.i], e = EL[want - 1];
  if(n === want){
    const pts = [100, 50, 20][Math.min(2, HG.tries)]; HG.score += pts; if(HG.tries === 0) HG.first++; HG.found.push(n); UISound.play('success'); flashCell(n, 'hit'); if(HBUD) HBUD.react('joy');
    const isNew = !chemGot(n) && HG.found.indexOf(n) === HG.found.length - 1;
    huntSay('✅ ' + e.name + ' (' + e.sym + ')! ' + (isNew ? '📇 New card! ' : '') + '+' + pts, 'ok'); HBAR.score(Math.round(HG.score * SCI_MULT(HG.lv))); gcEmit('right', {n});
    HG.i++; HG.wait = true; clearTimeout(HG.tm); clearTimeout(HG.gt); clearTimeout(HG.gt2); HG.cellOn = true; huntGuideAt(e);   // the found square stays lit while the kid looks
    setTimeout(() => { if(HG){ HG.wait = false; huntNext(); } }, (HG.lv <= 1 ? 1600 : 1100) * SCI_FX);
  } else {
    const x = EL[n - 1]; HG.tries++; HG.miss++; HBAR.miss(HG.miss); UISound.play('error'); flashCell(n, 'miss'); if(HBUD) HBUD.react('miss');
    huntSay('That is ' + x.name + ' (' + x.sym + ', ' + x.n + ') — try again!', 'bad'); gcEmit('wrong', {n});
    const h = moreHelp(e, HG.lv, HG.tries); if(h.sub && $('hunt-sub')) $('hunt-sub').textContent = h.sub; if(h.row) HG.rowOn = true; if(h.cell){ HG.rowOn = true; HG.cellOn = true; } huntGuide(); fitClue();
  }
}
function huntGuideAt(e){ document.querySelectorAll('#pt-hunt .pt-cell').forEach(b => { b.classList.toggle('rowglow', false); b.classList.toggle('glow', +b.dataset.n === e.n); }); $('hunt-hand').classList.add('hidden'); }
function SCI_MULT(lv){ return (META().mult || [1, 1.25, 1.5, 2, 2.5, 7.5])[lv] || 1; }
function huntEnd(){
  HG.done = true; clearTimeout(HG.tm); $('hunt-hand').classList.add('hidden');
  const total = HG.targets.length, acc = HG.first / total, stars = acc >= 0.9 ? 3 : acc >= 0.6 ? 2 : 1, score = Math.round(HG.score * SCI_MULT(HG.lv));
  chemSave('hunt', {found: HG.found, built: [], right: HG.first, total, score, stars, timeSec: Math.round((Date.now() - HG.t0) / 1000)});
}

// ---------- ⚛️ FORMULA BUILDER ----------
const FM_TIERS = [[0], [0, 1, 1], [1, 2, 2], [2, 3, 3], [3, 4, 4], [4, 5, 5]];
function startFormula(){
  const lv = SET.level, tiers = FM_TIERS[lv], list = [], used = {};
  for(let i = 0; i < 5; i++){ const t = tiers[i % tiers.length]; const pool = shuffle(COMPS.filter(c => c.tier === t && !used[c.id])); const c = pool[0] || shuffle(COMPS.filter(c => !used[c.id] && c.tier <= Math.max(...tiers)))[0]; used[c.id] = 1; list.push(c); }
  FG = {lv, list, i: 0, tries: 0, first: 0, score: 0, miss: 0, built: [], found: [], t0: Date.now(), done: false};
  hideResult(); labHand(null); showScreen('formula'); FBAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); FBAR.score(0); FBAR.miss(0); FBAR.fit();
  try{ if(FBUD) FBUD.stop(); FBUD = UI.buddy ? UI.buddy($('fm-buddy'), {name: S.player + '·lab', av: suitAv(S.player)}, {per: 2}) : null; }catch(e){ FBUD = null; }
  fmNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'chem'); gcEmit('start', {game: 'formula'});
}
function stopFormula(){ if(FG) FG.done = true; if(FBUD){ FBUD.stop(); FBUD = null; } }
function fmNext(){
  if(!FG || FG.done) return; if(FG.i >= FG.list.length) return fmEnd();
  const c = FG.list[FG.i], need = Object.keys(c.cnt), decoyN = [0, 1, 2, 2, 3, 3][FG.lv], pool = shuffle(['H', 'C', 'N', 'O', 'Na', 'Cl', 'S', 'Ca', 'Fe', 'K', 'Mg', 'Si', 'Cu'].filter(x => need.indexOf(x) < 0));
  FG.kit = shuffle(need.concat(pool.slice(0, decoyN))); FG.tray = {}; FG.tries = 0; FG.hint = FG.lv <= 2; FG.solved = false;
  FBAR.count('mol', '⚛️', (FG.i + 1) + '/' + FG.list.length, 'Molecule');
  $('fm-name').textContent = c.icon + ' ' + c.name; $('fm-where').textContent = FG.lv >= 4 ? '' : '📍 ' + c.where; fmFormula();
  $('fm-msg').className = 'fm-msg'; $('fm-msg').textContent = FG.lv === 0 ? '👆 Tap the glowing atom to add it' : '';
  fmRender();
}
function fmFormula(){ const c = FG.list[FG.i]; $('fm-formula').innerHTML = FG.hint || FG.solved ? sub(c.f) : '❓'; }
function fmRender(){
  const c = FG.list[FG.i], keys = Object.keys(FG.tray).filter(k => FG.tray[k] > 0);
  $('fm-tray').innerHTML = '<span class="cap">🧪 Your molecule</span>' + (keys.length ? keys.map(k => '<span class="tchip" data-k="' + k + '"><button class="tminus" data-minus="' + k + '" data-sound="tap" aria-label="Take one ' + k + ' out">−</button>' + ballHtml(k) + '<b>×' + FG.tray[k] + '</b>' + (FG.lv === 0 && c.cnt[k] ? '<span class="need">/' + c.cnt[k] + '</span>' : '') + '<button class="tplus" data-plus="' + k + '" data-sound="tap" aria-label="Add one more ' + k + '">+</button></span>').join('') : '<span class="empty">Empty — tap an atom below</span>');
  $('fm-tray').querySelectorAll('[data-plus]').forEach(b => b.onclick = () => fmAdd(b.dataset.plus, 1));
  $('fm-tray').querySelectorAll('[data-minus]').forEach(b => b.onclick = () => fmAdd(b.dataset.minus, -1));
  const next = FG.lv === 0 && !FG.solved ? Object.keys(c.cnt).find(k => (FG.tray[k] || 0) < c.cnt[k]) : null;
  $('fm-kit').innerHTML = '<span class="cap">👇 Tap an atom to add it</span>' + FG.kit.map(k => '<button data-k="' + k + '" data-sound="none" class="' + (k === next ? 'kglow' : '') + '">' + ballHtml(k) + '<span class="knm">' + UI.esc((BYSYM[k] || {}).name || k) + '</span></button>').join('');
  $('fm-kit').querySelectorAll('[data-k]').forEach(b => b.onclick = () => fmAdd(b.dataset.k, 1));
  const act = $('fm-act');
  if(FG.solved) act.innerHTML = '<button class="sp-btn sp-primary sp-lg" id="fm-next" data-sound="pop">' + (FG.i + 1 < FG.list.length ? 'Next molecule ▶' : '📋 Finish') + '</button>';
  else act.innerHTML = (FG.lv >= 3 && FG.lv < 5 && !FG.hint ? '<button class="sp-btn sp-ghost" id="fm-hint" data-sound="tap">💡 Show formula (−40)</button>' : '') + '<button class="sp-btn sp-primary sp-lg" id="fm-check" data-sound="none"' + (keys.length ? '' : ' disabled') + '>✅ Check</button>';
  if($('fm-next')) $('fm-next').onclick = () => { if(!FG || !FG.solved) return; FG.solved = false; FG.i++; fmNext(); };
  if($('fm-hint')) $('fm-hint').onclick = () => { FG.hint = true; FG.usedHint = true; fmFormula(); fmRender(); };
  if($('fm-check')) $('fm-check').onclick = fmCheck;
  drawMol();
}
function fmAdd(k, d){ if(!FG || FG.solved) return; const was = FG.tray[k] || 0, v = Math.max(0, Math.min(24, was + d)); FG.tray[k] = v; UISound.play('tap');
  if(d > 0 && v > was) labCarry(FBUD, $('fm-buddy'), document.querySelector('#fm-kit [data-k="' + k + '"] .ball, #fm-tray [data-k="' + k + '"] .ball'), () => centreXY('fm-mol'), AtomSkins.url(k, CPK[k] || AtomSkins.colour(k), atomSkin(), 64));
  fmRender(); }
function fmCheck(){
  if(!FG || FG.solved) return; const c = FG.list[FG.i], keys = Object.keys(Object.assign({}, c.cnt, FG.tray)).filter(k => (FG.tray[k] || 0) || c.cnt[k]);
  const bad = keys.find(k => (FG.tray[k] || 0) !== (c.cnt[k] || 0));
  if(!bad){
    let pts = [100, 60, 30][Math.min(2, FG.tries)]; if(FG.usedHint && FG.lv >= 3) pts = Math.max(10, pts - 40); FG.usedHint = false;
    FG.score += pts; if(FG.tries === 0) FG.first++; FG.solved = true; FG.built.push(c.id); Object.keys(c.cnt).forEach(k => { const n = BYSYM[k].n; if(FG.found.indexOf(n) < 0) FG.found.push(n); });
    UISound.play('success'); if(FBUD) FBUD.react('joy'); FBAR.score(Math.round(FG.score * SCI_MULT(FG.lv)));
    fmSay('ok', 'Built it! ' + UI.esc(c.name) + ' = ' + sub(c.f) + ' · ' + UI.esc(c.where), pts, c); $('fm-where').textContent = '📍 ' + c.where; fmFormula(); FG.spin = performance.now(); fmRender(); gcEmit('right', {id: c.id}); return;
  }
  FG.tries++; FG.miss++; FBAR.miss(FG.miss); UISound.play('error'); if(FBUD) FBUD.react('miss'); gcEmit('wrong', {id: c.id});
  const have = FG.tray[bad] || 0, want = c.cnt[bad] || 0, nm = (BYSYM[bad] || {}).name || bad;
  if(FG.lv === 5){ fmSay('end', '❌ Not quite — it is ' + sub(c.f) + '. One check only on 💀 Hardcore!'); FG.tray = Object.assign({}, c.cnt); FG.solved = true; FG.hint = true; fmFormula(); fmRender(); return; }
  if(FG.lv <= 2) fmSay('try', UI.esc(want === 0 ? 'There is no ' + nm + ' in ' + c.name + ' — take the ' + bad + ' out.' : c.name + ' needs ' + want + ' ' + bad + ' — you have ' + have + '.'));
  else fmSay('try', 'Not quite — count each kind of atom again.' + (FG.lv >= 3 && FG.tries >= 2 && !FG.hint ? ' Try 💡 Show formula.' : ''));
}
// the molecule as balls: the rarest heavy atom in the middle, the rest in rings (hydrogens outside)
function drawMol(){
  const cv = $('fm-mol'); if(!cv || !FG) return; const r = cv.getBoundingClientRect(); if(r.width < 10) return;
  const dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const W = r.width, H = r.height, cx = W / 2, cy = H / 2, atoms = [];
  Object.keys(FG.tray).forEach(k => { for(let i = 0; i < (FG.tray[k] || 0); i++) atoms.push(k); });
  if(!atoms.length){ g.fillStyle = 'rgba(255,255,255,0.35)'; g.font = '800 14px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('⚛️', cx, cy); return; }
  const heavy = atoms.filter(a => a !== 'H'), order = heavy.slice().sort((a, b) => FG.tray[a] - FG.tray[b]), centre = order[0] || atoms[0], rest = atoms.slice(); rest.splice(rest.indexOf(centre), 1);
  rest.sort((a, b) => (a === 'H') - (b === 'H'));
  const R0 = Math.min(W, H) * 0.5, br = Math.max(7, Math.min(Math.max(36, H * 0.12), R0 / (2 + Math.sqrt(atoms.length) * 0.9))), rings = [], cap = [6, 12, 18, 99]; let i = 0;
  cap.forEach((c, ri) => { if(i < rest.length){ rings.push(rest.slice(i, i + c)); i += c; } });
  const t = FG.spin ? Math.min(1, (performance.now() - FG.spin) / 900) : 1, rot = FG.solved ? (1 - t) * 2 : 0, pos = [[cx, cy, centre]];
  rings.forEach((ring, ri) => { const rr = br * 2.3 * (ri + 1); ring.forEach((a, j) => { const ang = j / ring.length * Math.PI * 2 + ri * 0.4 + rot; pos.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 0.82, a]); }); });
  g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = Math.max(2, br * 0.3);
  pos.slice(1).forEach((p, j) => { const ri = rings.findIndex((ring, k) => j < rings.slice(0, k + 1).reduce((s, x) => s + x.length, 0)); const from = ri <= 0 ? pos[0] : pos[1 + (j % Math.max(1, rings[0].length))]; g.beginPath(); g.moveTo(from[0], from[1]); g.lineTo(p[0], p[1]); g.stroke(); });
  if(window.AtomSkins){ const sk = atomSkin(); pos.forEach(p => { const k = p[2], rad = k === 'H' ? br * 0.75 : br; AtomSkins.draw(g, p[0], p[1], rad, rad >= 11 ? k : '', CPK[k] || AtomSkins.colour(k), sk, 0.6); }); if(FG.solved && t < 1 && SCI_FX) requestAnimationFrame(drawMol); return; }   // 🎨 sc-2b
  pos.forEach(p => { const k = p[2], rad = k === 'H' ? br * 0.75 : br, col = CPK[k] || '#F5A3C7'; const gr = g.createRadialGradient(p[0] - rad * 0.35, p[1] - rad * 0.35, rad * 0.1, p[0], p[1], rad); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.35, col); gr.addColorStop(1, shade(col, 0.6));
    g.fillStyle = gr; g.beginPath(); g.arc(p[0], p[1], rad, 0, 7); g.fill(); if(rad >= 11){ g.fillStyle = DARK[k] ? '#fff' : '#16233A'; g.font = '800 ' + Math.round(rad * 0.75) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(k, p[0], p[1] + 1); } });
  if(FG.solved && t < 1 && SCI_FX) requestAnimationFrame(drawMol);
}
function fmEnd(){
  FG.done = true; const total = FG.list.length, acc = FG.first / total, stars = acc >= 0.8 ? 3 : acc >= 0.6 ? 2 : 1;
  chemSave('formula', {found: FG.found, built: FG.built, right: FG.first, total, score: Math.round(FG.score * SCI_MULT(FG.lv)), stars, timeSec: Math.round((Date.now() - FG.t0) / 1000)});
}

// ---------- save + the result card ----------
function chemSave(kind, res){
  const lv = SET.level, before = CHEM.all.slice();
  const show = r => {
    if(r && r.chem) CHEM = Object.assign({}, CHEM, r.chem);
    const nw = r ? r.newCards || [] : res.found.filter(n => before.indexOf(n) < 0);
    const newLooks = r && r.atomSkins > (S.atomSkins || 0) ? AtomSkins.SKINS.slice((S.atomSkins || 0) + 1, r.atomSkins + 1) : []; if(r && r.atomSkins != null) S.atomSkins = r.atomSkins;
    const KU = KIND_UI[kind] || KIND_UI.formula;
    const h = '<h2>' + KU[0] + '</h2><div class="rating">' + [1, 2, 3].map(i => '<span class="st' + (i <= res.stars ? '' : ' off') + '">⭐</span>').join('') + '</div>' +
      '<div class="tc-row"><span class="ok">🎯 ' + res.right + ' / ' + res.total + ' ' + KU[2] + '</span><span class="gold">🏆 ' + res.score.toLocaleString() + '</span></div>' +
      (nw.length ? '<div class="why"><b>📇 New element cards (' + nw.length + ')</b><div class="newcards">' + nw.map(n => { const e = EL[n - 1]; return '<span style="background:' + CATS[e.cat].col + '">' + e.sym + ' · ' + UI.esc(e.name) + '</span>'; }).join('') + '</div></div>' : KU[3] >= 4 && L3RECAP ? '<div class="why"><b>💡 Lab notes</b>' + L3RECAP + '</div>' : '<div class="why"><b>📇 ' + CHEM.all.length + ' / 118 cards</b>No new cards this time — try a harder level for rarer elements!</div>') +
      ((kind === 'formula' || (KIND_UI[kind] || [])[3] === 2) && r && r.newComps && r.newComps.length ? '<div class="tc-row"><span class="gold">⚛️ ' + r.newComps.length + ' new molecule' + (r.newComps.length > 1 ? 's' : '') + ' in your book</span></div>' : '') +
      (kind === 'atom' && r && r.newAtoms && r.newAtoms.length ? '<div class="tc-row"><span class="gold">⚛️ ' + r.newAtoms.length + ' new atom' + (r.newAtoms.length > 1 ? 's' : '') + ' built — ' + CHEM.a.length + ' so far</span></div>' : '') +
      (r && r.newParts && r.newParts.length ? '<div class="why"><b>📇 New particle card' + (r.newParts.length > 1 ? 's' : '') + ' (' + r.newParts.length + ')</b><div class="newcards">' + r.newParts.map(id => { const p = PBY[id]; return p ? '<span style="background:' + PFAM[p[3]].col + '">' + p[1] + ' · ' + UI.esc(p[2]) + '</span>' : ''; }).join('') + '</div></div>' : '') +
      (newLooks.length ? '<div class="why"><b>🎨 New atom look' + (newLooks.length > 1 ? 's' : '') + ' unlocked: ' + newLooks.map(L => L.icon + ' ' + UI.esc(L.name)).join(' · ') + '!</b><div class="newcards">' + newLooks.map(L => '<img src="' + AtomSkins.url('O', CPK.O, L.k, 64) + '" style="width:56px;height:56px" alt="">').join('') + '</div>Pick it on the lab screen.</div>' : '') +
      (r && r.newNotes && r.newNotes.length && (ACT3[kind] || QN_KINDS[kind]) ? (B => '<div class="tc-row"><span class="gold">📒 +' + r.newNotes.length + ' ' + B.name + ' page' + (r.newNotes.length > 1 ? 's' : '') + ' · ' + B.n + ' / ' + B.of + '</span></div>')(ACT3[kind] ? noteBook(ACT3[kind].sec) : qNoteBook()) : '') +   /* ✨ sc-5a + 📒 sc-6 */
      '<div class="save-note" id="save-note">' + (r ? saveText(r.save || {}, res.stars >= 2) : '⚠️ Could not save — check the connection.') + '</div>' +
      '<div class="res-btns" id="res-btns"><button class="sp-btn sp-secondary" id="res-levels" data-sound="tap">🎚️ Levels</button><button class="sp-btn sp-secondary" id="res-again" data-sound="pop">🔁 Play again</button><button class="sp-btn sp-primary" id="res-next" data-sound="pop">⚗️ Chemistry ▶</button></div><div class="comics-slot" id="comic-strip-slot"></div>';
    showResult(h);
    if(KU[3]){ $('res-next').textContent = KU[3] === 3 ? '🔬 Particle ▶' : KU[3] === 2 ? '🧫 Kitchen lab ▶' : '⚛️ Quantum ▶'; }
    $('res-levels').onclick = () => KU[3] === 1 ? leaveQuantum(true) : KU[3] === 3 ? leaveParticle(true) : leaveChem(true); $('res-again').onclick = () => { hideResult(); KU[1](); }; $('res-next').onclick = () => KU[3] === 1 ? leaveQuantum(false) : KU[3] === 2 ? leaveXlab() : KU[3] === 3 ? leaveParticle(false) : leaveChem(false);
    if(KU[3] >= 4){ const G3 = SEC3G(KU[3]); $('res-next').textContent = G3.icon + ' ' + G3.name + ' lab ▶'; $('res-levels').onclick = () => leaveSec3(true); $('res-next').onclick = () => leaveSec3(false); }   // 🔥 sc-3a
    if(r && r.save && r.save.unlocked != null){ const p = S.progress[S.player] || (S.progress[S.player] = {unlocked: 0, tokens: [], best: []}); p.unlocked = Math.max(p.unlocked, r.save.unlocked); }
    if(res.stars >= 2 && SCI_FX) confetti(KU[3] >= 4 ? SEC3G(KU[3]).fx : KU[3] === 3 ? ['🔬', '⭐', '💥', '✨'] : KU[3] === 2 ? ['🧫', '⭐', '🫧', '💎'] : KU[3] ? ['⚛️', '⭐', '🔴', '🔵'] : ['⚗️', '⭐', '⚛️', '🧪'], 20);
    gcEmit('card', {kind, stars: res.stars});
  };
  google.script.run.withSuccessHandler(show).withFailureHandler(() => show(null)).sciChemSave(S.player, lv, kind, res);
}

/* ================= ⚛️ QUANTUM (sc-2b) — Atom builder + 🎨 atom looks =================
   The protons decide the element (the name changes as you add them) · electrons fill the real shells (ChemTable shells of the element with that many electrons)
   · neutrons + protons = the mass number · protons − electrons = the charge (neutral / ion). Saves through sciChemSave(kind 'atom'). */
// most common isotope: neutrons for Z = 1…36 (index = Z)
const NEUT = [0, 0, 2, 4, 5, 6, 6, 7, 8, 10, 10, 12, 12, 14, 14, 16, 16, 18, 22, 20, 20, 24, 26, 28, 28, 30, 30, 32, 30, 34, 34, 38, 42, 42, 46, 44, 48];
const IONS = [[11, 1], [17, -1], [12, 2], [8, -2], [19, 1], [20, 2], [9, -1], [3, 1], [13, 3], [16, -2]];   // [Z, charge] kid-friendly ions
let AG = null, ABUD = null, AT_RAF = 0;
function atomSkin(){ if(!window.AtomSkins) return 'classic'; const k = AtomSkins.get(S.player), own = AtomSkins.owned(S.atomSkins || 0); return own.indexOf(k) >= 0 ? k : 'classic'; }
function renderSkins(id){ const box = $(id); if(!box || !window.AtomSkins) return; AtomSkins.chips(box, atomSkin(), k => { AtomSkins.set(S.player, k); UISound.play('pop'); renderSkins(id); }, {owned: AtomSkins.owned(S.atomSkins || 0)}); }
const ABAR = UI.gameBar($('abar'), {game: GAME_ID, icon: '⚛️', name: 'Atom builder', levelId: 'atom-level', levels: () => leaveQuantum(true), playing: () => !!(AG && !AG.done), onLeave: () => { if(AG) AG.done = true; }, scoreMin: '5ch', onFit: () => drawAtomNow()});
ABAR.score(0); ABAR.miss(0); ABAR.count('atom', '⚛️', '1/5', 'Atom');

// ---------- hub ----------
function openQuantum(lv){
  SET.level = lv; const U = LEVEL_UI[lv];
  $('qhub-sub').textContent = U.emoji + ' ' + U.name + ' · ' + QUANT_LVL[lv][0];
  $('qhub-count').innerHTML = '<span>⚛️ ' + (CHEM.a || []).length + ' atoms built</span><span>📇 ' + CHEM.all.length + ' / 118 element cards</span>';
  const H = [['atom', '⚛️', 'Atom builder', 'Snap protons, neutrons + electrons into 5 real atoms', 0], ['led', '💡', 'LED colours', 'Drop an electron down the energy ladder — bigger drop, bluer light', 0], ['glow', '✨', 'Glow charge-up', 'Pick a light, charge the glow star, lights off!', 0], ['cat', '🐱', 'Cat in the box', 'Napping or awake? Guess how many before you look', 0]];
  $('qhub-hub').innerHTML = H.map((h, i) => '<button class="pick' + (h[4] ? ' soonpick' : '') + '" data-g="' + h[0] + '" data-sound="' + (h[4] ? 'none' : 'pop') + '" style="animation:sc-pop .4s ' + (i * 0.08) + 's both"><div class="big">' + h[1] + '</div><div class="nm">' + h[2] + '</div><div class="sub">' + h[3] + '</div></button>').join('');
  $('qhub-hub').querySelectorAll('[data-g]').forEach(b => b.onclick = () => { if(b.classList.contains('soonpick')){ UISound.play('error'); UI.toast('🔜 Coming in the next lab update'); return; } ({atom: startAtom, led: startLed, glow: startGlow, cat: startCat}[b.dataset.g] || startAtom)(); });
  renderSkins('qhub-skins'); showScreen('qhub');
  if(lv === 0) setTimeout(() => { if(!$('scr-qhub').classList.contains('hidden')){ const b = $('qhub-hub').querySelector('[data-g="atom"]'); b.classList.add('glow-next'); labHand(b); } }, 400 * SCI_FX);
}
function leaveQuantum(toLevels){ stopAtom(); stopLed(); stopGlow(); stopCat(); hideResult(); labHand(null); if(toLevels){ renderMenu(); showScreen('menu'); } else openQuantum(SET.level); }

// ---------- a round ----------
function atomTargets(lv){
  const pool = shuffle(lv === 0 ? rangeN(1, 10) : lv === 1 ? rangeN(1, 18) : lv <= 3 ? rangeN(1, 20) : rangeN(1, 36)), out = [];
  const ions = lv >= 4 ? shuffle(IONS.slice()) : [];
  for(let i = 0; i < 5; i++){
    if(lv >= 4 && (i === 1 || i === 3)){ const io = ions.shift(); out.push({z: io[0], n: NEUT[io[0]], e: io[0] - io[1], q: io[1]}); continue; }
    const z = pool.shift(); out.push({z, n: NEUT[z] || 0, e: z, q: 0});
  }
  return out;
}
function startAtom(){
  const lv = SET.level;
  AG = {lv, list: atomTargets(lv), i: 0, p: 0, n: 0, e: 0, tries: 0, first: 0, score: 0, miss: 0, atoms: [], t0: Date.now(), done: false, solved: false};
  hideResult(); labHand(null); showScreen('atom'); ABAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); ABAR.score(0); ABAR.miss(0); ABAR.fit();
  try{ if(ABUD) ABUD.stop(); ABUD = UI.buddy ? UI.buddy($('am-buddy'), {name: S.player + '·lab', av: suitAv(S.player)}, {per: 2}) : null; }catch(e){ ABUD = null; }
  atomNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'quantum'); gcEmit('start', {game: 'atom'});
  atomLoop();
}
function stopAtom(){ if(AG){ AG.done = true; clearTimeout(AG.tm); } if(ABUD){ ABUD.stop(); ABUD = null; } cancelAnimationFrame(AT_RAF); }
function ionTxt(q){ return q === 0 ? '' : (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '⁺' : '⁻'); }
function atomNext(){
  if(!AG || AG.done) return; clearTimeout(AG.tm);
  if(AG.i >= AG.list.length) return atomEnd();
  const T = AG.list[AG.i], e = EL[T.z - 1], lv = AG.lv; AG.p = 0; AG.n = 0; AG.e = 0; AG.tries = 0; AG.solved = false; AG.hint = lv <= 2; AG.usedHint = false;
  ABAR.count('atom', '⚛️', (AG.i + 1) + '/' + AG.list.length, 'Atom');
  const mass = T.z + T.n, name = e.name + (T.q ? ' ion ' + e.sym + ionTxt(T.q) : '');
  $('am-name').textContent = (lv >= 2 ? name + (T.q ? '' : '-' + mass) : name);
  $('am-need').innerHTML = atomNeed(T);
  $('am-hint').textContent = lv === 0 ? '👆 Tap the glowing + buttons' : lv === 1 ? 'Atomic number = protons · a neutral atom has as many electrons' : lv === 2 ? 'Mass number ' + mass + ' = protons + neutrons' : T.q ? (T.q > 0 ? 'An ion that LOST ' + T.q + ' electron' + (T.q > 1 ? 's' : '') : 'An ion that GAINED ' + (-T.q) + ' electron' + (T.q < -1 ? 's' : '')) : lv === 5 ? '⏱️ 30 s · one check' : 'Mass number ' + mass;
  $('am-msg').className = 'fm-msg'; $('am-msg').textContent = '';
  atomRender();
  if(lv === 5) AG.tm = setTimeout(() => { if(AG && !AG.done && !AG.solved){ AG.miss++; ABAR.miss(AG.miss); UISound.play('error'); atomShowAnswer('⏱️ Time! '); } }, 30000);
}
function atomNeed(T){
  const lv = AG.lv, e = EL[T.z - 1];
  if(lv === 0) return '🔴 ' + T.z + ' protons · 🔵 ' + T.e + ' electrons';
  if(lv === 1) return 'Atomic number ' + T.z;
  if(lv === 2) return 'Atomic number ' + T.z + ' · mass ' + (T.z + T.n);
  if(lv === 3) return AG.hint ? 'Atomic number ' + T.z + ' · mass ' + (T.z + T.n) : 'Mass ' + (T.z + T.n) + ' · atomic number ❓';
  return 'Mass ' + (T.z + T.n) + (T.q ? ' · charge ' + (T.q > 0 ? '+' : '−') + Math.abs(T.q) : '') + (AG.hint ? ' · atomic number ' + T.z : '');
}
function atomRender(){
  const lv = AG.lv, T = AG.list[AG.i], nx = lv === 0 && !AG.solved ? (AG.p < T.z ? 'p' : AG.e < T.e ? 'e' : '') : '';
  const row = (k, lab, sym, col, v, hide) => '<div class="am-row' + (hide ? ' hide' : '') + '" data-k="' + k + '"><span class="lab"><img src="' + AtomSkins.url(sym, col, atomSkin(), 48) + '" alt="">' + lab + '</span>' +
    '<button class="tminus" data-d="-1" data-sound="tap" aria-label="Take one ' + lab + ' away">−</button><b>' + v + '</b><button class="tplus' + (nx === k ? ' kglow' : '') + '" data-d="1" data-sound="tap" aria-label="Add one ' + lab + '">+</button></div>';
  $('am-rows').innerHTML = row('p', 'Protons', '+', AtomSkins.colour('p+'), AG.p) + row('n', 'Neutrons', '', AtomSkins.colour('n'), AG.n, lv < 2) + row('e', 'Electrons', '−', AtomSkins.colour('e-'), AG.e);
  $('am-rows').querySelectorAll('.am-row').forEach(r => r.querySelectorAll('button').forEach(b => b.onclick = () => atomAdd(r.dataset.k, Number(b.dataset.d))));
  const act = $('am-act');
  if(AG.solved) act.innerHTML = '<button class="sp-btn sp-primary sp-lg" id="am-next" data-sound="pop">' + (AG.i + 1 < AG.list.length ? 'Next atom ▶' : '📋 Finish') + '</button>';
  else act.innerHTML = ((lv === 3 || lv === 4) && !AG.hint ? '<button class="sp-btn sp-ghost" id="am-hintb" data-sound="tap">💡 Show its number (−40)</button>' : '') + '<button class="sp-btn sp-primary sp-lg" id="am-check" data-sound="none"' + (AG.p + AG.e + AG.n ? '' : ' disabled') + '>✅ Check</button>';
  if($('am-next')) $('am-next').onclick = () => { if(!AG || !AG.solved) return; AG.i++; atomNext(); };
  if($('am-hintb')) $('am-hintb').onclick = () => { AG.hint = true; AG.usedHint = true; $('am-need').innerHTML = atomNeed(T); atomRender(); };
  if($('am-check')) $('am-check').onclick = atomCheck;
  atomNow(); drawAtomNow();
}
function atomNow(){   // the live read-out: what your protons make + the charge
  const el = $('am-now'), p = AG.p, q = AG.p - AG.e;
  if(!p){ el.className = 'am-now'; el.textContent = AG.e ? 'No protons = no element yet' : 'Add protons to start'; return; }
  const e = EL[p - 1], name = e ? e.name + ' (' + e.sym + ')' : 'element ' + p;
  el.className = 'am-now' + (q === 0 ? ' ok' : ''); el.textContent = p + ' proton' + (p > 1 ? 's' : '') + ' → ' + name + ' · ' + (q === 0 ? '⚖️ neutral' : (q > 0 ? '+' : '−') + Math.abs(q) + ' ion');
}
function atomAdd(k, d){
  if(!AG || AG.solved || AG.done) return; const max = {p: 36, n: 48, e: 40}[k], was = AG[k]; AG[k] = Math.max(0, Math.min(max, AG[k] + d)); UISound.play(d > 0 ? 'tap' : 'pop');
  if(d > 0 && AG[k] > was) labCarry(ABUD, $('am-buddy'), document.querySelector('#am-rows .am-row[data-k="' + k + '"] .lab img'), () => k === 'e' ? centreXY('am-atom', 0.12) : centreXY('am-atom'), AtomSkins.url(k === 'p' ? '+' : k === 'e' ? '−' : '', AtomSkins.colour(k === 'p' ? 'p+' : k === 'e' ? 'e-' : 'n'), atomSkin(), 64));
  if(k === 'p' && AG.lv < 2) AG.n = NEUT[AG.p] || 0;   // 🌱 🐣: neutrons come along by themselves
  atomRender();
}
function atomCheck(){
  if(!AG || AG.solved) return; const T = AG.list[AG.i], lv = AG.lv, e = EL[T.z - 1];
  const okP = AG.p === T.z, okN = lv < 2 || AG.n === T.n, okE = AG.e === T.e;
  if(okP && okN && okE){
    let pts = [100, 60, 30][Math.min(2, AG.tries)]; if(AG.usedHint) pts = Math.max(10, pts - 40);
    AG.score += pts; if(AG.tries === 0) AG.first++; AG.solved = true; AG.atoms.push(T.z); clearTimeout(AG.tm);
    UISound.play('success'); if(ABUD) ABUD.react('joy'); ABAR.score(Math.round(AG.score * SCI_MULT(lv)));
    $('am-msg').className = 'fm-msg ok'; $('am-msg').textContent = '✅ Built it! ' + e.name + (T.q ? ' ion' : '') + ' · ' + e.shells.length + ' shell' + (e.shells.length > 1 ? 's' : '') + ' · +' + pts + (chemGot(T.z) ? '' : ' · 📇 new card');
    AG.pop = performance.now(); atomRender(); gcEmit('right', {z: T.z}); return;
  }
  AG.tries++; AG.miss++; ABAR.miss(AG.miss); UISound.play('error'); if(ABUD) ABUD.react('miss'); gcEmit('wrong', {z: T.z});
  if(lv === 5) return atomShowAnswer('❌ ');
  let m;
  if(lv <= 2){
    if(!okP) m = e.name + ' needs ' + T.z + ' protons — you have ' + AG.p + '.';
    else if(!okN) m = e.name + '-' + (T.z + T.n) + ' needs ' + T.n + ' neutrons (' + (T.z + T.n) + ' − ' + T.z + ') — you have ' + AG.n + '.';
    else m = (T.q ? 'This ion needs ' + T.e : 'A neutral atom has as many electrons as protons: ' + T.e) + ' — you have ' + AG.e + '.';
  } else m = 'Not quite — count protons, neutrons and electrons again.' + (!AG.hint && (lv === 3 || lv === 4) && AG.tries >= 2 ? ' Try 💡.' : '');
  $('am-msg').className = 'fm-msg'; $('am-msg').textContent = '🤔 ' + m;
}
function atomShowAnswer(pre){ const T = AG.list[AG.i]; AG.p = T.z; AG.n = T.n; AG.e = T.e; AG.solved = true; AG.hint = true; $('am-need').innerHTML = atomNeed(T); $('am-msg').className = 'fm-msg'; $('am-msg').textContent = pre + 'It is ' + T.z + ' protons · ' + T.n + ' neutrons · ' + T.e + ' electrons.'; atomRender(); }
function atomEnd(){
  AG.done = true; stopAtom(); const total = AG.list.length, acc = AG.first / total, stars = acc >= 0.8 ? 3 : acc >= 0.6 ? 2 : 1;
  chemSave('atom', {found: AG.atoms.slice(), built: [], atoms: AG.atoms.slice(), right: AG.first, total, score: Math.round(AG.score * SCI_MULT(AG.lv)), stars, timeSec: Math.round((Date.now() - AG.t0) / 1000)});
}
// ---------- the atom picture: nucleus (protons + neutrons) + shells with electrons ----------
function atomLoop(){ cancelAnimationFrame(AT_RAF); if(!AG || AG.done) return; drawAtomNow(); if(SCI_FX) AT_RAF = requestAnimationFrame(atomLoop); }
function drawAtomNow(){
  const cv = $('am-atom'); if(!cv || !AG) return; const r = cv.getBoundingClientRect(); if(r.width < 10 || r.height < 10) return;
  const dpr = Math.min(2, devicePixelRatio || 1); if(cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)){ cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, r.width, r.height);
  const W = r.width, H = r.height, cx = W / 2, cy = H / 2, sk = atomSkin(), t = SCI_FX ? performance.now() / 1000 : 0.6, R = Math.min(W, H) / 2 - 6;
  const shells = AG.e > 0 && EL[AG.e - 1] ? EL[AG.e - 1].shells : [], nucl = AG.p + AG.n;
  const pr = Math.max(4, Math.min(14, R * 0.075)), nr = nucl ? pr * (1.1 + Math.sqrt(nucl) * 0.62) : 0;
  const ns = shells.length, inner = Math.max(nr + pr * 1.6, R * 0.32), step = ns > 1 ? (R - pr - inner) / (ns - 1) : 0;
  // shells
  shells.forEach((k, i) => { const rr = ns > 1 ? inner + step * i : (inner + R) / 2; g.strokeStyle = 'rgba(126,219,196,0.4)'; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.stroke();
    for(let j = 0; j < k; j++){ const a = j / k * Math.PI * 2 + t * (0.5 / (i + 1)) + i; AtomSkins.draw(g, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, Math.max(3, pr * (k > 12 ? 0.55 : 0.7)), pr >= 9 ? '−' : '', AtomSkins.colour('e-'), sk, t + j); } });
  // nucleus: sunflower packing, protons + neutrons mixed
  const parts = []; for(let i = 0; i < AG.p; i++) parts.push('p'); for(let i = 0; i < AG.n; i++) parts.push('n');
  const mixd = parts.map((k, i) => [k, (i * 0.618) % 1]).sort((a, b) => a[1] - b[1]).map(x => x[0]), pop = AG.pop ? Math.min(1, (performance.now() - AG.pop) / 600) : 1, sc = AG.solved ? 1 + Math.sin(pop * Math.PI) * 0.18 : 1;
  mixd.forEach((k, i) => { const d = pr * 1.05 * Math.sqrt(i) * sc, a = i * 2.39996; AtomSkins.draw(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, pr, k === 'p' && pr >= 9 ? '+' : '', AtomSkins.colour(k === 'p' ? 'p+' : 'n'), sk, t + i); });
  if(!nucl && !AG.e){ g.fillStyle = 'rgba(255,255,255,0.35)'; g.font = '800 ' + Math.round(R * 0.16) + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('⚛️ empty', cx, cy); }
  if(AG.solved && AG.p){ const e = EL[AG.p - 1], lr = Math.max(14, R * 0.17); AtomSkins.draw(g, cx + R * 0.72, cy - R * 0.72, lr, e.sym, CPK[e.sym] || AtomSkins.colour(e.sym), sk, t); }
}

/* ================= 💡 ✨ 🐱 the other Quantum lab games (sc-2b2) ================= */
// result card words per game: [title, play again, 'right' wording, is Quantum]
const KIND_UI = {hunt: ['🔍 Element hunt done!', () => startHunt(), 'right first time', 0], formula: ['⚛️ Molecules built!', () => startFormula(), 'right first time', 0], atom: ['⚛️ Atoms built!', () => startAtom(), 'right first time', 1],
  led: ['💡 LEDs lit!', () => startLed(), 'right first time', 1], glow: ['✨ Glow star charged!', () => startGlow(), 'right first time', 1], cat: ['🐱 Boxes opened!', () => startCat(), 'close guesses', 1]};
function qBar(el, icon, name, id, getG, stop, fit){ const b = UI.gameBar($(el), {game: GAME_ID, icon, name, levelId: id, levels: () => leaveQuantum(true), playing: () => { const g = getG(); return !!(g && !g.done); }, onLeave: stop, scoreMin: '5ch', onFit: fit}); b.score(0); b.miss(0); return b; }
function qBuddy(old, id){ try{ if(old) old.stop(); return UI.buddy ? UI.buddy($(id), {name: S.player + '·lab', av: suitAv(S.player)}, {per: 2}) : null; }catch(e){ return null; } }
if(window.ResizeObserver){ const ro = new ResizeObserver(() => { if(LG && !$('scr-led').classList.contains('hidden')) ledPlace(); if(WG && !$('scr-glow').classList.contains('hidden')) drawGlow(); if(CG && !$('scr-cat').classList.contains('hidden')) layoutCats(); });
  setTimeout(() => ['led-stage', 'glow-cv', 'cat-stage'].forEach(id => { if($(id)) ro.observe($(id)); }), 0); }
function qPts(tries){ return [100, 60, 30][Math.min(2, tries)]; }
function qStars(first, total){ const a = first / total; return a >= 0.8 ? 3 : a >= 0.6 ? 2 : 1; }

// ---------- 💡 LED colours ----------
// drop size → colour (1 step = red … 6 steps = violet) · LED chips are made of gallium + arsenic + phosphorus (red–yellow) or indium + gallium + nitrogen (green–violet)
const LED_COL = [null, {k: 'red', name: 'Red', icon: '🔴', col: '#FF3B30', el: [31, 33, 15]}, {k: 'orange', name: 'Orange', icon: '🟠', col: '#FF9500', el: [31, 33, 15]}, {k: 'yellow', name: 'Yellow', icon: '🟡', col: '#FFD60A', el: [31, 33, 15]},
  {k: 'green', name: 'Green', icon: '🟢', col: '#34C759', el: [49, 31, 7]}, {k: 'blue', name: 'Blue', icon: '🔵', col: '#0A84FF', el: [49, 31, 7]}, {k: 'violet', name: 'Violet', icon: '🟣', col: '#AF52DE', el: [49, 31, 7]}];
const LED_MIX = [{k: 'magenta', name: 'Magenta (pink-purple)', icon: '🩷', col: '#FF2D95', set: [1, 5]}, {k: 'cyan', name: 'Cyan (sky blue)', icon: '🩵', col: '#32D2F5', set: [4, 5]}, {k: 'white', name: 'White', icon: '⚪', col: '#FFFFFF', set: [1, 4, 5]}];
const LED_THINGS = [['🚦 the STOP light', 1], ['🎃 a pumpkin night-light', 2], ['⚠️ a yellow warning light', 3], ['🚦 the GO light', 4], ['🔋 a blue charging light', 5], ['🔮 a purple party light', 6]];
let LG = null, LBUD = null;
const LBAR = qBar('lbar', '💡', 'LED colours', 'led-level', () => LG, () => { if(LG) LG.done = true; }, () => ledPlace());
LBAR.count('led', '💡', '1/5', 'LED');
function startLed(){
  const lv = SET.level, ds = shuffle([1, 2, 3, 4, 5, 6]), list = [];
  for(let i = 0; i < 5; i++){
    if(lv >= 4 && (i === 2 || i === 4)){ list.push(Object.assign({mix: true}, LED_MIX[(i === 2 ? 0 : 1 + (Math.random() < 0.5 ? 0 : 1))])); continue; }
    const d = ds[i % 6], th = lv >= 3 ? LED_THINGS.find(t => t[1] === d) : null; list.push({d, thing: th ? th[0] : '', k: LED_COL[d].k});
  }
  LG = {lv, list, i: 0, start: 6, at: 6, drops: [], tries: 0, first: 0, score: 0, miss: 0, found: [], t0: Date.now(), done: false, solved: false};
  hideResult(); labHand(null); showScreen('led'); LBAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); LBAR.score(0); LBAR.miss(0); LBAR.fit();
  LBUD = qBuddy(LBUD, 'led-buddy'); ledNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'quantum'); gcEmit('start', {game: 'led'});
}
function stopLed(){ if(LG){ LG.done = true; clearTimeout(LG.tm); clearTimeout(LG.gt); } if(LBUD){ LBUD.stop(); LBUD = null; } }
function ledTargetCol(T){ return T.mix ? T : LED_COL[T.d]; }
function ledNext(){
  if(!LG || LG.done) return; clearTimeout(LG.tm); clearTimeout(LG.gt); if(LG.i >= LG.list.length) return ledEnd();
  const T = LG.list[LG.i], lv = LG.lv, C = ledTargetCol(T), need = T.mix ? Math.max(...T.set) : T.d;
  LG.start = lv === 0 ? 6 : need + Math.floor(Math.random() * (7 - need)); LG.at = LG.start; LG.drops = []; LG.tries = 0; LG.solved = false; LG.glowStep = -1;
  LBAR.count('led', '💡', (LG.i + 1) + '/' + LG.list.length, 'LED');
  $('led-name').innerHTML = T.mix ? 'Mix ' + C.icon + ' ' + UI.esc(C.name) + ' light' : T.thing ? UI.esc(T.thing) : C.icon + ' ' + C.name;
  $('led-need').textContent = T.mix ? 'Use ' + T.set.length + ' electron drops — the light mixes' : lv <= 1 ? 'Drop the electron ' + T.d + ' step' + (T.d > 1 ? 's' : '') + ' down' : 'Pick how far it falls';
  $('led-hint').textContent = lv === 0 ? '👆 Tap the glowing step' : T.mix ? '🔴 + 🔵 = magenta · 🟢 + 🔵 = cyan · all three = white' : 'A bigger drop gives bluer light';
  $('led-msg').className = 'fm-msg'; $('led-msg').textContent = '';
  $('led-legend').innerHTML = lv <= 1 ? LED_COL.slice(1).map((c, i) => '<span style="background:' + c.col + '">' + (i + 1) + ' step' + (i ? 's' : '') + ' = ' + c.name + '</span>').join('') : '<span class="rb">small drop 🔴 🟠 🟡 🟢 🔵 🟣 big drop</span>' + (lv >= 4 ? '<span style="background:#fff">mix: 🔴+🟢+🔵 = ⚪</span>' : '');
  ledBulb(null); ledRender();
  if(lv === 0) LG.gt = setTimeout(() => { if(LG && !LG.solved){ LG.glowStep = LG.start - T.d; ledRender(); } }, 6000 * SCI_FX);
  if(lv === 5) LG.tm = setTimeout(() => { if(LG && !LG.done && !LG.solved){ LG.miss++; LBAR.miss(LG.miss); UISound.play('error'); ledAnswer('⏱️ Time! '); } }, 20000);
}
function ledRender(){
  const L = $('led-ladder'); let h = '';
  for(let st = 6; st >= 0; st--) h += '<button data-st="' + st + '" data-sound="none" class="' + (st === LG.at ? 'here' : st < LG.at ? 'below' : '') + (st === LG.glowStep ? ' kglow' : '') + '">' + (st === 0 ? 'ground' : 'step ' + st) + '</button>';
  L.innerHTML = h + '<img class="elec" id="led-elec" src="' + AtomSkins.url('−', AtomSkins.colour('e-'), atomSkin(), 48) + '" alt="electron">';
  L.querySelectorAll('button').forEach(b => b.onclick = () => ledTap(Number(b.dataset.st)));
  ledPlace();
  const act = $('led-act'); act.innerHTML = LG.solved ? '<button class="sp-btn sp-primary sp-lg" id="led-next" data-sound="pop">' + (LG.i + 1 < LG.list.length ? 'Next LED ▶' : '📋 Finish') + '</button>' : '';
  if($('led-next')) $('led-next').onclick = () => { if(!LG || !LG.solved) return; LG.i++; ledNext(); };
}
function ledPlace(){ const L = $('led-ladder'), e = $('led-elec'); if(!L || !e || !LG) return; const b = L.querySelector('[data-st="' + LG.at + '"]'); if(!b) return; e.style.top = (b.offsetTop + b.offsetHeight / 2 - e.offsetHeight / 2) + 'px'; }
function ledBulb(col){ const b = $('led-bulb'); b.style.background = col ? 'radial-gradient(circle at 40% 35%, #fff, ' + col + ' 55%)' : '#2A3A52'; b.style.boxShadow = col ? '0 0 30px 12px ' + col + ', 0 0 80px 30px ' + col + '88' : 'none'; }
function ledMix(drops){ const rgb = [0, 0, 0]; drops.forEach(d => { const c = LED_COL[d].col.replace('#', ''); for(let i = 0; i < 3; i++) rgb[i] = Math.min(255, rgb[i] + parseInt(c.substr(i * 2, 2), 16)); }); return 'rgb(' + rgb.join(',') + ')'; }
function ledTap(st){
  if(!LG || LG.solved || LG.done) return; const T = LG.list[LG.i];
  if(st >= LG.at){ UISound.play('error'); $('led-msg').className = 'fm-msg'; $('led-msg').textContent = '⬇️ An electron gives light when it falls DOWN — tap a lower step.'; return; }
  const d = LG.at - st; LG.at = st; ledPlace(); UISound.play('pop'); ledPhoton(LED_COL[d].col);
  if(!T.mix){ ledBulb(LED_COL[d].col); $('led-bulbtxt').textContent = LED_COL[d].icon + ' ' + LED_COL[d].name; return ledJudge([d]); }
  LG.drops.push(d); ledBulb(ledMix(LG.drops)); $('led-bulbtxt').textContent = LG.drops.map(x => LED_COL[x].icon).join(' + ');
  if(LG.drops.length < T.set.length){ $('led-msg').className = 'fm-msg'; $('led-msg').textContent = '⚡ ' + LG.drops.length + ' of ' + T.set.length + ' drops — the electron jumps back up for the next one'; setTimeout(() => { if(LG && !LG.solved){ LG.at = LG.start; ledPlace(); ledRender(); } }, 500 * SCI_FX); return; }
  ledJudge(LG.drops.slice());
}
function ledPhoton(col){ const st = $('led-stage'), e = $('led-elec'), b = $('led-bulb'); if(!st || !e || !b || !SCI_FX) return; const r0 = st.getBoundingClientRect(), r1 = e.getBoundingClientRect(), r2 = b.getBoundingClientRect();
  const p = document.createElement('div'); p.className = 'photon'; p.textContent = '〰️'; p.style.color = col; p.style.left = (r1.left - r0.left) + 'px'; p.style.top = (r1.top - r0.top) + 'px'; p.style.setProperty('--dx', (r2.left - r1.left) + 'px'); p.style.setProperty('--dy', (r2.top - r1.top) + 'px'); st.appendChild(p); setTimeout(() => p.remove(), 700); }
function ledJudge(drops){
  const T = LG.list[LG.i], lv = LG.lv, want = T.mix ? T.set.slice().sort() : [T.d], got = drops.slice().sort(), ok = want.join() === got.join();
  if(ok){
    const pts = qPts(LG.tries); LG.score += pts; if(LG.tries === 0) LG.first++; LG.solved = true; clearTimeout(LG.tm); clearTimeout(LG.gt);
    (T.mix ? T.set : [T.d]).forEach(d => LED_COL[d].el.forEach(n => { if(LG.found.indexOf(n) < 0) LG.found.push(n); }));
    UISound.play('success'); if(LBUD) LBUD.react('joy'); LBAR.score(Math.round(LG.score * SCI_MULT(lv))); if(T.mix) ledBulb(T.col);
    $('led-msg').className = 'fm-msg ok'; $('led-msg').textContent = '✅ ' + (T.mix ? ledTargetCol(T).name + ' light!' : LED_COL[T.d].name + '! A ' + T.d + '-step drop') + ' · +' + pts; ledRender(); gcEmit('right', {led: T.k}); return;
  }
  LG.tries++; LG.miss++; LBAR.miss(LG.miss); UISound.play('error'); if(LBUD) LBUD.react('miss'); gcEmit('wrong', {led: T.k});
  if(lv === 5) return ledAnswer('❌ ');
  let m;
  if(T.mix) m = got.map(d => LED_COL[d].icon).join(' + ') + ' makes a different colour. ' + ledTargetCol(T).name + ' = ' + T.set.map(d => LED_COL[d].icon).join(' + ') + (lv >= 5 ? '' : '');
  else { const d = got[0]; m = 'That ' + d + '-step drop made ' + LED_COL[d].icon + ' ' + LED_COL[d].name + '. ' + (lv <= 2 ? (T.d > d ? 'Bluer light needs a BIGGER drop.' : 'Redder light needs a SMALLER drop.') : 'Bigger drop = bluer light.'); }
  if(lv === 0 || (lv <= 2 && LG.tries >= 2)) LG.glowStep = LG.start - (T.mix ? T.set[0] : T.d);
  $('led-msg').className = 'fm-msg'; $('led-msg').textContent = '🤔 ' + m;
  setTimeout(() => { if(LG && !LG.solved){ LG.at = LG.start; LG.drops = []; ledBulb(null); $('led-bulbtxt').textContent = 'LED'; ledRender(); } }, 700 * SCI_FX);
}
function ledAnswer(pre){ const T = LG.list[LG.i]; LG.solved = true; ledBulb(ledTargetCol(T).col); $('led-msg').className = 'fm-msg'; $('led-msg').textContent = pre + (T.mix ? ledTargetCol(T).name + ' = ' + T.set.map(d => LED_COL[d].icon).join(' + ') : 'It was a ' + T.d + '-step drop → ' + LED_COL[T.d].name); ledRender(); }
function ledEnd(){ LG.done = true; const res = {found: LG.found.slice(), built: [], right: LG.first, total: LG.list.length, score: Math.round(LG.score * SCI_MULT(LG.lv)), stars: qStars(LG.first, LG.list.length), timeSec: Math.round((Date.now() - LG.t0) / 1000)}; stopLed(); chemSave('led', res); }

// ---------- ✨ Glow charge-up ----------
// glow paint (strontium aluminate + a pinch of europium) stores light: light lifts its electrons up, in the dark they fall back slowly and glow. Red light is too weak to lift them.
const LIGHTS = {red: {name: 'Red', icon: '🔴', rate: 0, col: '#FF3B30'}, green: {name: 'Green', icon: '🟢', rate: 0.12, col: '#34C759'}, blue: {name: 'Blue', icon: '🔵', rate: 0.3, col: '#0A84FF'}, uv: {name: 'UV black light', icon: '🟣', rate: 0.55, col: '#9B5CFF'}};
const GLOW_SEC = 12, GLOW_T = [[3, 4, 5], [4, 5, 6], [5, 7, 8], [6, 8, 9], [8, 9, 10], [8, 9, 10]], GLOW_LIMIT = [0, 0, 0, 2.5, 2, 1.6];
let WG = null, WBUD = null, W_RAF = 0;
const WBAR = qBar('wbar', '✨', 'Glow charge-up', 'glow-level', () => WG, () => { if(WG) WG.done = true; }, () => drawGlow());
WBAR.count('glow', '✨', '1/3', 'Star');
function startGlow(){
  const lv = SET.level; WG = {lv, list: GLOW_T[lv].slice(), i: 0, light: lv === 0 ? 'blue' : '', charge: 0, shone: 0, tries: 0, first: 0, score: 0, miss: 0, t0: Date.now(), done: false, solved: false, phase: 'charge'};
  hideResult(); labHand(null); showScreen('glow'); WBAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); WBAR.score(0); WBAR.miss(0); WBAR.fit();
  WBUD = qBuddy(WBUD, 'glow-buddy'); glowNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'quantum'); gcEmit('start', {game: 'glow'}); glowLoop();
}
function stopGlow(){ if(WG){ WG.done = true; WG.shining = false; } if(WBUD){ WBUD.stop(); WBUD = null; } cancelAnimationFrame(W_RAF); }
function glowNext(){
  if(!WG || WG.done) return; if(WG.i >= WG.list.length) return glowEnd();
  const tg = WG.list[WG.i], lim = GLOW_LIMIT[WG.lv]; WG.charge = 0; WG.shone = 0; WG.tries = 0; WG.solved = false; WG.phase = 'charge'; WG.glowLeft = 0; if(WG.lv > 0) WG.light = '';
  WBAR.count('glow', '✨', (WG.i + 1) + '/' + WG.list.length, 'Star');
  $('glow-name').textContent = 'Glow for ' + tg + ' seconds'; $('glow-need').textContent = lim ? '⏱️ You may shine for ' + lim + ' s only' : 'Shine, then switch the lights off';
  $('glow-hint').textContent = WG.lv === 0 ? '👆 Hold ☀️ Shine, then tap 🌙 Lights off' : 'Light lifts the glow paint’s electrons — in the dark they drop back and glow';
  $('glow-msg').className = 'fm-msg'; $('glow-msg').textContent = ''; glowRender();
}
function glowRender(){
  const lv = WG.lv;
  $('glow-lights').innerHTML = Object.keys(LIGHTS).map(k => '<button data-k="' + k + '" data-sound="tap" class="' + (WG.light === k ? 'on' : '') + '">' + LIGHTS[k].icon + ' ' + LIGHTS[k].name + '</button>').join('');
  $('glow-lights').querySelectorAll('button').forEach(b => b.onclick = () => { if(!WG || WG.phase !== 'charge') return; WG.light = b.dataset.k; glowRender(); });
  const act = $('glow-act');
  if(WG.solved) act.innerHTML = '<button class="sp-btn sp-primary sp-lg" id="glow-next" data-sound="pop">' + (WG.i + 1 < WG.list.length ? 'Next star ▶' : '📋 Finish') + '</button>';
  else if(WG.phase === 'charge') act.innerHTML = '<button class="sp-btn sp-secondary sp-lg holdbtn' + (lv === 0 && !WG.shone ? ' glow-next' : '') + '" id="glow-shine" data-sound="none"' + (WG.light ? '' : ' disabled') + '>☀️ Hold to shine</button><button class="sp-btn sp-primary sp-lg' + (lv === 0 && WG.charge > 0.45 ? ' glow-next' : '') + '" id="glow-off" data-sound="tap"' + (WG.shone ? '' : ' disabled') + '>🌙 Lights off</button>';
  else act.innerHTML = '';
  if($('glow-next')) $('glow-next').onclick = () => { if(!WG || !WG.solved) return; WG.i++; glowNext(); };
  const sh = $('glow-shine'); if(sh){ const on = ev => { ev.preventDefault(); if(!WG.light) return; WG.shining = true; sh.classList.add('down'); }, off = () => { if(WG) WG.shining = false; sh.classList.remove('down'); };
    sh.addEventListener('pointerdown', on); ['pointerup', 'pointerleave', 'pointercancel'].forEach(e => sh.addEventListener(e, off)); }
  if($('glow-off')) $('glow-off').onclick = glowOff;
  drawGlow();
}
function glowCharge(sec){   // light shines for sec seconds (also used by tests)
  if(!WG || WG.phase !== 'charge' || !WG.light) return; const lim = GLOW_LIMIT[WG.lv], L = LIGHTS[WG.light];
  let t = sec; if(lim) t = Math.max(0, Math.min(t, lim - WG.shone)); WG.shone += sec; WG.charge = Math.min(1, WG.charge + L.rate * t);
  if(L.rate === 0 && WG.shone > 0.6 && !WG.redSaid){ WG.redSaid = true; $('glow-msg').className = 'fm-msg'; $('glow-msg').textContent = '🔴 Red light can’t charge glow paint — its light bits are too weak! Try another colour.'; }
  if(lim && WG.shone >= lim && !WG.limSaid){ WG.limSaid = true; $('glow-msg').className = 'fm-msg'; $('glow-msg').textContent = '⏱️ Shine time is up — switch the lights off!'; }
  if(!$('glow-off') || $('glow-off').disabled !== !WG.shone) glowRender();
}
function glowOff(){
  if(!WG || WG.phase !== 'charge' || !WG.shone) return; const tg = WG.list[WG.i], secs = WG.charge * GLOW_SEC; WG.phase = 'dark'; WG.glowLeft = secs; WG.darkT = performance.now(); glowRender(); UISound.play('pop');
  setTimeout(() => glowJudge(secs, tg), Math.min(secs, tg + 0.5) * 1000 * SCI_FX);
}
function glowJudge(secs, tg){
  if(!WG || WG.done) return; const lv = WG.lv;
  if(secs >= tg){ const pts = qPts(WG.tries); WG.score += pts; if(WG.tries === 0) WG.first++; WG.solved = true; UISound.play('success'); if(WBUD) WBUD.react('joy'); WBAR.score(Math.round(WG.score * SCI_MULT(lv)));
    $('glow-msg').className = 'fm-msg ok'; $('glow-msg').textContent = '✅ It glowed ' + secs.toFixed(1) + ' s with ' + LIGHTS[WG.light].icon + ' ' + LIGHTS[WG.light].name + ' light · +' + pts; WG.phase = 'done'; glowRender(); gcEmit('right', {light: WG.light}); return; }
  WG.tries++; WG.miss++; WBAR.miss(WG.miss); UISound.play('error'); if(WBUD) WBUD.react('miss'); gcEmit('wrong', {light: WG.light});
  const L = LIGHTS[WG.light], m = L.rate === 0 ? 'Red light can’t lift the electrons — no glow at all.' : 'It only glowed ' + secs.toFixed(1) + ' s — ' + (GLOW_LIMIT[lv] ? 'use a STRONGER light (bluer = more energy).' : 'shine longer or use a stronger light.');
  if(lv === 5){ WG.solved = true; WG.phase = 'done'; $('glow-msg').className = 'fm-msg'; $('glow-msg').textContent = '❌ ' + m + ' 🟣 UV charges fastest.'; glowRender(); return; }
  $('glow-msg').className = 'fm-msg'; $('glow-msg').textContent = '🤔 ' + m; WG.phase = 'charge'; WG.charge = 0; WG.shone = 0; WG.redSaid = false; WG.limSaid = false; glowRender();
}
function glowLoop(){ cancelAnimationFrame(W_RAF); if(!WG || WG.done) return; const now = performance.now(), dt = WG.lastT ? Math.min(0.1, (now - WG.lastT) / 1000) : 0; WG.lastT = now;
  if(WG.shining) glowCharge(dt); if(WG.phase === 'dark') WG.glowLeft = Math.max(0, WG.charge * GLOW_SEC - (now - WG.darkT) / 1000);
  drawGlow(); if(SCI_FX) W_RAF = requestAnimationFrame(glowLoop); }
function drawGlow(){
  const cv = $('glow-cv'); if(!cv || !WG) return; const r = cv.getBoundingClientRect(); if(r.width < 10 || r.height < 10) return;
  const dpr = Math.min(2, devicePixelRatio || 1); if(cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)){ cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
  const g = cv.getContext('2d'), W = r.width, H = r.height, cx = W / 2, cy = H / 2 + 6, R = Math.min(W, H) * 0.32; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  const dark = WG.phase === 'dark' || WG.phase === 'done', lvl = dark ? (WG.phase === 'done' ? WG.charge : WG.glowLeft / GLOW_SEC) : WG.charge, L = WG.light ? LIGHTS[WG.light] : null;
  if(WG.shining && L){ const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, L.col + 'AA'); gr.addColorStop(1, L.col + '00'); g.fillStyle = gr; g.beginPath(); g.moveTo(W * 0.35, 0); g.lineTo(W * 0.65, 0); g.lineTo(W * 0.85, H); g.lineTo(W * 0.15, H); g.closePath(); g.fill(); }
  const star = (rr) => { g.beginPath(); for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? rr * 0.45 : rr; i ? g.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q) : g.moveTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } g.closePath(); };
  if(dark && lvl > 0){ g.save(); g.shadowColor = '#7CFFB2'; g.shadowBlur = 40 * lvl; star(R); g.fillStyle = 'rgba(124,255,178,' + (0.25 + 0.75 * lvl) + ')'; g.fill(); g.restore(); }
  else { star(R); g.fillStyle = dark ? '#2A3A52' : '#E9F5DA'; g.fill(); }
  g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,0.5)'; star(R); g.stroke();
  const n = Math.round(lvl * 12); for(let i = 0; i < 12; i++){ const a = i / 12 * Math.PI * 2, up = i < n; AtomSkins.draw(g, cx + Math.cos(a) * R * (up ? 1.25 : 0.55), cy + Math.sin(a) * R * (up ? 1.25 : 0.55), Math.max(4, R * 0.07), '', AtomSkins.colour('e-'), atomSkin(), i); }
  g.fillStyle = '#fff'; g.font = '800 ' + Math.round(Math.max(13, R * 0.18)) + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
  g.fillText(dark ? (WG.phase === 'dark' ? '🌙 glowing… ' + WG.glowLeft.toFixed(1) + ' s' : '🌙 ' + (WG.charge * GLOW_SEC).toFixed(1) + ' s of glow') : '⚡ charge ' + Math.round(WG.charge * 100) + ' %', cx, 6);
}
function glowEnd(){ WG.done = true; const res = {found: [38, 13, 8, 63], built: [], right: WG.first, total: WG.list.length, score: Math.round(WG.score * SCI_MULT(WG.lv)), stars: qStars(WG.first, WG.list.length), timeSec: Math.round((Date.now() - WG.t0) / 1000)}; stopGlow(); chemSave('glow', res); }

// ---------- 🐱 Cat in the box ----------
// kid-safe version of a famous thought experiment: each cat naps or is awake by chance; you can't know ONE box until you look, but many boxes average out
const CAT_SET = [[[10, 1, 2]], [[10, 1, 2]], [[12, 1, 4], [12, 3, 4]], [[20, 1, 4], [20, 1, 2], [20, 3, 4], [20, 1, 5]], [[30, 1, 3], [30, 2, 3], [30, 1, 10], [30, 3, 10]], [[40, 1, 4], [40, 3, 8], [40, 7, 10]]];
let CG = null, CBUD = null;
const CBAR = qBar('cbar', '🐱', 'Cat in the box', 'cat-level', () => CG, () => { if(CG) CG.done = true; }, () => layoutCats());
CBAR.count('cat', '🐱', '1/3', 'Round');
function startCat(){
  const lv = SET.level, list = []; for(let i = 0; i < 3; i++){ const c = CAT_SET[lv][i % CAT_SET[lv].length]; list.push({n: c[0], a: c[1], b: c[2]}); }
  CG = {lv, list: shuffle(list), i: 0, guess: 0, tries: 0, first: 0, score: 0, miss: 0, t0: Date.now(), done: false, solved: false};
  hideResult(); labHand(null); showScreen('cat'); CBAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); CBAR.score(0); CBAR.miss(0); CBAR.fit();
  CBUD = qBuddy(CBUD, 'cat-buddy'); catNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'quantum'); gcEmit('start', {game: 'cat'});
}
function stopCat(){ if(CG){ CG.done = true; clearTimeout(CG.tm); } if(CBUD){ CBUD.stop(); CBUD = null; } }
function catTol(T){ return Math.max(1, Math.round(T.n * 0.1)); }
function catNext(){
  if(!CG || CG.done) return; if(CG.i >= CG.list.length) return catEnd();
  const T = CG.list[CG.i], lv = CG.lv; CG.guess = Math.round(T.n / 2); CG.solved = false; CG.opened = 0; CG.cats = null;
  CBAR.count('cat', '🐱', (CG.i + 1) + '/' + CG.list.length, 'Round');
  $('cat-name').textContent = T.n + ' boxes, one napping cat in each'; $('cat-need').textContent = 'Each cat is awake: ' + T.a + ' in ' + T.b;
  $('cat-hint').textContent = lv === 0 ? '👆 ' + T.a + ' in ' + T.b + ' of ' + T.n + ' cats = about ' + Math.round(T.n * T.a / T.b) + ' — set your guess, then open' : 'Use the chance to guess — you can\u2019t see inside a box until you open it';
  $('cat-msg').className = 'fm-msg'; $('cat-msg').textContent = ''; $('cat-grid').innerHTML = ''; layoutCats(); catRender();
}
function catRender(){
  const T = CG.list[CG.i];
  $('cat-guess').innerHTML = '<div class="guess"><span>Awake cats:</span><button class="tminus" data-d="-1" data-sound="tap" aria-label="One fewer">−</button><b id="cat-g">' + CG.guess + '</b><button class="tplus" data-d="1" data-sound="tap" aria-label="One more">+</button></div>';
  $('cat-guess').querySelectorAll('button').forEach(b => b.onclick = () => { if(CG.solved) return; CG.guess = Math.max(0, Math.min(T.n, CG.guess + Number(b.dataset.d))); $('cat-g').textContent = CG.guess; });
  const act = $('cat-act');
  act.innerHTML = CG.solved ? '<button class="sp-btn sp-primary sp-lg" id="cat-next" data-sound="pop">' + (CG.i + 1 < CG.list.length ? 'Next boxes ▶' : '📋 Finish') + '</button>' : '<button class="sp-btn sp-primary sp-lg' + (CG.lv === 0 ? ' glow-next' : '') + '" id="cat-open" data-sound="pop">📦 Open the boxes!</button>';
  if($('cat-next')) $('cat-next').onclick = () => { if(!CG || !CG.solved) return; CG.i++; catNext(); };
  if($('cat-open')) $('cat-open').onclick = catOpen;
}
function layoutCats(){
  if(!CG) return; const T = CG.list[CG.i], grid = $('cat-grid'), st = $('cat-stage'); if(!grid || !st || !T) return; const r = st.getBoundingClientRect(); if(r.width < 10) return;
  let best = 1, cols = 1; for(let c = 1; c <= T.n; c++){ const rows = Math.ceil(T.n / c), sz = Math.min(r.width / c, r.height / rows) * 0.9; if(sz > best){ best = sz; cols = c; } }
  const sz = Math.floor(Math.min(90, best)); grid.style.gridTemplateColumns = 'repeat(' + cols + ', ' + sz + 'px)'; grid.style.gridAutoRows = sz + 'px';
  if(grid.children.length !== T.n) grid.innerHTML = Array.from({length: T.n}, (_, i) => '<div data-i="' + i + '"><span>📦</span></div>').join('');
  grid.querySelectorAll('div').forEach(d => { d.style.fontSize = Math.round(sz * 0.62) + 'px'; });
  grid.style.maxHeight = r.height + 'px';
}
function catOpen(){
  if(!CG || CG.solved || CG.done) return; const T = CG.list[CG.i];
  CG.cats = Array.from({length: T.n}, () => Math.random() < T.a / T.b); const awake = CG.cats.filter(Boolean).length, tol = catTol(T), off = Math.abs(CG.guess - awake);
  CG.solved = true; catRender(); const boxes = [...$('cat-grid').children];
  boxes.forEach((d, i) => setTimeout(() => { if(!CG || CG.done) return; d.classList.add('open'); if(CG.cats[i]) d.classList.add('aw'); d.firstChild.textContent = CG.cats[i] ? '😺' : '😴'; if(i % 3 === 0) UISound.play('tap'); }, i * Math.min(60, 1200 / T.n) * SCI_FX));
  // a good guess = close to what the chances say (the science answer); landing near the real count is a bonus — the boxes are a surprise
  const exp = T.n * T.a / T.b, offE = Math.abs(CG.guess - exp), ok = offE <= tol + 0.01, pts = (ok ? Math.round(100 - 40 * offE / (tol + 0.5)) : 10) + (off <= tol ? 20 : 0);
  CG.score += pts; if(ok) CG.first++; else { CG.miss++; CBAR.miss(CG.miss); }
  setTimeout(() => { if(!CG || CG.done) return; UISound.play(ok ? 'success' : 'error'); if(CBUD) CBUD.react(ok ? 'joy' : 'miss'); CBAR.score(Math.round(CG.score * SCI_MULT(CG.lv)));
    const ex = Math.round(exp * 10) / 10;
    $('cat-msg').className = 'fm-msg' + (ok ? ' ok' : ''); $('cat-msg').textContent = (ok ? '✅ Smart guess! ' : '🤔 ') + '😺 ' + awake + ' awake · 😴 ' + (T.n - awake) + ' napping. The chances said about ' + ex + (off <= tol ? ' — and you were close to the real count too' : ' — the boxes surprised us') + '. +' + pts;
    gcEmit(ok ? 'right' : 'wrong', {awake, guess: CG.guess}); }, (T.n * Math.min(60, 1200 / T.n) + 200) * SCI_FX);
}
function catEnd(){ CG.done = true; const res = {found: [], built: [], right: CG.first, total: CG.list.length, score: Math.round(CG.score * SCI_MULT(CG.lv)), stars: qStars(CG.first, CG.list.length), timeSec: Math.round((Date.now() - CG.t0) / 1000)}; stopCat(); chemSave('cat', res); }

/* ================= 🧫 KITCHEN LAB (sc-2c) — 5 kid-safe experiments on one bench =================
   Each round: a question (or a job), the bench shows the glasses, you pick / do it, the bench plays what really happens, the message says why.
   Rounds marked once = predict → watch (one answer, the bench then shows the truth). Others: try again with a hint. */
Object.assign(KIND_UI, {ph: ['🌈 Colours tested!', () => startExp('ph'), 'right first time', 2], crystal: ['💎 Crystals grown!', () => startExp('crystal'), 'right first time', 2],
  dissolve: ['🧂 Races watched!', () => startExp('dissolve'), 'right predictions', 2], mix: ['🫧 Mixes sorted!', () => startExp('mix'), 'right first time', 2], rust: ['🌧️ Rust lab done!', () => startExp('rust'), 'right first time', 2]});
const XEXP = [['ph', '🌈', 'pH colours', 'Red-cabbage juice changes colour — sour, plain or soapy?'], ['crystal', '💎', 'Crystal garden', 'Fill the water with salt or sugar, hang a string, wait a week'],
  ['dissolve', '🧂', 'Dissolving race', 'Which glass dissolves first? Size, warmth + stirring'], ['mix', '🫧', 'Mix or react?', 'Just mixed, or new stuff made? Look for the signs'], ['rust', '🌧️', 'Rust lab', 'What rusts, what turns green, what stays shiny']];
const WATER = '#9ED8F0', CABBAGE = '#7A4BAA';
const LIQ = {lemon: {i: '🍋', n: 'Lemon juice', t: 'acid', ph: 2, col: '#E5306A', b: 'citric'}, vinegar: {i: '🍶', n: 'Vinegar', t: 'acid', ph: 3, col: '#EC4C86', b: 'vinegar'}, apple: {i: '🍎', n: 'Apple juice', t: 'acid', ph: 4, col: '#C2468F', b: 'citric'},
  water: {i: '💧', n: 'Water', t: 'neutral', ph: 7, col: CABBAGE, b: 'water'}, soda: {i: '🧁', n: 'Baking soda water', t: 'base', ph: 9, col: '#3A7FC8', b: 'soda'}, soap: {i: '🧼', n: 'Soap water', t: 'base', ph: 10, col: '#2FA68A', b: ''}};
const PHT = {acid: ['🩷', 'PINK', 'an ACID (sour, like lemon)'], neutral: ['🟣', 'PURPLE', 'NEUTRAL (plain, like water)'], base: ['🟢', 'BLUE-GREEN', 'a BASE (slippery, like soap)']};
const CRY = {salt: {i: '🧂', n: 'Salt', shape: 'cube', b: 'salt', el: [11, 17], cap: [3, 4]}, sugar: {i: '🍬', n: 'Sugar', shape: 'chunk', b: 'sucrose', el: [6, 1, 8], cap: [4, 7]}, epsom: {i: '🫙', n: 'Epsom salt', shape: 'needle', b: 'epsom', el: [12, 16, 8], cap: [3, 6]}};
const SHAPES = {cube: ['🧊', 'little cubes'], needle: ['🪡', 'long needles'], chunk: ['💎', 'big chunky crystals']};
const PAIRS = {fizz: ['🧁', 'Baking soda', '🍶', 'Vinegar', 1, '🫧 bubbles of a NEW gas (carbon dioxide)', 'fizz', ['soda', 'vinegar', 'co2'], [11, 6, 8, 1], '#F3EBD0'],
  sand: ['🏖️', 'Sand', '💧', 'Water', 0, 'the sand just sinks — pour the water off and it is still sand', 'sand', ['sand', 'water'], [14, 8], WATER],
  salt: ['🧂', 'Salt', '💧', 'Water', 0, 'the salt hides in the water — let it dry and the salt comes back', 'dissolve', ['salt', 'water'], [11, 17], WATER],
  oil: ['🫒', 'Cooking oil', '💧', 'Water', 0, 'two layers — the oil floats on top, nothing new is made', 'layer', ['water'], [6, 1], WATER],
  curd: ['🍋', 'Lemon juice', '🥛', 'Milk', 1, '🧀 soft lumps (curds) — new stuff', 'lumps', ['citric'], [20, 8], '#F8F5EE'],
  cabbage: ['🍋', 'Lemon juice', '🟣', 'Cabbage juice', 1, '🎨 a brand-new colour', 'colour', ['citric'], [6, 1, 8], CABBAGE],
  sugar: ['🍬', 'Sugar', '💧', 'Water', 0, 'the sugar dissolves — it is still sugar + water', 'dissolve', ['sucrose', 'water'], [6, 1, 8], WATER],
  yeast: ['🍞', 'Yeast + sugar', '♨️', 'Warm water', 1, '🫧 slow foam — the yeast makes a gas (it can blow up a balloon!)', 'foam', ['co2', 'glucose'], [6, 8], '#D9C7A0'],
  chalk: ['🖍️', 'Chalk', '🍶', 'Vinegar', 1, '🫧 fizz — the chalk is slowly eaten away', 'chalkfizz', ['chalk', 'co2'], [20, 6, 8], '#F3EBD0'],
  paint: ['🔵', 'Blue paint', '🔴', 'Red paint', 0, 'it looks new, but it’s a MIXTURE — the red and blue bits are both still there', 'paint', [], [], '#E0393E']};
const XSIGNS = '<span style="background:#fff">Signs of NEW stuff: 🫧 bubbles · 🎨 new colour · 🧀 lumps · 🌡️ gets warm</span>';
const XITEM = {nail: ['🔩', 'Iron nail'], coin: ['🪙', 'Copper coin'], ring: ['💍', 'Gold ring'], spoon: ['🥄', 'Plastic spoon'], pnail: ['🎨', 'Painted nail']};
let XG = null, XBUD = null, X_RAF = 0;
const XBAR = qBar('xbar', '🧫', 'Kitchen lab', 'exp-level', () => XG, () => { if(XG) XG.done = true; }, () => drawBench());
XBAR.count('exp', '🧪', '1/5', 'Test');

function openXhub(){
  stopExp(); const lv = SET.level, U = LEVEL_UI[lv];
  $('xhub-sub').textContent = U.emoji + ' ' + U.name + ' · ' + ['the answer glows to help you', 'hints if you miss', 'guess first, then watch', 'no colour charts', 'tricky ones', 'against the clock — one try'][lv];
  $('xhub-count').innerHTML = '<span>📇 ' + CHEM.all.length + ' / 118 element cards</span><span>⚛️ ' + CHEM.c.length + ' / ' + COMPS.length + ' molecules</span>';
  $('xhub-hub').innerHTML = XEXP.map((h, i) => '<button class="pick" data-g="' + h[0] + '" data-sound="pop" style="animation:sc-pop .4s ' + (i * 0.08) + 's both"><div class="big">' + h[1] + '</div><div class="nm">' + h[2] + '</div><div class="sub">' + h[3] + '</div></button>').join('');
  $('xhub-hub').querySelectorAll('[data-g]').forEach(b => b.onclick = () => startExp(b.dataset.g));
  showScreen('xhub');
  if(lv === 0) setTimeout(() => { if(!$('scr-xhub').classList.contains('hidden')){ const b = $('xhub-hub').querySelector('[data-g="ph"]'); b.classList.add('glow-next'); labHand(b); } }, 400 * SCI_FX);
}
function leaveXlab(){ stopExp(); hideResult(); labHand(null); openXhub(); }

// ---------- the rounds of each experiment, per level ----------
function cup(o){ return Object.assign({label: '', sub: '', col: WATER, lvl: 0.62, solid: null, item: null, shape: 'cube', string: false, warm: false, stir: false}, o); }
function xRounds(exp, lv){
  const R = [], once = lv >= 2;
  if(exp === 'ph'){
    const chart = lv <= 1, kinds = lv === 0 ? ['make', 'make', 'make', 'make', 'make'] : lv === 1 ? ['make', 'make', 'predict', 'make', 'predict'] : lv === 2 ? ['predict', 'make', 'predict', 'make', 'predict'] : lv === 3 ? ['sort', 'predict', 'sort', 'sort', 'predict'] : lv === 4 ? ['sort', 'neutral', 'predict', 'sort', 'neutral'] : ['predict', 'sort', 'neutral', 'make', 'sort'];
    const types = shuffle(['acid', 'base', 'neutral', 'acid', 'base']);
    kinds.forEach((k, i) => {
      const tp = types[i], pool = Object.keys(LIQ).filter(x => LIQ[x].t === tp), liq = pool[Math.floor(Math.random() * pool.length)];
      const base = {eye: '🌈 pH colours · red-cabbage juice', legend: chart ? Object.keys(PHT).map(t => '<span style="background:' + (t === 'acid' ? '#F7A1BE' : t === 'neutral' ? '#C7A8E8' : '#9ED9C8') + '">' + PHT[t][0] + ' ' + PHT[t][1] + ' = ' + PHT[t][2].split(' (')[0] + '</span>').join('') : '', found: [6, 1, 8], cups: [cup({label: '🟣 cabbage juice', col: CABBAGE})]};
      if(k === 'make'){
        const opts = shuffle(lv === 0 ? ['lemon', 'water', 'soap'] : shuffle(Object.keys(LIQ).filter(x => LIQ[x].t === tp)).slice(0, 1).concat(shuffle(Object.keys(LIQ).filter(x => LIQ[x].t !== tp)).slice(0, 3)));
        R.push(Object.assign(base, {q: 'Make it ' + PHT[tp][0] + ' ' + PHT[tp][1], need: 'Pour in one kitchen liquid', hint: lv === 0 ? '👆 ' + PHT[tp][1].toLowerCase() + ' = ' + PHT[tp][2] : 'Which liquid is ' + PHT[tp][2].split(' (')[0].toLowerCase() + '?',
          opts: opts.map(x => ({k: x, i: LIQ[x].i, t: LIQ[x].n})), ok: x => LIQ[x].t === tp, showWrong: true, play: x => xPour(x), why: x => LIQ[x].i + ' ' + LIQ[x].n + ' made it ' + PHT[LIQ[x].t][1].toLowerCase() + ' — it is ' + PHT[LIQ[x].t][2] + '. ' + PHT[tp][1] + ' needs ' + PHT[tp][2] + '.',
          good: x => LIQ[x].i + ' ' + LIQ[x].n + ' is ' + PHT[tp][2] + ' → ' + PHT[tp][0] + ' ' + PHT[tp][1].toLowerCase() + '!', built: x => [LIQ[x].b].filter(Boolean)}));
      } else if(k === 'predict' || k === 'sort'){
        const L = LIQ[liq], pred = k === 'predict';
        R.push(Object.assign(base, {q: pred ? 'What colour will ' + L.i + ' ' + L.n + ' make?' : 'Is ' + L.i + ' ' + L.n + ' an acid, neutral or a base?', need: pred ? 'Guess, then watch it pour' : 'pH ' + L.ph + (lv >= 3 ? '' : ''), hint: k === 'sort' ? 'pH under 7 = acid · 7 = neutral · over 7 = base' : lv <= 2 ? 'Sour things → pink · plain → purple · soapy → blue-green' : '', once: once,
          opts: pred ? Object.keys(PHT).map(t => ({k: t, i: PHT[t][0], t: PHT[t][1].charAt(0) + PHT[t][1].slice(1).toLowerCase()})) : [{k: 'acid', i: '🍋', t: 'Acid'}, {k: 'neutral', i: '💧', t: 'Neutral'}, {k: 'base', i: '🧼', t: 'Base'}],
          ok: x => x === L.t, playAns: () => xPour(liq), why: () => L.i + ' ' + L.n + ' has pH ' + L.ph + ' → ' + PHT[L.t][2] + ' → ' + PHT[L.t][0] + ' ' + PHT[L.t][1].toLowerCase() + '.', good: () => L.i + ' ' + L.n + ' (pH ' + L.ph + ') is ' + PHT[L.t][2] + ' → ' + PHT[L.t][0] + '!', built: () => [L.b].filter(Boolean)}));
      } else {
        const n = 2 + Math.floor(Math.random() * 3);
        R.push(Object.assign(base, {q: 'Make the pink juice 🟣 PURPLE again', need: 'Add baking soda, one spoon at a time', hint: 'Acid + base cancel out → neutral. Stop when it is purple!', stepper: 'neutral', n, good: () => 'Purple = neutral! ' + n + ' spoons of baking soda cancelled the lemon\u2019s acid (the fizz was carbon dioxide).', cups: [cup({label: '🟣 + 🍋', col: LIQ.lemon.col})], found: [6, 1, 8, 11], builtAns: ['soda', 'co2', 'citric']}));
      }
    });
  } else if(exp === 'crystal'){
    const list = lv === 3 ? ['q-warm', 'sugar', 'salt'] : lv === 4 ? ['q-shape', 'epsom', 'sugar'] : ['salt', 'sugar', 'epsom'];
    list.forEach(k => {
      if(k === 'q-warm') return R.push({eye: '💎 Crystal garden', q: 'Which glass can hold MORE sugar?', need: 'Before it gets full', hint: 'A grown-up pours the warm water', once: true,
        opts: [{k: 'cold', i: '❄️', t: 'Cold water'}, {k: 'warm', i: '♨️', t: 'Warm water'}, {k: 'same', i: '🤝', t: 'The same'}], ok: x => x === 'warm', cups: [cup({label: '❄️ cold'}), cup({label: '♨️ warm', warm: true})],
        playAns: () => { XG.cups[0].solid = {kind: 'pile', amt: 1, to: 0.6, rate: 1}; XG.cups[1].solid = {kind: 'pile', amt: 1, to: 0, rate: 1}; return 1200; },
        why: () => 'Warm water holds much more sugar — its busy little bits make room for more.', good: () => 'Warm water holds about twice as much sugar!', found: [6, 1, 8], built: () => ['sucrose']});
      if(k === 'q-shape'){ const c = ['salt', 'epsom', 'sugar'][Math.floor(Math.random() * 3)], C = CRY[c];
        return R.push({eye: '💎 Crystal garden', q: 'What crystals does ' + C.i + ' ' + C.n + ' grow?', need: 'Each stuff has its own crystal shape', hint: '', once: true, opts: Object.keys(SHAPES).map(x => ({k: x, i: SHAPES[x][0], t: SHAPES[x][1]})), ok: x => x === C.shape,
          cups: [cup({label: C.i + ' ' + C.n, string: true, shape: C.shape})], playAns: () => { XG.cups[0].cryTo = 1; XG.dayTo = 7; return 1600; }, why: () => C.n + ' grows ' + SHAPES[C.shape][1] + ' ' + SHAPES[C.shape][0] + ' — its tiny bits always stack the same way.', good: () => SHAPES[C.shape][1] + ' ' + SHAPES[C.shape][0] + '!', found: C.el, built: () => [C.b]}); }
      const C = CRY[k], warm = k !== 'salt', cap = C.cap[warm ? 1 : 0];
      R.push({eye: '💎 Crystal garden', q: 'Grow ' + C.i + ' ' + C.n + ' crystals', need: (warm ? '♨️ warm' : '❄️ cold') + ' water · fill it up', hint: lv <= 1 ? 'Add spoons until a little stays at the bottom — then the water is full' : 'Crystals only grow from FULL (saturated) water', stepper: 'crystal', cap, meter: lv <= 1, good: () => (cap + 1) + ' spoons filled the water — a week later ' + C.n + ' grew ' + SHAPES[C.shape][1] + ' ' + SHAPES[C.shape][0] + '!',
        cups: [cup({label: C.i + ' ' + C.n + ' · ' + (warm ? '♨️ warm' : '❄️ cold'), warm, shape: C.shape})], found: C.el, builtAns: [C.b, 'water']});
    });
  } else if(exp === 'dissolve'){
    const F = {size: ['✨ grains', '🧊 cube'], temp: ['♨️ warm', '❄️ cold'], stir: ['🥄 stirred', '✋ still']}, rounds = [];
    const one = () => shuffle(['size', 'temp', 'stir']).slice(0, 1);
    for(let i = 0; i < 4; i++){
      let A = {size: 1, temp: 1, stir: 1}, B = {size: 1, temp: 1, stir: 1}; ['size', 'temp', 'stir'].forEach(f => { A[f] = B[f] = Math.random() < 0.5 ? 0 : 1; });
      if(lv <= 2 && !(lv === 2 && i === 3)) one().forEach(f => { A[f] = 0; B[f] = 1; });
      else if(lv === 2) { /* a fair 'same' round: only the cup colour differs */ }
      else if(lv === 3) shuffle(['size', 'temp', 'stir']).slice(0, 2).forEach(f => { A[f] = 0; B[f] = 1; });
      else { const fs = shuffle(['size', 'temp', 'stir']); A[fs[0]] = 0; B[fs[0]] = 1; A[fs[1]] = 1; B[fs[1]] = 0; if(i % 2) { A[fs[2]] = 0; B[fs[2]] = 1; } }
      if(Math.random() < 0.5){ const t = A; A = B; B = t; }
      const sp = c => (c.size ? 1 : 3) * (c.temp ? 1 : 2) * (c.stir ? 1 : 2), sa = sp(A), sb = sp(B), ans = sa > sb ? 'A' : sb > sa ? 'B' : 'same';
      const lab = c => F.size[c.size] + '\n' + F.temp[c.temp] + '\n' + F.stir[c.stir];
      rounds.push({eye: '🧂 Dissolving race · sugar', q: 'Which sugar dissolves first?', need: '🅰️ vs 🅱️ — look under each glass', hint: lv <= 1 ? 'Small bits, warm water and stirring all make sugar dissolve faster' : '', once: lv >= 2,
        opts: [{k: 'A', i: '🅰️', t: 'Glass A'}, {k: 'B', i: '🅱️', t: 'Glass B'}, {k: 'same', i: '🤝', t: 'Same time'}], ok: x => x === ans,
        cups: [cup({label: '🅰️', sub: lab(A), warm: !A.temp, stir: !A.stir, solid: {kind: A.size ? 'cube' : 'grains', amt: 1}}), cup({label: '🅱️', sub: lab(B), warm: !B.temp, stir: !B.stir, solid: {kind: B.size ? 'cube' : 'grains', amt: 1}})],
        playAns: () => { XG.cups[0].solid.to = 0; XG.cups[0].solid.rate = sa / 3.2; XG.cups[1].solid.to = 0; XG.cups[1].solid.rate = sb / 3.2; return 3200 / Math.min(sa, sb) + 400; },
        hintWhy: () => 'Look at what is different: ' + ['size', 'temp', 'stir'].filter(f => A[f] !== B[f]).map(f => XHELP[f].replace(/ \(.*/, '') + ' dissolves sugar faster').join(' · ') + '.',
        why: () => ans === 'same' ? 'Both glasses have exactly the same helpers, so they tie.' : 'Glass ' + ans + ' won — ' + xWhy(ans === 'A' ? A : B, ans === 'A' ? B : A), good: () => ans === 'same' ? 'A tie — a fair test changes only one thing!' : 'Glass ' + ans + ' won — ' + xWhy(ans === 'A' ? A : B, ans === 'A' ? B : A), found: [6, 1, 8], built: () => ['sucrose']});
    }
    R.push.apply(R, rounds);
  } else if(exp === 'mix'){
    const pool = lv <= 1 ? ['fizz', 'sand', 'oil', 'curd', 'salt'] : lv <= 3 ? ['fizz', 'sand', 'oil', 'curd', 'salt', 'sugar', 'yeast', 'cabbage'] : ['paint', 'salt', 'cabbage', 'chalk', 'yeast', 'oil', 'sugar', 'curd'];
    shuffle(pool).slice(0, 5).forEach(k => { const p = PAIRS[k];
      R.push({eye: '🫧 Mix or react?', q: p[0] + ' ' + p[1] + ' + ' + p[2] + ' ' + p[3], need: lv <= 1 ? 'Mix them, watch, then sort it' : 'Guess first, then mix', hint: lv <= 1 ? 'A reaction makes NEW stuff' : '', legend: lv <= 2 ? XSIGNS : '', watch: lv <= 1, once: lv >= 2,
        opts: [{k: 'mix', i: '🔀', t: 'Just a mixture'}, {k: 'react', i: '⚗️', t: 'A reaction'}], ok: x => (x === 'react') === !!p[4], cups: [cup({label: p[2] + ' ' + p[3], col: p[9]})],
        playAns: () => xMixFx(p[6]), why: () => (p[4] ? 'A reaction: ' : 'Just a mixture: ') + p[5] + '.', good: () => (p[4] ? '⚗️ Reaction — ' : '🔀 Mixture — ') + p[5] + '.', found: p[8], built: () => p[7]}); });
  } else {
    const L = lv === 0 ? ['which2', 'copper', 'which3'] : lv === 1 ? ['which4', 'copper', 'fastest'] : lv === 2 ? ['which4', 'fastest', 'copper'] : lv === 3 ? ['fastest', 'paint', 'copper'] : ['paint', 'needs', 'fastest'];
    L.forEach(k => {
      const base = {eye: '🌧️ Rust lab · two weeks in a wet dish', once: lv >= 2, found: [26, 8], built: () => ['rust']};
      if(/^which/.test(k)){ const items = k === 'which2' ? ['nail', 'ring'] : k === 'which3' ? ['nail', 'ring', 'spoon'] : ['nail', 'coin', 'ring', 'spoon']; const its = shuffle(items);
        return R.push(Object.assign(base, {q: 'Which one will RUST?', need: 'Two weeks in water + air', hint: lv === 0 ? 'Rust is orange-brown — it grows on iron' : '', opts: its.map(x => ({k: x, i: XITEM[x][0], t: XITEM[x][1]})), ok: x => x === 'nail',
          cups: its.map(x => cup({label: XITEM[x][0], lvl: 0.35, item: {kind: x}})), playAns: () => xDays(14, its.map(x => x === 'nail' ? [1, 0] : x === 'coin' ? [0, 0.7] : [0, 0])),
          why: x => XITEM[x][1] + ' doesn’t rust. Only IRON rusts — water + air turn it into orange-brown rust (iron oxide).', good: () => 'Iron + water + air → rust (iron oxide)!'})); }
      if(k === 'copper') return R.push(Object.assign(base, {q: 'What colour does a 🪙 copper coin turn?', need: 'After a long time outside', hint: lv === 0 ? 'Old copper roofs + statues show it' : '', opts: [{k: 'green', i: '🟢', t: 'Green'}, {k: 'rust', i: '🟤', t: 'Rusty orange'}, {k: 'shiny', i: '✨', t: 'Stays shiny'}], ok: x => x === 'green',
        cups: [cup({label: '🪙 outside', lvl: 0.2, item: {kind: 'coin'}})], playAns: () => xDays(14, [[0, 1]]), why: () => 'Copper turns GREEN (patina) — like the famous green statues. Only iron makes orange rust.', good: () => 'Copper patina is green!', found: [29, 8, 6], built: () => ['patina']}));
      if(k === 'fastest'){ const d = shuffle(['dry', 'tap', 'salt']); const D = {dry: ['🏜️', 'Dry jar', 0, 0.15], tap: ['💧', 'Tap water', 0.4, 0.55], salt: ['🧂', 'Salt water', 0.4, 1]};
        return R.push(Object.assign(base, {q: 'Which nail rusts FASTEST?', need: 'Same nails, different jars', hint: lv <= 1 ? 'Salt helps rust grow — that’s why cars rust near the sea' : '', opts: d.map(x => ({k: x, i: D[x][0], t: D[x][1]})), ok: x => x === 'salt',
          cups: d.map(x => cup({label: D[x][0] + ' ' + D[x][1], lvl: D[x][2], col: x === 'salt' ? '#C6E4EE' : WATER, item: {kind: 'nail'}})), playAns: () => xDays(14, d.map(x => [D[x][3], 0])), why: () => 'Salt water rusts iron fastest — the salt helps the water and air work. A dry nail hardly rusts.', good: () => 'Salt speeds rust up!', found: [26, 8, 11, 17]})); }
      if(k === 'paint'){ const d = shuffle(['bare', 'paint', 'salt']); const D = {bare: ['🔩', 'Bare nail in water', 0.75, 'nail'], paint: ['🎨', 'Painted nail in water', 0, 'pnail'], salt: ['🧂', 'Bare nail in salt water', 1, 'nail']};
        return R.push(Object.assign(base, {q: 'Which nail will NOT rust?', need: 'Two weeks in a jar', hint: '', opts: d.map(x => ({k: x, i: D[x][0], t: D[x][1]})), ok: x => x === 'paint',
          cups: d.map(x => cup({label: D[x][0], lvl: 0.4, item: {kind: D[x][3]}})), playAns: () => xDays(14, d.map(x => [D[x][2], 0])), why: () => 'Paint keeps water + air away from the iron — no rust. That’s why bikes and bridges are painted.', good: () => 'Paint is a raincoat for iron!'})); }
      R.push(Object.assign(base, {q: 'What does iron need to rust?', need: 'Think of a nail on a dry shelf vs in the rain', hint: '', opts: [{k: 'wa', i: '💧', t: 'Water + air'}, {k: 'a', i: '🌬️', t: 'Air only'}, {k: 'h', i: '🔥', t: 'Heat'}], ok: x => x === 'wa',
        cups: [cup({label: '🏜️ dry', lvl: 0, item: {kind: 'nail'}}), cup({label: '🌧️ wet', lvl: 0.35, item: {kind: 'nail'}})], playAns: () => xDays(14, [[0.1, 0], [0.9, 0]]), why: () => 'Iron needs BOTH water and air to rust — the dry nail stays shiny.', good: () => 'Water + air → rust!'}));
    });
  }
  return R;
}
const XHELP = {size: '✨ small grains (×3)', temp: '♨️ warm water (×2)', stir: '🥄 stirring (×2)'};
function xWhy(W, Lo){ const wh = ['size', 'temp', 'stir'].filter(f => !W[f] && Lo[f]).map(f => XHELP[f]), lh = ['size', 'temp', 'stir'].filter(f => !Lo[f] && W[f]).map(f => XHELP[f]);
  return 'it had ' + wh.join(' + ') + (lh.length ? ', which beat ' + lh.join(' + ') + ' in the other glass.' : '.'); }

// ---------- bench actions (set where things go; the loop moves them there) ----------
function xPour(k){ const c = XG.cups[0]; c.col = LIQ[k].col; c.lvlTo = Math.min(0.8, c.lvl + 0.1); return 900; }
function xMixFx(fx){ const c = XG.cups[0];
  if(fx === 'fizz' || fx === 'chalkfizz'){ c.bub = fx === 'fizz' ? 40 : 14; c.foamTo = fx === 'fizz' ? 1 : 0.4; if(fx === 'chalkfizz') c.solid = {kind: 'cube', amt: 1, to: 0.6, rate: 0.2}; setTimeout(() => { if(XG && XG.cups[0] === c){ c.bub = 3; c.foamTo = 0.2; } }, 1600 * SCI_FX); }
  else if(fx === 'sand'){ c.cloud = 1; c.sandTo = 1; }
  else if(fx === 'dissolve'){ c.solid = {kind: 'grains', amt: 1, to: 0, rate: 0.8}; }
  else if(fx === 'layer'){ c.layerTo = 1; }
  else if(fx === 'lumps'){ c.lumpsTo = 1; c.col = '#F1EBD8'; }
  else if(fx === 'colour'){ c.col = LIQ.lemon.col; }
  else if(fx === 'foam'){ c.bub = 8; c.foamTo = 0.8; }
  else if(fx === 'paint'){ c.col = '#7B3F9E'; }
  return 1700; }
function xDays(n, rg){ XG.dayTo = n; XG.cups.forEach((c, i) => { if(c.item){ c.item.rustTo = rg[i][0]; c.item.greenTo = rg[i][1]; } }); return 2000; }

// ---------- game flow ----------
function startExp(exp){
  stopExp(); const lv = SET.level, list = xRounds(exp, lv), X = XEXP.find(e => e[0] === exp);
  XG = {exp, lv, list, i: 0, tries: 0, first: 0, score: 0, miss: 0, found: [], built: [], t0: Date.now(), done: false, solved: false};
  hideResult(); labHand(null); showScreen('exp'); XBAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); XBAR.score(0); XBAR.miss(0); XBAR.fit();
  XBUD = qBuddy(XBUD, 'x-buddy'); xNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'chem'); gcEmit('start', {game: exp}); xLoop();
}
function stopExp(){ if(XG){ XG.done = true; clearTimeout(XG.tm); clearTimeout(XG.gt); clearTimeout(XG.pt); } if(XBUD){ XBUD.stop(); XBUD = null; } cancelAnimationFrame(X_RAF); }
function xNext(){
  if(!XG || XG.done) return; clearTimeout(XG.tm); clearTimeout(XG.gt); clearTimeout(XG.pt); if(XG.i >= XG.list.length) return xEnd();
  const r = XG.list[XG.i], lv = XG.lv; XG.tries = 0; XG.solved = false; XG.watched = !r.watch; XG.busy = false; XG.picked = null; XG.spoons = 0; XG.day = 0; XG.dayTo = 0; XG.glowK = null;
  XG.cups = r.cups.map(c => Object.assign({}, JSON.parse(JSON.stringify(c)), {cur: c.col, bubs: [], bub: 0, foam: 0, foamTo: 0, lumps: 0, lumpsTo: 0, layer: 0, layerTo: 0, cloud: 0, sand: 0, sandTo: 0, cry: 0, cryTo: 0, lvlTo: c.lvl}));
  XG.cups.forEach(c => { if(c.item){ c.item.rust = 0; c.item.green = 0; c.item.rustTo = 0; c.item.greenTo = 0; } if(c.solid){ c.solid.to = c.solid.amt; c.solid.rate = 0; } });
  XBAR.count('exp', '🧪', (XG.i + 1) + '/' + XG.list.length, 'Test');
  $('x-eye').textContent = r.eye; $('x-name').textContent = r.q; $('x-need').textContent = r.need; $('x-hint').textContent = r.hint || ''; $('x-legend').innerHTML = r.legend || '';
  $('x-msg').className = 'fm-msg'; $('x-msg').textContent = '';
  xRender(); drawBench();
  if(lv === 0 && !r.stepper) XG.gt = setTimeout(() => { if(XG && !XG.solved && XG.watched){ XG.glowK = r.opts.find(o => r.ok(o.k)).k; xRender(); } }, 6000 * SCI_FX);
  if(lv === 5) XG.tm = setTimeout(() => { if(XG && !XG.done && !XG.solved){ XG.miss++; XBAR.miss(XG.miss); UISound.play('error'); xAnswer('⏱️ Time! '); } }, 15000);
}
function xRender(){
  const r = XG.list[XG.i], lv = XG.lv, opts = $('x-opts'), act = $('x-act');
  if(r.stepper){ opts.innerHTML = r.meter ? '<span class="xmeter">💧 Water full <b style="--f:' + Math.min(100, Math.round(XG.spoons / r.cap * 100)) + '%"></b> ' + Math.min(100, Math.round(XG.spoons / r.cap * 100)) + ' %</span>' : '<span class="xmeter">🥄 ' + XG.spoons + ' spoon' + (XG.spoons === 1 ? '' : 's') + ' in</span>'; }
  else if(!XG.watched) opts.innerHTML = '';
  else { opts.innerHTML = r.opts.map(o => '<button data-k="' + o.k + '" data-sound="tap" class="' + (o.k === XG.glowK && !XG.solved ? 'kglow' : '') + (XG.solved ? (r.ok(o.k) ? ' yes' : o.k === XG.picked ? ' no' : '') : '') + '"' + (XG.solved || XG.busy ? ' disabled' : '') + '><i>' + o.i + '</i>' + UI.esc(o.t) + '</button>').join('');
    opts.querySelectorAll('button').forEach(b => b.onclick = () => xPick(b.dataset.k)); }
  let h = '';
  if(XG.solved) h = '<button class="sp-btn sp-primary sp-lg" id="x-next" data-sound="pop">' + (XG.i + 1 < XG.list.length ? 'Next test ▶' : '📋 Finish') + '</button>';
  else if(r.watch && !XG.watched) h = '<button class="sp-btn sp-primary sp-lg glow-next" id="x-mix" data-sound="pop">🥄 Mix them!</button>';
  else if(r.stepper === 'crystal'){ const full = XG.spoons > r.cap; h = '<button class="sp-btn sp-secondary sp-lg' + (lv <= 1 && !full ? ' glow-next' : '') + '" id="x-add" data-sound="pop"' + (XG.busy ? ' disabled' : '') + '>🥄 Add a spoon</button><button class="sp-btn sp-primary sp-lg' + (lv <= 1 && full ? ' glow-next' : '') + '" id="x-hang" data-sound="pop"' + (XG.busy || !XG.spoons ? ' disabled' : '') + '>🧵 Hang a string + wait</button>'; }
  else if(r.stepper === 'neutral') h = '<button class="sp-btn sp-secondary sp-lg" id="x-add" data-sound="pop"' + (XG.busy ? ' disabled' : '') + '>🧁 Add a spoon</button><button class="sp-btn sp-primary sp-lg" id="x-stop" data-sound="pop"' + (XG.busy || !XG.spoons ? ' disabled' : '') + '>🛑 Stop — it’s purple!</button>';
  act.innerHTML = h;
  if($('x-next')) $('x-next').onclick = () => { if(!XG || !XG.solved) return; XG.i++; xNext(); };
  if($('x-mix')) $('x-mix').onclick = () => { if(XG.busy) return; XG.busy = true; xRender(); const ms = r.playAns(); UISound.play('pop'); XG.pt = setTimeout(() => { if(!XG || XG.done) return; XG.busy = false; XG.watched = true; $('x-msg').className = 'fm-msg'; $('x-msg').textContent = '👀 What happened? Is there NEW stuff?'; xRender();
    if(XG.lv === 0) XG.gt = setTimeout(() => { if(XG && !XG.solved){ XG.glowK = r.opts.find(o => r.ok(o.k)).k; xRender(); } }, 6000 * SCI_FX); }, ms * SCI_FX); };
  if($('x-add')) $('x-add').onclick = () => xSpoon();
  if($('x-hang')) $('x-hang').onclick = () => xHang();
  if($('x-stop')) $('x-stop').onclick = () => xStop();
}
function xPick(k){
  if(!XG || XG.solved || XG.busy || XG.done) return; const r = XG.list[XG.i], right = r.ok(k); XG.picked = k;
  if(r.once){ XG.busy = true; xRender(); $('x-msg').className = 'fm-msg'; $('x-msg').textContent = '👀 Watch…'; const ms = r.playAns ? r.playAns() : 600; XG.pt = setTimeout(() => { if(!XG || XG.done) return; XG.busy = false; xJudge(right, k); }, ms * SCI_FX); return; }
  if(right){ XG.busy = true; xRender(); const ms = r.play ? r.play(k) : r.playAns && XG.watched && !r.watch ? r.playAns() : 300; XG.pt = setTimeout(() => { if(!XG || XG.done) return; XG.busy = false; xJudge(true, k); }, ms * SCI_FX); return; }
  if(r.showWrong && r.play){ XG.busy = true; xRender(); const ms = r.play(k); XG.pt = setTimeout(() => { if(!XG || XG.done) return; XG.busy = false; xJudge(false, k); XG.pt = setTimeout(() => { if(XG && !XG.solved){ XG.cups[0].col = CABBAGE; xRender(); } }, 1400 * SCI_FX); }, ms * SCI_FX); return; }
  xJudge(false, k);
}
function xGot(r, k){ (r.found || []).forEach(n => { if(XG.found.indexOf(n) < 0) XG.found.push(n); }); (r.builtAns || (r.built ? r.built(k) : [])).forEach(b => { if(b && XG.built.indexOf(b) < 0) XG.built.push(b); }); }
function xJudge(right, k){
  const r = XG.list[XG.i], lv = XG.lv;
  if(right){ const pts = qPts(XG.tries); XG.score += pts; if(XG.tries === 0) XG.first++; XG.solved = true; clearTimeout(XG.tm); clearTimeout(XG.gt); xGot(r, k);
    UISound.play('success'); if(XBUD) XBUD.react('joy'); XBAR.score(Math.round(XG.score * SCI_MULT(lv)));
    xSay('ok', r.good ? r.good(k) : 'Right!', pts); xRender(); gcEmit('right', {exp: XG.exp}); return; }
  XG.tries++; XG.miss++; XBAR.miss(XG.miss); UISound.play('error'); if(XBUD) XBUD.react('miss'); gcEmit('wrong', {exp: XG.exp});
  if(r.once || lv === 5){ XG.score += 10; XG.solved = true; clearTimeout(XG.tm); clearTimeout(XG.gt); xGot(r, k); if(!r.once && r.playAns) r.playAns(); xSay('end', (r.why ? r.why(k) : '') + ' · +10 for watching'); xRender(); return; }
  if(lv <= 2 && XG.tries >= 2 && r.opts) XG.glowK = r.opts.find(o => r.ok(o.k)).k;
  xSay('try', (r.hintWhy ? r.hintWhy(k) : r.why ? r.why(k) : 'Not quite.') + (lv <= 2 ? ' Try again!' : '')); xRender();
}
function xAnswer(pre){ const r = XG.list[XG.i]; XG.solved = true; clearTimeout(XG.gt); if(r.playAns) r.playAns(); if(r.stepper === 'crystal'){ XG.cups[0].string = true; XG.cups[0].cryTo = 1; XG.dayTo = 7; } if(r.stepper === 'neutral') XG.cups[0].col = CABBAGE;
  xSay('end', pre + (r.stepper === 'crystal' ? 'It needed ' + (r.cap + 1) + ' spoons — the water was full when one stayed at the bottom.' : r.stepper === 'neutral' ? 'It needed ' + r.n + ' spoons of baking soda to be neutral purple.' : r.good ? 'Answer: ' + r.good() : '')); xRender(); }
// 💎 / 🌈 stepper jobs
function xSpoon(){
  if(!XG || XG.solved || XG.busy) return; const r = XG.list[XG.i], c = XG.cups[0]; XG.spoons++; UISound.play('pop');
  if(r.stepper === 'crystal'){ const left = Math.max(0, XG.spoons - r.cap); c.solid = {kind: 'pile', amt: (c.solid ? c.solid.amt : 0) + 1, to: left * 0.5, rate: 1.4};
    $('x-msg').className = 'fm-msg'; $('x-msg').textContent = left ? (left === 1 ? '👀 A little stays at the bottom now — the water is FULL!' : '🥄 More is piling up at the bottom — the water can’t take any more.') : '✨ It disappeared into the water — the water can still take more.'; }
  else { const n = r.n, s = XG.spoons; c.col = s < n ? hexLerp(LIQ.lemon.col, CABBAGE, s / n) : s === n ? CABBAGE : hexLerp(CABBAGE, LIQ.soda.col, Math.min(1, (s - n) / 2)); c.bub = 18; setTimeout(() => { if(c) c.bub = 0; }, 900 * SCI_FX);
    $('x-msg').className = 'fm-msg'; $('x-msg').textContent = '🫧 Fizz! ' + (s < n ? 'Still a bit pink…' : s === n ? 'Look at the colour now…' : 'Hmm, the colour is changing again…'); }
  xRender();
}
function xHang(){
  if(!XG || XG.solved || XG.busy || !XG.spoons) return; const r = XG.list[XG.i], c = XG.cups[0], full = XG.spoons > r.cap; c.string = true; XG.busy = true; XG.day = 0; XG.dayTo = 7; c.cryTo = full ? 1 : 0; xRender();
  XG.pt = setTimeout(() => { if(!XG || XG.done) return; XG.busy = false;
    if(full) return xJudge(true);
    XG.tries++; XG.miss++; XBAR.miss(XG.miss); UISound.play('error'); if(XBUD) XBUD.react('miss'); gcEmit('wrong', {exp: XG.exp});
    if(XG.lv === 5) return xAnswer('❌ Nothing grew. ');
    c.string = false; XG.day = 0; XG.dayTo = 0; xSay('try', 'A week later… nothing grew. The water could still take more — keep adding until a little stays at the bottom.'); xRender(); }, 2200 * SCI_FX);
}
function xStop(){
  if(!XG || XG.solved || XG.busy || !XG.spoons) return; const r = XG.list[XG.i], s = XG.spoons;
  if(s === r.n) return xJudge(true);
  XG.tries++; XG.miss++; XBAR.miss(XG.miss); UISound.play('error'); if(XBUD) XBUD.react('miss'); gcEmit('wrong', {exp: XG.exp});
  if(XG.lv === 5) return xAnswer('❌ ');
  xSay('try', s < r.n ? 'Still pink = still an acid. Add more baking soda until it is purple.' : 'Too much — blue-green means a BASE now. Just the right amount makes neutral purple. Let’s start again!');
  if(s > r.n){ XG.spoons = 0; XG.cups[0].col = LIQ.lemon.col; } xRender();
}
function xEnd(){ XG.done = true; const res = {found: XG.found.slice(), built: XG.built.slice(), right: XG.first, total: XG.list.length, score: Math.round(XG.score * SCI_MULT(XG.lv)), stars: qStars(XG.first, XG.list.length), timeSec: Math.round((Date.now() - XG.t0) / 1000)}; const k = XG.exp; stopExp(); chemSave(k, res); }

// ---------- the bench (canvas) ----------
function hexLerp(a, b, t){ const p = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16)), A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, '0')).join(''); }
function xLoop(){ cancelAnimationFrame(X_RAF); if(!XG || XG.done) return; const now = performance.now(), dt = XG.lastT ? Math.min(0.1, (now - XG.lastT) / 1000) : 0; XG.lastT = now; xStep(dt); drawBench(); if(SCI_FX) X_RAF = requestAnimationFrame(xLoop); }
function xStep(dt){   // dt = 0 → jump straight to the end (tests, SCI_FX 0)
  if(!XG || !XG.cups) return; const k = dt ? Math.min(1, dt * 3) : 1, mv = (v, to, sp) => dt ? (v < to ? Math.min(to, v + sp * dt) : Math.max(to, v - sp * dt)) : to;
  XG.day = mv(XG.day || 0, XG.dayTo || 0, (XG.dayTo || 1) / 1.6);
  XG.cups.forEach(c => { c.cur = dt ? hexLerp(c.cur, c.col, k) : c.col; c.lvl = mv(c.lvl, c.lvlTo, 0.4); c.foam = mv(c.foam, c.foamTo, 0.8); c.lumps = mv(c.lumps, c.lumpsTo, 0.6); c.layer = mv(c.layer, c.layerTo, 0.8); c.sand = mv(c.sand, c.sandTo, 0.7); c.cloud = mv(c.cloud, 0, 0.5); c.cry = mv(c.cry, c.cryTo, 0.6);
    if(c.solid) c.solid.amt = dt ? mv(c.solid.amt, c.solid.to, c.solid.rate || 1) : c.solid.to;
    if(c.item){ const f = XG.dayTo ? XG.day / XG.dayTo : 0; c.item.rust = (c.item.rustTo || 0) * (dt ? f : 1); c.item.green = (c.item.greenTo || 0) * (dt ? f : 1); }
    if(dt && c.bub > 0){ c.bubT = (c.bubT || 0) + dt * c.bub; while(c.bubT > 1){ c.bubT--; c.bubs.push({x: Math.random(), y: 1, r: 0.02 + Math.random() * 0.04, v: 0.4 + Math.random() * 0.6}); } }
    c.bubs = c.bubs.filter(b => (b.y -= b.v * dt) > 0).slice(-80); });
}
function drawBench(){
  const cv = $('x-cv'); if(!cv || !XG || !XG.cups) return; if(!SCI_FX) xStep(0); const r = cv.getBoundingClientRect(); if(r.width < 10 || r.height < 10) return;
  const dpr = Math.min(2, devicePixelRatio || 1); if(cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)){ cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
  const g = cv.getContext('2d'), W = r.width, H = r.height, n = XG.cups.length; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  const lab = n > 1 && XG.cups.some(c => c.sub), fs = Math.max(11, Math.min(18, H * 0.06)), top = XG.dayTo ? fs * 1.8 : 6, bottom = fs * (lab ? 4.6 : 1.7);
  const rows = n >= 3 && H > W * 0.9 ? 2 : 1, cols = Math.ceil(n / rows), Wd = W < 520 ? W - 58 : W, cellW = Wd / cols, cellH = (H - top) / rows;   // tall phones: 2 rows of glasses, room for the lab buddy
  const ch = Math.max(30, Math.min(cellH - bottom - 8, cellW * 0.8 * 1.3)), cw = ch / 1.3;
  if(XG.dayTo){ g.fillStyle = '#FFE08A'; g.font = '900 ' + fs + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText('📅 Day ' + Math.round(XG.day) + (XG.day >= XG.dayTo - 0.01 ? ' ✓' : ' …'), W / 2, 4); }
  XG.cups.forEach((c, i) => { const row = Math.floor(i / cols), col = i % cols, inRow = row === rows - 1 ? n - cols * (rows - 1) : cols, off = (Wd - inRow * cellW) / 2;
    const x = off + col * cellW + (cellW - cw) / 2, y = top + row * cellH + (cellH - ch - bottom) / 2; drawCup(g, x, y, cw, ch, c, i);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'top'; xFit(g, c.label, cellW * 0.95, fs, '900'); g.fillText(c.label, x + cw / 2, y + ch + 4);
    if(lab){ g.fillStyle = '#C9D6EA'; String(c.sub).split('\n').forEach((ln, j) => { xFit(g, ln, cellW * 0.95, fs * 0.8, '800'); g.fillText(ln, x + cw / 2, y + ch + 4 + fs * (1.25 + 0.95 * j)); }); } });
}
function xFit(g, txt, w, fs, wt){ let f = fs; g.font = wt + ' ' + f + 'px Nunito, sans-serif'; while(f > 8 && g.measureText(txt).width > w){ f -= 1; g.font = wt + ' ' + f + 'px Nunito, sans-serif'; } }
function drawCup(g, x, y, w, h, c, idx){
  const glass = () => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w * 0.92, y + h - 10); g.quadraticCurveTo(x + w * 0.9, y + h, x + w * 0.8, y + h); g.lineTo(x + w * 0.2, y + h); g.quadraticCurveTo(x + w * 0.1, y + h, x + w * 0.08, y + h - 10); g.closePath(); };
  if(c.warm){ g.fillStyle = 'rgba(255,140,60,0.18)'; g.fillRect(x - 4, y + h - 6, w + 8, 8); }
  g.save(); glass(); g.clip();
  g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(x, y, w, h);
  const ly = y + h * (1 - c.lvl);
  if(c.lvl > 0.01){ g.globalAlpha = 0.85; g.fillStyle = c.cur; g.fillRect(x, ly, w, h); g.globalAlpha = 1;
    if(c.layer > 0){ g.fillStyle = 'rgba(232,197,71,' + (0.85 * c.layer) + ')'; g.fillRect(x, ly - h * 0.12 * c.layer, w, h * 0.14 * c.layer); }
    if(c.cloud > 0){ g.fillStyle = 'rgba(194,160,110,' + (0.5 * c.cloud) + ')'; g.fillRect(x, ly, w, h); }
    if(c.foam > 0){ g.fillStyle = 'rgba(255,255,255,0.9)'; for(let k = 0; k < 9; k++){ g.beginPath(); g.arc(x + w * (k + 0.5) / 9, ly - 2, w * 0.07 * (0.6 + c.foam), 0, Math.PI * 2); g.fill(); } } }
  if(c.sand > 0){ g.fillStyle = '#D2B48C'; g.fillRect(x, y + h - h * 0.14 * c.sand, w, h); }
  if(c.lumps > 0){ g.fillStyle = 'rgba(255,255,255,0.95)'; for(let k = 0; k < 10; k++){ const a = (k * 97 % 100) / 100, b = (k * 53 % 100) / 100; g.beginPath(); g.arc(x + w * (0.18 + 0.64 * a), ly + (y + h - ly) * (0.15 + 0.7 * b), w * 0.05 * c.lumps, 0, Math.PI * 2); g.fill(); } }
  if(c.solid && c.solid.amt > 0.01){ const a = c.solid.amt;
    if(c.solid.kind === 'cube'){ const s = w * 0.3 * Math.cbrt(Math.min(1, a)); g.fillStyle = '#FFFFFF'; g.strokeStyle = '#B7C6D6'; g.lineWidth = 2; g.fillRect(x + w / 2 - s / 2, y + h - s - 3, s, s); g.strokeRect(x + w / 2 - s / 2, y + h - s - 3, s, s); }
    else if(c.solid.kind === 'grains'){ g.fillStyle = '#FFFFFF'; const m = Math.round(40 * Math.min(1, a)); for(let k = 0; k < m; k++){ const a1 = (k * 37 % 41) / 41, b1 = (k * 17 % 23) / 23; g.fillRect(x + w * (0.25 + 0.5 * a1), y + h - 5 - h * 0.12 * b1 * Math.min(1, a), 3, 3); } }
    else { const rr = w * 0.16 * Math.sqrt(Math.min(3, a)); g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(x + w / 2, y + h - 2, rr * 1.4, rr, 0, Math.PI, 0); g.fill(); } }
  c.bubs.forEach(b => { g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1.5; g.beginPath(); g.arc(x + w * (0.15 + 0.7 * b.x), ly + (y + h - ly) * b.y, w * b.r, 0, Math.PI * 2); g.stroke(); });
  if(c.item){ const it = c.item, cx = x + w / 2, by = y + h - 6;
    if(it.kind === 'nail' || it.kind === 'pnail'){ const nl = h * 0.62, nw = Math.max(5, w * 0.08); g.fillStyle = it.kind === 'pnail' ? '#3F6FD8' : '#9AA3AD'; g.fillRect(cx - nw / 2, by - nl, nw, nl - nw); g.beginPath(); g.moveTo(cx - nw / 2, by - nw); g.lineTo(cx + nw / 2, by - nw); g.lineTo(cx, by); g.fill(); g.fillRect(cx - nw * 1.4, by - nl - nw * 0.6, nw * 2.8, nw * 0.7);
      if(it.rust > 0){ g.fillStyle = 'rgba(176,84,34,' + Math.min(1, it.rust) + ')'; for(let k = 0; k < 9; k++){ g.beginPath(); g.arc(cx + (k % 2 ? 1 : -1) * nw * 0.25, by - nl * (0.08 + 0.1 * k), nw * (0.25 + 0.3 * it.rust), 0, Math.PI * 2); g.fill(); } } }
    else if(it.kind === 'coin'){ const rr = w * 0.22; g.fillStyle = hexLerp('#C87533', '#4FB89A', it.green || 0); g.beginPath(); g.ellipse(cx, by - rr * 0.4, rr, rr * 0.45, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.25)'; g.stroke(); }
    else if(it.kind === 'ring'){ const rr = w * 0.18; g.strokeStyle = '#E6B422'; g.lineWidth = Math.max(4, w * 0.06); g.beginPath(); g.ellipse(cx, by - rr * 0.5, rr, rr * 0.5, 0, 0, Math.PI * 2); g.stroke(); }
    else { g.fillStyle = '#5DADE2'; g.beginPath(); g.ellipse(cx - w * 0.18, by - 8, w * 0.12, w * 0.08, 0, 0, Math.PI * 2); g.fill(); g.fillRect(cx - w * 0.08, by - 11, w * 0.34, 6); } }
  if(c.string){ g.strokeStyle = '#EDE3C7'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + w / 2, y + 4); g.lineTo(x + w / 2, y + h * 0.75); g.stroke();
    const m = Math.round(12 * c.cry); for(let k = 0; k < m; k++){ const yy = y + h * (0.22 + 0.042 * k), xx = x + w / 2 + (k % 2 ? 1 : -1) * w * (0.03 + 0.05 * ((k * 7) % 3)), sz = w * (0.035 + 0.05 * c.cry) * (0.8 + 0.4 * ((k * 5) % 3) / 2);
      g.fillStyle = 'rgba(235,248,255,0.95)'; g.strokeStyle = '#9CC9E8'; g.lineWidth = 1.5;
      if(c.shape === 'needle'){ g.save(); g.translate(xx, yy); g.rotate((k % 3 - 1) * 0.6); g.fillRect(-sz * 0.12, -sz, sz * 0.24, sz * 2); g.strokeRect(-sz * 0.12, -sz, sz * 0.24, sz * 2); g.restore(); }
      else if(c.shape === 'chunk'){ g.beginPath(); for(let q = 0; q < 6; q++){ const an = q / 6 * Math.PI * 2; g.lineTo(xx + Math.cos(an) * sz, yy + Math.sin(an) * sz * 0.8); } g.closePath(); g.fill(); g.stroke(); }
      else { g.fillRect(xx - sz / 2, yy - sz / 2, sz, sz); g.strokeRect(xx - sz / 2, yy - sz / 2, sz, sz); } } }
  g.restore();
  if(c.string){ g.fillStyle = '#C08A4E'; g.fillRect(x - w * 0.1, y - 4, w * 1.2, 7); }
  if(c.stir){ g.save(); g.translate(x + w * 0.7, y - 4); g.rotate(0.35 + (SCI_FX ? Math.sin(performance.now() / 160) * 0.2 : 0)); g.fillStyle = '#C0C7D1'; g.fillRect(-3, 0, 6, h * 0.8); g.restore(); }
  glass(); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,0.65)'; g.stroke();
}

/* ================= 🔬 PARTICLE (sc-2d) — 17 cards · 🧱 Proton builder · 💥 Mini collider ================= */
Object.assign(KIND_UI, {quark: ['🧱 Particles built!', () => startQuark(), 'right first time', 3], collide: ['💥 Collisions read!', () => startCollide(), 'right first time', 3]});
// [id, symbol, name, family, charge, fact, where, row, col] — kid-safe facts only
const PARTS = [['u', 'u', 'Up quark', 'quark', '+⅔', 'Two up quarks + one down quark make every proton.', 'Inside every proton + neutron', 0, 0],
  ['c', 'c', 'Charm quark', 'quark', '+⅔', 'A heavier cousin of the up quark — it lives only a tiny moment.', 'Made in particle colliders', 0, 1],
  ['t', 't', 'Top quark', 'quark', '+⅔', 'The heaviest particle we know — about as heavy as a whole gold atom!', 'Found at Fermilab (USA) in 1995', 0, 2],
  ['d', 'd', 'Down quark', 'quark', '−⅓', 'One up + two down quarks make a neutron.', 'Inside every proton + neutron', 1, 0],
  ['s', 's', 'Strange quark', 'quark', '−⅓', 'Yes, it is really called “strange”!', 'In cosmic rays + colliders', 1, 1],
  ['b', 'b', 'Bottom quark', 'quark', '−⅓', 'Flies a tiny bit before it breaks up — detectors spot the little gap.', 'Made in particle colliders', 1, 2],
  ['e', 'e', 'Electron', 'lepton', '−1', 'Electrons whizz around every atom and make electricity flow.', 'In every atom', 2, 0],
  ['mu', 'μ', 'Muon', 'lepton', '−1', 'A heavy electron. Muons from space pass through you every second!', 'Cosmic rays from space', 2, 1],
  ['tau', 'τ', 'Tau', 'lepton', '−1', 'The heaviest electron cousin — gone in a blink.', 'Made in particle colliders', 2, 2],
  ['ve', 'νe', 'Electron neutrino', 'lepton', '0', 'A ghost particle: billions from the Sun pass through your fingernail every second.', 'From the Sun', 3, 0],
  ['vmu', 'νμ', 'Muon neutrino', 'lepton', '0', 'Comes along with muons and almost never bumps into anything.', 'Cosmic rays + colliders', 3, 1],
  ['vtau', 'ντ', 'Tau neutrino', 'lepton', '0', 'The last of the 12 matter particles to be seen (in the year 2000).', 'Made in particle colliders', 3, 2],
  ['g', 'g', 'Gluon', 'boson', '0', 'The glue that holds quarks together — that is where its name comes from.', 'Inside every proton', 0, 3],
  ['ph', 'γ', 'Photon', 'boson', '0', 'A tiny bit of light. Your eyes are catching photons right now!', 'Light, radio waves, X-rays', 1, 3],
  ['z', 'Z', 'Z boson', 'boson', '0', 'A heavy partner of the W — it lives only a tiny moment.', 'Made in particle colliders', 2, 3],
  ['w', 'W', 'W boson', 'boson', '±1', 'Turns one kind of quark into another — the Sun needs it to shine.', 'Made in particle colliders', 3, 3],
  ['h', 'H', 'Higgs boson', 'higgs', '0', 'Gives the other particles their mass. Found at CERN in 2012.', 'Found at CERN (Switzerland)', 1, 4]];
const PBY = {}; PARTS.forEach(p => { PBY[p[0]] = p; });
function psym(p){ return p[1].replace(/^ν(.)$/, 'ν<sub>$1</sub>'); }
const PFAM = {quark: {col: '#C8A6F7', name: 'Quarks', what: 'build protons + neutrons'}, lepton: {col: '#9ED8F7', name: 'Leptons', what: 'electrons + their cousins'}, boson: {col: '#FFD08A', name: 'Force carriers', what: 'carry the pushes + pulls'}, higgs: {col: '#FF9E9B', name: 'Higgs', what: 'gives mass'}};
var PART_LVL = [['🧱 proton + glow', 'The next quark glows · 3 track pictures'], ['🔢 charges', 'Add up the charges · 4 kinds of track'], ['Δ more quarks', 'Δ particles · no track pictures · ✨ discoveries'], ['📛 names', 'Names only · Z, W + Higgs events'], ['🍋 strange', 'Strange quarks · tricky events'], ['💀 one try', 'Timers + one try']];
function partGot(id){ return (CHEM.p || []).indexOf(id) >= 0; }
function openParticle(lv){
  stopQuark(); stopCollide(); SET.level = lv; const U = LEVEL_UI[lv];
  $('phub-sub').textContent = U.emoji + ' ' + U.name + ' · ' + PART_LVL[lv][0];
  $('phub-count').innerHTML = '<span>📇 ' + (CHEM.p || []).length + ' / 17 particle cards</span><span>📇 ' + CHEM.all.length + ' / 118 element cards</span>';
  const H = [['quark', '🧱', 'Proton builder', 'Snap 3 quarks into protons, neutrons + more'], ['collide', '💥', 'Mini collider', 'Smash protons, then read the tracks like a scientist'], ['zoo', '📇', 'Particle zoo', 'All 17 particles — your ⭐ cards + their facts']];
  $('phub-hub').innerHTML = H.map((h, i) => '<button class="pick" data-g="' + h[0] + '" data-sound="pop" style="animation:sc-pop .4s ' + (i * 0.08) + 's both"><div class="big">' + h[1] + '</div><div class="nm">' + h[2] + '</div><div class="sub">' + h[3] + '</div></button>').join('');
  $('phub-hub').querySelectorAll('[data-g]').forEach(b => b.onclick = () => ({quark: startQuark, collide: startCollide, zoo: openZoo}[b.dataset.g])());
  showScreen('phub');
  if(lv === 0) setTimeout(() => { if(!$('scr-phub').classList.contains('hidden')){ const b = $('phub-hub').querySelector('[data-g="quark"]'); b.classList.add('glow-next'); labHand(b); } }, 400 * SCI_FX);
}
function leaveParticle(toLevels){ stopQuark(); stopCollide(); hideResult(); labHand(null); if(toLevels){ renderMenu(); showScreen('menu'); } else openParticle(SET.level); }
function openZoo(){ renderZoo(); showScreen('pzoo'); }
function renderZoo(){
  const heads = ['I', 'II', 'III', 'Forces', 'Higgs'].map(h => '<div class="pz-head">' + h + '</div>').join('');
  const cells = []; for(let r = 0; r < 4; r++) for(let c = 0; c < 5; c++){ const p = PARTS.find(x => x[7] === r && x[8] === c); if(p) cells.push(p); else if(!(c === 4 && r === 2)) cells.push(null); }
  $('pz-grid').innerHTML = heads + cells.map(p => p ? '<button class="pz ' + (partGot(p[0]) ? 'got' : 'no') + (p[3] === 'higgs' ? ' h' : '') + '" data-id="' + p[0] + '" data-sound="tap" style="background:' + PFAM[p[3]].col + '"><i>' + p[4] + '</i><b>' + psym(p) + '</b><small>' + UI.esc(p[2]) + '</small></button>' : '<div></div>').join('');
  $('pz-grid').querySelectorAll('.pz').forEach(b => b.onclick = () => openPart(b.dataset.id));
  $('pz-legend').innerHTML = Object.keys(PFAM).map(k => '<span style="background:' + PFAM[k].col + '">' + PFAM[k].name + ' — ' + PFAM[k].what + '</span>').join('') + '<span style="background:#fff">⭐ ' + (CHEM.p || []).length + ' / 17 yours</span>';
}
function openPart(id){
  const p = PBY[id]; if(!p) return; const F = PFAM[p[3]], got = partGot(id);
  const how = {u: '🧱 Proton builder', d: '🧱 Proton builder', g: '🧱 Proton builder', s: '🧱 Proton builder (🌋 strange quarks)', e: '💥 Mini collider', ph: '💥 Mini collider', mu: '💥 Mini collider', ve: '💥 Mini collider (👻 neutrinos)', vmu: '💥 Mini collider (W events)', z: '💥 Mini collider (📛 Z events)', w: '💥 Mini collider (📛 W events)', h: '💥 Mini collider (📛 Higgs events)'}[id] || '✨ a great smash in 💥 Mini collider (🔥 and up)';
  $('elc-card').innerHTML = '<button class="x" data-sound="tap" aria-label="Close">✖</button><div class="elc-top"><div class="elc-tile" style="background:' + F.col + '"><i>' + p[4] + '</i><b>' + psym(p) + '</b><small>' + UI.esc(p[2]) + '</small></div>' +
    '<div><h3>' + UI.esc(p[2]) + '</h3><p>' + F.name + ' · ' + F.what + '</p></div></div>' +
    '<div class="row"><span>⚡ Charge ' + p[4] + '</span><span>' + (p[3] === 'quark' ? '🧱 Never alone — always in groups' : p[3] === 'lepton' ? '🏃 Can fly around on its own' : p[3] === 'higgs' ? '🌌 Fills all of space' : '🤝 Carries a force') + '</span></div>' +
    '<div class="txt">💡 ' + UI.esc(p[5]) + '<br>📍 ' + UI.esc(p[6]) + '</div>' +
    '<div class="got' + (got ? '' : ' no') + '">' + (got ? '📇 ⭐ In your collection' : '🔒 Not yours yet — find it in ' + how) + '</div>';
  $('elc').classList.remove('hidden'); $('elc-card').querySelector('.x').onclick = closeElement; $('elc').onclick = ev => { if(ev.target.id === 'elc') closeElement(); };
  gcEmit('particle', {id});
}

// ---------- 🧱 Proton builder ----------
const QK = {u: {n: 'up', ch: 2, col: '#E86A9A'}, d: {n: 'down', ch: -1, col: '#5B8DEF'}, s: {n: 'strange', ch: -1, col: '#F2A93B'}};
const HAD = [{k: 'p', name: 'Proton', q: 'uud', icon: '🔴', where: 'in the middle of every atom'}, {k: 'n', name: 'Neutron', q: 'udd', icon: '⚪', where: 'next to protons in atoms'},
  {k: 'dpp', name: 'Delta-plus-plus (Δ⁺⁺)', q: 'uuu', icon: 'Δ', where: 'made in colliders, gone in a blink'}, {k: 'dm', name: 'Delta-minus (Δ⁻)', q: 'ddd', icon: 'Δ', where: 'made in colliders, gone in a blink'},
  {k: 'lam', name: 'Lambda (Λ)', q: 'uds', icon: 'Λ', where: 'in cosmic-ray showers'}, {k: 'sig', name: 'Sigma-plus (Σ⁺)', q: 'uus', icon: 'Σ', where: 'in cosmic-ray showers'}, {k: 'om', name: 'Omega-minus (Ω⁻)', q: 'sss', icon: 'Ω', where: 'predicted first, then found in 1964'}];
const QCOL = ['#FF5A5F', '#3DDC84', '#4C8DFF'];   // colour charge: red · green · blue = white
function qsort(str){ return str.split('').sort().join(''); }
function fmt3(n){ const w = Math.trunc(n / 3), r = Math.abs(n % 3), sg = n > 0 ? '+' : n < 0 ? '−' : ''; if(!r) return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(w); return sg + (Math.abs(w) ? Math.abs(w) : '') + (r === 1 ? '⅓' : '⅔'); }
function qCharge(arr){ return arr.reduce((t, k) => t + QK[k].ch, 0); }
let KG = null, KBUD = null, K_RAF = 0;
const KBAR = qBar('kbar', '🧱', 'Proton builder', 'quark-level', () => KG, () => { if(KG) KG.done = true; }, () => drawQk());
KBAR.count('qk', '🧱', '1/5', 'Build');
function startQuark(){
  stopQuark(); const lv = SET.level;
  const pool = lv <= 1 ? ['p', 'n', 'p', 'n', 'p'] : lv <= 3 ? shuffle(['p', 'n', 'dpp', 'dm', 'p']) : shuffle(['lam', 'sig', 'om', 'p', 'n']);
  KG = {lv, list: lv === 0 ? pool : shuffle(pool), i: 0, slots: [], hold: {}, tries: 0, first: 0, score: 0, miss: 0, parts: ['u', 'd', 'g'], t0: Date.now(), done: false, solved: false, t: 0};
  hideResult(); labHand(null); showScreen('qk'); KBAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); KBAR.score(0); KBAR.miss(0); KBAR.fit();
  KBUD = qBuddy(KBUD, 'qk-buddy'); qkNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'particle'); gcEmit('start', {game: 'quark'}); qkLoop();
}
function stopQuark(){ if(KG){ KG.done = true; clearTimeout(KG.tm); } if(KBUD){ KBUD.stop(); KBUD = null; } cancelAnimationFrame(K_RAF); }
function qkNext(){
  if(!KG || KG.done) return; clearTimeout(KG.tm); if(KG.i >= KG.list.length) return qkEnd();
  const T = HAD.find(h => h.k === KG.list[KG.i]), lv = KG.lv, ch = qCharge(T.q.split('')); KG.slots = []; KG.tries = 0; KG.solved = false;
  KBAR.count('qk', '🧱', (KG.i + 1) + '/' + KG.list.length, 'Build');
  $('qk-name').innerHTML = qkBadge(T) + UI.esc(T.name);
  $('qk-need').innerHTML = qkRecipe(T, lv) + (lv <= 2 ? ' <span class="ptag">⚡ charge ' + fmt3(ch) + '</span>' : '');
  $('qk-hint').innerHTML = '📍 ' + UI.esc(T.where.charAt(0).toUpperCase() + T.where.slice(1)) + '<br>' + (lv === 0 ? '👆 Tap the glowing quark' : lv <= 2 ? 'up = +⅔ · down = −⅓' : lv === 4 ? 'Λ, Σ + Ω have strange quarks' : '');
  $('qk-msg').className = 'fm-msg'; $('qk-msg').textContent = ''; qkRender();
  if(lv === 5) KG.tm = setTimeout(() => { if(KG && !KG.done && !KG.solved){ KG.miss++; KBAR.miss(KG.miss); UISound.play('error'); qkAnswer('⏱️ Time! '); } }, 25000);
}
function qkWant(){ const T = HAD.find(h => h.k === KG.list[KG.i]), need = T.q.split(''); KG.slots.forEach(k => { const j = need.indexOf(k); if(j >= 0) need.splice(j, 1); }); return need; }
function qkRender(){
  const lv = KG.lv, kinds = lv >= 4 ? ['u', 'd', 's'] : ['u', 'd'], want = qkWant(), next = lv === 0 && KG.slots.length < 3 && !KG.solved ? (want[0] || '') : '';
  $('qk-kit').innerHTML = kinds.map(k => '<button data-k="' + k + '" data-sound="pop" class="' + (k === next ? 'kglow' : '') + '"' + (KG.solved ? ' disabled' : '') + '><b style="background:' + QK[k].col + '">' + k + '</b>' + QK[k].n + ' <small>' + fmt3(QK[k].ch) + '</small></button>').join('');
  $('qk-kit').querySelectorAll('button').forEach(b => b.onclick = () => qkAdd(b.dataset.k));
  const sum = KG.slots.length ? KG.slots.map(k => fmt3(QK[k].ch)).join(' ') + ' = ' + fmt3(qCharge(KG.slots)) : 'empty';
  $('qk-act').innerHTML = KG.solved ? '<button class="sp-btn sp-primary sp-lg" id="qk-next" data-sound="pop">' + (KG.i + 1 < KG.list.length ? 'Next build ▶' : '📋 Finish') + '</button>'
    : '<button class="sp-btn sp-secondary sp-lg" id="qk-undo" data-sound="tap"' + (KG.slots.length ? '' : ' disabled') + '>↩️ Take one out</button><button class="sp-btn sp-primary sp-lg' + (lv === 0 && KG.slots.length === 3 ? ' glow-next' : '') + '" id="qk-check" data-sound="pop"' + (KG.slots.length === 3 ? '' : ' disabled') + '>✅ Check</button>';
  if($('qk-next')) $('qk-next').onclick = () => { if(!KG || !KG.solved) return; KG.i++; qkNext(); };
  if($('qk-undo')) $('qk-undo').onclick = () => { if(KG.solved) return; KG.slots.pop(); qkRender(); };
  if($('qk-check')) $('qk-check').onclick = qkCheck;
  KG.sumTxt = (lv <= 2 || KG.solved ? '⚡ ' + sum : ''); $('qk-sum').textContent = !KG.slots.length ? '' : KG.sumTxt + (KG.slots.length === 3 && (lv <= 2 || KG.solved) ? '  ·  🔴🟢🔵 rings = ⚪ colour-neutral' : ''); if(KG.solved) $('qk-kit').innerHTML = ''; drawQk();
}
function qkAdd(k){ if(!KG || KG.solved || KG.done || KG.slots.length >= 3) { if(KG && !KG.solved && KG.slots.length >= 3){ $('qk-msg').className = 'fm-msg'; $('qk-msg').textContent = '🧱 3 quarks is full — ✅ check it or ↩️ take one out'; } return; } KG.slots.push(k); KG.pop = performance.now(); const i = KG.slots.length - 1; labCarry(KBUD, $('qk-buddy'), document.querySelector('#qk-kit [data-k="' + k + '"] b'), () => qkSlotXY(i), AtomSkins.url(k, QK[k].col, atomSkin(), 64), ms => { KG.hold[i] = performance.now() + ms; }); qkRender(); }
function qkCheck(){
  if(!KG || KG.solved || KG.slots.length !== 3) return; const T = HAD.find(h => h.k === KG.list[KG.i]), lv = KG.lv, got = qsort(KG.slots.join(''));
  if(got === qsort(T.q)){ const pts = qPts(KG.tries); KG.score += pts; if(KG.tries === 0) KG.first++; KG.solved = true; clearTimeout(KG.tm); if(T.q.indexOf('s') >= 0 && KG.parts.indexOf('s') < 0) KG.parts.push('s');
    UISound.play('success'); if(KBUD) KBUD.react('joy'); KBAR.score(Math.round(KG.score * SCI_MULT(lv))); $('qk-msg').className = 'fm-msg ok';
    $('qk-msg').textContent = '✅ ' + T.name + ' = ' + T.q.split('').join(' ') + ' · charge ' + fmt3(qCharge(T.q.split(''))) + ' · ' + T.where + ' · +' + pts; qkRender(); gcEmit('right', {had: T.k}); return; }
  KG.tries++; KG.miss++; KBAR.miss(KG.miss); UISound.play('error'); if(KBUD) KBUD.react('miss'); gcEmit('wrong', {had: T.k});
  if(lv === 5) return qkAnswer('❌ ');
  const made = HAD.find(h => qsort(h.q) === got), want = qCharge(T.q.split('')), have = qCharge(KG.slots);
  $('qk-msg').className = 'fm-msg'; $('qk-msg').textContent = '🤔 ' + (made ? 'You made a ' + made.name + ' (' + made.q.split('').join(' ') + ')! ' : 'That mix has charge ' + fmt3(have) + '. ') + (lv <= 2 ? (want !== have ? T.name + ' needs charge ' + fmt3(want) + ' — ' + (want > have ? 'swap a down for an up.' : 'swap an up for a down.') : 'Same charge, but ' + T.name + ' is ' + T.q.split('').join(' ') + '.') : 'Count the quarks again.');
  KG.slots = []; qkRender();
}
function qkAnswer(pre){ const T = HAD.find(h => h.k === KG.list[KG.i]); KG.solved = true; KG.slots = T.q.split(''); $('qk-msg').className = 'fm-msg'; $('qk-msg').textContent = pre + T.name + ' = ' + T.q.split('').join(' ') + ' (charge ' + fmt3(qCharge(KG.slots)) + ')'; qkRender(); }
function qkEnd(){ KG.done = true; const res = {found: [], built: [], parts: KG.parts.slice(), right: KG.first, total: KG.list.length, score: Math.round(KG.score * SCI_MULT(KG.lv)), stars: qStars(KG.first, KG.list.length), timeSec: Math.round((Date.now() - KG.t0) / 1000)}; stopQuark(); chemSave('quark', res); }
function qkLoop(){ cancelAnimationFrame(K_RAF); if(!KG || KG.done) return; KG.t = performance.now() / 1000; drawQk(); if(SCI_FX) K_RAF = requestAnimationFrame(qkLoop); }
function canvasFit(cv){ const r = cv.getBoundingClientRect(); if(r.width < 10 || r.height < 10) return null; const dpr = Math.min(2, devicePixelRatio || 1);
  if(cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)){ cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); } const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, r.width, r.height); return {g, W: r.width, H: r.height}; }
function drawQk(){
  const cv = $('qk-cv'); if(!cv || !KG) return; const F = canvasFit(cv); if(!F) return; const {g, W, H} = F, fs = Math.max(12, Math.min(20, H * 0.07));
  const tl = 0, R = Math.min(W * 0.44, H * 0.46), cx = W / 2, cy = H / 2, t = SCI_FX ? KG.t || 0 : 0, full = KG.slots.length === 3;
  g.save(); const bg = g.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R); bg.addColorStop(0, full ? 'rgba(255,170,230,0.30)' : 'rgba(210,160,255,0.16)'); bg.addColorStop(1, 'rgba(120,70,220,0.10)');
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fillStyle = bg; g.fill(); g.shadowColor = full ? '#FF7AD9' : '#B47CFF'; g.shadowBlur = full ? 26 : 14; g.lineWidth = 4; g.strokeStyle = full ? 'rgba(255,170,235,0.95)' : 'rgba(214,160,255,0.7)'; g.setLineDash(full ? [] : [10, 8]); g.stroke(); g.restore();
  const pos = [0, 1, 2].map(i => { const a = -Math.PI / 2 + i * Math.PI * 2 / 3 + Math.sin(t * 0.8) * 0.06; return [cx + Math.cos(a) * R * 0.48, cy + Math.sin(a) * R * 0.48]; }), br = R * 0.24;
  if(KG.slots.length >= 2){ g.save(); g.shadowColor = '#FFD45E'; g.shadowBlur = 8; g.strokeStyle = '#FFD45E'; g.lineWidth = 4; for(let i = 0; i < KG.slots.length; i++) for(let j = i + 1; j < KG.slots.length; j++){ const [x1, y1] = pos[i], [x2, y2] = pos[j], L = Math.hypot(x2 - x1, y2 - y1), n = Math.max(6, Math.round(L / 10));
    g.beginPath(); for(let k = 0; k <= n; k++){ const f = k / n, w = Math.sin(f * Math.PI * 6 + t * 6) * 5 * Math.sin(f * Math.PI), nx = -(y2 - y1) / L, ny = (x2 - x1) / L; const x = x1 + (x2 - x1) * f + nx * w, y = y1 + (y2 - y1) * f + ny * w; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } g.restore(); }
  pos.forEach(([x, y], i) => { let k = KG.slots[i]; if(k && SCI_FX && KG.hold[i] && performance.now() < KG.hold[i]) k = null;   // the buddy is still carrying it
    if(!k){ g.beginPath(); g.arc(x, y, br, 0, Math.PI * 2); g.setLineDash([5, 5]); g.strokeStyle = i === KG.slots.length && KG.lv === 0 ? '#FFC845' : 'rgba(255,255,255,0.4)'; g.lineWidth = 2.5; g.stroke(); g.setLineDash([]); return; }
    g.save(); g.shadowColor = QCOL[i]; g.shadowBlur = 12; g.lineWidth = Math.max(4, br * 0.17); g.strokeStyle = QCOL[i]; g.beginPath(); g.arc(x, y, br + g.lineWidth * 0.6, 0, Math.PI * 2); g.stroke(); g.restore();   // colour charge = the ring
    AtomSkins.draw(g, x, y, br, k, QK[k].col, atomSkin(), t + i); });   // flavour = the ball (same colour as the kit + recipe)
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'top'; g.font = '900 ' + fs + 'px Nunito, sans-serif';
  const lines = [], tw = W;   // sc-2e: the sum + colour line moved to the header (#qk-sum)   // narrow: keep clear of the lab buddy
  if(W >= 520 && lines.length > 1) lines.splice(0, 2, lines.join(' · '));
  lines.forEach((ln, j) => { let f = fs; g.font = '900 ' + f + 'px Nunito, sans-serif'; while(f > 9 && g.measureText(ln).width > tw){ f--; g.font = '900 ' + f + 'px Nunito, sans-serif'; } g.fillText(ln, cx, cy + R + 4 + j * fs * 1.15); });
}

// ---------- 💥 Mini collider ----------
const TRK = {e: {i: '⚡', n: 'Electron', how: 'bends, stops in the 🟩 green ring'}, ph: {i: '💡', n: 'Photon', how: 'no line, stops in the 🟩 green ring'}, mu: {i: '🌀', n: 'Muon', how: 'bends, flies through EVERY ring'}, nu: {i: '👻', n: 'Neutrino', how: 'invisible — only missing energy'},
  z: {i: '🅩', n: 'Z boson', how: 'two muons flying apart'}, w: {i: '🅦', n: 'W boson', how: 'one muon + missing energy'}, h: {i: '✨', n: 'Higgs boson', how: 'two photons flying apart'}};
const RARE = ['c', 'b', 't', 'tau', 'vtau'];
let CLG = null, CLBUD = null, CL_RAF = 0;
const CLBAR = qBar('clbar', '💥', 'Mini collider', 'collide-level', () => CLG, () => { if(CLG) CLG.done = true; }, () => drawCol());
CLBAR.count('col', '💥', '1/5', 'Smash');
function colEvents(lv){ const base = lv === 0 ? ['e', 'ph', 'mu'] : ['e', 'ph', 'mu', 'nu'], sp = lv >= 3 ? ['z', 'w', 'h'] : [], out = [];
  for(let i = 0; i < 5; i++) out.push(sp.length && (i === 1 || i === 3 || (lv >= 4 && i === 4)) ? sp[Math.floor(Math.random() * sp.length)] : base[(i + Math.floor(Math.random() * 4)) % base.length]); return out; }
function startCollide(){
  stopCollide(); const lv = SET.level;
  CLG = {lv, list: colEvents(lv), i: 0, phase: 'aim', tries: 0, first: 0, score: 0, miss: 0, parts: [], t0: Date.now(), done: false, solved: false, q: 0, prog: 0, rare: null};
  hideResult(); labHand(null); showScreen('col'); CLBAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); CLBAR.score(0); CLBAR.miss(0); CLBAR.fit();
  CLBUD = qBuddy(CLBUD, 'col-buddy'); colNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'particle'); gcEmit('start', {game: 'collide'}); colLoop();
}
function stopCollide(){ if(CLG){ CLG.done = true; clearTimeout(CLG.tm); clearTimeout(CLG.gt); } if(CLBUD){ CLBUD.stop(); CLBUD = null; } cancelAnimationFrame(CL_RAF); }
function colZone(){ return [0.2, 0.16, 0.12, 0.1, 0.07, 0.06][CLG.lv]; }
function colNext(){
  if(!CLG || CLG.done) return; clearTimeout(CLG.tm); clearTimeout(CLG.gt); if(CLG.i >= CLG.list.length) return colEnd();
  CLG.phase = 'aim'; CLG.tries = 0; CLG.solved = false; CLG.prog = 0; CLG.rare = null; CLG.glowK = null; CLG.t0r = performance.now(); CLG.ang = Math.random() * 6; CLG.bend = Math.random() < 0.5 ? 1 : -1;
  CLBAR.count('col', '💥', (CLG.i + 1) + '/' + CLG.list.length, 'Smash');
  $('col-name').textContent = 'Smash two proton beams!'; $('col-need').textContent = 'Tap 💥 when the needle is in the green'; $('col-hint').textContent = CLG.lv === 0 ? '👆 A better smash = more energy = more particles' : '';
  $('col-msg').className = 'fm-msg'; $('col-msg').textContent = ''; $('col-legend').innerHTML = ''; $('col-opts').innerHTML = '';
  $('col-act').innerHTML = '<button class="sp-btn sp-primary sp-lg' + (CLG.lv === 0 ? ' glow-next' : '') + '" id="col-smash" data-sound="none">💥 Smash!</button>'; $('col-smash').onclick = () => colSmash();
  drawCol();
}
function colNeedle(){ const sp = [0.35, 0.45, 0.6, 0.7, 0.85, 1][CLG.lv], t = (performance.now() - CLG.t0r) / 1000 * sp; return SCI_FX ? Math.abs((t % 2) - 1) : 0.5; }
function colSmash(pos){
  if(!CLG || CLG.phase !== 'aim') return; const n = pos == null ? colNeedle() : pos, z = colZone(), off = Math.abs(n - 0.5);
  CLG.q = off <= z ? Math.round((1 - off / z * 0.4) * 100) / 100 : 0.3; CLG.phase = 'event'; CLG.prog = SCI_FX ? 0 : 1; UISound.play(CLG.q >= 0.6 ? 'success' : 'pop');
  const ev = CLG.list[CLG.i], lv = CLG.lv, sp = ev === 'z' || ev === 'w' || ev === 'h';
  $('col-name').textContent = sp ? 'These came out together — what made them?' : 'What made this track?'; $('col-need').textContent = (CLG.q >= 0.6 ? '💥 Great smash! ' : '💨 Weak smash — still worked! ') + 'Energy ' + Math.round(CLG.q * 100) + ' %';
  $('col-hint').textContent = lv <= 1 ? 'Look where the track starts, bends and stops' : '';
  $('col-legend').innerHTML = lv <= 1 ? ['e', 'ph', 'mu'].concat(lv ? ['nu'] : []).map(k => '<span style="background:#fff">' + TRK[k].i + ' ' + TRK[k].n + ': ' + TRK[k].how + '</span>').join('') : '';
  colRender();
  if(lv === 0) CLG.gt = setTimeout(() => { if(CLG && !CLG.solved){ CLG.glowK = ev; colRender(); } }, 6000 * SCI_FX);
  if(lv === 5) CLG.tm = setTimeout(() => { if(CLG && !CLG.done && !CLG.solved){ CLG.miss++; CLBAR.miss(CLG.miss); UISound.play('error'); colAnswer('⏱️ Time! '); } }, 15000);
}
function colOpts(){ const ev = CLG.list[CLG.i]; return ev === 'z' || ev === 'w' || ev === 'h' ? ['z', 'w', 'h'] : CLG.lv === 0 ? ['e', 'ph', 'mu'] : ['e', 'ph', 'mu', 'nu']; }
function colRender(){
  const ev = CLG.list[CLG.i];
  $('col-opts').innerHTML = colOpts().map(k => '<button data-k="' + k + '" data-sound="tap" class="' + (k === CLG.glowK && !CLG.solved ? 'kglow' : '') + (CLG.solved ? (k === ev ? ' yes' : k === CLG.picked ? ' no' : '') : '') + '"' + (CLG.solved ? ' disabled' : '') + '><i>' + TRK[k].i + '</i>' + TRK[k].n + '</button>').join('');
  $('col-opts').querySelectorAll('button').forEach(b => b.onclick = () => colPick(b.dataset.k));
  $('col-act').innerHTML = CLG.solved ? '<button class="sp-btn sp-primary sp-lg" id="col-next" data-sound="pop">' + (CLG.i + 1 < CLG.list.length ? 'Next smash ▶' : '📋 Finish') + '</button>' : '';
  if($('col-next')) $('col-next').onclick = () => { if(!CLG || !CLG.solved) return; CLG.i++; colNext(); };
  drawCol();
}
const COL_PARTS = {e: ['e'], ph: ['ph'], mu: ['mu'], nu: ['ve'], z: ['z', 'mu'], w: ['w', 'mu', 'vmu'], h: ['h', 'ph']};
function colPick(k){
  if(!CLG || CLG.solved || CLG.phase !== 'event') return; const ev = CLG.list[CLG.i], lv = CLG.lv; CLG.picked = k;
  if(k === ev){ const pts = qPts(CLG.tries) + Math.round(CLG.q * 20); CLG.score += pts; if(CLG.tries === 0) CLG.first++; CLG.solved = true; clearTimeout(CLG.tm); clearTimeout(CLG.gt);
    COL_PARTS[ev].forEach(p => { if(CLG.parts.indexOf(p) < 0) CLG.parts.push(p); });
    let extra = ''; if(lv >= 2 && CLG.q >= 0.8){ const left = RARE.filter(r => !partGot(r) && CLG.parts.indexOf(r) < 0), r = (left.length ? left : RARE)[Math.floor(Math.random() * (left.length || RARE.length))]; CLG.rare = r; if(CLG.parts.indexOf(r) < 0) CLG.parts.push(r); extra = ' ✨ Discovery: a ' + PBY[r][2] + ' (' + PBY[r][1] + ') popped out too!'; }
    UISound.play('success'); if(CLBUD) CLBUD.react('joy'); CLBAR.score(Math.round(CLG.score * SCI_MULT(lv)));
    $('col-msg').className = 'fm-msg ok'; $('col-msg').textContent = '✅ ' + TRK[ev].i + ' ' + TRK[ev].n + ' — ' + TRK[ev].how + '. +' + pts + extra; colRender(); gcEmit('right', {ev, rare: CLG.rare}); return; }
  CLG.tries++; CLG.miss++; CLBAR.miss(CLG.miss); UISound.play('error'); if(CLBUD) CLBUD.react('miss'); gcEmit('wrong', {ev});
  if(lv === 5) return colAnswer('❌ ');
  if(lv <= 2 && CLG.tries >= 2) CLG.glowK = ev;
  $('col-msg').className = 'fm-msg'; $('col-msg').textContent = '🤔 A ' + TRK[k].n.toLowerCase() + ' would show: ' + TRK[k].how + '. Look again!'; colRender();
}
function colAnswer(pre){ const ev = CLG.list[CLG.i]; CLG.solved = true; clearTimeout(CLG.gt); $('col-msg').className = 'fm-msg'; $('col-msg').textContent = pre + 'It was a ' + TRK[ev].n + ': ' + TRK[ev].how + '.'; colRender(); }
function colEnd(){ CLG.done = true; const res = {found: [], built: [], parts: CLG.parts.slice(), right: CLG.first, total: CLG.list.length, score: Math.round(CLG.score * SCI_MULT(CLG.lv)), stars: qStars(CLG.first, CLG.list.length), timeSec: Math.round((Date.now() - CLG.t0) / 1000)}; stopCollide(); chemSave('collide', res); }
function colLoop(){ cancelAnimationFrame(CL_RAF); if(!CLG || CLG.done) return; if(CLG.phase === 'event' && CLG.prog < 1) CLG.prog = Math.min(1, CLG.prog + 0.03); drawCol(); if(SCI_FX) CL_RAF = requestAnimationFrame(colLoop); }
// ⚖️ sc-2f: room for the power bar left of the buddy (centred, so both ends stay clear)
function colBarRoom(cv, cx, H){ const b = cv.parentElement && cv.parentElement.querySelector('canvas.qbud'); if(!b || !b.offsetParent) return 1e9;
  const c = cv.getBoundingClientRect(), r = b.getBoundingClientRect(); if(r.top > c.top + H - 8 || r.bottom < c.top + H - 40) return 1e9;
  return Math.max(160, 2 * (r.left - c.left - cx) - 16); }
function drawCol(){
  const cv = $('col-cv'); if(!cv || !CLG) return; const F = canvasFit(cv); if(!F) return; const {g, W, H} = F, cx = W / 2, fs = Math.max(11, Math.min(17, H * 0.06));
  if(CLG.phase === 'aim'){
    const R = Math.min(W * 0.4, (H - 50) * 0.45), cy = (H - 44) / 2 + 4, t = SCI_FX ? performance.now() / 1000 : 0;
    g.lineWidth = Math.max(6, R * 0.1); g.strokeStyle = 'rgba(126,219,196,0.35)'; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#fff'; g.font = '900 ' + fs + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🔵 ⟳ ring ⟲ 🔴', cx, cy);
    [[1, '#4C8DFF'], [-1, '#FF5A5F']].forEach(([d, col]) => { for(let k = 0; k < 6; k++){ const a = d * t * 2.4 - d * k * 0.09 + (d < 0 ? Math.PI : 0); g.globalAlpha = 1 - k * 0.15; g.fillStyle = col; g.beginPath(); g.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, Math.max(4, R * 0.07) * (1 - k * 0.1), 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; });
    const bw = Math.min(W - 20, 420, colBarRoom(cv, cx, H)), bx = cx - bw / 2, by = H - 30, z = colZone(), n = colNeedle();
    g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(bx, by, bw, 16); g.fillStyle = '#22C3A1'; g.fillRect(bx + bw * (0.5 - z), by, bw * z * 2, 16);
    g.fillStyle = '#FFE08A'; g.fillRect(bx + bw * n - 3, by - 6, 6, 28);
    return;
  }
  // detector: tracker (inner) · 🟩 calorimeter · 🟧 muon chambers (outer)
  const cy = H / 2, R = Math.min(W, H) * 0.46, r1 = R * 0.42, r2 = R * 0.66, ev = CLG.list[CLG.i], p = CLG.prog;
  [[R, 'rgba(242,169,59,0.25)'], [r2, 'rgba(61,220,132,0.25)'], [r1, 'rgba(158,216,247,0.18)']].forEach(([rr, col]) => { g.fillStyle = col; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.fill(); });
  g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,0.3)'; [R, r2, r1].forEach(rr => { g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.stroke(); });
  g.fillStyle = '#FFE08A'; g.beginPath(); g.arc(cx, cy, 6, 0, Math.PI * 2); g.fill();
  const track = (a, bend, to, kind) => { const steps = 40, end = Math.max(1, Math.round(steps * p)); let x = cx, y = cy, ang = a, last = [x, y]; g.lineWidth = 3.5; g.lineCap = 'round';
    g.strokeStyle = kind === 'ph' ? '#FFE08A' : kind === 'mu' ? '#FF7EB6' : '#7FD3FF'; g.setLineDash(kind === 'ph' ? [4, 7] : []); g.beginPath(); g.moveTo(x, y);
    for(let k = 1; k <= end; k++){ const d = to / steps; ang += kind === 'ph' ? 0 : bend * 0.018 * (kind === 'mu' ? 0.6 : 1.2); x += Math.cos(ang) * d; y += Math.sin(ang) * d; g.lineTo(x, y); last = [x, y]; } g.stroke(); g.setLineDash([]);
    if(p >= 1 && (kind === 'e' || kind === 'ph')){ g.fillStyle = 'rgba(61,220,132,0.9)'; for(let k = 0; k < 7; k++){ g.beginPath(); g.arc(last[0] + Math.cos(k) * 6, last[1] + Math.sin(k * 1.7) * 6, 4, 0, Math.PI * 2); g.fill(); } } };
  const miss = a => { if(p < 1) return; const x2 = cx + Math.cos(a) * R * 0.9, y2 = cy + Math.sin(a) * R * 0.9; g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 2.5; g.setLineDash([9, 7]); g.beginPath(); g.moveTo(cx, cy); g.lineTo(x2, y2); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#fff'; g.font = '900 ' + fs + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('? missing', x2, y2 - fs); };
  const a = CLG.ang, b = CLG.bend;
  if(ev === 'e') track(a, b, (r1 + r2) / 2, 'e'); else if(ev === 'ph') track(a, 0, (r1 + r2) / 2, 'ph'); else if(ev === 'mu') track(a, b, R * 1.15, 'mu'); else if(ev === 'nu') miss(a);
  else if(ev === 'z'){ track(a, b, R * 1.15, 'mu'); track(a + Math.PI, -b, R * 1.15, 'mu'); } else if(ev === 'w'){ track(a, b, R * 1.15, 'mu'); miss(a + Math.PI * 0.9); } else if(ev === 'h'){ track(a, 0, (r1 + r2) / 2, 'ph'); track(a + Math.PI, 0, (r1 + r2) / 2, 'ph'); }
  if(CLG.lv <= 1){ g.fillStyle = 'rgba(255,255,255,0.8)'; g.font = '800 ' + Math.round(fs * 0.8) + 'px Nunito, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'top'; ['🟦 tracker', '🟩 energy catcher', '🟧 muon catcher'].forEach((t, i) => g.fillText(t, 6, 6 + i * fs)); }
}

/* ================= ✨ sc-2e: header helpers + 🧑 helper buddy carry ================= */
function qkBadge(T){ const ch = qCharge(T.q.split('')), col = ch > 0 ? 'linear-gradient(135deg,#FF6FB5,#C04BFF)' : ch < 0 ? 'linear-gradient(135deg,#5BA8FF,#7B4BFF)' : 'linear-gradient(135deg,#B9B4D6,#7A7499)';
  return '<span class="pbadge" style="background:' + col + '">' + (T.k === 'p' ? 'p' : T.k === 'n' ? 'n' : T.icon) + '</span>'; }
function qkRecipe(T, lv){ const q = T.q.split('');
  if(lv <= 0) return '<span class="recipe">' + q.map(k => '<span class="qc" style="background:' + QK[k].col + '">' + k + '</span>').join('<span class="pl">+</span>') + '</span>';
  return '<span class="recipe">' + q.map(() => '<span class="qc q">?</span>').join('<span class="pl">+</span>') + '</span>'; }
function qkSlotXY(i){ const cv = $('qk-cv'); if(!cv) return null; const r = cv.getBoundingClientRect(), R = Math.min(r.width * 0.44, r.height * 0.46), a = -Math.PI / 2 + i * Math.PI * 2 / 3;
  return [r.left + r.width / 2 + Math.cos(a) * R * 0.48, r.top + r.height / 2 + Math.sin(a) * R * 0.48]; }
function centreXY(id, fy){ const el = $(id); if(!el) return null; const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height * (fy == null ? 0.5 : fy)]; }
// 🧑 the lab buddy carries a piece: kit → buddy's hands → walks to the spot → puts it in → walks home. Pure looks: the game state is already updated.
function labCarry(bud, cv, fromEl, toFn, img, onHold){
  if(!SCI_FX || !cv || !fromEl || !img || !cv.animate) return; const to = toFn && toFn(); if(!to) return;
  const f = fromEl.getBoundingClientRect(), b = cv.getBoundingClientRect(); if(!b.width) return;
  const sz = Math.max(34, Math.min(72, b.width * 0.5)), home = [b.left + b.width * 0.3, b.top + b.height * 0.55];
  const card = cv.parentElement.getBoundingClientRect(), stand = [Math.max(card.left + b.width * 0.5, Math.min(card.right - b.width * 0.5, to[0] + b.width * 0.45)), Math.max(card.top + b.height * 0.5, Math.min(card.bottom - b.height * 0.5, to[1] + b.height * 0.1))];
  const dx = stand[0] - (b.left + b.width / 2), dy = stand[1] - (b.top + b.height / 2), T = 1100, place = 0.72;
  try{ cv.animate([{transform: 'translate(0,0)'}, {transform: 'translate(0,-6px) rotate(-4deg)', offset: 0.3}, {transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(3deg)', offset: place}, {transform: 'translate(' + dx + 'px,' + dy + 'px)', offset: 0.8}, {transform: 'translate(0,0)'}], {duration: T, easing: 'ease-in-out'}); }catch(e){}
  const el = document.createElement('img'); el.className = 'lab-carry'; el.src = img; el.style.width = el.style.height = sz + 'px'; document.body.appendChild(el);
  const P = (x, y, s) => 'translate(' + (x - sz / 2) + 'px,' + (y - sz / 2) + 'px) scale(' + (s || 1) + ')', hand = [home[0] + dx, home[1] + dy];
  const a = el.animate([{transform: P(f.left + f.width / 2, f.top + f.height / 2, 0.6), opacity: 1}, {transform: P(home[0], home[1] - 10, 1.1), opacity: 1, offset: 0.3}, {transform: P(hand[0] - b.width * 0.15, hand[1] - 10, 1.05), opacity: 1, offset: place - 0.04}, {transform: P(to[0], to[1], 1), opacity: 1, offset: place}, {transform: P(to[0], to[1], 0.9), opacity: 0, offset: place + 0.06}, {transform: P(to[0], to[1], 0.9), opacity: 0}], {duration: T, easing: 'ease-in-out'});
  a.onfinish = () => el.remove(); setTimeout(() => el.remove(), T + 300);
  if(onHold) onHold(T * place); setTimeout(() => { try{ if(bud) bud.react('happy', 900); UISound.play('pop'); }catch(e){} }, T * place);
}

/* ================= SAVE QUEUE + NAV ================= */
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goBack(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }
function pauseGame(){ if(G) G.held = true; }
window.feedbackContext = () => ({page: 'Sciencetory', game: GAME_ID, level: G ? G.lv : SET.level, mode: SET.sec, test: SET.test});
window.addEventListener('resize', () => { if(G && !$('scr-play').classList.contains('hidden')) resize(); chemResize(); if(AG && !$('scr-atom').classList.contains('hidden')) drawAtomNow(); if(WG && !$('scr-glow').classList.contains('hidden')) drawGlow(); if(CG && !$('scr-cat').classList.contains('hidden')) layoutCats(); if(LG && !$('scr-led').classList.contains('hidden')) ledPlace(); if(XG && !$('scr-exp').classList.contains('hidden')) drawBench(); if(KG && !$('scr-qk').classList.contains('hidden')) drawQk(); if(CLG && !$('scr-col').classList.contains('hidden')) drawCol(); if(!$('scr-pzoo').classList.contains('hidden')) renderZoo(); });
(function(){   // 📱 ls-1b OWN SIDEWAYS GUARD (✨ polish chat): iPhone sideways can skip the last 'resize' → watch the play box itself
  if(!window.ResizeObserver) return;
  const box = id => { const e = document.getElementById(id); return e ? e.clientWidth + 'x' + e.clientHeight : '-'; };
  const watch = (scr, boxes, ok, run) => { let last = null, n = 0, t0 = 0, later = 0;
    const check = () => { const s = document.getElementById(scr);
      if(!s || s.classList.contains('hidden') || !ok()){ last = null; return; }          // only while that screen is open
      const k = [scr].concat(boxes).map(box).join('|'); if(k === last) return;                          // same size → nothing (no loops)
      const now = Date.now(); if(now - t0 > 1000){ t0 = now; n = 0; }
      if(++n > 4){ if(!later) later = setTimeout(() => { later = 0; check(); }, 1000); return; }   // safety net: ≤ 4 runs a second
      last = k; const R = window.LS1B_RUNS || (window.LS1B_RUNS = {}); R[scr] = (R[scr] || 0) + 1;   // run count per screen (tests + device checks)
      try{ run(); }catch(e){ if(window.console) console.warn('ls-1b', scr, e); } };
    const ro = new ResizeObserver(check); [scr].concat(boxes).forEach(id => { const e = document.getElementById(id); if(e) ro.observe(e); }); };
  watch('scr-play', [], () => !!G, () => resize());                 // ⚙️ the test rig
  ['scr-hunt', 'scr-table', 'scr-formula'].forEach(s => watch(s, [], () => true, () => chemResize()));   // ⚗️ chemistry
  watch('scr-atom', [], () => !!AG, () => drawAtomNow());
  watch('scr-glow', [], () => !!WG, () => drawGlow());
  watch('scr-cat', [], () => !!CG, () => layoutCats());
  watch('scr-led', [], () => !!LG, () => ledPlace());
  watch('scr-exp', [], () => !!XG, () => drawBench());
  watch('scr-qk', [], () => !!KG, () => drawQk());
  watch('scr-col', [], () => !!CLG, () => drawCol());
  watch('scr-pzoo', [], () => true, () => renderZoo());
})();   // 📱 ls-1b END
function huntClueOff(){ const cl = $('hunt-clue'); if(cl){ cl.classList.remove('ingap'); cl.removeAttribute('style'); } }

/* ================= BOOT ================= */
function boot(){
  UI.loading('sciencetory');
  google.script.run.withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {};
      S.things = d.things || []; S.sci = d.sci || {t: {}}; S.fam = d.fam || {}; if(d.chem) CHEM = d.chem; S.atomSkins = d.atomSkins || 0; S.meta = d.meta || null; S.loadedFor = d.player || '';
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)){ S.player = ''; choosePlayer(CURRENT_PLAYER); } else { renderPlayers(); showScreen('player'); }
      /* 🔬 sc-7: first-visit help = the cover's 📖 How to play */
    }).withFailureHandler(() => { UI.loaded(); UI.toast('Could not load the lab — check the connection', 'err'); renderPlayers(); showScreen('player'); })
    .getSciencetoryData(CURRENT_PLAYER);
}
/* ================= 🔥 ⚡ 🌈 🔊 SC-3 LAB ENGINE (sc-3a) =================
   One hub screen (#scr-shub) + one play screen (#scr-l3) for every SC-3 lab game (🔥 Thermo now; ⚡ Electro · 🌈 Optics · 🔊 Acoustics next).
   A game = ACT3[kind] = {sec, icon, name, sub, eye, count, make(lv) → rounds, setup(T), draw(g, W, H, T), step(dt)? (dt 0 = jump to the end)}.
   Answers go through l3Right(msg) / l3Wrong(msg, final). Saves through sciChemSave (kinds therm · melt · warm · flow) → the shared result card.
   Kid-safe facts only (°C rounded, "about" where it varies). */
var THERMO_LVL = [['🌡️ tens + guides', 'The next tap glows · °C in tens · 2 cups'], ['5️⃣ fives', 'Steps of 5 · read it · 3 cups'], ['🔍 read it', 'Steps of 2 · no numbers on melt cards · lids'],
  ['🇺🇸 °F too', 'The °F side · what melts in the oven · cold drinks'], ['🎯 exact', 'Steps of 1 · close answers · 4 cups'], ['💀 no hints', 'Fewer numbers · 20 s a question']];
const SEC3 = {
  thermo: {icon: '🔥', name: 'Thermo', acc: 'acc-t', g: 4, lvl: THERMO_LVL, acts: ['therm', 'melt', 'warm', 'flow'], fx: ['🔥', '⭐', '🌡️', '🧊'],
    count: () => '<span>🔥 ' + (CHEM.trounds || 0) + ' heat experiments</span><span>📇 ' + CHEM.all.length + ' / 118 element cards</span>'}
};
const SEC3_BY_G = {}; Object.keys(SEC3).forEach(k => { SEC3_BY_G[SEC3[k].g] = Object.assign({k}, SEC3[k]); });
function SEC3G(g){ return SEC3_BY_G[g] || SEC3_BY_G[4]; }
const ACT3 = {};
var L3RECAP = '';
NAV_INNER.shub = ['◀ Sciencetory', () => { renderMenu(); showScreen('menu'); }];

// ---------- hub ----------
function openSec3(lv){
  SET.level = lv; const C = SEC3[SET.sec] || SEC3.thermo, U = LEVEL_UI[lv];
  $('scr-shub').className = 'screen hidden ' + C.acc;
  $('shub-logo').textContent = C.icon; $('shub-h1').textContent = C.name + ' lab'; $('shub-sub').textContent = U.emoji + ' ' + U.name + ' · ' + C.lvl[lv][0];
  $('shub-count').innerHTML = C.count();
  $('shub-hub').innerHTML = C.acts.map((k, i) => { const A = ACT3[k]; return '<button class="pick" data-g="' + k + '" data-sound="pop" style="animation:sc-pop .4s ' + (i * 0.08) + 's both"><div class="big">' + A.icon + '</div><div class="nm">' + A.name + '</div><div class="sub">' + A.sub + '</div></button>'; }).join('');
  $('shub-hub').insertAdjacentHTML('beforeend', myTestCard(SET.sec));   // 🧪 sc-4d
  $('shub-hub').querySelectorAll('[data-g]').forEach(b => b.onclick = () => startL3(b.dataset.g)); $('shub-hub').querySelectorAll('[data-mt]').forEach(b => b.onclick = () => openMyTest(b.dataset.mt));
  showScreen('shub');
  if(lv === 0) setTimeout(() => { if(!$('scr-shub').classList.contains('hidden')){ const b = $('shub-hub').querySelector('[data-g]'); if(b){ b.classList.add('glow-next'); labHand(b); } } }, 400 * SCI_FX);
}
function leaveSec3(toLevels){ stopL3(); hideResult(); labHand(null); if(SET.sec === 'machines'){ SET.sec = 'mechanic'; if(toLevels){ renderMenu(); showScreen('menu'); } else openLevel(SET.level); return; }   /* ⚙️ sc-4d2: Lift it! lives in the Mechanic lab */
  if(toLevels){ renderMenu(); showScreen('menu'); } else openSec3(SET.level); }

// ---------- play ----------
let L3 = null, L3BUD = null, L3_RAF = 0; const L3BARS = {};
function l3Bar(k){
  if(L3BARS[k]) return L3BARS[k]; const A = ACT3[k], d = document.createElement('div'); d.className = 'hud'; d.id = 'l3bar-' + k;
  $('scr-l3').insertBefore(d, $('scr-l3').querySelector('.am'));
  const b = UI.gameBar(d, {game: GAME_ID, icon: A.icon, name: A.name, levelId: k + '-level', levels: () => leaveSec3(true), playing: () => !!(L3 && !L3.done), onLeave: () => stopL3(), scoreMin: '5ch', onFit: () => l3Draw()});
  b.score(0); b.miss(0); b.count(k, A.icon, '1/5', A.count); b.box = d; return (L3BARS[k] = b);
}
function startL3(k){
  stopL3(); const A = ACT3[k], lv = SET.level, C = SEC3[A.sec]; SET.sec = A.sec;
  L3 = {k, A, lv, list: A.make(lv), i: 0, tries: 0, first: 0, score: 0, miss: 0, found: [], recap: [], t0: Date.now(), done: false, solved: false, T: null};
  $('scr-l3').className = 'hidden play2 ' + C.acc + (typeof C.glass === 'string' ? ' glx' : '');   /* ✨ sc-5b1 */
  Object.keys(L3BARS).forEach(x => { L3BARS[x].box.style.display = 'none'; }); const B = l3Bar(k); B.box.style.display = '';
  hideResult(); labHand(null); showScreen('l3'); B.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); B.score(0); B.miss(0); B.fit();
  $('l3-eye').textContent = A.eye;
  L3BUD = qBuddy(L3BUD, 'l3-bud'); l3Next(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, C.mode || A.sec); gcEmit('start', {game: k}); l3Loop();
}
function stopL3(){ if(L3){ L3.done = true; clearTimeout(L3.tm); clearTimeout(L3.gt); clearTimeout(L3.rt); } cancelAnimationFrame(L3_RAF); if(L3BUD){ L3BUD.stop(); L3BUD = null; } }
function l3Next(){
  if(!L3 || L3.done) return; clearTimeout(L3.tm); clearTimeout(L3.gt); clearTimeout(L3.rt); labHand(null);
  if(L3.i >= L3.list.length) return l3End();
  const T = L3.list[L3.i]; L3.T = T; L3.tries = 0; L3.solved = false;
  l3Bar(L3.k).count(L3.k, L3.A.icon, (L3.i + 1) + '/' + L3.list.length, L3.A.count); l3Trip();
  l3Msg('', ''); $('l3-pick').classList.remove('done'); L3.A.setup(T); l3Act(); l3Draw();
  if(L3.lv === 5) L3.tm = setTimeout(() => { if(L3 && !L3.done && !L3.solved && !L3.busy) l3Wrong('⏱️ Time! ', true); }, 20000);
}
function l3Msg(t, cls){ const m = $('l3-msg'); m.className = 'fm-msg' + (cls ? ' ' + cls : ''); m.innerHTML = t; }
function l3Head(name, need, hint){ $('l3-name').innerHTML = name; $('l3-need').innerHTML = need || ''; $('l3-hint').innerHTML = hint || ''; }
function l3Pick(html, wire){ const p = $('l3-pick'); p.innerHTML = html; if(wire) wire(p); }
function l3Glow(el, later){ if(!el || !L3) return; const go = () => { if(!L3 || L3.solved || L3.done || !el.isConnected) return; document.querySelectorAll('#l3-pick .glow-next').forEach(x => x.classList.remove('glow-next')); el.classList.add('glow-next'); labHand(el); };
  clearTimeout(L3.gt); if(later) L3.gt = setTimeout(go, later * SCI_FX); else go(); }
function l3Right(msg, opt){
  if(!L3 || L3.solved) return; opt = opt || {}; const pts = opt.pts != null ? opt.pts : qPts(L3.tries); L3.score += pts; if(L3.tries === 0) L3.first++; L3.solved = true;
  clearTimeout(L3.tm); clearTimeout(L3.gt); labHand(null); (opt.found || []).forEach(n => { if(L3.found.indexOf(n) < 0) L3.found.push(n); }); if(opt.recap) L3.recap.push(opt.recap);
  UISound.play('success'); if(L3BUD) L3BUD.react('joy'); l3Bar(L3.k).score(Math.round(L3.score * SCI_MULT(L3.lv)));
  l3Say('ok', msg, pts); $('l3-pick').classList.add('done'); l3Act(); l3Draw(); gcEmit('right', {game: L3.k});
}
function l3Wrong(msg, final){
  if(!L3 || L3.solved) return; L3.tries++; L3.miss++; l3Bar(L3.k).miss(L3.miss); UISound.play('error'); if(L3BUD) L3BUD.react('miss'); gcEmit('wrong', {game: L3.k});
  if(final || L3.lv === 5){ L3.solved = true; clearTimeout(L3.tm); clearTimeout(L3.gt); labHand(null); const r = L3.A.reveal ? L3.A.reveal(L3.T) : ''; l3Say('end', (final === true && msg.indexOf('⏱️') === 0 ? msg : '❌ ' + msg) + (r ? ' ' + r : '')); $('l3-pick').classList.add('done'); l3Act(); l3Draw(); return; }
  l3Say('try', msg); l3Draw();
}
function l3Act(){ const a = $('l3-act'); a.innerHTML = L3 && L3.solved ? '<button class="sp-btn sp-primary sp-lg" id="l3-next" data-sound="pop">' + (L3.i + 1 < L3.list.length ? 'Next ▶' : '📋 Finish') + '</button>' : '';
  if($('l3-next')) $('l3-next').onclick = () => { if(!L3 || !L3.solved) return; L3.i++; l3Next(); }; }
function l3Draw(){ if(!L3 || !L3.T) return; if(!SCI_FX && L3.A.step) L3.A.step(0); const cv = $('l3-cv'); if(!cv) return; const F = canvasFit(cv); if(!F) return; window.L3GLOW = (SEC3[L3.A.sec] || {}).glass || false; if(typeof window.L3GLOW === 'string') glxText(F.g); try{ L3.A.draw(F.g, F.W, F.H, L3.T); } finally { window.L3GLOW = false; } }   /* ✨ sc-5a */
function l3Loop(){ cancelAnimationFrame(L3_RAF); if(!L3 || L3.done) return; const now = performance.now(), dt = L3.lastT ? Math.min(0.1, (now - L3.lastT) / 1000) : 0.016; L3.lastT = now;
  if(L3.A.step) L3.A.step(dt); l3Draw(); if(SCI_FX) L3_RAF = requestAnimationFrame(l3Loop); }
function l3End(){ L3.done = true; L3RECAP = L3.recap.slice(-3).join('<br>');
  const res = {learn: (L3.learn || []).slice(), found: L3.found.slice(), built: [], right: L3.first, total: L3.list.length, score: Math.round(L3.score * SCI_MULT(L3.lv)), stars: qStars(L3.first, L3.list.length), timeSec: Math.round((Date.now() - L3.t0) / 1000)};
  const k = L3.k; stopL3(); chemSave(k, res); }
if(window.ResizeObserver){ const ro3 = new ResizeObserver(() => { if(L3 && !$('scr-l3').classList.contains('hidden')) l3Draw(); }); setTimeout(() => { if($('l3-cv')) ro3.observe($('l3-cv')); }, 0); }
window.addEventListener('resize', () => { if(L3 && !$('scr-l3').classList.contains('hidden')) l3Draw(); });

// ---------- drawing helpers ----------
function rr3(g, x, y, w, h, r){ r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function t3Col(t){ return t <= 20 ? hexLerp('#3FA9FF', '#9FD8C8', (t + 20) / 40) : t <= 60 ? hexLerp('#9FD8C8', '#FFA53C', (t - 20) / 40) : hexLerp('#FFA53C', '#FF3B30', (t - 60) / 40); }
function cToF(c){ return Math.round(c * 9 / 5 + 32); }
function fTxt(c){ return c === 37 ? '98.6' : String(cToF(c)); }
function f3(g, w, size){ g.font = (w || 900) + ' ' + Math.round(size) + 'px Nunito, sans-serif'; }
const EMO3 = {};
function emojiUrl(e){ if(EMO3[e]) return EMO3[e]; const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.font = '72px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, 48, 54); return (EMO3[e] = c.toDataURL()); }
function l3BudBox(){ const b = $('l3-bud'), c = $('l3-cv'); if(!b || !c || !b.offsetParent) return null; const B = b.getBoundingClientRect(), C = c.getBoundingClientRect(); return {x: B.left - C.left, y: B.top - C.top, w: B.width, h: B.height}; }
function cvXY(x, y){ const r = $('l3-cv').getBoundingClientRect(); return [r.left + x, r.top + y]; }
// a thermometer: centre x, top y, height h; o = {lo, hi, val, tick, lab, f, tw, nums} → returns Y(t)
function drawTherm(g, cx, y0, h, o){
  const tw = o.tw, br = tw * 0.95, yb = y0 + h - br, ytop = y0 + tw * 0.6, ybot = yb - br * 0.95, Y = t => ybot - (t - o.lo) / (o.hi - o.lo) * (ybot - ytop), fs = Math.max(11, Math.min(17, tw * 0.5));
  g.fillStyle = 'rgba(255,255,255,0.13)'; g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 3; rr3(g, cx - tw / 2, y0, tw, h - br * 1.2, tw / 2); g.fill(); g.stroke();
  g.beginPath(); g.arc(cx, yb, br, 0, Math.PI * 2); g.fill(); g.stroke();
  const v = Math.max(o.lo - 2, Math.min(o.hi + 1, o.val)), lq = '#FF4D4D'; g.fillStyle = lq; g.shadowColor = 'rgba(255,80,80,0.7)'; g.shadowBlur = 10;
  rr3(g, cx - tw * 0.2, Y(v), tw * 0.4, yb - Y(v), tw * 0.2); g.fill(); g.beginPath(); g.arc(cx, yb, br * 0.72, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.arc(cx - br * 0.3, yb - br * 0.3, br * 0.18, 0, Math.PI * 2); g.fill();
  f3(g, 800, fs); g.textBaseline = 'middle';
  for(let t = o.lo; t <= o.hi + 0.01; t += o.tick){ const y = Y(t), big = Math.round(t) % o.lab === 0; g.strokeStyle = 'rgba(255,255,255,' + (big ? 0.95 : 0.45) + ')'; g.lineWidth = big ? 2.5 : 1.2;
    g.beginPath(); g.moveTo(cx - tw / 2 - (big ? 16 : 8), y); g.lineTo(cx - tw / 2 - 3, y); g.stroke();
    if(big && o.nums !== false){ g.fillStyle = '#fff'; g.textAlign = 'right'; g.fillText(Math.round(t) + '°C', cx - tw / 2 - 20, y); } }
  if(o.f){ g.fillStyle = '#FFD98A'; g.textAlign = 'left';
    for(let F = Math.ceil(cToF(o.lo) / 20) * 20; F <= cToF(o.hi); F += 20){ const y = Y((F - 32) * 5 / 9); g.strokeStyle = 'rgba(255,217,138,0.9)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + tw / 2 + 3, y); g.lineTo(cx + tw / 2 + 14, y); g.stroke(); if(o.nums !== false) g.fillText(F + '°F', cx + tw / 2 + 18, y); } }
  return Y;
}

/* ---------- 🌡️ Thermometer ---------- */
const THINGS_T = [[-20, '🏔️', 'a snowy mountain top'], [-10, '⛄', 'a snowy day'], [0, '🧊', 'ice water'], [5, '🥛', 'inside the fridge'], [10, '🌬️', 'a chilly morning'], [15, '🌧️', 'a cool rainy day'], [20, '🏠', 'a comfy room'],
  [25, '🌳', 'a warm day in the shade'], [30, '☀️', 'a hot sunny day'], [35, '🧈', 'butter going soft'], [37, '🧍', 'your body'], [40, '🛁', 'a warm bath'], [50, '🍵', 'warm tea'], [60, '🕯️', 'candle wax melting'], [70, '☕', 'hot cocoa'], [100, '🫖', 'boiling water']];
const TH_STEP = [10, 5, 2, 1, 1, 1], TH_F_OK = [-10, 0, 10, 20, 25, 30, 37, 40, 100];
function cap3(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
function choices3(right, wrong, n){ const out = [right]; wrong.forEach(w => { if(out.length < n && out.indexOf(w) < 0) out.push(w); }); return shuffle(out); }
/* 📏 s2b thermo#1 → SciLab_thermo.html */
/* ================= 🔥 END SC-3 LAB ENGINE (sc-3a) ================= */
/* ================= ⚡ SC-3 ELECTRO (sc-3b) =================
   4 games on the SC-3 lab engine: 💡 Circuits · 🔌 Conductor or insulator · 🧲 Magnetic? · 🌀 Electromagnet.
   Kid-safe: small batteries only (never wall plugs). Saves through sciChemSave kinds circ · cond · mag · emag. */
var ELECTRO_LVL = [['💡 loops + guides', 'The next tap glows · one bulb · easy things'], ['🔌 switches', 'Switches · more things to test · switch the magnet off'], ['🔦 two bulbs', 'Bulbs in a row · magnet poles'],
  ['🔋 more power', 'Side-by-side bulbs · 2 batteries · fewer coils'], ['🎯 surprises', 'Tricky metals · lift EXACTLY the clips'], ['💀 no hints', '20 s a question · one try']];
SEC3.electro = {icon: '⚡', name: 'Electro', acc: 'acc-e', g: 5, lvl: ELECTRO_LVL, acts: ['circ', 'cond', 'mag', 'emag'], fx: ['⚡', '⭐', '💡', '🧲'],
  count: () => '<span>⚡ ' + (CHEM.erounds || 0) + ' electric experiments</span><span>📇 ' + CHEM.all.length + ' / 118 element cards</span>'};
SEC3_BY_G[5] = Object.assign({k: 'electro'}, SEC3.electro);
/* 📏 s2b electro#1 → SciLab_electro.html */
/* ================= ⚡ END SC-3 ELECTRO (sc-3b) ================= */
/* ================= 🌈 SC-3 OPTICS (sc-3c) =================
   4 games on the SC-3 lab engine: 🌈 Prism rainbow · 🎨 Light vs paint · 🪞 Mirror maze · 🔍 Magnifier.
   Kid-safe: never look at the Sun through a lens or prism. Saves through sciChemSave kinds prism · mixc · mirror · lens. */
var OPTICS_LVL = [['🌈 4 colours + guides', 'The next tap glows · live beam · easy mixes'], ['🌈 5 colours', 'Which colour bends most · 2 mirrors'], ['🌈 6 colours', '3 mirrors · paint vs light · upside-down lens'],
  ['🌈 7 colours', 'Which lights make it? · walls in the maze'], ['🎯 exact', 'Decoy mirrors · EXACT zoom'], ['💀 no hints', '20 s a question · one try']];
SEC3.optics = {icon: '🌈', name: 'Optics', acc: 'acc-o', g: 6, lvl: OPTICS_LVL, acts: ['prism', 'mixc', 'mirror', 'lens'], fx: ['🌈', '⭐', '🔦', '✨'],
  count: () => '<span>🌈 ' + (CHEM.orounds || 0) + ' light experiments</span><span>📇 ' + CHEM.all.length + ' / 118 element cards</span>'};
SEC3_BY_G[6] = Object.assign({k: 'optics'}, SEC3.optics);
/* 📏 s2b optics#1 → SciLab_optics.html */
/* ================= 🌈 END SC-3 OPTICS (sc-3c) ================= */
/* ================= 🔊 SC-3 ACOUSTICS (sc-3d) =================
   4 games on the SC-3 lab engine: 〰️ Wave viewer · 🎼 Xylophone · 🏔️ Echo · ⛈️ Thunder counting.
   Sound: UISound.tone when UiKit has it (Run Order 24s), else a small page-side player that follows 🔇 sound-off (localStorage sp_sound).
   Every sound answer also works from the picture (deaf-friendly); "by ear" rounds show the picture after a miss.
   Kid-safe: keep the volume low · count thunder from indoors. Saves through sciChemSave kinds wave · xylo · echo · thunder. */
var ACOUSTICS_LVL = [['〰️ loud + quiet', 'The next tap glows · 3 bars · short counts'], ['🎚️ high + low', '5 bars · which bar is highest · up to 9 s'], ['🎼 both', '8 bars · make the wave · "there and back" · coming or going'],
  ['👂 by ear', 'Match by ear · play the tune · step the metres + km'], ['🎯 exact', 'Longer tunes · too close for an echo · half km'], ['💀 no hints', '20 s a question · one try']];
SEC3.acoustics = {icon: '🔊', name: 'Acoustics', acc: 'acc-a', g: 7, lvl: ACOUSTICS_LVL, acts: ['wave', 'xylo', 'echo', 'thunder'], fx: ['🔊', '⭐', '🎵', '〰️'],
  count: () => '<span>🔊 ' + (CHEM.arounds || 0) + ' sound experiments</span><span>📇 ' + CHEM.all.length + ' / 118 element cards</span>'};
SEC3_BY_G[7] = Object.assign({k: 'acoustics'}, SEC3.acoustics);

/* ---------- the little sound player ---------- */
var AC_SND = {ctx: null};
function acOn(){ try{ if(window.UISound && typeof UISound.isOn === 'function') return !!UISound.isOn(); const s = JSON.parse(localStorage.getItem('sp_sound') || 'null'); return !s || s.e !== false; }catch(e){ return true; } }
function acVol(){ try{ const s = JSON.parse(localStorage.getItem('sp_sound') || 'null'); return s && typeof s.v === 'number' ? s.v : 0.6; }catch(e){ return 0.6; } }
function acTone(freq, dur, gain, delay, type){
  if(!SCI_FX || !acOn()) return;
  try{
    if(window.UISound && typeof UISound.tone === 'function') return UISound.tone(freq, dur, {type: type || 'sine', gain: gain || 0.25, delay: delay || 0});
    const C = window.AudioContext || window.webkitAudioContext; if(!C) return;
    const c = AC_SND.ctx || (AC_SND.ctx = new C()); if(c.state === 'suspended') c.resume();
    const t0 = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain(), peak = Math.max(0.0001, Math.min(0.35, (gain || 0.25)) * acVol());
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  }catch(e){}
}
/* 📏 s2b acoustics#1 → SciLab_acoustics.html */
/* ================= 🔊 END SC-3 ACOUSTICS (sc-3d) ================= */
/* ================= 🌍 SC-4 GEO (sc-4a) =================
   4 games on the SC-3 lab engine: 💎 Scratch test · 🗺️ Rock map · 🧭 Compass · 🌍 Layers + 🌊 Shake table.
   Uses YOUR crafted things: 💎 their material's Mohs number (META().mats) · 🌊 how far they can tilt (sci.tip from the ⚖️ balance maths).
   Kid-safe facts only ("about", rounded). Saves through sciChemSave kinds scratch · rocks · compass · quake. */
var GEO_LVL = [['🪨 big differences', 'The next tap glows · numbers shown · 2 things on the table'], ['🧭 turned maps', 'Order 4 · the map turns · your things'], ['🔍 mystery rock', 'Find a rock with tools · 8 directions · make it steadier'],
  ['🧲 tricky', 'No numbers · a magnet fools the compass · what falls first'], ['🎯 exact', 'The Mohs number exactly · any turn · all 7 continents'], ['💀 no hints', '20 s a question · one try']];
SEC3.geo = {icon: '🌍', name: 'Geo', acc: 'acc-g', g: 8, lvl: GEO_LVL, acts: ['scratch', 'rocks', 'compass', 'quake'], fx: ['🌍', '⭐', '💎', '🧭'],
  count: () => '<span>🌍 ' + (CHEM.gerounds || 0) + ' earth experiments</span><span>📇 ' + CHEM.all.length + ' / 118 element cards</span>'};
SEC3_BY_G[8] = Object.assign({k: 'geo'}, SEC3.geo);
/* 📏 s2b geo#1 → SciLab_geo.html */
function geoTop(W, H){ const bud = l3BudBox(); return bud && bud.y > H * 0.45 && bud.x < W * 0.9 ? Math.max(0, H - bud.y) : 0; }   // keep pictures above the buddy
function geoFs(H){ return Math.max(12, Math.min(22, H * 0.055)); }
function geoTxt(g, t, x, y, fs, col, al, bl){ f3(g, 900, fs); g.fillStyle = col || '#FFE08A'; g.textAlign = al || 'center'; g.textBaseline = bl || 'middle';
  if(window.L3GLOW === true){ g.save(); g.lineJoin = 'round'; g.lineWidth = Math.max(4, fs * 0.42); g.strokeStyle = 'rgba(110,220,255,0.32)'; g.strokeText(t, x, y); g.lineWidth = Math.max(2.5, fs * 0.22); g.strokeStyle = '#050817'; g.strokeText(t, x, y); g.restore(); }   /* ✨ sc-5a: dark outline, then glow */
  g.fillText(t, x, y); }
function geoChips(list, wire){ l3Pick(list.map(o => '<button class="chip3 big3" data-v="' + o[0] + '" data-sound="none">' + o[1] + '</button>').join(''), p => p.querySelectorAll('.chip3').forEach(b => b.onclick = () => wire(b.dataset.v))); }
function geoOff(v){ const b = document.querySelector('#l3-pick .chip3[data-v="' + v + '"]'); if(b) b.disabled = true; }
function geoGlow(v, later){ if(L3.lv === 0) l3Glow(document.querySelector('#l3-pick .chip3[data-v="' + v + '"]'), later == null ? 4000 : later); }
const GEO_THUMB = {};
function geoThumb(a){ if(GEO_THUMB[a.id]) return GEO_THUMB[a.id]; const c = document.createElement('canvas'); c.width = c.height = 140; try{ paintThumb(c, a); }catch(e){} return (GEO_THUMB[a.id] = c); }
function geoMine(){ return (S.things || []).filter(a => a.owners && a.owners.indexOf(S.player) >= 0 && !(a.look && a.look.br)); }
function geoMatOf(a){ return (a.sci && a.sci.m) || (a.look && (a.look.m || a.look.g)) || ''; }
/* 📏 s2b geo#2 → SciLab_geo.html */
/* ================= 🌍 END SC-4 GEO (sc-4a) ================= */
/* ================= 🧬 SC-4 BIO (sc-4b) =================
   4 games on the SC-3 lab engine: 🦴 Skeleton + levers · 👁️ Eyes + 👂 ears · ❤️ Heartbeat · 🎋 Hollow tubes.
   Uses YOUR crafted things: 🎋 is your cup / vase / lathe thing hollow (look.pi or a container) or solid?
   Kid-safe facts only ("about", rounded). Saves through sciChemSave kinds skel · sense · heart · tube. */
var BIO_LVL = [['🦴 big parts', 'The next tap glows · count the beats · 2 rods'], ['👁️ how it works', 'More bones · lenses · rest vs run · your things'], ['🔢 count it', 'Seesaws · which ear first · 15 s × 4'],
  ['🐘 animals', 'Muscle maths · animal hearts + senses · bamboo facts'], ['🎯 exact', 'Close numbers · 6 bones in order'], ['💀 no hints', '20 s a question · one try']];
SEC3.bio = {icon: '🧬', name: 'Bio', acc: 'acc-b', g: 9, lvl: BIO_LVL, acts: ['skel', 'sense', 'heart', 'tube'], fx: ['🧬', '⭐', '❤️', '🦴'],
  count: () => '<span>🧬 ' + (CHEM.birounds || 0) + ' body experiments</span><span>📇 ' + CHEM.all.length + ' / 118 element cards</span>'};
SEC3_BY_G[9] = Object.assign({k: 'bio'}, SEC3.bio);
/* 📏 s2b bio#1 → SciLab_bio.html */
/* ================= 🧬 END SC-4 BIO (sc-4b) ================= */
/* ================= 🌌 SC-4 COSMIC (sc-4c) =================
   4 games on the SC-3 lab engine: 🪐 Weigh it on other worlds · ⭐ Star map · ☀️ Sundial · 🚀 Planets + light.
   Uses YOUR crafted things: 🪐 weighs one of them (sci.g = its Earth weight in grams, sc-4c server) on the Moon / Jupiter.
   ☀️ your own avatar is the sundial’s pointer. Kid-safe facts only ("about", rounded). Saves through sciChemSave kinds weigh · stars · sundial · planets.
   Every round T carries R = the right chip value (order rounds: items + got); choices(T) = the chips (the facts test checks R is on offer).
   Core rules first (Aowu 2026-11-17 12:16 "first lay down the core principle of the game, I might rework the design later"). */
var COS_LVL = [['🌙 Moon + Sun', 'The next tap glows · weigh on the Moon · big star shapes'], ['🪐 more worlds', 'Mars · star finder · read a sundial · 5 planets'], ['🔢 work it out', '÷ 6 · × 2½ · North Star · light times'],
  ['🔭 far away', 'All 8 planets · nearest star · your things'], ['🎯 exact', 'Close numbers · every world'], ['💀 no hints', '20 s a question · one try']];
SEC3.cosmic = {icon: '🌌', name: 'Cosmic', acc: 'acc-c', g: 10, lvl: COS_LVL, acts: ['weigh', 'stars', 'sundial', 'planets'], fx: ['🌌', '⭐', '🪐', '🚀'],
  count: () => '<span>🌌 ' + (CHEM.corounds || 0) + ' space experiments</span><span>📇 ' + CHEM.all.length + ' / 118 element cards</span>'};
SEC3_BY_G[10] = Object.assign({k: 'cosmic'}, SEC3.cosmic);
/* 📏 s2a cosmic#1 → SciLab_cosmic.html */
function cosChips(list, R){ geoChips(list, v => L3.A.ans(v)); if(R != null) geoGlow(String(R)); }
function cosOpts(R, others, n){ const out = [R]; shuffle(others.slice()).forEach(v => { if(out.length < n && v > 0 && Number.isInteger(v) && out.indexOf(v) < 0) out.push(v); }); return shuffle(out); }
/* 📏 s2a cosmic#2 → SciLab_cosmic.html */
/* ================= 🌌 END SC-4 COSMIC (sc-4c) ================= */
/* ================= ✨ sc-5a GLOW GLASS — 🌌 Cosmic look =================
   Aowu 2026-11-17 15:02: "go C Glow Glass with each white font need a dark outline then glow to see the letter clearer, and cosmic space star sparkle to enhance science too".
   A section opts in with SEC3.<sec>.glass = true (🌌 Cosmic now — the other 10 labs in sc-5b). Same SC-3 engine, same rounds, same saves:
   ✨ canvas words get a dark outline + a soft glow (geoTxt while L3GLOW) · ✨ twinkling 4-point sparkles in every night sky (+ the CSS star layers behind the card)
   🚀 trip bar (5 stops → 🌕) in the game bar · ✅ Right! stamp + 💡 You learned card + 📒 Space notebook n / 22 (server: SciElements nb) · 🤏 So close! card · 📖 the answer card
   ⭐ picture names for star shapes (👑 Cassiopeia · 🏹 Orion · 🥄 Big Dipper · ✝️ Southern Cross · 🦂 Scorpius) — the picture fades in behind the stars after the answer. */
var L3GLOW = false;
SEC3.cosmic.glass = true;
SEC3_BY_G[10].glass = true;
// 📒 notebook pages = one per kind of question in a game (game.kind) — the same list the server keeps (SciElements nb)
const NOTE_KINDS = {weigh: ['moon', 'calc', 'which', 'mass', 'jump', 'yours'], stars: ['name', 'find', 'polaris', 'dir', 'fact'], sundial: ['shadow', 'read', 'noon', 'dir', 'fact'], planets: ['order', 'size', 'light', 'pfact', 'far', 'speed']};
const NOTE_NAME = {cosmic: 'Space notebook'};
const COS_PIC = {dipper: '🥄', orion: '🏹', cross: '✝️', cassi: '👑', scorp: '🦂'};
function glassOn(){ return !!(L3 && L3.A && (SEC3[L3.A.sec] || {}).glass); }
function noteBook(sec){ const keys = [], have = (CHEM.nb || []).concat((L3 && L3.learn) || []);
  Object.keys(ACT3).forEach(k => { if(ACT3[k].sec === sec && NOTE_KINDS[k]) NOTE_KINDS[k].forEach(d => keys.push(k + '.' + d)); });
  return {n: keys.filter(x => have.indexOf(x) >= 0).length, of: keys.length, name: NOTE_NAME[sec] || 'Lab notebook'}; }
// every lab answer goes through here: plain labs keep the old one-line pill, glass labs get the cards
function l3Say(kind, msg, pts){
  if(!glassOn()){ if(kind === 'ok') return l3Msg('✅ ' + msg + (pts ? ' · +' + pts : ''), 'ok'); if(kind === 'try') return l3Msg('🤔 ' + msg, ''); return l3Msg(msg, ''); }
  if(kind === 'ok'){
    const T = L3.T || {}, pg = notePage(L3.k, T), key = L3.k + '.' + pg; L3.learn = L3.learn || []; L3.okAt = L3.okAt || {}; L3.okAt[L3.i] = true;
    const counts = !!NOTE_KINDS[L3.k] && NOTE_KINDS[L3.k].indexOf(pg) >= 0, isNew = counts && (CHEM.nb || []).indexOf(key) < 0 && L3.learn.indexOf(key) < 0;
    if(isNew) L3.learn.push(key); const nb = noteBook(L3.A.sec); l3Trip();
    return l3Msg('<span class="gm-top"><b class="gm-h">✅ Right!' + (pts ? ' +' + pts : '') + '</b><span class="gm-nb' + (isNew ? ' new' : '') + '" title="' + nb.name + '">📒 ' + (isNew ? 'New page! ' : '') + nb.n + ' / ' + nb.of + '</span></span>' +
      '<span class="gm-l">💡 You learned</span><span class="gm-t">' + msg + '</span>', 'ok gm'); }
  if(kind === 'try') return l3Msg('<b class="gm-h">🤏 So close!</b> <span class="gm-t">' + msg + '</span>', 'gm try');
  l3Trip(); return l3Msg('<span class="gm-l">📖 The answer</span><span class="gm-t">' + msg + '</span>', 'gm end');
}
// 🚀 trip bar: one stop per question, the rocket on the one you are on, 🌕 at the end (replaces the "1/5" count in glass labs)
function l3Trip(){ if(!glassOn()) return; const B = l3Bar(L3.k); let n = B.box.querySelector('.gl-trip');
  if(!n){ n = document.createElement('div'); n.className = 'gl-trip'; B.custom('trip', n); }
  const tot = L3.list.length, cur = Math.min(L3.i, tot - 1), ok = L3.okAt || {}; let h = '';
  for(let i = 0; i < tot; i++){ const past = i < cur || (i === cur && L3.solved), cls = past ? (ok[i] ? 'done' : 'miss') : i === cur ? 'cur' : '';
    h += (i ? '<u></u>' : '') + '<i class="' + cls + '">' + (cls === 'cur' ? tripIcons()[0] : '') + '</i>'; }
  n.innerHTML = h + '<u></u><b>' + tripIcons()[1] + '</b>'; n.title = 'Stop ' + (cur + 1) + ' of ' + tot; B.hide(L3.k); }
// ✨ a 4-point sparkle (canvas)
function glassSpark(g, x, y, r, col, a){ g.save(); g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x + r * 0.16, y - r * 0.16, x + r, y); g.quadraticCurveTo(x + r * 0.16, y + r * 0.16, x, y + r);
  g.quadraticCurveTo(x - r * 0.16, y + r * 0.16, x - r, y); g.quadraticCurveTo(x - r * 0.16, y - r * 0.16, x, y - r); g.fill(); g.globalAlpha = a * 0.3; g.beginPath(); g.arc(x, y, r * 0.6, 0, 7); g.fill(); g.restore(); }
/* 📏 s2a cosmic#3 → SciLab_cosmic.html */
/* ================= ✨ END sc-5a GLOW GLASS ================= */
/* ================= ✨ sc-5b1 GLOW GLASS — 🔥 Thermo · ⚡ Electro · 🌈 Optics · 🔊 Acoustics · 🌍 Geo · 🧬 Bio =================
   Aowu 2026-11-17 16:10 "go": the sc-5a 🌌 Glow Glass on 6 more labs, each its own colours (CSS block sc-5b1, #scr-l3.glx + the lab's acc-*),
   its own sparkles + motion, its own 🚀-style trip icons and its own 📒 notebook. SEC3.<sec>.glass = the canvas glow colour (a string; 🌌 Cosmic keeps true).
   ✨ canvas words: every LIGHT word a lab draws gets a dark outline, then the lab's glow (glxText wraps the lab canvas' fillText while L3GLOW is a string);
   dark words and emoji are left alone. Same SC-3 engine, rounds and saves; 📒 pages = "<game>.<page>" (server keeps them in SciElements nb). */
const GLX = {
  thermo:    ['rgba(255,165,70,0.36)', '#170603', '🎈', '☀️', 'Heat notebook'],
  electro:   ['rgba(255,226,80,0.36)', '#050A1C', '⚡', '💡', 'Spark notebook'],
  optics:    ['rgba(255,170,240,0.36)', '#0A0620', '🔦', '🌈', 'Light notebook'],
  acoustics: ['rgba(90,255,215,0.34)', '#03161A', '🎵', '🔔', 'Sound notebook'],
  geo:       ['rgba(255,205,120,0.34)', '#120C04', '⛏️', '💎', 'Rock notebook'],
  bio:       ['rgba(255,150,175,0.36)', '#1A0610', '🩺', '❤️', 'Body notebook']};
Object.keys(GLX).forEach(s => { const C = SEC3[s]; if(!C) return; C.glass = GLX[s][0]; C.glink = GLX[s][1]; C.trip = [GLX[s][2], GLX[s][3]]; NOTE_NAME[s] = GLX[s][4];
  const B = SEC3_BY_G[C.g]; if(B){ B.glass = C.glass; B.glink = C.glink; B.trip = C.trip; } });
// 📒 notebook pages per game (page names are 2–12 letters / digits — the server's rule)
Object.assign(NOTE_KINDS, {
  therm: ['set', 'read', 'fahr'], melt: ['ladder', 'oven'], warm: ['hot', 'cold'], flow: ['arrow', 'mix'],
  circ: ['yes', 'count', 'bright'], cond: ['tray'], mag: ['pick', 'poles'], emag: ['lift', 'off'],
  prism: ['order', 'least', 'most', 'sun'], mixc: ['light', 'paint', 'inv'], mirror: ['one', 'multi'], lens: ['kind', 'zoom', 'flip'],
  wave: ['pick', 'make', 'ear'], xylo: ['order', 'hi', 'lo', 'tune'], echo: ['calc', 'trap', 'speed', 'near'], thunder: ['calc', 'first', 'move', 'speed'],
  scratch: ['pair', 'order', 'mine', 'myst'], rocks: ['type', 'map', 'from'], compass: ['make', 'read', 'walk', 'fool'], quake: ['layers', 'shake', 'ask', 'fix', 'fall'],
  skel: ['job', 'pivot', 'order', 'seesaw', 'lift', 'fact'], sense: ['pupil', 'ear', 'lens', 'part', 'animal'], heart: ['count', 'rest', 'pair', 'c15', 'order'], tube: ['same', 'nature', 'yours', 'edge', 'same3', 'fact']});
const NOTE_MAP = {therm: {s: 'set', r: 'read', f: 'fahr'}, prism: {o: 'order'}, xylo: {o: 'order'}, echo: {c: 'calc', s: 'speed'}, thunder: {c: 'calc', s: 'speed'},
  warm: T => T.cold ? 'cold' : 'hot', cond: () => 'tray', mirror: T => (T.P && T.P.mir.filter(m => m.ok).length > 1) ? 'multi' : 'one'};
function notePage(k, T){ const m = NOTE_MAP[k]; if(typeof m === 'function') return m(T || {}); return (m && m[T.kd]) || T.kd || 'x'; }
function tripIcons(){ const C = L3 && L3.A && SEC3[L3.A.sec]; return (C && C.trip) || ['🚀', '🌕']; }
// ✨ light words on the lab canvas: dark outline, then the lab's glow (dark words + emoji untouched)
function glxLight(c){ if(typeof c !== 'string') return false; let r, g, b; c = c.trim();
  if(c[0] === '#'){ let h = c.slice(1); if(h.length < 6) h = h.split('').map(x => x + x).join(''); r = parseInt(h.slice(0, 2), 16); g = parseInt(h.slice(2, 4), 16); b = parseInt(h.slice(4, 6), 16); }
  else { const m = c.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s\/]+([\d.]+))?/); if(!m) return c === 'white'; if(m[4] != null && +m[4] < 0.5) return false; r = +m[1]; g = +m[2]; b = +m[3]; }
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.6; }
const GLX_EMO = /\p{Extended_Pictographic}/u;
var GLX_N = 0;   // light words outlined (tests)
function glxText(g){ if(g.__glx) return; g.__glx = true; const fill = g.fillText;
  g.fillText = function(t, x, y, mw){ const c = window.L3GLOW, s = String(t);
    if(typeof c === 'string' && glxLight(this.fillStyle)){ const words = s.replace(GLX_EMO_ALL, '').trim();
      if(words && (mw == null || !GLX_EMO.test(s))){ const fs = parseFloat((String(this.font).match(/([\d.]+)px/) || [0, 14])[1]), C = SEC3[L3 && L3.A ? L3.A.sec : ''] || {};
        // stroke only the words: a label like "🟣 cabbage juice" keeps its emoji clean (sc-5b2)
        const segs = GLX_EMO.test(s) ? s.split(GLX_EMO_SPLIT).filter(x => x !== '') : [s];
        this.save(); this.lineJoin = 'round'; this.shadowBlur = 0; this.shadowColor = 'transparent';
        const al = this.textAlign, w = this.measureText(s).width, x0 = al === 'center' ? x - w / 2 : (al === 'right' || al === 'end') ? x - w : x; this.textAlign = 'left';
        [[Math.max(4, fs * 0.42), c], [Math.max(2.5, fs * 0.22), C.glink || '#050817']].forEach(L => { this.lineWidth = L[0]; this.strokeStyle = L[1];
          if(segs.length === 1 && !GLX_EMO.test(s)){ this.textAlign = al; if(mw != null) this.strokeText(s, x, y, mw); else this.strokeText(s, x, y); this.textAlign = 'left'; return; }
          let cx = x0; segs.forEach(seg => { if(!GLX_EMO.test(seg) && seg.trim()) this.strokeText(seg, cx, y); cx += this.measureText(seg).width; }); });
        this.restore(); GLX_N++; } }
    return mw != null ? fill.call(this, t, x, y, mw) : fill.call(this, t, x, y); }; }
const GLX_EMO_ALL = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, GLX_EMO_SPLIT = /((?:\p{Extended_Pictographic}[\u{FE0F}\u{200D}\u{20E3}\u{1F3FB}-\u{1F3FF}]*)+)/u;
/* ================= ✨ END sc-5b1 GLOW GLASS ================= */
/* ================= ✨ sc-5b2 GLOW GLASS — ⚗️ Chemistry (🔍 Element hunt · ⚛️ Formula builder) + 🧫 Kitchen lab · lime =================
   Aowu 2026-11-17 17:40 "ok go — this will rework chemistry to the current design". The 3 play screens get the classes glx + acc-x (CSS block sc-5b2, built by sc5b2_gen.py):
   lime nebula + bubble / ring sparkles, glass cards, white words outlined + glowing, neon option pills · ✅ Right! + 💡 You learned / 🤏 So close! / 📖 The answer cards
   (gSay) with a 📇 / ⚛️ collection chip (element cards n / 118 · molecules n / 51 — Chemistry's own "notebook") · 🫧 → ⚗️ trip bar instead of "1/5" ·
   light words on the 🧫 bench canvas get the lime glow (glxText). Games, rounds, scores and saves are unchanged. */
const CHEM_GLOW = 'rgba(175,255,120,0.36)', CHEM_TRIP = ['🫧', '⚗️'];
function chemGlassMark(){ ['scr-exp', 'scr-formula', 'scr-hunt'].forEach(id => { const s = $(id); if(s) s.classList.add('glx', 'acc-x'); }); }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chemGlassMark); else chemGlassMark();
function chemGlass(id){ const s = $(id); return !!(s && s.classList.contains('glx')); }
// the cards — html is already safe (callers escape their words)
function gSay(el, kind, html, pts, chip){ if(!el) return;
  if(kind === 'ok'){ el.className = 'fm-msg ok gm'; el.innerHTML = '<span class="gm-top"><b class="gm-h">✅ Right!' + (pts ? ' +' + pts : '') + '</b>' + (chip ? '<span class="gm-nb' + (chip.isNew ? ' new' : '') + '">' + chip.t + '</span>' : '') + '</span><span class="gm-l">💡 You learned</span><span class="gm-t">' + html + '</span>'; return; }
  if(kind === 'try'){ el.className = 'fm-msg gm try'; el.innerHTML = '<b class="gm-h">🤏 So close!</b> <span class="gm-t">' + html + '</span>'; return; }
  el.className = 'fm-msg gm end'; el.innerHTML = '<span class="gm-l">📖 The answer</span><span class="gm-t">' + html + '</span>'; }
// 📇 / ⚛️ chips: your collection after this answer
function chemCardChip(found){ const have = CHEM.all || [], fresh = (found || []).filter((n, i, a) => have.indexOf(n) < 0 && a.indexOf(n) === i);
  return {isNew: fresh.length > 0, t: '📇 ' + (fresh.length ? 'New card! ' : '') + (have.length + fresh.length) + ' / 118'}; }
function chemMolChip(built){ const have = CHEM.c || [], fresh = (built || []).filter((id, i, a) => have.indexOf(id) < 0 && a.indexOf(id) === i), of = typeof COMPS !== 'undefined' ? COMPS.length : 51;
  return {isNew: fresh.length > 0, t: '⚛️ ' + (fresh.length ? 'New molecule! ' : '') + (have.length + fresh.length) + ' / ' + of}; }
// 🧫 Kitchen lab messages
function xSay(kind, msg, pts){ const el = $('x-msg');
  if(!chemGlass('scr-exp')){ el.className = 'fm-msg' + (kind === 'ok' ? ' ok' : ''); el.textContent = kind === 'ok' ? '✅ ' + msg + ' · +' + pts : kind === 'try' ? '🤔 ' + msg : msg; return; }
  gSay(el, kind, UI.esc(msg), pts, kind === 'ok' ? chemCardChip(XG && XG.found) : null); }
// ⚛️ Formula builder messages
function fmSay(kind, html, pts, c){ const el = $('fm-msg');
  if(!chemGlass('scr-formula')){ el.className = 'fm-msg' + (kind === 'ok' ? ' ok' : ''); el.innerHTML = (kind === 'ok' ? '✅ ' : kind === 'try' ? '🤔 ' : '') + html + (kind === 'ok' && pts ? ' · +' + pts : ''); return; }
  gSay(el, kind, html, pts, kind === 'ok' && c ? chemMolChip(FG ? FG.built : [c.id]) : null); }
// 🫧 → ⚗️ trip bar (one stop per question) in place of the "n / 5" count
function chemTrip(barId, B, key, i, tot, solved, okAt){ const box = $(barId); if(!box || !B || !B.custom || !chemGlass(box.closest('section').id)) return;
  let n = box.querySelector('.gl-trip'); if(!n){ n = document.createElement('div'); n.className = 'gl-trip'; B.custom('trip', n); }
  const cur = Math.min(i, tot - 1); let h = '';
  for(let k = 0; k < tot; k++){ const past = k < cur || (k === cur && solved), cls = past ? (okAt[k] ? 'done' : 'miss') : k === cur ? 'cur' : '';
    h += (k ? '<u></u>' : '') + '<i class="' + cls + '">' + (cls === 'cur' ? CHEM_TRIP[0] : '') + '</i>'; }
  n.innerHTML = h + '<u></u><b>' + CHEM_TRIP[1] + '</b>'; n.title = 'Stop ' + (cur + 1) + ' of ' + tot; if(B.hide) B.hide(key); }
function xTrip(){ if(XG && XG.list) chemTrip('xbar', XBAR, 'exp', XG.i, XG.list.length, XG.solved, XG.okAt || {}); }
function fmTrip(){ if(FG && FG.list) chemTrip('fbar', FBAR, 'mol', FG.i, FG.list.length, FG.solved, FG.okAt || {}); }
function huntTrip(){ if(HG && HG.targets) chemTrip('hbar', HBAR, 'clue', HG.i, HG.targets.length, false, HG.okAt || {}); }
(function(){ const wrap = (f, after) => function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; };
  xNext = wrap(xNext, xTrip);
  xJudge = (f => function(right){ const was = XG && XG.solved, r = f.apply(this, arguments); try{ if(XG && right && !was && XG.solved){ XG.okAt = XG.okAt || {}; XG.okAt[XG.i] = true; } xTrip(); }catch(e){} return r; })(xJudge);
  xAnswer = wrap(xAnswer, xTrip); xHang = wrap(xHang, xTrip); xStop = wrap(xStop, xTrip);
  fmNext = wrap(fmNext, fmTrip);
  fmCheck = (f => function(){ const m = FG ? FG.miss : 0, was = FG && FG.solved, r = f.apply(this, arguments); try{ if(FG && !was && FG.solved && FG.miss === m){ FG.okAt = FG.okAt || {}; FG.okAt[FG.i] = true; } fmTrip(); }catch(e){} return r; })(fmCheck);
  huntNext = wrap(huntNext, huntTrip);
  huntTap = (f => function(n){ const i = HG ? HG.i : -1, r = f.apply(this, arguments); try{ if(HG && HG.i > i){ HG.okAt = HG.okAt || {}; HG.okAt[i] = true; } huntTrip(); }catch(e){} return r; })(huntTap);
  // ✨ light words on the bench canvas: dark outline, then the lime glow
  const db = drawBench; drawBench = function(){ const cv = $('x-cv'); if(cv && chemGlass('scr-exp')){ glxText(cv.getContext('2d')); window.L3GLOW = CHEM_GLOW; } try{ return db.apply(this, arguments); } finally { window.L3GLOW = false; } };
})();
/* ================= ✨ END sc-5b2 GLOW GLASS ================= */
/* ================= ⚙️ SC-4 LIFT IT! — levers + pulleys (sc-4d2) =================
   One lab game on the SC-3 engine, opened from the ⚙️ Mechanic lab (the wide "🏗️ Explore: Lift it!" card) — its own small section key 'machines'
   (group 11, accent acc-m), never a start-page card: leaving it goes back to the Mechanic lab / the level list.
   Rounds: 🪨 crowbar (where does the pivot go?) · 🖐️ hands (how many hands with this pivot?) · 🛒 lever types (what sits in the middle?)
   · 🪝 pulleys (ropes holding the load share it) · 📏 rope trade (less force, more rope) · 🧰 simple-machine cards.
   YOUR crafted thing rides on the crate. Kid maths: one hand pushes 10 kg; push = crate × crate arm ÷ push arm (plank 10 steps long).
   Every round T carries R = the right chip value + choices(T) (the facts test checks R is on offer). Saves through sciChemSave kind 'lift'. */
var LIFT_LVL = [['🪨 one push', 'The next tap glows · crowbar + 1–2 ropes'], ['🖐️ count hands', 'How many hands · machine cards'], ['🛒 lever types', 'Seesaw · nutcracker · broom · 4 ropes'],
  ['📏 rope trade', 'Less force, more rope · 3 ropes'], ['🎯 exact', 'Close spots + numbers · 4 choices'], ['💀 no hints', '20 s a question · one try']];
SEC3.machines = {icon: '⚙️', name: 'Mechanic', acc: 'acc-m', g: 11, lvl: LIFT_LVL, acts: ['lift'], fx: ['🏗️', '⭐', '🪝', '⚙️'], mode: 'mechanic',
  count: () => '<span>🏗️ ' + (CHEM.merounds || 0) + ' machine experiments</span>'};
SEC3_BY_G[11] = Object.assign({k: 'machines'}, SEC3.machines);
// crate kg → the pivot spot (0 = crate end … 10 = your hands) where ONE hand (10 kg) is just enough
const LIFT_BAR = {20: 3, 30: 2, 40: 2, 60: 1, 90: 1};
// [crate kg, pivot spot, hands] — always a whole number of hands
const LIFT_HANDS = [[20, 5, 2], [30, 5, 3], [40, 5, 4], [40, 2, 1], [90, 1, 1], [80, 2, 2], [70, 3, 3], [60, 4, 4], [90, 4, 6], [50, 5, 5]];
// [icon, thing, what sits in the middle (pivot · load · push), why]
const LIFT_TYPES = [['⚖️', 'seesaw', 'pivot', 'the pivot sits in the middle — a kid on each end'], ['✂️', 'pair of scissors', 'pivot', 'the little screw in the middle is the pivot'],
  ['🔨', 'claw hammer pulling a nail', 'pivot', 'the hammer head rocks on the wood — that is the pivot'], ['🌰', 'nutcracker', 'load', 'the nut sits in the middle, the hinge is at the end'],
  ['🍾', 'bottle opener', 'load', 'the cap sits in the middle, the tip on top is the pivot'], ['🛞', 'wheelbarrow', 'load', 'the load sits in the middle, the wheel is the pivot'],
  ['🧹', 'broom', 'push', 'your lower hand pushes in the middle, your top hand is the pivot'], ['🎣', 'fishing rod', 'push', 'your front hand pulls in the middle, your back hand is the pivot'],
  ['💪', 'your own forearm', 'push', 'your muscle pulls in the middle, the elbow is the pivot (🧬 Bio!)']];
const LIFT_MID = {pivot: ['▲', 'The pivot'], load: ['📦', 'The load'], push: ['✋', 'Your push']};
const LIFT_ORDER = {pivot: ['load', 'pivot', 'push'], load: ['pivot', 'load', 'push'], push: ['pivot', 'push', 'load']};
// simple machines + everyday things that ARE them
const LIFT_MACH = {lever: ['🎚️', 'Lever'], wheel: ['🛞', 'Wheel + axle'], pulley: ['🪝', 'Pulley'], ramp: ['📐', 'Ramp'], wedge: ['🔺', 'Wedge'], screw: ['🔩', 'Screw']};
const LIFT_CARDS = [['🚪', 'door handle', 'wheel', 'a big handle turns a thin axle inside the door'], ['🪓', 'axe', 'wedge', 'its thin edge pushes the wood apart'], ['🫙', 'jar lid', 'screw', 'its thread winds round and round'],
  ['🛝', 'slide', 'ramp', 'a long slope instead of a big drop'], ['🏳️', 'flagpole', 'pulley', 'pull the rope down — the flag goes up'], ['⚖️', 'seesaw', 'lever', 'a plank rocking on a pivot'],
  ['🚲', 'bike wheel', 'wheel', 'the big wheel turns round a thin axle'], ['🔪', 'knife', 'wedge', 'a very thin wedge — that is why it cuts'], ['💡', 'light bulb base', 'screw', 'twist it in — it is a screw'],
  ['♿', 'wheelchair ramp', 'ramp', 'a gentle slope instead of steps'], ['🏗️', 'crane', 'pulley', 'many ropes + wheels lift heavy things'], ['🍾', 'bottle opener', 'lever', 'a short lever that pops the cap']];
const liftPick = a => a[Math.floor(Math.random() * a.length)];
function liftThing(){ const mine = geoMine().filter(a => a.look), pool = mine.length ? mine : (META().samples || []).slice(0, 6).map(s => sampleThing(s.m)); return pool.length ? liftPick(pool) : null; }
function liftPush(L, p){ return L * p / (10 - p); }
function liftHands(kg){ return Math.max(1, Math.ceil(kg / 10 - 1e-9)); }
function liftFound(T){ return T.a ? ((CHEM.mats || {})[geoMatOf(T.a)] || []).slice(0, 3) : []; }
ACT3.lift = {sec: 'machines', icon: '🏗️', name: 'Lift it!', sub: 'Levers + pulleys — lift a heavy crate with fewer hands', eye: '🏗️ Lift it!', count: 'Lift',
  make(lv){ const plan = [['bar', 'pul', 'bar', 'pul', 'bar'], ['bar', 'hands', 'pul', 'card', 'hands'], ['hands', 'type', 'pul', 'card', 'bar'], ['rope', 'type', 'hands', 'card', 'pul'],
      ['hands', 'rope', 'type', 'pul', 'card'], ['hands', 'rope', 'type', 'pul', 'card']][lv];
    const a = liftThing(), types = shuffle(LIFT_TYPES.slice()), cards = shuffle(LIFT_CARDS.slice()); let ti = 0, ci = 0;
    return plan.map(kd => {
      if(kd === 'bar'){ const L = liftPick(lv === 0 ? [20, 30, 40] : [20, 30, 40, 60, 90]), p = LIFT_BAR[L], spots = lv === 0 ? [p, 8] : lv >= 4 ? [p, p + 1, 5, 8] : [p, 5, 8];
        const sorted = spots.slice().sort((x, y) => x - y), lab = {}; sorted.forEach((s, i) => { lab[s] = 'ABCD'[i]; });
        return {kd, a, L, p, spots: sorted, lab, R: lab[p], k: 0}; }
      if(kd === 'hands'){ const h = liftPick(LIFT_HANDS.filter(x => lv <= 1 ? x[1] === 5 || x[2] === 1 : true)); return {kd, a, L: h[0], p: h[1], R: String(h[2]), k: 0}; }
      if(kd === 'type'){ const t = types[ti++ % types.length]; return {kd, t, R: t[2], k: 0}; }
      if(kd === 'pul'){ const N = liftPick(lv <= 1 ? [1, 2] : lv === 2 ? [2, 4] : [1, 2, 3, 4]), L = liftPick(N === 3 ? [30, 60, 90] : [40, 60, 80, 120]); return {kd, a, N, L, R: String(L / N), k: 0}; }
      if(kd === 'rope'){ const N = liftPick([2, 3, 4]), up = lv >= 4 ? liftPick([1, 2]) : 1; return {kd, a, N, L: N * 20, up, R: String(N * up), k: 0}; }
      const c = cards[ci++ % cards.length]; return {kd: 'card', c, R: c[2], k: 0}; }); },
  choices(T){ const lv = L3.lv, n = lv === 0 ? 2 : lv >= 4 ? 4 : 3;
    if(T.kd === 'bar') return T.spots.map(s => [T.lab[s], '📍 ' + T.lab[s] + (lv <= 1 ? (s <= 3 ? ' · near the crate' : s >= 7 ? ' · near your hands' : ' · in the middle') : '')]);
    if(T.kd === 'hands'){ const R = Number(T.R); return cosOpts(R, [T.L / 10, R + 1, R - 1, R * 2, R + 2], n).map(v => [String(v), (v <= 3 ? '✋'.repeat(v) : '✋ × ') + ' ' + v]); }
    if(T.kd === 'type') return ['pivot', 'load', 'push'].map(k => [k, LIFT_MID[k][0] + ' ' + LIFT_MID[k][1]]);
    if(T.kd === 'pul'){ const R = Number(T.R); return cosOpts(R, [T.L, T.L / 2, T.L / 4, T.L * 2, T.L / 3], n).map(v => [String(v), v + ' kg']); }
    if(T.kd === 'rope'){ const R = Number(T.R); return cosOpts(R, [T.up, R * 2, R + 1, R + 2, R - 1], n).map(v => [String(v), v + ' m']); }
    const others = shuffle(Object.keys(LIFT_MACH).filter(k => k !== T.R)).slice(0, n - 1); return shuffle([T.R].concat(others)).map(k => [k, LIFT_MACH[k][0] + ' ' + LIFT_MACH[k][1]]); },
  setup(T){ const lv = L3.lv, ch = this.choices(T);
    if(T.kd === 'bar'){ l3Head('🪨 Crowbar', 'Where should the <b>pivot ▲</b> go so <b>ONE hand ✋</b> (10 kg) lifts the <b>' + T.L + ' kg</b> crate?', lv === 0 ? '👆 Pivot close to the crate = an easy push' : lv <= 2 ? 'Short crate arm + long push arm = a light push' : ''); return cosChips(ch, T.R); }
    if(T.kd === 'hands'){ l3Head('🖐️ How many hands?', 'The pivot is at <b>▲</b>. Each hand pushes <b>10 kg</b>. How many hands lift the <b>' + T.L + ' kg</b> crate?', lv <= 1 ? (T.p === 5 ? '👆 Pivot in the middle: you push as hard as the crate weighs' : 'The long push arm makes it easy') : lv <= 3 ? 'push = crate × crate arm ÷ push arm' : ''); return cosChips(ch, T.R); }
    if(T.kd === 'type'){ l3Head(T.t[0] + ' Lever detective', 'A ' + T.t[1] + ' is a lever. What sits in the <b>MIDDLE</b>?', lv <= 2 ? 'Every lever has a pivot ▲, a load 📦 and a push ✋' : ''); return cosChips(ch, T.R); }
    if(T.kd === 'pul'){ l3Head('🪝 Pulley', '<b>' + T.N + ' rope' + (T.N > 1 ? 's' : '') + '</b> hold the <b>' + T.L + ' kg</b> crate. How hard do you pull?', lv === 0 ? (T.N === 1 ? '👆 One rope over a wheel only turns the pull around' : '👆 2 ropes share the crate') : lv <= 2 ? 'Ropes holding the crate share the weight' : ''); return cosChips(ch, T.R); }
    if(T.kd === 'rope'){ l3Head('📏 Rope trade', 'You lift the crate <b>' + T.up + ' m</b> with <b>' + T.N + ' ropes</b> holding it. How much rope do you pull?', lv <= 3 ? 'Less force… but more rope!' : ''); return cosChips(ch, T.R); }
    l3Head('🧰 Simple machines', 'A <b>' + T.c[1] + '</b> ' + T.c[0] + ' is which simple machine?', lv <= 2 ? 'Lever · wheel + axle · pulley · ramp · wedge · screw' : ''); cosChips(ch, T.R); },
  ans(v){ const T = L3.T; if(L3.solved) return;
    if(v === T.R){ T.k = 0.001;
      if(T.kd === 'bar'){ const e = liftPush(T.L, T.p); return l3Right('Spot ' + T.R + ': you push only about ' + Math.round(e) + ' kg — one hand! The pivot near the crate gives your side the LONG arm', {found: liftFound(T), recap: '🪨 ' + T.L + ' kg crate → pivot near it → 1 ✋'}); }
      if(T.kd === 'hands') return l3Right(T.L + ' kg × ' + T.p + ' ÷ ' + (10 - T.p) + ' = ' + (Number(T.R) * 10) + ' kg = ' + T.R + ' hand' + (T.R === '1' ? '' : 's'), {found: liftFound(T), recap: '🖐️ ' + T.L + ' kg → ' + T.R + ' ✋'});
      if(T.kd === 'type') return l3Right(LIFT_MID[T.R][1] + '! In a ' + T.t[1] + ', ' + T.t[3], {recap: T.t[0] + ' ' + T.t[1] + ': ' + LIFT_MID[T.R][0] + ' in the middle'});
      if(T.kd === 'pul') return l3Right(T.N === 1 ? 'Still ' + T.R + ' kg — one rope only turns the pull around (pulling DOWN is easier: your own weight helps)' : T.L + ' kg ÷ ' + T.N + ' ropes = ' + T.R + ' kg — the ropes share the crate', {found: liftFound(T), recap: '🪝 ' + T.N + ' ropes → ' + T.R + ' kg'});
      if(T.kd === 'rope') return l3Right(T.up + ' m × ' + T.N + ' ropes = ' + T.R + ' m of rope. Less force, more rope — you never get work for free!', {recap: '📏 ' + T.N + ' ropes → ' + T.R + ' m of rope'});
      return l3Right(LIFT_MACH[T.R][1] + '! ' + T.c[1].charAt(0).toUpperCase() + T.c[1].slice(1) + ': ' + T.c[3], {recap: T.c[0] + ' ' + T.c[1] + ' = ' + LIFT_MACH[T.R][0] + ' ' + LIFT_MACH[T.R][1]}); }
    geoOff(v); const n = Number(v);
    if(T.kd === 'bar'){ const s = T.spots.find(x => T.lab[x] === v), e = Math.round(liftPush(T.L, s)); return l3Wrong('At ' + v + ' you push about ' + e + ' kg — that’s ' + liftHands(e) + ' hands. Move the pivot closer to the crate.'); }
    if(T.kd === 'hands') return l3Wrong(n === T.L / 10 ? 'That’s with no lever at all — the long push arm makes it easier.' : (n > Number(T.R) ? 'Fewer!' : 'More!') + ' push = ' + T.L + ' × ' + T.p + ' ÷ ' + (10 - T.p) + (L3.miss >= 1 ? ' = ' + (Number(T.R) * 10) + ' kg.' : '. Try again.'));
    if(T.kd === 'type') return l3Wrong(LIFT_MID[v][1] + ' is at an end of a ' + T.t[1] + '. Look again: where does it bend, where is the load, where do you push?');
    if(T.kd === 'pul') return l3Wrong(n === T.L && T.N > 1 ? 'That is the whole crate — but ' + T.N + ' ropes share it.' : 'Each rope holds the same share: ' + T.L + ' kg ÷ ' + T.N + (L3.miss >= 1 ? ' = ' + T.R + ' kg.' : '. Try again.'));
    if(T.kd === 'rope') return l3Wrong(n === T.up ? 'Your hand moves further than the crate — every rope holding it gets ' + T.up + ' m shorter.' : 'Each of the ' + T.N + ' ropes gets ' + T.up + ' m shorter — add them up.');
    l3Wrong(LIFT_MACH[v][1] + '? Think about what the ' + T.c[1] + ' does.'); },
  reveal(T){ T.k = 0.001; return T.kd === 'bar' ? 'Spot ' + T.R + '.' : T.kd === 'hands' ? T.R + ' hands.' : T.kd === 'type' ? LIFT_MID[T.R][1] + '.' : T.kd === 'pul' ? T.R + ' kg.' : T.kd === 'rope' ? T.R + ' m.' : LIFT_MACH[T.R][1] + '.'; },
  step(dt){ const T = L3.T; if(T && T.k > 0 && T.k < 1) T.k = dt ? Math.min(1, T.k + dt / 1.2) : 1; },
  crate(g, x, y, s, T, kg){ // a wooden crate with YOUR thing on top (bottom-centre at x, y)
    g.fillStyle = '#B9814A'; rr3(g, x - s / 2, y - s, s, s, s * 0.08); g.fill(); g.strokeStyle = '#7A4F27'; g.lineWidth = Math.max(2, s * 0.05); g.stroke();
    g.beginPath(); g.moveTo(x - s / 2, y - s); g.lineTo(x + s / 2, y); g.moveTo(x + s / 2, y - s); g.lineTo(x - s / 2, y); g.stroke();
    geoTxt(g, kg + ' kg', x, y - s * 0.5, Math.max(11, s * 0.28), '#FFF6D8');
    if(T.a){ const th = geoThumb(T.a), ts = s * 0.95; g.drawImage(th, x - ts / 2, y - s - ts * 0.92, ts, ts); } else emo(g, '📦', x, y - s * 1.35, s * 0.6); },
  draw(g, W, H, T){ const fs = geoFs(H), HH = H - geoTop(W, H), k = L3.solved ? (T.k || 1) : 0, e = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const lg = typeof L3GLOW === 'string', bg = g.createLinearGradient(0, 0, 0, HH); bg.addColorStop(0, lg ? 'rgba(66,48,16,0.62)' : '#20365A'); bg.addColorStop(1, lg ? 'rgba(18,28,54,0.66)' : '#152741'); g.fillStyle = bg; rr3(g, W * 0.02, 2, W * 0.96, HH - 4, 16); g.fill();
    if(lg){ g.save(); g.strokeStyle = 'rgba(255,210,120,0.55)'; g.lineWidth = 1.5; g.shadowColor = 'rgba(255,190,60,0.35)'; g.shadowBlur = 14; g.stroke(); g.restore(); }
    const gy = HH * 0.8; g.fillStyle = '#3A5478'; rr3(g, W * 0.04, gy, W * 0.92, Math.min(HH * 0.05, 22), 8); g.fill();
    if(T.kd === 'bar' || T.kd === 'hands'){
      const Lp = Math.min(W * 0.84, HH * 2.3), x0 = (W - Lp) / 2, ux = Lp / 10, ph = Math.max(fs * 1.4, HH * 0.13), cs = Math.min(ux * 1.7, HH * 0.2);
      const piv = T.kd === 'hands' || L3.solved ? T.p : null, py = gy - ph, ang = piv != null ? -0.2 * e(k) : 0;
      const P = pos => { const px = x0 + (piv != null ? piv : 5) * ux, dx = (pos - (piv != null ? piv : 5)) * ux; return [px + dx * Math.cos(ang), py + dx * Math.sin(ang)]; };
      if(piv == null) T.spots.forEach(s => { const x = x0 + s * ux; g.setLineDash([5, 5]); g.strokeStyle = 'rgba(255,224,138,0.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - ph * 0.55, gy); g.lineTo(x, py); g.lineTo(x + ph * 0.55, gy); g.closePath(); g.stroke(); g.setLineDash([]); geoTxt(g, T.lab[s], x, gy + fs * 0.75, fs, '#FFE08A'); });
      else { const x = x0 + piv * ux; g.fillStyle = '#FFC845'; g.beginPath(); g.moveTo(x - ph * 0.6, gy); g.lineTo(x, py); g.lineTo(x + ph * 0.6, gy); g.closePath(); g.fill(); }
      if(piv == null){ g.fillStyle = '#5B6F92'; [0.3, 9.7].forEach(s => { rr3(g, x0 + s * ux - ux * 0.25, py, ux * 0.5, gy - py, 4); g.fill(); }); }
      const A = P(0), B = P(10); g.strokeStyle = '#C08A4E'; g.lineWidth = Math.max(6, ux * 0.32); g.lineCap = 'round'; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke(); g.lineCap = 'butt';
      for(let i = 1; i < 10; i++){ const Q = P(i); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(Q[0] - 1, Q[1] - ux * 0.12, 2, ux * 0.24); }
      const C = P(0.75); g.save(); g.translate(C[0], C[1] - ux * 0.16); g.rotate(ang); this.crate(g, 0, 0, cs, T, T.L); g.restore();
      const Hn = P(9.6), hands = piv != null && L3.solved ? liftHands(liftPush(T.L, piv)) : 0;
      emo(g, '✋', Hn[0], Hn[1] - ux * 0.75 + (L3.solved ? ux * 0.3 * e(k) : 0), Math.min(ux * 1.2, fs * 2.2));
      if(T.kd === 'hands' && L3.lv <= 3 || L3.solved){ const pv = T.p; geoTxt(g, 'crate arm ' + pv, x0 + pv * ux * 0.5, gy + fs * (piv == null ? 1.9 : 0.8), fs * 0.8, '#C9D6EA'); geoTxt(g, 'push arm ' + (10 - pv), x0 + (pv + (10 - pv) / 2) * ux, gy + fs * (piv == null ? 1.9 : 0.8), fs * 0.8, '#C9D6EA'); }
      if(L3.solved) geoTxt(g, '✋ push ≈ ' + Math.round(liftPush(T.L, T.p)) + ' kg' + (hands ? ' · ' + hands + ' hand' + (hands > 1 ? 's' : '') : ''), W / 2, fs * 1.2, fs, '#7CFFB2');
      return; }
    if(T.kd === 'pul' || T.kd === 'rope'){
      const N = T.N, bx = W * 0.42, top = HH * 0.1, cs = Math.min(W * 0.16, HH * 0.22), rise = (T.kd === 'rope' ? HH * 0.18 : HH * 0.1) * e(k), cy = gy - rise, blockY = cy - cs * 1.55, R0 = Math.min(cs * 0.28, fs * 1.2);
      g.fillStyle = '#7C8597'; g.fillRect(W * 0.12, top - 8, W * 0.76, 8);
      g.strokeStyle = '#E8D7B0'; g.lineWidth = 3;
      const gap = Math.min(cs * 0.3, W * 0.04), xs = []; for(let i = 0; i < N; i++) xs.push(bx + (i - (N - 1) / 2) * gap);
      if(N === 1){ g.beginPath(); g.moveTo(bx, cy - cs * 1.05); g.lineTo(bx, top + R0); g.stroke(); }
      else { xs.forEach(x => { g.beginPath(); g.moveTo(x, blockY); g.lineTo(x, top + R0); g.stroke(); }); g.fillStyle = '#9AA6B2'; g.beginPath(); g.arc(bx, blockY, Math.max(R0, gap * N * 0.5), 0, 7); g.fill(); g.strokeStyle = '#5B6F92'; g.lineWidth = 3; g.stroke(); g.strokeStyle = '#E8D7B0'; g.beginPath(); g.moveTo(bx, blockY); g.lineTo(bx, cy - cs * 1.05); g.stroke(); }
      g.fillStyle = '#C9D6EA'; g.beginPath(); g.arc(bx, top + R0, R0, 0, 7); g.fill(); g.strokeStyle = '#5B6F92'; g.lineWidth = 3; g.stroke();
      const hx = Math.min(W * 0.8, bx + cs * 1.9), hy = gy - fs * 2.4 + rise * (T.kd === 'rope' ? 0 : 0.4);
      g.strokeStyle = '#E8D7B0'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx + R0, top + R0); g.lineTo(hx, hy); g.stroke(); emo(g, '✋', hx + fs * 0.2, hy + fs * 0.4, fs * 1.8);
      geoTxt(g, L3.solved ? (T.kd === 'rope' ? '📏 ' + T.R + ' m' : '💪 ' + T.R + ' kg') : '❓', hx, hy - fs * 1.3, fs * 1.1, L3.solved ? '#7CFFB2' : '#FFE08A');
      this.crate(g, bx, cy, cs, T, T.L);
      geoTxt(g, '🪢 ' + N + ' rope' + (N > 1 ? 's' : '') + ' hold' + (N > 1 ? '' : 's') + ' the crate', bx, gy + Math.min(HH * 0.05, 22) + fs * 1.1, fs * 0.85, '#C9D6EA');
      if(T.kd === 'rope' && L3.solved){ const x = W * 0.12; g.strokeStyle = '#FFE08A'; g.lineWidth = 2; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(x, gy); g.lineTo(x, cy); g.stroke(); g.setLineDash([]); geoTxt(g, '⬆ ' + T.up + ' m', x + fs * 1.6, (gy + cy) / 2, fs * 0.85, '#FFE08A'); }
      return; }
    if(T.kd === 'type'){
      const ex = W * 0.25, ey = HH * 0.45, es = Math.min(W * 0.24, HH * 0.5); emo(g, T.t[0], ex, ey, es); geoTxt(g, T.t[1], ex, ey + es * 0.62, fs * 0.9, '#fff');
      const bx0 = W * 0.48, bx1 = W * 0.92, by = HH * 0.5, order = LIFT_ORDER[T.R], showEnds = L3.lv <= 2 || L3.solved;
      g.strokeStyle = '#C08A4E'; g.lineWidth = Math.max(6, fs * 0.5); g.lineCap = 'round'; g.beginPath(); g.moveTo(bx0, by); g.lineTo(bx1, by); g.stroke(); g.lineCap = 'butt';
      order.forEach((key, i) => { const x = bx0 + (bx1 - bx0) * i / 2, mid = i === 1, show = mid ? L3.solved : showEnds, s = fs * 2.1;
        g.fillStyle = mid ? (L3.solved ? 'rgba(124,255,178,0.25)' : 'rgba(255,224,138,0.18)') : 'rgba(255,255,255,0.1)'; g.beginPath(); g.arc(x, by - s * 0.9, s * 0.75, 0, 7); g.fill();
        if(show){ if(key === 'pivot'){ g.fillStyle = '#FFC845'; g.beginPath(); g.moveTo(x - s * 0.4, by + s * 0.55); g.lineTo(x, by + 4); g.lineTo(x + s * 0.4, by + s * 0.55); g.closePath(); g.fill(); geoTxt(g, '▲', x, by - s * 0.9, s * 0.8, '#FFC845'); } else emo(g, LIFT_MID[key][0], x, by - s * 0.9, s * 0.95); }
        else geoTxt(g, '❓', x, by - s * 0.9, s * 0.8, '#FFE08A'); });
      return; }
    const ex = W * (L3.solved ? 0.3 : 0.5), ey = HH * 0.45, es = Math.min(W * 0.28, HH * 0.52); emo(g, T.c[0], ex, ey, es); geoTxt(g, T.c[1], ex, ey + es * 0.62, fs, '#fff');
    if(L3.solved){ const M = LIFT_MACH[T.R], mx = W * 0.72; geoTxt(g, '➜', W * 0.51, ey, fs * 2, '#7CFFB2'); emo(g, M[0], mx, ey, es * 0.8 * Math.min(1, 0.4 + k)); geoTxt(g, M[1], mx, ey + es * 0.62, fs, '#7CFFB2'); } }
};
Object.assign(KIND_UI, {lift: ['🏗️ Lifted with levers + pulleys!', () => startL3('lift'), 'right first time', 11]});
// the wide card in the Mechanic lab
function startLift(){ SET.labFrom = SET.labFrom || ''; startL3('lift'); }
/* ================= ⚙️ END SC-4 LIFT IT! (sc-4d2) ================= */
/* ================= ✨ sc-5b2b GLOW GLASS — ⚙️ Mechanic (🏗️ Lift it! + the ⚙️ test rig) =================
   Aowu 2026-11-17 17:40 "ok go" (⚗️ Chemistry first, ⚙️ Mechanic right after) + "i will be offline": the Glow Glass in GOLD on the last plain lab.
   🏗️ Lift it! (SEC3.machines on #scr-l3) = the sc-5b1 engine: gold glass string, 📦 → 🏗️ trip bar, its own ⚙️ Machine notebook (6 pages = the 6 round kinds).
   ⚙️ the test rig (#scr-play, opened from the Mechanic lab) gets the same gold: glass goal card, ①②③④ steps, gold / blue answer pills, and a gold sky
   with 3 slow meshing gears painted behind the rig (rigGlassBg — baked once per size, the gears turn while you test). Same tests, same saves. */
GLX.machines = ['rgba(255,205,90,0.36)', '#140C02', '📦', '🏗️', 'Machine notebook'];
(function(){ const s = 'machines', C = SEC3[s]; if(!C) return; C.glass = GLX[s][0]; C.glink = GLX[s][1]; C.trip = [GLX[s][2], GLX[s][3]]; NOTE_NAME[s] = GLX[s][4];
  const B = SEC3_BY_G[C.g]; if(B){ B.glass = C.glass; B.glink = C.glink; B.trip = C.trip; } })();
NOTE_KINDS.lift = ['bar', 'pul', 'hands', 'card', 'type', 'rope'];
// ⚙️ the test rig: gold glass only for the Mechanic lab's tests
function rigGlassMark(){ const s = $('scr-play'), on = SET.sec === 'mechanic'; if(!s) return on; s.classList.toggle('glx', on); s.classList.toggle('acc-m', on); return on; }
(function(){ const st = startTest; startTest = function(){ rigGlassMark(); return st.apply(this, arguments); }; })();
let RIG_SKY = null;
function rigGear(g, x, y, r, n, a){ g.save(); g.translate(x, y); g.rotate(a); g.beginPath();
  for(let i = 0; i < n * 2; i++){ const t0 = i * Math.PI / n, rr = i % 2 ? r : r * 1.16; g.lineTo(Math.cos(t0 - 0.12) * rr, Math.sin(t0 - 0.12) * rr); g.lineTo(Math.cos(t0 + 0.12) * rr, Math.sin(t0 + 0.12) * rr); }
  g.closePath(); g.moveTo(r * 0.36, 0); g.arc(0, 0, r * 0.36, 0, Math.PI * 2); g.stroke(); g.restore(); }
function rigGlassBg(g){ const s = $('scr-play'); if(!s || !s.classList.contains('glx')) return false;
  if(!RIG_SKY || RIG_SKY.w !== W || RIG_SKY.h !== H){ const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(W)); c.height = Math.max(1, Math.round(H)); const k = c.getContext('2d');
    const bg = k.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#17110A'); bg.addColorStop(1, '#0B0805'); k.fillStyle = bg; k.fillRect(0, 0, W, H);
    [[0.1, 0.08, 'rgba(255,190,60,0.30)'], [0.95, 0.6, 'rgba(90,150,230,0.26)'], [0.45, 1.05, 'rgba(230,110,60,0.22)']].forEach(n => {
      const r = Math.max(W, H) * 0.6, gr = k.createRadialGradient(W * n[0], H * n[1], 0, W * n[0], H * n[1], r); gr.addColorStop(0, n[2]); gr.addColorStop(1, 'rgba(0,0,0,0)'); k.fillStyle = gr; k.fillRect(0, 0, W, H); });
    k.strokeStyle = 'rgba(255,210,120,0.06)'; k.lineWidth = 1; for(let x = 0; x < W; x += 28){ k.beginPath(); k.moveTo(x, 0); k.lineTo(x, H); k.stroke(); } for(let y = 0; y < H; y += 28){ k.beginPath(); k.moveTo(0, y); k.lineTo(W, y); k.stroke(); }
    RIG_SKY = {w: W, h: H, c}; }
  g.drawImage(RIG_SKY.c, 0, 0, W, H);
  const t = (G && G.t) || 0, m = Math.min(W, H), r1 = m * 0.2, r2 = r1 * 0.6;
  g.save(); g.lineWidth = Math.max(2, m * 0.008); g.lineJoin = 'round';
  g.strokeStyle = 'rgba(255,214,107,0.13)'; rigGear(g, W - r1 * 0.55, H * 0.2, r1, 12, t * 0.25);
  g.strokeStyle = 'rgba(156,200,255,0.12)'; rigGear(g, W - r1 * 0.55 - (r1 + r2) * 1.02, H * 0.2 + r2 * 0.9, r2, 8, -t * 0.25 * 12 / 8 + 0.2);
  g.strokeStyle = 'rgba(255,176,112,0.11)'; rigGear(g, r1 * 0.45, H * 0.78, r1 * 0.8, 10, -t * 0.18);
  g.restore(); return true; }
/* ================= ✨ END sc-5b2b GLOW GLASS ================= */
/* ================= ✨ sc-5b3 GLOW GLASS — ⚛️ Quantum (cyan) + 🔬 Particle (violet) =================
   The 6 play screens (⚛️ Atom builder · 💡 LED colours · ✨ Glow charge-up · 🐱 Cat in the box · 🧱 Proton builder · 💥 Mini collider)
   get the class glx (they already carry acc-q / acc-p) → CSS block sc-5b3 (built by sc5b3_gen.py): nebula + ⚛️ orbit / 🔬 quark + ☄️ track
   sparkles, glass cards, white words outlined + glowing, glass steppers + neon pills. Every answer line turns into the shared cards (gSay):
   ✅ Right! + 💡 You learned (+ 📇 element / particle card chip) · 🤏 So close! · 📖 The answer. The "1/5" count = a trip bar
   (⚛️ → ✨ in Quantum, ☄️ → 💥 in Particle). Light canvas words get the lab's glow (glxText). Games, rounds, scores and saves are unchanged. */
const QP_GLASS = {
  atom:  {scr: 'scr-atom', msg: 'am-msg',   bar: 'abar',  B: () => ABAR,  key: 'atom', G: () => AG,  glow: 'rgba(110,235,255,0.36)', trip: ['⚛️', '✨'], chip: () => qpCardChip()},
  led:   {scr: 'scr-led',  msg: 'led-msg',  bar: 'lbar',  B: () => LBAR,  key: 'led',  G: () => LG,  glow: 'rgba(110,235,255,0.36)', trip: ['⚛️', '✨']},
  glow:  {scr: 'scr-glow', msg: 'glow-msg', bar: 'wbar',  B: () => WBAR,  key: 'glow', G: () => WG,  glow: 'rgba(110,235,255,0.36)', trip: ['⚛️', '✨']},
  cat:   {scr: 'scr-cat',  msg: 'cat-msg',  bar: 'cbar',  B: () => CBAR,  key: 'cat',  G: () => CG,  glow: 'rgba(110,235,255,0.36)', trip: ['⚛️', '✨']},
  quark: {scr: 'scr-qk',   msg: 'qk-msg',   bar: 'kbar',  B: () => KBAR,  key: 'qk',   G: () => KG,  glow: 'rgba(210,150,255,0.36)', trip: ['☄️', '💥'], chip: () => qpPartChip(KG && KG.parts)},
  col:   {scr: 'scr-col',  msg: 'col-msg',  bar: 'clbar', B: () => CLBAR, key: 'col',  G: () => CLG, glow: 'rgba(210,150,255,0.36)', trip: ['☄️', '💥'], chip: () => qpPartChip(CLG && CLG.parts)}};
function qpGlassMark(){ Object.keys(QP_GLASS).forEach(k => { const s = $(QP_GLASS[k].scr); if(s) s.classList.add('glx'); }); }
function qpGlass(k){ const s = $(QP_GLASS[k].scr); return !!(s && s.classList.contains('glx')); }
// 📇 chips: the element card this atom gives you · your particle cards after this answer
function qpCardChip(){ const T = AG && AG.list && AG.list[AG.i]; return typeof chemCardChip === 'function' && T ? chemCardChip([T.z]) : null; }
function qpPartChip(parts){ const have = (CHEM && CHEM.p) || [], fresh = (parts || []).filter((p, i, a) => have.indexOf(p) < 0 && a.indexOf(p) === i);
  return {isNew: fresh.length > 0, t: '📇 ' + (fresh.length ? 'New particle! ' : '') + (have.length + fresh.length) + ' / 17'}; }
// 🔁 the games write plain lines ("✅ … · +60", "🤔 …", "❌ …"); glass screens turn them into the cards right after (same tick, before paint)
function qpDress(k){ const C = QP_GLASS[k], el = $(C.msg), G = C.G(); if(!el || !qpGlass(k)) return;
  const raw = el.textContent || ''; if(!raw || el.__qp === el.innerHTML) return;
  let kind = null, txt = raw.trim(), pts = 0;
  if(/^✅/.test(txt)){ kind = 'ok'; txt = txt.replace(/^✅\s*/, '');
    const m = txt.match(/(?:\s*[·.]\s*)\+(\d+)(?=\s*(?:·|$))/); if(m){ pts = +m[1]; txt = txt.replace(m[0], ''); }
    txt = txt.replace(/\s*·\s*📇 new card\s*$/, ''); txt = txt.replace(/ light light\b/, ' light');   /* ✨ glow: 'UV black light light' (sc-6) */ if(G){ G.okAt = G.okAt || {}; G.okAt[G.i] = true; } }
  else if(/^🤔/.test(txt)){ txt = txt.replace(/^🤔\s*/, ''); kind = G && G.solved ? 'end' : 'try'; }
  else if(/^❌/.test(txt) || (G && G.solved)) kind = 'end';
  if(!kind){ el.__qp = el.innerHTML; return; }   // a progress line (⚡ 1 of 2 drops · 🧱 3 quarks is full …) stays a glass pill
  gSay(el, kind, UI.esc(txt), pts, kind === 'ok' && C.chip ? C.chip() : null); el.__qp = el.innerHTML; qpTrip(k); }
// ⚛️ → ✨ / ☄️ → 💥 trip bar (one stop per round) in place of the "n / 5" count
function qpTrip(k){ const C = QP_GLASS[k], G = C.G(), B = C.B(); if(!G || !G.list || !qpGlass(k)) return;
  if(typeof chemTrip === 'function'){ const keep = CHEM_TRIP.slice(); CHEM_TRIP[0] = C.trip[0]; CHEM_TRIP[1] = C.trip[1];
    try{ chemTrip(C.bar, B, C.key, G.i, G.list.length, G.solved, G.okAt || {}); } finally { CHEM_TRIP[0] = keep[0]; CHEM_TRIP[1] = keep[1]; } } }
(function(){
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', qpGlassMark); else qpGlassMark();
  const go = () => Object.keys(QP_GLASS).forEach(k => { const el = $(QP_GLASS[k].msg); if(!el || !window.MutationObserver) return;
    new MutationObserver(() => { try{ qpDress(k); }catch(e){} }).observe(el, {childList: true, characterData: true, subtree: true}); });
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  const after = (f, fn) => function(){ const r = f.apply(this, arguments); try{ fn(); }catch(e){} return r; };
  atomNext = after(atomNext, () => qpTrip('atom')); ledNext = after(ledNext, () => qpTrip('led')); glowNext = after(glowNext, () => qpTrip('glow'));
  catNext = after(catNext, () => qpTrip('cat')); qkNext = after(qkNext, () => qpTrip('quark')); colNext = after(colNext, () => qpTrip('col'));
  // ✨ light words on the 4 canvases: dark outline, then the lab's glow
  const lit = (f, k, id) => function(){ const cv = $(id); if(cv && qpGlass(k)){ glxText(cv.getContext('2d')); window.L3GLOW = QP_GLASS[k].glow; } try{ return f.apply(this, arguments); } finally { window.L3GLOW = false; } };
  drawAtomNow = lit(drawAtomNow, 'atom', 'am-atom'); drawGlow = lit(drawGlow, 'glow', 'glow-cv'); drawQk = lit(drawQk, 'quark', 'qk-cv'); drawCol = lit(drawCol, 'col', 'col-cv');
})();
/* ================= ✨ END sc-5b3 GLOW GLASS ================= */
/* ================= 🔬 sc-6 — ◀ back to the lab's mode picker · 📒 Quantum notebook · 🎵 lab moods =================
   Aowu 2026-11-17 22:01 "do both optional and also a back button should go back to select a mode inside a mode, like chemistry has 4 mode a but should go back there".
   ◀ on every play screen now goes back to its own lab hub (◀ Chemistry · ◀ Kitchen lab · ◀ Quantum · ◀ Particle · ◀ Thermo … · ◀ Mechanic — short, like the hubs' own ◀ Chemistry / ◀ Particle),
   asking first while a round is on (same card as the shared bar). 🎚️ Levels and 🏠 stay as they were. UiKit is not touched: one capture listener per page.
   📒 Quantum notebook: 💡 LED colours (7) · ✨ glow light (4) · 🐱 cat odds (10) = 21 pages, chip on the ✅ card + result-card line (server already keeps the pages).
   🎵 each lab plays its own take on the Sciencetory "Lab hum" while a play screen is open (UISound.mood): tension grows through the round, lifts on a ✅, stops on the result card / leaving. */
// ---------- ◀ back to the lab hub ----------
const SC6_BACK = {
  gbar:  () => [SET.labFrom && SEC3[SET.labFrom] ? SEC3[SET.labFrom].name + ' tests' : 'Mechanic', () => !!(G && G.phase !== 'done'), () => { hideResult(); stopLoop(); G = null; if(BUD){ BUD.stop(); BUD = null; } openLevel(SET.level); }],
  hbar:  () => ['Chemistry', () => !!(HG && !HG.done), () => leaveChem(false)],
  fbar:  () => ['Chemistry', () => !!(FG && !FG.done), () => leaveChem(false)],
  xbar:  () => ['Kitchen lab', () => !!(XG && !XG.done), () => leaveXlab()],
  abar:  () => ['Quantum', () => !!(AG && !AG.done), () => leaveQuantum(false)],
  lbar:  () => ['Quantum', () => !!(LG && !LG.done), () => leaveQuantum(false)],
  wbar:  () => ['Quantum', () => !!(WG && !WG.done), () => leaveQuantum(false)],
  cbar:  () => ['Quantum', () => !!(CG && !CG.done), () => leaveQuantum(false)],
  kbar:  () => ['Particle', () => !!(KG && !KG.done), () => leaveParticle(false)],
  clbar: () => ['Particle', () => !!(CLG && !CLG.done), () => leaveParticle(false)],
  l3:    () => [SET.sec === 'machines' ? 'Mechanic' : (SEC3[SET.sec] || {}).name || 'Lab', () => !!(L3 && !L3.done), () => leaveSec3(false)]};
function sc6Of(bar){ if(!bar) return null; const id = bar.id || ''; return SC6_BACK[id] ? SC6_BACK[id]() : /^l3bar-/.test(id) ? SC6_BACK.l3() : null; }
// name every play bar's ◀ (and the folded-menu ◀) after the hub it goes to
function sc6Label(){ document.querySelectorAll('.gb').forEach(bar => { const C = sc6Of(bar); if(!C) return; const t = ' ' + C[0];
  const b = bar.querySelector('.gb-back .gt'); if(b && b.textContent !== t) b.textContent = t;
  const f = bar.querySelector('.gb-fback'); if(f && f.lastChild && f.lastChild.textContent !== C[0]) f.lastChild.textContent = C[0];
  const bb = bar.querySelector('.gb-back'); if(bb){ bb.title = 'Back to the ' + C[0]; bb.setAttribute('aria-label', 'Back to the ' + C[0]); } }); }
var SC6_LOG = [];   // tests: where each ◀ went
function sc6Back(bar){ const C = sc6Of(bar); if(!C) return false; const go = () => { SC6_LOG.push(C[0]); try{ C[2](); }catch(e){ console.error(e); } };
  if(!C[1]()) { go(); return true; }
  try{ UISound.moodPause(true, 'bar'); }catch(e){}
  UI.confirm({icon: '◀', title: 'Leave the game?', body: 'This game will not be saved.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { try{ UISound.moodPause(false, 'bar'); }catch(e){} if(ok) go(); });
  return true; }
document.addEventListener('click', e => { const t = e.target && e.target.closest ? e.target.closest('.gb-back, .gb-fback') : null; if(!t) return; const bar = t.closest('.gb');
  if(!bar || !sc6Of(bar)) return; if(t.classList.contains('gb-back') && bar.classList.contains('gb-fold')) return;   // folded: ◀ opens the small menu (its ◀ row comes here)
  e.stopImmediatePropagation(); e.preventDefault(); const m = bar.querySelector('.gb-fmenu'); if(m) m.classList.add('hidden'); try{ UISound.play('tap'); }catch(err){} sc6Back(bar); }, true);
// ---------- 📒 Quantum notebook (💡 ✨ 🐱) ----------
const QN_KINDS = {led: ['red', 'orange', 'yellow', 'green', 'blue', 'violet', 'mix'], glow: ['green', 'blue', 'uv', 'red'], cat: ['1in2', '1in3', '2in3', '1in4', '3in4', '1in5', '3in8', '1in10', '3in10', '7in10']};
const QN_G = {led: () => LG, glow: () => WG, cat: () => CG};
function qNoteBook(){ const keys = [], have = (CHEM.nb || []).slice(); Object.keys(QN_KINDS).forEach(k => { QN_KINDS[k].forEach(d => keys.push(k + '.' + d)); const G = QN_G[k](); if(G && G.learn) G.learn.forEach(x => have.push(x)); });
  return {n: keys.filter(x => have.indexOf(x) >= 0).length, of: keys.length, name: 'Quantum notebook'}; }
function qNotePage(k){ if(k === 'led'){ const T = LG && LG.list[LG.i]; return T ? (T.mix ? 'mix' : (LED_COL[T.d] || {}).k) : ''; }
  if(k === 'glow') return WG ? WG.light || '' : ''; if(k === 'cat'){ const T = CG && CG.list[CG.i]; return T ? T.a + 'in' + T.b : ''; } return ''; }
function qNoteAdd(k, pg){ const G = QN_G[k](); if(!G || !pg || QN_KINDS[k].indexOf(pg) < 0) return false; const key = k + '.' + pg; G.learn = G.learn || [];
  if((CHEM.nb || []).indexOf(key) >= 0 || G.learn.indexOf(key) >= 0) return false; G.learn.push(key); return true; }
function qNoteChip(k){ const isNew = qNoteAdd(k, qNotePage(k)), B = qNoteBook(); return {isNew, t: '📒 ' + (isNew ? 'New page! ' : '') + B.n + ' / ' + B.of}; }
QP_GLASS.led.chip = () => qNoteChip('led'); QP_GLASS.glow.chip = () => qNoteChip('glow'); QP_GLASS.cat.chip = () => qNoteChip('cat');
(function(){
  // 🔴 red can't charge glow paint — finding that out is a page too
  const gc = glowCharge; glowCharge = function(){ const was = WG && WG.redSaid, r = gc.apply(this, arguments); try{ if(WG && !was && WG.redSaid) qNoteAdd('glow', 'red'); }catch(e){} return r; };
  // the pages travel with the save (sciChemSave keeps "<kind>.<page>" for any kind)
  const cs = chemSave; chemSave = function(kind, res){ try{ if(QN_KINDS[kind] && res && !res.learn){ const G = QN_G[kind](); res.learn = (G && G.learn || []).slice(); } }catch(e){} return cs.apply(this, arguments); };
})();
// ---------- 🎵 lab moods ----------
const SC6_MOOD = {mechanic: {key: 'G', lead: 'piano'}, machines: {key: 'G', lead: 'piano', bpm: 78}, chem: {key: 'A', lead: 'pluck'}, kitchen: {key: 'C', lead: 'marimba', bpm: 88},
  quantum: {key: 'B', lead: 'bell', sparkle: .6}, particle: {key: 'C#', lead: 'chip', bpm: 92, leadGain: .55}, thermo: {key: 'F', lead: 'marimba'}, electro: {key: 'E', lead: 'chip', bpm: 90, leadGain: .55},
  optics: {key: 'E', lead: 'bell', sparkle: .6}, acoustics: {key: 'D', lead: 'flute'}, geo: {key: 'D', lead: 'piano', bpm: 74}, bio: {key: 'G', lead: 'marimba', bpm: 86}, cosmic: {key: 'Eb', lead: 'bell', bpm: 70, sparkle: .75}};
const SC6_PLAY = {play: () => [SET.sec === 'mechanic' || !SET.sec ? 'mechanic' : SET.sec, () => G], hunt: () => ['chem', () => HG], formula: () => ['chem', () => FG], exp: () => ['kitchen', () => XG],
  atom: () => ['quantum', () => AG], led: () => ['quantum', () => LG], glow: () => ['quantum', () => WG], cat: () => ['quantum', () => CG], qk: () => ['particle', () => KG], col: () => ['particle', () => CLG],
  l3: () => [SET.sec || 'thermo', () => L3]};
var SCI_MOOD = null, SC6_MLAB = '', SC6_MSCR = '', SC6_LIFTS = 0, SC6_OKEL = null;
function sc6MoodRecipe(lab){ const base = (UISound.MOODS && UISound.MOODS.sciencetory) || null; if(!base) return 'sciencetory';
  return Object.assign({}, base, SC6_MOOD[lab] || {}, {id: 'sciencetory-' + lab}); }
function sc6MoodStop(){ if(SCI_MOOD){ try{ SCI_MOOD.stop(); }catch(e){} } SCI_MOOD = null; SC6_MLAB = ''; SC6_MSCR = ''; }
function sc6MoodFor(name){ const P = SC6_PLAY[name]; if(!P || !window.UISound || !UISound.mood){ sc6MoodStop(); return; } const [lab] = P();
  if(SCI_MOOD && SC6_MLAB === lab && SC6_MSCR === name) return; sc6MoodStop();
  try{ SCI_MOOD = UISound.mood(sc6MoodRecipe(lab)); SC6_MLAB = lab; SC6_MSCR = name; }catch(e){ SCI_MOOD = null; } }
setInterval(() => { if(!SCI_MOOD || !SC6_MSCR) return; const scr = $('scr-' + SC6_MSCR); if(!scr || scr.classList.contains('hidden')){ sc6MoodStop(); return; }
  if(!$('result').classList.contains('hidden')){ sc6MoodStop(); return; }
  const Gx = SC6_PLAY[SC6_MSCR]()[1](); if(Gx){ const n = Gx.list ? Gx.list.length : 0, i = Math.min(Gx.i || 0, n), lv = SET.level || 0; try{ SCI_MOOD.tension(Math.max(0, Math.min(1, (n ? i / n : 0) * 0.6 + lv / 5 * 0.4))); }catch(e){} }
  const ok = scr.querySelector('.fm-msg.ok'); if(ok && ok !== SC6_OKEL){ SC6_OKEL = ok; SC6_LIFTS++; try{ SCI_MOOD.lift(); }catch(e){} } if(!ok) SC6_OKEL = null; }, 400);
(function(){
  const ss = showScreen; showScreen = function(name){ const r = ss.apply(this, arguments); try{ sc6Label(); sc6MoodFor(name); }catch(e){} return r; };
  const sr = showResult; showResult = function(){ try{ sc6MoodStop(); }catch(e){} return sr.apply(this, arguments); };
})();
/* ================= 🔬 END sc-6 ================= */

/* ================= 📏 S2 SCILAB — labs load when they open (📏 Split chat, File Split plan §S2) =================
   A lab moved out of this page lives in SciLab_<lab>.html (built by Test Harness/scilab/build_scilab.py from scilab/labs/<lab>.js + .css —
   edit those). SCILAB_OF = SET.sec → lab file. ▶ Start / a link opens a lab only after its file is in (SciLab.need, with the lab's own
   loader); picking the lab on the setup page starts the download early. 📲 offline app + tests: every lab file is inline (Code.gs
   INCLUDE_ALSO_ SciLab) → need() answers at once. The lab's level cards (SEC3.<lab> + *_LVL) stay HERE so the setup page can show them. */
const SCILAB_OF = {cosmic: 'cosmic', thermo: 'thermo', electro: 'electro', optics: 'optics', acoustics: 'acoustics', geo: 'geo', bio: 'bio'};
function sciLabNeed(sec, go){ const f = SCILAB_OF[sec]; if(!f || !window.SciLab || SciLab.has(f)) return go(true);
  const C = SECTIONS.find(x => x.k === sec) || {}; UI.loading('sciencetory', (C.icon || '🔬') + ' Opening ' + (C.name || 'the') + ' lab…');
  SciLab.need(f, ok => { UI.loaded(); if(ok) return go(true); UISound.play('error'); UI.toast('📡 The ' + (C.name || '') + ' lab did not load — check the internet, then tap ▶ Start again', 'err'); go(false); }); }
const sciOpenSection0 = openSection;
openSection = function(lv){ sciLabNeed(SET.sec, ok => { if(ok) sciOpenSection0(lv); }); };
const sciMarkModes0 = markModes;
markModes = function(){ const r = sciMarkModes0.apply(this, arguments); const f = SCILAB_OF[SET.sec]; if(f && window.SciLab && !SciLab.has(f)) SciLab.need(f); return r; };
/* ================= 📏 END S2 SCILAB ================= */
boot();
