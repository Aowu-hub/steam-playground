
/* ================= SOUNDS (made in code, no sound files) ================= */
// Built with the browser's own Web Audio engine, so there is nothing to
// download, nothing to host on Drive, and no loading delay. Browsers only
// allow audio after the first tap, so the engine wakes up on the first
// pointerdown/touchend anywhere on the page.
window.UISound = (function(){
  /* 🔊 SHARED TONE MAKER (24s-a, 2026-11-17) — ONE audio engine for every page.
     Every sound goes through one master bus that follows 🔇 sound-off and the
     volume LIVE (turning sound off mid-game silences notes already playing).
     Public, for games (use these instead of a page's own AudioContext):
       UISound.isOn()                         sound on and volume > 0
       UISound.tone(hz, sec, {type, gain, slide, delay, attack})   one beep → {stop()} | null
       UISound.note('C5' | 523, sec, {instrument, gain, delay, slide})  a musical note
            instruments: sine · triangle · square · sawtooth · piano · bell · pluck ·
                         flute · marimba · bass · chip · pad
       UISound.chord(['C4','E4','G4'], sec, opts)  several notes at once
       UISound.noise(sec, {gain, from, to, q, delay})  whoosh / hiss / thud
       UISound.freq('A4') → 440                note name → Hz (sharps # and flats b)
       UISound.ctx()  → the shared AudioContext (wakes it) · UISound.out() → the
                         master bus: connect your own nodes here, never to ctx.destination
       UISound.onChange(fn) → off()            fn({enabled, volume}) when sound / volume change
     All of them do nothing until the first tap (browsers allow audio only after it). */
  let ctx = null, master = null, fxBus = null, limiter = null;   // 🔊 an-2: effects bus + safety limiter
  let enabled = true;
  let volume = 0.6; // 0..1
  const LISTEN = [];
  function load(){
    try{
      const saved = JSON.parse(localStorage.getItem('sp_sound') || 'null');
      if(saved){ enabled = saved.e !== false; if(typeof saved.v === 'number') volume = saved.v; }
    }catch(e){}
  }
  load();
  function level(){ return enabled ? volume : 0; }
  function applyMaster(){
    if(!master || !ctx) return;
    try{ const g = master.gain, t = ctx.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.setTargetAtTime(level(), t, 0.03); }catch(e){ try{ master.gain.value = level(); }catch(e2){} }
  }
  function ac(){
    if(!ctx){
      const C = window.AudioContext || window.webkitAudioContext;
      if(!C) return null;
      try{ ctx = new C(); }catch(e){ return null; }
      try{ master = ctx.createGain(); master.gain.value = level();
        try{ limiter = ctx.createDynamicsCompressor(); limiter.threshold.value = -1; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = 0.002; limiter.release.value = 0.15; master.connect(limiter); limiter.connect(ctx.destination); }catch(e){ limiter = null; master.connect(ctx.destination); }   // 🔊 an-2: louder music never cracks
      }catch(e){ master = null; }
      try{ fxBus = ctx.createGain(); fxBus.gain.value = fxGain(); fxBus.connect(master || ctx.destination); }catch(e){ fxBus = null; }   // 🔊 an-2: 🔊 Effects level (game + UiKit sounds)
      musicChain();   // 🎵 24u-a: music bus → duck → warm filter → master
    }
    if(ctx.state === 'suspended'){ try{ ctx.resume(); }catch(e){} }
    return ctx;
  }
  function bus(c){ return fxBus || master || c.destination; }   // 🔊 an-2: every sound (not the music) rides the 🔊 Effects bus
  /* one voice: osc → gain (attack / decay) → bus; returns the osc so callers can stop it */
  function voice(c, freq, dur, type, gain, slideTo, delay, attack, dest){
    const t0 = c.currentTime + (delay || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if(slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    const peak = Math.max(0.0001, gain == null ? 0.3 : gain);
    const att = Math.min(dur * 0.5, attack || 0.008);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(dest || bus(c));
    if(!dest) duck(t0);   // 🎵 24u-a: a game sound ducks the music
    osc.start(t0); osc.stop(t0 + dur + 0.02);
    return {osc: osc, g: g, t0: t0};
  }
  function tone(freq, dur, type, gain, slideTo, delay){
    const c = ac(); if(!c) return;
    voice(c, freq, dur, type, gain, slideTo, delay);
  }
  function noise(dur, gain, fFrom, fTo, delay, q){
    const c = ac(); if(!c) return null;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for(let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const filt = c.createBiquadFilter(); filt.type = 'bandpass'; filt.Q.value = q || 1.2;
    const t0 = c.currentTime + (delay || 0);
    filt.frequency.setValueAtTime(fFrom, t0);
    filt.frequency.exponentialRampToValueAtTime(fTo, t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), t0 + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt); filt.connect(g); g.connect(bus(c)); duck(t0);   // 🎵 24u-a
    src.start(t0); src.stop(t0 + dur + 0.02);
    return src;
  }
  // 🎵 note names → Hz (A4 = 440); 'C5', 'F#4', 'Bb3', 'c#6'; a number passes through
  const STEP = {c: -9, d: -7, e: -5, f: -4, g: -2, a: 0, b: 2};
  function freq(n){
    if(typeof n === 'number') return n;
    const m = /^([A-Ga-g])([#b♯♭]?)(-?\d)$/.exec(String(n || '').trim());
    if(!m) return 0;
    const semi = STEP[m[1].toLowerCase()] + (m[2] === '#' || m[2] === '♯' ? 1 : m[2] === 'b' || m[2] === '♭' ? -1 : 0) + (Number(m[3]) - 4) * 12;
    return 440 * Math.pow(2, semi / 12);
  }
  // instrument = list of partials [ratio, type, gain share, decay share, attack]
  const INSTR = {
    piano:   [[1, 'triangle', 1, 1, 0.005], [2, 'sine', 0.35, 0.55, 0.005], [3, 'sine', 0.12, 0.3, 0.005]],
    bell:    [[1, 'sine', 1, 1, 0.004], [2.76, 'sine', 0.45, 0.6, 0.004], [5.4, 'sine', 0.18, 0.35, 0.004]],
    marimba: [[1, 'sine', 1, 1, 0.004], [4, 'sine', 0.3, 0.25, 0.003]],
    pluck:   [[1, 'sawtooth', 0.55, 0.8, 0.003], [2, 'triangle', 0.4, 0.5, 0.003]],
    flute:   [[1, 'sine', 1, 1, 0.07], [2, 'sine', 0.12, 1, 0.09]],
    bass:    [[1, 'triangle', 1, 1, 0.01], [0.5, 'sine', 0.6, 1, 0.01]],
    chip:    [[1, 'square', 0.45, 1, 0.003]],
    pad:     [[1, 'sine', 0.7, 1, 0.35], [1.005, 'triangle', 0.35, 1, 0.4], [2, 'sine', 0.15, 1, 0.45]]
  };
  function playNote(n, dur, o){
    o = o || {};
    if(!enabled) return null;
    const c = ac(); if(!c) return null;
    const hz = freq(n); if(!(hz > 0)) return null;
    dur = Math.max(0.02, dur || 0.3);
    const gain = o.gain == null ? 0.25 : o.gain;
    const kind = o.instrument || o.type || 'piano';
    const parts = INSTR[kind] || [[1, kind, 1, 1, o.attack || 0.008]];
    const vs = parts.map(p => voice(c, hz * p[0], dur * p[3], p[1], gain * p[2], o.slide ? freq(o.slide) * p[0] : null, o.delay, p[4]));
    if(kind === 'flute' && vs[0]){ try{ const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 5; lg.gain.value = hz * 0.006; lfo.connect(lg); lg.connect(vs[0].osc.frequency); lfo.start(vs[0].t0); lfo.stop(vs[0].t0 + dur + 0.02); }catch(e){} }
    return handle(vs.map(v => v.osc));
  }
  function handle(nodes){
    return {stop(){ nodes.forEach(n => { try{ n.stop(); }catch(e){} }); }};
  }
  function tell(){ const st = {enabled: enabled, volume: volume}; LISTEN.slice().forEach(fn => { try{ fn(st); }catch(e){} }); }
  // 🔇 another tab / page changed the sound → follow it here too
  try{ window.addEventListener('storage', e => { if(e.key !== 'sp_sound') return; const a = enabled, b = volume; load(); applyMaster(); if(a !== enabled || b !== volume) tell(); }); }catch(e){}
  /* ================= 🎵 AMBIENT MOODS (24u-a, 2026-11-17, ✨ polish chat) =================
     Plan: Drive `Ambient Moods — full plan.md` (project claude/ambient-moods-plan.md). Aowu's picks 2026-11-17 15:2x:
     all 6 samples ✅ as heard · 🎵 music ON by default (soft, 35 %) · games only (no shell-page theme).
     A soft background soundscape made in code (no music files). ONE recipe per game → layers that come and go:
       🎹 pad (always) · 🎸 bass (from a little tension) · 🎶 lead (busier with tension) · ✨ sparkle (calm) ·
       🥁 drums (above the recipe's line) · 📣 crowd (sport / arena, close moments) · ⏳ pedal (tension > 0.7).
     The game only says WHAT is happening — the engine decides the music:
       const M = UISound.mood('pokadif')     // GAME_ID or route ('number-board' = 'numberboard'), or a recipe object
       M.set('tension', 0..1) / M.tension(v)  // time left, stack height, score gap, enemies left …
       M.hush(true | false)                   // 🤖 robot thinks · 🧠 memorise · 📖 story card open → pad only, darker
       M.lift()                               // 🎉 big moment: a short arpeggio + 2 brighter bars
       M.pause(true | false[, reason])        // ⏸ — the shared game bar's ⏸ / leave card / ❓ do it by themselves
       M.stop()                               // result card / leaving the play screen (fades out)
     Rules: 🔇 sound off = music off too (it rides the master bus) · 🎵 music has its own on / off + volume PER PLAYER
     (localStorage `sp_music:<Name>` + Settings `Music_<Name>` via saveMusic → follows the player to every device; newest wins) ·
     every UiKit game sound DUCKS the music for ~0.25 s · tab hidden / screen-time lock = paused / stopped · starts silent
     until the first tap (browsers), fades in over ~1 s · own-music games (BeatCorner, Pose Party) get a silent handle ·
     tests: navigator.webdriver → silent handle unless window.MOOD_TEST = true (or UISound.mood(id, {force: true})) ·
     `window.UI_MOODS = false` = no moods on this page.
     More: UISound.moodNow() (the live handle or null) · UISound.moodStop() · UISound.moodPause(on, reason) ·
           UISound.MOODS (every game's recipe + name / icon / family) · UISound.MOOD_FAMILIES ·
     🎶 24y-a: 3 tunes per mood, each start takes the next (sp_tune:<id>) · UISound.mood(id, {tune}) forces 0 | 1 | 2 · handle.tune = 1–3 ·
     📏 24y-b1: the ENGINE below the music settings lives in UiKitMusic.html (loaded right after UiKit on every page) ·
     🌍 24y-b2: UISound.mood(id, {theme}) → the game's theme wears a world colour (UISound.WORLDS · WORLD_OF · worldOf) · {world} forces one ·
           UISound.music.get(name?) / set({on, v}, name?) / player(name) / watch(fn) → off / sheet(anchorEl) (the 🎵 pop-over) */
  let mIn = null, mDuck = null, mFilt = null, MOOD = null, NOISE = null;
  const MUS_DEF = {on: true, v: 0.35, fx: 1};   // 🔊 an-2: fx = 🔊 Effects level (1 = as before)
  const MUS_K = 4.2;   // 🔊 an-2 (Aowu 18:25 "bg sound to -3 at 100"): music 100 % peaks ≈ −3 dBFS (was ×1.65, cap 1.2 ≈ −8 dBFS)
  const MUS_LISTEN = [];
  let musWho = null, musCache = null, musT = null;
  function musName(){
    if(musWho != null) return musWho;
    try{ if(typeof CURRENT_PLAYER !== 'undefined' && CURRENT_PLAYER && String(CURRENT_PLAYER).indexOf('<' + '?') < 0) return String(CURRENT_PLAYER); }catch(e){}
    return '';
  }
  const accOk = a => /^en-(US|GB|AU)$/.test(String(a || '')) ? String(a) : '';   // 🗣️ an-4: reading-voice accent ('' = auto)
  function musRead(name){
    const who = name == null ? musName() : String(name);
    try{
      const x = JSON.parse(localStorage.getItem('sp_music:' + who) || 'null');
      if(x && typeof x === 'object'){ const v = Number(x.v), f = Number(x.fx); return {on: x.on !== false, v: isNaN(v) ? MUS_DEF.v : Math.min(1, Math.max(0, v)), fx: x.fx == null || isNaN(f) ? MUS_DEF.fx : Math.min(1, Math.max(0, f)), acc: accOk(x.acc), at: Number(x.at) || 0, who: who}; }
    }catch(e){}
    return {on: MUS_DEF.on, v: MUS_DEF.v, fx: MUS_DEF.fx, acc: '', at: 0, who: who};
  }
  function mus(){ if(!musCache) musCache = musRead(); return musCache; }
  function musicGain(){ const m = mus(); return m.on ? MUS_K * m.v : 0; }   // 🔊 an-2: 35 % = 1.47 · 100 % = 4.2 (≈ −3 dBFS peak measured; the limiter stops anything past −1)
  function fxGain(){ const m = mus(); return m.fx == null ? 1 : m.fx; }   // 🔊 an-2   // 🔊 24u-vol (Aowu 18:39 "too soft even at 100 %"): ×1.5 — 35 % = 0.58, 100 % = 1.2
  function musApply(){
    musCache = null; fxApply();   // 🔊 an-2
    if(!mIn || !ctx) return;
    try{ const g = mIn.gain, t = ctx.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.setTargetAtTime(musicGain(), t, 0.06); }catch(e){ try{ mIn.gain.value = musicGain(); }catch(e2){} }
  }
  function fxApply(){ if(!fxBus || !ctx) return; try{ const g = fxBus.gain, t = ctx.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.setTargetAtTime(fxGain(), t, 0.04); }catch(e){ try{ fxBus.gain.value = fxGain(); }catch(e2){} } }   // 🔊 an-2
  function musState(){ const m = mus(); return {on: m.on, v: m.v, fx: m.fx, who: m.who, live: !!MOOD, id: MOOD ? MOOD.id : '', sound: enabled && volume > 0}; }
  function musTell(){ const st = musState(); MUS_LISTEN.slice().forEach(fn => { try{ fn(st); }catch(e){} }); }
  function musSave(who, nx){
    clearTimeout(musT);
    musT = setTimeout(() => { try{ if(window.google && google.script && google.script.run) google.script.run.withSuccessHandler(() => {}).withFailureHandler(() => {}).saveMusic(who, nx.on, nx.v, nx.at, nx.fx, nx.acc); }catch(e){} }, 700);
  }
  function musSet(ch, name){
    ch = ch || {};
    const who = name == null ? musName() : String(name), cur = musRead(who);
    const v = ch.v == null ? cur.v : Number(ch.v);
    const f = ch.fx == null ? cur.fx : Number(ch.fx);   // 🔊 an-2
    const nx = {on: ch.on == null ? cur.on : !!ch.on, v: isNaN(v) ? cur.v : Math.min(1, Math.max(0, v)), fx: isNaN(f) ? cur.fx : Math.min(1, Math.max(0, f)), acc: ch.acc == null ? cur.acc : accOk(ch.acc), at: Date.now()};
    try{ localStorage.setItem('sp_music:' + who, JSON.stringify(nx)); }catch(e){}
    musApply(); musTell();
    if(who && !ch.local) musSave(who, nx);   // player-based: follows the player to every device
    return {on: nx.on, v: nx.v, fx: nx.fx, acc: nx.acc};
  }
  function musFromSettings(s){
    let ch = false;
    Object.keys(s || {}).forEach(k => {
      if(k.indexOf('Music_') !== 0) return;
      let x = null; try{ x = JSON.parse(s[k]); }catch(e){}
      if(!x || typeof x !== 'object') return;
      const who = k.slice(6), cur = musRead(who), at = Number(x.at) || 0, v = Number(x.v), f = Number(x.fx);
      if(at > cur.at){ try{ localStorage.setItem('sp_music:' + who, JSON.stringify({on: x.on !== false, v: isNaN(v) ? MUS_DEF.v : v, fx: x.fx == null || isNaN(f) ? cur.fx : f, acc: x.acc == null ? cur.acc : accOk(x.acc), at: at})); ch = true; }catch(e){} }
    });
    if(ch){ musApply(); musTell(); }
  }
  try{ window.addEventListener('storage', e => { if(e.key && e.key.indexOf('sp_music:') === 0){ musApply(); musTell(); } }); }catch(e){}
  function musicChain(){
    if(mIn || !ctx) return;
    try{
      mIn = ctx.createGain(); mDuck = ctx.createGain(); mFilt = ctx.createBiquadFilter();
      mFilt.type = 'lowpass'; mFilt.frequency.value = 6000; mFilt.Q.value = 0.3;
      mIn.gain.value = musicGain(); mIn.connect(mDuck); mDuck.connect(mFilt); mFilt.connect(master || ctx.destination);
    }catch(e){ mIn = null; }
  }
  // every game sound made by UiKit (tone / note / noise / play) ducks the music for ~0.25 s
  function duck(t0){
    if(!mDuck || !ctx || !MOOD) return;
    try{ const g = mDuck.gain, t = Math.max(ctx.currentTime, t0 || 0); g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0.45, t + 0.03); g.setTargetAtTime(1, t + 0.25, 0.12); if(MOOD) MOOD.S.ducks++; }catch(e){}
  }
  /* 🎵 the mood ENGINE (MINSTR · FAMILIES · GAME_MOODS · tunes · mood()) lives in UiKitMusic.html since 📏 24y-b1 (2026-11-20, ✨ Polish chat);
     it reaches this block through UISound._k below and adds UISound.mood / moodKey / MOODS / MOOD_FAMILIES (+ 🌍 WORLDS, 24y-b2). */
  /* 🎵 the music pop-over (game bar 🎵 chip, Mood Lab): on / off + volume for THIS player */
  function musCss(){
    if(document.getElementById('ui-mus-css')) return;
    const st = document.createElement('style'); st.id = 'ui-mus-css';
    st.textContent = '.gb-mus{position:relative;}'
      + '.gb-mus.gb-mus-off{opacity:.6;}'
      + '.gb-mus.gb-mus-off::after{content:"";position:absolute;left:24%;right:24%;top:calc(50% - 1.5px);height:3px;border-radius:2px;background:#E0464B;transform:rotate(-40deg);pointer-events:none;}'
      + '.ui-mus{position:fixed;z-index:2147483000;width:min(280px,calc(100vw - 16px));background:#fff;color:#2B2440;border-radius:18px;box-shadow:0 12px 34px rgba(0,0,0,.3);padding:12px 14px 12px;font-family:Fredoka,Nunito,sans-serif;animation:uiMusIn .16s ease-out;}'
      + '@keyframes uiMusIn{from{opacity:0;transform:translateY(-6px) scale(.96);}to{opacity:1;transform:none;}}'
      + '.ui-mus h4{margin:0 0 8px;font-size:1.02rem;font-weight:700;display:flex;align-items:center;gap:6px;}'
      + '.ui-mus h4 small{font-weight:600;font-size:.78rem;color:#6B6185;margin-left:auto;max-width:9em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'
      + '.ui-mus .ui-mus-row{display:flex;align-items:center;gap:10px;}'
      + '.ui-mus .ui-mus-on{flex:0 0 auto;min-width:92px;min-height:44px;border:0;border-radius:14px;font:inherit;font-weight:700;font-size:1rem;cursor:pointer;color:#fff;background:linear-gradient(135deg,#7C5CFF,#FF6B9D);box-shadow:0 3px 0 rgba(0,0,0,.18);}'
      + '.ui-mus .ui-mus-on.off{background:#E9E5F2;color:#5A5070;}'
      + '.ui-mus input[type=range]{flex:1 1 auto;min-width:0;height:44px;accent-color:#7C5CFF;}'
      + '.ui-mus .ui-mus-v{flex:0 0 3.1em;text-align:right;font-weight:700;font-size:.9rem;font-variant-numeric:tabular-nums;}'
      + '.ui-mus .ui-mus-h2{margin-top:10px;} .ui-mus .ui-mus-ic{flex:0 0 auto;min-width:44px;text-align:center;font-size:1.3rem;}'   /* 🔊 an-2 */
      + '.ui-mus p{margin:8px 0 0;font-family:Nunito,sans-serif;font-size:.8rem;line-height:1.3;color:#6B6185;}'
      + '.ui-mus p.warn{color:#B4441E;font-weight:700;}';
    document.head.appendChild(st);
  }
  let musSheetEl = null;
  function musSheet(anchor, o){
    o = o || {}; musCss();
    if(musSheetEl){ musSheetEl.close(); if(musSheetEl && musSheetEl.anchor === anchor) return null; }
    const el = document.createElement('div'); el.className = 'ui-mus'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Music');
    el.innerHTML = '<h4>🎵 Music<small></small></h4><div class="ui-mus-row"><button type="button" class="ui-mus-on" data-sound="tap"></button><input type="range" min="0" max="100" step="5" aria-label="Music volume"><span class="ui-mus-v"></span></div>'
      + '<h4 class="ui-mus-h2">🔊 Sound effects</h4><div class="ui-mus-row ui-mus-fxrow"><span class="ui-mus-ic">🔊</span><input type="range" class="ui-mus-fx" min="0" max="100" step="5" aria-label="Sound effects volume"><span class="ui-mus-v ui-mus-fxv"></span></div><p class="ui-mus-note"></p>';   // 🔊 an-2
    const who = musName(), bOn = el.querySelector('.ui-mus-on'), rng = el.querySelector('input'), vl = el.querySelector('.ui-mus-v'), nt = el.querySelector('.ui-mus-note'), fr = el.querySelector('.ui-mus-fx'), fv = el.querySelector('.ui-mus-fxv');
    el.querySelector('small').textContent = who ? 'for ' + who : '';
    function paint(){
      const m = mus();
      bOn.textContent = m.on ? '🎵 On' : '🔕 Off'; bOn.classList.toggle('off', !m.on); bOn.setAttribute('aria-pressed', m.on ? 'true' : 'false');
      rng.value = Math.round(m.v * 100); rng.disabled = !m.on; vl.textContent = Math.round(m.v * 100) + '%';
      fr.value = Math.round(m.fx * 100); fv.textContent = Math.round(m.fx * 100) + '%';   // 🔊 an-2
      const snd = enabled && volume > 0;
      nt.classList.toggle('warn', !snd);
      nt.textContent = !snd ? '🔇 Sound is off, so the music and effects are quiet too.' : 'Music = the background tune · Effects = hits, pops, the announcer.';
    }
    bOn.onclick = e => { e.stopPropagation(); const m = mus(); musSet({on: !m.on, v: !m.on && m.v === 0 ? MUS_DEF.v : m.v}); paint(); };
    rng.oninput = () => { musSet({v: Number(rng.value) / 100}); paint(); };
    let fxT = 0; fr.oninput = () => { musSet({fx: Number(fr.value) / 100}); paint(); clearTimeout(fxT); fxT = setTimeout(() => { try{ SOUNDS.pop(); }catch(e){} }, 120); };   // 🔊 an-2: a pop to hear the new level
    paint();
    document.body.appendChild(el);
    const r = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : null, w = el.offsetWidth, h = el.offsetHeight;
    let x = r ? r.right - w : (innerWidth - w) / 2, y = r ? r.bottom + 6 : (innerHeight - h) / 2;
    if(r && y + h > innerHeight - 8) y = Math.max(8, r.top - h - 6);
    el.style.left = Math.round(Math.min(innerWidth - w - 8, Math.max(8, x))) + 'px'; el.style.top = Math.round(Math.min(innerHeight - h - 8, Math.max(8, y))) + 'px';
    const offW = watch(paint);
    function outside(e){ if(!el.contains(e.target) && !(anchor && anchor.contains && anchor.contains(e.target))) close(); }
    function key(e){ if(e.key === 'Escape') close(); }
    function close(){ el.remove(); offW(); document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', key); if(musSheetEl === api) musSheetEl = null; }
    setTimeout(() => document.addEventListener('pointerdown', outside, true), 0);
    document.addEventListener('keydown', key);
    const api = {el: el, anchor: anchor, close: close};
    musSheetEl = api;
    return api;
  }
  function watch(fn){ if(typeof fn !== 'function') return () => {}; MUS_LISTEN.push(fn); return () => { const i = MUS_LISTEN.indexOf(fn); if(i >= 0) MUS_LISTEN.splice(i, 1); }; }
  const MUSIC = {
    get(name){ const m = name == null ? mus() : musRead(name); return {on: m.on, v: m.v, fx: m.fx, acc: m.acc}; },
    set(ch, name){ return musSet(ch, name); },
    player(name){ musWho = name == null ? null : String(name); musApply(); musTell(); return MUSIC; },
    state: musState,
    watch: watch,
    sheet: musSheet,
    css: musCss,
    gain(){ return {music: mIn ? mIn.gain.value : null, duck: mDuck ? mDuck.gain.value : null, filter: mFilt ? mFilt.frequency.value : null, fx: fxBus ? fxBus.gain.value : null, limiter: !!limiter}; },
    DEFAULT: MUS_DEF
  };
  /* 🎵 END AMBIENT MOODS (24u-a) */
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
      const a = enabled, b = volume;
      if(typeof on === 'boolean') enabled = on;
      if(typeof vol === 'number' && !isNaN(vol)) volume = Math.min(1, Math.max(0, vol));
      save(); applyMaster();
      if(a !== enabled || b !== volume) tell();
    },
    // Settings tab keys: SoundEnabled ('TRUE'/'FALSE'), SoundVolume (0-100)
    applySettings(s){
      if(!s) return;
      try { localStorage.setItem('sp_guide_auto', (s.GuidesAutoOpen === 'TRUE' || s.GuidesAutoOpen === true) ? '1' : '0'); } catch(e){}   // ❓ ws-4: grown-up switch (⚙️ Admin)
      try{ musFromSettings(s); }catch(e){}   // 🎵 24u-a: Music_<Name> (newest wins)
      const on = !(s.SoundEnabled === 'FALSE' || s.SoundEnabled === false);
      const v = (s.SoundVolume === '' || s.SoundVolume === undefined) ? NaN : Number(s.SoundVolume) / 100;
      this.set(on, isNaN(v) ? undefined : v);
    },
    get(){ return {enabled: enabled, volume: volume}; },
    wake: ac,
    // 🔊 24s-a public tone maker
    isOn(){ return enabled && volume > 0; },
    tone(hz, sec, o){
      o = o || {};
      if(!enabled) return null;
      const c = ac(); if(!c) return null;
      const f = freq(hz); if(!(f > 0)) return null;
      try{ const v = voice(c, f, Math.max(0.02, sec || 0.15), o.type, o.gain == null ? 0.3 : o.gain, o.slide ? freq(o.slide) : null, o.delay, o.attack); return handle([v.osc]); }catch(e){ return null; }
    },
    note(n, sec, o){ try{ return playNote(n, sec, o); }catch(e){ return null; } },
    chord(list, sec, o){ const hs = (list || []).map(n => this.note(n, sec, o)).filter(Boolean); return hs.length ? {stop(){ hs.forEach(h => h.stop()); }} : null; },
    noise(sec, o){
      o = o || {};
      if(!enabled) return null;
      try{ const s = noise(Math.max(0.02, sec || 0.2), o.gain == null ? 0.3 : o.gain, o.from || 300, o.to || 2600, o.delay, o.q); return s ? handle([s]) : null; }catch(e){ return null; }
    },
    freq: freq,
    ctx(){ return ac(); },
    out(){ const c = ac(); return c ? bus(c) : null; },
    onChange(fn){ if(typeof fn !== 'function') return () => {}; LISTEN.push(fn); return () => { const i = LISTEN.indexOf(fn); if(i >= 0) LISTEN.splice(i, 1); }; },
    // 🎵 24u-a ambient moods
    moodNow(){ return MOOD; },
    moodStop(){ if(MOOD) MOOD.stop(); },
    moodPause(on, why){ if(MOOD) MOOD.pause(on, why || 'page'); },
    /* 📏 24y-b1: mood · moodKey · MOODS · MOOD_FAMILIES come from UiKitMusic.html (Object.assign on load) */
    _k: {get ctx(){ return ctx; }, get enabled(){ return enabled; }, get volume(){ return volume; }, get mIn(){ return mIn; }, get mFilt(){ return mFilt; },
      get NOISE(){ return NOISE; }, set NOISE(v){ NOISE = v; }, get MOOD(){ return MOOD; }, set MOOD(v){ MOOD = v; },
      ac: ac, mus: mus, musTell: musTell, musicChain: musicChain},   /* 📏 24y-b1: the one private bridge for UiKitMusic — pages never use it */
    music: MUSIC,
    INSTRUMENTS: ['sine', 'triangle', 'square', 'sawtooth'].concat(Object.keys(INSTR))
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
  // 🔧 24v: back from the page memory (iPhone / iPad / desktop back button) → the loader + ⚡ mini show of the tap that left are still
  // painted in that copy; hide them (the page is already here, nothing is loading)
  window.addEventListener('pageshow', e => {
    if(!e.persisted) return;
    clearTimeout(loaderSafety); loaderSeq++;
    try { if(loaderEl) loaderEl.classList.remove('on'); } catch(er){}
    try { document.querySelectorAll('.ui-mini').forEach(x => x.remove()); } catch(er){}
    try { window.UIWD && UIWD.loader(false); } catch(er){}
  });
  function go(url, kind, text){
    try { const k = kindOf(kind || 'nav'); sessionStorage.setItem('sp_door', JSON.stringify({ic: k[0], txt: text || k[1], an: k[2], at: Date.now(), who: typeof CURRENT_PLAYER !== 'undefined' ? CURRENT_PLAYER : ''})); } catch(e){}   // 🚪 24p
    UISound.play('nav');
    loading(kind || 'nav', text);
    miniMaybe(url, kind || 'nav');
    clearTimeout(loaderSafety);
    loaderSafety = setTimeout(() => {
      // The page never left (blocked redirect / Google sign-in quirk): don't trap the user.
      loaded();
      toast('Still opening — tap again if nothing happens', 'err');
    }, 7000);
    const nav = () => { window.top.location.href = url; };
    if(!(UI.__beforeGo && UI.__beforeGo(nav))) nav();   // 🔌 24q: a wake-up ping first after a quiet spell
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
      try{ UISound.moodStop(); }catch(e){}   // 🎵 24u-a
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
          + '<span class="mi' + ((UI.glyphs ? UI.glyphs(m.icon) : 1) > 1 ? ' mi2' : '') + '">' + esc(m.icon) + '</span><span class="mt"><span class="mn">' + esc(m.name) + '</span>' + ((m.type || (window.MODE_TYPE || {})[m.k]) ? '<span class="my">' + esc(m.type || window.MODE_TYPE[m.k]) + '</span>' : '')   /* 🗂️ p3a: type line from window.MODE_TYPE */ + '' + (m.sub ? '<span class="ms">' + esc(m.sub) + '</span>' : '') + (m.next ? '<span class="mx">' + esc(m.next) + '</span>' : '') + '</span></button>').join('') + '</div></div>'; }).join('');
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
function spAccent(){ try{ return (window.UISound && UISound.music && UISound.music.get().acc) || ''; }catch(e){ return ''; } }   // 🗣️ an-4
// 🎙️ an-6: the player's own voice on THIS device, per accent (voices live on the device, so it stays in localStorage)
function spWho(){ try{ return (UISound.music.state() || {}).who || ''; }catch(e){ return ''; } }
function spPicks(){ try{ return JSON.parse(localStorage.getItem('sp_voice_pick:' + spWho()) || '{}') || {}; }catch(e){ return {}; } }
function spPicked(){ return spPicks()[spAccent() || 'auto'] || ''; }
const SP_DEVICE = '__device__';   // 🎙️ an-7: 📱 Phone voice = no voice set, only the accent's lang → the phone's own voice for that country
const SPVoice = (() => {
  const FEMALE = /\b(female|woman|girl)\b|zira|aria|jenny|hazel|susan|catherine|libby|sonia|natasha|clara|emily|michelle|ana\b|samantha|victoria|karen|moira|tessa|fiona|serena|allison|ava\b|joanna|salli|kendra|kimberly|ivy|emma|amy|nicky|kate|joelle|matilda|martha|stephanie|flo\b|sandy|shelley|grandma|veena|google us english|google uk english female|heera|eva\b|linda|heather|zoe|nora|siri female/i;
  const MALE = /\b(male|man|boy)\b|david|mark\b|daniel|alex\b|fred|george|ryan|guy\b|james|tom\b|thomas|matthew|brian|joey|justin|aaron|arthur|oliver|rishi|gordon|lee\b|eddy|reed\b|rocko|grandpa|google uk english male|siri male/i;
  // 🎙️ an-6: joke voices (Apple novelty + Eloquence) never read by themselves · quality from the name OR the id (iPhone: plain "Kate", id …enhanced…)
  const FUN = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|princess|deranged|hysterical)(\s|\(|$)/i;
  // 🎙️ an-7: Apple's built-in Eloquence voices are real voices (older sound) — 🎛️ Classic: choosable, never auto-picked
  const RETRO = /^(eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley)(\s|\(|$)/i;
  function kind(v){ const n = (v.name || '') + ' ' + (v.voiceURI || ''); if(FUN.test(v.name || '') || /novelty/i.test(v.voiceURI || '')) return 'fun'; if(RETRO.test(v.name || '') || /eloquence/i.test(v.voiceURI || '')) return 'retro';
    if(/premium/i.test(n)) return 'premium'; if(/enhanced/i.test(n)) return 'enhanced'; if(/natural|neural|online|google/i.test(n)) return 'natural'; return 'basic'; }
  function label(v){ const k = kind(v), n = v.name || ''; return (k === 'enhanced' || k === 'premium') && !/enhanced|premium/i.test(n) ? n + ' (' + (k === 'enhanced' ? 'Enhanced' : 'Premium') + ')' : n; }
  function female(v){ const n = (v.name || '') + ' ' + (v.voiceURI || ''); return FEMALE.test(n) && !/google uk english male/i.test(n); }
  function score(v, lang){
    const n = (v.name || '') + ' ' + (v.voiceURI || ''), en = /^en/i.test(v.lang || ''), same = lang && (v.lang || '').toLowerCase().indexOf(lang.toLowerCase()) === 0;
    const female = FEMALE.test(n) && !/google uk english male/i.test(n), male = !female && MALE.test(n);
    let s = female ? 300 : male ? 0 : 150;
    if(v.localService) s += 60;
    if(same) s += 40; else if(en) s += 25; else s -= 200;
    if(v.default) s += 5;
    const acc = spAccent(); if(acc && String(v.lang || '').replace('_', '-').toLowerCase().indexOf(acc.toLowerCase()) === 0) s += 500;   // 🗣️ an-4: the player's accent first
    const k = kind(v); s += k === 'premium' ? 90 : k === 'enhanced' ? 80 : k === 'natural' ? 70 : k === 'fun' ? -600 : k === 'retro' ? -400 : 0;   // 🗣️ an-4 + 🎙️ an-6: the clearer voices, never a joke voice
    const pk = spPicked(); if(pk && (v.voiceURI || v.name) === pk) s += 5000;   // 🎙️ an-6: the player's own pick
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
  function refresh(){ try { const vs = window.speechSynthesis ? speechSynthesis.getVoices() : []; if(vs && vs.length){ const ok = vs.filter(v => (v.voiceURI || v.name) !== BAD); chosen = spPicked() === SP_DEVICE ? null : ok.length ? pick(ok, (document.documentElement.lang || navigator.language || 'en').slice(0, 2)) : null; /* 🎙️ an-7 */ } } catch(e){} }
  const st = {gen: 0, lastCancel: 0, unlocked: false, warned: false, log: []};
  function note(t){ st.log.push(t); if(st.log.length > 60) st.log.splice(0, 20); }
  function warnNoVoice(){
    if(st.warned) return; st.warned = true;
    try { if(window.UI && UI.toast) UI.toast('🔇 No reading voice yet — turn on Text-to-speech in Settings → Accessibility'); } catch(e){}
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
        try { if(u && !u.voice && u.volume !== 0){ if(spPicked() === SP_DEVICE){ u.lang = spAccent() || u.lang || 'en-US'; } else { if(!chosen) refresh(); if(chosen){ u.voice = chosen; u.lang = chosen.lang; } } } } catch(e){}   // 🎙️ an-7: 📱 Phone voice
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
  try{ let lastAcc = spAccent(); if(window.UISound && UISound.music) UISound.music.watch(() => { const a = spAccent(); if(a !== lastAcc){ lastAcc = a; refresh(); } }); }catch(e){}   // 🗣️ an-4: new accent → new voice
  function choose(id){ try{ const m = spPicks(), key = spAccent() || 'auto'; if(id) m[key] = id; else delete m[key]; localStorage.setItem('sp_voice_pick:' + spWho(), JSON.stringify(m)); }catch(e){}   // 🎙️ an-6
    if(id && BAD === id){ BAD = ''; try { localStorage.removeItem('sp_voice_bad'); } catch(e){} } refresh(); }
  return {DEVICE: SP_DEVICE, pick, score, kind, label, female, choose, picked: spPicked, bad: () => BAD, current: () => chosen, refresh, log: st.log, state: st, forget(){ BAD = ''; try { localStorage.removeItem('sp_voice_bad'); } catch(e){} refresh(); }};
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
  function backPage(fallback){ const i = backInfo(); if(i) return i.page; let f = fallback; if(typeof f === 'function') try{ f = f(); }catch(e){ f = ''; } return f ? (/[?&]page=/.test(f) ? pageOf(f) : f) : 'gameroom'; }   /* 📱 24g-f */
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

  // ---------- 🔘 .sp-btn buttons (📏 s3: stay in core — the Gameroom's 📡 Connect box uses them) ----------
  function btnCss(){
    if(document.getElementById('ui-spbtn-css')) return;
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
      + ':where(.sp-btn.sp-lg){min-height:54px;padding:12px 22px;font-size:1.12rem;border-radius:18px;}';
    const st = document.createElement('style'); st.id = 'ui-spbtn-css'; st.textContent = css; document.head.appendChild(st);
  }
  Object.assign(window.UI, {back: back, backInfo: backInfo, backLabel: backLabel, pageName: pageName, goHome: goHome, spButtonsCss: btnCss,
    _trail: {back, backInfo, backLabel, backPage, base, gameroomUrl, goHome, here, pageName, player, sq}});   // 📏 s3: UiKitPlay's 🎛️ bar reads these
  btnCss();
  /* 📏 s3: 🎛️ the bar + 🧭 navBar / navScreen + their CSS → UiKitPlay.html (game pages only) */
})();
/* 📏 s3: 📏 PAGE ROWS (p2) → UiKitPlay.html (game pages only; Code.gs INCLUDE_ALSO_ UiKit → UiKitPlay, INCLUDE_SKIP_ = shell pages) */
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

/* 📏 s3: 🏷️ CLASSIC TILE POINTS PICK (p4c) → UiKitPlay.html (game pages only; Code.gs INCLUDE_ALSO_ UiKit → UiKitPlay, INCLUDE_SKIP_ = shell pages) */

/* 📏 s3: 🧑 GAME BUDDY (p6) → UiKitPlay.html (game pages only; Code.gs INCLUDE_ALSO_ UiKit → UiKitPlay, INCLUDE_SKIP_ = shell pages) */
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
   · 🚪 opening call (a read sent before the page got any answer): no answer in 4 s (24p: 0.4 × UI_DEADLINE_MS) → ask again (both copies
     race, the first answer wins) → still nothing 8 s later (0.8 ×) → open the page again once (top link; harness: reload) → still nothing → 📡 card: 🔄 Reload · ⏳ Keep waiting · ◀ Back.
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
  const HEDGE_MS = () => Math.round(OPEN_MS() * 0.4), AGAIN_MS = () => Math.round(OPEN_MS() * 0.8);   // 🚪 24p: ask again at 4 s, reload at 12 s
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
    if(c.kind !== 'own') arm(c, c.kind === 'open' ? HEDGE_MS() : c.kind === 'read' ? READ_MS() : SAVE_MS());
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
    if(c.tries === 0){ c.tries = 1; note('ask again', c); fire(c); if(c.kind === 'open') doorAgain(); arm(c, c.kind === 'open' ? AGAIN_MS() : READ_MS()); return; }
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
    WD.answered = true; if(ok) WD.lastOk = Date.now();
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

  // ----- 🚪 DOOR WELCOME (24p, Aowu 2026-11-16 19:41 "add a little gameroom welcoming gesture") -----
  // A page opened with UI.go (the Gameroom tiles, the Dashboard, ◀ links) waits for its first server answer. If none came after 0.9 s,
  // the player's avatar waves at the door: "👋 Hi Mia! 🐍 Waking up the snakes…" (the game's own loader icon + text); at the 4 s ask-again
  // it says "📡 Still opening — asking again…"; gone the moment any answer lands (or the 📡 card takes over). Avatar = the device copy kept
  // by UI.buddy (sp_avc:<name>); no copy → a waving 👋. Never covers a tap (pointer-events none). Off: window.UI_DOOR = false.
  const DOOR = {el: null, raf: 0, t0: 0, again: false};
  function doorAv(name){ try { const a = JSON.parse(localStorage.getItem('sp_avc:' + name) || 'null'); return a && typeof a === 'object' ? a : null; } catch(e){ return null; } }
  function doorShow(d){
    if(DOOR.el || WD.answered || WD.card || !document.body) return;
    css();
    const name = d.who || (typeof CURRENT_PLAYER !== 'undefined' ? CURRENT_PLAYER : '') || '', av = name ? doorAv(name) : null;
    const el = document.createElement('div'); el.className = 'ui-door'; el.setAttribute('role', 'status');
    el.innerHTML = '<div class="ui-door-av">' + (av && window.Acting && typeof drawAvatar === 'function' ? '<canvas width="132" height="150"></canvas>' : '<span class="ui-door-wave">👋</span>') + '</div>'
      + '<div class="ui-door-tx"><b>' + (name ? '👋 Hi ' + esc(name) + '!' : '👋 Hi!') + '</b><span class="ui-door-go"><span class="ui-spin a-' + esc(d.an || 'bob') + '">' + esc(d.ic || '🎮') + '</span>&nbsp;' + esc(d.txt || 'Opening') + '<i class="ui-door-dots"><b>.</b><b>.</b><b>.</b></i></span></div>';
    gateOn(); document.body.appendChild(el); DOOR.el = el; DOOR.t0 = performance.now(); note('door'); if(DOOR.again) doorAgain();
    const cv = el.querySelector('canvas');
    if(cv){ const g = cv.getContext('2d'), who = {name: name, av: av};
      const tick = now => { if(!DOOR.el) return; g.clearRect(0, 0, cv.width, cv.height); try { Acting.draw(g, who, cv.width / 2, cv.height - 2, 1.5, 'wave', {t: (now - DOOR.t0) / 1000}); } catch(e){} DOOR.raf = requestAnimationFrame(tick); };
      DOOR.raf = requestAnimationFrame(tick); }
    const watch = () => { if(!DOOR.el) return; if(WD.answered || WD.card || performance.now() - DOOR.t0 > 20000) return doorHide(); setTimeout(watch, 150); };
    watch();
  }
  function doorAgain(){ if(DOOR.said) return; DOOR.again = true; if(!DOOR.el) return; DOOR.said = true; const g = DOOR.el.querySelector('.ui-door-go'); if(g) g.innerHTML = '<span class="ui-spin a-bob">📡</span>&nbsp;Still opening — asking again<i class="ui-door-dots"><b>.</b><b>.</b><b>.</b></i>'; }
  function doorHide(){ gateOff(); if(!DOOR.el) return; cancelAnimationFrame(DOOR.raf); const el = DOOR.el; DOOR.el = null; el.classList.add('out'); setTimeout(() => el.remove(), 260); }
  function door(){
    if(window.UI_DOOR === false) return;
    let d = null; try { d = JSON.parse(sessionStorage.getItem('sp_door') || 'null'); sessionStorage.removeItem('sp_door'); } catch(e){}
    if(!d || !(Date.now() - d.at < 30000)) d = {ic: '🔌', txt: 'Connecting', an: 'bob', at: Date.now()};   // 🔌 24q: every page checks its line
    setTimeout(() => doorShow(d), window.UI_DOOR_MS >= 0 ? window.UI_DOOR_MS : 900);
  }

  // ----- 🔌 CONNECTION GATE (24q, Aowu 2026-11-16 20:28 "check connection and restore connection before revealing the page") -----
  //   · every page sends ONE tiny wdPing as it opens (an opening call: ask again at 4 s, reload at 12 s, then the 📡 card), so even a page
  //     with no server call of its own knows its line works;
  //   · no answer after 0.9 s → the 🚪 welcome + a soft cover that holds taps until the first answer (a tap on a dead page did nothing anyway);
  //   · 🍎 back from the iPhone's page memory (pageshow.persisted — that copy's line is often dead): "👋 Welcome back" + a fresh check, same steps;
  //   · leaving after ≥ 90 s without an answer (UI.go): a wake-up ping first (≤ 1.5 s) so the next page finds the server awake.
  //   Off: window.UI_GATE = false (no ping / cover / pageshow check) · window.UI_WARM = false (no wake-up on leave).
  const GATE = {el: null};
  function gateOn(){ if(GATE.el || WD.answered || WD.card || !document.body || window.UI_GATE === false || own() || DOOR.noGate) return; css();   /* 🔧 24v: DOOR.noGate = back from memory */
    const el = document.createElement('div'); el.className = 'ui-gate'; el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el); GATE.el = el; note('gate'); }
  function gateOff(){ if(!GATE.el) return; const el = GATE.el; GATE.el = null; el.classList.add('out'); setTimeout(() => el.remove(), 260); }
  function ping(){ try { google.script.run.withSuccessHandler(() => {}).withFailureHandler(() => {}).wdPing(); } catch(e){} }
  function gateStart(){
    if(window.UI_GATE === false) return;
    const go = () => setTimeout(() => { if(!WD.answered && !own()) ping(); }, 0);   // after the page's own scripts (Pokadif keeps its own watchdog + card)
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }
  window.addEventListener('pageshow', e => {
    if(!e.persisted || !WD.active || window.UI_GATE === false) return;
    WD.answered = false; WD.t0 = Date.now(); WD.reloaded = false; DOOR.again = false; DOOR.said = false; DOOR.noGate = true; note('back from memory');   /* 🔧 24v: no tap-holding cover here */
    const who = typeof CURRENT_PLAYER !== 'undefined' ? CURRENT_PLAYER : '';
    setTimeout(() => doorShow({ic: '👋', txt: 'Welcome back — checking the line', an: 'bob', who: who, at: Date.now()}), 300);
    ping();
  });
  UI.__beforeGo = nav => {
    if(!WD.active || WD.dead || window.UI_WARM === false || window.UI_GATE === false) return false;
    if(Date.now() - (WD.lastOk || WD.t0) < 90000) return false;
    // 🔧 24v: send the wake-up ping but leave AT ONCE — waiting for it moved the page change out of the tap, and iPhone / iPad
    // (Home Screen app) then block the jump out of the frame: the loader just sat there (Aowu 2026-11-17 18:45)
    try { ORIG().withSuccessHandler(() => {}).withFailureHandler(() => {}).wdPing(); } catch(e){}
    note('warm'); return false;
  };

  // ----- the 📡 card -----
  function card(on, why){
    if(!on){ if(WD.card){ WD.card.remove(); WD.card = null; } return; }
    if(WD.card) return;
    css(); gateOff();
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
      + '.ui-door{position:fixed;left:50%;bottom:max(18px, env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483500;display:flex;align-items:center;gap:10px;padding:8px 18px 8px 8px;border-radius:999px;background:rgba(255,255,255,.96);color:#26203F;box-shadow:0 10px 28px rgba(20,14,50,.32);font-family:Fredoka,Nunito,sans-serif;pointer-events:none;animation:uiDoorIn .35s cubic-bezier(.2,1.4,.4,1);max-width:calc(100vw - 24px);box-sizing:border-box;}'
      + '.ui-gate{position:fixed;inset:0;z-index:2147483400;background:rgba(250,246,238,.55);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);animation:uiGateIn .3s ease-out;touch-action:none;} .ui-gate.out{opacity:0;transition:opacity .25s;} @keyframes uiGateIn{from{opacity:0;}to{opacity:1;}}'
      + '.ui-door.out{opacity:0;transform:translate(-50%,14px);transition:opacity .25s,transform .25s;}'
      + '.ui-door-av{width:58px;height:66px;flex:0 0 auto;display:flex;align-items:flex-end;justify-content:center;border-radius:50%;background:radial-gradient(circle at 50% 70%,#FFE9A8,#FFD1E8);overflow:hidden;} .ui-door-av canvas{width:58px;height:66px;}'
      + '.ui-door-wave{font-size:2rem;line-height:66px;display:inline-block;transform-origin:70% 80%;animation:uiDoorWave 1s ease-in-out infinite;}'
      + '.ui-door-tx{display:flex;flex-direction:column;line-height:1.25;min-width:0;} .ui-door-tx b{font-size:1.02rem;} .ui-door-go{font-weight:700;font-size:.92rem;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '.ui-door-dots b{display:inline-block;animation:uiDoorDot 1.2s infinite;} .ui-door-dots b:nth-child(2){animation-delay:.2s;} .ui-door-dots b:nth-child(3){animation-delay:.4s;}'
      + '@keyframes uiDoorIn{from{opacity:0;transform:translate(-50%,24px) scale(.9);}to{opacity:1;transform:translate(-50%,0);}} @keyframes uiDoorWave{0%,100%{transform:rotate(-12deg);}50%{transform:rotate(18deg);}} @keyframes uiDoorDot{0%,60%,100%{opacity:.25;}30%{opacity:1;}}'
      + '@media (prefers-reduced-motion:reduce){.ui-door,.ui-door-wave,.ui-door-dots b{animation:none;}}'
      + '@keyframes uiWdIn{from{opacity:0;transform:scale(.96);}to{opacity:1;transform:none;}} @keyframes uiWdZ{0%,100%{transform:translateY(0);opacity:.6;}50%{transform:translateY(-6px);opacity:1;}}';
    document.head.appendChild(st);
  }

  // ----- 💤 the full-page loader is up too long (no server call to blame, e.g. a blocked page change) -----
  let ldTimer = null;
  const LOADER_MS = () => (window.UI_WATCHDOG_MS > 0 ? window.UI_WATCHDOG_MS : 3000);   // ⏱️ an-1c: 3 s (Aowu 2026-11-18, was 25 s)
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
  WD.active = window.UI_GUARD !== false && !window.OfflineApp && wrap();
  if(WD.active){ if(document.body) door(); else document.addEventListener('DOMContentLoaded', door); gateStart(); }   // 🚪 24p · 🔌 24q   // 📲 the offline app answers from the device (its own queue) → no guard there

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
  UI.wd = {door: () => DOOR.el, doorShow: doorShow, gate: () => GATE.el, idle: ms => { WD.lastOk = Date.now() - ms; WD.t0 = Date.now() - ms; }, get active(){ return WD.active; }, calls: () => Object.keys(WD.calls).map(k => WD.calls[k]), pending: pend, card: () => WD.card, log: WD.log, flush: flush,
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
/* 📏 s3: 🏷️ RACK TAB SIZE (24e2) → UiKitPlay.html (game pages only; Code.gs INCLUDE_ALSO_ UiKit → UiKitPlay, INCLUDE_SKIP_ = shell pages) */
/* 📏 s3: 🪑 TABLE SCENE (24h) → UiKitPlay.html (game pages only; Code.gs INCLUDE_ALSO_ UiKit → UiKitPlay, INCLUDE_SKIP_ = shell pages) */
/* 📏 s3: 🕹️ PAD SIZE (pz-1) → UiKitPlay.html (game pages only; Code.gs INCLUDE_ALSO_ UiKit → UiKitPlay, INCLUDE_SKIP_ = shell pages) */
/* ================= 🎮 APP LOGO (ap-1 — ✨ polish chat 2026-11-16; Aowu 23:0x "steam ok" + 22:5x "App logo in shell") =================
   The code-drawn 🎮 STEAM Playground logo (GameLogos 'app', owned by the 🏷️ logo chat) in the shell — placement picture
   Claude outputs/logos/app/app-logo-placement.png (Run Order 24k follow-through). Works only on pages that include('GameLogos');
   everywhere else every call is a quiet no-op, so pages keep their old 🧪 / text title.
   API: UI.appLogo.has() · .ratio(kind) (h / w) · .mount(host, kind, px) → Promise<canvas|null> (waits ≤ 0.9 s for Fredoka, then
        repaints once the font lands; follows the player's look — GameLogos falls back to 'classic') · .fonts() · .LOG (tests).
   ⏳ boot loader: the FIRST UI.go of this tab to a shell page (Dashboard · Gameroom · Achievements · Collection · Room · Setup ·
        Station) shows the 72 px app badge above the loader's own icon + text; games keep their own loader. Off: window.UI_APPLOGO = false. */
(function(){
  if(!window.UI) return;
  const LOG = [];
  const has = () => window.UI_APPLOGO !== false && !!(window.GameLogos && GameLogos.has && GameLogos.has('app'));
  const look = () => { try { return document.documentElement.getAttribute('data-theme') || 'classic'; } catch(e){ return 'classic'; } };
  const ratio = kind => { try { const b = GameLogos.box('app', kind); return b ? b[1] / b[0] : 1; } catch(e){ return 1; } };
  let fontP = null, fontIn = false;
  function fonts(){
    if(fontP) return fontP;
    fontP = new Promise(res => { let done = false; const fin = () => { if(!done){ done = true; res(); } };
      try { if(document.fonts && document.fonts.check && document.fonts.check("700 40px 'Fredoka'")){ fontIn = true; fin(); }
        else if(document.fonts && document.fonts.load) document.fonts.load("700 40px 'Fredoka'").then(f => { if(f && f.length){ fontIn = true; try { GameLogos.clear(); } catch(e){} repaintAll(); } fin(); }, fin);
        else fin(); } catch(e){ fin(); }
      setTimeout(fin, 900); });
    return fontP;
  }
  const HOSTS = new Set();
  function paint(host){
    const kind = host.dataset.apKind, px = +host.dataset.apPx; if(!kind || !px || !has()) return null;
    let src = null; try { src = GameLogos.pic('app', kind, look(), px); } catch(e){}
    if(!src) return null;
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0);
    c.style.width = px + 'px'; c.style.height = Math.round(px * ratio(kind)) + 'px'; c.style.display = 'block'; c.className = 'ui-applogo-cv';
    c.setAttribute('aria-hidden', 'true');
    host.innerHTML = ''; host.appendChild(c); host.dataset.apLook = look();
    LOG.push({kind: kind, px: px, look: look(), font: fontIn, at: Date.now()});
    return c;
  }
  function repaintAll(){ HOSTS.forEach(h => { if(h.isConnected) paint(h); else HOSTS.delete(h); }); }
  function mount(host, kind, px){
    if(!host || !has()) return Promise.resolve(null);
    px = Math.max(16, Math.round(px));
    host.dataset.apKind = kind; host.dataset.apPx = px;
    host.style.width = px + 'px'; host.style.height = Math.round(px * ratio(kind)) + 'px';   // the space is kept at once, so nothing jumps when it paints
    HOSTS.add(host);
    return fonts().then(() => (host.dataset.apKind === kind && +host.dataset.apPx === px ? paint(host) : host.querySelector('canvas')));
  }
  // a new look → repaint in its colours (GameLogos keeps 'classic' until the logo chat adds the look)
  try { new MutationObserver(() => { HOSTS.forEach(h => { if(h.isConnected && h.dataset.apLook !== look()) paint(h); }); })
    .observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']}); } catch(e){}

  // ⏳ boot loader badge — first open of a shell page in this tab
  const SHELL = ['home', 'gameroom', 'achievements', 'collection', 'room', 'setup', 'station'];
  function bootBadge(url){
    if(!has()) return false;
    const m = /[?&]page=([^&#]+)/.exec(url || ''), to = m ? decodeURIComponent(m[1]) : 'home';
    if(SHELL.indexOf(to) < 0) return false;
    try { if(sessionStorage.getItem('sp_ap_boot') === '1') return false; sessionStorage.setItem('sp_ap_boot', '1'); } catch(e){}
    const box = document.querySelector('.ui-loader.on .ui-loader-box'); if(!box || box.querySelector('.ui-ap-badge')) return false;
    css();
    const w = document.createElement('div'); w.className = 'ui-ap-badge'; w.setAttribute('aria-hidden', 'true');
    const host = document.createElement('div'); host.className = 'ui-ap-host'; w.appendChild(host);
    box.insertBefore(w, box.firstChild);
    mount(host, 'badge', 72);
    LOG.push({k: 'boot', to: to});
    return true;
  }
  let cssDone = false;
  function css(){ if(cssDone) return; cssDone = true; const s = document.createElement('style'); s.id = 'ui-applogo-css';
    s.textContent = '.ui-ap-badge{position:relative;width:72px;height:72px;margin:6px auto 14px;animation:uiApIn .45s cubic-bezier(.2,1.5,.4,1) both;}'
      + '.ui-ap-badge::before{content:"";position:absolute;inset:-11px;border-radius:50%;border:3px dashed #F5B941;animation:uiApRing 6s linear infinite;}'
      + '.ui-ap-host{position:relative;width:72px;height:72px;border-radius:18px;}'
      + '@keyframes uiApIn{0%{transform:scale(.4);opacity:0;}100%{transform:none;opacity:1;}}@keyframes uiApRing{to{transform:rotate(360deg);}}'
      + '@media (prefers-reduced-motion:reduce){.ui-ap-badge,.ui-ap-badge::before{animation:none;}}';
    (document.head || document.documentElement).appendChild(s); }
  if(typeof UI.go === 'function' && !UI.go.apWrapped){
    const og = UI.go;
    UI.go = function(url){ const r = og.apply(this, arguments); try { bootBadge(url); } catch(e){} return r; };
    UI.go.apWrapped = true;
  }
  UI.appLogo = {has, ratio, mount, fonts, paint, bootBadge, LOG, SHELL};
})();
/* ================= 🎮 APP LOGO END ================= */
/* ================= 🔤 TEXT FIT (tx-1) START — Aowu 2026-11-16 02:5x "text always fits" + 2026-11-17 09:14 "go A" (Game Baseline plan §11d) =================
   One type scale + fitting helpers + floating things that keep off text. No game edits needed for the 💬 / 👇 / toast / pad parts.
   CSS vars   --tx-xs · --tx-s · --tx-m · --tx-l · --tx-xl (clamp by screen) · --tx-lh 1.3 · --tx-lh-th 1.55 · class .tx-num = tabular numbers · .tx-th / :lang(th) = Thai line height
   UI.fitText(el, {min: 12, max, lines: 1, short, icon, label, watch: true})  → 'fit' | 'shrink' | 'short' | 'icon' | 'tight'
        wrap (≤ lines) → shrink to min → short label → icon only (+ aria-label = the long text); never adds "…". Thai text gets line-height ≥ 1.5.
        Markup way: <b data-fit data-fit-min="12" data-fit-lines="2" data-short="Go" data-icon="▶">Start the race</b> → fitted on load / resize (UI.fitScan()).
   UI.fitCanvasText(g, text, {x, y, w, h}, {min: 12, max, font: '800 {px}px Fredoka, sans-serif', lines: 1, align: 'center', pad: 4, chip, color, short, draw: true})
        → {px, lines, fit} — size picked with measureText (cached), min is in SCREEN px (the canvas transform is read), chip = soft box behind. Plain words only (emoji → AvatarKit emo()).
   UI.avoid(el, {spots, ignore, pad})  → keeps a floating thing off visible text + controls: tries each spot in order, then the one with the least overlap.
        spot = {k, x, y, w, h, cls} in screen px (cls = a class the element wears there). Used by 💬 Tell us! (option A: full → 💬 dot → dot along the edges → edge tab) and the 👇 cue.
   UI.banner(text, {ms: 2400, kind: 'info'|'go'|'warn'|'ok', icon})  → 📣 message lane right under the game bar (or the top edge); max 2, ≤ 3 s unless ms says more.
   Toasts that would cover a button / pad move up into the lane; long notes get a short text.  Test: Test Harness fittext.js + textaudit.js (ratchet). */
(function(){
  if(!window.UI) return;
  const LOG = [];
  const css = ':root{--tx-xs:clamp(11px,0.6rem + 0.25vw,12.5px);--tx-s:clamp(13px,0.72rem + 0.3vw,14.5px);--tx-m:clamp(15px,0.86rem + 0.35vw,17px);--tx-l:clamp(17px,0.95rem + 0.7vw,22px);--tx-xl:clamp(22px,1.1rem + 1.5vw,34px);--tx-lh:1.3;--tx-lh-th:1.55;}'
    + '.tx-num{font-variant-numeric:tabular-nums;}.tx-th,:lang(th){line-height:var(--tx-lh-th);}'
    // 💬 Tell us! — dot + edge tab (option A) · moves glide
    + '.ui-fb-btn{transition:opacity .18s ease;}.ui-fb-btn.tx-fade{opacity:0 !important;}'   /* tx-1c: a move = a quick fade out → new spot → fade in (no sliding across the screen) */
    + '.ui-fb-btn.tx-dot{width:46px;height:46px;padding:0;gap:0;justify-content:center;font-size:0;}.ui-fb-btn.tx-dot .b{font-size:1.35rem;}.ui-fb-btn.tx-dot .l{display:none;}'
    + '.ui-fb-btn.tx-tab{width:34px;height:46px;padding:0;gap:0;justify-content:center;font-size:0;border-radius:0 999px 999px 0;opacity:.9;}.ui-fb-btn.tx-tab .b{font-size:1.1rem;}.ui-fb-btn.tx-tab .l{display:none;}'
    + '.ui-fb-btn.tx-tab.tx-r{border-radius:999px 0 0 999px;}'
    // 👇 cue — off its home it drops the centring transform; compact = 👇 only
    + '.ui-mg-more.tx-moved{transform:none;animation:uiTxBob 1.6s ease-in-out infinite;}@keyframes uiTxBob{50%{transform:translateY(-4px);}}'
    + '.ui-mg-more.tx-dot{font-size:0;width:46px;height:46px;padding:0;display:flex;align-items:center;justify-content:center;}.ui-mg-more.tx-dot::before{content:"👇";font-size:1.35rem;line-height:1;}'
    + '.ui-mg-more.tx-tab{width:34px;border-radius:999px 0 0 999px;}.ui-mg-more.tx-tab::before{font-size:1.1rem;}'
    + '@media (prefers-reduced-motion: reduce){.ui-mg-more.tx-moved{animation:none;}.ui-fb-btn.tx-moved{transition:none;}}'
    // 🕹️ pad buttons: icon above its label with a real gap (an emoji's box is taller than 1em)
    + '.pz-btn .ic{display:block;line-height:1.18;}.pz-btn .nm{display:block;line-height:1.18;margin-top:max(2px,calc(var(--sz) * 0.025));}'
    // 🌸 joystick skin on petal buttons (Aowu 09:59 photo "orange squares"): the skin ring follows the petal's shape, not its square box
    + 'html .sk-btns button.pz-pet{outline:none!important;filter:none;animation:none;}.sk-btns .pz-pet>svg.pz-shape{filter:drop-shadow(0 0 1.5px var(--sk-a)) drop-shadow(0 0 1.5px var(--sk-a)) drop-shadow(0 0 5px var(--sk-glow));}'
    // 📣 message lane + toast in the lane
    + '#ui-lane{position:fixed;left:50%;transform:translateX(-50%);z-index:6900;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;width:max-content;max-width:calc(100vw - 24px);}'
    + '.ui-ban{display:flex;align-items:center;gap:8px;max-width:100%;box-sizing:border-box;padding:8px 16px;border-radius:999px;font-family:var(--k-body,inherit);font-weight:800;font-size:var(--tx-m);line-height:1.3;'
    + 'background:var(--k-card,#fff);color:var(--k-ink,#2B2B2B);box-shadow:0 6px 18px rgba(0,0,0,.22);border:2px solid var(--k-a1,#C97B5D);animation:uiBanIn .28s cubic-bezier(.2,1.4,.4,1) both;text-align:center;}'
    + '.ui-ban.go{background:linear-gradient(135deg,#3BB273,#2E9AD0);color:#fff;border-color:#fff;}.ui-ban.warn{background:#FFF3D6;color:#6A4300;border-color:#F2B233;}.ui-ban.ok{border-color:#3BB273;}'
    + '.ui-ban .bi{font-size:1.2em;line-height:1;flex:none;}.ui-ban.out{animation:uiBanOut .25s ease-in both;}'
    + '@keyframes uiBanIn{from{opacity:0;transform:translateY(-10px) scale(.92);}to{opacity:1;transform:none;}}@keyframes uiBanOut{to{opacity:0;transform:translateY(-8px);}}'
    + '.ui-toast.tx-top{bottom:auto !important;height:auto !important;top:var(--tx-lane-top,12px);transform:translateX(-50%) translateY(-16px);}.ui-toast.tx-top.on{transform:translateX(-50%) translateY(0);}'
    + '@media (prefers-reduced-motion: reduce){.ui-ban,.ui-ban.out{animation:none;}}';
  function addCss(){ if(document.getElementById('ui-tx-css')) return; const s = document.createElement('style'); s.id = 'ui-tx-css'; s.textContent = css; (document.head || document.documentElement).appendChild(s); }
  if(document.head) addCss(); else document.addEventListener('DOMContentLoaded', addCss);

  const TH = /[฀-๿]/;
  // ---------- UI.fitText ----------
  const FIT = new Set();
  function lineH(cs){ const v = parseFloat(cs.lineHeight); return isFinite(v) ? v : parseFloat(cs.fontSize) * 1.25; }
  function fits(el, lines){
    if(el.scrollWidth > el.clientWidth + 1) return false;
    const cs = getComputedStyle(el), lh = lineH(cs), pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    if(el.clientHeight && el.scrollHeight > el.clientHeight + 1) return false;
    return (el.scrollHeight - pad) <= lh * lines + lh * 0.45;
  }
  function fitText(el, o){
    if(!el) return 'none'; o = Object.assign({}, el.__txFit || {}, o || {}); el.__txFit = o;
    const lab = o.label ? (typeof o.label === 'string' ? el.querySelector(o.label) : o.label) || el : el;
    if(el.__txLong == null) el.__txLong = lab.innerHTML;
    if(el.__txOrig == null) el.__txOrig = el.style.fontSize || '';   /* the page's own inline size stays the start size */
    if(el.__txMax == null){ el.style.fontSize = el.__txOrig; el.__txMax = o.max || parseFloat(getComputedStyle(el).fontSize) || 16; }
    const lines = Math.max(1, o.lines || 1), min = Math.min(o.min || 12, el.__txMax), max = el.__txMax;
    lab.innerHTML = el.__txLong; el.classList.remove('tx-icon');
    if(TH.test(lab.textContent) && parseFloat(getComputedStyle(el).lineHeight) / max < 1.5) el.style.lineHeight = '1.55';
    const tryAt = px => { el.style.fontSize = px + 'px'; return fits(el, lines); };
    const shrink = () => { if(tryAt(max)) return 'fit'; let lo = min, hi = max, best = null;
      for(let i = 0; i < 8 && hi - lo > 0.4; i++){ const m = (lo + hi) / 2; if(tryAt(m)){ best = m; lo = m; } else hi = m; }
      if(best == null && tryAt(min)) best = min; if(best != null){ el.style.fontSize = best + 'px'; return 'shrink'; } return null; };
    let r = shrink();
    if(!r && o.short){ lab.textContent = o.short; el.setAttribute('aria-label', el.__txLongText || (el.__txLongText = tmpText(el.__txLong))); r = shrink(); if(r) r = 'short'; }
    if(!r && o.icon){ lab.textContent = o.icon; el.classList.add('tx-icon'); el.setAttribute('aria-label', el.__txLongText || tmpText(el.__txLong)); el.style.fontSize = max + 'px'; r = 'icon'; }
    if(!r){ el.style.fontSize = min + 'px'; r = 'tight'; }
    el.dataset.txFit = r; LOG.push({k: 'fit', r, t: (lab.textContent || '').slice(0, 24)});
    if(o.watch !== false && !FIT.has(el)){ FIT.add(el); watch(el); }
    return r;
  }
  const tmpText = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.trim(); };
  let RO = null; const roLast = new WeakMap();
  function watch(el){
    if(!window.ResizeObserver) return; const box = el.parentElement || el;
    if(!RO) RO = new ResizeObserver(es => { for(const e of es){ const w = Math.round(e.contentRect.width), h = Math.round(e.contentRect.height), k = w + 'x' + h;
      if(w < 8 || roLast.get(e.target) === k) continue; roLast.set(e.target, k); FIT.forEach(f => { if(f.isConnected && (f.parentElement || f) === e.target) refit(f); }); } });
    RO.observe(box);
  }
  function refit(el){ if(!el.isConnected || el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return; el.style.fontSize = el.__txOrig || ''; el.__txMax = null; fitText(el); }
  function fitScan(root){ (root || document).querySelectorAll('[data-fit]:not(.gb)').forEach(el => fitText(el, {min: +el.dataset.fitMin || 12, lines: +el.dataset.fitLines || 1, short: el.dataset.short, icon: el.dataset.icon})); }
  addEventListener('resize', () => { clearTimeout(fitScan.t); fitScan.t = setTimeout(() => FIT.forEach(refit), 120); });
  document.addEventListener('DOMContentLoaded', () => setTimeout(fitScan, 0));

  // ---------- UI.fitCanvasText ----------
  const CFIT = new Map();
  function fitCanvasText(g, text, box, o){
    o = o || {}; text = String(text == null ? '' : text); if(!g || !text) return {px: 0, lines: [], fit: true};
    const font = o.font || '800 {px}px Fredoka, Nunito, sans-serif', pad = o.pad == null ? 4 : o.pad, nl = Math.max(1, o.lines || 1);
    let sc = 1; try { const m = g.getTransform(); sc = Math.hypot(m.a, m.b) / (o.dpr || window.devicePixelRatio || 1) || 1; } catch(e){}
    const W = Math.max(1, box.w - pad * 2), H = Math.max(1, box.h - pad * 2), min = (o.min || 12) / sc, max = Math.min(o.max || H, H / (nl * 1.18));
    const key = font + '|' + text + '|' + Math.round(W) + '|' + Math.round(H) + '|' + nl + '|' + Math.round(min * 10);
    let r = CFIT.get(key);
    if(!r){
      const at = px => { g.font = font.replace('{px}', px.toFixed(1)); return g; };
      const wrap = (px, t) => { at(px); if(nl === 1 || g.measureText(t).width <= W) return [t]; const ws = t.split(/\s+/); let best = null;
        for(let i = 1; i < ws.length; i++){ const a = ws.slice(0, i).join(' '), b = ws.slice(i).join(' '), w = Math.max(g.measureText(a).width, g.measureText(b).width); if(!best || w < best.w) best = {w, l: [a, b]}; }
        return best ? best.l : [t]; };
      const ok = (px, t) => { const ls = wrap(px, t); at(px); return ls.length <= nl && ls.every(l => g.measureText(l).width <= W) && ls.length * px * 1.18 <= H + 0.5 ? ls : null; };
      const solve = t => { if(max >= min && ok(max, t)) return {px: max, lines: ok(max, t), fit: true}; let lo = min, hi = Math.max(min, max), best = null;
        for(let i = 0; i < 10 && hi - lo > 0.25; i++){ const m = (lo + hi) / 2; if(ok(m, t)){ best = m; lo = m; } else hi = m; }
        if(best == null && ok(min, t)) best = min; return best == null ? null : {px: best, lines: ok(best, t), fit: true}; };
      r = solve(text) || (o.short && solve(String(o.short))) || {px: min, lines: wrap(min, text).slice(0, nl), fit: false};
      if(CFIT.size > 600) CFIT.clear(); CFIT.set(key, r);
    }
    if(o.draw !== false){
      g.save(); g.font = font.replace('{px}', r.px.toFixed(1)); g.textBaseline = 'middle';
      const al = o.align || 'center', lh = r.px * 1.18, cy = box.y + box.h / 2 - (r.lines.length - 1) * lh / 2;
      const x = al === 'left' ? box.x + pad : al === 'right' ? box.x + box.w - pad : box.x + box.w / 2; g.textAlign = al;
      if(o.chip){ const w = Math.max(...r.lines.map(l => g.measureText(l).width)) + pad * 2 + 6, h = r.lines.length * lh + pad * 2, cx = al === 'left' ? x - pad : al === 'right' ? x - w + pad : x - w / 2;
        g.fillStyle = o.chip; g.beginPath(); const rr = Math.min(h / 2, 10); if(g.roundRect) g.roundRect(cx, cy - lh / 2 - pad, w, h, rr); else g.rect(cx, cy - lh / 2 - pad, w, h); g.fill(); }
      if(o.stroke){ g.lineJoin = 'round'; g.lineWidth = Math.max(2, r.px * 0.18); g.strokeStyle = o.stroke; r.lines.forEach((l, i) => g.strokeText(l, x, cy + i * lh)); }
      g.fillStyle = o.color || '#fff'; r.lines.forEach((l, i) => g.fillText(l, x, cy + i * lh)); g.restore();
    }
    return r;
  }

  // ---------- UI.avoid: keep a floating thing off visible text + controls ----------
  const CTRL = 'button,a[href],input,select,textarea,[role="button"],.pz-btn,.sp-btn';
  function seen(e){ if(!e) return false; if(e.closest('[aria-hidden="true"], .hidden, template, script, style')) return false;
    if(e.checkVisibility) return e.checkVisibility({opacityProperty: true, visibilityProperty: true}); const cs = getComputedStyle(e); return cs.visibility !== 'hidden' && cs.display !== 'none'; }
  const PASS = new WeakMap();
  function passing(p){ if(PASS.has(p)) return PASS.get(p); let e = p, r = false;   /* a passing label: pointer-events none on a floating box (bubbles, pop words, tags) */
    for(let i = 0; e && e !== document.body && i < 3; i++, e = e.parentElement){ const cs = getComputedStyle(e); if(cs.pointerEvents === 'none' && /absolute|fixed/.test(cs.position) && !e.closest(CTRL)){ r = true; break; } }
    PASS.set(p, r); return r; }
  function obstacles(ign){
    const W = innerWidth, H = innerHeight, out = [], skip = n => ign.some(x => x && (x === n || x.contains(n)));
    const vis = new Map(), isVis = e => { if(!vis.has(e)) vis.set(e, seen(e)); return vis.get(e); };
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {acceptNode: n => n.textContent.trim() ? 1 : 2});
    const r = document.createRange();
    for(let n, i = 0; (n = tw.nextNode()) && i < 6000; i++){
      const p = n.parentElement; if(!p || skip(p) || passing(p)) continue;
      r.selectNodeContents(n); const rs = r.getClientRects(); let any = false;
      for(const q of rs){ if(q.width < 2 || q.height < 2 || q.right < 0 || q.bottom < 0 || q.left > W || q.top > H) continue; if(!any){ if(!isVis(p)) break; any = true; } out.push({l: q.left, t: q.top, r: q.right, b: q.bottom, k: 't'}); }
    }
    document.querySelectorAll(CTRL).forEach(e => { if(skip(e)) return; const q = e.getBoundingClientRect(); if(q.width < 4 || q.height < 4 || q.right < 0 || q.bottom < 0 || q.left > W || q.top > H) return;
      if(q.width * q.height > W * H * 0.45 || !isVis(e)) return; out.push({l: q.left, t: q.top, r: q.right, b: q.bottom, k: 'c'}); });
    return out;
  }
  function overlap(s, obs, pad){ let a = 0; const l = s.x - pad, t = s.y - pad, r = s.x + s.w + pad, b = s.y + s.h + pad;
    for(const o of obs){ const w = Math.min(r, o.r) - Math.max(l, o.l), h = Math.min(b, o.b) - Math.max(t, o.t); if(w > 0.5 && h > 0.5) a += w * h * (o.k === 'c' ? 2 : 1); } return a; }
  // calm moves (tx-1b, Aowu 10:51 "the 💬 dot runs around like crazy"): keep the spot it has while that spot is free · go home only after home was free
  // twice in a row · move away only after the spot was covered twice in a row (≈ 1.4 s — passing bubbles / rotating tips don't count) · nothing free → stay put
  function screenKey(){ return [...document.querySelectorAll('section.screen:not(.hidden), .screen.on, .gf-cover:not(.hidden), .gf-open')].filter(e => e.offsetParent !== null || e === document.body).map(e => e.id || String(e.className).split(' ')[0]).join(',') + '|' + innerWidth + 'x' + innerHeight; }
  const same = (a, b) => a && b && a.k === b.k && Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2;
  function avoid(el, o){
    if(!el || !el.isConnected || el.classList.contains('hidden') || getComputedStyle(el).display === 'none') return null;
    const spots = (typeof o.spots === 'function' ? o.spots() : o.spots) || []; if(!spots.length) return null;
    const obs = obstacles([el].concat(o.ignore ? [].concat(o.ignore).map(x => typeof x === 'string' ? document.querySelector(x) : x) : []));
    const pad = o.pad == null ? 4 : o.pad, st = el.__txAv || (el.__txAv = {cur: null, homeOk: 0, curBad: 0, at: 0}), home = spots[0];
    const free = sp => overlap(sp, obs, pad) === 0;
    let cur = st.cur && (st.cur.home ? home : st.cur), pick = null, why = '';
    const scr = screenKey(); if(scr !== st.scr){ st.scr = scr; st.scrAt = Date.now(); st.homeOk = 0; st.curBad = 0; }
    const N = Date.now() - (st.scrAt || 0) < 3000 ? 1 : 3;   /* a new screen settles for 3 s → place at once; after that it moves only after ~2 s covered (3 checks) */
    if(free(home)){ st.homeOk++; if(!cur || cur.home || st.homeOk >= N){ pick = home; why = 'home'; } } else st.homeOk = 0;
    const rank = sp => sp.home ? 0 : /tab/.test(sp.cls || '') ? 2 : 1;
    if(!pick && cur && !cur.home){ if(free(cur)){ st.curBad = 0; pick = cur; why = 'keep';
        if(rank(cur) === 2){ const up = spots.find(sp => rank(sp) === 1 && free(sp)); if(up){ pick = up; why = 'up'; } } }   /* an edge tab steps back up to a 💬 dot once one is free */
      else if(++st.curBad < N && st.cur){ pick = cur; why = 'wait'; } }
    if(!pick && cur && cur.home && !free(home) && st.cur && ++st.curBad < N){ pick = home; why = 'wait'; }
    if(!pick){ let best = null;
      for(let i = 1; i < spots.length; i++){ const sp = spots[i], a = overlap(sp, obs, pad); if(a === 0){ best = sp; break; } if(!best || a < best.a - 1) best = Object.assign({a}, sp); }
      if(best && best.a && cur){ const ca = overlap(cur, obs, pad); if(ca <= best.a + 40){ best = cur; why = 'stay'; } }   /* nothing free: don't hop between "less bad" spots that are about the same */
      pick = best; why = why || 'move'; st.curBad = 0; }
    if(pick && !same(pick, st.cur)){ o.place(pick); st.at = Date.now(); } else if(pick && pick.home && st.cur && st.cur.home) o.place(pick);
    st.cur = pick; LOG.push({k: 'avoid', id: el.id || el.className, spot: pick && pick.k, why, a: pick && pick.a || 0}); return pick;
  }


  // ---------- 💬 Tell us! — option A: full at home → 💬 dot at home → dot along the left / right / bottom edges → edge tab → least overlap ----------
  const SAFE = () => { const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-b')); return isFinite(v) && v > 0 ? v : 18; };
  // measure where the page's CSS puts a floating thing WITHOUT touching it: a hidden copy with the tx classes removed (tx-1b)
  function probe(el, strip){ const c = el.cloneNode(true); c.removeAttribute('id'); c.classList.add('tx-probe'); strip.forEach(k => c.classList.remove(k));
    c.style.left = ''; c.style.top = ''; c.style.bottom = ''; c.style.right = ''; c.style.visibility = 'hidden'; c.style.transition = 'none'; c.style.animation = 'none'; c.setAttribute('aria-hidden', 'true');
    el.parentNode.appendChild(c); const q = c.getBoundingClientRect(); c.remove(); return q; }
  function fbSpots(btn){
    // home = where the page's own CSS puts it (UiKit: bottom-left · GameFrame cover: top-right) — measured with our inline spot taken off
    const W = innerWidth, H = innerHeight, sb = SAFE(), out = [], top = Math.max(64, H * 0.16);
    const q = probe(btn, ['tx-dot', 'tx-tab', 'tx-r', 'tx-moved']), fw = q.width || 110, fh = q.height || 42, hx = q.left, hy = q.top, right = hx + fw / 2 > W / 2, low = hy + fh / 2 > H / 2;
    out.push({k: 'home', x: hx, y: hy, w: fw, h: fh, cls: '', home: true});
    const D = 46, dx0 = right ? q.right - D : hx, dy0 = low ? q.bottom - D : hy;
    out.push({k: 'dot', x: dx0, y: dy0, w: D, h: D, cls: 'tx-dot'});
    const side = [], yTop = low ? top : Math.max(8, hy), yBot = H - sb - D;
    for(let y = yBot; y >= yTop; y -= 14){ side.push({k: 'dotL', x: 12, y, w: D, h: D, cls: 'tx-dot'}); side.push({k: 'dotR', x: W - 12 - D, y, w: D, h: D, cls: 'tx-dot'}); }
    for(let x = 12 + 24; x <= W - 12 - D; x += 22) side.push({k: low ? 'dotB' : 'dotT', x, y: low ? yBot : dy0, w: D, h: D, cls: 'tx-dot'});
    side.sort((a, b) => Math.hypot(a.x - dx0, a.y - dy0) - Math.hypot(b.x - dx0, b.y - dy0)); out.push(...side);
    for(let y = yBot; y >= yTop; y -= 14){ out.push({k: 'tabL', x: 0, y, w: 34, h: D, cls: 'tx-tab'}); out.push({k: 'tabR', x: W - 34, y, w: 34, h: D, cls: 'tx-tab tx-r'}); }
    return out;
  }
  function fbPlace(btn, s){
    const pk = s.k + Math.round(s.x) + ',' + Math.round(s.y); if(btn.__txPos && btn.__txPos !== pk && !matchMedia('(prefers-reduced-motion: reduce)').matches && btn.offsetParent !== null){   /* fade out, jump, fade in */
      btn.classList.add('tx-fade'); clearTimeout(btn.__txF); btn.__txF = setTimeout(() => { fbPut(btn, s); requestAnimationFrame(() => btn.classList.remove('tx-fade')); }, 190); return; }
    fbPut(btn, s);
  }
  function fbPut(btn, s){
    btn.__txPos = s.k + Math.round(s.x) + ',' + Math.round(s.y);
    btn.classList.remove('tx-dot', 'tx-tab', 'tx-r'); if(s.cls) s.cls.split(' ').forEach(c => btn.classList.add(c));
    if(s.home){ btn.style.left = ''; btn.style.top = ''; btn.style.bottom = ''; btn.style.right = ''; } else { btn.classList.add('tx-moved'); btn.style.left = Math.round(s.x) + 'px'; btn.style.top = Math.round(s.y) + 'px'; btn.style.bottom = 'auto'; btn.style.right = 'auto'; }
    btn.dataset.txSpot = s.k;
  }
  function fbLabel(btn){ if(btn.querySelector('.l')) return; for(const n of [...btn.childNodes]) if(n.nodeType === 3 && n.textContent.trim()){ const s = document.createElement('span'); s.className = 'l'; s.textContent = n.textContent; n.replaceWith(s); } }
  // 👇 cue: home = bottom centre with its words → along the bottom → 👇 dot along the bottom + edges
  function cueSpots(el){
    const W = innerWidth, H = innerHeight, sb = SAFE(), pq = probe(el, ['tx-dot', 'tx-moved', 'tx-tab']); const fw = pq.width || 180, fh = pq.height || 38, y = H - sb - 4 - fh, out = [];
    out.push({k: 'home', x: (W - fw) / 2, y: y - 6, w: fw, h: fh + 6, cls: '', home: true});
    const xs = []; for(let x = 12; x <= W - 12 - fw; x += 20) xs.push(x); xs.sort((a, b) => Math.abs(a - (W - fw) / 2) - Math.abs(b - (W - fw) / 2));
    xs.forEach(x => out.push({k: 'row', x, y: y - 6, w: fw, h: fh + 6, cls: 'tx-moved'}));
    const D = 46, dy = H - sb - 4 - D, ds = [];
    for(let x = 12; x <= W - 12 - D; x += 18) ds.push({k: 'dotB', x, y: dy - 6, w: D, h: D + 6, cls: 'tx-moved tx-dot'});
    for(let yy = dy; yy >= H * 0.45; yy -= 16){ ds.push({k: 'dotR', x: W - 12 - D, y: yy - 6, w: D, h: D + 6, cls: 'tx-moved tx-dot'}); ds.push({k: 'dotL', x: 12, y: yy - 6, w: D, h: D + 6, cls: 'tx-moved tx-dot'}); }
    ds.sort((a, b) => Math.hypot(a.x + D / 2 - W / 2, a.y - dy) - Math.hypot(b.x + D / 2 - W / 2, b.y - dy)); out.push(...ds);
    for(let yy = dy; yy >= H * 0.45; yy -= 16) out.push({k: 'tabR', x: W - 34, y: yy - 6, w: 34, h: D + 6, cls: 'tx-moved tx-dot tx-tab'});   /* last: a 👇 tab on the right edge */
    return out;
  }
  function cuePlace(el, s){ el.classList.remove('tx-dot', 'tx-moved', 'tx-tab'); if(s.cls) s.cls.split(' ').forEach(c => el.classList.add(c));
    if(s.home){ el.style.left = ''; el.style.top = ''; el.style.bottom = ''; } else { el.style.left = Math.round(s.x) + 'px'; el.style.top = Math.round(s.y + 6) + 'px'; el.style.bottom = 'auto'; } el.dataset.txSpot = s.k; }

  let dirty = true, lastSig = '', busy = false, lastRun = 0;
  function sig(){ const fb = document.getElementById('ui-fb-btn'), cue = document.querySelector('.ui-mg-more');
    return innerWidth + 'x' + innerHeight + '|' + (fb ? fb.className.replace(/\s*tx-\S+/g, '') : '-') + '|' + (cue ? cue.className.replace(/\s*tx-\S+/g, '') : '-') + '|' + Math.round(scrollY); }
  function tick(force){
    if(busy || document.hidden || window.UI_TXAVOID === false) return; const s = sig(), now = Date.now(); if(!force && !dirty && s === lastSig && now - lastRun < 2000) return;   /* + a look every 2 s: entrance animations move words without any DOM change */
    busy = true; dirty = false; lastSig = s; lastRun = now;
    try {
      const cue = document.querySelector('.ui-mg-more'), fb = document.getElementById('ui-fb-btn');
      if(cue && !cue.classList.contains('hidden')) avoid(cue, {spots: () => cueSpots(cue), place: sp => cuePlace(cue, sp), ignore: [fb], pad: 4});
      if(fb && document.querySelector('#scr-play:not(.hidden), #scr-game:not(.hidden)')) fb.classList.add('hidden');   /* same rule as Tell us! itself, but at once (its own check runs every 0.7 s) */
      if(fb){ fbLabel(fb); if(!fb.classList.contains('hidden')) avoid(fb, {spots: () => fbSpots(fb), place: sp => fbPlace(fb, sp), pad: 4}); }
    } catch(e){ LOG.push({k: 'err', m: String(e && e.message || e)}); }
    busy = false; lastSig = sig();
  }
  const MINE = n => n && n.nodeType === 1 && (n.id === 'ui-fb-btn' || n.classList && (n.classList.contains('ui-mg-more') || n.classList.contains('ui-toast') || n.classList.contains('tx-probe') || n.classList.contains('ui-fb-btn')) || n.id === 'ui-lane');
  function start(){
    if(!document.body) return; addCss();
    let pend = 0; const soon = () => { if(!pend) pend = setTimeout(() => { pend = 0; tick(); }, 120); };
    try { new MutationObserver(rs => { for(const r of rs) if(!MINE(r.target) && !(r.type === 'childList' && [...r.addedNodes].every(MINE) && [...r.removedNodes].every(MINE))){ dirty = true; soon(); break; } })
      .observe(document.body, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'hidden']}); } catch(e){}
    let st = 0; addEventListener('scroll', () => { clearTimeout(st); st = setTimeout(() => { dirty = true; tick(); }, 180); }, {passive: true, capture: true});
    addEventListener('resize', () => { dirty = true; setTimeout(tick, 60); });
    setInterval(tick, 700); setTimeout(() => tick(true), 300);
    // toasts that would sit on a button / pad go up into the message lane
    const watchToast = () => { const t = document.querySelector('.ui-toast'); if(!t || t.__tx) return !!t; t.__tx = true;
      new MutationObserver(() => { const on = t.classList.contains('on'); if(on === t.__txOn) return; t.__txOn = on; if(!on) return;   /* act once per show (class writes below re-fire this observer) */
        if(t.classList.contains('tx-top')) t.classList.remove('tx-top'); requestAnimationFrame(() => {
        const q = t.getBoundingClientRect(), box = {x: q.left, y: q.top - 20, w: q.width, h: q.height + 20}; const obs = obstacles([t]).filter(o => o.k === 'c');
        if(overlap(box, obs, 4) > 0){ document.documentElement.style.setProperty('--tx-lane-top', laneTop() + 'px'); t.classList.add('tx-top'); LOG.push({k: 'toast', top: true}); } }); })
        .observe(t, {attributes: true, attributeFilter: ['class']}); return true; };
    const tw = setInterval(() => { if(watchToast()) clearInterval(tw); }, 500);
    if(typeof UI.toast === 'function' && !UI.toast.txWrapped){ const og = UI.toast; UI.toast = function(){ const r = og.apply(this, arguments); try { watchToast(); } catch(e){} return r; }; UI.toast.txWrapped = true; }   /* the first toast makes the element: watch it before its 'on' lands */
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  // ---------- 📣 message lane ----------
  function laneTop(){ let y = 0; document.querySelectorAll('.gb, #gbar, .hud, .ui-gamebar').forEach(b => { if(b.offsetParent === null && getComputedStyle(b).position !== 'fixed') return; const q = b.getBoundingClientRect(); if(q.height > 0 && q.top < innerHeight * 0.3 && q.bottom > y) y = q.bottom; });
    return Math.round(Math.max(y, 0) + 8); }
  function banner(text, o){
    o = o || {}; addCss(); let lane = document.getElementById('ui-lane');
    if(!lane){ lane = document.createElement('div'); lane.id = 'ui-lane'; lane.setAttribute('role', 'status'); lane.setAttribute('aria-live', 'polite'); document.body.appendChild(lane); }
    lane.style.top = laneTop() + 'px';
    while(lane.children.length >= 2) lane.firstChild.remove();
    const b = document.createElement('div'); b.className = 'ui-ban ' + (o.kind || 'info');
    b.innerHTML = (o.icon ? '<span class="bi">' + UI.esc(o.icon) + '</span>' : '') + '<span class="bt">' + UI.esc(text) + '</span>'; lane.appendChild(b);
    const ms = Math.max(800, o.ms || Math.min(3000, 1600 + String(text).length * 30));
    const close = () => { if(!b.isConnected) return; b.classList.add('out'); setTimeout(() => b.remove(), 260); };
    b.__t = setTimeout(close, ms); LOG.push({k: 'banner', t: String(text).slice(0, 30), ms}); return {el: b, close};
  }
  Object.assign(window.UI, {fitText, fitScan, fitCanvasText, avoid, banner, laneTop, TX_LOG: LOG, txTick: () => tick(true)});
})();
/* ================= 🔤 TEXT FIT (tx-1) END ================= */
/* ================= ☕ HOME MUSIC (an-5, ✨ polish chat 2026-11-18) =================
   Aowu 20:17: "add home (dashboard + gameroom) sound for lofi cozy soft feeling at a random picker so it doesnt get bored".
   UI.homeMusic() = a soft lofi mood (UISound.mood family 'lofi': 7th chords, mellow piano / bells, soft kick + hats, vinyl crackle,
   warm low filter). 4 mixes × 3 tunes = 12, picked at random (never the one just heard); moving Dashboard ⇄ Gameroom keeps the same
   mix for 10 minutes so it doesn't jump. Same per-player 🎵 on / off + volume as the games; a small 🎵 button (only while it plays,
   kept off words + buttons by UI.avoid) opens the 🎵 sheet. Off: window.UI_HOMEMUSIC = false. Test hooks: UI.homeMusic.MIXES · .last */
(function(){
  window.UI = window.UI || {};
  const MIXES = [
    {k: 'cafe', name: '☕ Cozy café', key: 'F', scale: 'major', bpm: 74, lead: 'piano'},
    {k: 'rain', name: '🌧️ Rainy window', key: 'D', scale: 'dorian', bpm: 70, lead: 'marimba', crackle: .45, kick: [0, 11]},
    {k: 'stars', name: '🌙 Starry night', key: 'Ab', scale: 'major', bpm: 66, lead: 'bell', leadGain: .7, sparkle: .35, percFrom: 2},
    {k: 'sunset', name: '🌅 Sunset walk', key: 'C', scale: 'major', bpm: 80, lead: 'pluck', leadGain: .8, hat: [2, 6, 10, 14]}
  ];
  const KEY = 'sp_home_mix';
  function choose(){
    let last = null; try{ last = JSON.parse(localStorage.getItem(KEY) || 'null'); }catch(e){}
    if(last && MIXES[last.m] && Date.now() - (last.at || 0) < 10 * 60 * 1000) return last;   // same mix across Dashboard ⇄ Gameroom for 10 min
    const all = []; MIXES.forEach((x, m) => [0, 1, 2].forEach(t => { if(!last || last.m !== m || last.t !== t) all.push({m, t}); }));
    let pick = all[Math.floor(Math.random() * all.length)];
    if(last && all.some(p => p.m !== last.m)){ const other = all.filter(p => p.m !== last.m); pick = other[Math.floor(Math.random() * other.length)]; }   // a new mix each time (not just a new tune)
    return {m: pick.m, t: pick.t};
  }
  let btn = null, timer = 0;
  function button(){
    if(btn) return btn;
    btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ui-homemus'; btn.setAttribute('data-sound', 'tap'); btn.textContent = '🎵';
    btn.title = 'Music'; btn.setAttribute('aria-label', 'Music');
    btn.style.cssText = 'position:fixed;z-index:80;width:46px;height:46px;border-radius:50%;border:0;background:rgba(255,255,255,.92);box-shadow:0 3px 10px rgba(0,0,0,.25);font-size:1.3rem;cursor:pointer;left:10px;bottom:calc(var(--safe-b, 18px) + 64px);display:flex;align-items:center;justify-content:center;';
    btn.onclick = e => { e.stopPropagation(); try{ UISound.music.sheet(btn); }catch(err){} };
    document.body.appendChild(btn); return btn;
  }
  function place(){
    if(!btn || !UI.avoid) return; const W = innerWidth, H = innerHeight, sb = 18 + 64;
    const spots = [{k: 'bl', home: true, x: 10, y: H - sb - 46, w: 46, h: 46}, {k: 'ml', x: 6, y: Math.round(H * .45), w: 46, h: 46}, {k: 'tl', x: 10, y: 74, w: 46, h: 46},
      {k: 'mr', x: W - 52, y: Math.round(H * .45), w: 46, h: 46}, {k: 'tr', x: W - 56, y: 74, w: 46, h: 46}];
    try{ UI.avoid(btn, {spots: spots, place: sp => { btn.style.left = sp.x + 'px'; btn.style.top = sp.y + 'px'; btn.style.bottom = 'auto'; }}); }catch(e){}
  }
  function home(o){
    o = o || {};
    if(window.UI_HOMEMUSIC === false || !(window.UISound && UISound.mood)) return null;
    const c = choose(); try{ localStorage.setItem(KEY, JSON.stringify({m: c.m, t: c.t, at: c.at && Date.now() - c.at < 10 * 60 * 1000 ? c.at : Date.now()})); }catch(e){}
    const X = MIXES[c.m];
    const R = Object.assign({fam: 'lofi', id: 'home-' + X.k}, X);
    const h = UISound.mood(R, {tune: c.t});
    home.last = {mix: X.k, name: X.name, tune: c.t, live: !!(h && h.live)};
    if(h && h.live){ try{ h.tension(.1); }catch(e){} button(); place(); clearInterval(timer); timer = setInterval(place, 1500); }
    return h;
  }
  home.MIXES = MIXES; home.choose = choose;
  UI.homeMusic = home;
})();
/* ================= ☕ HOME MUSIC (an-5) END ================= */
