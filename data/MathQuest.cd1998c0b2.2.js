
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ modes-3: ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const GAME_ID = 'math-quest';
// 🎛️ p1b: the shared top bar (UiKit UI.gameBar) — ◀ where you came from · 🎚️ Levels · 🏠 | 🧮 Math Quest · level | scoreboard | game buttons ❓ ⚙️
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🧮', name: 'Math Quest', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => { try{ clearInterval(timerId); }catch(e){} try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => { if(typeof pauseGame === 'function') pauseGame(); }, resume: () => { if(typeof resume === 'function') resume(); }},
  onFit: () => { if(G && typeof layout === 'function') layout(); },
  extras: [{id: 'voice-btn', icon: '🔈', label: 'Read the questions out loud', onClick: () => toggleVoice()}]});
function paintVoice(){ BAR.extra('voice-btn', {icon: voiceOn ? '🔊' : '🔈', label: voiceOn ? 'Voice: on' : 'Voice: off'}); }
var NAV_INNER = {menu: ['◀ Math Quest', () => openCover()]};   // 🧱 b3w6c: the setup's top button goes back to the 🎬 cover
UI.navBar(document.getElementById('back-btn'), {onclick: false});
const $ = id => document.getElementById(id);
const pick = a => a[rnd(a.length)];
const randInt = (a, b) => a + rnd(b - a + 1);
function fmt(ms){ const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function say(text){ try{ if(window.MQ_SAY_LOG) MQ_SAY_LOG.push({lang: 'en', text}); if(!UISound.get().enabled || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.pitch = 1.2; u.volume = Math.max(0.2, UISound.get().volume); speechSynthesis.speak(u); }catch(e){} }
function shuffle(a){ for(let i = a.length - 1; i > 0; i--){ const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ================= LEVELS · SERIES · WORLDS ================= */
// One progress line for the game (server: LEVEL_GAMES['math-quest']): the level is the difficulty, the series (➕ ➖ ✖️ ➗ 🔀)
// and the world are pickers. Passing a level in any series opens the next level for every series.
// add/sub: biggest number · mul: [max rows, max per row] · div: [max divisor, max answer]
const LEVELS = [
  {name: 'Basic', emoji: '🌱', qs: 8, time: 120, choices: 3, add: 5, mul: [2, 5], div: [2, 4], missing: 0, words: 0, blurb: 'Count the pictures — numbers up to 5'},
  {name: 'Junior', emoji: '🐣', qs: 10, time: 120, choices: 3, add: 10, mul: [3, 5], div: [3, 5], missing: 0, words: 0, blurb: 'Up to 10, with pictures and a number line'},
  {name: 'Intermediate', emoji: '🔦', qs: 10, time: 100, choices: 4, add: 20, mul: [5, 10], div: [5, 10], missing: 0.25, words: 0.15, blurb: 'Up to 20 and missing numbers'},
  {name: 'Hard', emoji: '⚡', qs: 12, time: 95, choices: 4, add: 100, mul: [12, 12], div: [12, 12], tables: [7, 8, 9, 11, 12, 13], missing: 0.3, words: 0.3, blurb: 'Two-digit numbers, times tables, story sums'},
  {name: 'Extreme', emoji: '🌋', qs: 12, time: 90, choices: 4, add: 1000, mul: [12, 12], div: [12, 12], tables: [9, 12, 13, 14, 15, 16, 17], big: true, missing: 0.35, words: 0.35, blurb: 'Big numbers, quick thinking'},
  // 💀 Hardcore: Extreme numbers (and bigger), the fastest clock, no hints — one wrong answer ends the round. ×3 points.
  {name: 'Hardcore', emoji: '💀', qs: 15, time: 80, choices: 4, add: 1000, mul: [12, 12], div: [12, 20], tables: [12, 13, 14, 15, 16, 17, 18, 19], big: true, missing: 0.4, words: 0.35, hardcore: true, blurb: 'One wrong answer ends it! No hints, ×3 points'}
];
// ⏱️ Minute Challenge (bonus card, opens after Intermediate): 60 s of Mixed sums, wrong answers don't end it — count ✅ and ❌.
// Times / share use the 6 7 8 9 11 12 tables (no easy 10s). Best result is kept on this device + sent as a feat.
const CHALLENGE = {name: 'Minute Challenge', emoji: '⏱️', qs: 999, time: 60, choices: 4, add: 100, mul: [12, 12], div: [12, 12], tables: [6, 7, 8, 9, 11, 12], missing: 0, words: 0, challenge: true, blurb: '60 seconds of mixed sums — how many can you get?'};
const SERIES = {
  // mult = points multiplier so the scores stay fair: ➕ is the easiest, 🔀 Mixed (switching every question) the hardest (Aowu 2026-11-03)
  add: {name: 'Add', icon: '➕', sym: '+', word: 'plus', mult: 1},
  sub: {name: 'Take away', icon: '➖', sym: '−', word: 'minus', mult: 1.15},
  mul: {name: 'Times', icon: '✖️', sym: '×', word: 'times', mult: 1.5},
  div: {name: 'Share', icon: '➗', sym: '÷', word: 'divided by', mult: 1.6},
  mix: {name: 'Mixed', icon: '🔀', sym: '', word: '', mult: 1.8}
};
const SERIES_KEYS = Object.keys(SERIES), OPS = ['add', 'sub', 'mul', 'div'];
function seriesMult(){ const k = (typeof G !== 'undefined' && G && G.series) || series; return (SERIES[k] || SERIES.add).mult || 1; }
// Each world: play colours, things to count, the story nouns, a mascot.
const WORLDS = {
  school: {name: 'School & College', icon: '🏫', sub: 'Pencils, books and apples', c: ['#FFE8B8', '#FF9F68'], dark: false, items: ['🍎', '✏️', '📚', '⭐', '🖍️'], noun: 'pencils', box: 'pencil cases', mascot: '🦉', deco: '🎓'},
  space: {name: 'Space', icon: '🚀', sub: 'Rocket base and stars', c: ['#241A5C', '#5B3BD8'], dark: true, items: ['⭐', '🪐', '🚀', '🌙', '☄️'], noun: 'stars', box: 'rockets', mascot: '🧑‍🚀', deco: '🛰️'},
  lab: {name: 'Science Lab', icon: '🔬', sub: 'Test tubes and bubbles', c: ['#C8F7F0', '#5BC0EB'], dark: false, items: ['🧪', '🧫', '⚗️', '🫧', '🔬'], noun: 'test tubes', box: 'racks', mascot: '🤖', deco: '⚛️'},
  animals: {name: 'Animals', icon: '🐾', sub: 'Puppies, kittens and chicks', c: ['#C9F2C7', '#5CC45A'], dark: false, items: ['🐶', '🐱', '🐰', '🐥', '🐢'], noun: 'puppies', box: 'baskets', mascot: '🦁', deco: '🌳'},
  market: {name: 'Market', icon: '🛒', sub: 'Fruit, veg and coins', c: ['#FFE3EC', '#FF7AA2'], dark: false, items: ['🍎', '🍌', '🥕', '🪙', '🍓'], noun: 'apples', box: 'bags', mascot: '🧺', deco: '🏷️'}
};
const WORLD_KEYS = Object.keys(WORLDS);
const AGE_START = {'4-5': 0, '6-7': 1, '8-9': 2, '10+': 3};
const PRAISE = ['Number whiz', 'Maths star', 'Super brain', 'Brilliant', 'Amazing'];
const RIGHT_WORDS = ['Yes!', 'Great!', 'Super!', 'Correct!', 'Nice one!', 'Brilliant!'];
const TIPS = {
  add: 'Tip: start with the bigger number and count on with your fingers.',
  sub: 'Tip: start at the big number and count back — or count up from the small one.',
  mul: 'Tip: times is quick adding — 3 × 4 is 4 + 4 + 4.',
  div: 'Tip: sharing is the times table backwards — 12 ÷ 3 asks "3 times what is 12?"',
  mix: 'Tip: look at the sign first — + − × ÷ — then work it out.'
};

/* ================= ➗ MQ-W1 MODES · WORDS · ANSWER WAY (plan `Math Quest — full plan.md` §3–§4) ================= */
// 🗂️ MODE GROUPS (mg-1): three boxes by type — same groups as Code.gs MODE_GROUPS_['math-quest'] (Gameroom chips).
const MODE_GROUPS = [
  {k: 'numbers', icon: '🔢', en: 'Numbers', th: 'ตัวเลข', c: '#3D7DD8'},
  {k: 'english', icon: '🔤', en: 'English', th: 'ภาษาอังกฤษ', c: '#E0457B'},
  {k: 'thai', icon: '🐘', en: 'Thai', th: 'ภาษาไทย', c: '#1F9D6A'}
];
const SOON_EN = '🔜 Coming soon', SOON_TH = '🔜 เร็ว ๆ นี้';
const MODES = [
  {k: 'classic', g: 'numbers', icon: '🧮', name: 'Classic', type: 'A number sums game', sub: 'Beat the clock with numbers'},
  {k: 'minute', g: 'numbers', icon: '⏱️', name: 'Minute Challenge', type: 'A 60-second race', sub: 'How many sums in a minute?'},
  {k: 'sign', g: 'numbers', icon: '❓', name: 'Missing sign', type: 'A sign-finding game', sub: 'Which sign makes it true?'},   // ➗ mq-w4
  {k: 'fix', g: 'numbers', icon: '🔍', name: 'Find the mistake', type: 'A maths detective game', sub: 'Spot the wrong step — then fix it'},   // ➗ mq-w4
  {k: 'clock', g: 'numbers', icon: '🕐', name: 'Clock maths', type: 'A time-telling game', sub: 'Read the clock, add the minutes'},   // ➗ mq-w4
  {k: 'worden', g: 'english', icon: '🔤', name: 'Word Sums', type: 'A reading maths game', sub: 'The sum is written in words', lang: 'en'},
  {k: 'storyen', g: 'english', icon: '📖', name: 'Story Problems', type: 'A real-life maths story', sub: 'Read the story, work out the answer', lang: 'en'},
  {k: 'tricken', g: 'english', icon: '🤔', name: 'Trick Questions', type: 'A think-twice puzzle', sub: 'The quick answer is a trap!', lang: 'en'},
  {k: 'testen', g: 'english', icon: '📝', name: 'Test Practice', type: 'School-style maths tests', sub: 'Grade 1–12 questions, like a real test', lang: 'en'},   // ➗ mq-t1
  {k: 'listenen', g: 'english', icon: '🎧', name: 'Listen', type: 'A listening maths game', sub: 'Hear the sum — no numbers on screen', lang: 'en'},   // ➗ mq-w5
  {k: 'wordth', g: 'thai', icon: '🐘', name: 'เลขคำไทย', type: 'เกมอ่านโจทย์ภาษาไทย', sub: 'อ่านโจทย์เป็นคำ แล้วหาคำตอบ', lang: 'th'},
  {k: 'storyth', g: 'thai', icon: '📜', name: 'โจทย์ปัญหา', type: 'โจทย์เรื่องราวในชีวิตจริง', sub: 'อ่านเรื่อง แล้วคิดหาคำตอบ', lang: 'th'},
  {k: 'trickth', g: 'thai', icon: '🙃', name: 'คำถามหลอก', type: 'ปริศนาคิดสองรอบ', sub: 'คำตอบที่คิดเร็ว ๆ คือกับดัก!', lang: 'th'},
  {k: 'testth', g: 'thai', icon: '📝', name: 'ข้อสอบ', type: 'ข้อสอบแบบโรงเรียนไทย', sub: 'โจทย์ ป.1 – ม.6 เหมือนข้อสอบจริง', lang: 'th'},   // ➗ mq-t1
  {k: 'listenth', g: 'thai', icon: '👂', name: 'ฟังโจทย์', type: 'เกมฟังโจทย์เลข', sub: 'ฟังโจทย์ ไม่มีตัวเลขบนจอ', lang: 'th'}   // ➗ mq-w5
];
const MODE_MULT = {classic: 1, minute: 1, worden: 1.1, wordth: 1.1, storyen: 1.3, storyth: 1.3, tricken: 1.3, trickth: 1.3, testen: 1.4, testth: 1.4, sign: 1.2, fix: 1.3, clock: 1.2, listenen: 1.3, listenth: 1.3};   // × on top of the series × (plan §3)
const TYPED_MULT = 1.25;                                                 // ⌨️ typed answers (plan §3b)
function modeOf(k){ return MODES.find(m => m.k === k) || MODES[0]; }
// ➗ mq-t2b: Thai rounds speak Thai on the play screen too (banners, 💡 button, level chip)
function isThaiMode(k){ return modeOf(k).lang === 'th'; }
const WORLD_TH = {school: 'โรงเรียน', space: 'อวกาศ', lab: 'ห้องแล็บวิทยาศาสตร์', animals: 'โลกสัตว์', market: 'ตลาด'};
const LEVEL_TH = {Basic: 'พื้นฐาน', Junior: 'เริ่มต้น', Intermediate: 'ปานกลาง', Hard: 'ยาก', Extreme: 'ยากมาก', Hardcore: 'สุดโหด'};
function tx(en, th){ return G && isThaiMode(G.mode) ? th : en; }
function mtx(en, th){ return isThaiMode(G ? G.mode : mode) ? th : en; }   // ➗ mq-t4b: the menu / levels screen follows the picked mode
const BLURB_TH = {Basic: 'เริ่มง่าย ๆ มีรูปช่วย ไม่ต้องรีบ', Junior: 'เลขเล็ก ๆ ค่อย ๆ คิด มีรูปช่วย', Intermediate: 'โจทย์ยาวขึ้น อ่านให้ดีแล้วคิดให้รอบคอบ', Hard: 'หลายขั้นตอน ต้องคิดเร็วขึ้น', Extreme: 'เลขใหญ่ คิดไว ๆ', Hardcore: 'ผิดข้อเดียวจบเกม! ไม่มีตัวช่วย ได้คะแนน ×3'};
function lvLabel(md, L){ const i = LEVELS.indexOf(L), th = isThaiMode(md);
  if(isTestMode(md) && i === 4 && testGrade !== 'mix') return gradeLabel(Number(testGrade), th ? 'th' : 'en');   // ➗ mq-t3
  if(isTestMode(md) && i === 5) return th ? 'สถานการณ์จริง' : 'Real life';   // ➗ mq-t4: short chip
  if(isTestMode(md) && i >= 0) return TEST_RANGE[th ? 'th' : 'en'][Math.min(i, TEST_BUILT)].replace(/^📝 /, '').replace(/ 🔜.*$/, '');   // 📝 the grade really played
  return th ? (LEVEL_TH[L.name] || L.name) : L.name; }
function isWordMode(k){ return k === 'worden' || k === 'wordth'; }
function isStoryMode(k){ return k === 'storyen' || k === 'storyth'; }   // ➗ mq-w2
function isTrickMode(k){ return k === 'tricken' || k === 'trickth'; }   // ➗ mq-w3
function isTestMode(k){ return k === 'testen' || k === 'testth'; }   // ➗ mq-t1
function caseTime(k, L){ return isTestMode(k) && L && L.hardcore ? 2.5 : 1; }   // ➗ mq-t4: 💀 cases = tables to read
function modeTime(k){ return isListenMode(k) ? 1.3 : isPzMode(k) ? ({sign: 1.3, fix: 1.6, clock: 1.4})[k] : isStoryMode(k) ? 1.7 : isTestMode(k) ? 1.6 : isTrickMode(k) ? 1.3 : 1; }   // 📝 tests: figures + reading time   // 🤔 tricks: +30 % reading time                 // 📖 stories need reading time: ×1.7 on the clock
// 🔤 English number words, British style ("one hundred and five") — 0 … 999 999
const EN_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function wordsEN(n){
  n = Math.floor(Math.abs(Number(n) || 0));
  if(n < 20) return EN_ONES[n];
  if(n < 100) return EN_TENS[Math.floor(n / 10)] + (n % 10 ? '-' + EN_ONES[n % 10] : '');
  if(n < 1000) return EN_ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + wordsEN(n % 100) : '');
  if(n < 1000000) return wordsEN(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? (n % 1000 < 100 ? ' and ' : ' ') + wordsEN(n % 1000) : '');
  return String(n);
}
// 🐘 Thai number words: 1 at the end of 11+ = เอ็ด (11 สิบเอ็ด · 21 ยี่สิบเอ็ด · 101 หนึ่งร้อยเอ็ด) · 20s = ยี่สิบ · 10 = สิบ · 100 = หนึ่งร้อย · 1000 = หนึ่งพัน
const TH_D = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const TH_PLACE = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];
function wordsTH(n){
  n = Math.floor(Math.abs(Number(n) || 0)); if(n === 0) return TH_D[0]; if(n >= 1000000) return String(n);
  const ds = String(n).split('').map(Number).reverse(); let s = '';
  for(let i = ds.length - 1; i >= 0; i--){ const d = ds[i]; if(!d) continue;
    if(i === 1) s += (d === 1 ? '' : d === 2 ? 'ยี่' : TH_D[d]) + 'สิบ';
    else if(i === 0) s += (d === 1 && n > 10) ? 'เอ็ด' : TH_D[d];
    else s += TH_D[d] + TH_PLACE[i]; }
  return s;
}
function thaiDigits(n){ return String(n).replace(/[0-9]/g, d => '๐๑๒๓๔๕๖๗๘๙'[d]); }
function wordsOf(n, lang){ return lang === 'th' ? wordsTH(n) : wordsEN(n); }
// spelling traps (real kid mistakes) — never the right word
const EN_TRAPS = [['forty', 'fourty'], ['nineteen', 'ninteen'], ['ninety', 'ninty'], ['fifteen', 'fiveteen'], ['fifty', 'fivety'], ['twelve', 'twelf'], ['eighteen', 'eightteen'], ['eighty', 'eigthy'], ['hundred', 'hundrid'], ['thirty', 'thirdy'], ['thirteen', 'thirdteen']];
function trapsEN(n){ const w = wordsEN(n), out = []; EN_TRAPS.forEach(([a, b]) => { if(new RegExp('(^|[ -])' + a + '($|[ -])').test(w)) out.push(w.replace(new RegExp('(^|[ -])' + a + '($|[ -])'), '$1' + b + '$2')); }); return out.filter(x => x !== w); }
function trapsTH(n){
  const w = wordsTH(n), out = [], tens = Math.floor(n / 10) % 10;
  if(n % 10 === 1 && tens !== 0) out.push(w.replace(/เอ็ด$/, 'หนึ่ง'));   // สิบหนึ่ง · ยี่สิบหนึ่ง (101 ร้อยหนึ่ง is said too, so no trap there)
  if(tens === 2) out.push(w.replace('ยี่สิบ', 'สองสิบ'));               // สองสิบ
  if(tens === 1) out.push(w.replace('สิบ', 'หนึ่งสิบ'));                // หนึ่งสิบ
  return out.filter(x => x && x !== w);
}
const SIGN_WORD = {en: {add: 'plus', sub: 'minus', mul: 'times', div: 'divided by', eq: 'equals'}, th: {add: 'บวก', sub: 'ลบ', mul: 'คูณ', div: 'หาร', eq: 'เท่ากับ'}};
// the sum written in words; the missing part = the glowing ?
function eqWordParts(q){
  const L = q.lang === 'th' ? 'th' : 'en', W = n => '<span class="wn">' + UI.esc(wordsOf(n, L)) + '</span>', blank = '<span class="q" id="qmark">?</span>', sw = SIGN_WORD[L];
  const a = q.missing === 'a' ? blank : W(q.a), b = q.missing === 'b' ? blank : W(q.b), r = q.missing ? W(q.ans) : blank;
  return a + ' <span class="wo">' + sw[q.op] + '</span> ' + b + ' <span class="wo">' + sw.eq + '</span> ' + r;
}
// what the ? turns into once answered
function shownAns(q){ if(q.trick || q.test) return q.right; return q.wordAns || q.form === 'w2n' ? wordsOf(q.ask, q.lang) : q.ask.toLocaleString(); }
// 🔤 / 🐘 a Word Sums question: the number engine (makeNums) + how it is shown (form) + word answers
//   form w2n = words shown, pick the number · n2w = numbers shown, pick the word · w2w = words → word · t2w = Thai digits → word
function makeWordQ(mode, ser, lvl, world, age, L){
  const th = mode === 'wordth', lang = th ? 'th' : 'en';
  const op = ser === 'mix' ? pick(lvl === 0 ? ['add', 'sub', 'add', 'sub', 'mul', 'div'] : OPS) : ser;
  const q = makeNums(op, lvl, L);
  q.missing = ''; q.word = ''; q.vis = null; q.lang = lang; q.mode = mode;
  const r = Math.random();
  if(lvl <= 1) q.form = 'w2n';
  else if(lvl === 2) q.form = r < 0.5 ? 'w2n' : 'n2w';
  else if(th && lvl === 5) q.form = r < 0.35 ? 't2w' : r < 0.55 ? 'n2w' : 'w2w';
  else if(th && lvl === 4) q.form = r < 0.4 ? 't2w' : 'w2w';
  else if(lvl === 5) q.form = r < 0.3 ? 'n2w' : 'w2w';
  else q.form = 'w2w';
  if(lvl >= 3 && L.missing && Math.random() < L.missing * 0.6) q.missing = Math.random() < 0.5 ? 'a' : 'b';
  if(pictures(lvl, age) && !q.missing) q.vis = visFor(q, WORLDS[world] || WORLDS.school, lvl);
  q.ask = q.missing === 'a' ? q.a : q.missing === 'b' ? q.b : q.ans;
  q.wordAns = q.form !== 'w2n';
  q.choices = choicesFor(q, L.choices);
  if(q.wordAns){
    q.askWord = wordsOf(q.ask, lang);
    q.wchoices = q.choices.map(n => ({w: wordsOf(n, lang), n, ok: n === q.ask}));
    if(lvl >= 3){ const t = th ? trapsTH(q.ask) : trapsEN(q.ask);
      if(t.length && (lvl >= 4 || Math.random() < 0.5)){ const i = q.wchoices.findIndex(c => !c.ok); if(i >= 0) q.wchoices[i] = {w: pick(t), n: -1, ok: false, trap: true}; } }
    const seen = new Set(); q.wchoices = q.wchoices.filter(c => !seen.has(c.w) && seen.add(c.w));
  }
  return q;
}
// 👆 / ⌨️ how this question is answered (plan §3b): words + tricks are always tapped; 🌱 🐣 tap · 💀 type · else the player's pick (✨ Auto = type from ⚡ Hard)
const ANS_WAYS = [{k: 'auto', icon: '✨', name: 'Auto', sub: 'tap first · type from ⚡ Hard'}, {k: 'choose', icon: '👆', name: 'Choose', sub: 'tap the answer'}, {k: 'type', icon: '⌨️', name: 'Type', sub: 'number pad · ×1.25 points'}];
function ansWay(q, lvl, ch){
  if(ch || q.wordAns) return 'choose';
  if(lvl <= 1) return 'choose';
  if(lvl === 5) return 'type';
  if(ansPick === 'choose' || ansPick === 'type') return ansPick;
  return lvl >= 3 ? 'type' : 'choose';
}
function qKey(q){ return q.op + q.a + '_' + q.b + (q.missing || '') + (q.form ? '-' + q.form : ''); }
// 🗣️ Thai voice: only a real Thai voice reads Thai — never the English voice (plan §9)
window.MQ_SAY_LOG = [];
let thWarned = false;
// ➗ mq-w5 🎧 listening needs a voice for the round's language (Thai: a real Thai voice — never the English one)
function isListenMode(k){ return k === 'listenen' || k === 'listenth'; }
function enVoice(){ try{ return (speechSynthesis.getVoices() || []).find(v => /^en([-_]|$)/i.test(v.lang || '')) || null; }catch(e){ return null; } }
function listenVoice(k){ return k === 'listenth' ? thVoice() : enVoice(); }
const LISTEN_NOVOICE = {listenen: '🔇 No English voice on this device', listenth: '🔇 ไม่มีเสียงภาษาไทยในเครื่องนี้'};
function listenText(q){ const s = SERIES[q.op].sym; return q.missing === 'a' ? '? ' + s + ' ' + q.b + ' = ' + q.ans : q.missing === 'b' ? q.a + ' ' + s + ' ? = ' + q.ans : q.a + ' ' + s + ' ' + q.b + ' = ?'; }
try{ speechSynthesis.addEventListener('voiceschanged', () => { const m = document.getElementById('scr-menu'); if(m && !m.classList.contains('hidden') && typeof renderModes === 'function') renderModes(); }); }catch(e){}
function thVoice(){ try{ return (speechSynthesis.getVoices() || []).find(v => /^th([-_]|$)/i.test(v.lang || '')) || null; }catch(e){ return null; } }
function sayTH(text){
  try{
    if(!UISound.get().enabled || !window.speechSynthesis) return;
    const v = thVoice(); window.MQ_SAY_LOG.push({lang: 'th', text, voice: v ? v.name : null});
    if(!v){ if(!thWarned){ thWarned = true; showBanner('🔇 ไม่มีเสียงภาษาไทยในเครื่องนี้ — อ่านเองนะ'); } return; }
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = v.lang || 'th-TH'; try{ u.voice = v; }catch(e){} u.rate = 0.9; u.pitch = 1.1; u.volume = Math.max(0.2, UISound.get().volume); speechSynthesis.speak(u);
  }catch(e){}
}
function thaiSayText(q){
  const sw = SIGN_WORD.th, W = n => wordsTH(n);
  if(q.missing === 'a') return 'เลขอะไร ' + sw[q.op] + ' ' + W(q.b) + ' ' + sw.eq + ' ' + W(q.ans);
  if(q.missing === 'b') return W(q.a) + ' ' + sw[q.op] + ' เลขอะไร ' + sw.eq + ' ' + W(q.ans);
  return W(q.a) + ' ' + sw[q.op] + ' ' + W(q.b) + ' ' + sw.eq + 'เท่าไร';
}
const RIGHT_TH = ['ถูกต้อง!', 'เก่งมาก!', 'เยี่ยมเลย!', 'สุดยอด!'];
function speak(text, lang){ if(lang === 'th') sayTH(text); else say(text); }

/* ================= QUESTIONS ================= */
// q = {op, a, b, ans, show: 'a+b=?' parts, missing: 'a'|'b'|'' , word, vis: {...}|null, choices: [..]}
function young(age){ return age === '4-5' || age === '6-7'; }
function pictures(lvl, age){ return lvl <= 1 || (lvl === 2 && young(age)); }
const NO_TEN = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12];   // the other number in a table sum: never the easy 10
function makeNums(op, lvl, Lx){
  const L = Lx || LEVELS[lvl]; let a, b, ans;
  // no '0 + n' or 'n − 0' sums: both numbers are at least 1
  if(op === 'add'){ const max = L.add, lo = L.big ? 100 : lvl >= 3 ? 10 : 2; ans = randInt(lo, max); a = randInt(Math.max(1, lvl >= 3 ? Math.floor(ans * 0.2) : 1), ans - 1); b = ans - a; }
  else if(op === 'sub'){ const max = L.add, lo = L.big ? 100 : lvl >= 3 ? 10 : 2; a = randInt(lo, max); b = randInt(1, a - (lvl <= 1 ? 0 : 1)); ans = a - b; }
  else if(op === 'mul'){
    if(L.big && Math.random() < 0.45){ a = randInt(11, lvl === 5 ? 99 : 49); b = randInt(2, 9); }   // 2-digit × 1-digit
    else if(L.tables){ a = pick(L.tables); b = pick(NO_TEN); }   // the hard tables (Hard 7 8 9 11 12 13 · Extreme 9 12–17 · no easy 10s)
    else { a = randInt(lvl === 0 ? 1 : 2, L.mul[0]); b = randInt(lvl <= 1 ? 1 : 2, L.mul[1]); }
    if(Math.random() < 0.5 && !(L.big && a > 12) && !(L.tables && a > 12)){ const t = a; a = b; b = t; }
    ans = a * b;
  } else {   // div: always a whole answer
    const d = L.tables ? pick(L.tables) : randInt(2, L.div[0]), q = L.tables ? pick(NO_TEN) : randInt(lvl <= 1 ? 1 : 2, L.div[1]); a = d * q; b = d; ans = q;
  }
  return {op, a, b, ans};
}
function makeQ(series, lvl, world, age, Lx, mode){
  const L = Lx || LEVELS[lvl], W = WORLDS[world] || WORLDS.school;
  if(isWordMode(mode)){ const wq = makeWordQ(mode, series, lvl, world, age, L); wq.key = qKey(wq); return wq; }   // ➗ mq-w1
  if(isStoryMode(mode)) return makeStoryQ(mode, series, lvl, world, age, L);   // ➗ mq-w2 📖
  if(isTrickMode(mode)){ const tq = makeTrickQ(mode, lvl, L); if(tq) return tq; }   // ➗ mq-w3 🤔
  if(isTestMode(mode)){ const tt = makeTestQ(mode, lvl, L); if(tt) return tt; }   // ➗ mq-t1 📝
  if(isPzMode(mode)){ const pq = makePzQ(mode, lvl, L); if(pq) return pq; }   // ➗ mq-w4 ❓ 🔍 🕐
  const op = series === 'mix' ? pick(lvl === 0 ? ['add', 'sub', 'add', 'sub', 'mul', 'div'] : OPS) : series;
  const q = makeNums(op, lvl, L);
  q.missing = ''; q.word = ''; q.vis = null;
  if(L.missing && Math.random() < L.missing){ q.missing = Math.random() < 0.5 ? 'a' : 'b'; }
  if(!q.missing && L.words && Math.random() < L.words){ q.word = storyText(q, W); }
  if(pictures(lvl, age) && !q.word && !q.missing) q.vis = visFor(q, W, lvl);
  q.ask = q.missing === 'a' ? q.a : q.missing === 'b' ? q.b : q.ans;   // the number the child has to find
  q.choices = choicesFor(q, L.choices);
  q.key = qKey(q);   // ➗ mq-w1: 🎲 recent-question memory
  if(isListenMode(mode)){ q.word = ''; q.vis = null; q.listen = true; q.lang = mode === 'listenth' ? 'th' : 'en'; q.say = q.lang === 'th' ? thaiSayText(q) : sayText(q); q.key += '-l'; }   // ➗ mq-w5 🎧 heard, not read
  return q;
}
/* ================= 📖 STORIES (➗ mq-w2, plan §5) ================= */
// One engine, two languages: every template writes its English AND its Thai text from the SAME numbers.
// noun  e / ep = English one / many · t = Thai · c = Thai classifier (ลักษณนาม) · i = picture · alive = people / animals that come + go · buy = sold in a shop
// box   e / ep · on = English "on" (else "in") · t = Thai · c = its classifier · v = Thai "put … in each" verb · tin = Thai "into the box" · tp = Thai บน / ใน
const STORY_W = {
  school: {place: {e: 'on the desk', t: 'บนโต๊ะ'}, extra: {e: 'The class has {n} chairs.', t: 'ห้องเรียนมีเก้าอี้ {n} ตัว'},
    acts: [{e: 'reads', t: 'อ่านหนังสือ'}, {e: 'draws', t: 'วาดรูป'}, {e: 'does homework', t: 'ทำการบ้าน'}],
    nouns: [
      {e: 'pencil', ep: 'pencils', t: 'ดินสอ', c: 'แท่ง', i: '✏️', buy: 1, box: {e: 'box', ep: 'boxes', t: 'กล่อง', c: 'กล่อง', v: 'ใส่', tin: 'ใส่กล่อง'}},
      {e: 'book', ep: 'books', t: 'หนังสือ', c: 'เล่ม', i: '📚', buy: 1, box: {e: 'shelf', ep: 'shelves', on: 1, t: 'ชั้นวาง', c: 'ชั้น', v: 'วาง', tin: 'วางบนชั้นวาง', tp: 'บน'}},
      {e: 'sticker', ep: 'stickers', t: 'สติกเกอร์', c: 'แผ่น', i: '⭐', buy: 1, box: {e: 'page', ep: 'pages', on: 1, t: 'หน้า', c: 'หน้า', v: 'ติด', tin: 'ติดลงสมุด', tp: 'บน'}},
      {e: 'crayon', ep: 'crayons', t: 'สีเทียน', c: 'แท่ง', i: '🖍️', buy: 1, box: {e: 'tin', ep: 'tins', t: 'กระป๋อง', c: 'ใบ', v: 'ใส่', tin: 'ใส่กระป๋อง'}},
      {e: 'apple', ep: 'apples', t: 'แอปเปิล', c: 'ลูก', i: '🍎', buy: 1, box: {e: 'lunchbox', ep: 'lunchboxes', t: 'กล่องข้าว', c: 'กล่อง', v: 'ใส่', tin: 'ใส่กล่องข้าว'}}]},
  space: {place: {e: 'at the space base', t: 'ที่ฐานอวกาศ'}, extra: {e: 'The rocket has {n} windows.', t: 'จรวดมีหน้าต่าง {n} บาน'},
    acts: [{e: 'trains', t: 'ฝึกบิน'}, {e: 'fixes the rocket', t: 'ซ่อมจรวด'}, {e: 'looks at the stars', t: 'ดูดาว'}],
    nouns: [
      {e: 'star', ep: 'stars', t: 'ดาว', c: 'ดวง', i: '⭐', box: {e: 'jar', ep: 'jars', t: 'โหล', c: 'ใบ', v: 'ใส่', tin: 'ใส่โหล'}},
      {e: 'moon rock', ep: 'moon rocks', t: 'หินดวงจันทร์', c: 'ก้อน', i: '🪨', box: {e: 'box', ep: 'boxes', t: 'กล่อง', c: 'กล่อง', v: 'ใส่', tin: 'ใส่กล่อง'}},
      {e: 'astronaut', ep: 'astronauts', t: 'นักบินอวกาศ', c: 'คน', i: '🧑‍🚀', alive: 1, box: {e: 'rocket', ep: 'rockets', t: 'จรวด', c: 'ลำ', v: 'มี', tin: 'ขึ้นจรวด'}},
      {e: 'toy rocket', ep: 'toy rockets', t: 'จรวดของเล่น', c: 'ลำ', i: '🚀', buy: 1, box: {e: 'box', ep: 'boxes', t: 'กล่อง', c: 'กล่อง', v: 'ใส่', tin: 'ใส่กล่อง'}}]},
  lab: {place: {e: 'on the bench', t: 'บนโต๊ะทดลอง'}, extra: {e: 'The lab has {n} lamps.', t: 'ห้องทดลองมีโคมไฟ {n} ดวง'},
    acts: [{e: 'mixes potions', t: 'ผสมสาร'}, {e: 'tidies up', t: 'เก็บของ'}, {e: 'writes notes', t: 'จดบันทึก'}],
    nouns: [
      {e: 'test tube', ep: 'test tubes', t: 'หลอดทดลอง', c: 'หลอด', i: '🧪', box: {e: 'rack', ep: 'racks', on: 1, t: 'ชั้นวาง', c: 'ชั้น', v: 'วาง', tin: 'วางบนชั้นวาง', tp: 'บน'}},
      {e: 'crystal', ep: 'crystals', t: 'คริสตัล', c: 'ก้อน', i: '💎', buy: 1, box: {e: 'dish', ep: 'dishes', on: 1, t: 'จาน', c: 'ใบ', v: 'วาง', tin: 'วางบนจาน', tp: 'บน'}},
      {e: 'magnet', ep: 'magnets', t: 'แม่เหล็ก', c: 'อัน', i: '🧲', buy: 1, box: {e: 'box', ep: 'boxes', t: 'กล่อง', c: 'กล่อง', v: 'ใส่', tin: 'ใส่กล่อง'}},
      {e: 'seed', ep: 'seeds', t: 'เมล็ดพืช', c: 'เมล็ด', i: '🌱', buy: 1, box: {e: 'pot', ep: 'pots', t: 'กระถาง', c: 'ใบ', v: 'ปลูก', tin: 'ปลูกในกระถาง'}}]},
  animals: {place: {e: 'in the garden', t: 'ในสวน'}, extra: {e: 'The farm has {n} tractors.', t: 'ฟาร์มมีรถไถ {n} คัน'},
    acts: [{e: 'feeds the animals', t: 'ให้อาหารสัตว์'}, {e: 'walks the puppies', t: 'พาลูกหมาเดินเล่น'}, {e: 'cleans the pens', t: 'ทำความสะอาดคอก'}],
    nouns: [
      {e: 'egg', ep: 'eggs', t: 'ไข่', c: 'ฟอง', i: '🥚', buy: 1, box: {e: 'nest', ep: 'nests', t: 'รัง', c: 'รัง', v: 'มี', tin: 'วางในรัง'}},
      {e: 'fish', ep: 'fish', t: 'ปลา', c: 'ตัว', i: '🐟', buy: 1, place: {e: 'in the bucket', t: 'ในถัง'}, box: {e: 'tank', ep: 'tanks', t: 'ตู้ปลา', c: 'ตู้', v: 'มี', tin: 'ใส่ตู้ปลา'}},
      {e: 'duck', ep: 'ducks', t: 'เป็ด', c: 'ตัว', i: '🦆', alive: 1, box: {e: 'pond', ep: 'ponds', t: 'บ่อ', c: 'บ่อ', v: 'มี', tin: 'ปล่อยลงบ่อ'}},
      {e: 'puppy', ep: 'puppies', t: 'ลูกหมา', c: 'ตัว', i: '🐶', alive: 1, box: {e: 'basket', ep: 'baskets', t: 'ตะกร้า', c: 'ใบ', v: 'มี', tin: 'ใส่ตะกร้า'}},
      {e: 'chick', ep: 'chicks', t: 'ลูกเจี๊ยบ', c: 'ตัว', i: '🐥', alive: 1, box: {e: 'coop', ep: 'coops', t: 'เล้า', c: 'เล้า', v: 'มี', tin: 'ต้อนเข้าเล้า'}}]},
  market: {place: {e: 'on the stall', t: 'บนแผง'}, extra: {e: 'The market has {n} stalls.', t: 'ตลาดมีร้านค้า {n} ร้าน'},
    acts: [{e: 'shops', t: 'เดินซื้อของ'}, {e: 'cooks', t: 'ทำอาหาร'}, {e: 'helps at the stall', t: 'ช่วยขายของ'}],
    nouns: [
      {e: 'mango', ep: 'mangoes', t: 'มะม่วง', c: 'ลูก', i: '🥭', buy: 1, box: {e: 'basket', ep: 'baskets', t: 'ตะกร้า', c: 'ใบ', v: 'ใส่', tin: 'ใส่ตะกร้า'}},
      {e: 'orange', ep: 'oranges', t: 'ส้ม', c: 'ผล', i: '🍊', buy: 1, box: {e: 'bag', ep: 'bags', t: 'ถุง', c: 'ถุง', v: 'ใส่', tin: 'ใส่ถุง'}},
      {e: 'coconut', ep: 'coconuts', t: 'มะพร้าว', c: 'ลูก', i: '🥥', buy: 1, box: {e: 'crate', ep: 'crates', t: 'ลัง', c: 'ลัง', v: 'ใส่', tin: 'ใส่ลัง'}},
      {e: 'banana', ep: 'bananas', t: 'กล้วย', c: 'ลูก', i: '🍌', buy: 1, box: {e: 'bag', ep: 'bags', t: 'ถุง', c: 'ถุง', v: 'ใส่', tin: 'ใส่ถุง'}},
      {e: 'apple', ep: 'apples', t: 'แอปเปิล', c: 'ลูก', i: '🍎', buy: 1, box: {e: 'box', ep: 'boxes', t: 'กล่อง', c: 'กล่อง', v: 'ใส่', tin: 'ใส่กล่อง'}}]}
};
const STORY_WHO = [{e: 'Nok', t: 'น้องนก'}, {e: 'Ton', t: 'น้องต้น'}, {e: 'Mali', t: 'น้องมะลิ'}, {e: 'Ploy', t: 'น้องพลอย'}, {e: 'Sam', t: 'น้องแซม'}, {e: 'Lily', t: 'น้องลิลลี่'}, {e: 'Ben', t: 'น้องเบน'}, {e: 'Fah', t: 'น้องฟ้า'}];
const STORY_CAP = [5, 10, 20, 100, 1000, 1000], STORY_LO = [2, 3, 6, 20, 100, 100];
const OP_SYM = {add: '+', sub: '−', mul: '×', div: '÷'};
const fN = n => Number(n).toLocaleString('en-US');
function stp(a, op, b){ return {a, op, b, r: op === 'add' ? a + b : op === 'sub' ? a - b : op === 'mul' ? a * b : a / b}; }
// X = {N noun, B box, P people [3], SW world, C cap, lvl} → helpers for both languages
function storyX(world, lvl, needBuy){
  const SW = STORY_W[world] || STORY_W.school, pool = SW.nouns.filter(n => !needBuy || n.buy), N = pick(pool.length ? pool : SW.nouns), P = shuffle(STORY_WHO.slice()).slice(0, 3);
  const X = {SW, N, B: N.box, P, p: P.map(x => x.e), pt: P.map(x => x.t), C: STORY_CAP[lvl], lvl, world, r: randInt};
  X.en = (n, M) => fN(n) + ' ' + (n === 1 ? (M || X.N).e : (M || X.N).ep);
  X.tn = (n, M) => fN(n) + ' ' + (M || X.N).c;
  X.be = n => n === 1 ? 'is' : 'are';
  X.inB = () => (X.B.on ? 'on the ' : 'in the ') + X.B.e;
  X.tinB = () => (X.B.tp || 'ใน') + X.B.t;
  X.eGroups = (a, b) => fN(a) + ' ' + (a === 1 ? X.B.e : X.B.ep) + ' with ' + X.en(b) + ' ' + (X.B.on ? 'on' : 'in') + ' each';
  X.tGroups = (a, b) => X.B.t + ' ' + fN(a) + ' ' + X.B.c + ' ' + X.B.v + X.N.t + X.B.c + 'ละ ' + X.tn(b);
  X.out = n => X.N.alive ? (n === 1 ? 'leaves' : 'leave') : (n === 1 ? 'is taken out' : 'are taken out');
  X.tOut = () => X.N.alive ? 'ออกไป' : 'หยิบออกไป';
  X.come = n => X.N.alive ? (n === 1 ? 'more comes' : 'more come') : (n === 1 ? 'more is put in' : 'more are put in');
  X.tCome = () => X.N.alive ? 'มาเพิ่ม' : 'ใส่เพิ่ม';
  X.place = N.place || SW.place;   // helpers read X.N / X.B late, so a test can swap the noun
  X.mulPair = () => { const big = X.C > 100; for(let k = 0; k < 40; k++){ const a = randInt(2, big ? 12 : 9), b = randInt(2, big ? 80 : 12); if(a * b <= X.C * 0.9) return [a, b]; } return [2, 3]; };
  X.minutes = () => X.C > 100 ? randInt(13, 120) : 5 * randInt(1, 8);
  return X;
}
// ONE-step templates take {a, b, ans} from makeNums (the same numbers Classic uses). cl = also used for Classic's story lines (answer = ans).
// pic = pictures for 🌱 🐣 · lv = from this level · ask = the answer when it is not ans (start unknown)
const STORY_ONE = [
  {id: 'a1', op: 'add', lv: 0, pic: 1, cl: 1, hold: 'has', mk: (X, a, b) => ({e: [X.p[0] + ' has ' + X.en(a) + '.', X.p[1] + ' gives ' + X.p[0] + ' ' + fN(b) + ' more.'], qe: 'How many ' + X.N.ep + ' does ' + X.p[0] + ' have now?',
    t: [X.pt[0] + 'มี' + X.N.t + ' ' + X.tn(a), X.pt[1] + 'ให้มาอีก ' + X.tn(b)], qt: 'ตอนนี้' + X.pt[0] + 'มี' + X.N.t + 'กี่' + X.N.c, steps: [stp(a, 'add', b)]})},
  {id: 'a2', op: 'add', lv: 0, pic: 1, cl: 1, hold: 'in', mk: (X, a, b) => ({e: ['There ' + X.be(a) + ' ' + X.en(a) + ' ' + X.inB() + ' and ' + fN(b) + ' ' + X.place.e + '.'], qe: 'How many ' + X.N.ep + ' are there in all?',
    t: [X.tinB() + 'มี' + X.N.t + ' ' + X.tn(a), X.place.t + 'มีอีก ' + X.tn(b)], qt: 'รวมมี' + X.N.t + 'กี่' + X.N.c, steps: [stp(a, 'add', b)]})},
  {id: 'a3', op: 'add', lv: 1, pic: 1, cl: 1, hold: 'has', mk: (X, a, b) => ({e: [X.p[0] + (X.N.alive ? ' sees ' : ' collects ') + X.en(a) + ' in the morning and ' + fN(b) + ' in the afternoon.'], qe: 'How many ' + X.N.ep + ' is that altogether?',
    t: ['ตอนเช้า' + X.pt[0] + (X.N.alive ? 'เห็น' : 'เก็บ') + X.N.t + ' ' + X.tn(a), 'ตอนบ่าย' + (X.N.alive ? 'เห็น' : 'เก็บ') + 'อีก ' + X.tn(b)], qt: 'รวมทั้งหมดกี่' + X.N.c, steps: [stp(a, 'add', b)]})},
  {id: 'a4', op: 'add', lv: 2, hold: 'has', mk: (X, a, b, ans) => ({e: [X.p[0] + ' had some ' + X.N.ep + '.', X.p[1] + ' gave ' + X.p[0] + ' ' + fN(b) + ' more.', 'Now ' + X.p[0] + ' has ' + X.en(ans) + '.'], qe: 'How many did ' + X.p[0] + ' have at first?',
    t: [X.pt[0] + 'มี' + X.N.t + 'อยู่จำนวนหนึ่ง', X.pt[1] + 'ให้มาอีก ' + X.tn(b), 'ตอนนี้มี ' + X.tn(ans)], qt: 'ตอนแรก' + X.pt[0] + 'มี' + X.N.t + 'กี่' + X.N.c, steps: [stp(ans, 'sub', b)]})},
  {id: 's1', op: 'sub', lv: 0, pic: 1, cl: 1, hold: 'has', mk: (X, a, b) => ({e: [X.p[0] + ' has ' + X.en(a) + '.', X.p[0] + ' gives ' + fN(b) + ' to ' + X.p[1] + '.'], qe: 'How many ' + X.N.ep + ' does ' + X.p[0] + ' have left?',
    t: [X.pt[0] + 'มี' + X.N.t + ' ' + X.tn(a), 'ให้' + X.pt[1] + 'ไป ' + X.tn(b)], qt: X.pt[0] + 'เหลือ' + X.N.t + 'กี่' + X.N.c, steps: [stp(a, 'sub', b)]})},
  {id: 's2', op: 'sub', lv: 0, pic: 1, cl: 1, hold: 'in', mk: (X, a, b) => ({e: ['There ' + X.be(a) + ' ' + X.en(a) + ' ' + X.inB() + '.', fN(b) + ' ' + X.out(b) + '.'], qe: 'How many are still ' + X.inB() + '?',
    t: [X.tinB() + 'มี' + X.N.t + ' ' + X.tn(a), X.tOut() + ' ' + X.tn(b)], qt: X.tinB() + 'เหลือ' + X.N.t + 'กี่' + X.N.c, steps: [stp(a, 'sub', b)]})},
  {id: 's3', op: 'sub', lv: 2, cl: 1, hold: 'has', mk: (X, a, b) => ({e: [X.p[0] + ' has ' + X.en(a) + '.', X.p[1] + ' has ' + X.en(b) + '.'], qe: 'How many more ' + X.N.ep + ' does ' + X.p[0] + ' have than ' + X.p[1] + '?',
    t: [X.pt[0] + 'มี' + X.N.t + ' ' + X.tn(a), X.pt[1] + 'มี ' + X.tn(b)], qt: X.pt[0] + 'มีมากกว่า' + X.pt[1] + 'กี่' + X.N.c, steps: [stp(a, 'sub', b)]})},
  {id: 's4', op: 'sub', lv: 2, cl: 1, hold: 'has', mk: (X, a, b) => ({e: [X.p[0] + ' needs ' + X.en(a) + '.', X.p[0] + ' has ' + fN(b) + ' already.'], qe: 'How many more does ' + X.p[0] + ' need?',
    t: [X.pt[0] + 'ต้องการ' + X.N.t + ' ' + X.tn(a), 'ตอนนี้มีแล้ว ' + X.tn(b)], qt: 'ต้องหาเพิ่มอีกกี่' + X.N.c, steps: [stp(a, 'sub', b)]})},
  {id: 'm1', op: 'mul', lv: 0, pic: 1, cl: 1, hold: 'has', mk: (X, a, b) => ({e: [X.p[0] + ' has ' + X.eGroups(a, b) + '.'], qe: 'How many ' + X.N.ep + ' are there altogether?',
    t: [X.pt[0] + 'มี' + X.tGroups(a, b)], qt: 'รวมมี' + X.N.t + 'กี่' + X.N.c, steps: [stp(a, 'mul', b)]})},
  {id: 'm2', op: 'mul', lv: 0, pic: 1, cl: 1, hold: 'together', mk: (X, a, b) => a < 2 ? null : ({e: [fN(a) + ' friends each have ' + X.en(b) + '.'], qe: 'How many ' + X.N.ep + ' do they have in all?',
    t: ['เพื่อน ' + fN(a) + ' คน มี' + X.N.t + 'คนละ ' + X.tn(b)], qt: 'รวมมี' + X.N.t + 'กี่' + X.N.c, steps: [stp(a, 'mul', b)]})},
  {id: 'm3', op: 'mul', lv: 2, cl: 1, hold: 'has', mk: (X, a, b) => ({e: [X.p[0] + ' puts the ' + X.N.ep + ' in ' + fN(a) + ' rows, with ' + fN(b) + ' in each row.'], qe: 'How many ' + X.N.ep + ' are there?',
    t: [X.pt[0] + 'จัด' + X.N.t + 'เป็น ' + fN(a) + ' แถว แถวละ ' + X.tn(b)], qt: 'มี' + X.N.t + 'ทั้งหมดกี่' + X.N.c, steps: [stp(a, 'mul', b)]})},
  {id: 'd1', op: 'div', lv: 0, pic: 1, cl: 1, hold: 'each', mk: (X, a, b) => b < 2 ? null : ({e: [X.p[0] + ' shares ' + X.en(a) + ' equally among ' + fN(b) + ' friends.'], qe: 'How many does each friend get?',
    t: [X.pt[0] + 'แบ่ง' + X.N.t + ' ' + X.tn(a) + ' ให้เพื่อน ' + fN(b) + ' คนเท่า ๆ กัน'], qt: 'เพื่อนได้คนละกี่' + X.N.c, steps: [stp(a, 'div', b)]})},
  {id: 'd2', op: 'div', lv: 0, cl: 1, unit: 'box', mk: (X, a, b) => b < 2 ? null : ({e: [X.p[0] + ' has ' + X.en(a) + ' and puts ' + fN(b) + ' ' + (X.B.on ? 'on' : 'in') + ' each ' + X.B.e + '.'], qe: 'How many ' + X.B.ep + ' does ' + X.p[0] + ' need?',
    t: [X.pt[0] + 'มี' + X.N.t + ' ' + X.tn(a), X.B.tin + ' ' + X.B.c + 'ละ ' + X.tn(b)], qt: 'ต้องใช้' + X.B.t + 'กี่' + X.B.c, steps: [stp(a, 'div', b)]})}
];
/* 📏 s4a words#1 → MathQuest_words.html */
// Classic's random story lines (🔦 → 💀) come from the same engine — English, one step, the answer stays q.ans
function classicStory(q, W){
  try{ const wk = WORLD_KEYS.find(k => WORLDS[k] === W) || 'school', pool = STORY_ONE.filter(t => t.cl && t.op === q.op);
    for(let k = 0; k < 8; k++){ const t = pick(pool), X = storyX(wk, 2), st = t && t.mk(X, q.a, q.b, q.ans); if(st && st.steps[0].r === q.ans) return st.e.join(' ') + ' ' + st.qe; } }catch(e){}
  return '';
}
// 🪜 the steps line: "3 × 6 = 18 → 18 − 4 = 14" (+ the extra number that wasn't needed)
function stepsText(q){
  return '🪜 ' + q.steps.map(z => fN(z.a) + ' ' + OP_SYM[z.op] + ' ' + fN(z.b) + ' = ' + fN(z.r)).join('  →  ') + (q.extra ? (q.lang === 'th' ? '  ·  🙈 ไม่ต้องใช้ ' : '  ·  🙈 not needed: ') + q.extra : '');
}
// the story always fits its card: the font shrinks until nothing spills (every size, long Thai lines too)
function fitStory(){
  const el = $('word'), card = $('qcard'); if(!el || !card) return;
  el.style.fontSize = ''; if(!el.classList.contains('story') || el.classList.contains('hidden')) return;
  let fs = parseFloat(getComputedStyle(el).fontSize) || 16, k = 0;
  const fig = card.querySelector('.tfig'); if(fig) fig.style.height = '';   // ➗ mq-t1: a 📝 figure gives way first, then the text
  const over = () => card.scrollHeight > card.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
  const figMin = fig && $('hintline').classList.contains('hidden') ? Math.max(64, fig.viewBox.baseVal.height * 12 / Math.min(14, ...[...fig.querySelectorAll('text')].map(t => parseFloat(t.getAttribute('font-size')) || 14))) : 0;   // ➗ mq-t2: never shrink a picture below 12px labels
  while(k++ < 60 && over()){ const fh = fig ? fig.getBoundingClientRect().height : 0;
    if(fig && fh > figMin && (k % 2 || fs <= 12)) fig.style.height = Math.round(fh * 0.88) + 'px'; else if(fs > 11){ fs -= 1; el.style.fontSize = fs + 'px'; } else break; }
}
/* 📏 s4a words#2 → MathQuest_words.html */
const TK_NAMES = {en: ['Nok', 'Ton', 'Mali', 'Ploy', 'Sam', 'Lily', 'Ben', 'Fah'], th: ['น้องนก', 'น้องต้น', 'น้องมะลิ', 'น้องพลอย', 'น้องแซม', 'น้องลิลลี่', 'น้องเบน', 'น้องฟ้า']};
/* 📏 s4a words#3 → MathQuest_words.html */
function tkOrd(n){ return n + ((n % 100 >= 11 && n % 100 <= 13) ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] || 'th')); }
/* 📏 s4a words#4 → MathQuest_words.html */
const TRICK_RANGE = {en: ['🤔 read it again', '🤔 read it again', '🤔 “all but” · “you”', '🤔 days · months · race places', '🤔 fence posts · sign order', '🤔 sure picks · count the digits'],
  th: ['🙃 อ่านให้ดี', '🙃 อ่านให้ดี', '🙃 “ยกเว้น” · “เธอ”', '🙃 วัน · เดือน · ลำดับที่', '🙃 เสารั้ว · ลำดับการคิด', '🙃 หยิบให้แน่ · นับตัวเลข']};
/* 📏 s4a words#5 → MathQuest_words.html */
// a trick that was SHOWN goes on the player's seen list (nextQ calls this)
function trickSaw(q){
  if(!q || !(q.trick || q.test) || !G) return; (G.tkUsed = G.tkUsed || new Set()).add(q.id);
  const l = trickSeen[q.lang] = (trickSeen[q.lang] || []).filter(x => x !== q.id); l.push(q.id); if(l.length > 200) l.shift();
}
/* ================= 📝 TEST PRACTICE (EN, Western school style) + 📝 ข้อสอบ (TH, Thai school style) — ➗ mq-t1, plan §15 ================= */
// Grades → levels: 🌱 G1–2 / ป.1–2 · 🐣 G3–4 / ป.3–4 · 🔦 G5–6 · ⚡ G7–8 · 🌋 G9–12 · 💀 real-life scenarios (built round by round; until then a level uses the highest band built).
// Every topic = a question MAKER (numbers random every time) written in the style of that school system's tests — new questions, never copied from real papers.
// topic: {id, g (grade 1–12), only? ('en' | 'th'), mk(R, L) → {q, a (number or text), o [real mistakes], how (🪜 worked steps), fig? (SVG), say? (text for the voice)} | null}
const TEST_BANDS = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 12], [99, 99]], TEST_BUILT = 5;   // ➗ mq-t2: 🔦 G5–6 + ⚡ G7–8 built · mq-t3: 🌋 G9–12 · mq-t4: 💀 real-life cases
const TEST_RANGE = {en: ['📝 Grade 1–2', '📝 Grade 3–4', '📝 Grade 5–6', '📝 Grade 7–8', '📝 Grade 9–12', '📝 Real-life scenarios'],
  th: ['📝 ป.1–ป.2', '📝 ป.3–ป.4', '📝 ป.5–ป.6', '📝 ม.1–ม.2', '📝 ม.3–ม.6', '📝 สถานการณ์จริง']};
function gradeLabel(g, L){ return L === 'th' ? (g <= 6 ? 'ป.' + g : 'ม.' + (g - 6)) : 'Grade ' + g; }
const pad2 = m => (m < 10 ? '0' : '') + m;
/* 📏 s4a tests#1 → MathQuest_tests.html */
// ---------- 🖼️ figures, drawn in code (SVG) ----------
const TF = {
  wrap: (w, h, s, label) => '<svg class="tfig" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + label + '">' + s + '</svg>',
  clock(h, m){ let s = '<circle cx="60" cy="60" r="56" fill="#fff" stroke="#2a3247" stroke-width="4"/>';
    for(let i = 0; i < 60; i++){ const a = i * Math.PI / 30, r1 = i % 5 ? 52 : 49; s += '<line x1="' + (60 + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (60 - r1 * Math.cos(a)).toFixed(1) + '" x2="' + (60 + 55 * Math.sin(a)).toFixed(1) + '" y2="' + (60 - 55 * Math.cos(a)).toFixed(1) + '" stroke="#2a3247" stroke-width="' + (i % 5 ? 1 : 2) + '"/>'; }
    for(let i = 1; i <= 12; i++){ const a = i * Math.PI / 6; s += '<text x="' + (60 + 40 * Math.sin(a)).toFixed(1) + '" y="' + (60 - 40 * Math.cos(a) + 4.5).toFixed(1) + '" font-size="13" font-weight="800" text-anchor="middle" fill="#2a3247">' + i + '</text>'; }
    const ha = ((h % 12) + m / 60) * Math.PI / 6, ma = m * Math.PI / 30;
    s += '<line x1="60" y1="60" x2="' + (60 + 27 * Math.sin(ha)).toFixed(1) + '" y2="' + (60 - 27 * Math.cos(ha)).toFixed(1) + '" stroke="#e5484d" stroke-width="6" stroke-linecap="round"/>';
    s += '<line x1="60" y1="60" x2="' + (60 + 44 * Math.sin(ma)).toFixed(1) + '" y2="' + (60 - 44 * Math.cos(ma)).toFixed(1) + '" stroke="#2f6fd0" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="60" r="4.5" fill="#2a3247"/>';
    return TF.wrap(120, 120, s, 'clock'); },
  blocks(t, o){ let s = '', x = 4;
    for(let i = 0; i < t; i++){ s += '<rect x="' + x + '" y="4" width="11" height="100" rx="2" fill="#8ec5ff" stroke="#2f6fd0" stroke-width="1.5"/>'; for(let j = 1; j < 10; j++) s += '<line x1="' + x + '" x2="' + (x + 11) + '" y1="' + (4 + j * 10) + '" y2="' + (4 + j * 10) + '" stroke="#2f6fd0" stroke-width="1"/>'; x += 15; }
    x += 8; for(let i = 0; i < o; i++) s += '<rect x="' + (x + (i % 3) * 13) + '" y="' + (93 - Math.floor(i / 3) * 13) + '" width="11" height="11" rx="2" fill="#ffd45c" stroke="#c99a00" stroke-width="1.5"/>';
    return TF.wrap(x + (o ? 3 * 13 : 0) + 4, 108, s, 'blocks'); },
  pict(rows, key){ const lh = 30; let s = '';
    rows.forEach((r, i) => { const y = 6 + i * lh; s += '<text x="4" y="' + (y + 20) + '" font-size="14" font-weight="800" fill="#2a3247">' + r.label + '</text>'; for(let j = 0; j < r.n; j++) s += '<text x="' + (92 + j * 22) + '" y="' + (y + 21) + '" font-size="18">' + r.icon + '</text>'; });
    if(key) s += '<text x="4" y="' + (rows.length * lh + 22) + '" font-size="13" font-weight="800" fill="#7a4b00">' + key + '</text>';
    return TF.wrap(320, rows.length * lh + (key ? 30 : 10), s, 'picture graph'); },
  bars(data, step, max){ const W = 320, H = 172, x0 = 34, y0 = 142, top = 10, bw = Math.min(46, (W - x0 - 10) / data.length - 14); let s = '';
    for(let v = 0; v <= max; v += step){ const y = y0 - (y0 - top) * v / max; s += '<line x1="' + x0 + '" x2="' + (W - 4) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="#d9dee8" stroke-width="1"/><text x="' + (x0 - 5) + '" y="' + (y + 4).toFixed(1) + '" font-size="13" text-anchor="end" fill="#555">' + v + '</text>'; }
    data.forEach((d, i) => { const x = x0 + 12 + i * (bw + 14), h = (y0 - top) * d.v / max; s += '<rect x="' + x.toFixed(1) + '" y="' + (y0 - h).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" fill="' + ['#5aa9ff', '#ffb347', '#7ed957', '#ff7aa8', '#b48cff'][i % 5] + '"/><text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y0 + 17) + '" font-size="13" font-weight="800" text-anchor="middle" fill="#2a3247">' + d.label + '</text>'; });
    s += '<line x1="' + x0 + '" x2="' + (W - 4) + '" y1="' + y0 + '" y2="' + y0 + '" stroke="#2a3247" stroke-width="2"/><line x1="' + x0 + '" x2="' + x0 + '" y1="' + top + '" y2="' + y0 + '" stroke="#2a3247" stroke-width="2"/>';
    return TF.wrap(W, H, s, 'bar graph'); },
  shape(k){ const poly = n => { const p = []; for(let i = 0; i < n; i++){ const a = -Math.PI / 2 + i * 2 * Math.PI / n; p.push((60 + 48 * Math.cos(a)).toFixed(1) + ',' + (62 + 48 * Math.sin(a)).toFixed(1)); } return '<polygon points="' + p.join(' ') + '" fill="#c9e6ff" stroke="#2a3247" stroke-width="3" stroke-linejoin="round"/>'; };
    if(k === 'circ') return TF.wrap(120, 120, '<circle cx="60" cy="60" r="50" fill="#c9e6ff" stroke="#2a3247" stroke-width="3"/>', 'shape');
    if(k === 'rect') return TF.wrap(160, 100, '<rect x="8" y="16" width="144" height="68" fill="#c9e6ff" stroke="#2a3247" stroke-width="3"/>', 'shape');
    if(k === 'sq') return TF.wrap(120, 120, '<rect x="16" y="16" width="88" height="88" fill="#c9e6ff" stroke="#2a3247" stroke-width="3"/>', 'shape');
    return TF.wrap(120, 120, poly({tri: 3, pent: 5, hex: 6, oct: 8}[k] || 3), 'shape'); },
  ruler(len, max, unit){ const W = max * 24 + 24; let s = '<rect x="12" y="8" width="' + len * 24 + '" height="16" rx="8" fill="#ffb347" stroke="#c97a00" stroke-width="1.5"/><polygon points="' + (12 + len * 24) + ',8 ' + (12 + len * 24) + ',24 ' + (12 + len * 24 + 0) + ',16" fill="#c97a00"/>';
    s += '<rect x="6" y="32" width="' + (max * 24 + 12) + '" height="32" rx="4" fill="#fff6d6" stroke="#2a3247" stroke-width="1.5"/>';
    for(let i = 0; i <= max; i++){ const x = 12 + i * 24; s += '<line x1="' + x + '" x2="' + x + '" y1="32" y2="45" stroke="#2a3247" stroke-width="1.5"/><text x="' + x + '" y="59" font-size="11" font-weight="700" text-anchor="middle" fill="#2a3247">' + i + '</text>'; }
    s += '<line x1="12" x2="12" y1="4" y2="32" stroke="#e5484d" stroke-width="1" stroke-dasharray="3 2"/><text x="' + (W - 2) + '" y="76" font-size="11" font-weight="700" text-anchor="end" fill="#555">' + unit + '</text>';
    return TF.wrap(W + 6, 80, s, 'ruler'); },
  frac(n, k, round){ let s = '';
    if(round){ for(let i = 0; i < n; i++){ const a1 = i * 2 * Math.PI / n - Math.PI / 2, a2 = (i + 1) * 2 * Math.PI / n - Math.PI / 2;
        s += '<path d="M60 60 L' + (60 + 50 * Math.cos(a1)).toFixed(1) + ' ' + (60 + 50 * Math.sin(a1)).toFixed(1) + ' A50 50 0 0 1 ' + (60 + 50 * Math.cos(a2)).toFixed(1) + ' ' + (60 + 50 * Math.sin(a2)).toFixed(1) + ' Z" fill="' + (i < k ? '#ffb347' : '#fff') + '" stroke="#2a3247" stroke-width="2.5"/>'; }
      return TF.wrap(120, 120, s, 'fraction'); }
    const w = 240 / n; for(let i = 0; i < n; i++) s += '<rect x="' + (4 + i * w).toFixed(1) + '" y="4" width="' + w.toFixed(1) + '" height="46" fill="' + (i < k ? '#ffb347' : '#fff') + '" stroke="#2a3247" stroke-width="2.5"/>';
    return TF.wrap(248, 54, s, 'fraction'); },
  grid(a, b){ const c = Math.min(24, 200 / Math.max(a, b)); let s = '';
    for(let i = 0; i < a; i++) for(let j = 0; j < b; j++) s += '<rect x="' + (4 + i * c).toFixed(1) + '" y="' + (4 + j * c).toFixed(1) + '" width="' + c.toFixed(1) + '" height="' + c.toFixed(1) + '" fill="#d6f5d0" stroke="#5a9a50" stroke-width="1"/>';
    s += '<rect x="4" y="4" width="' + (a * c).toFixed(1) + '" height="' + (b * c).toFixed(1) + '" fill="none" stroke="#2a3247" stroke-width="2.5"/>';
    return TF.wrap(a * c + 8, b * c + 8, s, 'grid'); },
  dots(r, c){ let s = ''; for(let i = 0; i < r; i++) for(let j = 0; j < c; j++) s += '<circle cx="' + (14 + j * 24) + '" cy="' + (14 + i * 24) + '" r="8" fill="#ff7aa8" stroke="#b43b6a" stroke-width="1.5"/>';
    return TF.wrap(c * 24 + 4, r * 24 + 4, s, 'array'); },
  money(list, L){ let s = '', x = 6;
    list.forEach(v => { if(L === 'th' && v >= 20){ s += '<rect x="' + x + '" y="8" width="66" height="36" rx="5" fill="' + ({20: '#8fd694', 50: '#8ec5ff', 100: '#ff9a9a', 500: '#c9a7ff', 1000: '#d9c9a7'}[v]) + '" stroke="#2a3247" stroke-width="1.5"/><text x="' + (x + 33) + '" y="32" font-size="16" font-weight="900" text-anchor="middle" fill="#1b2433">' + v + '</text>'; x += 72; return; }
      const r = L === 'th' ? ({1: 12, 2: 13, 5: 14, 10: 15}[v]) : ({1: 12, 5: 13.5, 10: 11, 25: 15.5}[v]), fill = L === 'th' ? (v === 10 ? '#f4c542' : v === 2 ? '#f0d48a' : '#d7dbe2') : (v === 1 ? '#d98b4f' : '#d7dbe2');
      s += '<circle cx="' + (x + r) + '" cy="26" r="' + r + '" fill="' + fill + '" stroke="#6b7280" stroke-width="1.5"/><text x="' + (x + r) + '" y="30" font-size="' + (L === 'th' ? 12 : 10) + '" font-weight="900" text-anchor="middle" fill="#1b2433">' + (L === 'th' ? v : v + '¢') + '</text>'; x += 2 * r + 6; });
    return TF.wrap(Math.max(x, 40), 52, s, 'money'); },
  angle(deg){ const a = deg * Math.PI / 180, cx = 110, cy = 100, L = 88; let s = '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + L) + '" y2="' + cy + '" stroke="#2a3247" stroke-width="4" stroke-linecap="round"/><line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + L * Math.cos(a)).toFixed(1) + '" y2="' + (cy - L * Math.sin(a)).toFixed(1) + '" stroke="#2a3247" stroke-width="4" stroke-linecap="round"/>';
    s += deg === 90 ? '<path d="M' + (cx + 16) + ' ' + cy + ' V' + (cy - 16) + ' H' + cx + '" fill="none" stroke="#e5484d" stroke-width="2.5"/>' : '<path d="M' + (cx + 24) + ' ' + cy + ' A24 24 0 0 0 ' + (cx + 24 * Math.cos(a)).toFixed(1) + ' ' + (cy - 24 * Math.sin(a)).toFixed(1) + '" fill="none" stroke="#e5484d" stroke-width="2.5"/>';
    return TF.wrap(220, 108, s + '<circle cx="' + cx + '" cy="' + cy + '" r="3.5" fill="#2a3247"/>', 'angle'); }
};
/* 📏 s4a tests#2 → MathQuest_tests.html */
const tRd = x => Math.round(x * 1e6) / 1e6;
const tN = x => (x < 0 ? '−' : '') + Number(Math.abs(x)).toLocaleString('en-US', {maximumFractionDigits: 6});   // shown numbers: real minus sign, commas, up to 6 decimals
/* 📏 s4a tests#3 → MathQuest_tests.html */
// answer buttons: numbers stay numbers (number buttons + the ⌨️ pad); text answers are tapped
function testChoices(it, n){
  if(typeof it.a === 'number'){ const whole = Number.isInteger(it.a), neg = it.a < 0 || !!it.neg, fit = x => Number.isFinite(x) && (!whole || Number.isInteger(x)) && (neg || x >= 0), set = [it.a];   // ➗ mq-t2: decimals + negatives
    (it.o || []).forEach(x => { x = tRd(x); if(set.length < n && fit(x) && !set.includes(x)) set.push(x); });
    const st = whole ? 1 : Math.pow(10, -Math.min(6, (String(it.a).split('.')[1] || '').length));
    for(let k = 1; set.length < n && k < 30; k++) [tRd(it.a + k * st), tRd(it.a - k * st)].forEach(v => { if(set.length < n && fit(v) && !set.includes(v)) set.push(v); });
    return shuffle(set); }
  const out = [{w: String(it.a), ok: true}], has = new Set([String(it.a)]);
  (it.o || []).forEach(x => { const w = String(x); if(out.length < n && !has.has(w) && !/NaN|undefined|-\d|\/0\b/.test(w)){ has.add(w); out.push({w}); } });
  return shuffle(out);
}
/* 📏 s4a tests#4 → MathQuest_tests.html */
const CASE_NAMES = {en: ['Mia', 'Ben', 'Lily', 'Sam', 'Ploy', 'Ton', 'Fah', 'Max'], th: ['น้องมิว', 'น้องเบน', 'น้องพลอย', 'น้องต้น', 'น้องฟ้า', 'น้องนก', 'น้องข้าว', 'น้องภู']};
/* 📏 s4a tests#5 → MathQuest_tests.html */
function caseLabel(q, n){ return '📋 ' + (q.lang === 'th' ? 'สถานการณ์ ' : 'Case ') + n + ' (' + (q.caseStep + 1) + '/3)'; }
/* 📏 s4a tests#6 → MathQuest_tests.html */
/* 📏 s4a puzzles#1 → MathQuest_puzzles.html */
const PZ_RANGE = {sign: ['❓ + or − (with pictures)', '❓ + − × up to 10', '❓ all 4 signs', '❓ two signs (× ÷ first)', '❓ two signs, bigger numbers', '❓ three signs'],
  fix: ['🔍 right or wrong?', '🔍 right, too big or too small?', '🔍 find the wrong step', '🔍 column sums: find + fix', '🔍 story steps: find + fix', '🔍 3 steps: find + fix'],
  clock: ["🕐 o'clock", '🕐 half past', '🕐 quarter past · 5 minutes', '🕐 add minutes', '🕐 across the hour · how long', '🕐 24-hour · how long']};
function isPzMode(k){ return k === 'sign' || k === 'fix' || k === 'clock'; }
/* 📏 s4a puzzles#2 → MathQuest_puzzles.html */
/* 📏 s4a tests#7 → MathQuest_tests.html */
function storyText(q, W){
  { const st = classicStory(q, W); if(st) return st; }   // ➗ mq-w2: from the 📖 story engine
  const n = W.noun;
  if(q.op === 'add') return 'You have ' + q.a + ' ' + n + '. You get ' + q.b + ' more. How many ' + n + ' now?';
  if(q.op === 'sub') return 'There are ' + q.a + ' ' + n + '. ' + q.b + ' go away. How many are left?';
  if(q.op === 'mul') return q.a + ' ' + W.box + ' with ' + q.b + ' ' + n + ' in each. How many ' + n + ' altogether?';
  return 'Share ' + q.a + ' ' + n + ' into ' + q.b + ' ' + W.box + '. How many in each?';
}
function visFor(q, W, lvl){
  const it = pick(W.items);
  if(q.op === 'add'){ if(q.ans <= 12 && q.a <= 10 && q.b <= 10) return {type: 'groups', it, a: q.a, b: q.b, it2: pick(W.items)}; if(q.ans <= 20) return {type: 'line', from: q.a, step: q.b, max: Math.max(10, Math.ceil(q.ans / 5) * 5)}; return null; }
  if(q.op === 'sub'){ if(q.a <= 12) return {type: 'takeaway', it, a: q.a, b: q.b}; if(q.a <= 20) return {type: 'line', from: q.a, step: -q.b, max: Math.max(10, Math.ceil(q.a / 5) * 5)}; return null; }
  if(q.op === 'mul'){ if(q.a * q.b <= 40 && q.a <= 8 && q.b <= 10) return {type: 'array', it, rows: q.a, cols: q.b}; return null; }
  if(q.a <= 24) return {type: 'share', it, total: q.a, baskets: q.b};
  return null;
}
// Answer buttons: the right number + close mistakes kids really make (off by one/ten, wrong sign), never negative, never twice.
function choicesFor(q, n){
  const r = q.ask, set = new Set([r]), near = [r + 1, r - 1, r + 2, r - 2];
  if(r >= 20) near.push(r + 10, r - 10);
  if(q.op === 'add' && !q.missing) near.push(Math.abs(q.a - q.b));
  if(q.op === 'sub' && !q.missing) near.push(q.a + q.b);
  if(q.op === 'mul' && !q.missing) near.push(q.a + q.b, q.a * (q.b + 1), q.a * (q.b - 1));
  if(q.op === 'div' && !q.missing) near.push(q.ans + 1, q.b, q.a - q.b);
  shuffle(near).forEach(v => { if(set.size < n && Number.isInteger(v) && v >= 0 && v !== r) set.add(v); });
  let k = 3; while(set.size < n){ const v = r + (Math.random() < 0.5 ? -1 : 1) * k++; if(v >= 0) set.add(v); }
  return shuffle([...set]);
}
function eqParts(q, f){
  const s = SERIES[q.op].sym, blank = '<span class="q" id="qmark">?</span>', N = f || (n => n);   // ➗ mq-w1: f = thaiDigits for ๑๒๓
  if(q.missing === 'a') return [blank, s, N(q.b), '=', N(q.ans)];
  if(q.missing === 'b') return [N(q.a), s, blank, '=', N(q.ans)];
  return [N(q.a), s, N(q.b), '=', blank];
}
function sayText(q){
  const w = SERIES[q.op].word;
  if(q.word) return q.word;
  if(q.missing === 'a') return 'What number ' + w + ' ' + q.b + ' makes ' + q.ans + '?';
  if(q.missing === 'b') return q.a + ' ' + w + ' what makes ' + q.ans + '?';
  return q.a + ' ' + w + ' ' + q.b + '. What do you get?';
}

/* ================= STATE ================= */
let S = {players: [], progress: {}, settings: {}, avatars: {}, player: '', age: ''};
let G = null, lockHandle = null, series = 'add', world = 'school', timerId = 0, voiceOn = false;
function store(k){ return 'sp_mathquest_' + k + ':' + (S.player || ''); }
let testGrade = 'mix';   // ➗ mq-t3: 🌋 grade chip (📝 modes)
let mode = 'classic', ansPick = 'auto', recentQ = {}, prefsTimer = 0, trickSeen = {en: [], th: []};   // ➗ mq-w3: 🤔 tricks seen per language   // ➗ mq-w1: way to play · 👆/⌨️ · 🎲 last rounds' questions
function loadPrefs(){ mode = 'classic'; ansPick = 'auto'; recentQ = {}; trickSeen = {en: [], th: []};
  try{ const s = localStorage.getItem(store('series')); if(SERIES[s]) series = s; const w = localStorage.getItem(store('world')); if(WORLDS[w]) world = w; const v = localStorage.getItem(store('voice')); voiceOn = v ? v === '1' : young(S.age);
    const m = localStorage.getItem(store('mode')); if(m && MODES.some(x => x.k === m && !x.soon)) mode = m; const a = localStorage.getItem(store('ans')); if(/^(auto|choose|type)$/.test(a || '')) ansPick = a; const gr = localStorage.getItem(store('grade')); testGrade = /^(9|10|11|12)$/.test(gr || '') ? gr : 'mix'; }catch(e){ voiceOn = young(S.age); }
  // ➗ mq-w1: the player's picks follow the PLAYER to every device (Aowu 2026-11-14) — Settings MathQuest_<Name> wins over this device
  try{ const p = JSON.parse((S.settings || {})['MathQuest_' + S.player] || 'null');
    if(p && typeof p === 'object'){ if(MODES.some(x => x.k === p.mode && !x.soon)) mode = p.mode; if(/^(auto|choose|type)$/.test(p.ans || '')) ansPick = p.ans; if(SERIES[p.series]) series = p.series; if(WORLDS[p.world]) world = p.world; if(p.recent && typeof p.recent === 'object') recentQ = p.recent;
      if(p.tricks && typeof p.tricks === 'object') ['en', 'th'].forEach(l => { if(Array.isArray(p.tricks[l])) trickSeen[l] = p.tricks[l].slice(-200).map(String); }); } }catch(e){} }   // ➗ mq-w3
function savePrefs(){ try{ localStorage.setItem(store('series'), series); localStorage.setItem(store('world'), world); localStorage.setItem(store('voice'), voiceOn ? '1' : '0'); localStorage.setItem(store('mode'), mode); localStorage.setItem(store('ans'), ansPick); localStorage.setItem(store('grade'), testGrade); }catch(e){}
  if(!S.player) return; const who = S.player, obj = {mode, ans: ansPick, series, world, recent: recentQ, tricks: trickSeen};   // ➗ mq-w3
  S.settings['MathQuest_' + who] = JSON.stringify(obj);
  clearTimeout(prefsTimer); prefsTimer = setTimeout(() => { try{ google.script.run.withFailureHandler(() => {}).saveMathPrefs(who, obj); }catch(e){} }, 1200); }
function mqRemember(g){   // 🎲 keep this round's questions — the next 3 rounds of this mode + level skip them
  if(!g || g.challenge || !g.keys || !g.keys.length) return; const k = g.mode + ':' + g.lvl;
  recentQ[k] = (Array.isArray(recentQ[k]) ? recentQ[k] : []).concat([g.keys.slice(0, 30)]).slice(-3);
  const ks = Object.keys(recentQ); if(ks.length > 40) delete recentQ[ks[0]];
  savePrefs(); }
function myAvatar(name){ const a = (S.avatars || {})[name || S.player]; return a ? fixAv(a) : defaultAvatar(name || S.player || 'player'); }
window.feedbackContext = () => ({page: 'Math Quest', game: GAME_ID, level: G ? LEVELS[G.lvl].name + ' · ' + SERIES[G.series].name + ' · ' + WORLDS[G.world].name + ' · ' + modeOf(G.mode).name : modeOf(mode).name});
if(window.UI && UI.GAME_HELP) UI.GAME_HELP['math-quest'] = ['Answer maths questions in 5 worlds — with numbers, in English words (🔤 Word Sums) or in Thai words (🐘 เลขคำไทย).', 'Practise for school tests: 📝 Test Practice (Western style) or 📝 ข้อสอบ (Thai style) — Grade 1 to 12, then 💀 real-life cases.', 'Spot the trap in 🤔 Trick Questions (English) or 🙃 คำถามหลอก (ไทย) — think twice before you tap!', 'Solve real-life 📖 Story Problems (English) or 📜 โจทย์ปัญหา (ไทย) — money, minutes and 1–3 steps, with a 🪜 steps line after each answer.', 'Play detective: ❓ Missing sign · 🔍 Find the mistake · 🕐 Clock maths.', 'Sharp ears: 🎧 Listen (English) or 👂 ฟังโจทย์ (ไทย) — hear the sum, then answer.', 'Tap the answer — or ⌨️ type it on the number pad (from ⚡ Hard, ×1.25 points).', 'Try ⏱️ Minute Challenge: how many in 60 seconds?'];   // ➗ mq-w1: page copy until the UiKit lane moves it in

/* ================= MENUS ================= */
function showScreen(name){
  ['player', 'menu', 'play'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
  $('back-btn').classList.toggle('hidden', name === 'play'); UI.navScreen($('back-btn'), name, NAV_INNER); if(name === 'play') coverOff(); window.scrollTo(0, 0);   // 🧭 p1b · 🧱 b3w6c
}
function progressOf(name){ return S.progress[name] || {unlocked: 0, tokens: [], best: []}; }
function canPlay(i){ const p = progressOf(S.player); if(i === 5) return p.unlocked >= 5; if(i === 4) return p.unlocked >= 4; return i <= Math.max(p.unlocked, AGE_START[S.age] || 0); }
function renderPlayers(){
  const box = $('player-list'); box.innerHTML = '';
  if(!S.players.length){ box.innerHTML = '<div class="empty">No players yet — add one on the Dashboard first.</div>'; return; }
  S.players.forEach(p => { const b = document.createElement('button'); b.className = 'pick'; b.setAttribute('data-sound', 'pop');
    const c = document.createElement('canvas'); c.width = 144; c.height = 168; b.appendChild(c);
    b.insertAdjacentHTML('beforeend', '<div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age ? p.Age + ' yrs' : '') + '</div>');
    try { drawPreviewCanvas(c, myAvatar(p.Name), {name: p.Name, t: 1}); } catch(e){}
    b.onclick = () => choosePlayer(p.Name); box.appendChild(b); });
}
function choosePlayer(name){
  UI.rememberTheme(name, UI.applyTheme(UI.themeFor(S.settings, name), {kitOnly: true}));
  const p = S.players.find(x => x.Name === name); S.player = name; S.age = p ? p.Age : '';
  loadPrefs(); $('who-name').textContent = name; if(window.Cheer){ Cheer.chip($('cheer-chip'), name); Cheer.langChip($('cheer-lang'), name); } /* 📣 cs-4b */ renderMenu(); showScreen('menu'); openCover();   /* 🧱 b3w6c: the 🎬 cover first */
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
// The series + world rows: built once per menu visit, a tap only moves the highlight (no page jump).
function renderMenu(){
  renderModes(); renderAns();   // ➗ mq-w1
  $('series-list').innerHTML = SERIES_KEYS.map(k => '<button class="chip' + (k === series ? ' on' : '') + '" data-sound="pop" data-series="' + k + '"><span class="ic">' + SERIES[k].icon + '</span>' + SERIES[k].name + (SERIES[k].mult > 1 ? '<small class="mult">×' + SERIES[k].mult + '</small>' : '') + '</button>').join('');
  $('world-list').innerHTML = WORLD_KEYS.map(k => '<button class="chip' + (k === world ? ' on' : '') + '" data-sound="pop" data-world="' + k + '"><span class="ic">' + WORLDS[k].icon + '</span>' + WORLDS[k].name + '<small>' + WORLDS[k].sub + '</small></button>').join('');
  $('series-list').querySelectorAll('[data-series]').forEach(b => b.onclick = () => { series = b.dataset.series; savePrefs(); $('series-list').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); renderLevels(); });
  $('world-list').querySelectorAll('[data-world]').forEach(b => b.onclick = () => { world = b.dataset.world; savePrefs(); $('world-list').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); markPicks(); });   /* 🧱 b3w6c */
  menuLang(); renderLevels();   // ➗ mq-t4b
}
// ➗ mq-w1: 🗂️ the ways to play (UiKit mode cards); 🔜 cards say "coming soon" and change nothing
function renderModes(){
  UI.modeGroups($('mode-list'), MODE_GROUPS, MODES.map(m => Object.assign({}, m, {on: m.k === mode}, isListenMode(m.k) && !listenVoice(m.k) ? {soon: true, sub: LISTEN_NOVOICE[m.k]} : {})), {   // ➗ mq-w5: greyed + why when there is no voice
    onPick: k => { const m = modeOf(k);
      if(isListenMode(k) && !listenVoice(k)){ UISound.play('error'); UI.toast(LISTEN_NOVOICE[k] + (k === 'listenth' ? ' — ลองเลขคำไทยแทนนะ' : ' — try Word Sums instead')); return 'stop'; }
      if(m.soon){ UISound.play('error'); UI.toast(m.g === 'thai' ? '🔜 ' + m.name + ' — เร็ว ๆ นี้!' : '🔜 ' + m.name + ' is coming soon!'); return 'stop'; }
      mode = k; savePrefs(); menuParts(); renderLevels(); mqPrefetch(k); /* 📏 s4a */ return true; },
    next: () => $('lvl-head'), moreText: '👇 Pick a level below'});
  menuParts(); mqPrefetch(mode);   /* 📏 s4a: the remembered mode's part starts loading */
}
const MENU_TH = {   // ➗ mq-t4b: the start page in Thai when a Thai mode is picked
  head: {'mode-head': ['Pick a way to play', 'เลือกวิธีเล่น'], 'series-head': ['Pick your maths', 'เลือกโจทย์เลข'], 'world-head': ['Pick a world', 'เลือกโลก'], 'ans-head': ['How do you answer?', 'ตอบแบบไหน?'], 'opt-head': ['Options', 'ตั้งค่า']},
  series: {add: 'บวก', sub: 'ลบ', mul: 'คูณ', div: 'หาร', mix: 'คละ'},
  world: {school: ['โรงเรียน', 'ดินสอ หนังสือ และแอปเปิล'], space: ['อวกาศ', 'ฐานจรวดและดวงดาว'], lab: ['ห้องแล็บ', 'หลอดทดลองและฟองอากาศ'], animals: ['โลกสัตว์', 'ลูกหมา ลูกแมว ลูกเจี๊ยบ'], market: ['ตลาด', 'ผลไม้ ผัก และเหรียญ']},
  ans: {auto: ['อัตโนมัติ', 'แตะก่อน · พิมพ์ตั้งแต่ ⚡ ยาก'], choose: ['เลือก', 'แตะคำตอบ'], type: ['พิมพ์', 'แป้นตัวเลข · คะแนน ×1.25']}};
function menuLang(){ const th = isThaiMode(mode); document.body.classList.toggle('mq-th', th);
  const label = (b, name, sub) => { [...b.childNodes].filter(n => n.nodeType === 3).forEach(n => n.remove()); const ic = b.querySelector('.ic'); b.insertBefore(document.createTextNode(name), ic ? ic.nextSibling : b.firstChild); const sm = b.querySelector('small:not(.mult)'); if(sm && sub !== undefined) sm.textContent = sub; };
  Object.entries(MENU_TH.head).forEach(([id, t]) => { const h = $(id); if(!h) return; const tgt = h.querySelector('.lt'); if(tgt) return; [...h.childNodes].filter(n => n.nodeType === 3).forEach(n => n.remove()); h.appendChild(document.createTextNode(' ' + (th ? t[1] : t[0]))); });
  document.querySelectorAll('#series-list [data-series]').forEach(b => label(b, th ? MENU_TH.series[b.dataset.series] : SERIES[b.dataset.series].name));
  document.querySelectorAll('#world-list [data-world]').forEach(b => { const k = b.dataset.world; label(b, th ? MENU_TH.world[k][0] : WORLDS[k].name, th ? MENU_TH.world[k][1] : WORLDS[k].sub); });
  document.querySelectorAll('#ans-list [data-ans]').forEach(b => { const a = ANS_WAYS.find(x => x.k === b.dataset.ans), t = MENU_TH.ans[b.dataset.ans]; label(b, th ? t[0] : a.name, th ? t[1] : a.sub); }); }
function menuParts(){
  const minute = mode === 'minute';
  ['series-head', 'series-list', 'ans-head', 'ans-list'].forEach(id => $(id).classList.toggle('hidden', minute || isTrickMode(mode) || isTestMode(mode) || isPzMode(mode)));   // ➗ mq-w3: tricks have their own maths + are always tapped
  ['grade-head', 'grade-list'].forEach(id => $(id).classList.toggle('hidden', !isTestMode(mode))); if(isTestMode(mode)) renderGrade();   // ➗ mq-t3
  let n = 0; document.querySelectorAll('#scr-menu .section-head').forEach(h => { if(h.classList.contains('hidden')) return; const sn = h.querySelector('.sn'); if(sn) sn.textContent = (++n) + '.'; });
  $('lvl-head').querySelector('.lt').textContent = minute ? 'Start the race' : mtx('Pick a level', 'เลือกระดับ');   // ➗ mq-t4b
  if(window.UI && UI.modeMore) UI.modeMore(() => $('lvl-head'), mtx('👇 Pick a level below', '👇 เลือกระดับด้านล่าง'));   // ➗ mq-t4b: the 👇 pill in the mode's language
  menuLang();
}
function renderGrade(){   // ➗ mq-t3: 🌋 Extreme in 📝 modes plays one grade or all four
  const th = mode === 'testth', G4 = [['mix', '🎲', th ? 'คละ' : 'Mixed'], ['9', '', th ? 'ม.3' : 'Grade 9'], ['10', '', th ? 'ม.4' : 'Grade 10'], ['11', '', th ? 'ม.5' : 'Grade 11'], ['12', '', th ? 'ม.6' : 'Grade 12']];
  $('grade-t').textContent = th ? '🌋 ยากมาก: ชั้นไหน?' : '🌋 Extreme: which grade?';
  $('grade-list').innerHTML = G4.map(g => '<button class="chip grade-chip' + (String(testGrade) === g[0] ? ' on' : '') + '" data-sound="pop" data-grade="' + g[0] + '">' + (g[1] ? '<span class="ic">' + g[1] + '</span>' : '') + g[2] + '</button>').join('');
  $('grade-list').querySelectorAll('[data-grade]').forEach(b => b.onclick = () => { testGrade = b.dataset.grade; savePrefs(); renderGrade(); renderLevels(); });
}
function renderAns(){
  $('ans-list').innerHTML = ANS_WAYS.map(a => '<button class="chip ans-chip' + (a.k === ansPick ? ' on' : '') + '" data-sound="pop" data-ans="' + a.k + '"><span class="ic">' + a.icon + '</span>' + a.name + '<small>' + a.sub + '</small></button>').join('');
  $('ans-list').querySelectorAll('[data-ans]').forEach(b => b.onclick = () => { ansPick = b.dataset.ans; savePrefs(); $('ans-list').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); });
}
function rangeText(L){
  if(isWordMode(mode)) return wordRange(L);   // ➗ mq-w1
  if(isStoryMode(mode)) return storyRange(L);  // ➗ mq-w2
  if(isPzMode(mode)) return PZ_RANGE[mode][Math.max(0, LEVELS.indexOf(L))];   // ➗ mq-w4
  if(isTestMode(mode)){ const i = Math.max(0, LEVELS.indexOf(L)); if(i === 4 && testGrade !== 'mix') return '📝 ' + gradeLabel(Number(testGrade), mode === 'testth' ? 'th' : 'en'); return TEST_RANGE[mode === 'testth' ? 'th' : 'en'][i]; }   // ➗ mq-t1 · mq-t3 🌋 chip
  if(isTrickMode(mode)) return TRICK_RANGE[mode === 'trickth' ? 'th' : 'en'][Math.max(0, LEVELS.indexOf(L))];   // ➗ mq-w3
  if(series === 'mul') return L.tables ? '✖️ tables ' + L.tables.join(' ') + (L.big ? ' + big ones' : '') : '✖️ up to ' + L.mul[0] + ' × ' + L.mul[1] + (L.big ? ' + big ones' : '');
  if(series === 'div') return L.tables ? '➗ share by ' + L.tables.join(' ') : '➗ up to ' + (L.div[0] * L.div[1]) + ' ÷ ' + L.div[0];
  return SERIES[series].icon + ' up to ' + L.add;
}
function storyRange(L){ const i = Math.max(0, LEVELS.indexOf(L)), th = mode === 'storyth', n = ['1', '1', '1', '2', '2–3', '3'][i], cap = STORY_CAP[i].toLocaleString();   // ➗ mq-w2
  return (th ? '📜 ' + n + ' ขั้น · ถึง ' + cap + (i >= 3 ? ' · 🪙 บาท ⏰ นาที' : '') + (i >= 4 ? ' · 🙈 เลขหลอก' : '') : '📖 ' + n + (n === '1' ? ' step' : ' steps') + ' · up to ' + cap + (i >= 3 ? ' · 🪙 baht ⏰ minutes' : '') + (i >= 4 ? ' · 🙈 extra number' : '')); }
function wordRange(L){ const th = mode === 'wordth', top = series === 'mul' || series === 'div' ? (L.tables ? 'tables' : (L.mul[0] * L.mul[1])) : L.add, n = typeof top === 'number' ? (th ? wordsTH(top) : wordsEN(top)) : (th ? 'สูตรคูณ' : 'times tables');
  return (th ? '🐘 คำไทย · ถึง ' : '🔤 in words · up to ') + n; }
function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">' + mtx('No score yet', 'ยังไม่มีคะแนน') + '</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span>' + (b.timeSec ? '<span>⏱ ' + fmt(b.timeSec * 1000) + '</span>' : '') + '<span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }
function renderLevels(){
  const box = $('level-list'); box.innerHTML = '';   /* 🧱 b3w6c: 🏆 leaders live on the cover */ const p = progressOf(S.player), rec = AGE_START[S.age];
  if(mode !== 'minute') LEVELS.forEach((L, i) => {   // ➗ mq-w1: ⏱️ Minute = its own mode
    const open = canPlay(i), done = p.unlocked > i, b = document.createElement('button');
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (L.hardcore ? ' hardcore' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none');
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + L.emoji + '</div><div class="nm">' + mtx(L.name, LEVEL_TH[L.name] || L.name) + '</div><div class="learn">' + rangeText(L) + '</div>' +
      '<div class="lives">' + L.qs + mtx(' questions', ' ข้อ') + ' · ⏱ ' + fmt(L.time * 1000 * modeTime(mode) * caseTime(mode, L)) + (L.hardcore ? mtx(' · 💀 1 mistake', ' · 💀 ผิดได้ 1 ครั้ง') : '') + '</div>' +
      '<div class="sub">' + (L.hardcore && !open ? mtx('🔒 Beat Extreme to open 💀 Hardcore', '🔒 ผ่านระดับยากมากก่อน จึงจะเล่นสุดโหดได้') : mtx(L.blurb, BLURB_TH[L.name] || L.blurb)) + '</div>' + bestHtml(p, i);   /* ➗ mq-t4b: Thai cards in Thai modes */
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? mtx('Beat Extreme to open 💀 Hardcore', 'ผ่านระดับยากมากก่อน จึงจะเล่นสุดโหดได้') : i === 4 ? mtx('Pass Hard to unlock Extreme!', 'ผ่านระดับยากก่อน จึงจะเล่นยากมากได้!') : mtx('Pass the level before to unlock it', 'ผ่านระดับก่อนหน้าก่อนนะ')); return; } chooseLevel(i); };   /* 🧱 b3w6c: a tap picks */
    b.dataset.i = i; box.appendChild(b);
  });
  // ⏱️ Minute Challenge card (➗ mq-w1: only in the ⏱️ mode)
  if(mode !== 'minute'){ b3Restore(); return; }   /* 🧱 b3w6c */
  const cOpen = p.unlocked >= 3, cb = challengeBest(), c = document.createElement('button');
  c.className = 'pick lvl challenge' + (cOpen ? '' : ' locked'); c.setAttribute('data-sound', cOpen ? 'pop' : 'none');
  c.innerHTML = (cOpen ? '' : '<span class="badge">🔒</span>') + '<div class="big">⏱️</div><div class="nm">Minute Challenge</div><div class="learn">🔀 mixed · ✖️ ➗ tables 6 7 8 9 11 12</div>' +
    '<div class="lives">60 seconds · count ✅ and ❌</div><div class="sub">' + (cOpen ? CHALLENGE.blurb : '🔒 Pass Intermediate to open') + '</div>' +
    (cb ? '<div class="best"><span>✅ best ' + cb.right + '</span><span>🏆 ' + cb.score.toLocaleString() + '</span></div>' : '<div class="best none">No try yet</div>');
  c.onclick = () => { if(!cOpen){ UISound.play('error'); UI.toast('Pass Intermediate to open the ⏱️ Minute Challenge'); return; } chooseLevel('c'); };   /* 🧱 b3w6c: a tap picks */
  c.dataset.i = 'c'; box.appendChild(c); b3Restore();
}
/* 🧱 b3w6c (Game Baseline): ONE setup page — the picks, then ▶ Start; the level is remembered per player */
let chosenLevel = 0;
const setupKey = k => 'sp_' + GAME_ID.replace(/-/g, '') + '_' + k + ':' + (S.player || '');
function chooseLevel(i, quiet){
  chosenLevel = i; try{ localStorage.setItem(setupKey('lv'), String(i)); }catch(e){}
  markPicks(); if(!quiet){ const w = $('opt-head'); if(w && w.scrollIntoView) w.scrollIntoView({behavior: 'smooth', block: 'center'}); }
}
function markPicks(){
  document.querySelectorAll('#level-list .lvl[data-i]').forEach(b => { const on = String(b.dataset.i) === String(chosenLevel); b.classList.toggle('sel', on); if(window.GF && GF.pick) GF.pick(b, on); });
  const st = $('btn-start'); if(!st) return; const go = mtx('▶ Start', '▶ เริ่ม');
  if(chosenLevel === 'c'){ st.textContent = go + ' · ⏱️ Minute Challenge'; return; }
  const L = LEVELS[chosenLevel], W = WORLDS[world], showS = !$('series-list').classList.contains('hidden');
  if(L) st.textContent = go + ' · ' + L.emoji + ' ' + mtx(L.name, LEVEL_TH[L.name] || L.name) + (showS && SERIES[series] ? ' · ' + SERIES[series].icon : '') + (W ? ' · ' + W.icon : '');
}
function b3Restore(){   // the last level per player (⏱️ Minute mode = its race card)
  if(mode === 'minute'){ chosenLevel = 'c'; markPicks(); return; }
  let i = -1; try{ const v = localStorage.getItem(setupKey('lv')); i = v === null || v === 'c' ? -1 : Number(v); }catch(e){} const rec0 = AGE_START[S.age] || 0;
  chosenLevel = i >= 0 && canPlay(i) ? i : (canPlay(rec0) ? rec0 : Math.max(0, [0, 1, 2, 3, 4, 5].filter(canPlay).pop() || 0)); markPicks();
}
function startSetup(){
  if(chosenLevel === 'c'){ if(progressOf(S.player).unlocked < 3){ UISound.play('error'); UI.toast('Pass Intermediate to open the ⏱️ Minute Challenge'); return; } startGame('c'); return; }
  if(!canPlay(chosenLevel)){ UISound.play('error'); UI.toast(mtx('Pick a level that is open 🔓', 'เลือกระดับที่เปิดแล้ว 🔓')); return; } startGame(chosenLevel); }
// 🎬 the cover (GameFrame): who's here + champions + how to play; ▶ Play opens the setup page
let MqCover = null;
const MQ_VERSION = '2.0';   /* 🧱 b3w6c: shown on the cover footer — bump with each round */
function coverOff(){ if(MqCover) MqCover.hide(); }
function b3Help(){   // the game's own full how-to list (bold labels kept) for the cover's 📖 sheet; none → UiKit's 3 lines
  const t = $('b3-rules'); if(!t || !t.content) return undefined;
  const L = [...t.content.querySelectorAll('li')].map(li => { const c = li.cloneNode(true); c.querySelectorAll('b').forEach(b => b.replaceWith('**' + b.textContent.trim() + '**')); return c.textContent.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
  return L.length ? L : undefined;
}
function openCover(){
  if(!window.GF){ showScreen('menu'); return; }
  if(MqCover && MqCover.who !== S.player){ MqCover.destroy(); MqCover = null; }
  if(!MqCover){ MqCover = GF.cover(document.body, {game: GAME_ID, title: 'Math Quest', icon: '🧮', version: MQ_VERSION, me: S.player, players: S.players, avatarOf: myAvatar, seats: {min: 1, max: 1},
      acts: ['beat.cheer', 'beat.jump'], backTo: WEBAPP_URL + '?page=gameroom' + sessionQuery(), backKind: 'rooms', help: b3Help(),
      onPlay: () => { MqCover.hide(); showScreen('menu'); } }); MqCover.who = S.player; }
  MqCover.show();
}
function challengeKey(){ return 'sp_mathquest_challenge:' + (S.player || ''); }
function challengeBest(){ try { return JSON.parse(localStorage.getItem(challengeKey()) || 'null'); } catch(e){ return null; } }

/* ================= 📏 S4 PARTS — Math Quest's big modes load when they are played (📏 Split chat s4a, File Split plan §S4) =================
   📖 Story + 🤔 Trick → MathQuest_words · 📝 Test practice / ข้อสอบ (+ 💀 cases) → MathQuest_tests · ❓ 🔍 🕐 → MathQuest_puzzles
   (built by Test Harness/parts/build_parts.py from parts/MathQuest/<part>.js — edit those). ▶ Start opens a round only after its part is in
   (GameParts.need, with the game's own loader); picking the mode on the setup page starts the download early. 📲 offline app + tests: every
   part is inline (Code.gs INCLUDE_ALSO_ MathQuestParts) → it is there at once. The setup page (mode cards, level ranges, grade chips) stays HERE. */
function MQ_PART_OF(k){ return isStoryMode(k) || isTrickMode(k) ? 'MathQuest_words' : isTestMode(k) ? 'MathQuest_tests' : isPzMode(k) ? 'MathQuest_puzzles' : null; }
function mqPartReady(k){ const f = MQ_PART_OF(k); return !f || (typeof GameParts !== 'undefined' && GameParts.has(f)); }
function mqPrefetch(k){ const f = MQ_PART_OF(k); if(f && typeof GameParts !== 'undefined' && !GameParts.has(f)) GameParts.need(f); }
function mqNeed(k, go){ const f = MQ_PART_OF(k); if(!f) return go();
  if(typeof GameParts === 'undefined') return setTimeout(() => mqNeed(k, go), 40);   // the loader comes right after this script
  if(GameParts.has(f)) return go();
  const m = modeOf(k) || {}; UI.loading('math-quest', (m.icon || '➗') + ' ' + mtx('Getting ', 'กำลังโหลด ') + (m.name || 'Math Quest') + '…');
  GameParts.need(f, ok => { UI.loaded(); if(ok) return go(); UISound.play('error'); UI.toast(mtx('📡 This way to play did not load — check the internet, then tap ▶ Start again', '📡 โหลดไม่สำเร็จ — ตรวจอินเทอร์เน็ต แล้วกด ▶ เริ่ม อีกครั้ง'), 'err'); }); }
/* ================= 📏 END S4 PARTS ================= */
/* ================= GAME ================= */
function startGame(lvl){ if(lvl !== 'c' && isListenMode(mode) && !listenVoice(mode)){ UISound.play('error'); UI.toast(LISTEN_NOVOICE[mode]); return; } if(lvl !== 'c' && !mqPartReady(mode)) return mqNeed(mode, () => startGame(lvl));   /* 📏 s4a: wait for the mode's part file */   // ➗ mq-w5
  coverOff(); setTimeout(cheerMount, 0); /* 📣 cs-4b · 🧱 b3w6c */ { const mp = document.querySelector('.ui-mg-more'); if(mp) mp.classList.add('hidden'); }   /* ➗ mq-w5: the 👇 menu pill never flashes over the first question */
  clearInterval(timerId); hideResult();
  const ch = lvl === 'c', L = ch ? CHALLENGE : LEVELS[lvl], W = WORLDS[world];
  if(ch) lvl = 3;   // Hard-sized numbers for ➕ ➖
  const md = ch ? 'minute' : (MODES.some(m => m.k === mode && !m.soon && m.k !== 'minute') ? mode : 'classic');   // ➗ mq-w1
  const rk = md + ':' + lvl, recent = new Set([].concat(...(Array.isArray(recentQ[rk]) ? recentQ[rk] : [])));
  G = {mode: md, recent, keys: [], seen: new Set(), way: 'choose', typed: '', wordRight: 0, thaiRight: 0, typedRight: 0, storyRight: 0, trickRight: 0, testRight: 0, tkUsed: new Set(),
    lvl, L, series: ch ? 'mix' : isTrickMode(md) || isTestMode(md) || isPzMode(md) ? 'add' : series, world, challenge: ch, age: S.age, qi: 0, q: null, right: 0, wrong: 0, streak: 0, bestStreak: 0, score: 0, hints: L.hardcore ? 0 : 3, usedHint: false,
    locked: false, over: false, t0: performance.now(), paused: false, pausedAt: 0, pausedTotal: 0, limit: L.time * 1000 * modeTime(md) * caseTime(md, L), answers: []};   // ➗ mq-w2: 📖 ×1.7
  const sp = $('scr-play'); sp.style.setProperty('--w1', W.c[0]); sp.style.setProperty('--w2', W.c[1]); sp.classList.toggle('dark', !!W.dark);
  BAR.level((isWordMode(md) || isListenMode(md) || isStoryMode(md) || isTrickMode(md) || isTestMode(md) || isPzMode(md) ? modeOf(md).icon + ' ' : '') + L.emoji + ' ' + lvLabel(md, L) + (isTrickMode(md) || isTestMode(md) || isPzMode(md) ? ' · ' : ' · ' + SERIES[G.series].icon + ' ') + W.icon, L.hardcore ? 'hc' : '');
  $('mascot').textContent = W.mascot; $('hint-btn').classList.toggle('hidden', !!L.hardcore || ch);
  paintVoice();
  showScreen('play');
  nextQ();
  timerId = setInterval(tick, 200);
  showBanner(ch ? '⏱️ 60 seconds — answer as many as you can!' : L.hardcore ? tx('💀 Hardcore: one wrong answer ends it — go!', '💀 สุดโหด: ผิดข้อเดียวจบเกม — ลุย!') : W.icon + ' ' + tx(W.name + ' — ' + L.qs + ' questions, go!', (WORLD_TH[world] || W.name) + ' — ' + L.qs + ' ข้อ เริ่มเลย!'), L.hardcore ? 'bad' : 'gold');
}
function elapsed(){ return G ? performance.now() - G.t0 - G.pausedTotal - (G.paused ? performance.now() - G.pausedAt : 0) : 0; }
function timeLeft(){ return G ? Math.max(0, G.limit - elapsed()) : 0; }
function nextQ(){
  if(!G) return;
  let q = null, tries = 0;   // ➗ mq-w1 🎲: skip questions of this round and of the last 3 rounds (gives up after 14 tries — small levels)
  if(G.caseQ && G.caseQ.length) q = G.caseQ.shift();   // ➗ mq-t4: the case's next question
  else do { q = makeQ(G.series, G.lvl, G.world, G.age, G.L, G.mode); tries++; } while(tries < 14 && (G.seen.has(q.key) || G.recent.has(q.key)));
  G.seen.add(q.key); G.keys.push(q.key); trickSaw(q);   // ➗ mq-w3
  if(q.caseRest){ G.caseN = (G.caseN || 0) + 1; G.caseQ = q.caseRest; q.caseRest = null; } if(q.cased) q.gradeLabel = caseLabel(q, G.caseN || 1);   // ➗ mq-t4
  G.q = q; G.way = ansWay(q, G.lvl, G.challenge); G.typed = ''; G.locked = false; G.usedHint = false;
  renderQ(); hud();
  if(q.cased && q.caseStep === 0 && G.caseN > 1) showBanner('📋 ' + q.caseIcon + ' ' + tx('Case ', 'สถานการณ์ ') + G.caseN + ': ' + q.caseTitle, 'gold');   // ➗ mq-t4
  if(voiceOn || q.listen) setTimeout(() => { if(G && !G.over && G.q === q) sayQ(); }, 250);   // ➗ mq-w5: 🎧 always speaks
}
function renderQ(){
  const q = G.q, card = $('qcard');
  $('qno').textContent = G.challenge ? '⏱️ Question ' + (G.qi + 1) : 'Question ' + (G.qi + 1) + ' of ' + G.L.qs;
  $('word').classList.toggle('hidden', !q.word); $('word').textContent = q.word;
  const vis = $('vis'); vis.innerHTML = q.vis ? visHtml(q.vis) : ''; vis.classList.toggle('hidden', !q.vis);
  const eq = $('eq'), th = q.lang === 'th', wordsEq = q.form === 'w2n' || q.form === 'w2w';   // ➗ mq-w1
  eq.className = 'eq' + (wordsEq ? ' eqw' : '') + (th ? ' th' : '') + (q.form === 't2w' ? ' tdig' : '');
  eq.innerHTML = wordsEq ? eqWordParts(q) : eqParts(q, q.form === 't2w' ? thaiDigits : null).join(' ');
  if(q.listen){ eq.className = 'eq eql' + (th ? ' th' : ''); eq.innerHTML = '<button class="lis-btn" data-sound="none" onclick="sayQ()" aria-label="' + (th ? 'ฟังอีกครั้ง' : 'Hear it again') + '">🔊</button><span class="lis-t">' + (th ? 'ฟังแล้วตอบ' : 'Listen!') + '</span> <span class="q" id="qmark">?</span>';   // ➗ mq-w5
    $('word').textContent = q.shown ? listenText(q) : ''; $('word').classList.toggle('hidden', !q.shown); }
  if(th) $('qno').textContent = 'ข้อ ' + (G.qi + 1) + ' จาก ' + G.L.qs;
  $('word').classList.toggle('story', !!(q.story || q.trick || q.test)); $('word').classList.toggle('th', !!(q.story || q.trick || q.test) && th);   // ➗ mq-w2 📖
  if(q.story){ $('word').innerHTML = q.storyHtml; eq.className = 'eq eqs' + (th ? ' th' : ''); eq.innerHTML = '<span class="q" id="qmark">?</span> <span class="unit">' + UI.esc(th ? q.unit.t : q.unit.e) + '</span>'; }
  vis.classList.toggle('tfv', !!q.fig);
  if(q.test){ $('word').innerHTML = q.storyHtml; eq.className = 'eq eqs eqt' + (th ? ' th' : ''); eq.innerHTML = '<span class="q" id="qmark">?</span>';   // ➗ mq-t1 📝
    if(q.fig){ vis.innerHTML = q.fig; vis.classList.remove('hidden'); } if(q.gradeLabel) $('qno').textContent += ' · ' + q.gradeLabel; }   /* ➗ mq-w4: puzzles have no grade */
  if(q.trick){ $('word').innerHTML = q.storyHtml; eq.className = 'eq eqs eqt' + (th ? ' th' : ''); eq.innerHTML = '<span class="q" id="qmark">?</span>'; }   // ➗ mq-w3 🤔
  $('hintline').classList.add('hidden'); $('hintline').classList.remove('steps', 'trickl', 'trickok');
  const ans = $('answers');
  if(q.wordAns){   // 🔤 / 🐘 pick the answer WORD
    ans.className = 'answers words' + (q.wchoices.length === 3 ? ' three' : '') + (q.pz === 'sign' ? ' signs' : '');   // ➗ mq-w4: big sign buttons
    ans.innerHTML = q.wchoices.map((c, i) => '<button class="ans word' + (th ? ' th' : '') + (c.w.length > 17 ? ' long' : '') + '" data-sound="none" data-w="' + i + '"' + (c.ok ? ' data-ok="1"' : '') + '><span class="k">' + (i + 1) + '</span>' + UI.esc(c.w) + '</button>').join('');
    ans.querySelectorAll('.ans').forEach(b => b.onclick = () => answer(Number(b.dataset.w), b, 'word'));
  } else if(G.way === 'type'){   // ⌨️ Math Quest's own number pad (never the phone keyboard) · ➗ mq-t2: + `.` `−` on 📝 Grade 5+
    ans.className = 'answers pad' + (q.padX ? ' x' : '');
    ans.innerHTML = '<div class="pad-disp" id="pad-disp" aria-live="polite"></div><button class="pk pk-del" data-sound="none" data-pk="del" title="Delete">⌫</button><button class="pk pk-ok" data-sound="none" data-pk="ok" title="Check (Enter)">✓</button>' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => '<button class="pk" data-sound="none" data-pk="' + d + '">' + d + '</button>').join('') + (q.padX ? '<button class="pk pk-x" data-sound="none" data-pk="dot" title="Decimal point (.)">.</button><button class="pk pk-x" data-sound="none" data-pk="neg" title="Minus sign (−)">−</button>' : '');
    ans.querySelectorAll('.pk').forEach(b => b.onclick = () => padKey(b.dataset.pk));
  } else {
    ans.className = 'answers' + (q.choices.length === 3 ? ' three' : '');
    ans.innerHTML = q.choices.map((v, i) => '<button class="ans" data-sound="none" data-v="' + v + '"><span class="k">' + (i + 1) + '</span>' + (q.test ? tN(v) : v.toLocaleString()) + '</button>').join('');
    ans.querySelectorAll('.ans').forEach(b => b.onclick = () => answer(Number(b.dataset.v), b));
  }
  $('hint-btn').textContent = '💡 ' + tx('Hint', 'ตัวช่วย') + ' (' + G.hints + ')'; $('hint-btn').disabled = G.hints <= 0 || (G.way === 'type' && !q.wordAns && String(q.ask).length <= hintPre(q.ask).length);
  card.classList.remove('pop', 'shake'); void card.offsetWidth; card.classList.add('pop');
  fitStory();   // ➗ mq-w2
  if(q.story || q.trick || q.test) setTimeout(() => { if(G && G.q === q) fitStory(); }, 160);   // ➗ mq-t2: fit again once fonts / layout settle (a late reflow left a 3px spill on a tablet)
}
// Picture numbers for little ones: groups to count, take-away with ✖, arrays for times, baskets for sharing, a number line.
function visHtml(v){
  const many = n => n <= 4 ? 'clamp(2.4rem,9vmin,5rem)' : n <= 8 ? 'clamp(2rem,7vmin,4rem)' : n <= 12 ? 'clamp(1.7rem,5.2vmin,3rem)' : n <= 24 ? 'clamp(1.3rem,3.8vmin,2.2rem)' : 'clamp(1rem,2.8vmin,1.6rem)';
  const items = (ch, n, cls) => Array.from({length: n}, (_, i) => '<span class="' + (cls ? cls(i) : '') + '" style="animation-delay:' + (i * 0.04).toFixed(2) + 's">' + ch + '</span>').join('');
  if(v.type === 'groups') return '<div class="grp" style="--vs:' + many(Math.max(v.a, v.b)) + '">' + items(v.it, v.a) + '</div><span class="op">+</span><div class="grp" style="--vs:' + many(Math.max(v.a, v.b)) + '">' + items(v.it2, v.b) + '</div>';
  if(v.type === 'takeaway') return '<div class="grp" style="--vs:' + many(v.a) + '">' + items(v.it, v.a, i => i >= v.a - v.b ? 'gone' : '') + '</div>';
  if(v.type === 'array') return '<div class="arr" style="--vs:' + many(v.rows * v.cols) + ';grid-template-columns:repeat(' + v.cols + ',auto)">' + items(v.it, v.rows * v.cols) + '</div>';
  if(v.type === 'share') return '<div class="grp" style="--vs:' + many(v.total) + '">' + items(v.it, v.total) + '</div><div class="baskets">' + Array.from({length: v.baskets}, () => '<div class="basket">🧺<b>?</b></div>').join('') + '</div>';
  if(v.type === 'line') return lineSvg(v);
  return '';
}
function lineSvg(v){
  const max = v.max, W = 640, pad = 22, x = n => pad + (W - pad * 2) * n / max, to = v.from + v.step;
  let s = '<svg class="nline" viewBox="0 0 ' + W + ' 70" aria-hidden="true"><line x1="' + pad + '" y1="50" x2="' + (W - pad) + '" y2="50" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>';
  for(let n = 0; n <= max; n++){ const big = n % 5 === 0; s += '<line x1="' + x(n) + '" y1="' + (big ? 42 : 45) + '" x2="' + x(n) + '" y2="' + (big ? 58 : 55) + '" stroke="currentColor" stroke-width="' + (big ? 2.5 : 1.5) + '"/>'; if(big || max <= 10) s += '<text x="' + x(n) + '" y="69" text-anchor="middle">' + n + '</text>'; }
  const dir = v.step >= 0 ? 1 : -1;
  for(let k = 0; k < Math.abs(v.step); k++){ const a = v.from + k * dir, b = a + dir, mx = (x(a) + x(b)) / 2; s += '<path d="M' + x(a) + ' 44 Q' + mx + ' ' + 14 + ' ' + x(b) + ' 44" fill="none" stroke="' + (dir > 0 ? '#4CB963' : '#E5484D') + '" stroke-width="2.5" stroke-dasharray="4 3"/>'; }
  s += '<circle cx="' + x(v.from) + '" cy="50" r="7" fill="#3D7DD8"/><text x="' + x(v.from) + '" y="34" text-anchor="middle">start</text>';
  return s + '</svg>';
}
// ⌨️ the number pad (➗ mq-w1): digits · ⌫ · ✓ (Enter) — the answer is checked only on ✓
function padKey(k){
  if(!G || G.locked || G.over || G.paused || G.way !== 'type' || !G.q || G.q.wordAns) return;
  const d = $('pad-disp'), max = Math.max(4, String(G.q.ask).length + 2), len = G.typed.replace('-', '').length;
  if(k === 'del') G.typed = G.typed.slice(0, -1);
  else if(k === 'ok'){ if(!/[0-9]/.test(G.typed)){ UISound.play('error'); return; } answer(Number(G.typed), d, 'pad'); return; }
  else if(/^[0-9]$/.test(k) && len < max) G.typed = (G.typed === '0' ? '' : G.typed === '-0' ? '-' : G.typed) + k;
  else if(k === 'dot' && G.q.padX){ if(G.typed.includes('.') || len >= max){ UISound.play('error'); return; } G.typed = (/[0-9]$/.test(G.typed) ? G.typed : G.typed + '0') + '.'; }   // ➗ mq-t2
  else if(k === 'neg' && G.q.padX) G.typed = G.typed[0] === '-' ? G.typed.slice(1) : '-' + G.typed;
  UISound.play('tap'); if(d) d.textContent = G.typed.replace('-', '−');
}
function hintPre(v){ const s = String(v); return s[0] === '-' ? s.slice(0, 2) : s[0]; }   // ➗ mq-t2: the hint types "−8", not just "−"
function rightBtn(b, q){ return b.dataset.ok === '1' || (b.dataset.v !== undefined && b.dataset.w === undefined && Number(b.dataset.v) === q.ask); }
function modeMult(){ return (G && MODE_MULT[G.mode]) || 1; }
function answer(v, btn, how){
  if(!G || G.locked || G.over || G.paused) return;
  G.locked = true; const q = G.q, typed = how === 'pad', ok = how === 'word' ? !!(q.wchoices[v] && q.wchoices[v].ok) : q.test ? Math.abs(v - q.ask) < 1e-9 : v === q.ask;   // ➗ mq-w1: word / pad answers
  G.answers.push({q: q.trick ? q.id : q.a + SERIES[q.op].sym + q.b, ok});
  if(typed){ const d = $('pad-disp'); if(d){ d.classList.add(ok ? 'right' : 'wrong'); if(!ok) d.textContent = G.typed.replace('-', '−') + ' ✗ ' + (q.test ? q.right : q.ask.toLocaleString()); } }
  else $('answers').querySelectorAll('.ans').forEach(b => { if(rightBtn(b, q)) b.classList.add(ok ? 'right' : 'show'); });
  const mark = $('qmark');
  if(ok){
    G.right++; if(!G.usedHint) G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak);
    if(G.mode === 'worden') G.wordRight++; if(G.mode === 'wordth') G.thaiRight++; if(typed) G.typedRight++;   // ➗ mq-w1 feats
    if(q.test){ if(q.pz) G[q.pz + 'Right'] = (G[q.pz + 'Right'] || 0) + 1; else G.testRight++; const hl = $('hintline'); hl.textContent = '🪜 ' + q.how; hl.classList.add('steps', 'trickok'); hl.classList.remove('hidden'); fitStory(); }   // ➗ mq-t1 📝
    if(q.trick){ G.trickRight++; const hl = $('hintline'); hl.textContent = (q.lang === 'th' ? '🕵️ จับได้! ' : '🕵️ You spotted the trick! ') + q.why; hl.classList.add('steps', 'trickok'); hl.classList.remove('hidden'); fitStory(); }   // ➗ mq-w3 🤔
    if(q.listen){ G.listenRight = (G.listenRight || 0) + 1; const hl = $('hintline'); hl.textContent = '🎧 ' + explain(q); hl.classList.remove('hidden'); }   // ➗ mq-w5
    if(q.story){ G.storyRight++; const hl = $('hintline'); hl.textContent = stepsText(q); hl.classList.add('steps'); hl.classList.remove('hidden'); fitStory(); }   // ➗ mq-w2 🪜
    const pts = Math.round((100 * (G.lvl + 1) + Math.min(G.streak, 20) * 10 * (G.lvl + 1)) * (G.L.hardcore ? 3 : 1) * (G.usedHint ? 0.5 : 1) * seriesMult() * modeMult() * (typed ? TYPED_MULT : 1));
    G.score += pts; if(btn){ floatText(btn, '+' + pts); sparkle(btn); }
    if(mark){ mark.textContent = shownAns(q); mark.classList.add('got'); }
    UISound.play('success'); mascot('happy'); cheerSay(q.trick || [5, 10, 15].includes(G.streak) ? 'big' : 'goal', 'right'); /* 📣 cs-4b */
    if([3, 5, 10, 15].includes(G.streak)){ showBanner(tx('🔥 ' + G.streak + ' in a row!', '🔥 ถูกติดกัน ' + G.streak + ' ข้อ!'), 'gold'); if(G.streak >= 5) UISound.play('unlock'); }
    else if(voiceOn) speak(pick(q.lang === 'th' ? RIGHT_TH : RIGHT_WORDS), q.lang);
  } else {
    G.wrong++; G.streak = 0; if(btn && !typed) btn.classList.add('wrong'); UISound.play('error'); mascot('sad'); cheerSay('miss', 'wrong'); /* 📣 cs-4b */
    const card = $('qcard'); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    if(mark) mark.textContent = shownAns(q);
    const word = q.wordAns || q.form === 'w2n', hl = $('hintline');
    hl.textContent = (q.lang === 'th' ? 'คำตอบคือ ' : 'The answer is ') + (word ? '“' + wordsOf(q.ask, q.lang) + '” (' + q.ask.toLocaleString() + ')' : q.ask.toLocaleString()) + ' — ' + explain(q); hl.classList.remove('hidden');
    if(q.story){ hl.classList.add('steps'); fitStory(); }   // ➗ mq-w2
    if(q.test){ hl.textContent = (q.lang === 'th' ? 'คำตอบคือ ' : 'The answer is ') + q.right + '  🪜 ' + q.how; hl.classList.add('steps', 'trickl'); fitStory(); }   // ➗ mq-t1 📝
    if(q.trick){ const c = how === 'word' ? q.wchoices[v] : null, got = !!(c && c.trap), th = q.lang === 'th';   // ➗ mq-w3: 😜 Gotcha + 🤔 trap line + ✅ why
      hl.textContent = (got ? (th ? '😜 โดนหลอกแล้ว! ' : '😜 Gotcha! ') : '') + '🤔 ' + q.trapLine + '  ✅ ' + (th ? 'คำตอบคือ “' : 'The answer is “') + q.right + '” — ' + q.why;
      hl.classList.add('steps', 'trickl'); fitStory(); if(got) showBanner(th ? '😜 โดนหลอกแล้ว!' : '😜 Gotcha!'); }
    if(voiceOn) speak(q.trick || q.test ? (q.lang === 'th' ? 'คำตอบคือ ' : 'The answer is ') + q.right : q.lang === 'th' ? 'คำตอบคือ ' + wordsTH(q.ask) : 'The answer is ' + q.ask, q.lang);
    if(G.L.hardcore){ hud(); setTimeout(() => finishGame('hardcore'), q.trick || q.test ? 3400 : q.story ? 2600 : 1300); return; }
  }
  G.qi++; hud();
  setTimeout(() => { if(!G || G.over) return; if(G.qi >= G.L.qs) finishGame('done'); else nextQ(); }, ok ? (G.challenge ? 350 : q.trick || q.test ? 2400 : q.story ? 1800 : 650) : (G.challenge ? 900 : q.trick || q.test ? 3800 : q.story ? 2800 : 1500));   // ➗ mq-w2: time to read the 🪜 steps
}
function explain(q){
  if(q.steps) return stepsText(q);   // ➗ mq-w2 🪜
  const s = SERIES[q.op].sym;
  return q.a.toLocaleString() + ' ' + s + ' ' + q.b.toLocaleString() + ' = ' + q.ans.toLocaleString();
}
function useHint(){
  if(!G || G.locked || G.over || G.hints <= 0 || G.L.hardcore) return;
  if(G.q.listen && !G.q.shown){ G.q.shown = true; $('word').textContent = listenText(G.q); $('word').classList.remove('hidden'); G.hints--; G.usedHint = true;   // ➗ mq-w5 💡 = see the sum (half points)
    $('hint-btn').textContent = '💡 ' + tx('Hint', 'ตัวช่วย') + ' (' + G.hints + ')'; $('hint-btn').disabled = G.hints <= 0; showBanner(tx('💡 Here is the sum (half points for this one)', '💡 นี่คือโจทย์ (ข้อนี้ได้คะแนนครึ่งเดียว)')); fitStory(); return; }
  if(G.way === 'type' && !G.q.wordAns){   // ➗ mq-w1 ⌨️: the hint types the first digit (half points)
    const s = String(G.q.ask), f = hintPre(G.q.ask); if(s.length <= f.length || G.typed) return;
    G.typed = f; const d = $('pad-disp'); if(d) d.textContent = G.typed.replace('-', '−'); G.hints--; G.usedHint = true;
    $('hint-btn').textContent = '💡 ' + tx('Hint', 'ตัวช่วย') + ' (' + G.hints + ')'; $('hint-btn').disabled = true;
    showBanner(tx('💡 It starts with ' + f.replace('-', '−') + ' (half points for this one)', '💡 ขึ้นต้นด้วย ' + f.replace('-', '−') + ' (ข้อนี้ได้คะแนนครึ่งเดียว)')); return; }
  const wrong = [...$('answers').querySelectorAll('.ans:not(.off)')].filter(b => !rightBtn(b, G.q));
  if(wrong.length <= 1) return;
  pick(wrong).classList.add('off'); G.hints--; G.usedHint = true;
  $('hint-btn').textContent = '💡 ' + tx('Hint', 'ตัวช่วย') + ' (' + G.hints + ')'; $('hint-btn').disabled = G.hints <= 0;
  showBanner(tx('💡 One wrong answer is gone (half points for this one)', '💡 ตัดคำตอบผิดออกแล้ว 1 ข้อ (ข้อนี้ได้คะแนนครึ่งเดียว)'));
}
function sayQ(){ if(G && G.q && G.q.listen){ if(G.L.hardcore && (G.q.plays || 0) >= 2){ UISound.play('error'); showBanner(tx('💀 Only one replay on Hardcore', '💀 สุดโหดฟังซ้ำได้ครั้งเดียว')); return; } G.q.plays = (G.q.plays || 0) + 1; }   // ➗ mq-w5
  if(G && G.q){ if(G.q.lang === 'th') sayTH(G.q.say || (G.q.story || G.q.trick ? G.q.word : thaiSayText(G.q))); else say(G.q.say || sayText(G.q)); } }   // ➗ mq-w2: 📜 Thai stories in the Thai voice   // ➗ mq-w1: Thai sums in the Thai voice
function toggleVoice(){ voiceOn = !voiceOn; savePrefs(); paintVoice(); if(voiceOn) sayQ(); else try{ speechSynthesis.cancel(); }catch(e){} }
function mascot(kind){ const m = $('mascot'); m.classList.remove('happy', 'sad'); void m.offsetWidth; m.classList.add(kind); }
function tick(){
  if(!G || G.over || G.paused) return;
  hud();
  if(timeLeft() <= 0) finishGame('time');
}
let hudLow = false;
function hud(){
  if(!G) return;
  const left = timeLeft(), frac = left / G.limit;
  BAR.score(G.score.toLocaleString());
  BAR.count('streak', '🔥', G.streak, 'Streak', G.streak >= 3);
  if(G.challenge){ BAR.count('q', '✅', G.right, 'Right'); BAR.miss(G.wrong); } else BAR.count('q', '❓', Math.min(G.qi + 1, G.L.qs) + '/' + G.L.qs, 'Question');
  BAR.time(fmt(left), left < 10000);
  $('timefill').style.width = (frac * 100).toFixed(1) + '%'; $('timebar').classList.toggle('low', frac < 0.2);
  if(left < 10000 && !hudLow){ hudLow = true; showBanner(tx('⏱ 10 seconds left!', '⏱ เหลือ 10 วินาที!'), 'bad'); cheerSay('close', 'time'); /* 📣 cs-4b */ } if(left >= 10000) hudLow = false;
  if(lockHandle){ const l = lockHandle.remainingMs(); BAR.left(l, l < 120000); }
}
function pauseGame(){ if(G && !G.paused && !G.over){ G.paused = true; G.pausedAt = performance.now(); } }
function resume(){ if(G && G.paused && !G.over){ G.pausedTotal += performance.now() - G.pausedAt; G.paused = false; } }
function leavePlay(){
  if(!G || G.over){ backToMenu(); return; }
  pauseGame();
  UI.confirm({icon: '◀', title: 'Leave this round?', body: 'This round will not be saved.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(ok) backToMenu(); else resume(); });
}
function backToMenu(){ if(window.Cheer) Cheer.unmount(); clearInterval(timerId); try{ speechSynthesis.cancel(); }catch(e){} G = null; hideResult(); renderMenu(); showScreen('menu'); }
document.addEventListener('keydown', e => {
  if(!G || G.over || $('scr-play').classList.contains('hidden')) return;
  if(G.way === 'type' && G.q && !G.q.wordAns){   // ➗ mq-w1 ⌨️
    if(/^[0-9]$/.test(e.key)){ padKey(e.key); e.preventDefault(); return; }
    if(e.key === 'Backspace'){ padKey('del'); e.preventDefault(); return; }
    if((e.key === '.' || e.key === ',') && G.q && G.q.padX){ padKey('dot'); e.preventDefault(); return; }   // ➗ mq-t2
    if((e.key === '-' || e.key === '−') && G.q && G.q.padX){ padKey('neg'); e.preventDefault(); return; }
    if(e.key === 'Enter'){ padKey('ok'); e.preventDefault(); return; }
  }
  const n = Number(e.key); if(n >= 1 && n <= 4){ const b = $('answers').querySelectorAll('.ans')[n - 1]; if(b && !b.classList.contains('off')){ if(b.dataset.w !== undefined) answer(Number(b.dataset.w), b, 'word'); else answer(Number(b.dataset.v), b); } e.preventDefault(); }
  if(e.key === 'v' || e.key === 'V') sayQ();
  if(e.key === 'h' || e.key === 'H') useHint();
});

/* ================= FINISH ================= */
function starsFor(acc, frac){ return acc >= 0.95 && frac >= 0.3 ? 3 : acc >= 0.8 ? 2 : 1; }
function finishGame(why){
  if(!G || G.over) return;
  G.over = true; clearInterval(timerId);
  if(G.challenge) return challengeOver();
  const g = G, L = g.L, secs = Math.max(1, Math.round(Math.min(elapsed(), g.limit) / 1000)), asked = g.right + g.wrong;
  const acc = asked ? g.right / L.qs : 0, allDone = g.qi >= L.qs;
  const cleared = why !== 'hardcore' && allDone && (L.hardcore ? g.wrong === 0 : acc >= 0.6);
  const bonus = cleared ? Math.round(Math.round(timeLeft() / 1000) * 10 * (g.lvl + 1) * (L.hardcore ? 3 : 1) * seriesMult() * modeMult()) : 0;   // ➗ mq-w1: × mode
  g.score += bonus;
  const stars = cleared ? starsFor(acc, timeLeft() / g.limit) : 0;
  const stats = {correct: g.right, bestStreak: g.bestStreak, perfect: cleared && g.wrong === 0 ? 1 : 0, rounds: 1};
  if(g.wordRight) stats.wordRight = g.wordRight; if(g.thaiRight) stats.thaiRight = g.thaiRight; if(g.typedRight) stats.typedRight = g.typedRight;   // ➗ mq-w1
  if(g.storyRight) stats.storyRight = g.storyRight;   // ➗ mq-w2
  if(g.trickRight) stats.trickRight = g.trickRight;   // ➗ mq-w3
  if(g.testRight) stats.testRight = g.testRight;   // ➗ mq-t1
  if(g.listenRight) stats.listenRight = g.listenRight;   // ➗ mq-w5
  ['signRight', 'fixRight', 'clockRight'].forEach(k => { if(g[k]) stats[k] = g[k]; });   // ➗ mq-w4
  mqRemember(g);
  if(g.score > 0 || cleared) saveWin(S.player, g.lvl, {timeSec: secs, stars, score: g.score, theme: g.world + ':' + g.series + ':' + g.mode, cleared, stats});
  const W = WORLDS[g.world];
  cheerEnd(cleared); /* 📣 cs-4b */
  if(cleared){ const pr = pick(PRAISE); party('🎉 ' + pr + ', ' + S.player + '!'); if(modeOf(g.mode).lang === 'th') sayTH('เก่งมาก ' + S.player + '!'); else say(pr + ', ' + S.player + '!'); confetti(['🧮', '⭐', '🎉', W.icon, SERIES[g.series].icon, '💯'], 40); UISound.play('success'); }
  else { UISound.play('pop'); say(why === 'time' ? 'Time is up! Good try!' : why === 'hardcore' ? 'Hardcore over. Try again!' : 'Good try! Let\'s practise.'); }
  setTimeout(() => {
    if(G !== g) return;
    const title = cleared ? (g.wrong === 0 ? 'Perfect round!' : 'Level passed!') : why === 'time' ? 'Time\'s up!' : why === 'hardcore' ? '💀 Hardcore over!' : 'So close!';
    const next = cleared && g.lvl < 5;
    GF.result({wrap: $('result'), card: $('result-card'), win: cleared, icon: cleared ? (g.wrong === 0 ? '💯' : '🏆') : why === 'hardcore' ? '💀' : W.mascot, title,   /* 🧱 b3w6c: the shared 🏁 card */
      sub: (why === 'hardcore' ? '💀 Hardcore ends on the first mistake — try again! ' : '') + (!cleared ? (why === 'time' ? '⏱ Answer a little quicker — the time bonus is big! ' : !allDone ? '' : '🎯 Get ' + Math.ceil(L.qs * 0.6) + ' right to pass. ') + TIPS[g.series] : '') + (g.score > 0 || cleared ? '' : ' Not saved — answer some questions to get a score.'),
      stars: cleared ? stars : null, score: g.score,
      stats: [['✅', g.right + ' / ' + L.qs], ['🔥', 'best ' + g.bestStreak], ['⏱', fmt(secs * 1000)]].concat(bonus ? [['⚡', 'time bonus ' + bonus.toLocaleString()]] : [], L.hardcore ? [['💀', '×3']] : [],
        isWordMode(g.mode) || isStoryMode(g.mode) || isTrickMode(g.mode) || isTestMode(g.mode) ? [[modeOf(g.mode).icon, modeOf(g.mode).name + ' ×' + MODE_MULT[g.mode]]] : [], g.typedRight ? [['⌨️', 'typed ' + g.typedRight + ' ×' + TYPED_MULT]] : []),
      save: g.score > 0 || cleared ? 'Saving your score…' : null, buddy: {name: S.player, av: myAvatar(S.player)}, confetti: false,
      levels: () => backToMenu(), levelsText: '🎚️ Levels', again: () => startGame(g.lvl), againText: '🔁 Play again',
      next: next ? () => { const p = progressOf(S.player); p.unlocked = Math.max(p.unlocked, g.lvl + 1); startGame(g.lvl + 1); } : null, nextText: g.lvl === 4 ? '💀 Try Hardcore ▶' : 'Next level ▶'});
    [['btn-levels', 'b-menu'], ['btn-again', 'b-again'], ['btn-next', 'b-next']].forEach(([x, y]) => { const e = $(x); if(e) e.id = y; });   // the old ids (tests, cheer)
    cheerFaces();   /* 📣 cs-4b: the crowd's faces on the card */
  }, cleared ? 1500 : 800);
}
// ⏱️ Minute Challenge result: ✅ right, ❌ mistakes, accuracy; best kept on this device; feats sent to the server.
function challengeOver(){
  const g = G, score = Math.max(0, g.score - g.wrong * 50), acc = g.right + g.wrong ? Math.round(g.right / (g.right + g.wrong) * 100) : 0;
  const old = challengeBest(), best = !old || g.right > old.right || (g.right === old.right && score > old.score);
  if(best) try { localStorage.setItem(challengeKey(), JSON.stringify({right: g.right, wrong: g.wrong, score: score})); } catch(e){}
  if(S.player && g.right) google.script.run.withFailureHandler(() => {}).saveFeats(S.player, 'math-quest', {sprintBest: g.right, sprintRounds: 1, correct: g.right, bestStreak: g.bestStreak});
  cheerEnd(!!(best && g.right)); /* 📣 cs-4b */
  if(best && g.right){ party('⏱️ New best: ' + g.right + ' right!'); confetti(['⏱️', '⭐', '🧮', '🎉'], 30); UISound.play('success'); say('New best! ' + g.right + ' right!'); } else { UISound.play('pop'); say(g.right + ' right! Good try!'); }
  setTimeout(() => {
    if(G !== g) return;
    GF.result({wrap: $('result'), card: $('result-card'), win: best && g.right ? true : null, icon: '⏱️', title: best ? 'New best!' : 'Time\'s up!',   /* 🧱 b3w6c: the shared 🏁 card */
      sub: (old && !best ? 'Your best is ✅ ' + old.right + ' — ' : '') + 'Mistakes cost 50 points each, so think fast but carefully! ⏱️ Best results are kept on this device.',
      score, stats: [['✅', g.right + ' right'], ['❌', g.wrong + ' mistake' + (g.wrong === 1 ? '' : 's')], ['🎯', acc + '%'], ['🔥', 'best ' + g.bestStreak]],
      buddy: {name: S.player, av: myAvatar(S.player)}, confetti: false, levels: () => backToMenu(), levelsText: '🎚️ Levels', again: () => startGame('c'), againText: '🔁 Try again'});
    [['btn-levels', 'b-menu'], ['btn-again', 'b-again']].forEach(([x, y]) => { const e = $(x); if(e) e.id = y; });
    cheerFaces();
  }, 700);
}
function party(text){ const p = document.createElement('div'); p.className = 'praise'; p.textContent = text; document.body.appendChild(p); setTimeout(() => p.remove(), 1600); }
function sparkle(el){ const r = el.getBoundingClientRect(); for(let k = 0; k < 7; k++){ const s = document.createElement('div'); s.className = 'spark'; s.textContent = pick(['✨', '⭐', '💫']); const a = Math.random() * 6.28, d = 40 + Math.random() * 40; s.style.cssText = 'left:' + (r.left + r.width / 2) + 'px;top:' + (r.top + r.height / 2) + 'px;--dx:' + Math.cos(a) * d + 'px;--dy:' + Math.sin(a) * d + 'px'; document.body.appendChild(s); setTimeout(() => s.remove(), 850); } }
function floatText(el, text){ const r = el.getBoundingClientRect(), s = document.createElement('div'); s.className = 'float'; s.textContent = text; s.style.cssText = 'left:' + (r.left + r.width / 2 - 20) + 'px;top:' + (r.top - 6) + 'px'; document.body.appendChild(s); setTimeout(() => s.remove(), 950); }
let bannerTimer = 0;
function showBanner(text, kind){ const b = $('banner'), top = !!(G && G.q && (G.q.story || G.q.trick || G.q.test)), home = top ? document.body : $('qcard');   // ➗ mq-t2
  if(home && b.parentNode !== home) home.insertBefore(b, home.firstChild); b.classList.toggle('top', top); b.textContent = text; b.classList.toggle('gold', kind === 'gold'); b.classList.toggle('bad', kind === 'bad'); b.classList.add('on'); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('on'), 1900); }

/* ================= SAVE ================= */
const PENDING_KEY = 'sp_mathquest_pending';
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function flushPending(){ const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))).saveLevelResult(GAME_ID, w.name, w.lvl, w.extra)); }
function putNote(html){ const put = () => { const n = $('save-note'); if(n) n.innerHTML = html; return !!n; }; if(!put()) setTimeout(put, 1700); }
function saveWin(name, lvlIdx, extra, tries){
  tries = tries || 0;
  const p = S.progress[name] || (S.progress[name] = {unlocked: 0, tokens: [], best: []});
  if(extra.cleared) p.unlocked = Math.max(p.unlocked, lvlIdx + 1);
  google.script.run.withSuccessHandler(res => {
      const best = (p.best || []).slice(); if(res.best) best[lvlIdx] = res.best;
      S.progress[name] = {unlocked: res.unlocked, tokens: res.tokens, best}; flushPending(); putNote(saveText(res));
    }).withFailureHandler(err => {
      if(tries < 1){ setTimeout(() => saveWin(name, lvlIdx, extra, tries + 1), 1200); return; }
      writePending(readPending().concat([{name, lvl: lvlIdx, extra}])); putNote('⚠️ Could not save yet — it will be sent again next time.');
    }).saveLevelResult(GAME_ID, name, lvlIdx, extra);
}
function saveText(res){
  let h = res.newBadge ? '<span class="new-badge">🏅 New badge: ' + UI.esc(res.newBadge) + '</span>' : res.newHighScore && !res.firstTime ? '🎉 New high score!' : res.best && res.best.score ? 'Your best: 🏆 ' + Number(res.best.score).toLocaleString() : '✅ Score saved';
  const fe = res.feats; if(fe){ (fe.newTitles || []).forEach(t => { h += '<br><span class="title-new">🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name) + '</span>'; }); (fe.newBadges || []).forEach(b => { h += '<br><span class="feat-new">' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName + '</span>'; }); }
  return h;
}
function countUp(el, to, ms){ if(!el) return; const t0 = performance.now(); (function tick(now){ const p = Math.max(0, Math.min(1, (now - t0) / ms)); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString(); if(p < 1) requestAnimationFrame(tick); })(t0); }
/* 📣 CHEERSQUAD (cs-4b) START — the crowd beside the play (CheerSquad.html, 📣 Cheer chat). Don't remove: the Cheer chat re-applies it. */
// solo: you = side 0, the 😈 rival = side 1. Fans stand only where the bar, the question / board and the controls leave room.
function cheerTaken(){ return Array.from(document.querySelectorAll('#gbar, .top-btn, #timebar, #qcard, #scr-play .side-col')); }
function cheerHard(){ return cheerTaken(); }
function cheerMount(){
  if(!window.Cheer) return; Cheer.unmount(); if(!(G)) return; const box = $('scr-play'); if(!box) return;
  Cheer.mount(box, {game: 'mathquest', players: [{name: S.player, side: 0, human: true}, {name: 'Rival', side: 1, human: false}], me: {name: S.player}, family: (S.players || []).map(p => p.Name), avatars: S.avatars || {}, mode: 'overlay',
    zones: () => Cheer.freeZones(box, cheerTaken), avoid: cheerHard,
    clear: b => { const B = box.getBoundingClientRect(); return !cheerHard().some(e => { const r = e.getBoundingClientRect(); if(r.width < 2 || r.height < 2) return false; const l = r.left - B.left, t = r.top - B.top; return b.r > l - 3 && b.l < l + r.width + 3 && b.b > t - 3 && b.t < t + r.height + 3; }); }});
}
// small wins / misses get a 1.2 s breather so quick answers aren't a wall of cheers; big ones and the ends always play
function cheerSay(kind, why){ if(!kind || !window.Cheer || !Cheer.active() || !G) return; const now = performance.now();
  if((kind === 'goal' || kind === 'miss') && (G.cheerAt || 0) > now - 1200) return; if(kind === 'big' && (G.cheerBig || 0) > now - 900) return;
  if(kind === 'goal' || kind === 'miss') G.cheerAt = now; if(kind === 'big') G.cheerBig = now; Cheer.react(kind, {side: 0}); }
function cheerEnd(won){ if(window.Cheer && Cheer.active()) Cheer.react(won ? 'win' : 'lose', {side: 0}); }
function cheerFaces(){ setTimeout(() => { const card = $('result-card'); if(!card || !window.Cheer || !Cheer.active() || card.querySelector('.cs-faces') || $('result').classList.contains('hidden')) return;
  const c = Cheer.faces(5, {h: 54}); if(!c) return; const cap = document.createElement('div'); cap.className = 'cs-faces-cap'; cap.textContent = '📣 Your cheer squad';
  const at = card.querySelector('.res-btns'); if(!at) return; at.parentNode.insertBefore(c, at); at.parentNode.insertBefore(cap, at); }, 900); }
/* 📣 CHEERSQUAD END */
function showResult(html){ $('result-card').innerHTML = html; $('result').classList.remove('hidden'); cheerFaces(); /* 📣 cs-4b */ }
function hideResult(){ $('result').classList.add('hidden'); }
function confetti(list, count){ for(let i = 0; i < (count || 24); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = pick(list); e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goGameroom(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }   // 🧭 p1b: ◀ = where you came from (Gameroom if we don't know)

/* ================= BOOT ================= */
function boot(){
  UI.loading('math-quest');
  google.script.run.withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {};
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      flushPending();
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)) choosePlayer(CURRENT_PLAYER); else { renderPlayers(); showScreen('player'); }
    }).withFailureHandler(() => { UI.loaded(); UI.toast('Could not load players — check the connection', 'err'); renderPlayers(); showScreen('player'); })
    .getLevelGameData(GAME_ID, CURRENT_PLAYER);
}
boot();
/* ✨ MODE SPOTLIGHT (modes-3): ?mode=<id> opens this game straight in that mode after the player pick · "✨ Also try" on the start page · started modes → UI.modeTried */
const MS_GAME = 'math-quest';
function msOpen(id){   // ➗ mq-w1: every live mode opens on the start page; ⏱️ Minute starts its race (or says why it's locked)
  const m = MODES.find(x => x.k === id); if(!m || m.soon) return;
  coverOff(); showScreen('menu');   /* 🧱 b3w6c: a mode link skips the cover */
  mode = id; savePrefs(); renderModes(); renderLevels();
  if(id !== 'minute') return; const c = document.querySelector('#scr-menu .lvl.challenge'); if(c){ if(c.scrollIntoView) c.scrollIntoView({block: 'center'}); c.click(); if(chosenLevel === 'c') startSetup(); }   /* 🧱 b3w6c: a tap only picks — ⏱️ still starts its race */
}
function msNow(){ return G && !G.over && G.mode ? G.mode : mode; }
function msWrap(fn, idOf){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ try{ const id = idOf.apply(this, arguments); if(id && UI.modeTried) UI.modeTried(S.player || CURRENT_PLAYER, MS_GAME, id); }catch(e){} return f.apply(this, arguments); }; }
function msAfter(fn, after){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; }
msWrap('startGame', x => x === 'c' ? 'minute' : (MODES.some(m => m.k === mode && !m.soon && m.k !== 'classic' && m.k !== 'minute') ? mode : ''));   // ➗ mq-w1
msAfter('choosePlayer', name => {
  if(!window.UI || !UI.modeLink) return;
  const id = UI.modeLink(MODE_LINK); if(id) msOpen(id);
  UI.alsoTry({game: MS_GAME, player: name, current: msNow, at: () => document.querySelector('#scr-menu .title'), open: msOpen});
});
/* ✨ END MODE SPOTLIGHT */
