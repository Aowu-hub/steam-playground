
/* 🎵 MOOD (24u-b) START — ✨ polish chat · UiKit ambient mood (UISound.mood, plan `Ambient Moods — full plan.md` §7). Don't edit by hand:
   Test Harness/patch_24ub_moods.py re-applies it. Starts with the game's cheerMount() (= play starts, also 🔄 Again), stops with
   cheerEnd() (result) or when the play screen goes away (◀ / 🎚️ Levels); every 0.4 s it reads the game's own state → tension /
   hush (🤖 thinking) / pause; the crowd's big moments → lift (max one every 3 s). Test hook: GMOOD (page global). */
const GMOOD = (function(){
  const ID = 'minigames';
  let h = null, timer = 0, lastLift = 0;
  const vis = el => !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  function playing(){ try{ return !!M && vis(document.getElementById('scr-game')) && !vis(document.getElementById('result')); }catch(e){ return false; } }
  function skip(){ return false; }
  function tension(){ if(M.st.speed) return M.speedEnd ? Math.min(1, 1 - (M.speedEnd - performance.now()) / (M.st.speed * 1000)) : 0; return .7 * M.round / Math.max(1, M.st.rounds); }
  function hush(){ return false; }
  function paused(){ return false; }
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
  function wrapAfter(name, after){
    const f = window[name]; if(typeof f !== 'function' || f.__gmoodA) return;
    const w = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; w.__gmoodA = 1; window[name] = w;
  }
  wrapAfter('openGame', start);
  wrap('stageCleared', stop);
  wrap('speedOver', stop);
  wrap('correct', function(){ if((function(){ return !!M && (M.streak || 0) >= 3; }).apply(this, arguments)) lift(); });
  return {id: ID, start: start, stop: stop, lift: lift, poll: poll, now: () => h, playing: playing, tension: tension, hush: hush, paused: paused};
})();
/* 🎵 MOOD (24u-b) END */
