
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
  {id: 'farmer', title: 'Farmer Delusion', icon: '👨‍🌾🍄', sub: 'Trick the money collector with a mushroom maze', b1: '#7CC25A', b2: '#C27A2E'},   // 👨‍🌾 fd-1: open
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
function saveRow(name, book){ try{ return JSON.parse(S.settings['SkillTree_td-' + (book || S.book) + '_' + (name || S.player)] || '{}') || {}; }catch(e){ return {}; } }   // fd-1: per book
function chaptersDone(name, book){ const r = saveRow(name, book), p = progressOf(name || S.player, book); return Math.max(Number(r.ch) || 0, 0) || (p.unlocked > 0 && !r.ch ? 1 : 0); }
function progMap(book){ return (book || S.book) === 'farmer' ? (S.progressFarmer || (S.progressFarmer = {})) : S.progress; }   // 👨‍🌾 fd-1: each book has its own board
function progressOf(name, book){ return progMap(book)[name] || {unlocked: 0, tokens: [], best: []}; }
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
  if(id === 'draprincess' || id === 'farmer') openBook(id); else openShelf();
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
function openShelf(){
  const box = $('shelf'); box.innerHTML = '';
  SHELF.forEach(b => { const el = document.createElement('button'); el.className = 'book' + (b.soon ? ' soon' : ''); el.dataset.book = b.id; el.setAttribute('data-sound', b.soon ? 'none' : 'pop');
    el.style.setProperty('--b1', b.b1); el.style.setProperty('--b2', b.b2);
    const done = b.soon ? 0 : chaptersDone(S.player, b.id);
    el.innerHTML = (b.soon ? '<span class="rib">🔜 Coming soon</span>' : (done ? '<span class="rib">📖 ' + done + ' / 6</span>' : '<span class="rib">✨ NEW</span>')) +
      (b.soon ? '<span class="bi">' + b.icon + '</span>' : '<canvas class="bcv" width="400" height="320" aria-hidden="true"></canvas>') + '<span class="bt">' + UI.esc(b.title) + '</span><span class="bs">' + UI.esc(b.sub) + '</span>' +
      (!b.soon && saveRow(S.player, b.id).last ? '<span class="bb">' + SkillKit.barHtml(lastBar(b.id)) + '</span>' : '');
    el.onclick = () => { if(b.soon){ UISound.play('error'); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); UI.toast('📖 ' + b.title + ' is still being written — Dra-Princess Diary first!'); return; } openBook(b.id); };
    box.appendChild(el);
    const cv = el.querySelector('.bcv'); if(cv) try{ let row = {}; try{ row = JSON.parse(S.settings['SkillTree_td-' + b.id + '_' + S.player] || '{}') || {}; }catch(e){} (b.id === 'farmer' ? fdCover : scCover)(cv, row); }catch(e){ cv.outerHTML = '<span class="bi">' + b.icon + '</span>'; } });   // 🎬 td-scenes: your heroes on the cover
  showScreen('menu');
}
function lastBar(book){ const r = saveRow(null, book); if(!r.last) return []; return Object.keys(r.last).reduce((a, k) => a.concat(String((r.last[k] || {}).p || '').split(',')), []).map(x => x.split(':')[0]).filter(c => COLS.includes(c)); }   // fd-1: any book's heroes
const BOOK = id => TD.BOOKS[id] || FD.BOOKS[id];
const bossName = C => UI.esc(((C.gates ? FD.FOES : TD.SUITORS)[C.boss] || {}).name || '');
function openBook(id){
  S.book = id; const B = BOOK(id), cover = SHELF.find(b => b.id === id);
  $('book-icon').textContent = cover.icon; $('book-title').textContent = cover.title; $('book-sub').textContent = cover.sub;
  NAV_INNER.diary[0] = '◀ ' + cover.title;
  const done = chaptersDone();
  if(S.chapter > done + 1 || !B.chapters[S.chapter - 1] || B.chapters[S.chapter - 1].soon) S.chapter = Math.min(done + 1, B.chapters.filter(C => !C.soon).length);
  const cb = $('chapters'); cb.innerHTML = '';
  B.chapters.forEach(C => { const locked = !C.soon && C.n > done + 1, el = document.createElement('button');
    el.className = 'chap' + (C.soon ? ' soon' : locked ? ' locked' : '') + (C.n === S.chapter ? ' on' : ''); el.dataset.ch = C.n; el.setAttribute('data-sound', C.soon || locked ? 'none' : 'tap');
    el.innerHTML = '<span class="cn">Chapter ' + C.n + (C.n <= done ? ' · ✅' : '') + '</span><span class="ct">' + UI.esc(C.title) + '</span><span class="cb">' +
      (C.soon ? '🔜 next round' : locked ? '🔒 finish chapter ' + (C.n - 1) + ' first' : '👑 Boss: ' + bossName(C) + ' · ' + (C.gates ? C.gates.length + ' gates' : C.paths.length + ' paths')) + '</span>';
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
      '<div class="big">' + L.emoji + '</div><div class="nm">' + L.name + '</div><div class="hp">' + (S.book === 'farmer' ? '🎃 ' + FD.LEVELS[i].hearts + ' · 🌰 ' + FD.LEVELS[i].seeds + ' seeds' : '❤️ ' + L.hearts + ' · 🃏 ' + L.cards + ' cards') + '</div><div class="sub">' + (L.hardcore && !open ? 'Beat Extreme to open 💀 Hardcore' : S.book === 'farmer' ? FD.LEVELS[i].blurb : L.blurb) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore!' : i === 4 ? 'Win on Hard to unlock Extreme!' : 'Win the level before to unlock it'); return; } S.level = i; openDiary(S.chapter, i, 'intro'); };
    box.appendChild(b);
  });
}
function openDiary(ch, lvl, when){
  // ch = 1–6, or 'jail' (💍 Jailbreak pages: 'intro' before it, 'outro' = "I OBJECT!!"); when = 'intro' | 'outro' | 'ending' (after chapter 6)
  const jail = ch === 'jail', D = DIARY[S.book][ch], C = jail ? BOOK(S.book).jail : BOOK(S.book).chapters[ch - 1], soonNext = ch < 6 && (!BOOK(S.book).chapters[ch] || BOOK(S.book).chapters[ch].soon || !DIARY[S.book][ch + 1]);
  const ls = when === 'ending' ? D.endingLesson : D.lessons[when === 'intro' ? 0 : 1];
  const head = jail ? (when === 'intro' ? '💍 Jailbreak! — the Dragon breaks out' : '💍 "I OBJECT!!"') : when === 'ending' ? '📖 The very last page' : when === 'intro' ? 'Chapter ' + ch + ': ' + UI.esc(C.title) : 'The end of chapter ' + ch;
  $('diary').innerHTML = '<div class="dh' + (jail ? ' jail' : when === 'ending' ? ' ending' : '') + '">📔 ' + head + '</div><canvas id="diary-cv" width="840" height="300"></canvas><div class="dt">' + UI.esc(when === 'ending' ? D.ending : D[when]) + '</div>';
  $('lesson').innerHTML = '<span class="li">' + ls[0] + '</span><div><div class="lh">💡 Did you know? · ' + UI.esc(ls[1]) + '</div><div class="lt">' + UI.esc(ls[2]) + '</div></div>';
  const from = S.jail || {ch: S.chapter, lvl}, B = [];
  if(jail && when === 'intro') B.push('<button class="sp-btn sp-secondary" id="diary-lv" data-sound="tap">🎚️ Levels</button>', '<button class="sp-btn sp-primary sp-lg" id="diary-go" data-sound="pop">🐉 Break out! ▶</button>');
  else if(jail) B.push('<button class="sp-btn sp-secondary" id="diary-lv" data-sound="tap">🎚️ Levels</button>', '<button class="sp-btn sp-primary sp-lg" id="diary-retry" data-sound="pop">🏰 Chapter ' + from.ch + ' again · +' + JAIL_BONUS + ' ❤️ ▶</button>');
  else if(when === 'intro') B.push('<button class="sp-btn sp-primary sp-lg" id="diary-go" data-sound="pop">▶ Start chapter ' + ch + '</button>');
  else if(when === 'ending') B.push('<button class="sp-btn sp-secondary" id="diary-lv" data-sound="tap">🎚️ Levels</button>', '<button class="sp-btn sp-primary sp-lg" id="diary-shelf" data-sound="pop">📚 Back to the shelf</button>');
  else B.push('<button class="sp-btn sp-secondary" id="diary-lv" data-sound="tap">🎚️ Levels</button>', ch < 6 && !soonNext ? '<button class="sp-btn sp-primary sp-lg" id="diary-next" data-sound="pop">Chapter ' + (ch + 1) + ' ▶</button>' : ch < 6 ? '<button class="sp-btn sp-primary sp-lg" id="diary-shelf" data-sound="pop">📚 Chapter ' + (ch + 1) + ' is coming soon — back to the shelf</button>' : '<button class="sp-btn sp-primary sp-lg" id="diary-end" data-sound="pop">📖 The ending ▶</button>');
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
/* 🎬 TD SCENES (td-scenes) START — 📚 shelf cover · 📔 diary pages · 🏁 result cards drawn with the SAME heroes as play:
   🐉 TDDragon (5 shape stages, skill colour) + 👸 TDPrincess (AvatarKit avatar wearing her stage) + the 🎭 stage tower, on a little floating island.
   Which stage / colour a picture shows:
   · chapter intro = how far the STORY is (SC_STORY) in your colours · chapter outro + result = what you REALLY built (stage + main colour of that match)
   · shelf cover = your last build (or the hatchling + tiara princess when the book is new) · the Dragon's moves = act-2's DMOVES looped (roar, breath, wing …) */
const SC_STORY = {1: [1, 1], 2: [1, 2], 3: [2, 2], 4: [3, 3], 5: [4, 4], 6: [5, 4], ending: [5, 5]};   // [dragon stage, princess stage] the story has reached
const SC_DEF = {dragon: 'A', princess: 'E'};
const SC_DK = [0, 1.6, 1.4, 1.25, 1.15, 1.1];   // dragon size per stage in pictures: small stages a bit bigger so they still read, big ones still bigger (k × stage sc)                                                         // colours before you ever picked a main colour (🔴 fire dragon · 🟣 charm princess)
function scBuild(row){ const r = row || saveRow(), d = (r.last || {}).dragon || {}, p = (r.last || {}).princess || {};
  return {dS: d.t ? TDDragon.stageOf(d.t) : 0, dC: d.m || null, pS: p.t ? TDPrincess.stageOf(p.t) : 0, pC: p.m || null}; }
// the heroes a scene shows: {dS, dC, pS, pC}; mode 'story' = story stage + your colours, 'built' = your last build (never below stage 1)
function scHeroes(key, mode){ const st = SC_STORY[key] || SC_STORY[1], b = scBuild();
  const dC = b.dC || SC_DEF.dragon, pC = b.pC || SC_DEF.princess;
  if(mode === 'built' && b.dS) return {dS: b.dS, dC, pS: b.pS || 1, pC};
  if(mode === 'best') return {dS: Math.max(st[0], b.dS), dC, pS: Math.max(st[1], b.pS), pC};
  return {dS: st[0], dC, pS: st[1], pC}; }
// 🐉 a looping act-2 move as a pose (the same beats + eases the game plays) — period in s, the move plays at the start of each loop
function scDPose(move, t, period){ const B = (typeof DMOVES !== 'undefined' && DMOVES[move]) || null; if(!B) return {};
  let ms = (t % (period || 2)) * 1000, prev = {}; const ease = (e, x) => window.Acting && Acting.ease ? Acting.ease(e || 'sineInOut')(x) : x;
  for(const b of B){ if(ms <= b.ms){ const q = ease(b.ease, Math.max(0, Math.min(1, ms / b.ms))), out = {}, keys = new Set(Object.keys(prev).concat(Object.keys(b.pose)));
      keys.forEach(k => { const a = prev[k] || 0, z = b.pose[k] || 0; out[k] = a + (z - a) * q; }); return out; }
    ms -= b.ms; prev = b.pose; }
  return {}; }
// 🏝️ a floating storybook island (grass top, earth underside fading into the sky, little roots) — the same island the chapters are played on
function scIsland(g, cx, top, rx, ry, grass, edge){
  const ug = g.createLinearGradient(0, top, 0, top + ry * 3.6); ug.addColorStop(0, '#9A6A44'); ug.addColorStop(0.55, 'rgba(122,82,52,.75)'); ug.addColorStop(1, 'rgba(122,82,52,0)');
  g.fillStyle = ug; g.beginPath(); g.moveTo(cx - rx, top); g.bezierCurveTo(cx - rx * 0.85, top + ry * 2.1, cx - rx * 0.3, top + ry * 3.3, cx, top + ry * 3.6); g.bezierCurveTo(cx + rx * 0.3, top + ry * 3.3, cx + rx * 0.85, top + ry * 2.1, cx + rx, top); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(90,60,35,.35)'; g.lineWidth = 2; for(let i = 0; i < 7; i++){ const x = cx - rx * 0.7 + i * rx * 0.23; g.beginPath(); g.moveTo(x, top + ry * 0.8); g.quadraticCurveTo(x + 6, top + ry * (1.6 + (i % 3) * 0.3), x - 4, top + ry * (2.1 + (i % 2) * 0.5)); g.stroke(); }
  g.fillStyle = edge || '#6FAE55'; g.beginPath(); g.ellipse(cx, top + 5, rx, ry, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = grass || '#9AD47C'; g.beginPath(); g.ellipse(cx, top, rx, ry, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(cx - rx * 0.25, top - ry * 0.3, rx * 0.5, ry * 0.35, 0, 0, Math.PI * 2); g.fill(); }
function scCloud(g, x, y, r, a){ g.fillStyle = 'rgba(255,255,255,' + (a || 0.85) + ')'; [[0, 0, 1], [-0.9, 0.25, 0.7], [0.9, 0.25, 0.75], [0.35, -0.35, 0.7]].forEach(([dx, dy, rr]) => { g.beginPath(); g.arc(x + dx * r, y + dy * r, rr * r, 0, Math.PI * 2); g.fill(); }); }
function scSky(g, W, H, top, bot, night, t){
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, top); sky.addColorStop(1, bot); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  if(night){ for(let i = 0; i < 46; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.35 + 0.5 * Math.abs(Math.sin(t * 0.7 + i))) + ')'; g.fillRect((i * 97) % W, (i * 53) % (H * 0.55), 2, 2); }
    g.fillStyle = '#FFF6C8'; g.beginPath(); g.arc(W - 90, 58, 24, 0, Math.PI * 2); g.fill(); g.fillStyle = top; g.beginPath(); g.arc(W - 80, 52, 21, 0, Math.PI * 2); g.fill(); }
  else { const sg = g.createRadialGradient(W - 110, 60, 4, W - 110, 60, 70); sg.addColorStop(0, 'rgba(255,250,210,.95)'); sg.addColorStop(1, 'rgba(255,250,210,0)'); g.fillStyle = sg; g.beginPath(); g.arc(W - 110, 60, 70, 0, Math.PI * 2); g.fill();
    scCloud(g, W * 0.18, 52, 18, 0.8); scCloud(g, W * 0.52, 34, 14, 0.7); scCloud(g, W * 0.86, 120, 16, 0.6); }
  g.fillStyle = night ? 'rgba(60,60,110,.45)' : 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(0, H * 0.72); for(let x = 0; x <= W; x += W / 8) g.lineTo(x, H * 0.72 - 18 - Math.sin(x * 0.013) * 16); g.lineTo(W, H); g.lineTo(0, H); g.fill();   // hazy far hills
  [[0.08, 0.6, 26], [0.93, 0.5, 20]].forEach(([fx, fy, r]) => { scIsland(g, W * fx, H * fy, r, r * 0.3, night ? '#5E7A8A' : '#BFE3B0', night ? '#4C6576' : '#9CCB8C'); });   // little far islands
}
// 🎭 the stage tower picture at any size (the play tower; works with no match running)
function scTower(form, col, s, jail){ const keepG = G, keepS = VIEW.s; try{ G = {jail: !!jail}; VIEW.s = s; return stageTowerPic(form, col); } finally{ VIEW.s = keepS; G = keepG; } }   // jail = the 💒 wedding look (Jailbreak chapter)
const scForm = pS => pS >= 5 ? 2 : pS >= 3 ? 1 : 0;   // princess stage → tower form (wood · rose · crystal)
// 👸 + 🐉 + tower in one go: returns where things are
function scHeroGroup(g, o){
  const T = scTower(o.form != null ? o.form : scForm(o.pS), o.pS >= 3 ? o.pC : null, o.s, o.jail), ox = o.x - T.cx, oy = o.feet - T.base;
  g.drawImage(T.c, ox, oy, T.w, T.h);
  const fx = ox + T.cx, fy = oy + T.top, k = o.s / 52 * (o.pk || 1) * (o.pS >= 5 ? 0.88 : 1);   // the Sage hovers + carries a tall staff: a bit smaller so she stays inside the picture
  TDPrincess.draw(g, o.pS, o.pC, fx, fy, k, o.t, {act: o.pAct, dir: o.pDir || 1});
  if(T.front) g.drawImage(T.front, ox, oy, T.w, T.h);
  return {fx, fy, k, T, top: oy}; }
// 🏰 the wedding castle ("I OBJECT!!"): white walls, two round towers with pink cone roofs, bells, a balcony over the gate — returns the balcony spot (princess feet), the gate and a front layer (balcony railing)
function scCastle(g, cx, base, u, t){
  const W1 = '#FFFFFF', W2 = '#DCD2E4', R1 = '#FFB3D1', R2 = '#F06C9B', TR = '#FFD36B', kw = 200 * u, kh = 150 * u, tw = 54 * u, th = 168 * u;
  const lin = (x0, x1, a) => { const gr = g.createLinearGradient(x0, 0, x1, 0); a.forEach((c, i) => gr.addColorStop(i / (a.length - 1), c)); return gr; };
  g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(cx, base, kw * 0.75, 14 * u, 0, 0, Math.PI * 2); g.fill();
  // keep
  g.fillStyle = lin(cx - kw / 2, cx + kw / 2, [W2, W1, W1, W2]); g.fillRect(cx - kw / 2, base - kh, kw, kh);
  g.fillStyle = W2; for(let i = 0; i < 8; i++) g.fillRect(cx - kw / 2 + i * kw / 7.4, base - kh - 14 * u, 15 * u, 16 * u);
  g.strokeStyle = 'rgba(200,160,200,.25)'; g.lineWidth = 1.5; for(let y = base - kh + 14 * u; y < base; y += 14 * u){ g.beginPath(); g.moveTo(cx - kw / 2, y); g.lineTo(cx + kw / 2, y); g.stroke(); }
  // keep roof + heart flag
  g.fillStyle = R2; g.beginPath(); g.moveTo(cx - 46 * u, base - kh - 14 * u); g.lineTo(cx, base - kh - 70 * u); g.lineTo(cx + 46 * u, base - kh - 14 * u); g.fill();
  g.fillStyle = R1; g.beginPath(); g.moveTo(cx - 46 * u, base - kh - 14 * u); g.lineTo(cx, base - kh - 70 * u); g.lineTo(cx, base - kh - 14 * u); g.fill();
  emo(g, '💗', cx, base - kh - 82 * u, 22 * u);
  // two round towers
  [-1, 1].forEach(sd => { const x = cx + sd * (kw / 2 + tw * 0.15);
    g.fillStyle = lin(x - tw / 2, x + tw / 2, [W2, W1, W2]); g.fillRect(x - tw / 2, base - th, tw, th); g.beginPath(); g.ellipse(x, base, tw / 2, 7 * u, 0, 0, Math.PI); g.fill();
    g.fillStyle = TR; g.fillRect(x - tw / 2 - 3 * u, base - th - 4 * u, tw + 6 * u, 8 * u);
    g.fillStyle = sd < 0 ? R1 : R2; g.beginPath(); g.moveTo(x - tw / 2 - 6 * u, base - th - 2 * u); g.lineTo(x, base - th - 56 * u); g.lineTo(x + tw / 2 + 6 * u, base - th - 2 * u); g.fill();
    g.strokeStyle = '#7A4A6A'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, base - th - 56 * u); g.lineTo(x, base - th - 76 * u); g.stroke(); g.fillStyle = R2; g.beginPath(); g.moveTo(x, base - th - 76 * u); g.lineTo(x + 18 * u * sd, base - th - 70 * u); g.lineTo(x, base - th - 64 * u); g.fill();
    g.fillStyle = '#6A4AA0'; g.beginPath(); g.ellipse(x, base - th * 0.62, 6 * u, 10 * u, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FFE38A'; g.beginPath(); g.ellipse(x, base - th * 0.62 + 1, 3.6 * u, 7 * u, 0, 0, Math.PI * 2); g.fill();
    emo(g, '🔔', x, base - th + 26 * u, 24 * u); });
  // bunting between the towers
  g.strokeStyle = TR; g.lineWidth = 2; const bx0 = cx - kw / 2, bx1 = cx + kw / 2, by = base - kh + 6 * u; g.beginPath(); g.moveTo(bx0, by); g.quadraticCurveTo(cx, by + 26 * u, bx1, by); g.stroke();
  for(let i = 1; i < 10; i++){ const q = i / 10, x = bx0 + (bx1 - bx0) * q, y = by + 26 * u * 2 * q * (1 - q) * 2 * 0.5; g.fillStyle = i % 2 ? R2 : '#9FD8FF'; g.beginPath(); g.moveTo(x - 6 * u, y); g.lineTo(x + 6 * u, y); g.lineTo(x, y + 12 * u); g.fill(); }
  // gate (open, dark inside) + rose arch
  const gx = cx, gy = base, gw = 56 * u, gh = 74 * u; g.fillStyle = '#3A2A40'; g.beginPath(); g.moveTo(gx - gw / 2, gy); g.lineTo(gx - gw / 2, gy - gh + gw / 2); g.arc(gx, gy - gh + gw / 2, gw / 2, Math.PI, 0); g.lineTo(gx + gw / 2, gy); g.fill();
  g.strokeStyle = '#4E9A3A'; g.lineWidth = 3; g.beginPath(); g.arc(gx, gy - gh + gw / 2, gw / 2 + 6 * u, Math.PI, 0); g.stroke(); for(let i = 0; i <= 6; i++){ const a = Math.PI + i * Math.PI / 6; g.fillStyle = '#FF4D7A'; g.beginPath(); g.arc(gx + Math.cos(a) * (gw / 2 + 6 * u), gy - gh + gw / 2 + Math.sin(a) * (gw / 2 + 6 * u), 4 * u, 0, Math.PI * 2); g.fill(); }
  // balcony over the gate: floor drawn now, railing as a front layer
  const bY = base - kh + 54 * u; g.fillStyle = TR; g.beginPath(); g.ellipse(cx, bY, 50 * u, 12 * u, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FFF4F8'; g.beginPath(); g.ellipse(cx, bY - 2 * u, 46 * u, 10 * u, 0, 0, Math.PI * 2); g.fill();
  const front = document.createElement('canvas'); front.width = g.canvas.width; front.height = g.canvas.height; const f = front.getContext('2d'); f.setTransform(g.getTransform());
  f.strokeStyle = TR; f.lineWidth = 3; f.beginPath(); f.ellipse(cx, bY - 14 * u, 50 * u, 12 * u, 0, 0.15, Math.PI - 0.15); f.stroke(); for(let i = -4; i <= 4; i++){ const x = cx + i * 11 * u, y = bY + Math.sqrt(Math.max(0, 1 - Math.pow(i * 11 / 50, 2))) * 12 * u; f.beginPath(); f.moveTo(x, y - 2 * u); f.lineTo(x, y - 14 * u); f.stroke(); }
  f.fillStyle = R2; [-1, 1].forEach(sd => { f.beginPath(); f.arc(cx + sd * 50 * u, bY - 14 * u, 4 * u, 0, Math.PI * 2); f.fill(); });
  return {x: cx, y: bY, gx, gy, front}; }
// 🏰 the castle island — the King's wedding castle on its own little floating island, in the background of EVERY scene (Aowu 2026-11-17 11:27 "if there is a castle island it needs to be in all other scenes")
function scCastleIsland(g, x, y, u, t, night){
  scIsland(g, x, y, 150 * u, 30 * u, night ? '#7FA08A' : '#BFE3B0', night ? '#647F6E' : '#9CCB8C');
  const c = scCastle(g, x, y + 6 * u, u, t); g.drawImage(c.front, 0, 0);
}
// 🗼 the princess's tower on a far island (background of the "I OBJECT!!" page, which happens AT the castle)
function scTowerIsland(g, x, y, s, pS, pC, t){ scIsland(g, x, y, 4.2 * s, 0.85 * s, '#BFE3B0', '#9CCB8C'); const T = scTower(scForm(pS), pS >= 3 ? pC : null, s); g.drawImage(T.c, x - T.cx, y + 2 - T.base, T.w, T.h); if(T.front) g.drawImage(T.front, x - T.cx, y + 2 - T.base, T.w, T.h); }
function scDragon(g, o){ const out = {}; TDDragon.draw(g, o.dS, o.dS >= 3 ? o.dC : null, o.x, o.feet, o.k, o.t, {pose: o.pose || {}, dir: o.dir || 1, out, noShadow: !!o.noShadow}); return out; }
function scFlame(g, out, to, s, col, q, t){ if(!out.mouth || typeof flame !== 'function') return; const C = ({A: ['#FFF6B0', '#FF8A3D', '#E8341C'], B: ['#FFFFFF', '#8FC4FF', '#3A6BFF'], C: ['#FFF0C8', '#E8A65A', '#8A4A1C'], D: ['#FFFFE0', '#B6F5A0', '#22A867'], E: ['#FFF0FA', '#FF8FD0', '#B45AE8']})[col] || ['#FFF6B0', '#FF8A3D', '#E8341C'];
  const m = g.getTransform().inverse().transformPoint(new DOMPoint(out.mouth[0], out.mouth[1])); flame(g, [m.x, m.y], to, s, C, q, t); }

// 📔 the diary picture (840 × 300): replaces the old ride-on dragon + plain-dress princess
function drawDiaryPicture(cv, ch, when){
  if(S.book === 'farmer') return fdDiaryPic(cv, ch, when);   // 👨‍🌾 fd-1
  const g = cv.getContext('2d'), W = cv.width, H = cv.height, t = performance.now() / 1000, jail = ch === 'jail', key = jail ? 'jail' : when === 'ending' ? 'ending' : ch;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  const sk = DIARY_SKY[jail && when === 'outro' ? 6 : key] || DIARY_SKY[1];
  try{
    const Rd = atScale(60, () => readerSet());
    // 💍 Jailbreak + "I OBJECT!!" + the ending use the SAME page layout as the chapters: sky · far islands · floating island · centre tower with the Princess on top · Dragon on the right · cast left · reader right
    if(jail && when === 'intro'){   // ⛓️ dusk: the tower has turned into the 💒 wedding tower (the Princess on top, shy), the Dragon (your stage) sulks in a cage on the island, the groom + a guard march in
      const H0 = scHeroes(S.jail ? S.jail.ch : 1, 'built');
      scSky(g, W, H, '#7E7A92', '#E3D6EA', true, t); scCastleIsland(g, 212, 116, 0.3, t, true); scIsland(g, W / 2, H - 22, W * 0.47, 36, '#A9C79A', '#86A878');
      scHeroGroup(g, {x: W / 2 - 10, feet: H - 12, s: 46, pk: 1.2, pS: H0.pS || 1, pC: H0.pC, t, pAct: 'shy', jail: true});
      emo(g, '🔔', W / 2 - 92, 62, 34); emo(g, '🔔', W / 2 + 76, 62, 34);
      const cx = W / 2 + 200, cb = 252, cw = 150, ch2 = 150;   // 🐉 the cage
      g.fillStyle = 'rgba(46,42,58,.35)'; g.beginPath(); g.ellipse(cx, cb, cw * 0.55, 12, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(80,72,100,.25)'; g.fillRect(cx - cw / 2, cb - ch2, cw, ch2);
      const out = scDragon(g, {dS: H0.dS, dC: H0.dC, x: cx, feet: cb - 6, k: SC_DK[H0.dS] * 0.9, t, dir: -1, noShadow: true, pose: {hy: 5, ha: 0.5, lean: 0.12, wing: 0.55, ws: -0.1, tail: -0.1, shake: Math.sin(t * 1.3) > 0.85 ? 0.8 : 0, rise: -((TDDragon.STAGES[H0.dS] || {}).fly || 0) * 14}});
      g.fillStyle = '#2E2A3A'; for(let x = cx - cw / 2; x <= cx + cw / 2 + 1; x += cw / 6) g.fillRect(x - 4, cb - ch2, 8, ch2);
      g.fillRect(cx - cw / 2 - 8, cb - ch2 - 8, cw + 16, 12); g.fillRect(cx - cw / 2 - 8, cb - 6, cw + 16, 12);
      g.beginPath(); g.moveTo(cx - cw / 2 - 8, cb - ch2 - 6); g.quadraticCurveTo(cx, cb - ch2 - 46, cx + cw / 2 + 8, cb - ch2 - 6); g.lineWidth = 8; g.strokeStyle = '#2E2A3A'; g.stroke(); g.fillRect(cx - 3, cb - ch2 - 60, 6, 30);
      emo(g, '🎀', cx - 34, cb - 60, 34); emo(g, '😤', cx - 30, cb - ch2 + 30, 32); emo(g, '🔒', cx + cw / 2 - 4, cb - 70, 30); emo(g, '🔑', cx + 120, 286, 28);
      const Gr = diaryChar('groom', 0), K = diaryChar('kn', 1); paintChar(g, Gr, Gr.walk[Math.floor(t * 14) % 8], 120, 290, 120, false); emo(g, '💍', 152, 236, 30);
      paintChar(g, K, K.walk[Math.floor(t * 14 + 3) % 8], 215, 292, 110, false);
      paintChar(g, Rd, Rd.act('cheer')[Math.floor(t * 6) % 6], W - 46, 290, 104, true); return; }
    if(jail){   // 💥 "I OBJECT!!" — same layout, but the wedding happens in a 🏰 CASTLE: the Dragon (your stage) breathes REAL fire at the castle gate, the gate bursts, the Princess cheers from the balcony, the groom flies into the cake
      const H0 = scHeroes(S.jail ? S.jail.ch : 1, 'built');
      scSky(g, W, H, '#FFC6E0', '#FFF0F6', false, t); scTowerIsland(g, W - 80, 96, 9, H0.pS || 1, H0.pC, t); scIsland(g, W / 2, H - 22, W * 0.47, 36);
      const bal = scCastle(g, W / 2 - 10, H - 14, 1, t);
      TDPrincess.draw(g, H0.pS || 1, H0.pC, bal.x, bal.y, (H0.pS >= 5 ? 0.88 : 1) * 1.05, t, {act: 'cheer'});
      g.drawImage(bal.front, 0, 0);
      const out = scDragon(g, {dS: H0.dS, dC: H0.dC, x: W / 2 + 228, feet: 214, k: SC_DK[H0.dS] * 0.92, t, dir: -1, pose: scDPose('breath', 0.345, 1)});
      scFlame(g, out, [bal.gx + 8, bal.gy - 22], 46, H0.dS >= 3 ? H0.dC : 'A', 0.22, t); emo(g, '💥', bal.gx, bal.gy - 26, 62);
      g.fillStyle = '#5A3418'; g.save(); g.translate(bal.gx - 34, bal.gy + 4); g.rotate(-0.8); g.fillRect(-22, -42, 20, 42); g.restore(); g.save(); g.translate(bal.gx + 34, bal.gy + 4); g.rotate(0.8); g.fillRect(2, -42, 20, 42); g.restore();   // the gate doors fly off
      emo(g, '🧱', bal.gx + 50, bal.gy - 78, 20); emo(g, '🧱', bal.gx - 52, bal.gy - 70, 16); emo(g, '💫', 205, 205, 30);
      const Gr = diaryChar('groom', 0); paintChar(g, Gr, Gr.act('dizzy')[Math.floor(t * 6) % 6], 120, 286, 112, false); emo(g, '🎂', 120, 276, 58);
      g.save(); g.font = '900 48px Fredoka, Nunito, sans-serif'; g.textAlign = 'center'; g.lineJoin = 'round'; g.translate(150, 64); g.rotate(-0.07 + Math.sin(t * 6) * 0.02);
      g.lineWidth = 10; g.strokeStyle = '#2A1E3A'; g.strokeText('I OBJECT!!', 0, 0); g.fillStyle = '#FFD84D'; g.fillText('I OBJECT!!', 0, 0); g.restore();
      paintChar(g, Rd, Rd.act('cheer')[Math.floor(t * 6) % 6], W - 46, 290, 104, true); return; }
    if(when === 'ending'){   // 🏯 same layout, happily ever after: the crystal stage tower with the Sage on top, the Heart Dragon beside her (your colours), the dragon castle on a far island, tea with the suitors
      const H0 = scHeroes('ending', 'best');
      scSky(g, W, H, '#FF9E7A', '#FFE0B8', false, t);
      scCastleIsland(g, 170, 150, 0.5, t); emo(g, '💗', 170, 40, 26);   // 🏰 the same castle island — now the suitors come over for tea
      scIsland(g, W / 2, H - 22, W * 0.47, 36);
      scHeroGroup(g, {x: W / 2 - 10, feet: H - 12, s: 46, pk: 1.2, pS: H0.pS, pC: H0.pC, t, pAct: 'cheer', form: 2});
      scDragon(g, {dS: H0.dS, dC: H0.dC, x: W / 2 + 205, feet: 218, k: SC_DK[H0.dS] * 0.95, t, dir: -1, pose: scDPose('wing', t, 1.6)});
      emo(g, '❤️', W / 2 + 70, 40, 34);
      const K = diaryChar('kn', 0), Q = diaryChar('pr', 1); paintChar(g, K, K.still, 110, 290, 110, false); paintChar(g, Q, Q.still, 215, 292, 110, true);
      emo(g, '🫖', 163, 270, 34); emo(g, '☕', 125, 222, 22); emo(g, '☕', 200, 222, 22);
      paintChar(g, Rd, Rd.act('cheer')[Math.floor(t * 6) % 6], W - 46, 290, 104, true); return; }
    // 🏰 a normal chapter page: the floating island, the stage tower with the Princess on top, the Dragon beside it, this chapter's suitors (intro) or the boss in trouble (outro)
    const night = ch === 4, H0 = scHeroes(ch, when === 'outro' ? 'built' : 'story');
    scSky(g, W, H, sk[0], sk[1], night, t); scCastleIsland(g, 212, 116, 0.3, t, night); scIsland(g, W / 2, H - 22, W * 0.47, 36, ch === 5 ? '#C9D97A' : '#9AD47C', ch === 5 ? '#A9B95A' : '#6FAE55');
    scHeroGroup(g, {x: W / 2 - 10, feet: H - 12, s: 46, pk: 1.2, pS: H0.pS, pC: H0.pC, t, pAct: when === 'outro' ? 'cheer' : null});
    const dx = W / 2 + 200, dFeet = when === 'outro' ? 232 : 224;
    scDragon(g, {dS: H0.dS, dC: H0.dC, x: dx, feet: dFeet, k: SC_DK[H0.dS] * 0.95, t, dir: -1, pose: when === 'outro' ? scDPose('roar', 0.55, 2) : scDPose('wing', t, 1.4)});
    if(when === 'outro' && H0.dS >= 1) emo(g, '❤️', W / 2 + 60, 40, 34);
    if(when === 'intro'){ const [a, b] = DIARY_CAST[ch] || DIARY_CAST[1], K = diaryChar(a, 0, a.startsWith('boss') ? 100 : 84, a.startsWith('boss') ? 128 : 108), Q = diaryChar(b, 1);
      paintChar(g, K, K.walk[Math.floor(t * 14) % 8], 120, 290, a.startsWith('boss') ? 140 : 120, false); emo(g, TD.SUITORS[a].prop || '💐', 152, 232, 30);
      paintChar(g, Q, Q.walk[Math.floor(t * 14 + 3) % 8], 215, 292, 110, false); if(TD.SUITORS[b].front) emo(g, TD.SUITORS[b].front, 262, 278, 40);
      if(ch === 2 || ch === 3) emo(g, '👼', 70, 150, 46); if(ch === 4) emo(g, '🐭', 300, 280, 30); if(ch === 5) emo(g, '👑', 60, 140, 40); if(ch === 6) emo(g, '💘', 60, 140, 46); }
    else { const [bt, oops] = DIARY_OOPS[ch] || DIARY_OOPS[1], K = diaryChar(bt, 0, 100, 128); emo(g, '💫', 120, 150, 40); paintChar(g, K, K.act('dizzy')[Math.floor(t * 6) % 6], 120, 255, 120, false); emo(g, oops, 190, 220, 44); }
    paintChar(g, Rd, Rd.act('cheer')[Math.floor(t * 6) % 6], W - 80, 288, 112, true);
  }catch(e){ console.warn(e); }
}

// 🏁 result card picture (240 × 240): the heroes you REALLY built this match — win: the Dragon roars, the Princess cheers · lose: both droop, a 💍 floats
function scResultTick(c, o){ const g = c.getContext('2d'), t = performance.now() / 1000, W = c.width, H = c.height; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  g.save(); g.scale(W / 240, H / 240);
  const sky = g.createRadialGradient(120, 120, 10, 120, 120, 125); sky.addColorStop(0, o.won ? 'rgba(255,236,170,.85)' : 'rgba(205,200,225,.8)'); sky.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sky; g.fillRect(0, 0, 240, 240);
  scCastleIsland(g, 46, 92, 0.17, t, o.jail && !o.won);
  scIsland(g, 120, 206, 104, 20, o.jail && !o.won ? '#9C93AE' : '#9AD47C', o.jail && !o.won ? '#7E7690' : '#6FAE55');
  const dS = o.dS || 1, dk = SC_DK[dS] * 0.68, won = o.won;
  const pose = won ? scDPose('roar', t, 2.2) : {hy: 5, ha: 0.5, lean: 0.12, wing: 0.55, tail: -0.1};
  if(o.jail){ scDragon(g, {dS, dC: o.dC, x: 116, feet: 204, k: dk * 1.25, t, pose: won ? scDPose('breath', t, 1.8) : pose, dir: 1});
    if(!won){ g.fillStyle = 'rgba(46,42,58,.85)'; for(let x = 40; x < 210; x += 26) g.fillRect(x, 44, 7, 150); g.fillRect(34, 40, 182, 8); } }
  else { scDragon(g, {dS, dC: o.dC, x: 78, feet: 200, k: dk, t, pose, dir: 1});
    TDPrincess.draw(g, o.pS || 1, o.pC, 172, 210, 1.05, t, {act: won ? 'cheer' : 'dizzy', dir: -1}); }
  emo(g, won ? (o.jail ? '💥' : '💖') : (o.jail ? '⛓️' : '💍'), 120, 26, 30 + Math.sin(t * 4) * 2);
  g.restore(); }
function scResult(c, o){ if(!c) return; let alive = true; const tick = () => { if(!alive || !document.body.contains(c)) return; try{ scResultTick(c, o); }catch(e){ alive = false; return; } setTimeout(() => requestAnimationFrame(tick), 70); }; tick(); }

// 📚 shelf cover: your heroes on the book (last build — or the hatchling + tiara princess for a new book)
function scCover(c, row){ const g = c.getContext('2d'), W = c.width, H = c.height, t = performance.now() / 1000, b = scBuild(row), H0 = b.dS ? {dS: b.dS, dC: b.dC || SC_DEF.dragon, pS: b.pS || 1, pC: b.pC || SC_DEF.princess} : {dS: 1, dC: null, pS: 1, pC: null};
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.save(); g.scale(W / 200, H / 160);
  const gl = g.createRadialGradient(100, 86, 6, 100, 86, 96); gl.addColorStop(0, 'rgba(255,255,255,.5)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, 200, 160);
  scCastleIsland(g, 30, 74, 0.13, t);
  scIsland(g, 100, 146, 80, 13);
  scHeroGroup(g, {x: 78, feet: 150, s: 24, pk: 1.35, pS: H0.pS, pC: H0.pC, t, pAct: null});
  scDragon(g, {dS: H0.dS, dC: H0.dC, x: 150, feet: 118, k: SC_DK[H0.dS] * 0.42, t, dir: -1, pose: scDPose('wing', t, 1.6)});
  g.restore(); }
/* 🎬 TD SCENES (td-scenes) END */
/* ================= 🎮 PLAY ================= */
function startGame(ch, lvl, opt){
  if(S.book === 'farmer') return fdStart(ch, lvl, opt); fdLeave();   // 👨‍🌾 fd-1
  opt = opt || {}; S.chapter = ch; S.level = lvl; stopLoop(); hideResult(); S.jail = opt.jail ? {ch, lvl} : null;
  G = TD.newMatch({book: S.book, chapter: ch, level: lvl, auto: autoOn, jail: !!opt.jail, bonusHearts: opt.bonus || 0});
  act2Reset(); if(window.ActionFX) ActionFX.opts.shake = lvl > 0;   // 🎬 act-2 (🌱 Basic: no shake)
  G.breakLen = lvl === 0 ? 4 : 2.6; FT = []; guideUsed = 0; pickOpen = false; speedOn = false; G.speed = 1;
  if(UI.modeTried) UI.modeTried(S.player, GAME_ID, S.book);
  const L = LEVELS[lvl]; BAR.level(L.emoji + ' ' + L.name + ' · ' + (G.jail ? '💍 Jailbreak' : 'Ch ' + ch), L.hardcore ? 'hc' : '');
  paintAuto();
  $('speed-btn').textContent = '⏩'; $('goal').style.opacity = 1;
  $('goal').textContent = G.jail ? '💍 Hold off the guards until the bells stop — then crash the wedding!' : opt.bonus ? '💖 Second chance: +' + opt.bonus + ' ❤️ — keep the suitors away!' : '🏰 Keep the suitors away from the tower!';
  showScreen('play'); BAR.fit(); renderPanel(); layout(); BAR.fit(); fdZoomButtons(); hudTick(true);   // fd-1a2: 🤏 zoom in book 1 too
  last = 0; raf = requestAnimationFrame(loop);
  setTimeout(nextPick, FX ? 450 : 0);
}
function stopLoop(){ cancelAnimationFrame(raf); raf = 0; }
function leavePlay(){ stopLoop(); hideHand(); fdLeave(); goStop(); const s = document.querySelector('#scr-play .skk-sheet'); if(s) s.remove(); pickOpen = false; G = null; hideResult(); openBook(S.book); }
function toggleSpeed(){ if(!G) return; speedOn = !speedOn; G.speed = speedOn ? 2 : 1; $('speed-btn').textContent = speedOn ? '⏩×2' : '⏩'; $('speed-btn').classList.toggle('on', speedOn); UI.toast(speedOn ? '⏩ Double speed' : '▶ Normal speed'); }
function toggleAuto(){ autoOn = !autoOn; try{ localStorage.setItem('sp_td_auto:' + S.player, autoOn ? '1' : '0'); }catch(e){} if(G){ Object.keys(G.auto).forEach(k => { G.auto[k] = autoOn; }); }
  paintAuto(); UI.toast(autoOn ? '🤖 Skills go off by themselves' : '👆 You tap the skills'); }
function paintAuto(){ const b = $('auto-btn'); if(!b) return; b.textContent = autoOn ? '🤖 Auto ✅' : '🤖 Auto'; b.title = 'Auto skills: ' + (autoOn ? 'on' : 'off'); b.classList.toggle('on', autoOn); }
/* 🔔 fd-1e: goNow() lives in the GO BUTTONS block (the tap plays the hit, the wave starts on CONTACT) */

/* ---------- 📐 layout: stage square + hero panel; nothing ever scrolls ---------- */
function layout(){
  const sp = $('scr-play'); if(!sp || sp.classList.contains('hidden')) return;
  if(G && fdLayout()) return;   // 👨‍🌾 fd-1a2: phone layouts, both books (sideways: [plants left] · map · hero 3×2 / pet 3×2 right)
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
  if(G) fdZoomApply();   // 👨‍🌾 fd-1a2: 🤏 zoom / pan on every size, both books
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
  if(G && G.fd) return fdNextPick();   // 👨‍🌾 fd-1
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
  if(G && G.fd) return fdAfterPicks();   // 👨‍🌾 fd-1
  if(!G) return; if(G.state === 'break'){ const n = G.wave + 2, boss = G.C.waves[n - 1].some(g => TD.SUITORS[g[0]].boss);
    banner(boss ? '👑 BOSS WAVE: ' + TD.SUITORS[G.C.boss].name + '!' : '🌊 Wave ' + n + ' of ' + G.C.waves.length + ' — get ready!', boss ? 'bad' : ''); goShow();
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
  if(G.fd) return fdLoop(now);   // 👨‍🌾 fd-1
  const dt = last ? Math.min(0.1, Math.max(0, (now - last) / 1000)) : 0; last = now;
  const was = G.state; goAuto(); TD.step(G, dt);   /* 🔔 fd-1e: CONTACT starts the wave in this tick */
  if(was === 'break' && G.state === 'wave'){ goHide(); if(HAND === $('go-btn')) hideHand(); }
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
    act2Event(e);   // 🎬 act-2: moves start on 'windup', suitors' tricks, fizzles
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
  const set = {k, who, w, h, fx, fy, head: Math.max(10, -e.top * k), walk: [], acts: {}};
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
    o = o || {}; t = t || 0; const PS = o.pose || {}, S = STAGES[stage] || STAGES[1], C = COL[stage >= 3 && col ? col : '_'], K = k * S.sc, flap = PS.wing != null ? PS.wing : o.flap != null ? o.flap : Math.sin(t * 7);   // 🎬 act-2: o.pose = a move's pose
    const hover = S.fly ? (6 + S.fly * 14 + Math.sin(t * 3) * 2 * S.fly) : 0;
    g.save(); g.translate(x, feet); if(o.dir === -1) g.scale(-1, 1); g.lineJoin = 'round'; g.lineCap = 'round';
    // shadow
    if(!o.noShadow) g.fillStyle = 'rgba(0,0,0,.14)'; else g.fillStyle = 'rgba(0,0,0,0)'; g.beginPath(); g.ellipse(0, 0, S.bodyX * K * 1.1 / (1 + hover / 60), 5 * K, 0, 0, 7); g.fill();
    if(o.out) o.out.feet = pt(g, 0, 0);
    g.translate((PS.bx || 0) * K + (PS.shake ? Math.sin(t * 83) * PS.shake * K : 0), -(hover + (PS.rise || 0)) * K); if(PS.sy) g.scale(1 - PS.sy * 0.5, 1 + PS.sy);   // 🎬 recoil · shake · rise · squash
    if(S.aura){ const R = 80 * K, au = g.createRadialGradient(0, -24 * K, R * 0.15, 0, -24 * K, R); au.addColorStop(0, C[4] + '00'); au.addColorStop(0.6, C[4] + '55'); au.addColorStop(1, C[4] + '00'); g.fillStyle = au; g.beginPath(); g.arc(0, -24 * K, R, 0, 7); g.fill();
      for(let i = 0; i < 10; i++){ const a = i * 0.63 + t * 1.5, r = (40 + (i % 3) * 14) * K; star(g, -Math.abs(Math.cos(a)) * r - 10 * K, -24 * K + Math.sin(a) * r * 0.55, (2 + (i % 3)) * K, i % 2 ? '#FFFFFF' : '#FFE680'); } }
    const by = -(S.leg + S.bodyY) * K, bx = 0, ol = Math.max(1.6, 2.2 * K);
    if(PS.lean){ g.translate(0, by); g.rotate(PS.lean); g.translate(0, -by); }   // 🎬 + = leans toward the target
    const line = () => { g.strokeStyle = INK; g.lineWidth = ol; g.stroke(); };
    // wing (far side) — bat wing with finger bones, span by stage, flapping
    const wing = (side) => { if(S.wing <= 0) return; const sp = 30 * S.wing * K * (1 + (PS.ws || 0)), root = [bx - 2 * K, by - S.bodyY * 0.55 * K], rot = -0.15 + flap * 0.32 + (side ? 0 : -0.12), sq = 1 - Math.max(0, flap) * 0.25;
      const P = ([u, v]) => { const x = u * sp, y = v * sp * sq; return [root[0] + x * Math.cos(rot) - y * Math.sin(rot), root[1] + x * Math.sin(rot) + y * Math.cos(rot)]; };
      if(S.wing < 0.4){ const a = P([-0.2, -0.9]), b = P([-0.75, -0.35]), c = P([-0.25, 0.15]); if(side && o.out) o.out.wing = pt(g, b[0], b[1]); g.fillStyle = side ? C[2] : shade(C[2], 0.85); g.beginPath(); g.moveTo(root[0], root[1]); g.quadraticCurveTo(a[0], a[1], b[0], b[1]); g.quadraticCurveTo(c[0], c[1] - 2 * K, root[0] + 2 * K, root[1] + 3 * K); g.closePath(); g.fill(); line(); return; }
      const W = P([-0.32, -0.95]), F = [P([-1.05, -0.62]), P([-1.12, -0.12]), P([-0.78, 0.28])], H = P([-0.2, 0.2]), _o = side && o.out ? (o.out.wing = pt(g, F[0][0], F[0][1])) : 0, inw = (a, b) => { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; return [m[0] + (root[0] - m[0]) * 0.28, m[1] + (root[1] - m[1]) * 0.28]; };
      g.fillStyle = side ? C[2] : shade(C[2], 0.85); g.beginPath(); g.moveTo(root[0], root[1]); g.quadraticCurveTo(P([-0.05, -0.75])[0], P([-0.05, -0.75])[1], W[0], W[1]); g.lineTo(F[0][0], F[0][1]);
      let q = inw(F[0], F[1]); g.quadraticCurveTo(q[0], q[1], F[1][0], F[1][1]); q = inw(F[1], F[2]); g.quadraticCurveTo(q[0], q[1], F[2][0], F[2][1]); q = inw(F[2], H); g.quadraticCurveTo(q[0], q[1], H[0], H[1]); g.closePath(); g.fill(); line();
      g.strokeStyle = shade(C[0], 0.72); g.lineWidth = ol * 1.15; F.forEach(f => { g.beginPath(); g.moveTo(W[0], W[1]); g.lineTo(f[0], f[1]); g.stroke(); });   // finger bones
      g.fillStyle = C[3]; g.beginPath(); g.arc(W[0], W[1], 2.4 * K, 0, 7); g.fill(); F.forEach(f => { g.beginPath(); g.arc(f[0], f[1], 1.3 * K, 0, 7); g.fill(); }); };
    wing(0);
    // tail — longer each stage, curls up, spade tip
    const tl = S.tail * K, tx0 = bx - S.bodyX * 0.85 * K, ty0 = by + 2 * K;
    g.save(); if(PS.tail){ g.translate(tx0, ty0); g.rotate(PS.tail); g.translate(-tx0, -ty0); }   // 🎬 tail swipe: + = up, − = down
    g.beginPath(); g.moveTo(tx0, ty0 - 5 * K); g.bezierCurveTo(tx0 - tl * 0.5, ty0 - 2 * K, tx0 - tl * 0.8, ty0 + 6 * K, tx0 - tl, ty0 - tl * 0.25); g.lineTo(tx0 - tl + 1 * K, ty0 - tl * 0.25 + 3 * K);
    g.bezierCurveTo(tx0 - tl * 0.75, ty0 + 10 * K, tx0 - tl * 0.45, ty0 + 7 * K, tx0, ty0 + 6 * K); g.closePath(); g.fillStyle = C[0]; g.fill(); line();
    if(stage >= 2){ const sx = tx0 - tl, sy = ty0 - tl * 0.25; g.fillStyle = C[3]; g.beginPath(); g.moveTo(sx + 2 * K, sy); g.lineTo(sx - 6 * K, sy - 6 * K); g.lineTo(sx - 4 * K, sy + 3 * K); g.lineTo(sx + 2 * K, sy + 4 * K); g.closePath(); g.fill(); line(); }
    if(o.out) o.out.tail = pt(g, tx0 - tl, ty0 - tl * 0.25); g.restore();
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
    const nx = bx + S.bodyX * 0.7 * K, ny = by - S.bodyY * 0.35 * K, hx = nx + (6 + S.neck * 0.55 + (PS.hx || 0)) * K, hy = ny - (6 + S.neck - (PS.hy || 0)) * K, hr = 13 * S.head * K;
    if(S.neck > 0){ g.strokeStyle = INK; g.lineWidth = 12 * K + ol * 2; g.beginPath(); g.moveTo(nx, ny); g.quadraticCurveTo(nx + S.neck * 0.1 * K, hy + 4 * K, hx - hr * 0.3, hy); g.stroke(); g.strokeStyle = C[0]; g.lineWidth = 12 * K; g.stroke();
      if(S.belly){ g.strokeStyle = S.belly >= 3 ? '#FFE680' : C[1]; g.lineWidth = 4 * K; g.beginPath(); g.moveTo(nx + 4 * K, ny + 2 * K); g.quadraticCurveTo(nx + S.neck * 0.1 * K + 5 * K, hy + 6 * K, hx - hr * 0.1, hy + hr * 0.5); g.stroke(); } }
    if(o.out) o.out.chest = pt(g, bx + S.bodyX * 0.45 * K, by);
    g.save(); if(PS.ha){ g.translate(hx, hy); g.rotate(PS.ha); g.translate(-hx, -hy); }   // 🎬 head angle (− = up)
    if(S.mane){ g.fillStyle = C[3]; for(let i = 0; i < 5; i++){ const a = Math.PI * (0.75 + i * 0.12); g.beginPath(); g.ellipse(hx + Math.cos(a) * hr * 1.05, hy + Math.sin(a) * hr * 1.05, 5 * K, 2.6 * K, a, 0, 7); g.fill(); } }
    // horns (behind head) — none → nubs → curved → crown horns
    if(S.horn > 0){ const hl = 14 * S.horn * K; [[-0.35, 0.82], [0.05, 1]].forEach(([dx, sc]) => { const x0 = hx + dx * hr, y0 = hy - hr * 0.75; g.fillStyle = S.horn >= 1 ? '#FFF0C8' : C[3];
        g.beginPath(); g.moveTo(x0 - 3 * K, y0 + 2 * K); g.quadraticCurveTo(x0 - hl * 0.6 * sc, y0 - hl * 0.4 * sc, x0 - hl * 0.55 * sc, y0 - hl * sc); g.quadraticCurveTo(x0 - hl * 0.1, y0 - hl * 0.4 * sc, x0 + 3 * K, y0 + 1 * K); g.closePath(); g.fill(); line(); }); }
    g.fillStyle = C[0]; g.beginPath(); g.ellipse(hx, hy, hr, hr * 0.9, 0, 0, 7); g.fill(); line();                                                   // head
    const snL = hr * (0.55 + (stage - 1) * 0.08), mo = Math.max(o.breath ? 1 : 0, PS.mouth || 0), bOpen = mo * 0.35;
    g.beginPath(); g.ellipse(hx + hr * 0.75, hy + hr * 0.2, snL, hr * 0.48, -mo * 0.22, 0, 7); g.fill(); line();                                     // snout (longer each stage)
    if(mo > 0.04){ const ux = hx + hr * 0.78 + snL * 0.95, uy = hy + hr * (0.3 - 0.3 * mo), lx = hx + hr * 0.72 + snL * 0.85, ly = hy + hr * (0.5 + 0.8 * mo);   // 🎬 the jaw drops open with the move
      g.fillStyle = '#5A1E2A'; g.beginPath(); g.moveTo(hx + hr * 0.42, hy + hr * 0.36); g.lineTo(ux, uy); g.lineTo(lx, ly); g.closePath(); g.fill();
      g.fillStyle = '#FF7AA8'; g.beginPath(); g.ellipse(hx + hr * 0.6 + snL * 0.5, hy + hr * (0.42 + 0.35 * mo), snL * 0.32, hr * 0.12 * mo + 0.2, 0.3, 0, 7); g.fill();
      g.fillStyle = '#FFFFFF'; [0.45, 0.75].forEach(u => { const tx = hx + hr * 0.5 + (ux - hx - hr * 0.5) * u, ty = hy + hr * 0.36 + (uy - hy - hr * 0.36) * u; g.beginPath(); g.moveTo(tx - 1.6 * K, ty); g.lineTo(tx + 1.6 * K, ty); g.lineTo(tx, ty + 3 * K * mo); g.closePath(); g.fill(); });
      g.fillStyle = C[0]; g.beginPath(); g.ellipse(hx + hr * 0.62 + snL * 0.42, hy + hr * (0.58 + 0.42 * mo), snL * 0.78, hr * 0.24, 0.12 + mo * 0.5, 0, 7); g.fill(); line(); }
    if(o.out) o.out.mouth = pt(g, hx + hr * 0.75 + snL, hy + hr * (0.36 + 0.2 * mo));
    g.fillStyle = INK; g.beginPath(); g.arc(hx + hr * 0.75 + snL * 0.75, hy + hr * 0.05, 1.3 * K, 0, 7); g.fill();                                       // nostril
    const er = 4.2 * S.eye * K; g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(hx + hr * 0.22, hy - hr * 0.18, er, er * 1.15, 0, 0, 7); g.fill(); line();
    g.fillStyle = INK; g.beginPath(); g.arc(hx + hr * 0.3, hy - hr * 0.15, er * 0.6, 0, 7); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(hx + hr * 0.36, hy - hr * 0.28, er * 0.22, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,120,150,.4)'; g.beginPath(); g.ellipse(hx + hr * 0.1, hy + hr * 0.38, 3.4 * K, 2 * K, 0, 0, 7); g.fill();                    // blush
    if(S.shell){ g.fillStyle = '#FFF8E8'; g.beginPath(); g.moveTo(hx - hr * 0.9, hy - hr * 0.4); [[-0.6, -1.05], [-0.3, -0.75], [0, -1.12], [0.3, -0.78], [0.6, -1.0], [0.85, -0.5]].forEach(([a, b]) => g.lineTo(hx + a * hr, hy + b * hr)); g.quadraticCurveTo(hx, hy - hr * 0.55, hx - hr * 0.9, hy - hr * 0.4); g.fill(); line();
      g.fillStyle = '#C9A2FF'; g.beginPath(); g.arc(hx - hr * 0.2, hy - hr * 0.85, 1.6 * K, 0, 7); g.fill(); }                                             // eggshell hat
    if(S.mane){ g.strokeStyle = '#FFE680'; g.lineWidth = 1.6 * K; [[0.2, 1], [0.35, 1.25]].forEach(([dy, l]) => { g.beginPath(); g.moveTo(hx + hr * 0.7 + snL * 0.6, hy + hr * dy); g.quadraticCurveTo(hx + hr + snL * l, hy + hr * (dy + 0.4), hx + hr * 0.8 + snL * l, hy + hr * (dy + 1)); g.stroke(); }); }   // whiskers
    if(S.crown){ const cy = hy - hr * 0.95; g.fillStyle = '#FFD84D'; g.beginPath(); g.moveTo(hx - hr * 0.45, cy + 3 * K); [[-0.45, -4], [-0.22, 0], [0, -6], [0.22, 0], [0.45, -4]].forEach(([dx, dy]) => g.lineTo(hx + dx * hr, cy + dy * K)); g.lineTo(hx + hr * 0.45, cy + 3 * K); g.closePath(); g.fill(); line(); g.fillStyle = C[3]; g.beginPath(); g.arc(hx, cy - 1 * K, 1.8 * K, 0, 7); g.fill(); }
    g.restore();   // 🎬 head angle
    if(S.heart){ const cx2 = bx + S.bodyX * 0.45 * K, cy2 = by - 1 * K, hg = g.createRadialGradient(cx2, cy2, 0, cx2, cy2, 12 * K); hg.addColorStop(0, 'rgba(255,255,255,.95)'); hg.addColorStop(1, 'rgba(255,120,190,0)'); g.fillStyle = hg; g.beginPath(); g.arc(cx2, cy2, 12 * K, 0, 7); g.fill(); heart(g, cx2, cy2, 5.5 * K, '#FF4D8D'); }
    wing(1);   // near wing over the body
    g.restore();
  }
  function pt(g, x, y){ const T = g.getTransform(); return [T.a * x + T.c * y + T.e, T.b * x + T.d * y + T.f]; }   // 🎬 a point → device pixels (the page maps it back)
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
/* ================= 🎬 act-2 — REAL MOVES (🏰 TD-Stories chat, 2026-11-17, plan §iso-2 🎬 row) =================
   The game fires on CONTACT: TD.cast queues the skill → 'windup' event (engine time `at` = its contact) → the hero plays its
   move on the shared 🎬 beat timeline (Acting.play, contactAt = at, clock = G.t so a pause / pick freezes it too) → at `at`
   the engine really casts. Every move = ready → anticipation (the opposite move first) → CONTACT → follow-through → settle.
   🐉 TDDragon (own painter) — pose fields lean · hx / hy (head) · ha (head angle) · mouth · wing (flap) · ws (spread) · tail · sy · rise · bx · shake:
     breath (head pulls back → LUNGE + fire from the MOUTH → recoil) · spit (fireball) · sky (fire up into the sky) · wing (wing beat) · roar · tail (tail swipe)
   👸 TDPrincess (an AvatarKit avatar) — one 🎬 ActionFX / 🎭 actions-block move per skill (TD.TD_MOVES.princess = skin.act → SkillKit.actionOf)
   🤴 suitors — their trick: 'trickWind' → wind-up → contact = the skill; tricks that answer the world (charge, ladder, flower bomb, chocolate) play from contact. */
const DMOVES = {   // 5 beats: ready · anticipation · CONTACT · follow-through · settle  ({ms, ease, pose}) — dragon units (the princess ≈ 90 tall)
  breath: [{ms: 60, pose: {}},
           {ms: 220, ease: 'cubicOut', pose: {hx: -7, hy: -5, ha: -0.3, sy: 0.09, lean: -0.14, wing: -0.35, mouth: 0.05}},   // 🫁 breathes in: head pulls back + up, chest puffs
           {ms: 70, pose: {hx: 10, hy: 3, ha: 0.2, mouth: 1, lean: 0.16, sy: -0.06, wing: 0.35, ws: 0.15}, contact: true},      // 🔥 LUNGE — fire leaves the mouth
           {ms: 300, ease: 'backOut', pose: {hx: -4, hy: -1, ha: -0.12, mouth: 0.85, bx: -6, lean: -0.1, wing: 0.1}},              // ↩️ recoil: the blast pushes the head + body back
           {ms: 180, pose: {mouth: 0.15}}],
  spit:   [{ms: 40, pose: {}},
           {ms: 150, ease: 'cubicOut', pose: {hx: -5, hy: -3, ha: -0.18, sy: 0.05, lean: -0.08}},
           {ms: 60, pose: {hx: 7, hy: 2, ha: 0.14, mouth: 0.9, lean: 0.1}, contact: true},
           {ms: 190, ease: 'backOut', pose: {hx: -2, mouth: 0.35, bx: -2.5, lean: -0.03}},
           {ms: 120, pose: {}}],
  sky:    [{ms: 60, pose: {}},
           {ms: 240, ease: 'cubicOut', pose: {hx: -3, hy: 4, ha: 0.35, sy: 0.12, lean: 0.12, wing: 0.4}},                     // crouches, head down
           {ms: 80, pose: {hx: 5, hy: -9, ha: -0.75, mouth: 1, lean: -0.3, sy: -0.08, wing: -0.9, ws: 0.3, rise: 4}, contact: true},  // 🔥 fire straight up
           {ms: 340, ease: 'backOut', pose: {hx: 3, hy: -6, ha: -0.55, mouth: 0.8, lean: -0.2, wing: -0.4, ws: 0.15, rise: 2}},
           {ms: 200, pose: {mouth: 0.1}}],
  wing:   [{ms: 50, pose: {wing: 0}},
           {ms: 230, ease: 'cubicOut', pose: {wing: -1.15, ws: 0.3, rise: 5, sy: 0.07, lean: -0.12, hy: -2}},                  // wings up HIGH, body rises
           {ms: 80, pose: {wing: 1.05, ws: 0.4, rise: -3, sy: -0.09, lean: 0.14, hy: 2}, contact: true},                       // 💨 the big down beat
           {ms: 270, ease: 'backOut', pose: {wing: -0.45, ws: 0.12, rise: 6, lean: -0.04}},
           {ms: 170, pose: {wing: 0}}],
  roar:   [{ms: 60, pose: {}},
           {ms: 250, ease: 'cubicOut', pose: {hx: -5, hy: 3, ha: 0.4, sy: 0.11, lean: 0.12, mouth: 0.1, wing: -0.2}},          // head down, draws in a big breath
           {ms: 90, pose: {hx: 6, hy: -7, ha: -0.5, mouth: 1, ws: 0.4, wing: -0.95, lean: -0.16, shake: 1.6}, contact: true, stop: 50},   // 🦁 ROAR
           {ms: 430, ease: 'sineOut', pose: {hx: 4, hy: -5, ha: -0.35, mouth: 0.9, shake: 1, wing: -0.6, ws: 0.3, lean: -0.1}},
           {ms: 200, pose: {mouth: 0.1}}],
  tail:   [{ms: 50, pose: {tail: 0}},
           {ms: 230, ease: 'cubicOut', pose: {tail: 1.15, lean: 0.12, bx: 2.5, sy: 0.06, hx: -2}},                            // tail swings up high behind
           {ms: 70, pose: {tail: -0.42, lean: -0.14, bx: -2.5, sy: -0.07, hx: 2}, contact: true},                             // 💥 SWIPE down — the hit
           {ms: 280, ease: 'backOut', pose: {tail: -0.2, lean: -0.05}},
           {ms: 180, pose: {tail: 0}}]};
(function(){ if(!window.Acting || !Acting.add) return; const acts = {};
  Object.keys(DMOVES).forEach(m => { acts['td.dragon.' + m] = {beats: DMOVES[m].map(b => ({pose: {}, ms: b.ms, ease: b.ease, contact: !!b.contact, stop: b.stop || 0})), tags: ['td', 'dragon']}; });
  Acting.add({acts}, {by: 'TD-Stories chat', block: 'td-act2', game: 'td-stories', date: '2026-11-17'}); })();
// 🤴 each suitor's trick (their own move; the thing they throw = their prop)
const TRICK_ACT = {cu: 'act.shoot', pr: 'move.throw.lob', wz: 'move.cast.orbthrow', kg: 'move.cast.raise', gc: 'move.throw.double', sq: 'move.jump.rising', kn: 'move.defend.bash',
  boss1: 'move.throw.overhand', boss2: 'move.power.aura', boss3: 'move.cast.wide', boss4: 'move.cast.spin', boss5: 'move.cast.raise', boss6: 'move.cast.skycall', groom: 'move.throw.overhand'};
const EL_OF = {fire: 'fire', lava: 'fire', ice: 'ice', storm: 'zap', nature: 'nature', thorn: 'nature', blossom: 'nature', honey: 'light', holy: 'light', sun: 'light', gold: 'light', star: 'light',
  shadow: 'shadow', ghost: 'shadow', dream: 'shadow', cosmic: 'shadow', moon: 'shadow', love: 'candy', candy: 'candy', rose: 'candy', paper: 'light', water: 'water', bubble: 'water', crystal: 'ice', music: 'candy', goo: 'nature', rainbow: 'candy', wind: 'water', rock: 'fire', steel: 'light'};
const HACT = {dragon: null, princess: null}, SACT = {}, DM = {}, PZ = {x: 0, y: 0, k: 1};
function act2Reset(){ HACT.dragon = HACT.princess = null; Object.keys(SACT).forEach(k => delete SACT[k]); if(window.ActionFX) ActionFX.clear(); }
const actNow = () => G ? G.t : 0;
// the dragon's pose at a moment: Acting.play keeps the beat clock (contactAt, hit-stop) → we blend TDDragon's own fields with the beat's ease
function dPoseAt(A, t){ const f = A.run.at(t), B = DMOVES[A.move], i = f.i, cur = B[i].pose, prev = i ? B[i - 1].pose : (A.from || {}),
    nm = ['ready', 'anticipation', 'contact', 'follow', 'settle'][i], e = Acting.ease(B[i].ease || (Acting.DEF_EASE && Acting.DEF_EASE[nm]) || 'quadInOut'), q = e(f.q), P = {};
  Object.keys(prev).concat(Object.keys(cur)).forEach(k => { if(k in P) return; const a = prev[k] || 0, b = cur[k] || 0; P[k] = a + (b - a) * q; });
  return {pose: P, f}; }
function act2Event(e){
  if(!G) return;
  if(e.k === 'windup' && e.hero === 'dragon' && DMOVES[e.move] && window.Acting){
    const now = actNow(), old = HACT.dragon, from = old && !old.done ? (old.last || {}) : {};
    const run = Acting.play({name: 'Dragon'}, 'td.dragon.' + e.move, {t0: now, contactAt: e.at, onContact: r => dragonContact(HACT.dragon && HACT.dragon.run === r ? HACT.dragon : null)});
    HACT.dragon = {run, move: e.move, key: e.key, basic: !!e.basic, aim: e.aim, from, t0: now, at: e.at, tail: []}; return; }
  if(e.k === 'windup' && e.hero === 'princess' && window.Acting){
    const mv = e.basic ? TD.TD_MOVES.princess._basic : (SkillKit.actionOf(G.trees.princess.pack.get(e.key)) || 'move.cast.bolt'), st = heroStage('princess'), col = heroCol('princess');
    const dir = e.aim && IX(e.aim.x, e.aim.y) < IX(TD.CX, TD.CY) - 1 ? -1 : 1, who = {name: 'Princess', av: TDPrincess.av(st, col), dir};
    const L = skillLook(e.basic ? null : {hero: 'princess', key: e.key}, 'swat'), el = EL_OF[L.key] || 'candy';
    const run = Acting.play(who, mv, {t0: actNow(), contactAt: e.at, onContact: r => fxAt(mv, PZ.x, PZ.y, PZ.k, dir, el, r.contactT, !e.basic)});
    HACT.princess = {run, mv, key: e.key, basic: !!e.basic, dir, at: e.at}; return; }
  if((e.k === 'trickWind' || e.k === 'suitorSkill') && e.id != null){
    const x = G.enemies.find(q => q.id === e.id); if(!x || x.gone) return; const mv = TRICK_ACT[x.type]; if(!mv || !window.Acting) return;
    if(e.k === 'suitorSkill' && SACT[e.id] && !SACT[e.id].done) return;   // it wound up already → this is its contact
    const at = e.k === 'trickWind' ? e.at : actNow();   // a trick that answers the world plays from its contact
    SACT[e.id] = {run: Acting.play({name: 'suitor'}, mv, {t0: actNow(), contactAt: at, onContact: r => { const A = SACT[e.id]; if(A && A.at) fxAt(mv, A.at[0], A.at[1], A.at[2], A.at[3], 'candy', r.contactT, false); }}), mv, done: false}; return; }
  if(e.k === 'fizzle') floatText(e.hero === 'dragon' ? G.heroes.dragon.x : TD.CX, (e.hero === 'dragon' ? G.heroes.dragon.y : TD.CY) - 1, '💨', '#7A5C88', 0.7);
}
// 🎬 an ActionFX contact effect at the act's hit point (the move's own feeling), quiet for auto attacks
function fxAt(mv, x, y, k, dir, el, t, loud){ if(!window.ActionFX || !FX) return; const A = Acting.act && Acting.act(mv); const fx = A && A.fx; if(!fx || !ActionFX.style(fx.key)) return;
  const p = fx.at || [20, -38]; ActionFX.at(fx.key, {x: x + p[0] * k * dir, y: y + p[1] * k, k, dir, element: el, t, sound: !!loud, shake: !!loud}); }
// 🐉 what the dragon's move does at contact (sound + an extra punch for roar / tail)
function dragonContact(A){ if(!A || !FX) return; const s = VIEW.s;
  if(A.move === 'roar'){ SHAKE = Math.max(SHAKE, 0.22); try{ UISound.play('boom'); }catch(e){} }
  if(A.move === 'tail' && DM.tail && window.ActionFX) ActionFX.at('jump.pound', {x: DM.tail[0], y: DM.tail[1], k: s / 60, dir: A.dir || 1, t: actNow(), sound: !A.basic});
  if(A.move === 'wing'){ try{ UISound.play('whoosh'); }catch(e){} } }
// called by drawDragonHero: pose + facing while a move plays
function act2Dragon(o, x){ const A = HACT.dragon; if(!A) return; const t = actNow(), P = dPoseAt(A, t); A.last = P.pose; if(P.f.done){ HACT.dragon = null; return; }
  o.pose = P.pose; if(A.aim){ const ax = IX(A.aim.x, A.aim.y); A.dir = A.move === 'sky' ? (o.dir || 1) : ax < x - 2 ? -1 : 1; o.dir = A.dir; } A.f = P.f; }
// called by drawDragonHero after painting: anchors (mouth / tail / wing / chest) back into page pixels
function act2DragonOut(g, o){ if(!o.out) return; const m = g.getTransform().inverse(); Object.keys(o.out).forEach(k => { const p = m.transformPoint(new DOMPoint(o.out[k][0], o.out[k][1])); DM[k] = [p.x, p.y]; });
  const A = HACT.dragon; if(A && A.move === 'tail' && DM.tail){ A.tail.push([DM.tail[0], DM.tail[1], actNow()]); if(A.tail.length > 12) A.tail.shift(); } }
// 👸 called by drawTower: her frame + where she stands (for the contact effect)
function act2Princess(o, x, feet, k, st){ const S = TDPrincess.STAGES[st] || TDPrincess.STAGES[1], kk = k * S.sc; PZ.x = x; PZ.y = feet - (S.lift || 0) * kk; PZ.k = kk;
  const A = HACT.princess; if(!A) return; const f = A.run.at(actNow()); if(f.done){ HACT.princess = null; return; } if(f.prop) delete f.prop; o.act = f; o.dir = A.dir; }
// 🤴 called by drawSuitor: a suitor doing their trick is drawn live (everyone else stays cached pictures)
function act2Suitor(g, e, set, x, fy, w, flip, alpha, t){ const A = SACT[e.id]; if(!A) return false; if(e.gone){ delete SACT[e.id]; return false; }
  const f = A.run.at(actNow()); if(f.done){ A.done = true; delete SACT[e.id]; return false; } const sc = w / set.w, k = set.k * sc, dir = flip ? -1 : 1;
  A.at = [x, fy, k, dir]; if(f.prop) f.prop = Object.assign({}, f.prop, {ch: e.S.prop || f.prop.ch});
  g.save(); g.globalAlpha = alpha; Acting.draw(g, Object.assign({}, set.who, {dir}), x, fy, k, f, {t, dir}); g.restore(); return true; }
// ✨ the dragon's move effects in the air: 🔥 fire from the mouth · 🦁 roar rings · 💨 wing gust · 💫 tail trail — and the ActionFX layer
function act2Air(g, s, t){
  const now = actNow(), A = HACT.dragon;
  if(A && FX){ const ct = A.run.contactT, since = now - ct, L = skillLook(A.basic ? null : {hero: 'dragon', key: A.key}, A.move === 'breath' || A.move === 'sky' ? 'cone' : 'push'), C = L.c || ['#FFF6B0', '#FF8A3D', '#E8341C'];
    if((A.move === 'breath' || A.move === 'sky') && DM.mouth && since >= 0 && since < 0.5){
      const m = DM.mouth, to = A.move === 'sky' ? [m[0] + (A.dir || 1) * s * 0.6, m[1] - s * 4.2] : A.aim ? [IX(A.aim.x, A.aim.y), IY(A.aim.x, A.aim.y, 0.3)] : [m[0] + (A.dir || 1) * s * 3, m[1] + s];
      flame(g, m, to, s, C, since / 0.5, t); }
    if(A.move === 'roar' && DM.mouth && since >= 0 && since < 0.7){ const m = DM.mouth, d = A.dir || 1;
      for(let i = 0; i < 3; i++){ const q = since / 0.7 - i * 0.16; if(q <= 0 || q >= 1) continue; const r = s * (0.4 + q * 2.6); g.strokeStyle = 'rgba(255,255,255,' + (0.85 * (1 - q)).toFixed(3) + ')'; g.lineWidth = s * 0.09 * (1 - q * 0.6); g.lineCap = 'round';
        g.beginPath(); g.arc(m[0], m[1], r, d > 0 ? -0.75 : Math.PI - 0.75, d > 0 ? 0.75 : Math.PI + 0.75); g.stroke(); g.strokeStyle = C[1]; g.globalAlpha = 0.6 * (1 - q); g.lineWidth = s * 0.04; g.stroke(); g.globalAlpha = 1; } }
    if(A.move === 'wing' && DM.wing && since >= 0 && since < 0.45){ const q = since / 0.45, w = DM.wing, d = A.dir || 1;
      g.lineCap = 'round'; for(let i = 0; i < 3; i++){ const y0 = w[1] + s * (0.3 + i * 0.35) + q * s * 0.9, x0 = w[0] - d * s * 0.2 * i; g.strokeStyle = 'rgba(255,255,255,' + (0.8 * (1 - q)).toFixed(3) + ')'; g.lineWidth = s * 0.07;
        g.beginPath(); g.moveTo(x0 - s * 0.9, y0); g.quadraticCurveTo(x0, y0 + s * 0.35, x0 + s * 0.9, y0); g.stroke(); }
      if(DM.feet){ for(let i = 0; i < 6; i++){ const a = i / 6 * Math.PI * 2, r = s * (0.3 + q * 1.4); g.fillStyle = 'rgba(255,255,255,' + (0.45 * (1 - q)).toFixed(3) + ')'; g.beginPath(); g.ellipse(DM.feet[0] + Math.cos(a) * r, DM.feet[1] + Math.sin(a) * r * V25.K, s * 0.22 * (1 - q * 0.5), s * 0.13 * (1 - q * 0.5), 0, 0, 7); g.fill(); } } }
    if(A.move === 'tail' && A.tail.length > 1){ const pts = A.tail.filter(p => now - p[2] < 0.18 && p[2] >= ct - 0.12); if(pts.length > 1){ g.lineCap = 'round'; g.lineJoin = 'round';
      for(let i = 1; i < pts.length; i++){ const a = 1 - (now - pts[i][2]) / 0.18; g.strokeStyle = 'rgba(255,240,180,' + Math.max(0, a * 0.9).toFixed(3) + ')'; g.lineWidth = s * 0.16 * a; g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke(); } } } }
  if(window.ActionFX && FX) ActionFX.draw(g, now);
}
// 🔥 a tapered flame jet from the mouth (look colours core → main → deep), licking + flickering blobs
function flame(g, m, to, s, C, q, t){ const dx = to[0] - m[0], dy = to[1] - m[1], L = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx), reach = Math.min(1, q * 3.2), fade = q < 0.6 ? 1 : 1 - (q - 0.6) / 0.4, len = L * reach;
  g.save(); g.translate(m[0], m[1]); g.rotate(a); g.globalAlpha = fade;
  const gr = g.createLinearGradient(0, 0, len, 0); gr.addColorStop(0, C[0]); gr.addColorStop(0.35, C[1]); gr.addColorStop(1, C[2] + '00');
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, -s * 0.06); for(let i = 0; i <= 10; i++){ const u = i / 10, w = s * (0.08 + u * 0.55) * (1 + Math.sin(t * 40 + i * 1.7) * 0.12); g.lineTo(len * u, -w); }
  for(let i = 10; i >= 0; i--){ const u = i / 10, w = s * (0.08 + u * 0.55) * (1 + Math.sin(t * 37 + i * 2.3) * 0.12); g.lineTo(len * u, w); } g.closePath(); g.fill();
  for(let i = 0; i < 7; i++){ const u = ((t * 2.6 + i * 0.37) % 1) * reach, r = s * (0.07 + u * 0.32); g.fillStyle = i % 2 ? C[0] : C[1]; g.globalAlpha = fade * (1 - u) * 0.9; g.beginPath(); g.arc(L * u, Math.sin(t * 23 + i) * s * 0.12 * u, r, 0, 7); g.fill(); }
  g.restore(); g.globalAlpha = 1; }
// 🔥 fire / bolts the dragon spits start at its MOUTH (the first frame of a dragon-made effect remembers where the mouth was)
function act2FxFrom(f, spec){ if(!f.mk){ f.mk = 1; const hd = G.heroes.dragon; if(DM.mouth && f.x2 != null && Math.abs(f.x - hd.x) + Math.abs(f.y - hd.y) < 1e-6 && (f.k === 'fireball' || (f.sk && f.sk.hero === 'dragon'))) f.m = DM.mouth.slice(); }
  if(f.m){ spec.x = f.m[0]; spec.y = f.m[1]; } return spec; }
/* ================= 🏝️ iso-2 (iso2-b): TD-Stories on the IsoKit island (🏰 TD-Stories chat, 2026-11-17, plan §iso-2) =================
   Diamond projection (same as IsoKit): IX(x, y) / IY(x, y, z) · ground things in world units through groundTf (an affine map) ·
   the island = an IsoKit map (void outside, fading edge cells) baked into the background once per chapter + time of day ·
   🌄 own sky (gradient · sun / moon · hazy hills · far castle · clouds · birds · valley mist) · 🌅 storybook day: morning → dusk (halfway) → night (last wave) ·
   🏮 lanterns along the roads light up at dusk, fireflies at night · 🎭 the tower has a round STAGE on top · 🐉 TDDragon + 👸 TDPrincess: 5 SHAPE stages
   on tiers 1 · 3 · 5 · 7 · 10, coloured by the main skill colour from tier 5, ✨ 1.2 s morph moment when a stage changes (🌱 Basic: 0.6 s, no flash). */
const ISO = {A: 10, B: 5, OX: 0, OY: 0, zi: 0.3, O: 5, N: 26, key: '', M: null, lanterns: [], fly: [], rq: 0, rc: 1, rs: 0, rcx: 0, rcy: 0};   // 🔄 fd-1d: rq = the view is turned (rc / rs = cos / sin round rcx, rcy)
function setIso(){ const s = VIEW.s; ISO.A = s / Math.SQRT2; ISO.B = ISO.A / 2; ISO.zi = ISO.A / 32; ISO.OX = VIEW.px / 2; ISO.OY = (V25.TOP + V25.R / 2) * s - (TD.CX + TD.CY) * ISO.B; }
const IX = (x, y) => ISO.rq ? ISO.OX + ((ISO.rc - ISO.rs) * (x - ISO.rcx) - (ISO.rs + ISO.rc) * (y - ISO.rcy)) * ISO.A : ISO.OX + (x - y) * ISO.A,
  IY = (x, y, z) => (ISO.rq ? ISO.OY + (ISO.rcx + ISO.rcy + (ISO.rc + ISO.rs) * (x - ISO.rcx) + (ISO.rc - ISO.rs) * (y - ISO.rcy)) * ISO.B : ISO.OY + (x + y) * ISO.B) - (z || 0) * V25.Z * VIEW.s;   // 🔄 fd-1d
function groundTf(g, sx, sy){ const d = VIEW.dpr; if(ISO.rq){ const c = ISO.rc, n = ISO.rs, a = ISO.A * (c - n), b = ISO.B * (c + n), cc = -ISO.A * (n + c), dd = ISO.B * (c - n);   // 🔄 fd-1d
    g.setTransform(d * a, d * b, d * cc, d * dd, d * (ISO.OX + (sx || 0) - a * ISO.rcx - cc * ISO.rcy), d * (ISO.OY + (sy || 0) + ISO.B * (ISO.rcx + ISO.rcy) - b * ISO.rcx - dd * ISO.rcy)); return; }
  g.setTransform(d * ISO.A, d * ISO.B, -d * ISO.A, d * ISO.B, d * (ISO.OX + (sx || 0)), d * (ISO.OY + (sy || 0))); }   // draw in world units on the ground
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
function drawBG(){ setIso(); if(G) fdZoomApply(); TOD.bgs = [null, null, null]; TOD.v = TOD.want = todWant(); TOD.bgs[Math.round(TOD.v)] = bakeBG(Math.round(TOD.v)); BG = TOD.bgs[Math.round(TOD.v)]; TOWER_PIC = null; ISO.fly = []; }
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
  return {c, front, w, h, base: base + ry, top, cx, SR, sry, form, col, L, s, jail: !!(G && G.jail)};
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
  act2Princess(o, fx - s * 0.12, fy + T.sry * 0.1, k, st);   // 🎬 act-2: her move
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
  const x = IX(hd.x, hd.y), feet = IY(hd.x, hd.y, lift), q = morphQ('dragon'), o = {dir: hd.face || 1, noShadow: true, out: {}};
  act2Dragon(o, x);   // 🎬 act-2: the move's pose + it faces its target
  if(q >= 0){ g.save(); if(o.dir < 0){ g.translate(x, 0); g.scale(-1, 1); g.translate(-x, 0); } TDDragon.morph(g, MORPH.dragon.from, MORPH.dragon.to, col, x, feet, k, q, t); g.restore(); }
  else { g.globalAlpha = hd.dazeT > 0 ? 0.75 : 1; TDDragon.draw(g, st, col, x, feet, k, t, o); g.globalAlpha = 1; act2DragonOut(g, o); }
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
  if(window.ActionFX && FX){ const sh = ActionFX.shake(actNow()); sx += sh.x; sy += sh.y; }   // 🎬 act-2
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
  act2Air(g, s, t);   // 🎬 act-2: fire from the mouth, roar rings, wing gust, tail trail + ActionFX
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
  if(!act2Suitor(g, e, set, IX(e.x, e.y), fy, w, flip, alpha, t)) drawPic(g, pic, IX(e.x, e.y), fy, w, h, flip, 0, alpha, set);   // 🎬 act-2: a trick is drawn live
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
  const p = Math.min(1, f.t / f.dur), spec = act2FxFrom(f, d[1](f, s)), L = skillLook(f.sk, f.k), seed = f.seed || (f.seed = 1 + Math.random() * 99);
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
  if(!G) return; if(G.fd) return fdFinish(); if(G.jail) return finishJail(); stopLoop(); hideHand(); const won = G.state === 'won', L = LEVELS[G.lvl], ch = G.C.n, lvl = G.lvl;
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
  try{ scResult($('res-cv'), {won, dS: TDDragon.stageOf(dT.tier), dC: dT.main || null, pS: TDPrincess.stageOf(pT.tier), pC: pT.main || null}); }catch(e){}   // 🎬 td-scenes: the heroes you really built
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
  try{ scResult($('res-cv'), {won, jail: true, dS: TDDragon.stageOf(dT.tier), dC: dT.main || null}); }catch(e){}   // 🎬 td-scenes: your dragon, caged or free
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
function boardId(){ return BOOK(S.book).board; }   // fd-1: td-farmer for book 2
function flushPending(){ const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))).saveLevelResult(w.board || 'td-draprincess', w.name, w.lvl, w.extra)); }
function saveWin(lvlIdx, extra, tries){
  tries = tries || 0; const name = S.player, board = boardId();
  const PM = progMap(), p = PM[name] || (PM[name] = {unlocked: 0, tokens: [], best: []});
  if(extra.cleared) p.unlocked = Math.max(p.unlocked, lvlIdx + 1);
  google.script.run.withSuccessHandler(res => {
      const best = (p.best || []).slice(); if(res.best) best[lvlIdx] = res.best;
      PM[name] = {unlocked: res.unlocked, tokens: res.tokens, best}; flushPending();
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

/* ================= 👨‍🌾 FARMER DELUSION (book 2) — page (fd-1, 🏰 TD-Stories chat 2026-11-17, plan §16) START =================
   YOU build the maze: plants are walls AND towers (5 kinds × 5 shape stages, stage 4 = ① / ②) · the collectors walk the shortest way to the farm
   door (IsoKit 🧭 Iso.flow) · 👣 footprints show it all the time · 🚫 never seal · 😩 Will (not health) — walking drains it too · 🌰 seeds pay ·
   🎃 pumpkins are the hearts · 👨‍🌾 Farmer + 🐐 Chewy pick a skill card before every wave (SkillKit trees) + 5-stage morph.
   Engine = FD (script above, "FD ENGINE"). Painters TDFarmer · TDGoat · FCOL · FP · FG come from Test Harness/farmer-draft (picture sheets fd-p0 / fd-p1). */
/* 🎨 farm painters (drafts fd-p0 / fd-p1, Test Harness/farmer-draft) */
const FD_INK = '#2A1C14', FD_GOLD = '#FFC93C', FD_GOLD2 = '#E59A12';
const FD_HEX = {A: '#E5484D', B: '#3A86FF', C: '#A0612C', D: '#22A867', E: '#B45AE8'};
function fdP(g, pts, k){ g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x * k, y * k) : g.moveTo(x * k, y * k)); g.closePath(); }
function fdFS(g, fill, line, w){ if(fill){ g.fillStyle = fill; g.fill(); } if(line){ g.strokeStyle = line; g.lineWidth = w; g.lineJoin = 'round'; g.stroke(); } }
function fdGlow(g, x, y, r, col, a){ const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.globalAlpha = a == null ? 0.8 : a; g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.globalAlpha = 1; }
function fdStar(g, x, y, r, col, n){ n = n || 5; g.fillStyle = col; g.beginPath(); for(let i = 0; i < n * 2; i++){ const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
function fdShade(hex, f){ const n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255, m = v => Math.max(0, Math.min(255, Math.round(f >= 1 ? v + (255 - v) * (f - 1) : v * f))); return '#' + ((1 << 24) + (m(r) << 16) + (m(gg) << 8) + m(b)).toString(16).slice(1); }
function fdEll(g, x, y, rx, ry, fill, line, w, rot){ g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, 7); fdFS(g, fill, line, w); }
function fdBee(g, x, y, k, t){ fdEll(g, x, y, 2.4 * k, 1.7 * k, '#FFD23F', FD_INK, 0.6 * k); g.fillStyle = FD_INK; g.fillRect(x - 0.5 * k, y - 1.6 * k, 0.9 * k, 3.2 * k); g.globalAlpha = 0.7; fdEll(g, x - 0.6 * k, y - 2.2 * k, 1.4 * k, 1 * k, '#FFFFFF', null, 0, Math.sin(t * 30) * 0.5); g.globalAlpha = 1; }

/* ======================= 👨‍🌾 TDFarmer ======================= */
const TDFarmer = (() => {
  // main · light · dark · accent · glow ; _ = before tier 5 (denim + straw)
  const COL = {_: ['#4A7BC8', '#9CC0F0', '#2E528C', '#E8C46A', '#FFF0B8'],
    A: ['#E5484D', '#FFB0A8', '#A82830', '#5CC45A', '#FFB070'], B: ['#3A6BFF', '#BFD6FF', '#2443B8', '#FFD23F', '#A8CCFF'],
    C: ['#A0612C', '#E8C9A0', '#6E3F18', '#FFD23F', '#E8C9A0'], D: ['#22A867', '#B8F0D0', '#137049', '#F2D27A', '#BFFFD0'], E: ['#B45AE8', '#F0C8FF', '#7A2EB0', '#FFD23F', '#FFE07A']};
  const NAME5 = {A: 'Veggie Slinger', B: 'Canal Captain', C: 'Trap Digger', D: 'Hay Guardian', E: 'Sunny Trickster'};
  const ITEM5 = {A: 'tomato sling + chilli belt', B: 'signpost + rain boots', C: 'big spade + lamp helmet', D: 'pitchfork + hay pads', E: 'sunflower mirror + bees'};
  const SHAPE5 = {A: 'short vest · bandolier', B: 'long raincoat', C: 'burlap poncho', D: 'patch coat · hay shoulders', E: 'tail coat · flower hat'};
  const STAGES = [null,
    {name: 'Straw-Hat Farmer', icon: '👨‍🌾', tier: 1, sc: 0.88, hand: 'hoe', back: null},
    {name: 'Busy Farmer', icon: '🧺', tier: 3, sc: 0.95, hand: 'shovel', back: 'can'},
    {name: 'Trickster Farmer', icon: '🌽', tier: 5, sc: 1.0, hand: 'hero', back: 'hero'},
    {name: 'Master Schemer', icon: '🗺️', tier: 7, sc: 1.08, hand: 'hero2', back: 'scroll'},
    {name: 'Grand Schemer', icon: '🌾', tier: 10, sc: 1.16, hand: 'staff', back: 'quilt', lift: 5}];
  const stageOf = tier => tier >= 10 ? 5 : tier >= 7 ? 4 : tier >= 5 ? 3 : tier >= 3 ? 2 : 1;
  const OC = {_: 3, A: 0, B: 5, C: 1, D: 3, E: 6};

  // 👖 SUIT (body frame: feet 0, hips −20, waist −30, shoulders −47)
  function overalls(g, k, c){
    fdP(g, [[-9.5, -31], [9.5, -31], [9.8, -20], [-9.8, -20]], k); fdFS(g, c[0], c[2], 0.9 * k);           // waist band + seat
    fdP(g, [[-6.5, -42], [6.5, -42], [7, -30], [-7, -30]], k); fdFS(g, c[0], c[2], 0.9 * k);                 // bib
    fdP(g, [[-3.6, -39], [3.6, -39], [3.6, -34], [-3.6, -34]], k); fdFS(g, c[1], c[2], 0.6 * k);             // bib pocket
    g.strokeStyle = c[2]; g.lineWidth = 2.2 * k; [-1, 1].forEach(s => { g.beginPath(); g.moveTo(s * 6 * k, -42 * k); g.lineTo(s * 8 * k, -47 * k); g.stroke(); });
    g.fillStyle = FD_GOLD; [-1, 1].forEach(s => { g.beginPath(); g.arc(s * 5.3 * k, -41 * k, 1.1 * k, 0, 7); g.fill(); });
  }
  function patch(g, x, y, w, h, col, k){ fdP(g, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], k); fdFS(g, col, FD_INK, 0.5 * k); g.strokeStyle = '#FFFFFF'; g.setLineDash([0.8 * k, 0.8 * k]); g.lineWidth = 0.4 * k; g.strokeRect((x + 0.6) * k, (y + 0.6) * k, (w - 1.2) * k, (h - 1.2) * k); g.setLineDash([]); }
  function coat(g, k, c, len, flare, lapel){ fdP(g, [[-10.5, -47], [10.5, -47], [flare, len], [-flare, len]], k); fdFS(g, c, FD_INK, 1 * k);
    fdP(g, [[-1, -46], [1, -46], [1.5, len], [-1.5, len]], k); fdFS(g, 'rgba(0,0,0,.18)'); if(lapel){ g.fillStyle = lapel; fdP(g, [[-6, -47], [0, -36], [-3, -47]], k); g.fill(); fdP(g, [[6, -47], [0, -36], [3, -47]], k); g.fill(); } }
  function suit(g, it, k, t){
    const s = it.s, col = it.c, c = COL[col] || COL._;
    if(s === 1){ overalls(g, k, c); return; }
    if(s === 2){ overalls(g, k, c); fdP(g, [[-8, -32], [8, -32], [9, -14], [-9, -14]], k); fdFS(g, '#F2E2C2', '#B89A6A', 0.8 * k);   // seed apron
      [[-6, -24], [0.5, -24]].forEach(([x, y]) => patch(g, x, y, 5.5, 5, '#E8C46A', k)); g.fillStyle = '#7A4A26'; [[-3.5, -22], [3, -22]].forEach(([x, y]) => { g.beginPath(); g.arc(x * k, y * k, 0.9 * k, 0, 7); g.fill(); }); return; }
    const big = s >= 4;
    if(s === 5){ coat(g, k, fdShade(c[0], 0.75), 0, 21, c[1]); for(let i = 0; i < 5; i++) patch(g, -16 + i * 6.5, -12 + (i % 2) * 4, 4.5, 4.5, i % 2 ? c[1] : FD_GOLD, k);
      g.strokeStyle = FD_GOLD; g.lineWidth = 1.4 * k; g.beginPath(); g.moveTo(-20 * k, -1 * k); g.lineTo(20 * k, -1 * k); g.stroke(); overalls(g, k, COL._); return; }
    if(col === 'A'){ overalls(g, k, COL._); fdP(g, [[-10, -47], [-3, -47], [-4, big ? -14 : -24], [-11, big ? -14 : -24]], k); fdFS(g, c[0], FD_INK, 0.9 * k);
      fdP(g, [[10, -47], [3, -47], [4, big ? -14 : -24], [11, big ? -14 : -24]], k); fdFS(g, c[0], FD_INK, 0.9 * k);
      g.strokeStyle = '#6E3F18'; g.lineWidth = 2.4 * k; g.beginPath(); g.moveTo(-9 * k, -46 * k); g.lineTo(8 * k, -27 * k); g.stroke();      // bandolier
      for(let i = 0; i < (big ? 5 : 4); i++){ const x = -7 + i * 4, y = -44 + i * 4.2; fdEll(g, x * k, y * k, 1.8 * k, 1.6 * k, i % 2 ? '#E5484D' : '#FF7A2E', FD_INK, 0.4 * k); g.fillStyle = '#3E9A45'; g.fillRect((x - 0.4) * k, (y - 2.2) * k, 0.8 * k, 1 * k); }
      if(big){ g.fillStyle = FD_GOLD; fdP(g, [[-10, -47], [10, -47], [8, -43], [-8, -43]], k); g.fill(); } return; }
    if(col === 'B'){ coat(g, k, c[0], big ? -2 : -8, big ? 14 : 12.5, c[1]); g.fillStyle = FD_GOLD; for(let y = -42; y < (big ? -6 : -12); y += 7){ g.beginPath(); g.arc(-3 * k, y * k, 0.9 * k, 0, 7); g.arc(3 * k, y * k, 0.9 * k, 0, 7); g.fill(); }
      g.fillStyle = '#FFD23F'; fdP(g, [[-10, -4], [-4, -4], [-4, 0], [-10, 0]], k); g.fill(); fdP(g, [[4, -4], [10, -4], [10, 0], [4, 0]], k); g.fill(); return; }   // rain boots
    if(col === 'C'){ overalls(g, k, COL._); fdP(g, [[-11, -47], [11, -47], [big ? 17 : 15, big ? -18 : -24], [0, big ? -14 : -20], [big ? -17 : -15, big ? -18 : -24]], k); fdFS(g, '#C9A26A', '#6E3F18', 1 * k);
      g.strokeStyle = '#8E6A3A'; g.lineWidth = 0.6 * k; for(let i = -12; i <= 12; i += 3){ g.beginPath(); g.moveTo(i * k, -45 * k); g.lineTo(i * 1.15 * k, -22 * k); g.stroke(); }
      g.fillStyle = '#6E3F18'; fdP(g, [[-10, -4], [-3, -4], [-3, 0], [-10, 0]], k); g.fill(); fdP(g, [[3, -4], [10, -4], [10, 0], [3, 0]], k); g.fill(); return; }
    if(col === 'D'){ coat(g, k, c[0], big ? -4 : -10, big ? 14 : 12, null); [[-8, -40], [3, -32], [-6, -22], [5, -18]].forEach(([x, y], i) => patch(g, x, y, 4.5, 4, i % 2 ? '#F2D27A' : c[1], k));
      [-1, 1].forEach(sd => { fdP(g, [[sd * 5, -50], [sd * (big ? 17 : 15), -48], [sd * (big ? 16 : 14), -40], [sd * 6, -42]], k); fdFS(g, '#F2D27A', '#B88A2A', 0.9 * k);
        g.strokeStyle = '#D9A93A'; g.lineWidth = 0.5 * k; for(let i = 0; i < 4; i++){ g.beginPath(); g.moveTo(sd * (7 + i * 2.2) * k, -49 * k); g.lineTo(sd * (8 + i * 2.2) * k, -41 * k); g.stroke(); }
        g.fillStyle = '#F2D27A'; for(let i = 0; i < 3; i++){ fdP(g, [[sd * (14 + i), -44 + i * 2], [sd * (18 + i), -45 + i * 2], [sd * (14 + i), -43 + i * 2]], k); g.fill(); } }); return; }
    // E tail coat
    fdP(g, [[-10.5, -47], [10.5, -47], [10, -26], [big ? 13 : 11, big ? -6 : -10], [5, -22], [-5, -22], [big ? -13 : -11, big ? -6 : -10], [-10, -26]], k); fdFS(g, c[0], FD_INK, 1 * k);
    fdP(g, [[-4, -46], [4, -46], [3, -24], [-3, -24]], k); fdFS(g, '#FFF4C8', null); for(let y = -42; y < -26; y += 5) fdBee(g, 0, y * k, k * 0.55, 0);
    if(big){ g.strokeStyle = FD_GOLD; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(-10.5 * k, -47 * k); g.lineTo(-10 * k, -26 * k); g.moveTo(10.5 * k, -47 * k); g.lineTo(10 * k, -26 * k); g.stroke(); }
  }
  // 🎒 BACK (body frame, drawn behind)
  function back(g, it, k, t){
    const s = it.s, col = it.c, c = COL[col] || COL._, fl = Math.sin(t * 3) * 1.5;
    if(s === 2){ g.save(); g.translate(-9 * k, -36 * k); g.rotate(-0.3); fdP(g, [[-6, -6], [6, -6], [7, 7], [-7, 7]], k); fdFS(g, '#7FB3D5', '#3A6E94', 1 * k); g.strokeStyle = '#3A6E94'; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(-6 * k, -2 * k); g.lineTo(-13 * k, -8 * k); g.stroke(); fdEll(g, -14 * k, -9 * k, 2.4 * k, 1.4 * k, '#3A6E94'); g.restore(); return; }
    if(s === 3){ if(col === 'B'){ g.save(); g.translate(-10 * k, -36 * k); fdP(g, [[-5, -5], [5, -5], [6, 6], [-6, 6]], k); fdFS(g, '#7FB3D5', '#3A6E94', 1 * k); g.restore(); }
      if(col === 'C'){ fdEll(g, -10 * k, -34 * k, 6 * k, 6 * k, null, '#B08A50', 2 * k); fdEll(g, -10 * k, -34 * k, 3 * k, 3 * k, null, '#B08A50', 1.6 * k); }
      if(col === 'E'){ g.globalAlpha = 0.9; fdEll(g, -12 * k, -30 * k, 5 * k, 6 * k, '#F2C34A', '#B88A2A', 0.8 * k); g.fillStyle = '#B88A2A'; for(let i = 0; i < 3; i++) g.fillRect(-17 * k, (-32 + i * 2.5) * k, 10 * k, 0.6 * k); g.globalAlpha = 1; }
      return; }
    if(s === 4){ g.beginPath(); g.moveTo(-10 * k, -47 * k); g.lineTo(10 * k, -47 * k); g.lineTo((14 + fl) * k, -5 * k); g.lineTo(5 * k, -9 * k); g.lineTo(0, -4 * k); g.lineTo(-5 * k, -9 * k); g.lineTo((-14 + fl) * k, -5 * k); g.closePath(); fdFS(g, c[2], FD_INK, 1 * k); g.strokeStyle = FD_GOLD; g.lineWidth = 1.3 * k; g.beginPath(); g.moveTo((-13 + fl) * k, -7 * k); g.lineTo(-5 * k, -10 * k); g.lineTo(0, -5.5 * k); g.lineTo(5 * k, -10 * k); g.lineTo((13 + fl) * k, -7 * k); g.stroke(); [[-12, -20], [9, -26]].forEach(([x, y], i) => patch(g, x, y, 3.5, 3.5, i ? FD_GOLD : c[1], k));
      g.save(); g.translate(-11 * k, -40 * k); g.rotate(-0.6); fdP(g, [[-2.5, -14], [2.5, -14], [2.5, 14], [-2.5, 14]], k); fdFS(g, '#F4E6C2', '#B89A6A', 0.8 * k); fdEll(g, 0, -14 * k, 2.5 * k, 1.2 * k, '#E8D6A6', '#B89A6A', 0.6 * k); g.strokeStyle = c[0]; g.lineWidth = 1 * k; g.beginPath(); g.moveTo(-2.5 * k, 0); g.lineTo(2.5 * k, 0); g.stroke(); g.restore(); return; }
    if(s === 5){ g.beginPath(); g.moveTo(-10 * k, -47 * k); g.lineTo(10 * k, -47 * k); g.quadraticCurveTo(22 * k, -20 * k, (21 + fl) * k, 1 * k); g.lineTo((-21 + fl) * k, 1 * k); g.quadraticCurveTo(-22 * k, -20 * k, -10 * k, -47 * k); fdFS(g, c[2], FD_INK, 1 * k);
      g.save(); g.clip(); for(let y = -46; y < 2; y += 6) for(let x = -24; x < 24; x += 6){ g.fillStyle = ((x + y) / 6) % 2 ? c[0] : (((x * 7 + y) % 3) ? c[1] : FD_GOLD); g.globalAlpha = 0.85; g.fillRect(x * k, y * k, 5.6 * k, 5.6 * k); } g.restore(); g.globalAlpha = 1; }
  }
  // 👒 HEAD (hy = head centre, top ≈ hy − 13k)
  function strawHat(g, k, hy, brim, crownH, band, flower){ const top = hy - 11 * k;
    fdEll(g, 0, top + 1 * k, brim * k, brim * 0.28 * k, '#F2D27A', '#B88A2A', 0.9 * k);
    g.save(); g.translate(0, top); g.beginPath(); g.moveTo(-8 * k, 0); g.lineTo(-7 * k, -crownH * 0.7 * k); g.quadraticCurveTo(0, -crownH * 1.35 * k, 7 * k, -crownH * 0.7 * k); g.lineTo(8 * k, 0); g.closePath(); fdFS(g, '#F2D27A', '#B88A2A', 0.9 * k);
    g.fillStyle = band; g.fillRect(-7.8 * k, -2.6 * k, 15.6 * k, 1.8 * k); g.strokeStyle = '#D9A93A'; g.lineWidth = 0.4 * k; for(let i = -6; i <= 6; i += 2.4){ g.beginPath(); g.moveTo(i * k, -crownH * k); g.lineTo(i * 1.1 * k, 0); g.stroke(); }
    if(flower){ for(let i = 0; i < 6; i++){ const a = i * 1.05; fdEll(g, (6 + Math.cos(a) * 2.2) * k, (-3 + Math.sin(a) * 2.2) * k, 1.6 * k, 1.1 * k, flower, null, 0, a); } fdEll(g, 6 * k, -3 * k, 1.2 * k, 1.2 * k, '#7A4A26'); }
    g.restore(); }
  function head(g, it, k, hy, t){
    const s = it.s, col = it.c, c = COL[col] || COL._, top = hy - 11 * k;
    if(s === 1){ strawHat(g, k, hy, 17, 6, '#E5484D'); return; }
    if(s === 2){ strawHat(g, k, hy, 19, 7, '#4A7BC8', '#FFFFFF'); return; }
    if(s === 5){ strawHat(g, k, hy, 22, 10, c[0], null); const py = top - 10 * k;
      g.strokeStyle = FD_GOLD2; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(0, py); g.lineTo(0, py - 9 * k); g.moveTo(-5 * k, py - 5 * k); g.lineTo(5 * k, py - 5 * k); g.stroke();
      g.save(); g.translate(0, py - 11 * k + Math.sin(t * 2) * 0.6 * k); fdEll(g, 0, 0, 4 * k, 2.6 * k, FD_GOLD, FD_GOLD2, 0.7 * k); fdEll(g, 3.4 * k, -2.2 * k, 1.6 * k, 1.6 * k, FD_GOLD, FD_GOLD2, 0.6 * k);   // 🐓 golden weathervane rooster
      g.fillStyle = '#E5484D'; fdP(g, [[3, -3.8], [4.4, -4.8], [4.8, -3.4]], k); g.fill(); fdP(g, [[-4, -0.5], [-7, -4], [-6, 0.5]], k); fdFS(g, FD_GOLD2); g.restore(); fdGlow(g, 0, py - 11 * k, 9 * k, '#FFF3B0', 0.5); return; }
    const big = s === 4;
    if(col === 'A'){ strawHat(g, k, hy, big ? 19 : 16, big ? 9 : 7, c[0]); fdEll(g, -9 * k, top - 2 * k, 1.6 * k, 3.4 * k, '#E5484D', FD_INK, 0.5 * k, -0.5); if(big){ fdEll(g, 9 * k, top - 3 * k, 1.6 * k, 3.6 * k, '#FF7A2E', FD_INK, 0.5 * k, 0.5); } return; }
    if(col === 'B'){ fdP(g, [[-12, 1], [12, 1], [8, -5], [-8, -5]], k); g.save(); g.translate(0, top + 2 * k); fdP(g, [[-13, 1.5], [13, 1.5], [9, -6], [-9, -6]], k); fdFS(g, c[0], FD_INK, 0.9 * k); g.restore();
      g.save(); g.translate(0, top - 4 * k); g.beginPath(); g.arc(0, 0, 8.5 * k, Math.PI, 0); fdFS(g, c[0], FD_INK, 0.9 * k); g.restore(); if(big) fdStar(g, 0, top - 8 * k, 2.4 * k, FD_GOLD); return; }
    if(col === 'C'){ g.save(); g.translate(0, top + 1 * k); g.beginPath(); g.arc(0, 0, 11 * k, Math.PI, 0); fdFS(g, '#E8B04B', FD_INK, 1 * k); fdEll(g, 0, 0, 13 * k, 2.4 * k, '#C99437', FD_INK, 0.8 * k);
      fdEll(g, 0, -6 * k, 3.2 * k, 3.2 * k, '#FFF8C0', FD_INK, 0.7 * k); fdGlow(g, 0, -6 * k, big ? 16 * k : 11 * k, '#FFF3A0', 0.6); g.restore(); return; }
    if(col === 'D'){ strawHat(g, k, hy, big ? 21 : 18, big ? 9 : 7, '#7A4A26'); patchHat(g, k, top); g.fillStyle = '#F2D27A'; for(let i = 0; i < 5; i++){ fdP(g, [[-12 + i * 5, 1], [-13 + i * 5, 5], [-11 + i * 5, 1]], k); g.save(); g.translate(0, top); g.fill(); g.restore(); } return; }
    // E sunflower hat
    g.save(); g.translate(0, top - 1 * k); const R = big ? 13 : 11; for(let i = 0; i < 14; i++){ const a = i / 14 * 6.283 + t * 0.2; fdEll(g, Math.cos(a) * R * 0.78 * k, Math.sin(a) * R * 0.45 * k - 3 * k, 3.6 * k, 1.6 * k, '#FFD23F', '#D9A11A', 0.5 * k, a); }
    fdEll(g, 0, -3 * k, R * 0.5 * k, R * 0.3 * k, '#7A4A26', FD_INK, 0.7 * k); g.fillStyle = '#A0612C'; for(let i = 0; i < 8; i++) g.fillRect((-4 + (i % 4) * 2.4) * k, (-4.4 + Math.floor(i / 4) * 2) * k, 0.8 * k, 0.8 * k);
    // round mirror glasses
    g.restore(); [-1, 1].forEach(sd => { fdEll(g, sd * 4.6 * k, hy - 1 * k, 3.4 * k, 3 * k, 'rgba(190,230,255,.85)', FD_INK, 0.9 * k); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc((sd * 4.6 - 1.2) * k, (hy / k - 2) * k, 0.9 * k, 0, 7); g.fill(); });
    g.strokeStyle = FD_INK; g.lineWidth = 0.8 * k; g.beginPath(); g.moveTo(-1.2 * k, hy - 1 * k); g.lineTo(1.2 * k, hy - 1 * k); g.stroke();
  }
  function patchHat(g, k, top){ g.save(); g.translate(0, top); patch(g, 2, -6, 4, 3.5, '#22A867', k); g.restore(); }
  // ✋ HAND (origin = hand, up = up)
  function stick(g, k, len, col){ g.strokeStyle = col || '#8A5A30'; g.lineWidth = 1.9 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 6 * k); g.lineTo(1.5 * k, -len * k); g.stroke(); }
  function hand(g, it, k, t){
    const s = it.s, col = it.c, c = COL[col] || COL._;
    if(s === 1){ stick(g, k, 26); fdP(g, [[-4, -27], [1.5, -27], [1.5, -24], [-4, -23]], k); fdFS(g, '#9AA6B2', '#5C6670', 0.7 * k); return; }   // hoe
    if(s === 2){ stick(g, k, 22); fdP(g, [[-2.5, -22], [5.5, -22], [5, -30], [1.5, -33], [-2, -30]], k); fdFS(g, '#AEB8C2', '#5C6670', 0.8 * k); return; }   // shovel
    if(s === 5){ stick(g, k, 40, FD_GOLD2); const y = -40 * k; fdGlow(g, 1.5 * k, y, 14 * k, (COL[col] || COL._)[4], 0.8);
      g.strokeStyle = FD_GOLD; g.lineWidth = 1.6 * k; [-4, 0, 4].forEach(x => { g.beginPath(); g.moveTo((1.5 + x * 0.3) * k, y); g.lineTo((1.5 + x) * k, y - 9 * k); g.stroke(); });   // golden pitchfork tines
      fdEll(g, 1.5 * k, y + 1 * k, 3.4 * k, 3.4 * k, c[0], '#FFFFFF', 0.8 * k); return; }
    const big = s === 4;
    if(col === 'A'){ stick(g, k, 12); g.strokeStyle = '#8A5A30'; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(1.2 * k, -12 * k); g.lineTo(-3 * k, -18 * k); g.moveTo(1.2 * k, -12 * k); g.lineTo(5.5 * k, -18 * k); g.stroke();
      g.strokeStyle = '#E8DCC8'; g.lineWidth = 0.6 * k; g.beginPath(); g.moveTo(-3 * k, -18 * k); g.quadraticCurveTo(1 * k, -12 * k, 5.5 * k, -18 * k); g.stroke(); fdEll(g, 1.2 * k, -15 * k, (big ? 3.6 : 3) * k, (big ? 3.3 : 2.7) * k, '#E5484D', FD_INK, 0.6 * k); g.fillStyle = '#3E9A45'; g.fillRect(0.4 * k, -18.8 * k, 1.6 * k, 1.2 * k); return; }
    if(col === 'B'){ stick(g, k, big ? 30 : 26); g.save(); g.translate(1.5 * k, -(big ? 26 : 22) * k); fdP(g, [[-1, -5], [12, -5], [16, 0], [12, 5], [-1, 5]], k); fdFS(g, '#E8C48A', '#7A4A26', 0.9 * k);
      g.fillStyle = '#7A4A26'; g.font = '700 ' + 4.6 * k + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BANK', 6.6 * k, 0.3 * k); g.restore(); return; }
    if(col === 'C'){ stick(g, k, big ? 30 : 26); fdP(g, [[-4.5, -(big ? 30 : 26)], [7.5, -(big ? 30 : 26)], [7, -(big ? 41 : 36)], [1.5, -(big ? 46 : 40)], [-4, -(big ? 41 : 36)]], k); fdFS(g, '#AEB8C2', '#5C6670', 0.9 * k); g.fillStyle = '#8E6640'; g.fillRect(-3 * k, -(big ? 34 : 30) * k, 9 * k, 2 * k); return; }
    if(col === 'D'){ stick(g, k, big ? 34 : 28); const y = -(big ? 34 : 28) * k; g.strokeStyle = '#9AA6B2'; g.lineWidth = 1.3 * k; g.beginPath(); g.moveTo(-3 * k, y); g.lineTo(6 * k, y); g.stroke();
      [-3, 1.5, 6].forEach(x => { g.beginPath(); g.moveTo(x * k, y); g.lineTo(x * k, y - 8 * k); g.stroke(); }); g.fillStyle = '#F2D27A'; fdEll(g, 2 * k, y - 4 * k, 2 * k, 1.2 * k, '#F2D27A'); return; }
    // E sunflower mirror
    stick(g, k, 16, '#3E9A45'); g.save(); g.translate(1.5 * k, -20 * k); const R = big ? 9 : 7.5; for(let i = 0; i < 12; i++){ const a = i / 12 * 6.283; fdEll(g, Math.cos(a) * R * k, Math.sin(a) * R * k, 3 * k, 1.5 * k, '#FFD23F', '#D9A11A', 0.4 * k, a); }
    fdEll(g, 0, 0, R * 0.62 * k, R * 0.62 * k, '#DDF4FF', '#7A4A26', 1 * k); g.fillStyle = 'rgba(255,255,255,.9)'; fdP(g, [[-2, -3], [1, -3.5], [-1.5, 1]], k); g.fill(); fdGlow(g, 0, 0, (big ? 20 : 15) * k, '#FFF6B0', 0.55); g.restore();
  }
  function wear(g, slot, it, o){ try{ if(slot === 'suit') suit(g, it, o.k, o.t); else if(slot === 'back') back(g, it, o.k, o.t); else if(slot === 'head') head(g, it, o.k, o.hy, o.t); else if(slot === 'hand') hand(g, it, o.k, o.t); }catch(e){ console.error(e); } }
  function av(stage, col){
    const S = STAGES[stage] || STAGES[1], key = stage >= 3 ? (col || 'A') : '_';
    const a = {skin: 2, hair: 0, hairColor: 1, outfit: 1, outfitColor: OC[key], acc: 0, eq: {}, cw: {}};
    const it = slot => ({td: slot, s: stage, c: key, who: 'farmer'});
    a.cw.suit = it('suit'); a.cw.head = it('head'); if(S.hand) a.cw.hand = it('hand'); if(S.back) a.cw.back = it('back');
    return typeof fixAv === 'function' ? Object.assign(fixAv(a), {cw: a.cw}) : a;
  }
  function draw(g, stage, col, x, feet, k, t, o){
    o = o || {}; const S = STAGES[stage] || STAGES[1], key = stage >= 3 ? (col || 'A') : '_', c = COL[key], kk = k * S.sc, lift = (S.lift || 0) * kk;
    if(stage >= 3) fdGlow(g, x, feet - 42 * kk, (stage === 5 ? 60 : stage === 4 ? 48 : 36) * kk, c[4], stage === 5 ? 0.8 : 0.5);
    if(stage === 5){ for(let i = 0; i < 10; i++){ const a = t * 0.9 + i * 0.628; const lx = x + Math.cos(a) * 28 * kk, ly = feet - 30 * kk + Math.sin(a) * 9 * kk; fdEll(g, lx, ly, 2.4 * kk, 1.1 * kk, i % 3 ? '#F2C34A' : '#7CC25A', null, 0, a); } fdEll(g, x, feet, 22 * kk, 5 * kk, 'rgba(255,240,180,.45)'); }
    const who = {name: 'Farmer', av: av(stage, col), dir: o.dir || 1};
    if(window.Acting && o.act) Acting.draw(g, who, x, feet - lift, kk, o.act, {t}); else drawAvatar(g, who, x, feet - lift, kk, {t, pose: Object.assign({armR: S.hand ? 0.55 : 0.15}, o.pose || {})});
    if(key === 'E' && stage >= 3){ for(let i = 0; i < (stage >= 4 ? 4 : 3); i++){ const a = t * 1.7 + i * 1.9; fdBee(g, x + Math.cos(a) * 26 * kk, feet - 62 * kk + Math.sin(a * 1.3) * 10 * kk, kk, t); } }
    if(stage === 5){ const bx = x - (o.dir || 1) * 13 * kk, by = feet - 54 * kk - lift; fdEll(g, bx, by, 3.6 * kk, 2.6 * kk, '#3B3B4A', FD_INK, 0.5 * kk); fdEll(g, bx + 2.6 * kk, by - 2 * kk, 1.8 * kk, 1.8 * kk, '#3B3B4A'); g.fillStyle = FD_GOLD; fdP(g, [[bx / kk + 4, by / kk - 2], [bx / kk + 6.5, by / kk - 1.6], [bx / kk + 4, by / kk - 1]], kk); g.fill(); }   // 🐦 crow friend on the shoulder
  }
  function nameOf(stage, col){ return stage === 3 ? (col ? NAME5[col] : 'Trickster Farmer') : stage === 4 ? 'Master Schemer' : stage === 5 ? 'Grand Schemer' : STAGES[stage].name; }
  return {COL, NAME5, ITEM5, SHAPE5, STAGES, stageOf, av, draw, wear, nameOf};
})();

/* ======================= 🐐 TDGoat (own painter, side view, faces +x) ======================= */
const TDGoat = (() => {
  const NAME5 = {A: 'Ram Charger', B: 'Pack Goat', C: 'Digger Goat', D: 'Woolly Wall', E: 'Bee Buddy'};
  const ITEM5 = {A: 'curled ram horns · charge dust', B: 'saddlebags of seeds', C: 'helmet + mud hooves', D: 'giant wool puff', E: 'flower crown + bees'};
  const STAGES = [null,
    {name: 'Kid Chewy', icon: '🐐', tier: 1, sc: 0.62, head: 1.3, leg: 0.8},
    {name: 'Nibbler', icon: '📄', tier: 3, sc: 0.78, head: 1.15, leg: 0.95},
    {name: 'Chewy', icon: '🐐', tier: 5, sc: 0.95, head: 1.0, leg: 1.0},
    {name: 'Mountain Chewy', icon: '⛰️', tier: 7, sc: 1.12, head: 0.95, leg: 1.12},
    {name: 'Golden Billy', icon: '🌟', tier: 10, sc: 1.3, head: 0.92, leg: 1.15}];
  const stageOf = TDFarmer.stageOf;
  const COAT = {_: ['#F4EEE4', '#D9CDBC'], A: ['#F2E4DA', '#D8BFAE'], B: ['#EEF0F4', '#C8CFDA'], C: ['#D9C2A2', '#B89A74'], D: ['#FAF7F0', '#DCD4C4'], E: ['#F6EEF8', '#D8C6E0']};
  function draw(g, stage, col, x, feet, k, t, o){
    o = o || {}; const S = STAGES[stage] || STAGES[1], key = stage >= 3 ? (col || 'A') : '_', K = k * S.sc, d = o.dir || 1, gold = stage === 5, cc = gold ? ['#FFE7A8', '#E8B94A'] : COAT[key], hex = FD_HEX[key] || '#E5484D';
    const bob = Math.sin(t * 5) * 0.8 * K, L = 12 * S.leg;
    g.save(); g.translate(x, feet); g.scale(d, 1);
    if(stage >= 3) fdGlow(g, 0, -20 * K, (stage === 5 ? 46 : 30) * K, gold ? '#FFF0A0' : hex + '88', stage === 5 ? 0.85 : 0.45);
    fdEll(g, 0, 0, 18 * K, 3.6 * K, 'rgba(0,0,0,.18)');
    // legs (far pair darker)
    [[-9, 1], [7, 1], [-6, 0], [10, 0]].forEach(([lx, near], i) => { const sw = Math.sin(t * 6 + i * 1.7) * 1.5; g.strokeStyle = near ? cc[1] : fdShade(cc[1], 0.8); g.lineWidth = 3.6 * K; g.lineCap = 'round'; g.beginPath(); g.moveTo(lx * K, -L * K - 2 * K); g.lineTo((lx + sw) * K, -1.5 * K); g.stroke();
      fdEll(g, (lx + sw) * K, -1 * K, 2.2 * K, 1.4 * K, key === 'C' && stage >= 3 ? '#6E3F18' : '#4A3A2E'); });
    const by = -L * K - 8 * K + bob;
    // tail
    g.fillStyle = cc[0]; fdEll(g, -16 * K, by - 4 * K, 3 * K, 2 * K, cc[0], FD_INK, 0.8 * K, -0.8);
    // body
    const bw = stage === 1 ? 13 : 16, bh = stage === 1 ? 8 : 9;
    if(key === 'D' && stage >= 3){ for(let i = 0; i < 12; i++){ const a = i / 12 * 6.283; fdEll(g, Math.cos(a) * bw * 0.95 * K, by + Math.sin(a) * bh * 1.05 * K, 6 * K, 5 * K, '#FFFFFF', '#D8D0C0', 0.8 * K); } }
    fdEll(g, 0, by, bw * K, bh * K, cc[0], FD_INK, 1.1 * K); fdEll(g, -2 * K, by + 3 * K, bw * 0.7 * K, bh * 0.45 * K, cc[1]);
    // blanket / gear by colour
    if(stage >= 3 && !(key === 'D')){ g.save(); g.beginPath(); g.ellipse(0, by, bw * K, bh * K, 0, 0, 7); g.clip(); fdP(g, [[-9, -12], [9, -12], [10, 4], [-10, 4]], 1); g.save(); g.translate(0, by); g.scale(K, K); fdP(g, [[-9, -10], [9, -10], [10, 3], [-10, 3]], 1); fdFS(g, hex, null); g.fillStyle = gold || stage >= 4 ? FD_GOLD : fdShade(hex, 1.35); g.fillRect(-10, 1, 20, 1.6); g.restore(); g.restore(); }
    if(key === 'B' && stage >= 3) [-1, 1].forEach(sd => { fdP(g, [[-4, -2], [5, -2], [5, 7], [-4, 7]], K); g.save(); g.translate(sd * 3 * K, by + 2 * K); fdP(g, [[-5, -3], [5, -3], [5, 5], [-5, 5]], K); fdFS(g, '#C99A5A', '#6E4A26', 0.8 * K); g.fillStyle = '#7CC25A'; fdEll(g, 0, -3.5 * K, 3 * K, 1.4 * K, '#7CC25A'); g.restore(); });
    if(gold || stage === 4){ g.beginPath(); g.moveTo(-3 * K, by - bh * K); g.quadraticCurveTo(-18 * K, by - 2 * K, (-20 + Math.sin(t * 3)) * K, by + 9 * K); g.lineTo(-6 * K, by + 6 * K); g.closePath(); fdFS(g, gold ? hex : hex, FD_INK, 0.9 * K); }
    // neck + head
    const hk = K * S.head, hx = bw * 0.8 * K, hy = by - 9 * K;
    g.beginPath(); g.moveTo(hx - 5 * K, by - 3 * K); g.lineTo(hx + 2 * K, hy + 2 * K); g.lineTo(hx + 7 * K, hy + 4 * K); g.lineTo(hx + 3 * K, by + 2 * K); g.closePath(); fdFS(g, cc[0], FD_INK, 1 * K);
    g.save(); g.translate(hx + 5 * K, hy); g.scale(hk / K, hk / K);
    // horns (behind head)
    const hornCol = gold ? FD_GOLD : stage >= 4 ? '#B8A07A' : '#C9B48E';
    g.strokeStyle = FD_INK; g.lineWidth = 1 * K;
    if(stage === 1){ fdEll(g, -1 * K, -7 * K, 1.4 * K, 1.8 * K, hornCol, FD_INK, 0.6 * K); }
    else if(stage === 2){ fdP(g, [[-3, -6], [0, -6], [-3, -12]], K); fdFS(g, hornCol, FD_INK, 0.7 * K); }
    else if(key === 'A' && stage === 3){ g.lineWidth = 3.4 * K; g.strokeStyle = hornCol; g.beginPath(); g.arc(-3 * K, -4 * K, 5 * K, -2.6, 1.4); g.stroke(); g.lineWidth = 0.8 * K; g.strokeStyle = FD_INK; g.beginPath(); g.arc(-3 * K, -4 * K, 6.6 * K, -2.6, 1.4); g.stroke(); }
    else { const big = stage >= 4 ? 1 : 0.75; g.lineWidth = 3 * K * big; g.strokeStyle = hornCol; g.lineCap = 'round'; g.beginPath(); g.moveTo(-1 * K, -6 * K); g.quadraticCurveTo(-8 * K * big, -18 * K * big, -16 * K * big, -12 * K * big); if(stage === 5) g.quadraticCurveTo(-20 * K, -6 * K, -15 * K, -4 * K); g.stroke(); }
    // ear
    fdEll(g, -4 * K, -2 * K, 4.6 * K, 1.8 * K, cc[1], FD_INK, 0.7 * K, -0.5);
    // head shape
    g.beginPath(); g.moveTo(-4 * K, -6 * K); g.quadraticCurveTo(3 * K, -9 * K, 7 * K, -3 * K); g.quadraticCurveTo(10 * K, 2 * K, 8 * K, 4.5 * K); g.quadraticCurveTo(3 * K, 6 * K, -1 * K, 3 * K); g.quadraticCurveTo(-5 * K, 0, -4 * K, -6 * K); fdFS(g, cc[0], FD_INK, 1.1 * K);
    fdEll(g, 7.4 * K, 2.2 * K, 2.2 * K, 1.6 * K, '#F2B8B0'); g.fillStyle = FD_INK; g.beginPath(); g.arc(8.2 * K, 1.4 * K, 0.5 * K, 0, 7); g.fill();
    // eye (big + friendly, sleepy-sly at Bee Buddy)
    fdEll(g, 2 * K, -2.4 * K, 2.2 * K, 2.4 * K, '#FFFFFF', FD_INK, 0.6 * K); fdEll(g, 2.6 * K, -2 * K, 1.1 * K, 1.6 * K, FD_INK); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(3 * K, -2.6 * K, 0.45 * K, 0, 7); g.fill();
    // beard (from stage 2, longer later)
    if(stage >= 2){ const bl = stage === 2 ? 3 : stage === 3 ? 4.5 : stage === 4 ? 6 : 8; fdP(g, [[3, 4], [6, 4], [4.6, 4 + bl]], K); fdFS(g, gold ? '#FFF4D0' : cc[1], FD_INK, 0.6 * K); }
    // chewed paper in the mouth (stage 2 = "Nibbler")
    if(stage === 2){ g.save(); g.translate(8 * K, 4 * K); g.rotate(0.3); fdP(g, [[0, -1.5], [6, -2.5], [6.5, 3], [0.5, 3.5]], K); fdFS(g, '#FFFFFF', '#9AA6B2', 0.5 * K); g.strokeStyle = '#9AA6B2'; g.lineWidth = 0.3 * K; [0, 1.4].forEach(y => { g.beginPath(); g.moveTo(1 * K, y * K); g.lineTo(5.4 * K, (y - 0.6) * K); g.stroke(); }); g.restore(); }
    // head gear
    if(key === 'A' && stage >= 3){ g.fillStyle = FD_HEX.A; g.fillRect(-4 * K, -7.2 * K, 10 * K, 1.8 * K); }
    if(key === 'C' && stage >= 3){ g.beginPath(); g.arc(1.5 * K, -6 * K, 6 * K, Math.PI, 0); fdFS(g, '#E8B04B', FD_INK, 0.8 * K); fdEll(g, 1.5 * K, -9 * K, 1.8 * K, 1.8 * K, '#FFF8C0', FD_INK, 0.5 * K); }
    if(key === 'E' && stage >= 3) for(let i = 0; i < 6; i++){ fdEll(g, (-4 + i * 2.2) * K, (-7 - Math.sin(i) * 1) * K, 1.6 * K, 1.6 * K, ['#FF8FC8', '#FFD23F', '#FFFFFF'][i % 3], FD_INK, 0.3 * K); }
    if(gold){ g.fillStyle = FD_GOLD; fdP(g, [[-3, -7], [-2, -11], [0, -8], [2, -12], [4, -8], [6, -11], [6.5, -6.5]], K); fdFS(g, FD_GOLD, FD_GOLD2, 0.5 * K); }
    g.restore();
    // collar + bell
    const bellR = stage === 5 ? 3 : 1.9; g.strokeStyle = stage >= 3 ? hex : '#E5484D'; g.lineWidth = 1.6 * K; g.beginPath(); g.moveTo(hx - 1 * K, hy + 3 * K); g.lineTo(hx + 4 * K, hy + 6.5 * K); g.stroke();
    fdEll(g, hx + 2 * K, hy + 7.5 * K, bellR * K, bellR * K, FD_GOLD, FD_GOLD2, 0.6 * K); if(stage === 5) fdGlow(g, hx + 2 * K, hy + 7.5 * K, 9 * K, '#FFF3A0', 0.7);
    g.restore();
    if(key === 'E' && stage >= 3) for(let i = 0; i < 3; i++){ const a = t * 1.8 + i * 2.1; fdBee(g, x + Math.cos(a) * 20 * K, feet - 34 * K + Math.sin(a) * 6 * K, K * 0.9, t); }
    if(key === 'A' && stage >= 3) for(let i = 0; i < 4; i++) fdEll(g, x - d * (20 + i * 5) * K, feet - (2 + i % 2 * 2) * K, (3 + i) * K, (2 + i * 0.5) * K, 'rgba(200,170,120,' + (0.5 - i * 0.1) + ')');
    if(stage === 5) for(let i = 0; i < 7; i++){ const a = t + i * 0.9; fdStar(g, x + Math.cos(a) * 26 * K, feet - 26 * K + Math.sin(a) * 14 * K, 1.6 * K, '#FFF3A0', 4); }
  }
  function nameOf(stage, col){ return stage === 3 ? (col ? NAME5[col] : 'Chewy') : STAGES[stage].name; }
  return {NAME5, ITEM5, STAGES, stageOf, draw, nameOf};
})();

/* ======================= 🧑‍💼 Collectors (AvatarKit avatars wearing a suit + tie + item) ======================= */
const FCOL = (() => {
  const T = {
    co: {name: 'Collector', icon: '📋', suit: '#7D8597', tie: '#E5484D', hat: 'bowler', item: 'clip', skin: 1, hair: 0, hc: 0, skill: '📋 just walks + knocks'},
    ck: {name: 'Clipboard Checker', icon: '🔍', suit: '#5E6B85', tie: '#3A86FF', hat: null, item: 'lens', skin: 3, hair: 5, hc: 1, skill: '🔍 spots ONE trap and walks round it'},
    um: {name: 'Umbrella Man', icon: '☂️', suit: '#4A5468', tie: '#FFD23F', hat: 'bowler', item: 'umb', skin: 0, hair: 3, hc: 2, skill: '☂️ water + flood traps don\'t work'},
    tr: {name: 'Treats Lady', icon: '🐕', suit: '#A86A8A', tie: '#FF8FC8', hat: null, item: 'treat', skin: 4, hair: 4, hc: 0, skill: '🦴 your animals stop to eat treats'},
    bk: {name: 'Bike Clerk', icon: '🚲', suit: '#6B8E6B', tie: '#FF9F1C', hat: 'cap', item: 'bike', skin: 2, hair: 6, hc: 5, skill: '🚲 fast on dry paths, slow in mud'},
    pa: {name: 'Paper Clerk', icon: '📚', suit: '#8C7A6A', tie: '#7B5FE0', hat: null, item: 'papers', skin: 1, hair: 1, hc: 3, skill: '📚 Boring Papers — animals nearby fall asleep'},
    lw: {name: 'Lawyer Long-Words', icon: '⚖️', suit: '#2B2D42', tie: '#C0392B', hat: null, item: 'scroll', skin: 0, hair: 0, hc: 4, boss: true, skill: '📜 reads a long word: every trap pauses 3 s'},
    lord: {name: 'Lord Loanington', icon: '🎩', suit: '#3B2A5A', tie: '#FFC93C', hat: 'top', item: 'cane', skin: 0, hair: 0, hc: 4, boss: true, skill: '🚜 Golden Tractor flattens hay walls + plants'},
  };
  function suit(g, it, k){ const S = T[it.k]; fdP(g, [[-10.5, -47], [10.5, -47], [10.5, -19], [-10.5, -19]], k); fdFS(g, S.suit, FD_INK, 1 * k);
    fdP(g, [[-3.6, -47], [3.6, -47], [0, -31]], k); fdFS(g, '#FFFFFF'); fdP(g, [[-1.4, -45], [1.4, -45], [1.8, -33], [0, -30.5], [-1.8, -33]], k); fdFS(g, S.tie, FD_INK, 0.5 * k);
    g.fillStyle = fdShade(S.suit, 0.7); fdP(g, [[-10.5, -47], [-3.6, -47], [-6, -38]], k); g.fill(); fdP(g, [[10.5, -47], [3.6, -47], [6, -38]], k); g.fill();
    fdP(g, [[-10.5, -20], [10.5, -20], [10.8, -2], [1, -2], [0, -12], [-1, -2], [-10.8, -2]], k); fdFS(g, fdShade(S.suit, 0.85), FD_INK, 0.9 * k);
    if(it.k === 'lord'){ g.strokeStyle = FD_GOLD; g.lineWidth = 0.8 * k; g.beginPath(); g.moveTo(-6 * k, -28 * k); g.quadraticCurveTo(0, -24 * k, 6 * k, -28 * k); g.stroke(); } }
  function head(g, it, k, hy){ const S = T[it.k], top = hy - 11 * k;
    if(S.hat === 'bowler'){ fdEll(g, 0, top + 1 * k, 13 * k, 2.6 * k, '#2B2D42'); g.beginPath(); g.arc(0, top, 8.5 * k, Math.PI, 0); fdFS(g, '#2B2D42', '#000', 0.6 * k); g.fillStyle = '#5A5F70'; g.fillRect(-8.5 * k, top - 2 * k, 17 * k, 1.4 * k); }
    if(S.hat === 'top'){ fdEll(g, 0, top + 1 * k, 13 * k, 2.6 * k, '#1E1A2E'); fdP(g, [[-7.5, 0], [7.5, 0], [8.5, -15], [-8.5, -15]], k); g.save(); g.translate(0, top); fdP(g, [[-7.5, 0], [7.5, 0], [8.5, -15], [-8.5, -15]], k); fdFS(g, '#1E1A2E', '#000', 0.6 * k); g.fillStyle = FD_GOLD; g.fillRect(-7.6 * k, -4 * k, 15.2 * k, 2.2 * k); g.restore();
      fdEll(g, 4.6 * k, hy - 1 * k, 3 * k, 3 * k, 'rgba(220,240,255,.5)', FD_GOLD2, 0.9 * k); g.strokeStyle = FD_GOLD2; g.lineWidth = 0.5 * k; g.beginPath(); g.moveTo(7.6 * k, hy - 1 * k); g.quadraticCurveTo(9 * k, hy + 6 * k, 7 * k, hy + 12 * k); g.stroke();
      fdP(g, [[-6, 4], [-1, 2.5], [0, 3.5], [1, 2.5], [6, 4], [3, 5.5], [0, 4.5], [-3, 5.5]], k); g.save(); g.translate(0, hy); fdP(g, [[-6, 3], [-1, 1.8], [0, 2.8], [1, 1.8], [6, 3], [3, 4.6], [0, 3.6], [-3, 4.6]], k); fdFS(g, '#E8E8E8', FD_INK, 0.4 * k); g.restore(); }
    if(S.hat === 'cap'){ g.beginPath(); g.arc(0, top + 2 * k, 9 * k, Math.PI, 0); fdFS(g, S.tie, FD_INK, 0.8 * k); fdEll(g, 8 * k, top + 2 * k, 7 * k, 1.8 * k, fdShade(S.tie, 0.75), FD_INK, 0.6 * k); }
    if(it.k === 'ck' || it.k === 'lw') [-1, 1].forEach(sd => fdEll(g, sd * 4.6 * k, hy - 1 * k, 3 * k, 2.6 * k, 'rgba(230,245,255,.35)', FD_INK, 0.8 * k)); }
  function hand(g, it, k, t){ const S = T[it.k];
    if(S.item === 'clip' || S.item === 'lens'){ fdP(g, [[-6, -14], [6, -14], [6, 3], [-6, 3]], k); fdFS(g, '#C99A5A', '#6E4A26', 0.8 * k); fdP(g, [[-4.8, -12.5], [4.8, -12.5], [4.8, 1.6], [-4.8, 1.6]], k); fdFS(g, '#FFFFFF');
      g.fillStyle = '#9AA6B2'; for(let y = -10; y < 0; y += 2.4) g.fillRect(-3.8 * k, y * k, 7.6 * k, 0.6 * k); g.fillStyle = '#8E9AA8'; g.fillRect(-2 * k, -15.4 * k, 4 * k, 2.4 * k);
      if(S.item === 'lens'){ g.strokeStyle = '#6E4A26'; g.lineWidth = 1.4 * k; g.beginPath(); g.moveTo(7 * k, -6 * k); g.lineTo(11 * k, -1 * k); g.stroke(); fdEll(g, 6 * k, -8 * k, 3.4 * k, 3.4 * k, 'rgba(200,235,255,.6)', FD_INK, 1 * k); } return; }
    if(S.item === 'umb'){ g.strokeStyle = '#2B2D42'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(0, 4 * k); g.lineTo(0, -30 * k); g.stroke(); g.beginPath(); g.moveTo(-16 * k, -26 * k); g.quadraticCurveTo(0, -46 * k, 16 * k, -26 * k);
      for(let i = 0; i < 4; i++){ g.quadraticCurveTo((12 - i * 8) * k, -29 * k, (8 - i * 8) * k, -26 * k); } g.closePath(); fdFS(g, '#3A86FF', FD_INK, 0.9 * k); g.strokeStyle = '#FFD23F'; g.lineWidth = 0.8 * k; g.beginPath(); g.moveTo(0, -39 * k); g.lineTo(0, -27 * k); g.stroke(); return; }
    if(S.item === 'treat'){ fdP(g, [[-5, -10], [5, -10], [6, 3], [-6, 3]], k); fdFS(g, '#E8C48A', '#7A4A26', 0.8 * k); g.fillStyle = '#FFFFFF'; fdEll(g, 0, -12 * k, 3.4 * k, 1.4 * k, '#FFFFFF', '#B8A898', 0.5 * k); return; }
    if(S.item === 'papers'){ for(let i = 0; i < 5; i++){ fdP(g, [[-7, -4 - i * 2.4], [7, -5 - i * 2.4], [7, -3 - i * 2.4], [-7, -2 - i * 2.4]], k); fdFS(g, i % 2 ? '#F4F4F4' : '#FFFFFF', '#9AA6B2', 0.4 * k); } return; }
    if(S.item === 'scroll'){ fdP(g, [[-4, -16], [4, -16], [4, 14], [-4, 14]], k); fdFS(g, '#FFF4D6', '#B89A6A', 0.7 * k); g.fillStyle = '#9AA6B2'; for(let y = -13; y < 12; y += 2.2) g.fillRect(-3 * k, y * k, 6 * k, 0.5 * k); fdEll(g, 0, -16 * k, 4.4 * k, 1.6 * k, '#E8D6A6', '#B89A6A', 0.6 * k); return; }
    if(S.item === 'cane'){ g.strokeStyle = '#2B2D42'; g.lineWidth = 1.4 * k; g.beginPath(); g.moveTo(0, 26 * k); g.lineTo(0, -6 * k); g.stroke(); fdEll(g, 0, -7 * k, 2.6 * k, 2.6 * k, FD_GOLD, FD_GOLD2, 0.6 * k); return; }
  }
  function av(key){ const S = T[key]; const a = {skin: S.skin, hair: S.hair, hairColor: S.hc, outfit: 1, outfitColor: 8, acc: 0, eq: {}, cw: {}};
    ['suit', 'head', 'hand'].forEach(sl => a.cw[sl] = {td: sl, k: key, who: 'col'}); return typeof fixAv === 'function' ? Object.assign(fixAv(a), {cw: a.cw}) : a; }
  function wear(g, slot, it, o){ try{ if(slot === 'suit') suit(g, it, o.k); else if(slot === 'head') head(g, it, o.k, o.hy); else if(slot === 'hand') hand(g, it, o.k, o.t); }catch(e){ console.error(e); } }
  function draw(g, key, x, feet, k, t, o){ o = o || {}; const S = T[key];
    if(S.item === 'bike'){ g.strokeStyle = FD_INK; g.lineWidth = 1.4 * k; [-14, 14].forEach(dx => fdEll(g, x + dx * k, feet - 7 * k, 7 * k, 7 * k, null, FD_INK, 1.6 * k)); g.strokeStyle = S.tie; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(x - 14 * k, feet - 7 * k); g.lineTo(x - 2 * k, feet - 18 * k); g.lineTo(x + 14 * k, feet - 7 * k); g.lineTo(x + 8 * k, feet - 22 * k); g.stroke(); feet -= 12 * k; }
    drawAvatar(g, {name: S.name, av: av(key), dir: o.dir || 1}, x, feet, k * (S.boss ? 1.25 : 1), {t, pose: Object.assign({armR: 0.5}, o.pose || {})});
    if(S.item === 'treat'){ const dx = x - (o.dir || 1) * 22 * k; fdEll(g, dx, feet - 7 * k, 7 * k, 5 * k, '#C99A5A', FD_INK, 0.8 * k); fdEll(g, dx - (o.dir || 1) * 6 * k, feet - 12 * k, 4.4 * k, 4 * k, '#C99A5A', FD_INK, 0.8 * k); fdEll(g, dx - (o.dir || 1) * 7 * k, feet - 9 * k, 2 * k, 3.4 * k, '#7A4A26', null, 0, 0.4); g.fillStyle = FD_INK; g.beginPath(); g.arc(dx - (o.dir || 1) * 8 * k, feet - 13 * k, 0.8 * k, 0, 7); g.fill();
      g.strokeStyle = '#E5484D'; g.lineWidth = 0.7 * k; g.beginPath(); g.moveTo(dx - (o.dir || 1) * 4 * k, feet - 10 * k); g.quadraticCurveTo(x - 8 * k, feet - 30 * k, x + 6 * k, feet - 36 * k); g.stroke(); }
  }
  return {T, av, wear, draw};
})();

// one AK_WEAR for the whole book (the page will own this dispatcher): farmer stage wear + collector wear
window.AK_WEAR = (prev => function(g, slot, it, o){ if(it && it.who === 'col') return FCOL.wear(g, slot, it, o); if(it && (it.who === 'farmer' || !prev)) return TDFarmer.wear(g, slot, it, o); return prev(g, slot, it, o); })(window.AK_WEAR);   // 🐞 td-wear: only the farmer book's own items — the 👸 princess keeps hers

/* ======================= 😩 Will bar ======================= */
function willBar(g, x, y, w, v, k){ // v 0..1
  const h = 6 * k, face = v > 0.75 ? '😐' : v > 0.5 ? '😕' : v > 0.25 ? '😩' : '😭';
  g.fillStyle = 'rgba(42,28,20,.75)'; g.beginPath(); g.roundRect(x - w / 2 - 1.5 * k, y - h / 2 - 1.5 * k, w + 3 * k, h + 3 * k, 4 * k); g.fill();
  const col = v > 0.5 ? '#FFC93C' : v > 0.25 ? '#FF9F1C' : '#E5484D'; g.fillStyle = col; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, Math.max(2 * k, w * v), h, 3 * k); g.fill();
  g.font = (10 * k) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(face, x - w / 2 - 7 * k, y + 0.5 * k);
}

/* ======================= 🌱 farm things (feet point, k = zoom; ONE dark rim like IsoProps) ======================= */
const FP = (() => {
  const R = (g, k) => { g.strokeStyle = FD_INK; g.lineWidth = 1.5 * k; g.lineJoin = 'round'; };
  function shadow(g, x, y, rx, k){ fdEll(g, x, y, rx * k, rx * 0.5 * k, 'rgba(40,30,20,.22)'); }
  const P = {
    mush(g, x, y, k, t, lv){ lv = lv || 1; const s = [0.8, 1, 1.25][lv - 1]; shadow(g, x, y, 14 * s, k); fdP(g, [[-4, 0], [4, 0], [3, -22], [-3, -22]], k * s); g.save(); g.translate(x, y); fdP(g, [[-4.5, 0], [4.5, 0], [3.4, -24 * s], [-3.4, -24 * s]], k); fdFS(g, '#F6EBD8', null); R(g, k); g.stroke();
      const cy = -24 * s * k; g.beginPath(); g.ellipse(0, cy, 17 * s * k, 11 * s * k, 0, Math.PI, 0); g.quadraticCurveTo(0, cy + 5 * k, -17 * s * k, cy); fdFS(g, lv === 3 ? '#B45AE8' : '#E5484D', null); R(g, k); g.stroke();
      g.fillStyle = '#FFFFFF'; [[-8, -4], [0, -8], [8, -4], [-3, -2], [5, -1]].forEach(([dx, dy]) => { g.beginPath(); g.arc(dx * s * k, cy + dy * s * k, 2 * s * k, 0, 7); g.fill(); }); if(lv === 3){ fdGlow(g, 0, cy, 22 * s * k, '#F0C8FF', 0.4); } g.restore(); },
    corn(g, x, y, k, t){ shadow(g, x, y, 10, k); for(let i = -1; i <= 1; i++){ g.save(); g.translate(x + i * 5 * k, y - Math.abs(i) * 1 * k); g.rotate(Math.sin(t * 1.5 + i) * 0.04); fdP(g, [[-1.5, 0], [1.5, 0], [1, -40], [-1, -40]], k); fdFS(g, '#5FAE45', FD_INK, 0.8 * k);
      [[-1, -14, -1], [1, -22, 1], [-1, -30, -1]].forEach(([s, yy]) => { g.beginPath(); g.moveTo(0, yy * k); g.quadraticCurveTo(s * 10 * k, (yy - 6) * k, s * 13 * k, (yy + 2) * k); g.quadraticCurveTo(s * 6 * k, (yy - 2) * k, 0, (yy + 3) * k); fdFS(g, '#7CC25A', FD_INK, 0.7 * k); });
      fdEll(g, 2.5 * k, -26 * k, 2.4 * k, 5 * k, '#FFD23F', FD_INK, 0.6 * k, 0.2); g.strokeStyle = '#E8B04B'; g.lineWidth = 0.6 * k; g.beginPath(); g.moveTo(0, -40 * k); g.lineTo(-2 * k, -45 * k); g.moveTo(0, -40 * k); g.lineTo(2 * k, -46 * k); g.stroke(); g.restore(); } },
    sun(g, x, y, k, t){ shadow(g, x, y, 8, k); g.save(); g.translate(x, y); fdP(g, [[-1.2, 0], [1.2, 0], [1, -36], [-1, -36]], k); fdFS(g, '#5FAE45', FD_INK, 0.8 * k); [[-1, -14], [1, -20]].forEach(([s, yy]) => fdEll(g, s * 5 * k, yy * k, 5 * k, 2.2 * k, '#7CC25A', FD_INK, 0.6 * k, s * 0.5));
      for(let i = 0; i < 14; i++){ const a = i / 14 * 6.283 + t * 0.3; fdEll(g, Math.cos(a) * 9 * k, -40 * k + Math.sin(a) * 9 * k, 4.4 * k, 2 * k, '#FFD23F', '#D9A11A', 0.6 * k, a); } fdEll(g, 0, -40 * k, 5.4 * k, 5.4 * k, '#7A4A26', FD_INK, 1 * k);
      g.globalAlpha = 0.35 + 0.15 * Math.sin(t * 3); g.fillStyle = '#FFF6B0'; g.beginPath(); g.moveTo(0, -40 * k); g.lineTo(46 * k, -10 * k); g.lineTo(40 * k, 4 * k); g.closePath(); g.fill(); g.globalAlpha = 1; g.restore(); },
    pepper(g, x, y, k, t){ shadow(g, x, y, 10, k); g.save(); g.translate(x, y); for(let i = 0; i < 7; i++){ const a = -2.6 + i * 0.36; fdEll(g, Math.cos(a) * 9 * k, -12 * k + Math.sin(a) * 7 * k, 6 * k, 3.4 * k, '#4FA83A', FD_INK, 0.6 * k, a); }
      fdEll(g, 0, -12 * k, 9 * k, 8 * k, '#5FB548', FD_INK, 1 * k); [[-4, -10], [3, -14], [5, -7]].forEach(([dx, dy], i) => fdEll(g, dx * k, dy * k, 1.8 * k, 4 * k, i === 1 ? '#FF7A2E' : '#E5484D', FD_INK, 0.5 * k, 0.3)); g.restore(); },
    hay(g, x, y, k){ shadow(g, x, y, 14, k); g.save(); g.translate(x, y); fdP(g, [[-14, -2], [0, 5], [14, -2], [14, -14], [0, -7], [-14, -14]], k); fdFS(g, '#E8B94A', FD_INK, 1.4 * k); fdP(g, [[-14, -14], [0, -21], [14, -14], [0, -7]], k); fdFS(g, '#F6D27A', FD_INK, 1.4 * k);
      g.strokeStyle = '#B88A2A'; g.lineWidth = 0.6 * k; for(let i = -12; i < 13; i += 3){ g.beginPath(); g.moveTo(i * k, (-14 - (12 - Math.abs(i)) * 0.5) * k); g.lineTo(i * k, (-2 + (12 - Math.abs(i)) * 0.5) * k); g.stroke(); } g.strokeStyle = '#A0612C'; g.lineWidth = 1 * k; g.beginPath(); g.moveTo(-14 * k, -8 * k); g.lineTo(0, -1 * k); g.lineTo(14 * k, -8 * k); g.stroke(); g.restore(); },
    crow(g, x, y, k, t){ shadow(g, x, y, 9, k); g.save(); g.translate(x, y); g.strokeStyle = '#8A5A30'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -40 * k); g.moveTo(-14 * k, -30 * k); g.lineTo(14 * k, -30 * k); g.stroke();
      fdP(g, [[-8, -34], [8, -34], [10, -12], [-10, -12]], k); fdFS(g, '#C0392B', FD_INK, 1 * k); [[-6, -26], [3, -20]].forEach(([dx, dy]) => { fdP(g, [[dx, dy], [dx + 4, dy], [dx + 4, dy + 4], [dx, dy + 4]], k); fdFS(g, '#3A86FF', FD_INK, 0.5 * k); });
      fdEll(g, 0, -42 * k, 7 * k, 7 * k, '#F2D27A', FD_INK, 1 * k); fdEll(g, 0, -47 * k, 12 * k, 2.4 * k, '#E8B04B', FD_INK, 0.9 * k); g.beginPath(); g.arc(0, -48 * k, 6 * k, Math.PI, 0); fdFS(g, '#E8B04B', FD_INK, 0.9 * k);
      g.fillStyle = FD_INK; g.fillRect(-3.5 * k, -43 * k, 2 * k, 2 * k); g.fillRect(1.5 * k, -43 * k, 2 * k, 2 * k); g.beginPath(); g.arc(0, -40 * k, 2.4 * k, 0.2, 2.9); g.stroke(); g.restore(); },
    hive(g, x, y, k, t){ shadow(g, x, y, 9, k); g.save(); g.translate(x, y); g.fillStyle = '#8A5A30'; g.fillRect(-1.5 * k, -10 * k, 3 * k, 10 * k); [0, 1, 2, 3].forEach(i => fdEll(g, 0, (-14 - i * 5) * k, (10 - i * 1.6) * k, 3.6 * k, i % 2 ? '#F2C34A' : '#E8B04B', FD_INK, 0.9 * k)); fdEll(g, 0, -15 * k, 2 * k, 1.6 * k, '#5A3A22'); g.restore(); for(let i = 0; i < 3; i++){ const a = t * 2 + i * 2.1; fdBee(g, x + Math.cos(a) * 14 * k, y - 26 * k + Math.sin(a) * 6 * k, k, t); } },
    sign(g, x, y, k){ shadow(g, x, y, 6, k); g.save(); g.translate(x, y); g.strokeStyle = '#7A4A26'; g.lineWidth = 2.4 * k; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -30 * k); g.stroke(); fdP(g, [[-12, -36], [10, -36], [16, -30], [10, -24], [-12, -24]], k); fdFS(g, '#E8C48A', FD_INK, 1.2 * k);
      g.fillStyle = '#7A4A26'; g.font = '700 ' + 6.4 * k + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BANK →', 1 * k, -29.6 * k); g.restore(); },
    pit(g, x, y, k){ g.save(); g.translate(x, y); fdEll(g, 0, 0, 22 * k, 11 * k, '#5A3A22', FD_INK, 1.4 * k); fdEll(g, 0, 1.5 * k, 17 * k, 8 * k, '#2E1E14'); for(let i = 0; i < 6; i++){ const a = i * 1.05; fdEll(g, Math.cos(a) * 21 * k, Math.sin(a) * 10.5 * k, 3 * k, 1.6 * k, '#C9A26A', FD_INK, 0.5 * k, a); } g.restore(); },
    pigpen(g, x, y, k, t){ g.save(); g.translate(x, y); fdEll(g, 0, 0, 24 * k, 12 * k, '#8E6640', null); fdEll(g, 3 * k, 1 * k, 16 * k, 7 * k, '#6E4A2E'); g.strokeStyle = '#A0612C'; g.lineWidth = 1.6 * k;
      for(let i = 0; i < 9; i++){ const a = Math.PI * 0.95 + i * 0.16; const px = Math.cos(a) * 25 * k, py = Math.sin(a) * 12.5 * k; g.beginPath(); g.moveTo(px, py); g.lineTo(px, py - 9 * k); g.stroke(); } g.beginPath(); g.ellipse(0, -6 * k, 25 * k, 12.5 * k, 0, Math.PI * 0.95, Math.PI * 2.23); g.stroke();
      fdEll(g, 2 * k, -4 * k, 9 * k, 6 * k, '#FFB0C0', FD_INK, 1 * k); fdEll(g, 10 * k, -6 * k, 5 * k, 4.6 * k, '#FFB0C0', FD_INK, 0.9 * k); fdEll(g, 13.6 * k, -5.4 * k, 2 * k, 1.6 * k, '#F28CA0', FD_INK, 0.5 * k); fdEll(g, -1 * k, 0, 6 * k, 2.4 * k, '#6E4A2E'); g.restore(); },
    barrel(g, x, y, k){ shadow(g, x, y, 8, k); g.save(); g.translate(x, y); fdP(g, [[-8, 0], [8, 0], [9, -18], [-9, -18]], k); fdFS(g, '#A0612C', FD_INK, 1.2 * k); g.strokeStyle = '#5C6670'; g.lineWidth = 1.2 * k; [-4, -14].forEach(yy => { g.beginPath(); g.moveTo(-8.6 * k, yy * k); g.lineTo(8.6 * k, yy * k); g.stroke(); }); fdEll(g, 0, -18 * k, 9 * k, 3 * k, '#5EC3EA', FD_INK, 1 * k); g.restore(); },
    bridge(g, x, y, k, up){ g.save(); g.translate(x, y); if(up){ g.globalAlpha = 0.85; } fdP(g, [[-20, -2], [0, 8], [20, -2], [0, -12]], k); fdFS(g, up ? 'rgba(217,164,106,.35)' : '#D9A46A', FD_INK, 1.2 * k); if(!up){ g.strokeStyle = '#93633A'; g.lineWidth = 0.8 * k; for(let i = -3; i <= 3; i++){ g.beginPath(); g.moveTo((-10 + i * 3) * k, (3 + i * 1.5 - 5) * k); g.lineTo((10 + i * 3) * k, (-7 + i * 1.5 + 5) * k); g.stroke(); } } g.restore(); },
    house(g, x, y, k, t){ // 🏡 farmhouse with hayloft balcony (2×2 footprint, feet = front corner)
      g.save(); g.translate(x, y); shadow(g, 0, -2, 46, k);
      const w = 52, d = 30; fdP(g, [[-w, -d * 0.5], [0, 0], [0, -50], [-w, -50 - d * 0.5]], k); fdFS(g, '#C0392B', FD_INK, 1.5 * k); fdP(g, [[0, 0], [w * 0.8, -d * 0.6], [w * 0.8, -50 - d * 0.6], [0, -50]], k); fdFS(g, '#A82E22', FD_INK, 1.5 * k);
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 1.4 * k; fdP(g, [[-34, -14], [-14, -4], [-14, -34], [-34, -44]], k); g.stroke(); g.beginPath(); g.moveTo(-34 * k, -14 * k); g.lineTo(-14 * k, -34 * k); g.moveTo(-14 * k, -4 * k); g.lineTo(-34 * k, -44 * k); g.stroke();
      fdP(g, [[-w - 4, -48 - d * 0.5], [-w * 0.5, -84 - d * 0.25], [0, -48], [0, -48]], k); fdFS(g, '#7A4A26', FD_INK, 1.5 * k); fdP(g, [[-w * 0.5, -84 - d * 0.25], [w * 0.3, -84 - d * 0.55], [w * 0.8 + 4, -48 - d * 0.6], [0, -48]], k); fdFS(g, '#5A3A22', FD_INK, 1.5 * k);
      fdP(g, [[-30, -60], [-18, -55], [-18, -70], [-30, -75]], k); fdFS(g, '#2E1E14', FD_INK, 1 * k); g.fillStyle = '#F2D27A'; fdP(g, [[-30, -60], [-18, -55], [-18, -60], [-30, -64]], k); g.fill();
      fdP(g, [[18, -14], [30, -20], [30, -40], [18, -34]], k); fdFS(g, '#7FD3FF', FD_INK, 1 * k); fdEll(g, 34 * k, -78 * k, 4 * k, 4 * k, '#E8E8E8', FD_INK, 0.8 * k); g.restore(); },
    pumpkin(g, x, y, k, s){ s = s || 1; g.save(); g.translate(x, y); shadow(g, 0, 0, 9 * s, k); [-5, 5, 0].forEach((dx, i) => fdEll(g, dx * s * k, -7 * s * k, (i === 2 ? 7 : 6) * s * k, 7 * s * k, i === 2 ? '#FF9F1C' : '#F28A12', FD_INK, 1 * k)); g.fillStyle = '#3E9A45'; g.fillRect(-1 * s * k, -16 * s * k, 2 * s * k, 4 * s * k); g.restore(); },
    canalNote(){},
  };
  return P;
})();
const FG = (() => {
  const K = {
    mush: {name: 'Mushroom', icon: '🍄', cost: 2, does: 'cheap wall · 💤 spore puff slows', grow: [2, 4, 6, 9],
      b: [{name: 'Toadstool Tower', icon: '🏰', col: 'D', does: 'super-tough wall · bonks them back'}, {name: 'Dream Cap', icon: '💤', col: 'E', does: 'sleep spores — they nap 2 s'}]},
    corn: {name: 'Corn', icon: '🌽', cost: 3, does: 'tall wall · 🍿 pops corn at the nearest', grow: [3, 5, 7, 10],
      b: [{name: 'Popcorn Cannon', icon: '🍿', col: 'A', does: 'fast popcorn shots'}, {name: 'Corn Hedge', icon: '🌾', col: 'C', does: 'thick 3-stalk wall · "lost in the corn" slow'}]},
    sun: {name: 'Sunflower', icon: '🌻', cost: 4, does: '✨ dazzle beam (walk blind)', grow: [4, 6, 8, 11],
      b: [{name: 'Sun Mirror', icon: '🪞', col: 'E', does: 'long dazzle beam + Will drain'}, {name: 'Seed Fountain', icon: '🌰', col: 'B', does: '+🌰 seeds every wave'}]},
    pepper: {name: 'Pepper', icon: '🌶️', cost: 5, does: '🔥 hot puff (cone, Will burn)', grow: [5, 7, 9, 12],
      b: [{name: 'Dragon Chilli', icon: '🐲', col: 'A', does: 'big fire cone'}, {name: 'Pepper Popper', icon: '💥', col: 'C', does: 'drops pepper pops on the path'}]},
    pump: {name: 'Pumpkin', icon: '🎃', cost: 6, does: '🎃 rolls a pumpkin down the path', grow: [6, 8, 10, 14],
      b: [{name: 'Pumpkin Roller', icon: '🛞', col: 'A', does: 'giant pumpkin bowls a whole line'}, {name: 'Jack-o\'-Lantern', icon: '🏮', col: 'E', does: 'scary face — they run back 3 tiles'}]},
  };
  const SH = [null, {s: 0.45, n: 'seed'}, {s: 0.65, n: 'sprout'}, {s: 0.85, n: 'young'}, {s: 1.0, n: 'grown'}, {s: 1.25, n: 'giant ⭐'}];
  const pot = (g, x, y, k) => { fdEll(g, x, y, 14 * k, 5 * k, '#8E6640', FD_INK, 1.2 * k); fdEll(g, x, y - 1 * k, 10 * k, 3.4 * k, '#6E4A2E'); };
  const leaf = (g, x, y, l, a, k, col) => { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(l * 0.5 * k, -l * 0.35 * k, l * k, 0); g.quadraticCurveTo(l * 0.5 * k, l * 0.35 * k, 0, 0); fdFS(g, col || '#6FC24E', FD_INK, 0.9 * k); g.restore(); };
  const stem = (g, x, y, h, k, w, col) => { g.strokeStyle = FD_INK; g.lineWidth = (w + 1.6) * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h * k); g.stroke(); g.strokeStyle = col || '#5FAE45'; g.lineWidth = w * k; g.stroke(); };
  const sprout = (g, x, y, k, col) => { stem(g, x, y, 12, k, 2); leaf(g, x, y - 10 * k, 10, -0.5, k, col); leaf(g, x, y - 8 * k, 9, Math.PI + 0.5, k, col); };
  function cap(g, x, y, r, col, dots, k){ g.beginPath(); g.ellipse(x, y, r * k, r * 0.62 * k, 0, Math.PI, 0); g.quadraticCurveTo(x, y + r * 0.3 * k, x - r * k, y); fdFS(g, col, FD_INK, 1.3 * k); g.fillStyle = '#FFFFFF'; (dots || []).forEach(([dx, dy, rr]) => { g.beginPath(); g.arc(x + dx * r * k, y - dy * r * k, rr * r * k, 0, 7); g.fill(); }); }
  function mushroom(g, x, y, k, h, r, col){ fdP(g, [[-r * 0.28, 0], [r * 0.28, 0], [r * 0.2, -h], [-r * 0.2, -h]], k); g.save(); g.translate(x, y); fdP(g, [[-r * 0.28, 0], [r * 0.28, 0], [r * 0.2, -h], [-r * 0.2, -h]], k); fdFS(g, '#F6EBD8', FD_INK, 1.2 * k); g.restore(); cap(g, x, y - h * k, r, col, [[-0.5, 0.25, 0.13], [0, 0.45, 0.15], [0.5, 0.25, 0.13]], k); }
  function draw(g, kind, st, br, x, y, k, t){
    const S = SH[st], kk = k * S.s, B = st >= 4 ? br : -1; t = t || 0;
    fdEll(g, x, y, 20 * kk, 6 * kk, 'rgba(40,30,20,.22)');
    if(st === 1){ pot(g, x, y, k * 0.8); const c = {mush: '#E5484D', corn: '#FFD23F', sun: '#7A4A26', pepper: '#E5484D', pump: '#FF9F1C'}[kind]; fdEll(g, x, y - 3 * k, 3.4 * k, 2.6 * k, c, FD_INK, 0.8 * k); stem(g, x, y - 4 * k, 5, k, 1.4); leaf(g, x, y - 8 * k, 6, -0.6, k); return; }
    if(kind === 'mush'){
      if(st === 2){ mushroom(g, x, y, kk * 1.1, 14, 10, '#E5484D'); return; }
      if(st === 3){ mushroom(g, x - 10 * kk, y, kk, 16, 9, '#E5484D'); mushroom(g, x + 10 * kk, y + 2 * kk, kk, 12, 8, '#E5484D'); mushroom(g, x, y + 3 * kk, kk, 24, 13, '#E5484D'); return; }
      if(B === 0){ const H = st === 5 ? 46 : 38; mushroom(g, x, y, kk, H, 24, '#C0392B'); g.save(); g.translate(x, y); fdP(g, [[-3, -2], [3, -2], [3, -12], [0, -15], [-3, -12]], kk); fdFS(g, '#7A4A26', FD_INK, 0.9 * kk); [[-4, -22], [4, -30]].forEach(([wx, wy]) => { fdEll(g, wx * kk, wy * kk, 2 * kk, 2.4 * kk, '#FFE88A', FD_INK, 0.6 * kk); }); g.restore();
        if(st === 5){ [-1, 1].forEach(s => mushroom(g, x + s * 26 * kk, y + 2 * kk, kk, 12, 9, '#E5484D')); g.fillStyle = '#E5484D'; g.fillRect(x - 1 * kk, y - (H + 26) * kk, 1.6 * kk, 10 * kk); fdP(g, [[0, -(H + 26)], [8, -(H + 23)], [0, -(H + 20)]], 1); g.save(); g.translate(x, y); fdP(g, [[0.6, -(H + 26)], [8, -(H + 23)], [0.6, -(H + 20)]], kk); fdFS(g, FD_GOLD, FD_INK, 0.5 * kk); g.restore(); } return; }
      fdGlow(g, x, y - 34 * kk, 30 * kk, '#E8C8FF', 0.7); mushroom(g, x - 12 * kk, y, kk, 18, 10, '#B45AE8'); mushroom(g, x + 4 * kk, y + 2 * kk, kk, st === 5 ? 40 : 32, st === 5 ? 20 : 17, '#9B4FE0');
      for(let i = 0; i < (st === 5 ? 9 : 5); i++){ const a = t * 0.8 + i * 1.3; fdEll(g, x + Math.cos(a) * 24 * kk, y - 40 * kk + Math.sin(a * 1.4) * 14 * kk, 1.8 * kk, 1.8 * kk, '#F0C8FF'); } if(st === 5){ g.font = (12 * kk) + 'px sans-serif'; g.textAlign = 'center'; g.fillText('💤', x + 18 * kk, y - 66 * kk); } return; }
    if(kind === 'corn'){
      const stalk = (sx, h, cob) => { stem(g, sx, y, h, kk, 2.6); for(let i = 0; i < 3; i++){ const yy = y - (8 + i * h / 4) * kk; leaf(g, sx, yy, 13, i % 2 ? Math.PI + 0.4 : -0.4, kk); } if(cob) fdEll(g, sx + 2.5 * kk, y - h * 0.62 * kk, 2.6 * kk, 6 * kk, '#FFD23F', FD_INK, 0.7 * kk, 0.2); g.strokeStyle = '#E8B04B'; g.lineWidth = 0.9 * kk; g.beginPath(); g.moveTo(sx, y - h * kk); g.lineTo(sx - 3 * kk, y - (h + 6) * kk); g.moveTo(sx, y - h * kk); g.lineTo(sx + 3 * kk, y - (h + 7) * kk); g.stroke(); };
      if(st === 2){ sprout(g, x, y, kk * 1.4); return; }
      if(st === 3){ stalk(x, 40, true); return; }
      if(B === 0){ const H = st === 5 ? 1.25 : 1; stalk(x - 10 * kk, 34 * H, false); g.save(); g.translate(x + 4 * kk, y - 22 * kk * H); g.rotate(-0.6); fdEll(g, 0, -6 * kk, 7 * kk * H, 15 * kk * H, '#FFD23F', FD_INK, 1.2 * kk); g.fillStyle = '#E8B04B'; for(let i = -2; i <= 2; i++) for(let j = -3; j <= 3; j++) if(i * i * 9 + j * j < 14) g.fillRect((i * 2.6 - 0.8) * kk * H, (-6 + j * 3.6 - 0.8) * kk * H, 1.6 * kk, 1.6 * kk); g.restore();
        for(let i = 0; i < (st === 5 ? 7 : 4); i++){ const a = -0.9 + i * 0.25, r = 30 + i * 6; fdEll(g, x + 4 * kk + Math.cos(a) * r * kk, y - 40 * kk * H + Math.sin(a) * r * 0.6 * kk, 3 * kk, 2.6 * kk, '#FFF8E0', FD_INK, 0.6 * kk); } return; }
      [-12, 0, 12].concat(st === 5 ? [-24, 24] : []).forEach((dx, i) => stalk(x + dx * kk, (st === 5 ? 54 : 46) - Math.abs(dx) * 0.4, i % 2 === 0)); g.fillStyle = 'rgba(95,174,69,.35)'; g.fillRect(x - (st === 5 ? 28 : 16) * kk, y - 20 * kk, (st === 5 ? 56 : 32) * kk, 20 * kk); return; }
    if(kind === 'sun'){
      const flower = (fx, h, R, centre) => { stem(g, fx, y, h, kk, 2.4); leaf(g, fx, y - h * 0.4 * kk, 12, -0.5, kk); leaf(g, fx, y - h * 0.55 * kk, 11, Math.PI + 0.5, kk); for(let i = 0; i < 14; i++){ const a = i / 14 * 6.283 + t * 0.2; fdEll(g, fx + Math.cos(a) * R * kk, y - h * kk + Math.sin(a) * R * kk, R * 0.5 * kk, R * 0.22 * kk, '#FFD23F', '#D9A11A', 0.6 * kk, a); } fdEll(g, fx, y - h * kk, R * 0.6 * kk, R * 0.6 * kk, centre, FD_INK, 1 * kk); };
      if(st === 2){ sprout(g, x, y, kk * 1.4, '#7CC25A'); fdEll(g, x, y - 14 * kk * 1.4, 3 * kk, 3 * kk, '#7CC25A', FD_INK, 0.6 * kk); return; }
      if(st === 3){ flower(x, 34, 7, '#7A4A26'); return; }
      if(B === 0){ const R = st === 5 ? 15 : 12; flower(x, st === 5 ? 54 : 46, R, '#DDF4FF'); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(x - 3 * kk, y - ((st === 5 ? 54 : 46) + 3) * kk, 2.4 * kk, 0, 7); g.fill();
        g.globalAlpha = 0.45; g.fillStyle = '#FFF6B0'; g.beginPath(); g.moveTo(x, y - 48 * kk); g.lineTo(x + 70 * kk, y - 18 * kk); g.lineTo(x + 62 * kk, y + 4 * kk); g.closePath(); g.fill(); g.globalAlpha = 1; return; }
      flower(x, st === 5 ? 50 : 42, st === 5 ? 15 : 12, '#7A4A26'); for(let i = 0; i < (st === 5 ? 5 : 3); i++) fdEll(g, x + (-14 + i * 7) * kk, y - (2 + (i % 2) * 3) * kk, 2.6 * kk, 2 * kk, '#7A4A26', FD_INK, 0.5 * kk); g.font = (11 * kk) + 'px sans-serif'; g.textAlign = 'center'; g.fillText('🌰', x + 20 * kk, y - 30 * kk + Math.sin(t * 3) * 3 * kk); return; }
    if(kind === 'pepper'){
      const bush = (R, n, col) => { for(let i = 0; i < 7; i++){ const a = -2.7 + i * 0.4; fdEll(g, x + Math.cos(a) * R * 0.9 * kk, y - R * 0.9 * kk + Math.sin(a) * R * 0.7 * kk, R * 0.6 * kk, R * 0.36 * kk, '#4FA83A', FD_INK, 0.7 * kk, a); } fdEll(g, x, y - R * 0.9 * kk, R * kk, R * 0.85 * kk, '#5FB548', FD_INK, 1.1 * kk);
        for(let i = 0; i < n; i++){ const a = i * 2.4; fdEll(g, x + Math.cos(a) * R * 0.55 * kk, y - R * 0.9 * kk + Math.sin(a) * R * 0.45 * kk, 2 * kk, 4.6 * kk, col[i % col.length], FD_INK, 0.5 * kk, 0.3); } };
      if(st === 2){ sprout(g, x, y, kk * 1.4); return; }
      if(st === 3){ bush(13, 3, ['#E5484D']); return; }
      if(B === 0){ bush(st === 5 ? 20 : 17, st === 5 ? 7 : 5, ['#E5484D', '#FF7A2E']); g.save(); g.translate(x + 12 * kk, y - 30 * kk); g.rotate(0.6); fdEll(g, 0, 0, 5 * kk, 12 * kk, '#E5484D', FD_INK, 1 * kk); fdEll(g, -2 * kk, -3 * kk, 1.2 * kk, 1.6 * kk, '#FFFFFF'); fdEll(g, 2 * kk, -3 * kk, 1.2 * kk, 1.6 * kk, '#FFFFFF'); g.restore();
        fdGlow(g, x + 30 * kk, y - 26 * kk, 22 * kk, '#FFB070', 0.8); for(let i = 0; i < 4; i++) fdEll(g, x + (26 + i * 8) * kk, y - (28 - i * 2) * kk, (4 + i) * kk, (3 + i * 0.6) * kk, ['#FFD23F', '#FF9F1C', '#FF7A2E', '#E5484D'][i]); return; }
      bush(st === 5 ? 19 : 16, st === 5 ? 6 : 4, ['#E5484D', '#B45AE8']); for(let i = 0; i < (st === 5 ? 3 : 2); i++){ const px = x + (18 + i * 12) * kk, py = y - (34 + Math.sin(t * 2 + i) * 6 + i * 6) * kk; fdEll(g, px, py, 2.4 * kk, 5 * kk, '#E5484D', FD_INK, 0.6 * kk, 0.4); g.font = (9 * kk) + 'px sans-serif'; g.fillText('💥', px + 6 * kk, py + 14 * kk); } return; }
    // pumpkin
    const pk = (px, py, s, face) => { [-5, 5, 0].forEach((dx, i) => fdEll(g, px + dx * s * kk, py - 7 * s * kk, (i === 2 ? 7.5 : 6.4) * s * kk, 7.2 * s * kk, face ? '#F28A12' : (i === 2 ? '#FF9F1C' : '#F28A12'), FD_INK, 1 * kk)); g.fillStyle = '#3E9A45'; g.fillRect(px - 1 * s * kk, py - 17 * s * kk, 2 * s * kk, 4 * s * kk);
      if(face){ fdGlow(g, px, py - 7 * s * kk, 16 * s * kk, '#FFE07A', 0.6); g.fillStyle = '#FFE07A'; [[-3.5, -9], [3.5, -9]].forEach(([dx, dy]) => { fdP(g, [[dx - 2, dy + 1.2], [dx + 2, dy + 1.2], [dx, dy - 2]], 1); g.save(); g.translate(px, py); fdP(g, [[dx - 2, dy + 1.2], [dx + 2, dy + 1.2], [dx, dy - 2]], s * kk); g.fill(); g.restore(); }); g.save(); g.translate(px, py); fdP(g, [[-5, -4], [-2, -2.5], [0, -4], [2, -2.5], [5, -4], [3, -1.5], [-3, -1.5]], s * kk); g.fill(); g.restore(); } };
    const vine = (n) => { g.strokeStyle = '#3E9A45'; g.lineWidth = 2 * kk; g.beginPath(); g.moveTo(x - 20 * kk, y - 2 * kk); g.bezierCurveTo(x - 6 * kk, y - 12 * kk, x + 6 * kk, y + 4 * kk, x + 22 * kk, y - 4 * kk); g.stroke(); for(let i = 0; i < n; i++) leaf(g, x - 16 * kk + i * 10 * kk, y - 4 * kk, 9, -0.8 + (i % 2) * 2.6, kk, '#4FA83A'); };
    if(st === 2){ vine(2); return; }
    if(st === 3){ vine(4); pk(x + 6 * kk, y, 0.9, false); return; }
    if(B === 0){ vine(4); pk(x + 4 * kk, y + 2 * kk, st === 5 ? 2.4 : 1.9, false); if(st === 5){ g.strokeStyle = '#7A4A26'; g.lineWidth = 1.2 * kk; g.setLineDash([3 * kk, 3 * kk]); g.beginPath(); g.moveTo(x + 40 * kk, y); g.lineTo(x + 70 * kk, y + 8 * kk); g.stroke(); g.setLineDash([]); } return; }
    vine(4); pk(x + 4 * kk, y + 2 * kk, st === 5 ? 2.1 : 1.7, true); if(st === 5) for(let i = 0; i < 3; i++){ g.font = (10 * kk) + 'px sans-serif'; g.textAlign = 'center'; g.fillText('🦇', x + (-22 + i * 22) * kk, y - (52 + (i % 2) * 8) * kk + Math.sin(t * 4 + i) * 3 * kk); }
  }
  return {KINDS: K, SH, draw};
})();
const FA2 = (() => {
  const INK = FD_INK, rim = (g, k, w) => { g.strokeStyle = INK; g.lineWidth = (w || 1.5) * k; g.lineJoin = 'round'; g.lineCap = 'round'; };
  const E = (g, x, y, rx, ry, f, w, rot) => { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, 7); if(f){ g.fillStyle = f; g.fill(); } if(w !== 0) g.stroke(); };
  const shadow = (g, x, y, rx, k) => { g.save(); g.fillStyle = 'rgba(40,30,20,.22)'; g.beginPath(); g.ellipse(x, y, rx * k, rx * 0.42 * k, 0, 0, 7); g.fill(); g.restore(); };
  const legs = (g, k, xs, top, len, col, ph) => { xs.forEach((lx, n) => { const sw = Math.sin(ph + n * Math.PI) * 2.2; rim(g, k, 3.2); g.beginPath(); g.moveTo(lx * k, top * k); g.lineTo((lx + sw) * k, (top + len) * k); g.stroke(); g.strokeStyle = col; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(lx * k, top * k); g.lineTo((lx + sw) * k, (top + len - 0.4) * k); g.stroke(); }); };
  const eye = (g, x, y, k, shut) => { if(shut){ g.strokeStyle = INK; g.lineWidth = 0.9 * k; g.beginPath(); g.arc(x, y, 1.4 * k, 0.2, Math.PI - 0.2); g.stroke(); return; } g.fillStyle = INK; g.beginPath(); g.arc(x, y, 1.25 * k, 0, 7); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x + 0.4 * k, y - 0.45 * k, 0.45 * k, 0, 7); g.fill(); };
  function sheep(g, k, t, o){ const ph = o.act === 'walk' || o.act === 'run' ? t * 12 : 0, eat = o.act === 'eat', bob = o.act === 'walk' ? Math.abs(Math.sin(t * 12)) * 1.2 : 0;
    legs(g, k, [-7, -3, 4, 8], -7 - bob, 7 + bob, '#3A3236', ph);
    g.save(); g.translate(0, -bob * k);
    rim(g, k); g.beginPath(); const P = [[-12, -12], [-9, -19], [-2, -22], [5, -21], [11, -17], [13, -11], [10, -6], [2, -5], [-6, -5], [-12, -7]]; P.forEach(([x, y], n) => { const a = P[(n + 1) % P.length]; if(!n) g.moveTo(x * k, y * k); g.quadraticCurveTo((x + a[0]) / 2 * k + (Math.sign(x + a[0]) || 1) * 2.4 * k, ((y + a[1]) / 2 - 2.2) * k, a[0] * k, a[1] * k); });
    g.closePath(); g.fillStyle = '#FBF7EF'; g.fill(); g.stroke(); g.fillStyle = '#E9E2D4'; [[-6, -10], [3, -9], [-1, -16]].forEach(([x, y]) => { g.beginPath(); g.arc(x * k, y * k, 2.6 * k, 0, 7); g.fill(); });
    const hy = eat ? -6 : -15, hx = eat ? 15 : 13; g.save(); g.translate(hx * k, hy * k); g.rotate(eat ? 0.7 : -0.15); rim(g, k); E(g, 0, 0, 4.6 * k, 3.6 * k, '#3A3236'); E(g, -3 * k, -3.2 * k, 2.6 * k, 1.2 * k, '#3A3236', 1, -0.6); E(g, -1 * k, -3.6 * k, 3.4 * k, 2.4 * k, '#FBF7EF');
    eye(g, 1.4 * k, -0.6 * k, k, eat); g.restore(); g.restore(); }
  function dog(g, k, t, o){ const run = o.act === 'run' || o.act === 'walk', ph = run ? t * 16 : 0, eat = o.act === 'eat', bob = run ? Math.abs(Math.sin(t * 16)) * 1.4 : 0;
    legs(g, k, [-7, -4, 5, 8], -7 - bob, 7 + bob, '#E2913A', ph);
    g.save(); g.translate(0, -bob * k); const wag = Math.sin(t * (eat ? 22 : 10)) * 0.5;
    g.save(); g.translate(-11 * k, -12 * k); g.rotate(-0.9 + wag); rim(g, k); E(g, 0, -3 * k, 1.8 * k, 4 * k, '#F2A33A'); g.restore();
    rim(g, k); g.beginPath(); g.roundRect(-12 * k, -16 * k, 23 * k, 10 * k, 5 * k); g.fillStyle = '#F2A33A'; g.fill(); g.stroke(); E(g, 1 * k, -8 * k, 8 * k, 2.6 * k, '#FFF4DE', 0);
    g.fillStyle = '#E5484D'; g.fillRect(6 * k, -17 * k, 3.4 * k, 9 * k);
    const hx = eat ? 14 : 12, hy = eat ? -7 : -19; g.save(); g.translate(hx * k, hy * k); g.rotate(eat ? 0.6 : 0); rim(g, k); E(g, 0, 0, 5.6 * k, 4.8 * k, '#F2A33A'); E(g, 4.6 * k, 1.6 * k, 3 * k, 2.2 * k, '#FFF4DE'); E(g, 7.2 * k, 0.8 * k, 1.1 * k, 0.9 * k, INK, 0);
    rim(g, k); g.beginPath(); g.moveTo(-3 * k, -3 * k); g.lineTo(-2 * k, -10 * k); g.lineTo(2 * k, -4 * k); g.closePath(); g.fillStyle = '#E2913A'; g.fill(); g.stroke(); eye(g, 1.6 * k, -1.2 * k, k, false);
    if(run && !eat){ g.fillStyle = '#FF8FB1'; E(g, 5.6 * k, 4.6 * k, 1.4 * k, 2 * k, '#FF8FB1', 0); } g.restore(); g.restore(); }
  function pig(g, k, t, o){ const ph = o.act === 'walk' ? t * 12 : 0, mud = o.act === 'mud', eat = o.act === 'eat';
    if(!mud) legs(g, k, [-6, -3, 4, 7], -6, 6, '#F4A7B9', ph);
    rim(g, k); E(g, 0, -12 * k, 12 * k, 7.6 * k, '#FFB6C8'); if(mud){ g.fillStyle = '#7A5634'; g.beginPath(); g.ellipse(-3 * k, -8 * k, 8 * k, 3 * k, 0.2, 0, 7); g.fill(); E(g, 6 * k, -6 * k, 3 * k, 1.6 * k, '#7A5634', 0); }
    g.save(); g.translate((eat ? 12 : 11) * k, (eat ? -7 : -14) * k); rim(g, k); E(g, 0, 0, 5.4 * k, 5 * k, '#FFB6C8'); E(g, 4.6 * k, 1 * k, 2.4 * k, 2.2 * k, '#FF8FA8'); g.fillStyle = INK; [-0.8, 0.8].forEach(d => { g.beginPath(); g.arc(4.6 * k + d * k, 1 * k, 0.5 * k, 0, 7); g.fill(); });
    rim(g, k); g.beginPath(); g.moveTo(-3 * k, -3 * k); g.lineTo(-1 * k, -8 * k); g.lineTo(1.6 * k, -3.6 * k); g.closePath(); g.fillStyle = '#FF9FB6'; g.fill(); g.stroke(); eye(g, 1 * k, -1.4 * k, k, mud); g.restore();
    rim(g, k, 1.2); g.beginPath(); g.moveTo(-12 * k, -13 * k); g.bezierCurveTo(-16 * k, -16 * k, -13 * k, -19 * k, -15 * k, -21 * k); g.stroke(); }
  function duck(g, k, t, o){ const sw = o.act === 'splash', ph = t * 14, flap = sw ? Math.sin(t * 22) : 0;
    if(!sw) legs(g, k, [-1, 2], -4, 4, '#FF9F1C', o.act === 'walk' ? ph : 0);
    rim(g, k); g.beginPath(); g.moveTo(-9 * k, -9 * k); g.quadraticCurveTo(-10 * k, -2 * k, 0, -3 * k); g.quadraticCurveTo(8 * k, -3 * k, 7 * k, -10 * k); g.quadraticCurveTo(0, -13 * k, -9 * k, -9 * k); g.closePath(); g.fillStyle = '#FFE45C'; g.fill(); g.stroke();
    g.save(); g.translate(-1 * k, -8 * k); g.rotate(-0.3 - flap * 0.8); rim(g, k); E(g, 0, 0, 5 * k, 2.6 * k, '#FFD23F'); g.restore();
    rim(g, k); E(g, 7 * k, -14 * k, 4 * k, 4 * k, '#FFE45C'); rim(g, k); g.beginPath(); g.moveTo(10 * k, -14.5 * k); g.quadraticCurveTo(15 * k, -14 * k, 14 * k, -12 * k); g.lineTo(10 * k, -12.4 * k); g.closePath(); g.fillStyle = '#FF9F1C'; g.fill(); g.stroke(); eye(g, 8 * k, -15.4 * k, k, false);
    if(sw){ g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1.4 * k; for(let i = 0; i < 4; i++){ const a = -2.4 + i * 0.5; g.beginPath(); g.moveTo(Math.cos(a) * 10 * k, -4 * k + Math.sin(a) * 6 * k); g.lineTo(Math.cos(a) * 15 * k, -4 * k + Math.sin(a) * 9 * k); g.stroke(); } } }
  function chicken(g, k, t, o){ const run = o.act === 'run' || o.act === 'walk', ph = t * 18, peck = o.act === 'eat' ? Math.abs(Math.sin(t * 10)) : 0, bob = run ? Math.abs(Math.sin(ph)) * 1.4 : 0;
    legs(g, k, [-1.5, 1.8], -6 - bob, 6 + bob, '#FFB347', run ? ph : 0);
    g.save(); g.translate(0, -bob * k); rim(g, k); g.beginPath(); g.moveTo(-8 * k, -14 * k); g.quadraticCurveTo(-9 * k, -5 * k, 0, -5 * k); g.quadraticCurveTo(7 * k, -6 * k, 6 * k, -13 * k); g.lineTo(3 * k, -15 * k); g.quadraticCurveTo(-3 * k, -12 * k, -8 * k, -14 * k); g.closePath(); g.fillStyle = '#FFFFFF'; g.fill(); g.stroke();
    rim(g, k); g.beginPath(); g.moveTo(-8 * k, -14 * k); g.lineTo(-11 * k, -19 * k); g.lineTo(-7 * k, -17 * k); g.lineTo(-9 * k, -21 * k); g.lineTo(-5 * k, -16 * k); g.closePath(); g.fillStyle = '#F4EFE6'; g.fill(); g.stroke();
    E(g, -1 * k, -10 * k, 3.6 * k, 2.2 * k, '#F0EADF', 1, -0.3);
    g.save(); g.translate(5 * k, (-17 + peck * 6) * k); g.rotate(peck * 0.8); rim(g, k); E(g, 0, 0, 3.6 * k, 3.6 * k, '#FFFFFF'); rim(g, k, 1); g.beginPath(); g.moveTo(-1.5 * k, -3 * k); g.quadraticCurveTo(-1 * k, -6 * k, 0.4 * k, -4 * k); g.quadraticCurveTo(1.2 * k, -6.4 * k, 2.4 * k, -3.2 * k); g.closePath(); g.fillStyle = '#E5484D'; g.fill(); g.stroke();
    g.beginPath(); g.moveTo(3 * k, -0.8 * k); g.lineTo(6.4 * k, 0.4 * k); g.lineTo(3 * k, 1.4 * k); g.closePath(); g.fillStyle = '#FFB347'; g.fill(); g.stroke(); E(g, 2.6 * k, 3 * k, 1 * k, 1.6 * k, '#E5484D', 0); eye(g, 1 * k, -0.6 * k, k, false); g.restore(); g.restore(); }
  function cow(g, k, t, o){ const ph = o.act === 'walk' ? t * 9 : 0;
    legs(g, k, [-10, -6, 7, 11], -10, 10, '#FFFFFF', ph);
    rim(g, k); g.beginPath(); g.roundRect(-15 * k, -24 * k, 30 * k, 15 * k, 6 * k); g.fillStyle = '#FFFFFF'; g.fill(); g.stroke(); g.fillStyle = '#2B2D42'; [[-8, -19, 4, 3], [4, -15, 5, 3.2], [-1, -22, 2.4, 1.6]].forEach(([x, y, a, b]) => { g.beginPath(); g.ellipse(x * k, y * k, a * k, b * k, 0.3, 0, 7); g.fill(); });
    E(g, 2 * k, -9 * k, 3 * k, 2 * k, '#FFB4C8'); g.save(); g.translate(16 * k, -24 * k); rim(g, k); g.beginPath(); g.roundRect(-4 * k, -5 * k, 9 * k, 11 * k, 4 * k); g.fillStyle = '#FFFFFF'; g.fill(); g.stroke(); E(g, 1 * k, 5 * k, 5 * k, 3.4 * k, '#FFB4C8');
    rim(g, k, 1.2); g.beginPath(); g.moveTo(-3 * k, -4 * k); g.quadraticCurveTo(-6 * k, -9 * k, -2 * k, -9 * k); g.moveTo(3 * k, -4 * k); g.quadraticCurveTo(6 * k, -9 * k, 2 * k, -9 * k); g.stroke(); eye(g, 2 * k, -1 * k, k, false); g.restore();
    rim(g, k, 1.2); g.beginPath(); g.moveTo(-15 * k, -21 * k); g.quadraticCurveTo(-19 * k, -15 * k, -17 * k, -10 * k); g.stroke(); E(g, -17 * k, -9 * k, 1.6 * k, 2.2 * k, '#2B2D42', 0); }
  function bees(g, k, t){ for(let i = 0; i < 6; i++){ const a = t * 3 + i * 1.05, r = 8 + (i % 3) * 3; fdBee(g, Math.cos(a) * r * k, -18 * k + Math.sin(a * 1.3) * r * 0.6 * k, k * 1.4, t + i); } }
  const ANIMALS = {sheep, dog, pig, duck, chicken, cow, bees};
  function draw(g, kind, x, feet, k, t, o){ o = o || {}; const f = ANIMALS[kind]; if(!f) return; if(kind !== 'bees' && o.act !== 'splash' && o.act !== 'mud') shadow(g, x, feet, kind === 'cow' ? 16 : kind === 'duck' || kind === 'chicken' ? 7 : 12, k);
    g.save(); g.translate(x, feet); if((o.dir || 1) < 0) g.scale(-1, 1); f(g, k, t || 0, o); g.restore(); }
  function treat(g, x, y, k, rot){ g.save(); g.translate(x, y); g.rotate(rot || 0); rim(g, k, 1.2); g.beginPath(); g.roundRect(-4 * k, -1.2 * k, 8 * k, 2.4 * k, 1 * k); g.fillStyle = '#FFF4DE'; g.fill(); g.stroke();
    [-4, 4].forEach(d => { [-1.4, 1.4].forEach(e => { E(g, d * k, e * k, 1.7 * k, 1.7 * k, '#FFF4DE'); }); }); g.restore(); }
  function bag(g, x, y, k){ rim(g, k); g.beginPath(); g.moveTo(x - 9 * k, y); g.quadraticCurveTo(x - 11 * k, y - 15 * k, x - 4 * k, y - 18 * k); g.lineTo(x + 4 * k, y - 18 * k); g.quadraticCurveTo(x + 11 * k, y - 15 * k, x + 9 * k, y); g.closePath(); g.fillStyle = '#E8C48A'; g.fill(); g.stroke();
    g.strokeStyle = '#E5484D'; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(x - 5 * k, y - 17 * k); g.lineTo(x + 5 * k, y - 17 * k); g.stroke(); treat(g, x, y - 9 * k, k * 0.9, -0.3); treat(g, x + 2 * k, y - 20 * k, k * 0.7, 0.4); }
  function boat(g, x, y, k, t){ const r = Math.sin((t || 0) * 2) * 0.04; g.save(); g.translate(x, y); g.rotate(r); rim(g, k);
    g.beginPath(); g.moveTo(-20 * k, -6 * k); g.lineTo(20 * k, -6 * k); g.quadraticCurveTo(17 * k, 4 * k, 0, 4 * k); g.quadraticCurveTo(-17 * k, 4 * k, -20 * k, -6 * k); g.closePath(); g.fillStyle = '#B5793F'; g.fill(); g.stroke();
    g.fillStyle = '#8E5A2C'; g.fillRect(-18 * k, -6 * k, 36 * k, 2.2 * k); rim(g, k, 1.2); g.beginPath(); g.moveTo(2 * k, -6 * k); g.lineTo(2 * k, -40 * k); g.stroke();
    g.beginPath(); g.moveTo(3.5 * k, -38 * k); g.lineTo(18 * k, -12 * k); g.lineTo(3.5 * k, -12 * k); g.closePath(); g.fillStyle = '#FFFFFF'; g.fill(); rim(g, k); g.stroke(); g.fillStyle = '#E5484D'; g.fillRect(3.5 * k, -24 * k, 9 * k, 3 * k);
    g.beginPath(); g.moveTo(2 * k, -40 * k); g.lineTo(-6 * k, -37 * k); g.lineTo(2 * k, -34 * k); g.closePath(); g.fillStyle = '#FFC93C'; g.fill(); rim(g, k, 1); g.stroke(); g.restore(); }
  function lever(g, x, feet, k, on){ shadow(g, x, feet, 8, k); g.save(); g.translate(x, feet); rim(g, k); g.beginPath(); g.roundRect(-7 * k, -8 * k, 14 * k, 8 * k, 2 * k); g.fillStyle = '#9C6B3E'; g.fill(); g.stroke();
    g.save(); g.translate(0, -7 * k); g.rotate(on ? 0.6 : -0.6); rim(g, k, 2.6); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -16 * k); g.stroke(); g.strokeStyle = '#D9D2C2'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -16 * k); g.stroke();
    rim(g, k); E(g, 0, -17 * k, 3.6 * k, 3.6 * k, on ? '#22A867' : '#E5484D'); g.restore();
    rim(g, k, 1); g.beginPath(); g.moveTo(-4 * k, -4 * k); g.lineTo(4 * k, -4 * k); g.stroke(); g.restore(); }
  // 🌊 canal tile (iso-h1 Iso.addTile painter): dug earth banks + water + ripples
  function canal(g, q, s, i, j){ const P = pts => { g.beginPath(); pts.forEach((p, n) => n ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
    P([q(0, 0), q(1, 0), q(1, 1), q(0, 1)]); g.fillStyle = '#9C7046'; g.fill();
    P([q(0.12, 0.12), q(0.88, 0.12), q(0.88, 0.88), q(0.12, 0.88)]); g.fillStyle = '#4BB2DE'; g.fill();
    P([q(0.12, 0.12), q(0.88, 0.12), q(0.86, 0.3), q(0.14, 0.3)]); g.fillStyle = 'rgba(255,255,255,.18)'; g.fill();
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = Math.max(1, s * 1.1); const r = ((i * 7 + j * 3) % 5) / 10; g.beginPath(); const a = q(0.3 + r * 0.4, 0.55), b = q(0.5 + r * 0.4, 0.55); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, a[1] - 3 * s, b[0], b[1]); g.stroke();
    g.strokeStyle = 'rgba(60,40,20,.35)'; g.lineWidth = Math.max(1, s); P([q(0.12, 0.12), q(0.88, 0.12), q(0.88, 0.88), q(0.12, 0.88)]); g.stroke(); }
  function mudTile(g, q, s, i, j){ const P = pts => { g.beginPath(); pts.forEach((p, n) => n ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
    P([q(0, 0), q(1, 0), q(1, 1), q(0, 1)]); g.fillStyle = '#8A6844'; g.fill(); g.fillStyle = '#6E5234'; [[0.3, 0.4], [0.65, 0.3], [0.55, 0.7]].forEach(([u, v]) => { const c = q(u, v); g.beginPath(); g.ellipse(c[0], c[1], 5 * s, 2.4 * s, 0, 0, 7); g.fill(); }); }
  return {draw, treat, bag, boat, lever, canal, mudTile, KINDS: Object.keys(ANIMALS)};
})();

// 👑 2 new bosses on the collector painter (same suit / head / hand slots)
FCOL.T.mt = {name: 'Mrs. Treats', icon: '🦴', suit: '#8E4A8E', tie: '#FFC93C', hat: 'treat', item: 'bag', skin: 4, hair: 4, hc: 2, boss: true, skill: '🦴 Treat Bag: every animal near her stops to eat'};
FCOL.T.sb = {name: 'Speedy Bike Bill', icon: '🚴', suit: '#3E7D5A', tie: '#FF9F1C', hat: 'helmet', item: 'bike', skin: 2, hair: 6, hc: 5, boss: true, skill: '🔔 Bell: sheep jump aside · fast on dry ground, stuck in mud'};
(function(){ const old = FCOL.wear;
  FCOL.wear = function(g, slot, it, o){ const S = FCOL.T[it.k]; if(slot === 'head' && (S.hat === 'treat' || S.hat === 'helmet')){ const k = o.k, top = o.hy - 11 * k;
      if(S.hat === 'treat'){ fdEll(g, 0, top + 2 * k, 15 * k, 3.4 * k, '#C78ACB', FD_INK, 0.9 * k); g.beginPath(); g.arc(0, top + 1 * k, 9 * k, Math.PI, 0); fdFS(g, '#C78ACB', FD_INK, 0.9 * k); g.fillStyle = '#FFC93C'; g.fillRect(-9 * k, top - 1 * k, 18 * k, 2 * k); FA2.treat(g, 5 * k, top - 6 * k, k * 0.9, 0.5); return; }
      g.beginPath(); g.arc(0, top + 3 * k, 10 * k, Math.PI, 0); fdFS(g, '#FF9F1C', FD_INK, 1 * k); g.fillStyle = '#FFFFFF'; [-5, 0, 5].forEach(d => g.fillRect((d - 1) * k, top - 6 * k, 2 * k, 8 * k)); fdEll(g, 7 * k, top + 3 * k, 6 * k, 1.6 * k, '#3E7D5A', FD_INK, 0.6 * k); return; }
    if(slot === 'hand' && S.item === 'bag'){ FA2.bag(g, 0, 4 * o.k, o.k); return; }
    return old(g, slot, it, o); };
  const oldDraw = FCOL.draw; FCOL.draw = function(g, key, x, feet, k, t, o){ o = o || {}; const S = FCOL.T[key];
    if(key === 'sb'){ const d = o.dir || 1; g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2 * k; for(let i = 0; i < 3; i++){ g.beginPath(); g.moveTo(x - d * (24 + i * 4) * k, feet - (10 + i * 9) * k); g.lineTo(x - d * (40 + i * 4) * k, feet - (10 + i * 9) * k); g.stroke(); }
      oldDraw(g, key, x, feet, k, t, o); fdEll(g, x + d * 16 * k, feet - 30 * k, 3.4 * k, 3.4 * k, '#FFC93C', FD_INK, 0.9 * k); return; }
    return oldDraw(g, key, x, feet, k, t, o); };
})();
(function(){ const prev = window.AK_WEAR; window.AK_WEAR = function(g, slot, it, o){ if(it && it.who === 'farmer') return TDFarmer.wear(g, slot, it, o); if(it && it.who === 'col') return FCOL.wear(g, slot, it, o); return prev ? prev(g, slot, it, o) : undefined; }; })();
window.FD = FD; window.TDFarmer = TDFarmer; window.TDGoat = TDGoat; window.FG = FG;
Iso.addTheme('td-farm', {tile: {grass: {top: '#A9DC7E', top2: '#96D06C', side: '#9A6B43', lip: '#79B95A', deco: 'tuft'}, flower: {top: '#ADDE82', top2: '#99D270', side: '#9A6B43', lip: '#79B95A', deco: 'flower'}}}, 'storybook');
SCENE_PAL.farm = {sky1: '#8ED6FF', sky2: '#E9F8FF', hill1: '#A7D79A', hill2: '#7DBF84', g1: '#B5E58A', g2: '#8CCB64', g3: '#6DAE4E', path: '#E9C98F', edge: '#C49A62', stone: '#E0C08E', tint: null, sun: '#FFF3B0'};
SCENE_PAL.rain = {sky1: '#9DB6CF', sky2: '#E2ECF4', hill1: '#93B79A', hill2: '#6F9C80', g1: '#A6D884', g2: '#7FBD62', g3: '#62A24C', path: '#D9BB86', edge: '#B08B58', stone: '#CDB287', tint: 'rgba(90,120,160,.08)', sun: '#F4F8FF'};
DIARY.farmer = {
  1: {intro: 'Dear Diary (the Farmer\'s, not the goat\'s),\nA man in a grey suit brought a LETTER. 📋 "Pay the loan by Friday — or the bank takes the farm!"\nI have no money. I have mushrooms. 🍄\nChewy the goat says: "Make them WALK." 🐐\nSo… I\'ll grow a maze. A very long one.',
      outro: 'Dear Diary,\nMr. Clipboard walked 74 steps, sighed, dropped all his papers and went home for a nap. 📄💤\nChewy ate one of the papers. It said "FINAL NOTICE". It was not final.',
      lessons: [['🍄', 'Mushrooms like shade', 'Mushrooms are not plants — they are fungi! They have no leaves and need no sunlight, so they love damp, shady corners.'],
                ['🌽', 'Corn mazes', 'Farmers really cut giant mazes into corn fields every autumn. Some are so big you can see their picture from a plane!']]},
  2: {intro: 'Dear Diary,\nThe bank sent Mr. Umbrella. ☂️ Rain or shine, he never closes it.\nMy mushroom spores just bounce off! But today the corn and the sunflowers are ready. 🌽🌻\nChewy keeps head-butting the umbrella. It does not help. It is very funny.',
      outro: 'Dear Diary,\nA gust of wind took Mr. Umbrella\'s umbrella — and Mr. Umbrella with it! ☂️💨 He flew over the barn shouting "I\'LL BE BACK!"\nThe sunflowers turned to watch him go. 🌻',
      lessons: [['🌻', 'Sunflowers follow the sun', 'Young sunflowers turn to face the sun from morning to evening. Grown-up sunflowers stop moving and face east.'],
                ['☔', 'Rain helps plants', 'Plants drink rain through their roots. That\'s why everything in the farm grows a little faster on rainy days!']]},
  3: {intro: 'Dear Diary,\nChewy brought FRIENDS. 🐑🐑🐕 Sheep stand on the path like a fluffy wall — the collectors have to walk ALL the way round!\nBut today the bank sent the Treats Ladies. 🦴 They throw biscuits… and my sheep stop to eat. Every. Single. Time.\nThe peppers are ripe. 🌶️ Let\'s see who blinks first.',   // ✦ fd-2a
      outro: 'Dear Diary,\nMrs. Treats emptied her whole bag — and Rex ate it, then ate the bag. 👜🐕\nShe ran out of biscuits, then out of breath, then out of the farm.\nThe sheep are still chewing. 🐑',
      lessons: [['🐑', 'Sheep stick together', 'Sheep feel safe in a group, called a flock. If one sheep walks off, the others usually follow — that\'s why one good sheepdog can move hundreds of them!'],
                ['🌶️', 'Why peppers are hot', 'Hot peppers make a stuff called capsaicin. Birds can\'t taste it, so they eat the peppers and spread the seeds — but animals with teeth stay away!']]},
  4: {intro: 'Dear Diary,\nThe bank bought BIKES. 🚲 Ding-ding! The clerks zoom down my maze twice as fast.\nBut bikes HATE mud — and the pond is right there. 🌊\nToday I dig canals, build lift bridges and pull the corn lever. 🌽 Chewy wants to be the bridge-keeper.',   // ✦ fd-2b
      outro: 'Dear Diary,\nSpeedy Bike Bill rang his bell all the way into the mud. 🔔🟫 Then the bridge went UP. 🌉\nHe pedalled round the pond three times, sat down on the bank and said "I\'ll take the bus."\nChewy kept his bell. 🐐',
      lessons: [['🌊', 'What canals do', 'People dig canals to bring water to fields and to let boats travel where there was no river. Some canals are hundreds of years old!'],
                ['🟫', 'Why bikes stick in mud', 'Wet mud is soft and sticky — a thin bike wheel sinks in and has to push the mud away, so it slows right down. Wide tractor tyres sink much less.']]},
};
const FDP = {sel: 'mush', pick: null, mode: 'plant', moveId: 0, hint: [], ghosts: [], pics: new Map(), bgs: [null, null, null], bgKey: '', tod: 0, morph: {farmer: null, goat: null}, seen: {farmer: 1, goat: 1}, toldSeal: 0, used: 0, card: 0, rain: []};
const isFarm = () => !!(G && G.fd);
const FD_HK = {mush: 'A', corn: 'S', sun: 'D', pepper: 'F', pump: 'G', canal: 'H', bridge: 'J'};   // 🌊 fd-2b: + canal / bridge
const FD_COLOR = {mush: '#E5484D', corn: '#F2B92A', sun: '#FFB020', pepper: '#E8341C', pump: '#FF8A1F', canal: '#3A86FF', bridge: '#8E5A2C'};
const fdK2 = k => FD.kindOf(k) || FD.PLANTS.mush;   // 🌊 fd-2b: a plant or a build tool
(function(){ const st = document.createElement('style'); st.id = 'fd-css'; st.textContent = [
  '.fd-build{display:flex;align-items:center;gap:var(--bgap,7px);flex-wrap:wrap;justify-content:center;background:rgba(255,255,255,.55);border-radius:16px;padding:4px 8px;box-shadow:0 2px 0 rgba(0,0,0,.08)}',
  '.fd-plant{position:relative;width:var(--skk-bs,46px);height:var(--skk-bs,46px);border-radius:14px;border:2.5px solid #fff;background:linear-gradient(180deg,#FFF8E6,#F3DDB0);box-shadow:0 3px 0 #C9A46A,0 0 0 2px var(--pc,#8BC34A);font-size:calc(var(--skk-bs,46px)*.5);line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:transform .12s}',
  '.fd-plant .pr{position:absolute;right:-5px;bottom:-6px;background:#5C3B1E;color:#fff;font:800 11px/1 Fredoka,Nunito,sans-serif;padding:2px 4px;border-radius:8px;border:1.5px solid #fff}',
  '.fd-plant.on{transform:translateY(-3px) scale(1.06);box-shadow:0 3px 0 #C9A46A,0 0 0 3px #FFC93C,0 0 14px #FFC93C;background:linear-gradient(180deg,#FFFDF2,#FFE7A6)}',
  '.fd-plant.poor{filter:grayscale(.6) brightness(.95)} .fd-plant.poor .pr{background:#B23B3B}',
  '.fd-plant.lock{filter:grayscale(1);opacity:.55} .fd-plant.lock .pr{background:#777}',
  '.fd-plant.tool{background:linear-gradient(180deg,#EAF6FF,#BFE3FF);box-shadow:0 3px 0 #6FA8D6,0 0 0 2px var(--pc,#3A86FF)} .fd-plant.tool.on{background:linear-gradient(180deg,#F4FBFF,#CFEBFF)}',   /* 🌊 fd-2b */
  '.fd-seeds{font:800 clamp(.9rem,1.6vmin + .5rem,1.25rem) Fredoka,Nunito,sans-serif;color:#5C3B1E;white-space:nowrap;padding:0 4px}',
  '.fd-steps{position:absolute;left:8px;bottom:8px;z-index:6;background:rgba(255,255,255,.9);border-radius:12px;padding:3px 9px;font:800 clamp(.72rem,1.2vmin + .45rem,1rem) Fredoka,Nunito,sans-serif;color:#5C3B1E;box-shadow:0 2px 0 rgba(0,0,0,.12);pointer-events:none;max-width:70%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.fd-steps b{color:#22A867}',
  '.fd-card{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);z-index:30;background:#FFF9EC;border:3px solid #fff;border-radius:18px;box-shadow:0 6px 0 rgba(90,60,30,.25),0 10px 30px rgba(0,0,0,.25);padding:10px 12px;display:flex;flex-direction:column;gap:8px;width:min(92%,420px);animation:fdIn .22s ease-out both}',
  '@keyframes fdIn{from{transform:translateX(-50%) translateY(20px) scale(.9);opacity:0}to{transform:translateX(-50%);opacity:1}}',
  '.fd-card .hd{display:flex;align-items:center;gap:8px;font:800 1.05rem Fredoka,Nunito,sans-serif;color:#5C3B1E} .fd-card .hd .ic{font-size:1.7rem} .fd-card .hd small{display:block;font:600 .8rem Nunito,sans-serif;color:#8A6A48}',
  '.fd-card .st{display:flex;gap:4px} .fd-card .st i{width:16px;height:8px;border-radius:4px;background:#E8D9BE} .fd-card .st i.on{background:#7CC25A}',
  '.fd-card .row{display:flex;gap:6px;flex-wrap:wrap} .fd-card .row .sp-btn{flex:1 1 40%;min-height:44px;font-size:.9rem}',
  '.fd-card .hd .ic .fd-pp{display:block} .fd-card .fd-gp{flex-direction:column;gap:2px} .fd-card .fd-gp .fd-pp{display:block;flex:0 0 auto;pointer-events:none;filter:drop-shadow(0 2px 2px rgba(0,0,0,.25))} .fd-card .fd-gp br{display:none}',
  '.fd-card .x{position:absolute;right:6px;top:4px;border:0;background:none;font-size:1.2rem;cursor:pointer;width:36px;height:36px}',
  '.fd-story{position:absolute;inset:0;z-index:35;display:flex;align-items:center;justify-content:center;background:rgba(40,25,10,.45)}',
  '.fd-story .pg{background:#FFF6E2;border:4px solid #fff;border-radius:20px;max-width:min(92%,460px);padding:14px 16px;text-align:center;font:600 1rem Nunito,sans-serif;color:#4A3420;box-shadow:0 8px 30px rgba(0,0,0,.3);animation:fdPop .3s ease-out both}',
  '.fd-story .pg h3{font:800 1.25rem Fredoka,Nunito,sans-serif;margin:0 0 6px} .fd-story .pg .big{font-size:2.2rem}',
  '@keyframes fdPop{from{transform:scale(.7);opacity:0}to{transform:none;opacity:1}}',
  '.book.soon .bi{margin-top:clamp(10px,2.2vw,24px)}',   /* 🔜 the ribbon never sits on a coming-soon book\'s emoji */
].join('\n'); document.head.appendChild(st); })();

/* ---------- ▶ start a chapter ---------- */
function fdStart(ch, lvl, opt){
  if(typeof Props !== 'undefined' && Props.need && !['farm', 'grow', 'jungle'].every(n => Props.has(n))){ Props.need(['farm', 'grow', 'jungle'], () => fdStart(ch, lvl, opt)); return; }   // ✦ fd-2a: the farm looks on demand (IsoProps ip-4a)
  opt = opt || {}; S.chapter = ch; S.level = lvl; stopLoop(); hideResult(); S.jail = null; fdCloseCard(); fdCloseStory();
  G = FD.newMatch({chapter: ch, level: lvl, auto: autoOn, bonusHearts: opt.bonus || 0});
  if(window.ActionFX){ act2Reset(); ActionFX.opts.shake = lvl > 0; }
  FT = []; PARTS = []; guideUsed = 0; pickOpen = false; speedOn = false; G.speed = 1; Object.assign(FDP, {sel: 'mush', pick: null, mode: 'plant', moveId: 0, hint: [], ghosts: [], bgKey: '', used: 0, toldSeal: 0, morph: {farmer: null, goat: null}, seen: {farmer: 1, goat: 1}});
  const L = LEVELS[lvl]; BAR.level(L.emoji + ' ' + L.name + ' · Ch ' + ch, L.hardcore ? 'hc' : ''); BAR.hide('lives'); BAR.hide('foes');
  paintAuto(); $('speed-btn').textContent = '⏩'; $('goal').style.opacity = 1;
  $('goal').textContent = opt.bonus ? '🎃 Second try: +' + opt.bonus + ' pumpkins — make the walk LONG!' : G.C.pond ? '🌊 Dig canals, lift 🌉 bridges, pull the 🌽 lever — bikes hate mud!' : '🍄 Plant a maze — make the collectors walk so far they give up!';   // 🌊 fd-2b
  if(!$('fd-steps')){ const d = document.createElement('div'); d.className = 'fd-steps'; d.id = 'fd-steps'; $('stage').appendChild(d); }
  $('fd-steps').classList.remove('hidden');
  FDZ.z = 1; FDZ.ox = FDZ.oy = 0; FDR.spin = null; fdSetRot(fdRotSaved() * Math.PI / 2); FDP.lmode = fdMode(); $('scr-play').classList.add('fd'); $('scr-play').classList.toggle('fd-land', fdMode() === 'land');
  showScreen('play'); BAR.fit(); fdRenderPanel(); layout(); BAR.fit(); fdZoomButtons(); fdHud(true);
  last = 0; raf = requestAnimationFrame(loop);
  setTimeout(nextPick, FX ? 450 : 0);
}
function fdLeave(){ FDR.spin = null; fdSetRot(0); ISO.rq = 0; fdCloseCard(); fdCloseStory(); const s = $('fd-steps'); if(s) s.classList.add('hidden'); const zb = $('fd-zoom'); if(zb) zb.classList.add('hidden'); const sp = $('scr-play'); sp.classList.remove('fd', 'tl', 'tl-land', 'fd-port'); { const bb = $('fd-build'); if(bb) bb.remove(); } FDZ.z = 1; FDZ.ox = FDZ.oy = 0; if(typeof VIEW !== 'undefined' && VIEW.base){ VIEW.s = VIEW.base; VIEW.base = null; VIEW.px = -1; } BAR.hide('pump'); BAR.hide('seeds'); BAR.hide('coll'); }

/* ---------- 🦸 panel: 🌱 build bar + 👨‍🌾 / 🐐 skill rows ---------- */
function fdRenderPanel(){
  if(!isFarm()) return; const P = $('panel'); P.innerHTML = ''; BTN = []; { const o = $('fd-build'); if(o) o.remove(); }
  const bb = document.createElement('div'); bb.className = 'fd-build'; bb.id = 'fd-build';
  bb.innerHTML = '<span class="fd-seeds" id="fd-seeds" title="Seeds to plant with">🌰 ' + G.seeds + '</span>' + FD.KINDS.concat(G.C.pond ? FD.TOOL_KEYS : []).map(k => { const K = fdK2(k), lock = K.ch > G.C.n;   // 🌊 fd-2b: + 🌊 canal · 🌉 bridge in the pond chapters
    return '<button type="button" class="fd-plant' + (FD.TOOLS[k] ? ' tool' : '') + (lock ? ' lock' : '') + (FDP.sel === k ? ' on' : '') + '" data-kind="' + k + '" data-hk="' + FD_HK[k] + '" data-sound="tap" style="--pc:' + FD_COLOR[k] + '" title="' + UI.esc(K.name + ' — ' + K.does + (lock ? ' (opens in chapter ' + K.ch + ')' : '')) + '">' + K.icon + '<span class="pr">' + (lock ? '🔒' : K.cost + '🌰') + '</span></button>'; }).join('');
  P.appendChild(bb);
  bb.querySelectorAll('.fd-plant').forEach(el => { el.onclick = () => fdSelect(el.dataset.kind); });
  fdBuildSize(); if(fdMode() === 'land') fdPlaceBuild('land');   // sideways phone: the plant column sits left of the map (the hero rows fold to 3 × 2 by CSS)
  ['farmer', 'goat'].forEach((h, hi) => {
    const T = G.trees[h], H = FD.HEROES[h], box = document.createElement('div'); box.className = 'hero'; box.dataset.h = h;
    const btns = T.buttons(), act = btns.filter(b => !b.ult && !b.combo), ult = btns.find(b => b.ult), keys = hi === 0 ? ['1', '2', '3', '4', '5', '6'] : ['Q', 'W', 'E', 'R', 'T', 'Y'];
    const st = FD.stageOf(T.tier), nm = h === 'farmer' ? TDFarmer.nameOf(st, T.main) : TDGoat.nameOf(st, T.main);
    box.innerHTML = '<div class="hh"><span class="hf" id="hf-' + h + '" title="' + UI.esc(nm) + '"><canvas class="hfc" width="64" height="64" aria-hidden="true"></canvas><i class="hfe">' + H.icon + '</i></span><span class="hn"><b>' + H.icon + ' ' + UI.esc(nm) + '</b><small>Tier ' + T.tier + ' / 10 · ' + SkillKit.barHtml(T.bar()) + '</small></span></div>' +
      '<div class="btns">' + COLS.map(c => { const b = act.find(x => x.col === c); return b ? SkillKit.buttonHtml(b, {}) : '<button type="button" class="skk-btn empty" style="--c:' + COLORS[c].hex + '" tabindex="-1" title="' + COLORS[c].en + ' slot (empty)"><span style="font-size:.5em;opacity:.7">' + COLORS[c].dot + '</span></button>'; }).join('') +
      (ult ? SkillKit.buttonHtml(ult, {}) : '<button type="button" class="skk-btn empty ult" tabindex="-1" title="⭐ Ultimate at tier 10"><span style="font-size:.55em">⭐</span></button>') + '</div>';
    P.appendChild(box); fdFace(box.querySelector('.hfc'), h);
    box.querySelectorAll('.skk-btn:not(.empty)').forEach(el => { const key = el.dataset.key; el.onclick = () => fdTapSkill(h, key, el); BTN.push({el, h, key}); });
    box.querySelectorAll('.btns .skk-btn').forEach((el, i) => { el.dataset.hk = keys[i]; });
  });
  const cs = $('combo-slot'); cs.innerHTML = '';
  ['farmer', 'goat'].forEach(h => { const b = G.trees[h].buttons().find(x => x.combo); if(b){ cs.innerHTML = SkillKit.buttonHtml(b, {}).replace('class="skk-btn', 'id="combo-btn" class="skk-btn'); const el = $('combo-btn'); el.onclick = () => fdTapSkill(h, b.key, el); BTN.push({el, h, key: b.key}); } });
}
function fdFace(cv, h){ if(!cv) return; try{ const g = cv.getContext('2d'); g.clearRect(0, 0, 64, 64); g.fillStyle = h === 'farmer' ? 'rgba(255,214,120,.5)' : 'rgba(190,230,160,.55)'; g.beginPath(); g.arc(32, 34, 30, 0, Math.PI * 2); g.fill();
  const T = G ? G.trees[h] : null, st = T ? FD.stageOf(T.tier) : 1, col = T ? T.main : null;
  if(h === 'farmer') TDFarmer.draw(g, st, col, 32, 74, 0.82, 0.3, {}); else TDGoat.draw(g, st, col, 32, 56, 0.9, 0.3, {});
  cv.parentNode.classList.add('pic'); }catch(e){} }
function fdSelect(k){
  if(!isFarm()) return; const K = fdK2(k); if(K.ch > G.C.n){ UISound.play('error'); UI.toast('🔒 ' + K.icon + ' ' + K.name + ' opens in chapter ' + K.ch); return; }
  FDP.sel = k; FDP.mode = 'plant'; FDP.moveId = 0; FDP.pick = null; document.querySelectorAll('#fd-build .fd-plant').forEach(el => el.classList.toggle('on', el.dataset.kind === k));
  banner(K.icon + ' ' + K.name + ' · ' + K.cost + ' 🌰 — ' + K.does + (k === 'bridge' ? ' · tap a 🌊 canal' : ''));
}
function fdTapSkill(h, key, el){
  if(!G || G.state !== 'wave' || G.paused){ UISound.play('bump'); return; }
  if(!FD.ready(G, h, key)){ UISound.play('bump'); el.animate([{transform: 'translateX(-4px)'}, {transform: 'translateX(4px)'}, {transform: 'none'}], {duration: 220}); return; }
  if(!FD.cast(G, h, key)){ UISound.play('bump'); floatText(FD.CX, FD.CY - 2.4, '👀 Nobody to aim at yet', '#7A5C88', 1.1); return; }
  guideUsed++; UISound.play('whoosh'); hideHand(); try{ SkillKit.castPop(el); }catch(e){}
}
function fdPanelTick(){
  if(!isFarm()) return;
  BTN.forEach(B => { const cd = FD.cdOf(G, B.h, B.key) || 1, left = Math.max(0, G.cd[B.h][B.key] || 0), rd = left <= 0 && G.state === 'wave';
    const f = Math.min(1, left / cd).toFixed(3); if(B.el.style.getPropertyValue('--cd') !== f) B.el.style.setProperty('--cd', f); if(B.el.classList.contains('ready') !== rd) B.el.classList.toggle('ready', rd); });
  const sd = $('fd-seeds'); if(sd){ const t = '🌰 ' + G.seeds; if(sd.textContent !== t) sd.textContent = t; }
  document.querySelectorAll('#fd-build .fd-plant').forEach(el => { const K = fdK2(el.dataset.kind), poor = K.ch <= G.C.n && G.seeds < K.cost; if(el.classList.contains('poor') !== poor) el.classList.toggle('poor', poor); });
}
function fdHud(force){
  if(!isFarm()) return; BAR.count('pump', '🎃', Math.max(0, G.hearts), 'Pumpkins left — lose them all and the bank takes the farm', G.hearts <= Math.max(2, G.heartsMax * 0.25));
  BAR.round(Math.max(1, G.wave + 1), G.C.waves.length); BAR.score(G.score.toLocaleString()); BAR.count('seeds', '🌰', G.seeds, 'Seeds to plant with');
  BAR.count('coll', '📋', FD.liveAll(G).length + G.spawnQ.length, 'Collectors still coming');
  const st = FD.stepsOf(G), mx = Math.max.apply(null, st), el = $('fd-steps');
  if(el){ const plus = mx - G.baseSteps, t = '👣 ' + mx + ' steps' + (plus > 0 ? ' · +' + plus + ' from your maze' : ' — plant to make it longer!'); if(el.dataset.t !== t){ el.dataset.t = t; el.innerHTML = '👣 <b>' + mx + '</b> steps' + (plus > 0 ? ' · +' + plus + ' from your maze 🍄' : ' — plant to make it longer!'); } }
  goLabel();   // 🔔 fd-1e: label + ring live in the GO BUTTONS block
}

/* ---------- 🃏 picks + break ---------- */
function fdNextPick(){
  if(!G || G.state !== 'pick'){ fdAfterPicks(); return; }
  const o = FD.offer(G); if(!o){ fdAfterPicks(); return; }
  const h = G.queue[0], T = G.trees[h], H = FD.HEROES[h], st = FD.stageOf(T.tier), nm = h === 'farmer' ? TDFarmer.nameOf(st, T.main) : TDGoat.nameOf(st, T.main);
  const title = o.kind === 'evolve' ? '⭐ ' + H.icon + ' ' + H.name + ' is EVOLVING! Pick your main colour' : o.kind === 'ultimate' ? '⭐ ' + H.icon + ' Final form! Here is your ULTIMATE' : H.icon + ' ' + nm + ' levels up! Tier ' + o.tier + ' — pick ONE';
  const sub = o.kind === 'pick' ? (G.lvl === 0 ? '👆 The glowing card is a good pick' : 'Your build: ') : o.kind === 'evolve' ? 'The main colour shows up more often from now on' : 'Tap it to make it yours!';
  pickOpen = true; fdCloseCard();
  const pr = SkillKit.pickSheet($('arena'), o, {title, sub, fast: !FX});
  const sh = document.querySelector('#arena .skk-sheet:last-child'); if(sh && o.kind === 'pick' && G.lvl !== 0) sh.querySelector('.h2').innerHTML = T.bar().length ? 'Your build: ' + SkillKit.barHtml(T.bar()) + (T.main ? ' · main ' + COLORS[T.main].dot : '') : '✨ Your very first skill — every colour does something different!';
  if(LEVELS[G.lvl].guide || (G.glowLeft > 0 && T.glow)) setTimeout(placeHandOnGlow, FX ? 520 : 0);
  pr.then(card => {
    pickOpen = false; hideHand(); if(!G || !G.fd) return;
    FD.take(G, card); UISound.play(card.type === 'evolve' || card.type === 'ultimate' ? 'success' : 'unlock'); fdRenderPanel();
    if(card.type === 'evolve' || card.type === 'ultimate'){ banner(card.type === 'evolve' ? '⭐ ' + H.name + ' evolves!' : '⭐ ULTIMATE ready!', 'gold'); if(FX) confetti(['⭐', '✨', COLORS[card.col].dot]); }
    else { const p = h === 'farmer' ? G.heroes.farmer : G.heroes.goat; floatText(p.x, p.y - 1.2, (card.type === 'up' ? '⬆️ ' : '✨ ') + card.name, COLORS[card.col].hex, 1.6); }
    setTimeout(nextPick, FX ? 260 : 0);
  });
}
function fdAfterPicks(){
  if(!G || !G.fd) return; layout();
  if(G.state === 'break'){ const n = G.wave + 2, boss = G.C.waves[n - 1].some(g => FD.FOES[g[0]].boss), rain = G.C.rain && G.C.rain.includes(n - 1);
    banner(boss ? '👑 BOSS WAVE: ' + FD.FOES[G.C.boss].name + '!' : (rain ? '🌧️ ' : '🌊 ') + 'Wave ' + n + ' of ' + G.C.waves.length + ' — plant your maze, then ▶ Go!', boss ? 'bad' : '');
    goShow(); fdHints();   // 🔔 fd-1e
    if(LEVELS[G.lvl].guide && G.wave < 0) setTimeout(() => fdHandOnSpot(), FX ? 300 : 0); }
}
// 👆 / 👻 the best spots glow (🌱 Basic + 🐣 Junior, and while a "new route" break is open)
function fdHints(){ if(!isFarm()) return; FDP.hint = (G.lvl <= 1 || G.freeMoveT > 0) && !LEVELS[G.lvl].hardcore ? FD.bestSpots(G, G.lvl === 0 ? 1 : 3) : []; }
function fdHandOnSpot(){ if(!isFarm() || pickOpen || !FDP.hint.length) return; const h = FDP.hint[0], r = $('cv').getBoundingClientRect(), x = r.left + IX(FD.wx(h.i), FD.wx(h.j)), y = r.top + IY(FD.wx(h.i), FD.wx(h.j), 0);
  const el = $('hand'); el.classList.remove('hidden'); el.style.left = (x - 12) + 'px'; el.style.top = (y - 6) + 'px'; HAND = $('cv'); }
function fdGuide(){
  if(!isFarm() || !LEVELS[G.lvl].guide || pickOpen) return;
  if(G.state === 'break' && G.plants.length < 3 && FDP.hint.length){ if(HAND !== $('cv')) fdHandOnSpot(); return; }
  if(G.state === 'break' && G.plants.length >= 3){ if(HAND !== $('go-btn')) showHandAt($('go-btn')); return; }
  if(G.state === 'wave' && guideUsed < 3 && FD.live(G).length){ const b = BTN.find(B => B.el.classList.contains('ready')); if(b){ if(HAND !== b.el) showHandAt(b.el); return; } }
  if(HAND) hideHand();
}

/* ---------- 👆 tapping the map: plant (tap twice) · open a plant · move ---------- */
function fdCellAt(px, py){ const p = fdWorldAt(px, py), x = p.x, y = p.y; return {i: Math.floor(x + FD.O), j: Math.floor(y + FD.O)}; }
function fdWorldAt(px, py){ const a = (px - ISO.OX) / ISO.A, b = (py - ISO.OY) / ISO.B, x1 = (a + b) / 2, y1 = (b - a) / 2; if(!ISO.rq) return {x: x1, y: y1};   // 🔄 fd-1d: undo the turn
  const dx = x1 - ISO.rcx, dy = y1 - ISO.rcy; return {x: ISO.rcx + ISO.rc * dx + ISO.rs * dy, y: ISO.rcy - ISO.rs * dx + ISO.rc * dy}; }
function fdTap(e){
  if(FDR.spin) return;   // 🔄 no planting mid-spin
  if(!isFarm() || pickOpen || G.paused || G.state === 'won' || G.state === 'lost' || G.state === 'pick') return;
  const r = $('cv').getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, c = fdCellAt(px, py);
  let P = FD.plantAt(G, c.i, c.j); if(FDP.mode !== 'move'){ const H = fdPlantHit(px, py); if(H && (!P || fdDep(H.x, H.y) > fdDep(P.x, P.y))){ fdOpenCard(H); return; } }   // 👆 fd-1d: the top of a tall plant IN FRONT wins (it is what you see there)
  if(P && FDP.mode !== 'move'){ fdOpenCard(P); return; }
  if(FDP.mode !== 'move' && fdPondTap(c)) return;   // 🌊 fd-2b
  if(FDP.mode === 'move'){ const mp = G.plants.find(q => q.id === FDP.moveId); if(!mp){ FDP.mode = 'plant'; return; }
    if(P && P.id === mp.id){ FDP.mode = 'plant'; FDP.moveId = 0; banner('🚚 Move cancelled'); return; }
    if(FD.move(G, mp.id, c.i, c.j)){ UISound.play('pop'); FDP.mode = 'plant'; FDP.moveId = 0; FDP.pick = null; fdHints(); } return; }
  fdCloseCard();
  if(FDP.pick && FDP.pick.i === c.i && FDP.pick.j === c.j){ const P2 = FD.plant(G, c.i, c.j, FDP.sel); FDP.pick = null; if(P2){ UISound.play('pop'); FDP.used++; fdHints(); } return; }
  if(FDP.sel === 'bridge'){ FDP.pick = null; banner('🌉 Bridges go on a canal — dig one first with 🌊', 'bad'); UISound.play('bump'); return; }   // 🌊 fd-2b
  const can = FD.canPlant(G, c.i, c.j, FDP.sel); if(!FD.buildable(G, c.i, c.j)){ FDP.pick = null; return; }
  FDP.pick = {i: c.i, j: c.j, can, pre: can.ok || can.why === 'seeds' ? FD.previewSteps(G, c.i, c.j) : null, t: performance.now()};
  UISound.play('tap');
  if(!can.ok) fdWhy(can.why, c);
  else { const K = fdK2(FDP.sel), cost = FD.costOf(G, FDP.sel, c.i, c.j); banner(K.icon + ' Tap again to ' + (FDP.sel === 'canal' ? 'dig' : 'plant') + ' · ' + cost + ' 🌰' + (cost < K.cost ? ' 💧' : '') + (FDP.pick.pre.gain > 0 ? ' · +' + FDP.pick.pre.gain + ' steps!' : '')); }
}
function fdWhy(why, c){ const K = fdK2(FDP.sel);
  if(why === 'seal'){ banner('🚫 They need a way in! Leave a path open', 'bad'); UISound.play('error'); FDP.shake = {i: c.i, j: c.j, t: performance.now()}; }
  else if(why === 'seeds') banner('🌰 Not enough seeds — ' + K.icon + ' costs ' + K.cost + '. Collectors who give up drop seeds!', 'bad');
  else if(why === 'busy') banner('🚶 Someone is walking there — wait a moment');
  else if(why === 'locked') banner('🔒 ' + K.name + ' opens in chapter ' + K.ch);
  else if(why === 'nocanal') banner('🌉 Bridges go on a canal — dig one first with 🌊', 'bad'); }
function fdOpenCard(P){
  fdCloseCard(); FDP.pick = null; const sp = FD.plantSpec(P), K = FD.PLANTS[P.kind], box = document.createElement('div'); box.className = 'fd-card'; box.id = 'fd-card';
  const cost = FD.growCost(P, G), wet = FD.nearWater(G, P.i, P.j), mv = FD.moveCost(G), next = P.st === 3 ? null : P.st < 5 ? (P.st >= 4 ? K.b[P.br].name : K.name) : null;
  let grow = '';
  if(P.st === 3) grow = K.b.map((b, i) => '<button class="sp-btn sp-primary" data-g="' + i + '" style="background:' + COLORS[b.col].hex + '">' + ['①', '②'][i] + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + cost + '🌰' + (wet ? ' 💧' : '') + '<br><small>' + UI.esc(b.does) + '</small></button>').join('');
  else if(P.st < 5) grow = '<button class="sp-btn sp-primary" data-g="x">🌱 Grow → stage ' + (P.st + 1) + (P.st + 1 === 5 ? ' ⭐' : '') + ' · ' + cost + '🌰' + (wet ? ' 💧' : '') + '<br><small>' + UI.esc(next) + ' gets bigger + stronger</small></button>';
  else grow = '<div style="text-align:center;font-weight:800;color:#22A867">⭐ Fully grown!</div>';
  box.innerHTML = '<button class="x" data-sound="tap" aria-label="Close">✖</button><div class="hd"><span class="ic">' + sp.icon + '</span><div>' + UI.esc(sp.name) + ' · stage ' + P.st + '<small>' + UI.esc(sp.does) + '</small></div></div>' +
    '<div class="st">' + [1, 2, 3, 4, 5].map(n => '<i class="' + (n <= P.st ? 'on' : '') + '"></i>').join('') + '</div><div class="row">' + grow + '</div>' +
    '<div class="row"><button class="sp-btn sp-secondary" data-a="move">🚚 Move · ' + (mv ? mv + '🌰' : 'FREE') + '</button><button class="sp-btn sp-secondary" data-a="pull">♻️ Pull up · +' + Math.floor(P.spent / 2) + '🌰</button></div>';
  $('arena').appendChild(box); FDP.card = P.id; FDP.selP = P.id;
  if(fdHasProps()){ const ic = box.querySelector('.hd .ic'); if(ic){ ic.textContent = ''; ic.appendChild(fdPlantCanvas(P.kind, P.st, P.br, 46)); }   // 🌱 fd-1c: the plant now
    box.querySelectorAll('[data-g]').forEach(b => { const br = b.dataset.g === 'x' ? P.br : Number(b.dataset.g); b.prepend(fdPlantCanvas(P.kind, P.st + 1, br, 40)); b.classList.add('fd-gp'); }); }   // + what it becomes
  box.querySelector('.x').onclick = () => fdCloseCard();
  box.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { const br = b.dataset.g === 'x' ? undefined : Number(b.dataset.g); if(FD.grow(G, P.id, br)){ UISound.play('unlock'); fdOpenCard(P); } else UISound.play('error'); });
  box.querySelector('[data-a="pull"]').onclick = () => { FD.pull(G, P.id); UISound.play('pop'); fdCloseCard(); fdHints(); };
  box.querySelector('[data-a="move"]').onclick = () => { if(G.seeds < FD.moveCost(G)){ UISound.play('error'); banner('🌰 Moving costs 1 seed', 'bad'); return; } FDP.mode = 'move'; FDP.moveId = P.id; fdCloseCard(); banner('🚚 Tap an empty spot to move the ' + sp.name + ' (it keeps its stage)'); };
}
/* 🌊 ✦ fd-2b the pond chapter's taps: a bridge lifts / lowers at once (timing is the fun), the lever swaps the corn gates, a canal opens its card */
function fdPondTap(c){ if(!G.C.pond) return false;
  const B = FD.bridgeAt(G, c.i, c.j); if(B){ fdCloseCard(); FDP.pick = null; const r = FD.toggleBridge(G, B.id); fdPondSay(r, B.up ? '🌉 Bridge UP — they must go round!' : '🌉 Bridge down — they can cross'); return true; }
  const S = FD.switchAt(G, c.i, c.j); if(S){ fdCloseCard(); FDP.pick = null; const r = FD.flip(G, S.id); fdPondSay(r, '🌽 Corn gates swapped — the walk changes lanes!'); return true; }
  const C = FD.canalAt(G, c.i, c.j); if(C){ FDP.pick = null; if(FDP.sel === 'bridge'){ if(FD.buildBridge(G, c.i, c.j)){ UISound.play('pop'); fdCloseCard(); } return true; } fdOpenCanal(C); return true; }
  return false; }
function fdPondSay(r, okTxt){ if(r.ok){ UISound.play('whoosh'); banner(okTxt); fdHints(); return; } UISound.play('bump');
  banner(r.why === 'rest' ? '⏳ Wait ' + Math.ceil(r.left) + ' s — it needs a little rest' : r.why === 'busy' ? '🚶 Someone is on it — wait a moment' : r.why === 'seal' ? '🚫 They need a way in! That would close the last way' : '🤔 Not now', r.why === 'seal' ? 'bad' : ''); }
function fdOpenCanal(C){ fdCloseCard(); const B = FD.bridgeAt(G, C.i, C.j), box = document.createElement('div'); box.className = 'fd-card'; box.id = 'fd-card';
  box.innerHTML = '<button class="x" data-sound="tap" aria-label="Close">✖</button><div class="hd"><span class="ic">🌊</span><div>Canal<small>A water wall — nobody walks through it. Plants beside water cost less 💧</small></div></div>' +
    '<div class="row">' + (B ? '' : '<button class="sp-btn sp-primary" data-a="bridge">🌉 Build a lift bridge · ' + FD.TOOLS.bridge.cost + '🌰<br><small>tap it later: up = blocked · down = they cross</small></button>') +
    '<button class="sp-btn sp-secondary" data-a="fill">♻️ Fill it back · +' + (B ? 2 : 1) + '🌰</button></div>';
  $('arena').appendChild(box); box.querySelector('.x').onclick = () => fdCloseCard();
  const bb = box.querySelector('[data-a="bridge"]'); if(bb) bb.onclick = () => { if(FD.buildBridge(G, C.i, C.j)){ UISound.play('unlock'); fdCloseCard(); } else UISound.play('error'); };
  box.querySelector('[data-a="fill"]').onclick = () => { FD.fill(G, C.i, C.j); UISound.play('pop'); fdCloseCard(); fdHints(); }; }
function fdCloseCard(){ const c = $('fd-card'); if(c) c.remove(); FDP.card = 0; FDP.selP = 0; }
function fdStory(html, btn){ fdCloseStory(); const d = document.createElement('div'); d.className = 'fd-story'; d.id = 'fd-story'; d.innerHTML = '<div class="pg">' + html + '<div style="margin-top:10px"><button class="sp-btn sp-primary sp-lg" data-sound="pop">' + (btn || 'OK ▶') + '</button></div></div>';
  $('arena').appendChild(d); if(G) G.paused = true; d.querySelector('button').onclick = () => { fdCloseStory(); if(G) G.paused = false; last = 0; }; }
function fdCloseStory(){ const d = $('fd-story'); if(d) d.remove(); }
/* (fd-1b) taps come from fdPointer below — a drag or a pinch is not a tap */
document.addEventListener('keydown', e => { if(!isFarm() || $('scr-play').classList.contains('hidden') || e.repeat || pickOpen) return; if(/^[qe]$/i.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey){ fdTurn(/e/i.test(e.key) ? 1 : -1); return; } const k = e.key.toUpperCase(), kind = Object.keys(FD_HK).find(x => FD_HK[x] === k);
  if(kind){ fdSelect(kind); e.preventDefault(); } if(e.key === 'Escape'){ fdCloseCard(); FDP.pick = null; FDP.mode = 'plant'; } });

/* ---------- ⏱️ loop + events ---------- */
function fdLoop(now){
  const dt = last ? Math.min(0.1, Math.max(0, (now - last) / 1000)) : 0; last = now;
  const was = G.state; goAuto(); FD.step(G, dt);   /* 🔔 fd-1e: CONTACT starts the wave in this tick */
  if(was === 'break' && G.state === 'wave'){ goHide(); if(HAND === $('go-btn') || HAND === $('cv')) hideHand(); FDP.hint = []; FDP.pick = FDP.pick && FD.canPlant(G, FDP.pick.i, FDP.pick.j, FDP.sel).ok ? FDP.pick : null; }
  fdEvents(FD.takeEvents(G)); if(!G) return;
  FT = FT.filter(f => (f.t += dt) < f.dur);
  fdSpinStep(now); fdPaint(now / 1000); fdPanelTick(); fdHud(); fdGuide();
  if(G && (G.state === 'won' || G.state === 'lost') && !G.ended){ G.ended = 1; setTimeout(() => finish(), FX ? 1300 : 0); }
}
let fdLastSnd = 0;
function fdEvents(list){
  list.forEach(e => {
    if(e.k === 'plant'){ burst(e.x, e.y, 0.3, ['🌱', '✨'], 4); }
    if(e.k === 'grow'){ FDPM.set(e.id, {t0: performance.now(), dur: G.lvl === 0 ? 600 : 1200, flash: G.lvl !== 0, from: {st: e.st - 1, br: e.st - 1 >= 4 ? e.br : -1}}); burst(e.x, e.y, 0.8, ['✨', '🌱', '⭐'], e.st >= 4 ? 10 : 5); floatText(e.x, e.y - 0.8, e.st === 5 ? '⭐ Giant!' : '🌱 Stage ' + e.st, '#22A867', 1.1); FDP.pics.clear(); }
    if(e.k === 'pull'){ floatText(e.x, e.y - 0.6, '♻️ +' + e.back + '🌰', '#8A6A48', 1); }
    if(e.k === 'move'){ burst(e.x, e.y, 0.3, ['🚚', '✨'], 3); }
    if(e.k === 'noPlant') fdWhy(e.why, e);
    if(e.k === 'quit'){ burst(e.x, e.y, 0.8, e.tired ? ['😩', '💦', '📄'] : ['📄', '💫', '📄'], e.boss ? 16 : 6); floatText(e.x, e.y - 0.7, (e.tired ? '😩 Too far! ' : '😭 I QUIT! ') + '+' + e.seeds + '🌰', '#B07A12', 1.2);
      if(performance.now() - fdLastSnd > 120){ fdLastSnd = performance.now(); UISound.play('pop'); }
      if(e.boss){ banner('📄 ' + FD.FOES[e.type].name + ' drops his papers and runs home!', 'gold'); UISound.play('success'); if(FX) confetti(['📄', '🍄', '🎃', '⭐']); SHAKE = 0.45; } }
    if(e.k === 'pay'){ SHAKE = Math.max(SHAKE, 0.25); burst(FD.wx(FD.DOOR.i), FD.wx(FD.DOOR.j), 1, ['🎃', '💸'], 3); UISound.play('bump'); floatText(FD.wx(FD.DOOR.i), FD.wx(FD.DOOR.j) - 1.2, '📋 Pay up! −' + e.n + ' 🎃', '#E5484D', 1.3);
      if(G.lvl === 0 && !G.toldPay){ G.toldPay = 1; banner('🎃 A collector reached the door — plant more to make the walk longer!', 'bad'); } }
    if(e.k === 'shielded' || e.k === 'reflect') floatText(e.x, e.y - 1, e.k === 'reflect' ? '🔁 Back you go!' : '🛡️ Safe!', '#22A867', 1);
    if(e.k === 'spotted') floatText(e.x, e.y - 1, '🔍 Spotted it!', '#3A86FF', 1);
    if(e.k === 'umbrella' && Math.random() < 0.3) floatText(e.x, e.y - 1.1, '☂️ boing!', '#3A86FF', 0.8);
    if(e.k === 'trap') burst(e.x, e.y, 0.4, ['💥', '🟤'], 3);
    if(e.k === 'boom'){ SHAKE = Math.max(SHAKE, e.big ? 0.4 : 0.15); burst(e.x, e.y, 0.4, ['💥', '✨'], e.big ? 12 : 5); }
    if(e.k === 'wave' && G.C.pond && G.lvl <= 1 && !G.toldBike && G.C.waves[e.n - 1].some(q => FD.FOES[q[0]].bike)){ G.toldBike = 1; setTimeout(() => banner('🚲 Bikes zoom on dry paths — but crawl in 🟫 mud and beside 🌊 water!'), 1800); }   // 🌊 fd-2b
    if(e.k === 'wave'){ banner(e.boss ? '👑 Here comes ' + FD.FOES[G.C.boss].name + '!' : (e.rain ? '🌧️ Rain! Plants work faster · ' : '🌊 ') + 'Wave ' + e.n + '!', e.boss ? 'bad' : ''); if(G.lvl > 0 && e.n > 1) $('goal').style.opacity = 0; fdCloseCard(); }
    if(e.k === 'waveDone'){ floatText(FD.CX, FD.CY - 2.4, (e.perfect ? '✨ Perfect wave! ' : '✅ Wave done ') + '+' + e.bonus + '🌰', '#22A867', 1.6); if(G.state === 'pick') setTimeout(nextPick, FX ? 900 : 0); else fdAfterPicks(); }
    if(e.k === 'foesUp') floatText(FD.CX, 1.6, '📋 The bank sent ' + e.icon + ' ' + e.name + '!', '#7B4FE0', 2.2);
    if(e.k === 'foeCast') floatText(FD.CX, 1.4, e.icon + ' ' + e.name + '!', '#7B4FE0', 1.4);
    if(e.k === 'foeSkill'){ floatText(e.x, e.y - 1.2, {clip: '📋 More paperwork!', brolly: '☔ Umbrella Spin!', bag: '👜 Treat Bag! Snack time!', call: '🦴 Ladies, help me!', bell: '🔔 Ring ring! Out of my way!'}[e.skill] || '!', '#E5487F', 1.3); if(e.skill === 'bag'){ SHAKE = Math.max(SHAKE, 0.15); burst(e.x, e.y, 1.2, ['🦴', '🍪', '✨'], 10); } if(e.skill === 'bell' && e.n) burst(e.x, e.y, 1, ['🔔', '🐑'], 6); }
    // ✦ fd-2a: 🐑 animals + 🦴 treats + the new skills
    if(e.k === 'treat'){ if(Math.random() < 0.5) floatText(e.x, e.y - 0.9, {sheep: '🐑 yum!', chicken: '🐔 peck peck', dog: '🐕 woof! yum', pig: '🐷 oink!', duck: '🦆 quack!', cow: '🐮 moo!'}[e.who] || '😋 yum!', '#C2410C', 0.9); if(G.lvl <= 1 && !G.toldTreat){ G.toldTreat = 1; banner('🦴 Treats Lady! Your animals stop to eat — then get back to work', ''); } }
    if(e.k === 'sheepWall'){ burst(e.x, e.y, 0.4, ['🐑', '✨'], 4); if(!G.toldWall){ G.toldWall = 1; floatText(e.x, e.y - 1, '🐑 Baa! Walk round us!', '#22A867', 1.3); } }
    if(e.k === 'fooled') floatText(e.x, e.y - 1.1, '🪧 …a dead end?!', '#8A6A48', 1.1);
    if(e.k === 'reset'){ burst(e.x, e.y, 0.6, ['📄', '📄', '🐐'], 6); floatText(e.x, e.y - 1.1, e.boss ? '📄 Chewy ate a page!' : '📄 Start again!', '#7B4FE0', 1.2); }
    if(e.k === 'nip' && Math.random() < 0.25) floatText(e.x, e.y - 1, '🐕 Woof!', '#B07A12', 0.7);
    if(e.k === 'cast'){ const p = e.hero === 'farmer' ? G.heroes.farmer : G.heroes.goat; floatText(p.x, p.y - 1.2, e.icon + ' ' + e.name, COLORS[e.col] ? COLORS[e.col].hex : '#333', 1); }
    if(e.k === 'seeds') floatText(FD.CX, FD.CY - 2, '+' + e.n + '🌰' + (e.heal ? ' +' + e.heal + '🎃' : ''), '#B07A12', 1.2);
    if(e.k === 'heal') floatText(FD.CX, FD.CY - 2, '+' + e.n + ' 🎃', '#22A867', 1.2);
    if(e.k === 'boss') UISound.play('nav');
    if(e.k === 'lastStand') banner('🍀 Three pumpkins left in the cellar!', 'gold');
    if(e.k === 'newRoute'){ fdHints(); fdStory('<div class="big">' + (e.boat ? '⛵' : '🚧') + '</div><h3>' + (e.boat ? 'A boat crosses the pond!' : UI.esc(e.who) + ' found a back gate!') + '</h3><p>Old way <b>' + e.old + '</b> steps · new way <b style="color:#E5484D">' + e.now + '</b> steps 😱</p><p>🚚 Moving plants is <b>FREE</b> for a little while — they keep their stage.' + (G.lvl <= 1 ? '<br>👻 Ghost plants show good spots.' : '') + '</p>', '🚚 Fix my maze ▶'); }
    // 🌊 ✦ fd-2b: canals · bridges · the corn switch · ditches · the flood · Bill's bell
    if(e.k === 'dig'){ burst(e.x, e.y, 0.2, ['💧', '🌊'], 5); if(!G.toldDig){ G.toldDig = 1; floatText(e.x, e.y - 0.8, '🌊 Splash! A water wall', '#3A86FF', 1.2); } }
    if(e.k === 'fill'){ burst(e.x, e.y, 0.2, ['🟫', '✨'], 4); floatText(e.x, e.y - 0.6, '♻️ +' + e.back + '🌰', '#8A6A48', 1); }
    if(e.k === 'bridge'){ burst(e.x, e.y, 0.3, ['🌉', '✨'], 4); floatText(e.x, e.y - 0.9, '🌉 Tap me: up / down', '#8E5A2C', 1.3); }
    if(e.k === 'lift'){ burst(e.x, e.y, 0.5, e.up ? ['⬆️', '💨'] : ['⬇️', '💧'], 3); if(e.skill) floatText(e.x, e.y - 1, e.up ? '🌉 Up!' : '🌉 Down!', '#8E5A2C', 0.9); }
    if(e.k === 'switch'){ burst(e.x, e.y, 0.6, ['🌽', '✨'], 5); if(e.skill) floatText(e.x, e.y - 1.1, '🌽 Switcheroo!', '#22A867', 1); }
    if(e.k === 'switched' && !e.n) floatText(FD.CX, FD.CY - 2.2, '🌽 Nothing to switch…', '#8A6A48', 1);
    if(e.k === 'ditch'){ floatText(e.x, e.y - 1, '🌊 ' + (e.n ? 'Ditch! Go round!' : 'No room to dig…'), '#3A86FF', 1.1); }
    if(e.k === 'dry') burst(e.x, e.y, 0.2, ['💨'], 2);
    if(e.k === 'won'){ banner('🏆 Chapter ' + G.C.n + ' done!', 'gold'); UISound.play('success'); if(FX) confetti(['🎃', '🍄', '🌽', '⭐', '🐐'], 40); }
    if(e.k === 'lost'){ banner('🎃 Oh no — the last pumpkin!', 'bad'); UISound.play('error'); }
  });
}

/* ---------- 🎨 the farm picture ---------- */
const fdTo = (x, y) => ({x: IX(x, y), y: IY(x, y, 0)});
// 🔄 fd-1d: the background is built from parts so the island can spin under a still sky: 🌤️ sky (per time of day) · 🏝️ island ground + yard
//   (per view step, with the matrix it was baked with) · 🌳 the misty edge ring (drawn live while spinning) · tint / dusk / vignette on top
function fdSky(tod){ FDP.sky = FDP.sky || {}; const key = FDP.bgKey.replace(/:r\d$/, '') + ':' + tod; if(FDP.sky[tod] && FDP.sky[tod].key === key) return FDP.sky[tod];
  const cv = $('cv'), c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const g = c.getContext('2d'), W = VIEW.px, H = VIEW.ph, d = VIEW.dpr;
  const base = scenePal(), P = Object.assign({}, base, tod && !base.night ? TOD_SKY[tod] : {}), R = FD.rngOf(G.C.n * 97 + 3), M = G.map;
  g.setTransform(d, 0, 0, d, 0, 0); drawSky(g, P, W, H, R);
  // 🌳 a ring of trees + hay on the misty edge (not part of the farm grid) — the same seed = the same ring
  const stand = []; for(let j = 0; j < FD.N; j++) for(let i = 0; i < FD.N; i++){ const k = j * FD.N + i; if(G.isl.solid[k] || M.isVoid(i, j) || M.al[k] < 150 || (G.isl.pond && G.isl.pond[k])) continue;   /* 🌊 fd-2b: not on the pond */ if(R() > 0.35) continue;
    if(G.gates.some(Gt => Math.abs(Gt.i - i) + Math.abs(Gt.j - j) < 3)) continue; stand.push({x: FD.wx(i) + (R() - 0.5) * 0.4, y: FD.wx(j) + (R() - 0.5) * 0.4, ic: ['🌳', '🌳', '🌲', '🌾', '🌻', '🪨'][Math.floor(R() * 6)]}); }
  stand.forEach(o => { o.big = o.ic === '🌳' || o.ic === '🌲'; o.sz = o.big ? 1.05 + R() * 0.3 : 0.55; o.r1 = R(); o.r2 = R(); });
  FDP.sky[tod] = {key, c, stand, base}; return FDP.sky[tod]; }
const FD_EDGE = {'🌳': ['mango', 'jtree', 'mushtree'], '🌲': ['jtree', 'mango'], '🌾': ['haybale', 'corn'], '🌻': ['sunflower', 'pumpkins', 'flowerpatch'], '🪨': ['rock', 'bush']};   // 🌳 fd-1b: IsoProps
function fdEdge(g, stand){ const s = VIEW.s;   // g in screen px (dpr transform); far → near in the CURRENT view
  stand.slice().sort((a, b) => fdDep(a.x, a.y) - fdDep(b.x, b.y)).forEach(o => {
    if(fdHasProps()){ const L = FD_EDGE[o.ic], key = L[Math.floor(o.r1 * L.length)], it = fdItem('edge', key, 0, 0, {v: Math.floor(o.r2 * 4)}); if(it && fdProp(g, it, {dx: o.x + FD.O - 0.5, dy: o.y + FD.O - 0.5, scale: o.big ? 0.8 + o.r2 * 0.35 : 0.85})) return; }
    shadow(g, o.x, o.y, o.sz * 0.4); emo(g, o.ic, IX(o.x, o.y), IY(o.x, o.y, 0) - s * o.sz * 0.45, s * o.sz); }); }
function fdIsl(k){ FDP.isl = FDP.isl || {}; const key = FDP.bgKey.replace(/:r\d$/, ''); if(FDP.isl[k] && FDP.isl[k].key === key) return FDP.isl[k];
  const th0 = FDR.th; fdSetRot(k * Math.PI / 2);   // bake in that view's exact angle
  const cv = $('cv'), d = VIEW.dpr, M = fdMapK(k), isl = document.createElement('canvas'); isl.width = cv.width; isl.height = cv.height; const ig = isl.getContext('2d'), zs = ISO.zi * d, oy = ISO.OY - 2 * ISO.O * ISO.B;
  for(let cj = 0; cj < Math.ceil(M.h / Iso.CH); cj++) for(let ci = 0; ci < Math.ceil(M.w / Iso.CH); ci++){ const C = Iso._bakeChunk(M, ci, cj, zs); if(C) ig.drawImage(C.c, Math.round((ISO.OX + C.ox * ISO.zi) * d), Math.round((oy + C.oy * ISO.zi) * d)); }
  // 🏡 the yard round the farmhouse + a dirt patch at each gate (in world units, cut by the island's own edge)
  const rc = document.createElement('canvas'); rc.width = isl.width; rc.height = isl.height; const rg = rc.getContext('2d'); groundTf(rg); const m = rg.getTransform();
  rg.fillStyle = 'rgba(205,160,100,.55)'; rg.beginPath(); rg.ellipse(FD.CX + 0.3, FD.CY + 0.4, 2.6, 2.4, 0.4, 0, 7); rg.fill();
  rg.fillStyle = 'rgba(150,105,60,.35)'; G.gates.forEach(Gt => { rg.beginPath(); rg.ellipse(FD.wx(Gt.i), FD.wx(Gt.j), 0.9, 0.9, 0, 0, 7); rg.fill(); });
  rg.setTransform(1, 0, 0, 1, 0, 0); rg.globalCompositeOperation = 'destination-in'; rg.drawImage(isl, 0, 0); rg.globalCompositeOperation = 'source-over'; ig.drawImage(rc, 0, 0);
  fdSetRot(th0); FDP.isl[k] = {key, c: isl, m}; return FDP.isl[k]; }
function fdBgTop(g, base, tod, W, H){ g.setTransform(VIEW.dpr, 0, 0, VIEW.dpr, 0, 0);
  if(base.tint){ g.fillStyle = base.tint; g.fillRect(0, 0, W, H); }
  if(tod){ g.globalCompositeOperation = 'source-atop'; g.fillStyle = tod === 2 ? 'rgba(30,30,110,.40)' : 'rgba(255,120,60,.15)'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
  const vg = g.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.4, W / 2, H * 0.55, Math.max(W, H) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(40,20,60,.2)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
function fdBake(tod){
  const cv = $('cv'), c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const g = c.getContext('2d'), W = VIEW.px, H = VIEW.ph, d = VIEW.dpr, S0 = fdSky(tod);
  g.drawImage(S0.c, 0, 0); g.drawImage(fdIsl(fdK()).c, 0, 0); g.setTransform(d, 0, 0, d, 0, 0); fdEdge(g, S0.stand);
  fdBgTop(g, S0.base, tod, W, H); return c;
}
// one frame of the spin: the still sky + the island drawn through (matrix now) × (matrix it was baked with)⁻¹ + the edge ring live + tint on top
function fdSpinBG(g){ const sp = FDR.spin, cv = $('cv'), a = Math.floor(FDP.tod), S0 = fdSky(a), W = VIEW.px, H = VIEW.ph, d = VIEW.dpr;
  let c = FDP.spinC; if(!c || c.width !== cv.width || c.height !== cv.height){ c = FDP.spinC = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; }
  const cg = c.getContext('2d'); cg.setTransform(1, 0, 0, 1, 0, 0); cg.clearRect(0, 0, c.width, c.height); cg.drawImage(S0.c, 0, 0);
  const L = sp.q < 0.5 ? sp.L0 : sp.L1; groundTf(cg); const now = cg.getTransform(); cg.setTransform(now.multiply(L.m.inverse())); cg.drawImage(L.c, 0, 0);
  cg.setTransform(d, 0, 0, d, 0, 0); fdEdge(cg, S0.stand); fdBgTop(cg, S0.base, a, W, H);
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(c, 0, 0); }
function fdPaintBG(g, dt){
  if(FDR.spin){ fdSpinBG(g); return; }   // 🔄 fd-1d
  const key = VIEW.px + ':' + VIEW.ph + ':' + VIEW.dpr + ':' + G.C.n + ':' + VIEW.s.toFixed(3) + ':' + Math.round(ISO.OX) + ':' + Math.round(ISO.OY) + ':r' + fdK(); if(FDP.bgKey !== key){ FDP.bgKey = key; FDP.bgs = [null, null, null]; FDP.tod = todWant(); ISO.lanterns = []; }
  const w = todWant(); if(FDP.tod !== w){ FDP.tod = FDP.tod < w ? Math.min(w, FDP.tod + dt * 0.35) : Math.max(w, FDP.tod - dt * 0.35); } TOD.v = FDP.tod;
  const a = Math.floor(FDP.tod), f = FDP.tod - a; if(!FDP.bgs[a]) FDP.bgs[a] = fdBake(a); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(FDP.bgs[a], 0, 0);
  if(f > 0.001){ if(!FDP.bgs[a + 1]) FDP.bgs[a + 1] = fdBake(a + 1); g.globalAlpha = f; g.drawImage(FDP.bgs[a + 1], 0, 0); g.globalAlpha = 1; }
}
/* 🌳 fd-1b: 🌾 IsoProps farm props instead of the stand-ins — 🏡 farmhouse (👨‍🌾 on its porch roof = it.stand) · 🚪 farm gates (the chapter's 🚧 new back gate = state 'new') ·
   🎃 pumpkin pile by the door = your pumpkins (1–12) · 🌾 hay bales · 🧑‍🌾 scarecrows · 🕳️ mud pits · 🪨 rocks · 🌳 the misty edge ring (mango · tree · mushroom tree ·
   corn · sunflower · hay · pumpkins · bush). Drawn through Iso.drawPic with a little view that speaks TD-Stories' own projection (IX / IY); without IsoProps
   the old painters stay (fallback). */
const FDPR = {it: new Map()};
const fdHasProps = () => typeof Props !== 'undefined' && !!Props.item && !!Iso.drawPic;
function fdV(sx, sy){ return {zoom: ISO.zi, dpr: VIEW.dpr || 1, toScreen: (x, y, z) => ({x: IX(x - FD.O, y - FD.O) + (sx || 0), y: IY(x - FD.O, y - FD.O, 0) - (z || 0) * Iso.HZ * ISO.zi + (sy || 0)})}; }
// one item per key (cached; a new state / look = a new item, pictures come from IsoProps' own cache)
function fdItem(key, prop, i, j, o){ const k = key + '|' + prop + '|' + i + ',' + j + '|' + JSON.stringify(o || {}); let it = FDPR.it.get(k); if(it) return it;
  if(FDPR.it.size > 600) FDPR.it.clear(); try{ it = Props.item(prop, i, j, Object.assign({look: 'farm'}, o || {})); if(it){ it._prop = prop; it._o = o || {}; } }catch(e){ it = null; } FDPR.it.set(k, it); return it; }
function fdProp(g, it, o){ if(!it || !it.pic) return false; o = o || {}; const R = fdRotItem(it, o); if(!R.it || !R.it.pic) return false; g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const ok = Iso.drawPic(g, fdVr(o.sx, o.sy), R.it.pic, R.x, R.y, it.z || 0, {alpha: o.alpha, scale: o.scale}); g.restore(); return ok; }
/* 🔄 fd-1d: the view turns (Aowu 21:26 · his Home Layout app = the guide): only the CAMERA turns — maze, paths, saves never change. ⟲ ⟳ (Q / E) spin 90°
   in 0.42 s round the island (zoomed in: round the spot in the middle of the screen); the ground spins smoothly (the baked island drawn through
   one affine matrix), things standing on it slide with the spin and switch to their turned picture half way (IsoProps rebuilds a turned MODEL, never
   a mirror). The angle is kept per player (localStorage). Book 1 never turns (ISO.rq = 0 = the old formulas). */
const FDR = {k: 0, th: 0, spin: null};
function fdSetRot(th){ const q = th / (Math.PI / 2), k = Math.round(q), ex = Math.abs(q - k) < 1e-9, m = ((k % 4) + 4) % 4;
  ISO.rc = ex ? [1, 0, -1, 0][m] : Math.cos(th); ISO.rs = ex ? [0, 1, 0, -1][m] : Math.sin(th); ISO.rcx = ISO.rcy = FD.CX; ISO.rq = ex && m === 0 ? 0 : 1; FDR.th = th; }
const fdK = () => ((Math.round(FDR.th / (Math.PI / 2)) % 4) + 4) % 4;
// a world point (x, y) in the turned view's own frame
function fdRot(x, y){ if(!ISO.rq) return [x, y]; const dx = x - ISO.rcx, dy = y - ISO.rcy; return [ISO.rcx + ISO.rc * dx - ISO.rs * dy, ISO.rcy + ISO.rs * dx + ISO.rc * dy]; }
const fdDep = (x, y) => { const r = fdRot(x, y); return r[0] + r[1]; };   // far → near in the turned view
// the raw diamond projection (map coords of the TURNED frame → screen)
function fdVr(sx, sy){ return {zoom: ISO.zi, dpr: VIEW.dpr || 1, toScreen: (x, y, z) => ({x: ISO.OX + ((x - FD.O) - (y - FD.O)) * ISO.A + (sx || 0), y: ISO.OY + ((x - FD.O) + (y - FD.O)) * ISO.B - (z || 0) * Iso.HZ * ISO.zi + (sy || 0)})}; }
// a prop in the turned view: its footprint centre turns with the view, its picture is the model turned by 3 × k (turn 0 front +y · 1 +x · 2 −y · 3 −x)
function fdRotItem(it, o, kf){ o = o || {}; const k = kf != null ? kf : fdK(); let it2 = it;
  if(k && it._prop){ const oo = Object.assign({}, it._o); oo.turn = ((oo.turn | 0) + 3 * k) % 4; it2 = fdItem('rot', it._prop, 0, 0, oo) || it; }
  const w = it.w || 1, d = it.d || 1, r = fdRot(it.x + (o.dx || 0) + w / 2 - FD.O, it.y + (o.dy || 0) + d / 2 - FD.O), w2 = it2.w || w, d2 = it2.d || d;
  return {it: it2, x: r[0] + FD.O - w2 / 2, y: r[1] + FD.O - d2 / 2}; }
// the turned map for view step k (cells rotated round the island centre: turned cell (i', j') = old (j', N − 1 − i'), k times), cached per chapter
function fdMapK(k){ if(!k) return G.map; FDP.mapk = FDP.mapk || {}; const key = G.C.n + ':' + k + ':' + G.map.id; if(FDP.mapk[k] && FDP.mapk[k].key === key) return FDP.mapk[k].m; const N = FD.N, M0 = G.map;
  const m = Iso.map({w: N, h: N, theme: M0.theme, seed: M0.seed, base: M0.base, cell: (i, j) => { let a = i, b = j; for(let q = 0; q < k; q++){ const t = a; a = b; b = N - 1 - t; } const c = M0.get(a, b); return c ? {t: c.t, h: c.h, fade: c.fade, block: c.block} : {t: 'void'}; }});
  FDP.mapk[k] = {key, m}; return m; }
const fdPileN = () => Math.max(0, Math.min(12, Math.ceil(G.hearts || 0)));
function fdHouseIt(){ return fdItem('house', 'farmhouse', FD.HOUSE[0][0], FD.HOUSE[0][1], {v: (G.C.n - 1) % 4}); }
function fdGateIt(Gt){ const a = Gt.ang || 0, along = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a));   // the gate spans ACROSS the walk
  return fdItem('gate', 'farmgate', Gt.i, Gt.j, {turn: along ? 1 : 0, state: G.C.newGate && G.C.newGate.gate === Gt.name ? 'new' : 'open'}); }
/* 🌱 fd-1c: the plants ARE IsoProps growing props (ip-3c) — one line per kind, the state IS the stage: 1 seed · 2 sprout · 3 young · 4a / 5a branch ① ·
   4b / 5b branch ② (each a new SHAPE, branch = its SkillKit colour). Every grow plays the 🐣 morph moment (Props.morphFx: 1.2 s, 🌱 Basic 0.6 s, no flash);
   the grow card shows the plant now + what each button turns it into. Without IsoProps the FG draft painters stay. */
const FD_PLINE = {mush: 'growmush', corn: 'growcorn', sun: 'growsun', pepper: 'growpepper', pump: 'growpump'};
const fdBr = br => br === 1 ? 'b' : 'a';
function fdPlantIt(P, st, br){ const line = FD_PLINE[P.kind]; return line ? fdItem('plant', line, P.i, P.j, {stage: st || P.st, branch: fdBr(br != null ? br : P.br)}) : null; }
// a small picture of a plant (kind · stage · branch) for the grow card: the prop's own canvas, fitted into px × px
function fdPlantCanvas(kind, st, br, px){ const c = document.createElement('canvas'), d = Math.min(3, devicePixelRatio || 1); c.width = c.height = Math.round(px * d); c.style.width = c.style.height = px + 'px'; c.className = 'fd-pp';
  try{ const src = Props.canvas(FD_PLINE[kind], {look: 'farm', stage: st, branch: fdBr(br), k: 1.5, s: d}), b = fdTrim(src), f = Math.min(c.width / b.w, c.height / b.h);
    c.getContext('2d').drawImage(src, b.x, b.y, b.w, b.h, (c.width - b.w * f) / 2, c.height - b.h * f, b.w * f, b.h * f); }catch(e){} return c; }
// the painted box of a picture (a prop canvas has room round it for the rim + live layer) — measured once
const FD_TRIM = new WeakMap();
function fdTrim(src){ let b = FD_TRIM.get(src); if(b) return b; b = {x: 0, y: 0, w: src.width, h: src.height};
  try{ const W = src.width, H = src.height, a = src.getContext('2d').getImageData(0, 0, W, H).data; let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for(let y = 0; y < H; y++) for(let x = 0; x < W; x++) if(a[(y * W + x) * 4 + 3] > 12){ if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y; }
    if(x1 >= x0) b = {x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1}; }catch(e){} FD_TRIM.set(src, b); return b; }
// a plant / house picture baked once per size (plants sway a little when drawn)
function fdPic(key, w, h, fx, fy, paint){ const dpr = VIEW.dpr || 1, k2 = key + '@' + Math.round(VIEW.s * 10) + '@' + dpr; let p = FDP.pics.get(k2); if(p) return p;
  if(FDP.pics.size > 120) FDP.pics.clear(); const c = document.createElement('canvas'); c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr); const g = c.getContext('2d'); g.scale(dpr, dpr); paint(g, fx, fy);
  p = {c, w, h, fx, fy}; FDP.pics.set(k2, p); return p; }
function fdDrawPic(g, p, x, y, sx, sy, a){ g.save(); g.translate(x, y); if(sx !== 1 || sy !== 1) g.scale(sx, sy); if(a != null) g.globalAlpha = a; g.drawImage(p.c, -p.fx, -p.fy, p.w, p.h); g.restore(); }
const FD_PK = () => VIEW.s / 30;   // plant painters: a plant fills its tile (it is a WALL too)
// 🌱 fd-1c draw one plant prop (+ its 🐣 morph moment: the old shape until the white silhouette peaks, then the new shape bounces in under the sparkles)
const FDPM = new Map();
const FD_PSC = [1, 1.6, 1.45, 1.3, 1.2, 1.15];   // fd-1d (Aowu 21:26): plants ~1.3× (seeds 1.6×) — easy to see + tap; giants grow less so the maze stays readable
// 👻 fd-1d: a plant standing IN FRONT of the spot you are aiming at (tap-preview, 🚚 move, or the mouse) goes see-through
function fdAim(){ return FDP.pick ? {i: FDP.pick.i, j: FDP.pick.j} : FDP.hover || null; }
function fdCovers(P){ const a = fdAim(); if(!a || (a.i === P.i && a.j === P.j)) return false; const ax = FD.wx(a.i), ay = FD.wx(a.j);
  if(fdDep(P.x, P.y) <= fdDep(ax, ay)) return false; const px = IX(P.x, P.y), py = IY(P.x, P.y, 0), qx = IX(ax, ay), qy = IY(ax, ay, 0), h = fdPlantH(P);
  return Math.abs(qx - px) < ISO.A * 0.9 && qy < py && qy > py - h; }
// how tall a plant stands on screen (its prop height × the size boost)
function fdPlantH(P){ let h = 40; try{ const it = fdPlantIt(P); const gh = it && it.grow && it.grow.h; h = (gh && (typeof gh === 'object' ? gh[it.state] : gh)) || 40; }catch(e){} return h * ISO.zi * (FD_PSC[P.st] || 1) + ISO.B * 0.6; }
// 👆 a tap on the TOP part of a tall plant picks that plant (not the hidden square behind it); frontmost first
function fdPlantHit(px, py){ let best = null, bd = -1e9; G.plants.forEach(P => { const x = IX(P.x, P.y), y = IY(P.x, P.y, 0), h = fdPlantH(P);
    if(Math.abs(px - x) < ISO.A * 0.55 && py < y - ISO.B * 0.9 && py > y - h){ const d = fdDep(P.x, P.y); if(d > bd){ bd = d; best = P; } } }); return best; }
function fdPlantNow(g, P, born, sw, sx, sy){ const it = fdPlantIt(P); if(!it || !it.pic) return false; const m = FDPM.get(P.id); let q = 1; born *= FD_PSC[P.st] || 1;
  if(m){ q = (performance.now() - m.t0) / m.dur; if(q >= 1 || !FX) FDPM.delete(P.id); }
  const sel = (FDP.selP === P.id ? 0.8 : 1) * (fdCovers(P) ? 0.42 : 1);
  if(q < 1){ const old = q < 0.45 && m.from ? fdPlantIt(P, m.from.st, m.from.br) : null, pop = q < 0.45 ? 1 : 1 + 0.18 * Math.sin(Math.min(1, (q - 0.45) / 0.4) * Math.PI);
    fdProp(g, old || it, {sx, sy, scale: born * sw * (old ? 1 + 0.12 * q / 0.45 : pop), alpha: sel});
    g.save(); try{ const R = fdRotItem(it, {}); Props.morphFx(g, fdVr(), Object.assign({}, R.it, {x: R.x, y: R.y}), q, {flash: m.flash}); }catch(e){} g.restore(); return true; }   // g already carries the shake
  return fdProp(g, it, {sx, sy, scale: born * sw, alpha: sel}); }
function plantPic(P){ const s = VIEW.s, k = FD_PK(), w = s * 3, h = s * 3.6; return fdPic('p:' + P.kind + P.st + ':' + P.br, w, h, w / 2, h - s * 0.35, (g, x, y) => FG.draw(g, P.kind, P.st, Math.max(0, P.br), x, y, k * (P.st === 1 ? 1.7 : P.st === 2 ? 1.25 : 1), 0)); }
function housePic(){ const s = VIEW.s, k = VIEW.s / 40, w = s * 5.2, h = s * 5.2; return fdPic('house', w, h, w / 2, h - s * 0.6, (g, x, y) => FP.house(g, x, y, k, 0)); }
function fdPaint(t){
  const cv = $('cv'), g = cv.getContext('2d'), s = VIEW.s; if(!G || !(VIEW.px > 0 && VIEW.ph > 0 && s > 0)) return;   // fd-1d: never paint into a stage with no size (a leave mid-frame)
  { const dtF = Math.min(0.1, Math.max(0, t - (fdPaint.lt || t))); fdPaint.lt = t; fdPaintBG(g, dtF); }
  let sx = 0, sy = 0; if(SHAKE > 0 && FX){ SHAKE = Math.max(0, SHAKE - 1 / 60); sx = (Math.random() - 0.5) * s * 0.25 * SHAKE * 3; sy = (Math.random() - 0.5) * s * 0.18 * SHAKE * 3; }
  screenTf(g); if(sx || sy) g.translate(sx, sy);
  // ground: trodden path tiles under the walk, door mat, gate posts, traps, zones
  const F = FD.flowOf(G), toW = P => (P || []).map(q => ({x: q.x - FD.O, y: q.y - FD.O})), paths = G.gates.map(Gt => toW(F.path(Gt.i, Gt.j)));
  groundTf(g, sx, sy); g.fillStyle = 'rgba(190,140,80,.42)'; const seen = new Set();
  paths.forEach(P => P.forEach(p => { const k = Math.floor(p.x) + ',' + Math.floor(p.y); if(seen.has(k)) return; seen.add(k); g.fillRect(Math.floor(p.x) + 0.04, Math.floor(p.y) + 0.04, 0.92, 0.92); }));
  if(G.C.pond) fdPondGround(g, t);   // 🌊 fd-2b
  G.plants.forEach(P => { g.fillStyle = 'rgba(110,72,40,.55)'; g.fillRect(P.i - FD.O + 0.06, P.j - FD.O + 0.06, 0.88, 0.88); g.fillStyle = 'rgba(80,50,25,.35)'; g.fillRect(P.i - FD.O + 0.06, P.j - FD.O + 0.7, 0.88, 0.24); });
  G.zones.forEach(Z => { g.fillStyle = Z.k === 'storm' ? 'rgba(255,140,60,.22)' : 'rgba(58,134,255,.18)'; g.beginPath(); g.arc(Z.x, Z.y, Z.r, 0, 7); g.fill(); });
  G.traps.forEach(T => { if(T.kind === 'lava'){ g.fillStyle = 'rgba(120,80,40,' + (0.45 + 0.1 * Math.sin(t * 4)) + ')'; g.beginPath(); g.ellipse(T.x, T.y, T.r, T.r * 0.9, 0, 0, 7); g.fill(); } });
  if(FDP.hint.length && G.state === 'break'){ FDP.hint.forEach((h, n) => { const pul = 0.35 + 0.3 * Math.sin(t * 5 + n); g.fillStyle = 'rgba(255,215,60,' + pul + ')'; g.fillRect(h.i - FD.O + 0.08, h.j - FD.O + 0.08, 0.84, 0.84); }); }
  if(FDP.pick){ const ok = FDP.pick.can.ok, sh = FDP.shake && FDP.shake.i === FDP.pick.i && FDP.shake.j === FDP.pick.j && performance.now() - FDP.shake.t < 500 ? Math.sin(t * 60) * 0.06 : 0;
    g.fillStyle = ok ? 'rgba(80,220,120,.45)' : 'rgba(255,80,90,.45)'; g.fillRect(FDP.pick.i - FD.O + 0.05 + sh, FDP.pick.j - FD.O + 0.05, 0.9, 0.9); g.strokeStyle = ok ? '#2BB673' : '#E5484D'; g.lineWidth = 0.06; g.strokeRect(FDP.pick.i - FD.O + 0.05 + sh, FDP.pick.j - FD.O + 0.05, 0.9, 0.9); }
  if(FDP.mode === 'move'){ const mp = G.plants.find(q => q.id === FDP.moveId); if(mp){ g.strokeStyle = 'rgba(58,134,255,' + (0.6 + 0.3 * Math.sin(t * 6)) + ')'; g.lineWidth = 0.08; g.strokeRect(mp.i - FD.O + 0.05, mp.j - FD.O + 0.05, 0.9, 0.9); } }
  screenTf(g); if(sx || sy) g.translate(sx, sy);
  if(fdHasProps()) G.traps.forEach(T => { if(T.kind !== 'lava') return; const it = fdItem('mud', 'mudpit', 0, 0, {v: T.id % 2}); fdProp(g, it, {sx, sy, dx: T.x + FD.O - 0.5, dy: T.y + FD.O - 0.5, scale: Math.max(0.8, T.r * 1.7), alpha: 0.85 + 0.1 * Math.sin(t * 4)}); });   // 🕳️ fd-1b
  // 👣 footprints along every walk (the preview walk shows in green / red when you hover a spot)
  const fs = Math.max(1.6, s * 0.075);
  paths.forEach((P, n) => Iso.footsteps(g, P, fdTo, {t, size: fs, col: 'rgba(110,70,35,.55)', pulse: true, from: t * 0.6}));
  if(FDP.pick && FDP.pick.pre && FDP.pick.can.ok) FDP.pick.pre.paths.map(toW).forEach(P => Iso.footsteps(g, P, fdTo, {t, size: fs, col: FDP.pick.pre.gain > 0 ? 'rgba(40,170,90,.75)' : 'rgba(255,150,40,.75)', every: 0.5}));
  if(!fdHasProps()) G.gates.forEach(Gt => { if(Gt.boat) return; const x = FD.wx(Gt.i), y = FD.wx(Gt.j); emo(g, '🚧', IX(x, y), IY(x, y, 0.35), s * 0.55); });
  const dx = FD.wx(FD.DOOR.i), dy = FD.wx(FD.DOOR.j);
  // standing things, far → near (depth = x + y)
  const items = [];
  const PR = fdHasProps();
  if(PR){ G.gates.forEach(Gt => { if(Gt.boat) return; const it = fdGateIt(Gt); items.push({y: fdDep(FD.wx(Gt.i), FD.wx(Gt.j)) - 0.05, d: () => fdProp(g, it, {sx, sy})}); });   // 🚪 fd-1b
    const n = fdPileN(); if(n > 0){ const it = fdItem('pile', 'pumpkinpile', FD.PILE.i, FD.PILE.j, {state: n}); items.push({y: fdDep(FD.wx(FD.PILE.i), FD.wx(FD.PILE.j)), d: () => fdProp(g, it, {sx, sy})}); } }   // 🎃 = your hearts
  (G.rocks || []).forEach(r => items.push({y: fdDep(r.x, r.y), d: () => { if(PR && fdProp(g, fdItem('rock', 'rock', r.i, r.j, {v: r.v}), {sx, sy})) return; shadow(g, r.x, r.y, 0.42); g.fillStyle = ['#B9B3A8', '#A9A397', '#C4BEB2'][r.v]; g.strokeStyle = '#2A1C14'; g.lineWidth = Math.max(1, s * 0.03); g.beginPath(); g.ellipse(IX(r.x, r.y), IY(r.x, r.y, 0) - s * 0.18, s * 0.42, s * 0.3, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(IX(r.x, r.y) - s * 0.12, IY(r.x, r.y, 0) - s * 0.3, s * 0.14, s * 0.07, -0.3, 0, 7); g.fill(); }}));
  G.traps.forEach(T => { if(T.kind === 'lava') return; items.push({y: fdDep(T.x, T.y) - 0.1, d: () => { const ic = T.kind === 'pop' ? '🌶️' : T.kind === 'mine' ? '💩' : T.kind === 'push' ? '🪣' : T.kind === 'root' ? '🧶' : T.kind === 'stun' ? '🕳️' : '🌵'; emo(g, ic, IX(T.x, T.y), IY(T.x, T.y, 0.18), s * 0.5, T.seen ? 0.5 : 1); }}); });
  G.plants.forEach(P => items.push({y: fdDep(P.x, P.y), d: () => { const born = Math.min(1, (G.t - P.born) / 0.35), sw = 1 + Math.sin(t * 2 + P.id) * 0.02 + (P.aim > 0.3 ? 0.06 : 0);
    if(PR && fdPlantNow(g, P, born, sw, sx, sy)){} else { const pic = plantPic(P); fdDrawPic(g, pic, IX(P.x, P.y), IY(P.x, P.y, 0), born, sw * born, FDP.selP === P.id ? 0.8 : 1); } if(FDP.selP === P.id){ g.strokeStyle = '#FFC93C'; g.lineWidth = 2; g.beginPath(); g.ellipse(IX(P.x, P.y), IY(P.x, P.y, 0), s * 0.6, s * 0.3, 0, 0, 7); g.stroke(); } }}));
  G.blockers.forEach(b => items.push({y: fdDep(b.x, b.y), d: () => { if(PR && b.k === 'hay' && fdProp(g, fdItem('hay', 'haybale', b.i, b.j, {v: b.id % 2}), {sx, sy})){ bar(g, IX(b.x, b.y), IY(b.x, b.y, 1.1), s * 0.7, b.hp / b.hpMax, '#22A867'); return; }   // 🌾 fd-1b
    if(typeof FA2 !== 'undefined' && (b.k === 'sheep' || b.k === 'chicken')){ const hop = b.jumpT != null && G.t - b.jumpT < 0.6 ? Math.sin((G.t - b.jumpT) / 0.6 * Math.PI) * 0.55 : 0; fdAnimal(g, b.k, b.x + hop * 0.5, b.y - hop * 0.5, t, b.eatT > 0 ? 'eat' : b.wall ? 'block' : 'stand', b.id % 2 ? 1 : -1, b); if(!b.wall) bar(g, IX(b.x, b.y), IY(b.x, b.y, 1.1), s * 0.7, b.hp / b.hpMax, '#22A867'); return; }   // ✦ fd-2a
    const ic = {hay: '🌾', wool: '☁️', sheep: '🐑', chicken: '🐔'}[b.k] || '🐑'; shadow(g, b.x, b.y, 0.4); emo(g, ic, IX(b.x, b.y), IY(b.x, b.y, 0.4 + (b.k === 'sheep' || b.k === 'chicken' ? Math.abs(Math.sin(t * 8 + b.id)) * 0.12 : 0)), s * 0.75); bar(g, IX(b.x, b.y), IY(b.x, b.y, 1.1), s * 0.7, b.hp / b.hpMax, '#22A867'); }}));
  G.traps.forEach(T => { const a = FD.ANIMAL_TRAP[T.kind]; if(T.hero !== 'goat' || !a || typeof FA2 === 'undefined') return; const ox = a === 'pig' ? 0.25 : 0.42, x = T.x + ox, y = T.y - ox * 0.4;   // ✦ fd-2a: Chewy's traps come with their animal
    items.push({y: fdDep(x, y), d: () => fdAnimal(g, a, x, y, t, T.eatT > 0 ? 'eat' : a === 'pig' ? 'mud' : a === 'duck' ? 'splash' : 'stand', -1, T, 0.8)}); });
  G.zones.forEach(Z => { if(Z.k !== 'sign') return; items.push({y: fdDep(Z.x, Z.y) - 0.05, d: () => { if(PR && fdProp(g, fdItem('sign', 'farmsign', 0, 0, {text: 'OFFICE →', v: 1}), {sx, sy, dx: Z.x + FD.O - 0.5, dy: Z.y + FD.O - 0.5})) return; emo(g, '🪧', IX(Z.x, Z.y), IY(Z.x, Z.y, 0.5), s * 0.8); }}); });   // 🪧 ✦ fd-2a
  G.helpers.forEach(H => { if(H.k === 'dog') items.push({y: fdDep(H.x, H.y), d: () => fdAnimal(g, 'dog', H.x, H.y, t, H.eatT > 0 ? 'eat' : H.mv ? 'run' : 'stand', H.face || 1, H)}); });   // 🐕 ✦ fd-2a
  G.helpers.forEach(H => H.k === 'dog' || items.push({y: fdDep(H.x, H.y), d: () => { if(PR && fdProp(g, fdItem('crow', 'scarecrow', 0, 0, {v: H.id % 3}), {sx, sy, dx: H.x + FD.O - 0.5, dy: H.y + FD.O - 0.5})) return; FP.crow(g, IX(H.x, H.y), IY(H.x, H.y, 0), s / 44, t); }}));   // 🧑‍🌾 fd-1b
  items.push({y: fdDep(FD.CX, FD.CY) + 0.5, d: () => { if(!(PR && fdProp(g, fdHouseIt(), {sx, sy}))){ const hp = housePic(); fdDrawPic(g, hp, IX(FD.CX + 1, FD.CY + 1), IY(FD.CX + 1, FD.CY + 1, 0), 1, 1); } fdFarmer(g, t, sx, sy); }});
  if(G.C.pond) fdPondItems(items, g, t, sx, sy, PR);   // 🌊 fd-2b
  { const H = G.heroes.goat; items.push({y: fdDep(H.x, H.y), d: () => fdGoat(g, t)}); }
  G.enemies.forEach(e => items.push({y: fdDep(e.x, e.y), d: () => fdCollector(g, e, t, s)}));
  items.sort((a, b) => a.y - b.y).forEach(it => it.d());
  if(G.rain || (G.state === 'break' && G.C.rain && G.C.rain.includes(G.wave + 1) && Math.sin(t) > 2)) fdRain(g, t);
  paintLights(g, t);
  G.fx.forEach(f => fdFx(g, f, s, t));
  PARTS = PARTS.filter(p => (p.t += 1 / 60) < p.dur); PARTS.forEach(p => { const k = p.t / p.dur; emo(g, p.ic, IX(p.x, p.y) + p.vx * k * s, IY(p.x, p.y, p.z) + (p.vy * k + 2.2 * k * k) * s, s * p.sz * (1 - k * 0.4), 1 - k); });
  if(FDP.pick && FDP.pick.pre && FDP.pick.can.ok){ const x = FD.wx(FDP.pick.i), y = FD.wx(FDP.pick.j), K = fdK2(FDP.sel); emo(g, K.icon, IX(x, y), IY(x, y, 0.5), s * 0.7, 0.55);
    g.font = '800 ' + Math.max(11, Math.round(s * 0.42)) + 'px Fredoka, Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = s * 0.12; g.strokeStyle = 'rgba(255,255,255,.95)';
    drawTxt(g, (FDP.pick.pre.gain > 0 ? '+' + FDP.pick.pre.gain + ' 👣 · ' : '') + FD.costOf(G, FDP.sel, FDP.pick.i, FDP.pick.j) + '🌰', IX(x, y), IY(x, y, 1.5), Math.max(11, s * 0.42), FDP.pick.pre.gain > 0 ? '#1F9B5A' : '#8A6A48'); }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  FT.forEach(f => { const p = f.t / f.dur, a = p < 0.75 ? 1 : 1 - (p - 0.75) / 0.25, fsz = Math.max(11, s * 0.5), pop = p < 0.12 ? 0.6 + p / 0.12 * 0.4 : 1;
    g.font = '800 ' + Math.round(fsz * pop) + 'px Fredoka, Nunito, sans-serif'; g.globalAlpha = a; const x = Math.max(fsz * 2, Math.min(VIEW.px - fsz * 2, IX(f.x, f.y))), y = Math.max(fsz, IY(f.x, f.y, 1.4) - p * s * 0.9);
    g.lineWidth = fsz * 0.24; g.strokeStyle = 'rgba(255,255,255,.95)'; drawTxt(g, f.txt, x, y, fsz * pop, f.col); g.globalAlpha = 1; });
}
function fdRain(g, t){ const W = VIEW.px, H = VIEW.ph; g.strokeStyle = 'rgba(120,160,210,.45)'; g.lineWidth = 1.2; g.beginPath(); for(let i = 0; i < 70; i++){ const x = ((i * 97.3 + t * 180) % (W + 40)) - 20, y = ((i * 53.1 + t * 520) % (H + 40)) - 20; g.moveTo(x, y); g.lineTo(x - 4, y + 12); } g.stroke(); }
// 🐣 morph moment: 1.2 s (🌱 Basic 0.6 s, no flash) — the old shape swells in a glow, pop, the new shape bounces in
function fdMorphQ(h){ const T = G.trees[h], st = FD.stageOf(T.tier); if(st !== FDP.seen[h]){ if(st > FDP.seen[h] && G.wave >= 0) FDP.morph[h] = {from: FDP.seen[h], to: st, t0: performance.now(), dur: G.lvl === 0 ? 600 : 1200, burst: 0}; FDP.seen[h] = st; }
  const m = FDP.morph[h]; if(!m) return null; const q = (performance.now() - m.t0) / m.dur; if(q >= 1 || !FX){ FDP.morph[h] = null; return null; } return Object.assign(m, {q}); }
function fdMorphDraw(g, h, x, feet, k, t, drawFn){
  const m = fdMorphQ(h), T = G.trees[h], st = FD.stageOf(T.tier), col = T.main || null;
  if(!m){ drawFn(st, col, 1); return; }
  const q = m.q, half = q < 0.5, sc = half ? 1 + q * 0.5 : 1.25 - (q - 0.5) * 0.5 + Math.sin((q - 0.5) * 18) * 0.04 * (1 - q);
  const glow = g.createRadialGradient(x, feet - 30 * k, 0, x, feet - 30 * k, 70 * k); glow.addColorStop(0, 'rgba(255,250,220,' + (0.9 * (half ? q * 2 : 2 - q * 2)) + ')'); glow.addColorStop(1, 'rgba(255,250,220,0)'); g.fillStyle = glow; g.beginPath(); g.arc(x, feet - 30 * k, 70 * k, 0, 7); g.fill();
  g.save(); g.translate(x, feet); g.scale(sc, sc); g.translate(-x, -feet); drawFn(half ? m.from : st, half && m.from < 3 ? null : col, half ? 1 - q : 1); g.restore();
  if(!half && !m.burst){ m.burst = 1; const p = h === 'farmer' ? G.heroes.farmer : G.heroes.goat; burst(p.x, p.y, 1.6, ['✨', '⭐', '🎉', COLORS[col || 'A'].dot], 14); }
}
function fdFarmer(g, t, sx, sy){ const H = G.heroes.farmer, hk = VIEW.s / 40, it = fdHasProps() ? fdHouseIt() : null, st = it && it.stand, p = st ? fdV().toScreen(st.x, st.y, st.z) : null;   // 👨‍🌾 on the porch roof (fd-1b: IsoProps it.stand)
  const x = p ? p.x : IX(FD.CX + 1, FD.CY + 1) - 24 * hk, feet = p ? p.y : IY(FD.CX + 1, FD.CY + 1, 0) - 57 * hk, k = VIEW.s / (p ? 46 : 36);   // on the porch: collector-sized, so the house still reads as a house
  fdMorphDraw(g, 'farmer', x, feet, k, t, (st, col) => TDFarmer.draw(g, st, col, x, feet, k, t, {dir: H.ax != null && IX(H.ax, H.ay) < x ? -1 : 1, pose: H.atkT && G.t - H.atkT < 0.3 ? {armR: -2.2} : {}})); }
function fdGoat(g, t){ const H = G.heroes.goat, x = IX(H.x, H.y), feet = IY(H.x, H.y, 0) + (H.mv ? -Math.abs(Math.sin(t * 12)) * VIEW.s * 0.12 : 0), k = VIEW.s / 30;
  shadow(g, H.x, H.y, 0.38); fdMorphDraw(g, 'goat', x, feet, k, t, (st, col) => TDGoat.draw(g, st, col, x, feet, k, t, {dir: ISO.rq ? (fdFaceL(H, x) ? -1 : 1) : H.tx < H.x ? -1 : 1})); }
const FD_COL_KEY = {c: 'co', k: 'ck', u: 'um', boss1: 'co', boss2: 'um', tr: 'tr', boss3: 'mt', bk: 'bk', boss4: 'sb'};   // ✦ fd-2b: 🚲 Bike Clerk + 🚴 Speedy Bike Bill   // ✦ fd-2a: 🦴 Treats Lady + 👜 Mrs. Treats
function fdCollector(g, e, t, s){
  const key = FD_COL_KEY[e.type] || 'co', sz = e.S.size || 1, set = charSet('fc:' + key + (e.boss ? 'B' : ''), {name: e.S.name, av: FCOL.av(key)}, Math.round(s * 1.35 * sz), Math.round(s * 1.75 * sz));
  const quitA = e.gone ? Math.max(0, 1 - (G.t - (e.quitT || G.t)) / 1.4) : 1; if(quitA <= 0) return;
  const x = IX(e.x, e.y), y = IY(e.x, e.y, 0) - (e.gone ? (G.t - e.quitT) * s * 0.6 : 0), flip = ISO.rq ? fdFaceL(e, x) : (e.face || 1) < 0, moving = !e.gone && !(e.stunT > 0 || e.sleepT > 0 || e.stopT > 0);
  shadow(g, e.x, e.y, 0.3 * sz, 0.18 * quitA);
  const fr = moving ? set.walk[Math.floor((e.steps + e.prog) * 4) % WALK_N] : set.still, bike = e.S.bike ? fdBike(g, e, x, y, s * sz, flip, t, quitA, moving) : 0;   // 🚲 fd-2b: on the saddle
  drawPic(g, bike ? set.still : fr, x, y - bike, set.w, set.h, flip, e.gone ? Math.sin(G.t * 20) * 0.2 : e.hit > 0 ? Math.sin(t * 50) * 0.05 : 0, quitA, set);
  if(e.boss) emo(g, {um: '☂️', mt: '👜', sb: '🔔'}[key] || '📋', x + s * 0.45 * (flip ? -1 : 1), y - set.h * 0.55, s * 0.55, quitA);
  if(e.throwT && G.t - e.throwT < 0.4 && !e.gone) emo(g, '🦴', x + s * 0.4 * (flip ? -1 : 1), y - set.h * (0.6 + (G.t - e.throwT)), s * 0.3, quitA);
  if(e.gone) return;
  const top = y - set.h * 0.92, v = Math.max(0, e.will / e.willMax);
  bar(g, x, top, s * (e.boss ? 1.2 : 0.75), v, v > 0.5 ? '#FFC93C' : v > 0.25 ? '#FF9F1C' : '#E5484D'); emo(g, v > 0.75 ? '😐' : v > 0.5 ? '😕' : v > 0.25 ? '😩' : '😭', x - s * (e.boss ? 0.8 : 0.55), top, s * 0.32);
  if(e.sleepT > 0) emo(g, '💤', x + s * 0.3, top - s * 0.3, s * 0.35); else if(e.stunT > 0) emo(g, '💫', x, top - s * 0.3, s * 0.35); else if(e.signRead > 0 || e.signN > 0) emo(g, '🪧', x + s * 0.3, top - s * 0.3, s * 0.32); else if(e.wanderT > 0) emo(g, '❓', x + s * 0.3, top - s * 0.3 - Math.abs(Math.sin(t * 6)) * s * 0.1, s * 0.32); else if(e.blindT > 0) emo(g, '😵‍💫', x + s * 0.3, top - s * 0.3, s * 0.32);
  if(e.backN > 0) emo(g, '↩️', x - s * 0.3, top - s * 0.3, s * 0.3); if(e.umbT > 0 && !e.S.umbrella) emo(g, '☂️', x, top - s * 0.4, s * 0.32); if(e.shield > 0) emo(g, '📄', x + s * 0.35, top, s * 0.28);
}
// 🐑 ✦ fd-2a: one animal on the island (FA2 painters, farm_fd2.js) — eating shows the 🦴 treat at its feet + 😋
/* 🌊 ✦ fd-2b the pond chapter's own pictures */
// a bike under a collector (two wheels + a frame in the tie colour) — returns how high the rider sits · 💨 lines when fast · 🟫 splashes in mud
function fdBike(g, e, x, y, s, flip, t, a, moving){ const k = s / 40, d = flip ? -1 : 1, col = (FCOL.T[FD_COL_KEY[e.type]] || {}).tie || '#FF9F1C', spin = moving ? t * (e.mud ? 4 : 14) : 0, wob = e.mud && moving ? Math.sin(t * 9) * 1.2 * k : 0;
  g.save(); g.globalAlpha = a; g.translate(x, y + wob); g.lineCap = 'round'; g.lineJoin = 'round';
  [-11, 11].forEach(dx => { g.strokeStyle = '#2A1C14'; g.lineWidth = 2.6 * k; g.beginPath(); g.arc(dx * k, -6.5 * k, 6.2 * k, 0, 7); g.stroke(); g.strokeStyle = '#9AA6B2'; g.lineWidth = 0.8 * k; for(let q = 0; q < 3; q++){ const an = spin + q * 2.09; g.beginPath(); g.moveTo(dx * k, -6.5 * k); g.lineTo(dx * k + Math.cos(an) * 5.6 * k, -6.5 * k + Math.sin(an) * 5.6 * k); g.stroke(); } });
  g.strokeStyle = '#2A1C14'; g.lineWidth = 3.4 * k; const F = () => { g.beginPath(); g.moveTo(-11 * k, -6.5 * k); g.lineTo(-1 * k, -15 * k); g.lineTo(11 * k, -6.5 * k); g.moveTo(-1 * k, -15 * k); g.lineTo(d * 7 * k, -18 * k); g.lineTo(d * 11 * k, -6.5 * k); g.stroke(); }; F(); g.strokeStyle = col; g.lineWidth = 1.8 * k; F();
  if(moving && !e.mud) { g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.4 * k; for(let q = 0; q < 3; q++){ g.beginPath(); g.moveTo(-d * (18 + q * 3) * k, -(5 + q * 6) * k); g.lineTo(-d * (30 + q * 3) * k, -(5 + q * 6) * k); g.stroke(); } }
  if(e.mud){ g.fillStyle = 'rgba(110,80,50,.8)'; for(let q = 0; q < 4; q++){ const ph = (t * 2 + q * 0.25) % 1; g.beginPath(); g.arc((q % 2 ? -11 : 11) * k - d * ph * 6 * k, -ph * 9 * k, (1.6 - ph) * 1.4 * k, 0, 7); g.fill(); } }
  g.restore(); return 9 * k; }
function fdPondGround(g, t){ const O = FD.O;   // in world units (groundTf): dug canals + temporary ditches + mud patches + the wet look of the banks
  G.mud.forEach(key => { const [i, j] = key.split(',').map(Number); g.fillStyle = 'rgba(122,88,52,.78)'; g.fillRect(i - O + 0.05, j - O + 0.05, 0.9, 0.9); g.fillStyle = 'rgba(92,64,36,.7)';
    [[0.3, 0.35, 0.16], [0.68, 0.3, 0.12], [0.55, 0.7, 0.18], [0.22, 0.75, 0.1]].forEach(([u, v, r]) => { g.beginPath(); g.ellipse(i - O + u, j - O + v, r, r * 0.8, 0, 0, 7); g.fill(); }); });
  const water = (i, j, a) => { g.globalAlpha = a; g.fillStyle = '#8E6A44'; g.fillRect(i - O, j - O, 1, 1); g.fillStyle = '#4BB2DE'; g.fillRect(i - O + 0.1, j - O + 0.1, 0.8, 0.8); g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(i - O + 0.1, j - O + 0.1, 0.8, 0.18);
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 0.05; const ph = (t * 0.6 + i * 0.37 + j * 0.21) % 1; g.beginPath(); g.moveTo(i - O + 0.25 + ph * 0.3, j - O + 0.55); g.quadraticCurveTo(i - O + 0.4 + ph * 0.3, j - O + 0.45, i - O + 0.55 + ph * 0.3, j - O + 0.55); g.stroke(); g.globalAlpha = 1; };
  G.canals.forEach(C => water(C.i, C.j, Math.min(1, (G.t - C.born) / 0.35 + 0.2)));
  G.ditches.forEach(D => water(D.i, D.j, Math.min(1, D.t / 1.2, (G.t - D.born) / 0.3 + 0.2) * 0.9)); }
function fdPondItems(items, g, t, sx, sy, PR){ const s = VIEW.s;
  G.hedge.forEach(h => { const x = FD.wx(h.i), y = FD.wx(h.j); items.push({y: fdDep(x, y), d: () => { if(PR && fdProp(g, fdItem('hedge', 'growcorn', h.i, h.j, {stage: 4, branch: 'b'}), {sx, sy, scale: 0.92})) return; emo(g, '🌽', IX(x, y), IY(x, y, 0.5), s * 0.8); }}); });
  G.sw.forEach(S => { S.cells.forEach((c, n) => { const open = n === S.open, x = FD.wx(c.i), y = FD.wx(c.j); items.push({y: fdDep(x, y) - 0.04, d: () => { if(PR && fdProp(g, fdItem('cgate', 'farmgate', c.i, c.j, {state: open ? 'open' : 'closed', turn: 1}), {sx, sy})) return; emo(g, open ? '🚪' : '🌽', IX(x, y), IY(x, y, 0.4), s * 0.7); }}); });
    const L = S.lever, x = FD.wx(L.i), y = FD.wx(L.j); items.push({y: fdDep(x, y), d: () => { const X = IX(x, y), F = IY(x, y, 0), k = s / 26, ready = !(S.rest > 0) && G.state !== 'pick';
      if(ready && G.lvl <= 1){ g.fillStyle = 'rgba(255,215,60,' + (0.25 + 0.2 * Math.sin(t * 5)) + ')'; g.beginPath(); g.ellipse(X, F, s * 0.62, s * 0.31, 0, 0, 7); g.fill(); }
      const sw = S.t0 != null && G.t - S.t0 < 0.3 ? (G.t - S.t0) / 0.3 : 1; try{ FA2.lever(g, X, F, k, S.open === 1 ? sw > 0.5 : sw <= 0.5); }catch(e){ emo(g, '🕹️', X, F - s * 0.4, s * 0.6); }
      if(S.rest > 0) emo(g, '⏳', X + s * 0.45, F - s * 0.9, s * 0.3); }}); });
  G.bridges.forEach(B => items.push({y: fdDep(B.x, B.y) - 0.02, d: () => { const lift = B.t0 != null && G.t - B.t0 < 0.25 ? 1 + 0.08 * Math.sin((G.t - B.t0) / 0.25 * Math.PI) : 1;
    if(!(PR && fdProp(g, fdItem('bridge', 'plankbridge', B.i, B.j, {state: B.up ? 'lifted' : 'down', turn: B.along ? 0 : 1}), {sx, sy, scale: lift}))) emo(g, B.up ? '🚧' : '🌉', IX(B.x, B.y), IY(B.x, B.y, 0.3), s * 0.7);
    if(B.rest > 0) emo(g, '⏳', IX(B.x, B.y) + s * 0.4, IY(B.x, B.y, 1.3), s * 0.28); }}));
  G.blockers.forEach(b => { if(b.k !== 'corn') return; items.push({y: fdDep(b.x, b.y), d: () => { if(PR && fdProp(g, fdItem('hedge', 'growcorn', b.i, b.j, {stage: 4, branch: 'b'}), {sx, sy, scale: 0.85})) return; emo(g, '🌽', IX(b.x, b.y), IY(b.x, b.y, 0.5), s * 0.8); }}); });
  G.gates.forEach(Gt => { if(!Gt.boat) return; items.push({y: fdDep(Gt.ox, Gt.oy), d: () => { const X = IX(Gt.ox, Gt.oy), F = IY(Gt.ox, Gt.oy, 0) + Math.sin(t * 2) * s * 0.04; try{ FA2.boat(g, X, F, s / 30, t); }catch(e){ emo(g, '⛵', X, F - s * 0.5, s * 0.9); } }}); }); }
function fdAnimal(g, kind, x, y, t, act, dir, who, sc){ const s = VIEW.s, k = s / 38 * (sc || 1), X = IX(x, y), F = IY(x, y, 0), d = ISO.rq && who && who.k === 'dog' ? (fdFaceL(who, X) ? -1 : 1) : dir;
  try{ FA2.draw(g, kind, X, F, k, t + (who && who.id || 0) * 0.37, {dir: d, act}); }catch(e){ emo(g, {sheep: '🐑', chicken: '🐔', dog: '🐕', pig: '🐷', duck: '🦆', cow: '🐮'}[kind] || '🐑', X, F - s * 0.4, s * 0.7); }
  if(act === 'eat'){ FA2.treat(g, X + d * 9 * k, F - 2 * k, k * 0.8); emo(g, '😋', X, F - s * 1.05 - Math.abs(Math.sin(t * 5)) * s * 0.08, s * 0.32); }
  else if(act === 'block' && Math.sin(t * 2 + (who && who.id || 0)) > 0.92) emo(g, '💬', X + s * 0.3, F - s * 1.05, s * 0.3); }
function fdFx(g, f, s, t){
  const p = Math.min(1, f.t / f.dur), a = 1 - p;
  if(f.k === 'puff' || f.k === 'sleep' || f.k === 'aura' || f.k === 'fear' || f.k === 'skillboom'){ const col = {puff: '200,170,255', sleep: '180,140,255', aura: '240,200,80', fear: '255,140,40', skillboom: '255,210,90'}[f.k];
    g.fillStyle = 'rgba(' + col + ',' + (0.35 * a) + ')'; g.beginPath(); g.ellipse(IX(f.x, f.y), IY(f.x, f.y, 0), f.r * s * Math.SQRT2 * (0.5 + p * 0.5), f.r * s * Math.SQRT2 * 0.5 * (0.5 + p * 0.5), 0, 0, 7); g.fill();
    if(f.k === 'puff' || f.k === 'sleep') for(let i = 0; i < 5; i++){ const an = i * 1.26 + f.x; emo(g, f.k === 'sleep' ? '💤' : '·', IX(f.x, f.y) + Math.cos(an) * f.r * s * p, IY(f.x, f.y, 0.4 + p) + Math.sin(an) * f.r * s * 0.4 * p, s * 0.3, a); } return; }
  if(f.k === 'pop' || f.k === 'tomato' || f.k === 'butt' || f.k === 'toss' || f.k === 'bonk'){ const x0 = IX(f.x0 != null ? f.x0 : f.x, f.y0 != null ? f.y0 : f.y), y0 = IY(f.x0 != null ? f.x0 : f.x, f.y0 != null ? f.y0 : f.y, f.k === 'tomato' ? 2.6 : 0.8), x1 = IX(f.x, f.y), y1 = IY(f.x, f.y, 0.5);
    const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * s * 0.8; emo(g, {pop: '🍿', tomato: '🍅', butt: '💥', toss: '🌶️', bonk: '🍄'}[f.k], x, y, s * 0.4, 1); return; }
  if(f.k === 'beam'){ g.strokeStyle = 'rgba(255,240,150,' + (0.8 * a) + ')'; g.lineWidth = s * (f.big ? 0.22 : 0.13); g.lineCap = 'round'; g.beginPath(); g.moveTo(IX(f.x0, f.y0), IY(f.x0, f.y0, 1.3)); g.lineTo(IX(f.x, f.y), IY(f.x, f.y, 0.6)); g.stroke(); return; }
  if(f.k === 'cone'){ g.fillStyle = 'rgba(255,110,40,' + (0.45 * a) + ')'; g.beginPath(); const cx = IX(f.x, f.y), cy = IY(f.x, f.y, 0.4); g.moveTo(cx, cy); for(let q = -0.6; q <= 0.61; q += 0.2){ const ex = f.x + Math.cos(f.ang + q) * f.r, ey = f.y + Math.sin(f.ang + q) * f.r; g.lineTo(IX(ex, ey), IY(ex, ey, 0.4)); } g.closePath(); g.fill(); return; }
  if(f.k === 'roll'){ const P = f.pts, n = P.length - 1; if(n < 0) return; const u = p * n, i = Math.min(n - 1, Math.floor(u)), r = u - i, A = P[Math.max(0, i)], B = P[Math.min(n, i + 1)] || A, x = A[0] + (B[0] - A[0]) * r, y = A[1] + (B[1] - A[1]) * r;
    emo(g, '🎃', IX(x, y), IY(x, y, 0.35), s * (f.big ? 0.9 : 0.6), 1); return; }
  if(f.k === 'skillshot'){ (f.pts || []).forEach(q => emo(g, '💥', IX(q[0], q[1]), IY(q[0], q[1], 0.8 + p * 0.4), s * 0.5 * (1 - p * 0.3), a)); return; }
  if(f.k === 'seedrain'){ for(let i = 0; i < 8; i++) emo(g, '🌰', IX(f.x, f.y) + (i - 4) * s * 0.4, IY(f.x, f.y, 3 - p * 2.5) + (i % 3) * s * 0.2, s * 0.35, a); return; }
  if(f.k === 'shield' || f.k === 'heal' || f.k === 'haste'){ const ic = {shield: '🛡️', heal: '🎃', haste: '🚿'}[f.k]; emo(g, ic, IX(FD.CX, FD.CY), IY(FD.CX, FD.CY, 3 + p), s * 0.8 * (0.6 + p * 0.4), a); return; }
  if(f.k === 'skilltrap') emo(g, '🕳️', IX(f.x, f.y), IY(f.x, f.y, 0.2), s * 0.5, a);
  // ✦ fd-2a: 🦴 a treat flies in an arc · 👜 the bag ring · 🪧 the sign pops up · ✨ dazzle flash · 📄 chewed papers fly
  if(f.k === 'treat'){ const x0 = IX(f.x0, f.y0), y0 = IY(f.x0, f.y0, 1), x1 = IX(f.x, f.y), y1 = IY(f.x, f.y, 0.2), x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * s * 0.9; if(typeof FA2 !== 'undefined') FA2.treat(g, x, y, s / 50); else emo(g, '🦴', x, y, s * 0.3); return; }
  if(f.k === 'bag' || f.k === 'dazzle'){ const R = f.r * s * Math.SQRT2 * (0.3 + p * 0.7); g.strokeStyle = f.k === 'bag' ? 'rgba(199,138,203,' + a + ')' : 'rgba(255,236,120,' + a + ')'; g.lineWidth = s * 0.12; g.beginPath(); g.ellipse(IX(f.x, f.y), IY(f.x, f.y, 0), R, R * 0.5, 0, 0, 7); g.stroke();
    for(let i = 0; i < 6; i++){ const an = i * 1.05 + p * 2; emo(g, f.k === 'bag' ? '🦴' : '✨', IX(f.x, f.y) + Math.cos(an) * R, IY(f.x, f.y, 0.4) + Math.sin(an) * R * 0.5, s * 0.3, a); } return; }
  if(f.k === 'sign'){ emo(g, '❓', IX(f.x, f.y), IY(f.x, f.y, 1.4 + p * 0.6), s * 0.45, a); return; }
  if(f.k === 'flood'){ const P = f.pts || [], n = P.length - 1; if(n < 1) return; const u = p * n, i0 = Math.min(n - 1, Math.floor(u)), r = u - i0, A = P[i0], B = P[i0 + 1], x = A[0] + (B[0] - A[0]) * r, y = A[1] + (B[1] - A[1]) * r;   // ✦ fd-2b
    for(let q = 0; q <= i0; q++){ g.fillStyle = 'rgba(75,178,222,' + (0.35 * a) + ')'; g.beginPath(); g.ellipse(IX(P[q][0], P[q][1]), IY(P[q][0], P[q][1], 0), s * 0.6, s * 0.3, 0, 0, 7); g.fill(); }
    emo(g, '🌊', IX(x, y), IY(x, y, 0.35), s * 0.9, 1); return; }
  if(f.k === 'ditch' || f.k === 'switch' || f.k === 'bell'){ const R = (f.r || 1.4) * s * Math.SQRT2 * (0.3 + p * 0.7), ic = {ditch: '💧', switch: '🌽', bell: '🔔'}[f.k]; g.strokeStyle = 'rgba(' + {ditch: '58,134,255', switch: '34,168,103', bell: '255,201,60'}[f.k] + ',' + a + ')'; g.lineWidth = s * 0.1; g.beginPath(); g.ellipse(IX(f.x, f.y), IY(f.x, f.y, 0), R, R * 0.5, 0, 0, 7); g.stroke();
    for(let i = 0; i < 5; i++){ const an = i * 1.26 + p * 2; emo(g, ic, IX(f.x, f.y) + Math.cos(an) * R, IY(f.x, f.y, 0.4) + Math.sin(an) * R * 0.5, s * 0.3, a); } return; }
  if(f.k === 'chew'){ for(let i = 0; i < 5; i++){ const an = i * 1.3 + f.x; emo(g, '📄', IX(f.x, f.y) + Math.cos(an) * s * p, IY(f.x, f.y, 0.8 + p * 1.2) + Math.sin(an) * s * 0.3 * p, s * 0.32, a); } return; }
}

/* ---------- 🏁 the end of a chapter ---------- */
function fdFinish(){
  stopLoop(); hideHand(); fdCloseCard(); fdCloseStory(); const won = G.state === 'won', L = LEVELS[G.lvl], ch = G.C.n, lvl = G.lvl, stars = FD.stars(G);
  const stats = {games: 1, quits: G.stats.quits, waves: G.stats.waves, evolves: G.stats.evolves, ultimates: G.stats.ultimates, combos: G.stats.combos, perfect: G.stats.perfect, casts: G.stats.casts, plants: G.stats.plants, grows: G.stats.grows, steps: G.stats.steps};
  if(won) stats.chapters = ch;
  const extra = {score: G.score, stars, cleared: won, theme: '📖 Ch ' + ch + ' · ' + G.C.title, stats, timeSec: Math.round(G.t)};
  const fT = G.trees.farmer, gT = G.trees.goat, fS = FD.stageOf(fT.tier), gS = FD.stageOf(gT.tier);
  const row = saveRow(); row.ch = Math.max(Number(row.ch) || 0, won ? ch : 0); row.last = {farmer: Object.assign(fT.save(), {t: fT.tier, m: fT.main || ''}), goat: Object.assign(gT.save(), {t: gT.tier, m: gT.main || ''})};
  row.lastForms = TDFarmer.nameOf(fS, fT.main) + ' + ' + TDGoat.nameOf(gS, gT.main); S.settings['SkillTree_td-farmer_' + S.player] = JSON.stringify(row);
  saveWin(lvl, extra); saveTree(row);
  const head = won ? '<div class="rh">🏆</div><h2>Chapter ' + ch + ' done!</h2><div class="rs">' + UI.esc(G.C.title) + ' · ' + L.emoji + ' ' + L.name + '</div><div class="stars">' + '⭐'.repeat(stars) + '☆'.repeat(3 - stars) + '</div>' :
    '<div class="rh">🎃</div><h2>The bank took the last pumpkin!</h2><div class="rs">The collectors reached the door on wave ' + (G.wave + 1) + '.<br>👨‍🌾 But the Farmer has more pumpkins in the cellar… try again with <b>+3 🎃</b> — and make the walk LONGER!</div>';
  showResult(head + '<canvas id="res-cv" width="240" height="240"></canvas><div class="score">⭐ <span id="score-count">0</span></div>' +
    '<div class="builds"><span>👨‍🌾 ' + UI.esc(TDFarmer.nameOf(fS, fT.main)) + ' ' + SkillKit.barHtml(fT.bar(), {star: !!fT.ult}) + '</span><span>🐐 ' + UI.esc(TDGoat.nameOf(gS, gT.main)) + ' ' + SkillKit.barHtml(gT.bar(), {star: !!gT.ult}) + '</span>' +
    '<span style="color:var(--ink-soft)">😭 ' + G.stats.quits + ' gave up · 👣 ' + G.stats.steps + ' steps · 🌱 ' + G.plants.length + ' plants · 🎃 ' + G.hearts + ' left</span></div>' +
    '<div class="save-note" id="save-note"><span class="ui-spin a-pop">✅</span> Saving your score…</div>' +
    '<div class="res-btns"><button class="sp-btn sp-secondary" id="b-menu">🎚️ Levels</button><button class="sp-btn sp-secondary" id="b-again">🔁 Play again</button>' +
    (won ? '<button class="sp-btn sp-primary" id="b-diary">📔 Read the diary ▶</button>' : '<button class="sp-btn sp-primary" id="b-retry">🎃 Again · +3 🎃 ▶</button>') + '</div>');
  countUp($('score-count'), G.score, 1100);
  try{ fdScene($('res-cv'), {won, fS, fC: fT.main || null, gS, gC: gT.main || null, kind: 'result'}); }catch(e){}
  $('b-again').onclick = () => startGame(ch, lvl);
  $('b-menu').onclick = () => { hideResult(); fdLeave(); G = null; openBook(S.book); };
  if($('b-diary')) $('b-diary').onclick = () => { hideResult(); fdLeave(); G = null; openDiary(ch, lvl, 'outro'); };
  if($('b-retry')) $('b-retry').onclick = () => startGame(ch, lvl, {bonus: 3});
}

/* ---------- 🖼️ story pictures (shelf cover · diary · result) with the SAME heroes ---------- */
// 🌳 fd-1c: an IsoProps prop in a story picture — its own canvas at scale k, standing with its footprint centre on (x, feet)
function fdScProp(g, key, o, x, feet, k){ if(!fdHasProps()) return false; try{ o = Object.assign({look: 'farm'}, o || {}); const it = Props.item(key, 0, 0, o), c = Props.canvas(key, Object.assign({}, o, {k, s: 1})), A = c._g;
  const bx = x - (it.w / 2 - it.d / 2) * 32 * k, by = feet - (it.w / 2 + it.d / 2) * 16 * k; g.drawImage(c, bx - A.ax * k, by - A.ay * k); return true; }catch(e){ return false; } }
function fdScene(c, o){
  if(!c) return; o = o || {}; const g = c.getContext('2d'), W = c.width, H = c.height, t = 0.4, u = Math.min(W, H) / 240, night = o.night;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  scSky(g, W, H, night ? '#2C2F6B' : o.rain ? '#9DB6CF' : '#8ED6FF', night ? '#8A7FC8' : o.rain ? '#E2ECF4' : '#FFF6E0', night, t);
  const cx = W * 0.5, top = H * 0.6; scIsland(g, cx, top, W * 0.46, H * 0.16, '#B5E58A', '#8CCB64');
  scCloud(g, W * 0.18, H * 0.2, 18 * u, 0.8); scCloud(g, W * 0.82, H * 0.14, 14 * u, 0.7);
  if(!fdScProp(g, 'farmhouse', {v: Math.max(0, (o.ch || 1) - 1) % 4}, cx + 40 * u, top + 10 * u, u * 0.62)) FP.house(g, cx + 34 * u, top + 6 * u, u * 0.62, t);   // 🌳 fd-1c
  const kinds = o.kind === 'cover' ? ['mush', 'corn', 'mush', 'sun'] : ['mush', 'mush', 'corn', 'mush'];
  kinds.forEach((k, i) => { const st = Math.min(5, Math.max(o.kind === 'cover' ? 3 : 2, (o.fS || 2) + (i % 2))), x = cx - 70 * u + i * 24 * u, y = top + 26 * u - (i % 2) * 6 * u;
    if(!fdScProp(g, FD_PLINE[k], {stage: st, branch: fdBr(i % 2)}, x, y, u * 0.8)) FG.draw(g, k, st, i % 2, x, y, u * 0.55, t); });
  if(o.kind === 'cover') fdScProp(g, 'pumpkinpile', {state: 6}, cx + 18 * u, top + 30 * u, u * 0.6);
  TDFarmer.draw(g, o.fS || 1, o.fC || null, cx - 6 * u, top + 30 * u, u * 0.62, t, {dir: 1, pose: o.won === false ? {} : {armR: -2.4, armL: 2.2}});
  TDGoat.draw(g, o.gS || 1, o.gC || null, cx + 30 * u, top + 38 * u, u * 0.62, t, {dir: -1});
  if(o.collector) FCOL.draw(g, o.collector, cx + 82 * u, top + 30 * u, u * 0.55, t, {dir: -1});
  if(o.won === false) for(let i = 0; i < 3; i++) emo(g, '🎃', cx + 70 * u + i * 12 * u, top + 32 * u - i * 4 * u, 14 * u);
  if(o.won) emo(g, '📄', cx + 80 * u, top - 10 * u, 16 * u);
}
function fdCover(c, row){ const r = row || {}, f = (r.last || {}).farmer || {}, gt = (r.last || {}).goat || {}; fdScene(c, {kind: 'cover', fS: FD.stageOf(Number(f.t) || 1), fC: f.m || null, gS: FD.stageOf(Number(gt.t) || 1), gC: gt.m || null, collector: 'co'}); }
function fdDiaryPic(cv, ch, when){ fdScene(cv, {kind: 'diary', ch, fS: when === 'intro' ? (ch === 1 ? 1 : 2) : ch === 1 ? 2 : 3, gS: when === 'intro' ? (ch === 1 ? 1 : 2) : 2, collector: when === 'intro' ? ({2: 'um', 3: 'tr', 4: 'bk'}[ch] || 'co') : null, won: when === 'outro' ? true : undefined, rain: ch === 2}); }
/* ================= 📱 fd-1a2 phone layouts + 🤏 pinch zoom (Aowu 17:49 · 17:57: both books — 🐉 Dragon Princess too) =================
   sideways phone: ONE bar row (◀ folds Gameroom · Levels · 🏠 into its ▾ menu, score + ⏸ on the same row) · 🌱 plants in a column on the LEFT ·
   map in the middle, filling it · skills on the RIGHT: 👨‍🌾 hero 3 × 2 on top, 🐐 pet 3 × 2 below (Aowu 17:57) ·
   upright phone: map as tall as it can be, plants + skills compact under it · every size: pinch / wheel zoom + drag to pan (a tap still plants) */
const FDZ = {z: 1, ox: 0, oy: 0, min: 1, max: 2.6, pts: new Map(), g: null};
const inPlay = () => !!G && !$('scr-play').classList.contains('hidden');
function fdMode(){ const w = innerWidth, h = innerHeight; if(h < 520 && w > h) return 'land'; if(w < 640 && h > w) return 'port'; return 'wide'; }
(function(){ const st = document.createElement('style'); st.id = 'fd-css2'; st.textContent = [
  '#scr-play.tl .banner{top:auto;bottom:auto;top:44px;transform:translateX(-50%);font-size:clamp(.78rem,1.4vmin + .5rem,1.15rem);padding:6px 14px;max-width:86%;border-radius:14px}',
  '#scr-play.tl .banner.on{transform:translateX(-50%)}',
  '#scr-play.tl-land .banner{font-size:.85rem;padding:4px 12px;top:40px}',
  '#scr-play.tl #cv{touch-action:none;transform-origin:0 0}',
  /* sideways phone: one bar row */
  '#scr-play.tl-land .gb-back .gt,#scr-play.tl-land .gb-lvb,#scr-play.tl-land .gb-home,#scr-play.tl-land .gb-title,#scr-play.tl-land .gb-lvg,#scr-play.tl-land .gb-br{display:none !important}',
  '#scr-play.tl-land .gb-fx{display:inline}#scr-play.tl-land .gb-back{padding:0 9px}',
  '#scr-play.tl-land .arena{flex-direction:row !important;align-items:stretch;justify-content:center;gap:6px;padding-left:max(6px,env(safe-area-inset-left));padding-right:max(6px,env(safe-area-inset-right))}',
  '#fd-left{display:none}#fd-left:empty{display:none !important}#scr-play.tl-land #fd-left{display:flex;flex-direction:column;justify-content:center;flex:0 0 auto}',
  '#scr-play.tl-land #fd-left .fd-build{flex-direction:column;flex-wrap:nowrap;padding:6px 4px;gap:var(--bgap,6px)}',
  '#scr-play.tl-land #fd-left .fd-seeds{font-size:.95rem;padding:0}',
  '#fd-build .fd-seeds{min-width:3.3em;text-align:center}',
  '#scr-play.tl-land #fd-left .fd-build.two{display:grid;grid-template-columns:repeat(2,var(--skk-bs,46px));justify-items:center;align-items:center} #scr-play.tl-land #fd-left .fd-build.two .fd-seeds{grid-column:1 / -1;text-align:center}',   /* 🌊 fd-2b */
  '#scr-play.tl-land #panel{width:auto !important;flex:0 0 auto;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:4px}',
  /* Aowu 17:57: right side = 3 × 2 for the hero on top, 3 × 2 for the pet below */
  '#scr-play.tl-land .hero{width:auto;padding:4px 6px 6px;margin:0}',
  '#scr-play.tl-land .hero .hn{display:none}#scr-play.tl-land .hero .hh{justify-content:center;margin:0 0 3px;min-height:0}',
  '#scr-play.tl-land .hero .hf{width:26px;height:26px;font-size:1rem}#scr-play.tl-land .hero .hf canvas{width:26px;height:26px}',
  '#scr-play.tl-land .hero .btns{display:grid !important;grid-template-columns:repeat(3,var(--skk-bs,46px));gap:var(--bgap,6px);justify-content:center}',
  '#scr-play.tl-land .hero .btns .skk-btn{margin:0}',
  /* upright phone: compact hero rows (face + buttons on one line) */
  '#scr-play.fd-port .hero{display:flex;align-items:center;gap:6px;padding:4px 6px}',
  '#scr-play.fd-port .hero .hh{flex:0 0 auto;margin:0}#scr-play.fd-port .hero .hn{display:none}',
  '#scr-play.fd-port .hero .btns{flex:1;display:flex;justify-content:space-between;gap:4px}',
  '#scr-play.fd-port .fd-build{padding:3px 6px}#scr-play.fd-port #panel{gap:4px}',
  '.fd-zoom{position:absolute;right:8px;bottom:8px;z-index:6;display:flex;flex-direction:column;gap:4px}',
  '.fd-zoom button{width:36px;height:36px;border-radius:50%;border:2px solid #fff;background:rgba(255,255,255,.9);font:800 1.1rem Fredoka,sans-serif;color:#5C3B1E;box-shadow:0 2px 0 rgba(0,0,0,.15);padding:0}',
].join('\n'); document.head.appendChild(st); })();
// returns true when the phone layout took over (book 1's layout() then stops)
function fdLayout(){
  const sp = $('scr-play'), mode = fdMode(), fd = !!G.fd; sp.classList.add('tl'); sp.classList.toggle('fd', fd); sp.classList.toggle('tl-land', mode === 'land'); sp.classList.toggle('fd-port', fd && mode === 'port');
  if(FDP.lmode !== mode){ const was = FDP.lmode; FDP.lmode = mode; if(was && G && G.trees) (fd ? fdRenderPanel : renderPanel)(); }   // turned the phone → the panel changes shape
  if(fd) fdPlaceBuild(mode); if(mode === 'wide') return false;   // 🐉 book 1 uses the same phone layouts (no plant column)
  const A = $('arena'), st = $('stage'), P = $('panel'), L = fd ? $('fd-left') : null; A.classList.toggle('col', mode === 'port'); if(mode === 'land'){ P.style.width = ''; P.style.flexDirection = ''; }
  const pad = parseFloat(getComputedStyle(A).paddingBottom) || 18, W = A.clientWidth - 12, H = A.clientHeight - 6 - pad;
  let bs, gap = 6, sw, sh;
  if(mode === 'land'){
    bs = Math.max(36, Math.min(54, Math.floor((H - 30 - 6 * gap) / 6), Math.floor((H - 2 * 44 - 4 * gap - 8) / 4)));   // left: seeds + 5 plants · right: 2 heroes × 2 rows (+ a small face each)
    sp.style.setProperty('--skk-bs', bs + 'px'); sp.style.setProperty('--bgap', gap + 'px'); sp.style.setProperty('--hf', '1.4rem');
    const lw = L && L.childElementCount ? L.getBoundingClientRect().width || bs + 12 : 0, pw = P.getBoundingClientRect().width || 3 * bs + 2 * gap + 12;
    sw = Math.max(240, Math.floor(W - lw - pw - 12)); sh = Math.max(200, Math.floor(H));   // the sky above the island is cut (the map is the point here)
  } else {
    sp.style.setProperty('--bgap', gap + 'px'); sp.style.setProperty('--hf', '1.4rem');
    bs = Math.max(38, Math.min(52, Math.floor((W - 64 - 5 * 4) / 6))); sp.style.setProperty('--skk-bs', bs + 'px');
    A.classList.add('col'); P.style.flexDirection = 'column'; P.style.width = Math.min(W, 600) + 'px';
    const ph = P.getBoundingClientRect().height || 3 * (bs + 14); sw = Math.floor(W); sh = Math.max(240, Math.floor(H - ph - 8));
  }
  st.style.width = sw + 'px'; st.style.height = sh + 'px';
  const dpr = Math.min(2, window.devicePixelRatio || 1), cv = $('cv');
  // the island fits the stage (upright phones crop the misty sides a little); the stage may be wider / taller than the island → it stays centred
  isoFit(A.clientWidth, A.clientHeight);
  const s = Math.min(sw / V25.W, sh / (mode === 'land' ? V25.R + V25.BOT + 1.6 : V25.TOP + V25.R + V25.BOT));
  if(VIEW.px !== sw || VIEW.ph !== sh || VIEW.dpr !== dpr || VIEW.base !== s || VIEW.ch !== S.chapter){ VIEW = {s, base: s, baseKey: sw + 'x' + sh, px: sw, ph: sh, dpr, ch: S.chapter}; cv.width = Math.round(sw * dpr); cv.height = Math.round(sh * dpr); BG = null; FDZ.ox = FDZ.oy = 0; FDP.bgKey = ''; }
  fdZoomApply(); if(pickOpen) placeHandOnGlow();
  return true;
}
// 🌊 fd-2b: 7 build buttons (5 plants + 🌊 + 🌉) — sideways phone: a 2-column plant column · otherwise ONE row of smaller buttons
function fdBuildSize(mode){ const bb = $('fd-build'); if(!bb) return; const n = bb.querySelectorAll('.fd-plant').length; mode = mode || fdMode();
  bb.classList.toggle('two', n > 5 && mode === 'land'); if(n <= 5 || mode === 'land'){ bb.style.removeProperty('--skk-bs'); return; }
  const pw = ((bb.parentNode || {}).clientWidth || 360) - 18, sd = bb.querySelector('.fd-seeds'), sw = Math.max(58, sd ? sd.getBoundingClientRect().width + 6 : 58);   // the 🌰 count may grow to 3 digits
  let gap = 7, bs = Math.floor((pw - sw - n * gap) / n); if(bs < 40){ gap = 4; bs = Math.floor((pw - sw - n * gap) / n); }
  bb.style.setProperty('--bgap', gap + 'px'); bb.style.setProperty('--skk-bs', Math.max(36, Math.min(52, bs)) + 'px'); }
function fdPlaceBuild(mode){ const A = $('arena'); let L = $('fd-left'); if(!L){ L = document.createElement('div'); L.id = 'fd-left'; A.insertBefore(L, A.firstChild); }
  const bb = $('fd-build'); if(!bb) return; if(mode === 'land'){ if(bb.parentNode !== L) L.appendChild(bb); } else if(bb.parentNode !== $('panel')) $('panel').insertBefore(bb, $('panel').firstChild); fdBuildSize(mode); }
// 🤏 zoom: VIEW.s = base × z, the island's centre offset (ox, oy) keeps the pinched spot under the fingers
function fdZoomApply(){
  if(VIEW.base == null || VIEW.baseKey !== VIEW.px + 'x' + VIEW.ph){ VIEW.base = VIEW.s; VIEW.baseKey = VIEW.px + 'x' + VIEW.ph; }
  VIEW.s = VIEW.base * FDZ.z; setIso();
  const padY = (VIEW.ph - (V25.TOP + V25.R + V25.BOT) * VIEW.base) / 2; ISO.OY += padY;   // a taller stage: island in the middle · a shorter one (sideways phone): the sky is cut   // a taller stage: the island sits in the middle
  if(FDZ.z <= 1.001){ FDZ.ox = FDZ.oy = 0; }
  const cx0 = ISO.OX, cy0 = ISO.OY + (FD.CX + FD.CY) * ISO.B;   // the farm's screen spot before the offset
  FDZ.ox = Math.max(-cx0 + VIEW.px * 0.12, Math.min(VIEW.px * 0.88 - cx0, FDZ.ox)); FDZ.oy = Math.max(-cy0 + VIEW.ph * 0.12, Math.min(VIEW.ph * 0.88 - cy0, FDZ.oy));
  ISO.OX += FDZ.ox; ISO.OY += FDZ.oy;
}
function fdZoomTo(z, mx, my){   // zoom round the screen point (mx, my)
  z = Math.max(FDZ.min, Math.min(FDZ.max, z)); if(Math.abs(z - FDZ.z) < 0.001) return; const k = z / FDZ.z, OX0 = ISO.OX, OY0 = ISO.OY;
  const OX1 = mx - (mx - OX0) * k, OY1 = my - (my - OY0) * k; FDZ.z = z;
  FDZ.ox = 0; FDZ.oy = 0; fdZoomApply(); FDZ.ox = OX1 - (ISO.OX); FDZ.oy = OY1 - (ISO.OY); fdZoomApply(); FDP.pics.clear(); FDP.bgKey = ''; if(!G.fd) BG = null;
}
function fdPanBy(dx, dy){ if(FDZ.z <= 1.001) return; FDZ.ox += dx; FDZ.oy += dy; fdZoomApply(); FDP.bgKey = ''; if(!G.fd) BG = null; }
function fdPointer(e){
  if(!inPlay() || e.target.id !== 'cv') return; const cv = $('cv'), r = cv.getBoundingClientRect(), P = FDZ.pts;
  if(e.type === 'pointerdown'){ try{ cv.setPointerCapture(e.pointerId); }catch(_){} P.set(e.pointerId, {x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY});
    if(P.size === 2){ const [a, b] = [...P.values()]; FDZ.g = {kind: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2 - r.left, my: (a.y + b.y) / 2 - r.top, k: 1, tx: 0, ty: 0}; }
    else if(P.size === 1) FDZ.g = {kind: 'tap', moved: 0, tx: 0, ty: 0}; return; }
  const q = P.get(e.pointerId); if(!q) return;
  if(e.type === 'pointermove'){ q.x = e.clientX; q.y = e.clientY; const G2 = FDZ.g; if(!G2) return;
    if(G2.kind === 'pinch' && P.size >= 2){ const [a, b] = [...P.values()]; G2.k = Math.max(FDZ.min / FDZ.z, Math.min(FDZ.max / FDZ.z, Math.hypot(a.x - b.x, a.y - b.y) / G2.d0)); const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top; G2.tx = mx - G2.mx * G2.k; G2.ty = my - G2.my * G2.k; G2.mx2 = mx; G2.my2 = my;
      cv.style.transform = 'translate(' + G2.tx + 'px,' + G2.ty + 'px) scale(' + G2.k + ')'; return; }
    if(G2.kind === 'tap'){ const dx = q.x - q.x0, dy = q.y - q.y0; if(Math.hypot(dx, dy) > 10 && FDZ.z > 1.001){ G2.kind = 'pan'; } }
    if(G2.kind === 'pan'){ G2.tx = q.x - q.x0; G2.ty = q.y - q.y0; cv.style.transform = 'translate(' + G2.tx + 'px,' + G2.ty + 'px)'; } return; }
  // up / cancel
  P.delete(e.pointerId); const G2 = FDZ.g;
  if(G2 && G2.kind === 'pinch'){ cv.style.transform = ''; const mx0 = G2.mx, my0 = G2.my;   // the first finger up commits the pinch; the other finger does nothing more
      fdZoomTo(FDZ.z * G2.k, mx0, my0); fdPanBy((G2.mx2 != null ? G2.mx2 : mx0) - mx0, (G2.my2 != null ? G2.my2 : my0) - my0); FDZ.g = P.size ? {kind: 'wait'} : null; return; }
  if(G2 && G2.kind === 'pan'){ cv.style.transform = ''; fdPanBy(G2.tx, G2.ty); FDZ.g = null; return; }
  if(G2 && G2.kind === 'tap' && e.type === 'pointerup' && P.size === 0){ FDZ.g = null; if(G.fd) fdTap(e); return; }
  if(P.size === 0) FDZ.g = null;
}
['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, fdPointer, {passive: true}));
document.addEventListener('pointermove', e => { if(e.pointerType !== 'mouse' || !isFarm() || !inPlay()) return; if(e.target.id !== 'cv'){ FDP.hover = null; return; } const r = $('cv').getBoundingClientRect(), c = fdCellAt(e.clientX - r.left, e.clientY - r.top); FDP.hover = FD.buildable(G, c.i, c.j) ? c : null; }, {passive: true});   // 🖱️ fd-1d
document.addEventListener('wheel', e => { if(!inPlay() || e.target.id !== 'cv') return; e.preventDefault(); const r = $('cv').getBoundingClientRect(); fdZoomTo(FDZ.z * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX - r.left, e.clientY - r.top); }, {passive: false});
function fdZoomButtons(){ let z = $('fd-zoom'); if(!z){ z = document.createElement('div'); z.className = 'fd-zoom'; z.id = 'fd-zoom'; z.innerHTML = '<button type="button" data-z="1" data-sound="tap" aria-label="Zoom in">＋</button><button type="button" data-z="-1" data-sound="tap" aria-label="Zoom out">－</button>'; $('stage').appendChild(z); fdRotButtons(z);
    z.querySelectorAll('button[data-z]').forEach(b => b.onclick = () => { fdZoomTo(FDZ.z * (b.dataset.z === '1' ? 1.3 : 1 / 1.3), VIEW.px / 2, VIEW.ph / 2); }); } z.classList.remove('hidden'); }
// ◀ on a sideways phone: the bar's own folded menu (Gameroom · Levels · Dashboard) instead of leaving at once
document.addEventListener('click', e => { if(!inPlay() || !$('scr-play').classList.contains('tl-land')) return; const b = e.target.closest && e.target.closest('#gbar .gb-back'); if(!b) return;
  e.stopPropagation(); e.preventDefault(); const fm = document.querySelector('#gbar .gb-fmenu'); if(!fm) return; const hd = fm.querySelector('.gb-fhd'), lv = $('hud-level');
  if(hd){ hd.textContent = lv ? (lv.dataset.full || lv.textContent) : ''; hd.style.display = hd.textContent ? '' : 'none'; } fm.classList.toggle('hidden'); }, true);
/* 🔄 fd-1d turning the view — like Aowu's Home Layout (turnPlan): 90° steps, 0.42 s cubic in-out, round the spot in the middle of the screen, Q / E keys,
   remembered per player, a short note after turning. ⟲ 🧭 ⟳ sit on top of ＋ －; 🧭 = back to the book's own view. */
const fdRotKey = () => 'sp_fd_rot:' + (S.player || '');
function fdRotSaved(){ try{ const v = parseInt(localStorage.getItem(fdRotKey()), 10); return v >= 0 && v < 4 ? v : 0; }catch(e){ return 0; } }
function fdTurn(dir, to){ if(!isFarm() || FDR.spin || !G) return false; const k0 = fdK(), k1 = to != null ? to : (((k0 + dir) % 4) + 4) % 4; if(k1 === k0) return false;
  let step = k1 - k0; if(step > 2) step -= 4; if(step < -2) step += 4;   // the short way round (🧭 from 3 → 0 = one step ⟳)
  fdCloseCard(); FDP.pick = null; const from = FDR.th, toTh = from + step * Math.PI / 2;
  // the spot in the middle of the screen stays put when zoomed in (at zoom 1 the island turns round its own middle)
  const W0 = FDZ.z > 1.001 ? fdWorldAt(VIEW.px / 2, VIEW.ph / 2) : null;
  const L0 = fdIsl(k0), L1 = fdIsl(k1); fdWarm(k1);
  if(!FX){ fdSetRot(toTh); fdTurnEnd(W0); return true; }
  FDR.spin = {from, to: toTh, t0: performance.now(), dur: 420, q: 0, L0, L1, W0}; UISound.play('whoosh'); return true; }
function fdSpinStep(now){ const sp = FDR.spin; if(!sp) return; const t = Math.min(1, (now - sp.t0) / sp.dur), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  sp.q = t; if(t >= 1){ fdSetRot(sp.to); FDR.spin = null; fdTurnEnd(sp.W0); return; }
  fdSetRot(sp.from + (sp.to - sp.from) * e); if(sp.W0) fdKeep(sp.W0); }
function fdKeep(W0){ const px = IX(W0.x, W0.y), py = IY(W0.x, W0.y, 0); FDZ.ox += VIEW.px / 2 - px; FDZ.oy += VIEW.ph / 2 - py; fdZoomApply(); }
function fdTurnEnd(W0){ const k = fdK(); fdSetRot(k * Math.PI / 2); FDR.k = k; if(W0) fdKeep(W0); FDP.bgKey = ''; FDP.pics.clear();
  try{ localStorage.setItem(fdRotKey(), String(k)); }catch(e){}
  fdRotBadge(); banner(k ? '🔄 Map turned — tap 🧭 to turn it back' : '🧭 Back to the book\'s own view'); fdHints(); }
// bake the turned pictures before the spin needs them (the switch half way must not stall a frame)
function fdWarm(k){ if(!fdHasProps()) return; const step = Iso.stepFor(ISO.zi * (VIEW.dpr || 1)), list = [fdHouseIt()].concat(G.gates.map(fdGateIt), (G.rocks || []).map(r => fdItem('rock', 'rock', r.i, r.j, {v: r.v})));
  list.forEach(it => { if(!it) return; try{ const R = fdRotItem(it, {}, k); if(R.it && R.it.pic) R.it.pic.bake(step); }catch(e){} }); }
function fdRotButtons(z){ if(z.querySelector('.fd-rot')) return; const r = document.createElement('div'); r.className = 'fd-rot';
  r.innerHTML = '<button type="button" data-r="-1" data-sound="tap" aria-label="Turn the map left" title="Turn left (Q)">⟲</button><button type="button" data-r="0" data-sound="tap" aria-label="Back to the first view" title="Back to the first view" class="fd-compass"><i>🧭</i></button><button type="button" data-r="1" data-sound="tap" aria-label="Turn the map right" title="Turn right (E)">⟳</button>';
  z.prepend(r); r.querySelectorAll('button').forEach(b => b.onclick = ev => { ev.stopPropagation(); const d = +b.dataset.r; if(d) fdTurn(d); else fdTurn(0, 0); }); fdRotBadge(); }
function fdRotBadge(){ const c = document.querySelector('#fd-zoom .fd-compass'); if(!c) return; const k = FDR.spin ? null : fdK(); c.classList.toggle('on', !!k); const i = c.querySelector('i'); if(i) i.style.transform = 'rotate(' + (-(k || 0) * 90) + 'deg)'; }
// which way someone faces in a turned view: by where they moved ON SCREEN
function fdFaceL(o, x){ if(o._lx != null && Math.abs(x - o._lx) > 0.05) o._fl = x < o._lx; o._lx = x; return o._fl != null ? o._fl : (o.face || 1) < 0; }
(function(){ const st = document.createElement('style'); st.id = 'fd-css-rot'; st.textContent = [
  '.fd-zoom .fd-rot{display:flex;gap:4px;margin-bottom:2px}',
  '.fd-zoom .fd-rot button{font-size:1.25rem;line-height:1}',
  '.fd-zoom .fd-compass i{display:inline-block;font-style:normal;font-size:1rem;transition:transform .42s cubic-bezier(.65,0,.35,1)}',
  '.fd-zoom .fd-compass.on{background:#FFF3C4;border-color:#FFC93C}',
  '.fd-zoom{align-items:flex-end}',
  // a sideways phone: ONE row along the bottom (the cloud band) so the buttons never sit on the island
  '#scr-play.tl-land .fd-zoom{flex-direction:row;align-items:center;bottom:6px} #scr-play.tl-land .fd-zoom .fd-rot{margin:0}'].join('\n'); document.head.appendChild(st); })();
/* 👨‍🌾 FARMER DELUSION — page END */
/* ================= 🔔 GO BUTTONS (fd-1e) — a themed Go! per map (Aowu 2026-11-17 22:03 / 22:15) =================
   The tap plays 5 beats: ready → anticipation (wind-up) → CONTACT (the wave starts HERE, inside the game loop tick) → follow-through → settle.
   🔔 farm ch 1 bell + 🐓 rooster · 🌧️ ch 2 rain roof (drips before rain waves) + 🚧 back gate plank once the new route is open ·
   📯 Dra-Princess herald horn + 🐉 roar · 🐚 / 🏮 for the later books. The timer running out plays the SAME hit (never a silent start).
   Ring round the button = time left in the break. Painters: Test Harness/farmer-draft/gobtn_draft.js (one dark rim, no emoji). */
(function(){
  const RIM = '#2A1C14';
  const G = {};
  function rr(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function ink(g, w){ g.lineWidth = w || 2.2; g.strokeStyle = RIM; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
  function swingOf(beat, q, t){   // bell / horn angle (radians) per beat
    if(beat === 'idle') return Math.sin(t * 2.2) * 0.06;
    if(beat === 'anticipation') return -0.55 * Math.sin(q * Math.PI / 2);          // pulled back
    if(beat === 'contact') return 0.42;                                              // struck, held
    if(beat === 'follow') return 0.42 * Math.cos(q * Math.PI * 1.6) * (1 - q);       // overshoot + settle
    return 0;
  }
  /* ---------- 🔔 farm bell on a post + 🐓 rooster ---------- */
  function post(g, rain){
    g.fillStyle = '#8B5A2B'; rr(g, 26, 26, 8, 74, 2); g.fill(); ink(g);            // post
    g.fillStyle = '#A06A35'; rr(g, 26, 24, 54, 8, 3); g.fill(); ink(g);            // beam
    g.fillStyle = '#6E9E4A'; g.beginPath(); g.ellipse(36, 101, 26, 5, 0, 0, 7); g.fill(); ink(g, 1.6);   // grass tuft
    if(rain){   // little tin rain roof over the beam
      g.fillStyle = '#7FA7C9'; g.beginPath(); g.moveTo(16, 24); g.lineTo(52, 8); g.lineTo(88, 24); g.lineTo(84, 28); g.lineTo(52, 14); g.lineTo(20, 28); g.closePath(); g.fill(); ink(g);
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.2; for(let i = 0; i < 4; i++){ g.beginPath(); g.moveTo(26 + i * 8, 22 - i * 3.4); g.lineTo(28 + i * 8, 25 - i * 3.4); g.stroke(); }
    }
  }
  function bell(g, ang, gold){
    g.save(); g.translate(64, 32); g.rotate(ang);
    g.fillStyle = gold ? '#F2C14E' : '#D9A23A';
    g.beginPath(); g.moveTo(-5, 2); g.quadraticCurveTo(-7, 8, -9, 20); g.quadraticCurveTo(-15, 30, -17, 34); g.lineTo(17, 34); g.quadraticCurveTo(15, 30, 9, 20); g.quadraticCurveTo(7, 8, 5, 2); g.closePath(); g.fill(); ink(g);
    g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(-6, 18, 2.4, 8, 0.25, 0, 7); g.fill();
    g.fillStyle = '#7A4E1E'; g.beginPath(); g.arc(0, 36, 3.6, 0, 7); g.fill(); ink(g, 1.6);           // clapper
    g.fillStyle = '#C0392B'; rr(g, -3, -2, 6, 6, 2); g.fill(); ink(g, 1.6);                           // red rope knot
    g.restore();
  }
  function rooster(g, beat, q, t){   // one-piece: body + tail + head; leans back on anticipation, crows on contact
    let lean = 0, open = 0, puff = 1;
    if(beat === 'idle') lean = Math.sin(t * 1.4) * 0.04;
    if(beat === 'anticipation'){ lean = -0.32 * q; puff = 1 + 0.12 * q; }
    if(beat === 'contact'){ lean = 0.22; open = 1; puff = 1.12; }
    if(beat === 'follow'){ lean = 0.22 * (1 - q); open = 1 - q * 0.6; puff = 1.12 - 0.12 * q; }
    g.save(); g.translate(46, 24); g.rotate(lean);
    g.fillStyle = '#2F6E3A'; g.beginPath(); g.moveTo(-6, -6); g.quadraticCurveTo(-20, -24, -12, -30); g.quadraticCurveTo(-8, -18, -2, -12); g.closePath(); g.fill(); ink(g, 1.8);   // tail
    g.fillStyle = '#E8833A'; g.beginPath(); g.ellipse(0, -9, 10 * puff, 8 * puff, 0, 0, 7); g.fill(); ink(g, 1.8);                  // body
    g.fillStyle = '#F6B26B'; g.beginPath(); g.ellipse(-1, -8, 5, 4, 0.3, 0, 7); g.fill();                                           // wing light
    g.fillStyle = '#F4E3C3'; g.beginPath(); g.arc(8, -20, 6, 0, 7); g.fill(); ink(g, 1.8);                                         // head
    g.fillStyle = '#D93A2B'; g.beginPath(); g.moveTo(4, -25); g.quadraticCurveTo(6, -31, 8, -26); g.quadraticCurveTo(10, -32, 12, -25); g.closePath(); g.fill(); ink(g, 1.4);   // comb
    g.fillStyle = '#F2B233'; g.beginPath(); g.moveTo(13, -21 - open * 2); g.lineTo(19 + open * 2, -20); g.lineTo(13, -18 + open * 2); g.closePath(); g.fill(); ink(g, 1.4);   // beak
    g.fillStyle = RIM; g.beginPath(); g.arc(9.5, -21.5, 1.2, 0, 7); g.fill();
    g.restore();
    if(open > 0.3){   // crow lines (no words in the picture)
      g.strokeStyle = 'rgba(42,28,20,' + (0.8 * open) + ')'; g.lineWidth = 1.8;
      for(let i = 0; i < 3; i++){ g.beginPath(); g.arc(66, 2, 6 + i * 5, -0.9, 0.2); g.stroke(); }
    }
  }
  function backGate(g){   // 🚧 the back gate plank leaning on the post (ch 2, after Mr. Umbrella's new route)
    g.save(); g.translate(86, 96); g.rotate(-0.18);
    for(let i = 0; i < 2; i++){ g.fillStyle = '#FFFFFF'; rr(g, -14, -24 + i * 12, 28, 7, 2); g.fill(); ink(g, 1.6);
      g.save(); rr(g, -14, -24 + i * 12, 28, 7, 2); g.clip(); g.fillStyle = '#D93A2B'; for(let s = -14; s < 16; s += 8){ g.beginPath(); g.moveTo(s, -24 + i * 12); g.lineTo(s + 4, -24 + i * 12); g.lineTo(s + 1, -17 + i * 12); g.lineTo(s - 3, -17 + i * 12); g.fill(); } g.restore(); }
    g.fillStyle = '#8B5A2B'; rr(g, -12, -26, 4, 26, 1); g.fill(); ink(g, 1.4); rr(g, 8, -26, 4, 26, 1); g.fill(); ink(g, 1.4);
    g.restore();
  }
  function rings(g, x, y, q, col){   // sound rings at contact / follow
    for(let i = 0; i < 3; i++){ const r = 10 + (q * 30) + i * 9, a = Math.max(0, 0.85 - q - i * 0.18); if(a <= 0) continue;
      g.strokeStyle = col.replace('A', a.toFixed(2)); g.lineWidth = 3 - i * 0.6; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); }
  }
  function drops(g, t){ g.fillStyle = '#5B8DB8'; for(let i = 0; i < 3; i++){ const y = 30 + ((t * 40 + i * 13) % 26); g.beginPath(); g.ellipse(22 + i * 30, y, 1.4, 2.6, 0, 0, 7); g.fill(); } }
  G.bell = function(g, beat, q, t, o){ post(g, false); bell(g, swingOf(beat, q, t)); rooster(g, beat, q, t); if(beat === 'contact' || beat === 'follow') rings(g, 64, 62, beat === 'contact' ? 0 : q, 'rgba(255,214,90,A)'); };
  G.bellRain = function(g, beat, q, t, o){ if(o && o.raining) drops(g, t); post(g, true); bell(g, swingOf(beat, q, t)); rooster(g, beat, q, t); if(o && o.backGate) backGate(g); if(beat === 'contact' || beat === 'follow') rings(g, 64, 62, beat === 'contact' ? 0 : q, 'rgba(255,214,90,A)'); };
  /* ---------- 📯 Dra-Princess: herald horn on a banner pole + 🐉 dragon roar ---------- */
  G.horn = function(g, beat, q, t){
    // banner pole
    g.fillStyle = '#7A5A3A'; rr(g, 84, 22, 6, 80, 2); g.fill(); ink(g);
    const wave = Math.sin(t * 3) * 3;
    g.fillStyle = '#8E44AD'; g.beginPath(); g.moveTo(90, 24); g.quadraticCurveTo(104, 28 + wave, 112, 26); g.lineTo(106, 38); g.lineTo(112, 50); g.quadraticCurveTo(102, 48 - wave, 90, 50); g.closePath(); g.fill(); ink(g);
    g.fillStyle = '#F2C14E'; g.beginPath(); g.arc(100, 37, 4, 0, 7); g.fill();          // crown dot
    // 🐉 dragon head + neck (one piece), inhales on anticipation, ROARS on contact
    let inh = 0, open = 0.15;
    if(beat === 'anticipation'){ inh = q; open = 0.05; }
    if(beat === 'contact'){ inh = -0.3; open = 1; }
    if(beat === 'follow'){ inh = -0.3 * (1 - q); open = 1 - q * 0.7; }
    if(beat === 'idle') inh = Math.sin(t * 1.6) * 0.15;
    g.save(); g.translate(28, 92); g.rotate(-0.15 - inh * 0.25);
    g.fillStyle = '#4CAF6E';
    g.beginPath(); g.moveTo(-10, 8); g.quadraticCurveTo(-14, -30, 4, -44 - inh * 4); g.lineTo(22, -46 - inh * 4);
    g.lineTo(36, -40 - open * 6); g.lineTo(26, -34); g.lineTo(36, -26 + open * 8); g.lineTo(18, -26); g.quadraticCurveTo(6, -14, 10, 8); g.closePath(); g.fill(); ink(g);
    g.fillStyle = '#9BE3A9'; g.beginPath(); g.ellipse(-2, -12, 5 + inh * 2, 14, 0.1, 0, 7); g.fill();     // belly puffs
    g.fillStyle = '#F2C14E'; g.beginPath(); g.moveTo(6, -46); g.lineTo(2, -56); g.lineTo(12, -48); g.closePath(); g.fill(); ink(g, 1.5);   // horn
    g.fillStyle = RIM; g.beginPath(); g.arc(16, -40, 1.6, 0, 7); g.fill();
    if(open > 0.5){ g.fillStyle = 'rgba(255,140,60,' + (open * 0.8) + ')'; g.beginPath(); g.moveTo(34, -32); g.lineTo(52, -42); g.lineTo(50, -24); g.closePath(); g.fill(); }
    g.restore();
    // 📯 herald horn (princess's), lifted on anticipation, TOOT on contact
    const lift = beat === 'anticipation' ? q : (beat === 'contact' ? 1 : beat === 'follow' ? 1 - q * 0.5 : 0);
    g.save(); g.translate(62, 64 - lift * 8); g.rotate(-0.35 - lift * 0.25 + (beat === 'idle' ? Math.sin(t * 2) * 0.04 : 0));
    g.fillStyle = '#F2C14E'; g.beginPath(); g.moveTo(-22, -2); g.lineTo(6, -3); g.quadraticCurveTo(16, -12, 22, -14); g.lineTo(22, 14); g.quadraticCurveTo(16, 12, 6, 3); g.lineTo(-22, 2); g.closePath(); g.fill(); ink(g);
    g.fillStyle = '#C0392B'; g.beginPath(); g.moveTo(-8, 3); g.lineTo(2, 3); g.lineTo(0, 16); g.lineTo(-4, 12); g.lineTo(-8, 16); g.closePath(); g.fill(); ink(g, 1.5);   // pennant
    g.restore();
    if(beat === 'contact' || beat === 'follow') rings(g, 90, 46, beat === 'contact' ? 0 : q, 'rgba(255,214,90,A)');
  };
  /* ---------- later books (placeholders for the theme table) ---------- */
  G.conch = function(g, beat, q, t){ g.save(); g.translate(60, 60); g.rotate(swingOf(beat, q, t) * 0.5);
    g.fillStyle = '#F7B7A3'; g.beginPath(); g.moveTo(-28, 10); g.quadraticCurveTo(-10, -30, 26, -16); g.quadraticCurveTo(30, 0, 20, 14); g.quadraticCurveTo(0, 22, -28, 10); g.closePath(); g.fill(); ink(g);
    g.strokeStyle = '#D9826B'; g.lineWidth = 2; for(let i = 0; i < 3; i++){ g.beginPath(); g.arc(8, -2, 6 + i * 6, 2.4, 4.6); g.stroke(); } g.restore();
    if(beat === 'contact' || beat === 'follow') rings(g, 30, 64, beat === 'contact' ? 0 : q, 'rgba(120,220,255,A)'); };
  G.lantern = function(g, beat, q, t){ g.save(); g.translate(60, 26); g.rotate(swingOf(beat, q, t) * 0.6);
    g.strokeStyle = RIM; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -10); g.lineTo(0, 6); g.stroke();
    g.fillStyle = '#E2453A'; g.beginPath(); g.ellipse(0, 30, 22, 26, 0, 0, 7); g.fill(); ink(g);
    g.fillStyle = '#F2C14E'; rr(g, -12, 2, 24, 6, 2); g.fill(); ink(g, 1.5); rr(g, -12, 52, 24, 6, 2); g.fill(); ink(g, 1.5);
    const glow = beat === 'contact' ? 1 : beat === 'follow' ? 1 - q : 0.25; g.fillStyle = 'rgba(255,230,140,' + glow * 0.8 + ')'; g.beginPath(); g.ellipse(0, 30, 10, 16, 0, 0, 7); g.fill(); g.restore(); };
  /* ---------- the button face: medallion + countdown ring + label ---------- */
  const SKIN = {bell: {a: '#7CC25A', b: '#3E8E3A', ring: '#FFD23F'}, bellRain: {a: '#8DB8D8', b: '#4F7FA8', ring: '#FFD23F'},
    horn: {a: '#B07CD8', b: '#6B3FA0', ring: '#FFD23F'}, conch: {a: '#5FC8D8', b: '#257E96', ring: '#FFE7A0'}, lantern: {a: '#E2604F', b: '#8E2A22', ring: '#FFD23F'}};
  G.face = function(g, theme, beat, q, t, o){
    o = o || {}; const S = SKIN[theme];
    const press = beat === 'anticipation' ? 1 - 0.06 * q : beat === 'contact' ? 1.08 : beat === 'follow' ? 1.08 - 0.08 * q : 1 + Math.sin(t * 3.4) * 0.02;
    g.save(); g.translate(60, 60); g.scale(press, press); g.translate(-60, -60);
    const gr = g.createRadialGradient(52, 44, 6, 60, 60, 58); gr.addColorStop(0, S.a); gr.addColorStop(1, S.b);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(60, 64, 56, 0, 7); g.fill();
    g.fillStyle = gr; g.beginPath(); g.arc(60, 60, 56, 0, 7); g.fill(); ink(g, 3);
    if(o.left != null && o.of){ g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 6; g.beginPath(); g.arc(60, 60, 51, 0, 7); g.stroke();
      g.strokeStyle = S.ring; g.lineWidth = 6; g.beginPath(); g.arc(60, 60, 51, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (o.left / o.of)); g.stroke(); }
    g.save(); g.beginPath(); g.arc(60, 60, 48, 0, 7); g.clip(); const farm = theme === 'bell' || theme === 'bellRain'; if(farm){ g.translate(12, 22); g.scale(0.78, 0.78); } else { g.translate(8, 2); g.scale(0.88, 0.88); }
    G[theme](g, beat, q, t, o); g.restore();
    g.restore();
  };
  G.BEATS = [{k: 'ready', ms: 60, ease: 'sineInOut'}, {k: 'anticipation', ms: 180, ease: 'cubicOut'}, {k: 'contact', ms: 90, ease: 'quartOut', contact: true, stop: 60},
    {k: 'follow', ms: 240, ease: 'backOut'}, {k: 'settle', ms: 140, ease: 'sineInOut'}];
  (typeof window !== 'undefined' ? window : globalThis).GOB = G;
})();
const GO_LEAD = 0.24, GO_TOTAL = 0.71;   // ready 60 + anticipation 180 ms → contact; + contact 90 + follow 240 + settle 140
const GOX = {run: null, raf: 0, size: 0, n: 0, log: []};
window.GO_LOG = GOX.log;
function goEl(){ return $('go-btn'); }
function goTheme(){ if(G && G.fd) return G.C && G.C.n >= 2 ? 'bellRain' : 'bell'; return ({draprincess: 'horn', coral: 'conch', market: 'lantern'})[S.book] || 'horn'; }
function goLimit(){ if(!G) return 0; const bl = G.goHold != null ? G.goHold : G.breakLen;
  return G.fd ? (bl > 0 ? bl + (G.freeMoveT > 0 ? 10 : 0) : 0) : (bl != null ? bl : 2.6); }
function goOpts(){ const o = {}; if(G && G.fd && G.C){ o.raining = !!(G.C.rain && G.C.rain.includes(G.wave + 1)); o.backGate = !!(G.C.newGate && G.routeDone); }
  const lim = goLimit(); if(lim > 0 && G && G.state === 'break' && !GOX.run){ o.of = lim; o.left = Math.max(0, lim - G.wt); } return o; }
function goLabel(){ const b = goEl(); if(!b || !G) return; const lim = goLimit(), left = lim > 0 && G.state === 'break' && !GOX.run ? Math.max(0, Math.ceil(lim - G.wt)) : 0,
  t = left ? '▶ Go! · ' + left : '▶ Go!', lb = b.querySelector('.gob-lb'); if(lb && lb.textContent !== t) lb.textContent = t; }
function goShow(){ const b = goEl(); if(!b) return; if(GOX.run && (GOX.run.g !== G || GOX.run.fired)) GOX.run = null;   // a new break: an old hit's follow-through never hides the new button
  b.dataset.theme = goTheme(); b.classList.remove('hidden', 'gob-hit'); GOX.size = 0; goLabel(); goPlace(); if(!GOX.raf) GOX.raf = requestAnimationFrame(goFrame); }
// 👣 on the farm the steps line sits bottom-left: lift the button above it when they would touch (phones held upright, tablets)
function goPlace(){ const b = goEl(), st = $('stage'), sp = $('fd-steps'); if(!b || !st) return; const was = b.style.bottom; b.style.bottom = '';
  if(G && G.fd && sp && !sp.classList.contains('hidden') && getComputedStyle(sp).display !== 'none'){ const r = b.getBoundingClientRect(), q = sp.getBoundingClientRect(), R = st.getBoundingClientRect();
    if(q.width && r.left < q.right + 4 && r.right > q.left - 4 && r.bottom > q.top - 4) b.style.bottom = Math.round(R.bottom - q.top + 4) + 'px'; }
  if(b.style.bottom !== was) GOX.size = 0; }
function goHide(){ const b = goEl(); if(!b) return; if(GOX.run && !GOX.run.done){ GOX.run.hideAfter = true; return; } b.classList.add('hidden'); b.classList.remove('gob-hit'); }
function goStop(){ GOX.run = null; const b = goEl(); if(b){ b.classList.add('hidden'); b.classList.remove('gob-hit'); } if(GOX.raf){ cancelAnimationFrame(GOX.raf); GOX.raf = 0; } }
// called by the game loops BEFORE they step: CONTACT starts the wave in the same tick; the break timer starts the hit 0.24 s early
function goAuto(){ if(!G) return; const r = GOX.run;
  if(r){ if(r.due && !r.fired && !G.paused) goContact(); return; }
  if(G.state !== 'break' || G.paused) return; const b = goEl(); if(!b || b.classList.contains('hidden')) return;
  const lim = goLimit(); if(lim > 0 && G.wt + GO_LEAD * (G.speed || 1) >= lim) goHit(true); }
function goNow(){ if(G && G.state === 'break') goHit(false); }
function goHit(auto){
  if(!G || G.state !== 'break' || GOX.run) return;
  const g = G; if(g.goHold == null){ g.goHold = g.breakLen; g.breakLen = 1e9; }   // the hit owns the start: the engine's own timer waits for CONTACT
  GOX.n++; GOX.run = {g, t: 0, last: performance.now(), auto: !!auto, due: false, fired: false, done: false, crow: GOX.n % 3};
  GOX.log.push({k: 'tap', auto: !!auto, at: performance.now(), wave: g.wave, theme: goTheme()}); goSound('wind');
  if(!window.FX){ GOX.run.due = true; goContact(); return; }   // tests with FX 0: at once
  if(!GOX.raf) GOX.raf = requestAnimationFrame(goFrame);
}
function goContact(){ const r = GOX.run; if(!r || r.fired) return; r.fired = true; const g = r.g;
  if(g.goHold != null){ g.breakLen = g.goHold; g.goHold = null; }
  if(g !== G || g.state !== 'break'){ goEnd(); return; }
  (g.fd ? FD : TD).startWave(g);
  GOX.log.push({k: 'contact', at: performance.now(), beatT: r.t, wave: g.wave, state: g.state, theme: goTheme(), crow: r.crow});
  goSound('hit'); const b = goEl(); if(b) b.classList.add('gob-hit'); if(HAND === b) hideHand();
  if(!window.FX) goEnd();
}
function goEnd(){ const r = GOX.run; if(r) r.done = true; GOX.run = null; const b = goEl(); if(!b) return; b.classList.remove('gob-hit');
  if(!G || G.state !== 'break' || (r && r.hideAfter)) b.classList.add('hidden'); else goLabel(); }
// beat at time t (s) → [painter beat, q]
function goBeat(r){ if(!r) return ['idle', 0]; let t = r.t; if(!r.fired) t = Math.min(t, GO_LEAD + 0.03);
  if(t < 0.06) return ['idle', 0]; if(t < GO_LEAD) return ['anticipation', (t - 0.06) / 0.18];
  if(t < GO_LEAD + 0.09 || !r.fired) return ['contact', 0]; if(t < GO_LEAD + 0.33) return ['follow', (t - GO_LEAD - 0.09) / 0.24]; return ['follow', 1]; }
function goFrame(now){
  GOX.raf = 0; const b = goEl(); if(!b) return; const r = GOX.run;
  if(r){ const dt = Math.min(0.1, Math.max(0, (now - r.last) / 1000)); r.last = now; if(!(G && G.paused) || r.fired) r.t += dt;   // ⏸ holds the wind-up, never the follow-through
    if(!r.fired && r.t >= GO_LEAD) r.due = true;
    if(r.fired && r.t >= GO_TOTAL) goEnd(); }
  if(b.classList.contains('hidden') && !GOX.run) return;   // hidden → stop drawing
  goPaint(now / 1000); if(!GOX.run){ goLabel(); if((GOX.f = (GOX.f || 0) + 1) % 15 === 0) goPlace(); }
  GOX.raf = requestAnimationFrame(goFrame);
}
function goPaint(t){
  const b = goEl(), c = b && b.querySelector('canvas'); if(!c || typeof GOB === 'undefined') return;
  const px = Math.round(c.getBoundingClientRect().width) || 0; if(!px) return; const d = Math.min(3, window.devicePixelRatio || 1), W = Math.round(px * d);
  if(c.width !== W){ c.width = c.height = W; }
  const g = c.getContext('2d'), bt = goBeat(GOX.run), o = goOpts(); if(GOX.run) o.crow = GOX.run.crow;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, W); g.setTransform(W / 128, 0, 0, W / 128, 4 * W / 128, 4 * W / 128);
  try{ GOB.face(g, b.dataset.theme || goTheme(), bt[0], Math.max(0, Math.min(1, bt[1])), t, o); }catch(e){}
}
// 🔊 shared tone maker only (UISound) — 🔇 silences it like every other sound
function goSound(k){ const U = window.UISound; if(!U || !U.isOn || !U.isOn()) return; const th = goTheme();
  try{
    if(k === 'wind'){ U.noise(0.18, {gain: 0.1, from: 300, to: 1400}); return; }
    if(th === 'bell' || th === 'bellRain'){ U.note('E6', 1.4, {instrument: 'bell', gain: 0.32}); U.note('B5', 1.1, {instrument: 'bell', gain: 0.18, delay: 0.02});
      const v = GOX.run ? GOX.run.crow : 0, f = [520, 600, 460][v];   // 🐓 3 different crows
      U.tone(f, 0.12, {type: 'sawtooth', gain: 0.06, slide: f * 1.5, delay: 0.14}); U.tone(f * 1.5, [0.38, 0.3, 0.5][v], {type: 'sawtooth', gain: 0.05, slide: f * [1.1, 1.3, 0.9][v], delay: 0.26}); }
    else if(th === 'horn'){ U.note('G4', 0.42, {instrument: 'flute', gain: 0.3}); U.note('D5', 0.5, {instrument: 'flute', gain: 0.24, delay: 0.18});
      U.noise(0.7, {gain: 0.24, from: 900, to: 120, delay: 0.1}); U.tone(110, 0.6, {type: 'sawtooth', gain: 0.07, slide: 70, delay: 0.1}); }
    else if(th === 'conch') U.tone(196, 0.8, {type: 'triangle', gain: 0.2, slide: 220});
    else U.note('C5', 1, {instrument: 'bell', gain: 0.3});
  }catch(e){}
}
/* 🔔 GO BUTTONS END */
/* ================= BOOT ================= */
function boot(){
  UI.loading('tdstories');
  google.script.run.withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.progressFarmer = d.progressFarmer || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {};
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
