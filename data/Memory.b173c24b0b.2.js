
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ modes-3: ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const GAME_ID = 'memory';
const MM_VERSION = '3.4';   // 🃏 mm-1: shown on the cover footer — bump with each Memories Match round
// 🎛️ p1b: the shared top bar (UiKit UI.gameBar) — ◀ where you came from · 🎚️ Levels · 🏠 | 🃏 Memories Match · level | scoreboard | game buttons ❓ ⚙️
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🃏', name: 'Memories Match', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => { try{ clearInterval(timerId); }catch(e){} try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => { if(typeof pauseGame === 'function') pauseGame(); }, resume: () => { if(typeof resume === 'function') resume(); }},
  onFit: () => { if(G && typeof layout === 'function') layout(); },
  extras: []});
var NAV_INNER = {menu: ['◀ Memories Match', () => openCover()], link: ['◀ Memories Match', () => lxExit()]};   // 📡 mm-4: + link   // 🧱 mm-1: the setup's top button goes back to the 🎬 cover
UI.navBar(document.getElementById('back-btn'), {onclick: false});
const $ = id => document.getElementById(id);
const pick = a => a[rnd(a.length)];
const FAST = () => !!window.MM_FAST;   // tests: every wait / animation instant
const wait = ms => new Promise(r => setTimeout(r, FAST() ? 0 : ms));
function fmt(ms){ const s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function say(text){ try{ if(!UISound.get().enabled || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1.05; u.pitch = 1.2; speechSynthesis.speak(u); }catch(e){} }
function shuffle(a){ for(let i = a.length - 1; i > 0; i--){ const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ================= 🗺️ MAPS × 🎚️ LEVELS (mm-1, plan `claude/memories-match-plan.md` §2–§3) ================= */
// a map = the grid; a level = how tricky. 10×10 only on tablets / computers (phones max 8×8).
const MAPS = [
  {k: '4', icon: '🟩', name: '4×4', n: 4, mult: 1, par: 45},
  {k: '6', icon: '🟨', name: '6×6', n: 6, mult: 2, par: 120},
  {k: '8', icon: '🟧', name: '8×8', n: 8, mult: 3.5, par: 270},
  {k: '10', icon: '🟥', name: '10×10', n: 10, mult: 5, par: 450, big: true}
];
// peek = s face-up at the start · show = ms a wrong pair stays up · swaps after a miss (glow = they glow first) · look = look-alike amount
const LEVELS = [
  {name: 'Basic', emoji: '🌱', peek: 5, show: 2000, swaps: 0, look: 0, seen: true, guide: true, mult: 1, blurb: 'Peek first · helping hand'},
  {name: 'Junior', emoji: '🐣', peek: 3, show: 1600, swaps: 0, look: 0, seen: true, mult: 1.3, blurb: 'A short peek · 👁️ seen-dots'},
  {name: 'Intermediate', emoji: '🔦', peek: 1, show: 1200, swaps: 0, look: 1, mult: 1.6, blurb: 'A 1-second flash · look-alikes'},
  {name: 'Hard', emoji: '⚡', peek: 0, show: 1000, swaps: 1, glow: true, look: 2, mult: 1.9, blurb: 'Miss → 2 cards glow + swap'},
  {name: 'Extreme', emoji: '🌋', peek: 0, show: 800, swaps: 1, glow: false, look: 3, mult: 2.2, blurb: 'Miss → a hidden swap'},
  {name: 'Hardcore', emoji: '💀', reveal: true, show: 600, swaps: 2, glow: false, look: 4, mult: 2.5, hardcore: true, blurb: 'See all → 🌀 scramble · 2 swaps a miss'}
];
const REVEAL_S = {4: 3, 6: 4, 8: 5, 10: 6};   // 💀 seconds every card shows before the scramble
/* ================= 🎴 DECKS — ≥ 56 faces each + look-alike groups (🔦+) · 🎲 Mix = every deck ================= */
const DECKS = {
  monsters: {name: 'Monsters', icon: '👾', back: 'linear-gradient(135deg,#7B2FF7,#2EC4B6)', mark: '👾', cards: ['👾', '👹', '👺', '👻', '👽', '🤖', '🎃', '🧟', '🧛', '🧙', '🧞', '🧜', '🐉', '🦖', '🦕', '😈', '🤡', '🦄', '🧌', '🕷️', '🦂', '🐙', '🦑', '🐊', '🐍', '🦇', '🐺', '🦉', '🐲', '🦈', '🧚', '🦹',
    '💀', '☠️', '👿', '🕸️', '🐛', '🦗', '🪲', '🦟', '🦠', '🦎', '🦀', '🦞', '🐡', '🐌', '🐀', '🐗', '🦍', '🦅', '🌚', '🔮', '⚰️', '🪦', '🧪', '🌋', '🧙‍♀️', '🧞‍♀️', '🧛‍♀️', '🧟‍♀️', '🦴', '🧿', '🍄', '🦷'],
    like: [['👻', '💀', '☠️'], ['🧙', '🧙‍♀️'], ['🧞', '🧞‍♀️'], ['🧛', '🧛‍♀️'], ['🧟', '🧟‍♀️'], ['🐉', '🐲'], ['🦖', '🦕'], ['😈', '👿'], ['👹', '👺'], ['🦑', '🐙'], ['🐊', '🦎'], ['🦀', '🦞']]},
  heroes: {name: 'Heroes', icon: '🦸', back: 'linear-gradient(135deg,#E63946,#FFB703)', mark: '⭐', cards: ['🦸', '🦹', '🧙', '🧚', '🥷', '👸', '🤴', '🧝', '👮', '🧑‍🚒', '🧑‍🚀', '🕵️', '👷', '🧑‍⚕️', '💂', '🤠', '🧞', '🧜‍♀️', '🛡️', '⚔️', '🏹', '🪄', '👑', '🦾', '🚀', '🔱', '🧲', '💎', '🔥', '⚡', '🌟', '🏆',
    '🦸‍♀️', '🦹‍♀️', '🧝‍♀️', '👩‍🚀', '👩‍🚒', '👮‍♀️', '🕵️‍♀️', '👷‍♀️', '👩‍⚕️', '🧑‍🔧', '🗡️', '🪃', '🎖️', '🏅', '🥇', '🪖', '⛑️', '🎯', '🧭', '🪓', '🔦', '🗝️', '💍', '🦅', '🐎', '🧑‍🏫', '🏰', '⚜️', '🧯', '🦺', '⚓', '🔔', '🪢'],
    like: [['🦸', '🦸‍♀️'], ['🦹', '🦹‍♀️'], ['🧝', '🧝‍♀️'], ['🧑‍🚀', '👩‍🚀'], ['🧑‍🚒', '👩‍🚒'], ['👮', '👮‍♀️'], ['🕵️', '🕵️‍♀️'], ['👷', '👷‍♀️'], ['🧑‍⚕️', '👩‍⚕️'], ['🏆', '🏅', '🥇', '🎖️'], ['⚔️', '🗡️'], ['👸', '🤴']]},
  animals: {name: 'Animals', icon: '🐶', back: 'linear-gradient(135deg,#4CB963,#FFC845)', mark: '🐾', cards: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦉', '🐴', '🦄', '🐝', '🦋', '🐢', '🐙', '🐬', '🐳', '🦒', '🐘', '🦓', '🦔',
    '🐕', '🐩', '🐈', '🐁', '🐇', '🐿️', '🦫', '🦦', '🦥', '🐆', '🐅', '🐃', '🐂', '🐄', '🐖', '🐏', '🐑', '🐐', '🦌', '🐓', '🐤', '🐣', '🦚', '🦜', '🦢', '🦩', '🐟', '🐠', '🐡', '🦭', '🐪', '🦘', '🐋', '🦏', '🦛', '🦙', '🦨', '🦡', '🐞', '🦃'],
    like: [['🐶', '🐕', '🐩'], ['🐱', '🐈'], ['🐭', '🐁'], ['🐰', '🐇'], ['🐯', '🐅', '🐆'], ['🐮', '🐄', '🐂', '🐃'], ['🐷', '🐖'], ['🐔', '🐓', '🐤', '🐣'], ['🐑', '🐏', '🐐'], ['🐟', '🐠', '🐡'], ['🐳', '🐋', '🐬'], ['🦚', '🦜']]},
  people: {name: 'People', icon: '🧑', back: 'linear-gradient(135deg,#FF8FB1,#7B5FE0)', mark: '😊', cards: ['👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👵', '👴', '🎅', '🤶', '🧑‍🍳', '🧑‍🎨', '🧑‍🏫', '🧑‍🌾', '🧑‍🔬', '🧑‍💻', '🧑‍🎤', '🧑‍✈️', '🙋', '💃', '🕺', '🤹', '🏄', '🚴', '🧗', '⛹️', '🤸', '🧘', '🏊', '🤿', '🛹',
    '👱', '👱‍♀️', '🧔', '👩‍🦰', '👨‍🦲', '👩‍🦱', '👨‍🦳', '🧑‍🔧', '🧑‍🏭', '🧑‍💼', '🧑‍⚖️', '🤾', '🏌️', '🏇', '⛷️', '🏂', '🤽', '🚣', '🏋️', '🤺', '🧑‍🎓', '👰', '🤵', '🧕', '👲', '🧑‍🍼', '🙆', '🤷', '💁', '🧏', '🙇', '🤦', '🧑‍🎄'],
    like: [['👧', '🧒', '👦'], ['👩', '🧑', '👨'], ['👵', '👴'], ['🎅', '🤶'], ['🏄', '🚣', '🤽'], ['🚴', '🏇'], ['⛷️', '🏂'], ['🤸', '🤾'], ['💃', '🕺'], ['👱', '👱‍♀️'], ['👰', '🤵']]},
  vehicles: {name: 'Vehicles', icon: '🚗', back: 'linear-gradient(135deg,#3A86FF,#06D6A0)', mark: '🛞', cards: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍️', '🚲', '🛴', '🚂', '🚆', '🚇', '🚊', '✈️', '🚁', '🛸', '🚀', '⛵', '🚤', '🛳️', '🚢', '🚠', '🛶',
    '🚘', '🚖', '🚍', '🚔', '🚝', '🚞', '🚋', '🚃', '🚄', '🚅', '🚈', '🛩️', '🛫', '🛬', '🪂', '🚟', '🚡', '🛺', '🛼', '⛴️', '🛥️', '🚧', '⛽', '🚦', '🛞', '🏁', '🚏', '🛣️', '🛤️', '🚨', '🧳', '🎢', '🎡', '🗺️', '🚥'],
    like: [['🚗', '🚘'], ['🚕', '🚖'], ['🚓', '🚔'], ['🚌', '🚍'], ['🚆', '🚄', '🚅'], ['🚂', '🚃', '🚋'], ['✈️', '🛩️', '🛫', '🛬'], ['🚤', '🛥️', '⛴️'], ['🚠', '🚡', '🚟'], ['🚚', '🚛']]},
  space: {name: 'Space', icon: '🚀', back: 'linear-gradient(135deg,#1A1440,#6B3BE0)', mark: '✨', cards: ['🚀', '🛸', '🌍', '🌕', '🌙', '⭐', '🌟', '☀️', '🪐', '☄️', '🌌', '👽', '🛰️', '🔭', '🧑‍🚀', '🌑', '🌓', '🌠', '💫', '✨', '🌈', '⚡', '🌎', '🌏', '🌛', '🌝', '🌞', '❄️', '🔥', '💧', '🌪️', '🌋',
    '🌒', '🌔', '🌖', '🌗', '🌘', '🌜', '🌚', '🌐', '☁️', '⛅', '🌤️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '☃️', '⛄', '🌡️', '🔆', '🌅', '🌄', '🎆', '🎇', '💥', '🧊', '🌀', '🌫️', '🌬️', '☔', '🌊', '🪨', '🏔️', '🌁', '🌃', '📡', '🧲', '🌂', '🕳️'],
    like: [['🌑', '🌒', '🌓', '🌔', '🌕'], ['🌍', '🌎', '🌏'], ['⭐', '🌟', '✨', '💫'], ['🌙', '🌛', '🌜'], ['☀️', '🌞', '🔆'], ['☁️', '⛅', '🌤️'], ['🌧️', '⛈️', '🌩️'], ['🎆', '🎇'], ['☃️', '⛄'], ['🌅', '🌄']]}
};
// 🎲 Mix (the default deck): every deck's faces in one big box, look-alike groups kept (a face sits in one group only)
(function(){
  const cards = [], like = [], seen = new Set();
  Object.keys(DECKS).forEach(k => DECKS[k].cards.forEach(f => { if(!seen.has(f)){ seen.add(f); cards.push(f); } }));
  const inG = new Set(); Object.keys(DECKS).forEach(k => DECKS[k].like.forEach(g => { const m = g.filter(f => !inG.has(f)); if(m.length >= 2){ m.forEach(f => inG.add(f)); like.push(m); } }));
  DECKS.mix = {name: 'Mix', icon: '🎲', back: 'linear-gradient(135deg,#9B5DE5,#F15BB5 50%,#00BBF9)', mark: '🃏', cards, like, mix: true};
})();
const DECK_KEYS = ['mix', 'family', 'monsters', 'heroes', 'animals', 'people', 'vehicles', 'space'];
/* ================= 🔗 STEAM PAIRS (mm-5) — two DIFFERENT cards that belong together =================
   A STEAM face is a string that carries its own picture, so every 📡 linked device draws it the same: 'st|<pair key>|<emoji>|<word>|<look>'
   (look: n = number text · d = dots · s = shadow · b = baby card). Two cards match when their pair KEY is the same (keyOf).
   Fair deals: a pair is skipped when any of its pictures / words is already on the board (no 🐔 twice, no "8" twice). */
const ST_DECKS = {
  smix: {name: 'STEAM Mix', icon: '🎲', back: 'linear-gradient(135deg,#06D6A0,#118AB2 50%,#9B5DE5)', mark: '🔗', mini: ['3+4', '🐣', '🔑', '🪐'], mix: true},
  num: {name: 'Numbers', icon: '🔢', back: 'linear-gradient(135deg,#FF9F1C,#FFBF69)', mark: '➕', mini: ['3+4', '7', '6×7', '42']},
  babies: {name: 'Animals + babies', icon: '🐣', back: 'linear-gradient(135deg,#7BD389,#F6E27F)', mark: '🍼', mini: ['🐔', '🐣', '🐄', '🍼']},
  shadow: {name: 'Shadows', icon: '🌑', back: 'linear-gradient(135deg,#2B2D42,#8D99AE)', mark: '🌗', mini: ['🐘', '⬛', '🦒', '⬛']},
  together: {name: 'Go together', icon: '🔑', back: 'linear-gradient(135deg,#EF476F,#FFD166)', mark: '🧩', mini: ['🔑', '🔒', '🐝', '🍯']},
  space: {name: 'Space facts', icon: '🪐', back: 'linear-gradient(135deg,#1A1440,#3A0CA3)', mark: '🌟', mini: ['🪐', 'Saturn', '🔴', 'Mars']},
  words: {name: 'Words', icon: '🔤', back: 'linear-gradient(135deg,#4361EE,#4CC9F0)', mark: '🔤', mini: ['A', 'a', '🍎', 'apple']}
};
const ST_KEYS = ['smix', 'num', 'babies', 'shadow', 'together', 'space', 'words'];
const ST_TIER = [1, 2, 3, 4, 5, 5];   // 🌱 → 💀: the hardest pairs a level may use (easier ones still come too) · tier 1 = pictures / letter shapes only (no reading)
// [emoji A, word A, emoji B, word B, tier] — tier 1 = no reading needed (🌱 / 4-year-olds)
const ST_RAW = {
  babies: [['🐔', 'hen', '🐣', 'chick', 1], ['🦋', 'butterfly', '🐛', 'caterpillar', 1], ['🐄', 'cow', '', 'calf', 2], ['🐶', 'dog', '', 'puppy', 2], ['🐱', 'cat', '', 'kitten', 2],
    ['🐑', 'sheep', '', 'lamb', 2], ['🐷', 'pig', '', 'piglet', 2], ['🦆', 'duck', '', 'duckling', 2], ['🐴', 'horse', '', 'foal', 3], ['🐰', 'rabbit', '', 'bunny', 2],
    ['🐸', 'frog', '', 'tadpole', 3], ['🐻', 'bear', '', 'cub', 3], ['🐐', 'goat', '', 'kid', 3], ['🦘', 'kangaroo', '', 'joey', 3], ['🦉', 'owl', '', 'owlet', 4],
    ['🦌', 'deer', '', 'fawn', 4], ['🦅', 'eagle', '', 'eaglet', 4], ['🦭', 'seal', '', 'pup', 4], ['🦊', 'fox', '', 'kit', 5], ['🦢', 'swan', '', 'cygnet', 5], ['🐟', 'fish', '', 'fry', 5], ['🦃', 'turkey', '', 'poult', 5]],
  together: [['🔑', 'key', '🔒', 'lock', 1], ['⚽', 'ball', '🥅', 'goal', 1], ['🐝', 'bee', '🍯', 'honey', 1], ['🦷', 'tooth', '🪥', 'toothbrush', 1], ['🐶', 'dog', '🦴', 'bone', 1],
    ['🐰', 'rabbit', '🥕', 'carrot', 1], ['🐒', 'monkey', '🍌', 'banana', 1], ['🌧️', 'rain', '☂️', 'umbrella', 1], ['🐄', 'cow', '🥛', 'milk', 2], ['🐔', 'hen', '🥚', 'egg', 2],
    ['🧦', 'sock', '👟', 'shoe', 2], ['🎣', 'rod', '🐟', 'fish', 2], ['🧲', 'magnet', '📎', 'clip', 2], ['❄️', 'snow', '🧤', 'gloves', 2], ['🔦', 'torch', '🔋', 'battery', 2],
    ['✉️', 'letter', '📮', 'postbox', 3], ['🚗', 'car', '⛽', 'fuel', 3], ['🎨', 'paint', '🖌️', 'paintbrush', 3], ['🧵', 'thread', '🪡', 'needle', 3], ['🕷️', 'spider', '🕸️', 'web', 3],
    ['🐦', 'bird', '🪺', 'nest', 3], ['🥄', 'spoon', '🥣', 'bowl', 3], ['🎂', 'cake', '🕯️', 'candle', 3], ['😎', 'sunny', '🕶️', 'sunglasses', 4], ['🐑', 'sheep', '🧶', 'wool', 4],
    ['🏹', 'bow', '🎯', 'target', 4], ['🧽', 'sponge', '🫧', 'bubbles', 4], ['🪁', 'kite', '🌬️', 'wind', 4], ['🐛', 'caterpillar', '🍃', 'leaf', 4], ['🔩', 'bolt', '🔧', 'spanner', 4],
    ['🐿️', 'squirrel', '🌰', 'nut', 5], ['🐼', 'panda', '🎋', 'bamboo', 5], ['🐧', 'penguin', '🧊', 'ice', 5], ['🐫', 'camel', '🏜️', 'desert', 5], ['🦫', 'beaver', '🪵', 'log', 5], ['🌋', 'volcano', '🔥', 'lava', 5]],
  space: [['🌙', '', '', 'Moon', 2], ['☀️', '', '', 'Sun', 2], ['⭐', '', '', 'star', 2], ['🚀', '', '', 'rocket', 2], ['🌍', '', '', 'Earth', 2], ['🪐', '', '', 'Saturn', 2],
    ['☄️', '', '', 'comet', 2], ['🛸', '', '', 'UFO', 2], ['🔭', '', '', 'telescope', 2], ['🛰️', '', '', 'satellite', 3], ['🧑‍🚀', '', '', 'astronaut', 2], ['🌠', '', '', 'shooting star', 3],
    ['🌌', '', '', 'galaxy', 3], ['', 'Red planet', '🔴', 'Mars', 3], ['', 'Biggest planet', '🟠', 'Jupiter', 4], ['', 'Closest to the Sun', '🟤', 'Mercury', 4], ['', 'Hottest planet', '🟡', 'Venus', 4],
    ['🌕', '', '', 'full moon', 4], ['🌑', '', '', 'new moon', 4], ['🌓', '', '', 'half moon', 5], ['', 'How many planets?', '', '8', 5], ['', 'Sunlight to Earth', '', '8 minutes', 5],
    ['', 'Blue ice giant', '🔵', 'Neptune', 5], ['', 'Tipped-over planet', '💠', 'Uranus', 5], ['', 'Dwarf planet', '⚪', 'Pluto', 5]],
  words: [['', 'A', '', 'a', 1], ['', 'B', '', 'b', 1], ['', 'D', '', 'd', 1], ['', 'E', '', 'e', 1], ['', 'G', '', 'g', 1], ['', 'H', '', 'h', 1], ['', 'M', '', 'm', 1], ['', 'N', '', 'n', 1],
    ['', 'Q', '', 'q', 1], ['', 'R', '', 'r', 1], ['', 'T', '', 't', 1], ['', 'F', '', 'f', 1],
    ['🍎', '', '', 'apple', 2], ['☀️', '', '', 'sun', 2], ['🚗', '', '', 'car', 2], ['🌳', '', '', 'tree', 2], ['🏠', '', '', 'house', 2], ['🐝', '', '', 'bee', 2], ['🧢', '', '', 'cap', 2], ['🛏️', '', '', 'bed', 2],
    ['🦋', '', '', 'butterfly', 3], ['🐘', '', '', 'elephant', 3], ['🌈', '', '', 'rainbow', 3], ['🍉', '', '', 'watermelon', 3], ['🚂', '', '', 'train', 3], ['✏️', '', '', 'pencil', 3], ['🎈', '', '', 'balloon', 3], ['🍓', '', '', 'strawberry', 3],
    ['', 'hot', '', 'cold', 4], ['', 'big', '', 'small', 4], ['', 'up', '', 'down', 4], ['', 'day', '', 'night', 4], ['', 'happy', '', 'sad', 4], ['', 'fast', '', 'slow', 4], ['', 'open', '', 'closed', 4],
    ['', 'wet', '', 'dry', 4], ['', 'full', '', 'empty', 4], ['', 'tall', '', 'short', 4], ['', 'push', '', 'pull', 4], ['', 'first', '', 'last', 4],
    ['', 'แมว', '', 'cat', 5], ['', 'หมา', '', 'dog', 5], ['', 'ปลา', '', 'fish', 5], ['', 'ช้าง', '', 'elephant', 5], ['', 'บ้าน', '', 'house', 5], ['', 'ดาว', '', 'star', 5],
    ['', 'ฝน', '', 'rain', 5], ['', 'ไฟ', '', 'fire', 5], ['', 'น้ำ', '', 'water', 5], ['', 'ดอกไม้', '', 'flower', 5], ['', 'ส้ม', '', 'orange', 5], ['', 'ภูเขา', '', 'mountain', 5]]
};
// 🌑 Shadows: the picture ↔ its black shadow — only shapes that stay different as a shadow (never 🍎 / 🍅 lookalikes)
const ST_SHADOW = [['🐘', 1], ['🦒', 1], ['✈️', 1], ['⭐', 1], ['🌙', 1], ['🔑', 1], ['☂️', 1], ['🎸', 1], ['🚲', 1], ['🐢', 1], ['🦀', 1], ['🐙', 1], ['🌵', 1], ['⚓', 1], ['🍌', 1], ['🎈', 1],
  ['🦕', 2], ['🐇', 2], ['🦋', 2], ['🍄', 2], ['🏠', 2], ['🔔', 2], ['✂️', 2], ['🦆', 2], ['🐌', 2], ['🐬', 2], ['🚀', 2], ['🎩', 2], ['👓', 2], ['🪁', 2], ['🍐', 2], ['🥕', 2],
  ['🐎', 3], ['🦌', 3], ['🦜', 3], ['🦩', 3], ['🐊', 3], ['🦈', 3], ['🚁', 3], ['⛵', 3], ['🏰', 3], ['🔨', 3], ['🧸', 3], ['🥄', 3],
  ['🐕', 4], ['🐈', 4], ['🐁', 4], ['🐿️', 4], ['🦔', 4], ['🦨', 4], ['🦡', 4], ['🐓', 5], ['🦃', 5], ['🦚', 5], ['🦢', 5], ['🕊️', 5], ['🦤', 5]];
const ST_PAIRS = {};
(function(){
  Object.keys(ST_RAW).forEach(dk => { ST_PAIRS[dk] = ST_RAW[dk].map((r, i) => ({k: dk[0] + dk[1] + i, t: r[4], dk, a: {e: r[0], w: r[1], fl: ''}, b: {e: r[2], w: r[3], fl: dk === 'babies' && !r[2] ? 'b' : ''}})); });
  ST_PAIRS.shadow = ST_SHADOW.map((r, i) => ({k: 'sh' + i, t: r[1], dk: 'shadow', a: {e: r[0], w: '', fl: ''}, b: {e: r[0], w: '', fl: 's'}}));
})();
// 🔢 Numbers are made fresh every game — one pair per VALUE, so two cards with the same value are always the pair
function stNumPairs(lvl){
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), out = [], X = '×', M = '−', D = '÷';
  const mk = (v, A, B, fa, fb) => ({k: 'nu' + v, t: lvl + 1, dk: 'num', v, a: {e: '', w: A, fl: fa || 'n'}, b: {e: '', w: B, fl: fb || 'n'}});
  const sum = v => { const a = R(Math.max(1, v - Math.min(v - 1, 10)), Math.min(10, v - 1)); return a + '+' + (v - a); };
  const sumBig = v => { const a = R(Math.max(1, Math.ceil(v / 4)), Math.max(1, v - Math.ceil(v / 4))); return a + '+' + (v - a); };
  const diff = v => { const b = R(1, 9); return (v + b) + M + b; };
  const prod = (v, top) => { const f = []; for(let a = 2; a <= top; a++) if(v % a === 0 && v / a >= 2 && v / a <= 10) f.push(a); if(!f.length) return null; const a = f[R(0, f.length - 1)]; return Math.random() < 0.5 ? a + X + (v / a) : (v / a) + X + a; };
  const vals = lvl === 0 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : lvl === 1 ? range(2, 20) : lvl === 2 ? range(0, 20) : lvl === 3 ? range(4, 60) : lvl === 4 ? range(1, 81) : range(2, 99);
  shuffle(vals).forEach(v => {
    if(lvl === 0) out.push(mk(v, '●'.repeat(v), String(v), 'd', 'n'));
    else if(lvl === 1) out.push(mk(v, sum(v), String(v)));
    else if(lvl === 2) out.push(mk(v, v >= 2 && Math.random() < 0.55 ? sum(v) : diff(v), String(v)));
    else if(lvl === 3){ const p = prod(v, 5); out.push(mk(v, p && Math.random() < 0.7 ? p : sumBig(v), String(v))); }
    else if(lvl === 4){ const p = prod(v, 9), d = R(2, 9); out.push(mk(v, v <= 10 && Math.random() < 0.4 ? (v * d) + D + d : (p || diff(v)), String(v))); }
    else { const p = prod(v, 9), q = Math.random() < 0.5 ? diff(v) : sumBig(v); out.push(mk(v, p || sumBig(v), p ? q : diff(v))); }   // 💀 sum ↔ sum: 6×7 ↔ 50−8
  });
  return out;
}
function range(a, b){ const r = []; for(let i = a; i <= b; i++) r.push(i); return r; }
function stPool(dk, lvl){ const top = ST_TIER[lvl] || 5;
  return dk === 'num' ? stNumPairs(lvl) : shuffle(ST_PAIRS[dk].filter(p => p.t <= top)).map(p => [p, p.t + Math.random() * 1.6]).sort((x, y) => y[1] - x[1]).map(x => x[0]); }   // harder ones first, but mixed
function stTokens(p){ return [p.a.e, p.a.w, p.b.e, p.b.w].filter(x => x && x !== '🍼').map(x => String(x).toLowerCase()); }
function stFace(p, s){ const f = p[s]; return 'st|' + p.k + '|' + f.e + '|' + String(f.w).replace(/\|/g, '/') + '|' + f.fl; }
// deal: one deck (topped up from the others when it is too small for the map) or 🎲 STEAM Mix (round robin); no picture / word twice on a board
function stDeal(dk, pairs, lvl){
  const keys = ['num', 'babies', 'shadow', 'together', 'space', 'words'], used = new Set(), out = [];
  const take = p => { if(out.length >= pairs) return; const t = stTokens(p); if(t.some(x => used.has(x))) return; t.forEach(x => used.add(x)); out.push(p); };
  if(dk === 'smix'){ const pools = shuffle(keys.slice()).map(k => stPool(k, lvl)); let g = 0; while(out.length < pairs && pools.some(q => q.length) && g++ < 999) pools.forEach(q => { if(q.length) take(q.shift()); }); }
  else { stPool(dk, lvl).forEach(take); keys.filter(k => k !== dk).forEach(k => stPool(k, lvl).forEach(take)); }
  if(out.length < pairs) keys.forEach(k => (k === 'num' ? stNumPairs(Math.min(5, lvl + 2)) : shuffle(ST_PAIRS[k].slice())).forEach(take));   // a huge map on 🌱: harder pairs fill the gap
  return out.slice(0, pairs);
}
const isSt = f => typeof f === 'string' && f.indexOf('st|') === 0;
const keyOf = f => isSt(f) ? f.split('|')[1] : f;   // 🔗 the pair a card belongs to (a picture card is its own pair)
function stParts(f){ const p = f.split('|'); return {k: p[1], e: p[2], w: p[3], fl: p[4] || ''}; }
function stHtml(f){
  const p = stParts(f), w = p.w, len = [...w].length;
  const cls = 'face front st' + (p.e && w ? ' ew' : p.e ? ' eo' : ' wo') + (p.fl ? ' fl-' + p.fl : '') + (len > 9 ? ' w3' : len > 5 ? ' w2' : len > 3 ? ' w1' : '');
  const word = p.fl === 'd' ? w.match(/.{1,5}/g).join('<br>') : UI.esc(w);
  return '<span class="' + cls + '">' + (p.e ? '<b class="se">' + p.e + '</b>' : '') + (w ? '<i class="sw">' + word + '</i>' : '') + (p.fl === 'b' ? '<b class="sb">🍼</b>' : '') + '</span>';
}
function stThumb(f){ const p = stParts(f); return p.e && p.fl !== 's' ? p.e : UI.esc(p.w.slice(0, 6)); }
/* ================= 📸 FAMILY MEMORIES deck (mm-2) — the family's REAL avatars on the cards (🎭 Acting) =================
   faces are strings like the emoji: 'fam|<name>|<act>' (one person in a pose) · 'grp|<kind>|<a>,<b>…' (2–4 people: 🤗 hug · ✋ high-five · 🤳 selfie · 🎉 party).
   🌱 🐣 never two near-poses of one person (look-alike groups), 🔦+ some. Everyone in the family is in it (not only today's players). */
const FAM_SOLO = ['gest.read', 'gest.juggle', 'gest.snack', 'gest.yoga', 'gest.dab', 'gest.bubbles', 'cheer.sign', 'gest.sing', 'gest.hulahoop', 'gest.peekaboo', 'sig.flower-twirl', 'cheer.pompom', 'gest.robot', 'pk.jump-shot'];
const FAM_NEAR = [['gest.selfie', 'cheer.selfie'], ['gest.dance', 'gest.disco'], ['victory', 'sig.superstar'], ['sleepy', 'gest.yawn'], ['think', 'sig.genius'], ['gest.flex', 'pk.strong'], ['gest.penguin', 'cheer.penguin'], ['gest.chicken', 'cheer.chicken'], ['gest.heart', 'cheer.heart', 'love'], ['gest.guitar', 'sig.rockstar']];
const FAM_GROUP_ACT = {hug: () => 'pk.big-hug', highfive: () => 'gest.highfive', selfie: i => i === 0 ? 'gest.selfie' : 'cheer.lean-in', party: i => ['cheer.pompom', 'gest.dance', 'cheer.hop', 'gest.cheer'][i % 4]};
const FAM_BG = [['#FFE5EC', '#FFF6D6'], ['#E0F2FF', '#F3E8FF'], ['#E3FCEC', '#FFF6D6'], ['#FFF1E0', '#FFE5EC'], ['#EDE7FF', '#E0F7FA'], ['#FFF6D6', '#E3FCEC']];
const FAM_RING = ['#9B5DE5', '#F15BB5', '#00BBF9', '#06D6A0', '#FF8A3D', '#E5484D', '#3A86FF', '#FFB703'];
const famHash = s => { let h = 2166136261; for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const isFam = f => typeof f === 'string' && (f.indexOf('fam|') === 0 || f.indexOf('grp|') === 0);
const actOk = k => !!(window.Acting && Acting.has('acts', k));
function buildFamily(){
  const names = S.players.map(p => p.Name).filter(Boolean), cards = [], like = [];
  names.forEach(nm => {
    FAM_SOLO.filter(actOk).forEach(a => cards.push('fam|' + nm + '|' + a));
    FAM_NEAR.forEach(pair => { const ok = pair.filter(actOk); ok.forEach(a => cards.push('fam|' + nm + '|' + a)); if(ok.length >= 2) like.push(ok.map(a => 'fam|' + nm + '|' + a)); });
  });
  // group cards: pairs (🤗 ✋ 🤳 — a look-alike group per pair), threes (🤳 🎉), the first four (🎉 🤳)
  const pairs = []; for(let i = 0; i < names.length; i++) for(let j = i + 1; j < names.length; j++) pairs.push([names[i], names[j]]);
  pairs.slice(0, 10).forEach(p => { const g = ['hug', 'highfive', 'selfie'].map(k => 'grp|' + k + '|' + p.join(',')); g.forEach(x => cards.push(x)); like.push(g); });
  for(let i = 0; i + 2 < names.length && i < 4; i++){ const t = names.slice(i, i + 3).join(','); cards.push('grp|selfie|' + t, 'grp|party|' + t); }
  if(names.length >= 4){ const q = names.slice(0, 4).join(','); cards.push('grp|party|' + q, 'grp|selfie|' + q); }
  DECKS.family = {name: 'Family', icon: '📸', back: 'linear-gradient(135deg,#FF8FB1,#FFC845 55%,#6BCB77)', mark: '📸', cards, like, fam: true};
}
// who is on a family card + how they stand: [{name, act, dir}]
function famPeople(f){
  const p = f.split('|'); if(p[0] === 'fam') return [{name: p[1], act: p[2], dir: 1}];
  const names = p[2].split(','), n = names.length, A = FAM_GROUP_ACT[p[1]] || FAM_GROUP_ACT.party;
  return names.map((nm, i) => ({name: nm, act: A(i), dir: p[1] === 'party' ? 1 : (i < n / 2 ? 1 : -1)}));
}
// paint a family card (px × px CSS) at time t — small cards = 📷 close-up (head + shoulders), big cards = whole body; a colour ring per person
function famPaint(g, f, px, t){
  const P = famPeople(f), n = P.length, close = px < 70, bg = FAM_BG[famHash(f.split('|').slice(0, 2).join('|')) % FAM_BG.length];
  const gr = g.createLinearGradient(0, 0, 0, px); gr.addColorStop(0, bg[0]); gr.addColorStop(1, bg[1]); g.fillStyle = gr; g.fillRect(0, 0, px, px);
  const k0 = close ? px * 0.92 / 70 : px * 0.88 / 96, k = n === 1 ? k0 : k0 * [1, 1, 0.8, 0.66, 0.56][n] * (close ? 1.12 : 1);
  const feet = close ? px * 0.07 + 112 * k : px * 0.96, span = px * (n === 2 ? 0.5 : 0.76);
  P.forEach((q, i) => { const x = n === 1 ? px / 2 : px / 2 + (i - (n - 1) / 2) * span / (n - 1 || 1);
    try{ Acting.draw(g, {name: q.name, av: myAvatar(q.name)}, x, feet, k, q.act, {t, dir: q.dir, noPet: true}); }catch(e){} });
  g.save(); g.lineWidth = Math.max(2, px * 0.035);
  if(n === 1){ g.strokeStyle = FAM_RING[famHash(P[0].name) % FAM_RING.length]; g.strokeRect(g.lineWidth / 2, g.lineWidth / 2, px - g.lineWidth, px - g.lineWidth); }
  else P.forEach((q, i) => { g.strokeStyle = FAM_RING[famHash(q.name) % FAM_RING.length]; const w = px / n; g.beginPath(); g.moveTo(i * w + 2, px - g.lineWidth / 2); g.lineTo((i + 1) * w - 2, px - g.lineWidth / 2); g.stroke(); });
  g.restore();
}
const FAMC = {};
function famCanvas(f, px){
  const dpr = Math.min(2, window.devicePixelRatio || 1), key = f + '|' + px + '|' + dpr; if(FAMC[key]) return FAMC[key];
  const c = document.createElement('canvas'); c.width = c.height = Math.round(px * dpr); const g = c.getContext('2d'); g.scale(dpr, dpr); famPaint(g, f, px, 0.45);
  return (FAMC[key] = c);
}
// put the right picture on every family card of the board (after layout — the card size decides close-up / whole body)
function paintFamCards(){
  if(!G) return; const px = Math.round(parseFloat(getComputedStyle($('board')).getPropertyValue('--cs')) || 60);
  G.cards.forEach(c => { if(!isFam(c.f)) return; const cv = c.el.querySelector('.front canvas'); if(!cv || (cv._px === px && !cv._live)) return;
    const src = famCanvas(c.f, px); cv.width = src.width; cv.height = src.height; cv.getContext('2d').drawImage(src, 0, 0); cv._px = px; });
}
const famThumb = f => { try{ return '<img class="famthumb" alt="" src="' + famCanvas(f, 40).toDataURL() + '">'; }catch(e){ return '📸'; } };
// 🎉 a matched family pair comes alive — 3–5 beats on the card (ready → anticipation squash → CONTACT pop → follow-through overshoot → settle)
// while the avatars play their own action; sound + sparkle + points float fire on contact
const POP_BEATS = [{ms: 60, s: 1, r: 0}, {ms: 180, s: 0.9, r: -3}, {ms: 90, s: 1.2, r: 4, contact: true}, {ms: 280, s: 0.96, r: -2}, {ms: 200, s: 1, r: 0}];
function famPop(cards, onContact){
  if(FAST()){ onContact(); return; }
  const total = POP_BEATS.reduce((n, b) => n + b.ms, 0), contactAt = POP_BEATS.slice(0, 2).reduce((n, b) => n + b.ms, 0) + POP_BEATS[2].ms * 0.4;
  let off = 0; const kf = POP_BEATS.map(b => { off += b.ms; return {transform: 'scale(' + b.s + ') rotate(' + b.r + 'deg)', offset: off / total}; }); kf.unshift({transform: 'scale(1)', offset: 0});
  cards.forEach(c => { c.el.classList.add('popping'); c.el.animate(kf, {duration: total, easing: 'ease-out'}); });
  setTimeout(onContact, contactAt);
  const t0 = performance.now(), px = Math.round(parseFloat(getComputedStyle($('board')).getPropertyValue('--cs')) || 60), tg = G;
  (function live(now){ if(G !== tg) return; const tt = (now - t0) / 1000;
    cards.forEach(c => { const cv = c.el.querySelector('.front canvas'); if(!cv) return; cv._live = true; const g = cv.getContext('2d'), dpr = cv.width / px; g.setTransform(dpr, 0, 0, dpr, 0, 0); famPaint(g, c.f, px, 0.45 + tt); });
    if(tt * 1000 < total + 400) requestAnimationFrame(live); else cards.forEach(c => { c.el.classList.remove('popping'); const cv = c.el.querySelector('.front canvas'); if(cv){ cv._live = false; cv._px = 0; } paintFamCards(); }); })(t0);
}

const SEAT_COLS = ['#9B5DE5', '#F15BB5', '#00BBF9', '#06D6A0'];
const AGE_START = {'4-5': 0, '6-7': 1, '8-9': 2, '10+': 3};
const PRAISE = ['Great memory', 'Super match', 'Wow', 'Brainy', 'Amazing'];
// 🎴 deal: `pairs` faces; 🌱 / 🐣 never two of a look-alike group, 🔦 → 🌋 a few look-alike pairs, 💀 whole groups of 3–4
function dealFaces(D, pairs, look){
  const groups = shuffle(D.like.map(g => shuffle(g.filter(f => D.cards.includes(f))))).filter(g => g.length >= 2);
  if(look >= 4) groups.sort((x, y) => Math.min(4, y.length) - Math.min(4, x.length));   // 💀 the big groups (3–4 look-alikes) first
  const inG = new Set(); groups.forEach(g => g.forEach(f => inG.add(f)));
  const want = look >= 4 ? groups.length : Math.round(look * Math.max(1, pairs / 8)), out = [];
  groups.slice(0, want).forEach(g => (look >= 4 ? g.slice(0, 4) : g.slice(0, 2)).forEach(f => { if(out.length < pairs) out.push(f); }));
  const singles = groups.slice(Math.min(want, groups.length)).map(g => g[0]);
  shuffle(D.cards.filter(f => !inG.has(f)).concat(singles)).forEach(f => { if(out.length < pairs) out.push(f); });
  shuffle(D.cards.filter(f => !out.includes(f))).forEach(f => { if(out.length < pairs) out.push(f); });   // tiny deck: anything left
  return out.slice(0, pairs);
}
// 🎲 Mix = picture cards + about a third 📸 family cards · a small family is topped up with picture cards (mm-2)
function dealFor(D, pairs, look){
  const F = DECKS.family;
  if(D.mix && F && F.cards.length){ const a = dealFaces(F, Math.min(Math.round(pairs * 0.35), F.cards.length), look); return a.concat(dealFaces(D, pairs - a.length, look)); }
  let f = dealFaces(D, pairs, look); if(f.length < pairs) f = f.concat(dealFaces(DECKS.mix, pairs - f.length, look));
  return f.slice(0, pairs);
}
const isPhone = () => Math.min(innerWidth, innerHeight) < 600 && Math.max(innerWidth, innerHeight) < 1000;
const mapOk = M => !(M.big && isPhone());

/* ================= STATE ================= */
let S = {players: [], progress: {}, settings: {}, avatars: {}, player: '', age: ''};
let G = null, lockHandle = null, SEATS = [], timerId = 0;
const PICK = {map: '4', lvl: 0, deck: 'mix', mode: 'classic', sdeck: 'smix'};   /* 🔗 mm-5: + sdeck */
// 🎮 mm-3: ways to play — 🃏 Classic (1–4 players) · ⏱️ Time attack (solo: beat the map's par time before the clock runs out)
const MODE_GROUPS = [{k: 'match', icon: '🃏', en: 'Match', th: 'จับคู่', c: '#7A5CFA'}, {k: 'race', icon: '⏱️', en: 'Race', th: 'แข่งเวลา', c: '#FF7A00'}];   /* 🗂️ MODE GROUPS (mg-1) — mm-5: mode boxes by type (= Code.gs MODE_GROUPS_.memory) */
const MODES = [{k: 'classic', g: 'match', icon: '🃏', name: 'Classic', type: 'Same picture = a pair', sub: 'Find all the pairs — 1 to 4 players'}, {k: 'steam', g: 'match', icon: '🔗', name: 'STEAM pairs', type: 'Two cards that belong together', sub: '3+4 ↔ 7 · 🐔 ↔ 🐣 · 🔑 ↔ 🔒 · 🪐 ↔ Saturn'}, {k: 'time', g: 'race', icon: '⏱️', name: 'Time attack', type: 'Beat the clock', sub: 'On your own — under par = ⭐⭐⭐'}];   /* 🔗 mm-5 */
const TA_LIMIT = [2.0, 1.8, 1.6, 1.5, 1.4, 1.3];   // ⏱️ the clock = the map's par time × this (🌱 → 💀); ⭐⭐⭐ = under par, ⭐⭐ = under par × 1.4
function store(k){ return 'sp_memory_' + k + ':' + (S.player || ''); }
function loadPrefs(){ try{ const d = localStorage.getItem(store('deck')), m = localStorage.getItem(store('map')), l = localStorage.getItem(store('lv'));
    const md = localStorage.getItem(store('mode')), sd = localStorage.getItem(store('sdeck')); PICK.mode = md === 'time' || md === 'steam' ? md : 'classic'; PICK.sdeck = ST_DECKS[sd] ? sd : 'smix';   /* 🔗 mm-5 */
    PICK.deck = DECKS[d] ? d : 'mix'; PICK.map = MAPS.some(x => x.k === m) ? m : '4'; PICK.lvl = l != null && l !== '' ? Number(l) : -1; }catch(e){} }
function savePrefs(){ try{ localStorage.setItem(store('mode'), PICK.mode); localStorage.setItem(store('sdeck'), PICK.sdeck); localStorage.setItem(store('deck'), PICK.deck); localStorage.setItem(store('map'), PICK.map); localStorage.setItem(store('lv'), String(PICK.lvl)); }catch(e){} }
function myAvatar(name){ const a = S.avatars[name || S.player]; return a ? fixAv(a) : defaultAvatar(name || S.player || 'player'); }
const mapOf = k => MAPS.find(m => m.k === k) || MAPS[0];

/* ================= MENUS ================= */
function showScreen(name){
  ['player', 'menu', 'play', 'link'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));   // 📡 mm-4: + link
  if(name !== 'menu' && name !== 'player' && MemCover) MemCover.hide();
  $('back-btn').classList.toggle('hidden', name === 'play'); UI.navScreen($('back-btn'), name, NAV_INNER);   // 🧭 p1b
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
  const p = S.players.find(x => x.Name === name); S.player = name; S.age = p ? p.Age : ''; SEATS = [name]; buildFamily();   /* 📸 mm-2 */
  loadPrefs(); if(window.Cheer){ Cheer.chip($('cheer-chip'), name); Cheer.langChip($('cheer-lang'), name); } /* 📣 cs-3b */
  renderSetup(); showScreen('menu'); openCover();   /* 🧱 mm-1: the 🎬 cover first */
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">No score yet</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span>' + (b.timeSec ? '<span>⏱ ' + fmt(b.timeSec * 1000) + '</span>' : '') + '<span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }
const gfPick = (el, on) => { el.classList.toggle('sel', !!on); if(window.GF && GF.pick) GF.pick(el, on); };   /* ✓ the ONE picked look (GameFrame) */
function renderSetup(){
  // 👥 who's playing (from the cover's lineup)
  $('who-name').innerHTML = (SEATS.length > 1 ? '👥 ' : '👤 ') + SEATS.map(n => UI.esc(n)).join(' + ');
  // 🎮 ways to play (⏱️ Time attack = one player)
  if(SEATS.length > 1 && PICK.mode === 'time') PICK.mode = 'classic';   /* 🗂️ mm-5: the ways to play in boxes by type (UI.modeGroups); ⏱️ = one player */
  UI.modeGroups($('mode-list'), MODE_GROUPS, MODES.map(m => { const off = m.k === 'time' && SEATS.length > 1; return Object.assign({}, m, {on: m.k === PICK.mode, soon: off, sub: off ? '👤 for one player — remove friends on the cover' : m.sub}); }), {onPick: k => {
    if(k === 'time' && SEATS.length > 1){ UISound.play('error'); UI.toast('⏱️ Time attack is for one player'); return 'stop'; }
    const was = PICK.mode; PICK.mode = k; savePrefs(); if((was === 'steam') !== (k === 'steam')){ renderSetup(); return false; } markPicks(); },
    next: k => k === undefined ? $('level-head') : $('map-head'), moreText: '👇 Pick a map + a level below'});   /* 🔗 the deck list follows the mode · 👇 cue while the levels are below */
  // 🗺️ maps
  const mb = $('map-list'); mb.innerHTML = '';
  if(!mapOk(mapOf(PICK.map))) PICK.map = '8';
  MAPS.forEach(M => { if(!mapOk(M)) return; const b = document.createElement('button'); b.className = 'pick mapc' + (M.big ? ' big' : ''); b.dataset.k = M.k; b.setAttribute('data-sound', 'pop');
    const cells = Math.min(M.n, 6); let g = '<div class="grid" style="grid-template-columns:repeat(' + cells + ',1fr)">'; for(let i = 0; i < cells * cells; i++) g += '<i></i>'; g += '</div>';
    b.innerHTML = g + '<div class="nm">' + M.icon + ' ' + M.name + '</div><div class="pairs">' + (M.n * M.n / 2) + ' pairs</div><div class="mult">🏆 ×' + M.mult + '</div>';
    b.onclick = () => { PICK.map = M.k; savePrefs(); markPicks(); }; mb.appendChild(b); });
  // 🎚️ levels
  const box = $('level-list'); box.innerHTML = ''; const p = progressOf(S.player), rec = AGE_START[S.age];
  LEVELS.forEach((L, i) => {
    const open = canPlay(i), done = p.unlocked > i, b = document.createElement('button'); b.dataset.i = i;
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (L.hardcore ? ' hardcore' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none');
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + L.emoji + '</div><div class="nm">' + L.name + '</div><div class="sub">' + (L.hardcore && !open ? '🔒 Beat Extreme to open 💀 Hardcore' : L.blurb) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore' : i === 4 ? 'Finish Hard to unlock Extreme!' : 'Finish the level before to unlock it'); return; } PICK.lvl = i; savePrefs(); markPicks(); };
    box.appendChild(b);
  });
  if(!(PICK.lvl >= 0 && canPlay(PICK.lvl))) PICK.lvl = canPlay(rec) ? rec : Math.max(0, [0, 1, 2, 3, 4, 5].filter(canPlay).pop() || 0);
  // 🎴 decks
  const db = $('deck-list'); db.innerHTML = '';
  if(PICK.mode === 'steam'){ $('deck-h3').textContent = '🔗 STEAM deck'; ST_KEYS.forEach(k => { const D = ST_DECKS[k], b = document.createElement('button'); b.className = 'deck steam' + (D.mix ? ' mix' : ''); b.dataset.k = k; b.setAttribute('data-sound', 'tap');   /* 🔗 mm-5 */
    b.innerHTML = '<div class="mini">' + D.mini.map(x => '<span>' + x + '</span>').join('') + '</div><div class="nm">' + D.icon + ' ' + D.name + '</div>';
    b.onclick = () => { PICK.sdeck = k; savePrefs(); markPicks(); }; db.appendChild(b); }); markPicks(); return; }
  $('deck-h3').textContent = '🎴 Deck';
  DECK_KEYS.forEach(k => { const D = DECKS[k], b = document.createElement('button'); b.className = 'deck' + (D.mix ? ' mix' : '') + (D.fam ? ' fam' : ''); b.dataset.k = k; b.setAttribute('data-sound', 'tap');
    b.innerHTML = '<div class="mini">' + (D.mix ? ['👾', '🐶', '📸', '🦸'] : D.fam ? ['🤳', '🤗', '✋', '🎉'] : D.cards.slice(0, 4)).join('') + '</div><div class="nm">' + D.icon + ' ' + D.name + '</div>';
    b.onclick = () => { PICK.deck = k; savePrefs(); markPicks(); }; db.appendChild(b); });
  markPicks();
}
function markPicks(){
  document.querySelectorAll('#mode-list .ui-mbtn').forEach(b => b.classList.toggle('on', b.dataset.k === PICK.mode));   /* 🗂️ mm-5 */
  document.querySelectorAll('#map-list .mapc').forEach(b => gfPick(b, b.dataset.k === PICK.map));
  document.querySelectorAll('#level-list .lvl').forEach(b => gfPick(b, Number(b.dataset.i) === PICK.lvl));
  const stM = PICK.mode === 'steam'; document.querySelectorAll('#deck-list .deck').forEach(b => gfPick(b, b.dataset.k === (stM ? PICK.sdeck : PICK.deck)));
  const M = mapOf(PICK.map), L = LEVELS[PICK.lvl] || LEVELS[0], D = stM ? ST_DECKS[PICK.sdeck] || ST_DECKS.smix : DECKS[PICK.deck];
  $('btn-start').textContent = '▶ Start · ' + (PICK.mode === 'time' ? '⏱️ ' : stM ? '🔗 ' : '') + M.name + ' · ' + L.emoji + ' ' + L.name + ' · ' + D.icon + (SEATS.length > 1 ? ' · 👥 ' + SEATS.length : '');
}
function startSetup(){ if(!canPlay(PICK.lvl)){ UISound.play('error'); UI.toast('Pick a level that is open 🔓'); return; } startGame(PICK.lvl); }
// 🎬 the cover (GameFrame): who's here (you + up to 3 friends on this device) + champions + how to play; ▶ Play opens the setup page
let MemCover = null;
const MM_HELP = ['Flip two cards — find the matching **pairs**! A pair stays up and you go again.', 'Pick a 🗺️ **map** (4×4 up to 10×10), then a 🎚️ **level**: peeks, look-alike cards, 🔀 swaps…', '💀 **Hardcore**: see every card, then watch them 🌀 scramble — and 2 cards swap after every miss!', 'Up to 4 players take turns: a pair = go again, the most pairs wins. Fewer misses = more ⭐.', '⏱️ **Time attack** (one player): find every pair before the clock runs out — under the par time = ⭐⭐⭐.', '🔗 **STEAM pairs**: the two cards of a pair are DIFFERENT but belong together — 3+4 ↔ 7 · 🐔 ↔ 🐣 · 🔑 ↔ 🔒 · a picture ↔ its shadow · 🪐 ↔ Saturn.', '📱 **Own devices**: 2–4 players, each on their own phone or tablet — only the player whose turn it is can flip; 📺 Room hostess puts the cards on the TV.'];
function openCover(){
  if(!window.GF){ showScreen('menu'); return; }
  if(MemCover && MemCover.who !== S.player){ MemCover.destroy(); MemCover = null; }
  if(!MemCover){ MemCover = GF.cover(document.body, {game: 'memory', title: 'Memories Match', icon: '🃏', version: MM_VERSION, me: S.player, players: S.players, avatarOf: myAvatar, seats: {min: 1, max: 4},
      help: MM_HELP, acts: ['beat.cheer', 'beat.wave', 'beat.jump'], backTo: WEBAPP_URL + '?page=gameroom' + sessionQuery(), backKind: 'rooms', own: () => { MemCover.hide(); lxChoose(); },   // 📱 mm-4: own devices = the 📡 LinkKit lobby
      onPlay: line => { MemCover.hide(); SEATS = line.map(s => s.name); if(!SEATS.length) SEATS = [S.player]; renderSetup(); showScreen('menu'); } }); MemCover.who = S.player; }
  MemCover.show();
}

/* ================= GAME ================= */
function startGame(lvl){
  if(MemCover) MemCover.hide();   /* 🧱 mm-1 */
  clearInterval(timerId); hideResult();
  const L = LEVELS[lvl], M = mapOf(PICK.map), map = mapOk(M) || (typeof LX !== 'undefined' && LX.pending) ? M : mapOf('8'), stM = PICK.mode === 'steam', D = stM ? ST_DECKS[PICK.sdeck] || ST_DECKS.smix : DECKS[PICK.deck] || DECKS.mix, n = map.n, pairs = n * n / 2;   /* 🔗 mm-5 */
  const faces = stM ? stDeal(ST_DECKS[PICK.sdeck] ? PICK.sdeck : 'smix', pairs, lvl).flatMap(p => [stFace(p, 'a'), stFace(p, 'b')]) : (f => f.concat(f))(dealFor(D, pairs, L.look)), cards = shuffle(faces.map((f, i) => ({f, id: i, up: false, done: false, by: -1, seen: false})));
  const timeMode = PICK.mode === 'time' && SEATS.length === 1 && !(typeof LX !== 'undefined' && LX.pending);   /* ⏱️ mm-3 · 📡 mm-4: linked = Classic */
  G = {lvl, L, M: map, D, n, cards, pairs, mode: timeMode ? 'time' : stM ? 'steam' : 'classic', limit: timeMode ? Math.round(map.par * TA_LIMIT[lvl]) * 1000 : 0, open: [], wait: false, over: false, paused: false, t0: 0, pausedTotal: 0, started: false, cursor: 0, missRow: 0, guide: L.guide ? 1 : 0,
    mult: map.mult * L.mult, players: SEATS.map((nm, i) => ({name: nm, col: SEAT_COLS[i], pairs: 0, score: 0, miss: 0, streak: 0, best: 0})), turn: 0, found: 0, swaps: 0};
  if(typeof lxSeat === 'function') lxSeat();   /* 📡 mm-4: LX.pending → G.lx (+ the host's cards on a guest) */
  BAR.level((G.lx ? '📡 ' : '') + (timeMode ? '⏱️ ' : stM ? '🔗 ' : '') + L.emoji + ' ' + L.name + ' · ' + map.name + ' · ' + D.icon);
  buildBoard(); buildSide(); showScreen('play'); layout(); hud(); cheerMount(); /* 📣 cs-3b */
  if(G.lx && G.lx.skip) go();   /* 📡 mm-4: joined a board that is already running */
  else if(L.reveal) revealScramble();
  else if(L.peek) peekFirst(L.peek + (L.guide ? Math.max(0, (n - 4) / 2) : 0));
  else go();
}
// 👀 a countdown on the peek pill (pauses with the game; a new game stops it)
function countdown(secs, label){ return new Promise(res => { const tg = G; let left = secs; $('peek').classList.remove('hidden'); $('peek').textContent = label + left;
  const tk = setInterval(() => { if(G !== tg){ clearInterval(tk); res(false); return; } if(G.paused) return; left--; $('peek').textContent = label + left;
    if(left <= 0){ clearInterval(tk); $('peek').classList.add('hidden'); res(true); } }, FAST() ? 1 : 1000); }); }
async function peekFirst(secs){
  const tg = G; G.wait = true; G.cards.forEach(c => c.up = true); paintAll(); if(window.Cheer) Cheer.hush(true);   /* 🤫 cs-3b: everyone memorises */
  say(secs <= 1 ? 'Quick look!' : 'Look carefully!');
  if(!await countdown(secs, secs <= 1 ? '⚡ Quick look! ' : '👀 Remember them! ') || G !== tg) return;
  G.cards.forEach(c => c.up = false); paintAll(); G.wait = false; go();
}
// 💀 Hardcore: every card shows → they flip down → 🐟 Goldie scrambles them (visible slides, a bit faster near the end) → play
async function revealScramble(){
  const tg = G, n = G.n; G.wait = true; G.cards.forEach(c => c.up = true); paintAll(); if(window.Cheer) Cheer.hush(true);
  say('Remember them, if you can!');
  if(!await countdown(REVEAL_S[n] || 4, '👀 Remember them… if you can! ') || G !== tg) return;
  G.cards.forEach(c => c.up = false); paintAll(); await wait(500); if(G !== tg) return;
  showBanner('🐟 Goldie scrambles the cards — follow them!', 'gold'); say('Follow the cards!');
  for(let k = 0; k < n; k++){
    const h = hiddenIdx(); if(h.length < 3) break; const pl = G.lx && G.lx.scr ? G.lx.scr[k] : null; const i = pl ? pl[0] : pick(h); let j = pl ? pl[1] : i, g = 0; while(j === i && g++ < 20) j = pick(h);   /* 📡 mm-4: the host's plan */
    await swapPair(i, j, {ms: Math.round(460 - 170 * k / Math.max(1, n - 1)), glow: false, quiet: k % 2}); if(G !== tg) return;
  }
  G.scrambled = true; await wait(250); if(G !== tg) return; G.wait = false; go();
}
function go(){ if(G.started) return; G.started = true; cheerGo(); /* 📣 cs-3b */ G.t0 = performance.now(); G.pausedTotal = 0; if(G.players.length > 1) turnCard(0, true); else showBanner(G.mode === 'time' ? '⏱️ Beat the clock — ' + fmt(G.limit) + ' to find ' + G.pairs + ' pairs!' : G.mode === 'steam' ? '🔗 Find the ' + G.pairs + ' pairs that belong together!' : '🃏 Find all ' + G.pairs + ' pairs!'); timerId = setInterval(hud, 500); guideStep(); }
function buildBoard(){
  const b = $('board'); b.innerHTML = ''; b.style.gridTemplateColumns = 'repeat(' + G.n + ', var(--cs))'; b.style.setProperty('--deck-back', G.D.back); b.classList.toggle('dots', !!G.L.seen);
  G.cards.forEach((c, i) => { const el = document.createElement('button'); el.className = 'card'; el.dataset.i = i; el.setAttribute('aria-label', 'Card ' + (i + 1)); el.setAttribute('data-sound', 'none');
    el.innerHTML = '<span class="in"><span class="face back">' + G.D.mark + '</span>' + (isSt(c.f) ? stHtml(c.f) : isFam(c.f) ? '<span class="face front fam"><canvas></canvas></span>' : '<span class="face front">' + c.f + '</span>') + '</span>';
    el.addEventListener('click', () => flip(+el.dataset.i)); b.appendChild(el); c.el = el; });
}
function buildSide(){
  const s = $('side'); s.innerHTML = '';
  G.players.forEach((p, i) => { const d = document.createElement('div'); d.className = 'pl'; d.style.setProperty('--seat', p.col); d.id = 'pl-' + i;
    const c = document.createElement('canvas'); c.width = 80; c.height = 94; d.appendChild(c);
    d.insertAdjacentHTML('beforeend', '<div><div class="nm">' + UI.esc(p.name) + '</div><div class="pile" id="pile-' + i + '"></div><div class="mine" id="mine-' + i + '"></div></div><div class="sc" id="sc-' + i + '">0</div>');
    c.id = 'plav-' + i; drawPreviewCanvas(c, myAvatar(p.name), {name: p.name, t: 1}); s.appendChild(d); });
  startCheer();
  $('side').classList.toggle('hidden', G.players.length < 2 && innerWidth < 820);
}
function layout(){
  if(!G) return; const ar = $('arena'), side = $('side'), n = G.n, gap = n >= 10 ? 4 : n >= 8 ? 5 : n >= 6 ? 7 : 10;
  const row = getComputedStyle(ar).flexDirection === 'row', sw = row && !side.classList.contains('hidden') ? side.offsetWidth + 16 : 0, sh = !row && !side.classList.contains('hidden') ? side.offsetHeight + 8 : 0;
  const W = ar.clientWidth - 24 - sw, H = ar.clientHeight - 18 - sh;
  const cs = Math.floor(Math.max(24, Math.min((W - gap * (n - 1)) / n, (H - gap * (n - 1)) / n, 190)));
  $('board').style.setProperty('--cs', cs + 'px'); $('board').style.setProperty('--gap', gap + 'px');
  if(G.guideAt != null) guideStep();
  paintFamCards();   /* 📸 mm-2 */
}
window.addEventListener('resize', () => { if(G){ layout(); } });
function paint(c){ c.el.classList.toggle('up', c.up); c.el.classList.toggle('done', c.done); c.el.classList.toggle('seen', !!c.seen); if(c.done && c.by >= 0){ c.el.style.setProperty('--won-edge', G.players[c.by].col); } }
function paintAll(){ G.cards.forEach(paint); }
/* ---------- 🙌 avatars cheer (side panel) + 👉 turn card (11n, 2026-11-06) ---------- */
const CHEER = {list: [], raf: 0};
function gestOf(k){ return GESTURES.find(g => g.k === k) || GESTURES[5]; }
function cheer(i, k, times){ if(!G || !G.players[i]) return; const g = gestOf(k); CHEER.list[i] = {g, t0: performance.now(), d: g.d * (times || 1)}; }
function drawPl(i, now){ const c = $('plav-' + i); if(!c || !G || !G.players[i]) return; const x = c.getContext('2d'), a = CHEER.list[i], P = G.players[i];
  let t = a ? (now - a.t0) / 1000 : 0; if(a && t > a.d){ CHEER.list[i] = null; t = 0; }
  x.clearRect(0, 0, c.width, c.height);
  const av = myAvatar(P.name), Q = typeof avatarPlace === 'function' ? avatarPlace(av, P.name, c.width, c.height, c.width / 2, c.height - 6, c.height / 118, MEM_MOVES) : {x: c.width / 2, y: c.height - 6, k: c.height / 118};   // r32: never cut off
  drawAvatar(x, {name: P.name, av, dir: 1, walkT: 0, gest: CHEER.list[i] ? {g: a.g, t: t % a.g.d} : null}, Q.x, Q.y, Q.k, {t: now / 1000, noPet: true}); }
const MEM_MOVES = ['dance', 'floss', 'backflip', 'shrug', 'think', 'disco', 'cheer', 'clap', 'wave'];
function startCheer(){ cancelAnimationFrame(CHEER.raf); CHEER.list = []; const tick = now => { if(!G){ return; } G.players.forEach((p, i) => { if(CHEER.list[i] || i === G.turn || G.over) drawPl(i, now); }); CHEER.raf = requestAnimationFrame(tick); }; CHEER.raf = requestAnimationFrame(tick); }
function turnCard(i, first){ const P = G.players[i], tc = $('turncard'); if(!tc) return;
  tc.style.setProperty('--seat', P.col); $('turn-name').textContent = (first ? '🎲 ' : '👉 ') + P.name + (first ? ' goes first!' : '\'s turn!'); $('turn-sub').textContent = G.players.length > 2 ? 'Pass it on — find a pair!' : 'Find a pair!';
  tc.classList.add('on'); clearTimeout(tc._t); say(P.name + (first ? ' goes first!' : '\'s turn'));
  const c = $('turn-av'), x = c.getContext('2d'), g = gestOf('wave'), t0 = performance.now();
  (function anim(now){ if(!tc.classList.contains('on')) return; const t = (now - t0) / 1000; x.clearRect(0, 0, c.width, c.height); const av = myAvatar(P.name), Q = typeof avatarPlace === 'function' ? avatarPlace(av, P.name, c.width, c.height, c.width / 2, c.height - 10, c.height / 120, ['wave']) : {x: c.width / 2, y: c.height - 10, k: c.height / 120}; drawAvatar(x, {name: P.name, av, dir: 1, walkT: 0, gest: {g, t: t % g.d}}, Q.x, Q.y, Q.k, {t}); requestAnimationFrame(anim); })(t0);
  tc._t = setTimeout(() => tc.classList.remove('on'), 1600); }
// 👆 🌱 Basic: a hand + one line on the first turn (never shows an answer — it points at a card that is still face-down)
function guideStep(){
  const h = $('hand'); if(!G || !G.guide || !G.started || G.over){ if(h) h.classList.add('hidden'); if(G) G.guideAt = null; return; }
  const hid = hiddenIdx(); if(!hid.length){ h.classList.add('hidden'); return; }
  if(G.guideAt == null || !hid.includes(G.guideAt)) G.guideAt = hid[Math.floor(hid.length / 2)];
  const r = G.cards[G.guideAt].el.getBoundingClientRect(), st = $('stage').getBoundingClientRect();
  h.style.left = (r.left - st.left + r.width * 0.55) + 'px'; h.style.top = (r.top - st.top + r.height * 0.45) + 'px'; h.classList.remove('hidden');
  showBanner(G.guide === 1 ? '👆 Tap any card to flip it!' : '🔍 Now find its twin — tap another card!');
}
function hiddenIdx(){ return G.cards.map((c, i) => i).filter(i => !G.cards[i].done && !G.cards[i].up); }
function flip(i){
  if(!G || G.over || G.wait || G.paused || !G.started) return;
  const c = G.cards[i]; if(!c || c.up || c.done) return;
  c.up = true; c.seen = true; G.flips = (G.flips || 0) + 1; paint(c); UISound.play('tap'); G.open.push(c);   /* 📡 mm-4: G.flips = the flip count every device checks */ G.cursor = i; markCursor();
  if(G.guide){ G.guide++; if(G.guide > 2){ G.guide = 0; } G.guideAt = null; guideStep(); }
  if(G.open.length < 2) return;
  G.wait = true; const [a, b] = G.open, P = G.players[G.turn], tg = G;
  if(keyOf(a.f) === keyOf(b.f)){   /* 🔗 mm-5: a STEAM pair = same key, different faces */
    setTimeout(() => {
      if(G !== tg) return;
      a.done = b.done = true; a.by = b.by = G.turn; paint(a); paint(b); G.found++; P.pairs++; P.streak++; P.best = Math.max(P.best, P.streak); G.missRow = 0;
      const gain = Math.round((100 + 50 * (P.streak - 1)) * G.mult); P.score += gain;
      const fx = () => { UISound.play('success'); sparkle(a.el); sparkle(b.el); floatText(b.el, '+' + gain + (P.streak > 1 ? ' 🔥×' + P.streak : '')); };
      if(isFam(a.f)) famPop([a, b], fx); else fx();   /* 📸 mm-2: the avatars come alive — sound + points on the contact beat */
      const mine = $('mine-' + G.turn); if(mine) mine.insertAdjacentHTML('beforeend', '<i>' + (isSt(a.f) ? stThumb(a.f) : isFam(a.f) ? famThumb(a.f) : a.f) + '</i>');
      if(isSt(a.f) && P.streak < 3) showBanner('🔗 ' + stThumb(a.f) + ' + ' + stThumb(b.f) + ' belong together!');   /* 🔗 mm-5: say WHY they match */
      cheer(G.turn, P.streak >= 3 ? pick(['dance', 'floss', 'backflip']) : pick(['cheer', 'clap', 'jump', 'highfive'])); G.players.forEach((o, j) => { if(j !== G.turn) cheer(j, 'clap'); });
      cheerSay('goal', G.turn); /* 📣 cs-3b */
      if(P.streak === 3 || P.streak === 5 || P.streak === 8) showBanner('🔥 ' + P.streak + ' in a row! ' + pick(PRAISE) + '!', 'gold');
      G.open = []; G.wait = false; hud();
      if(G.found === G.pairs) setTimeout(finishGame, FAST() ? 0 : 500);
    }, FAST() ? 0 : 260);
  } else {
    P.miss++; P.streak = 0; G.missRow++; cheerSay('miss', G.turn); /* 📣 cs-3b */ cheer(G.turn, pick(['shrug', 'think']));
    const show = FAST() ? 0 : G.L.show;
    setTimeout(() => { if(G !== tg) return; a.el.classList.add('miss'); b.el.classList.add('miss'); UISound.play('bump'); }, Math.min(300, show * 0.35));
    setTimeout(async () => {
      if(G !== tg) return;
      a.up = b.up = false; a.el.classList.remove('miss'); b.el.classList.remove('miss'); paint(a); paint(b); G.open = [];
      if(G.L.swaps) await doSwaps(G.L.swaps, G.L.glow);
      if(G !== tg || G.over) return;
      if(G.players.length > 1){ G.turn = (G.turn + 1) % G.players.length; turnCard(G.turn); }
      G.wait = false; hud(); maybeHint();
    }, show);
    hud();
  }
}
// 💡 🌱 Basic: 3 misses in a row → one pair glows (psst!)
function maybeHint(){
  if(!G || !G.L.guide || G.missRow < 3) return; G.missRow = 0;
  const m = {}; G.cards.forEach(c => { if(!c.done) (m[keyOf(c.f)] = m[keyOf(c.f)] || []).push(c); }); const pr = Object.values(m).find(x => x.length === 2); if(!pr) return;
  pr.forEach(c => c.el.classList.add('hint')); showBanner('💡 Psst… these two are a pair!', 'gold'); setTimeout(() => pr.forEach(c => c.el.classList.remove('hint')), 1700);
}
// 🔀 swaps after a miss: ⚡ Hard 1 (they glow first) · 🌋 Extreme 1 (no glow) · 💀 Hardcore 2 (no glow). A seen card moves more often — that's the trick.
async function doSwaps(n, glow){
  const tg = G;
  for(let k = 0; k < n; k++){
    const h = hiddenIdx(); if(h.length < 3) break; const seen = h.filter(i => G.cards[i].seen);
    const i = seen.length && Math.random() < 0.7 ? pick(seen) : pick(h); let j = i, g = 0; while(j === i && g++ < 20) j = pick(h);
    if(k === 0) showBanner(glow ? '🔀 Watch — two cards swap places!' : n > 1 ? '🐟 Goldie swaps 2 × 2 cards!' : '🐟 Goldie swapped two cards!');
    await swapPair(i, j, {glow, ms: glow ? 700 : 560}); if(G !== tg) return;
  }
}
// one swap: the two cards slide past each other on an arc (one lifts, one dips), then trade places in G.cards + the DOM (dataset.i kept in step)
function swapPair(i, j, o){ o = o || {}; return new Promise(async res => {
  const A = G.cards[i], B = G.cards[j], tg = G; if(!A || !B || i === j){ res(); return; }
  const done = () => { if(G !== tg || G.cards[i] !== A || G.cards[j] !== B){ res(); return; }
    [G.cards[i], G.cards[j]] = [B, A]; G.swaps++;
    const board = $('board'), ea = A.el, eb = B.el, ph = document.createElement('span'); board.replaceChild(ph, ea); board.replaceChild(ea, eb); board.replaceChild(eb, ph);
    ea.dataset.i = j; eb.dataset.i = i; ea.style.zIndex = ''; ea.classList.remove('swap'); eb.classList.remove('swap'); res(); };
  if(FAST() || !A.el.animate){ done(); return; }
  if(o.glow){ A.el.classList.add('swap'); B.el.classList.add('swap'); await wait(420); if(G !== tg){ res(); return; } }
  const ra = A.el.getBoundingClientRect(), rb = B.el.getBoundingClientRect(), dx = rb.left - ra.left, dy = rb.top - ra.top, ms = o.ms || 600, lift = Math.max(8, Math.min(36, ra.width * 0.35));
  const kf = (x, y, up) => [{transform: 'translate(0px,0px) scale(1)'}, {transform: 'translate(' + x / 2 + 'px,' + (y / 2 + (up ? -lift : lift)) + 'px) scale(' + (up ? 1.14 : 0.9) + ')', offset: 0.5}, {transform: 'translate(' + x + 'px,' + y + 'px) scale(1)'}];
  if(!o.quiet) UISound.play('whoosh');
  A.el.style.zIndex = 6; const ease = 'cubic-bezier(.45,0,.3,1)';
  const an = A.el.animate(kf(dx, dy, true), {duration: ms, easing: ease}); B.el.animate(kf(-dx, -dy, false), {duration: ms, easing: ease});
  let fin = false; const end = () => { if(fin) return; fin = true; done(); }; an.onfinish = end; setTimeout(end, ms + 250);
}); }
function sparkle(el){ if(FAST()) return; const r = el.getBoundingClientRect(); for(let k = 0; k < 7; k++){ const s = document.createElement('div'); s.className = 'spark'; s.textContent = pick(['✨', '⭐', '💫', '🎉']); s.style.left = (r.left + r.width / 2 - 10) + 'px'; s.style.top = (r.top + r.height / 2 - 10) + 'px'; const a = k / 7 * 6.28; s.style.setProperty('--dx', Math.cos(a) * 60 + 'px'); s.style.setProperty('--dy', Math.sin(a) * 60 + 'px'); document.body.appendChild(s); setTimeout(() => s.remove(), 850); } }
function floatText(el, text){ if(FAST()) return; const r = el.getBoundingClientRect(), s = document.createElement('div'); s.className = 'spark'; s.style.cssText = 'left:' + (r.left + r.width / 2 - 30) + 'px;top:' + r.top + 'px;font-family:Fredoka,sans-serif;font-weight:700;color:#FFD84D;text-shadow:0 2px 0 #000;font-size:1.1rem;white-space:nowrap'; s.style.setProperty('--dx', '0px'); s.style.setProperty('--dy', '-50px'); s.textContent = text; document.body.appendChild(s); setTimeout(() => s.remove(), 850); }
function elapsed(){ return G.started ? performance.now() - G.t0 - G.pausedTotal - (G.paused ? performance.now() - G.pausedAt : 0) : 0; }
function hud(){
  if(!G) return; const P = G.players[G.turn], solo = G.players.length === 1;
  if(solo) BAR.hide('turn'); else BAR.count('turn', '👉', P.name, 'Whose turn');
  BAR.score((solo ? P.score : G.players.reduce((s, p) => s + p.score, 0)).toLocaleString());
  BAR.count('pairs', '🃏', G.found + '/' + G.pairs, 'Pairs found'); BAR.miss(G.players.reduce((s, p) => s + p.miss, 0));
  if(G.mode === 'time'){ const left = G.limit - elapsed(); BAR.time(fmt(Math.max(0, left + 999)), left < 15000); if(left <= 0 && G.started && !G.over) timeUp(); }   /* ⏱️ mm-3: counts down */
  else BAR.time(fmt(elapsed()));
  G.players.forEach((p, i) => { const d = $('pl-' + i); if(!d) return; d.classList.toggle('now', i === G.turn && !G.over); $('sc-' + i).textContent = p.pairs; $('pile-' + i).textContent = p.score + ' pts' + (p.streak > 1 ? ' · 🔥' + p.streak : ''); });
  if(lockHandle){ const left = lockHandle.remainingMs(); BAR.left(left, left < 120000); }
}
// Keyboard: arrows move the yellow box, Enter/Space flips.
function markCursor(){ if(!G) return; G.cards.forEach((c, i) => c.el.classList.toggle('cursor', i === G.cursor && G.kbd)); }
document.addEventListener('keydown', e => {
  if(!G || G.over || $('scr-play').classList.contains('hidden')) return;
  const n = G.n, mv = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: -n, ArrowDown: n}[e.code];
  if(mv){ e.preventDefault(); G.kbd = true; const k = G.cursor + mv; if(k >= 0 && k < G.cards.length && !(Math.abs(mv) === 1 && Math.floor(k / n) !== Math.floor(G.cursor / n))) G.cursor = k; markCursor(); G.cards[G.cursor].el.focus({preventScroll: true}); return; }
  if((e.code === 'Enter' || e.code === 'Space') && G.kbd){ e.preventDefault(); flip(G.cursor); }
});
function leavePlay(){
  if(G && G.lx){ lxLeavePlay(); return; }   /* 📡 mm-4 */
  if(!G || G.over){ backToMenu(); return; }
  pauseGame();
  UI.confirm({icon: '◀', title: 'Leave this game?', body: 'This board won\'t be saved.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(!G) return; resume(); if(ok) backToMenu(); });
}
function endEarly(){ leavePlay(); }
function backToMenu(){ if(window.Cheer) Cheer.unmount(); clearInterval(timerId); G = null; $('hand').classList.add('hidden'); $('peek').classList.add('hidden'); hideResult(); renderSetup(); showScreen('menu'); }
function pauseGame(){ if(G && !G.paused){ G.paused = true; G.pausedAt = performance.now(); } }
function resume(){ if(G && G.paused && !G.over){ G.pausedTotal += performance.now() - G.pausedAt; G.paused = false; } }

/* ================= END + SAVE ================= */
function starsFor(p, pairs){ return p.miss <= Math.ceil(pairs * 0.5) ? 3 : p.miss <= pairs * 1.2 ? 2 : 1; }
function finishGame(){
  if(!G || G.over) return;
  G.over = true; clearInterval(timerId); hud(); $('hand').classList.add('hidden');
  const thisGame = G, L = G.L, M = G.M, secs = Math.max(1, Math.round(elapsed() / 1000)), solo = G.players.length === 1;
  const top = Math.max.apply(null, G.players.map(p => p.pairs)), winners = G.players.filter(p => p.pairs === top); cheerEnd(winners); /* 📣 cs-3b */
  const ta = G.mode === 'time', theme = M.name + ' · ' + (ta ? 'Time attack' : G.mode === 'steam' ? 'STEAM pairs' : 'Classic') + ' · ' + G.D.name;   /* 🔗 mm-5 */   // 🗺️ the map in the Theme column → leaders per map
  G.players.forEach((p, i) => {
    if(solo) p.score += Math.round(((ta ? Math.max(0, Math.round((G.limit - elapsed()) / 1000)) * 20 : 0) + Math.max(0, M.par - secs) * 5 + (p.miss === 0 ? 300 : 0)) * G.mult);
    const win = solo || winners.includes(p), stars = !win ? 0 : ta ? (secs <= M.par ? 3 : secs <= M.par * 1.4 ? 2 : 1) : starsFor(p, G.pairs);
    p.stars = stars; p.win = win;
    const d = $('pl-' + i); if(d) d.classList.toggle('win', win && !solo); cheer(i, win ? pick(['dance', 'floss', 'disco', 'cheer']) : 'clap', 3);
    if(!G.lx || i === G.lx.me) saveWin(p.name, G.lvl, {timeSec: secs, stars, score: p.score, theme, cleared: win, stats: {pairs: p.pairs, bestStreak: p.best, perfect: solo && p.miss === 0 ? 1 : 0, wins: !solo && win ? 1 : 0}}, i);
  });
  UISound.play('success');
  say(solo ? 'All pairs found!' : (winners.length > 1 ? 'It\'s a tie!' : winners[0].name + ' wins!'));
  setTimeout(() => {
    if(G !== thisGame) return;
    const me = G.players[0], miss = G.players.reduce((s, p) => s + p.miss, 0), lvl = G.lvl, nextOk = solo && me.win && lvl < 5 && !G.lx;
    const base = {wrap: $('result'), card: $('result-card'), save: 'Saving…', confetti: ['🃏', '⭐', '🎉', G.D.icon],
      levels: () => thisGame.lx ? lxExit() : backToMenu(), again: () => thisGame.lx ? lxAgain() : startGame(lvl), againText: thisGame.lx ? '🔁 Play again · new cards' : '🔄 Play again'};   /* 📡 mm-4 */
    if(thisGame.lx) base.levelsText = thisGame.lx.role === 'host' ? '🚪 End the room' : '🚪 Leave';
    if(solo){
      GF.result(Object.assign(base, {win: true, icon: '🏆', title: G.mode === 'time' ? '⏱️ Beat the clock!' : 'All ' + G.pairs + ' pairs!', sub: (G.mode === 'time' ? 'Time attack · par ' + fmt(M.par * 1000) + ' · ' : '') + M.name + ' · ' + L.emoji + ' ' + L.name, stars: me.stars,
        stats: [['🏆', me.score.toLocaleString()], ['⏱', fmt(secs * 1000)], ['❌', me.miss + ' misses'], ['🔥', 'best streak ' + me.best]].concat(me.miss === 0 ? [['💯', 'perfect!']] : []).concat(G.swaps ? [['🔀', G.swaps + ' swaps']] : []),
        buddy: {name: me.name, av: myAvatar(me.name)},
        next: nextOk ? () => { if(!canPlay(lvl + 1)){ UI.toast('Saving… try again in a moment', 'err'); return; } PICK.lvl = lvl + 1; savePrefs(); startGame(lvl + 1); } : null,
        nextText: lvl === 4 ? 'Try 💀 Hardcore ▶' : 'Next level ▶'}));
    } else {
      const w = winners[0];
      GF.result(Object.assign(base, {win: winners.length > 1 ? null : true, icon: winners.length > 1 ? '🤝' : '👑', title: winners.length > 1 ? 'A tie!' : w.name + ' wins!', sub: M.name + ' · ' + L.emoji + ' ' + L.name,
        stats: [['⏱', fmt(secs * 1000)], ['❌', miss + ' misses']].concat(G.swaps ? [['🔀', G.swaps + ' swaps']] : []), buddy: {name: w.name, av: myAvatar(w.name)}}));
      const card = $('result-card'), row = card.querySelector('.res-btns'), pod = document.createElement('div'); pod.className = 'podium';
      pod.innerHTML = G.players.slice().sort((a, b) => b.pairs - a.pairs || b.score - a.score).map((p, i) => '<div style="border-left:6px solid ' + p.col + '">' + (p.win ? '👑' : ['🥈', '🥉', '🎈'][Math.min(2, i - 1)] || '🎈') + ' ' + UI.esc(p.name) + '<b>' + p.pairs + ' pairs · ' + p.score.toLocaleString() + '</b></div>').join('');
      if(row) card.insertBefore(pod, row);
    }
    putNote(-1, ''); cheerFaces();   /* 📣 cs-3b: the crowd's faces on the card */
  }, FAST() ? 0 : 1200);
}
// ⏰ Time attack: the clock ran out — the board ends, what you found still counts (no level cleared)
function timeUp(){
  if(!G || G.over) return; G.over = true; G.wait = true; clearInterval(timerId); $('hand').classList.add('hidden');
  const thisGame = G, me = G.players[0], M = G.M, L = G.L, secs = Math.round(G.limit / 1000), lvl = G.lvl;
  UISound.play('bump'); say('Time is up!'); showBanner('⏰ Time\'s up!', 'bad'); cheerEnd([]);
  G.cards.forEach(c => { if(!c.done){ c.up = true; paint(c); } });   // show where the rest were
  me.stars = 0; me.win = false;
  saveWin(me.name, lvl, {timeSec: secs, stars: 0, score: me.score, theme: M.name + ' · Time attack · ' + G.D.name, cleared: false, stats: {pairs: me.pairs, bestStreak: me.best}}, 0);
  setTimeout(() => { if(G !== thisGame) return;
    GF.result({wrap: $('result'), card: $('result-card'), win: false, icon: '⏰', title: 'Time\'s up!', sub: me.pairs + ' of ' + G.pairs + ' pairs · ' + M.name + ' · ' + L.emoji + ' ' + L.name,
      stats: [['🃏', me.pairs + '/' + G.pairs + ' pairs'], ['🏆', me.score.toLocaleString()], ['❌', me.miss + ' misses']], save: 'Saving…', buddy: {name: me.name, av: myAvatar(me.name)},
      levels: () => backToMenu(), again: () => startGame(lvl), againText: '🔄 Try again'});
    putNote(-1, ''); cheerFaces(); }, FAST() ? 0 : 1500);
}
let bannerTimer = 0;
function showBanner(text, kind){ const b = $('banner'); b.textContent = text; b.classList.toggle('gold', kind === 'gold'); b.classList.toggle('bad', kind === 'bad'); b.classList.add('on'); clearTimeout(bannerTimer); bannerTimer = setTimeout(() => b.classList.remove('on'), 1900); }
const PENDING_KEY = 'sp_memory_pending';
const NOTES = [];
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function flushPending(){ const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))).saveLevelResult(GAME_ID, w.name, w.lvl, w.extra)); }
function putNote(i, html){ if(i >= 0) NOTES[i] = html; const put = () => { const n = $('save-note'); if(n && NOTES.some(Boolean)) n.innerHTML = NOTES.filter(Boolean).join('<br>'); return !!n; }; if(!put()) setTimeout(put, 1500); }
function saveWin(name, lvlIdx, extra, seat, tries){
  tries = tries || 0; if(seat === 0 && !tries) NOTES.length = 0;
  const p = S.progress[name] || (S.progress[name] = {unlocked: 0, tokens: [], best: []});
  const who = G && G.players.length > 1 ? UI.esc(name) + ': ' : '';
  google.script.run.withSuccessHandler(res => {
      const best = (p.best || [null, null, null, null, null]).slice(); if(res.best) best[lvlIdx] = res.best;
      S.progress[name] = {unlocked: res.unlocked, tokens: res.tokens, best}; flushPending(); putNote(seat, who + saveText(res));
    }).withFailureHandler(err => {
      if(tries < 1){ setTimeout(() => saveWin(name, lvlIdx, extra, seat, tries + 1), 1200); return; }
      writePending(readPending().concat([{name, lvl: lvlIdx, extra}])); putNote(seat, who + '⚠️ Could not save yet — it will be sent again next time.');
    }).saveLevelResult(GAME_ID, name, lvlIdx, extra);
}
function saveText(res){
  let h = res.newBadge ? '<span class="new-badge">🏅 New badge: ' + UI.esc(res.newBadge) + '</span>' : res.newHighScore && !res.firstTime ? '🎉 New high score!' : res.best && res.best.score ? 'Best: 🏆 ' + Number(res.best.score).toLocaleString() : '✅ Saved';
  const fe = res.feats; if(fe){ (fe.newTitles || []).forEach(t => { h += '<br><span class="title-new">🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name) + '</span>'; }); (fe.newBadges || []).forEach(b => { h += '<br><span class="feat-new">' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName + '</span>'; }); }
  return h;
}
/* 📣 CHEERSQUAD (cs-3b) START — the crowd beside the board (CheerSquad.html, 📣 Cheer chat; same method as Chess / Checkers). Don't remove: the Cheer chat re-applies it. */
function cheerTaken(){ return Array.from(document.querySelectorAll('#gbar, #board, #side, #turncard, #peek:not(.hidden), .top-btn')); }
function cheerMount(){
  if(!window.Cheer || !G) return; Cheer.unmount(); const box = $('scr-play');
  Cheer.mount(box, {game: 'memory', players: G.players.map((p, i) => ({name: p.name, side: i, human: true})).concat(G.players.length < 2 ? [{name: 'Shuffles', side: 1, human: false}] : []), me: {name: S.player}, family: (S.players || []).map(p => p.Name), avatars: S.avatars || {}, mode: 'overlay',
    zones: () => Cheer.freeZones(box, cheerTaken), avoid: cheerTaken,
    clear: b => { const B = box.getBoundingClientRect(), F = $('board').getBoundingClientRect(), l = F.left - B.left, t = F.top - B.top; return !(b.r > l - 3 && b.l < l + F.width + 3 && b.b > t - 3 && b.t < t + F.height + 3); }});
}
function cheerGo(){ if(!window.Cheer || !Cheer.active() || !G) return; Cheer.hush(false); Cheer.react('start', {side: 0}); }
function cheerSay(kind, i){ if(!window.Cheer || !Cheer.active() || !G) return; Cheer.react(kind, {side: i}); }
function cheerEnd(winners){ if(!window.Cheer || !Cheer.active() || !G) return; Cheer.hush(false);
  if(!winners) return Cheer.react('lose', {side: G.turn});   /* 💀 hardcore: a card you'd seen */
  if(winners.length !== 1) return Cheer.react('goal', {side: -1});   /* a tie: everyone claps */
  Cheer.react('win', {side: G.players.indexOf(winners[0])}); }
function cheerFaces(){ setTimeout(() => { const card = $('result-card'); if(!card || !window.Cheer || !Cheer.active() || card.querySelector('.cs-faces') || $('result').classList.contains('hidden')) return;
  const c = Cheer.faces(5, {h: 54}); if(!c) return; const cap = document.createElement('div'); cap.className = 'cs-faces-cap'; cap.textContent = '📣 Your cheer squad';
  const at = card.querySelector('.res-btns'); if(!at) return; card.insertBefore(c, at); card.insertBefore(cap, at); }, 900); }
/* 📣 CHEERSQUAD END */
function hideResult(){ $('result').classList.add('hidden'); }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goGameroom(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }   // 🧭 p1b: ◀ = where you came from (Gameroom if we don't know)

/* ================= BOOT ================= */
function boot(){
  UI.loading('memory');
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
const MS_GAME = 'memory';
let MS_WANT = '';
function msOpen(id){
  if(id === 'time'){ MS_WANT = id; PICK.mode = 'time'; savePrefs(); renderSetup(); UI.toast('⏱️ Time attack picked — ▶ Play, then ▶ Start'); return; }   /* ⏱️ mm-3 */
  if(id === 'steam'){ MS_WANT = id; PICK.mode = 'steam'; savePrefs(); renderSetup(); UI.toast('🔗 STEAM pairs picked — ▶ Play, then ▶ Start'); return; }   /* 🔗 mm-5 */
  if(id !== 'friends') return; MS_WANT = id;   // 🧱 mm-1: friends = the cover's 👥 Same device → tap ➕ to add them
  if(MemCover && MemCover.setMode){ MemCover.show(); MemCover.setMode('same'); }
  UI.toast('👥 Tap ➕ on the cover to add your friends');
}
function msNow(){ return PICK.mode; }   /* 🗂️ mm-5: classic · steam · time */
function msWrap(fn, idOf){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ try{ const id = idOf.apply(this, arguments); if(id && UI.modeTried) UI.modeTried(S.player || CURRENT_PLAYER, MS_GAME, id); }catch(e){} return f.apply(this, arguments); }; }
function msAfter(fn, after){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; }
msWrap('startGame', () => PICK.mode === 'steam' ? 'steam' : SEATS.length > 1 ? 'friends' : PICK.mode === 'time' ? 'time' : '');
msAfter('choosePlayer', name => {
  if(!window.UI || !UI.modeLink) return;
  const id = UI.modeLink(MODE_LINK); if(id) msOpen(id);
  UI.alsoTry({game: MS_GAME, player: name, current: msNow, at: () => document.querySelector('#scr-menu .title'), open: msOpen});
});
/* ✨ END MODE SPOTLIGHT */
/* 📡 LINK (mm-4): 🃏 Memories Match on 2–4 own devices (LinkKit — the ♟️ Chess lk-3b / 📺 lk-5a pattern).
   The host's device is the referee and keeps the true board: it deals (faces in card order), plans the 💀 scramble and every 🔀 swap, and checks every flip.
   Only the player whose turn it is can flip — on their own device; the flip shows at once there and is replayed on every other device.
   Messages: host → guests mmgo {cfg, st} (start / whole board) · mmswap {id, k, plan, glow} (the swaps after miss k) · both ways mmflip {id, tn, i}
   · guest → host mmask (send me the board) · mmhi {phone} (a phone in the room → no 10×10) · mmagain (🔁 on a guest's result card).
   Every device saves ONLY its own player. 📺 Room hostess: the host screen shows the board (no player), 1–4 players flip on their own devices. */
const LX = {wired: false, lobby: null, pending: null, cfg: null, games: 0, autoT: 0, phone: {}, plans: {}, waits: {}, tv: false};
const LX_AUTO_MS = window.LX_AUTO_MS || 15000;   // a dropped player's turn is skipped after this
const LX_PLAN_MS = window.LX_PLAN_MS || 8000;    // a guest waits this long for the host's swap plan, then asks for the whole board
function lxAv(cv, p){ const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); if(typeof drawPreviewCanvas === 'function') drawPreviewCanvas(cv, myAvatar(p.name), {name: p.name, t: 1}); }
function lxCloseLobby(){ if(LX.lobby && LX.lobby.close) LX.lobby.close(); LX.lobby = null; }
function lxIdle(){ try{ if(window.Link && Link.status() !== 'idle') Link.leave(); }catch(e){} }
function lxHostName(){ return (LX.cfg && LX.cfg.host) || 'The host'; }
// 🎚️ the host's picks for the room (map · level · deck), right above the lobby — tap to change
function lxPicks(on){
  const el = $('lx-picks'); if(!on){ el.innerHTML = ''; el.classList.add('hidden'); return; } el.classList.remove('hidden');
  if(!mapOk(mapOf(PICK.map))) PICK.map = '8'; if(!canPlay(PICK.lvl)) PICK.lvl = 0;
  const stM = PICK.mode === 'steam', M = mapOf(PICK.map), L = LEVELS[PICK.lvl] || LEVELS[0], D = stM ? ST_DECKS[PICK.sdeck] || ST_DECKS.smix : DECKS[PICK.deck] || DECKS.mix;
  el.innerHTML = '<button class="lxp" data-k="mode" data-sound="none">' + (stM ? '🔗 STEAM pairs' : '🃏 Classic') + '</button><button class="lxp" data-k="map" data-sound="none">🗺️ ' + M.name + '</button><button class="lxp" data-k="lvl" data-sound="none">' + L.emoji + ' ' + L.name + '</button><button class="lxp" data-k="deck" data-sound="none">' + D.icon + ' ' + D.name + '</button>' +
    '<div class="lxp-note">' + (M.n === 10 ? '🟥 10×10 is for tablets + computers — a phone in the room plays 8×8' : 'Tap to change · everyone plays the same board') + '</div>';
  el.querySelectorAll('.lxp').forEach(b => b.onclick = () => { lxCycle(b.dataset.k); lxPicks(true); });
}
function lxCycle(k){
  const nx = (ks, v) => ks[(ks.indexOf(v) + 1) % ks.length];
  if(k === 'map') PICK.map = nx(MAPS.filter(mapOk).map(m => m.k), PICK.map);
  if(k === 'lvl') PICK.lvl = nx([0, 1, 2, 3, 4, 5].filter(canPlay), PICK.lvl);
  if(k === 'mode') PICK.mode = PICK.mode === 'steam' ? 'classic' : 'steam';   /* 🔗 mm-5 */
  if(k === 'deck'){ if(PICK.mode === 'steam') PICK.sdeck = nx(ST_KEYS, PICK.sdeck); else PICK.deck = nx(DECK_KEYS, PICK.deck); }
  savePrefs(); UISound.play('tap');
}
function lxChoose(){
  lxWire(); lxCloseLobby(); lxIdle(); lxPicks(false);
  $('lx-sub').textContent = 'Each player on their own phone, tablet or computer — same Wi-Fi or 🌍 anywhere'; showScreen('link');
  $('lx-lobby').innerHTML = '<div class="lx-pick"><button class="btn sp-btn sp-primary" id="lx-host" data-sound="pop">🎮 Host and play<small>this device plays too · 2–4 players</small></button>' +
    '<button class="btn sp-btn sp-primary lx-tv" id="lx-tv" data-sound="pop">📺 Room hostess<small>this screen shows the cards on the TV · everyone flips on their own device</small></button>' +
    '<button class="btn sp-btn sp-secondary" id="lx-join" data-sound="pop">🔗 Join a friend</button></div>';
  $('lx-host').onclick = () => lxOpenHost(false); $('lx-tv').onclick = () => lxOpenHost(true); $('lx-join').onclick = () => lxJoin();
}
async function lxOpenHost(tv){
  lxWire(); lxCloseLobby(); lxIdle(); LX.tv = !!tv; LX.phone = {};
  $('lx-sub').textContent = tv ? '📺 This screen is the Room hostess — players tap 🔗 Join a friend on their own devices' : 'Friends tap 🔗 Join a friend on their own phone or tablet — same Wi-Fi or 🌍 anywhere'; showScreen('link'); lxPicks(true);
  const el = $('lx-lobby'); el.innerHTML = '<div class="lk"><div class="lk-msg"><span class="ui-spin a-bob">' + (tv ? '📺' : '📡') + '</span> Opening the room<span class="lk-dots"></span></div></div>';
  try{ await Link.host({game: 'Memories Match', name: S.player, seats: 4, hostess: !!tv, page: 'memory', label: '🃏 Memories Match · 2–4 players' + (tv ? ' · 📺 on the TV' : '')}); }
  catch(e){ UISound.play('error'); el.innerHTML = '<div class="lk"><div class="lk-msg bad">😕 ' + UI.esc((e && e.message) || 'Could not open the room') + '</div></div>'; return; }
  if($('scr-link').classList.contains('hidden')) return;
  LX.lobby = Link.lobby(el, {title: '🃏 Memories Match · ' + (tv ? '1–4 players' : '2–4 players'), url: WEBAPP_URL + '?page=memory', minPlayers: tv ? 1 : 2, soloBot: !!tv, name: S.player, drawAvatar: lxAv, kind: 'memory', onStart: lxHostGo});
}
function lxJoin(code){
  lxWire(); lxCloseLobby(); lxIdle(); lxPicks(false);
  $('lx-sub').textContent = 'Same Wi-Fi as the host — or 🌍 anywhere'; showScreen('link');
  LX.lobby = Link.lobby($('lx-lobby'), {title: '🃏 Memories Match', name: S.player, drawAvatar: lxAv, soloBot: true, code: code || undefined,
    onJoined: () => { UISound.play('success'); try{ Link.send('mmhi', {phone: isPhone()}, {sure: true}); }catch(e){} }});
}
function lxExit(){
  lxIdle(); lxCloseLobby(); clearTimeout(LX.autoT); LX.cfg = null; LX.pending = null; lxPicks(false);
  const o = document.querySelector('.lx-over'); if(o) o.remove();
  if(G && G.lx){ if(window.Cheer) Cheer.unmount(); clearInterval(timerId); hideResult(); G = null; $('hand').classList.add('hidden'); $('peek').classList.add('hidden'); }
  SEATS = [S.player]; renderSetup(); showScreen('menu');
}
function lxLeavePlay(){
  if(G.over){ lxExit(); return; }
  const host = G.lx.role === 'host';
  UI.confirm({icon: '◀', title: host ? 'End the game for everyone?' : 'Leave this game?', body: host ? 'You are the ' + (G.lx.tv ? '📺 Room hostess' : 'host') + ' — the game stops on every device.' : 'Your turns are skipped until you come back.', okText: host ? 'End game' : 'Leave', cancelText: 'Keep playing'})
    .then(ok => { if(ok) lxExit(); });
}
// ---- host ----
function lxHostGo(){
  const tv = !!(Link.hostess && Link.hostess());
  const list = Link.players().filter(p => p.name && p.on && !p.screen).sort((a, b) => a.seat - b.seat).slice(0, 4);
  if(list.length < (tv ? 1 : 2)){ UISound.play('error'); UI.toast(tv ? '📺 Wait for a player to join' : '📡 Wait for a friend to join'); return; }
  const r = LX.games++ % list.length, order = list.slice(r).concat(list.slice(0, r));   // a different player starts every round
  let map = mapOk(mapOf(PICK.map)) ? PICK.map : '8';
  if(map === '10' && order.some(p => LX.phone[p.seat])){ map = '8'; UI.toast('📱 A phone is in the room — 8×8 this time'); }
  LX.cfg = {id: Date.now().toString(36), host: S.player, tv, names: order.map(p => p.name), seats: order.map(p => p.seat === Link.seat() ? 'host' : p.seat), map, lvl: canPlay(PICK.lvl) ? PICK.lvl : 0, deck: PICK.deck, mode: PICK.mode === 'steam' ? 'steam' : 'classic', sdeck: PICK.sdeck};
  lxCloseLobby(); hideResult(); const o = document.querySelector('.lx-over'); if(o) o.remove();
  LX.pending = {role: 'host', me: tv ? -1 : order.findIndex(p => p.seat === Link.seat()), cfg: LX.cfg};
  lxStart(LX.cfg); lxSendGo(null, true);
}
function lxStart(cfg){   // the room's picks for this board only — the player's own setup picks stay
  const keep = {map: PICK.map, deck: PICK.deck, mode: PICK.mode, sdeck: PICK.sdeck}; SEATS = cfg.names.slice(); PICK.map = cfg.map; PICK.deck = cfg.deck; PICK.mode = cfg.mode === 'steam' ? 'steam' : 'classic'; PICK.sdeck = cfg.sdeck || 'smix';   /* 🔗 mm-5 */
  try{ startGame(cfg.lvl); } finally { Object.assign(PICK, keep); }
}
function lxSeat(){   // called by startGame right after the new board is made (LX.pending → G.lx)
  const P = LX.pending; if(!P) return; LX.pending = null; LX.plans = {}; LX.waits = {};
  G.lx = {role: P.role, me: P.me, id: P.cfg.id, seats: P.cfg.seats, tv: !!P.cfg.tv, away: {}, skip: !!P.skip}; G.flips = 0; G.mk = 0;
  if(P.faces && P.faces.length === G.cards.length) G.cards = P.faces.map((f, i) => ({f, id: i, up: false, done: false, by: -1, seen: false}));
  if(P.role === 'host'){ const all = G.cards.map((c, i) => i); G.lx.scr = []; for(let k = 0; k < G.n; k++){ const i = pick(all); let j = i, g = 0; while(j === i && g++ < 20) j = pick(all); G.lx.scr.push([i, j]); } }
  else G.lx.scr = P.scr || null;
  $('scr-play').classList.toggle('lx-tv', G.lx.me < 0);
}
function lxState(){ return {id: G.lx.id, faces: G.cards.map(c => c.f), done: G.cards.map(c => c.done ? c.by + 1 : 0), seen: G.cards.map(c => c.seen ? 1 : 0), open: G.open.map(c => G.cards.indexOf(c)),
  pl: G.players.map(p => [p.pairs, p.score, p.miss, p.streak, p.best]), turn: G.turn, found: G.found, flips: G.flips, mk: G.mk, swaps: G.swaps, scr: G.lx.scr, started: !!G.started}; }
function lxGuestSeats(){ return G && G.lx ? G.lx.seats.filter(s => s !== 'host') : []; }
function lxSendGo(only, fresh){
  if(!(G && G.lx && G.lx.role === 'host')) return;
  if(!fresh && G.wait && !G.over){ setTimeout(() => lxSendGo(only), 150); return; }   // a pair / swap is still moving: send the board once it is still
  lxGuestSeats().forEach(s => { if(only == null || only === s) Link.send('mmgo', {cfg: LX.cfg, st: lxState()}, {sure: true, to: s}); });
}
function lxPlanSwaps(n){   // the same rule as doSwaps (a seen card moves 70 % of the time), decided once on the host
  const seen = G.cards.map(c => !!c.seen), hid = hiddenIdx(), out = [];
  for(let k = 0; k < n; k++){ if(hid.length < 3) break; const s = hid.filter(i => seen[i]); const i = s.length && Math.random() < 0.7 ? pick(s) : pick(hid); let j = i, g = 0; while(j === i && g++ < 20) j = pick(hid);
    out.push([i, j]); [seen[i], seen[j]] = [seen[j], seen[i]]; }
  return out;
}
function lxAwayCheck(){ clearTimeout(LX.autoT); if(!G || !G.lx || G.lx.role !== 'host' || G.over || !G.lx.away[G.turn]) return; LX.autoT = setTimeout(lxSkip, LX_AUTO_MS); }
function lxSkip(){   // 📶 the player whose turn it is dropped out: close their open card, next player
  if(!G || !G.lx || G.over || !G.lx.away[G.turn]) return; if(G.wait){ LX.autoT = setTimeout(lxSkip, 300); return; }
  G.open.forEach(c => { c.up = false; paint(c); }); G.open = [];
  const from = G.turn; let t = from, g = 0; do { t = (t + 1) % G.players.length; } while(G.lx.away[t] && t !== from && g++ < 6);
  if(t === from) return;
  showBanner('⏭️ ' + G.players[from].name + '\'s turn is skipped', 'bad'); G.turn = t; turnCard(t); hud(); lxSendGo();
}
// ---- every device ----
function lxAsk(){ if(G && G.lx) Link.send('mmask', {id: G.lx.id}, {sure: true}); }
function lxGotFlip(d, seat, tries){
  if(!G || !G.lx || !d || d.id !== G.lx.id || G.over) return;
  if((!G.started || G.wait || G.paused) && (tries || 0) < 240){ setTimeout(() => lxGotFlip(d, seat, (tries || 0) + 1), 150); return; }
  const host = G.lx.role === 'host', c = G.cards[d.i];
  const fromOk = !host || G.lx.seats[G.turn] === seat;   // only the device of the player whose turn it is
  if(!fromOk || d.tn !== G.flips || G.turn === G.lx.me || !c || c.up || c.done){ if(host) lxSendGo(seat); else lxAsk(); return; }   // out of step: the host's board is the truth
  if(host) lxGuestSeats().forEach(s => { if(s !== seat) Link.send('mmflip', d, {sure: true, to: s}); });   // pass it on to everyone else
  clearTimeout(LX.autoT); flip(d.i, true);
}
function lxWaitPlan(k){ return new Promise(res => { const key = G.lx.id + ':' + k; if(LX.plans[key]){ res(LX.plans[key]); delete LX.plans[key]; return; }
  const t = setTimeout(() => { delete LX.waits[key]; lxAsk(); res([]); }, LX_PLAN_MS); LX.waits[key] = p => { clearTimeout(t); res(p); }; }); }
// ---- guest ----
function lxGuestStart(d){
  LX.cfg = d.cfg; lxCloseLobby(); hideResult(); const o = document.querySelector('.lx-over'); if(o) o.remove();
  const st = d.st || {};
  LX.pending = {role: 'guest', me: d.cfg.seats.indexOf(Link.seat()), cfg: d.cfg, faces: st.faces, scr: st.scr, skip: !!st.started};
  lxStart(d.cfg);
  if(st.flips || st.found || st.started) lxApply(st);
}
function lxApply(st){
  if(!G || !G.lx || !st || st.id !== G.lx.id) return;
  if(G.wait && G.started && !G.over){ setTimeout(() => lxApply(st), 150); return; }
  if(st.flips === G.flips && st.found === G.found && st.turn === G.turn && st.started === !!G.started) return;   // already the same board
  G.cards = st.faces.map((f, i) => ({f, id: i, up: false, done: !!st.done[i], by: st.done[i] - 1, seen: !!st.seen[i]}));
  G.players.forEach((p, i) => { const a = st.pl[i] || []; p.pairs = a[0] || 0; p.score = a[1] || 0; p.miss = a[2] || 0; p.streak = a[3] || 0; p.best = a[4] || 0; });
  G.turn = st.turn; G.found = st.found; G.flips = st.flips; G.mk = st.mk; G.swaps = st.swaps || 0; G.open = []; G.lx.scr = st.scr || G.lx.scr;
  buildBoard(); (st.open || []).forEach(i => { const c = G.cards[i]; if(c){ c.up = true; G.open.push(c); } });
  G.players.forEach((p, i) => { const m = $('mine-' + i); if(m) m.innerHTML = ''; }); const pile = {};
  G.cards.forEach(c => { if(c.done && !pile[keyOf(c.f)]){ pile[keyOf(c.f)] = 1; const m = $('mine-' + c.by); if(m) m.insertAdjacentHTML('beforeend', '<i>' + (isSt(c.f) ? stThumb(c.f) : isFam(c.f) ? famThumb(c.f) : c.f) + '</i>'); } });
  paintAll(); layout(); hud();
  if(st.started && !G.started){ G.lx.skip = true; G.wait = false; $('peek').classList.add('hidden'); go(); }
  if(G.players.length > 1 && G.started) turnCard(G.turn);
  if(G.found === G.pairs && !G.over) finishGame();
}
function lxAgain(){
  if(!G || !G.lx || G.lx.role === 'host'){ lxHostGo(); return; }
  Link.send('mmagain', {id: G.lx.id}, {sure: true}); UI.toast('🔁 Asked ' + lxHostName() + ' for a new round');
}
function lxEnded(msg){
  if(G){ G.over = true; clearTimeout(LX.autoT); }
  hideResult(); const o0 = document.querySelector('.lx-over'); if(o0) o0.remove();
  const o = document.createElement('div'); o.className = 'lx-over';
  o.innerHTML = '<div class="result-card"><div class="big">📡</div><h2>' + UI.esc(msg) + '</h2><div class="note">Thanks for playing together!</div><div class="res-btns"><button class="btn sp-btn sp-primary" data-sound="none" onclick="lxExit()">◀ Memories Match</button></div></div>';
  document.body.appendChild(o);
}
// ---- the game's own functions, linked (wrapped from outside) ----
(function(){
  const flip0 = flip, doSwaps0 = doSwaps, turnCard0 = turnCard, pause0 = pauseGame;
  flip = function(i, remote){
    if(!G || !G.lx) return flip0(i);
    if(remote) return flip0(i);
    if(!G.started || G.over || G.wait) return;
    if(G.lx.me < 0 || G.turn !== G.lx.me){ UISound.play('error'); UI.toast(G.lx.me < 0 ? '📺 The players flip on their own devices' : '👉 It\'s ' + G.players[G.turn].name + '\'s turn — watch and remember!'); return; }
    const tn = G.flips; flip0(i); if(G.flips === tn) return;   // nothing flipped
    Link.send('mmflip', {id: G.lx.id, tn, i}, {sure: true});   // host → every player · guest → the host (it checks, then passes it on)
  };
  doSwaps = async function(n, glow){
    if(!G || !G.lx) return doSwaps0(n, glow);
    const tg = G, k = ++G.mk; let plan;
    if(G.lx.role === 'host'){ plan = lxPlanSwaps(n); Link.send('mmswap', {id: G.lx.id, k, plan, glow: !!glow}, {sure: true}); }
    else { plan = await lxWaitPlan(k); if(G !== tg) return; }
    for(let q = 0; q < plan.length; q++){
      if(q === 0) showBanner(glow ? '🔀 Watch — two cards swap places!' : n > 1 ? '🐟 Goldie swaps 2 × 2 cards!' : '🐟 Goldie swapped two cards!');
      await swapPair(plan[q][0], plan[q][1], {glow, ms: glow ? 700 : 560}); if(G !== tg) return;
    }
  };
  turnCard = function(i, first){
    turnCard0(i, first); if(!G || !G.lx) return;
    if(i === G.lx.me){ $('turn-name').textContent = (first ? '🎲 ' : '👉 ') + 'Your turn, ' + G.players[i].name + '!'; $('turn-sub').textContent = '📱 Flip two cards on this device'; }
    else if(G.lx.me >= 0) $('turn-sub').textContent = '👀 Watch — remember where the cards are!';
    if(G.lx.role === 'host') lxAwayCheck();
  };
  pauseGame = function(){ if(G && G.lx) return; return pause0.apply(this, arguments); };   // a linked board never pauses (the others keep playing)
})();
function lxWire(){
  if(LX.wired || !window.Link) return; LX.wired = true;
  // guest side
  Link.on('mmgo', d => { if(Link.isHost() || !d || !d.cfg) return; if(G && G.lx && G.lx.id === d.cfg.id){ lxApply(d.st); return; } lxGuestStart(d); });
  Link.on('mmswap', d => { if(Link.isHost() || !d || !G || !G.lx || d.id !== G.lx.id) return; const key = d.id + ':' + d.k;
    if(LX.waits[key]){ const f = LX.waits[key]; delete LX.waits[key]; f(d.plan || []); } else LX.plans[key] = d.plan || []; });
  Link.on('hostleft', e => { if(Link.isHost()) return; if(!G && $('scr-link').classList.contains('hidden')) return;
    UISound.play('bump'); lxEnded(e && e.reason === 'lost' ? '📶 Lost the link to ' + lxHostName() : '👋 ' + lxHostName() + ' ended the game'); });
  // both
  Link.on('mmflip', (d, seat) => lxGotFlip(d, seat, 0));
  // host side
  Link.on('mmask', (d, seat) => { if(Link.isHost() && G && G.lx && d && d.id === G.lx.id) lxSendGo(seat); });
  Link.on('mmhi', (d, seat) => { if(Link.isHost() && d) LX.phone[seat] = !!d.phone; });
  Link.on('mmagain', d => { if(Link.isHost() && G && G.lx && G.over && d && d.id === G.lx.id) lxHostGo(); });
  const idxOf = seat => G && G.lx ? G.lx.seats.indexOf(seat) : -1;
  Link.on('leave', e => { if(!Link.isHost() || !G || !G.lx || G.over) return; const i = idxOf(e.seat); if(i < 0) return;
    G.lx.away[i] = true; showBanner('📶 ' + G.players[i].name + ' dropped out — their turns are skipped until they come back', 'bad'); lxAwayCheck(); });
  const back = e => { if(!Link.isHost() || !G || !G.lx || !LX.cfg) return; const i = idxOf(e.seat); if(i < 0) return;
    if(G.lx.away[i]){ G.lx.away[i] = false; clearTimeout(LX.autoT); showBanner('👋 ' + G.players[i].name + ' is back!'); UISound.play('success'); }
    lxSendGo(e.seat); };
  Link.on('rejoin', back); Link.on('join', back);
  addEventListener('pagehide', () => { try{ if(Link.status() !== 'idle') Link.leave(); }catch(e){} });
}
// 🔗 QR / waiting room: ?page=memory&link=<code> → the number pad · ✨ ?mode=link / lhost / ljoin (Gameroom 📡 Connect)
function lxUrlCode(cb){
  try{ if(window.google && google.script && google.script.url && google.script.url.getLocation){ google.script.url.getLocation(l => cb(((l && l.parameter) || {}).link || '')); return; } }catch(e){}
  try{ cb(new URLSearchParams(location.search).get('link') || ''); }catch(e){ cb(''); }
}
msAfter('choosePlayer', () => {
  if(MODE_LINK === 'link' || MODE_LINK === 'lhost' || MODE_LINK === 'ljoin'){ if(MemCover) MemCover.hide(); if(MODE_LINK === 'ljoin') lxJoin(); else if(MODE_LINK === 'lhost') lxOpenHost(false); else lxChoose(); return; }
  lxUrlCode(c => { c = String(c || '').replace(/[^0-9]/g, '').slice(0, 4); if(c.length === 4){ if(MemCover) MemCover.hide(); lxJoin(c); } });
});
/* 📡 END LINK (mm-4) */
