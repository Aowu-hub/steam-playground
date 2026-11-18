
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

// 🎭 BLOCKS END (AvatarActs — add your own 🎭 BLOCK above this line)
