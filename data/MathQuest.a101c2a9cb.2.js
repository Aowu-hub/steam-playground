
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
  {k: 'storyen', g: 'english', icon: '📖', name: 'Story Problems', type: 'A real-life maths story', sub: 'Read the story, work out the answer', lang: 'en'},
  {k: 'tricken', g: 'english', icon: '🤔', name: 'Trick Questions', type: 'A think-twice puzzle', sub: 'The quick answer is a trap!', lang: 'en'},
  {k: 'listenen', g: 'english', icon: '🎧', name: 'Listen', type: 'A listening maths game', sub: SOON_EN, soon: true},
  {k: 'wordth', g: 'thai', icon: '🐘', name: 'เลขคำไทย', type: 'เกมอ่านโจทย์ภาษาไทย', sub: 'อ่านโจทย์เป็นคำ แล้วหาคำตอบ', lang: 'th'},
  {k: 'storyth', g: 'thai', icon: '📜', name: 'โจทย์ปัญหา', type: 'โจทย์เรื่องราวในชีวิตจริง', sub: 'อ่านเรื่อง แล้วคิดหาคำตอบ', lang: 'th'},
  {k: 'trickth', g: 'thai', icon: '🙃', name: 'คำถามหลอก', type: 'ปริศนาคิดสองรอบ', sub: 'คำตอบที่คิดเร็ว ๆ คือกับดัก!', lang: 'th'},
  {k: 'listenth', g: 'thai', icon: '👂', name: 'ฟังโจทย์', type: 'เกมฟังโจทย์เลข', sub: SOON_TH, soon: true}
];
const MODE_MULT = {classic: 1, minute: 1, worden: 1.1, wordth: 1.1, storyen: 1.3, storyth: 1.3, tricken: 1.3, trickth: 1.3};   // × on top of the series × (plan §3)
const TYPED_MULT = 1.25;                                                 // ⌨️ typed answers (plan §3b)
function modeOf(k){ return MODES.find(m => m.k === k) || MODES[0]; }
function isWordMode(k){ return k === 'worden' || k === 'wordth'; }
function isStoryMode(k){ return k === 'storyen' || k === 'storyth'; }   // ➗ mq-w2
function isTrickMode(k){ return k === 'tricken' || k === 'trickth'; }   // ➗ mq-w3
function modeTime(k){ return isStoryMode(k) ? 1.7 : isTrickMode(k) ? 1.3 : 1; }   // 🤔 tricks: +30 % reading time                 // 📖 stories need reading time: ×1.7 on the clock
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
function shownAns(q){ if(q.trick) return q.right; return q.wordAns || q.form === 'w2n' ? wordsOf(q.ask, q.lang) : q.ask.toLocaleString(); }
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
  if(isStoryMode(mode)) return makeStoryQ(mode, series, lvl, world, age, L);   // ➗ mq-w2 📖
  if(isTrickMode(mode)){ const tq = makeTrickQ(mode, lvl, L); if(tq) return tq; }   // ➗ mq-w3 🤔
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
// TWO-step templates make their own numbers (cap X.C). ops = the signs inside (the series picker keeps a story when its sign is in it).
// hold = who holds the answer → how a 3rd step is told (🌋 💀) · q3e / q3t = the question after a 3rd step when it must change
const STORY_TWO = [
  {id: 'ms', ops: ['mul', 'sub'], hold: 'has', mk: X => { const [a, b] = X.mulPair(), c = X.r(1, a * b - 1);
    return {e: [X.p[0] + ' has ' + X.eGroups(a, b) + '.', X.p[0] + ' gives ' + fN(c) + ' to ' + X.p[1] + '.'], qe: 'How many ' + X.N.ep + ' does ' + X.p[0] + ' have now?',
      t: [X.pt[0] + 'มี' + X.tGroups(a, b), 'ให้' + X.pt[1] + 'ไป ' + X.tn(c)], qt: 'ตอนนี้' + X.pt[0] + 'มี' + X.N.t + 'กี่' + X.N.c, steps: [stp(a, 'mul', b), stp(a * b, 'sub', c)]}; }},
  {id: 'as', ops: ['add', 'sub'], hold: 'has', mk: X => { const a = X.r(STORY_LO[X.lvl], X.C / 2), b = X.r(1, X.C - a), c = X.r(1, a + b - 1);
    return {e: [X.p[0] + ' has ' + X.en(a) + '.', X.p[1] + ' gives ' + X.p[0] + ' ' + fN(b) + ' more.', 'Then ' + X.p[0] + ' gives ' + fN(c) + ' to ' + X.p[2] + '.'], qe: 'How many ' + X.N.ep + ' does ' + X.p[0] + ' have now?',
      t: [X.pt[0] + 'มี' + X.N.t + ' ' + X.tn(a), X.pt[1] + 'ให้มาอีก ' + X.tn(b), 'แล้ว' + X.pt[0] + 'ให้' + X.pt[2] + 'ไป ' + X.tn(c)], qt: 'ตอนนี้' + X.pt[0] + 'มี' + X.N.t + 'กี่' + X.N.c, steps: [stp(a, 'add', b), stp(a + b, 'sub', c)]}; }},
  {id: 'sa', ops: ['sub', 'add'], hold: 'in', mk: X => { const a = X.r(STORY_LO[X.lvl], X.C), b = X.r(1, a - 1), c = X.r(1, Math.max(1, Math.min(X.C - (a - b), Math.round(X.C / 2))));
    return {e: ['There ' + X.be(a) + ' ' + X.en(a) + ' ' + X.inB() + '.', fN(b) + ' ' + X.out(b) + '.', 'Then ' + fN(c) + ' ' + X.come(c) + '.'], qe: 'How many ' + X.N.ep + ' are ' + X.inB() + ' now?',
      t: [X.tinB() + 'มี' + X.N.t + ' ' + X.tn(a), X.tOut() + ' ' + X.tn(b), 'แล้ว' + X.tCome() + 'อีก ' + X.tn(c)], qt: 'ตอนนี้' + X.tinB() + 'มี' + X.N.t + 'กี่' + X.N.c, steps: [stp(a, 'sub', b), stp(a - b, 'add', c)]}; }},
  {id: 'ma', ops: ['mul', 'add'], hold: 'has', mk: X => { const [a, b] = X.mulPair(), c = X.r(1, Math.max(1, Math.min(X.C - a * b, Math.round(X.C / 4))));
    return {e: [X.p[0] + ' has ' + X.eGroups(a, b) + '.', X.p[0] + ' also has ' + fN(c) + ' more ' + (c === 1 ? X.N.e : X.N.ep) + '.'], qe: 'How many ' + X.N.ep + ' does ' + X.p[0] + ' have altogether?', q3e: 'How many ' + X.N.ep + ' does ' + X.p[0] + ' have now?',
      t: [X.pt[0] + 'มี' + X.tGroups(a, b), 'และมี' + X.N.t + 'อีก ' + X.tn(c)], qt: X.pt[0] + 'มี' + X.N.t + 'ทั้งหมดกี่' + X.N.c, q3t: 'ตอนนี้' + X.pt[0] + 'มี' + X.N.t + 'กี่' + X.N.c, steps: [stp(a, 'mul', b), stp(a * b, 'add', c)]}; }},
  {id: 'da', ops: ['div', 'add'], hold: 'each', mk: X => { const b = X.r(2, X.C > 100 ? 12 : 9), q = X.r(2, Math.max(2, Math.floor(X.C * 0.8 / b))), c = X.r(1, X.C > 100 ? 40 : 9);
    return {e: [X.p[0] + ' shares ' + X.en(b * q) + ' equally among ' + fN(b) + ' friends.', 'Then each friend gets ' + fN(c) + ' more from ' + X.p[1] + '.'], qe: 'How many ' + X.N.ep + ' does each friend have now?',
      t: [X.pt[0] + 'แบ่ง' + X.N.t + ' ' + X.tn(b * q) + ' ให้เพื่อน ' + fN(b) + ' คนเท่า ๆ กัน', 'แล้ว' + X.pt[1] + 'ให้เพิ่มอีกคนละ ' + X.tn(c)], qt: 'ตอนนี้เพื่อนแต่ละคนมี' + X.N.t + 'กี่' + X.N.c, steps: [stp(b * q, 'div', b), stp(q, 'add', c)]}; }},
  {id: 'ds', ops: ['div', 'sub'], hold: 'each', mk: X => { const b = X.r(2, X.C > 100 ? 12 : 9), q = X.r(3, Math.max(3, Math.floor(X.C * 0.8 / b))), c = X.r(1, q - 1);
    return {e: [X.p[0] + ' shares ' + X.en(b * q) + ' equally among ' + fN(b) + ' friends.', 'Each friend gives ' + fN(c) + ' to ' + X.p[1] + '.'], qe: 'How many ' + X.N.ep + ' does each friend have left?', q3e: 'How many ' + X.N.ep + ' does each friend have now?',
      t: [X.pt[0] + 'แบ่ง' + X.N.t + ' ' + X.tn(b * q) + ' ให้เพื่อน ' + fN(b) + ' คนเท่า ๆ กัน', 'แล้วแต่ละคนให้' + X.pt[1] + 'ไปคนละ ' + X.tn(c)], qt: 'เพื่อนแต่ละคนเหลือ' + X.N.t + 'กี่' + X.N.c, q3t: 'ตอนนี้เพื่อนแต่ละคนมี' + X.N.t + 'กี่' + X.N.c, steps: [stp(b * q, 'div', b), stp(q, 'sub', c)]}; }},
  {id: 'md', ops: ['mul', 'div'], hold: 'each', q3: 1, mk: X => { for(let k = 0; k < 40; k++){ const [a, b] = X.mulPair(), t = a * b, fr = [2, 3, 4, 5, 6, 8].filter(f => t % f === 0 && t / f >= 2 && f !== a && f !== b); if(!fr.length) continue; const f = pick(fr);
      return {e: [X.p[0] + ' has ' + X.eGroups(a, b) + '.', X.p[0] + ' shares them all equally among ' + fN(f) + ' friends.'], qe: 'How many ' + X.N.ep + ' does each friend get?',
        q3e: 'How many ' + X.N.ep + ' does each friend have now?', t: [X.pt[0] + 'มี' + X.tGroups(a, b), 'แบ่งทั้งหมดให้เพื่อน ' + fN(f) + ' คนเท่า ๆ กัน'], qt: 'เพื่อนได้คนละกี่' + X.N.c, q3t: 'ตอนนี้เพื่อนแต่ละคนมี' + X.N.t + 'กี่' + X.N.c,
        steps: [stp(a, 'mul', b), stp(t, 'div', f)]}; } return null; }},
  {id: 'ch', ops: ['mul', 'sub'], buy: 1, hold: 'baht', unit: 'baht', mk: X => { const big = X.C > 100, k = X.r(2, big ? 9 : 5), p = X.r(big ? 5 : 2, big ? 150 : 25), cost = k * p, notes = (big ? [100, 500, 1000] : [20, 50, 100]).filter(m => m > cost); if(!notes.length) return null; const m = pick(notes);
    return {e: [X.p[0] + ' has ' + fN(m) + ' baht.', X.p[0] + ' buys ' + X.en(k) + ' at ' + fN(p) + ' baht each.'], qe: 'How much change does ' + X.p[0] + ' get?', q3e: 'How many baht does ' + X.p[0] + ' have now?',
      t: [X.pt[0] + 'มีเงิน ' + fN(m) + ' บาท', 'ซื้อ' + X.N.t + ' ' + X.tn(k) + ' ' + X.N.c + 'ละ ' + fN(p) + ' บาท'], qt: 'จะได้เงินทอนกี่บาท', q3t: 'ตอนนี้' + X.pt[0] + 'มีเงินกี่บาท', steps: [stp(k, 'mul', p), stp(m, 'sub', cost)]}; }},
  {id: 'sh', ops: ['add', 'sub'], buy: 1, hold: 'baht', unit: 'baht', mk: X => { const big = X.C > 100, M = pick(X.SW.nouns.filter(n => n.buy && n !== X.N)); if(!M) return null;
    const x = X.r(big ? 20 : 3, big ? 400 : 40), y = X.r(big ? 20 : 3, big ? 400 : 40), notes = (big ? [500, 1000] : [50, 100]).filter(m => m > x + y); if(!notes.length) return null; const m = pick(notes);
    return {e: [X.p[0] + ' has ' + fN(m) + ' baht.', X.p[0] + ' buys ' + (/^[aeiou]/.test(X.N.e) ? 'an ' : 'a ') + X.N.e + ' for ' + fN(x) + ' baht and ' + (/^[aeiou]/.test(M.e) ? 'an ' : 'a ') + M.e + ' for ' + fN(y) + ' baht.'], qe: 'How much change does ' + X.p[0] + ' get?', q3e: 'How many baht does ' + X.p[0] + ' have now?',
      t: [X.pt[0] + 'มีเงิน ' + fN(m) + ' บาท', 'ซื้อ' + X.N.t + ' ราคา ' + fN(x) + ' บาท และ' + M.t + ' ราคา ' + fN(y) + ' บาท'], qt: 'จะได้เงินทอนกี่บาท', q3t: 'ตอนนี้' + X.pt[0] + 'มีเงินกี่บาท', steps: [stp(x, 'add', y), stp(m, 'sub', x + y)]}; }},
  {id: 'tl', ops: ['sub'], hold: 'min', unit: 'min', s3: 'sub', mk: X => { const [A, B] = shuffle(X.SW.acts.slice()), a = X.C > 100 ? X.r(60, 240) : pick([30, 40, 45, 50, 60, 90]), b = X.minutes(), c = X.minutes(); if(b + c >= a) return null;
    return {e: [X.p[0] + ' has ' + fN(a) + ' minutes of free time.', X.p[0] + ' ' + A.e + ' for ' + fN(b) + ' minutes and ' + B.e + ' for ' + fN(c) + ' minutes.'], qe: 'How many minutes are left?',
      t: [X.pt[0] + 'มีเวลาว่าง ' + fN(a) + ' นาที', A.t + ' ' + fN(b) + ' นาที และ' + B.t + ' ' + fN(c) + ' นาที'], qt: 'เหลือเวลาอีกกี่นาที', steps: [stp(a, 'sub', b), stp(a - b, 'sub', c)]}; }},
  {id: 'ta', ops: ['add'], hold: 'min', unit: 'min', s3: 'add', mk: X => { const [A, B, D] = shuffle(X.SW.acts.slice()), a = X.minutes(), b = X.minutes(), c = X.minutes(); if(a + b + c > X.C) return null;
    return {e: [X.p[0] + ' ' + A.e + ' for ' + fN(a) + ' minutes, ' + B.e + ' for ' + fN(b) + ' minutes, then ' + D.e + ' for ' + fN(c) + ' minutes.'], qe: 'How many minutes is that in all?',
      t: [X.pt[0] + A.t + ' ' + fN(a) + ' นาที ' + B.t + ' ' + fN(b) + ' นาที แล้ว' + D.t + 'อีก ' + fN(c) + ' นาที'], qt: 'รวมใช้เวลากี่นาที', steps: [stp(a, 'add', b), stp(a + b, 'add', c)]}; }},
  {id: 'mt', ops: ['add'], hold: 'together', q3: 1, mk: X => { const a = X.r(Math.max(2, Math.round(STORY_LO[X.lvl] / 2)), Math.floor(X.C / 3)), b = X.r(1, Math.floor(X.C / 3));
    return {e: [X.p[0] + ' has ' + X.en(a) + '.', X.p[1] + ' has ' + fN(b) + ' more than ' + X.p[0] + '.'], qe: 'How many ' + X.N.ep + ' do they have together?', q3e: 'How many ' + X.N.ep + ' do they have together now?',
      t: [X.pt[0] + 'มี' + X.N.t + ' ' + X.tn(a), X.pt[1] + 'มีมากกว่า' + X.pt[0] + ' ' + X.tn(b)], qt: 'ทั้งสองคนมี' + X.N.t + 'รวมกันกี่' + X.N.c, q3t: 'ตอนนี้ทั้งสองคนมี' + X.N.t + 'รวมกันกี่' + X.N.c, steps: [stp(a, 'add', b), stp(a, 'add', a + b)]}; }},
  {id: 'ft', ops: ['sub', 'add'], hold: 'together', q3: 1, mk: X => { const a = X.r(Math.max(3, STORY_LO[X.lvl]), Math.floor(X.C / 2)), b = X.r(1, a - 1);
    return {e: [X.p[0] + ' has ' + X.en(a) + '.', X.p[1] + ' has ' + fN(b) + ' fewer than ' + X.p[0] + '.'], qe: 'How many ' + X.N.ep + ' do they have together?', q3e: 'How many ' + X.N.ep + ' do they have together now?',
      t: [X.pt[0] + 'มี' + X.N.t + ' ' + X.tn(a), X.pt[1] + 'มีน้อยกว่า' + X.pt[0] + ' ' + X.tn(b)], qt: 'ทั้งสองคนมี' + X.N.t + 'รวมกันกี่' + X.N.c, q3t: 'ตอนนี้ทั้งสองคนมี' + X.N.t + 'รวมกันกี่' + X.N.c, steps: [stp(a, 'sub', b), stp(a, 'add', a - b)]}; }}
];
// 3rd step (🌋 💀): one more sentence, told the way the holder of the answer works
function storyThird(X, st, hold, sign){
  const r = st.steps[st.steps.length - 1].r, N = X.N;
  if(!sign) sign = r >= 2 && Math.random() < 0.5 ? 'sub' : 'add';
  if(sign === 'sub' && r < 2) return false;
  const d = sign === 'sub' ? X.r(1, r - 1) : X.r(1, Math.max(1, Math.min(X.C - r, X.C > 100 ? 200 : 20)));
  if(sign === 'add' && r + d > X.C) return false;
  const plus = sign === 'add', E = {
    has: plus ? 'Later ' + X.p[0] + (N.alive ? ' gets ' : ' finds ') + fN(d) + ' more.' : 'Later ' + X.p[0] + (N.alive ? ' gives ' + fN(d) + ' to ' + X.p[2] : ' loses ' + fN(d)) + '.',
    in: 'Later ' + fN(d) + ' ' + (plus ? X.come(d) : 'more ' + X.out(d).replace(/^(is|are) /, d === 1 ? 'is ' : 'are ')) + '.',
    each: plus ? 'Later each friend gets ' + fN(d) + ' more.' : 'Later each friend gives ' + fN(d) + ' away.',
    together: plus ? 'Later ' + X.p[2] + ' gives them ' + fN(d) + ' more.' : 'Later they lose ' + fN(d) + '.',
    baht: plus ? 'Later Grandma gives ' + X.p[0] + ' ' + fN(d) + ' baht.' : 'Later ' + X.p[0] + ' spends ' + fN(d) + ' baht on a drink.',
    min: plus ? 'After that, ' + X.p[0] + ' rests for ' + fN(d) + ' minutes.' : X.p[0] + ' also ' + X.SW.acts[2].e + ' for ' + fN(d) + ' minutes.'}[hold];
  const T = {
    has: plus ? 'ต่อมา' + X.pt[0] + (N.alive ? 'ได้มา' : 'หาเจอ') + 'อีก ' + X.tn(d) : 'ต่อมา' + (N.alive ? 'ให้' + X.pt[2] + 'ไปอีก ' : 'ทำหายไป ') + X.tn(d),
    in: 'ต่อมา' + (plus ? X.tCome() : X.tOut()) + 'อีก ' + X.tn(d),
    each: plus ? 'ต่อมาได้เพิ่มอีกคนละ ' + X.tn(d) : 'ต่อมาแต่ละคนให้คนอื่นไปคนละ ' + X.tn(d),
    together: plus ? 'ต่อมา' + X.pt[2] + 'ให้เพิ่มอีก ' + X.tn(d) : 'ต่อมาทำหายไป ' + X.tn(d),
    baht: plus ? 'ต่อมาคุณยายให้เงินอีก ' + fN(d) + ' บาท' : 'ต่อมาซื้อน้ำอีก ' + fN(d) + ' บาท',
    min: plus ? 'หลังจากนั้นพักอีก ' + fN(d) + ' นาที' : 'แล้ว' + X.SW.acts[2].t + 'อีก ' + fN(d) + ' นาที'}[hold];
  if(!E || !T) return false;
  st.e.push(E); st.t.push(T); st.steps.push(stp(r, sign, d));
  if(st.q3e){ st.qe = st.q3e; st.qt = st.q3t; }
  return true;
}
function storySteps(lvl){ return lvl <= 2 ? 1 : lvl === 3 ? 2 : lvl === 4 ? (Math.random() < 0.5 ? 3 : 2) : 3; }
// 📖 one story question for the 📖 / 📜 modes (ser = the series picker; 🔀 mixes the signs)
function makeStoryQ(mode, ser, lvl, world, age, L){
  const lang = mode === 'storyth' ? 'th' : 'en', n = storySteps(lvl);
  for(let tries = 0; tries < 60; tries++){
    let st = null, tpl = null, X = null, nums = null;
    if(n === 1){
      const op = ser === 'mix' ? pick(lvl === 0 ? ['add', 'sub', 'add', 'sub', 'mul', 'div'] : OPS) : ser;
      let pool = STORY_ONE.filter(t => t.op === op && t.lv <= lvl);
      if(lvl === 2 && Math.random() < 0.6){ const think = pool.filter(t => t.lv === 2); if(think.length) pool = think; }   // 🔦: wording that doesn't say "more / left"
      tpl = pick(pool); X = storyX(world, lvl); nums = makeNums(op, lvl, L); st = tpl.mk(X, nums.a, nums.b, nums.ans);
    } else {
      const pool = STORY_TWO.filter(t => ser === 'mix' || t.ops.includes(ser));
      tpl = pick(pool); X = storyX(world, lvl, tpl.buy); st = tpl.mk(X);
      if(st && n === 3 && !storyThird(X, st, tpl.hold, tpl.s3)) st = null;
    }
    if(!st) continue;
    const ans = st.steps[st.steps.length - 1].r;
    if(!st.steps.every(z => Number.isInteger(z.r) && z.r >= 0 && z.a >= 0 && z.b >= 0)) continue;
    if(n > 1 && st.steps.some(z => z.r > X.C)) continue;
    // 🙈 an extra number that doesn't matter (🌋 half the time · 💀 always)
    let extra = 0;
    if(lvl === 5 || (lvl === 4 && Math.random() < 0.5)){
      const used = new Set([ans].concat(...st.steps.map(z => [z.a, z.b, z.r]))), age = Math.random() < 0.4;
      for(let k = 0; k < 20 && !extra; k++){ const x = age ? X.r(6, 12) : X.r(3, X.C > 100 ? 90 : 30); if(!used.has(x)) extra = x; }
      if(extra){
        st.e.splice(1 + rnd(st.e.length), 0, age ? X.p[0] + ' is ' + extra + ' years old.' : X.SW.extra.e.replace('{n}', extra));
        st.t.splice(1 + rnd(st.t.length), 0, age ? X.pt[0] + 'อายุ ' + extra + ' ขวบ' : X.SW.extra.t.replace('{n}', extra)); }
    }
    const last = st.steps[st.steps.length - 1], u = tpl.unit || 'n';
    const q = {op: last.op, a: last.a, b: last.b, ans, ask: ans, missing: '', story: true, lang, mode, tpl: tpl.id, steps: st.steps, extra, vis: null, noun: X.N, n: n, world,
      unit: u === 'baht' ? {e: 'baht', t: 'บาท'} : u === 'min' ? {e: 'minutes', t: 'นาที'} : u === 'box' ? {e: X.B.ep, t: X.B.c} : {e: X.N.ep, t: X.N.c}};
    const lines = lang === 'th' ? st.t : st.e, ask = lang === 'th' ? st.qt : st.qe;
    q.word = lines.join(' ') + ' ' + ask;
    const bold = x => UI.esc(x).replace(/[0-9][0-9,]*/g, m => '<b>' + m + '</b>');
    q.storyHtml = lines.map(bold).join(' ') + ' <span class="sq">' + bold(ask) + '</span>';
    if(n === 1 && tpl.pic && pictures(lvl, age)) q.vis = visFor({op: tpl.op, a: nums.a, b: nums.b, ans: nums.ans}, {items: [X.N.i]}, lvl);
    q.choices = storyChoices(q, L.choices);
    q.key = 'st' + tpl.id + '-' + st.steps.map(z => z.a + '_' + z.b).join('_') + (extra ? 'x' + extra : '');
    return q;
  }
  const q = makeNums(ser === 'mix' ? 'add' : ser, lvl, L);   // never reached in practice — a plain sum keeps the round going
  return Object.assign(q, {missing: '', word: '', vis: null, lang, mode, ask: q.ans, choices: choicesFor(Object.assign(q, {ask: q.ans, missing: ''}), L.choices), key: qKey(q)});
}
// answer buttons for a story: the right one + the real mistakes (stopped a step early, the wrong sign on the last step, used the extra number)
function storyChoices(q, n){
  const r = q.ask, set = new Set([r]), traps = [], L = q.steps[q.steps.length - 1];
  q.steps.slice(0, -1).forEach(z => traps.push(z.r));
  if(L.op === 'sub') traps.push(L.a + L.b); if(L.op === 'add') traps.push(Math.abs(L.a - L.b)); if(L.op === 'mul') traps.push(L.a + L.b); if(L.op === 'div') traps.push(L.a - L.b);
  if(q.extra) traps.push(r + q.extra, Math.abs(r - q.extra));
  const near = [r + 1, r - 1, r + 2, r - 2].concat(r >= 20 ? [r + 10, r - 10] : []);
  shuffle(traps).slice(0, n - 2).concat(shuffle(near), shuffle(traps)).forEach(v => { if(set.size < n && Number.isInteger(v) && v >= 0 && v !== r) set.add(v); });
  let k = 3; while(set.size < n){ const v = r + (Math.random() < 0.5 ? -1 : 1) * k++; if(v >= 0) set.add(v); }
  return shuffle([...set]);
}
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
  while(k++ < 40 && fs > 11 && (card.scrollHeight > card.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)){ fs -= 1; el.style.fontSize = fs + 'px'; }
}
window.addEventListener('resize', () => { if(G && G.q && G.q.story) fitStory(); });
/* ================= 🤔 TRICK QUESTIONS (➗ mq-w3, plan §6) ================= */
// Each trick: id · lv [from, to] (levels it can show on) · mk(R) → {q, a (right), t (THE trap), o [others], tl (🤔 why it's a trap), w (✅ why the answer is right)}
// or null when the numbers rolled don't work (R gives new numbers). Numbers are swapped where the trick allows it; Thai tricks are written for Thai kids.
const TK_DAYS = {en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], th: ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์']};
const TK_NAMES = {en: ['Nok', 'Ton', 'Mali', 'Ploy', 'Sam', 'Lily', 'Ben', 'Fah'], th: ['น้องนก', 'น้องต้น', 'น้องมะลิ', 'น้องพลอย', 'น้องแซม', 'น้องลิลลี่', 'น้องเบน', 'น้องฟ้า']};
const TK_GIRLS = {en: ['Mali', 'Ploy', 'Lily', 'Fah'], th: ['น้องมะลิ', 'น้องพลอย', 'น้องลิลลี่', 'น้องฟ้า']};
function tkOrd(n){ return n + ((n % 100 >= 11 && n % 100 <= 13) ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] || 'th')); }
function trickR(lang){ const D = TK_DAYS[lang]; return {r: randInt, pick, name: () => pick(TK_NAMES[lang]), girl: () => pick(TK_GIRLS[lang]), day: i => D[((i % 7) + 7) % 7], ord: tkOrd}; }
const TRICKS_EN = [
  {id: 'e01', lv: [0, 2], mk: R => { const a = R.r(3, 9), N = R.name(); return {q: `${N} has ${a} apples and eats none. How many apples does ${N} have?`, a, t: 0, o: [a - 1, a + 1], tl: '“Eats” sounds like a take-away — but none were eaten.', w: `Nothing was eaten, so all ${a} apples are still there.`}; }},
  {id: 'e02', lv: [0, 2], mk: R => { const k = R.r(1, 5); return {q: `Which is heavier: ${k} kg of feathers or ${k} kg of stones?`, a: 'Both the same', t: 'The stones', o: ['The feathers', "You can't tell"], tl: `Stones feel heavy — but both weigh ${k} kg.`, w: `${k} kg is ${k} kg, feathers or stones.`}; }},
  {id: 'e03', lv: [0, 2], mk: R => { const a = R.r(2, 6); return {q: `A cat has ${a} kittens. Each kitten has 1 tail. How many tails do the kittens have?`, a, t: a + 1, o: [a * 2, a - 1], tl: "Don't count the mother cat — the question is about the kittens.", w: `${a} kittens × 1 tail = ${a} tails.`}; }},
  {id: 'e04', lv: [0, 2], mk: R => { const a = R.r(3, 9), N = R.name(); return {q: `There are ${a} birds on a fence. ${N} counts them two times. How many birds are on the fence?`, a, t: a * 2, o: [a + 2, a - 1], tl: "Counting two times doesn't make more birds.", w: `No bird came or flew away — still ${a}.`}; }},
  {id: 'e05', lv: [0, 2], mk: R => { const a = R.r(2, 5); return {q: `How many legs do ${a} chickens have?`, a: 2 * a, t: 4 * a, o: [a, 2 * a + 1], tl: 'Chickens are not cows — a chicken has 2 legs, not 4.', w: `${a} × 2 legs = ${2 * a} legs.`}; }},
  {id: 'e06', lv: [0, 2], mk: R => { const a = R.r(2, 6), b = R.r(2, 6), N = R.name(); return {q: `${N} has ${a} red balls and ${b} blue balls. How many green balls does ${N} have?`, a: 0, t: a + b, o: [a, b, 1], tl: 'Adding the numbers is the trap — the question asks about GREEN balls.', w: 'Only red and blue balls — so 0 green ones.'}; }},
  {id: 'e07', lv: [1, 3], mk: R => { const k = R.r(2, 3); return {q: `A spider has 8 legs. How many legs do ${k} spiders have?`, a: 8 * k, t: 8 + k, o: [8, 8 * k + 2], tl: `Don't add the ${k} — every spider has its own 8 legs.`, w: `${k} × 8 = ${8 * k} legs.`}; }},
  {id: 'e08', lv: [0, 2], mk: R => { const a = R.r(2, 5), b = R.r(1, 4), N = R.name(); return {q: `${N} has ${a} sweets and gives none away. Then a friend gives ${N} ${b} more. How many sweets now?`, a: a + b, t: a, o: [a + b + 1, b], tl: '“Gives none away” means nothing was taken.', w: `${a} + ${b} = ${a + b} sweets.`}; }},
  {id: 'e09', lv: [0, 2], mk: R => ({q: 'How many corners does a circle have?', a: 0, t: 1, o: [4, 2], tl: 'A circle is one round line.', w: 'There is nowhere for a corner — 0 corners.'})},
  {id: 'e10', lv: [0, 2], mk: R => { const a = R.r(4, 9), N = R.name(); return {q: `${a} children stand in a line. ${N} is at the front. How many children are behind ${N}?`, a: a - 1, t: a, o: [a + 1, a - 2], tl: `${N} is one of the ${a} — don't count ${N} as behind.`, w: `${a} − 1 = ${a - 1} children.`}; }},
  {id: 'e11', lv: [1, 3], mk: R => { const a = R.r(6, 20), b = R.r(2, 5); return {q: `A bus has ${a} people. At a stop, ${b} get off and ${b} get on. How many people are on the bus now?`, a, t: a - b, o: [a + b, a - 1], tl: 'Off and on are the same number — they cancel out.', w: `${a} − ${b} + ${b} = ${a} people.`}; }},
  {id: 'e12', lv: [2, 3], mk: R => { const a = R.r(8, 15), b = R.r(2, 6); return {q: `A farmer has ${a} sheep. All but ${b} run away. How many sheep are left?`, a: b, t: a - b, o: [a, b + 1], tl: `“All but ${b}” does not mean take away ${b}.`, w: `All of them ran away except ${b} — so ${b} are left.`}; }},
  {id: 'e13', lv: [2, 3], mk: R => { const a = R.r(7, 15), b = R.r(2, 5); return {q: `There are ${a} sweets in a jar. You take ${b}. How many sweets do YOU have?`, a: b, t: a - b, o: [a, a + b], tl: 'The question asks what YOU have, not what is left in the jar.', w: `You took ${b}, so you have ${b}.`}; }},
  {id: 'e14', lv: [3, 5], mk: R => { const k = R.r(3, 8), N = R.name(); return {q: `${N} is ${R.ord(k)} from the front and ${R.ord(k)} from the back of a line. How many children are in the line?`, a: 2 * k - 1, t: 2 * k, o: [k, 2 * k + 1], tl: `${N} was counted two times.`, w: `${k} + ${k} − 1 = ${2 * k - 1} children.`}; }},
  {id: 'e15', lv: [2, 4], mk: R => { const a = R.r(4, 10); return {q: `A boat has a ladder with ${a} steps above the water. The water rises 1 metre. How many steps are above the water now?`, a, t: a - 2, o: [a - 1, a + 1], tl: 'The boat floats — it goes up with the water.', w: `The ladder rises with the boat, so ${a} steps are still above the water.`}; }},
  {id: 'e16', lv: [3, 4], mk: R => ({q: 'How many months of the year have 28 days?', a: 'All 12', t: '1', o: ['2', '6'], tl: 'You think of February — but every month has at least 28 days.', w: 'All 12 months have 28 days (most have more).'})},
  {id: 'e17', lv: [2, 4], mk: R => { const a = R.r(2, 5), G = R.girl(); return {q: `${G} has ${a} brothers. Each brother has 1 sister. How many girls are in the family?`, a: 1, t: a, o: [a + 1, 0], tl: 'The brothers all share the SAME sister.', w: `That one sister is ${G} — 1 girl.`}; }},
  {id: 'e18', lv: [2, 4], mk: R => { const a = 2 * R.r(5, 10); return {q: `How many times can you take 2 away from ${a}?`, a: 'Once', t: String(a / 2), o: ['Twice', String(a / 2 - 1)], tl: `${a} ÷ 2 = ${a / 2} is the trap.`, w: `After one take-away it is ${a - 2}, not ${a} any more — so only once.`}; }},
  {id: 'e19', lv: [2, 3], mk: R => { const a = R.r(5, 12), b = R.r(1, 4); return {q: `A box has ${a} cups. ${b} of them are cracked. How many cups are in the box?`, a, t: a - b, o: [b, a + b], tl: 'Cracked cups are still cups.', w: `Nothing left the box — still ${a} cups.`}; }},
  {id: 'e21', lv: [3, 4], mk: R => { const k = R.r(2, 5); return {q: `In a race you pass the runner in ${R.ord(k)} place. What place are you in now?`, a: R.ord(k), t: R.ord(k - 1), o: [R.ord(k + 1), '1st', R.ord(k + 2)], tl: `You took the ${R.ord(k)} runner's place — you did not pass the one in front of them.`, w: `You are now ${R.ord(k)}.`}; }},
  {id: 'e22', lv: [3, 4], mk: R => { const d = R.r(0, 6); return {q: `If yesterday was ${R.day(d)}, what day is tomorrow?`, a: R.day(d + 2), t: R.day(d + 1), o: [R.day(d), R.day(d + 3)], tl: `${R.day(d + 1)} is TODAY.`, w: `Yesterday ${R.day(d)} → today ${R.day(d + 1)} → tomorrow ${R.day(d + 2)}.`}; }},
  {id: 'e23', lv: [3, 4], mk: R => { const d = R.r(0, 6), k = R.pick([7, 14]); return {q: `Today is ${R.day(d)}. What day will it be in ${k} days?`, a: R.day(d), t: R.day(d + 1), o: [R.day(d + 6), R.day(d + 2)], tl: `${k} days is ${k === 7 ? 'one whole week' : 'two whole weeks'}.`, w: `After whole weeks it is ${R.day(d)} again.`}; }},
  {id: 'e24', lv: [3, 4], mk: R => { const half = Math.random() < 0.5; return {q: `How many minutes are in ${half ? 'half' : 'a quarter'} of an hour?`, a: half ? 30 : 15, t: half ? 50 : 25, o: [60, half ? 40 : 20], tl: 'An hour has 60 minutes, not 100.', w: `60 ÷ ${half ? 2 : 4} = ${half ? 30 : 15} minutes.`}; }},
  {id: 'e25', lv: [3, 4], mk: R => { const a = R.r(5, 9); return {q: `Which is heavier: 1 kg of rice or ${a}00 g of rice?`, a: '1 kg', t: `${a}00 g`, o: ['They are the same', "You can't tell"], tl: `${a}00 is a big number, but grams are tiny.`, w: `1 kg = 1,000 g — more than ${a}00 g.`}; }},
  {id: 'e26', lv: [3, 4], mk: R => { const a = R.r(5, 9); return {q: `Which is longer: 1 metre or ${a}0 centimetres?`, a: '1 metre', t: `${a}0 cm`, o: ['They are the same', "You can't tell"], tl: `${a}0 looks bigger than 1 — but centimetres are tiny.`, w: `1 metre = 100 cm — longer than ${a}0 cm.`}; }},
  {id: 'e28', lv: [4, 5], mk: R => { const a = R.r(5, 20), s = R.pick([1, 2, 5]); return {q: `A fence is ${a * s} m long. A post goes every ${s} m, at both ends too. How many posts?`, a: a + 1, t: a, o: [a - 1, a + 2], tl: `${a * s} ÷ ${s} = ${a} counts the gaps, not the posts.`, w: `${a} gaps need ${a + 1} posts (one more at the end).`}; }},
  {id: 'e29', lv: [4, 5], mk: R => { const a = R.r(3, 10); return {q: `You cut a log into ${a} pieces. Each cut takes 1 minute. How many minutes does it take?`, a: a - 1, t: a, o: [a + 1, a - 2], tl: `${a} pieces need fewer than ${a} cuts.`, w: `${a} pieces = ${a - 1} cuts = ${a - 1} minutes.`}; }},
  {id: 'e30', lv: [4, 5], mk: R => { const x = 2 * R.r(1, 10), y = 2 * R.r(1, 5); return {q: `What is half of ${x}, plus ${y}?`, a: x / 2 + y, t: (x + y) / 2, o: [x + y, x / 2 + y + 1], tl: `Halving ${x} + ${y} together is the trap.`, w: `Half of ${x} is ${x / 2}, then + ${y} = ${x / 2 + y}.`}; }},
  {id: 'e31', lv: [4, 5], mk: R => { const a = R.r(3, 12); return {q: `${a} + ${a} × 0 = ?`, a, t: 0, o: [a * 2, 1], tl: 'Going left to right gives 0 — but × comes before +.', w: `${a} × 0 = 0, then ${a} + 0 = ${a}.`}; }},
  {id: 'e32', lv: [4, 5], mk: R => { const a = R.r(15, 30), b = R.r(2, 9), c = R.r(2, 9); return {q: `${a} − ${b} + ${c} = ?`, a: a - b + c, t: a - b - c, o: [a + b - c, a - b + c + 1], tl: `Doing ${b} + ${c} first is the trap.`, w: `Left to right: ${a} − ${b} = ${a - b}, then + ${c} = ${a - b + c}.`}; }},
  {id: 'e33', lv: [4, 5], mk: R => { const a = R.r(10, 20); return {q: `It takes ${a} steps to walk from floor 1 to floor 2. How many steps from floor 1 to floor 3?`, a: 2 * a, t: 3 * a, o: [a, 2 * a + 1], tl: 'Floor 1 to floor 3 is not 3 sets of stairs.', w: `1 → 2 → 3 is 2 sets of stairs: 2 × ${a} = ${2 * a} steps.`}; }},
  {id: 'e34', lv: [4, 5], mk: R => { const h = R.r(5, 10); return {q: `A snail climbs a ${h} m wall. Each day it goes up 3 m, each night it slides down 2 m. On which day does it reach the top?`, a: `Day ${h - 2}`, t: `Day ${h}`, o: [`Day ${h - 1}`, `Day ${h + 1}`], tl: '1 m a day for the whole wall is the trap.', w: `After ${h - 3} days it is at ${h - 3} m — the next day it climbs 3 m and reaches the top: day ${h - 2}.`}; }},
  {id: 'e35', lv: [4, 5], mk: R => { const a = R.r(6, 12), b = R.r(2, 4); return {q: `${a} candles are burning. ${b} are blown out. How many candles are left at the end?`, a: b, t: a - b, o: [a, 0], tl: 'The candles that keep burning are the ones that melt away.', w: `The ${b} blown-out candles stay; the other ${a - b} burn away.`}; }},
  {id: 'e36', lv: [5, 5], mk: R => { const k = R.r(2, 4), cols = ['red and blue', 'red, blue and green', 'red, blue, green and yellow'][k - 2]; return {q: `Socks in ${cols} are mixed in a dark drawer. How many socks must you take out to be SURE of a pair?`, a: k + 1, t: 2, o: [k * 2, k + 2], tl: 'Two socks could be different colours.', w: `With ${k} colours, ${k} socks could all be different — sock number ${k + 1} must match one.`}; }},
  {id: 'e37', lv: [5, 5], mk: R => { const d = R.r(2, 9); return {q: `How many times do you write the digit ${d} when you write the numbers 1 to 100?`, a: 20, t: 10, o: [11, 19], tl: `Counting only ${d}, 1${d}, 2${d}… misses ${d}0 to ${d}9.`, w: '10 in the ones place + 10 in the tens place = 20.'}; }},
  {id: 'e38', lv: [4, 5], mk: R => { const k = R.pick([6, 9]); return {q: `At 3 o'clock a clock chimes 3 times in 2 seconds. At ${k} o'clock, how many seconds do the ${k} chimes take?`, a: k - 1, t: 2 * k / 3, o: [k, k - 2], tl: 'Counting the chimes instead of the gaps between them is the trap.', w: `3 chimes have 2 gaps of 1 second; ${k} chimes have ${k - 1} gaps = ${k - 1} seconds.`}; }},
  {id: 'e39', lv: [5, 5], mk: R => { const a = R.r(3, 6); return {q: `${a} cats catch ${a} mice in ${a} minutes. How many cats are needed to catch 100 mice in 100 minutes?`, a, t: 100, o: [a * 2, 10], tl: 'All the 100s make 100 look right.', w: `The same ${a} cats catch 1 mouse a minute together — in 100 minutes, 100 mice.`}; }},
  {id: 'e40', lv: [5, 5], mk: R => { const k = R.r(5, 20); return {q: `A bat and a ball cost ${100 + 2 * k} baht together. The bat costs 100 baht more than the ball. How much is the ball?`, a: `${k} baht`, t: `${2 * k} baht`, o: [`${k + 5} baht`, `${100 + k} baht`], tl: `With a ${2 * k}-baht ball the bat is ${2 * k + 100} — together ${4 * k + 100} baht.`, w: `Ball ${k} + bat ${k + 100} = ${2 * k + 100} baht.`}; }},
  {id: 'e41', lv: [2, 5], mk: R => ({q: 'A rooster lays an egg on top of a roof. Which way does the egg roll?', a: 'There is no egg', t: 'Down the left side', o: ['Down the right side', 'Off the front'], tl: 'Thinking about which side is the trap.', w: "Roosters don't lay eggs — hens do!"})},
  {id: 'e42', lv: [2, 4], mk: R => { const a = R.r(2, 6), b = R.r(2, 5); return {q: `${a} fish and ${b} ducks are in a pond. How many legs are in the pond?`, a: 2 * b, t: 2 * (a + b), o: [4 * b, a + b], tl: 'Fish have no legs.', w: `Only the ducks have legs: ${b} × 2 = ${2 * b}.`}; }},
  {id: 'e43', lv: [4, 5], mk: R => { const d = 2 * R.r(5, 15); return {q: `Water plants double every day and cover the whole pond on day ${d}. On which day was the pond half covered?`, a: `Day ${d - 1}`, t: `Day ${d / 2}`, o: [`Day ${d - 2}`, `Day ${d / 2 + 1}`], tl: `Half of ${d} days is the trap.`, w: `They double every day, so the day before it was full (day ${d - 1}) it was half covered.`}; }},
  {id: 'e44', lv: [4, 5], mk: R => { const a = R.r(3, 6); return {q: `${a} friends each shake hands with every other friend once. How many handshakes?`, a: a * (a - 1) / 2, t: a * (a - 1), o: [a, a * a], tl: `${a} × ${a - 1} counts every handshake two times.`, w: `${a} × ${a - 1} ÷ 2 = ${a * (a - 1) / 2} handshakes.`}; }},
  {id: 'e45', lv: [1, 3], mk: R => { const a = R.r(5, 12), b = R.r(2, 4); return {q: `A mango tree has ${a} mangoes. The wind blows ${b} coconuts down from the palm next to it. How many mangoes are on the mango tree?`, a, t: a - b, o: [a + b, b], tl: 'The wind blew down COCONUTS, not mangoes.', w: `No mango fell — still ${a}.`}; }}
];
const TRICKS_TH = [
  {id: 't01', lv: [0, 2], mk: R => { const a = R.r(3, 9), N = R.name(); return {q: `${N}มีแอปเปิล ${a} ลูก ไม่ได้กินเลยสักลูก ${N}มีแอปเปิลกี่ลูก`, a, t: 0, o: [a - 1, a + 1], tl: 'คำว่า “กิน” ทำให้คิดว่าต้องลบ แต่ไม่ได้กินเลย', w: `ไม่ได้กินเลย จึงยังมี ${a} ลูกเท่าเดิม`}; }},
  {id: 't02', lv: [0, 2], mk: R => { const k = R.r(1, 5); return {q: `ขนนก ${k} กิโลกรัม กับหิน ${k} กิโลกรัม อะไรหนักกว่ากัน`, a: 'หนักเท่ากัน', t: 'หินหนักกว่า', o: ['ขนนกหนักกว่า', 'บอกไม่ได้'], tl: `หินดูหนัก แต่ทั้งสองอย่างหนัก ${k} กิโลกรัมเท่ากัน`, w: `${k} กิโลกรัมก็คือ ${k} กิโลกรัม ไม่ว่าจะเป็นอะไร`}; }},
  {id: 't03', lv: [0, 2], mk: R => { const a = R.r(2, 6); return {q: `แม่แมวมีลูก ${a} ตัว ลูกแมวแต่ละตัวมีหาง 1 หาง ลูกแมวมีหางรวมกี่หาง`, a, t: a + 1, o: [a * 2, a - 1], tl: 'อย่านับแม่แมวด้วย โจทย์ถามแค่ลูกแมว', w: `ลูกแมว ${a} ตัว ตัวละ 1 หาง = ${a} หาง`}; }},
  {id: 't04', lv: [0, 2], mk: R => { const a = R.r(3, 9), N = R.name(); return {q: `บนรั้วมีนก ${a} ตัว ${N}นับนก 2 รอบ บนรั้วมีนกกี่ตัว`, a, t: a * 2, o: [a + 2, a - 1], tl: 'นับ 2 รอบ นกก็ไม่ได้เพิ่มขึ้น', w: `ไม่มีนกบินมาหรือบินไป ยังมี ${a} ตัว`}; }},
  {id: 't05', lv: [0, 2], mk: R => { const a = R.r(2, 5); return {q: `ไก่ ${a} ตัว มีขารวมกี่ขา`, a: 2 * a, t: 4 * a, o: [a, 2 * a + 1], tl: 'ไก่ไม่ใช่วัว ไก่มี 2 ขา ไม่ใช่ 4 ขา', w: `${a} × 2 = ${2 * a} ขา`}; }},
  {id: 't06', lv: [0, 2], mk: R => { const a = R.r(2, 6), b = R.r(2, 6), N = R.name(); return {q: `${N}มีลูกบอลสีแดง ${a} ลูก และสีฟ้า ${b} ลูก ${N}มีลูกบอลสีเขียวกี่ลูก`, a: 0, t: a + b, o: [a, b, 1], tl: 'เอาตัวเลขมาบวกกันคือกับดัก โจทย์ถามลูกบอลสีเขียว', w: 'มีแค่สีแดงกับสีฟ้า สีเขียวจึงมี 0 ลูก'}; }},
  {id: 't07', lv: [1, 3], mk: R => { const k = R.r(2, 3); return {q: `แมงมุม 1 ตัวมี 8 ขา แมงมุม ${k} ตัวมีขารวมกี่ขา`, a: 8 * k, t: 8 + k, o: [8, 8 * k + 2], tl: `อย่าเอา ${k} ไปบวก แมงมุมทุกตัวมี 8 ขาของตัวเอง`, w: `${k} × 8 = ${8 * k} ขา`}; }},
  {id: 't08', lv: [0, 2], mk: R => { const a = R.r(2, 5), b = R.r(1, 4), N = R.name(); return {q: `${N}มีขนม ${a} ชิ้น ไม่ได้แบ่งให้ใครเลย แล้วเพื่อนให้มาอีก ${b} ชิ้น ตอนนี้${N}มีขนมกี่ชิ้น`, a: a + b, t: a, o: [a + b + 1, b], tl: '“ไม่ได้แบ่งให้ใคร” แปลว่าไม่มีอะไรหายไป', w: `${a} + ${b} = ${a + b} ชิ้น`}; }},
  {id: 't09', lv: [0, 2], mk: R => ({q: 'วงกลมมีมุมกี่มุม', a: 0, t: 1, o: [4, 2], tl: 'วงกลมเป็นเส้นโค้งเส้นเดียว', w: 'ไม่มีตรงไหนเป็นมุมเลย จึงมี 0 มุม'})},
  {id: 't10', lv: [0, 2], mk: R => { const a = R.r(4, 9), N = R.name(); return {q: `เด็ก ${a} คนเข้าแถว ${N}ยืนหัวแถว ข้างหลัง${N}มีเด็กกี่คน`, a: a - 1, t: a, o: [a + 1, a - 2], tl: `${N}ก็เป็น 1 ใน ${a} คน อย่านับ${N}ด้วย`, w: `${a} − 1 = ${a - 1} คน`}; }},
  {id: 't11', lv: [1, 3], mk: R => { const a = R.r(6, 20), b = R.r(2, 5); return {q: `บนรถเมล์มีคน ${a} คน ถึงป้ายหนึ่ง ลงไป ${b} คน แล้วขึ้นมา ${b} คน ตอนนี้บนรถเมล์มีกี่คน`, a, t: a - b, o: [a + b, a - 1], tl: 'ลงกับขึ้นจำนวนเท่ากัน หักล้างกันพอดี', w: `${a} − ${b} + ${b} = ${a} คน`}; }},
  {id: 't12', lv: [2, 3], mk: R => { const a = R.r(8, 15), b = R.r(2, 6); return {q: `ชาวนามีแกะ ${a} ตัว หนีไปหมดยกเว้น ${b} ตัว เหลือแกะกี่ตัว`, a: b, t: a - b, o: [a, b + 1], tl: `“ยกเว้น ${b} ตัว” ไม่ได้แปลว่าหนีไป ${b} ตัว`, w: `หนีไปหมด เหลือแค่ ${b} ตัวที่ไม่หนี`}; }},
  {id: 't13', lv: [2, 3], mk: R => { const a = R.r(7, 15), b = R.r(2, 5); return {q: `ในโหลมีลูกอม ${a} เม็ด เธอหยิบไป ${b} เม็ด เธอมีลูกอมกี่เม็ด`, a: b, t: a - b, o: [a, a + b], tl: 'โจทย์ถามว่า “เธอ” มีกี่เม็ด ไม่ได้ถามว่าในโหลเหลือกี่เม็ด', w: `เธอหยิบมา ${b} เม็ด เธอจึงมี ${b} เม็ด`}; }},
  {id: 't14', lv: [3, 5], mk: R => { const k = R.r(3, 8), N = R.name(); return {q: `${N}ยืนเป็นคนที่ ${k} นับจากหัวแถว และเป็นคนที่ ${k} นับจากท้ายแถว แถวนี้มีกี่คน`, a: 2 * k - 1, t: 2 * k, o: [k, 2 * k + 1], tl: `${N}ถูกนับ 2 ครั้ง`, w: `${k} + ${k} − 1 = ${2 * k - 1} คน`}; }},
  {id: 't15', lv: [2, 4], mk: R => { const a = R.r(4, 10); return {q: `เรือลำหนึ่งมีบันไดโผล่เหนือน้ำ ${a} ขั้น น้ำขึ้นสูงอีก 1 เมตร ตอนนี้บันไดโผล่เหนือน้ำกี่ขั้น`, a, t: a - 2, o: [a - 1, a + 1], tl: 'เรือลอยน้ำ เรือจึงลอยสูงขึ้นตามน้ำ', w: `บันไดสูงขึ้นพร้อมเรือ จึงยังโผล่ ${a} ขั้นเท่าเดิม`}; }},
  {id: 't16', lv: [3, 4], mk: R => ({q: 'ใน 1 ปี มีกี่เดือนที่มีวันที่ 28', a: 'ทุกเดือน (12)', t: '1 เดือน', o: ['2 เดือน', '6 เดือน'], tl: 'เรานึกถึงเดือนกุมภาพันธ์ แต่ทุกเดือนมีวันที่ 28', w: 'ทั้ง 12 เดือนมีวันที่ 28 (ส่วนใหญ่มีมากกว่านั้นอีก)'})},
  {id: 't17', lv: [2, 4], mk: R => { const a = R.r(2, 5), G = R.girl(); return {q: `${G}มีพี่ชาย ${a} คน พี่ชายแต่ละคนมีน้องสาว 1 คน บ้านนี้มีลูกผู้หญิงกี่คน`, a: 1, t: a, o: [a + 1, 0], tl: 'พี่ชายทุกคนมีน้องสาวคนเดียวกัน', w: `น้องสาวคนนั้นก็คือ${G} มีลูกผู้หญิง 1 คน`}; }},
  {id: 't18', lv: [2, 4], mk: R => { const a = 2 * R.r(5, 10); return {q: `เอา 2 ออกจาก ${a} ได้กี่ครั้ง`, a: 'ครั้งเดียว', t: `${a / 2} ครั้ง`, o: ['2 ครั้ง', `${a / 2 - 1} ครั้ง`], tl: `${a} ÷ 2 = ${a / 2} คือกับดัก`, w: `เอาออกครั้งแรกแล้วจะเหลือ ${a - 2} ไม่ใช่ ${a} อีกต่อไป`}; }},
  {id: 't19', lv: [2, 3], mk: R => { const a = R.r(5, 12), b = R.r(1, 4); return {q: `ในกล่องมีแก้ว ${a} ใบ เป็นแก้วร้าว ${b} ใบ ในกล่องมีแก้วกี่ใบ`, a, t: a - b, o: [b, a + b], tl: 'แก้วร้าวก็ยังเป็นแก้ว', w: `ไม่มีแก้วออกจากกล่อง ยังมี ${a} ใบ`}; }},
  {id: 't21', lv: [3, 4], mk: R => { const k = R.r(2, 5); return {q: `วิ่งแข่ง เธอวิ่งแซงคนที่ ${k} ได้ ตอนนี้เธออยู่ที่เท่าไร`, a: `ที่ ${k}`, t: `ที่ ${k - 1}`, o: [`ที่ ${k + 1}`, 'ที่ 1', `ที่ ${k + 2}`], tl: `เธอแซงคนที่ ${k} จึงได้ที่ของเขาแทน ไม่ได้แซงคนข้างหน้าเขา`, w: `ตอนนี้เธออยู่ที่ ${k}`}; }},
  {id: 't22', lv: [3, 4], mk: R => { const d = R.r(0, 6); return {q: `ถ้าเมื่อวานเป็น${R.day(d)} พรุ่งนี้เป็นวันอะไร`, a: R.day(d + 2), t: R.day(d + 1), o: [R.day(d), R.day(d + 3)], tl: `${R.day(d + 1)}คือ “วันนี้”`, w: `เมื่อวาน${R.day(d)} → วันนี้${R.day(d + 1)} → พรุ่งนี้${R.day(d + 2)}`}; }},
  {id: 't23', lv: [3, 4], mk: R => { const d = R.r(0, 6), k = R.pick([7, 14]); return {q: `วันนี้เป็น${R.day(d)} อีก ${k} วันจะเป็นวันอะไร`, a: R.day(d), t: R.day(d + 1), o: [R.day(d + 6), R.day(d + 2)], tl: `${k} วันคือ ${k / 7} สัปดาห์พอดี`, w: `ครบสัปดาห์ก็กลับมาเป็น${R.day(d)}อีก`}; }},
  {id: 't24', lv: [3, 4], mk: R => { const half = Math.random() < 0.5; return {q: half ? 'ครึ่งชั่วโมงมีกี่นาที' : 'หนึ่งในสี่ของชั่วโมงมีกี่นาที', a: half ? 30 : 15, t: half ? 50 : 25, o: [60, half ? 40 : 20], tl: '1 ชั่วโมงมี 60 นาที ไม่ใช่ 100 นาที', w: `60 ÷ ${half ? 2 : 4} = ${half ? 30 : 15} นาที`}; }},
  {id: 't25', lv: [3, 4], mk: R => { const a = R.r(5, 9); return {q: `ข้าวสาร 1 กิโลกรัม กับข้าวสาร ${a}00 กรัม อะไรหนักกว่ากัน`, a: '1 กิโลกรัม', t: `${a}00 กรัม`, o: ['หนักเท่ากัน', 'บอกไม่ได้'], tl: `${a}00 เป็นเลขเยอะ แต่กรัมเป็นหน่วยเล็ก`, w: `1 กิโลกรัม = 1,000 กรัม มากกว่า ${a}00 กรัม`}; }},
  {id: 't26', lv: [3, 4], mk: R => { const a = R.r(5, 9); return {q: `1 เมตร กับ ${a}0 เซนติเมตร อะไรยาวกว่ากัน`, a: '1 เมตร', t: `${a}0 เซนติเมตร`, o: ['ยาวเท่ากัน', 'บอกไม่ได้'], tl: `${a}0 ดูมากกว่า 1 แต่เซนติเมตรเป็นหน่วยเล็ก`, w: `1 เมตร = 100 เซนติเมตร ยาวกว่า ${a}0 เซนติเมตร`}; }},
  {id: 't28', lv: [4, 5], mk: R => { const a = R.r(5, 20), s = R.pick([1, 2, 5]); return {q: `รั้วยาว ${a * s} เมตร ปักเสาทุก ${s} เมตร รวมหัวและท้ายด้วย ต้องใช้เสากี่ต้น`, a: a + 1, t: a, o: [a - 1, a + 2], tl: `${a * s} ÷ ${s} = ${a} คือจำนวนช่อง ไม่ใช่จำนวนเสา`, w: `${a} ช่อง ต้องใช้เสา ${a + 1} ต้น (เพิ่มอีก 1 ต้นตรงปลาย)`}; }},
  {id: 't29', lv: [4, 5], mk: R => { const a = R.r(3, 10); return {q: `ตัดท่อนไม้ให้เป็น ${a} ท่อน ตัดครั้งละ 1 นาที ใช้เวลากี่นาที`, a: a - 1, t: a, o: [a + 1, a - 2], tl: `${a} ท่อน ไม่ต้องตัดถึง ${a} ครั้ง`, w: `${a} ท่อน ตัด ${a - 1} ครั้ง = ${a - 1} นาที`}; }},
  {id: 't30', lv: [4, 5], mk: R => { const x = 2 * R.r(1, 10), y = 2 * R.r(1, 5); return {q: `ครึ่งหนึ่งของ ${x} แล้วบวก ${y} ได้เท่าไร`, a: x / 2 + y, t: (x + y) / 2, o: [x + y, x / 2 + y + 1], tl: `เอา ${x} + ${y} แล้วค่อยแบ่งครึ่งคือกับดัก`, w: `ครึ่งหนึ่งของ ${x} คือ ${x / 2} แล้วบวก ${y} = ${x / 2 + y}`}; }},
  {id: 't31', lv: [4, 5], mk: R => { const a = R.r(3, 12); return {q: `${a} + ${a} × 0 = ?`, a, t: 0, o: [a * 2, 1], tl: 'คิดจากซ้ายไปขวาจะได้ 0 แต่ต้องคูณก่อนบวก', w: `${a} × 0 = 0 แล้ว ${a} + 0 = ${a}`}; }},
  {id: 't32', lv: [4, 5], mk: R => { const a = R.r(15, 30), b = R.r(2, 9), c = R.r(2, 9); return {q: `${a} − ${b} + ${c} = ?`, a: a - b + c, t: a - b - c, o: [a + b - c, a - b + c + 1], tl: `บวก ${b} กับ ${c} ก่อนคือกับดัก`, w: `คิดจากซ้ายไปขวา: ${a} − ${b} = ${a - b} แล้ว + ${c} = ${a - b + c}`}; }},
  {id: 't33', lv: [4, 5], mk: R => { const a = R.r(10, 20); return {q: `เดินขึ้นบันไดจากชั้น 1 ไปชั้น 2 ใช้ ${a} ขั้น จากชั้น 1 ไปชั้น 3 ต้องเดินกี่ขั้น`, a: 2 * a, t: 3 * a, o: [a, 2 * a + 1], tl: 'ชั้น 1 ไปชั้น 3 ไม่ใช่บันได 3 ช่วง', w: `1 → 2 → 3 คือบันได 2 ช่วง: 2 × ${a} = ${2 * a} ขั้น`}; }},
  {id: 't34', lv: [4, 5], mk: R => { const h = R.r(5, 10); return {q: `หอยทากปีนกำแพงสูง ${h} เมตร กลางวันปีนขึ้น 3 เมตร กลางคืนไถลลง 2 เมตร จะถึงยอดในวันที่เท่าไร`, a: `วันที่ ${h - 2}`, t: `วันที่ ${h}`, o: [`วันที่ ${h - 1}`, `วันที่ ${h + 1}`], tl: 'คิดว่าขึ้นได้วันละ 1 เมตรตลอดทางคือกับดัก', w: `ครบ ${h - 3} วันอยู่ที่ ${h - 3} เมตร วันต่อมาปีนอีก 3 เมตรก็ถึงยอด คือวันที่ ${h - 2}`}; }},
  {id: 't35', lv: [4, 5], mk: R => { const a = R.r(6, 12), b = R.r(2, 4); return {q: `จุดเทียนไว้ ${a} เล่ม เป่าดับไป ${b} เล่ม สุดท้ายจะเหลือเทียนกี่เล่ม`, a: b, t: a - b, o: [a, 0], tl: 'เทียนที่ยังติดไฟอยู่คือเล่มที่จะละลายหมด', w: `เทียน ${b} เล่มที่ดับแล้วยังอยู่ อีก ${a - b} เล่มไหม้จนหมด`}; }},
  {id: 't36', lv: [5, 5], mk: R => { const k = R.r(2, 4), cols = ['สีแดงกับสีฟ้า', 'สีแดง สีฟ้า และสีเขียว', 'สีแดง สีฟ้า สีเขียว และสีเหลือง'][k - 2]; return {q: `ถุงเท้า${cols}ปนกันในลิ้นชักมืด ๆ ต้องหยิบอย่างน้อยกี่ข้าง ถึงจะได้คู่สีเดียวกันแน่ ๆ`, a: k + 1, t: 2, o: [k * 2, k + 2], tl: 'หยิบ 2 ข้างอาจได้คนละสี', w: `มี ${k} สี หยิบ ${k} ข้างอาจได้สีไม่ซ้ำกันเลย ข้างที่ ${k + 1} ต้องซ้ำสีใดสีหนึ่งแน่นอน`}; }},
  {id: 't37', lv: [5, 5], mk: R => { const d = R.r(2, 9); return {q: `เขียนเลข 1 ถึง 100 จะต้องเขียนเลข ${d} กี่ตัว`, a: 20, t: 10, o: [11, 19], tl: `นับแค่ ${d}, 1${d}, 2${d}… จะลืม ${d}0 ถึง ${d}9`, w: 'หลักหน่วย 10 ตัว + หลักสิบ 10 ตัว = 20 ตัว'}; }},
  {id: 't38', lv: [4, 5], mk: R => { const k = R.pick([6, 9]); return {q: `ตอน 3 โมง นาฬิกาตี 3 ครั้งใช้เวลา 2 วินาที ตอน ${k} โมง นาฬิกาตี ${k} ครั้งใช้เวลากี่วินาที`, a: k - 1, t: 2 * k / 3, o: [k, k - 2], tl: 'นับจำนวนครั้งที่ตี แทนที่จะนับช่วงห่างระหว่างครั้ง คือกับดัก', w: `ตี 3 ครั้งมี 2 ช่วง ช่วงละ 1 วินาที ตี ${k} ครั้งมี ${k - 1} ช่วง = ${k - 1} วินาที`}; }},
  {id: 't39', lv: [5, 5], mk: R => { const a = R.r(3, 6); return {q: `แมว ${a} ตัว จับหนูได้ ${a} ตัว ใน ${a} นาที ต้องใช้แมวกี่ตัว จึงจะจับหนูได้ 100 ตัว ใน 100 นาที`, a, t: 100, o: [a * 2, 10], tl: 'เลข 100 หลายตัวทำให้คิดว่าคำตอบคือ 100', w: `แมว ${a} ตัวชุดเดิมจับได้นาทีละ 1 ตัว ใน 100 นาทีก็จับได้ 100 ตัว`}; }},
  {id: 't40', lv: [5, 5], mk: R => { const k = R.r(5, 20); return {q: `ปากกากับยางลบราคารวม ${100 + 2 * k} บาท ปากกาแพงกว่ายางลบ 100 บาท ยางลบราคากี่บาท`, a: `${k} บาท`, t: `${2 * k} บาท`, o: [`${k + 5} บาท`, `${100 + k} บาท`], tl: `ถ้ายางลบ ${2 * k} บาท ปากกาจะเป็น ${2 * k + 100} บาท รวมเป็น ${4 * k + 100} บาท`, w: `ยางลบ ${k} + ปากกา ${k + 100} = ${2 * k + 100} บาท`}; }},
  {id: 't41', lv: [2, 5], mk: R => ({q: 'ไก่ตัวผู้ออกไข่บนหลังคาบ้าน ไข่จะกลิ้งลงทางไหน', a: 'ไม่มีไข่', t: 'กลิ้งลงทางซ้าย', o: ['กลิ้งลงทางขวา', 'กลิ้งลงข้างหน้า'], tl: 'การคิดว่าไข่กลิ้งทางไหนคือกับดัก', w: 'ไก่ตัวผู้ออกไข่ไม่ได้ ไก่ตัวเมียต่างหากที่ออกไข่!'})},
  {id: 't42', lv: [2, 4], mk: R => { const a = R.r(2, 6), b = R.r(2, 5); return {q: `ในบ่อมีปลา ${a} ตัว และเป็ด ${b} ตัว ในบ่อมีขารวมกี่ขา`, a: 2 * b, t: 2 * (a + b), o: [4 * b, a + b], tl: 'ปลาไม่มีขา', w: `มีแต่ขาเป็ด: ${b} × 2 = ${2 * b} ขา`}; }},
  {id: 't43', lv: [4, 5], mk: R => { const d = 2 * R.r(5, 15); return {q: `จอกแหนในบ่อเพิ่มขึ้นเป็น 2 เท่าทุกวัน และเต็มบ่อในวันที่ ${d} บ่อเต็มครึ่งหนึ่งในวันที่เท่าไร`, a: `วันที่ ${d - 1}`, t: `วันที่ ${d / 2}`, o: [`วันที่ ${d - 2}`, `วันที่ ${d / 2 + 1}`], tl: `ครึ่งหนึ่งของ ${d} วันคือกับดัก`, w: `จอกแหนเพิ่มเป็น 2 เท่าทุกวัน วันก่อนเต็มบ่อ (วันที่ ${d - 1}) จึงมีแค่ครึ่งบ่อ`}; }},
  {id: 't44', lv: [4, 5], mk: R => { const a = R.r(3, 6); return {q: `เพื่อน ${a} คน จับมือกันทุกคู่ คู่ละ 1 ครั้ง จับมือกันทั้งหมดกี่ครั้ง`, a: a * (a - 1) / 2, t: a * (a - 1), o: [a, a * a], tl: `${a} × ${a - 1} นับการจับมือซ้ำ 2 รอบ`, w: `${a} × ${a - 1} ÷ 2 = ${a * (a - 1) / 2} ครั้ง`}; }},
  {id: 't45', lv: [1, 3], mk: R => { const a = R.r(5, 12), b = R.r(2, 4); return {q: `ต้นมะม่วงมีมะม่วง ${a} ลูก ลมพัดมะพร้าวจากต้นข้าง ๆ ตกลงมา ${b} ลูก บนต้นมะม่วงเหลือมะม่วงกี่ลูก`, a, t: a - b, o: [a + b, b], tl: 'ที่ตกลงมาคือมะพร้าว ไม่ใช่มะม่วง', w: `มะม่วงไม่ได้ตกเลย ยังมี ${a} ลูก`}; }}
];
const TRICK_RANGE = {en: ['🤔 read it again', '🤔 read it again', '🤔 “all but” · “you”', '🤔 days · months · race places', '🤔 fence posts · sign order', '🤔 sure picks · count the digits'],
  th: ['🙃 อ่านให้ดี', '🙃 อ่านให้ดี', '🙃 “ยกเว้น” · “เธอ”', '🙃 วัน · เดือน · ลำดับที่', '🙃 เสารั้ว · ลำดับการคิด', '🙃 หยิบให้แน่ · นับตัวเลข']};
// answer buttons: the right one + THE trap + others (numbers fill up with near numbers), never two the same
function trickChoices(it, n){
  const S = x => String(x), right = S(it.a), out = [{w: right, ok: true}, {w: S(it.t), trap: true}], has = new Set([right, S(it.t)]);
  (it.o || []).forEach(x => { const w = S(x); if(out.length < n && !has.has(w) && !(typeof x === 'number' && x < 0)){ has.add(w); out.push({w}); } });
  for(let k = 1; out.length < n && /^\d+$/.test(right) && k < 20; k++) [Number(right) + k, Number(right) - k].forEach(v => { const w = S(v); if(out.length < n && v >= 0 && !has.has(w)){ has.add(w); out.push({w}); } });
  return shuffle(out);
}
// 🤔 one trick for this level: never one from this round, and (per player) none seen before until this level's pool is used up — then it starts again
function makeTrickQ(mode, lvl, L){
  const lang = mode === 'trickth' ? 'th' : 'en', bank = lang === 'th' ? TRICKS_TH : TRICKS_EN, pool = bank.filter(t => lvl >= t.lv[0] && lvl <= t.lv[1]);
  if(!pool.length) return null;
  const used = (G && G.mode === mode && G.tkUsed) || new Set(), seen = new Set(trickSeen[lang] || []);
  let fresh = pool.filter(t => !seen.has(t.id) && !used.has(t.id));
  if(!fresh.length){ const ids = new Set(pool.map(t => t.id)); trickSeen[lang] = (trickSeen[lang] || []).filter(id => !ids.has(id) || used.has(id)); fresh = pool.filter(t => !used.has(t.id)); }
  if(!fresh.length) fresh = pool;
  for(let k = 0; k < 40; k++){
    const t = pick(fresh), it = t.mk(trickR(lang));
    if(!it || String(it.a) === String(it.t)) continue;
    const ch = trickChoices(it, L.choices); if(ch.length < 3) continue;
    const bold = x => UI.esc(x).replace(/[0-9][0-9,]*/g, m => '<b>' + m + '</b>');
    return {trick: true, id: t.id, lang, mode, op: 'add', a: 0, b: 0, ans: 0, ask: 0, missing: '', wordAns: true, wchoices: ch, choices: ch.map(c => c.w),
      right: String(it.a), trapW: String(it.t), trapLine: it.tl, why: it.w, word: it.q, storyHtml: bold(it.q), vis: null,
      key: 'tk' + t.id + '-' + ((it.q.match(/[0-9]+/g) || []).join('_') || '0')};
  }
  return null;
}
// a trick that was SHOWN goes on the player's seen list (nextQ calls this)
function trickSaw(q){
  if(!q || !q.trick || !G) return; (G.tkUsed = G.tkUsed || new Set()).add(q.id);
  const l = trickSeen[q.lang] = (trickSeen[q.lang] || []).filter(x => x !== q.id); l.push(q.id); if(l.length > 200) l.shift();
}
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
let mode = 'classic', ansPick = 'auto', recentQ = {}, prefsTimer = 0, trickSeen = {en: [], th: []};   // ➗ mq-w3: 🤔 tricks seen per language   // ➗ mq-w1: way to play · 👆/⌨️ · 🎲 last rounds' questions
function loadPrefs(){ mode = 'classic'; ansPick = 'auto'; recentQ = {}; trickSeen = {en: [], th: []};
  try{ const s = localStorage.getItem(store('series')); if(SERIES[s]) series = s; const w = localStorage.getItem(store('world')); if(WORLDS[w]) world = w; const v = localStorage.getItem(store('voice')); voiceOn = v ? v === '1' : young(S.age);
    const m = localStorage.getItem(store('mode')); if(m && MODES.some(x => x.k === m && !x.soon)) mode = m; const a = localStorage.getItem(store('ans')); if(/^(auto|choose|type)$/.test(a || '')) ansPick = a; }catch(e){ voiceOn = young(S.age); }
  // ➗ mq-w1: the player's picks follow the PLAYER to every device (Aowu 2026-11-14) — Settings MathQuest_<Name> wins over this device
  try{ const p = JSON.parse((S.settings || {})['MathQuest_' + S.player] || 'null');
    if(p && typeof p === 'object'){ if(MODES.some(x => x.k === p.mode && !x.soon)) mode = p.mode; if(/^(auto|choose|type)$/.test(p.ans || '')) ansPick = p.ans; if(SERIES[p.series]) series = p.series; if(WORLDS[p.world]) world = p.world; if(p.recent && typeof p.recent === 'object') recentQ = p.recent;
      if(p.tricks && typeof p.tricks === 'object') ['en', 'th'].forEach(l => { if(Array.isArray(p.tricks[l])) trickSeen[l] = p.tricks[l].slice(-200).map(String); }); } }catch(e){} }   // ➗ mq-w3
function savePrefs(){ try{ localStorage.setItem(store('series'), series); localStorage.setItem(store('world'), world); localStorage.setItem(store('voice'), voiceOn ? '1' : '0'); localStorage.setItem(store('mode'), mode); localStorage.setItem(store('ans'), ansPick); }catch(e){}
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
if(window.UI && UI.GAME_HELP) UI.GAME_HELP['math-quest'] = ['Answer maths questions in 5 worlds — with numbers, in English words (🔤 Word Sums) or in Thai words (🐘 เลขคำไทย).', 'Spot the trap in 🤔 Trick Questions (English) or 🙃 คำถามหลอก (ไทย) — think twice before you tap!', 'Solve real-life 📖 Story Problems (English) or 📜 โจทย์ปัญหา (ไทย) — money, minutes and 1–3 steps, with a 🪜 steps line after each answer.', 'Tap the answer — or ⌨️ type it on the number pad (from ⚡ Hard, ×1.25 points).', 'Try ⏱️ Minute Challenge: how many in 60 seconds?'];   // ➗ mq-w1: page copy until the UiKit lane moves it in

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
  ['series-head', 'series-list', 'ans-head', 'ans-list'].forEach(id => $(id).classList.toggle('hidden', minute || isTrickMode(mode)));   // ➗ mq-w3: tricks have their own maths + are always tapped
  let n = 0; document.querySelectorAll('#scr-menu .section-head').forEach(h => { if(h.classList.contains('hidden')) return; const sn = h.querySelector('.sn'); if(sn) sn.textContent = (++n) + '.'; });
  $('lvl-head').querySelector('.lt').textContent = minute ? 'Start the race' : 'Pick a level';
}
function renderAns(){
  $('ans-list').innerHTML = ANS_WAYS.map(a => '<button class="chip ans-chip' + (a.k === ansPick ? ' on' : '') + '" data-sound="pop" data-ans="' + a.k + '"><span class="ic">' + a.icon + '</span>' + a.name + '<small>' + a.sub + '</small></button>').join('');
  $('ans-list').querySelectorAll('[data-ans]').forEach(b => b.onclick = () => { ansPick = b.dataset.ans; savePrefs(); $('ans-list').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); });
}
function rangeText(L){
  if(isWordMode(mode)) return wordRange(L);   // ➗ mq-w1
  if(isStoryMode(mode)) return storyRange(L);  // ➗ mq-w2
  if(isTrickMode(mode)) return TRICK_RANGE[mode === 'trickth' ? 'th' : 'en'][Math.max(0, LEVELS.indexOf(L))];   // ➗ mq-w3
  if(series === 'mul') return L.tables ? '✖️ tables ' + L.tables.join(' ') + (L.big ? ' + big ones' : '') : '✖️ up to ' + L.mul[0] + ' × ' + L.mul[1] + (L.big ? ' + big ones' : '');
  if(series === 'div') return L.tables ? '➗ share by ' + L.tables.join(' ') : '➗ up to ' + (L.div[0] * L.div[1]) + ' ÷ ' + L.div[0];
  return SERIES[series].icon + ' up to ' + L.add;
}
function storyRange(L){ const i = Math.max(0, LEVELS.indexOf(L)), th = mode === 'storyth', n = ['1', '1', '1', '2', '2–3', '3'][i], cap = STORY_CAP[i].toLocaleString();   // ➗ mq-w2
  return (th ? '📜 ' + n + ' ขั้น · ถึง ' + cap + (i >= 3 ? ' · 🪙 บาท ⏰ นาที' : '') + (i >= 4 ? ' · 🙈 เลขหลอก' : '') : '📖 ' + n + (n === '1' ? ' step' : ' steps') + ' · up to ' + cap + (i >= 3 ? ' · 🪙 baht ⏰ minutes' : '') + (i >= 4 ? ' · 🙈 extra number' : '')); }
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
      '<div class="lives">' + L.qs + ' questions · ⏱ ' + fmt(L.time * 1000 * modeTime(mode)) + (L.hardcore ? ' · 💀 1 mistake' : '') + '</div>' +
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
  G = {mode: md, recent, keys: [], seen: new Set(), way: 'choose', typed: '', wordRight: 0, thaiRight: 0, typedRight: 0, storyRight: 0, trickRight: 0, tkUsed: new Set(),
    lvl, L, series: ch ? 'mix' : isTrickMode(md) ? 'add' : series, world, challenge: ch, age: S.age, qi: 0, q: null, right: 0, wrong: 0, streak: 0, bestStreak: 0, score: 0, hints: L.hardcore ? 0 : 3, usedHint: false,
    locked: false, over: false, t0: performance.now(), paused: false, pausedAt: 0, pausedTotal: 0, limit: L.time * 1000 * modeTime(md), answers: []};   // ➗ mq-w2: 📖 ×1.7
  const sp = $('scr-play'); sp.style.setProperty('--w1', W.c[0]); sp.style.setProperty('--w2', W.c[1]); sp.classList.toggle('dark', !!W.dark);
  BAR.level((isWordMode(md) || isStoryMode(md) || isTrickMode(md) ? modeOf(md).icon + ' ' : '') + L.emoji + ' ' + L.name + (isTrickMode(md) ? ' · ' : ' · ' + SERIES[G.series].icon + ' ') + W.icon, L.hardcore ? 'hc' : '');
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
  G.seen.add(q.key); G.keys.push(q.key); trickSaw(q);   // ➗ mq-w3
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
  $('word').classList.toggle('story', !!(q.story || q.trick)); $('word').classList.toggle('th', !!(q.story || q.trick) && th);   // ➗ mq-w2 📖
  if(q.story){ $('word').innerHTML = q.storyHtml; eq.className = 'eq eqs' + (th ? ' th' : ''); eq.innerHTML = '<span class="q" id="qmark">?</span> <span class="unit">' + UI.esc(th ? q.unit.t : q.unit.e) + '</span>'; }
  if(q.trick){ $('word').innerHTML = q.storyHtml; eq.className = 'eq eqs eqt' + (th ? ' th' : ''); eq.innerHTML = '<span class="q" id="qmark">?</span>'; }   // ➗ mq-w3 🤔
  $('hintline').classList.add('hidden'); $('hintline').classList.remove('steps', 'trickl', 'trickok');
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
  fitStory();   // ➗ mq-w2
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
  G.answers.push({q: q.trick ? q.id : q.a + SERIES[q.op].sym + q.b, ok});
  if(typed){ const d = $('pad-disp'); if(d){ d.classList.add(ok ? 'right' : 'wrong'); if(!ok) d.textContent = G.typed + ' ✗ ' + q.ask.toLocaleString(); } }
  else $('answers').querySelectorAll('.ans').forEach(b => { if(rightBtn(b, q)) b.classList.add(ok ? 'right' : 'show'); });
  const mark = $('qmark');
  if(ok){
    G.right++; if(!G.usedHint) G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak);
    if(G.mode === 'worden') G.wordRight++; if(G.mode === 'wordth') G.thaiRight++; if(typed) G.typedRight++;   // ➗ mq-w1 feats
    if(q.trick){ G.trickRight++; const hl = $('hintline'); hl.textContent = (q.lang === 'th' ? '🕵️ จับได้! ' : '🕵️ You spotted the trick! ') + q.why; hl.classList.add('steps', 'trickok'); hl.classList.remove('hidden'); fitStory(); }   // ➗ mq-w3 🤔
    if(q.story){ G.storyRight++; const hl = $('hintline'); hl.textContent = stepsText(q); hl.classList.add('steps'); hl.classList.remove('hidden'); fitStory(); }   // ➗ mq-w2 🪜
    const pts = Math.round((100 * (G.lvl + 1) + Math.min(G.streak, 20) * 10 * (G.lvl + 1)) * (G.L.hardcore ? 3 : 1) * (G.usedHint ? 0.5 : 1) * seriesMult() * modeMult() * (typed ? TYPED_MULT : 1));
    G.score += pts; if(btn){ floatText(btn, '+' + pts); sparkle(btn); }
    if(mark){ mark.textContent = shownAns(q); mark.classList.add('got'); }
    UISound.play('success'); mascot('happy'); cheerSay(q.trick || [5, 10, 15].includes(G.streak) ? 'big' : 'goal', 'right'); /* 📣 cs-4b */
    if([3, 5, 10, 15].includes(G.streak)){ showBanner('🔥 ' + G.streak + ' in a row!', 'gold'); if(G.streak >= 5) UISound.play('unlock'); }
    else if(voiceOn) speak(pick(q.lang === 'th' ? RIGHT_TH : RIGHT_WORDS), q.lang);
  } else {
    G.wrong++; G.streak = 0; if(btn && !typed) btn.classList.add('wrong'); UISound.play('error'); mascot('sad'); cheerSay('miss', 'wrong'); /* 📣 cs-4b */
    const card = $('qcard'); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    if(mark) mark.textContent = shownAns(q);
    const word = q.wordAns || q.form === 'w2n', hl = $('hintline');
    hl.textContent = (q.lang === 'th' ? 'คำตอบคือ ' : 'The answer is ') + (word ? '“' + wordsOf(q.ask, q.lang) + '” (' + q.ask.toLocaleString() + ')' : q.ask.toLocaleString()) + ' — ' + explain(q); hl.classList.remove('hidden');
    if(q.story){ hl.classList.add('steps'); fitStory(); }   // ➗ mq-w2
    if(q.trick){ const c = how === 'word' ? q.wchoices[v] : null, got = !!(c && c.trap), th = q.lang === 'th';   // ➗ mq-w3: 😜 Gotcha + 🤔 trap line + ✅ why
      hl.textContent = (got ? (th ? '😜 โดนหลอกแล้ว! ' : '😜 Gotcha! ') : '') + '🤔 ' + q.trapLine + '  ✅ ' + (th ? 'คำตอบคือ “' : 'The answer is “') + q.right + '” — ' + q.why;
      hl.classList.add('steps', 'trickl'); fitStory(); if(got) showBanner(th ? '😜 โดนหลอกแล้ว!' : '😜 Gotcha!'); }
    if(voiceOn) speak(q.trick ? (q.lang === 'th' ? 'คำตอบคือ ' : 'The answer is ') + q.right : q.lang === 'th' ? 'คำตอบคือ ' + wordsTH(q.ask) : 'The answer is ' + q.ask, q.lang);
    if(G.L.hardcore){ hud(); setTimeout(() => finishGame('hardcore'), q.trick ? 3400 : q.story ? 2600 : 1300); return; }
  }
  G.qi++; hud();
  setTimeout(() => { if(!G || G.over) return; if(G.qi >= G.L.qs) finishGame('done'); else nextQ(); }, ok ? (G.challenge ? 350 : q.trick ? 2400 : q.story ? 1800 : 650) : (G.challenge ? 900 : q.trick ? 3800 : q.story ? 2800 : 1500));   // ➗ mq-w2: time to read the 🪜 steps
}
function explain(q){
  if(q.steps) return stepsText(q);   // ➗ mq-w2 🪜
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
function sayQ(){ if(G && G.q){ if(G.q.lang === 'th') sayTH(G.q.story || G.q.trick ? G.q.word : thaiSayText(G.q)); else say(sayText(G.q)); } }   // ➗ mq-w2: 📜 Thai stories in the Thai voice   // ➗ mq-w1: Thai sums in the Thai voice
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
  if(g.storyRight) stats.storyRight = g.storyRight;   // ➗ mq-w2
  if(g.trickRight) stats.trickRight = g.trickRight;   // ➗ mq-w3
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
    showResult('<div class="big">' + (cleared ? (g.wrong === 0 ? '💯' : '🏆') : why === 'hardcore' ? '💀' : W.mascot) + '</div><h2 class="' + (cleared ? 'cheer' : '') + '">' + title + '</h2>' +
      (cleared ? '<div class="rating">' + [0, 1, 2].map(k => '<span class="st' + (k < stars ? '' : ' off') + '" style="animation-delay:' + (0.25 + k * 0.25) + 's">⭐</span>').join('') + '</div>' : '') +
      '<div class="score-big">🏆 <span id="score-count">0</span></div>' +
      '<div class="stats"><span>✅ ' + g.right + ' / ' + L.qs + '</span><span>🔥 best ' + g.bestStreak + '</span><span>⏱ ' + fmt(secs * 1000) + '</span>' + (bonus ? '<span>⚡ time bonus ' + bonus.toLocaleString() + '</span>' : '') + (L.hardcore ? '<span>💀 ×3</span>' : '') + (isWordMode(g.mode) || isStoryMode(g.mode) || isTrickMode(g.mode) ? '<span>' + modeOf(g.mode).icon + ' ' + modeOf(g.mode).name + ' ×' + MODE_MULT[g.mode] + '</span>' : '') + (g.typedRight ? '<span>⌨️ typed ' + g.typedRight + ' ×' + TYPED_MULT + '</span>' : '') + '</div>' +
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
