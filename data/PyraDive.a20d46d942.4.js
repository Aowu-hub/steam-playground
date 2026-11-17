
/* 🎵 MOOD (24u-b) START — 🔥 PyraDive chat (pd-9b) · UiKit ambient mood (UISound.mood, plan `Ambient Moods — full plan.md` §7). Don't edit by hand:
   Test Harness/patch_pd9b.py re-applies it (block from patch_24ub_moods.py). Starts with the game's cheerMount() (= play starts, also 🔄 Again), stops with
   cheerEnd() (result) or when the play screen goes away (◀ / 🎚️ Levels); every 0.4 s it reads the game's own state → tension /
   hush (🤖 thinking) / pause; the crowd's big moments → lift (max one every 3 s). Test hook: GMOOD (page global). */
const GMOOD = (function(){
  const ID = 'pyradive';
  let h = null, timer = 0, lastLift = 0;
  const vis = el => !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  function playing(){ try{ return !!(G && !G.over) && vis(document.getElementById('scr-play')) && !vis(document.getElementById('result')); }catch(e){ return false; } }
  function skip(){ return false; }
  function tension(){ const M = G.M; if(!M) return 0; const clk = tl => tl < 10 ? .75 : tl < 20 ? .45 : .2; if(isHoop(M)) return clk(M.timeLeft); if(M.drill) return M.drill.time != null ? clk(M.drill.time) : Math.min(.7, (M.drill.streak || 0) / 15); const T = M.teams; if(!T || T.length < 2) return 0; const a = T[0].score, b = T[1].score, tg = M.target || 15, hi = Math.max(a, b); let t = .55 * Math.min(1, hi / tg); if(Math.abs(a - b) <= 2 && hi >= tg * .5) t += .15; if(hi >= tg - 1){ t = Math.max(t, .8); if([0, 1].some(i => T[i].score >= tg - 1 && T[i].score > T[1 - i].score && T[i].sets + 1 >= M.setsTo)) t = .95; } if((M.rally || 0) >= 8) t += .1; return t; }
  function hush(){ const M = G.M; return !!(M && !M.over && (M.phase === 'serve' || M.waiting)); }
  function paused(){ return !!(G.paused || G.held); }
  function poll(){
    if(!h || !h.live || !playing()){ stop(); return; }
    let t = 0; try{ t = Number(tension()) || 0; }catch(e){} h.tension(Math.min(1, Math.max(0, t)));
    let q = false; try{ q = !!hush(); }catch(e){} h.hush(q);
    let p = false; try{ p = !!paused(); }catch(e){} h.pause(p, 'game');
  }
  function start(){
    stop();
    try{ if(skip()) return; }catch(e){}
    try{ if(window.UISound && UISound.mood) h = UISound.mood(ID); }catch(e){ h = null; }
    if(h && h.live){ timer = setInterval(poll, 400); setTimeout(poll, 80); } else h = null;
  }
  function lift(){ const now = Date.now(); if(!h || !h.live || now - lastLift < 3000) return; lastLift = now; try{ h.lift(); }catch(e){} }
  function stop(){ clearInterval(timer); timer = 0; const x = h; h = null; if(x){ try{ x.stop(); }catch(e){} } }
  function wrap(name, before){
    const f = window[name]; if(typeof f !== 'function' || f.__gmood) return;
    const w = function(){ try{ before.apply(this, arguments); }catch(e){} return f.apply(this, arguments); }; w.__gmood = 1; window[name] = w;
  }
  wrap('cheerMount', start);
  wrap('cheerEnd', stop);
  wrap('cheerSay', function(){ if((function(kind){ return kind === 'big'; }).apply(this, arguments)) lift(); });
  return {id: ID, start: start, stop: stop, lift: lift, poll: poll, now: () => h, playing: playing, tension: tension, hush: hush, paused: paused};
})();
/* 🎵 MOOD (24u-b) END */
