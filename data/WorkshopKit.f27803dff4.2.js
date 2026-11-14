
window.WorkshopKit = (function(){
const $ = id => document.getElementById('wk-' + id);
const pick = a => a[rnd(a.length)];
const MARKUP = `<section class="screen hidden" id="wk-scr-player">
  <div class="title"><div class="logo">🔨</div><h1>Furniture Workshop</h1><p>Who's building?</p></div>
  <div class="pick-grid" id="wk-player-list"></div>
</section>

<section class="screen hidden" id="wk-scr-menu">
  <div class="title"><div class="logo">🔨</div><h1>Furniture Workshop</h1><p>Build it, put it in your room, give it — and win the Design Show!</p>
    <div class="who">👤 <span id="wk-who-name"></span> <button data-sound="none" onclick="WorkshopKit.changePlayer()">change</button></div></div>
  <div class="tabs" id="wk-tabs"></div>
  <div id="wk-tab-body"></div>
</section>

<section class="screen hidden" id="wk-scr-build">
  <div class="title"><div class="logo" id="wk-build-logo">🪑</div><h1 id="wk-build-title">Build a chair</h1><p>Pick the parts, colours and a sticker — or ✏️ draw your own part</p></div>
  <div class="editor">
    <div class="stagebox"><canvas id="wk-ed-cv" width="480" height="480"></canvas><input id="wk-ed-name" maxlength="24" placeholder="Give it a name">
      <div class="ed-btns"><button class="btn soft" data-sound="pop" onclick="WorkshopKit.randomize()">🎲 Surprise me</button></div>
      <div class="ed-btns"><button class="btn soft" onclick="WorkshopKit.showMenu('mine')">◀ Back</button><button class="btn" id="wk-ed-save" data-sound="pop">🔨 Build it!</button></div></div>
    <div class="wk-opts" id="wk-ed-opts"></div>
  </div>
</section>

<div class="wk-sheet hidden" id="wk-pad"><div class="wk-sheet-card"><h3 id="wk-pad-title">✏️ Draw your part</h3><p class="pad-hint" id="wk-pad-hint"></p>
  <div class="pad-wrap"><div class="pad-stage"><canvas id="wk-pad-cv" width="480" height="480"></canvas><div id="wk-pad-printing" class="hidden"></div></div>
    <div style="display:flex;flex-direction:column;gap:8px;align-items:center"><div class="pad-tools" id="wk-pad-tools"></div><div class="pad-cols" id="wk-pad-cols"></div><div class="pad-tools" id="wk-pad-starters"></div>
    <div class="ed-btns"><button class="btn soft" data-sound="pop" id="wk-pad-cancel">✖ Cancel</button><button class="btn" data-sound="none" id="wk-pad-ok">🖨️ Print it!</button></div></div></div></div></div>
<input type="file" id="wk-upl-file" accept="image/*" class="hidden">
<div class="wk-sheet hidden" id="wk-givesheet"><div class="wk-sheet-card"><h3 id="wk-give-title">🎁 Give a copy</h3><p style="font-size:0.82rem;font-weight:700;color:var(--ink-soft);margin:4px 0 0" id="wk-give-sub"></p><div class="give-list" id="wk-give-list"></div>
  <div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btn soft" data-sound="pop" onclick="WorkshopKit.closeGive()">Close</button></div></div></div>`;
// host: {mode: 'page' | 'room', onClose, onShowroom, onPlace(creation), changed}
const HOST = {mode: 'page', changed: false, scroller: null, scrollTop(){ if(HOST.scroller) HOST.scroller.scrollTop = 0; else window.scrollTo(0, 0); }};
const TYPE_KEYS = Object.keys(CREATION_TYPES);

/* ================= STATE ================= */
let S = {players: [], settings: {}, avatars: {}, creations: [], giftsLeft: 0, player: ''};
let TAB = 'build', SORT = 'top', ED = null, lockHandle = null, edRaf = 0;
function myAvatar(name){ const a = S.avatars[name || S.player]; return a ? fixAv(a) : defaultAvatar(name || S.player || 'maker'); }
function mine(){ return S.creations.filter(c => c.maker === S.player); }
function given(){ return S.creations.filter(c => c.maker !== S.player && (c.owners || []).includes(S.player)); }
function shown(){ return S.creations.filter(c => c.show); }
function paintThing(cv, c, t){ const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); drawCreation(g, Object.assign({type: c.type}, c.look || c), cv.width / 2, cv.height * 0.92, cv.width * 0.84, t || 1); }

/* ================= MENUS ================= */
function showScreen(name){
  ['player', 'menu', 'build'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name)); HOST.scrollTop();
  if(name !== 'build') cancelAnimationFrame(edRaf);
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
  S.player = name; $('who-name').textContent = name;
  if(S.loadedFor !== name){ UI.call('getWorkshopData', [name], {page: true, kind: 'workshop'}).then(d => { take(d, name); showMenu(mine().length ? 'mine' : 'build'); }).catch(() => {}); return; }   // stars + gifts are per player
  showMenu(mine().length ? 'mine' : 'build');
}
function take(d, name){ S.players = d.players || []; S.settings = d.settings || {}; S.avatars = d.avatars || {}; S.creations = d.creations || []; S.giftsLeft = d.giftsLeft || 0; S.loadedFor = name || ''; }
function changePlayer(){ renderPlayers(); showScreen('player'); }
function showMenu(tab){
  TAB = tab || TAB; showScreen('menu');
  const tabs = [['build', '🔨 Build new', ''], ['mine', '🗂️ My things', mine().length + given().length], ['show', '🎭 Design Show', shown().length]];
  $('tabs').innerHTML = tabs.map(t => '<button class="' + (TAB === t[0] ? 'on' : '') + '" data-sound="pop" data-tab="' + t[0] + '">' + t[1] + (t[2] !== '' ? '<span class="n">' + t[2] + '</span>' : '') + '</button>').join('');
  $('tabs').querySelectorAll('[data-tab]').forEach(b => b.onclick = () => showMenu(b.dataset.tab));
  const body = $('tab-body');
  if(TAB === 'build'){
    body.innerHTML = '<div class="types">' + TYPE_KEYS.map(k => '<button class="typ" data-sound="pop" data-type="' + k + '"><canvas width="220" height="220"></canvas><div class="nm">' + CREATION_TYPES[k].icon + ' ' + CREATION_TYPES[k].n + '</div></button>').join('') + '</div><p class="note">Things you build go in 🗂️ My things — put them in your room from the Family Room (🛋️ My Room → 🪴 Decorate → 🔨 Made). Paintings, wall clocks, small mirrors and curtains hang on the walls; ✏️ draw your own part and the 🖨️ Part Printer makes it!</p>';
    body.querySelectorAll('.typ').forEach((b, i) => { const k = b.dataset.type; paintThing(b.querySelector('canvas'), {type: k, look: {col: i * 3 % 12, acc: (i * 5 + 2) % 12, pat: i % 3, parts: [i % 2, 1, 0], stk: 0}}); b.onclick = () => openEditor({type: k}); });
  }
  if(TAB === 'mine'){
    const list = mine().concat(given());
    body.innerHTML = list.length ? '<div class="things">' + list.map(c => thingCard(c, true)).join('') + '</div><p class="note">' + (S.giftsLeft ? '🎁 You can give ' + S.giftsLeft + ' more today.' : '🎁 No gifts left today — more tomorrow!') + ' Put things in your room from the Family Room → 🛋️ My Room → 🪴 Decorate → 🔨 Made.</p>'
      : '<div class="empty">Nothing here yet — tap 🔨 Build new to make your first thing!</div>';
    wireThings(body);
  }
  if(TAB === 'show'){
    let list = shown().slice(); list.sort((a, b) => SORT === 'top' ? b.stars - a.stars || (b.made > a.made ? 1 : -1) : (b.made > a.made ? 1 : -1));
    body.innerHTML = '<div class="sortrow"><button class="chip' + (SORT === 'top' ? ' on' : '') + '" data-sound="pop" data-sort="top">🏆 Top stars</button><button class="chip' + (SORT === 'new' ? ' on' : '') + '" data-sound="pop" data-sort="new">✨ Newest</button></div>' +
      (list.length ? '<div class="things">' + list.map((c, i) => thingCard(c, false, SORT === 'top' && c.stars > 0 ? i : -1)).join('') + '</div><p class="note">Give each thing 1–3 stars. Tap your stars again to change your vote. You can\'t vote for your own!</p>'
        : '<div class="empty">The show is empty — enter something from 🗂️ My things with 🎭!</div>');
    body.querySelectorAll('[data-sort]').forEach(b => b.onclick = () => { SORT = b.dataset.sort; showMenu('show'); });
    wireThings(body);
  }
}
function thingCard(c, own, rank){
  const T = CREATION_TYPES[c.type], isMine = c.maker === S.player;
  let acts = '';
  if(own){
    if(isMine) acts += '<button class="mini-btn" data-sound="pop" data-act="edit">✏️ Change</button><button class="mini-btn' + (c.show ? ' on' : '') + '" data-sound="pop" data-act="show">' + (c.show ? '🎭 In the show' : '🎭 Enter show') + '</button>';
    acts += '<button class="mini-btn" data-sound="pop" data-act="give">🎁 Give</button>';
    if(isMine) acts += '<button class="mini-btn" data-sound="pop" data-act="del">🗑️</button>';
  } else if(!isMine){
    acts = '<div class="vote">' + [1, 2, 3].map(n => '<button class="' + (c.myVote >= n ? 'on' : '') + '" data-sound="none" data-vote="' + n + '" title="' + n + ' star' + (n > 1 ? 's' : '') + '">⭐</button>').join('') + '</div>';
  } else acts = '<div class="by">Your entry — the family votes!</div>';
  return '<div class="thing t-card" data-id="' + c.id + '">' + (rank >= 0 && rank < 3 ? '<span class="ribbon">' + ['🥇', '🥈', '🥉'][rank] + '</span>' : '') + (c.show ? '<span class="starsum">⭐ ' + c.stars + '</span>' : '') +
    '<canvas width="240" height="240"></canvas><div class="nm">' + T.icon + ' ' + UI.esc(c.name) + '</div>' + (c.look && c.look.upl ? '<span class="upl">📷 Uploaded image</span>' : '') + '<div class="by">' + (isMine ? 'by you' : 'by ' + UI.esc(c.maker)) + (c.show && c.votes ? ' · ' + c.votes + ' vote' + (c.votes > 1 ? 's' : '') : '') + '</div><div class="acts">' + acts + '</div></div>';
}
function wireThings(root){
  root.querySelectorAll('.thing').forEach(el => {
    const c = S.creations.find(x => x.id === el.dataset.id); paintThing(el.querySelector('canvas'), c);
    el.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
      const a = b.dataset.act;
      if(a === 'edit') openEditor(c);
      if(a === 'show') UI.call('setInShow', [S.player, c.id, !c.show], {btn: b, kind: 'save', text: c.show ? 'Taking it out' : 'Entering the show'}).then(r => { Object.assign(c, r); UISound.play('success'); if(r.show) UI.toast('🎭 ' + c.name + ' is in the Design Show!', 'ok'); showMenu('mine'); }).catch(() => {});
      if(a === 'give') openGive(c);
      if(a === 'del') UI.confirm({icon: '🗑️', title: 'Remove ' + c.name + '?', body: 'It leaves the show and every room it is in.', okText: 'Remove', cancelText: 'Keep it'}).then(ok => { if(!ok) return; HOST.changed = true; UI.call('deleteCreation', [S.player, c.id], {btn: b, kind: 'remove'}).then(() => { S.creations = S.creations.filter(x => x.id !== c.id); showMenu('mine'); }).catch(() => {}); });
    });
    el.querySelectorAll('[data-vote]').forEach(b => b.onclick = () => {
      const n = Number(b.dataset.vote), give = c.myVote === n ? 0 : n;
      UI.call('voteCreation', [S.player, c.id, give], {section: el, kind: 'vote'}).then(r => { Object.assign(c, r); UISound.play(give ? 'success' : 'pop'); showMenu('show'); }).catch(() => {});
    });
  });
}
/* ---------- give a copy ---------- */
function openGive(c){
  $('give-title').textContent = '🎁 Give ' + c.name; $('give-sub').textContent = S.giftsLeft ? 'It arrives as a gift in their room. ' + S.giftsLeft + ' gift' + (S.giftsLeft > 1 ? 's' : '') + ' left today.' : 'No gifts left today — more tomorrow!';
  const box = $('give-list'); box.innerHTML = '';
  S.players.filter(p => p.Name !== S.player).forEach(p => { const has = (c.owners || []).includes(p.Name), b = document.createElement('button'); b.disabled = has || !S.giftsLeft; b.setAttribute('data-sound', 'pop');
    const cv = document.createElement('canvas'); cv.width = 68; cv.height = 80; b.appendChild(cv); b.insertAdjacentHTML('beforeend', UI.esc(p.Name) + (has ? ' — has it ✅' : ''));
    drawPreviewCanvas(cv, myAvatar(p.Name), {name: p.Name, t: 1});
    b.onclick = () => UI.call('giveCreation', [S.player, p.Name, c.id], {btn: b, kind: 'gift'}).then(r => { Object.assign(c, r.creation); S.giftsLeft = r.left; closeGive(); UISound.play('success'); UI.toast('🎁 ' + c.name + ' is on its way to ' + p.Name + '!', 'ok'); showMenu('mine'); }).catch(() => {});
    box.appendChild(b); });
  if(!box.children.length) box.innerHTML = '<div class="empty">Add more family members on the Dashboard first.</div>';
  $('givesheet').classList.remove('hidden');
}
function closeGive(){ $('givesheet').classList.add('hidden'); }

/* ================= EDITOR ================= */
function openEditor(c){
  const look = c.look ? JSON.parse(JSON.stringify(c.look)) : {col: rnd(12), acc: rnd(12), pat: 0, parts: [0, 0, 0], stk: 0};
  ED = {id: c.id || null, type: c.type, name: c.name || '', look: fixCreation(Object.assign({type: c.type}, look))};
  const T = CREATION_TYPES[ED.type]; $('build-logo').textContent = T.icon; $('build-title').textContent = (ED.id ? 'Change your ' : 'Build a ') + T.n.toLowerCase();
  $('ed-name').value = ED.name; $('ed-save').textContent = ED.id ? '💾 Save changes' : '🔨 Build it!';
  $('ed-save').onclick = saveEditor;
  renderOpts(); showScreen('build');
  const cv = $('ed-cv'), t0 = performance.now(); cancelAnimationFrame(edRaf);
  (function spin(now){ const t = (now - t0) / 1000, g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 480, 480);
    g.fillStyle = 'rgba(160,110,60,0.18)'; g.fillRect(0, 400, 480, 80); for(let x = 0; x < 480; x += 60){ g.fillStyle = 'rgba(160,110,60,0.12)'; g.fillRect(x, 400, 2, 80); }
    g.save(); g.translate(240, 440); g.scale(1 + Math.sin(t * 2) * 0.01, 1 - Math.sin(t * 2) * 0.01); drawCreation(g, Object.assign({type: ED.type}, ED.look), 0, 0, 380, t); g.restore();
    edRaf = requestAnimationFrame(spin); })(t0);
}
// The option panel is built once per editor; clicks only flip the .on marks and repaint the little previews (no rebuild, so the page never jumps).
function renderOpts(){
  const T = CREATION_TYPES[ED.type], L = ED.look; let h = '';
  T.parts.forEach(([label, names], pi) => {
    h += '<div class="wk-opt"><h3>' + label + (pi === T.draw ? ' <span style="font-weight:700">— or draw your own and 🖨️ print it</span>' : '') + '</h3><div class="choices">' + names.map((n, vi) => '<button class="ch" data-sound="tap" data-part="' + pi + '" data-v="' + vi + '"><canvas width="112" height="112"></canvas>' + n + '</button>').join('') +
      (pi === T.draw ? '<button class="ch draw" data-sound="pop" data-part="' + pi + '" data-v="' + names.length + '" data-draw="1"><canvas width="112" height="112"></canvas>' + CR_DRAW + '</button>' : '') + '</div></div>'; });
  if(T.paint) h += '<div class="wk-opt"><h3>🖼️ Your picture</h3><div class="pic-row"><canvas id="wk-pic-prev" width="48" height="48"></canvas><button class="btn soft" data-sound="pop" id="wk-pic-paint">🎨 Paint it</button><button class="btn soft" data-sound="pop" id="wk-pic-upl">📷 Upload a picture</button><span class="upl hidden" id="wk-pic-upl-tag">📷 Uploaded image</span></div></div>';
  h += '<div class="wk-opt"><h3>🎨 Main colour</h3><div class="choices">' + CR_COLS.map((c, i) => '<button class="sw" data-sound="tap" data-col="' + i + '" style="background:' + c + '" aria-label="colour ' + (i + 1) + '"></button>').join('') + '</div></div>';
  h += '<div class="wk-opt"><h3>🖌️ Pattern + second colour</h3><div class="choices">' + CR_PATS.map((p, i) => '<button class="chip" data-sound="tap" data-pat="' + i + '">' + p[1] + ' ' + p[0] + '</button>').join('') + '</div><div class="choices" style="margin-top:8px">' + CR_COLS.map((c, i) => '<button class="sw" data-sound="tap" data-acc="' + i + '" style="background:' + c + '" aria-label="second colour ' + (i + 1) + '"></button>').join('') + '</div></div>';
  h += '<div class="wk-opt"><h3>✨ Sticker</h3><div class="choices">' + CR_STICKERS.map((s, i) => '<button class="chip" data-sound="tap" data-stk="' + i + '">' + (s || '🚫 None') + '</button>').join('') + '</div></div>';
  const box = $('ed-opts'); box.innerHTML = h;
  box.querySelectorAll('[data-part]').forEach(b => b.onclick = () => { const pi = +b.dataset.part, vi = +b.dataset.v; if(b.dataset.draw){ openPad('mask', pi); return; } L.parts[pi] = vi; syncOpts(); });
  box.querySelectorAll('[data-col]').forEach(b => b.onclick = () => { L.col = +b.dataset.col; syncOpts(); });
  box.querySelectorAll('[data-acc]').forEach(b => b.onclick = () => { L.acc = +b.dataset.acc; syncOpts(); });
  box.querySelectorAll('[data-pat]').forEach(b => b.onclick = () => { L.pat = +b.dataset.pat; syncOpts(); });
  box.querySelectorAll('[data-stk]').forEach(b => b.onclick = () => { L.stk = +b.dataset.stk; syncOpts(); });
  if(T.paint){ $('pic-paint').onclick = () => openPad('pix'); $('pic-upl').onclick = () => { $('upl-file').value = ''; $('upl-file').click(); }; }
  syncOpts();
}
function syncOpts(){
  const L = ED.look, box = $('ed-opts');
  box.querySelectorAll('[data-part]').forEach(b => { const pi = +b.dataset.part, vi = +b.dataset.v; b.classList.toggle('on', L.parts[pi] === vi);
    const cv = b.querySelector('canvas');
    if(b.dataset.draw && !L.mask){ const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 112, 112); g.fillStyle = '#000'; g.font = '54px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('✏️', 56, 60); return; }
    const parts = L.parts.slice(); parts[pi] = vi; paintThing(cv, {type: ED.type, look: Object.assign({}, L, {parts})}); });
  [['col', 'col'], ['acc', 'acc'], ['pat', 'pat'], ['stk', 'stk']].forEach(([k, d]) => box.querySelectorAll('[data-' + d + ']').forEach(b => b.classList.toggle('on', L[k] === +b.dataset[d])));
  const pp = $('pic-prev'); if(pp){ const g = pp.getContext('2d'), img = pixCanvas(L.pix); g.clearRect(0, 0, 48, 48); if(img) g.drawImage(img, 0, 0); else { g.fillStyle = '#000'; g.font = '26px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🖼️', 24, 26); } $('pic-upl-tag').classList.toggle('hidden', !L.upl); }
}
function randomize(){ const T = CREATION_TYPES[ED.type], L = ED.look; Object.assign(L, {col: rnd(12), acc: rnd(12), pat: rnd(6), parts: T.parts.map(p => rnd(p[1].length)), stk: rnd(12)}); syncOpts(); }

/* ---------- draw pad: Part Printer (24 × 24 on/off) and painting (48 × 48, 16 colours) ---------- */
let PAD = null;
function hexToCells(hex, mode){ const N = mode === 'mask' ? MASK_N : PIX_N, a = new Array(N * N).fill(0); if(!hex) return a;
  if(mode === 'pix'){ for(let i = 0; i < a.length; i++) a[i] = parseInt(hex[i], 16) || 0; return a; }
  for(let i = 0; i < N; i++) for(let j = 0; j < N; j++) a[i * N + j] = maskOn(hex, i, j); return a; }
function cellsToHex(a, mode){ if(mode === 'pix') return a.map(v => v.toString(16)).join('');
  let h = ''; for(let k = 0; k < a.length; k += 4) h += ((a[k] << 3) | (a[k + 1] << 2) | (a[k + 2] << 1) | a[k + 3]).toString(16); return h; }
function starterCells(kind){ const N = MASK_N, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'); g.translate(N / 2, N / 2 + (kind === 'heart' ? 1 : 0)); g.fillStyle = '#000';
  if(kind === 'rocket'){ g.beginPath(); g.moveTo(0, -11); g.quadraticCurveTo(6, -4, 4, 6); g.lineTo(-4, 6); g.quadraticCurveTo(-6, -4, 0, -11); g.fill(); g.fillRect(-8, 2, 4, 7); g.fillRect(4, 2, 4, 7); g.fillRect(-2, 6, 4, 4); }
  else { shapePath(g, kind, 10); g.fill(); }
  const d = g.getImageData(0, 0, N, N).data, a = []; for(let i = 0; i < N * N; i++) a.push(d[i * 4 + 3] > 110 ? 1 : 0); return a; }
function openPad(mode, pi){
  const L = ED.look, N = mode === 'mask' ? MASK_N : PIX_N;
  PAD = {mode, pi, N, cells: hexToCells(mode === 'mask' ? L.mask : L.pix, mode), undo: [], tool: 'pen', col: mode === 'mask' ? 1 : 2, size: mode === 'mask' ? 1 : 2, mirror: false, upl: mode === 'pix' ? L.upl : 0, busy: false};
  if(mode === 'pix' && !L.pix) PAD.cells.fill(0);
  $('pad-title').textContent = mode === 'mask' ? '✏️ Draw your own ' + CREATION_TYPES[ED.type].parts[pi][0].toLowerCase() : '🎨 Paint your picture';
  $('pad-hint').textContent = mode === 'mask' ? 'Colour in the squares — the Part Printer turns your drawing into a real part!' : 'Paint with your finger or mouse. 🪣 fills a whole area.';
  $('pad-ok').textContent = mode === 'mask' ? '🖨️ Print it!' : '🖼️ Print my picture';
  const tools = [['pen', '✏️ Pen'], ['erase', '🧽 Eraser']].concat(mode === 'pix' ? [['fill', '🪣 Fill']] : []);
  $('pad-tools').innerHTML = tools.map(t => '<button class="chip" data-sound="tap" data-tool="' + t[0] + '">' + t[1] + '</button>').join('') +
    (mode === 'pix' ? [1, 2, 4].map(n => '<button class="chip" data-sound="tap" data-size="' + n + '">' + ['•', '●', '⬤'][[1, 2, 4].indexOf(n)] + '</button>').join('') : '<button class="chip" data-sound="tap" data-mirror="1">🪞 Mirror</button>') +
    '<button class="chip" data-sound="pop" data-undo="1">↩️ Undo</button><button class="chip" data-sound="pop" data-clear="1">🗑️ Clear</button>';
  $('pad-cols').innerHTML = mode === 'pix' ? PIX_COLS.map((c, i) => '<button class="sw" data-sound="tap" data-pc="' + i + '" style="background:' + c + '" aria-label="paint colour ' + (i + 1) + '"></button>').join('') : '';
  $('pad-starters').innerHTML = mode === 'mask' ? '<span class="pad-hint" style="align-self:center">Start from:</span>' + [['heart', '❤️'], ['star', '⭐'], ['circle', '⚪'], ['rocket', '🚀']].map(s => '<button class="chip" data-sound="pop" data-start="' + s[0] + '">' + s[1] + '</button>').join('') : '';
  const card = $('pad');
  card.querySelectorAll('[data-tool]').forEach(b => b.onclick = () => { PAD.tool = b.dataset.tool; padSync(); });
  card.querySelectorAll('[data-size]').forEach(b => b.onclick = () => { PAD.size = +b.dataset.size; padSync(); });
  card.querySelectorAll('[data-pc]').forEach(b => b.onclick = () => { PAD.col = +b.dataset.pc; if(PAD.tool === 'erase') PAD.tool = 'pen'; padSync(); });
  card.querySelectorAll('[data-mirror]').forEach(b => b.onclick = () => { PAD.mirror = !PAD.mirror; padSync(); });
  card.querySelectorAll('[data-undo]').forEach(b => b.onclick = () => { if(PAD.undo.length){ PAD.cells = PAD.undo.pop(); padDraw(); } });
  card.querySelectorAll('[data-clear]').forEach(b => b.onclick = () => { padPush(); PAD.cells.fill(0); PAD.upl = 0; padDraw(); });
  card.querySelectorAll('[data-start]').forEach(b => b.onclick = () => { padPush(); PAD.cells = starterCells(b.dataset.start); padDraw(); });
  $('pad-cancel').onclick = closePad; $('pad-ok').onclick = printPad;
  $('pad-printing').classList.add('hidden'); card.classList.remove('hidden'); padSync(); padDraw();
}
function closePad(){ if(PAD && PAD.busy) return; $('pad').classList.add('hidden'); PAD = null; }
function padSync(){ const c = $('pad');
  c.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('on', PAD.tool === b.dataset.tool));
  c.querySelectorAll('[data-size]').forEach(b => b.classList.toggle('on', PAD.size === +b.dataset.size));
  c.querySelectorAll('[data-pc]').forEach(b => b.classList.toggle('on', PAD.col === +b.dataset.pc && PAD.tool !== 'erase'));
  c.querySelectorAll('[data-mirror]').forEach(b => b.classList.toggle('on', PAD.mirror)); }
function padPush(){ PAD.undo.push(PAD.cells.slice()); if(PAD.undo.length > 30) PAD.undo.shift(); }
function padInk(v){ return PAD.mode === 'mask' ? (v ? CR_COLS[ED.look.col] : null) : PIX_COLS[v]; }
function padDraw(upto){   // upto = rows printed so far (printing animation), from the bottom
  const cv = $('pad-cv'), g = cv.getContext('2d'), N = PAD.N, s = 480 / N; g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = PAD.mode === 'mask' ? '#FFFFFF' : PIX_COLS[0]; g.fillRect(0, 0, 480, 480);
  if(PAD.mode === 'mask') for(let i = 0; i < N; i++) for(let j = 0; j < N; j++) if((i + j) % 2){ g.fillStyle = '#F3ECE4'; g.fillRect(j * s, i * s, s, s); }
  for(let i = 0; i < N; i++){ if(upto != null && i < N - upto) continue; for(let j = 0; j < N; j++){ const v = PAD.cells[i * N + j]; if(PAD.mode === 'mask' ? v : v){ g.fillStyle = padInk(v); g.fillRect(j * s, i * s, s + 0.5, s + 0.5); } } }
  if(PAD.mode === 'mask' || N <= 24){ g.strokeStyle = 'rgba(0,0,0,0.08)'; g.lineWidth = 1; g.beginPath(); for(let k = 0; k <= N; k++){ g.moveTo(k * s, 0); g.lineTo(k * s, 480); g.moveTo(0, k * s); g.lineTo(480, k * s); } g.stroke(); }
  if(PAD.mirror && upto == null){ g.strokeStyle = 'rgba(224,69,123,0.6)'; g.setLineDash([8, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(240, 0); g.lineTo(240, 480); g.stroke(); g.setLineDash([]); }
}
function padCell(e){ const r = $('pad-cv').getBoundingClientRect(), N = PAD.N; return [Math.floor((e.clientY - r.top) / r.height * N), Math.floor((e.clientX - r.left) / r.width * N)]; }
function padPaint(i, j){ const N = PAD.N, v = PAD.tool === 'erase' ? 0 : PAD.mode === 'mask' ? 1 : PAD.col, sz = PAD.mode === 'mask' ? 1 : PAD.size, o = Math.floor((sz - 1) / 2);
  const put = (a, b) => { for(let di = 0; di < sz; di++) for(let dj = 0; dj < sz; dj++){ const y = a - o + di, x = b - o + dj; if(y >= 0 && y < N && x >= 0 && x < N) PAD.cells[y * N + x] = v; } };
  put(i, j); if(PAD.mirror) put(i, N - 1 - j); }
function padFill(i, j){ const N = PAD.N, from = PAD.cells[i * N + j], to = PAD.col; if(from === to) return; const st = [[i, j]];
  while(st.length){ const [y, x] = st.pop(); if(y < 0 || y >= N || x < 0 || x >= N || PAD.cells[y * N + x] !== from) continue; PAD.cells[y * N + x] = to; st.push([y + 1, x], [y - 1, x], [y, x + 1], [y, x - 1]); } }
function wirePad(){
  const cv = $('pad-cv'); let down = false, last = null;
  const line = (a, b) => { const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), 1); for(let k = 0; k <= n; k++) padPaint(Math.round(a[0] + (b[0] - a[0]) * k / n), Math.round(a[1] + (b[1] - a[1]) * k / n)); };
  cv.addEventListener('pointerdown', e => { if(!PAD || PAD.busy) return; e.preventDefault(); const c = padCell(e); padPush(); if(PAD.tool === 'fill'){ padFill(c[0], c[1]); padDraw(); UISound.play('pop'); return; }
    down = true; last = c; try { cv.setPointerCapture(e.pointerId); } catch(x){} padPaint(c[0], c[1]); padDraw(); });
  cv.addEventListener('pointermove', e => { if(!down || !PAD) return; const c = padCell(e); line(last, c); last = c; padDraw(); });
  const up = () => { down = false; last = null; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
}
// The Part Printer: a latte-machine nozzle sweeps the plate, laying the drawing down layer by layer from the bottom, with steam.
function printPad(){
  if(!PAD || PAD.busy) return; const P = PAD, N = P.N;
  if(P.mode === 'mask' && P.cells.filter(Boolean).length < 6){ UISound.play('error'); UI.toast('Colour in a few more squares first ✏️', 'info'); return; }
  P.busy = true; UISound.play('whoosh'); const lab = $('pad-printing'); lab.innerHTML = '<span class="ui-spin a-shake">🖨️</span><span>' + (P.mode === 'mask' ? 'Printing your part…' : 'Printing your picture…') + '</span>'; lab.classList.remove('hidden');
  $('pad-ok').disabled = true; $('pad-cancel').disabled = true;
  const cv = $('pad-cv'), g = cv.getContext('2d'), s = 480 / N, dur = 2200, t0 = performance.now(), puffs = [];
  (function step(now){
    const k = Math.min(1, (now - t0) / dur), rowsF = k * N, rows = Math.floor(rowsF), frac = rowsF - rows; padDraw(rows);
    const row = N - 1 - rows; if(row >= 0){   // the row being poured, left to right
      const upto = Math.floor(frac * N); for(let j = 0; j < upto; j++){ const v = P.cells[row * N + j]; if(v){ g.fillStyle = padInk(v); g.fillRect(j * s, row * s, s + 0.5, s + 0.5); } }
      const nx = upto * s + s / 2, ny = row * s;
      g.fillStyle = 'rgba(255,240,210,0.85)'; g.fillRect(nx - 2, ny - 46, 4, 46);                                   // the milky pour
      g.fillStyle = '#9AA3AE'; rrect(g, nx - 26, ny - 92, 52, 40, 8); g.fill(); g.fillStyle = '#6B7280'; g.fillRect(nx - 8, ny - 54, 16, 10);   // the nozzle head
      g.fillStyle = '#FF4D8D'; g.beginPath(); g.arc(nx + 16, ny - 80, 4, 0, 7); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, ny - 74, 480, 4);                                              // the rail
      if(Math.random() < 0.5) puffs.push({x: nx + (Math.random() - 0.5) * 30, y: ny - 92, r: 6 + Math.random() * 8, a: 0.7});
      if(rows % 4 === 0 && upto === 0) UISound.play('tap');
    }
    puffs.forEach(p => { p.y -= 2.2; p.x += Math.sin(p.y / 12); p.r += 0.4; p.a -= 0.018; if(p.a > 0){ g.fillStyle = 'rgba(255,255,255,' + p.a + ')'; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill(); } });
    if(k < 1){ requestAnimationFrame(step); return; }
    padDraw(); const L = ED.look;
    if(P.mode === 'mask'){ L.mask = cellsToHex(P.cells, 'mask'); L.parts[P.pi] = CREATION_TYPES[ED.type].parts[P.pi][1].length; }
    else { L.pix = cellsToHex(P.cells, 'pix'); L.upl = P.upl ? 1 : 0; }
    UISound.play('success'); UI.toast(P.mode === 'mask' ? '🖨️ Your part is printed!' : '🖼️ Your picture is ready!', 'ok');
    P.busy = false; $('pad-ok').disabled = false; $('pad-cancel').disabled = false; closePad(); syncOpts();
  })(t0);
}
// Upload: shrink the photo to 48 × 48 (centre crop) and match each dot to the nearest of the 16 paint colours.
function wireUpload(){ $('upl-file').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0]; if(!f) return;
  if(!/^image\//.test(f.type)){ UI.toast('That is not a picture', 'err'); return; }
  UI.busy($('pic-upl'), 'photo', 'Reading it');
  const rd = new FileReader(); rd.onload = () => { const im = new Image(); im.onload = () => {
    const c = document.createElement('canvas'); c.width = c.height = PIX_N; const g = c.getContext('2d'), m = Math.min(im.width, im.height);
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, PIX_N, PIX_N); g.drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, PIX_N, PIX_N);
    UI.idle($('pic-upl')); const pix = imageToPix(g.getImageData(0, 0, PIX_N, PIX_N).data);
    ED.look.pix = pix; ED.look.upl = 1; openPad('pix'); PAD.upl = 1; padDraw(); };
    im.onerror = () => { UI.idle($('pic-upl')); UI.toast('Could not read that picture', 'err'); }; im.src = rd.result; };
  rd.readAsDataURL(f);
}); }
const PIX_RGB = PIX_COLS.map(h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; });
function imageToPix(d){ let out = ''; for(let i = 0; i < PIX_N * PIX_N; i++){ const a = d[i * 4 + 3] / 255, r = d[i * 4] * a + 255 * (1 - a), gg = d[i * 4 + 1] * a + 255 * (1 - a), b = d[i * 4 + 2] * a + 255 * (1 - a); let best = 0, bd = 1e9;
  PIX_RGB.forEach((c, k) => { const dr = r - c[0], dg = gg - c[1], db = b - c[2], dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db; if(dist < bd){ bd = dist; best = k; } }); out += best.toString(16); } return out; }
const NAME_BITS = {a: ['Super', 'Cosy', 'Magic', 'Sparkly', 'Rocket', 'Comfy', 'Rainbow', 'Royal', 'Jungle', 'Starry'], b: ['', ' 3000', ' Deluxe', ' Max', ' Mini']};
function saveEditor(){
  const isNew = !ED.id, T = CREATION_TYPES[ED.type], name = ($('ed-name').value || '').trim() || (pick(NAME_BITS.a) + ' ' + T.n.toLowerCase() + pick(NAME_BITS.b));
  HOST.changed = true; UI.call('saveCreation', [S.player, {id: ED.id, type: ED.type, name, look: {col: ED.look.col, acc: ED.look.acc, pat: ED.look.pat, parts: ED.look.parts, stk: ED.look.stk, mask: ED.look.mask || '', pix: ED.look.pix || '', upl: ED.look.upl ? 1 : 0}}], {btn: $('ed-save'), kind: 'build'}).then(r => {
    const i = S.creations.findIndex(x => x.id === r.id); if(i >= 0) S.creations[i] = r; else S.creations.unshift(r);
    UISound.play('success'); confetti(['🔨', '✨', '⭐', T.icon], 30); UI.toast((ED.id ? '💾 Saved ' : '🔨 You built ') + r.name + '!', 'ok'); showMenu('mine');
    if(isNew && HOST.onPlace){ HOST.changed = true; setTimeout(() => UI.confirm({icon: '🪴', title: 'Put ' + r.name + ' in your room now?', body: 'It goes straight into Decorate so you can pick its spot.', okText: '🪴 Place it now', cancelText: 'Keep building'}).then(go => { if(go) HOST.onPlace(r); }), 700); }
    else if(isNew) setTimeout(() => UI.confirm({icon: '🏠', title: 'Put ' + r.name + ' in your room?', body: 'Go to My Room and place it right away.', okText: '🏠 Put it in my room', cancelText: 'Keep building'}).then(go => { if(go) goMyRoom(true); }), 900);
  }).catch(() => {});
}
function confetti(list, count){ for(let i = 0; i < (count || 24); i++){ const e = document.createElement('div'); e.className = 'wk-confetti'; e.textContent = pick(list); e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goGameroom(){ UI.go(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }
// Furniture craft lives in My Room (Family Room page). deco = open Decorate on the 🔨 Made tab.
function goShowroom(){ if(HOST.onShowroom) return HOST.onShowroom(); UI.go(WEBAPP_URL + '?page=room&game=show' + sessionQuery(), 'workshop', 'Opening your showroom'); }
function goMyRoom(deco){ if(HOST.mode === 'room') return close(); UI.go(WEBAPP_URL + '?page=room&game=' + (deco ? 'deco' : 'my') + sessionQuery(), 'myroom', deco ? 'Taking it to your room' : 'Back to your room'); }


let mounted = false, open = false;
function mount(el, opts){
  Object.assign(HOST, opts || {});
  el.insertAdjacentHTML('beforeend', MARKUP); mounted = true; wirePad(); wireUpload();
}
// Page mode (Workshop.html): the page's boot hands over the server data.
function start(d, name){ take(d, name || ''); UISound.applySettings(S.settings); if(name && S.players.some(p => p.Name === name)) choosePlayer(name); else { renderPlayers(); showScreen('player'); } }
// Room mode: open the panel for this player (data loads once, then stays fresh while the room is open).
function openIn(name, tab){
  let panel = document.getElementById('wk-panel');
  if(!panel){ panel = document.createElement('div'); panel.id = 'wk-panel'; panel.className = 'wk-panel hidden';
    panel.innerHTML = '<div class="wk inroom" id="wk-root"><div class="wk-bar"><button data-sound="pop" onclick="WorkshopKit.close()">✖ Back to my room</button><b style="font-family:Fredoka,sans-serif">🔨 Furniture craft</b><button class="go" data-sound="pop" onclick="WorkshopKit.goShowroom()">🏛️ My showroom</button></div></div>';
    document.body.appendChild(panel); const root = panel.querySelector('#wk-root'); HOST.scroller = root; mount(root, {mode: 'room'});
    panel.addEventListener('pointerdown', e => { if(e.target === panel) close(); }); }
  HOST.changed = false;
  const show = () => { panel.classList.remove('hidden'); open = true; S.player = name; $('who-name').textContent = name; showMenu(tab || (mine().length ? 'mine' : 'build')); };
  if(S.loadedFor === name){ show(); return Promise.resolve(); }
  return UI.call('getWorkshopData', [name], {page: true, kind: 'workshop', text: 'Opening Furniture craft'}).then(d => { take(d, name); show(); });
}
function close(){ const panel = document.getElementById('wk-panel'); if(!panel || !open) return; if(PAD && PAD.busy) return; closePad && closePad(); closeGive(); cancelAnimationFrame(edRaf); panel.classList.add('hidden'); open = false; if(HOST.onClose && HOST.mode === 'room') HOST.onClose(HOST.changed); }
return {mount, start, openIn, close, host: () => HOST, isOpen: () => open, showMenu, randomize, changePlayer, closeGive, goMyRoom, goShowroom, goGameroom,
  owned: name => S.creations.filter(c => (c.owners || []).includes(name)), state: () => S, editor: () => ED, pad: () => PAD, openEditor, openPad};
})();
