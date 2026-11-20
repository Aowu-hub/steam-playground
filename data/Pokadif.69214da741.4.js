
/* 🎵 MOOD (24u-b) START — ✨ polish chat · UiKit ambient mood (UISound.mood, plan `Ambient Moods — full plan.md` §7). Don't edit by hand:
   Test Harness/patch_24ub_moods.py re-applies it. Starts with the game's cheerMount() (= play starts, also 🔄 Again), stops with
   cheerEnd() (result) or when the play screen goes away (◀ / 🎚️ Levels); every 0.4 s it reads the game's own state → tension /
   hush (🤖 thinking) / pause; the crowd's big moments → lift (max one every 3 s). Test hook: GMOOD (page global). */
const GMOOD = (function(){
  const ID = 'pokadif';
  let h = null, timer = 0, lastLift = 0;
  const vis = el => !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  function playing(){ try{ if(vis(document.getElementById('result'))) return false; if(RC && vis(document.getElementById('scr-race'))) return true; return !!(G && !G.over) && vis(document.getElementById('scr-play')); }catch(e){ return false; } }
  function skip(){ return false; }
  function tension(){ if(RC && vis(document.getElementById('scr-race'))){ const o = RC.owner || [], n = o.filter(x => x >= 0).length; return .3 + .6 * n / Math.max(1, RC.rounds || o.length || 1); } if(G.mode === 'arcade') return Math.min(1, Math.max(0, 1 - G.timeLeft / Math.max(1, G.A.limit + (G.extra || 0)))); const f = G.found || [], p = f.length ? f.filter(Boolean).length / f.length : 0; let t = .15 + .35 * p + .3 * Math.min(1, (G.pics || 0) / Math.max(1, G.rounds || 1)); if(G.lives === 1) t = Math.max(t, .7); return t; }
  function hush(){ const c = document.getElementById('scard'); return !!(c && !c.classList.contains('hidden'));   /* 📖 a case card is open */ }
  function paused(){ return !!(G && G.paused); }
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
  wrapAfter('startCase', start);
  wrapAfter('raceGo', start);
  wrap('finishCase', stop);
  wrap('arcFinish', stop);
  wrap('finishStory', stop);
  wrap('raceEnd', stop);
  wrap('bigWord', function(){ if((function(txt, small, rank){ return rank === 'big'; }).apply(this, arguments)) lift(); });
  return {id: ID, start: start, stop: stop, lift: lift, poll: poll, now: () => h, playing: playing, tension: tension, hush: hush, paused: paused};
})();
/* 🎵 MOOD (24u-b) END */
