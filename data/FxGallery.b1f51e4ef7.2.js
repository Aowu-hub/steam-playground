
const CURRENT_PLAYER = SP_TV[0]; window.SP_PAGE = SP_TV[1];
const ME = CURRENT_PLAYER && CURRENT_PLAYER.indexOf('<?') < 0 ? CURRENT_PLAYER : 'Mia', BUDDY = ME === 'Ben' ? 'Mia' : 'Ben';
const $ = id => document.getElementById(id), cv = $('cv'), g = cv.getContext('2d');
const me = {name: ME, av: defaultAvatar(ME), dir: 1}, bud = {name: BUDDY, av: defaultAvatar(BUDDY), dir: -1};
const PLAIN = me.av, SWORD = (() => { const a = JSON.parse(JSON.stringify(me.av)); a.eq = a.eq || {}; a.eq.hand = {id: 'sword', v: 2, o: {blade: 1}}; return a; })();
let fam = 'punch', element = '', runA = null, runB = null, W = 0, H = 0, dpr = 1, queue = [];
const FAMS = Object.keys(ActionFX.FAM);
function fit(){ dpr = Math.min(2, window.devicePixelRatio || 1); const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
const geo = () => { const k = Math.max(0.9, Math.min(2.6, H / 130, W / 300)), gy = H - Math.max(26, H * 0.14); return {k, gy, ax: W / 2 - 50 * k, bx: W / 2 + 46 * k}; };
function moveName(key){ const st = ActionFX.style(key.replace('move.', '')); return st ? st.icon + ' ' + st.name : key; }
function play(key){ const G = geo(), t = performance.now() / 1000; ActionFX.opts.calm = !!(window.FXCALM);
  document.querySelectorAll('.mv').forEach(b => b.classList.toggle('on', b.dataset.k === key));
  const fam0 = key.split('.')[1]; me.av = fam0 === 'slash' || fam0 === 'jump' ? SWORD : PLAIN;   // ⚔️ slashes + jump attacks: a sword in the hand (games keep their own item)
  const isReact = fam0 === 'react', rk = isReact ? key : ActionFX.reactFor(key);
  runA = runB = null;
  if(fam0 === 'defend'){   // 🛡️ the buddy attacks; my defend lands its contact on the buddy's contact
    const a = Acting.play(bud, 'move.punch.straight', {t0: 0}), d = Acting.play(me, key, {t0: 0}), lag = Math.max(0, (a.contactMs - d.contactMs) / 1000), lead = Math.max(0, (d.contactMs - a.contactMs) / 1000);
    runB = Acting.play(bud, 'move.punch.straight', {t0: t + lead}); runA = ActionFX.play(me, key, {t0: t + lag, x: G.ax, y: G.gy, k: G.k, dir: 1, element});
    $('now').innerHTML = moveName(key) + '<small>the buddy throws a 👊 straight — you defend</small>'; return; }
  const atk = isReact ? 'move.punch.straight' : key;
  runA = ActionFX.play(me, atk, {t0: t, x: G.ax, y: G.gy, k: G.k, dir: 1, element, onContact: r => { if(rk) runB = ActionFX.play(bud, rk, {t0: r.contactT, x: G.bx, y: G.gy, k: G.k, dir: -1, element}); }});
  $('now').innerHTML = moveName(isReact ? rk : key) + '<small>' + (isReact ? 'the buddy reacts to a 👊 straight' : rk ? 'the buddy: ' + moveName(rk) : 'a self move — nobody is hit') + '</small>'; }
function frame(){ const t = performance.now() / 1000; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); const G = geo();
  g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(0, G.gy, W, H - G.gy); g.save(); const sh = ActionFX.shake(t); g.translate(sh.x, sh.y);
  const fa = runA && !runA.done ? runA.at(t) : null, fb = runB && !runB.done ? runB.at(t) : null;
  Acting.draw(g, me, G.ax, G.gy, G.k, fa || 'idle', {t}); Acting.draw(g, bud, G.bx, G.gy, G.k, fb || 'idle', {t, dir: -1});
  ActionFX.draw(g, t); g.restore();
  if(runA && runA.done && (!runB || runB.done) && queue.length){ const k = queue.shift(); play(k); }
  requestAnimationFrame(frame); }
function renderTabs(){ $('tabs').innerHTML = FAMS.map(f => '<button class="tab' + (f === fam ? ' on' : '') + '" data-f="' + f + '" data-sound="tap">' + ActionFX.FAM[f][0] + ' ' + ActionFX.FAM[f][1] + '</button>').join('') + '<button class="tab" id="all" data-sound="tap">▶ Play all</button>';
  $('tabs').querySelectorAll('.tab[data-f]').forEach(b => b.onclick = () => { fam = b.dataset.f; renderTabs(); renderMoves(); });
  $('all').onclick = () => { queue = ActionFX.list(fam).map(k => 'move.' + k).filter(k => Acting.act(k)); play(queue.shift()); }; }
function renderMoves(){ $('moves').innerHTML = ActionFX.list(fam).filter(k => Acting.act('move.' + k)).map(k => { const st = ActionFX.style(k); return '<button class="mv" data-k="move.' + k + '" data-sound="none"><b>' + st.icon + '</b>' + st.name + '</button>'; }).join('');
  $('moves').querySelectorAll('.mv').forEach(b => b.onclick = () => { queue = []; play(b.dataset.k); }); }
function renderEls(){ const L = [['', '🎨 Own colours']].concat(Object.keys(ActionFX.EL).map(e => [e, {fire: '🔥', ice: '❄️', zap: '⚡', nature: '🌿', light: '☀️', shadow: '🌙', candy: '🍬', water: '🌊'}[e] + ' ' + e]));
  $('els').innerHTML = L.map(([k, n]) => '<button class="chip' + (k === element ? ' on' : '') + '" data-k="' + k + '" data-sound="tap">' + n + '</button>').join('');
  $('els').querySelectorAll('.chip').forEach(b => b.onclick = () => { element = b.dataset.k; renderEls(); }); }
function renderOpts(){ const O = ActionFX.opts; $('opts').innerHTML = [['words', '💬 Words'], ['shake', '📳 Shake'], ['calm', '🌙 Calm']].map(([k, n]) => '<button class="chip' + (O[k] ? ' on' : '') + '" data-k="' + k + '" data-sound="tap">' + n + '</button>').join('');
  $('opts').querySelectorAll('.chip').forEach(b => b.onclick = () => { O[b.dataset.k] = !O[b.dataset.k]; renderOpts(); }); }
$('back').onclick = () => { if(window.UI && UI.back) UI.back(); else history.back(); };
if(window.UI && UI.backLabel){ try{ $('back').textContent = UI.backLabel(); }catch(e){} }
addEventListener('resize', fit); if(window.ResizeObserver) new ResizeObserver(fit).observe(cv);
fit(); renderTabs(); renderMoves(); renderEls(); renderOpts(); requestAnimationFrame(frame);
