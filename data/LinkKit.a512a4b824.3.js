
(function () {
  'use strict';
  const EMOJI = ['🐶', '🐱', '🦊', '🐸', '🐵', '🦁', '🐼', '🐙', '🍎', '🍌', '🍓', '🍉', '🚗', '🚀', '⭐', '🎈'];
  const COLS = ['#4f8cff', '#ff5fa2', '#33d17a', '#f6a53b', '#a06bff'];   // 📺 lk-5a: a 5th seat for hostess rooms
  const STUN = [{urls: 'stun:stun.l.google.com:19302'}];
  const now = () => performance.now();
  const T = window.LINK_TIMING || {};               // tests can shorten waits
  const POLL_LOBBY = T.pollLobby || 1500, POLL_PLAY = T.pollPlay || 3000, GUEST_POLL = T.guestPoll || 1000;   // lk-2g: was 700 / 2500 / 600 — real calls take 1–3 s and queue up
  const REJOIN_FOR = T.rejoinFor || 60000, DROP_GRACE = T.dropGrace || 4000;
  // 🌍 lk-4a Anywhere mode: the server road for turn games
  const RELAY_POLL = T.relayPoll || 900, RELAY_DROP = T.relayDrop || 25000, RELAY_QUIET = T.relayQuiet || 20000, RELAY_WAIT = T.relayWait || 40000;
  const TURN_GAMES = {Chess: 1, Checkers: 1, Lettercraft: 1, Algebros: 1};

  let S;                                           // the whole state
  const handlers = {};
  function fresh() {
    return {role: null, code: null, emoji: null, game: '', mode: 'live', seatsN: 4, me: null, mySeat: null, seats: [], peers: {},
      seen: [], started: false, ice: null, status: 'idle', rtt: null, host: null, leaving: false, pollT: null, log: [], relay: null, hostess: false};
  }
  S = fresh();

  // ---------- helpers ----------
  function log(m) { S.log.push(((now() / 1000) | 0) + 's ' + m); if (S.log.length > 80) S.log.shift(); }
  function emit(ev, ...a) { (handlers[ev] || []).slice().forEach(fn => { try { fn(...a); } catch (e) { console.error('Link ' + ev, e); } }); }
  function rid(n) { const a = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = ''; for (let i = 0; i < n; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }
  function srv1(fn, args) {
    return new Promise((res, rej) => {
      if (!(window.google && google.script && google.script.run)) return rej(new Error('no server'));
      google.script.run.withSuccessHandler(res).withFailureHandler(e => rej(e instanceof Error ? e : new Error(String(e && e.message || e))))[fn](...args);
    });
  }
  // lk-2c: Safari says "Load failed" (Chrome "Failed to fetch" / "NetworkError") when one call to the server drops — try again (not linkHost: it
  // would open a 2nd room). After the last try the error says what to do.
  const NET_RE = /load failed|failed to fetch|networkerror|network error|connection|timed? ?out|http 0|aborted|offline/i;
  const NO_RETRY = {linkHost: 1};
  const NET_MSG = '📶 Lost the line to the family server for a moment — check the Wi-Fi / internet and try again';
  async function srv(fn, ...args) {
    const tries = NO_RETRY[fn] ? 1 : (T.tries || 4);
    for (let i = 1; ; i++) {
      const t0 = now();
      try { const out = await srv1(fn, args); const ms = now() - t0; if (ms > 2500) log('⏱ ' + fn + ' ' + Math.round(ms) + ' ms'); return out; }   // lk-2g
      catch (e) {
        if (!NET_RE.test(e.message)) throw e;
        log(fn + ' try ' + i + ': ' + e.message);
        if (i >= tries) { const n = new Error(NET_MSG); n.net = true; n.raw = e.message; throw n; }
        await new Promise(r => setTimeout(r, (T.retryMs || 500) * i));
      }
    }
  }
  function token() {
    try { let t = sessionStorage.getItem('lk_token'); if (!t) { t = rid(16); sessionStorage.setItem('lk_token', t); } return t; } catch (e) { return S.tok || (S.tok = rid(16)); }
  }
  function toCode(c) {
    if (Array.isArray(c)) return c.map(e => /^\d$/.test(String(e)) ? String(e) : EMOJI.indexOf(e).toString(16)).join('');   // lk-2e: digits
    return String(c || '').toLowerCase();
  }
  function toEmoji(code) { return String(code).split('').map(h => /\d/.test(h) ? h : EMOJI[parseInt(h, 16)]); }   // lk-2e: a number code stays numbers
  async function loadIce() {
    if (S.ice) return S.ice;
    try { S.ice = await srv('linkIce'); } catch (e) { S.ice = {relay: false, why: e.message}; }
    return S.ice;
  }
  function iceCfg() { return {iceServers: STUN.concat(S.ice && S.ice.relay ? S.ice.iceServers : [])}; }
  function waitIce(pc) {
    const relay = S.ice && S.ice.relay, ms = relay ? 5000 : 3000;
    return new Promise(res => {
      if (pc.iceGatheringState === 'complete') return res();
      let soon = null;
      const fin = () => { clearTimeout(t); clearTimeout(soon); res(); };
      const t = setTimeout(fin, ms);
      pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') fin(); });
      pc.addEventListener('icecandidate', e => {
        if (!e.candidate) return fin();
        if ((relay ? / typ relay/ : / typ srflx/).test(e.candidate.candidate) && !soon) soon = setTimeout(fin, T.iceSoon || 1000);   // lk-2e: was 300 ms — a PC with 2+ network cards gave its Wi-Fi path later
      });
    });
  }
  function sendRaw(p, obj, sure) {
    const c = sure ? p.sure : p.fast;
    if (c && c.readyState === 'open') { try { c.send(JSON.stringify(obj)); return true; } catch (e) { /* full buffer */ } }
    return false;
  }
  function setStatus(st) { if (S.status !== st) { S.status = st; log('status ' + st); emit('status', st); } }
  function toast(t) { if (window.UI && UI.toast) UI.toast(t); }

  // ---------- seats (host) ----------
  function seatList() {
    return S.seats.map(s => ({seat: s.seat, name: s.name, col: s.col, on: !!s.on, bot: !!s.bot, ping: s.ping == null ? null : Math.round(s.ping),
      me: s.seat === S.mySeat, host: s.seat === 0, av: s.av || null, road: s.road || '', screen: S.hostess && s.seat === 0}));   // 🌍 lk-4a: road = 'server' · 📺 lk-5a: screen = the hostess TV
  }
  function roster() {
    const players = seatList();
    Object.values(S.peers).forEach(p => sendRaw(p, {k: 'roster', players, started: S.started}, true));
    emit('players', players);
    roomSync(players);
  }
  function roomSync(players) {                                     // lk-2g: was a server call every 4 s
    const names = players.filter(x => x.name).map(x => x.name), sig = names.join('|') + '#' + S.started;
    if (S.roomBusy || (sig === S.roomSig && now() - (S.roomAt || 0) < 30000)) return;
    if (S.answering) return;                                       // the answer to a joining device goes first
    S.roomBusy = true; S.roomSig = sig; S.roomAt = now();
    srv('linkRoomSet', S.code, {players: names}).catch(() => { S.roomSig = ''; }).then(() => { S.roomBusy = false; });
  }
  function pickSeat(who) {
    // 1 same device (token) or same name on a seat that is not linked → rejoin; 2 a seat nobody owns
    let s = S.seats.find(x => x.seat > 0 && x.name && x.token && x.token === who.token);
    if (!s) s = S.seats.find(x => x.seat > 0 && x.name === who.name && !x.on);
    if (s) return {s, re: true};
    s = S.seats.find(x => x.seat > 0 && !x.name && !x.res);     // not held by a device that is still linking
    return s ? {s, re: false} : null;
  }
  function needSeat() { return S.seats.some(x => x.seat > 0 && (!x.name || !x.on)); }

  // ---------- 🔍 lk-2d: why a link failed (only path TYPES + a same/different-internet check, never addresses on screen) ----------
  function cands(sdp) {
    const c = {lan: 0, mdns: 0, net: 0, relay: 0, pub: []};
    String(sdp || '').split(/\r?\n/).forEach(l => {
      const m = /^a=candidate:\S+ \d+ (\w+) \d+ (\S+) \d+ typ (\w+)/i.exec(l); if (!m) return;
      if (m[3] === 'host') { if (/\.local$/i.test(m[2])) c.mdns++; else c.lan++; }
      else if (m[3] === 'srflx' || m[3] === 'prflx') { c.net++; if (c.pub.indexOf(m[2]) < 0) c.pub.push(m[2]); }
      else if (m[3] === 'relay') c.relay++;
    });
    return c;
  }
  function diagOf(offer, answer, pairs, ice) {
    const me = cands(offer), them = cands(answer);
    const same = me.pub.length && them.pub.length ? me.pub.some(a => them.pub.indexOf(a) >= 0) : null;
    const why = !answer ? 'noanswer' : me.lan + me.mdns + me.net + me.relay === 0 ? 'mine' : them.lan + them.mdns + them.net + them.relay === 0 ? 'theirs'
      : same === false ? 'other' : same === true ? 'apart' : '?';
    return {why, same, ice: ice || '', pairs: pairs || null,
      me: {local: me.lan + me.mdns, net: me.net, relay: me.relay}, host: {local: them.lan + them.mdns, net: them.net, relay: them.relay}};
  }
  // 🔍 lk-2f: the picked path, in words (no addresses): 🏠 local / 🌍 internet / 🛰️ relay · udp/tcp · v4 / v6 / name
  function addrKind(a) { a = String(a || ''); return /\.local$/i.test(a) ? 'name' : a.indexOf(':') >= 0 ? 'v6' : a ? 'v4' : '?'; }
  async function pairInfo(pc) {
    try {
      const st = await pc.getStats(); let pair = null; const by = {};
      st.forEach(x => { by[x.id] = x; });
      st.forEach(x => { if (x.type === 'transport' && x.selectedCandidatePairId) pair = by[x.selectedCandidatePairId]; });
      if (!pair) st.forEach(x => { if (x.type === 'candidate-pair' && (x.nominated || x.selected) && x.state === 'succeeded') pair = pair || x; });
      if (!pair) return 'no pair';
      const icon = t => t === 'host' ? '🏠' : t === 'relay' ? '🛰️' : '🌍';
      const side = c => c ? icon(c.candidateType) + (c.protocol || '') + ' ' + addrKind(c.address || c.ip) + (c.networkType ? ' ' + c.networkType : '') : '?';
      return side(by[pair.localCandidateId]) + ' ↔ ' + side(by[pair.remoteCandidateId]) + ' · rtt ' + (pair.currentRoundTripTime != null ? Math.round(pair.currentRoundTripTime * 1000) + 'ms' : '?');
    } catch (e) { return 'stats ' + e.message; }
  }
  function watchLink(pc, who) {                              // 🔍 lk-2f: picked path + 🔐 handshake state
    const pre = who ? who + ' ' : '';
    pc.addEventListener('iceconnectionstatechange', () => { if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') pairInfo(pc).then(t => log(pre + 'path ' + t)); });
    const dt = () => { const t = pc.sctp && pc.sctp.transport; if (!t || t._lk) return; t._lk = 1; log(pre + '🔐 ' + t.state);
      t.addEventListener('statechange', () => log(pre + '🔐 ' + t.state));
      t.addEventListener('error', e => log(pre + '🔐 error ' + ((e.error && e.error.message) || e.message || 'unknown'))); };
    pc.addEventListener('signalingstatechange', dt); pc.addEventListener('connectionstatechange', dt);
    setTimeout(dt, 1500);
  }
  function diagMsg(d) {
    if (!d) return '📶 Could not link — are you on the same Wi-Fi?';
    if (d.why === 'noanswer') return '😴 The host did not answer — is the game still open (and the screen on)?';
    if (d.why === 'nowelcome') return '😴 Linked, but the host did not say hi — try again';
    return d.why === 'other' ? '🌍 This device and the host are on different internet — put both on the same Wi-Fi (not mobile data)'
      : d.why === 'apart' ? '🏠 Same internet, but the Wi-Fi keeps the devices apart (a guest Wi-Fi, or the host on a cable) — try the same Wi-Fi name on both'
      : d.why === 'mine' ? '📵 This device found no way out — check its Wi-Fi'
      : d.why === 'theirs' ? '📵 The host device found no way out — check its Wi-Fi'
      : '📶 Could not link — are you on the same Wi-Fi?';
  }
  function diagLine(d, a, b) {
    if (!d) return '';
    const side = x => '🏠' + x.local + ' 🌍' + x.net + (x.relay ? ' 🛰️' + x.relay : '');
    return '🔍 ' + (a || 'you') + ' ' + side(d.me) + ' · ' + (b || 'host') + ' ' + side(d.host) + ' · same internet ' + (d.same == null ? '?' : d.same ? '✅' : '❌')
      + (d.pairs ? ' · tries ' + d.pairs.ok + '/' + d.pairs.n : '') + (d.ice ? ' · ' + d.ice : '');
  }

  // ---------- HOST ----------
  async function host(opt) {
    opt = opt || {};
    reset();
    S.role = 'host'; S.me = {name: opt.name || 'Host', av: opt.av || null, token: token()};
    S.game = opt.game || 'demo'; S.mode = opt.mode === 'turn' || TURN_GAMES[opt.game] ? 'turn' : 'live'; S.seatsN = Math.max(2, Math.min(4, opt.seats || 4));   // 🌍 lk-4a turn rooms · lk-4b: seatsN was commented out
    S.hostess = !!opt.hostess; if (S.hostess) S.seatsN = Math.min(5, S.seatsN + 1);   // 📺 lk-5a: seat 0 = the screen, the players sit on 1…n
    setStatus('hosting');
    await loadIce();
    const r = await srv('linkHost', {game: S.game, mode: S.mode, seats: S.seatsN, hostess: S.hostess, name: S.me.name, token: S.me.token, label: opt.label || '', page: opt.page || pageOf(S.game)});
    if (r.err) { setStatus('idle'); throw new Error(r.err); }
    S.code = r.code; S.emoji = toEmoji(r.code); S.mySeat = 0;
    S.seats = [];
    for (let i = 0; i < S.seatsN; i++) S.seats.push({seat: i, col: COLS[i], name: null, token: null, on: false, bot: false, ping: null, gid: null});
    Object.assign(S.seats[0], {name: S.me.name, token: S.me.token, on: true, av: S.me.av, gid: 'host'});
    log('hosting ' + S.code);
    hostPoll();
    emit('players', seatList());
    return {code: S.code, emoji: S.emoji};
  }
  async function hostPoll() {
    if (S.role !== 'host' || S.leaving) return;
    if ((!document.hidden || !S.started) && !S.answering) {        // lk-2g: the answer goes first
      try {
        const r = await srv('linkHostPoll', S.code, S.seen);
        if (r.err === 'gone') { log('room gone'); }
        for (const o of (r.offers || [])) if (!S.seen.includes(o.gid)) { S.seen.push(o.gid); hostAnswer(o); }
        if (r.relay > 0 && !S.relay) relayStart();   // 🌍 lk-4a: someone came by the server road
      } catch (e) { log('poll failed ' + e.message); }
    }
    S.pollT = setTimeout(hostPoll, S.started && !needSeat() ? POLL_PLAY : POLL_LOBBY);
  }
  async function hostAnswer(o) {
    const who = o.who || {};
    const pick = pickSeat(who);
    const p = {gid: o.gid, seat: pick ? pick.s.seat : -1, who, re: pick && pick.re, pc: new RTCPeerConnection(iceCfg()), fast: null, sure: null, t0: now()};
    S.peers[o.gid] = p;
    if (pick && !pick.re) pick.s.res = o.gid;                          // hold the seat while this device links
    p.giveUp = setTimeout(() => { if (!p.linked) dropPeer(p, 'timeout'); }, T.answerCap || 120000);   // lk-2g: 2 min while the answer is on its way; 30 s once it is out
    log('📨 ask from ' + who.name + ' → seat ' + p.seat); S.asks = (S.asks || 0) + 1; p.offer = o.sdp; emit('status', S.status);
    p.pc.addEventListener('datachannel', ev => { p[ev.channel.label] = ev.channel; wireHostChan(p, ev.channel); });
    p.pc.addEventListener('connectionstatechange', () => { log(who.name + ' line ' + p.pc.connectionState); hostPcState(p); });
    p.pc.addEventListener('iceconnectionstatechange', () => log(who.name + ' paths ' + p.pc.iceConnectionState));
    watchLink(p.pc, who.name);   // 🔍 lk-2f
    try {
      await p.pc.setRemoteDescription({type: 'offer', sdp: o.sdp});
      await p.pc.setLocalDescription(await p.pc.createAnswer());
      await waitIce(p.pc);
      const ta = now(); log('✉️ answer → server (' + p.pc.localDescription.sdp.length + ' chars)');   // 🔍 lk-2f
      S.answering = (S.answering || 0) + 1;
      let r; try { r = await srv('linkAnswer', S.code, o.gid, p.pc.localDescription.sdp); } finally { S.answering--; }
      clearTimeout(p.giveUp); p.giveUp = setTimeout(() => { if (!p.linked) dropPeer(p, 'timeout'); }, T.linkWait || 30000);   // lk-2g
      if (r.err) throw new Error(r.err);
      log('✉️ answer sent to ' + who.name + ' (' + Math.round(now() - p.t0) + ' ms, server ' + Math.round(now() - ta) + ' ms)');
    } catch (e) { log('answer failed ' + e.message); dropPeer(p, 'failed'); }
  }
  function wireHostChan(p, ch) {
    ch.addEventListener('message', ev => hostMsg(p, ev.data));
    if (ch.label !== 'sure') return;
    const opened = () => {
      if (p.opened) return; p.opened = true; log('🔗 ' + (p.who.name || '?') + ' line open');
      if (p.seat < 0) { sendRaw(p, {k: 'full'}, true); setTimeout(() => dropPeer(p, 'full'), 600); return; }
      const s = S.seats[p.seat];
      // an older link of the same seat (the device came back) — close it quietly
      Object.values(S.peers).forEach(q => { if (q !== p && q.seat === p.seat) { q.replaced = true; dropPeer(q, 'replaced'); } });
      const was = s.name;
      clearTimeout(p.giveUp); delete s.res;
      Object.assign(s, {name: p.who.name, token: p.who.token, av: p.who.av || null, on: true, bot: false, gid: p.gid, ping: null, road: p.relay ? 'server' : ''});
      p.linked = true; p.linkMs = Math.round(now() - p.t0);
      sendWelcome(p);
      log((p.re ? 'rejoin ' : 'join ') + s.name + ' seat ' + s.seat);
      emit(p.re && was ? 'rejoin' : 'join', {seat: s.seat, name: s.name});
      roster();
    };
    p.open = opened;                                                   // lk-2e: some browsers hand over a line that is already open (no 'open' event)
    if (ch.readyState === 'open') opened(); else ch.addEventListener('open', opened);
    ch.addEventListener('close', () => { if (!p.replaced) dropPeer(p, 'closed'); });
  }
  function sendWelcome(p) {
    sendRaw(p, {k: 'welcome', seat: p.seat, code: S.code, game: S.game, mode: S.mode, started: S.started, host: S.me.name, hostess: S.hostess, players: seatList()}, true);
  }
  function hostPcState(p) {
    const st = p.pc.connectionState;
    if (st === 'failed' || st === 'closed') dropPeer(p, st);
    else if (st === 'disconnected') { clearTimeout(p.dropT); p.dropT = setTimeout(() => { if (p.pc.connectionState !== 'connected') dropPeer(p, 'disconnected'); }, DROP_GRACE); }
  }
  function dropPeer(p, why) {
    if (p.dead) return; p.dead = true;
    if (!p.linked && S.role === 'host' && why !== 'replaced') {        // 🔍 lk-2e: tell the host why a device did not get in
      const d = diagOf(p.pc.localDescription && p.pc.localDescription.sdp, p.offer, null, p.pc.iceConnectionState);
      S.hostNote = '🔍 ' + (p.who.name || 'A device') + ' could not link (' + why + ') · ' + diagLine(d, 'host', p.who.name || 'guest').replace(/^🔍 /, '');
      log(S.hostNote); emit('status', S.status);
    }
    clearTimeout(p.dropT); clearTimeout(p.giveUp);
    if (S.seats[p.seat] && S.seats[p.seat].res === p.gid) delete S.seats[p.seat].res;
    try { p.pc.close(); } catch (e) { /* */ }
    delete S.peers[p.gid];
    if (!p.linked || p.replaced || S.role !== 'host') return;
    const s = S.seats[p.seat];
    if (!s || s.gid !== p.gid) return;
    s.on = false; s.ping = null;
    if (!S.started) { Object.assign(s, {name: null, token: null, av: null, bot: false}); }   // lobby: the seat is free again
    else s.bot = true;                              // 🎮 playing: 🤖 a bot keeps the seat warm until they come back
    log('leave seat ' + s.seat + ' (' + why + ')');
    emit('leave', {seat: s.seat, name: p.who.name, bot: s.bot, left: !!p.bye});
    roster();
  }
  function hostMsg(p, raw) {
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (m.k === 'm') emit(m.kind, m.d, p.seat);
    else if (m.k === 'q') { const s = S.seats[p.seat]; if (s && s.gid === p.gid) s.ping = now() - m.t; }
    else if (m.k === 'p') sendRaw(p, {k: 'q', t: m.t}, true);
    else if (m.k === 'bye') { p.bye = true; dropPeer(p, 'bye'); }
    else if (m.k === 'hi' && p.linked) sendWelcome(p);           // the guest missed the welcome → send it again
    else if (m.k === 'hi' && !p.linked && p.open && p.sure && p.sure.readyState === 'open') p.open();   // lk-2e: missed 'open' event
  }

  // ---------- GUEST ----------
  async function join(code, opt) {
    opt = opt || {};
    reset();
    S.role = 'guest'; S.code = toCode(code); S.emoji = toEmoji(S.code);
    S.me = {name: opt.name || 'Guest', av: opt.av || null, token: token()};
    if (!/^[0-9a-f]{4}$/.test(S.code)) throw new Error('nocode');
    setStatus('joining');
    await loadIce();
    return linkToHost(false);
  }
  // ⚡ lk-2h: the guest's "how to reach me" is made while the player still types the numbers (relay info + offer + paths ≈ 2–5 s on a real server)
  let WARM = null;
  function newGuestLink() {
    const pc = new RTCPeerConnection(iceCfg());
    const h = {gid: rid(12), pc, fast: pc.createDataChannel('fast', {ordered: false, maxRetransmits: 0}), sure: pc.createDataChannel('sure'), t0: now()};
    h.ready = pc.createOffer().then(o => pc.setLocalDescription(o)).then(() => waitIce(pc)).then(() => { h.offer = pc.localDescription.sdp; });
    return h;
  }
  async function warm() {
    if (WARM && now() - WARM.t0 < 60000 && (!WARM.pc || WARM.pc.signalingState === 'have-local-offer')) return;   // ready or still starting
    if (WARM && WARM.pc) { try { WARM.pc.close(); } catch (e) { /* */ } }
    WARM = {t0: now(), pc: null};
    try { await loadIce(); WARM = newGuestLink(); WARM.ready.catch(() => { WARM = null; }); } catch (e) { WARM = null; }
  }
  function takeWarm() {
    const w = WARM; WARM = null;
    if (w && w.pc && now() - w.t0 < 60000 && w.pc.signalingState === 'have-local-offer') { w.warm = true; return w; }
    if (w && w.pc) { try { w.pc.close(); } catch (e) { /* */ } }
    return null;
  }
  function linkToHost(again) {
    if (again && S.road === 'server') return relayToHost();   // 🌍 lk-4a: came back by the server road → go back the same way
    return new Promise(async (resolve, reject) => {
      const h = (!again && takeWarm()) || newGuestLink();
      const gid = h.gid, pc = h.pc;
      log(h.warm ? '⚡ ready before the 4th number (' + Math.round(now() - h.t0) + ' ms early)' : '📨 making the ask');
      h.t0 = now();
      let done = false;
      const fail = why => { if (done) return; done = true; try { pc.close(); } catch (e) { /* */ } log('link failed: ' + why);
        if (S.mode === 'turn' && !S.leaving && /^(nodirect|nohost)$/.test(why)) { log('🌍 trying the server road'); relayToHost().then(resolve, reject); return; }   // 🌍 lk-4a
        reject(new Error(why)); };
      const noDirect = async () => {                          // 🔍 lk-2d: look at the paths before closing
        if (done) return;
        let pairs = null;
        try { const st = await pc.getStats(); pairs = {n: 0, ok: 0}; st.forEach(x => { if (x.type === 'candidate-pair') { pairs.n++; if (x.state === 'succeeded') pairs.ok++; } }); } catch (e) { /* old browser */ }
        S.diag = diagOf(h.offer, h.answer, pairs, pc.iceConnectionState); log('no direct path ' + JSON.stringify(S.diag)); fail('nodirect');
      };
      h.sure.addEventListener('message', ev => guestMsg(h, ev.data, v => { if (!done) { done = true; resolve(v); } }, fail));
      h.fast.addEventListener('message', ev => guestMsg(h, ev.data));
      h.sure.addEventListener('open', () => {                    // say hi until the host's welcome arrives (any early message may be lost)
        log('🔗 line open'); S.step = 3; emit('status', S.status);
        const ask = () => { if (!done && h.sure.readyState === 'open') { sendRaw(h, {k: 'hi'}, true); h.hiT = setTimeout(ask, 1500); } };
        ask();
      });
      h.sure.addEventListener('close', () => { if (S.host === h) hostLost('closed'); });
      pc.addEventListener('iceconnectionstatechange', () => log('paths ' + pc.iceConnectionState));   // 🔍 lk-2e
      watchLink(pc, '');   // 🔍 lk-2f
      pc.addEventListener('connectionstatechange', () => {
        const st = pc.connectionState; log('line ' + st);
        if (st === 'failed') { if (S.host === h) hostLost('failed'); else noDirect(); }
        else if (st === 'disconnected' && S.host === h) { clearTimeout(h.dropT); h.dropT = setTimeout(() => { if (pc.connectionState !== 'connected' && S.host === h) hostLost('disconnected'); }, DROP_GRACE); }
      });
      try {
        await h.ready;                                              // lk-2h: made by newGuestLink (maybe while typing)
        S.diag = null; S.step = 1; emit('status', S.status); log('📨 ask sent (' + Math.round(now() - h.t0) + ' ms)');
        const r = await srv('linkJoin', S.code, gid, pc.localDescription.sdp, {name: S.me.name, token: S.me.token, av: S.me.av});
        if (r.err) return fail(r.err);
        S.game = r.game; S.mode = r.mode; S.seatsN = r.seats;
        const until = now() + (T.answerMs || 90000);   // lk-2g: 90 s (lk-2e 45 s) — the real server can be slow
        let ans = null;
        while (!ans && !done && now() < until && !S.leaving) {
          await new Promise(res => setTimeout(res, GUEST_POLL));
          let a;
          try { a = await srv('linkGuestPoll', S.code, gid); } catch (e) { if (e.net && now() < until) continue; throw e; }   // lk-2c: keep waiting
          if (a.err) return fail(a.err === 'gone' ? 'gone' : a.err);
          if (a.sdp) ans = a.sdp;
        }
        if (!ans) { S.diag = diagOf(h.offer, null, null, ''); return fail(S.leaving ? 'left' : 'nohost'); }
        h.answer = ans; log('✉️ answer came (' + Math.round(now() - h.t0) + ' ms)'); S.step = 2; emit('status', S.status);
        await pc.setRemoteDescription({type: 'answer', sdp: ans});
        setTimeout(() => {                                   // line still not open → no direct path; open but no welcome yet → a slow host, wait a bit more
          if (done) return;
          if (pc.connectionState === 'connected' || h.sure.readyState === 'open') setTimeout(() => { if (!done) { S.diag = diagOf(h.offer, h.answer, null, pc.iceConnectionState); S.diag.why = 'nowelcome'; fail('nohost'); } }, 10000);
          else noDirect();
        }, T.directMs || (S.mode === 'turn' ? 8000 : 15000));   // 🌍 lk-4a
      } catch (e) { fail(e.message); }
      h.linkStart = now();
      S.pending = h;
    });
  }
  function guestMsg(h, raw, ok, fail) {
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (m.k === 'welcome') {
      const old = S.host;
      S.host = h; S.mySeat = m.seat; S.started = m.started; S.game = m.game; S.mode = m.mode; S.hostess = !!m.hostess;
      S.seats = m.players.map(x => Object.assign({}, x, {me: x.seat === m.seat}));
      h.linkMs = Math.round(now() - h.t0); clearTimeout(h.hiT);
      if (S.host === h && old === h && S.status === 'linked') { S.seats = m.players.map(x => Object.assign({}, x, {me: x.seat === m.seat})); return; }   // repeated welcome
      if (old && old !== h) { try { old.pc.close(); } catch (e) { /* */ } }
      const back = S.status === 'reconnecting';
      setStatus('linked');
      if (!S.pingT) S.pingT = setInterval(() => { if (S.host) sendRaw(S.host, {k: 'p', t: now()}, true); }, 2000);
      if (back) { log('back on seat ' + m.seat); emit('resume', {seat: m.seat}); }
      emit('players', S.seats);
      if (ok) ok({seat: m.seat, code: S.code, emoji: S.emoji, game: S.game, mode: S.mode, started: S.started});
    } else if (m.k === 'full') { if (fail) fail('full'); }
    else if (m.k === 'roster') { S.seats = m.players.map(x => Object.assign({}, x, {me: x.seat === S.mySeat})); S.started = m.started; emit('players', S.seats); }
    else if (m.k === 'start') { S.started = true; emit('start', m.d || {}); }
    else if (m.k === 'm') emit(m.kind, m.d, 0);
    else if (m.k === 'p') sendRaw(h, {k: 'q', t: m.t}, true);
    else if (m.k === 'q') { S.rtt = now() - m.t; S.lastQ = now(); }
    else if (m.k === 'bye') { S.hostGone = true; S.host = null; setStatus('closed'); emit('hostleft', {reason: 'left'}); }
  }
  function hostLost(why) {
    if (S.leaving || S.hostGone || S.status === 'reconnecting') return;
    log('host lost (' + why + ')');
    try { S.host && S.host.pc.close(); } catch (e) { /* */ }
    S.host = null;
    setStatus('reconnecting');
    emit('pause', {reason: 'link'});
    rejoinLoop(now());
  }
  async function rejoinLoop(t0) {
    while (!S.leaving && S.status === 'reconnecting' && now() - t0 < REJOIN_FOR) {
      if (!document.hidden) {
        try { await linkToHost(true); return; } catch (e) {
          if (/gone|nocode/.test(e.message)) break;
        }
      }
      await new Promise(res => { S.wake = res; setTimeout(res, 2000); });
    }
    if (S.status === 'reconnecting') { setStatus('closed'); emit('hostleft', {reason: 'lost'}); }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    if (S.role === 'guest' && S.host && S.host.pc.connectionState !== 'connected') hostLost('back from background');
    if (S.wake) { const w = S.wake; S.wake = null; w(); }
  });

  // ---------- 🌍 lk-4a Anywhere mode: the SERVER ROAD (turn games) ----------
  // A road channel looks like a WebRTC data channel to the rest of the kit: readyState, send(), addEventListener(message / open / close).
  // Everything sent is queued; ONE pump call (linkRelay) sends the queue and brings what is new, about every second.
  function RoadChan(gid, label) { this.gid = gid; this.label = label; this.readyState = 'open'; this.ls = {}; }
  RoadChan.prototype.addEventListener = function (ev, fn) { (this.ls[ev] = this.ls[ev] || []).push(fn); if (ev === 'open' && this.readyState === 'open') setTimeout(() => fn({}), 0); };
  RoadChan.prototype.fire = function (ev, e) { (this.ls[ev] || []).slice().forEach(fn => { try { fn(e || {}); } catch (x) { console.error('Link road', x); } }); };
  RoadChan.prototype.send = function (str) {
    const R = S.relay; if (!R || this.readyState !== 'open') throw new Error('closed');
    const q = R.out[this.gid] = R.out[this.gid] || [];
    if (this.label === 'fast' && q.length > 20) return;                   // fast = may be lost; never let it pile up on a slow road
    q.push({s: R.seq[this.gid] = (R.seq[this.gid] || 0) + 1, m: str});
    clearTimeout(R.soonT); R.soonT = setTimeout(relayPump, 60);           // send soon (a few messages ride together)
  };
  RoadChan.prototype.close = function () { if (this.readyState === 'closed') return; this.readyState = 'closed'; this.fire('close'); };
  const ROAD_PC = () => ({close() {}, connectionState: 'connected', iceConnectionState: 'server', signalingState: 'stable', localDescription: null, getStats: () => Promise.resolve(new Map())});
  function relayStart() {
    if (S.relay) return S.relay;
    S.relay = {out: {}, acks: {}, seq: {}, busy: false, t: null, soonT: null, sent: [], who: null};
    log('🌍 server road on');
    setTimeout(relayPump, 0);
    return S.relay;
  }
  function relayStop() { const R = S.relay; if (!R) return; clearTimeout(R.t); clearTimeout(R.soonT); S.relay = null; }
  function relayFlush() { const R = S.relay; if (!R) return null; const pend = Object.values(R.out).some(q => q.length); if (!pend) return null; return relayPump(true); }
  function relayPump(now_) {
    const R = S.relay;
    if (!R || !S.code) return null;
    if (R.busy) { if (now_) R.again = true; return R.busy; }
    if (S.role === 'host' && S.answering && !now_) { clearTimeout(R.t); R.t = setTimeout(relayPump, 300); return null; }   // the answer to a joining device goes first (lk-2g)
    clearTimeout(R.t); clearTimeout(R.soonT);
    const host = S.role === 'host', out = R.out; R.out = {};
    const sentN = Object.values(out).reduce((n, q) => n + q.length, 0);
    const call = srv('linkRelay', S.code, host ? 'host' : 'guest', out, Object.assign({}, R.acks), host ? null : R.who)
      .then(r => { if (S.relay !== R) return; relayGot(R, r || {}); })
      .catch(e => {                                                       // keep what was not sent (numbered: a repeat is never doubled)
        if (S.relay !== R) return;
        Object.keys(out).forEach(g => { R.out[g] = out[g].concat(R.out[g] || []); });
        log('🌍 road call failed: ' + e.message);
      })
      .then(() => {
        if (S.relay !== R) return;
        R.busy = false;
        const more = R.again || Object.values(R.out).some(q => q.length); R.again = false;
        R.t = setTimeout(relayPump, more ? 60 : (document.hidden ? RELAY_POLL * 4 : RELAY_POLL));
      });
    R.busy = call;
    if (sentN) log('🌍 → ' + sentN + ' msg');
    return call;
  }
  function relayGot(R, r) {
    if (r.gone) {                                                         // the room was closed
      if (S.role === 'guest' && !S.hostGone && !S.leaving) { S.hostGone = true; S.host = null; relayStop(); setStatus('closed'); emit('hostleft', {reason: 'left'}); }
      return;
    }
    if (S.role === 'host') {
      (r.fresh || []).forEach(f => { if (!(f.gid in R.acks)) { R.acks[f.gid] = 0; relayPeer(f.gid, f.who || {}); } });
      Object.keys(r.age || {}).forEach(g => { const p = S.peers[g]; if (p && p.relay && p.linked && r.age[g] > RELAY_DROP) { log('🌍 ' + (p.who.name || '?') + ' went quiet'); dropPeer(p, 'quiet'); } });
    }
    Object.keys(r.in || {}).forEach(g => {
      (r.in[g] || []).forEach(x => {
        if (!(x.s > (R.acks[g] || 0))) return;
        R.acks[g] = x.s;
        const ch = S.role === 'host' ? (S.peers[g] && S.peers[g].relay ? S.peers[g].sure : null) : (S.road === 'server' && S.roadH && S.roadH.gid === g ? S.roadH.sure : null);
        if (ch) ch.fire('message', {data: x.m});
      });
    });
    if (S.role === 'guest' && S.host && S.host.relay && S.status === 'linked') {   // the host went quiet / away → the normal reconnect
      if ((r.hostAge || 0) > 60000 || (S.lastQ && now() - S.lastQ > RELAY_QUIET)) hostLost('quiet');
    }
  }
  // host: a device came by the server road
  function relayPeer(gid, who) {
    if (S.peers[gid]) return;
    Object.values(S.peers).forEach(q => { if (!q.linked && q.who && who.token && q.who.token === who.token) dropPeer(q, 'road'); });   // its failed direct try
    const pick = pickSeat(who);
    const p = {gid, seat: pick ? pick.s.seat : -1, who, re: pick && pick.re, relay: true, pc: ROAD_PC(), t0: now(), offer: null};
    p.sure = new RoadChan(gid, 'sure'); p.fast = new RoadChan(gid, 'fast');
    S.peers[gid] = p;
    log('🌍 ' + (who.name || '?') + ' came by the server road → seat ' + p.seat);
    wireHostChan(p, p.fast); wireHostChan(p, p.sure);                     // 'sure' opens at once → seat + welcome
  }
  // guest: join by the server road
  function relayToHost() {
    return new Promise((resolve, reject) => {
      relayStop();
      const R = relayStart(), gid = rid(12);
      R.who = {name: S.me.name, token: S.me.token};
      R.acks[gid] = 0;
      const h = {gid, relay: true, pc: ROAD_PC(), t0: now()};
      h.sure = new RoadChan(gid, 'sure'); h.fast = new RoadChan(gid, 'fast');
      S.road = 'server'; S.roadH = h; S.step = 4; S.lastQ = now(); emit('status', S.status);
      let done = false;
      const fail = why => { if (done) return; done = true; clearTimeout(h.hiT); clearTimeout(h.giveUp); relayStop(); log('🌍 road failed: ' + why); reject(new Error(why)); };
      h.sure.addEventListener('message', ev => guestMsg(h, ev.data, v => { if (!done) { done = true; clearTimeout(h.giveUp); S.lastQ = now(); log('🌍 linked by the server road'); resolve(v); } }, fail));
      h.sure.addEventListener('close', () => { if (S.host === h) hostLost('closed'); });
      const ask = () => { if (!done) { sendRaw(h, {k: 'hi'}, true); h.hiT = setTimeout(ask, 3000); } };
      ask();
      h.giveUp = setTimeout(() => fail('nohost'), RELAY_WAIT);
    });
  }

  // ---------- 📺 lk-5a: hostess + captain ----------
  function captain() {   // the first player: lowest seat > 0 that is on (hostess rooms only)
    if (!S.hostess) return null;
    const c = (S.role === 'host' ? S.seats : S.seats).filter(p => p.seat > 0 && p.on && p.name).sort((a, b) => a.seat - b.seat)[0];
    return c ? c.seat : null;
  }
  function ask(what, data) { return send('lk:ask', {what, d: data == null ? null : data}, {sure: true}); }

  // ---------- both ----------
  function send(kind, data, opt) {
    opt = opt || {};
    const msg = {k: 'm', kind, d: data};
    if (S.role === 'guest') return S.host ? sendRaw(S.host, msg, !!opt.sure) : false;
    if (S.role !== 'host') return false;
    let n = 0;
    Object.values(S.peers).forEach(p => { if (p.linked && (opt.to == null || opt.to === 'all' || opt.to === p.seat)) n += sendRaw(p, msg, !!opt.sure) ? 1 : 0; });
    return n;
  }
  function start(d) {
    if (S.role !== 'host') return;
    S.started = true;
    Object.values(S.peers).forEach(p => sendRaw(p, {k: 'start', d: d || {}}, true));
    srv('linkRoomSet', S.code, {started: true}).catch(() => {});
    emit('start', d || {});
    roster();
  }
  function reset() {
    clearTimeout(S.pollT); clearInterval(S.pingT); clearInterval(S.hpingT); relayStop();
    Object.values(S.peers || {}).forEach(p => { try { p.pc.close(); } catch (e) { /* */ } });
    if (S.host) { try { S.host.pc.close(); } catch (e) { /* */ } }
    const keepIce = S.ice;
    S = fresh(); S.ice = keepIce;
  }
  function leave() {
    S.leaving = true;
    let done = Promise.resolve();
    if (S.role === 'host') {
      Object.values(S.peers).forEach(p => sendRaw(p, {k: 'bye'}, true));
      if (S.code) done = srv('linkRoomSet', S.code, {closed: true}).catch(() => {});
    } else if (S.host) sendRaw(S.host, {k: 'bye'}, true);
    const road = relayFlush();   // 🌍 lk-4a: send the 'bye' now (the road is a server call, not a line)
    const was = S;   // lk-5g: a NEW room opened within 150 ms (host / join right after leave) must not be wiped by this late reset
    setTimeout(() => { if (S !== was) return; reset(); setStatus('idle'); }, 150);
    if (road) done = Promise.all([done, road]);
    return Promise.race([done, new Promise(r => setTimeout(r, T.closeWait || 2500))]);   // lk-2e: callers can wait for the room to close
  }
  // 🚪 lk-2e: a host leaving the PAGE (◀ / 🏠 / any UI.go) → "Close your room?" → the server closes it BEFORE the page goes,
  // so the 🏠 waiting rooms drop it at once (a request sent while the page unloads is often lost)
  function hosting() { return S.role === 'host' && !!S.code && !S.leaving; }
  function askClose() {
    const n = Object.values(S.peers).filter(p => p.linked).length;
    if (!(window.UI && UI.confirm)) return Promise.resolve(true);
    return UI.confirm({icon: '📡', title: 'Close your room?', body: n ? 'The ' + n + ' player' + (n > 1 ? 's' : '') + ' on other devices will be sent out.' : 'Nobody can join it after this.',
      okText: 'Close room', cancelText: 'Stay'});
  }
  function guardNav() {
    if (!window.UI || UI._lkNav) return; UI._lkNav = true;
    ['go', 'back', 'goHome'].forEach(k => {
      const f = UI[k]; if (typeof f !== 'function') return;
      UI[k] = function () {
        if (!hosting()) return f.apply(this, arguments);
        const self = this, args = arguments;
        return askClose().then(ok => { if (!ok) return; log('🚪 room closed (left the page)'); return leave().then(() => f.apply(self, args)); });
      };
    });
  }
  guardNav();
  if (!window.UI) document.addEventListener('DOMContentLoaded', guardNav);
  // host: ping every guest every 2 s (seat colours in the lobby / game)
  setInterval(() => {
    if (S.role !== 'host') return;
    Object.values(S.peers).forEach(p => { if (p.linked) sendRaw(p, {k: 'p', t: now()}, true); });
  }, 2000);
  setInterval(() => { if (S.role === 'host' && S.code) roster(); }, 4000);

  // ---------- 🧩 ready-made lobby ----------
  function lobby(el, opt) {
    opt = opt || {};
    const L = {el, opt, picked: [], msg: '', bad: false, diag: '', typeFor: ''};
    el.classList.add('lk');
    const min = opt.minPlayers || 2;
    const solo = () => !!(S.hostess && opt.soloBot);   // 📺 lk-5g: a Room hostess game can start with ONE player — the 🤖 robot takes the other side
    const need = () => solo() ? 1 : min;
    const startTxt = n => n === 1 && solo() ? '▶ Start vs 🤖' : '▶ Start (' + n + ' player' + (n === 1 ? '' : 's') + ')';
    function avatar(cv, p) {
      const g = cv.getContext('2d'), d = Math.min(2, window.devicePixelRatio || 1), w = 48 * d;
      cv.width = cv.height = w; g.clearRect(0, 0, w, w);
      if (opt.drawAvatar && p.name) { try { opt.drawAvatar(cv, p); return; } catch (e) { /* fall back */ } }
      g.beginPath(); g.arc(w / 2, w / 2, w * .42, 0, 7); g.fillStyle = p.col; g.fill();
      g.fillStyle = '#fff'; g.font = '800 ' + Math.round(w * .42) + 'px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(p.name ? p.name[0].toUpperCase() : '?', w / 2, w / 2 + 1);
    }
    function pingTxt(p) {
      if (p.screen) return p.me ? '📺 this screen' : '📺 room hostess';   // 📺 lk-5a
      if (p.me) return p.host ? '👑 host' : 'you';
      if (!p.on) return p.bot ? '🤖 bot (away)' : '';
      if (p.host) return '👑 host';
      if (p.road === 'server') return '🌍 via server';   // lk-4a
      return p.ping == null ? '🟢' : (p.ping < 60 ? '🟢 ' : p.ping < 150 ? '🟡 ' : '🔴 ') + p.ping + ' ms';
    }
    function seatsHtml() {
      const list = S.role === 'host' ? seatList() : S.seats;     // rounded pings + me / host flags
      return '<div class="lk-seats" style="grid-template-columns:repeat(' + Math.max(2, list.length) + ',1fr)">' + list.map(p => {
        if (!p.name) return '<div class="lk-seat wait" style="border-color:' + p.col + '"><span class="ic">📲</span><span class="pg">waiting…</span></div>';
        return '<div class="lk-seat' + (p.bot && !p.on ? ' bot' : '') + '" style="border-color:' + p.col + '" data-seat="' + p.seat + '">' + (p.me ? '<span class="me">⭐</span>' : '') +
          '<canvas></canvas><span class="nm">' + esc(p.name) + '</span><span class="pg">' + pingTxt(p) + '</span></div>';
      }).join('') + '</div>';
    }
    function codeHtml(arr, pop) {
      return '<div class="lk-code" aria-label="room code">' + [0, 1, 2, 3].map(i => arr[i] ? '<div class="lk-tile' + (/^\d$/.test(arr[i]) ? ' num n' + arr[i] : '') + (pop && i === arr.length - 1 ? ' pop' : '') + '">' + arr[i] + '</div>' : '<div class="lk-tile empty"></div>').join('') + '</div>';
    }
    function fx(html, key, ok) {   // ✨ lk-5a2: a title card; it pops in only when the words change
      const pop = key !== L.fxKey; L.fxKey = key;
      return '<span class="lk-fx' + (ok ? ' lk-fx-ok' : '') + (pop ? ' lk-fx-in' : '') + '"><span>' + html + '</span><i class="lk-fx-s" aria-hidden="true"></i></span>';
    }
    function traceHtml() { return '<div class="lk-trace">' + esc(S.log.slice(-30).join('\n')) + '</div>'; }   // lk-2f: 30 lines   // 🔍 lk-2e
    function paint(pop) {
      const st = S.status, h = [];
      const title = opt.title || S.game || 'Play together';
      if (S.role === 'host') {
        const on = S.seats.filter(p => p.on && !(S.hostess && p.seat === 0)).length;   // 📺 lk-5a: the screen is no player
        h.push('<div class="lk-head">' + (S.hostess ? '📺 ' : '📡 ') + esc(title) + '</div>');
        h.push('<div class="lk-card"><div class="lk-host-top"><div><div class="lk-sub">Room number — type it on the other devices</div>' + codeHtml(S.emoji || []) +
          '</div>' + (opt.url && typeof qrcode === 'function' ? '<canvas class="lk-qr"></canvas>' : '') + '</div></div>');
        h.push('<div class="lk-card">' + seatsHtml() + '</div>');
        if (!S.started) h.push('<div class="lk-row"><button class="lk-btn" data-act="start"' + (on < need() ? ' disabled' : '') + '>' + startTxt(on) + '</button></div>');
        if (S.hostess && !S.started) h.push('<div class="lk-tip lk-tv">📺 This screen is the <b>Room hostess</b> — players tap 🔗 Join a friend on their own device. ' + (on < need() ? 'Waiting for ' + (need() - on) + ' more player' + (need() - on === 1 ? '' : 's') : solo() && on === 1 ? '1 player = you vs 🤖 the robot · a 2nd player can still join · the player can ▶ Start on their device too' : 'The first player can ▶ Start on their device too') + '</div>');
        h.push('<div class="lk-tip">' + (S.mode === 'turn' ? '📶 Same Wi-Fi links fastest · 🌍 other houses work too (through the family server)' : '📶 Everyone on the same Wi-Fi' + (S.ice && S.ice.relay ? ' — or anywhere (🛰️ relay on)' : '')) + '</div>');   // lk-5a: turn rooms go anywhere since lk-4a
        const linking = Object.values(S.peers).filter(q => !q.linked).length;   /* 🔍 lk-2e: what the host sees while a device links */
        if (linking || S.hostNote || S.asks) h.push('<div class="lk-hostnote">' + (linking ? fx('📨 ' + linking + ' device' + (linking > 1 ? 's' : '') + ' linking<span class="lk-dots"></span>', 'h' + linking) : '') +
          (S.hostNote && !linking ? esc(S.hostNote) : '') + ' <button class="lk-tbtn" data-act="trace">🔍 details</button></div>' + (L.trace ? traceHtml() : ''));
      } else if (S.role === 'guest' && (st === 'linked' || st === 'reconnecting')) {
        h.push('<div class="lk-head">📡 ' + esc(title) + '</div>');
        h.push('<div class="lk-card">' + codeHtml(S.emoji || []) + '</div>');
        h.push('<div class="lk-card">' + seatsHtml() + '</div>');
        const cap = captain() === S.mySeat && !S.started && st === 'linked', pn = S.seats.filter(p => p.on && !p.screen).length;   // 📺 lk-5a: the first player starts from their own device
        if (cap) h.push('<div class="lk-row"><button class="lk-btn" data-act="ask-start"' + (pn < need() ? ' disabled' : '') + '>' + startTxt(pn) + '</button></div>');
        if (st === 'linked' && !L.wasLinked) { L.wasLinked = true; L.yayUntil = Date.now() + 2600; setTimeout(() => { if (el.isConnected) paint(); }, 2700); }   // ✨ lk-5a2: a short "Linked!" card
        if (st === 'reconnecting') L.wasLinked = false;
        h.push('<div class="lk-msg">' + (st === 'reconnecting' ? fx('🔁 Linking again<span class="lk-dots"></span>', 'again') : L.yayUntil > Date.now() && !S.started ? fx('🔗 Linked to ' + esc(S.hostess ? 'the 📺 TV' : (S.seats.find(p => p.host) || {}).name || 'the host') + '! ✨', 'yay', true) : S.started ? '🎮 Playing!' : cap ? (pn < need() ? '⏳ Waiting for more players<span class="lk-dots"></span>' : solo() && pn === 1 ? '👑 Tap ▶ Start to play the 🤖 robot — or wait for a friend to join' : '👑 You are the first player — tap ▶ Start when everyone is in') : '⏳ Waiting for ' + esc(S.hostess ? 'the first player or the 📺 TV' : (S.seats.find(p => p.host) || {}).name || 'the host') + ' to start<span class="lk-dots"></span>') + '</div>');
      } else {
        h.push('<div class="lk-head">🔗 Join a game</div>' + (L.typeFor ? '<div class="lk-hint">🎯 Type the 4 numbers on ' + esc(L.typeFor) + '\'s screen</div>'   /* lk-2d */
          : '<div class="lk-sub">Type the 4 numbers you see on the host screen</div>'));
        h.push('<div class="lk-card lk-joincard"><div class="lk-jl">' + codeHtml(L.picked, pop) + '</div><div class="lk-pad keys">' +   /* 🔢 lk-2e: phone keypad */
          [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => '<button data-e="' + n + '" aria-label="' + n + '">' + n + '</button>').join('') +
          '<button class="bk" data-act="back" aria-label="Undo">⌫</button><button data-e="0" aria-label="0">0</button><span></span></div></div>');
        h.push('<div class="lk-msg' + (L.bad ? ' bad' : '') + '">' + (st === 'joining' ? fx(['📶 Linking', '📨 1/3 Asking the host', '✉️ 2/3 The host answered', '🔗 3/3 Opening the line', '🌍 Not the same Wi-Fi — going through the family server'][S.step || 0] + '<span class="lk-dots"></span>', 'j' + (S.step || 0)) : L.msg) + '</div>');
        if (L.bad && st !== 'joining') h.push('<div class="lk-row"><button class="lk-tbtn" data-act="trace">🔍 ' + (L.trace ? 'hide' : 'details') + '</button></div>');   /* lk-2e */
        if (L.diag && st !== 'joining') h.push('<div class="lk-diag">' + esc(L.diag) + '</div>');   /* 🔍 lk-2d */
        if (L.bad && st !== 'joining' && L.trace) h.push(traceHtml());   /* 🔍 lk-2e */
      }
      el.innerHTML = h.join('');
      const plist = S.role === 'host' ? seatList() : S.seats;
      el.querySelectorAll('.lk-seat[data-seat] canvas').forEach(cv => { const p = plist.find(x => x.seat === +cv.parentNode.dataset.seat); if (p) avatar(cv, p); });
      const q = el.querySelector('.lk-qr');
      if (q) {
        const qr = qrcode(0, 'L'); qr.addData(opt.url + (opt.url.indexOf('?') < 0 ? '?' : '&') + 'link=' + S.code); qr.make();
        const n = qr.getModuleCount(), g = q.getContext('2d'); q.width = q.height = n * 4;
        g.fillStyle = '#fff'; g.fillRect(0, 0, q.width, q.height); g.fillStyle = '#000';
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) g.fillRect(c * 4, r * 4, 4, 4);
      }
    }
    async function tryJoin() {
      L.msg = ''; L.bad = false; L.diag = ''; paint();
      try {
        const r = await join(L.picked.slice(), {name: opt.name, av: opt.av});
        L.picked = []; paint();
        if (opt.onJoined) opt.onJoined(r);
      } catch (e) {
        const why = e.message;
        L.bad = true;
        L.msg = why === 'nocode' ? '🤔 No game with those numbers — check the host screen' : why === 'full' ? '🙈 That game is full' :
          why === 'nodirect' ? diagMsg(S.diag) : why === 'nohost' ? diagMsg(S.diag && (S.diag.why === 'noanswer' || S.diag.why === 'nowelcome') ? S.diag : {why: 'noanswer'}) : why === 'asleep' ? '😴 That room\'s host has left — check the 4 numbers on the host screen' : why === NET_MSG ? why : '😕 ' + why;   /* lk-2d: 📶 message has its own icon */
        L.diag = (why === 'nodirect' || why === 'nohost') && S.diag ? diagLine(S.diag) : '';
        L.trace = false;
        L.picked = []; setStatus('idle'); S.role = null; paint();
      }
    }
    el.onclick = ev => {
      const b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.e != null && L.picked.length < 4 && S.status !== 'joining') {
        L.picked.push(String(b.dataset.e)); if (navigator.vibrate) navigator.vibrate(8); warm();   // ⚡ lk-2h: (re)warm if it went stale
        paint(true);
        if (L.picked.length === 4) tryJoin();
      } else if (b.dataset.act === 'back') { L.picked.pop(); L.msg = ''; L.bad = false; paint(); }
      else if (b.dataset.act === 'trace') { L.trace = !L.trace; paint(); }   // 🔍 lk-2e
      else if (b.dataset.act === 'start') { if (window.UI && UI.busy) UI.busy(b, opt.kind || 'link', 'Starting…'); start(); if (opt.onStart) opt.onStart(); }
      else if (b.dataset.act === 'ask-start') { if (window.UI && UI.busy) UI.busy(b, opt.kind || 'link', 'Starting…'); ask('start'); }   // 📺 lk-5a
    };
    const asked = (d, seat) => {   // 📺 lk-5a: the first player's ▶ Start reaches the host lobby
      if (S.role !== 'host' || S.started || !d || d.what !== 'start' || !el.isConnected || seat !== captain()) return;
      if (S.seats.filter(p => p.on && !(S.hostess && p.seat === 0)).length < need()) return;   // 📺 lk-5g: 1 is enough with soloBot
      log('▶ start asked by seat ' + seat); start(); if (opt.onStart) opt.onStart();
    };
    on('lk:ask', asked);
    const re = () => { if (el.isConnected) paint(); };   // lk-2e: status also fires on a 📨 ask / 🔍 host note
    ['players', 'status', 'start'].forEach(ev => on(ev, re));
    L.close = () => { ['players', 'status', 'start'].forEach(ev => off(ev, re)); off('lk:ask', asked); };
    if (!opt.code && S.role !== 'host') warm();                         // ⚡ lk-2h
    const hint = typeHint(opt.code);                                  // lk-2d: from the 🏠 waiting room → the player types the code
    if (hint) { L.typeFor = hint.host || 'the host'; paint(); }
    else if (opt.code) { L.picked = toEmoji(toCode(opt.code)); paint(); tryJoin(); } else paint();
    return L;
  }
  // ---------- 🏠 waiting rooms (lk-2a): the Dashboard lists the open family rooms → ▶ Join opens the game with the code ----------
  const GAME_PAGES = {SlaBrall: {page: 'slabrall', icon: '🏓'}, Lettercraft: {page: 'wordboard', icon: '🔤'}, Chess: {page: 'chess', icon: '♟️'}, Checkers: {page: 'checkers', icon: '🔴'}, Algebros: {page: 'numberboard', icon: '➗'}};   // lk-3a: + Lettercraft · lk-3b: + Chess · lk-3c: + Checkers · lk-3d: + Algebros   // rooms made before lk-2a / without opt.page
  function lkbName(r) { const l = String(r.label || ''), g = String(r.game || ''); return !l ? g : !g || l.indexOf(g) >= 0 ? l : g + ' · ' + l; }   // lk-2b: game + what is played
  function pageOf(game) { return (GAME_PAGES[game] || {}).page || ''; }
  // lk-2d: ▶ Join in a waiting room → the game opens the picture pad EMPTY and the player taps the code (the host's QR still fills it in)
  function typeHint(code) {
    let h = null;
    try { h = JSON.parse(localStorage.getItem('lk_type') || 'null'); localStorage.removeItem('lk_type'); } catch (e) { return null; }
    if (!h || !code || h.code !== toCode(code) || Date.now() - (h.at || 0) > 5 * 60000) return null;
    return h;
  }
  function board(el, opt) {
    opt = opt || {};
    const every = opt.every || T.board || 8000, B = {el, rooms: [], timer: null, busy: false, loaded: false, err: false};
    el.classList.add('lkb'); el.hidden = false;   // lk-2c: shows "looking for rooms" while the first list loads
    const me = () => (typeof opt.player === 'function' ? opt.player() : opt.player) || '';
    function urlFor(r) {
      const p = me();
      return (opt.url || '') + '?page=' + encodeURIComponent(r.page || pageOf(r.game)) + (p ? '&player=' + encodeURIComponent(p) : '') + '&link=' + r.code;
    }
    const head = () => '<div class="lkb-h">📡 ' + esc(opt.title || 'Waiting rooms') + (opt.th ? ' <span class="th" lang="th">' + esc(opt.th) + '</span>' : '')
      + '<span class="lkb-spin" aria-hidden="true">🔄</span></div>';
    function paint() {
      const list = B.rooms.filter(r => r.page || pageOf(r.game));
      el.classList.toggle('lkb-busy', B.busy);
      if (!list.length) {
        const show = !B.loaded || opt.always;
        el.hidden = !show; el.classList.toggle('lkb-empty', B.loaded);
        if (!show) { el.innerHTML = ''; return; }
        el.innerHTML = head() + (!B.loaded ? '<div class="lkb-msg lkb-load"><span class="ui-spin a-bob">📡</span> Looking for open rooms<span class="lk-dots"></span></div>'
          : B.err ? '<div class="lkb-msg">📶 Can\'t check the rooms right now — trying again…</div>'
          : '<div class="lkb-msg">' + esc(opt.empty || 'No room open right now') + '</div>');
        return;
      }
      el.hidden = false; el.classList.remove('lkb-empty');
      const who = me();
      el.innerHTML = head() + '<div class="lkb-list">' + list.map(r => {
        const icon = (GAME_PAGES[r.game] || {}).icon || '🎮', mine = who && r.host === who, n = (r.players || []).length, full = !r.started && n >= r.seats;
        const tv = r.hostess ? 1 : 0, state = (tv ? '📺 on the TV · ' : '') + (r.started ? '🎮 playing — join for the next match' : full ? '🙈 full' : '⏳ waiting · ' + (n - tv) + '/' + (r.seats - tv));   // 📺 lk-5a
        return '<div class="lkb-room' + (mine ? ' mine' : '') + '" data-code="' + r.code + '"><div class="lkb-ic">' + icon + '</div><div class="lkb-t">'
          + '<b>' + esc(mine ? 'Your room is open' : r.host + ' is hosting') + '</b>'
          + '<span>' + esc(lkbName(r)) + '</span>'
          + '<span>👥 ' + esc((r.players || []).join(', ')) + ' · ' + state + '</span>'
          + '<span class="lkb-code" aria-label="room code">' + (/^\d{4}$/.test(r.code) ? '🔢 ' + r.code : (r.emoji || toEmoji(r.code)).join('')) + '</span></div>'
          + (mine ? '' : '<button class="lkb-go" data-code="' + r.code + '"' + (full ? ' disabled' : '') + '>▶ Join</button>') + '</div>';
      }).join('') + '</div>';
    }
    async function tick() {
      clearTimeout(B.timer);
      if (!el.isConnected) return;
      if (!document.hidden && !B.busy) {
        B.busy = true; el.classList.add('lkb-busy');
        try { const r = await srv('linkList'); B.rooms = Array.isArray(r) ? r : []; B.err = false; } catch (e) { B.err = true; /* offline: keep the last list */ }
        B.busy = false; B.loaded = true; paint();
      }
      B.timer = setTimeout(tick, every);
    }
    el.onclick = ev => {
      const b = ev.target.closest('.lkb-go'); if (!b || b.disabled) return;
      const r = B.rooms.find(x => x.code === b.dataset.code); if (!r) return;
      const url = urlFor(r);
      if (opt.type !== false) { try { localStorage.setItem('lk_type', JSON.stringify({code: r.code, host: r.host, at: Date.now()})); } catch (e) { /* private mode */ } }
      if (window.UI && UI.busy) UI.busy(b, opt.kind || 'link', 'Joining…');
      if (opt.go) opt.go(url, r); else if (window.UI && UI.go) UI.go(url, opt.kind || 'link'); else location.href = url;
    };
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
    paint(); tick();
    B.refresh = tick; B.url = urlFor; B.stop = () => clearTimeout(B.timer);
    return B;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c])); }

  function on(ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); return fn; }
  function off(ev, fn) { handlers[ev] = (handlers[ev] || []).filter(f => f !== fn); }

  window.Link = {
    EMOJI, COLS,
    host, join, send, start, leave, lobby, board, on, off,
    setLabel: label => S.role === 'host' && S.code ? srv('linkRoomSet', S.code, {label}).catch(() => {}) : Promise.resolve(),
    players: () => S.role === 'host' ? seatList() : S.seats.slice(),
    ping: () => S.role === 'guest' ? (S.rtt == null ? null : Math.round(S.rtt)) : Object.fromEntries(S.seats.filter(s => s.seat > 0 && s.ping != null).map(s => [s.seat, Math.round(s.ping)])),
    status: () => S.status, isHost: () => S.role === 'host', seat: () => S.mySeat, code: () => S.code, emoji: () => S.emoji,
    started: () => S.started, relay: () => !!(S.ice && S.ice.relay),
    hostess: () => !!S.hostess, captain, ask,   // 📺 lk-5a
    road: () => S.role === 'guest' ? (S.road || (S.host ? 'direct' : '')) : (Object.values(S.peers).some(p => p.relay && p.linked) ? 'server' : 'direct'),   // 🌍 lk-4a
    toCode, toEmoji, diag: () => S.diag || null, warm,
    log: () => S.log.slice(), _test: {pairInfo, diagOf, diagMsg, diagLine, state: () => S, cut() { if (S.role === 'guest' && S.host) { const h = S.host; try { h.pc.close(); } catch (e) { /* */ } hostLost('cut'); } }}
  };
})();
