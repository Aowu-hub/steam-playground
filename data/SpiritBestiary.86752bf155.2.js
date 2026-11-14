
window.SpiritBestiary = (function () {
  // tier · slot · key · name · Thai name · icon · colour · round · where it comes from · a fun fact (our own words)
  const C = [
    // ── 🔥🔥 Spirit Dive (one player, a full flame) ──
    ['solo', 'dunk', 'dragon', 'Dragon', '', '🐉', '#E5304B', 3, 'Stories from all over the world', 'Dragons in many stories guard treasure — this one guards the net and smashes anything that comes near.'],
    ['solo', 'dunk', 'singha', 'Singha', 'สิงห์', '🦁', '#FFB627', 3, 'Thailand + South-East Asia', 'A proud lion that stands guard at temple gates. Its roar is so loud the ball runs away.'],
    ['solo', 'dunk', 'thunderbird', 'Thunderbird', '', '⚡', '#2F7BEA', 3, 'North American stories', 'A giant bird whose wing beats make thunder — a spike from the sky.'],
    ['solo', 'dunk', 'ifrit', 'Ifrit', '', '🧞', '#FF6B1A', 3, 'Stories from Arabia', 'A spirit made of smokeless fire. It turns the ball into a fireball for one huge hit.'],
    ['solo', 'dunk', 'minotaur', 'Minotaur', '', '🐂', '#8C4A2F', 4, 'Old Greek stories', 'Half bull, it charges straight through — but in PyraDive it plays fair!'],
    ['solo', 'block', 'golem', 'Golem', '', '🗿', '#8C7B6B', 3, 'Old European stories', 'A giant made of clay or stone that stands perfectly still — a wall no ball gets past.'],
    ['solo', 'block', 'gajasiha', 'Gajasiha', 'คชสีห์', '🐘', '#7B4FE0', 3, 'Thailand', 'Part elephant, part lion: strong as an elephant, brave as a lion.'],
    ['solo', 'block', 'titan', 'Titan', '', '⛰️', '#5C6B80', 3, 'Old Greek stories', 'Giants as tall as mountains — its hands cover the whole net.'],
    ['solo', 'block', 'kraken', 'Kraken', '', '🦑', '#2FA3A3', 3, 'Old Norway sailor stories', 'A sea monster with huge arms. Eight arms = eight blockers!'],
    ['solo', 'block', 'colossus', 'Colossus', '', '🏛️', '#C9A86A', 4, 'Old Greek stories', 'A giant bronze statue that wakes up just to stop one ball.'],
    ['solo', 'drive', 'phoenix', 'Phoenix', '', '🐦‍🔥', '#FF6B1A', 3, 'Stories from many lands', 'A firebird that is born again from its own flames — it never gives up.'],
    ['solo', 'drive', 'hongsa', 'Hongsa', 'หงส์', '🦢', '#F2D79E', 3, 'Thailand + Myanmar', 'A graceful golden swan — its serve glides so smoothly nobody sees it coming.'],
    ['solo', 'drive', 'pegasus', 'Pegasus', '', '🐎', '#9BB6E0', 3, 'Old Greek stories', 'A winged horse that gallops across the sky — the fastest serve there is.'],
    ['solo', 'drive', 'griffin', 'Griffin', '', '🦅', '#C98A2F', 3, 'Old Persian + Greek stories', 'Eagle in front, lion behind: sharp eyes to aim, strong legs to hit.'],
    ['solo', 'drive', 'roc', 'Roc', '', '🪶', '#A07850', 4, 'Stories from Arabia', 'A bird so big it could carry an elephant — imagine its serve!'],
    ['solo', 'dink', 'kitsune', 'Kitsune', '', '🦊', '#FF8A3D', 3, 'Japan', 'A clever fox with many tails — it fools everyone and drops the ball where nobody is.'],
    ['solo', 'dink', 'kinnaree', 'Kinnaree', 'กินรี', '🧚', '#E6A3FF', 3, 'Thailand + South-East Asia', 'Half bird, half dancer, famous for grace — its dink floats like a feather.'],
    ['solo', 'dink', 'ghost', 'Ghost', '', '👻', '#C9D4E8', 3, 'Stories from everywhere', 'A friendly ghost — the ball goes right through the blockers\' hands. Boo!'],
    ['solo', 'dink', 'sphinx', 'Sphinx', '', '🏺', '#E0B85A', 3, 'Old Egypt + Greece', 'It loves riddles. Where will the ball land? Nobody can solve it in time.'],
    ['solo', 'dink', 'wisp', 'Will-o\'-wisp', '', '✨', '#BFE3FF', 4, 'Old European stories', 'A tiny floating light that leads you the wrong way — the ball follows it.'],
    ['solo', 'save', 'naga', 'Naga', 'นาค', '🐍', '#2FBF71', 3, 'Thailand + South + South-East Asia', 'A heroic serpent of the rivers that protects people — and catches every ball.'],
    ['solo', 'save', 'makara', 'Makara', 'มกร', '🐊', '#2F7BEA', 3, 'Thailand + South Asia', 'A sea creature guarding doorways — nothing gets past into the sand.'],
    ['solo', 'save', 'salamander', 'Salamander', '', '🦎', '#FF8A3D', 3, 'Old European stories', 'A little lizard said to live inside fire — it dives through the flames for the ball.'],
    ['solo', 'save', 'leviathan', 'Leviathan', '', '🐋', '#2F5FB8', 3, 'Very old stories of the sea', 'A whale-sized sea giant — one splash and the ball is back up.'],
    ['solo', 'save', 'kappa', 'Kappa', '', '🐢', '#4DAF50', 4, 'Japan', 'A polite water creature that bows — and saves the ball while bowing.'],
    // ── 🔥🔥×2 Spirit Duo Dive (two full flames on one team) ──
    ['duo', 'dunk', 'garuda', 'Garuda', 'ครุฑ', '🦅', '#E5304B', 3, 'Thailand + South + South-East Asia', 'The great heroic eagle, king of birds — two players fly up together for the hit.'],
    ['duo', 'dunk', 'gandaberunda', 'Gandaberunda', '', '🦅🦅', '#FFB627', 3, 'South India', 'A two-headed bird of great strength — two heads, two hitters, one smash.'],
    ['duo', 'dunk', 'twindragon', 'Twin Dragon', '', '🐉🐉', '#FF4D8D', 3, 'Stories from all over the world', 'Two dragons twisting around the ball like a spiral of fire.'],
    ['duo', 'dunk', 'paksa', 'Paksa Hasadin', 'ปักษาหัสดิน', '🐘🦅', '#7B4FE0', 4, 'Thailand', 'A bird with an elephant\'s head — mighty and fast at the same time.'],
    ['duo', 'dunk', 'twingriffin', 'Twin Griffin', '', '🦅🦁', '#C98A2F', 4, 'Old Persian + Greek stories', 'Two griffins diving from both sides of the net.'],
    ['duo', 'block', 'orthrus', 'Orthrus', '', '🐕🐕', '#8C4A2F', 3, 'Old Greek stories', 'A two-headed guard dog — it watches left AND right.'],
    ['duo', 'block', 'twinsingha', 'Twin Singha', 'สิงห์คู่', '🦁🦁', '#FFB627', 3, 'Thailand', 'Two lions, like the pair at a temple gate — side by side, nothing passes.'],
    ['duo', 'block', 'twinyaksha', 'Twin Yaksha', 'ยักษ์คู่', '🛡️🛡️', '#2FBF71', 3, 'Thailand + South Asia', 'Two giant temple guardians — huge, strong and kind to those they protect.'],
    ['duo', 'block', 'amphisbaena', 'Amphisbaena', '', '🐍🐍', '#4DAF50', 4, 'Old Greek stories', 'A snake with a head at each end — it can block both ways.'],
    ['duo', 'block', 'twingolem', 'Twin Golem', '', '🗿🗿', '#8C7B6B', 4, 'Old European stories', 'Two stone giants — a double wall.'],
    ['duo', 'dink', 'twinghost', 'Twin Ghost', '', '👻👻', '#C9D4E8', 3, 'Stories from everywhere', 'Which ghost has the ball? Neither! It is already over the net.'],
    ['duo', 'dink', 'kitsunepair', 'Kitsune pair', '', '🦊🦊', '#FF8A3D', 3, 'Japan', 'Two clever foxes playing tricks together — double the fooling.'],
    ['duo', 'dink', 'mirrorimp', 'Mirror Imp', '', '🪞', '#9BB6E0', 3, 'Old European stories', 'A cheeky imp in a mirror — the defenders chase the reflection.'],
    ['duo', 'dink', 'wisppair', 'Wisp pair', '', '✨✨', '#BFE3FF', 4, 'Old European stories', 'Two little lights dancing — the ball dances with them.'],
    ['duo', 'dink', 'shadowtwins', 'Shadow Twins', '', '🌑🌑', '#5C5C8A', 4, 'Our own story', 'Two shadows that move before you do.'],
    // ── 🔥🔥×3 Spirit Trio Dive (three full flames) ──
    ['trio', 'combo', 'chimera', 'Chimera', '', '🦁🐐🐍', '#FF6B1A', 3, 'Old Greek stories', 'Lion, goat and snake in one — dig, set and spike all at once. The point counts double!'],
    ['trio', 'combo', 'hydra', 'Hydra', '', '🐲🐲🐲', '#2FBF71', 3, 'Old Greek stories', 'Many heads, one team: every head plays a touch.'],
    ['trio', 'combo', 'erawan', 'Erawan', 'เอราวัณ', '🐘🐘🐘', '#F2D79E', 3, 'Thailand', 'The heroic three-headed white elephant — three players, three heads, one perfect play.'],
    ['trio', 'combo', 'asura', 'Asura', 'อสูร', '💪💪💪', '#E5304B', 4, 'Thailand + South Asia', 'Mighty giants with many arms — a combo nobody can follow.'],
    ['trio', 'combo', 'geryon', 'Geryon', '', '🛡️🛡️🛡️', '#5C6B80', 4, 'Old Greek stories', 'A giant with three bodies who moves as one.'],
    ['trio', 'block', 'cerberus', 'Cerberus', '', '🐕🐕🐕', '#8C4A2F', 3, 'Old Greek stories', 'A three-headed guard dog — three heads, three blockers.'],
    ['trio', 'block', 'nagathree', 'Three-headed Naga', 'นาคสามเศียร', '🐍🐍🐍', '#2FBF71', 3, 'Thailand + South-East Asia', 'A heroic Naga with three heads, guarding the river — and the net.'],
    ['trio', 'block', 'tripletitan', 'Triple Titan', '', '⛰️⛰️⛰️', '#5C6B80', 3, 'Our own story', 'Three mountain giants standing shoulder to shoulder.'],
    ['trio', 'block', 'orochi', 'Orochi', '', '🐲', '#7B4FE0', 4, 'Japan', 'A huge serpent with many heads from an old Japanese tale.'],
    ['trio', 'block', 'jiulong', 'Jiulong', '九龙', '🐉🐉🐉', '#FFB627', 4, 'China', 'Nine dragons — a wall of dragons from wall to wall.']
  ].map(r => ({tier: r[0], slot: r[1], k: r[2], name: r[3], th: r[4], icon: r[5], col: r[6], round: r[7], from: r[8], fact: r[9]}));
  const BY = {}; C.forEach(c => { BY[c.k] = c; });
  const MOVE = {dunk: 'Dunk / Spike', block: 'Block', drive: 'Drive / Serve', dink: 'Dink', save: 'Save (Dig / Dive)', combo: 'Combo (Dig → Set → Spike)'};
  const TIER = {solo: '🔥🔥 Spirit Dive', duo: '🔥🔥×2 Spirit Duo Dive', trio: '🔥🔥×3 Spirit Trio Dive'};
  const NOW = 4;   // creatures of rounds ≤ NOW can be called in games today (pd-4b: all 50)
  function list(o){ o = o || {}; return C.filter(c => (!o.tier || c.tier === o.tier) && (!o.slot || c.slot === o.slot) && (!o.round || c.round <= o.round)); }
  function get(k){ return BY[k] || null; }
  // found lists: this device first (works offline + instantly), the server row is merged in by load()
  const LS = n => 'sp_bestiary:' + n, mem = {};
  function local(n){ if(mem[n]) return mem[n]; let d = {}; try{ d = JSON.parse(localStorage.getItem(LS(n)) || '{}') || {}; }catch(e){} return (mem[n] = d); }
  function keep(n){ try{ localStorage.setItem(LS(n), JSON.stringify(mem[n] || {})); }catch(e){} }
  function merge(a, b){ for(const k in b){ if(!BY[k]) continue; const x = a[k], y = b[k]; a[k] = !x ? y.slice() : [Math.max(x[0] || 0, y[0] || 0), x[1] && y[1] ? (x[1] < y[1] ? x[1] : y[1]) : x[1] || y[1], x[2] || y[2]]; } return a; }
  function server(fn, args){ return new Promise(res => { try{ if(!(window.google && google.script && google.script.run)) return res(null); google.script.run.withSuccessHandler(res).withFailureHandler(() => res(null))[fn].apply(null, args); }catch(e){ res(null); } }); }
  // load(n): the server row (found + ⭐ pins) merged into this device's copy. Pins: the server wins; a device that pinned before pd-4d (no server row yet) sends its pins up once.
  const asked = {}, pinAt = {};
  function load(n){ if(!n) return Promise.resolve({}); asked[n] = 1; const t0 = Date.now();
    return server('getBestiaryAll', [n]).then(d => {
      if(d && typeof d === 'object'){
        if(d.found && typeof d.found === 'object') merge(local(n), d.found);
        if(d.pins && typeof d.pins === 'object'){ if(!(pinAt[n] >= t0)) putPins(n, d.pins); }   // a pin made while this answer travelled stays
        else if(d.pins === null){ const mine = rawPins(n); if(Object.keys(mine).length) server('saveBestiaryPins', [n, mine]); }
      }
      keep(n); return local(n); }); }
  const pend = {}; let timer = 0;
  function flush(){ timer = 0; for(const n in pend){ const d = pend[n]; delete pend[n]; server('saveBestiary', [n, d.add, d.game]); } }
  function add(n, k, game){
    if(!n || !BY[k]) return false; const d = local(n), today = new Date().toISOString().slice(0, 10), isNew = !d[k];
    d[k] = d[k] ? [(d[k][0] || 0) + 1, d[k][1], d[k][2]] : [1, today, game || '']; keep(n);
    const p = pend[n] || (pend[n] = {add: {}, game: game || ''}); p.add[k] = (p.add[k] || 0) + 1;
    if(!timer) timer = setTimeout(flush, 1500);
    return isNew;
  }
  // ⭐ pd-4b favourite pin: one creature per tier + slot (only found ones); games use it from 🔥 Intermediate.
  // pd-4d: per PLAYER — every pin is saved to the server (saveBestiaryPins); a player seen for the first time on this device is fetched in the background.
  const PS = n => 'sp_bestiary_pins:' + n;
  function rawPins(n){ let d = {}; try{ d = JSON.parse(localStorage.getItem(PS(n)) || '{}') || {}; }catch(e){} return d && typeof d === 'object' ? d : {}; }
  function putPins(n, d){ const c = {}; for(const key in d) if(/^(solo|duo|trio):[a-z]{2,12}$/.test(key) && BY[d[key]]) c[key] = d[key]; try{ localStorage.setItem(PS(n), JSON.stringify(c)); }catch(e){} }
  function pins(n){ if(n && !asked[n]) load(n); const d = rawPins(n); for(const key in d) if(!BY[d[key]] || !local(n)[d[key]]) delete d[key]; return d; }
  function pin(n, k){ const c = BY[k]; if(!n || !c || !local(n)[k]) return false; const d = pins(n), key = c.tier + ':' + c.slot; if(d[key] === k) delete d[key]; else d[key] = k; try{ localStorage.setItem(PS(n), JSON.stringify(d)); }catch(e){} pinAt[n] = Date.now(); server('saveBestiaryPins', [n, d]); return d[key] === k; }
  function count(n){ return Object.keys(local(n)).filter(k => BY[k]).length; }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
  function card(c, f, pinned){
    const soon = c.round > NOW, got = !!f;
    return '<div class="sb-card' + (got ? '' : soon ? ' soon locked' : ' locked') + (pinned ? ' pinned' : '') + '" style="--c:' + c.col + '" data-k="' + c.k + '">' + (got ? '<span class="sb-n">×' + f[0] + '</span><button class="sb-pin" data-pin="' + c.k + '" title="' + (pinned ? 'Pinned — tap to unpin' : 'Pin as my favourite for this move') + '">' + (pinned ? '⭐' : '☆') + '</button>' : '') +
      '<div class="sb-ic"><span>' + c.icon + '</span></div><b>' + (got ? esc(c.name) : soon ? '🔒 Coming soon' : '❓ ' + esc(c.name)) + '</b>' + (got && c.th ? '<span class="sb-th">' + esc(c.th) + '</span>' : '') +
      '<span class="sb-move">' + MOVE[c.slot] + '</span>' +
      '<span class="sb-txt">' + (got ? '🌍 ' + esc(c.from) + '<br>' + esc(c.fact) : soon ? 'Arrives in a later round.' : 'Call it with a ' + (c.tier === 'solo' ? 'full 🔥 flame' : c.tier === 'duo' ? '🔥 full flame on 2 players' : '🔥 full flame on 3 players') + ' + a ' + MOVE[c.slot] + '.') + '</span></div>';
  }
  function open(n, o){
    o = o || {}; const found = local(n), host = document.createElement('div'); host.className = 'sb-sheet'; let pinned = pins(n);
    let tab = 'solo';
    const draw = () => {
      const got = C.filter(c => found[c.k]).length;
      host.innerHTML = '<div class="sb-book" role="dialog" aria-label="Spirit Bestiary"><div class="sb-head"><button class="sp-btn sp-secondary sp-sm" data-close>◀ ' + esc(o.back || 'Back') + '</button><h2>📖 ' + esc(o.title || 'Spirit Bestiary') + '</h2><span class="sb-count">' + got + ' / ' + C.length + ' found</span></div>' +
        '<div class="sb-tabs">' + ['solo', 'duo', 'trio'].map(t => '<button class="sb-tab' + (t === tab ? ' on' : '') + '" data-t="' + t + '">' + TIER[t] + ' · ' + C.filter(c => c.tier === t && found[c.k]).length + '/' + C.filter(c => c.tier === t).length + '</button>').join('') + '</div>' +
        '<div class="sb-body"><div class="sb-pinnote">☆ Tap the star on a creature you found to pin it as your favourite for that move — from 🔥 Intermediate it comes every time.</div><div class="sb-grid">' + list({tier: tab}).map(c => card(c, found[c.k], pinned[c.tier + ':' + c.slot] === c.k)).join('') + '</div><div class="sb-more">more ↓</div></div></div>';
      const body = host.querySelector('.sb-body'), more = host.querySelector('.sb-more'), cue = () => more.classList.toggle('off', body.scrollTop + body.clientHeight >= body.scrollHeight - 4);
      body.addEventListener('scroll', cue); setTimeout(cue, 30);
    };
    host.addEventListener('click', e => { const pb = e.target.closest('[data-pin]'); if(pb){ e.stopPropagation(); const on = pin(n, pb.dataset.pin); pinned = pins(n); try{ UISound.play(on ? 'unlock' : 'tap'); }catch(x){} const body = host.querySelector('.sb-body'), st = body ? body.scrollTop : 0; draw(); const b2 = host.querySelector('.sb-body'); if(b2) b2.scrollTop = st; if(o.onPin) o.onPin(pins(n)); return; }
      const t = e.target.closest('[data-t]'); if(t){ tab = t.dataset.t; try{ UISound.play('tap'); }catch(x){} draw(); return; }
      if(e.target.closest('[data-close]') || e.target === host){ host.remove(); if(o.onClose) o.onClose(); } });
    draw(); document.body.appendChild(host);
    load(n).then(() => { if(host.isConnected) draw(); });
    return host;
  }
  return {C, MOVE, TIER, NOW, list, get, load, add, count, open, flush, found: local, pins, pin};
})();
