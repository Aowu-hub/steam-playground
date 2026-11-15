
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ modes-3: ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const GAME_ID = 'memory';
const MM_VERSION = '3.1';   // 🃏 mm-1: shown on the cover footer — bump with each Memories Match round
// 🎛️ p1b: the shared top bar (UiKit UI.gameBar) — ◀ where you came from · 🎚️ Levels · 🏠 | 🃏 Memories Match · level | scoreboard | game buttons ❓ ⚙️
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🃏', name: 'Memories Match', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => { try{ clearInterval(timerId); }catch(e){} try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => { if(typeof pauseGame === 'function') pauseGame(); }, resume: () => { if(typeof resume === 'function') resume(); }},
  onFit: () => { if(G && typeof layout === 'function') layout(); },
  extras: []});
var NAV_INNER = {menu: ['◀ Memories Match', () => openCover()]};   // 🧱 mm-1: the setup's top button goes back to the 🎬 cover
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
const PICK = {map: '4', lvl: 0, deck: 'mix'};
function store(k){ return 'sp_memory_' + k + ':' + (S.player || ''); }
function loadPrefs(){ try{ const d = localStorage.getItem(store('deck')), m = localStorage.getItem(store('map')), l = localStorage.getItem(store('lv'));
    PICK.deck = DECKS[d] ? d : 'mix'; PICK.map = MAPS.some(x => x.k === m) ? m : '4'; PICK.lvl = l != null && l !== '' ? Number(l) : -1; }catch(e){} }
function savePrefs(){ try{ localStorage.setItem(store('deck'), PICK.deck); localStorage.setItem(store('map'), PICK.map); localStorage.setItem(store('lv'), String(PICK.lvl)); }catch(e){} }
function myAvatar(name){ const a = S.avatars[name || S.player]; return a ? fixAv(a) : defaultAvatar(name || S.player || 'player'); }
const mapOf = k => MAPS.find(m => m.k === k) || MAPS[0];

/* ================= MENUS ================= */
function showScreen(name){
  ['player', 'menu', 'play'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
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
  DECK_KEYS.forEach(k => { const D = DECKS[k], b = document.createElement('button'); b.className = 'deck' + (D.mix ? ' mix' : '') + (D.fam ? ' fam' : ''); b.dataset.k = k; b.setAttribute('data-sound', 'tap');
    b.innerHTML = '<div class="mini">' + (D.mix ? ['👾', '🐶', '📸', '🦸'] : D.fam ? ['🤳', '🤗', '✋', '🎉'] : D.cards.slice(0, 4)).join('') + '</div><div class="nm">' + D.icon + ' ' + D.name + '</div>';
    b.onclick = () => { PICK.deck = k; savePrefs(); markPicks(); }; db.appendChild(b); });
  markPicks();
}
function markPicks(){
  document.querySelectorAll('#map-list .mapc').forEach(b => gfPick(b, b.dataset.k === PICK.map));
  document.querySelectorAll('#level-list .lvl').forEach(b => gfPick(b, Number(b.dataset.i) === PICK.lvl));
  document.querySelectorAll('#deck-list .deck').forEach(b => gfPick(b, b.dataset.k === PICK.deck));
  const M = mapOf(PICK.map), L = LEVELS[PICK.lvl] || LEVELS[0], D = DECKS[PICK.deck];
  $('btn-start').textContent = '▶ Start · ' + M.name + ' · ' + L.emoji + ' ' + L.name + ' · ' + D.icon + (SEATS.length > 1 ? ' · 👥 ' + SEATS.length : '');
}
function startSetup(){ if(!canPlay(PICK.lvl)){ UISound.play('error'); UI.toast('Pick a level that is open 🔓'); return; } startGame(PICK.lvl); }
// 🎬 the cover (GameFrame): who's here (you + up to 3 friends on this device) + champions + how to play; ▶ Play opens the setup page
let MemCover = null;
const MM_HELP = ['Flip two cards — find the matching **pairs**! A pair stays up and you go again.', 'Pick a 🗺️ **map** (4×4 up to 10×10), then a 🎚️ **level**: peeks, look-alike cards, 🔀 swaps…', '💀 **Hardcore**: see every card, then watch them 🌀 scramble — and 2 cards swap after every miss!', 'Up to 4 players take turns: a pair = go again, the most pairs wins. Fewer misses = more ⭐.'];
function openCover(){
  if(!window.GF){ showScreen('menu'); return; }
  if(MemCover && MemCover.who !== S.player){ MemCover.destroy(); MemCover = null; }
  if(!MemCover){ MemCover = GF.cover(document.body, {game: 'memory', title: 'Memories Match', icon: '🃏', version: MM_VERSION, me: S.player, players: S.players, avatarOf: myAvatar, seats: {min: 1, max: 4},
      help: MM_HELP, acts: ['beat.cheer', 'beat.wave', 'beat.jump'], backTo: WEBAPP_URL + '?page=gameroom' + sessionQuery(), backKind: 'rooms', own: null,   // 📱 own devices = mm-4
      onPlay: line => { MemCover.hide(); SEATS = line.map(s => s.name); if(!SEATS.length) SEATS = [S.player]; renderSetup(); showScreen('menu'); } }); MemCover.who = S.player; }
  MemCover.show();
}

/* ================= GAME ================= */
function startGame(lvl){
  if(MemCover) MemCover.hide();   /* 🧱 mm-1 */
  clearInterval(timerId); hideResult();
  const L = LEVELS[lvl], M = mapOf(PICK.map), map = mapOk(M) ? M : mapOf('8'), D = DECKS[PICK.deck] || DECKS.mix, n = map.n, pairs = n * n / 2;
  const faces = dealFor(D, pairs, L.look), cards = shuffle(faces.concat(faces).map((f, i) => ({f, id: i, up: false, done: false, by: -1, seen: false})));
  G = {lvl, L, M: map, D, n, cards, pairs, open: [], wait: false, over: false, paused: false, t0: 0, pausedTotal: 0, started: false, cursor: 0, missRow: 0, guide: L.guide ? 1 : 0,
    mult: map.mult * L.mult, players: SEATS.map((nm, i) => ({name: nm, col: SEAT_COLS[i], pairs: 0, score: 0, miss: 0, streak: 0, best: 0})), turn: 0, found: 0, swaps: 0};
  BAR.level(L.emoji + ' ' + L.name + ' · ' + map.name + ' · ' + D.icon);
  buildBoard(); buildSide(); showScreen('play'); layout(); hud(); cheerMount(); /* 📣 cs-3b */
  if(L.reveal) revealScramble();
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
    const h = hiddenIdx(); if(h.length < 3) break; const i = pick(h); let j = i, g = 0; while(j === i && g++ < 20) j = pick(h);
    await swapPair(i, j, {ms: Math.round(460 - 170 * k / Math.max(1, n - 1)), glow: false, quiet: k % 2}); if(G !== tg) return;
  }
  G.scrambled = true; await wait(250); if(G !== tg) return; G.wait = false; go();
}
function go(){ G.started = true; cheerGo(); /* 📣 cs-3b */ G.t0 = performance.now(); G.pausedTotal = 0; if(G.players.length > 1) turnCard(0, true); else showBanner('🃏 Find all ' + G.pairs + ' pairs!'); timerId = setInterval(hud, 500); guideStep(); }
function buildBoard(){
  const b = $('board'); b.innerHTML = ''; b.style.gridTemplateColumns = 'repeat(' + G.n + ', var(--cs))'; b.style.setProperty('--deck-back', G.D.back); b.classList.toggle('dots', !!G.L.seen);
  G.cards.forEach((c, i) => { const el = document.createElement('button'); el.className = 'card'; el.dataset.i = i; el.setAttribute('aria-label', 'Card ' + (i + 1)); el.setAttribute('data-sound', 'none');
    el.innerHTML = '<span class="in"><span class="face back">' + G.D.mark + '</span>' + (isFam(c.f) ? '<span class="face front fam"><canvas></canvas></span>' : '<span class="face front">' + c.f + '</span>') + '</span>';
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
  c.up = true; c.seen = true; paint(c); UISound.play('tap'); G.open.push(c); G.cursor = i; markCursor();
  if(G.guide){ G.guide++; if(G.guide > 2){ G.guide = 0; } G.guideAt = null; guideStep(); }
  if(G.open.length < 2) return;
  G.wait = true; const [a, b] = G.open, P = G.players[G.turn], tg = G;
  if(a.f === b.f){
    setTimeout(() => {
      if(G !== tg) return;
      a.done = b.done = true; a.by = b.by = G.turn; paint(a); paint(b); G.found++; P.pairs++; P.streak++; P.best = Math.max(P.best, P.streak); G.missRow = 0;
      const gain = Math.round((100 + 50 * (P.streak - 1)) * G.mult); P.score += gain;
      const fx = () => { UISound.play('success'); sparkle(a.el); sparkle(b.el); floatText(b.el, '+' + gain + (P.streak > 1 ? ' 🔥×' + P.streak : '')); };
      if(isFam(a.f)) famPop([a, b], fx); else fx();   /* 📸 mm-2: the avatars come alive — sound + points on the contact beat */
      const mine = $('mine-' + G.turn); if(mine) mine.insertAdjacentHTML('beforeend', '<i>' + (isFam(a.f) ? famThumb(a.f) : a.f) + '</i>');
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
  const m = {}; G.cards.forEach(c => { if(!c.done) (m[c.f] = m[c.f] || []).push(c); }); const pr = Object.values(m).find(x => x.length === 2); if(!pr) return;
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
  BAR.time(fmt(elapsed()));
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
  const theme = M.name + ' · Classic · ' + G.D.name;   // 🗺️ the map in the Theme column → leaders per map
  G.players.forEach((p, i) => {
    if(solo) p.score += Math.round((Math.max(0, M.par - secs) * 5 + (p.miss === 0 ? 300 : 0)) * G.mult);
    const win = solo || winners.includes(p), stars = win ? starsFor(p, G.pairs) : 0;
    p.stars = stars; p.win = win;
    const d = $('pl-' + i); if(d) d.classList.toggle('win', win && !solo); cheer(i, win ? pick(['dance', 'floss', 'disco', 'cheer']) : 'clap', 3);
    saveWin(p.name, G.lvl, {timeSec: secs, stars, score: p.score, theme, cleared: win, stats: {pairs: p.pairs, bestStreak: p.best, perfect: solo && p.miss === 0 ? 1 : 0, wins: !solo && win ? 1 : 0}}, i);
  });
  UISound.play('success');
  say(solo ? 'All pairs found!' : (winners.length > 1 ? 'It\'s a tie!' : winners[0].name + ' wins!'));
  setTimeout(() => {
    if(G !== thisGame) return;
    const me = G.players[0], miss = G.players.reduce((s, p) => s + p.miss, 0), lvl = G.lvl, nextOk = solo && me.win && lvl < 5;
    const base = {wrap: $('result'), card: $('result-card'), save: 'Saving…', confetti: ['🃏', '⭐', '🎉', G.D.icon],
      levels: () => backToMenu(), again: () => startGame(lvl), againText: '🔄 Play again'};
    if(solo){
      GF.result(Object.assign(base, {win: true, icon: '🏆', title: 'All ' + G.pairs + ' pairs!', sub: M.name + ' · ' + L.emoji + ' ' + L.name, stars: me.stars,
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
  if(id !== 'friends') return; MS_WANT = id;   // 🧱 mm-1: friends = the cover's 👥 Same device → tap ➕ to add them
  if(MemCover && MemCover.setMode){ MemCover.show(); MemCover.setMode('same'); }
  UI.toast('👥 Tap ➕ on the cover to add your friends');
}
function msNow(){ return ''; }
function msWrap(fn, idOf){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ try{ const id = idOf.apply(this, arguments); if(id && UI.modeTried) UI.modeTried(S.player || CURRENT_PLAYER, MS_GAME, id); }catch(e){} return f.apply(this, arguments); }; }
function msAfter(fn, after){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; }
msWrap('startGame', () => SEATS.length > 1 ? 'friends' : '');
msAfter('choosePlayer', name => {
  if(!window.UI || !UI.modeLink) return;
  const id = UI.modeLink(MODE_LINK); if(id) msOpen(id);
  UI.alsoTry({game: MS_GAME, player: name, current: msNow, at: () => document.querySelector('#scr-menu .title'), open: msOpen});
});
/* ✨ END MODE SPOTLIGHT */
