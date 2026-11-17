
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
