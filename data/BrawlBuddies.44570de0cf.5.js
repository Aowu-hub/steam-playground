
/* 🎵 MOOD (24u-b) START — ✨ polish chat · UiKit ambient mood (UISound.mood, plan `Ambient Moods — full plan.md` §7). Don't edit by hand:
   Test Harness/patch_24ub_moods.py re-applies it. Starts with the game's cheerMount() (= play starts, also 🔄 Again), stops with
   cheerEnd() (result) or when the play screen goes away (◀ / 🎚️ Levels); every 0.4 s it reads the game's own state → tension /
   hush (🤖 thinking) / pause; the crowd's big moments → lift (max one every 3 s). Test hook: GMOOD (page global). */
const GMOOD = (function(){
  const ID = 'brawlbuddies';
  function idNow(){ try{ return (function(){ return vis(document.getElementById('scr-advplay')) ? 'brawenture' : 'brawlbuddies';   /* 🗺️ Brawenture = 📖 story mood */ })() || ID; }catch(e){ return ID; } }
  let h = null, timer = 0, lastLift = 0;
  const vis = el => !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  function playing(){ try{ if(vis(document.getElementById('result'))) return false; if(vis(document.getElementById('scr-advplay'))) return !!(AV && !AV.over); return !!(G && G.M) && vis(document.getElementById('scr-play')); }catch(e){ return false; } }
  function skip(){ return false; }
  function tension(){ if(AV && vis(document.getElementById('scr-advplay'))){ const M = AV.M; let t = .2 + .45 * Math.min(1, M.mapI / Math.max(1, M.tale.maps.length)); if(M.bosses && M.bosses.some(b => b && b.hp > 0)) t = Math.max(t, .8); if(M.clash) t = .95; return t; } const f = G.M.f; if(!f || !f[0] || !f[1]) return .3; const lo = Math.min(f[0].hp / Math.max(1, f[0].maxHp), f[1].hp / Math.max(1, f[1].maxHp)); let t = .3 + .6 * (1 - lo); const w = G.M.wins; if(w && w[0] + w[1] > 0) t += .1; return t; }
  function hush(){ return !!(AV && AV.story && vis(document.getElementById('scr-advplay')));   /* 📖 the tale's story card */ }
  function paused(){ if(AV && vis(document.getElementById('scr-advplay'))) return !!(AV.paused && !AV.story); return !!G.paused; }
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
  function wrapAfter(name, after){
    const f = window[name]; if(typeof f !== 'function' || f.__gmoodA) return;
    const w = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; w.__gmoodA = 1; window[name] = w;
  }
  wrap('cheerMount', start);
  wrapAfter('startAdv', start);
  wrap('cheerFaces', stop);
  wrap('advEnd', stop);
  wrap('cheerEvents', function(){ if((function(list){ return (list || []).some(e => e.k === 'match' || e.k === 'sky' || e.k === 'slam' || (e.k === 'roundEnd' && e.winner >= 0)); }).apply(this, arguments)) lift(); });
  wrap('advEvents', function(){ if((function(list){ return (list || []).some(e => e.k === 'solved' || e.k === 'clashWin' || e.k === 'mapEnd' || e.k === 'rescue' || e.k === 'evolve'); }).apply(this, arguments)) lift(); });
  return {id: ID, idNow: idNow, start: start, stop: stop, lift: lift, poll: poll, now: () => h, playing: playing, tension: tension, hush: hush, paused: paused};
})();
/* 🎵 MOOD (24u-b) END */
