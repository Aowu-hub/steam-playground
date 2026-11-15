
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
    return {who: {name, av, dir: 1}, pool: pool || ['beat.wave', 'beat.cheer', 'beat.jump'], run: null, next: now() + 0.4 + Math.random() * 1.6, enter: 0};
  }
  function playAct(A, key, o){
    if(!root.Acting || !Acting.play) return null;
    try { A.run = Acting.play(A.who, key, Object.assign({t0: now()}, o || {})); A.next = 1e9; LOG.push('act:' + A.who.name + ':' + key); return A.run; } catch(e){ A.run = null; return null; }
  }
  function drawActor(g, A, x, y, k, t, idleKey){
    if(!root.Acting) return;
    if(A.run && A.run.done){ A.run = null; A.next = t + 1.8 + Math.random() * 2.6; }
    if(!A.run && t >= A.next && !reduced()) playAct(A, A.pool[Math.floor(Math.random() * A.pool.length)]);
    try { if(A.run) Acting.draw(g, A.who, x, y, k, A.run.at(t), {t}); else Acting.draw(g, A.who, x, y, k, idleKey || 'idle', {t}); } catch(e){}
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
      '<div class="gf-row"><button class="sp-btn sp-secondary gf-help" data-sound="tap">📖 How to play</button><button class="sp-btn sp-secondary gf-lead" data-sound="tap">🏆 Leaders</button></div></div></div>';
    (host || document.body).appendChild(el);
    const $ = s => el.querySelector(s), cv = $('.gf-cv'), g = cv.getContext('2d');
    const me = o.me || '';
    const C = {el, mode: 'solo', data: null, lineup: [], destroyed: false, champs: [], board: -1, boards: [], fns: []};
    const avOf = n => fixA(o.avatarOf ? o.avatarOf(n) : null) || defA(n);

    // ---- 👥 lineup ----
    const spotActors = {};
    function changed(){ paintLine(); C.fns.forEach(f => { try { f(C.lineup.slice(), C.mode); } catch(e){} }); }
    function add(sp){
      if(C.lineup.length >= max) return false;
      const seat = sp.seat != null ? sp.seat : C.lineup.length;
      const s = {seat, name: sp.name, av: sp.av || avOf(sp.name), where: sp.where === 'device' ? 'device' : 'here', host: !!sp.host};
      C.lineup = C.lineup.filter(x => x.seat !== seat).concat([s]).sort((a, b) => a.seat - b.seat);
      const A = spotActors[s.name] = actor(s.name, s.av, ['beat.wave', 'beat.cheer', 'beat.jump']); playAct(A, 'beat.wave');   // 🎬 waves on joining
      sound('pop'); LOG.push('join:' + s.name + ':' + s.where); changed(); return true;
    }
    function remove(seat){ const s = C.lineup.find(x => x.seat === seat); if(!s || seat === 0) return; C.lineup = C.lineup.filter(x => x.seat !== seat).map((x, i) => Object.assign(x, {seat: i})); delete spotActors[s.name]; LOG.push('leave:' + s.name); changed(); }
    function paintLine(){
      const box = $('.gf-line'); box.innerHTML = '';
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
    function room(r){ let chip = $('.gf-room'); if(!r){ if(chip) chip.remove(); return; } if(!chip){ chip = document.createElement('span'); chip.className = 'gf-room'; $('.gf-hi').appendChild(chip); } chip.textContent = '📱 Room ' + (r.code || ''); }

    // ---- 👋 welcome ----
    function hi(){
      const B = C.boards[C.board], i = B ? B.list.findIndex(x => x.name === me) : -1;
      const keep = $('.gf-room');
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
    if(root.UI && UI.navBar){ UI.navBar(bk, {fallback: o.backTo, onclick: o.back ? false : true}); const nav = bk.parentNode; nav.querySelectorAll('.gf-back').forEach(x => x.classList.remove('gf-back')); nav.classList.add('gf-back'); }
    if(o.back || !(root.UI && UI.navBar)) bk.onclick = () => { sound('tap'); if(o.back) o.back(); else if(root.UI && UI.back) UI.back(o.backTo); };
    function saves(sv){ const r = $('.gf-saves'); o.saves = sv; r.hidden = !(sv && sv.has); }
    saves(o.saves);
    $('.gf-cont').onclick = () => { if(o.saves && o.saves.onContinue) o.saves.onContinue(C.lineup.slice()); };
    $('.gf-load').onclick = () => { if(o.saves && o.saves.onLoad) o.saves.onLoad(C.lineup.slice()); };
    // ▶ Play: the line cheers; the game starts on the cheer's CONTACT (beat rule), at the latest after 0.7 s
    let starting = false;
    $('.gf-play').onclick = () => {
      if(starting) return; starting = true; sound('pop'); let fired = false;
      const go = () => { if(fired) return; fired = true; starting = false; LOG.push('play:' + C.lineup.map(s => s.name).join('+')); if(o.onPlay) o.onPlay(C.lineup.slice(), C.mode); };
      C.lineup.forEach((s, i) => { const A = spotActors[s.name]; if(A) playAct(A, 'beat.cheer', i === 0 ? {onContact: () => setTimeout(go, 120)} : {}); });
      setTimeout(go, 700);
    };

    // ---- public ----
    Object.assign(C, {
      add, remove, room, saves, setMode,
      show(){ el.classList.remove('gf-hide'); document.body.classList.add('gf-open'); closeSheet(); if(!raf) raf = requestAnimationFrame(frame); LOG.push('show'); return C; },
      hide(){ el.classList.add('gf-hide'); document.body.classList.remove('gf-open'); closeSheet(); LOG.push('hide'); return C; },
      onChange(f){ C.fns.push(f); return C; },
      reload(){ load(); return C; },
      destroy(){ document.body.classList.remove('gf-open'); C.destroyed = true; clearInterval(boardTimer); cancelAnimationFrame(raf); el.remove(); }
    });
    add({seat: 0, name: me || 'Player', where: 'here'});
    document.body.classList.add('gf-open'); hi(); load(); raf = requestAnimationFrame(frame);
    if(hasDemo) playDemo($('.gf-mini'));
    root.addEventListener('resize', () => { still = null; W = 0; });
    LOG.push('cover:' + id);
    return C;
  }

  root.GF = {cover, LOG, VERSION: 'b1b'};
})(window);
