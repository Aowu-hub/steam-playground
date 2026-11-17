
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
  isoFit(A.clientWidth, A.clientHeight); const AR = V25.AR, MAXW = 1240;   // 🏝️ iso-2: phones held upright see the island's middle bigger   // 2.5D: the stage is wider than tall (width = size, height = size × AR)
  if(row){ P.style.flexDirection = 'column'; P.style.width = heroW + 'px'; size = Math.min(H / AR, W - heroW - 8, MAXW); }
  else { const side = (W - 8) / 2 >= heroW; P.style.flexDirection = side ? 'row' : 'column'; P.style.width = (side ? Math.min(W, Math.max(2 * heroW + 8, Math.min(W, 980))) : Math.min(W, Math.max(heroW, 600))) + 'px';
    let ph = P.getBoundingClientRect().height || (side ? 120 : 240); size = Math.min(W, (H - ph - 8) / AR, MAXW);
    const spare = H - ph - 8 - size * AR, pw = parseFloat(P.style.width) / (side ? 2 : 1);
    if(spare > 30 && size >= W - 1){ const bs2 = Math.floor(Math.min(64, (pw - 18 - 5 * gap) / 6, bs + spare / (side ? 2 : 4)));   // 📱 tall phones: spare height → bigger skill buttons
      if(bs2 > bs){ sp.style.setProperty('--skk-bs', bs2 + 'px'); ph = P.getBoundingClientRect().height; size = Math.min(W, (H - ph - 8) / AR, MAXW); } } }
  size = Math.max(240, Math.floor(size)); const sh = Math.round(size * AR);
  st.style.width = size + 'px'; st.style.height = sh + 'px';
  const dpr = Math.min(2, window.devicePixelRatio || 1), cv = $('cv');
  if(VIEW.px !== size || VIEW.dpr !== dpr || !BG || VIEW.ch !== S.chapter){ VIEW = {s: size / V25.W, px: size, ph: sh, dpr, ch: S.chapter}; setIso(); cv.width = Math.round(size * dpr); cv.height = Math.round(sh * dpr); BG = null; }
  if(pickOpen) placeHandOnGlow();
}
window.addEventListener('resize', () => { layout(); });

/* ---------- 🦸 hero panel (5 colour slots + ⭐) ---------- */
let BTN = [];
/* hero face = the real avatar / dragon picture (emoji stays as a fallback under it) */
function paintFace(cv, h, form){
  if(!cv) return; try{
    const g = cv.getContext('2d'); g.clearRect(0, 0, 64, 64);
    g.fillStyle = h === 'dragon' ? 'rgba(255,214,120,.45)' : 'rgba(255,170,215,.45)'; g.beginPath(); g.arc(32, 34, 30, 0, Math.PI * 2); g.fill();
    paintHeroFace(g, h, 64, 64);   // 🐉👸 iso-2: the stage painters
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
const V25 = {K: 0.5, Z: 0.9, TOP: 3.6, BOT: 0.6, R: 12.2, W: 25};   // 🏝️ iso-2: diamond (IsoKit) projection, island ≈ 25 tiles wide — IX / IY / groundTf in the iso-2 block below
V25.AR = (V25.TOP + V25.R + V25.BOT) / V25.W;                       // stage height ÷ width
function isoFit(w, h){ const nw = w < 640 && h > w * 1.15 ? 19.5 : 25; if(nw !== V25.W){ V25.W = nw; V25.AR = (V25.TOP + V25.R + V25.BOT) / V25.W; BG = null; } }   // narrow upright screens: crop the misty sides, bigger board
const PX = (x) => x * VIEW.s;   // a LENGTH in world units → px (positions use IX / IY)
/* 🐉 TDDragon (act-2 draft) — TD-Stories' own dragon painter with a real EVOLUTION MORPH (Aowu 2026-11-17 09:11 "the dragon needs more evolution morph, set a standard too")
   5 visual stages on the 10 skill tiers, each stage changes the SILHOUETTE (size · proportions · wings · horns · tail), not only the colour.
   TDDragon.draw(g, stage 1–5, col 'A'–'E' | null, x, feet, k, t, {flap, breath}) · TDDragon.STAGES · TDDragon.MORPH (the shared standard numbers) */
const TDDragon = (() => {
  const INK = '#2B2D42';
  const COL = {   // body · belly · wing membrane · accent (spikes / horns tips) · glow  — by skill colour (SkillKit COLORS A–E)
    _: ['#9B7BFF', '#FFE9A8', '#C9B6FF', '#FF8AC8', '#E2D6FF'],
    A: ['#E5484D', '#FFD27A', '#FF9A6A', '#FFB21E', '#FFB070'],
    B: ['#3A6BFF', '#CFE6FF', '#8FB4FF', '#FFE066', '#A8CCFF'],
    C: ['#A0612C', '#F0D9B5', '#C99A6A', '#7FE3F0', '#E8C9A0'],
    D: ['#22A867', '#FFF0A8', '#7FDDAA', '#FFD84D', '#BFFFD0'],
    E: ['#B45AE8', '#FFD6F0', '#E3A6FF', '#FF5C9A', '#FFC8E8']};
  // 📏 the morph standard, in avatar units (the princess is ≈ 90 units tall): every stage changes ≥ 3 of these
  const STAGES = [null,
    {name: 'Egg-Pop Hatchling', tier: 1, sc: 0.62, head: 1.25, bodyX: 17, bodyY: 13, neck: 0,  tail: 12, wing: 0.25, horn: 0,   spikes: 0, belly: 0, leg: 6,  eye: 1.3, shell: 1, fly: 0},
    {name: 'Sparkling',         tier: 3, sc: 0.78, head: 1.12, bodyX: 19, bodyY: 13, neck: 4,  tail: 20, wing: 0.55, horn: 0.3, spikes: 2, belly: 1, leg: 7,  eye: 1.15, fly: 0},
    {name: 'Fire Wyrm',         tier: 5, sc: 0.96, head: 1.0,  bodyX: 23, bodyY: 14, neck: 10, tail: 30, wing: 0.9,  horn: 0.7, spikes: 4, belly: 1, leg: 8,  eye: 1.0,  fly: 0.4},
    {name: 'Storm Drake',       tier: 7, sc: 1.1, head: 0.95, bodyX: 26, bodyY: 15, neck: 15, tail: 40, wing: 1.2, horn: 1.0, spikes: 6, belly: 2, leg: 9,  eye: 0.95, armour: 1, fly: 0.7},
    {name: 'Heart Dragon',      tier: 10, sc: 1.22, head: 0.92, bodyX: 28, bodyY: 16, neck: 19, tail: 48, wing: 1.45,  horn: 1.3, spikes: 7, belly: 3, leg: 9,  eye: 0.9,  armour: 1, crown: 1, mane: 1, heart: 1, aura: 1, fly: 1}];
  const stageOf = tier => tier >= 10 ? 5 : tier >= 7 ? 4 : tier >= 5 ? 3 : tier >= 3 ? 2 : 1;
  function star(g, x, y, r, col){ g.fillStyle = col; g.beginPath(); for(let i = 0; i < 8; i++){ const a = i * Math.PI / 4, rr = i % 2 ? r * 0.35 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
  function heart(g, x, y, r, col){ g.fillStyle = col; g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.4, y - r * 0.2, x - r * 0.6, y - r * 1.2, x, y - r * 0.4); g.bezierCurveTo(x + r * 0.6, y - r * 1.2, x + r * 1.4, y - r * 0.2, x, y + r * 0.9); g.fill(); }
  function draw(g, stage, col, x, feet, k, t, o){
    o = o || {}; t = t || 0; const S = STAGES[stage] || STAGES[1], C = COL[stage >= 3 && col ? col : '_'], K = k * S.sc, flap = o.flap != null ? o.flap : Math.sin(t * 7);
    const hover = S.fly ? (6 + S.fly * 14 + Math.sin(t * 3) * 2 * S.fly) : 0;
    g.save(); g.translate(x, feet); if(o.dir === -1) g.scale(-1, 1); g.lineJoin = 'round'; g.lineCap = 'round';
    // shadow
    if(!o.noShadow) g.fillStyle = 'rgba(0,0,0,.14)'; else g.fillStyle = 'rgba(0,0,0,0)'; g.beginPath(); g.ellipse(0, 0, S.bodyX * K * 1.1 / (1 + hover / 60), 5 * K, 0, 0, 7); g.fill();
    g.translate(0, -hover * K);
    if(S.aura){ const R = 80 * K, au = g.createRadialGradient(0, -24 * K, R * 0.15, 0, -24 * K, R); au.addColorStop(0, C[4] + '00'); au.addColorStop(0.6, C[4] + '55'); au.addColorStop(1, C[4] + '00'); g.fillStyle = au; g.beginPath(); g.arc(0, -24 * K, R, 0, 7); g.fill();
      for(let i = 0; i < 10; i++){ const a = i * 0.63 + t * 1.5, r = (40 + (i % 3) * 14) * K; star(g, -Math.abs(Math.cos(a)) * r - 10 * K, -24 * K + Math.sin(a) * r * 0.55, (2 + (i % 3)) * K, i % 2 ? '#FFFFFF' : '#FFE680'); } }
    const by = -(S.leg + S.bodyY) * K, bx = 0, ol = Math.max(1.6, 2.2 * K);
    const line = () => { g.strokeStyle = INK; g.lineWidth = ol; g.stroke(); };
    // wing (far side) — bat wing with finger bones, span by stage, flapping
    const wing = (side) => { if(S.wing <= 0) return; const sp = 30 * S.wing * K, root = [bx - 2 * K, by - S.bodyY * 0.55 * K], rot = -0.15 + flap * 0.32 + (side ? 0 : -0.12), sq = 1 - Math.max(0, flap) * 0.25;
      const P = ([u, v]) => { const x = u * sp, y = v * sp * sq; return [root[0] + x * Math.cos(rot) - y * Math.sin(rot), root[1] + x * Math.sin(rot) + y * Math.cos(rot)]; };
      if(S.wing < 0.4){ const a = P([-0.2, -0.9]), b = P([-0.75, -0.35]), c = P([-0.25, 0.15]); g.fillStyle = side ? C[2] : shade(C[2], 0.85); g.beginPath(); g.moveTo(root[0], root[1]); g.quadraticCurveTo(a[0], a[1], b[0], b[1]); g.quadraticCurveTo(c[0], c[1] - 2 * K, root[0] + 2 * K, root[1] + 3 * K); g.closePath(); g.fill(); line(); return; }
      const W = P([-0.32, -0.95]), F = [P([-1.05, -0.62]), P([-1.12, -0.12]), P([-0.78, 0.28])], H = P([-0.2, 0.2]), inw = (a, b) => { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; return [m[0] + (root[0] - m[0]) * 0.28, m[1] + (root[1] - m[1]) * 0.28]; };
      g.fillStyle = side ? C[2] : shade(C[2], 0.85); g.beginPath(); g.moveTo(root[0], root[1]); g.quadraticCurveTo(P([-0.05, -0.75])[0], P([-0.05, -0.75])[1], W[0], W[1]); g.lineTo(F[0][0], F[0][1]);
      let q = inw(F[0], F[1]); g.quadraticCurveTo(q[0], q[1], F[1][0], F[1][1]); q = inw(F[1], F[2]); g.quadraticCurveTo(q[0], q[1], F[2][0], F[2][1]); q = inw(F[2], H); g.quadraticCurveTo(q[0], q[1], H[0], H[1]); g.closePath(); g.fill(); line();
      g.strokeStyle = shade(C[0], 0.72); g.lineWidth = ol * 1.15; F.forEach(f => { g.beginPath(); g.moveTo(W[0], W[1]); g.lineTo(f[0], f[1]); g.stroke(); });   // finger bones
      g.fillStyle = C[3]; g.beginPath(); g.arc(W[0], W[1], 2.4 * K, 0, 7); g.fill(); F.forEach(f => { g.beginPath(); g.arc(f[0], f[1], 1.3 * K, 0, 7); g.fill(); }); };
    wing(0);
    // tail — longer each stage, curls up, spade tip
    const tl = S.tail * K, tx0 = bx - S.bodyX * 0.85 * K, ty0 = by + 2 * K;
    g.beginPath(); g.moveTo(tx0, ty0 - 5 * K); g.bezierCurveTo(tx0 - tl * 0.5, ty0 - 2 * K, tx0 - tl * 0.8, ty0 + 6 * K, tx0 - tl, ty0 - tl * 0.25); g.lineTo(tx0 - tl + 1 * K, ty0 - tl * 0.25 + 3 * K);
    g.bezierCurveTo(tx0 - tl * 0.75, ty0 + 10 * K, tx0 - tl * 0.45, ty0 + 7 * K, tx0, ty0 + 6 * K); g.closePath(); g.fillStyle = C[0]; g.fill(); line();
    if(stage >= 2){ const sx = tx0 - tl, sy = ty0 - tl * 0.25; g.fillStyle = C[3]; g.beginPath(); g.moveTo(sx + 2 * K, sy); g.lineTo(sx - 6 * K, sy - 6 * K); g.lineTo(sx - 4 * K, sy + 3 * K); g.lineTo(sx + 2 * K, sy + 4 * K); g.closePath(); g.fill(); line(); }
    // back legs, body, belly
    const legs = (dx, far) => { g.fillStyle = far ? shade(C[0], 0.82) : C[0]; g.beginPath(); g.roundRect(bx + dx * K - 4 * K, by + S.bodyY * 0.4 * K, 8 * K, S.leg * K + S.bodyY * 0.6 * K, 4 * K); g.fill(); line(); g.fillStyle = '#FFFFFF'; [-2.5, 0, 2.5].forEach(c => { g.beginPath(); g.arc(bx + dx * K + c * K, -hover * 0 + (S.leg + S.bodyY) * K + by - 0.5 * K, 1 * K, 0, 7); g.fill(); }); };
    if(!S.fly || S.fly < 1){ legs(-S.bodyX * 0.5, 1); legs(S.bodyX * 0.45, 1); }
    // spikes along the back (behind the body outline)
    for(let i = 0; i < S.spikes; i++){ const f = (i + 0.5) / S.spikes, a = Math.PI * (1.15 + f * 0.7), px = bx + Math.cos(a) * S.bodyX * K, py = by + Math.sin(a) * S.bodyY * K, h = (4 + S.spikes * 0.4) * K;
      g.fillStyle = C[3]; g.beginPath(); g.moveTo(px - 3 * K, py + 1 * K); g.lineTo(px - 1 * K, py - h); g.lineTo(px + 3 * K, py + 1 * K); g.closePath(); g.fill(); line(); }
    g.fillStyle = C[0]; g.beginPath(); g.ellipse(bx, by, S.bodyX * K, S.bodyY * K, 0, 0, 7); g.fill(); line();
    if(S.belly){ g.save(); g.beginPath(); g.ellipse(bx, by, S.bodyX * K, S.bodyY * K, 0, 0, 7); g.clip(); g.fillStyle = S.belly >= 3 ? '#FFE680' : C[1]; g.beginPath(); g.ellipse(bx + 3 * K, by + S.bodyY * 0.55 * K, S.bodyX * 0.75 * K, S.bodyY * 0.55 * K, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = ol * 0.7; for(let i = -2; i <= 2; i++){ g.beginPath(); g.moveTo(bx + i * 6 * K, by + S.bodyY * 0.15 * K); g.lineTo(bx + i * 6 * K + 1 * K, by + S.bodyY * K); g.stroke(); } g.restore(); }
    if(S.armour){ g.fillStyle = shade(C[0], 0.75); [[-8, -6], [2, -9], [12, -7]].forEach(([dx, dy]) => { g.beginPath(); g.ellipse(bx + dx * K, by + dy * K, 6 * K, 3.4 * K, -0.2, 0, 7); g.fill(); }); }
    if(S.fly < 1){ legs(-S.bodyX * 0.38, 0); legs(S.bodyX * 0.55, 0); } else { [[-S.bodyX * 0.42, -0.9], [S.bodyX * 0.42, -0.5]].forEach(([dx, a]) => { const px = bx + dx * K, py = by + S.bodyY * 0.78 * K; g.fillStyle = shade(C[0], 0.9); g.beginPath(); g.ellipse(px, py, 4.2 * K, 7 * K, a, 0, 7); g.fill(); line();
      g.fillStyle = '#FFFFFF'; [-1.6, 1.6].forEach(c => { g.beginPath(); g.arc(px + Math.cos(a + 1.57) * 6 * K + c * K, py + Math.sin(a + 1.57) * 6 * K, 0.9 * K, 0, 7); g.fill(); }); }); }   // legs tucked back while flying   // tucked legs when flying
    // neck + head (head is relatively bigger when young: S.head)
    const nx = bx + S.bodyX * 0.7 * K, ny = by - S.bodyY * 0.35 * K, hx = nx + (6 + S.neck * 0.55) * K, hy = ny - (6 + S.neck) * K, hr = 13 * S.head * K;
    if(S.neck > 0){ g.strokeStyle = INK; g.lineWidth = 12 * K + ol * 2; g.beginPath(); g.moveTo(nx, ny); g.quadraticCurveTo(nx + S.neck * 0.1 * K, hy + 4 * K, hx - hr * 0.3, hy); g.stroke(); g.strokeStyle = C[0]; g.lineWidth = 12 * K; g.stroke();
      if(S.belly){ g.strokeStyle = S.belly >= 3 ? '#FFE680' : C[1]; g.lineWidth = 4 * K; g.beginPath(); g.moveTo(nx + 4 * K, ny + 2 * K); g.quadraticCurveTo(nx + S.neck * 0.1 * K + 5 * K, hy + 6 * K, hx - hr * 0.1, hy + hr * 0.5); g.stroke(); } }
    if(S.mane){ g.fillStyle = C[3]; for(let i = 0; i < 5; i++){ const a = Math.PI * (0.75 + i * 0.12); g.beginPath(); g.ellipse(hx + Math.cos(a) * hr * 1.05, hy + Math.sin(a) * hr * 1.05, 5 * K, 2.6 * K, a, 0, 7); g.fill(); } }
    // horns (behind head) — none → nubs → curved → crown horns
    if(S.horn > 0){ const hl = 14 * S.horn * K; [[-0.35, 0.82], [0.05, 1]].forEach(([dx, sc]) => { const x0 = hx + dx * hr, y0 = hy - hr * 0.75; g.fillStyle = S.horn >= 1 ? '#FFF0C8' : C[3];
        g.beginPath(); g.moveTo(x0 - 3 * K, y0 + 2 * K); g.quadraticCurveTo(x0 - hl * 0.6 * sc, y0 - hl * 0.4 * sc, x0 - hl * 0.55 * sc, y0 - hl * sc); g.quadraticCurveTo(x0 - hl * 0.1, y0 - hl * 0.4 * sc, x0 + 3 * K, y0 + 1 * K); g.closePath(); g.fill(); line(); }); }
    g.fillStyle = C[0]; g.beginPath(); g.ellipse(hx, hy, hr, hr * 0.9, 0, 0, 7); g.fill(); line();                                                   // head
    const snL = hr * (0.55 + (stage - 1) * 0.08), bOpen = o.breath ? 0.35 : 0;
    g.beginPath(); g.ellipse(hx + hr * 0.75, hy + hr * 0.2, snL, hr * 0.48, bOpen * 0.3, 0, 7); g.fill(); line();                                     // snout (longer each stage)
    if(o.breath){ g.fillStyle = '#5A1E2A'; g.beginPath(); g.moveTo(hx + hr * 0.6, hy + hr * 0.3); g.lineTo(hx + hr * 0.75 + snL, hy + hr * 0.15); g.lineTo(hx + hr * 0.7 + snL, hy + hr * 0.75); g.closePath(); g.fill(); }
    g.fillStyle = INK; g.beginPath(); g.arc(hx + hr * 0.75 + snL * 0.75, hy + hr * 0.05, 1.3 * K, 0, 7); g.fill();                                       // nostril
    const er = 4.2 * S.eye * K; g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(hx + hr * 0.22, hy - hr * 0.18, er, er * 1.15, 0, 0, 7); g.fill(); line();
    g.fillStyle = INK; g.beginPath(); g.arc(hx + hr * 0.3, hy - hr * 0.15, er * 0.6, 0, 7); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(hx + hr * 0.36, hy - hr * 0.28, er * 0.22, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,120,150,.4)'; g.beginPath(); g.ellipse(hx + hr * 0.1, hy + hr * 0.38, 3.4 * K, 2 * K, 0, 0, 7); g.fill();                    // blush
    if(S.shell){ g.fillStyle = '#FFF8E8'; g.beginPath(); g.moveTo(hx - hr * 0.9, hy - hr * 0.4); [[-0.6, -1.05], [-0.3, -0.75], [0, -1.12], [0.3, -0.78], [0.6, -1.0], [0.85, -0.5]].forEach(([a, b]) => g.lineTo(hx + a * hr, hy + b * hr)); g.quadraticCurveTo(hx, hy - hr * 0.55, hx - hr * 0.9, hy - hr * 0.4); g.fill(); line();
      g.fillStyle = '#C9A2FF'; g.beginPath(); g.arc(hx - hr * 0.2, hy - hr * 0.85, 1.6 * K, 0, 7); g.fill(); }                                             // eggshell hat
    if(S.mane){ g.strokeStyle = '#FFE680'; g.lineWidth = 1.6 * K; [[0.2, 1], [0.35, 1.25]].forEach(([dy, l]) => { g.beginPath(); g.moveTo(hx + hr * 0.7 + snL * 0.6, hy + hr * dy); g.quadraticCurveTo(hx + hr + snL * l, hy + hr * (dy + 0.4), hx + hr * 0.8 + snL * l, hy + hr * (dy + 1)); g.stroke(); }); }   // whiskers
    if(S.crown){ const cy = hy - hr * 0.95; g.fillStyle = '#FFD84D'; g.beginPath(); g.moveTo(hx - hr * 0.45, cy + 3 * K); [[-0.45, -4], [-0.22, 0], [0, -6], [0.22, 0], [0.45, -4]].forEach(([dx, dy]) => g.lineTo(hx + dx * hr, cy + dy * K)); g.lineTo(hx + hr * 0.45, cy + 3 * K); g.closePath(); g.fill(); line(); g.fillStyle = C[3]; g.beginPath(); g.arc(hx, cy - 1 * K, 1.8 * K, 0, 7); g.fill(); }
    if(S.heart){ const cx2 = bx + S.bodyX * 0.45 * K, cy2 = by - 1 * K, hg = g.createRadialGradient(cx2, cy2, 0, cx2, cy2, 12 * K); hg.addColorStop(0, 'rgba(255,255,255,.95)'); hg.addColorStop(1, 'rgba(255,120,190,0)'); g.fillStyle = hg; g.beginPath(); g.arc(cx2, cy2, 12 * K, 0, 7); g.fill(); heart(g, cx2, cy2, 5.5 * K, '#FF4D8D'); }
    wing(1);   // near wing over the body
    g.restore();
  }
  function shade(hex, f){ const n = parseInt(hex.slice(1), 16), c = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f))); return '#' + [16, 8, 0].map(s => c(s).toString(16).padStart(2, '0')).join(''); }
  // ✨ the morph moment (standard): 0–0.35 glow cocoon wraps the old shape · 0.35–0.55 white silhouette swells · 0.55 burst + new shape pops in · 0.55–1 confetti + settle
  function morph(g, from, to, col, x, feet, k, q, t){
    if(q < 0.55){ const a = Math.min(1, q / 0.35), W = Math.ceil(320 * k), H = Math.ceil(240 * k), oc = document.createElement('canvas'); oc.width = W * 2; oc.height = H * 2; const og = oc.getContext('2d'); og.scale(2, 2);
      draw(og, from, col, W / 2, H - 10 * k, k * (1 + q * 0.25), t); og.globalAlpha = a * 0.9; og.globalCompositeOperation = 'source-atop'; og.fillStyle = '#FFFFFF'; og.fillRect(0, 0, W, H); g.drawImage(oc, x - W / 2, feet - H + 10 * k, W, H);
      const R = (40 + q * 60) * k, gl = g.createRadialGradient(x, feet - 40 * k, 0, x, feet - 40 * k, R); gl.addColorStop(0, 'rgba(255,250,220,' + (0.3 + a * 0.5) + ')'); gl.addColorStop(1, 'rgba(255,250,220,0)'); g.fillStyle = gl; g.beginPath(); g.arc(x, feet - 40 * k, R, 0, 7); g.fill(); return; }
    const p = (q - 0.55) / 0.45, pop = 1 + Math.sin(Math.min(1, p * 1.6) * Math.PI) * 0.18; draw(g, to, col, x, feet, k * pop, t);
    for(let i = 0; i < 18; i++){ const a = i / 18 * 7, r = (20 + p * 90) * k; g.globalAlpha = 1 - p; star(g, x + Math.cos(a) * r, feet - 50 * k + Math.sin(a) * r * 0.7, (3 + (i % 3)) * k, ['#FFE680', '#FFFFFF', (COL[col] || COL._)[3]][i % 3]); } g.globalAlpha = 1; }
  return {draw, morph, STAGES, stageOf, COL};
})();
window.TDDragon = TDDragon;
/* 👸 TDPrincess (iso-2 / act-2 draft) — TD-Stories' Princess, 5 SHAPE stages on the 10 skill tiers (🐣 Evolution morph rule, Aowu 2026-11-17 09:15 "sure")
   She stays a real AvatarKit avatar (so Acting / ActionFX moves, faces and beats all work); her stage = WEAR drawn in the avatar's own frames:
     suit = dress outline (body frame) · back = cape / veil · head = tiara / crown / circlet · hand = wand / blade / vine / shield / staff
   through ONE tiny AvatarKit hook: `av.cw.<slot> = {td: key}` → `AK_WEAR[key](g, slot, it, {k, t, hy})` (core line, 🔒 when built).
   TDPrincess.av(stage, col) · TDPrincess.draw(g, stage, col, x, feet, k, t, opts) · TDPrincess.STAGES · stageOf(tier) */
const TDPrincess = (() => {
  const INK = '#2B2D42', GOLD = '#FFC93C', GOLD2 = '#E59A12';
  // main · light · dark · accent · glow — by skill colour (SkillKit COLORS A–E); _ = before tier 5
  const COL = {
    _: ['#FF8FB8', '#FFD3E4', '#D9628E', '#FFE066', '#FFD6E8'],
    A: ['#E5484D', '#FFB0A8', '#A82830', '#FF9A1E', '#FFB070'],
    B: ['#3A6BFF', '#BFD6FF', '#2443B8', '#FFE066', '#A8CCFF'],
    C: ['#A0612C', '#E8C9A0', '#6E3F18', '#5CC45A', '#E8C9A0'],
    D: ['#22A867', '#B8F0D0', '#137049', '#E8EEF8', '#BFFFD0'],
    E: ['#B45AE8', '#F0C8FF', '#7A2EB0', '#FF5C9A', '#FFC8E8']};
  const NAME5 = {A: 'Rose Knight', B: 'Star Keeper', C: 'Thorn Gardener', D: 'Guardian', E: 'Enchantress'};
  const ITEM5 = {A: 'rose-thorn blade + flame cape', B: 'star wand + star helpers', C: 'vine whip + seed pouch', D: 'glowing shield + breastplate', E: 'heart wand + veil'};
  const SHAPE5 = {A: 'short tunic · armour shoulders', B: 'star-point hem', C: 'leaf-petal skirt', D: 'straight gown · breastplate', E: 'ruffle tiers'};
  // 📏 morph standard (same numbers family as TDDragon): every stage changes ≥ 3 of size · skirt · shoulders · head piece · hand item · back
  const STAGES = [null,
    {name: 'Tiara Princess', icon: '👸', tier: 1, sc: 0.86, hem: 15, hemY: -3, head: 'tiara', hand: null, back: null},
    {name: 'Wand Apprentice', icon: '🪄', tier: 3, sc: 0.93, hem: 19, hemY: -3, head: 'tiara', hand: 'wand', back: 'capelet'},
    {name: 'Dragon-Heart Hero', icon: '💗', tier: 5, sc: 1.0, head: 'crown', hand: 'hero', back: 'hero'},
    {name: 'Champion', icon: '🏆', tier: 7, sc: 1.08, head: 'bigcrown', hand: 'hero2', back: 'cape'},
    {name: 'Sage of the Tower', icon: '🧙‍♀️', tier: 10, sc: 1.16, head: 'circlet', hand: 'staff', back: 'mantle', lift: 6}];
  const stageOf = tier => tier >= 10 ? 5 : tier >= 7 ? 4 : tier >= 5 ? 3 : tier >= 3 ? 2 : 1;
  const HAIR = {_: [1, 3], A: [8, 5], B: [10, 3], C: [9, 2], D: [7, 4], E: [1, 10]};   // [style, colour] AvatarKit HAIR_STYLES / HAIR_COLS
  const SAGE_HAIR = {_: 3, A: 17, B: 4, C: 2, D: 9, E: 11};
  const OC = {_: 13, A: 0, B: 5, C: 15, D: 3, E: 6};   // nearest OUTFIT_COLS (sleeves)

  // ---------- little shapes ----------
  const P = (g, pts, k) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x * k, y * k) : g.moveTo(x * k, y * k)); g.closePath(); };
  function fillStroke(g, fill, line, w){ g.fillStyle = fill; g.fill(); if(line){ g.strokeStyle = line; g.lineWidth = w; g.lineJoin = 'round'; g.stroke(); } }
  function star(g, x, y, r, col, n){ n = n || 5; g.fillStyle = col; g.beginPath(); for(let i = 0; i < n * 2; i++){ const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
  function heart(g, x, y, r, col){ g.fillStyle = col; g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.4, y - r * 0.2, x - r * 0.6, y - r * 1.2, x, y - r * 0.4); g.bezierCurveTo(x + r * 0.6, y - r * 1.2, x + r * 1.4, y - r * 0.2, x, y + r * 0.9); g.fill(); }
  function gem(g, x, y, r, col){ g.fillStyle = col; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * 0.7, y); g.lineTo(x, y + r); g.lineTo(x - r * 0.7, y); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.moveTo(x, y - r * 0.7); g.lineTo(x + r * 0.3, y - r * 0.1); g.lineTo(x, y); g.closePath(); g.fill(); }
  function glow(g, x, y, r, col, a){ const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.globalAlpha = a == null ? 0.8 : a; g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.globalAlpha = 1; }

  // skirt from the waist (±wW at wY) to the hem (±hW at hY) with a hem style
  function skirt(g, k, c, wW, wY, hW, hY, style, n){
    const L = c[2]; g.beginPath(); g.moveTo(-wW * k, wY * k);
    g.quadraticCurveTo((-wW - (hW - wW) * 0.35) * k, (wY + hY) / 2 * k, -hW * k, hY * k);
    n = n || 6; const step = hW * 2 / n;
    for(let i = 0; i < n; i++){ const x0 = -hW + i * step, x1 = x0 + step, xm = (x0 + x1) / 2;
      if(style === 'points') { g.lineTo(xm * k, (hY + 5) * k); g.lineTo(x1 * k, hY * k); }
      else if(style === 'petal') g.quadraticCurveTo(xm * k, (hY + 7) * k, x1 * k, (hY - 1) * k);
      else if(style === 'scallop') g.quadraticCurveTo(xm * k, (hY + 3.5) * k, x1 * k, hY * k);
      else if(style === 'flame') { g.quadraticCurveTo((x0 + step * 0.2) * k, (hY + 6) * k, xm * k, (hY - 2) * k); g.quadraticCurveTo((x1 - step * 0.1) * k, (hY + 4) * k, x1 * k, hY * k); }
      else g.quadraticCurveTo(xm * k, (hY + 1.6) * k, x1 * k, hY * k);
    }
    g.quadraticCurveTo((wW + (hW - wW) * 0.35) * k, (wY + hY) / 2 * k, wW * k, wY * k); g.closePath();
    fillStroke(g, c[0], L, 1.1 * k);
    // soft fold lines
    g.strokeStyle = 'rgba(0,0,0,.10)'; g.lineWidth = 1.1 * k; g.beginPath();
    [-0.45, 0.1, 0.55].forEach(f => { g.moveTo(f * wW * k, (wY + 3) * k); g.quadraticCurveTo(f * hW * 0.8 * k, (wY + hY) / 2 * k, f * hW * k, (hY - 2) * k); }); g.stroke();
  }
  function bodice(g, k, col, line, top){ top = top || -47; P(g, [[-10.5, top], [10.5, top], [9, -30], [-9, -30]], k); fillStroke(g, col, line, 1.1 * k); }
  function sash(g, k, col){ g.fillStyle = col; g.beginPath(); g.roundRect(-9.6 * k, -32 * k, 19.2 * k, 3.4 * k, 1.5 * k); g.fill(); }
  function pauldron(g, k, c, big){ const r = big ? 7.5 : 6; [-1, 1].forEach(s => { g.beginPath(); g.ellipse(s * 10.5 * k, -45 * k, r * k, (r * 0.62) * k, s * 0.25, Math.PI, 0); g.closePath(); fillStroke(g, '#D9E2EE', '#7D8BA0', 1 * k);
    g.fillStyle = c[0]; g.beginPath(); g.ellipse(s * 10.5 * k, -46.5 * k, (r * 0.55) * k, (r * 0.28) * k, s * 0.25, Math.PI, 0); g.fill(); g.fillStyle = GOLD; g.beginPath(); g.arc(s * 10.5 * k, -45.6 * k, 0.9 * k, 0, 7); g.fill(); }); }
  function breastplate(g, k, c, big){ P(g, [[-9.5, -46], [9.5, -46], [8, -32], [0, -27.5], [-8, -32]], k); fillStroke(g, '#E8EEF6', '#8C9AB0', 1 * k);
    g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(-6 * k, -44 * k, 2 * k, 9 * k);
    if(big){ g.strokeStyle = GOLD; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(-9 * k, -45 * k); g.lineTo(9 * k, -45 * k); g.stroke(); }
    heart(g, 0, -38 * k, 3.2 * k, c[0]); }
  function collar(g, k, col, line, high){ P(g, high ? [[-9, -48], [-4, -44], [0, -50], [4, -44], [9, -48], [11, -43], [0, -40], [-11, -43]] : [[-10, -47], [-4, -44], [0, -46], [4, -44], [10, -47], [8, -42], [0, -41], [-8, -42]], k); fillStroke(g, col, line, 0.9 * k); }
  function ruffles(g, k, c, wY, hW, hY, tiers){
    for(let i = 0; i < tiers; i++){ const y0 = wY + (hY - wY) * i / tiers, y1 = wY + (hY - wY) * (i + 1) / tiers, w1 = 9 + (hW - 9) * (i + 1) / tiers, w0 = 9 + (hW - 9) * i / tiers;
      skirt(g, k, [i % 2 ? c[1] : c[0], 0, c[2]], w0, y0, w1, y1, 'scallop', 5 + i * 2); }
  }
  function leafSkirt(g, k, c, hW, hY){ skirt(g, k, [c[1], 0, c[2]], 9, -30, hW - 2, hY + 2, 'round');
    const n = 7; for(let i = 0; i < n; i++){ const f = i / (n - 1) - 0.5, x = f * hW * 1.7, y = hY - 2 - Math.abs(f) * 3; g.save(); g.translate(x * k, -30 * k); g.rotate(f * 0.5);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(5 * k, (y + 30) * 0.5 * k, 0, (y + 32) * k); g.quadraticCurveTo(-5 * k, (y + 30) * 0.5 * k, 0, 0); fillStroke(g, i % 2 ? c[3] : '#3E9A45', '#27662C', 0.9 * k);
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 0.7 * k; g.beginPath(); g.moveTo(0, 2 * k); g.lineTo(0, (y + 28) * k); g.stroke(); g.restore(); } }
  function vineWrap(g, k){ g.strokeStyle = '#3E9A45'; g.lineWidth = 1.5 * k; g.beginPath(); g.moveTo(-10 * k, -46 * k); g.bezierCurveTo(6 * k, -44 * k, -8 * k, -36 * k, 9 * k, -31 * k); g.stroke();
    [[-4, -44.5], [2, -40], [5, -34]].forEach(([x, y]) => { g.fillStyle = '#5CC45A'; g.beginPath(); g.ellipse(x * k, y * k, 2.2 * k, 1.1 * k, 0.6, 0, 7); g.fill(); }); g.fillStyle = '#FF5C8A'; g.beginPath(); g.arc(-7 * k, -45 * k, 1.8 * k, 0, 7); g.fill(); }
  function pouch(g, k){ g.beginPath(); g.ellipse(7 * k, -26 * k, 3.6 * k, 4.2 * k, 0, 0, 7); fillStroke(g, '#C99A6A', '#6E3F18', 0.9 * k); g.fillStyle = '#6E3F18'; g.fillRect(4.5 * k, -30.5 * k, 5 * k, 1.4 * k); [[6, -25], [8, -26.5], [7.4, -24]].forEach(([x, y]) => { g.fillStyle = '#FFE38A'; g.beginPath(); g.arc(x * k, y * k, 0.6 * k, 0, 7); g.fill(); }); }
  function trim(g, k, y, w, col){ g.strokeStyle = col; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(-w * k, y * k); g.quadraticCurveTo(0, (y + 2) * k, w * k, y * k); g.stroke(); }

  // ---------- 👗 SUIT (dress outline, body frame: feet 0, hips −20, waist −30, shoulders −47) ----------
  function suit(g, it, k, t){
    const s = it.s, c = COL[it.c] || COL._, col = it.c;
    if(s === 1){ skirt(g, k, c, 9, -30, 15, -3, 'scallop', 5); bodice(g, k, c[0], c[2]); sash(g, k, c[1]); heart(g, 0, -31 * k, 1.8 * k, c[3]); collar(g, k, c[1], c[2]); return; }
    if(s === 2){ skirt(g, k, c, 9, -30, 19, -3, 'round', 6);
      P(g, [[-6, -29], [6, -29], [7.5, -10], [-7.5, -10]], k); fillStroke(g, '#FFF6EE', '#D9C8B8', 0.8 * k); star(g, 0, -18 * k, 2.4 * k, c[3]);
      bodice(g, k, c[0], c[2]); sash(g, k, '#8E6CF0');
      g.beginPath(); g.moveTo(-12 * k, -46 * k); g.quadraticCurveTo(0, -51 * k, 12 * k, -46 * k); g.quadraticCurveTo(14.5 * k, -41 * k, 13 * k, -37 * k);   /* 🪄 apprentice capelet (front, over the shoulders) */
      for(let i = 0; i < 5; i++){ const x0 = 13 - i * 5.2, x1 = x0 - 5.2; g.quadraticCurveTo((x0 + x1) / 2 * k, -34 * k, x1 * k, -37 * k); }
      g.quadraticCurveTo(-14.5 * k, -41 * k, -12 * k, -46 * k); g.closePath(); fillStroke(g, '#8E6CF0', '#5B3FC4', 1 * k);
      g.fillStyle = '#FFE066'; g.beginPath(); g.arc(0, -45 * k, 1.8 * k, 0, 7); g.fill(); return; }
    if(s === 3 || s === 4){ const big = s === 4;
      if(col === 'A'){ skirt(g, k, c, 9, -30, big ? 15 : 13, big ? -6 : -13, 'flame', 5); if(big){ g.fillStyle = '#D9E2EE'; P(g, [[-9, -30], [9, -30], [11, -18], [-11, -18]], k); fillStroke(g, '#D9E2EE', '#7D8BA0', 0.9 * k); }
        bodice(g, k, c[0], c[2]); if(big) breastplate(g, k, c, 1); g.fillStyle = '#5A3A22'; g.fillRect(-9.6 * k, -31.5 * k, 19.2 * k, 2.6 * k); g.fillStyle = GOLD; g.fillRect(-1.6 * k, -31.8 * k, 3.2 * k, 3.2 * k); pauldron(g, k, c, big); return; }
      if(col === 'B'){ skirt(g, k, c, 9, -30, big ? 20 : 17, big ? -2 : -6, 'points', big ? 7 : 6); if(big) skirt(g, k, [c[1], 0, c[2]], 9, -30, 15, -14, 'points', 5);
        bodice(g, k, c[0], c[2]); collar(g, k, c[3], GOLD2, big); [[-5, -20], [6, -14], [-1, -9], [9, -24]].forEach(([x, y]) => star(g, x * k, y * k, 1.4 * k, '#FFF3B0')); if(big){ breastplate(g, k, c); star(g, 0, -38 * k, 3 * k, c[3]); } return; }
      if(col === 'C'){ leafSkirt(g, k, c, big ? 18 : 15, big ? -4 : -10); bodice(g, k, c[0], c[2]); vineWrap(g, k); pouch(g, k); if(big){ pauldron(g, k, [c[3]]); } return; }
      if(col === 'D'){ P(g, [[-9, -30], [9, -30], [big ? 13 : 11.5, -2], [big ? -13 : -11.5, -2]], k); fillStroke(g, c[0], c[2], 1.1 * k);
        g.fillStyle = c[1]; P(g, [[-2.5, -30], [2.5, -30], [3.5, -2], [-3.5, -2]], k); g.fill(); trim(g, k, -5, big ? 12.5 : 11, GOLD);
        if(big){ [-1, 1].forEach(sd => { P(g, [[sd * 4, -28], [sd * 11, -26], [sd * 12, -16], [sd * 6, -18]], k); fillStroke(g, '#E8EEF6', '#8C9AB0', 0.9 * k); }); }
        bodice(g, k, c[0], c[2]); breastplate(g, k, c, big); if(big) pauldron(g, k, c, 1); return; }
      // E charms: ruffle tiers
      ruffles(g, k, c, -30, big ? 20 : 17, big ? -2 : -5, big ? 4 : 3); bodice(g, k, c[0], c[2]); collar(g, k, c[1], c[2]); heart(g, 0, -39 * k, 2.4 * k, c[3]);
      if(big){ [-1, 1].forEach(sd => { g.beginPath(); g.ellipse(sd * 10 * k, -45 * k, 5 * k, 3.4 * k, 0, 0, 7); fillStroke(g, c[1], c[2], 0.9 * k); }); breastplate(g, k, c); } return;
    }
    // s 5 · 🧙‍♀️ Sage: floor-length robe-gown, trailing hem, high collar, rune band, colour detail on the hem
    const hemSt = {A: 'flame', B: 'points', C: 'petal', D: 'round', E: 'scallop', _: 'round'}[col] || 'round';
    P(g, [[-9, -30], [9, -30], [21, 0.5], [-23, 0.5]], k); fillStroke(g, c[2], null);   // trailing under-robe
    skirt(g, k, c, 9, -30, 20, -0.5, hemSt, 7);
    P(g, [[-3, -30], [3, -30], [7, -0.5], [-7, -0.5]], k); fillStroke(g, '#FFF6E0', GOLD2, 0.8 * k);
    for(let i = 0; i < 4; i++){ const y = -24 + i * 6; g.fillStyle = c[0]; g.font = (3 * k) + 'px sans-serif'; g.textAlign = 'center'; gem(g, 0, y * k, 1.3 * k, c[0]); }
    trim(g, k, -4.5, 19, GOLD);
    bodice(g, k, c[0], c[2], -48); g.fillStyle = GOLD; g.fillRect(-9.6 * k, -32 * k, 19.2 * k, 2.6 * k); gem(g, 0, -30.7 * k, 2 * k, c[3] === '#E8EEF6' ? '#7FFFD4' : c[3]);
    collar(g, k, c[1], GOLD2, true);
    if(col === 'C') vineWrap(g, k); if(col === 'D') breastplate(g, k, c, 1); if(col === 'A') pauldron(g, k, c);
  }

  // ---------- 🧥 BACK (behind the body) ----------
  function back(g, it, k, t){
    const c = COL[it.c] || COL._, s = it.s, col = it.c, fl = Math.sin(t * 3) * 2;
    const cape = (len, w, fill, edge, style) => { g.beginPath(); g.moveTo(-9 * k, -47 * k); g.lineTo(9 * k, -47 * k); g.quadraticCurveTo((w + 4) * k, -25 * k, (w + fl) * k, len * k);
      const n = 5; for(let i = 0; i < n; i++){ const x0 = w + fl - i * (2 * w) / n, x1 = x0 - 2 * w / n; if(style === 'flame') { g.quadraticCurveTo((x0 - 1) * k, (len + 7) * k, (x0 + x1) / 2 * k, (len - 3) * k); g.quadraticCurveTo(x1 * k, (len + 5) * k, x1 * k, len * k); } else if(style === 'points') { g.lineTo((x0 + x1) / 2 * k, (len + 5) * k); g.lineTo(x1 * k, len * k); } else g.quadraticCurveTo((x0 + x1) / 2 * k, (len + 3) * k, x1 * k, len * k); }
      g.quadraticCurveTo((-w - 4) * k, -25 * k, -9 * k, -47 * k); g.closePath(); fillStroke(g, fill, edge, 1.2 * k); };
    if(s === 2){ cape(-24, 12, '#8E6CF0', '#5B3FC4'); return; }   // apprentice capelet (back half)
    if(s === 3){
      if(col === 'A'){ cape(-6, 16, '#FF7A2E', '#C8401A', 'flame'); g.globalAlpha = 0.85; cape(-12, 12, '#FFC145', null, 'flame'); g.globalAlpha = 1; }
      else if(col === 'B') cape(-16, 14, c[1], c[0], 'points');
      else if(col === 'C'){ g.strokeStyle = '#3E9A45'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(8 * k, -60 * k); g.bezierCurveTo(-18 * k, -48 * k, 14 * k, -30 * k, -10 * k, -10 * k); g.stroke(); }
      else if(col === 'D') cape(-14, 12, c[1], c[0]);
      else if(col === 'E'){ g.globalAlpha = 0.55; g.beginPath(); g.moveTo(-6 * k, -76 * k); g.quadraticCurveTo(-24 * k, -50 * k, (-16 + fl) * k, -8 * k); g.lineTo(10 * k, -14 * k); g.quadraticCurveTo(4 * k, -50 * k, 6 * k, -76 * k); g.closePath(); fillStroke(g, '#FFE3F3', '#FF8FC8', 1 * k); g.globalAlpha = 1; }
      return; }
    if(s === 4){ cape(-3, 18, c[0], c[2], col === 'A' ? 'flame' : col === 'B' ? 'points' : null); trim(g, k, -47, 10, GOLD);
      if(col === 'E'){ g.globalAlpha = 0.5; g.beginPath(); g.moveTo(-6 * k, -78 * k); g.quadraticCurveTo(-26 * k, -50 * k, (-20 + fl) * k, -4 * k); g.lineTo(12 * k, -8 * k); g.quadraticCurveTo(4 * k, -50 * k, 6 * k, -78 * k); g.closePath(); fillStroke(g, '#FFE3F3', '#FF8FC8', 1 * k); g.globalAlpha = 1; }
      g.fillStyle = GOLD; [-1, 1].forEach(sd => { g.beginPath(); g.arc(sd * 8 * k, -46 * k, 2 * k, 0, 7); g.fill(); }); return; }
    if(s === 5){ cape(1, 22, c[2], shade(c[2], 0.7), col === 'A' ? 'flame' : col === 'B' ? 'points' : null);   // flowing mantle
      g.strokeStyle = GOLD; g.lineWidth = 1.3 * k; g.setLineDash([2 * k, 2 * k]); g.beginPath(); g.moveTo(-18 * k, -6 * k); g.quadraticCurveTo(0, 2 * k, 20 * k, -6 * k); g.stroke(); g.setLineDash([]);
      if(col === 'E'){ g.globalAlpha = 0.45; g.beginPath(); g.moveTo(-6 * k, -80 * k); g.quadraticCurveTo(-30 * k, -50 * k, (-24 + fl) * k, 0); g.lineTo(14 * k, -4 * k); g.quadraticCurveTo(4 * k, -50 * k, 6 * k, -80 * k); g.closePath(); fillStroke(g, '#FFE3F3', '#FF8FC8', 1 * k); g.globalAlpha = 1; }
    }
  }
  function shade(hex, f){ const n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255, m = v => Math.max(0, Math.min(255, Math.round(v * f))); return '#' + ((1 << 24) + (m(r) << 16) + (m(gg) << 8) + m(b)).toString(16).slice(1); }

  // ---------- 👑 HEAD (hy = head centre, head top ≈ hy − 15) ----------
  function head(g, it, k, hy, t){
    const c = COL[it.c] || COL._, s = it.s, col = it.c, top = hy - 13 * k;
    const band = (w, h, pts, fill, line) => { g.beginPath(); g.moveTo(-w * k, top); pts.forEach(([x, y]) => g.lineTo(x * k, top + y * k)); g.lineTo(w * k, top); g.quadraticCurveTo(0, top + 2.5 * k, -w * k, top); g.closePath(); fillStroke(g, fill, line, 0.9 * k); };
    if(s <= 2){ band(7, 0, [[-7, -2], [-4.5, -5], [-2.2, -2.6], [0, -7], [2.2, -2.6], [4.5, -5], [7, -2]], '#F4F6FA', '#9AA6B2'); gem(g, 0, top - 4 * k, 1.6 * k, c[0]); return; }
    if(s === 5){ g.strokeStyle = GOLD; g.lineWidth = 1.6 * k; g.beginPath(); g.ellipse(0, top + 4 * k, 14 * k, 3.5 * k, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
      const fy = top - 9 * k + Math.sin(t * 2.5) * 1.5 * k; glow(g, 0, fy, 7 * k, c[4], 0.9); gem(g, 0, fy, 3 * k, c[0]); return; }
    const big = s === 4, H = big ? 1.35 : 1;
    if(col === 'C' && !big){ for(let i = 0; i < 7; i++){ const a = Math.PI * (1.05 + i * 0.15), x = Math.cos(a) * 13 * k, y = top + 5 * k + Math.sin(a) * 6 * k; g.fillStyle = i % 2 ? '#5CC45A' : '#3E9A45'; g.beginPath(); g.ellipse(x, y, 2.6 * k, 1.4 * k, a + 1.6, 0, 7); g.fill(); }
      g.fillStyle = '#FF5C8A'; [[-7, -1], [6, -1.5]].forEach(([x, y]) => { g.beginPath(); g.arc(x * k, top + y * k, 2 * k, 0, 7); g.fill(); }); g.fillStyle = '#FFE066'; g.beginPath(); g.arc(0, top - 3 * k, 2.2 * k, 0, 7); g.fill(); return; }
    const pts = [[-8, -4 * H], [-5, -2], [-2.5, -7 * H], [0, -3], [2.5, -7 * H], [5, -2], [8, -4 * H]];
    if(big) pts.splice(3, 1, [0, -10]);
    band(8, 0, pts, GOLD, GOLD2);
    const gc = col === 'A' ? '#FF4D6D' : col === 'B' ? '#FFFFFF' : col === 'D' ? '#7FFFD4' : col === 'E' ? '#FF5C9A' : c[3];
    if(col === 'B') star(g, 0, top - (big ? 9 : 6) * k, 2.4 * k, '#FFF3B0'); else if(col === 'E') heart(g, 0, top - (big ? 8 : 5) * k, 2.2 * k, gc); else gem(g, 0, top - (big ? 7.5 : 4.5) * k, 1.8 * k, gc);
    if(col === 'A'){ heart(g, -8 * k, top - 0.5 * k, 1.8 * k, '#FF4D6D'); g.fillStyle = '#3E9A45'; g.beginPath(); g.ellipse(-10.5 * k, top + 0.5 * k, 1.8 * k, 0.9 * k, 0.4, 0, 7); g.fill(); }
  }

  // ---------- ✋ HAND (origin = the hand, up = up) ----------
  function hand(g, it, k, t){
    const c = COL[it.c] || COL._, s = it.s, col = it.c, tw = Math.sin(t * 6);
    const wand = (len, tip, tipCol) => { g.strokeStyle = '#7A4A26'; g.lineWidth = 1.8 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 2 * k); g.lineTo(2 * k, -len * k); g.stroke(); g.strokeStyle = GOLD; g.lineWidth = 1.8 * k; g.beginPath(); g.moveTo(0.4 * k, -2 * k); g.lineTo(0.6 * k, -4 * k); g.stroke();
      const tx = 2 * k, ty = -(len + 3) * k; glow(g, tx, ty, 7 * k, tipCol || '#FFF3B0', 0.6 + tw * 0.15); if(tip === 'heart') heart(g, tx, ty, 3.4 * k, tipCol); else star(g, tx, ty, 4 * k, tipCol || GOLD); };
    if(s === 2){ wand(13, 'star', '#FFE066'); return; }
    const big = s === 4;
    if(s === 5){ const len = 50; g.strokeStyle = '#7A4A26'; g.lineWidth = 2.6 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 26 * k); g.lineTo(0, -len * 0.62 * k); g.stroke();
      g.strokeStyle = GOLD; g.lineWidth = 1.6 * k; g.beginPath(); g.arc(0, -len * 0.62 * k - 5 * k, 6 * k, Math.PI * 0.15, Math.PI * 0.85, true); g.stroke();
      const cy = -len * 0.62 * k - 6 * k; glow(g, 0, cy, 13 * k, c[4], 0.75 + tw * 0.1); gem(g, 0, cy, 5.5 * k, c[0]);
      if(col === 'C'){ g.strokeStyle = '#3E9A45'; g.lineWidth = 1.2 * k; g.beginPath(); for(let y = 20; y > -28; y -= 4) g.lineTo(Math.sin(y * 0.6) * 2.2 * k, y * k); g.stroke(); }
      return; }
    if(col === 'A'){ const L = big ? 30 : 24; g.save(); g.rotate(0.12);
      P(g, [[-1.6, -4], [1.6, -4], [1.2, -L], [0, -L - 4], [-1.2, -L]], k); fillStroke(g, '#E8EEF6', '#7D8BA0', 0.9 * k);
      g.strokeStyle = '#3E9A45'; g.lineWidth = 0.9 * k; g.beginPath(); for(let y = -5; y > -L + 2; y -= 3) g.lineTo((y % 6 ? 1.6 : -1.6) * k, y * k); g.stroke();
      g.fillStyle = '#27662C'; for(let y = -8; y > -L + 3; y -= 6){ P(g, [[1.4, y], [3.2, y - 1], [1.4, y - 2]], k); g.fill(); }
      heart(g, 0, -4 * k, 3.6 * k, '#FF4D6D'); g.fillStyle = '#7A4A26'; g.fillRect(-1 * k, -3 * k, 2 * k, 6 * k); if(big) glow(g, 0, -L * 0.6 * k, 14 * k, '#FFB070', 0.45); g.restore(); return; }
    if(col === 'B'){ wand(big ? 18 : 15, 'star', '#FFE066'); if(big){ star(g, 9 * k, -24 * k, 2 * k, '#FFF3B0'); star(g, -6 * k, -26 * k, 1.6 * k, '#FFF3B0'); } return; }
    if(col === 'C'){ g.strokeStyle = '#3E9A45'; g.lineWidth = 2 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(10 * k, -10 * k, 4 * k, -22 * k, 14 * k, -26 * k); if(big) g.bezierCurveTo(22 * k, -28 * k, 22 * k, -18 * k, 16 * k, -16 * k); g.stroke();
      [[5, -8], [7, -17], [12, -24]].forEach(([x, y], i) => { g.fillStyle = i % 2 ? '#5CC45A' : '#3E9A45'; g.beginPath(); g.ellipse(x * k, y * k, 2.6 * k, 1.3 * k, 0.8, 0, 7); g.fill(); }); g.fillStyle = '#FF5C8A'; g.beginPath(); g.arc(14 * k, -26 * k, 2.2 * k, 0, 7); g.fill(); return; }
    if(col === 'D'){ const S = big ? 1.25 : 1; g.save(); g.translate(4 * k, -4 * k); g.scale(S, S); glow(g, 0, -2 * k, 16 * k, '#BFFFD0', 0.7 + tw * 0.1);
      g.beginPath(); g.moveTo(-8 * k, -11 * k); g.lineTo(8 * k, -11 * k); g.quadraticCurveTo(9 * k, 4 * k, 0, 10 * k); g.quadraticCurveTo(-9 * k, 4 * k, -8 * k, -11 * k); fillStroke(g, '#E8EEF6', '#7D8BA0', 1.2 * k);
      g.beginPath(); g.moveTo(-5.5 * k, -8.5 * k); g.lineTo(5.5 * k, -8.5 * k); g.quadraticCurveTo(6.2 * k, 2.5 * k, 0, 7 * k); g.quadraticCurveTo(-6.2 * k, 2.5 * k, -5.5 * k, -8.5 * k); fillStroke(g, c[0], null);
      heart(g, 0, -1.5 * k, 2.8 * k, '#FFFFFF'); g.restore(); return; }
    wand(big ? 17 : 14, 'heart', '#FF5C9A'); if(big) heart(g, 8 * k, -22 * k, 1.6 * k, '#FFB6E6');
  }

  // the AvatarKit hook (core line when built): av.cw[slot] = {td: 'suit' | 'back' | 'head' | 'hand', s, c}
  function wear(g, slot, it, o){ try{
    if(slot === 'suit') suit(g, it, o.k, o.t); else if(slot === 'back') back(g, it, o.k, o.t); else if(slot === 'head') head(g, it, o.k, o.hy, o.t); else if(slot === 'hand') hand(g, it, o.k, o.t);
  }catch(e){} }

  function av(stage, col){
    const S = STAGES[stage] || STAGES[1], key = stage >= 3 ? (col || 'A') : '_', h = HAIR[key] || HAIR._;
    const a = {skin: 1, hair: stage === 5 ? 1 : h[0], hairColor: stage === 5 ? SAGE_HAIR[key] : h[1], outfit: 1, outfitColor: OC[key], acc: 0, eq: {}, cw: {}};
    const it = slot => ({td: slot, s: stage, c: key});
    a.cw.suit = it('suit'); a.cw.head = it('head'); if(S.hand) a.cw.hand = it('hand'); if(S.back) a.cw.back = it('back');
    return typeof fixAv === 'function' ? Object.assign(fixAv(a), {cw: a.cw}) : a;
  }
  // page-side extras that FLOAT (not worn): aura, star helpers, spell book, sparkles
  function draw(g, stage, col, x, feet, k, t, o){
    o = o || {}; const S = STAGES[stage] || STAGES[1], key = stage >= 3 ? (col || 'A') : '_', c = COL[key], kk = k * S.sc, lift = (S.lift || 0) * kk + Math.sin(t * 2.2) * (S.lift ? 2 : 0) * kk;
    if(stage >= 3) glow(g, x, feet - 42 * kk, (stage === 5 ? 60 : stage === 4 ? 48 : 38) * kk, c[4], stage === 5 ? 0.85 : 0.6);
    if(stage === 5){ g.fillStyle = 'rgba(255,255,255,.55)'; g.strokeStyle = c[0]; g.lineWidth = 1.4 * kk; g.beginPath(); g.ellipse(x, feet, 26 * kk, 7 * kk, 0, 0, 7); g.globalAlpha = 0.5; g.stroke(); g.globalAlpha = 1;
      for(let i = 0; i < 8; i++){ const a = t * 0.8 + i * Math.PI / 4; star(g, x + Math.cos(a) * 24 * kk, feet + Math.sin(a) * 6 * kk, 1.3 * kk, GOLD, 4); } }
    const who = {name: 'Princess', av: av(stage, col), dir: o.dir || 1};
    if(window.Acting && o.act) Acting.draw(g, who, x, feet - lift, kk, o.act, {t}); else drawAvatar(g, who, x, feet - lift, kk, {t, pose: Object.assign({armR: S.hand ? 0.55 : 0.15}, o.pose || {})});
    const d = o.dir || 1;
    if(key === 'B' && stage >= 3){ for(let i = 0; i < (stage >= 4 ? 3 : 2); i++){ const a = t * 1.6 + i * 2.1, hx = x + Math.cos(a) * 30 * kk, hy = feet - 84 * kk + Math.sin(a * 1.3) * 6 * kk; glow(g, hx, hy, 7 * kk, '#FFF3B0', 0.8); star(g, hx, hy, 4 * kk, '#FFE066'); g.fillStyle = INK; [-1, 1].forEach(s => { g.beginPath(); g.arc(hx + s * 1.2 * kk, hy - 0.3 * kk, 0.5 * kk, 0, 7); g.fill(); }); } }
    if(key === 'E' && stage >= 3){ for(let i = 0; i < 3; i++){ const a = t * 1.2 + i * 2.1; heart(g, x + Math.cos(a) * 22 * kk, feet - 50 * kk + Math.sin(a) * 14 * kk, 2 * kk, '#FF8FC8'); } }
    if(stage === 5){ const bx = x - d * 24 * kk, by = feet - 74 * kk - lift + Math.sin(t * 2) * 3 * kk; glow(g, bx, by, 14 * kk, c[4], 0.8);
      g.save(); g.translate(bx, by); g.rotate(-0.12 * d);
      [-1, 1].forEach(s => { g.beginPath(); g.moveTo(0, 2 * kk); g.quadraticCurveTo(s * 5 * kk, -1 * kk, s * 10 * kk, 0); g.lineTo(s * 10 * kk, -8 * kk); g.quadraticCurveTo(s * 5 * kk, -9 * kk, 0, -6 * kk); g.closePath(); fillStroke(g, '#FFF8E8', '#C8A46A', 0.8 * kk); });
      g.strokeStyle = c[0]; g.lineWidth = 0.7 * kk; [-7, -4].forEach(xx => [-1, 1].forEach(s => { g.beginPath(); g.moveTo(s * 2.5 * kk, (xx + 3) * kk); g.lineTo(s * 8 * kk, (xx + 3) * kk); g.stroke(); }));
      g.restore(); for(let i = 0; i < 3; i++){ star(g, bx + Math.sin(t * 3 + i * 2) * 12 * kk, by - 10 * kk - i * 4 * kk, 1.2 * kk, GOLD, 4); } }
  }
  function nameOf(stage, col){ return stage === 3 ? (col ? NAME5[col] + ' Princess' : 'Dragon-Heart Princess') : stage === 4 ? (col ? NAME5[col] + ' Champion' : 'Champion') : stage === 5 ? (col ? NAME5[col] + ' Sage' : 'Sage of the Tower') : STAGES[stage].name; }
  return {COL, NAME5, ITEM5, SHAPE5, STAGES, stageOf, av, draw, wear, nameOf};
})();
window.TDPrincess = TDPrincess; window.AK_WEAR = TDPrincess.wear;   // 👗 AvatarKit artWearAt → av.cw.<slot> = {td} (iso2-a hook)
/* ================= 🏝️ iso-2 (iso2-b): TD-Stories on the IsoKit island (🏰 TD-Stories chat, 2026-11-17, plan §iso-2) =================
   Diamond projection (same as IsoKit): IX(x, y) / IY(x, y, z) · ground things in world units through groundTf (an affine map) ·
   the island = an IsoKit map (void outside, fading edge cells) baked into the background once per chapter + time of day ·
   🌄 own sky (gradient · sun / moon · hazy hills · far castle · clouds · birds · valley mist) · 🌅 storybook day: morning → dusk (halfway) → night (last wave) ·
   🏮 lanterns along the roads light up at dusk, fireflies at night · 🎭 the tower has a round STAGE on top · 🐉 TDDragon + 👸 TDPrincess: 5 SHAPE stages
   on tiers 1 · 3 · 5 · 7 · 10, coloured by the main skill colour from tier 5, ✨ 1.2 s morph moment when a stage changes (🌱 Basic: 0.6 s, no flash). */
const ISO = {A: 10, B: 5, OX: 0, OY: 0, zi: 0.3, O: 5, N: 26, key: '', M: null, lanterns: [], fly: []};
function setIso(){ const s = VIEW.s; ISO.A = s / Math.SQRT2; ISO.B = ISO.A / 2; ISO.zi = ISO.A / 32; ISO.OX = VIEW.px / 2; ISO.OY = (V25.TOP + V25.R / 2) * s - (TD.CX + TD.CY) * ISO.B; }
const IX = (x, y) => ISO.OX + (x - y) * ISO.A, IY = (x, y, z) => ISO.OY + (x + y) * ISO.B - (z || 0) * V25.Z * VIEW.s;
function groundTf(g, sx, sy){ const d = VIEW.dpr; g.setTransform(d * ISO.A, d * ISO.B, -d * ISO.A, d * ISO.B, d * (ISO.OX + (sx || 0)), d * (ISO.OY + (sy || 0))); }   // draw in world units on the ground
function nearRoad(x, y){ let d = 9; G.paths.forEach(P => { for(let q = 0; q <= P.len; q += 0.25){ const p = TD.ptAt(P, q); const e = Math.hypot(p.x - x, p.y - y); if(e < d) d = e; } }); return d; }
// 🏝️ the island map for this chapter (cached): a wobbly round rim, roads run out into the fade, a few soft mounds away from the roads
function isoIsland(){
  const key = (G.jail ? 'j' : G.C.n) + ':' + G.C.scene; if(ISO.key === key && ISO.M) return ISO.M;
  const P = scenePal(), N = ISO.N, O = ISO.O, RR = TD.rngOf((G.jail ? 77 : G.C.n) * 13 + 1), ph1 = RR() * 6, ph2 = RR() * 6, ph3 = RR() * 6;
  const rim = th => 9.4 + 0.8 * Math.sin(3 * th + ph1) + 0.6 * Math.sin(5 * th + ph2) + 0.35 * Math.sin(8 * th + ph3);
  Iso.addTheme('td-' + key, {tile: {grass: {top: P.g1, top2: P.g2, side: '#9A6B43', lip: P.g3, deco: 'tuft'}, flower: {top: P.g1, top2: P.g2, side: '#9A6B43', lip: P.g3, deco: 'flower'},
    path: {top: P.g1, top2: P.g2, side: P.edge, lip: P.g3, deco: 'tuft'}}}, 'storybook');
  const road = new Map(); const near = (x, y) => { const k = Math.round(x * 2) + ',' + Math.round(y * 2); if(!road.has(k)) road.set(k, nearRoad(x, y)); return road.get(k); };
  ISO.M = Iso.map({w: N, h: N, theme: 'td-' + key, seed: (G.C.n | 0) * 7, base: 1.4, cell: (i, j) => { const x = i + 0.5 - O, y = j + 0.5 - O, dc = Math.hypot(x - TD.CX, y - TD.CY), th = Math.atan2(y - TD.CY, x - TD.CX), r = rim(th), rd = near(x, y) < 0.75;
    const out = dc - r; if(out > (rd ? 2.4 : 1.0)) return {t: 'void'}; const fade = out > 0.7 ? 0.2 : out > 0.1 ? 0.48 : out > -0.7 ? 0.8 : 1;
    if(rd) return {t: 'path', h: 0, fade}; const n = Math.sin(i * 1.7 + j * 0.9) + Math.sin(i * 0.5 - j * 1.3);
    return {t: (i * 7 + j * 3) % 5 === 0 ? 'flower' : 'grass', h: fade === 1 && dc > 3.2 && n > 1.45 && near(x, y) > 1.7 ? 1 : 0, fade}; }});
  ISO.key = key; return ISO.M;
}
const ISO_ZLV = () => 16 * ISO.zi / (V25.Z * VIEW.s);   // one IsoKit height level in game z units
function isoGroundZ(x, y){ const M = ISO.M; if(!M) return 0; const i = Math.floor(x + ISO.O), j = Math.floor(y + ISO.O); return M.inside(i, j) && !M.isVoid(i, j) ? M.hgt[j * M.w + i] * ISO_ZLV() : 0; }
// 🌅 time of day: 0 morning · 1 dusk · 2 night (moon chapters are always night)
const TOD = {v: 0, want: 0, bgs: [null, null, null], at: 0};
function todWant(){ if(!G) return 0; if(scenePal().night) return 2; const n = G.C.waves.length, w = G.wave; if(w >= n - 1 && w >= 0) return 2; return w + 1 >= Math.ceil(n / 2) ? 1 : 0; }
const TOD_SKY = [null, {sky1: '#FF8E6E', sky2: '#FFD2A6', hill1: '#B98BC9', hill2: '#8E6FB3', sun: '#FFE08A'}, {sky1: '#1E2154', sky2: '#4B4590', hill1: '#3E3C7A', hill2: '#2C2B5E', night: true, sun: '#FFF6C8'}];
function drawSky(g, P, W, H, R){
  let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, P.sky1); gr.addColorStop(0.55, P.sky2); gr.addColorStop(1, P.sky2); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const sx = W * 0.82, sy = H * 0.15, sr = Math.min(W, H) * 0.065;
  if(P.night){ for(let i = 0; i < 90; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.35 + R() * 0.6) + ')'; g.beginPath(); g.arc(R() * W, R() * H * 0.6, 0.6 + R() * 1.5, 0, 7); g.fill(); }
    g.fillStyle = '#FFF6C8'; g.beginPath(); g.arc(sx, sy, sr, 0, 7); g.fill(); g.fillStyle = P.sky1; g.beginPath(); g.arc(sx + sr * 0.42, sy - sr * 0.2, sr * 0.86, 0, 7); g.fill(); }
  else { const sg = g.createRadialGradient(sx, sy, 0, sx, sy, sr * 5); sg.addColorStop(0, 'rgba(255,250,215,.95)'); sg.addColorStop(0.18, 'rgba(255,245,200,.5)'); sg.addColorStop(1, 'rgba(255,245,200,0)'); g.fillStyle = sg; g.fillRect(0, 0, W, H);
    g.save(); g.translate(sx, sy); for(let i = 0; i < 12; i++){ g.rotate(Math.PI / 6); g.fillStyle = 'rgba(255,248,210,.09)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(sr * 7, -sr * 0.5); g.lineTo(sr * 7, sr * 0.5); g.closePath(); g.fill(); } g.restore();
    g.fillStyle = P.sun || '#FFF3B0'; g.beginPath(); g.arc(sx, sy, sr, 0, 7); g.fill(); }
  const mix = (c, a) => { const n = parseInt(c.slice(1), 16), s2 = parseInt(P.sky2.slice(1), 16), m = k => Math.round(((n >> k) & 255) * (1 - a) + ((s2 >> k) & 255) * a); return 'rgb(' + m(16) + ',' + m(8) + ',' + m(0) + ')'; };
  const hill = (y0, amp, col, f, ph) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, H); for(let x = 0; x <= W + 8; x += 8) g.lineTo(x, y0 - amp * (0.5 + 0.5 * Math.sin(x / W * Math.PI * f + ph)) - amp * 0.3 * Math.sin(x / W * Math.PI * f * 2.7 + ph * 2)); g.lineTo(W, H); g.closePath(); g.fill(); };
  hill(H * 0.36, H * 0.09, mix(P.hill2, 0.62), 2.2, 0.6); hill(H * 0.41, H * 0.075, mix(P.hill1, 0.45), 3.1, 2.1);
  g.fillStyle = mix(P.hill2, 0.35); const cx = W * 0.14, cy = H * 0.3; [[-0.022, 0.026], [0, 0.04], [0.022, 0.03]].forEach(([dx, h]) => { const x = cx + dx * W, hh = h * W; g.fillRect(x - W * 0.006, cy - hh, W * 0.012, hh + H * 0.06); g.beginPath(); g.moveTo(x - W * 0.009, cy - hh); g.lineTo(x, cy - hh - W * 0.016); g.lineTo(x + W * 0.009, cy - hh); g.fill(); }); g.fillRect(cx - W * 0.024, cy - W * 0.014, W * 0.048, H * 0.07);
  if(G.jail) emo(g, '⛓️', cx, cy - W * 0.05, W * 0.025, 0.6);
  hill(H * 0.47, H * 0.055, mix(P.hill1, 0.25), 4.3, 4.0);
  for(let i = 0; i < 26; i++){ const x = R() * W, y = H * (0.43 + R() * 0.05), r = W * (0.004 + R() * 0.005); g.fillStyle = mix(P.hill2, 0.3 + R() * 0.15); g.beginPath(); g.arc(x, y - r, r, 0, 7); g.fill(); g.fillRect(x - 1, y - r, 2, r + 3); }
  gr = g.createLinearGradient(0, H * 0.46, 0, H); gr.addColorStop(0, mix(P.hill1, 0.25)); gr.addColorStop(0.35, mix(P.hill1, 0.7)); gr.addColorStop(1, P.night ? P.sky1 : '#FFFFFF'); g.fillStyle = gr; g.fillRect(0, H * 0.48, W, H * 0.52);   // 🌫️ valley mist below the island
  if(!P.night) for(let i = 0; i < 7; i++){ const x = R() * W, y = H * (0.64 + R() * 0.32), k = W / 900 * (1 + R() * 1.4); g.fillStyle = 'rgba(255,255,255,.55)'; [[0, 0, 30], [30, 6, 22], [-30, 8, 20], [56, 12, 14], [-56, 12, 14]].forEach(([dx, dy, r]) => { g.beginPath(); g.ellipse(x + dx * k, y + dy * k, r * k * 1.4, r * k * 0.6, 0, 0, 7); g.fill(); }); }
  if(!P.night) for(let i = 0; i < 5; i++){ const x = R() * W, y = H * (0.05 + R() * 0.22), k = W / 1000 * (0.7 + R() * 0.8); g.fillStyle = 'rgba(255,255,255,' + (0.55 + R() * 0.3) + ')'; [[0, 0, 26], [24, 6, 20], [-24, 6, 18], [46, 12, 14], [-44, 12, 12], [8, 12, 20]].forEach(([dx, dy, r]) => { g.beginPath(); g.arc(x + dx * k, y + dy * k, r * k, 0, 7); g.fill(); }); }
  g.strokeStyle = P.night ? 'rgba(255,255,255,.5)' : 'rgba(70,60,90,.45)'; g.lineWidth = 1.4; for(let i = 0; i < 6; i++){ const x = W * (0.3 + R() * 0.45), y = H * (0.07 + R() * 0.16), k = W * (0.005 + R() * 0.004); g.beginPath(); g.moveTo(x - k, y - k * 0.4); g.quadraticCurveTo(x - k * 0.4, y - k * 0.6, x, y); g.quadraticCurveTo(x + k * 0.4, y - k * 0.6, x + k, y - k * 0.4); g.stroke(); }
}
// one background picture per time of day: sky + island + roads + moat + pads + decor (+ a dusk / night tint)
function bakeBG(tod){
  const cv = $('cv'), c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const g = c.getContext('2d'), s = VIEW.s, W = VIEW.px, H = VIEW.ph, d = VIEW.dpr;
  const base = scenePal(), P = Object.assign({}, base, tod && !base.night ? TOD_SKY[tod] : {}), R = TD.rngOf((G.jail ? 77 : G.C.n) * 97 + 3), M = isoIsland();
  g.setTransform(d, 0, 0, d, 0, 0); drawSky(g, P, W, H, R);
  // 🏝️ the island ground (IsoKit chunks, baked at this screen scale)
  const isl = document.createElement('canvas'); isl.width = c.width; isl.height = c.height; const ig = isl.getContext('2d'), zs = ISO.zi * d, oy = ISO.OY - 2 * ISO.O * ISO.B;
  for(let cj = 0; cj < Math.ceil(M.h / Iso.CH); cj++) for(let ci = 0; ci < Math.ceil(M.w / Iso.CH); ci++){ const C = Iso._bakeChunk(M, ci, cj, zs); if(C) ig.drawImage(C.c, Math.round((ISO.OX + C.ox * ISO.zi) * d), Math.round((oy + C.oy * ISO.zi) * d)); }
  // roads + moat + pads in world units on top of the ground, then cut by the island's own see-through edge
  const rc = document.createElement('canvas'); rc.width = c.width; rc.height = c.height; const rg = rc.getContext('2d'); groundTf(rg);
  rg.fillStyle = '#4FA6DE'; rg.beginPath(); rg.arc(TD.CX, TD.CY, 1.95, 0, Math.PI * 2); rg.fill(); rg.strokeStyle = 'rgba(255,255,255,.55)'; rg.lineWidth = 0.05; rg.beginPath(); rg.arc(TD.CX, TD.CY, 1.75, 0, Math.PI * 2); rg.stroke();
  rg.strokeStyle = base.g3; rg.lineWidth = 0.14; rg.beginPath(); rg.arc(TD.CX, TD.CY, 1.98, 0, Math.PI * 2); rg.stroke();
  G.paths.forEach(Pp => { const line = () => { rg.beginPath(); Pp.pts.forEach((p, i) => i ? rg.lineTo(p[0], p[1]) : rg.moveTo(p[0], p[1])); };
    rg.lineCap = 'round'; rg.lineJoin = 'round'; line(); rg.strokeStyle = 'rgba(70,50,20,.22)'; rg.lineWidth = 1.12; rg.stroke(); line(); rg.strokeStyle = base.edge; rg.lineWidth = 1.0; rg.stroke(); line(); rg.strokeStyle = base.path; rg.lineWidth = 0.82; rg.stroke();
    for(let q = 0.3; q < Pp.len - 0.2; q += 0.32){ const p = TD.ptAt(Pp, q), o = (R() - 0.5) * 0.5, nx = -Math.sin(p.ang), ny = Math.cos(p.ang); rg.fillStyle = R() < 0.5 ? base.stone : 'rgba(255,255,255,.35)'; rg.beginPath(); rg.ellipse(p.x + nx * o, p.y + ny * o, 0.09 + R() * 0.05, 0.07, p.ang, 0, Math.PI * 2); rg.fill(); }
    const L = Pp.pts[Pp.pts.length - 1], Pv = Pp.pts[Pp.pts.length - 2], a = Math.atan2(L[1] - Pv[1], L[0] - Pv[0]);
    rg.save(); rg.translate(L[0] - Math.cos(a) * 0.35, L[1] - Math.sin(a) * 0.35); rg.rotate(a); rg.fillStyle = '#B07A4F'; rg.fillRect(-0.55, -0.45, 1.1, 0.9); rg.strokeStyle = '#8A5A33'; rg.lineWidth = 0.04; for(let k = -0.45; k <= 0.55; k += 0.2){ rg.beginPath(); rg.moveTo(k, -0.45); rg.lineTo(k, 0.45); rg.stroke(); } rg.restore(); });
  G.spots.forEach(p => { rg.fillStyle = 'rgba(120,100,80,.18)'; rg.beginPath(); rg.arc(p.x, p.y + 0.05, 0.42, 0, Math.PI * 2); rg.fill(); rg.fillStyle = 'rgba(255,255,255,.35)'; rg.beginPath(); rg.arc(p.x, p.y, 0.36, 0, Math.PI * 2); rg.fill(); rg.strokeStyle = 'rgba(160,130,100,.35)'; rg.lineWidth = 0.04; rg.stroke(); });
  rg.setTransform(1, 0, 0, 1, 0, 0); rg.globalCompositeOperation = 'destination-in'; rg.drawImage(isl, 0, 0); rg.globalCompositeOperation = 'source-over';
  ig.drawImage(rc, 0, 0);
  // 🌳 standing decor (static): groves, flowers / mushrooms / rocks, 🏮 lantern posts along the roads — far first
  const solid = (x, y) => { const i = Math.floor(x + ISO.O), j = Math.floor(y + ISO.O); return M.inside(i, j) && !M.isVoid(i, j) && M.al[j * M.w + i] > 200; };
  const pal = DECOR[G.C.scene] || DECOR.meadow, deco = []; ISO.lanterns = [];
  for(let c2 = 0; c2 < 10; c2++){ const cx = -1 + R() * 18, cy = -1 + R() * 18; if(Math.hypot(cx - TD.CX, cy - TD.CY) < 3.2 || nearRoad(cx, cy) < 1.4) continue;
    for(let n = 0; n < 4; n++){ const x = cx + (R() - 0.5) * 2.2, y = cy + (R() - 0.5) * 2.2; if(!solid(x, y) || nearRoad(x, y) < 1 || G.spots.some(p => Math.hypot(p.x - x, p.y - y) < 0.8)) continue;
      const ic = R() < 0.6 ? (pal.includes('🌲') && R() < 0.5 ? '🌲' : '🌳') : pal[Math.floor(R() * pal.length)], big = ic === '🌳' || ic === '🌲'; deco.push({x, y, ic, sz: big ? 1.0 + R() * 0.35 : 0.5 + R() * 0.15}); } }
  for(let n = 0; n < 40; n++){ const x = -1 + R() * 18, y = -1 + R() * 18; if(!solid(x, y) || Math.hypot(x - TD.CX, y - TD.CY) < 2.7 || nearRoad(x, y) < 0.8 || G.spots.some(p => Math.hypot(p.x - x, p.y - y) < 0.7)) continue; deco.push({x, y, ic: ['🌼', '🌸', '🌷', '🍄', '🪨', '🌿', '🌾'][n % 7], sz: 0.36 + R() * 0.14}); }
  G.paths.forEach(Pp => { for(let q = 1.2; q < Pp.len - 2.4; q += 2.6){ const p = TD.ptAt(Pp, q), nx = -Math.sin(p.ang), ny = Math.cos(p.ang), sd = (q / 2.6 | 0) % 2 ? 1 : -1, x = p.x + nx * 0.72 * sd, y = p.y + ny * 0.72 * sd; if(solid(x, y)) ISO.lanterns.push({x, y}); } });
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(isl, 0, 0); g.setTransform(d, 0, 0, d, 0, 0);
  G.paths.forEach(Pp => { const st = Pp.pts[0]; if(solid(st[0], st[1])) emo(g, '🚩', IX(st[0], st[1]), IY(st[0], st[1], 0.4), s * 0.5, 0.9); });
  const stand = deco.map(o => Object.assign(o, {k: 'd'})).concat(ISO.lanterns.map(o => ({x: o.x, y: o.y, k: 'l'}))).sort((a, b) => (a.x + a.y) - (b.x + b.y));
  stand.forEach(o => { const z = isoGroundZ(o.x, o.y), px = IX(o.x, o.y), py = IY(o.x, o.y, z);
    if(o.k === 'l'){ g.strokeStyle = '#7A5230'; g.lineWidth = Math.max(1.2, s * 0.06); g.beginPath(); g.moveTo(px, py); g.lineTo(px, py - s * 0.62); g.stroke(); g.fillStyle = tod ? '#FFE38A' : '#FFF4D6'; g.strokeStyle = '#7A5230'; g.lineWidth = Math.max(1, s * 0.035); g.beginPath(); g.rect(px - s * 0.1, py - s * 0.84, s * 0.2, s * 0.22); g.fill(); g.stroke(); return; }
    shadow(g, o.x, o.y, o.sz * 0.42); emo(g, o.ic, px, py - s * o.sz * 0.45, s * o.sz); });
  if(base.tint){ g.fillStyle = base.tint; g.fillRect(0, 0, W, H); }
  if(tod){ g.globalCompositeOperation = 'source-atop'; g.fillStyle = tod === 2 ? 'rgba(30,30,110,.40)' : 'rgba(255,120,60,.15)'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
  const vg = g.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.4, W / 2, H * 0.55, Math.max(W, H) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(40,20,60,.2)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return c;
}
function drawBG(){ setIso(); TOD.bgs = [null, null, null]; TOD.v = TOD.want = todWant(); TOD.bgs[Math.round(TOD.v)] = bakeBG(Math.round(TOD.v)); BG = TOD.bgs[Math.round(TOD.v)]; TOWER_PIC = null; ISO.fly = []; }
// background for this frame: the current time of day, cross-fading to the next one (baked when first needed)
function paintBG(g, dt){
  const w = todWant(); TOD.want = w; if(TOD.v !== w){ const nx = TOD.v < w ? Math.floor(TOD.v) + 1 : Math.ceil(TOD.v) - 1; if(!TOD.bgs[nx]) TOD.bgs[nx] = bakeBG(nx); TOD.v = TOD.v < w ? Math.min(w, TOD.v + dt * 0.35) : Math.max(w, TOD.v - dt * 0.35); }
  const a = Math.floor(TOD.v), f = TOD.v - a; if(!TOD.bgs[a]) TOD.bgs[a] = bakeBG(a); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(TOD.bgs[a], 0, 0);
  if(f > 0.001){ if(!TOD.bgs[a + 1]) TOD.bgs[a + 1] = bakeBG(a + 1); g.globalAlpha = f; g.drawImage(TOD.bgs[a + 1], 0, 0); g.globalAlpha = 1; } BG = TOD.bgs[a];
}
// 🏮 dusk / night lights (cheap, every frame): lantern glow + light pools, fireflies at night, butterflies by day
function paintLights(g, t){
  const s = VIEW.s, n = Math.max(0, Math.min(1, TOD.v - 0.4)), night = Math.max(0, TOD.v - 1);
  if(n > 0.01){ g.save(); g.globalCompositeOperation = 'lighter';
    ISO.lanterns.forEach((L, i) => { const on = Math.max(0, Math.min(1, n * 2.2 - i * 0.06)); if(on <= 0) return; const z = isoGroundZ(L.x, L.y), px = IX(L.x, L.y), py = IY(L.x, L.y, z), r = s * 0.9;
      const gl = g.createRadialGradient(px, py - s * 0.73, 0, px, py - s * 0.73, r); gl.addColorStop(0, 'rgba(255,200,90,' + (0.75 * on) + ')'); gl.addColorStop(0.3, 'rgba(255,170,60,' + (0.3 * on) + ')'); gl.addColorStop(1, 'rgba(255,150,40,0)'); g.fillStyle = gl; g.beginPath(); g.arc(px, py - s * 0.73, r, 0, 7); g.fill();
      const pl = g.createRadialGradient(px, py, 0, px, py, r * 1.3); pl.addColorStop(0, 'rgba(255,190,90,' + (0.22 * on) + ')'); pl.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = pl; g.beginPath(); g.ellipse(px, py, r * 1.3, r * 0.65, 0, 0, 7); g.fill(); });
    const tx = IX(TD.CX, TD.CY), ty = IY(TD.CX, TD.CY, 3.2), sg = g.createRadialGradient(tx, ty, 0, tx, ty, s * 2.2); sg.addColorStop(0, 'rgba(255,220,240,' + (0.35 * n) + ')'); sg.addColorStop(1, 'rgba(255,220,240,0)'); g.fillStyle = sg; g.beginPath(); g.arc(tx, ty, s * 2.2, 0, 7); g.fill();
    if(night > 0.01 && FX) for(let i = 0; i < 26; i++){ const a = i * 2.39996, wx = TD.CX + Math.cos(a) * (2.5 + (i * 0.37) % 6) + Math.sin(t * 0.7 + i) * 0.4, wy = TD.CY + Math.sin(a) * (2.5 + (i * 0.37) % 6) + Math.cos(t * 0.6 + i * 1.3) * 0.4, z = 0.4 + 0.3 * Math.sin(t * 1.3 + i), px = IX(wx, wy), py = IY(wx, wy, z), r = s * 0.16, on = night * (0.5 + 0.5 * Math.sin(t * 3 + i * 1.7));
      const ff = g.createRadialGradient(px, py, 0, px, py, r); ff.addColorStop(0, 'rgba(220,255,140,' + on + ')'); ff.addColorStop(1, 'rgba(220,255,140,0)'); g.fillStyle = ff; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); }
    g.restore(); }
  if(TOD.v < 0.9 && FX) for(let i = 0; i < 4; i++){ const a = t * 0.25 + i * 1.6, wx = TD.CX + Math.cos(a) * (4 + i), wy = TD.CY + Math.sin(a * 1.3) * (4 + i * 0.6), z = 1.2 + 0.3 * Math.sin(t * 5 + i); emo(g, '🦋', IX(wx, wy), IY(wx, wy, z), s * 0.32, 1 - TOD.v); }
}
// 🎭 the tower with a round STAGE on top (form 0 wood · 1 rose · 2 crystal; the stage's light follows the princess's main colour)
function stageTowerPic(form, col){
  const s = VIEW.s, d = VIEW.dpr, w = Math.ceil(s * 3.6), h = Math.ceil(s * 5.6), c = document.createElement('canvas'); c.width = Math.ceil(w * d); c.height = Math.ceil(h * d);
  const g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); const u = s / 42;   // the draft was drawn at s = 42
  const L = towerLook(form), cx = w / 2, R = w * 0.27, ry = R * 0.5, base = h - ry - 4 * u, top = h * 0.38, SR = w * 0.45, sry = SR * 0.5;
  const lin = (x0, y0, x1, y1, a) => { const gr = g.createLinearGradient(x0, y0, x1, y1); a.forEach((cc, i) => gr.addColorStop(i / (a.length - 1), cc)); return gr; };
  g.fillStyle = lin(cx - R, 0, cx + R, 0, [L.wall2, L.wall1, L.wall1, L.wall2]); g.beginPath(); g.moveTo(cx - R, top); g.lineTo(cx - R, base); g.ellipse(cx, base, R, ry, 0, Math.PI, 0, true); g.lineTo(cx + R, top); g.closePath(); g.fill();
  g.strokeStyle = L.brick; g.lineWidth = Math.max(1, u); for(let y = top + 9 * u; y < base; y += 9 * u){ g.beginPath(); g.ellipse(cx, y, R, ry, 0, 0, Math.PI); g.stroke(); for(let k = 0; k < 4; k++){ const a = (k + (Math.round(y / (9 * u)) % 2) * 0.5) / 4 * Math.PI, x = cx + Math.cos(a) * R; g.beginPath(); g.moveTo(x, y + Math.sin(a) * ry); g.lineTo(x, y + 9 * u + Math.sin(a) * ry); g.stroke(); } }
  g.fillStyle = '#7A4A2A'; g.beginPath(); g.moveTo(cx - 9 * u, base + ry - 2 * u); g.lineTo(cx - 9 * u, base + ry - 22 * u); g.arc(cx, base + ry - 22 * u, 9 * u, Math.PI, 0); g.lineTo(cx + 9 * u, base + ry - 2 * u); g.closePath(); g.fill();
  [[-0.45, 0.62], [0.45, 0.5]].forEach(([fx, fy]) => { g.fillStyle = '#6A4AA0'; g.beginPath(); g.ellipse(cx + fx * R, top + (base - top) * fy, 4 * u, 7 * u, 0, 0, 7); g.fill(); g.fillStyle = '#FFE38A'; g.beginPath(); g.ellipse(cx + fx * R, top + (base - top) * fy + u, 2.4 * u, 5 * u, 0, 0, 7); g.fill(); });
  if(form >= 1){ g.strokeStyle = '#4E9A3A'; g.lineWidth = 2 * u; g.beginPath(); g.moveTo(cx - R + 4 * u, base); g.bezierCurveTo(cx - R - 6 * u, base - 40 * u, cx - R + 10 * u, top + 60 * u, cx - R + 2 * u, top + 10 * u); g.stroke(); for(let i = 0; i < 5; i++){ g.fillStyle = '#FF4D7A'; g.beginPath(); g.arc(cx - R + 2 * u + (i % 2) * 5 * u, base - 20 * u - i * 24 * u, 3.2 * u, 0, 7); g.fill(); } }
  g.fillStyle = L.wall2; for(let k = -3; k <= 3; k++){ const x = cx + k * R * 0.32; g.beginPath(); g.moveTo(x - 5 * u, top); g.lineTo(x + 5 * u, top); g.lineTo(x + 2 * u, top + 14 * u); g.lineTo(x - 2 * u, top + 14 * u); g.closePath(); g.fill(); }
  const floorCols = [['#E9C48E', '#B98A55'], ['#FFE0EC', '#E59ABA'], ['#EDE6FF', '#A796E0']][Math.min(2, form)];
  g.fillStyle = L.wall2; g.beginPath(); g.ellipse(cx, top + 6 * u, SR, sry, 0, 0, Math.PI); g.lineTo(cx - SR, top); g.ellipse(cx, top, SR, sry, 0, Math.PI, 0, true); g.closePath(); g.fill();
  g.fillStyle = lin(cx, top - sry, cx, top + sry, floorCols); g.beginPath(); g.ellipse(cx, top, SR, sry, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = u; for(let k = 1; k < 4; k++){ g.beginPath(); g.ellipse(cx, top, SR * k / 4, sry * k / 4, 0, 0, 7); g.stroke(); }
  const spot = col && TDPrincess.COL[col] ? TDPrincess.COL[col][4] : ['#FFF0B4', '#FFBEDC', '#C8B4FF'][Math.min(2, form)], sp = g.createRadialGradient(cx, top, 0, cx, top, SR * 0.8); sp.addColorStop(0, spot); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.globalAlpha = 0.7; g.fillStyle = sp; g.beginPath(); g.ellipse(cx, top, SR * 0.8, sry * 0.8, 0, 0, 7); g.fill(); g.globalAlpha = 1;
  const rail = (a0, a1) => { g.strokeStyle = L.trim; g.lineWidth = 2.2 * u; g.beginPath(); for(let a = a0; a <= a1 + 1e-6; a += (a1 - a0) / 24){ const x = cx + Math.cos(a) * SR * 0.97, y = top + Math.sin(a) * sry * 0.97 - 12 * u; a === a0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
    for(let k = 0; k <= 8; k++){ const a = a0 + (a1 - a0) * k / 8, x = cx + Math.cos(a) * SR * 0.97, y = top + Math.sin(a) * sry * 0.97; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 12 * u); g.stroke();
      if(k < 8){ const a2 = a0 + (a1 - a0) * (k + 0.5) / 8, x2 = cx + Math.cos(a2) * SR * 0.97, y2 = top + Math.sin(a2) * sry * 0.97 - 6 * u, a3 = a0 + (a1 - a0) * (k + 1) / 8; g.fillStyle = ['#FF5C9A', '#FFD36B', '#6FD3FF', '#9B7BFF'][k % 4]; g.beginPath(); g.moveTo(x, y - 12 * u); g.lineTo(x2, y2); g.lineTo(cx + Math.cos(a3) * SR * 0.97, top + Math.sin(a3) * sry * 0.97 - 12 * u); g.closePath(); g.fill(); } } };
  rail(Math.PI * 1.05, Math.PI * 1.95);
  if(form >= 2){ g.strokeStyle = 'rgba(190,160,255,.9)'; g.lineWidth = 1.6 * u; g.beginPath(); g.ellipse(cx, top - 40 * u, SR * 0.7, sry * 0.35, 0, 0, 7); g.stroke(); for(let k = 0; k < 8; k++){ const a = k / 8 * 7; g.fillStyle = '#FFE680'; g.beginPath(); g.arc(cx + Math.cos(a) * SR * 0.7, top - 40 * u + Math.sin(a) * sry * 0.35, 1.8 * u, 0, 7); g.fill(); }
    [-1, 1].forEach(sd => { const x = cx + sd * SR * 0.82, gr = g.createLinearGradient(0, top - 70 * u, 0, top); gr.addColorStop(0, 'rgba(200,180,255,0)'); gr.addColorStop(1, 'rgba(200,180,255,.6)'); g.fillStyle = gr; g.fillRect(x - 3 * u, top - 70 * u, 6 * u, 66 * u); }); }
  const archC = ['#B07A4F', '#FF6FA8', '#9B7BFF'][Math.min(2, form)];
  g.strokeStyle = archC; g.lineWidth = 4 * u; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - SR * 0.62, top - 4 * u); g.lineTo(cx - SR * 0.62, top - 52 * u); g.moveTo(cx + SR * 0.62, top - 4 * u); g.lineTo(cx + SR * 0.62, top - 52 * u); g.stroke();
  if(form >= 1){ g.beginPath(); g.moveTo(cx - SR * 0.62, top - 52 * u); g.quadraticCurveTo(cx, top - 92 * u, cx + SR * 0.62, top - 52 * u); g.stroke(); emo(g, form >= 2 ? '⭐' : '💗', cx, top - 76 * u, 15 * u); }
  [-1, 1].forEach(sd => { const x = cx + sd * SR * 0.62; g.fillStyle = ['#E5484D', '#FF5C9A', '#7B5CFF'][Math.min(2, form)]; g.beginPath(); g.moveTo(x, top - 52 * u); g.lineTo(x + sd * 16 * u, top - 47 * u); g.lineTo(x, top - 41 * u); g.closePath(); g.fill(); });
  const front = document.createElement('canvas'); front.width = c.width; front.height = c.height; const fg = front.getContext('2d'); fg.setTransform(d, 0, 0, d, 0, 0); const keep = g;
  { const g2 = fg; const railF = (a0, a1) => { g2.strokeStyle = L.trim; g2.lineWidth = 2.2 * u; g2.beginPath(); for(let a = a0; a <= a1 + 1e-6; a += (a1 - a0) / 24){ const x = cx + Math.cos(a) * SR * 0.97, y = top + Math.sin(a) * sry * 0.97 - 12 * u; a === a0 ? g2.moveTo(x, y) : g2.lineTo(x, y); } g2.stroke();
      for(let k = 0; k <= 8; k++){ const a = a0 + (a1 - a0) * k / 8, x = cx + Math.cos(a) * SR * 0.97, y = top + Math.sin(a) * sry * 0.97; g2.beginPath(); g2.moveTo(x, y); g2.lineTo(x, y - 12 * u); g2.stroke(); } };
    railF(Math.PI * 0.08, Math.PI * 0.92); }
  return {c, front, w, h, base: base + ry, top, cx, SR, sry, form, col, L, s, jail: G.jail};
}
// ✨ morph moments: when a hero's stage changes, a 1.2 s cocoon → swell → burst → new shape (🌱 Basic 0.6 s, no flash)
const MORPH = {dragon: null, princess: null, seen: {dragon: 1, princess: 1}};
function heroStage(h){ return TDDragon.stageOf(G.trees[h].tier); }
function heroCol(h){ const m = G.trees[h].main; return m || null; }
function morphCheck(){ ['dragon', 'princess'].forEach(h => { const st = heroStage(h); if(st !== MORPH.seen[h]){ if(st > MORPH.seen[h] && G.wave >= 0) MORPH[h] = {from: MORPH.seen[h], to: st, t0: performance.now(), dur: G.L && G.lvl === 0 ? 600 : 1200, basic: G.lvl === 0};
  MORPH.seen[h] = st; } }); }
function morphQ(h){ const m = MORPH[h]; if(!m) return -1; const q = (performance.now() - m.t0) / m.dur; if(q >= 1 || !FX){ MORPH[h] = null; return -1; } return m.basic ? 0.55 + q * 0.45 : q; }
function princessMorph(g, m, col, x, feet, k, q, t, o){
  if(q < 0.55){ const a = Math.min(1, q / 0.35), W = Math.ceil(130 * k), H = Math.ceil(150 * k), oc = document.createElement('canvas'); oc.width = W * 2; oc.height = H * 2; const og = oc.getContext('2d'); og.scale(2, 2);
    TDPrincess.draw(og, m.from, col, W / 2, H - 8 * k, k * (1 + q * 0.25), t, o); og.globalAlpha = a * 0.9; og.globalCompositeOperation = 'source-atop'; og.fillStyle = '#FFFFFF'; og.fillRect(0, 0, W, H); g.drawImage(oc, x - W / 2, feet - H + 8 * k, W, H);
    const R = (30 + q * 50) * k, gl = g.createRadialGradient(x, feet - 45 * k, 0, x, feet - 45 * k, R); gl.addColorStop(0, 'rgba(255,250,220,' + (0.3 + a * 0.5) + ')'); gl.addColorStop(1, 'rgba(255,250,220,0)'); g.fillStyle = gl; g.beginPath(); g.arc(x, feet - 45 * k, R, 0, 7); g.fill(); return; }
  const p = (q - 0.55) / 0.45, pop = 1 + Math.sin(Math.min(1, p * 1.6) * Math.PI) * 0.15; TDPrincess.draw(g, m.to, col, x, feet, k * pop, t, o);
  for(let i = 0; i < 16; i++){ const a = i / 16 * 7, r = (16 + p * 70) * k; g.globalAlpha = 1 - p; g.fillStyle = ['#FFE680', '#FFFFFF', '#FF8FC8'][i % 3]; g.beginPath(); g.arc(x + Math.cos(a) * r, feet - 50 * k + Math.sin(a) * r * 0.7, (2 + (i % 3)) * k, 0, 7); g.fill(); } g.globalAlpha = 1; }
function drawTower(g, t){
  const s = VIEW.s, pt = G.trees.princess, form = pt.form, col = heroCol('princess'); if(!TOWER_PIC || TOWER_PIC.form !== form || TOWER_PIC.col !== col || TOWER_PIC.s !== s || TOWER_PIC.jail !== G.jail) TOWER_PIC = stageTowerPic(form, col);
  const T = TOWER_PIC, ox = IX(TD.CX, TD.CY) - T.cx, oy = IY(TD.CX, TD.CY) - T.base;
  shadow(g, TD.CX + 0.35, TD.CY + 0.25, 1.2, 0.25); g.drawImage(T.c, ox, oy, T.w, T.h);
  // 👸 the princess centre stage + 🧑 the reader at the side, then the front railing
  const fx = ox + T.cx, fy = oy + T.top, pz = G.heroes.princess, st = heroStage('princess'), k = s / 52, q = morphQ('princess');
  const swat = pz.atk > HEROES_RATE_P - 0.3, act = G.jail ? 'shy' : performance.now() < AV_T && AV_ACT === 'cheer' ? 'cheer' : null, o = {act: act && window.Acting && Acting.has && Acting.has('acts', act) ? act : null, pose: swat ? {armR: 2.2} : null, dir: 1};
  const rs = readerSet(), ract = performance.now() < AV_T ? rs.act(AV_ACT === 'facepalm' ? 'dizzy' : 'cheer') : null, rpic = ract ? ract[Math.floor(t * 7) % ract.length] : rs.still;
  drawPic(g, rpic, fx + T.SR * 0.62, fy + T.sry * 0.35, rs.w, rs.h, true, 0, 1, rs);
  if(q >= 0) princessMorph(g, MORPH.princess, col, fx - s * 0.12, fy + T.sry * 0.1, k, q, t, o); else TDPrincess.draw(g, st, col, fx - s * 0.12, fy + T.sry * 0.1 - Math.abs(Math.sin(t * 2)) * s * 0.02, k, t, o);
  if(pz.dazeT > 0) emo(g, '✨', fx, fy - s * 1.5, s * 0.45);
  g.drawImage(T.front, ox, oy, T.w, T.h);
  if(G.domeT > 0){ const r = 2.3 + 0.05 * Math.sin(t * 5); g.fillStyle = 'rgba(150,220,255,.18)'; g.strokeStyle = 'rgba(130,205,255,.85)'; g.lineWidth = s * 0.07;
    g.beginPath(); g.ellipse(IX(TD.CX, TD.CY), IY(TD.CX, TD.CY), PX(r), PX(r) * V25.K, 0, 0, Math.PI); g.arc(IX(TD.CX, TD.CY), IY(TD.CX, TD.CY), PX(r), Math.PI, 0); g.fill(); g.stroke(); }
  if(G.shieldHp > 0){ g.strokeStyle = 'rgba(34,168,103,.9)'; g.lineWidth = s * 0.12; g.beginPath(); g.ellipse(IX(TD.CX, TD.CY), IY(TD.CX, TD.CY, 1.2), PX(1.45), PX(1.45) * V25.K, 0, 0, Math.PI * 2); g.stroke(); dots(g, IX(TD.CX, TD.CY), IY(TD.CX, TD.CY) + s * 0.7, G.shieldHp, '#22A867', s); }
  if(G.reflectN > 0) emo(g, '🪞', IX(TD.CX + 1.45, TD.CY), IY(TD.CX + 1.45, TD.CY, 1.3), s * 0.6);
  if(G.armorT > 0){ g.strokeStyle = 'rgba(34,181,115,.65)'; g.lineWidth = s * 0.06; g.setLineDash([s * 0.15, s * 0.1]); g.beginPath(); g.ellipse(IX(TD.CX, TD.CY), IY(TD.CX, TD.CY, 0.2), PX(1.5), PX(1.5) * V25.K, 0, t, t + Math.PI * 2); g.stroke(); g.setLineDash([]); }
}
// 🐉 the dragon: TDDragon's stage shape, flying (stage 3+) or hopping on the ground (stages 1–2)
function drawDragonHero(g, t){
  const s = VIEW.s, hd = G.heroes.dragon, st = heroStage('dragon'), col = heroCol('dragon'), lift = st >= 3 ? 1.6 + Math.sin(t * 3) * 0.12 : Math.abs(Math.sin(t * 6)) * 0.12, k = s / 46;
  const goingLeft = hd.px != null ? IX(hd.x, hd.y) < IX(hd.px, hd.py) - 0.01 : false; if(hd.px == null || Math.abs(hd.x - hd.px) + Math.abs(hd.y - hd.py) > 1e-4) hd.face = goingLeft ? -1 : 1; hd.px = hd.x; hd.py = hd.y;
  shadow(g, hd.x, hd.y, 0.3 + 0.12 * st, 0.18);
  const x = IX(hd.x, hd.y), feet = IY(hd.x, hd.y, lift), q = morphQ('dragon'), o = {dir: hd.face || 1, noShadow: true};
  if(q >= 0){ g.save(); if(o.dir < 0){ g.translate(x, 0); g.scale(-1, 1); g.translate(-x, 0); } TDDragon.morph(g, MORPH.dragon.from, MORPH.dragon.to, col, x, feet, k, q, t); g.restore(); }
  else { g.globalAlpha = hd.dazeT > 0 ? 0.75 : 1; TDDragon.draw(g, st, col, x, feet, k, t, o); g.globalAlpha = 1; }
  if(hd.sleepy) emo(g, '💤', x + s * 0.5, feet - s * 1.2, s * 0.45); if(hd.dazeT > 0) emo(g, '💐', x - s * 0.45, feet - s * 1.1, s * 0.45);
}
// 🖼️ the hero face in the skill panel = the same painters
function paintHeroFace(g, h, W, H){ const st = G ? heroStage(h) : 1, col = G ? heroCol(h) : null;
  if(h === 'dragon') TDDragon.draw(g, st, col, W * 0.48, H * 0.9, W / (st >= 4 ? 120 : 92), 0.4, {noShadow: true}); else TDPrincess.draw(g, st, col, W / 2, H * 0.98, W / 92, 0.4); }
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
function shadow(g, x, y, r, a){ g.fillStyle = 'rgba(30,40,20,' + (a == null ? 0.22 : a) + ')'; g.beginPath(); g.ellipse(IX(x, y) + r * VIEW.s * 0.15, IY(x, y), r * VIEW.s, r * VIEW.s * V25.K * 0.75, 0, 0, Math.PI * 2); g.fill(); }

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
const HEROES_RATE_P = TD.HEROES.princess.rate;

/* ---------- the frame ---------- */
let SHAKE = 0;
function paintFrame(t){
  const cv = $('cv'), g = cv.getContext('2d'), s = VIEW.s; if(!G) return;
  if(!BG) drawBG(); morphCheck();
  { const dtF = Math.min(0.1, Math.max(0, t - (paintFrame.lt || t))); paintFrame.lt = t; paintBG(g, dtF); }   // 🌅 iso-2 time of day
  let sx = 0, sy = 0; if(SHAKE > 0 && FX){ SHAKE = Math.max(0, SHAKE - 1 / 60); sx = (Math.random() - 0.5) * s * 0.25 * SHAKE * 3; sy = (Math.random() - 0.5) * s * 0.18 * SHAKE * 3; }
  // ☁️ cloud shadows drift over the meadow
  screenTf(g); if(sx || sy) g.translate(sx, sy);
  groundTf(g, sx, sy);
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
  G.traps.forEach(T => items.push({y: T.x + T.y - 0.05, d: () => { emo(g, T.icon, IX(T.x, T.y), IY(T.x, T.y, 0.22), s * 0.55, T.fx === 'lava' ? 0.8 : 1); if(T.charges > 1 && T.charges < 20) dots(g, IX(T.x, T.y), IY(T.x, T.y) + s * 0.3, T.charges, '#A0612C', s); }}));
  G.walls.forEach(w => items.push({y: w.x + w.y, d: () => { shadow(g, w.x, w.y, 0.45); emo(g, w.icon, IX(w.x, w.y), IY(w.x, w.y, 0.45), s * 0.95); bar(g, IX(w.x, w.y), IY(w.x, w.y, 1.05), s * 0.8, w.hp / w.hpMax, '#22A867'); }}));
  G.decoys.forEach(dc => items.push({y: dc.x + dc.y, d: () => { shadow(g, dc.x, dc.y, 0.45); emo(g, '🫖', IX(dc.x - 0.25, dc.y), IY(dc.x - 0.25, dc.y, 0.3), s * 0.55); emo(g, '🍰', IX(dc.x + 0.28, dc.y), IY(dc.x + 0.28, dc.y, 0.25), s * 0.5); }}));
  G.towers.forEach(T => items.push({y: T.x + T.y, d: () => { shadow(g, T.x, T.y, 0.38); const pop = Math.min(1, T.t / 0.35);
    emo(g, '🗼', IX(T.x, T.y), IY(T.x, T.y, 0.55 * pop), s * 1.05 * (0.5 + 0.5 * pop), T.offT > 0 ? 0.45 : 1); if(T.offT > 0) emo(g, '💐', IX(T.x + 0.3, T.y), IY(T.x + 0.3, T.y, 1.1), s * 0.5); if(T.slowed) emo(g, '🎵', IX(T.x - 0.35, T.y), IY(T.x - 0.35, T.y, 1.2), s * 0.4);
    ring(g, IX(T.x, T.y), IY(T.x, T.y) + s * 0.25, s * 0.14, 1 - T.t / T.dur, '#3A86FF'); }}));
  G.enemies.forEach(e => items.push({y: e.x + e.y, d: () => drawSuitor(g, e, t, s)}));
  G.minions.forEach(m => items.push({y: m.x + m.y, d: () => { const hop = Math.abs(Math.sin(t * 9 + m.d)) * 0.18; shadow(g, m.x, m.y, 0.25); emo(g, m.icon, IX(m.x, m.y), IY(m.x, m.y, 0.3 + hop), s * 0.6); if(m.fight) emo(g, '💥', IX(m.x - 0.25, m.y), IY(m.x - 0.25, m.y, 0.8), s * 0.35); bar(g, IX(m.x, m.y), IY(m.x, m.y, 0.8), s * 0.5, m.hp / m.hpMax, '#3A86FF'); }}));
  items.push({y: TD.CX + TD.CY + 0.1, d: () => drawTower(g, t)});
  const hd = G.heroes.dragon, DT = G.trees.dragon, ds = s * (1.05 + 0.25 * DT.form), dz = 1.9 + Math.sin(t * 3) * 0.15;
  items.push({y: hd.x + hd.y < TD.CX + TD.CY - 1.2 ? hd.x + hd.y : 99, d: () => drawDragonHero(g, t)});   // 🐉 iso-2: TDDragon
  G.flyers.forEach(f => items.push({y: f.x + f.y, d: () => { shadow(g, f.x, f.y, 0.18, 0.15); emo(g, f.icon, IX(f.x, f.y), IY(f.x, f.y, 1.2 + Math.sin(t * 10 + f.atk) * 0.1), s * 0.55); }}));
  items.sort((a, b) => a.y - b.y).forEach(it => it.d());   // depth = x + y (diamond)
  paintLights(g, t);   // 🏮 iso-2 dusk / night lights
  // ✨ air effects + 💬 words
  drawSkillZones(g, s, t);
  G.fx.forEach(f => { if(!drawSkillFx(g, f, s, t, 'air')) drawFx(g, f, s, t); drawSkillFxAlso(g, f, s, t); });
  PARTS = PARTS.filter(p => (p.t += 1 / 60) < p.dur); PARTS.forEach(p => { const k = p.t / p.dur; emo(g, p.ic, IX(p.x, p.y) + p.vx * k * s, IY(p.x, p.y, p.z) + (p.vy * k + 2.2 * k * k) * s, s * p.sz * (1 - k * 0.4), 1 - k); });
  g.textAlign = 'center'; g.textBaseline = 'middle';
  FT.forEach(f => { const p = f.t / f.dur, a = p < 0.75 ? 1 : 1 - (p - 0.75) / 0.25, fs = Math.max(11, s * 0.5), pop = p < 0.12 ? 0.6 + p / 0.12 * 0.4 : 1;
    g.font = '800 ' + Math.round(fs * pop) + 'px Fredoka, Nunito, sans-serif'; g.globalAlpha = a; const x = Math.max(fs * 2, Math.min(VIEW.px - fs * 2, IX(f.x, f.y))), y = Math.max(fs, IY(f.x, f.y, 1.4) - p * s * 0.9);
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
  const S = e.S, x = IX(e.x, e.y);
  if(e.gone){ const k = e.goneT; if(k > 0.9) return; emo(g, S.emoji, x + k * s * 2, IY(e.x, e.y, 0.3 + k * 2), s * 0.55, Math.max(0, 1 - k)); if(k < 0.5) emo(g, '💖', x, IY(e.x, e.y, 1), s * 0.4); return; }
  shadow(g, e.x, e.y, 0.22); const hop = Math.abs(Math.sin(t * 13 + e.id)) * 0.18, y = IY(e.x, e.y, 0.32 + hop);
  emo(g, S.emoji, x, y, s * 0.6, 1, Math.cos(e.ang || 0) < 0); emo(g, '💘', x + s * 0.24, y - s * 0.32, s * 0.3);
  bar(g, x, y - s * 0.45, s * 0.6, e.hp / e.hpMax, '#FF5C9A');
}
function drawSuitor(g, e, t, s){
  if(e.S.emoji) return drawEmojiSuitor(g, e, t, s);
  const S = e.S, set = suitorSet(e), w = set.w, h = set.h;
  if(e.gone){ const k = e.goneT;
    if(e.kiss){ const a = Math.max(0, 1 - k / 0.9), fr = set.act('bow'); if(a > 0) drawPic(g, fr[Math.min(fr.length - 1, Math.floor(k * 8))], IX(e.x, e.y), IY(e.x, e.y, k * 0.6), w * (0.6 + a * 0.4), h * (0.6 + a * 0.4), false, 0, a, set); return; }
    const x = IX(e.x, e.y) + Math.cos(e.flyA) * k * s * 7, y = IY(e.x, e.y, 0.2) - k * s * 6 + k * k * s * 3.5;
    drawPic(g, set.act('dizzy')[0], x, y + set.head * 0.5, w, h, Math.cos(e.flyA) < 0, k * 12, Math.max(0, 1 - k * 0.6), set);
    if(k < 0.55) emo(g, '💫', IX(e.x, e.y), IY(e.x, e.y, 1.3), s * 0.6); return; }
  const still = e.stunT > 0 || e.rootT > 0 || e.sleepT > 0 || e.tea || e.atWall, hop = still ? 0 : Math.abs(Math.sin(t * 11 + e.id)) * 0.05;
  shadow(g, e.x, e.y, (S.size || 0.95) * 0.34);
  if(e.charmT > 0){ g.fillStyle = 'rgba(255,92,154,.28)'; g.beginPath(); g.ellipse(IX(e.x, e.y), IY(e.x, e.y), w * 0.45, w * 0.45 * V25.K, 0, 0, Math.PI * 2); g.fill(); }
  const back = e.charmT > 0 || e.fearT > 0, flip = Math.cos(e.ang || 0) < 0 ? !back : back;
  const fr = e.charmT > 0 ? set.act('love') : (e.stunT > 0 || e.sleepT > 0 || e.rootT > 0 || e.confT > 0) ? set.act('dizzy') : null;
  const pic = fr ? fr[Math.floor(t * 6 + e.id) % fr.length] : still ? set.still : set.walk[Math.floor((t * 1.9 + e.id * 0.37) * WALK_N) % WALK_N];
  const alpha = e.hitT > 0 && FX ? 0.55 + 0.45 * Math.cos(e.hitT * 70) : 1, fy = IY(e.x, e.y, hop);
  drawPic(g, pic, IX(e.x, e.y), fy, w, h, flip, 0, alpha, set);
  if(S.prop && e.type !== 'bd') emo(g, S.prop, IX(e.x, e.y) + (flip ? -1 : 1) * set.head * 0.34, fy - set.head * 0.42, set.head * 0.34, alpha, flip);
  if(S.front) emo(g, S.front, IX(e.x, e.y) + (flip ? -1 : 1) * w * 0.42, fy - s * 0.28, s * 0.62, alpha, flip);   // 🛒 the gift cart rolls in front
  if(e.shine > 0 || e.shield > 0){ g.strokeStyle = e.shine > 0 ? 'rgba(255,240,140,.95)' : 'rgba(150,200,255,.9)'; g.lineWidth = s * 0.07; g.beginPath(); g.ellipse(IX(e.x, e.y), fy - set.head * 0.5, set.head * 0.42, set.head * 0.58, 0, 0, Math.PI * 2); g.stroke(); }
  const top = fy - set.head - s * 0.12;
  bar(g, IX(e.x, e.y), top, Math.min(w * 0.8, s * 0.9), e.hp / e.hpMax, e.boss ? '#E5484D' : '#FF5C9A');
  const st = e.charmT > 0 ? '😍' : e.sleepT > 0 ? '💤' : e.stunT > 0 ? '💞' : e.rootT > 0 ? '🕸️' : e.fearT > 0 ? '😱' : e.confT > 0 ? '❓' : e.tea ? '☕' : e.slowT > 0 ? '🐌' : e.burnT > 0 ? '🔥' : '';
  if(st) emo(g, st, IX(e.x, e.y) + w * 0.36, top - s * 0.22, s * 0.4);
  if(e.boss) emo(g, '👑', IX(e.x, e.y), top - s * 0.3, s * 0.45);
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
  cone: ['ground', (f, s) => ({shape: 'cone', x: IX(f.x, f.y), y: IY(f.x, f.y, 0.25), ang: f.ang, len: f.len * s, w: f.w * 0.6})],
  zap: ['air', f => ({shape: 'chain', x: IX(f.x, f.y), y: IY(f.x, f.y, 1.2), x2: IX(f.x2, f.y2), y2: IY(f.x2, f.y2, 0.6)})],
  swat: ['air', (f, s) => ({shape: 'whip', x: IX(f.x, f.y), y: IY(f.x, f.y, 2.7), x2: IX(f.x2, f.y2), y2: IY(f.x2, f.y2, 0.6), w: s * 0.16})],
  whip: ['air', (f, s) => ({shape: 'whip', x: IX(f.x, f.y), y: IY(f.x, f.y, 2.6), x2: IX(f.x + Math.cos(f.ang) * f.len, f.y + Math.sin(f.ang) * f.len), y2: IY(f.x + Math.cos(f.ang) * f.len, f.y + Math.sin(f.ang) * f.len, 0.4), w: s * f.w * 0.5})],
  beam: ['air', (f, s) => ({shape: 'beam', x: IX(f.x, f.y), y: IY(f.x, f.y, 1.5), x2: IX(f.x + Math.cos(f.ang) * f.len, f.y + Math.sin(f.ang) * f.len), y2: IY(f.x + Math.cos(f.ang) * f.len, f.y + Math.sin(f.ang) * f.len, 0.6), w: s * f.w * 0.5})],
  fireball: ['air', (f, s) => ({shape: 'shot', x: IX(f.x, f.y), y: IY(f.x, f.y, 1.5), x2: IX(f.x2, f.y2), y2: IY(f.x2, f.y2, 0.55), h: s * 0.6, size: s * 0.36})],
  bolt: ['air', (f, s) => ({shape: 'shot', x: IX(f.x, f.y), y: IY(f.x, f.y, 1.3), x2: IX(f.x2, f.y2), y2: IY(f.x2, f.y2, 0.55), h: s * 0.6, size: s * 0.32})],
  rose: ['air', (f, s) => ({shape: 'shot', x: IX(f.x, f.y), y: IY(f.x, f.y, 1.0), x2: IX(f.x2, f.y2), y2: IY(f.x2, f.y2, 0.55), h: s * 0.5, size: s * 0.26})],
  bird: ['air', (f, s) => ({shape: 'shot', x: IX(f.x, f.y), y: IY(f.x, f.y, 2.4), x2: IX(f.x2, f.y2), y2: IY(f.x2, f.y2, 0.55), h: s * 0.9, size: s * 0.24})],
  boom: ['air', (f, s) => ({shape: 'splash', x: IX(f.x, f.y), y: IY(f.x, f.y), r: (f.r || 1.2) * s})],
  coins: ['air', (f, s) => ({shape: 'gold', x: IX(f.x, f.y), y: IY(f.x, f.y, 2.2), r: s * 0.9})],
  crit: ['air', (f, s) => ({shape: 'hit', x: IX(f.x, f.y), y: IY(f.x, f.y, 0.9), r: s * 0.55})],
  ting: ['air', (f, s) => ({shape: 'hit', x: IX(f.x, f.y), y: IY(f.x, f.y, 0.9), r: s * 0.35})],
  trap: ['ground', (f, s) => ({shape: 'trap', x: IX(f.x, f.y), y: IY(f.x, f.y), r: s * 0.7})],
  build: ['ground', (f, s) => ({shape: 'summon', x: IX(f.x, f.y), y: IY(f.x, f.y), r: s * 0.75})],
  shine: ['ground', (f, s) => ({shape: 'summon', x: IX(f.x, f.y), y: IY(f.x, f.y), r: s * 1.2})],
  poof: ['air', (f, s) => ({shape: 'hit', x: IX(f.x, f.y), y: IY(f.x, f.y, 0.6), r: s * 0.6})],
  push: ['air', (f, s) => ({shape: 'push', x: IX(f.x, f.y), y: IY(f.x, f.y), r: (f.r || 1.6) * s})],
  pull: ['air', (f, s) => ({shape: 'pull', x: IX(f.x, f.y), y: IY(f.x, f.y), r: (f.r || 1.6) * s})],
  daze: ['ground', (f, s) => ({shape: 'zone', x: IX(f.x, f.y), y: IY(f.x, f.y), r: (f.r || 1.6) * s, also: {shape: 'daze', layer: 'air', h: s * 1.3, r: s * 0.7}})],
  sleep: ['ground', (f, s) => ({shape: 'zone', x: IX(f.x, f.y), y: IY(f.x, f.y), r: (f.r || 1.6) * s})],
  fear: ['ground', (f, s) => ({shape: 'zone', x: IX(f.x, f.y), y: IY(f.x, f.y), r: (f.r || 1.6) * s})],
  confuse: ['ground', (f, s) => ({shape: 'zone', x: IX(f.x, f.y), y: IY(f.x, f.y), r: (f.r || 1.6) * s})],
  slow: ['ground', (f, s) => ({shape: 'zone', x: IX(f.x, f.y), y: IY(f.x, f.y), r: (f.r || 1.6) * s})],
  haste: ['air', (f, s) => ({shape: 'haste', x: IX(f.x, f.y), y: IY(f.x, f.y, 0.4), r: s * 1.3})],
  heal: ['air', (f, s) => ({shape: 'heal', x: IX(f.x, f.y), y: IY(f.x, f.y, 0.2), r: s * 1.3, h: s * 3.4})],
  shield: ['air', (f, s) => f.sk || (Math.abs(f.x - TD.CX) < 0.01 && Math.abs(f.y - TD.CY) < 0.01) ? {shape: 'shield', x: IX(f.x, f.y), y: IY(f.x, f.y, 0.3), r: s * 1.5, h: s * 3.2, n: 7} : {shape: 'shield', x: IX(f.x, f.y), y: IY(f.x, f.y), r: s * 0.5, h: s * 1.1, n: 4}],
  mirror: ['air', (f, s) => ({shape: 'shield', x: IX(f.x, f.y), y: IY(f.x, f.y, 0.3), r: s * 1.4, h: s * 2.8, n: 5})],
  dome: ['air', (f, s) => ({shape: 'dome', x: IX(f.x, f.y), y: IY(f.x, f.y, 0.1), r: s * 2.1})],
  cast: ['ground', (f, s) => ({shape: 'cast', x: IX(f.x, f.y), y: IY(f.x, f.y), r: s * (f.big || 0.9)})],
  // 🤴 R2 suitor + boss tricks (td-2)
  potion: ['air', (f, s) => ({shape: 'splash', x: IX(f.x, f.y), y: IY(f.x, f.y), r: s * 0.9})],
  decree: ['air', (f, s) => ({shape: 'push', x: IX(f.x, f.y), y: IY(f.x, f.y), r: (f.r || 3) * s})],
  serenade: ['air', (f, s) => ({shape: 'push', x: IX(f.x, f.y), y: IY(f.x, f.y), r: (f.r || 4) * s})],
  choc: ['air', (f, s) => ({shape: 'hit', x: IX(f.x, f.y), y: IY(f.x, f.y, 0.8), r: s * 0.5})],
  blink: ['air', (f, s) => ({shape: 'hit', x: IX(f.x, f.y), y: IY(f.x, f.y, 0.8), r: s * 0.75})],
  kiss: ['air', (f, s) => ({shape: 'shot', x: IX(f.x, f.y), y: IY(f.x, f.y, 1.2), x2: IX(f.x2, f.y2), y2: IY(f.x2, f.y2, 1.2), h: s * 0.6, size: s * 0.3})],
  ring: ['air', (f, s) => ({shape: 'shot', x: IX(f.x, f.y), y: IY(f.x, f.y, 1.2), x2: IX(f.x2, f.y2), y2: IY(f.x2, f.y2, 1.2), h: s * 0.8, size: s * 0.26})],
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
      SkillKit.fx.draw(g, {shape: fall ? 'meteor' : 'splash', x: IX(Z.x, Z.y), y: IY(Z.x, Z.y), r: (Z.big ? 4 : Z.r) * s, h: s * 6, size: s * (Z.big ? 1 : 0.7), p: fall ? p : (p - 0.55) / 0.45, t, look: L, sq: V25.K, seed: Z.x * 7 + Z.y}); return; }
    const p = Math.min(1, Z.t / Z.dur);
    if(Z.k === 'storm') SkillKit.fx.draw(g, {shape: 'storm', x: IX(Z.x, Z.y), y: IY(Z.x, Z.y), r: Z.r * s, h: s * 3.2, p, t, look: L, sq: V25.K, seed: Z.x + Z.y * 3});
    else if(Z.k === 'tornado') SkillKit.fx.draw(g, {shape: 'tornado', x: IX(Z.x, Z.y), y: IY(Z.x, Z.y), r: Z.r * s * 0.8, h: s * 2.6, p, t, look: L, sq: V25.K, seed: 13}); });
}
function drawTrapRunes(g, s, t){ if(!FX_OK) return; G.traps.forEach(T => { if(T.fx === 'lava') return; SkillKit.fx.draw(g, {shape: 'trap', idle: true, x: IX(T.x, T.y), y: IY(T.x, T.y), r: Math.min(T.r, 1.1) * s * 0.8, p: 0.5, t: t + T.x, look: skillLook(T.src, 'trap'), sq: V25.K}); }); }
const FX_OK = typeof SkillKit !== 'undefined' && !!SkillKit.fx;
// effects in the air (screen space, from P(x, y, z))
function drawFx(g, f, s, t){
  const p = Math.min(1, f.t / f.dur), q = Math.min(1, p * 1.6);
  switch(f.k){
    case 'fireball': case 'bolt': case 'rose': case 'bird': case 'bouquet': case 'arrow': case 'swat': {
      const z1 = f.k === 'fireball' || f.k === 'bouquet' ? 1.5 : f.k === 'swat' ? 2.7 : f.k === 'bird' ? 2.4 : f.k === 'rose' ? 1.0 : f.k === 'arrow' ? 0.7 : 1.3;
      const z2 = f.k === 'bouquet' ? 1.5 : f.k === 'arrow' ? 2.6 : 0.55;
      const x = IX(f.x + (f.x2 - f.x) * q, f.y + (f.y2 - f.y) * q), y = IY(f.x + (f.x2 - f.x) * q, f.y + (f.y2 - f.y) * q, z1 + (z2 - z1) * q + Math.sin(q * Math.PI) * 0.8);
      if(f.k === 'swat'){ g.strokeStyle = '#E0A43A'; g.lineWidth = s * 0.12 * (1 - p * 0.6); g.lineCap = 'round'; g.beginPath(); g.moveTo(IX(f.x, f.y), IY(f.x, f.y, z1)); g.quadraticCurveTo(IX((f.x + f.x2) / 2 + 0.6, (f.y + f.y2) / 2), IY((f.x + f.x2) / 2 + 0.6, (f.y + f.y2) / 2, 2.4), x, y); g.stroke(); if(p > 0.35) emo(g, '💥', IX(f.x2, f.y2), IY(f.x2, f.y2, 0.6), s * 0.5 * (1 - p)); break; }
      if(f.k === 'fireball' || f.k === 'bolt'){ const c2 = f.k === 'bolt' ? (SkillKit.COLORS[f.col] || {hex: '#FF8A3D'}).hex : '#FF8A3D';
        for(let k = 3; k >= 1; k--){ const qq = Math.max(0, q - k * 0.07), tx = IX(f.x + (f.x2 - f.x) * qq, f.y + (f.y2 - f.y) * qq), ty = IY(f.x + (f.x2 - f.x) * qq, f.y + (f.y2 - f.y) * qq, z1 + (z2 - z1) * qq + Math.sin(qq * Math.PI) * 0.8); g.globalAlpha = 0.25 / k; g.fillStyle = c2; g.beginPath(); g.arc(tx, ty, s * 0.2, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1;
        const gr = g.createRadialGradient(x, y, 0, x, y, s * 0.32); gr.addColorStop(0, '#FFF6B0'); gr.addColorStop(0.5, c2); gr.addColorStop(1, 'rgba(255,80,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, s * 0.32, 0, Math.PI * 2); g.fill(); }
      else emo(g, {rose: '🌹', bird: '🕊️', bouquet: '💐', arrow: '💘'}[f.k], x, y, s * 0.5);
      break; }
    case 'zap': { g.strokeStyle = '#8EC8FF'; g.lineWidth = s * 0.08; g.globalAlpha = 1 - p; g.beginPath(); g.moveTo(IX(f.x, f.y), IY(f.x, f.y, 1.2)); for(let i = 1; i < 6; i++){ const k = i / 6; g.lineTo(IX(f.x + (f.x2 - f.x) * k, f.y + (f.y2 - f.y) * k) + (Math.random() - 0.5) * s * 0.4, IY(f.x + (f.x2 - f.x) * k, f.y + (f.y2 - f.y) * k, 1.0) + (Math.random() - 0.5) * s * 0.4); } g.lineTo(IX(f.x2, f.y2), IY(f.x2, f.y2, 0.6)); g.stroke(); g.globalAlpha = 1; break; }
    case 'meteor': break;
    case 'push': case 'daze': case 'sleep': case 'fear': case 'confuse': case 'pull': case 'haste': case 'heal': case 'mirror': {
      const ic = {daze: '💞', sleep: '💤', fear: '😱', confuse: '❓', heal: '💚', mirror: '🪞', haste: '⚡', push: '🔔', pull: '🧲'}[f.k], R = (f.r || 1.6) * (f.k === 'pull' ? 1 - p * 0.7 : 0.4 + p * 0.7);
      for(let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2 + t * 2; emo(g, ic, IX(f.x + Math.cos(a) * R, f.y + Math.sin(a) * R), IY(f.x + Math.cos(a) * R, f.y + Math.sin(a) * R, 0.6 + p * 0.5), s * 0.42, 1 - p); } break; }
    case 'heart': emo(g, '💗', IX(f.x, f.y), IY(f.x, f.y, 1 + p), s * 0.6, 1 - p); break;
    case 'coins': for(let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2; emo(g, '🪙', IX(f.x + Math.cos(a) * p * 1.6, f.y + Math.sin(a) * p * 1.6), IY(f.x + Math.cos(a) * p * 1.6, f.y + Math.sin(a) * p * 1.6, 2.6 + p * 0.5 - p * p * 2), s * 0.45, 1 - p); } break;
    case 'crit': emo(g, '💥', IX(f.x, f.y), IY(f.x, f.y, 1), s * 0.7 * (1 + p), 1 - p); break;
    case 'ting': emo(g, '✨', IX(f.x, f.y), IY(f.x, f.y, 1), s * 0.5, 1 - p); break;
    case 'trap': emo(g, f.icon || '💥', IX(f.x, f.y), IY(f.x, f.y, 0.4 + p * 0.5), s * 0.8 * (1 + p * 0.5), 1 - p); break;
    case 'boom': emo(g, '💥', IX(f.x, f.y), IY(f.x, f.y, 0.5), s * (0.9 + p), 1 - p); break;
    case 'poof': case 'build': emo(g, f.k === 'build' ? '✨' : '💨', IX(f.x, f.y), IY(f.x, f.y, 0.5 + p * 0.6), s * (0.6 + p * 0.6), 1 - p); break;
    case 'flowerbomb': emo(g, '💐', IX(f.x, f.y), IY(f.x, f.y, 2 - p), s * 0.7, 1 - p * 0.5); break;
    case 'shine': emo(g, '✨', IX(f.x, f.y), IY(f.x, f.y, 1), s * (1 + p * 2), 1 - p); break;
    case 'charge': emo(g, '🛡️', IX(f.x, f.y), IY(f.x, f.y, 1.4), s * 0.6, 1 - p); break;
    case 'hop': emo(g, '🦘', IX(f.x, f.y), IY(f.x, f.y, 1.4), s * 0.5, 1 - p); break;
    case 'ladder': emo(g, '🪜', IX(f.x, f.y), IY(f.x, f.y, 1.4), s * 0.6, 1 - p); break;
    case 'ew': emo(g, '😝', IX(f.x, f.y), IY(f.x, f.y, 1.5), s * 0.6, 1 - p); break;
    case 'bounce': emo(g, '🫧', IX(f.x, f.y), IY(f.x, f.y, 0.6), s * 0.7, 1 - p); break;
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
