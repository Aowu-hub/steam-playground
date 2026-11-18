
/* 🎵 MOOD (24u-b) START — ✨ polish chat · UiKit ambient mood (UISound.mood, plan `Ambient Moods — full plan.md` §7). Don't edit by hand:
   Test Harness/patch_24ub_moods.py re-applies it. Starts with the game's cheerMount() (= play starts, also 🔄 Again), stops with
   cheerEnd() (result) or when the play screen goes away (◀ / 🎚️ Levels); every 0.4 s it reads the game's own state → tension /
   hush (🤖 thinking) / pause; the crowd's big moments → lift (max one every 3 s). Test hook: GMOOD (page global). */
const GMOOD = (function(){
  const ID = 'blasoff';
  let h = null, timer = 0, lastLift = 0;
  const vis = el => !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  function playing(){ try{ return !!(G && G.M && !G.over) && vis(document.getElementById('scr-play')) && !vis(document.getElementById('result')); }catch(e){ return false; } }
  function skip(){ return !!(G && G.M && G.M.battle);   /* 🎤 Tricks Battle: the beat is the game — no second tempo under it */ }
  function tension(){ const M = G.M; if(M.drill) return .2; if(M.phase === 'pens') return .92; if(M.golden) return .9; const tot = M.halfLen * (M.S.oneHalf ? 1 : 2), left = Math.max(0, tot - M.clock), gap = Math.abs(M.score[0] - M.score[1]); let t = .18 + .42 * Math.min(1, M.clock / Math.max(1, tot)); if(gap <= 1 && left < 30) t = Math.max(t, .88); else if(gap <= 1 && left < 60) t = Math.max(t, .7); if(M.S.firstTo){ const hi = Math.max(M.score[0], M.score[1]); if(hi >= M.S.firstTo - 1) t = Math.max(t, .85); } return t; }
  function hush(){ return false; }
  function paused(){ return !!(G && (G.paused || G.hold)); }
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
  wrapAfter('startMatch', start);
  wrap('finishMatch', stop);
  wrap('finishDrill', stop);
  wrap('handleEvents', function(){ if((function(evs){ return (evs || []).some(e => (e.k === 'goal' && !e.own && isMine(e.side)) || (e.k === 'save' && e.shoutSave && isMine(e.side)) || (e.k === 'pengoal' && isMine(e.side))); }).apply(this, arguments)) lift(); });
  return {id: ID, start: start, stop: stop, lift: lift, poll: poll, now: () => h, playing: playing, tension: tension, hush: hush, paused: paused};
})();
/* 🎵 MOOD (24u-b) END */
