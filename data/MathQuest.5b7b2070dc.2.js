
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
var NAV_INNER = {};   // 🧭 inner screens: their top button goes to the main screen
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
  {k: 'sign', g: 'numbers', icon: '❓', name: 'Missing sign', type: 'A sign-finding game', sub: SOON_EN, soon: true},
  {k: 'fix', g: 'numbers', icon: '🔍', name: 'Find the mistake', type: 'A maths detective game', sub: SOON_EN, soon: true},
  {k: 'clock', g: 'numbers', icon: '🕐', name: 'Clock maths', type: 'A time-telling game', sub: SOON_EN, soon: true},
  {k: 'worden', g: 'english', icon: '🔤', name: 'Word Sums', type: 'A reading maths game', sub: 'The sum is written in words', lang: 'en'},
  {k: 'storyen', g: 'english', icon: '📖', name: 'Story Problems', type: 'A real-life maths story', sub: SOON_EN, soon: true},
  {k: 'tricken', g: 'english', icon: '🤔', name: 'Trick Questions', type: 'A think-twice puzzle', sub: SOON_EN, soon: true},
  {k: 'listenen', g: 'english', icon: '🎧', name: 'Listen', type: 'A listening maths game', sub: SOON_EN, soon: true},
  {k: 'wordth', g: 'thai', icon: '🐘', name: 'เลขคำไทย', type: 'เกมอ่านโจทย์ภาษาไทย', sub: 'อ่านโจทย์เป็นคำ แล้วหาคำตอบ', lang: 'th'},
  {k: 'storyth', g: 'thai', icon: '📜', name: 'โจทย์ปัญหา', type: 'โจทย์เรื่องราวในชีวิตจริง', sub: SOON_TH, soon: true},
  {k: 'trickth', g: 'thai', icon: '🙃', name: 'คำถามหลอก', type: 'ปริศนาคิดสองรอบ', sub: SOON_TH, soon: true},
  {k: 'listenth', g: 'thai', icon: '👂', name: 'ฟังโจทย์', type: 'เกมฟังโจทย์เลข', sub: SOON_TH, soon: true}
];
const MODE_MULT = {classic: 1, minute: 1, worden: 1.1, wordth: 1.1};   // × on top of the series × (plan §3)
const TYPED_MULT = 1.25;                                                 // ⌨️ typed answers (plan §3b)
function modeOf(k){ return MODES.find(m => m.k === k) || MODES[0]; }
function isWordMode(k){ return k === 'worden' || k === 'wordth'; }
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
function shownAns(q){ return q.wordAns || q.form === 'w2n' ? wordsOf(q.ask, q.lang) : q.ask.toLocaleString(); }
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
  const op = series === 'mix' ? pick(lvl === 0 ? ['add', 'sub', 'add', 'sub', 'mul', 'div'] : OPS) : series;
  const q = makeNums(op, lvl, L);
  q.missing = ''; q.word = ''; q.vis = null;
  if(L.missing && Math.random() < L.missing){ q.missing = Math.random() < 0.5 ? 'a' : 'b'; }
  if(!q.missing && L.words && Math.random() < L.words){ q.word = storyText(q, W); }
  if(pictures(lvl, age) && !q.word && !q.missing) q.vis = visFor(q, W, lvl);
  q.ask = q.missing === 'a' ? q.a : q.missing === 'b' ? q.b : q.ans;   // the number the child has to find
  q.choices = choicesFor(q, L.choices);
  q.key = qKey(q);   // ➗ mq-w1: 🎲 recent-question memory
  return q;
}
function storyText(q, W){
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
let mode = 'classic', ansPick = 'auto', recentQ = {}, prefsTimer = 0;   // ➗ mq-w1: way to play · 👆/⌨️ · 🎲 last rounds' questions
function loadPrefs(){ mode = 'classic'; ansPick = 'auto'; recentQ = {};
  try{ const s = localStorage.getItem(store('series')); if(SERIES[s]) series = s; const w = localStorage.getItem(store('world')); if(WORLDS[w]) world = w; const v = localStorage.getItem(store('voice')); voiceOn = v ? v === '1' : young(S.age);
    const m = localStorage.getItem(store('mode')); if(m && MODES.some(x => x.k === m && !x.soon)) mode = m; const a = localStorage.getItem(store('ans')); if(/^(auto|choose|type)$/.test(a || '')) ansPick = a; }catch(e){ voiceOn = young(S.age); }
  // ➗ mq-w1: the player's picks follow the PLAYER to every device (Aowu 2026-11-14) — Settings MathQuest_<Name> wins over this device
  try{ const p = JSON.parse((S.settings || {})['MathQuest_' + S.player] || 'null');
    if(p && typeof p === 'object'){ if(MODES.some(x => x.k === p.mode && !x.soon)) mode = p.mode; if(/^(auto|choose|type)$/.test(p.ans || '')) ansPick = p.ans; if(SERIES[p.series]) series = p.series; if(WORLDS[p.world]) world = p.world; if(p.recent && typeof p.recent === 'object') recentQ = p.recent; } }catch(e){} }
function savePrefs(){ try{ localStorage.setItem(store('series'), series); localStorage.setItem(store('world'), world); localStorage.setItem(store('voice'), voiceOn ? '1' : '0'); localStorage.setItem(store('mode'), mode); localStorage.setItem(store('ans'), ansPick); }catch(e){}
  if(!S.player) return; const who = S.player, obj = {mode, ans: ansPick, series, world, recent: recentQ};
  S.settings['MathQuest_' + who] = JSON.stringify(obj);
  clearTimeout(prefsTimer); prefsTimer = setTimeout(() => { try{ google.script.run.withFailureHandler(() => {}).saveMathPrefs(who, obj); }catch(e){} }, 1200); }
function mqRemember(g){   // 🎲 keep this round's questions — the next 3 rounds of this mode + level skip them
  if(!g || g.challenge || !g.keys || !g.keys.length) return; const k = g.mode + ':' + g.lvl;
  recentQ[k] = (Array.isArray(recentQ[k]) ? recentQ[k] : []).concat([g.keys.slice(0, 30)]).slice(-3);
  const ks = Object.keys(recentQ); if(ks.length > 40) delete recentQ[ks[0]];
  savePrefs(); }
function myAvatar(name){ const a = (S.avatars || {})[name || S.player]; return a ? fixAv(a) : defaultAvatar(name || S.player || 'player'); }
window.feedbackContext = () => ({page: 'Math Quest', game: GAME_ID, level: G ? LEVELS[G.lvl].name + ' · ' + SERIES[G.series].name + ' · ' + WORLDS[G.world].name + ' · ' + modeOf(G.mode).name : modeOf(mode).name});
if(window.UI && UI.GAME_HELP) UI.GAME_HELP['math-quest'] = ['Answer maths questions in 5 worlds — with numbers, in English words (🔤 Word Sums) or in Thai words (🐘 เลขคำไทย).', 'Tap the answer — or ⌨️ type it on the number pad (from ⚡ Hard, ×1.25 points).', 'Try ⏱️ Minute Challenge: how many in 60 seconds?'];   // ➗ mq-w1: page copy until the UiKit lane moves it in

/* ================= MENUS ================= */
function showScreen(name){
  ['player', 'menu', 'play'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
  $('back-btn').classList.toggle('hidden', name === 'play'); UI.navScreen($('back-btn'), name, NAV_INNER);   // 🧭 p1b window.scrollTo(0, 0);
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
  loadPrefs(); $('who-name').textContent = name; if(window.Cheer){ Cheer.chip($('cheer-chip'), name); Cheer.langChip($('cheer-lang'), name); } /* 📣 cs-4b */ renderMenu(); showScreen('menu');
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
// The series + world rows: built once per menu visit, a tap only moves the highlight (no page jump).
function renderMenu(){
  renderModes(); renderAns();   // ➗ mq-w1
  $('series-list').innerHTML = SERIES_KEYS.map(k => '<button class="chip' + (k === series ? ' on' : '') + '" data-sound="pop" data-series="' + k + '"><span class="ic">' + SERIES[k].icon + '</span>' + SERIES[k].name + (SERIES[k].mult > 1 ? '<small class="mult">×' + SERIES[k].mult + '</small>' : '') + '</button>').join('');
  $('world-list').innerHTML = WORLD_KEYS.map(k => '<button class="chip' + (k === world ? ' on' : '') + '" data-sound="pop" data-world="' + k + '"><span class="ic">' + WORLDS[k].icon + '</span>' + WORLDS[k].name + '<small>' + WORLDS[k].sub + '</small></button>').join('');
  $('series-list').querySelectorAll('[data-series]').forEach(b => b.onclick = () => { series = b.dataset.series; savePrefs(); $('series-list').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); renderLevels(); });
  $('world-list').querySelectorAll('[data-world]').forEach(b => b.onclick = () => { world = b.dataset.world; savePrefs(); $('world-list').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); });
  renderLevels();
}
// ➗ mq-w1: 🗂️ the ways to play (UiKit mode cards); 🔜 cards say "coming soon" and change nothing
function renderModes(){
  UI.modeGroups($('mode-list'), MODE_GROUPS, MODES.map(m => Object.assign({}, m, {on: m.k === mode})), {
    onPick: k => { const m = modeOf(k);
      if(m.soon){ UISound.play('error'); UI.toast(m.g === 'thai' ? '🔜 ' + m.name + ' — เร็ว ๆ นี้!' : '🔜 ' + m.name + ' is coming soon!'); return 'stop'; }
      mode = k; savePrefs(); menuParts(); renderLevels(); return true; },
    next: () => $('lvl-head'), moreText: '👇 Pick a level below'});
  menuParts();
}
function menuParts(){
  const minute = mode === 'minute';
  ['series-head', 'series-list', 'ans-head', 'ans-list'].forEach(id => $(id).classList.toggle('hidden', minute));
  let n = 0; document.querySelectorAll('#scr-menu .section-head').forEach(h => { if(h.classList.contains('hidden')) return; const sn = h.querySelector('.sn'); if(sn) sn.textContent = (++n) + '.'; });
  $('lvl-head').querySelector('.lt').textContent = minute ? 'Start the race' : 'Pick a level';
}
function renderAns(){
  $('ans-list').innerHTML = ANS_WAYS.map(a => '<button class="chip ans-chip' + (a.k === ansPick ? ' on' : '') + '" data-sound="pop" data-ans="' + a.k + '"><span class="ic">' + a.icon + '</span>' + a.name + '<small>' + a.sub + '</small></button>').join('');
  $('ans-list').querySelectorAll('[data-ans]').forEach(b => b.onclick = () => { ansPick = b.dataset.ans; savePrefs(); $('ans-list').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); });
}
function rangeText(L){
  if(isWordMode(mode)) return wordRange(L);   // ➗ mq-w1
  if(series === 'mul') return L.tables ? '✖️ tables ' + L.tables.join(' ') + (L.big ? ' + big ones' : '') : '✖️ up to ' + L.mul[0] + ' × ' + L.mul[1] + (L.big ? ' + big ones' : '');
  if(series === 'div') return L.tables ? '➗ share by ' + L.tables.join(' ') : '➗ up to ' + (L.div[0] * L.div[1]) + ' ÷ ' + L.div[0];
  return SERIES[series].icon + ' up to ' + L.add;
}
function wordRange(L){ const th = mode === 'wordth', top = series === 'mul' || series === 'div' ? (L.tables ? 'tables' : (L.mul[0] * L.mul[1])) : L.add, n = typeof top === 'number' ? (th ? wordsTH(top) : wordsEN(top)) : (th ? 'สูตรคูณ' : 'times tables');
  return (th ? '🐘 คำไทย · ถึง ' : '🔤 in words · up to ') + n; }
function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">No score yet</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span>' + (b.timeSec ? '<span>⏱ ' + fmt(b.timeSec * 1000) + '</span>' : '') + '<span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }
function renderLevels(){
  const box = $('level-list'); box.innerHTML = ''; if(window.UI && UI.leaders) UI.leaders($('leaders'), 'math-quest', S.player); const p = progressOf(S.player), rec = AGE_START[S.age];
  if(mode !== 'minute') LEVELS.forEach((L, i) => {   // ➗ mq-w1: ⏱️ Minute = its own mode
    const open = canPlay(i), done = p.unlocked > i, b = document.createElement('button');
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (L.hardcore ? ' hardcore' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none');
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + L.emoji + '</div><div class="nm">' + L.name + '</div><div class="learn">' + rangeText(L) + '</div>' +
      '<div class="lives">' + L.qs + ' questions · ⏱ ' + fmt(L.time * 1000) + (L.hardcore ? ' · 💀 1 mistake' : '') + '</div>' +
      '<div class="sub">' + (L.hardcore && !open ? '🔒 Beat Extreme to open 💀 Hardcore' : L.blurb) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore' : i === 4 ? 'Pass Hard to unlock Extreme!' : 'Pass the level before to unlock it'); return; } startGame(i); };
    box.appendChild(b);
  });
  // ⏱️ Minute Challenge card (➗ mq-w1: only in the ⏱️ mode)
  if(mode !== 'minute') return;
  const cOpen = p.unlocked >= 3, cb = challengeBest(), c = document.createElement('button');
  c.className = 'pick lvl challenge' + (cOpen ? '' : ' locked'); c.setAttribute('data-sound', cOpen ? 'pop' : 'none');
  c.innerHTML = (cOpen ? '' : '<span class="badge">🔒</span>') + '<div class="big">⏱️</div><div class="nm">Minute Challenge</div><div class="learn">🔀 mixed · ✖️ ➗ tables 6 7 8 9 11 12</div>' +
    '<div class="lives">60 seconds · count ✅ and ❌</div><div class="sub">' + (cOpen ? CHALLENGE.blurb : '🔒 Pass Intermediate to open') + '</div>' +
    (cb ? '<div class="best"><span>✅ best ' + cb.right + '</span><span>🏆 ' + cb.score.toLocaleString() + '</span></div>' : '<div class="best none">No try yet</div>');
  c.onclick = () => { if(!cOpen){ UISound.play('error'); UI.toast('Pass Intermediate to open the ⏱️ Minute Challenge'); return; } startGame('c'); };
  box.appendChild(c);
}
function challengeKey(){ return 'sp_mathquest_challenge:' + (S.player || ''); }
function challengeBest(){ try { return JSON.parse(localStorage.getItem(challengeKey()) || 'null'); } catch(e){ return null; } }

/* ================= GAME ================= */
function startGame(lvl){ setTimeout(cheerMount, 0); /* 📣 cs-4b */
  clearInterval(timerId); hideResult();
  const ch = lvl === 'c', L = ch ? CHALLENGE : LEVELS[lvl], W = WORLDS[world];
  if(ch) lvl = 3;   // Hard-sized numbers for ➕ ➖
  const md = ch ? 'minute' : (MODES.some(m => m.k === mode && !m.soon && m.k !== 'minute') ? mode : 'classic');   // ➗ mq-w1
  const rk = md + ':' + lvl, recent = new Set([].concat(...(Array.isArray(recentQ[rk]) ? recentQ[rk] : [])));
  G = {mode: md, recent, keys: [], seen: new Set(), way: 'choose', typed: '', wordRight: 0, thaiRight: 0, typedRight: 0,
    lvl, L, series: ch ? 'mix' : series, world, challenge: ch, age: S.age, qi: 0, q: null, right: 0, wrong: 0, streak: 0, bestStreak: 0, score: 0, hints: L.hardcore ? 0 : 3, usedHint: false,
    locked: false, over: false, t0: performance.now(), paused: false, pausedAt: 0, pausedTotal: 0, limit: L.time * 1000, answers: []};
  const sp = $('scr-play'); sp.style.setProperty('--w1', W.c[0]); sp.style.setProperty('--w2', W.c[1]); sp.classList.toggle('dark', !!W.dark);
  BAR.level((isWordMode(md) ? modeOf(md).icon + ' ' : '') + L.emoji + ' ' + L.name + ' · ' + SERIES[G.series].icon + ' ' + W.icon, L.hardcore ? 'hc' : '');
  $('mascot').textContent = W.mascot; $('hint-btn').classList.toggle('hidden', !!L.hardcore || ch);
  paintVoice();
  showScreen('play');
  nextQ();
  timerId = setInterval(tick, 200);
  showBanner(ch ? '⏱️ 60 seconds — answer as many as you can!' : L.hardcore ? '💀 Hardcore: one wrong answer ends it — go!' : W.icon + ' ' + W.name + ' — ' + L.qs + ' questions, go!', L.hardcore ? 'bad' : 'gold');
}
function elapsed(){ return G ? performance.now() - G.t0 - G.pausedTotal - (G.paused ? performance.now() - G.pausedAt : 0) : 0; }
function timeLeft(){ return G ? Math.max(0, G.limit - elapsed()) : 0; }
function nextQ(){
  if(!G) return;
  let q = null, tries = 0;   // ➗ mq-w1 🎲: skip questions of this round and of the last 3 rounds (gives up after 14 tries — small levels)
  do { q = makeQ(G.series, G.lvl, G.world, G.age, G.L, G.mode); tries++; } while(tries < 14 && (G.seen.has(q.key) || G.recent.has(q.key)));
  G.seen.add(q.key); G.keys.push(q.key);
  G.q = q; G.way = ansWay(q, G.lvl, G.challenge); G.typed = ''; G.locked = false; G.usedHint = false;
  renderQ(); hud();
  if(voiceOn) setTimeout(() => { if(G && !G.over) sayQ(); }, 250);
}
function renderQ(){
  const q = G.q, card = $('qcard');
  $('qno').textContent = G.challenge ? '⏱️ Question ' + (G.qi + 1) : 'Question ' + (G.qi + 1) + ' of ' + G.L.qs;
  $('word').classList.toggle('hidden', !q.word); $('word').textContent = q.word;
  const vis = $('vis'); vis.innerHTML = q.vis ? visHtml(q.vis) : ''; vis.classList.toggle('hidden', !q.vis);
  const eq = $('eq'), th = q.lang === 'th', wordsEq = q.form === 'w2n' || q.form === 'w2w';   // ➗ mq-w1
  eq.className = 'eq' + (wordsEq ? ' eqw' : '') + (th ? ' th' : '') + (q.form === 't2w' ? ' tdig' : '');
  eq.innerHTML = wordsEq ? eqWordParts(q) : eqParts(q, q.form === 't2w' ? thaiDigits : null).join(' ');
  if(th) $('qno').textContent = 'ข้อ ' + (G.qi + 1) + ' จาก ' + G.L.qs;
  $('hintline').classList.add('hidden');
  const ans = $('answers');
  if(q.wordAns){   // 🔤 / 🐘 pick the answer WORD
    ans.className = 'answers words' + (q.wchoices.length === 3 ? ' three' : '');
    ans.innerHTML = q.wchoices.map((c, i) => '<button class="ans word' + (th ? ' th' : '') + (c.w.length > 17 ? ' long' : '') + '" data-sound="none" data-w="' + i + '"' + (c.ok ? ' data-ok="1"' : '') + '><span class="k">' + (i + 1) + '</span>' + UI.esc(c.w) + '</button>').join('');
    ans.querySelectorAll('.ans').forEach(b => b.onclick = () => answer(Number(b.dataset.w), b, 'word'));
  } else if(G.way === 'type'){   // ⌨️ Math Quest's own number pad (never the phone keyboard)
    ans.className = 'answers pad';
    ans.innerHTML = '<div class="pad-disp" id="pad-disp" aria-live="polite"></div><button class="pk pk-del" data-sound="none" data-pk="del" title="Delete">⌫</button><button class="pk pk-ok" data-sound="none" data-pk="ok" title="Check (Enter)">✓</button>' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => '<button class="pk" data-sound="none" data-pk="' + d + '">' + d + '</button>').join('');
    ans.querySelectorAll('.pk').forEach(b => b.onclick = () => padKey(b.dataset.pk));
  } else {
    ans.className = 'answers' + (q.choices.length === 3 ? ' three' : '');
    ans.innerHTML = q.choices.map((v, i) => '<button class="ans" data-sound="none" data-v="' + v + '"><span class="k">' + (i + 1) + '</span>' + v.toLocaleString() + '</button>').join('');
    ans.querySelectorAll('.ans').forEach(b => b.onclick = () => answer(Number(b.dataset.v), b));
  }
  $('hint-btn').textContent = '💡 Hint (' + G.hints + ')'; $('hint-btn').disabled = G.hints <= 0 || (G.way === 'type' && !q.wordAns && String(q.ask).length < 2);
  card.classList.remove('pop', 'shake'); void card.offsetWidth; card.classList.add('pop');
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
  const d = $('pad-disp'), max = String(G.q.ask).length + 2;
  if(k === 'del') G.typed = G.typed.slice(0, -1);
  else if(k === 'ok'){ if(!G.typed){ UISound.play('error'); return; } answer(Number(G.typed), d, 'pad'); return; }
  else if(/^[0-9]$/.test(k) && G.typed.length < max) G.typed = (G.typed === '0' ? '' : G.typed) + k;
  UISound.play('tap'); if(d) d.textContent = G.typed;
}
function rightBtn(b, q){ return b.dataset.ok === '1' || (b.dataset.v !== undefined && b.dataset.w === undefined && Number(b.dataset.v) === q.ask); }
function modeMult(){ return (G && MODE_MULT[G.mode]) || 1; }
function answer(v, btn, how){
  if(!G || G.locked || G.over || G.paused) return;
  G.locked = true; const q = G.q, typed = how === 'pad', ok = how === 'word' ? !!(q.wchoices[v] && q.wchoices[v].ok) : v === q.ask;   // ➗ mq-w1: word / pad answers
  G.answers.push({q: q.a + SERIES[q.op].sym + q.b, ok});
  if(typed){ const d = $('pad-disp'); if(d){ d.classList.add(ok ? 'right' : 'wrong'); if(!ok) d.textContent = G.typed + ' ✗ ' + q.ask.toLocaleString(); } }
  else $('answers').querySelectorAll('.ans').forEach(b => { if(rightBtn(b, q)) b.classList.add(ok ? 'right' : 'show'); });
  const mark = $('qmark');
  if(ok){
    G.right++; if(!G.usedHint) G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak);
    if(G.mode === 'worden') G.wordRight++; if(G.mode === 'wordth') G.thaiRight++; if(typed) G.typedRight++;   // ➗ mq-w1 feats
    const pts = Math.round((100 * (G.lvl + 1) + Math.min(G.streak, 20) * 10 * (G.lvl + 1)) * (G.L.hardcore ? 3 : 1) * (G.usedHint ? 0.5 : 1) * seriesMult() * modeMult() * (typed ? TYPED_MULT : 1));
    G.score += pts; if(btn){ floatText(btn, '+' + pts); sparkle(btn); }
    if(mark){ mark.textContent = shownAns(q); mark.classList.add('got'); }
    UISound.play('success'); mascot('happy'); cheerSay([5, 10, 15].includes(G.streak) ? 'big' : 'goal', 'right'); /* 📣 cs-4b */
    if([3, 5, 10, 15].includes(G.streak)){ showBanner('🔥 ' + G.streak + ' in a row!', 'gold'); if(G.streak >= 5) UISound.play('unlock'); }
    else if(voiceOn) speak(pick(q.lang === 'th' ? RIGHT_TH : RIGHT_WORDS), q.lang);
  } else {
    G.wrong++; G.streak = 0; if(btn && !typed) btn.classList.add('wrong'); UISound.play('error'); mascot('sad'); cheerSay('miss', 'wrong'); /* 📣 cs-4b */
    const card = $('qcard'); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    if(mark) mark.textContent = shownAns(q);
    const word = q.wordAns || q.form === 'w2n', hl = $('hintline');
    hl.textContent = (q.lang === 'th' ? 'คำตอบคือ ' : 'The answer is ') + (word ? '“' + wordsOf(q.ask, q.lang) + '” (' + q.ask.toLocaleString() + ')' : q.ask.toLocaleString()) + ' — ' + explain(q); hl.classList.remove('hidden');
    if(voiceOn) speak(q.lang === 'th' ? 'คำตอบคือ ' + wordsTH(q.ask) : 'The answer is ' + q.ask, q.lang);
    if(G.L.hardcore){ hud(); setTimeout(() => finishGame('hardcore'), 1300); return; }
  }
  G.qi++; hud();
  setTimeout(() => { if(!G || G.over) return; if(G.qi >= G.L.qs) finishGame('done'); else nextQ(); }, ok ? (G.challenge ? 350 : 650) : (G.challenge ? 900 : 1500));
}
function explain(q){
  const s = SERIES[q.op].sym;
  return q.a.toLocaleString() + ' ' + s + ' ' + q.b.toLocaleString() + ' = ' + q.ans.toLocaleString();
}
function useHint(){
  if(!G || G.locked || G.over || G.hints <= 0 || G.L.hardcore) return;
  if(G.way === 'type' && !G.q.wordAns){   // ➗ mq-w1 ⌨️: the hint types the first digit (half points)
    const s = String(G.q.ask); if(s.length < 2 || G.typed) return;
    G.typed = s[0]; const d = $('pad-disp'); if(d) d.textContent = G.typed; G.hints--; G.usedHint = true;
    $('hint-btn').textContent = '💡 Hint (' + G.hints + ')'; $('hint-btn').disabled = true;
    showBanner('💡 It starts with ' + s[0] + ' (half points for this one)'); return; }
  const wrong = [...$('answers').querySelectorAll('.ans:not(.off)')].filter(b => !rightBtn(b, G.q));
  if(wrong.length <= 1) return;
  pick(wrong).classList.add('off'); G.hints--; G.usedHint = true;
  $('hint-btn').textContent = '💡 Hint (' + G.hints + ')'; $('hint-btn').disabled = G.hints <= 0;
  showBanner('💡 One wrong answer is gone (half points for this one)');
}
function sayQ(){ if(G && G.q){ if(G.q.lang === 'th') sayTH(thaiSayText(G.q)); else say(sayText(G.q)); } }   // ➗ mq-w1: Thai sums in the Thai voice
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
  if(left < 10000 && !hudLow){ hudLow = true; showBanner('⏱ 10 seconds left!', 'bad'); cheerSay('close', 'time'); /* 📣 cs-4b */ } if(left >= 10000) hudLow = false;
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
  mqRemember(g);
  if(g.score > 0 || cleared) saveWin(S.player, g.lvl, {timeSec: secs, stars, score: g.score, theme: g.world + ':' + g.series + ':' + g.mode, cleared, stats});
  const W = WORLDS[g.world];
  cheerEnd(cleared); /* 📣 cs-4b */
  if(cleared){ const pr = pick(PRAISE); party('🎉 ' + pr + ', ' + S.player + '!'); if(g.mode === 'wordth') sayTH('เก่งมาก ' + S.player + '!'); else say(pr + ', ' + S.player + '!'); confetti(['🧮', '⭐', '🎉', W.icon, SERIES[g.series].icon, '💯'], 40); UISound.play('success'); }
  else { UISound.play('pop'); say(why === 'time' ? 'Time is up! Good try!' : why === 'hardcore' ? 'Hardcore over. Try again!' : 'Good try! Let\'s practise.'); }
  setTimeout(() => {
    if(G !== g) return;
    const title = cleared ? (g.wrong === 0 ? 'Perfect round!' : 'Level passed!') : why === 'time' ? 'Time\'s up!' : why === 'hardcore' ? '💀 Hardcore over!' : 'So close!';
    const next = cleared && g.lvl < 5;
    showResult('<div class="big">' + (cleared ? (g.wrong === 0 ? '💯' : '🏆') : why === 'hardcore' ? '💀' : W.mascot) + '</div><h2 class="' + (cleared ? 'cheer' : '') + '">' + title + '</h2>' +
      (cleared ? '<div class="rating">' + [0, 1, 2].map(k => '<span class="st' + (k < stars ? '' : ' off') + '" style="animation-delay:' + (0.25 + k * 0.25) + 's">⭐</span>').join('') + '</div>' : '') +
      '<div class="score-big">🏆 <span id="score-count">0</span></div>' +
      '<div class="stats"><span>✅ ' + g.right + ' / ' + L.qs + '</span><span>🔥 best ' + g.bestStreak + '</span><span>⏱ ' + fmt(secs * 1000) + '</span>' + (bonus ? '<span>⚡ time bonus ' + bonus.toLocaleString() + '</span>' : '') + (L.hardcore ? '<span>💀 ×3</span>' : '') + (isWordMode(g.mode) ? '<span>' + modeOf(g.mode).icon + ' ' + modeOf(g.mode).name + ' ×' + MODE_MULT[g.mode] + '</span>' : '') + (g.typedRight ? '<span>⌨️ typed ' + g.typedRight + ' ×' + TYPED_MULT + '</span>' : '') + '</div>' +
      (why === 'hardcore' ? '<div class="hc-note">💀 Hardcore ends on the first mistake — try again!</div>' : '') +
      (!cleared ? '<div class="tip">' + (why === 'time' ? '⏱ Answer a little quicker — the time bonus is big! ' : !allDone ? '' : '🎯 Get ' + Math.ceil(L.qs * 0.6) + ' right to pass. ') + TIPS[g.series] + '</div>' : '') +
      '<div class="save-note" id="save-note">' + (g.score > 0 || cleared ? '<span class="ui-spin a-bounce">🧮</span> Saving your score…' : 'Not saved — answer some questions to get a score.') + '</div>' +
      '<div class="res-btns">' + (next ? '<button class="btn sp-btn sp-primary" id="b-next">' + (g.lvl === 4 ? '💀 Try Hardcore ▶' : 'Next level ▶') + '</button>' : '') + '<button class="btn sp-btn ' + (next ? 'soft sp-secondary' : 'sp-primary') + '\" id="b-again">🔁 Play again</button><button class="btn soft sp-btn sp-secondary" id="b-menu">🎚️ Levels</button></div>');
    countUp($('score-count'), g.score, 1000);
    $('b-again').onclick = () => startGame(g.lvl);
    $('b-menu').onclick = () => backToMenu();
    if($('b-next')) $('b-next').onclick = () => { const p = progressOf(S.player); p.unlocked = Math.max(p.unlocked, g.lvl + 1); startGame(g.lvl + 1); };
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
    showResult('<div class="big">⏱️</div><h2 class="' + (best ? 'cheer' : '') + '">' + (best ? 'New best!' : 'Time\'s up!') + '</h2>' +
      '<div class="score-big">🏆 <span id="score-count">0</span></div>' +
      '<div class="stats"><span>✅ ' + g.right + ' right</span><span>❌ ' + g.wrong + ' mistake' + (g.wrong === 1 ? '' : 's') + '</span><span>🎯 ' + acc + '%</span><span>🔥 best ' + g.bestStreak + '</span></div>' +
      '<div class="tip">' + (old && !best ? 'Your best is ✅ ' + old.right + ' — ' : '') + 'Mistakes cost 50 points each, so think fast but carefully!</div>' +
      '<div class="save-note">⏱️ Best results are kept on this device</div>' +
      '<div class="res-btns"><button class="btn sp-btn sp-primary" id="b-again">🔁 Try again</button><button class="btn soft sp-btn sp-secondary" id="b-menu">🎚️ Levels</button></div>');
    countUp($('score-count'), score, 900);
    $('b-again').onclick = () => startGame('c'); $('b-menu').onclick = () => backToMenu();
  }, 700);
}
function party(text){ const p = document.createElement('div'); p.className = 'praise'; p.textContent = text; document.body.appendChild(p); setTimeout(() => p.remove(), 1600); }
function sparkle(el){ const r = el.getBoundingClientRect(); for(let k = 0; k < 7; k++){ const s = document.createElement('div'); s.className = 'spark'; s.textContent = pick(['✨', '⭐', '💫']); const a = Math.random() * 6.28, d = 40 + Math.random() * 40; s.style.cssText = 'left:' + (r.left + r.width / 2) + 'px;top:' + (r.top + r.height / 2) + 'px;--dx:' + Math.cos(a) * d + 'px;--dy:' + Math.sin(a) * d + 'px'; document.body.appendChild(s); setTimeout(() => s.remove(), 850); } }
function floatText(el, text){ const r = el.getBoundingClientRect(), s = document.createElement('div'); s.className = 'float'; s.textContent = text; s.style.cssText = 'left:' + (r.left + r.width / 2 - 20) + 'px;top:' + (r.top - 6) + 'px'; document.body.appendChild(s); setTimeout(() => s.remove(), 950); }
let bannerTimer = 0;
function showBanner(text, kind){ const b = $('banner'); b.textContent = text; b.classList.toggle('gold', kind === 'gold'); b.classList.toggle('bad', kind === 'bad'); b.classList.add('on'); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('on'), 1900); }

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
  mode = id; savePrefs(); renderModes(); renderLevels();
  if(id !== 'minute') return; const c = document.querySelector('#scr-menu .lvl.challenge'); if(c){ if(c.scrollIntoView) c.scrollIntoView({block: 'center'}); c.click(); }
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
