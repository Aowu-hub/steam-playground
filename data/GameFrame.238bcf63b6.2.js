
/* 🧱 GameFrame (B1b) — see the comment at the top of this file. */
(function(root){
  'use strict';
  const LOG = root.GF_LOG = root.GF_LOG || [];
  const now = () => performance.now() / 1000;
  const esc = s => (root.UI && UI.esc) ? UI.esc(s) : String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const story = t => esc(t || '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const fixA = a => { try { return a ? fixAv(a) : null; } catch(e){ return a; } };
  const defA = n => { try { return defaultAvatar(n || 'player'); } catch(e){ return {}; } };
  const sound = k => { try { if(root.UISound) UISound.play(k); } catch(e){} };
  const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){ return false; } };
  const MEDAL = ['🥇', '🥈', '🥉'];
  const BOARDS = [['best', '🏆 Best score'], ['week', '📅 This week'], ['improved', '📈 Most improved'], ['played', '🎮 Most played']];
  const BOARD_MS = 9000;

  // 🎭 one avatar that acts: a beat act now and then, its Signature act / idle in between (cached by AvatarActing)
  function actor(name, av, pool){
    return {who: {name, av, dir: 1}, pool: pool || ['beat.wave', 'beat.cheer', 'beat.jump'], run: null, hold: null, next: now() + 0.4 + Math.random() * 1.6, enter: 0};
  }
  // 🎭 b2fix (Aowu 11:30): each turn = the avatar's OWN 🎭 Signature act 20 % · a random shared act or pose 80 %
  const SIG_SHARE = 0.2, SKIP = /hit|tantrum|ghost|sad|cry|lose|sulk|bite-nails|hands-head|scratch-head|oh-well|^pkp\./;
  let RANDOM = null;
  function randomPool(A){ if(!RANDOM){ try { RANDOM = Acting.shared().map(x => x.k).filter(k => !SKIP.test(k)); } catch(e){ RANDOM = []; } } return RANDOM.concat(A.pool); }
  function nextTurn(A, t){
    const sig = Acting.sig ? Acting.sig(A.who.av) : 'idle';
    if(reduced()){ A.hold = {key: sig, until: t + 999, kind: 'sig'}; return; }
    if(Math.random() < SIG_SHARE){ A.hold = {key: sig, until: t + 2.6 + Math.random() * 1.4, kind: 'sig'}; LOG.push('turn:' + A.who.name + ':sig'); return; }
    const L = randomPool(A), k = L[Math.floor(Math.random() * L.length)] || 'idle'; LOG.push('turn:' + A.who.name + ':rnd');
    if(Acting.beatsOf && Acting.beatsOf(k)) playAct(A, k); else A.hold = {key: k, until: t + 2.2 + Math.random() * 1.2, kind: 'rnd'};
  }
  function playAct(A, key, o){
    if(!root.Acting || !Acting.play) return null;
    try { A.run = Acting.play(A.who, key, Object.assign({t0: now()}, o || {})); A.next = 1e9; LOG.push('act:' + A.who.name + ':' + key); return A.run; } catch(e){ A.run = null; return null; }
  }
  function drawActor(g, A, x, y, k, t, idleKey){
    if(!root.Acting) return;
    if(A.run && A.run.done){ A.run = null; A.hold = null; A.next = t + 0.25; }
    if(!A.run && (!A.hold || t >= A.hold.until) && t >= A.next){ A.hold = null; nextTurn(A, t); }   /* 🎭 b2fix */
    try { if(A.run) Acting.draw(g, A.who, x, y, k, A.run.at(t), {t}); else Acting.draw(g, A.who, x, y, k, A.hold ? A.hold.key : (idleKey || 'idle'), {t}); } catch(e){}
  }

  function cover(host, o){
    o = Object.assign({seats: {min: 1, max: 1}, backTo: 'gameroom', acts: []}, o || {});
    const id = o.game, CA = root.CardArt || {}, art = (CA.ART && CA.ART[id]) || {};
    const c1 = o.c1 || art.c1 || '#FF8A3D', c2 = o.c2 || art.c2 || '#7C3AED', max = Math.max(1, (o.seats && o.seats.max) || 1);
    const help = o.help || (root.UI && UI.GAME_HELP && UI.GAME_HELP[id]) || [];
    const hasDemo = !!(CA.hasDemo && CA.hasDemo(id));
    const el = document.createElement('div'); el.className = 'gf-cover'; el.dataset.game = id;
    el.style.setProperty('--gf-c1', c1); el.style.setProperty('--gf-c2', c2); el.style.setProperty('--game-a', c1); el.style.setProperty('--game-b', c2);
    const backLabel = (root.UI && UI.backLabel) ? UI.backLabel(o.backTo) : '◀ Back';
    el.innerHTML = '<div class="gf-art"><canvas class="gf-cv"></canvas>' +
      '<button class="sp-btn sp-secondary sp-sm gf-back" data-sound="none" style="width:auto;min-height:38px">' + esc(backLabel) + '</button>' +
      '<div class="gf-title"><h1><span class="gf-ic">' + esc(o.icon || '') + '</span>' + esc(o.title || id) + '</h1><p>' + story(o.story || (CA.STORY && CA.STORY[id]) || '') + '</p>' +
      '<div class="gf-board" hidden><span class="gf-bn"></span><i></i></div></div></div>' +
      '<div class="gf-panel"><div class="gf-hi"></div><div class="gf-line"></div>' +
      '<div class="gf-btns"><button class="sp-btn sp-primary gf-play" data-sound="none">▶ Play</button>' +
      '<div class="gf-row gf-saves" hidden><button class="sp-btn sp-secondary gf-cont" data-sound="tap">⏩ Continue</button><button class="sp-btn sp-secondary gf-load" data-sound="tap">📂 Load</button></div>' +
      '<div class="gf-row gf-who"' + (max > 1 ? '' : ' hidden') + '><button class="sp-btn sp-secondary gf-same" data-sound="tap">👥 Same device</button><button class="sp-btn sp-secondary gf-own" data-sound="tap">📱 Own devices</button></div>' +
      '<div class="gf-mini gf-howto"></div>' +
      '<div class="gf-row"><button class="sp-btn sp-secondary gf-help" data-sound="tap">📖 How to play</button><button class="sp-btn sp-secondary gf-lead" data-sound="tap">🏆 Leaders</button></div></div>' +
      '<div class="gf-foot"><span class="gf-tip"></span><span class="gf-ver">' + esc((o.icon ? o.icon + ' ' : '') + (o.title || id) + (o.version ? ' · v' + o.version : '')) + '</span></div></div>';   /* b2fix2 */
    (host || document.body).appendChild(el);
    const $ = s => el.querySelector(s), cv = $('.gf-cv'), g = cv.getContext('2d');
    const me = o.me || '';
    const C = {el, mode: 'solo', data: null, lineup: [], destroyed: false, champs: [], board: -1, boards: [], fns: [], tv: false};
    const avOf = n => fixA(o.avatarOf ? o.avatarOf(n) : null) || defA(n);

    // ---- 👥 lineup ----
    const spotActors = {};
    function changed(){ paintLine(); const pb = $('.gf-play'); if(pb) pb.disabled = C.tv && !C.lineup.length; if(C.tv) hi(); C.fns.forEach(f => { try { f(C.lineup.slice(), C.mode); } catch(e){} }); }
    function add(sp){
      if(C.lineup.length >= max) return false;
      const seat = sp.seat != null ? sp.seat : C.lineup.length + (C.tv ? 1 : 0);   /* 📺 tv-1: seat 0 = the TV */
      const s = {seat, name: sp.name, av: sp.av || avOf(sp.name), where: sp.where === 'device' ? 'device' : 'here', host: !!sp.host};
      C.lineup = C.lineup.filter(x => x.seat !== seat).concat([s]).sort((a, b) => a.seat - b.seat);
      const A = spotActors[s.name] = actor(s.name, s.av, ['beat.wave', 'beat.cheer', 'beat.jump']); playAct(A, 'beat.wave');   // 🎬 waves on joining
      sound('pop'); LOG.push('join:' + s.name + ':' + s.where); changed(); return true;
    }
    function remove(seat){ const s = C.lineup.find(x => x.seat === seat); if(!s || (seat === 0 && !C.tv)) return; C.lineup = C.lineup.filter(x => x.seat !== seat); if(!C.tv) C.lineup = C.lineup.map((x, i) => Object.assign(x, {seat: i}));   /* 📺 tv-1: TV seats are LinkKit seats — kept */ delete spotActors[s.name]; LOG.push('leave:' + s.name); changed(); }
    function paintLine(){
      const box = $('.gf-line'); box.innerHTML = '';
      if(C.tv){ const t = document.createElement('div'); t.className = 'gf-spot gf-tv'; t.innerHTML = '<span class="gf-tvic">📺</span><span class="gf-nm">TV</span>'; box.appendChild(t); }   /* 📺 tv-1: spot 1 = the hostess marker */
      C.lineup.forEach(s => {
        const b = document.createElement('button'); b.className = 'gf-spot'; b.dataset.seat = s.seat; b.setAttribute('data-sound', 'none');
        const mk = (s.host ? '👑' : '') + (C.mode === 'own' || s.where === 'device' ? (s.where === 'device' ? '📱' : '🏠') : '');
        b.innerHTML = '<canvas width="144" height="160"></canvas><span class="gf-nm">' + esc(s.name) + '</span>' + (mk ? '<span class="gf-mk">' + mk + '</span>' : '') + (s.seat > 0 && s.where === 'here' ? '<span class="gf-x">✕</span>' : '');
        b.onclick = () => { if(s.seat > 0 && s.where === 'here'){ sound('tap'); remove(s.seat); } else { const A = spotActors[s.name]; if(A) playAct(A, 'beat.wave'); } };
        box.appendChild(b);
      });
      if(C.mode === 'same') for(let i = C.lineup.length; i < max; i++){
        const b = document.createElement('button'); b.className = 'gf-spot gf-add'; b.setAttribute('data-sound', 'tap'); b.innerHTML = '<span class="gf-plus">➕</span><span class="gf-nm">Add</span>';
        b.onclick = pickPlayer; box.appendChild(b); break;   // one ➕ at a time keeps the line on one row
      }
    }
    function pickPlayer(){
      const inLine = new Set(C.lineup.map(s => s.name)), list = (o.players || []).map(p => p.Name || p.name || p).filter(n => n && !inLine.has(n));
      const card = sheet('👥 Who joins on this device?', list.length ? '<div class="gf-picks">' + list.map(n => '<button class="gf-pick" data-n="' + esc(n) + '" data-sound="pop"><canvas width="144" height="160"></canvas>' + esc(n) + '</button>').join('') + '</div>'
        : '<p>Everyone is already in the line! 🎉</p>');
      card.querySelectorAll('.gf-pick').forEach(b => { try { drawPreviewCanvas(b.querySelector('canvas'), avOf(b.dataset.n), {name: b.dataset.n, t: 1}); } catch(e){}
        b.onclick = () => { closeSheet(); add({name: b.dataset.n, where: 'here'}); }; });
    }
    function setMode(m){
      C.mode = m; $('.gf-same').classList.toggle('gf-on', m === 'same'); $('.gf-own').classList.toggle('gf-on', m === 'own');
      if(m !== 'own'){ C.lineup = C.lineup.filter(s => s.where === 'here'); C.lineup.forEach((s, i) => s.seat = i); room(null); }
      if(m !== 'same' && m !== 'own'){ C.lineup = C.lineup.slice(0, 1); }
      LOG.push('mode:' + m); changed();
    }
    function room(r){ if(r && r.hostess !== undefined) hostess(r.hostess); let chip = $('.gf-room'); if(!r){ if(chip) chip.remove(); return; } if(!chip){ chip = document.createElement('span'); chip.className = 'gf-room'; $('.gf-hi').appendChild(chip); } chip.textContent = (C.tv ? '📺 Room ' : '📱 Room ') + (r.code || ''); }
    // 📺 tv-1: hostess mode — the TV is not a player; only own-device players stand in the line
    function hostess(on){
      on = !!on; if(on === C.tv) return C; C.tv = on; el.classList.toggle('gf-tvmode', on);
      if(on){ C.mode = 'own'; C.lineup.filter(s => s.where !== 'device').forEach(s => delete spotActors[s.name]); C.lineup = C.lineup.filter(s => s.where === 'device'); }
      else { C.lineup = []; C.mode = 'solo'; }
      $('.gf-who').hidden = on || max <= 1; $('.gf-same').classList.remove('gf-on'); $('.gf-own').classList.toggle('gf-on', on);
      saves(o.saves); LOG.push('hostess:' + on);
      if(!on) add({seat: 0, name: me || 'Player', where: 'here'}); else changed();
      hi(); return C;
    }

    // ---- 👋 welcome ----
    function hi(){
      const B = C.boards[C.board], i = B ? B.list.findIndex(x => x.name === me) : -1;
      const keep = $('.gf-room');
      if(C.tv){ const n = C.lineup.length; $('.gf-hi').innerHTML = '<span>📺 <b>Room hostess</b> — ' + (n ? n + (n > 1 ? ' players are' : ' player is') + ' in!' : 'join on your own device') + '</span>'; if(keep) $('.gf-hi').appendChild(keep); return; }
      $('.gf-hi').innerHTML = '<span>👋 Hi <b>' + esc(me || 'explorer') + '</b>!</span>' + (i >= 0 ? ' <em>You\'re ' + MEDAL[i] + ' in ' + esc(B.label) + '!</em>' : '');
      if(keep) $('.gf-hi').appendChild(keep);
    }

    // ---- 🏆 champions (one getGameLeaders call; boards take turns) ----
    function boardsOf(d){
      const P = (d && d.players) || [], byN = {}; P.forEach(p => byN[p.name] = p);
      const av = n => fixA(byN[n] && byN[n].avatar) || avOf(n);
      const best = (d && d.byScore ? P.filter(p => p.bestScore > 0).slice().sort((a, b) => b.bestScore - a.bestScore).map(p => ({name: p.name, t: '🏆 ' + Number(p.bestScore).toLocaleString()}))
        : P.map(p => ({name: p.name, t: Number(p.total || 0).toLocaleString() + ' pts'}))).slice(0, 3);
      const B = (d && d.boards) || {};
      return BOARDS.map(([k, label]) => ({k, label: k === 'best' && !(d && d.byScore) ? '👑 Leader points' : label, list: (k === 'best' ? best : (B[k] || []).map(x => ({name: x.name, t: x.t}))).map(x => Object.assign(x, {av: av(x.name)}))}))
        .filter(b => b.list.length);
    }
    function showBoard(i){
      if(!C.boards.length){ C.champs = []; const bb = $('.gf-board'); bb.hidden = false; bb.querySelector('.gf-bn').textContent = '🚀 Be the first champion!'; bb.querySelector('i').innerHTML = ''; hi(); return; }
      C.board = i % C.boards.length; const B = C.boards[C.board], t = now();
      C.champs = B.list.map((x, j) => Object.assign(actor(x.name, x.av, ['beat.wave', 'beat.cheer', 'beat.jump', 'beat.bow'].concat(o.acts || [])), {place: j, t: x.t, enter: t + j * 0.18}));
      C.champs.forEach(A => { A.next = A.enter + 0.45; });
      const bb = $('.gf-board'); bb.hidden = false; bb.querySelector('.gf-bn').textContent = B.label;
      bb.querySelector('i').innerHTML = C.boards.length > 1 ? C.boards.map((_, j) => '<b' + (j === C.board ? ' class="on"' : '') + '></b>').join('') : '';
      LOG.push('board:' + B.k); hi();
    }
    function load(){
      if(!root.google || !google.script || !google.script.run || !id){ showBoard(0); return; }
      google.script.run.withSuccessHandler(d => { if(C.destroyed) return; C.data = d; C.boards = boardsOf(d); showBoard(0); LOG.push('leaders:' + C.boards.length); })
        .withFailureHandler(() => { C.boards = []; showBoard(0); }).getGameLeaders(id);
    }
    let boardTimer = setInterval(() => { if(C.boards.length > 1 && !el.classList.contains('gf-hide') && !document.hidden) showBoard(C.board + 1); }, BOARD_MS);
    $('.gf-board').onclick = () => { sound('tap'); if(C.boards.length > 1) showBoard(C.board + 1); };

    // ---- 🎨 the art + champions, one loop (≤ 30 fps, stops when hidden) ----
    let W = 0, H = 0, dpr = 1, still = null, spots = [], raf = 0, last = 0, hits = [];
    function size(){
      const r = cv.getBoundingClientRect(); dpr = Math.min(2, root.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height)); if(w === W && h === H && still) return;
      W = w; H = h; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      still = document.createElement('canvas'); still.width = cv.width; still.height = cv.height; const sg = still.getContext('2d'); sg.setTransform(dpr, 0, 0, dpr, 0, 0);
      const GC = root.GameCovers; spots = GC ? GC.spots(id, W, H) : [{x: W * .3, y: H * .85, k: H / 380}, {x: W * .5, y: H * .88, k: H / 380}, {x: W * .7, y: H * .85, k: H / 380}];
      if(GC) GC.still(id, sg, W, H, {c1, c2, icon: o.icon}); else { const gr = sg.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, c1); gr.addColorStop(1, c2); sg.fillStyle = gr; sg.fillRect(0, 0, W, H); }
    }
    function frame(ms){
      if(C.destroyed || !el.isConnected){ cancelAnimationFrame(raf); return; }
      raf = requestAnimationFrame(frame);
      if(el.classList.contains('gf-hide') || document.hidden || ms - last < 32) return; last = ms;
      size(); const t = now(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.drawImage(still, 0, 0);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      if(root.GameCovers) GameCovers.live(id, g, W, H, t, {c1, c2, icon: o.icon});
      hits = [];
      C.champs.forEach((A, j) => {
        const sp = spots[j] || spots[spots.length - 1]; if(!sp) return;
        const k = Math.max(0.42, Math.min(1.25, sp.k || 0.8)), q = Math.max(0, Math.min(1, (t - A.enter) / 0.45)), e = root.Acting && Acting.EASE ? Acting.EASE.backOut(q) : q;
        if(q <= 0) return;
        const x = sp.x + (1 - e) * (sp.from || -1) * 60 * k, y = sp.y; g.save(); g.globalAlpha = Math.min(1, q * 1.6);
        g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x, y + 2 * k, 24 * k, 6 * k, 0, 0, 7); g.fill();
        A.who.dir = sp.dir || 1; drawActor(g, A, x, y, k, t, root.Acting && Acting.sig ? Acting.sig(A.who.av) : 'idle');
        const tag = MEDAL[A.place] + ' ' + A.who.name; g.font = '700 ' + Math.round(12 * Math.max(0.85, k)) + 'px Fredoka, Nunito, sans-serif'; const tw = g.measureText(tag).width + 12;
        g.fillStyle = 'rgba(255,253,247,.94)'; g.strokeStyle = '#2A1E3A'; g.lineWidth = 1.5; const ty = y + 8 * k, th = 18 * Math.max(0.85, k);
        g.beginPath(); if(g.roundRect) g.roundRect(x - tw / 2, ty, tw, th, th / 2); else g.rect(x - tw / 2, ty, tw, th); g.fill(); g.stroke();
        g.fillStyle = '#2A1E3A'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tag, x, ty + th / 2 + 0.5); g.restore();
        hits.push({x0: x - 34 * k, x1: x + 34 * k, y0: y - 110 * k, y1: ty + th, A});
      });
      // the lineup (front, by the buttons)
      el.querySelectorAll('.gf-spot:not(.gf-add)').forEach(b => { const s = C.lineup.find(x => String(x.seat) === b.dataset.seat), A = s && spotActors[s.name], c = b.querySelector('canvas'); if(!A || !c) return;
        const lg = c.getContext('2d'); lg.setTransform(1, 0, 0, 1, 0, 0); lg.clearRect(0, 0, c.width, c.height); drawActor(lg, A, c.width / 2, c.height - 10, c.height / 118, t, 'idle'); });
    }
    cv.addEventListener('click', ev => {
      const r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, h = hits.find(z => x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1);
      el.querySelectorAll('.gf-bubble').forEach(b => b.remove()); if(!h) return;
      sound('pop'); playAct(h.A, 'beat.jump');
      const b = document.createElement('div'); b.className = 'gf-bubble'; b.style.left = ((h.x0 + h.x1) / 2) + 'px'; b.style.top = Math.max(30, h.y0) + 'px';
      b.textContent = MEDAL[h.A.place] + ' ' + h.A.who.name + ' · ' + (h.A.t || ''); $('.gf-art').appendChild(b); setTimeout(() => b.remove(), 2600); LOG.push('tap:' + h.A.who.name);
    });

    // ---- sheets: 📖 how to play · 🏆 leaders · 👥 picker ----
    function sheet(title, body){
      closeSheet(); const s = document.createElement('div'); s.className = 'gf-sheet';
      s.innerHTML = '<div class="gf-card" role="dialog" aria-label="' + esc(title) + '"><button class="gf-close" data-sound="tap" aria-label="Close">✕</button><h2>' + esc(title) + '</h2>' + body + '</div>';
      s.onclick = e => { if(e.target === s){ closeSheet(); } }; s.querySelector('.gf-close').onclick = closeSheet; el.appendChild(s); return s.querySelector('.gf-card');
    }
    function closeSheet(){ el.querySelectorAll('.gf-sheet').forEach(s => s.remove()); }
    function playDemo(box){ if(hasDemo && CA.play){ try { CA.play(box, id, c1, c2); return true; } catch(e){} } return false; }
    $('.gf-help').onclick = () => { const card = sheet('📖 How to play ' + (o.title || ''), '<div class="gf-howto gf-hbig"></div>' + (help.length ? '<ul>' + help.map(l => '<li>' + story(l) + '</li>').join('') + '</ul>' : ''));
      if(!playDemo(card.querySelector('.gf-hbig'))) card.querySelector('.gf-hbig').remove(); LOG.push('help'); };
    $('.gf-lead').onclick = () => { const card = sheet('🏆 Leaders · ' + (o.title || ''), '<div class="ui-leaders gf-lb"></div>'); const lb = card.querySelector('.gf-lb');
      if(root.UI && UI.leaders) UI.leaders(lb, id, me, C.data || undefined); LOG.push('leaders-panel'); };
    $('.gf-same').onclick = () => setMode(C.mode === 'same' ? 'solo' : 'same');
    if(!o.own) $('.gf-own').hidden = true, $('.gf-who').classList.add('gf-one');
    $('.gf-own').onclick = () => { setMode('own'); if(C.lineup[0]) C.lineup[0].host = true; changed(); try { o.own(C); } catch(e){} };
    const bk = $('.gf-back');   // ◀ <where you came from> + 🏠, the same shared top buttons as every page (UI.navBar)
    if(root.UI && UI.navBar){ UI.navBar(bk, {fallback: o.backTo, kind: o.backKind, onclick: o.back ? false : true}); const nav = bk.parentNode; nav.querySelectorAll('.gf-back').forEach(x => x.classList.remove('gf-back')); nav.classList.add('gf-back'); }
    if(o.back || !(root.UI && UI.navBar)) bk.onclick = () => { sound('tap'); if(o.back) o.back(); else if(root.UI && UI.back) UI.back(o.backTo); };
    function saves(sv){ const r = $('.gf-saves'); o.saves = sv; r.hidden = C.tv || !(sv && sv.has); $('.gf-load').hidden = !(sv && sv.onLoad); r.classList.toggle('gf-one', !(sv && sv.onLoad)); }   /* b1c: chapter games = ⏩ Continue only */
    saves(o.saves);
    $('.gf-cont').onclick = () => { if(o.saves && o.saves.onContinue) o.saves.onContinue(C.lineup.slice()); };
    $('.gf-load').onclick = () => { if(o.saves && o.saves.onLoad) o.saves.onLoad(C.lineup.slice()); };
    // ▶ Play: the line cheers; the game starts on the cheer's CONTACT (beat rule), at the latest after 0.7 s
    let starting = false;
    $('.gf-play').onclick = () => {
      if(starting || (C.tv && !C.lineup.length)) return; starting = true; sound('pop'); let fired = false;
      const go = () => { if(fired) return; fired = true; starting = false; LOG.push('play:' + C.lineup.map(s => s.name).join('+')); if(o.onPlay) o.onPlay(C.lineup.slice(), C.mode); };
      C.lineup.forEach((s, i) => { const A = spotActors[s.name]; if(A) playAct(A, 'beat.cheer', i === 0 ? {onContact: () => setTimeout(go, 120)} : {}); });
      setTimeout(go, 700);
    };

    // ---- public ----
    Object.assign(C, {
      add, remove, room, saves, setMode, hostess,
      show(){ el.classList.remove('gf-hide'); document.body.classList.add('gf-open'); closeSheet(); if(!raf) raf = requestAnimationFrame(frame); LOG.push('show'); return C; },
      hide(){ el.classList.add('gf-hide'); document.body.classList.remove('gf-open'); closeSheet(); LOG.push('hide'); return C; },
      onChange(f){ C.fns.push(f); return C; },
      reload(){ load(); return C; },
      destroy(){ document.body.classList.remove('gf-open'); clearInterval(C.fns.tipTimer); C.destroyed = true; clearInterval(boardTimer); cancelAnimationFrame(raf); el.remove(); }
    });
    Object.defineProperty(C, 'isHostess', {get: () => C.tv});   /* 📺 tv-1 */
    if(o.hostess) hostess(true); else add({seat: 0, name: me || 'Player', where: 'here'});
    // 💡 b2fix2: a rotating tip in the footer (the game's own how-to first, then cover tips)
    const TIPS = help.map(l => String(l).split(/[.!?]\s/)[0].replace(/\*\*/g, '')).filter(l => l && l.length < 90).slice(0, 3)
      .concat(['Tap a champion to see their score! 🏆', 'The top 3 change every few seconds — can you get on the board?', 'New personal bests count for 📈 Most improved!']);
    let tipI = Math.floor(Math.random() * TIPS.length); const tipEl = $('.gf-tip'), tip = () => { if(!tipEl) return; tipEl.style.opacity = 0; setTimeout(() => { tipEl.textContent = '💡 ' + TIPS[tipI++ % TIPS.length]; tipEl.style.opacity = ''; }, 380); };
    if(tipEl) tipEl.textContent = '💡 ' + TIPS[tipI++ % TIPS.length]; const tipTimer = setInterval(() => { if(!el.classList.contains('gf-hide') && !document.hidden) tip(); }, 7000); C.fns.tipTimer = tipTimer;
    document.body.classList.add('gf-open'); hi(); load(); raf = requestAnimationFrame(frame);
    if(hasDemo) playDemo($('.gf-mini'));
    root.addEventListener('resize', () => { still = null; W = 0; });
    LOG.push('cover:' + id);
    return C;
  }

  // 🧰 helpers
  const fmt = sec => { sec = Math.max(0, Math.round(sec || 0)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); };
  function confetti(list, n){ if(reduced()) return; list = list && list.length ? list : ['🎉', '⭐', '✨'];
    for(let i = 0; i < (n || 26); i++){ const e = document.createElement('div'); e.className = 'gf-conf'; e.textContent = list[Math.floor(Math.random() * list.length)];
      e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * 0.5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }
  function screens(names, prefix){ prefix = prefix || 'scr-'; return {show(name){ names.forEach(n => { const e = document.getElementById(prefix + n); if(e) e.classList.toggle('hidden', n !== name); }); try { scrollTo(0, 0); } catch(e){} LOG.push('screen:' + name); }}; }

  // 🏁 the shared result card
  function result(o){
    o = o || {}; let wrap = o.wrap, card = o.card;
    if(!card){ wrap = document.createElement('div'); wrap.className = 'gf-result'; wrap.innerHTML = '<div class="gf-rcard"></div>'; document.body.appendChild(wrap); card = wrap.firstChild; }
    const st = o.stars == null ? '' : '<div class="gf-r-stars" aria-label="' + o.stars + ' of 3 stars">' + [0, 1, 2].map(i => i < o.stars ? '<b style="animation-delay:' + (0.25 + i * 0.28) + 's">⭐</b>' : '<i>⭐</i>').join('') + '</div>';
    card.classList.add('gf-rc'); card.dataset.win = o.win === true ? 'win' : o.win === false ? 'lose' : 'done';
    card.innerHTML = '<div class="gf-r-top">' + (o.buddy ? '<canvas class="gf-r-buddy" id="res-av" width="160" height="176"></canvas>' : '') +
      '<div class="gf-r-head"><div class="gf-r-ic">' + esc(o.icon || (o.win === false ? '💫' : '🏁')) + '</div><h2>' + esc(o.title || (o.win === false ? 'Oh no!' : 'Well done!')) + '</h2>' + (o.sub ? '<p class="gf-r-sub">' + esc(o.sub) + '</p>' : '') + '</div></div>' + st +
      (o.score != null ? '<div class="gf-r-score">🏆 <span id="score-count">0</span></div>' : '') +
      (o.best ? '<div class="gf-r-best">🏅 ' + esc(o.best) + '</div>' : '') +
      (o.stats && o.stats.length ? '<div class="gf-r-stats">' + o.stats.map(x => '<span>' + esc(x[0]) + ' ' + esc(x[1]) + '</span>').join('') + '</div>' : '') +
      (o.rewards && o.rewards.length ? '<div class="gf-r-rew">' + o.rewards.map(x => '<span>' + esc(x.icon || '🎁') + ' ' + esc(x.text) + '</span>').join('') + '</div>' : '') +
      (o.save ? '<div class="gf-r-save save-note" id="save-note"><span class="ui-spin">✅</span> ' + esc(o.save) + '</div>' : '') +
      (o.comic ? '<div class="gf-r-comic" id="comic-strip-slot"></div>' : '') +
      '<div class="gf-r-btns res-btns"></div>';
    const row = card.querySelector('.gf-r-btns'), btn = (cls, txt, fn, primary, id) => { if(!fn) return; const b = document.createElement('button'); b.className = 'btn sp-btn ' + (primary ? 'sp-primary' : 'sp-secondary') + ' ' + cls;
      if(id) b.id = id; b.textContent = txt; b.setAttribute('data-sound', 'tap'); b.onclick = () => { LOG.push('result:' + cls); fn(); }; row.appendChild(b); };
    btn('gf-r-levels', o.levelsText || '🎚️ Levels', o.levels, false, 'btn-levels');
    btn('gf-r-again', o.againText || (o.win === false ? '🔄 Try again' : '🔄 Again'), o.again, o.win === false || !o.next, 'btn-again');
    (o.extra || []).forEach((x, i) => btn('gf-r-x' + i, x.text, x.fn, false, x.id));
    btn('gf-r-next', o.nextText || 'Next ▶', o.next, o.win !== false, 'btn-next');
    if(wrap) wrap.classList.remove('hidden');
    if(o.win === true && o.confetti !== false) confetti(o.confetti);
    { const sc = card.querySelector('#score-count'); if(sc){ const to = Number(o.score) || 0, t0 = performance.now(), ms = 1000;   // 🏆 b3w1: the score counts up (ease out)
      (function tick(){ if(!sc.isConnected) return; const k = Math.min(1, (performance.now() - t0) / ms); sc.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString(); if(k < 1) requestAnimationFrame(tick); })(); } }
    // the buddy acts (beat rule): a cheer on a win, a wobble on a miss, a bow when it's just done
    const cv = card.querySelector('.gf-r-buddy');
    if(cv && o.buddy && root.Acting){ const A = actor(o.buddy.name, fixA(o.buddy.av) || defA(o.buddy.name), o.win === false ? ['beat.hit'] : o.win === true ? ['beat.cheer', 'beat.jump'] : ['beat.bow']);
      playAct(A, A.pool[0]); const g2 = cv.getContext('2d'); let rf = 0; const loop = () => { if(!cv.isConnected || (wrap && wrap.classList.contains('hidden'))) return; rf = requestAnimationFrame(loop);
        g2.setTransform(1, 0, 0, 1, 0, 0); g2.clearRect(0, 0, cv.width, cv.height); drawActor(g2, A, cv.width / 2, cv.height - 12, cv.height / 120, now(), o.win === false ? 'idle' : (Acting.sig ? Acting.sig(A.who.av) : 'idle')); }; loop(); }
    LOG.push('result:' + card.dataset.win);
    return {el: card,
      close(){ if(wrap){ if(wrap.classList.contains('gf-result')) wrap.remove(); else wrap.classList.add('hidden'); } },
      saved(ok, msg){ const n = card.querySelector('.gf-r-save'); if(!n) return; n.innerHTML = ok ? '✅ Saved!' + (msg ? ' ' + esc(msg) : '') : '⚠️ Could not save yet — it will be sent again next time.' + (msg ? '<br><small style="opacity:.7">' + esc(msg) + '</small>' : ''); }};
  }

  // 💾 the shared save helper: 3 files + a current auto-save, device first (instant, offline), server at checkpoints
  function saves(o){
    o = Object.assign({slots: 3}, o || {}); const game = o.game, me = o.me, K = slot => 'sp_save:' + game + ':' + me + ':' + slot;
    const run = (fn, args) => new Promise((res, rej) => { if(!root.google || !google.script || !google.script.run) return rej(new Error('offline'));
      google.script.run.withSuccessHandler(res).withFailureHandler(rej)[fn].apply(null, args); });
    const dev = slot => { try { return JSON.parse(localStorage.getItem(K(slot)) || 'null'); } catch(e){ return null; } };
    const put = (slot, f) => { try { localStorage.setItem(K(slot), JSON.stringify(f)); return true; } catch(e){ return false; } };
    let cur = null;
    const S = {
      list(){ return run('getGameFiles', [me, game]).catch(() => ({files: [], main: 0})).then(d => { S._main = d.main || 0;
        return Array.from({length: o.slots}, (_, i) => { const n = i + 1, sv = (d.files || []).find(f => f.slot === n && !f.empty), dv = dev(n);
          const f = dv && (!sv || dv.at > sv.at) ? {slot: n, meta: dv.meta || {}, at: dv.at, device: true} : sv ? {slot: n, meta: sv.meta, at: sv.at} : {slot: n, empty: true};
          f.main = d.main === n; return f; }); }); },
      save(slot, data, meta, opt){ const f = {meta: meta || {}, data: data || {}, at: Date.now()}; put(slot, f); LOG.push('save:' + slot + (opt && opt.server ? ':server' : ''));
        return opt && opt.server ? run('saveGameFile', [me, game, slot, JSON.stringify(f)]) : Promise.resolve({ok: true, device: true}); },
      load(slot){ const dv = dev(slot); return run('loadGameFile', [me, game, slot]).catch(() => null).then(sv => { const f = dv && (!sv || dv.at > sv.at) ? dv : sv; LOG.push('load:' + slot); return f ? {slot, meta: f.meta || {}, data: f.data || {}, at: f.at} : null; }); },
      remove(slot){ try { localStorage.removeItem(K(slot)); } catch(e){} return run('deleteGameFile', [me, game, slot]).catch(() => null); },
      main(slot){ S._main = slot; return run('setMainGameFile', [me, game, slot]).catch(() => null); },
      current(slot, getState, everyMs){ S.stop(); const tick = () => { try { const st = getState(); if(st) S.save(slot, st.data, st.meta); } catch(e){} };
        cur = {slot, getState, timer: setInterval(tick, everyMs || 180000), leave: () => { tick(); }}; addEventListener('pagehide', cur.leave); LOG.push('current:' + slot); return S; },
      checkpoint(){ if(!cur) return Promise.resolve(null); const st = cur.getState(); return st ? S.save(cur.slot, st.data, st.meta, {server: true}) : Promise.resolve(null); },
      stop(){ if(cur){ clearInterval(cur.timer); removeEventListener('pagehide', cur.leave); cur = null; } },
      screen(host, so){ so = so || {}; host.innerHTML = '<div class="gf-files" aria-busy="true"><div class="gf-file gf-empty"><span class="ui-spin a-bounce">📂</span> Finding your files…</div></div>';
        return S.list().then(list => { const box = host.querySelector('.gf-files'); box.removeAttribute('aria-busy');
          box.innerHTML = list.map(f => f.empty ? '<button class="gf-file gf-empty" data-slot="' + f.slot + '" data-sound="pop"><b>➕ New file ' + f.slot + '</b><small>Empty</small></button>'
            : '<button class="gf-file" data-slot="' + f.slot + '" data-sound="pop"><span class="gf-star' + (f.main ? ' on' : '') + '" title="My main file">⭐</span><canvas width="144" height="160"></canvas><b>' + esc(f.meta.title || ('File ' + f.slot)) + '</b>' +
              '<small>' + esc([f.meta.chapter, f.meta.level].filter(Boolean).join(' · ') || ' ') + '</small><small>⏱ ' + fmt(f.meta.playSec || 0) + ' · ' + new Date(f.at).toLocaleDateString() + '</small></button>').join('');
          box.querySelectorAll('.gf-file').forEach(b => { const f = list.find(x => String(x.slot) === b.dataset.slot), c = b.querySelector('canvas');
            if(c) try { drawPreviewCanvas(c, fixA(f.meta.av) || (o.avatarOf ? fixA(o.avatarOf(me)) : null) || defA(me), {name: me, t: 1}); } catch(e){}
            const star = b.querySelector('.gf-star'); if(star) star.onclick = ev => { ev.stopPropagation(); box.querySelectorAll('.gf-star').forEach(x => x.classList.remove('on')); star.classList.add('on'); S.main(f.slot); };
            b.onclick = () => { if(f.empty){ if(so.onNew) so.onNew(f.slot); } else S.load(f.slot).then(file => { if(so.onPick) so.onPick(f.slot, file); }); }; });
          return list; }); }
    };
    return S;
  }

  // 🍎 b2fix: on Apple devices ▶ / ◀ default to blue emoji boxes — add the TEXT selector (U+FE0E) to every arrow on this page (only new / changed text is looked at)
  const APPLE = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent || '') || /[?&]arrows=1/.test(location.search), ARW = /([\u25B6\u25C0])(?!\uFE0E)/g;
  function arrows(node){ if(!node) return; if(node.nodeType === 3){ const v = node.nodeValue; if(/[\u25B6\u25C0](?!\uFE0E)/.test(v)) node.nodeValue = v.replace(ARW, '$1\uFE0E'); return; }
    if(node.nodeType !== 1 || node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return; const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT); let n; while((n = w.nextNode())) arrows(n); }
  if(APPLE && root.MutationObserver){ const start = () => { arrows(document.body); new MutationObserver(list => list.forEach(r => { if(r.type === 'characterData') arrows(r.target); else r.addedNodes.forEach(arrows); }))
      .observe(document.body, {subtree: true, childList: true, characterData: true}); LOG.push('arrows'); };
    if(document.body) start(); else document.addEventListener('DOMContentLoaded', start); }
  // ✓ b2fix: the ONE picked look (setup pages): GF.pick(el, on) — ring + glow + ✓ inside the card, works on cut-corner themes too
  function pick(el, on){ if(!el) return; el.classList.toggle('gf-picked', !!on); let t = el.querySelector(':scope > .gf-tick');
    if(on && !t){ t = document.createElement('span'); t.className = 'gf-tick'; t.textContent = '✓'; t.setAttribute('aria-hidden', 'true'); el.appendChild(t); } else if(!on && t) t.remove(); }
  root.GF = {cover, result, saves, confetti, fmt, screens, pick, arrows, LOG, VERSION: 'b3w2b', _turn: nextTurn, _actor: actor, APPLE};
})(window);
