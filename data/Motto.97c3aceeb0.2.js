
(function(root){
  'use strict';
  // MOTTO DATA START (pure — node tests read it)
  const PHASES = [
    {k: 'learn', icon: '🧠', en: 'Learn', th: 'เรียนรู้', line: 'Every maker starts as a curious mind.', lineTh: 'นักสร้างทุกคน เริ่มจากความอยากรู้', col: '#3B82F6', bg: '#E4EEFF', ink: '#1E4FA8'},
    {k: 'shape', icon: '🧪', en: 'Shape', th: 'ปั้นรูป', line: 'Turn what you know into a plan.', lineTh: 'เปลี่ยนสิ่งที่รู้ ให้เป็นแผน', col: '#16A34A', bg: '#E2F6E8', ink: '#11702F'},
    {k: 'make', icon: '🛠️', en: 'Make', th: 'ลงมือทำ', line: 'Your ideas become real.', lineTh: 'ไอเดียของเรา กลายเป็นของจริง', col: '#F97316', bg: '#FFEBDC', ink: '#A84508'},
    {k: 'finish', icon: '✨', en: 'Finish', th: 'เก็บงาน', line: 'Finish proud, then begin again.', lineTh: 'ทำให้จบอย่างภูมิใจ แล้วเริ่มใหม่อีกครั้ง', col: '#D4A20A', bg: '#FFF4CC', ink: '#7A5A00'}
  ];
  const STEPS = [
    ['study', '🔍', 'Study', 'ศึกษา', 'Look closely. Every clue is a gift.', 'มองให้ดี ทุกเบาะแสคือของขวัญ', 'learn'],
    ['learn', '💡', 'Learn', 'เรียนรู้', 'Every try teaches you something, even the wrong ones.', 'ทุกครั้งที่ลอง ได้เรียนรู้เสมอ แม้ตอนที่ผิด', 'learn'],
    ['understand', '🧩', 'Understand', 'เข้าใจ', 'Know the WHY, and you can do it anywhere.', 'รู้ว่า "ทำไม" แล้วจะทำได้ทุกที่', 'learn'],
    ['explore', '🧭', 'Explore', 'สำรวจ', 'Wander, wonder, try another way.', 'ออกไปสำรวจ สงสัย แล้วลองอีกทาง', 'shape'],
    ['rules', '📏', 'Rules', 'กติกา', 'Rules give a game its shape. Play your best inside them.', 'กติกาทำให้เกมมีรูปร่าง เล่นให้ดีที่สุดในกติกา', 'shape'],
    ['plan', '🗺️', 'Plan ahead', 'วางแผน', 'Think two moves ahead and the path opens.', 'คิดล่วงหน้าสองก้าว แล้วทางจะเปิด', 'shape'],
    ['adapt', '🔄', 'Adapt', 'ปรับตัว', 'When things change, change with them. That’s how champions play.', 'เมื่อทุกอย่างเปลี่ยน เราก็ปรับตาม แบบแชมป์', 'shape'],
    ['design', '✏️', 'Design', 'ออกแบบ', 'Draw it in your mind before your hands begin.', 'วาดไว้ในใจก่อน แล้วค่อยลงมือ', 'make'],
    ['create', '🔨', 'Create', 'สร้าง', 'Make it real. Something new exists because of you.', 'ลงมือสร้าง โลกมีสิ่งใหม่เพราะเรา', 'make'],
    ['improvise', '🎷', 'Improvise', 'พลิกแพลง', 'No piece fits? Invent one.', 'ไม่มีชิ้นที่ใช่? คิดขึ้นมาเองเลย', 'make'],
    ['polish', '✨', 'Polish', 'ขัดเกลา', 'Good becomes great in the last little touches.', 'งานดีกลายเป็นงานเยี่ยม เพราะรายละเอียดเล็ก ๆ', 'finish']
  ].map((r, i) => ({k: r[0], n: i + 1, icon: r[1], en: r[2], th: r[3], line: r[4], lineTh: r[5], phase: r[6]}));
  const TAG = {en: 'Learn it · Shape it · Make it · Finish it — then 🔁 begin again, smarter.', th: 'เรียนรู้ · ปั้นรูป · ลงมือทำ · เก็บงาน — แล้ว 🔁 เริ่มใหม่ ให้เก่งขึ้น'};
  // Gameroom group → steps (plan §2) · a game's group = Gameroom's groupOf (GAME_TYPES + GROUP_OF; motto.js checks they agree) · OVERRIDE wins (plan §2, Aowu ④)
  const BY_GROUP = {learn: ['study', 'learn', 'understand'], brain: ['rules', 'plan', 'understand'], action: ['adapt', 'improvise', 'explore'],
    story: ['explore', 'plan', 'adapt'], sport: ['adapt', 'plan', 'polish'], make: ['design', 'create', 'polish'], more: ['explore', 'learn', 'create']};
  const GROUP = {'maze': 'brain', 'stacking-sim': 'learn', 'robot-adventure': 'learn', 'code-robot': 'learn', 'checkers': 'brain', 'chess': 'brain', 'pinball': 'action', 'hopper': 'action',
    'turbo': 'action', 'memory': 'brain', 'number-grid': 'learn', 'pop-blocks': 'brain', 'block-drop': 'brain', 'double-up': 'learn', 'sweet-swap': 'brain', 'beat-corner': 'make',
    'sla-brall': 'sport', 'blasoff': 'sport', 'brawl-buddies': 'action', 'soul-bopper': 'action', 'pokadif': 'learn', 'pyraspike': 'sport', 'artifactory': 'make', 'sciencetory': 'learn',
    'geoscout': 'learn', 'tdstories': 'story', 'polyplot': 'learn', 'wisdeck': 'learn', 'eyes-brain': 'learn', 'georead': 'learn', 'alignext': 'brain', 'snakeast': 'action',
    'pose-party': 'sport', 'word-board': 'learn', 'number-board': 'learn', 'math-quest': 'learn', 'color-match': 'learn', 'count-match': 'learn', 'trash-pointer': 'learn',
    'minigames': 'learn', 'avateer': 'story', 'avatarealm': 'story'};
  const OVERRIDE = {'artifactory': ['design', 'create', 'polish'], 'sciencetory': ['study', 'understand', 'explore'], 'avatarealm': ['plan', 'adapt', 'create']};
  // MOTTO DATA END
  const LOG = [];
  const step = k => STEPS.find(s => s.k === k) || null, phase = k => PHASES.find(p => p.k === k) || null;
  function ofGame(id){ id = String(id || ''); return (OVERRIDE[id] || BY_GROUP[GROUP[id] || 'more']).slice(); }
  function today(d){ d = d || new Date(); const n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); return STEPS[((n % 11) + 11) % 11].k; }
  const ls = (k, v) => { try { if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(e){} return null; };
  function lang(name){ name = name || 'Guest'; const v = ls('sp_motto_lang:' + name); if(v === 'en' || v === 'th') return v; return ls('sp_comics_lang:' + name) === 'th' ? 'th' : 'en'; }
  function setLang(name, v){ ls('sp_motto_lang:' + (name || 'Guest'), v === 'th' ? 'th' : 'en'); LOG.push('lang:' + v); }
  function say(k, lg){ const s = step(k); if(!s) return ''; return lg === 'th' ? s.icon + ' ' + s.th + ': ' + s.lineTh : s.icon + ' ' + s.en + ': ' + s.line; }
  function pick(o){ o = o || {}; const mine = o.steps || ofGame(o.game);
    if(o.win === true && o.stars === 3) return 'polish';
    if(o.win === true && ((o.misses | 0) > 0 || o.prevLost)) return 'adapt';
    if(o.first || o.win === false) return 'learn';
    return mine[(o.n | 0) % mine.length]; }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

  // 🪜 the ladder sheet
  let OPEN = null;
  function sheet(host, o){
    if(host && !host.nodeType){ o = host; host = null; } o = o || {}; host = host || document.body; if(OPEN) OPEN.close();
    const me = o.me || (o.who && o.who.name) || 'Guest', hi = (o.hi || (o.game ? ofGame(o.game) : [])).filter(step), day = today();
    let lg = o.lang || lang(me), sel = step(o.sel) ? o.sel : hi[0] || day;
    const el = document.createElement('div'); el.className = 'mt-sheet'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'The 11 Steps of Creation');
    el.innerHTML = '<div class="mt-card"><div class="mt-head"><h3>🌟 <span class="mt-ttl"></span><small class="mt-tag"></small></h3>' +
      '<div class="mt-lang"><button data-l="en" data-sound="tap">EN</button><button data-l="th" data-sound="tap">ไทย</button></div><button class="mt-x" aria-label="Close" data-sound="tap">✕</button></div>' +
      '<div class="mt-ladder">' + PHASES.map(p => '<div class="mt-ph" data-ph="' + p.k + '" style="--mt-col:' + p.col + ';--mt-bg:' + p.bg + ';--mt-ink:' + p.ink + '"><h4>' + p.icon + ' ' + esc(p.en) + ' <small>' + esc(p.th) + '</small></h4>' +
        STEPS.filter(s => s.phase === p.k).map(s => '<button class="mt-st' + (hi.indexOf(s.k) >= 0 ? ' hi' : '') + '" data-k="' + s.k + '" data-sound="pop"><span class="mt-n">' + s.n + '</span><span class="mt-i">' + s.icon + '</span><span class="mt-w">' + esc(s.en) + '</span>' +
          (s.k === day ? '<span class="mt-day" title="Step of the day">⭐</span>' : '') + '</button>').join('') +
        (p.k === 'finish' ? '<div class="mt-again"><i>🔁 → 🧠</i><span>Begin again, smarter.</span><span class="th">เริ่มใหม่ ให้เก่งขึ้น</span></div>' : '') + '</div>').join('') + '</div>' +
      '<div class="mt-detail"><canvas width="152" height="184" aria-hidden="true"></canvas><div class="mt-dtx"></div></div>' +
      '<span class="ui-modal on" style="display:none!important"></span></div>';   // the hidden .ui-modal.on hides 💬 Tell us while the sheet is open
    host.appendChild(el);
    const $ = s => el.querySelector(s), card = $('.mt-card'), dtx = $('.mt-dtx'), det = $('.mt-detail'), cv = $('.mt-detail canvas');
    function paintHead(){ $('.mt-ttl').textContent = lg === 'th' ? '11 ขั้นของการสร้างสรรค์' : 'The 11 Steps of Creation'; $('.mt-tag').textContent = TAG[lg];
      el.querySelectorAll('.mt-lang button').forEach(b => b.classList.toggle('on', b.dataset.l === lg)); }
    function select(k){ const s = step(k); if(!s) return; sel = k; const p = phase(s.phase);
      el.querySelectorAll('.mt-st').forEach(b => b.classList.toggle('sel', b.dataset.k === k));
      det.style.setProperty('--mt-col', p.col); det.style.setProperty('--mt-ink', p.ink);
      const en = '<p>' + esc(s.line) + '</p>', th = '<p class="th">' + esc(s.lineTh) + '</p>';
      dtx.innerHTML = '<small>' + p.icon + ' ' + esc(p.en) + ' · ' + esc(p.th) + ' — step ' + s.n + ' / 11' + (hi.indexOf(k) >= 0 ? ' · 🎮 this game' : '') + (k === day ? ' · ⭐ today' : '') + '</small>' +
        '<b>' + s.icon + ' ' + esc(s.en) + ' · ' + esc(s.th) + '</b>' + (lg === 'th' ? th + en : en + th);
      LOG.push('sheet:sel:' + k); }
    el.addEventListener('click', e => { const b = e.target.closest('.mt-st'); if(b){ stopTour(); select(b.dataset.k); hop(); return; }
      const l = e.target.closest('.mt-lang button'); if(l){ lg = l.dataset.l; setLang(me, lg); paintHead(); select(sel); return; }
      if(e.target.closest('.mt-x') || !e.target.closest('.mt-card')) close(); });
    const key = e => { if(e.key === 'Escape'){ e.stopPropagation(); close(); } }; document.addEventListener('keydown', key, true);
    // 🧑 the little climber: an avatar on the detail strip, 🎬 beat.jump (3–5 beats) — on CONTACT the next of this game's steps lights up
    const who = o.who && o.who.av && root.Acting && root.Acting.draw ? {name: o.who.name || me, av: root.fixAv ? fixAv(o.who.av) : o.who.av, dir: 1} : null;
    const calm = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){ return false; } })();
    let run = null, raf = 0, tour = hi.length > 1 && !!who, nextAt = performance.now() / 1000 + 1.6;
    function stopTour(){ tour = false; }
    function hop(to){ if(!who || !Acting.play) return; const t0 = performance.now() / 1000;
      try { run = Acting.play(who, 'beat.jump', {t0, onContact: () => { if(to) select(to); LOG.push('sheet:hop'); }}); } catch(e){ run = null; if(to) select(to); } }
    function frame(){ if(!el.isConnected) return; raf = requestAnimationFrame(frame); const t = performance.now() / 1000;
      if(tour && !calm && t >= nextAt && (!run || run.done)){ const i = hi.indexOf(sel); hop(hi[(i + 1) % hi.length]); nextAt = t + 2.8; }
      const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
      try { if(run && run.done) run = null; Acting.draw(g, who, cv.width / 2, cv.height - 10, cv.height / 118, run ? run.at(t) : 'idle', {t}); } catch(e){} }
    if(who) raf = requestAnimationFrame(frame); else cv.style.display = 'none';
    function close(){ if(!el.isConnected) return; cancelAnimationFrame(raf); document.removeEventListener('keydown', key, true); el.remove(); OPEN = null; LOG.push('sheet:close'); if(o.onClose) o.onClose(); }
    paintHead(); select(sel); LOG.push('sheet:open');
    try { const b = el.querySelector('.mt-st.sel') || el.querySelector('.mt-st'); if(b) b.focus({preventScroll: true}); } catch(e){}
    OPEN = {el, close, select, get sel(){ return sel; }, get lang(){ return lg; }};
    return OPEN;
  }
  root.Motto = {STEPS, PHASES, TAG, BY_GROUP, GROUP, OVERRIDE, step, phase, ofGame, today, lang, setLang, say, pick, sheet, LOG, VERSION: 'b6b'};
})(window);
