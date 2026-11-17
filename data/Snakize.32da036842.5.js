
/* 🎵 MOOD (24u-b) START — ✨ polish chat · UiKit ambient mood (UISound.mood, plan `Ambient Moods — full plan.md` §7). Don't edit by hand:
   Test Harness/patch_24ub_moods.py re-applies it. Starts with the game's cheerMount() (= play starts, also 🔄 Again), stops with
   cheerEnd() (result) or when the play screen goes away (◀ / 🎚️ Levels); every 0.4 s it reads the game's own state → tension /
   hush (🤖 thinking) / pause; the crowd's big moments → lift (max one every 3 s). Test hook: GMOOD (page global). */
const GMOOD = (function(){
  const ID = 'snakize';
  function idNow(){ try{ return (function(){ return (G && G.story) ? 'snaketale' : 'snakize';   /* 📜 Snaketale = 📖 story mood */ })() || ID; }catch(e){ return ID; } }
  let h = null, timer = 0, lastLift = 0;
  const vis = el => !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  function playing(){ try{ return !!(G && !G.over) && vis(document.getElementById('scr-play')) && !vis(document.getElementById('result')); }catch(e){ return false; } }
  function skip(){ return false; }
  function tension(){ const M = G.M, me = M.snakes[0]; if(!me) return .2; let w; if(M.story) w = (M.story.have || 0) / Math.max(1, M.story.need); else if(M.mode === 'castle') w = me.land / (M.win || Math.max(30, ...M.snakes.map(s => s.land))); else { const tgt = M.mode === 'feast' && isFinite(M.target) ? M.target : (M.mode === 'gate' && M.goalLen ? M.goalLen : 0), L = SN.lenOf(M, me); w = tgt ? L / tgt : M.mode === 'gate' ? .7 * L / Math.max(1, ...M.snakes.map(s => s.len)) : Math.min(1, L / 80); } let t = .15 + .65 * Math.min(1, w); const stT = M.story && M.story.time, timed = stT || ((M.mode === 'gate' || M.mode === 'castle') && M.time); if(timed && (stT || M.time) - M.t <= 15) t = Math.max(t, .9); if(me.human && me.lives === 1) t = Math.max(t, .7); return t; }
  function hush(){ return false; }
  function paused(){ return !!G.paused; }
  function poll(){
    if(!h || !h.live || !playing()){ stop(); return; }
    let t = 0; try{ t = Number(tension()) || 0; }catch(e){} h.tension(Math.min(1, Math.max(0, t)));
    let q = false; try{ q = !!hush(); }catch(e){} h.hush(q);
    let p = false; try{ p = !!paused(); }catch(e){} h.pause(p, 'game');
  }
  function start(){
    stop();
    try{ if(skip()) return; }catch(e){}
    try{ if(window.UISound && UISound.mood) h = UISound.mood(idNow()); }catch(e){ h = null; }
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
  /* 🐍 Snakize's own little theme loop (musicStart) + its own 🎵 Music bar button give way to the shared mood: one music, one 🎵 chip */
  try{ if(window.UISound && UISound.mood){ const ms = window.musicStart; if(typeof ms === 'function' && !ms.__gmood){ const w = function(){ try{ musicStop(); }catch(e){} }; w.__gmood = 1; window.musicStart = w; } const css = document.createElement('style'); css.textContent = '#mus-btn{display:none !important}'; document.head.appendChild(css); } }catch(e){}
  return {id: ID, idNow: idNow, start: start, stop: stop, lift: lift, poll: poll, now: () => h, playing: playing, tension: tension, hush: hush, paused: paused};
})();
/* 🎵 MOOD (24u-b) END */
