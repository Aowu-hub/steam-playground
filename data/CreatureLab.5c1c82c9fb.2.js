
const CURRENT_PLAYER = SP_TV[0]; window.SP_PAGE = SP_TV[1];
try { UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true}); } catch(e){}
UI.navBar(document.getElementById('back-btn'), {});
(function navRoom(){ const n = document.getElementById('back-btn-nav'), app = document.getElementById('app'); if(!n) return; const fix = getComputedStyle(n).position === 'fixed';
  document.getElementById('top').style.setProperty('--nav-w', fix ? Math.ceil(n.getBoundingClientRect().right - app.getBoundingClientRect().left + 6) + 'px' : '0px'); })();
(function(){
'use strict';
const C = window.Creatures, $ = id => document.getElementById(id), cv = $('cv'), g = cv.getContext('2d');
const VIEWS = [['all', '📚', 'All'], ['sizes', '📏', 'Sizes'], ['battle', '⚔️', 'Battle'], ['map', '🗺️', 'Map'], ['pets', '🐣', 'Pets']].concat(C.SEA ? [['sea', '🌊', 'Sea']] : []);   // 🌊 av-naga4: CreatureSea families
const ACTS = [['attack', '⚔️', 'Attack'], ['cast', '✨', 'Cast'], ['hurt', '🤕', 'Hurt'], ['ko', '💫', 'KO'], ['cheer', '🎉', 'Cheer']];
const SEA_ACTS = [['rise', '🔥', 'Rise'], ['lunge', '🐍', 'Lunge'], ['sweep', '🌀', 'Sweep'], ['dive', '🤿', 'Dive']].filter(a => C.ACTS[a[0]]).concat([['fish', '🐟', 'Fish moves']]);   // 🐟 = every fish plays its own move
const FISH_ACT = {glidray: 'glide', mudhopper: 'hop', bettaflare: 'flare'};
const SEA = C.list().filter(id => ['serpent', 'fish'].indexOf(C.LIST[id].fam) >= 0), SV = [['SW', '↙'], ['SE', '↘'], ['NW', '↖'], ['NE', '↗']];   // 🧭 the 4 main views
const actList = () => S.view === 'sea' ? SEA_ACTS : ACTS;
const ALL = C.list().filter(id => !C.LIST[id].pet);
const S = {view: 'all', act: null, actT0: 0, sel: 0, form: 2, pet: 0, sv: 0, W: 0, H: 0, dpr: 1, fits: null, frameMs: 0, drawn: [], log: []};
const name = CURRENT_PLAYER && CURRENT_PLAYER.indexOf('<' + '?') < 0 ? CURRENT_PLAYER : 'Aowu';
const who = {name, av: (typeof defaultAvatar === 'function') ? defaultAvatar(name) : null, dir: 1, walkT: 0};
let AVH = 0; function avH(){ if(!AVH) AVH = C.box('lab:av', q => drawAvatar(q, who, 0, 0, 1, {t: 0.5, still: true})).h; return AVH; }
function avatarAt(x, y, px){ drawAvatar(g, who, x, y, px / avH(), {t: S.t, still: true}); }
const PETS = C.list().filter(id => { const d = C.LIST[id]; return d.rank !== 'boss' && d.fam !== 'giant' && C.friendChance(d) > 0 || d.pet; });
function chipRow(box, list, cur, on){ box.innerHTML = ''; list.forEach(([k, ic, lb]) => { const b = document.createElement('button'); b.className = 'chip' + (k === cur ? ' on' : ''); b.dataset.k = k;
    b.innerHTML = ic + '<span class="lb"> ' + lb + '</span>'; b.onclick = () => on(k, b); box.appendChild(b); }); }
function pickRow(){ const P = $('pick'); P.innerHTML = ''; if(S.view !== 'battle' && S.view !== 'pets' && S.view !== 'sea') return;
  const lab = S.view === 'sea' ? SV[S.sv][1] + ' ' + SV[S.sv][0] : S.view === 'battle' ? ['Grand Yak', '✦ Elite', '✦✦ Awakened'][S.form] : C.LIST[PETS[S.pet]].name;
  P.innerHTML = '<button class="chip" id="pk-prev">◀</button><b id="pk-name">' + lab + '</b><button class="chip" id="pk-next">▶</button>';
  const step = d => { if(S.view === 'sea') S.sv = (S.sv + d + 4) % 4; else if(S.view === 'battle') S.form = (S.form + d + 3) % 3; else S.pet = (S.pet + d + PETS.length) % PETS.length; pickRow(); };
  $('pk-prev').onclick = () => step(-1); $('pk-next').onclick = () => step(1); }
function setView(v){ const was = S.view === 'sea'; S.view = v; if(was !== (v === 'sea')){ S.act = null; chipRow($('acts'), actList(), null, playAct); } chipRow($('views'), VIEWS, v, setView); pickRow(); }
function playAct(a){ S.act = a; S.actT0 = performance.now(); S.log.push(a); chipRow($('acts'), actList(), a, playAct); }
function size(){ const r = $('stage').getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1); if(r.width === S.W && r.height === S.H && dpr === S.dpr) return;
  S.W = r.width; S.H = r.height; S.dpr = dpr; cv.width = Math.round(S.W * dpr); cv.height = Math.round(S.H * dpr); }
function opt(extra){ const ms = S.act ? performance.now() - S.actT0 : 0; const total = S.act ? (C.ACTS[S.act] ? C.ACTS[S.act].reduce((a, b) => a + b.ms, 0) + 500 : 3000) : 0;   // 🐟 'fish' = each fish its own move
  if(S.act && ms > total){ S.act = null; chipRow($('acts'), actList(), null, playAct); }
  return Object.assign(S.act ? {act: S.act, ms} : {pose: 'idle'}, {t: S.t}, extra || {}); }
function rec(x, y, w, h){ S.drawn.push({x, y, w, h}); }
// ---- views ----
function vAll(){ const n = ALL.length, cols = Math.max(2, Math.round(Math.sqrt(n * S.W / S.H))), rows = Math.ceil(n / cols), cw = S.W / cols, ch = S.H / rows;
  ALL.forEach((id, i) => { const x = (i % cols) * cw, y = ((i / cols) | 0) * ch, f = C.fit(id, cw - 12, ch - 26, {pad: 0.12});
    C.draw(g, id, x + 6 + f.x, y + 4 + f.y, f.size, opt()); rec(x, y, cw, ch);
    g.font = '700 ' + Math.max(10, Math.min(14, cw / 9)) + 'px Fredoka'; g.textAlign = 'center'; g.fillStyle = '#24324A'; g.fillText(C.LIST[id].name, x + cw / 2, y + ch - 6); }); }
function vSizes(){ const items = [[null, 3], ['mangobble', 1], ['toucanoo', 2], ['rapscal', 3], ['clankle', 4], ['hissvine', 5], ['grandyak', 6, 0], ['grandyak', 7, 1], ['grandyak', 8, 2]];
  const base = S.H - 30, av = Math.min((S.H - 50) / 2.95, S.W / 22), step = S.W / items.length;
  g.strokeStyle = '#C9D6E6'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, base); g.lineTo(S.W, base); g.stroke();
  [1, 2].forEach(m => { const y = base - av * m; g.strokeStyle = '#DCE6F2'; g.setLineDash([4, 6]); g.beginPath(); g.moveTo(0, y); g.lineTo(S.W, y); g.stroke(); g.setLineDash([]); g.fillStyle = '#8AA0B8'; g.font = '700 11px Fredoka'; g.textAlign = 'left'; g.fillText('×' + m, 4, y - 3); });
  items.forEach(([id, cl, form], i) => { const x = step * (i + 0.5); if(!id){ avatarAt(x, base, av); rec(x - av / 3, base - av, av / 1.5, av); }
    else { C.drawFor(g, id, x, base, av, opt({form: form || 0, noFx: form !== 2})); const h = C.heightFor(id, av, {form: form || 0}); rec(x - h / 3, base - h, h / 1.5, h); }
    g.fillStyle = '#24324A'; g.font = '700 ' + Math.max(9, Math.min(13, step / 7)) + 'px Fredoka'; g.textAlign = 'center'; g.fillText(id ? cl + ' ×' + C.CLS[cl].k : 'You', x, base + 18); }); }
function vBattle(){ const foes = [{def: C.LIST.grandyak, form: S.form}, {def: C.LIST.mangobble}, {def: C.LIST.toucanoo}];
  const av0 = Math.min(S.H * 0.42, 130), floor = S.H - 18, z = C.battleZoom(floor - 8, av0, foes), av = av0 * z;
  g.fillStyle = 'rgba(120,200,110,.35)'; g.fillRect(0, floor, S.W, S.H - floor);
  const xs = [S.W * 0.2, S.W * 0.66, S.W * 0.86, S.W * 0.52];
  avatarAt(xs[0], floor, av); rec(xs[0] - av / 3, floor - av, av / 1.5, av);
  let top = floor - av; const mk = (f, x, y) => { const h = C.heightFor(f.def, av, f); C.drawFor(g, f.def, x, y, av, opt({form: f.form || 0})); top = Math.min(top, y - h); rec(x - h / 3, y - h, h / 1.5, h); };
  mk(foes[0], xs[1], floor - 4); mk(foes[1], xs[3], floor); mk(foes[2], xs[2], floor + 2);
  S.fits = {top, zoom: z, ok: top >= -1}; $('note').textContent = (top >= -1 ? '✅ fits' : '❌ cut off') + ' · zoom ' + z.toFixed(2) + ' · ×' + C.CLS[C.clsOf(foes[0].def, foes[0])].k; }
function vMap(){ const tw = Math.min(S.W / 7, 96), th = tw / 2, n = 6, ox = S.W / 2, oy = Math.max(10, (S.H - n * th - 30) / 2);
  for(let j = 0; j < n; j++) for(let i = 0; i < n; i++){ const x = ox + (i - j) * tw / 2, y = oy + (i + j) * th / 2; g.fillStyle = ['#8BD06A', '#7CC55E', '#93D873'][(i * 7 + j * 3) % 3];
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + tw / 2, y + th / 2); g.lineTo(x, y + th); g.lineTo(x - tw / 2, y + th / 2); g.closePath(); g.fill(); }
  const mapAv = tw * 0.62, roam = [['rapscal', 1, 2], ['mangobble', 3, 1], ['toucanoo', 4, 4], ['gulpot', 2, 4], ['rhinobug', 5, 2], ['hissvine', 1, 5], ['clankle', 4, 0]];
  const ph = Math.floor(S.t * 6) % 4, items = roam.map(([id, i, j]) => ({id, i, j, d: i + j})).sort((a, b) => a.d - b.d);
  items.forEach(o => { const x = ox + (o.i - o.j) * tw / 2, y = oy + (o.i + o.j) * th / 2 + th / 2, h = C.mapH(o.id, mapAv), F = C.frames(o.id, 'walk', {h, n: 4, dpr: S.dpr, face: o.i > 2 ? 'right' : 'left'});
    g.drawImage(F.frames[ph], x - F.w / 2, y - F.foot, F.w, F.h); rec(x - F.w / 2, y - F.foot, F.w, F.h); });
  const ax = ox, ay = oy + 3 * th + th / 2; avatarAt(ax, ay, mapAv); $('note').textContent = '🗺️ baked frames · ladder × ' + C.MAP.K + ' · min ' + C.MAP.MIN + ' px'; }
function vPets(){ const d = C.LIST[PETS[S.pet]], st = C.stagesFor(d), cols = S.W < 560 ? 3 : 5, rows = Math.ceil(st.length / cols), cw = S.W / cols, ch = S.H / rows;
  const av = Math.min(ch * 0.78 / 1.45, cw * 0.5);   // stage 5 = class 5 (×1.45) fills its cell
  st.forEach((x, i) => { const r = (i / cols) | 0, inRow = Math.min(cols, st.length - r * cols), off = (S.W - inRow * cw) / 2, cx = off + cw * (i % cols + 0.5), base = (r + 1) * ch - 26;
    C.drawFor(g, d, cx, base, av, opt({stage: i, pet: true})); rec(cx - cw / 2, r * ch, cw, ch);
    g.fillStyle = '#24324A'; g.font = '700 ' + Math.max(10, Math.min(14, cw / 8)) + 'px Fredoka'; g.textAlign = 'center';
    g.fillText(d.names ? d.names[i] : '★'.repeat(i + 1), cx, base + 18); });
  $('note').textContent = '🤝 ' + d.name + ' · befriend ' + (C.friendChance(d) ? '1 in ' + Math.round(1 / C.friendChance(d)) : 'starter'); }
// 🌊 av-naga4: every sea creature in the picked main view (↘ ↗ = ↙ ↖ mirrored), Phaya Naga as ✦✦✦ Prime Nakkharat (9 heads)
function vSea(){ const n = SEA.length, cols = Math.max(2, Math.round(Math.sqrt(n * S.W / S.H))), rows = Math.ceil(n / cols), cw = S.W / cols, ch = S.H / rows, view = SV[S.sv][0];
  SEA.forEach((id, i) => { const x = (i % cols) * cw, y = ((i / cols) | 0) * ch, form = id === 'phayanaga' ? 3 : 0, f = C.fit(id, cw - 12, ch - 26, {pad: 0.12, form});
    const o = opt({view, form}); if(o.act === 'fish'){ if(FISH_ACT[id]) o.act = FISH_ACT[id]; else { delete o.act; delete o.ms; o.pose = 'idle'; } }
    C.draw(g, id, x + 6 + f.x, y + 4 + f.y, f.size, o); rec(x, y, cw, ch);
    g.font = '700 ' + Math.max(10, Math.min(14, cw / 9)) + 'px Fredoka'; g.textAlign = 'center'; g.fillStyle = '#24324A'; g.fillText(id === 'phayanaga' ? '✦✦✦ Nakkharat' : C.LIST[id].name, x + cw / 2, y + ch - 6); });
  $('note').textContent = '🌊 ' + n + ' sea creatures · 🧭 ' + SV[S.sv][1] + ' ' + view + ' · ' + (C.SEA || ''); }
const DRAW = {all: vAll, sizes: vSizes, battle: vBattle, map: vMap, pets: vPets, sea: vSea};
function frame(now){ size(); S.t = now / 1000; S.drawn = []; const t0 = performance.now();
  g.setTransform(S.dpr, 0, 0, S.dpr, 0, 0); g.clearRect(0, 0, S.W, S.H); if(S.view !== 'battle' && S.view !== 'map' && S.view !== 'pets' && S.view !== 'sea') $('note').textContent = '🐾 ' + C.list().length + ' creatures · v ' + C.VERSION;
  try { DRAW[S.view](); } catch(e){ S.err = e.message; }
  S.frameMs = S.frameMs * 0.9 + (performance.now() - t0) * 0.1; requestAnimationFrame(frame); }
setView('all'); chipRow($('acts'), ACTS, null, playAct);
window.CK_LAB = {S, setView, playAct, PETS, ALL, SEA, SV, seaView(v){ S.sv = v; pickRow(); }};
requestAnimationFrame(frame);
})();
