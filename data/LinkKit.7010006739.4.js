
/* 📺 STATION CLIENT (st-1, Aowu 2026-11-16) — the game side of the 📺 Game Station (page `station`, server LinkKitServer.gs stationXxx).
   A game opened FROM the station gets ?st=<number> (+ TV: &stv=1&stk=<token>&slv=<level>&smap=<map>; phones: &link=<room>).
   One call per game, after its LINK block:  Station.game({url: WEBAPP_URL, player: () => S.player, start: go => lxHostGo(true), again: () => lxHostGo(true), setup: go => {…}})
   TV:     the game's 📺 hostess room opens as usual (mode=ltv) → its number goes to the station → ▶ starts by itself when every voted player is in (30 s: whoever is in)
   result: the players vote 🔁 Again / 🎮 Another game on their phones (one player one vote, a tie = 🎲) → again on the same TV, or everyone back to the station
   Station.on · Station.lvl (the level vote, or null) · Station.map · Station.code · Station.tv · Station.params() · Station.run(fn, …args) · Station.back() */
(function () {
  try { if (window.UI && UI.KINDS && !UI.KINDS.station) UI.KINDS.station = ['📺', 'Opening the Game Station', 'bob']; } catch (e) { /* */ }   // its own loader (UiKit kinds list)
  const ST = {on: false, code: '', tv: false, tok: '', lvl: null, map: '', p: null, opt: null, state: null, timer: null, decided: '', voteAt: 0, mine: ''};
  function run(fn, ...args) {
    return new Promise((res, rej) => {
      if (!(window.google && google.script && google.script.run)) return rej(new Error('no server'));
      google.script.run.withSuccessHandler(res).withFailureHandler(e => rej(e instanceof Error ? e : new Error(String(e && e.message || e))))[fn](...args);
    });
  }
  let pp = null;
  function params() {
    if (pp) return pp;
    pp = new Promise(res => {
      const fromSearch = () => { try { const q = new URLSearchParams(location.search), o = {}; q.forEach((v, k) => { o[k] = v; }); return o; } catch (e) { return {}; } };
      try { if (window.google && google.script && google.script.url && google.script.url.getLocation) { google.script.url.getLocation(l => res(Object.assign(fromSearch(), (l && l.parameter) || {}))); return; } } catch (e) { /* */ }
      res(fromSearch());
    });
    return pp;
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  function me() { const o = ST.opt || {}; return {name: typeof o.player === 'function' ? o.player() : (o.player || ''), token: ST.tok}; }
  function qs(extra) {   // the player + screen-time session travel with every switch
    const p = ST.p || {}, name = me().name;
    return (name ? '&player=' + encodeURIComponent(name) : '') + (p.sessionStart ? '&sessionStart=' + encodeURIComponent(p.sessionStart) : '') + (p.durationMin ? '&durationMin=' + encodeURIComponent(p.durationMin) : '') + (extra || '');
  }
  function stationUrl() { return ST.opt.url + '?page=station&st=' + ST.code + (ST.tv ? '&stv=1&stk=' + encodeURIComponent(ST.tok) : '') + qs(); }
  function goStation(text) {
    if (ST.leaving) return; ST.leaving = true; clearInterval(ST.timer);
    try { if (window.Link && Link.status() !== 'idle') Link.leave(); } catch (e) { /* */ }
    const url = stationUrl();
    if (window.UI && UI.go) UI.go(url, 'station', text || '📺 Back to the Game Station'); else location.href = url;
  }
  // ---- the vote bar on the result card (phones) / the tally (TV) ----
  function card() { return document.getElementById('result-card'); }
  function resultShown() { const r = document.getElementById('result'); return !!(r && !r.classList.contains('hidden') && card()); }
  function paintVote() {
    const c = card(); if (!c) return;
    const s = ST.state || {}, go = s.go || {}, votes = (s.votes && s.votes.after) || {}, players = go.players || [];
    const n = k => players.filter(p => votes[p] === k).length;
    let box = c.querySelector('.st-vote');
    if (!box) {
      c.querySelectorAll('.res-btns, .lk-wait').forEach(e => { e.style.display = 'none'; });
      box = document.createElement('div'); box.className = 'st-vote'; c.appendChild(box);
    }
    const ready = s.phase === 'after';
    if (ST.tv) {
      box.innerHTML = '<div class="st-vh">🗳️ ' + (ready ? 'Vote on your phone!' : 'One moment…') + '</div><div class="st-vrow"><span class="st-vchip">🔁 Again <b>' + n('again') + '</b></span><span class="st-vchip">🎮 Another game <b>' + n('another') + '</b></span></div>' +
        '<div class="st-vsmall">' + players.map(p => '<span class="' + (votes[p] ? 'st-yes' : '') + '">' + (votes[p] ? '✓ ' : '⏳ ') + esc(p) + '</span>').join(' ') + '</div>' +
        '<div class="st-vrow st-admin"><button class="st-b st-b2" data-st="again">🔁 Again now</button><button class="st-b st-b2" data-st="another">🎮 Pick another game</button></div>';
    } else {
      const mine = votes[me().name] || ST.mine;
      box.innerHTML = '<div class="st-vh">🗳️ What next? <small>one player · one vote</small></div><div class="st-vrow">' +
        '<button class="st-b' + (mine === 'again' ? ' st-on' : '') + '" data-st="again"' + (ready ? '' : ' disabled') + '>🔁 Again <b>' + n('again') + '</b></button>' +
        '<button class="st-b' + (mine === 'another' ? ' st-on' : '') + '" data-st="another"' + (ready ? '' : ' disabled') + '>🎮 Another game <b>' + n('another') + '</b></button></div>' +
        '<div class="st-vsmall">' + players.filter(p => votes[p]).length + ' of ' + players.length + ' voted</div>';
    }
    box.querySelectorAll('[data-st]').forEach(b => { b.onclick = () => (ST.tv ? decide(b.dataset.st) : vote(b.dataset.st)); });
  }
  function vote(k) {
    ST.mine = k; paintVote();
    run('stationVote', ST.code, me(), 'after', k).then(r => { if (r && r.state) { ST.state = r.state; paintVote(); } }).catch(() => {});
  }
  function decide(k) {
    if (ST.decided) return; ST.decided = k;
    if (k === 'again') {
      run('stationSet', ST.code, me(), {phase: 'play'}).catch(() => {}).then(() => { ST.decided = ''; ST.voteAt = 0; try { ST.opt.again(); } catch (e) { /* */ } });
    } else {
      run('stationSet', ST.code, me(), {phase: 'pick'}).catch(() => {}).then(() => goStation('🎮 Pick another game'));
    }
  }
  function tvAfter() {   // the TV counts the votes: everyone voted → decide · else 15 s after the first vote (most votes, a tie = 🎲)
    const s = ST.state, go = s.go || {}, votes = (s.votes && s.votes.after) || {}, players = go.players || [];
    const got = players.filter(p => votes[p]);
    if (!got.length) return;
    if (!ST.voteAt) ST.voteAt = Date.now();
    if (got.length < players.length && Date.now() - ST.voteAt < 15000) return;
    const a = got.filter(p => votes[p] === 'again').length, b = got.length - a;
    decide(a > b ? 'again' : b > a ? 'another' : (Math.random() < 0.5 ? 'again' : 'another'));
  }
  // ---- TV: report the room, start by itself, then watch the result ----
  async function tv() {
    const t0 = Date.now();
    while (!(window.Link && Link.code() && Link.status() === 'hosting')) { if (Date.now() - t0 > 60000) return; await new Promise(r => setTimeout(r, 300)); }
    let r = await run('stationSet', ST.code, me(), {room: Link.code()}).catch(() => null);
    if (!r || !r.state) r = await run('stationPoll', ST.code, me()).catch(() => null);
    ST.state = r && r.state; if (!ST.state || !ST.state.go) return;
    const go = ST.state.go, want = go.players || [];
    try { if (ST.opt.setup) ST.opt.setup(go); } catch (e) { /* */ }
    const t1 = Date.now();
    while (true) {
      const inn = (Link.players() || []).filter(p => p.on && p.name && !p.screen).map(p => p.name);
      if ((want.length && want.every(n => inn.indexOf(n) >= 0)) || (Date.now() - t1 > 30000 && inn.length)) break;
      if (Link.status() !== 'hosting') return;
      await new Promise(res => setTimeout(res, 400));
    }
    await new Promise(res => setTimeout(res, 600));
    try { ST.opt.start(go); } catch (e) { /* */ }
    run('stationSet', ST.code, me(), {phase: 'play'}).then(x => { if (x && x.state) ST.state = x.state; }).catch(() => {});
    loop();
  }
  function loop() {
    clearInterval(ST.timer);
    ST.timer = setInterval(async () => {
      if (ST.leaving) return;
      const shown = resultShown();
      if (!shown) { const v = document.querySelector('#result-card .st-vote'); if (v) v.remove(); ST.mine = ''; if (ST.tv || !document.querySelector('.lx-over')) return; }
      if (ST.tv && shown && ST.state && ST.state.phase === 'play' && !ST.decided) {
        const r = await run('stationSet', ST.code, me(), {phase: 'after'}).catch(() => null); if (r && r.state) ST.state = r.state; ST.voteAt = 0;
      } else {
        const r = await run('stationPoll', ST.code, me()).catch(() => null);
        if (r && r.err === 'gone') { ST.state = null; return; }
        if (r && r.state) ST.state = r.state;
      }
      const s = ST.state; if (!s) return;
      if (!ST.tv && (s.phase === 'pick' || s.phase === 'lvl' || (s.phase === 'go' && s.go && s.go.page !== ST.page))) { goStation(); return; }   // the TV went back to the station
      if (shown) paintVote();
      if (ST.tv && shown && s.phase === 'after') tvAfter();
    }, ST.tv ? 1200 : 1500);
  }
  function phone() {
    loop();
    // the room ended (the TV switched) → back to the station by ourselves
    new MutationObserver(() => { if (document.querySelector('.lx-over') && !ST.leaving) run('stationPoll', ST.code, me()).then(r => { if (r && r.state && r.state.phase !== 'play' && r.state.phase !== 'after') goStation(); }).catch(() => {}); })
      .observe(document.body, {childList: true});
  }
  function css() {
    if (document.getElementById('st-css')) return;
    const st = document.createElement('style'); st.id = 'st-css';
    st.textContent = '.st-vote{margin:12px auto 0;max-width:460px;text-align:center}.st-vh{font-family:Fredoka,sans-serif;font-weight:700;font-size:1.1rem;color:var(--ink,#2B2250)}.st-vh small{display:block;font:700 .75rem Nunito,sans-serif;opacity:.6}' +
      '.st-vrow{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:8px}.st-b{border:0;border-radius:16px;padding:12px 16px;min-width:140px;font:700 1rem Fredoka,sans-serif;background:#EFE7FF;color:#3B2A78;box-shadow:0 4px 0 rgba(59,42,120,.25);cursor:pointer}' +
      '.st-b b{display:inline-block;min-width:1.6em;margin-left:6px;border-radius:99px;background:#fff;padding:1px 6px}.st-b.st-on{background:linear-gradient(135deg,#7A5CFA,#FF4D8D);color:#fff}.st-b:disabled{opacity:.5}.st-b2{min-width:0;padding:6px 10px;font-size:.8rem;box-shadow:none;opacity:.75}' +
      '.st-vchip{display:inline-flex;align-items:center;gap:6px;border-radius:99px;background:#EFE7FF;padding:8px 14px;font:700 1rem Fredoka,sans-serif;color:#3B2A78}.st-vchip b{background:#7A5CFA;color:#fff;border-radius:99px;padding:0 8px}' +
      '.st-vsmall{margin-top:8px;font:700 .8rem Nunito,sans-serif;opacity:.75;display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.st-vsmall .st-yes{color:#1E9E62}.st-admin{margin-top:10px}';
    document.head.appendChild(st);
  }
  function game(opt) {
    ST.opt = opt || {}; ST.page = opt.page || '';
    return params().then(p => {
      ST.p = p; if (!/^\d{4}$/.test(String(p.st || ''))) return false;
      ST.on = true; ST.code = p.st; ST.tv = p.stv === '1'; ST.tok = p.stk || '';
      ST.lvl = p.slv != null && p.slv !== '' && !isNaN(+p.slv) ? Math.max(0, Math.min(5, +p.slv)) : null; ST.map = String(p.smap || '');
      document.documentElement.classList.add('st-on' + (ST.tv ? '-tv' : ''));
      css();
      if (ST.tv) tv(); else phone();
      return true;
    });
  }
  window.Station = {game, params, run, back: goStation,
    get on() { return ST.on; }, get tv() { return ST.tv; }, get code() { return ST.code; }, get lvl() { return ST.lvl; }, get map() { return ST.map; }, get state() { return ST.state; },
    _test: () => ST};
})();
