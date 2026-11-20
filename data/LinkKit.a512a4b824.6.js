
/* 📡 LK-6 COVER ROOM (lk-6a, 📡 puzzle chat, Aowu 2026-11-17 "go") — the room lives on the game's 🎬 cover instead of a separate lobby page.
   Game: cover option own: C => Link.cover(C, {game, title, page, seats, min, url, name(), av(), label(tv), bot() | false, onStart(), onLink(), onJoined(), picks(el)})   (lk-6b: onJoined · bot: false · picks)
     ④ 📱 Own devices → a sheet ON the cover: 🎮 Host and play · 📺 Room hostess · 🔗 Join a friend
     ① host: a room card (number + QR + ✕) above the 👥 line; each linked phone walks into the line (cover.add / remove); ▶ = "▶ Start · N players"
     ② TV: cover.room({code, hostess: true}) (tv-1) + the big number + QR on the art; 1 player → "▶ Start vs 🤖 …"
     ③ guest: the host's line (host 👑 seat 0), ▶ = "⏳ <host> starts the game" (the captain of a 📺 room: ▶ Start → asks the TV)
   ▶ on the cover → Link.start() + opt.onStart() (host) · the room stays open after a match: the game calls Link.cover.show(C) to come back.
   Link.cover.active(C) · Link.cover.close() · Link.cover.state() (tests) · lk-pp1b: Link.cover.tv(C, o) (📺 station: straight to the hostess room) · Link.cover.start(). Uses GameFrame's own hooks; when GameFrame offers cover.card(node) /
   cover.playText(text, {disabled}) (asked of the 🧱 chat) they are used, else the card goes into .gf-panel and the ▶ text is set here. */
(function () {
  const L = window.Link; if (!L) return;
  let K = null;   // {C, o, mode: null | 'pick' | 'host' | 'tv' | 'join' | 'guest', card, big, sheet, lobby, sig, err}
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const snd = k => { try { if (window.UISound) UISound.play(k); } catch (e) { /* */ } };
  const live = () => !!(K && K.mode && K.mode !== 'pick' && K.mode !== 'join');
  const nm = () => { const o = K.o; return typeof o.name === 'function' ? o.name() : (o.name || ''); };
  const avOf = () => { try { return K.o.av ? K.o.av() : null; } catch (e) { return null; } };
  const digits = () => (L.emoji() || []).map(String);
  const tiles = () => '<div class="lkc-tiles" aria-label="room number">' + digits().map(d => '<div class="lkc-t lkc-n' + (/^\d$/.test(d) ? d : 0) + '">' + esc(d) + '</div>').join('') + '</div>';
  const panel = () => K.C.el.querySelector('.gf-panel');
  const playBtn = () => K.C.el.querySelector('.gf-play');

  function qr(cv) {
    if (!cv || typeof qrcode !== 'function' || !K.o.url) return;
    const q = qrcode(0, 'L'); q.addData(K.o.url + (K.o.url.indexOf('?') < 0 ? '?' : '&') + 'link=' + L.code()); q.make();
    const n = q.getModuleCount(), g = cv.getContext('2d'); cv.width = cv.height = n * 4;
    g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = '#000';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect(c * 4, r * 4, 4, 4);
  }
  // ---------- the pieces on the cover ----------
  function mountCard() {
    if (!K.card) { K.card = document.createElement('div'); K.card.className = 'lkc-card'; K.card.dataset.lkc = '1'; }
    const C = K.C;
    if (typeof C.card === 'function') C.card(K.card);   // 🧱 GameFrame slot (when it exists)
    else if (!K.card.isConnected) { const p = panel(), line = p && p.querySelector('.gf-line'); if (p) p.insertBefore(K.card, line || p.firstChild); }
    C.el.classList.add('lkc-on');
    return K.card;
  }
  function unmountCard() {
    if (K.card) { if (typeof K.C.card === 'function') K.C.card(null); K.card.remove(); K.card = null; }
    if (K.big) { K.big.remove(); K.big = null; }
    K.C.el.classList.remove('lkc-on');
  }
  function closeSheet() { if (K.lobby && K.lobby.close) K.lobby.close(); K.lobby = null; if (K.sheet) { K.sheet.remove(); K.sheet = null; } }
  function sheet(title) {
    closeSheet();
    const s = document.createElement('div'); s.className = 'lkc-sheet';
    s.innerHTML = '<div class="lkc-hd"><span>' + esc(title) + '</span><button class="lkc-close" data-sound="tap" aria-label="Close">✕</button></div><div class="lkc-body"></div>';
    s.querySelector('.lkc-close').onclick = () => { snd('tap'); cancel(); };
    K.C.el.appendChild(s); K.sheet = s;
    return s.querySelector('.lkc-body');
  }
  function cancel() {   // ✕ on the pick / join sheet → back to playing on this device
    closeSheet();
    if (L.status() !== 'idle' && !live()) { try { L.leave(); } catch (e) { /* */ } }
    if (!live()) { K.mode = null; K.C.setMode('solo'); }
  }
  function pick() {
    K.mode = 'pick';
    const b = sheet('📱 ' + (K.o.title || 'Play') + ' · own devices');
    b.innerHTML = '<div class="lkc-sub">Each player on their own phone, tablet or computer — same Wi-Fi or 🌍 anywhere</div><div class="lkc-pick">' +
      '<button class="sp-btn sp-primary lkc-host" data-sound="pop">🎮 Host and play<small>this device plays too</small></button>' +
      '<button class="sp-btn sp-primary lkc-tv" data-sound="pop">📺 Room hostess<small>this screen = the TV · everyone plays on their own device</small></button>' +
      '<button class="sp-btn sp-secondary lkc-join" data-sound="pop">🔗 Join a friend<small>type the 4 numbers on their screen</small></button></div>';
    b.querySelector('.lkc-host').onclick = () => openRoom(false);
    b.querySelector('.lkc-tv').onclick = () => openRoom(true);
    b.querySelector('.lkc-join').onclick = () => join();
  }
  async function openRoom(tv) {
    closeSheet(); K.mode = tv ? 'tv' : 'host'; K.err = ''; K.sig = '';
    const c = mountCard(); c.className = 'lkc-card lkc-wait'; c.innerHTML = '<span class="ui-spin a-bob">' + (tv ? '📺' : '📡') + '</span> Opening the room<span class="lk-dots"></span>';
    if (K.o.onLink) try { K.o.onLink(); } catch (e) { /* */ }
    try { await L.host({game: K.o.game, name: nm(), av: avOf(), seats: K.o.seats || 2, hostess: !!tv, page: K.o.page, label: K.o.label ? K.o.label(!!tv) : K.o.title}); }
    catch (e) {
      if (!K || K.mode !== (tv ? 'tv' : 'host')) return;
      snd('error'); K.err = (e && e.message) || 'Could not open the room';
      c.className = 'lkc-card lkc-wait'; c.innerHTML = '<span class="lkc-err">😕 ' + esc(K.err) + '</span> <button class="lkc-btn" data-sound="tap">🔁 Try again</button>';
      c.querySelector('button').onclick = () => openRoom(tv); return;
    }
    if (!K || K.mode !== (tv ? 'tv' : 'host')) { try { L.leave(); } catch (e) { /* */ } return; }
    if (tv) K.C.room({code: digits().join(''), hostess: true});
    snd('success'); sync(true);
  }
  function join(code) {
    K.mode = 'join'; if (K.o.onLink) try { K.o.onLink(); } catch (e) { /* */ }
    const b = sheet('🔗 Join a friend'); const box = document.createElement('div'); b.appendChild(box);
    K.lobby = L.lobby(box, {title: K.o.title, name: nm(), av: avOf(), drawAvatar: K.o.drawAvatar, soloBot: true, code: code || undefined, kind: K.o.kind,
      onJoined: () => { snd('success'); closeSheet(); K.mode = 'guest'; K.sig = ''; if (K.o.onJoined) try { K.o.onJoined(); } catch (e) { /* */ } sync(true); }});   /* lk-6b: + onJoined */
  }
  // ---------- keep the line + card + ▶ in step with the room ----------
  function seatsNow() { return (L.players() || []).filter(p => p.name && (p.on || p.me) && !p.screen); }
  function want() {
    const list = seatsNow(), mine = L.seat();
    if (K.mode === 'tv') return list.filter(p => p.seat > 0).map(p => ({seat: p.seat, name: p.name, av: p.av || undefined, where: 'device'}));
    if (K.mode === 'host') return list.filter(p => p.seat > 0).map(p => ({seat: p.seat, name: p.name, av: p.av || undefined, where: 'device'}));
    if (L.hostess()) return list.filter(p => p.seat > 0).map(p => ({seat: p.seat, name: p.name, av: p.av || undefined, where: 'device'}));   // 📺 room: the TV is spot 1
    return list.map(p => ({seat: p.seat, name: p.name, av: p.av || undefined, where: 'device', host: p.seat === 0}));
  }
  function syncLine(force) {
    const C = K.C, w = want(), sig = w.map(s => s.seat + ':' + s.name + ':' + s.where).join('|');
    if (!force && sig === K.sig) return; K.sig = sig;
    if (K.mode === 'tv' || (K.mode === 'guest' && L.hostess())) {   // tv-1 keeps the LinkKit seats as they are
      if (!C.isHostess) C.room({code: digits().join(''), hostess: true});
      C.lineup.filter(s => !w.some(x => x.seat === s.seat && x.name === s.name)).forEach(s => C.remove(s.seat));
      w.forEach(s => { if (!C.lineup.some(x => x.seat === s.seat && x.name === s.name)) C.add(s); });
      return;
    }
    if (K.mode === 'host') {
      const dev = C.lineup.filter(s => s.where === 'device'), gone = dev.some(s => !w.some(x => x.seat === s.seat && x.name === s.name));
      if (gone) { let s; while ((s = C.lineup.find(x => x.where === 'device'))) C.remove(s.seat); }   // a leave renumbers the line → rebuild it
      w.forEach(s => { if (!C.lineup.some(x => x.seat === s.seat && x.name === s.name)) C.add(s); });
      if (C.lineup[0]) C.lineup[0].host = true;
      return;
    }
    // guest: the host's line — the host on spot 1, you where your seat is
    const host = w.find(s => s.host); if (host) C.add(host);
    let s; while ((s = C.lineup.find(x => x.seat > 0 && !w.some(y => y.seat === x.seat && y.name === x.name)))) C.remove(s.seat);
    w.filter(x => !x.host).forEach(x => { if (!C.lineup.some(y => y.seat === x.seat && y.name === x.name)) C.add(x); });
  }
  function need() { return K.mode === 'tv' ? 1 : (K.o.min || 2); }
  function players() { return seatsNow().filter(p => !(K.mode === 'tv' && p.seat === 0)).length; }
  function hostName() { const h = (L.players() || []).find(p => p.seat === 0); return h && h.name ? h.name : 'the host'; }
  function paintCard() {
    if (!live()) return; const c = mountCard();
    const st = L.status(), linking = (L._test && L._test.state && Object.values(L._test.state().peers || {}).filter(q => !q.linked).length) || 0;
    if (K.mode === 'guest') {
      c.className = 'lkc-card';
      c.innerHTML = '<div class="lkc-l"><div>🔗 Linked to <b>' + esc(hostName()) + '</b>\'s room</div>' + tiles() +
        '<div class="lkc-st">' + (st === 'reconnecting' ? '🔁 Linking again<span class="lk-dots"></span>' : L.hostess() ? '📺 The game shows on the TV' : '') + '</div></div><button class="lkc-x" data-sound="tap">🚪 Leave</button>';
    } else {
      c.className = 'lkc-card';
      c.innerHTML = '<div class="lkc-l"><div class="lkc-lb">' + (K.mode === 'tv' ? '📺 Room hostess — join on your own phone' : '📱 Room — type it on the other phones') + '</div>' + tiles() +
        '<div class="lkc-st">' + (linking ? '📨 ' + linking + ' device' + (linking > 1 ? 's' : '') + ' linking<span class="lk-dots"></span>' : players() < need() ? '📲 Waiting for ' + (need() - players()) + ' more player' + (need() - players() > 1 ? 's' : '') : '✅ Ready!') + '</div></div>' +
        (K.mode === 'host' ? '<canvas class="lkc-qr"></canvas>' : '') + '<button class="lkc-x" data-sound="tap">✕ close</button>';
      qr(c.querySelector('.lkc-qr'));
      if (K.mode === 'tv') {
        if (!K.big) { K.big = document.createElement('div'); K.big.className = 'lkc-big'; const art = K.C.el.querySelector('.gf-art'); if (art) art.appendChild(K.big); }
        K.big.innerHTML = '<div><div>📺 Join on your own phone</div>' + tiles() + '<div class="lkc-how">' + esc(K.o.how || ('Gameroom → ' + (K.o.title || '') + ' → 📱 Own devices → 🔗 Join · or scan')) + '</div></div><canvas class="lkc-qr"></canvas>';
        qr(K.big.querySelector('.lkc-qr'));
      }
    }
    if (K.mode !== 'guest' && K.o.picks) { const l = c.querySelector('.lkc-l'), pk = document.createElement('div'); pk.className = 'lkc-picks'; if (l) l.appendChild(pk); try { K.o.picks(pk); } catch (e) { console.error('Link.cover picks', e); } }   /* lk-6b */
    c.querySelector('.lkc-x').onclick = () => { snd('tap'); close(true); };
  }
  function paintPlay() {
    if (!K || !K.mode) return; const b = playBtn(); if (!b) return;
    let text = '▶ Play', off = false;
    if (K.mode === 'pick' || K.mode === 'join') { text = '▶ Play'; off = true; }
    else if (K.mode === 'guest') {
      const cap = L.hostess() && L.captain() === L.seat() && !L.started();
      if (cap) text = players() < 1 ? '▶ Start' : '▶ Start';
      else { text = '⏳ ' + (L.hostess() ? 'The TV' : hostName()) + ' starts the game'; off = true; }
    } else {
      const n = players(); off = n < need();
      text = K.mode === 'tv' && n === 1 && K.o.bot !== false ? '▶ Start vs 🤖' + (typeof K.o.bot === 'function' ? ' ' + K.o.bot() : '') : '▶ Start · ' + n + ' player' + (n === 1 ? '' : 's');
    }
    if (typeof K.C.playText === 'function') K.C.playText(text, {disabled: off});
    else { b.textContent = text; b.disabled = off; }
  }
  function sync(force) {
    if (!K || !K.mode) return;
    const st = L.status();
    if (live() && (st === 'idle' || st === 'closed')) { gone(st === 'closed' && K.mode === 'guest' ? '👋 ' + (K.hostName || 'The host') + ' closed the room' : ''); return; }
    if (live()) { if (K.mode === 'guest') K.hostName = hostName(); syncLine(force); paintCard(); }
    paintPlay();
  }
  function gone(msg) {   // the room is gone (closed here, by the host, or the link is lost) → back to playing on this device
    closeSheet(); const C = K.C, was = K.mode; K.mode = null; unmountCard();
    if (was === 'tv' || C.isHostess) C.hostess(false); else { C.room(null); C.setMode('solo'); }
    if (!C.lineup.some(s => s.seat === 0)) C.add({seat: 0, name: nm(), av: avOf() || undefined, where: 'here'});   // a guest's line held only the host's devices → you again
    const b = playBtn(); if (b) { b.disabled = false; b.textContent = '▶ Play'; }
    if (msg && window.UI && UI.toast) UI.toast(msg);
  }
  function close(ask) {
    if (!K || !K.mode) return;
    const go = () => { const was = K.mode; try { if (L.status() !== 'idle') L.leave(); } catch (e) { /* */ } gone(was === 'guest' ? '' : '📡 Room closed'); };
    const n = (L.players() || []).filter(p => p.name && p.on && !p.me && !p.screen).length;
    if (ask && n && (K.mode === 'host' || K.mode === 'tv') && window.UI && UI.confirm) UI.confirm({icon: '📡', title: 'Close your room?', body: 'The ' + n + ' player' + (n > 1 ? 's' : '') + ' on other devices will be sent out.', okText: 'Close room', cancelText: 'Stay'}).then(ok => { if (ok) go(); });
    else go();
  }
  function play() {
    if (!K || !live()) return;
    if (K.mode === 'guest') {
      if (L.hostess() && L.captain() === L.seat()) { snd('pop'); const b = playBtn(); if (window.UI && UI.busy && b) UI.busy(b, K.o.kind || 'link', 'Starting…'); L.ask('start'); }
      return;
    }
    if (players() < need()) { snd('error'); return; }
    snd('pop'); go();
  }
  function go() { L.start(); try { if (K.o.onStart) K.o.onStart(); } catch (e) { console.error('Link.cover onStart', e); } }
  // ---------- once ----------
  ['players', 'status', 'start', 'join', 'leave', 'rejoin', 'hostleft'].forEach(ev => L.on(ev, () => { if (K && K.mode) sync(); }));
  L.on('lk:ask', (d, seat) => {   // 📺 the first player's ▶ Start on their phone reaches the TV
    if (!K || K.mode !== 'tv' || !d || d.what !== 'start' || !L.isHost() || seat !== L.captain() || K.C.el.classList.contains('gf-hide')) return;
    if (players() >= need()) go();
  });
  function cover(C, o) {
    if (K && K.C !== C) { if (live()) close(false); K = null; }
    if (!K) {
      K = {C, o, mode: null, card: null, big: null, sheet: null, lobby: null, sig: ''};
      C.el.addEventListener('click', e => {   // ▶ on the cover while a room is open → start the room (GameFrame's own ▶ does not run)
        if (!K || K.C !== C || !K.mode || !e.target.closest('.gf-play')) return;
        e.stopPropagation(); e.preventDefault(); play();
      }, true);
      C.onChange((line, mode) => {
        if (!K || K.C !== C || !K.mode) return;
        if (mode !== 'own' && live()) { close(false); return; }   // 👥 Same device while a room is open = close the room
        if (mode !== 'own' && K.mode === 'pick') { closeSheet(); K.mode = null; return; }
        paintPlay();
      });
    }
    K.o = o || K.o;
    if (live() && L.status() !== 'idle') { sync(true); return K; }   // back from a match: the room is still open
    pick(); return K;
  }
  L.cover = cover;
  L.cover.active = C => !!(K && (!C || K.C === C) && live() && L.status() !== 'idle' && L.status() !== 'closed');
  L.cover.show = C => { if (!K || K.C !== C) return false; K.C.show(); if (live()) { if ((K.mode === 'tv' || (K.mode === 'guest' && L.hostess())) && !K.C.isHostess) K.C.room({code: digits().join(''), hostess: true}); else if (K.mode !== 'tv' && !L.hostess() && K.C.mode !== 'own') K.C.setMode('own'); sync(true); } return true; };
  L.cover.close = () => close(false);
  // 📺 lk-pp1b: from the 📺 Game Station — open the cover room straight as the Room hostess (no pick sheet) · start it (Station's start / again)
  L.cover.tv = (C, o) => { try { if (C.mode !== 'own' && C.setMode) C.setMode('own'); } catch (e) { /* */ } cover(C, o); if (K.mode === 'tv' && live()) return K; openRoom(true); return K; };
  L.cover.start = () => { if (!K || !live() || (K.mode !== 'tv' && K.mode !== 'host') || players() < need()) return false; snd('pop'); go(); return true; };
  L.cover.join = code => { if (K) join(code); };
  L.cover.state = () => K ? {mode: K.mode, sig: K.sig, card: !!(K.card && K.card.isConnected), big: !!(K.big && K.big.isConnected), sheet: !!(K.sheet && K.sheet.isConnected)} : null;
})();
