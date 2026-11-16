
/* ================= SOUNDS (made in code, no sound files) ================= */
// Built with the browser's own Web Audio engine, so there is nothing to
// download, nothing to host on Drive, and no loading delay. Browsers only
// allow audio after the first tap, so the engine wakes up on the first
// pointerdown/touchend anywhere on the page.
window.UISound = (function(){
  let ctx = null;
  let enabled = true;
  let volume = 0.6; // 0..1
  try{
    const saved = JSON.parse(localStorage.getItem('sp_sound') || 'null');
    if(saved){ enabled = saved.e !== false; if(typeof saved.v === 'number') volume = saved.v; }
  }catch(e){}

  function ac(){
    if(!ctx){
      const C = window.AudioContext || window.webkitAudioContext;
      if(!C) return null;
      try{ ctx = new C(); }catch(e){ return null; }
    }
    if(ctx.state === 'suspended'){ try{ ctx.resume(); }catch(e){} }
    return ctx;
  }
  function tone(freq, dur, type, gain, slideTo, delay){
    const c = ac(); if(!c) return;
    const t0 = c.currentTime + (delay || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if(slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    const peak = Math.max(0.0001, (gain || 0.3) * volume);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }
  function noise(dur, gain, fFrom, fTo){
    const c = ac(); if(!c) return;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for(let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const filt = c.createBiquadFilter(); filt.type = 'bandpass'; filt.Q.value = 1.2;
    const t0 = c.currentTime;
    filt.frequency.setValueAtTime(fFrom, t0);
    filt.frequency.exponentialRampToValueAtTime(fTo, t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain * volume), t0 + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt); filt.connect(g); g.connect(c.destination);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }
  const SOUNDS = {
    tap:     () => tone(620, 0.07, 'sine', 0.32, 900),
    pop:     () => tone(480, 0.1, 'triangle', 0.4, 1100),
    key:     () => tone(880, 0.05, 'square', 0.12),
    nav:     () => { tone(523, 0.08, 'sine', 0.28); tone(784, 0.11, 'sine', 0.28, null, 0.07); },
    whoosh:  () => noise(0.24, 0.35, 300, 2600),
    drop:    () => tone(320, 0.12, 'sine', 0.38, 140),
    bump:    () => tone(150, 0.09, 'square', 0.18, 90),
    success: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', 0.3, null, i * 0.09)),
    error:   () => { tone(220, 0.14, 'sawtooth', 0.14, 160); tone(165, 0.2, 'sawtooth', 0.14, 120, 0.13); },
    unlock:  () => { tone(660, 0.08, 'triangle', 0.3); tone(990, 0.14, 'triangle', 0.3, null, 0.08); }
  };
  function save(){ try{ localStorage.setItem('sp_sound', JSON.stringify({e: enabled, v: volume})); }catch(e){} }
  return {
    play(name){
      if(!enabled || !SOUNDS[name]) return;
      try{ SOUNDS[name](); }catch(e){}
    },
    set(on, vol){
      if(typeof on === 'boolean') enabled = on;
      if(typeof vol === 'number' && !isNaN(vol)) volume = Math.min(1, Math.max(0, vol));
      save();
    },
    // Settings tab keys: SoundEnabled ('TRUE'/'FALSE'), SoundVolume (0-100)
    applySettings(s){
      if(!s) return;
      try { localStorage.setItem('sp_guide_auto', (s.GuidesAutoOpen === 'TRUE' || s.GuidesAutoOpen === true) ? '1' : '0'); } catch(e){}   // ❓ ws-4: grown-up switch (⚙️ Admin)
      const on = !(s.SoundEnabled === 'FALSE' || s.SoundEnabled === false);
      const v = (s.SoundVolume === '' || s.SoundVolume === undefined) ? NaN : Number(s.SoundVolume) / 100;
      this.set(on, isNaN(v) ? undefined : v);
    },
    get(){ return {enabled: enabled, volume: volume}; },
    wake: ac
  };
})();

/* ================= UI HELPERS ================= */
window.UI = (function(){
  // One icon + wording per kind of action (UI standard: every action has its own loader).
  // [icon, wording, animation] — every kind moves its own way (see the a-* animations above).
  const KINDS = {
    nav:        ['🧭', 'Opening', 'compass'],
    home:       ['🏠', 'Going to the Dashboard', 'hop'],
    play:       ['🚀', 'Starting the game', 'launch'],
    game:       ['🎮', 'Opening the game', 'wiggle'],
    tdstories:  ['🏰', 'Opening the story books', 'bob'],   // 🏰 TD-Stories (td-1)
    blasoff:    ['⚽', 'Blasting onto the pitch', 'launch'],   // ⚽ BlasOff (bo-1)
    pyraspike:  ['🔥', 'Lighting the Pyra flame', 'bump'],   // 🔥 PyraDive board (pd-1)
    pyradive:   ['🔥', 'Lighting the Pyra flame', 'bump'],   // 🔥 PyraDive page
    sciencetory: ['🔬', 'Warming up the lab', 'bob'],   // 🔬 Sciencetory (sc-1)
    pokadif:    ['🔍', 'Opening the detective file', 'peek'],   // 🔍 Pokadif (pk-1)
    rooms:      ['🕹️', 'Opening the Gameroom', 'swing'],
    trophy:     ['🏆', 'Opening Achievements', 'shine'],
    admin:      ['👑', 'Opening Admin', 'bob'],
    save:       ['✅', 'Saving', 'pop'],
    look:       ['🎨', 'Saving your look', 'spin'],
    add:        ['🌱', 'Adding player', 'grow'],
    remove:     ['🗑️', 'Removing', 'shake'],
    update:     ['🔄', 'Updating', 'turn'],
    pin:        ['🔑', 'Checking PIN', 'key'],
    unlock:     ['🔓', 'Unlocking', 'wiggle'],
    load:       ['✨', 'Getting ready', 'pop'],
    sound:      ['🔊', 'Saving sound settings', 'pulse'],
    room:       ['🏡', 'Opening the Family Room', 'hop'],
    myroom:     ['🛋️', 'Opening the room', 'bob'],
    feedback:   ['📨', 'Sending your message', 'bob'],
    fbadmin:    ['💬', 'Loading messages', 'bob'],
    collection: ['📖', 'Opening the Collection', 'flip'],
    wardrobe:   ['👕', 'Saving your look', 'swing'],
    treasure:   ['🎁', 'Finding today\'s treasures', 'wiggle'],
    claim:      ['🎁', 'Opening your treasure', 'shake'],
    decorate:   ['🪴', 'Saving your room', 'grow'],
    gift:       ['💝', 'Sending the gift', 'float'],
    birthday:   ['🎂', 'Saving the birthday', 'bob'],
    visit:      ['🚪', 'Knocking on the door', 'swing'],
    clean:      ['🧹', 'Tidying up', 'sweep'],
    music:      ['🎵', 'Changing the music', 'float'],
    // one per game (key = GameID): opening it from the Gameroom and its own boot loader
    'maze':            ['🧭', 'Building the maze world', 'compass'],
    'stacking-sim':    ['🧱', 'Getting the blocks ready', 'stack'],
    'robot-adventure': ['🤖', 'Building a robot board', 'bob'],
    'robot-wake':      ['🔋', 'Waking up the robot', 'charge'],
    'checkers':        ['🔴', 'Setting up the checkers', 'hop'],
    'chess':           ['♞', 'Lining up the pieces', 'knight'],
    'pinball':         ['🎱', 'Building a pinball table', 'bounce'],
    'hopper':          ['🐸', 'Building roads and rivers', 'hop'],
    'turbo':           ['🏎️', 'Warming up the engines', 'vroom'],
    'ghost':           ['👻', 'Calling the ghosts', 'float'],
    'memory':          ['🃏', 'Shuffling the cards', 'flip'],
    'math-quest':      ['🧮', 'Sharpening the pencils', 'bounce'],
    'double-up': ['🔀', 'Shuffling the tiles', 'flip'],
    'number-board': ['➗', 'Setting out the number tiles', 'bounce'],
    'word-board': ['🔤', 'Shaking the letter bag', 'bounce'],
    'sweet-swap': ['🍬', 'Filling the sweet jar', 'bounce'],
    'beat-corner': ['🎵', 'Tuning up the beat', 'bounce'],
    'beat-piano': ['🎹', 'Tuning the piano', 'bounce'],
    'beat-drums': ['🥁', 'Setting up the drums', 'bounce'],
    'sla-brall': ['🏓', 'Stringing the rackets', 'rally'],
    'brawl-buddies': ['🥊', 'Lacing up the gloves', 'bonk'],
    'soul-bopper': ['💣', 'Lighting the fuses', 'tick'],
    'polyplot': ['⬛', 'Joining the dots', 'trace'],
    'eyes-brain': ['👀', 'Opening your eyes', 'peek'],
    'georead': ['🔤', 'Stacking the letter boxes', 'bump'],
    'geoscout': ['🔢', 'Stacking the number blocks', 'stack'],
    'artifactory': ['🏭', 'Starting the machines', 'gear'],
    craft:      ['🛠️', 'Making it', 'gear'],
    mirror:     ['🪞', 'Opening the fitting mirror', 'swing'],
    'wisdeck': ['🃏', 'Shuffling the deck', 'deal'],
    'alignext': ['🔴', 'Polishing the discs', 'plop'],
    'snakeast': ['🐍', 'Waking up the snakes', 'slither'],
    'snakize': ['🐍', 'Waking up the snakes', 'slither'],
    'pose-party': ['📷', 'Setting up the photo booth', 'flip'],
    'block-drop': ['🧱', 'Lining up the rows', 'stack'],
    'pop-blocks': ['🫧', 'Blowing the bubbles', 'pop'],
    'number-grid': ['🔢', 'Drawing the grid', 'bounce'],
    'workshop':        ['🔨', 'Opening the workshop', 'swing'],
    'build':           ['🪚', 'Building it', 'shake'],
    'vote':            ['⭐', 'Counting the stars', 'pop'],
    'photo':           ['📷', 'Turning your photo into paint', 'flip'],
    'minigames':       ['🎲', 'Opening the mini games', 'roll'],
    'color-match':     ['🎨', 'Mixing the colours', 'spin'],
    'count-match':     ['🔢', 'Counting it up', 'pop'],
    'code-robot':      ['🤖', 'Waking up the robot', 'bob'],
    'trash-pointer':   ['♻️', 'Sorting the bins', 'turn']
  };
  const MIN_MS = 350; // never flicker
  const dots = '<span class="ui-dots"><i>.</i><i>.</i><i>.</i></span>';
  function kindOf(k){ return KINDS[k] || KINDS.load; }
  function spinHtml(k){ return '<span class="ui-spin a-' + (k[2] || 'spin') + '">' + k[0] + '</span>'; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // ----- full-page loader -----
  let loaderEl = null, loaderShownAt = 0, loaderSafety = null;
  function ensureLoader(){
    if(loaderEl) return loaderEl;
    loaderEl = document.createElement('div');
    loaderEl.className = 'ui-loader';
    loaderEl.setAttribute('role', 'status');
    loaderEl.innerHTML = '<div class="ui-loader-box"><span class="ui-spin"></span><div class="ui-loader-text"></div></div>';
    document.body.appendChild(loaderEl);
    return loaderEl;
  }
  // 💡 A short "did you know" under the loader, so the wait teaches something (rotates while it stays up).
  const TIPS = [
    '❤️ Tap the heart on a game to keep it at the top of the Gameroom.',
    '👥 Checkers, Chess, Algebros and Lettercraft can be played with a friend on one screen.',
    '🏡 In the Family Room, tap someone to make them do a dance or a wave.',
    '🛋️ My Room: 🎨 Decorate moves your furniture, 🔨 craft makes new things.',
    '📬 Gifts land in the red mailbox on your room wall — tap it to open them.',
    '🎁 Daily treasures: finish today\'s 3 goals on the Dashboard for a surprise.',
    '📖 The Collection shows every item you can unlock and how to get it.',
    '💀 Hardcore opens after Extreme: one try, no hints, ×3 points!',
    '⭐ Faster and cleaner = more stars. 3 stars is perfect.',
    '🐾 Ride-ons unlock with Adventure miles — every level you clear adds miles.',
    '🏷️ Titles: tap "My title" on the Dashboard to wear one you have earned.',
    '🎨 "My look" changes the colours of every page for you.',
    '🔑 Forgot your PIN? A grown-up can reset it in Admin.',
    '🎂 Grown-ups can add birthdays in Admin — the Dashboard throws a party on the day.',
    '🏁 The Dashboard shows who is close to the finish line of a game.',
    '🎵 BeatCorner: press Space any time and your avatar dances in the middle.',
    '🍬 Sweet Swap: match 4, 5 or a 2 × 2 square for super pictures.',
    '💬 Found a bug or have an idea? Tap "Tell us!" at the bottom.'];
  let tipTimer = 0;
  function showTip(el){
    let tip = el.querySelector('.ui-loader-tip');
    if(!tip){ tip = document.createElement('div'); tip.className = 'ui-loader-tip'; el.querySelector('.ui-loader-box').appendChild(tip); }
    const put = () => { const t = TIPS[Math.floor(Math.random() * TIPS.length)]; tip.textContent = '💡 ' + t; tip.style.animation = 'none'; void tip.offsetWidth; tip.style.animation = ''; };
    put(); clearInterval(tipTimer); tipTimer = setInterval(() => { if(!el.classList.contains('on')){ clearInterval(tipTimer); return; } put(); }, 3200);
  }
  function randomTip(){ return TIPS[Math.floor(Math.random() * TIPS.length)]; }

  // 👋 Guide cards: pages = [{icon, title, body, lines: [[icon, text], …]}] → Promise (resolves when closed).
  // Next / Back buttons, ← → keys, swipe, Esc or ✕ closes. Text is escaped; **word** becomes bold.
  function guide(pages, opts){
    opts = opts || {};
    return new Promise(resolve => {
      const m = document.createElement('div'); m.className = 'ui-guide'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
      document.body.appendChild(m);
      let i = 0;
      const rich = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
      function draw(){
        const p = pages[i], last = i === pages.length - 1;
        m.innerHTML = '<div class="ui-guide-card"><button class="ug-x" aria-label="Close">✕</button>' +
          '<div class="ug-art"><span>' + esc(p.icon || '👋') + '</span></div><div class="ug-main"><h3>' + esc(p.title || '') + '</h3>' +
          (p.body ? '<div class="ug-body">' + rich(p.body) + '</div>' : '') +
          (p.lines ? '<div class="ug-lines">' + p.lines.map(l => '<div class="ug-line"><i>' + esc(l[0]) + '</i><span>' + rich(l[1]) + '</span></div>').join('') + '</div>' : '') + '</div>' +
          '<div class="ug-foot">' + (pages.length > 1 ? '<div class="ug-dots">' + pages.map((_, k) => '<b class="' + (k === i ? 'on' : '') + '"></b>').join('') + '</div>' : '') +
          '<div class="ug-btns">' + (pages.length > 1 ? '<button class="ug-back"' + (i ? '' : ' disabled') + '>◀ Back</button>' : '') +
          '<button class="ug-next">' + esc(last ? (opts.doneText || "Let's go! 🚀") : 'Next ▶') + '</button></div></div></div>';
        m.querySelector('.ug-x').onclick = () => done();
        const b = m.querySelector('.ug-back'); if(b) b.onclick = () => step(-1);
        m.querySelector('.ug-next').onclick = () => (last ? done() : step(1));
        const card = m.querySelector('.ui-guide-card'); let sx = null;
        card.addEventListener('pointerdown', e => { sx = e.clientX; });
        card.addEventListener('pointerup', e => { if(sx != null && Math.abs(e.clientX - sx) > 50 && !e.target.closest('button')) step(e.clientX < sx ? 1 : -1); sx = null; });
        m.querySelector('.ug-next').focus({preventScroll: true});
      }
      function step(d){ const n = i + d; if(n < 0 || n >= pages.length) return; i = n; if(window.UISound) UISound.play('pop'); draw(); }
      function done(){ document.removeEventListener('keydown', onKey); m.remove(); resolve(i); }
      function onKey(e){ if(e.key === 'Escape') done(); else if(e.key === 'ArrowRight') step(1); else if(e.key === 'ArrowLeft') step(-1); }
      document.addEventListener('keydown', onKey);
      m.addEventListener('click', e => { if(e.target === m) done(); });
      draw();
    });
  }
  // ❓ ws-4 HOW TO PLAY = CLICK ONLY. UI.guideOnce('gameroom:Mia', pages, {btn}) no longer opens the cards by itself:
  // the first time (per key, per device) the page's ❓ / How to play button glows + wiggles for a few seconds instead.
  // The grown-up switch in ⚙️ Admin (Settings GuidesAutoOpen = TRUE → localStorage sp_guide_auto = 1) brings back the old "open the first time".
  const GUIDE_LOG = [];
  function guideAuto(){ try { return localStorage.getItem('sp_guide_auto') === '1'; } catch(e){ return false; } }
  function glowHelp(sel){
    const vis = el => { if(!el || !el.getBoundingClientRect) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    let el = sel ? (typeof sel === 'string' ? document.querySelector(sel) : sel) : null;
    if(!vis(el)) el = Array.from(document.querySelectorAll('[data-howto], #guide-btn, .help-chip, button, summary, [role="button"]')).find(e => vis(e) &&
      (e.hasAttribute('data-howto') || /❓|How to play|How it works/i.test(e.textContent || '') || /how to play|how it works/i.test((e.getAttribute('aria-label') || '') + ' ' + (e.title || ''))));
    if(!el) return null;
    el.classList.remove('ui-qglow'); void el.offsetWidth; el.classList.add('ui-qglow');
    const off = () => el.classList.remove('ui-qglow'); setTimeout(off, 4600); el.addEventListener('click', off, {once: true});
    setTimeout(() => {   // after the screen has settled: if the button is off screen, a pill scrolls to it and opens it
      const r = el.getBoundingClientRect(); if(!(r.width > 0) || (r.top >= 0 && r.bottom <= innerHeight)) return;
      const old = document.querySelector('.ui-qpill'); if(old) old.remove();
      const pill = document.createElement('button'); pill.type = 'button'; pill.className = 'ui-qpill'; pill.textContent = '❓ How to play';
      pill.onclick = () => { pill.remove(); try { el.scrollIntoView({behavior: 'smooth', block: 'center'}); } catch(e){ el.scrollIntoView(); } setTimeout(() => el.click(), 350); };
      document.body.appendChild(pill); setTimeout(() => pill.remove(), 6500);
    }, 450);
    return el;
  }
  function guideOnce(key, pages, opts){
    if(navigator.webdriver && !window.FORCE_GUIDE) return Promise.resolve(-1);   // test browsers: don't touch the page
    let seen = false; try { seen = localStorage.getItem('sp_guide:' + key) === '1'; } catch(e){}
    if(seen) return Promise.resolve(-1);
    try { localStorage.setItem('sp_guide:' + key, '1'); } catch(e){}
    if(guideAuto()){ GUIDE_LOG.push({key: key, mode: 'open'}); return guide(pages, opts); }
    const el = glowHelp(opts && opts.btn);
    GUIDE_LOG.push({key: key, mode: 'glow', el: el ? (el.id || String(el.className || '').replace(/ *ui-qglow/, '') || el.tagName) : null});
    return Promise.resolve(-1);
  }
  // 📲 ws-4 OFFLINE APP hooks: the offline app calls UI.appStatus({offline: true, device: 'iPad', sync: 3, update: true, onUpdate})
  // (or sets window.SP_APP before the page loads). Nothing shows unless the app sets it.
  let APP_ST = Object.assign({}, window.SP_APP || {});
  function appStatus(o){ if(o && typeof o === 'object'){ APP_ST = Object.assign(APP_ST, o); renderAppBar(); } return Object.assign({}, APP_ST); }
  function renderAppBar(){
    if(!document.body) return;
    let bar = document.getElementById('ui-appbar'); const items = [], n = Number(APP_ST.sync) || 0;
    if(APP_ST.offline) items.push('<span class="ab off"><span class="l">📴 Playing from this ' + esc(APP_ST.device || 'device') + '</span><span class="s">📴 Offline</span></span>');
    if(n > 0) items.push('<span class="ab sync"><span class="l">🔄 Syncing ' + n + ' result' + (n > 1 ? 's' : '') + '…</span><span class="s">🔄 ' + n + '</span></span>');
    if(APP_ST.update) items.push('<button class="ab upd" type="button"><span class="l">🆕 Update ready ⟳</span><span class="s">🆕 Update</span></button>');
    if(!items.length){ if(bar) bar.remove(); return; }
    if(!bar){ bar = document.createElement('div'); bar.id = 'ui-appbar'; bar.className = 'ui-appbar'; document.body.appendChild(bar); }
    bar.innerHTML = items.join('');
    const u = bar.querySelector('.upd'); if(u) u.onclick = () => { if(typeof APP_ST.onUpdate === 'function') APP_ST.onUpdate(); else location.reload(); };
  }
  if(window.SP_APP){ if(document.body) renderAppBar(); else document.addEventListener('DOMContentLoaded', renderAppBar); }

  // 🎮 What it is / how to play / tip for every game (Gameroom ❓ cards; games can reuse it).
  const GAME_HELP = {
    'sciencetory': ["A science lab for the things YOU made in Artifactory: press it, pull it, twist it, drop it, float it… and find out what it can do.", "Pick a test and a thing (or a 🧪 lab sample) → set it in the rig → guess 👍 / 👎 → watch the gauge → read your 📋 test card.", "A test can break a thing — never lost! Fix it with 🔧 Repair in Artifactory. A right guess = bonus points."],   // 🔬 sc-1 (Sciencetory chat: send text changes to the UiKit lane)
    'pokadif': ["Be a little detective! Two pictures look the same, but a few things changed. Poke every change — in either picture.", "Tap (or click) the thing that is different. 🌱 Basic: colours + missing things. More levels add 📏 size, 🔺 shape, 🔄 turn / flip and 🔢 count.", "Stuck? Tap 🔍 — the magnifier shows you one change. Fewer oops = more ⭐. Every picture is brand new!"],   // 🔍 pk-1 (Pokadif chat: send text changes to the UiKit lane)
    'blasoff': ["Soccer with your avatar — score more goals than the other team!", "Run with W A S D or the 🕹️ stick. J pass · K shoot · L trick · Space jump (twice = flick it up, then K = volley!).", "When they shoot at your goal, shout Q or E — your robot keeper dives that way."],   // ⚽ bo-1 (BlasOff chat: send text changes to the UiKit lane)
    'pyraspike': ["Volleyball with your avatar! Each side gets 3 touches: 🤚 bump it up, 🪶 set it high, 💥 dunk it over the net. The ball landing in their court = your point.", "W A S D move · J 🤚 touch · K 💥 drive / dunk (hold on a serve) · L 🪶 dink · Space ⬆️ jump / block · Shift 🤸 dive · F 🔥 Pyra. On a tablet: the stick + the round buttons.", "🦶 PyraStrike = sepak takraw (ตะกร้อ): feet, knees and head only — 🦵 Trap (J), 🙆 head set, 💥 roll spike / 🚲 bicycle (K), 🦶 heel tip (L). One player may use all 3 touches. Serve: your buddy tosses, you kick.", "🔥🔥 A FULL flame + 🔥 = a SPIRIT DIVE: your next Dunk, Dink, Serve, Block or Save calls a creature (🐉 Dragon, 🦁 Singha, 🗿 Golem, 🐘 Gajasiha, 🐦‍🔥 Phoenix, 🦢 Hongsa, 🦊 Kitsune, 🧚 Kinnaree, 🐍 Naga, 🐊 Makara) — almost nobody can stop it.", "Serve 3 ways: 💥 K = float serve (hold for power) · ⬆️ Space = 🦘 jump serve (fast + steep) · 🪶 L = 🤏 pinch serve (drops just over the net).", "Good touches fill your 🔥 flame. Half full → tap 🔥 and your next move is a Pyra… move!", "🎯 Training: 🎯 Zone Hits (the 🧑‍🏫 Coach feeds you — hit the glowing zone) · 🔗 Body Combo (Trap → Pop → ⚡ Smash = 5) · 🏃 Rally Run (the Coach sends everything back, faster and faster) · 🤹 Juggle (keepy-up alone — switch foot · knee · head for bonus).", "🌀 Spark Party: a bouncy ball + 2–3 extra balls on the table at once — every ball you send back onto their half counts!", "🏆 Cups: Cup of 4 · Cup of 8 · 👑 Family Cup (family members captain the other teams) — knock-out, lose once and you are out; pick the sport in the setup. ⭐ In the 📖 Spirit Bestiary, pin a favourite creature per move — from 🔥 Intermediate it comes every time."],   // 🔥 pd-2 (PyraDive chat: send text changes to the UiKit lane)
    'tdstories': ['Story books where you defend a tower: keep the enemies away until the last wave.', 'Before each wave every hero levels up — pick ONE skill card. Tap the round coloured buttons to use skills (they also go off by themselves on easy levels).', 'One skill of each colour 🔴🔵🟤🟢🟣, up to Lv 3. Tier 5 = ⭐ evolve, tier 10 = ⭐ ULTIMATE!'],   // 🏰 td-1
    'maze': ['A brand-new maze every time — find the 🚩 way out.', 'Arrow keys, swipe or the arrow buttons. Grab 🔑 keys to open doors.', 'Faster = more stars. Bigger levels have more turns.'],
    'stacking-sim': ['Build a tall, steady tower of shapes up to the goal line.', 'Move the shape, then drop it (tap or Space). It wobbles like real blocks!', 'Wide shapes at the bottom, small ones on top.'],
    'robot-adventure': ['Write a little program so the robot reaches the goal.', 'Tap blocks to build your code, press ▶ Run, then fix it if it bumps.', 'Use 🔁 loops to keep the code short.'],
    'checkers': ['Jump over the other side\'s pieces to take them. Reach the far end to become a 👑 king.', 'Tap a piece, then the square to move to. Play the robot or 👫 a friend.', 'If you can jump, you must jump!'],
    'chess': ['Trap the other king — checkmate!', 'Tap a piece and its moves light up. Early levels use mini boards. Play the robot or 👫 a friend.', 'Keep your king safe and guard your pieces.'],
    'pinball': ['Keep the ball in play and score big.', '← / → (or tap the left / right side) flip, Space launches.', 'Hit the lit targets for jackpots and the Break-out!'],
    'hopper': ['Hop your avatar across roads, rivers and rails.', 'Arrows or swipe, one tile at a time. Ride logs, dodge cars, grab 🪙.', 'Wait for a gap — the screen only chases you on harder levels.'],
    'turbo': ['Race to the finish before the clock runs out.', 'Steer with arrows, the ✚ pad or 🕹️ joystick; jump over blocks.', 'Grab ⚡ boosts and beat your own ghost.'],
    'memory': ['Flip cards and find the matching pairs — pick a 🗺️ map (4×4 to 10×10) and a 🎚️ level.', 'Tap two cards. A match stays open; no match flips back. From ⚡ Hard a miss makes cards 🔀 swap; 💀 Hardcore shows every card, then scrambles them.', 'Fewer flips = more stars — remember where things were!'],
    'math-quest': ['Answer math questions to travel through 5 worlds.', 'Tap the answer or type it with the number keys.', 'Try ⏱️ Minute Challenge: how many in 60 seconds?'],
    'number-grid': ['A number puzzle: every row, column and box gets each number once.', 'Drag a number onto a square, or tap a square then a number.', 'Start with the square that has only one number that fits.'],
    'pop-blocks': ['Pop groups of matching blocks.', 'Tap a group of 2 or more of the same colour.', 'Big groups make super blocks — save them for combos.'],
    'block-drop': ['Falling blocks: fill whole rows to clear them.', 'Arrows or the thumb pad move, ↑ / A turns, ↓ drops faster.', 'Keep the stack flat and leave one gap for long pieces.'],
    'double-up': ['Slide tiles — two the same join and double (2 + 2 = 4).', 'Arrows or swipe move every tile at once.', 'Keep your biggest tile in a corner.'],
    'sweet-swap': ['Swap two neighbours to make 3 in a row and meet the goals.', 'Drag or tap two pictures next to each other. Moves are limited!', '2 × 2 = 🏀, 4 = ✚, L or T = 💥, 5 = 🌈, 6+ = ✨ theme power.'],
    'pose-party': ['Copy the poses with your whole body — the camera checks how close you are.', 'Stand back so the camera sees you, copy the little avatar, hold still for 3, 2, 1 📸. Opens on its own camera page.', 'Watch your arm lines: green = right, red = move that part!'],
    'sla-brall': ['6 racket sports in one: table hockey, pickleball, tennis, ping-pong, badminton and squash — beat the robot, play 2 players / 2 vs 2, or run a 🏆 tournament with 4 or 8 teams.', 'Move with W A S D (or drag on your side). Walk into the ball to hit it; F G T H = smash, drop, lob, slice; E = power-up.', 'Watch the ball\'s shadow — and hit the ball through the power orb! Win matches to unlock ☄️ ball trails.'],
    'snakeast': ['Ride your snake! 🍎 Snakeast = grid snake, 🧭 Snakigate = steer anywhere with family snakes, 🏰 Snakastle = loop home to grab land, 📜 Snaketale = story quests.', 'Arrows or W A S D to turn (swipe or the round pad on a tablet), Space = skill, P = pause. Snakigate: hold E / Shift or 💨 to boost.', 'Plan your turn one square early, and always leave yourself a way out!'],
    'alignext': ['Line them up! 🔴 Drop discs into a stand, or ❌⭕ put pieces anywhere on the board (Omnifile).', 'Tap a column / square, or drag your disc there. Beat Robo on 6 levels, play 2 players, or 3–4 in Drop.', 'A glowing spot means someone can win there next — block it! Two lines ready at once = Robo can only block one.'],
    'wisdeck': ['Learn-by-quiz card game with 3 kinds of play. 🧠 Quiz games: WisQuiz (pick a category — a right answer wins that card), WisBuzz (2–4 players buzz first, first to 7), WisDaily (5 questions, the same for the family each day). 🔢 Number games with the cards you won: WisCount (🗄️ rack of 10 → hand of 5, ⚡ ≤ 15) and WisJack (get close to 20). 📚 Learn + store: WisLearn (flip the cards — picture, English + Thai, fun fact) and WisStock (your cards + tiers).', 'Every card has a ⚡ power 1–9 from a real fact (the biggest, longest, fastest… is 9). Shelves: 🌍 World · ⏳ Time · 🦁 Zoo · 🔬 Science · 🛠️ Human-made. In WisLearn ← → or swipe to flip, 🔊 says the name.', 'Look at the ⚡ power line on each card — it tells you WHY the card is strong.'],
    'artifactory': ['The maker app! Pick a machine — 🌀 lathe, 💎 stone polishing, 🎨 finish bench, 🔨 furniture — and make real things from the materials in your bag. Wear them in the 🪞 fitting mirror.', 'Lathe: drag the chisel along the spinning wood to carve the shape. Stone: rub back and forth through the grits, then tap when the glowing edge reaches the top to cut a facet. Finish: brush paint over the whole thing, then varnish and engrave.', 'Every machine shows a real-life lesson while you wait — and a safety card the first time!'],
    'geoscout': ['Numbers you can touch! Every number is a stack of blocks with its own face. 📖 Journey (6 story chapters with our number friends), ⚖️ Scale (< = > and balance — you even get weighed), 🧱 Count, 🔷 Shape builder, 🔟 Tens tower, 🧩 What comes next, 🍕 Fractions, 🏗️ Wobble tower (exact height) and ⚔️ Tower battle for 2.', 'Drag a number onto another to snap them (+). Tap a number, then tap one of its blocks to split it (−). From ⚡ Hard: ✖️ copy and ➗ share. Keys: < = > · ← → · Enter · S C D U.', 'Shapes weigh as many blocks as they have corners: a triangle = 3!'],
    'georead': ['Phonics with letter boxes! Your avatar carries letter boxes. Tap a box to hear its SOUND (c says "kuh"), then 💥 Bump — the boxes blend into a word: "c… a… t… cat!" Pick the right picture. 🧱 Word builder: see a picture and put the boxes in the gaps.', 'Tap or drag the boxes. 🔁 hears it again. 💎 Vowels (a e i o u) have a gem. Hard: ✨ magic e (cap → cape). 💀 Hardcore: no picture help + a clock.', 'Say every sound out loud with the voice, then say them faster and faster — that is blending!'],
    'eyes-brain': ['Number memory! Tap 👀 Reveal: a number shows in little groups (chunks) for a few seconds, then hides. Type it back and tap ✅ — every right digit scores, perfect rounds in a row make a 🔥 combo and fill the 🧠 riot meter (×2 points).', 'Keypad or keyboard (digits, Backspace, Enter). 🔁 Backwards (Hard+): type it the other way round. 🏔️ Challenge: one more digit each time until you miss. 🌱 Basic lets you 👀 look again once.', 'Chunk it! Say the groups out loud while you look: 152 · 131 · 68.'],
    'polyplot': ['Dots & boxes grown up: draw ONE line between two neighbour dots. Close the last side of a shape → it is yours and you draw again! Triangles, squares, pentagons, hexagons and octagons — more sides = more points.', 'Drag from dot to dot or tap two dots (keyboard: arrows + Enter). 🏹 Hunt: your avatar runs to the line, grabs coins + gifts and catches creatures in the boxes you close. 🏰 Fortiplot: boxes closed in one turn build towers. Phones: pinch to zoom big maps.', 'Never draw the 3rd side of a square (the red glow warns you) — and near the end give away the smallest chain first!'],
    'soul-bopper': ['A bomber maze with your avatar: plant bombs that pop in a + shape, break blocks for power-ups, last one standing wins. Caught? Come back as a 👻 ghost!', 'Arrows or W A S D move, Space plants 💣, Shift = ✨ skill (kick / toss / 👻 trap). 2 players: W A S D + F / T and arrows + Num 2 / Num 6 — change them in ⌨️ Keys. Controllers and tablets work too.', 'Plant, then step round a corner — the pop only goes straight. Two bombs in a row = chain pop!'],
    'brawl-buddies': ['A cartoon bonk battle with your avatar — beat Robo-Buddy (tag teams from Hard) or a family player.', 'Left: A D move, W jump, S duck, F boop, G bonk, H power, T dodge. Right: L \' move, P jump, ; duck, ← ↓ → ↑. Walk back to block. Tap forward twice = 💨 dash (+ F / G / H), back twice = dash back, 2 hit keys together = 🤼 grab, hold G = 🔨 guard breaker, T + G = 🔁 tag a buddy in.', 'Duck + Power = 🚀 uppercut — then hit them in the air, up to 5 bounces! Grabbed? Tap back twice fast to wriggle out. 🗺️ Brawenture = adventure mode: 6 tales, co-op up to 4, a puzzle on every map — rescue a family member!'],
    'beat-corner': ['A music game — hit the beats when they reach the corner buttons. 🎹 Piano: notes fall onto the keys — play the tune! 🥁 Drums: hit the pieces of a kit that grows every level. 🎸 Band: 2 players together.', 'Tap the button or press Z X / . — hold for long beats, Space = 💃 dance pad.', 'Listen to the music, it tells you when!'],
    'word-board': ['Make words crossword-style with your letter tiles.', 'Drag tiles onto the board, then press ✅. Play the robot or 👫 2–4 players.', 'Long words and bonus squares score big.'],
    'number-board': ['Build true number sentences like 3 + 4 = 7, crossword-style.', 'Drag tiles onto the board, then press ✅. Play the robot or 👫 2–4 players.', 'Every sentence needs one = sign.'],
    'code-robot': ['Plan the arrows to guide the robot to the ⭐.', 'Tap arrows to make a list, then press ▶ Go.', 'Count the squares before you start.'],
    'color-match': ['Match the colours (and shapes later).', 'Tap the picture with the same colour.', 'Speed stages: be quick but careful!'],
    'count-match': ['Count the things and find the number.', 'Count, then tap the right number.', 'Touch each thing with your eyes as you count.'],
    'trash-pointer': ['Help keep the park clean — sort the rubbish.', 'Drag each piece into the bin with the right colour.', 'Blue = paper & plastic, green = food, grey = the rest.']
  };
  function gameHelp(id, name, icon, multi){
    const h = GAME_HELP[id]; if(!h) return null;
    const lines = [['🎯', h[0]], ['🎮', h[1]], ['💡', h[2]]];
    if(multi) lines.push(['👥', 'Also for **2 players** on one screen.']);
    return {icon: icon || '🎮', title: name || 'How to play', lines: lines};
  }

  function loading(kind, text){
    const el = ensureLoader();
    const k = kindOf(kind);
    const sp = el.querySelector('.ui-spin'); sp.textContent = k[0]; sp.className = 'ui-spin a-' + (k[2] || 'spin');
    el.querySelector('.ui-loader-text').innerHTML = esc(text || k[1]) + dots;
    showTip(el);
    el.classList.add('on');
    loaderShownAt = Date.now(); loaderSeq++;
    try { window.UIWD && UIWD.loader(true); } catch(e){}   // 🛡️ wd-1: 💤 loader up too long → card
  }
  // A loader opened right after another one closed must stay up: the old close timer only hides
  // the loader it belonged to (bug: Dashboard → My Room showed the world room for seconds).
  let loaderSeq = 0;
  function loaded(){
    try { window.UIWD && UIWD.loader(false); } catch(e){}   // 🛡️ wd-1
    if(!loaderEl) return;
    clearTimeout(loaderSafety);
    const wait = Math.max(0, MIN_MS - (Date.now() - loaderShownAt)), seq = loaderSeq;
    setTimeout(() => { if(seq === loaderSeq) loaderEl.classList.remove('on'); }, wait);
  }

  // ----- page change -----
  // Must be called directly inside the click handler (no await / .then /
  // setTimeout before it): iOS Home Screen apps only let the page leave its
  // sandboxed frame while the tap is still "fresh".
  // ⚡ ws-3 MINI SHOW — opening the Gameroom, the Achievements page or a game: about 1 in 4, never twice in a row,
  // never from a game page (so never straight after a game result), only while the loader is up anyway (adds no waiting).
  const MINI_FROM = ['home', 'gameroom', 'achievements', 'collection'], MINI_SKIP_TO = ['home', 'setup', 'room', 'collection', 'workshop', 'poseparty'];
  function miniDecide(lastShown, from, to, rand){
    if(MINI_FROM.indexOf(from || 'home') < 0) return false;
    if(!to || MINI_SKIP_TO.indexOf(to) >= 0) return false;
    if(lastShown) return false;
    return (rand || Math.random)() < 0.3;   // 0.3 with the no-repeat rule ≈ 1 in 4 overall
  }
  const MINI_LOG = [];
  function miniShow(kind, opts){
    opts = opts || {};
    let mood = 'candy'; try { mood = localStorage.getItem('sp_ws_mood') || 'candy'; } catch(e){}
    if(['candy', 'cozy', 'epic', 'apoc', 'ride', 'play'].indexOf(mood) < 0) mood = 'candy';
    const av = typeof window.miniShowAvatar === 'function' ? (function(){ try { return window.miniShowAvatar(); } catch(e){ return null; } })() : null;
    const variant = opts.variant || (Math.random() < 0.5 ? 'run' : 'logo');
    const el = document.createElement('div'); el.className = 'ui-mini m-' + mood + ' v-' + variant; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="um-logo">' + 'STEAM'.split('').map((c, i) => '<i style="--i:' + i + '">' + c + '</i>').join('') + '</div>' +
      '<div class="um-run"><span class="um-av">' + (av && typeof drawAvatar === 'function' ? '<canvas width="80" height="100"></canvas>' : '🏃') + '</span><span class="um-ic">' + esc(kindOf(kind)[0]) + '</span></div>';
    document.body.appendChild(el);
    let raf = 0, t0 = performance.now();
    const cv = el.querySelector('canvas');
    if(cv){ const g = cv.getContext('2d'); const tick = () => { const t = (performance.now() - t0) / 1000; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 80, 100);
      try { drawAvatar(g, {name: '', av: av, dir: 1, walkT: t + 0.01}, 40, 94, 0.95, {t: t, noShadow: true}); } catch(e){} if(t < 0.9) raf = requestAnimationFrame(tick); }; tick(); }
    const close = () => { cancelAnimationFrame(raf); if(!el.parentNode) return; el.classList.add('bye'); setTimeout(() => el.remove(), 220); };
    el.addEventListener('pointerdown', e => { e.stopPropagation(); close(); });
    setTimeout(close, 820);
    MINI_LOG.push({kind: kind, mood: mood, variant: variant, avatar: !!cv, t: Date.now()});
    return el;
  }
  function miniMaybe(url, kind){
    try {
      const m = /[?&]page=([^&#]+)/.exec(url || ''), to = m ? decodeURIComponent(m[1]) : 'home', from = window.SP_PAGE || 'home';
      let last = false; try { last = localStorage.getItem('sp_ws_mini') === '1'; } catch(e){}
      const force = window.WS_MINI, eligible = MINI_FROM.indexOf(from) >= 0 && MINI_SKIP_TO.indexOf(to) < 0;
      if(!eligible || force === 'never') return false;
      const show = force === 'always' ? true : miniDecide(last, from, to);
      try { localStorage.setItem('sp_ws_mini', show ? '1' : '0'); } catch(e){}
      if(show) miniShow(kind);
      return show;
    } catch(e){ return false; }
  }
  function go(url, kind, text){
    UISound.play('nav');
    loading(kind || 'nav', text);
    miniMaybe(url, kind || 'nav');
    clearTimeout(loaderSafety);
    loaderSafety = setTimeout(() => {
      // The page never left (blocked redirect / Google sign-in quirk): don't trap the user.
      loaded();
      toast('Still opening — tap again if nothing happens', 'err');
    }, 7000);
    window.top.location.href = url;
  }

  // ----- button busy state -----
  function busy(btn, kind, text){
    if(!btn || btn.dataset.uiBusy) return;
    const k = kindOf(kind);
    btn.dataset.uiBusy = '1';
    btn.dataset.uiHtml = btn.innerHTML;
    btn.dataset.uiDisabled = btn.disabled ? '1' : '';
    btn.disabled = true;
    btn.classList.add('ui-busy');
    btn.innerHTML = spinHtml(k) + esc(text || k[1]) + dots;
  }
  function idle(btn){
    if(!btn || !btn.dataset.uiBusy) return;
    btn.innerHTML = btn.dataset.uiHtml;
    btn.disabled = btn.dataset.uiDisabled === '1';
    btn.classList.remove('ui-busy');
    delete btn.dataset.uiBusy; delete btn.dataset.uiHtml; delete btn.dataset.uiDisabled;
  }

  // ----- loader over one panel -----
  function section(el, kind, text){
    if(!el) return () => {};
    const k = kindOf(kind);
    if(getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const cover = document.createElement('div');
    cover.className = 'ui-section-loader';
    cover.innerHTML = spinHtml(k) + '<span>' + esc(text || k[1]) + dots + '</span>';
    el.appendChild(cover);
    const shownAt = Date.now();
    return () => setTimeout(() => cover.remove(), Math.max(0, MIN_MS - (Date.now() - shownAt)));
  }

  // ----- server call as a Promise, with the right loader -----
  // opts: {btn, kind, text, section: element, page: true, quiet: true}
  function call(fn, args, opts){
    opts = opts || {};
    const started = Date.now();
    let closeSection = null;
    if(opts.btn) busy(opts.btn, opts.kind, opts.text);
    if(opts.section) closeSection = section(opts.section, opts.kind, opts.text);
    if(opts.page) loading(opts.kind, opts.text);
    function finish(){
      if(opts.btn) idle(opts.btn);
      if(closeSection) closeSection();
      if(opts.page) loaded();
    }
    return new Promise((resolve, reject) => {
      // 🛡️ wd-1: no answer at all → give the button / panel / loader back (the promise stays open: a late or re-sent answer still lands)
      const stuck = window.UI_WATCHDOG === false ? null : setTimeout(() => { finish(); if(!opts.quiet && !(window.UI.wd && UI.wd.active)) toast('Still waiting for the server — please try again', 'err'); }, window.UI_WATCHDOG_MS > 0 ? window.UI_WATCHDOG_MS : 25000);
      const runner = google.script.run
        .withSuccessHandler(res => {
          clearTimeout(stuck);
          setTimeout(() => { finish(); resolve(res); }, Math.max(0, MIN_MS - (Date.now() - started)));
        })
        .withFailureHandler(err => {
          clearTimeout(stuck);
          setTimeout(() => {
            finish();
            if(!opts.quiet){
              UISound.play('error');
              toast((err && err.message) ? err.message : 'Something went wrong — please try again', 'err');
            }
            reject(err);
          }, Math.max(0, MIN_MS - (Date.now() - started)));
        });
      runner[fn].apply(runner, args || []);
    });
  }

  // ----- toast -----
  let toastEl = null, toastTimer = null;
  function toast(msg, type){
    if(!toastEl){
      toastEl = document.createElement('div');
      toastEl.className = 'ui-toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.className = 'ui-toast' + (type === 'err' ? ' err' : '');
    toastEl.innerHTML = '<span class="dot"></span><span>' + esc(msg) + '</span>';
    requestAnimationFrame(() => toastEl.classList.add('on'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('on'), 2600);
  }

  // ----- confirm box -----
  function confirmBox(o){
    o = o || {};
    return new Promise(resolve => {
      const m = document.createElement('div');
      m.className = 'ui-modal on';
      m.innerHTML = '<div class="ui-modal-card" role="dialog" aria-modal="true">' +
        '<div class="ico">' + esc(o.icon || (o.danger ? '⚠️' : '❓')) + '</div>' +
        '<h3>' + esc(o.title || 'Are you sure?') + '</h3>' +
        (o.body ? '<p>' + esc(o.body) + '</p>' : '') +
        '<div class="ui-modal-btns"><button class="no">' + esc(o.cancelText || 'Cancel') + '</button>' +
        '<button class="yes' + (o.danger ? ' danger' : '') + '">' + esc(o.okText || 'Yes') + '</button></div></div>';
      document.body.appendChild(m);
      function done(v){ document.removeEventListener('keydown', onKey); m.remove(); resolve(v); }
      function onKey(e){ if(e.key === 'Escape') done(false); if(e.key === 'Enter') done(true); }
      document.addEventListener('keydown', onKey);
      m.querySelector('.no').onclick = () => done(false);
      m.querySelector('.yes').onclick = () => done(true);
      m.addEventListener('click', e => { if(e.target === m) done(false); });
      m.querySelector('.yes').focus();
    });
  }

  // ----- keyboard / number pad typing for an on-screen PIN pad -----
  // Works with the number row AND the number pad, with Num Lock on or off
  // (e.code is "Numpad1" either way). Backspace/Delete = back, Esc = clear,
  // Enter = submit. The matching on-screen key flashes so kids see it.
  // opts: {isActive: () => bool, padEl: () => element, onDigit, onBack, onClear, onEnter}
  function pinKeyboard(opts){
    function flash(label){
      const pad = opts.padEl && opts.padEl();
      if(!pad) return;
      const key = Array.from(pad.querySelectorAll('button')).find(b => b.textContent.trim() === label);
      if(!key) return;
      key.classList.add('kb-press');
      setTimeout(() => key.classList.remove('kb-press'), 130);
    }
    document.addEventListener('keydown', e => {
      if(!opts.isActive || !opts.isActive()) return;
      const tag = (e.target && e.target.tagName) || '';
      if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if(e.ctrlKey || e.metaKey || e.altKey) return;
      let digit = null;
      if(/^Numpad[0-9]$/.test(e.code)) digit = e.code.slice(-1);
      else if(/^[0-9]$/.test(e.key)) digit = e.key;
      if(digit !== null){
        e.preventDefault(); flash(digit); UISound.play('key');
        if(opts.onDigit) opts.onDigit(digit);
        return;
      }
      if(e.key === 'Backspace' || e.key === 'Delete' || e.code === 'NumpadDecimal'){
        e.preventDefault(); flash('⌫'); UISound.play('key');
        if(opts.onBack) opts.onBack();
        return;
      }
      if(e.key === 'Escape'){
        e.preventDefault(); flash('Clear');
        if(opts.onClear) opts.onClear();
        return;
      }
      if(e.key === 'Enter' || e.code === 'NumpadEnter'){
        e.preventDefault();
        if(opts.onEnter) opts.onEnter();
      }
    });
  }

  // ----- screen-time lock for game pages -----
  // opts: {sessionStart, durationMin, enabled, homeUrl, onLock}
  // Returns {remainingMs()} or null when no session is running.
  function screenTimeLock(o){
    o = o || {};
    if(!o.sessionStart || !o.durationMin || o.enabled === false) return null;
    const end = Number(o.sessionStart) + Number(o.durationMin) * 60000;
    let shown = false, pin = '';
    const timer = setInterval(() => { if(Date.now() >= end) show(); }, 1000);
    function show(){
      if(shown) return;
      shown = true; clearInterval(timer);
      try{ if(o.onLock) o.onLock(); }catch(e){}
      const el = document.createElement('div');
      el.className = 'ui-lock';
      el.innerHTML = '<div class="ui-lock-card" role="dialog" aria-modal="true"><div class="face">😴</div>' +
        '<h2>Playtime\'s paused!</h2><p>Time\'s up for now. Ask a grown-up to enter the code to keep going.</p>' +
        '<div class="ui-lock-dots"></div><div class="ui-lock-pad"></div><div class="ui-lock-msg"></div></div>';
      document.body.appendChild(el);
      const pad = el.querySelector('.ui-lock-pad'), dots = el.querySelector('.ui-lock-dots'), msg = el.querySelector('.ui-lock-msg');
      function renderDots(){ dots.innerHTML = ''; for(let i = 0; i < Math.max(pin.length, 4); i++){ const d = document.createElement('span'); if(i < pin.length) d.className = 'on'; dots.appendChild(d); } }
      function key(label, fn, cls){ const b = document.createElement('button'); b.textContent = label; if(cls) b.className = cls; b.onclick = fn; pad.appendChild(b); }
      function digit(d){ if(pin.length >= 8) return; pin += d; renderDots(); if(pin.length >= 4) check(); }
      function check(){
        msg.innerHTML = '<span class="ui-spin">🔑</span> Checking…';
        google.script.run.withSuccessHandler(ok => {
          if(ok){
            UISound.play('unlock'); msg.textContent = '';
            pad.innerHTML = '';
            key('🏠 Back to the Dashboard', () => go(o.homeUrl, 'unlock'), 'home');
            go(o.homeUrl, 'unlock');
          } else if(pin.length >= 8){ UISound.play('error'); msg.textContent = 'Wrong PIN, try again.'; pin = ''; renderDots(); }
          else msg.textContent = '';
        }).withFailureHandler(() => { msg.textContent = 'Could not check the PIN — try again.'; }).verifyAdminPin(pin);
      }
      ['1','2','3','4','5','6','7','8','9'].forEach(n => key(n, () => digit(n)));
      key('Clear', () => { pin = ''; renderDots(); }, 'wide');
      key('0', () => digit('0'));
      key('⌫', () => { pin = pin.slice(0, -1); renderDots(); }, 'wide');
      renderDots();
      pinKeyboard({
        isActive: () => document.body.contains(el),
        padEl: () => pad,
        onDigit: digit,
        onBack: () => { pin = pin.slice(0, -1); renderDots(); },
        onClear: () => { pin = ''; renderDots(); },
        onEnter: () => { if(pin.length >= 4) check(); }
      });
    }
    if(Date.now() >= end) setTimeout(show, 0);
    return { remainingMs: () => Math.max(0, end - Date.now()) };
  }

  /* ----- player PIN (title, look, avatar, room) ----- */
  // Once a player types their PIN it stays unlocked on this device for the rest of the day.
  function today(){ const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function dayPin(name){ try { const r = JSON.parse(localStorage.getItem('sp_daypin:' + name) || 'null'); return r && r.d === today() ? r.p : null; } catch(e){ return null; } }
  function rememberDayPin(name, pin){ try { localStorage.setItem('sp_daypin:' + name, JSON.stringify({d: today(), p: String(pin)})); } catch(e){} }
  function forgetDayPin(name){ try { localStorage.removeItem('sp_daypin:' + name); } catch(e){} }
  // opts: {name, hasPin, why}. Resolves with the PIN, or null if cancelled.
  function playerPin(o){
    o = o || {}; const name = o.name;
    const known = dayPin(name); if(known && o.hasPin) return Promise.resolve(known);
    return new Promise(resolve => {
      let mode = o.hasPin ? 'check' : 'new', step = 1, first = '', pin = '', busy = false, seq = 0;
      const el = document.createElement('div'); el.className = 'ui-lock ui-ppin';
      el.innerHTML = '<div class="ui-lock-card" role="dialog" aria-modal="true"><div class="face"><span class="ui-spin a-key">🔑</span></div><h2></h2><p></p>' +
        '<div class="ui-lock-dots"></div><div class="ui-lock-pad"></div><div class="ui-lock-msg"></div><div class="ui-ppin-btns"><button class="ui-ppin-no">Cancel</button><button class="ui-ppin-ok">OK</button></div></div>';
      document.body.appendChild(el);
      const $q = s => el.querySelector(s), pad = $q('.ui-lock-pad'), dots = $q('.ui-lock-dots'), msg = $q('.ui-lock-msg');
      function head(){ $q('h2').textContent = mode === 'new' ? (step === 1 ? '🔑 Choose your secret PIN' : '🔑 Type it again') : '🔑 ' + name + ', type your PIN';
        $q('p').textContent = mode === 'new' ? '4 to 8 numbers only you know. It keeps your look, title, avatar and room safe.' : (o.why || 'Only ' + name + ' can change this.') + ' It stays unlocked for today.'; }
      function renderDots(){ dots.innerHTML = ''; const n = pin.length, show = Math.max(4, Math.min(8, n + (n >= 4 && n < 8 ? 1 : 0))); for(let i = 0; i < show; i++){ const d = document.createElement('span'); if(i < n) d.className = 'on'; dots.appendChild(d); } }
      function done(p){ rememberDayPin(name, p); UISound.play('unlock'); close(p); }
      function close(v){ el.remove(); active = false; resolve(v); }
      function wrong(t){ UISound.play('error'); msg.textContent = t; pin = ''; busy = false; renderDots(); }
      function tryCheck(final){
        const p = pin, my = ++seq; if(final){ busy = true; msg.innerHTML = '<span class="ui-spin a-key">🔑</span> Checking…'; }
        google.script.run.withSuccessHandler(ok => { if(my !== seq && !ok) return; if(ok) return done(p); if(final || p.length >= 8) wrong('That PIN is not right — try again.'); })
          .withFailureHandler(() => { busy = false; msg.textContent = 'Could not check the PIN — try again.'; }).verifyPlayerPin(name, p);
      }
      function submit(){
        if(busy) return; if(pin.length < 4){ wrong('A PIN is 4 to 8 numbers.'); return; }
        if(mode === 'check') return tryCheck(true);
        if(step === 1){ first = pin; pin = ''; step = 2; head(); renderDots(); msg.textContent = ''; return; }
        if(pin !== first){ step = 1; first = ''; head(); wrong('Those didn\'t match — start again.'); return; }
        busy = true; msg.innerHTML = '<span class="ui-spin a-key">🔑</span> Saving your PIN…'; const p = pin;
        google.script.run.withSuccessHandler(() => done(p)).withFailureHandler(e => { busy = false; wrong((e && e.message) || 'Could not save the PIN.'); }).setPlayerPin(name, p);
      }
      function digit(d){ if(busy || pin.length >= 8) return; pin += d; renderDots(); msg.textContent = '';
        if(mode === 'check'){ if(pin.length >= 4) tryCheck(false); } else if(step === 2 && pin.length === first.length) submit(); }
      function key(label, fn, cls){ const b = document.createElement('button'); b.textContent = label; if(cls) b.className = cls; b.onclick = () => { UISound.play('key'); fn(); }; pad.appendChild(b); }
      ['1','2','3','4','5','6','7','8','9'].forEach(n => key(n, () => digit(n)));
      key('Clear', () => { pin = ''; renderDots(); }, 'wide'); key('0', () => digit('0')); key('⌫', () => { pin = pin.slice(0, -1); renderDots(); }, 'wide');
      $q('.ui-ppin-no').onclick = () => close(null); $q('.ui-ppin-ok').onclick = submit;
      let active = true; head(); renderDots();
      pinKeyboard({isActive: () => active, padEl: () => pad, onDigit: digit, onBack: () => { pin = pin.slice(0, -1); renderDots(); }, onClear: () => { if(!pin) close(null); else { pin = ''; renderDots(); } }, onEnter: submit});
    });
  }

  /* ----- LOOKS (themes) ----- */
  // Keys match Code.gs THEME_KEYS. Each look's page styling lives in
  // Themes.html (shell pages); the loader / pop-up colours live above.
  const THEMES = [
    {key:'classic',   name:'Classic',         icon:'🌼', tag:'Warm & cosy',          fonts:'Fredoka:wght@500;600;700&family=Nunito:wght@500;700;800'},
    {key:'racing',    name:'Racing',          icon:'🏎️', tag:'Fast & bold',          fonts:'Russo+One&family=Exo+2:wght@500;700;800'},
    {key:'princess',  name:'Fantasy Princess', icon:'👑', tag:'Sparkly & soft',      fonts:'Baloo+2:wght@500;600;700;800&family=Quicksand:wght@500;600;700'},
    {key:'architect', name:'Architect',       icon:'📐', tag:'Blueprint lines',      fonts:'Architects+Daughter&family=Nunito:wght@500;700;800'},
    {key:'hologram',  name:'Future Hologram', icon:'🛸', tag:'Glowing glass',        fonts:'Orbitron:wght@500;600;700&family=Exo+2:wght@500;700;800'},
    {key:'retro',     name:'Retro Punk',      icon:'🎸', tag:'Loud stickers',        fonts:'Bungee&family=Rubik:wght@500;700;800'},
    {key:'cyberpunk', name:'Cyberpunk',       icon:'🌃', tag:'Neon city',            fonts:'Chakra+Petch:wght@500;600;700'}
  ];
  const OLD_NAMES = {'default':'classic', 'fantasy-princess':'princess'};
  function themeKey(k){ k = OLD_NAMES[k] || k; return THEMES.some(t => t.key === k) ? k : 'classic'; }
  const fontLoaded = {};
  function loadThemeFonts(key){
    const t = THEMES.find(x => x.key === key);
    if(!t || key === 'classic' || fontLoaded[key]) return;
    fontLoaded[key] = true;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + t.fonts + '&display=swap';
    document.head.appendChild(l);
  }
  // kitOnly: game pages keep their own look; only loaders/pop-ups follow.
  function applyTheme(key, opts){
    key = themeKey(key);
    loadThemeFonts(key);
    const root = document.documentElement;
    if(opts && opts.kitOnly){ root.setAttribute('data-kit-theme', key); themeGameMenus(key); }
    else root.setAttribute('data-theme', key);
    return key;
  }
  // Game pages: their menu screens (section.screen) wear the player's look; the play screen keeps the game's art.
  // Cards are found by colour (anything painted with --card) and tagged .t-card so each look can shape them.
  let menuObs = null, tagTimer = 0, menuKey = 'classic';
  function themeGameMenus(key){
    const b = document.body; if(!b || !document.getElementById('ui-themes') || !document.querySelector('section.screen')) return;
    if(!b.style.getPropertyValue('--game-accent')){ const cs = getComputedStyle(document.documentElement); b.style.setProperty('--game-accent', cs.getPropertyValue('--terracotta').trim() || '#888'); b.style.setProperty('--game-accent2', cs.getPropertyValue('--mustard').trim() || '#aaa'); }
    menuKey = key; tagMenus();
    if(!menuObs){ menuObs = new MutationObserver(() => { clearTimeout(tagTimer); tagTimer = setTimeout(tagMenus, 40); }); menuObs.observe(b, {childList: true, subtree: true, attributes: true, attributeFilter: ['class']}); }
  }
  function tagMenus(){
    const b = document.body, on = menuKey !== 'classic';
    if(menuObs) menuObs.disconnect();
    document.querySelectorAll('section.screen, .top-btn').forEach(sc => {
      if(!on){ sc.removeAttribute('data-theme'); return; }
      if(sc.classList.contains('screen') && !sc.style.getPropertyValue('--menu-w')){ const was = sc.classList.contains('hidden'); sc.classList.remove('hidden'); sc.removeAttribute('data-theme'); const mw = getComputedStyle(sc).maxWidth; if(was) sc.classList.add('hidden'); sc.style.setProperty('--menu-w', mw && mw !== 'none' ? mw : '920px'); }
      sc.setAttribute('data-theme', menuKey);
    });
    if(on) document.querySelectorAll('section.screen:not(.hidden)').forEach(sc => {
      const pr = document.createElement('i'); pr.style.cssText = 'position:absolute;width:0;height:0;background:var(--card)'; sc.appendChild(pr); const cardBg = getComputedStyle(pr).backgroundColor; pr.remove();
      sc.querySelectorAll('h1').forEach(e => e.classList.add('t-head'));
      sc.querySelectorAll('button, div, details, label').forEach(e => {
        if(e.classList.contains('t-card') || e.classList.contains('t-btn')) return;
        if(e.classList.contains('btn')){ e.classList.add('t-btn'); return; }
        if(getComputedStyle(e).backgroundColor === cardBg) e.classList.add('t-card');
      });
    });
    if(menuObs){ menuObs.takeRecords(); menuObs.observe(b, {childList: true, subtree: true, attributes: true, attributeFilter: ['class']}); }
  }
  // The player's own look, else the family default (Settings: Theme_<name>, Theme).
  function themeFor(settings, player){
    settings = settings || {};
    return themeKey((player && settings['Theme_' + player]) || settings.Theme || 'classic');
  }
  // Last look per player kept in this browser so a page paints in the right
  // look before the server answers (convenience only; the sheet is the truth).
  function rememberTheme(player, key){ try{ localStorage.setItem('sp_theme:' + (player || ''), themeKey(key)); }catch(e){} }
  function cachedTheme(player){ try{ return themeKey(localStorage.getItem('sp_theme:' + (player || '')) || localStorage.getItem('sp_theme:') || 'classic'); }catch(e){ return 'classic'; } }

  // ----- 🏆 Who played this game + Leader points (every main game's level picker, under How to play) -----
  // UI.leaders(el, gameId, me): one server call; rows = rank, avatar, name, levels (💀 when Hardcore), best score / time, plays, points.
  function leaders(el, gameId, me, data){   /* 🧱 b1b: + data (already loaded → no 2nd call) */
    if(!el || (!data && (!window.google || !google.script))) return;
    const fmt = s => { s = Math.round(s || 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
    if(!el.innerHTML) el.innerHTML = '<div class="uil-card"><div class="uil-h">🏆 Who played this game</div><div class="uil-load"><span class="ui-spin a-bounce">🏆</span> Counting the champions' + '…</div></div>';
    const paint = d => {
      const list = (d && d.players) || [];
      if(!list.length){ el.innerHTML = '<div class="uil-card"><div class="uil-h">🏆 Who played this game</div><div class="uil-none">Nobody yet — be the first champion! 🚀</div></div>'; return; }
      const row = (m, i) => { const medal = ['🥇', '🥈', '🥉'][i] || (i + 1) + '.', lv = '●'.repeat(Math.min(5, m.levels)) + '○'.repeat(Math.max(0, 5 - m.levels)) + (m.hardcore ? ' 💀' : '');
        const why = 'Levels ' + m.pts.levels + ' + best scores ' + m.pts.score + ' + fastest times ' + m.pts.time + ' + stars ' + m.pts.stars + ' + games played ' + m.pts.plays;
        return '<div class="uil-row' + (m.name === me ? ' me' : '') + (i === 0 ? ' lead' : '') + '" title="' + esc(why) + '"><span class="uil-rank">' + medal + '</span><canvas class="uil-av" width="72" height="72" data-n="' + esc(m.name) + '"></canvas>' +
          '<span class="uil-nm">' + esc(m.name) + (i === 0 ? ' <b class="uil-crown">👑 Leader</b>' : '') + '<small>' + lv + ' · ' + m.plays + ' game' + (m.plays === 1 ? '' : 's') + '</small></span>' +
          '<span class="uil-st">' + (d.byScore && m.bestScore ? '🏆 ' + Number(m.bestScore).toLocaleString() : '') + (m.bestTime ? '<i>⏱ ' + fmt(m.bestTime) + '</i>' : '') + (m.stars ? '<i>⭐ ' + m.stars + '</i>' : '') + '</span>' +
          '<span class="uil-pts"><b>' + Number(m.total).toLocaleString() + '</b><small>points</small></span></div>'; };
      el.innerHTML = '<div class="uil-card"><div class="uil-h">🏆 Who played this game <small>Leader points = levels + best scores + fastest times + stars + games played</small></div>' + list.map(row).join('') + '</div>';
      el.querySelectorAll('canvas.uil-av').forEach(c => { const m = list.find(x => x.name === c.dataset.n); const g = c.getContext('2d');
        try { if(typeof drawPreviewCanvas === 'function' && typeof fixAv === 'function'){ const big = document.createElement('canvas'); big.width = 120; big.height = 140; drawPreviewCanvas(big, m.avatar ? Object.assign(fixAv(m.avatar), {eq: {}}) : defaultAvatar(m.name), {name: m.name, t: 1}); g.drawImage(big, 28, 14, 64, 64, 0, 0, 72, 72); return; } } catch(e){}
        g.fillStyle = '#FF8FB1'; g.beginPath(); g.arc(36, 36, 34, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '700 34px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(m.name.charAt(0).toUpperCase(), 36, 38); });
    };
    if(data){ paint(data); return; }
    google.script.run.withSuccessHandler(paint).withFailureHandler(() => { el.innerHTML = ''; }).getGameLeaders(gameId);
  }

  return {guideAuto, glowHelp, GUIDE_LOG, appStatus, miniDecide, miniShow, miniMaybe, MINI_LOG, go, loading, loaded, busy, idle, section, call, toast, confirm: confirmBox, guide, guideOnce, gameHelp, GAME_HELP, randomTip, TIPS, pinKeyboard, playerPin, dayPin, rememberDayPin, forgetDayPin, screenTimeLock, esc, KINDS, leaders,
    THEMES, themeKey, applyTheme, themeFor, rememberTheme, cachedTheme, loadThemeFonts};
})();

/* ================= 🗂️ MODE GROUPS (mg-1): a game's modes in 2–4 coloured boxes by TYPE (Rules "Mode groups", like WisDeck wd-10) =================
   UI.modeGroups(box, groups, modes, {onPick(k, btn) → 'stop' = refused · false = the game re-drew the buttons, next: () => element to bring into view after a pick})
   groups = [{k, icon, en, th, c (colour)}] · modes = [{k, g, icon, name, type (🃏 mc-1: 'A table hockey game'), sub (the rule / condition), next ('👇 then pick a level' — what the next tap does), on, soon, id}]
   Wide screens: boxes side by side (columns sized by how many modes they hold); phones: boxes stacked, buttons side by side, compact. */
(function(){
  if(!window.UI) return;
  /* 🃏 MODE CARDS (mc-1, Aowu 2026-11-10): every mode button is a card — icon · Name · type ("A table hockey game") · rule (m.sub).
     Cards sit 3 / 2 / 1 in a row: as many columns as fit the box (≥ --mcw each, max 3), and a card whose text needs more room
     spans 2 or the whole row (measured after drawing, again on resize). A row's last card stretches to fill its row (fixed order kept).
     Only if the boxes still don't fit a phone's first screen: .mc-fit1 hides the rule line, .mc-fit2 also the type line. */
  const css = '.ui-mgroups{display:flex;flex-wrap:wrap;--mgw:190px;gap:10px;align-items:stretch;width:100%;box-sizing:border-box;margin:6px 0 4px;}'
    + '.ui-mgroup{flex:var(--gn,1) 1 calc(var(--gn,1) * var(--mgw) + 20px);border-radius:18px;padding:8px 8px 9px;min-width:0;box-sizing:border-box;background:color-mix(in srgb, var(--mg) 11%, transparent);border:2px solid color-mix(in srgb, var(--mg) 38%, transparent);}'
    + '.ui-mg-h{display:flex;align-items:baseline;justify-content:center;gap:7px;flex-wrap:wrap;font-family:var(--font-display,"Fredoka",sans-serif);font-weight:700;font-size:1rem;line-height:1.2;color:var(--mg);margin:0 0 7px;text-align:center;}'
    + '.ui-mg-h .th{font-family:"Mitr",var(--font-body,sans-serif);font-size:.76rem;font-weight:600;color:var(--ink-soft);}'
    + '.ui-mg-b{display:grid;grid-template-columns:repeat(var(--cols,2),minmax(0,1fr));gap:7px;}'
    + '.ui-mgroups .ui-mbtn.ui-mbtn{display:flex;flex-direction:row;align-items:center;justify-content:flex-start;gap:9px;width:100%;min-width:0;box-sizing:border-box;margin:0;padding:8px 10px 8px 8px;min-height:0;height:auto;grid-column:span var(--span,1);'
    + 'border:3px solid transparent;border-radius:15px;background:var(--card);color:var(--ink);text-align:left;cursor:pointer;font:inherit;box-shadow:0 4px 0 rgba(0,0,0,.08);position:relative;transform:translateZ(0);backface-visibility:hidden;}'
    + '.ui-mbtn:active{transform:translateZ(0) translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.08);}'
    + '.ui-mbtn > *{max-width:100%;box-sizing:border-box;}'
    + '.ui-mbtn .mi{font-size:1.75rem;line-height:1.1;flex:0 0 auto;width:2.1rem;text-align:center;}'
    + '.ui-mbtn .mi.mi2{width:auto;min-width:2.1rem;font-size:1.15rem;letter-spacing:-1px;white-space:nowrap;}'   /* 📏 p2 F4: two-emoji icons */
    + '.ui-mbtn .mt{display:flex;flex-direction:column;align-items:flex-start;gap:1px;flex:1 1 auto;min-width:0;}'
    + '.ui-mbtn .mn{font-family:var(--font-display,"Fredoka",sans-serif);font-weight:700;font-size:1rem;line-height:1.15;overflow-wrap:normal;word-break:keep-all;}'
    + '.ui-mbtn .my{font-size:.72rem;font-weight:800;font-style:italic;color:var(--mg);line-height:1.25;}'
    + '.ui-mbtn .ms{font-size:.72rem;font-weight:700;color:var(--ink-soft);line-height:1.3;}'
    + '.ui-mbtn .mx{font-size:.66rem;font-weight:900;color:var(--mg);line-height:1.2;margin-top:1px;}'
    + '.ui-mbtn.soon{opacity:.6;}'
    + 'html .ui-mgroups .ui-mbtn.on, html [data-theme] .ui-mgroups .ui-mbtn.on{border-color:#FFC845 !important;box-shadow:0 0 0 3px var(--mg) !important;background:var(--card) !important;color:var(--ink) !important;}'
    + '.ui-mbtn.on::after{content:"✓";position:absolute;top:4px;right:6px;background:#FFC845;color:#3A2500;border-radius:50%;width:19px;height:19px;font-size:.72rem;font-weight:900;display:flex;align-items:center;justify-content:center;}'
    + '.ui-mbtn.on .mt{padding-right:14px;}'
    + '.ui-mgroups.mc-fit1 .ui-mbtn .ms,.ui-mgroups.mc-fit1 .ui-mbtn .mx,.ui-mgroups.mc-fit2 .ui-mbtn .my{display:none;}.ui-mgroups.mc-fit2 .ui-mbtn.ui-mbtn{padding-top:4px;padding-bottom:4px;gap:5px;}.ui-mgroups.mc-fit2{--mgw:104px;}'
    + '@media (max-width:759px){.ui-mgroups{gap:7px;--mgw:150px;}.ui-mgroup{flex-basis:100%;}.ui-mgroup{padding:6px 7px 7px;}.ui-mg-h{font-size:.92rem;margin-bottom:5px;}'
    + '.ui-mg-b{gap:6px;}.ui-mgroups .ui-mbtn.ui-mbtn{padding:6px 8px 6px 6px;gap:7px;}.ui-mbtn .mi{font-size:1.4rem;width:1.7rem;}.ui-mbtn .mn{font-size:.9rem;}.ui-mbtn .my,.ui-mbtn .ms{font-size:.66rem;}.ui-mbtn .mx{display:none;}}'
    + '@media (max-height:500px) and (orientation:landscape){.ui-mgroups{margin:2px 0;gap:7px;--mgw:150px;}.ui-mgroup{padding:5px 6px 6px;}.ui-mg-h{font-size:.86rem;margin-bottom:4px;}'
    + '.ui-mgroups .ui-mbtn.ui-mbtn{gap:6px;padding:4px 7px 4px 5px;}.ui-mbtn .mi{font-size:1.2rem;width:1.5rem;}.ui-mbtn .mn{font-size:.84rem;}.ui-mbtn .my,.ui-mbtn .ms{font-size:.62rem;line-height:1.2;}.ui-mbtn .mx{display:none;}'
    // short landscape (phone on its side): a slim title so every mode box shows on the first screen
    + '#scr-menu:has(.ui-mgroups) .title .logo,#scr-menu:has(.ui-mgroups) .title > p,#scr-menu:has(.ui-mgroups) .title .sub2{display:none !important;}'
    + '#scr-menu:has(.ui-mgroups) .title{padding-top:0;padding-bottom:0;margin-bottom:2px;}#scr-menu:has(.ui-mgroups) .title h1{font-size:1.45rem;margin:0;line-height:1.15;}'
    + '#scr-menu:has(.ui-mgroups) .title .who{margin-top:2px;padding:2px 10px;}'
    + '#scr-menu:has(.ui-mgroups) .ui-also{margin:3px auto 4px;padding:4px 8px;}#scr-menu:has(.ui-mgroups) .ui-also small{display:none;}#scr-menu:has(.ui-mgroups) .ui-also .ua-go{min-height:36px;padding:5px 10px;}}'
    // 👇 "more below" pill: the level / chapter list is under the fold
    + '.ui-mg-more{position:fixed;left:50%;bottom:calc(var(--safe-b,18px) + 4px);transform:translateX(-50%);z-index:60;border:none;border-radius:999px;padding:8px 16px;font:inherit;font-weight:900;font-size:.88rem;cursor:pointer;'
    + 'background:var(--ink,#2B2B2B);color:var(--card,#fff);box-shadow:0 6px 16px rgba(0,0,0,.25);animation:uiMgBob 1.6s ease-in-out infinite;white-space:nowrap;}'
    + '.ui-mg-more.hidden{display:none;}@keyframes uiMgBob{50%{transform:translateX(-50%) translateY(-4px);}}@media (prefers-reduced-motion: reduce){.ui-mg-more{animation:none;}}';
  function addCss(){ if(document.getElementById('ui-mg-css')) return; const st = document.createElement('style'); st.id = 'ui-mg-css'; st.textContent = css; (document.head || document.documentElement).appendChild(st); }
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // 🃏 mc-1 card layout: columns that fit (max 3), wide cards span 2 / all, the last card of a row fills it
  function linesOf(el){ if(!el || el.offsetParent === null) return 0; const lh = parseFloat(getComputedStyle(el).lineHeight) || 14; return Math.round(el.getBoundingClientRect().height / lh); }
  function tooTight(b){ const n = b.querySelector('.mn'), y = b.querySelector('.my'), m = b.querySelector('.ms');
    return linesOf(n) > (b.closest('.mc-fit2') ? 2 : 1) || linesOf(y) > 1 || linesOf(m) > 3 || b.scrollWidth > b.clientWidth + 1; }   // name-only cards may wrap the name at a space
  function layoutGrid(g){
    const bs = [...g.querySelectorAll('.ui-mbtn')]; if(!bs.length) return;
    const W = g.clientWidth, gap = parseFloat(getComputedStyle(g).columnGap) || 7, tight = g.closest('.mc-fit2');   // tight = name only → smaller cards, up to 4 a row
    const mcw = tight ? 104 : parseFloat(getComputedStyle(g.closest('.ui-mgroups')).getPropertyValue('--mgw')) || 150;
    let cols = Math.max(1, Math.min(tight ? 4 : 3, bs.length, Math.floor((W + gap) / (mcw + gap))));
    g.style.setProperty('--cols', cols); bs.forEach(b => b.style.setProperty('--span', 1));
    // how many columns each card needs (1 … cols)
    const need = bs.map(b => { for(let sp = 1; sp < cols; sp++){ b.style.setProperty('--span', sp); if(!tooTight(b)) return sp; } return cols; });
    // place in order; a card that doesn't fit the rest of its row starts a new row and the row before stretches its last card
    let at = 0, last = -1; const span = need.slice();
    need.forEach((sp, i) => { if(at + sp > cols){ if(last >= 0) span[last] += cols - at; at = 0; } at += sp; last = i; if(at === cols){ at = 0; last = -1; } });
    if(last >= 0 && at > 0) span[last] += cols - at;
    bs.forEach((b, i) => b.style.setProperty('--span', span[i]));
  }
  function cardLayout(box){
    if(!box || !box.isConnected || box.offsetParent === null) return;
    box.classList.remove('mc-fit1', 'mc-fit2');
    const run = () => box.querySelectorAll('.ui-mg-b').forEach(layoutGrid);
    run();
    // the boxes must stay on the first screen (Rules "Mode groups") — drop the rule line, then the type line, only if needed
    const low = () => box.getBoundingClientRect().bottom + scrollY > innerHeight + 1;
    if(low() && !window.MC_NOFIT){ box.classList.add('mc-fit1'); run(); if(low()){ box.classList.add('mc-fit2'); run(); } }
    box._mcKey = mcKey(box);
  }
  // re-check when something above the boxes changes height (✨ Also-try banner, player name, fonts) — cheap: only when the key moved
  function mcKey(box){ const r = box.getBoundingClientRect(); return Math.round(r.top + scrollY) + '|' + innerWidth + '|' + innerHeight + '|' + Math.round(r.width); }
  const watched = new WeakSet(); let ro = null;
  function watch(box){
    if(watched.has(box)) return; watched.add(box);
    if(!ro && window.ResizeObserver){ const last = new WeakMap(); ro = new ResizeObserver(es => es.forEach(e => { const w = Math.round(e.contentRect.width); if(last.get(e.target) === w) return; last.set(e.target, w); requestAnimationFrame(() => cardLayout(e.target)); })); }
    if(ro) ro.observe(box);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(() => cardLayout(box));
    addEventListener('resize', () => requestAnimationFrame(() => cardLayout(box)));
    const iv = setInterval(() => { if(!box.isConnected){ clearInterval(iv); return; } if(box.offsetParent !== null && box._mcKey !== mcKey(box)) cardLayout(box); }, 400);
  }
  function modeGroups(box, groups, modes, opt){
    if(!box) return; opt = opt || {}; addCss();
    const used = groups.filter(g => modes.some(m => m.g === g.k));
    box.classList.add('ui-mgroups');
    box.style.gridTemplateColumns = '';   // 🗂️ mg-1 boxes wrap by width (see --gn / --mgw in the CSS)
    box.innerHTML = used.map(g => { const ms = modes.filter(m => m.g === g.k);
      return '<div class="ui-mgroup g-' + esc(g.k) + '" data-g="' + esc(g.k) + '" style="--mg:' + esc(g.c || '#7A5CFA') + ';--gn:' + Math.min(4, ms.length) + '"><div class="ui-mg-h">' + esc(g.icon) + ' ' + esc(g.en) + ' <span class="th" lang="th">' + esc(g.th) + '</span></div>'
        + '<div class="ui-mg-b" style="--n:' + ms.length + '">' + ms.map(m =>
          '<button class="mode ui-mbtn' + (m.on ? ' on' : '') + (m.soon ? ' soon' : '') + '"' + (m.id ? ' id="' + esc(m.id) + '"' : '') + ' data-k="' + esc(m.k) + '" data-g="' + esc(g.k) + '" data-sound="tap">'
          + '<span class="mi' + (UI.glyphs(m.icon) > 1 ? ' mi2' : '') + '">' + esc(m.icon) + '</span><span class="mt"><span class="mn">' + esc(m.name) + '</span>' + ((m.type || (window.MODE_TYPE || {})[m.k]) ? '<span class="my">' + esc(m.type || window.MODE_TYPE[m.k]) + '</span>' : '')   /* 🗂️ p3a: type line from window.MODE_TYPE */ + '' + (m.sub ? '<span class="ms">' + esc(m.sub) + '</span>' : '') + (m.next ? '<span class="mx">' + esc(m.next) + '</span>' : '') + '</span></button>').join('') + '</div></div>'; }).join('');
    cardLayout(box); watch(box);
    if(opt.next) modeMore(opt.next, opt.moreText);
    box.querySelectorAll('.ui-mbtn').forEach(b => b.onclick = () => {
      let r; try{ r = opt.onPick ? opt.onPick(b.dataset.k, b) : undefined; }catch(e){ console.error(e); }
      if(r === 'stop') return;   // not allowed (🔜 coming soon / 🔒): nothing changes
      if(r !== false && b.isConnected) box.querySelectorAll('.ui-mbtn').forEach(x => x.classList.toggle('on', x === b));   // false = the game re-drew the buttons itself
      const nx = typeof opt.next === 'function' ? opt.next(b.dataset.k) : opt.next;
      if(nx && nx.getBoundingClientRect){ const r2 = nx.getBoundingClientRect(); if(r2.top > innerHeight - 80 || r2.top < 0) try{ nx.scrollIntoView({behavior: 'smooth', block: 'start'}); }catch(e){} }
    });
  }
  // 👇 more-below pill for the start page: shows while `target` (the level list head) is under the fold of a visible #scr-menu
  let moreEl = null, moreFor = null, moreText = '';
  function moreTick(){
    if(!moreEl) return;
    const menu = document.getElementById('scr-menu'), t = moreFor && moreFor();
    const show = !!(t && menu && !menu.classList.contains('hidden') && menu.offsetParent !== null && t.offsetParent !== null && t.getBoundingClientRect().top > innerHeight - 40 && !document.querySelector('.ui-guide, .ui-modal.on, .sheet.on'));
    moreEl.classList.toggle('hidden', !show);
  }
  function modeMore(target, text){
    moreFor = typeof target === 'function' ? target : () => target; moreText = text || '👇 Pick a level below';
    if(!moreEl){ moreEl = document.createElement('button'); moreEl.className = 'ui-mg-more hidden'; moreEl.setAttribute('data-sound', 'tap'); document.body.appendChild(moreEl);
      moreEl.onclick = () => { const t = moreFor && moreFor(); if(t) try{ t.scrollIntoView({behavior: 'smooth', block: 'start'}); }catch(e){} };
      addEventListener('scroll', moreTick, {passive: true}); addEventListener('resize', moreTick); setInterval(moreTick, 700); }
    moreEl.textContent = moreText; addCss(); moreTick();
  }
  Object.assign(window.UI, {modeGroups, modeMore, modeCards: cardLayout});
})();

/* ================= ✨ MODE SPOTLIGHT (modes-3): open a game straight in one mode + "✨ Also try" banner on its start page =================
   Page:  const MODE_LINK = the template value `mode` (from ?mode=<id>, see Code.gs MODES_)
   UI.modeLink(MODE_LINK)  → the id ONCE (later player switches don't jump again)
   UI.modeTried(player, game, id)  → when a mode starts: remembered on this device + Settings ModesTried_<Name> (one server call the first time)
   UI.alsoTry({game, player, current, at, open(id)})  → banner after `at` for one mode this player hasn't played (✕ = hide it for today) */
(function(){
  if(!window.UI) return;
  const css = '.ui-also{display:flex;align-items:center;gap:10px;width:100%;max-width:640px;box-sizing:border-box;margin:8px auto 10px;padding:8px 10px 8px 12px;border-radius:16px;'
    + 'background:var(--k-panel,#FBE9DA);color:var(--k-ink,#2B2B2B);border:2px dashed color-mix(in srgb, var(--k-a1,#C97B5D) 55%, transparent);font-family:var(--k-body,inherit);text-align:left;animation:uiAlsoIn .4s ease-out;}'
    + '.ui-also .ua-ic{font-size:1.6rem;line-height:1;flex:none;}'
    + '.ui-also .ua-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;}'
    + '.ui-also .ua-tx b{font-size:0.95rem;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'
    + '.ui-also .ua-tx small{font-size:0.76rem;font-weight:700;opacity:.8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'
    + '.ui-also .ua-go{flex:none;border:none;border-radius:12px;padding:8px 12px;font:inherit;font-weight:800;font-size:0.85rem;cursor:pointer;background:linear-gradient(135deg,var(--k-a1,#C97B5D),var(--k-a2,#D9A94D));color:var(--k-on,#fff);min-height:38px;}'
    + '.ui-also .ua-x{flex:none;border:none;background:none;color:inherit;opacity:.6;font-size:1rem;cursor:pointer;width:32px;height:32px;border-radius:50%;padding:0;}'
    + '@keyframes uiAlsoIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;}}'
    + '@media (max-width:420px){.ui-also{gap:7px;padding:7px 6px 7px 9px;}.ui-also .ua-ic{font-size:1.35rem;}.ui-also .ua-go{padding:7px 9px;font-size:0.8rem;}}'
    + '.ui-mode-want{outline:3px solid #FF4D8D !important;outline-offset:3px;animation:uiWant .9s ease-in-out 5;}'
    + '@keyframes uiWant{50%{outline-color:#FFC23D;outline-offset:6px;}}'
    + '.ui-drop{display:flex;align-items:center;gap:10px;margin:10px auto 0;max-width:520px;width:100%;box-sizing:border-box;padding:8px 10px 8px 12px;border-radius:16px;background:linear-gradient(135deg,#FFF6E0,#FFE7C2);color:#5A3A12;border:2px solid #F5C26B;box-shadow:0 4px 14px rgba(0,0,0,0.12);animation:uiAlsoIn .5s cubic-bezier(.2,1.5,.4,1) both;font-family:inherit;}'
    + '.ui-drop .ud-ic{font-size:1.7rem;line-height:1;animation:uiAlsoBob 1.8s ease-in-out infinite;}'
    + '.ui-drop .ua-tx{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;line-height:1.2;text-align:left;}.ui-drop .ua-tx b{font-size:.95rem;}.ui-drop .ua-tx small{display:block;opacity:.8;font-size:.78rem;}'
    + '.ui-drop .ua-go{flex:0 0 auto;border:0;border-radius:12px;padding:9px 12px;font:inherit;font-weight:800;background:#F28C28;color:#fff;cursor:pointer;box-shadow:0 3px 0 rgba(0,0,0,.15);}'
    + '@media (prefers-reduced-motion: reduce){.ui-also,.ui-mode-want,.ui-drop,.ui-drop .ud-ic{animation:none;}}';
  function addCss(){ if(document.getElementById('ui-also-css')) return; const st = document.createElement('style'); st.id = 'ui-also-css'; st.textContent = css; (document.head || document.documentElement).appendChild(st); }
  const used = {};
  function modeLink(v){ v = String(v || '').trim(); if(!v || used[v]) return ''; used[v] = true; return /^[a-z]{2,16}$/.test(v) ? v : ''; }
  const key = p => 'sp_modes_tried:' + p;
  function localTried(p){ try{ const a = JSON.parse(localStorage.getItem(key(p)) || '[]'); return Array.isArray(a) ? a : []; }catch(e){ return []; } }
  function modeTried(player, game, id){
    if(!player || !game || !id) return;
    const k = game + ':' + id, list = localTried(player);
    if(list.indexOf(k) >= 0) return;
    list.push(k); try{ localStorage.setItem(key(player), JSON.stringify(list.slice(-200))); }catch(e){}
    try{ google.script.run.withFailureHandler(() => {}).markModeTried(player, game, id); }catch(e){}
  }
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  let seq = 0;
  function alsoTry(o){
    o = o || {}; const my = ++seq;
    document.querySelectorAll('.ui-also[data-game="' + o.game + '"]').forEach(el => el.remove());
    if(!o.player || !o.game || !o.at || !window.google || !google.script) return;
    craftDrop(o);   // 🏭 af-4: a small material for Artifactory on the result card
    const hideKey = 'sp_also_hide:' + o.player + ':' + o.game;
    try{ if(localStorage.getItem(hideKey) === today()) return; }catch(e){}
    google.script.run.withSuccessHandler(list => {
      if(my !== seq || !Array.isArray(list)) return;
      const mine = localTried(o.player), cur = typeof o.current === 'function' ? o.current() : o.current;
      const pool = list.filter(m => !m.tried && mine.indexOf(m.key) < 0 && m.id !== cur && (!o.skip || !o.skip(m.id)));
      if(!pool.length) return;
      const d = new Date(), m = pool[(d.getDate() + d.getMonth() * 31) % pool.length];
      addCss();
      const el = document.createElement('div');
      el.className = 'ui-also'; el.dataset.game = o.game; el.dataset.mode = m.id; el.setAttribute('role', 'note');
      el.innerHTML = '<span class="ua-ic">' + esc(m.icon) + '</span><span class="ua-tx"><b>✨ Also try: ' + esc(m.name) + '</b><small>' + esc(m.pitch) + '</small></span>'
        + '<button class="ua-go" data-sound="tap">Try ▶</button><button class="ua-x" aria-label="Not today" title="Not today">✕</button>';
      el.querySelector('.ua-go').onclick = () => { el.remove(); try{ o.open(m.id); }catch(e){} };
      el.querySelector('.ua-x').onclick = () => { el.remove(); try{ localStorage.setItem(hideKey, today()); }catch(e){} };
      const at = typeof o.at === 'function' ? o.at() : o.at; if(!at || !at.parentNode) return;
      at.parentNode.insertBefore(el, at.nextSibling);
    }).withFailureHandler(() => {}).getModesFor(o.player, o.game);
  }
  // 🏭 Artifactory (af-4): every result card that shows ✨ Also try also gets 1 material for the maker app (the server caps it at 30 a day)
  let dropSeq = 0;
  function craftDrop(o){
    if(o.game === 'artifactory' || o.noDrop) return; const my = ++dropSeq;
    try{ google.script.run.withSuccessHandler(r => {
      if(my !== dropSeq || !r || !r.got || !Object.keys(r.got).length) return;
      addCss(); document.querySelectorAll('.ui-drop[data-game="' + o.game + '"]').forEach(el => el.remove());
      const el = document.createElement('div'); el.className = 'ui-drop'; el.dataset.game = o.game; el.setAttribute('role', 'note');
      el.innerHTML = '<span class="ud-ic">' + esc(r.icon || '🎁') + '</span><span class="ua-tx"><b>🏭 +1 ' + esc(r.mat || '') + ' for Artifactory</b><small>' + (r.left > 0 ? r.left + ' more drops today' : 'That was the last drop today') + '</small></span><button class="ua-go" data-sound="tap">🛠️ Craft</button>';
      el.querySelector('.ua-go').onclick = () => craftLink('', o.player);
      const at = typeof o.at === 'function' ? o.at() : o.at; if(!at || !at.parentNode) return;
      at.parentNode.insertBefore(el, at.nextSibling); if(window.UISound) try{ UISound.play('pop'); }catch(e){}
    }).withFailureHandler(() => {}).artGameDrop(o.player, o.game); }catch(e){}
  }
  function craftLink(mode, player){ const base = typeof WEBAPP_URL !== 'undefined' ? WEBAPP_URL : '', who = player || (typeof CURRENT_PLAYER !== 'undefined' ? CURRENT_PLAYER : '');
    const u = base + '?page=artifactory' + (mode ? '&mode=' + mode : '') + (who ? '&player=' + encodeURIComponent(who) : ''); if(window.UI && UI.go) UI.go(u, 'craft', 'Opening Artifactory'); else location.href = u; }
  // point at the button a deep link wants the kid to tap next (Turbo 👻 Ghost race, Memory friends…)
  function modePoint(el){ if(!el) return; addCss(); el.classList.add('ui-mode-want'); try{ el.scrollIntoView({block: 'center', behavior: 'smooth'}); }catch(e){} setTimeout(() => el.classList.remove('ui-mode-want'), 6000); }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c])); }
  Object.assign(window.UI, {modeLink, modeTried, alsoTry, modePoint, craftDrop, craftLink});
})();

/* ================= 🕹️ r33 THUMB STICKS THAT FEEL INSTANT (every on-screen joystick uses these) =================
   Why sticks felt "laggy" (≈50–80 ms to start, 160–250 ms to turn round): the direction was measured from the fixed centre
   of the pad, with a big dead zone — the thumb had to slide 17–22 px before anything happened, and to turn round it had
   to slide all the way back across the pad.
   • UI.stickTracker(el, {leash, float}) → {start(e), at(e)} returns v = {x, y, m, fx, fy, R}
       - a thumb that lands near the middle (inside `float` × radius) starts from where it landed (no accidental move);
         a thumb that lands on an edge moves that way at once;
       - the origin follows the thumb on a short leash (`leash` × radius), so turning round = a tiny slide back.
       - x, y, m are in leash units (1 = full tilt); fx, fy = the finger from the pad centre in radii (for the knob).
   • UI.stickAxes(v, prev, on, off) → {l, r, u, d} with hysteresis (turns on at `on`, off below `off`).
   • UI.stickDir(v, cur, on, off) → 'l' | 'r' | 'u' | 'd' | null (4-way, holds its axis unless the other one clearly wins).
   • UI.onFastMove(el, fn) = pointermove + pointerrawupdate (Chrome / Android deliver it before the next frame).
   • r36: v.ax, v.ay = thumb from where it landed (use for analog AIM — a leash vector flips when the thumb relaxes);
     UI.stickFeel([key]) / stickFeelInfo() / stickFeelNext() = per-device 🐢 Calm · 🙂 Normal (default) · ⚡ Quick (localStorage sp_stick_feel). */
(function(){
  const RAW = 'onpointerrawupdate' in window;
  /* r36 🕹️ "turns by itself": the r33 leash was 13 % of the pad (≈8 px on a phone) — a resting thumb that drifted ~9 px
     sideways or relaxed back a little already counted as a new direction. Now the leash is longer, the held axis wins
     until the other one is clearly bigger, and each device picks a stick feel (🐢 Calm · 🙂 Normal · ⚡ Quick). */
  const FEELS = {
    calm:   {icon: '🐢', name: 'Calm',   leash: 0.32, keep: 1.8,  float: 0.45},
    normal: {icon: '🙂', name: 'Normal', leash: 0.24, keep: 1.6,  float: 0.42},
    quick:  {icon: '⚡', name: 'Quick',  leash: 0.16, keep: 1.35, float: 0.38}
  };
  const FEEL_KEY = 'sp_stick_feel', FEEL_ORDER = ['calm', 'normal', 'quick'];
  function stickFeel(set){
    if(set && FEELS[set]){ try{ localStorage.setItem(FEEL_KEY, set); }catch(e){} return set; }
    let k = null; try{ k = localStorage.getItem(FEEL_KEY); }catch(e){} return FEELS[k] ? k : 'normal';
  }
  function stickFeelInfo(k){ k = FEELS[k] ? k : stickFeel(); return Object.assign({key: k}, FEELS[k]); }
  function stickFeelNext(){ return stickFeel(FEEL_ORDER[(FEEL_ORDER.indexOf(stickFeel()) + 1) % FEEL_ORDER.length]); }
  function stickTracker(el, opt){
    opt = opt || {}; let L = 0.24, FLOAT = 0.42, ox = 0, oy = 0, hx = 0, hy = 0;
    const fin = e => { const r = el.getBoundingClientRect(), R = (r.width / 2) || 1; return [(e.clientX - (r.left + r.width / 2)) / R, (e.clientY - (r.top + r.height / 2)) / R, R]; };
    const vec = (fx, fy, R) => { let dx = fx - ox, dy = fy - oy, d = Math.hypot(dx, dy);
      if(d > L){ ox = fx - dx / d * L; oy = fy - dy / d * L; dx = fx - ox; dy = fy - oy; d = L; }
      return {x: dx / L, y: dy / L, m: d / L, fx, fy, ax: fx - hx, ay: fy - hy, R}; };   // ax, ay = the thumb from where it landed (analog aim that never flips on a relaxed thumb)
    return {
      start(e){ const f = FEELS[stickFeel()]; L = opt.leash || f.leash; FLOAT = opt.float == null ? f.float : opt.float;
        const [fx, fy, R] = fin(e); if(Math.hypot(fx, fy) < FLOAT){ ox = hx = fx; oy = hy = fy; } else { ox = oy = hx = hy = 0; } return vec(fx, fy, R); },
      at(e){ const [fx, fy, R] = fin(e); return vec(fx, fy, R); }
    };
  }
  function stickAxes(v, prev, on, off){
    on = on || 0.5; off = off || 0.3; prev = prev || {};
    const k = (held, opp, val) => held || opp ? val > off : val > on;   // already held, or turning round from the opposite side → the easy threshold
    return {l: k(prev.l, prev.r, -v.x), r: k(prev.r, prev.l, v.x), u: k(prev.u, prev.d, -v.y), d: k(prev.d, prev.u, v.y)};
  }
  function stickDir(v, cur, on, off){
    on = on || 0.5; off = off || 0.3;
    if(v.m < (cur ? off : on)) return null;
    const ax = Math.abs(v.x), ay = Math.abs(v.y), horiz = c => c === 'l' || c === 'r', K = FEELS[stickFeel()].keep;
    let d = ax >= ay ? (v.x > 0 ? 'r' : 'l') : (v.y > 0 ? 'd' : 'u');
    if(cur && horiz(cur) !== horiz(d) && (horiz(cur) ? ay < ax * K : ax < ay * K)) d = horiz(cur) ? (v.x > 0 ? 'r' : 'l') : (v.y > 0 ? 'd' : 'u');   // a diagonal wobble keeps the axis (r36: until the other axis is K× bigger)
    return d;
  }
  function onFastMove(el, fn){
    const last = {};
    const h = e => { const p = last[e.pointerId]; if(p && p[0] === e.clientX && p[1] === e.clientY) return; last[e.pointerId] = [e.clientX, e.clientY]; fn(e); };
    el.addEventListener('pointermove', h); if(RAW) el.addEventListener('pointerrawupdate', h);
    return h;
  }
  if(window.UI) Object.assign(window.UI, {stickTracker, stickAxes, stickDir, onFastMove, stickFeel, stickFeelInfo, stickFeelNext, STICK_FEELS: FEELS});
})();

/* ================= 🗣️ VOICE: prefer a woman's voice (on this computer first), then a man's ================= */
// Every page speaks with speechSynthesis.speak(new SpeechSynthesisUtterance(text)); this picks the voice for any utterance
// that doesn't set one: English woman's voice installed on the computer → woman's online voice → other voices → man's voice.
const SPVoice = (() => {
  const FEMALE = /\b(female|woman|girl)\b|zira|aria|jenny|hazel|susan|catherine|libby|sonia|natasha|clara|emily|michelle|ana\b|samantha|victoria|karen|moira|tessa|fiona|serena|allison|ava\b|joanna|salli|kendra|kimberly|ivy|emma|amy|nicky|kate|veena|google us english|google uk english female|heera|eva\b|linda|heather|zoe|nora|siri female/i;
  const MALE = /\b(male|man|boy)\b|david|mark\b|daniel|alex\b|fred|george|ryan|guy\b|james|tom\b|thomas|matthew|brian|joey|justin|aaron|arthur|oliver|rishi|gordon|lee\b|google uk english male|siri male/i;
  function score(v, lang){
    const n = (v.name || '') + ' ' + (v.voiceURI || ''), en = /^en/i.test(v.lang || ''), same = lang && (v.lang || '').toLowerCase().indexOf(lang.toLowerCase()) === 0;
    const female = FEMALE.test(n) && !/google uk english male/i.test(n), male = !female && MALE.test(n);
    let s = female ? 300 : male ? 0 : 150;
    if(v.localService) s += 60;
    if(same) s += 40; else if(en) s += 25; else s -= 200;
    if(v.default) s += 5;
    return s;
  }
  function pick(voices, lang){ let best = null, bs = -1e9; (voices || []).forEach(v => { const s = score(v, lang); if(s > bs){ bs = s; best = v; } }); return best; }
  let chosen = null;
  // 📱 vf-1 (2026-11-11, "phones click but phonics stays silent"): 4 phone traps fixed here for EVERY page that speaks
  //  1 Android Chrome drops a speak() that comes right after cancel() → skip cancel when nothing is talking, else wait 150 ms
  //  2 iPhone/iPad only allow speech after it first starts inside a tap → a silent "unlock" utterance on the first tap
  //  3 a picked voice the phone hasn't downloaded = silence → on error / no start, retry with the phone's own default voice
  //     and remember it on this device (localStorage sp_voice_bad)
  //  4 the engine can stay "paused" after the app was in the background → resume() before every speak
  let BAD = ''; try { BAD = localStorage.getItem('sp_voice_bad') || ''; } catch(e){}
  function markBad(v){ if(!v) return; BAD = v.voiceURI || v.name || 'x'; try { localStorage.setItem('sp_voice_bad', BAD); } catch(e){} if(chosen && (chosen.voiceURI || chosen.name) === BAD) chosen = null; }
  function refresh(){ try { const vs = window.speechSynthesis ? speechSynthesis.getVoices() : []; if(vs && vs.length){ const ok = vs.filter(v => (v.voiceURI || v.name) !== BAD); chosen = ok.length ? pick(ok, (document.documentElement.lang || navigator.language || 'en').slice(0, 2)) : null; } } catch(e){} }
  const st = {gen: 0, lastCancel: 0, unlocked: false, warned: false, log: []};
  function note(t){ st.log.push(t); if(st.log.length > 60) st.log.splice(0, 20); }
  function warnNoVoice(){
    if(st.warned) return; st.warned = true;
    try { if(window.UI && UI.toast) UI.toast('🔇 This device has no reading voice yet — turn on Text-to-speech in its settings (Settings → Accessibility → Text-to-speech) and download English'); } catch(e){}
  }
  try {
    const ss = window.speechSynthesis;
    if(ss && !ss.__spVoice){
      ss.__spVoice = true; refresh();
      if(ss.addEventListener) ss.addEventListener('voiceschanged', refresh); else ss.onvoiceschanged = refresh;
      const speak = ss.speak.bind(ss), cancel = ss.cancel.bind(ss);
      ss.cancel = () => {
        st.gen++;                                                   // drops any speak still waiting for its gap
        let busy = true; try { busy = ss.speaking || ss.pending; } catch(e){}
        if(!busy){ note('cancel-skip'); return; }                 // trap 1: nothing to stop → don't poke the engine
        st.lastCancel = Date.now(); note('cancel');
        try { return cancel(); } catch(e){}
      };
      function realSpeak(u, retry){
        try { if(ss.paused) ss.resume(); } catch(e){}             // trap 4
        let started = false; const usedVoice = u.voice;
        u.addEventListener('start', () => { started = true; });
        u.addEventListener('error', ev => {
          const err = ev && ev.error; note('error:' + err);
          if(err === 'interrupted' || err === 'canceled') return;
          if(usedVoice && !retry){                               // trap 3: try again with the phone's own voice
            markBad(usedVoice);
            try { const u2 = new SpeechSynthesisUtterance(u.text); u2.rate = u.rate; u2.pitch = u.pitch; u2.volume = u.volume; u2.lang = u.lang || 'en-US'; realSpeak(u2, true); } catch(e){}
          } else if(/unavailable|not-allowed|audio-hardware|synthesis-failed/.test(err || '')) warnNoVoice();
        });
        if(usedVoice && !retry) setTimeout(() => {                 // picked voice never started = probably not downloaded
          let idle = false; try { idle = !ss.speaking && !ss.pending; } catch(e){}
          if(!started && idle){ note('nostart'); markBad(usedVoice); }
        }, 4000);
        note('speak:' + (u.text || '').slice(0, 20));
        return speak(u);
      }
      ss.speak = u => {
        try { if(u && !u.voice && u.volume !== 0){ if(!chosen) refresh(); if(chosen){ u.voice = chosen; u.lang = chosen.lang; } } } catch(e){}
        if(!u) return;
        const gap = 150 - (Date.now() - st.lastCancel);
        if(gap > 0){ const my = st.gen; setTimeout(() => { if(my === st.gen) realSpeak(u); }, gap); return; }   // trap 1
        return realSpeak(u);
      };
      // trap 2: unlock speech inside the first tap (silent, phone default voice) — not in test browsers
      const unlock = () => {
        if(st.unlocked) return; st.unlocked = true;
        try { if(navigator.webdriver) return; const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.rate = 2; speak(u); note('unlock'); } catch(e){}
        ['touchend', 'click', 'keydown'].forEach(t => document.removeEventListener(t, unlock, true));
      };
      ['touchend', 'click', 'keydown'].forEach(t => document.addEventListener(t, unlock, true));
      // a phone with no voices at all after a few seconds → tell the grown-up once (only when a page really tried to speak)
      setTimeout(() => { try { if(!ss.getVoices().length && st.log.some(x => /^speak:/.test(x))) warnNoVoice(); } catch(e){} }, 6000);
    }
  } catch(e){}
  return {pick, score, current: () => chosen, refresh, log: st.log, state: st, forget(){ BAD = ''; try { localStorage.removeItem('sp_voice_bad'); } catch(e){} refresh(); }};
})();

/* ================= TAP SOUNDS EVERYWHERE ================= */
// Any button-like element plays a short tap on press. An element can pick
// its own sound with data-sound="pop" (or "none" to stay silent).
(function(){
  const TAPPABLE = 'button, .card, .chip, .player-tile, .add-player-tile, .age-chip, .theme-opt, .sound-opt, .rank-row, .archive-link, [data-sound]';
  document.addEventListener('pointerdown', e => {
    UISound.wake();
    const el = e.target && e.target.closest ? e.target.closest(TAPPABLE) : null;
    if(!el || el.disabled || el.classList.contains('ui-busy')) return;
    if(el.closest('.lock-pin-pad, .pin-pad')) { UISound.play('key'); return; }
    const s = el.getAttribute('data-sound');
    if(s === 'none') return;
    UISound.play(s || 'tap');
  }, true);
  // iOS only unlocks audio on a completed touch, so also wake on touchend.
  document.addEventListener('touchend', () => UISound.wake(), {passive: true, capture: true});
})();

/* ================= 💬 TELL US — feedback from any page ================= */
// A small 💬 button sits in the bottom-left corner of every page that loads UiKit, but hides while a game is
// being played (#scr-play / #scr-game visible), inside the Family Room scene, and on the Admin page.
// Pages can describe where the player is with window.feedbackContext = () => ({page, game, level}).
(function(){
  const KINDS = [['bug', '🐞', "Something's broken"], ['idea', '💡', 'Idea'], ['wish', '🎮', 'New game wish'], ['love', '😊', "It's great"], ['notok', '😕', 'Not OK']];
  const MOODS = ['😢', '😕', '😐', '😊', '😍'];
  const HIDE_WHEN = '#scr-play:not(.hidden), #scr-game:not(.hidden), #room:not(.hidden), .ui-fb, .ui-modal.on, .ui-lock, .lock-overlay.showing, #pinbox:not(.hidden)';
  // Page globals (top-level let/const in the page's own script) are read with typeof, so a page without them is fine.
  /* global selectedPlayer, S, CURRENT_PLAYER, M, G */
  const pageVar = {
    selectedPlayer: () => typeof selectedPlayer !== 'undefined' ? selectedPlayer : undefined,
    S: () => typeof S !== 'undefined' ? S : undefined,
    CURRENT_PLAYER: () => typeof CURRENT_PLAYER !== 'undefined' ? CURRENT_PLAYER : undefined,
    M: () => typeof M !== 'undefined' ? M : undefined,
    G: () => typeof G !== 'undefined' ? G : undefined};
  const gv = n => { try{ return pageVar[n](); }catch(e){ return undefined; } };
  function who(){
    const sp = gv('selectedPlayer'); if(sp) return sp;
    const st = gv('S'); if(st && (st.me || st.player)) return st.me || st.player;
    return gv('CURRENT_PLAYER') || '';
  }
  function where(){
    let c = {};
    try{ if(typeof window.feedbackContext === 'function') c = window.feedbackContext() || {}; }catch(e){}
    const PAGES = {home: 'Dashboard', gameroom: 'Gameroom', minigames: 'Mini Games', stacking: 'Stack It!', setup: 'Admin', achievements: 'Achievements', maze: 'Maze Explorer',
      robot: 'Code the Robot', checkers: 'Checkers', chess: 'Chess', pinball: 'Pinball', hopper: 'Dodgy Hopper', turbo: 'Turbo Trail', memory: 'Memories Match', mathquest: 'Math Quest', doubleup: 'Double Up', blockdrop: 'Block Drop', popblocks: 'Pop Blocks', numbergrid: 'Digitinct', numberboard: 'Algebros', wordboard: 'Lettercraft', sweetswap: 'Sweet Swap', beatcorner: 'BeatCorner', slabrall: 'SlaBrall', poseparty: 'Pose Party',
      workshop: 'Furniture Workshop', room: 'Family Room', collection: 'Collection'};
    const key = window.SP_PAGE || 'home', page = c.page || PAGES[key] || key;
    if(c.game == null && !gv('M') && key !== 'home' && key !== 'gameroom' && key !== 'achievements' && key !== 'collection' && key !== 'setup') c.game = key;
    let game = c.game, level = c.level;
    if(game == null){ const mm = gv('M'); if(mm && mm.id) { game = mm.id; if(level == null && mm.st) level = mm.st.name; } }
    if(level == null){ const gg = gv('G'); if(gg && gg.L && gg.L.name) level = gg.L.name; else if(gg && gg.lvl != null) level = 'Level ' + (Number(gg.lvl) + 1); }
    return {page, game: game || '', level: level == null ? '' : String(level)};
  }
  function device(){ const ua = navigator.userAgent, b = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
    const os = /iPad|Macintosh.*Mobile|iPad/.test(ua) ? 'iPad' : /iPhone/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'Mac' : 'Other';
    return innerWidth + '×' + innerHeight + ' · ' + os + ' · ' + b + (matchMedia('(pointer:coarse)').matches ? ' · touch' : ''); }

  let btn = null;
  function ensureBtn(){
    if(btn || !document.body || window.NO_FEEDBACK_BUTTON) return;
    btn = document.createElement('button'); btn.className = 'ui-fb-btn hidden'; btn.id = 'ui-fb-btn'; btn.setAttribute('data-sound', 'pop');
    btn.title = 'Tell us: something broken, an idea, a new game wish'; btn.setAttribute('aria-label', 'Tell us');
    btn.innerHTML = '<span class="b">💬</span>Tell us!'; btn.onclick = () => open();
    document.body.appendChild(btn);
  }
  function refresh(){ ensureBtn(); if(!btn) return; btn.classList.toggle('hidden', !!window.NO_FEEDBACK_BUTTON || !!document.querySelector(HIDE_WHEN) || !!document.querySelector('.ui-loader.on')); }
  setInterval(refresh, 700);
  document.addEventListener('DOMContentLoaded', refresh);

  function open(pre){
    pre = pre || {};
    const ctx = where(), player = who();
    let kind = pre.kind || '', mood = -1, rec = null;
    const m = document.createElement('div'); m.className = 'ui-fb'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = '<div class="ui-fb-card">' +
      '<h3>💬 Tell us!</h3><div class="who">' + (player ? 'From ' + UI.esc(player) : 'From a grown-up') + ' · ' + UI.esc(ctx.page) + '</div>' +
      '<div class="ui-fb-q">What is it about?</div><div class="ui-fb-kinds">' + KINDS.map(k => '<button data-k="' + k[0] + '" data-sound="pop"><span class="e">' + k[1] + '</span>' + k[2] + '</button>').join('') + '</div>' +
      '<div class="ui-fb-q">How do you feel?</div><div class="ui-fb-moods">' + MOODS.map((e, i) => '<button data-m="' + i + '" data-sound="pop" aria-label="mood ' + (i + 1) + '">' + e + '</button>').join('') + '</div>' +
      '<div class="ui-fb-q">Tell us more <small style="font-weight:700;opacity:.7">(type, or tap 🎤 and talk)</small></div>' +
      '<div class="ui-fb-txt"><textarea maxlength="1000" placeholder="What happened? What would you like?"></textarea>' + (window.SpeechRecognition || window.webkitSpeechRecognition ? '<button class="ui-fb-mic" data-sound="pop" title="Talk instead of typing">🎤</button>' : '') + '</div>' +
      '<div class="ui-fb-auto">📎 We also send: ' + UI.esc([ctx.page, ctx.game, ctx.level].filter(Boolean).join(' · ')) + ' · ' + UI.esc(device()) + '</div>' +
      '<div class="ui-fb-btns"><button class="no" data-sound="pop">Cancel</button><button class="yes">📨 Send</button></div>' +
      '<div class="ui-fb-mine hidden"></div></div>';
    document.body.appendChild(m); refresh();
    const $q = sel => m.querySelector(sel), ta = $q('textarea');
    const pickKind = k => { kind = k; m.querySelectorAll('.ui-fb-kinds button').forEach(b => b.classList.toggle('on', b.dataset.k === k)); };
    if(kind) pickKind(kind);
    m.querySelectorAll('.ui-fb-kinds button').forEach(b => b.onclick = () => pickKind(b.dataset.k));
    m.querySelectorAll('.ui-fb-moods button').forEach(b => b.onclick = () => { mood = mood === Number(b.dataset.m) ? -1 : Number(b.dataset.m); m.querySelectorAll('.ui-fb-moods button').forEach(x => x.classList.toggle('on', Number(x.dataset.m) === mood)); });
    const close = () => { try{ rec && rec.stop(); }catch(e){} document.removeEventListener('keydown', onKey); m.remove(); refresh(); };
    function onKey(e){ if(e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    m.addEventListener('click', e => { if(e.target === m) close(); });
    $q('.no').onclick = close;
    // 🎤 voice to text (Chrome / Edge / Safari). Words are added to the box as they are heard.
    const mic = $q('.ui-fb-mic');
    if(mic) mic.onclick = () => {
      if(rec){ rec.stop(); return; }
      const R = window.SpeechRecognition || window.webkitSpeechRecognition; rec = new R();
      rec.lang = navigator.language || 'en-US'; rec.interimResults = false; rec.continuous = false;
      const base = ta.value;
      rec.onresult = e => { const t = Array.from(e.results).map(r => r[0].transcript).join(' '); ta.value = (base ? base + ' ' : '') + t; };
      rec.onerror = e => { UI.toast(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? '🎤 The microphone isn\'t allowed here — please type instead' : '🎤 Didn\'t catch that — try again or type', 'err'); };
      rec.onend = () => { rec = null; mic.classList.remove('rec'); mic.textContent = '🎤'; };
      try{ rec.start(); mic.classList.add('rec'); mic.textContent = '⏹️'; }catch(e){ rec = null; }
    };
    $q('.yes').onclick = () => {
      if(!kind){ UI.toast('👆 Tap what it is about first', 'err'); m.querySelector('.ui-fb-kinds').animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}], {duration: 300}); return; }
      const fb = {player, kind, mood, text: ta.value, page: ctx.page, game: ctx.game, level: ctx.level, device: device()};
      UI.call('sendFeedback', [fb], {btn: $q('.yes'), kind: 'feedback'}).then(() => { close(); UISound.play('success'); UI.toast(kind === 'love' ? '💖 Yay! Thank you for telling us!' : '📨 Thank you! We got your message' + (player ? ', ' + player : '') + '.'); }).catch(() => {});
    };
    // replies to this player's earlier messages
    if(player && window.google && google.script && google.script.run) google.script.run.withSuccessHandler(list => {
      if(!m.isConnected || !list || !list.length) return;
      const box = $q('.ui-fb-mine'), ST = {new: '📬 sent', seen: '👀 seen', fixed: '✅ fixed'};
      box.innerHTML = '<div class="ui-fb-q">📬 Your messages</div>' + list.slice(0, 4).map(r => '<div class="m"><span class="st">' + (ST[r.status] || r.status) + '</span>' + (KINDS.find(k => k[0] === r.kind) || ['', '💬'])[1] + ' ' + UI.esc((r.text || '').slice(0, 80) || '(no words)') + (r.reply ? '<span class="rp">↳ ' + UI.esc(r.reply) + '</span>' : '') + '</div>').join('');
      box.classList.remove('hidden');
    }).withFailureHandler(() => {}).getMyFeedback(player);
  }
  UI.feedback = open;
})();
/* ================= 🙋 WHO'S PLAYING? (plan 11u, 2026-11-06) =================
   Every game picker (#player-list) puts the most recent player at the TOP (picked last on this device — the same
   'sp_seen:<Name>' the Dashboard uses), and each player's full-body avatar does random moves (AvatarKit animatePicker).
   Works for every page with a #player-list / #player-grid and a global choosePlayer() — no page needs its own code. */
(function(){
  function seenAt(n){ try { return Number(localStorage.getItem('sp_seen:' + n) || 0); } catch(e){ return 0; } }
  function markSeen(n){ try { if(n) localStorage.setItem('sp_seen:' + n, String(Date.now())); } catch(e){} }
  UI.seenAt = seenAt; UI.markSeen = markSeen;
  function nameOf(b){ const el = b.querySelector('.nm, .pname'); return el ? el.textContent.trim() : ''; }
  function tidy(box){
    if(box.__tidy) return; box.__tidy = true;
    requestAnimationFrame(() => {
      box.__tidy = false;
      if(box.id === 'player-list'){   // the Dashboard (#player-grid) already sorts by server + device
        const tiles = Array.from(box.children).filter(b => b.matches('button, .pick') && nameOf(b));
        const order = tiles.map((b, i) => ({b, i, t: seenAt(nameOf(b))})).sort((a, c) => (c.t - a.t) || (a.i - c.i));
        if(order.some((o, k) => o.b !== tiles[k])){ const tail = tiles.length ? tiles[tiles.length - 1].nextSibling : null; order.forEach(o => box.insertBefore(o.b, tail)); }
      }
      if(typeof window.animatePicker === 'function') box.querySelectorAll('canvas').forEach(c => window.animatePicker(c));
    });
  }
  function watch(){
    ['player-list', 'player-grid'].forEach(id => { const box = document.getElementById(id); if(!box || box.__watched) return; box.__watched = true;
      new MutationObserver(() => tidy(box)).observe(box, {childList: true}); tidy(box); });
    if(typeof window.choosePlayer === 'function' && !window.choosePlayer.__seen){
      const orig = window.choosePlayer; window.choosePlayer = function(n){ markSeen(n); return orig.apply(this, arguments); }; window.choosePlayer.__seen = true;
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else setTimeout(watch, 0);
  window.addEventListener('load', watch);
})();
// 👆 ui-noselect (ns-1): a long press (touch / pen) never selects, drags or opens the hold-menu — text boxes and .ui-selectable still work
(function(){
  let touch = !!(window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches);
  const free = el => !!(el && el.closest && el.closest('input, textarea, select, [contenteditable="true"], .ui-selectable'));
  document.addEventListener('pointerdown', e => { touch = e.pointerType === 'touch' || e.pointerType === 'pen'; }, true);
  document.addEventListener('contextmenu', e => { if(touch && !free(e.target)) e.preventDefault(); }, true);
  document.addEventListener('selectstart', e => { if(touch && !free(e.target)) e.preventDefault(); }, true);
  document.addEventListener('dragstart', e => { const t = e.target; if(t && t.tagName && /^(IMG|CANVAS|SVG)$/i.test(t.tagName)) e.preventDefault(); }, true);
  if(window.UI) UI.noSelect = {free, isTouch: () => touch};
})();
// 🕹️ JoySkins (sk-1, Aowu 2026-11-10): ONE master list of joystick skins for every game with a stick (UiKit stickTracker) + matching shot buttons.
//   Owned: Collection lines joyskin / joyskin2 / joyskin3 (8 each → LIST 0–7 / 8–15 / 16–23; ways from play + 🎁 pickups via grantJoySkin(name, game)).
//   Worn: the avatar's Wardrobe slot  eq.joy = {id: 'joyskin' | 'joyskin2' | 'joyskin3', v}  (saved with the avatar → every device) · a 🏭 crafted one per device: localStorage sp_joy:<Name> = 'art:<id>'.
//   JoySkins.of(name) → skin or null (plain) · apply(stickEl, name) (UI.stickTracker does it by itself: opt.player or CURRENT_PLAYER)
//   · buttons(container, name) → sets --sk-a / --sk-b / --sk-glow on a box of shot buttons (games use them for rims) · drawPreview(g, v, w, h) · RARITY · LIST
(function(){
  const R = [{n: 'Common', c: '#9AA5B1'}, {n: 'Rare', c: '#2CA6DE'}, {n: 'Epic', c: '#9B5DE5'}, {n: 'Legend', c: '#FFB703'}];
  // a ring colours (2) · k knob colours (light → dark) · em emoji on the knob · pat ring pattern · r rarity
  const LIST = [
    {n: 'Bubblegum',   r: 0, a: ['#FF8FC7', '#FF4FA0'], k: ['#FFFFFF', '#FFC2E2', '#FF7AB8'], em: '',   pat: 'dots'},
    {n: 'Mint chip',   r: 0, a: ['#9FF2D4', '#2EC4A0'], k: ['#FFFFFF', '#C9FFF0', '#5ED8B5'], em: '',   pat: 'sprinkles'},
    {n: 'Ocean',       r: 0, a: ['#7FD3F2', '#1E7FCB'], k: ['#FFFFFF', '#BDE8FF', '#3A9BE0'], em: '',   pat: 'waves'},
    {n: 'Lemon',       r: 0, a: ['#FFE97A', '#F2C200'], k: ['#FFFFFF', '#FFF3B0', '#FFD23F'], em: '',   pat: 'rays'},
    {n: 'Grape',       r: 0, a: ['#C9A7FF', '#7B4FE0'], k: ['#FFFFFF', '#E3D2FF', '#9B6BFF'], em: '',   pat: 'bubbles'},
    {n: 'Donut',       r: 0, a: ['#FF9EC7', '#C97B4A'], k: ['#FFF3E0', '#F5C28B', '#C97B4A'], em: '🍩', pat: 'sprinkles'},
    {n: 'Soccer',      r: 0, a: ['#FFFFFF', '#2B2D42'], k: ['#FFFFFF', '#E9ECEF', '#ADB5BD'], em: '⚽', pat: 'hex'},
    {n: 'Paw',         r: 0, a: ['#FFD6A5', '#B5651D'], k: ['#FFFFFF', '#FFE7CC', '#E0A060'], em: '🐾', pat: 'paws'},
    {n: 'Frog',        r: 1, a: ['#9BE15D', '#2E8B57'], k: ['#F2FFE0', '#B9F27A', '#4CAF50'], em: '🐸', pat: 'bubbles'},
    {n: 'Watermelon',  r: 1, a: ['#FF6B81', '#2E9E4F'], k: ['#FFFFFF', '#FFB3BF', '#FF4D6D'], em: '🍉', pat: 'stripes'},
    {n: 'Cookie',      r: 1, a: ['#E8B67A', '#8B5A2B'], k: ['#FFF3E0', '#E8B67A', '#A0703C'], em: '🍪', pat: 'dots'},
    {n: 'Planet',      r: 1, a: ['#5B5BD6', '#1B1046'], k: ['#FFE7A8', '#FF9F43', '#C0392B'], em: '🪐', pat: 'stars'},
    {n: 'Robot eye',   r: 1, a: ['#B8C4D6', '#3A4A63'], k: ['#E6FBFF', '#64DFDF', '#0B7285'], em: '🤖', pat: 'hex'},
    {n: 'Star',        r: 1, a: ['#FFE14D', '#FF9F1C'], k: ['#FFFFFF', '#FFF0A0', '#FFC400'], em: '⭐', pat: 'stars'},
    {n: 'Flower',      r: 1, a: ['#FFB3D9', '#7BC74D'], k: ['#FFFFFF', '#FFD6EC', '#FF7EB6'], em: '🌸', pat: 'petals'},
    {n: 'Lava',        r: 2, a: ['#FF7A1A', '#5A1A0A'], k: ['#FFF3C4', '#FF9F1C', '#D62828'], em: '🌋', pat: 'flames'},
    {n: 'Ice',         r: 2, a: ['#E8FBFF', '#7FD3F2'], k: ['#FFFFFF', '#DFF6FF', '#8ED6F5'], em: '❄️', pat: 'crystals'},
    {n: 'Gem',         r: 2, a: ['#7DF9FF', '#5B2EFF'], k: ['#FFFFFF', '#B8F3FF', '#4D96FF'], em: '💎', pat: 'facets'},
    {n: 'Rainbow',     r: 2, a: ['rainbow', '#FFFFFF'], k: ['#FFFFFF', '#FFE6F7', '#C9B6FF'], em: '🌈', pat: 'rainbow'},
    {n: 'Galaxy',      r: 2, a: ['#3B2A8C', '#0A0620'], k: ['#E0D4FF', '#8E7CFF', '#2A1B6B'], em: '🌌', pat: 'stars'},
    {n: 'Dragon eye',  r: 3, a: ['#3DDC97', '#0B3D2E'], k: ['#FFF59D', '#FFB300', '#B71C1C'], em: '🐉', pat: 'scales'},
    {n: 'Golden crown', r: 3, a: ['#FFE27A', '#B07D10'], k: ['#FFFDE7', '#FFD54F', '#C9971C'], em: '👑', pat: 'rays'},
    {n: 'Neon pulse',  r: 3, a: ['#39FF14', '#FF2BD6'], k: ['#FFFFFF', '#B8FFB0', '#00E5FF'], em: '⚡', pat: 'neon'},
    {n: 'Phoenix',     r: 3, a: ['#FFB300', '#B3261E'], k: ['#FFF8E1', '#FF8F00', '#C62828'], em: '🔥', pat: 'flames'}
  ];
  const OFF = {joyskin: 0, joyskin2: 8, joyskin3: 16};   // 3 Collection lines of 8 → one LIST index
  const FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  const ls = k => { try{ return localStorage.getItem(k); }catch(e){ return null; } };
  function artList(){ let L = []; try{ L = JSON.parse(ls('sp_artskins') || '{}').list || []; }catch(e){} return L.filter(a => a && a.id && a.k === 'joy' && /^[a-z0-9]+$/i.test(a.id)).slice(0, 24); }
  const hex = h => /^#[0-9a-f]{6}$/i.test(h || '') ? h : null;
  function artSkin(a){ const c = hex(a.col) || '#FF7AB8', c2 = hex(a.c2) || '#7B4FE0'; return {n: a.n || 'My stick', r: 1, a: [c, c2], k: ['#FFFFFF', c, c2], em: typeof a.m === 'string' && a.m.length <= 4 ? a.m : '', pat: 'dots', art: a.id, by: a.by || ''}; }
  // which skin does this player wear? crafted (this device) → Wardrobe (avatar eq.joy) → none
  function of(name, av){
    if(!name || name === 'Guest') return null;
    const raw = ls('sp_joy:' + name);
    if(raw === 'plain') return null;
    if(raw && raw.indexOf('art:') === 0){ const a = artList().find(x => x.id === raw.slice(4)); if(a) return artSkin(a); }
    let a = av; if(!a){ const S2 = window.S || {}; a = (S2.avatars && S2.avatars[name]) || null; if(!a && Array.isArray(S2.players)){ const p = S2.players.find(q => q && (q.Name === name || q.name === name)); a = p && (p.avatar || p.av); } }
    const e = a && a.eq && a.eq.joy;
    if(e && OFF[e.id] != null){ const v = OFF[e.id] + Math.floor(Number(e.v)); if(v >= OFF[e.id] && v < Math.min(LIST.length, OFF[e.id] + 8)) return Object.assign({v}, LIST[v]); }
    if(raw != null && raw !== '' && !isNaN(Number(raw))){ const v = Math.floor(Number(raw)); if(v >= 0 && v < LIST.length) return Object.assign({v}, LIST[v]); }   // old / device pick
    return null;
  }
  // ---------- painting the ring (a canvas under the stick) ----------
  function rnd(seed){ let s = seed >>> 0 || 7; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  function paintRing(g, S, W){
    const c = W / 2, R = W / 2 - 2, r0 = R * 0.62; g.clearRect(0, 0, W, W);
    let fill;
    if(S.a[0] === 'rainbow'){ fill = g.createConicGradient ? g.createConicGradient(0, c, c) : null; if(fill){ ['#FF4D6D', '#FF9F1C', '#FFD23F', '#4CB963', '#2CA6DE', '#7B5FE0', '#FF4D6D'].forEach((col, i) => fill.addColorStop(i / 6, col)); } else fill = '#FF9F1C'; }
    else { fill = g.createRadialGradient(c, c, r0 * 0.6, c, c, R); fill.addColorStop(0, S.a[0]); fill.addColorStop(1, S.a[1]); }
    g.save(); g.beginPath(); g.arc(c, c, R, 0, 7); g.fillStyle = fill; g.fill(); g.clip();
    const Rn = rnd(S.n.length * 97 + 13), at = (n, f) => { for(let i = 0; i < n; i++){ const ang = Rn() * 7, d = r0 + (R - r0) * (0.2 + Rn() * 0.7); f(c + Math.cos(ang) * d, c + Math.sin(ang) * d, ang, i); } };
    const p = S.pat, light = 'rgba(255,255,255,0.75)';
    if(p === 'dots' || p === 'bubbles'){ at(p === 'dots' ? 22 : 14, (x, y) => { g.fillStyle = p === 'dots' ? light : 'rgba(255,255,255,0.45)'; g.beginPath(); g.arc(x, y, W * (p === 'dots' ? 0.018 : 0.03 + Rn() * 0.02), 0, 7); g.fill(); }); }
    if(p === 'sprinkles'){ const cols = ['#FF4D6D', '#FFD23F', '#2CA6DE', '#7BC74D', '#FFFFFF', '#9B5DE5']; at(30, (x, y, ang, i) => { g.strokeStyle = cols[i % cols.length]; g.lineWidth = W * 0.016; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang * 3) * W * 0.03, y + Math.sin(ang * 3) * W * 0.03); g.stroke(); }); }
    if(p === 'waves'){ g.strokeStyle = light; g.lineWidth = W * 0.014; for(let k = 0; k < 3; k++){ g.beginPath(); for(let a = 0; a <= 6.3; a += 0.05){ const d = r0 + (R - r0) * (0.25 + k * 0.25) + Math.sin(a * 10 + k) * W * 0.012; g.lineTo(c + Math.cos(a) * d, c + Math.sin(a) * d); } g.stroke(); } }
    if(p === 'rays' || p === 'rainbow'){ g.fillStyle = 'rgba(255,255,255,0.35)'; for(let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2; g.beginPath(); g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); g.lineTo(c + Math.cos(a - 0.09) * R, c + Math.sin(a - 0.09) * R); g.lineTo(c + Math.cos(a + 0.09) * R, c + Math.sin(a + 0.09) * R); g.fill(); } }
    if(p === 'stripes'){ g.strokeStyle = 'rgba(20,90,40,0.55)'; g.lineWidth = W * 0.03; for(let i = 0; i < 18; i++){ const a = i / 18 * Math.PI * 2; g.beginPath(); g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); g.lineTo(c + Math.cos(a + 0.12) * R, c + Math.sin(a + 0.12) * R); g.stroke(); } }
    if(p === 'hex' || p === 'facets' || p === 'scales'){ g.strokeStyle = p === 'hex' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.5)'; g.lineWidth = W * 0.01; const s = W * (p === 'scales' ? 0.06 : 0.08);
      for(let y = 0; y < W + s; y += s * 0.86) for(let x = (Math.round(y / (s * 0.86)) % 2) * s / 2; x < W + s; x += s){ g.beginPath(); if(p === 'scales') g.arc(x, y, s * 0.55, 0, Math.PI); else for(let k = 0; k < 6; k++){ const a = k / 6 * Math.PI * 2 + Math.PI / 6; g.lineTo(x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.5); } g.closePath(); g.stroke(); } }
    if(p === 'stars'){ at(18, (x, y, a, i) => { g.fillStyle = i % 3 ? '#FFFFFF' : '#FFE14D'; const s = W * (0.008 + Rn() * 0.018); g.beginPath(); for(let k = 0; k < 8; k++){ const q = k * Math.PI / 4, d = k % 2 ? s * 0.35 : s; g.lineTo(x + Math.cos(q) * d, y + Math.sin(q) * d); } g.fill(); }); }
    if(p === 'paws'){ at(9, (x, y) => { g.fillStyle = 'rgba(90,50,20,0.45)'; const s = W * 0.022; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); [-1, -0.35, 0.35, 1].forEach(k => { g.beginPath(); g.arc(x + k * s * 1.1, y - s * 1.3 + Math.abs(k) * s * 0.4, s * 0.45, 0, 7); g.fill(); }); }); }
    if(p === 'petals'){ at(10, (x, y, a) => { g.fillStyle = 'rgba(255,255,255,0.7)'; for(let k = 0; k < 5; k++){ const q = a + k * 1.256; g.beginPath(); g.ellipse(x + Math.cos(q) * W * 0.018, y + Math.sin(q) * W * 0.018, W * 0.018, W * 0.01, q, 0, 7); g.fill(); } g.fillStyle = '#FFD23F'; g.beginPath(); g.arc(x, y, W * 0.008, 0, 7); g.fill(); }); }
    if(p === 'flames'){ for(let i = 0; i < 14; i++){ const a = i / 14 * Math.PI * 2, b = R - (R - r0) * (0.3 + Rn() * 0.4); g.fillStyle = i % 2 ? 'rgba(255,214,0,0.75)' : 'rgba(255,120,0,0.7)'; g.beginPath(); g.moveTo(c + Math.cos(a - 0.2) * R, c + Math.sin(a - 0.2) * R); g.quadraticCurveTo(c + Math.cos(a) * (b - W * 0.04), c + Math.sin(a) * (b - W * 0.04), c + Math.cos(a + 0.05) * (r0 + W * 0.01), c + Math.sin(a + 0.05) * (r0 + W * 0.01)); g.lineTo(c + Math.cos(a + 0.2) * R, c + Math.sin(a + 0.2) * R); g.fill(); } }
    if(p === 'crystals'){ g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = W * 0.008; at(10, (x, y, a) => { for(let k = 0; k < 3; k++){ const q = a + k * Math.PI / 3, s = W * 0.025; g.beginPath(); g.moveTo(x - Math.cos(q) * s, y - Math.sin(q) * s); g.lineTo(x + Math.cos(q) * s, y + Math.sin(q) * s); g.stroke(); } }); }
    if(p === 'neon'){ [0.35, 0.65, 0.9].forEach((k, i) => { g.strokeStyle = i % 2 ? '#FF2BD6' : '#39FF14'; g.lineWidth = W * 0.012; g.shadowColor = g.strokeStyle; g.shadowBlur = W * 0.04; g.beginPath(); g.arc(c, c, r0 + (R - r0) * k, 0, 7); g.stroke(); }); g.shadowBlur = 0; }
    g.restore();
    // inner well (where the knob sits) + rim in the rarity colour
    const wg = g.createRadialGradient(c, c, 0, c, c, r0); wg.addColorStop(0, 'rgba(0,0,0,0.05)'); wg.addColorStop(1, 'rgba(0,0,0,0.28)'); g.fillStyle = wg; g.beginPath(); g.arc(c, c, r0, 0, 7); g.fill();
    g.lineWidth = W * 0.035; g.strokeStyle = R2(S.r); g.beginPath(); g.arc(c, c, R - g.lineWidth / 2, 0, 7); g.stroke();
    g.lineWidth = W * 0.01; g.strokeStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(c, c, R - W * 0.035, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
  }
  const R2 = r => R[Math.max(0, Math.min(3, r || 0))].c;
  const knobBg = S => 'radial-gradient(circle at 35% 30%,' + S.k[0] + ',' + S.k[1] + ' 55%,' + S.k[2] + ')';
  // ---------- put a skin on a stick element ----------
  function css(){ if(document.getElementById('sk-css')) return; const st = document.createElement('style'); st.id = 'sk-css';
    st.textContent = '.sk-bg{position:absolute;inset:0;width:100%;height:100%;border-radius:50%;pointer-events:none;}' +   /* first child: everything positioned after it paints on top */
      '.sk-knob{container-type:size;} .sk-knob::after{content:var(--sk-em,"");position:absolute;left:50%;top:50%;transform:translate(-50%,-52%);font-size:56cqmin;line-height:1;font-family:' + FONT + ';pointer-events:none;}' +
      '.sk-r2 .sk-bg{animation:skGlow 2.4s ease-in-out infinite;} .sk-r3 .sk-bg{animation:skGlow 1.6s ease-in-out infinite;}' +
      '.sk-btns button{outline:3px solid var(--sk-a);outline-offset:2px;filter:drop-shadow(0 0 5px var(--sk-glow));} .sk-btns.sk-r3 button,.sk-btns.sk-r2 button{animation:skBtn 2s ease-in-out infinite;}' +
      '@keyframes skBtn{0%,100%{filter:drop-shadow(0 0 3px var(--sk-glow));}50%{filter:drop-shadow(0 0 10px var(--sk-glow));}}' +
      '@keyframes skGlow{0%,100%{filter:drop-shadow(0 0 3px var(--sk-glow));}50%{filter:drop-shadow(0 0 12px var(--sk-glow));}}';
    document.head.appendChild(st); }
  function apply(el, name, av){
    if(!el) return null; const S = of(name || (typeof CURRENT_PLAYER !== 'undefined' ? CURRENT_PLAYER : ''), av);
    const old = el.querySelector(':scope > .sk-bg'); if(old) old.remove(); el.classList.remove('sk-on', 'sk-r0', 'sk-r1', 'sk-r2', 'sk-r3');
    const kn = el.querySelector('.knob, .joy-knob'); if(kn){ kn.classList.remove('sk-knob'); if(kn.dataset.skBg != null){ kn.style.background = kn.dataset.skBg; kn.style.boxShadow = kn.dataset.skSh; delete kn.dataset.skBg; } }
    if(!S) return null;
    css(); if(el.isConnected && getComputedStyle(el).position === 'static') el.style.position = 'relative';   // only when the page left it static (a stick not in the page yet keeps its CSS)
    const W = 240, cv = document.createElement('canvas'); cv.width = cv.height = W; cv.className = 'sk-bg'; paintRing(cv.getContext('2d'), S, W); el.insertBefore(cv, el.firstChild);
    el.classList.add('sk-on', 'sk-r' + S.r); el.style.setProperty('--sk-glow', S.a[0] === 'rainbow' ? '#FF9F1C' : S.a[0]);
    if(kn){ kn.dataset.skBg = kn.style.background || ''; kn.dataset.skSh = kn.style.boxShadow || ''; kn.style.background = knobBg(S); kn.style.boxShadow = '0 5px 0 rgba(0,0,0,0.25),0 8px 14px rgba(0,0,0,0.3),0 0 0 3px ' + R2(S.r) + 'AA';
      kn.classList.add('sk-knob'); kn.style.setProperty('--sk-em', S.em && !kn.textContent.trim() && !kn.children.length ? '"' + S.em + '"' : '""'); }   // a knob that already shows something (Turbo's car) keeps it
    el.dataset.skin = S.art ? 'art:' + S.art : String(S.v);
    return S;
  }
  // 🔘 the game's buttons wear the same skin: each game KEEPS its own button colours; the skin adds its ring (outline) + rarity glow
  //   buttons(box, name, av) — box = the element holding the buttons (SlaBrall .shotpad, Brawl / Soul Bopper .tbtns, …); vars --sk-a / --sk-b / --sk-glow are set too
  const BTN_BOXES = '.shotpad, .tbtns, .btns, .act-btns, .actions';
  function buttons(box, name, av){ if(!box) return null; const S = of(name, av);
    ['--sk-a', '--sk-b', '--sk-glow'].forEach(k => box.style.removeProperty(k)); box.classList.remove('sk-btns', 'sk-r0', 'sk-r1', 'sk-r2', 'sk-r3'); if(!S) return null; css();
    const a = S.a[0] === 'rainbow' ? '#FF9F1C' : S.a[0]; box.style.setProperty('--sk-a', a); box.style.setProperty('--sk-b', S.a[1]); box.style.setProperty('--sk-glow', R2(S.r)); box.classList.add('sk-btns', 'sk-r' + S.r); box.dataset.skin = S.art ? 'art:' + S.art : String(S.v); return S; }
  function nearButtons(el){ for(let p = el.parentElement, i = 0; p && i < 2; p = p.parentElement, i++){ const b = p.querySelector(BTN_BOXES); if(b && b !== el) return b; } return null; }
  // Wardrobe / Collection tile: the ring + knob
  function drawPreview(g, v, w, h, skin){
    const S = skin || LIST[v]; if(!S) return; g.save(); g.clearRect(0, 0, w, h);
    const D = Math.min(w, h) * 0.86, x0 = (w - D) / 2, y0 = (h - D) / 2, c = document.createElement('canvas'); c.width = c.height = 240; paintRing(c.getContext('2d'), S, 240);
    g.drawImage(c, x0, y0, D, D);
    const kr = D * 0.22, cx = w / 2, cy = h / 2, gr = g.createRadialGradient(cx - kr * 0.3, cy - kr * 0.4, kr * 0.1, cx, cy, kr); gr.addColorStop(0, S.k[0]); gr.addColorStop(0.55, S.k[1]); gr.addColorStop(1, S.k[2]);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.arc(cx, cy + kr * 0.15, kr, 0, 7); g.fill(); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, kr, 0, 7); g.fill();
    if(S.em){ g.font = Math.round(kr * 1.15) + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(S.em, cx, cy + kr * 0.06); }
    g.fillStyle = R2(S.r); g.font = '900 ' + Math.max(9, Math.round(h * 0.09)) + 'px Nunito, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(R[S.r].n, 4, 3);
    g.restore();
  }
  window.JoySkins = {LIST, RARITY: R, OFF, idx: (line, v) => (OFF[line] || 0) + (Number(v) || 0), of, apply, buttons, drawPreview, artList, count: LIST.length,
    pick(name, val){ try{ if(val == null) localStorage.removeItem('sp_joy:' + name); else localStorage.setItem('sp_joy:' + name, String(val)); }catch(e){} }};
  // every UI.stickTracker(el, {player}) puts the player's skin on by itself
  if(window.UI && UI.stickTracker && !UI.stickTracker.__sk){ const orig = UI.stickTracker; UI.stickTracker = function(el, opt){
    try{ apply(el, opt && opt.player, opt && opt.av); const nm = (opt && opt.player) || (typeof CURRENT_PLAYER !== 'undefined' ? CURRENT_PLAYER : ''); const bx = opt && opt.buttons !== undefined ? opt.buttons : nearButtons(el); if(bx) buttons(bx, nm, opt && opt.av); }catch(e){}
    return orig.apply(this, arguments); }; UI.stickTracker.__sk = true; }   // …and its buttons next to it (or opt.buttons)
})();
/* ================= 🎛️ GAME BAR · 🔘 BUTTONS · 🧭 BACK TRAIL (p1a — Polish Sprint P1, Aowu 2026-11-12/13) =================
   "Art distinct, controls shared": every game keeps its own pictures and colours, but the top bar, the buttons and the way
   back work the same everywhere.

   🎛️ UI.gameBar(el, opts) → bar — the ONE top bar of a game's play screen. Fixed order, left → right:
        ◀ Back · 🎚️ Levels · 🏠  |  icon name · level  |  ⭐ score / player cards · ❌ · ❤️ · ⏱ · 🔁 · counts · ⌛  |  ⏸ ❓ (extras) ⚙️
      opts = {game: 'number-board' (UI.GAME_HELP id), icon: '➗', name: 'Algebros',
              levels(): this game's level picker (the game's own leavePlay — it asks before throwing a game away),
              playing(): true while a game runs → ◀ Back / 🏠 ask "Leave the game?" first,
              onLeave(): stop timers / voice before the page changes,
              pause: {pause(), resume()} (used around the leave question + ❓) · pauseButton: true → ⏸ + pause card,
              help: false | fn (default: the UI.GAME_HELP card of `game`),
              extras: [{id, icon, label, onClick, keep}] → small icon buttons on wide screens, always also in the ⚙️ menu;
                keep: true = a game action button (Undo, Hint, Pause…) that is always visible, keeps its id + the game's own code (p1b),
              fallback: URL (or () => URL) for ◀ Back when we don't know where you came from (default: the Gameroom),
              levelId: id for the level chip (old tests), onFit(): the bar changed height → re-lay the board,
              scoreMin: '9ch' = keep room for a big score (games whose score grows to millions — p1c)}
      bar.level(text, cls) · bar.score(n) · bar.players([{k, name, av: canvas | emoji, score, on, bot, col}]) · bar.on(k)  (seat colours p1a-3)
      bar.miss(n) · bar.lives(n, warn) · bar.time(sec | text, warn) · bar.round(a, b) · bar.count(key, icon, value, title, warn) · bar.left(ms, warn) · bar.meter(key, icon, 0…1, title, warn) · bar.badge(key, text) · bar.custom(key, node) = the game's own HUD art in the bar (give it a min-width) · bar.adopt(key, pill) · bar.keepBtn(button) · bar.hide(key)
      UI.gameBarFrom(oldHudEl, opts) = the same bar built from a game's existing top bar in place (p1d)
      bar.extra(id, {icon, label, hidden}) · bar.fit() · bar.back() · bar.home() · bar.el
      Fit: one row; (short screens: .gb-slim = name / extras / player names hide first) → too wide → .gb-two (numbers on row 2); → .gb-tight (level chip joins row 2, name hides); → .gb-tiny (player names + the icon tile hide) → .gb-micro (Levels label → stairs icon only).
      Never wraps by itself, never scrolls; numbers changing never changes the bar's size (no board jump — r30 lesson).
   🔘 .sp-btn + .sp-primary / .sp-secondary / .sp-danger / .sp-ghost (+ .sp-sm / .sp-lg). Same shape, press and size in every
      game (shape rules use :where() = no weight, so a game's own grid / size rules still win; the colour classes win); colours come from the game through --game-a / --game-b (default: its --terracotta / --mustard).
      Order rule: back / exit on the LEFT, the main action on the RIGHT, danger never next to the main action.
   🧭 Back = where you came from (Aowu 2026-11-13): UI.go remembers the page you left (localStorage sp_trail, last 12, 6 h);
      UI.back(fallbackUrl, kind) goes back there and forgets that step (so Back never ping-pongs); no trail → fallbackUrl.
      UI.navBar(btn, {fallback, kind}) turns a page's top button into "◀ <where it goes>" (+ a 🏠 Dashboard button next to it).
      p1a-2 rule (Aowu 2026-11-13): ONE back per screen. A back that LEAVES the page names the page ("◀ Algebros", UI.backLabel());
      a back inside the page names the page's own main screen ("◀ Artifactory"); no second "◀ Back" bar at the bottom.
      UI.backInfo() → {page, url} or null. A page can say how to come back to it: window.SP_RETURN = () => url.
*/
(function(){
  if(!window.UI || UI.gameBar) return;
  const TKEY = 'sp_trail', MAXAGE = 6 * 3600 * 1000;
  const base = () => (typeof WEBAPP_URL !== 'undefined' ? WEBAPP_URL : '');
  const here = () => window.SP_PAGE || 'home';
  const pageOf = u => { const m = /[?&]page=([^&#]+)/.exec(u || ''); return m ? decodeURIComponent(m[1]) : 'home'; };
  function player(){ try{ return typeof CURRENT_PLAYER !== 'undefined' ? CURRENT_PLAYER : ''; }catch(e){ return ''; } }
  function sq(){
    try{ if(typeof window.sessionQuery === 'function') return window.sessionQuery(); }catch(e){}
    const p = player(); return p ? '&player=' + encodeURIComponent(p) : '';
  }
  function hereUrl(){
    try{ if(typeof window.SP_RETURN === 'function'){ const u = window.SP_RETURN(); if(u) return u; } }catch(e){}
    return base() + '?page=' + encodeURIComponent(here()) + sq();
  }
  function readTrail(){ try{ const a = JSON.parse(localStorage.getItem(TKEY) || '[]'); return Array.isArray(a) ? a.filter(x => x && x.url && Date.now() - x.t < MAXAGE) : []; }catch(e){ return []; } }
  function writeTrail(a){ try{ localStorage.setItem(TKEY, JSON.stringify(a.slice(-12))); }catch(e){} }
  function remember(url){
    const from = here(), to = pageOf(url); if(to === from) return;
    const a = readTrail(); a.push({from: from, to: to, url: hereUrl(), t: Date.now()}); writeTrail(a);
  }
  function findBack(){ const h = here(), a = readTrail(); for(let i = a.length - 1; i >= 0; i--) if(a[i].to === h && a[i].from !== h) return {i: i, e: a[i], a: a}; return null; }
  function backInfo(){ const f = findBack(); return f ? {page: f.e.from, url: f.e.url, name: pageName(f.e.from)} : null; }
  // p1a-2 (Aowu 2026-11-13: "2 Back buttons went to different places"): a Back that LEAVES the page names where it goes
  const PAGE_NAMES = {home: 'Dashboard', gameroom: 'Gameroom', achievements: 'Archive', collection: 'Collection', room: 'Family Room', setup: 'Setup', tdstories: 'TD-Stories', blasoff: 'BlasOff', pyradive: 'PyraDive', sciencetory: 'Sciencetory', pokadif: 'Pokadif',
    minigames: 'Mini games', stacking: 'Stack It!', maze: 'Maze', robot: 'Code the Robot', checkers: 'Checkers', chess: 'Chess', pinball: 'Pinball',
    hopper: 'Dodgy Hopper', turbo: 'Turbo Trail', memory: 'Memories Match', mathquest: 'Math Quest', doubleup: 'Double Up', blockdrop: 'Block Drop',
    popblocks: 'Pop Blocks', numbergrid: 'Digitinct', numberboard: 'Algebros', wordboard: 'Lettercraft', sweetswap: 'Sweet Swap', beatcorner: 'BeatCorner',
    slabrall: 'SlaBrall', brawlbuddies: 'Brawl Buddies', alignext: 'Alignext', soulbopper: 'Soul Bopper', snakize: 'Snakize', polyplot: 'Polyplot',
    wisdeck: 'WisDeck', eyesbrain: 'Eyes Brain Riot', georead: 'GeoRead', geoscout: 'GeoScout', artifactory: 'Artifactory', workshop: 'Artifactory', poseparty: 'Pose Party'};
  function pageName(p){ return PAGE_NAMES[p] || (p ? p.charAt(0).toUpperCase() + p.slice(1) : 'Back'); }
  // "◀ Algebros" — where ◀ goes from this page (the trail, else the fallback page, else the Gameroom)
  function backLabel(fallback){ const i = backInfo(); if(i) return '◀ ' + i.name; let f = fallback; if(typeof f === 'function') try{ f = f(); }catch(e){ f = ''; } return '◀ ' + pageName(f ? (/[?&]page=/.test(f) ? pageOf(f) : f) : 'gameroom'); }
  let quiet = false;
  const origGo = UI.go;
  UI.go = function(url){ if(!quiet) try{ remember(url); }catch(e){} return origGo.apply(this, arguments); };
  function gameroomUrl(){ return base() + '?page=gameroom' + sq(); }
  function homeUrl(){ return base() + '?page=home' + sq(); }
  function back(fallback, kind, text){
    const f = findBack();
    if(f){ f.a.splice(f.i); writeTrail(f.a); }
    if(typeof fallback === 'function') try{ fallback = fallback(); }catch(e){ fallback = ''; }
    const url = f ? f.e.url : (fallback || gameroomUrl());
    const to = f ? f.e.from : pageOf(url);
    quiet = true; try{ return UI.go(url, kind || (UI.KINDS && UI.KINDS[to] ? to : (to === 'gameroom' ? 'rooms' : to === 'home' ? 'home' : 'nav')), text); } finally { quiet = false; }
  }
  function goHome(){ return UI.go(homeUrl(), 'home'); }

  // ---------- CSS ----------
  let cssDone = false;
  function addCss(){
    if(cssDone) return; cssDone = true;
    const F = 'var(--font-display,"Fredoka",sans-serif)';
    const css =
      /* 🔘 buttons */
      ':where(.sp-btn){--sa:var(--game-a,var(--terracotta,#E8734A));--sb:var(--game-b,var(--mustard,#F2B33D));display:inline-flex;align-items:center;justify-content:center;gap:6px;box-sizing:border-box;min-height:44px;padding:10px 18px;border:0;border-radius:16px;'
      + 'font-family:' + F + ';font-weight:600;font-size:1rem;line-height:1.15;cursor:pointer;text-align:center;transform:translateZ(0);box-shadow:0 4px 0 rgba(0,0,0,.18);-webkit-tap-highlight-color:transparent;}'
      + ':where(.sp-btn):active{transform:translateZ(0) translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.18);}'
      + ':where(.sp-btn):disabled{opacity:.45;cursor:default;transform:translateZ(0);box-shadow:0 2px 0 rgba(0,0,0,.12);}'
      + '.sp-btn.sp-primary{--sa:var(--game-a,var(--terracotta,#E8734A));--sb:var(--game-b,var(--mustard,#F2B33D));background:linear-gradient(135deg,var(--sa),var(--sb));color:#fff;text-shadow:0 1px 1px rgba(0,0,0,.28);}'
      + '.sp-btn.sp-secondary{--sa:var(--game-a,var(--terracotta,#E8734A));background:var(--panel,#F4EFE6);color:var(--ink,#2B2440);box-shadow:0 4px 0 rgba(0,0,0,.12),inset 0 0 0 2px color-mix(in srgb,var(--sa) 45%,transparent);}'
      + '.sp-btn.sp-secondary:active{box-shadow:0 1px 0 rgba(0,0,0,.12),inset 0 0 0 2px color-mix(in srgb,var(--sa) 45%,transparent);}'
      + '.sp-btn.sp-danger{background:linear-gradient(135deg,#E5484D,#B3122B);color:#fff;text-shadow:0 1px 1px rgba(0,0,0,.28);}'
      + '.sp-btn.sp-ghost{background:transparent;color:inherit;box-shadow:inset 0 0 0 2px currentColor;}'
      + ':where(.sp-btn.sp-sm){min-height:36px;padding:6px 12px;font-size:.88rem;border-radius:13px;}'
      + ':where(.sp-btn.sp-lg){min-height:54px;padding:12px 22px;font-size:1.12rem;border-radius:18px;}'
      /* 🧭 top nav (start pages) */
      + '.sp-topnav{position:fixed;top:calc(10px + env(safe-area-inset-top));left:calc(10px + env(safe-area-inset-left));z-index:300;display:flex;gap:6px;align-items:center;}'
      + '.sp-topnav.hidden{display:none !important;}'
      + '.sp-topnav > .top-btn{position:static !important;top:auto !important;left:auto !important;margin:0 !important;}'
      + '.sp-topnav > .sp-home{min-width:40px;justify-content:center;}'
      /* 🎛️ game bar — design (p1a-2, Aowu 2026-11-13 "polish the looks"): buttons in joined toolbars (.gb-seg), the numbers in one
         dark SCOREBOARD tinted with the game's colour (.gb-board), drawn icons for 🎚️ Levels (stairs) and ⏸ (bars) */
      + '.gb{--gb-a:var(--game-a,var(--terracotta,#E8734A));--gb-b:var(--game-b,var(--mustard,#F2B33D));--gb-ink:#2B2440;--gb-h:40px;display:flex;flex-wrap:nowrap;align-items:center;gap:8px;box-sizing:border-box;width:100%;min-width:0;'
      + 'padding:calc(7px + env(safe-area-inset-top)) max(8px, env(safe-area-inset-right)) 6px max(8px, env(safe-area-inset-left));position:relative;z-index:6;flex:none;font-family:' + F + ';contain:inline-size;}'   /* p1b: the bar never widens its parent (Code the Robot grid) */
      + '.gb-g{display:flex;align-items:center;gap:6px;flex:none;min-width:0;}'
      /* joined toolbars */
      + '.gb-seg{gap:2px;padding:3px;border-radius:17px;background:rgba(255,255,255,.96);box-shadow:0 3px 0 color-mix(in srgb,var(--gb-a) 40%,rgba(0,0,0,.28)),0 6px 14px rgba(0,0,0,.10);}'
      + '.gb-b{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:5px;box-sizing:border-box;min-width:var(--gb-h);min-height:var(--gb-h);padding:0 12px;border:0;border-radius:13px;background:transparent;color:var(--gb-ink);'
      + 'font-family:' + F + ';font-weight:700;font-size:.95rem;cursor:pointer;white-space:nowrap;transform:translateZ(0);-webkit-tap-highlight-color:transparent;transition:background .12s;}'
      + '.gb-b:hover{background:color-mix(in srgb,var(--gb-a) 12%,transparent);} .gb-b:active{background:color-mix(in srgb,var(--gb-a) 24%,transparent);transform:translateZ(0) scale(.93);}'
      + '.gb-b:focus-visible{outline:3px solid color-mix(in srgb,var(--gb-a) 70%,#fff);outline-offset:1px;}'
      + '.gb-seg > .gb-b + .gb-b::before{content:"";position:absolute;left:-2px;top:22%;bottom:22%;width:1px;background:rgba(43,36,64,.13);}'
      + '.gb-b.gb-i{padding:0;width:var(--gb-h);font-size:1.12rem;}'
      + '.gb-arr{color:var(--gb-a);font-size:1.05rem;line-height:1;filter:saturate(1.2);}'
      + '.gb-stairs{display:inline-flex;align-items:flex-end;gap:2px;height:17px;flex:none;} .gb-stairs i{display:block;width:5px;border-radius:2px;background:linear-gradient(180deg,var(--gb-b),var(--gb-a));}'
      + '.gb-stairs i:nth-child(1){height:7px;} .gb-stairs i:nth-child(2){height:12px;} .gb-stairs i:nth-child(3){height:17px;}'
      + '.gb-pzi{display:inline-flex;gap:4px;} .gb-pzi i{display:block;width:5px;height:16px;border-radius:2px;background:var(--gb-ink);}'
      + '.gb-b.hidden,.gb-s.hidden,.gb-pls.hidden{display:none !important;}'
      /* title: icon tile · name · level chip */
      + '.gb-title{flex:0 1 auto;font-weight:700;font-size:1.05rem;white-space:nowrap;overflow:hidden;color:inherit;gap:7px;}'
      + '.gb-ic{display:flex;align-items:center;justify-content:center;flex:none;width:36px;height:36px;border-radius:12px;font-size:1.35rem;line-height:1;background:rgba(255,255,255,.8);box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--gb-a) 30%,transparent),0 2px 0 rgba(0,0,0,.12);}'
      + '.gb-nm{overflow:hidden;text-overflow:ellipsis;min-width:0;letter-spacing:.2px;}'
      + '.gb-lvg{flex:none;}'
      + '.gb-lv{flex:none;padding:5px 12px;border-radius:999px;background:linear-gradient(135deg,var(--gb-a),var(--gb-b));color:#fff;font-size:.84rem;font-weight:700;text-shadow:0 1px 1px rgba(0,0,0,.3);white-space:nowrap;'
      + 'box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 2px 0 rgba(0,0,0,.18);}'
      + '.gb-lv.hc{background:linear-gradient(135deg,#B3122B,#3A0A10);} .gb-lv.tg{background:linear-gradient(135deg,#2E7D5B,#2EC4B6);} .gb-lv:empty{display:none;}'
      /* scoreboard */
      + '.gb-stats{flex:1 1 auto;justify-content:center;}'
      + '.gb-board{display:inline-flex;align-items:center;gap:3px;padding:3px;border-radius:18px;color:#fff;'
      + 'background:linear-gradient(180deg,color-mix(in srgb,var(--gb-a) 30%,#2C2244),color-mix(in srgb,var(--gb-a) 16%,#19132B));'
      + 'box-shadow:0 3px 0 rgba(0,0,0,.30),0 6px 16px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.16);}'
      + '.gb-board:empty{display:none;}'
      + '.gb-s{display:inline-flex;align-items:center;gap:5px;box-sizing:border-box;min-height:calc(var(--gb-h) - 2px);padding:2px 11px;border-radius:14px;background:rgba(255,255,255,.08);color:#fff;font-weight:700;font-size:.92rem;'
      + 'font-variant-numeric:tabular-nums;white-space:nowrap;transform:translateZ(0);}'
      + '.gb-s b{font-weight:700;}'
      + '.gb-score,.gb-pl{--glow:color-mix(in srgb,var(--gb-b) 62%,#fff);}'
      + '.gb-score b,.gb-pl b{color:var(--glow);text-shadow:0 0 12px color-mix(in srgb,var(--gb-b) 55%,transparent),0 2px 0 rgba(0,0,0,.35);}'
      + '.gb-score{order:1;padding:2px 13px 2px 9px;background:rgba(255,255,255,.13);} .gb-score i{font-style:normal;font-size:1.2rem;} .gb-score b{font-size:1.75rem;line-height:1;min-width:1.6em;text-align:center;font-variant-numeric:tabular-nums;}'
      + '.gb-pls{order:2;display:flex;gap:3px;align-items:center;}'
      + '.gb-pl{padding:2px 11px 2px 3px;}'
      + '.gb-pl .av{width:32px;height:34px;border-radius:10px;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-size:1.45rem;line-height:1;flex:none;overflow:hidden;} .gb-pl canvas{width:30px;height:34px;display:block;}'
      + '.gb-pl .nm{font-size:.78rem;max-width:6.5em;overflow:hidden;text-overflow:ellipsis;color:rgba(255,255,255,.78);}'
      + '.gb-pl b{font-size:1.65rem;line-height:1;min-width:1.4em;text-align:center;}'
      /* p1a-3 (Aowu: "a little distinctive between player score"): every player has a seat colour (--pc) — tint, edge stripe,
         avatar ring, score digits; the player whose turn it is glows gold + a bit bigger, the others dim; "VS" between 2 players */
      + '.gb-pl{--pc:#4DA3FF;position:relative;background:linear-gradient(180deg,color-mix(in srgb,var(--pc) 44%,transparent),color-mix(in srgb,var(--pc) 20%,transparent));box-shadow:inset 4px 0 0 var(--pc);transition:opacity .2s,filter .2s;}'
      + '.gb-pl .av{background:color-mix(in srgb,var(--pc) 28%,rgba(255,255,255,.08));box-shadow:inset 0 0 0 2px var(--pc);}'
      + '.gb-pl .nm{color:color-mix(in srgb,var(--pc) 35%,#fff);}'
      + '.gb-pl b{color:color-mix(in srgb,var(--pc) 42%,#fff);text-shadow:0 0 12px color-mix(in srgb,var(--pc) 65%,transparent),0 2px 0 rgba(0,0,0,.35);}'
      + '.gb-pl.on{box-shadow:inset 4px 0 0 var(--pc),inset 0 0 0 2px #FFC845,0 0 16px rgba(255,200,69,.45);transform:translateZ(0) scale(1.05);z-index:1;}'
      + '.gb-pls.has-on .gb-pl:not(.on){opacity:.78;filter:saturate(.8);}'
      + '.gb-pls.two{gap:9px;} .gb-pls.two .gb-pl + .gb-pl::before{content:"VS";position:absolute;left:-12px;top:50%;margin-top:-9px;width:18px;height:18px;border-radius:50%;background:#fff;color:#2B2440;'
      + 'font-family:' + F + ';font-weight:700;font-size:.52rem;line-height:18px;text-align:center;letter-spacing:-.3px;box-shadow:0 1px 3px rgba(0,0,0,.4);z-index:2;pointer-events:none;}'
      + '.gb-miss{order:3;} .gb-miss b{font-size:1.3rem;line-height:1;} .gb-miss.bad{background:#E5484D;box-shadow:inset 0 -2px 0 rgba(0,0,0,.2);}'
      + '.gb-s{position:relative;} .gb-bdg{position:absolute;right:1px;bottom:-9px;background:#FF4D6D;color:#fff;border-radius:9px;padding:0 5px;font-style:normal;font-weight:700;font-size:.64rem;line-height:1.45;box-shadow:0 2px 0 rgba(0,0,0,.25);pointer-events:none;white-space:nowrap;z-index:2;} '
      + '.gb-nano .gb-score b{font-size:1.3rem;} .gb-nano .gb-score{padding:0 9px 0 7px;} .gb-nano .gb-score i{font-size:1rem;} .gb-nano .gb-s{padding:0 7px;gap:3px;} .gb-nano .gb-lvg{flex:0 1 auto;min-width:0;} .gb-nano .gb-lv{max-width:7em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;} .gb-nano .gb-board{gap:3px;} '
      + '.gb-pli{display:inline-block;width:0;height:0;border-left:13px solid var(--gb-ink);border-top:8px solid transparent;border-bottom:8px solid transparent;margin-left:3px;} .gb-b.gb-on{background:#FFE7A3;} '
      + '.gb-ad{white-space:nowrap;} .gb-s.gb-ad.low,.gb-s.gb-ad.hot,.gb-s.gb-ad.warn,.gb-s.gb-ad.on{background:#FFB020;color:#3B2400;} '
      + '.gb-cu{display:flex;align-items:center;min-width:0;flex:1 1 auto;} .gb-cu.hidden{display:none;} '
      + '.gb-meter{order:7;gap:5px;} .gb-mt{display:inline-block;width:56px;height:10px;border-radius:6px;background:rgba(255,255,255,.22);overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.35);} .gb-mt u{display:block;height:100%;width:0;background:linear-gradient(90deg,#3DDC97,#FFD23F);border-radius:6px;transition:width .3s;} .gb-meter.full .gb-mt u{background:linear-gradient(90deg,#FFD23F,#FF9F1C);} .gb-tiny .gb-mt{width:40px;} .gb-nano .gb-mt{width:28px;} .gb-nano .gb-time{min-width:3.4em;} '
      + '.gb-lives{order:4;} .gb-time{order:5;min-width:4.7em;justify-content:center;} .gb-round{order:6;} .gb-cnt{order:7;} .gb-left{order:8;} .gb-s.warn{background:#FFB020;color:#3B2400;}'
      + '.gb-b.gb-k{padding:0 10px;font-size:1.02rem;} .gb-b:disabled{opacity:.38;cursor:default;transform:translateZ(0);} .gb-k.done-btn{background:linear-gradient(135deg,#2EC4B6,#4CB963);color:#fff;}'
      + '.gb-lv.ch{background:linear-gradient(135deg,#7A5CFA,#C04BFF);} .gb-tight .gb-k .gt{display:none;}'
      + '.gb-pop{animation:gbpop .5s cubic-bezier(.2,1.6,.4,1);} @keyframes gbpop{0%{transform:translateZ(0) scale(1);}35%{transform:translateZ(0) scale(1.3);}100%{transform:translateZ(0) scale(1);}}'
      + '.gb-shake{animation:gbshake .5s;} @keyframes gbshake{0%,100%{transform:translateZ(0);}20%{transform:translateX(-5px) rotate(-5deg);}40%{transform:translateX(5px) rotate(5deg);}60%{transform:translateX(-4px);}80%{transform:translateX(3px);}}'
      /* fit stages */
      + '.gb-br{display:none;flex:0 0 100%;height:0;order:8;}'
      + '.gb-two{flex-wrap:wrap;row-gap:6px;} .gb-two .gb-br{display:block;} .gb-two .gb-stats{order:10;flex:1 1 auto;} .gb-two .gb-tools{order:5;margin-left:auto;}'
      + '.gb-tools{margin-left:auto;}'
      + '.gb-slim .gb-nm,.gb-slim .gb-x,.gb-slim .gb-pl .nm{display:none !important;}'
      + '.gb-tight .gb-lvg{order:9;} .gb-tight .gb-nm,.gb-tight .gb-x{display:none !important;} .gb-tight .gb-b{padding:0 9px;} .gb-tight .gb-b.gb-i{padding:0;}'
      + '.gb-tiny .gb-pl .nm,.gb-tiny .gb-title{display:none !important;} .gb-micro .gb-lvb .gt{display:none !important;} .gb-micro .gb-back .gt{max-width:5.5em;overflow:hidden;text-overflow:ellipsis;}'
      /* short screens (old phones, phone on its side): a lower bar so the board keeps its room */
      + '.gb.gb-short{--gb-h:36px;padding-top:calc(4px + env(safe-area-inset-top));padding-bottom:4px;gap:6px;} .gb-short.gb-two{row-gap:4px;} .gb-short .gb-ic{width:32px;height:32px;font-size:1.2rem;}'
      + '.gb.gb-xs{--gb-h:36px;padding-top:calc(2px + env(safe-area-inset-top));padding-bottom:2px;gap:5px;} .gb-xs.gb-two{row-gap:2px;} .gb-xs .gb-seg{padding:1px;border-radius:14px;} .gb-xs .gb-board{padding:2px;border-radius:15px;} .gb-xs .gb-ic{width:28px;height:28px;font-size:1.05rem;}'
      + '.gb-xs.gb-two{row-gap:2px;padding-bottom:2px;} .gb-xs.gb-two .gb-s{min-height:26px;padding:0 8px;} .gb-xs.gb-two .gb-pl .av{height:24px;width:24px;} .gb-xs.gb-two .gb-pl canvas{height:24px;width:21px;} .gb-xs.gb-two .gb-score b,.gb-xs.gb-two .gb-pl b{font-size:1.25rem;} .gb-xs.gb-two .gb-lv{padding:2px 9px;}'
      + '.gb-xs .gb-s{min-height:30px;} .gb-xs .gb-score b{font-size:1.35rem;} .gb-xs .gb-pl b{font-size:1.3rem;} .gb-xs .gb-pl .av{height:28px;width:28px;} .gb-xs .gb-pl canvas{height:28px;width:25px;} .gb-xs .gb-lv{padding:3px 10px;font-size:.78rem;}'
      + '.gb-short .gb-score b{font-size:1.5rem;} .gb-short .gb-pl b{font-size:1.45rem;} .gb-short .gb-pl .av{height:30px;} .gb-short .gb-pl canvas{height:30px;width:27px;} .gb-short .gb-s{padding:1px 9px;}'
      + '.gb-menu{position:absolute;right:8px;top:calc(100% - 2px);z-index:60;background:#fff;color:#2B2440;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.28);padding:6px;display:flex;flex-direction:column;gap:4px;min-width:190px;}'
      + '.gb-menu.hidden{display:none;}'
      + '.gb-menu button{display:flex;align-items:center;gap:10px;min-height:44px;padding:0 12px;border:0;border-radius:12px;background:#F4F1FA;font-family:' + F + ';font-weight:700;font-size:.95rem;color:inherit;cursor:pointer;text-align:left;}'
      + '.gb-menu button .gi{font-size:1.2rem;width:1.5em;text-align:center;}'
      + '.gb-pause{position:fixed;inset:0;z-index:900;background:rgba(20,16,40,.55);display:flex;align-items:center;justify-content:center;padding:16px;}'
      + '.gb-pause-card{background:var(--card,#fff);color:var(--ink,#2B2440);border-radius:22px;padding:18px 18px 16px;width:min(340px,100%);box-sizing:border-box;text-align:center;box-shadow:0 14px 40px rgba(0,0,0,.35);animation:gbpop .35s ease;}'
      + '.gb-pause-card h3{margin:0 0 12px;font-family:' + F + ';font-size:1.5rem;}'
      + '.gb-pause-card .row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}';
    const st = document.createElement('style'); st.id = 'ui-gamebar-css'; st.textContent = css; document.head.appendChild(st);
  }

  // ---------- 🧭 a page's top button → ◀ Back + 🏠 ----------
  function navBar(btn, o){
    o = o || {}; if(!btn || btn.dataset.spNav) return btn; addCss(); btn.dataset.spNav = '1';
    btn.textContent = backLabel(o.fallback); btn.title = 'Back to where you came from'; btn.setAttribute('data-sound', 'none');   // p1a-2: "◀ Algebros" 
    if(o.onclick !== false) btn.onclick = () => back(o.fallback, o.kind);
    btn._spOuter = btn.onclick; btn._spFallback = o.fallback;
    const box = document.createElement('div'); box.className = 'sp-topnav'; box.id = (btn.id || 'top') + '-nav';
    btn.parentNode.insertBefore(box, btn); box.appendChild(btn);
    if(o.home !== false){
      const h = document.createElement('button'); h.type = 'button'; h.className = btn.className.replace(/\bhidden\b/g, '') + ' sp-home'; h.id = 'home-btn';
      h.textContent = '🏠'; h.title = 'Dashboard'; h.setAttribute('aria-label', 'Dashboard'); h.setAttribute('data-sound', 'none'); h.onclick = goHome; box.appendChild(h);
    }
    const sync = () => box.classList.toggle('hidden', btn.classList.contains('hidden') || btn.style.display === 'none');
    sync(); new MutationObserver(sync).observe(btn, {attributes: true, attributeFilter: ['class', 'style']});
    return btn;
  }

  // p1b: pages with inner screens (Maze 🎨 theme, Checkers 👫 friend…): ONE back per screen — on an inner screen the top button names the
  // page's main screen and goes there ('◀ Maze'), on the main screens it leaves the page (UI.backLabel). Call from showScreen(name).
  function navScreen(btn, name, inner){
    if(!btn) return; if(!btn._spOuter) btn._spOuter = btn.onclick || (() => back());
    const i = inner && inner[name];
    if(i){ btn.textContent = i[0]; btn.onclick = i[1]; btn.title = 'Back'; }
    else { btn.textContent = backLabel(btn._spFallback); btn.onclick = btn._spOuter; btn.title = 'Back to where you came from'; }
  }

  // ---------- 🎛️ the bar ----------
  const fmt = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const SEAT_COLS = ['#4DA3FF', '#FF6B9A', '#3DDC97', '#FFB020'], BOT_COL = '#A78BFA';   // p1a-3: player 1 blue · 2 pink · 3 green · 4 amber · 🤖 violet
  function gameBar(el, o){
    o = o || {}; addCss();
    if(!el) return null;
    el.classList.add('gb'); el.innerHTML = '';
    const mk = (tag, cls, html) => { const e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; };
    const btn = (cls, html, title, fn, snd) => { const b = mk('button', 'gb-b ' + cls, html); b.type = 'button'; if(title){ b.title = title; b.setAttribute('aria-label', title); } b.setAttribute('data-sound', snd || 'tap');
      b.onclick = e => { e.stopPropagation(); closeMenu(); if(fn) fn(e); }; return b; };
    const paused = () => { try{ o.pause && o.pause.pause && o.pause.pause(); }catch(e){} };
    const resumed = () => { try{ o.pause && o.pause.resume && o.pause.resume(); }catch(e){} };
    const playing = () => { try{ return !!(o.playing && o.playing()); }catch(e){ return false; } };
    function leave(then){
      const go = () => { try{ o.onLeave && o.onLeave(); }catch(e){} then(); };
      if(!playing()) return go();
      paused();
      UI.confirm({icon: '◀', title: 'Leave the game?', body: 'This game will not be saved.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(ok) go(); else resumed(); });
    }
    const doBack = () => leave(() => back(o.fallback));
    const doHome = () => leave(goHome);

    // ◀ Back · 🎚️ Levels · 🏠
    const nav = mk('div', 'gb-g gb-seg gb-nav');
    const bBack = btn('gb-back', '<span class="gb-arr">◀</span><span class="gt"></span>', 'Back to where you came from', doBack, 'none');
    bBack.querySelector('.gt').textContent = ' ' + backLabel(o.fallback).slice(2);   // p1a-2: names where it goes — "◀ Gameroom", "◀ Artifactory" …
    nav.appendChild(bBack);
    let bLv = null;
    if(o.levels){ bLv = btn('gb-lvb', '<span class="gb-stairs" aria-hidden="true"><i></i><i></i><i></i></span><span class="gt"> Levels</span>', 'Pick another level', () => o.levels(), 'tap'); nav.appendChild(bLv); }
    const bHome = btn('gb-i gb-home', '🏠', 'Dashboard', doHome, 'none'); nav.appendChild(bHome);
    // icon · name · level
    const title = mk('div', 'gb-g gb-title');
    title.innerHTML = '<span class="gb-ic"></span><span class="gb-nm"></span>';
    title.querySelector('.gb-ic').textContent = o.icon || '🎮'; title.querySelector('.gb-nm').textContent = o.name || '';
    const lvg = mk('div', 'gb-g gb-lvg', '<span class="gb-lv"></span>'), lvEl = lvg.firstChild; if(o.levelId) lvEl.id = o.levelId;
    const br = mk('i', 'gb-br');
    // numbers
    const stats = mk('div', 'gb-g gb-stats'), board = mk('div', 'gb-board'); stats.appendChild(board);
    // ⏸ ❓ extras ⚙️
    const tools = mk('div', 'gb-g gb-seg gb-tools');
    let bPause = null;
    if(o.pause && o.pauseButton){ bPause = btn('gb-i gb-pz', '<span class="gb-pzi" aria-hidden="true"><i></i><i></i></span>', 'Pause', () => pauseCard(), 'tap'); tools.appendChild(bPause); }
    let bHelp = null;
    if(o.help !== false){
      bHelp = btn('gb-i gb-help', '❓', 'How to play', () => {
        const fn = typeof o.help === 'function' ? o.help : null;
        if(fn) return fn();
        const h = UI.gameHelp && UI.gameHelp(o.game, o.name, o.icon); if(!h) return;
        paused(); UI.guide([h]).then(resumed, resumed);
      }, 'tap');
      bHelp.setAttribute('data-howto', '1'); tools.appendChild(bHelp);
    }
    const extras = {}; const xs = (o.extras || []).filter(x => !x.keep), keeps = (o.extras || []).filter(x => x.keep);
    // p1b: "keep" extras = the game's own action buttons (↶ Undo, 💡 Hint, ⏸ Pause, 🏁 Finish, 🔄 New maze): always visible, real <button>s
    // with the game's id, so the game's old code (textContent / disabled / .hidden) keeps working unchanged
    keeps.forEach(x => { const b = btn('gb-k', '', x.label, () => x.onClick && x.onClick(), x.sound || 'tap'); if(x.id) b.id = x.id; b.innerHTML = x.html || ''; if(!x.html) b.textContent = x.icon || '•'; if(x.cls) b.className += ' ' + x.cls; if(x.hidden) b.classList.add('hidden'); tools.appendChild(b); });
    xs.forEach(x => { const b = btn('gb-i gb-x', '', x.label, () => x.onClick && x.onClick(), 'tap'); b.id = x.id ? x.id : ''; extras[x.id] = {x: x, b: b}; tools.appendChild(b); });
    let bGear = null, menu = null;
    if(xs.length){
      bGear = btn('gb-i gb-gear', '⚙️', 'More', () => toggleMenu(), 'tap'); tools.appendChild(bGear);
      menu = mk('div', 'gb-menu hidden');
      xs.forEach(x => { const r = mk('button', '', ''); r.type = 'button'; r.setAttribute('data-sound', 'tap'); r.onclick = e => { e.stopPropagation(); closeMenu(); x.onClick && x.onClick(); }; extras[x.id].r = r; menu.appendChild(r); });
    }
    function paintExtra(id){ const E = extras[id]; if(!E) return; E.b.textContent = E.x.icon || '•'; E.b.title = E.x.label || ''; E.b.setAttribute('aria-label', E.x.label || '');
      E.b.classList.toggle('hidden', !!E.x.hidden); if(E.r){ E.r.innerHTML = '<span class="gi"></span><span></span>'; E.r.firstChild.textContent = E.x.icon || '•'; E.r.lastChild.textContent = E.x.label || ''; E.r.style.display = E.x.hidden ? 'none' : ''; } }
    Object.keys(extras).forEach(paintExtra);
    function toggleMenu(){ if(!menu) return; menu.classList.toggle('hidden'); }
    function closeMenu(){ if(menu) menu.classList.add('hidden'); }
    document.addEventListener('pointerdown', e => { if(menu && !menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== bGear) closeMenu(); }, true);
    el.appendChild(nav); el.appendChild(title); el.appendChild(lvg); el.appendChild(br); el.appendChild(stats); el.appendChild(tools); if(menu) el.appendChild(menu);

    // ⏸ pause card
    function pauseCard(){
      paused();
      const m = mk('div', 'gb-pause'); m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
      m.innerHTML = '<div class="gb-pause-card"><h3>⏸ Paused</h3><div class="row"></div></div>';
      const row = m.querySelector('.row'), close = () => { m.remove(); document.removeEventListener('keydown', onKey); };
      const add = (cls, txt, fn) => { const b = mk('button', 'sp-btn ' + cls, ''); b.type = 'button'; b.textContent = txt; b.onclick = () => { close(); fn(); }; row.appendChild(b); return b; };
      add('sp-secondary', '◀ Back', () => { resumed(); doBack(); });
      if(o.levels) add('sp-secondary', '🎚️ Levels', () => { resumed(); o.levels(); });
      const go = add('sp-primary sp-lg', '▶ Resume', resumed);
      const onKey = e => { if(e.key === 'Escape' || e.key === 'Enter'){ e.preventDefault(); close(); resumed(); } };
      document.addEventListener('keydown', onKey); document.body.appendChild(m); try{ go.focus(); }catch(e){}
    }

    // ---------- slots ----------
    const slots = {};
    function slot(key, cls, html){ let s = slots[key]; if(!s){ s = mk('span', 'gb-s ' + cls, html); s.dataset.k = key; slots[key] = s;   /* p1c: data-k = the slot's key (tests: [data-k="c:rows"]) */ board.appendChild(s); needFit(); } return s; }
    function pop(e, cls){ e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); }
    function setNum(e, v, popCls){ const b = e.querySelector('b'), was = b.textContent, nv = String(v); if(was === nv) return false; b.textContent = nv; if(was !== '' && popCls) pop(e, popCls);
      if(was.length !== nv.length && mode && el.offsetParent) requestAnimationFrame(() => { if(over()) fit(true); });   // a number got a digit longer → only re-fit if it no longer fits
      return true; }
    let plBox = null; const pls = {};
    const bar = {
      el: el,
      level(text, cls){ lvEl.dataset.full = text || ''; lvEl.title = text || ''; lvEl.textContent = el.classList.contains('gb-nano') ? glyph1(text || '') : (text || ''); lvEl.className = 'gb-lv' + (cls ? ' ' + cls : ''); needFit(); return bar; },
      score(n){ const s = slot('score', 'gb-score', '<i>⭐</i><b></b>'); s.title = 'Score'; const sb = s.querySelector('b'); if(o.scoreMin && !s.dataset.mw){ s.dataset.mw = 1; Object.assign(sb.style, {minWidth: o.scoreMin, maxWidth: o.scoreMin, display: 'inline-block', whiteSpace: 'nowrap', overflow: 'visible', transformOrigin: '0 50%'}); }   /* p1c: scoreMin (e.g. '8ch') = a FIXED room for the score from the start → the bar never changes size while the score grows */
        if(o.scoreMin){ const N = parseFloat(o.scoreMin) || 8, len = String(n == null ? 0 : n).length, t = len > N ? 'scale(' + (N / len).toFixed(3) + ')' : ''; if(sb.style.transform !== t) sb.style.transform = t; }   /* longer than the room → the digits shrink a little instead */ s.classList.remove('hidden'); setNum(s, n == null ? 0 : n, 'gb-pop'); return bar; },
      players(list){
        if(!plBox){ plBox = mk('div', 'gb-pls'); board.appendChild(plBox); }
        const keep = {}; let seat = 0;
        (list || []).forEach(p => {
          const k = String(p.k != null ? p.k : p.name); keep[k] = 1; let c = pls[k];
          if(!c){ c = mk('span', 'gb-s gb-pl', '<span class="av"></span><span class="nm"></span><b></b>'); c.dataset.k = k; pls[k] = c; plBox.appendChild(c); needFit(); }
          if(p.av !== undefined){ const av = c.querySelector('.av'); av.innerHTML = ''; if(p.av && p.av.nodeType) av.appendChild(p.av); else av.textContent = p.av || ''; }
          if(p.name !== undefined) c.querySelector('.nm').textContent = p.name;
          if(p.score !== undefined) setNum(c, p.score, 'gb-pop');
          if(p.on !== undefined) c.classList.toggle('on', !!p.on);
          if(p.col || p.bot !== undefined || !c.style.getPropertyValue('--pc')) c.style.setProperty('--pc', p.col || (p.bot ? BOT_COL : SEAT_COLS[seat % SEAT_COLS.length]));
          if(!p.bot) seat++;
        });
        plBox.classList.toggle('two', Object.keys(pls).length === 2); plBox.classList.toggle('has-on', !!plBox.querySelector('.gb-pl.on'));
        if(list && list.length) Object.keys(pls).forEach(k => { if(!keep[k] && list.full !== false){ pls[k].remove(); delete pls[k]; needFit(); } });
        return bar;
      },
      on(k){ Object.keys(pls).forEach(x => pls[x].classList.toggle('on', x === String(k))); if(plBox) plBox.classList.toggle('has-on', !!plBox.querySelector('.gb-pl.on')); return bar; },
      miss(n){ const s = slot('miss', 'gb-miss', '❌ <b></b>'); s.title = 'Mistakes'; const was = Number(s.querySelector('b').textContent) || 0; setNum(s, n || 0); s.classList.toggle('bad', n > 0); if(n > was) pop(s, 'gb-shake'); return bar; },
      lives(n, warn){ const s = slot('lives', 'gb-lives', '❤️ <b></b>'); s.title = 'Lives'; const was = Number(s.querySelector('b').textContent); setNum(s, n); s.classList.toggle('warn', !!warn); s.classList.remove('hidden'); if(n < was) pop(s, 'gb-shake'); return bar; },   // p1c: warn (last life)
      time(v, warn){ const s = slot('time', 'gb-time', '⏱ <b></b>'); s.title = 'Time'; setNum(s, typeof v === 'number' ? fmt(v) : (v || '0:00')); s.classList.toggle('warn', !!warn); s.classList.remove('hidden'); return bar; },
      round(a, b){ const s = slot('round', 'gb-round', '🔁 <b></b>'); s.title = 'Round'; setNum(s, a + '/' + b); return bar; },
      count(key, icon, v, title, warn){ const s = slot('c:' + key, 'gb-cnt', '<i style="font-style:normal"></i> <b></b>'); s.querySelector('i').textContent = icon; if(title) s.title = title; setNum(s, v); s.classList.toggle('warn', !!warn); s.classList.remove('hidden'); return bar; },
      meter(key, icon, frac, title, warn){ const s = slot('m:' + key, 'gb-meter', '<i style="font-style:normal"></i><span class="gb-mt"><u></u></span>'); s.querySelector('i').textContent = icon; if(title) s.title = title;   // p1c: a little progress bar (Stack It! tower → 🏁)
        const w = Math.round(Math.max(0, Math.min(1, frac || 0)) * 100) + '%', u = s.querySelector('u'); if(u.style.width !== w) u.style.width = w; s.classList.toggle('full', frac >= 1); s.classList.toggle('warn', !!warn); s.classList.remove('hidden'); return bar; },
      badge(key, text){ const s = slots[key] || slots['c:' + key] || slots['m:' + key]; if(!s) return bar; let e = s.querySelector('.gb-bdg');   // p1c: a small badge ON a slot (🔥 combo) — never changes the bar's size
        if(!text){ if(e) e.remove(); return bar; } if(!e){ e = mk('em', 'gb-bdg', ''); s.appendChild(e); } if(e.textContent !== String(text)){ e.textContent = text; pop(e, 'gb-pop'); } return bar; },
      adopt(key, node){ if(!node) return bar; const k = 'a:' + key; if(slots[k]) return bar;   // p1d: a game's OWN info pill moves into the scoreboard (its id + the game's code stay)
        node.classList.remove('pill', 'grow'); node.classList.add('gb-s', 'gb-ad'); node.dataset.k = k; slots[k] = node; board.appendChild(node); needFit(); return bar; },
      keepBtn(b){ if(!b) return bar; b.classList.remove('pill', 'big'); b.classList.add('gb-b', 'gb-k'); if(!b.type) b.type = 'button'; tools.insertBefore(b, tools.firstChild); needFit(); return bar; },   // p1d: a game's own button joins the toolbar as it is
      custom(key, node){ let s = slots['u:' + key]; if(!s){ s = mk('div', 'gb-cu', ''); s.dataset.k = 'u:' + key; slots['u:' + key] = s; stats.appendChild(s); needFit(); }   // p1c: a game's own HUD art (🥊 fighter bars, 🗺️ hero cards) inside the bar
        if(node && node.parentNode !== s){ s.innerHTML = ''; s.appendChild(node); needFit(); } return bar; },
      left(ms, warn){ const s = slot('left', 'gb-left', '⌛ <b></b>'); s.title = 'Play time left'; setNum(s, fmt(ms / 1000)); s.classList.toggle('warn', !!warn); return bar; },
      hide(key, h){ const s = slots[key] || slots['c:' + key] || slots['m:' + key] || slots['u:' + key] || slots['a:' + key]; if(s) s.classList.toggle('hidden', h !== false); needFit(); return bar; },
      extra(id, ch){ const E = extras[id]; if(!E) return bar; Object.assign(E.x, ch || {}); paintExtra(id); return bar; },
      back: doBack, home: doHome, leave: leave, fit: () => fit(true), pauseCard: pauseCard,
      buttons: {back: bBack, levels: bLv, home: bHome, help: bHelp, pause: bPause, gear: bGear}
    };

    // ---------- fit: one row → two rows → icons ----------
    let mode = '', lastW = -1, fitTimer = 0;
    function over(){
      if(el.scrollWidth > el.clientWidth + 1) return true;
      for(const g of [nav, title, lvg, stats, board, tools]) if(g.scrollWidth > g.clientWidth + 1) return true;
      const nm = title.querySelector('.gb-nm'); if(nm.textContent && nm.offsetParent && nm.scrollWidth > nm.clientWidth + 1) return true;
      const mid = g => g.offsetTop + g.offsetHeight / 2, row = mid(nav);   // same row = same centre line (items are centred, tops differ)
      if(Math.abs(mid(tools) - row) > 6 || Math.abs(mid(title) - row) > 6) return true;
      if(!el.classList.contains('gb-tight') && lvEl.textContent && Math.abs(mid(lvg) - row) > 6) return true;
      if(!el.classList.contains('gb-two') && Math.abs(mid(stats) - row) > 6) return true;
      if(el.classList.contains('gb-tight') && lvEl.textContent && Math.abs(mid(lvg) - mid(stats)) > 6 && !el.classList.contains('gb-nano')) return true;   // row 2 = level + numbers (p1c: micro too — only nano may give the level its own row)
      return false;
    }
    function fit(force){
      if(!el.offsetParent && getComputedStyle(el).position !== 'fixed') return;
      const w = el.clientWidth + 'x' + innerHeight; if(!force && w === lastW) return; lastW = w; const h0 = el.offsetHeight;
      const was = mode;
      // short screens (phone on its side) keep ONE row as long as they can: hide the name / extras / player names first
      el.classList.toggle('gb-short', innerHeight < 700); el.classList.toggle('gb-xs', innerHeight < 620);   // p1b: very short screens (375×560, phone on its side) = a lower bar
      const STAGES = (innerHeight < 520 ? ['gb-slim'] : []).concat(['gb-two', 'gb-tight', 'gb-tiny', 'gb-micro', 'gb-nano']);   // p1c: nano = smaller numbers, level chip shortens
      el.classList.remove('gb-slim', 'gb-two', 'gb-tight', 'gb-tiny', 'gb-micro', 'gb-nano'); mode = 'one';
      if(lvEl.dataset.full != null && lvEl.textContent !== lvEl.dataset.full) lvEl.textContent = lvEl.dataset.full;
      for(const c of STAGES){ if(!over()) break; el.classList.add(c); mode = c.slice(3); if(c === 'gb-nano' && lvEl.dataset.full) lvEl.textContent = glyph1(lvEl.dataset.full); }   // p1c: nano = the level chip keeps only its icon (🐣), full name on hover
      el.dataset.fit = mode;
      if((was !== mode || Math.abs(el.offsetHeight - h0) > 1) && o.onFit) try{ o.onFit(mode); }catch(e){}   // bar got taller / lower (also the FIRST fit, after the game's first layout — p1b) → re-lay the board
    }
    function glyph1(t){ try{ if(window.Intl && Intl.Segmenter){ for(const x of new Intl.Segmenter(undefined, {granularity: 'grapheme'}).segment(t)) return x.segment; } }catch(e){} return Array.from(t)[0] || ''; }
    function needFit(){ clearTimeout(fitTimer); fitTimer = setTimeout(() => fit(true), 0); }
    try{ new ResizeObserver(() => fit(false)).observe(el); }catch(e){ addEventListener('resize', () => fit(false)); }
    return bar;
  }

  // p1d: turn a game's EXISTING top bar (◀ pill + info pills + buttons) into the shared bar in place — the game's ids and code keep working:
  //   the ◀ pill's click = 🎚️ Levels (the game's own leave / level-picker step), a ❓ button = the bar's ❓, info pills (span) → scoreboard slots,
  //   other boxes (meters, clocks) → custom slots, other buttons → toolbar buttons. opts as gameBar (+ levels to override).
  function gameBarFrom(el, o){
    o = Object.assign({}, o || {}); if(!el) return null; if(el._gb) return el._gb;
    const kids = [...el.children], isBtn = k => k.tagName === 'BUTTON';
    const back = kids.find(k => isBtn(k) && /^\s*[◀⬅]\s*$/.test(k.textContent)), help = kids.find(k => isBtn(k) && /^\s*❓\s*$/.test(k.textContent));
    if(!o.levels && back) o.levels = () => back.click();
    if(o.help === undefined && help) o.help = () => help.click();
    const slotBtn = k => isBtn(k) && k.dataset.gb === 'slot';   // a button that SHOWS something (Mini games' stage picker) → a scoreboard slot
    const keep = kids.filter(k => isBtn(k) && k !== back && k !== help && !slotBtn(k)), info = kids.filter(k => (!isBtn(k) || slotBtn(k)) && !k.classList.contains('sp'));
    kids.forEach(k => { if(k !== back && k !== help) k.remove(); });
    [back, help].forEach(k => { if(k){ k.remove(); k.style.display = 'none'; document.body.appendChild(k); } });   // kept (hidden) so .click() still runs the game's handler
    const bar = gameBar(el, o);
    info.forEach((k, i) => { if(k.tagName === 'SPAN' || slotBtn(k)) bar.adopt(k.id || ('i' + i), k); else bar.custom(k.id || ('u' + i), k); });
    keep.reverse().forEach(b => bar.keepBtn(b));
    el._gb = bar; return bar;
  }
  // p1c: a game's own ⏸ / ▶ button (Snakize, Soul Bopper…) shows the same drawn icons as the bar — call instead of setting '⏸' / '▶' text
  function pauseIcon(btn, paused){ if(!btn) return; const h = paused ? '<span class="gb-pli" aria-hidden="true"></span>' : '<span class="gb-pzi" aria-hidden="true"><i></i><i></i></span>'; if(btn.innerHTML !== h) btn.innerHTML = h; btn.title = paused ? 'Play on (P)' : 'Pause (P)'; btn.classList.toggle('gb-on', !!paused); }
  Object.assign(window.UI, {gameBar: gameBar, back: back, backInfo: backInfo, backLabel: backLabel, pageName: pageName, navBar: navBar, navScreen: navScreen, goHome: goHome, spButtonsCss: addCss, pauseIcon: pauseIcon, gameBarFrom: gameBarFrom});
  addCss();
})();
/* ================= 📏 PAGE ROWS (p2 — Polish Sprint P2, Aowu 2026-11-12 F3: "no sideways scrolling buttons — all must show on screen") =================
   A row of chips / cards / skins NEVER scrolls sideways. It wraps into lines; when it would need more than `rows` lines it turns into
   PAGES with ‹ · dots · › under it (and a sideways swipe on the row flips the page). Kids see every choice, nothing hides off the edge.

   UI.pageRow(el, {rows: 2, swipe: true}) → {lay(), go(n), page(), pages()}   — one row (re-calling it re-lays the same row)
   UI.pageRows(selector, opts)                                                — every row matching the selector, now AND later (rows built by
                                                                                the game after the page loads are picked up automatically)
   • the page that holds the picked item (.on / .sel / .picked / .active / aria-pressed / aria-selected) is shown after each re-lay
   • re-lays itself when the row's width changes or the game rebuilds its children; a hidden row lays out when it appears
   • rows: how many lines one page may use (chips: 3 = usually no pages at all; skins: 2)
   • nav: false = no ‹ · › bar (the game already has its own ⬅️ ➡️ and calls row.__pr.lay(true) when the pick moves — WisDeck 📚 Learn strip)
   • edge: true = the ‹ › sit INSIDE the row on its left / right edge (no dots, no extra height) — for rows inside a tight play layout
     (Stack It! shelf: pieces keep their size, ‹ › flip the pieces)
   • swipe: false for rows whose items are dragged (Stack It! shelf) — then only ‹ › and the dots flip pages
   • the row keeps its own classes / ids, so game code + tests still find their chips; items on other pages get .ui-pr-off (display:none)
*/
(function(){
  if (window.UI && UI.pageRow) return;
  const SEL = '.on, .sel, .picked, .active, .selected, [aria-pressed="true"], [aria-selected="true"]';
  function css(){
    if (document.getElementById('ui-pr-css')) return;
    const st = document.createElement('style'); st.id = 'ui-pr-css';
    st.textContent =
      '.ui-pr.ui-pr-row{flex-wrap:wrap !important;overflow-x:hidden !important;scroll-snap-type:none !important;justify-content:center !important;max-width:100%;}' +
      '.ui-pr > *{scroll-snap-align:none !important;}' +
      '.ui-pr > .ui-pr-off{display:none !important;}' +
      '.ui-prn{display:flex;align-items:center;justify-content:center;gap:4px;margin:2px auto 6px;min-height:36px;}' +
      '.ui-prn[hidden]{display:none !important;}' +
      '.ui-pr.ui-pre-on{position:relative;padding-left:42px !important;padding-right:42px !important;}' +
      '.ui-prn.ui-pre{position:absolute;left:2px;right:2px;top:50%;transform:translateY(-50%);margin:0;justify-content:space-between;pointer-events:none;min-height:0;}' +
      '.ui-prn.ui-pre .ui-pra{pointer-events:auto;} .ui-prn.ui-pre .ui-prd, .ui-prn.ui-pre .ui-prc{display:none;}' +
      '.ui-prn button{all:unset;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent;display:inline-flex;align-items:center;justify-content:center;}' +
      '.ui-prn .ui-pra{width:36px;height:36px;border-radius:50%;background:var(--card,#fff);color:var(--ink,#2b2b2b);font:800 1.15rem/1 Fredoka,Nunito,sans-serif;box-shadow:0 2px 0 rgba(0,0,0,.18);}' +
      '.ui-prn .ui-pra:disabled{opacity:.3;cursor:default;}' +
      '.ui-prn .ui-prd{width:22px;height:30px;}' +
      '.ui-prn .ui-prd::after{content:"";width:9px;height:9px;border-radius:50%;background:var(--ink-soft,#8a8a8a);opacity:.45;transition:transform .15s,opacity .15s;}' +
      '.ui-prn .ui-prd.on::after{opacity:1;transform:scale(1.35);background:var(--terracotta,#e07a5f);}' +
      '.ui-prn .ui-prc{font:700 .78rem/1 Nunito,sans-serif;color:var(--ink-soft,#777);margin:0 4px;min-width:2.6em;text-align:center;}' +
      '@keyframes uiPrIn{from{opacity:.25;transform:translateX(var(--pr-dx,0))}to{opacity:1;transform:none}}' +
      '.ui-pr.ui-pr-flip > :not(.ui-pr-off){animation:uiPrIn .22s ease-out;}' +
      '@media (prefers-reduced-motion:reduce){.ui-pr.ui-pr-flip > *{animation:none;}}';
    (document.head || document.documentElement).appendChild(st);
  }
  function pageRow(el, o){
    if (!el) return null;
    if (el.__pr) { if (o) Object.assign(el.__pr.o, o); el.__pr.lay(true); return el.__pr; }
    css();
    o = Object.assign({rows: 2, swipe: true}, o || {});
    el.classList.add('ui-pr');
    const nav = document.createElement('div'); nav.className = 'ui-prn'; nav.hidden = true; nav.setAttribute('role', 'group'); nav.setAttribute('aria-label', 'More choices');
    if (o.edge) { nav.classList.add('ui-pre'); el.appendChild(nav); } else el.insertAdjacentElement('afterend', nav);
    let page = 0, pages = 1, map = new Map(), lastW = -1, busy = false, raf = 0;
    const kids = () => [...el.children].filter(c => c !== nav);
    function lay(keepSel){
      busy = true;
      if (o.edge && nav.parentNode !== el) el.appendChild(nav);
      const all = kids(); all.forEach(c => c.classList.remove('ui-pr-off'));
      if (/^column/.test(getComputedStyle(el).flexDirection)) {        // a column (Stack It! shelf on a phone held sideways) is not a row: leave it
        el.classList.remove('ui-pr-row', 'ui-pre-on'); map = new Map(); pages = 1; page = 0; paint(); lastW = el.clientWidth; busy = false; return;
      }
      el.classList.add('ui-pr-row'); if (o.edge) el.classList.add('ui-pre-on');
      const shown = all.filter(c => c.getClientRects().length && getComputedStyle(c).display !== 'none');
      map = new Map(); let line = -1, bottom = -1e9;
      for (const c of shown) {                                   // a new line starts below the lowest item of the line before
        const t = c.offsetTop, b = t + c.offsetHeight;
        if (line < 0 || t >= bottom - 2) { line++; bottom = b; } else bottom = Math.max(bottom, b);
        map.set(c, Math.floor(line / Math.max(1, o.rows)));
      }
      pages = shown.length ? Math.floor(line / Math.max(1, o.rows)) + 1 : 1;
      if (o.edge && pages <= 1) el.classList.remove('ui-pre-on');
      if (keepSel || page >= pages) { const s = shown.find(c => c.matches(SEL) || c.querySelector(SEL)); page = s ? map.get(s) : Math.min(page, pages - 1); }
      paint(); lastW = el.clientWidth;
      busy = false;
    }
    function paint(){
      for (const [c, p] of map) c.classList.toggle('ui-pr-off', p !== page);
      el.dataset.page = page; el.dataset.pages = pages;
      nav.hidden = pages <= 1 || o.nav === false;
      if (pages <= 1 || o.nav === false) { nav.innerHTML = ''; return; }
      let h = '<button type="button" class="ui-pra" data-pr="-1" aria-label="Back a page"' + (page ? '' : ' disabled') + '>‹</button>';
      if (pages <= 8) for (let i = 0; i < pages; i++) h += '<button type="button" class="ui-prd' + (i === page ? ' on' : '') + '" data-pg="' + i + '" aria-label="Page ' + (i + 1) + '"></button>';
      else h += '<span class="ui-prc">' + (page + 1) + ' / ' + pages + '</span>';
      h += '<button type="button" class="ui-pra" data-pr="1" aria-label="Next page"' + (page < pages - 1 ? '' : ' disabled') + '>›</button>';
      nav.innerHTML = h;
    }
    function go(n, dir){
      n = Math.max(0, Math.min(pages - 1, n)); if (n === page) return;
      busy = true; page = n; paint();
      el.style.setProperty('--pr-dx', (dir || 1) * 18 + 'px'); el.classList.remove('ui-pr-flip'); void el.offsetWidth; el.classList.add('ui-pr-flip');
      busy = false;
      if (window.UISound && UISound.play) try { UISound.play('tick'); } catch (e) {}
    }
    nav.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return; e.preventDefault(); e.stopPropagation();
      if (b.dataset.pr) go(page + Number(b.dataset.pr), Number(b.dataset.pr)); else go(Number(b.dataset.pg), Number(b.dataset.pg) > page ? 1 : -1);
    });
    if (o.swipe) {                                               // a clear sideways swipe on the row flips the page; taps still tap
      let sx = 0, sy = 0, st = 0, eat = 0;
      el.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; st = 1; }, {passive: true});
      el.addEventListener('pointerup', e => { if (!st || pages <= 1) return; st = 0; const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) { go(page + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); eat = performance.now(); } }, {passive: true});
      el.addEventListener('pointercancel', () => { st = 0; }, {passive: true});
      el.addEventListener('click', e => { if (performance.now() - eat < 350) { e.preventDefault(); e.stopPropagation(); } }, true);
    }
    const later = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; lay(true); }); };
    if (window.ResizeObserver) new ResizeObserver(() => { if (!busy && el.clientWidth !== lastW) later(); }).observe(el);
    new MutationObserver(() => { if (!busy) later(); }).observe(el, {childList: true});
    const api = {o, lay, go: n => go(n), page: () => page, pages: () => pages, nav};
    el.__pr = api; lay(true);
    return api;
  }
  // every row that matches, now and later
  const WATCH = [];
  function pageRows(sel, o){
    css(); WATCH.push([sel, o]);
    const scan = root => { for (const [s, oo] of WATCH) { if (root.matches && root.matches(s)) pageRow(root, oo); if (root.querySelectorAll) root.querySelectorAll(s).forEach(e => { if (!e.__pr) pageRow(e, oo); }); } };
    if (!pageRows.mo) {
      pageRows.mo = new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && !(n.classList && n.classList.contains('ui-prn'))) scan(n); });
      const start = () => pageRows.mo.observe(document.body, {childList: true, subtree: true});
      if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
    }
    const go = () => scan(document.body || document.documentElement);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }
  // a game can ask: is this item on the page shown now? (tests + "jump to my pick")
  function pageRowShow(item){ const row = item && item.parentElement, pr = row && row.__pr; if (!pr) return false; pr.lay();
    for (let i = 0; i < pr.pages() && item.classList.contains('ui-pr-off'); i++) pr.go(i);
    return !item.classList.contains('ui-pr-off'); }
  // how many pictures / letters a short text shows (❌⭕ = 2, 👨‍👩‍👧 = 1)
  function glyphs(t){ t = String(t || ''); try { if (window.Intl && Intl.Segmenter) return [...new Intl.Segmenter().segment(t)].length; } catch (e) {}
    return Array.from(t).filter(c => !/[\uFE0F\u200D\u{1F3FB}-\u{1F3FF}]/u.test(c)).length; }
  window.UI = window.UI || {};
  Object.assign(window.UI, {pageRow: pageRow, pageRows: pageRows, pageRowShow: pageRowShow, glyphs: glyphs});
})();
/* ================= 📏 PAGE ROWS END (p2) ================= */
/* ================= 👆 NO ZOOM (nz-1 — Aowu 2026-11-13: "it shouldn't be zooming in game") =================
   • CSS: html, body{touch-action:manipulation} = no double-tap zoom anywhere (scroll still works; a game's own touch-action:none stays)
   • iPad / iPhone (Safari ignores user-scalable=no): pinch gestures + 2-finger page zoom are blocked; a 2nd tap within 300 ms on a PLAIN
     page area (not a button / link / input / canvas / [data-k] / anything clickable) is swallowed so it can't zoom
   • inputs ≥ 16 px on touch screens (iPhone zooms into smaller inputs when you type)
   • a page that really wants zoom (a photo viewer) puts class "ui-zoom-ok" on that element */
(function(){
  if (window.UI && UI.noZoom) return;
  const st = document.createElement('style'); st.id = 'ui-nozoom-css';
  st.textContent = 'html, body{touch-action:manipulation;-ms-touch-action:manipulation;}' +
    '@media (pointer:coarse){ input:not([type=range]):not([type=checkbox]):not([type=radio]), select, textarea{font-size:max(16px, 1em) !important;} }';
  (document.head || document.documentElement).appendChild(st);
  const touch = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
  const LOG = [];
  const okZoom = t => !!(t && t.closest && t.closest('.ui-zoom-ok'));
  const ACTIVE = 'a, button, input, select, textarea, label, canvas, svg, video, [role=button], [onclick], [data-k], [tabindex], .ui-mbtn, .chip, .btn, .sp-btn';
  if (touch) {
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => document.addEventListener(ev, e => { if (okZoom(e.target)) return; e.preventDefault(); LOG.push(ev); }, {passive: false}));
    document.addEventListener('touchmove', e => { if (e.touches && e.touches.length > 1 && e.cancelable && !okZoom(e.target)) { e.preventDefault(); LOG.push('pinch'); } }, {passive: false});   // games read pointer events, so their own 2-finger moves still work
    let last = 0;
    document.addEventListener('touchend', e => {
      const now = performance.now(), t = e.target, quick = now - last < 300; last = now;
      if (!quick || okZoom(t) || (e.touches && e.touches.length) || !e.cancelable) return;
      if (t && t.closest && t.closest(ACTIVE)) return;            // games + buttons keep their fast double taps
      e.preventDefault(); LOG.push('dbltap');
    }, {passive: false});
  }
  window.UI = window.UI || {};
  UI.noZoom = {touch: touch, log: LOG, viewport: () => { const m = document.querySelector('meta[name=viewport]'); return m ? m.content : ''; }};
})();
/* ================= 👆 NO ZOOM END (nz-1) ================= */

/* ================= 🏷️ CLASSIC TILE POINTS PICK (p4c) ================= */
(function(){
  window.UI = window.UI || {};
  const key = n => 'sp_ptab:' + (n || '');
  function get(n){ try{ return localStorage.getItem(key(n)) === 'small' ? 'small' : 'tab'; }catch(e){ return 'tab'; } }
  function set(n, v){ try{ localStorage.setItem(key(n), v === 'small' ? 'small' : 'tab'); }catch(e){} }
  function apply(n){ document.documentElement.classList.toggle('ui-pt-small', get(n) === 'small'); }
  function chips(box, n){ if(!box) return; const cur = get(n);
    box.innerHTML = [['tab', '<span class="ui-ptab">3</span>', 'Dark tab'], ['small', '<span class="old">3</span>', 'Small number']].map(([k, mini, label]) =>
      '<button class="chip ui-ptab-pick' + (k === cur ? ' on' : '') + '" data-pt="' + k + '" data-sound="tap"><span class="ui-ptab-mini">' + mini + '</span>' + label + '</button>').join('');
    box.querySelectorAll('[data-pt]').forEach(b => b.onclick = () => { set(n, b.dataset.pt); apply(n); chips(box, n); }); }
  UI.ptab = {get, set, apply, chips};
})();
/* ================= 🏷️ CLASSIC TILE POINTS PICK END (p4c) ================= */

/* ================= 🧑 GAME BUDDY (p6 — the player's avatar beside a game: idle loop + reactions, cached pictures) ================= */
(function(){
  window.UI = window.UI || {};
  const MOODS = ['idle', 'happy', 'joy', 'miss', 'win', 'lose', 'surprise', 'close'];
  const CHOSEN = {};   // player → {mood: [act keys]} — picked once per page so every canvas of that player agrees
  const ric = window.requestIdleCallback ? (f => requestIdleCallback(f, {timeout: 700})) : (f => setTimeout(f, 60));
  function choose(who, per){ const k = who.name || ''; if(CHOSEN[k]) return CHOSEN[k]; const c = {};
    MOODS.forEach(m => { const L = []; for(let i = 0; i < (m === 'idle' ? 3 : per) + 2 && L.length < (m === 'idle' ? 3 : per); i++){ const a = Acting.pick(m, {who: k + '|bd', avoid: L}); if(a && !L.includes(a)) L.push(a); } c[m] = L.length ? L : ['idle']; });
    return (CHOSEN[k] = c); }
  function buddy(cv, who, o){
    o = o || {}; if(!cv || !window.Acting || typeof drawAvatar !== 'function' || !who || !who.av) return null;
    const set = choose(who, o.per || 2), ready = {}, dpr = Math.min(2, window.devicePixelRatio || 1);
    const st = {act: set.idle[0], until: 0, idleAt: performance.now(), i: 0, timer: null, w: 0, h: 0, shown: ''};
    const opt = (w, h) => ({w, h, n: o.n || 8, loop: o.loop || 1.2, dpr, dir: o.dir || 1});
    const size = () => { const r = cv.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; };
    const key = (a, w, h) => a + '|' + w + 'x' + h;
    function warm(list){ const [w, h] = size(); if(w < 8 || h < 8) return; const todo = list.filter(a => !ready[key(a, w, h)]);
      const step = () => { const a = todo.shift(); if(a == null) return; try{ Acting.frames(who, a, opt(w, h)); ready[key(a, w, h)] = true; }catch(e){} if(todo.length) ric(step); };
      if(todo.length) ric(step); }
    const all = () => [].concat(...MOODS.map(m => set[m]));
    const nextIdle = () => set.idle[(set.idle.indexOf(st.act) + 1) % set.idle.length] || set.idle[0];
    function tick(){
      if(!cv.isConnected){ stop(); return; }
      if(cv.offsetParent === null || document.hidden) return;
      const now = performance.now(), [w, h] = size(); if(w < 8 || h < 8) return;
      if(w !== st.w || h !== st.h){ st.w = w; st.h = h; warm(o.hold ? set[o.hold].concat(set.idle) : all()); }
      if(st.until && now > st.until){ st.until = 0; st.idleAt = now; st.act = nextIdle(); st.i = 0; }
      else if(!st.until && now - st.idleAt > (o.idleMs || 6500)){ st.idleAt = now; st.act = nextIdle(); st.i = 0; }
      let a = st.act; if(!ready[key(a, w, h)]) a = set.idle.find(x => ready[key(x, w, h)]); if(a == null) return;
      const fr = Acting.frames(who, a, opt(w, h)), f = fr[st.i++ % fr.length]; st.shown = a;
      if(cv.width !== f.width || cv.height !== f.height){ cv.width = f.width; cv.height = f.height; }
      const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); g.drawImage(f, 0, 0);
    }
    function react(kind, ms){ const L = set[kind] || []; const [w, h] = size(); const okL = L.filter(a => ready[key(a, w, h)]); if(!okL.length) return false;
      const cur = okL.indexOf(st.act); st.act = okL[(cur + 1) % okL.length]; st.until = performance.now() + (ms || 1800); st.i = 0; tick(); return st.act; }
    function stop(){ clearInterval(st.timer); st.timer = null; }
    if(o.hold){ st.act = set[o.hold][0]; st.until = Infinity; }
    st.timer = setInterval(tick, 1000 / (o.fps || 8)); setTimeout(tick, 0);
    return {react, stop, state: st, moods: set, isReady: a => { const [w, h] = size(); return !!ready[key(a, w, h)]; }};
  }
  UI.buddy = buddy;
})();
/* ================= 🧑 GAME BUDDY END (p6) ================= */
/* ================= 📦 REMOTE DATA (size-1) =================
   Big data files (WisDeck cards + pictures, Lettercraft words) live on the family site, not in Apps Script (10 MB limit).
   UI.loadData(x): x = code text (📲 offline app: run it) or {src, alt} (online: load the site file, else the jsDelivr copy).
   Returns a Promise → true when it ran, false when there was nothing to load. */
(function(){
  window.UI = window.UI || {};
  UI.loadData = function(x){
    return new Promise(function(ok, no){
      if(!x) return ok(false);
      if(typeof x === 'string'){ try{ (new Function(x))(); ok(true); }catch(e){ no(e); } return; }
      var add = function(u, next){ var s = document.createElement('script'); s.charset = 'utf-8'; s.src = u; s.async = false; if(x.integrity){ s.integrity = x.integrity; s.crossOrigin = 'anonymous'; }   /* 📦 sm-1: the browser refuses a changed copy */
        s.onload = function(){ ok(true); }; s.onerror = function(){ if(next) add(next); else no(new Error('could not load ' + u)); };
        document.head.appendChild(s); };
      add(x.src, x.alt);
    });
  };
})();
/* ================= 📦 REMOTE DATA END (size-1) ================= */
/* ================= 🛡️ WD-1 NO-HANG GUARD (wd-1, ✨ polish chat 2026-11-15 — Gameroom plan gr-4b, Run Order 19d) =================
   A server call can be lost with no success AND no failure (a deploy while the page is open, a phone waking up, 5G ↔ Wi-Fi):
   then the page waits forever. This wraps google.script.run ONCE for every page that loads UiKit:
   · 🚪 opening call (a read sent before the page got any answer): no answer in UI_DEADLINE_MS (10 s) → ask again →
     still nothing → open the page again once (top link; harness: reload) → still nothing → 📡 card: 🔄 Reload · ⏳ Keep waiting · ◀ Back.
   · 📖 later reads: ask again once → still nothing → the page's own failure handler runs ("📡 the server did not answer"), so nothing hangs.
   · 💾 saves: no answer in 12 s → "⚠️ Not saved yet — will try again" + kept in a pending list (this device) → sent again after the
     next answer that works (also on the next page). A late answer = ✅ Saved and the pending copy is dropped.
   · 👀 back to the tab after > 60 s away → wdPing (tiny server call) as an opening call: a dead line is found before the kid taps.
   · Pages with their own watchdog (window.bootStuck like Pokadif, or window.UI_OWN_WATCHDOG) keep it for their reads.
   · LinkKit calls (link…) are left alone (they poll and retry themselves).
   · Off: window.UI_GUARD = false (before UiKit); never in the 📲 offline app (its server is on the device). Device check: ?deadline=1 on any page = answers are dropped → you see the steps.
   UI.wd = {active, calls(), pending(), card(), log} for tests. */
(function(){
  window.UI = window.UI || {};
  const WD = {active: false, seq: 0, calls: {}, answered: false, t0: Date.now(), log: [], card: null, dead: false, stamp: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), url: '', hiddenAt: 0, reloaded: false, toasts: 0};
  const OPEN_MS = () => (window.UI_DEADLINE_MS > 0 ? window.UI_DEADLINE_MS : 10000);   // Apps Script can take 5–8 s on a cold start
  const SAVE_MS = () => OPEN_MS() + 2000;
  const READ_MS = () => OPEN_MS() + 2000;
  const SKIP = /^(link|include|doGet|doPost)/;
  const READ = /^(get|load|list|read|check|find|fetch|search|lookup|wdPing|ping|peek|count|is|has|which|who|my|preview|verify|describe|artDescribe|artRequest)/i;
  const QUIET = /^(markModeTried|markItemsSeen|playedFamilySong|saveRoomStats|saveGhost)$/;
  const PKEY = 'sp_wd_pending', RKEY = 'sp_wd_reload';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const note = (what, c) => { WD.log.push({t: Date.now() - WD.t0, what: what, fn: c && c.fn, id: c && c.id}); if(WD.log.length > 200) WD.log.shift(); };
  const toast = (m, k) => { try { WD.toasts++; UI.toast && UI.toast(m, k); } catch(e){} };
  const own = () => window.UI_OWN_WATCHDOG || typeof window.bootStuck === 'function';

  // ----- pending saves (this device; survive a reload so the next page can send them) -----
  function pend(){ try { const a = JSON.parse(localStorage.getItem(PKEY) || '[]'); return Array.isArray(a) ? a.filter(x => x && Date.now() - x.at < 864e5) : []; } catch(e){ return []; } }
  function setPend(a){ try { if(a.length) localStorage.setItem(PKEY, JSON.stringify(a.slice(-30))); else localStorage.removeItem(PKEY); } catch(e){} }
  function pendAdd(c){ const a = pend(); if(!a.some(x => x.page === WD.stamp && x.id === c.id)){ a.push({page: WD.stamp, id: c.id, fn: c.fn, args: c.args, at: Date.now(), n: 0}); setPend(a); } }
  function pendDrop(page, id){ setPend(pend().filter(x => !(x.page === page && x.id === id))); }

  // ----- the real runner underneath -----
  let ORIG = null;
  function fire(c){
    c.sent = (c.sent || 0) + 1;
    let r = ORIG();
    r = r.withSuccessHandler(function(v){ done(c, true, v); }).withFailureHandler(function(e){ done(c, false, e); });
    if(c.u !== undefined) r = r.withUserObject(c.u);
    r[c.fn].apply(r, c.args);
  }
  function plain(fn, args, s, f, u){
    let r = ORIG(); if(s) r = r.withSuccessHandler(s); if(f) r = r.withFailureHandler(f); if(u !== undefined) r = r.withUserObject(u);
    return r[fn].apply(r, args);
  }
  function send(fn, args, s, f, u){
    if(!WD.active || SKIP.test(fn) || window.UI_GUARD === false) return plain(fn, args, s, f, u);
    const read = READ.test(fn);
    const c = {id: ++WD.seq, fn: fn, args: args, s: s, f: f, u: u, t0: Date.now(), tries: 0, done: false,
      kind: read ? ((!WD.answered && Date.now() - WD.t0 < 20000) || fn === 'wdPing' ? 'open' : 'read') : 'save'};
    if(read && own()) c.kind = 'own';   // the page has its own card for its reads (Pokadif)
    WD.calls[c.id] = c; note('send ' + c.kind, c);
    fire(c);
    if(c.kind !== 'own') arm(c, c.kind === 'open' ? OPEN_MS() : c.kind === 'read' ? READ_MS() : SAVE_MS());
  }
  function arm(c, ms){ clearTimeout(c.timer); c.timer = setTimeout(() => late(c), ms); }
  function late(c){
    c.timer = null; if(c.done) return;
    if(document.hidden){ c.waitVis = true; return; }   // the app is in the background: decide a moment after it is back
    if(c.kind === 'save'){
      if(c.pending) return;
      c.pending = true; pendAdd(c); note('pending', c);
      if(!QUIET.test(c.fn) && !WD.saveToast){ WD.saveToast = true; c.toasted = true; toast('⚠️ Not saved yet — will try again', 'err'); setTimeout(() => { WD.saveToast = false; }, 6000); }
      return;
    }
    if(c.tries === 0){ c.tries = 1; note('ask again', c); fire(c); arm(c, c.kind === 'open' ? OPEN_MS() : READ_MS()); return; }
    if(c.kind === 'read'){
      c.done = true; note('give up', c); toast('📡 The server did not answer — please try again', 'err');
      if(c.f) try { c.f({message: '📡 The server did not answer — please try again', timeout: true}, c.u); } catch(e){ setTimeout(() => { throw e; }); }
      return;
    }
    stuck(c);
  }
  function stuck(c){
    if(WD.card) return;
    if(!WD.reloaded && reloadOnce()){ note('reload', c); return; }
    note('card', c); card(true);
  }
  function done(c, ok, v){
    if(WD.dead){ note('dropped (deadline=1)', c); return; }   // device check: act as if the answer never came
    WD.answered = true;
    if(c.done){ if(c.pending){ c.pending = false; pendDrop(WD.stamp, c.id); } return; }
    c.done = true; clearTimeout(c.timer); note(ok ? 'ok' : 'fail', c);
    if(c.pending){ c.pending = false; pendDrop(WD.stamp, c.id); if(ok && c.toasted) toast('✅ Saved', 'ok'); }
    if(WD.card && !Object.keys(WD.calls).some(k => { const x = WD.calls[k]; return x.kind === 'open' && !x.done; })) card(false);
    try { if(ok){ c.s && c.s(v, c.u); } else { c.f && c.f(v, c.u); } }
    finally { if(ok) setTimeout(flush, 50); }
  }
  // send the saves that never got an answer — after a call that worked (the line is alive again)
  let flushing = false;
  function flush(){
    if(flushing || WD.dead) return; flushing = true;
    try {
      const a = pend(); let changed = false;
      a.forEach(x => {
        const c = x.page === WD.stamp ? WD.calls[x.id] : null;
        if(c && (c.done || c.resent)) return;
        if(x.n >= 3){ x.drop = true; changed = true; return; }
        x.n++; changed = true;
        if(c){ c.resent = true; note('resend', c); fire(c); }
        else {   // from an earlier page (or an earlier visit): send it on its own
          const o = {id: 'p' + x.id, fn: x.fn, args: x.args, kind: 'save', done: false, old: x};
          note('resend old', o);
          const rr = ORIG().withSuccessHandler(() => pendDrop(x.page, x.id)).withFailureHandler(() => pendDrop(x.page, x.id)); rr[x.fn].apply(rr, x.args || []);
        }
      });
      if(changed) setPend(a.filter(x => !x.drop));
    } catch(e){} finally { flushing = false; }
  }

  // ----- open the page again -----
  function pageUrl(){
    if(WD.url) return WD.url;
    const base = typeof WEBAPP_URL !== 'undefined' ? WEBAPP_URL : '';
    if(!base) return '';
    const q = []; const pg = window.SP_PAGE || (typeof PAGE !== 'undefined' ? PAGE : ''); const pl = typeof CURRENT_PLAYER !== 'undefined' ? CURRENT_PLAYER : '';
    if(pg) q.push('page=' + encodeURIComponent(pg)); if(pl) q.push('player=' + encodeURIComponent(pl));
    return base + (q.length ? '?' + q.join('&') : '');
  }
  function reloadOnce(){
    WD.reloaded = true;
    let last = 0; try { last = +sessionStorage.getItem(RKEY) || 0; } catch(e){}
    if(Date.now() - last < 120000) return false;   // we already opened it again a moment ago → the card, no loop
    try { sessionStorage.setItem(RKEY, String(Date.now())); } catch(e){}
    const inGas = !!(window.google && google.script && google.script.url), url = pageUrl();
    if(inGas && url){
      try { window.top.location.href = url; } catch(e){ return false; }   // may be blocked without a tap → the card comes 2.5 s later
      setTimeout(() => { if(!WD.card) card(true); }, 2500);
      return true;
    }
    try { window.location.reload(); return true; } catch(e){ return false; }
  }
  function reloadNow(){   // from a tap (iOS lets a tapped link leave the frame)
    try { sessionStorage.setItem(RKEY, String(Date.now())); } catch(e){}
    const url = pageUrl(), inGas = !!(window.google && google.script && google.script.url);
    if(inGas && url && UI.go){ UI.go(url, 'nav', 'Opening it again'); setTimeout(() => { try { window.location.reload(); } catch(e){} }, 4000); return; }
    try { window.location.reload(); } catch(e){}
  }

  // ----- the 📡 card -----
  function card(on, why){
    if(!on){ if(WD.card){ WD.card.remove(); WD.card = null; } return; }
    if(WD.card) return;
    css();
    const el = document.createElement('div'); el.className = 'ui-wd'; el.setAttribute('role', 'alertdialog');
    const loader = why === 'loader';
    el.innerHTML = '<div class="ui-wd-in"><div class="ui-wd-ic">📡<span>💤</span></div><h3>' + (loader ? 'This is taking too long' : 'Lost the connection') + '</h3>'
      + '<p>' + (loader ? 'The connection may have dropped for a moment.' : 'The server didn\'t answer. Opening the page again usually fixes it.') + '</p><div class="ui-wd-btns">'
      + '<button type="button" class="ui-wd-b ui-wd-go" data-sound="pop">🔄 Reload</button>'
      + '<button type="button" class="ui-wd-b ui-wd-wait" data-sound="tap">⏳ Keep waiting</button>'
      + '<button type="button" class="ui-wd-b ui-wd-back" data-sound="tap">' + esc(UI.backLabel ? UI.backLabel() : '◀ Back') + '</button></div></div>';
    document.body.appendChild(el); WD.card = el;
    const b = el.querySelectorAll('button');
    b[0].onclick = () => reloadNow();
    b[1].onclick = () => { card(false); setTimeout(() => {   // look again later
      const open = Object.keys(WD.calls).map(k => WD.calls[k]).filter(x => x.kind === 'open' && !x.done);
      if(open.length || (loader && loaderOn())) card(true, why);
    }, OPEN_MS() * 2); };
    b[2].onclick = () => { card(false); if(UI.back) UI.back(); else window.history.back(); };
  }
  function css(){
    if(document.getElementById('ui-wd-css')) return;
    const st = document.createElement('style'); st.id = 'ui-wd-css';
    st.textContent = '.ui-wd{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:rgba(14,10,34,.62);animation:uiWdIn .25s ease-out;}'
      + '.ui-wd-in{width:100%;max-width:400px;max-height:100%;overflow:auto;background:var(--card,#fff);color:var(--ink,#26203F);border-radius:22px;padding:18px 16px 16px;text-align:center;box-shadow:0 14px 40px rgba(0,0,0,.45);font-family:Nunito,Fredoka,system-ui,sans-serif;}'
      + '.ui-wd-ic{font-size:2.6rem;line-height:1;} .ui-wd-ic span{font-size:1.4rem;vertical-align:top;margin-left:2px;display:inline-block;animation:uiWdZ 1.6s ease-in-out infinite;}'
      + '.ui-wd h3{margin:8px 0 4px;font-size:1.2rem;font-family:Fredoka,Nunito,sans-serif;} .ui-wd p{margin:0 0 14px;font-weight:700;opacity:.75;}'
      + '.ui-wd-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}'
      + '.ui-wd-b{font:inherit;font-weight:800;font-size:1rem;min-height:48px;padding:10px 14px;border-radius:999px;border:2px solid rgba(0,0,0,.12);background:var(--panel,#F2EEFF);color:inherit;cursor:pointer;}'
      + '.ui-wd-go{background:var(--accent,#7B4FE0);color:#fff;border-color:transparent;}'
      + '@media (max-height:420px){.ui-wd-in{padding:12px;} .ui-wd-ic{font-size:2rem;} .ui-wd p{margin-bottom:8px;}}'
      + '@keyframes uiWdIn{from{opacity:0;transform:scale(.96);}to{opacity:1;transform:none;}} @keyframes uiWdZ{0%,100%{transform:translateY(0);opacity:.6;}50%{transform:translateY(-6px);opacity:1;}}';
    document.head.appendChild(st);
  }

  // ----- 💤 the full-page loader is up too long (no server call to blame, e.g. a blocked page change) -----
  let ldTimer = null;
  const LOADER_MS = () => (window.UI_WATCHDOG_MS > 0 ? window.UI_WATCHDOG_MS : 25000);
  function loaderOn(){ const l = document.querySelector('.ui-loader'); return !!(l && l.classList.contains('on')); }
  function loader(on){
    clearTimeout(ldTimer); ldTimer = null;
    if(!on){ if(WD.card && WD.card.dataset.why === 'loader') card(false); return; }
    if(window.UI_WATCHDOG === false || own()) return;
    const check = () => { ldTimer = null; if(!loaderOn() || WD.card) return; if(document.hidden){ ldTimer = setTimeout(check, 4000); return; } card(true, 'loader'); if(WD.card) WD.card.dataset.why = 'loader'; };
    ldTimer = setTimeout(check, LOADER_MS());
  }

  // ----- wrap google.script.run once -----
  function wrap(){
    const G = window.google && google.script;
    if(!G || G.__wd) return !!(G && G.__wd);
    const d = Object.getOwnPropertyDescriptor(G, 'run');
    if(!d) return false;
    ORIG = d.get ? () => d.get.call(G) : (v => () => v)(d.value);
    const make = (s, f, u) => new Proxy({}, {get(t, k){
      if(typeof k !== 'string' || k === 'then' || k === 'toJSON') return undefined;
      if(k === 'withSuccessHandler') return fn => make(fn, f, u);
      if(k === 'withFailureHandler') return fn => make(s, fn, u);
      if(k === 'withUserObject') return o => make(s, f, o);
      return function(){ return send(k, [].slice.call(arguments), s, f, u); };
    }});
    const base = make(null, null, undefined);
    const put = o => Object.defineProperty(o, 'run', {configurable: true, enumerable: true, get: () => base, set: v => { ORIG = (x => () => x)(v); }});
    let T = G;
    try {
      if(d.configurable) put(G);
      else if(d.writable) G.run = base;
      else {   // run is locked: put a copy of google.script (same url / host / history) with the guarded run in its place
        const sd = Object.getOwnPropertyDescriptor(window.google, 'script');
        if(!sd || !(sd.writable || sd.configurable)) return false;
        T = Object.create(Object.getPrototypeOf(G));
        Object.getOwnPropertyNames(G).forEach(k => { if(k !== 'run') try { Object.defineProperty(T, k, Object.getOwnPropertyDescriptor(G, k)); } catch(e){} });
        put(T);
        if(sd.configurable) Object.defineProperty(window.google, 'script', {configurable: true, enumerable: true, writable: true, value: T}); else window.google.script = T;
      }
    } catch(e){ return false; }
    if(!window.google.script || window.google.script.run !== base) return false;
    try { Object.defineProperty(T, '__wd', {value: 1}); } catch(e){}
    return true;
  }
  WD.active = window.UI_GUARD !== false && !window.OfflineApp && wrap();   // 📲 the offline app answers from the device (its own queue) → no guard there

  // the top page's ?params (Apps Script runs the page inside a frame) → "open it again" keeps the same game / mode / player
  WD.dead = /[?&]deadline=1\b/.test(location.search);
  try {
    if(window.google && google.script && google.script.url) google.script.url.getLocation(loc => {
      const ps = (loc && loc.parameters) || {}, q = [];
      Object.keys(ps).forEach(k => [].concat(ps[k]).forEach(v => q.push(encodeURIComponent(k) + '=' + encodeURIComponent(v))));
      if(String((loc && loc.parameter && loc.parameter.deadline) || '') === '1') WD.dead = true;
      const base = typeof WEBAPP_URL !== 'undefined' ? WEBAPP_URL : '';
      if(base) WD.url = base + (q.length ? '?' + q.filter(x => !/^deadline=/.test(x)).join('&') : '');
    });
  } catch(e){}
  if(WD.dead) setTimeout(() => toast(WD.active ? '🛡️ Guard test: server answers are dropped on this page' : '🛡️ Guard OFF here (google.script.run could not be wrapped)', WD.active ? 'ok' : 'err'), 600);

  // 👀 back to the tab: decide the calls that timed out while hidden; after a long time away, check the line
  document.addEventListener('visibilitychange', () => {
    if(document.hidden){ WD.hiddenAt = Date.now(); return; }
    const away = WD.hiddenAt ? Date.now() - WD.hiddenAt : 0; WD.hiddenAt = 0;
    Object.keys(WD.calls).forEach(k => { const c = WD.calls[k]; if(c.waitVis && !c.done){ c.waitVis = false; arm(c, 4000); } });
    if(WD.active && away > (window.UI_AWAY_MS > 0 ? window.UI_AWAY_MS : 60000) && window.UI_GUARD !== false && !WD.card){ try { google.script.run.withSuccessHandler(() => {}).withFailureHandler(() => {}).wdPing(); } catch(e){} }
  });
  // saves left from an earlier page: send them once the line answers
  if(WD.active && pend().length) setTimeout(() => { if(WD.answered) flush(); else { const t = setInterval(() => { if(WD.answered){ clearInterval(t); flush(); } }, 1000); setTimeout(() => clearInterval(t), 60000); } }, 1500);

  window.UIWD = {loader: loader};
  UI.wd = {get active(){ return WD.active; }, calls: () => Object.keys(WD.calls).map(k => WD.calls[k]), pending: pend, card: () => WD.card, log: WD.log, flush: flush,
    state: () => ({active: WD.active, answered: WD.answered, dead: WD.dead, reloaded: WD.reloaded, url: pageUrl(), toasts: WD.toasts})};
})();
/* ================= 🛡️ WD-1 NO-HANG GUARD END ================= */
/* ================= 📱 SETTLE (ls-1 — 🧱 baseline chat's fix, added by the ✨ polish chat 2026-11-15; Aowu 16:26 "many games fail this landscape for iPhone every first try") =================
   iPhone / iPad Safari can send 'resize' BEFORE the page has its final size (first open sideways, rotating, the toolbar sliding away) and then
   never again → a game that measures its canvas on 'resize' keeps the old size (stretched / blurry / giant avatars until you reopen).
   This re-sends ONE 'resize' 0.15 s + 0.5 s after any resize / orientationchange / pageshow, and after a visualViewport change or an <html> box
   change — those two only when the WINDOW size (innerWidth × innerHeight) really changed, so a page that grows its content or redraws on
   'resize' can never set it off again (no loop). Games keep their own resize code. Off: window.UI_SETTLE = false. Test: landfirst.js. */
(function(){
  if(window.__spSettle || window.UI_SETTLE === false) return; window.__spSettle = true;
  let mine = false, t1 = 0, t2 = 0, win = innerWidth + 'x' + innerHeight;
  const fire = () => { win = innerWidth + 'x' + innerHeight; mine = true; try { window.dispatchEvent(new Event('resize')); } finally { mine = false; } };
  const later = () => { clearTimeout(t1); clearTimeout(t2); t1 = setTimeout(fire, 150); t2 = setTimeout(fire, 500); };
  const ifWin = () => { if(innerWidth + 'x' + innerHeight !== win) later(); };
  window.addEventListener('resize', () => { if(!mine) later(); }, true);
  window.addEventListener('orientationchange', later); window.addEventListener('pageshow', later);
  if(window.visualViewport) visualViewport.addEventListener('resize', ifWin);
  const watch = () => { try { new ResizeObserver(ifWin).observe(document.documentElement); } catch(e){} };
  if(document.documentElement) watch(); else document.addEventListener('DOMContentLoaded', watch);
  window.UI = window.UI || {}; UI.settle = later;   // a page can ask for the extra resize itself
})();
/* ================= 📱 SETTLE END ================= */
/* ================= 🏷️ RACK TAB SIZE (24e2) =================
   Sets --rt-w = the width of the first .rt tile on every element that holds .rt tiles (racks), so `.rt > .pt` (the 🏷️ point tab)
   can be sized from the rack tile itself. A ResizeObserver per rack (rotate / resize) + a light MutationObserver (new racks). Off: window.UI_RACKTAB = false. */
(function(){
  if(window.UI_RACKTAB === false || !window.ResizeObserver || !window.MutationObserver) return;
  const seen = new WeakSet(), put = el => { const t = el.querySelector(':scope > .rt'); if(!t) return; const w = t.offsetWidth; if(w > 4) el.style.setProperty('--rt-w', w.toFixed(1) + 'px'); };
  const ro = new ResizeObserver(es => es.forEach(e => put(e.target)));
  let q = 0; const scan = () => { q = 0; document.querySelectorAll('.rt').forEach(t => { const p = t.parentElement; if(!p) return; if(!seen.has(p)){ seen.add(p); ro.observe(p); } put(p); }); };
  const soon = () => { if(!q) q = requestAnimationFrame(scan); };
  const go = () => { scan(); new MutationObserver(ms => { for(const m of ms) for(const n of m.addedNodes) if(n.nodeType === 1 && (n.classList.contains('rt') || (n.querySelector && n.querySelector('.rt')))) return soon(); }).observe(document.body, {childList: true, subtree: true}); };
  if(document.body) go(); else document.addEventListener('DOMContentLoaded', go);
})();
/* ================= 🏷️ RACK TAB SIZE END ================= */
/* ================= 🕹️ PAD SIZE (pz-1 — ✨ polish chat 2026-11-16; Aowu: "proposed sizes" · "spacing and arrangement" · "appeal, usable, practical") =================
   ONE size + layout rule for every on-screen joystick and button (Game Baseline plan §11c, Run Order 24d).
   • CSS vars on <html>, set by device (screen short side: phone < 500 px · iPad ≥ 700 px · scaled between), recomputed on resize:
       --pad-stick (stick base Ø) · --pad-main (main button Ø) · --pad-btn (other buttons Ø) · --pad-gap (≥ 3 mm) · --pad-edge (≥ 4 mm)
       --pad-safe-l / -r / -b (iPhone notch + home bar) · --pad-hit (hit area grows 6 px past the drawing)
       ✚ arrow cross = ONE movement control (left thumb): --pad-dpad (whole cross, 1.2 × stick) · --pad-arrow (each arrow, ≥ 56 px) · --pad-dgap
     UI.pad.dress(btn, icon, label, rim, main) · UI.pad.fan(box, main, others) + UI.pad.arcAll(root) = the ring for a game's own buttons.
     phone sideways 150 / 92 / 68 px · upright 160 / 92 / 74 · iPad 170 / 96 / 74 · gap 18 (iPad 20) · edge 24 (iPad 26).
     Short phones shrink stick + buttons together (gap + edge stay), never a button below 56 px (≈ 9 mm).
   • 👍 THUMB ARC — UI.pad.arc(box, main, others, {side: 'right' | 'left', lift}) places the buttons absolutely inside `box`:
       main = the biggest, on the corner diagonal · others (≤ 4, most used first) = a tight 🌼 ring around the main, one gap from it and
       from each other (one thumb roll from the main), first = ← left, 2nd = ↑ above, then ↙ / ↗; the main sits in from the corner just
       enough for the ring. opt.fit = the box shrinks to the footprint. UI.pad.stickFor(W, fanW) = the stick size that never touches it. side 'left' = the same mirrored (2nd player). Re-run it on resize (the game's own resize code).
     UI.pad.geo(W, H, n, opt) = the same geometry without the DOM → {cx, cy, R, pts, w, h} (w / h = the footprint from the corner, for keeping
     the play picture clear of the thumbs).
   • 🕹️ UI.pad.stick(stick, zone) — the stick base comes to where the left thumb lands inside `zone` (left-bottom of the play
     area), then slides home when the thumb lifts; the game's own stick code keeps working (the press is handed on).
   • 🎨 shared look: .pz-btn (+ .ic icon + .nm one-word label, --rim colour) · .pz-main (bigger + glow ring) · .pz-down / :active
     (squash + light-up) · .pz-glow (pulse: "press me") · UI.pad.cool(btn, 0…1) (the same cooldown sweep everywhere).
     A game keeps its colours; layout + size + feel are shared. Off: window.UI_PADSIZE = false (vars stay at the phone values). */
(function(){
  if(!window.UI) return;
  const PH_L = {stick: 150, main: 92, btn: 68, gap: 18, edge: 24}, PH_P = {stick: 160, main: 92, btn: 74, gap: 18, edge: 24}, PAD = {stick: 170, main: 96, btn: 74, gap: 20, edge: 26};
  const MIN_BTN = 56;
  let probe = null;
  function safe(){
    try{ if(!probe){ probe = document.createElement('div'); probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px);'; (document.body || document.documentElement).appendChild(probe); }
      const cs = getComputedStyle(probe); return {l: parseFloat(cs.paddingLeft) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0};
    }catch(e){ return {l: 0, r: 0, b: 0}; }
  }
  function sizes(w, h){
    w = w || innerWidth; h = h || innerHeight; const s = Math.min(w, h), land = w > h;
    const t = Math.max(0, Math.min(1, (s - 500) / 200)), P = land ? PH_L : PH_P, o = {};
    Object.keys(P).forEach(k => { o[k] = P[k] + (PAD[k] - P[k]) * t; });
    if(t === 0){ const f = Math.max(0.78, Math.min(1, s / (land ? 430 : 400)));   // short phones: stick + buttons shrink together, gap + edge stay
      ['stick', 'main', 'btn'].forEach(k => { o[k] *= f; }); }
    o.btn = Math.max(MIN_BTN, o.btn); o.main = Math.max(MIN_BTN + 8, o.main); o.stick = Math.max(110, o.stick);
    Object.keys(o).forEach(k => { o[k] = Math.round(o[k]); });
    o.dgap = 6; o.dpad = Math.round(Math.max(o.stick * 1.2, 3 * MIN_BTN + 2 * o.dgap)); o.arrow = Math.floor((o.dpad - 2 * o.dgap) / 3);   // ✚ arrow cross = ONE movement control
    o.hit = 6; o.cls = t === 0 ? (land ? 'phoneL' : 'phoneP') : t === 1 ? 'ipad' : 'mid'; return o;
  }
  let last = '';
  function apply(){
    if(window.UI_PADSIZE === false) return null;
    const o = sizes(), sa = safe(), k = JSON.stringify([o, sa]); if(k === last) return o; last = k;
    const st = document.documentElement.style;
    ['stick', 'main', 'btn', 'gap', 'edge', 'hit', 'dpad', 'arrow', 'dgap'].forEach(n => st.setProperty('--pad-' + n, o[n] + 'px'));
    st.setProperty('--pad-safe-l', sa.l + 'px'); st.setProperty('--pad-safe-r', sa.r + 'px'); st.setProperty('--pad-safe-b', sa.b + 'px');
    document.documentElement.dataset.pad = o.cls; return o;
  }
  const px = n => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad-' + n)) || sizes()[n];
  // 👍 the thumb arc: angles in screen degrees (180 = left of the main, 90 = straight above), mirrored for side 'left'
  //   geo(W, H, n, opt) = the pure geometry (no DOM): centres of the main + n others, and the footprint {w, h} from the corner
  function geo(W, H, n, opt){
    // 🌼 a ring around the MAIN button (pz-1 v3, Aowu 02:43 "lob too spread out, power too high"): every other button one gap away from
    // the main and from its neighbours, the ring centred on the corner diagonal; the main moves in from the corner just enough that the
    // ring keeps ≥ --pad-edge from both screen edges. Places: n = 1 ↖ · 2 ← ↑ · 3 ← ↑ ↖ · 4 ← ↑ ↙ ↗ (most used first = the easiest reach).
    opt = opt || {}; const sa = opt.noSafe ? {l: 0, r: 0, b: 0} : safe(), right = opt.side !== 'left';
    const m = opt.main || px('main'), b = opt.btn || px('btn'), g = px('gap'), e = px('edge'), lift = opt.lift || 0, D = Math.PI / 180;
    const R = m / 2 + g + b / 2, step = n > 1 ? 2 * Math.asin(Math.min(1, (b + g) / (2 * R))) / D : 0, hi = 135 + step * (n - 1) / 2;
    const ang = []; for(let i = 0; i < n; i++) ang.push(n === 1 ? (opt.a1 == null ? 135 : opt.a1) : hi - step * i);   // opt.a1 = the single button's place (90 = straight above, for narrow side panels)   // left-low → up-right along the ring
    const PICK = {1: [0], 2: [0, 1], 3: [0, 2, 1], 4: [1, 2, 0, 3]}[n] || ang.map((x, i) => i);   // which ring place the 1st, 2nd … button gets
    let offR = m / 2, offB = m / 2; ang.forEach(a => { offR = Math.max(offR, b / 2 + R * Math.cos(a * D)); offB = Math.max(offB, b / 2 - R * Math.sin(a * D)); });
    const px0 = right ? W - sa.r : sa.l, py0 = H - sa.b - lift, ox = e + Math.max(offR, m * 0.58), oy = e + Math.max(offB, m * 0.58);
    const cx = right ? px0 - ox : px0 + ox, cy = py0 - oy;
    const pts = PICK.map(k => { const a = ang[k], dx = Math.cos(a * D) * R; return {x: right ? cx + dx : cx - dx, y: cy - Math.sin(a * D) * R, a}; });
    let minX = cx - m / 2, maxX = cx + m / 2, minY = cy - m / 2; pts.forEach(p => { minX = Math.min(minX, p.x - b / 2); maxX = Math.max(maxX, p.x + b / 2); minY = Math.min(minY, p.y - b / 2); });
    return {cx, cy, R, main: m, btn: b, gap: g, edge: e, pts, w: Math.ceil(right ? W - minX : maxX), h: Math.ceil(H - minY)};
  }
  // the stick shrinks only when it would touch the right-thumb group (narrow upright phones): ≥ 120 px, one gap away
  function stickFor(W, fanW){ const sa = safe(), e = px('edge'), g = px('gap'); return Math.max(120, Math.min(px('stick'), Math.floor(W - fanW - g - e - sa.l))); }
  function arc(box, main, others, opt){
    opt = opt || {}; apply(); if(!box || !main) return null; others = (others || []).filter(Boolean);
    const o = Object.assign({}, opt, {main: main.offsetWidth || px('main'), btn: others.length ? Math.max(...others.map(x => x.offsetWidth || px('btn'))) : px('btn')});
    if(opt.fit){ const F = geo(4000, 4000, others.length, o); box.style.width = F.w + 'px'; box.style.height = F.h + 'px'; }   // the box = just the footprint, anchored in its corner
    const G = geo(box.clientWidth, box.clientHeight, others.length, o);
    const place = (el, x, y) => { const w = el.offsetWidth, h = el.offsetHeight; el.style.position = 'absolute'; el.style.right = el.style.bottom = 'auto';
      el.style.left = Math.round(x - w / 2) + 'px'; el.style.top = Math.round(y - h / 2) + 'px'; el.style.margin = '0'; };
    place(main, G.cx, G.cy); others.forEach((el, i) => place(el, G.pts[i].x, G.pts[i].y));
    return G;
  }
  // 🕹️ floating stick: the base jumps to the thumb inside the zone, the press is handed to the stick's own handlers
  function stick(st, zone, opt){
    opt = opt || {}; if(!st || !zone || st.__pzFloat) return; st.__pzFloat = true;
    let home = null, on = null;
    zone.addEventListener('pointerdown', ev => {
      if(ev.target !== zone || on != null) return; if(ev.pointerType === 'mouse' && !opt.mouse) return;
      const zr = zone.getBoundingClientRect(), sr = st.getBoundingClientRect(), d = sr.width;
      if(!home) home = {left: st.style.left, top: st.style.top, right: st.style.right, bottom: st.style.bottom, tr: st.style.transition};
      const pr = st.offsetParent ? st.offsetParent.getBoundingClientRect() : {left: 0, top: 0};
      const x = Math.max(zr.left + d / 2, Math.min(zr.right - d / 2, ev.clientX)), y = Math.max(zr.top + d / 2, Math.min(zr.bottom - d / 2, ev.clientY));
      st.style.transition = 'none'; st.style.right = st.style.bottom = 'auto'; st.style.left = (x - d / 2 - pr.left) + 'px'; st.style.top = (y - d / 2 - pr.top) + 'px';
      on = ev.pointerId; ev.preventDefault();
      try{ st.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, cancelable: true, pointerId: ev.pointerId, pointerType: ev.pointerType, isPrimary: ev.isPrimary, clientX: ev.clientX, clientY: ev.clientY, screenX: ev.screenX, screenY: ev.screenY, button: 0, buttons: 1})); }catch(e){}
    });
    const back = ev => { if(ev.pointerId !== on) return; on = null; if(!home) return; st.style.transition = 'left .18s ease, top .18s ease';
      st.style.left = home.left; st.style.top = home.top; st.style.right = home.right; st.style.bottom = home.bottom; setTimeout(() => { if(on == null) st.style.transition = home ? home.tr : ''; }, 220); };
    ['pointerup', 'pointercancel'].forEach(t => { st.addEventListener(t, back); window.addEventListener(t, back); });
  }
  // 🎨 dress a game's button in the shared look (keeps its listeners) · 🌼 make a box a ring group · re-place every group on resize
  function dress(b, ic, nm, rim, main){ if(!b) return b; b.classList.add('pz-btn'); if(main) b.classList.add('pz-main'); if(rim) b.style.setProperty('--rim', rim);
    if(ic != null) b.innerHTML = '<span class="ic">' + ic + '</span>' + (nm ? '<span class="nm">' + nm + '</span>' : ''); return b; }
  function fan(box, main, others, opt){ if(!box || !main) return null; box.classList.add('pz-fan'); box.__pzArc = () => arc(box, main, others, Object.assign({fit: true}, opt || {})); return box; }
  function arcAll(root){ (root || document).querySelectorAll('.pz-fan').forEach(b => { if(b.__pzArc && b.offsetParent !== null) b.__pzArc(); }); }
  function cool(btn, frac){ if(!btn) return; let sw = btn.querySelector(':scope > .pz-sweep'); if(!(frac > 0)){ if(sw) sw.remove(); btn.classList.remove('pz-cool'); return; }
    if(!sw){ sw = document.createElement('i'); sw.className = 'pz-sweep'; btn.appendChild(sw); } btn.classList.add('pz-cool'); sw.style.setProperty('--cd', Math.min(1, frac)); }
  function css(){ if(document.getElementById('pz-css')) return; const s = document.createElement('style'); s.id = 'pz-css';
    s.textContent = ':root{--pad-stick:150px;--pad-main:92px;--pad-btn:68px;--pad-gap:18px;--pad-edge:24px;--pad-hit:6px;--pad-dpad:180px;--pad-arrow:56px;--pad-dgap:6px;--pad-safe-l:0px;--pad-safe-r:0px;--pad-safe-b:0px;}'
      + '.pz-btn{--rim:#FFFFFF;--sz:var(--pad-btn);position:absolute;width:var(--sz);height:var(--sz);border-radius:50%;border:none;padding:0;margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;'
      + 'color:#fff;font-family:"Fredoka",sans-serif;cursor:pointer;pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;'
      + 'background:radial-gradient(circle at 50% 35%,rgba(255,255,255,0.28),rgba(14,24,48,0.9) 62%);box-shadow:inset 0 0 0 4px var(--rim),inset 0 -6px 0 rgba(0,0,0,0.28),0 6px 0 rgba(0,0,0,0.3),0 10px 16px rgba(0,0,0,0.25);transition:transform .08s ease,box-shadow .08s ease,filter .08s ease;}'
      + '.pz-btn::before{content:"";position:absolute;inset:calc(-1 * var(--pad-hit));border-radius:50%;}'
      + '.pz-btn.pz-main{--sz:var(--pad-main);box-shadow:inset 0 0 0 5px var(--rim),inset 0 -7px 0 rgba(0,0,0,0.28),0 0 0 3px rgba(255,255,255,0.18),0 0 18px var(--rim),0 7px 0 rgba(0,0,0,0.3),0 12px 18px rgba(0,0,0,0.25);}'
      + '.pz-btn .ic{font-size:calc(var(--sz) * 0.4);line-height:1;pointer-events:none;}'
      + '.pz-btn .nm{font-size:max(10px,calc(var(--sz) * 0.15));font-weight:700;line-height:1;margin-top:2px;letter-spacing:.2px;text-shadow:0 1px 0 rgba(0,0,0,0.5);white-space:nowrap;pointer-events:none;}'
      + '.pz-btn.pz-down,.pz-btn:active{transform:translateY(4px) scale(.93);filter:brightness(1.3);box-shadow:inset 0 0 0 4px var(--rim),inset 0 -2px 0 rgba(0,0,0,0.28),0 1px 0 rgba(0,0,0,0.3),0 0 18px var(--rim);}'
      + '.pz-btn.pz-glow{animation:pz-glow .8s ease-in-out infinite;}'
      + '@keyframes pz-glow{50%{transform:scale(1.07);box-shadow:inset 0 0 0 4px #FFF,0 0 0 4px var(--rim),0 0 24px var(--rim),0 6px 0 rgba(0,0,0,0.3);}}'
      + '.pz-btn .pz-sweep{position:absolute;inset:0;border-radius:50%;pointer-events:none;background:conic-gradient(rgba(10,14,30,0.62) calc(var(--cd,0) * 360deg),transparent 0);}'
      + '.pz-btn.pz-cool{filter:saturate(.6);}'
      + '.pz-fan{position:relative;display:block;flex:0 0 auto;}';
    (document.head || document.documentElement).appendChild(s); }
  css(); apply();
  addEventListener('resize', () => apply(), true); addEventListener('orientationchange', () => setTimeout(apply, 60));
  if(window.ResizeObserver) try{ new ResizeObserver(() => apply()).observe(document.documentElement); }catch(e){}
  UI.pad = {sizes, apply, px, geo, arc, stick, stickFor, dress, fan, arcAll, cool, safe};
})();
/* ================= 🕹️ PAD SIZE END ================= */
