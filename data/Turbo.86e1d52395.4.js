
/* 🎙️ ANNOUNCER (an-1) START — ✨ polish chat, 2026-11-18. Don't edit by hand: Test Harness/patch_an1_games.py re-applies it.
   Aowu 16:54 "the announcer … is very mono tone, if it can't be a bit dramatic then no need to speak" + 16:55 "every announcer in
   fast pace game" → picked "Voice off + sound hits": in this game every spoken line (the game's own say(), 💥 comic words, 📣 crowd
   chants, 💬 callouts) goes through ONE gate on speechSynthesis.speak:
     🎙️ Voice: Off (default) → no voice; a short sound hit instead (🏁 start = whoosh + bell · 💥 big = whoosh + boom + crowd "ooh" ·
                              ⚠️ warning = low horn · small = pop), at most one every 0.45 s, crowd name chants stay silent
     🎙️ Voice: On            → the old voice, said in a more dramatic way: a whoosh first, then the line in two parts —
                              "Sla…" slow + low, "SMASH!" fast + high + loud (the last word when there is no "…")
   Per player per device: localStorage sp_announcer:<Name> = on | off. The 🎙️ chip sits next to the 📣 crowd chips on the setup page.
   📱 iPhone (Aowu: "no sound in SlaBam"): the phone's ring / silent switch mutes web sounds + music but NOT the reading voice, so a
   muted iPhone heard only the announcer. Here: navigator.audioSession.type = 'playback' (iOS 16.4+), and every tap wakes a sleeping /
   'interrupted' sound engine. The game's own 🔇 sound switch still turns everything off.
   Moves into UiKit (one place for every page) once 📏 S3 lets go of UiKit. Test hooks: ANN.log · ANN.on() · ANN.set(v) · ANN.chip(). */
const ANN = (function(){
  const LOG = [];
  const who = () => { try{ return (typeof S !== 'undefined' && S && S.player) || (typeof CURRENT_PLAYER !== 'undefined' && CURRENT_PLAYER) || 'Guest'; }catch(e){ return 'Guest'; } };
  const key = () => 'sp_announcer:' + who();
  function on(){ try{ return localStorage.getItem(key()) === 'on'; }catch(e){ return false; } }
  function set(v){ try{ localStorage.setItem(key(), v ? 'on' : 'off'); }catch(e){} paint(); }
  const snd = () => window.UISound && UISound.isOn && UISound.isOn() && UISound.tone && UISound.noise;
  // ---- 🔊 sound hits (UiKit's shared tone maker — no AudioContext of our own)
  const START = /\b(go|kick ?off|ready|round \d|let'?s play|hop to row|ball \d|first to|serve|fight)\b|^sla\w*! /i;
  const WARN = /sudden death|watch out|last ball|time is up|game over|oops|angry|careful|danger|so close|miss/i;
  const CHANT = /^(go \w+!|(\S+)! \2!)$/i;
  function kind(t){ t = String(t || '').trim(); if(!t || CHANT.test(t)) return ''; if(WARN.test(t)) return 'warn'; if(START.test(t)) return 'start';
    return /!|…|\.\.\.|[A-Z]{3,}/.test(t) ? 'big' : 'small'; }
  let lastHit = 0;
  function hit(k){
    if(!k || !snd()) return false; const now = Date.now(); if(now - lastHit < 450) return false; lastHit = now;
    try{
      if(k === 'start'){ UISound.noise(.32, {gain: .16, from: 500, to: 3200}); UISound.note('G5', .22, {instrument: 'bell', gain: .16, delay: .2}); UISound.note('D6', .38, {instrument: 'bell', gain: .18, delay: .34}); }
      else if(k === 'big'){ UISound.noise(.28, {gain: .2, from: 3000, to: 400}); UISound.tone(120, .42, {type: 'sine', gain: .32, slide: 42, delay: .2});
        UISound.noise(.9, {gain: .07, from: 650, to: 1150, q: 1.4, delay: .3}); UISound.note('C5', .3, {instrument: 'pluck', gain: .1, delay: .22}); UISound.note('G5', .45, {instrument: 'bell', gain: .12, delay: .3}); }
      else if(k === 'warn'){ UISound.tone(196, .28, {type: 'sawtooth', gain: .09}); UISound.tone(147, .5, {type: 'sawtooth', gain: .09, delay: .26}); }
      else UISound.tone(660, .12, {type: 'triangle', gain: .12, slide: 880});
    }catch(e){ return false; }
    LOG.push({hit: k, t: now}); if(LOG.length > 80) LOG.splice(0, 30); return true;
  }
  // ---- 🗣️ the voice, more dramatic (only when 🎙️ is on)
  function parts(t){
    t = String(t || '').replace(/\s+/g, ' ').trim(); const i = t.search(/…|\.\.\./);
    if(i > 0 && i < t.length - 2) return [t.slice(0, i), t.slice(i).replace(/^(…|\.\.\.)\s*/, '')];
    const m = /^(.*\S)\s+(\S+)$/.exec(t); return m && m[1].length > 1 ? [m[1], m[2]] : [t];
  }
  function utter(text, rate, pitch, vol){ const u = new SpeechSynthesisUtterance(text); u.rate = rate; u.pitch = pitch; u.volume = vol; u.__ann = 1; return u; }
  let real = null;
  function speakDramatic(u){
    if(!real) return; const t = u.text, P = parts(t), k = kind(t); if(k && k !== 'small') hit(k === 'big' ? 'start' : k);
    const go = () => { try{
      if(P.length === 2){ real(utter(P[0] + (/[?!.,]$/.test(P[0]) ? '' : ','), .84, .85, .9)); real(utter(P[1], 1.12, 1.5, 1)); }
      else real(utter(t, k === 'warn' ? .9 : 1.08, k === 'warn' ? .9 : 1.35, 1));
      LOG.push({say: P.join(' | '), t: Date.now()});
    }catch(e){} };
    setTimeout(go, 140);
  }
  // ---- the ONE gate (wraps UiKit's voice helper, so its iPhone / Android fixes still run underneath)
  try{
    const ss = window.speechSynthesis;
    if(ss && !ss.__ann){
      ss.__ann = true; real = ss.speak.bind(ss);
      ss.speak = u => {
        if(!u || u.__ann || u.volume === 0 || !String(u.text || '').trim()) return real(u);   // our own parts + UiKit's silent iPhone unlock
        if(on()) return speakDramatic(u);
        LOG.push({mute: String(u.text).slice(0, 40), t: Date.now()}); hit(kind(u.text));       // 🎙️ off → a sound hit, no voice
      };
    }
  }catch(e){}
  // ---- 📱 iPhone: play through the silent switch + wake a sleeping sound engine on every tap
  try{ if(navigator.audioSession) navigator.audioSession.type = 'playback'; }catch(e){}
  function wake(){ try{ if(!(window.UISound && UISound.isOn && UISound.isOn())) return; const c = UISound.ctx && UISound.ctx(); if(c && c.state !== 'running' && c.state !== 'closed'){ c.resume(); LOG.push({wake: c.state, t: Date.now()}); } }catch(e){} }
  ['pointerdown', 'touchend', 'keydown'].forEach(t => document.addEventListener(t, wake, true));
  document.addEventListener('visibilitychange', () => { if(!document.hidden) wake(); });
  // ---- 🎙️ chip on the setup page (next to the 📣 crowd chips)
  let chipEl = null;
  function paint(){ if(!chipEl) return; const v = on(); chipEl.textContent = '🎙️ Voice: ' + (v ? 'On' : 'Off'); chipEl.classList.toggle('on', v); chipEl.setAttribute('aria-pressed', v ? 'true' : 'false'); }
  function chip(){
    if(chipEl && chipEl.isConnected){ paint(); return chipEl; }
    const a = document.getElementById('cheer-lang') || document.getElementById('cheer-chip') || document.getElementById('comic-chip') || document.getElementById('view-chip');
    const b = document.createElement('button'); b.type = 'button'; b.id = 'ann-chip'; b.setAttribute('data-sound', 'tap');
    b.title = 'Announcer voice — Off: a sound hit instead of the voice · On: the voice, said dramatic';
    if(a){ b.className = a.className.replace(/\bon\b/g, '').trim() || 'chip'; a.insertAdjacentElement('afterend', b); }
    else { const bar = document.querySelector('.b3-start'); if(!bar) return null; const row = document.createElement('div'); row.className = 'ann-row'; row.style.cssText = 'display:flex;justify-content:center;margin:10px 0 0;';
      b.className = 'chip'; b.style.cssText = 'border:none;border-radius:999px;padding:8px 14px;font-weight:800;cursor:pointer;background:var(--card,#fff);color:var(--ink,#222);box-shadow:0 2px 0 rgba(0,0,0,.25);';
      row.appendChild(b); bar.parentNode.insertBefore(row, bar); }
    b.onclick = () => { set(!on()); if(on()) speakDramatic({text: 'Sla… WOW!'}); else hit('big');
      try{ if(window.UI && UI.toast) UI.toast(on() ? '🎙️ Announcer voice on — said with drama' : '🎙️ Voice off — a sound hit plays instead'); }catch(e){} };
    chipEl = b; paint(); return b;
  }
  let lastWho = '';
  setInterval(() => { const w = who(); if(!chipEl || !chipEl.isConnected) chip(); else if(w !== lastWho) paint(); lastWho = w; }, 1000);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chip); else chip();
  return {on: on, set: set, hit: hit, kind: kind, parts: parts, chip: chip, wake: wake, log: LOG};
})();
/* 🎙️ ANNOUNCER (an-1) END */
