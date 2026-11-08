# 🎮 STEAM Playground — offline app

The family's STEAM Playground games as an app you add to the iPad / phone / computer home screen.
It opens instantly, **plays without internet**, saves on the device and **syncs to the family's Google Sheet** when online.
The Apps Script web app stays the main version — this site is **built** from the same files.

**Address:** https://aowu-hub.github.io/steam-playground/

## Install (once per device)
| Device | Steps |
|---|---|
| iPad / iPhone | open the address in **Safari** → Share ⬆️ → **Add to Home Screen** → open 🎮 STEAM Playground once **with internet** (it stores every game, ~8 MB) → a grown-up types the **family key** (🧪 chip → 🔑) |
| Android / computer | Chrome / Edge → **Install app** (⊕ in the address bar) → open once with internet → family key |

Without the family key the app is a 🧪 **guest copy**: the games play with made-up players, nothing is synced.
The family key is set by a grown-up in the online app: ⚙️ Setup → 📲 Offline app.

## What is in this repo (all built — don't edit by hand)
| File | What |
|---|---|
| `index.html` + one page per game (`gameroom.html`, `maze.html` …) | the Apps Script pages with their template values filled from the address |
| `inc/*.js` | the shared parts (UiKit, AvatarKit, word lists, cards …), written into each page like `include()` does |
| `app/server.js` | the app's own "server": the real Code.gs running on the device against a copy of the family tabs (IndexedDB) |
| `app/boot.js`, `app/offline-ui.js` | `google.script.run` → the device server, status chip, family key card, install guide, update card |
| `sw.js` | service worker: keeps every file on the device; on a new version it downloads **only the changed files** and shows "🆕 New update ready! ⟳" (never in the middle of a game) |
| `files.json` | every file + its hash + the **version stamp** (`vYYYY.MM.DD-HHMM`) |
| `guest.json` | the empty guest Sheet |
| `link.json` | the family link, **encrypted with the family key** (no address, no names in this public repo) |

**Nothing private is ever here:** no names, PINs, photos, Sheet IDs or app links — the build stops if it finds one.

## Publishing an update (done by the Claude chats at every delivery)
1. Stage every app file fresh from Drive into `steam/`, the harness into `h/` (`Test Harness`).
2. `node h/offline/build.js --app steam --out <this repo>` → new version stamp.
3. Quick check: `cd h && PART=1 ONLY=home,gameroom,maze node offline.js`.
4. Commit + push to `main` → GitHub Pages serves it; devices update the next time they open with internet.

**Undo a bad update:** revert the last commit on GitHub (`git revert HEAD` + push). Devices see the old files as a new version and go back to them.
