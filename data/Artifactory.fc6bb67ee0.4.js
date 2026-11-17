
/* 🎵 MOOD (24u-b) START — ✨ polish chat · UiKit ambient mood (UISound.mood, plan `Ambient Moods — full plan.md` §7). Don't edit by hand:
   Test Harness/patch_24ub_moods.py re-applies it. Starts with the game's cheerMount() (= play starts, also 🔄 Again), stops with
   cheerEnd() (result) or when the play screen goes away (◀ / 🎚️ Levels); every 0.4 s it reads the game's own state → tension /
   hush (🤖 thinking) / pause; the crowd's big moments → lift (max one every 3 s). Test hook: GMOOD (page global). */
const GMOOD = (function(){
  const ID = 'artifactory';
  let h = null, timer = 0, lastLift = 0;
  const vis = el => !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  function playing(){ try{ const o = document.getElementById('over'), card = o && !o.classList.contains('hidden') && o.querySelector('#card-btns'); return !!(G && !G.done) && !card && vis(document.getElementById('scr-play')); }catch(e){ return false; } }
  function skip(){ return false; }
  function tension(){ const a = document.getElementById('h-acc'), m = a && /(\d+)\s*%/.exec(a.textContent || ''), pct = m ? Math.min(100, +m[1]) / 100 : 0; return (G.blue ? .25 : .15) + .45 * pct;   /* 🎯 the closer to the plan, the busier the workshop */ }
  function hush(){ const o = document.getElementById('over'); return !!(o && !o.classList.contains('hidden'));   /* ⏳ wait + 💡 lesson card, safety card */ }
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
  wrapAfter('startLathe', start);
  wrapAfter('startStone', start);
  wrapAfter('startFinish', start);
  wrapAfter('startPlaner', start);
  wrapAfter('startWeld', start);
  wrapAfter('startForge', start);
  wrapAfter('startForge2', start);
  wrapAfter('startPottery', start);
  wrapAfter('startSew', start);
  wrapAfter('startLight', start);
  wrapAfter('startWhittle', start);
  wrapAfter('startPrint', start);
  wrapAfter('startLab', start);
  wrapAfter('startNature', start);
  wrapAfter('startCharm', start);
  wrap('itemCard', stop);
  wrap('backToMenu', stop);
  wrap('finishNext', function(){ if((function(){ return true; }).apply(this, arguments)) lift(); });
  /* 🎵 Artifactory keeps its own top bar (no UI.gameBar) → a 🎵 pill right after 🔊 while the workshop music plays (same sheet + look as the bar's chip) */
  try{ const hud = document.querySelector('#scr-play .af-hud'), snd = document.getElementById('h-snd');
    if(hud && !document.getElementById('h-mus') && window.UISound && UISound.music && UISound.music.watch){
      const b = document.createElement('button'); b.className = 'pill gb-mus hidden'; b.id = 'h-mus'; b.setAttribute('data-sound', 'none'); b.textContent = '🎵'; b.onclick = function(){ UISound.music.sheet(b); };
      const paint = st => { b.classList.toggle('hidden', !st.live); b.classList.toggle('gb-mus-off', !st.on); b.title = st.on ? 'Music: on' : 'Music: off'; b.setAttribute('aria-label', b.title); };
      /* 📱 narrow screens: the bar is full (titles would turn into …) → the pill sits in the 🪞 mirror box's bottom corner instead (the tip bubble is at the top) */
      const mir = document.getElementById('mirror'), st = document.createElement('style'); st.textContent = '#mirror > #h-mus{position:absolute;bottom:6px;right:6px;z-index:3;margin:0}'; document.head.appendChild(st);
      const place = () => { const narrow = innerWidth < 600 && !!mir; if(narrow){ if(b.parentNode !== mir) mir.appendChild(b); } else if(b.parentNode !== hud){ if(snd && snd.parentNode === hud) hud.insertBefore(b, snd.nextSibling); else hud.appendChild(b); } };
      place(); addEventListener('resize', place);
      paint(UISound.music.state()); UISound.music.watch(paint); } }catch(e){}
  return {id: ID, start: start, stop: stop, lift: lift, poll: poll, now: () => h, playing: playing, tension: tension, hush: hush, paused: paused};
})();
/* 🎵 MOOD (24u-b) END */
