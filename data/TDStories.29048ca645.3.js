
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[3]) || null;
const DURATION_MIN = Number(SP_TV[4]) || null;
const MODE_LINK = SP_TV[5];   // ✨ ?mode=draprincess opens that book once, after the player pick
const GAME_ID = 'tdstories';
// 🏰 own loader + how-to (UiKit is the ✨ polish lane — registered here at runtime; the 2-line UiKit anchor is asked under Open questions)
if(UI.KINDS && !UI.KINDS.tdstories) UI.KINDS.tdstories = ['🏰', 'Opening the story books', 'bob'];
if(UI.GAME_HELP && !UI.GAME_HELP.tdstories) UI.GAME_HELP.tdstories = ['Story books where you defend a tower: keep the enemies away until the last wave.',
  'Before each wave every hero levels up — pick ONE skill card. Tap the round coloured buttons to use skills (they also go off by themselves on easy levels).',
  'One skill of each colour 🔴🔵🟤🟢🟣, up to Lv 3. Tier 5 = ⭐ evolve, tier 10 = ⭐ ULTIMATE!'];
window.FX = window.FX == null ? 1 : window.FX;   // tests set 0: no long animations
// 🎛️ the shared top bar (UiKit UI.gameBar): ◀ where you came from · 🎚️ Levels · 🏠 | 🏰 TD-Stories · level | ❤️ · 🔁 wave · ⭐ | ⏸ ❓ ⏩ ⚙️
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🏰', name: 'TD-Stories', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && G.state !== 'won' && G.state !== 'lost'), onLeave: () => stopLoop(),
  pause: {pause: () => { if(G && !G.paused){ G.paused = true; G.barPz = 1; } }, resume: () => { if(G && G.barPz){ G.barPz = 0; G.paused = false; last = 0; } }}, pauseButton: true,
  onFit: () => layout(), scoreMin: '6ch',
  extras: [{id: 'speed-btn', icon: '⏩', label: 'Speed ×2', onClick: () => toggleSpeed(), keep: true}]});
var NAV_INNER = {levels: ['◀ TD-Stories', () => openShelf()], diary: ['◀ Dra-Princess Diary', () => openBook(S.book)]};
UI.navBar(document.getElementById('back-btn'), {onclick: false});
const $ = id => document.getElementById(id);
const COLS = SkillKit.COLS, COLORS = SkillKit.COLORS;
const AGE_START = {'4-5': 0, '6-7': 1, '8-9': 2, '10+': 3};
const LEVELS = TD.LEVELS;

/* ================= 📚 the books (page side: covers, diary pages, lesson cards) ================= */
const SHELF = [
  {id: 'draprincess', title: 'Dra-Princess Diary', icon: '🐉👑', sub: 'A princess, a dragon and far too many suitors', b1: '#FF5C9A', b2: '#7B4FE0'},
  {id: 'farmer', title: 'Farmer Delusion', icon: '👨‍🌾🍄', sub: 'Trick the money collector with a mushroom maze', b1: '#7CC25A', b2: '#C27A2E', soon: true},
  {id: 'coral', title: 'Coral Keeper', icon: '🐙🪸', sub: 'A little octopus guards the last reef', b1: '#2EC4E6', b2: '#2F5BD8', soon: true},
  {id: 'night', title: 'Night Market Guardian', icon: '🐱🏮', sub: 'A street cat vs. hungry snack ghosts', b1: '#FF9F43', b2: '#5B2A86', soon: true},
];
const DIARY = {
  draprincess: {
    1: {intro: 'Dear Diary,\nAnother knight came today with ANOTHER bouquet. 💐 I do not want a knight.\nThen a little dragon landed on my window. He sneezed sparks and made me laugh. 🐉✨\nNow the knights are coming back… with squires and BARDS. Help!',
        outro: 'Dear Diary,\nSir Bouquet slipped on his own flowers and rolled into the pond! 💦\nThe little dragon is called Ember now. He is not so little any more…',
        lessons: [['🏰', 'Round towers', 'Many castle towers were ROUND. A round wall has no corners, so it is stronger and harder to climb.'],
                  ['🌊', 'Moats', 'A moat is a ditch full of water around a castle. Visitors had to cross a bridge — and the bridge could be pulled up!']]},
    2: {intro: 'Dear Diary,\nEmber sleeps under my window every night. 🌙\nNow PRINCES come too, singing terrible songs. 🎻 And a cupid keeps shooting love arrows at my books!\nThe dragon says: "Leave it to me." 🔥',
        outro: 'Dear Diary,\nSir Shiny polished his armour SO much that he dazzled himself and walked into the moat. ✨💦\nEmber gave me one of his warm scales. I think… I love this dragon. ❤️',
        lessons: [['🐉', 'Dragons around the world', 'Dragon stories are told everywhere. In China dragons bring rain and good luck; in old European tales they guard treasure.'],
                  ['🦎', 'A real dragon', 'Komodo dragons are real lizards from Indonesia — the biggest lizards on Earth, as long as a sofa!']]},
    3: {intro: 'Dear Diary,\nWord got out that I said NO to two knights. Now EVERY prince in the land wants to try. 🤴🤴🤴\nThey come down the north road too, with roses, poems and a cupid who never stops shooting.\nEmber is practising his scariest roar. It sounds like a hiccup. 🔥',
        outro: 'Dear Diary,\nPrince Charmless sang for one whole hour. Then Ember hiccupped a ring of fire and the prince\'s wig flew into the moat. 👑💦\nThe princes went home to write sad songs. Ember fell asleep on my balcony. 💤',
        lessons: [['🤴', 'Real princes', 'A prince is the son of a king or queen. Long ago princes learned riding, sword-fighting… and dancing!'],
                  ['🌹', 'Rose thorns', 'Rose "thorns" are really prickles. They grow on the skin of the stem, so they snap off easily — and they stop animals from eating the plant.']]},
    4: {intro: 'Dear Diary,\nA wizard called Archmage Crush wants to marry me with a LOVE POTION. 🧪\nHis wizards can charm my castle mice so they walk to THEIR side! 🐭💘 And gift carts full of chocolate keep my helpers busy eating.\nTonight Ember gave me a warm little stone that beats like a heart. ❤️‍🔥 A piece of his Dragon Heart.',
        outro: 'Dear Diary,\nThe Archmage drank his own potion by mistake and fell in love… with a mop. 🧹💕\nI hold the Dragon Heart and I can feel magic in my fingers. ✨ Ember is bigger now — his scales glow pink when he is happy.',
        lessons: [['🧙', 'Wizards and alchemists', 'Merlin is the most famous story wizard. Real people long ago called "alchemists" mixed potions trying to turn metal into gold — and found new science instead!'],
                  ['❤️', 'Your own heart', 'Your heart beats about 100,000 times a day. A tiny hummingbird\'s heart beats very fast; a huge whale\'s beats very slowly.']]},
    5: {intro: 'Dear Diary,\nKINGS. Real kings, with crowns and gold and a whole army. 👑💰\nKing Goldbeard says he will BUY the tower. It is NOT for sale!\nWhen a king reads his Royal Decree, all the suitors run faster. Four roads now… Ember and I need a plan.',
        outro: 'Dear Diary,\nKing Goldbeard\'s beard got stuck in his own treasure chest. 🧔💰 His army carried him home like a sofa.\nMy magic is strong now. Ember calls me "Sage". I like it. 🔮',
        lessons: [['👑', 'Heavy crowns', 'Crowns are heavy! The St Edward\'s Crown in London weighs over 2 kg — about as much as a big bag of rice.'],
                  ['💰', 'Gold never rusts', 'Gold does not rust. Gold coins from shipwrecks hundreds of years old can still shine after a little cleaning.']]},
    6: {intro: 'Dear Diary,\nThe biggest suitor of all is coming: Emperor Heartthrob — with EVERY knight, prince, wizard and king behind him. 💘\nEmber and I are not scared. We are a team. 🐉👑\nThis is the last page before the big day…',
        outro: 'Dear Diary,\nEmperor Heartthrob slipped on 1,000 rose petals and slid all the way back to his empire. 🌹💨\nNobody else is coming. The roads are quiet. Ember looked at me and said: "Shall we fly?"',
        lessons: [['🏴', 'A dragon on a flag', 'The flag of Wales has a big red dragon on it. The red dragon has been a sign of Wales for well over a thousand years.'],
                  ['🎆', 'Fireworks', 'Fireworks were first made in China more than 1,000 years ago. Today the colours come from metals: copper makes blue, strontium makes red.']],
        ending: 'Dear Diary,\nThis is my very last page.\nEmber built us a castle on the mountain, all of warm red stone. 🏯🐉\nThe suitors? They come for tea on Sundays. They are much nicer now. 🫖\nDragon and me, forever. ❤️\n— THE END —',
        endingLesson: ['📖', 'Keep a diary!', 'Writing a few lines every day helps you remember. Try it tonight: what was the funniest thing that happened today?']},
    jail: {intro: 'Dear Diary (it\'s Ember writing — the Princess can\'t!),\nThe suitors got into the tower and carried her off to a WEDDING. 💍😱\nThey locked me in the dungeon with a pink ribbon round my wings. A ribbon. Really.\nThe wedding starts after 5 bells. Time to break out! 🔥⛓️',
        outro: 'Dear Diary,\nThe chapel doors flew open. Ember stood there, ribbons burning, and ROARED:\n"I OBJECT!!" 🐉🔥\nThe groom fell face-first into the wedding cake. 🎂 We flew home over the moat. 💖\nNow — back to the tower. This time we hold it!',
        lessons: [['⛓️', 'Dungeons', 'The word "dungeon" comes from "donjon" — the French name for a castle\'s strongest tower, the keep. Later it meant the prison underneath.'],
                  ['🔔', 'Bells', 'Before phones, bells told a whole town the news: a wedding, a fire, or time to come home for dinner.']]},
  },
};
const SCENES = {meadow: {g1: '#A8E07F', g2: '#7CC95E', path: '#F3D9A4', edge: '#D9B26F', deco: ['🌸', '🌼', '🌷', '🌳', '🍄']},
                sunset: {g1: '#9FD27A', g2: '#6FB35A', path: '#F2CFA0', edge: '#D3A065', deco: ['🌻', '🌹', '🌳', '🪨', '🌾'], tint: 'rgba(255,140,90,.16)'}};

/* ================= STATE ================= */
let S = {players: [], progress: {}, settings: {}, avatars: {}, player: '', age: '', book: 'draprincess', chapter: 1, level: 0, jail: null};
let G = null, lockHandle = null, raf = 0, last = 0, FT = [], BG = null, VIEW = {s: 20, px: 320, dpr: 1}, guideUsed = 0, pickOpen = false, HAND = null, autoOn = false, speedOn = false;
function myAvatar(name){ const a = S.avatars[name || S.player]; return a ? fixAv(a) : defaultAvatar(name || S.player || 'reader'); }
function saveRow(name){ try{ return JSON.parse(S.settings['SkillTree_td-' + S.book + '_' + (name || S.player)] || '{}') || {}; }catch(e){ return {}; } }
function chaptersDone(name){ const r = saveRow(name), p = progressOf(name || S.player); return Math.max(Number(r.ch) || 0, 0) || (p.unlocked > 0 && !r.ch ? 1 : 0); }
function progressOf(name){ return S.progress[name] || {unlocked: 0, tokens: [], best: []}; }
function canPlay(i){ const p = progressOf(S.player); if(i === 5) return p.unlocked >= 5; if(i === 4) return p.unlocked >= 4; return i <= Math.max(p.unlocked, AGE_START[S.age] || 0); }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goBack(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }   // 🧭 ◀ = where you came from (Gameroom if we don't know)

/* ================= MENUS ================= */
function showScreen(name){
  ['player', 'menu', 'levels', 'diary', 'play'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
  $('back-btn').classList.toggle('hidden', name === 'play'); UI.navScreen($('back-btn'), name, NAV_INNER);
  if(name !== 'play') hideHand();
  window.scrollTo(0, 0);
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
  $('who-name').textContent = name;
  try{ autoOn = localStorage.getItem('sp_td_auto:' + name) === '1'; }catch(e){}
  const id = UI.modeLink ? UI.modeLink(MODE_LINK) : '';
  if(id === 'draprincess') openBook('draprincess'); else openShelf();
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
function openShelf(){
  const box = $('shelf'); box.innerHTML = '';
  SHELF.forEach(b => { const el = document.createElement('button'); el.className = 'book' + (b.soon ? ' soon' : ''); el.dataset.book = b.id; el.setAttribute('data-sound', b.soon ? 'none' : 'pop');
    el.style.setProperty('--b1', b.b1); el.style.setProperty('--b2', b.b2);
    const done = b.soon ? 0 : chaptersDone();
    el.innerHTML = (b.soon ? '<span class="rib">🔜 Coming soon</span>' : (done ? '<span class="rib">📖 ' + done + ' / 6</span>' : '<span class="rib">✨ NEW</span>')) +
      '<span class="bi">' + b.icon + '</span><span class="bt">' + UI.esc(b.title) + '</span><span class="bs">' + UI.esc(b.sub) + '</span>' +
      (!b.soon && saveRow().last ? '<span class="bb">' + SkillKit.barHtml(lastBar()) + '</span>' : '');
    el.onclick = () => { if(b.soon){ UISound.play('error'); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); UI.toast('📖 ' + b.title + ' is still being written — Dra-Princess Diary first!'); return; } openBook(b.id); };
    box.appendChild(el); });
  showScreen('menu');
}
function lastBar(){ const r = saveRow(); if(!r.last) return []; return String((r.last.dragon || {}).p || '').split(',').concat(String((r.last.princess || {}).p || '').split(',')).map(x => x.split(':')[0]).filter(c => COLS.includes(c)); }
function openBook(id){
  S.book = id; const B = TD.BOOKS[id], cover = SHELF.find(b => b.id === id);
  $('book-icon').textContent = cover.icon; $('book-title').textContent = cover.title; $('book-sub').textContent = cover.sub;
  NAV_INNER.diary[0] = '◀ ' + cover.title;
  const done = chaptersDone();
  if(S.chapter > done + 1 || TD.BOOKS[id].chapters[S.chapter - 1].soon) S.chapter = Math.min(done + 1, B.chapters.filter(C => !C.soon).length);
  const cb = $('chapters'); cb.innerHTML = '';
  B.chapters.forEach(C => { const locked = !C.soon && C.n > done + 1, el = document.createElement('button');
    el.className = 'chap' + (C.soon ? ' soon' : locked ? ' locked' : '') + (C.n === S.chapter ? ' on' : ''); el.dataset.ch = C.n; el.setAttribute('data-sound', C.soon || locked ? 'none' : 'tap');
    el.innerHTML = '<span class="cn">Chapter ' + C.n + (C.n <= done ? ' · ✅' : '') + '</span><span class="ct">' + UI.esc(C.title) + '</span><span class="cb">' +
      (C.soon ? '🔜 next round' : locked ? '🔒 finish chapter ' + (C.n - 1) + ' first' : '👑 Boss: ' + UI.esc(TD.SUITORS[C.boss].name) + ' · ' + C.paths.length + ' paths') + '</span>';
    el.onclick = () => { if(C.soon){ UI.toast('🔜 Chapter ' + C.n + ' comes in the next round!'); return; } if(locked){ UISound.play('error'); UI.toast('🔒 Finish chapter ' + (C.n - 1) + ' first'); return; }
      S.chapter = C.n; cb.querySelectorAll('.chap').forEach(x => x.classList.toggle('on', Number(x.dataset.ch) === C.n)); renderLevels(); };
    cb.appendChild(el); });
  $('chap-hint').textContent = done >= 6 ? '— 📖 the whole diary is done! 🎉' : '— ' + done + ' of 6 done';
  renderLevels();
  const r = saveRow(), bb = $('buildbox');
  bb.innerHTML = r.last ? '🧬 Your last build: ' + SkillKit.barHtml(lastBar(), {big: true}) + ' <span style="color:var(--ink-soft)">' + UI.esc(r.lastForms || '') + '</span>' :
    '🧬 Skill colours: ' + COLS.map(c => '<span style="color:' + COLORS[c].hex + '">' + COLORS[c].dot + ' ' + COLORS[c].en + '</span>').join(' · ');
  if(UI.leaders) UI.leaders($('leaders'), B.board, S.player);
  showScreen('levels');
}
function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best" style="opacity:.6">No score yet</div>'; return '<div class="best">🏆 ' + Number(b.score).toLocaleString() + ' ' + '⭐'.repeat(b.stars || 0) + '</div>'; }
function renderLevels(){
  const box = $('level-list'); box.innerHTML = ''; const p = progressOf(S.player), rec = AGE_START[S.age];
  LEVELS.forEach((L, i) => {
    const open = canPlay(i), done = p.unlocked > i, b = document.createElement('button');
    b.className = 'lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (L.hardcore ? ' hardcore' : ''); b.dataset.lvl = i; b.setAttribute('data-sound', open ? 'pop' : 'none');
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + L.emoji + '</div><div class="nm">' + L.name + '</div><div class="hp">❤️ ' + L.hearts + ' · 🃏 ' + L.cards + ' cards</div><div class="sub">' + (L.hardcore && !open ? 'Beat Extreme to open 💀 Hardcore' : L.blurb) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore!' : i === 4 ? 'Win on Hard to unlock Extreme!' : 'Win the level before to unlock it'); return; } S.level = i; openDiary(S.chapter, i, 'intro'); };
    box.appendChild(b);
  });
}
function openDiary(ch, lvl, when){
  // ch = 1–6, or 'jail' (💍 Jailbreak pages: 'intro' before it, 'outro' = "I OBJECT!!"); when = 'intro' | 'outro' | 'ending' (after chapter 6)
  const jail = ch === 'jail', D = DIARY[S.book][ch], C = jail ? TD.BOOKS[S.book].jail : TD.BOOKS[S.book].chapters[ch - 1];
  const ls = when === 'ending' ? D.endingLesson : D.lessons[when === 'intro' ? 0 : 1];
  const head = jail ? (when === 'intro' ? '💍 Jailbreak! — the Dragon breaks out' : '💍 "I OBJECT!!"') : when === 'ending' ? '📖 The very last page' : when === 'intro' ? 'Chapter ' + ch + ': ' + UI.esc(C.title) : 'The end of chapter ' + ch;
  $('diary').innerHTML = '<div class="dh' + (jail ? ' jail' : when === 'ending' ? ' ending' : '') + '">📔 ' + head + '</div><canvas id="diary-cv" width="840" height="300"></canvas><div class="dt">' + UI.esc(when === 'ending' ? D.ending : D[when]) + '</div>';
  $('lesson').innerHTML = '<span class="li">' + ls[0] + '</span><div><div class="lh">💡 Did you know? · ' + UI.esc(ls[1]) + '</div><div class="lt">' + UI.esc(ls[2]) + '</div></div>';
  const from = S.jail || {ch: S.chapter, lvl}, B = [];
  if(jail && when === 'intro') B.push('<button class="sp-btn sp-secondary" id="diary-lv" data-sound="tap">🎚️ Levels</button>', '<button class="sp-btn sp-primary sp-lg" id="diary-go" data-sound="pop">🐉 Break out! ▶</button>');
  else if(jail) B.push('<button class="sp-btn sp-secondary" id="diary-lv" data-sound="tap">🎚️ Levels</button>', '<button class="sp-btn sp-primary sp-lg" id="diary-retry" data-sound="pop">🏰 Chapter ' + from.ch + ' again · +' + JAIL_BONUS + ' ❤️ ▶</button>');
  else if(when === 'intro') B.push('<button class="sp-btn sp-primary sp-lg" id="diary-go" data-sound="pop">▶ Start chapter ' + ch + '</button>');
  else if(when === 'ending') B.push('<button class="sp-btn sp-secondary" id="diary-lv" data-sound="tap">🎚️ Levels</button>', '<button class="sp-btn sp-primary sp-lg" id="diary-shelf" data-sound="pop">📚 Back to the shelf</button>');
  else B.push('<button class="sp-btn sp-secondary" id="diary-lv" data-sound="tap">🎚️ Levels</button>', ch < 6 ? '<button class="sp-btn sp-primary sp-lg" id="diary-next" data-sound="pop">Chapter ' + (ch + 1) + ' ▶</button>' : '<button class="sp-btn sp-primary sp-lg" id="diary-end" data-sound="pop">📖 The ending ▶</button>');
  $('diary-btns').innerHTML = B.join('');
  if($('diary-go')) $('diary-go').onclick = () => jail ? startGame(from.ch, from.lvl, {jail: true}) : startGame(ch, lvl);
  if($('diary-retry')) $('diary-retry').onclick = () => startGame(from.ch, from.lvl, {bonus: JAIL_BONUS});
  if($('diary-lv')) $('diary-lv').onclick = () => { S.jail = null; openBook(S.book); };
  if($('diary-shelf')) $('diary-shelf').onclick = () => openShelf();
  if($('diary-end')) $('diary-end').onclick = () => openDiary(6, lvl, 'ending');
  if($('diary-next')) $('diary-next').onclick = () => { S.chapter = ch + 1; openDiary(ch + 1, lvl, 'intro'); };
  showScreen('diary'); drawDiaryPicture($('diary-cv'), ch, when);
}
const JAIL_BONUS = 3;   // 💍 after a won Jailbreak the lost chapter starts with +3 ❤️
// 🖼️ a little picture on every diary page (tower, princess, dragon, suitors — and the reader's avatar)
const DIARY_SKY = {1: ['#CDEBFF', '#FFF3D9'], 2: ['#FFC6A8', '#FFF3D9'], 3: ['#FFD3E4', '#FFF5EC'], 4: ['#2C2F6B', '#8A7FC8'], 5: ['#FFD98A', '#FFF6E0'], 6: ['#C9B8FF', '#FFE3F1'], jail: ['#7E7A92', '#CFCBDB'], ending: ['#FF9E7A', '#FFE0B8']};
const DIARY_CAST = {1: ['kn', 'sq'], 2: ['kn', 'pr'], 3: ['pr', 'pr'], 4: ['wz', 'gc'], 5: ['kg', 'kn'], 6: ['boss6', 'pr']};
const DIARY_OOPS = {1: ['boss1', '💦'], 2: ['boss2', '✨'], 3: ['boss3', '💦'], 4: ['boss4', '🧹'], 5: ['boss5', '💰'], 6: ['boss6', '🌹']};
function diaryChar(type, v, w, h){ return atScale(60, () => charSet('s:' + type + ':' + v, {name: 'Suitor ' + type + v, av: suitorAv(type, v)}, w || 84, h || 108)); }
function drawDiaryPicture(cv, ch, when){
  const g = cv.getContext('2d'), W = cv.width, H = cv.height, t = performance.now() / 1000, jail = ch === 'jail', key = jail ? 'jail' : when === 'ending' ? 'ending' : ch;
  g.clearRect(0, 0, W, H);
  const sk = DIARY_SKY[jail && when === 'outro' ? 6 : key] || DIARY_SKY[1], sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, sk[0]); sky.addColorStop(1, sk[1]); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  if(ch === 4 && !jail){ for(let i = 0; i < 40; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.4 + 0.5 * Math.abs(Math.sin(t + i))) + ')'; g.fillRect((i * 97) % W, (i * 53) % 150, 2, 2); } g.fillStyle = '#FFF6C8'; g.beginPath(); g.arc(W - 90, 60, 26, 0, Math.PI * 2); g.fill(); g.fillStyle = sk[0]; g.beginPath(); g.arc(W - 80, 54, 22, 0, Math.PI * 2); g.fill(); }
  try{
    const Rd = atScale(60, () => readerSet());
    if(jail && when === 'intro'){   // ⛓️ the dungeon: bricks, bars, a dragon with a ribbon on his wings
      g.fillStyle = '#6E6880'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(30,25,45,.35)'; g.lineWidth = 2;
      for(let y = 0; y < H; y += 30){ g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); for(let x = (y / 30) % 2 ? 0 : 30; x < W; x += 60){ g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 30); g.stroke(); } }
      g.fillStyle = '#4A4458'; g.fillRect(0, H - 40, W, 40);
      const D = atScale(60, () => dragonSet(1)); paintChar(g, D, D.fly[Math.floor(t * 4) % D.fly.length], W / 2 - 40, 255, 150, false); emo(g, '🎀', W / 2 - 50, 150, 44); emo(g, '😤', W / 2 + 10, 110, 34);
      g.fillStyle = '#2E2A3A'; for(let x = W / 2 - 180; x <= W / 2 + 100; x += 34) g.fillRect(x, 20, 9, H - 60); g.fillRect(W / 2 - 190, 20, 300, 10); g.fillRect(W / 2 - 190, H - 50, 300, 10);
      emo(g, '⛓️', W / 2 - 200, 230, 40); emo(g, '🔑', 90, 250, 34); emo(g, '🔔', W - 230, 70, 40); emo(g, '💒', W - 230, 150, 70);
      paintChar(g, Rd, Rd.act('cheer')[Math.floor(t * 6) % 6], W - 110, 285, 120, true); return; }
    if(jail){   // 💥 "I OBJECT!!" — the chapel doors fly open, the groom lands in the cake
      g.fillStyle = '#B9E0A0'; g.beginPath(); g.ellipse(W / 2, H + 40, W * 0.7, 110, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#FFFFFF'; g.fillRect(W / 2 + 60, 70, 150, 190); g.fillStyle = '#FF9EC4'; g.beginPath(); g.moveTo(W / 2 + 45, 74); g.lineTo(W / 2 + 135, 10); g.lineTo(W / 2 + 225, 74); g.fill(); emo(g, '🔔', W / 2 + 135, 52, 30);
      g.fillStyle = '#5A3418'; g.fillRect(W / 2 + 108, 190, 54, 70); emo(g, '💥', W / 2 + 135, 205, 60);
      const D = atScale(95, () => dragonSet(2)); paintChar(g, D, D.fly[Math.floor(t * 8) % D.fly.length], W / 2 - 60, 250 + Math.sin(t * 3) * 6, 230, false); emo(g, '🔥', W / 2 + 40, 150, 56);
      const Gr = diaryChar('groom', 0); paintChar(g, Gr, Gr.act('dizzy')[Math.floor(t * 6) % 6], 120, 280, 110, false); emo(g, '🎂', 120, 268, 56);
      const Pz = atScale(70, () => princessSet(1)); paintChar(g, Pz, Pz.act('cheer')[Math.floor(t * 6) % 6], W / 2 + 230, 285, 115, true);
      g.save(); g.font = '900 54px Fredoka, Nunito, sans-serif'; g.textAlign = 'center'; g.lineJoin = 'round'; g.translate(250, 62); g.rotate(-0.06 + Math.sin(t * 6) * 0.02);
      g.lineWidth = 10; g.strokeStyle = '#2A1E3A'; g.strokeText('I OBJECT!!', 0, 0); g.fillStyle = '#FFD84D'; g.fillText('I OBJECT!!', 0, 0); g.restore();
      paintChar(g, Rd, Rd.act('cheer')[Math.floor(t * 6) % 6], W - 70, 290, 105, true); return; }
    if(when === 'ending'){   // 🏯 the dragon castle on the mountain + tea with the suitors
      g.fillStyle = '#B98BC9'; g.beginPath(); g.moveTo(0, 230); g.lineTo(220, 70); g.lineTo(420, 210); g.lineTo(600, 90); g.lineTo(W, 230); g.lineTo(W, H); g.lineTo(0, H); g.fill();
      g.fillStyle = '#C9452E'; g.fillRect(170, 80, 110, 90); g.fillRect(150, 60, 34, 110); g.fillRect(266, 60, 34, 110); for(let i = 0; i < 6; i++) g.fillRect(150 + i * 28, 48, 16, 16);
      g.fillStyle = '#7A2A1C'; g.fillRect(208, 128, 34, 42); emo(g, '🚩', 167, 40, 28); emo(g, '🚩', 283, 40, 28);
      g.fillStyle = '#9AD47C'; g.beginPath(); g.ellipse(W / 2, H + 40, W * 0.7, 110, 0, 0, Math.PI * 2); g.fill();
      const D = atScale(60, () => dragonSet(2)), Pz = atScale(70, () => princessSet(2)); paintChar(g, D, D.fly[Math.floor(t * 6) % D.fly.length], 420, 150 + Math.sin(t * 2) * 8, 150, true);
      paintChar(g, Pz, Pz.act('cheer')[Math.floor(t * 6) % 6], 520, 285, 115, false); emo(g, '❤️', 470, 80, 36);
      const K = diaryChar('kn', 0), Q = diaryChar('pr', 1); paintChar(g, K, K.still, 640, 290, 95, true); paintChar(g, Q, Q.still, 730, 292, 95, true); emo(g, '🫖', 690, 265, 34); emo(g, '☕', 650, 232, 22); emo(g, '☕', 742, 232, 22);
      paintChar(g, Rd, Rd.act('cheer')[Math.floor(t * 6) % 6], 90, 290, 110, false); return; }
    // 🏰 a normal chapter page: the tower, the Princess on top, Ember flying by, this chapter's suitors (intro) or the boss in trouble (outro)
    g.fillStyle = ch === 5 ? '#C9D97A' : '#9AD47C'; g.beginPath(); g.ellipse(W / 2, H + 40, W * 0.7, 110, 0, 0, Math.PI * 2); g.fill();
    const L = towerLook(ch >= 5 ? 2 : ch >= 3 ? 1 : 0);
    g.fillStyle = L.wall1; g.fillRect(W / 2 - 55, 70, 110, 190); g.fillStyle = L.wall2; for(let i = 0; i < 5; i++) g.fillRect(W / 2 - 55 + i * 25, 52, 15, 20);
    g.fillStyle = L.roof1; g.beginPath(); g.moveTo(W / 2 - 65, 56); g.lineTo(W / 2, 4); g.lineTo(W / 2 + 65, 56); g.fill();
    g.fillStyle = '#6B4A2F'; g.fillRect(W / 2 - 18, 210, 36, 50);
    const pf = ch >= 5 ? 2 : ch >= 3 || (when === 'outro' && ch >= 2) ? 1 : 0, df = ch >= 4 ? 2 : ch >= 2 || when === 'outro' ? 1 : 0;
    const Pz = atScale(70, () => princessSet(pf)), D = atScale(60, () => dragonSet(df));
    paintChar(g, Pz, Pz.still, W / 2, 160, 115, false); paintChar(g, D, D.fly[Math.floor(t * 8) % D.fly.length], W / 2 + 165, 150 + Math.sin(t * 2) * 6, 120 + df * 12, true);
    if(when === 'intro'){ const [a, b] = DIARY_CAST[ch] || DIARY_CAST[1], K = diaryChar(a, 0, a.startsWith('boss') ? 100 : 84, a.startsWith('boss') ? 128 : 108), Q = diaryChar(b, 1);
      paintChar(g, K, K.walk[Math.floor(t * 14) % 8], 120, 290, a.startsWith('boss') ? 140 : 120, false); emo(g, TD.SUITORS[a].prop || '💐', 152, 232, 30);
      paintChar(g, Q, Q.walk[Math.floor(t * 14 + 3) % 8], 215, 292, 110, false); if(TD.SUITORS[b].front) emo(g, TD.SUITORS[b].front, 262, 278, 40);
      if(ch === 2 || ch === 3) emo(g, '👼', 70, 150, 46); if(ch === 4) emo(g, '🐭', 300, 280, 30); if(ch === 5) emo(g, '👑', 60, 140, 40); if(ch === 6) emo(g, '💘', 60, 140, 46); }
    else { const [bt, oops] = DIARY_OOPS[ch] || DIARY_OOPS[1], K = diaryChar(bt, 0, 100, 128); emo(g, '💫', 140, 110, 46); paintChar(g, K, K.act('dizzy')[Math.floor(t * 6) % 6], 120, 255, 120, false); emo(g, oops, 190, 220, 44); emo(g, '❤️', W / 2 + 70, 50, 40); }
    paintChar(g, Rd, Rd.act('cheer')[Math.floor(t * 6) % 6], W - 120, 285, 120, true);
  }catch(e){ console.warn(e); }
}

/* ================= 🎮 PLAY ================= */
function startGame(ch, lvl, opt){
  opt = opt || {}; S.chapter = ch; S.level = lvl; stopLoop(); hideResult(); S.jail = opt.jail ? {ch, lvl} : null;
  G = TD.newMatch({book: S.book, chapter: ch, level: lvl, auto: autoOn, jail: !!opt.jail, bonusHearts: opt.bonus || 0});
  G.breakLen = lvl === 0 ? 4 : 2.6; FT = []; guideUsed = 0; pickOpen = false; speedOn = false; G.speed = 1;
  if(UI.modeTried) UI.modeTried(S.player, GAME_ID, S.book);
  const L = LEVELS[lvl]; BAR.level(L.emoji + ' ' + L.name + ' · ' + (G.jail ? '💍 Jailbreak' : 'Ch ' + ch), L.hardcore ? 'hc' : '');
  paintAuto();
  $('speed-btn').textContent = '⏩'; $('goal').style.opacity = 1;
  $('goal').textContent = G.jail ? '💍 Hold off the guards until the bells stop — then crash the wedding!' : opt.bonus ? '💖 Second chance: +' + opt.bonus + ' ❤️ — keep the suitors away!' : '🏰 Keep the suitors away from the tower!';
  showScreen('play'); BAR.fit(); renderPanel(); layout(); hudTick(true);
  last = 0; raf = requestAnimationFrame(loop);
  setTimeout(nextPick, FX ? 450 : 0);
}
function stopLoop(){ cancelAnimationFrame(raf); raf = 0; }
function leavePlay(){ stopLoop(); hideHand(); const s = document.querySelector('#scr-play .skk-sheet'); if(s) s.remove(); pickOpen = false; G = null; hideResult(); openBook(S.book); }
function toggleSpeed(){ if(!G) return; speedOn = !speedOn; G.speed = speedOn ? 2 : 1; $('speed-btn').textContent = speedOn ? '⏩×2' : '⏩'; $('speed-btn').classList.toggle('on', speedOn); UI.toast(speedOn ? '⏩ Double speed' : '▶ Normal speed'); }
function toggleAuto(){ autoOn = !autoOn; try{ localStorage.setItem('sp_td_auto:' + S.player, autoOn ? '1' : '0'); }catch(e){} if(G){ G.auto.dragon = G.auto.princess = autoOn; }
  paintAuto(); UI.toast(autoOn ? '🤖 Skills go off by themselves' : '👆 You tap the skills'); }
function paintAuto(){ const b = $('auto-btn'); if(!b) return; b.textContent = autoOn ? '🤖 Auto ✅' : '🤖 Auto'; b.title = 'Auto skills: ' + (autoOn ? 'on' : 'off'); b.classList.toggle('on', autoOn); }
function goNow(){ if(G && G.state === 'break'){ TD.startWave(G); $('go-btn').classList.add('hidden'); } }

/* ---------- 📐 layout: stage square + hero panel; nothing ever scrolls ---------- */
function layout(){
  const sp = $('scr-play'); if(!sp || sp.classList.contains('hidden')) return;
  const A = $('arena'), st = $('stage'), P = $('panel');
  const W = A.clientWidth - 16, H = A.clientHeight - 6 - (parseFloat(getComputedStyle(A).paddingBottom) || 18);
  const big = Math.min(W, H) > 560, bs = big ? 56 : (Math.min(W, H) < 340 ? 40 : 46), gap = big ? 9 : 7;
  sp.style.setProperty('--skk-bs', bs + 'px'); sp.style.setProperty('--bgap', gap + 'px'); sp.style.setProperty('--hf', big ? '2.2rem' : '1.6rem');
  const heroW = 6 * bs + 5 * gap + 18;
  // side panel when the screen is wide enough (the map may give up 20 % for it); else the panel goes under the map
  const row = W - H >= heroW + 8 || (W > H && W - heroW - 8 >= H * 0.8);
  let size;
  A.classList.toggle('col', !row);
  const AR = V25.AR, MAXW = 1240;   // 2.5D: the stage is wider than tall (width = size, height = size × AR)
  if(row){ P.style.flexDirection = 'column'; P.style.width = heroW + 'px'; size = Math.min(H / AR, W - heroW - 8, MAXW); }
  else { const side = (W - 8) / 2 >= heroW; P.style.flexDirection = side ? 'row' : 'column'; P.style.width = (side ? Math.min(W, Math.max(2 * heroW + 8, Math.min(W, 980))) : Math.min(W, Math.max(heroW, 600))) + 'px';
    let ph = P.getBoundingClientRect().height || (side ? 120 : 240); size = Math.min(W, (H - ph - 8) / AR, MAXW);
    const spare = H - ph - 8 - size * AR, pw = parseFloat(P.style.width) / (side ? 2 : 1);
    if(spare > 30 && size >= W - 1){ const bs2 = Math.floor(Math.min(64, (pw - 18 - 5 * gap) / 6, bs + spare / (side ? 2 : 4)));   // 📱 tall phones: spare height → bigger skill buttons
      if(bs2 > bs){ sp.style.setProperty('--skk-bs', bs2 + 'px'); ph = P.getBoundingClientRect().height; size = Math.min(W, (H - ph - 8) / AR, MAXW); } } }
  size = Math.max(240, Math.floor(size)); const sh = Math.round(size * AR);
  st.style.width = size + 'px'; st.style.height = sh + 'px';
  const dpr = Math.min(2, window.devicePixelRatio || 1), cv = $('cv');
  if(VIEW.px !== size || VIEW.dpr !== dpr || !BG || VIEW.ch !== S.chapter){ VIEW = {s: size / TD.W, px: size, ph: sh, dpr, ch: S.chapter}; cv.width = Math.round(size * dpr); cv.height = Math.round(sh * dpr); BG = null; }
  if(pickOpen) placeHandOnGlow();
}
window.addEventListener('resize', () => { layout(); });

/* ---------- 🦸 hero panel (5 colour slots + ⭐) ---------- */
let BTN = [];
/* hero face = the real avatar / dragon picture (emoji stays as a fallback under it) */
function paintFace(cv, h, form){
  if(!cv) return; try{
    const g = cv.getContext('2d'); g.clearRect(0, 0, 64, 64);
    const set = h === 'dragon' ? atScale(30, () => dragonSet(form)) : atScale(40, () => princessSet(form));
    const pic = h === 'dragon' ? set.fly[2] : set.still;
    g.fillStyle = h === 'dragon' ? 'rgba(255,214,120,.45)' : 'rgba(255,170,215,.45)'; g.beginPath(); g.arc(32, 34, 30, 0, Math.PI * 2); g.fill();
    paintChar(g, set, pic, 32, h === 'dragon' ? 58 : 66, h === 'dragon' ? 52 : 74, h !== 'dragon');
    cv.parentNode.classList.add('pic');
  }catch(e){}
}
function renderPanel(){
  if(!G) return; const P = $('panel'); P.innerHTML = ''; BTN = [];
  ['dragon', 'princess'].forEach((h, hi) => {
    const T = G.trees[h], H = TD.HEROES[h], box = document.createElement('div'); box.className = 'hero'; box.dataset.h = h;
    const btns = T.buttons(), act = btns.filter(b => !b.ult && !b.combo), ult = btns.find(b => b.ult);
    const keys = hi === 0 ? ['1', '2', '3', '4', '5', '6'] : ['Q', 'W', 'E', 'R', 'T', 'Y'];
    box.innerHTML = '<div class="hh"><span class="hf" id="hf-' + h + '" title="' + UI.esc(T.formName()) + '"><canvas class="hfc" width="64" height="64" aria-hidden="true"></canvas><i class="hfe">' + H.formIcons[T.form] + '</i></span><span class="hn"><b>' + H.icon + ' ' + UI.esc(T.formName()) + '</b><small>Tier ' + T.tier + ' / 10 · ' + SkillKit.barHtml(T.bar()) + '</small></span></div>' +
      '<div class="btns">' + COLS.map((c, i) => { const b = act.find(x => x.col === c); return b ? SkillKit.buttonHtml(b, {}) : '<button type="button" class="skk-btn empty" style="--c:' + COLORS[c].hex + '" tabindex="-1" title="' + COLORS[c].en + ' slot (empty)">' + '<span style="font-size:.5em;opacity:.7">' + COLORS[c].dot + '</span></button>'; }).join('') +
      (ult ? SkillKit.buttonHtml(ult, {}) : '<button type="button" class="skk-btn empty ult" tabindex="-1" title="⭐ Ultimate at tier 10"><span style="font-size:.55em">⭐</span></button>') + '</div>';
    if(G.jail && h === 'princess'){ const bt = box.querySelector('.btns'); if(bt) bt.outerHTML = '<div class="jailmsg">💍 Locked in the chapel — the Dragon must break her out!</div>'; }
    P.appendChild(box); paintFace(box.querySelector('.hfc'), h, T.form);
    box.querySelectorAll('.skk-btn:not(.empty)').forEach(el => { const key = el.dataset.key; el.onclick = () => tapSkill(h, key, el); BTN.push({el, h, key}); });
    COLS.concat(['U']).forEach((c, i) => { const el = box.querySelectorAll('.btns .skk-btn')[i]; if(el) el.dataset.hk = keys[i]; });
  });
  const cs = $('combo-slot'); cs.innerHTML = '';
  ['dragon', 'princess'].forEach(h => { const b = G.trees[h].buttons().find(x => x.combo); if(b){ cs.innerHTML = SkillKit.buttonHtml(b, {}).replace('class="skk-btn', 'id="combo-btn" class="skk-btn'); const el = $('combo-btn'); el.onclick = () => tapSkill(h, b.key, el); BTN.push({el, h, key: b.key}); } });
}
function tapSkill(h, key, el){
  if(!G || G.state !== 'wave' || G.paused){ UISound.play('bump'); return; }
  if(!TD.ready(G, h, key)){ UISound.play('bump'); el.animate([{transform: 'translateX(-4px)'}, {transform: 'translateX(4px)'}, {transform: 'none'}], {duration: 220}); return; }
  if(!TD.cast(G, h, key)){ UISound.play('bump'); floatText(TD.CX, TD.CY - 2.4, '👀 Nobody to aim at yet', '#7A5C88', 1.1); return; }
  guideUsed++; UISound.play('whoosh'); hideHand();
  try{ SkillKit.castPop(el); const hp = h === 'dragon' ? G.heroes.dragon : {x: TD.CX, y: TD.CY}; G.fx.push({k: 'cast', x: hp.x, y: hp.y, t: 0, dur: 0.55, sk: {hero: h, key}, big: h === 'dragon' ? 0.9 : 1.8}); }catch(e){}
}
function panelTick(){
  if(!G) return;
  BTN.forEach(B => { const cd = TD.cdOf(G, B.h, B.key) || 1, left = Math.max(0, G.cd[B.h][B.key] || 0), rd = left <= 0 && G.state === 'wave';
    const f = Math.min(1, left / cd).toFixed(3); if(B.el.style.getPropertyValue('--cd') !== f) B.el.style.setProperty('--cd', f);
    if(B.el.classList.contains('ready') !== rd) B.el.classList.toggle('ready', rd); });
}

/* ---------- 🃏 picks (the game waits — nothing moves while the cards are open) ---------- */
function nextPick(){
  if(!G || G.state !== 'pick'){ afterPicks(); return; }
  const o = TD.offer(G); if(!o){ afterPicks(); return; }
  const h = G.queue[0], T = G.trees[h], H = TD.HEROES[h];
  const title = o.kind === 'evolve' ? '⭐ ' + H.icon + ' ' + H.name + ' is EVOLVING! Pick your main colour' : o.kind === 'ultimate' ? '⭐ ' + H.icon + ' Final form! Here is your ULTIMATE' : H.icon + ' ' + T.formName() + ' levels up! Tier ' + o.tier + ' — pick ONE';
  const sub = o.kind === 'pick' ? (G.lvl === 0 ? '👆 The glowing card is a good pick' : 'Your build: ') : o.kind === 'evolve' ? 'The main colour shows up more often from now on' : 'Tap it to make it yours!';
  pickOpen = true;
  const pr = SkillKit.pickSheet($('arena'), o, {title, sub: sub, fast: !FX});
  const sh = document.querySelector('#arena .skk-sheet:last-child'); if(sh && o.kind === 'pick' && G.lvl !== 0) sh.querySelector('.h2').innerHTML = T.bar().length ? 'Your build: ' + SkillKit.barHtml(T.bar()) + (T.main ? ' · main ' + COLORS[T.main].dot : '') : '✨ Your very first skill — every colour does something different!';
  if(LEVELS[G.lvl].guide || (G.glowLeft > 0 && T.glow)) setTimeout(placeHandOnGlow, FX ? 520 : 0);
  pr.then(card => {
    pickOpen = false; hideHand(); if(!G) return;
    TD.take(G, card); UISound.play(card.type === 'evolve' || card.type === 'ultimate' ? 'success' : 'unlock');
    renderPanel();
    if(card.type === 'evolve' || card.type === 'ultimate'){ const f = $('hf-' + h); if(f){ f.classList.add('evo'); } banner(card.type === 'evolve' ? '⭐ ' + H.name + ' → ' + T.formName() + '!' : '⭐ ' + T.formName() + '! ULTIMATE ready', 'gold'); if(FX) confetti(['⭐', '✨', COLORS[card.col].dot]); }
    else floatText(h === 'dragon' ? G.heroes.dragon.x : TD.CX, (h === 'dragon' ? G.heroes.dragon.y : TD.CY) - 1.2, (card.type === 'up' ? '⬆️ ' : '✨ ') + card.name, COLORS[card.col].hex, 1.6);
    setTimeout(nextPick, FX ? 260 : 0);
  });
}
function afterPicks(){
  if(!G) return; if(G.state === 'break'){ const n = G.wave + 2, boss = G.C.waves[n - 1].some(g => TD.SUITORS[g[0]].boss);
    banner(boss ? '👑 BOSS WAVE: ' + TD.SUITORS[G.C.boss].name + '!' : '🌊 Wave ' + n + ' of ' + G.C.waves.length + ' — get ready!', boss ? 'bad' : ''); $('go-btn').classList.remove('hidden');
    if(LEVELS[G.lvl].guide && G.wave < 0) showHandAt($('go-btn')); }
}

/* ---------- 👆 the guide hand (🌱 Basic) ---------- */
function showHandAt(el){ if(!el) return; const r = el.getBoundingClientRect(); if(!r.width) return; const h = $('hand'); h.classList.remove('hidden'); h.style.left = (r.left + r.width * 0.5 - 12) + 'px'; h.style.top = Math.min(innerHeight - 44, r.bottom - 14) + 'px'; HAND = el; }
function hideHand(){ $('hand').classList.add('hidden'); HAND = null; }
function placeHandOnGlow(){ const g = document.querySelector('#scr-play .skk-sheet .skk-card.glow'); if(g) showHandAt(g); }
function guideTick(){
  if(!G || !LEVELS[G.lvl].guide || pickOpen) return;
  if(G.state === 'wave' && guideUsed < 3 && TD.live(G).length){ const b = BTN.find(B => B.el.classList.contains('ready')); if(b){ if(HAND !== b.el) showHandAt(b.el); return; } }
  if(HAND && !(G.state === 'break' && HAND === $('go-btn'))) hideHand();
}

/* ---------- ⏱️ loop ---------- */
function loop(now){
  raf = requestAnimationFrame(loop); if(!G) return;
  const dt = last ? Math.min(0.1, Math.max(0, (now - last) / 1000)) : 0; last = now;
  const was = G.state; TD.step(G, dt);
  if(was === 'break' && G.state === 'wave'){ $('go-btn').classList.add('hidden'); if(HAND === $('go-btn')) hideHand(); }
  handleEvents(TD.takeEvents(G));
  FT = FT.filter(f => (f.t += dt) < f.dur);
  paintFrame(now / 1000); panelTick(); hudTick(); guideTick();
  if(G && (G.state === 'won' || G.state === 'lost') && !G.ended){ G.ended = 1; setTimeout(() => finish(), FX ? 1300 : 0); }
}
function hudTick(force){
  if(!G) return; BAR.lives(Math.max(0, G.hearts), G.hearts <= Math.max(2, G.heartsMax * 0.25)); BAR.round(Math.max(1, G.wave + 1), G.C.waves.length); BAR.score(G.score.toLocaleString());
  BAR.count('foes', '🤴', TD.live(G).length + G.spawnQ.length, 'Suitors still coming');
}
let lastBonkSnd = 0;
function handleEvents(list){
  list.forEach(e => {
    if(e.k === 'bonk'){ burst(e.x, e.y, 0.7, ['⭐', '✨', '💫'], e.boss ? 14 : 5); if(e.boss) SHAKE = 0.45; if(e.pts) floatText(e.x, e.y - 0.6, '+' + e.pts, '#FFB020', 0.9); if(e.boss){ banner('💫 BONK! ' + TD.SUITORS[e.type].name + ' gives up!', 'gold'); UISound.play('success'); if(FX) confetti(['💐', '💫', '⭐']); actAvatar('cheer', 2.5); }
      if(performance.now() - lastBonkSnd > 120){ lastBonkSnd = performance.now(); UISound.play('pop'); } }
    if(e.k === 'heart'){ SHAKE = Math.max(SHAKE, 0.25); burst(e.x, e.y, 1, ['💔', '💍'], 3); UISound.play('bump'); floatText(e.x, e.y - 0.8, '💍 Marry me?!', '#E5484D', 1.2); floatText(TD.CX, TD.CY - 1.6, '−' + e.n + ' ❤️', '#E5484D', 1.1); actAvatar('facepalm', 1.4);
      if(G.lvl === 0 && !G.toldHeart){ G.toldHeart = 1; banner('💔 A suitor reached the tower — tap a glowing skill to stop them!', 'bad'); } }
    if(e.k === 'wave'){ banner(e.boss ? '👑 Here comes ' + TD.SUITORS[G.C.boss].name + '!' : '🌊 Wave ' + e.n + '!', e.boss ? 'bad' : ''); if(G.lvl > 0 && e.n > 1) $('goal').style.opacity = 0; }
    if(e.k === 'waveDone'){ floatText(TD.CX, TD.CY - 2.2, (e.perfect ? '✨ Perfect wave! ' : '✅ Wave done ') + '+' + e.bonus, '#22A867', 1.6); actAvatar('cheer', 1.6); if(G.state === 'pick') setTimeout(nextPick, FX ? 900 : 0); else afterPicks(); }
    if(e.k === 'suitorsUp'){ floatText(TD.CX, 1.6, '🤴 The suitors learned ' + e.icon + ' ' + e.name + '!', '#7B4FE0', 2.2); }
    if(e.k === 'suitorCast'){ floatText(TD.CX, 1.4, e.icon + ' ' + e.name + '!', '#7B4FE0', 1.4); }
    if(e.k === 'suitorSkill'){ const t = {charge: '🛡️ Shield Charge!', ladder: '🪜 Love Ladder!', arrow: '💘 Love Arrow!', bomb: '💐 Flower Bomb!', bouquet: '💐 Bouquet!', shine: '✨ Shiny!',
      potion: '🧪 Love Potion!', decree: '📜 Royal Decree!', choc: '🍫 Chocolate break!', serenade: '🎵 Grand Serenade!', blink: '🌀 Blink!', hire: '💰 Hired more squires!', parade: '💘 Heart Parade!', ring: '💍 Ring toss!'}[e.skill]; if(t) floatText(TD.CX, 2.4, t, '#E5487F', 1.2); }
    if(e.k === 'cast'){ floatText(e.hero === 'dragon' ? G.heroes.dragon.x : TD.CX, (e.hero === 'dragon' ? G.heroes.dragon.y : TD.CY) - 1, e.icon + ' ' + e.name, COLORS[e.col] ? COLORS[e.col].hex : '#333', 1); }
    if(e.k === 'boss'){ UISound.play('nav'); }
    if(e.k === 'boom'){ SHAKE = Math.max(SHAKE, e.big ? 0.5 : 0.2); burst(e.x, e.y, 0.4, ['💥', '🔥', '✨'], e.big ? 16 : 6); }
    if(e.k === 'lastStand'){ banner('🍀 Second chance!', 'gold'); }
    if(e.k === 'won'){ banner('🏆 Chapter ' + G.C.n + ' done!', 'gold'); UISound.play('success'); actAvatar('cheer', 4); if(FX) confetti(['💖', '🐉', '👑', '⭐', '🌹'], 40); }
    if(e.k === 'lost'){ banner('💍 Oh no — wedding bells!', 'bad'); UISound.play('error'); actAvatar('facepalm', 4); }
  });
}
function floatText(x, y, txt, col, dur){ FT.push({x, y, txt, col, t: 0, dur: dur || 1}); if(FT.length > 40) FT.shift(); }
let bannerT = 0;
function banner(txt, kind){ const b = $('banner'); b.textContent = txt; b.className = 'banner on' + (kind ? ' ' + kind : ''); clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.remove('on'), kind ? 2400 : 1700); }
function confetti(list, n){ for(let i = 0; i < (n || 24); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = list[Math.floor(Math.random() * list.length)]; e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }

/* ---------- 🧑 the reader's avatar on the tower balcony (Acting pictures, drawn once) ---------- */
let AV_ACT = 'wave', AV_T = 0;
function avatarFrames(act){ try{ const r = readerSet(); return act === 'wave' ? [r.still] : r.act(act === 'facepalm' ? 'dizzy' : act); }catch(e){ return null; } }
function actAvatar(act, sec){ AV_ACT = act; AV_T = performance.now() + sec * 1000; }


/* ---------- 🧑 characters = real avatars (td-1b) ----------
   Suitors + the Princess are AvatarKit avatars in costumes; the Dragon is the AvatarKit 🐉 ride-on beast without a rider.
   Every look is painted ONCE into small pictures (walk cycle, dizzy, love, bow …) at the map's size → the game only draws images. */
const CHAR = {sets: {}, s: 0};
const SUITOR_LOOK = {   // [outfit, outfit colours by variant, acc, extra equipment]
  sq: {outfit: 3, cols: [1, 3, 4], acc: 3},
  kn: {cols: [8, 8, 8], eq: {costume: {id: 'taleheroes', v: 3}, hand: {id: 'bouquet', v: 0}}},
  bd: {outfit: 2, cols: [6, 7, 12], acc: 6, eq: {hand: {id: 'racket', v: 5}}},
  pr: {outfit: 13, cols: [5, 11, 15], acc: 2},
  cu: {outfit: 0, cols: [10, 10, 7], acc: 0, eq: {back: {id: 'magicback', v: 2}}},
  boss1: {cols: [8], eq: {costume: {id: 'taleheroes', v: 3}, hand: {id: 'bouquet', v: 0}}},
  boss2: {cols: [10], eq: {costume: {id: 'taleheroes', v: 4}, hand: {id: 'bouquet', v: 0}}},
  wz: {cols: [9, 12, 6], acc: 1, eq: {costume: {id: 'professor', v: 1}, back: {id: 'magicback', v: 3}}},
  kg: {outfit: 19, cols: [3, 15, 5], acc: 2},
  gc: {outfit: 11, cols: [7, 4, 14], acc: 3},
  gd: {outfit: 9, cols: [3, 3, 3], acc: 3},
  boss3: {outfit: 13, cols: [11], acc: 2, eq: {back: {id: 'magicback', v: 5}}},
  boss4: {cols: [9], acc: 1, eq: {costume: {id: 'professor', v: 4}, back: {id: 'magicback', v: 9}}},
  boss5: {outfit: 19, cols: [5], acc: 2, eq: {back: {id: 'magicback', v: 6}}},
  boss6: {cols: [7], acc: 2, eq: {costume: {id: 'hero', v: 5}}},
  groom: {outfit: 13, cols: [0], acc: 0},
};
function suitorAv(type, v){
  const L = SUITOR_LOOK[type] || SUITOR_LOOK.sq, base = defaultAvatar('suitor-' + type + '-' + v), av = Object.assign({}, base, {acc: L.acc != null ? L.acc : 0, eq: L.eq || {}});
  if(L.outfit != null) av.outfit = L.outfit; av.outfitColor = L.cols[v % L.cols.length]; if(type === 'cu'){ av.hairColor = 3; av.hair = 5; }
  return fixAv(av);
}
function princessAv(form){
  const av = {skin: 1, hair: 1, hairColor: 3, outfit: 1, outfitColor: 7, acc: 2, eq: {}};
  if(form >= 1){ av.outfitColor = 12; av.eq.back = {id: 'magicback', v: 7}; }
  if(form >= 2){ av.outfitColor = 11; av.eq = {back: {id: 'magicback', v: 1}, costume: {id: 'professor', v: 4}}; av.acc = 0; }
  return fixAv(av);
}
const WALK_N = 8, WALK_P = Math.PI * 2 / 11;
function measurePaint(paint){
  const N = 420, O = 260, M = document.createElement('canvas'); M.width = N; M.height = N; const mg = M.getContext('2d'); mg.translate(N / 2, O); paint(mg);
  const px = mg.getImageData(0, 0, N, N).data; let x0 = N, y0 = N, x1 = 0, y1 = 0;
  for(let y = 0; y < N; y += 2) for(let x = 0; x < N; x += 2) if(px[(y * N + x) * 4 + 3] > 12){ if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y; }
  if(x1 <= x0) return {x0: -20, x1: 20, y0: -70, y1: 2};
  return {x0: x0 - N / 2, x1: x1 - N / 2 + 2, y0: y0 - O, y1: y1 - O + 2};
}
// one cached set per look: {walk: [8 canvases], still, dizzy: [6], love: [6], bow: [6], w, h} (CSS px)
function charSet(key, who, w, h){
  key += '@' + w + 'x' + h + '@' + (VIEW.dpr || 1); if(CHAR.sets[key]) return CHAR.sets[key];
  if(Object.keys(CHAR.sets).length > 160) CHAR.sets = {};
  const dpr = VIEW.dpr || 1, B = measurePaint(g => { drawAvatar(g, {name: who.name, av: who.av, dir: 1}, 0, 0, 1, {t: 0.3}); drawAvatar(g, {name: who.name, av: who.av, dir: 1, walkT: WALK_P / 4}, 0, 0, 1, {t: 0.5}); });
  const k = Math.min((w - 4) / (B.x1 - B.x0), (h - 4) / (B.y1 - B.y0)) * 0.9, fx = Math.round(w / 2 - (B.x0 + B.x1) / 2 * k), fy = Math.round(h - 2 - Math.max(0, B.y1) * k), e = {top: B.y0};
  const mk = paint => { const c = document.createElement('canvas'); c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); const g = c.getContext('2d'); g.scale(dpr, dpr); paint(g); return c; };
  const set = {w, h, fx, fy, head: Math.max(10, -e.top * k), walk: [], acts: {}};
  for(let i = 0; i < WALK_N; i++) set.walk.push(mk(g => drawAvatar(g, {name: who.name, av: who.av, dir: 1, walkT: 0.001 + i / WALK_N * WALK_P}, fx, fy, k, {t: i / WALK_N})));
  set.still = mk(g => drawAvatar(g, {name: who.name, av: who.av, dir: 1}, fx, fy, k, {t: 0.3}));
  set.act = act => { if(set.acts[act]) return set.acts[act]; const out = [];
    if(window.Acting && Acting.has && Acting.has('acts', act)) for(let i = 0; i < 6; i++) out.push(mk(g => Acting.draw(g, who, fx, fy, k, act, {t: i / 6})));
    return (set.acts[act] = out.length ? out : [set.still]); };
  return (CHAR.sets[key] = set);
}
function suitorSet(e){ const S = e.S, v = e.boss ? 0 : e.id % (SUITOR_LOOK[e.type] || SUITOR_LOOK.sq).cols.length, sz = S.size || 1;
  return charSet('s:' + e.type + ':' + v, {name: S.name + ' ' + v, av: suitorAv(e.type, v)}, Math.round(VIEW.s * 1.4 * sz), Math.round(VIEW.s * 1.8 * sz)); }
function princessSet(form){ return charSet('p:' + form, {name: 'Princess', av: princessAv(form)}, Math.round(VIEW.s * 1.35), Math.round(VIEW.s * 1.75)); }
// 🐉 the Dragon = the AvatarKit ride-on dragon with nobody on it; measured once, then 8 wing-flap pictures
const DRAGON_LOOK = (() => { const L = typeof RIDE_LOOK !== 'undefined' ? RIDE_LOOK : []; const f = n => Math.max(0, L.findIndex(r => r.n === n));
  const d = f('Dragon'), az = L.findIndex(r => r.n === 'Azure Dragon'); return [d, d, az >= 0 ? az : d]; })();
function dragonSet(form){
  const v = DRAGON_LOOK[form], scale = [0.82, 1, 1.15][form] || 1, w = Math.round(VIEW.s * 2.9 * scale), h = Math.round(VIEW.s * 2.4 * scale), dpr = VIEW.dpr || 1;
  const key = 'd:' + form + '@' + w + 'x' + h + '@' + dpr; if(CHAR.sets[key]) return CHAR.sets[key];
  const paint = (g, k, t) => { if(typeof rideAnimal !== 'function') return; ['back', 'front', 'head'].forEach(l => rideAnimal(g, v, k, t, 0, l)); };
  const B = measurePaint(g => { for(let i = 0; i < 4; i++) paint(g, 1, i / 4); });
  const k = Math.min((w - 6) / (B.x1 - B.x0), (h - 6) / (B.y1 - B.y0)), ox = w / 2 - (B.x0 + B.x1) / 2 * k, oy = h / 2 - (B.y0 + B.y1) / 2 * k;
  const set = {w, h, fx: w / 2, fy: h, head: h, fly: []};
  for(let i = 0; i < 8; i++){ const c = document.createElement('canvas'); c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); const g = c.getContext('2d'); g.scale(dpr, dpr); g.translate(ox, oy); paint(g, k, i / 8); set.fly.push(c); }
  return (CHAR.sets[key] = set);
}
function atScale(sc, fn){ const keep = VIEW.s; VIEW.s = sc; try{ return fn(); } finally{ VIEW.s = keep; } }
// paint a hero / suitor picture into any canvas, fitted (panel faces, diary pages, result card)
function paintChar(g, set, pic, cx, feet, maxH, flip){ const sc = Math.min(1, maxH / set.h) || 1; drawPic(g, pic, cx, feet, set.w * sc, set.h * sc, flip, 0, 1, set); }
function drawPic(g, c, x, yFeet, w, h, flip, rot, alpha, set){
  g.save(); g.translate(x, yFeet); if(rot) g.rotate(rot); if(flip) g.scale(-1, 1); if(alpha != null) g.globalAlpha = alpha;
  const sc = set ? w / set.w : 1; if(set) g.drawImage(c, -set.fx * sc, -set.fy * sc, w, h); else g.drawImage(c, -w / 2, -h, w, h); g.restore();
}
function readerSet(){ return charSet('me:' + S.player, {name: S.player || 'reader', av: myAvatar(S.player)}, Math.round(VIEW.s * 1.2), Math.round(VIEW.s * 1.55)); }

/* ---------- 🎨 2.5D storybook painter (td-1b) ----------
   The map is tilted like a diorama: the ground is drawn squashed (K), everything that stands (tower, suitors, trees, dragon)
   is drawn upright at its foot point, far things first (depth = world y). One painter for play + previews.
   P(x, y, z) → screen: x·s, TOP + y·s·K − z·s·Z.  Emoji only through the AvatarKit sprite cache (emo).          */
const V25 = {K: 0.6, Z: 0.9, TOP: 1.9, BOT: 0.35};
V25.AR = (V25.TOP + TD.W * V25.K + V25.BOT) / TD.W;                 // stage height ÷ width
const PX = (x) => x * VIEW.s, PY = (y, z) => (V25.TOP + y * V25.K - (z || 0) * V25.Z) * VIEW.s;
function groundTf(g){ const d = VIEW.dpr, s = VIEW.s; g.setTransform(d * s, 0, 0, d * s * V25.K, 0, d * s * V25.TOP); }   // draw in world units on the ground
function screenTf(g){ const d = VIEW.dpr; g.setTransform(d, 0, 0, d, 0, 0); }
const DECOR = {meadow: ['🌳', '🌳', '🌲', '🌸', '🌼', '🌷', '🍄', '🪨', '🌿'], sunset: ['🌳', '🌻', '🌹', '🌲', '🪨', '🌾', '🍄', '🌿'],
  roses: ['🌹', '🌹', '🌷', '🌳', '🌸', '🦋', '🌳', '🌿'], moon: ['🌲', '🌲', '🍄', '🪨', '🌳', '🍄', '🌿', '🕯️'], gold: ['🍂', '🌳', '🌾', '🪨', '🎃', '🌲', '🍁', '🌾'],
  festival: ['🌳', '🎈', '🌸', '🌼', '🎏', '🌷', '🌳', '🎀'], chapel: ['💐', '🌸', '🌳', '🕊️', '🌼', '🎀', '🌷', '🌳']};
const SCENE_PAL = {
  sunset: {sky1: '#FF9E7A', sky2: '#FFD9B3', hill1: '#B98BC9', hill2: '#8E6FB3', g1: '#A8D57A', g2: '#79B85A', g3: '#5E9A48', path: '#F0CFA0', edge: '#C89A62', stone: '#E3BC8A', tint: 'rgba(255,140,90,.10)', sun: '#FFE08A'},
  roses: {sky1: '#FFB3CF', sky2: '#FFE9F1', hill1: '#E7A1C4', hill2: '#C97AA8', g1: '#B9E58F', g2: '#90CF6E', g3: '#6EB352', path: '#F6DCC8', edge: '#DDA98C', stone: '#EDC7AE', tint: 'rgba(255,120,170,.07)', sun: '#FFF0F6'},
  moon: {sky1: '#1F2257', sky2: '#5B4E9A', hill1: '#3D3F7A', hill2: '#2B2D5E', g1: '#6E9E77', g2: '#4F8060', g3: '#3D6A4C', path: '#CFC2A0', edge: '#9C8C6A', stone: '#B7A983', tint: 'rgba(40,40,130,.2)', sun: '#FFF6C8', night: true},
  gold: {sky1: '#FFC870', sky2: '#FFEFC9', hill1: '#D9A45C', hill2: '#B9853E', g1: '#CADB7E', g2: '#A9BE58', g3: '#8AA040', path: '#F2D79A', edge: '#C99A4F', stone: '#E4C27E', tint: 'rgba(255,170,60,.08)', sun: '#FFF3B0'},
  festival: {sky1: '#B9A6FF', sky2: '#FFE0F0', hill1: '#E39BD0', hill2: '#A88BE8', g1: '#B2E48A', g2: '#86CC66', g3: '#68B04C', path: '#FBE2B8', edge: '#E3B26F', stone: '#F0CB93', tint: null, sun: '#FFF3B0'},
  chapel: {sky1: '#BFE3FF', sky2: '#FFF4FA', hill1: '#C9E2B5', hill2: '#A6CC91', g1: '#D2EDB8', g2: '#ADD893', g3: '#8DBF74', path: '#F6EEE4', edge: '#D9C9B0', stone: '#EADFCF', tint: 'rgba(255,255,255,.08)', sun: '#FFFFFF'},
};
function scenePal(){ return G && SCENE_PAL[G.C.scene] ||
  {sky1: '#8FD3FF', sky2: '#DDF3FF', hill1: '#9FD39A', hill2: '#78B87A', g1: '#B5E58A', g2: '#8CCB64', g3: '#6DAE4E', path: '#F4DDAA', edge: '#CFA868', stone: '#E8C994', tint: null, sun: '#FFF3B0'}; }
// 🖼️ static layer: sky + far hills + tilted ground + paths + moat + build pads (+ trees, which stand up but never move)
let DECO_ITEMS = [];
function drawBG(){
  const c = document.createElement('canvas'); c.width = $('cv').width; c.height = $('cv').height; const g = c.getContext('2d'), s = VIEW.s, W = VIEW.px, H = VIEW.ph;
  const C = scenePal(), R = TD.rngOf((G.jail ? 77 : G.C.n) * 97 + 3);
  screenTf(g);
  // sky + far hills + a little castle on the horizon
  const hz = PY(-0.25); let gr = g.createLinearGradient(0, 0, 0, hz); gr.addColorStop(0, C.sky1); gr.addColorStop(1, C.sky2); g.fillStyle = gr; g.fillRect(0, 0, W, hz + 2);
  g.fillStyle = C.sun; g.globalAlpha = 0.85; g.beginPath(); g.arc(W * 0.83, hz * 0.42, s * 0.55, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  if(C.night){ g.fillStyle = C.sky1; g.beginPath(); g.arc(W * 0.83 + s * 0.22, hz * 0.42 - s * 0.12, s * 0.48, 0, Math.PI * 2); g.fill();   // 🌙 a crescent + stars
    for(let i = 0; i < 46; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.45 + R() * 0.5) + ')'; const r = s * (0.02 + R() * 0.03); g.beginPath(); g.arc(R() * W, R() * hz * 0.85, r, 0, Math.PI * 2); g.fill(); } }
  [[C.hill1, 0.55, 1.3], [C.hill2, 0.25, 0.9]].forEach(([col, a, amp], k) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, hz + 2);
    for(let x = 0; x <= W + 10; x += 10) g.lineTo(x, hz - s * (0.35 + amp * 0.5 * (0.5 + 0.5 * Math.sin(x / W * Math.PI * (2 + k) + k * 2)))); g.lineTo(W, hz + 2); g.fill(); });
  emo(g, G.jail ? '⛓️' : '🏰', W * 0.16, hz - s * 0.55, s * 0.75, 0.55); emo(g, '🌳', W * 0.33, hz - s * 0.28, s * 0.5, 0.6); emo(g, '🌳', W * 0.66, hz - s * 0.3, s * 0.55, 0.6);
  for(let i = 0; i < (C.night ? 0 : 3); i++) emo(g, '☁️', W * (0.12 + i * 0.33 + R() * 0.1), hz * (0.25 + R() * 0.3), s * (0.7 + R() * 0.4), 0.9);
  // the ground, tilted
  groundTf(g);
  gr = g.createLinearGradient(0, -0.4, 0, 16.6); gr.addColorStop(0, C.g2); gr.addColorStop(0.5, C.g1); gr.addColorStop(1, C.g2); g.fillStyle = gr; g.fillRect(-1, -0.4, 18, 17.3);
  for(let y = 0; y < 16; y++) for(let x = 0; x < 16; x++) if((x + y) % 2){ g.fillStyle = 'rgba(255,255,255,.045)'; g.fillRect(x, y, 1, 1); }   // soft field tiles
  g.strokeStyle = C.g3; g.lineWidth = 0.035; g.lineCap = 'round';
  for(let i = 0; i < 220; i++){ const x = R() * 16, y = R() * 16.4; g.beginPath(); g.moveTo(x - 0.07, y); g.lineTo(x - 0.03, y - 0.13); g.moveTo(x + 0.02, y); g.lineTo(x + 0.06, y - 0.15); g.stroke(); }   // grass tufts
  for(let i = 0; i < 60; i++){ g.fillStyle = ['#FFFFFF', '#FFD6E7', '#FFF2A8', '#D9C8FF'][i % 4]; g.globalAlpha = 0.8; g.beginPath(); g.arc(R() * 16, R() * 16.4, 0.045, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1;
  // 🌊 moat + 🪵 little bridges where the paths cross it
  g.fillStyle = '#4FA6DE'; g.beginPath(); g.arc(TD.CX, TD.CY, 1.95, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 0.05; g.beginPath(); g.arc(TD.CX, TD.CY, 1.75, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = '#8DBF62'; g.lineWidth = 0.14; g.beginPath(); g.arc(TD.CX, TD.CY, 1.98, 0, Math.PI * 2); g.stroke();
  // paths: shadow edge → dirt → cobbles
  G.paths.forEach(P => { const line = () => { g.beginPath(); P.pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); };
    g.lineCap = 'round'; g.lineJoin = 'round'; line(); g.strokeStyle = 'rgba(70,50,20,.22)'; g.lineWidth = 1.12; g.stroke();
    line(); g.strokeStyle = C.edge; g.lineWidth = 1.0; g.stroke(); line(); g.strokeStyle = C.path; g.lineWidth = 0.82; g.stroke();
    for(let d = 0.3; d < P.len - 0.2; d += 0.32){ const p = TD.ptAt(P, d), o = (R() - 0.5) * 0.5; const nx = -Math.sin(p.ang), ny = Math.cos(p.ang); g.fillStyle = R() < 0.5 ? C.stone : 'rgba(255,255,255,.35)';
      g.beginPath(); g.ellipse(p.x + nx * o, p.y + ny * o, 0.09 + R() * 0.05, 0.07, p.ang, 0, Math.PI * 2); g.fill(); }
    const L = P.pts[P.pts.length - 1], Pv = P.pts[P.pts.length - 2], a = Math.atan2(L[1] - Pv[1], L[0] - Pv[0]);   // bridge over the moat
    g.save(); g.translate(L[0] - Math.cos(a) * 0.35, L[1] - Math.sin(a) * 0.35); g.rotate(a); g.fillStyle = '#B07A4F'; g.fillRect(-0.55, -0.45, 1.1, 0.9);
    g.strokeStyle = '#8A5A33'; g.lineWidth = 0.04; for(let k = -0.45; k <= 0.55; k += 0.2){ g.beginPath(); g.moveTo(k, -0.45); g.lineTo(k, 0.45); g.stroke(); } g.restore(); });
  // build pads (where Rose Towers can appear)
  G.spots.forEach(p => { g.fillStyle = 'rgba(120,100,80,.18)'; g.beginPath(); g.arc(p.x, p.y + 0.05, 0.42, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(p.x, p.y, 0.36, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(160,130,100,.35)'; g.lineWidth = 0.04; g.stroke(); });
  // 🚩 path starts at the edge
  screenTf(g); G.paths.forEach(P => { const st = P.pts[0], x = Math.max(0.5, Math.min(15.5, st[0])), y = Math.max(0.2, Math.min(15.6, st[1])); emo(g, '🚩', PX(x), PY(y, 0.4), s * 0.6); });
  // trees + flowers stand up (static) → baked into the background, far ones first
  DECO_ITEMS = []; const pal = DECOR[G.C.scene] || DECOR.meadow;
  for(let i = 0; i < 44; i++){ const x = 0.3 + R() * 15.4, y = 0.1 + R() * 16; if(Math.hypot(x - 8, y - 8) < 2.7) continue;
    let near = 9; G.paths.forEach(P => { for(let q = 0; q <= P.len; q += 0.4){ const p = TD.ptAt(P, q); near = Math.min(near, Math.hypot(p.x - x, p.y - y)); } }); if(near < 0.95) continue;
    if(G.spots.some(p => Math.hypot(p.x - x, p.y - y) < 0.7)) continue; const ic = pal[Math.floor(R() * pal.length)], big = ic === '🌳' || ic === '🌲';
    DECO_ITEMS.push({x, y, ic, sz: big ? 0.95 + R() * 0.35 : 0.45 + R() * 0.2}); }
  DECO_ITEMS.sort((a, b) => a.y - b.y).forEach(d => { shadow(g, d.x, d.y, d.sz * 0.42); emo(g, d.ic, PX(d.x), PY(d.y, d.sz * 0.5), s * d.sz); });
  if(C.tint){ g.fillStyle = C.tint; g.fillRect(0, 0, W, H); }
  const vg = g.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.4, W / 2, H * 0.55, Math.max(W, H) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(40,20,60,.22)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  BG = c; TOWER_PIC = null;
}
function shadow(g, x, y, r, a){ g.fillStyle = 'rgba(30,40,20,' + (a == null ? 0.22 : a) + ')'; g.beginPath(); g.ellipse(PX(x) + r * VIEW.s * 0.15, PY(y), r * VIEW.s, r * VIEW.s * V25.K * 0.75, 0, 0, Math.PI * 2); g.fill(); }

/* ---------- 🏰 the 2.5D tower (cached picture per size + Princess form) ---------- */
let TOWER_PIC = null;
const TW = {R: 1.15, H: 2.4, roofR: 0.82, roofH: 1.75};
function towerLook(form){ if(G && G.jail) return {wall1: '#FFFFFF', wall2: '#DCD2E4', brick: 'rgba(200,160,200,.22)', roof1: '#FFB3D1', roof2: '#F06C9B', trim: '#FFD36B', band: '💒'};
  return [{wall1: '#F1EAF7', wall2: '#B9ABCB', brick: 'rgba(110,90,140,.28)', roof1: '#FF8FBF', roof2: '#E2477F', trim: '#FFD36B', band: null},
  {wall1: '#FFF0F6', wall2: '#D3A8C0', brick: 'rgba(160,80,120,.25)', roof1: '#FF6FA8', roof2: '#C2185B', trim: '#FFD36B', band: '💗'},
  {wall1: '#F3EEFF', wall2: '#A99BD6', brick: 'rgba(90,70,170,.28)', roof1: '#9B7BFF', roof2: '#5B3DC4', trim: '#FFE27A', band: '⭐'}][Math.min(2, form || 0)]; }
function towerPicture(form){
  const s = VIEW.s, d = VIEW.dpr, w = Math.ceil(s * 3.4), h = Math.ceil(s * 5.4), c = document.createElement('canvas'); c.width = Math.ceil(w * d); c.height = Math.ceil(h * d);
  const g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0);
  const L = towerLook(form), cx = w / 2, R = TW.R * s, ry = R * V25.K, base = h - ry - 4, top = base - TW.H * s * V25.Z;
  // body: a cylinder, lit from the left
  let gr = g.createLinearGradient(cx - R, 0, cx + R, 0); gr.addColorStop(0, L.wall2); gr.addColorStop(0.28, L.wall1); gr.addColorStop(0.62, L.wall1); gr.addColorStop(1, L.wall2);
  g.fillStyle = gr; g.beginPath(); g.moveTo(cx - R, top); g.lineTo(cx - R, base); g.ellipse(cx, base, R, ry, 0, Math.PI, 0, true); g.lineTo(cx + R, top); g.ellipse(cx, top, R, ry, 0, 0, Math.PI, false); g.closePath(); g.fill();
  // bricks: curved rows + joints on the front half
  g.save(); g.clip(); g.strokeStyle = L.brick; g.lineWidth = Math.max(1, s * 0.03);
  const rows = 8, rh = (base - top) / rows;
  for(let i = 1; i <= rows; i++){ const y = top + i * rh; g.beginPath(); g.ellipse(cx, y, R, ry, 0, 0, Math.PI); g.stroke();
    for(let a = (i % 2 ? 0.18 : 0.34); a < Math.PI; a += 0.33){ const x = cx + Math.cos(a) * R, yy = y + Math.sin(a) * ry; g.beginPath(); g.moveTo(x, yy); g.lineTo(x, yy - rh); g.stroke(); } }
  g.restore();
  // 🚪 door + 🪟 glowing windows
  g.fillStyle = '#7A4B2A'; g.beginPath(); const dw = s * 0.42, dh = s * 0.72, dy = base + ry * 0.95; g.moveTo(cx - dw / 2, dy); g.lineTo(cx - dw / 2, dy - dh + dw / 2); g.arc(cx, dy - dh + dw / 2, dw / 2, Math.PI, 0); g.lineTo(cx + dw / 2, dy); g.fill();
  g.strokeStyle = '#5A3418'; g.lineWidth = Math.max(1, s * 0.03); g.stroke(); g.fillStyle = L.trim; g.beginPath(); g.arc(cx + dw * 0.25, dy - dh * 0.42, s * 0.035, 0, Math.PI * 2); g.fill();
  [[-0.55, 0.52], [0.5, 0.42], [-0.05, 0.75]].forEach(([fx, fz], i) => { const x = cx + fx * R, y = base - fz * (base - top) + Math.sqrt(Math.max(0, 1 - fx * fx)) * ry, ww = s * 0.2 * Math.sqrt(1 - fx * fx * 0.8), wh = s * 0.32;
    g.fillStyle = '#5A3E6E'; g.beginPath(); g.moveTo(x - ww / 2, y); g.lineTo(x - ww / 2, y - wh + ww / 2); g.arc(x, y - wh + ww / 2, ww / 2, Math.PI, 0); g.lineTo(x + ww / 2, y); g.fill();
    g.fillStyle = 'rgba(255,214,110,.9)'; g.beginPath(); g.arc(x, y - wh * 0.45, ww * 0.3, 0, Math.PI * 2); g.fill(); });
  if(L.band){ g.font = Math.round(s * 0.28) + 'px sans-serif'; }
  // balcony: an overhanging stone ring with merlons
  const bR = R * 1.12, bry = bR * V25.K;
  g.fillStyle = L.wall2; g.beginPath(); g.ellipse(cx, top + s * 0.08, bR, bry, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = L.wall1; g.beginPath(); g.ellipse(cx, top, bR, bry, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFE7F1'; g.beginPath(); g.ellipse(cx, top, bR * 0.86, bry * 0.86, 0, 0, Math.PI * 2); g.fill();
  for(let i = 0; i < 14; i++){ const a = Math.PI + i / 14 * Math.PI * 2; if(Math.sin(a) > 0.2) continue;   // back merlons now, front ones are drawn in front of the princess
    const x = cx + Math.cos(a) * bR * 0.95, y = top + Math.sin(a) * bry * 0.95; g.fillStyle = L.wall2; g.fillRect(x - s * 0.1, y - s * 0.2, s * 0.2, s * 0.2); g.fillStyle = L.wall1; g.fillRect(x - s * 0.1, y - s * 0.24, s * 0.2, s * 0.06); }
  // roof: a cone behind the balcony's front edge
  const rR = TW.roofR * s, apex = top - TW.roofH * s * V25.Z - s * 0.2, rb = top - s * 0.18;
  gr = g.createLinearGradient(cx - rR, 0, cx + rR, 0); gr.addColorStop(0, L.roof2); gr.addColorStop(0.35, L.roof1); gr.addColorStop(1, L.roof2);
  g.fillStyle = gr; g.beginPath(); g.moveTo(cx, apex); g.lineTo(cx + rR, rb); g.ellipse(cx, rb, rR, rR * V25.K, 0, 0, Math.PI); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = Math.max(1, s * 0.04); for(let k = -2; k <= 2; k++){ g.beginPath(); g.moveTo(cx, apex); g.lineTo(cx + k * rR * 0.38, rb + Math.sqrt(1 - (k * 0.38) ** 2) * rR * V25.K); g.stroke(); }
  g.strokeStyle = L.trim; g.lineWidth = Math.max(2, s * 0.07); g.beginPath(); g.ellipse(cx, rb, rR, rR * V25.K, 0, 0, Math.PI); g.stroke();
  return {c, w, h, base, top, cx, bR, bry, apex, form, L};
}
function drawTower(g, t){
  const s = VIEW.s, form = G.trees.princess.form; if(!TOWER_PIC || TOWER_PIC.form !== form || TOWER_PIC.s !== s || TOWER_PIC.jail !== G.jail){ TOWER_PIC = towerPicture(form); TOWER_PIC.s = s; TOWER_PIC.jail = G.jail; }
  const T = TOWER_PIC, ox = PX(TD.CX) - T.cx, oy = PY(TD.CY) - T.base + T.bry * 0 ;
  shadow(g, TD.CX + 0.35, TD.CY + 0.25, TW.R * 1.05, 0.25);
  g.drawImage(T.c, ox, oy, T.w, T.h);
  // 🚩 flag on the roof tip (moves)
  const fx = ox + T.cx, fy = oy + T.apex; g.strokeStyle = '#6B4A2F'; g.lineWidth = Math.max(1.5, s * 0.05); g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx, fy - s * 0.75); g.stroke();
  g.fillStyle = T.L.roof2; g.beginPath(); g.moveTo(fx, fy - s * 0.75); g.quadraticCurveTo(fx + s * 0.3, fy - s * (0.68 + 0.06 * Math.sin(t * 6)), fx + s * 0.55, fy - s * 0.6); g.lineTo(fx, fy - s * 0.45); g.fill();
  if(T.L.band) emo(g, T.L.band, fx + s * 0.22, fy - s * 0.6, s * 0.22);
  // 👸 princess + 🧑 the reader on the balcony, then the front merlons
  const by = oy + T.top, pz = G.heroes.princess;
  if(form >= 1){ g.fillStyle = 'rgba(255,92,154,' + (0.16 + 0.1 * Math.sin(t * 3)) + ')'; g.beginPath(); g.ellipse(fx, by + T.bry * 0.35, s * 0.6, s * 0.6 * V25.K, 0, 0, Math.PI * 2); g.fill(); }
  const ps = princessSet(form), swat = pz.atk > HEROES_RATE_P - 0.3, pact = G.jail ? ps.act('shy') : performance.now() < AV_T && AV_ACT === 'cheer' ? ps.act('cheer') : swat ? ps.act('cheer') : null;
  const ppic = pact ? pact[Math.floor(t * 8) % pact.length] : ps.still;
  drawPic(g, ppic, fx - s * 0.25, by + T.bry * 0.55 - Math.abs(Math.sin(t * 2)) * s * 0.03, ps.w, ps.h, false, 0, 1, ps);
  const rs = readerSet(), ract = performance.now() < AV_T ? rs.act(AV_ACT === 'facepalm' ? 'dizzy' : 'cheer') : null, rpic = ract ? ract[Math.floor(t * 7) % ract.length] : rs.still;
  drawPic(g, rpic, fx + s * 0.55, by + T.bry * 0.62, rs.w, rs.h, true, 0, 1, rs);
  if(pz.dazeT > 0) emo(g, '✨', fx + s * 0.25, by - s * 0.9, s * 0.45);
  for(let i = 0; i < 14; i++){ const a = Math.PI + i / 14 * Math.PI * 2; if(Math.sin(a) <= 0.2) continue; const x = ox + T.cx + Math.cos(a) * T.bR * 0.95, y = by + Math.sin(a) * T.bry * 0.95;
    g.fillStyle = T.L.wall2; g.fillRect(x - s * 0.1, y - s * 0.2, s * 0.2, s * 0.22); g.fillStyle = T.L.wall1; g.fillRect(x - s * 0.1, y - s * 0.24, s * 0.2, s * 0.07); }
  // 🛡️ home effects around the tower
  if(G.domeT > 0){ const r = 2.3 + 0.05 * Math.sin(t * 5); g.fillStyle = 'rgba(150,220,255,.18)'; g.strokeStyle = 'rgba(130,205,255,.85)'; g.lineWidth = s * 0.07;
    g.beginPath(); g.ellipse(PX(TD.CX), PY(TD.CY), PX(r), PX(r) * V25.K, 0, 0, Math.PI); g.arc(PX(TD.CX), PY(TD.CY), PX(r), Math.PI, 0); g.fill(); g.stroke(); }
  if(G.shieldHp > 0){ g.strokeStyle = 'rgba(34,168,103,.9)'; g.lineWidth = s * 0.12; g.beginPath(); g.ellipse(PX(TD.CX), PY(TD.CY, 1.2), PX(1.45), PX(1.45) * V25.K, 0, 0, Math.PI * 2); g.stroke(); dots(g, PX(TD.CX), PY(TD.CY) + s * 0.7, G.shieldHp, '#22A867', s); }
  if(G.reflectN > 0) emo(g, '🪞', PX(TD.CX + 1.45), PY(TD.CY, 1.3), s * 0.6);
  if(G.armorT > 0){ g.strokeStyle = 'rgba(34,181,115,.65)'; g.lineWidth = s * 0.06; g.setLineDash([s * 0.15, s * 0.1]); g.beginPath(); g.ellipse(PX(TD.CX), PY(TD.CY, 0.2), PX(1.5), PX(1.5) * V25.K, 0, t, t + Math.PI * 2); g.stroke(); g.setLineDash([]); }
}
const HEROES_RATE_P = TD.HEROES.princess.rate;

/* ---------- the frame ---------- */
let SHAKE = 0;
function paintFrame(t){
  const cv = $('cv'), g = cv.getContext('2d'), s = VIEW.s; if(!G) return;
  if(!BG) drawBG();
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(BG, 0, 0);
  let sx = 0, sy = 0; if(SHAKE > 0 && FX){ SHAKE = Math.max(0, SHAKE - 1 / 60); sx = (Math.random() - 0.5) * s * 0.25 * SHAKE * 3; sy = (Math.random() - 0.5) * s * 0.18 * SHAKE * 3; }
  // ☁️ cloud shadows drift over the meadow
  screenTf(g); if(sx || sy) g.translate(sx, sy);
  groundTf(g); if(sx || sy){ g.setTransform(VIEW.dpr * s, 0, 0, VIEW.dpr * s * V25.K, VIEW.dpr * sx, VIEW.dpr * (s * V25.TOP + sy)); }
  for(let i = 0; i < 3; i++){ const x = ((t * 0.35 + i * 6.3) % 22) - 3, y = 3 + i * 4.6; g.fillStyle = 'rgba(40,60,90,.07)'; g.beginPath(); g.ellipse(x, y, 2.2, 1.3, 0, 0, Math.PI * 2); g.ellipse(x + 1.4, y + 0.4, 1.6, 1, 0, 0, Math.PI * 2); g.fill(); }
  // 🌊 moat shimmer
  g.strokeStyle = 'rgba(255,255,255,' + (0.25 + 0.2 * Math.sin(t * 2)) + ')'; g.lineWidth = 0.04; g.beginPath(); g.arc(TD.CX, TD.CY, 1.55 + 0.08 * Math.sin(t * 1.5), 0.3, 2.2); g.stroke(); g.beginPath(); g.arc(TD.CX, TD.CY, 1.62, 3.6, 5.2); g.stroke();
  // ground things: traps, hot floors, zones, cones, rings (squashed with the ground)
  G.traps.forEach(T => { if(T.fx === 'lava'){ const a = 0.55 + 0.2 * Math.sin(t * 6); const gr = g.createRadialGradient(T.x, T.y, 0, T.x, T.y, T.r); gr.addColorStop(0, 'rgba(255,140,40,' + a + ')'); gr.addColorStop(1, 'rgba(255,60,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(T.x, T.y, T.r, 0, Math.PI * 2); g.fill(); }
    else if(!FX_OK){ g.fillStyle = 'rgba(110,60,20,.16)'; g.beginPath(); g.arc(T.x, T.y, T.r, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(160,97,44,.5)'; g.lineWidth = 0.04; g.setLineDash([0.12, 0.1]); g.stroke(); g.setLineDash([]); } });
  G.zones.forEach(Z => { if(Z.k === 'meteor'){ if(Z.t < Z.delay){ g.strokeStyle = 'rgba(229,72,77,.85)'; g.lineWidth = 0.08; g.setLineDash([0.25, 0.18]); g.beginPath(); g.arc(Z.x, Z.y, (Z.big ? 7.6 : Z.r) * (1 - Z.t / Z.delay * 0.15), 0, Math.PI * 2); g.stroke(); g.setLineDash([]); }
      else if(!FX_OK){ const p = (Z.t - Z.delay) / 0.45; if(p < 1){ g.fillStyle = 'rgba(255,170,60,' + (0.55 * (1 - p)) + ')'; g.beginPath(); g.arc(Z.x, Z.y, (Z.big ? 8 : Z.r) * (0.6 + p * 0.6), 0, Math.PI * 2); g.fill(); } } return; }
    if(FX_OK && (Z.k === 'tornado' || Z.k === 'storm')) return; g.fillStyle = Z.k === 'tornado' ? 'rgba(255,140,60,.2)' : 'rgba(255,92,154,.18)'; g.beginPath(); g.arc(Z.x, Z.y, Z.r, 0, Math.PI * 2); g.fill(); });
  G.fx.forEach(f => { if(!FX_OK || !SKFX[f.k]) drawGroundFx(g, f, t); });
  // standing things, far → near (depth = world y)
  screenTf(g); if(sx || sy) g.translate(sx, sy);
  drawTrapRunes(g, s, t); G.fx.forEach(f => drawSkillFx(g, f, s, t, 'ground'));
  const items = [];
  G.traps.forEach(T => items.push({y: T.y - 0.05, d: () => { emo(g, T.icon, PX(T.x), PY(T.y, 0.22), s * 0.55, T.fx === 'lava' ? 0.8 : 1); if(T.charges > 1 && T.charges < 20) dots(g, PX(T.x), PY(T.y) + s * 0.3, T.charges, '#A0612C', s); }}));
  G.walls.forEach(w => items.push({y: w.y, d: () => { shadow(g, w.x, w.y, 0.45); emo(g, w.icon, PX(w.x), PY(w.y, 0.45), s * 0.95); bar(g, PX(w.x), PY(w.y, 1.05), s * 0.8, w.hp / w.hpMax, '#22A867'); }}));
  G.decoys.forEach(dc => items.push({y: dc.y, d: () => { shadow(g, dc.x, dc.y, 0.45); emo(g, '🫖', PX(dc.x - 0.25), PY(dc.y, 0.3), s * 0.55); emo(g, '🍰', PX(dc.x + 0.28), PY(dc.y, 0.25), s * 0.5); }}));
  G.towers.forEach(T => items.push({y: T.y, d: () => { shadow(g, T.x, T.y, 0.38); const pop = Math.min(1, T.t / 0.35);
    emo(g, '🗼', PX(T.x), PY(T.y, 0.55 * pop), s * 1.05 * (0.5 + 0.5 * pop), T.offT > 0 ? 0.45 : 1); if(T.offT > 0) emo(g, '💐', PX(T.x + 0.3), PY(T.y, 1.1), s * 0.5); if(T.slowed) emo(g, '🎵', PX(T.x - 0.35), PY(T.y, 1.2), s * 0.4);
    ring(g, PX(T.x), PY(T.y) + s * 0.25, s * 0.14, 1 - T.t / T.dur, '#3A86FF'); }}));
  G.enemies.forEach(e => items.push({y: e.y, d: () => drawSuitor(g, e, t, s)}));
  G.minions.forEach(m => items.push({y: m.y, d: () => { const hop = Math.abs(Math.sin(t * 9 + m.d)) * 0.18; shadow(g, m.x, m.y, 0.25); emo(g, m.icon, PX(m.x), PY(m.y, 0.3 + hop), s * 0.6); if(m.fight) emo(g, '💥', PX(m.x - 0.25), PY(m.y, 0.8), s * 0.35); bar(g, PX(m.x), PY(m.y, 0.8), s * 0.5, m.hp / m.hpMax, '#3A86FF'); }}));
  items.push({y: TD.CY + 0.1, d: () => drawTower(g, t)});
  const hd = G.heroes.dragon, DT = G.trees.dragon, ds = s * (1.05 + 0.25 * DT.form), dz = 1.9 + Math.sin(t * 3) * 0.15;
  items.push({y: hd.y < TD.CY - 1.2 ? hd.y : 99, d: () => { shadow(g, hd.x, hd.y, 0.38 + 0.08 * DT.form, 0.18);
    if(DT.form >= 2){ g.fillStyle = 'rgba(255,80,120,' + (0.22 + 0.12 * Math.sin(t * 4)) + ')'; g.beginPath(); g.arc(PX(hd.x), PY(hd.y, dz), ds * 0.7, 0, Math.PI * 2); g.fill(); }
    const dset = dragonSet(DT.form), goingLeft = hd.px != null ? hd.x < hd.px - 1e-4 : false; if(hd.px == null || Math.abs(hd.x - hd.px) > 1e-4) hd.face = goingLeft ? -1 : 1; hd.px = hd.x;
    drawPic(g, dset.fly[Math.floor(t * 8) % dset.fly.length], PX(hd.x), PY(hd.y, dz) + dset.h * 0.5, dset.w, dset.h, (hd.face || 1) < 0, 0, hd.dazeT > 0 ? 0.75 : 1);
    if(hd.sleepy) emo(g, '💤', PX(hd.x) + ds * 0.45, PY(hd.y, dz) - ds * 0.55, s * 0.45); if(hd.dazeT > 0) emo(g, '💐', PX(hd.x) - ds * 0.4, PY(hd.y, dz) - ds * 0.5, s * 0.45); }});
  G.flyers.forEach(f => items.push({y: f.y, d: () => { shadow(g, f.x, f.y, 0.18, 0.15); emo(g, f.icon, PX(f.x), PY(f.y, 1.2 + Math.sin(t * 10 + f.atk) * 0.1), s * 0.55); }}));
  items.sort((a, b) => a.y - b.y).forEach(it => it.d());
  // ✨ air effects + 💬 words
  drawSkillZones(g, s, t);
  G.fx.forEach(f => { if(!drawSkillFx(g, f, s, t, 'air')) drawFx(g, f, s, t); drawSkillFxAlso(g, f, s, t); });
  PARTS = PARTS.filter(p => (p.t += 1 / 60) < p.dur); PARTS.forEach(p => { const k = p.t / p.dur; emo(g, p.ic, PX(p.x) + p.vx * k * s, PY(p.y, p.z) + (p.vy * k + 2.2 * k * k) * s, s * p.sz * (1 - k * 0.4), 1 - k); });
  g.textAlign = 'center'; g.textBaseline = 'middle';
  FT.forEach(f => { const p = f.t / f.dur, a = p < 0.75 ? 1 : 1 - (p - 0.75) / 0.25, fs = Math.max(11, s * 0.5), pop = p < 0.12 ? 0.6 + p / 0.12 * 0.4 : 1;
    g.font = '800 ' + Math.round(fs * pop) + 'px Fredoka, Nunito, sans-serif'; g.globalAlpha = a; const x = Math.max(fs * 2, Math.min(VIEW.px - fs * 2, PX(f.x))), y = Math.max(fs, PY(f.y, 1.4) - p * s * 0.9);
    g.lineWidth = fs * 0.24; g.strokeStyle = 'rgba(255,255,255,.95)'; drawTxt(g, f.txt, x, y, fs * pop, f.col); g.globalAlpha = 1; });
}
let PARTS = [];
function burst(x, y, z, icons, n){ if(!FX) return; for(let i = 0; i < (n || 6); i++){ const a = Math.random() * Math.PI * 2, v = 0.6 + Math.random() * 1.1; PARTS.push({x, y, z: z || 0.6, vx: Math.cos(a) * v, vy: -Math.abs(Math.sin(a)) * v * 1.4, ic: icons[i % icons.length], sz: 0.28 + Math.random() * 0.18, t: 0, dur: 0.7 + Math.random() * 0.3}); } if(PARTS.length > 120) PARTS.splice(0, PARTS.length - 120); }
function drawTxt(g, txt, x, y, fs, col){
  const parts = splitEmoji(txt); let w = 0; const ws = parts.map(p => p.e ? fs * 1.05 : g.measureText(p.t).width); w = ws.reduce((a, b) => a + b, 0);
  let cx = x - w / 2; parts.forEach((p, i) => { if(p.e) emo(g, p.t, cx + ws[i] / 2, y, fs); else { g.textAlign = 'left'; g.strokeText(p.t, cx, y); g.fillStyle = col; g.fillText(p.t, cx, y); } cx += ws[i]; }); g.textAlign = 'center';
}
const SPLIT_CACHE = new Map();
function splitEmoji(txt){ let r = SPLIT_CACHE.get(txt); if(r) return r; r = [];
  const seg = (window.Intl && Intl.Segmenter) ? Array.from(new Intl.Segmenter(undefined, {granularity: 'grapheme'}).segment(txt), x => x.segment) : Array.from(txt);
  seg.forEach(ch => { const e = /\p{Extended_Pictographic}/u.test(ch); const lastP = r[r.length - 1]; if(!e && lastP && !lastP.e) lastP.t += ch; else r.push({t: ch, e}); });
  if(SPLIT_CACHE.size > 300) SPLIT_CACHE.clear(); SPLIT_CACHE.set(txt, r); return r; }
function dots(g, x, y, n, col, s){ n = Math.min(8, n); for(let i = 0; i < n; i++){ g.fillStyle = col; g.beginPath(); g.arc(x + (i - (n - 1) / 2) * s * 0.16, y, s * 0.055, 0, Math.PI * 2); g.fill(); } }
function bar(g, x, y, w, f, col){ const h = Math.max(4, VIEW.s * 0.11); g.fillStyle = 'rgba(40,20,60,.35)'; rrect(g, x - w / 2 - 1.5, y - h / 2 - 1.5, w + 3, h + 3, h); g.fill(); g.fillStyle = 'rgba(255,255,255,.9)'; rrect(g, x - w / 2, y - h / 2, w, h, h / 2); g.fill();
  g.fillStyle = col; if(f > 0){ rrect(g, x - w / 2, y - h / 2, Math.max(h, w * Math.min(1, f)), h, h / 2); g.fill(); } }
function ring(g, x, y, r, f, col){ g.strokeStyle = col; g.lineWidth = r * 0.45; g.beginPath(); g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, f)); g.stroke(); }
// 🐭 a helper under a love potion (no avatar — a little emoji hopping along with a pink heart)
function drawEmojiSuitor(g, e, t, s){
  const S = e.S, x = PX(e.x);
  if(e.gone){ const k = e.goneT; if(k > 0.9) return; emo(g, S.emoji, x + k * s * 2, PY(e.y, 0.3 + k * 2), s * 0.55, Math.max(0, 1 - k)); if(k < 0.5) emo(g, '💖', x, PY(e.y, 1), s * 0.4); return; }
  shadow(g, e.x, e.y, 0.22); const hop = Math.abs(Math.sin(t * 13 + e.id)) * 0.18, y = PY(e.y, 0.32 + hop);
  emo(g, S.emoji, x, y, s * 0.6, 1, Math.cos(e.ang || 0) < 0); emo(g, '💘', x + s * 0.24, y - s * 0.32, s * 0.3);
  bar(g, x, y - s * 0.45, s * 0.6, e.hp / e.hpMax, '#FF5C9A');
}
function drawSuitor(g, e, t, s){
  if(e.S.emoji) return drawEmojiSuitor(g, e, t, s);
  const S = e.S, set = suitorSet(e), w = set.w, h = set.h;
  if(e.gone){ const k = e.goneT;
    if(e.kiss){ const a = Math.max(0, 1 - k / 0.9), fr = set.act('bow'); if(a > 0) drawPic(g, fr[Math.min(fr.length - 1, Math.floor(k * 8))], PX(e.x), PY(e.y, k * 0.6), w * (0.6 + a * 0.4), h * (0.6 + a * 0.4), false, 0, a, set); return; }
    const x = PX(e.x) + Math.cos(e.flyA) * k * s * 7, y = PY(e.y, 0.2) - k * s * 6 + k * k * s * 3.5;
    drawPic(g, set.act('dizzy')[0], x, y + set.head * 0.5, w, h, Math.cos(e.flyA) < 0, k * 12, Math.max(0, 1 - k * 0.6), set);
    if(k < 0.55) emo(g, '💫', PX(e.x), PY(e.y, 1.3), s * 0.6); return; }
  const still = e.stunT > 0 || e.rootT > 0 || e.sleepT > 0 || e.tea || e.atWall, hop = still ? 0 : Math.abs(Math.sin(t * 11 + e.id)) * 0.05;
  shadow(g, e.x, e.y, (S.size || 0.95) * 0.34);
  if(e.charmT > 0){ g.fillStyle = 'rgba(255,92,154,.28)'; g.beginPath(); g.ellipse(PX(e.x), PY(e.y), w * 0.45, w * 0.45 * V25.K, 0, 0, Math.PI * 2); g.fill(); }
  const back = e.charmT > 0 || e.fearT > 0, flip = Math.cos(e.ang || 0) < 0 ? !back : back;
  const fr = e.charmT > 0 ? set.act('love') : (e.stunT > 0 || e.sleepT > 0 || e.rootT > 0 || e.confT > 0) ? set.act('dizzy') : null;
  const pic = fr ? fr[Math.floor(t * 6 + e.id) % fr.length] : still ? set.still : set.walk[Math.floor((t * 1.9 + e.id * 0.37) * WALK_N) % WALK_N];
  const alpha = e.hitT > 0 && FX ? 0.55 + 0.45 * Math.cos(e.hitT * 70) : 1, fy = PY(e.y, hop);
  drawPic(g, pic, PX(e.x), fy, w, h, flip, 0, alpha, set);
  if(S.prop && e.type !== 'bd') emo(g, S.prop, PX(e.x) + (flip ? -1 : 1) * set.head * 0.34, fy - set.head * 0.42, set.head * 0.34, alpha, flip);
  if(S.front) emo(g, S.front, PX(e.x) + (flip ? -1 : 1) * w * 0.42, fy - s * 0.28, s * 0.62, alpha, flip);   // 🛒 the gift cart rolls in front
  if(e.shine > 0 || e.shield > 0){ g.strokeStyle = e.shine > 0 ? 'rgba(255,240,140,.95)' : 'rgba(150,200,255,.9)'; g.lineWidth = s * 0.07; g.beginPath(); g.ellipse(PX(e.x), fy - set.head * 0.5, set.head * 0.42, set.head * 0.58, 0, 0, Math.PI * 2); g.stroke(); }
  const top = fy - set.head - s * 0.12;
  bar(g, PX(e.x), top, Math.min(w * 0.8, s * 0.9), e.hp / e.hpMax, e.boss ? '#E5484D' : '#FF5C9A');
  const st = e.charmT > 0 ? '😍' : e.sleepT > 0 ? '💤' : e.stunT > 0 ? '💞' : e.rootT > 0 ? '🕸️' : e.fearT > 0 ? '😱' : e.confT > 0 ? '❓' : e.tea ? '☕' : e.slowT > 0 ? '🐌' : e.burnT > 0 ? '🔥' : '';
  if(st) emo(g, st, PX(e.x) + w * 0.36, top - s * 0.22, s * 0.4);
  if(e.boss) emo(g, '👑', PX(e.x), top - s * 0.3, s * 0.45);
}
// effects that lie on the ground (drawn with the ground transform, world units)
function drawGroundFx(g, f, t){
  const p = Math.min(1, f.t / f.dur);
  if(f.k === 'cone'){ g.save(); g.translate(f.x, f.y); g.rotate(f.ang); const gr = g.createLinearGradient(0, 0, f.len, 0); gr.addColorStop(0, 'rgba(255,240,140,.95)'); gr.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = gr; g.globalAlpha = 1 - p * 0.7;
    g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, f.len * (0.4 + p * 0.6), -f.w * 0.6, f.w * 0.6); g.closePath(); g.fill(); g.restore(); g.globalAlpha = 1; return; }
  if(f.k === 'whip' || f.k === 'beam'){ g.save(); g.translate(f.x, f.y); g.rotate(f.ang); g.globalAlpha = 1 - p; g.strokeStyle = f.k === 'whip' ? '#C98A2E' : '#FFE45C'; g.lineWidth = f.w * (f.k === 'whip' ? 0.5 : 0.9); g.lineCap = 'round';
    g.beginPath(); g.moveTo(0.8, 0); for(let i = 1; i <= 12; i++){ const q = i / 12; g.lineTo(f.len * q * Math.min(1, p * 3), Math.sin(q * 9 + t * 20) * (f.k === 'whip' ? 0.25 : 0)); } g.stroke(); g.restore(); g.globalAlpha = 1; return; }
  const col = {boom: '255,140,40', push: '255,200,60', daze: '255,92,154', sleep: '160,140,255', slow: '90,170,255', fear: '120,80,200', confuse: '200,120,255', pull: '120,80,220', haste: '255,220,60', shield: '34,168,103', dome: '120,200,255', heal: '34,168,103', mirror: '200,230,255'}[f.k];
  if(col){ const R = (f.r || 1.6) * (f.k === 'pull' ? 1 - p * 0.7 : 0.4 + p * 0.7); g.fillStyle = 'rgba(' + col + ',' + (0.18 * (1 - p)) + ')'; g.strokeStyle = 'rgba(' + col + ',' + (1 - p) + ')'; g.lineWidth = 0.12; g.beginPath(); g.arc(f.x, f.y, R, 0, Math.PI * 2); g.fill(); g.stroke(); }
}
/* ---------- 🎨 skills drawn with SkillKit LOOKS (sk-2) ----------
   Every effect a cast makes carries f.sk = {hero, key} → that skill's look (fire, honey hair, paper birds, bubble …).
   Effects without a skill (auto attacks, tower roses, suitors) get a look by kind (K_LOOK). Ground ones paint under the
   characters, air ones on top — all in screen pixels, squashed by V25.K so circles lie flat on the tilted map. */
const K_LOOK = {fireball: 'fire', bolt: 'star', rose: 'rose', bird: 'paper', swat: 'honey', zap: 'storm', cone: 'fire', boom: 'fire', coins: 'gold', crit: 'star', ting: 'holy', trap: 'rock', build: 'star', poof: 'ghost', shine: 'star',
  potion: 'candy', decree: 'gold', choc: 'honey', serenade: 'music', kiss: 'love', ring: 'gold', blink: 'cosmic',
  push: 'wind', pull: 'cosmic', daze: 'love', sleep: 'dream', fear: 'shadow', confuse: 'candy', slow: 'ice', haste: 'wind', heal: 'nature', shield: 'holy', dome: 'bubble', mirror: 'crystal', whip: 'honey', beam: 'sun'};
function skillLook(src, k){ try{ if(src && src.key){ const h = src.hero || src.h, P = TD.PACKS[h]; const e = P && P.get(src.key); if(e && e.look) return SkillKit.lookOf(e); } }catch(e){} return SkillKit.LOOKS[K_LOOK[k]] || SkillKit.LOOKS.star; }
const SKFX = {   // k → [layer, (f, s, p, t) → spec]
  cone: ['ground', (f, s) => ({shape: 'cone', x: PX(f.x), y: PY(f.y, 0.25), ang: f.ang, len: f.len * s, w: f.w * 0.6})],
  zap: ['air', f => ({shape: 'chain', x: PX(f.x), y: PY(f.y, 1.2), x2: PX(f.x2), y2: PY(f.y2, 0.6)})],
  swat: ['air', (f, s) => ({shape: 'whip', x: PX(f.x), y: PY(f.y, 2.7), x2: PX(f.x2), y2: PY(f.y2, 0.6), w: s * 0.16})],
  whip: ['air', (f, s) => ({shape: 'whip', x: PX(f.x), y: PY(f.y, 2.6), x2: PX(f.x + Math.cos(f.ang) * f.len), y2: PY(f.y + Math.sin(f.ang) * f.len, 0.4), w: s * f.w * 0.5})],
  beam: ['air', (f, s) => ({shape: 'beam', x: PX(f.x), y: PY(f.y, 1.5), x2: PX(f.x + Math.cos(f.ang) * f.len), y2: PY(f.y + Math.sin(f.ang) * f.len, 0.6), w: s * f.w * 0.5})],
  fireball: ['air', (f, s) => ({shape: 'shot', x: PX(f.x), y: PY(f.y, 1.5), x2: PX(f.x2), y2: PY(f.y2, 0.55), h: s * 0.6, size: s * 0.36})],
  bolt: ['air', (f, s) => ({shape: 'shot', x: PX(f.x), y: PY(f.y, 1.3), x2: PX(f.x2), y2: PY(f.y2, 0.55), h: s * 0.6, size: s * 0.32})],
  rose: ['air', (f, s) => ({shape: 'shot', x: PX(f.x), y: PY(f.y, 1.0), x2: PX(f.x2), y2: PY(f.y2, 0.55), h: s * 0.5, size: s * 0.26})],
  bird: ['air', (f, s) => ({shape: 'shot', x: PX(f.x), y: PY(f.y, 2.4), x2: PX(f.x2), y2: PY(f.y2, 0.55), h: s * 0.9, size: s * 0.24})],
  boom: ['air', (f, s) => ({shape: 'splash', x: PX(f.x), y: PY(f.y), r: (f.r || 1.2) * s})],
  coins: ['air', (f, s) => ({shape: 'gold', x: PX(f.x), y: PY(f.y, 2.2), r: s * 0.9})],
  crit: ['air', (f, s) => ({shape: 'hit', x: PX(f.x), y: PY(f.y, 0.9), r: s * 0.55})],
  ting: ['air', (f, s) => ({shape: 'hit', x: PX(f.x), y: PY(f.y, 0.9), r: s * 0.35})],
  trap: ['ground', (f, s) => ({shape: 'trap', x: PX(f.x), y: PY(f.y), r: s * 0.7})],
  build: ['ground', (f, s) => ({shape: 'summon', x: PX(f.x), y: PY(f.y), r: s * 0.75})],
  shine: ['ground', (f, s) => ({shape: 'summon', x: PX(f.x), y: PY(f.y), r: s * 1.2})],
  poof: ['air', (f, s) => ({shape: 'hit', x: PX(f.x), y: PY(f.y, 0.6), r: s * 0.6})],
  push: ['air', (f, s) => ({shape: 'push', x: PX(f.x), y: PY(f.y), r: (f.r || 1.6) * s})],
  pull: ['air', (f, s) => ({shape: 'pull', x: PX(f.x), y: PY(f.y), r: (f.r || 1.6) * s})],
  daze: ['ground', (f, s) => ({shape: 'zone', x: PX(f.x), y: PY(f.y), r: (f.r || 1.6) * s, also: {shape: 'daze', layer: 'air', h: s * 1.3, r: s * 0.7}})],
  sleep: ['ground', (f, s) => ({shape: 'zone', x: PX(f.x), y: PY(f.y), r: (f.r || 1.6) * s})],
  fear: ['ground', (f, s) => ({shape: 'zone', x: PX(f.x), y: PY(f.y), r: (f.r || 1.6) * s})],
  confuse: ['ground', (f, s) => ({shape: 'zone', x: PX(f.x), y: PY(f.y), r: (f.r || 1.6) * s})],
  slow: ['ground', (f, s) => ({shape: 'zone', x: PX(f.x), y: PY(f.y), r: (f.r || 1.6) * s})],
  haste: ['air', (f, s) => ({shape: 'haste', x: PX(f.x), y: PY(f.y, 0.4), r: s * 1.3})],
  heal: ['air', (f, s) => ({shape: 'heal', x: PX(f.x), y: PY(f.y, 0.2), r: s * 1.3, h: s * 3.4})],
  shield: ['air', (f, s) => f.sk || (Math.abs(f.x - TD.CX) < 0.01 && Math.abs(f.y - TD.CY) < 0.01) ? {shape: 'shield', x: PX(f.x), y: PY(f.y, 0.3), r: s * 1.5, h: s * 3.2, n: 7} : {shape: 'shield', x: PX(f.x), y: PY(f.y), r: s * 0.5, h: s * 1.1, n: 4}],
  mirror: ['air', (f, s) => ({shape: 'shield', x: PX(f.x), y: PY(f.y, 0.3), r: s * 1.4, h: s * 2.8, n: 5})],
  dome: ['air', (f, s) => ({shape: 'dome', x: PX(f.x), y: PY(f.y, 0.1), r: s * 2.1})],
  cast: ['ground', (f, s) => ({shape: 'cast', x: PX(f.x), y: PY(f.y), r: s * (f.big || 0.9)})],
  // 🤴 R2 suitor + boss tricks (td-2)
  potion: ['air', (f, s) => ({shape: 'splash', x: PX(f.x), y: PY(f.y), r: s * 0.9})],
  decree: ['air', (f, s) => ({shape: 'push', x: PX(f.x), y: PY(f.y), r: (f.r || 3) * s})],
  serenade: ['air', (f, s) => ({shape: 'push', x: PX(f.x), y: PY(f.y), r: (f.r || 4) * s})],
  choc: ['air', (f, s) => ({shape: 'hit', x: PX(f.x), y: PY(f.y, 0.8), r: s * 0.5})],
  blink: ['air', (f, s) => ({shape: 'hit', x: PX(f.x), y: PY(f.y, 0.8), r: s * 0.75})],
  kiss: ['air', (f, s) => ({shape: 'shot', x: PX(f.x), y: PY(f.y, 1.2), x2: PX(f.x2), y2: PY(f.y2, 1.2), h: s * 0.6, size: s * 0.3})],
  ring: ['air', (f, s) => ({shape: 'shot', x: PX(f.x), y: PY(f.y, 1.2), x2: PX(f.x2), y2: PY(f.y2, 1.2), h: s * 0.8, size: s * 0.26})],
};
const FX_STAMP = {choc: '🍫', potion: '💘', decree: '📜', serenade: '🎵', blink: '🌀'};   // a little picture that rises over the trick
// paints f if SkillKit owns it on this layer → true (the old painter is skipped)
function drawSkillFx(g, f, s, t, layer){
  const d = SKFX[f.k]; if(!d || !FX_OK) return false; if(d[0] !== layer) return true;   // owned by SkillKit, drawn in the other pass
  const p = Math.min(1, f.t / f.dur), spec = d[1](f, s), L = skillLook(f.sk, f.k), seed = f.seed || (f.seed = 1 + Math.random() * 99);
  SkillKit.fx.draw(g, Object.assign(spec, {p, t, look: L, sq: V25.K, seed}));
  if(spec.also) SkillKit.fx.draw(g, Object.assign({}, spec, spec.also, {p, t, look: L, seed}));
  if(layer === 'air' && FX_STAMP[f.k]) emo(g, FX_STAMP[f.k], spec.x, spec.y - s * (0.9 + p * 0.8), s * 0.6, Math.min(1, (1 - p) * 2));
  if(layer === 'air'){ const head = {rose: '🌹', bird: '🕊️', kiss: '💋', ring: '💍'}[f.k]; if(head){ const q = 1 - Math.pow(1 - Math.min(1, p * 1.05), 3); emo(g, head, spec.x + (spec.x2 - spec.x) * q, spec.y + (spec.y2 - spec.y) * q - Math.sin(q * Math.PI) * spec.h, s * 0.45); } }
  return true;
}
// the 'also' part of a ground effect that lives in the air (dizzy stars over a daze zone)
function drawSkillFxAlso(g, f, s, t){ const d = SKFX[f.k]; if(!d || !FX_OK || d[0] !== 'ground') return; const spec = d[1](f, s); if(!spec.also || spec.also.layer !== 'air') return;
  SkillKit.fx.draw(g, Object.assign({}, spec, spec.also, {p: Math.min(1, f.t / f.dur), t, look: skillLook(f.sk, f.k), sq: V25.K, seed: f.seed || 3})); }
// zones that stand up (storm clouds, fire tornados, meteors) + laid traps waiting on the path
function drawSkillZones(g, s, t){ if(!FX_OK) return;
  G.zones.forEach(Z => { const L = skillLook(Z.src, Z.k === 'meteor' ? (Z.big ? 'daze' : 'boom') : Z.k);
    if(Z.k === 'meteor'){ const fall = Z.delay > 0.2, p = Z.t < Z.delay ? 0.55 * Z.t / Z.delay : 0.55 + 0.45 * Math.min(1, (Z.t - Z.delay) / 0.45); if(p >= 1) return;
      SkillKit.fx.draw(g, {shape: fall ? 'meteor' : 'splash', x: PX(Z.x), y: PY(Z.y), r: (Z.big ? 4 : Z.r) * s, h: s * 6, size: s * (Z.big ? 1 : 0.7), p: fall ? p : (p - 0.55) / 0.45, t, look: L, sq: V25.K, seed: Z.x * 7 + Z.y}); return; }
    const p = Math.min(1, Z.t / Z.dur);
    if(Z.k === 'storm') SkillKit.fx.draw(g, {shape: 'storm', x: PX(Z.x), y: PY(Z.y), r: Z.r * s, h: s * 3.2, p, t, look: L, sq: V25.K, seed: Z.x + Z.y * 3});
    else if(Z.k === 'tornado') SkillKit.fx.draw(g, {shape: 'tornado', x: PX(Z.x), y: PY(Z.y), r: Z.r * s * 0.8, h: s * 2.6, p, t, look: L, sq: V25.K, seed: 13}); });
}
function drawTrapRunes(g, s, t){ if(!FX_OK) return; G.traps.forEach(T => { if(T.fx === 'lava') return; SkillKit.fx.draw(g, {shape: 'trap', idle: true, x: PX(T.x), y: PY(T.y), r: Math.min(T.r, 1.1) * s * 0.8, p: 0.5, t: t + T.x, look: skillLook(T.src, 'trap'), sq: V25.K}); }); }
const FX_OK = typeof SkillKit !== 'undefined' && !!SkillKit.fx;
// effects in the air (screen space, from P(x, y, z))
function drawFx(g, f, s, t){
  const p = Math.min(1, f.t / f.dur), q = Math.min(1, p * 1.6);
  switch(f.k){
    case 'fireball': case 'bolt': case 'rose': case 'bird': case 'bouquet': case 'arrow': case 'swat': {
      const z1 = f.k === 'fireball' || f.k === 'bouquet' ? 1.5 : f.k === 'swat' ? 2.7 : f.k === 'bird' ? 2.4 : f.k === 'rose' ? 1.0 : f.k === 'arrow' ? 0.7 : 1.3;
      const z2 = f.k === 'bouquet' ? 1.5 : f.k === 'arrow' ? 2.6 : 0.55;
      const x = PX(f.x + (f.x2 - f.x) * q), y = PY(f.y + (f.y2 - f.y) * q, z1 + (z2 - z1) * q + Math.sin(q * Math.PI) * 0.8);
      if(f.k === 'swat'){ g.strokeStyle = '#E0A43A'; g.lineWidth = s * 0.12 * (1 - p * 0.6); g.lineCap = 'round'; g.beginPath(); g.moveTo(PX(f.x), PY(f.y, z1)); g.quadraticCurveTo(PX((f.x + f.x2) / 2 + 0.6), PY((f.y + f.y2) / 2, 2.4), x, y); g.stroke(); if(p > 0.35) emo(g, '💥', PX(f.x2), PY(f.y2, 0.6), s * 0.5 * (1 - p)); break; }
      if(f.k === 'fireball' || f.k === 'bolt'){ const c2 = f.k === 'bolt' ? (SkillKit.COLORS[f.col] || {hex: '#FF8A3D'}).hex : '#FF8A3D';
        for(let k = 3; k >= 1; k--){ const qq = Math.max(0, q - k * 0.07), tx = PX(f.x + (f.x2 - f.x) * qq), ty = PY(f.y + (f.y2 - f.y) * qq, z1 + (z2 - z1) * qq + Math.sin(qq * Math.PI) * 0.8); g.globalAlpha = 0.25 / k; g.fillStyle = c2; g.beginPath(); g.arc(tx, ty, s * 0.2, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1;
        const gr = g.createRadialGradient(x, y, 0, x, y, s * 0.32); gr.addColorStop(0, '#FFF6B0'); gr.addColorStop(0.5, c2); gr.addColorStop(1, 'rgba(255,80,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, s * 0.32, 0, Math.PI * 2); g.fill(); }
      else emo(g, {rose: '🌹', bird: '🕊️', bouquet: '💐', arrow: '💘'}[f.k], x, y, s * 0.5);
      break; }
    case 'zap': { g.strokeStyle = '#8EC8FF'; g.lineWidth = s * 0.08; g.globalAlpha = 1 - p; g.beginPath(); g.moveTo(PX(f.x), PY(f.y, 1.2)); for(let i = 1; i < 6; i++){ const k = i / 6; g.lineTo(PX(f.x + (f.x2 - f.x) * k) + (Math.random() - 0.5) * s * 0.4, PY(f.y + (f.y2 - f.y) * k, 1.0) + (Math.random() - 0.5) * s * 0.4); } g.lineTo(PX(f.x2), PY(f.y2, 0.6)); g.stroke(); g.globalAlpha = 1; break; }
    case 'meteor': break;
    case 'push': case 'daze': case 'sleep': case 'fear': case 'confuse': case 'pull': case 'haste': case 'heal': case 'mirror': {
      const ic = {daze: '💞', sleep: '💤', fear: '😱', confuse: '❓', heal: '💚', mirror: '🪞', haste: '⚡', push: '🔔', pull: '🧲'}[f.k], R = (f.r || 1.6) * (f.k === 'pull' ? 1 - p * 0.7 : 0.4 + p * 0.7);
      for(let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2 + t * 2; emo(g, ic, PX(f.x + Math.cos(a) * R), PY(f.y + Math.sin(a) * R, 0.6 + p * 0.5), s * 0.42, 1 - p); } break; }
    case 'heart': emo(g, '💗', PX(f.x), PY(f.y, 1 + p), s * 0.6, 1 - p); break;
    case 'coins': for(let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2; emo(g, '🪙', PX(f.x + Math.cos(a) * p * 1.6), PY(f.y + Math.sin(a) * p * 1.6, 2.6 + p * 0.5 - p * p * 2), s * 0.45, 1 - p); } break;
    case 'crit': emo(g, '💥', PX(f.x), PY(f.y, 1), s * 0.7 * (1 + p), 1 - p); break;
    case 'ting': emo(g, '✨', PX(f.x), PY(f.y, 1), s * 0.5, 1 - p); break;
    case 'trap': emo(g, f.icon || '💥', PX(f.x), PY(f.y, 0.4 + p * 0.5), s * 0.8 * (1 + p * 0.5), 1 - p); break;
    case 'boom': emo(g, '💥', PX(f.x), PY(f.y, 0.5), s * (0.9 + p), 1 - p); break;
    case 'poof': case 'build': emo(g, f.k === 'build' ? '✨' : '💨', PX(f.x), PY(f.y, 0.5 + p * 0.6), s * (0.6 + p * 0.6), 1 - p); break;
    case 'flowerbomb': emo(g, '💐', PX(f.x), PY(f.y, 2 - p), s * 0.7, 1 - p * 0.5); break;
    case 'shine': emo(g, '✨', PX(f.x), PY(f.y, 1), s * (1 + p * 2), 1 - p); break;
    case 'charge': emo(g, '🛡️', PX(f.x), PY(f.y, 1.4), s * 0.6, 1 - p); break;
    case 'hop': emo(g, '🦘', PX(f.x), PY(f.y, 1.4), s * 0.5, 1 - p); break;
    case 'ladder': emo(g, '🪜', PX(f.x), PY(f.y, 1.4), s * 0.6, 1 - p); break;
    case 'ew': emo(g, '😝', PX(f.x), PY(f.y, 1.5), s * 0.6, 1 - p); break;
    case 'bounce': emo(g, '🫧', PX(f.x), PY(f.y, 0.6), s * 0.7, 1 - p); break;
  }
}

/* ---------- 🏁 the end of a chapter ---------- */
function finish(){
  if(!G) return; if(G.jail) return finishJail(); stopLoop(); hideHand(); const won = G.state === 'won', L = LEVELS[G.lvl], ch = G.C.n, lvl = G.lvl;
  const stars = won ? (G.hearts >= G.heartsMax * 0.75 ? 3 : G.hearts >= G.heartsMax * 0.4 ? 2 : 1) : 0;
  const stats = {games: 1, bonks: G.stats.bonks, waves: G.stats.waves, evolves: G.stats.evolves, ultimates: G.stats.ultimates, combos: G.stats.combos, perfect: G.stats.perfect, casts: G.stats.casts};
  if(won) stats.chapters = ch;
  const theme = '📖 Ch ' + ch + ' · ' + G.C.title;
  const extra = {score: G.score, stars, cleared: won, theme, stats, timeSec: Math.round(G.t)};
  const dT = G.trees.dragon, pT = G.trees.princess;
  const row = saveRow(); row.ch = Math.max(Number(row.ch) || 0, won ? ch : 0); row.last = {dragon: dT.save(), princess: pT.save()}; row.lastForms = dT.formName() + ' + ' + pT.formName();
  S.settings['SkillTree_td-' + S.book + '_' + S.player] = JSON.stringify(row);
  if(won) saveWin(lvl, extra); else saveWin(lvl, extra);
  saveTree(row);
  const head = won ? '<div class="rh">🏆</div><h2>Chapter ' + ch + ' done!</h2><div class="rs">' + UI.esc(G.C.title) + ' · ' + L.emoji + ' ' + L.name + '</div><div class="stars">' + '⭐'.repeat(stars) + '☆'.repeat(3 - stars) + '</div>' :
    '<div class="rh">💍</div><h2>Oh no — wedding bells!</h2><div class="rs">The suitors got into the tower on wave ' + (G.wave + 1) + '. The Princess is being carried off to a wedding…<br>🐉 But the Dragon has a plan: <b>break out of jail</b> and shout "I OBJECT!!"</div>';
  showResult(head + '<canvas id="res-cv" width="240" height="240"></canvas><div class="score">⭐ <span id="score-count">0</span></div>' +
    '<div class="builds"><span>🐉 ' + UI.esc(dT.formName()) + ' ' + SkillKit.barHtml(dT.bar(), {star: !!dT.ult}) + '</span><span>👸 ' + UI.esc(pT.formName()) + ' ' + SkillKit.barHtml(pT.bar(), {star: !!pT.ult}) + '</span>' +
    '<span style="color:var(--ink-soft)">💫 ' + G.stats.bonks + ' bonked · ❤️ ' + G.hearts + ' left · 🌊 ' + G.stats.waves + ' waves</span></div>' +
    '<div class="save-note" id="save-note"><span class="ui-spin a-pop">✅</span> Saving your score…</div>' +
    '<div class="res-btns"><button class="sp-btn sp-secondary" id="b-menu">🎚️ Levels</button><button class="sp-btn sp-secondary" id="b-again">🔁 Play again</button>' +
    (won ? '<button class="sp-btn sp-primary" id="b-diary">📔 Read the diary ▶</button>' : '<button class="sp-btn sp-primary" id="b-jail">🐉 Jailbreak! ▶</button>') + '</div>');
  countUp($('score-count'), G.score, 1100);
  try{ const c = $('res-cv'), g = c.getContext('2d'); let i = 0; const tick = () => { if(!$('res-cv')) return; g.clearRect(0, 0, 240, 240);
    const D = atScale(42, () => dragonSet(dT.form)), Pz = atScale(68, () => princessSet(pT.form)), Rd = atScale(60, () => readerSet());
    const pp = won ? Pz.act('cheer') : Pz.act('dizzy'), rr = won ? Rd.act('cheer') : Rd.act('dizzy');
    g.fillStyle = 'rgba(255,200,230,.35)'; g.beginPath(); g.ellipse(120, 200, 105, 24, 0, 0, Math.PI * 2); g.fill();
    paintChar(g, D, D.fly[i % D.fly.length], 62, 150 - Math.sin(i * 0.8) * 4, 110, false);
    paintChar(g, Pz, pp[i % pp.length], 150, 205, 120, true); paintChar(g, Rd, rr[i % rr.length], 205, 210, 95, true); i++;
    emo(g, won ? '💖' : '💍', 120, 30, 34); setTimeout(() => requestAnimationFrame(tick), 140); }; tick(); }catch(e){}
  $('b-again').onclick = () => startGame(ch, lvl);
  $('b-menu').onclick = () => { hideResult(); G = null; openBook(S.book); };
  if($('b-diary')) $('b-diary').onclick = () => { hideResult(); G = null; openDiary(ch, lvl, 'outro'); };
  if($('b-jail')) $('b-jail').onclick = () => { hideResult(); G = null; S.jail = {ch, lvl}; openDiary('jail', lvl, 'intro'); };
}
// 💍 the Jailbreak chapter ends: won → the "I OBJECT!!" page (then the lost chapter again with +3 ❤️) · lost → try the breakout again. No score row (it's the comeback, not a level).
function finishJail(){
  stopLoop(); hideHand(); const won = G.state === 'won', from = G.from || S.jail || {ch: S.chapter, lvl: S.level}, dT = G.trees.dragon, lvl = G.lvl;
  S.jail = {ch: from.ch, lvl: from.lvl};
  const head = won ? '<div class="rh">💥</div><h2>I OBJECT!!</h2><div class="rs">The Dragon broke out and crashed the wedding! 🎂<br>Chapter ' + from.ch + ' is waiting — with <b>+' + JAIL_BONUS + ' ❤️</b> this time.</div>' :
    '<div class="rh">⛓️</div><h2>Caught again!</h2><div class="rs">The guards rang the last bell before the Dragon got out. He is already wiggling the bars… try again!</div>';
  showResult(head + '<canvas id="res-cv" width="240" height="240"></canvas><div class="builds"><span>🐉 ' + UI.esc(dT.formName()) + ' ' + SkillKit.barHtml(dT.bar(), {star: !!dT.ult}) + '</span>' +
    '<span style="color:var(--ink-soft)">💫 ' + G.stats.bonks + ' guards bonked · 🔔 ' + G.stats.waves + ' / 5 bells</span></div>' +
    '<div class="res-btns"><button class="sp-btn sp-secondary" id="b-menu">🎚️ Levels</button>' + (won ? '<button class="sp-btn sp-primary" id="b-object">📔 "I OBJECT!!" ▶</button>' : '<button class="sp-btn sp-primary" id="b-again">🔁 Break out again</button>') + '</div>');
  try{ const c = $('res-cv'), g = c.getContext('2d'); let i = 0; const tick = () => { if(!$('res-cv')) return; g.clearRect(0, 0, 240, 240);
    const D = atScale(58, () => dragonSet(Math.max(1, dT.form))), Rd = atScale(60, () => readerSet()), rr = won ? Rd.act('cheer') : Rd.act('dizzy');
    g.fillStyle = won ? 'rgba(255,200,230,.35)' : 'rgba(120,110,140,.3)'; g.beginPath(); g.ellipse(120, 200, 105, 24, 0, 0, Math.PI * 2); g.fill();
    paintChar(g, D, D.fly[i % D.fly.length], 95, 150 - Math.sin(i * 0.8) * 4, 120, false); paintChar(g, Rd, rr[i % rr.length], 195, 210, 95, true);
    if(!won){ g.fillStyle = 'rgba(46,42,58,.85)'; for(let x = 40; x < 170; x += 26) g.fillRect(x, 60, 7, 130); }
    emo(g, won ? '💥' : '⛓️', 120, 30, 34); i++; setTimeout(() => requestAnimationFrame(tick), 140); }; tick(); }catch(e){}
  $('b-menu').onclick = () => { hideResult(); G = null; S.jail = null; openBook(S.book); };
  if($('b-again')) $('b-again').onclick = () => startGame(from.ch, from.lvl, {jail: true});
  if($('b-object')) $('b-object').onclick = () => { hideResult(); G = null; openDiary('jail', lvl, 'outro'); };
}
function countUp(el, to, ms){ if(!el) return; const t0 = performance.now(); (function tick(now){ const p = Math.max(0, Math.min(1, (now - t0) / ms)); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString(); if(p < 1) requestAnimationFrame(tick); })(t0); }
function showResult(html){ $('result-card').innerHTML = html; $('result').classList.remove('hidden'); }
function hideResult(){ $('result').classList.add('hidden'); }
const PENDING_KEY = 'sp_tdstories_pending';
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function boardId(){ return TD.BOOKS[S.book].board; }
function flushPending(){ const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))).saveLevelResult(w.board || 'td-draprincess', w.name, w.lvl, w.extra)); }
function saveWin(lvlIdx, extra, tries){
  tries = tries || 0; const name = S.player, board = boardId();
  const p = S.progress[name] || (S.progress[name] = {unlocked: 0, tokens: [], best: []});
  if(extra.cleared) p.unlocked = Math.max(p.unlocked, lvlIdx + 1);
  google.script.run.withSuccessHandler(res => {
      const best = (p.best || []).slice(); if(res.best) best[lvlIdx] = res.best;
      S.progress[name] = {unlocked: res.unlocked, tokens: res.tokens, best}; flushPending();
      const n2 = $('save-note'); if(n2) n2.innerHTML = saveText(res);
    }).withFailureHandler(err => {
      if(tries < 1){ setTimeout(() => saveWin(lvlIdx, extra, tries + 1), 1200); return; }
      writePending(readPending().concat([{board, name, lvl: lvlIdx, extra}]));
      const n2 = $('save-note'); if(n2) n2.innerHTML = '⚠️ Could not save yet — it will be sent again next time.';
    }).saveLevelResult(board, name, lvlIdx, extra);
}
function saveTree(row){ try{ google.script.run.withFailureHandler(() => {}).saveSkillTree(S.player, boardId(), JSON.stringify(row)); }catch(e){} }
function saveText(res){
  let h = res.newBadge ? '🏅 New badge: ' + UI.esc(res.newBadge) : res.newHighScore && !res.firstTime ? '🎉 New high score!' : res.best && res.best.score ? 'Your best: 🏆 ' + Number(res.best.score).toLocaleString() : '✅ Score saved';
  const fe = res.feats; if(fe){ (fe.newTitles || []).forEach(t => { h += '<br>🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name); }); (fe.newBadges || []).forEach(b => { h += '<br>' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName; }); }
  return h;
}

/* ---------- ⌨️ keys: 1–6 Dragon · Q W E R T Y Princess · C combo · Space = start the wave ---------- */
document.addEventListener('keydown', e => {
  if(!G || $('scr-play').classList.contains('hidden') || e.repeat) return;
  if(pickOpen){ const n = Number(e.key); if(n >= 1 && n <= 4){ const b = document.querySelectorAll('#scr-play .skk-sheet .skk-card')[n - 1]; if(b){ b.click(); e.preventDefault(); } } return; }
  if(e.code === 'Space' || e.key === 'Enter'){ if(G.state === 'break'){ goNow(); e.preventDefault(); } return; }
  const k = e.key.toUpperCase(); if(k === 'C'){ const b = $('combo-btn'); if(b) b.click(); return; }
  const el = document.querySelector('#panel .skk-btn[data-hk="' + k + '"]'); if(el && !el.classList.contains('empty')){ el.click(); e.preventDefault(); }
});
function pauseGame(){ if(G) G.paused = true; }

/* ================= BOOT ================= */
function boot(){
  UI.loading('tdstories');
  google.script.run.withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {};
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      flushPending();
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)) choosePlayer(CURRENT_PLAYER); else { renderPlayers(); showScreen('player'); }
    }).withFailureHandler(() => { UI.loaded(); UI.toast('Could not load players — check the connection', 'err'); renderPlayers(); showScreen('player'); })
    .getLevelGameData('td-draprincess', CURRENT_PLAYER);
}
window.TD = TD;
boot();
