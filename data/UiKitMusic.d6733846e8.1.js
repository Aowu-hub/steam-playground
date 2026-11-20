
(function(){
  const K = window.UISound && UISound._k;
  if(!K) return;
  // the approved sample sounds (listening page 24u) — kept apart from INSTR so the moods sound exactly as Aowu heard them
  const MINSTR = {
    piano: [[1, 'triangle', 1, 1, .005], [2, 'sine', .35, .55, .005], [3, 'sine', .12, .3, .005]],
    bell: [[1, 'sine', 1, 1, .004], [2.76, 'sine', .45, .6, .004], [5.4, 'sine', .18, .35, .004]],
    marimba: [[1, 'sine', 1, 1, .004], [4, 'sine', .3, .25, .003]],
    pluck: [[1, 'sawtooth', .4, .7, .003], [2, 'triangle', .4, .5, .003]],
    flute: [[1, 'sine', 1, 1, .06], [2, 'sine', .12, 1, .08]],
    bass: [[1, 'triangle', 1, 1, .01], [.5, 'sine', .6, 1, .01]],
    chip: [[1, 'square', .45, 1, .003]],
    pad: [[1, 'sine', .7, 1, .5], [1.005, 'triangle', .35, 1, .6], [2, 'sine', .12, 1, .7]],
    saw: [[1, 'sawtooth', .5, 1, .004], [1.01, 'sawtooth', .3, 1, .004]],
    /* 🌍 24y-b world instruments */
    harp: [[1, 'triangle', 1, .9, .003], [2, 'sine', .3, .6, .003], [3, 'sine', .1, .4, .003]],
    organ: [[1, 'square', .22, 1, .012], [2, 'sine', .45, 1, .012], [.5, 'sine', .4, 1, .012]],
    uke: [[1, 'triangle', .9, .4, .002], [2, 'triangle', .35, .3, .002], [3, 'sine', .15, .2, .002]],
    steel: [[1, 'sine', 1, 1, .003], [2.02, 'sine', .45, .7, .003], [3.98, 'sine', .22, .4, .003]],
    glass: [[1, 'sine', 1, 1, .02], [3, 'sine', .28, 1, .02], [5.04, 'sine', .1, .7, .02]],
    epiano: [[1, 'sine', 1, 1, .004], [2, 'triangle', .22, .5, .004], [7, 'sine', .05, .12, .002]],
    horn: [[1, 'sawtooth', .22, 1, .05], [1.004, 'triangle', .5, 1, .06], [2, 'sine', .12, 1, .06]],
    musicbox: [[1, 'sine', 1, .55, .002], [4, 'sine', .3, .3, .002], [6.02, 'sine', .1, .2, .002]],
    airpad: [[1, 'sine', .7, 1, .9], [1.5, 'sine', .18, 1, 1], [2, 'sine', .14, 1, 1.1], [1.003, 'triangle', .2, 1, 1]],
    choir: [[1, 'sine', .6, 1, .45], [1.006, 'sine', .5, 1, .5], [2, 'sine', .12, 1, .55], [.994, 'triangle', .2, 1, .5]]
  };
  const MSCALES = {major: [0, 2, 4, 5, 7, 9, 11], pent: [0, 2, 4, 7, 9], minpent: [0, 3, 5, 7, 10], dorian: [0, 2, 3, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], harmonic: [0, 2, 3, 5, 7, 8, 11]};   /* 🎃 24y-b harmonic minor */
  const MKEYS = {C: 0, 'C#': 1, D: 2, Eb: 3, E: 4, F: 5, 'F#': 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11};
  function hzOf(key, scale, deg, oct){
    const sc = MSCALES[scale] || MSCALES.major, n = sc.length, d = ((deg % n) + n) % n, o = Math.floor(deg / n);
    return 440 * Math.pow(2, ((MKEYS[key] || 0) + sc[d] + 12 * (oct + o) - 57) / 12);
  }
  function mVoice(t0, hz, dur, type, gain, att, dest){
    const o = K.ctx.createOscillator(), g = K.ctx.createGain(); o.type = type; o.frequency.setValueAtTime(hz, t0);
    const a = Math.min(dur * .5, att || .008);
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(.0001, gain), t0 + a); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + .03);
  }
  function mNote(t0, hz, dur, inst, gain, dest){ (MINSTR[inst] || [[1, inst, 1, 1, .008]]).forEach(p => mVoice(t0, hz * p[0], dur * p[3], p[1], gain * p[2], p[4], dest)); }
  function mNoise(t0, dur, gain, f, q, dest){
    if(!K.NOISE){ const n = Math.floor(K.ctx.sampleRate); K.NOISE = K.ctx.createBuffer(1, n, K.ctx.sampleRate); const d = K.NOISE.getChannelData(0); for(let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; }
    const s = K.ctx.createBufferSource(), fl = K.ctx.createBiquadFilter(), g = K.ctx.createGain(); s.buffer = K.NOISE; fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q || 1;
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + .005); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    s.connect(fl); fl.connect(g); g.connect(dest); s.start(t0, Math.random() * Math.max(0, 1 - dur - .05), Math.min(.99, dur + .02));
  }
  function mKick(t0, gain, dest){
    const o = K.ctx.createOscillator(), g = K.ctx.createGain(); o.frequency.setValueAtTime(130, t0); o.frequency.exponentialRampToValueAtTime(42, t0 + .16);
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + .005); g.gain.exponentialRampToValueAtTime(.0001, t0 + .22); o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + .25);
  }
  /* 🎼 the families — the 6 sampled ones are EXACTLY the recipes Aowu approved (2026-11-17), + 🏟️ sport (not sampled) */
  const FAMILIES = {
    think: {icon: '🧠', name: 'Light thinking', key: 'C', scale: 'pent', bpm: 92, chords: [[0, 2, 4], [3, 5, 7], [1, 3, 5], [0, 2, 4]], padOct: 3, pad: 'pad', lead: 'marimba', leadOct: 4, density: .45, leadRange: 6, bassHits: [0, 8], bass: 'bass', sparkle: .35, percFrom: 2, liftInst: 'bell', hushLead: .08},
    detective: {icon: '🔍', name: 'Curious detective', key: 'D', scale: 'dorian', bpm: 84, chords: [[0, 2, 4], [3, 5, 7], [4, 6, 8], [0, 2, 4]], padOct: 3, pad: 'pad', lead: 'pluck', leadOct: 4, density: .35, leadFromChord: false, leadRange: 7, bassHits: [0, 4, 8, 12], bass: 'bass', bassLen: 2, bassAlways: true, bassGain: .8, sparkle: .25, percFrom: .55, tick: true, pedal: 4, speedUp: .12, liftInst: 'bell'},
    climb: {icon: '🏃', name: 'Steady climb', key: 'A', scale: 'minpent', bpm: 112, chords: [[0, 2, 4], [0, 2, 4], [3, 5, 7], [1, 3, 5]], padOct: 3, pad: 'pad', padGain: .6, lead: 'chip', leadOct: 4, density: .55, leadRange: 5, fast: true, bassHits: [0, 4, 8, 12], bass: 'bass', bassAlways: true, percFrom: .4, kick: [0, 8], hat: [2, 6, 10, 14], speedUp: .34, pedal: 2, liftInst: 'chip'},
    arena: {icon: '🥊', name: 'Arena punch', key: 'E', scale: 'minor', bpm: 128, chords: [[0, 2, 4], [5, 7, 9], [3, 5, 7], [4, 6, 8]], padOct: 3, pad: 'pad', padGain: .5, lead: 'saw', leadOct: 4, leadGain: .55, leadLen: 1.4, density: .35, leadFromChord: true, fast: true, bassHits: [0, 3, 6, 8, 11, 14], bass: 'bass', bassLen: 1.6, bassAlways: true, bassGain: 1.1, percFrom: 0, kick: [0, 4, 8, 12], hat: [2, 6, 10, 14], clap: [4, 12], crowd: true, speedUp: .06, pedal: 0, liftInst: 'chip'},
    story: {icon: '📖', name: 'Storybook quest', key: 'F', scale: 'lydian', bpm: 96, chords: [[0, 2, 4], [1, 3, 5], [0, 2, 4], [4, 6, 8]], padOct: 3, pad: 'pad', padGain: 1.2, lead: 'flute', leadOct: 4, leadLen: 3.4, density: .4, leadRange: 6, bassHits: [0, 8], bass: 'bass', sparkle: .3, percFrom: .45, kick: [0, 8], tick: true, speedUp: .08, liftInst: 'bell'},
    board: {icon: '♟️', name: 'Quiet board', key: 'G', scale: 'major', bpm: 66, chords: [[0, 2, 4], [5, 7, 9], [3, 5, 7], [4, 6, 8]], padOct: 3, pad: 'pad', lead: 'piano', leadOct: 4, leadLen: 4, density: .3, leadFromChord: true, bassHits: [0], bass: 'bass', bassLen: 10, sparkle: .15, percFrom: 2, pedal: 4, liftInst: 'piano', hushLead: .04},
    sport: {icon: '🏟️', name: 'Sunny rally', key: 'G', scale: 'major', bpm: 120, chords: [[0, 2, 4], [3, 5, 7], [4, 6, 8], [0, 2, 4]], padOct: 3, pad: 'pad', padGain: .7, lead: 'pluck', leadOct: 4, density: .42, leadFromChord: true, fast: true, bassHits: [0, 6, 8, 14], bass: 'bass', bassLen: 2, bassAlways: true, percFrom: .3, kick: [0, 8], hat: [2, 6, 10, 14], hatGain: .7, clap: [4, 12], crowd: true, speedUp: .05, liftInst: 'bell'},
    lofi: {icon: '☕', name: 'Cozy lofi', key: 'F', scale: 'major', bpm: 74, sev: true, chords: [[0, 2, 4, 6], [3, 5, 7, 9], [1, 3, 5, 7], [4, 6, 8, 10]], padOct: 3, pad: 'pad', padGain: .8, lead: 'piano', leadOct: 4, leadLen: 3.2, leadGain: .8, density: .2, leadFromChord: true, bassHits: [0, 10], bass: 'bass', bassLen: 5, bassAlways: true, bassGain: .7, sparkle: .15, percFrom: 0, kick: [0, 10], kickGain: .5, hat: [4, 12], hatGain: .35, crackle: .18}   // ☕ an-5: Dashboard + Gameroom (UI.homeMusic)
  };
  /* 🎮 a mood card per game (plan §4): [family, name, icon, changes]. null = the game IS the music (mood off in play). */
  const GAME_MOODS = {
    mathquest: ['think', 'Light thinking', '➗', {}],
    numbergrid: ['think', 'Calm grid', '🔢', {key: 'F', bpm: 84, density: .38}],
    numberboard: ['think', 'Clever tiles', '➗', {key: 'Bb', bpm: 88, bassHits: [0, 6, 8, 14]}],
    wordboard: ['think', 'Word workshop', '🔤', {key: 'Eb', bpm: 90, lead: 'bell', leadGain: .8}],
    georead: ['think', 'Story reading', '🔤', {key: 'D', bpm: 80, lead: 'bell', density: .28, leadGain: .7, padGain: .8, sparkle: .2}],
    geoscout: ['think', "Builder's yard", '🔢', {key: 'G', bpm: 94, percFrom: .6, tick: true}],
    eyesbrain: ['think', 'Memory pulse', '👀', {key: 'A', bpm: 96, lead: 'bell', leadGain: .8, percFrom: .55, tick: true}],
    memory: ['think', 'Card table', '🃏', {key: 'C', scale: 'major', bpm: 86, lead: 'bell', leadGain: .7}],
    wisdeck: ['think', 'Quiz show', '🃏', {key: 'F', scale: 'major', bpm: 100, lead: 'pluck', percFrom: .5, tick: true}],
    sweetswap: ['think', 'Sweet shop', '🍬', {key: 'C', scale: 'major', bpm: 104, percFrom: .5, clap: [4, 12]}],
    robotadventure: ['think', 'Robot lab', '🤖', {key: 'C', bpm: 88, lead: 'chip', leadGain: .7, percFrom: .6, tick: true}],
    stackingsim: ['think', 'Careful hands', '📦', {key: 'F', scale: 'major', bpm: 76, density: .35}],
    pokadif: ['detective', 'Curious detective', '🔍', {}],
    sciencetory: ['detective', 'Lab hum', '🔬', {key: 'A', bpm: 82, lead: 'bell', leadGain: .7, sparkle: .4, tick: false}],
    artifactory: ['detective', 'Workshop warmth', '🏭', {key: 'G', scale: 'major', bpm: 80, tick: false, percFrom: 2}],
    maze: ['detective', 'Explorer', '🧭', {key: 'A', bpm: 96, speedUp: .1}],
    blockdrop: ['climb', 'Steady climb', '🧱', {}],
    popblocks: ['climb', 'Bubble pop', '🫧', {key: 'E', bpm: 108, speedUp: .3, lead: 'pluck'}],
    doubleup: ['climb', 'Tile slide', '🔀', {key: 'D', bpm: 100, speedUp: .28, density: .45, percFrom: .55, padGain: .8}],
    hopper: ['climb', 'Hop along', '🐸', {key: 'F', scale: 'major', bpm: 118, speedUp: .19}],
    turbo: ['climb', 'Race pulse', '🏎️', {key: 'E', scale: 'minor', bpm: 128, speedUp: .17, lead: 'saw', leadGain: .5, leadFromChord: true}],
    pinball: ['climb', 'Neon arcade', '🎯', {key: 'C', bpm: 120, speedUp: .1, percFrom: .3}],
    minigames: ['climb', 'Mini fun', '🎈', {key: 'C', scale: 'major', bpm: 116, speedUp: .15, clap: [4, 12]}],
    snakeast: ['climb', 'Slither groove', '🐍', {key: 'D', bpm: 110, speedUp: .24, lead: 'pluck'}],
    slabrall: ['sport', 'Sunny rally', '🏓', {}],
    pyraspike: ['sport', 'Beach heat', '🔥', {key: 'E', scale: 'dorian', bpm: 124, lead: 'bell', leadGain: .8}],
    blasoff: ['arena', 'Arena punch · pitch', '⚽', {bpm: 126}],
    brawlbuddies: ['arena', 'Arena punch', '🥊', {}],
    soulbopper: ['arena', 'Fuse tick', '👻', {key: 'A', bpm: 124, lead: 'chip', leadGain: .8, tick: true, pedal: 4}],
    alignext: ['board', 'Quiet board · bright', '🔴', {key: 'C', bpm: 70}],
    chess: ['board', 'Quiet board', '♟️', {}],
    checkers: ['board', 'Quiet board · jumps', '🔴', {key: 'D', bpm: 70}],
    polyplot: ['board', 'Chalk & think', '⬛', {key: 'A', bpm: 72, lead: 'pluck', leadGain: .8}],
    tdstories: ['story', 'Storybook quest', '🏰', {}],
    brawenture: ['story', 'Brawl tales', '🗺️', {key: 'D', scale: 'dorian', bpm: 100}],
    avateer: ['story', 'Island walk', '🧳', {bpm: 92}],
    avateerbattle: ['story', 'Island battle', '⚔️', {key: 'D', scale: 'dorian', bpm: 110, percFrom: 0, kick: [0, 8], hat: [4, 12], hatGain: .7}],
    beatcorner: null, poseparty: null
  };
  const MOOD_ALIAS = {numberpuzzle: 'numberboard', algebros: 'numberboard', digitinct: 'numbergrid', lettercraft: 'wordboard', eyesbrainriot: 'eyesbrain', robot: 'robotadventure', coderobot: 'robotadventure',
    stacking: 'stackingsim', stackit: 'stackingsim', snakize: 'snakeast', snakigate: 'snakeast', snakastle: 'snakeast', snaketale: 'tdstories', pyradive: 'pyraspike', pyrastrike: 'pyraspike', pyraspark: 'pyraspike',
    brawl: 'brawlbuddies', omnifile: 'alignext', memoriesmatch: 'memory', steamplayground: 'minigames', beat: 'beatcorner', beatpiano: 'beatcorner', beatdrums: 'beatcorner', pose: 'poseparty'};
  const MOODS = {};
  Object.keys(GAME_MOODS).forEach(k => {
    const m = GAME_MOODS[k];
    if(!m){ MOODS[k] = null; return; }
    MOODS[k] = Object.assign({}, FAMILIES[m[0]], m[3], {id: k, fam: m[0], name: m[1], icon: m[2]});
  });
  /* 🎶 24y-a: 3 tunes per mood — tune 1 = the recipe as written; 2 + 3 = another chord walk · key · tempo · lead. Each start takes the next tune. */
  const TUNE_WALKS = [[[0, 2, 4], [5, 7, 9], [3, 5, 7], [4, 6, 8]], [[5, 7, 9], [3, 5, 7], [0, 2, 4], [4, 6, 8]], [[0, 2, 4], [3, 5, 7], [1, 3, 5], [4, 6, 8]],
    [[0, 2, 4], [2, 4, 6], [3, 5, 7], [4, 6, 8]], [[3, 5, 7], [4, 6, 8], [2, 4, 6], [5, 7, 9]], [[0, 2, 4], [4, 6, 8], [5, 7, 9], [3, 5, 7]]];
  const TUNE_LEADS = ['bell', 'marimba', 'pluck', 'flute', 'piano'], KEY_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  function tuneRecipe(R, n){
    const T = Object.assign({}, R), same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    T.tune = n;
    if(n > 0){
      const walks = TUNE_WALKS.filter(w => !same(w, R.chords)), h = String(R.id || R.fam || '').split('').reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
      T.chords = walks[(h + n * 2) % walks.length];
      const k = (MKEYS[R.key] || 0) + (n === 1 ? 2 : -3); T.key = KEY_NAMES[((k % 12) + 12) % 12];
      T.bpm = Math.round(R.bpm * (n === 1 ? 1.05 : .95));
      T.density = (R.density || .3) * (n === 1 ? 1.1 : .9);
      if(R.leads) T.lead = R.leads[n % R.leads.length];   /* 🌍 24y-b: a world's tunes keep its own instruments */
      else if(R.lead !== 'chip'){ const leads = TUNE_LEADS.filter(x => x !== R.lead); T.lead = leads[(h + n) % leads.length]; }
      if(n === 2 && R.sparkle == null) T.sparkle = .15;
    }
    if(R.sev) T.chords = (T.chords || []).map(c => c.length === 3 ? c.concat([c[0] + 6]) : c);   // ☕ an-5: lofi keeps its 7th chords in every tune
    const C = T.chords || [[0, 2, 4]]; T.chordsB = C.slice(2).concat(C.slice(0, 2));   // B part: the same chords from another place
    return T;
  }
  function pickTune(id, want){
    if(want === 0 || want === 1 || want === 2) return want;
    const key = 'sp_tune:' + id; let last = -1; try{ const v = localStorage.getItem(key); if(v != null) last = Number(v); }catch(e){}
    const n = ((isNaN(last) ? -1 : last) + 1) % 3; try{ localStorage.setItem(key, String(n)); }catch(e){}
    return n;
  }

  /* 🌍 24y-b WORLD COLOURS — a world paints the game's own recipe: scale · instruments · filter · its own gimmick.
     The game keeps its tempo, its drums, its tension rules and its speed-up, so it still feels like that game. */
  const WORLDS = {
    space:  {icon: '🌌', name: 'Space dream', scale: 'lydian', pad: 'airpad', padK: 1.2, leads: ['glass', 'bell', 'epiano'], leadLen: 3, densK: .8, sparkle: .55, spark: 'glass', filtMax: 5200, liftInst: 'glass', gim: 'sonar', what: 'slow sonar sweeps + floating glass bells'},
    sea:    {icon: '🌊', name: 'Underwater', scale: 'dorian', pad: 'pad', leads: ['marimba', 'steel', 'bell'], sparkle: .3, spark: 'marimba', filtMax: 2400, liftInst: 'marimba', gim: 'bubbles', what: 'bubbly marimba, muffled water, rising bubbles'},
    spooky: {icon: '🎃', name: 'Spooky', scale: 'harmonic', pad: 'choir', leads: ['pluck', 'musicbox', 'organ'], pedalAlways: true, pedal: 4, tick: true, filtMax: 3600, liftInst: 'organ', gim: 'creak', what: 'ghost "ooo" choir, low drone, creaky wobble'},
    party:  {icon: '🎉', name: 'Party', scale: 'major', leads: ['pluck', 'epiano', 'chip'], bassAlways: true, bassHits: [2, 6, 10, 14], kick: [0, 4, 8, 12], clap: [4, 12], hat: [2, 6, 10, 14], percFrom: 0, liftInst: 'chip', gim: 'riser', what: 'four-on-the-floor kick + clap, bouncy off-beat bass, whoosh risers'},
    jungle: {icon: '🦖', name: 'Jungle drums', scale: 'pent', leads: ['marimba', 'uke', 'flute'], spark: 'marimba', liftInst: 'marimba', gim: 'birds', what: 'log drums + bird chirps, wooden marimba'},
    robot:  {icon: '🤖', name: 'Circuit', scale: 'minpent', leads: ['chip', 'epiano', 'chip'], tick: true, liftInst: 'chip', gim: 'blips', what: 'beep-boop blips, chip arpeggios, clock ticks'},
    sky:    {icon: '☁️', name: 'Sky temple', scale: 'lydian', pad: 'airpad', leads: ['flute', 'harp', 'bell'], sparkle: .4, liftInst: 'bell', gim: 'wind', what: 'airy flute, soft wind swells, wind chimes'},
    snow:   {icon: '❄️', name: 'Snowfall', scale: 'major', pad: 'airpad', leads: ['musicbox', 'glass', 'bell'], sparkle: .5, spark: 'musicbox', filtMax: 4500, liftInst: 'musicbox', gim: 'twinkle', what: 'music box + falling twinkles (sleigh bells stay for 🎄 days)'},
    castle: {icon: '🏰', name: 'Fantasy castle', scale: 'lydian', leads: ['harp', 'flute', 'horn'], liftInst: 'horn', gim: 'fanfare', what: 'harp rolls + a little horn fanfare'},
    city:   {icon: '🏙️', name: 'City groove', scale: 'dorian', leads: ['epiano', 'pluck', 'marimba'], bassAlways: true, bassHits: [], liftInst: 'epiano', gim: 'snap', what: 'electric piano, walking bass, finger snaps'},
    sweets: {icon: '🍬', name: 'Carnival', scale: 'major', leads: ['musicbox', 'organ', 'bell'], liftInst: 'musicbox', gim: 'oompah', what: 'music box + calliope organ oom-pah'},
    farm:   {icon: '🌾', name: 'Farm & garden', scale: 'major', leads: ['uke', 'pluck', 'flute'], liftInst: 'uke', gim: 'clop', what: 'banjo-ish pluck, wooden clip-clop, a happy whistle'},
    beach:  {icon: '🏖️', name: 'Beach', scale: 'major', leads: ['steel', 'uke', 'marimba'], filtMax: 5000, liftInst: 'steel', gim: 'waves', what: 'steel drum + ukulele, waves washing in'}
  };
  /* which theme / world of a game wears which colour ('' = the game's own music) */
  const WORLD_OF = {
    snakeast: {dino: 'jungle', sea: 'sea', dance: 'party', robot: 'robot', space: 'space', sky: 'sky'},
    soulbopper: {dino: 'jungle', sea: 'sea', dance: 'party', robot: 'robot', space: 'space', sky: 'sky', zombie: 'spooky'},
    polyplot: {dino: 'jungle', sea: 'sea', dance: 'party', robot: 'robot', space: 'space', sky: 'sky', hunter: 'jungle'},
    turbo: {roadtrip: 'city', space: 'space', jungle: 'jungle', dragon: 'castle', horse: 'farm', ship: 'beach'},
    hopper: {swamp: 'jungle', city: 'city', dino: 'jungle', zombie: 'spooky', fantasy: 'castle', sky: 'sky'},
    maze: {animal: 'jungle', insect: 'farm', vehicle: 'city', house: '', shape: '', space: 'space', ocean: 'sea', dino: 'jungle'},
    pinball: {carnival: 'sweets', castle: 'castle', space: 'space', sea: 'sea', zombie: 'spooky', sport: 'party', monster: 'spooky'},
    sweetswap: {sweets: 'sweets', blocks: '', animals: 'jungle', dino: 'jungle', alien: 'space', vehicles: 'city', space: 'space', family: 'party', faces: 'party'},
    mathquest: {school: '', space: 'space', lab: 'robot', animals: 'jungle', market: 'city'},
    blockdrop: {classic: '', faces: 'party', dino: 'jungle', cargo: 'space', fantasy: 'castle', jigsaw: ''},
    popblocks: {colors: '', animals: 'jungle', dino: 'jungle', monsters: 'spooky', vehicles: 'city', space: 'space'},
    doubleup: {numbers: '', animals: 'jungle', dino: 'jungle', space: 'space', fantasy: 'castle', sweets: 'sweets'},
    robotadventure: {park: 'farm', city: 'city', farm: 'farm', moon: 'space', beach: 'beach', snow: 'snow'},
    memory: {monsters: 'spooky', heroes: 'castle', animals: 'jungle', people: 'party', vehicles: 'city', space: 'space'}
  };
  function worldOf(id, theme){ const m = WORLD_OF[moodKey(id)] || {}; const k = String(theme || '').toLowerCase(); return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : ''; }   /* only the map: a theme name never picks a world by itself */
  function worldRecipe(R, w){
    const W = WORLDS[w]; if(!W) return R;
    const T = Object.assign({}, R, {world: w, worldName: W.name, worldIcon: W.icon, scale: W.scale, leads: W.leads, lead: R.lead === 'chip' && W.leads.indexOf('chip') < 0 ? W.leads[0] : W.leads[0], liftInst: W.liftInst, gim: W.gim});
    ['pad', 'spark', 'filtMax', 'pedal', 'pedalAlways', 'tick', 'bassHits', 'bassAlways', 'leadLen'].forEach(k => { if(W[k] != null) T[k] = W[k]; });
    if(W.sparkle != null) T.sparkle = Math.max(R.sparkle || 0, W.sparkle);
    if(W.padK) T.padGain = (R.padGain || 1) * W.padK;
    if(W.densK) T.density = (R.density || .3) * W.densK;
    if(W.percFrom != null){ T.percFrom = Math.min(R.percFrom == null ? 2 : R.percFrom, W.percFrom); ['kick', 'clap', 'hat'].forEach(k => { if(W[k]) T[k] = W[k]; }); }
    if(T.leadFromChord == null) T.leadFromChord = false;
    return T;
  }
  function mGlide(t0, a, b, dur, type, gain, dest, vib){
    const o = K.ctx.createOscillator(), g = K.ctx.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(a, t0); o.frequency.exponentialRampToValueAtTime(b, t0 + dur);
    if(vib){ const l = K.ctx.createOscillator(), lg = K.ctx.createGain(); l.frequency.value = vib; lg.gain.value = a * .03; l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0 + dur + .05); }
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(.08, dur * .3)); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + .05);
  }
  function mThump(t0, a, b, gain, dest){ mGlide(t0, a, b, .18, 'sine', gain, dest); }
  function mSwell(t0, dur, gain, f1, f2, dest, lp){
    if(!K.NOISE){ const n = Math.floor(K.ctx.sampleRate); K.NOISE = K.ctx.createBuffer(1, n, K.ctx.sampleRate); const d = K.NOISE.getChannelData(0); for(let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; }
    const s = K.ctx.createBufferSource(), fl = K.ctx.createBiquadFilter(), g = K.ctx.createGain(); s.buffer = K.NOISE; s.loop = true; fl.type = lp ? 'lowpass' : 'bandpass'; fl.Q.value = lp ? .5 : 1.2;
    fl.frequency.setValueAtTime(f1, t0); fl.frequency.exponentialRampToValueAtTime(f2, t0 + dur * .6);
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + dur * .45); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    s.connect(fl); fl.connect(g); g.connect(dest); s.start(t0); s.stop(t0 + dur + .05);
  }
  /* each world's own gimmick — x = {t0, pos, bar, T, sx, ch, R, hz(deg, oct), loud, rnd, out, note} → a layer name */
  const GIM = {
    sonar(x){ if(x.pos === 0 && x.bar % 4 === 2){ if(x.loud) mGlide(x.t0, x.hz(x.ch[2] + 14, x.R.leadOct), x.hz(x.ch[0] + 7, x.R.leadOct), 1.6, 'sine', .022, x.out); return 'sonar'; } return ''; },
    bubbles(x){ if(x.pos % 2 === 1 && x.rnd() < .12 * (1 - x.T * .4)){ if(x.loud){ const f = 380 + x.rnd() * 300; mGlide(x.t0, f, f * 3.2, .09, 'sine', .03, x.out); if(x.rnd() < .5) mGlide(x.t0 + .07, f * 1.3, f * 4, .07, 'sine', .022, x.out); } return 'bubbles'; } return ''; },
    creak(x){ if(x.pos === 8 && x.bar % 2 === 1){ if(x.loud) mGlide(x.t0, x.hz(x.ch[2] + 7, x.R.leadOct), x.hz(x.ch[0] + 5, x.R.leadOct), 1.4, 'sine', .028, x.out, 5.5); return 'ghost ooo'; } return ''; },
    riser(x){ if(x.bar % 4 === 3 && x.pos === 4){ if(x.loud) mSwell(x.t0, x.sx * 12, .05, 400, 6000, x.out); return 'riser'; } return ''; },
    birds(x){ let L = ''; if((x.pos === 3 || x.pos === 11) && x.T > .1){ if(x.loud) mThump(x.t0, 190, 120, .09, x.out); L = 'log drum'; }
      if(x.pos === 6 && x.rnd() < .28 * (1 - x.T * .5)){ if(x.loud){ const f = 2200 + x.rnd() * 900; for(let k = 0; k < 3; k++) mGlide(x.t0 + k * .07, f * (1 + k * .06), f * 1.25, .06, 'sine', .016, x.out); } L = 'birds'; } return L; },
    blips(x){ if((x.pos === 6 || x.pos === 14) && x.rnd() < .45){ if(x.loud){ const f = x.hz(x.ch[x.pos === 6 ? 1 : 2] + 14, x.R.leadOct); mVoice(x.t0, f, .05, 'square', .02, .002, x.out); mVoice(x.t0 + x.sx, f * 1.5, .05, 'square', .02, .002, x.out); } return 'beep-boop'; } return ''; },
    wind(x){ let L = ''; if(x.pos === 0 && x.bar % 4 === 0){ if(x.loud) mSwell(x.t0, x.sx * 40, .022, 500, 1500, x.out); L = 'wind'; }
      if(x.pos === 12 && x.rnd() < .3){ if(x.loud) [0, 1, 2].forEach(k => mNote(x.t0 + k * .11 + x.rnd() * .04, x.hz(x.ch[k] + 14, x.R.leadOct), .9, 'bell', .018, x.out)); L += ' chimes'; } return L; },
    twinkle(x){ if(x.pos === 12 && x.bar % 2 === 0){ if(x.loud) [3, 2, 1, 0].forEach((k, i) => mNote(x.t0 + i * x.sx * .8, x.hz(x.ch[k % x.ch.length] + 14, x.R.leadOct), .7, 'musicbox', .022, x.out)); return 'twinkle'; } return ''; },
    fanfare(x){ let L = ''; if(x.pos === 0 && x.bar % 8 === 0){ if(x.loud) [0, 1, 2].forEach(k => mNote(x.t0 + k * x.sx * 1.5, x.hz(x.ch[k], x.R.leadOct - 1), x.sx * (k === 2 ? 5 : 1.6), 'horn', .03, x.out)); L = 'fanfare'; }
      if(x.pos === 0 && x.bar % 8 !== 0){ if(x.loud) x.ch.concat([x.ch[0] + 7]).forEach((d, k) => mNote(x.t0 + k * .05, x.hz(d, x.R.leadOct - 1), .8, 'harp', .025, x.out)); L += ' harp roll'; } return L; },
    snap(x){ let L = ''; if(x.pos % 4 === 0){ if(x.loud){ const walk = [x.ch[0], x.ch[1], x.ch[2], x.ch[1] + 1][x.pos / 4]; mNote(x.t0, x.hz(walk, 2), x.sx * 3, 'bass', .1, x.out); } L = 'walking bass'; }
      if((x.pos === 4 || x.pos === 12) && x.T > .05){ if(x.loud) mNoise(x.t0, .025, .06, 2600, 3, x.out); L += ' snaps'; } return L; },
    oompah(x){ if(x.pos === 0 || x.pos === 8){ if(x.loud) mNote(x.t0, x.hz(x.ch[0], 2), x.sx * 2, 'organ', .05, x.out); return 'oom'; }
      if(x.pos === 4 || x.pos === 12){ if(x.loud) x.ch.forEach(d => mNote(x.t0, x.hz(d, 3), x.sx * 1.5, 'organ', .02, x.out)); return 'pah'; } return ''; },
    clop(x){ let L = ''; if(x.T > .05 && [0, 3, 8, 11].indexOf(x.pos) >= 0){ if(x.loud) mNoise(x.t0, .03, .05, 1800 + (x.pos % 8 ? 500 : 0), 8, x.out); L = 'clip-clop'; }
      if(x.pos === 0 && x.bar % 4 === 1 && x.rnd() < .6){ if(x.loud) mGlide(x.t0, x.hz(x.ch[0] + 7, x.R.leadOct + 1), x.hz(x.ch[2] + 7, x.R.leadOct + 1), .35, 'sine', .02, x.out, 6); L += ' whistle'; } return L; },
    waves(x){ if(x.pos === 0 && x.bar % 2 === 0){ if(x.loud) mSwell(x.t0, x.sx * 28, .035, 300, 1800, x.out, true); return 'waves'; } return ''; }
  };
  /* 🎊 24y-c SPECIAL-DAY MUSIC (✨ Polish chat, 2026-11-20, Aowu 16:25 "ok go" = all ⭐ — plan Ambient Moods §12d) — a special day dresses ANY mood:
     1) 🎺 a short day jingle first (the first start of each game that day), 2) a day layer of its own over the game's music,
     3) a day sting on every 🎉 lift. Dates = the 🚀 Welcome Show's specialFor rules (🎂 the player's birthday wins).
     The game keeps its own music (tempo · drums · tension · its 🌍 world) — 👗 "full dress" also puts the day's world on.
     UISound.dayNow() · UISound.DAYS · UISound.days.get() / set({on}) · UISound.mood(id, {day: 'christmas' | ''}) forces one. */
  Object.assign(MINSTR, {
    khim: [[1, 'triangle', 1, .35, .002], [2, 'sine', .5, .25, .002], [3.01, 'sine', .2, .18, .002]],   /* 💦 Thai hammered dulcimer */
    khlui: [[1, 'sine', 1, 1, .09], [2, 'sine', .1, 1, .1], [3, 'sine', .04, 1, .12]],   /* 🪷 Thai bamboo flute */
    kazoo: [[1, 'sawtooth', .3, 1, .02], [2, 'square', .1, 1, .02]]   /* 🎂 party blower */
  });
  const DAY_LOY = {2025: '11-05', 2026: '11-24', 2027: '11-13', 2028: '11-01', 2029: '11-20', 2030: '11-09', 2031: '10-30', 2032: '11-17', 2033: '11-06', 2034: '11-25', 2035: '11-15'};   /* = WelcomeShow LOY_KRATHONG */
  /* jingle: [semitones from the mood's key, beats] · spb = seconds per beat · oct = octave of the key note · chord = the last chord */
  const DAYS = {
    birthday: {icon: '🎂', name: 'Birthday', when: "the player's birthday", world: 'party', inst: 'musicbox', inst2: 'piano', oct: 5, spb: .4, chord: [0, 4, 7],
      tune: [[-5, .75], [-5, .25], [-3, 1], [-5, 1], [0, 1], [-1, 2], [-5, .75], [-5, .25], [-3, 1], [-5, 1], [2, 1], [0, 2]], tuneName: 'Happy Birthday (1893 tune)',
      what: 'party blower toots + candle twinkles', liftWhat: 'blower + "hooray" arpeggio'},
    newyear: {icon: '🎆', name: 'New Year', when: '31 Dec – 1 Jan', world: 'party', inst: 'epiano', inst2: 'bell', oct: 4, spb: .36, chord: [5, 9, 12],
      tune: [[-5, 1], [0, 1.5], [0, .5], [0, 1], [4, 1], [2, 1.5], [0, .5], [2, 1], [4, 1], [0, 1.5], [0, .5], [4, 1], [7, 1], [9, 3]], tuneName: 'Auld Lang Syne (old Scottish tune)',
      what: 'firework whistles + pops + a 3-2-1 tick', liftWhat: 'a big firework burst'},
    christmas: {icon: '🎄', name: 'Christmas', when: '24 – 25 Dec', world: 'snow', inst: 'musicbox', inst2: 'bell', oct: 5, spb: .28, chord: [0, 4, 7], sleigh: true,
      tune: [[4, 1], [4, 1], [4, 2], [4, 1], [4, 1], [4, 2], [4, 1], [7, 1], [0, 1.5], [2, .5], [4, 4]], tuneName: 'Jingle Bells (1857 tune)',
      what: 'sleigh bells + music-box sparkles', liftWhat: 'a bell chord + sleigh shake'},
    halloween: {icon: '🎃', name: 'Halloween', when: '31 Oct', world: 'spooky', inst: 'organ', inst2: 'organ', oct: 5, spb: 1, chord: [-12, -9, -5], minor: true,
      tune: [[7, .09], [5, .09], [7, 1.1], [5, .11], [3, .11], [2, .11], [0, .11], [-1, .45], [0, 1.3]], tuneName: 'Bach Toccata in D minor (opening)',
      what: 'owl hoots + a creaky door + a theremin swoop', liftWhat: 'a spooky organ stab + "boo!"'},
    songkran: {icon: '💦', name: 'Songkran', when: '13 – 15 Apr', world: 'beach', inst: 'khim', inst2: 'khim', oct: 4, spb: .22, chord: [0, 4, 7], trem: true,
      tune: [[7, 1], [9, 1], [12, 2], [9, 1], [7, 1], [4, 2], [7, 1], [4, 1], [2, 1], [0, 3]], tuneName: 'new khim tune (pentatonic)',
      what: 'water-drop plinks + khim tremolo + splashes', liftWhat: 'a big splash + drops'},
    loykrathong: {icon: '🪷', name: 'Loy Krathong', when: 'the 12th full moon (±1 day)', world: 'sky', inst: 'khlui', inst2: 'bell', oct: 5, spb: .5, chord: [0, 4, 7], echo: true,
      tune: [[0, 1], [2, 1], [4, 2], [7, 1.5], [4, .5], [9, 2], [7, 3]], tuneName: 'new khlui tune (pentatonic)',
      what: 'floating bells + khlui flute + river ripples', liftWhat: 'a lantern floating up + bells'}
  };
  const DAY_ORDER = ['birthday', 'newyear', 'christmas', 'halloween', 'songkran', 'loykrathong'];
  const BDAY = {};   /* {Name: 'MM-DD'} from Settings Birthday_<Name> (applySettings) */
  function dayDate(){ const f = window.SP_DATE || window.WS_DATE; if(f && /^\d{4}-\d{2}-\d{2}$/.test(f)){ const a = f.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2], 9); } return new Date(); }
  function dayMd(d){ return String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function dayNear(d, mmdd, span){ if(!mmdd) return false; const a = mmdd.split('-').map(Number), x = new Date(d.getFullYear(), a[0] - 1, a[1], 9); return Math.abs(Math.round((d - x) / 86400000)) <= span; }
  function dayOn(d, who){   /* the same order as the Welcome Show: 🎂 → 🎆 → 🎄 → 🎃 → 💦 → 🪷 */
    const m = dayMd(d);
    if(who && BDAY[who] === m) return 'birthday';
    if(m === '12-31' || m === '01-01') return 'newyear';
    if(m === '12-24' || m === '12-25') return 'christmas';
    if(m === '10-31') return 'halloween';
    if(m >= '04-13' && m <= '04-15') return 'songkran';
    if(dayNear(d, DAY_LOY[d.getFullYear()], 1)) return 'loykrathong';
    return '';
  }
  function dayWho(){ try{ return K.mus().who || ''; }catch(e){ return ''; } }
  function dayPicks(who){ who = who == null ? dayWho() : who; try{ const x = JSON.parse(localStorage.getItem('sp_days:' + who) || 'null'); if(x && typeof x === 'object') return {on: x.on !== false, dress: x.dress === 'full' ? 'full' : 'touch', at: Number(x.at) || 0}; }catch(e){} return {on: true, dress: 'touch', at: 0}; }
  function dayPicksSet(ch, who){
    who = who == null ? dayWho() : who; const cur = dayPicks(who), nx = {on: ch.on == null ? cur.on : !!ch.on, dress: ch.dress || cur.dress, at: Date.now()};
    try{ localStorage.setItem('sp_days:' + who, JSON.stringify(nx)); }catch(e){}
    try{ if(who && !ch.local && window.google && google.script && google.script.run) google.script.run.withSuccessHandler(() => {}).withFailureHandler(() => {}).saveMusicPicks(who, JSON.stringify({days: nx})); }catch(e){}
    try{ K.musTell(); }catch(e){}
    return nx;
  }
  function dayNow(o){
    o = o || {};
    if(o.day != null) return DAYS[o.day] ? o.day : '';
    if(window.SP_DAY != null) return DAYS[window.SP_DAY] ? window.SP_DAY : '';
    if(window.MOOD_TEST && window.SP_DATE == null && window.WS_DATE == null) return '';   /* tests stay date-proof: a day only when a test sets SP_DAY / SP_DATE */
    if(!dayPicks().on) return '';
    return dayOn(dayDate(), dayWho());
  }
  function dayNext(from){   /* the next special day (for the 🎵 sheet line): {k, date} */
    const d0 = from || dayDate();
    for(let i = 0; i < 400; i++){ const d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + i, 9), k = dayOn(d, dayWho()); if(k) return {k: k, date: d, inDays: i}; }
    return null;
  }
  function dayJingleDue(id, k, o){   /* 🎺 the first start of each game that day (o.jingle true / false forces) */
    if(o && o.jingle != null) return !!o.jingle;
    const key = 'sp_dayjingle:' + dayWho() + ':' + id, v = dayMd(dayDate()) + ':' + k;
    try{ if(localStorage.getItem(key) === v) return false; localStorage.setItem(key, v); }catch(e){}
    return true;
  }
  function dayHz(R, semi, oct){ return 440 * Math.pow(2, ((MKEYS[R.key] || 0) + semi + 12 * oct - 57) / 12); }
  function daySleigh(t0, gain, out){ mNoise(t0, .07, gain, 8200, 2.5, out); mNoise(t0 + .028, .05, gain * .7, 10500, 3, out); }
  function dayJingle(k, R, t0, out){   /* plays the jingle, returns its length in seconds */
    const D = DAYS[k]; let t = t0;
    D.tune.forEach((n, i) => {
      const hz = dayHz(R, n[0], D.oct), dur = n[1] * D.spb;
      if(D.trem){ for(let r = 0; r * .075 < dur * .8; r++) mNote(t + r * .075, hz, .22, D.inst, r ? .045 : .07, out); }
      else{ mNote(t, hz, Math.max(.12, dur * 1.1), D.inst, .075, out); if(D.inst2 !== D.inst) mNote(t, hz * 2, Math.max(.1, dur * .9), D.inst2, .025, out); }
      if(D.echo){ mNote(t + .25, hz * 2, .8, 'bell', .02, out); mNote(t + .5, hz * 2, .8, 'bell', .012, out); }
      if(D.sleigh && i % 2 === 0){ daySleigh(t, .03, out); daySleigh(t + dur / 2, .022, out); }
      if(i === 0) mNote(t, dayHz(R, D.minor ? -12 : 0, D.oct - 2), D.spb * 4, 'bass', .09, out);
      t += dur;
    });
    D.chord.forEach((s, j) => mNote(t - .02, dayHz(R, s, D.oct - 1), 1.6, k === 'halloween' ? 'organ' : 'pad', .05 / (1 + j * .2), out));
    if(k === 'halloween') mSwell(t - .2, 1.6, .05, 120, 260, out, true);
    if(k === 'songkran') DAY_LIFT.songkran({t0: t - .1, R: R, out: out, ch: [0, 2, 4], hz: d => hzOf(R.key, R.scale, d, R.leadOct)});
    if(k === 'loykrathong') DAY_LIFT.loykrathong({t0: t - .1, R: R, out: out, ch: [0, 2, 4], hz: (d, oc) => hzOf(R.key, R.scale, d, oc)});
    return (t - t0) + .9;
  }
  /* each day's own layer over the game's music — x = {t0, pos, bar, T, sx, ch, R, hz(deg, oct), loud, rnd, out} → a layer name; calmer as tension rises */
  const DAY_GIM = {
    birthday(x){ let L = '';
      if(x.pos === 0 && x.bar % 4 === 1){ if(x.loud){ const a = x.hz(x.ch[0] + 7, x.R.leadOct - 1); mGlide(x.t0, a, a * 1.02, .14, 'sawtooth', .02, x.out, 9); mGlide(x.t0 + .2, a * 1.335, a * 1.5, .42, 'sawtooth', .022, x.out, 11); } L = 'party blower'; }
      if(x.pos === 10 && x.rnd() < .35 * (1 - x.T * .5)){ if(x.loud) [0, 1].forEach(k => mNote(x.t0 + k * .09, x.hz(x.ch[2 - k] + 14, x.R.leadOct), .6, 'musicbox', .022, x.out)); L += ' candles'; } return L; },
    newyear(x){ let L = '';
      if(x.bar % 2 === 1 && x.pos === 6){ if(x.loud){ const f = 700 + x.rnd() * 300; mGlide(x.t0, f, f * 3.4, .55, 'sine', .018, x.out); mNoise(x.t0 + .58, .3, .06, 1100, .7, x.out); for(let k = 0; k < 6; k++) mNoise(x.t0 + .66 + k * .045 + x.rnd() * .03, .02, .02, 3000 + x.rnd() * 3000, 4, x.out); } L = 'firework'; }
      if(x.bar % 8 === 7 && x.pos % 4 === 0){ if(x.loud) mVoice(x.t0, x.hz(x.ch[0] + 14 - x.pos / 4, x.R.leadOct), .06, 'square', .016, .002, x.out); L += ' 3-2-1'; } return L; },
    christmas(x){ let L = '';
      if(x.pos % 2 === 0 && (x.pos % 4 === 0 || x.T > .25)){ if(x.loud) daySleigh(x.t0, x.pos % 4 === 0 ? .022 : .014, x.out); L = 'sleigh bells'; }
      if(x.pos === 12 && x.bar % 2 === 1){ if(x.loud) [2, 1, 0].forEach((k, i) => mNote(x.t0 + i * x.sx, x.hz(x.ch[k] + 14, x.R.leadOct), .7, 'musicbox', .022, x.out)); L += ' music box'; } return L; },
    halloween(x){ let L = '';
      if(x.pos === 8 && x.bar % 4 === 2){ if(x.loud){ const h = x.hz(x.ch[0] + 7, 3); mGlide(x.t0, h * 1.06, h, .28, 'sine', .04, x.out); mGlide(x.t0 + .4, h * 1.06, h * .94, .5, 'sine', .04, x.out); } L = 'owl hoot'; }
      if(x.pos === 0 && x.bar % 8 === 3){ if(x.loud) mSwell(x.t0, x.sx * 14, .03, 260, 900, x.out); L += ' creaky door'; }
      if(x.pos === 4 && x.bar % 4 === 0){ if(x.loud){ const a = x.hz(x.ch[0] + 7, x.R.leadOct); mGlide(x.t0, a, a * 1.5, .5, 'triangle', .018, x.out, 6); mGlide(x.t0 + .5, a * 1.5, a * .75, .9, 'triangle', .016, x.out, 6); } L += ' theremin'; } return L; },
    songkran(x){ let L = '';
      if((x.pos === 6 || x.pos === 14) && x.rnd() < .4 * (1 - x.T * .4)){ if(x.loud){ const f = 900 + x.rnd() * 700; mGlide(x.t0, f, f * 2.4, .07, 'sine', .03, x.out); } L = 'water drops'; }
      if(x.pos === 0 && x.bar % 4 === 1){ if(x.loud){ const h = x.hz(x.ch[2], x.R.leadOct); for(let r = 0; r < 6; r++) mNote(x.t0 + r * .07, r < 3 ? h : x.hz(x.ch[1], x.R.leadOct), .2, 'khim', .035, x.out); } L += ' khim'; }
      if(x.pos === 8 && x.bar % 8 === 7){ if(x.loud) mSwell(x.t0, x.sx * 10, .04, 1800, 5200, x.out); L += ' splash'; } return L; },
    loykrathong(x){ let L = '';
      if(x.pos === 4 && x.bar % 2 === 0){ if(x.loud){ const h = x.hz(x.ch[1] + 14, x.R.leadOct); [0, .35, .7].forEach((d, i) => mNote(x.t0 + d, h, 1.1, 'bell', .022 / (1 + i), x.out)); } L = 'floating bells'; }
      if(x.pos === 0 && x.bar % 4 === 2){ if(x.loud){ const a = x.hz(x.ch[0] + 7, x.R.leadOct); mGlide(x.t0, a * .985, a, x.sx * 10, 'sine', .03, x.out, 5); mNoise(x.t0, .25, .006, 2500, .6, x.out); } L += ' khlui'; }
      if(x.pos === 8 && x.bar % 4 === 0){ if(x.loud) mSwell(x.t0, x.sx * 20, .02, 260, 700, x.out, true); L += ' river'; } return L; }
  };
  /* the day's sting on every 🎉 lift (after the game's own lift arpeggio) */
  const DAY_LIFT = {
    birthday(x){ const a = x.hz(x.ch[0] + 7, x.R.leadOct - 1); mGlide(x.t0, a, a * 1.5, .4, 'sawtooth', .025, x.out, 10); [0, 1, 2, 3].forEach(k => mNote(x.t0 + .45 + k * .08, x.hz(x.ch[k % 3] + (k > 2 ? 7 : 0), x.R.leadOct + 1), .5, 'musicbox', .05, x.out)); mNoise(x.t0 + .8, .12, .06, 1500, .8, x.out); },
    newyear(x){ mGlide(x.t0, 800, 2900, .45, 'sine', .022, x.out); mNoise(x.t0 + .48, .45, .09, 900, .6, x.out); for(let k = 0; k < 10; k++) mNoise(x.t0 + .55 + k * .05, .02, .03, 2500 + k * 400, 4, x.out); },
    christmas(x){ x.ch.forEach((d, k) => mNote(x.t0 + k * .03, x.hz(d + 7, x.R.leadOct), 1.4, 'bell', .04, x.out)); for(let k = 0; k < 8; k++) daySleigh(x.t0 + k * .06, .03, x.out); },
    halloween(x){ x.ch.forEach(d => mNote(x.t0, x.hz(d, x.R.leadOct - 2), .7, 'organ', .05, x.out)); mGlide(x.t0 + .3, 520, 260, .5, 'triangle', .05, x.out, 7); },
    songkran(x){ mSwell(x.t0, .8, .07, 2000, 6000, x.out); for(let k = 0; k < 5; k++){ const f = 1000 + k * 260; mGlide(x.t0 + .2 + k * .09, f, f * 2.3, .07, 'sine', .03, x.out); } },
    loykrathong(x){ const a = x.hz(x.ch[0], x.R.leadOct); mGlide(x.t0, a, a * 2, 1.4, 'sine', .03, x.out, 4); [0, 1, 2].forEach(k => mNote(x.t0 + .5 + k * .3, x.hz(x.ch[k] + 14, x.R.leadOct), 1, 'bell', .025, x.out)); }
  };
  function dayRecipe(R, k){ const D = DAYS[k]; return Object.assign({}, R, {day: k, dayName: D.name, dayIcon: D.icon}); }
  function moodKey(id){ const k = String(id || '').toLowerCase().replace(/[^a-z0-9]/g, ''); return MOOD_ALIAS[k] || k; }
  function recipeOf(id){
    if(id && typeof id === 'object') return Object.assign({}, FAMILIES[id.fam] || {}, id);
    const k = moodKey(id);
    if(Object.prototype.hasOwnProperty.call(MOODS, k)) return MOODS[k] ? Object.assign({}, MOODS[k]) : null;
    if(FAMILIES[k]) return Object.assign({}, FAMILIES[k], {id: k, fam: k});
    return null;
  }
  function silent(id, why){
    const h = {id: String(id || ''), live: false, why: why || '', S: {t: 0, hush: false, paused: false, layers: '', notes: 0, ducks: 0, bpmNow: 0}};
    h.set = h.tension = h.hush = h.lift = h.pause = () => h; h.stop = () => {};
    return h;
  }
  function moodBlocked(o){
    if(o && o.force) return '';
    if(window.UI_MOODS === false) return 'off';
    if(window.MOOD_TEST) return '';
    try{ if(navigator.webdriver) return 'test'; }catch(e){}
    return '';
  }
  function mood(id, o){
    o = o || {};
    if(K.MOOD) K.MOOD.stop();
    let R = recipeOf(id), name = typeof id === 'string' ? id : (id && id.id) || 'custom';
    if(!R) return silent(name, 'own-music');
    const why = moodBlocked(o); if(why) return silent(name, why);
    const c = K.ac(); if(!c) return silent(name, 'no-audio');
    K.musicChain(); if(!K.mIn) return silent(name, 'no-audio');
    let wd = o.world != null ? (WORLDS[o.world] ? o.world : '') : (o.theme != null ? worldOf(R.id || name, o.theme) : '');   /* 🌍 24y-b */
    const dk = dayNow(o), dp = dayPicks();   /* 🎊 24y-c */
    if(dk && o.world == null && (o.dress || dp.dress) === 'full' && DAYS[dk].world) wd = DAYS[dk].world;
    if(wd) R = worldRecipe(R, wd);
    const R0 = R; R = tuneRecipe(R0, pickTune((R0.id || name) + (wd ? '@' + wd : ''), o.tune));   /* 🎶 24y-a tune */
    if(dk) R = dayRecipe(R, dk);
    const jingle = dk ? dayJingleDue(R.id || name, dk, o) : false;   /* 🎊 24y-c: 🎺 first start of each game that day */
    let seed = 7 + R.tune * 101 + (window.MOOD_TEST ? 0 : Math.floor(Math.random() * 9973)); const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const S = {t: 0, hush: false, paused: false, why: {}, lift: 0, step: 0, next: 0, bpmNow: R.bpm, layers: '', notes: 0, ducks: 0, ticks: 0};
    const out = c.createGain(); out.gain.value = .0001; out.connect(K.mIn);
    let faded = false;
    const fadeIn = sec => { try{ const t = c.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(.0001, out.gain.value), t); out.gain.exponentialRampToValueAtTime(1, t + sec); }catch(e){} };
    const chordAt = bar => { const C = R.chordsB && Math.floor(bar / 8) % 2 ? R.chordsB : R.chords; return C[bar % C.length]; };   /* 🎶 24y-a: B part every other 8 bars */
    function tick(){
      if(!H.live) return;
      S.ticks++;
      if(c.state !== 'running' || S.paused){ S.next = 0; return; }
      if(!faded){ faded = true; fadeIn(jingle ? .06 : 1.2); }
      const now = c.currentTime;
      if(!S.next || S.next < now - .3){ S.next = now + .06;
        if(jingle && !S.jingled){ S.jingled = 1; if(K.enabled && K.volume > 0 && K.mus().on && K.mus().v > 0){ S.next += dayJingle(R.day, R, S.next, out); S.notes++; } S.layers = '🎺 ' + R.dayName + ' jingle'; } }   /* 🎊 24y-c */   // first beat / after a pause or a stall: start fresh
      const loud = K.enabled && K.volume > 0 && K.mus().on && K.mus().v > 0;   // music off → keep time, make no notes (light on phones)
      while(S.next < now + .12){
        const bpm = R.bpm * (1 + (R.speedUp || 0) * S.t + (S.lift > 0 ? .04 : 0)); S.bpmNow = bpm;
        const sx = 60 / bpm / 4, i = S.step, b = Math.floor(i / 16), pos = i % 16, ch = chordAt(b), t0 = S.next;
        const T = Math.min(1, S.t + (S.lift > 0 ? .5 : 0)), hush = S.hush, L = [];
        const note = (a, h, d, ins, g) => { if(loud){ mNote(a, h, d, ins, g, out); S.notes++; } };
        if(pos === 0) ch.forEach((d, k) => note(t0, hzOf(R.key, R.scale, d, R.padOct), sx * 16 * 1.15, R.pad, (hush ? .028 : .045) * (R.padGain || 1) / (1 + k * .2)));
        L.push('pad');
        if(!hush && (T > .15 || R.bassAlways)){ if(R.bassHits.indexOf(pos) >= 0) note(t0, hzOf(R.key, R.scale, ch[0], 2), sx * (R.bassLen || 3), R.bass, .11 * (R.bassGain || 1)); L.push('bass'); }
        const fine = T > .6 && R.fast, onGrid = fine ? true : pos % 2 === 0;
        const dens = hush ? R.hushLead || 0 : R.density * (.45 + T * .9);
        if(onGrid && rnd() < dens){
          const pool = R.leadFromChord ? ch : [0, 1, 2, 3, 4, 5, 6, 7].slice(0, R.leadRange || 6);
          let d = pool[Math.floor(rnd() * pool.length)]; if(R.leadFromChord && rnd() < .3) d += 7;
          note(t0, hzOf(R.key, R.scale, d, R.leadOct), sx * (R.leadLen || 2.2), R.lead, (hush ? .035 : .06) * (R.leadGain || 1));
        }
        if(dens > 0) L.push(R.lead);
        if(R.sparkle && pos === 8 && rnd() < R.sparkle * (1 - T * .5)){ note(t0, hzOf(R.key, R.scale, ch[2] + 7, R.leadOct + 1), .9, R.spark || 'bell', .03); L.push('sparkle'); }
        if(!hush && T >= (R.percFrom == null ? 2 : R.percFrom)){
          if(loud){
            if(R.kick && R.kick.indexOf(pos) >= 0){ mKick(t0, .16 * (R.kickGain || 1), out); S.notes++; }
            if(R.hat && R.hat.indexOf(pos) >= 0){ mNoise(t0, .045, .05 * (R.hatGain || 1), 7000, 1.2, out); S.notes++; }
            if(R.clap && R.clap.indexOf(pos) >= 0){ mNoise(t0, .12, .07, 1500, .8, out); S.notes++; }
            if(R.tick && pos % 4 === 0){ mNoise(t0, .03, .035, 3200, 6, out); S.notes++; }
          }
          L.push('drums');
        }
        if(R.crowd && T > .5 && !hush){ if(pos === 0 && loud){ mNoise(t0, Math.min(.95, sx * 14), .02 + T * .03, 900, .4, out); S.notes++; } L.push('crowd'); }
        if(R.gim && GIM[R.gim] && !hush){ const gl = GIM[R.gim]({t0: t0, pos: pos, bar: b, T: T, sx: sx, ch: ch, R: R, hz: (d, oc) => hzOf(R.key, R.scale, d, oc), loud: loud, rnd: rnd, out: out}); if(gl){ L.push(gl.trim()); if(loud) S.notes++; } }   /* 🌍 24y-b gimmick */
        if(R.day && DAY_GIM[R.day] && !hush){ const dl = DAY_GIM[R.day]({t0: t0, pos: pos, bar: b, T: T, sx: sx, ch: ch, R: R, hz: (d, oc) => hzOf(R.key, R.scale, d, oc), loud: loud, rnd: rnd, out: out}); if(dl){ L.push('🎊 ' + dl.trim()); if(loud) S.notes++; } }   /* 🎊 24y-c day layer */
        if(R.pedal && (T > .7 || R.pedalAlways) && !hush){ if(pos === 0) note(t0, hzOf(R.key, R.scale, R.pedal, 1), sx * 16, 'saw', .025); L.push('pedal'); }
        if(R.crackle && loud && !hush && rnd() < R.crackle){ mNoise(t0 + rnd() * sx, .015, .008 + rnd() * .01, 2200 + rnd() * 3500, 2.5, out); S.notes++; L.push('crackle'); }   // ☕ an-5: vinyl crackle
        S.layers = L.join(' · ');
        S.step++; S.next += sx; if(S.lift > 0) S.lift--;
      }
      try{ K.mFilt.frequency.setTargetAtTime(S.hush ? 900 : Math.min(R.filtMax || 9e9, 1600 + 7000 * S.t), now, .3); }catch(e){}
    }
    const H = {
      id: R.id || name, name: R.name || name, fam: R.fam || '', world: R.world || '', day: R.day || '', live: true, S: S, R: R, tune: R.tune + 1,
      set(k, v){ if(k === 'tension'){ const n = Number(v); S.t = isNaN(n) ? 0 : Math.min(1, Math.max(0, n)); } return H; },
      tension(v){ return H.set('tension', v); },
      hush(on){ S.hush = !!on; return H; },
      lift(){
        if(!H.live) return H;
        S.lift = 32;
        if(c.state === 'running' && !S.paused && K.enabled && K.mus().on){
          const t0 = c.currentTime + .03, ch = chordAt(Math.floor(S.step / 16));
          [0, 1, 2, 3].forEach(k => { mNote(t0 + k * .09, hzOf(R.key, R.scale, ch[k % ch.length] + (k > 2 ? 7 : 0), R.leadOct), .5, R.liftInst || 'bell', .07, out); S.notes++; });
          if(R.day && DAY_LIFT[R.day]){ DAY_LIFT[R.day]({t0: t0 + .38, R: R, out: out, ch: ch, hz: (d, oc) => hzOf(R.key, R.scale, d, oc)}); S.notes++; }   /* 🎊 24y-c */
        }
        return H;
      },
      pause(on, why){
        why = why || 'game';
        if(on) S.why[why] = 1; else delete S.why[why];
        const p = Object.keys(S.why).length > 0;
        if(p === S.paused) return H;
        S.paused = p;
        try{ const t = c.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(.0001, out.gain.value), t);
          if(p) out.gain.setTargetAtTime(.0001, t, .08); else { faded = true; out.gain.exponentialRampToValueAtTime(1, t + .5); } }catch(e){}
        S.next = 0; K.musTell();
        return H;
      },
      stop(){
        if(!H.live) return;
        H.live = false; clearInterval(timer);
        try{ const t = c.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(.0001, out.gain.value), t); out.gain.setTargetAtTime(.0001, t, .15); }catch(e){}
        setTimeout(() => { try{ out.disconnect(); }catch(e){} }, 1200);
        try{ K.mFilt.frequency.setTargetAtTime(6000, c.currentTime, .2); }catch(e){}
        if(K.MOOD === H){ K.MOOD = null; K.musTell(); }
      }
    };
    const timer = setInterval(tick, 25);
    K.MOOD = H; K.musTell();
    if(document.hidden) H.pause(true, 'hidden');
    return H;
  }
  try{ document.addEventListener('visibilitychange', () => { if(K.MOOD) K.MOOD.pause(document.hidden, 'hidden'); }); }catch(e){}
  Object.assign(UISound, {mood: mood, moodKey: moodKey, MOODS: MOODS, MOOD_FAMILIES: FAMILIES,
    WORLDS: WORLDS, WORLD_OF: WORLD_OF, worldOf: worldOf});   /* 🌍 24y-b2 */

  /* 🎊 24y-c: API · the 🎵 sheet's Special-days row · Settings Birthday_<Name> + MusicPicks_<Name> (newest wins) */
  const DAYS_API = {get(who){ return dayPicks(who); }, set(ch, who){ return dayPicksSet(ch || {}, who); }, now: dayNow, next: dayNext, on: dayOn, LOY: DAY_LOY, ORDER: DAY_ORDER, BDAY: BDAY};
  Object.assign(UISound, {DAYS: DAYS, dayNow: dayNow, days: DAYS_API});
  const apply0 = UISound.applySettings;
  if(apply0) UISound.applySettings = function(st){
    try{ Object.keys(st || {}).forEach(k => {
      if(k.indexOf('Birthday_') === 0){ const v = String(st[k] || ''); if(/^\d{2}-\d{2}$/.test(v)) BDAY[k.slice(9)] = v; }
      if(k.indexOf('MusicPicks_') === 0){ let x = null; try{ x = JSON.parse(st[k]); }catch(e){} const d = x && x.days, who = k.slice(11);
        if(d && Number(d.at) > dayPicks(who).at){ try{ localStorage.setItem('sp_days:' + who, JSON.stringify({on: d.on !== false, dress: d.dress === 'full' ? 'full' : 'touch', at: Number(d.at)})); }catch(e){} } }
    }); }catch(e){}
    return apply0.apply(this, arguments);
  };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function dayCss(){
    if(document.getElementById('ui-days-css')) return;
    const st = document.createElement('style'); st.id = 'ui-days-css';
    st.textContent = '.ui-mus .ui-mus-dayl{flex:1 1 auto;min-width:0;font-family:Nunito,sans-serif;font-size:.82rem;line-height:1.25;color:#4E4566;}'
      + '.ui-mus .ui-mus-dayl b{color:#2B2440;}'
      + '.ui-mus .ui-mus-dayon{min-width:92px;}';
    document.head.appendChild(st);
  }
  function daySheetRow(el){
    dayCss();
    const h = document.createElement('h4'); h.className = 'ui-mus-h2'; h.textContent = '🎊 Special days';
    const row = document.createElement('div'); row.className = 'ui-mus-row ui-mus-days';
    row.innerHTML = '<button type="button" class="ui-mus-on ui-mus-dayon" data-sound="tap"></button><span class="ui-mus-dayl"></span>';
    const nt = el.querySelector('.ui-mus-note'); el.insertBefore(h, nt); el.insertBefore(row, nt);
    const b = row.querySelector('button'), l = row.querySelector('.ui-mus-dayl');
    function paint(){
      const p = dayPicks(), k = dayOn(dayDate(), dayWho()), n = dayNext();
      b.textContent = p.on ? '🎊 On' : '🔕 Off'; b.classList.toggle('off', !p.on); b.setAttribute('aria-pressed', p.on ? 'true' : 'false');
      if(k){ const D = DAYS[k]; l.innerHTML = '<b>' + D.icon + ' ' + D.name + ' today!</b><br>' + (p.on ? 'its music is on' : 'tap 🎊 to hear its music'); }
      else if(n){ const D = DAYS[n.k]; l.innerHTML = 'Next: <b>' + D.icon + ' ' + D.name + '</b><br>' + n.date.getDate() + ' ' + MON[n.date.getMonth()] + (n.inDays === 1 ? ' · tomorrow' : ' · in ' + n.inDays + ' days'); }
      else l.textContent = 'special days add their own music';
    }
    b.onclick = e => { e.stopPropagation(); dayPicksSet({on: !dayPicks().on}); paint(); };
    paint();
    const top = el.offsetTop, hh = el.offsetHeight; if(top + hh > innerHeight - 8) el.style.top = Math.max(8, innerHeight - 8 - hh) + 'px';   /* offset* = no scale from the pop-in animation */
  }
  const sheet0 = UISound.music && UISound.music.sheet;
  if(sheet0) UISound.music.sheet = function(a, o){ const res = sheet0.call(this, a, o); try{ if(res && res.el) daySheetRow(res.el); }catch(e){} return res; };
})();
