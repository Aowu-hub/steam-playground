
/* ================= 💬 CALLOUTS (24t) — words during play never get in the way =================
   Aowu 2026-11-17 12:04: "C ok, also sometimes use the crowd to speak out · A and B can happen but choose better positioning, a rare encounter".
   UI.callout(text, {rank, who, side, say, stopped, sub})   → {how: 'side' | 'crowd' | 'rare' | 'tag' | 'skip', ...}
     rank  'big' (ACE · GOAL · KO · round won) · 'good' (PERFECT · SMASH · DOUBLE · COMBO) · 'small' (LOB · SLICE · plop) — guessed from the words when left out
     who   whoever did it: anything the game's `at(who)` understands (a player object, an index…) or a screen point {x, y, screen: true}
     side  team of the doer (crowd fans of that team say it) — else `side(who)` from setup
   How often: ONE word on screen at a time (a later word that contains the first replaces it, e.g. "PERFECT!" → "Sla… PERFECT!") ·
     big = always · good = at most one every 3 s · small = about 1 in 3, at most one every 5 s.
   Where (C rule): a small sticker in the nearest FREE spot by the doer — never over the play area (setup `poly` / `inside`), people / ball (setup `keep`),
     crowd fans, buttons, pads or words; nothing free → a tiny tag over the doer's head (D); no head → skipped.
     Now and then (good / big, ~1 in 4) a crowd fan of the doer's team says it in a speech bubble (needs a mounted CheerSquad with a visible fan).
     Rare big (big words ~1 in 4, or `stopped: true` at the end of a round): the big comic word, placed in the biggest clear spot (never over people / ball / buttons).
   A game opts in ONCE per match: UI.callout.setup({keep: () => [{l, t, r, b}], poly: () => [[x, y], …] (play area, screen px — or inside: (x, y) => bool), at: who => {x, y}, side: who => 0 | 1, crowd: () => canvas | null})
     (`crowd` = the canvas the fans are painted on — CheerSquad overlay games need nothing). UI.callout.setup(null) on leaving play.
   While a setup is live, `Comic.callout(text, o)` from ComicKit goes through UI.callout too (who = the setup's `me`). Off switch: window.UI_CALLOUT = false (old behaviour).
   Tests: UI.callout.LOG · UI.callout.force = 'side' | 'crowd' | 'rare' | 'tag' · UI.callout.rand = () => 0…1 · UI.callout.reset() */
(function(){
  if(!window.UI || UI.callout) return;
  const LOG = [], css = `
#ui-callouts{position:fixed;inset:0;z-index:9000;pointer-events:none;overflow:hidden}
#ui-callouts .uc{position:absolute;white-space:nowrap;font-family:'Nunito','Fredoka',sans-serif;font-weight:900;font-style:italic;paint-order:stroke fill;will-change:transform,opacity}
#ui-callouts .uc .d{color:#fff}
#ui-callouts .uc.side{color:#FFE14D;-webkit-text-stroke:1.1px #111;text-shadow:1.5px 1.5px 0 #111;font-size:clamp(14px,1.9vw,20px);background:rgba(20,20,34,.55);border-radius:12px;padding:3px 10px 4px;box-shadow:0 2px 6px rgba(0,0,0,.25);animation:ucPop 1.15s ease-out forwards}
#ui-callouts .uc.side.two{white-space:normal;width:7.4em;text-align:center;line-height:1.05}
#ui-callouts .uc.side.two .d{display:block}
#ui-callouts .uc.tag{color:#FFE14D;-webkit-text-stroke:1px #111;text-shadow:1.5px 1.5px 0 #111;font-size:clamp(12px,1.6vw,16px);animation:ucTag 1s ease-out forwards}
#ui-callouts .uc.crowd{font-style:normal;color:#16161D;background:#fff;border:2.5px solid #16161D;border-radius:14px;padding:3px 10px 4px;font-size:clamp(13px,1.7vw,18px);box-shadow:2px 3px 0 rgba(0,0,0,.3);animation:ucBub 1.5s ease-out forwards}
#ui-callouts .uc.crowd .d{color:#E0408A}
#ui-callouts .uc.crowd i{position:absolute;width:12px;height:12px;background:#fff;border:2.5px solid #16161D;border-top:0;border-left:0;transform:rotate(45deg)}
#ui-callouts .uc.crowd i.dn{bottom:-7.5px}
#ui-callouts .uc.crowd i.up{top:-7.5px;transform:rotate(225deg)}
#ui-callouts .uc.rare{color:#FFE14D;-webkit-text-stroke:2px #111;text-shadow:4px 4px 0 #111;font-size:clamp(22px,5.4vw,46px);animation:ucRare 1.2s ease-out forwards}
@keyframes ucPop{0%{transform:scale(.5) rotate(-6deg);opacity:0}14%{transform:scale(1.08) rotate(-2deg);opacity:1}26%{transform:scale(1) rotate(-2deg)}78%{opacity:1}100%{transform:translateY(-8px) rotate(-2deg);opacity:0}}
@keyframes ucTag{0%{transform:translate(-50%,-80%) scale(.6);opacity:0}15%{transform:translate(-50%,-100%) scale(1.06);opacity:1}70%{opacity:1}100%{transform:translate(-50%,-160%);opacity:0}}
@keyframes ucBub{0%{transform:scale(.3);opacity:0}12%{transform:scale(1.1);opacity:1}22%{transform:scale(1)}82%{opacity:1}100%{transform:scale(.96);opacity:0}}
@keyframes ucRare{0%{transform:scale(.25) rotate(-10deg);opacity:0}16%{transform:scale(1.12) rotate(-4deg);opacity:1}28%{transform:scale(1) rotate(-4deg)}80%{opacity:1}100%{transform:scale(1.04) rotate(-4deg);opacity:0}}`;
  let layer = null, cur = null, SET = null, last = {any: -1e9, good: -1e9, small: -1e9}, comicOrig = null;
  const now = () => performance.now(), R = () => (C.rand || Math.random)();
  function addCss(){ if(document.getElementById('ui-callout-css')) return; const s = document.createElement('style'); s.id = 'ui-callout-css'; s.textContent = css; (document.head || document.documentElement).appendChild(s); }
  function host(){ addCss(); if(!layer || !layer.isConnected){ layer = document.createElement('div'); layer.id = 'ui-callouts'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer); } return layer; }
  const esc = t => (UI.esc ? UI.esc(t) : String(t).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c])));
  function html(text){ const t = String(text), m = t.match(/^(\S*…)\s*(.*)$/); return m ? '<span class="d">' + esc(m[1]) + '</span> ' + esc(m[2]) : esc(t); }
  function guess(text){ const t = String(text).toUpperCase();
    if(/ACE|GOAL|WINNER|WIN\b|LEGEND|\bKO\b|BOSS|TRIPLE|ROUND|MATCH|COMEBACK|CHAMP|\d+\s*HITS|CASE CLOSED|FINISH/.test(t)) return 'big';
    if(/PERFECT|SMASH|DOUBLE|COMBO|COUNTER|DIVE|SAVE|GUARD|BREAK|IN A ROW|SWAP|×|!!/.test(t)) return 'good'; return 'small'; }
  const OBS_SEL = 'button,[role=button],a[href],input,select,.sp-btn,.gb,#gbar,.ui-gamebar,.pz-main,.pz-petal,.ui-stick,.stick,.joy,.sbtn,.tbtns,.tpad,.pchip,.chipcol>*,.ui-fb-btn,#ui-fb-btn,#ui-lane .ui-ban,.banner.on,.ui-toast.on';
  function seen(e){ const cs = getComputedStyle(e); if(cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; let p = e; for(let i = 0; p && i < 12; i++, p = p.parentElement){ if(p.classList && p.classList.contains('hidden')) return false; } return true; }
  function rectsOf(sel){ const W = innerWidth, H = innerHeight, out = [];
    document.querySelectorAll(sel).forEach(e => { if(e.closest('#ui-callouts')) return; const q = e.getBoundingClientRect(); if(q.width < 4 || q.height < 4 || q.right < 0 || q.bottom < 0 || q.left > W || q.top > H) return; if(q.width * q.height > W * H * 0.45 || !seen(e)) return; out.push({l: q.left, t: q.top, r: q.right, b: q.bottom}); });
    return out; }
  function words(){ const out = [], H = innerHeight, tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), rg = document.createRange();
    for(let n, i = 0; (n = tw.nextNode()) && i < 4000; i++){ if(!n.textContent.trim()) continue; const p = n.parentElement; if(!p || p.closest('#ui-callouts,script,style,.ck-layer,#bigword-host')) continue;
      rg.selectNodeContents(n); const rs = rg.getClientRects(); if(!rs.length) continue; if(!seen(p)) continue; for(const q of rs) if(q.width > 1 && q.height > 1 && q.bottom > 0 && q.top < H) out.push({l: q.left, t: q.top, r: q.right, b: q.bottom}); }
    return out; }
  function crowdCanvas(){ try { const c = SET && SET.crowd && SET.crowd(); if(c) return c; } catch(e){} return document.querySelector('canvas.cs-over'); }
  function fans(){ const out = []; try { if(!window.Cheer || !Cheer.stats) return out; const st = Cheer.stats(); if(!st || st.mounted === false) return out; const cv = crowdCanvas(); if(!cv) return out; const c = cv.getBoundingClientRect();
      (st.fans || []).forEach((f, i) => { const b = f.box; if(!b || !(f.alpha > 0.3)) return; out.push({i, team: f.team, kind: f.kind, l: c.left + b.l, t: c.top + b.t, r: c.left + b.r, b: c.top + b.b}); }); } catch(e){} return out; }
  function obstacles(extra){ let k = []; try { if(SET && SET.keep) k = SET.keep() || []; } catch(e){} return rectsOf(OBS_SEL).concat(words(), fans(), k, extra || []); }
  function hits(x, y, w, h, obs, pad, inside){
    for(const o of obs) if(x - pad < o.r && x + w + pad > o.l && y - pad < o.b && y + h + pad > o.t) return true;
    if(inside){ const pts = [[x, y], [x + w, y], [x, y + h], [x + w, y + h], [x + w / 2, y + h / 2], [x + w / 2, y], [x + w / 2, y + h]]; for(const p of pts) if(inside(p[0], p[1])) return true; }
    return false; }
  // nearest free spot to (ax, ay): rings of grid cells outward from the anchor, stop once no nearer ring can win (fast: a few ms)
  function find(w, h, ax, ay, obs, inside, pad){ const W = innerWidth, H = innerHeight, st = Math.max(6, Math.round(Math.min(W, H) / 70));
    const x0 = 6, y0 = 6, nx = Math.floor((W - 12 - w) / st), ny = Math.floor((H - 12 - h) / st); if(nx < 0 || ny < 0) return null;
    const ci = Math.max(0, Math.min(nx, Math.round((ax - w / 2 - x0) / st))), cj = Math.max(0, Math.min(ny, Math.round((ay - h / 2 - y0) / st)));
    let best = null; const K = Math.max(nx, ny) + 1;
    const test = (i, j) => { if(i < 0 || j < 0 || i > nx || j > ny) return; const x = x0 + i * st, y = y0 + j * st; const d = Math.hypot(x + w / 2 - ax, y + h / 2 - ay); if(best && d >= best.d) return; if(hits(x, y, w, h, obs, pad, inside)) return; best = {x, y, d}; };
    for(let k = 0; k <= K; k++){ if(best && (k - 1) * st > best.d) break;
      if(k === 0){ test(ci, cj); continue; }
      for(let i = ci - k; i <= ci + k; i++){ test(i, cj - k); test(i, cj + k); }
      for(let j = cj - k + 1; j <= cj + k - 1; j++){ test(ci - k, j); test(ci + k, j); } }
    return best; }
  // the play area as a polygon (setup.poly() → [[x, y], …] in screen px, read once per word) or setup.inside(x, y)
  function insideFn(){ if(!SET) return null; try { if(SET.poly){ const P = SET.poly(); if(!P || P.length < 3) return null; return (x, y) => { let ins = false; for(let i = 0, j = P.length - 1; i < P.length; j = i++){ const a = P[i], b = P[j]; if(((a[1] > y) !== (b[1] > y)) && (x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) ins = !ins; } return ins; }; } return SET.inside || null; } catch(e){ return null; } }
  function point(who){ if(who && typeof who.x === 'number' && typeof who.y === 'number' && who.screen) return who; try { if(SET && SET.at){ const p = SET.at(who); if(p) return p; } } catch(e){} return null; }
  function sideOf(who, o){ if(o.side != null) return o.side; try { if(SET && SET.side) return SET.side(who); } catch(e){} return null; }
  function clear(){ if(cur && cur.el && cur.el.isConnected) cur.el.remove(); cur = null; }
  function measure(el){ el.style.left = '-9999px'; el.style.top = '0'; el.style.animation = 'none'; host().appendChild(el); const q = el.getBoundingClientRect(); el.style.animation = ''; return {w: Math.ceil(q.width), h: Math.ceil(q.height)}; }   /* the pop animation starts at scale .5 — measure without it */
  function mk(cls, text){ const d = document.createElement('div'); d.className = 'uc ' + cls; d.innerHTML = html(text); return d; }
  function show(el, ms, rec){ cur = Object.assign({el, t: now(), until: now() + ms}, rec); setTimeout(() => { if(el.isConnected) el.remove(); if(cur && cur.el === el) cur = null; }, ms); LOG.push(Object.assign({t: Math.round(now())}, rec)); if(LOG.length > 80) LOG.shift(); return rec; }
  function speak(text){ try { if(!window.speechSynthesis || (window.UISound && UISound.isOn && !UISound.isOn())) return; const u = new SpeechSynthesisUtterance(String(text).replace(/…/g, ', ')); u.rate = 1.05; speechSynthesis.speak(u); } catch(e){} }
  function placeSide(text, a, inside){ const el = mk('side', text); let s = measure(el), obs = obstacles(), f = find(s.w, s.h, a.x, a.y, obs, inside, 6);
    if(!f){ el.classList.add('two'); s = measure(el); f = find(s.w, s.h, a.x, a.y, obs, inside, 5); }
    if(!f){ el.remove(); return null; } el.style.left = f.x + 'px'; el.style.top = f.y + 'px'; return {el, x: f.x, y: f.y, w: s.w, h: s.h}; }
  function placeTag(text, a){ const el = mk('tag', text); host().appendChild(el); el.style.left = Math.round(a.x) + 'px'; el.style.top = Math.round(a.y - 4) + 'px'; const s = el.getBoundingClientRect(); return {el, x: Math.round(a.x), y: Math.round(a.y), w: Math.round(s.width), h: Math.round(s.height)}; }
  function placeCrowd(text, side){ const F = fans().filter(f => side == null || f.team === side || f.team < 0); if(!F.length) return null;
    const pick = F[Math.floor(R() * F.length) % F.length], el = mk('crowd', text), s = measure(el), cx = (pick.l + pick.r) / 2, obs = obstacles().filter(o => !(o.l === pick.l && o.t === pick.t));
    const inside = insideFn();
    // the bubble sits above (or below) its fan, as close as a free spot allows
    let f = find(s.w, s.h, cx, pick.t - s.h / 2 - 10, obs, inside, 4); if(!f || Math.hypot(f.x + s.w / 2 - cx, f.y + s.h / 2 - pick.t) > Math.max(140, s.w)){ el.remove(); return null; }
    const tail = document.createElement('i'), below = f.y > pick.t; tail.className = below ? 'up' : 'dn'; tail.style.left = Math.max(8, Math.min(s.w - 22, cx - f.x - 7)) + 'px'; el.appendChild(tail);
    el.style.left = f.x + 'px'; el.style.top = f.y + 'px'; el.style.transformOrigin = (cx - f.x) + 'px ' + (below ? 0 : s.h) + 'px';
    return {el, x: f.x, y: f.y, w: s.w, h: s.h, fan: pick.i}; }
  function placeRare(text, a){ const el = mk('rare', text), s = measure(el), obs = obstacles(); const inside = insideFn();
    const W = innerWidth, H = innerHeight, ax = a ? (a.x + W / 2) / 2 : W / 2, ay = a ? Math.min(a.y, H * 0.4) : H * 0.35;
    const f = find(s.w, s.h, ax, ay, obs, inside, 8) || find(s.w, s.h, ax, ay, obs, null, 8);   /* off the play area first, else over a clear part of it (never people / ball / buttons) */
    if(!f){ el.remove(); return null; } el.style.left = f.x + 'px'; el.style.top = f.y + 'px'; return {el, x: f.x, y: f.y, w: s.w, h: s.h}; }

  function C(text, o){
    o = o || {}; if(!text) return {how: 'skip', why: 'empty'}; if(!document.body) return {how: 'skip', why: 'no body'};
    const rank = o.rank || guess(text), t = now(), T = String(text);
    // ONE word at a time: a later word that contains the one on screen replaces it ("PERFECT!" → "Sla… PERFECT!")
    if(cur && cur.el && cur.el.isConnected && t < cur.until){
      const a = cur.text.replace(/[^A-Z0-9]/gi, '').toUpperCase(), b = T.replace(/[^A-Z0-9]/gi, '').toUpperCase(), RK = {small: 0, good: 1, big: 2};
      if(t - cur.t < 450 && a && b.indexOf(a) >= 0){ const was = cur; clear(); last[was.rank] = was.prevT; last.any = was.prevAny; }
      else if(RK[rank] > RK[cur.rank]) clear();
      else { LOG.push({t: Math.round(t), text: T, rank, how: 'skip', why: 'busy'}); return {how: 'skip', why: 'busy'}; } }
    if(!o.always){
      if(rank === 'good' && t - Math.max(last.good, last.small) < 3000){ LOG.push({t: Math.round(t), text: T, rank, how: 'skip', why: 'cool'}); return {how: 'skip', why: 'cool'}; }
      if(rank === 'small' && (t - last.any < 5000 || R() >= 1 / 3)){ LOG.push({t: Math.round(t), text: T, rank, how: 'skip', why: 'quiet'}); return {how: 'skip', why: 'quiet'}; } }
    const who = o.who != null ? o.who : (SET ? SET.me : null), a = point(who), side = sideOf(who, o); const inside = insideFn();
    const force = C.force, rec = {text: T, rank, prevT: last[rank], prevAny: last.any};
    let res = null, how = '';
    const tryRare = force === 'rare' || (!force && rank === 'big' && (o.stopped || R() < 0.25));
    const tryCrowd = force === 'crowd' || (!force && rank !== 'small' && R() < 0.25);
    if(tryRare){ res = placeRare(T, a); how = 'rare'; }
    if(!res && tryCrowd){ res = placeCrowd(T, side); how = 'crowd'; }
    if(!res && force !== 'tag' && a){ res = placeSide(T, a, inside); how = 'side'; }
    if(!res && !a && force !== 'tag'){ const W = innerWidth, H = innerHeight; res = placeSide(T, {x: W / 2, y: H * 0.2}, inside); how = 'side'; }
    if(!res && a){ res = placeTag(T, a); how = 'tag'; }
    if(!res){ LOG.push({t: Math.round(t), text: T, rank, how: 'skip', why: 'no room'}); return {how: 'skip', why: 'no room'}; }
    last[rank] = t; last.any = t; if(o.say) speak(T);
    const ms = how === 'crowd' ? 1500 : how === 'rare' ? 1200 : how === 'tag' ? 1000 : 1150;
    return show(res.el, ms, Object.assign(rec, {how, x: res.x, y: res.y, w: res.w, h: res.h, fan: res.fan}));
  }
  function wrapComic(){ if(!window.Comic || typeof Comic.callout !== 'function' || Comic.callout.__uc) return; comicOrig = Comic.callout;
    const w = function(text, o){ if(window.UI_CALLOUT === false || !SET) return comicOrig.apply(this, arguments); o = o || {}; return C(text, {who: SET.me != null ? SET.me : null, say: o.say !== false && !o.small, from: 'comic'}); };
    w.__uc = true; Comic.callout = w; }
  C.setup = function(s){ SET = s || null; clear(); if(SET){ wrapComic(); try { const el = mk('side', 'Sla… WARM'); measure(el); el.remove(); } catch(e){} } return SET; };   /* warm: CSS + layer + font once, so the first word costs no extra frame */
  C.active = () => !!SET && window.UI_CALLOUT !== false;
  C.clear = clear; C.guess = guess; C.LOG = LOG; C.force = null; C.rand = null;
  C.reset = () => { last = {any: -1e9, good: -1e9, small: -1e9}; clear(); LOG.length = 0; };
  C.find = (w, h, ax, ay, extra) => { const inside = insideFn(); return find(w, h, ax, ay, obstacles(extra), inside, 6); };
  C.obstacles = obstacles; C.fans = fans; C.current = () => SET;
  UI.callout = C;
})();
/* ================= 💬 CALLOUTS (24t) END ================= */
/* ================= 🫥 SEE-THROUGH PADS (an-3, ✨ polish chat 2026-11-18) =================
   Aowu 19:13 (BlasOff + Brawl iPhone photos): "button + joystick transparent as same as Brawl and apply to all game with full screen
   like this". On a phone, every stick / button ring that sits ON the play picture (a canvas under its middle) is see-through
   (62 %) and goes solid (95 %) while a thumb is on it — the 🥊 Brawl 24z look, for every game, with no game edit.
   Pads beside the play area (side columns) stay solid; a pad whose parent is already see-through (Brawl's own .ctl) is left alone.
   Off: window.UI_SEEPADS = false. Test hooks: UI.seePads.scan() → the groups marked · UI.seePads.isPhone(). */
(function(){
  window.UI = window.UI || {};
  const GROUP = '.pz-fan, .pz-petals, .pads .stick, .tpad, .joy:not(.hidden), .pz-stick, .pad, .actpad, .btnpad, .shotpad';
  const css = () => { if(document.getElementById('ui-seepads')) return; const st = document.createElement('style'); st.id = 'ui-seepads';
    st.textContent = '.pz-see{opacity:.62 !important;transition:opacity .15s;}.pz-see.pz-touch{opacity:.95 !important;}'; document.head.appendChild(st); };
  function isPhone(){ if(window.UI_GBPHONE != null) return !!window.UI_GBPHONE;
    let touch = false; try{ touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0; }catch(e){}
    return touch && Math.min(innerWidth, innerHeight) < 600; }
  const vis = e => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
  function groups(){
    const out = new Set();
    document.querySelectorAll(GROUP).forEach(e => { if(vis(e) && !e.parentElement.closest(GROUP)) out.add(e); });
    document.querySelectorAll('.pz-btn').forEach(b => { if(!vis(b) || b.closest(GROUP)) return; const p = b.parentElement; if(p && p !== document.body) out.add(p); });
    return [...out];
  }
  function dimmed(e){ for(let a = e.parentElement; a && a !== document.body; a = a.parentElement){ if(+getComputedStyle(a).opacity < .99) return true; } return false; }
  function overPicture(e){
    const b = e.getBoundingClientRect(); if(b.width < 20 || b.height < 20) return false;
    const pts = [[.5, .5], [.3, .3], [.7, .7]];
    return pts.some(([u, v]) => { const x = b.left + b.width * u, y = b.top + b.height * v; if(x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return false;
      const st = document.elementsFromPoint(x, y).filter(t => !e.contains(t) && !t.closest('.pz-see') && t !== e); const c = st.slice(0, 4).find(t => t.tagName === 'CANVAS');
      return !!(c && c.getBoundingClientRect().width > innerWidth * .4); });
  }
  let marked = [];
  function scan(){
    if(window.UI_SEEPADS === false){ marked.forEach(e => e.classList.remove('pz-see', 'pz-touch')); marked = []; return []; }
    const phone = isPhone(), now = [];
    if(phone){ css(); groups().forEach(g => { if(!dimmed(g) && overPicture(g)) now.push(g); }); }
    marked.forEach(e => { if(now.indexOf(e) < 0) e.classList.remove('pz-see', 'pz-touch'); });
    now.forEach(e => e.classList.add('pz-see'));
    marked = now; return now;
  }
  // 👆 solid while a thumb is on it (also a stick that follows the thumb out of its box: anything within 70 px of the press)
  const held = new Map();
  function near(g, x, y){ const b = g.getBoundingClientRect(), m = 70; return x > b.left - m && x < b.right + m && y > b.top - m && y < b.bottom + m; }
  addEventListener('pointerdown', ev => { if(!marked.length) return; const hit = marked.filter(g => g.contains(ev.target) || near(g, ev.clientX, ev.clientY));
    const g = hit.find(q => q.contains(ev.target)) || hit[0]; if(!g) return; g.classList.add('pz-touch'); held.set(ev.pointerId, g); }, true);
  const up = ev => { const g = held.get(ev.pointerId); if(!g) return; held.delete(ev.pointerId); if(![...held.values()].includes(g)) g.classList.remove('pz-touch'); };
  ['pointerup', 'pointercancel'].forEach(t => addEventListener(t, up, true));
  let timer = 0;
  function tick(){ try{ scan(); }catch(e){} }
  function start(){ if(timer) return; timer = setInterval(() => { if(!document.hidden && (marked.length || document.querySelector('.pz-btn, ' + GROUP))) tick(); }, 600); }
  addEventListener('resize', () => setTimeout(tick, 120)); addEventListener('orientationchange', () => setTimeout(tick, 300));
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  UI.seePads = {scan: scan, isPhone: isPhone, marked: () => marked.slice()};
})();
/* ================= 🫥 SEE-THROUGH PADS (an-3) END ================= */
/* ================= 🎧 VOICE PACK (vp-3, ✨ polish chat 2026-11-18) =================
   Recorded natural-voice clips (Google Neural2, made once by steam-source tools/voices + workflow voices.yml) on the site:
   aowu-hub.github.io/steam-voices/<us|gb|au>/<id>.mp3 + manifest.json (own repo aowu-hub/steam-voices) (spoken text key → clip id).
   UI.voicePack.load() → Promise(ready) · .ready() · .has(text) · .play(text, {rate}) → Promise(true = played | false = use the device voice)
   · .stop() · .accent() ('us'|'gb'|'au' from the 🗣️ accent pick, Auto = the device's language, else gb) · .off(bool) · .log
   A phrase it has no clip for = its words one by one (every word must have a clip), else false → the page speaks with speechSynthesis as before.
   Used only while the player's 🎙️ voice pick is ⭐ Best (a picked device voice / 📱 Phone voice wins). ONE shared <audio> (iPhone unlocks it on the first tap).
   🎧 vp-4: clips play through Web Audio (UISound's unlocked context): fetched + decoded ahead (.prefetch(texts)), the baked-in silence trimmed,
   one buffer source per clip (no file swaps on one element). No running context / a failed decode = the <audio> path above, as before. */
(function(){
  window.UI = window.UI || {};
  const BASES = ['https://aowu-hub.github.io/steam-voices/', 'https://cdn.jsdelivr.net/gh/Aowu-hub/steam-voices@main/'];   // own site (vp-3b: kept off steam-playground's 50 MB budget)
  const ACC = {'en-US': 'us', 'en-GB': 'gb', 'en-AU': 'au'};
  const norm = t => String(t || '').toLowerCase().replace(/[’]/g, "'").replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  let mf = null, base = '', loading = null, el = null, token = 0, OFF = false, unlocked = false;
  const log = [];
  function accent(){
    let a = ''; try{ a = (window.UISound && UISound.music && UISound.music.get().acc) || ''; }catch(e){}
    if(ACC[a]) return ACC[a];
    const n = String(navigator.language || '').toLowerCase(); return /-us\b/.test(n) ? 'us' : /-au\b/.test(n) ? 'au' : 'gb';
  }
  function load(){
    if(mf) return Promise.resolve(true); if(loading) return loading;
    if(window.UI_VOICEPACK === false) return Promise.resolve(false);
    if(navigator.webdriver && !window.UI_VOICEPACK_BASES) return Promise.resolve(false);   // test browsers: only when a test gives its own bases
    const bases = window.UI_VOICEPACK_BASES || BASES;
    loading = (async () => { for(const b of bases){ try{ const r = await fetch(b + 'manifest.json', {cache: 'no-cache'}); if(!r.ok) continue; const j = await r.json(); if(j && j.accents){ mf = j; base = b; return true; } }catch(e){} } return false; })();
    return loading;
  }
  function picked(){ try{ return typeof spPicked === 'function' ? spPicked() : ''; }catch(e){ return ''; } }
  function usable(){ return !!(mf && !OFF && !picked() && mf.accents[accent()]); }
  function urls(text){
    if(!usable()) return null; const A = mf.accents[accent()], key = norm(text); if(!key) return null;
    if(A.files[key]) return [A.files[key]];
    const ws = key.split(' '); if(ws.every(w => A.files[w])) return ws.map(w => A.files[w]);
    return null;
  }
  function audio(){ if(!el){ el = new Audio(); el.preload = 'auto'; try{ el.setAttribute('playsinline', ''); }catch(e){} } return el; }
  // iPhone: an <audio> may only start after a tap — wake our one element inside the first tap (silent), later plays are allowed
  function unlock(){ if(unlocked) return; unlocked = true; try{ if(navigator.audioSession) navigator.audioSession.type = 'playback'; }catch(e){}
    try{ const a = audio(), SIL = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='; if(a.src && !/^data:/.test(a.src)) return;   // a clip already started inside this tap = unlocked
      a.muted = true; a.src = SIL; const p = a.play(), back = () => { try{ if(a.src === SIL){ a.pause(); a.muted = false; } }catch(e){} }; if(p && p.then) p.then(back, back); else setTimeout(back, 60); }catch(e){}   // never pauses a real clip
    ['touchend', 'click', 'keydown'].forEach(t => document.removeEventListener(t, unlock, true)); }
  ['touchend', 'click', 'keydown'].forEach(t => document.addEventListener(t, unlock, true));
  /* 🎧 vp-4: Web Audio clips — bytes cached per accent/id, decoded clips kept (newest 48), silence trimmed from the samples */
  const BYTES = new Map(), DEC = new Map(), DEC_MAX = 48, WA = []; let CUR = null;
  function wctx(){ try{ const c = window.UISound && UISound.ctx && UISound.ctx(); return c && c.state === 'running' && c.createBufferSource && c.decodeAudioData ? c : null; }catch(e){ return null; } }
  function bytes(k){ if(!BYTES.has(k)) BYTES.set(k, fetch(base + k + '.mp3').then(r => r.ok ? r.arrayBuffer() : null).catch(() => null).then(ab => { if(!ab) BYTES.delete(k); return ab; })); return BYTES.get(k); }
  function trim(b){ const d = b.getChannelData(0), n = d.length; let pk = 0; for(let i = 0; i < n; i++){ const v = d[i] < 0 ? -d[i] : d[i]; if(v > pk) pk = v; }
    const th = Math.max(0.003, pk * 0.025); let a = 0, z = n - 1; while(a < n && Math.abs(d[a]) < th) a++; while(z > a && Math.abs(d[z]) < th) z--;
    const sr = b.sampleRate, t0 = Math.max(0, a / sr - 0.025), t1 = Math.min(b.duration, z / sr + 0.07); return {buf: b, t0, len: Math.max(0.05, t1 - t0)}; }
  function decoded(id){
    const c = wctx(); if(!c || !base) return Promise.resolve(null); const k = accent() + '/' + id;
    if(DEC.has(k)){ const v = DEC.get(k); DEC.delete(k); DEC.set(k, v); return v; }
    const p = bytes(k).then(ab => ab ? new Promise(res => { let ok = false; const f = b => { ok = true; res(b ? trim(b) : null); };
      try{ const q = c.decodeAudioData(ab.slice(0), f, () => f(null)); if(q && q.catch) q.catch(() => { if(!ok) f(null); }); }catch(e){ f(null); } }) : null);
    DEC.set(k, p); while(DEC.size > DEC_MAX) DEC.delete(DEC.keys().next().value);
    p.then(v => { if(!v && DEC.get(k) === p) DEC.delete(k); });
    return p;
  }
  function prefetch(texts){ if(!usable() || !wctx()) return 0; let n = 0; [].concat(texts || []).forEach(t => { const l = urls(t); if(l) l.forEach(id => { decoded(id); n++; }); }); return n; }
  function clipWA(id, my){   // true = played · false = stopped · null = Web Audio can't → the <audio> path
    return decoded(id).then(D => new Promise(res => {
      if(my !== token){ res(false); return; } const c = wctx(); if(!D || !c){ res(null); return; }
      let done = false, s = null; const fin = ok => { if(done) return; done = true; clearTimeout(tm); if(CUR && CUR.s === s) CUR = null; res(ok); };
      const tm = setTimeout(() => fin(true), D.len * 1000 + 400);
      try{ s = c.createBufferSource(); s.buffer = D.buf; s.connect(c.destination); s.onended = () => fin(true); s.start(0, D.t0, D.len); }catch(e){ clearTimeout(tm); done = true; res(null); return; }
      CUR = {s, fin}; WA.push(id); if(WA.length > 200) WA.splice(0, 100);
    }));
  }
  function clip(id, rate, my){
    return new Promise(res => {
      if(my !== token){ res(false); return; }
      const a = audio(); let done = false; const fin = ok => { if(done) return; done = true; a.onended = a.onerror = null; clearTimeout(tm); res(ok); };
      const tm = setTimeout(() => fin(false), 8000);
      a.onended = () => fin(true); a.onerror = () => fin(false);
      try{ a.src = base + accent() + '/' + id + '.mp3'; a.muted = false; a.playbackRate = Math.max(0.7, Math.min(1.2, (rate || 0.9) / 0.9)); try{ a.preservesPitch = true; a.webkitPreservesPitch = true; }catch(e){}
        const p = a.play(); if(p && p.catch) p.catch(() => fin(false)); }catch(e){ fin(false); }
    });
  }
  async function play(text, o){
    const list = urls(text); if(!list) return null;   // null = not ours → the page speaks as before
    const my = ++token; log.push(text); if(log.length > 300) log.splice(0, 100);
    prefetch(text);   // 🎧 vp-4: every word of a phrase decodes at once
    for(let i = 0; i < list.length; i++){ let ok = await clipWA(list[i], my); if(ok === null) ok = await clip(list[i], (o || {}).rate, my);   // 🎧 vp-4: Web Audio first, the <audio> element if it can't
      if(!ok) return my === token && i === 0 ? false : true; if(i < list.length - 1) await new Promise(r => setTimeout(r, 70)); }
    return true;
  }
  function stop(){ token++; try{ if(el){ el.pause(); } }catch(e){} try{ if(CUR){ const c = CUR; CUR = null; try{ c.s.stop(); }catch(e){} c.fin(false); } }catch(e){} }   // 🎧 vp-4: the Web Audio clip too
  UI.voicePack = {load, ready: () => usable(), hasAccent: a => !!(mf && mf.accents[ACC[a] || a]), loaded: () => !!mf, has: t => !!urls(t), play: (t, o) => play(t, o), stop, accent, log, prefetch, webAudio: () => !!wctx(), waLog: WA,   // 🎧 vp-4
    off(v){ OFF = !!v; }, voice: () => (mf && mf.accents[accent()] || {}).voice || '', _reset(){ mf = null; loading = null; base = ''; }};
})();
/* ================= 🎧 VOICE PACK (vp-3) END ================= */
/* ================= 🗣️ VOICE PICKER + GUIDE (an-4, ✨ polish chat 2026-11-18 · an-6 voice list) =================
   an-6 (Aowu 20:51 "I got Kate / Serena · Ava / Joelle · Karen / Matilda Enhanced but it chose something else"): under the accent, a 🎙️ Voice row
   lists THIS device's voices for that country (⭐ Best = auto · each voice with ✨ Enhanced / 💎 Premium; joke voices like Albert hidden);
   tap = that player's voice on this device (SPVoice.choose, localStorage sp_voice_pick:<Name> per accent — voices live on the device)
   + a short sample. iPhone names have no "(Enhanced)" — the label comes from the voice id. No Enhanced voice listed → tip: close Safari fully.
   Aowu 20:14: "please add accent picker and a guide to how to download in the app for each mobile type" (iPhone voice list photos).
   UI.voicePicker(box) = 🗣️ Reading voice: Auto · 🇺🇸 US · 🇬🇧 UK · 🇦🇺 Australia (per player, saved with the music record {acc},
   follows the player to every device) + "🔊 Using: <voice>" + ▶ Try + "📥 How to get a better voice" → UI.voiceGuide() = steps for
   iPhone / iPad · Android · Windows · Mac (this device first) with the voice to download for each accent.
   UiKit core SPVoice reads the accent (UISound.music.get().acc) and prefers that country's voice, then Enhanced / Premium / Natural ones.
   UI.voiceAccent() → '' | 'en-US' | 'en-GB' | 'en-AU' (for speech recognition: rec.lang = UI.voiceAccent() || 'en-US'). */
(function(){
  window.UI = window.UI || {};
  const ACC = [['', 'Auto', '🌐'], ['en-US', 'US', '🇺🇸'], ['en-GB', 'UK', '🇬🇧'], ['en-AU', 'Australia', '🇦🇺']];
  const norm = l => String(l || '').replace('_', '-').toLowerCase();
  const voicesFor = a => { try{ return (speechSynthesis.getVoices() || []).filter(v => norm(v.lang).indexOf(a.toLowerCase()) === 0); }catch(e){ return []; } };
  const accentNow = () => { try{ return (UISound.music.get() || {}).acc || ''; }catch(e){ return ''; } };
  UI.voiceAccent = accentNow;
  function device(){ const u = navigator.userAgent || ''; if(/iPhone|iPod/.test(u)) return 'iphone'; if(/iPad/.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1)) return 'iphone';
    if(/Android/.test(u)) return 'android'; if(/Windows/.test(u)) return 'windows'; if(/Macintosh|Mac OS/.test(u)) return 'mac'; return 'android'; }
  function css(){ if(document.getElementById('ui-vp-css')) return; const st = document.createElement('style'); st.id = 'ui-vp-css';
    st.textContent = '.ui-vp{display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-radius:16px;background:var(--card,#fff);color:var(--ink,#2B2440);box-shadow:0 2px 0 rgba(0,0,0,.12);max-width:560px;margin:8px auto;font-family:Nunito,sans-serif;}'
      + '.ui-vp-h{font-family:Fredoka,sans-serif;font-weight:700;font-size:1.05rem;}'
      + '.ui-vp-row{display:flex;flex-wrap:wrap;gap:6px;}'
      + '.ui-vp-row button{min-height:44px;padding:0 12px;border-radius:999px;border:2px solid rgba(124,92,255,.35);background:#F4F1FA;color:#2B2440;font-weight:800;font-size:.95rem;cursor:pointer;display:flex;align-items:center;gap:5px;}'
      + '.ui-vp-row button.on{background:linear-gradient(135deg,#7C5CFF,#FF5DA2);color:#fff;border-color:transparent;}'
      + '.ui-vp-row button .ok{font-size:.75rem;opacity:.85;}'
      + '.ui-vp-now{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-weight:700;font-size:.92rem;}'
      + '.ui-vp-now .w{flex:1 1 180px;min-width:0;}'
      + '.ui-vp button.sm{min-height:40px;padding:0 12px;border-radius:12px;border:0;background:#EDE7FF;color:#4A3AA8;font-weight:800;cursor:pointer;}'
      + '.ui-vp .warn{color:#B4441E;font-weight:800;font-size:.88rem;}'
      + '.ui-vp-vh{font-weight:800;font-size:.85rem;opacity:.75;margin-top:2px;}'
      + '.ui-vp-vs button{min-height:40px;font-size:.88rem;border-width:2px;}'
      + '.ui-vp-vs button .q{font-size:.72rem;font-weight:800;padding:1px 6px;border-radius:999px;background:rgba(124,92,255,.14);}'
      + '.ui-vp-vs button.on .q{background:rgba(255,255,255,.25);}'
      + '.ui-vp .tipv{background:#FFF6DD;color:#6A4A00;border-radius:12px;padding:6px 10px;font-size:.84rem;font-weight:700;}'
      + '.ui-vg{position:fixed;inset:0;z-index:9990;background:rgba(20,16,40,.55);display:flex;align-items:center;justify-content:center;padding:12px;}'
      + '.ui-vg-in{background:#fff;color:#2B2440;border-radius:20px;max-width:620px;width:100%;max-height:calc(100% - 24px);overflow:auto;padding:14px 16px 16px;font-family:Nunito,sans-serif;box-shadow:0 18px 50px rgba(0,0,0,.35);}'
      + '.ui-vg-in h3{margin:0 0 4px;font-family:Fredoka,sans-serif;font-size:1.25rem;display:flex;align-items:center;gap:8px;}'
      + '.ui-vg-in h3 button{margin-left:auto;min-width:44px;min-height:44px;border:0;border-radius:50%;background:#F4F1FA;font-size:1.1rem;cursor:pointer;}'
      + '.ui-vg-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0;}'
      + '.ui-vg-tabs button{min-height:40px;padding:0 12px;border-radius:999px;border:0;background:#F4F1FA;font-weight:800;cursor:pointer;color:#2B2440;}'
      + '.ui-vg-tabs button.on{background:#2B2440;color:#fff;}'
      + '.ui-vg ol{margin:6px 0 10px;padding-left:1.4em;line-height:1.45;} .ui-vg li{margin:3px 0;}'
      + '.ui-vg .path{display:inline-block;background:#F4F1FA;border-radius:8px;padding:1px 6px;font-weight:800;}'
      + '.ui-vg table{border-collapse:collapse;width:100%;font-size:.92rem;margin:4px 0 8px;} .ui-vg td,.ui-vg th{border-bottom:1px solid #EEE;padding:6px 4px;text-align:left;vertical-align:top;}'
      + '.ui-vg .tip{background:#FFF6DD;border-radius:12px;padding:8px 10px;font-size:.88rem;margin-top:6px;}';
    document.head.appendChild(st); }
  // 📥 what to download, by device (Aowu's iPhone list 2026-11-18: Kate (Enhanced) already on his phone)
  const GUIDE = {
    iphone: {name: '📱 iPhone / iPad', steps: ['iPhone and iPad let a web page use <b>only the voices that come built in</b>. Voices you download in <span class="path">Settings → Accessibility → Read &amp; Speak → Voices</span> (Enhanced or basic) never reach Safari or the home-screen app — that is an Apple limit, not the game',
        'Here in the game: pick the country (🇺🇸 · 🇬🇧 · 🇦🇺), then a voice under 🎙️ Voice — tap ▶ Try to hear it',
        '🎛️ <b>Classic</b> voices (Flo · Sandy · Shelley · Grandma · Eddy · Reed …) are built in too — older sound, but women’s voices for every country',
        '📱 <b>Phone voice</b> lets the iPhone read with its own voice for that country — try it, on some iPhones it sounds nicer',
        'For the natural Enhanced voices: play on a computer — Microsoft Edge (Windows) or Chrome bring natural online voices'],
      rec: [['🇺🇸 US', 'Samantha', '🎛️ Flo · Shelley'], ['🇬🇧 UK', 'Daniel', '🎛️ Flo · Sandy'], ['🇦🇺 Australia', 'Karen', '🎛️ Shelley · Sandy']],
      tip: 'Apple has an open bug report for this (WebKit 290497). If Apple fixes it, your downloaded Enhanced voices (Kate, Ava, Matilda …) will show up here by themselves — the game already picks them first.'},
    android: {name: '🤖 Android', steps: ['Open <span class="path">Settings</span> and search <span class="path">Text-to-speech</span>', 'Preferred engine: <span class="path">Speech Services by Google</span> → tap ⚙️',
        'Tap <span class="path">Install voice data</span> → <span class="path">English (United States)</span> / <span class="path">English (United Kingdom)</span> / <span class="path">English (Australia)</span>', 'Pick a voice (play ▶ to listen) and tap ⬇️ to download', 'Close the game and open it again'],
      rec: [['🇺🇸 US', 'a woman’s voice you like (Voice I or III)', '—'], ['🇬🇧 UK', 'a woman’s voice (Voice I or III)', '—'], ['🇦🇺 Australia', 'a woman’s voice (Voice I or III)', '—']],
      tip: 'Samsung: <span class="path">Settings → General management → Text-to-speech</span> → choose <b>Speech Services by Google</b> first.'},
    windows: {name: '💻 Windows PC', steps: ['Easiest: open the game in <b>Microsoft Edge</b> — it brings natural online voices with no download', 'Or: <span class="path">Settings → Time &amp; language → Speech → Manage voices → Add voices</span>',
        'Add <span class="path">English (United Kingdom)</span> / <span class="path">English (Australia)</span> / <span class="path">English (United States)</span>', 'Close the game and open it again'],
      rec: [['🇺🇸 US', 'Edge: Aria / Jenny (Natural)', 'Windows: Zira'], ['🇬🇧 UK', 'Edge: Sonia / Libby (Natural)', 'Windows: Hazel'], ['🇦🇺 Australia', 'Edge: Natasha (Natural)', 'Windows: Catherine']],
      tip: 'Chrome on a PC also has online voices: <b>Google US English</b> and <b>Google UK English Female</b>.'},
    mac: {name: '🖥️ Mac', steps: ['<span class="path">System Settings → Accessibility → Spoken Content</span>', '<span class="path">System voice → Manage Voices…</span> → <span class="path">English</span>', 'Tick the voice below for each country and wait for the download', 'Close the game and open it again'],
      rec: [['🇺🇸 US', 'Ava (Enhanced)', 'Samantha (Enhanced)'], ['🇬🇧 UK', 'Kate (Enhanced)', 'Serena (Enhanced)'], ['🇦🇺 Australia', 'Karen (Enhanced)', 'Matilda (Enhanced)']],
      tip: 'Safari on a Mac shows only the built-in voices too (Apple limit). <b>Chrome</b> or <b>Edge</b> on the Mac add natural online voices.'}
  };
  function guide(which){
    css(); const old = document.querySelector('.ui-vg'); if(old) old.remove();
    const el = document.createElement('div'); el.className = 'ui-vg'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'How to get a better voice');
    const order = [device()].concat(['iphone', 'android', 'windows', 'mac'].filter(k => k !== device()));
    let cur = which || order[0];
    function paint(){
      const G = GUIDE[cur];
      el.innerHTML = '<div class="ui-vg-in"><h3>📥 Get a better reading voice<button type="button" data-sound="tap" aria-label="Close">✕</button></h3>'
        + '<div style="font-size:.9rem">Voices live on the device — download one once, every game uses it.</div>'
        + '<div class="ui-vg-tabs">' + order.map(k => '<button type="button" data-k="' + k + '" class="' + (k === cur ? 'on' : '') + '">' + GUIDE[k].name + (k === device() ? ' · this one' : '') + '</button>').join('') + '</div>'
        + '<ol>' + G.steps.map(s => '<li>' + s + '</li>').join('') + '</ol>'
        + '<table><tr><th>Accent</th><th>⭐ Best</th><th>Lighter</th></tr>' + G.rec.map(r => '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('') + '</table>'
        + '<div class="tip">💡 ' + G.tip + '</div></div><span class="ui-modal on" style="display:none!important"></span>';
      el.querySelector('h3 button').onclick = close;
      el.querySelectorAll('.ui-vg-tabs button').forEach(b => b.onclick = () => { cur = b.dataset.k; paint(); });
    }
    function close(){ el.remove(); }
    el.addEventListener('click', e => { if(e.target === el) close(); });
    paint(); document.body.appendChild(el); return {el: el, close: close};
  }
  UI.voiceGuide = guide;
  function picker(box){
    if(!box) return null; css();
    box.innerHTML = '<div class="ui-vp"><div class="ui-vp-h">🗣️ Reading voice</div><div class="ui-vp-row ui-vp-acc"></div><div class="ui-vp-vh" hidden>🎙️ Voice</div><div class="ui-vp-row ui-vp-vs" hidden></div><div class="tipv" hidden></div><div class="ui-vp-now"><span class="w"></span><button type="button" class="sm try" data-sound="tap">▶ Try</button></div>'
      + '<div class="warn" hidden></div><div><button type="button" class="sm how" data-sound="tap">📥 How to get a better voice</button></div></div>';
    const row = box.querySelector('.ui-vp-acc'), now = box.querySelector('.w'), warn = box.querySelector('.warn'), vh = box.querySelector('.ui-vp-vh'), vs = box.querySelector('.ui-vp-vs'), tipv = box.querySelector('.tipv');
    const SV = () => (typeof SPVoice !== 'undefined' ? SPVoice : null);
    const QL = {premium: '💎 Premium', enhanced: '✨ Enhanced', natural: '✨ Natural', retro: '🎛️ Classic'}, QR = {premium: 0, enhanced: 1, natural: 2, basic: 3, retro: 4, fun: 9};
    const apple = () => device() === 'iphone' || (device() === 'mac' && /Safari/.test(navigator.userAgent) && !/Chrome|Chromium|Edg\//.test(navigator.userAgent));   // 🎙️ an-7: Safari = built-in voices only
    const DEV = () => (SV() && SV().DEVICE) || '__device__';
    const packOn = () => !!(UI.voicePack && UI.voicePack.loaded() && UI.voicePack.hasAccent(accentNow() || ({us: 'en-US', gb: 'en-GB', au: 'en-AU'})[UI.voicePack.accent()]));   // 🎧 vp-3
    function listFor(a){   // 🎙️ an-6: this device's voices for the accent, best first, joke voices out, one chip per label
      const sv = SV(); if(!a || !sv || !sv.kind) return [];
      const seen = {}; return voicesFor(a).filter(v => sv.kind(v) !== 'fun').map(v => ({v: v, id: v.voiceURI || v.name, k: sv.kind(v), l: sv.label(v), f: sv.female(v)}))
        .sort((x, y) => (QR[x.k] - QR[y.k]) || ((y.f ? 1 : 0) - (x.f ? 1 : 0)) || x.l.localeCompare(y.l)).filter(x => seen[x.l] ? false : (seen[x.l] = 1));
    }
    function paint(){
      const a = accentNow();
      row.innerHTML = ACC.map(([k, n, f]) => { const ok = !k || voicesFor(k).length || (UI.voicePack && UI.voicePack.hasAccent(k)); return '<button type="button" data-a="' + k + '" class="' + (k === a ? 'on' : '') + '" data-sound="tap">' + f + ' ' + n + (k ? '<span class="ok">' + (ok ? ' ✓' : ' 📥') + '</span>' : '') + '</button>'; }).join('');
      row.querySelectorAll('button').forEach(b => b.onclick = () => { try{ UISound.music.set({acc: b.dataset.a}); }catch(e){} try{ if(typeof SPVoice !== 'undefined') SPVoice.refresh(); }catch(e){} paint(); trySay(); });
      let v = null; try{ if(typeof SPVoice !== 'undefined'){ SPVoice.refresh(); v = SPVoice.current(); } }catch(e){}
      // 🎙️ an-6: the voice row
      const L = listFor(a), sv = SV(), pk = sv && sv.picked ? sv.picked() : '';
      vh.hidden = vs.hidden = !L.length && !packOn();   // 🎧 vp-3: ⭐ Best · 🎧 shows even with no device voice
      vs.innerHTML = L.length ? '<button type="button" data-v="" class="' + (pk ? '' : 'on') + '" data-sound="tap">⭐ Best' + (packOn() ? ' · 🎧' : '') + '</button>' + (apple() ? '<button type="button" data-v="' + DEV() + '" class="' + (pk === DEV() ? 'on' : '') + '" data-sound="tap">📱 Phone voice</button>' : '') + L.map(x => '<button type="button" data-v="' + String(x.id).replace(/"/g, '&quot;') + '" class="' + (pk === x.id ? 'on' : '') + '" data-sound="tap">' + x.l.replace(/ \((Enhanced|Premium)\)/, '').replace(/ \(English \([^)]*\)\)/, '').replace(/</g, '&lt;') + (QL[x.k] ? ' <span class="q">' + QL[x.k] + '</span>' : '') + '</button>').join('') : '';
      vs.querySelectorAll('button').forEach(b => b.onclick = () => { try{ SV().choose(b.dataset.v); }catch(e){} paint(); trySay(); });
      const good = L.some(x => x.k === 'premium' || x.k === 'enhanced' || x.k === 'natural'); tipv.hidden = !(L.length && !good) || (packOn() && !pk);   // 🎙️ an-7: honest Apple note · 🎧 vp-3: not needed while the natural voice reads
      if(!tipv.hidden) tipv.textContent = apple() ? '📱 iPhone / iPad (and Safari on a Mac) let a web page use only the voices that come built in — voices you download in Settings never reach it (Apple limit, not the game). Pick one above, or try 📱 Phone voice.'
        : '💡 Only basic voices show here. Downloaded a better one? Close the browser / app fully (swipe it away) and open it again.';
      const flag = v ? (ACC.find(x => x[0] && norm(v.lang).indexOf(x[0].toLowerCase()) === 0) || ['', '', '🌐'])[2] : '';
      now.textContent = packOn() && !pk ? '🔊 Using: 🎧 natural voice ' + ((ACC.find(x => x[0] && x[0] === ({us: 'en-US', gb: 'en-GB', au: 'en-AU'})[UI.voicePack.accent()]) || ['', '', '🌐'])[2]) : pk === DEV() ? '🔊 Using: 📱 this phone’s own voice ' + ((ACC.find(x => x[0] && x[0] === a) || ['', '', '🌐'])[2]) : v ? '🔊 Using: ' + (SV() && SV().label ? SV().label(v) : v.name) + ' ' + flag : '🔊 Using: the device’s own voice';   // 🎙️ an-6: + (Enhanced) from the voice id
      if(pk && sv && sv.bad && sv.bad() === pk){ warn.hidden = false; warn.textContent = '⚠️ That voice didn’t start on this device — tap ▶ Try to give it another go, or pick another.'; return; }
      const miss = a && !voicesFor(a).length && !packOn(); warn.hidden = !miss;   // 🎧 vp-3
      if(miss) warn.textContent = '📥 No ' + (ACC.find(x => x[0] === a) || [])[2] + ' voice on this device yet — tap "How to get a better voice". Until then the closest voice reads.';
    }
    function trySay(){ try{ if(packOn() && !(SV() && SV().picked && SV().picked())){ UI.voicePack.stop(); UI.voicePack.play('cat ship frog', {rate: 0.9}); return; } }catch(e){}   // 🎧 vp-3: the natural voice
      try{ if(!window.speechSynthesis) return; speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance('Hello! Let us read: cat, ship, frog.')); }catch(e){} }
    box.querySelector('.try').onclick = () => { try{ const sv = SV(); if(sv && sv.bad && sv.bad() && sv.bad() === (sv.picked && sv.picked())) sv.forget(); }catch(e){} paint(); trySay(); };   // 🎙️ an-6: Try gives a stuck voice another go
    box.querySelector('.how').onclick = () => guide();
    paint();
    try{ if(UI.voicePack) UI.voicePack.load().then(() => { if(box.isConnected) paint(); }); }catch(e){}   // 🎧 vp-3
    try{ speechSynthesis.addEventListener('voiceschanged', paint); }catch(e){}
    try{ UISound.music.watch(() => { if(box.isConnected) paint(); }); }catch(e){}
    return {paint: paint};
  }
  UI.voicePicker = picker;
})();
/* ================= 🗣️ VOICE PICKER + GUIDE (an-4) END ================= */
