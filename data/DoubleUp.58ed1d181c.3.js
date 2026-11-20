/* 📏 p2: rows that used to scroll sideways → wrap + pages with dots (UiKit UI.pageRows) */ if (window.UI && UI.pageRows) { UI.pageRows('.chips', {rows: 3}); }/* ================= 🧑 YOUR AVATAR (p6e — ✨ P6 / 11w round 2) =================
   The player's own avatar beside the game: UI.buddy pictures (cached AvatarActing frames, swapped by a small timer) —
   nothing is painted in the game loop. It reacts to the game's own moments through the wrappers below (no game logic changes). */
const HAS_AV = typeof drawAvatar === 'function' && typeof GESTURES !== 'undefined';
const BD_SAY = {};
const BD = {on: false, who: null, list: []};
function bdStart(){
  BD.list.forEach(b => b && b.stop()); BD.list = []; BD.on = false;
  const els = ['bd-lg'].map(id => document.getElementById(id)).filter(Boolean);
  if(!HAS_AV || !UI.buddy || !window.Acting){ els.forEach(e => e.classList.add('hidden')); return; }
  BD.who = {name: S.player, av: myAvatar(S.player)}; BD.list = els.map((e, i) => UI.buddy(e, BD.who, i ? {fps: 6} : {})).filter(Boolean); BD.on = !!BD.list.length;
}
function bdReact(mood, ms){ if(!BD.on) return false; let a = false; BD.list.forEach(b => { const x = b.react(mood, ms); if(x) a = x; });  return a; }
function bdResultBig(){ const big = document.querySelector('#result-card > .big'); if(!big || !BD.on) return; const won = !!document.querySelector('#result-card h2.cheer'); const c = document.createElement('canvas'); c.className = 'res-av'; c.id = 'res-av'; c.setAttribute('aria-hidden', 'true'); big.replaceWith(c); bdResult('res-av', won); }
function bdResult(id, won){ if(BD.on && document.getElementById(id)) UI.buddy(document.getElementById(id), BD.who, {hold: won ? 'win' : 'lose'}); }
const bdBase = {startGame, party, showResult};
startGame = function(){ const args = arguments;  const r = bdBase.startGame.apply(this, args); bdStart(); return r; };
party = function(){ const args = arguments;  const r = bdBase.party.apply(this, args); if(BD.on && performance.now() - (BD.last || 0) > 1800){ BD.last = performance.now(); bdReact('happy', 1400); } return r; };
showResult = function(){ const args = arguments;  const r = bdBase.showResult.apply(this, args); bdResultBig(); return r; };
/* ================= 🧑 YOUR AVATAR END (p6e) ================= */
