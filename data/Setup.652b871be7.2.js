
window.SP_PAGE = SP_TV[0];   // page name for the 💬 Tell us button
window.NO_FEEDBACK_BUTTON = true;   // the Admin page has the full Feedback list instead of the 💬 button
const WEBAPP_URL = SP_TV[1];
let enteredPin = '';
let unlocked = false;

const NAV_KIND = {home:'home', gameroom:'rooms', achievements:'trophy', setup:'admin', room:'room', collection:'collection'};
function goNav(page){
  UI.go(WEBAPP_URL + '?page=' + page, NAV_KIND[page] || 'nav');
}

/* ---------- LOADING SCREEN (shown between a correct PIN and the admin panel) ---------- */
const LOADING_ICONS = ['🎮','⭐','🧩','🚀','🏆'];
let loadingIconTimer = null;
let loadingActive = false;
let loadingPending = 0;
let loadingStartedAt = 0;
function startLoadingScreen(wording){
  loadingActive = true;
  loadingPending = 1; // one getAdminData() call
  loadingStartedAt = Date.now();
  document.getElementById('loading-text').textContent = wording || 'Loading your admin tools…';
  document.getElementById('loading-screen').classList.remove('hidden');
  let i = 0;
  const el = document.getElementById('loading-icon');
  el.textContent = LOADING_ICONS[0];
  loadingIconTimer = setInterval(()=>{ i = (i+1) % LOADING_ICONS.length; el.textContent = LOADING_ICONS[i]; }, 550);
}
function markLoaded(){
  if(!loadingActive) return;
  loadingPending--;
  if(loadingPending > 0) return;
  // Keep the loading box up for a minimum stretch so it doesn't just flash
  // by when the data comes back instantly.
  const wait = Math.max(0, 700 - (Date.now() - loadingStartedAt));
  setTimeout(()=>{
    loadingActive = false;
    clearInterval(loadingIconTimer);
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('screen-admin').classList.remove('hidden');
  }, wait);
}

/* ---------- FAMILY LOOK (Theme key; each player's own look is Theme_<name>) ---------- */
UI.applyTheme(UI.cachedTheme(''));
let familyLook = 'classic';
function renderLookOpts(){
  const box = document.getElementById('look-opts'); box.innerHTML = '';
  UI.THEMES.forEach(t => {
    const b = document.createElement('button');
    b.className = 'look-opt t-chip' + (familyLook === t.key ? ' selected' : '');
    b.setAttribute('data-sound', 'pop');
    b.innerHTML = '<span class="li">' + t.icon + '</span><span>' + t.name + '</span>';
    b.onclick = () => { familyLook = t.key; UI.applyTheme(t.key); renderLookOpts(); };
    box.appendChild(b);
  });
}
const SOUND_OPTIONS = [
  {id:'none', name:'None', icon:'🔇'},
  {id:'calm-breeze', name:'Calm Breeze', icon:'🍃'},
  {id:'playful-bells', name:'Playful Bells', icon:'🔔'},
  {id:'gentle-piano', name:'Gentle Piano', icon:'🎹'},
  {id:'ocean-waves', name:'Ocean Waves', icon:'🌊'},
  {id:'adventure-beat', name:'Adventure Beat', icon:'🥁'}
];
let selectedSound = 'none';

function applyInterfaceSettings(settings){
  familyLook = UI.themeFor(settings, '');
  UI.applyTheme(familyLook);
  renderLookOpts();
}
function renderSoundOptions(){
  const box = document.getElementById('sound-options');
  box.innerHTML = '';
  SOUND_OPTIONS.forEach(s=>{
    const el = document.createElement('div');
    el.className = 'sound-opt' + (selectedSound===s.id ? ' selected' : '');
    el.setAttribute('data-sound', 'pop');
    el.innerHTML = '<span class="sicon">'+s.icon+'</span><span class="sname">'+s.name+'</span>'+(selectedSound===s.id ? '<span class="scheck">✓</span>' : '');
    el.onclick = ()=>{ selectedSound = s.id; renderSoundOptions(); };
    box.appendChild(el);
  });
}

function fillSettingsForm(settings){
  settings = settings || {};
  document.getElementById('toggle-lock').checked = !(settings.ScreenTimeLockEnabled === 'FALSE' || settings.ScreenTimeLockEnabled === false);
  document.getElementById('time-4-5').value = settings['ScreenTime_4-5'] || 15;
  document.getElementById('time-6-7').value = settings['ScreenTime_6-7'] || 20;
  document.getElementById('time-8-9').value = settings['ScreenTime_8-9'] || 30;
  document.getElementById('time-10plus').value = settings['ScreenTime_10+'] || 45;
  document.getElementById('toggle-sound').checked = !(settings.SoundEnabled === 'FALSE' || settings.SoundEnabled === false);
  const vol = (settings.SoundVolume === '' || settings.SoundVolume === undefined) ? 60 : Number(settings.SoundVolume);
  document.getElementById('sound-volume').value = isNaN(vol) ? 60 : vol;
  document.getElementById('sound-volume-val').textContent = (isNaN(vol) ? 60 : vol) + '%';
  document.getElementById('toggle-maze-fx').checked = !(settings.MazeEffects === 'FALSE' || settings.MazeEffects === false);
  document.getElementById('toggle-guide-auto').checked = settings.GuidesAutoOpen === 'TRUE' || settings.GuidesAutoOpen === true;   // ❓ ws-4 (default off)
  selectedSound = settings.AmbientSound || 'none';
  renderSoundOptions();
  applyInterfaceSettings(settings);
  UISound.applySettings(settings);
}

/* ---------- SOUND CONTROLS (apply instantly; saved with Save Settings) ---------- */
function previewSound(fromSlider){
  const on = document.getElementById('toggle-sound').checked;
  const vol = Number(document.getElementById('sound-volume').value);
  document.getElementById('sound-volume-val').textContent = vol + '%';
  UISound.set(on, vol / 100);
  if(!fromSlider && on) UISound.play('pop');
}
let testTick = 0;
function testSound(){
  const list = ['success', 'pop', 'whoosh', 'drop', 'unlock'];
  UISound.play(list[testTick++ % list.length]);
}

function saveAllSettings(btn){
  // Theme/InterfaceColor are intentionally NOT included here anymore —
  // editing those now lives on the Dashboard (Landing.html), so this save
  // never overwrites them with stale values from this page.
  const payload = {
    ScreenTimeLockEnabled: document.getElementById('toggle-lock').checked ? 'TRUE' : 'FALSE',
    'ScreenTime_4-5': document.getElementById('time-4-5').value,
    'ScreenTime_6-7': document.getElementById('time-6-7').value,
    'ScreenTime_8-9': document.getElementById('time-8-9').value,
    'ScreenTime_10+': document.getElementById('time-10plus').value,
    AmbientSound: selectedSound,
    Theme: familyLook,
    SoundEnabled: document.getElementById('toggle-sound').checked ? 'TRUE' : 'FALSE',
    SoundVolume: document.getElementById('sound-volume').value,
    MazeEffects: document.getElementById('toggle-maze-fx').checked ? 'TRUE' : 'FALSE',
    GuidesAutoOpen: document.getElementById('toggle-guide-auto').checked ? 'TRUE' : 'FALSE'   // ❓ ws-4
  };
  try { localStorage.setItem('sp_guide_auto', payload.GuidesAutoOpen === 'TRUE' ? '1' : '0'); } catch(e){}   // this device follows at once
  const msg = document.getElementById('settings-save-msg');
  msg.classList.add('hidden');
  UI.call('saveSettings', [payload], {btn: btn, kind: 'save', text: 'Saving settings'}).then(()=>{
    msg.classList.remove('hidden');
    UI.rememberTheme('', familyLook);
    UISound.play('success');
    UI.toast('Settings saved!');
  }).catch(()=>{});
}

function buildPinPad(){
  const pad = document.getElementById('pin-pad');
  pad.innerHTML = '';
  ['1','2','3','4','5','6','7','8','9'].forEach(n=>{
    const b = document.createElement('button');
    b.className = 'pin-key';
    b.textContent = n;
    b.onclick = ()=>pressDigit(n);
    pad.appendChild(b);
  });
  const clearBtn = document.createElement('button');
  clearBtn.className = 'pin-key wide';
  clearBtn.textContent = 'Clear';
  clearBtn.onclick = ()=>{ enteredPin=''; renderDots(); };
  pad.appendChild(clearBtn);

  const zeroBtn = document.createElement('button');
  zeroBtn.className = 'pin-key';
  zeroBtn.textContent = '0';
  zeroBtn.onclick = ()=>pressDigit('0');
  pad.appendChild(zeroBtn);

  const backBtn = document.createElement('button');
  backBtn.className = 'pin-key wide';
  backBtn.textContent = '⌫';
  backBtn.onclick = ()=>{ enteredPin = enteredPin.slice(0,-1); renderDots(); };
  pad.appendChild(backBtn);
}
function pressDigit(d){
  if(enteredPin.length>=8) return;
  enteredPin += d;
  renderDots();
  if(enteredPin.length>=4) tryUnlock();
}
function renderDots(){
  const box = document.getElementById('pin-dots');
  box.innerHTML = '';
  const shown = Math.max(enteredPin.length, 4);
  for(let i=0;i<shown;i++){
    const d = document.createElement('div');
    d.className = 'pin-dot'+(i<enteredPin.length?' filled':'');
    box.appendChild(d);
  }
}
let pinCheckSeq = 0;
function tryUnlock(){
  if(unlocked) return;
  const seq = ++pinCheckSeq;
  const errBox = document.getElementById('pin-error');
  errBox.innerHTML = '<span class="ui-spin">🔑</span> Checking…';
  google.script.run.withSuccessHandler(ok=>{
    if(seq !== pinCheckSeq && !ok) return; // a newer digit is already being checked
    if(ok){
      unlocked = true;
      errBox.textContent = '';
      UISound.play('unlock');
      document.getElementById('screen-pin').classList.add('hidden');
      startLoadingScreen('Loading your admin tools…');
      adminPin = enteredPin;
      loadAdmin(); loadFeedback(); offLoad();
    } else if(enteredPin.length>=8){
      UISound.play('error');
      errBox.textContent = 'Wrong PIN, try again.';
      enteredPin=''; renderDots();
    } else {
      errBox.textContent = '';
    }
  }).withFailureHandler(()=>{
    errBox.textContent = 'Could not check the PIN — try again.';
  }).verifyAdminPin(enteredPin);
}

// Keyboard / number pad typing on the PIN screen (Num Lock on or off).
UI.pinKeyboard({
  isActive: () => !unlocked && !document.getElementById('screen-pin').classList.contains('hidden'),
  padEl: () => document.getElementById('pin-pad'),
  onDigit: d => pressDigit(d),
  onBack: () => { enteredPin = enteredPin.slice(0,-1); renderDots(); },
  onClear: () => { enteredPin = ''; renderDots(); },
  onEnter: () => { if(enteredPin.length >= 4) tryUnlock(); }
});

/* ---------- FEEDBACK (from the 💬 Tell us! button) ---------- */
let adminPin = '', FB = {rows: [], kinds: {}, moods: [], filter: 'open'};
const FB_ST = {new: '📬 new', seen: '👀 seen', fixed: '✅ fixed'};
function loadFeedback(){
  google.script.run.withSuccessHandler(d => { FB.rows = d.rows || []; FB.kinds = d.kinds || {}; FB.moods = d.moods || []; renderFeedback(); })
    .withFailureHandler(e => { document.getElementById('fb-list').innerHTML = '<div class="fb-empty">Could not load feedback — ' + UI.esc((e && e.message) || 'try again') + '</div>'; })
    .getFeedbackList(adminPin);
}
function renderFeedback(){
  const open = FB.rows.filter(r => r.status !== 'fixed');
  document.getElementById('fb-count').textContent = open.length + ' open · ' + FB.rows.length + ' total';
  const F = [['open', 'Open (' + open.length + ')'], ['new', '📬 New'], ['seen', '👀 Seen'], ['fixed', '✅ Fixed'], ['all', 'All']];
  const fl = document.getElementById('fb-filters');
  fl.innerHTML = F.map(f => '<button data-f="' + f[0] + '" class="' + (FB.filter === f[0] ? 'on' : '') + '">' + f[1] + '</button>').join('');
  fl.querySelectorAll('button').forEach(b => b.onclick = () => { FB.filter = b.dataset.f; renderFeedback(); });
  const rows = FB.rows.filter(r => FB.filter === 'all' ? true : FB.filter === 'open' ? r.status !== 'fixed' : (r.status || 'new') === FB.filter);
  const list = document.getElementById('fb-list');
  if(!rows.length){ list.innerHTML = '<div class="fb-empty">' + (FB.rows.length ? 'Nothing here.' : 'No messages yet. Kids (and grown-ups) can tap 💬 Tell us! on any page.') + '</div>'; return; }
  list.innerHTML = rows.slice(0, 80).map(r => '<div class="fb-item ' + UI.esc(r.status || 'new') + '" data-id="' + UI.esc(r.id) + '">' +
    '<div class="fb-top"><span class="k">' + UI.esc(FB.kinds[r.kind] || r.kind) + '</span>' + (r.mood !== '' ? '<span>' + (FB.moods[Number(r.mood)] || '') + '</span>' : '') +
    '<span>' + UI.esc(r.player || 'grown-up') + '</span><span class="meta">' + UI.esc(r.when) + ' · ' + UI.esc([r.page, r.game, r.level].filter(Boolean).join(' / ')) + '</span>' +
    '<span class="st">' + (FB_ST[r.status] || UI.esc(r.status)) + '</span></div>' +
    (r.text ? '<div class="fb-text">' + UI.esc(r.text) + '</div>' : '') + '<div class="fb-dev">📱 ' + UI.esc(r.device) + '</div>' +
    '<div class="fb-acts"><textarea placeholder="Reply to ' + UI.esc(r.player || 'them') + ' (optional)">' + UI.esc(r.reply || '') + '</textarea>' +
    ['new', 'seen', 'fixed'].map(st => '<button data-st="' + st + '" class="' + ((r.status || 'new') === st ? 'on' : '') + '">' + FB_ST[st] + '</button>').join('') + '</div></div>').join('');
  list.querySelectorAll('.fb-item').forEach(it => it.querySelectorAll('[data-st]').forEach(b => b.onclick = () => {
    const id = it.dataset.id, reply = it.querySelector('textarea').value;
    UI.call('setFeedbackStatus', [adminPin, id, b.dataset.st, reply], {btn: b, kind: 'save'}).then(res => {
      const r = FB.rows.find(x => x.id === id); if(r){ r.status = res.status; r.reply = res.reply; r.updated = res.updated; }
      UI.toast(res.status === 'fixed' ? '✅ Marked fixed' : 'Saved'); renderFeedback();
    }).catch(() => {});
  }));
}

/* ---------- ADMIN DATA: one call for players + settings ---------- */
function loadAdmin(){
  google.script.run
    .withSuccessHandler(d=>{ ADMIN_SETTINGS = d.settings || {}; fillSettingsForm(d.settings); onPlayers(d.players || []); markLoaded(); })
    .withFailureHandler(()=>{ fillSettingsForm({}); onPlayers([]); markLoaded(); UI.toast('Could not load everything — try reopening Admin', 'err'); })
    .getAdminData();
}

let allPlayers = [], ADMIN_SETTINGS = {};
function onPlayers(players){
  allPlayers = players;
  renderPlayerList();
}
// A player forgot the PIN that protects their avatar and room: clear it (needs the grown-up PIN typed to open Admin).
function resetPin(name, btn){
  UI.confirm({icon: '🔑', title: 'Reset ' + name + '\'s PIN?', body: name + ' will choose a new PIN the next time they change their avatar.', okText: 'Reset PIN', cancelText: 'Cancel'}).then(ok => {
    if(!ok) return;
    UI.call('resetPlayerPin', [name, enteredPin], {btn, kind: 'save', text: 'Resetting'}).then(() => { UISound.play('success'); UI.toast('🔑 ' + name + ' can choose a new PIN now'); }).catch(() => {});
  });
}
// 🎂 Birthdays: Settings Birthday_<Name> = 'MM-DD' (no year). The Dashboard shows a banner on the day and a heads-up 7 days before.
const BDAY_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function bdayLabel(v){ const m = /^(\d{2})-(\d{2})$/.exec(v || ''); return m ? BDAY_MONTHS[+m[1] - 1] + ' ' + (+m[2]) : ''; }
function editBirthday(name, row){
  const open = row.nextElementSibling && row.nextElementSibling.classList.contains('bday-edit');
  document.querySelectorAll('.bday-edit').forEach(e => e.remove());
  if(open) return;
  const cur = /^(\d{2})-(\d{2})$/.exec(String(ADMIN_SETTINGS['Birthday_' + name] || '')) || [0, '', ''];
  const box = document.createElement('div');
  box.className = 'bday-edit';
  box.innerHTML = '<span>🎂 ' + UI.esc(name) + '\'s birthday</span>' +
    '<select class="bm"><option value="">Month</option>' + BDAY_MONTHS.map((m, i) => '<option value="' + String(i + 1).padStart(2, '0') + '"' + (cur[1] === String(i + 1).padStart(2, '0') ? ' selected' : '') + '>' + m + '</option>').join('') + '</select>' +
    '<select class="bd"><option value="">Day</option>' + Array.from({length: 31}, (_, i) => '<option value="' + String(i + 1).padStart(2, '0') + '"' + (cur[2] === String(i + 1).padStart(2, '0') ? ' selected' : '') + '>' + (i + 1) + '</option>').join('') + '</select>' +
    '<button class="mini-btn go">Save</button>' + (cur[1] ? '<button class="mini-btn danger">Clear</button>' : '');
  row.after(box);
  const save = (v, btn) => UI.call('savePlayerBirthday', [name, v, enteredPin], {btn, kind: 'birthday', text: v ? 'Saving the birthday' : 'Clearing the birthday'}).then(r => {
    ADMIN_SETTINGS['Birthday_' + name] = r.birthday; UISound.play('success'); UI.toast(r.birthday ? '🎂 ' + name + '\'s birthday is ' + bdayLabel(r.birthday) : '🎂 Birthday cleared'); renderPlayerList();
  }).catch(() => {});
  const btns = box.querySelectorAll('button');
  btns[0].onclick = () => { const m = box.querySelector('.bm').value, d = box.querySelector('.bd').value; if(!m || !d){ UI.toast('Pick a month and a day', 'err'); return; } save(m + '-' + d, btns[0]); };
  if(btns[1]) btns[1].onclick = () => save('', btns[1]);
}
function renderPlayerList(){
  const box = document.getElementById('player-list');
  box.innerHTML = '';
  if(allPlayers.length===0){ box.innerHTML = '<p class="roadmap-note">No players yet — add them from the Dashboard.</p>'; return; }
  allPlayers.forEach(p=>{
    const active = p.Active === true || p.Active === 'TRUE';
    const row = document.createElement('div');
    row.className = 'player-row' + (active?'':' inactive');
    row.innerHTML = '<div class="pinfo">'+UI.esc(p.Name)+'<span class="page-tag">'+UI.esc(p.Age||'')+'</span></div>';
    const btns = document.createElement('div');
    btns.className = 'row-btns';
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mini-btn' + (active ? '' : ' go');
    toggleBtn.textContent = active ? 'Deactivate' : 'Reactivate';
    toggleBtn.onclick = ()=>toggleActive(p.Name, !active, toggleBtn);
    const pinBtn = document.createElement('button');
    pinBtn.className = 'mini-btn';
    pinBtn.textContent = '🔑 Reset PIN';
    pinBtn.title = 'Clears this player\'s avatar/room PIN so they can choose a new one';
    pinBtn.onclick = ()=>resetPin(p.Name, pinBtn);
    btns.appendChild(pinBtn);
    const bday = String(ADMIN_SETTINGS['Birthday_' + p.Name] || '');
    const bdayBtn = document.createElement('button');
    bdayBtn.className = 'mini-btn';
    bdayBtn.textContent = '🎂 ' + (bday ? bdayLabel(bday) : 'Birthday');
    bdayBtn.title = 'Set the birthday — the Dashboard shows a birthday banner on the day';
    bdayBtn.onclick = ()=>editBirthday(p.Name, row);
    btns.appendChild(bdayBtn);
    const removeBtn = document.createElement('button');
    removeBtn.className = 'mini-btn danger';
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = ()=>removePlayer(p.Name, removeBtn);
    btns.appendChild(toggleBtn);
    btns.appendChild(removeBtn);
    row.appendChild(btns);
    box.appendChild(row);
  });
}
// Only the changed player is updated on screen — no full reload of the list.
function toggleActive(name, makeActive, btn){
  const fn = makeActive ? 'reactivateProfile' : 'deactivateProfile';
  UI.call(fn, [name], {btn: btn, kind: 'update', text: makeActive ? 'Reactivating' : 'Deactivating'}).then(()=>{
    const p = allPlayers.find(x => x.Name === name);
    if(p) p.Active = makeActive;
    renderPlayerList();
    UI.toast(name + (makeActive ? ' is back in the game' : ' is now hidden from the Dashboard'));
  }).catch(()=>{});
}
function removePlayer(name, btn){
  UI.confirm({title: 'Remove ' + name + '?', body: 'This cannot be undone. Their saved progress stays in the sheet.', danger: true, okText: 'Remove', icon: '🗑️'})
    .then(yes=>{
      if(!yes) return;
      UI.call('removeProfile', [name], {btn: btn, kind: 'remove'}).then(()=>{
        allPlayers = allPlayers.filter(x => x.Name !== name);
        renderPlayerList();
        UI.toast(name + ' was removed');
      }).catch(()=>{});
    });
}

function changePin(btn){
  const val = document.getElementById('new-pin').value.trim();
  const msg = document.getElementById('pin-save-msg');
  msg.classList.add('hidden');
  if(!/^\d{4,8}$/.test(val)){ UISound.play('error'); UI.toast('PIN must be 4 to 8 digits', 'err'); return; }
  UI.call('setAdminPin', [val], {btn: btn, kind: 'pin', text: 'Saving PIN'}).then(()=>{
    document.getElementById('new-pin').value=''; msg.classList.remove('hidden');
    UISound.play('success');
    UI.toast('New PIN saved');
  }).catch(()=>{});
}

buildPinPad();
renderDots();
google.script.run.withSuccessHandler(s=>{ applyInterfaceSettings(s); UISound.applySettings(s); }).withFailureHandler(()=>{}).getSettings();

/* ---------- 📲 OFFLINE APP (off-2): family key + devices ---------- */
// The /exec link of this app is encrypted IN THIS BROWSER with the family key (PBKDF2 → AES-GCM); only the
// encrypted copy + a hash of the key go to the server. The offline app ships the encrypted copy, so only a device
// that knows the key can find the family's Sheet. Nothing private goes into the public app.
function offB64(buf){ return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))); }
async function offEncrypt(key, url){
  const norm = String(key).trim().toLowerCase().replace(/\s+/g, ' ');
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), iter = 150000;
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(norm), 'PBKDF2', false, ['deriveKey']);
  const k = await crypto.subtle.deriveKey({name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256'}, base, {name: 'AES-GCM', length: 256}, false, ['encrypt']);
  const ct = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, k, new TextEncoder().encode(JSON.stringify({u: url})));
  return {v: 1, salt: offB64(salt), iv: offB64(iv), ct: offB64(ct), iter};
}
function offLoad(){
  google.script.run.withSuccessHandler(d => {
    document.getElementById('off-state').textContent = d.setup ? '✅ family key set' : '— no family key yet';
    const box = document.getElementById('off-devices');
    box.innerHTML = (d.devices || []).length ? (d.devices.map(x => '<div class="off-dev"><b>' + UI.esc(x.kind || 'device') + '</b><span>' + UI.esc(x.device) + '</span><span>app ' + UI.esc(x.ver || '?') + '</span><span>last sync ' + UI.esc(x.last) + '</span><span>' + (x.sent || 0) + ' results sent</span></div>').join('') + (d.errors ? '<p class="fb-note">⚠️ ' + d.errors + ' results could not be added — see the tab "Offline Sync Log".</p>' : '')) : '<p class="fb-note">No device has synced yet.</p>';
  }).withFailureHandler(() => {}).getOfflineInfo(adminPin);
}
async function offSave(btn){
  const a = document.getElementById('off-key').value, b = document.getElementById('off-key2').value, msg = document.getElementById('off-msg');
  if(String(a).trim().toLowerCase() !== String(b).trim().toLowerCase()){ msg.textContent = '✋ The two keys are not the same.'; return; }
  if(String(a).trim().split(/\s+/).length < 3){ msg.textContent = '✋ Pick 3 or more words — easy to type, hard to guess.'; return; }
  let link;
  try { UI.busy(btn, 'save', 'Locking…'); link = await offEncrypt(a, WEBAPP_URL); } catch(e){ UI.idle(btn); msg.textContent = 'This browser could not lock the key: ' + e.message; return; }
  UI.idle(btn);
  UI.call('saveOfflineKey', [adminPin, a, link], {btn, kind: 'save'}).then(r => {
    document.getElementById('off-key').value = document.getElementById('off-key2').value = '';
    msg.innerHTML = '✅ Family key saved.' + (r.drive ? ' The locked link is in Drive as <b>Offline Link.json</b> — ask Claude to <b>publish the offline app</b> so new devices can use the key.' : ' ⚠️ Could not write <b>Offline Link.json</b> to Drive — run rebuildFeedbackLog once from the editor (Drive permission), then save the key again.') + ' Devices that had the old key ask for the new one.';
    offLoad();
  }).catch(() => {});
}
