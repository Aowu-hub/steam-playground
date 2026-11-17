
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ ?mode=<id> (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const GAME_ID = 'pyraspike';   // 🏐 PyraSpike board (R2 adds 'pyrastrike', R3 'pyraspark' on this same page)
// UiKit lists (loader + ❓ card) are registered here, so UiKit itself is not touched (polish lane)
if(UI.KINDS){ UI.KINDS.pyraspike = UI.KINDS.pyraspike || ['🔥', 'Lighting the Pyra flame', 'bump']; UI.KINDS.pyradive = UI.KINDS.pyradive || UI.KINDS.pyraspike; }
if(UI.GAME_HELP && !UI.GAME_HELP.pyraspike) UI.GAME_HELP.pyraspike = ['Volleyball with your avatar! Each side gets 3 touches: 🤚 bump it up, 🪶 set it high, 💥 dunk it over the net. The ball landing in their court = your point.',
  'W A S D move · J 🤚 touch · K 💥 drive / dunk (hold on a serve) · L 🪶 dink · Space ⬆️ jump / block · Shift 🤸 dive · F 🔥 Pyra. On a tablet: the stick + the round buttons.',
  '🦶 PyraStrike = sepak takraw (ตะกร้อ): feet, knees and head only — 🦵 Trap (J), 🙆 head set, 💥 roll strike / 🚲 bicycle (K), 🦶 heel tip (L). One player may use all 3 touches. Serve: your buddy tosses, you kick.',
  '⚡ PyraSpark = a net-TABLE game: let it bounce ONCE on your half (twice on 🌱 Basic), then up to 3 touches — 🦵 Trap (J), ⚡ Drive / smash (K), 🪶 Dink (L), 💥 Edge = L + K together. Duo: pass to your partner before it goes back (🐣 Junior up). 2 serve tries; the serve changes every 4 points.',
  '🔥🔥×2 / ×3: when 2 or 3 players of a team have a FULL flame, one tap of 🔥 arms them TOGETHER — a Spirit Duo Dive (Dunk, Dink or Block) or a Spirit Trio Dive (dig → set → spike Combo = the point counts double, or a Block). 📖 Every creature you call goes into your Spirit Bestiary.',
  '🔥🔥 A FULL flame + 🔥 = a SPIRIT DIVE: your next Dunk, Dink, Serve, Block or Save calls a creature (🐉 Dragon, 🦁 Singha, 🗿 Golem, 🐘 Gajasiha, 🐦‍🔥 Phoenix, 🦢 Hongsa, 🦊 Kitsune, 🧚 Kinnaree, 🐍 Naga, 🐊 Makara) — almost nobody can stop it.',
  'Serve 3 ways: 💥 K = float serve (hold for power) · ⬆️ Space = 🦘 jump serve (fast + steep) · 🪶 L = 🤏 pinch serve (drops just over the net).',
  'Good touches fill your 🔥 flame. Half full → tap 🔥 and your next move is a Pyra… move!'];
const HELP_R4 = ['🎯 Training: 🎯 Zone Hits (the 🧑‍🏫 Coach feeds you — hit the glowing zone) · 🔗 Body Combo (Trap → Pop → ⚡ Smash = 5) · 🏃 Rally Run (the Coach sends everything back, faster and faster) · 🤹 Juggle (keepy-up alone — switch foot · knee · head for bonus).',
  '🌀 Spark Party: a bouncy ball + 2–3 extra balls on the table at once — every ball you send back onto their half counts!',
  '🏆 Cups: Cup of 4 · Cup of 8 · 👑 Family Cup (family members captain the other teams) — knock-out, lose once and you are out; pick the sport in the setup. ⭐ In the 📖 Spirit Bestiary, pin a favourite creature per move — from 🔥 Intermediate it comes every time.'];
if(UI.GAME_HELP && UI.GAME_HELP.pyraspike && !UI.GAME_HELP.pyraspike.some(l => String(l).indexOf('🎯 Training') === 0)) UI.GAME_HELP.pyraspike.push(...HELP_R4);   // pd-4a (UiKit lane: same lines)
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '🔥', name: 'PyraDive', levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => { stopLoop(); },
  pause: {pause: () => setPaused(true), resume: () => setPaused(false)}, pauseButton: true,
  scoreMin: '4ch', onFit: () => { if(G) resize(); }});
var NAV_INNER = {setup: ['◀ PyraDive', () => showScreen('menu')]};
UI.navBar(document.getElementById('back-btn'), {onclick: false});
const $ = id => document.getElementById(id);
let FX = 1;   // the harness sets 0 (no big words / confetti / shake)
function pdPick(a){ return a[Math.floor(Math.random() * a.length)]; }
function isTouch(){ return (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window && matchMedia('(pointer:coarse)').matches; }

/* ================= DATA ================= */
const LEVEL_UI = [
  {emoji: '🌱', blurb: 'The ball waits for you — press the glowing button. First to 7.'},
  {emoji: '🐣', blurb: 'A bit faster. Hints for your first touches, then you\'re on your own.'},
  {emoji: '🔥', blurb: 'Normal speed. Touching the net, a double touch or a 4th touch = their point.'},
  {emoji: '⚡', blurb: 'Roles rotate after every side-out. Robots block now. First to 21.'},
  {emoji: '🌋', blurb: 'Fast ball, no aim help. Best of 3 sets.'},
  {emoji: '💀', blurb: 'Fastest ball, sharpest robots, best of 3 sets. ×3 points.', hardcore: true}
];
const AGE_START = {'4-5': 0, '6-7': 0, '8-9': 1, '10+': 2};
/* 🗂️ MODE GROUPS (mg-1) — fixed order; R2 adds 🦶 PyraStrike, R3 ⚡ PyraSpark, R4 🎯 Training · 🎪 Fun · 🏆 Cups */
const MODE_GROUPS = [{k: 'spike', icon: '🏐', en: 'PyraSpike', th: 'วอลเลย์บอล', c: '#FF6B1A'}, {k: 'strike', icon: '🦶', en: 'PyraStrike', th: 'ตะกร้อ', c: '#2FBF71'}, {k: 'spark', icon: '⚡', en: 'PyraSpark', th: 'บอลข้ามโต๊ะ', c: '#2F7BEA'}, {k: 'train', icon: '🎯', en: 'Training + Cups', th: 'ฝึกซ้อม + ถ้วย', c: '#9B5DE5'}];   // pd-4b: 🌀 Spark Party sits in ⚡ PyraSpark, 🏆 Cups with 🎯 Training (two rows of boxes on phones)   // pd-4a: 🎯 Training + 🎪 Fun · pd-4b: + 🏆 cups in the same box   // pd-3a: ⚡ PyraSpark   // pd-2b: one box per sport (R3 adds ⚡ PyraSpark)   // R1: two 🏐 PyraSpike boxes by court type; R2 folds them into one 🏐 PyraSpike box next to 🦶 PyraStrike
const MODE_CARDS = {
  beach: {type: 'A beach volleyball game', sub: '2 a side on the sand · you dunk, your buddy sets'},
  small: {type: 'A small-court volleyball game', sub: '3 a side · one 🚀 Driver, one 🪶 Dinker, one 💥 Dunker'},
  full: {type: 'A full volleyball game', sub: '6 a side in the big arena · front row blocks'},
  strikesolo: {type: 'A sepak takraw game (feet only!)', sub: '1 a side · trap, head it up, strike it — all yourself'},
  strikeduo: {type: 'A 2-a-side sepak takraw game', sub: 'Kick, knee, head — never hands · roll strike over the low net'},
  strikeregu: {type: 'A team (regu) sepak takraw game', sub: '3 a side · 🚀 kicker, 🪶 feeder, 💥 striker · bicycle kicks!'},
  hoop: {type: 'Hoop takraw (ตะกร้อลอดห่วง)', sub: 'Keep it up in a circle — kick it THROUGH the hanging hoop · heel + bicycle score most'},
  sparksolo: {type: 'A net-table game, 1 against 1', sub: 'Let it bounce once on your half · trap, pop, send it back · 💥 EDGE balls count'},
  sparkduo: {type: 'A net-table game, 2 against 2', sub: 'Pass to your partner before it goes back over · no hands, ever'},
  zonehits: {type: 'A training drill on the ⚡ table', sub: 'The 🧑‍🏫 Coach feeds you — hit the glowing zone for 3 points'},
  combo: {type: 'A training drill: Trap → Pop → Smash', sub: 'Use all 3 touches and finish with a ⚡ smash = 5 points'},
  rallyrun: {type: 'A training drill: the long rally', sub: 'The 🧑‍🏫 Coach sends everything back — faster and faster'},
  juggle: {type: 'A training drill: keepy-up', sub: 'Keep it up alone — switch foot, knee, head for bonus points'},
  party: {type: 'A fun mode: Spark Party', sub: 'A bouncy ball + extra balls at once — send them ALL back!'}
};
window.MODE_TYPE = {}; for(const k in MODE_CARDS) window.MODE_TYPE[k] = MODE_CARDS[k].type;
function groupOf(m){ return m.drill ? 'train' : m.party ? 'spark' : m.sport === 'hoop' ? 'strike' : m.sport; }
/* 🏆 pd-4b CUPS: a knock-out bracket around normal matches (one set each). The cup is picked like a mode (SET.cup), the sport inside it in the setup (SET.cupSport). */
const CUPS = {
  cupfour: {k: 'cupfour', icon: '🏆', name: 'Cup of 4', n: 4, type: 'A knock-out cup — 4 teams', sub: 'Win the semi-final and the final to lift the 🏆'},
  cupeight: {k: 'cupeight', icon: '🎖️', name: 'Cup of 8', n: 8, type: 'A knock-out cup — 8 teams', sub: 'Quarter-final → semi-final → final'},
  familycup: {k: 'familycup', icon: '👑', name: 'Family Cup', n: 4, family: true, type: 'A cup against your family', sub: 'Family members captain the other teams — win it to be 👑 Captain Flame'}
};
const CUP_ORDER = ['cupfour', 'cupeight', 'familycup'], CUP_SPORTS = ['beach', 'strikesolo', 'sparksolo'];
const CUP_TEAMS = [['🔥', 'Blaze'], ['🌊', 'Waves'], ['⚡', 'Volts'], ['🌪️', 'Twisters'], ['🐯', 'Tigers'], ['❄️', 'Frost'], ['🌋', 'Lava'], ['🦅', 'Hawks'], ['🐙', 'Squids'], ['🌵', 'Cactus']];
const CUP_ROUND = {1: 'Final', 2: 'Semi-final', 4: 'Quarter-final'}, CUP_TARGET = [7, 9, 11, 11, 11, 11];
const CUP_CARD = {k: 'cups', icon: '🏆', name: 'Cups', type: 'Knock-out cups', sub: 'Cup of 4 · Cup of 8 · 👑 Family Cup — lose once and you are out'};   // ONE card (the phone menu must fit); the cup kind is picked in the setup
function curMode(){ return SET.cup ? 'cups' : SET.mode; }
function modeInfo(k){ return k === 'cups' ? CUP_CARD : PD.MODES[k] || CUPS[k] || null; }
function pickMode(k){ if(k === 'cups') SET.cup = CUPS[SET.cupKind] ? SET.cupKind : 'cupfour'; else if(CUPS[k]){ SET.cup = k; SET.cupKind = k; } else if(PD.MODES[k]){ SET.cup = ''; SET.mode = k; } savePrefs(); markModes(); renderLevels(); }   // the level cards show the mode's own goal (⏱️ / ❤️ / ⭐ / cup)
function mgList(){ return PD.MODE_ORDER.map(k => ({k, g: groupOf(PD.MODES[k]), icon: PD.MODES[k].icon, name: PD.MODES[k].name, type: MODE_CARDS[k].type, sub: MODE_CARDS[k].sub, next: '👇 then pick a level'})).concat([{k: 'cups', g: 'train', icon: CUP_CARD.icon, name: CUP_CARD.name, type: CUP_CARD.type, sub: CUP_CARD.sub, next: '👇 then pick a level'}]); }
/* 🗂️ END MODE GROUPS */
/* 🏷️ PyraLogo (pd-7): the PyraDive logo + 🏐 Spike · 🦶 Strike · ⚡ Spark badges, drawn in code (Aowu 2026-11-15) */
/* 🔥 PyraLogo (pd-7 draft) — the PyraDive logo + the 3 sport badges, drawn in code (no picture files).
   PyraLogo.pic(kind, arena, px) → cached canvas · PyraLogo.url(kind, arena, px) → data URL for <img> · PyraLogo.draw(g, kind, x, y, px, arena)
   kind: 'main' | 'wide' (title-row wordmark) | 'spike' | 'strike' | 'spark' · arena: PyraDive arena key (recolours glow + rim), unknown → classic. */
const PyraLogo = (() => {
  const SPORT = {
    spike: {name: 'Spike', ac: '#FF6A1A', ball: 'volley', court: 'net'},
    strike: {name: 'Strike', ac: '#FFC21A', ball: 'takraw', court: 'net'},
    spark: {name: 'Spark', ac: '#3CC8FF', ball: 'spark', court: 'table'}
  };
  const THEME = {   // glow · rim (2 metal stops) · back (centre, edge) · fire (tip, mid, base)
    classic: {glow: '#FF7A1A', rim: ['#FFE08A', '#B8741E'], back: ['#2A1208', '#07040A'], fire: ['#FFF3A0', '#FF8A1E', '#C2180A']},
    fair:    {glow: '#FFB347', rim: ['#FFE7B0', '#9C5A2A'], back: ['#3A1A30', '#120612'], fire: ['#FFF3A0', '#FF9A3C', '#B8301A']},
    jungle:  {glow: '#9BE15D', rim: ['#F6E7A0', '#7A6A2A'], back: ['#1E2A10', '#070A04'], fire: ['#FFF3A0', '#FF9A2A', '#C2380A']},
    coral:   {glow: '#3BE0D0', rim: ['#E8FBFF', '#3A8AA0'], back: ['#06324A', '#020C14'], fire: ['#E8FFFF', '#3BE0D0', '#E9707A']},
    neon:    {glow: '#FF2BD6', rim: ['#B8F3FF', '#3C5CFF'], back: ['#1A0A3C', '#05020E'], fire: ['#FFFFFF', '#3CF2FF', '#FF2BD6']},
    robot:   {glow: '#FFD23F', rim: ['#E6ECF2', '#5A6676'], back: ['#232B36', '#0A0D12'], fire: ['#FFF7C0', '#FFD23F', '#E0601A']},
    moon:    {glow: '#B8C6FF', rim: ['#FFFFFF', '#7A7C90'], back: ['#151933', '#010208'], fire: ['#FFFFFF', '#B8C6FF', '#5B4EFF']},
    olympus: {glow: '#FFC94A', rim: ['#FFF4C8', '#C9962A'], back: ['#2C5A8C', '#0E2440'], fire: ['#FFFFFF', '#FFD86A', '#E08A1A']}
  };
  const FONT = (w, px) => w + ' ' + px + 'px Fredoka, Nunito, "Arial Rounded MT Bold", sans-serif';
  const cache = {}; let SC = 1;   // SC = current scale (shadow blur is not scaled by the canvas transform)
  const lin = (g, x0, y0, x1, y1, st) => { const q = g.createLinearGradient(x0, y0, x1, y1); st.forEach((c, i) => q.addColorStop(i / (st.length - 1), c)); return q; };
  const rad = (g, x, y, r, st) => { const q = g.createRadialGradient(x, y - r * 0.35, r * 0.05, x, y, r); st.forEach((c, i) => q.addColorStop(i / (st.length - 1), c)); return q; };

  function shield(g){   // unit shield: 200 wide, 240 tall, centre (0,0)
    g.beginPath(); g.moveTo(-100, -104); g.lineTo(-28, -104); g.quadraticCurveTo(0, -122, 28, -104); g.lineTo(100, -104);
    g.lineTo(100, 4); g.quadraticCurveTo(96, 80, 0, 120); g.quadraticCurveTo(-96, 80, -100, 4); g.closePath();
  }
  function flames(g, T, y0, w, h, n, seed){   // a row of flame tongues standing on y0
    g.fillStyle = lin(g, 0, y0 - h, 0, y0, [T.fire[0], T.fire[1], T.fire[2]]);
    g.beginPath(); g.moveTo(-w / 2, y0);
    for(let i = 0; i < n; i++){
      const a = -w / 2 + w * i / n, b = a + w / n, m = (a + b) / 2, hh = h * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + seed))), lean = (i % 2 ? 1 : -1) * w / n * 0.35;
      g.quadraticCurveTo(a, y0 - hh * 0.5, m + lean, y0 - hh); g.quadraticCurveTo(b, y0 - hh * 0.45, b, y0);
    }
    g.closePath(); g.fill();
  }
  function rays(g, T, r, n){ g.save(); g.globalAlpha = 0.13; g.fillStyle = T.glow; for(let i = 0; i < n; i++){ const a = i * Math.PI * 2 / n; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a, a + Math.PI / n * 0.5); g.closePath(); g.fill(); } g.restore(); }
  function trail(g, T, x, y, r){   // fire trail behind a flying ball (up-left)
    g.save(); g.translate(x, y); g.rotate(-2.4);
    [[2.6, 1, T.fire[2]], [2.1, 0.78, T.fire[1]], [1.5, 0.5, T.fire[0]]].forEach(([L, W, c]) => {
      g.fillStyle = c; g.beginPath(); g.moveTo(0, -r * W);
      g.quadraticCurveTo(r * L * 0.5, -r * W * 1.2, r * L, -r * 0.2); g.quadraticCurveTo(r * L * 0.7, 0, r * L * 1.05, r * 0.35);
      g.quadraticCurveTo(r * L * 0.5, r * W * 1.2, 0, r * W); g.closePath(); g.fill();
    });
    g.restore();
  }
  function ball(g, kind, x, y, r){
    g.save(); g.translate(x, y);
    g.beginPath(); g.arc(0, 0, r, 0, 7); g.save(); g.clip();
    if(kind === 'volley'){
      g.fillStyle = rad(g, 0, 0, r, ['#FFFFFF', '#FFF2D0', '#E8C27A']); g.fillRect(-r, -r, 2 * r, 2 * r);
      g.fillStyle = '#FF8A1E'; g.beginPath(); g.moveTo(-r, -r * 0.1); g.quadraticCurveTo(0, -r * 0.05, r * 0.25, -r); g.lineTo(-r, -r); g.closePath(); g.fill();
      g.fillStyle = '#2C6BFF'; g.beginPath(); g.moveTo(r, r * 0.05); g.quadraticCurveTo(r * 0.05, r * 0.05, -r * 0.2, r); g.lineTo(r, r); g.closePath(); g.fill();
      g.strokeStyle = '#5A3A1A'; g.lineWidth = r * 0.07; g.lineCap = 'round';
      [[-r, -r * 0.1, 0, -r * 0.05, r * 0.25, -r], [r, r * 0.05, r * 0.05, r * 0.05, -r * 0.2, r], [-r * 0.15, -r * 0.08, r * 0.1, r * 0.4, r * 0.75, r * 0.7]].forEach(([a, b, c, d, e, f]) => { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo(c, d, e, f); g.stroke(); });
    } else if(kind === 'takraw'){   // woven rattan: a lattice of 5-sided holes
      g.fillStyle = rad(g, 0, 0, r, ['#FFE3A0', '#E8A94A', '#9C5A1A']); g.fillRect(-r, -r, 2 * r, 2 * r);
      g.fillStyle = 'rgba(70,32,6,.85)'; const s = r * 0.42;
      for(let j = -3; j <= 3; j++) for(let i = -3; i <= 3; i++){
        const cx = i * s + (j % 2 ? s / 2 : 0), cy = j * s * 0.87, d = Math.hypot(cx, cy) / r; if(d > 1.05) continue;
        const k = 1 - d * d * 0.55, hr = s * 0.3 * k;   // holes shrink toward the edge (round look)
        g.beginPath(); for(let q = 0; q < 5; q++){ const a = q * Math.PI * 2 / 5 - Math.PI / 2; g.lineTo(cx * (0.92 + 0.08 * k) + Math.cos(a) * hr, cy * (0.92 + 0.08 * k) + Math.sin(a) * hr); } g.fill();
      }
    } else if(kind === 'spark'){   // white with blue lightning bands
      g.fillStyle = rad(g, 0, 0, r, ['#FFFFFF', '#F2F7FF', '#B8CCE8']); g.fillRect(-r, -r, 2 * r, 2 * r);
      g.strokeStyle = '#1E6BFF'; g.lineWidth = r * 0.16; g.lineJoin = 'miter';
      [-0.42, 0.38].forEach((oy, n) => { g.beginPath(); for(let q = 0; q <= 6; q++){ const px = -r + q * r / 3, py = r * oy + (q % 2 ? -1 : 1) * r * 0.16 + (n ? r * 0.1 : 0); q ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); });
      g.strokeStyle = '#9FE8FF'; g.lineWidth = r * 0.05; g.stroke();
    } else {   // 'fire' — the PyraDive fireball
      g.fillStyle = rad(g, 0, 0, r, ['#FFFFFF', '#FFF07A', '#FF9A1E', '#D2280A']); g.fillRect(-r, -r, 2 * r, 2 * r);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(-r * 0.3, -r * 0.35, r * 0.28, 0, 7); g.fill();
    }
    g.restore();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-r * 0.35, -r * 0.45, r * 0.22, r * 0.12, -0.6, 0, 7); g.fill();   // shine
    g.lineWidth = r * 0.06; g.strokeStyle = 'rgba(40,16,4,.8)'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
    g.restore();
  }
  function court(g, T, kind){
    g.save();
    if(kind === 'net'){   // net band across the shield with a white tape on top
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.6;
      for(let x = -100; x <= 100; x += 9){ g.beginPath(); g.moveTo(x, 16); g.lineTo(x, 50); g.stroke(); }
      for(let y = 16; y <= 50; y += 8.5){ g.beginPath(); g.moveTo(-100, y); g.lineTo(100, y); g.stroke(); }
      g.fillStyle = '#FFFFFF'; g.fillRect(-100, 11, 200, 6);
    } else {   // curved net-table (top view from the side): an arch with a low net
      g.fillStyle = lin(g, 0, 22, 0, 54, ['#2C6BFF', '#123A9C']); g.beginPath(); g.moveTo(-86, 52); g.quadraticCurveTo(0, 6, 86, 52); g.lineTo(86, 58); g.quadraticCurveTo(0, 14, -86, 58); g.closePath(); g.fill();
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-86, 52); g.quadraticCurveTo(0, 6, 86, 52); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(-2, 18, 4, 14);
    }
    g.restore();
  }
  function word(g, x, y, px, a, b, acFill, ink, align){   // "Pyra" + name, one word, two colours
    g.font = FONT('900 italic', px); g.textBaseline = 'middle'; g.lineJoin = 'round';
    const wa = g.measureText(a).width, wb = g.measureText(b).width, x0 = align === 'left' ? x : x - (wa + wb) / 2;
    g.lineWidth = px * 0.26; g.strokeStyle = ink; g.strokeText(a, x0, y); g.strokeText(b, x0 + wa, y);
    g.fillStyle = '#FFFFFF'; g.fillText(a, x0, y); g.fillStyle = acFill; g.fillText(b, x0 + wa, y);
    return wa + wb;
  }

  function badge(g, T, sp, small){   // small = icon only (name sits next to it), bigger ball   // drawn in the unit box (≈ 220 × 260)
    g.save(); g.shadowColor = T.glow; g.shadowBlur = 26 * SC; shield(g); g.lineWidth = 10; g.strokeStyle = T.glow; g.stroke(); g.restore();
    shield(g); g.fillStyle = rad(g, 0, -10, 150, [T.back[0], T.back[1]]); g.fill();
    g.save(); shield(g); g.clip();
    rays(g, T, 170, 22);
    g.globalAlpha = 0.9; flames(g, T, 124, 220, 92, 9, 1); g.globalAlpha = 1;
    court(g, T, sp.court);
    const by = small ? -14 : -42, br = small ? 54 : 40; trail(g, T, 6, by, br); ball(g, sp.ball, 6, by, br);
    g.restore();
    shield(g); g.lineWidth = 6; g.strokeStyle = lin(g, 0, -120, 0, 120, [T.rim[0], T.rim[1], T.rim[0], T.rim[1]]); g.stroke();
    if(small) return;
    // ribbon with the name
    g.save(); g.fillStyle = lin(g, 0, 62, 0, 100, ['#2A0E06', '#100404']);
    g.beginPath(); g.moveTo(-112, 66); g.lineTo(112, 66); g.lineTo(104, 82); g.lineTo(112, 98); g.lineTo(-112, 98); g.lineTo(-104, 82); g.closePath(); g.fill();
    g.lineWidth = 3; g.strokeStyle = T.rim[0]; g.stroke(); g.restore();
    const px = 34; g.font = FONT('900 italic', px); const w = g.measureText('Pyra' + sp.name).width, sc = Math.min(1, 196 / w);
    g.save(); g.translate(0, 82); g.scale(sc, sc); word(g, 0, 1, px, 'Pyra', sp.name, lin(g, 0, -16, 0, 16, ['#FFFFFF', sp.ac, sp.ac]), '#1A0602'); g.restore();
  }

  function tri(g, T){   // the pyramid + fireball, centred near (0, -14): top -112, base 84
    g.save(); g.beginPath(); g.moveTo(0, -112); g.lineTo(120, 84); g.lineTo(-120, 84); g.closePath(); g.fillStyle = rad(g, 0, 20, 140, [T.back[0], T.back[1]]); g.fill(); g.clip();
    rays(g, T, 180, 26); flames(g, T, 88, 260, 110, 9, 2); g.restore();
    g.save(); g.shadowColor = T.glow; g.shadowBlur = 30 * SC; g.lineJoin = 'round'; g.lineWidth = 12;
    g.strokeStyle = lin(g, -120, -112, 120, 84, [T.rim[0], T.glow, T.rim[1]]); g.beginPath(); g.moveTo(0, -112); g.lineTo(120, 84); g.lineTo(-120, 84); g.closePath(); g.stroke(); g.restore();
    [[-120, 84], [120, 84], [0, -112]].forEach(([x, y]) => { g.fillStyle = T.rim[0]; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); });
    trail(g, T, 0, 16, 44); ball(g, 'fire', 0, 16, 44);
  }
  const fireWord = (g, T, y0, y1) => lin(g, 0, y0, 0, y1, [T.fire[0], T.fire[1], T.fire[2]]);
  function wide(g, T){   // the title-row wordmark (≈ 760 × 190): pyramid left, "PyraDive" right
    g.save(); g.translate(-268, 4); g.scale(0.7, 0.7); tri(g, T); g.restore();
    const px = 112; g.font = FONT('900 italic', px); const w = g.measureText('PyraDive').width, sc = Math.min(1, 530 / w);
    g.save(); g.translate(-180, 6); g.scale(sc, sc);
    g.save(); g.shadowColor = T.glow; g.shadowBlur = 18 * SC; word(g, 0, 0, px, 'Pyra', 'Dive', fireWord(g, T, -40, 40), '#1A0602', 'left'); g.restore();
    word(g, 0, 0, px, 'Pyra', 'Dive', fireWord(g, T, -40, 40), '#1A0602', 'left');
    g.restore();
  }
  function main(g, T, small){   // drawn in the unit box (≈ 480 × 360): pyramid + fireball + "PyraDive" + tagline
    g.save(); g.translate(0, -40); tri(g, T); g.restore();
    const ink = '#1A0602';
    g.save(); g.shadowColor = T.glow; g.shadowBlur = 18 * SC; word(g, 0, 98, 78, 'Pyra', 'Dive', lin(g, 0, 70, 0, 128, [T.fire[0], T.fire[1], T.fire[2]]), ink); g.restore();
    word(g, 0, 98, 78, 'Pyra', 'Dive', lin(g, 0, 70, 0, 128, [T.fire[0], T.fire[1], T.fire[2]]), ink);
    if(small) return;   // tagline only where it can be read
    g.font = FONT('800', 22); const parts = [['volley', 'SPIKE'], ['takraw', 'STRIKE'], ['spark', 'SPARK']], gap = 26;
    const ws = parts.map(([, t]) => g.measureText(t).width), tot = ws.reduce((a, b) => a + b, 0) + parts.length * 26 + gap * (parts.length - 1);
    let x = -tot / 2; g.textBaseline = 'middle';
    parts.forEach(([b, t], i) => { ball(g, b, x + 10, 146, 10); g.lineWidth = 5; g.strokeStyle = ink; g.strokeText(t, x + 24, 147); g.fillStyle = '#FFFFFF'; g.fillText(t, x + 24, 147); x += 26 + ws[i] + gap; });
  }

  const BOX = {main: [480, 360], wide: [760, 190], spike: [272, 300], strike: [272, 300], spark: [272, 300]};   // room for the glow
  function draw(g, kind, x, y, px, arena){   // px = width on screen
    const T = THEME[arena] || THEME.classic, [bw] = BOX[kind] || BOX.spike, s = px / bw; SC = s;
    g.save(); g.translate(x, y); g.scale(s, s);
    kind === 'main' ? main(g, T, px < 260) : kind === 'wide' ? wide(g, T) : badge(g, T, SPORT[kind] || SPORT.spike, px < 110);
    g.restore();
  }
  function pic(kind, arena, px){
    const key = kind + ':' + (arena || 'classic') + ':' + px; if(cache[key]) return cache[key];
    const [bw, bh] = BOX[kind] || BOX.spike, c = document.createElement('canvas'); c.width = px; c.height = Math.round(px * bh / bw);
    draw(c.getContext('2d'), kind, px / 2, c.height / 2 + (kind === 'main' && px < 260 ? px * 0.06 : 0), px, arena);
    return (cache[key] = c);
  }
  const url = (kind, arena, px) => pic(kind, arena, px).toDataURL('image/png');
  const clear = () => { for(const k in cache) delete cache[k]; };   // after the web fonts arrive
  return {draw, pic, url, clear, SPORT, THEME, BOX};
})();
if(typeof window !== 'undefined') window.PyraLogo = PyraLogo;
/* 🏷️ pd-7 page helpers: every logo follows the picked arena (SET.arena; a match uses arenaKey(M)) */
const PD_LOGO_GROUPS = ['spike', 'strike', 'spark'];
function pdLogoCanvas(kind, arena, cssH, cls){   // a fresh <canvas> copy of the cached picture (one cached picture can't sit in two places)
  const B = PyraLogo.BOX[kind], dpr = Math.min(3, window.devicePixelRatio || 1), w = Math.round(cssH * B[0] / B[1] * dpr);
  const pic = PyraLogo.pic(kind, arena, w), c = document.createElement('canvas');
  c.width = pic.width; c.height = pic.height; c.getContext('2d').drawImage(pic, 0, 0);
  c.className = cls; c.dataset.pdlogo = kind; c.dataset.arena = arena; c.setAttribute('role', 'img');
  c.setAttribute('aria-label', kind === 'wide' || kind === 'main' ? 'PyraDive' : 'Pyra' + PyraLogo.SPORT[kind].name);
  return c;
}
function pdLogoSwap(old, kind, arena, cssH, cls){ const c = pdLogoCanvas(kind, arena, cssH, cls); old.replaceWith(c); return c; }
function pdLogos(){   // title rows (player + menu) + mode-box headers, in the picked arena's colours
  try{
    const ar = SET.arena || 'classic';
    ['scr-player', 'scr-menu'].forEach(id => { const t = document.querySelector('#' + id + ' .title'); if(!t) return;
      const old = t.querySelector('.pd-wordmark');
      if(old && old.dataset.arena === ar) return;
      const c = pdLogoCanvas('wide', ar, 80, 'pd-wordmark');
      old ? old.replaceWith(c) : t.insertBefore(c, t.querySelector('h1')); t.classList.add('has-logo'); });
    PD_LOGO_GROUPS.forEach(g => { const h = document.querySelector('#mode-list .ui-mgroup[data-g="' + g + '"] .ui-mg-h'); if(!h) return;
      const old = h.querySelector('.pd-badge');
      if(old){ if(old.dataset.arena !== ar) pdLogoSwap(old, g, ar, 40, 'pd-badge'); return; }
      const c = pdLogoCanvas(g, ar, 40, 'pd-badge'), tn = h.firstChild;   // draw first: if it fails the emoji stays
      if(tn && tn.nodeType === 3) tn.textContent = tn.textContent.replace(/^\s*\S+\s+/, ' ');   // drop the emoji, keep "PyraSpike"
      h.insertBefore(c, h.firstChild); });
  }catch(e){ console.warn('🏷️ logo', e); }   // the emoji title + icons stay
}
function pdSetupBadge(){   // the sport badge as the setup screen's logo (🏆 cups + 🎯 drills keep their emoji)
  try{
    const box = $('setup-logo'), m = PD.MODES[SET.mode], g = m && !SET.cup ? groupOf(m) : '';
    if(!PD_LOGO_GROUPS.includes(g)) return;
    const ar = m.sport === 'hoop' && (SET.arena || 'classic') === 'classic' ? 'fair' : SET.arena || 'classic';
    const c = pdLogoCanvas(g, ar, 80, 'pd-badge'); box.textContent = ''; box.appendChild(c);   // draw first: if it fails the emoji stays
  }catch(e){ console.warn('🏷️ logo', e); }
}
function pdResultBadge(){   // the sport badge in the result card's corner (match or cup)
  try{
    const card = $('result-card'), cs = SET.cupState, mid = cs && SET.cup ? cs.sport : (G && G.M ? G.M.mode : SET.mode), m = PD.MODES[mid], g = m ? groupOf(m) : '';
    if(!PD_LOGO_GROUPS.includes(g) || !card) return;
    const ar = G && G.M ? arenaKey(G.M) : SET.arena || 'classic';
    card.insertBefore(pdLogoCanvas(g, ar, 64, 'pd-rbadge'), card.firstChild);
  }catch(e){ console.warn('🏷️ logo', e); }
}
if(document.fonts && document.fonts.ready) document.fonts.ready.then(() => {   // redraw once Fredoka has arrived
  try{ PyraLogo.clear(); document.querySelectorAll('canvas[data-pdlogo]').forEach(c => { c.dataset.arena = ''; }); pdLogos(); if(!$('scr-setup').classList.contains('hidden')) pdSetupBadge(); }catch(e){}
});
/* 🏷️ END PyraLogo (pd-7) */
// 🏟️ arenas (pd-4c: all 7 open). 🏖️ Beach mode is always on sand; ⭕ Hoop in the Classic arena = a 🛕 Thai temple-fair square; 🪐 the moon court is floaty (engine ARENA_GRAV)
const ARENAS = [{k: 'classic', icon: '🏟️', name: 'Classic arena'}, {k: 'jungle', icon: '🦖', name: 'Jungle beach'}, {k: 'coral', icon: '🐙', name: 'Coral court'}, {k: 'neon', icon: '🪩', name: 'Neon arena'}, {k: 'robot', icon: '🤖', name: 'Robot gym'}, {k: 'moon', icon: '🪐', name: 'Moon court'}, {k: 'olympus', icon: '☁️', name: 'Olympus'}];
// sky (3 stops) · stands (2) · crowd dot strength · floor / court / takraw court / ⚡ play zone / line colours (missing = the classic colour) · spot = light beams · deco = scenery painter
const ARENA_LOOK = {
  classic: {sky: ['#0A0F26', '#18214A', '#0F1530'], stand: ['#141C44', '#232F66'], crowd: 0.32, spot: 'white'},
  fair: {sky: ['#2A1446', '#6B2D5C', '#E07A3C'], stand: ['#4A2418', '#6E3A22'], crowd: 0.3, spot: '', deco: 'fair', tk: ['#B5774A', '#A86B40'], floor: '#8C5A36', line: '#FFE7B0'},
  jungle: {sky: ['#FF8A5B', '#FFC46B', '#9FD8A6'], stand: ['#4E3A1E', '#6B5230'], crowd: 0.22, spot: '', deco: 'jungle', floor: '#D9BE84', court: ['#A39C88', '#958E7B'], tk: ['#8A9A6A', '#7F8E61'], zone: '#C7A86E', line: '#FFFFFF'},
  coral: {sky: ['#03263B', '#0B4D6E', '#11718D'], stand: ['#0C3A50', '#125269'], crowd: 0.2, spot: 'rays', deco: 'coral', floor: '#1D6A84', court: ['#E9907A', '#DD8270'], tk: ['#3BB3A0', '#33A493'], zone: '#165C75', line: '#E8FBFF'},
  neon: {sky: ['#090320', '#1A0A3C', '#080316'], stand: ['#150934', '#28105C'], crowd: 0.42, spot: 'neon', deco: 'neon', floor: '#0F0A2A', court: ['#2A1660', '#23124F'], tk: ['#1E1458', '#19104A'], zone: '#120C34', line: '#3CF2FF'},
  robot: {sky: ['#1B222D', '#2D3745', '#1F252E'], stand: ['#2A323E', '#394351'], crowd: 0.26, spot: 'white', deco: 'robot', floor: '#4A5563', court: ['#6B7686', '#626C7B'], tk: ['#5F7A6E', '#567064'], zone: '#3E4855', line: '#FFD23F'},
  moon: {sky: ['#010208', '#0A0D20', '#151933'], stand: ['#2A2C3A', '#3B3E52'], crowd: 0.18, spot: '', deco: 'moon', floor: '#85858F', court: ['#B6B6BF', '#ABABB5'], tk: ['#9C9CA8', '#93939F'], zone: '#6C6D7D', line: '#FFFFFF'},
  olympus: {light: true, sky: ['#6FC0FF', '#B2E0FF', '#EAF6FF'], stand: ['#D9D2C2', '#EDE7D9'], crowd: 0.26, spot: 'sun', deco: 'olympus', floor: '#E6E0D2', court: ['#F5EFDD', '#EEE6D0'], tk: ['#D3E5C2', '#C8DCB5'], zone: '#D3CAB4', line: '#D9A93A'}
};
function arenaKey(M){ const k = (M && M.arena) || 'classic'; return k === 'classic' && M && PD.MODES[M.mode] && PD.MODES[M.mode].sport === 'hoop' ? 'fair' : ARENA_LOOK[k] ? k : 'classic'; }
function arenaLook(M){ return ARENA_LOOK[arenaKey(M)]; }
const ACTIONS = [['up', '⬆️ Up'], ['down', '⬇️ Down'], ['left', '⬅️ Left'], ['right', '➡️ Right'], ['touch', '🤚 Touch'], ['drive', '💥 Drive / Dunk'], ['dink', '🪶 Dink'], ['jump', '⬆️ Jump / Block'], ['dive', '🤸 Dive'], ['pyra', '🔥 Pyra']];
const DEFAULT_KEYS = [
  {up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', touch: 'KeyJ', drive: 'KeyK', dink: 'KeyL', jump: 'Space', dive: 'ShiftLeft', pyra: 'KeyF'},
  {up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', touch: 'Numpad1', drive: 'Numpad2', dink: 'Numpad3', jump: 'Numpad0', dive: 'NumpadDecimal', pyra: 'NumpadAdd'}
];
const BTN_SPIKE = [['pyra', '🔥', 'Pyra'], ['jump', '⬆️', 'Jump'], ['dink', '🪶', 'Dink'], ['dive', '🤸', 'Dive'], ['touch', '🤚', 'Touch'], ['drive', '💥', 'Dunk']];
const BTN_STRIKE = [['pyra', '🔥', 'Pyra'], ['jump', '⬆️', 'Jump'], ['dink', '🦶', 'Tip'], ['dive', '🤸', 'Dive'], ['touch', '🦵', 'Trap'], ['drive', '💥', 'Strike']];   // 🦶 PyraStrike: no hands · 📱 pd-5b: Strike, not Spike (Aowu)
const BTN_HOOP = [['pyra', '🔥', 'Pyra'], ['jump', '⬆️', 'Jump'], ['dink', '🦶', 'Heel'], ['dive', '🤸', 'Lunge'], ['touch', '🦵', 'Pass'], ['drive', '⭕', 'Shoot']];   // ⭕ hoop takraw
const BTN_JUGGLE = [['jump', '⬆️', 'Jump'], ['dive', '🤸', 'Lunge'], ['touch', '🦵', 'Keep up']];   // 🤹 keepy-up: every key keeps it up
const BTN_SPARK = [['pyra', '🔥', 'Pyra'], ['jump', '⬆️', 'Jump'], ['dink', '🪶', 'Dink'], ['dive', '🤸', 'Lunge'], ['touch', '🦵', 'Trap'], ['drive', '⚡', 'Drive']];   // ⚡ PyraSpark (L + K = 💥 Edge)
let BTN = BTN_SPIKE;
const TEAM_COL = ['#FF6B1A', '#2F7BEA'];
const WORDS = {bump: '🤚 Bump', set: '🙌 Set!', dig: '🛡️ Dig!', dive: '🤸 Dive!', dunk: '💥 DUNK!', dink: '🪶 Dink', drive: '🚀 Drive!'};
const WORDS_STRIKE = {bump: '🦵 Trap', set: '🙆 Head set!', dig: '🦶 Toe save!', dive: '🤸 Dive!', dunk: '🌀 ROLL STRIKE!', bicycle: '🚲 BICYCLE!', dink: '🦶 Heel tip', drive: '🦶 Kick!'};
function isHoop(M){ return !!(M && M.sp.sport === 'hoop'); }
const GOAL_HOOP = {jkeep: ['🤹 Keep it up! Foot · knee · head — switch for bonus points', 'J'], htoss: ['⭕ Tap 🦵 to toss the ball up', 'J'], hpass: ['🦵 Keep it up — pass it to a friend!', 'J'], hshoot: ['⭕ Kick it THROUGH the hoop! (or 🦵 pass)', 'K']};
const WORDS_SPARK = {bump: '🦵 Trap', set: '⬆️ Pop!', dig: '🦶 Dig!', dive: '🤸 Dive!', dunk: '⚡ SPARK SMASH!', dink: '🪶 Dink', drive: '⚡ Drive!', edge: '💥 Edge shot!'};
const DRILL_WHY = ['zaim', 'ctrap', 'cpop', 'csmash', 'jkeep'];
const GOAL_SPARK = {zaim: ['🎯 Send it into the glowing zone!', 'K'], ctrap: ['🔗 1 · Trap it — tap 🦵', 'J'], cpop: ['🔗 2 · Pop it up — tap 🦵 again', 'J'], csmash: ['🔗 3 · SMASH it — tap ⚡ while it is high!', 'K'], serve: ['⚡ Your serve! Tap ⚡ — land it on THEIR half', 'K'], sbounce: ['⏳ Let it bounce on your half of the table…', ''], strap: ['🦵 Trap it up!', 'J'], ssend: ['⚡ Send it back onto their half!', 'K']};
function wordOf(M, e){ if(PD.isSpark(M)) return e.edgeTry ? WORDS_SPARK.edge : WORDS_SPARK[e.k]; return PD.isStrike(M) ? (e.style === 'bicycle' ? WORDS_STRIKE.bicycle : WORDS_STRIKE[e.k]) : WORDS[e.k]; }
const WHY = {four: '4 touches! Only 3 a side', double: 'Double touch! The same player twice', net: 'Touched the net!', out: 'Out!', drop: 'It dropped!', in: 'In!', kill: 'Kill!', ace: 'Ace!', stuff: 'Stuff block!'};
const GOAL_STRIKE = {block: ['🧱 They strike — Jump to BLOCK it!', 'Space'], toss: ['🧺 You toss! Tap 🦵 — throw it up to your server', 'J'], serve: ['🦶 Your serve! Tap 💥 — your buddy tosses, you kick', 'K'], bump: ['🦵 Trap it up with your thigh!', 'J'], set: ['🙆 Head it up high!', 'J'], dig: ['🦶 Toe save! Get a foot under it', 'J'], dunk: ['💥 Jump and STRIKE it over!', 'K']};
const GOAL = {block: ['🧱 They spike — Jump to BLOCK it!', 'Space'], serve: ['🚀 Your serve! Tap 💥', 'K'], serveAll: ['🚀 Serve:'], bump: ['🤚 Bump it up to your setter!', 'J'], set: ['🙌 Set it up high!', 'J'], dig: ['🛡️ Dig! Save the low ball', 'J'], dunk: ['💥 Jump and DUNK it over the net!', 'K']};

/* ================= STATE ================= */
let S = {players: [], progress: {}, settings: {}, avatars: {}, player: '', age: ''};
let SET = {control: 'ball', mode: 'beach', level: 0, who: 'robot', p2: '', arena: 'classic', marker: true, cup: '', cupSport: 'beach', cupState: null};
let G = null, lockHandle = null, KEYS = null, RAF = 0;
const GC_LISTEN = [], GC_LOG = [];
function store(k){ return 'sp_pyradive_' + k + ':' + (S.player || ''); }
function ls(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }
function loadPrefs(){ try{ const p = JSON.parse(ls(store('prefs')) || '{}'); if(PD.MODES[p.mode]) SET.mode = p.mode; if(ARENAS.some(a => a.k === p.arena)) SET.arena = p.arena; SET.cup = CUPS[p.cup] ? p.cup : ''; SET.cupKind = CUPS[p.cupKind] ? p.cupKind : SET.cup || 'cupfour'; if(CUP_SPORTS.includes(p.cupSport)) SET.cupSport = p.cupSport; if(['robot', 'team', 'duo'].includes(p.who)) SET.who = p.who; if(p.marker === false) SET.marker = false; if(p.control === 'one') SET.control = 'one'; if(p.p2) SET.p2 = p.p2; }catch(e){} }
function savePrefs(){ ls(store('prefs'), JSON.stringify({control: SET.control, mode: SET.mode, arena: SET.arena, who: SET.who, marker: SET.marker, p2: SET.p2, cup: SET.cup || '', cupKind: SET.cupKind || '', cupSport: SET.cupSport || ''})); }
function myAvatar(name){ const a = S.avatars[name]; return a ? fixAv(a) : defaultAvatar(name || 'player'); }
// 🏐 on court nobody rides a ride-on or holds an item (Aowu 2026-11-14 "remove ride on when play"); pets + trails stay home too
function playAv(av){ const a = JSON.parse(JSON.stringify(av || {})); a.eq = Object.assign({}, a.eq || {}); delete a.eq.ride; delete a.eq.hand; delete a.eq.pet; delete a.eq.trail; return a; }

/* ================= 💥 COMICS + 📣 CROWD HOOKS (for the 💥 Comics chat and the 📣 Cheer chat — the game draws no comics itself) =================
   GameComic.listen(fn) → fn('pyraspike', event, M) for EVERY engine event (names: plan §18) · .log() = this match's events
   .hold(true|false) freezes the live loop quietly (drawing goes on) · .area() = #stage · .mode() = 'pyraspike' | null
   Slots: #comics-slot-menu (level page) · #comics-slot-setup (setup ⚙️ Extras) · #comic-strip-slot (result card). */
window.GameComic = {
  listen(fn){ GC_LISTEN.push(fn); return () => { const i = GC_LISTEN.indexOf(fn); if(i >= 0) GC_LISTEN.splice(i, 1); }; },
  log(){ return GC_LOG.slice(); },
  hold(on){ if(G) G.held = !!on; },
  area(){ return $('stage'); },
  mode(){ return G && !G.over ? GAME_ID : null; },
  state(){ return G ? G.M : null; }
};

/* ================= MENUS ================= */
function showScreen(name){
  ['player', 'menu', 'setup', 'play'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
  $('back-btn').classList.toggle('hidden', name === 'play'); UI.navScreen($('back-btn'), name, NAV_INNER); window.scrollTo(0, 0);
}
function progressOf(name){ return S.progress[name] || {unlocked: 0, tokens: [], best: []}; }
function canPlay(i){ const p = progressOf(S.player); if(i === 5) return p.unlocked >= 5; if(i === 4) return p.unlocked >= 4; return i <= Math.max(p.unlocked, AGE_START[S.age] || 0); }
function renderPlayers(){
  pdLogos();   // 🏷️ pd-7
  const box = $('player-list'); box.innerHTML = '';
  if(!S.players.length){ box.innerHTML = '<div class="empty">No players yet — add one on the Dashboard first.</div>'; return; }
  S.players.forEach(p => { const b = document.createElement('button'); b.className = 'pick'; b.setAttribute('data-sound', 'pop');
    const c = document.createElement('canvas'); c.width = 144; c.height = 168; b.appendChild(c);
    b.insertAdjacentHTML('beforeend', '<div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age ? p.Age + ' yrs' : '') + '</div>');
    drawPreviewCanvas(c, myAvatar(p.Name), {name: p.Name, t: 1});
    b.onclick = () => choosePlayer(p.Name); box.appendChild(b); });
}
function choosePlayer(name){
  UI.rememberTheme(name, UI.applyTheme(UI.themeFor(S.settings, name), {kitOnly: true}));
  const p = S.players.find(x => x.Name === name); S.player = name; S.age = p ? p.Age : '';
  loadPrefs(); KEYS = loadKeys(); $('who-name').textContent = name; if(window.Cheer){ Cheer.chip($('cheer-chip'), name); Cheer.langChip($('cheer-lang'), name); } /* 📣 cs-pd */
  bestiaryCount(); if(window.SpiritBestiary) SpiritBestiary.load(name).then(bestiaryCount);   // 📖 found creatures (this device + the server)
  if(S.looksSrv && !S.looksSrv[name] && ['ball', 'table', 'bomb'].some(k => ls(lookKey(k, name)) != null)) saveLooks();   // 🎨 pd-4e: picks made before pd-4e go up once
  const ml = UI.modeLink ? UI.modeLink(MODE_LINK) : '';
  if(ml && modeInfo(ml)) pickMode(ml);
  renderMenu(); showScreen('menu'); msAlso();
  if(ml && modeInfo(ml)){ UI.toast(modeInfo(ml).icon + ' ' + modeInfo(ml).name + ' — now pick a level'); if(UI.modePoint) UI.modePoint($('level-list')); }
}
/* ✨ MODE SPOTLIGHT (built in, pd-1): ?mode=<id> opens that mode ONCE (UI.modeLink, in choosePlayer) · ✨ Also try banner under the
   title · UI.modeTried when a match starts (startMatch). MODES_ rows in Code.gs: pyraspike beach / small / full. */
function msNow(){ return curMode(); }
function msOpen(id){ if(!modeInfo(id)) return; pickMode(id); if(UI.modePoint) UI.modePoint($('level-list')); }
function msAlso(){ if(UI.alsoTry) UI.alsoTry({player: S.player, game: GAME_ID, at: () => document.querySelector('#scr-menu .title'), current: msNow, noDrop: true, open: msOpen}); }
function changePlayer(){ renderPlayers(); showScreen('player'); }
function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">No win yet</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span><span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }
function renderMenu(){
  const ml = $('mode-list');
  if(!ml.children.length) UI.modeGroups(ml, MODE_GROUPS, mgList(), {next: () => $('level-head'), onPick: k => { pickMode(k); return false; }});
  markModes(); renderLevels(); pdLogos();   // 🏷️ pd-7
  pdLeaders($('leaders'), S.player);
}
/* 🏆 pd-3c (Aowu 2026-11-14): ONE PyraDive leaderboard, a column per sport — 🏐 Spike · 🦶 Strike · ⭕ Hoop · ⚡ Spark.
   Same rows + Leader points as UI.leaders (server getGameLeaders); each player's best per sport comes from `ways`
   (best score per Theme head = mode icon + name). 👑 = the family's best in that sport. Tap a sport header to rank by it. */
const SPORT_COLS = [{k: 'spike', icon: '🏐', name: 'Spike'}, {k: 'strike', icon: '🦶', name: 'Strike'}, {k: 'hoop', icon: '⭕', name: 'Hoop'}, {k: 'spark', icon: '⚡', name: 'Spark'}, {k: 'train', icon: '🎯', name: 'Drills'}, {k: 'fun', icon: '🏆', name: 'Cups'}];   // pd-4a: + 🎯 drills · pd-4b: 🏆 cups + 🌀 party
function colOf(m){ return m.drill ? 'train' : m.party ? 'fun' : m.sport; }
const LB = {data: null, sort: ''};
function sportOfHead(h){ h = String(h || '').trim(); for(const k in CUPS) if(h === CUPS[k].icon + ' ' + CUPS[k].name) return {party: true, cup: true}; for(const k in PD.MODES){ const m = PD.MODES[k]; if(h === m.icon + ' ' + m.name) return m; } return null; }
function sportBests(m){ const out = {}; SPORT_COLS.forEach(c => { out[c.k] = {best: 0, plays: 0, modes: []}; });
  Object.keys(m.ways || {}).forEach(h => { const md = sportOfHead(h), w = m.ways[h]; if(!md || !out[colOf(md)]) return; const o = out[colOf(md)];
    o.plays += w.plays || 0; if((w.best || 0) > o.best) o.best = w.best || 0; o.modes.push(h + (w.best ? ' 🏆 ' + Number(w.best).toLocaleString() : '') + ' (' + (w.plays || 0) + ')'); });
  return out; }
function pdLeaders(el, me){
  if(!el) return;
  if(!window.google || !google.script || !google.script.run){ if(window.UI && UI.leaders) UI.leaders(el, GAME_ID, me); return; }
  if(!el.innerHTML) el.innerHTML = '<div class="uil-card"><div class="uil-h">🏆 Who played PyraDive</div><div class="uil-load"><span class="ui-spin a-bounce">🏐</span> Counting the champions…</div></div>';
  google.script.run.withSuccessHandler(d => { LB.data = d; LB.me = me; drawLeaders(el); }).withFailureHandler(() => { if(window.UI && UI.leaders) UI.leaders(el, GAME_ID, me); else el.innerHTML = ''; }).getGameLeaders(GAME_ID);
}
function drawLeaders(el){
  const d = LB.data, me = LB.me, esc = UI.esc || (x => String(x));
  const list = ((d && d.players) || []).map(m => Object.assign({}, m, {sp: sportBests(m)}));
  if(!list.length){ el.innerHTML = '<div class="uil-card"><div class="uil-h">🏆 Who played PyraDive</div><div class="uil-none">Nobody yet — be the first champion! 🚀</div></div>'; return; }
  const top = {}; SPORT_COLS.forEach(c => { top[c.k] = Math.max(0, ...list.map(m => m.sp[c.k].best)); });
  const rows = list.slice(), rankByPts = list.map(m => m.name);
  if(LB.sort) rows.sort((a, b) => b.sp[LB.sort].best - a.sp[LB.sort].best || b.total - a.total);
  const head = '<div class="pdl-row pdl-head"><span></span><span></span><span class="pdl-hn">' + (LB.sort ? 'Ranked by ' + SPORT_COLS.find(c => c.k === LB.sort).icon + ' best' : 'Ranked by points') + '</span><span class="pdl-cols">'
    + SPORT_COLS.map(c => '<button class="pdl-hc' + (LB.sort === c.k ? ' on' : '') + '" data-k="' + c.k + '" data-sound="pop" title="Rank by ' + c.name + '"><b>' + c.icon + '</b>' + c.name + '</button>').join('') + '</span><span class="pdl-hp">points</span></div>';
  const row = (m, i) => { const pi = rankByPts.indexOf(m.name), medal = LB.sort ? (i + 1) + '.' : (['🥇', '🥈', '🥉'][i] || (i + 1) + '.'), lv = '●'.repeat(Math.min(5, m.levels)) + '○'.repeat(Math.max(0, 5 - m.levels)) + (m.hardcore ? ' 💀' : '');
    const cells = SPORT_COLS.map(c => { const o = m.sp[c.k], king = o.best > 0 && o.best === top[c.k];
      return '<span class="pdl-c' + (o.plays ? '' : ' none') + (king ? ' king' : '') + '" data-sport="' + c.k + '" title="' + esc(c.icon + ' ' + c.name + (o.modes.length ? ': ' + o.modes.join(' · ') : ': not played yet')) + '"><b>' + c.icon + '</b>'
        + (o.best ? Number(o.best).toLocaleString() : o.plays ? '0' : '—') + (king ? '<i>👑</i>' : '') + '</span>'; }).join('');
    return '<div class="pdl-row uil-row' + (m.name === me ? ' me' : '') + (pi === 0 ? ' lead' : '') + '"><span class="uil-rank">' + medal + '</span><canvas class="uil-av" width="72" height="72" data-n="' + esc(m.name) + '"></canvas>'
      + '<span class="uil-nm">' + esc(m.name) + (pi === 0 ? ' <b class="uil-crown">👑 Leader</b>' : '') + '<small>' + lv + ' · ' + m.plays + ' game' + (m.plays === 1 ? '' : 's') + '</small></span>'
      + '<span class="pdl-cols">' + cells + '</span><span class="uil-pts"><b>' + Number(m.total).toLocaleString() + '</b><small>points</small></span></div>'; };
  el.innerHTML = '<div class="uil-card pdl-card"><div class="uil-h">🏆 Who played PyraDive <small>One board for every sport · 👑 = best in that sport · tap a sport to rank by it</small></div>' + head + rows.map(row).join('') + '</div>';
  el.querySelectorAll('.pdl-hc').forEach(b => b.onclick = () => { LB.sort = LB.sort === b.dataset.k ? '' : b.dataset.k; drawLeaders(el); });
  el.querySelectorAll('canvas.uil-av').forEach(c => { const m = list.find(x => x.name === c.dataset.n), g = c.getContext('2d');
    try { if(typeof drawPreviewCanvas === 'function' && typeof fixAv === 'function'){ const big = document.createElement('canvas'); big.width = 120; big.height = 140; drawPreviewCanvas(big, m.avatar ? Object.assign(fixAv(m.avatar), {eq: {}}) : defaultAvatar(m.name), {name: m.name, t: 1}); g.drawImage(big, 28, 14, 64, 64, 0, 0, 72, 72); return; } } catch(e){}
    g.fillStyle = '#FF8FB1'; g.beginPath(); g.arc(36, 36, 34, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '700 34px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(m.name.charAt(0).toUpperCase(), 36, 38); });
}
function markModes(){ const k = curMode(), m = modeInfo(k); $('mode-list').querySelectorAll('.ui-mbtn').forEach(b => b.classList.toggle('on', b.dataset.k === k)); $('level-head').textContent = 'Pick a level — ' + m.icon + ' ' + m.name; }
/* 🎯 pd-4a: level cards + setup lines for the drills and 🌀 Spark Party */
const DRILL_BLURB = ['The ball waits for you — press the glowing button.', 'A bit faster. Lots of aim help.', 'Normal speed. A little aim help.', 'Fast — aim it yourself.', 'Faster, smaller zones.', 'Fastest. ×3 points.'];
const DRILL_GOAL = {zone: '🎯 Hit the glowing zone = 3 · any hit on their half = 1', combo: '🔗 Trap → Pop → ⚡ Smash = 5 · 3 touches = 2 · any return = 1', run: '🏃 Every return = 1 · the ball gets faster · a miss costs a ❤️', juggle: '🤹 Every touch = 1 · switch foot / knee / head = +1 · every 10 in a row = +5'};
function levelGoal(mode, i){ if(mode === 'cups') mode = SET.cup || 'cupfour'; if(CUPS[mode]) return CUPS[mode].n + ' teams · ' + Math.log2(CUPS[mode].n) + ' wins = 🏆 · first to ' + CUP_TARGET[i]; const m = PD.MODES[mode], L = PD.LEVELS[i]; if(m.drill){ const D = PD.DRILL[m.drill]; return [D.time ? '⏱️ ' + D.time[i] + ' s' : '', D.lives ? '❤️ ' + D.lives[i] : '', '⭐ ' + D.stars[i].join(' / ')].filter(Boolean).join(' · '); }
  if(m.party) return 'first to ' + PD.PARTY.target[i] + ' · ' + PD.PARTY.balls[i] + ' extra balls'; return L.sets === 3 ? 'best of 3 sets to ' + L.target : 'first to ' + L.target; }
function levelBlurb(mode, i){ if(CUPS[mode] || mode === 'cups') return LEVEL_UI[i].blurb.replace(/ (First to|Best of) [^.]*\./, ''); const m = PD.MODES[mode]; return m.drill ? DRILL_BLURB[i] : LEVEL_UI[i].blurb; }
function renderLevels(){
  const box = $('level-list'); box.innerHTML = ''; const p = progressOf(S.player), rec = AGE_START[S.age];
  PD.LEVELS.forEach((L, i) => {
    const U = LEVEL_UI[i], open = canPlay(i), done = p.unlocked > i, b = document.createElement('button');
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (U.hardcore ? ' hardcore' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none'); b.dataset.lv = i;
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + U.emoji + '</div><div class="nm">' + L.name + '</div><div class="learn">' + levelGoal(curMode(), i) + '</div><div class="sub">' + (U.hardcore && !open ? '🔒 Beat Extreme to open 💀 Hardcore' : levelBlurb(curMode(), i)) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore' : i === 4 ? 'Win on Hard to unlock Extreme!' : 'Win the level before to unlock it'); return; } openSetup(i); };
    box.appendChild(b);
  });
}

/* ================= SETUP ================= */
function others(){ return S.players.map(p => p.Name).filter(n => n !== S.player); }
function openSetup(lvl){
  if(SET.cup) return openCupSetup(lvl);
  SET.level = lvl; const sp = PD.MODES[SET.mode], L = PD.LEVELS[lvl];
  if(LEVEL_UI[lvl].hardcore) SET.who = 'robot';
  if(SET.who !== 'robot' && !others().length) SET.who = 'robot';
  if(!SET.p2 || !others().includes(SET.p2)) SET.p2 = others()[0] || '';
  $('setup-logo').textContent = sp.icon; $('setup-title').textContent = sp.name + ' · ' + L.name; pdSetupBadge();   // 🏷️ pd-7
  $('setup-sub').textContent = sp.drill ? DRILL_GOAL[sp.drill] + ' · ' + levelGoal(SET.mode, lvl) : sp.party ? '🌀 ' + levelGoal(SET.mode, lvl) + ' · every ball that lands on their half counts · ' + LEVEL_UI[lvl].blurb : (L.sets === 3 ? 'Best of 3 sets to ' + L.target : 'First to ' + L.target) + ' points · 3 touches a side · ' + LEVEL_UI[lvl].blurb;
  buildWho(); buildCtl(); buildTeams(); buildArenas();
  const mc = () => { $('aim-chip').textContent = '🎯 Landing marker: ' + (SET.marker ? 'on' : 'off'); $('aim-chip').classList.toggle('on', SET.marker); };
  mc(); $('aim-chip').onclick = () => { SET.marker = !SET.marker; savePrefs(); mc(); };
  $('go-btn').onclick = () => startMatch();
  showScreen('setup');
}
function buildWho(){
  const hc = !!LEVEL_UI[SET.level].hardcore, row = $('who-row'), none = !others().length;
  const solo = PD.MODES[SET.mode].n === 1; if(solo && SET.who === 'team') SET.who = 'robot';   // 🦶 1v1: one seat a side
  if(PD.MODES[SET.mode].drill){ SET.who = 'robot'; row.innerHTML = '<button class="chip on" data-k="robot" data-sound="tap">🧑‍🏫 Me + the Coach</button>'; return; }   // 🎯 drills: you train alone
  const list = [['robot', solo ? '🤖 Me vs a robot' : '🤖 Me + robots'], ['team', '🤝 2 players, same team'], ['duo', '⚔️ 2 players, against each other']];
  row.innerHTML = list.map(([k, n]) => '<button class="chip' + (SET.who === k ? ' on' : '') + ((hc || none || (solo && k === 'team')) && k !== 'robot' ? ' lock' : '') + '" data-k="' + k + '" data-sound="tap">' + n + '</button>').join('');
  row.querySelectorAll('.chip').forEach(b => b.onclick = () => { const k = b.dataset.k;
    if(k === 'team' && PD.MODES[SET.mode].n === 1){ UISound.play('error'); UI.toast('🦶 1v1 has one player a side — pick ⚔️ against each other'); return; }
    if(k !== 'robot' && (hc || none)){ UISound.play('error'); UI.toast(hc ? '💀 Hardcore is you against the robots' : 'Add a second player on the Dashboard first'); return; }
    SET.who = k; savePrefs(); row.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); buildCtl(); buildTeams(); });
}
// 🎮 pd-8a: how you play a team match — 🎮 Ball control (default: you move whoever plays the ball next) · 🧍 One player (one seat, serve turns go round)
function ctlShown(){ const sp = PD.MODES[SET.mode]; return !!(sp && PD.CTL_SPORT[sp.sport] && sp.n >= 2 && !sp.drill && !sp.party && SET.who !== 'team'); }
function buildCtl(){
  const row = $('ctl-row'), note = $('ctl-note'); if(!row) return;
  if(!ctlShown()){ row.innerHTML = ''; row.classList.add('hidden'); note.classList.add('hidden'); return; }
  row.classList.remove('hidden'); note.classList.remove('hidden');
  const list = [['ball', '🎮 Ball control'], ['one', '🧍 One player']];
  row.innerHTML = list.map(([k, n]) => '<button class="chip' + (SET.control === k ? ' on' : '') + '" data-k="' + k + '" data-sound="tap">' + n + '</button>').join('');
  const say = () => { note.textContent = SET.control === 'one' ? '🧍 You stay one player · everybody takes turns to serve' : '🎮 You move whoever plays the ball next — serve, bump, set, spike · robots move the rest'; };
  say();
  row.querySelectorAll('.chip').forEach(b => b.onclick = () => { SET.control = b.dataset.k; savePrefs(); row.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); say(); });
}
function pinsOf(name){ try{ return window.SpiritBestiary && SpiritBestiary.pins ? SpiritBestiary.pins(name) : null; }catch(e){ return null; } }   // ⭐ pd-4b favourite creatures
function teamsCfg(){
  const n = PD.MODES[SET.mode].n, fam = others().filter(x => x !== SET.p2).sort(() => Math.random() - 0.5);
  let fi = 0; const bot = i => { const nm = fam[fi++]; return nm ? {name: nm, av: playAv(myAvatar(nm)), robot: true} : {name: 'Robo-' + (i + 1), av: playAv(defaultAvatar('robo' + i)), robot: true}; };
  const t0 = [{name: S.player, av: playAv(myAvatar(S.player)), human: 1, pins: pinsOf(S.player)}], t1 = [];
  if(PD.MODES[SET.mode].drill) return [t0, [{name: 'Coach', av: playAv(defaultAvatar('coach')), robot: true}]];   // 🧑‍🏫 the Coach feeds you
  if(SET.who === 'team' && SET.p2) t0.push({name: SET.p2, av: playAv(myAvatar(SET.p2)), human: 2, pins: pinsOf(SET.p2)});
  if(SET.who === 'duo' && SET.p2) t1.push({name: SET.p2, av: playAv(myAvatar(SET.p2)), human: 2, pins: pinsOf(SET.p2)});
  let i = 0; while(t0.length < n) t0.push(bot(i++)); while(t1.length < n) t1.push(bot(i++));
  return [t0, t1];
}
function buildTeams(){
  const box = $('team-box'); SET.cfg = teamsCfg();
  const M = PD.newMatch({mode: SET.mode, level: SET.level, seed: 1, teams: SET.cfg});
  const seat = p => '<div class="seat' + (p.human === 1 ? ' me' : p.human === 2 ? ' p2' : ' bot') + '"' + (p.human === 2 ? ' data-p2="1" title="Tap to change"' : '') + '><canvas width="96" height="112" data-av="' + UI.esc(p.name) + '"></canvas><div class="nm">' + (p.human ? '' : '🤖 ') + UI.esc(p.name) + '</div><div class="rl">' + p.roles.map(r => PD.ROLE_ICON[r]).join('') + '</div></div>';
  const tm = t => '<div class="team t' + t + '"><div class="team-h">' + (t === 0 ? (PD.MODES[SET.mode].drill ? '🎯 You' : '🔥 Your team') : PD.MODES[SET.mode].drill ? '🧑‍🏫 Coach' : SET.who === 'duo' ? '⚔️ ' + UI.esc(SET.p2) + '\'s team' : '🤖 Robots') + '</div>' + M.players.filter(p => p.team === t).map(seat).join('') + '</div>';
  box.innerHTML = '<div class="teams">' + tm(0) + '<div class="vs">' + (PD.MODES[SET.mode].drill ? '🎯' : 'VS') + '</div>' + tm(1) + '</div>' + (LEVEL_UI[SET.level].hardcore ? '<div class="hc-note">💀 Hardcore: the fastest ball and the sharpest robots. ×3 points.</div>' : '')
    + (SET.who !== 'robot' ? '<div class="note" style="margin-top:8px">⌨️ ' + UI.esc(S.player) + ': W A S D + J K L · ' + UI.esc(SET.p2) + ': arrows + numpad 1 2 3 · tap ' + UI.esc(SET.p2) + ' to change</div>' : '');
  box.querySelectorAll('canvas[data-av]').forEach(c => { const p = M.players.find(q => q.name === c.dataset.av); drawPreviewCanvas(c, p ? p.av || myAvatar(p.name) : defaultAvatar('x'), {name: c.dataset.av, t: 1}); });
  const p2 = box.querySelector('[data-p2]'); if(p2) p2.onclick = () => { const o = others(); SET.p2 = o[(o.indexOf(SET.p2) + 1) % o.length]; savePrefs(); buildTeams(); };
}
function buildArenas(){
  const box = $('arena-list');
  box.innerHTML = ARENAS.map(a => '<button class="arena' + (a.k === SET.arena ? ' on' : '') + (a.soon ? ' soon' : '') + '" data-k="' + a.k + '" data-sound="tap"><canvas width="300" height="225"></canvas><div class="nm">' + a.icon + ' ' + a.name + '</div></button>').join('');
  box.querySelectorAll('.arena').forEach(b => { const a = ARENAS.find(x => x.k === b.dataset.k); paintArenaPreview(b.querySelector('canvas'), a.k);
    b.onclick = () => { SET.arena = a.k; savePrefs(); pdSetupBadge(); pdLogos(); /* 🏷️ pd-7 */ box.querySelectorAll('.arena').forEach(x => x.classList.toggle('on', x === b)); if(a.k === 'moon') UI.toast('🪐 Moon court: the ball floats — slow and high!'); }; });
  buildLooks();
}

/* ================= 🎨 LOOKS (pd-4c): 🎱 ball · 🏓 table · 💣 party balls — picked per player on this device ================= */
// ball = BallSkins (Collection 🎱 line, shared with Pinball / SlaBrall / BlasOff) · table = 🆕 TableSkins (Collection 🏓 line) · party balls = BombSkins (your 💣 Soul Bopper bombs)
// 🏭 Artifactory crafts count too (balls, boards / stands / signs / frames, bowls / lanterns …) — the family shares crafts.
const LOOKS = {ball: '', table: 'classic', bomb: ''};
function lookKey(kind, name){ return 'sp_pyradive_' + kind + ':' + (name || S.player); }
function ownBalls(name){ const n = Math.min((typeof BallSkins !== 'undefined') ? BallSkins.count : 0, Number((S.ballSkins || {})[name]) || 0), out = ['']; for(let i = 0; i < n; i++) out.push(String(i)); if((typeof BallSkins !== 'undefined') && BallSkins.artList) BallSkins.artList().forEach(a => out.push('art:' + a.id)); return out; }
function ownTables(name){ return (typeof TableSkins !== 'undefined') ? TableSkins.owned(Number((S.tableSkins || {})[name]) || 0) : ['classic']; }
function ownBombs(name){ if(!(typeof BombSkins !== 'undefined')) return ['']; const b = (S.bombs || {})[name] || {}; return [''].concat(BombSkins.owned({themes: b.themes || {}, extras: b.extras || []})); }
function lookOwned(kind, name){ return kind === 'ball' ? ownBalls(name) : kind === 'table' ? ownTables(name) : ownBombs(name); }
function lookGet(kind, name){ name = name || S.player; const own = lookOwned(kind, name), v = ls(lookKey(kind, name)); const def = kind === 'table' ? 'classic' : ''; return v != null && own.indexOf(v) >= 0 ? v : def; }
function lookSet(kind, v){ ls(lookKey(kind, S.player), v); LOOKS[kind] = v; saveLooks(); }
// 🎨 pd-4e: looks follow the PLAYER (Aowu 2026-11-14) — the server row PyraLooks_<Name> wins at start; every pick is saved to it. This device keeps a copy (offline + instant).
function seedLooks(all){ S.looksSrv = all || {}; Object.keys(S.looksSrv).forEach(n => { const o = S.looksSrv[n] || {}; ['ball', 'table', 'bomb'].forEach(k => { if(typeof o[k] === 'string') ls(lookKey(k, n), o[k]); }); }); }
function saveLooks(){ const n = S.player; if(!n || !window.google || !google.script || !google.script.run) return; const o = {ball: ls(lookKey('ball', n)) || '', table: ls(lookKey('table', n)) || 'classic', bomb: ls(lookKey('bomb', n)) || ''}; (S.looksSrv || (S.looksSrv = {}))[n] = o; google.script.run.withFailureHandler(() => {}).savePyraLooks(n, o); }
function loadLooks(){ ['ball', 'table', 'bomb'].forEach(k => { LOOKS[k] = lookGet(k); }); }
function ballV(v){ return v === '' || v == null ? null : /^\d+$/.test(v) ? Number(v) : v; }
function lookName(kind, v){
  if(kind === 'ball'){ const b = ballV(v); if(b == null) return 'Classic'; if(typeof b === 'number') return (BallSkins.NAMES || [])[b] || 'Skin ' + (b + 1); const a = BallSkins.artOf ? BallSkins.artOf(b) : null; return a ? (a.n || 'Crafted ball').replace(/^✨ /, '') : 'Crafted ball'; }
  if(kind === 'table') return TableSkins.nameOf(v);
  return v ? BombSkins.nameOf(v) : 'Star balls';
}
function paintLook(c, kind, v){
  const g = c.getContext('2d'), W = c.width, H = c.height; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  if(kind === 'table'){ TableSkins.preview(c, v); return; }
  if(kind === 'ball'){ const b = ballV(v); if(b == null){ const spr = PD.isStrike({sp: PD.MODES[SET.mode]}) ? takrawSprite(W * 0.7) : PD.MODES[SET.mode].sport === 'spark' ? sparkSprite(W * 0.7) : ballSprite(W * 0.7); g.drawImage(spr, (W - spr.width) / 2, (H - spr.height) / 2); } else BallSkins.draw(g, b, W / 2, H / 2, W * 0.36, 1); return; }
  if(!v){ const spr = partySprite(W * 0.7, 0); g.drawImage(spr, (W - spr.width) / 2, (H - spr.height) / 2); return; }
  BombSkins.draw(g, v, W / 2, H / 2, W * 0.8, 1);
}
const LOOK_KINDS = {ball: ['🎱', 'Ball', 'Your 🎱 ball skins from Pinball, SlaBrall, BlasOff + balls you crafted. Everyone in the match plays with it.'],
  table: ['🏓', 'Table', 'Play ⚡ PyraSpark to unlock 🏓 table looks (🎒 Collection). Every board, stand, sign or frame you craft in 🏭 Artifactory becomes a table top!'],
  bomb: ['💣', 'Party balls', 'The extra balls in 🌀 Spark Party wear your 💣 Soul Bopper bombs.']};
function buildLooks(){
  const row = $('look-row'); if(!row) return; loadLooks();
  const sp = PD.MODES[SET.mode] || {}, kinds = ['ball'].concat(sp.sport === 'spark' ? ['table'] : []).concat(SET.mode === 'party' ? ['bomb'] : []);
  row.innerHTML = kinds.map(k => '<button class="pdk-chip" data-look="' + k + '" data-sound="pop"><canvas width="60" height="60"></canvas>' + LOOK_KINDS[k][0] + ' ' + UI.esc(lookName(k, LOOKS[k])) + '</button>').join('');
  row.querySelectorAll('[data-look]').forEach(b => { paintLook(b.querySelector('canvas'), b.dataset.look, LOOKS[b.dataset.look]); b.onclick = () => openLooks(b.dataset.look); });
}
let LOOK_OPEN = '';
function openLooks(kind){
  LOOK_OPEN = kind; const K = LOOK_KINDS[kind], own = lookOwned(kind, S.player), cur = LOOKS[kind];
  $('look-title').textContent = K[0] + ' ' + K[1] + ' — ' + S.player; $('look-note').textContent = K[2];
  const grid = $('look-grid');
  grid.innerHTML = own.map(v => '<button class="pdk-opt' + (v === cur ? ' on' : '') + '" data-v="' + UI.esc(v) + '" data-sound="tap"><canvas width="96" height="96"></canvas>' + UI.esc(lookName(kind, v)) + '</button>').join('')
    + (kind !== 'bomb' ? '<button class="pdk-opt craft" data-craft="1" data-sound="pop">✨ Craft one in 🏭 Artifactory</button>' : '');
  grid.querySelectorAll('[data-v]').forEach(b => { paintLook(b.querySelector('canvas'), kind, b.dataset.v); b.onclick = () => { lookSet(kind, b.dataset.v); grid.querySelectorAll('.pdk-opt').forEach(x => x.classList.toggle('on', x === b)); buildLooks(); }; });
  const cr = grid.querySelector('[data-craft]'); if(cr) cr.onclick = () => kind === 'table' ? TableSkins.craftLink() : BallSkins.craftLink('lathe');
  $('look-sheet').classList.remove('hidden');
}
function closeLooks(){ LOOK_OPEN = ''; $('look-sheet').classList.add('hidden'); }

/* ================= KEYS (per player, per device) ================= */
function loadKeys(){ try{ const k = JSON.parse(ls('sp_pyradive_keys:' + S.player) || 'null'); if(Array.isArray(k) && k.length === 2) return k.map((s, i) => Object.assign({}, DEFAULT_KEYS[i], s)); }catch(e){} return DEFAULT_KEYS.map(k => Object.assign({}, k)); }
function saveKeys(){ ls('sp_pyradive_keys:' + S.player, JSON.stringify(KEYS)); }
function keyName(c){ return !c ? '—' : c === 'Space' ? 'Space' : c.startsWith('Key') ? c.slice(3) : c.startsWith('Digit') ? c.slice(5) : c.startsWith('Numpad') ? 'Num' + c.slice(6).replace('Decimal', '.').replace('Add', '+') : c.startsWith('Arrow') ? {ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→'}[c] : c.replace('Left', ' L').replace('Right', ' R'); }
let KEY_WAIT = null;
function openKeys(){ renderKeys(); $('keys-sheet').classList.remove('hidden'); }
function closeKeys(){ KEY_WAIT = null; $('keys-sheet').classList.add('hidden'); }
function resetKeys(){ KEYS = DEFAULT_KEYS.map(k => Object.assign({}, k)); saveKeys(); renderKeys(); }
function renderKeys(){
  $('keys-table').innerHTML = '<div class="krow"><span></span><span>Player 1</span><span>Player 2</span></div>' + ACTIONS.map(([a, n]) => '<div class="krow"><span>' + n + '</span>' + [0, 1].map(s => '<button class="keybtn' + (KEY_WAIT && KEY_WAIT.s === s && KEY_WAIT.a === a ? ' wait' : '') + '" data-s="' + s + '" data-a="' + a + '">' + (KEY_WAIT && KEY_WAIT.s === s && KEY_WAIT.a === a ? 'press…' : UI.esc(keyName(KEYS[s][a]))) + '</button>').join('') + '</div>').join('');
  $('keys-table').querySelectorAll('.keybtn').forEach(b => b.onclick = () => { KEY_WAIT = {s: +b.dataset.s, a: b.dataset.a}; renderKeys(); });
}
function keyCatch(e){
  if(!KEY_WAIT) return false; e.preventDefault(); const {s, a} = KEY_WAIT, code = e.code;
  for(let t = 0; t < 2; t++) for(const k in KEYS[t]) if(KEYS[t][k] === code){ KEYS[t][k] = KEYS[s][a]; }   // swap on a clash
  KEYS[s][a] = code; KEY_WAIT = null; saveKeys(); renderKeys(); return true;
}

/* ================= MATCH ================= */
function startMatch(){
  hideResult();
  const cfg = SET.cfg || teamsCfg();
  const cupOn = !!(SET.cupState && !SET.cupState.done), M = PD.newMatch({mode: SET.mode, level: SET.level, arena: SET.arena, control: SET.control, seed: (Date.now() % 100000) + 7, teams: cfg, oneSet: cupOn || undefined, target: cupOn ? CUP_TARGET[SET.level] : undefined});
  G = {M, cup: cupOn, level: SET.level, mode: SET.mode, who: SET.who, over: false, paused: false, held: false, t0: Date.now(), fx: [], words: [], cam: null, shake: 0, setScores: [], q: 1, ema: 16, last: 0, sticks: new Map(), keysDown: new Set(), seen: {}};
  G.locals = M.players.filter(p => p.own);   // people on this device (P1 = own 1) — 🎮 pd-8a: their OWN seats (the body they drive = PD.bodyOf)
  loadLooks(); G.look = {ball: ballV(LOOKS.ball), table: LOOKS.table || 'classic', bomb: LOOKS.bomb || ''};   // 🎨 pd-4c
  BTN = M.drill && isHoop(M) ? BTN_JUGGLE : isHoop(M) ? BTN_HOOP : PD.isSpark(M) ? BTN_SPARK : PD.isStrike(M) ? BTN_STRIKE : BTN_SPIKE;
  GC_LOG.length = 0;
  if(UI.modeTried) UI.modeTried(S.player, GAME_ID, cupOn ? 'cups' : SET.mode);
  showScreen('play'); BAR.fit();
  BAR.level(PD.LEVELS[SET.level].name + (LEVEL_UI[SET.level].hardcore ? ' 💀' : ''));
  resize(); buildPads(); barScore(); updateGuideUi(); freeSprites(); queueWarm(M);
  if(isTouch() && innerHeight > innerWidth * 1.05 && !ls('sp_pyradive_turn')){ ls('sp_pyradive_turn', '1'); banner('↻ Turn sideways for a bigger court', 'good', 2600); }
  else if(cupOn) banner(CUPS[SET.cupState.k].icon + ' ' + cupRoundName(SET.cupState) + ' · ' + PD.MODES[SET.mode].icon + ' first to ' + M.target, 'gold', 2400);
  else banner(PD.MODES[SET.mode].icon + ' ' + PD.MODES[SET.mode].name + ' · ' + (M.drill ? levelGoal(SET.mode, SET.level).split(' · ⭐')[0] + ' · ' + DRILL_GOAL[M.drill.k].split(' · ')[0] : M.setsTo > 1 ? 'best of 3 sets to ' + M.target : 'first to ' + M.target), 'good', 2400);
  cheerMount(); /* 📣 cs-pd */
  startLoop();
}
function startLoop(){ stopLoop(); G.last = performance.now(); const f = ts => { RAF = requestAnimationFrame(f); frame(ts); }; RAF = requestAnimationFrame(f); }
function stopLoop(){ if(RAF) cancelAnimationFrame(RAF); RAF = 0; }
function setPaused(on){ if(!G || G.over) return; G.paused = !!on; if(window.Cheer) Cheer.pause(G.paused); /* 📣 cs-pd */ if(!on) G.last = performance.now(); }
function pauseGame(){ setPaused(true); }
function leavePlay(){ if(window.Cheer) Cheer.unmount(); stopLoop(); if(G) G.over = true; G = null; if(SET.cupState && SET.cup){ SET.mode = SET.cupState.sportBack || SET.mode; } SET.cupState = null; freeSprites(); hideResult(); $('pads').innerHTML = ''; renderMenu(); showScreen('menu'); }
function frame(ts){
  if(!G) return;
  let dt = Math.min(0.1, Math.max(0, (ts - G.last) / 1000)); G.last = ts;
  if(G.slow > 0){ G.slow -= dt; dt *= 0.35; }   // 🔥🔥 Spirit Dive slow motion
  G.ema = G.ema * 0.95 + dt * 1000 * 0.05;
  if(G.ema > 26 && G.q > 0.62){ G.q = Math.max(0.62, G.q * 0.85); G.ema = 16; resize(); }   // auto quality: lower the canvas pixels on slow devices
  if(!G.paused && !G.held && !G.over){
    readInput();
    PD.step(G.M, dt);
    handleEvents(PD.takeEvents(G.M));
  }
  updateGuideUi(); updatePads();
  draw(dt);
  warmStep(G.ema > 22 ? 1 : 2);
}

/* ================= EVENTS → looks, sounds, words ================= */
function snd(k){ try{ UISound.play(k); }catch(e){} }
function nameOf(id){ const p = ownerOf(G.M.players[id]); return p ? p.name : ''; }
function ownerOf(q){ if(!q || !G || !q.human || q.own) return q; return G.M.players.find(o => o.team === q.team && o.own === q.human) || q; }   // 🎮 pd-8a: a driven robot body speaks for its person
function isLocal(id){ const p = G && G.M.players[id]; return !!(p && p.human); }
function handleEvents(list){
  const M = G.M;
  list.forEach(e => {
    GC_LOG.push(Object.assign({mode: GAME_ID}, e)); if(GC_LOG.length > 600) GC_LOG.shift();
    GC_LISTEN.forEach(fn => { try{ fn(GAME_ID, e, M); }catch(err){} });
    cheerEvent(e, M); /* 📣 cs-pd */
    const b = M.ball, p = e.p != null ? M.players[e.p] : null;
    switch(e.k){
      case 'serve': snd('whoosh'); spark(b.x, b.y, b.z, e.pyra ? '#FF6B1A' : '#FFFFFF', e.kind === 'jump' ? 16 : 10);
        if(M.drill) break;   // 🧑‍🏫 the Coach's feeds need no words
        if(e.kind === 'kick') floatWord('🦶 Kick serve!', b.x, b.y, b.z, '#FFFFFF');
        else if(e.kind === 'jump'){ floatWord(PD.isStrike(M) ? '🦵 Power kick!' : '🦘 Jump serve!', b.x, b.y, b.z, '#FFE14A'); if(FX) G.shake = 0.1; } else if(e.kind === 'pinch') floatWord(PD.isStrike(M) ? '🦶 Tip serve' : '🤏 Pinch serve', b.x, b.y, b.z, '#E6D3FF'); break;
      case 'serveToss': snd('tap'); break;
      case 'bump': case 'set': case 'dig': case 'dive': case 'dunk': case 'dink': case 'drive':
        if(p) p.style = e.style || null;
        snd(e.k === 'dunk' || e.k === 'drive' ? 'drop' : 'bump'); spark(b.x, b.y, b.z, e.k === 'dunk' ? '#FFB627' : '#FFFFFF', e.k === 'dunk' ? 16 : 8);
        if(p) floatWord(wordOf(M, e) + (e.over && e.k !== 'dunk' ? ' over!' : ''), p.x - PD.sgn(p.team) * 0.4, p.y, p.z + 2.2, TEAM_COL[e.team]);   // over the player, so the ball flies clear of the word
        if(e.k === 'dunk' && FX){ G.shake = 0.18; }
        if(p && p.human && G.locals.length === 1 && (e.k === 'dig' || e.k === 'dive')) bigWord(e.k === 'dive' ? 'DIVE SAVE!' : 'GREAT DIG!');
        break;
      case 'pyra': snd('unlock'); spark(b.x, b.y, b.z, '#FF6B1A', 26); bigWord(e.name + '!', 'pyra', p ? p.name : ''); break;
      case 'block': snd('bump'); floatWord(e.stuff ? '🧱 STUFF!' : '🧱 Block', b.x, b.y, b.z + 0.5, TEAM_COL[e.team]); if(e.stuff && FX) G.shake = 0.15; break;
      case 'net': floatWord('🥅 Net!', b.x, b.y, b.z + 0.4, '#FFFFFF'); snd('bump'); break;
      case 'tape': floatWord('😮 Tape!', b.x, b.y, b.z + 0.4, '#FFE14A'); break;
      // ⚡ PyraSpark
      case 'bounce': snd('tap'); spark(e.x, e.y, PD.SPARK.Z + 0.05, '#BFE3FF', 4); break;
      case 'edge': snd('unlock'); bigWord('💥 EDGE!', 'pyra', p ? p.name : ''); spark(e.x, e.y, PD.SPARK.Z + 0.05, '#FFE14A', 22); if(FX) G.shake = 0.1; break;
      case 'serveMiss': banner('🔁 Missed serve — 2nd try!', 'good', 1300); break;
      case 'serveChange': banner('🔄 Serve changes — ' + teamName(e.team) + ' serve', 'good', 1300); break;
      case 'partnerHint': if(p) floatWord('🤝 Partner first!', p.x, p.y, 2.2, '#FFFFFF'); break;
      case 'out': floatWord('🚫 Out!', b.x, b.y, 0.6, '#FF8080'); break;
      case 'ace': bigWord('ACE!', '', nameOf(e.p)); break;
      case 'kill': if(isLocal(e.p)) bigWord('KILL!', '', nameOf(e.p)); break;
      case 'stuff': bigWord('STUFF BLOCK!', '', nameOf(e.p)); break;
      case 'fault': banner('😬 ' + (WHY[e.why] || e.why) + ' → point ' + teamName(1 - e.team), 'bad', 1800); snd('error'); break;
      case 'point': {
        const mine = G.locals.some(q => q.team === e.team) && !(G.who === 'duo');
        snd(mine || G.who === 'duo' ? 'success' : 'drop');
        if(e.why !== 'four' && e.why !== 'double' && e.why !== 'net') banner((e.team === 0 ? '🔥 ' : '🔵 ') + 'Point ' + teamName(e.team) + ' · ' + (WHY[e.why] || '') + ' ' + e.score.join(' – '), mine ? 'gold' : '', 1500);
        barScore(); break; }
      case 'meterHalf': if(isLocal(e.p)) { banner('🔥 Pyra ready! Tap 🔥' + (isTouch() ? '' : ' (' + keyName(KEYS[localSeat(e.p)].pyra) + ')') + ' — your next move flames up', 'gold', 2200); snd('unlock'); } break;
      case 'meterFull': if(isLocal(e.p)) { banner('🔥🔥 Full flame! Tap 🔥 → your next 💥 Dunk · 🪶 Dink · 🚀 Serve · 🧱 Block · 🛡️ Save is a SPIRIT DIVE', 'gold', 2600); snd('unlock'); } break;
      case 'spirit': spiritShow(e); break;
      case 'teamSpirit': banner((e.tier === 'trio' ? '🔥🔥×3 TRIO' : '🔥🔥×2 DUO') + ' Spirit ready — ' + (e.tier === 'trio' ? 'dig → set → spike = a Combo (point ×2), or block!' : 'your next Dunk, Dink or Block!'), 'gold', 2400); snd('unlock'); break;
      case 'spiritCombo': if(p) floatWord('🔥 ' + e.step + (e.step === 1 ? ' · Dig' : ' · Set'), p.x, p.y, 2.5, '#FF7AB6'); break;
      case 'double': bigWord('×2 POINT!', 'pyra', teamName(e.team)); barScore(); break;
      case 'pyraArm': if(isLocal(e.p)) { snd(e.on ? 'unlock' : 'tap'); floatWord(e.on ? (e.spirit ? '🔥🔥 Spirit ready!' : '🔥 Flame on!') : 'Flame off', p.x, p.y, 2.4, e.spirit ? '#FF7AB6' : '#FFB627'); } break;
      case 'pyraLow': if(isLocal(e.p)) floatWord('🔥 Fill half the flame first', p.x, p.y, 2.4, '#FFB627'); break;
      case 'setPoint': banner('⚡ Set point ' + teamName(e.team) + '!', 'gold', 1600); break;
      case 'matchPoint': banner('🏆 Match point ' + teamName(e.team) + '!', 'gold', 1600); break;
      case 'setWon': G.setScores.push(e.score); bigWord('SET ' + teamName(e.team).toUpperCase() + '!', '', e.score.join(' – ')); barScore(); break;
      case 'newSet': banner('🏐 Set ' + e.n + '!', 'good', 1500); barScore(); break;
      case 'longRally': if(e.n % 5 === 0) floatWord('🔁 Rally ×' + e.n + '!', 0, -G.M.W / 2, G.M.netH + 1.2, '#FFE14A'); break;
      case 'control': { const fr = G.M.players[e.from]; if(fr && G.locals.some(l => l.own === e.h)){ G.ctlFx = {x: fr.x, y: fr.y, to: e.to, t0: performance.now()}; if(e.why !== 'home') snd('tap'); } break; }   /* 🎮 pd-8a */
      case 'serveTurn': if(isLocal(e.p) && G.locals.length === 1) banner('🚀 Your turn to serve!', 'good', 1600); break;   /* 🚀 pd-8a */
      case 'rotate': floatWord('🔄 Rotate!', PD.sgn(e.team) * G.M.L * 0.5, 0, 2.6, TEAM_COL[e.team]); break;
      case 'whiff': if(isLocal(e.p)) floatWord('💨', p.x, p.y, 2.2, '#FFFFFF'); break;
      case 'match': finishSoon(); break;
      // ⭕ hoop takraw
      case 'hpass': snd('bump'); if(p) floatWord('🦵 ' + e.name + (e.combo >= 3 ? ' ×' + e.combo : ''), p.x, p.y, p.z + 2.2, TEAM_COL[e.team]); break;
      case 'hshot': snd('drop'); if(p) floatWord('⭕ ' + e.name + '!', p.x, p.y, p.z + 2.3, '#FFE14A'); break;
      case 'hoop': snd('unlock'); spark(0, 0, PD.HOOP.Z, e.spirit ? '#FF4D8D' : '#FFE14A', 30); bigWord('⭕ HOOP! +' + e.pts, e.pyra ? 'pyra' : '', (p ? p.name + ' · ' : '') + e.name); if(FX) G.shake = 0.12; barScore(); break;
      case 'rim': snd('bump'); floatWord('😮 Rim!', b.x, b.y, b.z + 0.4, '#FFFFFF'); break;
      case 'drop': floatWord('💨 Dropped', b.x, b.y, 0.8, '#FF8080'); break;
      case 'miss': floatWord('Missed', b.x, b.y, 0.8, '#FFFFFF'); break;
      case 'hoopTurn': if(M.drill){ banner('🤹 Keep it up! ⏱️ ' + e.time + ' s', 'good', 2000); barScore(); break; } banner(teamName(e.team) + (G.locals.some(q => q.team === e.team) ? ' — your turn! ' : '\'s turn · ') + '⏱️ ' + e.time + ' s', 'good', 2200); barScore(); hoopSkipBtn(); break;
      // 🎯 drills + 🌀 Spark Party (pd-4a)
      case 'drillStart': barScore(); break;
      case 'zone': if(FX) spark(e.rect.u0 + (e.rect.u1 - e.rect.u0) / 2, (e.rect.v0 + e.rect.v1) / 2, PD.SPARK.Z + 0.05, '#FFE14A', 8); break;
      case 'drillHit': {
        const col = e.kind === 'zone' || e.kind === 'combo' ? '#FFE14A' : '#FFFFFF', pp = p || G.locals[0];
        if(isHoop(M)){ if(e.kind === 'switch' || e.streak % 10 === 0) floatWord('+' + e.pts + (e.streak % 10 === 0 ? ' · ' + e.streak + ' in a row!' : ' switch!'), pp.x, pp.y, pp.z + 2.7, '#FFE14A'); if(e.streak % 10 === 0){ snd('unlock'); bigWord(e.streak + ' IN A ROW!', 'pyra', '+5'); } }
        else { floatWord('+' + e.pts + (e.kind === 'zone' ? ' 🎯 ZONE!' : e.kind === 'combo' ? ' 🔗 COMBO!' : e.kind === 'three' ? ' · 3 touches' : ''), e.x, e.y, PD.SPARK.Z + 0.9, col); spark(e.x, e.y, PD.SPARK.Z + 0.05, col, e.kind === 'hit' || e.kind === 'return' ? 6 : 20);
          if(e.kind === 'zone' || e.kind === 'combo') snd('success'); else snd('tap');
          if(e.kind === 'combo') bigWord('🔗 COMBO!', 'pyra', '+5'); else if(e.kind === 'return' && e.streak % 5 === 0) bigWord('🏃 ' + e.streak + ' in a row!', '', 'faster…'); }
        barScore(); break; }
      case 'drillMiss': snd('drop'); banner(pdPick(['💨 Missed — the Coach feeds another one', '😅 So close — next one!', '💪 Again!']), '', 1100); barScore(); break;
      case 'drillLife': snd('error'); banner(e.lives > 0 ? '💔 Missed! ❤️ ' + e.lives + ' left' : '💔 No lives left!', 'bad', 1300); barScore(); break;
      case 'drillCoachMiss': floatWord('🧑‍🏫 Oops!', PD.SPARK.L, 0, 2.3, '#FFFFFF'); barScore(); break;
      case 'drillEnd': barScore(); finishSoon(); break;
      case 'partyDrop': snd('pop'); break;
      case 'partyBounce': snd('tap'); break;
      case 'partyHit': snd('bump'); if(p) floatWord('🌀', p.x, p.y, 2.3, TEAM_COL[e.team]); break;
      case 'partyPoint': snd(G.locals.some(q => q.team === e.team) ? 'success' : 'drop'); floatWord('🌀 +1 ' + teamName(e.team), e.x, e.y, PD.SPARK.Z + 0.9, TEAM_COL[e.team]); barScore(); break;
      case 'hoopTurnEnd': banner('⏱️ Time! ' + teamName(e.team) + ': ' + e.score + ' points (' + e.hoops + ' ⭕)', 'gold', 2200); barScore(); break;
    }
  });
}
function localSeat(id){ const p = G.M.players[id]; return p && p.human === 2 ? 1 : 0; }
function teamName(t){ const M = G.M, ppl = M.players.filter(p => p.team === t && p.own); return ppl.length ? ppl.map(p => p.name).join(' + ') : 'Robots'; }
function barScore(){
  if(!G) return; const M = G.M;
  if(M.drill){ const D = M.drill, me = G.locals[0];   // 🎯 drills: your score + the clock / lives
    BAR.players([{k: 0, name: S.player, av: '🎯', score: D.score, on: true, col: TEAM_COL[0]}]);
    if(D.time != null || isHoop(M)){ const tl = isHoop(M) ? M.timeLeft : D.time; BAR.time(Math.ceil(tl), tl < 10); G.barT = Math.ceil(tl); } else BAR.hide('time');
    if(D.lives != null) BAR.lives(D.lives, D.lives <= 1); else BAR.hide('lives');
    BAR.count('streak', '🔁', D.streak, 'In a row'); BAR.hide('c:sets');
    if(me) BAR.meter('pyra', '🔥', me.meter / 100, 'Pyra meter', me.meter >= 50); return; }
  BAR.hide('lives'); BAR.hide('c:streak'); if(!isHoop(M)) BAR.hide('time');
  BAR.players([0, 1].map(t => ({k: t, name: teamName(t), av: t === 0 ? '🔥' : M.players.some(p => p.team === 1 && p.own) ? '⚔️' : '🤖', score: M.teams[t].score, on: M.serveTeam === t, col: TEAM_COL[t], bot: !M.players.some(p => p.team === t && p.own)})));
  if(M.setsTo > 1 && !isHoop(M)) BAR.count('sets', '🏐', M.teams[0].sets + '–' + M.teams[1].sets, 'Sets won');
  if(isHoop(M)){ BAR.time(Math.ceil(M.timeLeft), M.timeLeft < 10); G.barT = Math.ceil(M.timeLeft); }
  const me = G.locals[0] && PD.bodyOf(M, G.locals[0]); if(me) BAR.meter('pyra', '🔥', me.meter / 100, 'Pyra meter', me.meter >= 50);
}
function banner(text, cls, ms){ const b = $('banner'); b.textContent = text; b.className = 'banner on ' + (cls || ''); clearTimeout(banner.t); banner.t = setTimeout(() => b.classList.remove('on'), ms || 1500); }
/* 🔥🔥 Spirit Dive show (pd-2a): a comic panel — "SPIRIT DIVE" small, the creature + move big — a short slow-motion, a burst in the
   creature's colour, and the creature flies with the ball on the court (drawBall). Comics / crowd get the 'spirit' event. */
// 📖 the creatures people call go into their Spirit Bestiary (robots' don't); NEW ones get a sticker on the panel
function bestiaryAdd(e){
  if(!window.SpiritBestiary || !G) return false; let isNew = false;
  (e.ids || [e.p]).forEach(id => { const q = ownerOf(G.M.players[id]); if(q && q.human) isNew = SpiritBestiary.add(q.name, e.creature, 'pyraspike') || isNew; });
  return isNew;
}
function openBestiary(){ if(!window.SpiritBestiary) return; UISound.play('tap'); SpiritBestiary.open(S.player, {back: 'PyraDive', title: 'Spirit Bestiary', onClose: bestiaryCount}); }
function bestiaryCount(){ const el = $('bestiary-n'); if(el && window.SpiritBestiary && S.player) el.textContent = SpiritBestiary.count(S.player) + ' / ' + SpiritBestiary.C.length; }
function spiritShow(e){
  if(!G) return; const p = G.M.players[e.p], b = G.M.ball, c = spiritOf(e.creature) || {icon: e.icon, col: '#FF6B1A'}, isNew = bestiaryAdd(e);
  snd('unlock'); snd('whoosh'); spark(b.x, b.y, b.z, c.col, 40); spark(b.x, b.y, b.z, '#FFE14A', 20);
  if(!FX) return;
  G.slow = 1.05;   // slow motion while the creature comes (real time; the shake comes on the impact)
  spiritFx(e, c);
  const host = $('bigword-host'); host.innerHTML = '';
  const d = document.createElement('div'); d.className = 'spirit-card rib ' + (e.tier || 'solo'); d.style.setProperty('--sc', c.col);   // 🎗️ pd-5a: a slim name ribbon at the top — the show is on the court
  const mv = e.name.replace(/^Spirit (Duo |Trio )?Dive : /, ''), who = (e.ids || [e.p]).map(id => G.M.players[id] && G.M.players[id].name).filter(Boolean);
  const label = e.tier === 'trio' ? '🔥🔥×3 SPIRIT TRIO DIVE' : e.tier === 'duo' ? '🔥🔥×2 SPIRIT DUO DIVE' : '🔥🔥 SPIRIT DIVE';
  const strip = e.slot === 'combo' ? '<div class="sc-strip"><span>🛡️ Dig</span><span>🙌 Set</span><span>💥 Spike</span><span>×2 point!</span></div>' : '';
  d.innerHTML = (isNew ? '<span class="sc-new">NEW! 📖</span>' : '') + '<small>' + label + '</small><b>' + c.icon + '</b><big>' + UI.esc(mv) + '</big>' + strip + '<i>' + UI.esc(who.join(' + ')) + '</i>';
  host.appendChild(d); setTimeout(() => d.remove(), 2200);
}
/* 🔥🔥 pd-5a Spirit Dive effect (Aowu 21:57 "the spirit is just a card which defeats the purpose of special effect"), drawn on the court in real time:
   0 – 0.45 s  a magic circle opens under each caller + a light pillar, the screen dims, the creature rises out of the pillar, huge + glowing
   0.45 – 0.9  it swoops down into the ball (after-images + a ribbon in its colour)
   0.9         IMPACT: white flash, shockwave ring on the floor, a burst, a big shake — then it rides the ball (drawBall). Trio = 3 pillars, bigger creature. */
const SPFX = [], CRE_SPR = {};
function creatureSprite(icon, col, px){
  px = Math.max(24, Math.round(px / 8) * 8); const key = icon + col + px; if(CRE_SPR[key]) return CRE_SPR[key];
  const c = document.createElement('canvas'), R = px * 0.95; c.width = c.height = Math.ceil(R * 2); const g = c.getContext('2d');
  const gr = g.createRadialGradient(R, R, px * 0.1, R, R, R); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.35, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = 0.75; g.fillStyle = gr; g.beginPath(); g.arc(R, R, R, 0, 7); g.fill(); g.globalAlpha = 1;
  emo(g, icon, R, R, px);
  if(Object.keys(CRE_SPR).length > 24) for(const k in CRE_SPR) delete CRE_SPR[k];
  return (CRE_SPR[key] = c);
}
function spiritFx(e, c){
  if(!G) return; const M = G.M, callers = (e.ids || [e.p]).map(id => M.players[id]).filter(Boolean).map(q => ({x: q.x, y: q.y}));
  if(!callers.length) return;
  SPFX.length = 0; SPFX.push({t: 0, last: performance.now(), c, callers, tier: e.tier || 'solo', trail: [], hit: false});
}
function drawSpiritFx(g, M){
  if(!SPFX.length || !V) return; const f = SPFX[0], now = performance.now(), rdt = Math.min(0.1, (now - f.last) / 1000); f.last = now; f.t += rdt;
  const t = f.t, T1 = 0.42, TH = 0.6, T2 = 0.95, END = 1.6, c = f.c, b = M.ball;   // rise · hover (it roars) · swoop · impact
  if(t > END){ SPFX.length = 0; return; }
  const big = f.tier === 'trio' ? 4.6 : f.tier === 'duo' ? 4 : 3.4;
  // dim the screen while it comes
  if(t < T2 + 0.2){ g.fillStyle = 'rgba(10,6,30,' + (0.38 * Math.min(1, t / 0.15) * (t > T2 ? 1 - (t - T2) / 0.2 : 1)).toFixed(3) + ')'; g.fillRect(0, 0, V.W, V.H); }
  // magic circles + light pillars under the callers
  g.save(); g.globalCompositeOperation = 'lighter';
  f.callers.forEach((q, i) => { const [x, y, s] = P(q.x, q.y, 0), open = Math.min(1, t / 0.25), fade = t < 1.1 ? 1 : Math.max(0, 1 - (t - 1.1) / 0.3), r = V.k * s * (0.5 + open * 1.1);
    if(fade <= 0) return;
    g.save(); g.translate(x, y); g.scale(1, 0.38); g.globalAlpha = 0.9 * fade; g.strokeStyle = c.col; g.lineWidth = Math.max(2, r * 0.08);
    g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); g.setLineDash([r * 0.18, r * 0.12]); g.lineDashOffset = -t * r * 2; g.beginPath(); g.arc(0, 0, r * 0.72, 0, 7); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#FFFFFF'; for(let k = 0; k < 6; k++){ const a = k * Math.PI / 3 + t * 3; g.beginPath(); g.arc(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86, Math.max(1.5, r * 0.06), 0, 7); g.fill(); }
    g.restore();
    const ph = Math.min(V.H, V.k * s * 9) * open, pw = r * 1.1, pg = g.createLinearGradient(0, y - ph, 0, y); pg.addColorStop(0, 'rgba(255,255,255,0)'); pg.addColorStop(0.6, c.col); pg.addColorStop(1, '#FFFFFF');
    g.globalAlpha = 0.5 * fade * (0.85 + 0.15 * Math.sin(t * 30 + i)); g.fillStyle = pg; g.fillRect(x - pw / 2, y - ph, pw, ph); });
  g.restore(); g.globalAlpha = 1;
  // the creature: rises out of the (middle) caller, then swoops into the ball
  if(t < T2){
    const q0 = f.callers[Math.floor(f.callers.length / 2)], [bx, by, bs] = P(b.x, b.y, b.z), [sx0, sy0, ss] = P(q0.x, q0.y, 0);
    let x, y, sc;
    const pxMax = Math.min(V.H * 0.45, V.k * ss * big * 1.2), yTop = 52 + pxMax * 0.8, yHi = Math.max(yTop, sy0 - V.k * ss * 4.4);   // stays on screen, under the name ribbon
    if(t < T1){ const u = t / T1, e1 = 1 - Math.pow(1 - u, 3); x = sx0; y = sy0 + (yHi - sy0) * e1; sc = 0.4 + e1 * 0.8; }
    else if(t < TH){ const u = (t - T1) / (TH - T1); x = sx0 + Math.sin(u * Math.PI * 3) * V.k * 0.25; y = yHi - Math.sin(u * Math.PI) * V.k * 0.3; sc = 1.2 + Math.sin(u * Math.PI) * 0.12; }
    else { const u = (t - TH) / (T2 - TH), e2 = u * u, x1 = sx0, y1 = yHi, cxp = (x1 + bx) / 2 + (bx > x1 ? -1 : 1) * V.k * 1.5, cyp = Math.max(yTop, Math.min(y1, by) - V.k * 2.4);
      x = (1 - e2) * (1 - e2) * x1 + 2 * (1 - e2) * e2 * cxp + e2 * e2 * bx; y = (1 - e2) * (1 - e2) * y1 + 2 * (1 - e2) * e2 * cyp + e2 * e2 * by; sc = 1.2 - u * 0.55; }
    if(!f.spr) f.spr = creatureSprite(c.icon, c.col, Math.min(V.H * 0.5, V.k * big * 1.25));   // one picture per Spirit Dive, scaled while it flies
    const px = Math.min(V.H * 0.45, V.k * ss * big * sc * (1 + 0.06 * Math.sin(t * 22))), spr = f.spr;
    f.trail.push([x, y]); if(f.trail.length > 9) f.trail.shift();
    if(f.trail.length > 2){ g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
      for(let k = 1; k < f.trail.length; k++){ const a = k / f.trail.length; g.globalAlpha = a * 0.8; g.strokeStyle = k > f.trail.length - 3 ? '#FFFFFF' : c.col; g.lineWidth = px * 0.22 * a; g.beginPath(); g.moveTo(f.trail[k - 1][0], f.trail[k - 1][1]); g.lineTo(f.trail[k][0], f.trail[k][1]); g.stroke(); }
      g.restore(); }
    const w = px * 1.9;
    f.trail.slice(0, -1).forEach(([tx, ty], k) => { if(k % 3) return; g.globalAlpha = 0.16 * (k + 1) / f.trail.length; g.drawImage(spr, tx - w * 0.4, ty - w * 0.4, w * 0.8, w * 0.8); });   // after-images
    g.globalAlpha = 0.68; g.drawImage(spr, x - w / 2, y - w / 2, w, w); g.globalAlpha = 1;   // a bit see-through: the players stay visible (Aowu 22:22)
  }
  // IMPACT
  if(t >= T2 && !f.hit){ f.hit = true; f.hx = b.x; f.hy = b.y; f.hz = b.z; G.shake = f.tier === 'solo' ? 0.4 : 0.55; snd('bump'); spark(b.x, b.y, b.z, c.col, 46); spark(b.x, b.y, b.z, '#FFFFFF', 24); }
  if(f.hit){ const u = (t - T2) / (END - T2);
    if(u < 0.25){ g.fillStyle = 'rgba(255,255,255,' + (0.6 * (1 - u / 0.25)).toFixed(3) + ')'; g.fillRect(0, 0, V.W, V.H); }   // flash
    const [wx, wy, ws] = P(f.hx, f.hy, 0), rw = V.k * ws * (0.6 + u * 5.5);   // shockwave on the floor under the hit
    g.save(); g.translate(wx, wy); g.scale(1, 0.38); g.globalAlpha = Math.max(0, 0.9 * (1 - u)); g.strokeStyle = c.col; g.lineWidth = Math.max(2, V.k * 0.3 * (1 - u)); g.beginPath(); g.arc(0, 0, rw, 0, 7); g.stroke();
    g.strokeStyle = '#FFFFFF'; g.lineWidth = Math.max(1, V.k * 0.12 * (1 - u)); g.beginPath(); g.arc(0, 0, rw * 0.8, 0, 7); g.stroke(); g.restore(); g.globalAlpha = 1;
    if(u < 0.5){ const [hx, hy] = P(f.hx, f.hy, f.hz); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = c.col; g.globalAlpha = 0.8 * (1 - u * 2); g.lineWidth = 3;   // speed burst lines
      for(let k = 0; k < 14; k++){ const a = k * Math.PI / 7 + 0.2, r0 = V.k * (0.6 + u * 3), r1 = r0 + V.k * (1.4 - u * 2); g.beginPath(); g.moveTo(hx + Math.cos(a) * r0, hy + Math.sin(a) * r0); g.lineTo(hx + Math.cos(a) * r1, hy + Math.sin(a) * r1); g.stroke(); }
      g.restore(); g.globalAlpha = 1; }
  }
}
// ▲ a ball above the top of the play area (high lobs since pd-5a keeps less sky)
function drawOffBall(g, M){
  const b = M.ball; if(!b || M.phase !== 'rally') return; const [x, y] = P(b.x, b.y, b.z); if(y > 6) return;
  const cx = Math.max(16, Math.min(V.W - 16, x)), r = Math.max(7, V.k * 0.2), a = 0.75 + 0.25 * Math.sin(performance.now() / 120);
  g.globalAlpha = a; g.fillStyle = '#FFE14A'; g.strokeStyle = '#1B1030'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, 4); g.lineTo(cx - r, 4 + r * 1.3); g.lineTo(cx + r, 4 + r * 1.3); g.closePath(); g.fill(); g.stroke(); g.globalAlpha = 1;
}
function spiritOf(k){ for(const L of [PD.SPIRITS, PD.SPIRITS_DUO, PD.SPIRITS_TRIO]) for(const slot in L){ const c = L[slot].find(x => x.k === k); if(c) return c; } return null; }
/* ⭕ the robots' turn can be skipped (⏭): the rest of their turn is played out at once */
function hoopSkipBtn(){
  let b = $('hoop-skip'); const M = G && G.M;
  const show = M && isHoop(M) && !M.over && !G.locals.some(q => q.team === M.turn);
  if(!show){ if(b) b.remove(); return; }
  if(!b){ b = document.createElement('button'); b.id = 'hoop-skip'; b.className = 'sp-btn sp-secondary sp-sm hoop-skip'; b.textContent = '⏭ Skip the robots\' turn'; $('stage').appendChild(b);
    b.onclick = () => { const M2 = G.M, t0 = M2.turn; let n = 0; while(!M2.over && M2.turn === t0 && n++ < 30 * 200){ PD.step(M2, 1 / 30); handleEvents(PD.takeEvents(M2).filter(e => e.k !== 'hoop' && e.k !== 'spirit' && e.k !== 'pyra' || e.k === 'match')); } barScore(); hoopSkipBtn(); }; }
}
function bigWord(text, cls, sub){ if(!FX) return; const host = $('bigword-host'); host.innerHTML = ''; const d = document.createElement('div'); d.className = 'big-word ' + (cls || ''); d.innerHTML = UI.esc(text) + (sub ? '<small>' + UI.esc(sub) + '</small>' : ''); host.appendChild(d); setTimeout(() => d.remove(), 1100); }
function floatWord(text, x, y, z, col){ if(!G) return; const near = G.words.filter(w => w.t < 0.8 && Math.abs(w.x - x) < 1.6).length; G.words.push({text, x, y, z: z + 0.5 + near * 0.55, col, t: 0}); if(G.words.length > 12) G.words.shift(); }   // above the ball, stacked when they bunch up
function spark(x, y, z, col, n){ if(!G || !FX) return; for(let i = 0; i < n; i++){ const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3; G.fx.push({x, y, z, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.5, vz: 1 + Math.random() * 3, t: 0, life: 0.4 + Math.random() * 0.3, col}); } if(G.fx.length > 160) G.fx.splice(0, G.fx.length - 160); }

/* ================= INPUT ================= */
function keySeat(code){ const r = []; for(let s = 0; s < 2; s++) for(const a in KEYS[s]) if(KEYS[s][a] === code) r.push([s, a]); return r; }
function seatPlayer(s){ if(!G) return null; const solo = G.locals.length === 1; return solo ? G.locals[0] : G.locals.find(p => p.human === s + 1) || null; }
document.addEventListener('keydown', e => {
  if(keyCatch(e)) return;
  if(!G || G.over || $('scr-play').classList.contains('hidden')) return;
  if(e.code === 'KeyP' || e.code === 'Escape'){ e.preventDefault(); BAR.el.querySelector('.gb-pause') ? BAR.el.querySelector('.gb-pause').click() : setPaused(!G.paused); return; }
  const hits = keySeat(e.code); if(!hits.length) return; e.preventDefault();
  $('pads').classList.add('kbd');
  hits.forEach(([s, a]) => { const p = seatPlayer(s); if(!p) return;
    if(['up', 'down', 'left', 'right'].includes(a)){ G.keysDown.add(s + ':' + a); return; }
    if(e.repeat || G.paused || G.held) return;
    if(a === 'dive'){ readInput(); }
    PD.press(G.M, p.id, a); flashBtn(p.id, a); });
});
document.addEventListener('keyup', e => {
  if(!G) return; keySeat(e.code).forEach(([s, a]) => { G.keysDown.delete(s + ':' + a); const p = seatPlayer(s); if(p && a === 'drive') PD.release(G.M, p.id, 'drive'); });
});
window.addEventListener('blur', () => { if(G) G.keysDown.clear(); });
function readInput(){
  if(!G) return;
  G.locals.forEach(p => {
    const st = G.sticks.get(p.id);
    if(st && st.v){ if(V && V.rot) PD.input(G.M, p.id, -st.v.y, st.v.x); else PD.input(G.M, p.id, st.v.x, st.v.y); return; }
    const seats = G.locals.length === 1 ? [0, 1] : [p.human - 1];
    let x = 0, y = 0; seats.forEach(s => { if(G.keysDown.has(s + ':left')) x -= 1; if(G.keysDown.has(s + ':right')) x += 1; if(G.keysDown.has(s + ':up')) y -= 1; if(G.keysDown.has(s + ':down')) y += 1; });
    x = Math.max(-1, Math.min(1, x)); y = Math.max(-1, Math.min(1, y));
    if(V && V.rot) PD.input(G.M, p.id, -y, x); else PD.input(G.M, p.id, x, y);
  });
}
function buildPads(){
  const box = $('pads'); box.innerHTML = ''; G.sticks = new Map(); G.padEls = null;   // 👀 pd-5c
  const touch = isTouch(), portrait = innerHeight > innerWidth * 1.05, short = !portrait && innerHeight < 520, two = G.locals.length > 1 && touch && !portrait;
  box.classList.toggle('port', portrait); box.classList.toggle('short', short); box.classList.toggle('two', two);
  $('keylegend').classList.toggle('hidden', touch);
  if(!touch){ box.classList.add('kbd'); renderLegend(); return; }
  (two ? G.locals : G.locals.slice(0, 1)).forEach((p, i) => {
    const where = two ? (i === 0 ? 'l2' : 'r2') : 'solo', K = KEYS[p.human === 2 ? 1 : 0];
    const st = document.createElement('div'); st.className = 'stick ' + where; st.dataset.p = p.id; st.innerHTML = '<div class="ring"></div><div class="knob"></div><span class="tip">🕹️ move + aim</span>';
    const pad = document.createElement('div'); pad.className = 'actpad ' + where + (BTN.some(b => b[0] === 'drive') ? '' : ' n3'); pad.dataset.p = p.id;   // 🕹️ pd-5c
    pad.innerHTML = BTN.map(([a, ic, nm]) => '<button class="sbtn a-' + a + (a === 'drive' ? ' pz-main' : '') + '" data-a="' + a + '" title="' + nm + '"><span class="ic">' + ic + '</span><span class="nm">' + nm + '</span><small>' + UI.esc(keyName(K[a])) + '</small></button>').join('');
    pad.querySelectorAll('.sbtn').forEach(b => {
      b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if(!G || G.paused || G.held) return; try{ b.setPointerCapture(e.pointerId); }catch(err){}
        b.classList.remove('flash'); void b.offsetWidth; b.classList.add('down', 'flash'); if(navigator.vibrate) try{ navigator.vibrate(8); }catch(err){}
        if(b.dataset.a === 'dive') readInput();
        PD.press(G.M, p.id, b.dataset.a); });
      const up = () => { b.classList.remove('down'); if(G && b.dataset.a === 'drive') PD.release(G.M, p.id, 'drive'); };
      b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
    });
    const T = UI.stickTracker(st, {player: p.name, av: p.av, buttons: pad}), kn = st.querySelector('.knob'), SS = {id: null, v: null};
    const show = v => { const m = Math.min(1, Math.hypot(v.fx, v.fy)), k = m > 0 ? Math.min(1, m) / m : 0; kn.style.transform = 'translate(calc(-50% + ' + (v.fx * k * 38) + '%), calc(-50% + ' + (v.fy * k * 38) + '%))'; };
    st.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try{ st.setPointerCapture(e.pointerId); }catch(err){} SS.id = e.pointerId; SS.v = T.start(e); show(SS.v); st.classList.add('on'); });
    UI.onFastMove(st, e => { if(e.pointerId !== SS.id) return; SS.v = T.at(e); show(SS.v); });
    const end = e => { if(e.pointerId !== SS.id) return; SS.id = null; SS.v = null; kn.style.transform = ''; st.classList.remove('on'); if(G) PD.input(G.M, p.id, 0, 0); };
    st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
    G.sticks.set(p.id, SS);
    if(!two && window.UI && UI.pad && UI.pad.geo){ pad.classList.add('ring');   // 🌼 pd-5d
      [...pad.querySelectorAll('.sbtn:not(.a-pyra)')].reverse().forEach(b => pad.insertAdjacentHTML('afterbegin', '<span class=\"pd-fl\" data-for=\"' + b.dataset.a + '\"><i></i><i></i><i></i><i></i><i></i><b></b><b></b><b></b></span>'));   // every flame BEHIND every button (no flame over a label)
      const pb = pad.querySelector('.a-pyra'); if(pb){ const u = document.createElement('span'); u.className = 'pz-util'; pb.replaceWith(u); u.appendChild(pb); pad.insertBefore(u, pad.firstChild); } }
    box.appendChild(st); box.appendChild(pad);
    if(pad.classList.contains('ring')) pdRing(box, pad);
  });
}
// 🌼 pd-5d: the pz-1 thumb ring (UiKit UI.pad.geo — the same places as 🏓 SlaBrall / 🥊 Brawl): 💥 main on the corner diagonal,
//   Touch ← · Jump ↑ · Dive ↙ · Dink ↗ (keepy-up: Keep up = main, Jump ← · Lunge ↑). 🔥 Pyra = a crescent hugging the main on the corner
//   side (Aowu 09:40) — inside the ring's own footprint, so the group keeps the UiKit spot. The pad box = the footprint only (the crowd + the
//   court stay clear of it), anchored bottom-right. Upright phones: the stick gives way (UI.pad.stickFor, ≥ 120 px).
function pdRing(box, pad){
  const W = box.clientWidth, H = box.clientHeight; if(!W || !H) return null;
  const q = a => pad.querySelector('.sbtn[data-a="' + a + '"]'), main = q('drive') || q('touch'); if(!main) return null;
  main.classList.add('pz-main');
  /* 🌸 pd-8a petal ring (pz-2, Game Baseline §11c): fixed slots M 💥 · 1 ← ✋ Touch · 2 ↖ ⬆️ Jump · 3 ↙ 🤸 Dive · 4 ↗ 🪶 Dink · 5 → / 6 ↓ empty (no ⇄ Switch — Aowu 11:34)
     keepy-up: M Keep up · 1 Jump · 2 Lunge. UiKit places + shapes them (2 mm gaps, press reaction, 🏠 stick home); the 🌙 Pyra crescent hugs the main on the corner side. */
  const slots = q('drive') ? [q('touch'), q('jump'), q('dive'), q('dink')] : [q('jump'), q('dive')], py = q('pyra');
  if(UI.pad.petals && window.UI_PETALS !== false){
    pad.classList.add('pz-petals-pd');
    const Gm = UI.pad.petals(pad, main, slots, {fit: true}); if(!Gm) return null;
    const fw = pad.offsetWidth, fh = pad.offsetHeight, sa = UI.pad.safe(), m = Gm.main;
    const flame = (el, x, y, d) => { const f = pad.querySelector('.pd-fl[data-for="' + el.dataset.a + '"]'); if(!f) return; const z = d * 1.6; f.style.width = f.style.height = Math.round(z) + 'px'; f.style.left = Math.round(x - z / 2) + 'px'; f.style.top = Math.round(y - z * 0.8) + 'px'; };
    flame(main, Gm.cx, Gm.cy, m);
    slots.forEach(el => { if(!el) return; const P = Gm.petals[+el.dataset.slot]; if(P) flame(el, P.box.x + P.lx, P.box.y + P.ly, Math.max(56, Gm.depth)); });
    if(py){
      const room = Math.max(40, Math.min(fw - sa.r - Gm.edge - Gm.cx, fh - sa.b - Gm.edge - Gm.cy)), Ri = m / 2 + Math.max(10, Gm.gap * 0.8), Ro = Math.max(30, Math.round(room * 0.58)), k = (room - Ro) / Math.SQRT1_2 * 0.98;   // the pd-5d crescent, measured from the petal ring's main
      const cx = Gm.cx + k * Math.SQRT1_2, cy = Gm.cy + k * Math.SQRT1_2, th = k + Ro - Ri, mid = (Ri + k + Ro) / 2 - k;
      py.style.width = py.style.height = (2 * Ro) + 'px'; py.style.left = Math.round(cx - Ro) + 'px'; py.style.top = Math.round(cy - Ro) + 'px';
      const v = (n, val) => py.style.setProperty(n, val);
      v('--hr', Ri + 'px'); v('--hx', Math.round(Ro - k * Math.SQRT1_2) + 'px'); v('--hy', Math.round(Ro - k * Math.SQRT1_2) + 'px');
      v('--tx', Math.round(Ro + mid * Math.SQRT1_2) + 'px'); v('--ty', Math.round(Ro + mid * Math.SQRT1_2) + 'px');
      v('--ti', Math.round(Math.max(14, Math.min(26, th * 0.5))) + 'px'); v('--tn', Math.round(Math.max(9, Math.min(13, th * 0.26))) + 'px');
      py._cres = {cx, cy, Ro, Ri, k, th, hx: Gm.cx, hy: Gm.cy};
    }
    if(box.classList.contains('port')){ const sk = UI.pad.stickFor(W, fw); box.style.setProperty('--stick', sk + 'px'); } else box.style.removeProperty('--stick');
    pad._ring = {w: fw, h: fh}; return pad._ring;
  }
  { /* the round 🌼 ring (UI_PETALS = false) */
  const others = (q('drive') ? ['touch', 'jump', 'dive', 'dink'] : ['jump', 'dive']).map(q).filter(Boolean), py = q('pyra');
  const m = main.offsetWidth, b = others.length ? others[0].offsetWidth : m, Gm = UI.pad.geo(W, H, others.length, {main: m + 4, btn: b + 4}), sa = UI.pad.safe();   // + 4 px: the glow pulse grows a button, the round gap stays ≥ the rule
  const fw = Gm.w, fh = Gm.h; pad.style.width = fw + 'px'; pad.style.height = fh + 'px';
  const X = x => x - (W - fw), Y = y => y - (H - fh);   // screen box → footprint box
  const put = (el, x, y) => { el.style.left = Math.round(X(x) - el.offsetWidth / 2) + 'px'; el.style.top = Math.round(Y(y) - el.offsetHeight / 2) + 'px'; };
  const flame = (el, x, y, d) => { const f = pad.querySelector('.pd-fl[data-for="' + el.dataset.a + '"]'); if(!f) return; const z = d * 1.6; f.style.width = f.style.height = Math.round(z) + 'px'; f.style.left = Math.round(X(x) - z / 2) + 'px'; f.style.top = Math.round(Y(y) - z * 0.8) + 'px'; };
  put(main, Gm.cx, Gm.cy); flame(main, Gm.cx, Gm.cy, m);
  others.forEach((el, i) => { put(el, Gm.pts[i].x, Gm.pts[i].y); flame(el, Gm.pts[i].x, Gm.pts[i].y, el.offsetWidth); });
  if(py){   // 🌙 the crescent: a circle pushed toward the corner, minus a hole around the main (one small gap)
    const room = Math.min(W - sa.r - Gm.edge - Gm.cx, H - sa.b - Gm.edge - Gm.cy), Ri = m / 2 + Math.max(8, Gm.gap * 0.55), Ro = Math.max(30, Math.round(room * 0.58)), k = (room - Ro) / Math.SQRT1_2 * 0.98;
    const cx = Gm.cx + k * Math.SQRT1_2, cy = Gm.cy + k * Math.SQRT1_2, th = k + Ro - Ri, mid = (Ri + k + Ro) / 2 - k;   // th = thickness on the diagonal · mid = the label spot (from the circle centre)
    py.style.width = py.style.height = (2 * Ro) + 'px'; put(py, cx, cy);
    const v = (n, val) => py.style.setProperty(n, val);
    v('--hr', Ri + 'px'); v('--hx', Math.round(Ro - k * Math.SQRT1_2) + 'px'); v('--hy', Math.round(Ro - k * Math.SQRT1_2) + 'px');
    v('--tx', Math.round(Ro + mid * Math.SQRT1_2) + 'px'); v('--ty', Math.round(Ro + mid * Math.SQRT1_2) + 'px');
    v('--ti', Math.round(Math.max(14, Math.min(26, th * 0.5))) + 'px'); v('--tn', Math.round(Math.max(9, Math.min(13, th * 0.26))) + 'px');
    py._cres = {cx, cy, Ro, Ri, k, th, hx: Gm.cx, hy: Gm.cy};
  }
  if(box.classList.contains('port')){ const sk = UI.pad.stickFor(W, fw); box.style.setProperty('--stick', sk + 'px'); } else box.style.removeProperty('--stick');
  pad._ring = {w: fw, h: fh}; return pad._ring;
  }
}
function renderLegend(){ const K = KEYS[0]; $('keylegend').innerHTML = BTN.map(([a, ic, nm]) => '<span data-a="' + a + '"><b>' + UI.esc(keyName(K[a])) + '</b>' + ic + ' ' + nm + '</span>').join(''); }
function flashBtn(pid, a){ const b = document.querySelector('.actpad[data-p="' + pid + '"] .sbtn[data-a="' + a + '"]'); if(b){ b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash'); } }
function updatePads(){
  if(!G) return;
  G.locals.forEach(p0 => {
    const b = document.querySelector('.actpad[data-p="' + p0.id + '"] .a-pyra'); if(!b) return; const p = PD.bodyOf(G.M, p0);   /* 🎮 pd-8a */
    const m = Math.round(p.meter); if(b._m !== m){ b._m = m; b.style.setProperty('--m', m + '%'); }
    const rp = b.closest('.actpad'); if(rp && rp.classList.contains('ring')){ rp.classList.toggle('pyra-on', p.meter >= PD.PYRA_COST || !!p.pyraArm); rp.classList.toggle('pyra-full', p.meter >= PD.SPIRIT_COST); }   // 🌼 pd-5d: 🔥 half = the whole group on fire · 💯 full = hotter fire
    b.classList.toggle('ready', p.meter >= PD.PYRA_COST && !p.pyraArm); b.classList.toggle('armed', !!p.pyraArm); b.classList.toggle('full', p.meter >= PD.SPIRIT_COST); b.classList.toggle('spirit', !!p.spiritArm);
  });
  if(isHoop(G.M) && Math.ceil(G.M.timeLeft) !== G.barT){ G.barT = Math.ceil(G.M.timeLeft); BAR.time(G.barT, G.barT < 10); }
  else if(G.M.drill && G.M.drill.time != null && !isHoop(G.M) && Math.ceil(G.M.drill.time) !== G.barT){ G.barT = Math.ceil(G.M.drill.time); BAR.time(G.barT, G.barT < 10); }
  const me = G.locals[0] && PD.bodyOf(G.M, G.locals[0]); if(me && Math.round(me.meter) !== G.barM){ G.barM = Math.round(me.meter); BAR.meter('pyra', '🔥', me.meter / 100, 'Pyra meter', me.meter >= 50); }
}
// 🌱 the next move glows (+ 👆 on Basic and the first Junior touches), one goal line on screen
function guided(){ const M = G.M; return M.lv.assist.slowmo === 1 || M.guidedLeft > 0; }
function updateGuideUi(){
  if(!G) return; const M = G.M, g = M.guide, hand = $('hand'), line = $('goal-line');
  const mine = g && G.locals.some(p => PD.bodyOf(M, p).id === g.p) && !G.over && M.phase !== 'point';
  const show = mine && (guided() || g.why === 'serve' || g.why === 'toss' || !!(M.drill && DRILL_WHY.includes(g.why)));
  document.querySelectorAll('.sbtn.glow, .keylegend .glow').forEach(el => { if(!show || el.dataset.a !== g.key) el.classList.remove('glow'); });
  const key = show ? (G.glowKey = g.p + ':' + g.key + ':' + g.why) : '';
  if(!show){ line.classList.add('off'); hand.classList.add('hidden'); G.goalTxt = ''; return; }
  const b = document.querySelector('.actpad[data-p="' + (ownerOf(M.players[g.p]) || {id: g.p}).id + '"] .sbtn[data-a="' + g.key + '"]') || document.querySelector('.keylegend [data-a="' + g.key + '"]');   /* 🎮 pd-8a: the pad belongs to your own seat */
  if(b) b.classList.add('glow');
  const GL = isHoop(M) ? GOAL_HOOP : PD.isSpark(M) ? GOAL_SPARK : PD.isStrike(M) ? GOAL_STRIKE : GOAL, gl = GL[g.why] || GL.bump, K = KEYS[localSeat(g.p)], kc = keyName(K[g.key]), kb = a => isTouch() ? '' : ' <kbd>' + UI.esc(keyName(K[a])) + '</kbd>';
  // serve on Junior+: the 3 serve kinds (💥 float · ⬆️ jump serve · 🪶 pinch) — Basic keeps the one-tap line
  const txt = !g.key ? gl[0] : PD.isSpark(M) ? gl[0] + (isTouch() ? '' : ' <kbd>' + UI.esc(kc) + '</kbd>') + (g.why === 'ssend' && M.level > 0 ? ' · 🪶 dink' + kb('dink') + ' · 💥 edge = 🪶 + ⚡' : '') : g.why === 'serve' && M.level > 0 ? (PD.isStrike(M) ? '🦶 Serve: 💥 kick' + kb('drive') + ' · ⬆️ power kick' + kb('jump') + ' · 🦶 tip' + kb('dink') : '🚀 Serve: 💥 float' + kb('drive') + ' · ⬆️ jump' + kb('jump') + ' · 🪶 pinch' + kb('dink')) : gl[0] + (isTouch() ? '' : ' <kbd>' + UI.esc(kc) + '</kbd>');
  if(G.goalTxt !== txt){ G.goalTxt = txt; line.innerHTML = txt; }
  line.classList.remove('off');
  const handOn = isTouch() && guided() && b && b.classList.contains('sbtn') && (g.reach || g.why === 'serve' || g.why === 'toss');
  hand.classList.toggle('hidden', !handOn);
  if(handOn){ const r = b.getBoundingClientRect(), s = $('stage').getBoundingClientRect(); hand.style.left = (r.left - s.left + r.width * 0.55) + 'px'; hand.style.top = (r.top - s.top + r.height * 0.55) + 'px'; }
}

/* ================= DRAWING =================
   Side view, 2.5D: x along the screen, y = depth (far = up the screen + a little to the right), z = up.
   ONE painter (drawScene) for play AND the arena preview cards. */
let V = null;
/* 📐 pd-5a court view (Aowu 21:57 "map squeeze"): only HR = 2.6 m of sky is kept over the far side (was 4.8 m — half the screen was empty),
   the court looks down more steeply to fill the rest, and a lob that leaves the top shows a ▲ marker (drawOffBall).
   📱 o.rot = phones held upright: the court TURNS — your side at the bottom, the net across the middle, the whole court on screen. */
const VIEW_HR = 2.6;
function makeView(W, H, M, o){
  o = o || {};
  const L = M.L, Wd = M.W, skewF = 0.4, HR = o.hr || VIEW_HR, FE = o.fext != null ? o.fext : 2.6, CB = o.cband || 2.4;   // 📱 pd-5b: short sideways phones pass less sky (hr), a thinner stands strip (fext) + crowd band (cband)
  const padB = o.padB || 0, padT = o.padT || 6, Hh = Math.max(40, H - padB - padT);
  if(o.rot){
    const Xn = L + 1.8, Yh = Wd / 2 + 0.9;
    const kx = W / (2 * Yh), ky = Hh / (2 * Xn * 0.34 + HR), k = Math.min(kx, ky);
    const depthF = Math.max(0.34, Math.min(1, (Hh / k - HR) / (2 * Xn)));
    const dp = 2 * Xn * depthF * k, slack = Math.max(0, Hh - dp - HR * k);
    return {W, H, k, dp, sk: 0, cx: W / 2, gy: H - padB - slack * 0.5, L, Wd, Xn, rot: true, camX: 0, follow: false, kx};
  }
  let depthF = o.d0 || 0.42; const ext0 = (Wd + FE) / Wd;
  const kx = W / (1.78 * (L + 1.4) + Wd * skewF), ky = Math.min(Hh / (Wd * ext0 * depthF + HR), o.crowd ? (Hh - (o.crowd - padT)) / (Wd * ext0 * depthF + CB) : 1e9);
  let k = Math.min(kx, ky), follow = false;
  if(o.zoom && kx < ky && kx < 30){ k = Math.min(ky, 30); follow = k > kx * 1.02; }   // tiny screens zoom in + the camera follows the ball
  // room to spare → look down on the court more (deeper court, less empty sky)
  // 📣 the crowd stands on a band above the far side: keep room for it (its band = 2.4 m + room for heads / signs) — still far less sky than before pd-5a
  const sky = Math.max(HR * k, o.crowd ? CB * k + o.crowd - padT : 0), ext = (Wd + FE) / Wd;   // ext: the floor reaches 2.6 m past the far line (the stands start there)
  depthF = Math.max(o.d0 || 0.42, Math.min(0.95, (Hh - sky) / (k * Wd * ext) * 0.95));
  const dp = Wd * depthF * k, sk = Wd * skewF * k, used = dp * ext + sky, slack = Math.max(0, Hh - used);
  return {W, H, k, dp, sk, cx: W / 2 - sk * 0.5, gy: H - padB - slack * 0.5, L, Wd, camX: 0, follow, kx, fe: FE};
}
function P(x, y, z){
  if(V.rot){ const d = (x + V.Xn) / (2 * V.Xn), s = 1 - 0.3 * d; return [V.cx + y * V.k * s, V.gy - d * V.dp - z * V.k * s, s]; }   // 📱 turned: x = up the screen (your side at the bottom), y = across
  const d = (V.Wd / 2 - y) / V.Wd, s = 1 - 0.22 * d; return [V.cx + (x - V.camX) * V.k * s + d * V.sk, V.gy - d * V.dp - z * V.k * s, s]; }
// the far edge of the floor on screen = where the stands start (📣 crowd + tests use it): side view = the far side line, turned = the far END
function farLineY(M){ return V.rot ? P(M.L + 4.5, 0, 0)[1] : P(0, -M.W / 2 - FEX(), 0)[1]; }
function FEX(){ return V && V.fe != null ? V.fe : 2.6; }   // 📱 pd-5b: how far the floor reaches past the far line (the stands start there)
// depth order key (far → near): side view = y, turned view = −x
function DK(x, y){ return V && V.rot ? -x : y; }
function resize(){
  if(!G) return; const st = $('stage').getBoundingClientRect(), cv = $('court');
  const dpr = Math.max(1, Math.min(2, (window.devicePixelRatio || 1)) * G.q);
  cv.width = Math.round(st.width * dpr); cv.height = Math.round(st.height * dpr); G.dpr = dpr;
  const touch = isTouch(), portrait = st.height > st.width * 1.05;
  const pcs = getComputedStyle($('pads')), pv = (k, d) => parseFloat(pcs.getPropertyValue(k)) || d;   // 🕹️ pd-5c: the pz-1 sizes
  const stEl = document.querySelector('#pads .stick'), stick = (stEl && stEl.offsetWidth) || pv('--stick', 150), padH = (window.UI && UI.pad && UI.pad.geo && !(G && G.locals && G.locals.length > 1)) ? UI.pad.geo(st.width, st.height, 4, {main: pv('--main', 92) + 4, btn: pv('--shot', 68) + 4}).h + 8 : (portrait ? 2 : 1) * (pv('--shot', 68) + pv('--pad-gap', 18) + 3) + pv('--main', 92) + pv('--pad-edge', 24) + 3;   // 🕹️ pz-1: UiKit vars (+ 3 px pulse room)
  const padB = touch ? (portrait ? Math.max(st.height * 0.34, stick + 40, padH * 0.85) : Math.min(stick * 0.42, st.height * 0.2)) : 30;
  // 📱 pd-5b (Aowu 16:29 "recheck all landscape screen of iphone … squeeze"): phones held SIDEWAYS are short (≈ 350–400 px of stage) →
  //   less sky over the far side (the far players' heads + a lob; spark / hoop players stand at the ends → even less), a thin top gap (the pills float over the crowd),
  //   a thinner stands strip + crowd band, and a steeper look-down (d0) so the court is a court, not a strip. Bigger screens are unchanged.
  const short = touch && !portrait && st.height < 520, hp = isHoop(G.M) || PD.isSpark(G.M);
  //   ⭕ Hoop keeps the old sky (the hoop hangs 3 m up over the middle) · ⚡ Spark keeps room for the names under the goal pill.
const vo = short ? {padB, padT: isHoop(G.M) ? 38 : PD.isSpark(G.M) ? 34 : 22, zoom: true, rot: false, crowd: 26, hr: PD.isSpark(G.M) ? 2.0 : isHoop(G.M) ? VIEW_HR : 2.15, fext: hp ? 0.8 : 1.0, cband: 1.7, d0: hp ? 0.5 : 0.46}
                   : {padB, padT: 42, zoom: true, rot: st.height > st.width * 1.15, crowd: 44};
  V = makeView(st.width, st.height, G.M, vo); V.short = short;   // 📱 pd-5a: upright = the turned court
  if(G.cam != null) V.camX = G.cam;
}
// 👀 pd-5c: every 5th frame, a control with a player (or the ball) behind it turns see-through; pressing it still works
function padThru(M){
  if((G.padN = (G.padN || 0) + 1) % 5) return;
  if(!G.padEls) G.padEls = [...document.querySelectorAll('#pads .sbtn, #pads .stick')];
  const st = $('stage').getBoundingClientRect(), pts = M.players.map(p => P(p.x, p.y, (p.z || 0) + 0.9)).concat([P(M.ball.x, M.ball.y, M.ball.z || 0)]);
  G.padEls.forEach(el => { const r = el.getBoundingClientRect(), on = pts.some(q => q[0] + st.left > r.left - 6 && q[0] + st.left < r.right + 6 && q[1] + st.top > r.top - 6 && q[1] + st.top < r.bottom + 6);
    if(on !== el.classList.contains('thru')) el.classList.toggle('thru', on); });
}
function draw(dt){
  const cv = $('court'), g = cv.getContext('2d'); if(!V || !G) return;
  const M = G.M;
  // camera: follow the ball when zoomed in (phones held upright)
  if(V.follow){ const half = V.W / (2 * V.k) - 0.6, lim = Math.max(0, M.L + 1.6 - half), tgt = Math.max(-lim, Math.min(lim, M.ball.x * 0.85)); G.cam = G.cam == null ? tgt : G.cam + (tgt - G.cam) * Math.min(1, dt * 3); V.camX = G.cam; }
  g.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
  let sh = 0; if(G.shake > 0){ G.shake -= dt; sh = G.shake * 30; }
  if(sh) g.translate((Math.random() - 0.5) * sh, (Math.random() - 0.5) * sh);
  drawScene(g, M, {t: performance.now() / 1000, live: true});
  drawSpiritFx(g, M); drawOffBall(g, M);   // 🔥🔥 pd-5a
  ctlFxDraw(g, M);   /* 🎮 pd-8a */
  padThru(M);   // 👀 pd-5c
  // particles + floating words
  G.fx = G.fx.filter(f => (f.t += dt) < f.life);
  G.fx.forEach(f => { f.x += f.vx * dt; f.y += f.vy * dt; f.z += f.vz * dt; f.vz -= 9 * dt; const [x, y] = P(f.x, f.y, Math.max(0, f.z)); g.globalAlpha = 1 - f.t / f.life; g.fillStyle = f.col; g.beginPath(); g.arc(x, y, 2.4 + 2 * (1 - f.t / f.life), 0, 7); g.fill(); });
  g.globalAlpha = 1;
  G.words = G.words.filter(w => (w.t += dt) < 1.1);
  g.textAlign = 'center'; g.font = '700 ' + Math.round(Math.max(13, V.k * 0.55)) + 'px Fredoka, sans-serif';
  G.words.forEach(w => { const [x, y] = P(w.x, w.y, w.z + w.t * 0.8); g.globalAlpha = Math.min(1, 1.6 - w.t * 1.4); g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,0.55)'; wordText(g, w.text, x, y, w.col); });
  g.globalAlpha = 1;
}
function wordText(g, text, x, y, col){
  // emoji at the start of a word go through the emoji sprite cache (emoji lag rule); the words stay text
  const m = text.match(/^(\S+)\s(.+)$/); let ic = '', rest = text;
  if(m && /[^\x00-\x7F]/.test(m[1]) && !/[A-Za-z]/.test(m[1])){ ic = m[1]; rest = m[2]; }
  const fs = parseFloat(g.font) || 14, w = g.measureText(rest).width, x0 = ic ? x + fs * 0.6 : x;
  g.strokeText(rest, x0, y); g.fillStyle = col || '#fff'; g.fillText(rest, x0, y);
  if(ic) emo(g, ic, x0 - w / 2 - fs * 0.62, y - fs * 0.36, fs * 1.05);
}
function drawScene(g, M, o){
  const t = o.t || 0, L = M.L, Wd = M.W;
  drawArena(g, M, t);
  // floor (free zone) + court
  const sand = M.sp.sand, tk = PD.isStrike(M), LK = arenaLook(M);   // 🦶 takraw court: green floor, teal court, service circles · 🎪 pd-4c theme colours (🏖️ Beach stays sand)
  const cA = tk ? (LK.tk ? LK.tk[0] : '#2FA37A') : LK.court ? LK.court[0] : '#E8813A', cB = tk ? (LK.tk ? LK.tk[1] : '#2C9B73') : LK.court ? LK.court[1] : '#E27832';
  const fy0 = V.rot ? -Wd / 2 - 12 : -Wd / 2 - FEX(), fy1 = V.rot ? Wd / 2 + 12 : Wd / 2 + 3.4;   // 📱 turned: the floor reaches both screen edges
  poly(g, [P(-L - 4.5, fy0, 0), P(L + 4.5, fy0, 0), P(L + 4.5, fy1, 0), P(-L - 4.5, fy1, 0)], sand ? '#E9C98A' : LK.floor || (tk ? '#1F7A57' : '#2B56B8'));
  const hp = isHoop(M) || PD.isSpark(M);   // ⭕ / ⚡ no court lines
  if(!hp) poly(g, [P(-L, -Wd / 2, 0), P(0, -Wd / 2, 0), P(0, Wd / 2, 0), P(-L, Wd / 2, 0)], sand ? '#F2D79E' : cA);
  if(!hp) poly(g, [P(0, -Wd / 2, 0), P(L, -Wd / 2, 0), P(L, Wd / 2, 0), P(0, Wd / 2, 0)], sand ? '#F0D398' : cB);
  if(isHoop(M)){ drawHoopFloor(g, M); }
  else if(PD.isSpark(M)) drawSparkFloor(g, M);
  else if(tk){ g.strokeStyle = LK.line || '#FFFFFF'; g.lineWidth = Math.max(1.5, V.k * 0.06);
    [-1, 1].forEach(sd => { const cu = (L - 2.45) * sd; g.beginPath(); for(let i = 0; i <= 24; i++){ const a = i / 24 * Math.PI * 2, q = P(cu + Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke();
      [-1, 1].forEach(sy => { g.beginPath(); for(let i = 0; i <= 12; i++){ const a = i / 12 * Math.PI / 2, q = P(sd * Math.sin(a) * 0.9, sy * (Wd / 2 - Math.cos(a) * 0.9), 0); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke(); }); }); }
  if(!sand && !tk && !hp){ g.globalAlpha = 0.12; for(let i = -L; i < L; i += 1.5) poly(g, [P(i, -Wd / 2, 0), P(i + 0.75, -Wd / 2, 0), P(i + 0.75, Wd / 2, 0), P(i, Wd / 2, 0)], '#FFFFFF'); g.globalAlpha = 1; }
  g.strokeStyle = sand ? '#2F7BEA' : LK.line || '#FFFFFF'; g.lineWidth = Math.max(1.5, V.k * 0.07); g.lineJoin = 'round';
  if(!hp){ line(g, [P(-L, -Wd / 2, 0), P(L, -Wd / 2, 0), P(L, Wd / 2, 0), P(-L, Wd / 2, 0), P(-L, -Wd / 2, 0)]);
  line(g, [P(0, -Wd / 2, 0), P(0, Wd / 2, 0)]); }
  if(M.sp.n >= 6){ g.globalAlpha = 0.7; line(g, [P(-3, -Wd / 2, 0), P(-3, Wd / 2, 0)]); line(g, [P(3, -Wd / 2, 0), P(3, Wd / 2, 0)]); g.globalAlpha = 1; }
  // 🎯 landing marker (aim help levels): where the ball will come down on YOUR side
  const lm = o.live && SET.marker && M.lv.aim > 0 && M.phase === 'rally' && M.landing && G.locals.some(p => p.team === M.landTeam) && M.lastTeam !== M.landTeam;
  if(lm){ const [x, y, s] = P(M.landing.x, M.landing.y, 0), r = V.k * 0.45 * s; g.save(); g.translate(x, y); g.scale(1, 0.4); g.strokeStyle = 'rgba(255,255,255,' + (0.55 + 0.3 * Math.sin(t * 8)) + ')'; g.lineWidth = 3; g.setLineDash([6, 5]); g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); g.setLineDash([]); g.restore(); }
  // ball shadow
  const b = M.ball; { const [x, y, s] = P(b.x, b.y, 0), sz = V.k * 0.18 * s * Math.max(0.35, 1 - b.z / 7); g.fillStyle = 'rgba(0,0,0,' + Math.max(0.1, 0.3 - b.z * 0.03) + ')'; g.beginPath(); g.ellipse(x, y, sz * 1.5, sz * 0.6, 0, 0, 7); g.fill(); }
  // people + ball sorted far → near; the net sits in the middle of the depth
  const objs = M.players.map(p => ({y: DK(p.x, p.y), f: () => drawPlayer(g, M, p, t, o)}));
  objs.push({y: DK(b.x, b.y) + 0.01, f: () => drawBall(g, M, t)});
  if(M.extras) M.extras.forEach(e => { if(e.live) objs.push({y: DK(e.x, e.y) + 0.01, f: () => drawExtra(g, M, e, t)}); });   // 🌀 Spark Party balls
  objs.sort((a, c) => a.y - c.y);
  let netDone = false;
  const net = isHoop(M) ? () => { if(!M.sp.noHoop) drawHoop(g, M, t); } : PD.isSpark(M) ? () => drawTable(g, M, t) : () => drawNet(g, M);
  const cut = PD.isSpark(M) ? -(V && V.rot ? PD.SPARK.L : PD.SPARK.W / 2) - 0.05 : 0;   // 🧺 pd-5e ⚡ the table is drawn before everything not fully behind it (the ball over its far half was hidden)
  objs.forEach(ob => { if(!netDone && ob.y >= cut){ net(); netDone = true; } ob.f(); });
  if(!netDone) net();
  if(o.live && !isHoop(M) && !PD.isSpark(M)) drawCounters(g, M);
}
// ⚡ PyraSpark: a play zone on the hall floor + the curved table with its low net
function drawSparkFloor(g, M){
  const L = M.L, Wd = M.W; poly(g, [P(-L - 0.6, -Wd / 2, 0), P(L + 0.6, -Wd / 2, 0), P(L + 0.6, Wd / 2, 0), P(-L - 0.6, Wd / 2, 0)], arenaLook(M).zone || '#24408F');
  g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = Math.max(1.5, V.k * 0.05); line(g, [P(-L - 0.6, -Wd / 2, 0), P(L + 0.6, -Wd / 2, 0), P(L + 0.6, Wd / 2, 0), P(-L - 0.6, Wd / 2, 0), P(-L - 0.6, -Wd / 2, 0)]);
  const T = PD.SPARK; g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); [P(-T.L, -T.W / 2, 0), P(T.L, -T.W / 2, 0), P(T.L, T.W / 2, 0), P(-T.L, T.W / 2, 0)].forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.fill();
}
function drawTable(g, M, t){
  const T = PD.SPARK, Z = T.Z, cz = x => Z - 0.07 * Math.pow(Math.abs(x) / T.L, 2);   // the ends curve down a little
  const TL = (typeof TableSkins !== 'undefined') ? TableSkins.look((G && G.M === M && G.look) ? G.look.table : LOOKS.table || 'classic') : {a: '#2F7BEA', b: '#1E66D0', side: '#1B2A55', line: '#FFFFFF', net: '#DDE6F5', legs: '#2B2F3A'};   // 🏓 pd-4c table look
  [[-T.L * 0.8, -T.W / 2 + 0.15], [T.L * 0.8, -T.W / 2 + 0.15], [-T.L * 0.8, T.W / 2 - 0.15], [T.L * 0.8, T.W / 2 - 0.15]].forEach(([x, y]) => { g.strokeStyle = TL.legs; g.lineWidth = Math.max(3, V.k * 0.08); line(g, [P(x, y, 0), P(x, y, cz(x) - 0.04)]); });
  const half = (a, b, hf) => { const pts = []; for(let i = 0; i <= 8; i++){ const x = a + (b - a) * i / 8; pts.push(P(x, -T.W / 2, cz(x))); } for(let i = 8; i >= 0; i--){ const x = a + (b - a) * i / 8; pts.push(P(x, T.W / 2, cz(x))); } if((typeof TableSkins !== 'undefined')) TableSkins.paintHalf(g, pts, TL, hf, t); else poly(g, pts, hf ? TL.b : TL.a);
    const side = []; for(let i = 0; i <= 8; i++){ const x = a + (b - a) * i / 8; side.push(P(x, T.W / 2, cz(x))); } for(let i = 8; i >= 0; i--){ const x = a + (b - a) * i / 8; side.push(P(x, T.W / 2, cz(x) - 0.07)); } poly(g, side, TL.side); };
  half(-T.L, 0, 0); half(0, T.L, 1);
  if(M.drill && M.drill.k === 'zone' && M.drill.zone){ const z = M.drill.zone, pts = [];   // 🎯 the glowing zone on the Coach's half
    for(let i = 0; i <= 6; i++){ const x = z.u0 + (z.u1 - z.u0) * i / 6; pts.push(P(x, z.v0, cz(x) + 0.005)); } for(let i = 6; i >= 0; i--){ const x = z.u0 + (z.u1 - z.u0) * i / 6; pts.push(P(x, z.v1, cz(x) + 0.005)); }
    g.globalAlpha = 0.45 + 0.25 * Math.sin(t * 6); poly(g, pts, '#FFE14A'); g.globalAlpha = 1; g.strokeStyle = '#FFF6B0'; g.lineWidth = Math.max(2, V.k * 0.06); g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.stroke();
    const c = P((z.u0 + z.u1) / 2, (z.v0 + z.v1) / 2, Z + 0.02); emo(g, '🎯', c[0], c[1] - V.k * 0.05, Math.max(14, V.k * 0.3), 0.9); }
  g.strokeStyle = TL.line; g.lineWidth = Math.max(1.5, V.k * 0.05); const edge = []; for(let i = 0; i <= 16; i++){ const x = -T.L + 2 * T.L * i / 16; edge.push(P(x, -T.W / 2, cz(x))); } for(let i = 16; i >= 0; i--){ const x = -T.L + 2 * T.L * i / 16; edge.push(P(x, T.W / 2, cz(x))); } edge.push(edge[0]); line(g, edge);
  // the net on the table
  const nh = M.netH, e = T.W / 2 + 0.06; g.strokeStyle = TL.net; g.lineWidth = Math.max(2, V.k * 0.06); line(g, [P(0, -e, Z), P(0, -e, nh)]); line(g, [P(0, e, Z), P(0, e, nh)]);
  g.fillStyle = 'rgba(15,20,40,0.55)'; g.beginPath(); [P(0, -e, Z), P(0, e, Z), P(0, e, nh), P(0, -e, nh)].forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.fill();
  g.strokeStyle = TL.line; g.lineWidth = Math.max(2, V.k * 0.07); line(g, [P(0, -e, nh), P(0, e, nh)]);
  const bl = M.ball; if(bl.held == null && Math.abs(bl.x) <= T.L && Math.abs(bl.y) <= T.W / 2 && bl.z >= cz(bl.x)){ const [x, y, s] = P(bl.x, bl.y, cz(bl.x)), h = bl.z - cz(bl.x), sz = V.k * 0.16 * s * Math.max(0.4, 1 - h / 3);   // 🧺 pd-5e the ball's shadow on the table top
    g.fillStyle = 'rgba(0,0,0,' + Math.max(0.12, 0.32 - h * 0.08).toFixed(3) + ')'; g.beginPath(); g.ellipse(x, y, sz * 1.4, sz * 0.55, 0, 0, 7); g.fill(); }
}
// ⭕ hoop takraw: the circle on the floor and the hoop hanging from three ropes
function drawHoopFloor(g, M){
  const H = PD.HOOP, ring = (r, z) => { const pts = []; for(let i = 0; i <= 36; i++){ const a = i / 36 * Math.PI * 2; pts.push(P(Math.cos(a) * r, Math.sin(a) * r, z)); } return pts; };
  const LK = arenaLook(M); poly(g, ring(H.RING + 0.9, 0), LK.tk ? LK.tk[1] : '#2C9B73'); g.strokeStyle = '#FFFFFF'; g.lineWidth = Math.max(1.5, V.k * 0.06); line(g, ring(H.RING + 0.9, 0)); g.globalAlpha = 0.5; line(g, ring(H.RING, 0)); g.globalAlpha = 1;
  if(!M.sp.noHoop){ g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); ring(H.R, 0).forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.fill(); }   // the hoop's shadow on the floor (not in 🤹 Keepy-up)
}
function drawHoop(g, M, t){
  const H = PD.HOOP, pts = []; for(let i = 0; i <= 40; i++){ const a = i / 40 * Math.PI * 2; pts.push(P(Math.cos(a) * H.R, Math.sin(a) * H.R, H.Z)); }
  g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1.5; [0, 2.1, 4.2].forEach(a => { const q = P(Math.cos(a) * H.R, Math.sin(a) * H.R, H.Z), top = P(0, 0, H.Z + 6); g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(top[0], top[1]); g.stroke(); });
  g.strokeStyle = '#7B4A12'; g.lineWidth = Math.max(4, V.k * 0.16); line(g, pts);
  g.strokeStyle = '#FFB627'; g.lineWidth = Math.max(2, V.k * 0.08); line(g, pts);
  const glow = M.shot && M.shot.pyra; if(glow){ g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 12); g.strokeStyle = '#FF6B1A'; g.lineWidth = Math.max(6, V.k * 0.3); line(g, pts); g.globalAlpha = 1; }
}
function poly(g, pts, fill){ g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = fill; g.fill(); }
function line(g, pts){ g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }
const CROWD = (() => { const a = [], cols = ['#FF6B1A', '#2F7BEA', '#FFC845', '#E5304B', '#7CC8FF', '#FFFFFF', '#9B7BFF']; let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; for(let i = 0; i < 220; i++) a.push([r(), r(), cols[Math.floor(r() * cols.length)], r()]); return a; })();
// ⚡ pd-1c: sky + stands + crowd dots are painted once per screen size into 4 pictures (crowd bob in 4 steps) — not 220 dots every frame
const ARENA_BG = {key: '', c: []};
function arenaBg(M, W, H, farY, top, ph){
  const LK = arenaLook(M), dpr = (G && G.dpr) || 1, key = [arenaKey(M), Math.round(W), Math.round(H), Math.round(farY), Math.round(top), dpr, V.k.toFixed(2)].join('|');
  if(ARENA_BG.key !== key){ ARENA_BG.key = key; ARENA_BG.c = []; }
  let c = ARENA_BG.c[ph]; if(c) return c;
  c = document.createElement('canvas'); c.width = Math.ceil((W + 40) * dpr); c.height = Math.ceil((H + 40) * dpr);
  const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 20 * dpr, 20 * dpr);
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, LK.sky[0]); gr.addColorStop(0.55, LK.sky[1]); gr.addColorStop(1, LK.sky[2]); g.fillStyle = gr; g.fillRect(-20, -20, W + 40, H + 40);
  if(LK.deco) arenaDeco(g, LK.deco, W, H, farY, top, ph, 'far');
  // stands: rows of people dots behind the far side (the 📣 CheerSquad crowd comes in front of them later)
  if(farY - top > 10){
    const sg = g.createLinearGradient(0, top, 0, farY); sg.addColorStop(0, LK.stand[0]); sg.addColorStop(1, LK.stand[1]); g.fillStyle = sg; g.globalAlpha = LK.deco ? 0.72 : 1; g.fillRect(0, top, W, farY - top); g.globalAlpha = 1;
    if(LK.deco) arenaDeco(g, LK.deco, W, H, farY, top, ph, 'near');
    const n = Math.min(CROWD.length, Math.round(W / 9)), r = Math.max(1.4, Math.min(5, V.k * 0.09));
    g.globalAlpha = LK.crowd;
    for(let i = 0; i < n; i++){ const [a, b2, col, phs] = CROWD[i], x = a * W, y = top + 4 + b2 * (farY - top - 8), bob = Math.sin(ph * Math.PI / 2 + phs * 9) * 1.2; g.fillStyle = col; g.beginPath(); g.arc(x, y + bob, r, 0, 7); g.fill(); }
    g.globalAlpha = 1;
  }
  else if(LK.deco) arenaDeco(g, LK.deco, W, H, farY, top, ph, 'near');
  ARENA_BG.c[ph] = c; return c;
}
/* 🎪 pd-4c scenery, painted ONCE per screen size into the 4 cached background pictures (ph = 0..3 = a small animation step).
   'far' = behind the stands (sky, horizon) · 'near' = on the stands band. Everything sits on the horizon line farY. */
function arenaDeco(g, d, W, H, farY, top, ph, layer){
  const hz = farY, sk = Math.max(20, hz), u = Math.max(4, Math.min(W, 1400) / 60), R = (() => { let s = 11 + d.length * 7; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })();
  const tri = (x0, y0, x1, y1, x2, y2, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineTo(x2, y2); g.closePath(); g.fill(); };
  const puff = (x, y, s, c) => { g.fillStyle = c; [[0, 0, 1], [-0.9, 0.15, 0.7], [0.9, 0.2, 0.75], [-0.4, -0.45, 0.65], [0.45, -0.4, 0.6]].forEach(([dx, dy, r]) => { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 7); g.fill(); }); };
  if(d === 'jungle'){
    if(layer === 'far'){ const vx = W * 0.7, vh = Math.min(sk * 0.85, H * 0.4); tri(vx - vh * 1.2, hz, vx, hz - vh, vx + vh * 1.2, hz, '#6A4A3A'); tri(vx - vh * 0.22, hz - vh * 0.82, vx, hz - vh, vx + vh * 0.22, hz - vh * 0.82, '#FF6B1A');
      puff(vx + ph * u * 0.4, hz - vh - u * (1.5 + ph * 0.3), u * 1.2, 'rgba(120,110,110,0.55)'); puff(vx + u * 1.5 + ph * u * 0.5, hz - vh - u * (3.6 + ph * 0.3), u * 0.9, 'rgba(140,130,130,0.4)');
      g.fillStyle = '#3F7A3A'; for(let i = 0; i < 14; i++){ const x = R() * W, r = u * (1.6 + R() * 1.8); g.beginPath(); g.arc(x, hz, r, Math.PI, 0); g.fill(); } }
    else { [[0.05, 1], [0.95, -1], [0.18, 1], [0.84, -1]].forEach(([fx, dir], i) => { const x = W * fx, h = Math.min(sk, H * 0.5) * (i < 2 ? 0.95 : 0.7), tx = x + dir * h * 0.18, ty = hz - h;
        g.strokeStyle = '#7A5230'; g.lineWidth = u * (i < 2 ? 0.9 : 0.65); g.beginPath(); g.moveTo(x, hz); g.quadraticCurveTo(x + dir * h * 0.02, hz - h * 0.5, tx, ty); g.stroke();
        g.strokeStyle = '#2E8B3A'; g.lineWidth = u * 0.55; for(let k = 0; k < 6; k++){ const a = -Math.PI / 2 + (k - 2.5) * 0.55 + Math.sin(ph * 1.57 + k) * 0.05, L = h * 0.3; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * L * 0.6, ty + Math.sin(a) * L * 0.6 - L * 0.2, tx + Math.cos(a) * L, ty + Math.sin(a) * L + L * 0.35); g.stroke(); } }); }
  }
  else if(d === 'coral'){
    if(layer === 'far'){ g.fillStyle = 'rgba(255,255,255,0.05)'; for(let i = 0; i < 5; i++){ const x = W * (0.1 + i * 0.2); g.beginPath(); g.moveTo(x, 0); g.lineTo(x + W * 0.06, 0); g.lineTo(x + W * 0.16, hz); g.lineTo(x + W * 0.04, hz); g.closePath(); g.fill(); }
      g.fillStyle = 'rgba(10,40,60,0.55)'; for(let i = 0; i < 4; i++){ const x = (R() * W + ph * u * 2 * (i % 2 ? 1 : -1) + W) % W, y = hz * (0.2 + R() * 0.5), s = u * (0.8 + R()); g.beginPath(); g.ellipse(x, y, s * 1.4, s * 0.6, 0, 0, 7); g.fill(); tri(x + s * 1.2, y, x + s * 2.2, y - s * 0.7, x + s * 2.2, y + s * 0.7, 'rgba(10,40,60,0.55)'); } }
    else { const cols = ['#FF7A8A', '#FFB05E', '#C77DFF', '#FF5FA2']; for(let i = 0; i < 9; i++){ const x = W * (i + 0.3 + R() * 0.4) / 9, h = Math.min(sk * 0.6, H * 0.25) * (0.5 + R() * 0.5); g.strokeStyle = cols[i % 4]; g.lineWidth = u * 0.5; g.lineCap = 'round';
        const br = (x0, y0, a, L, n) => { if(n <= 0 || L < 2) return; const x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); br(x1, y1, a - 0.45, L * 0.7, n - 1); br(x1, y1, a + 0.4, L * 0.65, n - 1); }; br(x, hz, -Math.PI / 2, h * 0.42, 3); }
      g.strokeStyle = '#2FAE6A'; g.lineWidth = u * 0.45; for(let i = 0; i < 7; i++){ const x = W * (i + 0.7) / 7, h = Math.min(sk * 0.7, H * 0.3) * (0.6 + R() * 0.4); g.beginPath(); g.moveTo(x, hz); for(let k = 1; k <= 6; k++) g.lineTo(x + Math.sin(k * 1.4 + ph * 1.57 + i) * u * 0.9, hz - h * k / 6); g.stroke(); }
      g.lineCap = 'butt'; g.strokeStyle = 'rgba(220,250,255,0.7)'; g.lineWidth = 1.2; for(let i = 0; i < 14; i++){ const x = R() * W, y = hz - ((R() * hz + ph * u * 2.2) % Math.max(10, hz)); g.beginPath(); g.arc(x, y, u * (0.18 + R() * 0.3), 0, 7); g.stroke(); } }
  }
  else if(d === 'neon'){
    if(layer === 'far'){ const cols = ['#FF4FD8', '#3CF2FF', '#FFE14A', '#7CFF6B']; g.lineWidth = Math.max(2, u * 0.3);
      for(let i = 0; i < 3; i++){ g.strokeStyle = cols[(i + ph) % 4]; g.globalAlpha = 0.8; g.beginPath(); g.ellipse(W / 2, hz, W * (0.18 + i * 0.12), Math.min(sk * 0.9, H * 0.45) * (0.5 + i * 0.25), 0, Math.PI, 0); g.stroke(); } g.globalAlpha = 1;
      g.fillStyle = '#FFFFFF'; for(let i = 0; i < 30; i++){ g.globalAlpha = ((i + ph) % 4) / 5 + 0.1; g.fillRect(R() * W, R() * hz * 0.8, 2, 2); } g.globalAlpha = 1; }
    else { g.strokeStyle = 'rgba(255,79,216,0.45)'; g.lineWidth = 1.5; for(let i = 0; i <= 16; i++){ const x = W * i / 16; g.beginPath(); g.moveTo(W / 2 + (x - W / 2) * 0.4, top); g.lineTo(x, hz); g.stroke(); } for(let i = 0; i < 4; i++){ const y = top + (hz - top) * (1 - Math.pow(0.6, i + 1)); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } }
  }
  else if(d === 'robot'){
    if(layer === 'far'){ g.strokeStyle = '#56616F'; g.lineWidth = Math.max(2, u * 0.35); const ty = Math.max(top * 0.3, 8); g.beginPath(); g.moveTo(0, ty); g.lineTo(W, ty); g.moveTo(0, ty + u * 2); g.lineTo(W, ty + u * 2); g.stroke(); for(let x = 0; x < W; x += u * 4){ g.beginPath(); g.moveTo(x, ty); g.lineTo(x + u * 2, ty + u * 2); g.lineTo(x + u * 4, ty); g.stroke(); }
      [[0.12, 1], [0.86, -1], [0.5, 1]].forEach(([fx, dir], i) => { const cx = W * fx, cy = hz - Math.min(sk * 0.45, H * 0.22) * (i === 2 ? 1.2 : 1), r = u * (i === 2 ? 2.4 : 3.2), a0 = dir * ph * Math.PI / 16; g.fillStyle = i === 2 ? '#8A96A6' : '#6F7B8A';
        g.beginPath(); for(let k = 0; k < 24; k++){ const a = a0 + k * Math.PI / 12, rr2 = k % 2 ? r : r * 1.22; g.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); } g.closePath(); g.fill(); g.fillStyle = '#2D3745'; g.beginPath(); g.arc(cx, cy, r * 0.38, 0, 7); g.fill(); }); }
    else { const bh = Math.max(4, u * 0.8); g.save(); g.beginPath(); g.rect(0, hz - bh, W, bh); g.clip(); g.fillStyle = '#FFD23F'; g.fillRect(0, hz - bh, W, bh); g.fillStyle = '#1F252E'; for(let x = -bh * 2 + (ph * bh) % (bh * 2); x < W + bh; x += bh * 2){ g.beginPath(); g.moveTo(x, hz); g.lineTo(x + bh, hz - bh); g.lineTo(x + bh * 2, hz - bh); g.lineTo(x + bh, hz); g.closePath(); g.fill(); } g.restore(); }
  }
  else if(d === 'moon'){
    if(layer === 'far'){ for(let i = 0; i < 90; i++){ const x = R() * W, y = R() * hz, tw = ((i + ph) % 4) / 4; g.fillStyle = 'rgba(255,255,255,' + (0.35 + tw * 0.6).toFixed(2) + ')'; g.fillRect(x, y, i % 9 ? 1.5 : 2.5, i % 9 ? 1.5 : 2.5); }
      const ex = W * 0.78, ey = Math.max(u * 3, hz * 0.32), er = Math.min(u * 3.2, Math.max(u * 1.4, hz * 0.22)); const eg = g.createRadialGradient(ex - er * 0.3, ey - er * 0.3, er * 0.1, ex, ey, er); eg.addColorStop(0, '#9AD7FF'); eg.addColorStop(1, '#1E5BB8'); g.fillStyle = eg; g.beginPath(); g.arc(ex, ey, er, 0, 7); g.fill();
      g.fillStyle = '#4CB963'; [[-0.3, -0.2, 0.35], [0.3, 0.25, 0.28], [0.1, -0.5, 0.18]].forEach(([dx, dy, r]) => { g.beginPath(); g.arc(ex + dx * er, ey + dy * er, r * er, 0, 7); g.fill(); }); }
    else { g.fillStyle = '#6D6E7E'; g.beginPath(); g.moveTo(0, hz); for(let i = 0; i <= 12; i++) g.lineTo(W * i / 12, hz - (hz - top) * (0.25 + 0.2 * Math.sin(i * 1.9))); g.lineTo(W, hz); g.closePath(); g.fill();
      g.fillStyle = 'rgba(40,40,55,0.35)'; for(let i = 0; i < 8; i++){ const x = R() * W, y = hz - (hz - top) * R() * 0.25, r = u * (0.6 + R() * 1.2); g.beginPath(); g.ellipse(x, y, r, r * 0.35, 0, 0, 7); g.fill(); } }
  }
  else if(d === 'olympus'){
    if(layer === 'far'){ g.fillStyle = 'rgba(255,240,180,0.55)'; g.beginPath(); g.arc(W * 0.15, Math.max(u * 3, hz * 0.25), u * 2.6, 0, 7); g.fill();
      for(let i = 0; i < 6; i++) puff((R() * W + ph * u * 1.5) % (W + u * 6) - u * 3, hz * (0.15 + R() * 0.55), u * (1.4 + R() * 1.4), 'rgba(255,255,255,0.85)');
      const ch = Math.min(sk * 0.8, H * 0.38), cw = u * 1.3; [0.06, 0.2, 0.8, 0.94].forEach(fx => { const x = W * fx; g.fillStyle = '#F4EFE3'; g.fillRect(x - cw / 2, hz - ch, cw, ch); g.fillStyle = '#D9D0BC'; for(let k = -1; k <= 1; k++) g.fillRect(x + k * cw * 0.3 - 1, hz - ch, 2, ch); g.fillStyle = '#E8DFC9'; g.fillRect(x - cw * 0.8, hz - ch - u * 0.6, cw * 1.6, u * 0.6); g.fillStyle = '#D9A93A'; g.fillRect(x - cw * 0.8, hz - ch - u * 0.8, cw * 1.6, u * 0.25); }); }
    else { for(let i = 0; i < 9; i++) puff(W * (i + 0.5) / 9, hz - u * 0.4, u * (1.2 + R() * 0.8), 'rgba(255,255,255,0.9)'); }
  }
  else if(d === 'fair'){
    if(layer === 'far'){ const rx = W * 0.5, rh = Math.min(sk * 0.85, H * 0.42), rw = Math.min(W * 0.32, rh * 1.6);   // 🛕 a temple roof: three tiers, gold edges
      g.fillStyle = '#3A1A2A'; g.fillRect(rx - rw * 0.42, hz - rh * 0.4, rw * 0.84, rh * 0.4);
      [[0.4, 1], [0.66, 0.72], [0.88, 0.46]].forEach(([fy, fw]) => { const y = hz - rh * fy, w = rw * fw; tri(rx - w * 0.62, y + rh * 0.08, rx, y - rh * 0.22, rx + w * 0.62, y + rh * 0.08, '#B23A2A'); g.strokeStyle = '#FFC845'; g.lineWidth = Math.max(1.5, u * 0.25); g.beginPath(); g.moveTo(rx - w * 0.62, y + rh * 0.08); g.lineTo(rx, y - rh * 0.22); g.lineTo(rx + w * 0.62, y + rh * 0.08); g.stroke(); });
      g.strokeStyle = '#FFC845'; g.lineWidth = Math.max(1.5, u * 0.3); g.beginPath(); g.moveTo(rx, hz - rh * 1.1); g.lineTo(rx, hz - rh * 1.3); g.stroke(); }
    else { const cols = ['#FF5E5E', '#FFC845', '#4CD964', '#5EB0FF', '#FF7AD9'];   // strings of fair lanterns
      [0.25, 0.55].forEach((fy, j) => { const y0 = top + (hz - top) * fy * 0.6 + 4; g.strokeStyle = 'rgba(40,20,10,0.6)'; g.lineWidth = 1; g.beginPath(); for(let i = 0; i <= 20; i++){ const x = W * i / 20, y = y0 + Math.sin(i / 20 * Math.PI * 4) * u * 0.6; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
        for(let i = 0; i < 20; i++){ const x = W * (i + 0.5) / 20, y = y0 + Math.sin((i + 0.5) / 20 * Math.PI * 4) * u * 0.6 + u * 0.5; g.fillStyle = cols[(i + j + ph) % 5]; g.globalAlpha = 0.85; g.beginPath(); g.ellipse(x, y, u * 0.38, u * 0.5, 0, 0, 7); g.fill(); } g.globalAlpha = 1; }); }
  }
}
function drawArena(g, M, t){
  const W = V.W, H = V.H, farY = farLineY(M);
  const top = Math.max(V.short ? Math.max(28, farY * 0.33) : 0, farY - Math.min(V.k * 2.4, farY - 4));   // 📱 pd-5b: short sideways = room over the fans' signs
  const bg = arenaBg(M, W, H, farY, top, Math.floor(t * 4) % 4); g.drawImage(bg, -20, -20, W + 40, H + 40);
  // spotlights (🪩 neon = coloured beams that sweep · ☁️ Olympus = warm sun rays · 🐙 / 🦖 / 🪐 none)
  const LK = arenaLook(M);
  if(LK.spot === 'white' || LK.spot === 'sun'){ g.globalAlpha = (LK.spot === 'sun' ? 0.16 : 0.09) + 0.03 * Math.sin(t * 1.3); g.fillStyle = LK.spot === 'sun' ? '#FFF1B8' : '#FFF4D6';
    [[0.12, 1], [0.88, -1]].forEach(([fx, d]) => { g.beginPath(); g.moveTo(W * fx, 0); g.lineTo(W * fx + d * W * 0.08, 0); g.lineTo(W * 0.5 + d * W * 0.22, H); g.lineTo(W * 0.5 - d * W * 0.05, H); g.closePath(); g.fill(); }); }
  else if(LK.spot === 'neon'){ ['#FF4FD8', '#3CF2FF', '#FFE14A'].forEach((c, i) => { const sw = Math.sin(t * 0.9 + i * 2.1) * W * 0.25, fx = W * (0.2 + i * 0.3); g.globalAlpha = 0.1; g.fillStyle = c; g.beginPath(); g.moveTo(fx - W * 0.015, 0); g.lineTo(fx + W * 0.015, 0); g.lineTo(fx + sw + W * 0.1, H); g.lineTo(fx + sw - W * 0.1, H); g.closePath(); g.fill(); }); }
  g.globalAlpha = 1;
  cheerScene(g, M, W, H, farY, top); /* 📣 cs-pd */
  // big screen (score) when there is room above the stands
  if(top > 150 && G && G.M === M){ const bw = Math.min(220, W * 0.3), bx = W / 2 - bw / 2, by = top - 44;
    g.fillStyle = '#05081A'; rr(g, bx, by, bw, 34, 8); g.fill(); g.strokeStyle = '#FF6B1A'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#FFE9D6'; g.font = '700 20px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(M.drill ? M.sp.icon + '  ' + M.drill.score : M.teams[0].score + '  :  ' + M.teams[1].score, W / 2, by + 18); g.textBaseline = 'alphabetic'; }
}
function rr(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function drawNet(g, M){
  const Wd = M.W, h = M.netH, e = Wd / 2 + 0.45;
  g.strokeStyle = '#1B1F33'; g.lineWidth = Math.max(3, V.k * 0.14);
  line(g, [P(0, -e, 0), P(0, -e, h + 0.12)]);
  // mesh
  poly(g, [P(0, -e, h), P(0, e, h), P(0, e, h - 0.9), P(0, -e, h - 0.9)], 'rgba(255,255,255,0.14)');
  g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1; g.beginPath();
  for(let y = -e; y <= e + 0.01; y += 0.35){ const a = P(0, y, h), b = P(0, y, h - 0.9); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  for(let z = h - 0.9; z <= h; z += 0.3){ const a = P(0, -e, z), b = P(0, e, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  g.stroke();
  g.strokeStyle = '#FFFFFF'; g.lineWidth = Math.max(2.5, V.k * 0.1); line(g, [P(0, -e, h), P(0, e, h)]);
  // antennas
  [-Wd / 2, Wd / 2].forEach(y => { g.lineWidth = Math.max(2, V.k * 0.06); for(let i = 0; i < 4; i++){ g.strokeStyle = i % 2 ? '#FFFFFF' : '#E5304B'; line(g, [P(0, y, h + i * 0.2), P(0, y, h + (i + 1) * 0.2)]); } });
  g.strokeStyle = '#1B1F33'; g.lineWidth = Math.max(3, V.k * 0.14); line(g, [P(0, e, 0), P(0, e, h + 0.12)]);
}
const GEST = {cheer: 'cheer', oops: 'shrug'};
/* 🎬 pd-6a REAL ACTIONS (Aowu 00:37 "the action need to real represent that action") — 🧱 B1 beat timeline (Acting.play / run.at) + our 🎭 BLOCK pyradive.
   THE ENGINE OWNS CONTACT: the picture follows the touch, the touch never waits for the picture.
   🙌 bump: the receiver of a first touch starts the wind-up when the predicted contact (M.assignT + M.cp.t) is ≤ 0.45 s away (held just short of
   contact) → the real touch replays the act with contact = that moment → contact pose · follow-through · settle.
   🦘 jump: stretch at take-off → airborne pose · 🛬 landing squash → ready. Frames are sampled every 50 ms so the picture cache stays small (cache 260 → 400 pictures, plan §6). */
const BEAT_STEP = 0.05, BEAT_LEAD = 0.45, BEAT_G = 15.5;   // BEAT_G = the engine's PGRAV (players fall at 15.5 m/s²)
/* 🏐 pd-6b (plan `claude/pyradive-actions-plan.md` §2): every volleyball move gets its beats — 🫳 dig · 🤲 set · 💥 spike · 🪶 dink · 🏐 serve + drive ·
   🧱 block · 🤸 dive (+ 🦘 jump serve = the spike in the air). The engine's touch frame is ALWAYS the contact beat; wind-ups start early when the
   moment is known (the receiver of touch 1 / 2, a robot about to serve, a person charging a serve, a spiker in the air) and are held just short of
   contact. Feet sports (🦶 ⭕ ⚡) keep their old poses until pd-6c (jump + land already have beats). */
const BEAT_OF = {bump: 'pyradive.bump', dig: 'pyradive.dig', set: 'pyradive.set', dunk: 'pyradive.spike', dink: 'pyradive.dink', drive: 'pyradive.drive', serve: 'pyradive.serve', block: 'pyradive.block', dive: 'pyradive.dive'};
const BEAT_HAS = {};
function beatsOn(){ return typeof Acting !== 'undefined' && Acting.play && Acting.beatsOf && !!Acting.beatsOf('pyradive.bump'); }
function hasBeat(key){ return key && (BEAT_HAS[key] != null ? BEAT_HAS[key] : (BEAT_HAS[key] = !!(beatsOn() && Acting.beatsOf(key)))); }
function beatKeyOf(p){ const a = p.act; if(!a) return null; const k = BEAT_OF[(a === 'serve' || a === 'drive') && p.z > 0.1 ? 'dunk' : a]; return hasBeat(k) ? k : null; }
/* 🦶 pd-6c (plan `claude/pyradive-actions-plan.md` §12): takraw FEET moves in 🦶 PyraStrike + ⭕ Hoop — the engine names the touch (p.act + p.style),
   the picture follows: dig → 🦶 inside pass · bump → 🦵 knee · set → 🗣️ header · dink → 👠 heel · drive / serve / a dunk from the floor → swinging kick ·
   a dunk in the air → 🌀 roll strike (🚲 bicycle when p.style = 'bicycle', then it lands on the back + rolls up) · 🧱 block = back to the net, legs up ·
   🧺 the toss (Strike tosser · Hoop self-toss). Contact = the engine's touch frame, wind-ups held just short of it. ⚡ Spark keeps its poses (pd-6d). */
const FEET_OF = {dig: 'pyradive.kpass', bump: 'pyradive.knee', set: 'pyradive.header', dink: 'pyradive.heel', drive: 'pyradive.kserve', serve: 'pyradive.kserve'};
function feetOn(M){ return PD.isStrike(M) && hasBeat('pyradive.kpass'); }
function feetKeyOf(p){ const a = p.act; if(!a) return null; const k = a === 'dunk' ? (p.style === 'bicycle' ? 'pyradive.bicycle' : p.z > 0.1 ? 'pyradive.kroll' : 'pyradive.kserve') : FEET_OF[a]; return hasBeat(k) ? k : null; }
function feetLow(z){ return z < 0.75 ? 'pyradive.kpass' : z < 1.75 ? 'pyradive.knee' : 'pyradive.header'; }   // the body part by the ball's height (= doTouch: dig < 0.75 m ≤ bump < 1.75 m ≤ set)
// 🖼️ beat frames are rounded a little (angles to 1/6 rad, body shifts to 2 px) so blended in-betweens share pictures — the cache stays small with 11 moves
function bQ(pose){ const o = {}; for(const n in pose){ const v = pose[n]; o[n] = typeof v !== 'number' ? v : n === 'dy' ? Math.round(v / 2) * 2 : n === 'sx' || n === 'sy' ? Math.round(v * 25) / 25 : n === 'platform' ? Math.round(v * 2) / 2 : Math.round(v * 6) / 6; } return o; }
function bRun(M, p, key, t0, contactAt){ const B = p.bt; B.run = Acting.play({name: p.name, av: p.av}, key, {t0, contactAt, from: B.last || undefined, speed: M.level === 0 ? 1.15 : 1}); B.key = key; B.t0 = t0; B.cap = null; return B.run; }
function bHold(M, p, key, t0, tc){ bRun(M, p, key, t0, tc); p.bt.cap = tc - 0.03; }   // play up to just short of contact and wait there for the real touch
function beatPose(M, p){
  if(!p.av || !beatsOn()) return null;
  const now = M.t, B = p.bt || (p.bt = {}), hands = !PD.noHands(M), T = p.team;
  if(hands){
    const ak = p.act && p.actT < 0.15 ? beatKeyOf(p) : null;
    // 1 · the real touch: contact = the engine's touch moment (a touch inside a dive keeps the dive going)
    if(ak && !(p.act === 'dive' && B.key === 'pyradive.dive')){ const tc = Math.round((now - p.actT) * 1000) / 1000; if(B.touch !== tc){ B.touch = tc; bRun(M, p, ak, tc, tc); } }
    // 2 · 🤸 dive: the launch is 0.12 s after the press (the crouch + lean show while the body starts to move)
    else if(p.dive && B.dive !== p.dive && hasBeat('pyradive.dive')){ B.dive = p.dive; bRun(M, p, 'pyradive.dive', now, now + 0.12); }
    // 3 · wind-up before the ball arrives: touch 1 = 🙌 bump (🫳 dig when it comes in low) · touch 2 = 🤲 set · a low 3rd ball = bump
    else if(M.phase === 'rally' && M.recv[T] === p.id && M.cp[T] && p.z === 0 && !p.dive && (!p.act || p.actT > 0.5)){
      const n = M.side === T ? M.n : 0, cp = M.cp[T], tc = M.assignT + cp.t, lead = tc - now;
      let key = n === 0 ? (cp.z < 0.75 ? 'pyradive.dig' : 'pyradive.bump') : n === 1 ? 'pyradive.set' : cp.z < 1.75 ? 'pyradive.bump' : null;
      if(key && !hasBeat(key)) key = n === 0 ? 'pyradive.bump' : null;
      if(key && lead > 0 && lead <= BEAT_LEAD && !(B.key === key && B.cap != null)) bHold(M, p, key, now, tc);
      else if(!key && B.cap != null && !B.air){ B.run = null; B.key = null; B.cap = null; }
    }
    // 4 · 🏐 float serve: toss + draw back while a person charges, or just before a robot serves → held until the hit
    else if(M.phase === 'serve' && M.ball.held === p.id && !p.jumpServe && !p.feed && p.z === 0 && hasBeat('pyradive.serve') && (p.charge >= 0 || (!PD.isPerson(p) && M.phaseT > M.serveWait - 0.35))){
      if(!(B.key === 'pyradive.serve' && B.cap != null)) bHold(M, p, 'pyradive.serve', now, now + 0.33);
    }
    else if(B.cap != null && !B.air){ B.run = null; B.key = null; B.cap = null; }   // the ball went elsewhere: let go (the next run blends from here)
  }
  else if(feetOn(M)){   // 🦶 pd-6c
    const fk = p.act && p.actT < 0.15 ? feetKeyOf(p) : null, hoop = isHoop(M), b = M.ball, held = B.cap != null;
    // 1 · the real touch: contact = the engine's touch moment
    if(fk){ const tc = Math.round((now - p.actT) * 1000) / 1000; if(B.touch !== tc){ B.touch = tc; bRun(M, p, fk, tc, tc); B.bike = fk === 'pyradive.bicycle'; } }
    // 2 · 🧺 the toss — Strike: the tosser lets go when the feed starts · Hoop: the holder throws it up to himself (the launch)
    else if(hoop && M.phase === 'rally' && M.tosser === p.id && M.lastP == null && now - b.hitT < 0.2 && hasBeat('pyradive.toss')){ if(B.touch !== b.hitT){ B.touch = b.hitT; bRun(M, p, 'pyradive.toss', b.hitT, b.hitT); } }
    else if(M.phase === 'serve' && hasBeat('pyradive.toss') && (hoop ? b.held === p.id : M.feeder === p.id && b.held !== p.id)){
      const sv = hoop ? p : M.players.find(q => q.id === b.held), fed = !hoop && sv && sv.feed;
      if(fed){ if(B.touch !== fed.t0){ B.touch = fed.t0; bRun(M, p, 'pyradive.toss', fed.t0, fed.t0); } }
      else {   // a robot decides when: the wind-up shows just before (a person's tap plays it from the release)
        const tc = hoop ? (PD.isPerson(p) ? null : now - M.phaseT + PD.HOOP.UP) : (sv && !PD.isPerson(sv) && !PD.isPerson(p) ? now - M.phaseT + M.serveWait : null);
        if(tc != null && tc - now > 0 && tc - now <= BEAT_LEAD){ if(!(B.key === 'pyradive.toss' && held)) bHold(M, p, 'pyradive.toss', now, tc); }
      }
    }
    // 3 · 🦶 the server: swing leg draws back while the toss flies, the kick lands when the ball reaches the foot (= the engine's serve)
    else if(!hoop && M.phase === 'serve' && b.held === p.id && p.feed && hasBeat('pyradive.kserve')){
      if(!(B.key === 'pyradive.kserve' && held)) bHold(M, p, 'pyradive.kserve', now, p.feed.t0 + (p.feed.T || 0.6));
    }
    // 4 · wind-up before the ball arrives — Strike: the receiver of touch 1 / 2 (a low 3rd ball too) by the height it will meet the body
    else if(!hoop && M.phase === 'rally' && M.recv[T] === p.id && M.cp[T] && p.z === 0 && !p.dive && (!p.act || p.actT > 0.5)){
      const n = M.side === T ? M.n : 0, cp = M.cp[T], tc = M.assignT + cp.t, lead = tc - now, key = n <= 1 || cp.z < 1.75 ? feetLow(cp.z) : null;
      if(key && hasBeat(key) && lead > 0 && lead <= BEAT_LEAD && !(B.key === key && held)) bHold(M, p, key, now, tc);
      else if(!key && held && !B.air){ B.run = null; B.key = null; B.cap = null; }
    }
    // 4b · ⭕ Hoop: the next touch comes when the ball drops into reach (≈ 2.4 m over the feet) — a header for robots, people when they pressed
    else if(hoop && M.phase === 'rally' && M.recv[T] === p.id && p.z === 0 && (!PD.isPerson(p) || p.want) && (!p.act || p.actT > 0.5) && hasBeat('pyradive.header')){
      if(B.pr == null || B.pr.h !== b.hitT){ const pr = PD.predict(M, 2.4).at; B.pr = {h: b.hitT, t: now + pr.t, x: pr.x, y: pr.y}; }
      const lead = B.pr.t - now, near = Math.hypot(B.pr.x - p.x, B.pr.y - p.y) < 1.4;
      if(near && lead > 0 && lead <= BEAT_LEAD && !(B.key === 'pyradive.header' && held)) bHold(M, p, 'pyradive.header', now, B.pr.t);
    }
    else if(held && !B.air){ B.run = null; B.key = null; B.cap = null; }
  }
  // 🦘 take-off and 🛬 landing (every sport) — volleyball: 🧱 block · 🦘 jump serve · 💥 attack jump get their own act
  const feet = feetOn(M);   // 🦶 pd-6c
  if(p.z > 0.02 && !B.air){
    B.air = true; if(feet) B.bike = false;
    const spiker = M.phase === 'rally' && M.side === T && M.n === 2 && (M.spiker[T] === p.id || M.recv[T] === p.id);
    const attack = (p.want && (p.want.key === 'drive' || p.want.key === 'dink')) || spiker;
    if(hands && p.block > 0 && hasBeat('pyradive.block')) bRun(M, p, 'pyradive.block', now, now + 0.07);
    else if(hands && p.jumpServe && hasBeat('pyradive.spike')) bHold(M, p, 'pyradive.spike', now, now + Math.max(0.14, p.vz / BEAT_G));
    else if(hands && attack && !(p.act && p.actT < 0.2) && hasBeat('pyradive.spike')) bHold(M, p, 'pyradive.spike', now, now + 0.3);
    else if(feet && p.block > 0 && hasBeat('pyradive.fblock')) bRun(M, p, 'pyradive.fblock', now, now + 0.07);   // 🦶 pd-6c 🧱 back to the net, legs up
    else if(feet && !(p.act && p.actT < 0.2) && (isHoop(M) ? M.ball.z - p.z > 1.4 : (p.want && p.want.key === 'drive') || spiker)){   // 🦶 pd-6c attack jump: 🌀 roll strike (🔥 armed / a high Hoop ball = 🚲 bicycle)
      const k = isHoop(M) || p.pyraArm ? 'pyradive.bicycle' : 'pyradive.kroll'; if(hasBeat(k)){ bHold(M, p, k, now, now + 0.3); B.bike = k === 'pyradive.bicycle'; } else bRun(M, p, 'pyradive.jump', now, now); }
    else if(!p.block && !(p.act && p.actT < 0.4) && !(M.phase === 'serve' && M.ball.held === p.id)) bRun(M, p, 'pyradive.jump', now, now);
  }
  else if(p.z <= 0.02 && B.air){ B.air = false; if(!p.dive) bRun(M, p, feet && B.bike && hasBeat('pyradive.rollup') ? 'pyradive.rollup' : 'pyradive.land', now, now); B.bike = false; }   // 🦶 pd-6c: a 🚲 bicycle lands on the back + rolls up
  if(!B.run) return null;
  const step = p.human ? BEAT_STEP : BEAT_STEP * 1.6, tq = B.t0 + Math.round((now - B.t0) / step) * step,   // robots: 12 frames a second is plenty (fewer pictures)
     f = B.run.at(B.cap != null ? Math.min(tq, B.cap) : tq);
  B.last = f; if(f.done && B.cap == null){ B.run = null; B.key = null; }
  return f.pose ? {key: B.key, pose: bQ(f.pose)} : null;
}
// 🖼️ pictures of the beat frames are painted ahead (warm-up) for people, so the first touch never waits for new pictures (the most common moves only — the rest paint on demand)
function beatWarmPoses(M){
  if(!beatsOn()) return [];
  const out = [], keys = (feetOn(M) ? ['pyradive.kpass', 'pyradive.knee', 'pyradive.header', 'pyradive.kserve'] /* 🦶 pd-6c */ : PD.noHands(M) ? [] : ['pyradive.bump', 'pyradive.set', 'pyradive.spike']).concat(['pyradive.jump', 'pyradive.land']).filter(hasBeat);
  keys.forEach(k => { const run = Acting.play({name: 'warm', av: {}}, k, {t0: 0, speed: M.level === 0 ? 1.15 : 1}), end = run.start[run.start.length - 1] + run.D[run.D.length - 1].ms;
    for(let ms = 0; ms <= end + 1; ms += BEAT_STEP * 1000){ const f = run.at(ms / 1000); if(f.pose) out.push(Object.assign({}, IDLE_POSE, bQ(f.pose))); } });
  return out;
}
function poseOf(M, p, t){
  const a = p.act, at = p.actT;
  if(PD.noHands(M)){   // 🦶 ⭕ ⚡ takraw + spark: kicks, knees, headers — hands stay down
    if(p.dive) return {rot: 1.2, armL: 2.4, armR: 2.5, legL: 0.6, legR: -0.1, dy: 12, mouth: 'open'};
    if(p.block > 0 && p.z > 0) return {rot: -0.35, armL: 0.5, armR: 0.5, legL: 0.5, legR: -0.6, mouth: 'open'};
    if(M.phase === 'serve' && M.ball.held === p.id) return p.feed ? {armL: 0.8, armR: 0.6, legR: -0.6 - Math.min(1.2, (M.t - p.feed.t0) * 2), mouth: 'open'} : {armL: 0.5, armR: 0.5, legR: -0.3};
    if(M.phase === 'serve' && M.feeder === p.id){ const sv = M.players.find(q => q.id === M.ball.held), ft = sv && sv.feed ? M.t - sv.feed.t0 : -1;   // 🧺 pd-5e the tosser: ball in both hands → an underarm swing up
      if(ft < 0) return {armL: 0.95, armR: 0.95, legL: 0.12, legR: -0.12, dy: 2};
      const k = Math.min(1, Math.round(ft / 0.3 * 4) / 4); return {armL: 0.95 + 1.4 * k, armR: 0.95 + 1.4 * k, legL: 0.25, legR: -0.25, dy: 2 - 2 * k, mouth: 'open'}; }
    if(a && at < 0.4){
      const k = Math.min(1, Math.round(at / 0.22 * 4) / 4);
      if(a === 'bump') return {legR: -1.3, armL: 0.9, armR: 0.9, dy: 2};
      if(a === 'dig') return {legR: -1.6, legL: 0.25, armL: 1.2, armR: 1.2, dy: 6};
      if(a === 'set') return {armL: 0.8, armR: 0.8, rot: -0.18, dy: -2, mouth: 'open'};
      if(a === 'dink') return {legR: 1.1, armL: 1.0, armR: 0.4};
      if(a === 'dunk') return p.style === 'bicycle' ? {rot: -1.5 * Math.max(0.5, k), dy: -32, legR: -2.6, legL: -0.8, armL: 2.2, armR: 2.2, mouth: 'open'} : {legR: -2.7, legL: 0.4, armL: 1.6, armR: 1.4, rot: 0.35, mouth: 'open'};
      if(a === 'drive' || a === 'serve') return {legR: -2.0 + 0.6 * k, armL: 1.0, armR: 0.6, mouth: 'open'};
      if(a === 'block') return {rot: -0.35, armL: 0.5, armR: 0.5};
    }
    if(M.phase === 'rally' && p.z === 0 && !p.walkT) return {armL: 0.5, armR: 0.5, legL: 0.2, legR: -0.2, dy: 3};
    return null;
  }
  if(p.dive) return {rot: 1.2, armL: 2.4, armR: 2.5, legL: 0.6, legR: -0.1, dy: 12, mouth: 'open'};
  if(p.block > 0 && p.z > 0) return {armL: 3.05, armR: 3.05, mouth: 'open'};
  if(M.phase === 'serve' && M.ball.held === p.id) return p.jumpServe ? {armR: 3.05, armL: 2.6, legL: 0.35, legR: -0.35, mouth: 'open'} : p.charge >= 0 ? {armR: 3.0, armL: 2.2, mouth: 'open'} : {armL: 1.3, armR: 0.5};
  if(a && at < 0.38){
    const k = Math.min(1, Math.round(at / 0.22 * 4) / 4);   // 4 swing steps → few cached pictures
    if(a === 'bump') return {armL: 1.3, armR: 1.3, legL: 0.25, legR: -0.25, dy: 5};
    if(a === 'dig') return {armL: 1.05, armR: 1.05, legL: 0.55, legR: -0.55, dy: 11};
    if(a === 'dive') return {rot: 1.2, armL: 2.4, armR: 2.5, dy: 12};
    if(a === 'set') return {armL: 2.85, armR: 2.85, dy: 2};
    if(a === 'dink') return {armL: 1.6, armR: 2.7};
    if(a === 'dunk' || a === 'drive' || a === 'serve') return {armL: 2.2, armR: 3.1 - 2.6 * k, mouth: 'open'};
    if(a === 'block') return {armL: 3.05, armR: 3.05};
  }
  if(M.phase === 'rally' && p.z === 0 && !p.walkT) return {armL: 0.75, armR: 0.75, legL: 0.18, legR: -0.18, dy: 3};
  return null;
}
/* ⚡ pd-1c lag fix: an avatar is painted ONCE per pose into a small picture (drawAvatar is far too heavy for 12 players × 60 frames);
   the pose is rounded (walk = 8 steps, gestures = 8 a second, swing = 4 steps) so the cache stays small. The body is drawn lifted
   high above its own shadow (shadow lands outside the picture) — the court painter draws the ground shadow itself. */
const AV_SPR = new Map(), AV_MAX = 400, AV_PXMAX = 32e6; let AV_MISS = 0, AV_PX = 0, AV_LIVE = 1.6, AV_LIVE_N = 0;   // 🧺 pd-5e: a PIXEL budget too (big ⚡ Spark players get sharp pictures, fewer of them fit)   // 🎬 pd-6a: beat frames need room (was 260)   // AV_MISS: new pictures painted (pdperf.js watches it)
function avPoseKey(o){ let k = ''; for(const n in o){ const v = o[n]; k += n + (typeof v === 'number' ? Math.round(v * 10) / 10 : v) + ','; } return k; }
// picture size in steps of ~12 % (near / far players share pictures, drawImage scales the rest) → few pictures per player
function kStep(k){ return Math.max(0.06, Math.round(Math.pow(2, Math.round(Math.log2(k) * 6) / 6) * 1000) / 1000); }
function avKey(p, a, pose, kq){ return p.id + '|' + (a.av && a.av._h || '') + '|' + (a.gest ? 'g' + a.gest.g.k + Math.round(a.gest.t * 8) : avPoseKey(pose)) + '|' + kq; }
// picture box around the feet (measured: body + arms up + a dive reach −27…81 × −86…21 units; room for hats / wings / capes)
const SPR_L = 75, SPR_R = 105, SPR_U = 150, SPR_D = 36;
function avSprite(p, a, pose, kq, key){
  key = key || avKey(p, a, pose, kq);
  let sp = AV_SPR.get(key); if(sp){ AV_SPR.delete(key); AV_SPR.set(key, sp); return sp; }   // LRU: most recent last
  while(AV_SPR.size && (AV_SPR.size >= AV_MAX || AV_PX > AV_PXMAX)){ const k0 = AV_SPR.keys().next().value, old = AV_SPR.get(k0); AV_SPR.delete(k0); AV_PX -= old.c.width * old.c.height; old.c.width = old.c.height = 0; }   // free the pixels at once (iPad canvas memory is small)
  AV_MISS++;
  const dpr = Math.min(1.5, (G && G.dpr) || 1, 2.2 / kq) /* 🧺 pd-5e: was 1.45 / kq (big players live now, see drawPlayer) → big players (⚡ Spark, phones zoomed in) were painted at < 1 pixel a pixel = blurry */, W = Math.ceil((SPR_L + SPR_R) * kq), H = Math.ceil((SPR_U + SPR_D) * kq), c = document.createElement('canvas');
  c.width = Math.ceil(W * dpr); c.height = Math.ceil(H * dpr);
  const g = c.getContext('2d'); g.scale(dpr, dpr); const OFF = 600, ax = SPR_L * kq, foot = SPR_U * kq;
  try{ drawAvatar(g, Object.assign({}, a, {dir: 1, jumpH: OFF / kq, land: 0, walkT: 0, gest: a.gest ? {g: a.gest.g, t: Math.round(a.gest.t * 8) / 8} : null}), ax, foot + OFF, kq, {t: 1, still: true, pose: a.gest ? undefined : pose, noPet: true}); }catch(e){}
  sp = {c, W, H, ax, foot}; AV_SPR.set(key, sp); AV_PX += c.width * c.height; return sp;
}
function freeSprites(){ AV_SPR.forEach(sp => { sp.c.width = sp.c.height = 0; }); AV_SPR.clear(); AV_PX = 0; WARM.length = 0; }
// quiet warm-up: the usual poses of every player are painted 2 a frame while the game runs, so a Pyra move never waits for a new picture
const WARM = [];
function queueWarm(M){
  WARM.length = 0;
  const swing = [0, 0.25, 0.5, 0.75, 1].map(k => Object.assign({}, IDLE_POSE, AIR_POSE, {armL: 2.2, armR: 3.1 - 2.6 * k, mouth: 'open'}));
  const base = [IDLE_POSE, Object.assign({}, IDLE_POSE, {armL: 0.75, armR: 0.75, legL: 0.18, legR: -0.18, dy: 3}), Object.assign({}, IDLE_POSE, AIR_POSE)];
  for(let i = 0; i < 8; i++) base.push(Object.assign({}, IDLE_POSE, walkPose(i / 8 * Math.PI * 2 / 11 + 0.001)));
  const beats = beatWarmPoses(M);   // 🎬 pd-6a
  M.players.slice().sort((a, b) => (b.human ? 1 : 0) - (a.human ? 1 : 0)).forEach(p => (p.human ? base.concat(swing, beats) : base).forEach(pose => WARM.push([p, pose])));
}
function warmStep(n){
  if(!G || !V || !WARM.length) return;
  for(let i = 0; i < n && WARM.length; ){ const [p, pose] = WARM.shift(); if(!p.av) continue;
    const s = P(p.x, p.y, 0)[2], kq = kStep(1.55 * V.k * s / 70), a = {name: p.name, av: p.av, dir: 1, gest: null}, key = avKey(p, a, pose, kq);
    if(!AV_SPR.has(key)){ avSprite(p, a, pose, kq, key); i++; } }
}
const AURA = new Map();
function auraSprite(big, r){
  const rq = Math.max(6, Math.round(r / 3) * 3), key = (big === 'spirit' ? 'x' : big ? 'b' : 's') + rq; let c = AURA.get(key); if(c) return c;
  c = document.createElement('canvas'); c.width = c.height = rq * 2 + 2; const g = c.getContext('2d');
  const gr = g.createRadialGradient(rq + 1, rq + 1, rq * 0.08, rq + 1, rq + 1, rq); if(big === 'spirit'){ gr.addColorStop(0, 'rgba(255,255,255,0.85)'); gr.addColorStop(0.35, 'rgba(255,122,182,0.6)'); gr.addColorStop(0.7, 'rgba(229,48,75,0.35)'); gr.addColorStop(1, 'rgba(123,79,224,0)'); }
  else { gr.addColorStop(0, big ? 'rgba(255,225,74,0.75)' : 'rgba(255,182,39,0.45)'); gr.addColorStop(0.6, 'rgba(255,107,26,' + (big ? 0.4 : 0.22) + ')'); gr.addColorStop(1, 'rgba(229,48,75,0)'); }
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); if(AURA.size > 80) AURA.clear(); AURA.set(key, c); return c;
}
function walkPose(walkT){ const ph = Math.floor(((walkT * 11) % (Math.PI * 2)) / (Math.PI * 2) * 8), a = ph / 8 * Math.PI * 2, w = Math.sin(a); return {legL: w * 0.5, legR: -w * 0.5, armL: 0.15 - w * 0.4, armR: 0.15 + w * 0.4, dy: -Math.abs(Math.cos(a)) * 3}; }
const IDLE_POSE = {armL: 0.15, armR: 0.15, legL: 0, legR: 0, dy: 0, mouth: 'smile'}, AIR_POSE = {armL: 2.4, armR: 2.4, legL: 0.35, legR: -0.35, dy: 0, mouth: 'open'};
// 🎮 pd-8a BALL CONTROL look: a gold ring under the player you drive + 👇 + "🎮 name" · a gold arc when control jumps · 🌱 Basic / 🐣 Junior:
//   cyan rings + 🕹️ arrows on the hitters while you are about to set (the one your stick points at glows brighter)
function ctlDriven(M, p){ return !!(M.ctl && M.ctl[p.team] && p.human && G && G.locals.some(l => l.own === p.human)); }
function ctlSetting(M, T){ const d = PD.driverOf(M, T); return d && M.ctl[T] && M.phase === 'rally' && M.side === T && M.n === 1 && M.recv[T] === d.id && M.lastTeam === T ? d : null; }
function ctlArrow(dx, dy){ const a = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)); return ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'][(a + 8) % 8]; }
function ctlUnder(g, M, p, fx, fy, kAv, t){
  if(!M.ctl || !M.ctl[p.team]) return;
  const R = 22 * kAv * 1.45;
  if(ctlDriven(M, p)){ const pu = 1 + 0.06 * Math.sin(t * 6);
    g.save(); g.translate(fx, fy); g.scale(1, 0.4); g.shadowColor = '#FFD23F'; g.shadowBlur = 14; g.strokeStyle = '#FFD23F'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, R * pu, 0, 7); g.stroke();
    g.shadowBlur = 0; g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R * pu * 0.78, 0, 7); g.stroke(); g.restore(); return; }
  if(M.level > 1) return; const d = ctlSetting(M, p.team); if(!d || !G.locals.some(l => l.own === d.human)) return;
  const pick = PD.hitterFor(M, d), on = pick && pick.id === p.id;
  g.save(); g.translate(fx, fy); g.scale(1, 0.4); g.shadowColor = '#7CF7FF'; g.shadowBlur = on ? 18 : 8; g.strokeStyle = on ? '#FFFFFF' : '#7CF7FF'; g.lineWidth = on ? 5 : 3.5;
  g.setLineDash(on ? [] : [7, 5]); g.beginPath(); g.arc(0, 0, R, 0, 7); g.stroke(); g.restore();
}
function ctlPill(g, x, y, ic, txt, bg, fg, h){
  g.save(); g.font = '800 ' + Math.round(h * 0.62) + 'px Nunito, sans-serif'; const tw = g.measureText(txt).width, w = h * 1.05 + tw + h * 0.55;
  g.fillStyle = bg; g.strokeStyle = 'rgba(20,10,40,0.85)'; g.lineWidth = 2; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2); g.fill(); g.stroke();
  emo(g, ic, x - w / 2 + h * 0.62, y, h * 0.72); g.fillStyle = fg; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt, x - w / 2 + h * 1.08, y + 1); g.restore();
}
function ctlOver(g, M, p, fx, ty, kAv){
  if(!M.ctl || !M.ctl[p.team]) return;
  const h = Math.max(16, Math.round(15 * kAv * 1.3));
  if(ctlDriven(M, p)){ const own = ownerOf(p); ctlPill(g, fx, ty - h * 0.2, '🎮', G.locals.length === 1 ? 'You' : own ? own.name : 'You', '#FFD23F', '#1B1030', h); return; }
  if(M.level > 1) return; const d = ctlSetting(M, p.team); if(!d || !G.locals.some(l => l.own === d.human)) return;
  const a = P(d.x, d.y, 0), b = P(p.x, p.y, 0), pick = PD.hitterFor(M, d);
  ctlPill(g, fx, ty - h * 1.25, '🕹️', ctlArrow(b[0] - a[0], b[1] - a[1]), pick && pick.id === p.id ? '#FFFFFF' : '#7CF7FF', '#1B1030', h);
}
function ctlFxDraw(g, M){   // the gold arc: from the old player to the new one (0.32 s)
  const f = G.ctlFx; if(!f) return; const k = (performance.now() - f.t0) / 320; if(k >= 1){ G.ctlFx = null; return; }
  const to = M.players[f.to]; if(!to) return; const a = P(f.x, f.y, 0), b = P(to.x, to.y, 0), mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 40 - Math.abs(b[0] - a[0]) * 0.15;
  const at = u => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * b[1]];
  g.save(); g.globalAlpha = 1 - k * 0.6; g.strokeStyle = '#FFD23F'; g.lineWidth = 3; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(a[0], a[1]); for(let u = 0.1; u <= k + 1e-6; u += 0.1){ const q = at(Math.min(u, k)); g.lineTo(q[0], q[1]); } g.stroke();
  const q = at(k); g.setLineDash([]); g.fillStyle = '#FFF4C2'; g.shadowColor = '#FFD23F'; g.shadowBlur = 12; g.beginPath(); g.arc(q[0], q[1], 6, 0, 7); g.fill(); g.restore();
}
function drawPlayer(g, M, p, t, o){
  const [fx, fy, s] = P(p.x, p.y, 0), kAv = 1.55 * V.k * s / 70, live = o.live, lift = p.z * 45 * kAv;
  // 🔥 flame aura (half meter = soft glow, armed / full = big flames) — a cached picture, gently pulsing by size only
  if(p.meter >= 50 || p.pyraArm){ const big = p.spiritArm ? 'spirit' : p.pyraArm || p.meter >= 100, cy = fy - lift - 38 * kAv, r = (big === 'spirit' ? 64 : big ? 52 : 40) * kAv, a = auraSprite(big, r), pul = 1 + 0.06 * Math.sin(t * 9 + p.id), d = (a.width / 2) * pul;
    g.drawImage(a, fx - d, cy - d, d * 2, d * 2); }
  // the next touch: a ring under the feet (your own team)
  if(live) ctlUnder(g, M, p, fx, fy, kAv, t);   /* 🎮 pd-8a */
  if(live && M.phase === 'rally' && M.recv[p.team] === p.id && !ctlDriven(M, p)){ g.save(); g.translate(fx, fy); g.scale(1, 0.38); g.strokeStyle = TEAM_COL[p.team]; g.lineWidth = 3; g.globalAlpha = 0.85; g.beginPath(); g.arc(0, 0, 22 * kAv * 1.4, 0, 7); g.stroke(); g.restore(); }
  const gest = M.phase !== 'rally' && p.gest && GEST[p.gest.k] ? {g: GESTURES.find(x => x.k === GEST[p.gest.k]) || GESTURES[0], t: Math.min(p.gest.t, 1.3)} : null;
  if(!p.av) p.av = playAv(defaultAvatar(p.name));
  if(!p.av._h) p.av._h = String(p.id) + Math.random().toString(36).slice(2, 6);
  const a = {name: p.name, av: p.av, dir: p.dir, gest};
  const bp = gest || !live ? null : beatPose(M, p), special = feetOn(M) ? !!p.dive /* 🦶 pd-6c */ : PD.noHands(M) ? (p.dive || (p.block > 0 && p.z > 0) || (M.phase === 'serve' && (M.ball.held === p.id || M.feeder === p.id)) || (p.act && p.actT < 0.4)) : !!(p.act && p.actT < 0.4 && !beatKeyOf(p) && !(p.act === 'dive' && p.bt && p.bt.key === 'pyradive.dive'));   // 🎬 pd-6a · 🏐 pd-6b: every volleyball move has its beats
  const pose = gest ? null : bp && !special ? Object.assign({}, IDLE_POSE, bp.pose) : Object.assign({}, IDLE_POSE, p.walkT && p.z === 0 && !p.act ? walkPose(p.walkT) : p.z > 0 ? AIR_POSE : null, poseOf(M, p, t) || {});
  // ground shadow (smaller + lighter in the air), then the cached body picture
  const sh = 1 - Math.min(0.55, p.z / 1.4); g.fillStyle = 'rgba(0,0,0,' + (0.22 * sh).toFixed(3) + ')'; g.beginPath(); g.ellipse(fx, fy, 15 * kAv * sh, 6 * kAv * sh, 0, 0, 7); g.fill();
  if(kAv >= AV_LIVE && M.players.length <= 4){   // 🧺 pd-5e (Aowu 12:20 "PyraSpark the player is blurry"): BIG players (⚡ Spark, zoomed phones) are painted live at full sharpness — a cached picture that big costs too much memory
    const OFF = 4000, ga = Object.assign({}, a, {dir: 1, jumpH: OFF / kAv, land: 0, walkT: 0, gest: a.gest ? {g: a.gest.g, t: Math.round(a.gest.t * 8) / 8} : null});   // OFF: drawAvatar's own shadow lands far below the screen (ours is drawn above)
    g.save(); g.translate(fx, 0); if(p.dir < 0) g.scale(-1, 1);
    try{ drawAvatar(g, ga, 0, fy - lift + OFF, kAv, {t: 1, still: true, pose: a.gest ? undefined : pose, noPet: true}); }catch(e){}
    g.restore(); AV_LIVE_N++;
  } else {
  const kq = kStep(kAv), sp = avSprite(p, a, pose, kq), sc = kAv / kq;
  if(p.dir < 0){ g.save(); g.translate(fx, 0); g.scale(-1, 1); g.drawImage(sp.c, -sp.ax * sc, fy - lift - sp.foot * sc, sp.W * sc, sp.H * sc); g.restore(); }   // facing left = the same picture mirrored
  else g.drawImage(sp.c, fx - sp.ax * sc, fy - lift - sp.foot * sc, sp.W * sc, sp.H * sc);
  }
  // overhead: roles · meter · name
  const top = fy - (p.z * 45 + 96) * kAv, sz = Math.max(9, 13 * kAv * 1.4);
  (isHoop(M) || PD.isSpark(M) ? [] : p.roles).forEach((r, i) => emo(g, PD.ROLE_ICON[r], fx + (i - (p.roles.length - 1) / 2) * sz * 1.05, top - sz * 0.2, sz));
  const bw = Math.max(18, 30 * kAv * 1.3), bh = Math.max(3, 4 * kAv), by = top + sz * 0.5;
  g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(fx - bw / 2, by, bw, bh);
  g.fillStyle = p.meter >= 50 ? '#FFB627' : '#FF6B1A'; g.fillRect(fx - bw / 2, by, bw * Math.min(1, p.meter / 100), bh);
  g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(fx - 0.5, by - 1, 1, bh + 2);
  if(p.own || M.sp.n <= 3){ g.font = '800 ' + Math.max(10, Math.round(11 * kAv * 1.3)) + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.lineWidth = arenaLook(M).light ? 5 : 3; g.strokeStyle = arenaLook(M).light ? 'rgba(20,20,40,0.85)' : 'rgba(0,0,0,0.6)';   // ☁️ light arenas: a darker outline
    const nm = p.own ? p.name : p.name.slice(0, 9); if(!(live && ctlDriven(M, p))){ g.strokeText(nm, fx, top - sz * 0.95); g.fillStyle = p.own ? '#FFE9A8' : '#E6ECFF'; g.fillText(nm, fx, top - sz * 0.95); } }
  if(live) ctlOver(g, M, p, fx, top - sz * 0.95, kAv);   /* 🎮 pd-8a: the driven player's name = the 🎮 pill */
}
let BALL_SPR = {};
function takrawSprite(px){   // 🦶 a woven rattan ball: golden ring weave with round holes
  px = Math.max(8, Math.round(px / 2) * 2); const key = 't' + px; if(BALL_SPR[key]) return BALL_SPR[key];
  const c = document.createElement('canvas'), r = px / 2; c.width = c.height = px + 4; const g = c.getContext('2d'); g.translate(r + 2, r + 2);
  const gr = g.createRadialGradient(-r * 0.3, -r * 0.35, 1, 0, 0, r); gr.addColorStop(0, '#FFE6A3'); gr.addColorStop(0.6, '#D9A441'); gr.addColorStop(1, '#9C6A1C');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(0, 0, r, 0, 7); g.clip(); g.fillStyle = 'rgba(70,40,5,0.75)';
  [[0, 0], [0.55, 0], [-0.55, 0], [0.28, 0.48], [-0.28, 0.48], [0.28, -0.48], [-0.28, -0.48]].forEach(([u, v]) => { g.beginPath(); g.arc(u * r, v * r, r * 0.17, 0, 7); g.fill(); });
  g.strokeStyle = 'rgba(255,240,200,0.55)'; g.lineWidth = Math.max(1, px * 0.05);
  for(let i = 0; i < 3; i++){ g.beginPath(); g.ellipse(0, 0, r * 0.95, r * 0.42, i * Math.PI / 3, 0, 7); g.stroke(); }
  g.restore(); g.strokeStyle = 'rgba(60,35,5,0.5)'; g.lineWidth = Math.max(1, px * 0.06); g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
  return (BALL_SPR[key] = c);
}
function sparkSprite(px){   // ⚡ the spark ball: white with blue lightning bands
  px = Math.max(8, Math.round(px / 2) * 2); const key = 's' + px; if(BALL_SPR[key]) return BALL_SPR[key];
  const c = document.createElement('canvas'), r = px / 2; c.width = c.height = px + 4; const g = c.getContext('2d'); g.translate(r + 2, r + 2);
  const gr = g.createRadialGradient(-r * 0.3, -r * 0.35, 1, 0, 0, r); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.7, '#E8F1FF'); gr.addColorStop(1, '#9BB6E0');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.save(); g.beginPath(); g.arc(0, 0, r, 0, 7); g.clip();
  g.strokeStyle = '#2F7BEA'; g.lineWidth = Math.max(1.2, px * 0.11); g.lineJoin = 'round';
  [-0.35, 0.35].forEach(o => { g.beginPath(); g.moveTo(-r, o * r); g.lineTo(-r * 0.3, o * r - r * 0.25); g.lineTo(r * 0.1, o * r + r * 0.15); g.lineTo(r, o * r - r * 0.1); g.stroke(); });
  g.fillStyle = '#FFE14A'; g.beginPath(); g.moveTo(r * 0.05, -r * 0.5); g.lineTo(-r * 0.2, r * 0.05); g.lineTo(r * 0.02, r * 0.05); g.lineTo(-r * 0.08, r * 0.5); g.lineTo(r * 0.25, -r * 0.08); g.lineTo(r * 0.03, -r * 0.08); g.closePath(); g.fill();
  g.restore(); g.strokeStyle = 'rgba(20,40,90,0.45)'; g.lineWidth = Math.max(1, px * 0.06); g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
  return (BALL_SPR[key] = c);
}
function ballSprite(px){
  px = Math.max(8, Math.round(px / 2) * 2); if(BALL_SPR[px]) return BALL_SPR[px];
  const c = document.createElement('canvas'), r = px / 2; c.width = c.height = px + 4; const g = c.getContext('2d'); g.translate(r + 2, r + 2);
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(0, 0, r, 0, 7); g.clip();
  [['#FF6B1A', 0], ['#2F7BEA', 2.1], ['#FFC845', 4.2]].forEach(([col, a]) => { g.fillStyle = col; g.beginPath(); g.ellipse(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.95, r * 0.36, a + 0.9, 0, 7); g.fill(); });
  g.restore(); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = Math.max(1, px * 0.06); g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
  const hl = g.createRadialGradient(-r * 0.35, -r * 0.4, 1, 0, 0, r); hl.addColorStop(0, 'rgba(255,255,255,0.7)'); hl.addColorStop(0.5, 'rgba(255,255,255,0)'); g.fillStyle = hl; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  if(Object.keys(BALL_SPR).length > 30) BALL_SPR = {};
  return (BALL_SPR[px] = c);
}
const PARTY_COL = ['#FF4D8D', '#9B5DE5', '#2FBF71'];
function partySprite(px, i){   // 🌀 a bouncy party ball: bright with a white star
  px = Math.max(8, Math.round(px / 2) * 2); const key = 'p' + i + ':' + px; if(BALL_SPR[key]) return BALL_SPR[key];
  const c = document.createElement('canvas'), r = px / 2, col = PARTY_COL[i % 3]; c.width = c.height = px + 4; const g = c.getContext('2d'); g.translate(r + 2, r + 2);
  const gr = g.createRadialGradient(-r * 0.3, -r * 0.35, 1, 0, 0, r); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.35, col); gr.addColorStop(1, col); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  g.fillStyle = '#FFFFFF'; g.beginPath(); for(let k = 0; k < 10; k++){ const a = -Math.PI / 2 + k * Math.PI / 5, rr2 = k % 2 ? r * 0.22 : r * 0.5; g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } g.closePath(); g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = Math.max(1, px * 0.06); g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
  return (BALL_SPR[key] = c);
}
// 🎱 pd-4c: a BallSkins skin drawn once per size into a picture (skins with gradients would cost too much every frame)
function skinSprite(v, px){
  px = Math.max(8, Math.round(px / 2) * 2); const key = 's' + v + ':' + px; if(BALL_SPR[key]) return BALL_SPR[key];
  const c = document.createElement('canvas'), r = px / 2; c.width = c.height = px + 4; const g = c.getContext('2d');
  try{ BallSkins.draw(g, v, r + 2, r + 2, r, 1); }catch(e){ return ballSprite(px); }
  return (BALL_SPR[key] = c);
}
function drawExtra(g, M, e, t){
  const [sx, sy, ss] = P(e.x, e.y, 0), sz = V.k * 0.16 * ss * Math.max(0.35, 1 - e.z / 7); g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.ellipse(sx, sy, sz * 1.4, sz * 0.55, 0, 0, 7); g.fill();
  const [x, y, s] = P(e.x, e.y, e.z), r = Math.max(5, V.k * 0.22 * s), spr = partySprite(r * 2, e.i);
  e.trail.forEach((q, i) => { const [tx, ty] = P(q.x, q.y, q.z), f = i / e.trail.length; g.globalAlpha = f * 0.35; g.fillStyle = PARTY_COL[e.i % 3]; g.beginPath(); g.arc(tx, ty, r * f * 0.7, 0, 7); g.fill(); }); g.globalAlpha = 1;
  const bm = G && G.M === M && G.look ? G.look.bomb : '';
  if(bm && (typeof BombSkins !== 'undefined')){ BombSkins.draw(g, bm, x, y, r * 2.3, t, 0.2); return; }   // 💣 pd-4c: your Soul Bopper bombs bounce in 🌀 Spark Party
  g.save(); g.translate(x, y); g.rotate((e.x * 4 + e.z * 3) % (Math.PI * 2)); g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
}
function drawBall(g, M, t){
  const b = M.ball, [x, y, s] = P(b.x, b.y, b.z), r = Math.max(6, V.k * 0.25 * s);
  if(b.trail && b.trail.length > 2 && M.phase === 'rally'){
    const fast = Math.hypot(b.vx, b.vz) > 7;
    const sc = b.spirit ? (spiritOf(b.spirit) || {}).col : null;
    b.trail.forEach((q, i) => { const [tx, ty, ts] = P(q.x, q.y, q.z), f = i / b.trail.length;
      if(sc){ g.globalAlpha = f * 0.85; g.fillStyle = f > 0.6 ? '#FFFFFF' : sc; g.beginPath(); g.arc(tx, ty, r * (0.6 + f * 1.3), 0, 7); g.fill(); }
      else if(b.pyra){ g.globalAlpha = f * 0.8; g.fillStyle = f > 0.6 ? '#FFE14A' : '#FF6B1A'; g.beginPath(); g.arc(tx, ty, r * (0.4 + f * 0.9), 0, 7); g.fill(); }
      else if(fast){ g.globalAlpha = f * 0.25; g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(tx, ty, r * f * 0.8, 0, 7); g.fill(); } });
    g.globalAlpha = 1;
  }
  const bl = G && G.M === M && G.look ? G.look.ball : null, spr = bl != null && (typeof BallSkins !== 'undefined') ? skinSprite(bl, r * 2) : PD.isSpark(M) ? sparkSprite(r * 2) : PD.isStrike(M) ? takrawSprite(r * 2) : ballSprite(r * 2), ang = (b.x * 3 + b.z * 2) % (Math.PI * 2);
  g.fillStyle = 'rgba(255,255,255,0.28)'; g.beginPath(); g.arc(x, y, r * 1.45, 0, 7); g.fill();   // a soft halo so the ball never hides in a crowd
  g.save(); g.translate(x, y); g.rotate(ang); g.drawImage(spr, -spr.width / 2, -spr.height / 2); g.restore();
  if(b.spirit && M.phase === 'rally'){ const c = spiritOf(b.spirit); if(c){   // 🔥🔥 the creature rides the ball
    const sp = Math.hypot(b.vx, b.vy) || 1, dx = -b.vx / sp, w = 1 + 0.08 * Math.sin(t * 14);
    g.globalAlpha = 0.35; g.fillStyle = c.col; g.beginPath(); g.arc(x, y, r * 3.2 * w, 0, 7); g.fill(); g.globalAlpha = 1;
    emo(g, c.icon, x + dx * r * 1.6, y - r * 1.2, r * 3.6 * w, 0.75, b.vx < 0); } }   // 👻 pd-5a: a bit see-through
  else if(b.pyra && M.phase === 'rally') emo(g, '🔥', x, y - r * 1.4, r * 1.6);
}
// ①②③ touch counter above each half (lights up with each touch on that side)
function drawCounters(g, M){
  if(M.phase !== 'rally' && M.phase !== 'serve') return;
  [0, 1].forEach(t => { const r = Math.max(7, Math.min(16, V.k * 0.26)), q = V.rot ? P(PD.sgn(t) * M.L * 0.5, M.W / 2 + 0.6, 0) : P(PD.sgn(t) * M.L * 0.5, -M.W / 2 - FEX(), 0), x = V.short ? V.W * (t ? 0.82 : 0.18) : Math.max(r * 4, Math.min(V.W - r * 4, q[0])), y = V.short ? r + 12 : V.rot ? Math.max(r * 2, q[1]) : Math.max(96 + r, q[1] - r * 1.8), /* 📱 pd-5b short sideways: top band */ n = M.side === t && M.phase === 'rally' ? M.n : 0;
    for(let i = 0; i < 3; i++){ const cx = x + (i - 1) * r * 2.5, on = i < n; g.fillStyle = on ? TEAM_COL[t] : 'rgba(255,255,255,0.18)'; g.beginPath(); g.arc(cx, y, r, 0, 7); g.fill();
      g.strokeStyle = on ? '#FFFFFF' : 'rgba(255,255,255,0.4)'; g.lineWidth = 2; g.stroke();
      g.fillStyle = on ? '#FFFFFF' : 'rgba(255,255,255,0.65)'; g.font = '700 ' + Math.round(r * 1.2) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(i + 1, cx, y + 1); g.textBaseline = 'alphabetic'; } });
}
function paintArenaPreview(cv, k){
  const g = cv.getContext('2d'), M = PD.newMatch({mode: SET.mode, level: 0, seed: 3, arena: k, teams: SET.cfg || [[], []]});
  const keep = V; V = makeView(cv.width, cv.height, M, {padT: 6, padB: 4});
  M.phase = 'rally'; M.ball.held = null; M.ball.x = -1.5; M.ball.z = 3.2;
  try{ drawScene(g, M, {t: 1, live: false}); }catch(e){}
  V = keep;
}

/* ================= RESULT + SAVES ================= */
function finishSoon(){ if(!G || G.over) return; G.over = true; setTimeout(() => { if(G && G.over) finishMatch(); }, FX ? 1500 : 30); }
function finishMatch(){
  if(G && G.M) PD.ctlHome(G.M);   /* 🎮 pd-8a: stats + meter back on your own seat */
  if(G.M.drill) return finishDrill();
  if(G.cup) return finishCupMatch();
  stopLoop(); const M = G.M, secs = Math.round((Date.now() - G.t0) / 1000), hc = !!LEVEL_UI[G.level].hardcore;
  $('hand').classList.add('hidden'); $('goal-line').classList.add('off');
  const sums = [0, 1].map(t => G.setScores.reduce((a, s) => a + s[t], 0));
  const people = G.locals, duo = G.who === 'duo';
  const me = people[0], won = M.winner === me.team, margin = sums[me.team] - sums[1 - me.team];
  const stars = won ? 1 + (margin >= 4 ? 1 : 0) + ((M.setsTo > 1 && M.teams[1 - me.team].sets === 0) || margin >= 7 ? 1 : 0) : 0;
  const nh = PD.noHands(M), statsOf = p => ({games: 1, wins: M.winner === p.team ? 1 : 0, hoops: p.st.hoops || 0, edges: p.st.edges || 0, spirits: p.st.spirits || 0, duos: p.st.duos || 0, trios: p.st.trios || 0, aces: p.st.aces, kills: p.st.kills, assists: p.st.assists, digs: p.st.digs + p.st.dives, dives: p.st.dives, blocks: p.st.blocks, stuffs: p.st.stuffs,
    traps: (p.st.traps || 0) + (nh && !PD.isSpark(M) ? p.st.bumps : 0), pops: p.st.pops || 0, feeds: p.st.feeds || 0, beasts: window.SpiritBestiary && p.human ? SpiritBestiary.count(p.name) : 0,
    sets: p.st.sets, bumps: nh ? 0 : p.st.bumps, dinks: p.st.dinks, dunks: p.st.dunks, drives: p.st.drives, pyras: p.st.pyras, rally: M.rallyMax, ['m_' + G.mode]: M.winner === p.team ? 1 : 0});
  const scoreOf = p => Math.round(((p.st.hoopPts || 0) * 30 + (p.st.passes || 0) * 2 + sums[p.team] * (isHoop(M) ? 10 : 50) + (M.winner === p.team ? 1000 : 0) + p.st.kills * 40 + p.st.aces * 60 + p.st.stuffs * 60 + (p.st.digs + p.st.dives) * 15 + p.st.pyras * 30 + M.rallyMax * 10) * (1 + G.level * 0.25) * (hc ? 3 : 1));
  const score = scoreOf(me), mode = PD.MODES[G.mode];
  NOTES.length = 0;
  const cardTxt = duo ? '⚔️ ' + UI.esc(teamName(M.winner)) + ' wins!' : won ? 'You won!' : 'So close!';
  const st = me.st;
  let h = '<div class="big">' + (won || duo ? '🏆' : '😅') + '</div><h2 class="' + (won || duo ? 'cheer' : '') + '">' + cardTxt + '</h2>'
    + '<canvas class="podium" id="res-podium" width="440" height="260"></canvas>'
    + '<div class="note">' + mode.icon + ' ' + mode.name + ' · ' + PD.LEVELS[G.level].name + ' · ' + (G.setScores.length > 1 ? 'sets ' + M.teams[0].sets + '–' + M.teams[1].sets + ' (' + G.setScores.map(s => s.join('–')).join(', ') + ')' : (G.setScores[0] || [0, 0]).join(' – ')) + '</div>';
  if(!duo) h += '<div class="rating">' + [1, 2, 3].map(i => '<span class="st' + (i <= stars ? '' : ' off') + '">⭐</span>').join('') + '</div><div class="score-big">🏆 ' + score.toLocaleString() + '</div>';
  const pl = (n, w, ws) => n + ' ' + (n === 1 ? w : ws || w + 's');
  if(isHoop(M)) h += '<div class="stats"><span>⭕ ' + pl(st.hoops || 0, 'hoop') + '</span><span>🏆 ' + (st.hoopPts || 0) + ' points</span><span>🦵 ' + pl(st.passes || 0, 'pass', 'passes') + '</span><span>🔥 ' + pl(st.pyras, 'Pyra move') + '</span></div>';
  else if(PD.isSpark(M)) h += '<div class="stats"><span>🚀 ' + pl(st.aces, 'ace') + '</span><span>💥 ' + pl(st.kills, 'point winner') + '</span><span>⚡ ' + pl(st.edges || 0, 'edge ball') + '</span><span>🔥 ' + pl(st.pyras, 'Pyra move') + '</span></div>';
  else h += '<div class="stats"><span>🚀 ' + pl(st.aces, 'ace') + '</span><span>💥 ' + pl(st.kills, 'kill') + '</span><span>🪶 ' + pl(st.assists, 'assist') + '</span><span>🛡️ ' + pl(st.digs + st.dives, 'save') + '</span><span>🧱 ' + pl(st.stuffs, 'stuff') + '</span><span>🔥 ' + pl(st.pyras, 'Pyra move') + '</span><span>🔁 rally ' + M.rallyMax + '</span></div>';
  if(!won && !duo) h += '<div class="note">💡 ' + pdPick(['Watch the 🎯 ring — be there before the ball comes down.', 'Use all 3 touches: bump → set → dunk.', 'Half a flame? Tap 🔥 before your dunk for a Pyra…Dunk!', 'A 🪶 dink drops softly behind their block.', 'Jump (Space) at the net when they dunk = a block!']) + '</div>';
  h += '<div class="save-note" id="save-note">' + (people.some(p => p.name !== 'Guest') ? '💾 Saving…' : '') + '</div>';
  h += '<div class="res-btns" id="res-btns"><button class="sp-btn sp-secondary" id="res-levels" data-sound="tap">🎚️ Levels</button><button class="sp-btn sp-secondary" id="res-again" data-sound="pop">🔁 Play again</button>'
    + (won && G.level < 5 && !duo ? '<button class="sp-btn sp-primary" id="res-next" data-sound="pop">Next level ▶</button>' : '') + '</div><div class="comics-slot" id="comic-strip-slot"></div>';
  showResult(h);
  paintPodium($('res-podium'), M);
  $('res-levels').onclick = () => leavePlay();
  $('res-again').onclick = () => { SET.cfg = null; startMatch(); };
  if($('res-next')) $('res-next').onclick = () => { leavePlay(); openSetup(G ? G.level + 1 : Math.min(5, SET.level + 1)); };
  if((won || duo) && FX) confetti(['🔥', '🏐', '⭐', '🎉'], 26);
  // saves: vs robots = a level result for every person on the team · ⚔️ 2 players = feats only (like the other games)
  people.forEach((p, i) => {
    if(p.name === 'Guest') return;
    if(duo) saveFeatsOnly(p.name, statsOf(p), i);
    else saveWin(p.name, G.level, {score: scoreOf(p), stars: M.winner === p.team ? stars : 0, cleared: M.winner === p.team, timeSec: secs, theme: mode.icon + ' ' + mode.name + ' · 🏟️ Classic', stats: statsOf(p)}, i);
  });
  if(UI.alsoTry) UI.alsoTry({player: S.player, game: GAME_ID, at: () => $('res-btns'), current: G.mode, open: id => { leavePlay(); msOpen(id); }});
  G.resultShown = true;
}
function finishDrill(){   // 🎯 pd-4a: a drill result — score, ⭐ by the level's targets, saved as a score (never unlocks a level)
  stopLoop(); const M = G.M, D = M.drill, secs = Math.round((Date.now() - G.t0) / 1000), hc = !!LEVEL_UI[G.level].hardcore, me = G.locals[0], mode = PD.MODES[G.mode];
  $('hand').classList.add('hidden'); $('goal-line').classList.add('off'); NOTES.length = 0;
  const pts = Math.round(D.score * 20 * (1 + G.level * 0.25) * (hc ? 3 : 1)), stars = D.stars;
  const stats = {games: 1, ['m_' + G.mode]: 1, ['drill_' + D.k]: D.score, ['streak_' + D.k]: D.bestStreak, pyras: me.st.pyras || 0};
  const line = D.k === 'zone' ? '🎯 ' + D.zoneHits + ' zone hit' + (D.zoneHits === 1 ? '' : 's') + ' · ✅ ' + D.hits + ' on the table' : D.k === 'combo' ? '🔗 ' + D.combos + ' combo' + (D.combos === 1 ? '' : 's') + ' · ✅ ' + D.hits + ' returns' : D.k === 'run' ? '🏃 ' + D.hits + ' returns · fastest ×' + D.spd.toFixed(2) : '🤹 ' + D.hits + ' touches';
  let h = '<div class="big">' + (stars ? '🏆' : '💪') + '</div><h2 class="' + (stars ? 'cheer' : '') + '">' + (stars === 3 ? 'Super training!' : stars ? 'Great training!' : 'Keep practising!') + '</h2>'
    + '<div class="note">' + mode.icon + ' ' + mode.name + ' · ' + PD.LEVELS[G.level].name + '</div>'
    + '<div class="rating">' + [1, 2, 3].map(i => '<span class="st' + (i <= stars ? '' : ' off') + '">⭐</span>').join('') + '</div><div class="score-big">' + D.score + ' <small>points</small></div>'
    + '<div class="stats"><span>' + line + '</span><span>🔁 best ' + D.bestStreak + ' in a row</span><span>🏆 ' + pts.toLocaleString() + '</span></div>'
    + '<div class="note">⭐ ' + D.targets[0] + ' · ⭐⭐ ' + D.targets[1] + ' · ⭐⭐⭐ ' + D.targets[2] + '</div>';
  if(stars < 3) h += '<div class="note">💡 ' + ({zone: 'Push the stick towards the zone before you hit — up = far, down = near.', combo: 'Tap 🦵 twice, then ⚡ while the ball is still HIGH.', run: 'Stay in the middle behind the table — the Coach aims everywhere.', juggle: 'Let it drop to your knee or foot, then head it — switching scores more.'})[D.k] + '</div>';
  h += '<div class="save-note" id="save-note">' + (me.name !== 'Guest' ? '💾 Saving…' : '') + '</div>';
  h += '<div class="res-btns" id="res-btns"><button class="sp-btn sp-secondary" id="res-levels" data-sound="tap">🎚️ Levels</button><button class="sp-btn sp-secondary" id="res-again" data-sound="pop">🔁 Again</button>'
    + (stars && G.level < 5 && canPlay(G.level + 1) ? '<button class="sp-btn sp-primary" id="res-next" data-sound="pop">Next level ▶</button>' : '') + '</div><div class="comics-slot" id="comic-strip-slot"></div>';
  showResult(h);
  $('res-levels').onclick = () => leavePlay();
  $('res-again').onclick = () => { SET.cfg = null; startMatch(); };
  if($('res-next')) $('res-next').onclick = () => { const nx = G ? G.level + 1 : Math.min(5, SET.level + 1); leavePlay(); openSetup(nx); };
  if(stars && FX) confetti(['🎯', '⭐', '🔥', '🎉'], 20);
  if(me.name !== 'Guest') saveWin(me.name, G.level, {score: pts, stars, cleared: false, drill: true, timeSec: secs, theme: mode.icon + ' ' + mode.name + ' · 🏟️ Classic', stats}, 0);
  if(UI.alsoTry) UI.alsoTry({player: S.player, game: GAME_ID, at: () => $('res-btns'), current: G.mode, open: id => { leavePlay(); msOpen(id); }});
  G.resultShown = true;
}
/* ================= 🏆 CUPS (pd-4b) ================= */
function cupRoundName(C){ return CUP_ROUND[C.alive.length / 2] || 'Round'; }
function cupTeamHtml(t, lost){ return '<span class="cup-team' + (t.me ? ' me' : '') + (lost ? ' out' : '') + '">' + t.icon + ' ' + UI.esc(t.name) + '</span>'; }
function openCupSetup(lvl){
  const C = CUPS[SET.cup], L = PD.LEVELS[lvl]; SET.level = lvl;
  if(LEVEL_UI[lvl].hardcore || SET.who === 'duo') SET.who = 'robot';
  if(!SET.p2 || !others().includes(SET.p2)) SET.p2 = others()[0] || '';
  $('setup-logo').textContent = C.icon; $('setup-title').textContent = C.name + ' · ' + L.name;
  $('setup-sub').textContent = C.n + ' teams, knock-out: lose once and you are out · every match is one set, first to ' + CUP_TARGET[lvl] + (C.family ? ' · family members captain the other teams' : '') + ' · ' + LEVEL_UI[lvl].blurb.replace(/ (First to|Best of) [^.]*\./, '');
  const row = $('who-row'), sp = CUP_SPORTS.includes(SET.cupSport) ? SET.cupSport : 'beach';
  row.innerHTML = '<span class="cup-lbl">🏆 Cup:</span>' + CUP_ORDER.map(k => '<button class="chip' + (k === SET.cup ? ' on' : '') + '" data-ck="' + k + '" data-sound="tap">' + CUPS[k].icon + ' ' + CUPS[k].name + '</button>').join('') + '<span class="cup-br"></span><span class="cup-lbl">🏅 Sport:</span>' + CUP_SPORTS.map(k => '<button class="chip' + (k === sp ? ' on' : '') + '" data-sp="' + k + '" data-sound="tap">' + PD.MODES[k].icon + ' ' + PD.MODES[k].name + '</button>').join('')
    + (PD.MODES[sp].n > 1 && others().length && !LEVEL_UI[lvl].hardcore ? '<button class="chip' + (SET.who === 'team' ? ' on' : '') + '" data-tm="1" data-sound="tap">🤝 + ' + UI.esc(SET.p2) + '</button>' : '');
  row.querySelectorAll('[data-ck]').forEach(b => b.onclick = () => { SET.cup = SET.cupKind = b.dataset.ck; savePrefs(); openCupSetup(lvl); });
  row.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => { SET.cupSport = b.dataset.sp; if(PD.MODES[SET.cupSport].n === 1) SET.who = 'robot'; savePrefs(); openCupSetup(lvl); });
  const tm = row.querySelector('[data-tm]'); if(tm) tm.onclick = () => { SET.who = SET.who === 'team' ? 'robot' : 'team'; savePrefs(); openCupSetup(lvl); };
  SET.cupSport = sp; SET.mode = sp; SET.cupTeams = cupTeams(C);
  $('team-box').innerHTML = '<div class="cup-pre"><div class="team-h">' + C.icon + ' ' + C.n + ' teams</div><div class="cup-grid">' + SET.cupTeams.map(t => '<div class="cup-seed' + (t.me ? ' me' : '') + '"><canvas width="72" height="84" data-cav="' + UI.esc(t.cap) + '"></canvas><b>' + t.icon + ' ' + UI.esc(t.name) + '</b><small>' + (t.me ? 'your team' : t.family ? '👑 captain ' + UI.esc(t.cap) : '🤖 robots') + '</small></div>').join('') + '</div></div>';
  $('team-box').querySelectorAll('canvas[data-cav]').forEach(c => { const t = SET.cupTeams.find(x => x.cap === c.dataset.cav); drawPreviewCanvas(c, t.av, {name: t.cap, t: 1}); });
  buildArenas();
  const mc = () => { $('aim-chip').textContent = '🎯 Landing marker: ' + (SET.marker ? 'on' : 'off'); $('aim-chip').classList.toggle('on', SET.marker); };
  mc(); $('aim-chip').onclick = () => { SET.marker = !SET.marker; savePrefs(); mc(); };
  $('go-btn').onclick = () => startCup();
  showScreen('setup');
}
function cupTeams(C){
  const fam = C.family ? others().slice().sort(() => Math.random() - 0.5) : [], pool = CUP_TEAMS.slice().sort(() => Math.random() - 0.5), teams = [];
  teams.push({name: 'Team ' + S.player, icon: '🔥', cap: S.player, av: playAv(myAvatar(S.player)), me: true});
  for(let i = 1; i < C.n; i++){ const f = fam[i - 1], c = pool[i - 1];
    teams.push(f ? {name: 'Team ' + f, icon: '👑', cap: f, av: playAv(myAvatar(f)), family: true} : {name: c[1], icon: c[0], cap: c[1] + ' captain', av: playAv(defaultAvatar(c[1].toLowerCase())), robot: true}); }
  return teams;
}
function startCup(){
  const C = CUPS[SET.cup], teams = (SET.cupTeams || cupTeams(C)).map((t, i) => Object.assign({}, t, {i}));
  const order = [0].concat(teams.slice(1).map(t => t.i).sort(() => Math.random() - 0.5));   // you play the first match of the bracket
  SET.cupState = {k: C.k, level: SET.level, sport: SET.cupSport, sportBack: SET.mode, teams, alive: order, results: [], round: 0, done: false, place: ''};
  showCupCard();
}
function cupPairs(Cs){ const a = Cs.alive, pr = []; for(let i = 0; i < a.length; i += 2) pr.push([a[i], a[i + 1]]); return pr; }
function cupMeTeamCfg(Cs, opp){
  const n = PD.MODES[Cs.sport].n, t = Cs.teams[opp], fam = others().filter(x => x !== SET.p2 && x !== t.cap).sort(() => Math.random() - 0.5);
  const t0 = [{name: S.player, av: playAv(myAvatar(S.player)), human: 1, pins: pinsOf(S.player)}];
  if(SET.who === 'team' && SET.p2 && n > 1) t0.push({name: SET.p2, av: playAv(myAvatar(SET.p2)), human: 2, pins: pinsOf(SET.p2)});
  let fi = 0; while(t0.length < n){ const nm = fam[fi++]; t0.push(nm ? {name: nm, av: playAv(myAvatar(nm)), robot: true} : {name: 'Robo-' + t0.length, av: playAv(defaultAvatar('robo' + t0.length)), robot: true}); }
  const t1 = [{name: t.robot ? t.name : t.cap, av: t.av, robot: true}]; while(t1.length < n) t1.push({name: t.name + ' ' + (t1.length + 1), av: playAv(defaultAvatar(t.name + t1.length)), robot: true});
  return [t0, t1];
}
function cupSimulate(Cs, a, b){   // a robot-vs-robot match of the bracket (a real quick match of the engine)
  const r = PD.simulate({mode: Cs.sport, level: Cs.level, seed: (Date.now() + a * 7 + b * 13) % 100000 + 1, oneSet: true, target: CUP_TARGET[Cs.level], teams: [[{name: 'A'}], [{name: 'B'}]]}, 900);
  const w = r.winner === 1 ? 1 : 0; return {a, b, w: w === 0 ? a : b, score: r.score};
}
function showCupCard(last){
  const Cs = SET.cupState, C = CUPS[Cs.k], champ = Cs.done && Cs.place === 'champion';
  const rounds = []; let n = Cs.teams.length; while(n >= 2){ rounds.push(n); n /= 2; }
  const resHtml = Cs.results.map(r => '<div class="cup-res' + (r.a === 0 || r.b === 0 ? ' mine' : '') + '">' + cupTeamHtml(Cs.teams[r.a], r.w !== r.a) + '<b>' + r.score.join(' – ') + '</b>' + cupTeamHtml(Cs.teams[r.b], r.w !== r.b) + '<i>' + (r.w === r.a ? '◀' : '▶') + '</i></div>').join('');
  const next = !Cs.done ? cupPairs(Cs).find(p => p[0] === 0 || p[1] === 0) : null, opp = next ? (next[0] === 0 ? next[1] : next[0]) : -1;
  let h = '<div class="big">' + (champ ? '🏆' : Cs.done ? '🏅' : C.icon) + '</div><h2 class="' + (champ ? 'cheer' : '') + '">' + (champ ? 'You won the ' + C.name + '!' : Cs.done ? (Cs.place === 'final' ? '🥈 Runner-up!' : Cs.place === 'semi' ? '🥉 Semi-finalist!' : 'Out in the quarter-final') : C.name + ' · ' + cupRoundName(Cs)) + '</h2>'
    + '<div class="note">' + PD.MODES[Cs.sport].icon + ' ' + PD.MODES[Cs.sport].name + ' · ' + PD.LEVELS[Cs.level].name + ' · first to ' + CUP_TARGET[Cs.level] + '</div>';
  if(last) h += '<div class="cup-last">' + last + '</div>';
  if(resHtml) h += '<div class="cup-results">' + resHtml + '</div>';
  if(next) h += '<div class="cup-next">Next: ' + cupTeamHtml(Cs.teams[0]) + ' <b>vs</b> ' + cupTeamHtml(Cs.teams[opp]) + '</div>';
  else if(!Cs.done) h += '<div class="cup-next">' + Cs.alive.map(i => cupTeamHtml(Cs.teams[i])).join(' · ') + '</div>';
  h += '<div class="save-note" id="save-note"></div><div class="res-btns" id="res-btns"><button class="sp-btn sp-secondary" id="res-levels" data-sound="tap">🎚️ Levels</button>'
    + (Cs.done ? '<button class="sp-btn sp-primary" id="cup-new" data-sound="pop">🔁 New cup</button>' : '<button class="sp-btn sp-primary" id="cup-play" data-sound="pop">▶ Play the ' + cupRoundName(Cs).toLowerCase() + '</button>') + '</div><div class="comics-slot" id="comic-strip-slot"></div>';
  showResult(h);
  $('res-levels').onclick = () => { hideResult(); leavePlay(); };
  if($('cup-play')) $('cup-play').onclick = () => { hideResult(); SET.mode = Cs.sport; SET.cfg = cupMeTeamCfg(Cs, opp); Cs.opp = opp; startMatch(); };
  if($('cup-new')) $('cup-new').onclick = () => { const lv = Cs.level; hideResult(); leavePlay(); openSetup(lv); };
  if(champ && FX) confetti(['🏆', '🔥', '⭐', '🎉', '👑'], 34);
}
function finishCupMatch(){
  if(G && G.M) PD.ctlHome(G.M);   /* 🎮 pd-8a */
  stopLoop(); const M = G.M, Cs = SET.cupState, me = G.locals[0], won = M.winner === me.team, opp = Cs.opp;
  $('hand').classList.add('hidden'); $('goal-line').classList.add('off'); NOTES.length = 0;
  // feats for every person of this match (kills, saves, spirits …); the cup itself is saved when it ends
  const nh = PD.noHands(M), st = p => ({games: 1, wins: M.winner === p.team ? 1 : 0, hoops: p.st.hoops || 0, edges: p.st.edges || 0, spirits: p.st.spirits || 0, duos: p.st.duos || 0, trios: p.st.trios || 0, aces: p.st.aces, kills: p.st.kills, assists: p.st.assists, digs: p.st.digs + p.st.dives, dives: p.st.dives, blocks: p.st.blocks, stuffs: p.st.stuffs,
    traps: (p.st.traps || 0) + (nh && !PD.isSpark(M) ? p.st.bumps : 0), pops: p.st.pops || 0, feeds: p.st.feeds || 0, beasts: window.SpiritBestiary ? SpiritBestiary.count(p.name) : 0, sets: p.st.sets, bumps: nh ? 0 : p.st.bumps, pyras: p.st.pyras, rally: M.rallyMax});
  G.locals.forEach((p, i) => { if(p.name !== 'Guest') saveFeatsOnly(p.name, st(p), i); });
  const mine = {a: 0, b: opp, w: won ? 0 : opp, score: [M.teams[0].score, M.teams[1].score]}, roundOf = Cs.alive.length;
  Cs.results.push(mine);
  cupPairs(Cs).forEach(pr => { if(pr[0] === 0 || pr[1] === 0) return; Cs.results.push(cupSimulate(Cs, pr[0], pr[1])); });
  const winners = cupPairs(Cs).map(pr => { const r = Cs.results.slice().reverse().find(x => (x.a === pr[0] && x.b === pr[1]) || (x.a === pr[1] && x.b === pr[0])); return r.w; });
  Cs.teams.forEach((t, i) => { if(Cs.alive.includes(i) && !winners.includes(i)) t.out = true; });
  Cs.alive = winners;
  const last = (won ? '🎉 You beat ' : '😅 ' + UI.esc(Cs.teams[opp].name) + ' beat you ') + (won ? Cs.teams[opp].icon + ' ' + UI.esc(Cs.teams[opp].name) + ' ' : '') + mine.score.join(' – ');
  if(!won || Cs.alive.length === 1){
    Cs.done = true; Cs.place = won ? 'champion' : roundOf === 2 ? 'final' : roundOf === 4 ? 'semi' : 'quarter';
    const C = CUPS[Cs.k], champ = Cs.place === 'champion', stars = champ ? 3 : Cs.place === 'final' ? 2 : Cs.place === 'semi' ? 1 : 0;
    if(champ) cheerChamp(); /* 📣 cs-pd */
    const pts = Math.round((champ ? 3000 : Cs.place === 'final' ? 1800 : Cs.place === 'semi' ? 900 : 300) * (C.n === 8 ? 1.5 : 1) * (1 + Cs.level * 0.25) * (LEVEL_UI[Cs.level].hardcore ? 3 : 1));
    showCupCard(last);
    G.locals.forEach((p, i) => { if(p.name === 'Guest') return;
      saveWin(p.name, Cs.level, {score: pts, stars, cleared: champ, cup: Cs.place, timeSec: Math.round((Date.now() - G.t0) / 1000), theme: C.icon + ' ' + C.name + ' · ' + PD.MODES[Cs.sport].icon + ' ' + PD.MODES[Cs.sport].name,
        stats: {games: 0, cups: champ ? 1 : 0, familyCups: champ && C.family ? 1 : 0, ['m_' + C.k]: 1}}, i + 2); });
  } else showCupCard(last);
  G.resultShown = true;
}
function paintPodium(cv, M){
  if(!cv) return; const g = cv.getContext('2d'), w = M.winner, ppl = M.players.filter(p => p.team === w).slice(0, 3), k = 1.25;
  g.fillStyle = w === 0 ? '#FFE3C4' : '#D6E6FF'; rr(g, 0, 0, cv.width, cv.height, 22); g.fill();
  ppl.forEach((p, i) => { const x = cv.width * (ppl.length === 1 ? 0.5 : 0.2 + 0.6 * i / (ppl.length - 1)), y = cv.height - 22;
    drawAvatar(g, {name: p.name, av: p.av || defaultAvatar(p.name), dir: 1, walkT: 0, gest: {g: GESTURES.find(x2 => x2.k === 'cheer') || GESTURES[0], t: 0.4 + i * 0.2}}, x, y, k * 1.6, {t: 1 + i, noPet: true});
    g.font = '800 18px Nunito, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#2A1A10'; g.fillText(p.name.slice(0, 10), x, cv.height - 4); });
  emo(g, '🏆', cv.width - 34, 34, 40);
}
const PENDING_KEY = 'sp_pyradive_pending';
const NOTES = [];
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function flushPending(){ const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => { const r = google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))); if(w.feats) r.saveFeats(w.name, GAME_ID, w.stats); else r.saveLevelResult(GAME_ID, w.name, w.lvl, w.extra); }); }
function putNote(i, html){ NOTES[i] = html; const n = $('save-note'); if(n) n.innerHTML = NOTES.filter(Boolean).join('<br>'); }
function saveWin(name, lvl, extra, seat, tries){
  tries = tries || 0; const p = S.progress[name] || (S.progress[name] = {unlocked: 0, tokens: [], best: []});
  const who = G && G.locals.length > 1 ? UI.esc(name) + ': ' : '';
  google.script.run.withSuccessHandler(res => {
      const best = (p.best || []).slice(); if(res && res.best) best[lvl] = res.best;
      S.progress[name] = {unlocked: res ? res.unlocked : p.unlocked, tokens: res ? res.tokens : p.tokens, best}; flushPending(); putNote(seat, who + saveText(res || {}, extra.cleared, extra.drill, extra.cup));
    }).withFailureHandler(() => {
      if(tries < 1){ setTimeout(() => saveWin(name, lvl, extra, seat, tries + 1), 1200); return; }
      writePending(readPending().concat([{name, lvl, extra}])); putNote(seat, who + '⚠️ Could not save yet — it will be sent again next time.');
    }).saveLevelResult(GAME_ID, name, lvl, extra);
}
function saveFeatsOnly(name, stats, seat){
  google.script.run.withSuccessHandler(res => putNote(seat, UI.esc(name) + ': ' + featText(res, '✅ Feats saved')))
    .withFailureHandler(() => { writePending(readPending().concat([{name, feats: true, stats}])); putNote(seat, UI.esc(name) + ': ⚠️ Will be sent next time.'); }).saveFeats(name, GAME_ID, stats);
}
function featText(fe, base){ let h = base || ''; if(fe){ (fe.newTitles || []).forEach(t => { h += '<br><span class="title-new">🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name) + '</span>'; }); (fe.newBadges || []).forEach(b => { h += '<br><span class="feat-new">' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName + '</span>'; }); } return h; }
function saveText(res, cleared, drill, cup){
  if(cup) return featText(res.feats, (cup === 'champion' ? '🏆 Cup win saved!' : '✅ Cup result saved') + (res.newHighScore && !res.firstTime ? ' · 🎉 New best!' : '') + (res.newBadge ? '<br><span class="new-badge">🏅 New badge: ' + UI.esc(res.newBadge) + '</span>' : ''));
  if(drill) return featText(res.feats, res.newHighScore && !res.firstTime ? '🎉 New training best!' : '✅ Training saved');
  const h = res.newBadge ? '<span class="new-badge">🏅 New badge: ' + UI.esc(res.newBadge) + '</span>' : res.newHighScore && !res.firstTime ? '🎉 New high score!' : cleared ? (res.best && res.best.score ? 'Best: 🏆 ' + Number(res.best.score).toLocaleString() : '✅ Saved') : '✅ Feats saved — win to unlock the next level';
  return featText(res.feats, h);
}
/* 📣 CHEERSQUAD (cs-pd) START — the live crowd in front of the painted stands (CheerSquad.html, 📣 Cheer chat). Don't remove: the Cheer chat re-applies it. */
// sides: 0 = left / orange (the people) · 1 = right / blue (robots, or a 2nd person). Fans = family members not on court (robots may carry family names: those stay out too).
function cheerMount(){
  if(!window.Cheer || !G || !G.M) return; Cheer.unmount(); const M = G.M, on = new Set(M.players.map(p => p.name)), hum = t => M.players.some(p => p.team === t && p.human);
  const nm = t => { const p = M.players.find(q => q.team === t && q.human) || M.players.find(q => q.team === t); return p ? p.name : ['Orange', 'Blue'][t]; };
  Cheer.mount($('stage'), {game: 'pyraspike', players: [{name: nm(0), side: 0, human: hum(0) || !hum(1)}, {name: nm(1), side: 1, human: hum(1)}], me: {name: S.player},
    family: (S.players || []).map(p => p.Name).filter(n => !on.has(n)), avatars: S.avatars || {}, mode: 'scene', ref: $('court'),
    avoid: () => Array.from(document.querySelectorAll('#gbar, .top-btn, #pads > *, #keylegend:not(.hidden)')), clear: () => true});   /* the court, net and players paint over the crowd anyway */
}
// the stands band: 2 staggered rows (front row on the band's bottom edge, back row smaller + higher, half a step over), gaps where the game draws its own things
function cheerScene(g, M, W, H, farY, top){
  if(!window.Cheer || !G || G.M !== M || !Cheer.active()) return; const bh = farY - top; if(bh < 18) return;   /* phones upright: the band is too thin (never shrink the court) */
  const k1 = Math.min(1.05, bh * 0.92 / 100) * (Cheer.stats().size === 'party' ? 1 : 0.92), k2 = k1 * 0.86, two = bh > 46, step = Math.max(26, 46 * k1), gaps = [];
  if(!isHoop(M) && !PD.isSpark(M)){ const r = Math.max(7, Math.min(16, V.k * 0.26)); gaps.push([P(0, -M.W / 2 - 0.45, 0)[0], 14 + 16 * k1]); [0, 1].forEach(t => gaps.push([V.short ? W * (t ? 0.82 : 0.18) : Math.max(r * 4, Math.min(W - r * 4, P(PD.sgn(t) * M.L * 0.5, -M.W / 2 - FEX(), 0)[0])), r * 4.6]));   /* 📱 pd-5b: the counters' spot */
  }
  if(isHoop(M)) gaps.push([P(0, 0, 0)[0], V.k * 1.1 + 20]);   /* the hoop + its ropes */
  if(PD.isSpark(M)) gaps.push([W / 2, Math.min(W * 0.12, V.k * 0.9) + 16]);   /* the table's net posts */
  const shot = top > 150 ? Math.min(220, W * 0.3) / 2 + 14 : 0;   /* the big score screen above the stands */
  const free = (x, back) => !gaps.some(([gx, gw]) => Math.abs(x - gx) < gw) && !(back && shot && Math.abs(x - W / 2) < shot);
  const key = [Math.round(W), Math.round(farY), Math.round(top), two, Cheer.stats().size].join('|');
  if(G.cheerKey !== key){ G.cheerKey = key; const c = [];
    for(let x = step * 0.6; x < W - step * 0.4; x += step) if(free(x, false)) c.push({id: 'f' + Math.round(x), x, y: farY - 2 - 5 * k1, k: k1, half: x < W / 2 ? 0 : 1});
    if(two) for(let x = step * 1.1; x < W - step * 0.4; x += step) if(free(x, true)) c.push({id: 'b' + Math.round(x), x, y: farY - bh * 0.42, k: k2, half: x < W / 2 ? 0 : 1});
    c.sort((a, b) => (a.id[0] === b.id[0] ? 0 : a.id[0] === 'f' ? -1 : 1) || Math.abs(a.x - W / 2) - Math.abs(b.x - W / 2));   /* front row first, near the middle first */
    G.cheerOrder = c; }
  Cheer.place(g, G.cheerOrder, {key: 'stands', w: W, h: H});
}
// small wins get a 1.2 s breather (a fast rally isn't a wall of cheers); big ones, misses and the ends always play
function cheerSay(kind, side){ if(!kind || !window.Cheer || !Cheer.active() || !G) return; const now = performance.now();
  if(kind === 'goal' && (G.cheerAt || 0) > now - 1200) return; if(kind === 'big' && (G.cheerBig || 0) > now - 700) return;
  if(kind === 'goal') G.cheerAt = now; if(kind === 'big'){ G.cheerBig = now; G.cheerAt = now; } Cheer.react(kind, {side: side == null ? 0 : side}); }
function cheerEvent(e, M){ if(!window.Cheer || !Cheer.active() || !G) return; const tm = e.team != null ? e.team : e.p != null && M.players[e.p] ? M.players[e.p].team : 0;
  switch(e.k){
    case 'serveReady': case 'serveToss': Cheer.hush(true); break;   /* 🤫 quiet for the serve */
    case 'serve': Cheer.hush(false); break;
    case 'kill': cheerSay(e.pyra || e.spirit ? 'big' : 'goal', tm); break;
    case 'ace': case 'stuff': cheerSay('big', tm); break;
    case 'pyra': cheerSay('big', tm); break;
    case 'spirit': case 'teamSpirit': cheerSay('big', -1); break;   /* everyone stands for a creature */
    case 'edge': Cheer.react('close', {side: -1}); setTimeout(() => cheerSay('goal', tm), 700); break;
    case 'longRally': if(e.n >= 10 && e.n % 5 === 0) Cheer.react('close', {side: -1}); break;
    case 'fault': case 'out': case 'serveMiss': Cheer.hush(false); Cheer.react('miss', {side: tm}); break;
    case 'point': Cheer.hush(false); if(e.why === 'in' || e.why === 'drop') cheerSay('goal', tm); break;
    case 'setPoint': case 'matchPoint': Cheer.react('close', {side: tm}); break;
    case 'comeback': Cheer.react('comeback', {side: tm}); break;
    case 'hoop': case 'partyPoint': cheerSay('goal', tm); break;
    case 'drillHit': if(e.streak === 5 || e.streak === 10) cheerSay(e.streak >= 10 ? 'big' : 'goal', 0); break;
    case 'drillEnd': Cheer.hush(false); Cheer.react(e.stars >= 3 ? 'win' : e.stars ? 'goal' : 'lose', {side: 0}); break;
    case 'match': { Cheer.hush(false); const w = e.winner, duo = M.players.some(p => p.team === 1 && p.human) && M.players.some(p => p.team === 0 && p.human);
      if(w == null || w < 0) Cheer.react('goal', {side: -1}); else if(duo || w === 0) Cheer.react('win', {side: w}); else Cheer.react('lose', {side: 0}); break; }
  } }
function cheerChamp(){ if(window.Cheer && Cheer.active()){ Cheer.react('win', {side: 0}); setTimeout(() => { if(window.Cheer && Cheer.active()) Cheer.react('big', {side: -1}); }, 1600); } }   /* 🏆 the biggest win */
function cheerFaces(){ setTimeout(() => { const card = $('result-card'); if(!card || !window.Cheer || !Cheer.active() || card.querySelector('.cs-faces') || $('result').classList.contains('hidden')) return;
  const c = Cheer.faces(5, {h: 54}); if(!c) return; const cap = document.createElement('div'); cap.className = 'cs-faces-cap'; cap.textContent = '📣 Your cheer squad';
  const at = card.querySelector('.res-btns'); if(at) { at.parentNode.insertBefore(c, at); at.parentNode.insertBefore(cap, at); } else { card.appendChild(cap); card.appendChild(c); } }, 900); }
/* 📣 CHEERSQUAD END */
function showResult(html){ $('result-card').innerHTML = html; pdResultBadge(); /* 🏷️ pd-7 */ $('result').classList.remove('hidden'); cheerFaces(); /* 📣 cs-pd */ }
function hideResult(){ $('result').classList.add('hidden'); }
function confetti(list, count){ for(let i = 0; i < (count || 24); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = pdPick(list); e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goBack(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }
window.feedbackContext = () => ({page: 'PyraDive', game: GAME_ID, level: G ? G.level : SET.level, mode: SET.mode});
window.addEventListener('resize', () => { if(G && !$('scr-play').classList.contains('hidden')){ resize(); buildPads(); } });

/* ================= BOOT ================= */
function boot(){
  UI.loading('pyraspike');
  google.script.run.withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {}; S.ballSkins = d.ballSkins || {}; S.tableSkins = d.tableSkins || {}; S.bombs = d.bombs || {}; seedLooks(d.looks || {}); if(window.SpiritBestiary) S.players.forEach(p => { if(p.Name !== CURRENT_PLAYER) SpiritBestiary.load(p.Name); });   /* 🎨 ⭐ pd-4e: looks + pins of every family player */
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      flushPending();
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)) choosePlayer(CURRENT_PLAYER); else { renderPlayers(); showScreen('player'); }
      if(UI.guideOnce) UI.guideOnce('pyradive', [UI.gameHelp(GAME_ID, 'PyraDive', '🔥')].filter(Boolean));
    }).withFailureHandler(() => { UI.loaded(); UI.toast('Could not load players — check the connection', 'err'); renderPlayers(); showScreen('player'); })
    .getLevelGameData(GAME_ID, CURRENT_PLAYER);
}
boot();
