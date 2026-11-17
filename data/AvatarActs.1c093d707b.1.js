
// 🎭 BLOCKS START (AvatarActs — game blocks, part 2)
// 🎭 BLOCK beatcorner (🧱 baseline chat · 🎵 beatcorner) START
// 🎵 BeatCorner — the avatar's actions on the 🎬 beat timeline (🧱 b3b4, 2026-11-18). ready → anticipation → contact → follow-through → settle.
// The notes are KNOWN before they arrive, so the wind-up starts ≈ 0.2 s before the next note; CONTACT = the player's real press (a late press
// skips the wind-up, no press lets it go, a miss = a stumble). 🕺 corner dancer: punch up (top corners) / stomp + point down (bottom corners),
// mirrored for the left side · 💃 centre pad: a leap whose contact = the landing in the middle · 🎹 piano: the hand lifts over the coming key,
// presses (contact), bounces · 🥁 drums: the stick goes up on that side, strikes (contact), rebounds; kick = a body bounce, cymbal = a big swing.
// The groove / head-nod loops stay as they are (idle loops don't count). The drummer's 🥢 is added by the page (pose item), not in these poses.
Acting.add({poses: {
  // 🕺 dancer (front view; mirrored with dir -1 for the left corners)
  'bc.groove':   {armL: 0.45, armR: 0.45, elbowL: 0.4, elbowR: 0.4, kneeL: 0.2, kneeR: 0.2, dy: 1},
  'bc.coilUp':   {armL: 0.6, elbowL: 0.6, armR: 0.8, elbowR: 1.8, kneeL: 0.5, kneeR: 0.5, dy: 4, sy: 0.93, rot: -0.06},
  'bc.punchUp':  {armL: 0.5, elbowL: 0.3, armR: 2.75, elbowR: -0.05, legR: -0.25, kneeR: 0.1, dy: -4, sy: 1.07, sx: 0.96, rot: 0.08},
  'bc.punchHold':{armL: 0.55, elbowL: 0.5, armR: 2.4, elbowR: 0.4, legR: -0.12, dy: -1, rot: 0.04},
  'bc.coilDown': {armL: 0.7, elbowL: 0.4, armR: 2.2, elbowR: 1.1, dy: -2, sy: 1.04, rot: -0.05},
  'bc.stomp':    {armL: 0.9, elbowL: 0.2, armR: 1.15, elbowR: -0.1, legR: -0.5, kneeR: 0.35, footR: -0.3, kneeL: 0.3, dy: 3, sy: 0.92, rot: 0.1},
  'bc.stompHold':{armL: 0.7, elbowL: 0.3, armR: 1.0, elbowR: 0.4, legR: -0.25, kneeR: 0.2, dy: 1, rot: 0.04},
  'bc.crouch':   {armL: 0.3, armR: 0.3, elbowL: 0.9, elbowR: 0.9, kneeL: 0.8, kneeR: 0.8, dy: 7, sy: 0.88, sx: 1.06},
  'bc.burst':    {armL: 3.0, armR: 3.0, elbowL: -0.1, elbowR: -0.1, footL: 0.4, footR: 0.4, dy: -12, sy: 1.1, sx: 0.94},
  'bc.fists':    {armL: 2.8, armR: 2.8, elbowL: 1.1, elbowR: 1.1, dy: -3, sy: 1.04},
  'bc.trip':     {armL: 2.4, armR: 1.6, elbowL: 0.3, elbowR: 0.6, legL: 0.6, kneeL: 0.4, rot: -0.32, sy: 0.95, dy: 2},
  'bc.wobble':   {armL: 1.2, armR: 0.8, elbowL: 0.4, elbowR: 0.5, rot: 0.15, kneeL: 0.25, kneeR: 0.25},
  'bc.tuck':     {armL: 2.2, armR: 2.2, elbowL: 0.5, elbowR: 0.5, legL: 0.8, kneeL: 1.2, legR: 0.5, kneeR: 1.2, dy: -8},
  'bc.land':     {armL: 1.3, armR: 1.3, elbowL: 0.3, elbowR: 0.3, kneeL: 0.8, kneeR: 0.8, dy: 6, sy: 0.86, sx: 1.1},
  'bc.tada':     {armL: 2.3, armR: 2.3, elbowL: -0.1, elbowR: -0.1, dy: -2, sy: 1.04},
  // 🎹 piano (sitting behind the keys, front view)
  'bc.pRest':    {armL: 1.3, armR: 1.3},
  'bc.pLiftR':   {armL: 1.3, armR: 1.8, elbowR: 0.55, dy: -1},
  'bc.pPressR':  {armL: 1.25, armR: 1.05, elbowR: -0.15, dy: 2, sy: 0.97, rot: 0.04},
  'bc.pBounceR': {armL: 1.3, armR: 1.45, elbowR: 0.2, dy: -1},
  'bc.pLiftL':   {armR: 1.3, armL: 1.8, elbowL: 0.55, dy: -1},
  'bc.pPressL':  {armR: 1.25, armL: 1.05, elbowL: -0.15, dy: 2, sy: 0.97, rot: -0.04},
  'bc.pBounceL': {armR: 1.3, armL: 1.45, elbowL: 0.2, dy: -1},
  'bc.pRaise':   {armL: 2.5, armR: 2.5, elbowL: 0.6, elbowR: 0.6, dy: -3, sy: 1.05},
  'bc.pSlam':    {armL: 1.0, armR: 1.0, elbowL: -0.2, elbowR: -0.2, dy: 3, sy: 0.94},
  'bc.pFlourish':{armL: 2.8, armR: 2.8, elbowL: -0.1, elbowR: -0.1, dy: -5, sy: 1.06},
  'bc.pOops':    {armL: 1.7, armR: 1.7, elbowL: 1.2, elbowR: 1.2, dy: -1, rot: -0.1},
  // 🥁 drums (sticks: the right hand holds the 🥢)
  'bc.dRest':    {armL: 1.5, armR: 1.5},
  'bc.dUpR':     {armL: 1.5, armR: 2.45, elbowR: 0.7, dy: -1},
  'bc.dHitR':    {armL: 1.45, armR: 1.0, elbowR: -0.2, dy: 2, sy: 0.96, rot: 0.05},
  'bc.dRebR':    {armL: 1.5, armR: 1.75, elbowR: 0.35},
  'bc.dUpL':     {armR: 1.5, armL: 2.45, elbowL: 0.7, dy: -1},
  'bc.dHitL':    {armR: 1.45, armL: 1.0, elbowL: -0.2, dy: 2, sy: 0.96, rot: -0.05},
  'bc.dRebL':    {armR: 1.5, armL: 1.75, elbowL: 0.35},
  'bc.dUpBoth':  {armL: 2.4, armR: 2.4, elbowL: 0.7, elbowR: 0.7, dy: -2},
  'bc.dHitBoth': {armL: 1.0, armR: 1.0, elbowL: -0.2, elbowR: -0.2, dy: 2, sy: 0.95},
  'bc.dRebBoth': {armL: 1.75, armR: 1.75, elbowL: 0.35, elbowR: 0.35},
  'bc.dKickUp':  {armL: 1.6, armR: 1.6, dy: -3, sy: 1.04},
  'bc.dKick':    {armL: 1.4, armR: 1.4, dy: 3, sy: 0.92, sx: 1.05},
  'bc.dWind':    {armL: 1.5, armR: 2.95, elbowR: 1.0, dy: -3, sy: 1.04, rot: -0.08},
  'bc.dCrash':   {armL: 1.6, armR: 0.8, elbowR: -0.3, dy: 2, sy: 0.94, rot: 0.1},
  'bc.dRing':    {armL: 1.7, armR: 1.9, elbowR: 0.2, rot: 0.03},
  'bc.dOops':    {armL: 1.9, armR: 1.9, elbowL: 1.2, elbowR: 1.2, rot: 0.1}
}, acts: {
  'beatcorner.up':     {tags: ['dance', 'beat'], share: true, about: '🕺 a top-corner beat — coil down, punch up on the hit, hold', beats: [
    {pose: 'bc.groove', face: 'focused', ms: 30}, {pose: 'bc.coilUp', face: 'determined', ms: 160},
    {pose: 'bc.punchUp', face: 'joy', ms: 70, contact: true}, {pose: 'bc.punchHold', face: 'happy', ms: 170, ease: 'backOut'}, {pose: 'bc.groove', face: 'happy', ms: 120}]},
  'beatcorner.down':   {tags: ['dance', 'beat'], share: true, about: '🕺 a bottom-corner beat — rise, stomp + point down on the hit', beats: [
    {pose: 'bc.groove', face: 'focused', ms: 30}, {pose: 'bc.coilDown', face: 'determined', ms: 160},
    {pose: 'bc.stomp', face: 'joy', ms: 70, contact: true, tricks: ['dust']}, {pose: 'bc.stompHold', face: 'happy', ms: 170, ease: 'backOut'}, {pose: 'bc.groove', face: 'happy', ms: 120}]},
  'beatcorner.cheer':  {tags: ['win', 'dance', 'beat'], share: true, about: '🔥 a big combo — crouch, burst up, fists', beats: [
    {pose: 'bc.groove', face: 'happy', ms: 20}, {pose: 'bc.crouch', face: 'excited', ms: 120},
    {pose: 'bc.burst', face: 'star-eyes', ms: 80, contact: true, marks: ['sparkles']}, {pose: 'bc.fists', face: 'joy', ms: 300, ease: 'backOut', marks: ['sparkles']},
    {pose: 'bc.groove', face: 'happy', ms: 160}]},
  'beatcorner.stumble':{tags: ['miss', 'beat'], share: true, about: '😅 a miss — trip, wobble, back on the beat', beats: [
    {name: 'ready', pose: 'bc.groove', face: 'neutral', ms: 20}, {name: 'contact', pose: 'bc.trip', face: 'gasp', ms: 70, contact: true, marks: ['big-sweat']},
    {name: 'follow', pose: 'bc.wobble', face: 'embarrassed', ms: 260, ease: 'elasticOut'}, {name: 'settle', pose: 'bc.groove', face: 'embarrassed', ms: 160}]},
  'beatcorner.leap':   {tags: ['dance', 'move', 'beat'], share: true, about: '💃 the centre pad — jump in, land in the middle, ta-da', beats: [
    {pose: 'bc.crouch', face: 'excited', ms: 60}, {pose: 'bc.tuck', face: 'joy', ms: 250},
    {pose: 'bc.land', face: 'determined', ms: 70, contact: true, tricks: ['dust'], marks: ['sparkles']}, {pose: 'bc.tada', face: 'star-eyes', ms: 220, ease: 'backOut', marks: ['sparkles']},
    {pose: 'bc.groove', face: 'joy', ms: 100}]},
  'beatcorner.keyR':   {tags: ['music', 'beat'], share: true, about: '🎹 right hand — lift over the coming key, press, bounce', beats: [
    {pose: 'bc.pRest', face: 'focused', ms: 30}, {pose: 'bc.pLiftR', face: 'focused', ms: 150},
    {pose: 'bc.pPressR', face: 'happy', ms: 60, contact: true}, {pose: 'bc.pBounceR', face: 'happy', ms: 140, ease: 'backOut'}, {pose: 'bc.pRest', face: 'happy', ms: 110}]},
  'beatcorner.keyL':   {tags: ['music', 'beat'], share: true, about: '🎹 left hand — lift over the coming key, press, bounce', beats: [
    {pose: 'bc.pRest', face: 'focused', ms: 30}, {pose: 'bc.pLiftL', face: 'focused', ms: 150},
    {pose: 'bc.pPressL', face: 'happy', ms: 60, contact: true}, {pose: 'bc.pBounceL', face: 'happy', ms: 140, ease: 'backOut'}, {pose: 'bc.pRest', face: 'happy', ms: 110}]},
  'beatcorner.chord':  {tags: ['music', 'win', 'beat'], share: true, about: '✨ the big chord — both hands up, slam, flourish', beats: [
    {pose: 'bc.pRest', face: 'excited', ms: 30}, {pose: 'bc.pRaise', face: 'determined', ms: 200},
    {pose: 'bc.pSlam', face: 'joy', ms: 70, contact: true, marks: ['sparkles']}, {pose: 'bc.pFlourish', face: 'star-eyes', ms: 260, ease: 'backOut', marks: ['sparkles']},
    {pose: 'bc.pRest', face: 'happy', ms: 150}]},
  'beatcorner.pOops':  {tags: ['miss', 'music', 'beat'], share: true, about: '😅 a missed note at the piano — hands up, oops, back down', beats: [
    {name: 'anticipation', pose: 'bc.pRest', face: 'neutral', ms: 20}, {name: 'contact', pose: 'bc.pOops', face: 'embarrassed', ms: 70, contact: true}, {name: 'follow', pose: 'bc.pRest', face: 'nervous', ms: 220}]},
  'beatcorner.drumR':  {tags: ['music', 'beat'], share: true, about: '🥁 right side — stick up, strike, rebound', beats: [
    {pose: 'bc.dRest', face: 'focused', ms: 30}, {pose: 'bc.dUpR', face: 'determined', ms: 150},
    {pose: 'bc.dHitR', face: 'happy', ms: 60, contact: true}, {pose: 'bc.dRebR', face: 'happy', ms: 140, ease: 'backOut'}, {pose: 'bc.dRest', face: 'happy', ms: 110}]},
  'beatcorner.drumL':  {tags: ['music', 'beat'], share: true, about: '🥁 left side — stick up, strike, rebound', beats: [
    {pose: 'bc.dRest', face: 'focused', ms: 30}, {pose: 'bc.dUpL', face: 'determined', ms: 150},
    {pose: 'bc.dHitL', face: 'happy', ms: 60, contact: true}, {pose: 'bc.dRebL', face: 'happy', ms: 140, ease: 'backOut'}, {pose: 'bc.dRest', face: 'happy', ms: 110}]},
  'beatcorner.drumC':  {tags: ['music', 'beat'], share: true, about: '🥁 middle — both sticks up, strike, rebound', beats: [
    {pose: 'bc.dRest', face: 'focused', ms: 30}, {pose: 'bc.dUpBoth', face: 'determined', ms: 150},
    {pose: 'bc.dHitBoth', face: 'happy', ms: 60, contact: true}, {pose: 'bc.dRebBoth', face: 'happy', ms: 140, ease: 'backOut'}, {pose: 'bc.dRest', face: 'happy', ms: 110}]},
  'beatcorner.kick':   {tags: ['music', 'beat'], share: true, about: '🦶 the kick drum — bob up, thump down, settle', beats: [
    {pose: 'bc.dRest', face: 'focused', ms: 20}, {pose: 'bc.dKickUp', face: 'determined', ms: 120},
    {pose: 'bc.dKick', face: 'happy', ms: 60, contact: true}, {pose: 'bc.dRest', face: 'happy', ms: 160, ease: 'backOut'}]},
  'beatcorner.cymbal': {tags: ['music', 'beat'], share: true, about: '💥 a cymbal — big wind-up, crash, let it ring', beats: [
    {pose: 'bc.dRest', face: 'focused', ms: 30}, {pose: 'bc.dWind', face: 'determined', ms: 200},
    {pose: 'bc.dCrash', face: 'joy', ms: 70, contact: true, marks: ['sparkles']}, {pose: 'bc.dRing', face: 'cool', ms: 220, ease: 'backOut'}, {pose: 'bc.dRest', face: 'happy', ms: 130}]},
  'beatcorner.dOops':  {tags: ['miss', 'music', 'beat'], share: true, about: '😅 a missed beat at the drums — sticks up, oops', beats: [
    {name: 'anticipation', pose: 'bc.dRest', face: 'neutral', ms: 20}, {name: 'contact', pose: 'bc.dOops', face: 'embarrassed', ms: 70, contact: true}, {name: 'follow', pose: 'bc.dRest', face: 'nervous', ms: 220}]}
}, pools: {'beatcorner': ['beatcorner.up', 'beatcorner.down', 'beatcorner.cheer', 'beatcorner.stumble', 'beatcorner.leap', 'beatcorner.keyR', 'beatcorner.keyL',
  'beatcorner.chord', 'beatcorner.pOops', 'beatcorner.drumR', 'beatcorner.drumL', 'beatcorner.drumC', 'beatcorner.kick', 'beatcorner.cymbal', 'beatcorner.dOops']}},
{by: '🧱 baseline chat', block: 'beatcorner', game: 'beatcorner', date: '2026-11-18'});
// 🎭 BLOCK beatcorner END

// 🎭 BLOCKS END (AvatarActs — add your own 🎭 BLOCK above this line)
