
const CURRENT_PLAYER = SP_TV[0]; window.SP_PAGE = SP_TV[1];
try { UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true}); } catch(e){}
UI.navBar(document.getElementById('back-btn'), {});
(function navRoom(){ const n = document.getElementById('back-btn-nav'), app = document.getElementById('app'); if(!n) return; const fix = getComputedStyle(n).position === 'fixed';
  document.getElementById('top').style.setProperty('--nav-w', fix ? Math.ceil(n.getBoundingClientRect().right - app.getBoundingClientRect().left + 6) + 'px' : '0px'); })();
(function(){
'use strict';
const A = window.AvatarWear, $ = id => document.getElementById(id), cv = $('cv'), g = cv.getContext('2d');
const name = CURRENT_PLAYER || 'Aowu', BASE = (typeof defaultAvatar === 'function') ? defaultAvatar(name) : {};
const VIEWS = [['job', '👕', 'Jobs'], ['island', '🏝️', 'Islands'], ['camp', '🦖', 'Camps'], ['sky', '☀️', 'Sky God'], ['prime', '✦', 'Primes'], ['mix', '👗', 'My look'], ['drop', '🧱', 'Drops']];
const EL_IC = {fire: '🔥', water: '💧', nature: '🌱', stone: '🪨', wind: '🌪️', zap: '⚡', light: '✨', shadow: '🌑'};
const TIER_IC = ['⚪', '🟢', '🔵', '🟣', '🟡'];
const JOB_N = {knight: 'Knight', mage: 'Mage', chef: 'Chef', gardener: 'Gardener', ranger: 'Ranger', scholar: 'Scholar', inventor: 'Inventor', ninja: 'Ninja', brawler: 'Brawler', summoner: 'Summoner', smasher: 'Smasher', lancer: 'Lancer', sharp: 'Sharpshooter', ronin: 'Ronin'};
const S = {view: 'job', page: 0, el: null, mix: {head: 'job.knight@3', body: 'isl.ember@3', feet: 'isl.frost@4', back: 'isl.cherry@2', off: '', acc: 'isl.jungle@1'}, W: 0, H: 0, dpr: 1, frameMs: 0, drawn: [], err: null};
function pages(){ const v = S.view;
  if(v === 'job') return A.JOBS.map(k => ({label: JOB_N[k], ids: [0, 1, 2, 3].map(l => 'job.' + k + '@' + l + (S.el && l >= 2 ? '~' + S.el : '')), sub: ['Lv 1', 'Lv 7', 'Lv 14', 'Lv 20']}));
  if(v === 'island') return A.ISLANDS.map(k => ({label: A.info('isl.' + k + '@0').name, ids: [0, 1, 2, 3, 4].map(t => 'isl.' + k + '@' + t), sub: TIER_IC}));
  if(v === 'camp') return [{label: 'Camp sets', ids: A.CAMPS.map(k => 'camp.' + k), sub: A.CAMPS.map(k => A.info('camp.' + k).name)}];
  if(v === 'sky') return A.REGIONS.map(k => ({label: A.info('sky.' + k).name, ids: ['sky.' + k], sub: ['8 / 8'], icons: 'sky.' + k}));
  if(v === 'prime') return A.PRIMES.map(n => ({label: '#' + n + ' ' + A.look('prime.' + n + '.sig').piece, ids: ['prime.' + n + '.sig', 'prime.' + n + '.guard'], sub: ['✨ ' + A.info('prime.' + n + '.sig').name, '🛡️ ' + A.info('prime.' + n + '.guard').name]}));
  if(v === 'mix') return [{label: 'Show my look', mix: true}];
  if(v === 'drop') return ['job.knight@1', 'isl.frost@2', 'isl.cherry@3', 'sky.temple', 'prime.4.sig'].map(id => ({label: A.info(id).name, drop: id}));
  return []; }
function setView(v){ S.view = v; S.page = 0; [...$('views').children].forEach(b => b.classList.toggle('on', b.dataset.v === v)); opts(); pick(); }
function chipRow(box, list, on, fn){ box.innerHTML = ''; list.forEach(([k, ic, lb]) => { const b = document.createElement('button'); b.className = 'chip' + (k === on ? ' on' : ''); b.dataset.v = k; b.innerHTML = ic + (lb ? ' <span class="lb">' + lb + '</span>' : ''); b.onclick = () => fn(k); box.appendChild(b); }); }
function opts(){ const box = $('opts'); box.innerHTML = '';
  if(S.view === 'job') chipRow(box, [['', '🎨', 'Own']].concat(A.ELEMENTS.map(e => [e, EL_IC[e], ''])), S.el || '', k => { S.el = k || null; opts(); });
  if(S.view === 'mix') chipRow(box, [['shuffle', '🎲', 'Shuffle'], ['clear', '🧽', 'Clear']], null, k => { if(k === 'clear') S.mix = {}; else shuffle(); }); }
function shuffle(){ const all = A.ids(); A.SLOTS.forEach(s => { const c = all.filter(id => A.look(id).slots.includes(s)); S.mix[s] = Math.random() < 0.15 ? '' : c[Math.floor(Math.random() * c.length)]; }); }
function pick(){ const P = pages(), box = $('pick'); box.innerHTML = ''; if(P.length < 2){ const b = document.createElement('b'); b.textContent = P[0] ? P[0].label : ''; box.appendChild(b); return; }
  const mk = (t, d) => { const b = document.createElement('button'); b.className = 'chip'; b.textContent = t; b.onclick = () => { S.page = (S.page + d + P.length) % P.length; pick(); }; return b; };
  const lab = document.createElement('b'); lab.textContent = P[S.page].label + '  ' + (S.page + 1) + ' / ' + P.length; box.append(mk('‹', -1), lab, mk('›', 1)); }
function fit(){ const r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1); S.W = r.width; S.H = r.height; S.dpr = d; cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); }
function label(t, x, y, px, col){ g.font = '700 ' + px + 'px Fredoka, Nunito, sans-serif'; g.textAlign = 'center'; g.fillStyle = col || '#24324A'; let s = String(t); while(g.measureText(s).width > S.W / 4.6 && s.length > 6) s = s.slice(0, -2); g.fillText(s === String(t) ? s : s + '…', x, y); }
function stand(av, x, feet, k, t){ g.fillStyle = 'rgba(36,50,74,0.08)'; g.beginPath(); g.ellipse(x, feet + 2, 34 * k, 6 * k, 0, 0, 7); g.fill(); drawAvatar(g, {av, dir: 1}, x, feet, k, {t}); }
function row(ids, sub, t){ const n = ids.length, W = S.W, H = S.H, cols = (W < H * 0.9 && n >= 3) ? 2 : n, rows = Math.ceil(n / cols), cw = W / cols, ch = H / rows, k = Math.max(0.5, Math.min((ch - 52) / 118, cw / 62));
  ids.forEach((id, i) => { const c = i % cols, r = Math.floor(i / cols), x = cw * (c + 0.5), feet = r * ch + ch - 46 - 4 * k, av = A.dress(Object.assign({}, BASE, {outfitColor: (A.look(id).oc != null ? A.look(id).oc : BASE.outfitColor)}), id); stand(av, x, feet, k, t + i * 0.3); S.drawn.push(id);
    label(sub[i] || '', x, feet + 22, 13, '#7B5FE0'); label(A.info(id).name, x, feet + 40, 12); }); }
function icons(id, x0, y0, w, h){ const L = A.look(id), slots = L.slots.concat(L.kind === 'sky' ? ['acc2'] : []), n = slots.length, c = Math.min(w / n, h) * 0.9;
  slots.forEach((s, i) => { const x = x0 + (w / n) * (i + 0.5), ic = A.icon(id, s, Math.round(c * S.dpr)); g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect ? g.roundRect(x - c / 2, y0, c, c, 10) : g.rect(x - c / 2, y0, c, c); g.fill(); g.drawImage(ic, x - c / 2, y0, c, c); label(L.names[s] || '', x, y0 + c + 14, 11); }); }
const DRAW = {
  row(P, t){ row(P.ids, P.sub, t); },
  sky(P, t){ const W = S.W, H = S.H, k = Math.max(0.6, Math.min((H * 0.62) / 120, W / 4 / 62)), feet = H * 0.62; const id = P.ids[0], av = A.dress(Object.assign({}, BASE, {outfitColor: A.look(id).oc}), id); stand(av, W * 0.5, feet, k, t); S.drawn.push(id); icons(id, 12, feet + 18, W - 24, Math.max(40, H - feet - 44)); },
  mix(P, t){ const W = S.W, H = S.H, k = Math.max(0.6, Math.min((H - 60) / 120, W / 3 / 62)); const av = A.dress(BASE, S.mix); stand(av, W * 0.3, H * 0.5 + 44 * k, k, t); S.drawn.push('mix');
    const slots = A.SLOTS, x0 = W * 0.55, rh = Math.min(64, (H - 20) / slots.length); slots.forEach((s, i) => { const y = 10 + i * rh, id = S.mix[s]; g.fillStyle = id ? '#FFFFFF' : 'rgba(255,255,255,0.5)'; g.fillRect(x0, y, W - x0 - 12, rh - 6);
      if(id){ const c = rh - 10, ic = A.icon(id, s, Math.round(c * S.dpr)); g.drawImage(ic, x0 + 4, y + 2, c, c); } g.font = '700 13px Fredoka, Nunito, sans-serif'; g.textAlign = 'left'; g.fillStyle = '#24324A'; g.fillText((id ? A.info(id).names[s] : '🙈 hidden') + '', x0 + rh + 4, y + rh / 2 + 2); g.fillStyle = '#7B5FE0'; g.fillText(s, x0 + rh + 4, y + rh / 2 + 18); }); },
  drop(P, t){ const W = S.W, H = S.H, id = P.drop, L = A.look(id), n = L.slots.length; L.slots.forEach((s, i) => { const x = W * (i + 0.5) / n, y = H * 0.5, tw = Math.min(W / n * 0.9, 128); g.fillStyle = '#8FBF6E'; g.strokeStyle = '#2A1C14'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y - tw / 4); g.lineTo(x + tw / 2, y); g.lineTo(x, y + tw / 4); g.lineTo(x - tw / 2, y); g.closePath(); g.fill(); g.stroke();
      const ly = A.lying(id, s, 48); g.drawImage(ly, x - ly.width / 2, y - ly.height / 2 - 6); label(L.names[s] + ' · wr_' + s, x, y + tw / 4 + 22, 11); S.drawn.push(id + '/' + s); }); },
};
function frame(){ const t0 = performance.now(), t = t0 / 1000; S.drawn = [];
  g.setTransform(S.dpr, 0, 0, S.dpr, 0, 0); g.clearRect(0, 0, S.W, S.H);
  try { const P = pages()[S.page]; if(P){ if(P.mix) DRAW.mix(P, t); else if(P.drop) DRAW.drop(P, t); else if(P.icons) DRAW.sky(P, t); else DRAW.row(P, t); } S.err = null; } catch(e){ S.err = e.message; }
  $('note').textContent = '👕 ' + A.ids().length + ' looks · ' + A.VERSION + (S.err ? ' · ⚠️ ' + S.err : '');
  S.frameMs = S.frameMs * 0.9 + (performance.now() - t0) * 0.1; requestAnimationFrame(frame); }
chipRow($('views'), VIEWS, 'job', setView); setView('job');
fit(); window.addEventListener('resize', () => { fit(); pick(); });
window.WEAR_LAB = {S, setView, pages, shuffle};
requestAnimationFrame(frame);
})();
