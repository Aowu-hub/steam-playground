
window.ARSkills = (function(){ 'use strict';
let S, AR, $, sideOf, tip, showInfo, events, whoOf, varOf;
/* ================= 👑 R2.3 HERO SKILLS — page (ar-r2-3, plan §18n · look test ar-r2-3p) =================
   Dock (⚔️ 🛡️ 🌟 above the command bar) · 🎯 aim (Aowu 2026-11-20 15:09): 🙋 self = press only · 💥 area = press auto / DRAG a spot · 🎯 single = press current target / DRAG to lock ·
   drag onto ✕ = cancel, no wait · 👑 hero card rows (Lv 2 / 3 for ⭐ · 💎 refill) · casts painted on the beat (SkillKit.fx.draw + Motion.fx / Motion.status, nothing new painted) ·
   🌱 Basic glow + one 👆 + goal line · 🐣 glow only. Engine side: AR.castSkill / skillUp / meterRefill + events hero.skill · skill.hit · skill.walk · skill.full · skill.bounce · skill.stomp. */
const SKIN = {   // the side's own name · icon · look · kid line ({…} = SkillKit numbers at that level)
  raptor:  [{ic: '🦕', nm: 'Stampede', look: 'rock', ds: 'Rex charges the rival: {dmg} to everyone on the way.'}, {ic: '🥚', nm: 'Egg Nest', look: 'nature', ds: 'A shell dome round your hero: hits inside are cut by 70 % for {dur}s.'}, {ic: '🦖', nm: 'Mighty Roar', look: 'rock', ds: 'ROAR! Every rival near is dazed for {dur}s.'}],
  bolt:    [{ic: '⚡', nm: 'Laser Grid', look: 'storm', ds: 'A zap grid sits on a crowd: {dmg} a second for {dur}s.'}, {ic: '🔋', nm: 'Force Field', look: 'crystal', ds: 'The next {cnt} hits on your hero bounce back.'}, {ic: '🤖', nm: 'Mega Mech', look: 'steel', ds: 'Robo Boss turns into a big mech: half hits + STOMP for {dur}s.'}],
  kitchen: [{ic: '🍳', nm: 'Sizzle Pan', look: 'fire', ds: 'A hot pan flips onto a rival group: {dmg} each + 🔥 Toasty 2 s.'}, {ic: '🥘', nm: 'Pot-Lid Shield', look: 'gold', ds: 'Pot lids up! Your hero + 3 near take half hits for {dur}s.'}, {ic: '🍰', nm: 'Feast Time', look: 'honey', ds: 'Dinner time! Everyone heals and runs faster for 6 s.'}],
  horde:   [{ic: '🥧', nm: 'Food Fight', look: 'candy', ds: '{cnt} pies fly at rivals near: {dmg} each.'}, {ic: '🛍️', nm: 'Doggy Bag', look: 'nature', ds: 'Hurt friends near your hero pop home in a bag, healed.'}, {ic: '🍽️', nm: 'Bottomless Buffet', look: 'gold', ds: 'Hungry diners join the fight for 15 s.'}]};
const SKTYPE = {a: {ic: '⚔️', en: 'Attack'}, d: {ic: '🛡️', en: 'Guard'}, s: {ic: '🌟', en: 'Signature'}}, SKSQ = 0.56;
const skSide = t => (S.M && S.M.teams[t].side && SKIN[S.M.teams[t].side]) ? S.M.teams[t].side : 'raptor';
const skPic = (() => { const C = new Map(); return (ch, px) => { const k = ch + ':' + px; if(C.has(k)) return C.get(k); const c = document.createElement('canvas'); c.width = c.height = Math.round(px * 1.3); const g = c.getContext('2d');
  if(typeof emo === 'function') emo(g, ch, c.width / 2, c.height / 2, px); else { g.font = px + 'px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, c.width / 2, c.height / 2); } C.set(k, c); return c; }; })();
const skNowS = () => S.t || 0;
function skDesc(t, n, lv){ const S0 = AR.skillsOf(S.M.teams[t])[n], K = SKIN[skSide(t)][n], N = AR.skNum(S0.key, lv), mul = AR.SKILL_DMG[S0.key] || 1;
  return K.ds.replace(/\{(\w+)\}/g, (m, k) => k === 'dmg' ? Math.round(N.dmg * mul) : k === 'cnt' ? Math.round(N.cnt) : N[k] != null ? (Math.round(N[k] * 10) / 10) : m); }

/* ---------- 🎛️ the dock ---------- */
function skillDockBuild(){ let d = $('skdock'); if(d) d.remove(); d = document.createElement('div'); d.id = 'skdock'; const T = S.M.teams[0], sk = AR.skillsOf(T), K = SKIN[skSide(0)];
  d.innerHTML = sk.map((s, n) => '<button class="skb ' + s.c + '" data-n="' + n + '" aria-label="' + K[n].nm + '">' + (s.c === 's' ? '<span class="mt"></span>' : '') + '<img class="ic" alt="" src="' + skPic(K[n].ic, 96).toDataURL() + '">'
    + '<span class="ty">' + SKTYPE[s.c].ic + '</span><span class="pp"><i></i><i></i><i></i></span><span class="cd"><b></b></span><span class="nm">' + K[n].nm + '</span></button>').join('');
  $('scr-play').appendChild(d); d.querySelectorAll('.skb').forEach(b => skBind(b, +b.dataset.n)); S.skDock = d; skillLayout(); skillHud(true); }
function skillLayout(){ const d = $('skdock'); if(!d || !$('cmd')) return; const cmd = $('cmd').getBoundingClientRect(), small = Math.min(innerWidth, innerHeight) < 600, sz = small ? 52 : 64;
  d.style.setProperty('--sk', sz + 'px'); d.classList.toggle('small', small); const right = Math.max(8, Math.round(innerWidth - cmd.right + 6 + sz * 0.16 + 10));
  d.style.right = right + 'px'; d.style.bottom = Math.round(innerHeight - cmd.top + (small ? 14 : 30)) + 'px';
  const r = d.getBoundingClientRect(); if(r.top < S.top + 4) d.style.bottom = Math.round(innerHeight - (S.top + 4) - r.height) + 'px'; }
function skillHud(force){ const d = $('skdock'); if(!d || !S.M) return; const M = S.M, T = M.teams[0], hs = AR.hsOf(T), sk = AR.skillsOf(T), H = AR.heroUnit(M, 0);
  d.querySelectorAll('.skb').forEach(b => { const n = +b.dataset.n, s = sk[n], cd = hs.cd[n], tot = AR.cdFor(M, T, n), ready = AR.skillReady(M, 0, n) === true;
    b.querySelectorAll('.pp i').forEach((p, q) => p.classList.toggle('on', q < hs.lv[n]));
    const c = b.querySelector('.cd'), dead = !H; if(dead){ c.style.display = 'flex'; c.style.setProperty('--cd', '100%'); c.querySelector('b').textContent = T.heroT > 0 ? Math.ceil(T.heroT - M.t) : '👑'; }
    else if(s.c !== 's' && cd > 0){ c.style.display = 'flex'; c.style.setProperty('--cd', (cd / tot * 100).toFixed(1) + '%'); c.querySelector('b').textContent = Math.ceil(cd); } else c.style.display = 'none';
    if(s.c === 's'){ const m = b.querySelector('.mt'); m.style.setProperty('--m', Math.round(hs.m) + '%'); m.classList.toggle('full', hs.m >= 100); }
    b.classList.toggle('ready', ready && s.c === 's'); b.classList.toggle('off', !ready); });
  skillGuide(); }
// 🌱 Basic: the good button glows + ONE 👆 + a goal line (the page's own guide hand waits) · 🐣 Junior: glow only
function skillGuide(){ const M = S.M, d = $('skdock'); if(!d) return; let g = -1; const H = AR.heroUnit(M, 0);
  if(M.level <= 1 && H && !S.skAim){ const T = M.teams[0], sk = AR.skillsOf(T), near = AR.rivalsNear(M, 0, H.x, H.y, AR.SKILL_REACH + 1).length;
    sk.forEach((s, n) => { if(g >= 0 || AR.skillReady(M, 0, n) !== true) return; if(s.c === 'a' && near >= 3) g = n; else if(s.c === 'd' && near && H.hp < H.max * 0.5) g = n; else if(s.c === 's' && near >= 2) g = n; }); }
  d.querySelectorAll('.skb').forEach(b => b.classList.toggle('glow', +b.dataset.n === g));
  const basic = M.level === 0 && g >= 0; let hd = $('skhand'), gl = $('skgoal');
  if(basic){ const b = d.querySelector('[data-n="' + g + '"]').getBoundingClientRect(), K = SKIN[skSide(0)][g], why = ['A big rival group is close', 'Your hero is hurt', 'A big fight'][g];
    if(!hd){ hd = document.createElement('div'); hd.id = 'skhand'; hd.textContent = '👆'; $('scr-play').appendChild(hd); } if(!gl){ gl = document.createElement('div'); gl.id = 'skgoal'; $('scr-play').appendChild(gl); }
    hd.style.left = Math.round(b.left + b.width * 0.45) + 'px'; hd.style.top = Math.round(b.bottom - 8) + 'px'; gl.textContent = '🌱 ' + why + ' — tap ' + K.ic + ' ' + K.nm + '!';
    gl.style.right = Math.round(innerWidth - b.left + 10) + 'px'; gl.style.top = Math.round(b.top - 4) + 'px'; if(innerWidth < 600){ gl.style.right = '10px'; gl.style.top = Math.round(b.top - 44) + 'px'; }
    $('hand').style.visibility = 'hidden'; }
  else { if(hd) hd.remove(); if(gl) gl.remove(); $('hand').style.visibility = ''; } }

/* ---------- 🎯 press · drag · ✕ ---------- */
function skBind(b, n){ let d = null;
  b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if(!S.M || S.paused || S.M.over) return; try{ b.setPointerCapture(e.pointerId); }catch(_){} d = {x: e.clientX, y: e.clientY, moved: false}; b.classList.add('press'); });
  b.addEventListener('pointermove', e => { if(!d) return; const kind = AR.skillsOf(S.M.teams[0])[n].kind; if(!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12 && kind !== 'self'){ d.moved = true; skAimStart(n); } if(d.moved) skAimMove(e.clientX, e.clientY); });
  const up = e => { if(!d) return; const moved = d.moved; d = null; b.classList.remove('press'); if(moved) skAimEnd(); else skillPress(n); };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', () => { if(d && d.moved) skAimCancel(); d = null; b.classList.remove('press'); }); }
function skWhy(r, n){ const K = SKIN[skSide(0)][n]; return r === 'none' ? '🎯 No rivals near' : r === 'meter' ? '🌟 Fill the star ring first — your hero fills it by fighting' : r === 'wait' ? '⏱️ ' + K.nm + ' is getting ready' : r === 'hero' ? '👑 Your hero is on the way back' : '✗ Not now'; }
function skillPress(n, o){ const r = AR.castSkill(S.M, 0, n, o || {}); const b = document.querySelector('#skdock [data-n="' + n + '"]');
  if(r === true || r === 'walk'){ if(b){ b.classList.add('pop'); setTimeout(() => b.classList.remove('pop'), 160); try{ SkillKit.castPop(b); }catch(_){} } if(typeof UISound !== 'undefined') UISound.play('pop'); if(r === 'walk') tip('🏃 Out of reach — your hero runs in, then goes'); events(); skillHud(true); return true; }
  if(b){ b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 380); } tip(skWhy(r, n)); return false; }
function skAimStart(n){ const M = S.M, T = M.teams[0], s = AR.skillsOf(T)[n]; S.skAim = {n, kind: s.kind, at: null, lock: null, over: false, cx: 0, cy: 0};
  const x = document.createElement('div'); x.id = 'skx'; x.innerHTML = '✕<small>drop here = cancel</small>'; $('scr-play').appendChild(x); const dk = $('skdock').getBoundingClientRect(); x.style.left = Math.round(dk.left + 4) + 'px'; x.style.top = Math.round(dk.top - 96) + 'px';
  const h = document.createElement('div'); h.id = 'skhint'; $('scr-play').appendChild(h); skillGuide(); skAimHint(); }
function skAimHint(){ const A = S.skAim, h = $('skhint'); if(!A || !h) return; const far = A.lock && A.far, txt = A.over ? '✕ Let go = cancelled, no wait' : A.kind === 'area' ? (A.edge ? '💥 Too far — it lands at the edge of the ring' : '💥 Drag to pick a spot · let go = cast · ✕ = cancel')
    : far ? '🎯 Out of reach — your hero runs in, then goes' : A.lock ? '🎯 Locked · let go = go · ✕ = cancel' : '🎯 Drag over a rival to lock · ✕ = cancel';
  if(h.textContent !== txt) h.textContent = txt; h.classList.toggle('x', !!A.over); const x = $('skx').getBoundingClientRect();
  if(innerWidth >= 600){ h.style.right = Math.round(innerWidth - x.left + 12) + 'px'; h.style.top = Math.round(x.top + 16) + 'px'; } else { h.style.left = '10px'; h.style.right = 'auto'; h.style.top = Math.round(Math.max(S.top + 6, ($('mini').getBoundingClientRect().bottom || 100) + 8)) + 'px'; } }
function skAimMove(cx, cy){ const A = S.skAim; if(!A) return; const M = S.M, V = S.V, r = V.cv.getBoundingClientRect(), touch = matchMedia('(pointer:coarse)').matches, lift = touch ? 46 : 0, H = AR.heroUnit(M, 0);
  A.cx = cx; A.cy = cy; const xr = $('skx').getBoundingClientRect(); A.over = cx >= xr.left - 10 && cx <= xr.right + 10 && cy >= xr.top - 10 && cy <= xr.bottom + 10; $('skx').classList.toggle('on', A.over);
  const w = V.toWorld(cx - r.left, cy - r.top - lift); A.at = {x: w.x, y: w.y}; A.edge = false;
  if(H && A.kind === 'area'){ const c = AR.clampSpot(H, A.at); A.spot = c; A.edge = c.edge; }
  if(H && A.kind === 'single'){ let best = null, bd = 1.5; for(const o of AR.rivalsNear(M, 0, w.x, w.y, 1.6)){ const d = Math.hypot(o.x - w.x, o.y - w.y); if(d < bd){ bd = d; best = o; } } if(best) A.lock = best.id; const L = A.lock != null ? M.byId.get(A.lock) : null; A.far = !!(L && Math.hypot(L.x - H.x, L.y - H.y) > AR.SKILL_REACH); }
  // near the map edge the camera slides along (it never pans while you aim)
  const e = 36, dx = cx < r.left + e ? -1 : cx > r.right - e ? 1 : 0, dy = cy < r.top + S.top + e ? -1 : 0; if((dx || dy) && !A.over){ const c = V.toWorld(V.W / 2, V.H / 2); V.centerOn(c.x + dx * 0.25 + dy * 0.25, c.y - dx * 0.25 + dy * 0.25); }
  skAimHint(); }
function skAimEnd(){ const A = S.skAim; skAimClear(); if(!A) return; if(A.over){ tip('✕ Cancelled — no wait'); return; }
  if(A.kind === 'area' && A.at) skillPress(A.n, {at: A.at}); else if(A.kind === 'single') skillPress(A.n, A.lock != null ? {target: A.lock} : {}); else skillPress(A.n); }
function skAimCancel(){ skAimClear(); }
function skAimClear(){ S.skAim = null; ['skx', 'skhint'].forEach(id => { const n = $(id); if(n) n.remove(); }); skillGuide(); }

/* ---------- 👑 hero card rows ---------- */
function skillCardHtml(){ const M = S.M, T = M.teams[0], hs = AR.hsOf(T), sk = AR.skillsOf(T), K = SKIN[skSide(0)], side = sideOf(0), canUp = M.level >= 2;
  let h = '<div class="skrows">' + sk.map((s, n) => { const lv = hs.lv[n], cost = AR.SKILL_LV_COST[lv];
    const btn = lv >= 3 ? '<button class="sp-btn skup max" disabled>✨ Lv 3<br>max</button>' : canUp ? '<button class="sp-btn skup' + ((T.eco.s || 0) < cost ? ' short' : '') + '" data-skup="' + n + '">⬆️ Lv ' + (lv + 1) + '<br>' + side.res.s[0] + ' ' + cost + '</button>' : '';
    return '<div class="skrow"><span class="skbi ' + s.c + '"><img alt="" src="' + skPic(K[n].ic, 72).toDataURL() + '"></span><span class="skt"><b>' + K[n].nm + '</b><span class="pp">' + [1, 2, 3].map(q => '<i class="' + (q <= lv ? 'on' : '') + '"></i>').join('') + '</span><span class="skd">' + SKTYPE[s.c].ic + ' ' + skDesc(0, n, lv) + '</span></span>' + btn + '</div>'; }).join('') + '</div>';
  h += '<div class="skft"><span>' + (canUp ? side.res.s[0] + ' ' + Math.floor(T.eco.s || 0) + ' ' + side.res.s[1] : '⬆️ skill levels from 🔦 Intermediate') + '</span><span>🌟 ' + Math.round(hs.m) + ' %</span>'
    + (M.level >= 4 && hs.m < 100 ? '<button class="sp-btn sp-secondary" data-skfill="1">' + side.res.g[0] + ' ' + AR.SKILL_REFILL + ' → 🌟</button>' : '') + '</div>';
  return h; }
function skillCardBind(el, it, px, py){ el.classList.toggle('herocard', it.k === 'unit' && it.u.role === 'hero' && it.u.team === 0); el.querySelectorAll('[data-skup]').forEach(b => b.onclick = () => { const r = AR.skillUp(S.M, 0, +b.dataset.skup); tip(r === true ? '⬆️ ' + SKIN[skSide(0)][+b.dataset.skup].nm + ' got stronger!' : r === 'stars' ? '⭐ Not enough ' + sideOf(0).res.s[1] + ' yet' : '✗ Not now'); showInfo(it, px, py); skillHud(true); });
  el.querySelectorAll('[data-skfill]').forEach(b => b.onclick = () => { const r = AR.meterRefill(S.M, 0); tip(r === true ? '🌟 Full — your signature is ready!' : r === 'gems' ? '💎 Need ' + AR.SKILL_REFILL + ' ' + sideOf(0).res.g[1] : '✗ Not now'); showInfo(it, px, py); skillHud(true); }); }

/* ---------- 🎬 casts (the picture of each skill, on the same beat as the engine) ---------- */
function skItem(id){ return S.uit.get(id) || null; }
function skWho(u){ return whoOf(u.team, u.role, null, varOf(u)); }
function skSticker(html, x, y, col){ const V = S.V, r = V.cv.getBoundingClientRect(), p = V.toScreen(x, y, 0), el = document.createElement('div'); el.className = 'skstk'; el.innerHTML = html; el.style.setProperty('--c', col || '#FF8A3D');
  el.style.left = Math.max(70, Math.min(innerWidth - 70, p.x + r.left)) + 'px'; el.style.top = Math.max(S.top + 30, Math.min(S.dockTop - 40, p.y + r.top)) + 'px'; $('scr-play').appendChild(el); setTimeout(() => el.remove(), 2100); }
function skRibbon(t, n){ const K = SKIN[skSide(t)][n], side = sideOf(t), rib = document.createElement('div'); rib.className = 'skrib'; rib.innerHTML = '<img alt="" src="' + skPic(K.ic, 120).toDataURL() + '"><span>' + K.nm.toUpperCase() + '!<small>🌟 ' + side.role.hero + ' · signature</small></span>';
  $('scr-play').appendChild(rib); const top = Math.max(S.top + 10, innerWidth < 600 ? ($('mini').getBoundingClientRect().bottom || 0) + 10 : 0); rib.style.top = Math.round(top) + 'px'; const vg = document.createElement('div'); vg.className = 'skvig'; $('scr-play').appendChild(vg);
  setTimeout(() => { rib.classList.add('out'); vg.classList.add('out'); }, 1300); setTimeout(() => { rib.remove(); vg.remove(); }, 1700); }
function skillEvent(e){ const M = S.M; if(!M) return;
  if(e.k === 'hero.skill'){ const H = M.byId.get(M.units.find(u => u.team === e.team && u.role === 'hero') ? M.units.find(u => u.team === e.team && u.role === 'hero').id : -1), sp = S.speed || 1, K = SKIN[skSide(e.team)][e.n], key = AR.skillsOf(M.teams[e.team])[e.n].key;
    const V0 = {k: e.do, team: e.team, n: e.n, lv: e.lv, t0: S.t, ct: e.ct / sp, x: e.x, y: e.y, hx: e.hx, hy: e.hy, tid: e.tid, hero: H ? H.id : -1, ic: K.ic, look: K.look, N: AR.skNum(key, e.lv), mul: AR.SKILL_DMG[key] || 1, fx: [], ids: [], hitT: null};
    S.skv.push(V0); if(S.skv.length > 12) S.skv.shift();
    if(H){ const it = skItem(H.id), sh = (SkillKit.get(key) || {}).shape, ak = (SkillKit.actionOf && SkillKit.actionOf(sh)) || 'move.cast.raise'; if(it && typeof Acting !== 'undefined' && Acting.has && Acting.has('acts', ak)) try{ Iso.act(it, skWho(H), ak, {t: S.t, contactAt: S.t + V0.ct, speed: sp, size: 0.6, target: {x: e.x, y: e.y}}); }catch(_){} }
    if(e.team === 0 && e.c === 's') skRibbon(0, e.n); else if(e.team !== 0 && e.c === 's') skSticker('<img alt="" src="' + skPic(K.ic, 48).toDataURL() + '"> ' + sideOf(e.team).icon + ' ' + K.nm + '!', e.hx, e.hy - 1.5, '#E5484D'); }
  else if(e.k === 'skill.hit'){ const V0 = S.skv.slice().reverse().find(v => v.team === e.team && v.n === e.n && v.hitT == null); if(!V0) return; V0.hitT = S.t; V0.ids = e.ids || [];
    const mine = e.team === 0, dmg = (V0.k === 'pan' || V0.k === 'pies' || V0.k === 'charge') ? Math.round(V0.N.dmg * V0.mul) : 0;
    if(dmg) V0.ids.forEach((id, i) => { const u = M.byId.get(id); if(u) S.skPops.push({x: u.x + (i % 2 ? 0.25 : -0.25), y: u.y, z: 1.7 + (i % 3) * 0.25, t0: S.t + i * 0.08, txt: '−' + dmg}); });
    if(mine && V0.k !== 'nest' && V0.k !== 'field' && V0.k !== 'mech'){ const K = SKIN[skSide(0)][e.n], n = V0.ids.length, w = {pan: 'toasty', pies: 'hit', grid: 'zapped', charge: 'hit', roar: 'dazed', lids: 'guarded', feast: 'fed', bag: 'home safe', buffet: 'diners'}[V0.k] || 'hit';
      skSticker('<img alt="" src="' + skPic(K.ic, 48).toDataURL() + '"> ' + K.nm + '! <small>· ' + n + ' ' + w + '</small>', e.x + 1.4, e.y - 2, ['#FF8A3D', '#1E9E5E', '#E89A0C'][e.n]); } }
  else if(e.k === 'skill.bounce'){ const V0 = S.skv.slice().reverse().find(v => v.team === e.team && v.k === 'field'); if(V0) V0.bounces = (V0.bounces || []).concat([{x: e.x, y: e.y, t: S.t}]); }
  else if(e.k === 'skill.stomp'){ const V0 = S.skv.slice().reverse().find(v => v.team === e.team && v.k === 'mech'); if(V0) V0.stomps = (V0.stomps || []).concat([{x: e.x, y: e.y, t: S.t}]); }
  else if(e.k === 'skill.full' && e.team === 0){ tip('🌟 Your signature is ready!'); skillHud(true); } }
function skRing(g, cx, cy, r, o){ g.beginPath(); for(let i = 0; i <= 40; i++){ const a = i / 40 * Math.PI * 2, P = S.V.toScreen(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0); if(i) g.lineTo(P.x, P.y); else g.moveTo(P.x, P.y); } g.closePath();
  if(o.fill){ g.fillStyle = o.fill; g.fill(); } if(o.stroke){ g.lineWidth = o.w || 2.5; g.setLineDash(o.dash || []); g.lineDashOffset = o.off || 0; g.strokeStyle = o.stroke; g.stroke(); g.setLineDash([]); } }
const skNow = () => performance.now() / 1000;
function skMfx(V0, kind, o){ try{ const E = Motion.fx(kind, Object.assign({t0: skNow()}, o)); if(E) V0.fx.push(E); }catch(_){} }
function skillGround(g, V){ if(!S.M) return; const t = S.t, k = V.zoom, M = S.M;
  // 🎯 aiming: reach ring + area ghost / charge line
  const A = S.skAim, H0 = AR.heroUnit(M, 0); if(A && H0){ skRing(g, H0.x, H0.y, AR.SKILL_REACH, {fill: 'rgba(255,255,255,0.07)', stroke: 'rgba(255,255,255,0.85)', dash: [10, 8], off: -t * 30});
    if(!A.over && A.kind === 'area' && A.spot){ const n = AR.skillsOf(M.teams[0])[A.n], N = AR.skNum(n.key, AR.hsOf(M.teams[0]).lv[A.n]), r = n.do === 'pies' ? 2.2 : n.do === 'buffet' ? 1.5 : (N.r || 1.6);
      skRing(g, A.spot.x, A.spot.y, r, {fill: A.edge ? 'rgba(255,170,60,0.30)' : 'rgba(255,90,31,0.30)', stroke: '#FF5A1F', w: 3.5, dash: [9, 6], off: -t * 40}); skRing(g, A.spot.x, A.spot.y, r * (0.35 + 0.1 * Math.sin(t * 5)), {stroke: 'rgba(255,255,255,0.8)', w: 2}); }
    if(!A.over && A.kind === 'single' && A.lock != null){ const L = M.byId.get(A.lock); if(L){ const a = V.toScreen(H0.x, H0.y, 0), b = V.toScreen(L.x, L.y, 0); g.save(); g.strokeStyle = A.far ? '#FF4D6D' : '#E8341C'; g.globalAlpha = 0.5; g.lineWidth = 6 * k; g.setLineDash([14, 10]); g.lineDashOffset = -t * 50; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.restore(); } } }
  for(const v of S.skv){ const q = t - v.t0, hq = v.hitT == null ? -1 : t - v.hitT, P = V.toScreen(v.x, v.y, 0), R0 = r => r * 32 * k;
    if(v.k === 'pan' || v.k === 'pies' || v.k === 'buffet' || v.k === 'grid'){ const r = v.k === 'pies' ? 2.2 : v.k === 'buffet' ? 1.5 : (v.N.r || 1.6);
      if(hq < 0 && q < v.ct + 0.1){ const qq = Math.min(1, q / 0.28); skRing(g, v.x, v.y, r * (0.55 + 0.45 * qq), {fill: 'rgba(255,138,61,' + (0.12 + 0.2 * Math.min(1, q / Math.max(0.1, v.ct))).toFixed(3) + ')', stroke: v.team === 0 ? '#FF5A1F' : '#E5484D', w: 3, dash: [9, 7], off: -t * 40}); }
      else if(hq >= 0 && hq < 0.8 && v.k !== 'grid') SkillKit.fx.draw(g, {shape: v.k === 'buffet' ? 'summon' : 'splash', look: v.look, p: Math.min(1, hq / 0.7), t, x: P.x, y: P.y, r: R0(r) * 1.05, sq: SKSQ, seed: 5}); }
    if(v.k === 'grid' && hq >= 0 && hq < v.N.dur) SkillKit.fx.draw(g, {shape: 'zone', look: 'storm', p: Math.min(1, hq / v.N.dur), t, x: P.x, y: P.y, r: R0(v.N.r), sq: SKSQ, seed: 7});
    if(v.k === 'roar' && q >= 0){ const Hh = V.toScreen(v.hx, v.hy, 0), RR = R0((v.N.r || 1.6) * 2);
      if(hq < 0){ const qq = Math.min(1, q / Math.max(0.1, v.ct)); g.save(); g.translate(Hh.x, Hh.y); g.scale(1, SKSQ); for(let i = 0; i < 14; i++){ const a = i / 14 * 6.283 + i * 0.7, d = RR * (1 - qq) * (0.6 + (i % 3) * 0.2); g.globalAlpha = 0.5 * qq; g.fillStyle = '#E8D2A8'; g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, (3 + (i % 3)) * k, 0, 7); g.fill(); } g.restore(); }
      else for(let w = 0; w < 3; w++){ const p = (hq - w * 0.16) / 0.75; if(p < 0 || p > 1) continue; g.save(); g.translate(Hh.x, Hh.y); g.scale(1, SKSQ); g.globalAlpha = (1 - p) * 0.85; g.lineWidth = (10 - w * 2.5) * k * (1 - p * 0.6); g.strokeStyle = w ? '#F1E2C8' : '#FFFFFF'; g.beginPath(); g.arc(0, 0, RR * (0.15 + p * 0.9), 0, 7); g.stroke(); g.restore(); } }
    if(v.k === 'charge' && q >= 0 && q < v.ct + 0.6){ const a = V.toScreen(v.hx, v.hy, 0), p = Math.min(1, q / Math.max(0.1, v.ct)); SkillKit.fx.draw(g, {shape: 'beam', look: 'rock', p: 0.2 + p * 0.6, t, x: a.x, y: a.y, x2: P.x, y2: P.y, w: 18 * k, sq: SKSQ, seed: 3}); }
    if(v.k === 'nest' && hq >= 0 && hq < v.N.dur){ const u = M.byId.get(v.hero), it = u ? skItem(u.id) : null; if(it){ const Q = V.toScreen(it.x, it.y, 0); SkillKit.fx.draw(g, {shape: 'dome', look: 'nature', p: Math.min(1, hq / v.N.dur), t, x: Q.x, y: Q.y, r: R0(2), sq: SKSQ, seed: 9}); } } } }
function skillOver(g, V){ if(!S.M) return; const t = S.t, k = V.zoom, M = S.M, now = skNow();
  const A = S.skAim; if(A && !A.over && A.kind === 'single' && A.lock != null){ const it = skItem(A.lock); if(it){ const Q = V.toScreen(it.x, it.y, 0.9); g.save(); g.translate(Q.x, Q.y); g.rotate(Math.sin(t * 2) * 0.12); g.strokeStyle = A.far ? '#FF4D6D' : '#FFE45C'; g.lineWidth = 4; g.lineCap = 'round'; const s = (24 + 2 * Math.sin(t * 6)) * k;
      for(let q = 0; q < 4; q++){ g.save(); g.rotate(q * Math.PI / 2); g.beginPath(); g.moveTo(-s, -s * 0.45); g.lineTo(-s, -s); g.lineTo(-s * 0.45, -s); g.stroke(); g.restore(); } g.restore(); } }
  if(A && !A.over && A.kind === 'area' && A.spot){ const P = V.toScreen(A.spot.x, A.spot.y, 0.2), pic = skPic(SKIN[skSide(0)][A.n].ic, 80), z = 40 * k; g.drawImage(pic, P.x - z / 2, P.y - z / 2 - 6 * k, z, z); }
  for(let i = S.skv.length - 1; i >= 0; i--){ const v = S.skv[i], q = t - v.t0, hq = v.hitT == null ? -1 : t - v.hitT, P = V.toScreen(v.x, v.y, 0), pic = skPic(v.ic, 120), life = Math.max(v.ct + 2.5, (v.N.dur || 0) + 1.5);
    if(q > life){ S.skv.splice(i, 1); continue; }
    const H = M.byId.get(v.hero), Hi = H ? skItem(H.id) : null, Hp = Hi ? V.toScreen(Hi.x, Hi.y, 1.4) : V.toScreen(v.hx, v.hy, 1.4);
    // ✈️ things that fly from the hero to the spot (🍳 pan · 🥧 pies)
    if((v.k === 'pan' || v.k === 'pies') && hq < 0){ const f0 = v.k === 'pan' ? 0.3 / 0.92 : 0.2, qq = Math.max(0, Math.min(1, (q / Math.max(0.1, v.ct) - f0) / (1 - f0))); if(q / Math.max(0.1, v.ct) > f0){
        const pts = v.k === 'pan' ? [[0, 0]] : [[0, 0], [0.7, -0.4], [-0.5, 0.5], [0.4, 0.7], [-0.7, -0.3], [0.1, -0.8]].slice(0, Math.round(v.N.cnt || 6));
        pts.forEach((o, j) => { const T2 = V.toScreen(v.x + o[0], v.y + o[1], 0), x = Hp.x + (T2.x - Hp.x) * qq, y = Hp.y + (T2.y - Hp.y) * qq - Math.sin(qq * Math.PI) * (v.k === 'pan' ? 120 : 80 + j * 8) * k, sz = (v.k === 'pan' ? 52 : 30) * k;
          if(v.k === 'pan'){ g.save(); g.globalCompositeOperation = 'lighter'; for(let w = 1; w <= 6; w++){ const q2 = Math.max(0, qq - w * 0.035), xx = Hp.x + (T2.x - Hp.x) * q2, yy = Hp.y + (T2.y - Hp.y) * q2 - Math.sin(q2 * Math.PI) * 120 * k; g.globalAlpha = 0.3 * (1 - w / 7); g.fillStyle = w < 3 ? '#FFF4B8' : '#FF8A3D'; g.beginPath(); g.arc(xx, yy, (16 - w * 1.6) * k, 0, 7); g.fill(); } g.restore(); }
          g.save(); g.translate(x, y); g.rotate(qq * Math.PI * 2.5 - 0.4 + j); g.drawImage(pic, -sz / 2, -sz / 2, sz, sz); g.restore(); }); } }
    // 💥 CONTACT: Motion.fx by skill (made once)
    if(hq >= 0 && !v.boom){ v.boom = 1; const kk = k * 0.9;
      if(v.k === 'pan'){ skMfx(v, 'eruption', {x: P.x, y: P.y, k: kk, element: 'fire', seed: 4}); skMfx(v, 'sparks', {x: P.x, y: P.y - 14 * k, k: kk, element: 'fire', seed: 9, n: 26}); }
      else if(v.k === 'pies'){ skMfx(v, 'sparks', {x: P.x, y: P.y - 10 * k, k: kk, element: 'candy', seed: 3, n: 30}); }
      else if(v.k === 'grid'){ skMfx(v, 'crackle', {x: P.x, y: P.y - 20 * k, k: kk, element: 'zap', ms: v.N.dur * 1000, r: (v.N.r || 1.5) * 32 * k}); }
      else if(v.k === 'charge'){ skMfx(v, 'clash', {x: P.x, y: P.y - 24 * k, k: kk, element: 'light', seed: 2}); skMfx(v, 'ground', {x: P.x, y: P.y, k: kk, element: 'stone', seed: 5}); }
      else if(v.k === 'roar'){ const Hh = V.toScreen(v.hx, v.hy, 0), Pq = V.toScreen(v.hx + 1.1, v.hy + 0.1, 0); skMfx(v, 'quake', {x: Pq.x, y: Pq.y, k: k * 0.8, seed: 3}); skMfx(v, 'gust', {x: Hh.x + 40 * k, y: Hh.y - 40 * k, k: kk, dir: 1, seed: 5}); }
      else if(v.k === 'feast' || v.k === 'buffet'){ skMfx(v, 'sparks', {x: P.x, y: P.y - 20 * k, k: kk, element: 'light', seed: 6, n: 24}); }
      else if(v.k === 'bag'){ v.ids.forEach((id, j) => { const it = skItem(id); if(it){ const Q = V.toScreen(it.x, it.y, 0); skMfx(v, 'puff', {x: Q.x, y: Q.y - 20 * k, k: kk, seed: j}); } }); }
      // statuses on the bodies hit (never on the face — F11)
      const st = {pan: 'toasty', grid: 'zapped', roar: 'dizzy'}[v.k], ms = v.k === 'pan' ? 2000 : v.k === 'grid' ? v.N.dur * 1000 : v.k === 'roar' ? v.N.dur * 1000 : 0;
      if(st) v.sts = v.ids.map(id => { try{ return {id, E: Motion.status(st, {x: 0, y: 0, w: 22, h: 40, k: k * 0.42, ms, t0: now})}; }catch(_){ return null; } }).filter(Boolean); }
    v.fx.forEach(E => { try{ Motion.drawFx(g, E, now); }catch(_){} });
    (v.sts || []).forEach(s => { const it = skItem(s.id); if(!it || !s.E) return; const Q = V.toScreen(it.x, it.y, it.z); try{ s.E.move(Q.x, Q.y); Motion.drawFx(g, s.E, now); }catch(_){} });
    if(v.k === 'roar' && hq >= 0 && hq < v.N.dur) v.ids.forEach((id, j) => { const it = skItem(id); if(!it) return; const Q = V.toScreen(it.x, it.y, it.z); SkillKit.fx.draw(g, {shape: 'daze', look: 'star', p: Math.min(1, hq / v.N.dur), t, x: Q.x, y: Q.y, r: 16 * k, h: 50 * k, sq: SKSQ, n: 4, seed: 11 + j}); });
    // 🛡️ guards that ride the bodies (🥘 lids · 🔋 field · 🤖 mech)
    const guardOn = (id, look, r, h) => { const it = skItem(id); if(!it) return; const Q = V.toScreen(it.x, it.y, 0); SkillKit.fx.draw(g, {shape: 'shield', look, n: 4, p: 0.12 + Math.min(0.4, Math.max(0, hq) / 2), t, x: Q.x, y: Q.y + 4 * k, r: r * k, h: h * k, sq: 0.6, seed: 3 + (id % 7)}); };
    if(v.k === 'lids' && hq >= 0 && hq < v.N.dur) v.ids.forEach(id => guardOn(id, 'gold', id === v.hero ? 30 : 24, id === v.hero ? 84 : 66));
    if(v.k === 'field' && hq >= 0 && hq < v.N.dur && H && H.reflect > 0) guardOn(H.id, 'crystal', 32, 86);
    if(v.k === 'mech' && hq >= 0 && hq < v.N.dur && H){ const it = skItem(H.id); if(it){ const Q = V.toScreen(it.x, it.y, 0); SkillKit.fx.draw(g, {shape: 'aura', look: 'steel', p: Math.min(1, hq / v.N.dur), t, x: Q.x, y: Q.y, r: 40 * k, h: 100 * k, sq: SKSQ, seed: 4}); } }
    (v.bounces || []).forEach(b => { if(!b.E){ const Q = V.toScreen(b.x, b.y, 0); try{ b.E = Motion.fx('clash', {x: Q.x, y: Q.y - 24 * k, k: k * 0.7, element: 'light', t0: now}); }catch(_){} } if(b.E) try{ Motion.drawFx(g, b.E, now); }catch(_){} });
    (v.stomps || []).forEach(b => { if(!b.E){ const Q = V.toScreen(b.x, b.y, 0); try{ b.E = Motion.fx('quake', {x: Q.x, y: Q.y, k: k * 0.7, t0: now}); }catch(_){} } if(b.E) try{ Motion.drawFx(g, b.E, now); }catch(_){} });
    if(v.k === 'feast' && hq >= 0 && hq < 1.2) v.ids.slice(0, 20).forEach((id, j) => { const it = skItem(id); if(!it) return; const Q = V.toScreen(it.x, it.y, 0); SkillKit.fx.draw(g, {shape: 'heal', look: 'honey', p: Math.min(1, hq / 1.2), t, x: Q.x, y: Q.y, r: 18 * k, sq: SKSQ, seed: j}); });
    // 🍳 follow-through: the pan bounces away
    if(v.k === 'pan' && hq >= 0 && hq < 0.75){ const qq = hq / 0.75, x = P.x + qq * 34 * k, y = P.y - Math.sin(qq * Math.PI) * 46 * k - 8 * k, sz = 48 * k * (1 - qq * 0.35); g.save(); g.globalAlpha = 1 - qq * qq; g.translate(x, y); g.rotate(-0.4 + qq * 5); g.drawImage(pic, -sz / 2, -sz / 2, sz, sz); g.restore(); }
    if(v.k === 'bag' && q < 1){ const sz = 40 * k, y = Hp.y - 30 * k - Math.sin(Math.min(1, q) * Math.PI) * 20 * k; g.save(); g.globalAlpha = 1 - Math.max(0, q - 0.7) / 0.3; g.drawImage(skPic('🛍️', 80), Hp.x - sz / 2, y - sz / 2, sz, sz); g.restore(); } }
  // 💥 damage pops (small, staggered)
  for(let i = S.skPops.length - 1; i >= 0; i--){ const p = S.skPops[i], q = (t - p.t0) / 0.9; if(q > 1){ S.skPops.splice(i, 1); continue; } if(q < 0) continue; const a = q < 0.7 ? 1 : 1 - (q - 0.7) / 0.3, up = (1 - Math.pow(1 - q, 3)) * 26 * k, pop = q < 0.12 ? 0.6 + q / 0.12 * 0.6 : q < 0.24 ? 1.2 - (q - 0.12) / 0.12 * 0.2 : 1, P = V.toScreen(p.x, p.y, p.z);
    g.save(); g.globalAlpha = a; g.font = '800 ' + Math.round(14 * k * pop) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4 * k; g.strokeStyle = '#2A1C14'; g.lineJoin = 'round'; g.strokeText(p.txt, P.x, P.y - up); g.fillStyle = '#FFE45C'; g.fillText(p.txt, P.x, P.y - up); g.restore(); }
  // 👆 the finger while aiming (+ a soft string from the held button)
  if(A){ const r = V.cv.getBoundingClientRect(), b = document.querySelector('#skdock [data-n="' + A.n + '"]'); if(b){ const br = b.getBoundingClientRect(), B0 = {x: br.left + br.width / 2 - r.left, y: br.top + br.height / 2 - r.top}, F = {x: A.cx - r.left, y: A.cy - r.top};
      g.save(); g.strokeStyle = A.over ? 'rgba(229,72,77,.8)' : 'rgba(255,255,255,.9)'; g.lineWidth = 3; g.setLineDash([3, 7]); g.lineCap = 'round'; g.beginPath(); g.moveTo(B0.x, B0.y); g.quadraticCurveTo((B0.x + F.x) / 2, Math.min(B0.y, F.y) - 60, F.x, F.y - 10); g.stroke(); g.restore(); } } }

function init(api){ ({S, AR, $, sideOf, tip, showInfo, events, whoOf, varOf} = api); S.skv = []; S.skPops = []; if(typeof SkillKit !== 'undefined') AR.useSkills(SkillKit);
  return {skillEvent, skillGround, skillOver, skillDockBuild, skillHud, skillLayout, skillCardHtml, skillCardBind, skillPress, skAimStart, skAimMove, skAimEnd, skAimClear, SKIN}; }
return {init}; })();
