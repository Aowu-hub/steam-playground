
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER));
const NAV_KIND = {home:'home', gameroom:'rooms', achievements:'trophy', setup:'admin', room:'room', collection:'collection'};
function goNav(page){ UI.go(WEBAPP_URL + '?page=' + page + (CURRENT_PLAYER ? '&player=' + encodeURIComponent(CURRENT_PLAYER) : ''), NAV_KIND[page] || 'nav'); }
const GAMES = [['all', '✨ All games'], ['sciencetory', '🔬 Sciencetory'], ['pokadif', '🔍 Pokadif'], ['pyraspike', '🔥 PyraDive'], ['artifactory', '🏭 Artifactory'], ['georead', '🔤 GeoRead'], ['geoscout', '🔢 GeoScout'], ['wisdeck', '🃏 WisDeck'], ['eyes-brain', '👀🧠 Eyes Brain Riot'], ['polyplot', '⬛ Polyplot'], ['maze', '🧭 Maze'], ['stacking-sim', '🏗️ Stack It!'], ['robot-adventure', '🤖 Code the Robot'], ['checkers', '🔴 Checkers'], ['chess', '♞ Chess'], ['pinball', '🎯 Pinball'], ['hopper', '🐸 Dodgy Hopper'], ['turbo', '🏎️ Turbo Trail'], ['memory', '🃏 Memory Match'], ['math-quest', '🧮 Math Quest'], ['double-up', '🔀 Double Up'], ['number-board', '➗ Algebros'], ['word-board', '🔤 Lettercraft'], ['sweet-swap', '🍬 Sweet Swap'], ['beat-corner', '🎵 BeatCorner'], ['sla-brall', '🏓 SlaBrall'], ['brawl-buddies', '🥊 Brawl Buddies'], ['soul-bopper', '👻 Soul Bopper'], ['alignext', '🔴 Alignext'], ['snakeast', '🐍 Snakize'], ['pose-party', '📷 Pose Party'], ['block-drop', '🧱 Block Drop'], ['pop-blocks', '🫧 Pop Blocks'], ['number-grid', '🔢 Digitinct'], ['mini', '🎨 Mini games'], ['room', '🏡 Family Room'], ['any', '🌈 Any game']];
const MINI = ['color-match', 'count-match', 'code-robot', 'trash-pointer'];
const TYPES = [['all', 'All types'], ['tableskin', '🏓 Table looks'], ['numberskin', '🎨 Number looks'], ['letterskin', '🎨 Letter looks'], ['atomskin', '⚛️ Atom looks'], ['wdback', '🂠 Card backs'], ['ebrpad', '🔢 Keypads'], ['polytrail', '🖍️ Line trails'], ['costume', '🧥 Costumes'], ['hand', '✋ In your hand'], ['back', '🪽 Back'], ['pet', '🐾 Pets'], ['ride', '🛹 Rides'], ['trail', '💫 Trails'], ['neck', '🏅 Medals'], ['hair', '💇 Hair'], ['skin', '✨ Skins'], ['outfit', '👗 Fashion'], ['outfitColor', '🎨 Colours'], ['ball', '🎱 Ball skins'], ['balltrail', '☄️ Ball trails'], ['feather', '🪶 Shuttle feathers'], ['stick', '🕹️ Joystick skins'], ['bombskin', '💣 Bomb skins'], ['snakeskin', '🐍 Snake skins'], ['snaketype', '🐉 Snake types'], ['furni', '🛋️ Room things'], ['roomstyle', '🖼️ Room styles'], ['sigact', '🎭 Signature acts']];
const STATUS = [['all', 'Everything'], ['owned', '✅ Unlocked'], ['locked', '🔒 Still to get'], ['new', '✨ New']];
const GAME_TAG = {'sciencetory': 'Sciencetory', 'pokadif': 'Pokadif', 'pyraspike': 'PyraDive', 'td-draprincess': 'TD-Stories', 'artifactory': 'Artifactory', 'georead': 'GeoRead', 'geoscout': 'GeoScout', 'beat-piano': 'BeatCorner', 'beat-drums': 'BeatCorner', 'wisdeck': 'WisDeck', 'eyes-brain': 'Eyes Brain Riot', 'polyplot': 'Polyplot', 'soul-bopper': 'Soul Bopper', 'snakeast': 'Snakize', 'snakigate': 'Snakize', 'snakastle': 'Snakize', 'snaketale': 'Snakize', 'alignext': 'Alignext', 'omnifile': 'Alignext', 'brawl-buddies': 'Brawl Buddies', 'pose-party': 'Pose Party', 'sla-brall': 'SlaBrall', 'beat-corner': 'BeatCorner', 'sweet-swap': 'Sweet Swap', 'word-board': 'Lettercraft', 'number-board': 'Algebros', 'double-up': 'Double Up', 'block-drop': 'Block Drop', 'pop-blocks': 'Pop Blocks', 'number-grid': 'Digitinct', 'math-quest': 'Math Quest', 'maze': 'Maze', 'stacking-sim': 'Stack It!', 'robot-adventure': 'Code the Robot', 'checkers': 'Checkers', 'chess': 'Chess', 'pinball': 'Pinball', 'hopper': 'Dodgy Hopper', 'turbo': 'Turbo Trail', 'memory': 'Memory Match', 'color-match': 'Color Match', 'count-match': 'Count & Match', 'trash-pointer': 'Trash Pointer', 'room': 'Family Room', 'any': 'Any game'};
const PCOLS = ['#FF4D8D', '#2CA6DE', '#4CB963', '#FF9F1C', '#7B5FE0', '#E63946', '#2EC4B6', '#B5651D'];
let D = null, who = CURRENT_PLAYER, F = {game: 'all', type: 'all', status: 'all'};
function ownedBy(n, id){ return ((D.owned[n] || {})[id]) || 0; }
function gameOk(l){ return F.game === 'all' || l.game === F.game || (F.game === 'mini' && MINI.includes(l.game)) || (F.game === 'robot-adventure' && l.id === 'robot') || (F.game === 'checkers' && l.id === 'sword') || (F.game === 'chess' && l.id === 'sword') || (F.game === 'sla-brall' && l.id === 'ballskin'); }
function chips(id, list, key){ $(id).innerHTML = list.map(([k, n]) => '<button class="chip' + (F[key] === k ? ' on' : '') + '" data-sound="pop" data-k="' + k + '">' + n + '</button>').join(''); $(id).querySelectorAll('.chip').forEach(b => b.onclick = () => { F[key] = b.dataset.k; render(); }); }
const $ = id => document.getElementById(id);
function avatarOf(n){ const p = D.players.find(x => x.Name === n); return p && p.avatar ? fixAv(p.avatar) : defaultAvatar(n || 'friend'); }
function previewAv(l, v, n){
  const base = avatarOf(n); base.eq = {};
  if(l.slot === 'skin' || l.slot === 'hair' || l.slot === 'outfit' || l.slot === 'outfitColor') base[l.slot] = AV_BASE[l.slot] + v;
  else base.eq[l.slot] = {id: l.id, v, o: l.parts ? {blade: Math.min(l.parts.blade.filter(p => p[1] <= v + 1).length - 1, 5), hilt: l.parts.hilt.filter(p => p[1] <= v + 1).length - 1} : {}};
  if(l.slot === 'hair') base.acc = 0;
  return base;
}
// 👀🧠 Eyes Brain Riot keypad skins (same table as EyesBrainRiot EBR_PADS)
const EBR_PADS = [['#FFE3F1', '#FFB8DA', '#7A1450', '#D9709F'], ['#F3D3A6', '#D9A465', '#4A2A0E', '#8A5A2B'], ['#4A1C12', '#2A0E08', '#FFB347', '#FF5A1F'], ['#F2FBFF', '#BFE8FF', '#0B5C8F', '#7CC3EA'], ['#1A0A33', '#0B0420', '#FF5CF0', '#7B2CFF'],
  ['#B8FFD8', '#4FE39A', '#0A5A33', '#22A867'], ['#2B2470', '#0B0A2E', '#FFFFFF', '#7B6CFF'], ['#FFF0B3', '#FFC845', '#5A3A00', '#C9930A'], ['#FFD6E8', '#C9F2FF', '#3A1D6E', '#FF7AB6'], ['#FFFFFF', '#E2D4FF', '#4B2C9E', '#A98BFF']];
function drawEbrPad(c, v){
  const g = c.getContext('2d'), W = c.width, H = c.height, P = EBR_PADS[v] || EBR_PADS[0]; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  const gap = W * 0.04, kw = (W * 0.78 - gap * 2) / 3, kh = (H * 0.78 - gap * 3) / 4, x0 = (W - kw * 3 - gap * 2) / 2, y0 = (H - kh * 4 - gap * 3) / 2, keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];
  g.font = '700 ' + Math.round(kh * 0.55) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  keys.forEach((k, i) => { const x = x0 + (i % 3) * (kw + gap), y = y0 + Math.floor(i / 3) * (kh + gap); g.fillStyle = P[3]; g.beginPath(); g.roundRect(x, y + 3, kw, kh, kh * 0.25); g.fill();
    const gr = g.createLinearGradient(0, y, 0, y + kh); gr.addColorStop(0, i === 9 ? '#5B3C9E' : i === 11 ? '#3FE09A' : P[0]); gr.addColorStop(1, i === 9 ? '#3E2777' : i === 11 ? '#1FA463' : P[1]); g.fillStyle = gr; g.beginPath(); g.roundRect(x, y, kw, kh, kh * 0.25); g.fill();
    g.fillStyle = i === 9 || i === 11 ? '#fff' : P[2]; g.fillText(k, x + kw / 2, y + kh / 2 + 1); });
}
// 🂠 WisDeck card backs (same table as WisDeck WD_BACKS)
const WD_BACKS = [['#1E2E5C', '#24366A', '🦉'], ['#1F6B3A', '#2E8B4E', '🌿'], ['#0B4F7A', '#1170A8', '🐙'], ['#7A1E0B', '#C2410C', '🌋'], ['#FF8AC5', '#FFC1E0', '🍬'], ['#2A1B6E', '#0B0A2E', '🪐'], ['#B5781A', '#F2B134', '👑'], ['#FF5C8A', '#3D6BFF', '🌈']];
function drawWisBack(c, v){
  const g = c.getContext('2d'), W = c.width, H = c.height, B = WD_BACKS[v] || WD_BACKS[0]; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  const w = Math.min(W * 0.62, H * 0.62 * 5 / 7), h = w * 7 / 5, x = (W - w) / 2, y = (H - h) / 2, gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, B[0]); gr.addColorStop(1, B[1]);
  g.fillStyle = '#FFC845'; g.beginPath(); g.roundRect(x - 3, y - 3, w + 6, h + 6, w * 0.1); g.fill(); g.fillStyle = gr; g.beginPath(); g.roundRect(x, y, w, h, w * 0.08); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; for(let i = -h; i < w + h; i += w / 5){ g.beginPath(); g.moveTo(x + i, y); g.lineTo(x + i - h, y + h); g.stroke(); }
  g.font = Math.round(w * 0.42) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(B[2], W / 2, H / 2);
}
// 🔤 GeoRead + Lettercraft letter looks (LetterSkins.EXTRAS in unlock order): a vowel + a consonant box
function drawLetterSkin(c, v){ const g = c.getContext('2d'), W = c.width, H = c.height, k = LetterSkins.EXTRAS[v] || LetterSkins.EXTRAS[0], s = Math.min(W * 0.42, H * 0.62); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  LetterSkins.draw(g, k, 'a', W * 0.29, H * 0.5, s, {face: true}); LetterSkins.draw(g, k, 'b', W * 0.71, H * 0.5, s, {face: true}); }
// 🔢 GeoScout + Algebros number looks (NumberSkins.EXTRAS in unlock order): number buddies 1 · 2 · 3 + a tile
function drawNumberSkin(c, v){ const g = c.getContext('2d'), W = c.width, H = c.height, k = NumberSkins.EXTRAS[v] || NumberSkins.EXTRAS[0]; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  const u = Math.min(H / 6, W / 5.2); [1, 2, 3].forEach((n, i) => NumberSkins.draw(g, n, W * 0.08 + i * u * 1.35, H - u * 0.4, u, {skin: k, t: 0.4})); NumberSkins.tile(g, '7', W - u * 1.75, u * 0.25, u * 1.6, k); }
function paint(c, l, v, n){ if(l.slot === 'tableskin' && window.TableSkins){ TableSkins.preview(c, v); return; } if(l.slot === 'atomskin' && window.AtomSkins){ AtomSkins.preview(c, v); return; } if(l.slot === 'numberskin' && window.NumberSkins){ drawNumberSkin(c, v); return; } if(l.slot === 'letterskin' && window.LetterSkins){ drawLetterSkin(c, v); return; } if(l.slot === 'wdback'){ drawWisBack(c, v); return; } if(l.slot === 'ebrpad'){ drawEbrPad(c, v); return; } if(l.slot === 'polytrail' && window.drawPolyTrailPreview){ drawPolyTrailPreview(c, v); return; } if(l.slot === 'bombskin' && window.BombSkins){ BombSkins.preview(c, v); return; } if(drawThingPreview(c, l, v)) return; drawPreviewCanvas(c, previewAv(l, v, n), {name: n, t: 1.2, owned: {[l.id]: v + 1}}); }
function render(){
  $('who-row').innerHTML = D.players.map((p, i) => '<button class="chip' + (p.Name === who ? ' on' : '') + '" data-sound="pop" data-n="' + UI.esc(p.Name) + '"><i class="dot" style="background:' + PCOLS[i % 8] + '"></i> ' + UI.esc(p.Name) + '</button>').join('');
  $('who-row').querySelectorAll('.chip').forEach(b => b.onclick = () => { who = b.dataset.n; render(); });
  chips('f-game', GAMES, 'game'); chips('f-type', TYPES.filter(t => t[0] === 'all' || D.lines.some(l => l.slot === t[0])), 'type'); chips('f-status', STATUS, 'status');
  const mine = who === CURRENT_PLAYER, seen = mine ? D.seen : {};
  const total = D.lines.reduce((s, l) => s + l.steps.length, 0), have = D.lines.reduce((s, l) => s + ownedBy(who, l.id), 0), news = D.lines.filter(l => mine && ownedBy(who, l.id) > (seen[l.id] || 0)).length;
  $('summary').innerHTML = '<span>' + UI.esc(who || '') + ' · ' + have + ' of ' + total + ' steps</span><span>' + D.lines.filter(l => ownedBy(who, l.id)).length + ' of ' + D.lines.length + ' items started</span>' + (news ? '<span>✨ ' + news + ' new</span>' : '');
  renderStable(); renderJournal(); renderPolyJournal(); renderWisBook();
  const list = D.lines.filter(l => !l.rides && gameOk(l) && (F.type === 'all' || l.slot === F.type)).filter(l => { const o = ownedBy(who, l.id); return F.status === 'all' || (F.status === 'owned' && o > 0) || (F.status === 'locked' && o < l.steps.length) || (F.status === 'new' && mine && o > (seen[l.id] || 0)); });
  $('empty').classList.toggle('hidden', list.length > 0);
  $('grid').innerHTML = list.map(l => {
    const o = ownedBy(who, l.id), ways = mine ? (D.ways[l.id] || []) : [], nextI = ways.findIndex(x => !x);
    const owners = D.players.map((p, i) => ({n: p.Name, c: PCOLS[i % 8], v: ownedBy(p.Name, l.id)})).filter(x => x.v > 0);
    return '<div class="card' + (o ? '' : ' none') + '" data-id="' + l.id + '">' + (mine && o > (seen[l.id] || 0) ? '<span class="new">✨ New</span>' : '') +
      '<div class="top"><span class="ic">' + l.icon + '</span><b>' + UI.esc(l.name) + '<br><span class="tag">' + UI.esc(GAME_TAG[l.game] || '') + '</span></b><span class="count">' + o + '/' + l.steps.length + '</span></div>' +
      '<div class="pics"><canvas class="main-pic" width="220" height="256" data-v="' + Math.max(0, o - 1) + '"></canvas>' + (o < l.steps.length ? '<span class="arrow">next ▸</span><canvas class="next-pic" width="132" height="154" data-v="' + o + '"></canvas>' : '<span class="arrow">⭐ complete!</span>') + '</div>' +
      '<div class="stepname">' + (o ? 'Step ' + o + ': ' + UI.esc(l.steps[o - 1]) : '🔒 ' + UI.esc(l.steps[0])) + '</div>' +
      '<div class="bar"><i style="width:' + Math.round(o / l.steps.length * 100) + '%"></i></div>' +
      (o >= l.steps.length ? '<div class="next done">⭐ All steps unlocked</div>' : mine && nextI >= 0 ? '<div class="next">Next: ' + UI.esc(l.ways[nextI]) + '</div>' : '<div class="next">Tap to see how to get it</div>') +
      (l.soon ? '<div class="soon">' + UI.esc(l.soon) + '</div>' : '') +
      (owners.length ? '<div class="owners">' + owners.map(x => '<span><i class="dot" style="background:' + x.c + '"></i>' + UI.esc(x.n) + ' ' + x.v + '</span>').join('') + '</div>' : '') +
      '<div class="detail"><div class="steps">' + l.steps.map((s, i) => '<span class="' + (i < o ? 'have' : 'lock') + '">' + (i < o ? '✅ ' : '🔒 ') + UI.esc(s) + '</span>').join('') + '</div>' +
      '<ul class="ways">' + l.ways.map((w, i) => '<li class="' + (ways[i] ? 'ok' : '') + '">' + (ways[i] ? '✅ ' : '▫️ ') + UI.esc(w) + '</li>').join('') + '</ul>' +
      (l.ways.length > l.steps.length ? '<div class="tag">Any ' + l.steps.length + ' of these ' + l.ways.length + ' fill it up</div>' : '') + '</div></div>';
  }).join('');
  const made = (D.made || {})[who] || [];
  $('made').innerHTML = made.length ? made.map(c => '<div class="card mcard t-card" data-cr="' + c.id + '"><canvas width="300" height="300"></canvas><b>' + CREATION_TYPES[c.type].icon + ' ' + UI.esc(c.name) + '</b><span class="by">' + (c.maker === who ? 'Built by ' + UI.esc(who) : '🎁 From ' + UI.esc(c.maker)) + (c.show ? ' · 🎭 ⭐ ' + c.stars : '') + '</span></div>').join('')
    : '<div class="made-empty">Nothing built yet — make beds, chairs, lamps and more in the 🔨 Furniture Workshop!</div>';
  $('made').querySelectorAll('[data-cr]').forEach(el => { const c = made.find(x => x.id === el.dataset.cr), cv = el.querySelector('canvas'); drawCreation(cv.getContext('2d'), Object.assign({type: c.type}, c.look), 150, 278, 250, 1); });
  renderArts(); // 🧰 Maker shelf (af-1)
  renderActs(); // 🎭 Acts shelf (as-2)
  renderBook(); openFromLink(); // 📚 Comic Book (ck-1b)
  $('grid').querySelectorAll('.card').forEach(card => {
    const l = D.lines.find(x => x.id === card.dataset.id);
    card.querySelectorAll('canvas').forEach(c => paint(c, l, Math.min(Number(c.dataset.v), l.steps.length - 1), who));
    card.onclick = () => { card.classList.toggle('open'); UISound.play('pop'); };
  });
}
// 🐾 Ride-on stable: Adventure miles + the 20 ride-ons (owned by miles, so shown from owned.rides).
function renderStable(){
  const l = D.lines.find(x => x.rides), o = D.owned[who] || {}, have = o.rides || [], miles = o.miles || 0, fr = o.milesFrom || {};
  if(!l){ $('stable').classList.add('hidden'); return; }
  const animals = l.rides.map((r, i) => Object.assign({i}, r)).filter(r => !r.beast);
  const next = animals.find(r => !have.includes(r.i)) || l.rides.map((r, i) => Object.assign({i}, r)).find(r => !have.includes(r.i)), prev = next ? Math.max(0, ...l.rides.filter(r => r.miles < next.miles).map(r => r.miles)) : 0;
  const pct = next ? Math.round(Math.min(1, (miles - prev) / Math.max(1, next.miles - prev)) * 100) : 100;
  const nA = animals.length, hA = animals.filter(r => have.includes(r.i)).length;
  $('stable').innerHTML = '<h2>🐾 Ride-on stable <small>' + hA + ' of ' + nA + ' ride-ons · wear them in 🎒 Wardrobe → Rides</small></h2>' +
    '<div class="st-miles"><span>🐾 ' + miles + ' Adventure miles</span><span class="st-bar"><i style="width:' + pct + '%"></i></span><span>' + (next ? 'next: ' + next.icon + ' ' + next.name + ' at ' + next.miles : '⭐ every ride-on!') + '</span></div>' +
    '<div class="st-from">From levels ' + (fr.levels || 0) + ' · mini games ' + (fr.mini || 0) + ' · Turbo km ' + (fr.turbo || 0) + ' · Hopper rows ' + (fr.hopper || 0) + ' · daily treasures ' + (fr.daily || 0) + (fr.extra ? ' · bonus ' + fr.extra : '') + '</div>' +
    '<div class="st-grid">' + l.rides.map((r, v) => r.beast ? '' : '<div class="st-ride' + (have.includes(v) ? '' : ' lock') + '" title="' + UI.esc(l.ways[v]) + '"><canvas width="120" height="132" data-rv="' + v + '"></canvas>' + (have.includes(v) ? '' : '<i class="lk">🔒</i>') + r.icon + ' ' + UI.esc(r.name) + '<span class="sp">' + (have.includes(v) ? '✅ yours' : r.miles + ' miles' + (r.special ? ' · ' + UI.esc(r.special.replace(/^or /, 'or ')) : '')) + '</span></div>').join('') + '</div>';
  $('stable').querySelectorAll('canvas[data-rv]').forEach(c => paint(c, l, Number(c.dataset.rv), who));
  renderBeasts(l, have, miles, o.beastQuests || []);
}
// ⬛ Polyplot 📖 field journal (plan 11l round 4): Settings Polyplot_<Name> = {kinds: {theme: {kind: n}}, coins: {theme: n}}; 4 field creatures + any hidden one = that theme's 🐾 pet
const PP_JOURNAL = {dino: ['🦖', 'Dino Jungle', ['🦕', '🦖', '🦥', '🐊'], '🦴', 'Leafy Longneck'], sea: ['🐙', 'Aquarium', ['🐢', '🐬', '🦭', '🦈'], '🐚', 'Shelly Turtle'], dance: ['🪩', 'Dance Hall', ['🦩', '🐇', '🐨', '🦍'], '🎵', 'Disco Flamingo'], robot: ['🤖', 'Robot Time', ['🐌', '🐝', '🦔', '🦂'], '⚙️', 'Gear Snail'],
  space: ['🪐', 'Space', ['🦄', '🦋', '🐻', '👾'], '✨', 'Star Pony'], sky: ['☁️', 'Sky Temple', ['🕊️', '🦅', '🦉', '🐲'], '🪶', 'Cloud Dove'], hunter: ['🏹', 'Monster Hunter', ['🦌', '🐺', '🐻', '🐗'], '💎', 'Forest Deer']};
function renderPolyJournal(){
  const box = $('ppjournal'); if(!box) return; let j = {}; try{ j = JSON.parse((D.settings || {})['Polyplot_' + who] || '{}') || {}; }catch(e){ j = {}; }
  const K = j.kinds || {}, C = j.coins || {}; if(!Object.keys(K).length && !Object.keys(C).length){ box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  const FK = ['calm', 'energetic', 'lazy', 'enraged'], HK = ['egg', 'mole', 'mimic', 'ghost', 'legend'];
  box.innerHTML = '<h2>📖 ' + UI.esc(who) + '\'s field journal <small>creatures caught in ⬛ Polyplot 🏹 Hunt · catch all 5 field types in a theme → its 🐾 pet</small></h2><div class="pj-grid">' + Object.keys(PP_JOURNAL).map(t => { const T = PP_JOURNAL[t], k = K[t] || {}, hid = HK.some(x => k[x]), got = FK.filter(x => k[x]).length + (hid ? 1 : 0), total = Object.values(k).reduce((a, b) => a + b, 0), facts = Math.min(5, Math.floor((C[t] || 0) / 10));
    return '<div class="pj-theme' + (got >= 5 ? ' done' : '') + '"><b>' + T[0] + ' ' + T[1] + '</b><div class="pj-row">' + T[2].map((e, i) => '<span class="' + (k[FK[i]] ? '' : 'no') + '">' + e + '</span>').join('') + '<span class="' + (hid ? '' : 'no') + '" title="any hidden creature">🥚</span></div><small>' + got + ' / 5 types · ' + total + ' caught · ' + T[3] + ' ' + (C[t] || 0) + ' (' + facts + ' / 5 facts)</small><small>' + (got >= 5 ? '🐾 ' + T[4] + ' is your pet!' : '🔒 pet: ' + T[4]) + '</small></div>'; }).join('') + '</div>';
}
// 🃏 WisDeck deck book summary (plan 11z): cards per category from Settings Deck_<Name>; the full book (grey outlines, tiers) opens in WisDeck
const WD_CATS = [["wisflag", "🚩", "WisFlag", "world"], ["wisshape", "🧩", "WisTerri", "world"], ["wismap", "🗺️", "WisMap", "world"], ["wiscapital", "🏙️", "WisCapital", "world"], ["wislandmark", "🗼", "WisLandmark", "world"], ["wisyum", "🍜", "WisYum", "world"], ["wissport", "⚽", "WisSport", "world"], ["wisjob", "👩‍🚒", "WisJob", "world"], ["wistune", "🎺", "WisTune", "world"], ["wisdino", "🦖", "WisDino", "time"], ["wishuman", "🦴", "WisHuman", "time"], ["wisancient", "🏛️", "WisAncient", "time"], ["wistime", "🕰️", "WisTime", "time"], ["wisgreek", "🦉", "WisGreek", "time"], ["wismyth", "🐉", "WisMyth", "time"], ["wisgenius", "🧑‍🔬", "WisGenius", "time"], ["wisexplore", "🧭", "WisExplore", "time"], ["wissiam", "🏯", "WisSiam", "time"], ["wistaiwan", "🏝️", "WisTaiwan", "time"], ["wisviking", "🛶", "WisViking", "time"], ["wismammal", "🐘", "WisMammal", "zoo"], ["wisbird", "🦜", "WisBird", "zoo"], ["wisreptile", "🐊", "WisReptile", "zoo"], ["wisfarm", "🐄", "WisFarm", "zoo"], ["wisrare", "🐼", "WisRare", "zoo"], ["wisbug", "🐞", "WisBug", "zoo"], ["wisocean", "🐳", "WisOcean", "zoo"], ["wiscosmos", "🪐", "WisCosmos", "science"], ["wisplant", "🌻", "WisPlant", "science"], ["wisbody", "🫀", "WisBody", "science"], ["wischem", "🧪", "WisChem", "science"], ["wisbio", "🦠", "WisBio", "science"], ["wisphys", "🧲", "WisPhys", "science"], ["wisstone", "🪨", "WisStone", "science"], ["wischaos", "🌪️", "WisChaos", "science"], ["wisgeo", "📐", "WisShape", "science"], ["wiscraft", "🏺", "WisCraft", "made"], ["wistech", "💡", "WisTech", "made"], ["wishicle", "🚂", "WisHicle", "made"], ["wisunit", "📏", "WisUnit", "made"], ["wislaw", "⚖️", "WisLaw", "made"], ["wisculture", "🎎", "WisCulture", "made"], ["wisteaching", "🕊️", "WisTeaching", "made"], ["wiscloth", "👘", "WisCloth", "made"], ["wishair", "💇", "WisHair", "made"], ["wisraw", "🧱", "WisRaw", "made"]];
const WD_SHELVES = {world: '🌍 World', time: '⏳ Time', zoo: '🦁 Zoo', science: '🔬 Science', made: '🛠️ Human-made'}, WD_TIERS = [[0, '🥉'], [1, '🥈'], [3, '🥇'], [6, '💠'], [10, '💎'], [15, '🌌']];
// 📖 WisStock: every card of a category — yours with its tier frame, missing ones grey "?" (card data loaded only when opened)
let WS = {cat: 'wisflag', loading: false};
function openWisStock(){
  const box = $('wdstock'); if(!box) return; if(window.WisCards && WisCards.CATS){ renderWisStock(); return; } if(WS.loading) return; WS.loading = true;
  box.innerHTML = '<div class="ws-chips"><span>📖 Opening WisStock…</span></div>'; const close = UI.section(box, 'wisdeck');
  google.script.run.withSuccessHandler(d => { UI.loadData(d.a).then(() => UI.loadData(d.b)).then(() => UI.loadData(d.c)).then(() => { close(); WS.loading = false; if(d.rows && WisCards.applyRows) WisCards.applyRows(d.rows); renderWisStock(); wsArt(1); }).catch(() => { close(); WS.loading = false; box.innerHTML = '⚠️ Could not open WisStock — try again'; }); })   /* 📦 size-1: each part = code or {src, alt} */
    .withFailureHandler(() => { close(); WS.loading = false; box.innerHTML = '⚠️ Could not open WisStock — try again'; }).getWisCardsData();
}
function wsArt(i){ if(i > 12) return; google.script.run.withSuccessHandler(b => { if(!b) return; UI.loadData(b).catch(() => {}).then(() => { if(window.WisCards && WisCards.CATS) renderWisStock(); wsArt(i + 1); }); }).withFailureHandler(() => {}).getWisArt(i); }   // 🎨 drawn pictures (wd-13)
function renderWisStock(){
  const box = $('wdstock'), W = window.WisCards; if(!box || !W) return; let d = {}; try{ d = JSON.parse((D.settings || {})['Deck_' + who] || '{}') || {}; }catch(e){ d = {}; } const cards = d.cards || {};
  const list = W.cards(WS.cat), have = list.filter(c => cards[c.id] && cards[c.id].n > 0).length, tier = n => W.tierOf(Math.max(0, n - 1));
  box.innerHTML = '<div class="ws-chips">' + W.CATS.map(c => '<button class="' + (c.k === WS.cat ? 'on' : '') + '" data-k="' + c.k + '" data-sound="tap">' + c.icon + ' ' + c.en + '</button>').join('') + '</div>' +
    '<div class="ws-chips"><span>' + W.CAT[WS.cat].icon + ' ' + W.CAT[WS.cat].en + ' · ' + have + ' / ' + list.length + (have === list.length ? ' 🎓' : '') + '</span></div><div class="ws-grid">' +
    list.map(c => { const o = cards[c.id]; return o && o.n > 0 ? '<div class="wcard" style="--c:' + c.color + '" data-tier="' + tier(o.n) + '" title="' + UI.esc(c.en + ' · ' + c.th + ' · ⚡ ' + c.power + ' · ' + W.TIERS[tier(o.n)].en) + '"><div class="pw">' + c.power + '</div>' + (o.n > 1 ? '<span class="cnt">×' + o.n + '</span>' : '') + '<div class="hd"></div><div class="art">' + W.picHtml(c) + '</div><div class="nm">' + UI.esc(c.en) + '</div></div>'
      : '<div class="wcard ghost" title="Win it in the WisDeck quiz"><b>?</b></div>'; }).join('') + '</div>';
  box.querySelectorAll('.ws-chips button').forEach(b => b.onclick = () => { WS.cat = b.dataset.k; renderWisStock(); });
}
function renderWisBook(){
  const box = $('wdbook'); if(!box) return; let d = {}; try{ d = JSON.parse((D.settings || {})['Deck_' + who] || '{}') || {}; }catch(e){ d = {}; }
  const cards = d.cards || {}, ids = Object.keys(cards).filter(id => cards[id] && cards[id].n > 0); if(!ids.length){ box.classList.add('hidden'); return; }
  box.classList.remove('hidden'); const per = {}, tiers = [0, 0, 0, 0, 0, 0]; ids.forEach(id => { const k = id.split(':')[0]; per[k] = (per[k] || 0) + 1; const dup = cards[id].n - 1; let t = 0; WD_TIERS.forEach((x, i) => { if(dup >= x[0]) t = i; }); tiers[t]++; });
  const tot = d.tot || {}, full = d.full || [];
  box.innerHTML = '<h2>🃏 ' + UI.esc(who) + '\'s 📖 WisStock <small>' + ids.length + ' cards · 🎓 ' + full.length + ' full categories · ' + WD_TIERS.map((x, i) => x[1] + ' ' + tiers[i]).join(' ') + '</small></h2>' +
    Object.keys(WD_SHELVES).map(sh => '<div class="wd-shelf"><b>' + WD_SHELVES[sh] + '</b>' + WD_CATS.filter(c => c[3] === sh).map(c => { const n = per[c[0]] || 0, t = tot[c[0]] || 40; return '<span class="' + (full.indexOf(c[0]) >= 0 ? 'full' : '') + '">' + c[1] + ' ' + c[2] + ' ' + n + '/' + t + (full.indexOf(c[0]) >= 0 ? ' 🎓' : '') + '</span>'; }).join('') + '</div>').join('') +
    '<button class="wd-go" data-sound="pop" onclick="UI.go(WEBAPP_URL + \'?page=wisdeck&game=book&player=\' + encodeURIComponent(who), \'wisdeck\')">🃏 Open in WisDeck</button> <button class="wd-go" data-sound="pop" onclick="openWisStock()">📖 Show all cards here</button><div id="wdstock"></div>';
}
// 📖 Word journal (plan 11p): Lettercraft words this player met (Settings Words_<Name> = [[word, times, firstDate, meaning, emoji], …])
function renderJournal(){
  const box = $('journal'); let list = []; try{ list = JSON.parse((D.settings || {})['Words_' + who] || '[]') || []; }catch(e){ list = []; }
  if(!list.length){ box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  box.innerHTML = '<h2>📖 ' + UI.esc(who) + '\'s word journal <small>' + list.length + ' words met in 🔤 Lettercraft</small></h2><div class="wj-list">' +
    list.slice(0, 300).map(r => '<div class="wj-word"><span class="e">' + UI.esc(r[4] || '📖') + '</span><b>' + UI.esc(r[0]) + (r[1] > 1 ? ' <i>×' + r[1] + '</i>' : '') + '</b><small>' + UI.esc(r[3] || '—') + '</small></div>').join('') + '</div>';
}
// 🌟 Mystical Beasts shelf (plan 11q): gold frame, a kid-friendly story for each, and both locks (miles + beast quest).
function renderBeasts(l, have, miles, quests){
  const list = l.rides.map((r, i) => Object.assign({i}, r)).filter(r => r.beast), box = $('beasts');
  if(!list.length){ box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  box.innerHTML = '<h2>🌟 Mystical Beasts <small>' + list.filter(r => have.includes(r.i)).length + ' of ' + list.length + ' · legendary ride-ons</small></h2>' +
    '<div class="bs-note">Each beast needs BOTH: 🐾 its Adventure miles AND its 🎯 beast quest. Ride one in the Family Room and press 🐉 for 10 beast moves!</div>' +
    '<div class="bs-grid">' + list.map(r => { const own = have.includes(r.i), mOk = miles >= r.miles, qOk = quests.includes(r.i);
      return '<div class="bs-card ' + (own ? 'own' : 'lock') + '" data-beast="' + r.i + '"><canvas width="120" height="132" data-rv="' + r.i + '"></canvas>' +
        '<div><span class="lg">' + (own ? '✅ yours · legendary' : '🔒 legendary') + '</span><b>' + r.icon + ' ' + UI.esc(r.name) + '</b></div>' +
        '<div class="bs-need"><span>' + (mOk ? '✅' : '🐾') + ' ' + r.miles + ' miles' + (mOk ? '' : ' (' + Math.max(0, r.miles - miles) + ' to go)') + '</span><span>' + (qOk ? '✅' : '🎯') + ' ' + UI.esc(r.quest) + '</span></div>' +
        '<p>' + UI.esc(r.about) + '</p></div>'; }).join('') + '</div>';
  box.querySelectorAll('canvas[data-rv]').forEach(c => paint(c, l, Number(c.dataset.rv), who));
}
// 🧰 Maker shelf: things made in 🏭 Artifactory (painted by AvatarKit artDraw), tap = item card (af-1)
const ART_KIND_N = {cup: ['🥤', 'Cup', 'Hold it — or put it on a shelf'], bangle: ['⭕', 'Bangle', 'Wear it on your wrist'], pen: ['🖊️', 'Pen', 'Hold it'], yoyo: ['🪀', 'Yo-yo', 'Hold it and do tricks'], piece: ['♟️', 'Chess piece', 'A game piece'], trophy: ['🏆', 'Trophy', 'Hold it high!'], ball: ['⚽', 'Ball', 'Hold it'],
  gem: ['💎', 'Gem', 'A loose gem'], ring: ['💍', 'Ring', 'Wear it on your finger'], necklace: ['📿', 'Necklace', 'Wear it round your neck'], crown: ['👑', 'Crown', 'Wear it on your head'], tag: ['🏷️', 'Pet tag', 'A tag for your pet']};
const ART_TOOL_N = {lathe: '🌀 Lathe', finish: '🎨 Finish bench', stone: '💎 Stone polishing'};
// 🏭 af-4: every crafted thing the family made → localStorage sp_artskins (the game skin pickers read it: chess pieces, number + letter tiles, bombs, balls, snakes)
function shareArtSkins(){ try{ const all = (D && D.arts) || {}, seen = {}, list = []; Object.keys(all).forEach(p => (all[p] || []).forEach(a => { if(seen[a.id] || !a.look) return; seen[a.id] = 1; const lk = a.look, col = /^#[0-9a-f]{6}$/i.test(lk.c || '') ? lk.c : (window.ART_MAT && (ART_MAT[lk.m] || ART_MAT[lk.g])) || '#C08A4E';
  list.push({id: a.id, k: a.kind, n: a.name, by: a.maker, m: lk.m || lk.g || '', col, c2: /^#[0-9a-f]{6}$/i.test(lk.c2 || '') ? lk.c2 : '', look: lk}); }));
  localStorage.setItem('sp_artskins', JSON.stringify({v: 1, at: Date.now(), list: list.slice(0, 80)})); }catch(e){} }
function renderArts(){
  shareArtSkins();
  const box = document.getElementById('arts'); if(!box) return;
  const list = ((D && D.arts) || {})[who] || [];
  box.innerHTML = list.length ? list.map(a => '<div class="card mcard t-card" data-art="' + a.id + '"><canvas width="300" height="300"></canvas><b>' + (ART_KIND_N[a.kind] || ['🛠️'])[0] + ' ' + UI.esc(a.name) + '</b><span class="by">' + (a.maker === who ? 'Made by ' + UI.esc(who) : '🎁 From ' + UI.esc(a.maker)) + (a.stars ? ' · ' + '⭐'.repeat(a.stars) : '') + '</span></div>').join('')
    : '<div class="made-empty">Nothing made yet — turn, polish and paint things in 🏭 Artifactory!</div>';
  box.querySelectorAll('[data-art]').forEach(el => { const a = list.find(x => x.id === el.dataset.art), cv = el.querySelector('canvas'), g = cv.getContext('2d'); if(window.artDraw) artDraw(g, a.look, 150, 270, 220, 1); el.onclick = () => openArtCard(a); });
}
/* ---------- as-2 🎭 Acts shelf: the shared acts (AvatarActing) on the chosen player's avatar · emotion-wheel chips · who made it ---------- */
let ACT_F = 'sig', ACT_N = 24, ACT_RAF = 0;
const ACT_EMO = {joy: '😄 Joy', sadness: '😢 Sad', anger: '😠 Angry', fear: '😨 Scared', surprise: '😲 Surprise', disgust: '🤢 Yuck', love: '💖 Love', calm: '😌 Calm', pride: '😎 Proud', silly: '🤪 Silly'};
function actName(k){ const S = window.Acting && Acting.SIG && Acting.SIG.names; if(S && S[k]) return S[k]; if(/^gest\./.test(k)){ const g = (typeof GESTURES !== 'undefined' ? GESTURES : []).find(q => 'gest.' + q.k === k); if(g) return g.n; } const n = k.replace(/^[a-z0-9]+\./, '').replace(/-/g, ' '); return n.charAt(0).toUpperCase() + n.slice(1); }
function actFrom(A){ if(!A) return ''; if(A.from) return A.from; return String(A.block || '').indexOf('core') === 0 ? '💥 core kit' : (A.by || ''); }
function actsFor(f){
  const all = Acting.list('acts', {shared: true}), T = Acting.T, week = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  if(f === 'sig') return Acting.SIG.free.concat(Acting.SIG.line).filter(k => T.acts[k]).concat(all.filter(k => (T.acts[k].added || '') >= week && !Acting.SIG.free.concat(Acting.SIG.line).includes(k)));
  if(f === 'dance') return all.filter(k => (T.acts[k].tags || []).includes('dance') || (T.acts[k].tags || []).includes('gesture') && /dance|floss|shuffle|spin|moon|robot|groove/i.test(k));
  if(ACT_EMO[f]) return (T.pools[f] || []).filter(k => T.acts[k]).concat(all.filter(k => (T.acts[k].tags || []).includes(f) && !(T.pools[f] || []).includes(k)));
  return all;
}
function renderActs(){
  const box = $('acts'), fbox = $('acts-f'); if(!box) return;
  if(!window.Acting){ $('acts-h').classList.add('hidden'); fbox.innerHTML = ''; box.innerHTML = ''; return; }
  const T = Acting.T, chipsL = [['sig', '🎭 Signature + new'], ['dance', '🕺 Dances']].concat(Acting.EMOTIONS.filter(e => actsFor(e).length).map(e => [e, ACT_EMO[e] || e])).concat([['all', '✨ All ' + Acting.list('acts', {shared: true}).length]]);
  fbox.innerHTML = chipsL.map(([k, n]) => '<button class="chip' + (ACT_F === k ? ' on' : '') + '" data-sound="pop" data-af="' + k + '">' + n + '</button>').join('');
  fbox.querySelectorAll('[data-af]').forEach(b => b.onclick = () => { ACT_F = b.dataset.af; ACT_N = 24; renderActs(); });
  const list = actsFor(ACT_F), sigs = Acting.SIG.free.concat(Acting.SIG.line), week = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10), mine = avatarOf(who).sig;
  box.innerHTML = list.slice(0, ACT_N).map(k => { const A = T.acts[k] || {}; return '<button class="act-card" data-sound="pop" data-act="' + k + '" title="' + UI.esc(A.about || actName(k)) + '">' +
    (k === mine ? '<span class="act-tag">⭐ ' + UI.esc(who) + '\'s</span>' : sigs.includes(k) ? '<span class="act-tag">🎭</span>' : '') + ((A.added || '') >= week ? '<span class="act-tag new">🆕</span>' : '') +
    '<canvas width="200" height="232"></canvas><b>' + UI.esc(actName(k)) + '</b><small>' + UI.esc(A.about || (A.tags || []).filter(t => ACT_EMO[t]).map(t => ACT_EMO[t]).join(' ') || '') + '</small><small>by ' + UI.esc(actFrom(A)) + '</small></button>'; }).join('') +
    (list.length > ACT_N ? '<button class="chip acts-more" data-sound="pop" id="acts-more">➕ ' + (list.length - ACT_N) + ' more</button>' : '');
  const whoAv = {name: '', av: avatarOf(who), dir: 1};
  box.querySelectorAll('.act-card').forEach(b => { const c = b.querySelector('canvas'); try { const fr = Acting.frames(whoAv, b.dataset.act, {w: 100, h: 116, dpr: 2, n: 1, t0: 0.45, ride: 'keep'}); c.getContext('2d').drawImage(fr[0], 0, 0); } catch(e){}
    b.onclick = () => playAct(b); });
  const more = $('acts-more'); if(more) more.onclick = () => { ACT_N += 24; renderActs(); };
}
function playAct(b){
  cancelAnimationFrame(ACT_RAF); document.querySelectorAll('.act-card.play').forEach(x => x.classList.remove('play')); b.classList.add('play');
  const c = b.querySelector('canvas'), g = c.getContext('2d'), k = b.dataset.act, whoAv = {name: '', av: avatarOf(who), dir: 1}, f = Acting.fit(whoAv, [k], 100, 116, {ride: 'keep'}), t0 = performance.now();
  const step = now => { const t = (now - t0) / 1000; g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, 100, 116); try { Acting.draw(g, whoAv, f.x, f.y, f.k, k, {t, ride: 'keep'}); } catch(e){}
    if(t < 3 && b.isConnected) ACT_RAF = requestAnimationFrame(step); else b.classList.remove('play'); };
  ACT_RAF = requestAnimationFrame(step);
}
/* ---------- ck-1b 📚 Comic Book: everyone's comics (getComicBook), 📖 reader with 👍 vote, 🎨 Make my comic (saveComic, PIN) ---------- */
const OPEN_COMIC = String(SP_TV[3]).indexOf('comic:') === 0 ? String(SP_TV[4]).slice(6) : '';
let BOOK = null, BOOK_F = 'all', BOOK_N = 24, BOOK_COVERS = new Map(), BOOK_RAF = 0;
const GAME_ICON = id => ({maker: '🎨', 'sla-brall': '🏓', slabrall: '🏓', brawl: '🥊', brawlbuddies: '🥊', chess: '♟️', checkers: '🔴', polyplot: '⬛', soulbopper: '👻', snakize: '🐍'}[id] || '🎮');
function bookAv(n){ return n === 'Robot' || !D.players.some(p => p.Name === n) ? defaultAvatar(n || 'Robot') : avatarOf(n); }
function loadBook(then){ google.script.run.withSuccessHandler(b => { BOOK = b; renderBook(); if(then) then(); openFromLink(); }).withFailureHandler(() => { BOOK = {comics: [], cotd: '', votedToday: {}}; renderBook(); }).getComicBook(); }
function bookList(){ const all = (BOOK && BOOK.comics || []).filter(c => c.player === who && c.page);
  if(BOOK_F === 'maker') return all.filter(c => c.game === 'maker'); if(BOOK_F === 'cotd') return all.filter(c => c.id === BOOK.cotd); if(BOOK_F !== 'all') return all.filter(c => c.game === BOOK_F); return all; }
function renderBook(){
  const box = $('book'), fb = $('book-f'); if(!D) return;   // the page data comes first (render() calls this again)
  if(!box || !window.Comic || !Comic.render){ if($('book-h')) $('book-h').classList.add('hidden'); return; }
  $('book-who').textContent = (who || '') + "'s"; $('book-make').textContent = '🎨 Make ' + (who === CURRENT_PLAYER || !who ? 'my' : who + "'s") + ' comic';
  if(!BOOK){ box.innerHTML = '<div class="book-empty"><span class="ui-spin a-bounce">📚</span> Opening the comic book…</div>'; fb.innerHTML = ''; return; }
  const all = (BOOK.comics || []).filter(c => c.player === who && c.page), games = Array.from(new Set(all.map(c => c.game))).filter(g => g !== 'maker');
  const chipsL = [['all', 'All ' + all.length]].concat(games.map(g => [g, GAME_ICON(g) + ' ' + g])).concat(all.some(c => c.game === 'maker') ? [['maker', '🎨 Made by ' + who]] : []).concat(all.some(c => c.id === BOOK.cotd) ? [['cotd', '🏅 Comic of the day']] : []);
  if(!chipsL.some(c => c[0] === BOOK_F)) BOOK_F = 'all';
  fb.innerHTML = all.length ? chipsL.map(([k, n]) => '<button class="chip' + (BOOK_F === k ? ' on' : '') + '" data-sound="pop" data-bf="' + UI.esc(k) + '">' + UI.esc(n) + '</button>').join('') : '';
  fb.querySelectorAll('[data-bf]').forEach(b => b.onclick = () => { BOOK_F = b.dataset.bf; BOOK_N = 24; renderBook(); });
  const list = bookList();
  if(!list.length){ box.innerHTML = '<div class="book-empty">📚 No comics yet. Make the first one with 🎨 — and the games will add their best moments here soon!</div>'; return; }
  box.innerHTML = list.slice(0, BOOK_N).map(c => '<button class="bk-cover" data-sound="pop" data-cid="' + c.id + '"><canvas></canvas><b>#' + c.issue + ' · ' + UI.esc(c.title || 'Untitled') + '</b><small>' + GAME_ICON(c.game) + ' ' + UI.esc(c.made.slice(5, 10)) + (c.votes ? ' · 👍 ' + c.votes : '') + '</small>' + (c.id === BOOK.cotd ? '<br><span class="cotd">🏅 TODAY</span>' : '') + '</button>').join('') +
    (list.length > BOOK_N ? '<button class="chip" data-sound="pop" id="book-more" style="align-self:center">➕ ' + (list.length - BOOK_N) + ' more</button>' : '');
  box.querySelectorAll('[data-cid]').forEach(b => { const c = list.find(x => x.id === b.dataset.cid), cv = b.querySelector('canvas'), key = c.id + '|' + JSON.stringify(bookAv(c.player));
    let src = BOOK_COVERS.get(key); if(!src){ src = document.createElement('canvas'); try { Comic.render(src, Comic.cover(Comic.expand(c.page, bookAv), {issue: c.issue}), {w: 124, h: 165, t: 0.5, still: true, dpr: 2}); } catch(e){} BOOK_COVERS.set(key, src); }
    cv.width = src.width; cv.height = src.height; cv.getContext('2d').drawImage(src, 0, 0); b.onclick = () => openReader(c.id); });
  const more = $('book-more'); if(more) more.onclick = () => { BOOK_N += 24; renderBook(); };
}
function sheetEl(){ let el = $('ck-sheet'); if(!el){ el = document.createElement('div'); el.id = 'ck-sheet'; el.className = 'ck-sheet'; el.onclick = e => { if(e.target === el) closeSheet(); }; document.body.appendChild(el); } el.classList.remove('hidden'); return el; }
function closeSheet(){ cancelAnimationFrame(BOOK_RAF); const el = $('ck-sheet'); if(el) el.remove(); }
function pageSize(){ const W = Math.min(innerWidth - 44, 760), portrait = innerHeight > innerWidth * 1.1, H = Math.min(innerHeight - (portrait ? 190 : 150), W * (portrait ? 1.45 : 0.62)); return {W: Math.round(Math.min(W, portrait ? W : H / 0.62)), H: Math.round(H)}; }
function playOn(cv, pg, W, H){ cancelAnimationFrame(BOOK_RAF); const t0 = performance.now(), n = pg.panels.length, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = now => { if(!cv.isConnected) return; const t = (now - t0) / 1000; Comic.render(cv, pg, {w: W, h: H, t: reduce ? 0.5 : t, reveal: reduce ? 1 : Math.min(1, t / (n * 0.5)), lang: Comic.lang(CURRENT_PLAYER), still: reduce}); if(!reduce && t < 40) BOOK_RAF = requestAnimationFrame(step); };
  BOOK_RAF = requestAnimationFrame(step); }
// 📖 the reader: one comic at a time, ‹ › flip, 👍 (one per player per day), 🔊, 🗑️ for the owner
function openReader(id){
  const list = bookList(), i = list.findIndex(c => c.id === id); if(i < 0) return; const c = list[i], {W, H} = pageSize(), me = CURRENT_PLAYER, voted = (BOOK.votedToday || {})[me] === c.id;
  const el = sheetEl(); el.innerHTML = '<div class="ck-sheet-in t-card" role="dialog" aria-label="Comic"><h3>#' + c.issue + ' · ' + UI.esc(c.title || 'Untitled') + '</h3><canvas style="width:' + W + 'px;height:' + H + 'px"></canvas>' +
    '<div class="meta">' + GAME_ICON(c.game) + ' ' + UI.esc(c.game === 'maker' ? 'made by ' + c.player : c.game) + ' · ' + UI.esc(c.made) + (c.id === BOOK.cotd ? ' · 🏅 Comic of the day' : '') + '</div>' +
    '<div class="ck-row"><button class="ck-btn" data-sound="nav" id="rd-prev"' + (i > 0 ? '' : ' disabled') + '>‹</button><button class="ck-btn go" data-sound="pop" id="rd-vote"' + (me && me !== c.player ? '' : ' disabled') + '>👍 ' + c.today + (voted ? ' · yours' : '') + '</button>' +
    '<button class="ck-btn" data-sound="pop" id="rd-say">🔊</button>' + (me && me === c.player ? '<button class="ck-btn" data-sound="pop" id="rd-del">🗑️</button>' : '') + '<button class="ck-btn" data-sound="nav" id="rd-next"' + (i < list.length - 1 ? '' : ' disabled') + '>›</button><button class="ck-btn" data-sound="nav" id="rd-close">✕ Close</button></div></div>';
  playOn(el.querySelector('canvas'), Comic.expand(c.page, bookAv), W, H);
  $('rd-close').onclick = closeSheet; $('rd-prev').onclick = () => openReader(list[i - 1].id); $('rd-next').onclick = () => openReader(list[i + 1].id);
  $('rd-say').onclick = () => { try { const words = c.page.panels.map(p => (p.bub && p.bub.text) || (p.sfx && p.sfx.text) || '').filter(Boolean).join('. '); if(window.speechSynthesis && words){ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(words.replace(/[^\w\s,!?'.-]/g, '')); u.pitch = 1.2; speechSynthesis.speak(u); } } catch(e){} };
  $('rd-vote').onclick = () => withPin(me, '👍 Give your vote of the day', pin => { const b = $('rd-vote'); UI.busy(b, 'collection', 'Voting');
    google.script.run.withSuccessHandler(bk => { BOOK = bk; UISound.play('success'); UI.toast('👍 Your vote of the day went to #' + c.issue + '!'); renderBook(); openReader(c.id); }).withFailureHandler(e => { UI.idle(b); pinFail(me, e); }).voteComic(me, c.id, pin); });
  const del = $('rd-del'); if(del) del.onclick = () => UI.confirm({icon: '🗑️', title: 'Take #' + c.issue + ' out of your book?', okText: 'Remove', danger: true}).then(ok => { if(!ok) return; withPin(me, '🗑️ Remove a comic', pin => google.script.run.withSuccessHandler(bk => { BOOK = bk; closeSheet(); renderBook(); UI.toast('🗑️ Removed'); }).withFailureHandler(e => pinFail(me, e)).deleteComic(me, c.id, pin)); });
}
function withPin(name, why, go){ if(!name){ UI.toast('Pick your player on the Dashboard first'); return; } try { document.activeElement && document.activeElement.blur(); } catch(e){} UI.playerPin({name, hasPin: true, why}).then(pin => { if(pin) go(pin); }); }
function pinFail(name, e){ const m = String(e && e.message || e || ''); if(/PIN/.test(m) && !/NOPIN/.test(m)) UI.forgetDayPin(name); UI.toast(/NOPIN/.test(m) ? '🔑 Choose your PIN in the Family Room first' : m.replace(/^\w+: /, '') || 'Try again', 'err'); }
// 🎨 Make my comic: moment · who's with you · 🔀 look · mood · 🇹🇭 · your own words → 💾 into the book
const MK_MOMENTS = [['hit', '🏓 Hit'], ['ko', '🥊 KO'], ['boardwin', '♟️ Win'], ['miss', '😱 Miss'], ['comeback', '👻 Comeback'], ['winner', '🏆 Winner'], ['funnyloss', '🤪 Oops']];
let MK = null;
function openMaker(){
  const me = who || CURRENT_PLAYER; if(!me){ UI.toast('Pick your player on the Dashboard first'); return; }
  const friends = D.players.map(p => p.Name).filter(n => n !== me).concat(['Robot']);
  MK = {me, moment: 'hit', friend: friends[0], variant: 0, mood: '', page: null, words: '', sound: '', title: ''};
  const el = sheetEl(), {W, H} = pageSize(), w2 = Math.min(W, 640), h2 = Math.round(Math.min(H * 0.85, w2 * (innerHeight > innerWidth * 1.1 ? 1.4 : 0.6)));
  el.innerHTML = '<div class="ck-sheet-in t-card" role="dialog" aria-label="Make my comic"><h3>🎨 ' + UI.esc(me) + "'s new comic</h3>" +
    '<div class="ck-row" id="mk-mom"><i>Moment</i>' + MK_MOMENTS.map(([k, n]) => '<button class="chip" data-sound="pop" data-mk="' + k + '">' + n + '</button>').join('') + '</div>' +
    '<div class="ck-row" id="mk-with"><i>With</i>' + friends.map(n => '<button class="chip" data-sound="pop" data-fr="' + UI.esc(n) + '">' + (n === 'Robot' ? '🤖 ' : '') + UI.esc(n) + '</button>').join('') + '</div>' +
    '<div class="ck-row"><i>Look</i><button class="chip" data-sound="pop" id="mk-shuf">🔀 Shuffle</button><button class="chip" data-sound="pop" id="mk-mood">🎨 Mood</button><button class="chip" data-sound="pop" id="mk-lang">🇹🇭 ' + ({en: 'English', th: 'ไทย', both: 'Both'}[Comic.lang(me)] || 'English') + '</button></div>' +
    '<div class="ck-row"><i>Title</i><input id="mk-title" maxlength="40" placeholder="My best shot!"></div>' +
    '<div class="ck-row"><i>Words</i><input id="mk-words" maxlength="80"></div><div class="ck-row"><i>Sound</i><input id="mk-sound" maxlength="20"></div>' +
    '<canvas id="mk-cv" style="width:' + w2 + 'px;height:' + h2 + 'px"></canvas><div class="ck-row"><button class="ck-btn" data-sound="nav" id="mk-close">✕ Cancel</button><button class="ck-btn go" data-sound="none" id="mk-save">💾 Save to my book</button></div></div>';
  const redraw = fresh => { const players = [{name: me, av: bookAv(me)}, {name: MK.friend, av: bookAv(MK.friend)}];
    if(fresh || !MK.page){ MK.page = Comic.recipe(MK.moment, {players, variant: MK.variant, crowd: D.players.filter(p => p.Name !== me && p.Name !== MK.friend).slice(0, 2).map(p => ({name: p.Name, av: bookAv(p.Name)}))});
      const b = MK.page.panels.find(p => p.bub), s = MK.page.panels.find(p => p.sfx); MK.words = b ? b.bub.text : ''; MK.sound = s ? s.sfx.text : ''; MK.title = Comic.RECIPES[MK.moment].name.replace(/^\S+\s/, ''); $('mk-words').value = MK.words; $('mk-sound').value = MK.sound; $('mk-title').value = MK.title; }
    const pg = JSON.parse(JSON.stringify(MK.page)); pg.players = players; if(pg.crowd) pg.crowd = MK.page.crowd; if(MK.mood) pg.mood = MK.mood; pg.title = '🎨 ' + (MK.title || '');
    const b = pg.panels.find(p => p.bub), s = pg.panels.find(p => p.sfx); if(b) b.bub.text = MK.words || b.bub.text; if(s) s.sfx.text = MK.sound || s.sfx.text; MK.view = pg;
    el.querySelectorAll('[data-mk]').forEach(x => x.classList.toggle('on', x.dataset.mk === MK.moment)); el.querySelectorAll('[data-fr]').forEach(x => x.classList.toggle('on', x.dataset.fr === MK.friend));
    playOn($('mk-cv'), pg, w2, h2); };
  el.querySelectorAll('[data-mk]').forEach(x => x.onclick = () => { MK.moment = x.dataset.mk; MK.variant = 0; redraw(true); });
  el.querySelectorAll('[data-fr]').forEach(x => x.onclick = () => { MK.friend = x.dataset.fr; redraw(true); });
  $('mk-shuf').onclick = () => { MK.variant = (MK.variant + 1) % Comic.RECIPES[MK.moment].variants.length; redraw(true); };
  $('mk-mood').onclick = () => { const ms = Object.keys(Comic.MOODS); MK.mood = ms[(ms.indexOf(MK.mood) + 1) % ms.length]; $('mk-mood').textContent = '🎨 ' + Comic.MOODS[MK.mood].name; redraw(); };
  $('mk-lang').onclick = () => { const L = ['en', 'th', 'both'], nx = L[(L.indexOf(Comic.lang(me)) + 1) % 3]; Comic.setLang(me, nx); $('mk-lang').textContent = '🇹🇭 ' + {en: 'English', th: 'ไทย', both: 'Both'}[nx]; redraw(); };
  ['words', 'sound', 'title'].forEach(f => { $('mk-' + f).oninput = () => { MK[f] = $('mk-' + f).value.slice(0, f === 'sound' ? 20 : 80); redraw(); }; });
  $('mk-close').onclick = closeSheet;
  $('mk-save').onclick = () => withPin(me, '🎨 Save your comic', pin => { const b = $('mk-save'), pg = JSON.parse(JSON.stringify(MK.view)); pg.title = MK.title || pg.title.replace(/^🎨 /, ''); UI.busy(b, 'collection', 'Saving');
    Comic.save(pg, {name: me, pin, game: 'maker'}).then(r => { UISound.play('success'); closeSheet(); UI.toast('📚 Saved as #' + r.issue + ' in your comic book!'); BOOK_F = 'all'; loadBook(() => { who = me; renderBook(); }); }).catch(e => { UI.idle(b); pinFail(me, e); }); });
  redraw(true);
}
// 🏅 from the Dashboard card (?game=comic:<id>): open that comic once both the page data and the book are here
let OPENED = false;
function openFromLink(){ if(OPENED || !OPEN_COMIC || !D || !BOOK) return; OPENED = true; const c = (BOOK.comics || []).find(x => x.id === OPEN_COMIC); if(!c) return; who = c.player; BOOK_F = 'all'; render(); setTimeout(() => { const h = $('book-h'); if(h) h.scrollIntoView({block: 'start'}); openReader(c.id); }, 200); }
loadBook();
function openArtCard(a){
  const K = ART_KIND_N[a.kind] || ['🛠️', a.kind, ''], mats = Object.keys(a.mats || {}).map(m => m + ' ×' + a.mats[m]).join(', ');
  document.getElementById('art-card-in').innerHTML = '<canvas width="360" height="360"></canvas><h3>' + K[0] + ' ' + UI.esc(a.name) + '</h3>' +
    '<div class="row"><span>For</span><b>' + UI.esc(K[2]) + '</b></div><div class="row"><span>Materials</span><b>' + UI.esc(mats || '—') + '</b></div>' +
    '<div class="row"><span>Tools</span><b>' + (a.tools || []).map(t => ART_TOOL_N[t] || t).join(' · ') + '</b></div><div class="row"><span>Made by</span><b>' + UI.esc(a.maker) + ((a.team || []).length ? ' + ' + a.team.map(UI.esc).join(' + ') : '') + '</b></div>' +
    '<div class="row"><span>Date</span><b>' + UI.esc(String(a.made || '').slice(0, 10)) + '</b></div><div class="row"><span>⭐ Stars</span><b>' + (a.stars ? '⭐'.repeat(a.stars) : '—') + '</b></div>';
  const cv = document.querySelector('#art-card-in canvas'); if(window.artDraw) artDraw(cv.getContext('2d'), a.look, 180, 330, 270, 1);
  document.getElementById('art-card').classList.remove('hidden'); UISound.play('pop');
}
function load(){
  const close = UI.section($('grid'), 'collection');
  $('grid').style.minHeight = '200px';
  google.script.run.withSuccessHandler(d => {
    close(); $('grid').style.minHeight = ''; D = d;
    const k = UI.applyTheme(UI.themeFor(d.settings || {}, CURRENT_PLAYER)); UI.rememberTheme(CURRENT_PLAYER, k); UISound.applySettings(d.settings || {});
    if(!D.players.some(p => p.Name === who)) who = D.players.length ? D.players[0].Name : '';
    render();
  }).withFailureHandler(() => { close(); UI.toast('Could not open the collection — try again', 'err'); }).getItemsData(CURRENT_PLAYER);
}
load();
