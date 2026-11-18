
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

// 🎭 BLOCK slabrall (🧱 baseline chat · 🏓 slabrall) START
// 🏓 SlaBrall — every swing on the 🎬 beat timeline (🧱 b3b5, 2026-11-18). ready → anticipation → contact → follow-through → settle.
// The ENGINE owns contact (its 'hit' / 'serve' event = the contact tick): the page sees the ball coming and starts the wind-up ≈ 0.25 s
// before it reaches the player's reach (held there until the hit; let go if the ball never arrives). Side view, facing right: armR + =
// forward, holdRot = the racket's angle in the hand (+ back, − through). Shots: drive (forehand) · back (backhand) · smash · lob · drop ·
// slice · jump smash (contact at the top of the jump) · dive (the game tips the body, the act reaches) · serves over / under · 🏒 paddle push ·
// a whiff · point won (fist) / lost (slump).
Acting.add({poses: {
  'sb.ready':     {armR: 0.6, elbowR: 0.4, armL: 0.5, elbowL: 0.6, holdRot: 0.2, kneeL: 0.15, kneeR: 0.15},
  'sb.back':      {armR: -0.9, elbowR: 0.5, armL: 1.0, elbowL: 0.4, holdRot: 0.7, rot: -0.1, legL: 0.25, kneeL: 0.25, kneeR: 0.2},
  'sb.drive':     {armR: 1.6, elbowR: -0.1, armL: 0.3, holdRot: -0.6, bend: 0.1, rot: 0.06, legL: 0.3, kneeL: 0.15, legR: -0.15},
  'sb.across':    {armR: 2.6, elbowR: 0.7, armL: 0.2, holdRot: -1.4, rot: 0.1, legL: 0.25, legR: -0.2},
  'sb.bhWind':    {armR: 1.2, elbowR: 1.8, armL: 1.3, elbowL: 1.0, holdRot: 1.2, rot: -0.12, legR: -0.25, kneeR: 0.2},
  'sb.bhHit':     {armR: 1.5, elbowR: 0, armL: -0.2, holdRot: -0.2, bend: 0.08, rot: 0.04, legR: -0.3},
  'sb.bhFollow':  {armR: 2.3, elbowR: -0.3, armL: -0.5, holdRot: -0.6, rot: 0.08, legR: -0.2},
  'sb.smWind':    {armR: 2.9, elbowR: 1.6, armL: 2.7, elbowL: 0.1, holdRot: 1.0, rot: -0.16, legR: -0.25, kneeL: 0.2, kneeR: 0.2},
  'sb.smHit':     {armR: 2.6, elbowR: -0.1, armL: 1.0, holdRot: -0.8, bend: 0.15, dy: -2, sy: 1.04},
  'sb.smFollow':  {armR: 0.6, elbowR: 0.3, armL: 0.4, holdRot: -1.6, bend: 0.3, rot: 0.1},
  'sb.lobWind':   {armR: -0.4, elbowR: 0.2, armL: 0.8, holdRot: 0.6, kneeL: 0.6, kneeR: 0.6, dy: 4, sy: 0.95},
  'sb.lobHit':    {armR: 1.2, elbowR: 0, armL: 0.6, holdRot: -0.4, dy: 1},
  'sb.lobFollow': {armR: 3.0, elbowR: -0.1, armL: 0.8, holdRot: -1.0, dy: -2, sy: 1.04},
  'sb.dropWind':  {armR: 0.3, elbowR: 0.4, armL: 0.7, holdRot: 0.4, bend: 0.05},
  'sb.dropHit':   {armR: 1.1, elbowR: 0, armL: 0.5, holdRot: -0.2, bend: 0.1},
  'sb.dropHold':  {armR: 1.2, elbowR: 0, armL: 0.5, holdRot: -0.25, bend: 0.12},
  'sb.slWind':    {armR: 2.2, elbowR: 0.8, armL: 0.9, holdRot: 0.9, rot: -0.08},
  'sb.slHit':     {armR: 1.2, elbowR: 0, armL: 0.5, holdRot: 0.3, bend: 0.1},
  'sb.slFollow':  {armR: 0.2, elbowR: 0.4, armL: 0.4, holdRot: 0.6, bend: 0.18},
  'sb.jTuck':     {armR: 3.0, elbowR: 1.6, armL: 2.8, holdRot: 1.0, legL: 0.8, kneeL: 1.2, legR: 0.5, kneeR: 1.0, rot: -0.12},
  'sb.jHit':      {armR: 2.5, elbowR: -0.1, armL: 0.9, holdRot: -1.0, bend: 0.2, legL: 0.3, legR: -0.2},
  'sb.jFollow':   {armR: 0.4, elbowR: 0.3, armL: 0.5, holdRot: -1.6, bend: 0.35, legL: 0.4, kneeL: 0.4, legR: -0.2, kneeR: 0.4},
  'sb.jLand':     {armR: 0.6, elbowR: 0.4, armL: 0.5, holdRot: 0.1, kneeL: 0.6, kneeR: 0.6, dy: 4, sy: 0.9, sx: 1.06},
  'sb.lunge':     {armR: 1.4, elbowR: 0.3, armL: 0.6, holdRot: 0.3, bend: 0.4, legR: -0.6, kneeR: 0.4},
  'sb.reach':     {armR: 2.0, elbowR: -0.1, armL: 2.2, holdRot: -0.6, bend: 0.2},
  'sb.sprawl':    {armR: 2.2, armL: 2.4, holdRot: -0.2},
  'sb.getup':     {armR: 0.8, armL: 0.8, kneeL: 0.6, kneeR: 0.6, dy: 3, sy: 0.94},
  'sb.svStance':  {armR: 0.4, elbowR: 0.4, armL: 1.3, elbowL: 0.2, holdRot: 0.3, legL: 0.25, kneeL: 0.1},
  'sb.svToss':    {armR: 2.8, elbowR: 1.6, armL: 2.9, elbowL: 0, holdRot: 1.0, rot: -0.15, kneeL: 0.4, kneeR: 0.4, dy: 2},
  'sb.svHit':     {armR: 2.6, elbowR: -0.1, armL: 1.0, holdRot: -0.8, dy: -3, sy: 1.05},
  'sb.svFollow':  {armR: 0.3, elbowR: 0.3, armL: 0.6, holdRot: -1.6, bend: 0.3},
  'sb.suWind':    {armR: -0.8, elbowR: 0.2, armL: 1.4, elbowL: 0.3, holdRot: 0.5, bend: 0.15, kneeL: 0.2, kneeR: 0.2},
  'sb.suHit':     {armR: 1.3, elbowR: 0, armL: 1.0, holdRot: -0.3, bend: 0.12},
  'sb.suFollow':  {armR: 2.4, elbowR: 0.2, armL: 0.6, holdRot: -0.9, bend: 0.05},
  'sb.pkPull':    {armR: 0.8, elbowR: 0.9, armL: 0.8, elbowL: 0.9, bend: -0.05, shift: -2},
  'sb.pkPush':    {armR: 1.5, elbowR: 0, armL: 1.5, elbowL: 0, bend: 0.25, shift: 3},
  'sb.pkAfter':   {armR: 1.4, elbowR: 0.2, armL: 1.4, elbowL: 0.2, bend: 0.15, shift: 1},
  'sb.whWind':    {armR: -0.6, elbowR: 0.3, armL: 1.0, holdRot: 0.6, rot: -0.08},
  'sb.whiff':     {armR: 2.3, elbowR: 0.2, armL: 0.3, holdRot: -1.2, rot: 0.25, legL: 0.3},
  'sb.wobble':    {armR: 1.2, elbowR: 0.4, armL: 1.6, holdRot: 0.2, rot: -0.15, kneeL: 0.2},
  'sb.crouch':    {armR: 0.5, elbowR: 0.8, armL: 0.5, elbowL: 0.9, holdRot: 0.3, kneeL: 0.6, kneeR: 0.6, dy: 4, sy: 0.93},
  'sb.fist':      {armR: 2.4, elbowR: 0.4, armL: 2.9, elbowL: 1.2, holdRot: -0.3, dy: -4, sy: 1.06},
  'sb.fistDown':  {armR: 1.8, elbowR: 0.6, armL: 2.0, elbowL: 1.7, holdRot: -0.1, dy: -1},
  'sb.slump':     {armR: 0.1, elbowR: 0.1, armL: 0.1, holdRot: 0.6, bend: 0.35, dy: 2, sy: 0.95},
  'sb.sigh':      {armR: 0.2, elbowR: 0.2, armL: 0.2, holdRot: 0.4, bend: 0.2, dy: 1},
  // 🎾 b3b6 serves with a real toss (one per sport) — the free hand (armL) tosses / drops, the racket (armR) waits, then the engine's contact tick
  'sb.tsToss':    {armR: -0.5, elbowR: 0.3, armL: 2.9, elbowL: 0, holdRot: 0.6, kneeL: 0.15, kneeR: 0.15, legL: 0.2},
  'sb.trophy':    {armR: 2.3, elbowR: 2.0, armL: 2.7, elbowL: 0.1, holdRot: 1.6, rot: -0.18, kneeL: 0.45, kneeR: 0.45, legL: 0.25, dy: 3, sy: 0.96},
  'sb.tsHit':     {armR: 3.0, elbowR: -0.05, armL: 1.0, elbowL: 0.3, holdRot: -0.6, rot: 0.05, dy: -5, sy: 1.06},
  'sb.tsFollow':  {armR: 0.4, elbowR: 0.4, armL: 0.3, holdRot: -1.7, bend: 0.35, legR: -0.35, kneeR: 0.3, shift: 2},
  'sb.ptToss':    {armR: 0.0, elbowR: 0.6, armL: 1.7, elbowL: 0.1, holdRot: 0.7, bend: 0.18, kneeL: 0.25, kneeR: 0.25},
  'sb.ptBack':    {armR: -0.3, elbowR: 0.5, armL: 1.3, elbowL: 0.3, holdRot: 0.9, bend: 0.22, kneeL: 0.3, kneeR: 0.3},
  'sb.ptBrush':   {armR: 1.1, elbowR: 0.2, armL: 0.8, elbowL: 0.4, holdRot: -0.5, bend: 0.2, kneeL: 0.25, kneeR: 0.25},
  'sb.ptFollow':  {armR: 1.9, elbowR: 0.4, armL: 0.6, elbowL: 0.5, holdRot: -0.9, bend: 0.12},
  'sb.fdHold':    {armR: -0.7, elbowR: 0.2, armL: 1.4, elbowL: 0.2, holdRot: 0.6, bend: 0.1},
  'sb.fdLetGo':   {armR: -0.9, elbowR: 0.2, armL: 0.9, elbowL: 0.7, holdRot: 0.8, bend: 0.15, kneeL: 0.15, kneeR: 0.15},
  'sb.fdHit':     {armR: 1.0, elbowR: 0, armL: 0.6, elbowL: 0.4, holdRot: -0.2, bend: 0.15},
  'sb.fdFollow':  {armR: 2.6, elbowR: 0.1, armL: 0.5, holdRot: -0.9, bend: 0.02, legR: -0.15},
  'sb.dsDrop':    {armR: -0.3, elbowR: 0.3, armL: 1.1, elbowL: 0.2, holdRot: 0.4, bend: 0.15},
  'sb.dsWait':    {armR: -0.9, elbowR: 0.2, armL: 0.9, elbowL: 0.4, holdRot: 0.6, bend: 0.25, kneeL: 0.35, kneeR: 0.35, dy: 2},
  'sb.dsScoop':   {armR: 1.2, elbowR: 0, armL: 0.7, elbowL: 0.4, holdRot: -0.4, bend: 0.15, kneeL: 0.2, kneeR: 0.2},
  'sb.dsFollow':  {armR: 2.4, elbowR: 0.2, armL: 0.6, holdRot: -1.0, legR: -0.2, dy: -1},
  'sb.wtToss':    {armR: 0.6, elbowR: 1.0, armL: 2.0, elbowL: 0.2, holdRot: 0.6, legL: 0.15},
  'sb.wtBack':    {armR: 2.4, elbowR: 1.8, armL: 1.4, elbowL: 0.3, holdRot: 1.2, rot: -0.12, kneeL: 0.2, kneeR: 0.15},
  'sb.wtHit':     {armR: 1.7, elbowR: 0, armL: 0.6, holdRot: -0.6, bend: 0.1, legL: 0.3},
  'sb.wtFollow':  {armR: 2.7, elbowR: 0.7, armL: 0.3, holdRot: -1.4, rot: 0.1, legR: -0.2}
}, acts: {
  'slabrall.drive':  {tags: ['sport', 'beat'], share: true, about: '🏓 a forehand — racket back, swing through, across the body', beats: [
    {pose: 'sb.ready', face: 'focused', ms: 30}, {pose: 'sb.back', face: 'determined', ms: 200},
    {pose: 'sb.drive', face: 'effort', ms: 60, contact: true}, {pose: 'sb.across', face: 'determined', ms: 220, ease: 'backOut'}, {pose: 'sb.ready', face: 'focused', ms: 150}]},
  'slabrall.back':   {tags: ['sport', 'beat'], share: true, about: '🏓 a backhand — racket across the chest, whip out, follow', beats: [
    {pose: 'sb.ready', face: 'focused', ms: 30}, {pose: 'sb.bhWind', face: 'determined', ms: 200},
    {pose: 'sb.bhHit', face: 'effort', ms: 60, contact: true}, {pose: 'sb.bhFollow', face: 'determined', ms: 220, ease: 'backOut'}, {pose: 'sb.ready', face: 'focused', ms: 150}]},
  'slabrall.smash':  {tags: ['sport', 'beat'], share: true, about: '💥 a smash — racket behind the head, other arm points, snap down', beats: [
    {pose: 'sb.ready', face: 'focused', ms: 30}, {pose: 'sb.smWind', face: 'fierce', ms: 230},
    {pose: 'sb.smHit', face: 'effort', ms: 60, contact: true, tricks: ['impact-flash']}, {pose: 'sb.smFollow', face: 'fierce', ms: 260, ease: 'backOut'}, {pose: 'sb.ready', face: 'proud', ms: 150}]},
  'slabrall.lob':    {tags: ['sport', 'beat'], share: true, about: '🌈 a lob — knees bend, racket low, lift, high finish', beats: [
    {pose: 'sb.ready', face: 'focused', ms: 30}, {pose: 'sb.lobWind', face: 'focused', ms: 200},
    {pose: 'sb.lobHit', face: 'happy', ms: 60, contact: true}, {pose: 'sb.lobFollow', face: 'happy', ms: 260, ease: 'backOut'}, {pose: 'sb.ready', face: 'focused', ms: 150}]},
  'slabrall.drop':   {tags: ['sport', 'beat'], share: true, about: '🪶 a drop shot — a short soft swing that stops and holds', beats: [
    {pose: 'sb.ready', face: 'focused', ms: 30}, {pose: 'sb.dropWind', face: 'sneaky', ms: 160},
    {pose: 'sb.dropHit', face: 'sneaky', ms: 60, contact: true}, {pose: 'sb.dropHold', face: 'cheeky', ms: 240, ease: 'cubicOut'}, {pose: 'sb.ready', face: 'focused', ms: 150}]},
  'slabrall.slice':  {tags: ['sport', 'beat'], share: true, about: '🔪 a slice — racket high and open, chop down', beats: [
    {pose: 'sb.ready', face: 'focused', ms: 30}, {pose: 'sb.slWind', face: 'determined', ms: 200},
    {pose: 'sb.slHit', face: 'effort', ms: 60, contact: true}, {pose: 'sb.slFollow', face: 'cool', ms: 220, ease: 'backOut'}, {pose: 'sb.ready', face: 'focused', ms: 150}]},
  'slabrall.jumpsmash': {tags: ['sport', 'move', 'beat'], share: true, about: '🦘 a jump smash — tuck in the air, hit at the top, land', beats: [
    {pose: 'sb.ready', face: 'determined', ms: 30}, {pose: 'sb.jTuck', face: 'fierce', ms: 240},
    {pose: 'sb.jHit', face: 'effort', ms: 60, contact: true, tricks: ['impact-flash']}, {pose: 'sb.jFollow', face: 'fierce', ms: 240, ease: 'backOut'}, {pose: 'sb.jLand', face: 'proud', ms: 180}]},
  'slabrall.dive':   {tags: ['sport', 'move', 'beat'], share: true, about: '🤸 a dive — lunge, reach out flat, sprawl, get up', beats: [
    {pose: 'sb.ready', face: 'determined', ms: 20}, {pose: 'sb.lunge', face: 'determined', ms: 120},
    {pose: 'sb.reach', face: 'effort', ms: 60, contact: true}, {pose: 'sb.sprawl', face: 'gasp', ms: 280}, {pose: 'sb.getup', face: 'relieved', ms: 220}]},
  'slabrall.serve':  {tags: ['sport', 'beat'], share: true, about: '🎾 an overhand serve — toss up, racket back, reach up and hit, follow down', beats: [
    {pose: 'sb.svStance', face: 'focused', ms: 40}, {pose: 'sb.svToss', face: 'determined', ms: 240},
    {pose: 'sb.svHit', face: 'effort', ms: 60, contact: true}, {pose: 'sb.svFollow', face: 'determined', ms: 240, ease: 'backOut'}, {pose: 'sb.ready', face: 'focused', ms: 150}]},
  'slabrall.under':  {tags: ['sport', 'beat'], share: true, about: '🥒 an underhand serve — ball low, racket back, scoop through', beats: [
    {pose: 'sb.svStance', face: 'focused', ms: 40}, {pose: 'sb.suWind', face: 'focused', ms: 220},
    {pose: 'sb.suHit', face: 'happy', ms: 60, contact: true}, {pose: 'sb.suFollow', face: 'happy', ms: 220, ease: 'backOut'}, {pose: 'sb.ready', face: 'focused', ms: 150}]},
  'slabrall.push':   {tags: ['sport', 'beat'], share: true, about: '🏒 a paddle push — pull back, shove forward, follow', beats: [
    {pose: 'sb.ready', face: 'focused', ms: 20}, {pose: 'sb.pkPull', face: 'determined', ms: 150},
    {pose: 'sb.pkPush', face: 'effort', ms: 60, contact: true}, {pose: 'sb.pkAfter', face: 'determined', ms: 200, ease: 'backOut'}, {pose: 'sb.ready', face: 'focused', ms: 130}]},
  'slabrall.whiff':  {tags: ['sport', 'miss', 'beat'], share: true, about: '😵 a swing at nothing — over-spin, wobble', beats: [
    {pose: 'sb.ready', face: 'focused', ms: 20}, {pose: 'sb.whWind', face: 'determined', ms: 80},
    {pose: 'sb.whiff', face: 'shock', ms: 70, contact: true}, {pose: 'sb.wobble', face: 'embarrassed', ms: 260, ease: 'elasticOut'}, {pose: 'sb.ready', face: 'embarrassed', ms: 160}]},
  'slabrall.yes':    {tags: ['win', 'happy', 'beat'], share: true, about: '✊ point won — crouch, fist up, shake', beats: [
    {pose: 'sb.ready', face: 'happy', ms: 30}, {pose: 'sb.crouch', face: 'excited', ms: 140},
    {pose: 'sb.fist', face: 'joy', ms: 80, contact: true, marks: ['sparkles']}, {pose: 'sb.fistDown', face: 'proud', ms: 280, ease: 'backOut'}, {pose: 'sb.ready', face: 'happy', ms: 200}]},
  // 🎾 b3b6 the five serves (ready = the toss / drop, anticipation = held until the ball comes down — Acting.play stretches it to the engine's contact)
  'slabrall.toss':  {tags: ['sport', 'beat'], share: true, about: '🎾 a tennis toss serve — toss up, trophy pose, reach up and hit, land forward', beats: [
    {pose: 'sb.tsToss', face: 'focused', ms: 220}, {pose: 'sb.trophy', face: 'determined', ms: 380, ease: 'sineOut'},
    {pose: 'sb.tsHit', face: 'effort', ms: 60, contact: true, tricks: ['impact-flash']}, {pose: 'sb.tsFollow', face: 'determined', ms: 260, ease: 'backOut'}, {pose: 'sb.ready', face: 'focused', ms: 160}]},
  'slabrall.ptoss': {tags: ['sport', 'beat'], share: true, about: '🏓 a palm toss serve — ball up from the flat hand, bat back low, brush under', beats: [
    {pose: 'sb.ptToss', face: 'focused', ms: 160}, {pose: 'sb.ptBack', face: 'sneaky', ms: 300, ease: 'sineOut'},
    {pose: 'sb.ptBrush', face: 'cheeky', ms: 60, contact: true}, {pose: 'sb.ptFollow', face: 'happy', ms: 220, ease: 'backOut'}, {pose: 'sb.ready', face: 'focused', ms: 140}]},
  'slabrall.feather': {tags: ['sport', 'beat'], share: true, about: '🏸 a feather drop serve — hold the feathers, let go, hit below the waist, racket up', beats: [
    {pose: 'sb.fdHold', face: 'focused', ms: 60}, {pose: 'sb.fdLetGo', face: 'focused', ms: 250},
    {pose: 'sb.fdHit', face: 'happy', ms: 60, contact: true}, {pose: 'sb.fdFollow', face: 'happy', ms: 240, ease: 'backOut'}, {pose: 'sb.ready', face: 'focused', ms: 150}]},
  'slabrall.dropserve': {tags: ['sport', 'beat'], share: true, about: '🥒 a drop serve — drop the ball, watch it bounce, scoop it underhand', beats: [
    {pose: 'sb.dsDrop', face: 'focused', ms: 140}, {pose: 'sb.dsWait', face: 'focused', ms: 380, ease: 'sineOut'},
    {pose: 'sb.dsScoop', face: 'happy', ms: 60, contact: true}, {pose: 'sb.dsFollow', face: 'happy', ms: 240, ease: 'backOut'}, {pose: 'sb.ready', face: 'focused', ms: 150}]},
  'slabrall.wtoss': {tags: ['sport', 'beat'], share: true, about: '🧱 a squash serve — short side toss, racket cocked, hit at the front wall', beats: [
    {pose: 'sb.wtToss', face: 'focused', ms: 160}, {pose: 'sb.wtBack', face: 'determined', ms: 330, ease: 'sineOut'},
    {pose: 'sb.wtHit', face: 'effort', ms: 60, contact: true}, {pose: 'sb.wtFollow', face: 'determined', ms: 230, ease: 'backOut'}, {pose: 'sb.ready', face: 'focused', ms: 150}]},
  'slabrall.aww':    {tags: ['miss', 'sad', 'beat'], share: true, about: '😩 point lost — slump, sigh, back to ready', beats: [
    {name: 'ready', pose: 'sb.ready', face: 'neutral', ms: 30}, {name: 'contact', pose: 'sb.slump', face: 'disappointed', ms: 90, contact: true},
    {name: 'follow', pose: 'sb.sigh', face: 'sad', ms: 360, ease: 'cubicOut'}, {name: 'settle', pose: 'sb.ready', face: 'determined', ms: 220}]}
}, pools: {'slabrall': ['slabrall.drive', 'slabrall.back', 'slabrall.smash', 'slabrall.lob', 'slabrall.drop', 'slabrall.slice', 'slabrall.jumpsmash', 'slabrall.dive',
  'slabrall.serve', 'slabrall.under', 'slabrall.push', 'slabrall.whiff', 'slabrall.yes', 'slabrall.aww',
  'slabrall.toss', 'slabrall.ptoss', 'slabrall.feather', 'slabrall.dropserve', 'slabrall.wtoss']}},
{by: '🧱 baseline chat', block: 'slabrall', game: 'slabrall', date: '2026-11-18'});
// 🎭 BLOCK slabrall END

// 🎭 BLOCK soulbopper (🧱 baseline chat · 👻💣 soulbopper) START
// 👻💣 Soul Bopper — every action on the 🎬 beat timeline (🧱 b3b7, 2026-11-18). ready → anticipation → contact → follow-through → settle.
// The ENGINE owns contact (its event = the contact tick). Taps (plant · kick · toss · 🏏 bat · dash · 🪤 trap) can't be known early, so
// the page plays them FROM contact (anticipation skipped — the beats are kept for pictures, crowds, comics). Where the game holds or the page
// sees it coming there is a real wind-up: 🏋️ the 0.22 s hold before a lift · ✨ a power-up 1 cell ahead · 😱 a pop next to you (brace).
// Side view facing right: armR + = forward (π = straight up), armL + = back, legR − = forward, bend + = lean in, dy + = lower, holdRot = the bat.
Acting.add({poses: {
  'bp.ready':     {armR: 0.35, elbowR: 0.3, armL: 0.35, elbowL: 0.3},
  'bp.squat':     {armR: 0.9, elbowR: 0.5, armL: 0.6, elbowL: 0.4, bend: 0.1, kneeL: 0.7, kneeR: 0.7, dy: 6, sy: 0.92},
  'bp.place':     {armR: 1.0, elbowR: 0.2, armL: 0.8, elbowL: 0.2, bend: 0.18, kneeL: 0.9, kneeR: 0.9, dy: 9, sy: 0.88},
  'bp.pat':       {armR: 0.9, elbowR: 0.9, armL: 0.4, bend: 0.15, kneeL: 0.3, kneeR: 0.3, dy: 2},
  'bp.kWind':     {legR: 0.7, kneeR: 0.9, armR: -0.4, armL: 0.9, rot: -0.08},
  'bp.kick':      {legR: -1.3, kneeR: 0.05, footR: -0.3, armR: 0.7, armL: 1.2, rot: -0.12},
  'bp.kFollow':   {legR: -1.6, kneeR: -0.1, footR: -0.2, armR: 0.4, armL: 1.5, rot: -0.18, dy: -4},
  'bp.tWind':     {armR: 3.5, elbowR: 1.4, armL: 1.2, elbowL: 0.3, rot: -0.15, kneeL: 0.2, kneeR: 0.2, sy: 1.02},
  'bp.toss':      {armR: 2.2, elbowR: -0.1, armL: 0.6, bend: 0.15, rot: 0.1, dy: -2, sy: 1.03},
  'bp.tFollow':   {armR: 1.0, elbowR: 0.2, armL: 0.3, bend: 0.3, rot: 0.12},
  'bp.batWind':   {armR: -0.9, elbowR: 0.5, armL: 1.0, elbowL: 0.4, holdRot: 0.9, rot: -0.12, legL: 0.25, kneeL: 0.25, kneeR: 0.2},
  'bp.batHit':    {armR: 1.6, elbowR: -0.1, armL: 0.4, holdRot: -0.7, bend: 0.12, rot: 0.08, legL: 0.3, kneeL: 0.15, legR: -0.15},
  'bp.batFollow': {armR: 2.8, elbowR: 0.6, armL: 0.2, holdRot: -1.6, rot: 0.14, legL: 0.25, legR: -0.2},
  'bp.grip':      {armR: 0.8, elbowR: 0.3, armL: 0.7, elbowL: 0.3, bend: 0.15, kneeL: 1.0, kneeR: 1.0, dy: 10, sy: 0.88},
  'bp.lift':      {armR: 2.9, elbowR: 0.1, armL: 2.9, elbowL: 0.1, dy: -3, sy: 1.05},
  'bp.carry':     {armR: 2.95, armL: 2.95, kneeL: 0.15, kneeR: 0.15, dy: 1},
  'bp.reach':     {armR: 1.45, elbowR: 0.1, armL: 0.5, bend: 0.25},
  'bp.grab':      {armR: 1.25, elbowR: 0.9, armL: 0.6, bend: 0.3, kneeL: 0.2, kneeR: 0.2, dy: 2},
  'bp.hold':      {armR: 3.0, elbowR: 0.3, armL: 0.6, dy: -6, sy: 1.05},
  'bp.coil':      {armR: -0.6, armL: 0.9, bend: 0.3, kneeL: 0.6, kneeR: 0.6, dy: 4},
  'bp.lunge':     {armR: 1.5, armL: 1.2, bend: 0.45, legR: -0.6, kneeR: 0.3, legL: 0.5, kneeL: 0.4},
  'bp.skid':      {armR: 0.8, armL: 1.6, rot: -0.15, legR: -0.4, kneeR: 0.2, legL: 0.2},
  'bp.duck':      {armR: 2.6, elbowR: 1.8, armL: 2.6, elbowL: 1.8, kneeL: 0.5, kneeR: 0.5, bend: 0.15, dy: 5, sy: 0.93},
  'bp.cover':     {armR: 2.9, elbowR: 2.2, armL: 2.9, elbowL: 2.2, kneeL: 0.8, kneeR: 0.8, bend: 0.3, dy: 8, sy: 0.88},
  'bp.peek':      {armR: 1.6, elbowR: 1.5, armL: 2.4, elbowL: 1.8, kneeL: 0.3, kneeR: 0.3, dy: 3},
  'bp.flinch':    {armR: 1.2, elbowR: 1.0, armL: 1.2, elbowL: 1.0, kneeL: 0.3, kneeR: 0.3, dy: 3, sy: 0.95},
  'bp.snap':      {rot: -0.35, armR: 2.4, elbowR: 0.3, armL: 2.6, elbowL: 0.3, dy: -2, sy: 1.06},
  'bp.dazed':     {rotFull: 6.283, rot: 0.2, armR: 0.5, armL: 0.5, kneeL: 0.4, kneeR: 0.4, dy: 4, sy: 0.94},
  'bp.slump':     {rotFull: 6.283, bend: 0.15, armR: 0.1, armL: 0.1, kneeL: 0.5, kneeR: 0.5, dy: 6, sy: 0.9},
  'bp.trapWind':  {armR: -0.5, elbowR: 0.6, armL: 0.8, rot: -0.1},
  'bp.trapThrow': {armR: 1.9, elbowR: -0.1, armL: 0.4, bend: 0.15},
  'bp.point':     {armR: 1.6, elbowR: 0, armL: 0.3},
  'bp.swirl':     {rotFull: -0.28, armR: 2.5, armL: 2.5, sy: 0.9},
  'bp.pop':       {armR: 2.9, elbowR: 0, armL: 2.9, elbowL: 0, dy: -6, sy: 1.08},
  'bp.yes':       {armR: 2.4, elbowR: 0.4, armL: 2.9, elbowL: 1.2, dy: -2},
  'bp.crouch':    {armR: 0.5, elbowR: 0.8, armL: 0.5, elbowL: 0.9, kneeL: 0.6, kneeR: 0.6, dy: 5, sy: 0.92},
  'bp.jumpUp':    {armR: 2.9, elbowR: 0.1, armL: 2.9, elbowL: 0.2, kneeL: 0.3, kneeR: 0.3, dy: -14, sy: 1.08},
  'bp.land':      {armR: 2.2, armL: 2.4, kneeL: 0.4, kneeR: 0.4, dy: 3, sy: 0.95},
  'bp.fistUp':    {armR: 2.6, elbowR: 0.5, armL: 0.4}
}, acts: {
  'soulbopper.plant': {tags: ['action', 'beat'], share: true, about: '💣 put a bomb down — squat, place it, a pat, stand', beats: [
    {pose: 'bp.ready', face: 'focused', ms: 20}, {pose: 'bp.squat', face: 'sneaky', ms: 140},
    {pose: 'bp.place', face: 'cheeky', ms: 70, contact: true}, {pose: 'bp.pat', face: 'smug', ms: 220, ease: 'backOut'}, {pose: 'bp.ready', face: 'focused', ms: 140}]},
  'soulbopper.kick': {tags: ['action', 'beat'], share: true, about: '👟 kick a bomb away — foot back, kick out, hop on the follow-through', beats: [
    {pose: 'bp.ready', face: 'focused', ms: 20}, {pose: 'bp.kWind', face: 'determined', ms: 150},
    {pose: 'bp.kick', face: 'effort', ms: 70, contact: true}, {pose: 'bp.kFollow', face: 'fierce', ms: 220, ease: 'backOut'}, {pose: 'bp.ready', face: 'focused', ms: 150}]},
  'soulbopper.toss': {tags: ['action', 'throw', 'beat'], share: true, about: '🤾 toss a bomb over the walls — arm back over the head, throw, follow down', beats: [
    {pose: 'bp.ready', face: 'focused', ms: 20}, {pose: 'bp.tWind', face: 'determined', ms: 180},
    {pose: 'bp.toss', face: 'effort', ms: 70, contact: true}, {pose: 'bp.tFollow', face: 'happy', ms: 240, ease: 'backOut'}, {pose: 'bp.ready', face: 'focused', ms: 150}]},
  'soulbopper.bat': {tags: ['action', 'sport', 'beat'], share: true, about: '🏏 bat a bomb 4 cells — bat back, swing THROUGH, follow round', beats: [
    {pose: 'bp.ready', face: 'focused', ms: 20}, {pose: 'bp.batWind', face: 'determined', ms: 200},
    {pose: 'bp.batHit', face: 'effort', ms: 60, contact: true, tricks: ['impact-flash']}, {pose: 'bp.batFollow', face: 'fierce', ms: 260, ease: 'backOut'}, {pose: 'bp.ready', face: 'proud', ms: 160}]},
  'soulbopper.lift': {tags: ['action', 'beat'], share: true, about: '🏋️ lift a bomb over the head — squat + grip while you hold, heave up, carry', beats: [
    {pose: 'bp.ready', face: 'focused', ms: 20}, {pose: 'bp.grip', face: 'effort', ms: 220},
    {pose: 'bp.lift', face: 'determined', ms: 80, contact: true}, {pose: 'bp.carry', face: 'determined', ms: 200, ease: 'backOut'}, {pose: 'bp.carry', face: 'focused', ms: 120}]},
  'soulbopper.grab': {tags: ['action', 'happy', 'beat'], share: true, about: '✨ grab a power-up — reach as you walk in, snatch, hold it up', beats: [
    {pose: 'bp.ready', face: 'excited', ms: 20}, {pose: 'bp.reach', face: 'excited', ms: 180},
    {pose: 'bp.grab', face: 'delighted', ms: 70, contact: true}, {pose: 'bp.hold', face: 'joy', ms: 280, ease: 'backOut', marks: ['sparkles']}, {pose: 'bp.ready', face: 'happy', ms: 160}]},
  'soulbopper.dash': {tags: ['action', 'move', 'beat'], share: true, about: '💨 dash 2 cells — coil, lunge, skid to a stop', beats: [
    {pose: 'bp.ready', face: 'determined', ms: 20}, {pose: 'bp.coil', face: 'determined', ms: 120},
    {pose: 'bp.lunge', face: 'effort', ms: 70, contact: true}, {pose: 'bp.skid', face: 'cool', ms: 220, ease: 'backOut'}, {pose: 'bp.ready', face: 'focused', ms: 140}]},
  'soulbopper.brace': {tags: ['miss', 'close', 'beat'], share: true, about: '😱 a pop next to you — duck, cover your head on the bang, peek up', beats: [
    {pose: 'bp.ready', face: 'worried', ms: 20}, {pose: 'bp.duck', face: 'scared', ms: 200},
    {pose: 'bp.cover', face: 'panic', ms: 80, contact: true, marks: ['shiver']}, {pose: 'bp.peek', face: 'relieved', ms: 300, ease: 'backOut', marks: ['sweat']}, {pose: 'bp.ready', face: 'relieved', ms: 180}]},
  'soulbopper.caught': {tags: ['miss', 'hit', 'beat'], share: true, about: '💫 caught in a pop — snap back, spin, slump dizzy (the game freezes 90 ms on the hit)', beats: [
    {pose: 'bp.ready', face: 'shock', ms: 20}, {pose: 'bp.flinch', face: 'scared', ms: 80},
    {pose: 'bp.snap', face: 'shock', ms: 80, contact: true}, {pose: 'bp.dazed', face: 'dizzy', ms: 400, ease: 'cubicOut', marks: ['dizzy-stars']}, {pose: 'bp.slump', face: 'dizzy', ms: 320, marks: ['dizzy-stars']}]},
  'soulbopper.trap': {tags: ['action', 'throw', 'beat'], share: true, about: '🪤 a ghost throws its trap — wind back, fling, point', beats: [
    {pose: 'bp.ready', face: 'sneaky', ms: 20}, {pose: 'bp.trapWind', face: 'sneaky', ms: 150},
    {pose: 'bp.trapThrow', face: 'cheeky', ms: 70, contact: true}, {pose: 'bp.point', face: 'smug', ms: 260, ease: 'backOut'}, {pose: 'bp.ready', face: 'cheeky', ms: 140}]},
  'soulbopper.swap': {tags: ['win', 'happy', 'beat'], share: true, about: '👻 soul swap — swirl in, pop out arms up, fist', beats: [
    {pose: 'bp.ready', face: 'excited', ms: 20}, {pose: 'bp.swirl', face: 'amazed', ms: 180},
    {pose: 'bp.pop', face: 'joy', ms: 80, contact: true, marks: ['sparkles']}, {pose: 'bp.yes', face: 'proud', ms: 300, ease: 'backOut'}, {pose: 'bp.ready', face: 'happy', ms: 160}]},
  'soulbopper.cheer': {tags: ['win', 'happy', 'beat'], share: true, about: '🎉 back in / a big moment — crouch, fist up, settle', beats: [
    {pose: 'bp.ready', face: 'happy', ms: 20}, {pose: 'bp.crouch', face: 'excited', ms: 140},
    {pose: 'bp.yes', face: 'joy', ms: 80, contact: true, marks: ['sparkles']}, {pose: 'bp.fistUp', face: 'proud', ms: 280, ease: 'backOut'}, {pose: 'bp.ready', face: 'happy', ms: 180}]},
  'soulbopper.win': {tags: ['win', 'happy', 'sig', 'beat'], share: true, about: '🏆 round won — crouch, jump arms up, land, fist (then the dance)', beats: [
    {pose: 'bp.ready', face: 'happy', ms: 20}, {pose: 'bp.crouch', face: 'excited', ms: 180},
    {pose: 'bp.jumpUp', face: 'joy', ms: 90, contact: true, marks: ['sparkles']}, {pose: 'bp.land', face: 'delighted', ms: 260, ease: 'bounceOut'}, {pose: 'bp.fistUp', face: 'proud', ms: 260}]}
}, pools: {'soulbopper': ['soulbopper.plant', 'soulbopper.kick', 'soulbopper.toss', 'soulbopper.bat', 'soulbopper.lift', 'soulbopper.grab', 'soulbopper.dash',
  'soulbopper.brace', 'soulbopper.caught', 'soulbopper.trap', 'soulbopper.swap', 'soulbopper.cheer', 'soulbopper.win']}},
{by: '🧱 baseline chat', block: 'soulbopper', game: 'soulbopper', date: '2026-11-18'});
// 🎭 BLOCK soulbopper END

// 🎭 BLOCK snakize (🧱 baseline chat · 🐍 snakize) START
// 🐍 Snakize riders — every rider action on the 🎬 beat timeline (🧱 b3b8, 2026-11-18). ready → anticipation → contact → follow-through → settle.
// The rider sits on the snake's head: the LEGS stay in the ride pose (legL 0.75 · legR −0.75 in every pose), arms · lean · head · a little bounce act.
// The ENGINE owns contact (its event = the contact tick). On the grid modes (🍎 Snakeast · 🏰 Snakastle) the page sees the next step coming
// (the queued turn, the food / wall / flag / trail in the next cell) and winds up before it; taps (🎯 skill) play FROM contact.
// ⭐ Aowu's picks (b3b7p): 🍎 a small nod for every food, the full reach-grab-hold only for ✨ gold / ⚡ power / big food / 🐍 +10 · no hit-stop.
// Side view facing right: armR + = forward (π = straight up), armL + = back, rot + = lean forward, bend + = lean in from the hips, dy + = lower.
Acting.add({poses: {
  'sn.ride':      {legL: 0.75, legR: -0.75, armL: 0.95, armR: 1.05},
  'sn.leanBack':  {legL: 0.75, legR: -0.75, armL: 1.15, armR: 1.3, elbowR: 0.3, rot: -0.12},
  'sn.leanIn':    {legL: 0.75, legR: -0.75, armL: 0.6, armR: 1.85, elbowR: 0.05, rot: 0.24, bend: 0.12},
  'sn.leanOut':   {legL: 0.75, legR: -0.75, armL: 0.85, armR: 1.35, rot: 0.06},
  'sn.open':      {legL: 0.75, legR: -0.75, armL: 1.0, armR: 1.25, elbowR: 0.4, rot: -0.1, dy: -1},
  'sn.chomp':     {legL: 0.75, legR: -0.75, armL: 0.9, armR: 1.1, rot: 0.08, bend: 0.2, dy: 1, sy: 0.97},
  'sn.pat':       {legL: 0.75, legR: -0.75, armL: 0.9, armR: 0.55, elbowR: 1.5, rot: 0.02},
  'sn.reach':     {legL: 0.75, legR: -0.75, armL: 0.6, armR: 1.55, elbowR: 0.05, rot: 0.12, bend: 0.28},
  'sn.grab':      {legL: 0.75, legR: -0.75, armL: 0.7, armR: 1.3, elbowR: 0.9, rot: 0.08, bend: 0.3, dy: 1},
  'sn.holdUp':    {legL: 0.75, legR: -0.75, armL: 0.9, armR: 3.0, elbowR: 0.2, rot: -0.04, dy: -3, sy: 1.04},
  'sn.yuck':      {legL: 0.75, legR: -0.75, armL: 0.9, armR: 2.5, elbowR: 2.1, rot: -0.16, bend: -0.05},
  'sn.shake':     {legL: 0.75, legR: -0.75, armL: 1.1, armR: 1.2, elbowR: 0.4, rot: 0.08},
  'sn.brace':     {legL: 0.75, legR: -0.75, armL: 2.4, elbowL: 1.0, armR: 2.6, elbowR: 1.0, rot: -0.22},
  'sn.bonk':      {legL: 0.75, legR: -0.75, armL: 2.8, elbowL: 0.4, armR: 2.9, elbowR: 0.4, rot: -0.32, dy: 2, sy: 0.9},
  'sn.flail':     {legL: 0.75, legR: -0.75, armL: 0.4, elbowL: 0.5, armR: 2.3, elbowR: 0.6, rot: 0.16},
  'sn.dizzy':     {legL: 0.75, legR: -0.75, armL: 1.2, armR: 1.2, rot: 0.08, bend: 0.15},
  'sn.flinch':    {legL: 0.75, legR: -0.75, armL: 1.4, elbowL: 1.0, armR: 1.4, elbowR: 1.0, sy: 0.95},
  'sn.fly':       {legL: 0.4, legR: -0.4, armL: 2.9, armR: 2.9, dy: -2, sy: 1.06},
  'sn.tumble':    {legL: 0.9, legR: -0.9, armL: 0.6, armR: 2.2, rotFull: 6.283},
  'sn.sit':       {legL: 1.4, legR: -1.4, kneeL: 0.2, kneeR: 0.2, armL: 0.6, armR: 0.6, bend: 0.1, dy: 6, rotFull: 6.283},
  'sn.castWind':  {legL: 0.75, legR: -0.75, armL: 1.6, armR: -0.4, elbowR: 0.6, rot: -0.1},
  'sn.cast':      {legL: 0.75, legR: -0.75, armL: 0.8, armR: 2.2, elbowR: -0.1, rot: 0.12, bend: 0.1},
  'sn.castFollow':{legL: 0.75, legR: -0.75, armL: 0.9, armR: 1.6, rot: 0.06},
  'sn.flagUp':    {legL: 0.75, legR: -0.75, armL: 1.0, armR: 3.0, elbowR: 0.2, rot: -0.08, dy: -2},
  'sn.plant':     {legL: 0.75, legR: -0.75, armL: 0.8, armR: 1.2, rot: 0.15, bend: 0.3},
  'sn.wave':      {legL: 0.75, legR: -0.75, armL: 0.9, armR: 2.8, elbowR: 0.8},
  'sn.slashWind': {legL: 0.75, legR: -0.75, armL: 1.2, armR: -0.6, elbowR: 0.5, rot: -0.12},
  'sn.slash':     {legL: 0.75, legR: -0.75, armL: 0.6, armR: 2.0, elbowR: -0.1, rot: 0.18, bend: 0.2},
  'sn.slashFollow':{legL: 0.75, legR: -0.75, armL: 0.7, armR: 2.7, rot: 0.1},
  'sn.look':      {legL: 0.75, legR: -0.75, armL: 1.1, armR: 1.2, rot: -0.1},
  'sn.headHold':  {legL: 0.75, legR: -0.75, armL: 2.9, elbowL: 2.2, armR: 2.9, elbowR: 2.2, rot: -0.12},
  'sn.droop':     {legL: 0.75, legR: -0.75, armL: 0.5, armR: 0.5, bend: 0.2}
}, acts: {
  'snakize.turn': {tags: ['action', 'move', 'beat'], share: true, ride: 'keep', about: '↪️ steer a snake round a corner — a small lean the other way, lean INTO the turn, settle', beats: [
    {pose: 'sn.ride', face: 'focused', ms: 20}, {pose: 'sn.leanBack', face: 'focused', ms: 120},
    {pose: 'sn.leanIn', face: 'determined', ms: 70, contact: true}, {pose: 'sn.leanOut', face: 'happy', ms: 180, ease: 'backOut'}, {pose: 'sn.ride', face: 'happy', ms: 120}]},
  'snakize.nod': {tags: ['action', 'happy', 'beat'], share: true, ride: 'keep', about: '🍎 the snake eats — open wide, a chomp nod, pat the tummy', beats: [
    {pose: 'sn.ride', face: 'happy', ms: 20}, {pose: 'sn.open', face: 'excited', ms: 110},
    {pose: 'sn.chomp', face: 'delighted', ms: 60, contact: true}, {pose: 'sn.pat', face: 'content', ms: 180, ease: 'backOut'}, {pose: 'sn.ride', face: 'happy', ms: 120}]},
  'snakize.grab': {tags: ['action', 'happy', 'beat'], share: true, ride: 'keep', about: '✨ golden food / ⚡ a power / 🐍 +10 — reach out, grab it, hold it up high', beats: [
    {pose: 'sn.ride', face: 'excited', ms: 20}, {pose: 'sn.reach', face: 'excited', ms: 180},
    {pose: 'sn.grab', face: 'delighted', ms: 70, contact: true}, {pose: 'sn.holdUp', face: 'joy', ms: 300, ease: 'backOut', marks: ['sparkles']}, {pose: 'sn.ride', face: 'proud', ms: 160}]},
  'snakize.yuck': {tags: ['miss', 'funny', 'beat'], share: true, ride: 'keep', about: '🤢 bad food — open, bleh (hand to mouth), shake it off', beats: [
    {pose: 'sn.ride', face: 'happy', ms: 20}, {pose: 'sn.open', face: 'excited', ms: 110},
    {pose: 'sn.yuck', face: 'yuck', ms: 70, contact: true}, {pose: 'sn.shake', face: 'sick', ms: 240, ease: 'backOut'}, {pose: 'sn.ride', face: 'sulky', ms: 140}]},
  'snakize.bump': {tags: ['miss', 'hit', 'beat'], share: true, ride: 'keep', about: '🧱 a wall / a snake ahead — brace (lean back, arms up), bonk, dizzy', beats: [
    {pose: 'sn.ride', face: 'worried', ms: 20}, {pose: 'sn.brace', face: 'scared', ms: 160},
    {pose: 'sn.bonk', face: 'shock', ms: 80, contact: true, tricks: ['impact-flash']}, {pose: 'sn.flail', face: 'dizzy', ms: 420, ease: 'backOut', marks: ['dizzy-stars']}, {pose: 'sn.dizzy', face: 'dizzy', ms: 320, marks: ['dizzy-stars']}]},
  'snakize.popped': {tags: ['miss', 'hit', 'beat'], share: true, ride: 'keep', about: '💥 popped in 🧭 Snakigate — fly up off the snake, tumble, land sitting', beats: [
    {pose: 'sn.ride', face: 'shock', ms: 20}, {pose: 'sn.flinch', face: 'scared', ms: 60},
    {pose: 'sn.fly', face: 'shock', ms: 80, contact: true, tricks: ['impact-flash']}, {pose: 'sn.tumble', face: 'dizzy', ms: 520, ease: 'cubicOut', marks: ['dizzy-stars']}, {pose: 'sn.sit', face: 'dizzy', ms: 420, ease: 'bounceOut', marks: ['dizzy-stars']}]},
  'snakize.cast': {tags: ['action', 'beat'], share: true, ride: 'keep', about: '🎯 use a skill — arm back, cast it forward, follow', beats: [
    {pose: 'sn.ride', face: 'focused', ms: 20}, {pose: 'sn.castWind', face: 'determined', ms: 150},
    {pose: 'sn.cast', face: 'excited', ms: 70, contact: true, marks: ['sparkles']}, {pose: 'sn.castFollow', face: 'proud', ms: 240, ease: 'backOut'}, {pose: 'sn.ride', face: 'happy', ms: 140}]},
  'snakize.claim': {tags: ['action', 'win', 'beat'], share: true, ride: 'keep', about: '🚩 close a loop in 🏰 Snakastle — lift the flag, plant it, wave', beats: [
    {pose: 'sn.ride', face: 'excited', ms: 20}, {pose: 'sn.flagUp', face: 'excited', ms: 200},
    {pose: 'sn.plant', face: 'determined', ms: 70, contact: true}, {pose: 'sn.wave', face: 'joy', ms: 360, ease: 'backOut', marks: ['sparkles']}, {pose: 'sn.ride', face: 'proud', ms: 160}]},
  'snakize.slash': {tags: ['action', 'win', 'beat'], share: true, ride: 'keep', about: '✂️ cut a rival’s trail — arm back, slash, follow round', beats: [
    {pose: 'sn.ride', face: 'sneaky', ms: 20}, {pose: 'sn.slashWind', face: 'sneaky', ms: 160},
    {pose: 'sn.slash', face: 'determined', ms: 60, contact: true, tricks: ['smear']}, {pose: 'sn.slashFollow', face: 'cheeky', ms: 240, ease: 'backOut'}, {pose: 'sn.ride', face: 'smug', ms: 140}]},
  'snakize.oops': {tags: ['miss', 'beat'], share: true, ride: 'keep', about: '🙈 your trail got cut — look back, hands on the head, droop', beats: [
    {pose: 'sn.ride', face: 'worried', ms: 20}, {pose: 'sn.look', face: 'worried', ms: 120},
    {pose: 'sn.headHold', face: 'embarrassed', ms: 80, contact: true}, {pose: 'sn.droop', face: 'sad', ms: 320, ease: 'backOut'}, {pose: 'sn.ride', face: 'embarrassed', ms: 180}]}
}, pools: {'snakize': ['snakize.turn', 'snakize.nod', 'snakize.grab', 'snakize.yuck', 'snakize.bump', 'snakize.popped', 'snakize.cast', 'snakize.claim', 'snakize.slash', 'snakize.oops']}},
{by: '🧱 baseline chat', block: 'snakize', game: 'snakize', date: '2026-11-18'});
// 🎭 BLOCK snakize END

// 🎭 BLOCK brawl (🧱 baseline chat · 🥊 brawlbuddies) START
// 🥊 Brawl Buddies + 🗺️ Brawenture — every fight action on the 🎬 beat timeline (🧱 b3b9, 2026-11-18). ready → anticipation → contact → follow-through → settle.
// ⭐ Aowu's picks (b3b7p): Brawl's OWN punch shapes (the page's KF wind-up / strike, generated by rounds/b3b9/gen_b3b9_block.py), re-timed + a settle +
// a trailing back arm (overlap armL 60 ms) · hit-stop 35 / 70 ms stays the game's own (it freezes the engine clock = the contact pose holds).
// The ENGINE owns contact: a strike's contact = its active start (MOVES st), the strike pose is held through the active frames, follow + settle
// = the recovery (the page maps the act onto st / ac / rc). Hits / blocks / get-ups play FROM contact (the event tick). 🦘 jump: contact = the landing.
// Side view facing right, AvatarKit space: armR + = forward (π = up), armL − = forward guard, legL − = back foot back, rot + = lean in.
// `ext` (on a beat) = how far the glove reaches out — Brawl's own field, not a pose field; the page eases it.
Acting.add({poses: {
  "bb.stance": {"armR": 1.15, "armL": -1.05, "legL": -0.2, "legR": -0.16, "rot": 0},
  "bb.boop.w": {"armR": 0.65, "armL": -1.05, "legL": -0.25, "legR": -0.12, "rot": -0.07},
  "bb.boop.s": {"armR": 1.62, "armL": -1.05, "legL": -0.38, "legR": -0.32, "rot": 0.1, "sx": 1.04},
  "bb.boop.f": {"armR": 1.766, "armL": -1.05, "legL": -0.38, "legR": -0.32, "rot": 0.15, "sx": 1.02},
  "bb.lowboop.w": {"armR": 0.85, "armL": -1.2, "legL": -0.9, "legR": -0.9, "rot": 0, "sy": 0.74},
  "bb.lowboop.s": {"armR": 1.58, "armL": -1.2, "legL": -0.95, "legR": -0.95, "rot": 0.12, "sy": 0.72},
  "bb.lowboop.f": {"armR": 1.69, "armL": -1.2, "legL": -0.95, "legR": -0.95, "rot": 0.17, "sy": 0.72},
  "bb.bonk.w": {"armR": 3.05, "armL": -1.6, "legL": -0.1, "legR": -0.38, "rot": -0.22, "sy": 1.04},
  "bb.bonk.s": {"armR": 0.85, "armL": -1.85, "legL": -0.48, "legR": -0.3, "rot": 0.26, "sy": 0.95},
  "bb.bonk.f": {"armR": 0.52, "armL": -1.888, "legL": -0.48, "legR": -0.3, "rot": 0.31, "sy": 0.95},
  "bb.power.w": {"armR": 0.45, "armL": -0.45, "legL": -0.15, "legR": -0.3, "rot": -0.16, "sy": 0.92},
  "bb.power.s": {"armR": 1.7, "armL": -1.7, "legL": -0.45, "legR": -0.4, "rot": 0.2, "sx": 1.06},
  "bb.power.f": {"armR": 1.887, "armL": -1.887, "legL": -0.45, "legR": -0.4, "rot": 0.25, "sx": 1.03},
  "bb.jboop.w": {"armR": 0.8, "armL": -1.05, "legL": -0.75, "legR": -0.2, "rot": 0},
  "bb.jboop.s": {"armR": 1.65, "armL": -1.05, "legL": -0.85, "legR": -0.45, "rot": 0.16},
  "bb.jboop.f": {"armR": 1.777, "armL": -1.05, "legL": -0.85, "legR": -0.45, "rot": 0.21},
  "bb.jbonk.w": {"armR": 3.1, "armL": -2.1, "legL": -0.6, "legR": -0.6, "rot": 0, "rotFull": -0.3},
  "bb.jbonk.s": {"armR": 1.0, "armL": -1.05, "legL": -0.85, "legR": -0.2, "rot": 0, "rotFull": 0.65},
  "bb.jbonk.f": {"armR": 0.685, "armL": -1.05, "legL": -0.85, "legR": -0.2, "rot": 0.05, "rotFull": 0.764},
  "bb.jpower.w": {"armR": 2.6, "armL": -2.6, "legL": -0.5, "legR": -0.5, "rot": 0, "rotFull": -0.25},
  "bb.jpower.s": {"armR": 1.65, "armL": -1.65, "legL": 0.3, "legR": -0.55, "rot": 0, "rotFull": 0.95},
  "bb.jpower.f": {"armR": 1.507, "armL": -1.507, "legL": 0.3, "legR": -0.55, "rot": 0.05, "rotFull": 1.094},
  "bb.lowbonk.w": {"armR": 1.35, "armL": -1.2, "legL": -0.95, "legR": 0.45, "rot": 0, "sy": 0.74},
  "bb.lowbonk.s": {"armR": 0.8, "armL": -1.5, "legL": -0.95, "legR": -1.6, "rot": 0.16, "sy": 0.7},
  "bb.lowbonk.f": {"armR": 0.718, "armL": -1.545, "legL": -0.95, "legR": -1.6, "rot": 0.21, "sy": 0.7},
  "bb.upper.w": {"armR": 0.35, "armL": -1.2, "legL": -0.95, "legR": -0.95, "rot": 0.12, "sy": 0.66},
  "bb.upper.s": {"armR": 3.05, "armL": -1.05, "legL": -0.15, "legR": -0.55, "rot": -0.14, "dy": -9, "sy": 1.1},
  "bb.upper.f": {"armR": 3.455, "armL": -1.05, "legL": -0.15, "legR": -0.55, "rot": -0.19, "dy": -9, "sy": 1.1},
  "bb.dboop.w": {"armR": 0.6, "armL": -1.05, "legL": -0.6, "legR": -0.5, "rot": 0.32},
  "bb.dboop.s": {"armR": 1.7, "armL": -1.05, "legL": -0.65, "legR": -0.65, "rot": 0.32, "sx": 1.06},
  "bb.dboop.f": {"armR": 1.865, "armL": -1.05, "legL": -0.65, "legR": -0.65, "rot": 0.37, "sx": 1.03},
  "bb.dbonk.w": {"armR": 3.05, "armL": -1.4, "legL": -0.6, "legR": -0.5, "rot": 0.12},
  "bb.dbonk.s": {"armR": 0.85, "armL": -1.05, "legL": -0.7, "legR": -0.6, "rot": 0.42, "sy": 0.94},
  "bb.dbonk.f": {"armR": 0.52, "armL": -1.05, "legL": -0.7, "legR": -0.6, "rot": 0.47, "sy": 0.94},
  "bb.grab.w": {"armR": 1.45, "armL": -1.45, "legL": -0.3, "legR": -0.3, "rot": 0.14},
  "bb.grab.s": {"armR": 1.85, "armL": -1.85, "legL": -0.45, "legR": -0.4, "rot": 0.24},
  "bb.grab.f": {"armR": 1.91, "armL": -1.91, "legL": -0.45, "legR": -0.4, "rot": 0.29},
  "bb.gbreak.w": {"armR": 3.35, "armL": -2.7, "legL": -0.2, "legR": -0.16, "rot": -0.32, "sy": 1.06},
  "bb.gbreak.s": {"armR": 0.7, "armL": -1.2, "legL": -0.55, "legR": -0.45, "rot": 0.48, "sy": 0.88},
  "bb.gbreak.f": {"armR": 0.302, "armL": -0.975, "legL": -0.55, "legR": -0.45, "rot": 0.53, "sy": 0.88},
  "bb.cboop.w": {"armR": 0.5, "armL": -1.05, "legL": -0.65, "legR": -0.55, "rot": 0.36},
  "bb.cboop.s": {"armR": 1.75, "armL": -1.05, "legL": -0.7, "legR": -0.7, "rot": 0.38, "sx": 1.08},
  "bb.cboop.f": {"armR": 1.938, "armL": -1.05, "legL": -0.7, "legR": -0.7, "rot": 0.43, "sx": 1.04},
  "bb.cbonk.w": {"armR": 3.1, "armL": -1.5, "legL": -0.65, "legR": -0.55, "rot": 0.16},
  "bb.cbonk.s": {"armR": 0.8, "armL": -1.05, "legL": -0.75, "legR": -0.65, "rot": 0.48, "sy": 0.92},
  "bb.cbonk.f": {"armR": 0.455, "armL": -1.05, "legL": -0.75, "legR": -0.65, "rot": 0.53, "sy": 0.92},
  "bb.takeoff": {"armR": 2.2, "armL": -2.0, "legL": -0.75, "legR": -0.15, "rot": 0, "sx": 0.94, "sy": 1.08},
  "bb.tuck": {"armR": 1.6, "armL": -1.5, "legL": -0.45, "legR": -0.5, "rot": 0.06},
  "bb.land": {"armR": 1.3, "armL": -1.2, "legL": -0.45, "legR": -0.45, "rot": 0, "dy": 3, "sx": 1.12, "sy": 0.84},
  "bb.rebound": {"armR": 1.1, "armL": -1.0, "legL": -0.25, "legR": -0.2, "rot": 0, "sx": 0.98, "sy": 1.04},
  "bb.flinch": {"armR": 1.4, "armL": -1.3, "legL": -0.2, "legR": -0.16, "rot": 0.05, "sy": 0.97},
  "bb.snap": {"armR": 0.65, "armL": -1.05, "legL": -0.2, "legR": -0.16, "rot": -0.42},
  "bb.recoil": {"armR": 1.25, "armL": -1.15, "legL": -0.2, "legR": -0.16, "rot": 0.1},
  "bb.snapLow": {"armR": 1.15, "armL": -1.05, "legL": -0.2, "legR": -0.16, "rot": 0.38, "sy": 0.9},
  "bb.recoilLow": {"armR": 1.15, "armL": -1.05, "legL": -0.2, "legR": -0.16, "rot": -0.08, "sy": 1.03},
  "bb.knock": {"armR": 2.35, "armL": -2.25, "legL": -0.2, "legR": -0.16, "rot": -0.62},
  "bb.knockBack": {"armR": 1.0, "armL": -0.9, "legL": -0.2, "legR": -0.16, "rot": 0.14},
  "bb.brace": {"armR": 1.15, "armL": -1.05, "legL": -0.2, "legR": -0.16, "rot": 0.04, "sx": 1.03},
  "bb.blockHit": {"armR": 1.15, "armL": -1.05, "legL": -0.2, "legR": -0.16, "rot": -0.16, "sx": 0.95},
  "bb.push": {"armR": 1.15, "armL": -1.05, "legL": -0.2, "legR": -0.16, "rot": 0.06, "sx": 1.02},
  "bb.dTuck": {"armR": 2.2, "armL": -2.2, "legL": -1.1, "legR": -1.1, "rot": 0, "rotFull": 0.5, "sy": 0.8},
  "bb.dSpin": {"armR": 2.2, "armL": -2.2, "legL": -1.1, "legR": -1.1, "rot": 0, "rotFull": 4.4, "sy": 0.8},
  "bb.dOut": {"armR": 1.3, "armL": -1.2, "legL": -0.4, "legR": -0.3, "rot": 0, "rotFull": 6.38, "sy": 0.95},
  "bb.dSettle": {"armR": 1.15, "armL": -1.05, "legL": -0.2, "legR": -0.16, "rot": 0, "rotFull": 6.283},
  "bb.downPush": {"armR": 0.8, "armL": -0.6, "legL": -0.2, "legR": -0.16, "rot": -0.5, "sy": 0.7},
  "bb.upStretch": {"armR": 1.3, "armL": -1.2, "legL": -0.2, "legR": -0.16, "rot": 0.08, "sy": 1.06},
  "bb.lift": {"armR": 0.2, "armL": 0.3, "legL": -0.55, "legR": -0.5, "rot": 0.3, "sy": 0.82},
  "bb.overhead": {"armR": 3.1, "armL": -2.9, "legL": -0.2, "legR": -0.16, "rot": -0.18, "sy": 1.03},
  "bb.throw": {"armR": 1.5, "armL": -1.3, "legL": -0.4, "legR": -0.35, "rot": 0.22},
  "bb.throwOn": {"armR": 0.9, "armL": -0.8, "legL": -0.45, "legR": -0.4, "rot": 0.3}
}, acts: {
  "brawl.boop": {"tags": ["action", "fight", "beat"], "share": true, "about": "👊 Boop — a quick jab (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.boop.w", "face": "determined", "ms": 110}, {"pose": "bb.boop.s", "face": "brave", "ms": 90, "tr": 30, "contact": true, "ext": 1}, {"pose": "bb.boop.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.8}, {"pose": "bb.stance", "face": "focused", "ms": 110}]},
  "brawl.lowboop": {"tags": ["action", "fight", "beat"], "share": true, "about": "👊 Low boop — a jab from a duck (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.lowboop.w", "face": "determined", "ms": 110}, {"pose": "bb.lowboop.s", "face": "brave", "ms": 90, "tr": 30, "contact": true, "ext": 1}, {"pose": "bb.lowboop.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.8}, {"pose": "bb.stance", "face": "focused", "ms": 110}]},
  "brawl.bonk": {"tags": ["action", "fight", "beat", "big"], "share": true, "about": "💥 Big Bonk — arm up high, swing DOWN (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.bonk.w", "face": "determined", "ms": 110}, {"pose": "bb.bonk.s", "face": "brave", "ms": 90, "tr": 30, "contact": true, "tricks": ["smear"], "ext": 0.65}, {"pose": "bb.bonk.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.52}, {"pose": "bb.stance", "face": "determined", "ms": 110}]},
  "brawl.power": {"tags": ["action", "fight", "beat", "big"], "share": true, "about": "🌀 Power Push — both arms back, BIG two-hand push (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.power.w", "face": "determined", "ms": 110}, {"pose": "bb.power.s", "face": "brave", "ms": 90, "tr": 30, "contact": true, "tricks": ["smear"], "ext": 1.1}, {"pose": "bb.power.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.88}, {"pose": "bb.stance", "face": "determined", "ms": 110}]},
  "brawl.jboop": {"tags": ["action", "fight", "beat"], "share": true, "about": "👊 Jump boop — a jab in the air (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.jboop.w", "face": "determined", "ms": 110}, {"pose": "bb.jboop.s", "face": "brave", "ms": 90, "tr": 30, "contact": true, "ext": 1}, {"pose": "bb.jboop.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.8}, {"pose": "bb.stance", "face": "focused", "ms": 110}]},
  "brawl.jbonk": {"tags": ["action", "fight", "beat", "big"], "share": true, "about": "💥 Jump Big Bonk — arm back in the air, spike down (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.jbonk.w", "face": "determined", "ms": 110}, {"pose": "bb.jbonk.s", "face": "brave", "ms": 90, "tr": 30, "contact": true, "tricks": ["smear"], "ext": 0.6}, {"pose": "bb.jbonk.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.48}, {"pose": "bb.stance", "face": "determined", "ms": 110}]},
  "brawl.jpower": {"tags": ["action", "fight", "beat", "big"], "share": true, "about": "🌠 Diving Push — curl up in the air, dive with both arms (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.jpower.w", "face": "determined", "ms": 110}, {"pose": "bb.jpower.s", "face": "brave", "ms": 90, "tr": 30, "contact": true, "tricks": ["smear"], "ext": 1.1}, {"pose": "bb.jpower.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.88}, {"pose": "bb.stance", "face": "determined", "ms": 110}]},
  "brawl.lowbonk": {"tags": ["action", "fight", "beat"], "share": true, "about": "🦶 Low bonk — sweep kick from a duck (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.lowbonk.w", "face": "determined", "ms": 110}, {"pose": "bb.lowbonk.s", "face": "brave", "ms": 90, "tr": 30, "contact": true}, {"pose": "bb.lowbonk.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}}, {"pose": "bb.stance", "face": "focused", "ms": 110}]},
  "brawl.upper": {"tags": ["action", "fight", "beat", "big"], "share": true, "about": "🚀 Uppercut — crouch low, punch UP (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.upper.w", "face": "determined", "ms": 110}, {"pose": "bb.upper.s", "face": "brave", "ms": 90, "tr": 30, "contact": true, "tricks": ["smear"], "ext": 0.85}, {"pose": "bb.upper.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.68}, {"pose": "bb.stance", "face": "determined", "ms": 110}]},
  "brawl.dboop": {"tags": ["action", "fight", "beat"], "share": true, "about": "💨 Dash boop — a running jab (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.dboop.w", "face": "determined", "ms": 110}, {"pose": "bb.dboop.s", "face": "brave", "ms": 90, "tr": 30, "contact": true, "ext": 1.15}, {"pose": "bb.dboop.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.92}, {"pose": "bb.stance", "face": "focused", "ms": 110}]},
  "brawl.dbonk": {"tags": ["action", "fight", "beat", "big"], "share": true, "about": "💨 Dash bonk — a running overhead bonk (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.dbonk.w", "face": "determined", "ms": 110}, {"pose": "bb.dbonk.s", "face": "brave", "ms": 90, "tr": 30, "contact": true, "tricks": ["smear"], "ext": 0.75}, {"pose": "bb.dbonk.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.6}, {"pose": "bb.stance", "face": "determined", "ms": 110}]},
  "brawl.grab": {"tags": ["action", "fight", "beat"], "share": true, "about": "🤼 Grapple — both arms out, grab (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.grab.w", "face": "determined", "ms": 110}, {"pose": "bb.grab.s", "face": "excited", "ms": 90, "tr": 30, "contact": true, "ext": 0.65}, {"pose": "bb.grab.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.52}, {"pose": "bb.stance", "face": "focused", "ms": 110}]},
  "brawl.gbreak": {"tags": ["action", "fight", "beat", "big"], "share": true, "about": "🔨 Guard breaker — the charged arm comes crashing down (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "determined", "ms": 20}, {"pose": "bb.gbreak.w", "face": "determined", "ms": 110}, {"pose": "bb.gbreak.s", "face": "brave", "ms": 90, "tr": 30, "contact": true, "tricks": ["smear"], "ext": 0.95}, {"pose": "bb.gbreak.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.76}, {"pose": "bb.stance", "face": "determined", "ms": 110}]},
  "brawl.cboop": {"tags": ["action", "fight", "beat"], "share": true, "about": "⚡ Counter boop — a snap counter jab (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.cboop.w", "face": "determined", "ms": 110}, {"pose": "bb.cboop.s", "face": "brave", "ms": 90, "tr": 30, "contact": true, "ext": 1.2}, {"pose": "bb.cboop.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.96}, {"pose": "bb.stance", "face": "focused", "ms": 110}]},
  "brawl.cbonk": {"tags": ["action", "fight", "beat", "big"], "share": true, "about": "⚡ Counter bonk — a snap counter bonk (ready → wind-up → strike held → follow-through, back arm trails → settle)", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.cbonk.w", "face": "determined", "ms": 110}, {"pose": "bb.cbonk.s", "face": "brave", "ms": 90, "tr": 30, "contact": true, "tricks": ["smear"], "ext": 0.85}, {"pose": "bb.cbonk.f", "face": "proud", "ms": 140, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.68}, {"pose": "bb.stance", "face": "determined", "ms": 110}]},
  "brawl.jump": {"tags": ["action", "move", "beat"], "share": true, "about": "🦘 jump — take-off stretch, tuck in the air, LAND (squash), bounce up, settle", "beats": [{"pose": "bb.takeoff", "face": "excited", "ms": 120}, {"pose": "bb.tuck", "face": "determined", "ms": 200}, {"pose": "bb.land", "face": "determined", "ms": 70, "tr": 30, "contact": true}, {"pose": "bb.rebound", "face": "brave", "ms": 110, "ease": "backOut"}, {"pose": "bb.stance", "face": "focused", "ms": 90}]},
  "brawl.hit": {"tags": ["hit", "fight", "beat"], "share": true, "about": "💥 get boop-ed — the head snaps back, recoil past the stance, settle", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.flinch", "face": "worried", "ms": 60}, {"pose": "bb.snap", "face": "hurt", "ms": 70, "tr": 15, "contact": true}, {"pose": "bb.recoil", "face": "hurt", "ms": 190, "ease": "backOut"}, {"pose": "bb.stance", "face": "determined", "ms": 140}]},
  "brawl.hitLow": {"tags": ["hit", "fight", "beat"], "share": true, "about": "💥 a low hit — bend over, bounce back up, settle", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.flinch", "face": "worried", "ms": 60}, {"pose": "bb.snapLow", "face": "hurt", "ms": 70, "tr": 15, "contact": true}, {"pose": "bb.recoilLow", "face": "hurt", "ms": 190, "ease": "backOut"}, {"pose": "bb.stance", "face": "determined", "ms": 140}]},
  "brawl.hitBig": {"tags": ["hit", "fight", "beat", "big"], "share": true, "about": "💥 a BIG hit — knocked back, arms fly, swing back past the stance, settle", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.flinch", "face": "scared", "ms": 60}, {"pose": "bb.knock", "face": "shock", "ms": 90, "tr": 15, "contact": true}, {"pose": "bb.knockBack", "face": "dizzy", "ms": 230, "ease": "backOut"}, {"pose": "bb.stance", "face": "determined", "ms": 160}]},
  "brawl.block": {"tags": ["action", "fight", "beat"], "share": true, "about": "🛡️ block — brace, the guard snaps on the hit, push it back, settle", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.brace", "face": "determined", "ms": 60}, {"pose": "bb.blockHit", "face": "determined", "ms": 50, "tr": 10, "contact": true}, {"pose": "bb.push", "face": "brave", "ms": 110, "ease": "backOut"}, {"pose": "bb.stance", "face": "focused", "ms": 90}]},
  "brawl.dodge": {"tags": ["action", "move", "beat"], "share": true, "about": "🌀 dodge roll — tuck, spin through, pop out, settle", "beats": [{"pose": "bb.stance", "face": "focused", "ms": 20}, {"pose": "bb.dTuck", "face": "determined", "ms": 40}, {"pose": "bb.dSpin", "face": "determined", "ms": 150, "tr": 150, "contact": true, "ease": "sineInOut"}, {"pose": "bb.dOut", "face": "brave", "ms": 110, "ease": "backOut"}, {"pose": "bb.dSettle", "face": "proud", "ms": 80}]},
  "brawl.getup": {"tags": ["action", "move", "beat"], "share": true, "about": "😵 get up — push off the floor, stand up tall, settle", "beats": [{"pose": "bb.stance", "face": "dizzy", "ms": 20}, {"pose": "bb.downPush", "face": "determined", "ms": 80}, {"pose": "bb.downPush", "face": "determined", "ms": 60, "tr": 10, "contact": true}, {"pose": "bb.upStretch", "face": "determined", "ms": 170, "ease": "backOut"}, {"pose": "bb.stance", "face": "brave", "ms": 130}]},
  "brawl.toss": {"tags": ["action", "throw", "beat"], "share": true, "about": "🎒 toss (Brawenture) — lift it up over the head, THROW, follow through, settle", "beats": [{"pose": "bb.lift", "face": "determined", "ms": 40}, {"pose": "bb.overhead", "face": "determined", "ms": 120}, {"pose": "bb.throw", "face": "brave", "ms": 70, "tr": 25, "contact": true, "ext": 0.8}, {"pose": "bb.throwOn", "face": "proud", "ms": 150, "ease": "backOut", "overlap": {"armL": 60}, "ext": 0.4}, {"pose": "bb.stance", "face": "happy", "ms": 110}]}
}, pools: {"brawl": ["brawl.block", "brawl.bonk", "brawl.boop", "brawl.cbonk", "brawl.cboop", "brawl.dbonk", "brawl.dboop", "brawl.dodge", "brawl.gbreak", "brawl.getup", "brawl.grab", "brawl.hit", "brawl.hitBig", "brawl.hitLow", "brawl.jbonk", "brawl.jboop", "brawl.jpower", "brawl.jump", "brawl.lowbonk", "brawl.lowboop", "brawl.power", "brawl.toss", "brawl.upper"]}},
{by: '🧱 baseline chat', block: 'brawl', game: 'brawlbuddies', date: '2026-11-18'});
// 🎭 BLOCK brawl END

// 🎭 BLOCK motion (🎬 Motion chat · shared motion acts) START
// 🎬 Motion — shared model acts on the new motion layer (🎬 Motion chat, mo-1 + mo-3 spins, 2026-11-18). Any game may play them or copy one into its own block.
// They use AvatarMotion (weight presets · phase eases · 🖐️ wrist · 💨 smear on the strike · 📳 heavy shake); without AvatarMotion they still play (plain eases).
// Side view facing right: armR + = forward (π = straight up, − = behind), holdRot = the held thing's turn at the hand (0 ≈ pointing up), wristR adds to it.
Acting.add({poses: {
  // 🗡️ light rising slash (Steel Blade): the blade starts low behind the hip, sweeps forward and up
  'mo.slash-ready':  {armR: 1.0, elbowR: 1.0, holdRot: 0.3, armL: 0.7, elbowL: 1.5, legL: 0.35, legR: 0.3, kneeL: 0.25, kneeR: 0.3, dy: 2},
  'mo.slash-coil':   {armR: -0.9, elbowR: 0.3, holdRot: 3.63, wristR: 0.32, armL: 1.55, elbowL: 0.1, bend: -0.12, rot: -0.1, legL: 0.35, legR: 0.3, kneeL: 0.45, kneeR: 0.55, dy: 6},
  'mo.slash-hit':    {armR: 1.75, elbowR: 0.05, holdRot: 1.1, wristR: -0.48, armL: 0.4, elbowL: 1.5, bend: 0.15, rot: 0.08, legL: 0.6, legR: 0.3, kneeL: 0.35, kneeR: 0.3, shift: 5},
  'mo.slash-over':   {armR: 2.7, elbowR: 0.25, holdRot: -0.65, wristR: -0.4, armL: 0.3, elbowL: 1.4, bend: -0.05, rot: 0.1, legL: 0.5, legR: 0.3, kneeL: 0.1, kneeR: 0.1, dy: -2, shift: 6},
  // ⚔️ heavy overhead slam (Greatsword): dragged low → lifted over the top (the apex slows) → smashed down in one strike → stays LOW
  'mo.slam-drag':    {armR: -0.6, elbowR: 0.2, holdRot: 4.12, armL: 1.2, elbowL: 0.3, bend: -0.1, legL: 0.35, legR: 0.3, kneeL: 0.65, kneeR: 0.65, dy: 8},
  'mo.slam-lift':    {armR: -2.7, elbowR: -0.2, holdRot: 4.5, armL: 2.0, elbowL: 0.4, bend: -0.22, legL: 0.35, legR: 0.3, kneeL: 0.1, kneeR: 0.15, dy: -2},
  'mo.slam-hit':     {armR: -4.983, elbowR: 0.1, holdRot: 8.483, armL: 1.0, elbowL: 0.4, bend: 0.42, legL: 0.6, legR: 0.3, kneeL: 0.75, kneeR: 0.75, dy: 9, sy: 0.95, sx: 1.04, shift: 6},
  'mo.slam-low':     {armR: -5.133, elbowR: 0.1, holdRot: 8.683, armL: 0.9, elbowL: 0.5, bend: 0.46, legL: 0.6, legR: 0.3, kneeL: 0.8, kneeR: 0.8, dy: 10, shift: 7},
  'mo.slam-stand':   {armR: -5.283, elbowR: 0.9, holdRot: 6.483, armL: 0.7, elbowL: 1.5, legL: 0.35, legR: 0.3, kneeL: 0.25, kneeR: 0.3, dy: 2},
  // 🔱 medium thrust: pulled back, then STRAIGHT forward (a straight smear)
  'mo.thrust-coil':  {armR: 1.5, elbowR: 0, holdRot: 1.3, armL: 0.9, elbowL: 1.6, bend: 0.05, legL: 0.3, legR: 0.4, kneeL: 0.35, kneeR: 0.5, dy: 4, shift: -8},
  'mo.thrust-hit':   {armR: 1.5, elbowR: 0, holdRot: 1.3, armL: 0.2, elbowL: 1.2, bend: 0.05, legL: 0.7, legR: 0.3, kneeL: 0.45, kneeR: 0.2, dy: 4, shift: 10},
  'mo.thrust-over':  {armR: 1.52, elbowR: 0, holdRot: 1.28, armL: 0.15, elbowL: 1.2, bend: 0.08, legL: 0.75, legR: 0.3, kneeL: 0.5, kneeR: 0.2, dy: 4, shift: 12},
  // 👊 light jab with a fist swoosh
  'mo.jab-coil':     {armR: 0.9, elbowR: 2.2, armL: 1.1, elbowL: 1.9, rot: -0.1, bend: -0.06, legL: 0.3, legR: 0.35, kneeL: 0.3, kneeR: 0.4, dy: 3},
  // 🌀 mo-3 spin slash (yaw = the turn: 0 = today's picture, − = turned toward the camera first). The turn itself is filled by AvatarMotion (act field spin)
  'mo.spin-ready':  {armR: 1.0, elbowR: 0.9, holdRot: 0.3, armL: 0.6, elbowL: 1.4, legL: 0.3, legR: 0.3, kneeL: 0.3, kneeR: 0.3, dy: 3},
  'mo.spin-coil':   {armR: -1.0, elbowR: 0.3, holdRot: 3.7, armL: 1.3, elbowL: 0.4, rot: -0.12, bend: -0.1, legL: 0.35, legR: 0.3, kneeL: 0.5, kneeR: 0.5, dy: 5, yaw: -0.6},
  'mo.spin-hit':    {armR: 1.75, elbowR: 0.05, holdRot: 0.62, armL: 0.4, elbowL: 1.4, bend: 0.12, legL: 0.45, legR: 0.3, kneeL: 0.45, kneeR: 0.45, dy: 3},
  'mo.spin-over':   {armR: 2.2, elbowR: 0.15, holdRot: -0.2, armL: 0.35, elbowL: 1.4, bend: 0.12, legL: 0.45, legR: 0.3, kneeL: 0.45, kneeR: 0.45, dy: 3, yaw: 0.3},
  'mo.spin-end':    {armR: 2.3, elbowR: 0.2, holdRot: -0.4, armL: 0.4, elbowL: 1.4, bend: 0.1, legL: 0.4, legR: 0.3, kneeL: 0.5, kneeR: 0.5, dy: 4},
  'mo.spinm-coil':  {armR: -1.1, elbowR: 0.3, holdRot: 3.8, armL: 1.3, elbowL: 0.4, rot: -0.14, bend: -0.12, legL: 0.35, legR: 0.3, kneeL: 0.6, kneeR: 0.6, dy: 6, yaw: -0.7},
  'mo.spinm-over':  {armR: 2.2, elbowR: 0.15, holdRot: -0.2, armL: 0.35, elbowL: 1.4, bend: 0.12, legL: 0.45, legR: 0.3, kneeL: 0.5, kneeR: 0.5, dy: 4, yaw: 0.35},
  'mo.spinh-coil':  {armR: -1.2, elbowR: 0.25, holdRot: 3.9, armL: 1.4, elbowL: 0.3, rot: -0.16, bend: -0.14, legL: 0.4, legR: 0.35, kneeL: 0.75, kneeR: 0.75, dy: 9, yaw: -0.8},
  'mo.spinh-hit':   {armR: 1.7, elbowR: 0.05, holdRot: 0.7, armL: 0.5, elbowL: 1.2, bend: 0.16, legL: 0.55, legR: 0.35, kneeL: 0.7, kneeR: 0.7, dy: 7},
  'mo.spinh-over':  {armR: 2.1, elbowR: 0.1, holdRot: -0.1, armL: 0.5, elbowL: 1.2, bend: 0.16, legL: 0.55, legR: 0.35, kneeL: 0.7, kneeR: 0.7, dy: 7, yaw: 0.22},
  'mo.jab-hit':      {armR: 1.62, elbowR: 0.02, armL: 0.8, elbowL: 2.0, rot: 0.08, bend: 0.14, legL: 0.45, legR: 0.3, kneeL: 0.25, kneeR: 0.25, shift: 3},
}, acts: {
  'motion.slash.light': {tags: ['fight', 'slash', 'motion', 'beat'], share: true, weight: 'light', drag: false, about: 'Rising sword slash with wrist + smear', beats: [
    {pose: 'mo.slash-ready', face: 'focused', ms: 60}, {pose: 'mo.slash-coil', face: 'determined', ms: 120},
    {pose: 'mo.slash-hit', face: 'determined', ms: 60, contact: true, smear: true}, {pose: 'mo.slash-over', face: 'determined', ms: 160}, {pose: 'mo.slash-ready', face: 'focused', ms: 100}]},
  'motion.slam.heavy': {tags: ['fight', 'slam', 'motion', 'beat'], share: true, weight: 'heavy', drag: false, stop: 90, about: 'Overhead two-hand slam: drag, lift, SMASH, stay low', beats: [
    {pose: 'mo.slam-drag', face: 'determined', ms: 80}, {pose: 'mo.slam-lift', face: 'determined', ms: 250},
    {pose: 'mo.slam-hit', face: 'determined', ms: 100, contact: true, smear: true}, {pose: 'mo.slam-low', face: 'determined', ms: 300}, {pose: 'mo.slam-stand', face: 'focused', ms: 200}]},
  'motion.thrust.medium': {tags: ['fight', 'thrust', 'motion', 'beat'], share: true, weight: 'medium', drag: false, lag: false, about: 'Straight thrust with a straight smear', beats: [
    {pose: 'mo.slash-ready', face: 'focused', ms: 70}, {pose: 'mo.thrust-coil', face: 'determined', ms: 200},
    {pose: 'mo.thrust-hit', face: 'determined', ms: 80, contact: true, smear: 'light'}, {pose: 'mo.thrust-over', face: 'determined', ms: 220}, {pose: 'mo.slash-ready', face: 'focused', ms: 150}]},
  'motion.jab.light': {tags: ['fight', 'punch', 'motion', 'beat'], share: true, weight: 'light', drag: false, lag: false, about: 'Snappy jab with a fist swoosh', beats: [
    {pose: 'fx.guard', face: 'focused', ms: 60}, {pose: 'mo.jab-coil', face: 'determined', ms: 120},
    {pose: 'mo.jab-hit', face: 'determined', ms: 60, contact: true, smear: 'light'}, {pose: 'fx.guard', face: 'focused', ms: 160}, {pose: 'fx.guard', face: 'focused', ms: 100}]},
  // 🌀 mo-3 spins (Motion.spin({weight, turns}) → the key; a 2-turn copy is made on demand): ONE contact when the front comes round
  'motion.spin.light': {tags: ['fight', 'spin', 'slash', 'motion', 'beat'], share: true, drag: false, spin: {turns: 1, coil: 0.6, ring: 110}, about: 'Spin slash: hold, coil, one fast turn, hit, hold', beats: [
    {pose: 'mo.spin-ready', face: 'focused', ms: 200, ease: 'sineInOut'}, {pose: 'mo.spin-coil', face: 'determined', ms: 150, ease: 'cubicOut'},
    {pose: 'mo.spin-hit', face: 'determined', ms: 220, tr: 160, contact: true, ease: 'linear'}, {pose: 'mo.spin-over', face: 'determined', ms: 160, ease: 'sineOut'}, {pose: 'mo.spin-end', face: 'happy', ms: 200, ease: 'sineInOut'}]},
  'motion.spin.medium': {tags: ['fight', 'spin', 'slash', 'motion', 'beat'], share: true, drag: false, spin: {turns: 1, coil: 0.7, ring: 120}, about: 'Spin swing (spear / staff / axe)', beats: [
    {pose: 'mo.spin-ready', face: 'focused', ms: 220, ease: 'sineInOut'}, {pose: 'mo.spinm-coil', face: 'determined', ms: 220, ease: 'cubicOut'},
    {pose: 'mo.spin-hit', face: 'determined', ms: 300, tr: 220, contact: true, ease: 'linear'}, {pose: 'mo.spinm-over', face: 'determined', ms: 240, ease: 'sineOut'}, {pose: 'mo.spin-end', face: 'happy', ms: 200, ease: 'sineInOut'}]},
  'motion.spin.heavy': {tags: ['fight', 'spin', 'slam', 'motion', 'beat'], share: true, drag: false, stop: 90, shake: 6, spin: {turns: 1, coil: 0.8, ring: 140, size: 1.25}, about: 'Heavy spin (greatsword / club / hammer): low, one turn, big ring, shake', beats: [
    {pose: 'mo.spin-ready', face: 'focused', ms: 250, ease: 'sineInOut'}, {pose: 'mo.spinh-coil', face: 'determined', ms: 300, ease: 'cubicOut'},
    {pose: 'mo.spinh-hit', face: 'determined', ms: 380, tr: 280, contact: true, ease: 'linear'}, {pose: 'mo.spinh-over', face: 'determined', ms: 340, ease: 'sineOut'}, {pose: 'mo.spin-end', face: 'focused', ms: 220, ease: 'sineInOut'}]},
}}, {by: '🎬 Motion chat', block: 'motion', game: '', date: '2026-11-18'});
// 🎭 BLOCK motion END

// 🎭 BLOCK starter (🧱 baseline chat · 🧩 starter) START
// ⭐ Star Catch = the 🧩 GameStarter demo (🧱 B4a, 2026-11-18) — the avatar's actions on the 🎬 beat timeline. A NEW game copies this block
// (new_game.py renames `starter.` → `<game>.`) and changes poses / times, keeping the beat names. ready → anticipation → contact → follow → settle.
// CONTACT = the moment the game scores: the star reaches the hands (catch) · the top of the leap (big star) · the rain drop lands (oops).
Acting.add({poses: {
  'sc.stand':  {armL: 0.15, armR: 0.15},
  'sc.look':   {armL: 0.5, armR: 0.6, elbowL: 0.3, elbowR: 0.3, bend: -0.08},
  'sc.reach':  {armL: 2.3, armR: 2.5, elbowL: 0.35, elbowR: 0.3, kneeL: 0.25, kneeR: 0.25, sy: 1.03},
  'sc.snatch': {armL: 2.95, armR: 2.95, elbowL: -0.1, elbowR: -0.1, footL: 0.45, footR: 0.45, dy: -6, sy: 1.08, sx: 0.95},
  'sc.hug':    {armL: 1.2, armR: 1.2, elbowL: 1.6, elbowR: 1.6, kneeL: 0.3, kneeR: 0.3, dy: 2, sy: 0.95, sx: 1.04},
  'sc.crouch': {legL: 0.45, kneeL: 0.9, legR: -0.45, kneeR: 0.9, armL: -0.5, armR: -0.5, elbowL: 0.3, elbowR: 0.3, dy: 6, sy: 0.84, sx: 1.1, bend: 0.18},
  'sc.launch': {legL: -0.2, legR: 0.3, footL: 0.6, footR: 0.6, armL: 2.4, armR: 2.6, dy: -10, sy: 1.12, sx: 0.92},
  'sc.apex':   {legL: 0.7, kneeL: 1.2, legR: 0.4, kneeR: 1.0, armL: 3.0, armR: 3.0, elbowL: -0.1, elbowR: -0.1, dy: -12, sy: 1.06},
  'sc.land':   {legL: 0.45, kneeL: 0.8, legR: -0.45, kneeR: 0.8, armL: 0.9, armR: 0.9, elbowL: 0.5, elbowR: 0.5, dy: 5, sy: 0.86, sx: 1.1, bend: 0.15},
  'sc.flinch': {armL: 1.9, armR: 2.1, elbowL: 1.4, elbowR: 1.4, bend: 0.12, sy: 0.96},
  'sc.splat':  {armL: 2.6, armR: 2.8, elbowL: 0.6, elbowR: 0.6, bend: -0.2, rot: -0.1, sy: 0.82, sx: 1.14, dy: 4},
  'sc.daze':   {rotFull: 6.2832, armL: 0.6, armR: 0.6, kneeL: 0.3, kneeR: 0.3, sy: 0.95},
  'sc.burst':  {armL: 3.0, armR: 3.0, elbowL: -0.1, elbowR: -0.1, footL: 0.5, footR: 0.5, dy: -14, sy: 1.1, sx: 0.94},
  'sc.fist':   {armL: 2.9, armR: 2.9, elbowL: 1.2, elbowR: 1.2, dy: -3, sy: 1.04}
}, acts: {
  'starter.catch': {tags: ['happy', 'beat'], share: true, ride: 'keep', about: '⭐ eyes up, reaches, snatches a falling star, hugs it', beats: [
    {pose: 'sc.look', face: 'happy', ms: 40}, {pose: 'sc.reach', face: 'determined', ms: 160, ease: 'cubicOut'},
    {pose: 'sc.snatch', face: 'joy', ms: 70, contact: true, marks: ['sparkles']},
    {pose: 'sc.hug', face: 'star-eyes', ms: 220, ease: 'backOut'}, {pose: 'sc.stand', face: 'happy', ms: 140}]},
  'starter.leap': {tags: ['happy', 'move', 'beat'], share: true, ride: 'keep', about: '🌟 crouch, leap, grab the big star at the top, land squash', beats: [
    {pose: 'sc.crouch', face: 'determined', ms: 90}, {pose: 'sc.launch', face: 'determined', ms: 150, ease: 'quartOut'},
    {pose: 'sc.apex', face: 'joy', ms: 80, contact: true, marks: ['sparkles']},
    {pose: 'sc.land', face: 'happy', ms: 200, ease: 'bounceOut'}, {pose: 'sc.stand', face: 'happy', ms: 120}]},
  'starter.oops': {tags: ['miss', 'beat'], share: true, ride: 'keep', about: '🌧️ a rain drop lands on the head — flinch, splat, dizzy', beats: [
    {pose: 'sc.stand', face: 'neutral', ms: 20}, {pose: 'sc.flinch', face: 'shock', ms: 40, ease: 'hold'},
    {pose: 'sc.splat', face: 'shock', ms: 70, contact: true, stop: 60, tricks: ['shake'], marks: ['exclaim']},
    {pose: 'sc.daze', face: 'dizzy', ms: 420, ease: 'cubicOut'}, {pose: 'sc.stand', face: 'embarrassed', ms: 160}]},
  'starter.cheer': {tags: ['win', 'happy', 'beat'], share: true, ride: 'keep', about: '🎉 goal! crouch, burst up, fists high', beats: [
    {pose: 'sc.stand', face: 'happy', ms: 30}, {pose: 'sc.crouch', face: 'determined', ms: 120},
    {pose: 'sc.burst', face: 'joy', ms: 90, contact: true, marks: ['sparkles']},
    {pose: 'sc.fist', face: 'star-eyes', ms: 260, ease: 'backOut'}, {pose: 'sc.stand', face: 'happy', ms: 160}]}
}, pools: {'starter': ['starter.catch', 'starter.leap', 'starter.oops', 'starter.cheer']}},
{by: '🧱 baseline chat', block: 'starter', game: 'starter', date: '2026-11-18'});
// 🎭 BLOCK starter END

// 🎭 BLOCKS END (AvatarActs — add your own 🎭 BLOCK above this line)
