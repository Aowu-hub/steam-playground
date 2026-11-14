/* STEAM Playground 📲 offline app — the "server" that runs ON THE DEVICE (a Web Worker).
   Built by Test Harness/offline/build.js: the real Code.gs (+ the other .gs files) is pasted below
   into STEAM_GS.make(...), and runs here against an on-device "Sheet" (tabs kept in IndexedDB).
   Every google.script.run call from a page arrives here as a message, runs the real server
   function, and answers like Apps Script would. Writes go into a waiting list that is synced to
   the real Google Sheet when online (OfflineSync.gs on Apps Script replays them).
   Same idea as the harness gasmock.js. Never edit the built copy — edit this source + rebuild. */
'use strict';
importScripts('version.js');
self.STEAM_GS = { ver: self.STEAM_VER, make: function (SpreadsheetApp, HtmlService, ContentService, ScriptApp, CacheService, LockService, PropertiesService, UrlFetchApp, DriveApp, MimeType, Logger, Session, Utilities, console, Date, __hex) {
/* ===== Code.gs ===== */
// Code.gs
/**
 * STEAM Playground — Data Center + Router
 * Bind this script to: Games Data Center
 * the family Sheet (its ID is in Script Properties → SHEET_ID)
 *
 * SETUP: run setupDataCenter() once from the Apps Script editor
 * (select it in the function dropdown, click Run, approve permissions).
 * It's safe to run again later — it won't duplicate rows.
 */

// 🔒 off-8: the Sheet ID is kept in Script Properties, never in the code
// (Apps Script → ⚙️ Project Settings → Script properties → SHEET_ID = the long ID from the Sheet's address).
const SHEET_ID = 'on-this-device';

// Opening the spreadsheet is the slowest step of every server call, so it
// happens at most ONCE per request (each google.script.run call is its own
// fresh execution, so this memo never goes stale between calls).
let SS_MEMO_ = null;
function ss_() {
  if (!SS_MEMO_) {
    if (!SHEET_ID) throw new Error('🔧 Setup needed: add the Script property SHEET_ID (Apps Script → ⚙️ Project Settings → Script properties).');
    SS_MEMO_ = SpreadsheetApp.openById(SHEET_ID);
  }
  return SS_MEMO_;
}

// Pulls a shared HTML file (UiKit.html) into a page. Used from each page's
// head with a raw print scriptlet calling include('UiKit').
// 🚪 AS-1 one door: include('AvatarKit') also brings the files listed here (same order), so no page has to change when the avatar family grows.
// Keep each list on ONE line — the test harness (gasmock.js) and the 📲 offline builder (build.js) read these two lines from this file.
const INCLUDE_ALSO_ = {AvatarKit: ['AvatarActing']};
const INCLUDE_GROUPS_ = {avatar: ['BallSkins', 'AvatarKit']};
// 📦 size-1 (2026-11-13): big DATA files are NOT in this project (Apps Script refuses to save a project over ≈ 10.45 MB).
// They are published to the family site as data/<Name>.<hash>.js|css by GitHub (steam-source tools/remote.mjs) and include()
// writes a <script src> / <link> to them instead (+ a jsDelivr copy if the site doesn't answer). Pages don't change.
// On Drive the files stay in the main folder like before; steam-source keeps them in remote/. Keep the list on ONE line.
const REMOTE_INCLUDES_ = {WisArt1: 'js:4b4a774012', WisArt2: 'js:b36f063830', WisArt3: 'js:76e938e34a', WisArt4: 'js:ffdc9f7bf4', WisCards: 'js:d0555d254f', WisCards2: 'js:15d0f6d094', WisCards3: 'js:a650820410', WordExtra: 'js:83d16141bb', WordMeanings: 'js:34eed0f5c2', FlagFont: 'css:d4e84f0db9', WordList: 'js:6acb75dfdf'};   // 📦 size-1: written by tools/remote.mjs — ONE line
const REMOTE_BASE_ = 'https://aowu-hub.github.io/steam-playground/data/', REMOTE_CDN_ = 'https://cdn.jsdelivr.net/gh/aowu-hub/steam-playground@main/data/';
function remoteFile_(n) { const v = String(REMOTE_INCLUDES_[n] || ''), i = v.indexOf(':'); return i > 0 ? n + '.' + v.slice(i + 1) + '.' + v.slice(0, i) : ''; }
function remoteTag_(n) {
  const f = remoteFile_(n), a = REMOTE_BASE_ + f, b = REMOTE_CDN_ + f;
  if (/\.css$/.test(f)) return '<link rel="stylesheet" href="' + a + '" onerror="this.onerror=null;this.href=\'' + b + '\'">';
  return '<script charset="utf-8" src="' + a + '"></script>\n<script>if(!(window.SP_DATA||{})[' + JSON.stringify(n) + '])document.write(\'<script charset="utf-8" src="' + b + '"><\\/script>\');</script>';
}
// on-demand data (WisStock, WisDeck pictures): the file's code when it is in the project (📲 offline app), else {src, alt} for the page to load
function remoteBody_(n) {
  try { return HtmlService.createHtmlOutputFromFile(n).getContent().replace(/^[\s\S]*?<script>/, '').replace(/<\/script>[\s\S]*$/, ''); }
  catch (e) { const f = remoteFile_(n); return f ? { src: REMOTE_BASE_ + f, alt: REMOTE_CDN_ + f } : ''; }
}
function include(name) {
  return [name].concat(INCLUDE_ALSO_[name] || []).map(n => REMOTE_INCLUDES_[n] ? remoteTag_(n) : HtmlService.createHtmlOutputFromFile(n).getContent()).join('\n');
}
function includeGroup(group) { return (INCLUDE_GROUPS_[group] || []).map(include).join('\n'); }

/* ============ ONE-TIME SETUP ============ */
function setupDataCenter() {
  const ss = ss_();

  setupGamesTab(ss);
  setupLevelsTab(ss);
  setupProfilesTab(ss);
  setupProgressTab(ss);
  setupSettingsTab(ss);
  ensureProfilesSchema_(ss.getSheetByName('Profiles'));

  // remove the default blank "Sheet1" if it's still empty and unused
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0) ss.deleteSheet(blank);
}

function setupGamesTab(ss) {
  let sh = ss.getSheetByName('Games');
  if (!sh) sh = ss.insertSheet('Games');
  if (sh.getLastRow() > 0) return; // already seeded

  const headers = ['GameID', 'GameName', 'SkillLevel', 'STEAMFocus', 'Status', 'PageRoute', 'Icon', 'Description'];
  const rows = [
    ['color-match', 'Color Match', '4-5, non-reader', 'Colors / Sorting', 'Live', 'minigames', '🎨', 'Tap the shape matching the color shown'],
    ['count-match', 'Count & Match', '4-5, non-reader', 'Counting / Math', 'Live', 'minigames', '🔢', 'Tap the fruit group matching the number shown'],
    ['code-robot', 'Code the Robot', '4-5, non-reader', 'Coding / Sequencing', 'Live', 'minigames', '🤖', 'Plan arrow moves to send the robot to the star'],
    ['stacking-sim', 'Shaped Box Stacking Sim', 'mixed / whole family', 'Mixed', 'Live', 'stacking', '🏗️', 'Drag and stack boxes without toppling; series unlock over time'],
  ];

  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#2CA6DE').setFontColor('#FFFFFF');
  sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, headers.length);
}

function setupLevelsTab(ss) {
  let sh = ss.getSheetByName('Levels');
  if (!sh) sh = ss.insertSheet('Levels');
  if (sh.getLastRow() > 0) return;

  const headers = ['GameID', 'SeriesID', 'SeriesName', 'LevelID', 'LevelName', 'PieceCount', 'UnlockOrder', 'Status'];
  const rows = [
    ['stacking-sim', 'building', 'Building Series', 1, 'Cozy Cottage', 3, 1, 'Live'],
    ['stacking-sim', 'building', 'Building Series', 2, 'Clock Tower', 5, 2, 'Live'],
    ['stacking-sim', 'building', 'Building Series', 3, 'Sky Tower', 7, 3, 'Live'],
    ['stacking-sim', 'vehicle', 'Vehicle Series', '', '', '', '', 'Coming Soon'],
    ['stacking-sim', 'animal', 'Animal Series', '', '', '', '', 'Coming Soon'],
    ['stacking-sim', 'insect', 'Insect Series', '', '', '', '', 'Coming Soon'],
    ['stacking-sim', 'dino', 'Dinosaur Series', '', '', '', '', 'Coming Soon'],
    ['stacking-sim', 'castle', 'Fantasy Castle Series', '', '', '', '', 'Coming Soon'],
  ];

  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#2CA6DE').setFontColor('#FFFFFF');
  sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, headers.length);
}

function setupProfilesTab(ss) {
  let sh = ss.getSheetByName('Profiles');
  if (!sh) sh = ss.insertSheet('Profiles');
  if (sh.getLastRow() > 0) return;

  const headers = ['Name', 'Age', 'CreatedDate', 'Active'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#2CA6DE').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, headers.length);
}

function setupProgressTab(ss) {
  let sh = ss.getSheetByName('Progress');
  if (!sh) sh = ss.insertSheet('Progress');
  if (sh.getLastRow() > 0) return;

  const headers = ['Name', 'GameID', 'SeriesID', 'UnlockedLevel', 'Tokens', 'LastPlayed'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#2CA6DE').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, headers.length);
}

function setupSettingsTab(ss) {
  let sh = ss.getSheetByName('Settings');
  if (!sh) sh = ss.insertSheet('Settings');
  if (sh.getLastRow() > 0) return;

  const headers = ['Key', 'Value'];
  const rows = [
    ['AdminPIN', '1234'],
    ['ScreenTime_4-5', '15'],
    ['ScreenTime_6-7', '20'],
    ['ScreenTime_8-9', '30'],
    ['ScreenTime_10+', '45'],
    ['ScreenTimeLockEnabled', 'TRUE'],
    ['Theme', 'classic'],
    ['InterfaceColor', '#C97B5D'],
    ['AmbientSound', 'none'],
    ['SoundEnabled', 'TRUE'],
    ['SoundVolume', '60'],
    ['MazeEffects', 'TRUE'],
  ];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#2CA6DE').setFontColor('#FFFFFF');
  sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, headers.length);
}

// Migrates an older 2-column Profiles tab (Name, CreatedDate) to the current
// 4-column schema (Name, Age, CreatedDate, Active) in place. Safe to call on
// every request — it's a no-op once the sheet already has the new headers.
function ensureProfilesSchema_(sh) {
  const width = Math.max(sh.getLastColumn(), 1);
  const headers = sh.getRange(1, 1, 1, width).getValues()[0];
  if (headers[0] === 'Name' && headers[1] === 'Age' && headers[2] === 'CreatedDate' && headers[3] === 'Active') return;

  const lastRow = sh.getLastRow();
  const numRows = Math.max(lastRow - 1, 0);
  let existing = [];
  if (numRows > 0) {
    // Old schema was [Name, CreatedDate]; only read the columns we know exist.
    const oldWidth = Math.min(width, 2);
    existing = sh.getRange(2, 1, numRows, oldWidth).getValues();
  }
  sh.getRange(1, 1, 1, 4).setValues([['Name', 'Age', 'CreatedDate', 'Active']]).setFontWeight('bold').setBackground('#2CA6DE').setFontColor('#FFFFFF');
  if (numRows > 0) {
    const rebuilt = existing.map(r => [r[0], '', r[1] || new Date(), true]);
    sh.getRange(2, 1, numRows, 4).setValues(rebuilt);
  }
  sh.setFrozenRows(1);
}

/* ============ ROUTER ============ */
function doGet(e) {
  if (e && e.parameter && e.parameter.api) return poseApi_(e);   // 📷 Pose Party camera door API (PoseParty.gs)
  const page = (e && e.parameter && e.parameter.page) || 'home';
  const map = {
    home: 'Landing',       // Landing.html is now the player dashboard
    gameroom: 'Gameroom',  // Gameroom.html is the old tile-grid game picker
    minigames: 'SteamPlayground',
    stacking: 'StackingSim',
    setup: 'Setup',
    achievements: 'Achievements',
    maze: 'Maze',
    robot: 'CodeRobot',
    checkers: 'Checkers',
    chess: 'Chess',
    pinball: 'Pinball',
    hopper: 'Hopper',
    turbo: 'Turbo',
    memory: 'Memory',
    mathquest: 'MathQuest',
    doubleup: 'DoubleUp',
    blockdrop: 'BlockDrop',
    popblocks: 'PopBlocks',
    numbergrid: 'NumberGrid',
    numberboard: 'NumberBoard',
    wordboard: 'WordBoard',
    sweetswap: 'SweetSwap',
    beatcorner: 'BeatCorner',
    slabrall: 'SlaBrall',
    blasoff: 'BlasOff',   // ⚽ BlasOff: soccer with your avatar (plan BlasOff) — keep on its own line
    brawlbuddies: 'BrawlBuddies',   // 🥊 Brawl Buddies (plan 11i)
    alignext: 'Alignext',
    soulbopper: 'SoulBopper',   // 👻💣 Soul Bopper (plan 11l)   // 🔴 Alignext: Drop + ❌⭕ Omnifile (plan 11x)
    snakize: 'Snakize',
    polyplot: 'Polyplot',

    wisdeck: 'WisDeck',   // 🃏 WisDeck: learn-by-quiz card game (plan 11z)
    eyesbrain: 'EyesBrainRiot',   // 👀🧠 Eyes Brain Riot: number memory (plan 11k) — keep on its own line (another route's comment once swallowed it → Dashboard)
    georead: 'GeoRead',   // 🔤 GeoRead: phonics with letter boxes (plan GeoRead) — keep on its own line
    geoscout: 'GeoScout',   // 🔢 GeoScout: number blocks + balance scale (Geometric · Scale · Count) — keep on its own line
    pokadif: 'Pokadif',   // 🔍 Pokadif: poke the difference (pk-1) — keep on its own line
    pyradive: 'PyraDive',   // 🔥 PyraDive: Drive · Dink · Dunk (🏐 PyraSpike volleyball, pd-1) — keep on its own line
    artifactory: 'Artifactory',   // 🏭 Artifactory: the maker app (server in ArtifactoryCode.gs) — keep on its own line
    tdstories: 'TDStories',   // 🏰 TD-Stories: tower-defence story books (+ 🧬 SkillKit shared library) — keep on its own line
    sciencetory: 'Sciencetory',   // 🔬 Sciencetory: the science lab for your crafted things (server in SciencetoryCode.gs, sc-1) — keep on its own line
    workshop: 'Artifactory',   // 🔨 old Workshop address → Artifactory's Furniture Workshop area (af-1)
    room: 'Room',
    collection: 'Collection',
    posecam: 'PoseCam',
    poseparty: 'PoseLaunch',   // 📷 Pose Party: the card opens the launch page → GitHub camera door (PoseParty.gs)    // 📷 Pose Party camera test (plan 11j S1; saves via PoseTest.gs)
  };
  const file = map[page] || 'Landing';
  // Every page is served as a template (not a plain HtmlOutput) so it can
  // receive the absolute deployed web app URL. In-app navigation MUST use
  // this absolute URL rather than a relative "?page=..." href, since a
  // relative link resolves against the googleusercontent.com content-serving
  // origin the page is actually loaded from, not the /exec URL, and
  // silently returns a blank page.
  const template = HtmlService.createTemplateFromFile(file);
  template.webAppUrl = ScriptApp.getService().getUrl();
  // The active player is carried between pages as a URL param (?player=Name)
  // rather than in localStorage/window.storage, so it's available server-side
  // on every page load and works the same on a shared tablet with no login.
  template.player = (e && e.parameter && e.parameter.player) || '';
  // Same reasoning for the running screen-time session: sessionStart (epoch
  // ms, set client-side the moment "Let's Play" is clicked) and durationMin
  // (looked up by the player's age at that moment) ride along on every link
  // within a play session so Gameroom can rebuild the countdown on each
  // page load without any client-side storage.
  template.sessionStart = (e && e.parameter && e.parameter.sessionStart) || '';
  template.durationMin = (e && e.parameter && e.parameter.durationMin) || '';
  // Mini games: open one game straight away (?game=color-match ...).
  template.game = (e && e.parameter && e.parameter.game) || '';
  template.mode = (e && e.parameter && e.parameter.mode) || '';   // ✨ modes-1: open a game straight in one way to play (after the player pick)
  template.page = page;   // which page this is (the 💬 Tell us button sends it with feedback)
  return template.evaluate()
    .setTitle('STEAM Playground')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');   // 👆 nz-1: no zoom in games (Aowu 2026-11-13)
}

/* ============ DATA ACCESS (called from HTML via google.script.run) ============ */
// google.script.run's client-side deserializer cannot reliably handle a raw
// Date object anywhere in the returned payload (it silently comes back as
// null, or crashes the client runtime for larger payloads). Every place
// below that turns Sheet rows into plain objects for the client routes
// through this helper so no Date ever crosses the bridge unconverted.
function rowsToObjects_(headers, rows) {
  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      const v = row[i];
      obj[h] = (v instanceof Date) ? v.toISOString() : v;
    });
    return obj;
  });
}

// Speed (2026-11-03): the Games and Profiles tabs are read once per request, not 5–17 times.
let GAMES_MEMO_ = null, PROFILES_MEMO_ = null;
function getGames() {
  if (GAMES_MEMO_ && GAMES_MEMO_.ss === ss_()) return GAMES_MEMO_.rows.map(o => Object.assign({}, o));
  const sh = ss_().getSheetByName('Games');
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  const rows = rowsToObjects_(headers, values);
  GAMES_MEMO_ = { ss: ss_(), rows: rows };
  return rows.map(o => Object.assign({}, o));
}

function getLevels(gameId) {
  const sh = ss_().getSheetByName('Levels');
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  return rowsToObjects_(headers, values).filter(row => row.GameID === gameId);
}

function getOrCreateProfile(name) {
  const sh = ss_().getSheetByName('Profiles');
  ensureProfilesSchema_(sh);
  PROFILES_MEMO_ = null;   /* this function may change the tab */
  const values = sh.getDataRange().getValues();
  const exists = values.some(row => row[0] === name);
  if (!exists) {
    sh.appendRow([name, '', new Date(), true]);
  }
  return { name: name };
}

function listProfiles() {
  const sh = ss_().getSheetByName('Profiles');
  ensureProfilesSchema_(sh);
  PROFILES_MEMO_ = null;   /* this function may change the tab */
  const values = sh.getDataRange().getValues();
  values.shift();
  return values.map(row => row[0]).filter(String);
}

/* ============ PLAYERS (added only from the Landing dashboard) ============ */
// Players are only ever CREATED from the Landing dashboard's player
// management UI (item 1) — the individual game pages only let you SELECT
// from the players already created here.
function createProfile(name, age) {
  const sh = ss_().getSheetByName('Profiles');
  ensureProfilesSchema_(sh);
  PROFILES_MEMO_ = null;   /* this function may change the tab */
  const values = sh.getDataRange().getValues();
  const exists = values.some(row => row[0] === name);
  if (exists) {
    throw new Error('A player named "' + name + '" already exists.');
  }
  sh.appendRow([name, '', new Date(), true]);
  // Age groups like "4-5" look like dates to Sheets, so the cell is set to plain text first.
  if (age) sh.getRange(sh.getLastRow(), 2).setNumberFormat('@').setValue(String(age));
  return { name: name, age: age || '' };
}

// Full player list with Age/Active, for the dashboard's player manager and
// for each game's select-only login screen (which filters to Active===true).
function listProfilesFull() {
  if (PROFILES_MEMO_ && PROFILES_MEMO_.ss === ss_()) return PROFILES_MEMO_.rows.map(o => Object.assign({}, o));
  const sh = ss_().getSheetByName('Profiles');
  ensureProfilesSchema_(sh);
  PROFILES_MEMO_ = null;   /* this function may change the tab */
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  // Repair ages Sheets turned into dates ("4-5" became 5 April): back to "4-5", saved as plain text.
  values.forEach((row, i) => {
    if (row[1] instanceof Date) {
      row[1] = ageFromDate_(row[1]);
      try { sh.getRange(i + 2, 2).setNumberFormat('@').setValue(row[1]); } catch (e) {}
    }
  });
  const rows = rowsToObjects_(headers, values).filter(row => row.Name);
  PROFILES_MEMO_ = { ss: ss_(), rows: rows };
  return rows.map(o => Object.assign({}, o));
}
function ageFromDate_(d) { return (d.getMonth() + 1) + '-' + d.getDate(); }

function setProfileActive_(name, active) {
  const sh = ss_().getSheetByName('Profiles');
  ensureProfilesSchema_(sh);
  PROFILES_MEMO_ = null;   /* this function may change the tab */
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === name) {
      sh.getRange(i + 1, 4).setValue(active);
      return { ok: true };
    }
  }
  return { ok: false };
}
function deactivateProfile(name) { return setProfileActive_(name, false); }
function reactivateProfile(name) { return setProfileActive_(name, true); }

function removeProfile(name) {
  const sh = ss_().getSheetByName('Profiles');
  ensureProfilesSchema_(sh);
  PROFILES_MEMO_ = null;   /* this function may change the tab */
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === name) {
      sh.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { ok: false };
}

/* ============ SETTINGS (Admin/Parent controls) ============ */
function getSettingsSheet_() {
  const ss = ss_();
  let sh = ss.getSheetByName('Settings');
  if (!sh) { setupSettingsTab(ss); sh = ss.getSheetByName('Settings'); }
  return sh;
}

function getSettings() {
  const sh = getSettingsSheet_();
  const values = sh.getDataRange().getValues();
  values.shift();
  const settings = {};
  values.forEach(row => { if (row[0]) settings[row[0]] = row[1]; });
  return settings;
}

function saveSetting(key, value) {
  const sh = getSettingsSheet_();
  const values = sh.getDataRange().getValues();
  // 📲 off-2: column C "Updated" = when the value was set (on a replayed offline result: when it was played — OfflineSync.gs).
  // While a CHOICE (avatar, look, room…) from an offline device is replayed, a value set LATER on another device is kept (newest wins).
  const stamp = new Date(), newest = typeof OFFLINE_NEWEST_ !== 'undefined' && OFFLINE_NEWEST_;
  if (values.length && values[0][0] === 'Key' && !values[0][2]) sh.getRange(1, 3).setValue('Updated');
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === key) {
      const prev = values[i][2] && typeof values[i][2].getTime === 'function' ? values[i][2].getTime() : 0;
      if (newest && prev > stamp.getTime()) return { ok: true, kept: 'newer' };
      sh.getRange(i + 1, 2, 1, 2).setValues([[value, stamp]]);
      return { ok: true };
    }
  }
  sh.appendRow([key, value, stamp]);
  return { ok: true };
}

function saveSettings(obj) {
  Object.keys(obj || {}).forEach(key => saveSetting(key, obj[key]));
  return { ok: true };
}

// ⭐ Favourite games per player (Gameroom): Settings `Fav_<Name>` = JSON list of GameIDs, in the order they were starred.
function saveFavorites(name, ids) {
  if (!name) throw new Error('Pick a player first.');
  const live = getGames().map(g => g.GameID);
  const clean = (Array.isArray(ids) ? ids : []).map(String).filter((id, i, a) => live.indexOf(id) !== -1 && a.indexOf(id) === i).slice(0, 30);
  saveSetting('Fav_' + name, JSON.stringify(clean));
  return { favorites: clean };
}
function favoritesFor_(name, settings) { try { const v = JSON.parse((settings || getSettings())['Fav_' + name] || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }

// Screen-time allowance in minutes for a player's age bracket, e.g. '6-7'.
// Falls back to a sane default if the bracket is missing/unrecognized so a
// player with no Age set (or a Settings row someone deleted) still gets a
// working timer instead of an instant lock.
const SCREEN_TIME_DEFAULT_MIN = 20;
function getScreenTimeMinutesForAge(age) {
  const settings = getSettings();
  const key = 'ScreenTime_' + (age || '');
  const val = settings[key];
  const minutes = Number(val);
  return (val && !isNaN(minutes) && minutes > 0) ? minutes : SCREEN_TIME_DEFAULT_MIN;
}

// PIN is stored in plain text in the Settings tab — this is a family-tablet
// speed bump for curious kids, not real access control, so that's fine here.
function verifyAdminPin(pin) {
  const settings = getSettings();
  return String(settings.AdminPIN || '') === String(pin || '');
}

function setAdminPin(newPin) {
  const digits = String(newPin || '');
  if (!/^\d{4,8}$/.test(digits)) {
    throw new Error('PIN must be 4 to 8 digits.');
  }
  return saveSetting('AdminPIN', digits);
}

// The Progress tab is read once per request (memo cleared whenever progress is saved).
let PROGRESS_MEMO_ = null;
function progressValues_() {
  if (PROGRESS_MEMO_ && PROGRESS_MEMO_.ss === ss_()) return PROGRESS_MEMO_.values;
  const values = ss_().getSheetByName('Progress').getDataRange().getValues();
  PROGRESS_MEMO_ = { ss: ss_(), values: values };
  return values;
}
function progressRows_() { const v = progressValues_(); return rowsToObjects_(v[0], v.slice(1)); }
function getProgress(name, gameId) {
  const values = progressValues_().slice();
  const headers = values.shift();
  const rows = values.filter(row => row[0] === name && row[1] === gameId);
  return rowsToObjects_(headers, rows);
}

function saveProgress(name, gameId, seriesId, unlockedLevel, tokens) {
  PROGRESS_MEMO_ = null;
  const ss = ss_();
  const sh = ss.getSheetByName('Progress');
  const values = sh.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === name && values[i][1] === gameId && values[i][2] === seriesId) {
      rowIndex = i + 1; // 1-indexed sheet row
      break;
    }
  }
  const tokensStr = Array.isArray(tokens) ? tokens.join(', ') : tokens;
  if (rowIndex > 0) {
    sh.getRange(rowIndex, 4, 1, 3).setValues([[unlockedLevel, tokensStr, new Date()]]);
  } else {
    sh.appendRow([name, gameId, seriesId, unlockedLevel, tokensStr, new Date()]);
  }
  return { ok: true };
}

/* ============ ACHIEVEMENTS / LEADERBOARD ============ */
// Every active player's tokens across every game, ranked highest-first.
// Used by the dashboard's podium (top 3) and the Achievement Archive page
// (full ranked list with a per-game badge breakdown).
function getLeaderboard() {
  const ss = ss_();

  const progressSh = ss.getSheetByName('Progress');
  const pValues = progressSh.getDataRange().getValues();
  const pHeaders = pValues.shift();
  const progressRows = rowsToObjects_(pHeaders, pValues);

  const gamesById = {};
  getGames().forEach(g => { gamesById[g.GameID] = g.GameName; });

  const players = listProfilesFull().filter(p => p.Active === true || p.Active === 'TRUE');

  const leaderboard = players.map(p => {
    const rows = progressRows.filter(r => r.Name === p.Name);
    const gamesPlayed = {};
    let tokenCount = 0;
    rows.forEach(r => {
      const toks = String(r.Tokens || '').split(',').map(t => t.trim()).filter(Boolean);
      if (toks.length === 0) return;
      tokenCount += toks.length;
      const gameName = gamesById[r.GameID] || r.GameID;
      if (!gamesPlayed[gameName]) gamesPlayed[gameName] = [];
      gamesPlayed[gameName] = gamesPlayed[gameName].concat(toks);
    });
    return {
      name: p.Name,
      age: p.Age || '',
      tokenCount: tokenCount,
      gamesPlayed: Object.keys(gamesPlayed).map(gameName => ({ gameName: gameName, tokens: gamesPlayed[gameName] })),
    };
  });

  leaderboard.sort((a, b) => b.tokenCount - a.tokenCount);
  return leaderboard;
}

/* ============ PAGE BOOT CALLS (one round trip per page) ============ */
// Each page used to make 2-3 separate server calls on load (the Gameroom
// even made them one after another). These bundle everything a page needs
// for its first screen into ONE call that opens the spreadsheet once.
function activePlayers_(players) {
  return players.filter(p => p.Active === true || p.Active === 'TRUE' || p.Active === '' || p.Active === undefined);
}

function getDashboardData() {
  return {
    players: activePlayers_(listProfilesFull()),
    leaderboard: getLeaderboard(),
    mazeRecords: recordsFor_('maze', activePlayers_(listProfilesFull())),
    recent: recentWithNames_(activePlayers_(listProfilesFull()), 6),
    titles: titlesData_(activePlayers_(listProfilesFull())),
    news: safeNews_(activePlayers_(listProfilesFull())),
    seen: safeSeen_(activePlayers_(listProfilesFull())),
    eyes: safeEyes_(activePlayers_(listProfilesFull())),
    wisDaily: safeWisDaily_(),   // 🃏 Dashboard: 📅 today's WisDeck daily-deck family board   // 👀🧠 Dashboard: 🎯 today's family number board + 🏅 brain levels
    modes: modesData_(activePlayers_(listProfilesFull())),   // ✨ modes-2: 🎯 Try a mode cards (which modes each player has tried)
    settings: getSettings(),
  };
}

/* ============ 👋 WHO PLAYED LAST (Dashboard order) ============ */
// Settings `LastSeen` = {name: ms} — set when a player opens the Gameroom (at most one write per player per 10 minutes).
// The Dashboard sorts players by the newer of that and their last Scores row.
function touchSeen_(name) {
  const st = getSettings(), map = jsonSetting_(st, 'LastSeen', {}), now = Date.now();
  if (map && typeof map === 'object' && map[name] && now - Number(map[name]) < 10 * 60000) return;
  const m = (map && typeof map === 'object') ? map : {};
  m[name] = now;
  saveSetting('LastSeen', JSON.stringify(m));
}
function safeSeen_(players) {
  try {
    const map = jsonSetting_(getSettings(), 'LastSeen', {}) || {}, out = {};
    players.forEach(p => { out[p.Name] = Number(map[p.Name]) || 0; });
    scoreRows_().forEach(r => { if (out[r.name] !== undefined) { const t = newsDate_(r.date); if (t > out[r.name]) out[r.name] = t; } });
    return out;
  } catch (e) { return {}; }
}

/* ============ ✨ MODE SPOTLIGHT (plan modes-1) ============ */
// One row per way to play INSIDE a game, so the Dashboard (🎯 Try a mode), the Gameroom (mode chips + ✨ strip) and the
// game itself (✨ Also try) can point at modes a player hasn't played yet.
//   game  = the Gameroom card / Games-tab GameID the mode belongs to · id = mode id (?page=<route>&mode=<id> opens it after the player pick)
//   tried = how we know a player has played it: {board: GameID} Scores rows (+ theme: text the Theme column contains / themeStart: text it starts with)
//           · {feat: [[game, stat], …]} any of these feats > 0 · {setting: 'Prefix_'} Settings '<Prefix><Name>'
//           (+ always the ModesTried_<Name> ledger, written by the game the first time the mode starts — markModeTried).
//   added = 'yyyy-mm-dd' when the mode came out → a 🆕 Dashboard card for 7 days.
const MODES_ = [
  { game: 'tdstories', id: 'draprincess', icon: '🐉', name: 'Dra-Princess Diary', pitch: 'A dragon + princess vs every suitor!', route: 'tdstories', added: '2026-11-14', tried: { board: 'td-draprincess' } },
  { game: 'artifactory', id: 'whittle', icon: '🔪', name: 'Artifactory Whittling', pitch: 'Carve a spoon — always away from you', route: 'artifactory', added: '2026-11-09', tried: { feat: [['artifactory', 'whittle']] } },
  { game: 'artifactory', id: 'print', icon: '🖨️', name: 'Artifactory 3D printing', pitch: 'Draw a shape and print it layer by layer', route: 'artifactory', added: '2026-11-09', tried: { feat: [['artifactory', 'print']] } },
  { game: 'artifactory', id: 'nature', icon: '🌿', name: 'Artifactory Nature crafts', pitch: 'Weave a hat, press flowers in resin', route: 'artifactory', added: '2026-11-09', tried: { feat: [['artifactory', 'nature']] } },
  { game: 'artifactory', id: 'lab', icon: '🧪', name: 'Artifactory Material lab', pitch: 'Make bronze, glass and dyes yourself', route: 'artifactory', added: '2026-11-09', tried: { feat: [['artifactory', 'lab']] } },
  { game: 'artifactory', id: 'planer', icon: '🪚', name: 'Artifactory Planer', pitch: 'Plane a rough plank flat and smooth', route: 'artifactory', added: '2026-11-09', tried: { feat: [['artifactory', 'planer']] } },
  { game: 'artifactory', id: 'weld', icon: '🔥', name: 'Artifactory Welding', pitch: 'Follow the seam with a steady hand', route: 'artifactory', added: '2026-11-09', tried: { feat: [['artifactory', 'weld']] } },
  { game: 'artifactory', id: 'forge', icon: '⚒️', name: 'Artifactory Forge', pitch: 'Heat it orange, hammer it into shape', route: 'artifactory', added: '2026-11-09', tried: { feat: [['artifactory', 'forge']] } },
  { game: 'artifactory', id: 'pottery', icon: '🏺', name: 'Artifactory Pottery', pitch: 'Shape spinning clay, fire it in the kiln', route: 'artifactory', added: '2026-11-09', tried: { feat: [['artifactory', 'pottery']] } },
  { game: 'artifactory', id: 'sew', icon: '🧵', name: 'Artifactory Loom', pitch: 'Weave a pattern for a cape or scarf', route: 'artifactory', added: '2026-11-09', tried: { feat: [['artifactory', 'sew']] } },
  { game: 'artifactory', id: 'light', icon: '🔌', name: 'Artifactory Light-up', pitch: 'Close the circuit — make it glow!', route: 'artifactory', added: '2026-11-09', tried: { feat: [['artifactory', 'light']] } },
  { game: 'artifactory', id: 'lathe', icon: '🌀', name: 'Artifactory Lathe', pitch: 'Carve a cup, yo-yo or trophy as it spins', route: 'artifactory', added: '2026-11-08', tried: { feat: [['artifactory', 'lathe']] } },
  { game: 'artifactory', id: 'stone', icon: '💎', name: 'Artifactory Gems', pitch: 'Polish a stone, cut a sparkling gem', route: 'artifactory', added: '2026-11-08', tried: { feat: [['artifactory', 'stone']] } },
  { game: 'artifactory', id: 'finish', icon: '🎨', name: 'Artifactory Finish', pitch: 'Paint, varnish and engrave your name', route: 'artifactory', added: '2026-11-08', tried: { feat: [['artifactory', 'finish']] } },
  { game: 'geoscout', id: 'journey', icon: '📖', name: 'GeoScout Journey', pitch: 'Story chapters with number friends', route: 'geoscout', added: '2026-11-09', tried: { feat: [['geoscout', 'journeys']] } },
  { game: 'geoscout', id: 'scale', icon: '⚖️', name: 'GeoScout Scale', pitch: 'More, less or the same? Weigh yourself!', route: 'geoscout', added: '2026-11-08', tried: { board: 'geoscout', themeStart: '⚖️ Scale' } },
  { game: 'geoscout', id: 'shape', icon: '🔷', name: 'GeoScout Shape builder', pitch: 'Build squares, rectangles and steps', route: 'geoscout', added: '2026-11-08', tried: { board: 'geoscout', themeStart: '🔷 Shape builder', feat: [['geoscout', 'shapes']] } },
  { game: 'geoscout', id: 'tens', icon: '🔟', name: 'GeoScout Tens tower', pitch: 'Ten ones snap into a ten-tower!', route: 'geoscout', added: '2026-11-08', tried: { board: 'geoscout', themeStart: '🔟 Tens tower', feat: [['geoscout', 'tens']] } },
  { game: 'geoscout', id: 'next', icon: '🧩', name: 'GeoScout What comes next', pitch: 'Find the pattern!', route: 'geoscout', added: '2026-11-08', tried: { board: 'geoscout', themeStart: '🧩 What comes next', feat: [['geoscout', 'patterns']] } },
  { game: 'geoscout', id: 'frac', icon: '🍕', name: 'GeoScout Fractions', pitch: 'Which pizza slice is bigger?', route: 'geoscout', added: '2026-11-08', tried: { board: 'geoscout', themeStart: '🍕 Fractions', feat: [['geoscout', 'fractions']] } },
  { game: 'geoscout', id: 'wobble', icon: '🏗️', name: 'GeoScout Wobble tower', pitch: 'Stack to the EXACT height', route: 'geoscout', added: '2026-11-08', tried: { board: 'geoscout', themeStart: '🏗️ Wobble tower', feat: [['geoscout', 'wobble']] } },
  { game: 'geoscout', id: 'battle', icon: '⚔️', name: 'GeoScout Tower battle', pitch: '2 players — higher or lower wins!', route: 'geoscout', added: '2026-11-08', tried: { feat: [['geoscout', 'battles']] } },
  { game: 'geoscout', id: 'count', icon: '🧱', name: 'GeoScout Count', pitch: 'Snap and split blocks to make the number', route: 'geoscout', added: '2026-11-08', tried: { board: 'geoscout', themeStart: '🧱 Count' } },
  { game: 'wisdeck', id: 'quiz', icon: '🧠', name: 'WisQuiz', pitch: 'Pick a category, win cards!', route: 'wisdeck', tried: { board: 'wisdeck' } },
  { game: 'wisdeck', id: 'buzz', icon: '🔔', name: 'WisBuzz', pitch: '2–4 players — buzz in first!', route: 'wisdeck', tried: { feat: [['wisdeck', 'buzzWins'], ['wisdeck', 'buzzRight']] } },
  { game: 'wisdeck', id: 'daily', icon: '📅', name: 'WisDaily', pitch: '5 questions, once a day', route: 'wisdeck', tried: { feat: [['wisdeck', 'daily']] } },
  { game: 'wisdeck', id: 'count', icon: '🔢', name: 'WisCount', pitch: 'Card battle — best 3 of 5', route: 'wisdeck', tried: { board: 'wiscount', feat: [['wiscount', 'games']] } },
  { game: 'wisdeck', id: 'jack', icon: '🂡', name: 'WisJack', pitch: 'Get as close to 20 as you can', route: 'wisdeck', tried: { board: 'wisjack', feat: [['wisjack', 'games']] } },
  { game: 'wisdeck', id: 'learn', icon: '📚', name: 'WisLearn', pitch: 'Flip and read the cards', route: 'wisdeck', tried: null },
  { game: 'snakeast', id: 'feast', icon: '🍎', name: 'Snakeast', pitch: 'Eat, grow, reach the length!', route: 'snakize', tried: { board: 'snakeast', feat: [['snakeast', 'games']] } },
  { game: 'snakeast', id: 'endless', icon: '♾️', name: 'Snakeast Endless', pitch: 'Grow forever — beat your best!', route: 'snakize', tried: { feat: [['snakeast', 'endless']] } },
  { game: 'snakeast', id: 'gate', icon: '🧭', name: 'Snakigate', pitch: 'Steer anywhere — be the longest!', route: 'snakize', tried: { board: 'snakigate', feat: [['snakigate', 'games']] } },
  { game: 'snakeast', id: 'castle', icon: '🏰', name: 'Snakastle', pitch: 'Loop back home to grab land!', route: 'snakize', tried: { board: 'snakastle', feat: [['snakastle', 'games']] } },
  { game: 'snakeast', id: 'tale', icon: '📜', name: 'Snaketale', pitch: 'Story quests from your family', route: 'snakize', tried: { setting: 'Snaketale_', feat: [['snaketale', 'stages']] } },
  { game: 'brawl-buddies', id: 'battle', icon: '🥊', name: 'Brawl Battle', pitch: 'Bonk your buddy, cartoon style!', route: 'brawlbuddies', tried: { board: 'brawl-buddies', feat: [['brawl-buddies', 'matches']] } },
  { game: 'brawl-buddies', id: 'brawenture', icon: '🗺️', name: 'Brawenture', pitch: 'Bonk baddies, rescue the family!', route: 'brawlbuddies', tried: { board: 'brawenture', feat: [['brawenture', 'runs']] }, added: '2026-11-08' },
  { game: 'soul-bopper', id: 'battle', icon: '⚔️', name: 'Battle', pitch: 'Last one standing wins!', route: 'soulbopper', tried: { feat: [['soul-bopper', 'bestWin']] } },
  { game: 'soul-bopper', id: 'classic', icon: '💩', name: 'Classic Avatar', pitch: 'Poo bombs — even when you\'re out!', route: 'soulbopper', tried: { feat: [['soul-bopper', 'pooGames']] } },
  { game: 'soul-bopper', id: 'hold', icon: '🏳️', name: 'Hold the land', pitch: 'Stand in the glowing zone!', route: 'soulbopper', tried: { feat: [['soul-bopper', 'holdSecs'], ['soul-bopper', 'holdWins']] } },
  { game: 'soul-bopper', id: 'stage', icon: '🗺️', name: 'Stage', pitch: '7 worlds, stages and bosses!', route: 'soulbopper', tried: { board: 'soul-bopper', feat: [['soul-bopper', 'stages']] } },
  { game: 'polyplot', id: 'classic', icon: '⬜', name: 'Classic', pitch: 'Close a shape, make it yours!', route: 'polyplot', tried: { board: 'polyplot', theme: '· Classic ·' } },
  { game: 'polyplot', id: 'hunt', icon: '🏹', name: 'Hunt', pitch: 'Catch creatures, grab coins!', route: 'polyplot', tried: { feat: [['polyplot', 'huntGames']] } },
  { game: 'polyplot', id: 'fort', icon: '🏰', name: 'Fortiplot', pitch: 'Build towers, knock theirs down!', route: 'polyplot', tried: { board: 'polyplot', theme: '· Fortiplot ·', feat: [['polyplot', 'fortWins']] } },
  { game: 'polyplot', id: 'coop', icon: '🛡️', name: 'Co-op waves', pitch: 'Team up against monster waves!', route: 'polyplot', tried: { feat: [['polyplot', 'bestWave']] } },
  { game: 'alignext', id: 'drop', icon: '🔴', name: 'Drop', pitch: 'Drop discs, make a line!', route: 'alignext', tried: { board: 'alignext', feat: [['alignext', 'games']] } },
  { game: 'alignext', id: 'omni', icon: '❌', name: 'Omnifile Classic', pitch: 'Put your piece anywhere!', route: 'alignext', tried: { board: 'omnifile', feat: [['omnifile', 'games']] } },
  { game: 'alignext', id: 'stack', icon: '♟️', name: 'Omnifile Stack', pitch: 'Big pieces cover small ones!', route: 'alignext', tried: { board: 'omnifile', theme: '· stack', feat: [['omnifile', 'stackWins'], ['omnifile', 'covers']] } },
  { game: 'beat-corner', id: 'corner', icon: '🎵', name: 'Corners', pitch: 'Hit the beats in 4 corners!', route: 'beatcorner', tried: { board: 'beat-corner' } },
  { game: 'beat-corner', id: 'piano', icon: '🎹', name: 'Piano', pitch: 'Play the falling notes!', route: 'beatcorner', tried: { board: 'beat-piano' }, added: '2026-11-08' },
  { game: 'beat-corner', id: 'drums', icon: '🥁', name: 'Drums', pitch: 'Bang a drum kit that grows!', route: 'beatcorner', tried: { board: 'beat-drums' }, added: '2026-11-08' },
  { game: 'beat-corner', id: 'band', icon: '🎸', name: 'Band', pitch: 'Play a song with a friend!', route: 'beatcorner', tried: { feat: [['beat-piano', 'bandSongs'], ['beat-drums', 'bandSongs']] }, added: '2026-11-08' },
  { game: 'beat-corner', id: 'maker', icon: '🎼', name: 'Song Maker', pitch: 'Make your own song!', route: 'beatcorner', tried: { feat: [['beat-piano', 'songsMade']] }, added: '2026-11-08' },
  { game: 'eyes-brain', id: 'classic', icon: '🔢', name: 'Classic', pitch: 'Remember the digits!', route: 'eyesbrain', tried: { board: 'eyes-brain', themeStart: '🔢 Classic' } },
  { game: 'eyes-brain', id: 'backwards', icon: '🔁', name: 'Backwards', pitch: 'See 123, type 321!', route: 'eyesbrain', tried: { board: 'eyes-brain', themeStart: '🔁 Backwards', feat: [['eyes-brain', 'backPerfects']] } },
  { game: 'eyes-brain', id: 'challenge', icon: '🏔️', name: 'Challenge', pitch: 'One more digit each time!', route: 'eyesbrain', tried: { board: 'eyes-brain', themeStart: '🏔️ Challenge', feat: [['eyes-brain', 'challenge']] } },
  { game: 'eyes-brain', id: 'letters', icon: '🔤', name: 'Numbers + letters', pitch: 'Remember numbers AND letters', route: 'eyesbrain', tried: { board: 'eyes-brain', themeStart: '🔤 Numbers + letters' } },
  { game: 'eyes-brain', id: 'colour', icon: '🎨', name: 'Colour digits', pitch: 'Every digit has a colour', route: 'eyesbrain', tried: { board: 'eyes-brain', themeStart: '🎨 Colour digits' } },
  { game: 'eyes-brain', id: 'listen', icon: '👂', name: 'Listen', pitch: 'Hear it, then type it back', route: 'eyesbrain', tried: { board: 'eyes-brain', themeStart: '👂 Listen', feat: [['eyes-brain', 'listenPerfects']] } },
  { game: 'eyes-brain', id: 'chain', icon: '➕', name: 'Chain', pitch: 'Take turns adding a digit', route: 'eyesbrain', tried: { board: 'eyes-brain', themeStart: '➕ Chain', feat: [['eyes-brain', 'chainWins']] } },
  { game: 'eyes-brain', id: 'word', icon: '📝', name: 'Word mode', pitch: 'Remember short words', route: 'eyesbrain', tried: { board: 'eyes-brain', themeStart: '📝 Word mode' } },
  { game: 'eyes-brain', id: 'shapes', icon: '🧩', name: 'Shapes', pitch: 'Remember shape patterns', route: 'eyesbrain', tried: { board: 'eyes-brain', themeStart: '🧩 Shapes' } },
  { game: 'eyes-brain', id: 'daily', icon: '🎯', name: 'Today\'s family number', pitch: 'One try at today\'s number!', route: 'eyesbrain', tried: { feat: [['eyes-brain', 'daily']] } },
  { game: 'georead', id: 'phonics', icon: '🔊', name: 'Phonics', pitch: 'Tap the sounds, bump the word!', route: 'georead', tried: { board: 'georead', themeStart: '🔊 Phonics', feat: [['georead', 'blends']] }, added: '2026-11-08' },
  { game: 'georead', id: 'build', icon: '🧱', name: 'Word builder', pitch: 'See the picture, build the word', route: 'georead', tried: { board: 'georead', themeStart: '🧱 Word builder', feat: [['georead', 'built']] }, added: '2026-11-08' },
  { game: 'georead', id: 'rhyme', icon: '🔁', name: 'Rhyme time', pitch: 'cat · hat · bat — swap a box!', route: 'georead', tried: { board: 'georead', themeStart: '🔁 Rhyme time', feat: [['georead', 'rhymes']] }, added: '2026-11-08' },
  { game: 'georead', id: 'sight', icon: '👀', name: 'Sight words', pitch: 'Tap the word you hear, quick!', route: 'georead', tried: { board: 'georead', themeStart: '👀 Sight words', feat: [['georead', 'sight']] }, added: '2026-11-08' },
  { game: 'georead', id: 'trace', icon: '✏️', name: 'Trace', pitch: 'Draw Aa–Zz with your finger', route: 'georead', tried: { board: 'georead', themeStart: '✏️ Trace', feat: [['georead', 'traced']] }, added: '2026-11-08' },
  { game: 'georead', id: 'case', icon: '🅰️', name: 'Big and small', pitch: 'Match A with a!', route: 'georead', tried: { board: 'georead', themeStart: '🅰️ Big and small', feat: [['georead', 'cases']] }, added: '2026-11-08' },
  { game: 'georead', id: 'story', icon: '📖', name: 'Story read', pitch: 'Words light up as they are read', route: 'georead', tried: { board: 'georead', themeStart: '📖 Story read', feat: [['georead', 'stories']] }, added: '2026-11-08' },
  { game: 'georead', id: 'types', icon: '🗂️', name: 'Word types', pitch: 'Naming, doing, describing words', route: 'georead', tried: { board: 'georead', themeStart: '🗂️ Word types', feat: [['georead', 'sorted']] }, added: '2026-11-08' },
  { game: 'georead', id: 'journey', icon: '🗺️', name: 'Letter Journey', pitch: 'Walk the Alphabet Road!', route: 'georead', tried: { setting: 'GeoJourney_', feat: [['georead', 'chapters']] }, added: '2026-11-08' },
  { game: 'pyraspike', id: 'beach', icon: '🏖️', name: 'PyraSpike Beach 2v2', pitch: 'Beach volleyball — bump, set, DUNK!', route: 'pyradive', added: '2026-11-14', tried: { board: 'pyraspike', themeStart: '🏖️ Beach 2v2', feat: [['pyraspike', 'm_beach']] } },
  { game: 'pyraspike', id: 'small', icon: '🏫', name: 'PyraSpike Small 3v3', pitch: 'Drive, Dink, Dunk — 3 a side!', route: 'pyradive', added: '2026-11-14', tried: { board: 'pyraspike', themeStart: '🏫 Small 3v3', feat: [['pyraspike', 'm_small']] } },
  { game: 'pyraspike', id: 'full', icon: '🏟️', name: 'PyraSpike Full 6v6', pitch: 'The big arena — 6 a side!', route: 'pyradive', added: '2026-11-14', tried: { board: 'pyraspike', themeStart: '🏟️ Full 6v6', feat: [['pyraspike', 'm_full']] } },
  { game: 'pyraspike', id: 'strikesolo', icon: '🦶', name: 'PyraStrike 1v1', pitch: 'Sepak takraw — feet only, all 3 touches yours!', route: 'pyradive', added: '2026-11-14', tried: { board: 'pyraspike', themeStart: '🦶 Strike 1v1', feat: [['pyraspike', 'm_strikesolo']] } },
  { game: 'pyraspike', id: 'strikeduo', icon: '🦵', name: 'PyraStrike Duo 2v2', pitch: 'Trap, head it, ROLL SPIKE!', route: 'pyradive', added: '2026-11-14', tried: { board: 'pyraspike', themeStart: '🦵 Strike Duo 2v2', feat: [['pyraspike', 'm_strikeduo']] } },
  { game: 'pyraspike', id: 'strikeregu', icon: '🧶', name: 'PyraStrike Regu 3v3', pitch: 'Team takraw — bicycle kicks!', route: 'pyradive', added: '2026-11-14', tried: { board: 'pyraspike', themeStart: '🧶 Strike Regu 3v3', feat: [['pyraspike', 'm_strikeregu']] } },
  { game: 'pyraspike', id: 'hoop', icon: '⭕', name: 'Hoop Takraw', pitch: 'Kick it through the hanging hoop!', route: 'pyradive', added: '2026-11-14', tried: { board: 'pyraspike', themeStart: '⭕ Hoop Takraw', feat: [['pyraspike', 'm_hoop']] } },
  { game: 'pyraspike', id: 'sparksolo', icon: '⚡', name: 'PyraSpark 1v1', pitch: 'Net-table game — one bounce, no hands, EDGE balls!', route: 'pyradive', added: '2026-11-14', tried: { board: 'pyraspike', themeStart: '⚡ Spark 1v1', feat: [['pyraspike', 'm_sparksolo']] } },
  { game: 'pyraspike', id: 'sparkduo', icon: '🌩️', name: 'PyraSpark Duo 2v2', pitch: 'Pass to your partner, then send it back!', route: 'pyradive', added: '2026-11-14', tried: { board: 'pyraspike', themeStart: '🌩️ Spark Duo 2v2', feat: [['pyraspike', 'm_sparkduo']] } },
  { game: 'pyraspike', id: 'zonehits', icon: '🎯', name: 'PyraDive Zone Hits', pitch: 'Training: hit the glowing zone!', route: 'pyradive', added: '2026-11-14', tried: { board: 'pyraspike', themeStart: '🎯 Zone Hits', feat: [['pyraspike', 'm_zonehits']] } },
  { game: 'pyraspike', id: 'combo', icon: '🔗', name: 'PyraDive Body Combo', pitch: 'Training: trap, pop, SMASH!', route: 'pyradive', added: '2026-11-14', tried: { board: 'pyraspike', themeStart: '🔗 Body Combo', feat: [['pyraspike', 'm_combo']] } },
  { game: 'pyraspike', id: 'rallyrun', icon: '🏃', name: 'PyraDive Rally Run', pitch: 'Training: the ball gets faster and faster!', route: 'pyradive', added: '2026-11-14', tried: { board: 'pyraspike', themeStart: '🏃 Rally Run', feat: [['pyraspike', 'm_rallyrun']] } },
  { game: 'pyraspike', id: 'juggle', icon: '🤹', name: 'PyraDive Juggle', pitch: 'Training: keep it up — foot, knee, head!', route: 'pyradive', added: '2026-11-14', tried: { board: 'pyraspike', themeStart: '🤹 Juggle', feat: [['pyraspike', 'm_juggle']] } },
  { game: 'pyraspike', id: 'party', icon: '🌀', name: 'Spark Party', pitch: 'A bouncy ball + extra balls at once!', route: 'pyradive', added: '2026-11-14', tried: { board: 'pyraspike', themeStart: '🌀 Spark Party', feat: [['pyraspike', 'm_party']] } },
  { game: 'pokadif', id: 'spot', icon: '🖼️', name: 'Find the Difference', pitch: 'Two pictures — poke every change!', route: 'pokadif', added: '2026-11-14', tried: { board: 'pokadif', themeStart: '🖼️ Spot' } },
  { game: 'pokadif', id: 'detective', icon: '🕵️', name: 'Detective Adventure', pitch: 'Solve a case: find · read · crack!', route: 'pokadif', added: '2026-11-14', tried: { board: 'pokadif-case' } },
  { game: 'pokadif', id: 'arcade', icon: '⏱️', name: 'Photo Hunt Arcade', pitch: 'Race the clock — every find adds time!', route: 'pokadif', added: '2026-11-14', tried: { board: 'pokadif-arcade' } },
  { game: 'pokadif', id: 'blink', icon: '👁️', name: 'Blink', pitch: 'One picture blinks — what changed?', route: 'pokadif', added: '2026-11-14', tried: { board: 'pokadif', themeStart: '👁️ Blink' } },
  { game: 'pokadif', id: 'odd', icon: '🎯', name: 'Odd One Out', pitch: 'Poke the one that doesn\'t belong!', route: 'pokadif', added: '2026-11-14', tried: { board: 'pokadif', themeStart: '🎯 Odd One Out' } },
  { game: 'sciencetory', id: 'mechanic', icon: '⚙️', name: 'Sciencetory Mechanic', pitch: 'Test your crafted things!', route: 'sciencetory', added: '2026-11-14', tried: { board: 'sciencetory', themeStart: '⚙️ Mechanic' } },
  { game: 'sciencetory', id: 'chem', icon: '⚗️', name: 'Sciencetory Chemistry', pitch: 'Hunt elements, build molecules!', route: 'sciencetory', added: '2026-11-14', tried: { board: 'sciencetory', themeStart: '⚗️ Chemistry' } },   // ⚗️ sc-2a
  { game: 'sciencetory', id: 'quantum', icon: '⚛️', name: 'Sciencetory Quantum', pitch: 'Build atoms from tiny parts!', route: 'sciencetory', added: '2026-11-14', tried: { board: 'sciencetory', themeStart: '⚛️ Quantum' } },   // ⚛️ sc-2b
  { game: 'sla-brall', id: 'slashot', icon: '🏒', name: 'SlaShot', pitch: 'Table hockey — score goals!', route: 'slabrall', tried: { board: 'sla-brall', themeStart: 'SlaShot ·', feat: [['sla-brall', 'win_slashot']] } },
  { game: 'sla-brall', id: 'slapoof', icon: '🥒', name: 'SlaPoof', pitch: 'Pickleball — mind the kitchen!', route: 'slabrall', tried: { board: 'sla-brall', themeStart: 'SlaPoof ·', feat: [['sla-brall', 'win_slapoof']] } },
  { game: 'sla-brall', id: 'slaball', icon: '🎾', name: 'SlaBall', pitch: 'Tennis: 15, 30, 40, game!', route: 'slabrall', tried: { board: 'sla-brall', themeStart: 'SlaBall ·', feat: [['sla-brall', 'win_slaball']] } },
  { game: 'sla-brall', id: 'slapong', icon: '🏓', name: 'SlaPong', pitch: 'Ping-pong on a table!', route: 'slabrall', tried: { board: 'sla-brall', themeStart: 'SlaPong ·', feat: [['sla-brall', 'win_slapong']] } },
  { game: 'sla-brall', id: 'slabam', icon: '🏸', name: 'SlaBam', pitch: 'Badminton — fast hit, slow drop!', route: 'slabrall', tried: { board: 'sla-brall', themeStart: 'SlaBam ·', feat: [['sla-brall', 'win_slabam']] }, added: '2026-11-10' },
  { game: 'sla-brall', id: 'slawall', icon: '🧱', name: 'SlaWall', pitch: 'Squash room — bounce off ANY wall!', route: 'slabrall', tried: { board: 'sla-brall', themeStart: 'SlaWall ·', feat: [['sla-brall', 'win_slawall']] } },
  { game: 'sla-brall', id: 'cup', icon: '🏆', name: 'Tournament', pitch: 'Win the trophy in a cup!', route: 'slabrall', tried: { feat: [['sla-brall', 'cupMatches'], ['sla-brall', 'cups']] } },
  { game: 'sla-brall', id: 'lhost', icon: '📡', name: 'Host a game', pitch: 'Friends join on their own device!', route: 'slabrall', added: '2026-11-13' },   // 📡 lk-1c
  { game: 'sla-brall', id: 'ljoin', icon: '🔗', name: 'Join friends', pitch: 'Play on your own device!', route: 'slabrall', added: '2026-11-13' },   // 📡 p3a (lk-1b asked)
  { game: 'blasoff', id: 'fours', icon: '⚽', name: 'Soccer 4v4', pitch: 'Small pitch, close camera!', route: 'blasoff', tried: { board: 'blasoff', themeStart: '4v4 ·', feat: [['blasoff', 'win_4v4']] }, added: '2026-11-14' },   // ⚽ bo-1
  { game: 'blasoff', id: 'sevens', icon: '🏟️', name: 'Soccer 7v7', pitch: 'Bigger pitch, more passing!', route: 'blasoff', tried: { board: 'blasoff', themeStart: '7v7 ·', feat: [['blasoff', 'win_7v7']] }, added: '2026-11-14' },   // ⚽ bo-1
  { game: 'blasoff', id: 'elevens', icon: '🌍', name: 'Soccer 11v11', pitch: 'Full pitch, 11 a side!', route: 'blasoff', tried: { board: 'blasoff', themeStart: '11v11 ·', feat: [['blasoff', 'win_11v11']] }, added: '2026-11-14' },   // 🌍 bo-2a
  { game: 'blasoff', id: 'futsal', icon: '🥅', name: 'Futsal 5v5', pitch: 'Fast court soccer, heavy ball!', route: 'blasoff', tried: { board: 'blasoff', themeStart: 'Futsal 5v5 ·', feat: [['blasoff', 'win_5v5']] }, added: '2026-11-14' },   // 🏟️ bo-2b
  { game: 'blasoff', id: 'street', icon: '🏙️', name: 'Street 1v1', pitch: 'Nutmeg = a point, first to 5!', route: 'blasoff', tried: { board: 'blasoff', themeStart: 'Street 1v1 ·', feat: [['blasoff', 'win_1v1']] }, added: '2026-11-14' },   // 🏙️ bo-2b
  { game: 'blasoff', id: 'skills', icon: '🎯', name: 'Skill challenges', pitch: '7 drills, three stars each!', route: 'blasoff', tried: { feat: [['blasoff', 'skills']] }, added: '2026-11-14' },   // 🎯 bo-3a
  { game: 'blasoff', id: 'shootout', icon: '🥅', name: 'Penalty shootout', pitch: 'Kick on the target, dive in goal!', route: 'blasoff', tried: { board: 'blasoff', themeStart: 'Penalty shootout ·', feat: [['blasoff', 'win_pens']] }, added: '2026-11-14' },
  { game: 'blasoff', id: 'battle', icon: '🎤', name: 'Tricks Battle', pitch: 'Tricks on the beat, 3 judges!', route: 'blasoff', tried: { board: 'blasoff', themeStart: 'Tricks Battle ·', feat: [['blasoff', 'win_battle']] }, added: '2026-11-14' },   // 🎤 bo-3b
  { game: 'turbo', id: 'ghost', icon: '👻', name: 'Ghost race', pitch: 'Race the family\'s best rides!', route: 'turbo', tried: null },
  { game: 'turbo', id: 'duo', icon: '👥', name: '2-player race', pitch: 'Race a friend, split screen!', route: 'turbo', tried: null },
  { game: 'word-board', id: 'together', icon: '👨‍👩‍👧', name: 'Lettercraft Play together', pitch: 'Word battle with your family!', route: 'wordboard', tried: { feat: [['word-board', 'togetherGames']] } },
  { game: 'number-board', id: 'together', icon: '👨‍👩‍👧', name: 'Algebros Play together', pitch: 'Number battle with your family!', route: 'numberboard', tried: { feat: [['number-board', 'togetherGames']] } },
  { game: 'math-quest', id: 'minute', icon: '⏱️', name: 'Minute Challenge', pitch: '60 seconds — how many sums?', route: 'mathquest', tried: { feat: [['math-quest', 'sprintRounds'], ['math-quest', 'sprintBest']] } },
  { game: 'double-up', id: 'challenge', icon: '🏔️', name: 'Double Up Challenge', pitch: 'Tiny 3×3 board — reach 1024!', route: 'doubleup', tried: { feat: [['double-up', 'chTile']] } },
  { game: 'memory', id: 'friends', icon: '👥', name: 'Memory with friends', pitch: 'Take turns — most pairs wins!', route: 'memory', tried: { feat: [['memory', 'wins']] } },
  { game: 'chess', id: 'duo', icon: '👫', name: 'Chess for 2', pitch: 'Play chess with a friend!', route: 'chess', tried: null },
  { game: 'checkers', id: 'duo', icon: '👫', name: 'Checkers for 2', pitch: 'Play checkers with a friend!', route: 'checkers', tried: null },
  { game: 'pose-party', id: 'classic', icon: '🎯', name: 'Classic', pitch: 'Copy each pose — 3, 2, 1, snap!', route: 'poseparty', tried: { board: 'pose-party' } },
  { game: 'pose-party', id: 'speed', icon: '⏱️', name: 'Speed 60 s', pitch: 'Match fast poses in 60 seconds', route: 'poseparty', tried: { feat: [['pose-party', 'speedBest']] } },
  { game: 'pose-party', id: 'copy', icon: '🪞', name: 'Copy Me', pitch: 'Copy your buddy\'s pose fast!', route: 'poseparty', tried: { feat: [['pose-party', 'copyBest']] } },
  { game: 'pose-party', id: 'group', icon: '🧑‍🤝‍🧑', name: 'Group poses', pitch: 'Make one big shape together!', route: 'poseparty', tried: { feat: [['pose-party', 'groupBest']] } },
  { game: 'pose-party', id: 'dance', icon: '💃', name: 'Dance chain', pitch: 'Pose on the beat!', route: 'poseparty', tried: { feat: [['pose-party', 'danceBest']] } },
  { game: 'pose-party', id: 'statue', icon: '🗿', name: 'Statue Hold', pitch: 'Freeze like a stone statue!', route: 'poseparty', tried: { feat: [['pose-party', 'statueBest']] } },
  { game: 'pose-party', id: 'freeze', icon: '🧊', name: 'Freeze Dance', pitch: 'Dance, then FREEZE!', route: 'poseparty', tried: { feat: [['pose-party', 'freezeBest'], ['pose-party', 'freezeSecs']] } },
  { game: 'pose-party', id: 'mirror', icon: '🪞', name: 'Mirror Twins', pitch: 'Copy your twin like a mirror!', route: 'poseparty', tried: { feat: [['pose-party', 'mirrorBest']] } },
  { game: 'pose-party', id: 'letters', icon: '🔤', name: 'Body Letters', pitch: 'Spell your name with your body!', route: 'poseparty', tried: { feat: [['pose-party', 'lettersMade']] } },
  { game: 'pose-party', id: 'yoga', icon: '🧘', name: 'Yoga & Stretch', pitch: 'Slow stretches — hold them still', route: 'poseparty', tried: null },
];
const MODES_NEW_DAYS_ = 7;
// 🗂️ mg-1 Mode groups — the same boxes (and order) as each game's start page. A mode not listed here has no group (2-mode games stay flat).
const MODE_GROUPS_ = {
  'sciencetory': [{k: 'matter', icon: '⚗️', en: 'Matter', th: 'สสาร', modes: ['chem', 'quantum', 'particle']}, {k: 'forces', icon: '⚙️', en: 'Forces & Energy', th: 'แรงและพลังงาน', modes: ['mechanic', 'thermo', 'electro']}, {k: 'waves', icon: '🌈', en: 'Waves & Space', th: 'คลื่นและอวกาศ', modes: ['optics', 'acoustics', 'cosmic']}, {k: 'earth', icon: '🌍', en: 'Earth & Life', th: 'โลกและชีวิต', modes: ['geo', 'bio']}],   // 🔬 sc-2b (same boxes as the page)
  'pokadif': [{k: 'spot', icon: '🖼️', en: 'Spot', th: 'จับผิดภาพ', modes: ['spot', 'blink']}, {k: 'odd', icon: '🎯', en: 'Odd One Out', th: 'หาตัวที่ต่าง', modes: ['odd']}, {k: 'endless', icon: '⏱️', en: 'Arcade', th: 'อาร์เคด', modes: ['arcade']}, {k: 'stories', icon: '📖', en: 'Stories', th: 'นักสืบผจญภัย', modes: ['detective']}],   // 🔍 pk-2a + pk-2b + pk-3a
  'geoscout': [{k: 'numbers', icon: '🧮', en: 'Number play', th: 'เล่นกับตัวเลข', modes: ['scale', 'count', 'tens', 'next']}, {k: 'shapes', icon: '🔷', en: 'Shapes + parts', th: 'รูปทรง · เศษส่วน', modes: ['shape', 'frac', 'wobble']}, {k: 'friends', icon: '⚔️', en: 'With friends', th: 'เล่นกับเพื่อน', modes: ['battle']}, {k: 'story', icon: '📖', en: 'Story', th: 'เนื้อเรื่อง', modes: ['journey']}],   // 🗂️ p3a (F5)
  'artifactory': [{k: 'hall', icon: '⚙️', en: 'Machine Hall', th: 'โรงเครื่องจักร', modes: ['lathe', 'planer', 'weld', 'forge', 'pottery', 'sew', 'light', 'finish']}, {k: 'hand', icon: '🪵', en: 'HandCraft Room', th: 'ห้องงานฝีมือ', modes: ['whittle', 'stone', 'print', 'lab', 'nature']}],   // 🗂️ p3a: the page's own areas
  'wisdeck': [{k: 'quiz', icon: '🧠', en: 'Quiz games', th: 'เกมตอบคำถาม', modes: ['quiz', 'buzz', 'daily']}, {k: 'num', icon: '🔢', en: 'Number games', th: 'เกมตัวเลข', modes: ['count', 'jack']}, {k: 'learn', icon: '📚', en: 'Learn + store', th: 'อ่าน · เรียน · เก็บการ์ด', modes: ['learn']}],
  'snakeast': [{k: 'arcade', icon: '🐍', en: 'Arcade', th: 'อาร์เคด', modes: ['feast', 'endless', 'gate']}, {k: 'land', icon: '🏰', en: 'Land battle', th: 'ยึดพื้นที่', modes: ['castle']}, {k: 'story', icon: '📜', en: 'Story', th: 'เนื้อเรื่อง', modes: ['tale']}],
  'soul-bopper': [{k: 'battle', icon: '⚔️', en: 'Battle', th: 'ต่อสู้', modes: ['battle', 'hold']}, {k: 'party', icon: '💩', en: 'Party', th: 'ปาร์ตี้', modes: ['classic']}, {k: 'story', icon: '🗺️', en: 'Story', th: 'ผจญภัย', modes: ['stage']}],
  'polyplot': [{k: 'boxes', icon: '⬜', en: 'Boxes', th: 'ปิดกล่อง', modes: ['classic', 'hunt']}, {k: 'fort', icon: '🏰', en: 'Fortiplot', th: 'สร้างป้อม', modes: ['fort', 'coop']}],
  'alignext': [{k: 'drop', icon: '🔴', en: 'Drop', th: 'หยอดเหรียญ', modes: ['drop']}, {k: 'omni', icon: '❌⭕', en: 'Omnifile', th: 'วางได้ทุกช่อง', modes: ['omni', 'stack']}],
  'beat-corner': [{k: 'songs', icon: '🎤', en: 'Songs', th: 'เพลง', modes: ['corner']}, {k: 'inst', icon: '🎹', en: 'Instruments', th: 'เครื่องดนตรี', modes: ['piano', 'drums']}, {k: 'together', icon: '🎸', en: 'Together', th: 'เล่นด้วยกัน', modes: ['band']}, {k: 'make', icon: '✏️', en: 'Make', th: 'แต่งเพลง', modes: ['maker']}],
  'eyes-brain': [{k: 'remember', icon: '🔢', en: 'Ways to remember', th: 'วิธีจำ', modes: ['classic', 'backwards', 'colour', 'letters', 'listen', 'word', 'shapes']}, {k: 'challenge', icon: '🏔️', en: 'Challenge', th: 'ท้าทาย', modes: ['challenge', 'daily']}, {k: 'party', icon: '👥', en: 'Party', th: 'เล่นกันหลายคน', modes: ['chain']}],
  'pyraspike': [{k: 'spike', icon: '🏐', en: 'PyraSpike', th: 'วอลเลย์บอล', modes: ['beach', 'small', 'full']}, {k: 'strike', icon: '🦶', en: 'PyraStrike', th: 'ตะกร้อ', modes: ['strikesolo', 'strikeduo', 'strikeregu', 'hoop']}, {k: 'spark', icon: '⚡', en: 'PyraSpark', th: 'บอลข้ามโต๊ะ', modes: ['sparksolo', 'sparkduo']}, {k: 'train', icon: '🎯', en: 'Training', th: 'ฝึกซ้อม', modes: ['zonehits', 'combo', 'rallyrun', 'juggle']}, {k: 'fun', icon: '🎪', en: 'Fun', th: 'สนุก', modes: ['party']}],   // 🔥 pd-3a
  'sla-brall': [{k: 'sports', icon: '🏓', en: 'Sports', th: 'กีฬา', modes: ['slashot', 'slapoof', 'slaball', 'slapong', 'slabam', 'slawall']}, {k: 'cup', icon: '🏆', en: 'Cup', th: 'ทัวร์นาเมนต์', modes: ['cup']}, {k: 'link', icon: '📡', en: 'Own devices', th: 'เล่นหลายเครื่อง', modes: ['lhost', 'ljoin']}],   // 📡 p3a: lk-1b's 🔗 Join friends
  'blasoff': [{k: 'match', icon: '⚽', en: 'Matches', th: 'แข่งฟุตบอล', modes: ['fours', 'sevens', 'elevens']}, {k: 'small', icon: '🏙️', en: 'Futsal + Street', th: 'ฟุตซอล · สตรีท', modes: ['futsal', 'street']}, {k: 'skill', icon: '🕺', en: 'Tricks + skills', th: 'ลีลา · ทักษะ', modes: ['battle', 'skills', 'shootout']}],   // ⚽ bo-1 · 🌍 bo-2a · 🏙️ bo-2b
  'brawl-buddies': [{k: 'battle', icon: '🥊', en: 'Battle', th: 'ต่อสู้', modes: ['battle']}, {k: 'adv', icon: '🗺️', en: 'Brawenture', th: 'ผจญภัย', modes: ['brawenture']}],
  'georead': [{k: 'sounds', icon: '🔊', en: 'Sounds', th: 'เสียง', modes: ['phonics', 'rhyme', 'say']}, {k: 'words', icon: '🧱', en: 'Words', th: 'คำ', modes: ['build', 'sight', 'case', 'trace']}, {k: 'reading', icon: '📖', en: 'Reading', th: 'อ่าน', modes: ['story', 'types']}, {k: 'journey', icon: '🗺️', en: 'Journey', th: 'ผจญภัย', modes: ['journey']}],
  'pose-party': [{k: 'pose', icon: '🎯', en: 'Pose', th: 'ท่าโพส', modes: ['classic', 'speed', 'copy']}, {k: 'move', icon: '💃', en: 'Move', th: 'ขยับตัว', modes: ['dance', 'statue', 'freeze']}, {k: 'together', icon: '🧑‍🤝‍🧑', en: 'Together', th: 'เล่นด้วยกัน', modes: ['group', 'mirror', 'letters']}, {k: 'calm', icon: '🧘', en: 'Calm', th: 'ยืดเหยียด', modes: ['yoga']}]
};
// {k, icon, en, th, n (box order), i (place in the box)} or null
function modeGroupOf_(m) {
  const gs = MODE_GROUPS_[m.game] || [];
  for (let n = 0; n < gs.length; n++) { const i = gs[n].modes.indexOf(m.id); if (i >= 0) return { k: gs[n].k, icon: gs[n].icon, en: gs[n].en, th: gs[n].th, n: n, i: i }; }
  return null;
}
function modeKey_(m) { return m.game + ':' + m.id; }
function modeLink_(m) { return m.route + '&mode=' + m.id; }
function modeGameName_(id) { const g = BUILT_IN_GAMES.find(x => x.GameID === id); return g ? g.GameName : id; }
function modePublic_(m) { return { game: m.game, gname: modeGameName_(m.game), id: m.id, key: modeKey_(m), name: m.name, icon: m.icon, pitch: m.pitch, route: m.route, link: modeLink_(m), added: m.added || '', group: modeGroupOf_(m) }; }   // 🗂️ mg-1 group
// Which modes each player has played: {name: {'game:id': true}} — Scores, Feats and Settings are read once (memos).
function modesTriedAll_(names, st) {
  st = st || getSettings();
  const out = {}, want = {}, boards = {}, feats = {};
  names.forEach(n => { out[n] = {}; want[n] = true; });
  MODES_.forEach(m => {
    const t = m.tried || {};
    if (t.board) (boards[t.board] = boards[t.board] || []).push(m);
    (t.feat || []).forEach(f => { const k = f[0] + '|' + f[1]; (feats[k] = feats[k] || []).push(m); });
  });
  // a Scores row counts when the mode has no theme rule, or the row's Theme starts with / contains the mode's text
  scoreRows_().forEach(r => { if (!want[r.name] || !boards[r.game]) return; const th = String(r.theme || '');
    boards[r.game].forEach(m => { const t = m.tried; if ((t.themeStart && th.indexOf(t.themeStart) !== 0) || (t.theme && th.indexOf(t.theme) < 0)) return; out[r.name][modeKey_(m)] = true; }); });
  featRows_().forEach(r => { const ms = want[r.name] && feats[r.game + '|' + r.stat]; if (ms && r.value > 0) ms.forEach(m => { out[r.name][modeKey_(m)] = true; }); });
  names.forEach(n => {
    MODES_.forEach(m => { if (m.tried && m.tried.setting && String(st[m.tried.setting + n] || '').length > 2) out[n][modeKey_(m)] = true; });
    const led = jsonSetting_(st, 'ModesTried_' + n, []);
    if (Array.isArray(led)) led.forEach(k => { if (typeof k === 'string') out[n][k] = true; });
  });
  return out;
}
// Modes this player hasn't tried yet (newest first, then list order).
function getModesFor_(name, st) {
  const tried = (modesTriedAll_([name], st)[name]) || {};
  return MODES_.filter(m => !tried[modeKey_(m)]).map(modePublic_)
    .sort((a, b) => String(b.added).localeCompare(String(a.added)));
}
// In-game ✨ Also try banner: this game's modes with a tried flag for the player.
function getModesFor(name, game) {
  const tried = name ? ((modesTriedAll_([name])[name]) || {}) : {};
  return MODES_.filter(m => !game || m.game === game).map(m => Object.assign(modePublic_(m), { tried: !!tried[modeKey_(m)] }));
}
// The game says "this player started mode X" → ledger (one write the first time only).
function markModeTried(name, game, id) {
  const m = MODES_.find(x => x.game === game && x.id === id);
  if (!name || !m) return { ok: false };
  if (!listProfilesFull().some(p => p.Name === name)) return { ok: false };
  const st = getSettings(), led = jsonSetting_(st, 'ModesTried_' + name, []), list = Array.isArray(led) ? led.filter(k => typeof k === 'string') : [], k = modeKey_(m);
  if (list.indexOf(k) >= 0) return { ok: true, already: true };
  list.push(k);
  saveSetting('ModesTried_' + name, JSON.stringify(list.slice(-200)));
  return { ok: true };
}
// Dashboard / Gameroom payload: the list + which modes each player has tried (keys only).
function modesData_(players) {
  try {
    const names = players.map(p => p.Name), tried = modesTriedAll_(names), out = {};
    names.forEach(n => { out[n] = Object.keys(tried[n] || {}); });
    return { list: MODES_.map(modePublic_), tried: out, newDays: MODES_NEW_DAYS_ };
  } catch (e) { return { list: [], tried: {}, newDays: MODES_NEW_DAYS_ }; }
}
/* ============ ✨ END MODE SPOTLIGHT ============ */

/* ============ 📣 DASHBOARD NEWS ============ */
// New games (first 14 days), 🌋 Extreme / 💀 Hardcore family records set in the last 7 days, games nobody has tried yet,
// 🏁 milestones, ⚔️ close calls / 🚦 jams at the top, 📬 mail waiting and 🎂 birthdays (Settings Birthday_<Name> = 'MM-DD').
const NEW_GAMES_ = [['sciencetory', '2026-11-14', 'A science lab for the things you made!'], ['pokadif', '2026-11-14', 'Poke the difference — be a little detective!'], ['blasoff', '2026-11-14', 'Soccer with your avatar — blast it in!'], ['pyraspike', '2026-11-14', 'Drive · Dink · Dunk — volleyball with a flame!'], ['tdstories', '2026-11-14', 'Story books: defend the tower!'], ['artifactory', '2026-11-08', 'Make it yourself — real tools, real lessons!'], ['georead', '2026-11-08', 'Hear the letters, bump them into words!'], ['geoscout', '2026-11-08', 'Numbers you can touch!'], ['beat-piano', '2026-11-08', '🎹 Piano + 🥁 Drums + 🎸 Band — new ways to play!'], ['wisdeck', '2026-11-08', 'Learn, quiz, collect!'], ['eyes-brain', '2026-11-07', 'Remember the number!'], ['polyplot', '2026-11-07', 'Close shapes, catch creatures!'], ['soul-bopper', '2026-11-07', 'Bomber maze + ghosts!'], ['snakeast', '2026-11-07', 'Ride your snake!'], ['alignext', '2026-11-07', 'Line them up!'], ['brawl-buddies', '2026-11-07', 'Cartoon bonk battle!'], ['pose-party', '2026-11-07', 'Strike a pose!'], ['sla-brall', '2026-11-06', '5 racket sports!'], ['beat-corner', '2026-11-04', 'Hit the beat!'], ['sweet-swap', '2026-11-03', 'Swap to match 3'], ['word-board', '2026-11-03', 'Crossword words'], ['number-board', '2026-11-03', 'Crossword math']];
const NEWS_ALIAS_ = { 'beat-piano': { id: 'beat-corner', name: 'BeatCorner 🎹 Piano + 🥁 Drums', icon: '🎹', route: 'beatcorner&game=piano' } };   // news ids that are a new way to play inside an existing game (plan 11-bc)
function gameNewOrder_() { const seen = {}, out = []; NEW_GAMES_.forEach(x => { if (NEWS_ALIAS_[x[0]] || seen[x[0]]) return; seen[x[0]] = 1; out.push(x[0]); }); return out; }   // 🆕 gro-1: Gameroom newest first
function safeNews_(players) { try { return newsFor_(players, new Date()); } catch (e) { return []; } }
function rowBetter_(byScore) {
  return (a, b) => {
    if (byScore) { if (a.score !== b.score) return a.score > b.score; }
    else if (a.stars !== b.stars && !(a.timeSec && b.timeSec)) return a.stars > b.stars;
    if (a.timeSec && b.timeSec && a.timeSec !== b.timeSec) return a.timeSec < b.timeSec;
    if (a.timeSec !== b.timeSec) return !!a.timeSec;
    return a.stars > b.stars;
  };
}
function newsDate_(s) { const m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/); return m ? new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)).getTime() : 0; }
function newsFor_(players, now) {
  const day = 86400000, t = now.getTime(), info = {}, names = {}, out = [];
  BUILT_IN_GAMES.forEach(g => { info[g.GameID] = g; });
  try { getGames().forEach(g => { if (info[g.GameID]) info[g.GameID] = Object.assign({}, info[g.GameID], { GameName: g.GameName || info[g.GameID].GameName }); }); } catch (e) {}
  players.forEach(p => { names[p.Name] = true; });
  NEW_GAMES_.forEach(([id, d, tag]) => { const al = NEWS_ALIAS_[id], g = al ? (info[al.id] && Object.assign({}, info[al.id], { GameName: al.name, Icon: al.icon, PageRoute: al.route })) : info[id], age = (t - newsDate_(d)) / day; if (g && age >= -1 && age < 7) out.push({ kind: 'new', id: id, name: g.GameName, icon: g.Icon, route: g.PageRoute, tag: tag || '', at: d }); });
  const rows = scoreRows_().filter(r => names[r.name]), recs = [];
  RECORD_GAMES.forEach(gid => {
    const g = info[gid] || {}, mine = rows.filter(r => r.game === gid), better = rowBetter_(mine.some(r => r.score > 0));
    [4, 5].forEach(lvl => {
      const rs = mine.filter(r => r.level === lvl); if (!rs.length) return;
      const top = rs.reduce((a, b) => better(b, a) ? b : a), when = newsDate_(top.date);
      if (!when || t - when > 7 * day) return;
      const before = rs.slice(0, rs.indexOf(top)), prev = before.length ? before.reduce((a, b) => better(b, a) ? b : a) : null;
      recs.push({ kind: 'record', id: gid, name: g.GameName || gid, icon: g.Icon || '🏆', route: g.PageRoute || '', player: top.name, level: lvl, score: top.score, timeSec: top.timeSec, stars: top.stars, byScore: top.score > 0,
        prev: prev ? { name: prev.name, score: prev.score, timeSec: prev.timeSec } : null, at: top.date, when: when });
    });
  });
  recs.sort((a, b) => b.when - a.when).slice(0, 5).forEach(r => { delete r.when; out.push(r); });
  const played = {}; rows.forEach(r => { played[r.game] = true; });
  RECORD_GAMES.filter(id => !played[id] && info[id] && info[id].Status === 'Live').slice(0, 2).forEach(id => out.push({ kind: 'try', id: id, name: info[id].GameName, icon: info[id].Icon, route: info[id].PageRoute }));
  milestoneNews_(rows, info, t).forEach(n => out.push(n));
  raceNews_(players, info).forEach(n => out.push(n));
  const st = getSettings();
  players.forEach(p => {
    const gl = jsonSetting_(st, 'Gifts_' + p.Name, []), mail = Array.isArray(gl) ? gl.filter(g => g && !g.opened).length : 0;
    if (mail) out.push({ kind: 'mail', player: p.Name, count: mail });
    const days = birthdayIn_(st['Birthday_' + p.Name], now);
    if (days >= 0 && days <= 7) out.push({ kind: 'birthday', player: p.Name, days: days, date: String(st['Birthday_' + p.Name]) });
  });
  comicNews_().forEach(n => out.push(n));   // 🏅 ck-1b Comic of the day
  return out;
}
// 🏁 Milestones: who just reached the 💀 Hardcore finish line (first clear in the last 14 days),
// and who is close (Hard / 🌋 Extreme played in the last 7 days). step = levels reached, 1–6.
function milestoneNews_(rows, info, t) {
  const day = 86400000, best = {}, done = [], near = [];
  rows.forEach(r => {
    if (RECORD_GAMES.indexOf(r.game) === -1 || !(r.level >= 0 && r.level < LEVEL_COUNT)) return;
    const k = r.game + '|' + r.name, b = best[k] || (best[k] = { game: r.game, name: r.name, level: -1, first: 0, last: 0 });
    const when = newsDate_(r.date);
    if (r.level > b.level) { b.level = r.level; b.first = when; b.last = when; }
    else if (r.level === b.level && when > b.last) b.last = when;
  });
  Object.keys(best).forEach(k => {
    const b = best[k], g = info[b.game] || {}, n = { kind: 'milestone', id: b.game, name: g.GameName || b.game, icon: g.Icon || '🏁', route: g.PageRoute || '', player: b.name, step: b.level + 1, done: b.level === HARDCORE };
    if (n.done && b.first && t - b.first <= 14 * day) { n.when = b.first; done.push(n); }
    else if (!n.done && b.level >= 3 && b.last && t - b.last <= 7 * day) { n.when = b.last; near.push(n); }
  });
  done.sort((a, b) => b.when - a.when);
  near.sort((a, b) => (b.step - a.step) || (b.when - a.when));
  return done.concat(near).slice(0, 3).map(n => { delete n.when; return n; });
}
// ⚔️ Close call: #2 is within 10% of the family record. 🚦 Jam: 3 or more players within 10% (or tied) at the top.
// Looks at Intermediate → 💀 Hardcore; one story per game (the highest level that has one).
function raceNews_(players, info) {
  const out = [], boards = allBoards_(players);
  RECORD_GAMES.forEach(gid => {
    const b = boards[gid]; if (!b) return;
    const g = info[gid] || {};
    for (let lvl = HARDCORE; lvl >= 2; lvl--) {
      const top = (b.levels[lvl] || {}).top || [];
      const val = r => b.byScore ? r.score : r.timeSec;
      if (top.length < 2 || !(val(top[0]) > 0)) continue;
      const gap = r => val(r) > 0 ? Math.abs(val(top[0]) - val(r)) / val(top[0]) : 9;
      const pack = top.filter(r => gap(r) <= 0.1);
      const base = { id: gid, name: g.GameName || gid, icon: g.Icon || '🏆', route: g.PageRoute || '', level: lvl, byScore: b.byScore };
      if (pack.length >= 3) { out.push(Object.assign(base, { kind: 'jam', players: pack.map(r => r.name), gapPct: gap(pack[pack.length - 1]) })); break; }
      if (pack.length === 2) {
        out.push(Object.assign(base, { kind: 'close', leader: top[0].name, chaser: top[1].name, lead: val(top[0]), behind: Math.abs(val(top[0]) - val(top[1])), gapPct: gap(top[1]) }));
        break;
      }
    }
  });
  out.sort((a, b) => (b.kind === 'jam') - (a.kind === 'jam') || (b.level - a.level) || (a.gapPct - b.gapPct));
  return out.slice(0, 3).map(n => { delete n.gapPct; return n; });
}
// 🎂 Days until the next birthday ('MM-DD'), 0 = today; -1 when not set.
function birthdayIn_(mmdd, now) {
  const m = String(mmdd || '').match(/^(\d{2})-(\d{2})$/); if (!m) return -1;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(now.getFullYear(), +m[1] - 1, +m[2]);
  if (next < today) next = new Date(now.getFullYear() + 1, +m[1] - 1, +m[2]);
  return Math.round((next - today) / 86400000);
}
// 🎂 Admin: set a player's birthday ('MM-DD', or '' to clear). Needs the grown-up PIN.
function savePlayerBirthday(name, mmdd, adminPin) {
  if (!verifyAdminPin(adminPin)) throw new Error('The grown-up PIN is not right.');
  if (!name || !listProfilesFull().some(p => p.Name === name)) throw new Error('Pick a player first.');
  const v = String(mmdd || '');
  const m = v.match(/^(\d{2})-(\d{2})$/);
  if (v && !(m && +m[1] >= 1 && +m[1] <= 12 && +m[2] >= 1 && +m[2] <= [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][+m[1] - 1])) throw new Error('Pick a month and a day.');
  saveSetting('Birthday_' + name, v);
  return { ok: true, birthday: v };
}

function getGameroomData(player) {
  ensureBuiltInGames_();
  const profile = listProfilesFull().find(p => p.Name === player);
  if (profile) { try { touchSeen_(player); } catch (e) {} }
  const games = getGames().filter(g => g.Status === 'Live');
  // Per-game progress for the player's cards: levels cleared, best stars.
  const progress = {};
  if (profile) {
    const levelGames = { maze: () => mazeProgressFor_(player) };
    Object.keys(LEVEL_GAMES).forEach(id => { levelGames[id] = () => levelProgressFor_(player, id); });
    games.forEach(g => {
      if (!levelGames[g.GameID]) return;
      const p = levelGames[g.GameID]();
      progress[g.GameID] = {
        cleared: p.unlocked, total: LEVEL_COUNT,
        stars: p.best.reduce((n, b) => n + (b ? b.stars : 0), 0),
        best: p.best,
      };
    });
  }
  // Badge count per game (mini games have badges, not timed levels).
  const badges = {};
  if (profile) {
    const pv = progressValues_().slice(1);
    pv.forEach(r => {
      if (r[0] !== player) return;
      const n = String(r[4] || '').split(',').map(t => t.trim()).filter(Boolean).length;
      badges[r[1]] = (badges[r[1]] || 0) + n;
    });
  }
  const actives = activePlayers_(listProfilesFull());
  const records = {};
  Object.keys(progress).forEach(id => { records[id] = recordsFor_(id, actives); });
  const me = profile ? getLeaderboard().filter(x => x.name === player)[0] : null;
  return {
    games: games,
    newOrder: gameNewOrder_(),   // 🆕 gro-1
    badges: badges,
    records: records,
    playerAge: profile ? (profile.Age || '') : '',
    progress: progress,
    trophies: me ? me.tokenCount : 0,
    modes: profile ? modesData_([profile]) : modesData_([]),   // ✨ modes-2: mode chips + ✨ Modes you haven't tried
    settings: getSettings(),
  };
}

function getAchievementsData(player) {
  const players = activePlayers_(listProfilesFull());
  if (player && players.some(p => p.Name === player)) { try { safeRecordFeats_(player, 'app', { archive: 1 }); } catch (e) {} }
  const mazeBest = {}, bests = {}, records = {};
  RECORD_GAMES.forEach(g => { records[g] = gameRecords_(g, players); });
  players.forEach(p => {
    bests[p.Name] = {};
    RECORD_GAMES.forEach(g => { bests[p.Name][g] = bestFor_(p.Name, g); });
    mazeBest[p.Name] = bests[p.Name].maze;
  });
  return {
    leaderboard: getLeaderboard(),
    mazeRecords: recordsFor_('maze', players),
    mazeBest: mazeBest,
    records: records,
    bests: bests,
    titles: titlesData_(players),
    boards: allBoards_(players),
    players: players.map(p => p.Name),
    recentScores: rankRecent_(recentScores_(players, 10), allBoards_(players)),
    settings: getSettings(),
  };
}

function getAdminData() {
  return { players: listProfilesFull(), settings: getSettings() };
}

/* ============ BUILT-IN GAMES (registered automatically) ============ */
// Games that ship with the app add their own Games-tab row the first time
// the Gameroom opens — no script to run by hand. Safe to call every time:
// a row is only added when its GameID is missing. Edit a row in the sheet
// freely afterwards (name, icon, Status); it is never overwritten.
const BUILT_IN_GAMES = [
  { GameID: 'tdstories', GameName: 'TD-Stories', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Strategy + Reading (planning, choosing, story books, castle + dragon facts)',
    Status: 'Live', PageRoute: 'tdstories', Icon: '🏰', Description: 'Tower-defence story books: 🐉👑 Dra-Princess Diary — a princess and her dragon keep every knight, prince and king away from the tower. Before each wave your heroes level up: pick ONE skill card (5 colours 🔴🔵🟤🟢🟣, Lv 1–3), evolve at tier 5, ULTIMATE at tier 10. Diary pages + 💡 lesson cards between chapters. More books coming!' },
  { GameID: 'artifactory', GameName: 'Artifactory', SkillLevel: 'build · design · every age', STEAMFocus: 'Engineering + Design (how real machines work, materials, symmetry)',
    Status: 'Live', PageRoute: 'artifactory', Icon: '🏭', Description: 'The maker app: turn cups and trophies on the 🌀 lathe, polish and cut 💎 gems, paint and engrave on the 🎨 finish bench, make things for your room — then wear what you made in the 🪞 fitting mirror. Materials from your bag and the family shelf, ⭐ blueprint challenges, a real-life lesson at every machine' },
  { GameID: 'georead', GameName: 'GeoRead', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Reading + Phonics (letter sounds, blending, spelling)',
    Status: 'Live', PageRoute: 'georead', Icon: '🔤', Description: 'Phonics with letter boxes: your avatar carries letter boxes — tap one to hear its SOUND, bump them together to blend ("c… a… t… cat!"). 🔊 Phonics and 🧱 Word builder, 6 levels from s a t p to magic e and 2-syllable words, 6 house themes and letter-box looks to pick' },
  { GameID: 'geoscout', GameName: 'GeoScout', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Math (counting, + − × ÷, comparing, balance, shapes)',
    Status: 'Live', PageRoute: 'geoscout', Icon: '🔢', Description: 'Numbers you can touch: number blocks with faces — snap them to add, split to take away, copy to multiply, share to divide. ⚖️ Scale (> < = and balance, even weigh your avatar) and 🧱 Count (make the number), 6 house themes as blocks' },
  { GameID: 'wisdeck', GameName: 'WisDeck', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Science + World + History facts (flags, maps, animals, space, chemistry, inventions) in English + Thai',
    Status: 'Live', PageRoute: 'wisdeck', Icon: '🃏', Description: 'Learn-by-quiz card game: 1,840 real cards on 5 shelves (🌍 World · ⏳ Time · 🦁 Zoo · 🔬 Science · 🛠️ Human-made). 📚 Learn, 🧠 Quiz to win cards, then play 🔢 WisCount and 🂡 WisJack with your deck' },
  { GameID: 'eyes-brain', GameName: 'Eyes Brain Riot', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Memory + Numbers (chunking, working memory, patterns)',
    Status: 'Live', PageRoute: 'eyesbrain', Icon: '👀', Description: 'Number memory: tap 👀 Reveal, the number shows in little chunks for a few seconds, then type it back. 🔢 Classic, 🔁 Backwards, 🏔️ Challenge, pictures, letters, colours, 👂 Listen, ➕ Chain for 2–4 players, 🔥 combos and a 🧠 riot meter' },
  { GameID: 'polyplot', GameName: 'Polyplot', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Geometry + Strategy (polygons, tessellations, counting chains)',
    Status: 'Live', PageRoute: 'polyplot', Icon: '⬛', Description: 'Dots & boxes grown up: draw lines on square, triangle, hexagon, octagon and mixed dot maps — close a shape to own it. ⬜ Classic, 🏹 Hunt (run, coins, creatures, events, cards), 🏰 Fortiplot (build towers) and 🛡️ co-op waves, 1–4 players + robots' },
  { GameID: 'trash-pointer', GameName: 'Trash Pointer', SkillLevel: 'beginner', STEAMFocus: 'Environmental Science / Sorting',
    Status: 'Live', PageRoute: 'minigames', Icon: '🗑️', Description: 'Drag trash into the correct color-coded bin and help keep the park clean' },
  { GameID: 'maze', GameName: 'Maze Explorer', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Problem Solving / Spatial',
    Status: 'Live', PageRoute: 'maze', Icon: '🧭', Description: 'A brand-new maze every time, from Basic to Extreme' },
  { GameID: 'robot-adventure', GameName: 'Code the Robot', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Coding / Sequencing',
    Status: 'Live', PageRoute: 'robot', Icon: '🤖', Description: 'Write code to guide the robot past traffic, traps and storms' },
  { GameID: 'checkers', GameName: 'Checkers', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Strategy / Logic',
    Status: 'Live', PageRoute: 'checkers', Icon: '🔴', Description: 'Beat the bot from Basic to Extreme, or play a friend — classic, fantasy or futuristic boards' },
  { GameID: 'chess', GameName: 'Chess', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Strategy / Logic',
    Status: 'Live', PageRoute: 'chess', Icon: '♞', Description: 'Mini chess to the real thing: checkmate the bot or play a friend' },
  { GameID: 'pinball', GameName: 'Pinball', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Physics / Reflexes',
    Status: 'Live', PageRoute: 'pinball', Icon: '🎯', Description: '7 tables, a new layout every game: bonus scenes, Lucky Lights, multiball and the Break-out jackpot' },
  { GameID: 'hopper', GameName: 'Dodgy Hopper', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Timing / Reflexes',
    Status: 'Live', PageRoute: 'hopper', Icon: '🐸', Description: 'Hop your avatar across roads, rivers and rails in 6 wild worlds' },
  { GameID: 'turbo', GameName: 'Turbo Trail', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Timing / Reflexes',
    Status: 'Live', PageRoute: 'turbo', Icon: '🏎️', Description: 'Race to the finish before the clock runs out — jumps, drifts, rivals and wild worlds' },
  { GameID: 'memory', GameName: 'Memory Match', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Memory / Focus',
    Status: 'Live', PageRoute: 'memory', Icon: '🃏', Description: 'Flip the cards and find the pairs — 4×4 to 8×8, on your own or with up to 4 players' },
  { GameID: 'math-quest', GameName: 'Math Quest', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Math / Numbers',
    Status: 'Live', PageRoute: 'mathquest', Icon: '🧮', Description: 'Add, take away, times and share in 5 worlds — pictures for little ones, big numbers for big kids' },
  { GameID: 'double-up', GameName: 'Double Up', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Math / Strategy',
    Status: 'Live', PageRoute: 'doubleup', Icon: '🔀', Description: 'Slide the tiles — two the same join and grow up (2, 4, 8 … 4096): eggs to whales, rocks to galaxies' },
  { GameID: 'block-drop', GameName: 'Block Drop', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Spatial / Planning',
    Status: 'Live', PageRoute: 'blockdrop', Icon: '🧱', Description: 'Turn and drop the falling blocks to fill whole rows — faces, dinos, space cargo, gems and jigsaw pieces' },
  { GameID: 'pop-blocks', GameName: 'Pop Blocks', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Strategy / Patterns',
    Status: 'Live', PageRoute: 'popblocks', Icon: '🫧', Description: 'Tap groups of the same blocks to pop them — rockets, bombs, rainbows, missions and chicks to rescue' },
  { GameID: 'number-grid', GameName: 'Digitinct', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Logic / Numbers',
    Status: 'Live', PageRoute: 'numbergrid', Icon: '🔢', Description: 'Fill the grid so every row, column and box has each picture once — 4×4 up to the 17-clue Hardcore' },
  { GameID: 'number-board', GameName: 'Algebros', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Math / Words',
    Status: 'Live', PageRoute: 'numberboard', Icon: '➗', Description: 'Build number sentences like a crossword (3 + 4 = 7) — beat the robot or play together with 2–4 players' },
  { GameID: 'word-board', GameName: 'Lettercraft', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Words / Spelling',
    Status: 'Live', PageRoute: 'wordboard', Icon: '🔤', Description: 'Make words like a crossword with letter tiles — beat the robot or play together with 2–4 players' },
  { GameID: 'sweet-swap', GameName: 'Sweet Swap', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Strategy / Patterns',
    Status: 'Live', PageRoute: 'sweetswap', Icon: '🍬', Description: 'Swap two pictures to make rows of 3 — bouncers, crosses, bombs, rainbows and power cells, blockers to break, 7 picture sets' },
  { GameID: 'beat-corner', GameName: 'BeatCorner', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Music / Rhythm',
    Status: 'Live', PageRoute: 'beatcorner', Icon: '🎵', Description: 'Hit the beats when they reach the corner buttons — 6 levels × 10 songs, holds, slides, pop-up buttons and spinning spirals; plus 🎹 Piano, 🥁 Drums and 🎸 Band' },
  { GameID: 'pyraspike', GameName: 'PyraDive', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Sport / Physics (arcs, timing, teamwork)',
    Status: 'Live', PageRoute: 'pyradive', Icon: '🔥', Description: 'Volleyball with your avatar — Drive · Dink · Dunk: 3 touches a side (bump, set, DUNK), a 🔥 Pyra meter that turns your next move into a Pyra… move, roles 🚀 Drive · 🪶 Dink · 💥 Dunk. 🏐 PyraSpike Beach 2v2 · Small 3v3 · Full 6v6, 6 levels, 1–2 players.' },
  { GameID: 'pokadif', GameName: 'Pokadif', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Science / Observation (attention, comparing, counting)',
    Status: 'Live', PageRoute: 'pokadif', Icon: '🔍', Description: 'Be a little detective: two pictures look the same, but a few things changed — poke every difference. Every picture is made on the spot (never the same twice) in the 6 house scenes; 🎨 colour · ➖➕ missing / extra · 📏 size · 🔺 shape · 🔄 turn / flip · 🔢 count, 6 levels, 🔍 magnifier hints.' },
  { GameID: 'sciencetory', GameName: 'Sciencetory', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Science / Engineering (materials, forces, predicting)',
    Status: 'Live', PageRoute: 'sciencetory', Icon: '🔬', Description: 'Test the things YOU made in Artifactory like a real lab: press, pull, twist, bend, drop, spin, float … — guess first, then watch the gauge. A test can break a thing (fix it with 🔧 repair, broken is never lost). ⚙️ Mechanic now; ⚗️ Chemistry, 🌈 Optics, 🌌 Cosmic and more coming.' },
  { GameID: 'sla-brall', GameName: 'SlaBrall', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Sport / Physics (spin, bounce, angles)',
    Status: 'Live', PageRoute: 'slabrall', Icon: '🏓', Description: '6 racket sports in one: SlaShot table hockey, SlaPoof pickleball, SlaBall tennis, SlaPong ping-pong, SlaBam badminton, SlaWall squash — beat the robot, play 2 players or 2 vs 2, spin shots and 14 power-ups' },
  { GameID: 'blasoff', GameName: 'BlasOff', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Sport / Physics (passing angles, power, teamwork)',
    Status: 'Live', PageRoute: 'blasoff', Icon: '⚽', Description: 'Soccer with your avatar — 4v4 · 7v7 · 11v11, 🥅 futsal and a 🏙️ street cage 1v1: pass, shoot, tricks, nutmegs and volleys, shout to your robot keeper, 6 levels with real rules from offside to yellow cards' },
  { GameID: 'pose-party', GameName: 'Pose Party', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Movement / Body awareness (angles, balance)',
    Status: 'Live', PageRoute: 'poseparty', Icon: '📷', Description: 'Copy the poses with your whole body — the camera checks how close you are! Classic levels, 60-second Speed and Copy Me' },
  { GameID: 'brawl-buddies', GameName: 'Brawl Buddies', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Reflex / Timing (high, low, combos)',
    Status: 'Live', PageRoute: 'brawlbuddies', Icon: '🥊', Description: 'Cartoon bonk battle with your avatar — boop, bonk, block, uppercut and juggle up to 5 bounces. Beat Robo-Buddy on 6 levels or play 2 players on one keyboard' },
  { GameID: 'alignext', GameName: 'Alignext', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Logic / Strategy (lines, blocking, planning ahead)',
    Status: 'Live', PageRoute: 'alignext', Icon: '🔴', Description: 'Line them up! 🔴 Drop discs into the stand or ❌⭕ Omnifile pieces anywhere on the board — beat Robo on 6 levels, 2 players or 3–4 in Drop, best of 3' },
  { GameID: 'snakeast', GameName: 'Snakize', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Planning / Spatial thinking (paths, loops, area)',
    Status: 'Live', PageRoute: 'snakize', Icon: '🐍', Description: 'Ride your snake! 🍎 Snakeast grid snake, 🧭 Snakigate free-steering arena with family snakes, 🏰 Snakastle land grab and 📜 Snaketale story quests — 6 levels, 2 players on one keyboard' },
  { GameID: 'soul-bopper', GameName: 'Soul Bopper', SkillLevel: 'beginner · intermediate · advanced', STEAMFocus: 'Strategy / Planning (pop shapes, chain reactions, escape routes)',
    Status: 'Live', PageRoute: 'soulbopper', Icon: '👻', Description: 'Bomber maze with your avatar — plant, pop in a + shape, grab power-ups and come back as a ghost. ⚔️ Battle, 💩 Classic Avatar, 🏳️ Hold the land and 🗺️ Stage, 1–4 players + bots' },
  { GameID: 'workshop', GameName: 'Furniture Workshop', SkillLevel: 'build · decorate · vote', STEAMFocus: 'Design / Making',
    Status: 'Live', PageRoute: 'workshop', Icon: '🔨', Description: 'Build your own beds, chairs, lamps and more — use them in My Room, give them, and win the Design Show' },
];
// Built-in games that got a new name: an old sheet row still showing the OLD name is renamed once (a name Aowu typed himself is left alone).
const RENAMED_GAMES_ = { 'number-board': ['Number Puzzle Board', 'Algebros'], 'word-board': ['Word Puzzle Board', 'Lettercraft'], 'number-grid': ['Number Grid', 'Digitinct'] };
function ensureBuiltInGames_() {
  const sh = ss_().getSheetByName('Games');
  if (!sh || sh.getLastRow() === 0) return;
  const have = () => {
    const v = sh.getDataRange().getValues();
    const col = v[0].indexOf('GameID'), nc = v[0].indexOf('GameName');
    return { headers: v[0], ids: v.slice(1).map(r => r[col]), names: v.slice(1).map(r => nc >= 0 ? r[nc] : ''), nameCol: nc };
  };
  const stale = h => h.nameCol < 0 ? [] : h.ids.map((id, k) => (RENAMED_GAMES_[id] && h.names[k] === RENAMED_GAMES_[id][0]) ? k : -1).filter(k => k >= 0);
  const now = have();   /* read the tab once (was once per built-in game) */
  if (BUILT_IN_GAMES.every(g => now.ids.indexOf(g.GameID) !== -1) && !stale(now).length) return;
  GAMES_MEMO_ = null;
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const cur = have(); // re-read inside the lock so two tabs can't both add it
    stale(cur).forEach(k => sh.getRange(k + 2, cur.nameCol + 1).setValue(RENAMED_GAMES_[cur.ids[k]][1]));
    BUILT_IN_GAMES.forEach(g => {
      if (cur.ids.indexOf(g.GameID) === -1) sh.appendRow(cur.headers.map(h => (g[h] !== undefined ? g[h] : '')));
    });
  } finally {
    lock.releaseLock();
  }
}

/* ============ MAZE EXPLORER ============ */
// Progress row: GameID 'maze', SeriesID 'main', UnlockedLevel = number of
// levels cleared (0-5), Tokens = one badge per level cleared.
const MAZE_LEVEL_BADGES = ['Maze Basic', 'Maze Junior', 'Maze Intermediate', 'Maze Hard', 'Maze Extreme', 'Maze Hardcore'];
const MAZE_LEVEL_NAMES = ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'];
// Every main game has 6 levels: Basic → Extreme + 💀 Hardcore (opens after Extreme; 1 life, no helpers, ×3 points).
const LEVEL_COUNT = 6, HARDCORE = 5;

function mazeProgressFor_(name) {
  const rows = getProgress(name, 'maze').filter(r => r.SeriesID === 'main');
  const r = rows[0];
  return {
    unlocked: r ? (Number(r.UnlockedLevel) || 0) : 0,
    tokens: r ? String(r.Tokens || '').split(',').map(t => t.trim()).filter(Boolean) : [],
    best: bestFor_(name, 'maze'),
  };
}

function getMazeData(player) {
  const players = activePlayers_(listProfilesFull()).map(p => ({ Name: p.Name, Age: p.Age || '' }));
  const progress = {};
  players.forEach(p => { progress[p.Name] = mazeProgressFor_(p.Name); });
  const st = getSettings(), avatars = {};
  players.forEach(p => { avatars[p.Name] = parseAvatar_(st['Avatar_' + p.Name]); });   // 🧑 your avatar walks the maze (11w)
  return { players: players, progress: progress, records: recordsFor_('maze', players), settings: st, avatars: avatars, player: player || '' };
}

// Called when a level is cleared. Merges on the server (never lowers the
// unlocked level, never drops a badge), so an old tab can't undo progress.
function saveMazeResult(name, levelIndex, extra) {
  const idx = Number(levelIndex);
  if (!name || !(idx >= 0 && idx < MAZE_LEVEL_BADGES.length)) throw new Error('Bad maze result.');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const cur = mazeProgressFor_(name);
    const unlocked = Math.max(cur.unlocked, idx + 1);
    const badge = MAZE_LEVEL_BADGES[idx];
    const tokens = cur.tokens.indexOf(badge) === -1 ? cur.tokens.concat([badge]) : cur.tokens;
    saveProgress(name, 'maze', 'main', unlocked, tokens);
    const res = { unlocked: unlocked, tokens: tokens, newBadge: cur.tokens.indexOf(badge) === -1 ? badge : '' };
    return Object.assign(res, safeLogScore_(name, 'maze', idx, MAZE_LEVEL_NAMES[idx], extra));
  } finally {
    lock.releaseLock();
  }
}

/* ============ LEVEL-BASED GAMES (shared: Stacking, Code the Robot, ...) ============ */
// Same model as the maze: Progress row (GameID, SeriesID 'main'),
// UnlockedLevel = levels cleared (0-5), Tokens = one badge per level.
const LEVEL_GAMES = {
  // 🏰 TD-Stories (td-1): one Archive board per BOOK — the Theme column says the chapter ("📖 Ch 1 · The Lonely Tower")
  'td-draprincess': {
    badges: ['Diary Basic', 'Diary Junior', 'Diary Intermediate', 'Diary Hard', 'Diary Extreme', 'Diary Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // 🏭 Artifactory: ⭐ blueprint challenges — one Archive board, the Theme column says the station ("🌀 Lathe · Cup"); the detail card shows the best per station
  'artifactory': {
    badges: ['Maker Basic', 'Maker Junior', 'Maker Intermediate', 'Maker Hard', 'Maker Extreme', 'Maker Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // 🔤 GeoRead (plan GeoRead): one Archive board for every way to play (the Theme column says the mode: "🔊 Phonics · 🦖 Jungle Gate")
  'georead': {
    badges: ['Reader Basic', 'Reader Junior', 'Reader Intermediate', 'Reader Hard', 'Reader Extreme', 'Reader Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // 🔢 GeoScout: one Archive board for every way to play (the Theme column says the way: "⚖️ Scale · 🦖 Dino Quarry"); the detail card shows the best per way
  'geoscout': {
    badges: ['Scout Basic', 'Scout Junior', 'Scout Intermediate', 'Scout Hard', 'Scout Extreme', 'Scout Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // 🃏 WisDeck (plan 11z): three Archive boards on one page — 🧠 quiz (Theme column = the category), 🔢 WisCount and 🂡 WisJack (vs the robot)
  'wisdeck': {
    badges: ['Card Basic', 'Card Junior', 'Card Intermediate', 'Card Hard', 'Card Extreme', 'Card Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'wiscount': {
    badges: ['Count Basic', 'Count Junior', 'Count Intermediate', 'Count Hard', 'Count Extreme', 'Count Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'wisjack': {
    badges: ['Jack Basic', 'Jack Junior', 'Jack Intermediate', 'Jack Hard', 'Jack Extreme', 'Jack Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // 👀🧠 Eyes Brain Riot (plan 11k): one Archive board for every way to play (the Theme column says the way: "🔢 Classic · 🦖 Dino Den")
  'eyes-brain': {
    badges: ['Brain Basic', 'Brain Junior', 'Brain Intermediate', 'Brain Hard', 'Brain Extreme', 'Brain Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // ⬛ Polyplot (plan 11l): one Archive board for every mode (Classic / Hunt / Fortiplot / co-op)
  'polyplot': {
    badges: ['Plot Basic', 'Plot Junior', 'Plot Intermediate', 'Plot Hard', 'Plot Extreme', 'Plot Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'soul-bopper': {
    badges: ['Bopper Basic', 'Bopper Junior', 'Bopper Intermediate', 'Bopper Hard', 'Bopper Extreme', 'Bopper Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // 🔴 Alignext (plan 11x): one game page, two Archive boards — 'alignext' = 🔴 Drop, 'omnifile' = ❌⭕ Omnifile
  'alignext': {
    badges: ['Line Basic', 'Line Junior', 'Line Intermediate', 'Line Hard', 'Line Extreme', 'Line Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // 🗺️ Brawenture (plan 11i-2): the adventure mode inside Brawl Buddies — one Archive board, level = tale (Theme column = difficulty)
  'brawenture': {
    badges: ['Playground Hero', 'Candy Hero', 'Castle Hero', 'Zombie Hero', 'Town Hero', 'Sea Hero'],
    levelNames: ['Playground Rumble', 'Candy Factory Defense', 'Castle Climb', 'Zombie Crawl', 'Monster Outbreak', 'Undersea Rescue'],
  },
  'omnifile': {
    badges: ['Omni Basic', 'Omni Junior', 'Omni Intermediate', 'Omni Hard', 'Omni Extreme', 'Omni Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // 🐍 Snakize (plan 11y): one game page, three Archive boards — 'snakeast' = 🍎 grid snake, 'snakigate' = 🧭 arena, 'snakastle' = 🏰 land grab (📜 Snaketale = story progress only)
  'snakeast': {
    badges: ['Feast Basic', 'Feast Junior', 'Feast Intermediate', 'Feast Hard', 'Feast Extreme', 'Feast Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'snakigate': {
    badges: ['Slither Basic', 'Slither Junior', 'Slither Intermediate', 'Slither Hard', 'Slither Extreme', 'Slither Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'snakastle': {
    badges: ['Castle Basic', 'Castle Junior', 'Castle Intermediate', 'Castle Hard', 'Castle Extreme', 'Castle Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'brawl-buddies': {
    badges: ['Bonk Basic', 'Bonk Junior', 'Bonk Intermediate', 'Bonk Hard', 'Bonk Extreme', 'Bonk Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'number-grid': {
    badges: ['Grid Basic', 'Grid Junior', 'Grid Intermediate', 'Grid Hard', 'Grid Extreme', 'Grid Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'pop-blocks': {
    badges: ['Pop Basic', 'Pop Junior', 'Pop Intermediate', 'Pop Hard', 'Pop Extreme', 'Pop Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'block-drop': {
    badges: ['Drop Basic', 'Drop Junior', 'Drop Intermediate', 'Drop Hard', 'Drop Extreme', 'Drop Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'pose-party': {
    badges: ['Pose Basic', 'Pose Junior', 'Pose Intermediate', 'Pose Hard', 'Pose Extreme', 'Pose Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // 🔥 PyraDive (pd-1): one page, one board per sport — 'pyraspike' 🏐 (R1) · 'pyrastrike' 🦶 (R2) · 'pyraspark' ⚡ (R3); Theme = '<mode> · <arena>'
  'pyraspike': {
    badges: ['Spike Basic', 'Spike Junior', 'Spike Intermediate', 'Spike Hard', 'Spike Extreme', 'Spike Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'blasoff': {   // ⚽ bo-1
    badges: ['Kick Basic', 'Kick Junior', 'Kick Intermediate', 'Kick Hard', 'Kick Extreme', 'Kick Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // 🔍 Pokadif (pk-1): one board — 🖼️ Find the Difference cases (3 pictures); Theme = '🖼️ Spot · <scene>'. R2 adds ⏱️ Arcade on its own board.
  'pokadif': {
    badges: ['Rookie Eye', 'Sharp Spotter', 'Clue Finder', 'Keen Inspector', 'Super Sleuth', 'Master Detective'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // 🔬 Sciencetory (sc-1): one board — Theme = '<section> · <test>' ('⚙️ Mechanic · Press')
  'sciencetory': {
    badges: ['Lab Basic', 'Lab Junior', 'Lab Intermediate', 'Lab Hard', 'Lab Extreme', 'Lab Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // ⏱️ Pokadif Photo Hunt Arcade (pk-2b): pictures in a row against the clock; cleared = ✅ checkpoint 1 (5 pictures); Theme = '⏱️ Arcade · <scene>'
  'pokadif-arcade': {
    badges: ['Quick Eye', 'Fast Finder', 'Speed Sleuth', 'Turbo Spotter', 'Lightning Detective', 'Arcade Legend'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // 📖 Pokadif Detective Adventure (pk-3a): one case = 3 chapters; Theme = '📖 <case icon> <case name>'
  'pokadif-case': {
    badges: ['Case Rookie', 'Clue Collector', 'Trail Tracker', 'Code Cracker', 'Super Sleuth', 'Legend Detective'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'sla-brall': {
    badges: ['Rally Basic', 'Rally Junior', 'Rally Intermediate', 'Rally Hard', 'Rally Extreme', 'Rally Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'beat-corner': {
    badges: ['Beat Basic', 'Beat Junior', 'Beat Intermediate', 'Beat Hard', 'Beat Extreme', 'Beat Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  // 🎹 🥁 BeatCorner Piano + Drums (plan 11-bc): two more ways to play inside BeatCorner, each its own Archive board (6 songs a level, pass 3)
  'beat-piano': {
    badges: ['Piano Basic', 'Piano Junior', 'Piano Intermediate', 'Piano Hard', 'Piano Extreme', 'Piano Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'beat-drums': {
    badges: ['Drums Basic', 'Drums Junior', 'Drums Intermediate', 'Drums Hard', 'Drums Extreme', 'Drums Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'sweet-swap': {
    badges: ['Sweet Basic', 'Sweet Junior', 'Sweet Intermediate', 'Sweet Hard', 'Sweet Extreme', 'Sweet Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'word-board': {
    badges: ['Words Basic', 'Words Junior', 'Words Intermediate', 'Words Hard', 'Words Extreme', 'Words Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'number-board': {
    badges: ['Board Basic', 'Board Junior', 'Board Intermediate', 'Board Hard', 'Board Extreme', 'Board Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'double-up': {
    badges: ['Double Basic', 'Double Junior', 'Double Intermediate', 'Double Hard', 'Double Extreme', 'Double Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'math-quest': {
    badges: ['Math Basic', 'Math Junior', 'Math Intermediate', 'Math Hard', 'Math Extreme', 'Math Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'memory': {
    badges: ['Memory Basic', 'Memory Junior', 'Memory Intermediate', 'Memory Hard', 'Memory Extreme', 'Memory Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'turbo': {
    badges: ['Turbo Basic', 'Turbo Junior', 'Turbo Intermediate', 'Turbo Hard', 'Turbo Extreme', 'Turbo Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'hopper': {
    badges: ['Hopper Basic', 'Hopper Junior', 'Hopper Intermediate', 'Hopper Hard', 'Hopper Extreme', 'Hopper Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'pinball': {
    badges: ['Pinball Basic', 'Pinball Junior', 'Pinball Intermediate', 'Pinball Hard', 'Pinball Extreme', 'Pinball Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'chess': {
    badges: ['Chess Basic', 'Chess Junior', 'Chess Intermediate', 'Chess Hard', 'Chess Extreme', 'Chess Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'checkers': {
    badges: ['Checkers Basic', 'Checkers Junior', 'Checkers Intermediate', 'Checkers Hard', 'Checkers Extreme', 'Checkers Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'robot-adventure': {
    badges: ['Robot Basic', 'Robot Junior', 'Robot Intermediate', 'Robot Hard', 'Robot Extreme', 'Robot Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
  },
  'stacking-sim': {
    badges: ['Stack Basic', 'Stack Junior', 'Stack Intermediate', 'Stack Hard', 'Stack Extreme', 'Stack Hardcore'],
    levelNames: ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'],
    // Before the rework the game had 3 fixed levels in a 'building' series
    // (badges "Cozy Cottage Badge", "Clock Tower Badge", "Sky Tower Badge").
    // Each one cleared there counts as one level cleared here.
    legacyCleared: function (name) {
      const old = getProgress(name, 'stacking-sim').filter(r => r.SeriesID === 'building')[0];
      if (!old) return 0;
      return Math.min(3, String(old.Tokens || '').split(',').map(t => t.trim()).filter(Boolean).length);
    },
  },
};
function levelGame_(gameId) {
  const g = LEVEL_GAMES[gameId];
  if (!g) throw new Error('Unknown game.');
  return g;
}
function levelProgressFor_(name, gameId) {
  const g = levelGame_(gameId);
  const r = getProgress(name, gameId).filter(x => x.SeriesID === 'main')[0];
  const unlocked = r ? (Number(r.UnlockedLevel) || 0) : 0;
  return {
    unlocked: Math.max(unlocked, g.legacyCleared ? g.legacyCleared(name) : 0),
    tokens: r ? String(r.Tokens || '').split(',').map(t => t.trim()).filter(Boolean) : [],
    best: bestFor_(name, gameId),
  };
}
function getLevelGameData(gameId, player) {
  levelGame_(gameId);
  const players = activePlayers_(listProfilesFull()).map(p => ({ Name: p.Name, Age: p.Age || '' }));
  const progress = {};
  players.forEach(p => { progress[p.Name] = levelProgressFor_(p.Name, gameId); });
  const out = { players: players, progress: progress, settings: getSettings(), player: player || '' };
  // Pinball: how many ball skins each player has unlocked (Collection line "ballskin").
  // Dodgy Hopper: every player's avatar (the hopper is your own avatar).
  if (gameId === 'turbo') out.ghosts = ghostSummaries_('turbo', players);
  if (gameId === 'snakeast') { out.progressGate = {}; out.progressCastle = {}; out.snakeEndless = {}; const f = featRows_(); players.forEach(p => { out.progressGate[p.Name] = levelProgressFor_(p.Name, 'snakigate'); out.progressCastle[p.Name] = levelProgressFor_(p.Name, 'snakastle'); const e = {}; f.forEach(r => { if (r.name === p.Name && r.game === 'snakeast' && /^end[0-5]$/.test(r.stat)) e[Number(r.stat.slice(3))] = Number(r.value) || 0; }); out.snakeEndless[p.Name] = e; }); out.snakeSkins = {}; players.forEach(p => { out.snakeSkins[p.Name] = snakeSkinsFor_(featsFor_(p.Name)); }); }   // 🐍 Snakize page: all three boards + ♾️ Endless bests
  if (gameId === 'soul-bopper') out.bopper = bopperData_(players);
  if (gameId === 'polyplot') out.polyplot = polyplotData_(players);
  if (gameId === 'eyes-brain') out.ebr = ebrData_(players);
  if (gameId === 'geoscout') out.geoJourney = geoJourneyData_(players);   // 🔢 GeoScout 📖 Journey: chapters done per player (feat journeys)
  if (gameId === 'geoscout' || gameId === 'number-board' || gameId === 'eyes-brain') out.numberSkins = numberSkinsOwned_(players);   // 🎨 number looks each player may use (item line + GeoScout Journey chapters)
  if (gameId === 'wisdeck') { out.wisCards = wisCardRows_(); out.wisDaily = wisDaily_(); const all = activePlayers_(listProfilesFull()); out.wdBack = {}; all.forEach(p => { try { out.wdBack[p.Name] = itemsFor_(p.Name, all).owned.wdback || 0; } catch (e) { out.wdBack[p.Name] = 0; } }); }   // 🃏 sheet-tab cards + 📅 today's family board + 🂠 card backs owned
  if (gameId === 'wisdeck') { out.progressCount = {}; out.progressJack = {}; players.forEach(p => { out.progressCount[p.Name] = levelProgressFor_(p.Name, 'wiscount'); out.progressJack[p.Name] = levelProgressFor_(p.Name, 'wisjack'); }); }   // 🃏 WisDeck page shows all three boards   // 👀🧠 🎯 today's family number + 🏅 brain levels + 🔢 keypad skins owned   // ⬛ field journal + line trails owned   // 👻💣 battle unlocks (+ bomb skins, round 4)
  if (gameId === 'alignext') { out.progressOmni = {}; players.forEach(p => { out.progressOmni[p.Name] = levelProgressFor_(p.Name, 'omnifile'); }); }   // 🔴 Alignext page shows both boards (Drop + ❌⭕ Omnifile)
  if (gameId === 'pokadif') { out.progressCase = {}; players.forEach(p => { out.progressCase[p.Name] = levelProgressFor_(p.Name, 'pokadif-case'); }); }   // 📖 pk-3a: the page shows the Detective Adventure board too
  if (gameId === 'pokadif') { out.progressArcade = {}; players.forEach(p => { out.progressArcade[p.Name] = levelProgressFor_(p.Name, 'pokadif-arcade'); }); }   // 🔍 pk-2b: the page shows the ⏱️ Arcade board too
  if (gameId === 'beat-corner') { out.progressPiano = {}; out.progressDrums = {}; players.forEach(p => { out.progressPiano[p.Name] = levelProgressFor_(p.Name, 'beat-piano'); out.progressDrums[p.Name] = levelProgressFor_(p.Name, 'beat-drums'); }); }   // 🎹 🥁 BeatCorner shows the Piano + Drums boards too (plan 11-bc)
  if (gameId === 'beat-corner') out.familySongs = safeFamilySongs_();   // 🎼 Song Maker: every family song (plan 11-bc round 4)
  { const st = out.settings; out.avatars = {}; players.forEach(p => { out.avatars[p.Name] = parseAvatar_(st['Avatar_' + p.Name]); }); }   // 🧑 every level game gets every player's avatar (plan 11w: an avatar in every game)
  if (gameId === 'word-board') out.meanings = wordMeaningRows_();   // 📖 the Word Meanings tab (looked-up words + grown-up fixes) wins over the built-in list
  if (gameId === 'georead') out.meanings = wordMeaningRows_();   // 🔤 GeoRead word cards: the Word Meanings tab wins over the built-in list
  if (gameId === 'georead' || gameId === 'word-board' || gameId === 'eyes-brain') out.letterSkins = letterSkinsOwned_(players);   // 🎨 extra letter looks each player may use (item line + Alphabet Road chapters)
  if (gameId === 'georead') { const st = out.settings; out.journey = {}; players.forEach(p => { try { out.journey[p.Name] = JSON.parse(st['GeoJourney_' + p.Name] || '{}') || {}; } catch (e) { out.journey[p.Name] = {}; } }); }   // 🗺️ Alphabet Road progress
  if (gameId === 'double-up') { const f = featRows_(); out.challenge = {}; players.forEach(p => { const tile = f.filter(r => r.name === p.Name && r.game === 'double-up' && r.stat === 'chTile').reduce((m, r) => Math.max(m, Number(r.value) || 0), 0), score = f.filter(r => r.name === p.Name && r.game === 'double-up' && r.stat === 'chScore').reduce((m, r) => Math.max(m, Number(r.value) || 0), 0); if (tile || score) out.challenge[p.Name] = { tile: tile, score: score }; }); }   // 🏔️ Challenge bests (feats)
  if (gameId === 'brawl-buddies') { out.progressAdv = {}; players.forEach(p => { out.progressAdv[p.Name] = levelProgressFor_(p.Name, 'brawenture'); }); }   // 🗺️ Brawenture board (tales cleared → next tale opens)
  if (gameId === 'brawl-buddies') { out.batDesigns = {}; players.forEach(p => { try { const d = JSON.parse(out.settings['Racket_' + p.Name] || 'null'); if (d) out.batDesigns[p.Name] = d; } catch (e) {} }); }   // 🏏 bs-1 a melee pickup = YOUR Batstick
  if (gameId === 'brawl-buddies') { const all = activePlayers_(listProfilesFull()); out.gear = {}; all.forEach(p => { const o = itemsFor_(p.Name, all).owned; if (o.brawlgear > 0) out.gear[p.Name] = o.brawlgear - 1; }); }   // 🥊 best Brawl gear owned (step index), drawn in fights
  if (gameId === 'pinball' || gameId === 'sla-brall' || gameId === 'blasoff') { const all = activePlayers_(listProfilesFull()); out.ballSkins = {}; out.rackets = {}; out.ballTrails = {}; out.feathers = {}; all.forEach(p => { const o = itemsFor_(p.Name, all).owned; out.ballSkins[p.Name] = o.ballskin || 0; out.rackets[p.Name] = o.racket || 0; out.bats = out.bats || {}; out.bats[p.Name] = o.batstick || 0; out.ballTrails[p.Name] = o.balltrail || 0; out.feathers[p.Name] = o.feather || 0; }); }   // ⚾ one ball-skin list for Pinball + SlaBrall; 🏓 rackets owned
  return out;
}
// 👀🧠 Eyes Brain Riot (11k round 4): 🎯 daily family number — the same 8 digits for everyone today (made on the page from the date),
// ONE try per player per day, kept in Settings EyesDaily = {date, scores: {name: {score, right, secs}}}; 🏅 Brain level = feat longest (longest number remembered perfectly)
function eyesDaily_() {
  const d = jsonSetting_(getSettings(), 'EyesDaily', {}) || {}, today = today_(), sc = d.date === today && d.scores ? d.scores : {};
  return { date: today, board: Object.keys(sc).map(k => ({ name: k, score: Number(sc[k].score) || 0, right: Number(sc[k].right) || 0, secs: Number(sc[k].secs) || 0 })).sort((a, b) => b.score - a.score || a.secs - b.secs) };
}
function brainLevels_(players) { const names = {}, out = {}; players.forEach(p => { names[p.Name] = true; }); featRows_().forEach(r => { if (r.game === 'eyes-brain' && r.stat === 'longest' && names[r.name]) out[r.name] = Math.max(out[r.name] || 0, Number(r.value) || 0); }); return out; }
function ebrData_(players) { const all = activePlayers_(listProfilesFull()), pads = {}; all.forEach(p => { try { pads[p.Name] = itemsFor_(p.Name, all).owned.ebrpad || 0; } catch (e) { pads[p.Name] = 0; } }); return { daily: eyesDaily_(), brain: brainLevels_(players), pads: pads }; }
function safeEyes_(players) { try { return { daily: eyesDaily_(), brain: brainLevels_(players) }; } catch (e) { return null; } }
function saveEyesDaily(name, rec) {
  if (!name || !activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Pick a player first.');
  const r = rec || {}, today = today_();
  if (r.date && r.date !== today) return { already: false, late: true, daily: eyesDaily_() };   // a page left open past midnight
  const lock = LockService.getScriptLock(); lock.waitLock(10000); let first = false, right = 0;
  try {
    let d = jsonSetting_(getSettings(), 'EyesDaily', {}) || {}; if (d.date !== today || !d.scores) d = { date: today, scores: {} };
    if (!d.scores[name]) { right = Math.max(0, Math.min(8, Math.floor(Number(r.right) || 0))); d.scores[name] = { score: Math.max(0, Math.min(5000, Math.round(Number(r.score) || 0))), right: right, secs: Math.max(0, Math.min(3600, Math.round(Number(r.secs) || 0))) }; saveSetting('EyesDaily', JSON.stringify(d)); first = true; }
  } finally { lock.releaseLock(); }
  const out = { already: !first, daily: eyesDaily_() };
  if (first) out.feats = safeRecordFeats_(name, 'eyes-brain', { daily: 1, digits: right, perfects: right === 8 ? 1 : 0, longest: right === 8 ? 8 : 0 });
  return out;
}
// 🎁 daily treasure counters (today): best run of perfect rounds + longest Challenge
function ebrDaily_(name, stats) {
  try { const d = dailyRoom_(getSettings(), name, today_()); d.ebrRow = Math.max(d.ebrRow || 0, Number(stats.bestCombo) || 0); d.ebrLen = Math.max(d.ebrLen || 0, Number(stats.challenge) || 0); saveSetting('Daily_' + name, JSON.stringify(d)); } catch (e) { console.error('eyes daily: ' + e.message); }
}
// ⬛ Polyplot: per player {journal (Settings Polyplot_<Name>), trails owned (item line polytrail)}
function polyplotData_(players) {
  const st = getSettings(), all = activePlayers_(listProfilesFull()), out = {};
  players.forEach(p => { let j = {}; try { j = JSON.parse(st['Polyplot_' + p.Name] || '{}') || {}; } catch (e) { j = {}; }
    let trails = 0; try { trails = itemsFor_(p.Name, all).owned.polytrail || 0; } catch (e) {}
    out[p.Name] = { journal: { kinds: j.kinds || {}, coins: j.coins || {} }, trails: trails }; });
  return out;
}
// 📖 merge one game's catches + coins into the journal; jc_<theme> feats (field types caught) unlock the theme's 🐾 pet. Also 🎁 daily counters.
const PP_FIELD_ = ['calm', 'energetic', 'lazy', 'enraged'], PP_HIDDEN_ = ['egg', 'mole', 'mimic', 'ghost', 'legend'];
function polyplotSave_(name, stats) {
  try {
    const st = getSettings(), jr = stats.jr;
    if (jr && PP_THEMES_.indexOf(jr.theme) >= 0) {
      let j = {}; try { j = JSON.parse(st['Polyplot_' + name] || '{}') || {}; } catch (e) { j = {}; }
      j.kinds = j.kinds || {}; j.coins = j.coins || {}; const K = j.kinds[jr.theme] = j.kinds[jr.theme] || {};
      Object.keys(jr.kinds || {}).forEach(k => { const v = Math.floor(Number(jr.kinds[k])); if (/^[a-z]{2,12}$/.test(k) && v > 0) K[k] = (K[k] || 0) + Math.min(v, 99); });
      j.coins[jr.theme] = (j.coins[jr.theme] || 0) + Math.max(0, Math.min(500, Math.floor(Number(jr.coins) || 0)));
      saveSetting('Polyplot_' + name, JSON.stringify(j));
      const field = PP_FIELD_.filter(k => K[k] > 0).length + (PP_HIDDEN_.some(k => K[k] > 0) ? 1 : 0);
      if (field > 0) stats['jc_' + jr.theme] = field;
      const tot = Object.keys(K).reduce((a, k) => a + K[k], 0); if (tot > 0) stats['jt_' + jr.theme] = tot;
    }
    const d = dailyRoom_(st, name, today_()); d.ppCatch = (d.ppCatch || 0) + (Number(stats.catches) || 0); d.ppChain = Math.max(d.ppChain || 0, Number(stats.bestChain) || 0); saveSetting('Daily_' + name, JSON.stringify(d));
  } catch (e) { console.error('polyplot save: ' + e.message); }
  delete stats.jr;
}
// 👻💣 Soul Bopper: per player {bestWin} from the feats (battle wins vs bots open the next level, like Stage clears)
function bopperData_(players) {
  const out = {}, rows = featRows_().filter(r => r.game === 'soul-bopper');
  players.forEach(p => { const f = {}; rows.forEach(r => { if (r.name === p.Name) f[r.stat] = Number(r.value) || 0; }); out[p.Name] = bopperInfo_(f); });
  return out;
}
const BOP_WORLDS_ = ['dino', 'sea', 'dance', 'robot', 'space', 'sky', 'zombie'];
// 💣 bomb skins: per world 1 (Plain) + play 5 games + catch 20 + win Hard + (win Extreme/Hardcore or beat the world's boss); fun extras from feats
function bopperInfo_(f) {
  const worlds = {}, themes = {}, extras = [];
  BOP_WORLDS_.forEach(k => { worlds[k] = f['w_' + k] || 0; const wl = f['wl_' + k] || 0; themes[k] = 1 + ((f['g_' + k] || 0) >= 5 ? 1 : 0) + ((f['c_' + k] || 0) >= 20 ? 1 : 0) + (wl >= 4 ? 1 : 0) + (wl >= 5 || worlds[k] >= 6 ? 1 : 0); });
  if ((f.pooGames || 0) >= 3) extras.push('poo'); if ((f.blocks || 0) >= 300) extras.push('melon'); if ((f.wins || 0) >= 3) extras.push('cake'); if ((f.chains || 0) >= 20) extras.push('balloon');
  if ((f.comebacks || 0) >= 5) extras.push('teddy'); if ((f.triple || 0) >= 1) extras.push('volcano'); if ((f.catches || 0) + (f.bots || 0) >= 100) extras.push('gold');
  return { bestWin: f.bestWin || 0, wins: f.wins || 0, worlds: worlds, themes: themes, extras: extras };
}
// 🎁 daily treasure counters (today): blocks broken + pops that caught 2 or more
function bopperDaily_(name, stats) {
  try { const d = dailyRoom_(getSettings(), name, today_()); d.sbBlocks = (d.sbBlocks || 0) + (Number(stats.blocks) || 0); if ((Number(stats.multi) || 0) >= 2) d.sbMulti = (d.sbMulti || 0) + 1; d.sbHits = (d.sbHits || 0) + (Number(stats.hits) || 0); saveSetting('Daily_' + name, JSON.stringify(d)); } catch (e) { console.error('bopper daily: ' + e.message); }
}
// BeatCorner: one record per song in Settings Beat_<Name> = {level: {song: {score, acc, stars, passed, combo}}}; passing 5 songs in a level clears it (badge + next level).
const BEAT_SONGS_ = 10, BEAT_TO_CLEAR_ = 5;
function saveBeatSong(name, levelIndex, songIndex, rec, extra) {
  const lvl = Number(levelIndex), song = Number(songIndex);
  if (!name || !activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Pick a player first.');
  if (!(lvl >= 0 && lvl < 6) || !(song >= 0 && song < BEAT_SONGS_)) throw new Error('Bad song.');
  const r = rec || {}, lock = LockService.getScriptLock(); lock.waitLock(10000);
  let all, passedCount;
  try {
    all = jsonSetting_(getSettings(), 'Beat_' + name, {});
    const L = all[lvl] || (all[lvl] = {}), o = L[song] || {};
    L[song] = { score: Math.max(Number(o.score) || 0, Math.round(Number(r.score) || 0)), acc: Math.max(Number(o.acc) || 0, Math.min(1, Number(r.acc) || 0)), stars: Math.max(Number(o.stars) || 0, Math.min(3, Number(r.stars) || 0)), passed: !!(o.passed || r.passed), combo: Math.max(Number(o.combo) || 0, Number(r.combo) || 0) };
    saveSetting('Beat_' + name, JSON.stringify(all));
    passedCount = Object.keys(L).filter(k => L[k] && L[k].passed).length;
  } finally { lock.releaseLock(); }
  const res = saveLevelResult('beat-corner', name, lvl, Object.assign({}, extra || {}, { score: Math.round(Number(r.score) || 0), stars: Number(r.stars) || 0, cleared: passedCount >= BEAT_TO_CLEAR_ }));
  res.beat = all; res.passedCount = passedCount;
  return res;
}
// 🎼 BeatCorner Song Maker (plan 11-bc round 4): songs the family records / writes, kept in the "Beat Songs" tab,
// played by everyone on 🎹 Piano, 🥁 Drums or 🎸 Band at their own level. Notes = [{t (beats), k (key 0–17), o (octave −1…1), d (beats, 0 = tap)}].
const SONGS_TAB = 'Beat Songs';
const SONGS_COL = { id: 0, maker: 1, name: 2, emoji: 3, bpm: 4, style: 5, notes: 6, made: 7, plays: 8, likes: 9, best: 10, deleted: 11 };
const SONGS_HEADERS = [
  ['Song ID', 'songId', 'Made by the app. Do not edit.'],
  ['Maker', 'maker', 'Who made the song (Profiles name)'],
  ['Name', 'name', 'The song name the maker gave it'],
  ['Emoji', 'emoji', 'The song picture'],
  ['BPM', 'bpm', 'Speed it was made at (50–200)'],
  ['Style', 'style', 'Drum beat for 🥁 Drums / 🎸 Band: rock · pop · march · samba · swing · klong · electro'],
  ['Notes', 'notes', 'JSON list of notes {t, k, o, d} — made by the app'],
  ['Made', 'made', 'When it was first saved'],
  ['Plays', 'plays', 'How many times the family played it'],
  ['Likes', 'likes', 'JSON list of players who ❤️ it'],
  ['Best', 'best', 'JSON top scores {name, score, part, lvl}'],
  ['Deleted', 'deleted', '"yes" = the maker threw it away (kept for history)']
];
const SONGS_WIDTH = SONGS_HEADERS.length, SONGS_PER_PLAYER_ = 10, SONG_MAX_NOTES_ = 800, SONG_STYLES_ = ['rock', 'pop', 'march', 'samba', 'swing', 'klong', 'electro'];
function songsSheet_() {
  let sh = ss_().getSheetByName(SONGS_TAB);
  if (!sh) { sh = ss_().insertSheet(SONGS_TAB); sh.getRange(1, 1, 1, SONGS_WIDTH).setValues([SONGS_HEADERS.map(h => h[0] + '\n' + h[1])]); styleSongsSheet(); }
  return sh;
}
// Look of the Beat Songs tab (sheet standard). Safe to re-run from the editor.
function styleSongsSheet() {
  const sh = ss_().getSheetByName(SONGS_TAB); if (!sh) return;
  try {
    const head = sh.getRange(1, 1, 1, SONGS_WIDTH);
    head.setValues([SONGS_HEADERS.map(h => '🔒 ' + h[0] + '\n' + h[1])]).setBackground('#7A5CFA').setFontColor('#FFFFFF').setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
    head.setNotes([SONGS_HEADERS.map(h => h[2])]);
    sh.setRowHeight(1, 46); sh.setFrozenRows(1); sh.setFrozenColumns(3);
    sh.getRange(2, 1, sh.getMaxRows() - 1, SONGS_WIDTH).setNumberFormat('@').setFontSize(10).setVerticalAlignment('middle').setWrap(false);
    [130, 110, 170, 60, 60, 80, 260, 130, 60, 160, 220, 70].forEach((w, i) => sh.setColumnWidth(i + 1, w));
    sh.getBandings().forEach(b => b.remove());
    sh.getRange(1, 1, sh.getMaxRows(), SONGS_WIDTH).applyRowBanding().setHeaderRowColor('#7A5CFA').setFirstRowColor('#FFFFFF').setSecondRowColor('#F1ECFF');
    sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).filter(x => String(x.getDescription()).indexOf('🔒 STEAM Playground') === 0).forEach(x => x.remove());
    sh.protect().setDescription('🔒 STEAM Playground — Beat Songs (app managed)').setWarningOnly(true);
  } catch (e) { Logger.log('styleSongsSheet: ' + e.message); }
}
let SONGS_MEMO_ = null;
function beatSongRows_() {
  if (SONGS_MEMO_ && SONGS_MEMO_.ss === ss_()) return SONGS_MEMO_.rows;
  const sh = ss_().getSheetByName(SONGS_TAB), C = SONGS_COL; let rows = [];
  if (sh && sh.getLastRow() > 1) {
    const j = (v, f) => { try { const x = JSON.parse(v || ''); return x == null ? f : x; } catch (e) { return f; } };
    rows = sh.getRange(2, 1, sh.getLastRow() - 1, SONGS_WIDTH).getValues().map((r, i) => ({ row: i + 2, id: String(r[C.id]).trim(), maker: String(r[C.maker]), name: String(r[C.name]), emoji: String(r[C.emoji]), bpm: Number(r[C.bpm]) || 90,
      style: String(r[C.style]) || 'pop', notes: j(r[C.notes], []), made: String(r[C.made]), plays: Number(r[C.plays]) || 0, likes: j(r[C.likes], []), best: j(r[C.best], []), deleted: String(r[C.deleted]).toLowerCase() === 'yes' })).filter(x => x.id);
  }
  SONGS_MEMO_ = { ss: ss_(), rows: rows };
  return rows;
}
function writeBeatSong_(c) {
  const sh = songsSheet_(), row = [c.id, c.maker, c.name, c.emoji, String(c.bpm), c.style, JSON.stringify(c.notes), c.made, String(c.plays || 0), JSON.stringify(c.likes || []), JSON.stringify(c.best || []), c.deleted ? 'yes' : ''];
  if (c.row) sh.getRange(c.row, 1, 1, SONGS_WIDTH).setValues([row]);
  else { const r = sh.getLastRow() + 1; sh.getRange(r, 1, 1, SONGS_WIDTH).setNumberFormat('@').setValues([row]); c.row = r; }
  SONGS_MEMO_ = null;
}
function cleanSongNotes_(notes) {
  const seen = {}, out = [];
  (Array.isArray(notes) ? notes : []).slice(0, SONG_MAX_NOTES_ * 2).forEach(n => {
    const t = Math.round((Number(n && n.t) || 0) * 4) / 4, k = Math.floor(Number(n && n.k)), o = Math.max(-1, Math.min(1, Math.round(Number(n && n.o) || 0))), d = Math.max(0, Math.min(16, Math.round((Number(n && n.d) || 0) * 4) / 4));
    if (!(t >= 0 && t <= 2000) || !(k >= 0 && k <= 17)) return;
    const key = t + ':' + k + ':' + o; if (seen[key]) return; seen[key] = 1; out.push({ t: t, k: k, o: o, d: d });
  });
  out.sort((a, b) => a.t - b.t || a.k - b.k);
  return out.slice(0, SONG_MAX_NOTES_);
}
function publicSong_(c) { return { id: c.id, maker: c.maker, name: c.name, emoji: c.emoji, bpm: c.bpm, style: c.style, notes: c.notes, made: c.made, plays: c.plays, likes: c.likes, best: c.best }; }
function familySongs_() { return beatSongRows_().filter(c => !c.deleted).map(publicSong_); }
function safeFamilySongs_() { try { return familySongs_(); } catch (e) { return []; } }
function saveMySong(name, song) {
  if (!name || !activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Pick a player first.');
  const g = song || {}, notes = cleanSongNotes_(g.notes);
  if (notes.length < 4) throw new Error('A song needs at least 4 notes.');
  const title = String(g.name || '').replace(/[<>]/g, '').trim().slice(0, 30) || 'My song', emoji = String(g.emoji || '🎵').slice(0, 4), bpm = Math.max(50, Math.min(200, Math.round(Number(g.bpm) || 90))), style = SONG_STYLES_.indexOf(g.style) >= 0 ? g.style : 'pop';
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  let row, isNew = false;
  try {
    const rows = beatSongRows_();
    row = g.id ? rows.find(c => c.id === String(g.id) && !c.deleted) : null;
    if (row && row.maker !== name) throw new Error('Only the maker can change this song.');
    if (!row) { if (rows.filter(c => c.maker === name && !c.deleted).length >= SONGS_PER_PLAYER_) throw new Error('You have ' + SONGS_PER_PLAYER_ + ' songs already — throw one away first.');
      row = { id: 's' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36), maker: name, plays: 0, likes: [], best: [], made: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') }; isNew = true; }
    Object.assign(row, { name: title, emoji: emoji, bpm: bpm, style: style, notes: notes });
    writeBeatSong_(row);
  } finally { lock.releaseLock(); }
  const feats = isNew ? safeRecordFeats_(name, 'beat-piano', { songsMade: 1 }) : null;
  return { song: publicSong_(row), songs: familySongs_(), feats: feats, isNew: isNew };
}
function deleteMySong(name, id) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try { const row = beatSongRows_().find(c => c.id === String(id) && !c.deleted); if (!row) throw new Error('Song not found.'); if (row.maker !== name) throw new Error('Only the maker can throw this song away.'); row.deleted = true; writeBeatSong_(row); }
  finally { lock.releaseLock(); }
  return { songs: familySongs_() };
}
function likeFamilySong(name, id) {
  if (!name || !activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Pick a player first.');
  const lock = LockService.getScriptLock(); lock.waitLock(10000); let row;
  try { row = beatSongRows_().find(c => c.id === String(id) && !c.deleted); if (!row) throw new Error('Song not found.'); const i = row.likes.indexOf(name); if (i >= 0) row.likes.splice(i, 1); else row.likes.push(name); writeBeatSong_(row); }
  finally { lock.releaseLock(); }
  return { id: row.id, likes: row.likes };
}
// a family song was played: plays + top 3 (best per player), feats for the player, 🎧 for the maker when someone else plays it
function playedFamilySong(name, id, part, levelIndex, rec, stats) {
  if (!name || !activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Pick a player first.');
  const lock = LockService.getScriptLock(); lock.waitLock(10000); let row;
  try {
    row = beatSongRows_().find(c => c.id === String(id) && !c.deleted); if (!row) throw new Error('Song not found.');
    const score = Math.max(0, Math.round(Number(rec && rec.score) || 0)), lvl = Math.max(0, Math.min(5, Math.floor(Number(levelIndex) || 0))), pt = ['piano', 'drums', 'band'].indexOf(part) >= 0 ? part : 'piano';
    row.plays = (row.plays || 0) + 1;
    const mine = row.best.find(b => b.name === name);
    if (!mine) row.best.push({ name: name, score: score, part: pt, lvl: lvl }); else if (score > mine.score) Object.assign(mine, { score: score, part: pt, lvl: lvl });
    row.best.sort((a, b) => b.score - a.score); row.best = row.best.slice(0, 10);
    writeBeatSong_(row);
  } finally { lock.releaseLock(); }
  const feats = safeRecordFeats_(name, part === 'drums' ? 'beat-drums' : 'beat-piano', Object.assign({}, stats || {}, { famPlays: 1 }));
  if (row.maker !== name) safeRecordFeats_(row.maker, 'beat-piano', { songPlays: 1 });
  return { id: row.id, plays: row.plays, best: row.best.slice(0, 3), feats: feats };
}
// 🎹 🥁 BeatCorner Piano / Drums (plan 11-bc): one record per song in Settings BeatPiano_<Name> / BeatDrums_<Name>; 6 songs a level, passing 3 clears it.
const BEAT_PARTS_ = { piano: { gid: 'beat-piano', key: 'BeatPiano_' }, drums: { gid: 'beat-drums', key: 'BeatDrums_' } }, BEAT_PART_SONGS_ = 6, BEAT_PART_CLEAR_ = 3;
function saveBeatPart(part, name, levelIndex, songIndex, rec, extra) {
  const P = BEAT_PARTS_[part], lvl = Number(levelIndex), song = Number(songIndex);
  if (!P) throw new Error('Bad part.');
  if (!name || !activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Pick a player first.');
  if (!(lvl >= 0 && lvl < 6) || !(song >= 0 && song < BEAT_PART_SONGS_)) throw new Error('Bad song.');
  const r = rec || {}, lock = LockService.getScriptLock(); lock.waitLock(10000);
  let all, passedCount;
  try {
    all = jsonSetting_(getSettings(), P.key + name, {});
    const L = all[lvl] || (all[lvl] = {}), o = L[song] || {};
    L[song] = { score: Math.max(Number(o.score) || 0, Math.round(Number(r.score) || 0)), acc: Math.max(Number(o.acc) || 0, Math.min(1, Number(r.acc) || 0)), stars: Math.max(Number(o.stars) || 0, Math.min(3, Number(r.stars) || 0)), passed: !!(o.passed || r.passed), combo: Math.max(Number(o.combo) || 0, Number(r.combo) || 0) };
    saveSetting(P.key + name, JSON.stringify(all));
    passedCount = Object.keys(L).filter(k => L[k] && L[k].passed).length;
  } finally { lock.releaseLock(); }
  const res = saveLevelResult(P.gid, name, lvl, Object.assign({}, extra || {}, { score: Math.round(Number(r.score) || 0), stars: Number(r.stars) || 0, cleared: passedCount >= BEAT_PART_CLEAR_ }));
  res.beat = all; res.passedCount = passedCount;
  return res;
}
function saveLevelResult(gameId, name, levelIndex, extra) {
  const g = levelGame_(gameId);
  const idx = Number(levelIndex);
  if (!name || !(idx >= 0 && idx < g.badges.length)) throw new Error('Bad level result.');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const cur = levelProgressFor_(name, gameId);
    // Score games (pinball) log every game; only a game that reached the
    // level goal (extra.cleared !== false) unlocks the next level / badge.
    const cleared = !(extra && extra.cleared === false);
    const unlocked = cleared ? Math.max(cur.unlocked, idx + 1) : cur.unlocked;
    const badge = g.badges[idx];
    const isNew = cleared && cur.tokens.indexOf(badge) === -1;
    const tokens = isNew ? cur.tokens.concat([badge]) : cur.tokens;
    if (cleared) saveProgress(name, gameId, 'main', unlocked, tokens);
    const res = { unlocked: unlocked, tokens: tokens, newBadge: isNew ? badge : '' };
    Object.assign(res, safeLogScore_(name, gameId, idx, g.levelNames ? g.levelNames[idx] : badge, extra));
    if (typeof artMarkResult_ === 'function') artMarkResult_(name, gameId);   // 🏭 af-4 level result → one material drop
    if (extra && extra.stats) { res.feats = safeRecordFeats_(name, gameId, extra.stats); snakeDaily_(name, gameId, extra.stats); }
    return res;
  } finally {
    lock.releaseLock();
  }
}

/* ============ SCORES (finish times, stars, points) ============ */
// One row per finished level, any game. Created automatically the first
// time a score is saved — nothing to set up by hand. The code reads the
// columns BY POSITION (SCORES_COL), so header wording can be changed freely;
// never insert, delete or reorder columns (add new ones at the end).
const SCORES_TAB = 'Scores';
const SCORES_COL = { id: 0, date: 1, name: 2, game: 3, level: 4, levelName: 5, theme: 6, timeSec: 7, stars: 8, score: 9 };
const SCORES_HEADERS = [
  ['Score ID', 'scoreId', 'Made by the app. Do not edit.'],
  ['Date', 'date', 'yyyy-MM-dd HH:mm (script time zone)'],
  ['Player', 'name', 'Name exactly as on the Profiles tab'],
  ['Game', 'gameId', 'GameID from the Games tab (maze, stacking-sim, ...)'],
  ['Level #', 'level', '1 = Basic · 2 = Junior · 3 = Intermediate · 4 = Hard · 5 = Extreme'],
  ['Level', 'levelName', 'Level name'],
  ['Theme', 'theme', 'Theme / world the player picked'],
  ['Time (sec)', 'timeSec', 'Seconds from first move to finish'],
  ['Stars', 'stars', '0-3'],
  ['Score', 'score', 'Points (score-based games such as Pinball); blank otherwise'],
];
const SCORES_WIDTH = SCORES_HEADERS.length;

function scoresSheet_() {
  let sh = ss_().getSheetByName(SCORES_TAB);
  if (!sh) {
    sh = ss_().insertSheet(SCORES_TAB);
    sh.getRange(1, 1, 1, SCORES_WIDTH).setValues([SCORES_HEADERS.map(h => h[0] + '\n' + h[1])]);
    styleScoresSheet();
  }
  return sh;
}

// Look of the Scores tab (sheet standard). Safe to re-run any time from the
// editor: never touches the data, only formatting and the warning lock.
function styleScoresSheet() {
  const sh = ss_().getSheetByName(SCORES_TAB);
  if (!sh) return;
  try {
    const head = sh.getRange(1, 1, 1, SCORES_WIDTH);
    head.setValues([SCORES_HEADERS.map(h => '🔒 ' + h[0] + '\n' + h[1])])
      .setBackground('#607D8B').setFontColor('#FFFFFF').setFontWeight('bold')
      .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
    head.setNotes([SCORES_HEADERS.map(h => h[2])]);
    sh.setRowHeight(1, 46);
    sh.setFrozenRows(1);
    sh.setFrozenColumns(3);
    sh.getRange(2, 1, sh.getMaxRows() - 1, SCORES_WIDTH).setNumberFormat('@').setFontSize(10).setVerticalAlignment('middle');
    [115, 145, 140, 110, 78, 110, 110, 90, 78, 90].forEach((w, i) => sh.setColumnWidth(i + 1, w));
    sh.getRange(2, 1, sh.getMaxRows() - 1, 1).setFontFamily('Roboto Mono').setFontColor('#757575');
    sh.getRange(2, 5, sh.getMaxRows() - 1, 5).setHorizontalAlignment('center');
    sh.getBandings().forEach(b => b.remove());
    sh.getRange(1, 1, sh.getMaxRows(), SCORES_WIDTH).applyRowBanding()
      .setHeaderRowColor('#607D8B').setFirstRowColor('#FFFFFF').setSecondRowColor('#ECEFF1');
    // App-managed log: whole tab warning-locked (the web app is not affected).
    sh.getProtections(SpreadsheetApp.ProtectionType.SHEET)
      .filter(p => String(p.getDescription()).indexOf('🔒 STEAM Playground') === 0).forEach(p => p.remove());
    sh.protect().setDescription('🔒 STEAM Playground — Scores (app managed)').setWarningOnly(true);
  } catch (e) {
    Logger.log('styleScoresSheet: ' + e.message); // looks only — never block a save
  }
}

let SCORES_MEMO_ = null; // { ss, rows } — read the tab once per request
function scoreRows_() {
  if (SCORES_MEMO_ && SCORES_MEMO_.ss === ss_()) return SCORES_MEMO_.rows;
  const sh = ss_().getSheetByName(SCORES_TAB);
  let rows = [];
  if (sh && sh.getLastRow() > 1) {
    const C = SCORES_COL;
    rows = sh.getRange(2, 1, sh.getLastRow() - 1, SCORES_WIDTH).getValues()
      .filter(r => String(r[C.id]).trim() !== '') // rows without an id are ignored
      .map(r => ({
        date: r[C.date] instanceof Date ? Utilities.formatDate(r[C.date], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') : String(r[C.date]),
        name: String(r[C.name]), game: String(r[C.game]), level: Number(r[C.level]) - 1,
        levelName: String(r[C.levelName]), theme: String(r[C.theme]),
        timeSec: Number(r[C.timeSec]) || 0, stars: Number(r[C.stars]) || 0, score: Number(r[C.score]) || 0,
      }));
  }
  SCORES_MEMO_ = { ss: ss_(), rows: rows };
  return rows;
}

// Best result per level (index 0-4) for one player: fastest time, most stars.
function bestFor_(name, gameId) {
  const best = [null, null, null, null, null, null];
  scoreRows_().forEach(r => {
    if (r.name !== name || r.game !== gameId || !(r.level >= 0 && r.level < LEVEL_COUNT)) return;
    const b = best[r.level] || (best[r.level] = { timeSec: 0, stars: 0, score: 0, plays: 0 });
    b.plays++;
    if (r.score > b.score) b.score = r.score;
    if (r.timeSec > 0 && (!b.timeSec || r.timeSec < b.timeSec)) b.timeSec = r.timeSec;
    if (r.stars > b.stars) b.stars = r.stars;
  });
  return best;
}

// Fastest finish per level among the given (active) players.
function recordsFor_(gameId, players) {
  const names = {};
  players.forEach(p => { names[p.Name] = true; });
  const rec = [null, null, null, null, null, null];
  scoreRows_().forEach(r => {
    if (r.game !== gameId || !names[r.name] || !(r.level >= 0 && r.level < LEVEL_COUNT) || !(r.timeSec > 0)) return;
    if (!rec[r.level] || r.timeSec < rec[r.level].timeSec) rec[r.level] = { name: r.name, timeSec: r.timeSec, stars: r.stars, date: r.date };
  });
  return rec;
}

// Games shown on the Achievements records board.
const RECORD_GAMES = ['maze', 'stacking-sim', 'robot-adventure', 'checkers', 'chess', 'pinball', 'hopper', 'turbo', 'memory', 'math-quest', 'number-grid', 'pop-blocks', 'block-drop', 'double-up', 'number-board', 'word-board', 'sweet-swap', 'beat-corner', 'sla-brall', 'blasoff', 'pose-party', 'brawl-buddies', 'brawenture', 'alignext', 'omnifile', 'snakeast', 'snakigate', 'snakastle', 'soul-bopper', 'polyplot', 'eyes-brain', 'wisdeck', 'wiscount', 'wisjack', 'beat-piano', 'beat-drums', 'geoscout', 'georead', 'artifactory', 'td-draprincess', 'pyraspike', 'pokadif', 'sciencetory', 'pokadif-arcade', 'pokadif-case'];
// Per level: the fastest finish and the top score among active players.
function gameRecords_(gameId, players) {
  const names = {};
  players.forEach(p => { names[p.Name] = true; });
  const out = [0, 1, 2, 3, 4, 5].map(() => ({ fast: null, top: null }));
  scoreRows_().forEach(r => {
    if (r.game !== gameId || !names[r.name] || !(r.level >= 0 && r.level < LEVEL_COUNT)) return;
    const o = out[r.level];
    if (r.timeSec > 0 && (!o.fast || r.timeSec < o.fast.timeSec)) o.fast = { name: r.name, timeSec: r.timeSec, stars: r.stars };
    if (r.score > 0 && (!o.top || r.score > o.top.score)) o.top = { name: r.name, score: r.score, timeSec: r.timeSec, stars: r.stars };
  });
  return out;
}

// "Who played this game" + Leader points, shown under How to play on every main game's level picker.
// Leader points = levels cleared (Basic 100 … Extreme 500, Hardcore 1000) + medals per level for the best score and the
// fastest time among the family (🥇 300 · 🥈 200 · 🥉 100) + 20 per best star + 5 per game played (max 250).
const LEADER_LEVEL_PTS = [100, 200, 300, 400, 500, 1000], LEADER_MEDAL = [300, 200, 100];
function getGameLeaders(gameId) {
  if (RECORD_GAMES.indexOf(gameId) === -1) throw new Error('Unknown game.');
  const players = activePlayers_(listProfilesFull()), names = {};
  players.forEach(p => { names[p.Name] = true; });
  const rows = scoreRows_().filter(r => r.game === gameId && names[r.name] && r.level >= 0 && r.level < LEVEL_COUNT);
  const P = {};
  const me = n => P[n] || (P[n] = { name: n, levels: 0, hardcore: false, bestScore: 0, bestTime: 0, stars: 0, plays: 0, last: '', pts: { levels: 0, score: 0, time: 0, stars: 0, plays: 0 }, medals: [] });
  rows.forEach(r => { const m = me(r.name); m.plays++; if (r.score > m.bestScore) m.bestScore = r.score; if (r.date > m.last) m.last = r.date; });
  rows.forEach(r => { const h = String(r.theme || '').split(' · ')[0].trim(); if (!h) return; const ways = me(r.name).ways || (me(r.name).ways = {}), w = ways[h] || (ways[h] = { best: 0, plays: 0 }); w.plays++; if (r.score > w.best) w.best = r.score; });   // 🏆 pd-3c: best per way to play (Theme head) → PyraDive's sport columns
  players.forEach(p => { const pr = gameId === 'maze' ? mazeProgressFor_(p.Name) : levelProgressFor_(p.Name, gameId);
    if (!pr.unlocked && !P[p.Name]) return; const m = me(p.Name); m.levels = Math.min(LEVEL_COUNT, pr.unlocked); m.hardcore = pr.unlocked >= LEVEL_COUNT;
    for (let i = 0; i < m.levels; i++) m.pts.levels += LEADER_LEVEL_PTS[i];
    (pr.best || []).forEach(b => { if (b) { m.stars += b.stars || 0; if (b.timeSec > 0 && (!m.bestTime || b.timeSec < m.bestTime)) m.bestTime = b.timeSec; } }); });
  // medals per level: best score and fastest time
  for (let lv = 0; lv < LEVEL_COUNT; lv++) {
    const byName = {}; rows.filter(r => r.level === lv && r.stars > 0 || (r.level === lv && r.score > 0)).forEach(r => { const b = byName[r.name] || (byName[r.name] = { score: 0, time: 0 }); if (r.score > b.score) b.score = r.score; if (r.stars > 0 && r.timeSec > 0 && (!b.time || r.timeSec < b.time)) b.time = r.timeSec; });
    const list = Object.keys(byName);
    list.filter(n => byName[n].score > 0).sort((a, b) => byName[b].score - byName[a].score).slice(0, 3).forEach((n, i) => { me(n).pts.score += LEADER_MEDAL[i]; me(n).medals.push({ lv: lv, kind: 'score', place: i + 1 }); });
    list.filter(n => byName[n].time > 0).sort((a, b) => byName[a].time - byName[b].time).slice(0, 3).forEach((n, i) => { me(n).pts.time += LEADER_MEDAL[i]; me(n).medals.push({ lv: lv, kind: 'time', place: i + 1 }); });
  }
  const out = Object.keys(P).map(n => { const m = P[n]; m.pts.stars = m.stars * 20; m.pts.plays = Math.min(250, m.plays * 5); m.total = m.pts.levels + m.pts.score + m.pts.time + m.pts.stars + m.pts.plays; return m; })
    .sort((a, b) => b.total - a.total || b.levels - a.levels || a.name.localeCompare(b.name));
  const st = getSettings();
  out.forEach(m => { m.avatar = parseAvatar_(st['Avatar_' + m.name]); });
  return { game: gameId, players: out, byScore: rows.some(r => r.score > 0) };
}

// Achievement Archive leaderboards: for every game and level, each player's best run, ranked.
// Score games rank by score (then faster time); time-only games (Maze) by the fastest time.
const MINI_RECORD_GAMES = ['color-match', 'count-match', 'code-robot', 'trash-pointer'];
let BOARDS_MEMO_ = null;
function allBoards_(players) {
  if (BOARDS_MEMO_ && BOARDS_MEMO_.ss === ss_()) return BOARDS_MEMO_.boards;
  const boards = {};
  RECORD_GAMES.concat(MINI_RECORD_GAMES).forEach(g => { boards[g] = gameBoard_(g, players); });
  BOARDS_MEMO_ = { ss: ss_(), boards: boards };
  return boards;
}
function gameBoard_(gameId, players) {
  const names = {};
  players.forEach(p => { names[p.Name] = true; });
  const big = RECORD_GAMES.indexOf(gameId) !== -1, nLv = big ? LEVEL_COUNT : 5;   // main games: 6 levels (with 💀 Hardcore)
  const rows = scoreRows_().filter(r => r.game === gameId && names[r.name] && r.level >= 0 && r.level < nLv);
  const byScore = rows.some(r => r.score > 0);
  const better = (a, b) => {
    if (byScore) { if (a.score !== b.score) return a.score > b.score; }
    else if (a.stars !== b.stars && !(a.timeSec && b.timeSec)) return a.stars > b.stars;
    if (a.timeSec && b.timeSec && a.timeSec !== b.timeSec) return a.timeSec < b.timeSec;
    if (a.timeSec !== b.timeSec) return !!a.timeSec;
    return a.stars > b.stars;
  };
  const levels = Array.from({ length: nLv }, () => ({}));
  const tries = Array.from({ length: nLv }, () => ({}));   // how many times each player finished each level (Archive detail cards)
  rows.forEach(r => { tries[r.level][r.name] = (tries[r.level][r.name] || 0) + 1; const cur = levels[r.level][r.name]; if (!cur || better(r, cur)) levels[r.level][r.name] = r; });
  if (gameId === 'eyes-brain' || gameId === 'geoscout' || gameId === 'georead' || gameId === 'artifactory') {   // 👀🧠 / 🔢 best per way to play per level (detail card)
    const ways = Array.from({ length: nLv }, () => ({}));
    rows.forEach(r => { const w = String(r.theme || '').split(' · ')[0] || '🔢 Classic'; const cur = ways[r.level][w]; if (!cur || r.score > cur.score) ways[r.level][w] = { name: r.name, score: r.score, stars: r.stars }; });
    return { byScore: byScore, levels: levels.map((m, lv) => { const list = Object.keys(m).map(k => m[k]).sort((a, b) => better(a, b) ? -1 : better(b, a) ? 1 : 0);
      return { top: list.slice(0, 5).map(r => ({ name: r.name, score: r.score, timeSec: r.timeSec, stars: r.stars, date: r.date, theme: r.theme, tries: tries[lv][r.name] || 1 })), more: Math.max(0, list.length - 5), ways: ways[lv] }; }) };
  }
  return {
    byScore: byScore,
    levels: levels.map((m, lv) => {
      const list = Object.keys(m).map(n => m[n]).sort((a, b) => better(a, b) ? -1 : better(b, a) ? 1 : 0);
      return { top: list.slice(0, 5).map(r => ({ name: r.name, score: r.score, timeSec: r.timeSec, stars: r.stars, date: r.date, theme: r.theme, tries: tries[lv][r.name] || 1 })), more: Math.max(0, list.length - 5) };
    }),
  };
}
// Marks a recent finish with its family rank (1–3) when that run is a level record.
function rankRecent_(list, boards) {
  return list.map(r => {
    const b = boards[r.game], top = b && b.levels[r.level] ? b.levels[r.level].top : [];
    const i = top.findIndex(x => x.name === r.name && x.score === r.score && x.timeSec === r.timeSec);
    return Object.assign({}, r, { rank: i >= 0 && i < 3 ? i + 1 : 0 });
  });
}

function recentScores_(players, n) {
  const names = {};
  players.forEach(p => { names[p.Name] = true; });
  return scoreRows_().filter(r => names[r.name]).slice(-n).reverse();
}

// The badge / level save must never fail because of the Scores log: if the
// log write breaks (sheet renamed, protection, quota) the progress is still
// saved and the reason is returned (and written to the Executions log).
function safeLogScore_(name, gameId, levelIdx, levelName, extra) {
  try {
    return logScore_(name, gameId, levelIdx, levelName, extra);
  } catch (e) {
    console.error('Scores log failed: ' + e.message);
    return { timeSec: 0, best: null, personalBest: false, firstTime: false, scoreError: String(e.message || e) };
  }
}

// Adds one Scores row (called inside the save lock). Returns personal-best
// info for the result screen. Bad or missing numbers are simply left blank.
function logScore_(name, gameId, levelIdx, levelName, extra) {
  extra = extra || {};
  const t = Math.round(Number(extra.timeSec));
  const timeSec = t > 0 && t < 36000 ? t : '';
  const st = Math.round(Number(extra.stars));
  const stars = st >= 0 && st <= 3 ? st : '';
  const sc = Math.round(Number(extra.score));
  const score = sc >= 0 && sc < 1e9 ? sc : '';
  const theme = String(extra.theme || '').slice(0, 40);
  const before = bestFor_(name, gameId)[levelIdx];
  const isBest = timeSec !== '' && (!before || !before.timeSec || timeSec < before.timeSec);
  const isHigh = score !== '' && (!before || score > (before.score || 0));

  const sh = scoresSheet_();
  // Insert after the last row that has an id (stray formatting never makes ghost rows).
  const last = sh.getLastRow();
  let row = 2;
  if (last > 1) {
    const ids = sh.getRange(2, 1, last - 1, 1).getValues();
    for (let i = ids.length - 1; i >= 0; i--) { if (String(ids[i][0]).trim() !== '') { row = i + 3; break; } }
  }
  const tz = Session.getScriptTimeZone();
  const now = new Date();
  const id = 'S' + Utilities.formatDate(now, tz, 'yyMMddHHmmss') + Math.floor(Math.random() * 900 + 100);
  const rowVals = [id, Utilities.formatDate(now, tz, 'yyyy-MM-dd HH:mm'), name, gameId, levelIdx + 1, levelName || '',
    theme, timeSec, stars, score].map(v => String(v));
  sh.getRange(row, 1, 1, SCORES_WIDTH).setNumberFormat('@').setValues([rowVals]);
  SCORES_MEMO_ = null;
  const after = bestFor_(name, gameId)[levelIdx];
  return { timeSec: timeSec || 0, best: after, personalBest: isBest, newHighScore: isHigh, firstTime: !before };
}

// Recent finishes with the game's display name and icon (Dashboard feed).
function recentWithNames_(players, n) {
  const byId = {};
  BUILT_IN_GAMES.forEach(g => { byId[g.GameID] = { name: g.GameName, icon: g.Icon }; });
  getGames().forEach(g => { byId[g.GameID] = { name: g.GameName, icon: g.Icon }; });
  return recentScores_(players, n).map(r => Object.assign({}, r, {
    gameName: (byId[r.game] && byId[r.game].name) || r.game,
    icon: (byId[r.game] && byId[r.game].icon) || '🎮',
  }));
}

/* ============ LOOKS (themes) ============ */
// Each player picks their own look; stored in Settings as Theme_<Name>.
// The plain 'Theme' key is the family default (Dashboard, Admin).
const THEME_KEYS = ['classic', 'racing', 'princess', 'architect', 'hologram', 'retro', 'cyberpunk'];
function savePlayerTheme(name, theme, pin) {
  if (THEME_KEYS.indexOf(theme) === -1) throw new Error('Unknown look.');
  if (!listProfilesFull().some(p => p.Name === name)) throw new Error('Unknown player.');
  checkPlayerPin_(name, pin);   // only the player (their PIN) can change their look
  saveSetting('Theme_' + name, theme);
  try { safeRecordFeats_(name, 'app', { looks: 1 }); } catch (e) {}
  return { name: name, theme: theme };
}

/* ============ MINI GAMES (Color Match, Count & Match, mini Code the Robot, Trash Pointer) ============ */
// Progress row per game: GameID, SeriesID 'main', UnlockedLevel = stages
// cleared, Tokens = badges. Older versions stored a running score in
// UnlockedLevel; MINI_GAMES[id].stages caps it so old rows still work.
const MINI_GAMES = {
  'color-match':   { name: 'Color Match',    stages: 8 },
  'count-match':   { name: 'Count & Match',  stages: 6 },
  'code-robot':    { name: 'Code the Robot', stages: 5 },
  'trash-pointer': { name: 'Trash Pointer',  stages: 11 },
};
function miniProgressAll_(names) {
  const v = progressValues_().slice(1);
  const out = {};
  names.forEach(n => { out[n] = {}; Object.keys(MINI_GAMES).forEach(id => { out[n][id] = { unlocked: 0, tokens: [] }; }); });
  v.forEach(r => {
    if (!out[r[0]] || !MINI_GAMES[r[1]] || r[2] !== 'main') return;
    out[r[0]][r[1]] = {
      unlocked: Math.min(MINI_GAMES[r[1]].stages - 1, Number(r[3]) || 0),
      tokens: String(r[4] || '').split(',').map(t => t.trim()).filter(Boolean),
    };
  });
  return out;
}
function getMiniData(player) {
  const players = activePlayers_(listProfilesFull()).map(p => ({ Name: p.Name, Age: p.Age || '' }));
  return { players: players, progress: miniProgressAll_(players.map(p => p.Name)), settings: getSettings(), player: player || '' };
}
// A stage was cleared (or a speed round finished). Merges under a lock:
// never lowers the stage, never duplicates a badge, logs a Scores row.
function saveMiniResult(name, gameId, stageIdx, badge, extra) {
  const g = MINI_GAMES[gameId];
  const idx = Number(stageIdx);
  if (!g || !name || !(idx >= 0 && idx < g.stages)) throw new Error('Bad mini game result.');
  extra = extra || {};
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const cur = miniProgressAll_([name])[name][gameId];
    const unlocked = Math.min(g.stages - 1, Math.max(cur.unlocked, extra.speed ? cur.unlocked : idx + 1));
    const b = String(badge || '').slice(0, 80);
    const isNew = !!b && cur.tokens.indexOf(b) === -1;
    const tokens = isNew ? cur.tokens.concat([b]) : cur.tokens;
    saveProgress(name, gameId, 'main', unlocked, tokens);
    const res = { unlocked: unlocked, tokens: tokens, newBadge: isNew ? b : '' };
    return Object.assign(res, safeLogScore_(name, gameId, Math.min(idx, 4), String(extra.levelName || ('Stage ' + (idx + 1))), extra));
  } finally {
    lock.releaseLock();
  }
}

/* ============ FEATS: counts → badges (bronze/silver/gold) → Titles ============ */
// One row per player + game + stat, created automatically (tab "Feats").
// Columns are read BY POSITION (FEATS_COL); add new columns only at the end.
// kind 'sum' adds up every game, 'max' keeps the best, 'min' keeps the
// smallest non-zero (e.g. fewest moves to checkmate).
const FEATS_TAB = 'Feats';
const FEATS_COL = { id: 0, name: 1, game: 2, stat: 3, value: 4, updated: 5 };
const FEATS_HEADERS = [
  ['Feat ID', 'featId', 'Player|Game|Stat — made by the app. Do not edit.'],
  ['Player', 'name', 'Name exactly as on the Profiles tab'],
  ['Game', 'gameId', 'GameID (checkers, chess, pinball)'],
  ['Stat', 'stat', 'What is counted (see FEAT_DEFS in Code.gs)'],
  ['Value', 'value', 'Total, best or fewest — depends on the stat'],
  ['Updated', 'updated', 'yyyy-MM-dd HH:mm'],
];
const FEATS_WIDTH = FEATS_HEADERS.length;
const FEAT_DEFS = {
  'td-draprincess': {   // 🏰 TD-Stories · 🐉👑 Dra-Princess Diary (td-1)
    games: { name: 'Dra-Princess chapters played', icon: '🎮', kind: 'sum', hidden: true },
    bonks: { name: 'Suitors bonked away', icon: '💫', kind: 'sum', tiers: [50, 500, 3000] },
    waves: { name: 'Waves held back', icon: '🌊', kind: 'sum', tiers: [10, 100, 500] },
    perfect: { name: 'Perfect waves (no ❤️ lost)', icon: '✨', kind: 'sum', tiers: [10, 100, 400] },
    evolves: { name: 'Hero evolutions', icon: '⭐', kind: 'sum', tiers: [2, 20, 100] },
    ultimates: { name: 'Ultimates unlocked', icon: '☄️', kind: 'sum', tiers: [1, 10, 50] },
    combos: { name: 'Combo skills found', icon: '🤝', kind: 'sum', tiers: [1, 10, 40] },
    casts: { name: 'Skills used', icon: '🪄', kind: 'sum', hidden: true },
    chapters: { name: 'Diary chapters done', icon: '📔', kind: 'max', tiers: [1, 2, 6] },
  },
  'artifactory': {
    games: { name: 'Artifactory sessions', icon: '🎮', kind: 'sum', hidden: true },
    made: { name: 'Things made', icon: '🏭', kind: 'sum', tiers: [5, 25, 100] },
    lathe: { name: 'Turned on the lathe', icon: '🌀', kind: 'sum', tiers: [3, 20, 80] },
    finish: { name: 'Finishes (paint, varnish, engrave)', icon: '🎨', kind: 'sum', tiers: [3, 20, 80] },
    stone: { name: 'Stones polished', icon: '🪨', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    stories: { name: 'Stories written', icon: '📝', kind: 'sum', tiers: [3, 20, 80] },
    bpPages: { name: 'Blueprint pages stamped', icon: '🏅', kind: 'sum', tiers: [1, 5, 15] },
    bpDaily: { name: 'Blueprints of the Day', icon: '📅', kind: 'sum', tiers: [3, 20, 80] },
    bpCopied: { name: 'Family copied your blueprints', icon: '👪', kind: 'sum', tiers: [1, 10, 40] },
    bpShared: { name: 'Family blueprints shared', icon: '📐', kind: 'sum', tiers: [1, 5, 20] },
    repairs: { name: 'Things repaired', icon: '🔧', kind: 'sum', tiers: [1, 10, 40] },
    tests: { name: 'Things tested', icon: '🧲', kind: 'sum', tiers: [3, 20, 80] },
    breaks: { name: 'Broken in a test', icon: '💥', kind: 'sum', hidden: true },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    drops: { name: 'Game drops collected', icon: '🎁', kind: 'sum', tiers: [10, 100, 500] },
    remixed: { name: 'Remixed by the family', icon: '🔁', kind: 'sum', tiers: [1, 10, 40] },
    votes: { name: 'Design Show votes given', icon: '🗳️', kind: 'sum', tiers: [3, 20, 80] },
    whittle: { name: 'Things whittled', icon: '🔪', kind: 'sum', tiers: [3, 20, 80] },
    print: { name: '3D prints', icon: '🖨️', kind: 'sum', tiers: [3, 20, 80] },
    nature: { name: 'Nature crafts', icon: '🌿', kind: 'sum', tiers: [3, 20, 80] },
    lab: { name: 'Lab batches', icon: '🧪', kind: 'sum', tiers: [3, 20, 80] },
    recycled: { name: 'Things recycled', icon: '♻️', kind: 'sum', tiers: [1, 10, 40] },
    team: { name: 'Team projects', icon: '🤝', kind: 'sum', tiers: [1, 10, 40] },
    planer: { name: 'Planks planed', icon: '🪚', kind: 'sum', tiers: [3, 20, 80] },
    weld: { name: 'Welds', icon: '🔥', kind: 'sum', tiers: [3, 20, 80] },
    forge: { name: 'Forged', icon: '⚒️', kind: 'sum', tiers: [3, 20, 80] },
    pottery: { name: 'Pots fired', icon: '🏺', kind: 'sum', tiers: [3, 20, 80] },
    sew: { name: 'Woven + sewn', icon: '🧵', kind: 'sum', tiers: [3, 20, 80] },
    light: { name: 'Circuits lit', icon: '🔌', kind: 'sum', tiers: [3, 20, 80] },
    glows: { name: 'Things that glow', icon: '💡', kind: 'sum', tiers: [1, 10, 40] },
    gems: { name: 'Gems cut', icon: '💎', kind: 'sum', tiers: [3, 10, 50] },
    engraved: { name: 'Names engraved', icon: '✍️', kind: 'sum', tiers: [1, 10, 40] },
    blueprints: { name: 'Blueprint challenges', icon: '📐', kind: 'sum', tiers: [3, 20, 80] },
    perfect: { name: 'Perfect blueprints (3 ⭐)', icon: '⭐', kind: 'sum', tiers: [1, 10, 40] },
    latheStars: { name: 'Perfect lathe blueprints', icon: '🌀', kind: 'sum', hidden: true },
    stoneStars: { name: 'Perfect gem blueprints', icon: '💎', kind: 'sum', hidden: true },
    remixes: { name: 'Remixes', icon: '✨', kind: 'sum', tiers: [1, 10, 40] },
    gifts: { name: 'Materials given', icon: '🎁', kind: 'sum', tiers: [3, 30, 150] },
    shared: { name: 'Shared on the family shelf', icon: '🧺', kind: 'sum', tiers: [3, 30, 150] },
    team: { name: 'Team projects', icon: '🤝', kind: 'sum', tiers: [1, 10, 40] },
    matsMade: { name: 'Materials made in the lab', icon: '🧪', kind: 'sum', tiers: [3, 30, 150] },
    showStars: { name: 'Best Design Show stars', icon: '🎭', kind: 'max', tiers: [3, 8, 15] },
    daily: { name: 'Daily deliveries', icon: '📦', kind: 'sum', hidden: true },
  },
  'georead': {
    games: { name: 'GeoRead games', icon: '🎮', kind: 'sum', hidden: true },
    sounds: { name: 'Letter sounds found', icon: '🔊', kind: 'max', tiers: [10, 25, 45], unit: 'sounds' },
    blends: { name: 'Words blended', icon: '💥', kind: 'sum', tiers: [10, 100, 500] },
    built: { name: 'Words built', icon: '🧱', kind: 'sum', tiers: [10, 100, 500] },
    perfects: { name: 'Perfect rounds', icon: '⭐', kind: 'sum', tiers: [20, 200, 1000] },
    magic: { name: 'Magic e words', icon: '✨', kind: 'sum', tiers: [5, 30, 100] },
    found: { name: 'Sounds picked by ear', icon: '👂', kind: 'sum', tiers: [10, 100, 400], hidden: true },
    chapters: { name: 'Alphabet Road chapters', icon: '🗺️', kind: 'max', tiers: [1, 3, 6], unit: 'chapters' },
    rhymes: { name: 'Rhymes found', icon: '🔁', kind: 'sum', tiers: [10, 100, 400] },
    sight: { name: 'Sight words read', icon: '👀', kind: 'sum', tiers: [20, 200, 800] },
    traced: { name: 'Letters traced', icon: '✏️', kind: 'sum', tiers: [10, 52, 300] },
    cases: { name: 'Big + small matches', icon: '🅰️', kind: 'sum', tiers: [20, 150, 600] },
    stories: { name: 'Stories read', icon: '📖', kind: 'sum', tiers: [3, 20, 100] },
    sorted: { name: 'Word types sorted', icon: '🗂️', kind: 'sum', tiers: [20, 150, 600] },
    said: { name: 'Words said out loud', icon: '🎤', kind: 'sum', tiers: [5, 50, 200] },
  },
  'geoscout': {
    games: { name: 'GeoScout games', icon: '🎮', kind: 'sum', hidden: true },
    snaps: { name: 'Blocks snapped (+)', icon: '🧲', kind: 'sum', tiers: [20, 200, 1000] },
    splits: { name: 'Blocks split (−)', icon: '✂️', kind: 'sum', tiers: [10, 100, 500] },
    copies: { name: 'Copies made (×)', icon: '✖️', kind: 'sum', tiers: [5, 50, 250] },
    shares: { name: 'Fair shares (÷)', icon: '➗', kind: 'sum', tiers: [5, 50, 250] },
    balances: { name: 'Scales balanced', icon: '⚖️', kind: 'sum', tiers: [10, 100, 500] },
    compares: { name: 'Right > < = answers', icon: '🟰', kind: 'sum', tiers: [10, 100, 500] },
    avatarWeighs: { name: 'Times you weighed yourself', icon: '🧑', kind: 'sum', tiers: [1, 10, 50] },
    counts: { name: 'Numbers made', icon: '🎯', kind: 'sum', tiers: [10, 100, 500] },
    perfect: { name: 'Perfect rounds', icon: '✅', kind: 'sum', tiers: [10, 100, 500] },
    bestStreak: { name: 'Best perfect streak', icon: '🔥', kind: 'max', tiers: [4, 8, 10] },
    tens: { name: 'Tens towers built', icon: '🔟', kind: 'sum', tiers: [10, 100, 500] },
    wobble: { name: 'Exact towers', icon: '🏗️', kind: 'sum', tiers: [10, 100, 500] },
    fractions: { name: 'Fractions right', icon: '🍕', kind: 'sum', tiers: [10, 100, 500] },
    battleWins: { name: 'Tower battles won', icon: '⚔️', kind: 'sum', tiers: [1, 10, 50] },
    journeys: { name: 'Journey chapters', icon: '📖', kind: 'max', tiers: [1, 3, 6] },
    shapes: { name: 'Shapes built', icon: '🔷', kind: 'sum', tiers: [10, 100, 500] },
    patterns: { name: 'Patterns solved', icon: '🧩', kind: 'sum', tiers: [10, 100, 500] },
    battles: { name: 'Tower battles played', icon: '⚔️', kind: 'sum', hidden: true },
  },
  'wiscount': {   // 🃏🔢 WisCount (vs robot via saveLevelResult, 👥 2 players via saveFeats)
    games: { name: 'WisCount matches', icon: '🎮', kind: 'sum', hidden: true },
    wins: { name: 'WisCount wins', icon: '🔢', kind: 'sum', tiers: [1, 10, 50] },
    sweeps: { name: 'WisCount 3-0 sweeps', icon: '🧹', kind: 'sum', tiers: [1, 5, 20] },
  },
  'wisjack': {   // 🃏🂡 WisJack
    games: { name: 'WisJack matches', icon: '🎮', kind: 'sum', hidden: true },
    wins: { name: 'WisJack wins', icon: '🂡', kind: 'sum', tiers: [1, 10, 50] },
    sweeps: { name: 'WisJack 3-0 sweeps', icon: '🧹', kind: 'sum', tiers: [1, 5, 20] },
    exact: { name: 'Exactly 20 (or 21)', icon: '🎯', kind: 'sum', tiers: [1, 10, 50] },
  },
  'wisdeck': {   // 🃏 WisDeck (plan 11z): quiz feats come with saveLevelResult, deck feats with saveWisDeck
    games: { name: 'WisDeck quizzes', icon: '🎮', kind: 'sum', hidden: true },
    right: { name: 'Right answers', icon: '✅', kind: 'sum', tiers: [50, 500, 3000] },
    bestStreak: { name: 'Best answer streak', icon: '🔥', kind: 'max', tiers: [5, 10, 10] },
    cards: { name: 'Cards won', icon: '🃏', kind: 'sum', tiers: [50, 500, 3000] },
    fullCats: { name: 'Full categories', icon: '🎓', kind: 'max', tiers: [1, 5, 15] },
    cosmic: { name: 'Cosmic cards', icon: '🌌', kind: 'max', tiers: [1, 5, 20] },
    buzzWins: { name: 'WisBuzz wins', icon: '🔔', kind: 'sum', tiers: [1, 10, 50] },
    buzzRight: { name: 'WisBuzz right answers', icon: '✅', kind: 'sum', tiers: [10, 100, 500] },
    daily: { name: 'Daily decks played', icon: '📅', kind: 'sum', tiers: [1, 7, 30] },
  },




  'eyes-brain': {
    games: { name: 'Eyes Brain games', icon: '🎮', kind: 'sum', hidden: true },
    digits: { name: 'Digits remembered', icon: '🔢', kind: 'sum', tiers: [100, 1000, 10000] },
    perfects: { name: 'Perfect rounds', icon: '✅', kind: 'sum', tiers: [10, 100, 500] },
    bestCombo: { name: 'Best combo', icon: '🔥', kind: 'max', tiers: [3, 6, 10] },
    longest: { name: 'Brain level (longest number)', icon: '🏅', kind: 'max', tiers: [6, 10, 14], unit: 'digits' },
    challenge: { name: 'Longest Challenge', icon: '🏔️', kind: 'max', tiers: [6, 10, 15], unit: 'digits' },
    backPerfects: { name: 'Backwards perfects', icon: '🔁', kind: 'sum', tiers: [5, 25, 100] },
    listenPerfects: { name: 'Listen perfects', icon: '👂', kind: 'sum', tiers: [5, 25, 100] },
    chainWins: { name: 'Chain wins', icon: '➕', kind: 'sum', tiers: [1, 10, 50] },
    riots: { name: 'Brain riots', icon: '🧠', kind: 'sum', tiers: [1, 10, 50] },
    daily: { name: 'Daily family numbers', icon: '🎯', kind: 'sum', tiers: [1, 7, 30] },
  },
  'polyplot': {
    games: { name: 'Polyplot games', icon: '🎮', kind: 'sum', hidden: true },
    wins: { name: 'Plot Winner', icon: '🏆', kind: 'sum', tiers: [1, 10, 50] },
    boxes: { name: 'Shape Maker', icon: '⬛', kind: 'sum', tiers: [50, 500, 3000] },
    bestChain: { name: 'Longest chain', icon: '🔗', kind: 'max', tiers: [3, 6, 10] },
    chains3: { name: 'Chains of 3+', icon: '⛓️', kind: 'sum', tiers: [3, 30, 150] },
    catches: { name: 'Creature Catcher', icon: '🪤', kind: 'sum', tiers: [5, 50, 300] },
    hidden: { name: 'Hidden Finder', icon: '🐾', kind: 'sum', tiers: [1, 10, 50] },
    legend: { name: 'Legend Tamer', icon: '🐉', kind: 'sum', tiers: [1, 3, 10] },
    coins: { name: 'Coin Collector', icon: '🪙', kind: 'sum', tiers: [20, 200, 1000] },
    cards: { name: 'Card Player', icon: '🃏', kind: 'sum', tiers: [3, 30, 150] },
    events: { name: 'Storm Survivor', icon: '🌪️', kind: 'sum', tiers: [5, 50, 250] },
    doors: { name: 'Door Maker', icon: '🚪', kind: 'sum', tiers: [1, 10, 50] },
    built: { name: 'Fort Builder', icon: '🏗️', kind: 'sum', tiers: [5, 50, 250] },
    monsters: { name: 'Monster Stopper', icon: '👹', kind: 'sum', tiers: [5, 50, 250] },
    bestWave: { name: 'Waves held', icon: '🛡️', kind: 'max', tiers: [5, 10, 20] },
    fortWins: { name: 'Fort Winner', icon: '🏰', kind: 'sum', tiers: [1, 10, 50] },
    huntGames: { name: 'Hunt games', icon: '🏹', kind: 'sum', hidden: true },
  },
  'soul-bopper': {
    wins: { name: 'Bopper Winner', icon: '🏆', kind: 'sum', tiers: [1, 10, 50] },
    catches: { name: 'Player Catcher', icon: '💥', kind: 'sum', tiers: [5, 50, 300] },
    bots: { name: 'Bot Popper', icon: '🤖', kind: 'sum', tiers: [10, 100, 500] },
    blocks: { name: 'Block Breaker', icon: '🧱', kind: 'sum', tiers: [100, 1000, 5000] },
    chains: { name: 'Chain Reactor', icon: '🔗', kind: 'sum', tiers: [5, 50, 250] },
    kicks: { name: 'Bomb Kicker', icon: '👢', kind: 'sum', tiers: [5, 50, 200] },
    tosses: { name: 'Bomb Tosser', icon: '🤾', kind: 'sum', tiers: [5, 50, 200] },
    comebacks: { name: 'Comeback Kid', icon: '👻', kind: 'sum', tiers: [1, 10, 50] },
    multi: { name: 'Multi Catch', icon: '🎯', kind: 'max', tiers: [2, 3, 4] },
    triple: { name: 'Triple Pop', icon: '💫', kind: 'sum', tiers: [1, 5, 20] },
    pooWins: { name: 'Poo Commander', icon: '💩', kind: 'sum', tiers: [1, 5, 25] },
    holdWins: { name: 'Land Holder', icon: '🏳️', kind: 'sum', tiers: [1, 5, 25] },
    holdSecs: { name: 'Seconds in the zone', icon: '🏳️', kind: 'sum', hidden: true },
    bestWin: { name: 'Best battle level won', icon: '⚔️', kind: 'max', hidden: true },
    games: { name: 'Soul Bopper games', icon: '🎮', kind: 'sum', hidden: true },
    pooGames: { name: 'Classic Avatar games', icon: '💩', kind: 'sum', hidden: true },
    pickups: { name: 'Power-ups grabbed', icon: '✨', kind: 'sum', hidden: true },
    stages: { name: 'Stage Explorer', icon: '🗺️', kind: 'sum', tiers: [5, 30, 100] },
    bosses: { name: 'Boss Breaker', icon: '👑', kind: 'sum', tiers: [1, 3, 7] },
    w_dino: { name: 'Dino world stages', icon: '🦖', kind: 'max', hidden: true }, w_sea: { name: 'Sea world stages', icon: '🐙', kind: 'max', hidden: true }, w_dance: { name: 'Dance world stages', icon: '🪩', kind: 'max', hidden: true }, w_robot: { name: 'Robot world stages', icon: '🤖', kind: 'max', hidden: true },
    w_space: { name: 'Space world stages', icon: '🪐', kind: 'max', hidden: true }, w_sky: { name: 'Sky world stages', icon: '☁️', kind: 'max', hidden: true }, w_zombie: { name: 'Zombie world stages', icon: '🧟', kind: 'max', hidden: true },
    // per world (bomb skin evolution): g_ games, c_ catches, wl_ best level won vs bots (level + 1)
    g_dino: { name: 'Dino games', icon: '🦖', kind: 'sum', hidden: true }, g_sea: { name: 'Sea games', icon: '🐙', kind: 'sum', hidden: true }, g_dance: { name: 'Dance games', icon: '🪩', kind: 'sum', hidden: true }, g_robot: { name: 'Robot games', icon: '🤖', kind: 'sum', hidden: true }, g_space: { name: 'Space games', icon: '🪐', kind: 'sum', hidden: true }, g_sky: { name: 'Sky games', icon: '☁️', kind: 'sum', hidden: true }, g_zombie: { name: 'Zombie games', icon: '🧟', kind: 'sum', hidden: true },
    c_dino: { name: 'Dino catches', icon: '🦖', kind: 'sum', hidden: true }, c_sea: { name: 'Sea catches', icon: '🐙', kind: 'sum', hidden: true }, c_dance: { name: 'Dance catches', icon: '🪩', kind: 'sum', hidden: true }, c_robot: { name: 'Robot catches', icon: '🤖', kind: 'sum', hidden: true }, c_space: { name: 'Space catches', icon: '🪐', kind: 'sum', hidden: true }, c_sky: { name: 'Sky catches', icon: '☁️', kind: 'sum', hidden: true }, c_zombie: { name: 'Zombie catches', icon: '🧟', kind: 'sum', hidden: true },
    wl_dino: { name: 'Dino best win', icon: '🦖', kind: 'max', hidden: true }, wl_sea: { name: 'Sea best win', icon: '🐙', kind: 'max', hidden: true }, wl_dance: { name: 'Dance best win', icon: '🪩', kind: 'max', hidden: true }, wl_robot: { name: 'Robot best win', icon: '🤖', kind: 'max', hidden: true }, wl_space: { name: 'Space best win', icon: '🪐', kind: 'max', hidden: true }, wl_sky: { name: 'Sky best win', icon: '☁️', kind: 'max', hidden: true }, wl_zombie: { name: 'Zombie best win', icon: '🧟', kind: 'max', hidden: true },
  },
  'alignext': {   // 🔴 Drop
    wins: { name: 'Drop Winner', icon: '🔴', kind: 'sum', tiers: [1, 10, 50] },
    lines: { name: 'Line Maker', icon: '〰️', kind: 'sum', tiers: [5, 50, 250] },
    perfect: { name: 'Clean Sweep', icon: '✨', kind: 'sum', tiers: [1, 10, 30] },
    series: { name: 'Best of 3 Champ', icon: '🏆', kind: 'sum', tiers: [1, 5, 20] },
    cards: { name: 'Card Player', icon: '🃏', kind: 'sum', tiers: [5, 25, 100] },
    flips: { name: 'Stand Flipper', icon: '🪜', kind: 'sum', tiers: [1, 5, 20] },
    games: { name: 'Drop games', icon: '🎮', kind: 'sum', hidden: true },
  },
  'omnifile': {   // ❌⭕ Omnifile
    wins: { name: 'Omnifile Winner', icon: '❌', kind: 'sum', tiers: [1, 10, 50] },
    lines: { name: 'Corner Thinker', icon: '〰️', kind: 'sum', tiers: [5, 50, 250] },
    perfect: { name: 'No Chance Given', icon: '✨', kind: 'sum', tiers: [1, 10, 30] },
    series: { name: 'Omni Best of 3', icon: '🏆', kind: 'sum', tiers: [1, 5, 20] },
    cards: { name: 'Omni Card Player', icon: '🃏', kind: 'sum', tiers: [5, 25, 100] },
    covers: { name: 'Stack Coverer', icon: '⬇️', kind: 'sum', tiers: [5, 30, 150] },
    stackWins: { name: 'Stack Winner', icon: '♟️', kind: 'sum', tiers: [1, 10, 50] },
    powers: { name: 'Power Mover', icon: '⚡', kind: 'sum', tiers: [3, 25, 100] },
    games: { name: 'Omnifile games', icon: '🎮', kind: 'sum', hidden: true },
  },
  'snakeast': {   // 🍎 Snakeast
    wins: { name: 'Feast Winner', icon: '🍎', kind: 'sum', tiers: [1, 10, 50] },
    eaten: { name: 'Snake Snacker', icon: '🍏', kind: 'sum', tiers: [50, 500, 3000] },
    longest: { name: 'Long Snake', icon: '🐍', kind: 'max', unit: 'long', tiers: [15, 30, 50] },
    golds: { name: 'Golden Eater', icon: '✨', kind: 'sum', tiers: [5, 50, 250] },
    goldRow: { name: 'Golden Streak', icon: '🥇', kind: 'max', tiers: [2, 3, 5] },
    endless: { name: 'Endless Best', icon: '♾️', kind: 'max', tiers: [500, 3000, 15000] },
    skills: { name: 'Skill Snake', icon: '⚡', kind: 'sum', tiers: [5, 50, 250] },
    duelWins: { name: 'Snake Duel Champ', icon: '👥', kind: 'sum', tiers: [1, 10, 50] },
    games: { name: 'Snakeast games', icon: '🎮', kind: 'sum', hidden: true },
    end0: { name: 'Endless Basic', icon: '♾️', kind: 'max', hidden: true }, end1: { name: 'Endless Junior', icon: '♾️', kind: 'max', hidden: true }, end2: { name: 'Endless Intermediate', icon: '♾️', kind: 'max', hidden: true },
    end3: { name: 'Endless Hard', icon: '♾️', kind: 'max', hidden: true }, end4: { name: 'Endless Extreme', icon: '♾️', kind: 'max', hidden: true }, end5: { name: 'Endless Hardcore', icon: '♾️', kind: 'max', hidden: true },
  },
  'snakigate': {   // 🧭 Snakigate
    wins: { name: 'Slither Winner', icon: '🧭', kind: 'sum', tiers: [1, 10, 50] },
    eaten: { name: 'Dot Gobbler', icon: '🟡', kind: 'sum', tiers: [100, 1000, 6000] },
    longest: { name: 'Mega Snake', icon: '🐉', kind: 'max', unit: 'long', tiers: [40, 100, 200] },
    popped: { name: 'Snake Popper', icon: '💥', kind: 'sum', tiers: [3, 25, 150] },
    skills: { name: 'Arena Skills', icon: '⚡', kind: 'sum', tiers: [5, 50, 250] },
    duelWins: { name: 'Arena Duel Champ', icon: '👥', kind: 'sum', tiers: [1, 10, 50] },
    games: { name: 'Snakigate games', icon: '🎮', kind: 'sum', hidden: true },
  },
  'snakastle': {   // 🏰 Snakastle
    wins: { name: 'Castle Winner', icon: '🏰', kind: 'sum', tiers: [1, 10, 50] },
    land: { name: 'Land Claimer', icon: '🗺️', kind: 'max', unit: '%', tiers: [30, 50, 70] },
    flags: { name: 'Flag Planter', icon: '🚩', kind: 'sum', tiers: [10, 100, 600] },
    cuts: { name: 'Trail Cutter', icon: '✂️', kind: 'sum', tiers: [1, 10, 50] },
    eaten: { name: 'Castle Snacker', icon: '🍎', kind: 'sum', tiers: [20, 200, 1500] },
    longest: { name: 'Castle Snake', icon: '🐍', kind: 'max', unit: 'long', tiers: [10, 25, 50] },
    skills: { name: 'Castle Skills', icon: '⚡', kind: 'sum', tiers: [5, 50, 250] },
    duelWins: { name: 'Land Race Champ', icon: '👥', kind: 'sum', tiers: [1, 10, 50] },
    games: { name: 'Snakastle games', icon: '🎮', kind: 'sum', hidden: true },
  },
  // (per-world feats for 🐍 snake skins are added below FEAT_DEFS: g_<world> games · f_<world> food · l_<world> longest · w_<world> best level won + 1)
  'snaketale': {   // 📜 Snaketale (story — feats only, no board)
    stages: { name: 'Story Stages', icon: '📜', kind: 'max', tiers: [5, 20, 42] },
    chapters: { name: 'Tale Chapters', icon: '📖', kind: 'max', tiers: [1, 3, 6] },
    bosses: { name: 'Boss Beater', icon: '👑', kind: 'max', tiers: [1, 3, 6] },
    stars: { name: 'Story Stars', icon: '⭐', kind: 'max', tiers: [20, 70, 126] },
    eaten: { name: 'Story Snacks', icon: '🍎', kind: 'sum', hidden: true },
  },
  'brawl-buddies': {
    wins: { name: 'Brawl Winner', icon: '🏆', kind: 'sum', tiers: [1, 10, 50] },
    bonks: { name: 'Bonk Machine', icon: '👊', kind: 'sum', tiers: [50, 500, 3000] },
    combo: { name: 'Combo Star', icon: '🔥', kind: 'max', tiers: [3, 6, 10] },
    juggle: { name: 'Sky Juggler', icon: '🌟', kind: 'max', tiers: [2, 4, 5] },
    uppers: { name: 'Uppercut Rocket', icon: '🚀', kind: 'sum', tiers: [5, 50, 250] },
    perfects: { name: 'Untouchable', icon: '✨', kind: 'sum', tiers: [1, 10, 50] },
    powers: { name: 'Power Pusher', icon: '🌀', kind: 'sum', tiers: [5, 50, 200] },
    duoWins: { name: 'Family Brawl Champ', icon: '👥', kind: 'sum', tiers: [1, 10, 50] },
    grabs: { name: 'Grapple Champ', icon: '🤼', kind: 'sum', tiers: [1, 25, 150] },
    breaks: { name: 'Guard Smasher', icon: '🔨', kind: 'sum', tiers: [1, 20, 100] },
    techs: { name: 'Wriggle Wizard', icon: '🪄', kind: 'sum', tiers: [1, 10, 50] },
    tags: { name: 'Tag Team', icon: '🔁', kind: 'sum', tiers: [1, 25, 150] },
    sky: { name: 'Sky Combos', icon: '🌟', kind: 'sum', hidden: true },
    matches: { name: 'Brawls', icon: '🥊', kind: 'sum', hidden: true },
  },
  'brawenture': {   // 🗺️ Brawenture (plan 11i-2)
    tales: { name: 'Family Rescuer', icon: '🗺️', kind: 'sum', tiers: [1, 6, 20] },
    puzzles: { name: 'Puzzle Pro', icon: '🧩', kind: 'sum', tiers: [3, 25, 100] },
    bosses: { name: 'Boss Buster', icon: '😈', kind: 'sum', tiers: [1, 10, 40] },
    found: { name: 'Treasure Finder', icon: '🧸', kind: 'sum', tiers: [3, 18, 50] },
    kos: { name: 'Baddie Bonker', icon: '👊', kind: 'sum', tiers: [25, 250, 1500] },
    coop: { name: 'Team Adventurer', icon: '👥', kind: 'sum', tiers: [1, 10, 30] },
    hardcore: { name: 'Brave Hero', icon: '💀', kind: 'sum', tiers: [1, 3, 6] },
    t1: { name: 'Playground Rumble', icon: '🛝', kind: 'max', hidden: true }, t2: { name: 'Candy Factory Defense', icon: '🍭', kind: 'max', hidden: true },
    t3: { name: 'Castle Climb', icon: '🏰', kind: 'max', hidden: true }, t4: { name: 'Zombie Crawl', icon: '🧟', kind: 'max', hidden: true },
    t5: { name: 'Monster Outbreak', icon: '👾', kind: 'max', hidden: true }, t6: { name: 'Undersea Rescue', icon: '🧜', kind: 'max', hidden: true },
    runs: { name: 'Adventures', icon: '🗺️', kind: 'sum', hidden: true },
  },
  checkers: {
    doubles: { name: 'Double Jumper', icon: '🐸', kind: 'sum', tiers: [1, 10, 25] },
    triples: { name: 'Triple Jumper', icon: '🦘', kind: 'sum', tiers: [1, 5, 15] },
    megas: { name: 'Mega Jumper', icon: '⚡', kind: 'sum', tiers: [1, 3, 10] },
    kings: { name: 'King Maker', icon: '👑', kind: 'sum', tiers: [1, 10, 25] },
    wins: { name: 'Checkers Winner', icon: '🏆', kind: 'sum', tiers: [1, 10, 30] },
    perfect: { name: 'Flawless Win', icon: '💎', kind: 'sum', tiers: [1, 3, 10] },
  },
  chess: {
    castles: { name: 'Castle Builder', icon: '🏰', kind: 'sum', tiers: [1, 10, 25] },
    promos: { name: 'Pawn Promoter', icon: '✨', kind: 'sum', tiers: [1, 5, 15] },
    enpassant: { name: 'En Passant', icon: '🥷', kind: 'sum', tiers: [1, 3, 10] },
    forks: { name: 'Fork Finder', icon: '🍴', kind: 'sum', tiers: [1, 10, 25] },
    checks: { name: 'Check Caller', icon: '♚', kind: 'sum', tiers: [5, 25, 100] },
    dchecks: { name: 'Double Check', icon: '⚡', kind: 'sum', tiers: [1, 3, 10] },
    mates: { name: 'Checkmater', icon: '🏆', kind: 'sum', tiers: [1, 10, 30] },
    fastMate: { name: 'Quick Checkmate', icon: '⏱️', kind: 'min', tiers: [40, 25, 15], unit: 'moves' },
  },
  room: {
    jumps: { name: 'Jumps', icon: '🦘', kind: 'sum', hidden: true },
    crawl: { name: 'Belly crawl', icon: '🐛', kind: 'sum', hidden: true },
    gestures: { name: 'Room moves', icon: '💃', kind: 'sum', hidden: true },
    placed: { name: 'Room things placed', icon: '🪴', kind: 'max', hidden: true },
    visits: { name: 'Rooms visited', icon: '🚪', kind: 'sum', hidden: true },
    gifts: { name: 'Gifts sent', icon: '💝', kind: 'sum', hidden: true },
    received: { name: 'Gifts received', icon: '🎁', kind: 'sum', hidden: true },
    cleans: { name: 'Rooms tidied', icon: '🧹', kind: 'sum', hidden: true },
  },
  app: {
    archive: { name: 'Archive visits', icon: '🏆', kind: 'sum', hidden: true },
    looks: { name: 'Look changes', icon: '🎨', kind: 'sum', hidden: true },
  },
  pinball: {
    topScore: { name: 'High Scorer', icon: '🏆', kind: 'max', tiers: [25000, 75000, 150000] },
    maxCombo: { name: 'Combo Star', icon: '🔥', kind: 'max', tiers: [10, 20, 35] },
    jackpots: { name: 'Jackpot', icon: '🎰', kind: 'sum', tiers: [1, 5, 15] },
    multiballs: { name: 'Multiball', icon: '🎱', kind: 'sum', tiers: [1, 10, 30] },
    scenes: { name: 'Bonus Explorer', icon: '🎪', kind: 'sum', tiers: [1, 5, 15] },
    scene_carnival: { name: 'Big Top', icon: '🎪', kind: 'sum', hidden: true },
    scene_castle: { name: 'Dragon\'s Den', icon: '🐉', kind: 'sum', hidden: true },
    scene_space: { name: 'Wormhole', icon: '🌀', kind: 'sum', hidden: true },
    scene_sea: { name: 'Coral Reef', icon: '🪸', kind: 'sum', hidden: true },
    scene_zombie: { name: 'Graveyard Party', icon: '🪦', kind: 'sum', hidden: true },
    scene_sport: { name: 'Goal Rush', icon: '🥅', kind: 'sum', hidden: true },
    scene_monster: { name: 'Catch Zone', icon: '🫧', kind: 'sum', hidden: true },
    breakouts: { name: 'Break-out', icon: '💥', kind: 'sum', hidden: true },
    skills: { name: 'Skill Shot', icon: '🎯', kind: 'sum', tiers: [1, 10, 25] },
    words: { name: 'Word Wizard', icon: '🔤', kind: 'sum', tiers: [1, 10, 25] },
    boxes: { name: 'Mystery Opener', icon: '🎁', kind: 'sum', tiers: [1, 10, 30] },
    buddy: { name: 'Buddy Bonus', icon: '🐒', kind: 'sum', tiers: [1, 5, 15] },
    chain: { name: 'Lucky Streak', icon: '🍀', kind: 'max', tiers: [3, 5, 10] },
  },
  hopper: {
    bestRows: { name: 'Far Hopper', icon: '🐸', kind: 'max', tiers: [30, 75, 150] },
    coins: { name: 'Coin Hopper', icon: '🪙', kind: 'sum', tiers: [50, 250, 1000] },
    gems: { name: 'Gem Finder', icon: '💎', kind: 'sum', tiers: [1, 10, 40] },
    checkpoints: { name: 'Flag Catcher', icon: '🏁', kind: 'sum', tiers: [1, 10, 40] },
    nearMiss: { name: 'Close Call', icon: '😱', kind: 'sum', tiers: [5, 25, 100] },
    rows: { name: 'Rows hopped', icon: '🐾', kind: 'sum', hidden: true },
  },
  turbo: {
    topSpeed: { name: 'Speedster', icon: '🚀', kind: 'max', unit: 'km/h', tiers: [120, 160, 200] },
    overtakes: { name: 'Overtaker', icon: '🏎️', kind: 'sum', tiers: [25, 150, 500] },
    jumps: { name: 'Jumper', icon: '🦘', kind: 'sum', tiers: [5, 30, 100] },
    drift: { name: 'Drifter', icon: '🌀', kind: 'sum', unit: 's', tiers: [10, 60, 200] },
    coins: { name: 'Coin Racer', icon: '🪙', kind: 'sum', tiers: [50, 250, 1000] },
    wins: { name: 'Race Winner', icon: '🥇', kind: 'sum', tiers: [1, 5, 20] },
    nearMiss: { name: 'Close Shave', icon: '😱', kind: 'sum', hidden: true },
    metres: { name: 'Distance driven', icon: '🐾', kind: 'sum', unit: 'm', hidden: true },
  },
  workshop: {
    made: { name: 'Maker', icon: '🔨', kind: 'sum', tiers: [1, 5, 15] },
    topStars: { name: 'Show Star', icon: '🌟', kind: 'max', tiers: [3, 8, 15] },
    votes: { name: 'Fair Judge', icon: '🗳️', kind: 'sum', tiers: [3, 15, 40] },
    given: { name: 'Kind Crafter', icon: '🎁', kind: 'sum', tiers: [1, 5, 15] },
  },
  'number-grid': {
    solved: { name: 'Grids Solved', icon: '🔢', kind: 'sum', tiers: [5, 25, 100] },
    lines: { name: 'Happy Lines', icon: '🎉', kind: 'sum', tiers: [20, 100, 400] },
    perfect: { name: 'Perfect Grid', icon: '💯', kind: 'sum', tiers: [1, 5, 20] },
    cells: { name: 'Squares Filled', icon: '🔲', kind: 'sum', hidden: true },
    rounds: { name: 'Rounds', icon: '🔢', kind: 'sum', hidden: true },
  },
  'pop-blocks': {
    popped: { name: 'Block Popper', icon: '🫧', kind: 'sum', tiers: [200, 1000, 5000] },
    bigGroup: { name: 'Big Group', icon: '💥', kind: 'max', tiers: [8, 12, 20] },
    powers: { name: 'Power Blaster', icon: '🚀', kind: 'sum', tiers: [5, 25, 100] },
    allClear: { name: 'Clean Sweep', icon: '🧹', kind: 'sum', tiers: [1, 5, 20] },
    bestCombo: { name: 'Combo', icon: '🔥', kind: 'max', tiers: [2, 4, 8] },
    rounds: { name: 'Rounds', icon: '🫧', kind: 'sum', hidden: true },
  },
  'block-drop': {
    lines: { name: 'Row Clearer', icon: '🧱', kind: 'sum', tiers: [50, 250, 1000] },
    quads: { name: 'Block Blast', icon: '💥', kind: 'sum', tiers: [1, 10, 50] },
    pieces: { name: 'Blocks Dropped', icon: '🔷', kind: 'sum', hidden: true },
    rounds: { name: 'Rounds', icon: '🧱', kind: 'sum', hidden: true },
  },
  'pose-party': {
    poses: { name: 'Poses Matched', icon: '📷', kind: 'sum', tiers: [20, 150, 600] },
    perfect: { name: 'Perfect Pose', icon: '💯', kind: 'sum', tiers: [1, 10, 50] },
    bestPct: { name: 'Best Match', icon: '🎯', kind: 'max', unit: '%', tiers: [80, 90, 98] },
    speedBest: { name: 'Speed Poser', icon: '⏱️', kind: 'max', tiers: [8, 15, 25] },
    copyBest: { name: 'Copy Cat', icon: '🪞', kind: 'max', tiers: [5, 8, 10] },
    danceBest: { name: 'Dance Star', icon: '💃', kind: 'max', tiers: [1500, 4000, 10000] },   // 📷 best Dance chain score (pose chat S2b-4)
    groupBest: { name: 'Team Poser', icon: '🧑‍🤝‍🧑', kind: 'max', tiers: [4, 8, 10] },   // most group shapes in one game
    booths: { name: 'Photo Booth Artist', icon: '📸', kind: 'sum', tiers: [1, 10, 30] },   // Photo Booth pictures downloaded
    statueBest: { name: 'Statue Star', icon: '🗿', kind: 'max', unit: 's', tiers: [20, 45, 90] },   // most seconds held in one Statue Hold game (S4)
    freezeBest: { name: 'Ice Cube', icon: '🧊', kind: 'max', tiers: [3, 5, 8] },   // perfect freezes in one Freeze Dance
    freezeSecs: { name: 'Frozen seconds', icon: '❄️', kind: 'sum', hidden: true, tiers: [30, 150, 600] },
    mirrorBest: { name: 'Mirror Twins', icon: '🪞', kind: 'max', tiers: [3, 6, 10] },   // mirror rounds matched in one game (S5)
    lettersMade: { name: 'Body Letters', icon: '🔤', kind: 'sum', tiers: [10, 50, 200] },   // letters made with the body (S6)
    posesBuilt: { name: 'Pose Builder', icon: '🛠️', kind: 'max', tiers: [1, 5, 15] },   // own poses in My poses (S7)
  },
  // 🔥 PyraDive feats (pd-1): plan §11 titles per action
  'pyraspike': {
    wins: { name: 'Pyra Winner', icon: '🏆', kind: 'sum', tiers: [1, 10, 50] },
    aces: { name: 'Ace Driver', icon: '🚀', kind: 'sum', tiers: [5, 30, 100] },
    kills: { name: 'Spirit Dunker', icon: '💥', kind: 'sum', tiers: [10, 100, 500] },
    assists: { name: 'Ghost Dinker', icon: '🪶', kind: 'sum', tiers: [10, 100, 500] },
    digs: { name: 'Floor Guardian', icon: '🛡️', kind: 'sum', tiers: [10, 100, 500] },
    dives: { name: 'PyraDiver', icon: '🤸', kind: 'sum', tiers: [5, 50, 200] },
    stuffs: { name: 'Wall Titan', icon: '🧱', kind: 'sum', tiers: [3, 30, 150] },
    sets: { name: 'Sky Setter', icon: '🙌', kind: 'sum', tiers: [20, 200, 1000] },
    bumps: { name: 'Perfect Passer', icon: '🤚', kind: 'sum', tiers: [20, 200, 1000] },
    pyras: { name: 'Flame Starter', icon: '🔥', kind: 'sum', tiers: [5, 50, 250] },
    rally: { name: 'Rally King / Queen', icon: '🔁', kind: 'max', tiers: [10, 20, 40] },
    games: { name: 'PyraDive matches', icon: '🏐', kind: 'sum', hidden: true },
    dinks: { name: 'Dinks', icon: '🪶', kind: 'sum', hidden: true },
    dunks: { name: 'Dunks', icon: '💥', kind: 'sum', hidden: true },
    drives: { name: 'Serves', icon: '🚀', kind: 'sum', hidden: true },
    blocks: { name: 'Blocks', icon: '🧱', kind: 'sum', hidden: true },
    m_beach: { name: 'Beach 2v2 wins', icon: '🏖️', kind: 'sum', hidden: true },
    m_small: { name: 'Small 3v3 wins', icon: '🏫', kind: 'sum', hidden: true },
    m_full: { name: 'Full 6v6 wins', icon: '🏟️', kind: 'sum', hidden: true },
  },
  'blasoff': {   // ⚽ bo-1
    wins: { name: 'Match Winner', icon: '🏆', kind: 'sum', tiers: [1, 10, 50] },
    goals: { name: 'Golden Boot', icon: '⚽', kind: 'sum', tiers: [10, 100, 500] },
    bestGoals: { name: 'Hat-trick Hero', icon: '🎩', kind: 'max', tiers: [2, 3, 5] },
    assists: { name: 'Playmaker', icon: '🅰️', kind: 'sum', tiers: [5, 50, 200] },
    tricks: { name: 'Trick Master', icon: '🌀', kind: 'sum', tiers: [10, 100, 500] },
    volleys: { name: 'Volley Hero', icon: '🎯', kind: 'sum', tiers: [3, 30, 100] },
    shoutSaves: { name: "Keeper's Voice", icon: '📣', kind: 'sum', tiers: [3, 25, 100] },
    tackles: { name: 'Ball Winner', icon: '🦶', kind: 'sum', tiers: [10, 100, 500] },
    cleanSheets: { name: 'Clean Sheet', icon: '🧤', kind: 'sum', tiers: [1, 10, 50] },
    headers: { name: 'Header Hero', icon: '🤕', kind: 'sum', tiers: [3, 30, 100] },
    matches: { name: 'Matches', icon: '⚽', kind: 'sum', hidden: true },
    win_4v4: { name: '4v4 wins', icon: '⚽', kind: 'sum', hidden: true },
    win_7v7: { name: '7v7 wins', icon: '🏟️', kind: 'sum', hidden: true },
    win_11v11: { name: '11v11 wins', icon: '🌍', kind: 'sum', hidden: true },   // 🌍 bo-2a
    win_5v5: { name: 'Futsal wins', icon: '🥅', kind: 'sum', hidden: true },   // 🏟️ bo-2b
    win_1v1: { name: 'Street wins', icon: '🏙️', kind: 'sum', hidden: true },
    nutmegs: { name: 'Nutmeg King', icon: '🥜', kind: 'sum', tiers: [3, 25, 100] },
    perfects: { name: 'Perfect Timing', icon: '⚡', kind: 'sum', tiers: [5, 50, 200] },   // ⚡ bo-2c
    blasts: { name: 'Star Blaster', icon: '🔥', kind: 'sum', tiers: [1, 10, 50] },
    skills: { name: 'Skill challenges', icon: '🎯', kind: 'sum', hidden: true },   // 🎯 bo-3a
    skillStars: { name: 'Skill Star', icon: '⭐', kind: 'sum', tiers: [10, 50, 150] },
    juggles: { name: 'Keepy-ups', icon: '🦶', kind: 'max', tiers: [10, 25, 50] },
    win_pens: { name: 'Shootout wins', icon: '🥅', kind: 'sum', hidden: true },
    win_battle: { name: 'Tricks Battle wins', icon: '🎤', kind: 'sum', tiers: [1, 10, 50] },   // 🎤 bo-3b
  },
  // 🔍 Pokadif feats (pk-1)
  'pokadif': {
    found: { name: 'Differences found', icon: '🔎', kind: 'sum', tiers: [20, 200, 1000] },
    cases: { name: 'Cases closed', icon: '📁', kind: 'sum', tiers: [3, 30, 100] },
    perfect: { name: 'Perfect pictures', icon: '🦅', kind: 'sum', tiers: [5, 50, 200] },
    quick: { name: 'Fastest picture', icon: '⚡', kind: 'min', tiers: [40, 20, 10], unit: 's' },
    odd: { name: 'Odd ones found', icon: '🎯', kind: 'sum', tiers: [10, 100, 500] },   // pk-2a
    blinks: { name: 'Blink finds', icon: '👁️', kind: 'sum', tiers: [10, 100, 500] },
    games: { name: 'Pokadif cases', icon: '🔍', kind: 'sum', hidden: true },
    hints: { name: 'Magnifier hints', icon: '🔍', kind: 'sum', hidden: true },
    oops: { name: 'Oops pokes', icon: '❌', kind: 'sum', hidden: true },
  },
  // 🔬 Sciencetory feats (sc-1)
  'sciencetory': {
    tests: { name: 'Lab tests', icon: '🔬', kind: 'sum', tiers: [5, 25, 100] },
    right: { name: 'Good guesses', icon: '🎯', kind: 'sum', tiers: [5, 25, 100] },
    breaks: { name: 'Crash tests', icon: '💥', kind: 'sum', tiers: [1, 10, 50] },
    records: { name: 'Family records', icon: '🏆', kind: 'sum', tiers: [1, 5, 20] },
    testKinds: { name: 'Different tests', icon: '⚙️', kind: 'max', tiers: [3, 6, 12] },
    samples: { name: 'Sample tests', icon: '🧪', kind: 'sum', hidden: true },
    games: { name: 'Sciencetory runs', icon: '🔬', kind: 'sum', hidden: true },
    elements: { name: 'Element cards', icon: '📇', kind: 'max', tiers: [10, 40, 118] },   // ⚗️ sc-2a (sciChemSave: how many of the 118 you own)
    compounds: { name: 'Molecules built', icon: '⚛️', kind: 'max', tiers: [5, 20, 50] },
    chemRounds: { name: 'Chemistry rounds', icon: '⚗️', kind: 'sum', hidden: true },
    atoms: { name: 'Atoms built', icon: '⚛️', kind: 'max', tiers: [5, 20, 36] },   // ⚛️ sc-2b (sciChemSave kind 'atom': different atoms you built)
    quantumRounds: { name: 'Quantum rounds', icon: '⚛️', kind: 'sum', hidden: true },
  },
  // ⏱️ Pokadif Arcade feats (pk-2b)
  'pokadif-arcade': {
    pictures: { name: 'Best Arcade run', icon: '📸', kind: 'max', tiers: [5, 15, 30], unit: ' pictures' },
    checkpoints: { name: 'Arcade checkpoints', icon: '✅', kind: 'sum', tiers: [3, 20, 100] },
    found: { name: 'Arcade finds', icon: '🔎', kind: 'sum', tiers: [30, 300, 1500] },
    games: { name: 'Arcade runs', icon: '⏱️', kind: 'sum', hidden: true },
    hints: { name: 'Arcade hints', icon: '🔍', kind: 'sum', hidden: true },
    oops: { name: 'Arcade oops', icon: '❌', kind: 'sum', hidden: true },
  },
  'pokadif-case': {
    stories: { name: 'Cases closed', icon: '📁', kind: 'sum', tiers: [1, 10, 30] },   // 📖 pk-3a
    casebook: { name: 'Case books closed', icon: '📚', kind: 'max', tiers: [1, 2, 3] },   // 📖 pk-3b
    lessons: { name: 'Lesson cards', icon: '🎓', kind: 'max', tiers: [3, 6, 9] },
    chapters: { name: 'Chapters', icon: '📖', kind: 'sum', hidden: true },
    games: { name: 'Cases started', icon: '🕵️', kind: 'sum', hidden: true },
    perfect: { name: 'Perfect steps', icon: '🦅', kind: 'sum', hidden: true },
    hints: { name: 'Magnifier hints', icon: '🔍', kind: 'sum', hidden: true },
    oops: { name: 'Oops', icon: '❌', kind: 'sum', hidden: true },
  },
  'sla-brall': {
    wins: { name: 'Match Winner', icon: '🏆', kind: 'sum', tiers: [1, 10, 50] },
    rally: { name: 'Rally Machine', icon: '🔁', kind: 'max', tiers: [10, 25, 50] },
    smash: { name: 'Smash Captain', icon: '💥', kind: 'sum', tiers: [10, 100, 500] },
    aces: { name: 'Ace Server', icon: '🎾', kind: 'sum', tiers: [5, 30, 100] },
    perfect: { name: 'Sweet Spot', icon: '✨', kind: 'sum', tiers: [10, 100, 500] },
    powers: { name: 'Power Player', icon: '⚡', kind: 'sum', tiers: [5, 50, 200] },
    legend: { name: 'Golden Shot', icon: '⭐', kind: 'sum', tiers: [1, 10, 50] },
    goals: { name: 'Goal Getter', icon: '🏒', kind: 'sum', tiers: [10, 100, 500] },
    matches: { name: 'Matches', icon: '🏓', kind: 'sum', hidden: true },
    win_slashot: { name: 'SlaShot wins', icon: '🏒', kind: 'sum', hidden: true },
    win_slapoof: { name: 'SlaPoof wins', icon: '🥒', kind: 'sum', hidden: true },
    win_slaball: { name: 'SlaBall wins', icon: '🎾', kind: 'sum', hidden: true },
    win_slapong: { name: 'SlaPong wins', icon: '🏓', kind: 'sum', hidden: true },
    win_slawall: { name: 'SlaWall wins', icon: '🧱', kind: 'sum', hidden: true },
    win_slabam: { name: 'SlaBam wins', icon: '🏸', kind: 'sum', hidden: true },
    cups: { name: 'Tournament Champion', icon: '🏆', kind: 'sum', tiers: [1, 5, 20] },   // 🏆 round 2: tournaments won
    jumpHits: { name: 'Jump Smasher', icon: '🦘', kind: 'sum', tiers: [5, 50, 200] },   // le-1 🦘 jump smashes that went in
    jumpPerfect: { name: 'Perfect jump smashes', icon: '🦘', kind: 'sum', hidden: true },
    diveSaves: { name: 'Diving Hero', icon: '🤸', kind: 'sum', tiers: [3, 30, 100] },   // le-1 🤸 dive saves
    cupMatches: { name: 'Tournament matches', icon: '🎟️', kind: 'sum', hidden: true },
  },
  'beat-corner': {
    notes: { name: 'Beat Hitter', icon: '🎵', kind: 'sum', tiers: [300, 2000, 10000] },
    perfects: { name: 'Perfect Timing', icon: '💛', kind: 'sum', tiers: [100, 1000, 5000] },
    bestCombo: { name: 'Combo King', icon: '🔥', kind: 'max', tiers: [25, 100, 250] },
    songs: { name: 'Song Star', icon: '🎶', kind: 'sum', tiers: [5, 20, 60] },
    rounds: { name: 'Songs played', icon: '🎵', kind: 'sum', hidden: true },
  },
  'beat-piano': {   // 🎹 plan 11-bc
    songsMade: { name: 'Songs Made', icon: '🎼', kind: 'sum', tiers: [1, 5, 15] },
    songPlays: { name: 'Family Plays', icon: '🎧', kind: 'sum', tiers: [5, 25, 100] },
    famPlays: { name: 'Family songs played', icon: '🎼', kind: 'sum', hidden: true },
    notes: { name: 'Piano Notes', icon: '🎹', kind: 'sum', tiers: [200, 1500, 8000] },
    chords: { name: 'Chord Player', icon: '🎶', kind: 'sum', tiers: [10, 100, 500] },
    bigLines: { name: 'Big-line Notes', icon: '✨', kind: 'sum', tiers: [5, 50, 250] },
    bestCombo: { name: 'Piano Combo', icon: '🔥', kind: 'max', tiers: [20, 60, 150] },
    songs: { name: 'Piano Songs', icon: '🎼', kind: 'sum', tiers: [3, 15, 40] },
    bandSongs: { name: 'Band Songs', icon: '🎸', kind: 'sum', tiers: [1, 10, 30] },
    perfects: { name: 'Piano perfects', icon: '💛', kind: 'sum', hidden: true },
    rounds: { name: 'Piano songs played', icon: '🎹', kind: 'sum', hidden: true },
  },
  'beat-drums': {   // 🥁 plan 11-bc
    famPlays: { name: 'Family songs played (drums)', icon: '🎼', kind: 'sum', hidden: true },
    notes: { name: 'Drum Hits', icon: '🥁', kind: 'sum', tiers: [300, 2000, 10000] },
    fills: { name: 'Drum Fills', icon: '🌀', kind: 'sum', tiers: [5, 50, 250] },
    bestCombo: { name: 'Drum Combo', icon: '🔥', kind: 'max', tiers: [25, 80, 200] },
    songs: { name: 'Drum Songs', icon: '🎼', kind: 'sum', tiers: [3, 15, 40] },
    bandSongs: { name: 'Band Songs', icon: '🎸', kind: 'sum', tiers: [1, 10, 30] },
    perfects: { name: 'Drum perfects', icon: '💛', kind: 'sum', hidden: true },
    rounds: { name: 'Drum songs played', icon: '🥁', kind: 'sum', hidden: true },
  },
  'sweet-swap': {
    matches: { name: 'Sweet Matcher', icon: '🍬', kind: 'sum', tiers: [100, 500, 2000] },
    specials: { name: 'Super Maker', icon: '✨', kind: 'sum', tiers: [5, 25, 100] },
    bestCombo: { name: 'Chain Champ', icon: '🔗', kind: 'max', tiers: [3, 5, 8] },
    rounds: { name: 'Rounds', icon: '🍬', kind: 'sum', hidden: true },
  },
  'word-board': {
    words: { name: 'Word Builder', icon: '🔤', kind: 'sum', tiers: [20, 100, 400] },
    bestMove: { name: 'Big Word', icon: '⚡', kind: 'max', tiers: [25, 50, 90] },
    bingos: { name: 'All 7 Letters', icon: '🌟', kind: 'sum', tiers: [1, 5, 20] },
    togetherGames: { name: 'Family Word Games', icon: '👨‍👩‍👧', kind: 'sum', tiers: [1, 10, 30] },
    quizStars: { name: 'Word Quiz Stars', icon: '🧠', kind: 'sum', tiers: [5, 30, 120] },   // 📖 end-of-game word quiz (11p)
    wins: { name: 'Robot Beaten', icon: '🤖', kind: 'sum', hidden: true },
    rounds: { name: 'Rounds', icon: '🔤', kind: 'sum', hidden: true },
  },
  'number-board': {
    equations: { name: 'Sentence Builder', icon: '➗', kind: 'sum', tiers: [20, 100, 400] },
    bestMove: { name: 'Big Move', icon: '⚡', kind: 'max', tiers: [30, 60, 100] },
    bingos: { name: 'All 8 Tiles', icon: '🌟', kind: 'sum', tiers: [1, 5, 20] },
    togetherGames: { name: 'Family Games', icon: '👨‍👩‍👧', kind: 'sum', tiers: [1, 10, 30] },
    wins: { name: 'Robot Beaten', icon: '🤖', kind: 'sum', hidden: true },
    rounds: { name: 'Rounds', icon: '➗', kind: 'sum', hidden: true },
  },
  'double-up': {
    merges: { name: 'Tile Joiner', icon: '🔀', kind: 'sum', tiers: [100, 500, 2000] },
    bestTile: { name: 'Biggest Tile', icon: '🏆', kind: 'max', tiers: [256, 1024, 4096] },
    rounds: { name: 'Rounds', icon: '🔀', kind: 'sum', hidden: true },
    chTile: { name: 'Challenge Peak', icon: '🏔️', kind: 'max', tiers: [256, 512, 1024] },   // 🏔️ 3 × 3 Challenge (not a level): best tile + best score
    chScore: { name: 'Challenge Score', icon: '🏔️', kind: 'max', hidden: true },
  },
  'math-quest': {
    correct: { name: 'Right Answers', icon: '✅', kind: 'sum', tiers: [50, 250, 1000] },
    bestStreak: { name: 'Number Streak', icon: '🔥', kind: 'max', tiers: [5, 10, 15] },
    perfect: { name: 'Perfect Round', icon: '💯', kind: 'sum', tiers: [1, 5, 20] },
    rounds: { name: 'Rounds', icon: '🧮', kind: 'sum', hidden: true },
    sprintBest: { name: 'Minute Mixer', icon: '⏱️', kind: 'max', tiers: [10, 20, 30] },
    sprintRounds: { name: 'Minute Challenges', icon: '⏱️', kind: 'sum', hidden: true },
  },
  memory: {
    pairs: { name: 'Pair Finder', icon: '🃏', kind: 'sum', tiers: [50, 250, 1000] },
    bestStreak: { name: 'Hot Streak', icon: '🔥', kind: 'max', tiers: [4, 8, 16] },
    perfect: { name: 'Perfect Board', icon: '💯', kind: 'sum', tiers: [1, 5, 20] },
    wins: { name: 'Family Champ', icon: '👑', kind: 'sum', tiers: [1, 10, 30] },
  },
};
const TIER_NAMES = ['Bronze', 'Silver', 'Gold'], TIER_ICONS = ['🥉', '🥈', '🥇'];
// Titles a player can show under their name. f = that player's feats {game: {stat: value}}, x = extra context.
const TITLE_DEFS = [
  { id: 'td_swatter', name: 'Suitor Swatter', icon: '💫', hint: 'Bonk 500 suitors away in 🐉👑 Dra-Princess Diary', rule: f => featVal_(f, 'td-draprincess', 'bonks') >= 500 },
  { id: 'td_tamer', name: 'Dragon Tamer', icon: '🐉', hint: 'Evolve your TD-Stories heroes 10 times', rule: f => featVal_(f, 'td-draprincess', 'evolves') >= 10 },
  { id: 'td_heart', name: 'Dragon Heart', icon: '❤️‍🔥', hint: 'Unlock an ULTIMATE in TD-Stories', rule: f => featVal_(f, 'td-draprincess', 'ultimates') >= 1 },
  { id: 'af_smith', name: 'Forge Master', icon: '⚒️', hint: 'Forge 20 things at the ⚒️ forge', rule: f => featVal_(f, 'artifactory', 'forge') >= 20 },
  { id: 'af_potter', name: 'Potter', icon: '🏺', hint: 'Fire 20 pots in the kiln', rule: f => featVal_(f, 'artifactory', 'pottery') >= 20 },
  { id: 'af_printer', name: '3D Printer Pro', icon: '🖨️', hint: 'Print 20 things on the 🖨️ 3D printer', rule: f => featVal_(f, 'artifactory', 'print') >= 20 },
  { id: 'af_show', name: 'Show Star', icon: '🎭', hint: 'Get 10 ⭐ for one crafted thing in the 🎭 Design Show', rule: f => featVal_(f, 'artifactory', 'showStars') >= 10 },
  { id: 'af_master', name: 'Master Maker', icon: '🏭', hint: 'Make 25 things in Artifactory', rule: f => featVal_(f, 'artifactory', 'made') >= 25 },
  { id: 'af_gem', name: 'Gem Cutter', icon: '💎', hint: 'Cut 10 gems at the 💎 stone station', rule: f => featVal_(f, 'artifactory', 'gems') >= 10 },
  { id: 'af_lathe', name: 'Lathe Legend', icon: '🌀', hint: 'Get 3 ⭐ on 10 lathe blueprints', rule: f => featVal_(f, 'artifactory', 'latheStars') >= 10 },
  { id: 'af_fixit', name: 'Fix-it Hero', icon: '🔧', hint: 'Repair 10 broken things in Artifactory', rule: f => featVal_(f, 'artifactory', 'repairs') >= 10 },
  { id: 'bp_reader', name: 'Blueprint Reader', icon: '📘', hint: 'Stamp 5 pages of the 📘 Blueprint Book (all 12 with ⭐)', rule: f => featVal_(f, 'artifactory', 'bpPages') >= 5 },
  { id: 'bp_scholar', name: 'Blueprint Scholar', icon: '🎓', hint: 'Stamp 15 pages of the 📘 Blueprint Book', rule: f => featVal_(f, 'artifactory', 'bpPages') >= 15 },
  { id: 'bp_grand', name: 'Grand Master Maker', icon: '👑', hint: 'Stamp 40 pages of the 📘 Blueprint Book', rule: f => featVal_(f, 'artifactory', 'bpPages') >= 40 },
  { id: 'bp_daily', name: 'Daily Maker', icon: '📅', hint: 'Get ⭐ on 30 Blueprints of the Day', rule: f => featVal_(f, 'artifactory', 'bpDaily') >= 30 },
  { id: 'af_remix', name: 'Remix Royalty', icon: '✨', hint: 'Remix 10 things in Artifactory', rule: f => featVal_(f, 'artifactory', 'remixes') >= 10 },
  { id: 'gr_sound', name: 'Sound Explorer', icon: '🔊', hint: 'Find 30 letter sounds in GeoRead', rule: f => featVal_(f, 'georead', 'sounds') >= 30 },
  { id: 'gr_wizard', name: 'Word Wizard', icon: '🧙', hint: 'Blend or build 100 words in GeoRead', rule: f => featVal_(f, 'georead', 'blends') + featVal_(f, 'georead', 'built') >= 100 },
  { id: 'gr_story', name: 'Story Star', icon: '📖', hint: 'Read 10 stories in GeoRead', rule: f => featVal_(f, 'georead', 'stories') >= 10 },
  { id: 'gr_journey', name: 'Word Kingdom Hero', icon: '👑', hint: 'Finish all 6 chapters of the Alphabet Road in GeoRead', rule: f => featVal_(f, 'georead', 'chapters') >= 6 },
  { id: 'gs_scout', name: 'Number Scout', icon: '🔢', hint: 'Make 100 numbers in GeoScout 🧱 Count', rule: f => featVal_(f, 'geoscout', 'counts') >= 100 },
  { id: 'gs_balance', name: 'Balance Master', icon: '⚖️', hint: 'Balance the scale 100 times in GeoScout', rule: f => featVal_(f, 'geoscout', 'balances') >= 100 },
  { id: 'gs_tower', name: 'Tower Ace', icon: '🏗️', hint: 'Build 50 exact towers in GeoScout 🏗️ Wobble tower', rule: f => featVal_(f, 'geoscout', 'wobble') >= 50 },
  { id: 'gs_story', name: 'Number Storyteller', icon: '📖', hint: 'Finish all 6 GeoScout 📖 Journey chapters', rule: f => featVal_(f, 'geoscout', 'journeys') >= 6 },
  { id: 'bc_composer', name: 'Composer', icon: '🎼', hint: 'Make 3 songs in the BeatCorner 🎼 Song Maker', rule: f => featVal_(f, 'beat-piano', 'songsMade') >= 3 },
  { id: 'bc_keys', name: 'Keyboard Kid', icon: '🎹', hint: 'Pass 5 🎹 Piano songs in BeatCorner', rule: f => featVal_(f, 'beat-piano', 'songs') >= 5 },
  { id: 'bc_drums', name: 'Drum Hero', icon: '🥁', hint: 'Pass 5 🥁 Drums songs in BeatCorner', rule: f => featVal_(f, 'beat-drums', 'songs') >= 5 },
  { id: 'bc_band', name: 'Band Leader', icon: '🎸', hint: 'Play 3 🎸 Band songs together in BeatCorner', rule: f => featVal_(f, 'beat-piano', 'bandSongs') + featVal_(f, 'beat-drums', 'bandSongs') >= 3 },
  { id: 'wd_sage', name: 'Card Sage', icon: '🦉', hint: 'Win 200 cards in 🃏 WisDeck quizzes', rule: f => featVal_(f, 'wisdeck', 'cards') >= 200 },
  { id: 'wd_count', name: 'Count Master', icon: '🔢', hint: 'Win 10 🔢 WisCount matches', rule: f => featVal_(f, 'wiscount', 'wins') >= 10 },
  { id: 'wd_twenty', name: 'Twenty Hero', icon: '🎯', hint: 'Hit exactly 20 (or 21) 10 times in 🂡 WisJack', rule: f => featVal_(f, 'wisjack', 'exact') >= 10 },
  { id: 'wd_cosmic', name: 'Cosmic Collector', icon: '🌌', hint: 'Grow a WisDeck card to 🌌 Cosmic (15 duplicates)', rule: f => featVal_(f, 'wisdeck', 'cosmic') >= 1 },
  { id: 'ebr_master', name: 'Memory Master', icon: '🧠', hint: 'Remember a 12-digit number perfectly in Eyes Brain Riot', rule: f => featVal_(f, 'eyes-brain', 'longest') >= 12 },
  { id: 'ebr_combo', name: 'Combo Riot', icon: '🔥', hint: 'Get a combo of 8 perfect rounds in Eyes Brain Riot', rule: f => featVal_(f, 'eyes-brain', 'bestCombo') >= 8 },
  { id: 'ebr_echo', name: 'Echo Ears', icon: '👂', hint: '25 perfect 👂 Listen rounds in Eyes Brain Riot', rule: f => featVal_(f, 'eyes-brain', 'listenPerfects') >= 25 },
  { id: 'ebr_back', name: 'Backwards Brain', icon: '🔁', hint: '25 perfect 🔁 Backwards rounds in Eyes Brain Riot', rule: f => featVal_(f, 'eyes-brain', 'backPerfects') >= 25 },
  { id: 'pp_box', name: 'Box Boss', icon: '⬛', hint: 'Close 300 shapes in Polyplot', rule: f => featVal_(f, 'polyplot', 'boxes') >= 300 },
  { id: 'pp_chain', name: 'Chain Champion', icon: '🔗', hint: 'Close 8 shapes in one turn in Polyplot', rule: f => featVal_(f, 'polyplot', 'bestChain') >= 8 },
  { id: 'pp_catch', name: 'Creature Catcher', icon: '🪤', hint: 'Catch 100 creatures in Polyplot 🏹 Hunt', rule: f => featVal_(f, 'polyplot', 'catches') >= 100 },
  { id: 'pp_master', name: 'Archinota Master', icon: '🌀', hint: 'Beat 💀 Hardcore in Polyplot', rule: (f, x) => (x.cleared['polyplot'] || 0) >= 6 },
  { id: 'sb_boss', name: 'Bopper Boss', icon: '💣', hint: 'Win 20 Soul Bopper games', rule: f => featVal_(f, 'soul-bopper', 'wins') >= 20 },
  { id: 'sb_chain', name: 'Chain Reactor', icon: '🔗', hint: 'Set off 50 chain pops in Soul Bopper', rule: f => featVal_(f, 'soul-bopper', 'chains') >= 50 },
  { id: 'sb_comeback', name: 'Comeback Kid', icon: '👻', hint: 'Come back 10 times in Soul Bopper (👻 soul swap or 💩 edge throw)', rule: f => featVal_(f, 'soul-bopper', 'comebacks') >= 10 },
  { id: 'sb_poo', name: 'Poo Commander', icon: '💩', hint: 'Win 5 💩 Classic Avatar games in Soul Bopper', rule: f => featVal_(f, 'soul-bopper', 'pooWins') >= 5 },
  { id: 'ax_line', name: 'Line Master', icon: '〰️', hint: 'Make 50 lines of 3 in Alignext (Drop + Omnifile)', rule: f => featVal_(f, 'alignext', 'lines') + featVal_(f, 'omnifile', 'lines') >= 50 },
  { id: 'ax_stack', name: 'Stack King', icon: '👑', hint: 'Cover 30 pieces in Alignext Omnifile Stack', rule: f => featVal_(f, 'omnifile', 'covers') >= 30 },
  { id: 'ax_cards', name: 'Card Shark', icon: '🃏', hint: 'Play 25 skill cards in Alignext', rule: f => featVal_(f, 'alignext', 'cards') + featVal_(f, 'omnifile', 'cards') >= 25 },
  { id: 'ax_gravity', name: 'Gravity Guru', icon: '🪜', hint: 'Flip the Drop stand upside down 5 times', rule: f => featVal_(f, 'alignext', 'flips') >= 5 },
  { id: 'ax_legend', name: 'Alignext Legend', icon: '💀', hint: 'Beat 💀 Hardcore in Alignext Drop or Omnifile', rule: (f, x) => (x.cleared['alignext'] || 0) >= 6 || (x.cleared['omnifile'] || 0) >= 6 },
  { id: 'sn_charmer', name: 'Snake Charmer', icon: '🐍', hint: 'Play 10 Snakize games (any mode)', rule: f => featVal_(f, 'snakeast', 'games') + featVal_(f, 'snakigate', 'games') + featVal_(f, 'snakastle', 'games') >= 10 },
  { id: 'sn_feast', name: 'Feast Master', icon: '🍎', hint: 'Eat 500 food in Snakeast', rule: f => featVal_(f, 'snakeast', 'eaten') >= 500 },
  { id: 'sn_slither', name: 'Slither King', icon: '👑', hint: 'Pop 25 snakes in Snakigate', rule: f => featVal_(f, 'snakigate', 'popped') >= 25 },
  { id: 'sn_land', name: 'Land Lord', icon: '🏰', hint: 'Own 60 % of the map in Snakastle', rule: f => featVal_(f, 'snakastle', 'land') >= 60 },
  { id: 'sn_tale', name: 'Tale Hero', icon: '📜', hint: 'Finish all 6 Snaketale chapters', rule: f => featVal_(f, 'snaketale', 'chapters') >= 6 },
  { id: 'sn_legend', name: 'Snakize Legend', icon: '💀', hint: 'Beat 💀 Hardcore in any Snakize mode', rule: (f, x) => (x.cleared['snakeast'] || 0) >= 6 || (x.cleared['snakigate'] || 0) >= 6 || (x.cleared['snakastle'] || 0) >= 6 },
  { id: 'bb_buddy', name: 'Bonk Buddy', icon: '🥊', hint: 'Win 10 Brawl Buddies fights', rule: f => featVal_(f, 'brawl-buddies', 'wins') >= 10 },
  { id: 'bb_combo', name: 'Combo Captain', icon: '🔥', hint: 'Land a 10-hit combo in Brawl Buddies', rule: f => featVal_(f, 'brawl-buddies', 'combo') >= 10 },
  { id: 'bb_sky', name: 'Sky Juggler', icon: '🌟', hint: 'Juggle your buddy 5 bounces in the air in Brawl Buddies', rule: f => featVal_(f, 'brawl-buddies', 'juggle') >= 5 },
  { id: 'bb_perfect', name: 'Untouchable', icon: '✨', hint: 'Win a Brawl Buddies round without being bonked once', rule: f => featVal_(f, 'brawl-buddies', 'perfects') >= 1 },
  { id: 'bb_legend', name: 'Brawl Legend', icon: '💀', hint: 'Beat 💀 Hardcore in Brawl Buddies', rule: (f, x) => (x.cleared['brawl-buddies'] || 0) >= 6 },
  { id: 'bb_grapple', name: 'Grapple Master', icon: '🤼', hint: 'Land 25 grapples in Brawl Buddies', rule: f => featVal_(f, 'brawl-buddies', 'grabs') >= 25 },
  { id: 'bb_tagteam', name: 'Tag Team Captain', icon: '🔁', hint: 'Tag your buddies in 25 times in Brawl Buddies', rule: f => featVal_(f, 'brawl-buddies', 'tags') >= 25 },
  { id: 'bv_t1', name: 'Playground Protector', icon: '🛝', hint: 'Finish Brawenture Tale 1 — Playground Rumble', rule: f => featVal_(f, 'brawenture', 't1') >= 1 },
  { id: 'bv_t2', name: 'Candy Guardian', icon: '🍭', hint: 'Finish Brawenture Tale 2 — Candy Factory Defense', rule: f => featVal_(f, 'brawenture', 't2') >= 1 },
  { id: 'bv_t3', name: 'Castle Climber', icon: '🏰', hint: 'Finish Brawenture Tale 3 — Castle Climb', rule: f => featVal_(f, 'brawenture', 't3') >= 1 },
  { id: 'bv_t4', name: 'Zombie Hugger', icon: '🧟', hint: 'Finish Brawenture Tale 4 — Zombie Crawl', rule: f => featVal_(f, 'brawenture', 't4') >= 1 },
  { id: 'bv_t5', name: 'Town Defender', icon: '👾', hint: 'Finish Brawenture Tale 5 — Monster Outbreak', rule: f => featVal_(f, 'brawenture', 't5') >= 1 },
  { id: 'bv_t6', name: 'Sea Rescuer', icon: '🧜', hint: 'Finish Brawenture Tale 6 — Undersea Rescue', rule: f => featVal_(f, 'brawenture', 't6') >= 1 },
  { id: 'bv_hero', name: 'Family Hero', icon: '🦸', hint: 'Finish all 6 Brawenture tales', rule: f => ['t1', 't2', 't3', 't4', 't5', 't6'].every(k => featVal_(f, 'brawenture', k) >= 1) },
  { id: 'pp_perfect', name: 'Perfect Poser', icon: '💯', hint: 'Get a 95% pose in Pose Party', rule: f => featVal_(f, 'pose-party', 'perfect') >= 1 },
  { id: 'pp_speed', name: 'Lightning Poser', icon: '⚡', hint: 'Match 15 poses in one Pose Party Speed round', rule: f => featVal_(f, 'pose-party', 'speedBest') >= 15 },
  { id: 'pp_star', name: 'Pose Superstar', icon: '🌟', hint: 'Match 150 poses in Pose Party', rule: f => featVal_(f, 'pose-party', 'poses') >= 150 },
  { id: 'sb_rally', name: 'Rally Machine', icon: '🔁', hint: 'Keep a 25-hit rally going in SlaBrall', rule: f => featVal_(f, 'sla-brall', 'rally') >= 25 },
  { id: 'sb_smash', name: 'Smash Captain', icon: '💥', hint: 'Hit 100 smashes in SlaBrall', rule: f => featVal_(f, 'sla-brall', 'smash') >= 100 },
  { id: 'sb_allcourt', name: 'All-Court Ace', icon: '🏓', hint: 'Win a match in all 5 SlaBrall sports', rule: f => ['slashot', 'slapoof', 'slaball', 'slapong', 'slawall'].every(k => featVal_(f, 'sla-brall', 'win_' + k) >= 1) },
  { id: 'sb_allcourt6', name: 'All-Court Legend', icon: '🏸', hint: 'Win a match in all 6 SlaBrall sports (with 🏸 SlaBam + the 🧱 squash room)', rule: f => ['slashot', 'slapoof', 'slaball', 'slapong', 'slabam', 'slawall'].every(k => featVal_(f, 'sla-brall', 'win_' + k) >= 1) },   // le-1 (the 5-sport All-Court Ace stays, nobody loses it)
  { id: 'sb_skysmash', name: 'Sky Smasher', icon: '🦘', hint: 'Hit 10 PERFECT jump smashes in SlaBrall', rule: f => featVal_(f, 'sla-brall', 'jumpPerfect') >= 10 },
  { id: 'sb_dive', name: 'Dive Master', icon: '🤸', hint: 'Make 10 dive saves in SlaBrall', rule: f => featVal_(f, 'sla-brall', 'diveSaves') >= 10 },
  { id: 'sb_golden', name: 'Golden Racket', icon: '⭐', hint: 'Score 5 points with a Legendary Shot', rule: f => featVal_(f, 'sla-brall', 'legend') >= 5 },
  { id: 'sb_champ', name: 'SlaBrall Champion', icon: '🏆', hint: 'Win a SlaBrall tournament', rule: f => featVal_(f, 'sla-brall', 'cups') >= 1 },
  { id: 'sb_cups', name: 'Cup Collector', icon: '🥇', hint: 'Win 5 SlaBrall tournaments', rule: f => featVal_(f, 'sla-brall', 'cups') >= 5 },
  { id: 'sci_rat', name: 'Lab Rat', icon: '🐀', hint: 'Run 10 tests in Sciencetory', rule: f => featVal_(f, 'sciencetory', 'tests') >= 10 },
  { id: 'sci_pilot', name: 'Test Pilot', icon: '🧑‍✈️', hint: 'Try all 12 ⚙️ Mechanic tests in Sciencetory', rule: f => featVal_(f, 'sciencetory', 'testKinds') >= 12 },
  { id: 'sci_guess', name: 'Hypothesis Hero', icon: '🎯', hint: 'Guess 20 test results right in Sciencetory', rule: f => featVal_(f, 'sciencetory', 'right') >= 20 },
  { id: 'sci_elem', name: 'Element Hunter', icon: '📇', hint: 'Collect 40 element cards in ⚗️ Sciencetory Chemistry', rule: f => featVal_(f, 'sciencetory', 'elements') >= 40 },   // ⚗️ sc-2a
  { id: 'sci_mol', name: 'Molecule Maker', icon: '⚛️', hint: 'Build 20 different molecules in ⚗️ Sciencetory Chemistry', rule: f => featVal_(f, 'sciencetory', 'compounds') >= 20 },
  { id: 'sci_atom', name: 'Atom Architect', icon: '⚛️', hint: 'Build 20 different atoms in ⚛️ Sciencetory Quantum', rule: f => featVal_(f, 'sciencetory', 'atoms') >= 20 },   // ⚛️ sc-2b
  { id: 'pk_eyes', name: 'Sharp Eyes', icon: '👀', hint: 'Find 50 differences in Pokadif', rule: f => featVal_(f, 'pokadif', 'found') >= 50 },
  { id: 'pk_eagle', name: 'Eagle Eye', icon: '🦅', hint: 'Finish 10 Pokadif pictures with no oops and no hint', rule: f => featVal_(f, 'pokadif', 'perfect') >= 10 },
  { id: 'pk_case', name: 'Case Closer', icon: '📁', hint: 'Solve 10 Pokadif cases', rule: f => featVal_(f, 'pokadif', 'cases') >= 10 },
  { id: 'pk_odd', name: 'Odd Spotter', icon: '🎯', hint: 'Find 30 odd ones in Pokadif', rule: f => featVal_(f, 'pokadif', 'odd') >= 30 },
  { id: 'pk_blink', name: 'Blink Master', icon: '👁️', hint: 'Find 30 changes in Pokadif Blink', rule: f => featVal_(f, 'pokadif', 'blinks') >= 30 },
  { id: 'pk_arc', name: 'Speed Sleuth', icon: '📸', hint: 'Finish 15 pictures in one Pokadif Arcade run', rule: f => featVal_(f, 'pokadif-arcade', 'pictures') >= 15 },
  { id: 'pk_cp', name: 'Checkpoint Champ', icon: '✅', hint: 'Reach 20 checkpoints in Pokadif Arcade', rule: f => featVal_(f, 'pokadif-arcade', 'checkpoints') >= 20 },
  { id: 'pk_sleuth', name: 'Master Sleuth', icon: '🕵️', hint: 'Close all 3 Pokadif case books (🧲 🦖 🐙)', rule: f => featVal_(f, 'pokadif-case', 'casebook') >= 3 },
  { id: 'pk_story', name: 'Case Cracker', icon: '📁', hint: 'Close a case in Pokadif Detective Adventure', rule: f => featVal_(f, 'pokadif-case', 'stories') >= 1 },
  { id: 'pk_lesson', name: 'Little Scientist', icon: '🎓', hint: 'Collect 3 lesson cards in Pokadif Detective Adventure', rule: f => featVal_(f, 'pokadif-case', 'lessons') >= 3 },
  { id: 'pk_quick', name: 'Lightning Lens', icon: '⚡', hint: 'Finish a Pokadif picture in 10 seconds', rule: f => { const q = featVal_(f, 'pokadif', 'quick'); return q > 0 && q <= 10; } },
  { id: 'bo_boot', name: 'Golden Boot', icon: '⚽', hint: 'Score 50 goals in BlasOff', rule: f => featVal_(f, 'blasoff', 'goals') >= 50 },   // ⚽ bo-1
  { id: 'bo_tricks', name: 'Trick Master', icon: '🌀', hint: 'Land 50 tricks in BlasOff', rule: f => featVal_(f, 'blasoff', 'tricks') >= 50 },
  { id: 'bo_volley', name: 'Volley Hero', icon: '🎯', hint: 'Hit 10 volleys in BlasOff (Space, Space, then K or J)', rule: f => featVal_(f, 'blasoff', 'volleys') >= 10 },
  { id: 'bo_voice', name: "Keeper's Voice", icon: '📣', hint: 'Shout your keeper to 10 saves in BlasOff', rule: f => featVal_(f, 'blasoff', 'shoutSaves') >= 10 },
  { id: 'bo_nutmeg', name: 'Nutmeg King', icon: '🥜', hint: 'Nutmeg 10 players in BlasOff (L when one stands right in front of you)', rule: f => featVal_(f, 'blasoff', 'nutmegs') >= 10 },   // 🏙️ bo-2b
  { id: 'pd_ace', name: 'Ace Driver', icon: '🚀', hint: 'Serve 10 aces in PyraDive', rule: f => featVal_(f, 'pyraspike', 'aces') >= 10 },
  { id: 'pd_dink', name: 'Ghost Dinker', icon: '🪶', hint: 'Set up 20 kills (assists) in PyraDive', rule: f => featVal_(f, 'pyraspike', 'assists') >= 20 },
  { id: 'pd_dunk', name: 'Spirit Dunker', icon: '💥', hint: 'Score 25 kills in PyraDive', rule: f => featVal_(f, 'pyraspike', 'kills') >= 25 },
  { id: 'pd_floor', name: 'Floor Guardian', icon: '🛡️', hint: 'Save 50 balls (digs + dives) in PyraDive', rule: f => featVal_(f, 'pyraspike', 'digs') >= 50 },
  { id: 'pd_wall', name: 'Wall Titan', icon: '🧱', hint: 'Stuff-block 10 dunks in PyraDive', rule: f => featVal_(f, 'pyraspike', 'stuffs') >= 10 },
  { id: 'pd_flame', name: 'Flame Starter', icon: '🔥', hint: 'Use 10 Pyra… moves in PyraDive', rule: f => featVal_(f, 'pyraspike', 'pyras') >= 10 },
  { id: 'pd_rally', name: 'Rally King / Queen', icon: '🔁', hint: 'Keep a 20-touch rally going in PyraDive', rule: f => featVal_(f, 'pyraspike', 'rally') >= 20 },
  { id: 'newcomer', name: 'Newcomer', icon: '🌱', hint: 'Everyone starts here', rule: () => true },
  { id: 'pb_jackpot', name: 'Jackpot Hunter', icon: '🎰', hint: 'Hit a Pinball jackpot', rule: f => featVal_(f, 'pinball', 'jackpots') >= 1 },
  { id: 'pb_royal', name: 'Jackpot Royalty', icon: '💰', hint: 'Hit 5 Pinball jackpots', rule: f => featVal_(f, 'pinball', 'jackpots') >= 5 },
  { id: 'pb_inferno', name: 'Combo Inferno', icon: '🔥', hint: 'Reach a ×10 combo (35 shots) in Pinball', rule: f => featVal_(f, 'pinball', 'maxCombo') >= 35 },
  { id: 'pb_multi', name: 'Multiball Maniac', icon: '🎱', hint: 'Start 10 multiballs', rule: f => featVal_(f, 'pinball', 'multiballs') >= 10 },
  { id: 'pb_realms', name: 'Ringmaster of Realms', icon: '🎪', hint: 'Visit all 3 Pinball bonus scenes', rule: f => featVal_(f, 'pinball', 'scene_carnival') >= 1 && featVal_(f, 'pinball', 'scene_castle') >= 1 && featVal_(f, 'pinball', 'scene_space') >= 1 },
  { id: 'pb_sharp', name: 'Sharpshooter', icon: '🎯', hint: 'Make 10 Pinball skill shots', rule: f => featVal_(f, 'pinball', 'skills') >= 10 },
  { id: 'pb_wizard', name: 'Pinball Wizard', icon: '🧙', hint: 'Score 100,000 in one Pinball game', rule: f => featVal_(f, 'pinball', 'topScore') >= 100000 },
  { id: 'hp_dodge', name: 'Dodge Master', icon: '😱', hint: 'Make 25 close calls in Dodgy Hopper', rule: f => featVal_(f, 'hopper', 'nearMiss') >= 25 },
  { id: 'hp_far', name: 'Marathon Hopper', icon: '🐸', hint: 'Hop 150 rows in one Dodgy Hopper game', rule: f => featVal_(f, 'hopper', 'bestRows') >= 150 },
  { id: 'hp_champ', name: 'Hopper Champion', icon: '👑', hint: 'Clear Dodgy Hopper Extreme', rule: (f, x) => x.cleared.hopper >= 5 },
  { id: 'tt_drift', name: 'Drift King', icon: '🌀', hint: 'Drift for 60 seconds in Turbo Trail', rule: f => featVal_(f, 'turbo', 'drift') >= 60 },
  { id: 'tt_rocket', name: 'Ramp Rocket', icon: '🦘', hint: 'Jump 30 times in Turbo Trail', rule: f => featVal_(f, 'turbo', 'jumps') >= 30 },
  { id: 'tt_champ', name: 'Turbo Champion', icon: '🏆', hint: 'Win the Extreme Turbo Trail race', rule: (f, x) => x.cleared.turbo >= 5 },
  { id: 'mm_elephant', name: 'Elephant Memory', icon: '🐘', hint: 'Finish 5 Memory Match boards with no misses', rule: f => featVal_(f, 'memory', 'perfect') >= 5 },
  { id: 'mm_streak', name: 'Streak Star', icon: '🔥', hint: 'Match 8 pairs in a row in Memory Match', rule: f => featVal_(f, 'memory', 'bestStreak') >= 8 },
  { id: 'mm_master', name: 'Memory Master', icon: '🧠', hint: 'Finish Memory Match Extreme', rule: (f, x) => x.cleared.memory >= 5 },
  { id: 'ws_master', name: 'Master Builder', icon: '🔨', hint: 'Build 10 things in the Furniture Workshop', rule: f => featVal_(f, 'workshop', 'made') >= 10 },
  { id: 'ws_fav', name: 'Crowd Favourite', icon: '🌟', hint: 'Get 8 stars on one thing in the Design Show', rule: f => featVal_(f, 'workshop', 'topStars') >= 8 },
  { id: 'ws_judge', name: 'Fair Judge', icon: '🗳️', hint: 'Vote for 15 things in the Design Show', rule: f => featVal_(f, 'workshop', 'votes') >= 15 },
  { id: 'pb_buddy', name: 'Best Buddies', icon: '🐒', hint: 'Fill your Pinball buddy meter 5 times', rule: f => featVal_(f, 'pinball', 'buddy') >= 5 },
  { id: 'ck_triple', name: 'Triple Hopper', icon: '🦘', hint: 'Make a triple jump in Checkers', rule: f => featVal_(f, 'checkers', 'triples') >= 1 || featVal_(f, 'checkers', 'megas') >= 1 },
  { id: 'ck_mega', name: 'Mega Leaper', icon: '⚡', hint: 'Make a MEGA jump (4+) in Checkers', rule: f => featVal_(f, 'checkers', 'megas') >= 1 },
  { id: 'ck_hop', name: 'Hop Legend', icon: '🐸', hint: 'Make 25 double jumps in Checkers', rule: f => featVal_(f, 'checkers', 'doubles') >= 25 },
  { id: 'ck_kingmaker', name: 'Kingmaker', icon: '👑', hint: 'Crown 20 Kings in Checkers', rule: f => featVal_(f, 'checkers', 'kings') >= 20 },
  { id: 'ck_champ', name: 'Checkers Champion', icon: '🏆', hint: 'Beat the Extreme Checkers bot', rule: (f, x) => x.cleared.checkers >= 5 },
  { id: 'cs_kid', name: 'Checkmate Kid', icon: '♚', hint: 'Checkmate a Chess bot', rule: f => featVal_(f, 'chess', 'mates') >= 1 },
  { id: 'cs_fork', name: 'Fork Master', icon: '🍴', hint: 'Make 10 forks in Chess', rule: f => featVal_(f, 'chess', 'forks') >= 10 },
  { id: 'cs_castle', name: 'Castle Keeper', icon: '🏰', hint: 'Castle 10 times in Chess', rule: f => featVal_(f, 'chess', 'castles') >= 10 },
  { id: 'cs_pawn', name: 'Pawn Whisperer', icon: '✨', hint: 'Promote 5 pawns in Chess', rule: f => featVal_(f, 'chess', 'promos') >= 5 },
  { id: 'cs_ninja', name: 'En Passant Ninja', icon: '🥷', hint: 'Take a pawn en passant', rule: f => featVal_(f, 'chess', 'enpassant') >= 1 },
  { id: 'cs_lightning', name: 'Lightning Mate', icon: '⚡', hint: 'Checkmate in under 20 moves', rule: f => featVal_(f, 'chess', 'fastMate') > 0 && featVal_(f, 'chess', 'fastMate') < 20 },
  { id: 'cs_gm', name: 'Grandmaster in Training', icon: '🧠', hint: 'Beat the Grand Bot (Chess Extreme)', rule: (f, x) => x.cleared.chess >= 5 },
  { id: 'all_round', name: 'All-Rounder', icon: '🌈', hint: 'Earn a badge in every big game', rule: (f, x) => x.allRound },
  { id: 'record', name: 'Record Breaker', icon: '🏅', hint: 'Hold a family record in any game', rule: (f, x) => x.record },
  { id: 'hc_first', name: 'Hardcore Hero', icon: '💀', hint: 'Beat a 💀 Hardcore level in any main game', rule: (f, x) => Object.keys(x.cleared).some(g => x.cleared[g] >= 6) },
  { id: 'hc_three', name: 'Unbreakable', icon: '🛡️', hint: 'Beat 💀 Hardcore in 3 different games', rule: (f, x) => Object.keys(x.cleared).filter(g => x.cleared[g] >= 6).length >= 3 },
  { id: 'hc_all', name: 'Legend of the Playground', icon: '🌋', hint: 'Beat 💀 Hardcore in 10 different main games', rule: (f, x) => Object.keys(x.cleared).filter(g => x.cleared[g] >= 6).length >= 10 },
  { id: 'mq_whiz', name: 'Number Whiz', icon: '🧮', hint: 'Get 250 Math Quest answers right', rule: f => featVal_(f, 'math-quest', 'correct') >= 250 },
  { id: 'mq_streak', name: 'Streak Master', icon: '🔥', hint: 'Answer 15 Math Quest questions in a row', rule: f => featVal_(f, 'math-quest', 'bestStreak') >= 15 },
  { id: 'mq_champ', name: 'Math Champion', icon: '🏅', hint: 'Pass Math Quest Extreme', rule: (f, x) => (x.cleared['math-quest'] || 0) >= 5 },
];
function featVal_(f, g, s) { return Number(((f || {})[g] || {})[s]) || 0; }
function featsSheet_() {
  let sh = ss_().getSheetByName(FEATS_TAB);
  if (!sh) {
    sh = ss_().insertSheet(FEATS_TAB);
    sh.getRange(1, 1, 1, FEATS_WIDTH).setValues([FEATS_HEADERS.map(h => h[0] + '\n' + h[1])]);
    styleFeatsSheet();
  }
  return sh;
}
// Look of the Feats tab (sheet standard). Safe to re-run from the editor.
function styleFeatsSheet() {
  const sh = ss_().getSheetByName(FEATS_TAB);
  if (!sh) return;
  try {
    const head = sh.getRange(1, 1, 1, FEATS_WIDTH);
    head.setValues([FEATS_HEADERS.map(h => '🔒 ' + h[0] + '\n' + h[1])])
      .setBackground('#7E57C2').setFontColor('#FFFFFF').setFontWeight('bold')
      .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
    head.setNotes([FEATS_HEADERS.map(h => h[2])]);
    sh.setRowHeight(1, 46); sh.setFrozenRows(1); sh.setFrozenColumns(2);
    sh.getRange(2, 1, sh.getMaxRows() - 1, FEATS_WIDTH).setNumberFormat('@').setFontSize(10).setVerticalAlignment('middle');
    [200, 130, 100, 120, 80, 140].forEach((w, i) => sh.setColumnWidth(i + 1, w));
    sh.getRange(2, 1, sh.getMaxRows() - 1, 1).setFontFamily('Roboto Mono').setFontColor('#757575');
    sh.getBandings().forEach(b => b.remove());
    sh.getRange(1, 1, sh.getMaxRows(), FEATS_WIDTH).applyRowBanding().setHeaderRowColor('#7E57C2').setFirstRowColor('#FFFFFF').setSecondRowColor('#F3EEFB');
    sh.getProtections(SpreadsheetApp.ProtectionType.SHEET)
      .filter(p => String(p.getDescription()).indexOf('🔒 STEAM Playground') === 0).forEach(p => p.remove());
    sh.protect().setDescription('🔒 STEAM Playground — Feats (app managed)').setWarningOnly(true);
  } catch (e) {
    Logger.log('styleFeatsSheet: ' + e.message);
  }
}
let FEATS_MEMO_ = null;
function featRows_() {
  if (FEATS_MEMO_ && FEATS_MEMO_.ss === ss_()) return FEATS_MEMO_.rows;
  const sh = ss_().getSheetByName(FEATS_TAB);
  let rows = [];
  if (sh && sh.getLastRow() > 1) {
    const C = FEATS_COL;
    rows = sh.getRange(2, 1, sh.getLastRow() - 1, FEATS_WIDTH).getValues()
      .map((r, i) => ({ row: i + 2, id: String(r[C.id]).trim(), name: String(r[C.name]), game: String(r[C.game]), stat: String(r[C.stat]), value: Number(r[C.value]) || 0 }))
      .filter(r => r.id);
  }
  FEATS_MEMO_ = { ss: ss_(), rows: rows };
  return rows;
}
function featsFor_(name) {
  const out = {};
  featRows_().forEach(r => { if (r.name !== name) return; (out[r.game] = out[r.game] || {})[r.stat] = r.value; });
  return out;
}
function tierOf_(def, value) {
  if (!def.tiers || !value) return 0;
  let t = 0;
  def.tiers.forEach((need, i) => { if (def.kind === 'min' ? value <= need : value >= need) t = i + 1; });
  return t;
}
// Badges a player has from their feats: [{game, stat, name, icon, tier, tierName, value, next}]
function featBadges_(f) {
  const out = [];
  Object.keys(FEAT_DEFS).forEach(game => Object.keys(FEAT_DEFS[game]).forEach(stat => {
    const d = FEAT_DEFS[game][stat]; if (d.hidden) return;
    const value = featVal_(f, game, stat), tier = tierOf_(d, value);
    out.push({ game: game, stat: stat, name: d.name, icon: d.icon, tier: tier, tierName: tier ? TIER_NAMES[tier - 1] : '', medal: tier ? TIER_ICONS[tier - 1] : '',
      value: value, next: tier < 3 ? d.tiers[tier] : null, kind: d.kind, unit: d.unit || '' });
  }));
  return out;
}
function titleContext_(name, players) {
  const cleared = {}, bigGames = ['maze', 'stacking-sim', 'robot-adventure', 'checkers', 'chess', 'pinball', 'hopper', 'turbo', 'memory', 'math-quest', 'number-grid', 'pop-blocks', 'block-drop', 'double-up', 'number-board', 'word-board', 'sweet-swap', 'beat-corner', 'sla-brall', 'blasoff', 'pose-party', 'brawl-buddies', 'alignext', 'omnifile', 'snakeast', 'snakigate', 'snakastle', 'soul-bopper', 'polyplot', 'eyes-brain', 'wisdeck', 'wiscount', 'wisjack', 'geoscout', 'georead', 'artifactory', 'td-draprincess', 'pyraspike', 'pokadif', 'sciencetory', 'pokadif-arcade', 'pokadif-case'];
  let allRound = true;
  bigGames.forEach(g => {
    const p = g === 'maze' ? mazeProgressFor_(name) : levelProgressFor_(name, g);
    cleared[g] = p.unlocked; if (!p.tokens.length) allRound = false;
  });
  let record = false;
  RECORD_GAMES.forEach(g => gameRecords_(g, players).forEach(o => { if ((o.fast && o.fast.name === name) || (o.top && o.top.name === name)) record = true; }));
  return { cleared: cleared, allRound: allRound, record: record };
}
function titlesFor_(name, players, f) {
  f = f || featsFor_(name);
  const x = titleContext_(name, players);
  return TITLE_DEFS.filter(t => { try { return t.rule(f, x); } catch (e) { return false; } }).map(t => t.id);
}
function titleMeta_() { return TITLE_DEFS.map(t => ({ id: t.id, name: t.name, icon: t.icon, hint: t.hint })); }
// Adds one game's counts. Called inside the save lock. Returns new badges / titles to celebrate.
function recordFeats_(name, gameId, stats) {
  if (gameId === 'soul-bopper' && stats) bopperDaily_(name, stats);   // 🎁 Soul Bopper daily treasures
  if (gameId === 'polyplot' && stats) polyplotSave_(name, stats);
  if (gameId === 'eyes-brain' && stats) ebrDaily_(name, stats);   // 👀🧠 🎁 daily treasure counters   // ⬛ 📖 field journal + 🎁 daily counters
  if (gameId === 'georead' && stats) grDaily_(name, stats);   // 🔤 🎁 daily treasure counters
  if (gameId === 'geoscout' && stats) gsDaily_(name, stats);   // 🔢 🎁 daily treasure counters
  const defs = FEAT_DEFS[gameId];
  if (!defs || !stats) return { newBadges: [], newTitles: [] };
  const players = activePlayers_(listProfilesFull());
  const before = featsFor_(name), beforeTitles = titlesFor_(name, players, before);
  const sh = featsSheet_(), rows = featRows_(), stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  const after = JSON.parse(JSON.stringify(before)); after[gameId] = after[gameId] || {};
  const newBadges = [];
  Object.keys(stats).forEach(stat => {
    const d = defs[stat], n = Number(stats[stat]);
    if (!d || !(n > 0)) return;
    const old = featVal_(before, gameId, stat);
    const val = d.kind === 'max' ? Math.max(old, n) : d.kind === 'min' ? (old ? Math.min(old, n) : n) : old + n;
    if (val === old) return;
    after[gameId][stat] = val;
    const id = name + '|' + gameId + '|' + stat, row = rows.find(r => r.id === id);
    const values = [[id, name, gameId, stat, String(val), stamp]];
    if (row) sh.getRange(row.row, 1, 1, FEATS_WIDTH).setValues(values);
    else { const at = Math.max(1, rows.reduce((m, r) => Math.max(m, r.row), 1)) + 1; sh.getRange(at, 1, 1, FEATS_WIDTH).setNumberFormat('@').setValues(values); rows.push({ row: at, id: id, name: name, game: gameId, stat: stat, value: val }); }
    const t0 = tierOf_(d, old), t1 = tierOf_(d, val);
    if (t1 > t0 && !d.hidden) newBadges.push({ name: d.name, icon: d.icon, tier: t1, tierName: TIER_NAMES[t1 - 1], medal: TIER_ICONS[t1 - 1] });
  });
  FEATS_MEMO_ = null; SCORES_MEMO_ = null;
  const afterTitles = titlesFor_(name, players, featsFor_(name));
  const newTitles = TITLE_DEFS.filter(t => afterTitles.indexOf(t.id) !== -1 && beforeTitles.indexOf(t.id) === -1).map(t => ({ id: t.id, name: t.name, icon: t.icon }));
  return { newBadges: newBadges, newTitles: newTitles };
}
function safeRecordFeats_(name, gameId, stats) {
  if (stats && stats.games && typeof artMarkResult_ === 'function') { artMarkResult_(name, gameId); }   // 🏭 af-4: this result may drop a material
  try { return recordFeats_(name, gameId, stats); }
  catch (e) { console.error('Feats failed: ' + e.message); return { newBadges: [], newTitles: [], featError: String(e.message || e) }; }
}
// Counts from a game that didn't finish a level (a loss, a draw, giving up).
// 🃏 WisDeck deck per player: Settings Deck_<Name> = {cards: {id: {n: copies, lv: best quiz level}}, rack: [ids], side: [...], full: [cats], tot: {cat: cards}}
const WD_ID_ = /^wis[a-z]{2,12}:[a-z0-9-]{1,60}$/;
function wisDeck_(st, name) { const d = jsonSetting_(st, 'Deck_' + name, null); return d && typeof d === 'object' && d.cards ? d : { cards: {}, rack: [], side: [] }; }
// 🃏 "WisDeck Cards" tab: grown-ups fix or add cards (Thai text, values, powers). The tab wins over the built-in list; made on first use.
const WISCARD_TAB_ = 'WisDeck Cards';
const WISCARD_HEAD_ = ['Category (e.g. wisflag)', 'English name', 'Thai name', 'Picture (emoji / country code / formula)', 'Fact value (number)', 'Power 1-9 (empty = from the value)', 'Fun fact (English)', 'Fun fact (Thai)', 'Extra (country EN|TH …)', 'Hide (x)'];
function wisCardRows_() {
  const ss = ss_(); let sh = ss.getSheetByName(WISCARD_TAB_);
  if (!sh) { try { sh = ss.insertSheet(WISCARD_TAB_); sh.getRange(1, 1, 1, WISCARD_HEAD_.length).setValues([WISCARD_HEAD_]); sh.setFrozenRows(1); } catch (e) { return []; } return []; }
  const rows = sh.getDataRange().getValues().slice(1), out = [];
  rows.forEach(r => { const cat = String(r[0] || '').toLowerCase().replace(/[^a-z]/g, ''); const en = String(r[1] || '').trim(); if (!/^wis[a-z]{2,12}$/.test(cat) || !en) return;
    const o = { cat: cat, en: en.slice(0, 60) }; const put = (k, v, max) => { v = String(v == null ? '' : v).trim(); if (v) o[k] = v.slice(0, max); };
    put('th', r[2], 80); put('pic', r[3], 24); put('value', r[4], 30); put('power', r[5], 2); put('fact', r[6], 240); put('factTh', r[7], 300); put('extra', r[8], 80); if (/^(x|yes|y|1|true)$/i.test(String(r[9] || '').trim())) o.off = 1;
    out.push(o); });
  return out.slice(0, 2000);
}
// 📅 Daily deck: 5 questions a day, the same for the whole family (made on the page from the date); ONE try per player per day → Settings WisDaily
function wisDaily_() {
  const d = jsonSetting_(getSettings(), 'WisDaily', {}) || {}, today = today_(), sc = d.date === today && d.scores ? d.scores : {};
  return { date: today, board: Object.keys(sc).map(k => ({ name: k, score: Number(sc[k].score) || 0, right: Number(sc[k].right) || 0 })).sort((a, b) => b.score - a.score || b.right - a.right) };
}
function safeWisDaily_() { try { return wisDaily_(); } catch (e) { return null; } }
// 📖 WisStock on the Collection page: the card files are sent only when someone opens it (keeps Collection fast)
function getWisCardsData() {   // 📦 size-1: each part = its code (offline app) or {src, alt} (online) — the page runs both with UI.loadData
  return { a: remoteBody_('WisCards'), b: remoteBody_('WisCards2'), c: remoteBody_('WisCards3'), rows: wisCardRows_() };
}
// 🎨 WisDeck drawn pictures, one part at a time ('' when there is no part i) — the page shows emoji until they arrive (wd-13)
function getWisArt(i) {
  const n = 'WisArt' + Math.max(1, Math.floor(Number(i) || 1));
  return remoteBody_(n);   // 📦 size-1: code (offline app) or {src, alt} (online); '' when there is no part i
}
function saveWisDaily(name, rec) {
  if (!name || !activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Pick a player first.');
  const r = rec || {}, today = today_(); if (r.date && r.date !== today) return { already: false, late: true, daily: wisDaily_() };
  const lock = LockService.getScriptLock(); lock.waitLock(10000); let first = false;
  try {
    let d = jsonSetting_(getSettings(), 'WisDaily', {}) || {}; if (d.date !== today || !d.scores) d = { date: today, scores: {} };
    if (!d.scores[name]) { d.scores[name] = { score: Math.max(0, Math.min(5000, Math.round(Number(r.score) || 0))), right: Math.max(0, Math.min(5, Math.floor(Number(r.right) || 0))) }; saveSetting('WisDaily', JSON.stringify(d)); first = true;
      try { const dd = dailyRoom_(getSettings(), name, today); dd.wdDaily = 1; saveSetting('Daily_' + name, JSON.stringify(dd)); } catch (e) {} }
  } finally { lock.releaseLock(); }
  const out = { already: !first, daily: wisDaily_() };
  if (first) { out.feats = safeRecordFeats_(name, 'wisdeck', { daily: 1, right: Math.max(0, Math.min(5, Math.floor(Number(r.right) || 0))) }); if (Array.isArray(r.won) && r.won.length) out.deck = saveWisDeck(name, { won: r.won, lv: 1 }).deck; }
  return out;
}
function saveWisDeck(name, d) {
  if (!name || !activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Pick a player first.');
  d = d || {}; const lv = Math.max(0, Math.min(5, Math.floor(Number(d.lv)) || 0)), won = (Array.isArray(d.won) ? d.won : []).slice(0, 60).map(String).filter(id => WD_ID_.test(id));
  const lock = LockService.getScriptLock(); lock.waitLock(10000); let deck;
  try {
    deck = wisDeck_(getSettings(), name);
    won.forEach(id => { const c = deck.cards[id] || (deck.cards[id] = { n: 0, lv: 0 }); c.n = Math.min(999, (Number(c.n) || 0) + 1); c.lv = Math.max(Number(c.lv) || 0, lv); });
    if (Array.isArray(d.full)) deck.full = d.full.map(String).filter(k => /^wis[a-z]{2,12}$/.test(k)).slice(0, 60);
    if (d.tot && typeof d.tot === 'object') { deck.tot = deck.tot || {}; Object.keys(d.tot).forEach(k => { if (/^wis[a-z]{2,12}$/.test(k)) deck.tot[k] = Math.max(0, Math.min(500, Math.floor(Number(d.tot[k])) || 0)); }); }
    if (Array.isArray(d.rack)) deck.rack = d.rack.map(String).filter(id => WD_ID_.test(id) && deck.cards[id]).slice(0, 10);
    if (Array.isArray(d.side)) deck.side = d.side.filter(x => x && WD_ID_.test(String(x.id)) && deck.cards[x.id]).slice(0, 3).map(x => ({ id: String(x.id), sign: x.sign < 0 ? -1 : 1 }));
    saveSetting('Deck_' + name, JSON.stringify(deck));
  } finally { lock.releaseLock(); }
  if (won.length) { try { const d2 = dailyRoom_(getSettings(), name, today_()); d2.wdCards = (d2.wdCards || 0) + won.length; saveSetting('Daily_' + name, JSON.stringify(d2)); } catch (e) { console.error('wisdeck daily: ' + e.message); } }   // 🎁 daily treasure counter
  const cosmic = Object.keys(deck.cards).filter(id => (Number(deck.cards[id].n) || 0) - 1 >= 15).length;
  const st = {}; if (won.length) st.cards = won.length; st.fullCats = (deck.full || []).length; if (cosmic) st.cosmic = cosmic;
  return { deck: deck, feats: safeRecordFeats_(name, 'wisdeck', st) };
}
function saveFeats(name, gameId, stats) {
  if (!name || !FEAT_DEFS[gameId]) throw new Error('Bad feats.');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { snakeDaily_(name, gameId, stats); return safeRecordFeats_(name, gameId, stats); } finally { lock.releaseLock(); }
}
// 🐍 Snakize skins (plan 11y round 4): per-world evolution from hidden per-world feats, summed over the 3 boards.
// ⬛ Polyplot 📖 field journal: jc_<theme> = field types caught there (calm, energetic, lazy, enraged + any hidden one = 5 → that theme's 🐾 pet)
const PP_THEMES_ = ['dino', 'sea', 'dance', 'robot', 'space', 'sky', 'hunter'];
PP_THEMES_.forEach(t => { FEAT_DEFS['polyplot']['jc_' + t] = { name: 'Journal ' + t, icon: '📖', kind: 'max', hidden: true }; FEAT_DEFS['polyplot']['jt_' + t] = { name: 'Caught in ' + t, icon: '📖', kind: 'max', hidden: true }; });
const SNAKE_WORLDS_ = ['dino', 'sea', 'dance', 'robot', 'space', 'sky'];
const SNAKE_GAMES_ = ['snakeast', 'snakigate', 'snakastle'];
SNAKE_GAMES_.forEach(g => SNAKE_WORLDS_.forEach(w => {
  FEAT_DEFS[g]['g_' + w] = { name: 'Games in ' + w, icon: '🎮', kind: 'sum', hidden: true };
  FEAT_DEFS[g]['f_' + w] = { name: 'Food in ' + w, icon: '🍎', kind: 'sum', hidden: true };
  FEAT_DEFS[g]['l_' + w] = { name: 'Longest in ' + w, icon: '🐍', kind: 'max', hidden: true };
  FEAT_DEFS[g]['w_' + w] = { name: 'Best win in ' + w, icon: '🏆', kind: 'max', hidden: true };
}));
function snakeFeat_(f, stat, kind) { const v = SNAKE_GAMES_.map(g => featVal_(f, g, stat)); return kind === 'max' ? Math.max.apply(null, v) : v.reduce((a, b) => a + b, 0); }
// steps per world: 0 Plain (free) · 1 Pattern (5 games) · 2 Light stripes (300 food) · 3 Armor (win Hard) · 4 Fuel (length 60) · 5 Glow (win Extreme) · 6 Shadow (win Hardcore)
const SNAKE_STEP_RULES_ = [() => true, (f, w) => snakeFeat_(f, 'g_' + w) >= 5, (f, w) => snakeFeat_(f, 'f_' + w) >= 300, (f, w) => snakeFeat_(f, 'w_' + w, 'max') >= 4, (f, w) => snakeFeat_(f, 'l_' + w, 'max') >= 60, (f, w) => snakeFeat_(f, 'w_' + w, 'max') >= 5, (f, w) => snakeFeat_(f, 'w_' + w, 'max') >= 6];
const SNAKE_STEP_HOW_ = ['Free', 'Play 5 games in this world', 'Eat 300 food in this world', 'Win a Hard level in this world', 'Grow to 60 long in this world', 'Win an Extreme level in this world', 'Win 💀 Hardcore in this world'];
const SNAKE_TYPE_RULES_ = [
  ['garden', 'Free', () => true],
  ['python', 'Play 10 Snakize games', f => snakeFeat_(f, 'games') >= 10],
  ['rattle', 'Use 20 skills', f => snakeFeat_(f, 'skills') >= 20],
  ['cobra', 'Eat 20 golden food in Snakeast', f => featVal_(f, 'snakeast', 'golds') >= 20],
  ['anaconda', 'Grow to 40 long', f => snakeFeat_(f, 'longest', 'max') >= 40],
  ['viper', 'Pop 5 snakes in Snakigate', f => featVal_(f, 'snakigate', 'popped') >= 5],
  ['seasnake', 'Own 40 % land in Snakastle', f => featVal_(f, 'snakastle', 'land') >= 40],
  ['coral', 'Win 3 family duels', f => snakeFeat_(f, 'duelWins') >= 3],
  ['boa', 'Win a Hard level in any Snakize mode', f => SNAKE_WORLDS_.some(w => snakeFeat_(f, 'w_' + w, 'max') >= 4)],
  ['titanoboa', 'Finish Snaketale chapter 1 (🦖)', f => featVal_(f, 'snaketale', 'chapters') >= 1],
  ['seaserpent', 'Finish Snaketale chapter 2 (🐙)', f => featVal_(f, 'snaketale', 'chapters') >= 2],
  ['conga', 'Finish Snaketale chapter 3 (🪩)', f => featVal_(f, 'snaketale', 'chapters') >= 3],
  ['mecha', 'Finish Snaketale chapter 4 (🤖)', f => featVal_(f, 'snaketale', 'chapters') >= 4],
  ['comet', 'Finish Snaketale chapter 5 (🪐)', f => featVal_(f, 'snaketale', 'chapters') >= 5],
  ['feather', 'Finish Snaketale chapter 6 (☁️)', f => featVal_(f, 'snaketale', 'chapters') >= 6]
];
function snakeSkinsFor_(f) {
  const worlds = {}; let best = 0;
  SNAKE_WORLDS_.forEach(w => { const steps = SNAKE_STEP_RULES_.map((r, i) => !!r(f, w)); worlds[w] = steps.map((ok, i) => ok ? i : -1).filter(i => i >= 0); best = Math.max(best, worlds[w].length); });
  return { worlds: worlds, types: SNAKE_TYPE_RULES_.filter(t => t[2](f)).map(t => t[0]), best: best };
}
// 🐍 daily counters (Daily_<Name>): food, pops, best land % today
function snakeDaily_(name, gameId, stats) {
  if (SNAKE_GAMES_.indexOf(gameId) < 0 || !stats) return;
  try { const d = dailyRoom_(getSettings(), name, today_()); d.snakeFood = (d.snakeFood || 0) + (Number(stats.eaten) || 0); d.snakePop = (d.snakePop || 0) + (Number(stats.popped) || 0); d.snakeLand = Math.max(d.snakeLand || 0, Number(stats.land) || 0); saveSetting('Daily_' + name, JSON.stringify(d)); } catch (e) {}
}
// The Title a player shows under their name ('' = none).
function savePlayerTitle(name, titleId, pin) {
  if (!name) throw new Error('Pick a player first.');
  checkPlayerPin_(name, pin);   // only the player (their PIN) can change their title
  const players = activePlayers_(listProfilesFull());
  if (titleId && titlesFor_(name, players).indexOf(titleId) === -1) throw new Error('That title is still locked.');
  saveSettings({ ['Title_' + name]: titleId || '' });
  return { title: titleId || '' };
}
// For the Dashboard / Achievements: every active player's chosen + unlocked titles and badges.
function titlesData_(players) {
  const settings = getSettings(), out = {};
  players.forEach(p => {
    const f = featsFor_(p.Name), unlocked = titlesFor_(p.Name, players, f);
    let chosen = settings['Title_' + p.Name] || '';
    if (chosen && unlocked.indexOf(chosen) === -1) chosen = '';
    out[p.Name] = { chosen: chosen, unlocked: unlocked, badges: featBadges_(f).filter(b => b.tier > 0) };
  });
  return { players: out, meta: titleMeta_() };
}

/* ============ FAMILY ROOM (avatars) ============ */
// Each player's avatar is saved in Settings as Avatar_<Name> (small JSON of option numbers + equipped items);
// the room they last picked as Room_<Name>. Base options are free; the extra skins / hair styles /
// colour schemes past the base range, and every equipped item, must be unlocked (checked here, on save).
// hairColor 18 (10 more 2026-11-02), hl = highlights (6), hlColor 18, outfit 10 free (+10 'fashion' sets), oc2 = second clothes colour (0 = auto + 24).
const AVATAR_OPTS = { skin: 6, hair: 7, hairColor: 18, hl: 6, hlColor: 18, outfit: 10, outfitColor: 10, oc2: 25, acc: 7 };
const AVATAR_EXTRA = { skin: 'skins', hair: 'hairstyles', outfit: 'fashion', outfitColor: 'colours' };
const HEX_ = /^#[0-9a-f]{6}$/i;   // indexes past the base range come from these lines
const ROOM_KEYS = ['jungle', 'house', 'space', 'fantasy', 'concert'];
const EQUIP_SLOTS = ['costume', 'hand', 'back', 'pet', 'ride', 'trail', 'neck', 'joy'];   // 🕹️ sk-1: 'joy' = the joystick skin you wear in every game

/* ---------- ITEM LINES ----------
   A line is a set of looks (steps) for one slot. Every "way" the player completes adds one step
   (up to the number of steps), so getting the same item again evolves it.
   Adding an item later = adding a line (or a step + a way) here. */
const W_ = {
  lvl: (g, n, label) => ({ how: 'Pass ' + label + ' ' + MAZE_LEVEL_NAMES[n - 1], r: x => (x.cleared[g] || 0) >= n }),
  mini: (g, n, label) => ({ how: 'Reach ' + label + ' stage ' + (n + 1), r: x => (x.mini[g] || 0) >= n }),
  score: (g, n, label) => ({ how: 'Score ' + Number(n).toLocaleString() + ' in ' + label, r: x => (x.best[g] ? x.best[g].score : 0) >= n }),
  time: (g, s, label) => ({ how: 'Finish ' + label + ' in under ' + Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2), r: x => x.best[g] && x.best[g].time > 0 && x.best[g].time <= s }),
  feat: (g, s, n, how) => ({ how: how, r: x => featVal_(x.f, g, s) >= n }),
  total: n => ({ how: 'Pass ' + n + ' levels in any games', r: x => x.levels >= n }),
  miles: n => ({ how: 'Reach ' + n + ' 🐾 Adventure miles', r: x => (x.miles || 0) >= n }),
  hardcore: n => ({ how: 'Beat ' + n + ' 💀 Hardcore level' + (n > 1 ? 's' : '') + ' (any games)', r: x => (x.hardcores || 0) >= n }),
  extreme: n => ({ how: 'Pass ' + n + ' Extreme level' + (n > 1 ? 's' : '') + ' (any games)', r: x => x.extremes >= n }),
  badges: n => ({ how: 'Earn ' + n + ' badges', r: x => x.badges >= n }),
  titles: n => ({ how: 'Earn ' + n + ' Title' + (n > 1 ? 's' : ''), r: x => x.titles >= n }),
  days: n => ({ how: 'Play on ' + n + ' different days', r: x => x.days >= n }),
};
const ITEM_LINES = [
  // 🔢 GeoScout + ➗ Algebros number looks (looks only; NumberSkins.html draws them; picked per player sp_numberskin:<Name>; Journey chapters unlock them too)
  { id: 'numberskin', name: 'Number looks', icon: '🎨', slot: 'numberskin', game: 'geoscout', soon: 'Used on 🔢 GeoScout number blocks AND ➗ Algebros tiles — pick it on their menus', steps: ['Candy Pops', 'Mini Monsters', 'Pixel Pals', 'Gem Stones', 'Lava Rocks', 'Royal Gold'],
    ways: [W_.feat('geoscout', 'snaps', 20, 'Snap 20 blocks together in GeoScout'), W_.feat('number-board', 'equations', 20, 'Make 20 number sentences in Algebros'), W_.feat('geoscout', 'balances', 20, 'Balance the scale 20 times in GeoScout'),
      W_.feat('geoscout', 'counts', 50, 'Make 50 numbers in GeoScout'), W_.feat('number-board', 'equations', 100, 'Make 100 number sentences in Algebros'), W_.feat('geoscout', 'battleWins', 5, 'Win 5 GeoScout Tower battles')] },
  // 🔤 GeoRead + Lettercraft letter looks (looks only; LetterSkins.html draws them; picked per player sp_letterskin:<Name>)
  { id: 'letterskin', name: 'Letter looks', icon: '🎨', slot: 'letterskin', game: 'georead', soon: 'Used on 🔤 GeoRead letter boxes AND 🔤 Lettercraft tiles — pick it on their menus', steps: ['Candy', 'Wood blocks', 'Jelly', 'Galaxy', 'Gold', 'Rainbow'],
    ways: [W_.feat('georead', 'blends', 20, 'Blend 20 words in GeoRead'), W_.feat('word-board', 'words', 20, 'Make 20 words in Lettercraft'), W_.feat('georead', 'built', 20, 'Build 20 words in GeoRead'),
      W_.feat('georead', 'stories', 5, 'Read 5 GeoRead stories'), W_.feat('word-board', 'words', 100, 'Make 100 words in Lettercraft'), W_.feat('georead', 'sounds', 40, 'Find 40 letter sounds in GeoRead')] },
  // 🂠 WisDeck card backs (looks only; the best one you own is the back of your face-down cards; painted by drawWisBack in WisDeck + Collection)
  { id: 'wdback', name: 'Card backs', icon: '🂠', slot: 'wdback', game: 'wisdeck', soon: 'Used in 🃏 WisDeck — the back of your face-down cards', steps: ['Night owl', 'Jungle', 'Deep sea', 'Lava', 'Candy', 'Galaxy', 'Golden', 'Rainbow'],
    ways: [W_.feat('wisdeck', 'cards', 10, 'Win 10 WisDeck cards'), W_.feat('wisdeck', 'right', 50, '50 right quiz answers'), W_.feat('wisdeck', 'daily', 3, 'Play 3 📅 daily decks'), W_.feat('wiscount', 'wins', 3, 'Win 3 🔢 WisCount matches'),
      W_.feat('wisjack', 'wins', 3, 'Win 3 🂡 WisJack matches'), W_.feat('wisdeck', 'buzzWins', 2, 'Win 2 🔔 WisBuzz games'), W_.feat('wisdeck', 'fullCats', 1, 'Fill a whole category 🎓'), W_.feat('wisdeck', 'cards', 300, 'Win 300 WisDeck cards')] },
  // 🎓 WisDeck professor costume: one step per full category in the 📖 deck book (drawn in AvatarKit costumeLook 'professor'; the quiz podium borrows step 2)
  { id: 'professor', name: 'Professor', icon: '🎓', slot: 'costume', game: 'wisdeck', steps: ['Mortarboard', 'Professor gown', 'Book of facts', 'Golden owl pin', 'Grand professor'],
    ways: [[1, 'Fill 1 WisDeck category (all its cards)'], [2, 'Fill 2 WisDeck categories'], [3, 'Fill 3 WisDeck categories'], [5, 'Fill 5 WisDeck categories'], [8, 'Fill 8 WisDeck categories']].map(w => W_.feat('wisdeck', 'fullCats', w[0], w[1])) },
  // 👀🧠 Eyes Brain Riot keypad skins (looks only; picked per device sp_eyesbrain_pad:<Name>; the page + Collection draw them from EBR_PADS)
  { id: 'ebrpad', name: 'Brain keypads', icon: '🔢', slot: 'ebrpad', game: 'eyes-brain', soon: 'Used in 👀🧠 Eyes Brain Riot — pick your keypad on the level screen', steps: ['Candy', 'Wood blocks', 'Lava stone', 'Ice', 'Neon', 'Jelly', 'Galaxy', 'Gold', 'Rainbow', 'Crystal'],
    ways: [W_.feat('eyes-brain', 'games', 3, 'Play 3 Eyes Brain Riot games'), W_.feat('eyes-brain', 'digits', 100, 'Remember 100 digits'), W_.feat('eyes-brain', 'perfects', 10, '10 perfect rounds'), W_.feat('eyes-brain', 'bestCombo', 4, 'A 🔥 combo of 4'),
      W_.feat('eyes-brain', 'riots', 2, '2 🧠 brain riots'), W_.feat('eyes-brain', 'challenge', 8, '🏔️ Challenge: remember 8 digits'), W_.feat('eyes-brain', 'daily', 3, 'Play 3 🎯 daily family numbers'), W_.feat('eyes-brain', 'digits', 1000, 'Remember 1,000 digits'),
      W_.lvl('eyes-brain', 4, 'Eyes Brain Riot'), W_.feat('eyes-brain', 'longest', 12, '🏅 Brain level 12 (a 12-digit number, perfect)')] },
  // ⬛ Polyplot line trails (looks only, picked per device sp_polyplot_trail:<Name>, painted by AvatarKit drawPolyTrail) + 🐾 one journal pet per theme (catch its 5 field types)
  { id: 'polytrail', name: 'Line trails', icon: '🖍️', slot: 'polytrail', game: 'polyplot', soon: 'Used in ⬛ Polyplot — pick your trail in the setup', steps: ['Rainbow chalk', 'Glow paint', 'Lava line', 'Ocean wave', 'Vine rope', 'Star dust', 'Zebra stripes', 'Neon pulse', 'Gold leaf', 'Prism'],
    ways: [W_.feat('polyplot', 'games', 3, 'Play 3 Polyplot games'), W_.feat('polyplot', 'boxes', 50, 'Close 50 shapes in Polyplot'), W_.feat('polyplot', 'wins', 3, 'Win 3 Polyplot games'), W_.feat('polyplot', 'chains3', 5, 'Close 3+ shapes in one turn 5 times'), W_.feat('polyplot', 'catches', 20, 'Catch 20 creatures in 🏹 Hunt'),
      W_.feat('polyplot', 'coins', 100, 'Collect 100 coins in Polyplot'), W_.feat('polyplot', 'built', 10, 'Build 10 things in 🏰 Fortiplot'), W_.feat('polyplot', 'bestWave', 10, 'Hold 10 waves in 🛡️ co-op'), W_.feat('polyplot', 'hidden', 3, 'Find 3 hidden creatures'), W_.lvl('polyplot', 5, 'Polyplot')] },
  { id: 'pppet_dino', name: 'Dino journal pet', icon: '🦕', slot: 'pet', game: 'polyplot', computed: true, steps: ['Leafy Longneck egg', 'Leafy Longneck', 'Leafy Longneck champion'], ways: [W_.feat('polyplot', 'jc_dino', 3, 'Polyplot 📖 🦖 Dino journal: catch 3 field creature types (egg)'), W_.feat('polyplot', 'jc_dino', 5, 'Polyplot 📖 🦖 Dino journal: the 4 field creatures + a hidden one'), W_.feat('polyplot', 'jt_dino', 25, 'Catch 25 creatures in 🦖 Dino (Polyplot)')] },
  { id: 'pppet_sea', name: 'Aquarium journal pet', icon: '🐢', slot: 'pet', game: 'polyplot', computed: true, steps: ['Shelly Turtle egg', 'Shelly Turtle', 'Shelly Turtle champion'], ways: [W_.feat('polyplot', 'jc_sea', 3, 'Polyplot 📖 🐙 Aquarium journal: catch 3 field creature types (egg)'), W_.feat('polyplot', 'jc_sea', 5, 'Polyplot 📖 🐙 Aquarium journal: the 4 field creatures + a hidden one'), W_.feat('polyplot', 'jt_sea', 25, 'Catch 25 creatures in 🐙 Aquarium (Polyplot)')] },
  { id: 'pppet_dance', name: 'Dance Hall journal pet', icon: '🦩', slot: 'pet', game: 'polyplot', computed: true, steps: ['Disco Flamingo egg', 'Disco Flamingo', 'Disco Flamingo champion'], ways: [W_.feat('polyplot', 'jc_dance', 3, 'Polyplot 📖 🪩 Dance Hall journal: catch 3 field creature types (egg)'), W_.feat('polyplot', 'jc_dance', 5, 'Polyplot 📖 🪩 Dance Hall journal: the 4 field creatures + a hidden one'), W_.feat('polyplot', 'jt_dance', 25, 'Catch 25 creatures in 🪩 Dance Hall (Polyplot)')] },
  { id: 'pppet_robot', name: 'Robot Time journal pet', icon: '🐌', slot: 'pet', game: 'polyplot', computed: true, steps: ['Gear Snail egg', 'Gear Snail', 'Gear Snail champion'], ways: [W_.feat('polyplot', 'jc_robot', 3, 'Polyplot 📖 🤖 Robot Time journal: catch 3 field creature types (egg)'), W_.feat('polyplot', 'jc_robot', 5, 'Polyplot 📖 🤖 Robot Time journal: the 4 field creatures + a hidden one'), W_.feat('polyplot', 'jt_robot', 25, 'Catch 25 creatures in 🤖 Robot Time (Polyplot)')] },
  { id: 'pppet_space', name: 'Space journal pet', icon: '🦄', slot: 'pet', game: 'polyplot', computed: true, steps: ['Star Pony egg', 'Star Pony', 'Star Pony champion'], ways: [W_.feat('polyplot', 'jc_space', 3, 'Polyplot 📖 🪐 Space journal: catch 3 field creature types (egg)'), W_.feat('polyplot', 'jc_space', 5, 'Polyplot 📖 🪐 Space journal: the 4 field creatures + a hidden one'), W_.feat('polyplot', 'jt_space', 25, 'Catch 25 creatures in 🪐 Space (Polyplot)')] },
  { id: 'pppet_sky', name: 'Sky Temple journal pet', icon: '🕊️', slot: 'pet', game: 'polyplot', computed: true, steps: ['Cloud Dove egg', 'Cloud Dove', 'Cloud Dove champion'], ways: [W_.feat('polyplot', 'jc_sky', 3, 'Polyplot 📖 ☁️ Sky Temple journal: catch 3 field creature types (egg)'), W_.feat('polyplot', 'jc_sky', 5, 'Polyplot 📖 ☁️ Sky Temple journal: the 4 field creatures + a hidden one'), W_.feat('polyplot', 'jt_sky', 25, 'Catch 25 creatures in ☁️ Sky Temple (Polyplot)')] },
  { id: 'pppet_hunter', name: 'Monster Hunter journal pet', icon: '🦌', slot: 'pet', game: 'polyplot', computed: true, steps: ['Forest Deer egg', 'Forest Deer', 'Forest Deer champion'], ways: [W_.feat('polyplot', 'jc_hunter', 3, 'Polyplot 📖 🏹 Monster Hunter journal: catch 3 field creature types (egg)'), W_.feat('polyplot', 'jc_hunter', 5, 'Polyplot 📖 🏹 Monster Hunter journal: the 4 field creatures + a hidden one'), W_.feat('polyplot', 'jt_hunter', 25, 'Catch 25 creatures in 🏹 Monster Hunter (Polyplot)')] },
  { id: 'explorer', name: 'Explorer', icon: '🧭', slot: 'costume', game: 'maze', steps: ['Safari hat', 'Explorer backpack', 'Binoculars', 'Torch', 'Jungle explorer outfit'], ways: [1, 2, 3, 4, 5].map(n => W_.lvl('maze', n, 'Maze')) },
  { id: 'builder', name: 'Builder', icon: '⛑️', slot: 'costume', game: 'stacking-sim', steps: ['Hard hat', 'Tool belt', 'Hammer', 'Hi-vis vest', 'Master builder'], ways: [1, 2, 3, 4, 5].map(n => W_.lvl('stacking-sim', n, 'Stack It!')) },
  { id: 'robot', name: 'Robot buddy', icon: '🤖', slot: 'pet', game: 'robot-adventure', steps: ['Tiny bot', 'Rolling bot', 'Drone', 'Robo-dog', 'Mech buddy'], ways: [1, 2, 3, 4, 5].map(n => W_.lvl('robot-adventure', n, 'Code the Robot')).concat([1, 2, 3, 4].map(n => W_.mini('code-robot', n, 'mini Code the Robot'))) },
  { id: 'checkers', name: 'Checkers style', icon: '🔴', slot: 'costume', game: 'checkers', steps: ['Checker hat', 'Checker shirt', 'Checker pants', 'Checkerboard', 'King of the board'], ways: [1, 2, 3, 4, 5].map(n => W_.lvl('checkers', n, 'Checkers')) },
  { id: 'chesspillow', name: 'Chess pillows', icon: '♟️', slot: 'hand', game: 'chess', steps: ['Pawn pillow', 'Knight pillow', 'Bishop pillow', 'Rook pillow', 'Queen pillow', 'King pillow'], ways: [1, 2, 3, 4, 5].map(n => W_.lvl('chess', n, 'Chess')).concat([W_.feat('chess', 'mates', 1, 'Checkmate a Chess bot')]) },
  { id: 'hero', name: 'Super hero', icon: '🦸', slot: 'costume', game: 'pinball', steps: ['Hero mask', 'Hero cape', 'Power gloves & boots', 'Super suit', 'Hover hero', 'Legend aura'], ways: [1, 2, 3, 4, 5].map(n => W_.lvl('pinball', n, 'Pinball')).concat([W_.score('pinball', 100000, 'Pinball')]) },
  { id: 'frog', name: 'Frog', icon: '🐸', slot: 'costume', game: 'hopper', steps: ['Frog cap', 'Frog hood', 'Frog suit', 'Tree frog', 'Frog prince'], ways: [1, 2, 3, 4, 5].map(n => W_.lvl('hopper', n, 'Dodgy Hopper')) },
  { id: 'racer', name: 'Racer', icon: '🏁', slot: 'costume', game: 'turbo', steps: ['Racing cap', 'Racing gloves', 'Racing helmet', 'Racing suit', 'Turbo champion'], ways: [1, 2, 3, 4, 5].map(n => W_.lvl('turbo', n, 'Turbo Trail')) },
  { id: 'cards', name: 'Magic cards', icon: '🃏', slot: 'hand', game: 'memory', steps: ['One card', 'Card pair', 'Card fan', 'Magic deck', 'Golden deck'], ways: [1, 2, 3, 4, 5].map(n => W_.lvl('memory', n, 'Memory Match')) },
  // ⚛️ Sciencetory atom looks (looks only — the element colour always stays; AtomSkins.html draws them; picked per player sp_atomskin:<Name>; Classic is free) · sc-2b
  { id: 'atomskin', name: 'Atom looks', icon: '⚛️', slot: 'atomskin', game: 'sciencetory', soon: 'Used on every atom in 🔬 Sciencetory ⚗️ Chemistry + ⚛️ Quantum — pick it on their lab screens', steps: ['Bubble', 'Jelly', 'Cartoon', 'Glow', 'Crystal', 'Planet', 'Electron cloud', 'Pixel', 'Galaxy'],
    ways: [W_.feat('sciencetory', 'elements', 2, 'Collect your first 2 element cards'), W_.feat('sciencetory', 'chemRounds', 1, 'Play a ⚗️ Chemistry round'), W_.feat('sciencetory', 'atoms', 3, 'Build 3 atoms in ⚛️ Quantum'),
      W_.feat('sciencetory', 'compounds', 5, 'Build 5 molecules'), W_.feat('sciencetory', 'elements', 25, 'Collect 25 element cards'), W_.feat('sciencetory', 'atoms', 10, 'Build 10 different atoms'),
      W_.feat('sciencetory', 'compounds', 15, 'Build 15 molecules'), W_.feat('sciencetory', 'elements', 50, 'Collect 50 element cards'), W_.feat('sciencetory', 'atoms', 25, 'Build 25 different atoms')] },
  { id: 'ballskin', name: 'Ball skins', icon: '🎱', slot: 'ball', game: 'pinball', soon: 'Used in 🎯 Pinball and 🏓 SlaBrall', steps: ['Colour ball', 'Chrome', 'Marble', '8-ball', 'Planet', 'Smiley', 'Disco', 'Stripes', 'Flames', 'Rainbow comet', 'Orange', 'Watermelon', 'Earth', 'Eyeball', 'Dino egg', 'Pearl', 'Moon', 'Donut', 'Snowball', 'Sun'],
    ways: [W_.feat('pinball', 'jackpots', 1, 'Hit a Pinball jackpot'), W_.feat('pinball', 'multiballs', 1, 'Start a Pinball multiball'), W_.feat('pinball', 'maxCombo', 10, 'Reach a 10-shot Pinball combo'), W_.feat('pinball', 'skills', 1, 'Make a Pinball skill shot'), W_.feat('pinball', 'scenes', 1, 'Visit a Pinball bonus scene'), W_.feat('pinball', 'boxes', 5, 'Open 5 Mystery Boxes'), W_.feat('pinball', 'chain', 5, 'Light 5 Lucky Lights in a row'), W_.feat('pinball', 'words', 3, 'Spell the top-lane word 3 times'), W_.score('pinball', 40000, 'Pinball'), W_.score('pinball', 150000, 'Pinball'), W_.lvl('sla-brall', 1, 'SlaBrall'), W_.lvl('sla-brall', 2, 'SlaBrall'), W_.lvl('sla-brall', 3, 'SlaBrall'), W_.lvl('sla-brall', 4, 'SlaBrall'), W_.lvl('sla-brall', 5, 'SlaBrall'), W_.feat('sla-brall', 'rally', 15, 'Keep a 15-hit SlaBrall rally'), W_.feat('sla-brall', 'aces', 5, 'Serve 5 aces in SlaBrall'), W_.feat('sla-brall', 'smash', 25, 'Hit 25 SlaBrall smashes'), W_.feat('sla-brall', 'powers', 10, 'Use 10 SlaBrall power-ups'), W_.feat('sla-brall', 'legend', 1, 'Score with a ⭐ Legendary Shot')] },
  { id: 'shapepillow', name: 'Shape pillows', icon: '🔷', slot: 'hand', game: 'stacking-sim', steps: ['Square pillow', 'Circle pillow', 'Triangle pillow', 'Heart pillow', 'Star pillow', 'Hexagon pillow', 'Crescent pillow', 'Rainbow trapezoid'], ways: [200, 400, 600, 800, 1000, 1200, 1500].map(n => W_.score('stacking-sim', n, 'Stack It!')).concat([W_.time('stacking-sim', 30, 'a Stack It! level')]) },
  { id: 'posecam', name: 'Pose cameras', icon: '📸', slot: 'hand', game: 'pose-party', steps: ['Instant camera', 'Video camera', 'Spotlight', 'Disco ball', 'Golden camera'],   // 📷 Pose Party (pose chat S2b-4)
    ways: [W_.feat('pose-party', 'poses', 10, 'Match 10 poses in Pose Party'), W_.lvl('pose-party', 2, 'Pose Party'), W_.feat('pose-party', 'danceBest', 2000, 'Score 2,000 in one 💃 Dance chain'),
      W_.feat('pose-party', 'booths', 3, 'Make 3 📸 Photo Booth pictures'), W_.lvl('pose-party', 5, 'Pose Party')] },
  { id: 'mathtools', name: 'Maths tools', icon: '🧮', slot: 'hand', game: 'math-quest', steps: ['Pencil', 'Ruler', 'Abacus', 'Calculator', 'Golden compass'], ways: [1, 2, 3, 4, 5].map(n => W_.lvl('math-quest', n, 'Math Quest')) },
  { id: 'dino', name: 'Dinosaur', icon: '🦖', slot: 'costume', game: 'any', steps: ['Dino egg hat', 'Hatchling hood', 'Baby dino', 'Raptor', 'Triceratops', 'T-rex'], ways: [2, 4, 7, 10, 15, 20].map(W_.total) },
  { id: 'sword', name: 'Laser sword', icon: '⚔️', slot: 'hand', game: 'checkers', steps: ['Blue laser sword', 'Green blade', 'Curved hilt', 'Purple blade', 'Crossguard hilt', 'Red blade', 'Double-blade staff', 'Gold blade', 'Spin glow', 'Rainbow blade'],
    parts: { blade: [['Blue', 1], ['Green', 2], ['Purple', 4], ['Red', 6], ['Gold', 8], ['Rainbow', 10]], hilt: [['Classic', 1], ['Curved', 3], ['Crossguard', 5], ['Double staff', 7]] },
    ways: [1, 2, 3, 4, 5].map(n => W_.lvl('checkers', n, 'Checkers')).concat([1, 2, 3, 4, 5].map(n => W_.lvl('chess', n, 'Chess'))) },
  { id: 'wings', name: 'Wings', icon: '🦋', slot: 'back', game: 'any', steps: ['Butterfly wings', 'Fairy wings', 'Bird wings', 'Bat wings', 'Dragon wings', 'Rainbow wings'], ways: [3, 6, 10, 15, 20, 30].map(W_.badges) },
  { id: 'board', name: 'Boards', icon: '🛹', slot: 'ride', game: 'trash-pointer', steps: ['Skateboard', 'Surfboard', 'Hoverboard', 'Rocket board'], ways: [2, 4, 7, 10].map(n => W_.mini('trash-pointer', n, 'Trash Pointer')) },
  { id: 'wand', name: 'Magic wand', icon: '🪄', slot: 'hand', game: 'color-match', steps: ['Stick wand', 'Star wand', 'Crystal wand', 'Wizard staff', 'Rainbow staff'], ways: [1, 2, 3, 4, 5].map(n => W_.mini('color-match', n, 'Color Match')) },
  { id: 'petegg', name: 'Pet egg', icon: '🥚', slot: 'pet', game: 'count-match', steps: ['Mystery egg', 'Cracking egg', 'Hatchling', 'Growing pet', 'Pet with a collar', 'Pet with a hat'], ways: [1, 2, 3, 4, 5].map(n => W_.mini('count-match', n, 'Count & Match')).concat([W_.days(5)]) },
  { id: 'music', name: 'Music', icon: '🎸', slot: 'hand', game: 'room', steps: ['Maracas', 'Guitar', 'Keytar', 'Drum'], ways: [10, 30, 60, 100].map(n => W_.feat('room', 'gestures', n, 'Do ' + n + ' moves in the Family Room')) },
  { id: 'monster', name: 'Monster', icon: '👾', slot: 'costume', game: 'any', steps: ['Monster horns', 'Furry hood', 'Furry suit', 'Big friendly monster'], ways: [1, 2, 3, 4].map(W_.extreme) },
  { id: 'snakeskin', name: 'Snake skins', icon: '🐍', slot: 'snakeskin', game: 'snakeast', computed: true, steps: ['Plain', 'Pattern', 'Light stripes', 'Armor', 'Fuel', 'Glow', 'Shadow colour'],   // 🐍 Snakize: each world evolves on its own — this line shows the best world
    ways: [0, 1, 2, 3, 4, 5, 6].map(k => ({ how: (k ? SNAKE_STEP_HOW_[k] : 'Free') + ' (any world)', r: x => snakeSkinsFor_(x.f).best > k })) },
  { id: 'snaketype', name: 'Snake types', icon: '🐉', slot: 'snaketype', game: 'snakeast', computed: true, steps: ['Garden snake', 'Python', 'Rattlesnake', 'King cobra', 'Anaconda', 'Viper', 'Sea snake', 'Coral snake', 'Boa', 'Titanoboa', 'Sea serpent', 'Conga dragon', 'Mecha viper', 'Comet serpent', 'Feathered serpent'],
    ways: SNAKE_TYPE_RULES_.map(t => ({ how: t[1], r: x => !!t[2](x.f) })) },
  { id: 'taleheroes', name: 'Tale heroes', icon: '📜', slot: 'costume', game: 'snakeast', steps: ['Dino Ranger', 'Deep-Sea Diver', 'Disco Star', 'Robo Pilot', 'Astronaut', 'Sky Knight'],   // 🐍 Snakize 📜 Snaketale: one theme costume per chapter (plan 11y)
    ways: [1, 2, 3, 4, 5, 6].map(n => W_.feat('snaketale', 'chapters', n, 'Finish Snaketale chapter ' + n + ' (' + ['🦖 Dino Jungle', '🐙 Aquarium', '🪩 Dance Hall', '🤖 Robot Time', '🪐 Space', '☁️ Sky Temple'][n - 1] + ')')) },
  { id: 'zombie', name: 'Zombie', icon: '🧟', slot: 'costume', game: 'room', steps: ['Bandage', 'Zombie face', 'Torn clothes', 'Shuffling zombie'], ways: [10, 25, 50, 100].map(n => W_.feat('room', 'crawl', n, 'Belly-crawl ' + n + ' tiles in the Family Room')) },
  { id: 'colours', name: 'Colour schemes', icon: '🎨', slot: 'outfitColor', game: 'any', steps: ['Paint splash', 'Galaxy', 'Lava', 'Candy stripe', 'Neon', 'Camo', 'Gold', 'Rainbow'], ways: [W_.feat('app', 'looks', 1, 'Change your app look')].concat([1, 2, 3, 4, 5, 6, 7].map(W_.titles)) },
  { id: 'skins', name: 'Fun skins', icon: '✨', slot: 'skin', game: 'any', steps: ['Gold', 'Alien green', 'Ocean blue', 'Fairy lilac', 'Starry'], ways: [2, 4, 7, 10, 14].map(W_.days) },
  { id: 'medal', name: 'Medals', icon: '🥇', slot: 'neck', game: 'any', steps: ['Bronze medal', 'Silver medal', 'Gold medal'], ways: [10, 25, 50].map(W_.badges) },
  { id: 'trophy', name: 'Trophy', icon: '🏆', slot: 'hand', game: 'room', steps: ['Bronze trophy', 'Silver trophy', 'Gold trophy'], ways: [1, 5, 15].map(n => W_.feat('app', 'archive', n, 'Open the Achievement Archive ' + n + ' time' + (n > 1 ? 's' : ''))) },
  { id: 'pogo', name: 'Bouncy', icon: '🦘', slot: 'ride', game: 'room', steps: ['Spring shoes', 'Pogo stick', 'Rocket pogo'], ways: [25, 100, 250].map(n => W_.feat('room', 'jumps', n, 'Jump ' + n + ' times in the Family Room')) },
  { id: 'fashion', name: 'Fashion', icon: '👗', slot: 'outfit', game: 'any', steps: ['Crop top + high-waist jeans', 'Tee + cargo pants', 'Sweater + plaid skirt', 'Denim jacket + jeans', 'Cardigan + midi skirt', 'Summer co-ord', 'Oversized tee + joggers', 'Shirt dress', 'Jumpsuit', 'Varsity jacket + track pants'],
    ways: [W_.total(3), W_.days(3), W_.feat('room', 'visits', 3, 'Visit 3 family rooms'), W_.badges(8), W_.total(8), W_.titles(2), W_.feat('room', 'gestures', 40, 'Do 40 moves in the Family Room'), W_.days(8), W_.badges(20), W_.extreme(2)] },
  { id: 'hairstyles', name: 'Hair styles', icon: '💇', slot: 'hair', game: 'any', steps: ['Braids', 'Ponytail', 'Pigtails', 'Space buns', 'Afro', 'Rainbow hair'],
    ways: [W_.time('maze', 60, 'a Maze level'), W_.score('stacking-sim', 800, 'Stack It!'), W_.score('robot-adventure', 600, 'Code the Robot'), W_.score('checkers', 600, 'Checkers'), W_.score('chess', 600, 'Chess'), W_.score('pinball', 40000, 'Pinball')] },
  { id: 'furni', name: 'Room things', icon: '🛋️', slot: 'furni', game: 'room', steps: ['Trophy cabinet', 'Beanbag', 'Arcade machine', 'Aquarium', 'Dino lamp', 'Rocket bed', 'Slide', 'Disco ball'],
    ways: [W_.total(5), W_.feat('room', 'placed', 5, 'Put 5 things in My Room'), W_.total(10), W_.feat('room', 'gifts', 5, 'Send 5 gifts'), W_.feat('room', 'cleans', 3, 'Tidy 3 family rooms'), W_.feat('room', 'visits', 5, 'Visit 5 family rooms'), W_.total(20), W_.badges(25)] },
  { id: 'roomstyle', name: 'Room styles', icon: '🖼️', slot: 'roomstyle', game: 'room', steps: ['Star wallpaper', 'Jungle wallpaper', 'Castle stones', 'Galaxy floor', 'Candy floor'],
    ways: [W_.feat('room', 'visits', 1, 'Visit a family room'), W_.feat('room', 'placed', 10, 'Put 10 things in My Room'), W_.feat('room', 'received', 3, 'Get 3 gifts'), W_.feat('room', 'cleans', 1, 'Tidy a family room'), W_.days(10)] },
  { id: 'helper', name: 'Helper things', icon: '🧹', slot: 'hand', game: 'room', steps: ['Gift box', 'Paint brush', 'Broom', 'Heart balloon'],
    ways: [W_.feat('room', 'gifts', 1, 'Send a gift'), W_.feat('room', 'placed', 10, 'Put 10 things in My Room'), W_.feat('room', 'cleans', 1, 'Tidy a family room'), W_.feat('room', 'received', 5, 'Get 5 gifts')] },
  { id: 'hardcore', name: 'Hardcore trail', icon: '💀', slot: 'trail', game: 'any', steps: ['Skull sparks', 'Fire skulls', 'Thunder skulls', 'Legend storm'], ways: [1, 3, 6, 10].map(W_.hardcore) },
  // ---- 3c (Aowu's feedback 2026-11-02): 20 more back things, pets, boards and trails (2 lines of 10 each) ----
  { id: 'gear', name: 'Back gear', icon: '🎒', slot: 'back', game: 'any', steps: ['School backpack', 'Hero shield', 'Kite', 'Turtle shell', 'Guitar on the back', 'Bow and quiver', 'Rocket jetpack', 'Teddy backpack', 'Treasure map', 'Golden jetpack'],
    ways: [W_.miles(8), W_.total(4), W_.days(4), W_.badges(6), W_.miles(40), W_.total(12), W_.miles(90), W_.badges(18), W_.extreme(3), W_.miles(200)] },
  { id: 'magicback', name: 'Magic backs', icon: '🌈', slot: 'back', game: 'any', steps: ['Rainbow arc', 'Star halo', 'Angel wing', 'Moon cape', 'Bubble bubble', 'Flower crown back', 'Crystal shards', 'Fire ring', 'Lightning bolts', 'Galaxy swirl'],
    ways: [W_.titles(1), W_.days(6), W_.miles(25), W_.titles(3), W_.badges(12), W_.miles(70), W_.days(12), W_.titles(5), W_.hardcore(1), W_.miles(260)] },
  { id: 'cuddlypets', name: 'Cuddly pets', icon: '🐰', slot: 'pet', game: 'any', steps: ['Bunny', 'Hamster', 'Chick', 'Koala', 'Panda cub', 'Puppy', 'Kitten', 'Hedgehog', 'Squirrel', 'Baby unicorn'],
    ways: [W_.miles(5), W_.days(3), W_.total(6), W_.miles(30), W_.badges(10), W_.days(9), W_.miles(80), W_.total(16), W_.badges(22), W_.miles(180)] },
  { id: 'wildpets', name: 'Wild pets', icon: '🦊', slot: 'pet', game: 'any', steps: ['Fox', 'Frog', 'Turtle', 'Parrot', 'Penguin', 'Octopus', 'Bee', 'Butterfly', 'Otter', 'Baby dragon'],
    ways: [W_.extreme(1), W_.miles(20), W_.titles(2), W_.miles(50), W_.extreme(2), W_.days(15), W_.miles(110), W_.titles(4), W_.extreme(5), W_.hardcore(2)] },
  { id: 'coolboards', name: 'Cool boards', icon: '🛴', slot: 'ride', game: 'any', steps: ['Scooter', 'Roller skates', 'Log raft', 'Leaf glider', 'Donut float', 'Pizza board', 'Fire board', 'Ice board', 'Lightning board', 'Golden board'],
    ways: [W_.miles(12), W_.total(5), W_.miles(35), W_.days(7), W_.miles(60), W_.badges(15), W_.miles(100), W_.total(20), W_.miles(150), W_.miles(240)] },
  { id: 'magicfloats', name: 'Magic floats', icon: '☁️', slot: 'ride', game: 'any', steps: ['Cloud', 'Bubble', 'Witch broom', 'Magic carpet', 'Mini UFO', 'Swan float', 'Rainbow road', 'Moon swing', 'Star sled', 'Comet'],
    ways: [W_.titles(1), W_.miles(45), W_.days(10), W_.titles(3), W_.miles(85), W_.extreme(2), W_.miles(130), W_.titles(6), W_.extreme(4), W_.hardcore(1)] },
  { id: 'sparkletrails', name: 'Sweet trails', icon: '🍬', slot: 'trail', game: 'any', steps: ['Candy', 'Music notes', 'Flowers', 'Snowflakes', 'Leaves', 'Clovers', 'Cookies', 'Balloons', 'Diamonds', 'Crowns'],
    ways: [W_.miles(10), W_.days(5), W_.total(8), W_.miles(55), W_.badges(14), W_.days(11), W_.miles(95), W_.total(18), W_.badges(26), W_.miles(220)] },
  { id: 'wildtrails', name: 'Wild trails', icon: '⚡', slot: 'trail', game: 'any', steps: ['Paw prints', 'Footsteps', 'Fire', 'Lightning', 'Ghosts', 'Bats', 'Planets', 'Fish', 'Dinosaurs', 'Fireworks'],
    ways: [W_.miles(15), W_.titles(2), W_.miles(65), W_.extreme(1), W_.days(13), W_.titles(4), W_.miles(120), W_.extreme(3), W_.miles(190), W_.hardcore(3)] },
  { id: 'trails', name: 'Trails', icon: '💫', slot: 'trail', game: 'any', steps: ['Sparkles', 'Bubbles', 'Hearts', 'Stars', 'Comet', 'Rainbow'],
    ways: [W_.time('maze', 40, 'a Maze level'), W_.score('stacking-sim', 1200, 'Stack It!'), W_.score('robot-adventure', 700, 'Code the Robot'), W_.score('checkers', 700, 'Checkers'), W_.score('chess', 700, 'Chess'), W_.score('pinball', 80000, 'Pinball')] },
  // 🪶 SlaBam shuttle feathers (sb2-2): own n steps = feathers 0..n-1, painted by BallSkins.feather (the cork = the ball skin). Picked per device: sp_feather:<Name>.
  { id: 'feather', name: 'Shuttle feathers', icon: '🪶', slot: 'feather', game: 'sla-brall', soon: 'Used in 🏸 SlaBam — your feather flies behind the cork (the cork is your ball skin)', steps: ['Goose white', 'Rainbow', 'Peacock', 'Phoenix', 'Ice crystal', 'Neon', 'Leaf', 'Candy stripe', 'Galaxy', 'Golden'],
    ways: [W_.feat('sla-brall', 'win_slabam', 1, 'Win a SlaBam match'), W_.feat('sla-brall', 'win_slabam', 3, 'Win 3 SlaBam matches'), W_.feat('sla-brall', 'smash', 15, 'Hit 15 SlaBrall smashes'), W_.feat('sla-brall', 'win_slabam', 6, 'Win 6 SlaBam matches'), W_.feat('sla-brall', 'perfect', 30, 'Hit 30 PERFECT shots in SlaBrall'), W_.feat('sla-brall', 'win_slabam', 10, 'Win 10 SlaBam matches'), W_.feat('sla-brall', 'rally', 25, 'Keep a 25-hit SlaBrall rally'), W_.feat('sla-brall', 'win_slabam', 15, 'Win 15 SlaBam matches'), W_.feat('sla-brall', 'cups', 2, 'Win 2 SlaBrall tournaments'), W_.feat('sla-brall', 'win_slabam', 25, 'Win 25 SlaBam matches')] },
  // 🕹️ sk-1 Joystick skins (looks only): ONE master list for every joystick + its buttons (UiKit JoySkins), in 3 lines of 8 (house rule ≤ 10 steps): 🍬 Sweet (common) · 🐸 Wild (rare + epic) · 👑 Legend (epic + legend).
  // Wear one in 🎒 Wardrobe (avatar eq.joy = {id: line, v}). 🎁 pickups (grantJoySkin — Brawl floor capsules etc., 1 per game per day) add a step to the first line that isn't full.
  { id: 'joyskin', name: 'Sweet joysticks', icon: '🕹️', slot: 'joy', game: 'any', soon: 'Your 🕹️ joystick + buttons in every game with a stick — wear it in 🎒 Wardrobe', steps: ['Bubblegum', 'Mint chip', 'Ocean', 'Lemon', 'Grape', 'Donut', 'Soccer', 'Paw'],
    ways: [W_.days(1), W_.total(2), W_.miles(10), W_.feat('sla-brall', 'matches', 3, 'Play 3 SlaBrall matches'), W_.days(3), W_.badges(3), W_.total(8), W_.miles(40)] },
  { id: 'joyskin2', name: 'Wild joysticks', icon: '🐸', slot: 'joy', game: 'any', soon: 'Your 🕹️ joystick + buttons in every game with a stick — wear it in 🎒 Wardrobe', steps: ['Frog', 'Watermelon', 'Cookie', 'Planet', 'Robot eye', 'Star', 'Flower', 'Lava'],
    ways: [W_.feat('sla-brall', 'wins', 5, 'Win 5 SlaBrall matches'), W_.days(7), W_.titles(1), W_.extreme(1), W_.badges(12), W_.miles(120), W_.feat('sla-brall', 'smash', 50, 'Hit 50 SlaBrall smashes'), W_.hardcore(1)] },
  { id: 'joyskin3', name: 'Legend joysticks', icon: '👑', slot: 'joy', game: 'any', soon: 'Your 🕹️ joystick + buttons in every game with a stick — wear it in 🎒 Wardrobe', steps: ['Ice', 'Gem', 'Rainbow', 'Galaxy', 'Dragon eye', 'Golden crown', 'Neon pulse', 'Phoenix'],
    ways: [W_.days(14), W_.miles(200), W_.badges(20), W_.titles(3), W_.extreme(3), W_.feat('sla-brall', 'cups', 1, 'Win a SlaBrall tournament'), W_.hardcore(3), W_.days(30)] },
  // 🎭 as-2 Signature acts (AvatarActing core-sig): pick ONE in 🎒 Wardrobe → avatar field `sig`; steps = SIG_ACTS_.line in the same order
  { id: 'sigact', name: 'Signature acts', icon: '🎭', slot: 'sigact', game: 'any', soon: 'Your 🎭 signature move — on the 👋 tiles, in the Family Room and on result cards. Pick it in 🎒 Wardrobe', steps: ['Superstar', 'Power up', 'Heart burst', 'Genius', 'Ninja', 'Rock star', 'Giant hero', 'Flower twirl', 'Moonwalk', 'Robot'],
    ways: [W_.days(2), W_.total(3), W_.badges(2), W_.miles(15), W_.titles(1), W_.days(5), W_.total(12), W_.miles(40), W_.hardcore(1), W_.days(10)] },
  // 🏏 bs-1 Batsticks (Batstickskin shapes 11–18 after the 10 rackets): design them in 🏏 My Batstick (shape · sticker · colours · pattern) — used as your SlaBrall racket, your Brawl melee pickup and in your hand.
  { id: 'batstick', name: 'Batsticks', icon: '🏏', slot: 'hand', game: 'any', soon: 'Your 🏏 Batstick in every game you swing in — design it in 🎒 Wardrobe or SlaBrall', steps: ['Baseball bat', 'Cricket bat', 'Foam bat', 'Lollipop bat', 'Candy cane', 'Glow stick', 'Bamboo stick', 'Dino bone club'],
    ways: [W_.feat('sla-brall', 'matches', 2, 'Play 2 SlaBrall matches'), W_.days(2), W_.feat('sla-brall', 'smash', 15, 'Hit 15 SlaBrall smashes'), W_.total(5), W_.feat('sla-brall', 'wins', 3, 'Win 3 SlaBrall matches'), W_.badges(6), W_.miles(80), W_.feat('sla-brall', 'perfect', 40, 'Hit 40 PERFECT shots in SlaBrall')] },
  // ☄️ SlaBrall ball trails (round 2): own n steps = trails 0..n-1, painted by BallSkins.trail. Picked per device: sp_balltrail:<Name>.
  { id: 'balltrail', name: 'Ball trails', icon: '☄️', slot: 'balltrail', game: 'sla-brall', soon: 'Used in 🏓 SlaBrall — your trail follows the ball after you hit it', steps: ['Sparkles', 'Bubbles', 'Hearts', 'Stars', 'Fire', 'Frost', 'Rainbow', 'Leaves', 'Lightning', 'Galaxy'],
    ways: [W_.feat('sla-brall', 'matches', 1, 'Play a SlaBrall match'), W_.feat('sla-brall', 'wins', 3, 'Win 3 SlaBrall matches'), W_.feat('sla-brall', 'cupMatches', 1, 'Play a SlaBrall tournament match'), W_.feat('sla-brall', 'perfect', 20, 'Hit 20 PERFECT shots in SlaBrall'), W_.feat('sla-brall', 'smash', 25, 'Hit 25 SlaBrall smashes'), W_.feat('sla-brall', 'aces', 10, 'Serve 10 aces in SlaBrall'), W_.feat('sla-brall', 'cups', 1, 'Win a SlaBrall tournament'), W_.feat('sla-brall', 'powers', 20, 'Use 20 SlaBrall powers'), W_.feat('sla-brall', 'rally', 30, 'Keep a 30-hit SlaBrall rally'), W_.feat('sla-brall', 'cups', 3, 'Win 3 SlaBrall tournaments')] },
  // 💣 Soul Bopper bomb skins: steps 1–4 = the evolution (Plain is free; each world evolves by its own feats, see bopperInfo_), 5–10 = fun extras (+ golden poo). Picked per device: sp_soulbopper_skin:<Name>. Painted by BombSkins.
  { id: 'bombskin', name: 'Bomb skins', icon: '💣', slot: 'bombskin', game: 'soul-bopper', soon: 'Used in 👻💣 Soul Bopper — pick your bomb in the setup', steps: ['Pattern bomb', 'Glow bomb', 'Armored bomb', 'Legendary bomb', 'Poo bomb (golden at 100 catches)', 'Watermelon bomb', 'Cake bomb', 'Balloon bomb', 'Teddy bomb', 'Mini volcano'],
    ways: [W_.feat('soul-bopper', 'games', 5, 'Play 5 Soul Bopper games'), W_.feat('soul-bopper', 'catches', 20, 'Catch 20 players in Soul Bopper'), W_.feat('soul-bopper', 'bestWin', 4, 'Win a Soul Bopper battle on Hard'), W_.feat('soul-bopper', 'bestWin', 5, 'Win a Soul Bopper battle on Extreme'),
      W_.feat('soul-bopper', 'pooGames', 3, 'Play 3 💩 Classic Avatar games'), W_.feat('soul-bopper', 'blocks', 300, 'Break 300 blocks in Soul Bopper'), W_.feat('soul-bopper', 'wins', 3, 'Win 3 Soul Bopper games'), W_.feat('soul-bopper', 'chains', 20, 'Set off 20 chain pops'), W_.feat('soul-bopper', 'comebacks', 5, 'Come back 5 times in Soul Bopper'), W_.feat('soul-bopper', 'triple', 1, 'Catch 3 with one pop')] },
  // 🔴 Alignext discs (held in the hand): painted by AvatarKit drawHeldItem('linediscs')
  { id: 'linediscs', name: 'Line discs', icon: '🔴', slot: 'hand', game: 'alignext', steps: ['Red disc', 'Gold disc', 'Disc tower', 'Hatching egg', 'Ringed planet disc', 'Rainbow disc'],
    ways: [W_.lvl('alignext', 1, 'Alignext Drop'), W_.lvl('omnifile', 1, 'Alignext Omnifile'), W_.feat('alignext', 'lines', 10, 'Make 10 lines of 3 in Alignext Drop'), W_.lvl('alignext', 3, 'Alignext Drop'), W_.lvl('omnifile', 3, 'Alignext Omnifile'), W_.lvl('alignext', 5, 'Alignext Drop')] },
  { id: 'racket', name: 'Rackets', icon: '🏓', slot: 'hand', game: 'sla-brall', steps: ['Wood paddle', 'Table-tennis bat', 'Tennis racket', 'Hockey stick', 'Frying pan', 'Guitar', 'Magic wand racket', 'Laser racket', 'Baguette', 'Golden racket'],
    ways: [W_.feat('sla-brall', 'matches', 1, 'Play a SlaBrall match'), W_.feat('sla-brall', 'wins', 1, 'Win a SlaBrall match'), W_.lvl('sla-brall', 1, 'SlaBrall'), W_.lvl('sla-brall', 2, 'SlaBrall'), W_.feat('sla-brall', 'rally', 20, 'Keep a 20-hit SlaBrall rally'), W_.lvl('sla-brall', 3, 'SlaBrall'), W_.feat('sla-brall', 'smash', 50, 'Hit 50 SlaBrall smashes'), W_.lvl('sla-brall', 4, 'SlaBrall'), { how: 'Win a match in all 5 SlaBrall sports', r: x => ['slashot', 'slapoof', 'slaball', 'slapong', 'slawall'].every(k => featVal_(x.f, 'sla-brall', 'win_' + k) >= 1) }, W_.lvl('sla-brall', 5, 'SlaBrall')] },
  { id: 'brawlgear', name: 'Brawl gear', icon: '🥊', slot: 'hand', game: 'brawl-buddies', steps: ['Red foam gloves', 'Blue foam gloves', 'Sweatband gloves', 'Star gloves', 'Hero headband', 'Flame gloves', 'Lightning gloves', 'Rainbow gloves', 'Diamond gloves', 'Golden champion gloves'],
    ways: [W_.feat('brawl-buddies', 'matches', 1, 'Play a Brawl Buddies fight'), W_.feat('brawl-buddies', 'wins', 1, 'Win a brawl'), W_.lvl('brawl-buddies', 1, 'Brawl Buddies'), W_.lvl('brawl-buddies', 2, 'Brawl Buddies'), W_.feat('brawl-buddies', 'combo', 10, 'Land a 10-hit combo'), W_.feat('brawl-buddies', 'grabs', 10, 'Land 10 grapples'), W_.lvl('brawl-buddies', 3, 'Brawl Buddies'), W_.feat('brawl-buddies', 'juggle', 5, 'Juggle a buddy 5 bounces in the air'), W_.lvl('brawl-buddies', 4, 'Brawl Buddies'), W_.lvl('brawl-buddies', 5, 'Brawl Buddies')] },
];
/* ---------- ADVENTURE MILES 🐾 + RIDE-ONS ----------
   Miles are counted from what the player already did (nothing to keep in sync):
     every cleared level: Basic 1 · Junior 2 · Intermediate 3 · Hard 4 · Extreme 5 (Hardcore 8) + 1 per star,
     every mini-game stage opened +1, Turbo +1 per km driven, Hopper +1 per 50 rows hopped, each daily treasure +3,
     + extra miles written to the Miles tab with addMiles_() (for other parts of the app later).
   Ride-ons unlock at rising mile goals; four special ones can also be won in their own game first. */
const RIDE_ONS = [
  { id: 'unicorn', name: 'Unicorn', icon: '🦄', miles: 5 },
  { id: 'corgi', name: 'Corgi', icon: '🐕', miles: 10 },
  { id: 'duck', name: 'Duck', icon: '🦆', miles: 16 },
  { id: 'chicken', name: 'Chicken', icon: '🐔', miles: 24, special: { how: 'or pass Dodgy Hopper Junior', r: x => (x.cleared.hopper || 0) >= 2 } },
  { id: 'donkey', name: 'Donkey', icon: '🫏', miles: 32 },
  { id: 'cow', name: 'Cow', icon: '🐄', miles: 42 },
  { id: 'penguin', name: 'Penguin', icon: '🐧', miles: 52 },
  { id: 'trex', name: 'T-rex', icon: '🦖', miles: 64, special: { how: 'or pass Maze Intermediate (Jungle maze)', r: x => (x.cleared.maze || 0) >= 3 } },
  { id: 'camel', name: 'Camel', icon: '🐫', miles: 76 },
  { id: 'horse', name: 'Horse', icon: '🐎', miles: 90 },
  { id: 'flamingo', name: 'Flamingo', icon: '🦩', miles: 105 },
  { id: 'shark', name: 'Shark', icon: '🦈', miles: 120, special: { how: 'or pass Turbo Trail Intermediate (speedboat)', r: x => (x.cleared.turbo || 0) >= 3 } },
  { id: 'panda', name: 'Panda', icon: '🐼', miles: 138 },
  { id: 'alligator', name: 'Alligator', icon: '🐊', miles: 156 },
  { id: 'buffalo', name: 'Buffalo', icon: '🐃', miles: 176 },
  { id: 'lion', name: 'Lion', icon: '🦁', miles: 198 },
  { id: 'tiger', name: 'Tiger', icon: '🐅', miles: 222 },
  { id: 'moose', name: 'Moose', icon: '🫎', miles: 248 },
  { id: 'elephant', name: 'Elephant', icon: '🐘', miles: 276 },
  { id: 'dragon', name: 'Dragon', icon: '🐉', miles: 310, special: { how: 'or visit the Dragon\'s Den in Pinball (dragon sky)', r: x => featVal_(x.f, 'pinball', 'scene_castle') >= 1 } },
  // 🌟 Mystical Beasts (plan 11q, 2026-11-06): need BOTH the miles AND their beast quest. about = kid-friendly story shown in the Collection.
  { id: 'pegasus', name: 'Pegasus', icon: '🪽', miles: 350, beast: true, quest: { how: 'pass Hard in 3 different games', r: x => (x.hards || 0) >= 3 },
    about: 'A white horse with big feathered wings from old Greek stories. It gallops on the clouds and flies faster than the wind.' },
  { id: 'griffin', name: 'Griffin', icon: '🦅', miles: 400, beast: true, quest: { how: 'pass Maze Hard', r: x => (x.cleared['maze'] || 0) >= 4 },
    about: 'Half eagle, half lion! An eagle\'s head and wings with a strong lion\'s body. In old stories griffins guard gold and treasure.' },
  { id: 'sphinx', name: 'Sphinx', icon: '🗿', miles: 460, beast: true, quest: { how: 'pass Digitinct Hard', r: x => (x.cleared['number-grid'] || 0) >= 4 },
    about: 'A wise lion from old Egypt wearing a striped royal headdress. It loves riddles — answer right and it lets you pass!' },
  { id: 'ninetails', name: 'Nine-tailed Fox', icon: '🦊', miles: 520, beast: true, quest: { how: 'pass Memory Match Extreme', r: x => (x.cleared['memory'] || 0) >= 5 },
    about: 'A magic fox from Chinese, Japanese and Korean stories. It grows a new tail every hundred years, so nine tails means very old and very wise.' },
  { id: 'qilin', name: 'Qilin', icon: '🦌', miles: 590, beast: true, quest: { how: 'find 7 daily treasures', r: x => (x.dailies || 0) >= 7 },
    about: 'A gentle Chinese lucky beast with a deer\'s body, dragon scales and one golden horn. It walks so softly the grass doesn\'t bend, and it brings good luck.' },
  { id: 'thunderbird', name: 'Thunderbird', icon: '⚡', miles: 660, beast: true, quest: { how: 'pass Block Drop Extreme', r: x => (x.cleared['block-drop'] || 0) >= 5 },
    about: 'A giant bird from Native American stories. When it flaps its wings you hear thunder, and lightning flashes when it blinks.' },
  { id: 'naga', name: 'Naga', icon: '🐍', miles: 740, beast: true, quest: { how: 'pass Sweet Swap Hard', r: x => (x.cleared['sweet-swap'] || 0) >= 4 },
    about: 'A great water serpent from Thai stories with a fan of heads like a crown. Nagas guard rivers and temples and bring the rain.' },
  { id: 'erawan', name: 'Erawan', icon: '🐘', miles: 820, beast: true, quest: { how: 'pass Lettercraft Hard', r: x => (x.cleared['word-board'] || 0) >= 4 },
    about: 'The white elephant of Thai stories, drawn with three heads. It carries the sky god Indra and can make rain clouds.' },
  { id: 'manticore', name: 'Manticore', icon: '🦂', miles: 900, beast: true, quest: { how: 'pass Checkers Extreme', r: x => (x.cleared['checkers'] || 0) >= 5 },
    about: 'A lion with a spiky scorpion tail from old Persian stories. It looks fierce, but ours is a big friendly cat.' },
  { id: 'cerberus', name: 'Cerberus', icon: '🐕', miles: 990, beast: true, quest: { how: 'pass Chess Hard', r: x => (x.cleared['chess'] || 0) >= 4 },
    about: 'A giant three-headed dog from Greek stories that guards a secret gate. Three heads means three times the barking — and three times the cuddles!' },
  { id: 'phoenix', name: 'Phoenix', icon: '🔥', miles: 1080, beast: true, quest: { how: 'beat any 💀 Hardcore level', r: x => (x.hardcores || 0) >= 1 },
    about: 'A fire bird that glows like the sun. When it gets old it turns to flames and is born again from the ashes, shiny and new.' },
  { id: 'hydra', name: 'Hydra', icon: '🐲', miles: 1180, beast: true, quest: { how: 'beat 💀 Hardcore in 3 games', r: x => (x.hardcores || 0) >= 3 },
    about: 'A many-headed water serpent from Greek stories. If one head is cut off, two more grow back!' },
  { id: 'roc', name: 'Roc', icon: '🦅', miles: 1280, beast: true, quest: { how: 'pass Turbo Trail Extreme', r: x => (x.cleared['turbo'] || 0) >= 5 },
    about: 'A bird so huge it can lift an elephant! In the Arabian Nights stories sailors thought its egg was a big white dome.' },
  { id: 'kraken', name: 'Kraken', icon: '🐙', miles: 1390, beast: true, quest: { how: 'pass Pinball Extreme', r: x => (x.cleared['pinball'] || 0) >= 5 },
    about: 'A giant sea monster from Norway\'s sailor stories, as big as an island. Its long arms can hug a whole ship.' },
  { id: 'kaiju', name: 'Titan Kaiju', icon: '🦖', miles: 1500, beast: true, quest: { how: 'make a 2048 tile in Double Up', r: x => featVal_(x.f, 'double-up', 'bestTile') >= 2048 },
    about: 'Our own giant monster lizard as tall as a city. Kaiju means \"strange beast\" in Japanese. It stomps, roars and its back spikes glow blue.' },
  { id: 'leviathan', name: 'Leviathan', icon: '🐋', miles: 1620, beast: true, quest: { how: 'beat 💀 Hardcore in 5 games', r: x => (x.hardcores || 0) >= 5 },
    about: 'A giant sea serpent from very old stories — the biggest creature in the ocean. When it swims, the whole sea swirls.' },
  { id: 'whitetiger', name: 'White Tiger', icon: '🐯', miles: 1750, beast: true, quest: { how: 'beat 💀 Hardcore in 6 games', r: x => (x.hardcores || 0) >= 6 },
    about: 'One of the Four Guardians in the Chinese stars (Bai Hu). It guards the West and autumn and stands for being brave.' },
  { id: 'vermilion', name: 'Vermilion Bird', icon: '🐦', miles: 1880, beast: true, quest: { how: 'beat 💀 Hardcore in 7 games', r: x => (x.hardcores || 0) >= 7 },
    about: 'Zhu Que, the red fire bird of the Four Guardians. It guards the South and summer — its feathers glow but never burn you.' },
  { id: 'tortoise', name: 'Black Tortoise', icon: '🐢', miles: 2020, beast: true, quest: { how: 'beat 💀 Hardcore in 8 games', r: x => (x.hardcores || 0) >= 8 },
    about: 'Xuan Wu, a tortoise with a snake friend wrapped around it. It guards the North and winter and stands for long life and patience.' },
  { id: 'azure', name: 'Azure Dragon', icon: '🐉', miles: 2200, beast: true, quest: { how: 'own the other 3 Guardians + beat 💀 Hardcore in 10 games', r: x => (x.hardcores || 0) >= 10 },
    about: 'Qing Long, the blue-green dragon who leads the Four Guardians. It guards the East and spring and brings the rain so plants can grow.' },
];
ITEM_LINES.push({ id: 'rideon', name: 'Ride-ons', icon: '🐾', slot: 'ride', game: 'any', rides: true, steps: RIDE_ONS.map(r => r.name),
  ways: RIDE_ONS.map(r => r.beast ? { how: r.icon + ' ' + r.name + ': ' + r.miles + ' Adventure miles + ' + r.quest.how, r: x => x.miles >= r.miles && !!r.quest.r(x) }
    : ({ how: r.icon + ' ' + r.name + ': ' + r.miles + ' Adventure miles' + (r.special ? ' — ' + r.special.how : ''), r: x => x.miles >= r.miles || (!!r.special && !!r.special.r(x)) })) });
function milesFor_(name, x) {
  const from = { levels: 0, mini: 0, turbo: 0, hopper: 0, snake: 0, daily: 0, extra: 0 };
  scoreRows_().forEach(r => { if (r.name !== name || !(r.stars > 0) || !(r.level >= 0)) return; from.levels += (r.level >= 5 ? 8 : r.level + 1) + Math.min(3, r.stars); });
  Object.keys(x.mini || {}).forEach(g => { from.mini += Number(x.mini[g]) || 0; });
  from.turbo = Math.floor(featVal_(x.f, 'turbo', 'metres') / 1000);
  from.hopper = Math.floor(featVal_(x.f, 'hopper', 'rows') / 50);
  from.snake = Math.floor(snakeFeat_(x.f, 'eaten') / 60 + snakeFeat_(x.f, 'longest', 'max') / 15);   // 🐍 Snakize: food + snake length as distance
  wardrobeRows_().forEach(r => { if (r.name === name && String(r.source).indexOf('daily:') === 0) from.daily += 3; });
  from.extra = milesLedger_()[name] || 0;
  return { total: from.levels + from.mini + from.turbo + from.hopper + from.snake + from.daily + from.extra, from: from };
}
function milesOf_(name) { const players = activePlayers_(listProfilesFull()); return milesFor_(name, itemContext_(name, players)).total; }

/* ---------- Miles tab: extra Adventure miles given by other parts of the app (generic ledger) ---------- */
const MILES_TAB = 'Miles';
const MILES_HEADERS = [
  ['Date', 'date', 'yyyy-MM-dd HH:mm'],
  ['Player', 'name', 'Name exactly as on the Profiles tab'],
  ['Miles', 'miles', 'How many Adventure miles (whole number)'],
  ['Reason', 'reason', 'Why (shown to nobody, for you)'],
];
let MILES_MEMO_ = null;
function milesLedger_() {
  if (MILES_MEMO_ && MILES_MEMO_.ss === ss_()) return MILES_MEMO_.sum;
  const sh = ss_().getSheetByName(MILES_TAB), sum = {};
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, MILES_HEADERS.length).getValues().forEach(r => { const n = String(r[1]).trim(), m = Math.floor(Number(r[2])); if (n && m) sum[n] = (sum[n] || 0) + m; });
  MILES_MEMO_ = { ss: ss_(), sum: sum };
  return sum;
}
// 🎨 extra number looks owned = max(item line 'numberskin' steps, GeoScout Journey chapters done) — GeoScout AND Algebros unlock them (gs-4)
function numberSkinsOwned_(players) {
  const all = activePlayers_(listProfilesFull()), j = geoJourneyData_(players), out = {};
  players.forEach(p => { let n = 0; try { n = itemsFor_(p.Name, all).owned.numberskin || 0; } catch (e) { n = 0; } out[p.Name] = Math.min(6, Math.max(n, Number(j[p.Name]) || 0)); });
  return out;
}
// 🎁 GeoScout daily treasure counters (today): puzzles solved + Journey chapters / Tower battle wins
function gsDaily_(name, stats) {
  try { const d = dailyRoom_(getSettings(), name, today_()), x = k => Math.max(0, Number(stats[k]) || 0);
    d.gsSolved = (d.gsSolved || 0) + ['balances', 'compares', 'counts', 'tens', 'wobble', 'fractions', 'shapes', 'patterns'].reduce((a, k) => a + x(k), 0);
    d.gsStory = (d.gsStory || 0) + (x('journeys') ? 1 : 0) + x('battleWins'); saveSetting('Daily_' + name, JSON.stringify(d)); } catch (e) { console.error('geoscout daily: ' + e.message); }
}
// 🔢 GeoScout 📖 Journey (gs-3): chapters are played in order; finishing one saves feat journeys (max) and gives Adventure miles the FIRST time only
function geoJourneyData_(players) { const f = featRows_(), out = {}; players.forEach(p => { out[p.Name] = f.filter(r => r.name === p.Name && r.game === 'geoscout' && r.stat === 'journeys').reduce((m, r) => Math.max(m, Number(r.value) || 0), 0); }); return out; }
function geoJourneyDone(name, chapter) {
  name = String(name || '').trim(); chapter = Math.floor(Number(chapter));
  if (!name || !(chapter >= 1 && chapter <= 6)) return { ok: false, err: 'bad chapter' };
  const before = featRows_().filter(r => r.name === name && r.game === 'geoscout' && r.stat === 'journeys').reduce((m, r) => Math.max(m, Number(r.value) || 0), 0);
  const first = chapter > before, miles = first ? 5 + chapter : 0;
  const feats = saveFeats(name, 'geoscout', { journeys: chapter, games: 1 });
  if (first) addMiles_(name, miles, 'GeoScout Journey chapter ' + chapter);
  return { ok: true, first: first, miles: miles, feats: feats };
}
function addMiles_(name, miles, reason) {
  const m = Math.floor(Number(miles)); if (!name || !m) return 0;
  let sh = ss_().getSheetByName(MILES_TAB);
  if (!sh) {
    sh = ss_().insertSheet(MILES_TAB);
    sh.getRange(1, 1, 1, MILES_HEADERS.length).setValues([MILES_HEADERS.map(h => h[0] + '\n' + h[1])]);
    try { sh.setFrozenRows(1); sh.getRange(1, 1, 1, MILES_HEADERS.length).setFontWeight('bold').setBackground('#FFF1C9').setWrap(true); MILES_HEADERS.forEach((h, i) => sh.getRange(1, i + 1).setNote(h[2])); sh.setColumnWidths(1, MILES_HEADERS.length, 150); } catch (e) {}
  }
  sh.appendRow([Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'), name, m, String(reason || '')]);
  MILES_MEMO_ = null;
  return m;
}
function itemLine_(id) { return ITEM_LINES.find(l => l.id === id); }
function itemMeta_() {
  return ITEM_LINES.map(l => ({ id: l.id, name: l.name, icon: l.icon, slot: l.slot, game: l.game, soon: l.soon || '', steps: l.steps, parts: l.parts || null, ways: l.ways.map(w => w.how), rides: l.rides ? RIDE_ONS.map(r => ({ id: r.id, name: r.name, icon: r.icon, miles: r.miles, special: r.special ? r.special.how : '', beast: !!r.beast, quest: r.quest ? r.quest.how : '', about: r.about || '' })) : null }));
}
// Everything the unlock rules look at, for one player (Progress, Scores and Feats are each read once per request).
function itemContext_(name, players) {
  const cleared = {}, best = {}, prog = progressRows_();
  let badges = 0;
  prog.forEach(r => { if (r.Name !== name) return; badges += String(r.Tokens || '').split(',').map(t => t.trim()).filter(Boolean).length; });
  ['maze'].concat(Object.keys(LEVEL_GAMES)).forEach(g => { cleared[g] = g === 'maze' ? mazeProgressFor_(name).unlocked : levelProgressFor_(name, g).unlocked; });
  const mini = {}, mp = miniProgressAll_([name])[name];
  Object.keys(mp).forEach(g => { mini[g] = mp[g].unlocked; });
  const days = {};
  scoreRows_().forEach(r => {
    if (r.name !== name) return;
    days[String(r.date).slice(0, 10)] = true;
    const b = best[r.game] = best[r.game] || { score: 0, time: 0 };
    if (r.score > b.score) b.score = r.score;
    if (r.timeSec > 0 && (!b.time || r.timeSec < b.time)) b.time = r.timeSec;
  });
  const f = featsFor_(name);
  let levels = 0, hards = 0, extremes = 0, hardcores = 0;
  Object.keys(cleared).forEach(g => { levels += Math.min(LEVEL_COUNT, cleared[g]); if (cleared[g] >= 4) hards++; if (cleared[g] >= 5) extremes++; if (cleared[g] >= 6) hardcores++; });
  const titles = Math.max(0, titlesFor_(name, players, f).length - 1);   // "Newcomer" doesn't count
  return { cleared: cleared, mini: mini, best: best, f: f, levels: levels, hards: hards, extremes: extremes, hardcores: hardcores, badges: badges, titles: titles, days: Object.keys(days).length };
}
function itemsFor_(name, players) {
  const x = itemContext_(name, players), out = {}, ways = {}, grants = grantsFor_(name);
  const mi = milesFor_(name, x); x.miles = mi.total; x.dailies = Math.floor((mi.from.daily || 0) / 3);   // ride-on ways look at x.miles (+ beast quests at x.dailies)
  ITEM_LINES.forEach(l => {
    const done = l.ways.map(w => { try { return !!w.r(x); } catch (e) { return false; } });
    out[l.id] = Math.min(l.steps.length, done.filter(Boolean).length + (l.rides || l.computed ? 0 : grants[l.id] || 0));
    ways[l.id] = done;
    if (l.rides) out.rides = done.map((d, i) => d ? i : -1).filter(i => i >= 0);   // which ride-ons (not just how many)
  });
  out.miles = mi.total; out.milesFrom = mi.from;
  out.beastQuests = RIDE_ONS.map((r, i) => { if (!r.beast) return -1; try { return r.quest.r(x) ? i : -1; } catch (e) { return -1; } }).filter(i => i >= 0);   // 🌟 beast quests done (miles shown apart)
  return { owned: out, ways: ways };
}
// My unlocks only (the Family Room refreshes these after activity).
function getMyItems(name) {
  const players = activePlayers_(listProfilesFull());
  if (!name || !players.some(p => p.Name === name)) return null;
  const it = itemsFor_(name, players);
  return { lines: itemMeta_(), owned: it.owned, ways: it.ways, seen: seenFor_(getSettings(), name) };
}
function seenFor_(st, name) { try { return JSON.parse(st['Seen_' + name] || '{}') || {}; } catch (e) { return {}; } }
// The Collection page: every line, what each player owns, and what I have already seen.
function getItemsData(player) {
  const players = activePlayers_(listProfilesFull()), st = getSettings(), owned = {};
  let ways = {};
  players.forEach(p => { const it = itemsFor_(p.Name, players); owned[p.Name] = it.owned; if (p.Name === player) ways = it.ways; });
  const made = {}; players.forEach(p => { made[p.Name] = creationsFor_(p.Name).map(c => ({ id: c.id, type: c.type, name: c.name, look: c.look, maker: c.maker, stars: c.stars, show: c.show })); });
  return { arts: (typeof artShelf_ === 'function' ? artShelf_(players) : {}), made: made, lines: itemMeta_(), owned: owned, ways: ways, seen: player ? seenFor_(st, player) : {}, players: players.map(p => ({ Name: p.Name, avatar: parseAvatar_(st['Avatar_' + p.Name]) })), player: player || '', settings: st };
}
function markItemsSeen(name, counts) {
  if (!name) return {};
  const clean = {};
  Object.keys(counts || {}).forEach(id => { const l = itemLine_(id), n = Math.floor(Number(counts[id])); if (l && n > 0) clean[id] = Math.min(n, l.steps.length); });
  saveSetting('Seen_' + name, JSON.stringify(clean));
  return clean;
}
// Small activity counters from the room / app (jumps, crawling, moves, archive visits, look changes).
function saveRoomStats(name, stats) {
  if (!name || !activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Pick a player first.');
  const clean = {};
  ['jumps', 'crawl', 'gestures'].forEach(k => { const n = Math.floor(Number((stats || {})[k])); if (n > 0) clean[k] = Math.min(n, 500); });
  if (!Object.keys(clean).length) return { newBadges: [], newTitles: [] };
  const date = today_(), d = dailyRoom_(getSettings(), name, date);
  Object.keys(clean).forEach(k => { d[k] = (d[k] || 0) + clean[k]; });
  saveSetting('Daily_' + name, JSON.stringify(d));
  return saveFeats(name, 'room', clean);
}


/* ---------- Wardrobe tab: extra evolution steps given by the daily treasures ---------- */
const WARDROBE_TAB = 'Wardrobe';
const WARDROBE_COL = { id: 0, name: 1, line: 2, steps: 3, source: 4, date: 5 };
const WARDROBE_HEADERS = [
  ['Grant ID', 'grantId', 'Player|Source — made by the app. Do not edit.'],
  ['Player', 'name', 'Name exactly as on the Profiles tab'],
  ['Item line', 'lineId', 'An ITEM_LINES id in Code.gs (explorer, sword, wings…)'],
  ['Steps', 'steps', 'How many evolution steps this gave (usually 1)'],
  ['Source', 'source', 'daily:yyyy-MM-dd:slot — which daily treasure'],
  ['Date', 'date', 'yyyy-MM-dd HH:mm'],
];
const WARDROBE_WIDTH = WARDROBE_HEADERS.length;
function wardrobeSheet_() {
  let sh = ss_().getSheetByName(WARDROBE_TAB);
  if (!sh) {
    sh = ss_().insertSheet(WARDROBE_TAB);
    sh.getRange(1, 1, 1, WARDROBE_WIDTH).setValues([WARDROBE_HEADERS.map(h => h[0] + '\n' + h[1])]);
    styleWardrobeSheet();
  }
  return sh;
}
// Look of the Wardrobe tab (sheet standard). Safe to re-run from the editor.
function styleWardrobeSheet() {
  const sh = ss_().getSheetByName(WARDROBE_TAB);
  if (!sh) return;
  try {
    const head = sh.getRange(1, 1, 1, WARDROBE_WIDTH);
    head.setValues([WARDROBE_HEADERS.map(h => '🔒 ' + h[0] + '\n' + h[1])])
      .setBackground('#00897B').setFontColor('#FFFFFF').setFontWeight('bold')
      .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
    head.setNotes([WARDROBE_HEADERS.map(h => h[2])]);
    sh.setRowHeight(1, 46); sh.setFrozenRows(1); sh.setFrozenColumns(2);
    sh.getRange(2, 1, sh.getMaxRows() - 1, WARDROBE_WIDTH).setNumberFormat('@').setFontSize(10).setVerticalAlignment('middle');
    [230, 130, 120, 70, 170, 140].forEach((w, i) => sh.setColumnWidth(i + 1, w));
    sh.getRange(2, 1, sh.getMaxRows() - 1, 1).setFontFamily('Roboto Mono').setFontColor('#757575');
    sh.getBandings().forEach(b => b.remove());
    sh.getRange(1, 1, sh.getMaxRows(), WARDROBE_WIDTH).applyRowBanding().setHeaderRowColor('#00897B').setFirstRowColor('#FFFFFF').setSecondRowColor('#E7F5F3');
    sh.getProtections(SpreadsheetApp.ProtectionType.SHEET)
      .filter(p => String(p.getDescription()).indexOf('🔒 STEAM Playground') === 0).forEach(p => p.remove());
    sh.protect().setDescription('🔒 STEAM Playground — Wardrobe (app managed)').setWarningOnly(true);
  } catch (e) {
    Logger.log('styleWardrobeSheet: ' + e.message);
  }
}
let WARDROBE_MEMO_ = null;
function wardrobeRows_() {
  if (WARDROBE_MEMO_ && WARDROBE_MEMO_.ss === ss_()) return WARDROBE_MEMO_.rows;
  const sh = ss_().getSheetByName(WARDROBE_TAB);
  let rows = [];
  if (sh && sh.getLastRow() > 1) {
    const C = WARDROBE_COL;
    rows = sh.getRange(2, 1, sh.getLastRow() - 1, WARDROBE_WIDTH).getValues()
      .map(r => ({ id: String(r[C.id]).trim(), name: String(r[C.name]), line: String(r[C.line]), steps: Number(r[C.steps]) || 0, source: String(r[C.source]) }))
      .filter(r => r.id);
  }
  WARDROBE_MEMO_ = { ss: ss_(), rows: rows };
  return rows;
}
function grantsFor_(name) { const out = {}; wardrobeRows_().forEach(r => { if (r.name === name && r.steps > 0) out[r.line] = (out[r.line] || 0) + r.steps; }); return out; }

/* ---------- Ghosts tab: each player's best ride per Turbo Trail level, replayed as a see-through car ---------- */
// One row per player + game + level (the best clear only). Data = the recorded ride (JSON), read
// only when someone races that ghost, so page boots stay small.
const GHOSTS_TAB = 'Ghosts';
const GHOSTS_COL = { id: 0, name: 1, game: 2, level: 3, track: 4, time: 5, score: 6, look: 7, date: 8, world: 9, data: 10 };
// Each world has its own Ghost track per level (6 worlds × 5 levels); the ride type tells an old row's world.
const GHOST_WORLDS = { car: 'roadtrip', rocket: 'space', bike: 'jungle', dragon: 'dragon', horse: 'horse', boat: 'ship' };
const GHOSTS_HEADERS = [
  ['Ghost ID', 'ghostId', 'Player|game|level|world — made by the app. Do not edit.'],
  ['Player', 'name', 'Name exactly as on the Profiles tab'],
  ['Game', 'gameId', 'turbo'],
  ['Level', 'level', '0 Basic · 1 Junior · 2 Intermediate · 3 Hard · 4 Extreme'],
  ['Track', 'track', 'The Ghost track number (same for everyone on a level)'],
  ['Time (s)', 'timeSec', 'Race time of this best ride, in seconds'],
  ['Score', 'score', 'Points in that race'],
  ['Ride', 'look', 'Ride + colour + sticker + trail (JSON)'],
  ['Saved', 'date', 'yyyy-MM-dd HH:mm'],
  ['World', 'world', 'roadtrip · space · jungle · dragon · horse · ship (each has its own Ghost track)'],
  ['Ride data', 'data', 'Where the ride was every 0.15 s (JSON) — app managed, very long'],
];
const GHOSTS_WIDTH = GHOSTS_HEADERS.length;
const GHOST_GAMES = ['turbo'];
function ghostsSheet_() {
  let sh = ss_().getSheetByName(GHOSTS_TAB);
  if (!sh) {
    sh = ss_().insertSheet(GHOSTS_TAB);
    sh.getRange(1, 1, 1, GHOSTS_WIDTH).setValues([GHOSTS_HEADERS.map(h => h[0] + '\n' + h[1])]);
    styleGhostsSheet();
  }
  return sh;
}
// Look of the Ghosts tab (sheet standard). Safe to re-run from the editor.
function styleGhostsSheet() {
  const sh = ss_().getSheetByName(GHOSTS_TAB);
  if (!sh) return;
  try {
    const head = sh.getRange(1, 1, 1, GHOSTS_WIDTH);
    head.setValues([GHOSTS_HEADERS.map(h => '🔒 ' + h[0] + '\n' + h[1])])
      .setBackground('#5E35B1').setFontColor('#FFFFFF').setFontWeight('bold')
      .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
    head.setNotes([GHOSTS_HEADERS.map(h => h[2])]);
    sh.setRowHeight(1, 46); sh.setFrozenRows(1); sh.setFrozenColumns(2);
    sh.getRange(2, 1, sh.getMaxRows() - 1, GHOSTS_WIDTH).setNumberFormat('@').setFontSize(10).setVerticalAlignment('middle').setWrap(false);
    [230, 120, 80, 60, 110, 80, 80, 200, 130, 100, 260].forEach((w, i) => sh.setColumnWidth(i + 1, w));
    sh.getRange(2, 1, sh.getMaxRows() - 1, 1).setFontFamily('Roboto Mono').setFontColor('#757575');
    sh.getRange(2, GHOSTS_COL.data + 1, sh.getMaxRows() - 1, 1).setFontColor('#9E9E9E');
    sh.getBandings().forEach(b => b.remove());
    sh.getRange(1, 1, sh.getMaxRows(), GHOSTS_WIDTH).applyRowBanding().setHeaderRowColor('#5E35B1').setFirstRowColor('#FFFFFF').setSecondRowColor('#EDE7F6');
    sh.getProtections(SpreadsheetApp.ProtectionType.SHEET)
      .filter(p => String(p.getDescription()).indexOf('🔒 STEAM Playground') === 0).forEach(p => p.remove());
    sh.protect().setDescription('🔒 STEAM Playground — Ghosts (app managed)').setWarningOnly(true);
  } catch (e) {
    Logger.log('styleGhostsSheet: ' + e.message);
  }
}
// Rows without the long ride data (for menus); withData reads it too (for a race).
function ghostRows_(withData) {
  const sh = ss_().getSheetByName(GHOSTS_TAB);
  if (!sh || sh.getLastRow() < 2) return [];
  const C = GHOSTS_COL, width = Math.min(sh.getLastColumn(), withData ? GHOSTS_WIDTH : GHOSTS_WIDTH - 1);
  return sh.getRange(2, 1, sh.getLastRow() - 1, Math.max(width, C.date + 1)).getValues().map((r, i) => {
    let look = {}; try { look = JSON.parse(r[C.look] || '{}'); } catch (e) {}
    let world = String(r[C.world] || ''), data = withData ? String(r[C.data] || '') : '';
    if (world.charAt(0) === '{') { if (withData) data = world; world = ''; }   // a row from before the World column
    if (!world) world = GHOST_WORLDS[look.ride] || 'roadtrip';
    const o = { row: i + 2, id: String(r[C.id]).trim(), name: String(r[C.name]), game: String(r[C.game]), level: Number(r[C.level]), track: String(r[C.track]), timeSec: Number(r[C.time]) || 0, score: Number(r[C.score]) || 0, look: look, world: world };
    if (withData) o.data = data;
    return o;
  }).filter(o => o.id && o.timeSec > 0);
}
function ghostSummaries_(gameId, players) {
  const names = {}; players.forEach(p => { names[p.Name] = true; });
  const out = {};
  ghostRows_(false).forEach(g => { if (g.game !== gameId || !names[g.name] || !(g.level >= 0 && g.level < LEVEL_COUNT)) return;
    const w = out[g.world] = out[g.world] || {}; (w[g.level] = w[g.level] || []).push({ name: g.name, timeSec: g.timeSec, score: g.score, look: g.look }); });
  Object.keys(out).forEach(w => Object.keys(out[w]).forEach(k => out[w][k].sort((a, b) => a.timeSec - b.timeSec)));
  return out;   // {world: {level: [fastest first]}}
}
// The recorded rides of the ghosts a player picked (up to 3).
function getGhostData(gameId, levelIndex, names, world) {
  if (GHOST_GAMES.indexOf(gameId) === -1) throw new Error('Unknown game.');
  const lvl = Number(levelIndex), want = {}; (names || []).slice(0, 3).forEach(n => { want[String(n)] = true; });
  world = String(world || 'roadtrip');
  return ghostRows_(true).filter(g => g.game === gameId && g.level === lvl && g.world === world && want[g.name])
    .map(g => ({ name: g.name, timeSec: g.timeSec, score: g.score, look: g.look, data: g.data }));
}
// Keeps a ride only when it is the player's fastest clear on that level.
function saveGhost(gameId, name, levelIndex, ghost) {
  if (GHOST_GAMES.indexOf(gameId) === -1) throw new Error('Unknown game.');
  const lvl = Number(levelIndex), g = ghost || {}, timeSec = Math.round(Number(g.timeSec) * 10) / 10, data = String(g.data || '');
  if (!name || !activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Unknown player.');
  if (!(lvl >= 0 && lvl < LEVEL_COUNT) || !(timeSec > 0) || data.length < 10 || data.length > 48000) throw new Error('Bad ghost.');
  try { const d = JSON.parse(data); if (!d || !Array.isArray(d.p)) throw new Error('x'); } catch (e) { throw new Error('Bad ghost.'); }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const world = String(g.world || ''), worlds = Object.keys(GHOST_WORLDS).map(k => GHOST_WORLDS[k]);
    if (worlds.indexOf(world) === -1) throw new Error('Bad ghost.');
    const sh = ghostsSheet_(), id = name + '|' + gameId + '|' + lvl + '|' + world, old = ghostRows_(false).filter(r => r.name === name && r.game === gameId && r.level === lvl && r.world === world)[0];
    if (old && old.timeSec <= timeSec) return { saved: false, best: old.timeSec };
    const look = g.look && typeof g.look === 'object' ? { ride: String(g.look.ride || '').slice(0, 20), col: Number(g.look.col) || 0, decal: Number(g.look.decal) || 0, trail: Number(g.look.trail) || 0 } : {};
    const row = [id, name, gameId, String(lvl), String(g.track || '').slice(0, 20), String(timeSec), String(Math.round(Number(g.score) || 0)), JSON.stringify(look),
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'), world, data];
    if (old) sh.getRange(old.row, 1, 1, GHOSTS_WIDTH).setValues([row]);
    else sh.getRange(sh.getLastRow() + 1, 1, 1, GHOSTS_WIDTH).setNumberFormat('@').setValues([row]);
    return { saved: true, first: !old, best: timeSec };
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Furniture Workshop + Design Show: things players build, use in My Room, give, and vote on ---------- */
// One row per creation. Look = the parts chosen (JSON, small); Owners = who has it (maker + gifts);
// Votes = {voter: 1-3 stars}; Stars = their total (kept in step). A deleted creation keeps its row (Deleted = yes).
const CREATIONS_TAB = 'Creations';
const CREATIONS_COL = { id: 0, maker: 1, type: 2, name: 3, look: 4, owners: 5, show: 6, votes: 7, stars: 8, made: 9, deleted: 10 };
const CREATIONS_HEADERS = [
  ['Creation ID', 'creationId', 'Made by the app. Do not edit.'],
  ['Maker', 'maker', 'Who built it (Profiles name)'],
  ['Type', 'type', 'chair · table · bed · desk · sofa · shelf · lamp · wardrobe'],
  ['Name', 'name', 'The name the maker gave it'],
  ['Look', 'look', 'Colours, pattern, parts, sticker (JSON)'],
  ['Owners', 'owners', 'Who has it, as a JSON list — the maker and anyone given a copy'],
  ['In the show', 'inShow', 'yes = shown in the Design Show for votes'],
  ['Votes', 'votes', 'JSON {voter: stars 1-3}'],
  ['Stars', 'stars', 'Total stars (kept up to date by the app)'],
  ['Made', 'made', 'yyyy-MM-dd HH:mm'],
  ['Deleted', 'deleted', 'yes = the maker removed it'],
];
const CREATIONS_WIDTH = CREATIONS_HEADERS.length;
// type: [floor size, choices per part, part with a "My drawing" choice (-1 = none)] — keep in step with AvatarKit CREATION_TYPES.
const CREATION_TYPES_ = { chair: [[1, 1], [4, 3, 5], 2], table: [[2, 2], [4, 3, 5], 2], bed: [[2, 2], [3, 5, 3], 1], desk: [[2, 1], [4, 2, 5], 2], sofa: [[2, 1], [3, 3, 3], 1], shelf: [[1, 1], [4, 3, 4], 0], lamp: [[1, 1], [3, 3, 4], 2], wardrobe: [[2, 1], [3, 3, 3], 1],
  nightstand: [[1, 1], [3, 3, 4], 1], coffeetable: [[2, 1], [3, 3, 4], 2], media: [[2, 1], [3, 3, 4], 1], clock: [[1, 1], [3, 3, 3], 1], mirror: [[1, 1], [3, 4, 3], 1], painting: [[1, 1], [4, 3, 3], -1], curtain: [[1, 1], [3, 3, 3], 1], valet: [[1, 1], [3, 4, 3], 1] };
// Where it goes in My Room (same rules as AvatarKit crPlace): wall spots 0-5, the window (6) for curtains, or the floor.
function placeOf_(type, look) {
  const p = (look && look.parts) || [];
  if (type === 'painting' || (type === 'clock' && p[0] === 0) || (type === 'mirror' && p[0] === 0)) return { wall: true };
  if (type === 'curtain') return { wall: true, window: true };
  if (type === 'mirror' && p[0] === 2) return { fp: [2, 1] };
  return { fp: CREATION_TYPES_[type][0] };
}
const WALL_SPOTS = 7;
const CREATIONS_PER_PLAYER = 24;
function creationsSheet_() {
  let sh = ss_().getSheetByName(CREATIONS_TAB);
  if (!sh) {
    sh = ss_().insertSheet(CREATIONS_TAB);
    sh.getRange(1, 1, 1, CREATIONS_WIDTH).setValues([CREATIONS_HEADERS.map(h => h[0] + '\n' + h[1])]);
    styleCreationsSheet();
  }
  return sh;
}
// Look of the Creations tab (sheet standard). Safe to re-run from the editor.
function styleCreationsSheet() {
  const sh = ss_().getSheetByName(CREATIONS_TAB);
  if (!sh) return;
  try {
    const head = sh.getRange(1, 1, 1, CREATIONS_WIDTH);
    head.setValues([CREATIONS_HEADERS.map(h => '🔒 ' + h[0] + '\n' + h[1])])
      .setBackground('#C2410C').setFontColor('#FFFFFF').setFontWeight('bold')
      .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
    head.setNotes([CREATIONS_HEADERS.map(h => h[2])]);
    sh.setRowHeight(1, 46); sh.setFrozenRows(1); sh.setFrozenColumns(2);
    sh.getRange(2, 1, sh.getMaxRows() - 1, CREATIONS_WIDTH).setNumberFormat('@').setFontSize(10).setVerticalAlignment('middle').setWrap(false);
    [150, 110, 80, 140, 220, 160, 70, 180, 60, 130, 70].forEach((w, i) => sh.setColumnWidth(i + 1, w));
    sh.getRange(2, 1, sh.getMaxRows() - 1, 1).setFontFamily('Roboto Mono').setFontColor('#757575');
    sh.getBandings().forEach(b => b.remove());
    sh.getRange(1, 1, sh.getMaxRows(), CREATIONS_WIDTH).applyRowBanding().setHeaderRowColor('#C2410C').setFirstRowColor('#FFFFFF').setSecondRowColor('#FFF1E6');
    sh.getProtections(SpreadsheetApp.ProtectionType.SHEET)
      .filter(p => String(p.getDescription()).indexOf('🔒 STEAM Playground') === 0).forEach(p => p.remove());
    sh.protect().setDescription('🔒 STEAM Playground — Creations (app managed)').setWarningOnly(true);
  } catch (e) {
    Logger.log('styleCreationsSheet: ' + e.message);
  }
}
let CREATIONS_MEMO_ = null;
function creationRows_() {
  if (CREATIONS_MEMO_ && CREATIONS_MEMO_.ss === ss_()) return CREATIONS_MEMO_.rows;
  const sh = ss_().getSheetByName(CREATIONS_TAB), C = CREATIONS_COL;
  let rows = [];
  if (sh && sh.getLastRow() > 1) {
    rows = sh.getRange(2, 1, sh.getLastRow() - 1, CREATIONS_WIDTH).getValues().map((r, i) => {
      const j = (v, f) => { try { const x = JSON.parse(v || ''); return x == null ? f : x; } catch (e) { return f; } };
      return { row: i + 2, id: String(r[C.id]).trim(), maker: String(r[C.maker]), type: String(r[C.type]), name: String(r[C.name]), look: j(r[C.look], {}), owners: j(r[C.owners], []),
        show: String(r[C.show]).toLowerCase() === 'yes', votes: j(r[C.votes], {}), stars: Number(r[C.stars]) || 0, made: String(r[C.made]), deleted: String(r[C.deleted]).toLowerCase() === 'yes' };
    }).filter(c => c.id && !c.deleted && CREATION_TYPES_[c.type]);
  }
  CREATIONS_MEMO_ = { ss: ss_(), rows: rows };
  return rows;
}
function writeCreation_(c) {
  const sh = creationsSheet_(), row = [c.id, c.maker, c.type, c.name, JSON.stringify(c.look), JSON.stringify(c.owners), c.show ? 'yes' : '', JSON.stringify(c.votes || {}), String(c.stars || 0), c.made, c.deleted ? 'yes' : ''];
  if (c.row) sh.getRange(c.row, 1, 1, CREATIONS_WIDTH).setValues([row]);
  else { const r = sh.getLastRow() + 1; sh.getRange(r, 1, 1, CREATIONS_WIDTH).setNumberFormat('@').setValues([row]); c.row = r; }
  CREATIONS_MEMO_ = null;
}
function cleanLook_(type, look) {
  look = look || {}; const T = CREATION_TYPES_[type], n = (v, m) => Math.max(0, Math.min(m - 1, Math.floor(Number(v)) || 0));
  const mask = /^[0-9a-f]{144}$/.test(String(look.mask || '')) && T[2] >= 0 ? String(look.mask) : '';       // Part Printer drawing (24 × 24)
  const pix = type === 'painting' && /^[0-9a-f]{2304}$/.test(String(look.pix || '')) ? String(look.pix) : '';  // painting (48 × 48, 16 colours)
  const out = { col: n(look.col, 12), acc: n(look.acc, 12), pat: n(look.pat, 6), parts: T[1].map((m, i) => n((look.parts || [])[i], m + (i === T[2] && mask ? 1 : 0))), stk: n(look.stk, 12) };
  if (mask) out.mask = mask; if (pix) { out.pix = pix; if (look.upl) out.upl = 1; }
  return out;
}
function publicCreation_(c, viewer) {
  return { id: c.id, maker: c.maker, type: c.type, name: c.name, look: c.look, owners: c.owners, show: c.show, stars: c.stars, votes: Object.keys(c.votes || {}).length, myVote: viewer ? (c.votes || {})[viewer] || 0 : 0, made: c.made };
}
function creationsFor_(name) { return creationRows_().filter(c => c.owners.indexOf(name) !== -1); }
function checkPlayer_(name) { if (!name || !activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Pick a player first.'); }
// Boot for the Workshop page.
function getWorkshopData(player) {
  const players = activePlayers_(listProfilesFull()), st = getSettings();
  return { players: players.map(p => ({ Name: p.Name, Age: p.Age || '' })), avatars: players.reduce((m, p) => { m[p.Name] = parseAvatar_(st['Avatar_' + p.Name]); return m; }, {}),
    settings: st, player: player || '', creations: creationRows_().filter(c => players.some(p => p.Name === c.maker)).map(c => publicCreation_(c, player)),
    giftsLeft: player ? giftsLeft_(st, player) : 0 };
}
// Build something new, or change one you made.
function saveCreation(name, creation) {
  checkPlayer_(name);
  const c = creation || {}, type = String(c.type || '');
  if (!CREATION_TYPES_[type]) throw new Error('Pick something to build.');
  const title = String(c.name || '').replace(/[<>]/g, '').trim().slice(0, 24) || 'My ' + type;
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    let row = c.id ? creationRows_().find(x => x.id === String(c.id)) : null;
    if (row && row.maker !== name) throw new Error('Only ' + row.maker + ' can change this one.');
    if (!row) {
      if (creationRows_().filter(x => x.maker === name).length >= CREATIONS_PER_PLAYER) throw new Error('Your workshop is full (' + CREATIONS_PER_PLAYER + ' things) — remove one first.');
      row = { id: 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36), maker: name, owners: [name], votes: {}, stars: 0, show: false, made: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') };
      safeRecordFeats_(name, 'workshop', { made: 1 });
      const dd = dailyRoom_(getSettings(), name, today_()); dd.built = (dd.built || 0) + 1; saveSetting('Daily_' + name, JSON.stringify(dd));
    }
    row.type = type; row.name = title; row.look = cleanLook_(type, c.look);
    if (typeof c.show === 'boolean') row.show = c.show;
    writeCreation_(row);
    return publicCreation_(row, name);
  } finally { lock.releaseLock(); }
}
function deleteCreation(name, id) {
  checkPlayer_(name);
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const row = creationRows_().find(x => x.id === String(id));
    if (!row) return { ok: true };
    if (row.maker !== name) throw new Error('Only ' + row.maker + ' can remove this one.');
    row.deleted = true; writeCreation_(row);
    return { ok: true };
  } finally { lock.releaseLock(); }
}
// Design Show: put it in / take it out (maker), and votes (1-3 stars, not your own, 0 takes the vote back).
function setInShow(name, id, on) {
  checkPlayer_(name);
  const row = creationRows_().find(x => x.id === String(id));
  if (!row || row.maker !== name) throw new Error('Only the maker can enter it in the show.');
  row.show = !!on; writeCreation_(row);
  return publicCreation_(row, name);
}
function voteCreation(voter, id, stars) {
  checkPlayer_(voter);
  const n = Math.max(0, Math.min(3, Math.floor(Number(stars)) || 0));
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const row = creationRows_().find(x => x.id === String(id));
    if (!row || !row.show) throw new Error('That one is not in the show.');
    if (row.maker === voter) throw new Error('You can\'t vote for your own — ask the family! 😊');
    const first = !row.votes[voter];
    if (n) row.votes[voter] = n; else delete row.votes[voter];
    row.stars = Object.keys(row.votes).reduce((s, k) => s + (Number(row.votes[k]) || 0), 0);
    writeCreation_(row);
    if (first && n) safeRecordFeats_(voter, 'workshop', { votes: 1 });
    safeRecordFeats_(row.maker, 'workshop', { topStars: row.stars });
    return publicCreation_(row, voter);
  } finally { lock.releaseLock(); }
}
// Give a copy to someone in the family: it arrives as a gift in their My Room (counts toward today's gifts).
function giveCreation(from, to, id) {
  checkPlayer_(from); checkPlayer_(to);
  if (from === to) throw new Error('Give it to someone else 🙂');
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const st = getSettings(), row = creationRows_().find(x => x.id === String(id));
    if (!row || row.owners.indexOf(from) === -1) throw new Error('You don\'t have that one.');
    if (row.owners.indexOf(to) !== -1) throw new Error(to + ' already has it!');
    if (giftsLeft_(st, from) <= 0) throw new Error('That\'s ' + GIFTS_PER_DAY + ' gifts today — more tomorrow! 💝');
    row.owners.push(to); writeCreation_(row);
    const list = jsonSetting_(st, 'Gifts_' + to, []);
    list.push({ id: String(Date.now()) + Math.floor(Math.random() * 1000), from: from, kind: 'creation', label: row.name, at: Date.now(), opened: false });
    while (list.length > 30) { const i = list.findIndex(g => g.opened); list.splice(i >= 0 ? i : 0, 1); }
    const d = dailyRoom_(st, from, today_()); d.giftsSent = (d.giftsSent || 0) + 1;
    saveSettings({ ['Gifts_' + to]: JSON.stringify(list), ['Daily_' + from]: JSON.stringify(d) });
    safeRecordFeats_(from, 'room', { gifts: 1 }); safeRecordFeats_(to, 'room', { received: 1 }); safeRecordFeats_(from, 'workshop', { given: 1 });
    return { ok: true, left: GIFTS_PER_DAY - d.giftsSent, creation: publicCreation_(row, from) };
  } finally { lock.releaseLock(); }
}

/* ---------- Daily treasures: 3 items a day (same for the whole family), each with a goal for today ---------- */
const MINI_IDS_ = ['color-match', 'count-match', 'code-robot', 'trash-pointer'];
const DAILY_GOALS = [
  { id: 'tdstory', icon: '🏰', how: 'Win a TD-Stories chapter today (any level)', r: d => d.rows.some(r => r.game === 'td-draprincess' && r.stars > 0) },
  { id: 'gssolve', icon: '🔢', how: 'Solve 8 GeoScout puzzles today', r: d => (d.room.gsSolved || 0) >= 8 },
  { id: 'gsstory', icon: '📖', how: 'Play a GeoScout Journey chapter or win a Tower battle today', r: d => (d.room.gsStory || 0) >= 1 },
  { id: 'grwords', icon: '🔤', how: 'Read or build 6 words in GeoRead today', r: d => (d.room.grWords || 0) >= 6 },
  { id: 'grstory', icon: '📖', how: 'Read a GeoRead story or an Alphabet Road chapter today', r: d => (d.room.grStory || 0) >= 1 },
  { id: 'wdcards', icon: '🃏', how: 'Win 5 WisDeck cards today', r: d => (d.room.wdCards || 0) >= 5 },
  { id: 'wddaily', icon: '📅', how: 'Play today\'s WisDeck daily deck', r: d => !!d.room.wdDaily },
  { id: 'ebrrow', icon: '👀', how: '3 perfect rounds in a row in Eyes Brain Riot today', r: d => (d.room.ebrRow || 0) >= 3 },
  { id: 'ebrlen', icon: '🏔️', how: 'Remember 10 digits in an Eyes Brain Riot 🏔️ Challenge today', r: d => (d.room.ebrLen || 0) >= 10 },
  { id: 'ppcatch', icon: '🪤', how: 'Catch 3 creatures in Polyplot today', r: d => (d.room.ppCatch || 0) >= 3 },
  { id: 'ppchain', icon: '🔗', how: 'Close 5 shapes in one turn in Polyplot today', r: d => (d.room.ppChain || 0) >= 5 },
  { id: 'sbblocks', icon: '💣', how: 'Break 100 blocks in Soul Bopper today', r: d => (d.room.sbBlocks || 0) >= 100 },
  { id: 'sbmulti', icon: '🎯', how: 'Catch 2 with one pop in Soul Bopper today', r: d => (d.room.sbMulti || 0) >= 1 },
  { id: 'sbhits', icon: '🏏', how: 'Hit 5 bombs with 🤾🏏 in Soul Bopper today', r: d => (d.room.sbHits || 0) >= 5 },
  { id: 'anylevel', icon: '🎮', how: 'Finish any level today', r: d => d.rows.length > 0 },
  { id: 'hard', icon: '⚡', how: 'Play a Hard or Extreme level today', r: d => d.rows.some(r => MINI_IDS_.indexOf(r.game) === -1 && r.level >= 3) },
  { id: 'maze', icon: '🧭', how: 'Finish a Maze today', r: d => d.rows.some(r => r.game === 'maze') },
  { id: 'pinball', icon: '🎯', how: 'Score 30,000 in one Pinball game today', r: d => d.rows.some(r => r.game === 'pinball' && r.score >= 30000) },
  { id: 'hopper', icon: '🐸', how: 'Score 800 in one Dodgy Hopper game today', r: d => d.rows.some(r => r.game === 'hopper' && r.score >= 800) },
  { id: 'turbo', icon: '🏎️', how: 'Finish a Turbo Trail race today', r: d => d.rows.some(r => r.game === 'turbo' && r.stars > 0) },
  { id: 'math', icon: '🧮', how: 'Pass a Math Quest level today', r: d => d.rows.some(r => r.game === 'math-quest' && r.stars > 0) },
  { id: 'memory', icon: '🃏', how: 'Finish a Memory Match board today', r: d => d.rows.some(r => r.game === 'memory' && r.stars > 0) },
  { id: 'build', icon: '🔨', how: 'Build something in the Furniture Workshop today', r: d => (d.room.built || 0) >= 1 },
  { id: 'board', icon: '♟️', how: 'Beat the bot in Checkers or Chess today', r: d => d.rows.some(r => r.game === 'checkers' || r.game === 'chess') },
  { id: 'brawl', icon: '🥊', how: 'Win 2 brawls in Brawl Buddies today', r: d => d.rows.filter(r => r.game === 'brawl-buddies' && r.stars > 0).length >= 2 },
  { id: 'sci', icon: '🔬', how: 'Run a science test in Sciencetory today', r: d => d.rows.some(r => r.game === 'sciencetory') },
  { id: 'poke', icon: '🔍', how: 'Solve a Pokadif case today', r: d => d.rows.some(r => r.game === 'pokadif' && r.stars > 0) },
  { id: 'pyra', icon: '🔥', how: 'Win a PyraDive volleyball match today', r: d => d.rows.some(r => r.game === 'pyraspike' && r.stars > 0) },
  { id: 'brawenture', icon: '🗺️', how: 'Finish a Brawenture tale today (any difficulty)', r: d => d.rows.some(r => r.game === 'brawenture' && r.stars > 0) },
  { id: 'three', icon: '🌈', how: 'Play 3 different games today', r: d => Object.keys(d.rows.reduce((m, r) => { m[r.game] = 1; return m; }, {})).length >= 3 },
  { id: 'stack', icon: '🏗️', how: 'Finish a Stack It! level today', r: d => d.rows.some(r => r.game === 'stacking-sim') },
  { id: 'robot', icon: '🤖', how: 'Finish a Code the Robot level today', r: d => d.rows.some(r => r.game === 'robot-adventure') },
  { id: 'mini', icon: '🎨', how: 'Clear a mini game stage today', r: d => d.rows.some(r => MINI_IDS_.indexOf(r.game) !== -1) },
  { id: 'stars', icon: '⭐', how: 'Get 3 stars on any level today', r: d => d.rows.some(r => r.stars >= 3) },
  { id: 'jumps', icon: '🦘', how: 'Jump 20 times in the Family Room today', r: d => (d.room.jumps || 0) >= 20 },
  { id: 'moves', icon: '💃', how: 'Do 10 moves in the Family Room today', r: d => (d.room.gestures || 0) >= 10 },
  { id: 'slabrall', icon: '🏓', how: 'Win a SlaBrall match on Junior or harder today', r: d => d.rows.some(r => r.game === 'sla-brall' && r.level >= 1 && r.stars > 0) },
  { id: 'blasoff', icon: '⚽', how: 'Win a BlasOff match today', r: d => d.rows.some(r => r.game === 'blasoff' && r.stars > 0) },   // ⚽ bo-1
  { id: 'snakefood', icon: '🐍', how: 'Eat 50 food in Snakize today', r: d => (d.room.snakeFood || 0) >= 50 },
  { id: 'snakeland', icon: '🏰', how: 'Claim 40 % land in one Snakastle game today', r: d => (d.room.snakeLand || 0) >= 40 },
  { id: 'snakepop', icon: '💥', how: 'Pop 2 snakes in Snakigate today', r: d => (d.room.snakePop || 0) >= 2 },
  { id: 'alignext', icon: '🔴', how: 'Win an Alignext game (Drop or Omnifile) today', r: d => d.rows.some(r => (r.game === 'alignext' || r.game === 'omnifile') && r.stars > 0) },
  { id: 'poseparty', icon: '📷', how: 'Pass a Pose Party level today', r: d => d.rows.some(r => r.game === 'pose-party' && r.stars > 0) },
];
function today_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
// Picks the same 3 lines + 3 goals for everyone on a given date (any new line added to ITEM_LINES joins the rotation).
function dailyPicks_(date) {
  let seed = hash_(date);
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const lines = ITEM_LINES.filter(l => !l.rides && !l.computed).map(l => l.id), goals = DAILY_GOALS.map(g => g.id), out = [];
  for (let i = 0; i < 3; i++) {
    const li = lines.splice(Math.floor(next() * lines.length), 1)[0], gi = goals.splice(Math.floor(next() * goals.length), 1)[0];
    out.push({ slot: i, line: li, goal: gi });
  }
  return out;
}
function hash_(s) { let h = 2166136261; String(s).split('').forEach(ch => { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }); return h >>> 0; }
function dailyRoom_(st, name, date) { try { const d = JSON.parse(st['Daily_' + name] || '{}'); return d.date === date ? d : { date: date }; } catch (e) { return { date: date }; } }
function dailyFor_(name, players, date) {
  date = date || today_();
  const st = getSettings(), rows = scoreRows_().filter(r => r.name === name && String(r.date).slice(0, 10) === date);
  const d = { rows: rows, room: dailyRoom_(st, name, date) };
  const owned = name ? itemsFor_(name, players).owned : {};
  const claimed = {};
  wardrobeRows_().forEach(r => { if (r.name === name && r.source.indexOf('daily:' + date + ':') === 0) claimed[r.source.split(':')[2]] = true; });
  return dailyPicks_(date).map(p => {
    const l = itemLine_(p.line), g = DAILY_GOALS.find(x => x.id === p.goal), have = owned[p.line] || 0;
    let done = false; try { done = !!g.r(d); } catch (e) {}
    return { slot: p.slot, line: p.line, name: l.name, icon: l.icon, slotType: l.slot, steps: l.steps.length, have: have, nextStep: have < l.steps.length ? l.steps[have] : '',
      goal: g.how, goalIcon: g.icon, done: done, claimed: !!claimed[p.slot], full: have >= l.steps.length };
  });
}
// The Dashboard card: today's 3 treasures for the chosen player.
function getDailyData(player) {
  const players = activePlayers_(listProfilesFull());
  const p = players.find(x => x.Name === player);
  return { date: today_(), picks: dailyFor_(p ? p.Name : '', players), player: p ? p.Name : '', avatar: p ? parseAvatar_(getSettings()['Avatar_' + p.Name]) : null };
}
// 🕹️ sk-1 a 🎁 joystick-skin pickup in a game (e.g. a Brawl floor capsule): +1 step on the first joystick line that isn't full, at most 1 per game per day (3 a day in all).
function grantJoySkin(name, game) {
  const players = activePlayers_(listProfilesFull());
  if (!name || !players.some(p => p.Name === name)) throw new Error('Pick a player first.');
  game = String(game || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30) || 'game';
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    WARDROBE_MEMO_ = null;
    const date = today_(), mine = wardrobeRows_().filter(r => r.name === name && r.source.indexOf('pickup:') === 0 && r.source.slice(-10) === date);
    const own0 = itemsFor_(name, players).owned, l = ['joyskin', 'joyskin2', 'joyskin3'].map(itemLine_).find(x => (own0[x.id] || 0) < x.steps.length);
    if (!l) return { got: false, full: true, have: 24, why: 'You have every joystick skin ⭐' };
    const have0 = own0[l.id] || 0;
    if (mine.some(r => r.source === 'pickup:' + game + ':' + date) || mine.length >= 3) return { got: false, have: have0, why: 'One joystick capsule per game per day — come back tomorrow!' };
    const sh = wardrobeSheet_(), stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'), source = 'pickup:' + game + ':' + date;
    sh.getRange(Math.max(1, sh.getLastRow()) + 1, 1, 1, WARDROBE_WIDTH).setNumberFormat('@').setValues([[name + '|' + source, name, l.id, '1', source, stamp]]);
    WARDROBE_MEMO_ = null;
    const have = itemsFor_(name, players).owned[l.id] || 0, off = { joyskin: 0, joyskin2: 8, joyskin3: 16 }[l.id];
    return { got: have > have0, line: l.id, have: have, v: off + have - 1, step: l.steps[have - 1], full: have >= l.steps.length };   // v = index in JoySkins.LIST
  } finally { lock.releaseLock(); }
}
// Claim one: the goal must be done today and not claimed yet → +1 evolution step on that line.
function claimDaily(name, slot) {
  const players = activePlayers_(listProfilesFull());
  if (!name || !players.some(p => p.Name === name)) throw new Error('Pick a player first.');
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    WARDROBE_MEMO_ = null;
    const date = today_(), pick = dailyFor_(name, players, date).find(x => x.slot === Number(slot));
    if (!pick) throw new Error('No such treasure today.');
    if (pick.claimed) throw new Error('Already claimed today 🙂');
    if (!pick.done) throw new Error('Not yet — ' + pick.goal + '!');
    if (pick.full) throw new Error('You already have every step of ' + pick.name + ' ⭐');
    const sh = wardrobeSheet_(), stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
    const source = 'daily:' + date + ':' + pick.slot, at = Math.max(1, sh.getLastRow()) + 1;
    sh.getRange(at, 1, 1, WARDROBE_WIDTH).setNumberFormat('@').setValues([[name + '|' + source, name, pick.line, '1', source, stamp]]);
    WARDROBE_MEMO_ = null;
    const it = itemsFor_(name, players);
    return { line: pick.line, name: pick.name, icon: pick.icon, have: it.owned[pick.line], step: itemLine_(pick.line).steps[it.owned[pick.line] - 1], picks: dailyFor_(name, players, date) };
  } finally { lock.releaseLock(); }
}

/* ---------- player PINs (protect each player's avatar, wardrobe and room) ---------- */
function pinHash_(name, pin) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'steam-playground|' + name + '|' + pin, Utilities.Charset.UTF_8);
  return Utilities.base64Encode(bytes);
}
function hasPlayerPin_(name) { return !!getSettings()['PlayerPIN_' + name]; }
/* ===== 💥 ck-1b 📚 Comic Book: one row per comic (a page recipe, names only, ~2 KB) · 👍 votes · 🏅 Comic of the day ===== */
// Pages come from 🎨 Make my comic (Collection, needs the player's PIN) and later from games (Comic.save, no PIN, max 20 a day per player).
const COMICS_TAB = 'Comics';
const COMICS_HEADERS = [
  ['Id', 'id', 'c + time + random (never reused)'],
  ['Player', 'player', 'whose book it goes in'],
  ['Game', 'game', 'game id, or "maker" = 🎨 Make my comic'],
  ['Title', 'title', 'cover title'],
  ['Page', 'page', 'JSON page recipe (layout, panels, words) — player NAMES only, pictures are drawn from today\'s avatars'],
  ['Votes', 'votes', 'JSON ["Name|yyyy-MM-dd", …] — one 👍 per player per day'],
  ['Made', 'made', 'yyyy-MM-dd HH:mm'],
  ['Deleted', 'deleted', '"yes" = removed by the maker (kept for history)']
];
const COMICS_WIDTH = COMICS_HEADERS.length, COMIC_MAX_CHARS_ = 6000, COMIC_DAY_LIMIT_ = 20;
function comicsSheet_(create) {
  let sh = ss_().getSheetByName(COMICS_TAB);
  if (!sh && create) { sh = ss_().insertSheet(COMICS_TAB); sh.getRange(1, 1, 1, COMICS_WIDTH).setValues([COMICS_HEADERS.map(h => h[0] + '\n' + h[1])]); styleComicsSheet(); }
  return sh;
}
// Look of the Comics tab (sheet standard). Safe to re-run from the editor.
function styleComicsSheet() {
  const sh = ss_().getSheetByName(COMICS_TAB); if (!sh) return;
  try {
    const head = sh.getRange(1, 1, 1, COMICS_WIDTH);
    head.setValues([COMICS_HEADERS.map(h => '🔒 ' + h[0] + '\n' + h[1])]).setBackground('#E63946').setFontColor('#FFFFFF').setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
    head.setNotes([COMICS_HEADERS.map(h => h[2])]);
    sh.setRowHeight(1, 46); sh.setFrozenRows(1); sh.setFrozenColumns(2);
    sh.getRange(2, 1, Math.max(1, sh.getMaxRows() - 1), COMICS_WIDTH).setNumberFormat('@').setFontSize(10).setVerticalAlignment('middle');
    [150, 110, 100, 160, 420, 200, 130, 80].forEach((w, i) => sh.setColumnWidth(i + 1, w));
    sh.getRange(2, 1, Math.max(1, sh.getMaxRows() - 1), 1).setFontFamily('Roboto Mono').setFontColor('#757575');
  } catch (e) {}
}
function comicRows_() {
  const sh = comicsSheet_(false); if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, COMICS_WIDTH).getValues().map((r, i) => ({ row: i + 2, id: String(r[0]), player: String(r[1]), game: String(r[2]), title: String(r[3]), page: String(r[4]), votes: String(r[5] || '[]'), made: String(r[6]), deleted: String(r[7]) === 'yes' }));
}
// a page recipe from the browser → a safe, small JSON (only known fields, short texts, names instead of avatars)
function cleanComicPage_(p) {
  if (!p || typeof p !== 'object' || !Array.isArray(p.panels)) throw new Error('That comic page is empty.');
  const key = v => /^[a-z0-9][a-z0-9._-]{0,40}$/i.test(String(v || '')) ? String(v) : '', txt = (v, n) => String(v == null ? '' : v).replace(/[<>]/g, '').slice(0, n || 120);
  const who = v => (v === 0 || v === 1 || v === 2 || v === 3) ? v : undefined;
  const out = { layout: key(p.layout) || 'slash3', mood: key(p.mood), title: txt(p.title, 60), key: key(p.key), variant: Math.max(0, Math.min(9, Number(p.variant) || 0)),
    players: (Array.isArray(p.players) ? p.players : []).slice(0, 4).map(x => txt(x && typeof x === 'object' ? x.name : x, 30)), panels: [] };
  if (Array.isArray(p.crowd)) out.crowd = p.crowd.slice(0, 3).map(x => txt(x && typeof x === 'object' ? x.name : x, 30));
  p.panels.slice(0, 5).forEach(q => {
    if (!q || typeof q !== 'object') return; const P = {};
    if (who(q.who) !== undefined) P.who = q.who; if (who(q.who2) !== undefined) P.who2 = q.who2;
    ['act', 'act2', 'pose', 'face', 'face2', 'cam', 'mood'].forEach(f => { if (key(q[f])) P[f] = key(q[f]); });
    ['lines', 'tricks', 'marks'].forEach(f => { if (Array.isArray(q[f])) P[f] = q[f].map(key).filter(Boolean).slice(0, 4); });
    if (q.sfx && q.sfx.text) P.sfx = { text: txt(q.sfx.text, 24), style: key(q.sfx.style) || 'impact' };
    if (q.bub && q.bub.text) P.bub = { text: txt(q.bub.text, 120), kind: key(q.bub.kind) || 'speech' };
    if (q.cap) P.cap = txt(q.cap, 80); if (q.sign) P.sign = txt(q.sign, 30);
    if (q.sepia) P.sepia = true; if (q.crowd) P.crowd = true; if (q.dir === -1) P.dir = -1;
    out.panels.push(P);
  });
  if (!out.panels.length) throw new Error('That comic page is empty.');
  const s = JSON.stringify(out); if (s.length > COMIC_MAX_CHARS_) throw new Error('That comic is too long.'); return s;
}
// 💾 save a comic into a player's book. game = 'maker' (needs the PIN) or the game id that made it.
function saveComic(name, page, pin, game) {
  if (!name || !activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Pick a player first.');
  game = String(game || 'maker').replace(/[^a-z0-9_-]/gi, '').slice(0, 30) || 'maker';
  if (game === 'maker') checkPlayerPin_(name, pin);
  const json = cleanComicPage_(page), lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const rows = comicRows_(), today = today_();
    if (rows.filter(r => r.player === name && r.made.slice(0, 10) === today && !r.deleted).length >= COMIC_DAY_LIMIT_) throw new Error('The book is full for today — come back tomorrow!');
    const id = 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36), title = (JSON.parse(json).title || '').slice(0, 60);
    comicsSheet_(true).appendRow([id, name, game, title, json, '[]', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'), '']);
    return { id: id, issue: rows.filter(r => r.player === name && !r.deleted).length + 1 };
  } finally { lock.releaseLock(); }
}
function comicVotes_(r) { try { const v = JSON.parse(r.votes || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
// 🏅 Comic of the day: most 👍 given today; no votes yet → the newest comic made today; none today → null
function comicOfDay_(rows, date) {
  const live = rows.filter(r => !r.deleted); if (!live.length) return null;
  const today = (r) => comicVotes_(r).filter(v => String(v).split('|')[1] === date).length;
  const voted = live.filter(r => today(r) > 0).sort((a, b) => today(b) - today(a) || (a.made < b.made ? 1 : -1));
  if (voted.length) return voted[0];
  const made = live.filter(r => r.made.slice(0, 10) === date).sort((a, b) => a.made < b.made ? 1 : -1);
  return made[0] || null;
}
function comicOut_(r, issues) { let page = null; try { page = JSON.parse(r.page); } catch (e) {} return { id: r.id, player: r.player, game: r.game, title: r.title, page: page, votes: comicVotes_(r).length, today: comicVotes_(r).filter(v => String(v).split('|')[1] === today_()).length, voters: comicVotes_(r).map(v => String(v).split('|')[0]), made: r.made, issue: issues[r.id] || 0 }; }
// 📚 everyone's books (newest first, last 300) + who voted today + the Comic of the day
function getComicBook() {
  const rows = comicRows_(), issues = {}, n = {};
  rows.filter(r => !r.deleted).forEach(r => { n[r.player] = (n[r.player] || 0) + 1; issues[r.id] = n[r.player]; });
  const date = today_(), cotd = comicOfDay_(rows, date), votedToday = {};
  rows.forEach(r => comicVotes_(r).forEach(v => { const [who, d] = String(v).split('|'); if (d === date) votedToday[who] = r.id; }));
  return { comics: rows.filter(r => !r.deleted).slice(-300).reverse().map(r => comicOut_(r, issues)), cotd: cotd ? cotd.id : '', votedToday: votedToday, today: date };
}
// 👍 one vote per player per day (not on your own comic); voting again the same day moves your 👍
function voteComic(name, id, pin) {
  checkPlayerPin_(name, pin);
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const rows = comicRows_(), r = rows.find(x => x.id === String(id) && !x.deleted); if (!r) throw new Error('That comic is gone.');
    if (r.player === name) throw new Error('OWN: Ask the family to vote for yours!');
    const date = today_(), sh = comicsSheet_(false), tag = name + '|' + date;
    rows.forEach(x => { const v = comicVotes_(x); if (v.indexOf(tag) >= 0 && x.id !== r.id) sh.getRange(x.row, 6).setValue(JSON.stringify(v.filter(t => t !== tag))); });
    const v = comicVotes_(r); if (v.indexOf(tag) < 0) v.push(tag); sh.getRange(r.row, 6).setValue(JSON.stringify(v));
    return getComicBook();
  } finally { lock.releaseLock(); }
}
// 🗑️ the maker can take one of their own comics out of the book
function deleteComic(name, id, pin) {
  checkPlayerPin_(name, pin);
  const r = comicRows_().find(x => x.id === String(id) && !x.deleted); if (!r || r.player !== name) throw new Error('Only the owner can remove it.');
  comicsSheet_(false).getRange(r.row, 8).setValue('yes'); return getComicBook();
}
// Dashboard 📣 news: the Comic of the day
function comicNews_() {
  try { const rows = comicRows_(), c = comicOfDay_(rows, today_()); if (!c) return []; const issues = {}, n = {}; rows.filter(r => !r.deleted).forEach(r => { n[r.player] = (n[r.player] || 0) + 1; issues[r.id] = n[r.player]; });
    const o = comicOut_(c, issues); return [{ kind: 'comic', id: o.id, player: o.player, title: o.title, game: o.game, votes: o.today, issue: o.issue, page: o.page, at: o.made, route: 'collection' }]; } catch (e) { return []; }
}
function checkPlayerPin_(name, pin) {
  const saved = getSettings()['PlayerPIN_' + name];
  if (!saved) throw new Error('NOPIN: Choose a PIN first.');
  if (!/^\d{4,8}$/.test(String(pin || '')) || pinHash_(name, String(pin)) !== saved) throw new Error('PIN: That PIN is not right.');
}
function verifyPlayerPin(name, pin) {
  const saved = getSettings()['PlayerPIN_' + name];
  return !!saved && /^\d{4,8}$/.test(String(pin || '')) && pinHash_(name, String(pin)) === saved;
}
// First PIN: no old PIN needed. Changing it: the old PIN is needed.
function setPlayerPin(name, newPin, oldPin) {
  if (!name || !activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Pick a player first.');
  if (!/^\d{4,8}$/.test(String(newPin || ''))) throw new Error('A PIN is 4 to 8 numbers.');
  if (hasPlayerPin_(name)) checkPlayerPin_(name, oldPin);
  saveSetting('PlayerPIN_' + name, pinHash_(name, String(newPin)));
  return { ok: true };
}
function resetPlayerPin(name, adminPin) {
  if (!verifyAdminPin(adminPin)) throw new Error('The grown-up PIN is not right.');
  saveSetting('PlayerPIN_' + name, '');
  return { ok: true };
}

/* ---------- avatars ---------- */
function parseAvatar_(txt) {
  try { const a = JSON.parse(txt || ''); return cleanAvatar_(a); } catch (e) { return null; }
}
// owned (optional) = {lineId: steps}: when given, locked options are dropped.
// 🎭 as-2 Signature acts: free for everyone + the 'sigact' line (same keys + order as AvatarActing core-sig)
const SIG_ACTS_ = { free: ['victory', 'cheer', 'wave', 'flex'], line: ['sig.superstar', 'sig.power-up', 'sig.heart-burst', 'sig.genius', 'sig.ninja', 'sig.rockstar', 'sig.giant-hero', 'sig.flower-twirl', 'sig.moonwalk', 'sig.robot'] };
function cleanSig_(k, owned) { k = String(k || ''); if (SIG_ACTS_.free.indexOf(k) >= 0) return k; const i = SIG_ACTS_.line.indexOf(k); if (i < 0) return ''; return !owned || (owned.sigact || 0) > i ? k : ''; }
function cleanAvatar_(a, owned) {
  if (!a || typeof a !== 'object') return null;
  const out = {};
  Object.keys(AVATAR_OPTS).forEach(k => {
    const n = Math.floor(Number(a[k])), base = AVATAR_OPTS[k], extra = AVATAR_EXTRA[k] ? itemLine_(AVATAR_EXTRA[k]).steps.length : 0;
    let ok = n >= 0 && n < base + extra;
    if (ok && n >= base && owned) ok = (owned[AVATAR_EXTRA[k]] || 0) > n - base;
    out[k] = ok ? n : 0;
  });
  const eq = {};
  EQUIP_SLOTS.forEach(slot => {
    const e = a.eq && a.eq[slot]; if (!e || typeof e !== 'object') return;
    const l = itemLine_(String(e.id)); if (!l || l.slot !== slot) return;
    const have = owned ? (owned[l.id] || 0) : l.steps.length, v = Math.floor(Number(e.v));
    if (!(have > 0)) return;
    if (l.rides) { const list = owned ? (owned.rides || []) : RIDE_ONS.map((r, i) => i); if (list.indexOf(v) === -1) return; eq[slot] = { id: l.id, v: v }; return; }
    const item = { id: l.id, v: v >= 0 && v < have ? v : have - 1 };
    if (l.parts) { item.o = {}; Object.keys(l.parts).forEach(p => { const i = Math.floor(Number(e.o && e.o[p])); const list = l.parts[p]; item.o[p] = i >= 0 && i < list.length && list[i][1] <= have ? i : 0; }); }
    if (e.c && typeof e.c === 'object' && (slot === 'costume' || slot === 'back')) { const a = HEX_.test(e.c.a) ? e.c.a : '', b = HEX_.test(e.c.b) ? e.c.b : ''; if (a || b) item.c = { a: a, b: b }; }   // 🎨 My colours
    eq[slot] = item;
  });
  if (Object.keys(eq).length) out.eq = eq;
  if (HEX_.test(a.accC)) out.accC = a.accC;
  const sig = cleanSig_(a.sig, owned); if (sig) out.sig = sig;   // 🎭 as-2
  if (a.cw && typeof cleanCraftWear_ === 'function') { const cw = cleanCraftWear_(a.cw); if (cw) out.cw = cw; }   // 🏭 crafted wear (ArtifactoryCode.gs, af-1)
  return out;
}
function getRoomData(player) {
  const players = activePlayers_(listProfilesFull()), st = getSettings();
  const mine = player && players.some(p => p.Name === player) ? itemsFor_(player, players) : { owned: {}, ways: {} };
  return {
    players: players.map(p => ({ Name: p.Name, Age: p.Age || '', avatar: parseAvatar_(st['Avatar_' + p.Name]), hasPin: !!st['PlayerPIN_' + p.Name] })),
    titles: titlesData_(players), settings: st, player: player || '',
    room: ROOM_KEYS.indexOf(st['Room_' + player]) !== -1 ? st['Room_' + player] : '',
    items: { lines: itemMeta_(), owned: mine.owned, ways: mine.ways, seen: player ? seenFor_(st, player) : {} },
    myVisited: !!(player && st['LastVisit_' + player]),   // false = never opened My Room yet (the room page shows a hint)
    messy: messyRooms_(st, players),
  };
}
// How many things lie around in each player's room right now (only messy rooms are listed).
function messyRooms_(st, players) {
  const now = Date.now(), out = {};
  players.forEach(p => { const n = messOf_(st, p.Name, now); if (n) out[p.Name] = n; });
  return out;
}
// Saving needs the player's PIN (set one first with setPlayerPin). Locked items are dropped.
function saveAvatar(name, avatar, pin) {
  const players = activePlayers_(listProfilesFull());
  if (!name || !players.some(p => p.Name === name)) throw new Error('Pick a player first.');
  checkPlayerPin_(name, pin);
  const clean = cleanAvatar_(avatar, itemsFor_(name, players).owned);
  if (clean && typeof artWear_ === 'function') { const cw = artWear_(name, avatar && avatar.cw); if (cw) clean.cw = cw; else delete clean.cw; }   // 🏭 only crafted things you own (af-1)
  if (!clean) throw new Error('Bad avatar.');
  saveSettings({ ['Avatar_' + name]: JSON.stringify(clean) });
  return clean;
}
function saveRoomPick(name, room) {
  if (ROOM_KEYS.indexOf(room) === -1) throw new Error('Unknown room.');
  if (name) saveSettings({ ['Room_' + name]: room });
  return { room: room };
}

/* ============ MY ROOM: each player's own room (decorate with a PIN, visit, gifts, tidy up) ============ */
// Settings: MyRoom_<Name> = {wall, floor, music, items:[{id,x,y}]}, Gifts_<Name> = [{id,from,kind,at,opened}],
// LastVisit_<Name> = when the owner last came in (ms), Tidy_<Name> = {by, at} (a visitor tidied up).
const MYROOM_N = 10;
// id: [w, d, step of the 'furni' line needed (0 = free), blocks the floor?]
const FURNI_DEFS = {
  bed: [2, 2, 0, 1], sofa: [1, 3, 0, 1], table: [2, 2, 0, 1], tv: [2, 1, 0, 1], shelf: [1, 2, 0, 1], rug: [3, 3, 0, 0], plant: [1, 1, 0, 1],
  teddy: [1, 1, 0, 1], lamp: [1, 1, 0, 1], toybox: [1, 1, 0, 1], desk: [2, 1, 0, 1], ball: [1, 1, 0, 1],
  trophycab: [1, 2, 1, 1], beanbag: [1, 1, 2, 1], arcade: [1, 1, 3, 1], aquarium: [2, 1, 4, 1], dinolamp: [1, 1, 5, 1], rocketbed: [2, 2, 6, 1], slide: [2, 1, 7, 1], disco: [1, 1, 8, 0],
};
const MYROOM_WALLS = 9, MYROOM_FLOORS = 8;             // the last 3 walls / 2 floors come from the 'roomstyle' line
const MYROOM_TUNES = ['house', 'jungle', 'space', 'fantasy', 'concert'];
const GIFT_KINDS = { flower: '🌸', candy: '🍬', heart: '💖', balloon: '🎈', cake: '🎂', star: '⭐' };
const GIFTS_PER_DAY = 3;
const STARTER_ROOM = { wall: 0, floor: 0, music: 'house', items: [{ id: 'rug', x: 3, y: 3 }, { id: 'bed', x: 7, y: 0 }, { id: 'plant', x: 0, y: 0 }, { id: 'table', x: 6, y: 6 }, { id: 'teddy', x: 1, y: 7 }] };
function jsonSetting_(st, key, fallback) { try { const v = JSON.parse(st[key] || ''); return v == null ? fallback : v; } catch (e) { return fallback; } }
// Keeps only things the owner has unlocked, inside the room and not on top of each other.
function cleanMyRoom_(layout, owned, made) {
  layout = layout || {};
  const furni = (owned || {}).furni || 0, style = (owned || {}).roomstyle || 0, out = { items: [] };
  const w = Math.floor(Number(layout.wall)), f = Math.floor(Number(layout.floor));
  out.wall = w >= 0 && w < MYROOM_WALLS && (w < 6 || style > w - 6) ? w : 0;
  out.floor = f >= 0 && f < MYROOM_FLOORS && (f < 6 || style > 3 + f - 6) ? f : 0;
  out.music = MYROOM_TUNES.indexOf(layout.music) !== -1 ? layout.music : 'house';
  const taken = {};
  (Array.isArray(layout.items) ? layout.items : []).slice(0, 30).forEach(it => {
    const cr = it && String(it.id || '').indexOf('cr:') === 0 ? (made || []).find(c => 'cr:' + c.id === it.id) : null;   // Workshop things the owner has
    if (cr && placeOf_(cr.type, cr.look).wall) return;                                     // wall things live in layout.walls
    const d = cr ? placeOf_(cr.type, cr.look).fp.concat([0, 1]) : FURNI_DEFS[it && it.id]; if (!d || (d[2] && furni < d[2])) return;
    const x = Math.floor(Number(it.x)), y = Math.floor(Number(it.y)), r = Number(it.r) === 1 ? 1 : 0;
    const w = r ? d[1] : d[0], dd = r ? d[0] : d[1];                       // turned things swap their width and depth
    if (!(x >= 0 && y >= 0 && x + w <= MYROOM_N && y + dd <= MYROOM_N)) return;
    if (d[3]) { for (let i = x; i < x + w; i++) for (let j = y; j < y + dd; j++) if (taken[i + ',' + j]) return; for (let i = x; i < x + w; i++) for (let j = y; j < y + dd; j++) taken[i + ',' + j] = 1; }
    out.items.push(r ? { id: it.id, x: x, y: y, r: 1 } : { id: it.id, x: x, y: y });
  });
  // wall spots 0-5 (paintings, mirrors, wall clocks) and the window (6, curtains only); one thing per spot
  out.walls = []; const used = {};
  (Array.isArray(layout.walls) ? layout.walls : []).slice(0, WALL_SPOTS).forEach(w => {
    const cr = w && (made || []).find(c => 'cr:' + c.id === w.id), spot = Math.floor(Number(w && w.s));
    if (!cr || !(spot >= 0 && spot < WALL_SPOTS) || used[spot]) return;
    const pl = placeOf_(cr.type, cr.look); if (!pl.wall || (spot === 6) !== !!pl.window) return;
    used[spot] = 1; out.walls.push({ id: w.id, s: spot });
  });
  return out;
}
// How messy a room is: nobody has tidied since the owner was last here a day or more ago.
// A room its owner has never opened starts a little messy (2 things), so kids find out about tidying.
function messOf_(st, owner, now) {
  const last = Number(st['LastVisit_' + owner]) || 0, tidy = jsonSetting_(st, 'Tidy_' + owner, null);
  if (tidy && Number(tidy.at) > last) return 0;
  if (!last) return 2;
  if (now - last < 86400000) return 0;
  return Math.min(5, Math.floor((now - last) / 86400000)) * 2;
}
// Everything to draw one player's room. When the owner opens it, it counts as their visit.
function getMyRoom(owner, viewer) {
  const players = activePlayers_(listProfilesFull());
  if (!players.some(p => p.Name === owner)) throw new Error('No room for that player.');
  const st = getSettings(), now = Date.now(), mine = viewer === owner;
  const saved = jsonSetting_(st, 'MyRoom_' + owner, null);
  const made = creationsFor_(owner);
  const layout = saved ? cleanMyRoom_(saved, itemsFor_(owner, players).owned, made) : STARTER_ROOM;
  const allGifts = jsonSetting_(st, 'Gifts_' + owner, []), gifts = allGifts.filter(g => !g.opened);
  const mailOld = allGifts.filter(g => g.opened).slice(-8).reverse().map(g => ({ from: g.from, label: g.label || g.kind, icon: GIFT_KINDS[g.kind] || (g.kind === 'creation' ? '🔨' : '🎁'), at: g.at }));
  const mess = messOf_(st, owner, now), tidy = jsonSetting_(st, 'Tidy_' + owner, null);
  const lastVisit = Number(st['LastVisit_' + owner]) || 0;
  // trophy shelf: Titles earned, family records held, badges
  const titles = titlesFor_(owner, players).map(id => (TITLE_DEFS.find(t => t.id === id) || {}).icon).filter(Boolean).filter((x, i) => i > 0);
  let records = 0; const boards = allBoards_(players);
  Object.keys(boards).forEach(g => boards[g].levels.forEach(l => { if (l.top[0] && l.top[0].name === owner) records++; }));
  let badges = 0; progressRows_().forEach(r => { if (r.Name === owner) badges += String(r.Tokens || '').split(',').map(t => t.trim()).filter(Boolean).length; });
  const out = { owner: owner, mine: mine, layout: layout, decorated: !!saved, mess: mess, shelf: { titles: titles.slice(0, 12), records: records, badges: badges },
    gifts: mine ? gifts : [], giftCount: gifts.length, mailOld: mine ? mailOld : [],
    firstVisit: mine && !lastVisit,
    tidiedBy: mine && tidy && Number(tidy.at) > lastVisit && tidy.by !== owner ? tidy.by : '', giftsLeft: viewer ? giftsLeft_(st, viewer) : 0,
    made: made.map(c => ({ id: c.id, type: c.type, name: c.name, look: c.look, maker: c.maker })) };
  if (mine) saveSetting('LastVisit_' + owner, String(now));
  else if (viewer && players.some(p => p.Name === viewer)) {
    const d = dailyRoom_(st, viewer, today_()); d.visited = d.visited || [];
    if (d.visited.indexOf(owner) === -1) { d.visited.push(owner); saveSetting('Daily_' + viewer, JSON.stringify(d)); safeRecordFeats_(viewer, 'room', { visits: 1 }); }
  }
  return out;
}
// Decorating needs the owner's PIN.
function saveMyRoom(name, layout, pin) {
  const players = activePlayers_(listProfilesFull());
  if (!name || !players.some(p => p.Name === name)) throw new Error('Pick a player first.');
  checkPlayerPin_(name, pin);
  const clean = cleanMyRoom_(layout, itemsFor_(name, players).owned, creationsFor_(name));
  saveSettings({ ['MyRoom_' + name]: JSON.stringify(clean) });
  safeRecordFeats_(name, 'room', { placed: clean.items.length });
  return clean;
}
function giftsLeft_(st, name) { const d = dailyRoom_(st, name, today_()); return Math.max(0, GIFTS_PER_DAY - (d.giftsSent || 0)); }
function sendGift(from, to, kind) {
  const players = activePlayers_(listProfilesFull());
  if (!players.some(p => p.Name === from) || !players.some(p => p.Name === to)) throw new Error('Pick a player first.');
  if (from === to) throw new Error('Send gifts to someone else 🙂');
  if (!GIFT_KINDS[kind]) throw new Error('Unknown gift.');
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const st = getSettings();
    if (giftsLeft_(st, from) <= 0) throw new Error('That\'s ' + GIFTS_PER_DAY + ' gifts today — more tomorrow! 💝');
    const list = jsonSetting_(st, 'Gifts_' + to, []);
    list.push({ id: String(Date.now()) + Math.floor(Math.random() * 1000), from: from, kind: kind, at: Date.now(), opened: false });
    while (list.length > 30) { const i = list.findIndex(g => g.opened); list.splice(i >= 0 ? i : 0, 1); }
    const d = dailyRoom_(st, from, today_()); d.giftsSent = (d.giftsSent || 0) + 1;
    saveSettings({ ['Gifts_' + to]: JSON.stringify(list), ['Daily_' + from]: JSON.stringify(d) });
    safeRecordFeats_(from, 'room', { gifts: 1 }); safeRecordFeats_(to, 'room', { received: 1 });
    return { ok: true, left: GIFTS_PER_DAY - d.giftsSent };
  } finally { lock.releaseLock(); }
}
function openGift(owner, id) {
  const st = getSettings(), list = jsonSetting_(st, 'Gifts_' + owner, []), g = list.find(x => x.id === String(id));
  if (!g) throw new Error('That gift is gone.');
  g.opened = true; saveSetting('Gifts_' + owner, JSON.stringify(list));
  return { from: g.from, kind: g.label || g.kind, icon: GIFT_KINDS[g.kind] || (g.kind === 'creation' ? '🔨' : '🎁') };
}
// A visitor (or the owner) tidied every mess away.
function tidyRoom(viewer, owner) {
  const players = activePlayers_(listProfilesFull());
  if (!players.some(p => p.Name === viewer) || !players.some(p => p.Name === owner)) throw new Error('Pick a player first.');
  const st = getSettings();
  if (!messOf_(st, owner, Date.now())) return { ok: true, already: true };
  saveSetting('Tidy_' + owner, JSON.stringify({ by: viewer, at: Date.now() }));
  if (viewer !== owner) safeRecordFeats_(viewer, 'room', { cleans: 1 });
  return { ok: true };
}

/* ============ FEEDBACK: "💬 Tell us!" from any page (kids + parents) ============ */
// Feedback tab (one row per message). The Admin page lists them with a status and a reply; the player sees
// replies the next time they open "Tell us". A "Feedback Log.md" next to the spreadsheet in Drive is rewritten
// after every message, so Claude can read it from the Drive folder in a later session and summarise it.
const FEEDBACK_TAB = 'Feedback';
const FEEDBACK_HEADERS = [
  ['ID', 'id', 'Made by the app'],
  ['When', 'when', 'yyyy-MM-dd HH:mm'],
  ['Player', 'player', 'Who sent it ("" = a grown-up on the Dashboard with no player picked)'],
  ['Kind', 'kind', 'bug / idea / wish / love / notok'],
  ['Mood', 'mood', '0 😢 · 1 😕 · 2 😐 · 3 😊 · 4 😍 (empty = not picked)'],
  ['Message', 'text', 'What they wrote or said (max 1000 letters)'],
  ['Page', 'page', 'Where they were'],
  ['Game', 'game', 'GameID, if they were in a game'],
  ['Level', 'level', 'Level / stage, if any'],
  ['Device', 'device', 'Screen size + browser'],
  ['Status', 'status', 'new / seen / fixed (set on the Admin page)'],
  ['Reply', 'reply', 'Answer shown to the player'],
  ['Updated', 'updated', 'yyyy-MM-dd HH:mm of the last status / reply change'],
];
const FEEDBACK_WIDTH = FEEDBACK_HEADERS.length;
const FEEDBACK_KINDS = { bug: '🐞 Something\'s broken', idea: '💡 Idea', wish: '🎮 New game wish', love: '😊 It\'s great', notok: '😕 Not OK' };
const FEEDBACK_MOODS = ['😢', '😕', '😐', '😊', '😍'];
const FEEDBACK_STATUS = ['new', 'seen', 'fixed'];
const FEEDBACK_PER_DAY = 20;
const FEEDBACK_LOG_NAME = 'Feedback Log.md';
function feedbackSheet_() {
  let sh = ss_().getSheetByName(FEEDBACK_TAB);
  if (!sh) {
    sh = ss_().insertSheet(FEEDBACK_TAB);
    sh.getRange(1, 1, 1, FEEDBACK_WIDTH).setValues([FEEDBACK_HEADERS.map(h => h[0] + '\n' + h[1])]);
    styleFeedbackSheet();
  }
  return sh;
}
// Look of the Feedback tab (sheet standard). Safe to re-run from the editor.
function styleFeedbackSheet() {
  const sh = ss_().getSheetByName(FEEDBACK_TAB);
  if (!sh) return;
  try {
    const head = sh.getRange(1, 1, 1, FEEDBACK_WIDTH);
    head.setValues([FEEDBACK_HEADERS.map((h, i) => (i < 10 ? '🔒 ' : '✏️ ') + h[0] + '\n' + h[1])])
      .setBackground('#0F766E').setFontColor('#FFFFFF').setFontWeight('bold')
      .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
    head.setNotes([FEEDBACK_HEADERS.map(h => h[2])]);
    sh.setRowHeight(1, 46); sh.setFrozenRows(1); sh.setFrozenColumns(3);
    sh.getRange(2, 1, sh.getMaxRows() - 1, FEEDBACK_WIDTH).setNumberFormat('@').setFontSize(10).setVerticalAlignment('middle').setWrap(false);
    sh.getRange(2, 6, sh.getMaxRows() - 1, 1).setWrap(true);
    [150, 120, 90, 80, 55, 320, 110, 110, 70, 150, 70, 240, 120].forEach((w, i) => sh.setColumnWidth(i + 1, w));
    sh.getRange(2, 1, sh.getMaxRows() - 1, 1).setFontFamily('Roboto Mono').setFontColor('#757575');
    sh.getBandings().forEach(b => b.remove());
    sh.getRange(1, 1, sh.getMaxRows(), FEEDBACK_WIDTH).applyRowBanding().setHeaderRowColor('#0F766E').setFirstRowColor('#FFFFFF').setSecondRowColor('#E6FFFA');
    sh.getProtections(SpreadsheetApp.ProtectionType.SHEET)
      .filter(p => String(p.getDescription()).indexOf('🔒 STEAM Playground') === 0).forEach(p => p.remove());
    sh.protect().setDescription('🔒 STEAM Playground — Feedback (app managed; Status + Reply are set on the Admin page)').setWarningOnly(true);
  } catch (e) {
    Logger.log('styleFeedbackSheet: ' + e.message);
  }
}
function feedbackRows_() {
  const sh = ss_().getSheetByName(FEEDBACK_TAB);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, FEEDBACK_WIDTH).getValues().map((r, i) => {
    const o = { row: i + 2 }; FEEDBACK_HEADERS.forEach((h, j) => { o[h[1]] = r[j] instanceof Date ? Utilities.formatDate(r[j], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') : String(r[j] === undefined ? '' : r[j]); });
    return o;
  }).filter(o => o.id);
}
function cleanText_(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max); }
// fb = {player, kind, mood, text, page, game, level, device}
function sendFeedback(fb) {
  fb = fb || {};
  const kind = FEEDBACK_KINDS[fb.kind] ? fb.kind : '';
  if (!kind) throw new Error('Pick what kind of message it is 🙂');
  const players = activePlayers_(listProfilesFull());
  const player = players.some(p => p.Name === fb.player) ? fb.player : '';
  const mood = Number(fb.mood), moodOk = Number.isInteger(mood) && mood >= 0 && mood < FEEDBACK_MOODS.length;
  const text = cleanText_(fb.text, 1000);
  if (!text && !moodOk && kind !== 'love') throw new Error('Tell us a little more — type, talk, or pick a face 🙂');
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  let row;
  try {
    const sh = feedbackSheet_(), day = today_();
    if (player && feedbackRows_().filter(r => r.player === player && r.when.indexOf(day) === 0).length >= FEEDBACK_PER_DAY) throw new Error('That\'s a lot of messages today — thank you! Send more tomorrow 💖');
    const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
    row = ['FB' + Date.now() + Math.floor(Math.random() * 100), now, player, kind, moodOk ? String(mood) : '', text,
      cleanText_(fb.page, 40), cleanText_(fb.game, 40), cleanText_(fb.level, 40), cleanText_(fb.device, 120), 'new', '', now];
    sh.getRange(sh.getLastRow() + 1, 1, 1, FEEDBACK_WIDTH).setNumberFormat('@').setValues([row]);
  } finally { lock.releaseLock(); }
  writeFeedbackLog_();
  return { ok: true, id: row[0] };
}
// The player's own last messages with any reply ("📬 Replies for you").
function getMyFeedback(player) {
  if (!player) return [];
  return feedbackRows_().filter(r => r.player === player).slice(-8).reverse()
    .map(r => ({ id: r.id, when: r.when, kind: r.kind, text: r.text, status: r.status || 'new', reply: r.reply }));
}
// Admin page: every message, newest first (needs the Admin PIN).
function getFeedbackList(pin) {
  if (!verifyAdminPin(pin)) throw new Error('Wrong Admin PIN.');
  const rows = feedbackRows_().reverse();
  return { rows: rows.map(r => { delete r.row; return r; }), kinds: FEEDBACK_KINDS, moods: FEEDBACK_MOODS };
}
function setFeedbackStatus(pin, id, status, reply) {
  if (!verifyAdminPin(pin)) throw new Error('Wrong Admin PIN.');
  if (FEEDBACK_STATUS.indexOf(status) === -1) throw new Error('Unknown status.');
  const r = feedbackRows_().find(x => x.id === String(id));
  if (!r) throw new Error('That message is gone.');
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  ss_().getSheetByName(FEEDBACK_TAB).getRange(r.row, 11, 1, 3).setNumberFormat('@').setValues([[status, reply == null ? r.reply : cleanText_(reply, 500), now]]);
  writeFeedbackLog_();
  return { ok: true, status: status, reply: reply == null ? r.reply : cleanText_(reply, 500), updated: now };
}
// Rewrites "Feedback Log.md" in the spreadsheet's Drive folder. Never blocks a save (Drive can be slow or not allowed).
function feedbackLogText_(rows) {
  const open = rows.filter(r => r.status !== 'fixed'), count = k => rows.filter(r => r.kind === k).length;
  const line = r => '- **[' + (r.status || 'new') + ']** ' + r.when + ' · ' + (r.player || 'grown-up') + ' · ' + (FEEDBACK_KINDS[r.kind] || r.kind)
    + (r.mood !== '' ? ' ' + (FEEDBACK_MOODS[Number(r.mood)] || '') : '') + ' · ' + [r.page, r.game, r.level].filter(Boolean).join(' / ')
    + (r.text ? '\n  > ' + r.text.replace(/\n+/g, ' ') : '') + (r.reply ? '\n  ↳ Reply: ' + r.reply.replace(/\n+/g, ' ') : '') + '\n  `' + r.id + '` · ' + r.device;
  return '# STEAM Playground — Feedback Log\n\nRewritten by the app after every message (' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') + '). '
    + 'Source of truth: the **Feedback** tab. Status is set on the Admin page.\n\n'
    + '| Open (new + seen) | Fixed | 🐞 Broken | 💡 Ideas | 🎮 Game wishes | 😊 Great | 😕 Not OK |\n|---|---|---|---|---|---|---|\n'
    + '| ' + open.length + ' | ' + (rows.length - open.length) + ' | ' + count('bug') + ' | ' + count('idea') + ' | ' + count('wish') + ' | ' + count('love') + ' | ' + count('notok') + ' |\n\n'
    + '## Open — newest first\n\n' + (open.length ? open.slice().reverse().slice(0, 150).map(line).join('\n') : '_Nothing open._') + '\n\n'
    + '## Fixed (last 50)\n\n' + (rows.length - open.length ? rows.filter(r => r.status === 'fixed').reverse().slice(0, 50).map(line).join('\n') : '_None yet._') + '\n';
}
function writeFeedbackLog_() {
  try {
    const text = feedbackLogText_(feedbackRows_());
    const folder = DriveApp.getFileById(SHEET_ID).getParents().next();
    const it = folder.getFilesByName(FEEDBACK_LOG_NAME);
    if (it.hasNext()) it.next().setContent(text); else folder.createFile(FEEDBACK_LOG_NAME, text, MimeType.PLAIN_TEXT);
    return true;
  } catch (e) { Logger.log('Feedback Log not written: ' + e.message); return false; }
}

// Run this ONCE from the Apps Script editor (Run ▶ rebuildFeedbackLog): it asks Google for Drive permission and writes
// "Feedback Log.md" next to the Games Data Center sheet, so Claude can read the family's feedback from the Drive folder.
// Unlike writeFeedbackLog_ it shows the real error in the log instead of hiding it.
function rebuildFeedbackLog() {
  const rows = feedbackRows_();
  const folder = DriveApp.getFileById(SHEET_ID).getParents().next();
  const it = folder.getFilesByName(FEEDBACK_LOG_NAME), text = feedbackLogText_(rows);
  if (it.hasNext()) it.next().setContent(text); else folder.createFile(FEEDBACK_LOG_NAME, text, MimeType.PLAIN_TEXT);
  Logger.log('Feedback Log.md written to the folder "' + folder.getName() + '" with ' + rows.length + ' messages.');
  return rows.length;
}

/* ============ SHOWROOM: the Furniture craft room — 3 masterpieces on podiums (Room page, key show:<Name>) ============ */
// Settings Showroom_<Name> = {ids: [up to 3 creation ids the player MADE], wall, floor}. Anyone can visit; only the owner (PIN) changes it.
const SHOWROOM_PICKS = 3;
function cleanShowroom_(data, made) {
  data = data || {}; const ids = [], mine = made.map(c => c.id);
  (Array.isArray(data.ids) ? data.ids : []).forEach(id => { id = String(id || ''); if (id && mine.indexOf(id) !== -1 && ids.indexOf(id) === -1 && ids.length < SHOWROOM_PICKS) ids.push(id); });
  const n = (v, max) => { v = Math.floor(Number(v)); return v >= 0 && v < max ? v : 0; };
  return { ids: ids, wall: n(data.wall, 9), floor: n(data.floor, 8) };
}
function getShowroom(owner, viewer) {
  const players = activePlayers_(listProfilesFull());
  if (!players.some(p => p.Name === owner)) throw new Error('No showroom for that player.');
  const st = getSettings(), made = creationsFor_(owner).filter(c => c.maker === owner);
  let room = cleanShowroom_(jsonSetting_(st, 'Showroom_' + owner, null), made);
  if (!room.ids.length) room.ids = made.slice().sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, SHOWROOM_PICKS).map(c => c.id);   // nothing picked yet: best-voted first
  const pub = c => ({ id: c.id, type: c.type, name: c.name, look: c.look, maker: c.maker, stars: c.stars || 0 });
  return { owner: owner, mine: viewer === owner, room: room, picks: room.ids.map(id => made.find(c => c.id === id)).filter(Boolean).map(pub), made: viewer === owner ? made.map(pub) : [], madeCount: made.length };
}
function saveShowroom(name, data, pin) {
  const players = activePlayers_(listProfilesFull());
  if (!name || !players.some(p => p.Name === name)) throw new Error('Pick a player first.');
  checkPlayerPin_(name, pin);
  const clean = cleanShowroom_(data, creationsFor_(name).filter(c => c.maker === name));
  saveSettings({ ['Showroom_' + name]: JSON.stringify(clean) });
  return clean;
}

/* ================= 📖 WORD MEANINGS (Lettercraft, plan 11p, 2026-11-06) =================
   The page has ~3,000 built-in kid meanings (WordMeanings.html). Any other word is looked up ONCE in a free online
   dictionary (UrlFetchApp → Apps Script asks for permission the first time) and kept in the "Word Meanings" tab.
   A grown-up can fix any meaning in that tab (it wins over the built-in one). Words a player meets go to their
   📖 word journal (Settings Words_<Name>, shown on the Collection page). */
const WORD_TAB_ = 'Word Meanings';
const WORD_HEAD_ = ['Word', 'Meaning (kid words)', 'Example', 'Emoji', 'Source', 'Added'];
function wordMeaningsSheet_() {
  const ss = ss_(); let sh = ss.getSheetByName(WORD_TAB_);
  if (!sh) {
    sh = ss.insertSheet(WORD_TAB_); sh.appendRow(WORD_HEAD_); sh.setFrozenRows(1);
    try { sh.getRange(1, 1, 1, WORD_HEAD_.length).setFontWeight('bold').setBackground('#FFF1C9'); [120, 420, 320, 70, 140, 110].forEach((w, i) => sh.setColumnWidth(i + 1, w)); sh.getRange('B:C').setWrap(true); } catch (e) { }
  }
  return sh;
}
function wordMeaningRows_() {
  const sh = ss_().getSheetByName(WORD_TAB_); if (!sh) return {};
  const out = {}; sh.getDataRange().getValues().slice(1).forEach(r => { const w = String(r[0] || '').toUpperCase().trim(); if (w && r[1]) out[w] = { m: String(r[1]), x: String(r[2] || ''), e: String(r[3] || ''), src: String(r[4] || 'sheet') }; });
  return out;
}
// r31: one dictionary call (dictionaryapi.dev). Returns {m, x} | {} (not found) | {err} (the call itself failed — usually Apps Script
// was never allowed to reach outside web pages: a grown-up runs authorizeWordLookup() once from the editor).
function dictFetch_(w) {
  const ck = 'dict_' + w, cache = CacheService.getScriptCache(), hit = cache.get(ck);
  if (hit === '-') return {};
  try {
    const r = UrlFetchApp.fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w.toLowerCase()), { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) { if (r.getResponseCode() === 404) cache.put(ck, '-', 21600); return {}; }
    const defs = []; (JSON.parse(r.getContentText()) || []).forEach(e => (e.meanings || []).forEach(mm => (mm.definitions || []).forEach(d => { if (d && d.definition) defs.push(d); })));
    const d = defs.slice().sort((a, b) => String(a.definition).length - String(b.definition).length).find(d => String(d.definition).length >= 12) || defs[0];
    if (!d) return {};
    return { m: String(d.definition).slice(0, 180), x: String((defs.find(q => q.example) || {}).example || '').slice(0, 140) };
  } catch (e) { return { err: String(e && e.message || e).slice(0, 160) }; }
}
// RAZED → RAZE, HOOVES → HOOF … (the dictionary often has only the base word)
function wordBases_(w) {
  const out = [], add = b => { if (b && b.length >= 2 && b !== w && out.indexOf(b) < 0) out.push(b); };
  if (/IES$/.test(w)) add(w.slice(0, -3) + 'Y'); if (/IED$/.test(w)) add(w.slice(0, -3) + 'Y');
  if (/VES$/.test(w)) { add(w.slice(0, -3) + 'F'); add(w.slice(0, -3) + 'FE'); }
  if (/ES$/.test(w)) add(w.slice(0, -2)); if (/S$/.test(w) && !/SS$/.test(w)) add(w.slice(0, -1));
  if (/ED$/.test(w)) { add(w.slice(0, -1)); add(w.slice(0, -2)); if (/([B-DF-HJ-NP-TV-Z])\1ED$/.test(w)) add(w.slice(0, -3)); }
  if (/ING$/.test(w)) { add(w.slice(0, -3)); add(w.slice(0, -3) + 'E'); if (/([B-DF-HJ-NP-TV-Z])\1ING$/.test(w)) add(w.slice(0, -4)); }
  if (/EST$/.test(w)) { add(w.slice(0, -3)); add(w.slice(0, -2)); } else if (/ER$/.test(w)) { add(w.slice(0, -2)); add(w.slice(0, -1)); }
  if (/LY$/.test(w)) add(w.slice(0, -2));
  return out.slice(0, 3);
}
function saveWordRow_(w, m, x, src) {
  const lock = LockService.getScriptLock(); try { lock.waitLock(5000); if (!wordMeaningRows_()[w]) wordMeaningsSheet_().appendRow([w, m, x, '', src, new Date()]); } catch (e) { } finally { try { lock.releaseLock(); } catch (e) { } }
}
function getWordMeaning(word) {
  const w = String(word || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (!w || w.length > 15) return null;
  const rows = wordMeaningRows_(), have = rows[w]; if (have) return Object.assign({ w: w }, have);
  let f = dictFetch_(w), base = '';
  if (f.err) return { w: w, m: '', none: true, err: f.err };
  if (!f.m) for (const b of wordBases_(w)) { const g = rows[b] ? rows[b] : dictFetch_(b); if (g.err) return { w: w, m: '', none: true, err: g.err }; if (g.m) { f = g; base = b; break; } }
  if (!f.m) return { w: w, m: '', none: true };
  const m = (base ? '(' + w + ' comes from ' + base + ') ' : '') + f.m;
  saveWordRow_(w, m, f.x || '', 'dictionaryapi.dev');
  return { w: w, m: m, x: f.x || '', e: '', src: 'dictionaryapi.dev' };
}
// r31: a word that is NOT in Lettercraft's built-in list (SNORK, WHOOF…). Real if the Word Meanings tab has it (a grown-up can add rows)
// or the big dictionary knows it (then it is saved in the tab, so next time every device knows it). Rude / grown-up words never pass.
const RUDE_WORDS_ = /(FUCK|SHIT|CUNT|BITCH|DICK|COCK|PUSS|PENIS|VAGIN|BOOB|TITS?$|SEX|PORN|NUDE|NAKED|ARSE|ASSHOL|BASTARD|SLUT|WHORE|NIGG|FAG|RETARD|RAPE|KILL|MURDER|SUICID|DRUG|COCAIN|HEROIN|WEED|BEER|WINE|VODKA|WHISK|DRUNK|GUN|BOMB|DAMN|HELL$|CRAP|PISS|POOP?ER)/;
function checkWord(word) {
  const w = String(word || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (w.length < 2 || w.length > 15) return { ok: false };
  if (RUDE_WORDS_.test(w)) return { ok: false, kid: true };
  const have = wordMeaningRows_()[w]; if (have) return Object.assign({ ok: true, w: w }, have);
  const f = dictFetch_(w);
  if (f.err) return { ok: false, err: f.err };
  if (!f.m) return { ok: false };
  saveWordRow_(w, f.m, f.x || '', 'dictionary — new word');
  return { ok: true, w: w, m: f.m, x: f.x || '', e: '', src: 'dictionary — new word' };
}
// r31: run ONCE from the Apps Script editor (▶ Run → authorizeWordLookup) so the app may ask the online dictionary.
// Without this OK every word outside the ~3,000 built-in meanings shows "ask a grown-up", and new words can't be checked.
function authorizeWordLookup() {
  // (dict-1) Google's tick-box permission screen (2025): if "Connect to an external service" was left unticked, Google never asks
  // again by itself and dictFetch_ just reports the error. requireScopes stops this run and opens the screen for that one box.
  if (typeof ScriptApp !== 'undefined' && typeof ScriptApp.requireScopes === 'function')
    ScriptApp.requireScopes(ScriptApp.AuthMode.FULL, ['https://www.googleapis.com/auth/script.external_request']);
  const f = dictFetch_('HELLO');
  Logger.log(f.err ? '❌ Still blocked: ' + f.err : '✅ The dictionary works: HELLO = ' + f.m);
  return f;
}
// words = [{w, m, e}] met in one game → Settings Words_<Name> as [[word, times, firstDate, meaning, emoji], …] (newest first, ≤ 300)
// 🏓 SlaBrall: the player's racket design (optional — the game works without one). Settings Racket_<Name> = {v, c1, c2, grip, pat, stk}.
// 📜 Snakize Snaketale (plan 11y): story progress in Settings 'Snaketale_<Name>' = {diff, st: {'ch-stage': stars}} — best stars kept per stage.
// Chapter k is done when its boss stage (stage 6) is cleared. Feats (max): stages cleared, chapters, bosses, stars → 📜 Tale heroes costume line + Tale Hero title.
function saveSnaketale(name, key, stars, diff) {
  checkPlayer_(name);
  if (!/^[0-5]-[0-6]$/.test(String(key))) throw new Error('Bad stage.');
  stars = Math.max(0, Math.min(3, Math.floor(Number(stars)) || 0));
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const k = 'Snaketale_' + name; let d = {}; try { d = JSON.parse(getSettings()[k] || '{}') || {}; } catch (e) { d = {}; }
    if (!d.st || typeof d.st !== 'object') d.st = {};
    if (['easy', 'normal', 'hard'].indexOf(diff) >= 0) d.diff = diff;
    const was = Number(d.st[key]) || 0, first = !was && stars > 0;
    if (stars > was) d.st[key] = stars;
    saveSetting(k, JSON.stringify(d));
    const keys = Object.keys(d.st).filter(x => d.st[x] > 0), chapters = [0, 1, 2, 3, 4, 5].filter(c => d.st[c + '-6'] > 0).length;
    const total = keys.reduce((a, x) => a + (Number(d.st[x]) || 0), 0);
    if (first) addMiles_(name, /-6$/.test(key) ? 3 : 1, 'Snaketale ' + key);
    const feats = stars > 0 ? safeRecordFeats_(name, 'snaketale', { stages: keys.length, chapters: chapters, bosses: chapters, stars: total }) : null;
    return { tale: d, chapters: chapters, first: first, newChapter: first && /-6$/.test(key), feats: feats };
  } finally { lock.releaseLock(); }
}
// 🔤 GeoRead 🗺️ Letter Journey (gr-3): Settings GeoJourney_<Name> = {done: chapters finished (0–6), st: {ch: best stars}}.
// The first time a chapter is finished: adventure miles (chapter 6 = 5, others 2). Feats: chapters (max) + what was read on the way.
// 🎨 extra letter looks owned = max(item line 'letterskin' steps, Alphabet Road chapters done) — both games unlock them
function letterSkinsOwned_(players) {
  const all = activePlayers_(listProfilesFull()), st = getSettings(), out = {};
  players.forEach(p => { let n = 0; try { n = itemsFor_(p.Name, all).owned.letterskin || 0; } catch (e) { n = 0; } let j = 0; try { j = Number((JSON.parse(st['GeoJourney_' + p.Name] || '{}') || {}).done) || 0; } catch (e) { j = 0; } out[p.Name] = Math.max(n, j); });
  return out;
}
// 🎁 GeoRead daily treasure counters (today): words read / built + stories / journey chapters
function grDaily_(name, stats) {
  try { const d = dailyRoom_(getSettings(), name, today_()); d.grWords = (d.grWords || 0) + (Number(stats.blends) || 0) + (Number(stats.built) || 0); d.grStory = (d.grStory || 0) + (Number(stats.stories) || 0) + (Number(stats.chapters) ? 1 : 0); saveSetting('Daily_' + name, JSON.stringify(d)); } catch (e) { console.error('georead daily: ' + e.message); }
}
function saveGeoJourney(name, ch, stars, stats) {
  checkPlayer_(name);
  ch = Math.floor(Number(ch)); if (!(ch >= 0 && ch <= 5)) throw new Error('Bad chapter.');
  stars = Math.max(1, Math.min(3, Math.floor(Number(stars)) || 1));
  const lock = LockService.getScriptLock(); lock.waitLock(10000); let d = {}, first = false;
  try {
    const k = 'GeoJourney_' + name; try { d = JSON.parse(getSettings()[k] || '{}') || {}; } catch (e) { d = {}; }
    if (!d.st || typeof d.st !== 'object') d.st = {}; d.done = Math.max(0, Math.min(6, Math.floor(Number(d.done)) || 0));
    if (ch > d.done) throw new Error('Finish the chapter before first.');
    first = ch === d.done; if (first) d.done = ch + 1;
    d.st[ch] = Math.max(Number(d.st[ch]) || 0, stars);
    saveSetting(k, JSON.stringify(d));
  } finally { lock.releaseLock(); }
  const miles = first ? (ch === 5 ? 5 : 2) : 0; if (miles) addMiles_(name, miles, 'GeoRead Alphabet Road chapter ' + (ch + 1));
  const x = {}, s0 = stats || {}; ['blends', 'built', 'found', 'magic', 'perfects', 'stories', 'said'].forEach(f => { const v = Math.floor(Number(s0[f]) || 0); if (v > 0) x[f] = Math.min(200, v); });
  x.sounds = Math.min(60, Math.floor(Number(s0.sounds) || 0)); x.chapters = d.done; x.games = 1;
  grDaily_(name, x);   // journey counts for the daily treasures too
  return { journey: d, first: first, miles: miles, feats: safeRecordFeats_(name, 'georead', x) };
}
function saveRacket(name, d) {
  if (!name || !d) return { ok: false };
  const hex = c => (typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c)) ? c : '';
  const clean = { v: Math.max(0, Math.min(17, Math.floor(Number(d.v)) || 0)), c1: hex(d.c1), c2: hex(d.c2), grip: hex(d.grip), pat: Math.max(0, Math.min(9, Math.floor(Number(d.pat)) || 0)), stk: String(d.stk || '').slice(0, 4) };   // 🏏 bs-1: 18 shapes · 10 patterns
  saveSetting('Racket_' + name, JSON.stringify(clean));
  return { ok: true, design: clean };
}
// 🏏 bs-1 Batstickskin: the same design, any game (SlaBrall racket · Brawl melee pickups · the Room Wardrobe designer)
function saveBatstick(name, d) { return saveRacket(name, d); }
function saveWordJournal(name, words) {
  if (!name || !Array.isArray(words) || !words.length) return { ok: false };
  const key = 'Words_' + name; let list = []; try { list = JSON.parse(getSettings()[key] || '[]') || []; } catch (e) { list = []; }
  const today = today_(), seen = {}; list.forEach((r, i) => { seen[r[0]] = i; });
  words.slice(0, 40).forEach(o => { const w = String(o.w || '').toUpperCase().replace(/[^A-Z]/g, ''); if (!w) return;
    if (seen[w] != null) { list[seen[w]][1] = (Number(list[seen[w]][1]) || 1) + 1; if (o.m && !list[seen[w]][3]) list[seen[w]][3] = String(o.m).slice(0, 90); }
    else { list.unshift([w, 1, today, String(o.m || '').slice(0, 90), String(o.e || '').slice(0, 8)]); seen[w] = -1; } });
  saveSetting(key, JSON.stringify(list.slice(0, 300)));
  return { ok: true, count: Math.min(300, list.length) };
}

// 📖 SpiritBestiary (pd-3b, PyraDive plan §8): ONE Settings row per player — "Bestiary_<Name>" = {<creature key>: [times called, first day, game]}.
// Any game can add creatures (SpiritBestiary.add → saveBestiary a moment later); the book merges this row with the device's copy.
function saveBestiary(name, add, game) {
  if (!activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Unknown player.');
  if (!add || typeof add !== 'object' || Array.isArray(add)) throw new Error('Bad data.');
  const key = 'Bestiary_' + name, today = today_(); let d = {};
  try { d = JSON.parse(getSettings()[key] || '{}') || {}; } catch (e) { d = {}; }
  game = String(game || '').replace(/[^a-z0-9-]/g, '').slice(0, 24);
  Object.keys(add).slice(0, 60).forEach(k => { if (!/^[a-z]{2,24}$/.test(k)) return; const n = Math.max(1, Math.min(50, Number(add[k]) || 1));
    d[k] = d[k] ? [(Number(d[k][0]) || 0) + n, d[k][1] || today, d[k][2] || game] : [n, today, game]; });
  if (Object.keys(d).length > 120) throw new Error('Too big.');
  saveSetting(key, JSON.stringify(d));
  return { ok: true, n: Object.keys(d).length };
}
function getBestiary(name) { let d = {}; try { d = JSON.parse(getSettings()['Bestiary_' + name] || '{}') || {}; } catch (e) { d = {}; } return d; }

// 🧬 SkillKit saves (td-1, plan "TD-Stories — full plan.md" §6): ONE Settings row per player per game — "SkillTree_<game>_<Name>" =
// {ch: chapters done (only grows), last: {<hero>: SkillKit tree.save()}, lastForms} — picks + evolve forms, never a log.
const SKILL_TREE_GAMES_ = ['td-draprincess'];
function saveSkillTree(name, game, json) {
  if (SKILL_TREE_GAMES_.indexOf(game) < 0) throw new Error('Unknown game.');
  if (!activePlayers_(listProfilesFull()).some(p => p.Name === name)) throw new Error('Unknown player.');
  json = String(json || ''); if (json.length > 6000) throw new Error('Too big.');
  let d; try { d = JSON.parse(json); } catch (e) { throw new Error('Bad data.'); }
  if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('Bad data.');
  const key = 'SkillTree_' + game + '_' + name; let old = {};
  try { old = JSON.parse(getSettings()[key] || '{}') || {}; } catch (e) { old = {}; }
  d.ch = Math.max(Number(old.ch) || 0, Math.min(6, Number(d.ch) || 0));
  saveSetting(key, JSON.stringify(d));
  return { ok: true, ch: d.ch };
}
// (r31+11m-2+11j+11i-C+11x-3+11y-4+sb-4+news-1+pp-4+ebr-4+11j-b4+11j-S4+11j-S5+11j-S6+11i-H+ebr-5+bc-1+bc-4+modes-1+modes-2+off-2+gr-4+wd-13+gs-4+mg-1+ebr-6+gro-1+off-8+bp-1+bp-1+bp-2+bp-2+bp-2+bp-2+bp-2+bp-2+bp-3+bp-3+bp-4+bp-4+bp-4+bp-4+bp-5+bp-5+bp-5+bp-5+bp-5+bp-5+sb2-2+sk-1+bs-1+le-1+dict-1+as-1+as-2+ck-1b+p3a+lk-1c+nz-1+size-1+td-1+pd-1+bo-1+pk-1+sc-1+pd-2b+pd-2c+bo-2a+pd-3a+bo-2b+pd-3b+pk-2a+pd-3c+sc-2a+bo-2c+pk-2b+pk-3a+bo-3a+bo-3b+pk-3b+sc-2b+pd-4a) END OF Code.gs

;
/* ===== PosePartyCode.gs ===== */
// PosePartyCode.gs — 📷 Pose Party server (plan 11j S2). Separate file so it doesn't clash with other chats in Code.gs.
// Named PosePartyCode (not PoseParty): Apps Script won't keep a script file and the PoseParty HTML file under the same name.
// Why: the Apps Script frame blocks the camera, so the game runs on the GitHub "camera door"
// (https://aowu-hub.github.io/pose-party/). The door gets the game page and talks to the app through
// /exec with a one-time pass:
//   GET  /exec?api=posegame&pass=…   → {ok, html}   (PoseParty.html, evaluated with includes)
//   POST /exec  body {pass, fn, args} → {ok, result} (only the functions in POSE_CALLS_)
// Code.gs needs 2 small hooks (added by the pose chat): doGet starts with
//   if (e && e.parameter && e.parameter.api) return poseApi_(e);
// and the doGet map has  poseparty: 'PoseLaunch'.  doPost lives here (Code.gs has none).
// Uses from Code.gs: ss_, getSettings, saveSetting, activePlayers_, listProfilesFull, jsonSetting_,
// getLevelGameData, saveLevelResult, saveFeats, getGameLeaders, sendFeedback, getMyFeedback, verifyAdminPin.

var POSE_DOOR_DEFAULT_ = 'https://aowu-hub.github.io/pose-party/';
var POSE_PASS_HOURS_ = 6;

function poseDoorUrl_() {
  var u = String(getSettings()['PoseDoorUrl'] || '').trim();
  return u || POSE_DOOR_DEFAULT_;
}

// Called by PoseLaunch.html (google.script.run) — makes a one-time pass and the door link.
// players = one name or a list of up to 4 (👥 party: they take turns on one camera). The first one "holds" the pass.
function startPoseSession(players, sessionStart, durationMin, mode) {   // ✨ modes-3: mode = ?mode=<id> from the Gameroom / Dashboard (opens that Pose Party mode)
  var want = Array.isArray(players) ? players : [players], active = activePlayers_(listProfilesFull()), ps = [];
  want.forEach(function (n) { n = String(n || ''); if (n && ps.indexOf(n) < 0 && ps.length < 4 && active.some(function (p) { return p.Name === n; })) ps.push(n); });
  if (!ps.length) throw new Error('Pick a player first.');
  var name = ps[0];
  var pass = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 8);
  CacheService.getScriptCache().put('pose:' + pass, JSON.stringify({ p: name, ps: ps, at: Date.now(), m: /^[a-z]{2,16}$/.test(String(mode || '')) ? String(mode) : '' }), POSE_PASS_HOURS_ * 3600);
  var app = ScriptApp.getService().getUrl();
  var url = poseDoorUrl_() + '?app=' + encodeURIComponent(app) + '&pass=' + pass + '&player=' + encodeURIComponent(name) +
    (sessionStart ? '&ss=' + encodeURIComponent(sessionStart) + '&dm=' + encodeURIComponent(durationMin || '') : '');
  return { url: url, pass: pass, party: ps };
}
// A save for a party member goes to that member; any other name falls back to the pass holder.
function posePartyName_(s, name) {
  var ps = s.ps || [s.p];
  return ps.indexOf(String(name || '')) >= 0 ? String(name) : s.p;
}

function poseSession_(pass) {
  if (!pass || !/^[0-9a-f]{20,80}$/i.test(String(pass))) return null;
  var raw = CacheService.getScriptCache().get('pose:' + pass);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function poseJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// doGet hook: /exec?api=…
function poseApi_(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.api === 'posegame') {
      var s = poseSession_(p.pass);
      if (!s) return poseJson_({ ok: false, error: 'expired', message: 'This Pose Party link has run out — open Pose Party from the Gameroom again.' });
      var t = HtmlService.createTemplateFromFile('PoseParty');
      t.webAppUrl = ScriptApp.getService().getUrl();
      t.player = s.p;
      t.sessionStart = p.ss || '';
      t.durationMin = p.dm || '';
      t.game = '';
      t.mode = s.m || '';   // ✨ modes-3
      t.page = 'poseparty';
      return poseJson_({ ok: true, html: t.evaluate().getContent(), player: s.p });
    }
    if (p.api === 'poseping') return poseJson_({ ok: true, at: new Date().toISOString() });
    return poseJson_({ ok: false, error: 'unknown api' });
  } catch (err) {
    return poseJson_({ ok: false, error: String(err && err.message || err) });
  }
}

// POST from the door's google.script.run shim. Body (text/plain) = JSON {pass, fn, args}.
function doPost(e) {
  var body = {};
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return poseJson_({ ok: false, error: 'bad request' }); }
  if (body && body.api === 'offline' && typeof offlineApi_ === 'function') return offlineApi_(body);   // 📲 off-2: offline app door (OfflineSync.gs)
  var s = poseSession_(body.pass);
  if (!s) return poseJson_({ ok: false, error: 'expired', message: 'This Pose Party link has run out — open Pose Party from the Gameroom again.' });
  try {
    return poseJson_({ ok: true, result: poseCall_(s, String(body.fn || ''), body.args || []) });
  } catch (err) {
    return poseJson_({ ok: false, error: String(err && err.message || err) });
  }
}

// The ONLY functions the door may call. Saves use the pass's player, or a 👥 party member named in the pass (never any other name).
var POSE_CALLS_ = {
  getLevelGameData: function (s, a) {
    var d = getLevelGameData('pose-party', s.p); d.poses = poseCollection_(s.p); d.party = s.ps || [s.p]; d.partyPoses = {};
    d.booth = String(getSettings()['Booth_' + s.p] || '') || null;   // 📸 favourite Photo Booth design
    d.myPoses = String(getSettings()['MyPoses_' + s.p] || '') || '[]';   // 🛠️ Pose Builder poses
    d.party.forEach(function (n) { d.partyPoses[n] = poseCollection_(n); });
    poseStripSecrets_(d.settings); return d;
  },
  saveLevelResult: function (s, a) { return saveLevelResult('pose-party', s.p, Number(a[2]), poseCleanExtra_(a[3])); },   // solo only
  saveFeats: function (s, a) { return saveFeats(posePartyName_(s, a[0]), 'pose-party', poseCleanStats_(a[2])); },
  getGameLeaders: function (s, a) { return getGameLeaders('pose-party'); },
  savePoseCollection: function (s, a) { return savePoseCollection(posePartyName_(s, a[0]), a[1]); },
  saveBoothDesign: function (s, a) { return saveBoothDesign(s.p, a[1]); },   // only the pass holder's own design
  saveMyPoses: function (s, a) { return saveMyPoses_(s.p, a[1]); },   // 🛠️ only the pass holder's own poses
  savePoseWall: function (s, a) { return savePoseWall_(s, String(a[0] || ''), a[1]); },        // 🖼️ grown-up PIN checked inside
  getPoseWall: function (s, a) { return getPoseWall_(a[0], a[1]); },
  hidePoseWallPhoto: function (s, a) { return hidePoseWallPhoto_(String(a[0] || ''), String(a[1] || '')); },
  sendFeedback: function (s, a) { var fb = a[0] || {}; fb.player = s.p; return sendFeedback(fb); },
  getMyFeedback: function (s, a) { return getMyFeedback(s.p); },
  verifyAdminPin: function (s, a) { return verifyAdminPin(String(a[0] || '')); },   // screen-time lock unlock (UiKit)
  getModesFor: function (s, a) { return getModesFor(posePartyName_(s, a[0]), 'pose-party'); },   // ✨ modes-3: Also try banner
  markModeTried: function (s, a) { return markModeTried(posePartyName_(s, a[0]), 'pose-party', String(a[2] || '')); },   // ✨ modes-3: Pose Party modes only
};
function poseCall_(s, fn, args) {
  if (!Object.prototype.hasOwnProperty.call(POSE_CALLS_, fn)) throw new Error('Not allowed from the camera page: ' + fn);
  return POSE_CALLS_[fn](s, Array.isArray(args) ? args : []);
}
function poseStripSecrets_(st) { // the camera page never needs PINs or grown-up settings
  if (!st) return;
  Object.keys(st).forEach(function (k) { if (/pin|password|secret|admin/i.test(k)) delete st[k]; });
}
function poseCleanStats_(st) {
  var out = {}, src = st || {};
  ['poses', 'perfect', 'bestPct', 'speedBest', 'copyBest', 'danceBest', 'groupBest', 'booths', 'statueBest', 'freezeBest', 'freezeSecs', 'mirrorBest', 'lettersMade', 'posesBuilt'].forEach(function (k) { var v = Number(src[k]); if (isFinite(v) && v >= 0) out[k] = Math.min(Math.round(v), k === 'danceBest' ? 1000000 : 10000); });
  return out;
}
function poseCleanExtra_(x) {
  var e = x || {};
  return { timeSec: Math.max(0, Math.min(36000, Number(e.timeSec) || 0)), stars: Math.max(0, Math.min(3, Number(e.stars) || 0)),
    theme: String(e.theme || '').slice(0, 20), score: Math.max(0, Math.min(1000000, Math.round(Number(e.score) || 0))),
    cleared: e.cleared !== false, stats: poseCleanStats_(e.stats) };
}

// 📸 Pose collection per look: Settings Poses_<Name> = {skin: {poseId: best %}}
function poseCollection_(name) {
  return jsonSetting_(getSettings(), 'Poses_' + name, {});
}
function savePoseCollection(name, add) {
  if (!name) throw new Error('Pick a player first.');
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var all = poseCollection_(name), n = 0;
    Object.keys(add || {}).slice(0, 12).forEach(function (sk) {
      if (!/^[a-z]{2,12}$/.test(sk)) return;
      var box = all[sk] || (all[sk] = {});
      Object.keys(add[sk] || {}).slice(0, 200).forEach(function (id) {
        if (!/^[a-z0-9]{2,20}$/.test(id)) return;
        var v = Math.max(0, Math.min(100, Math.round(Number(add[sk][id]) || 0)));
        if (!box[id] || box[id] < v) { box[id] = v; n++; }
      });
    });
    if (n) saveSetting('Poses_' + name, JSON.stringify(all));
    return { poses: all, added: n };
  } finally { lock.releaseLock(); }
}
// 📸 Photo Booth favourite DESIGN (layout, colours, text, sticker spots — never photos): Settings Booth_<Name>
function saveBoothDesign(name, json) {
  if (!name) throw new Error('Pick a player first.');
  var txt = String(json || '');
  if (txt.length > 8000) throw new Error('That design is too big to save.');
  var d; try { d = JSON.parse(txt); } catch (e) { throw new Error('That design could not be read.'); }
  if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('That design could not be read.');
  if (/data:|https?:/i.test(txt)) throw new Error('A design cannot hold pictures or links.');
  saveSetting('Booth_' + name, txt);
  return { ok: true };
}

/* ================= 🖼️ WALL OF POSES (S3) =================
   Photos are kept ONLY when a grown-up types the Admin PIN. Each photo is saved twice in the family Drive folder
   "Pose Party Images - Consented only" (next to the spreadsheet; Settings PoseWallFolderId overrides):
     Original/  = the camera's own size      App/ = small copy the app shows on the Wall
   Tab "Pose Wall" = one row per photo. Taking a photo down (grown-up PIN) moves both files to the Drive bin + Shown = no. */
var POSE_WALL_TAB_ = 'Pose Wall';
var POSE_WALL_FOLDER_ = 'Pose Party Images - Consented only';
var POSE_WALL_HEAD_ = [['Photo ID', 'Made by the app'], ['Date', 'When the grown-up said OK'], ['Player', 'Who is in the photo (the player whose turn it was)'],
  ['Pose', 'Pose id'], ['Pose name', 'Pose name + emoji'], ['Match %', 'How close the pose was'], ['Look', 'Pose Party look'], ['Mode', 'Classic / Speed / Copy / Group / Dance'],
  ['Original file', 'Drive file id in Original/'], ['App file', 'Drive file id in App/'], ['Size', 'Original width × height'], ['Shown', 'yes = on the Wall · no = taken down']];
var POSE_WALL_W_ = POSE_WALL_HEAD_.length;
var POSE_JPEG_ = /^data:image\/jpeg;base64,([A-Za-z0-9+\/=]+)$/;

function poseWallSheet_() {
  var ss = ss_(), sh = ss.getSheetByName(POSE_WALL_TAB_);
  if (sh) return sh;
  sh = ss.insertSheet(POSE_WALL_TAB_);
  sh.appendRow(POSE_WALL_HEAD_.map(function (h) { return h[0]; }));
  try {
    var head = sh.getRange(1, 1, 1, POSE_WALL_W_);
    head.setBackground('#9D174D').setFontColor('#FFFFFF').setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
    head.setNotes([POSE_WALL_HEAD_.map(function (h) { return h[1]; })]);
    sh.setRowHeight(1, 40); sh.setFrozenRows(1); sh.setFrozenColumns(3);
    sh.getRange(2, 1, sh.getMaxRows() - 1, POSE_WALL_W_).setNumberFormat('@').setFontSize(10);
    [150, 130, 100, 90, 160, 70, 80, 80, 260, 260, 100, 70].forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
    sh.getRange(1, 1, sh.getMaxRows(), POSE_WALL_W_).applyRowBanding().setHeaderRowColor('#9D174D').setFirstRowColor('#FFFFFF').setSecondRowColor('#FDF2F8');
    sh.protect().setDescription('🔒 STEAM Playground — Pose Wall (app managed; take photos down in Pose Party with the grown-up PIN)').setWarningOnly(true);
  } catch (e) { Logger.log('poseWallSheet_: ' + e.message); }
  return sh;
}
function poseWallFolders_() {
  var id = String(getSettings()['PoseWallFolderId'] || '').trim(), root;
  if (id) root = DriveApp.getFolderById(id);
  else {
    var home = DriveApp.getFileById(SHEET_ID).getParents().next(), it = home.getFoldersByName(POSE_WALL_FOLDER_);
    root = it.hasNext() ? it.next() : home.createFolder(POSE_WALL_FOLDER_);
  }
  var sub = function (n) { var f = root.getFoldersByName(n); return f.hasNext() ? f.next() : root.createFolder(n); };
  return { root: root, orig: sub('Original'), app: sub('App') };
}
function poseNow_() { try { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'); } catch (e) { return new Date().toISOString().slice(0, 16).replace('T', ' '); } }
// photos = [{player, orig, app, pose, poseName, pct, skin, mode, w, h}] (orig + app = JPEG data URLs), at most 6 at a time
function savePoseWall_(s, pin, photos) {
  if (!verifyAdminPin(pin)) throw new Error('That grown-up PIN is not right — no photos were kept.');
  var list = Array.isArray(photos) ? photos.slice(0, 6) : [];
  if (!list.length) throw new Error('Pick a photo first.');
  var clean = list.map(function (p) {
    var o = POSE_JPEG_.exec(String(p && p.orig || '')), a = POSE_JPEG_.exec(String(p && p.app || ''));
    if (!o || !a || o[1].length > 3000000 || a[1].length > 400000) throw new Error('A photo could not be read.');
    return { player: posePartyName_(s, p.player), o: o[1], a: a[1], pose: String(p.pose || '').replace(/[^a-z0-9~]/g, '').slice(0, 20),
      poseName: String(p.poseName || '').slice(0, 40), pct: Math.max(0, Math.min(100, Math.round(Number(p.pct) || 0))),
      skin: String(p.skin || '').replace(/[^a-z]/g, '').slice(0, 12), mode: String(p.mode || '').replace(/[^a-z]/g, '').slice(0, 10),
      size: Math.round(Number(p.w) || 0) + '×' + Math.round(Number(p.h) || 0) };
  });
  var F = poseWallFolders_(), sh = poseWallSheet_(), now = poseNow_(), lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var out = clean.map(function (p, i) {
      var id = 'PW-' + Utilities.getUuid().replace(/-/g, '').slice(0, 10), base = p.player + '_' + now.replace(/[^0-9]/g, '') + '_' + (p.pose || 'pose') + '_' + (i + 1);
      var fo = F.orig.createFile(Utilities.newBlob(Utilities.base64Decode(p.o), 'image/jpeg', base + '.jpg'));
      var fa = F.app.createFile(Utilities.newBlob(Utilities.base64Decode(p.a), 'image/jpeg', base + '_app.jpg'));
      sh.appendRow([id, now, p.player, p.pose, p.poseName, String(p.pct), p.skin, p.mode, fo.getId(), fa.getId(), p.size, 'yes']);
      return id;
    });
    return { added: out.length, ids: out };
  } finally { lock.releaseLock(); }
}
function poseWallRows_() {
  var sh = ss_().getSheetByName(POSE_WALL_TAB_);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, POSE_WALL_W_).getValues().map(function (r, i) {
    return { row: i + 2, id: String(r[0]), date: String(r[1]), player: String(r[2]), pose: String(r[3]), poseName: String(r[4]), pct: Number(r[5]) || 0,
      skin: String(r[6]), mode: String(r[7]), orig: String(r[8]), app: String(r[9]), shown: String(r[11]) !== 'no' };
  }).filter(function (o) { return o.id; });
}
// newest first, 18 a page; the small App copies come back as pictures (no Drive links on the page)
function getPoseWall_(player, page) {
  var all = poseWallRows_().filter(function (o) { return o.shown && (!player || o.player === player); }).reverse();
  var players = {}; poseWallRows_().forEach(function (o) { if (o.shown) players[o.player] = (players[o.player] || 0) + 1; });
  var pg = Math.max(0, Math.round(Number(page) || 0)), part = all.slice(pg * 18, pg * 18 + 18);
  return { total: all.length, page: pg, players: players, items: part.map(function (o) {
    var img = ''; try { img = 'data:image/jpeg;base64,' + Utilities.base64Encode(DriveApp.getFileById(o.app).getBlob().getBytes()); } catch (e) {}
    return { id: o.id, date: o.date, player: o.player, pose: o.pose, poseName: o.poseName, pct: o.pct, mode: o.mode, img: img };
  }) };
}
function hidePoseWallPhoto_(pin, id) {
  if (!verifyAdminPin(pin)) throw new Error('That grown-up PIN is not right.');
  var o = poseWallRows_().filter(function (r) { return r.id === id; })[0];
  if (!o) throw new Error('That photo is not on the Wall.');
  [o.orig, o.app].forEach(function (f) { try { DriveApp.getFileById(f).setTrashed(true); } catch (e) {} });
  ss_().getSheetByName(POSE_WALL_TAB_).getRange(o.row, POSE_WALL_W_).setValue('no');
  return { ok: true };
}

/* 🛠️ Pose Builder (S7): a player's own poses, Settings MyPoses_<Name> = JSON list (≤ 30) of {id, e, n, d, own, a{8 angles}} */
function saveMyPoses_(name, json) {
  if (!name) throw new Error('Pick a player first.');
  var list; try { list = JSON.parse(String(json || '[]')); } catch (e) { throw new Error('Those poses could not be read.'); }
  if (!Array.isArray(list)) throw new Error('Those poses could not be read.');
  var keys = ['lu', 'll', 'ru', 'rl', 'lt', 'ls', 'rt', 'rs'];
  var clean = list.slice(0, 30).map(function (p) {
    if (!p || typeof p !== 'object' || !/^my[a-z0-9]{1,12}$/.test(String(p.id))) return null;
    var a = {}, ok = true; keys.forEach(function (k) { var v = Number(p.a && p.a[k]); if (!isFinite(v)) ok = false; a[k] = ((Math.round(v) % 360) + 360) % 360; });
    if (!ok) return null;
    var o = { id: String(p.id), e: String(p.e || '🤸').slice(0, 4), n: String(p.n || 'My pose').replace(/[<>]/g, '').slice(0, 20), d: Math.max(1, Math.min(3, Math.round(Number(p.d) || 1))), own: !!p.own, a: a };
    if (p.b && typeof p.b === 'object') {   // 🧍 S8 body: lean (tk), head line (hd), side-on (sd)
      var tk = Number(p.b.tk), hd = Number(p.b.hd), sd = Number(p.b.sd);
      if (isFinite(tk)) { o.b = { tk: ((Math.round(tk) % 360) + 360) % 360, hd: isFinite(hd) ? ((Math.round(hd) % 360) + 360) % 360 : null, sd: isFinite(sd) ? Math.max(0.05, Math.min(1.2, Math.round(sd * 100) / 100)) : 0.76 }; }
    }
    return o;
  }).filter(Boolean);
  saveSetting('MyPoses_' + name, JSON.stringify(clean));
  return { saved: clean.length };
}
// (11j-S8+modes-3+off-2) END OF PosePartyCode.gs

;
/* ===== PoseTest.gs ===== */
// PoseTest.gs — 📷 Pose Party step S1 (plan 11j): saves camera-test reports from PoseCam.html.
// Separate file so it doesn't clash with other chats editing Code.gs. Uses ss_() from Code.gs.
// Tab "Pose Tests" is made on first use. No photos are ever sent here — text only.

var POSE_TEST_HEAD_ = ['Date', 'Player', 'Device', 'Browser', 'Where', 'Camera', 'Pose finder', 'Runs on',
  'Pictures/sec', 'Find time', 'Most people', 'Body mode', 'Download', 'Full report'];

function savePoseTest(player, text, json) {
  var r = {};
  try { r = JSON.parse(json || '{}'); } catch (e) {}
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = poseTestSheet_();
    var row = [new Date(), String(player || '').slice(0, 40), r.device || '', r.browser || '', r.where || '',
      String(r.camera || '') + (r.cameraError ? ' — ' + r.cameraError : ''), r.detector || '', r.delegate || '',
      r.fps || '', r.detectMs || '', r.peopleMax || 0, r.bodyMode || '', r.download || '', String(text || '').slice(0, 5000)];
    sh.getRange(sh.getLastRow() + 1, 2, 1, row.length - 1).setNumberFormat('@'); // plain text: no auto dates
    sh.appendRow(row);
    sh.getRange(sh.getLastRow(), 1).setNumberFormat('yyyy-mm-dd hh:mm');
  } finally { lock.releaseLock(); }
  return true;
}

function poseTestSheet_() {
  var ss = ss_();
  var sh = ss.getSheetByName('Pose Tests');
  if (sh) return sh;
  sh = ss.insertSheet('Pose Tests');
  sh.getRange(1, 1, 1, POSE_TEST_HEAD_.length).setValues([POSE_TEST_HEAD_])
    .setFontWeight('bold').setBackground('#3b2391').setFontColor('#ffffff').setVerticalAlignment('middle');
  sh.setFrozenRows(1);
  sh.setRowHeight(1, 32);
  sh.setColumnWidth(1, 130);
  for (var c = 2; c < POSE_TEST_HEAD_.length; c++) sh.setColumnWidth(c, 120);
  sh.setColumnWidth(POSE_TEST_HEAD_.length, 420);
  sh.getRange('N:N').setWrap(true);
  return sh;
}
// END OF PoseTest.gs

;
/* ===== ArtifactoryCode.gs ===== */
// ArtifactoryCode.gs — 🏭 Artifactory (artifact + factory): the maker app's server side.
// Own file because Code.gs is past ~300 KB. Same global scope as Code.gs (uses getSettings, saveSetting, activePlayers_, …).
//  · Materials are COUNTS, never a log: Settings `Bag_<Name>` = {"oak": 3, …, "_d": "yyyy-MM-dd" (last daily delivery)} and
//    `FamilyShelf` = {"m": {mat: n}, "req": [{id, by, mat, n, got, at}]} (requests capped at 20).
//  · Crafted things live in the tab "Artifacts" (one row per item; Look / Materials / Tools / Owners / Team / Votes as JSON).
//  · Outfits: Settings `Outfits_<Name>` = [{n: name, av: avatar}] (≤ 6).
//  · Crafted wearables are worn through the avatar's `cw` field ({head|neck|wrist|ring|hand: {id, …look}}); the server always
//    copies the look from the Artifacts row (artWear_) so nobody can wear a thing they don't own.
//  · Blueprint challenges save on the Archive board `artifactory` (Theme = "<station> · <thing>", best per station in the detail card).

/* ---------- materials ---------- */
// id: [icon, name, group]. Keep in step with Artifactory.html ART.MATS and AvatarKit ART_MAT (colours).
const ART_MATS_ = {
  oak: ['🪵', 'Oak', 'wood'], bamboo: ['🎋', 'Bamboo', 'wood'], teak: ['🟫', 'Teak', 'wood'],
  iron: ['⚙️', 'Iron', 'metal'], copper: ['🟠', 'Copper', 'metal'], tin: ['🥫', 'Tin', 'metal'], bronze: ['🥉', 'Bronze', 'metal'], silver: ['🥈', 'Silver', 'metal'], gold: ['🥇', 'Gold', 'metal'],
  granite: ['🪨', 'Granite', 'stone'], jade: ['💚', 'Jade', 'stone'], crystal: ['💎', 'Crystal', 'stone'], ruby: ['❤️', 'Ruby', 'stone'], sapphire: ['💙', 'Sapphire', 'stone'], amethyst: ['💜', 'Amethyst', 'stone'],
  clay: ['🏺', 'Clay', 'craft'], fabric: ['🧶', 'Fabric', 'craft'], leather: ['👜', 'Leather-look', 'craft'], glass: ['🫙', 'Glass', 'craft'], filament: ['🧵', 'Plastic filament', 'craft'],
  led: ['💡', 'LEDs', 'parts'], battery: ['🔋', 'Batteries', 'parts'], paint: ['🎨', 'Paint', 'finish'], varnish: ['✨', 'Varnish', 'finish'], dye: ['🧪', 'Dyes', 'finish'],
  flower: ['🌸', 'Flowers', 'nature'], sand: ['⏳', 'Sand', 'nature'],
  zinc: ['🔘', 'Zinc', 'metal'], carbon: ['⚫', 'Charcoal', 'nature'], cobalt: ['🔵', 'Cobalt', 'nature'], alum: ['🧂', 'Alum', 'craft'],
  brass: ['🎺', 'Brass', 'metal'], steel: ['🔩', 'Steel', 'metal'], sglass: ['🔷', 'Blue glass', 'craft'], fdye: ['🌈', 'Fixed dye', 'finish'],   // 🧪 bp-5 lab
};
const ART_STARTER_ = { oak: 6, bamboo: 4, teak: 2, copper: 4, tin: 2, silver: 3, gold: 3, iron: 2, granite: 3, jade: 2, crystal: 2, ruby: 1, amethyst: 1, paint: 6, varnish: 3, clay: 3, fabric: 2, sand: 2 };
// daily delivery: 3 picks, common things more often
const ART_DAILY_ = ['oak', 'oak', 'bamboo', 'bamboo', 'teak', 'copper', 'copper', 'tin', 'iron', 'silver', 'gold', 'granite', 'granite', 'jade', 'crystal', 'ruby', 'sapphire', 'amethyst', 'paint', 'paint', 'varnish', 'clay', 'fabric', 'sand', 'led', 'battery', 'flower', 'dye', 'zinc', 'carbon', 'cobalt', 'alum'];
const ART_BAG_MAX_ = 999;

/* ---------- what each station makes ---------- */
// kind: [station, wear slot ('' = not worn), main cost, name, icon, what it's for]
const ART_KINDS_ = {
  cup: ['lathe', 'hand', 2, 'Cup', '🥤', 'Hold it — or put it on a shelf'],
  bangle: ['lathe', 'wrist', 1, 'Bangle', '⭕', 'Wear it on your wrist'],
  pen: ['lathe', 'hand', 1, 'Pen', '🖊️', 'Hold it — a maker always has a pen'],
  yoyo: ['lathe', 'hand', 1, 'Yo-yo', '🪀', 'Hold it and do tricks'],
  piece: ['lathe', 'hand', 1, 'Chess piece', '♟️', 'A game piece — game skins come later'],
  trophy: ['lathe', 'hand', 3, 'Trophy', '🏆', 'Hold it high!'],
  ball: ['lathe', 'hand', 2, 'Ball', '⚽', 'Hold it — or play catch'],
  tbowl: ['lathe', '', 2, 'Turned bowl', '🥣', 'A wooden bowl, hollowed on the lathe'],
  box: ['lathe', '', 2, 'Lidded box', '🫙', 'A round box with a lid for your treasures'],
  goblet: ['lathe', 'hand', 2, 'Goblet', '🍷', 'A cup on a stem — raise a toast!'],
  gem: ['stone', '', 0, 'Gem', '💎', 'A loose gem — set it later or keep it'],
  ring: ['stone', 'ring', 1, 'Ring', '💍', 'Wear it on your finger'],
  necklace: ['stone', 'neck', 1, 'Necklace', '📿', 'Wear it round your neck'],
  crown: ['stone', 'head', 3, 'Crown', '👑', 'Wear it on your head'],
  tag: ['stone', '', 1, 'Pet tag', '🏷️', 'A tag for your pet'],
  // round 2 (af-2): the rest of the Machine Hall
  board: ['planer', 'hand', 1, 'Name board', '🪵', 'Hold it or hang it — engrave your name'],
  frame: ['planer', 'hand', 2, 'Picture frame', '🖼️', 'A frame for your best picture'],
  stand: ['planer', 'hand', 2, 'Display stand', '🏛️', 'Show off your best thing'],
  badge: ['weld', 'neck', 1, 'Hero badge', '🛡️', 'Pin it on'],
  robot: ['weld', 'hand', 2, 'Mini robot', '🤖', 'A little metal friend to hold'],
  sign: ['weld', 'hand', 2, 'Name sign', '🪧', 'Hold up your name'],
  medal: ['forge', 'neck', 1, 'Medal', '🏅', 'Wear it round your neck'],
  key: ['forge', 'hand', 1, 'Key', '🗝️', 'A key you forged yourself'],
  charm: ['forge', 'neck', 1, 'Heart charm', '💖', 'Wear it round your neck'],
  bowl: ['pottery', 'hand', 2, 'Bowl', '🥣', 'Hold it — or fill it with snacks'],
  vase: ['pottery', 'hand', 3, 'Vase', '🏺', 'For flowers'],
  petbowl: ['pottery', '', 2, 'Pet bowl', '🐾', 'A bowl for your pet'],
  scarf: ['sew', 'neck', 1, 'Scarf', '🧣', 'Wear it round your neck'],
  cape: ['sew', 'back', 2, 'Cape', '🦸', 'Wear it on your back'],
  bag: ['sew', 'hand', 2, 'Bag', '👜', 'Carry it'],
  flag: ['sew', 'hand', 1, 'Flag', '🚩', 'Wave it'],
  lantern: ['light', 'hand', 1, 'Lantern', '🏮', 'A glowing light to hold'],
  // round 3 (af-3): HandCraft Room — a 7th entry = the only materials this kind takes
  spoon: ['whittle', 'hand', 1, 'Spoon', '🥄', 'Stir your cocoa with it'],
  whistle: ['whittle', 'hand', 1, 'Whistle', '🎶', 'Blow it — tweet!'],
  figure: ['whittle', 'hand', 1, 'Carved figure', '🗿', 'A little wooden friend'],
  owl: ['whittle', 'hand', 1, 'Owl', '🦉', 'A wise little owl'], fish: ['whittle', 'hand', 1, 'Fish', '🐟', 'A fish that never needs water'], cat: ['whittle', 'hand', 1, 'Cat', '🐱', 'A cat that sits still'], boat: ['whittle', 'hand', 1, 'Boat', '⛵', 'A little sailing boat'], bear: ['whittle', 'hand', 1, 'Bear', '🐻', 'A friendly bear'], turtle: ['whittle', 'hand', 1, 'Turtle', '🐢', 'A slow and steady turtle'],   // 🔪 bp-3 carved figures
  pshape: ['print', 'hand', 1, '3D-printed shape', '🔷', 'Any shape you draw, printed'],
  pspin: ['print', 'hand', 2, '3D-printed tower', '🗼', 'A spun shape, printed layer by layer'],
  basket: ['nature', 'hand', 2, 'Basket', '🧺', 'Carry your treasures', ['bamboo']],
  hat: ['nature', 'head', 2, 'Bamboo hat', '👒', 'Wear it in the sun', ['bamboo']],
  fcharm: ['nature', 'neck', 2, 'Flower charm', '🌸', 'Flowers pressed in clear resin', ['flower']],
};
const ART_STATIONS_ = { lathe: ['🌀', 'Lathe'], finish: ['🎨', 'Finish bench'], stone: ['💎', 'Stone polishing'], planer: ['🪚', 'Planer + sander'], weld: ['🔥', 'Welding'], forge: ['⚒️', 'Forge'], pottery: ['🏺', 'Pottery wheel'], sew: ['🧵', 'Sewing + loom'], light: ['🔌', 'Light-up bench'], whittle: ['🔪', 'Whittling'], print: ['🖨️', '3D printing'], nature: ['🌿', 'Nature crafts'], lab: ['🧪', 'Material lab'] };
// what each round-2 station takes (the player picks one; the kind says how many)
const ART_STATION_MATS_ = { whittle: ['oak', 'bamboo', 'teak'], print: ['filament'], nature: ['bamboo', 'flower'], planer: ['oak', 'bamboo', 'teak'], weld: ['iron', 'copper', 'tin', 'bronze', 'silver', 'gold', 'brass', 'steel'], forge: ['iron', 'copper', 'tin', 'bronze', 'silver', 'gold', 'brass', 'steel'], pottery: ['clay'], sew: ['fabric', 'leather'] };
// round 2 opening gift (once per bag): materials for the new machines
const ART_GIFT2_ = { iron: 3, copper: 2, clay: 6, fabric: 4, led: 3, battery: 3, glass: 2, dye: 2 };
const ART_GIFT3_ = { filament: 5, flower: 5, sand: 3, bamboo: 3, oak: 2 };   // af-3 opening gift: HandCraft Room
// 🧪 material lab recipes (keep in step with Artifactory.html AF.LAB)
const ART_LAB_ = { bronze: { in: { copper: 2, tin: 1 }, out: { bronze: 2 } }, glass: { in: { sand: 2 }, out: { glass: 1 } }, dye: { in: { flower: 1 }, out: { dye: 2 } }, paint: { in: { dye: 1 }, out: { paint: 2 } },
  brass: { in: { copper: 2, zinc: 1 }, out: { brass: 2 } }, steel: { in: { iron: 2, carbon: 1 }, out: { steel: 2 } }, sglass: { in: { sand: 2, cobalt: 1 }, out: { sglass: 1 } }, fdye: { in: { dye: 1, alum: 1 }, out: { fdye: 2 } } };   // 🧪 bp-5
const ART_LATHE_MATS_ = ['oak', 'bamboo', 'teak', 'copper', 'tin', 'silver', 'gold', 'granite', 'jade'];
const ART_STONES_ = ['granite', 'jade', 'crystal', 'ruby', 'sapphire', 'amethyst'];
const ART_SETTINGS_ = ['copper', 'tin', 'iron', 'bronze', 'silver', 'gold'];
const ART_PER_PLAYER_ = 60;
const ART_WEAR_SLOTS_ = ['head', 'neck', 'wrist', 'ring', 'hand', 'back'];

/* ---------- tab: Artifacts ---------- */
const ART_TAB = 'Artifacts';
const ART_COL = { id: 0, maker: 1, station: 2, kind: 3, name: 4, look: 5, mats: 6, tools: 7, owners: 8, team: 9, made: 10, stars: 11, from: 12, show: 13, votes: 14, deleted: 15, desc: 16 };
const ART_HEADERS = [
  ['Item ID', 'itemId', 'Made by the app. Do not edit.'],
  ['Maker', 'maker', 'Who made it (Profiles name)'],
  ['Station', 'station', 'lathe · finish · stone … (where it was made)'],
  ['Kind', 'kind', 'cup · bangle · pen · yoyo · piece · trophy · ball · gem · ring · necklace · crown · tag'],
  ['Name', 'name', 'The name the maker gave it'],
  ['Look', 'look', 'Shape, material, paint, gem … (JSON)'],
  ['Materials', 'materials', 'Materials used, as counts (JSON)'],
  ['Tools', 'tools', 'Stations used, as a JSON list'],
  ['Owners', 'owners', 'Who has it (JSON list)'],
  ['Team', 'team', 'Made together with (JSON list)'],
  ['Made', 'made', 'yyyy-MM-dd HH:mm'],
  ['Stars', 'stars', 'Best blueprint stars 0-3'],
  ['From', 'from', 'Remix of this item ID'],
  ['In the show', 'inShow', 'yes = in the Design Show'],
  ['Votes', 'votes', 'JSON {voter: stars 1-3}'],
  ['Deleted', 'deleted', 'yes = the maker removed it'],
  ['Story', 'desc', 'What the maker wrote about it (optional, bp-1)'],
];
const ART_WIDTH = ART_HEADERS.length;
function artSheet_() {
  let sh = ss_().getSheetByName(ART_TAB);
  if (!sh) {
    sh = ss_().insertSheet(ART_TAB);
    sh.getRange(1, 1, 1, ART_WIDTH).setValues([ART_HEADERS.map(h => h[0] + '\n' + h[1])]);
    styleArtifactsSheet();
  }
  return sh;
}
// Look of the Artifacts tab (sheet standard). Safe to re-run from the editor.
function styleArtifactsSheet() {
  const sh = ss_().getSheetByName(ART_TAB);
  if (!sh) return;
  try {
    const head = sh.getRange(1, 1, 1, ART_WIDTH);
    head.setValues([ART_HEADERS.map(h => '🔒 ' + h[0] + '\n' + h[1])])
      .setBackground('#7C3AED').setFontColor('#FFFFFF').setFontWeight('bold')
      .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
    head.setNotes([ART_HEADERS.map(h => h[2])]);
    sh.setRowHeight(1, 46); sh.setFrozenRows(1); sh.setFrozenColumns(2);
    sh.getRange(2, 1, sh.getMaxRows() - 1, ART_WIDTH).setNumberFormat('@').setFontSize(10).setVerticalAlignment('middle').setWrap(false);
    [150, 110, 80, 80, 150, 240, 160, 140, 160, 120, 130, 60, 120, 70, 160, 70, 260].forEach((w, i) => sh.setColumnWidth(i + 1, w));
    sh.getRange(2, 1, sh.getMaxRows() - 1, 1).setFontFamily('Roboto Mono').setFontColor('#757575');
    sh.getBandings().forEach(b => b.remove());
    sh.getRange(1, 1, sh.getMaxRows(), ART_WIDTH).applyRowBanding().setHeaderRowColor('#7C3AED').setFirstRowColor('#FFFFFF').setSecondRowColor('#F3EEFF');
    sh.getProtections(SpreadsheetApp.ProtectionType.SHEET)
      .filter(p => String(p.getDescription()).indexOf('🔒 STEAM Playground') === 0).forEach(p => p.remove());
    sh.protect().setDescription('🔒 STEAM Playground — Artifacts (app managed)').setWarningOnly(true);
  } catch (e) {
    Logger.log('styleArtifactsSheet: ' + e.message);
  }
}
let ARTS_MEMO_ = null;
function artRows_() {
  if (ARTS_MEMO_ && ARTS_MEMO_.ss === ss_()) return ARTS_MEMO_.rows;
  const sh = ss_().getSheetByName(ART_TAB), C = ART_COL;
  let rows = [];
  if (sh && sh.getLastRow() > 1) {
    const j = (v, f) => { try { const x = JSON.parse(v || ''); return x == null ? f : x; } catch (e) { return f; } };
    rows = sh.getRange(2, 1, sh.getLastRow() - 1, ART_WIDTH).getValues().map((r, i) => ({
      row: i + 2, id: String(r[C.id]).trim(), maker: String(r[C.maker]), station: String(r[C.station]), kind: String(r[C.kind]), name: String(r[C.name]),
      look: j(r[C.look], {}), mats: j(r[C.mats], {}), tools: j(r[C.tools], []), owners: j(r[C.owners], []), team: j(r[C.team], []), made: String(r[C.made]),
      stars: Number(r[C.stars]) || 0, from: String(r[C.from] || ''), show: String(r[C.show]).toLowerCase() === 'yes', votes: j(r[C.votes], {}),
      deleted: String(r[C.deleted]).toLowerCase() === 'yes', desc: String(r[C.desc] || '') })).filter(a => a.id && !a.deleted && ART_KINDS_[a.kind]);
  }
  ARTS_MEMO_ = { ss: ss_(), rows: rows };
  return rows;
}
function writeArt_(a) {
  const sh = artSheet_(), row = [a.id, a.maker, a.station, a.kind, a.name, JSON.stringify(a.look || {}), JSON.stringify(a.mats || {}), JSON.stringify(a.tools || []), JSON.stringify(a.owners || []),
    JSON.stringify(a.team || []), a.made, String(a.stars || 0), a.from || '', a.show ? 'yes' : '', JSON.stringify(a.votes || {}), a.deleted ? 'yes' : '', a.desc || ''];
  try { if (!sh.getRange(1, ART_WIDTH, 1, 1).getValues()[0][0]) { const h = ART_HEADERS[ART_WIDTH - 1]; sh.getRange(1, ART_WIDTH, 1, 1).setValues([['🔒 ' + h[0] + '\n' + h[1]]]); } } catch (e) {}   // 📝 the Story column (bp-1) on an older tab
  if (a.row) sh.getRange(a.row, 1, 1, ART_WIDTH).setValues([row]);
  else { const r = sh.getLastRow() + 1; sh.getRange(r, 1, 1, ART_WIDTH).setNumberFormat('@').setValues([row]); a.row = r; }
  ARTS_MEMO_ = null;
}
function publicArt_(a) {
  return { id: a.id, maker: a.maker, station: a.station, kind: a.kind, name: a.name, look: a.look, mats: a.mats, tools: a.tools, owners: a.owners, team: a.team, made: a.made, stars: a.stars, from: a.from, desc: a.desc || '', show: a.show, votes: a.show ? a.votes || {} : {} };
}
function artsOf_(name) { return artRows_().filter(a => a.owners.indexOf(name) !== -1); }

/* ---------- looks (kept small and safe) ---------- */
const ART_HEX_ = /^#[0-9a-fA-F]{6}$/;
function artInt_(v, lo, hi) { const n = Math.floor(Number(v)); return isNaN(n) ? lo : Math.max(lo, Math.min(hi, n)); }
// {k kind, m material, p profile (16 × 0-20, lathe), c paint, v varnish, s stickers, e engraving, g gem, cut, q quality, gl glow}
function cleanArtLook_(kind, look) {
  look = look || {};
  const out = { k: kind };
  if (ART_MATS_[look.m]) out.m = String(look.m);
  if (Array.isArray(look.p)) { const p = look.p.slice(0, 24).map(x => artInt_(x, 0, 20)); if (p.length >= 6) out.p = p; }
  if (Array.isArray(look.pi)) { const pi = look.pi.slice(0, 16).map(x => artInt_(x, 0, 20)); if (pi.length === 16 && pi.some(v => v > 0)) out.pi = pi; }   // 🌀 hollow inside (bp-1)
  if (ART_TESTS_[look.br]) out.br = String(look.br);   // 💥 broken by a test (bp-5)
  if (look.kg) out.kg = 1;   // ✨ kintsugi gold seams
  if (look.rp) out.rp = artInt_(look.rp, 0, 99);   // 🔧 times repaired
  if (/^[0-9a-f]{64}$/.test(String(look.fg || ''))) out.fg = String(look.fg);   // ⚒️ the forged shape, 16×16 (bp-2)
  if (look.tc != null) out.tc = artInt_(look.tc, 0, 3);   // 🌈 temper colour
  if (Array.isArray(look.tw) && look.tw.length === 2) out.tw = look.tw.map(x => artInt_(x, 0, 15));   // 🌪️ twisted part
  if (ART_HEX_.test(String(look.c || ''))) out.c = String(look.c);
  if (look.v) out.v = 1;
  if (Array.isArray(look.s)) { const s = look.s.slice(0, 3).map(x => artInt_(x, 0, 7)); if (s.length) out.s = s; }
  const e = String(look.e || '').replace(/[<>"'`\\]/g, '').trim().slice(0, 12); if (e) out.e = e;
  if (ART_STONES_.indexOf(look.g) !== -1) out.g = String(look.g);
  if (look.cut != null) out.cut = artInt_(look.cut, 0, 4);
  if (look.q != null) out.q = artInt_(look.q, 0, 100);
  if (look.gl) out.gl = 1;
  if (look.th != null) out.th = artInt_(look.th, 0, 20);
  if (/^[01]{36}$/.test(String(look.wv || ''))) out.wv = String(look.wv);
  if (ART_HEX_.test(String(look.c2 || ''))) out.c2 = String(look.c2);
  if (ART_HEX_.test(String(look.lc || ''))) out.lc = String(look.lc);
  if (Number(look.ku) > 0) out.ku = Math.floor(Number(look.ku));
  if (Array.isArray(look.ol) && look.ol.length === 24) out.ol = look.ol.map(x => artInt_(x, 1, 20));
  if (Array.isArray(look.fl)) { const fl = look.fl.slice(0, 3).filter(f => Array.isArray(f)).map(f => [artInt_(f[0], 0, 20), artInt_(f[1], 0, 20)]); if (fl.length) out.fl = fl; }
  return out;
}
// Avatar `cw` (crafted wear) structure check — ownership is checked in artWear_ (saveAvatar / outfits).
function cleanCraftWear_(cw) {
  if (!cw || typeof cw !== 'object') return null;
  const out = {};
  ART_WEAR_SLOTS_.forEach(slot => {
    const it = cw[slot]; if (!it || typeof it !== 'object' || !it.id) return;
    const kind = String(it.k || ''); if (!ART_KINDS_[kind] || ART_KINDS_[kind][1] !== slot) return;
    const look = cleanArtLook_(kind, it); look.id = String(it.id).slice(0, 24); out[slot] = look;
  });
  return Object.keys(out).length ? out : null;
}
// Only things this player owns can be worn; the look always comes from the Artifacts row.
function artWear_(name, cw) {
  const clean = cleanCraftWear_(cw); if (!clean) return null;
  const mine = artsOf_(name), out = {};
  Object.keys(clean).forEach(slot => { const a = mine.find(x => x.id === clean[slot].id); if (a && !a.look.br && ART_KINDS_[a.kind][1] === slot) out[slot] = Object.assign(cleanArtLook_(a.kind, a.look), { id: a.id }); });
  return Object.keys(out).length ? out : null;
}

/* ---------- bag + family shelf (counts) ---------- */
function artBag_(st, name) {
  let b = null; try { b = JSON.parse(st['Bag_' + name] || ''); } catch (e) { b = null; }
  if (!b || typeof b !== 'object') b = Object.assign({}, ART_STARTER_);
  const out = {}; Object.keys(ART_MATS_).forEach(m => { const n = artInt_(b[m], 0, ART_BAG_MAX_); if (n) out[m] = n; });
  if (b._d) out._d = String(b._d);
  if (!b._g2) { artAdd_(out, ART_GIFT2_); }   // af-2 opening gift for the new machines (kept once the bag is saved)
  out._g2 = 1;
  if (!b._g3) { artAdd_(out, ART_GIFT3_); }
  out._g3 = 1;
  if (!b._g5) { artAdd_(out, ART_GIFT5_); }   // 🧪 bp-5 lab gift
  out._g5 = 1;
  if (b._dd === today_()) out._dn = artInt_(b._dn, 0, 999), out._dd = String(b._dd);   // game drops today (R4)
  if (b._wd === today_()) out._wn = artInt_(b._wn, 0, 99), out._wd = String(b._wd);   // 📝 story bonuses today (bp-1)
  return out;
}
function artSaveBag_(name, bag) { saveSetting('Bag_' + name, JSON.stringify(bag)); return bag; }
function artShelfOf_(st) {
  let s = null; try { s = JSON.parse(st.FamilyShelf || ''); } catch (e) { s = null; }
  s = s && typeof s === 'object' ? s : {};
  const m = {}; Object.keys(ART_MATS_).forEach(k => { const n = artInt_((s.m || {})[k], 0, ART_BAG_MAX_); if (n) m[k] = n; });
  const req = (Array.isArray(s.req) ? s.req : []).filter(r => r && ART_MATS_[r.mat]).slice(-20).map(r => ({ id: String(r.id), by: String(r.by), mat: String(r.mat), n: artInt_(r.n, 1, 20), got: artInt_(r.got, 0, 20), at: Number(r.at) || 0 }));
  return { m: m, req: req };
}
function artSaveShelf_(s) { saveSetting('FamilyShelf', JSON.stringify(s)); return s; }
function artTake_(bag, cost) {   // cost = {mat: n} → throws if short
  Object.keys(cost).forEach(m => { if ((bag[m] || 0) < cost[m]) throw new Error('Not enough ' + ART_MATS_[m][1].toLowerCase() + ' — you have ' + (bag[m] || 0) + ', need ' + cost[m] + '.'); });
  Object.keys(cost).forEach(m => { bag[m] = (bag[m] || 0) - cost[m]; if (!bag[m]) delete bag[m]; });
  return bag;
}
function artAdd_(bag, add) { Object.keys(add || {}).forEach(m => { if (ART_MATS_[m]) bag[m] = Math.min(ART_BAG_MAX_, (bag[m] || 0) + artInt_(add[m], 0, ART_BAG_MAX_)); if (!bag[m]) delete bag[m]; }); return bag; }

/* ---------- boot ---------- */
function getArtifactoryData(player) {
  const out = getLevelGameData('artifactory', player);
  const players = activePlayers_(listProfilesFull()), st = out.settings || getSettings();
  const me = player && players.some(p => p.Name === player) ? player : '';
  const items = me ? itemsFor_(me, players) : { owned: {}, ways: {} };
  out.player = me;
  out.bag = me ? artBag_(st, me) : {};
  out.dailyReady = !!me && out.bag._d !== today_();
  out.shelf = artShelfOf_(st);
  out.arts = me ? artsOf_(me).map(publicArt_) : [];
  out.items = { lines: itemMeta_(), owned: items.owned, ways: items.ways, seen: me ? seenFor_(st, me) : {} };
  out.outfits = me ? jsonSetting_(st, 'Outfits_' + me, []) : [];
  out.hasPin = !!(me && st['PlayerPIN_' + me]);
  out.creations = creationRows_().filter(c => players.some(p => p.Name === c.maker)).map(c => publicCreation_(c, me));   // 🔨 Furniture Workshop area
  out.giftsLeft = me ? giftsLeft_(st, me) : 0;
  out.mats = ART_MATS_; out.kinds = ART_KINDS_;
  out.show = artShowList_(players);   // 🎭 Design Show (af-4)
  out.dropsLeft = me ? ART_DROP_CAP_ - (out.bag._dd === today_() ? out.bag._dn || 0 : 0) : 0;
  out.bp = me ? jsonSetting_(st, 'ArtBP_' + me, {}) : {};   // 📘 best ⭐ per blueprint (bp-1)
  out.chal = jsonSetting_(st, 'ArtChal', {});              // 🏆 family top 5 per challenge
  out.descLeft = me ? ART_DESC_CAP_ - (out.bag._wd === today_() ? out.bag._wn || 0 : 0) : 0;
  const dl = me ? jsonSetting_(st, 'ArtDaily_' + me, {}) : {};   // 📅 🏅 👪 (bp-4)
  out.daily = { id: artDailyId_(), done: dl.d === today_(), streak: dl.d === today_() || dl.d === artYesterday_() ? dl.s || 0 : 0, best: dl.best || 0 };
  out.fam = jsonSetting_(st, 'ArtFamBP', []);
  return out;
}
function checkArtPlayer_(name) { checkPlayer_(name); }

/* ---------- 🎁 daily delivery: 3 materials once a day ---------- */
function artClaimDaily(name) {
  checkArtPlayer_(name);
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const bag = artBag_(getSettings(), name), day = today_();
    if (bag._d === day) return { bag: bag, got: {}, already: true };
    const got = {}; let h = 0; const key = name + day; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    for (let i = 0; i < 3; i++) { h = (h * 1103515245 + 12345) >>> 0; const m = ART_DAILY_[h % ART_DAILY_.length]; got[m] = (got[m] || 0) + 1; }
    artAdd_(bag, got); bag._d = day; artSaveBag_(name, bag);
    safeRecordFeats_(name, 'artifactory', { daily: 1 });
    return { bag: bag, got: got };
  } finally { lock.releaseLock(); }
}

/* ---------- 🔨 make something ---------- */
// req = {station, kind, mat, setting (stone station: metal for the setting), look, name, blueprint: {level, score, stars, timeSec}}
function artCraft(name, req) {
  checkArtPlayer_(name);
  req = req || {};
  const kind = String(req.kind || ''), K = ART_KINDS_[kind];
  if (!K) throw new Error('Pick something to make.');
  const station = K[0], cost = {};
  if (station === 'lathe') {
    if (ART_LATHE_MATS_.indexOf(req.mat) === -1) throw new Error('Pick a blank to turn.');
    cost[req.mat] = K[2];
  } else if (station === 'stone') {
    if (ART_STONES_.indexOf(req.mat) === -1) throw new Error('Pick a rough stone.');
    cost[req.mat] = 1;
    if (K[2]) { if (ART_SETTINGS_.indexOf(req.setting) === -1) throw new Error('Pick a metal for the setting.'); cost[req.setting] = (cost[req.setting] || 0) + K[2]; }
  } else if (station === 'light') {
    cost.glass = 1; cost.led = 1; cost.battery = 1;
  } else if (ART_STATION_MATS_[station]) {
    if ((K[6] || ART_STATION_MATS_[station]).indexOf(req.mat) === -1) throw new Error('Pick what to make it from.');
    cost[req.mat] = K[2];
  }
  const need = ART_BP_NEED_[String(req.bp || '')];   // 🧪 bp-5
  if (need && req.blueprint) { if (station === 'forge' || station === 'weld') { if (req.mat !== need) throw new Error('This blueprint is made of ' + ART_MATS_[need][1] + ' — make it in the 🧪 Material lab.'); } else if (station === 'light') { delete cost.glass; cost[need] = 1; } else cost[need] = (cost[need] || 0) + 1; }
  const live = activePlayers_(listProfilesFull()).map(p => p.Name);
  const team = (Array.isArray(req.team) ? req.team : []).map(String).filter((n, i, a) => n !== name && live.indexOf(n) !== -1 && a.indexOf(n) === i).slice(0, 3);   // 🤝 team project
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    if (artRows_().filter(a => a.maker === name).length >= ART_PER_PLAYER_) throw new Error('Your maker shelf is full (' + ART_PER_PLAYER_ + ' things) — recycle one first.');
    const bag = artTake_(artBag_(getSettings(), name), cost);
    const look = cleanArtLook_(kind, req.look);
    if (station === 'lathe') { look.m = req.mat; delete look.g; }
    if (station === 'stone') { look.g = req.mat; if (K[2]) look.m = req.setting; else delete look.m; }
    if (ART_STATION_MATS_[station]) { look.m = req.mat; delete look.g; }
    delete look.ku;   // 🏺 the kiln takes the same ~5 s waiting step as every machine (Aowu 2026-11-09)
    if (station === 'light') { look.gl = 1; if (!look.lc) look.lc = '#FFE45C'; }
    var bp = req.blueprint && typeof req.blueprint === 'object' ? req.blueprint : null;
    var stars = bp ? artInt_(bp.stars, 0, 3) : 0;
    const title = String(req.name || '').replace(/[<>"`\\]/g, '').trim().slice(0, 28) || (name + "'s " + ART_KINDS_[kind][3]);
    const desc = artCleanDesc_(req.desc), descGot = artDescReward_(bag, desc);   // 📝 writing a story about it gives a little material back
    const a = { id: 'a' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36), maker: name, station: station, kind: kind, name: title, look: look, mats: cost,
      tools: [station], owners: [name].concat(team), team: team, made: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'), stars: stars, from: '', show: false, votes: {}, desc: desc };
    writeArt_(a); artSaveBag_(name, bag);
    var bpInfo = bp && ART_BP_ID_.test(String(req.bp || '')) ? artSaveBP_(name, String(req.bp), stars, artInt_(bp.score, 0, 100000), artInt_(bp.timeSec, 0, 36000)) : null;
    var stats = { made: 1, games: 1 }; stats[station] = 1; if (team.length) stats.team = 1;
    if (kind === 'gem' || station === 'stone') stats.gems = 1;
    if (station === 'light') stats.glows = 1;
    var res = { item: publicArt_(a), bag: bag, descGot: descGot }, theme = ART_STATIONS_[station][0] + ' ' + ART_STATIONS_[station][1] + ' · ' + ART_KINDS_[kind][3] + (bpInfo ? ' · ' + bpInfo.label : '');
    if (bpInfo) { res.bp = bpInfo.bp; res.chal = bpInfo.chal; res.daily = bpInfo.daily; res.stamp = bpInfo.stamp; if (bpInfo.bag) res.bag = bpInfo.bag; if (bpInfo.fam) res.fam = bpInfo.fam; }
    if (bpInfo && bpInfo.daily) stats.bpDaily = 1; if (bpInfo && bpInfo.stamp) stats.bpPages = 1;
    if (bp) { stats.blueprints = 1; if (stars === 3) { stats.perfect = 1; if (station === 'lathe') stats.latheStars = 1; if (station === 'stone') stats.stoneStars = 1; } }
  } finally { lock.releaseLock(); }
  team.forEach(n => safeRecordFeats_(n, 'artifactory', { team: 1 }));
  if (bpInfo && bpInfo.famMaker) safeRecordFeats_(bpInfo.famMaker, 'artifactory', { bpCopied: 1 });   // 👪 the maker gets ⭐ when someone copies their blueprint
  return artAfter_(name, res, bp, stars, stats, theme);   // the Archive save takes the lock itself, so it runs after ours is released
}
function artAfter_(name, res, bp, stars, stats, theme) {
  if (bp) {
    res.level = saveLevelResult('artifactory', name, artInt_(bp.level, 0, 5), { score: artInt_(bp.score, 0, 100000), stars: stars, timeSec: artInt_(bp.timeSec, 0, 36000), theme: theme, cleared: stars > 0, stats: stats });
    res.feats = res.level.feats;
  } else res.feats = safeRecordFeats_(name, 'artifactory', stats);
  return res;
}

/* ---------- 🎨 finish bench: paint, varnish, stickers, engrave ---------- */
// fin = {c, v, s, e, coats, blueprint: {level, score, stars, timeSec}}
function artFinish(name, id, fin) {
  checkArtPlayer_(name);
  fin = fin || {};
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const a = artRows_().find(x => x.id === String(id));
    if (!a || a.owners.indexOf(name) === -1) throw new Error('You don\'t have that one.');
    if (a.maker !== name) throw new Error('Only ' + a.maker + ' can change this one — ✨ Remix comes later!');
    const cost = {};
    const col = ART_HEX_.test(String(fin.c || '')) ? String(fin.c) : '';
    if (col && col !== a.look.c) cost.paint = artInt_(fin.coats, 1, 3);
    if (fin.v && !a.look.v) cost.varnish = 1;
    const bag = artTake_(artBag_(getSettings(), name), cost);
    const look = Object.assign({}, a.look);
    if (col) look.c = col;
    if (fin.v) look.v = 1;
    if (Array.isArray(fin.s)) { const s = fin.s.slice(0, 3).map(x => artInt_(x, 0, 7)); if (s.length) look.s = s; else delete look.s; }
    if (fin.e != null) { const e = String(fin.e).replace(/[<>"'`\\]/g, '').trim().slice(0, 12); if (e) look.e = e; else delete look.e; }
    a.look = cleanArtLook_(a.kind, look);
    if (a.tools.indexOf('finish') === -1) a.tools.push('finish');
    Object.keys(cost).forEach(m => { a.mats[m] = (a.mats[m] || 0) + cost[m]; });
    var bp = fin.blueprint && typeof fin.blueprint === 'object' ? fin.blueprint : null;
    var stars = bp ? artInt_(bp.stars, 0, 3) : 0;
    if (stars > a.stars) a.stars = stars;
    writeArt_(a); artSaveBag_(name, bag);
    var stats = { finish: 1, games: 1 };
    if (fin.e) stats.engraved = 1;
    var res = { item: publicArt_(a), bag: bag }, theme = '🎨 Finish bench · ' + ART_KINDS_[a.kind][3];
    if (bp) { stats.blueprints = 1; if (stars === 3) stats.perfect = 1; }
  } finally { lock.releaseLock(); }
  return artAfter_(name, res, bp, stars, stats, theme);
}
// 🔌 light-up bench: add LEDs to something you made (1 LED + 1 battery)
function artGlow(name, id, opt) {
  checkArtPlayer_(name);
  opt = opt || {};
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const a = artRows_().find(x => x.id === String(id));
    if (!a || a.owners.indexOf(name) === -1) throw new Error('You don\'t have that one.');
    if (a.maker !== name) throw new Error('Only ' + a.maker + ' can change this one.');
    const cost = { led: 1, battery: 1 }, bag = artTake_(artBag_(getSettings(), name), cost);
    a.look = cleanArtLook_(a.kind, Object.assign({}, a.look, { gl: 1, lc: ART_HEX_.test(String(opt.lc || '')) ? opt.lc : '#FFE45C' }));
    if (a.tools.indexOf('light') === -1) a.tools.push('light');
    Object.keys(cost).forEach(m => { a.mats[m] = (a.mats[m] || 0) + cost[m]; });
    var bp = opt.blueprint && typeof opt.blueprint === 'object' ? opt.blueprint : null, stars = bp ? artInt_(bp.stars, 0, 3) : 0;
    if (stars > a.stars) a.stars = stars;
    writeArt_(a); artSaveBag_(name, bag);
    var stats = { light: 1, glows: 1, games: 1 }; if (bp) { stats.blueprints = 1; if (stars === 3) stats.perfect = 1; }
    var res = { item: publicArt_(a), bag: bag }, theme = '🔌 Light-up bench · ' + ART_KINDS_[a.kind][3];
  } finally { lock.releaseLock(); }
  return artAfter_(name, res, bp, stars, stats, theme);
}
// 🧪 material lab: hit = how well the gauge was stopped (1 green, 0.5 close; 0 = nothing used, try again)
function artLab(name, recipe, hit) {
  checkArtPlayer_(name);
  const R = ART_LAB_[recipe]; if (!R) throw new Error('Unknown recipe.');
  hit = Number(hit) || 0; if (hit <= 0) return { fail: true, bag: artBag_(getSettings(), name) };
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var bag = artTake_(artBag_(getSettings(), name), R.in), out = {};
    Object.keys(R.out).forEach(m => { out[m] = hit >= 1 ? R.out[m] : Math.max(1, R.out[m] - 1); });
    artAdd_(bag, out); artSaveBag_(name, bag);
    var made = Object.keys(out).reduce((a, m) => a + out[m], 0);
  } finally { lock.releaseLock(); }
  safeRecordFeats_(name, 'artifactory', { lab: 1, matsMade: made, games: 1 });
  return { bag: bag, got: out };
}
// ♻️ recycle something you made (not shared with others) → about half its materials back
function artRecycle(name, id) {
  checkArtPlayer_(name);
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const a = artRows_().find(x => x.id === String(id));
    if (!a || a.maker !== name) throw new Error('Only the maker can recycle it.');
    if (a.owners.some(o => o !== name)) throw new Error('This one is shared with family — it stays!');
    const back = {}; Object.keys(a.mats || {}).forEach((m, i) => { const n = Math.floor((Number(a.mats[m]) || 0) / 2) || (i === 0 ? 1 : 0); if (n && ART_MATS_[m]) back[m] = n; });
    a.deleted = true; writeArt_(Object.assign(a, { deleted: true }));
    const bag = artAdd_(artBag_(getSettings(), name), back); artSaveBag_(name, bag);
    var res = { bag: bag, got: back, id: a.id };
  } finally { lock.releaseLock(); }
  safeRecordFeats_(name, 'artifactory', { recycled: 1, matsMade: Object.keys(res.got).reduce((s, m) => s + res.got[m], 0) });
  return res;
}
// 🎁 give a thing you made to someone in the family (they become an owner too)
function artGiveItem(name, id, to) {
  checkArtPlayer_(name);
  if (!activePlayers_(listProfilesFull()).some(p => p.Name === to) || to === name) throw new Error('Pick someone in the family.');
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const a = artRows_().find(x => x.id === String(id));
    if (!a || a.owners.indexOf(name) === -1) throw new Error('You don\'t have that one.');
    if (a.owners.indexOf(to) === -1) a.owners.push(to);
    writeArt_(a); var item = publicArt_(a);
  } finally { lock.releaseLock(); }
  safeRecordFeats_(name, 'artifactory', { gifts: 1 });
  return { item: item };
}
function artRename(name, id, title) {
  checkArtPlayer_(name);
  const a = artRows_().find(x => x.id === String(id));
  if (!a || a.maker !== name) throw new Error('Only the maker can rename it.');
  a.name = String(title || '').replace(/[<>"`\\]/g, '').trim().slice(0, 28) || a.name; writeArt_(a);
  return publicArt_(a);
}

/* ---------- 🧺 family shelf + 🙏 requests (counts only) ---------- */
function artShelfPut(name, mat, n) {
  checkArtPlayer_(name); if (!ART_MATS_[mat]) throw new Error('Unknown material.');
  n = artInt_(n, 1, 50);
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const st = getSettings(), bag = artTake_(artBag_(st, name), { [mat]: n }), shelf = artShelfOf_(st);
    shelf.m[mat] = Math.min(ART_BAG_MAX_, (shelf.m[mat] || 0) + n);
    // a share fills open requests for this material first
    let left = n; shelf.req.forEach(r => { if (left && r.mat === mat && r.got < r.n && r.by !== name) { const g = Math.min(left, r.n - r.got); r.got += g; left -= g; } });
    artSaveBag_(name, bag); artSaveShelf_(shelf);
    safeRecordFeats_(name, 'artifactory', { shared: n });
    return { bag: bag, shelf: shelf };
  } finally { lock.releaseLock(); }
}
function artShelfTake(name, mat, n) {
  checkArtPlayer_(name); if (!ART_MATS_[mat]) throw new Error('Unknown material.');
  n = artInt_(n, 1, 10);
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const st = getSettings(), shelf = artShelfOf_(st);
    if ((shelf.m[mat] || 0) < n) throw new Error('The family shelf has only ' + (shelf.m[mat] || 0) + ' ' + ART_MATS_[mat][1].toLowerCase() + '.');
    shelf.m[mat] -= n; if (!shelf.m[mat]) delete shelf.m[mat];
    const bag = artAdd_(artBag_(st, name), { [mat]: n });
    artSaveBag_(name, bag); artSaveShelf_(shelf);
    return { bag: bag, shelf: shelf };
  } finally { lock.releaseLock(); }
}
function artRequest(name, mat, n) {
  checkArtPlayer_(name); if (!ART_MATS_[mat]) throw new Error('Unknown material.');
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const shelf = artShelfOf_(getSettings());
    if (shelf.req.filter(r => r.by === name && r.got < r.n).length >= 3) throw new Error('You already have 3 open requests.');
    shelf.req.push({ id: 'r' + Date.now().toString(36), by: name, mat: mat, n: artInt_(n, 1, 20), got: 0, at: Date.now() });
    shelf.req = shelf.req.slice(-20); artSaveShelf_(shelf);
    return { shelf: shelf };
  } finally { lock.releaseLock(); }
}
// Give straight to someone's request (from your bag into their bag).
function artGive(name, reqId, n) {
  checkArtPlayer_(name);
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const st = getSettings(), shelf = artShelfOf_(st), r = shelf.req.find(x => x.id === String(reqId));
    if (!r || r.got >= r.n) throw new Error('That request is done already.');
    if (r.by === name) throw new Error('That is your own request 🙂');
    const g = Math.min(artInt_(n, 1, 20), r.n - r.got);
    const bag = artTake_(artBag_(st, name), { [r.mat]: g }), theirs = artAdd_(artBag_(st, r.by), { [r.mat]: g });
    r.got += g;
    artSaveBag_(name, bag); artSaveBag_(r.by, theirs); artSaveShelf_(shelf);
    safeRecordFeats_(name, 'artifactory', { gifts: g });
    return { bag: bag, shelf: shelf };
  } finally { lock.releaseLock(); }
}

/* ---------- 💾 outfits ---------- */
function saveArtOutfits(name, list) {
  checkArtPlayer_(name);
  const players = activePlayers_(listProfilesFull()), owned = itemsFor_(name, players).owned;
  const clean = (Array.isArray(list) ? list : []).slice(0, 6).map((o, i) => {
    if (!o || !o.av) return null;
    const av = cleanAvatar_(o.av, owned); if (!av) return null;
    const cw = artWear_(name, o.av.cw); if (cw) av.cw = cw; else delete av.cw;
    return { n: String(o.n || 'Outfit ' + (i + 1)).replace(/[<>"'`\\]/g, '').trim().slice(0, 14) || 'Outfit ' + (i + 1), av: av };
  });
  while (clean.length && !clean[clean.length - 1]) clean.pop();
  saveSetting('Outfits_' + name, JSON.stringify(clean));
  return clean;
}

/* ---------- 🧰 Maker shelf (Collection page) ---------- */
function artShelf_(players) {
  const out = {}; players.forEach(p => { out[p.Name] = artsOf_(p.Name).map(publicArt_); });
  return out;
}

/* ================= round 4 (af-4): remix · game drops · Design Show · Dashboard strip ================= */
// ✨ remix any thing you own: a new copy that is yours (costs 1 of its main material), then change it at the finish bench / light-up bench
function artRemix(name, id) {
  checkArtPlayer_(name);
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const src = artRows_().find(x => x.id === String(id));
    if (!src || src.owners.indexOf(name) === -1) throw new Error('You can only remix things you have.');
    if (artRows_().filter(a => a.maker === name).length >= ART_PER_PLAYER_) throw new Error('Your maker shelf is full (' + ART_PER_PLAYER_ + ' things) — recycle one first.');
    const main = Object.keys(src.mats || {}).find(m => ART_MATS_[m]) || 'oak', cost = {}; cost[main] = 1;
    const bag = artTake_(artBag_(getSettings(), name), cost);
    const look = JSON.parse(JSON.stringify(src.look || {}));
    const a = { id: 'a' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36), maker: name, station: src.station, kind: src.kind,
      name: ('✨ ' + src.name.replace(/^✨\s*/, '')).slice(0, 28), look: look, mats: cost, tools: (src.tools || []).concat((src.tools || []).indexOf('remix') < 0 ? ['remix'] : []),
      owners: [name], team: [], made: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'), stars: 0, from: src.id, show: false, votes: {} };
    writeArt_(a); artSaveBag_(name, bag);
    var res = { item: publicArt_(a), bag: bag }, orig = src.maker;
  } finally { lock.releaseLock(); }
  res.feats = safeRecordFeats_(name, 'artifactory', { remixes: 1, made: 1 });
  if (orig !== name) safeRecordFeats_(orig, 'artifactory', { remixed: 1 });
  return res;
}
// 🎁 a small material drop on a game's result card (UI.alsoTry calls it) — 1 per result, at most ART_DROP_CAP_ a day
const ART_DROP_CAP_ = 30;
const ART_DROP_POOL_ = ['oak', 'oak', 'bamboo', 'bamboo', 'teak', 'copper', 'copper', 'tin', 'iron', 'iron', 'silver', 'gold', 'granite', 'jade', 'crystal', 'ruby', 'sapphire', 'amethyst', 'clay', 'clay', 'fabric', 'glass', 'filament', 'led', 'battery', 'paint', 'varnish', 'dye', 'flower', 'flower', 'sand'];
function artMarkResult_(name, game) { if (!name || !game || game === 'artifactory') return; try { CacheService.getScriptCache().put('afres:' + name + ':' + game, String(Date.now()), 900); } catch (e) {} }
function artGameDrop(name, game) {
  checkArtPlayer_(name);
  game = String(game || '').replace(/[^a-z0-9-]/g, '').slice(0, 24);
  if (!game || game === 'artifactory') return { got: {}, left: 0 };
  let open = false; try { const c = CacheService.getScriptCache(), k = 'afres:' + name + ':' + game; open = !!c.get(k); if (open) c.remove(k); } catch (e) { open = false; }
  if (!open) return { got: {}, left: -1 };   // no fresh result for this game (a start page, or already dropped)
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const bag = artBag_(getSettings(), name), day = today_();
    if (bag._dd !== day) { bag._dd = day; bag._dn = 0; }
    if (bag._dn >= ART_DROP_CAP_) return { got: {}, left: 0 };
    const m = ART_DROP_POOL_[Math.floor(Math.random() * ART_DROP_POOL_.length)], got = {}; got[m] = 1;
    artAdd_(bag, got); bag._dn = (bag._dn || 0) + 1; artSaveBag_(name, bag);
    var res = { got: got, icon: ART_MATS_[m][0], mat: ART_MATS_[m][1], left: ART_DROP_CAP_ - bag._dn };
  } finally { lock.releaseLock(); }
  safeRecordFeats_(name, 'artifactory', { drops: 1 });
  return res;
}
// 🎭 Design Show for crafted things (same rules as the 🔨 furniture show: makers enter, the family votes 1-3 ⭐, never your own)
function artShowSet(name, id, on) {
  checkArtPlayer_(name);
  const a = artRows_().find(x => x.id === String(id));
  if (!a || a.maker !== name) throw new Error('Only the maker can enter it in the show.');
  a.show = !!on; writeArt_(a);
  return publicArt_(a);
}
function artVote(voter, id, stars) {
  checkArtPlayer_(voter);
  const n = artInt_(stars, 0, 3);
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const a = artRows_().find(x => x.id === String(id));
    if (!a || !a.show) throw new Error('That one is not in the show.');
    if (a.maker === voter) throw new Error('You can\'t vote for your own — ask the family! 😊');
    var first = !a.votes[voter];
    if (n) a.votes[voter] = n; else delete a.votes[voter];
    writeArt_(a); var out = publicArt_(a), total = artVotes_(a);
  } finally { lock.releaseLock(); }
  if (first && n) safeRecordFeats_(voter, 'artifactory', { votes: 1 });
  safeRecordFeats_(out.maker, 'artifactory', { showStars: total });
  return out;
}
function artVotes_(a) { return Object.keys(a.votes || {}).reduce((s, k) => s + (Number(a.votes[k]) || 0), 0); }
function artShowList_(players) { const live = players.map(p => p.Name); return artRows_().filter(a => a.show && live.indexOf(a.maker) !== -1).map(publicArt_); }
// 🎮 the family's crafted things that can be game skins (the Dashboard writes them to localStorage sp_artskins for the pickers on that device)
const ART_SKIN_KINDS_ = ['piece', 'figure', 'trophy', 'board', 'frame', 'stand', 'gem', 'medal', 'badge', 'sign', 'pshape', 'pspin', 'scarf', 'flag', 'cape', 'bag', 'basket', 'hat', 'lantern', 'ball', 'vase', 'bowl', 'robot', 'yoyo', 'petbowl'];
function artSkinList_(players) {
  const live = players.map(p => p.Name), MAT = { oak: '#C08A4E', bamboo: '#CDB45A', teak: '#8A5530', iron: '#7D8590', copper: '#C8743A', tin: '#C3CAD3', bronze: '#B07A32', silver: '#D8DEE6', gold: '#F2C230', granite: '#8E8A86', jade: '#3FAE7A', crystal: '#BFE8FF', ruby: '#D3264A', sapphire: '#2457C9', amethyst: '#8E4FD0', clay: '#C46B42', fabric: '#E86A9A', leather: '#8B5A2B', glass: '#A8E0E8', filament: '#5BC0EB', flower: '#FF8FB1' };
  return artRows_().filter(a => ART_SKIN_KINDS_.indexOf(a.kind) !== -1 && live.indexOf(a.maker) !== -1 && !a.look.br).slice(-80).reverse().map(a => {
    const lk = a.look || {}, col = ART_HEX_.test(lk.c || '') ? lk.c : MAT[lk.m] || MAT[lk.g] || '#C08A4E';
    return { id: a.id, k: a.kind, n: a.name, by: a.maker, m: lk.m || lk.g || '', col: col, c2: ART_HEX_.test(lk.c2 || '') ? lk.c2 : '', look: lk };
  });
}
// 🏠 Dashboard maker strip: a light summary for one player
function getArtStrip(player) {
  const players = activePlayers_(listProfilesFull());
  if (!players.some(p => p.Name === player)) return null;
  const st = getSettings(), bag = artBag_(st, player), mine = artsOf_(player);
  const total = Object.keys(bag).filter(m => ART_MATS_[m]).reduce((s, m) => s + bag[m], 0);
  return { made: mine.filter(a => a.maker === player).length, total: total, dailyReady: bag._d !== today_(), dropsLeft: ART_DROP_CAP_ - (bag._dd === today_() ? bag._dn || 0 : 0),
    last: mine.slice(-3).reverse().map(a => ({ id: a.id, name: a.name, kind: a.kind, look: a.look })), shelf: Object.keys(artShelfOf_(st).m).length,
    skins: artSkinList_(players), daily: artDailyId_() };
}

/* ================= 📘 Blueprint Book · 📝 stories (bp-1) ================= */
// the blueprint data lives in ArtBlueprints.html (page); the server keeps only best ⭐ per id (Settings ArtBP_<Name>) and the family top 5 per 🏆 challenge (Settings ArtChal)
const ART_BP_ID_ = /^(ch_)?[a-z]{2,10}_\d{1,2}$/;
const ART_DESC_CAP_ = 5;
function artSaveBP_(name, id, stars, score, secs) {
  const st = getSettings(), bp = jsonSetting_(st, 'ArtBP_' + name, {});
  if (!(bp[id] >= stars)) { bp[id] = stars; saveSetting('ArtBP_' + name, JSON.stringify(bp)); }
  const out = { bp: bp, label: (id.indexOf('ch_') === 0 ? '🏆 ' : '📘 #') + id.replace(/^ch_/, '').replace(/^[a-z]+_/, '') };
  if (id.indexOf('ch_') === 0 && stars > 0) {
    const ch = jsonSetting_(st, 'ArtChal', {}), list = (ch[id] || []).filter(r => r.n !== name || r.s > score);
    if (!list.some(r => r.n === name)) list.push({ n: name, s: score, t: secs, st: stars });
    ch[id] = list.sort((a, b) => b.s - a.s).slice(0, 5); saveSetting('ArtChal', JSON.stringify(ch)); out.chal = ch;
  }
  return artBpExtras_(name, id, stars, bp, out);   // 📅 🏅 👪 (bp-4)
}
function artCleanDesc_(d) { return String(d || '').replace(/[<>"`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 200); }
function artWords_(d) { return d ? d.split(' ').filter(w => /[A-Za-z฀-๿0-9]{2,}/.test(w)).length : 0; }
// 10+ words = 1 random material, 25+ = 2 · at most ART_DESC_CAP_ rewards a day (counted in the bag, no log)
function artDescReward_(bag, desc) {
  const w = artWords_(desc), n = w >= 25 ? 2 : w >= 10 ? 1 : 0; if (!n) return {};
  const day = today_(); if (bag._wd !== day) { bag._wd = day; bag._wn = 0; }
  if ((bag._wn || 0) >= ART_DESC_CAP_) return {};
  const got = {}; for (let i = 0; i < n; i++) { const m = ART_DROP_POOL_[Math.floor(Math.random() * ART_DROP_POOL_.length)]; got[m] = (got[m] || 0) + 1; }
  artAdd_(bag, got); bag._wn = (bag._wn || 0) + 1; return got;
}
// 📝 write (or change) the story of something you made later; the reward only comes the first time a story is written
function artDescribe(name, id, desc) {
  checkArtPlayer_(name);
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const a = artRows_().find(x => x.id === String(id));
    if (!a || a.maker !== name) throw new Error('Only the maker can write its story.');
    const d = artCleanDesc_(desc), bag = artBag_(getSettings(), name), got = a.desc ? {} : artDescReward_(bag, d);
    a.desc = d; writeArt_(a); if (Object.keys(got).length) artSaveBag_(name, bag);
    var res = { item: publicArt_(a), bag: bag, descGot: got };
  } finally { lock.releaseLock(); }
  if (Object.keys(res.descGot).length) safeRecordFeats_(name, 'artifactory', { stories: 1 });
  return res;
}

/* ================= 📅 Blueprint of the Day · 🏅 page stamps · 👪 family blueprints (bp-4) ================= */
const ART_BP_PAGES_ = ["cup", "bangle", "pen", "yoyo", "piece", "trophy", "ball", "tbowl", "box", "goblet", "bowl", "vase", "petbowl", "pshape", "pspin", "medal", "key", "charm", "gem", "ring", "necklace", "crown", "tag", "scarf", "cape", "bag", "flag", "basket", "hat", "fcharm", "paint", "board", "frame", "stand", "badge", "robot", "sign", "lantern", "spoon", "whistle", "figure", "owl", "fish", "cat", "boat", "bear", "turtle"];   // = the book's pages in order (ArtBlueprints.html BP.ORDER — the harness checks they match)
const ART_FAM_MAX_ = 20, ART_FAM_ST_ = ['lathe', 'pottery', 'print', 'forge', 'sew', 'nature', 'stone'];
// the same blueprint for the whole family on a day: #1–#9 of any page except 🎨 paint jobs (those need a thing to paint) — the page uses the same picker (bpDailyId)
function artDailyId_(day) {
  day = String(day || today_()); let h = 2166136261;
  for (let i = 0; i < day.length; i++) { h ^= day.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  const pages = ART_BP_PAGES_.filter(k => k !== 'paint');
  return pages[h % pages.length] + '_' + (1 + Math.floor(h / pages.length) % 9);
}
function artYesterday_() { return Utilities.formatDate(new Date(Date.now() - 864e5), Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
function artRandMats_(n) { const got = {}; for (let i = 0; i < n; i++) { const m = ART_DROP_POOL_[Math.floor(Math.random() * ART_DROP_POOL_.length)]; got[m] = (got[m] || 0) + 1; } return got; }
// called by artSaveBP_ after a blueprint gets stars: 📅 daily bonus + streak, 🏅 page stamp + pack, 👪 family credit for the maker
function artBpExtras_(name, id, stars, bp, out) {
  if (!(stars > 0)) return out;
  const st = getSettings(); let bag = null; const give = got => { bag = bag || artBag_(st, name); artAdd_(bag, got); };
  if (id === artDailyId_()) {
    const d = jsonSetting_(st, 'ArtDaily_' + name, {}), day = today_();
    if (d.d !== day) { d.s = d.d === artYesterday_() ? (d.s || 0) + 1 : 1; d.d = day; d.n = (d.n || 0) + 1; d.best = Math.max(d.best || 0, d.s); saveSetting('ArtDaily_' + name, JSON.stringify(d));
      const got = artRandMats_(2); give(got); out.daily = { got: got, streak: d.s, best: d.best }; }
  }
  const m = /^([a-z]+)_(\d+)$/.exec(id);
  if (m && m[1] !== 'fam') {
    const kind = m[1]; bp._s = Array.isArray(bp._s) ? bp._s : [];
    let full = true; for (let n = 1; n <= 12; n++) if (!(bp[kind + '_' + n] > 0)) { full = false; break; }
    if (full && bp._s.indexOf(kind) === -1) { bp._s.push(kind); saveSetting('ArtBP_' + name, JSON.stringify(bp)); const got = artRandMats_(5); give(got); out.stamp = { kind: kind, got: got, pages: bp._s.length }; }
  }
  if (m && m[1] === 'fam') {
    const list = jsonSetting_(st, 'ArtFamBP', []), f = list.find(x => x.id === id);
    if (f && f.maker !== name && !(f.got || {})[name]) { f.got = f.got || {}; f.got[name] = stars; saveSetting('ArtFamBP', JSON.stringify(list)); out.famMaker = f.maker; out.fam = list; }
  }
  if (bag) { artSaveBag_(name, bag); out.bag = bag; }
  return out;
}
function artFamOk_(a) { const L = a.look || {}; return ART_FAM_ST_.indexOf(a.station) !== -1 && !!(L.p || L.ol || L.fg || L.wv || (a.station === 'stone' && L.cut != null)); }
// 👪 save something you made as a family blueprint (its look becomes the plan others copy)
function artFamSave(name, id, title) {
  checkArtPlayer_(name);
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const a = artRows_().find(x => x.id === String(id));
    if (!a || a.maker !== name) throw new Error('Only the maker can share its blueprint.');
    if (!artFamOk_(a)) throw new Error('This one has no shape plan to copy — try a turned, potted, printed, forged, woven or cut thing.');
    const list = jsonSetting_(getSettings(), 'ArtFamBP', []);
    if (list.some(f => f.src === a.id)) throw new Error('It is already a family blueprint.');
    if (list.filter(f => f.maker === name).length >= ART_FAM_MAX_) throw new Error('You already shared ' + ART_FAM_MAX_ + ' — remove one first.');
    let n = 1; while (list.some(f => f.n === n) && n < 99) n++;
    const f = { id: 'fam_' + n, n: n, maker: name, kind: a.kind, st: a.station, name: String(title || a.name).replace(/[<>"`\\]/g, '').trim().slice(0, 28) || a.name, look: a.look, src: a.id, made: today_(), got: {} };
    list.push(f); saveSetting('ArtFamBP', JSON.stringify(list));
    var res = { fam: list, added: f.id };
  } finally { lock.releaseLock(); }
  safeRecordFeats_(name, 'artifactory', { bpShared: 1 });
  return res;
}
function artFamRemove(name, famId) {
  checkArtPlayer_(name);
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const list = jsonSetting_(getSettings(), 'ArtFamBP', []), f = list.find(x => x.id === String(famId));
    if (!f || f.maker !== name) throw new Error('Only the maker can remove it.');
    const left = list.filter(x => x !== f); saveSetting('ArtFamBP', JSON.stringify(left)); return { fam: left };
  } finally { lock.releaseLock(); }
}

/* ================= 🧪 lab upgrade needs · 🧲 quick tests · 🔧 repair + kintsugi (bp-5) ================= */
const ART_BP_NEED_ = {medal_12: 'brass', key_12: 'steel', charm_12: 'brass', badge_12: 'steel', robot_12: 'steel', sign_12: 'steel', lantern_11: 'sglass', lantern_12: 'sglass', scarf_12: 'fdye', cape_12: 'fdye', bag_12: 'fdye', flag_12: 'fdye'};   // Master blueprints that need a 🧪 lab material (= ArtBlueprints.html BP_NEED)
const ART_GIFT5_ = { zinc: 4, carbon: 4, cobalt: 2, alum: 2 };   // bp-5 opening gift: what the new lab recipes need
const ART_TOUGH_ = { wood: 55, metal: 85, stone: 35, clay: 15, glass: 8, fabric: 95, plastic: 45, nature: 40 };
const ART_TESTS_ = {
  drop: { name: 'Drop test', lim: 45, q: 5, broke: 'It cracked when it hit the floor.', ok: 'Bounce! It survived the drop.',
    lesson: 'Brittle things (clay, glass, stone) crack when they land; tough things (metal, wood, cloth) bend or bounce.' },
  bend: { name: 'Bend test', lim: 40, q: 99, broke: 'Snap! It could not bend.', ok: 'It bent a little and sprang back.',
    lesson: 'Flexible materials bend and spring back (that is called elasticity); brittle ones snap instead.' },
  load: { name: 'Load test', lim: 35, q: 4, broke: 'Crunch — too heavy for it.', ok: 'It held the heavy book!',
    lesson: 'Engineers test copies with weight so the real thing is safe — the strongest shapes spread the load.' }
};
const ART_REPAIR_ = { wood: ['🧴', 'Glue + clamp', 'Wood glue soaks into the fibres; the clamp holds the pieces while it dries.'], metal: ['🔥', 'Re-weld', 'Welding melts both sides of the break back into one piece.'],
  stone: ['🧴', 'Stone glue', 'Stone glue is two parts that harden together like new rock.'], clay: ['🏺', 'Kintsugi (gold)', 'Kintsugi is the Japanese art of mending with gold — the crack becomes the most beautiful part.'],
  glass: ['✨', 'Kintsugi (gold)', 'Kintsugi is the Japanese art of mending with gold — the crack becomes the most beautiful part.'], fabric: ['🪡', 'Re-stitch', 'New stitches pull the torn edges back together.'],
  plastic: ['🧴', 'Plastic weld', 'Warm plastic melts back together, just like on the 3D printer.'], nature: ['🧴', 'Glue + wrap', 'Natural things are mended with glue and a tight wrap.'] };
function artGroup_(a) {
  const L = a.look || {}, m = L.m || L.g || Object.keys(a.mats || {})[0] || 'oak';
  if (m === 'clay') return 'clay'; if (m === 'glass' || m === 'sglass') return 'glass'; if (m === 'fabric' || m === 'leather') return 'fabric'; if (m === 'filament') return 'plastic';
  const c = ART_MATS_[m] ? ART_MATS_[m][2] : 'wood'; return ART_TOUGH_[c] != null ? c : 'wood';
}
// 🧲 a quick test (the full Physics Room comes in 🔬 Sciencetory): the same thing always gives the same result — material toughness + how well it was made
function artTest(name, id, test) {
  checkArtPlayer_(name); const T = ART_TESTS_[test]; if (!T) throw new Error('Pick a test.');
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const a = artRows_().find(x => x.id === String(id));
    if (!a || a.owners.indexOf(name) === -1) throw new Error('You can only test your own things.');
    if (a.look.br) throw new Error('It is broken — repair it first.');
    const grp = artGroup_(a), q = artInt_(a.look.q == null ? 80 : a.look.q, 0, 100), score = ART_TOUGH_[grp] + q / T.q, broke = score < T.lim;
    if (broke) { a.look.br = test; writeArt_(a); }
    var res = { item: publicArt_(a), broke: broke, test: test, group: grp, text: broke ? T.broke : T.ok, lesson: T.lesson + (broke ? ' Engineers break test copies on purpose so the real thing is safe — now fix it!' : '') };
  } finally { lock.releaseLock(); }
  safeRecordFeats_(name, 'artifactory', res.broke ? { tests: 1, breaks: 1 } : { tests: 1 });
  return res;
}
// 🔧 repair: uses about ⅓ of what it took to make, gives a 🔧 Repaired mark (+ gold kintsugi seams on clay and glass) and a lesson — broken is never lost
function artRepair(name, id) {
  checkArtPlayer_(name);
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const a = artRows_().find(x => x.id === String(id));
    if (!a || a.owners.indexOf(name) === -1) throw new Error('You can only repair your own things.');
    if (!a.look.br) throw new Error('It is not broken.');
    const cost = {}; Object.keys(a.mats || {}).forEach(m => { if (ART_MATS_[m]) cost[m] = Math.max(1, Math.ceil(Number(a.mats[m]) / 3)); });
    const bag = artTake_(artBag_(getSettings(), name), cost), grp = artGroup_(a), how = ART_REPAIR_[grp] || ART_REPAIR_.wood;
    delete a.look.br; a.look.rp = Math.min(99, (a.look.rp || 0) + 1); if (grp === 'clay' || grp === 'glass') a.look.kg = 1;
    writeArt_(a); artSaveBag_(name, bag);
    var res = { item: publicArt_(a), bag: bag, cost: cost, way: how[0] + ' ' + how[1], lesson: how[2], kintsugi: !!a.look.kg };
  } finally { lock.releaseLock(); }
  safeRecordFeats_(name, 'artifactory', { repairs: 1 });
  return res;
}
// (bp-5) END OF ArtifactoryCode.gs

;
/* ===== SciencetoryCode.gs ===== */
/* SciencetoryCode.gs — 🔬 Sciencetory server (sc-1, ⚗️ Chemistry sc-2a, ⚛️ Quantum atom builder sc-2b). Own file: Code.gs is past 300 KB (same pattern as ArtifactoryCode.gs).
   Plan: Drive "Sciencetory — full plan.md". Shares Artifactory's data: the Artifacts tab (things you made) + the bag (ArtifactoryCode.gs).
   ⚙️ Mechanic tests (SC-1): press · pull · twist · flex · fatigue · hardness · sharpness · drop · friction · balance · spin · float / leak.
   Every test is a pure function of the thing (material + shape + quality) — the same thing always gives the same number, no luck.
   A breakable test can break a thing (look.br → Artifactory's 🔧 repair, bp-5); 🧪 lab samples never belong to anyone and never stay broken.
   Counts, never logs: Settings SciTests_<Name> = {t: {test: {n, best, of}}, runs, right, breaks}. Records: Archive board 'sciencetory'
   (Theme '⚙️ Mechanic · Press'), family records = the best of every player's SciTests. */
const SCI_GAME_ = 'sciencetory';

// material → [mohs, density g/cm³, crush, pull, twist, tough 0-100, flex kind (s spring · b stays bent · x snaps · f floppy), flex deg, fatigue bends, friction μ]
// kid-scale numbers (relative, rounded) — the lessons say which is stronger, never real engineering values
const SCI_MATS_ = {
  oak: [2.5, 0.75, 40, 80, 15, 55, 's', 20, 400, 0.5], bamboo: [2.5, 0.7, 60, 150, 20, 60, 's', 45, 2000, 0.4], teak: [3, 0.65, 50, 90, 18, 55, 's', 18, 500, 0.45],
  iron: [4.5, 7.9, 250, 200, 150, 80, 'b', 4, 3000, 0.6], copper: [3, 8.96, 200, 210, 120, 85, 'b', 3, 800, 0.5], tin: [1.5, 7.3, 30, 15, 10, 60, 'b', 2, 150, 0.55],
  bronze: [3.5, 8.8, 300, 250, 170, 70, 's', 8, 2500, 0.45], silver: [2.5, 10.5, 150, 140, 90, 80, 'b', 3, 900, 0.4], gold: [2.5, 19.3, 120, 120, 80, 85, 'b', 2, 700, 0.35],
  zinc: [2.5, 7.1, 100, 100, 60, 40, 'b', 2, 300, 0.5], brass: [3.5, 8.5, 300, 300, 180, 75, 's', 12, 3000, 0.45], steel: [5.5, 7.85, 400, 450, 250, 90, 's', 30, 10000, 0.5],
  granite: [6, 2.7, 200, 8, 10, 25, 'x', 1, 1, 0.7], jade: [6.5, 3.3, 300, 40, 30, 70, 'x', 2, 50, 0.4], crystal: [7, 2.65, 300, 30, 10, 20, 'x', 1, 1, 0.3],
  ruby: [9, 4.0, 500, 50, 20, 35, 'x', 1, 1, 0.3], sapphire: [9, 4.0, 500, 50, 20, 35, 'x', 1, 1, 0.3], amethyst: [7, 2.65, 300, 30, 10, 20, 'x', 1, 1, 0.3],
  clay: [5, 2.3, 150, 5, 5, 15, 'x', 1, 1, 0.6], glass: [5.5, 2.5, 300, 10, 6, 8, 'x', 1, 1, 0.2], sglass: [5.5, 2.5, 300, 10, 6, 8, 'x', 1, 1, 0.2],
  fabric: [1, 0.3, 1, 40, 3, 95, 'f', 180, 99999, 0.6], leather: [1.5, 0.9, 2, 30, 5, 95, 'f', 180, 99999, 0.6], fdye: [1, 0.3, 1, 40, 3, 95, 'f', 180, 99999, 0.6],
  filament: [2, 1.25, 60, 50, 25, 45, 's', 15, 300, 0.35], resin: [3, 1.2, 80, 40, 20, 25, 'x', 2, 50, 0.3], flower: [1, 0.5, 2, 2, 1, 30, 'f', 90, 99999, 0.5],
  carbon: [1, 0.4, 5, 2, 1, 10, 'x', 1, 1, 0.6]
};
const SCI_MAT_NAME_ = { resin: 'Clear resin', fdye: 'Dyed fabric', sglass: 'Blue glass', filament: 'Plastic (PLA)', carbon: 'Charcoal' };
// 🧪 lab samples — a bar of each material, for anyone (no crafted thing needed); never saved, never broken for good
const SCI_SAMPLES_ = ['oak', 'bamboo', 'copper', 'steel', 'gold', 'granite', 'glass', 'clay', 'filament', 'fabric'];

// kind → [chunk 0.3-1.4 (how much stuff there is), edge 0-1 (sharpness), tip ° (how far it tilts before it falls; 0 = rolls · -1 = can't stand), spin s (0 = not round), opens (1 = a container)]
const SCI_SHAPE_ = {
  cup: [0.9, 0.12, 0, 5, 1], bangle: [0.5, 0.12, -1, 8, 0], pen: [0.4, 0.2, -1, 2, 0], yoyo: [1.0, 0.1, 0, 14, 0], piece: [1.0, 0.15, 0, 6, 0], trophy: [1.2, 0.2, 0, 4, 1],
  ball: [1.4, 0.05, 0, 9, 0], tbowl: [1.1, 0.12, 0, 7, 1], box: [1.2, 0.15, 0, 6, 0], goblet: [0.7, 0.15, 0, 4, 1],
  gem: [1.0, 0.4, 40, 3, 0], ring: [0.4, 0.3, -1, 5, 0], necklace: [0.3, 0.2, -1, 0, 0], crown: [0.5, 0.45, 35, 4, 0], tag: [0.4, 0.35, -1, 0, 0],
  board: [0.7, 0.4, 12, 0, 0], frame: [0.6, 0.35, 15, 0, 0], stand: [1.2, 0.35, 35, 0, 0], badge: [0.5, 0.4, -1, 0, 0], robot: [1.1, 0.35, 25, 0, 0], sign: [0.5, 0.45, 18, 0, 0],
  medal: [0.45, 0.25, -1, 0, 0], key: [0.35, 0.55, -1, 0, 0], charm: [0.45, 0.3, -1, 0, 0],
  bowl: [1.0, 0.12, 0, 7, 1], vase: [1.0, 0.15, 0, 4, 1], petbowl: [1.2, 0.12, 0, 6, 1],
  scarf: [0.3, 0, -1, 0, 0], cape: [0.3, 0, -1, 0, 0], bag: [0.4, 0, 20, 0, 0], flag: [0.3, 0.1, -1, 0, 0], lantern: [0.8, 0.2, 22, 0, 0],
  spoon: [0.45, 0.5, -1, 0, 0], whistle: [0.6, 0.25, 30, 0, 0], figure: [1.1, 0.25, 30, 0, 0],
  owl: [1.1, 0.2, 30, 0, 0], fish: [1.1, 0.2, 24, 0, 0], cat: [1.1, 0.2, 30, 0, 0], boat: [1.1, 0.2, 20, 0, 0], bear: [1.1, 0.2, 32, 0, 0], turtle: [1.1, 0.2, 38, 0, 0],
  pshape: [0.9, 0.3, 30, 0, 0], pspin: [0.9, 0.15, 0, 5, 0], basket: [0.6, 0.1, 35, 0, 1], hat: [0.5, 0.1, 40, 3, 0], fcharm: [0.6, 0.3, -1, 0, 0],
  sample: [1.0, 0.3, 30, 6, 0]   // 🧪 a lab sample = a round test puck
};
const SCI_HW_ = { cup: 1.2, pen: 4, yoyo: 0.6, piece: 2, trophy: 2, ball: 1, tbowl: 0.55, box: 1, goblet: 1.6, bowl: 0.6, vase: 1.6, petbowl: 0.4, pspin: 1.5 };   // height ÷ width of turned things
const SCI_ROLLS_ = { ball: 1, yoyo: 1, bangle: 1, ring: 1 };   // round things roll down a ramp instead of sliding
const SCI_FLOATY_ = { boat: 0.35, box: 0.6 };       // closed / boat-shaped things: air inside makes them float higher

// ⚙️ the 12 Mechanic tests — ch = what each level asks (🌱 → 💀) · bk3 / bk4 = range edges for the Hard+ guesses · br = what Artifactory's 🔧 repair calls the break (bp-5 keys)
const SCI_TESTS_ = {
  press:    { icon: '🏋️', name: 'Press', unit: 'kg', ch: [10, 25, 50, 100, 250, 500], bk3: [50, 300], bk4: [20, 100, 500], br: 'load', q: 'Will it hold {c} kg pressing down?' },
  pull:     { icon: '🪢', name: 'Pull', unit: 'kg', ch: [5, 15, 40, 80, 150, 300], bk3: [50, 200], bk4: [20, 100, 400], br: 'bend', q: 'Will it hold when we pull with {c} kg?' },
  twist:    { icon: '🔄', name: 'Twist', unit: '🖐️', ch: [0.3, 0.6, 1, 2, 4, 8], bk3: [1, 5], bk4: [0.5, 2, 8], br: 'bend', q: 'Will it survive a twist of {c} 🖐️?' },
  flex:     { icon: '🌿', name: 'Flex', unit: '°', ch: [5, 10, 15, 25, 35, 50], bk3: [5, 25], bk4: [2, 10, 30], br: 'bend', q: 'Will it spring back after a {c}° bend?' },
  fatigue:  { icon: '🔁', name: 'Fatigue', unit: 'bends', ch: [10, 25, 50, 100, 250, 1000], bk3: [50, 1000], bk4: [10, 200, 2000], br: 'bend', q: 'Will it last {c} little bends?' },
  hardness: { icon: '💎', name: 'Hardness', unit: 'Mohs', ch: [2.5, 3.5, 5.5, 6.5, 7, 8], bk3: [3, 6], bk4: [2.5, 5, 7], q: 'Will it stay scratch-free from the {t}?' },
  sharp:    { icon: '🔪', name: 'Sharpness', unit: '/10', ch: [1, 2, 3.5, 5, 6.5, 8], bk3: [2, 5], bk4: [1, 3.5, 6.5], q: 'Can its edge cut {t}?' },
  drop:     { icon: '🪂', name: 'Drop', unit: 'm', ch: [0.2, 0.5, 1, 2, 4, 8], bk3: [0.5, 3], bk4: [0.3, 1, 5], br: 'drop', q: 'Will it survive a {c} m drop?' },
  friction: { icon: '🛝', name: 'Friction', unit: '°', ch: [10, 15, 20, 25, 30, 35], bk3: [15, 25], bk4: [12, 20, 30], q: 'Will it stay put on a {c}° ramp?' },
  balance:  { icon: '⚖️', name: 'Balance', unit: '°', ch: [5, 10, 15, 20, 25, 30], bk3: [15, 30], bk4: [10, 20, 35], q: 'Will it stay standing on a {c}° tilt?' },
  spin:     { icon: '🌀', name: 'Spin', unit: 's', ch: [2, 3, 5, 7, 9, 12], bk3: [3, 7], bk4: [2, 5, 9], q: 'Will it spin for {c} seconds?' },
  float:    { icon: '💧', name: 'Float / leak', unit: 'g/cm³', ch: [1, 1, 1, 1, 1, 1], bk3: [1, 3], bk4: [0.5, 1, 3], q: 'Will it float?', leak: { unit: 'min', ch: [1, 2, 5, 10, 30, 60], bk3: [2, 30], bk4: [1, 5, 60], q: 'Will it hold water for {c} min?' } }
};
const SCI_ORDER_ = ['press', 'pull', 'twist', 'flex', 'fatigue', 'hardness', 'sharp', 'drop', 'friction', 'balance', 'spin', 'float'];
// the things the hardness + sharpness tests use, per level (kid-safe: a fingernail, a coin, a nail, a file, a quartz pebble, a topaz)
const SCI_TOOLS_ = { hardness: [['💅', 'fingernail'], ['🪙', 'copper coin'], ['🔩', 'steel nail'], ['🪚', 'steel file'], ['🪨', 'quartz pebble'], ['💠', 'topaz stone']],
  sharp: [['🟤', 'play dough'], ['📄', 'paper'], ['🧵', 'thread'], ['🪢', 'string'], ['🥕', 'a carrot'], ['🪵', 'soft wood']] };
const SCI_MULT_ = [1, 1.25, 1.5, 2, 2.5, 7.5];   // 💀 Hardcore = ×3 of Extreme
const SCI_INF_ = 99999;

function sciMatOf_(a) {
  const L = a.look || {}, k = a.kind;
  if (k === 'fcharm') return 'resin';
  if (k === 'gem' && SCI_MATS_[L.g]) return L.g;
  const m = L.m || L.g || Object.keys(a.mats || {})[0] || 'oak';
  return SCI_MATS_[m] ? m : 'oak';
}
function sciNum_(v, d) { const f = Math.pow(10, d || 0); return Math.round(v * f) / f; }
// 🔍 everything a test needs about a thing (shape + material + how well it was made)
function sciFacts_(a) {
  const L = a.look || {}, kind = SCI_SHAPE_[a.kind] ? a.kind : 'sample', S = SCI_SHAPE_[kind], m = sciMatOf_(a), P = SCI_MATS_[m];
  const q = L.q == null ? 80 : Math.max(0, Math.min(100, Number(L.q) || 0)), qf = 0.75 + q / 400, rep = Math.pow(0.92, Math.min(5, Number(L.rp) || 0)) * (L.kg ? 1.05 : 1);
  let neck = 1, hollow = false, wall = 20, cgu = 0.5, base = 0.5;
  const p = Array.isArray(L.p) && L.p.length >= 6 ? L.p.map(Number) : null;
  if (p) {
    const mx = Math.max.apply(null, p) || 1; neck = Math.max(0.15, Math.min.apply(null, p.slice(1, p.length - 1).concat([mx])) / mx);
    let w = 0, s = 0; p.forEach((r, i) => { w += r * r; s += r * r * (i + 0.5) / p.length; }); cgu = w ? s / w : 0.5; base = Math.max(p[0], p[1] || 0) / mx;
  }
  if (Array.isArray(L.pi) && L.pi.some(v => v > 0) && p) { hollow = true; wall = 20; L.pi.forEach((v, i) => { if (v > 0) wall = Math.min(wall, (p[Math.min(i, p.length - 1)] || 0) - v); }); }
  let chunk = S[0]; if (kind === 'board' && L.th != null) chunk = 0.3 + Math.max(0, Math.min(20, Number(L.th))) / 20 * 0.8;
  return { kind: kind, m: m, P: P, S: S, q: q, qf: qf, rep: rep, neck: neck, hollow: hollow, wall: wall, cgu: cgu, base: base, chunk: chunk, floppy: P[6] === 'f', look: L };
}
// 🚫 which tests make no sense for a thing (a scarf can't stand up …) → reason text
function sciNoFit_(a, test) {
  const F = sciFacts_(a);
  if (test === 'balance' && F.S[2] < 0) return 'It can’t stand up by itself — try something that stands.';
  if (test === 'balance' && F.floppy) return 'Soft cloth flops over — try something that stands.';
  if (test === 'spin' && (F.floppy || F.S[3] === 0 && ['necklace', 'tag', 'badge', 'medal', 'charm', 'key', 'flag'].indexOf(F.kind) >= 0)) return 'It can’t spin on its own — try something round.';
  return '';
}
function sciOpenContainer_(F) { return !!F.S[4]; }   // cups, bowls, vases … get the 🫗 leak test, everything else the 💧 float test
// 🧮 the measurement — returns {v (number, SCI_INF_ = never fails), pass, broke, how}
function sciMeasure_(a, test, lv) {
  const T = SCI_TESTS_[test], F = sciFacts_(a), P = F.P, ch = T.ch[lv];
  const strong = F.qf * F.rep;
  let v = 0, how = '', pass = false, broke = false;
  if (test === 'press') {
    v = F.floppy ? SCI_INF_ : P[2] * F.chunk * 2.5 * strong * (F.hollow ? 0.7 : 1);
    pass = v >= ch; broke = !pass; how = F.floppy ? 'squish' : pass ? 'hold' : 'crush';
  } else if (test === 'pull') {
    v = P[3] * F.chunk * 1.5 * strong * (0.4 + 0.6 * F.neck);
    pass = v >= ch; broke = !pass; how = pass ? (F.floppy ? 'stretch' : 'hold') : 'snap';
  } else if (test === 'twist') {
    v = F.floppy ? SCI_INF_ : P[4] * F.chunk * 0.08 * strong * (0.4 + 0.6 * F.neck);
    pass = v >= ch; broke = !pass; how = F.floppy ? 'wring' : pass ? 'hold' : 'snap';
  } else if (test === 'flex') {
    const thin = Math.max(0.5, Math.min(1.6, 1.8 - F.chunk * 0.7));
    if (P[6] === 's') { v = P[7] * thin * strong; pass = v >= ch; broke = ch > v * 1.6; how = pass ? 'spring' : broke ? 'snap' : 'bent'; }
    else if (P[6] === 'b') { v = P[7] * thin; pass = v >= ch; how = pass ? 'spring' : 'bent'; }
    else if (P[6] === 'x') { v = P[7] * thin; pass = v >= ch; broke = !pass; how = pass ? 'spring' : 'snap'; }
    else { v = 0; pass = false; how = 'flop'; }
  } else if (test === 'fatigue') {
    v = F.floppy ? SCI_INF_ : Math.max(1, Math.round(P[8] * strong * (F.chunk < 0.6 ? 1.3 : 1)));
    pass = v >= ch; broke = !pass; how = F.floppy ? 'flop' : pass ? 'hold' : 'crack';
  } else if (test === 'hardness') {
    v = P[0]; pass = v > ch; how = pass ? 'clean' : v === ch ? 'tiny' : 'scratch';
  } else if (test === 'sharp') {
    let e = F.S[1];
    if (F.kind === 'gem') e = 0.6 + (Number(F.look.cut) || 0) * 0.1;
    if (F.kind === 'pshape' && Array.isArray(F.look.ol)) { const o = F.look.ol, mx = Math.max.apply(null, o), mn = Math.min.apply(null, o); e = Math.min(0.6, 0.2 + (mx - mn) / 20 * 0.5); }
    if (F.floppy) e = 0;
    v = Math.min(10, e * Math.min(10, P[0]) * 1.6); pass = v >= ch; how = pass ? 'cut' : 'blunt';
  } else if (test === 'drop') {
    v = F.floppy ? SCI_INF_ : 0.1 * Math.pow(10, P[5] / 40) * strong / (1 + Math.max(0, P[1] - 8) / 20);
    pass = v >= ch; broke = !pass; how = F.floppy ? 'flutter' : pass ? 'bounce' : 'shatter';
  } else if (test === 'friction') {
    if (SCI_ROLLS_[F.kind]) { v = 0; pass = false; how = 'roll'; }
    else { const mu = Math.max(0.08, P[9] - (F.look.v ? 0.15 : 0) - (F.look.c ? 0.05 : 0)); v = Math.atan(mu) * 180 / Math.PI; pass = v > ch; how = pass ? 'grip' : 'slide'; }
  } else if (test === 'balance') {
    let tip = F.S[2];
    if (tip === 0 && SCI_HW_[F.kind] && F.kind !== 'ball') tip = Math.atan(F.base * 0.5 / Math.max(0.15, SCI_HW_[F.kind] * F.cgu)) * 180 / Math.PI;
    v = Math.max(0, tip); pass = v > ch; how = v === 0 ? 'roll' : pass ? 'stand' : 'topple';
  } else if (test === 'spin') {
    const round = F.S[3] > 0 && !F.floppy;
    v = round ? F.S[3] * (0.7 + Math.min(1, P[1] / 9) * 0.6) * F.qf : 1.2;
    pass = v >= ch; how = round ? (pass ? 'spin' : 'slow') : 'wobble';
  } else if (test === 'float') {
    if (sciOpenContainer_(F)) {   // 🫗 leak test: minutes it holds water
      const L = F.look, porous = F.m === 'clay' && !L.c ? 3 : ['oak', 'bamboo', 'teak'].indexOf(F.m) >= 0 && !L.v ? 20 : 0;
      v = F.kind === 'basket' ? 0.1 : F.hollow && F.wall < 1 ? 0.5 : porous || SCI_INF_; const lch = T.leak.ch[lv];
      pass = v >= lch; how = v >= SCI_INF_ ? 'hold' : v <= 0.5 ? 'pour' : 'seep';   // seep = slowly, even when it lasts long enough
      return { v: v, pass: pass, broke: false, how: how, leak: true };
    }
    v = P[1] * (SCI_FLOATY_[F.kind] || 1);   // a boat / a closed box has air inside → it floats higher than the wood alone
    pass = v < 1; how = pass ? 'float' : v < 3 ? 'sink' : 'plop';
  }
  return { v: v, pass: pass, broke: broke, how: how, leak: false };
}
function sciBucket_(v, edges) { let i = 0; while (i < edges.length && v >= edges[i]) i++; return i; }
function sciRound_(test, v) { if (v >= SCI_INF_) return SCI_INF_; return test === 'press' || test === 'pull' || test === 'fatigue' ? sciNum_(v, 0) : sciNum_(v, v < 1 ? 2 : 1); }

/* ---------- data ---------- */
function sciStats_(st, name) {
  const s = jsonSetting_(st, 'SciTests_' + name, {}); const t = s.t && typeof s.t === 'object' ? s.t : {};
  const out = { t: {}, runs: artInt_(s.runs, 0, 1e6), right: artInt_(s.right, 0, 1e6), breaks: artInt_(s.breaks, 0, 1e6) };
  SCI_ORDER_.forEach(k => { const r = t[k]; if (r && typeof r === 'object') out.t[k] = { n: artInt_(r.n, 0, 1e6), best: Number(r.best) || 0, of: String(r.of || '').slice(0, 40), low: r.low != null ? Number(r.low) : null }; });
  return out;
}
// 🏆 family records: the best of everyone's SciTests (floating = the LOWEST density floats highest)
function sciFamily_(st, players) {
  const rec = {};
  players.forEach(p => { const s = sciStats_(st, p.Name); SCI_ORDER_.forEach(k => { const r = s.t[k]; if (!r || !r.n) return;
    if (k === 'float') { if (r.low != null && (!rec[k] || r.low < rec[k].v)) rec[k] = { v: r.low, by: p.Name, of: r.of }; return; }
    if (r.best > 0 && (!rec[k] || r.best > rec[k].v)) rec[k] = { v: r.best, by: p.Name, of: r.of }; }); });
  return rec;
}
function sciThingsOf_(name) {
  return artsOf_(name).map(a => { const x = publicArt_(a); x.sci = { m: sciMatOf_(a), no: {} }; SCI_ORDER_.forEach(t => { const r = sciNoFit_(a, t); if (r) x.sci.no[t] = r; }); x.sci.leak = sciOpenContainer_(sciFacts_(a)); return x; });
}
function sciMeta_() {
  const samples = SCI_SAMPLES_.map(m => ({ m: m, name: (SCI_MAT_NAME_[m] || (ART_MATS_[m] ? ART_MATS_[m][1] : m)) + ' sample', icon: ART_MATS_[m] ? ART_MATS_[m][0] : '🧪' }));
  return { tests: SCI_TESTS_, order: SCI_ORDER_, tools: SCI_TOOLS_, samples: samples, mult: SCI_MULT_, inf: SCI_INF_,
    mats: Object.keys(SCI_MATS_).reduce((o, k) => { const P = SCI_MATS_[k]; o[k] = { mohs: P[0], dens: P[1], flex: P[6], tough: P[5], name: SCI_MAT_NAME_[k] || (ART_MATS_[k] ? ART_MATS_[k][1] : k), icon: ART_MATS_[k] ? ART_MATS_[k][0] : '🧪', group: ART_MATS_[k] ? ART_MATS_[k][2] : 'craft' }; return o; }, {}) };
}
/* ---------- ⚗️ CHEMISTRY (sc-2a) ----------
   Element cards = counts in Settings SciElements_<Name> = {e: [atomic numbers found in 🔍 Element hunt / ⚛️ Formula builder], c: [compound ids built]}.
   Crafting unlocks cards too: every material a player crafted with (Artifacts tab, `mats` + look.m / g) → its elements (SCI_MAT_ELEMS_).
   The element + compound data lives in the page include ChemTable.html (built by Test Harness/chemtable-build/build_chem.py). */
const SCI_MAT_ELEMS_ = {
  oak: [6, 1, 8], bamboo: [6, 1, 8], teak: [6, 1, 8], iron: [26], copper: [29], tin: [50], bronze: [29, 50], silver: [47], gold: [79], zinc: [30], brass: [29, 30], steel: [26, 6],
  granite: [14, 8, 13, 19, 11], jade: [11, 13, 14, 8], crystal: [14, 8], ruby: [13, 8, 24], sapphire: [13, 8, 26, 22], amethyst: [14, 8, 26],
  clay: [13, 14, 8, 1], fabric: [6, 1, 8], leather: [6, 1, 17], glass: [14, 8, 11, 20], sglass: [14, 8, 11, 20, 27], filament: [6, 1, 8],
  led: [31, 7], battery: [30, 25, 3], paint: [22, 8, 6, 1], varnish: [6, 1, 8], dye: [6, 1, 7, 8], fdye: [6, 1, 7, 8, 13, 19, 16],
  flower: [6, 1, 8, 7], sand: [14, 8], carbon: [6], cobalt: [27], alum: [19, 13, 16, 8, 1]
};
function sciChemStats_(st, name) {
  const s = jsonSetting_(st, 'SciElements_' + name, {});
  const e = (Array.isArray(s.e) ? s.e : []).map(Number).filter(n => n >= 1 && n <= 118 && Math.floor(n) === n);
  const c = (Array.isArray(s.c) ? s.c : []).map(String).filter(x => /^[a-z0-9]{1,16}$/.test(x));
  const a = (Array.isArray(s.a) ? s.a : []).map(Number).filter(n => n >= 1 && n <= 118 && Math.floor(n) === n);   // ⚛️ atoms you built (sc-2b)
  return { e: Array.from(new Set(e)).sort((a, b) => a - b), c: Array.from(new Set(c)), a: Array.from(new Set(a)).sort((x, y) => x - y), r: artInt_(s.r, 0, 1e6), q: artInt_(s.q, 0, 1e6) };
}
// elements you met by crafting: every material in every thing you own
function sciCraftElems_(name) {
  const set = {};
  artsOf_(name).forEach(a => { const ms = Object.keys(a.mats || {}); const L = a.look || {}; if (L.m) ms.push(L.m); if (L.g) ms.push(L.g);
    ms.forEach(m => (SCI_MAT_ELEMS_[m] || []).forEach(n => { set[n] = 1; })); });
  return Object.keys(set).map(Number).sort((a, b) => a - b);
}
function sciChemView_(st, name) {
  const s = sciChemStats_(st, name), craft = name ? sciCraftElems_(name) : [], all = {};
  s.e.concat(craft).forEach(n => { all[n] = 1; });
  return { e: s.e, c: s.c, a: s.a, craft: craft, all: Object.keys(all).map(Number).sort((a, b) => a - b), rounds: s.r, qrounds: s.q, mats: SCI_MAT_ELEMS_ };
}
// 🎨 how many ⚛️ atom looks a player owns (Code.gs ITEM_LINES atomskin; 0 = only Classic)
function sciAtomSkins_(name) { try { return itemsFor_(name, activePlayers_(listProfilesFull())).owned.atomskin || 0; } catch (e) { return 0; } }
const SCI_CHEM_KINDS_ = { hunt: '⚗️ Chemistry · Element hunt', formula: '⚗️ Chemistry · Formula builder', atom: '⚛️ Quantum · Atom builder' };
// one finished ⚗️ / ⚛️ round: (name, level 0-5, kind 'hunt' | 'formula' | 'atom', {found: [atomic numbers], built: [compound ids], atoms: [atomic numbers built], right, total, score, stars, timeSec})
function sciChemSave(name, level, kind, res) {
  checkPlayer_(name);
  if (!SCI_CHEM_KINDS_[kind]) throw new Error('Pick a chemistry game.');
  const lv = Math.max(0, Math.min(5, Math.floor(Number(level)) || 0)); res = res || {};
  const found = (Array.isArray(res.found) ? res.found : []).map(Number).filter(n => n >= 1 && n <= 118 && Math.floor(n) === n).slice(0, 40);
  const built = (Array.isArray(res.built) ? res.built : []).map(String).filter(x => /^[a-z0-9]{1,16}$/.test(x)).slice(0, 20);
  const atoms = kind === 'atom' ? (Array.isArray(res.atoms) ? res.atoms : []).map(Number).filter(n => n >= 1 && n <= 118 && Math.floor(n) === n).slice(0, 20) : [];
  const total = Math.max(1, Math.min(20, Math.floor(Number(res.total)) || 1)), right = Math.max(0, Math.min(total, Math.floor(Number(res.right)) || 0));
  const stars = Math.max(1, Math.min(3, Math.floor(Number(res.stars)) || 1)), score = Math.max(0, Math.min(30000, Math.round(Number(res.score)) || 0));
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  let out;
  try {
    const st = getSettings(), before = sciChemView_(st, name), S = sciChemStats_(st, name);
    const had = {}; before.all.forEach(n => { had[n] = 1; });
    const newCards = found.filter(n => !had[n]).filter((n, i, a) => a.indexOf(n) === i);
    const newComps = built.filter(x => S.c.indexOf(x) < 0).filter((x, i, a) => a.indexOf(x) === i);
    const newAtoms = atoms.filter(n => S.a.indexOf(n) < 0).filter((n, i, a) => a.indexOf(n) === i);
    S.e = Array.from(new Set(S.e.concat(found, atoms))).sort((a, b) => a - b); S.c = S.c.concat(newComps); S.a = S.a.concat(newAtoms).sort((a, b) => a - b);
    if (kind === 'atom') S.q++; else S.r++;
    saveSetting('SciElements_' + name, JSON.stringify(S));
    const extra = atoms.filter(n => !had[n] && newCards.indexOf(n) < 0).filter((n, i, a) => a.indexOf(n) === i); newCards.push.apply(newCards, extra);
    const all = before.all.concat(newCards).sort((a, b) => a - b);
    const stats = kind === 'atom' ? { quantumRounds: 1, atoms: S.a.length, elements: all.length } : { chemRounds: 1, elements: all.length, compounds: S.c.length };
    out = { kind: kind, level: lv, newCards: newCards, newComps: newComps, newAtoms: newAtoms, chem: { e: S.e, c: S.c, a: S.a, craft: before.craft, all: all, rounds: S.r, qrounds: S.q }, score: score, stars: stars, stats: stats };
  } finally { lock.releaseLock(); }
  try { out.save = saveLevelResult(SCI_GAME_, name, lv, { score: score, stars: stars, cleared: stars >= 2, timeSec: Math.max(0, Math.round(Number(res.timeSec) || 0)),
    theme: SCI_CHEM_KINDS_[kind], stats: out.stats }); }
  catch (e) { out.save = { err: String(e && e.message || e) }; }
  out.atomSkins = sciAtomSkins_(name);   // 🎨 a new look may have unlocked
  return out;
}
// boot: every player's level progress + avatars (getLevelGameData) + this player's things + counts + family records
function getSciencetoryData(player) {
  const out = getLevelGameData(SCI_GAME_, player);
  const players = activePlayers_(listProfilesFull()), st = out.settings || getSettings();
  const me = player && players.some(p => p.Name === player) ? player : '';
  out.player = me;
  out.things = me ? sciThingsOf_(me) : [];
  out.sci = me ? sciStats_(st, me) : sciStats_({}, '');
  out.fam = sciFamily_(st, players);
  out.meta = sciMeta_();
  out.chem = sciChemView_(st, me);   // ⚗️ element cards + compounds (sc-2a) + ⚛️ atoms (sc-2b)
  out.atomSkins = me ? sciAtomSkins_(me) : 0;   // 🎨 atom looks owned (sc-2b)
  return out;
}
// another player picked on the page → their things + counts
function getSciPlayer(name) {
  checkPlayer_(name); const st = getSettings(), players = activePlayers_(listProfilesFull());
  return { player: name, things: sciThingsOf_(name), sci: sciStats_(st, name), fam: sciFamily_(st, players), chem: sciChemView_(st, name), atomSkins: sciAtomSkins_(name) };
}
function sciThing_(name, ref) {
  ref = String(ref || '');
  if (/^sample:/.test(ref)) { const m = ref.slice(7); if (SCI_SAMPLES_.indexOf(m) < 0) throw new Error('Pick a lab sample.'); return { id: ref, kind: 'sample', name: (SCI_MAT_NAME_[m] || ART_MATS_[m][1]) + ' sample', look: { k: 'sample', m: m, q: 80 }, mats: {}, owners: [name], sample: true }; }
  const a = artRows_().find(x => x.id === ref);
  if (!a || a.owners.indexOf(name) === -1) throw new Error('You can only test your own things.');
  return a;
}
// 🔬 run one test: (name, thing id | 'sample:<mat>', test, level 0-5, guess ('yes' | 'no' below Hard, a range index from Hard), rig 0-1 (how well it was set in the rig))
function sciRun(name, ref, test, level, guess, rig) {
  checkPlayer_(name);
  const T = SCI_TESTS_[test]; if (!T) throw new Error('Pick a test.');
  const lv = Math.max(0, Math.min(5, Math.floor(Number(level)) || 0)), rg = Math.max(0, Math.min(1, Number(rig) || 0));
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  let res;
  try {
    const a = sciThing_(name, ref);
    if (a.look && a.look.br && !a.sample) throw new Error('It is broken — repair it in Artifactory first.');
    const no = sciNoFit_(a, test); if (no) throw new Error(no);
    const M = sciMeasure_(a, test, lv), val = sciRound_(test, M.v), meta = M.leak ? T.leak : T, ranges = lv >= 4 ? meta.bk4 : lv >= 3 ? meta.bk3 : null;
    const bucket = ranges ? sciBucket_(M.v, ranges) : -1;
    const right = ranges ? Number(guess) === bucket : (String(guess) === 'yes') === M.pass;
    // the thing: a real break sets look.br (Artifactory repairs it); samples only break on screen
    if (M.broke && !a.sample) { a.look.br = T.br || 'load'; a.look.bs = test; writeArt_(a); }
    // counts + records
    const st = getSettings(), players = activePlayers_(listProfilesFull()), fam0 = sciFamily_(st, players), S = sciStats_(st, name);
    const r = S.t[test] || (S.t[test] = { n: 0, best: 0, of: '', low: null });
    const fin = val < SCI_INF_ && val > 0, before = r.n;
    r.n++; S.runs++; if (right) S.right++; if (M.broke) S.breaks++;
    let mine = false, fam = false;
    if (a.sample) { /* 🧪 samples are the same for everyone — they count, but records are for things YOU made */ }
    else if (test === 'float' && !M.leak) { if (r.low == null || M.v < r.low) { r.low = sciNum_(M.v, 2); r.of = a.name; mine = before > 0; } fam = !fam0.float || M.v < fam0.float.v; }
    else if (fin && val > r.best) { r.best = val; r.of = a.name; mine = before > 0; fam = !fam0[test] || val > fam0[test].v; }
    saveSetting('SciTests_' + name, JSON.stringify(S));
    const stars = 1 + (rg >= 0.6 ? 1 : 0) + (right ? 1 : 0), score = Math.round((60 + 40 * rg + (right ? 100 : 0) + (fam ? 50 : 0)) * SCI_MULT_[lv]);
    const tool = SCI_TOOLS_[test] ? SCI_TOOLS_[test][lv] : null;
    res = { test: test, level: lv, value: val, inf: val >= SCI_INF_, pass: M.pass, broke: M.broke, how: M.how, leak: M.leak, unit: meta.unit, ch: meta.ch[lv], tool: tool,
      ranges: ranges, bucket: bucket, guess: guess, right: right, rig: rg, stars: stars, score: score, m: sciMatOf_(a), kind: a.kind, sample: !!a.sample,
      item: a.sample ? { id: a.id, kind: 'sample', name: a.name, look: a.look } : publicArt_(a), rec: { mine: mine, fam: fam, best: test === 'float' && !M.leak ? r.low : r.best, famPrev: fam0[test] || null },
      kinds: Object.keys(S.t).filter(k => S.t[k].n > 0).length, stats: { tests: 1, right: right ? 1 : 0, breaks: M.broke ? 1 : 0, records: fam ? 1 : 0, testKinds: Object.keys(S.t).filter(k => S.t[k].n > 0).length, samples: a.sample ? 1 : 0 } };
  } finally { lock.releaseLock(); }
  // the Archive board (Theme = section · test), feats + titles — after the lock (saveLevelResult takes it itself)
  try { res.save = saveLevelResult(SCI_GAME_, name, res.level, { score: res.score, stars: res.stars, cleared: res.stars >= 2, timeSec: 0, theme: '⚙️ Mechanic · ' + SCI_TESTS_[test].name, stats: res.stats }); }
  catch (e) { res.save = { err: String(e && e.message || e) }; }
  return res;
}
// (sc-1+sc-2a+sc-2b) END OF SciencetoryCode.gs

;
/* ===== on the device only: the grown-up PIN arrives hashed from the family Sheet (OfflineSync.gs) ===== */
function verifyAdminPin(pin) { var s = String(getSettings().AdminPIN || ''), p = String(pin || ''); if (s.indexOf('#sha256:') === 0) return !!p && s.slice(8) === __hex('steam-admin:' + p); return !!s && s === p; }
return {"include": typeof include === 'function' ? include : undefined,
"includeGroup": typeof includeGroup === 'function' ? includeGroup : undefined,
"setupDataCenter": typeof setupDataCenter === 'function' ? setupDataCenter : undefined,
"setupGamesTab": typeof setupGamesTab === 'function' ? setupGamesTab : undefined,
"setupLevelsTab": typeof setupLevelsTab === 'function' ? setupLevelsTab : undefined,
"setupProfilesTab": typeof setupProfilesTab === 'function' ? setupProfilesTab : undefined,
"setupProgressTab": typeof setupProgressTab === 'function' ? setupProgressTab : undefined,
"setupSettingsTab": typeof setupSettingsTab === 'function' ? setupSettingsTab : undefined,
"doGet": typeof doGet === 'function' ? doGet : undefined,
"getGames": typeof getGames === 'function' ? getGames : undefined,
"getLevels": typeof getLevels === 'function' ? getLevels : undefined,
"getOrCreateProfile": typeof getOrCreateProfile === 'function' ? getOrCreateProfile : undefined,
"listProfiles": typeof listProfiles === 'function' ? listProfiles : undefined,
"createProfile": typeof createProfile === 'function' ? createProfile : undefined,
"listProfilesFull": typeof listProfilesFull === 'function' ? listProfilesFull : undefined,
"deactivateProfile": typeof deactivateProfile === 'function' ? deactivateProfile : undefined,
"reactivateProfile": typeof reactivateProfile === 'function' ? reactivateProfile : undefined,
"removeProfile": typeof removeProfile === 'function' ? removeProfile : undefined,
"getSettings": typeof getSettings === 'function' ? getSettings : undefined,
"saveSetting": typeof saveSetting === 'function' ? saveSetting : undefined,
"saveSettings": typeof saveSettings === 'function' ? saveSettings : undefined,
"saveFavorites": typeof saveFavorites === 'function' ? saveFavorites : undefined,
"getScreenTimeMinutesForAge": typeof getScreenTimeMinutesForAge === 'function' ? getScreenTimeMinutesForAge : undefined,
"verifyAdminPin": typeof verifyAdminPin === 'function' ? verifyAdminPin : undefined,
"setAdminPin": typeof setAdminPin === 'function' ? setAdminPin : undefined,
"getProgress": typeof getProgress === 'function' ? getProgress : undefined,
"saveProgress": typeof saveProgress === 'function' ? saveProgress : undefined,
"getLeaderboard": typeof getLeaderboard === 'function' ? getLeaderboard : undefined,
"getDashboardData": typeof getDashboardData === 'function' ? getDashboardData : undefined,
"getModesFor": typeof getModesFor === 'function' ? getModesFor : undefined,
"markModeTried": typeof markModeTried === 'function' ? markModeTried : undefined,
"savePlayerBirthday": typeof savePlayerBirthday === 'function' ? savePlayerBirthday : undefined,
"getGameroomData": typeof getGameroomData === 'function' ? getGameroomData : undefined,
"getAchievementsData": typeof getAchievementsData === 'function' ? getAchievementsData : undefined,
"getAdminData": typeof getAdminData === 'function' ? getAdminData : undefined,
"getMazeData": typeof getMazeData === 'function' ? getMazeData : undefined,
"saveMazeResult": typeof saveMazeResult === 'function' ? saveMazeResult : undefined,
"getLevelGameData": typeof getLevelGameData === 'function' ? getLevelGameData : undefined,
"saveEyesDaily": typeof saveEyesDaily === 'function' ? saveEyesDaily : undefined,
"saveBeatSong": typeof saveBeatSong === 'function' ? saveBeatSong : undefined,
"styleSongsSheet": typeof styleSongsSheet === 'function' ? styleSongsSheet : undefined,
"saveMySong": typeof saveMySong === 'function' ? saveMySong : undefined,
"deleteMySong": typeof deleteMySong === 'function' ? deleteMySong : undefined,
"likeFamilySong": typeof likeFamilySong === 'function' ? likeFamilySong : undefined,
"playedFamilySong": typeof playedFamilySong === 'function' ? playedFamilySong : undefined,
"saveBeatPart": typeof saveBeatPart === 'function' ? saveBeatPart : undefined,
"saveLevelResult": typeof saveLevelResult === 'function' ? saveLevelResult : undefined,
"styleScoresSheet": typeof styleScoresSheet === 'function' ? styleScoresSheet : undefined,
"getGameLeaders": typeof getGameLeaders === 'function' ? getGameLeaders : undefined,
"savePlayerTheme": typeof savePlayerTheme === 'function' ? savePlayerTheme : undefined,
"getMiniData": typeof getMiniData === 'function' ? getMiniData : undefined,
"saveMiniResult": typeof saveMiniResult === 'function' ? saveMiniResult : undefined,
"styleFeatsSheet": typeof styleFeatsSheet === 'function' ? styleFeatsSheet : undefined,
"getWisCardsData": typeof getWisCardsData === 'function' ? getWisCardsData : undefined,
"getWisArt": typeof getWisArt === 'function' ? getWisArt : undefined,
"saveWisDaily": typeof saveWisDaily === 'function' ? saveWisDaily : undefined,
"saveWisDeck": typeof saveWisDeck === 'function' ? saveWisDeck : undefined,
"saveFeats": typeof saveFeats === 'function' ? saveFeats : undefined,
"savePlayerTitle": typeof savePlayerTitle === 'function' ? savePlayerTitle : undefined,
"geoJourneyDone": typeof geoJourneyDone === 'function' ? geoJourneyDone : undefined,
"getMyItems": typeof getMyItems === 'function' ? getMyItems : undefined,
"getItemsData": typeof getItemsData === 'function' ? getItemsData : undefined,
"markItemsSeen": typeof markItemsSeen === 'function' ? markItemsSeen : undefined,
"saveRoomStats": typeof saveRoomStats === 'function' ? saveRoomStats : undefined,
"styleWardrobeSheet": typeof styleWardrobeSheet === 'function' ? styleWardrobeSheet : undefined,
"styleGhostsSheet": typeof styleGhostsSheet === 'function' ? styleGhostsSheet : undefined,
"getGhostData": typeof getGhostData === 'function' ? getGhostData : undefined,
"saveGhost": typeof saveGhost === 'function' ? saveGhost : undefined,
"styleCreationsSheet": typeof styleCreationsSheet === 'function' ? styleCreationsSheet : undefined,
"getWorkshopData": typeof getWorkshopData === 'function' ? getWorkshopData : undefined,
"saveCreation": typeof saveCreation === 'function' ? saveCreation : undefined,
"deleteCreation": typeof deleteCreation === 'function' ? deleteCreation : undefined,
"setInShow": typeof setInShow === 'function' ? setInShow : undefined,
"voteCreation": typeof voteCreation === 'function' ? voteCreation : undefined,
"giveCreation": typeof giveCreation === 'function' ? giveCreation : undefined,
"getDailyData": typeof getDailyData === 'function' ? getDailyData : undefined,
"grantJoySkin": typeof grantJoySkin === 'function' ? grantJoySkin : undefined,
"claimDaily": typeof claimDaily === 'function' ? claimDaily : undefined,
"styleComicsSheet": typeof styleComicsSheet === 'function' ? styleComicsSheet : undefined,
"saveComic": typeof saveComic === 'function' ? saveComic : undefined,
"getComicBook": typeof getComicBook === 'function' ? getComicBook : undefined,
"voteComic": typeof voteComic === 'function' ? voteComic : undefined,
"deleteComic": typeof deleteComic === 'function' ? deleteComic : undefined,
"verifyPlayerPin": typeof verifyPlayerPin === 'function' ? verifyPlayerPin : undefined,
"setPlayerPin": typeof setPlayerPin === 'function' ? setPlayerPin : undefined,
"resetPlayerPin": typeof resetPlayerPin === 'function' ? resetPlayerPin : undefined,
"getRoomData": typeof getRoomData === 'function' ? getRoomData : undefined,
"saveAvatar": typeof saveAvatar === 'function' ? saveAvatar : undefined,
"saveRoomPick": typeof saveRoomPick === 'function' ? saveRoomPick : undefined,
"getMyRoom": typeof getMyRoom === 'function' ? getMyRoom : undefined,
"saveMyRoom": typeof saveMyRoom === 'function' ? saveMyRoom : undefined,
"sendGift": typeof sendGift === 'function' ? sendGift : undefined,
"openGift": typeof openGift === 'function' ? openGift : undefined,
"tidyRoom": typeof tidyRoom === 'function' ? tidyRoom : undefined,
"styleFeedbackSheet": typeof styleFeedbackSheet === 'function' ? styleFeedbackSheet : undefined,
"sendFeedback": typeof sendFeedback === 'function' ? sendFeedback : undefined,
"getMyFeedback": typeof getMyFeedback === 'function' ? getMyFeedback : undefined,
"getFeedbackList": typeof getFeedbackList === 'function' ? getFeedbackList : undefined,
"setFeedbackStatus": typeof setFeedbackStatus === 'function' ? setFeedbackStatus : undefined,
"rebuildFeedbackLog": typeof rebuildFeedbackLog === 'function' ? rebuildFeedbackLog : undefined,
"getShowroom": typeof getShowroom === 'function' ? getShowroom : undefined,
"saveShowroom": typeof saveShowroom === 'function' ? saveShowroom : undefined,
"getWordMeaning": typeof getWordMeaning === 'function' ? getWordMeaning : undefined,
"checkWord": typeof checkWord === 'function' ? checkWord : undefined,
"authorizeWordLookup": typeof authorizeWordLookup === 'function' ? authorizeWordLookup : undefined,
"saveSnaketale": typeof saveSnaketale === 'function' ? saveSnaketale : undefined,
"saveGeoJourney": typeof saveGeoJourney === 'function' ? saveGeoJourney : undefined,
"saveRacket": typeof saveRacket === 'function' ? saveRacket : undefined,
"saveBatstick": typeof saveBatstick === 'function' ? saveBatstick : undefined,
"saveWordJournal": typeof saveWordJournal === 'function' ? saveWordJournal : undefined,
"saveBestiary": typeof saveBestiary === 'function' ? saveBestiary : undefined,
"getBestiary": typeof getBestiary === 'function' ? getBestiary : undefined,
"saveSkillTree": typeof saveSkillTree === 'function' ? saveSkillTree : undefined,
"startPoseSession": typeof startPoseSession === 'function' ? startPoseSession : undefined,
"doPost": typeof doPost === 'function' ? doPost : undefined,
"savePoseCollection": typeof savePoseCollection === 'function' ? savePoseCollection : undefined,
"saveBoothDesign": typeof saveBoothDesign === 'function' ? saveBoothDesign : undefined,
"savePoseTest": typeof savePoseTest === 'function' ? savePoseTest : undefined,
"styleArtifactsSheet": typeof styleArtifactsSheet === 'function' ? styleArtifactsSheet : undefined,
"getArtifactoryData": typeof getArtifactoryData === 'function' ? getArtifactoryData : undefined,
"artClaimDaily": typeof artClaimDaily === 'function' ? artClaimDaily : undefined,
"artCraft": typeof artCraft === 'function' ? artCraft : undefined,
"artFinish": typeof artFinish === 'function' ? artFinish : undefined,
"artGlow": typeof artGlow === 'function' ? artGlow : undefined,
"artLab": typeof artLab === 'function' ? artLab : undefined,
"artRecycle": typeof artRecycle === 'function' ? artRecycle : undefined,
"artGiveItem": typeof artGiveItem === 'function' ? artGiveItem : undefined,
"artRename": typeof artRename === 'function' ? artRename : undefined,
"artShelfPut": typeof artShelfPut === 'function' ? artShelfPut : undefined,
"artShelfTake": typeof artShelfTake === 'function' ? artShelfTake : undefined,
"artRequest": typeof artRequest === 'function' ? artRequest : undefined,
"artGive": typeof artGive === 'function' ? artGive : undefined,
"saveArtOutfits": typeof saveArtOutfits === 'function' ? saveArtOutfits : undefined,
"artRemix": typeof artRemix === 'function' ? artRemix : undefined,
"artGameDrop": typeof artGameDrop === 'function' ? artGameDrop : undefined,
"artShowSet": typeof artShowSet === 'function' ? artShowSet : undefined,
"artVote": typeof artVote === 'function' ? artVote : undefined,
"getArtStrip": typeof getArtStrip === 'function' ? getArtStrip : undefined,
"artDescribe": typeof artDescribe === 'function' ? artDescribe : undefined,
"artFamSave": typeof artFamSave === 'function' ? artFamSave : undefined,
"artFamRemove": typeof artFamRemove === 'function' ? artFamRemove : undefined,
"artTest": typeof artTest === 'function' ? artTest : undefined,
"artRepair": typeof artRepair === 'function' ? artRepair : undefined,
"sciChemSave": typeof sciChemSave === 'function' ? sciChemSave : undefined,
"getSciencetoryData": typeof getSciencetoryData === 'function' ? getSciencetoryData : undefined,
"getSciPlayer": typeof getSciPlayer === 'function' ? getSciPlayer : undefined,
"sciRun": typeof sciRun === 'function' ? sciRun : undefined};
} };

const VER = self.STEAM_GS.ver;
const TZ = 'Asia/Bangkok';
const DB_NAME = 'steam-offline';
// grown-up functions: online app only (Setup page) — never run on the device
const ONLINE_ONLY = ['setAdminPin', 'saveSettings', 'removeProfile', 'resetPlayerPin', 'savePlayerBirthday', 'setFeedbackStatus', 'getFeedbackList', 'getAdminData', 'saveOfflineKey', 'getOfflineInfo'];
// sent to the real server when online (they need Google's internet services)
const FORWARD = ['getWordMeaning', 'checkWord', 'startPoseSession', 'resetPlayerPin',
  'linkHost', 'linkJoin', 'linkHostPoll', 'linkAnswer', 'linkGuestPoll', 'linkRoomSet', 'linkList', 'linkIce'];   // 📡 lk-1a: LinkKit mailbox is online-only
// never put in the waiting list (readers that may tidy a tab; the real server does that itself)
const NO_PUSH = /^(get|list|verify|check|is|has)[A-Z]/;
const MSG_NET = '📴 This needs the internet — try again when this device is online.';
const MSG_GUEST = '🧪 This is the guest copy — a grown-up types the family key to use this.';
const MSG_GROWNUP = '⚙️ Grown-up settings work in the online app only.';

/* ---------- tiny SHA-256 (Utilities.computeDigest must be synchronous) ---------- */
const K256 = new Uint32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
function sha256(str) {
  const msg = new TextEncoder().encode(String(str)), l = msg.length, n = ((l + 9 + 63) >> 6) << 6, b = new Uint8Array(n);
  b.set(msg); b[l] = 0x80; const dv = new DataView(b.buffer); dv.setUint32(n - 4, l * 8 >>> 0); dv.setUint32(n - 8, Math.floor(l / 0x20000000));
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]), w = new Uint32Array(64);
  const r = (x, c) => (x >>> c) | (x << (32 - c));
  for (let o = 0; o < n; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) { const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0; }
    let [a, bb, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K256[i] + w[i]) | 0, t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
    }
    H[0] += a; H[1] += bb; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
  }
  const out = new Uint8Array(32); const ov = new DataView(out.buffer); for (let i = 0; i < 8; i++) ov.setUint32(i * 4, H[i]); return out;
}
const hex = str => Array.from(sha256(str), x => x.toString(16).padStart(2, '0')).join('');

/* ---------- the on-device "Sheet" (same behaviour as the harness gasmock) ---------- */
let BOOKS = {};            // tab name -> 2D array (Dates stay Dates)
let DIRTY = new Set();     // tabs written during the current call
function makeSpreadsheet() {
  const loose = () => new Proxy(function () {}, { get: (t, k) => k === 'forEach' ? (() => {}) : k === 'filter' ? (() => []) : k === 'then' ? undefined : loose(), apply: () => loose() });
  function range(name, r, c, nr, nc) {
    if (typeof r !== 'number') return loose();          // A1 strings are only used for formatting ('B:C')
    const data = BOOKS[name];
    const chain = new Proxy({}, { get: (t, k) => k in t ? t[k] : (k === 'then' ? undefined : () => chain) });
    Object.assign(chain, {
      getValues: () => { const out = []; for (let i = 0; i < nr; i++) { const row = data[r - 1 + i] || [], o = []; for (let j = 0; j < nc; j++) o.push(row[c - 1 + j] === undefined ? '' : row[c - 1 + j]); out.push(o); } return out; },
      getValue: () => { const row = data[r - 1] || []; return row[c - 1] === undefined ? '' : row[c - 1]; },
      getDisplayValues: () => chain.getValues().map(row => row.map(v => v instanceof Date ? fmtDate(v, TZ, 'yyyy-MM-dd HH:mm') : String(v))),
      setValues: vals => {
        if (vals.length !== nr || vals.some(v => v.length !== nc)) throw new Error('The number of rows or columns in the data does not match the range.');
        DIRTY.add(name); vals.forEach((v, i) => { data[r - 1 + i] = data[r - 1 + i] || []; v.forEach((x, j) => { data[r - 1 + i][c - 1 + j] = x; }); }); return chain;
      },
      setValue: v => { DIRTY.add(name); data[r - 1] = data[r - 1] || []; data[r - 1][c - 1] = v; return chain; },
      clearContent: () => { DIRTY.add(name); for (let i = 0; i < nr; i++) { const row = data[r - 1 + i]; if (row) for (let j = 0; j < nc; j++) row[c - 1 + j] = ''; } return chain; },
      getRow: () => r, getColumn: () => c, getNumRows: () => nr, getNumColumns: () => nc,
    });
    return chain;
  }
  function sheet(name) {
    const api = {
      _name: name, getName: () => name,
      getLastRow: () => BOOKS[name].length,
      getLastColumn: () => BOOKS[name].reduce((m, r) => Math.max(m, r.length), 0),
      getDataRange: () => range(name, 1, 1, Math.max(BOOKS[name].length, 1), Math.max(api.getLastColumn(), 1)),
      getRange: (r, c, nr, nc) => range(name, r, c, nr || 1, nc || 1),
      appendRow: row => { DIRTY.add(name); BOOKS[name].push(row.slice()); return api; },
      deleteRow: r => { DIRTY.add(name); BOOKS[name].splice(r - 1, 1); return api; },
      deleteRows: (r, n) => { DIRTY.add(name); BOOKS[name].splice(r - 1, n); return api; },
      insertRowAfter: () => api, insertRowsAfter: () => api,
      getMaxRows: () => Math.max(BOOKS[name].length, 1000), getMaxColumns: () => 26,
      setFrozenRows: () => api, autoResizeColumns: () => api,
    };
    return new Proxy(api, { get: (t, k) => (k in t ? t[k] : (k === 'then' ? undefined : loose())) });
  }
  const ss = {
    getSheetByName: n => (BOOKS[n] ? sheet(n) : null),
    insertSheet: n => { BOOKS[n] = BOOKS[n] || []; DIRTY.add(n); return sheet(n); },
    deleteSheet: s => { delete BOOKS[s._name]; DIRTY.add(s._name); },
    getSheets: () => Object.keys(BOOKS).map(sheet),
    getId: () => 'offline', getUrl: () => '', getName: () => 'Games Data Center (on this device)',
  };
  return new Proxy(ss, { get: (t, k) => (k in t ? t[k] : (k === 'then' ? undefined : loose())) });
}

/* ---------- Utilities.formatDate in the script time zone ---------- */
const DTF = {};
function fmtDate(d, tz, f) {
  const z = tz || TZ, fm = DTF[z] || (DTF[z] = new Intl.DateTimeFormat('en-GB', { timeZone: z, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', weekday: 'short' }));
  const p = {}; fm.formatToParts(new Date(+d)).forEach(x => { p[x.type] = x.value; });
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return String(f).replace(/yyyy|yy|MMM|MM|dd|HH|mm|ss|EEE|d|M/g, t => ({ yyyy: p.year, yy: p.year.slice(2), MMM: M[+p.month - 1], MM: p.month, dd: p.day, HH: p.hour === '24' ? '00' : p.hour, mm: p.minute, ss: p.second, EEE: p.weekday, d: String(+p.day), M: String(+p.month) }[t]));
}

/* ---------- Google services as Code.gs sees them on the device ---------- */
const CACHE = {};
function includeText(name) {   // HtmlService.createHtmlOutputFromFile(name).getContent() — the include files (inc/<Name>.js)
  const x = new XMLHttpRequest(); x.open('GET', '../inc/' + encodeURIComponent(name) + '.js', false); x.send();
  if (x.status !== 200 && x.status !== 0) throw new Error('missing file ' + name);
  const t = x.responseText, a = t.indexOf('document.write('), b = t.lastIndexOf(');');
  return JSON.parse(t.slice(a + 15, b));
}
function services(DateC) {
  const ss = makeSpreadsheet();
  const fail = m => () => { throw new Error(m); };
  return {
    SpreadsheetApp: { openById: () => ss, getActiveSpreadsheet: () => ss, ProtectionType: { RANGE: 'RANGE', SHEET: 'SHEET' }, flush() {} },
    HtmlService: {
      createHtmlOutputFromFile: n => ({ getContent: () => includeText(n) }),
      createTemplateFromFile: fail('Pages are already built in the offline app.'),
      createHtmlOutput: h => ({ getContent: () => String(h || '') }),
      XFrameOptionsMode: { ALLOWALL: 'ALLOWALL', DEFAULT: 'DEFAULT' }, SandboxMode: { IFRAME: 'IFRAME' },
    },
    ContentService: { MimeType: { JSON: 'json', TEXT: 'text' }, createTextOutput: s => ({ getContent: () => s, setMimeType() { return this; } }) },
    ScriptApp: { getService: () => ({ getUrl: () => self.location.href.replace(/app\/server\.js.*$/, '') }) },
    CacheService: { getScriptCache: () => ({ get: k => (k in CACHE ? CACHE[k] : null), put: (k, v) => { CACHE[k] = String(v); }, remove: k => { delete CACHE[k]; }, getAll: ks => { const o = {}; ks.forEach(k => { if (k in CACHE) o[k] = CACHE[k]; }); return o; }, putAll: o => Object.assign(CACHE, o) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, tryLock() { return true; }, releaseLock() {}, hasLock() { return true; } }), getUserLock() { return this.getScriptLock(); }, getDocumentLock() { return this.getScriptLock(); } },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => null, setProperty() {}, deleteProperty() {}, getProperties: () => ({}) }) },
    UrlFetchApp: { fetch: fail(MSG_NET) },
    DriveApp: { getFileById: fail('Drive is not on this device'), getFolderById: fail('Drive is not on this device') },
    MimeType: { PLAIN_TEXT: 'text/plain', PNG: 'image/png', JPEG: 'image/jpeg' },
    Logger: { log() {} },
    Session: { getScriptTimeZone: () => TZ, getActiveUser: () => ({ getEmail: () => '' }), getEffectiveUser: () => ({ getEmail: () => '' }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'SHA_256' }, Charset: { UTF_8: 'UTF_8' },
      computeDigest: (alg, text) => Array.from(sha256(text), x => x > 127 ? x - 256 : x),
      getUuid: () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => ((Math.random() * 16) | 0).toString(16)),
      base64Encode: b => btoa(String.fromCharCode.apply(null, (typeof b === 'string' ? Array.from(new TextEncoder().encode(b)) : b).map(x => x & 255))),
      base64Decode: s => Array.from(atob(s), ch => { const x = ch.charCodeAt(0); return x > 127 ? x - 256 : x; }),
      formatDate: fmtDate, sleep() {},
      newBlob: fail('Pictures are saved in the online app.'),
    },
    console, Date: DateC, __hex: hex,
  };
}
const SERVICE_NAMES = ['SpreadsheetApp', 'HtmlService', 'ContentService', 'ScriptApp', 'CacheService', 'LockService', 'PropertiesService', 'UrlFetchApp', 'DriveApp', 'MimeType', 'Logger', 'Session', 'Utilities', 'console', 'Date', '__hex'];
// A clock fixed at `ms` (replaying a waiting result at the time it was played)
function clockAt(ms) {
  class PlayDate extends Date { constructor(...a) { if (a.length) super(...a); else super(ms); } static now() { return ms; } static [Symbol.hasInstance](x) { return x instanceof Date; } }
  return PlayDate;
}
// One fresh "execution" per call, exactly like Apps Script (every memo starts empty)
function runFn(fn, args, at) {
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(fn)) throw new Error('client called private function ' + fn);
  const sv = services(at ? clockAt(at) : Date);
  const fns = self.STEAM_GS.make.apply(null, SERVICE_NAMES.map(n => sv[n]));
  if (typeof fns[fn] !== 'function') throw new Error('Script function not found: ' + fn);
  return fns[fn].apply(null, args || []);
}

/* ---------- IndexedDB: tabs, waiting list, meta ---------- */
let DB = null;
function idb() {
  if (DB) return Promise.resolve(DB);
  return new Promise((res, rej) => {
    const q = indexedDB.open(DB_NAME, 1);
    q.onupgradeneeded = () => { const d = q.result; ['tabs', 'ops', 'meta', 'dead'].forEach(s => { if (!d.objectStoreNames.contains(s)) d.createObjectStore(s); }); };
    q.onsuccess = () => { DB = q.result; res(DB); }; q.onerror = () => rej(q.error);
  });
}
function tx(stores, mode, fn) {
  return idb().then(d => new Promise((res, rej) => { const t = d.transaction(stores, mode); let out; t.oncomplete = () => res(out); t.onerror = t.onabort = () => rej(t.error); out = fn(t); }));
}
const getAll = store => tx([store], 'readonly', t => { const o = {}; const s = t.objectStore(store); const q = s.openCursor(); q.onsuccess = () => { const c = q.result; if (c) { o[c.key] = c.value; c.continue(); } }; return o; });
let META = {}, OPS = {};
async function load() {
  const [tabs, meta, ops] = await Promise.all([tx(['tabs'], 'readonly', t => { const o = {}; const q = t.objectStore('tabs').openCursor(); q.onsuccess = () => { const c = q.result; if (c) { o[c.key] = c.value; c.continue(); } }; return o; }), Promise.resolve().then(() => getAll('meta')), Promise.resolve().then(() => getAll('ops'))]);
  // getAll above returns via oncomplete — values are filled when the promise resolves
  META = meta || {}; OPS = ops || {};
  if (!META.device) { META.device = Math.random().toString(16).slice(2, 10) + '-' + deviceKind(); await putMeta(); }
  if (!Object.keys(tabs).length) await seedGuest(); else BOOKS = tabs;
}
function deviceKind() { const u = (self.navigator && navigator.userAgent) || ''; return /iPad|Macintosh.*Mobile/.test(u) ? 'iPad' : /iPhone/.test(u) ? 'iPhone' : /Android/.test(u) ? 'Android' : 'Computer'; }
function putMeta() { return tx(['meta'], 'readwrite', t => { const s = t.objectStore('meta'); Object.keys(META).forEach(k => s.put(META[k], k)); }); }
function saveTabs(names, extra) {
  return tx(['tabs', 'ops', 'meta'], 'readwrite', t => {
    const s = t.objectStore('tabs');
    names.forEach(n => { if (BOOKS[n]) s.put(BOOKS[n], n); else s.delete(n); });
    if (extra) extra(t);
  });
}
function replaceAllTabs(extra) {
  return tx(['tabs', 'ops', 'meta'], 'readwrite', t => {
    const s = t.objectStore('tabs'); s.clear(); Object.keys(BOOKS).forEach(n => s.put(BOOKS[n], n));
    if (extra) extra(t);
  });
}

/* ---------- 🧪 guest copy: a tiny made-up family, nothing synced ---------- */
const GUEST_NAMES = ['Waffle Wizard', 'Rocket Raccoon Kid', 'Captain Noodle', 'Pixel Panda', 'Disco Dino', 'Bubble Bot', 'Mango Comet', 'Turbo Turtle', 'Jelly Jet', 'Star Sprout', 'Lava Llama', 'Robo Pickle'];
async function seedGuest() {
  const r = await fetch('../guest.json'); const g = decodeTabs(await r.json());
  const pick = GUEST_NAMES.slice().sort(() => Math.random() - 0.5).slice(0, 3), ages = ['4-5', '6-7', '8-9'];
  const prof = g.Profiles; const h = prof[0]; const iN = h.indexOf('Name'), iA = h.indexOf('Age'), iC = h.indexOf('CreatedDate'), iX = h.indexOf('Active');
  g.Profiles = [h].concat(pick.map((n, i) => { const row = h.map(() => ''); row[iN] = n; if (iA >= 0) row[iA] = ages[i]; if (iC >= 0) row[iC] = new Date(); if (iX >= 0) row[iX] = true; return row; }));
  BOOKS = g; META.mode = 'guest'; META.guestAt = Date.now();
  await replaceAllTabs(t => { const m = t.objectStore('meta'); Object.keys(META).forEach(k => m.put(META[k], k)); });
}
function decodeTabs(o) {
  const out = {}; const dv = v => (v && typeof v === 'object' && '$d' in v) ? new Date(v.$d) : v;
  Object.keys(o.tabs || o).forEach(n => { out[n] = (o.tabs || o)[n].map(r => r.map(dv)); });
  return out;
}

/* ---------- calls from the page ---------- */
let QUEUE = Promise.resolve();
const isFamily = () => META.mode === 'family' && META.key && META.execUrl;
let NET = true;   // the page tells us when the device goes on / off line
const online = () => NET && (self.navigator ? navigator.onLine !== false : true);
function plain(x) { return x === undefined ? null : JSON.parse(JSON.stringify(x)); }
async function handleCall(fn, args) {
  if (FORWARD.indexOf(fn) >= 0) {
    if (!isFamily()) throw new Error(META.mode === 'family' ? MSG_NET : MSG_GUEST);
    if (!online()) throw new Error(MSG_NET);
    const r = await api({ op: 'call', fn, args });
    if (fn === 'resetPlayerPin') setTimeout(() => sync('after ' + fn), 500);
    return r.result;
  }
  if (ONLINE_ONLY.indexOf(fn) >= 0) throw new Error(MSG_GROWNUP);
  DIRTY = new Set();
  let res;
  try { res = plain(runFn(fn, args)); }
  catch (e) { if (DIRTY.size) await reloadTabs([...DIRTY]); throw e; }   // a failed call leaves no half-written rows
  const changed = [...DIRTY];
  if (changed.length) {
    const op = (!NO_PUSH.test(fn) && META.mode === 'family' && META.lastPull) ? { id: META.device + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7), fn, args: plain(args) || [], at: Date.now(), ver: VER } : null;
    await saveTabs(changed, op ? t => { t.objectStore('ops').put(op, op.id); } : null);
    if (op) { OPS[op.id] = op; status(); syncSoon(); }
  }
  return res;
}
async function reloadTabs(names) { const all = await tx(['tabs'], 'readonly', t => { const o = {}; const q = t.objectStore('tabs').openCursor(); q.onsuccess = () => { const c = q.result; if (c) { o[c.key] = c.value; c.continue(); } }; return o; }); names.forEach(n => { if (all[n]) BOOKS[n] = all[n]; else delete BOOKS[n]; }); }

/* ---------- 🔄 sync with the real Google Sheet (OfflineSync.gs) ---------- */
let SYNCING = false, LAST_ERR = '', SYNC_T = 0;
async function api(body) {
  const r = await fetch(META.execUrl, { method: 'POST', body: JSON.stringify(Object.assign({ api: 'offline', key: META.key, device: META.device, ver: VER }, body)), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow', cache: 'no-store' });
  const j = await r.json();
  if (!j || !j.ok) { const e = new Error((j && (j.message || j.error)) || 'The family Sheet did not answer'); e.code = j && j.error; throw e; }
  return j;
}
function syncSoon(ms) { clearTimeout(SYNC_T); SYNC_T = setTimeout(() => sync('soon'), ms == null ? 3000 : ms); }
async function sync(why) {
  if (SYNCING || !isFamily() || !online()) { status(); return false; }
  SYNCING = true; status();
  try {
    const pending = Object.values(OPS).sort((a, b) => a.at - b.at);
    if (pending.length) {
      const r = await api({ op: 'push', ops: pending.slice(0, 200) });
      const done = r.done || [], failed = r.failed || [];
      await tx(['ops', 'dead'], 'readwrite', t => {
        done.forEach(id => { t.objectStore('ops').delete(id); delete OPS[id]; });
        failed.forEach(f => { const op = OPS[f.id]; if (op) { op.err = f.error; t.objectStore('dead').put(op, op.id); t.objectStore('ops').delete(f.id); delete OPS[f.id]; } });
      });
    }
    const snap = await api({ op: 'snapshot' });
    BOOKS = decodeTabs(snap);
    // results played while we were syncing are not on the Sheet yet: play them again on top of the fresh copy
    const left = Object.values(OPS).sort((a, b) => a.at - b.at);
    left.forEach(op => { try { DIRTY = new Set(); runFn(op.fn, op.args, op.at); } catch (e) { /* stays in the list; the server decides */ } });
    META.lastPull = Date.now(); META.sheetAt = snap.at || ''; LAST_ERR = '';
    await replaceAllTabs(t => { const m = t.objectStore('meta'); Object.keys(META).forEach(k => m.put(META[k], k)); });
    if (Object.keys(OPS).length) syncSoon(1500);
    return true;
  } catch (e) {
    LAST_ERR = e.code === 'key' ? 'key' : (e instanceof TypeError ? '' : String(e.message || e));   // no internet ≠ a problem
    if (e.code === 'key') { META.keyBad = true; putMeta(); }
    return false;
  } finally { SYNCING = false; status(); }
}

/* ---------- 🔑 family key: unlocks the family's Sheet on this device ---------- */
function b64(s) { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }
const normKey = k => String(k || '').trim().toLowerCase().replace(/\s+/g, ' ');
async function openLink(key) {
  let L; try { const r = await fetch('../link.json', { cache: 'no-cache' }); if (!r.ok) throw 0; L = await r.json(); } catch (e) { throw new Error('🔧 The family key is not set up yet — a grown-up turns it on in ⚙️ Setup → 📲 Offline app (online app).'); }
  if (!L || !L.ct) throw new Error('🔧 The family key is not set up yet — a grown-up turns it on in ⚙️ Setup → 📲 Offline app (online app).');
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(normKey(key)), 'PBKDF2', false, ['deriveKey']);
  const k = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(L.salt), iterations: L.iter || 150000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  let txt; try { txt = new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(L.iv) }, k, b64(L.ct))); } catch (e) { throw new Error('🔑 That family key is not right — check the words and try again.'); }
  return JSON.parse(txt);
}
async function link(key) {
  const info = await openLink(key);
  const was = META.mode;
  META.key = normKey(key); META.execUrl = info.u; META.mode = 'family'; META.keyBad = false; META.linkedAt = Date.now();
  await putMeta();
  if (was !== 'family') {   // the guest players / results stay out of the family Sheet
    OPS = {}; await tx(['ops'], 'readwrite', t => { t.objectStore('ops').clear(); });
  }
  const ok = await sync('link');
  return { ok: true, pulled: ok, error: ok ? '' : LAST_ERR };
}
async function unlink() {
  META = { device: META.device }; OPS = {};
  await tx(['meta', 'ops', 'tabs'], 'readwrite', t => { t.objectStore('meta').clear(); t.objectStore('ops').clear(); t.objectStore('tabs').clear(); });
  await putMeta(); await seedGuest(); return { ok: true };
}

/* ---------- talking to the page ---------- */
function status() {
  self.postMessage({ t: 'status', s: { mode: META.mode || 'guest', pending: Object.keys(OPS).length, syncing: SYNCING, online: online(), lastPull: META.lastPull || 0, error: LAST_ERR, keyBad: !!META.keyBad, ver: VER, device: META.device, linked: !!isFamily() } });
}
const READY = load().then(() => { status(); if (isFamily()) syncSoon(META.lastPull && Date.now() - META.lastPull < 120000 && !Object.keys(OPS).length ? 60000 : 1200); });
self.addEventListener('online', () => { status(); syncSoon(800); });
self.addEventListener('offline', () => status());
self.onmessage = e => {
  const m = e.data || {};
  if (m.t === 'call') {
    QUEUE = QUEUE.then(() => READY).then(() => handleCall(m.fn, m.args))
      .then(res => self.postMessage({ t: 'res', id: m.id, ok: true, res }), err => self.postMessage({ t: 'res', id: m.id, ok: false, error: String((err && err.message) || err) }));
  } else if (m.t === 'net') { status(); if (m.online) syncSoon(800); }
  else if (m.t === 'sync') { QUEUE = QUEUE.then(() => READY).then(() => sync('tap')).then(ok => self.postMessage({ t: 'res', id: m.id, ok: true, res: ok })); }
  else if (m.t === 'link') { QUEUE = QUEUE.then(() => READY).then(() => link(m.key)).then(res => self.postMessage({ t: 'res', id: m.id, ok: true, res }), err => self.postMessage({ t: 'res', id: m.id, ok: false, error: String(err.message || err) })); }
  else if (m.t === 'unlink') { QUEUE = QUEUE.then(() => READY).then(unlink).then(res => self.postMessage({ t: 'res', id: m.id, ok: true, res })); }
  else if (m.t === 'debug') { QUEUE = QUEUE.then(() => READY).then(() => self.postMessage({ t: 'res', id: m.id, ok: true, res: { meta: Object.assign({}, META, { key: META.key ? '***' : '' }), ops: Object.values(OPS), tabs: Object.keys(BOOKS).reduce((o, k) => { o[k] = BOOKS[k].length; return o; }, {}) } })); }
  else if (m.t === 'rows') { QUEUE = QUEUE.then(() => READY).then(() => self.postMessage({ t: 'res', id: m.id, ok: true, res: JSON.parse(JSON.stringify(BOOKS[m.tab] || [])) })); }
  else if (m.t === 'status') status();
};
