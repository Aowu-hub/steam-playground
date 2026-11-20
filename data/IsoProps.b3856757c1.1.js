
/* ================= 🌳 IsoProps — shared 2.5D props on the IsoKit grid (ip-1 · ip-3, 🌳 IsoProps chat, 2026-11-17) =================
   ONE catalogue of houses · shops · trees · decor · landmarks drawn in code, that every IsoKit game picks from (🧳 Avateer · ⚔️ AvataRealm ·
   🏰 TD-Stories · 🏡 Family Room …). IsoKit = the engine (ground, camera, frame); IsoProps = the art on top. Plan: Drive "IsoProps — full plan.md".
   Page:  include('IsoProps') AFTER include('IsoKit'). Global `Props`. Pure canvas, no emoji in the art, no server tags in this file.
   Built from Test Harness/isoprops/kit (10_ip_head · 20_ip_core · 21_ip_catalogue · 28_ip_need · 29_ip_tools · 30_ip_api · 40_ip_town · 90_ip_export) by build_isoprops.py — never edit IsoProps.html by hand.
   📦 ip-4a ENGINE + ONE FILE PER LOOK (Aowu 2026-11-17 "engine + per-look"): this file = the engine + the 🏘️ village / 🌴 jungle starter set every look falls back to;
     each look is its own small file IsoLook_<name> (kit/looks/<name>.js): jungle (🇹🇭 inn · forge · plaza) · cherry · desert · snow · farm · grow · lava · coral · moon · castle.
     Pages still write ONLY include('IsoProps'), then   Props.need(['coral', 'castle'], start)   (or  await Props.need([...]) ) before using those looks / props.
     The 📲 offline app + the tests have every file inline → need() answers at once. Online the files load on demand (Code.gs INCLUDE_LAZY_ → Props.sources).
     A look / prop used before its file is there → ONE console warning (look falls back to the village buildings; Props.fileOf(key) names the file).
     🔁 ip-4a only: jungle + farm + grow still come with include('IsoProps') online too, until 🏰 TD-Stories + 🧳 Avateer call Props.need.
     Props.need(names, cb) · Props.has(name) · Props.files() (loaded) · Props.FILES (all) · Props.fileOf(key)
   🏰⚔️ ar-1 AVATAREALM SIDES (look files realm · raptor · bolt; Props.need(['raptor']) brings realm first — Props.DEPS):
     Props.AR = {TEAMS, TEAM_ORDER, TEAM_PAT, SLOTS, SLOT_ORDER, SIDES, BUILD_STEPS, FLOORS, key(side, slot), slotOf(key), sideOf(key), set(it, {team, build, kerb}, map)}
     a building = '<side>_<slot>' (raptor_house …, same foot + door for every side) · options {team: 'red' | any hex, build: 0 | 33 | 66 | 100, kerb: false}
     (= the same in pal) → 🎨 team colour + 🧵 team PATTERN on bands · banners · flags · ground kerb · 🏗️ the same model cut in scaffolding · cond 'ruined' = destroyed
     🪙 coinrock + 🧱 bricktree (states full · half · empty, recoloured by look.res) · 🟩 Props.AR.FLOORS[side].paint(g, q, s, i, j) = territory tile painter
   🧱 ar-4 WALLS · GATES · ⭐ SHRINE · 💎 GEM ORE (AvataRealm R2):
     a wall = ONE 1 × 1 piece per cell whose STATE = the neighbours it joins ('0' … '15', bits E 1 · S 2 · W 4 · N 8 — the model rebuilds per state)
     Props.AR.wall(map, side, i, j, {team, tall}) places one + re-joins the 4 cells round it · AR.wallLine(map, side, cells, {team, tall, towers: n}) ·
     AR.gate(map, side, i, j, {team, tall, state: 'closed' | 'open'}) (turn picked from the walls round it; open = walkable — WHO may pass is the game's rule) ·
     AR.wallOff(map, it) removes + re-joins · AR.rejoin / wallMask / wallKindOf / WALLS[side] = {wall, gate, tallwall, tallgate} · any side's walls join each other
     keys <side>_wall · <side>_gate · 🏯 <side>_tallwall (rampart + towers at corners · T · ends, v 1 = tower on a straight piece) · <side>_tallgate (gatehouse)
     same {team, build: 0 | 33 | 66 | 100} options + cond 'ruined' (broken, still blocks until wallOff)
     ⭐ realm_shrine (2 × 2, walk-on): {team} = owner (none = neutral) · {by, cap: 0–100} = who is capturing (ring fills, their flag climbs) → AR.set(it, {by, cap}, map)
     💎 gemore (1 × 1, blocks, states full · half · empty, v 0 crystal rock · 1 geode · 2 meteor chunk) — recoloured by the look's res.gem
     🧗 <side>_tallwall: it.stand = the rampart top (archers who "man the wall" stand here, z 30 px)
   🐾 ar-7 WILD REALM (AvataRealm R2b) — await Props.need(['wild']) (brings realm) · the skin follows the MAP look (jungle / raptor / lava / grow → vine cave ·
     coral → coral grotto · moon / bolt → crater burrow · any other look → old stone ruin; no look = the default jungle look) or {pal: {skin}} · nothing here draws a creature (CreatureKit does):
     🕳️ wild_den (2 × 2, door = the cave mouth) states sleep · awake · empty · claimed ({team} → a team totem)
     👑 wild_lair (3 × 3 landmark, WALK-ON arena, entrance [1.5, 3]) states sleep · awake · beaten — camera-side pillars stay low on every turn
     🏺 wild_relic (1 × 1 stand by the House) states empty · gold · silver · bronze · v 0 Dragon Heart · 1 Titan Tusk · 2 Phoenix Feather
     ✨ wild_drop (1 × 1 walk-on dropped relic) states gold · silver · bronze · v = relic · ⚠️ wild_warn (1 × 1 walk-on flat mark) states path · stomp, turn = direction
     🥚 wild_egg (1 × 1) states whole · crack · hatched ({team} = owner ring)
     overlays the GAME paints (to = (x, y, zPx) → [sx, sy], e.g. from V.toScreen): Props.AR.WILD.fightRing(g, to, cx, cy, r, zoom, {mode: awake | truce | heal | aurora, t})
       · beam(g, to, x, y, zoom, team, {t, fade, h, w}) · shield(g, to, cx, cy, r, zoom, {kind: aurora | team, team, t, fade}) · relic(g, x, y, k, kind, medal, lit) · SKIN · skinOf · RELICS · MEDAL

     🍳🍽️ ip-4b SIDES ① (AvataRealm matchup ①) — await Props.need(['kitchen', 'horde']) (each brings realm) · keys kitchen_<slot> · horde_<slot> (same 11 slots + footprints as raptor / bolt):
     🍳 Kitchen Crew on 🌸 cherry (food cart → diner → Grand Restaurant · Prep Kitchen · Scooter Garage · Crêpe-pan Launchpad · Soup Kitchen · Oven Works · Pepper-mill Tower · Apron Closet · Recipe Library · Pantry Cellar · Herb-garden Coop)
     🍽️ Hungry Horde on 🌾 farm (picnic tent → snack shack → Food Court · Queue Hall · Trolley Park · Balloon Stand · Tip-jar Booth · Buffet Depot · Giant Menu Board · Bib & Napkin Shop · Fortune-cookie Booth · Snack Stash · Pet Café)
     🪙🧱💎 OWN resource shapes <side>_coin · _brick · _gem (1 × 1, blocks, states full · half · empty): 🥚 egg basket · 🧂 spice sacks · 🍄 golden truffles / 🎟️ coupon booth · 🍪 cookie jar · 🍩 donut stack
       → Props.AR.resKey(side, 'coin' | 'brick' | 'gem') = the side's own key, else the shared coinrock · bricktree · gemore (Props.AR.RES_KEYS)
     own walls (low · gate · 🏯 tall · gatehouse) through Props.AR.wall / wallLine / gate · floors Props.AR.FLOORS.kitchen / horde → Iso.addTile(side + '_floor', …)
     shared painters for side files (Props._K.AR): tent (striped tent / canopy, any turn) · awning · tiles · checker · quadStripes · faceOf

     👹🦄 ip-4c SIDES ③ (AvataRealm matchup ③) — await Props.need(['monster', 'myth']) (each brings realm) · keys monster_<slot> · myth_<slot> (same 11 slots + footprints):
     👹 Monster Mash on 🌋 lava (Plank Shack → Crooked House → Haunted Manor · Lurk Lair · Howl Kennel · Bat Belfry · Slime Spa · Ogre Quarry · Eyeball Tower · Coffin Closet · Cauldron Crypt · Shadow Closet · Critter Cage)
     🦄 Myth Realm on 🏰 castle (Silk Tent → Marble Hall → Crystal Palace · Faun Grove · Unicorn Stable · Griffin Aerie · Phoenix Fountain · Golem Forge · Elf Watch Spire · Silk Loom · Star Observatory · Mist Grotto · Fairy-ring Glade)
     🪙🧱💎 OWN resources (Props.AR.resKey): 🟢 goo puddle · 🦴 bone bricks · 👻 ghost gems / ✨ pot of fairy gold · 🏛️ marble blocks · 🐉 dragon pearl · own walls + gates + 🏯 tall · floors Props.AR.FLOORS.monster / myth
     🐠☁️ ip-4d SIDES ⑤ (AvataRealm matchup ⑤ "Rain Check") — await Props.need(['reef', 'cloud']) (each brings realm) · keys reef_<slot> · cloud_<slot> (same 11 slots + footprints):
     🐠 Reef Riders on 🌊 coral (Clam Hut → Shell House → Coral Castle · Crab Barracks · Seahorse Corral · Flying-fish Spout · Anemone Spa · Whale Dock · Coral Lighthouse · Pearl Tailor · Bubble Temple · Kelp Cave · Turtle Pond)
     ☁️ Cloud Kingdom on ❄️ snow (Cloud Puff → Cloud Cottage → Rainbow Castle · Puff Barracks · Rainbow Stable · Windmill Perch · Sunbeam Spa · Thunderhead Forge · Lightning-rod Tower · Fog Tailor · Aurora Spire · Fog Bank · Weather-pet Roost)
     🪙🧱💎 OWN resources (Props.AR.resKey): 🫧 pearl oyster · 🪸 coral chunks · 💎 sea glass / 💧 rain barrel · ☁️ cloud bales · 🌈 rainbow shards · own walls + gates + 🏯 tall · floors Props.AR.FLOORS.reef / cloud
     🔮⚙️ ip-4e SIDES ⑥ (AvataRealm matchup ⑥ "Magic or Machine?") — await Props.need(['wizard', 'gear']) (each brings realm) · keys wizard_<slot> · gear_<slot> (same 11 slots + footprints):
     🔮 Spellwood on 🌴 jungle (Tree Stump → Mushroom House → Great Wizard Tree · Wand Grove · Carpet Loft · Owlery · Potion Hut · Cauldron Yard · Crystal Spire · Robe Room · Grand Library · Mushroom Ring · Familiar Burrow)
     ⚙️ Gearhaven on 🚀 moon (Tool Shed → Gear Workshop → Clock-tower Hall · Pogo Gym · Steam-bike Garage · Gyro Hangar · Wrench Clinic · Catapult Works · Periscope Tower · Goggle Shop · Tesla Workshop · Gear Tunnel · Clockwork Zoo)
     🪙🧱💎 OWN resources (Props.AR.resKey): 🌰 acorn basket · 🪵 mossy bricks · 🌙 moonstones / ⚙️ cog heap · 🟫 copper pipes · 🔋 crystal batteries · own walls + gates + 🏯 tall · floors Props.AR.FLOORS.wizard / gear
     🧸🐰 ip-4f SIDES ④ (AvataRealm matchup ④ "Under the Bed") — await Props.need(['toybox', 'dust']) (each brings realm) · keys toybox_<slot> · dust_<slot> (same 11 slots + footprints):
     🧸 Toybox Troop on the 🏘️ village (Shoebox → Block House → Block Castle · Toy-soldier Box · Rocking-horse Carousel · Paper-plane Runway · Plush Hospital · Train-set Depot · Jack-in-the-box Tower · Doll Wardrobe · Music Box · Puzzle Box · Teddy Kennel)
     🐰 Dust Bunny Gang on 🏜️ desert, dusty (Sock Pile → Slipper Hut → Laundry-basket Palace · Fluff Pile · Robo-vac Dock · Fan Perch · Cobweb Hammock · Sock Factory · Broom Tower · Lost & Found Box · Sneeze Shrine · Couch Crack · Mouse Hole)
     🪙🧱💎 OWN resources (Props.AR.resKey): 🪙 token bucket · 🧱 block stack · 🔮 marble bag / 🧶 lint heap · 🔘 button tin · 🧦 jewel sock · own walls + gates + 🏯 tall · floors Props.AR.FLOORS.toybox / dust
     🏺 ORIGIN RELICS (Aowu 2026-11-20 "each side one Relic that emphasizes its origins"): toybox_relic The First Teddy · dust_relic The Big Bunny Head — 2 × 2 landmark (kind landmark), states home · taken,
        🍂 / 🏚️, live · Props.AR.ORIGIN[side] = {key, name, icon(g, x, y, k, lit)} = the carried / dropped / HUD form (the 🏰⚔️ AvataRealm chat owns the rules)
     🏺 ip-4g ORIGIN RELICS ×12 (all sides now) — key <side>_relic in each side file (slot origin · kind landmark · 2 × 2, blocks · states home · taken · 🍂 / 🏚️ · live 2.4 s × 6):
        🦖 The Rex Skull (yawns) · 🤖 The First Robot Head (6 screen faces) · 🍳 The First Pan (the egg flips) · 🍽️ The Bottomless Plate (the cloche lifts) · 👹 The Grand Horned Head (the eye rolls)
        · 🦄 The Rainbow Horn (the rainbow climbs) · 🧸 The First Teddy · 🐰 The Big Bunny Head · 🐠 The Great Pearl (the clam breathes) · ☁️ The Sun-Cloud (the sun peeks) · 🔮 The Forest Crystal Ball
        (fireflies) · ⚙️ The First Cog (the clock ticks) — Props.AR.ORIGIN[side] = {key, name, icon(g, x, y, k, lit)} · Props.AR.ORIGIN_ORDER = that fixed 12-side order (HUD) ·
        Props.AR.origins() = the loaded relics in that order · 🏚️ ruined town = the plinth only, relic gone

   🔍 ip-5 DIFFS (for 🔍 Pokadif's photo hunt — any game): which changes of ANY prop are fair for spot-the-difference (≥ 45 changed px at the zoom you paint at)
     Props.diffs(key, {turn, look, cond, v, state, text, pal, k: zoom, kinds}) → [{by: 'state' | 'v' | 'text' | 'gone' | 'turn' | 'cond', a, b, level: 'bold' | 'quiet' | 'auto', name,
       px, box, c, r, ok, A, B, moves}] — take only ok ones; A / B = the options to paint each side (B null = gone); box / c / r = the poke circle in the A picture's frame (anchor-based)
     a prop's own def.diffs list says what it MAY change (graded by hand); without it: every state + variant (+ one sign letter) is measured · every prop also offers gone · turn · cond
     Props.diffPair(key, optsA, optsB | null) → {px, box, c, r} · Props.DIFF_MIN = 45 · bake fair pictures at DPR 1 · count changed pixels outside ALL poke circles (neighbours share pixels)
   🕵️ ip-5 DETECTIVE TOWN — await Props.need(['detective']) · look 'detective' (a world look: Props.town(map, {look: 'detective'}) works) · keys det_*:
     det_agency (smithy) · det_museum (inn) · det_kiosk (stall) · det_clueboard (qboard) · det_clockpost (well) · det_gaslamp (lantern) · det_tape (fence) · det_crates · det_signpost ·
     det_townhouse (stilt + homes) · det_cottage · det_mansion 3 × 3 · det_lighthouse · det_clocktower · det_prints (walk-on) · det_bike · det_catwall · det_basket · det_plane · det_hedge · det_planter

   📏 THE 13 RULES (every prop, every chat — a game that adds its own prop follows them too)
     1 🧱 corners follow the grid: anything with corners is built from iso parts in the prop's own footprint frame (x 0…w, y 0…d tiles, z px)
     2 ☀️ same light as the tiles: top +25 % · LEFT face (+y) +12 % · RIGHT face (+x) −16 %
     3 🎨 one palette (Props.MAT + the map look's colours, one accent per region)      4 ✏️ ONE rim #2A1C14 1.5 px made at bake — painters draw no rim
     5 🌳 organic = billboards on a 2 : 1 shadow (long round things lie along the grid)
     6 📐 heights at zoom 1: deco ≤ 24 · post / sign / small thing ≤ 50 · bush 20–36 · tree 50–90 · house 70–110 · big building ≤ 140 · landmark ≤ 200
     7 🏷️ no emoji in prop art (signs are drawn, words in Fredoka)     8 ⚡ baked once per zoom step (+ a tiny optional live layer)     9 🎈 Sky Pop mood
    10 🧩 variants by seed     11 🚪 front = +y (door side); turn 0–3 REBUILDS the model (never a mirrored picture)
    12 🧍 walkers on prop maps = Iso.avatar(who, {size: 0.6}) (≈ 48 px) → doors ≈ 42 px     13 🫥 a tall prop over a walker's pixels fades to 45 %
    14 🍂 every prop handles every CONDITION (🌿 fresh · 🍂 dry · 🏚️ ruined · games add more): its own version (def.conds[key] / build() reading look.cond)
       or the shared fallback (colour grade · cracks · holes · boarded windows · sagging roofs · rubble · bare trees · twig bushes · wilted plants · still live layer)

   CATALOGUE  Props.SETS {jungle, village, temple, bits, landmark, cherry, desert, snow, farm, grow, inns} · Props.list({set, kind, tag}) → [{key, name, set, kind, foot, h, variants, block, door, tags, live}]
   LOOKS      Props.LOOKS {jungle, cherry, desert, snow (+ farm · lava · coral · moon · castle from their look files)} · Props.addLook(key, {name, walls[], roofs[], trim, accent, stilts, curve, flat, snow}, base)
              a map picks ONE look; every building re-skins itself from it (a NEW shape → register your own prop with Props.add)
              ip-3: looks {jungle, cherry, desert, snow, farm}; a look may also carry swap {palm: 'datepalm', …} (its own trees) + roles {home: [...], …} (its own town)
   CONDITIONS Props.CONDS {fresh, dry, ruined} · Props.addCondition(key, {name, icon, sat, light, tint, tintA, leaves, crack, holes, boarded, sag, rubble, still}, base)
              WHAT HAPPENED here — stacks with the look (snow + ruined = frozen ruins): pass {cond: 'dry'} to pic / item / place / town
              the GROUND follows too: Iso.map({theme: Props.ground('meadow', 'ruined')}) (straw / ash grass, murky water — via IsoKit's public Iso.addTheme)
   PICTURES   Props.pic(key, {v, turn, look, pal, t}) → an Iso picture (Iso.drawPic / Iso.frame copy it; baked per zoom step)
              Props.canvas(key, {v, turn, look, k: zoom, s: device scale, rim}) → a plain canvas (cards, sheets, thumbnails)
   ON A MAP   it = Props.item(key, i, j, {v, turn, look, z}) → an IsoKit item {x: i, y: j (= the footprint's BACK corner), w, d, pic, alpha} — push it into
              your Iso.frame items; the footprint sort works for free
              it = Props.place(map, key, i, j, {v, turn, look}) → the same item + its footprint cells blocked (door cell + walk-on props stay walkable);
              null when it doesn't fit · Props.fits(map, key, i, j, {turn}) → true | false · Props.remove(map, it) → frees the cells
              it.door = {i, j, out: {i, j}} (inside the doorway / the cell in front of it) for walkers that go in
              Props.at(map, i, j) → the placed prop on a cell · Props.hit(view, items, px, py) → the prop whose PAINTED pixels are under a tap (roofs too)
   STATES     (ip-3b) a prop with def.states rebuilds per state like a turn: {state} in pic / item / place → it.state · Props.setState(it, state, map) flips a placed one
              in place (picture + map cells): 🚪 farmgate open · closed · new · 🌉 plankbridge down · lifted (def.deck: down = the water under it walkable) ·
              🌾 haybale whole · flat (def.walkStates: flat = walk-on) · 🎃 pumpkinpile 1 … 12 · Props.stateOf(key, s) → the state it would get
   WORDS      (ip-3b) a prop with def.text draws a short word at bake: {text: 'BANK →'} (≤ 10 letters, emoji dropped — rule 7) → it.text · 🪧 farmsign
   ANCHORS    (ip-3b) def.stand / def.aim = [x, y, zPx] → it.stand / it.aim = {x, y, z (levels, ground included)} — where a hero stands ON a tower prop and where
              its shots start (🏚️ barn2 deck · farmhouse porch roof · barn hayloft door) · it.mid = the footprint centre
              Props.ring(view, it, range, {g, color, fill, dash}) → {x, y, rx, ry, has(x, y)} the range circle round it.aim (draws when given g = groundFx's context)
   GROWING    (ip-3c) 🌱 set grow: growmush · growcorn · growsun · growpepper · growpump — ONE prop per plant line, the state IS the stage:
              '1' seed · '2' sprout · '3' young · '4a' / '5a' branch ① grown / giant · '4b' / '5b' branch ② (each a new SHAPE — 🐣 morph rule, branch = SkillKit colour)
              {stage: 1–5, branch: 'a' | 'b'} in pic / item / place / canvas → it.stage · it.branch · it.grow {line, cost, names, col, colHex, h}
              Props.grow(it, stage, branch, map) grows a placed one in place (it.aim moves to the new top, it.morph = {from, to, t0}) ·
              Props.stages(key) → [{state, stage, branch, name, col, colHex, h, aim}] · Props.morphFx(g, view, it, p, {flash}) = the ✨ morph moment
              (white silhouette swells → sparkles + confetti in the branch colour; p 0 → 1 over 1.2 s, 🌱 Basic 0.6 s + flash: false) · live layer only when grown
   COUNTRIES  (ip-3c) every look has its OWN inn + smithy (same footprints → same town plan): 🌴 jungle = Thai teak sala + bamboo forge · 🌸 cherry = ryokan +
              katana forge · 🏜️ desert = caravanserai + dome kiln · ❄️ snow = chalet lodge + turf-roof forge · 🌾 farm = country inn + horseshoe forge (look.swap)
   SLOW CELLS (ip-3b) def.cost → place sets the IsoKit cell cost (🕳️ mudpit · 🐷 pigpen = 3, walkers wade slowly); remove puts the old cost back
   EVERY FRAME Props.seeThrough(view, items, walkers) → 🫥 rule 13 (call when a walker moves) · Props.tick(items, t) → the live layer (palm sway,
              flags, smoke, boat bob, elephant steps); it stands still when Iso.budget.fx is low
   WARM       Props.warm(items, view, {onProgress}) → Promise (bakes every prop picture for this zoom step with a loading bar)
   YOUR OWN   Props.add(set, key, {name, kind, foot: [w, d], h, variants, block: true | false | 'posts', door: [dx, dy], organic, tags, live,
              build(B, v, look)}) — B.box · B.roof · B.drum · B.cone · B.flat · B.door · B.win · B.decal · B.bill · B.custom (a MODEL, not a painter:
              that is what makes turn + look work) · Props.check(key) → {ok, problems[]} (size rule, clipping, rim, bake time) */
(function(){
'use strict';
/* ---------- 🖌️ small drawing helpers (from the Avateer R0a painters; no emoji, no page state) ---------- */
const TAU = Math.PI * 2, FONT = "'Fredoka', 'Baloo 2', 'Nunito', sans-serif";
function rgb(h){ const n = parseInt(String(h).replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function sh(h, f){ if(String(h).indexOf('rgb') === 0){ const m = String(h).match(/\d+/g); h = '#' + ((1 << 24) + (+m[0] << 16) + (+m[1] << 8) + +m[2]).toString(16).slice(1); }
  const c = rgb(h), m = v => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)))); return 'rgb(' + m(c[0]) + ',' + m(c[1]) + ',' + m(c[2]) + ')'; }
function rgba(h, a){ const c = rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
// ONE-PIECE parts: fills only here (the bake draws the ONE silhouette rim)
function piece(g, parts, rim, rw){ g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if(rw > 0){ g.strokeStyle = rim; g.lineWidth = rw * 2; parts.forEach(p => { if(p.noRim) return; g.beginPath(); p.path(g); g.stroke(); }); }
  parts.forEach(p => { g.beginPath(); p.path(g); if(p.fill){ g.fillStyle = typeof p.fill === 'function' ? p.fill(g) : p.fill; g.fill(); } if(p.after) p.after(g); }); g.restore(); }
function lin(g, x0, y0, x1, y1, stops){ const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => gr.addColorStop(Array.isArray(c) ? c[0] : i / Math.max(1, stops.length - 1), Array.isArray(c) ? c[1] : c)); return gr; }
function rad(g, x, y, r0, r1, stops){ const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach((c, i) => gr.addColorStop(Array.isArray(c) ? c[0] : i / Math.max(1, stops.length - 1), Array.isArray(c) ? c[1] : c)); return gr; }
function glow(g, x, y, r, col, a){ g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rad(g, x, y, 0, r, [[0, rgba(col, a == null ? 0.55 : a)], [1, rgba(col, 0)]]); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore(); }
function star(g, x, y, r1, r2, n, rot){ n = n || 5; rot = rot == null ? -Math.PI / 2 : rot; for(let i = 0; i < n * 2; i++){ const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n; i ? g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); }
function rr(g, x, y, w, h, r){ r = Math.min(r, w / 2, h / 2); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function ell(g, x, y, rx, ry, rot){ g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU); }
function rnd(seed){ let s = seed >>> 0 || 1; return () => { s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909); s ^= s >>> 16; return (s >>> 0) / 4294967296; }; }
let TEXT_USED = false;   // set while a prop paints words → that picture is re-baked once the web font has landed
function txt(g, s, x, y, o){ o = o || {}; TEXT_USED = true; g.save(); const fam = o.font ? o.font + ', ' + FONT : FONT; g.font = (o.w || 700) + ' ' + (o.size || 16) + 'px ' + fam; g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
  if(o.stroke){ g.lineJoin = 'round'; g.strokeStyle = o.stroke; g.lineWidth = o.sw || 4; g.strokeText(s, x, y); }
  g.fillStyle = o.col || '#2B2D42'; g.fillText(s, x, y); g.restore(); }
function card(g, x, y, w, h, o){ o = o || {}; g.save(); if(o.shadow !== false){ g.shadowColor = 'rgba(0,0,0,0.18)'; g.shadowBlur = o.blur || 14; g.shadowOffsetY = 4; }
  g.fillStyle = o.fill || '#fff'; g.beginPath(); rr(g, x, y, w, h, o.r == null ? 16 : o.r); g.fill(); g.shadowColor = 'transparent';
  if(o.line){ g.strokeStyle = o.line; g.lineWidth = o.lw || 2; g.stroke(); } g.restore(); }
const PD = {TAU, rgb, sh, rgba, piece, lin, rad, glow, star, rr, ell, rnd, txt, card};
/* ---------- 🧱 core: model builder · turner · renderer (one light recipe) · footprint shadow · looks · registry · bake ---------- */
const D = PD, RIM = '#2A1C14', HTW = 32, HTH = 16;
const LIGHT = {top: 0.25, L: 0.12, R: -0.16};
const EDGE = 'rgba(42,28,20,0.26)';
const MAT = {wood: '#C99257', plank: '#E2B07A', thatch: '#E3BE6A', clay: '#E2553A', stone: '#BDB6A2', iron: '#8E8A82', cloth: '#F4EFE4', dark: '#5A3418',
  leaf: '#4CB13A', water: '#5EC3EA', gold: '#F2B731', red: '#D83A34', teal: '#2EC4B6', white: '#FFFFFF', glass: '#FFE58A'};
function lit(c){ if(c && typeof c === 'object') return c; const m = MAT[c] || c; return {top: sh(m, LIGHT.top), L: sh(m, LIGHT.L), R: sh(m, LIGHT.R), base: m}; }

/* ---------- 🔄 turns: model frame → world frame (footprint stays at 0..W × 0..Dd) ---------- */
const NRM = {front: [0, 1], right: [1, 0], back: [0, -1], left: [-1, 0]};
function turner(w, d, turn){ turn = ((turn | 0) % 4 + 4) % 4;
  const f = [(x, y) => [x, y], (x, y) => [y, w - x], (x, y) => [w - x, d - y], (x, y) => [d - y, x]][turn];
  const n = [(a, b) => [a, b], (a, b) => [b, -a], (a, b) => [-a, -b], (a, b) => [-b, a]][turn];
  return {turn, W: turn % 2 ? d : w, D: turn % 2 ? w : d, pt: f, nrm: n}; }
function sideOf(n){ return n[1] > 0.5 ? 'L' : n[0] > 0.5 ? 'R' : null; }   // only the +y (L) and +x (R) faces can be seen

/* ---------- 🧱 the model builder (what a prop's build() receives) ---------- */
function builder(){ const parts = []; const B = {parts,
  box(x, y, z, w, d, h, c, o){ const p = Object.assign({t: 'box', x, y, z, w, d, h, c, decals: []}, o || {}); parts.push(p); return p; },
  // decal on a box side: s = front|right|back|left · a = where along that side it starts (tiles, model frame) · aw = width (tiles) · z0, h = px
  decal(b, s, a, aw, z0, h, fill, o){ b.decals.push(Object.assign({s, a, aw, z0, h, fill}, o || {})); return B; },
  door(b, s, a, aw, h, o){ return B.decal(b, s, a, aw, 0, h || 26, MAT.dark, Object.assign({k: 'door'}, o)); },
  win(b, s, a, aw, z0, h, o){ return B.decal(b, s, a, aw, z0, h || 11, MAT.glass, Object.assign({k: 'win'}, o)); },
  roof(x, y, z, w, d, rh, c, o){ const p = Object.assign({t: 'roof', x, y, z, w, d, rh, c, ridge: 'x', ov: 0.16, kind: 'gable'}, o || {}); parts.push(p); return p; },
  drum(cx, cy, z, r, h, c, o){ const p = Object.assign({t: 'drum', x: cx, y: cy, z, r, h, c}, o || {}); parts.push(p); return p; },
  cone(cx, cy, z, r, h, c, o){ const p = Object.assign({t: 'cone', x: cx, y: cy, z, r, h, c}, o || {}); parts.push(p); return p; },
  flat(x, y, w, d, c, o){ const p = Object.assign({t: 'flat', x, y, w, d, c, z: 0, layer: -9}, o || {}); parts.push(p); return p; },
  // billboard at a model point: paint(g, sx, sy, k, t, v) in screen space (organic things, creatures, flags, glows)
  bill(x, y, z, paint, o){ const p = Object.assign({t: 'bill', x, y, z: z || 0, paint}, o || {}); parts.push(p); return p; },
  // custom painter in world space: draw(g, P, k, t) where P(x, y, z) → screen point of a MODEL point (turn applied)
  custom(x, y, draw, o){ const p = Object.assign({t: 'custom', x, y, z: 0, draw}, o || {}); parts.push(p); return p; },
}; return B; }

/* ---------- 🖌️ painting ---------- */
function poly(g, pts){ g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); }
function face(g, pts, fill, k, edge){ poly(g, pts); g.fillStyle = fill; g.fill(); if(edge !== false){ g.lineJoin = 'round'; g.strokeStyle = EDGE; g.lineWidth = Math.max(0.8, 1 * k); g.stroke(); } }
function render(g, model, o){ // o: {ox, oy, k, turn, t, v, w, d, cond}
  const C14 = o.cond && o.cond.key !== 'fresh' ? o.cond : null;   // 🍂 rule 14: the shared fallback for corners (cracks · holes · boards · sag)
  const k = o.k, T = turner(o.w, o.d, o.turn), V = (x, y, z) => [o.ox + (x - y) * HTW * k, o.oy + (x + y) * HTH * k - (z || 0) * k];
  const P = (x, y, z) => { const q = T.pt(x, y); return V(q[0], q[1], z); };
  const rect = p => { const a = T.pt(p.x, p.y), b = T.pt(p.x + p.w, p.y + p.d); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const key = p => { let cx, cy; if(p.t === 'box' || p.t === 'roof' || p.t === 'flat'){ const r = rect(p); cx = (r[0] + r[2]) / 2; cy = (r[1] + r[3]) / 2; } else { const q = T.pt(p.x, p.y); cx = q[0]; cy = q[1]; } return Math.round(((p.layer || 0) * 100 + cx + cy + (p.dz || 0)) * 1000) / 1000; };
  const list = model.parts.map((p, i) => ({p, i, k: key(p)})).sort((a, b) => a.k - b.k || (a.p.z || 0) - (b.p.z || 0) || a.i - b.i);   // same spot → lower part first
  const QL = (pts, u, w) => [pts[0][0] + (pts[1][0] - pts[0][0]) * u + (pts[3][0] - pts[0][0]) * w + (pts[0][0] - pts[1][0] + pts[2][0] - pts[3][0]) * u * w,
    pts[0][1] + (pts[1][1] - pts[0][1]) * u + (pts[3][1] - pts[0][1]) * w + (pts[0][1] - pts[1][1] + pts[2][1] - pts[3][1]) * u * w];   // bilinear point on a face (u along, w across)
  function crack(F, R, len){ let u = 0.18 + R() * 0.64, w = 0.02; g.save(); g.strokeStyle = 'rgba(42,28,20,0.62)'; g.lineWidth = 1.15 * k; g.lineJoin = 'round'; g.beginPath(); let q = F(u, w); g.moveTo(q[0], q[1]);
    const n = 3 + (R() * 2 | 0); for(let i = 0; i < n; i++){ u = Math.max(0.05, Math.min(0.95, u + (R() - 0.5) * 0.16)); w += len / n * (0.7 + R() * 0.6); q = F(u, Math.min(0.96, w)); g.lineTo(q[0], q[1]); } g.stroke(); g.restore(); }
  function hole(F, R, rafters, big){ const sz = big || 1, cu = 0.26 + R() * 0.48, cw = 0.3 + R() * 0.32, n = 8; g.save(); g.beginPath();
    for(let i = 0; i < n; i++){ const a = i / n * TAU, r = 0.5 + R() * 0.6, q = F(cu + Math.cos(a) * 0.15 * r * sz, cw + Math.sin(a) * 0.24 * r * sz); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }
    g.closePath(); g.fillStyle = 'rgba(30,20,14,0.86)'; g.fill(); g.clip();
    if(rafters){ g.strokeStyle = '#A27A4E'; g.lineWidth = 2.2 * k; [-0.06, 0.06].forEach(du => { const a = F(cu + du, cw - 0.3), b = F(cu + du, cw + 0.3); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }); }
    g.restore(); }
  // rain stains running down from the top · dirt + dust creeping up from the ground
  function stains(F, R, n){ for(let i = 0; i < n; i++){ const u = 0.1 + R() * 0.8, w = 0.05 + R() * 0.04, L = 0.35 + R() * 0.45, a = F(u, 0), b = F(u, L), gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
      gr.addColorStop(0, 'rgba(40,30,22,0.34)'); gr.addColorStop(1, 'rgba(40,30,22,0)'); g.fillStyle = gr; g.beginPath(); [F(u - w / 2, 0), F(u + w / 2, 0), F(u + w * 0.3, L), F(u - w * 0.3, L)].forEach((q, j) => j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fill(); } }
  function dirt(F, a){ const t = F(0.5, 0.45), b = F(0.5, 1), gr = g.createLinearGradient(t[0], t[1], b[0], b[1]); gr.addColorStop(0, 'rgba(120,88,50,0)'); gr.addColorStop(1, 'rgba(120,88,50,' + a + ')');
    g.fillStyle = gr; g.beginPath(); [F(0, 0.45), F(1, 0.45), F(1, 1), F(0, 1)].forEach((q, j) => j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fill(); }
  let idx = 0;
  list.forEach(({p}) => { const R14 = C14 ? rnd(((o.v | 0) + 1) * 7919 + (idx++) * 104729 + 17) : null;
    if(p.t === 'flat'){ const r = rect(p), C = lit(p.c); face(g, [V(r[0], r[1], 0.5), V(r[2], r[1], 0.5), V(r[2], r[3], 0.5), V(r[0], r[3], 0.5)], p.fill || C.top, k); return; }
    if(p.t === 'box'){ const r = rect(p), C = lit(p.c), z0 = p.z, z1 = p.z + p.h;
      const FL = [V(r[0], r[3], z1), V(r[2], r[3], z1), V(r[2], r[3], z0), V(r[0], r[3], z0)], FR = [V(r[2], r[3], z1), V(r[2], r[1], z1), V(r[2], r[1], z0), V(r[2], r[3], z0)];
      face(g, [V(r[0], r[3], z0), V(r[2], r[3], z0), V(r[2], r[3], z1), V(r[0], r[3], z1)], C.L, k);
      face(g, [V(r[2], r[1], z0), V(r[2], r[3], z0), V(r[2], r[3], z1), V(r[2], r[1], z1)], C.R, k);
      if(p.top !== false) face(g, [V(r[0], r[1], z1), V(r[2], r[1], z1), V(r[2], r[3], z1), V(r[0], r[3], z1)], p.topFill || C.top, k);
      if(p.trim){ g.strokeStyle = 'rgba(42,28,20,0.22)'; g.lineWidth = 1 * k; for(let zz = z0 + p.trim; zz < z1 - 2; zz += p.trim){ g.beginPath(); const a = V(r[0], r[3], zz), b = V(r[2], r[3], zz), c = V(r[2], r[1], zz); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.stroke(); } }
      p.decals.forEach(dc => { const n = T.nrm(NRM[dc.s][0], NRM[dc.s][1]), side = sideOf(n); if(!side) return;
        // the decal's two ends on its side (model frame) → world
        const along = dc.s === 'front' || dc.s === 'back' ? (u => [u, dc.s === 'front' ? p.y + p.d : p.y]) : (u => [dc.s === 'right' ? p.x + p.w : p.x, u]);
        const e0 = along(dc.a), e1 = along(dc.a + dc.aw), A = T.pt(e0[0], e0[1]), Bq = T.pt(e1[0], e1[1]);
        const fill = side === 'L' ? sh(dc.fill, 0.04) : sh(dc.fill, -0.12), zb = z0 + dc.z0, zt = zb + dc.h;
        if(C14 && C14.boarded && (dc.k === 'win' || dc.k === 'door') && !p.keep){ const Q = (u, v) => V(A[0] + (Bq[0] - A[0]) * u, A[1] + (Bq[1] - A[1]) * u, zb + dc.h * v);
          face(g, [Q(0, 0), Q(1, 0), Q(1, dc.k === 'door' ? 0.82 : 1), Q(0.5, 1), Q(0, dc.k === 'door' ? 0.82 : 1)], '#3A2A20', k);   // dark, empty
          g.save(); g.strokeStyle = '#A27A4E'; g.lineCap = 'butt'; g.lineWidth = (dc.k === 'door' ? 3 : 2.4) * k; [[0.02, 0.22, 0.98, 0.78], [0.02, 0.8, 0.98, 0.3]].slice(0, dc.k === 'door' ? 1 : 2).forEach(b => { const a = Q(b[0], b[1]), c2 = Q(b[2], b[3]); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c2[0], c2[1]); g.stroke(); }); g.restore(); return; }
        if(dc.k === 'door'){ const pts = [V(A[0], A[1], zb), V(Bq[0], Bq[1], zb), V(Bq[0], Bq[1], zt - dc.h * 0.18), V((A[0] + Bq[0]) / 2, (A[1] + Bq[1]) / 2, zt), V(A[0], A[1], zt - dc.h * 0.18)];
          face(g, pts, fill, k); g.fillStyle = MAT.gold; const kn = V(A[0] + (Bq[0] - A[0]) * 0.78, A[1] + (Bq[1] - A[1]) * 0.78, zb + dc.h * 0.45); g.beginPath(); g.arc(kn[0], kn[1], 1.4 * k, 0, TAU); g.fill(); return; }
        face(g, [V(A[0], A[1], zb), V(Bq[0], Bq[1], zb), V(Bq[0], Bq[1], zt), V(A[0], A[1], zt)], fill, k);
        if(dc.k === 'win'){ g.strokeStyle = 'rgba(42,28,20,0.35)'; g.lineWidth = 1 * k; const m0 = V((A[0] + Bq[0]) / 2, (A[1] + Bq[1]) / 2, zb), m1 = V((A[0] + Bq[0]) / 2, (A[1] + Bq[1]) / 2, zt); g.beginPath(); g.moveTo(m0[0], m0[1]); g.lineTo(m1[0], m1[1]); g.stroke();
          const sill = [V(A[0], A[1], zb), V(Bq[0], Bq[1], zb)]; g.strokeStyle = sh(MAT.wood, -0.3); g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(sill[0][0], sill[0][1]); g.lineTo(sill[1][0], sill[1][1]); g.stroke(); }
        if(dc.paint) dc.paint(g, (u, v) => V(A[0] + (Bq[0] - A[0]) * u, A[1] + (Bq[1] - A[1]) * u, zb + v), k, side); });
      if(C14 && !p.keep && p.h >= 12){ const big = p.h >= 22 && r[2] - r[0] >= 0.6, bigR = p.h >= 22 && r[3] - r[1] >= 0.6, fL = (u, w) => QL(FL, u, w), fR = (u, w) => QL(FR, u, w);
        if(z0 <= 8){ dirt(fL, 0.22 + 0.25 * C14.crack); dirt(fR, 0.22 + 0.25 * C14.crack); }
        if(C14.holes){ stains(fL, R14, big ? 3 : 1); stains(fR, R14, bigR ? 2 : 1); }
        if(C14.holes && big && R14() < 0.9) hole(fL, R14, true, 1.25); if(C14.holes && bigR && R14() < 0.6) hole(fR, R14, true, 1.1);
        if(R14() < C14.crack) crack((u, w) => QL(FL, u, w), R14, 0.55 + R14() * 0.3); if(R14() < C14.crack * 0.8) crack((u, w) => QL(FR, u, w), R14, 0.45 + R14() * 0.3); }
      return; }
    if(p.t === 'roof'){ const r = rect(p), C = lit(p.c), ov = p.ov, x0 = r[0] - ov, y0 = r[1] - ov, x1 = r[2] + ov, y1 = r[3] + ov, z = p.z, zr = p.z + p.rh * (C14 && !p.keep ? 1 - 0.12 * (C14.sag || 0) : 1);
      let ridge = p.ridge; if(T.turn % 2) ridge = ridge === 'x' ? 'y' : 'x';
      if(p.kind === 'hip'){ const ax = (x0 + x1) / 2, ay = (y0 + y1) / 2, a = V(ax, ay, zr);
        face(g, [V(x0, y1, z), V(x1, y1, z), a], C.L, k); face(g, [V(x1, y0, z), V(x1, y1, z), a], C.R, k);
        if(C14 && C14.holes && !p.keep && p.rh >= 14){ const b0 = V(x0, y1, z), b1 = V(x1, y1, z); hole((u, w) => { const e = [b0[0] + (b1[0] - b0[0]) * u, b0[1] + (b1[1] - b0[1]) * u]; return [e[0] + (a[0] - e[0]) * w * 0.8, e[1] + (a[1] - e[1]) * w * 0.8]; }, R14, true); } }
      else if(ridge === 'x'){ const ym = (y0 + y1) / 2, SL = [V(x0, ym, zr), V(x1, ym, zr), V(x1, y1, z), V(x0, y1, z)]; face(g, SL, C.L, k);
        if(C14 && C14.holes && !p.keep && p.rh >= 14){ hole((u, w) => QL(SL, u, w), R14, true, 1.35); if(x1 - x0 > 1.4) hole((u, w) => QL(SL, u, w), R14, true, 0.9); } face(g, [V(x1, y0, z), V(x1, y1, z), V(x1, ym, zr)], p.gable ? lit(p.gable).R : C.R, k);
        if(p.stripes){ g.strokeStyle = 'rgba(42,28,20,0.13)'; g.lineWidth = 1.1 * k; for(let i = 1; i < p.stripes; i++){ const u = x0 + (x1 - x0) * i / p.stripes, q1 = V(u, ym, zr), q2 = V(u, y1, z); g.beginPath(); g.moveTo(q1[0], q1[1]); g.lineTo(q2[0], q2[1]); g.stroke(); } } }
      else { const xm = (x0 + x1) / 2, SR = [V(xm, y1, zr), V(xm, y0, zr), V(x1, y0, z), V(x1, y1, z)]; face(g, [V(xm, y0, zr), V(xm, y1, zr), V(x1, y1, z), V(x1, y0, z)], C.R, k);
        if(C14 && C14.holes && !p.keep && p.rh >= 14){ hole((u, w) => QL(SR, u, w), R14, true, 1.35); if(y1 - y0 > 1.4) hole((u, w) => QL(SR, u, w), R14, true, 0.9); } face(g, [V(x0, y1, z), V(x1, y1, z), V(xm, y1, zr)], p.gable ? lit(p.gable).L : C.L, k);
        if(p.stripes){ g.strokeStyle = 'rgba(42,28,20,0.13)'; g.lineWidth = 1.1 * k; for(let i = 1; i < p.stripes; i++){ const u = y0 + (y1 - y0) * i / p.stripes, q1 = V(xm, u, zr), q2 = V(x1, u, z); g.beginPath(); g.moveTo(q1[0], q1[1]); g.lineTo(q2[0], q2[1]); g.stroke(); } } }
      if(p.finials){ g.fillStyle = MAT.gold; const ends = ridge === 'x' ? [V(x0, (y0 + y1) / 2, zr), V(x1, (y0 + y1) / 2, zr)] : [V((x0 + x1) / 2, y0, zr), V((x0 + x1) / 2, y1, zr)];
        ends.forEach((e, i) => { g.beginPath(); g.moveTo(e[0], e[1]); g.quadraticCurveTo(e[0] + (i ? 7 : -7) * k, e[1] - 8 * k, e[0] + (i ? 3 : -3) * k, e[1] - 13 * k); g.lineTo(e[0], e[1] - 4 * k); g.closePath(); g.fill(); }); }
      return; }
    if(p.t === 'drum' || p.t === 'cone'){ const q = T.pt(p.x, p.y), c = V(q[0], q[1], p.z), rx = p.r * HTW * k * Math.SQRT2, ry = rx / 2, C = lit(p.c);
      const gr = g.createLinearGradient(c[0] - rx, 0, c[0] + rx, 0); gr.addColorStop(0, C.L); gr.addColorStop(0.45, sh(C.base, 0.05)); gr.addColorStop(1, C.R);
      if(p.t === 'drum'){ const h = p.h * k; g.beginPath(); g.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI); g.lineTo(c[0] - rx, c[1] - h); g.ellipse(c[0], c[1] - h, rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = EDGE; g.lineWidth = k; g.stroke();
        if(p.rings){ g.strokeStyle = 'rgba(42,28,20,0.2)'; for(let i = 1; i < p.rings; i++){ g.beginPath(); g.ellipse(c[0], c[1] - h * i / p.rings, rx, ry, 0, 0, Math.PI); g.stroke(); } }
        if(p.top !== false){ g.beginPath(); g.ellipse(c[0], c[1] - h, rx, ry, 0, 0, TAU); g.fillStyle = p.topFill || C.top; g.fill(); g.strokeStyle = EDGE; g.stroke(); }
        if(C14 && !p.keep && p.h >= 14 && R14() < C14.crack) crack((u, w) => [c[0] - rx * 0.8 + rx * 1.6 * u, c[1] - h + (h + ry) * w], R14, 0.6); }
      else { const a = [c[0], c[1] - p.h * k]; g.beginPath(); g.moveTo(c[0] - rx, c[1]); g.ellipse(c[0], c[1], rx, ry, 0, Math.PI, 0, true); g.lineTo(a[0], a[1]); g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = EDGE; g.lineWidth = k; g.stroke();
        if(p.stripes){ g.strokeStyle = 'rgba(42,28,20,0.14)'; for(let i = 1; i < p.stripes; i++){ const u = -1 + 2 * i / p.stripes; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0] + u * rx, c[1] + Math.sqrt(1 - u * u) * ry); g.stroke(); } } }
      return; }
    if(p.t === 'bill'){ const q = T.pt(p.x, p.y), s = V(q[0], q[1], p.z); p.paint(g, s[0], s[1], k, o.t || 0, o.v || 0, T); return; }
    if(p.t === 'custom'){ p.draw(g, P, k, o.t || 0, T); return; }
  });
}
// ground shadow: footprint diamond (corners) or a 2 : 1 ellipse inside the footprint (organic)
function footShadow(g, ox, oy, k, W, Dd, organic, a){ const V = (x, y) => [ox + (x - y) * HTW * k, oy + (x + y) * HTH * k];
  g.fillStyle = 'rgba(30,40,20,' + (a || 0.2) + ')';
  if(organic){ const c = V(W / 2, Dd / 2), r = Math.min(W, Dd) * 0.5 * HTW * k * Math.SQRT2 * 0.92; g.beginPath(); g.ellipse(c[0], c[1], r, r / 2, 0, 0, TAU); g.fill(); return; }
  const e = 0.1; poly(g, [V(-e, -e + 0.15), V(W + e + 0.18, -e + 0.15), V(W + e + 0.18, Dd + e + 0.22), V(-e, Dd + e + 0.22)]); g.fill(); }

/* ---------- 🗺️ map looks: every map can re-skin the same models (Aowu 2026-11-17 14:17: new maps will need their own town / house tweaks) ----------
   A look = palette + small shape switches that EVERY prop reads (walls, roofs, trim, accent, snow caps, lanterns…). A map picks a look by key,
   a game can register its own with addLook(key, {...}, base); a map that needs a NEW shape registers its own prop with add() (same rules). */
// look fields: name · walls[] · roofs[] · trim · accent · stilts · curve · flat · snow (snow caps on every silhouette) ·
//   swap {key: otherKey} (ip-3: a jungle palm on a desert map draws as a date palm — organic props follow the look) · roles {…} (ip-3: the town's homes / shops / trees for this look)
const LOOKS = {};
function addLook(key, o, base){ LOOKS[key] = Object.assign({}, LOOKS[base || 'jungle'] || {}, o, {key}); return LOOKS[key]; }
addLook('jungle', {name: 'Jungle', walls: ['#E8B979', '#D9C7A0', '#F0CFA0', '#C9DDB0'], roofs: ['#E2553A', '#E3BE6A', '#2EC4B6'], trim: '#5A3418', accent: '#E2553A', stilts: true});
addLook('cherry', {name: 'Cherry', walls: ['#FFF3E8', '#F7E1D3', '#FBE9EE', '#EFE6D8'], roofs: ['#3E4A6B', '#B5172A', '#5A6E8C'], trim: '#3B2A2A', accent: '#FF8FB0', stilts: false, curve: true});
addLook('desert', {name: 'Desert', walls: ['#E9C891', '#F2D8A8', '#DDB37A', '#EBCB9C'], roofs: ['#D98E4A', '#C46F3A', '#E9C891'], trim: '#7A4A22', accent: '#2EC4B6', stilts: false, flat: true});
addLook('snow', {name: 'Snow', walls: ['#B98A5E', '#A5764C', '#C99A6C', '#9C6E46'], roofs: ['#5A6E8C', '#7A4A3A', '#3E5A4A'], trim: '#4A2E1C', accent: '#5EC3EA', stilts: false, snow: true});

/* ---------- 🍂 rule 14 — CONDITIONS (Aowu 2026-11-17 16:21 "dry branch, apocalypse, no life feeling … add little by little with a rule") ----------
   A condition = WHAT HAPPENED here (🌿 fresh · 🍂 dry · 🏚️ ruined …); it stacks with the map look (WHERE we are): snow + ruined = frozen ruins.
   Every prop handles every condition: its own version (def.conds[key] for organic painters, or build() reading look.cond) OR this shared fallback —
   colour grade (sat · light · tint) · cracks + holes on boxes / roofs / drums · boarded windows + doors · sagging roofs · rubble at the walls ·
   trees → bare branches (dry keeps a few brown leaves, ruined = snapped) · bushes → twigs · plants → wilted tufts · the live layer stands still.
   A game adds its own with Props.addCondition(key, {…}, base) — every old prop follows it through the fallback, nothing breaks. */
const CONDS = {};
function addCondition(key, o, base){ CONDS[key] = Object.assign({key, name: key, icon: '', sat: 1, light: 0, tint: null, tintA: 0, leaves: 1, crack: 0, holes: 0, boarded: 0, broken: 0, sag: 0, rubble: 0, still: false},
  base ? CONDS[base] : {}, o, {key}); return CONDS[key]; }
addCondition('fresh', {name: 'Fresh', icon: '🌿'});
addCondition('dry', {name: 'Dry', icon: '🍂', sat: 0.5, light: -0.05, tint: '#C9A26A', tintA: 0.2, leaves: 0.3, crack: 0.35, still: true});
addCondition('ruined', {name: 'Ruined', icon: '🏚️', sat: 0.28, light: -0.14, tint: '#8A7A6A', tintA: 0.22, leaves: 0, crack: 1, holes: 1, boarded: 1, broken: 1, sag: 1, rubble: 1, still: true});
function condOf(c){ c = typeof c === 'string' ? CONDS[c] : c; return c && c.key !== 'fresh' ? c : null; }
// 🎨 colour grade of a whole picture body (alpha kept)
function grade(body, c){ if(!c) return; const w = body.width, h = body.height, tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h; const tg = tmp.getContext('2d'); tg.drawImage(body, 0, 0);
  if(c.sat < 1){ tg.globalCompositeOperation = 'saturation'; tg.globalAlpha = 1 - c.sat; tg.fillStyle = '#808080'; tg.fillRect(0, 0, w, h); }
  if(c.tint && c.tintA){ tg.globalCompositeOperation = 'multiply'; tg.globalAlpha = c.tintA; tg.fillStyle = c.tint; tg.fillRect(0, 0, w, h); }
  if(c.light){ tg.globalCompositeOperation = c.light < 0 ? 'multiply' : 'screen'; tg.globalAlpha = Math.abs(c.light) * 2; tg.fillStyle = c.light < 0 ? '#6A6A6A' : '#FFFFFF'; tg.fillRect(0, 0, w, h); }
  tg.globalAlpha = 1; tg.globalCompositeOperation = 'destination-in'; tg.drawImage(body, 0, 0);
  const bg = body.getContext('2d'); bg.save(); bg.setTransform(1, 0, 0, 1, 0, 0); bg.globalCompositeOperation = 'copy'; bg.drawImage(tmp, 0, 0); bg.restore(); }
// ❄️ a look with snow caps the TOP of every silhouette (trees too — "looks reach the trees")
function snowcap(body, n){ n *= 1.35; const w = body.width, h = body.height, cap = document.createElement('canvas'); cap.width = w; cap.height = h; const cg = cap.getContext('2d');
  cg.drawImage(body, 0, 0); cg.globalCompositeOperation = 'source-in'; cg.fillStyle = '#F7FBFF'; cg.fillRect(0, 0, w, h); cg.globalCompositeOperation = 'destination-out'; cg.drawImage(body, 0, Math.max(2, Math.round(n)));
  const bg = body.getContext('2d'); bg.save(); bg.setTransform(1, 0, 0, 1, 0, 0); bg.drawImage(cap, 0, 0); bg.restore(); }
// 🧱 rubble at the foot of a ruined building's front walls
function rubble(g, ox, oy, k, W, Dd, seed){ const R = rnd(seed), V = (x, y, z) => [ox + (x - y) * HTW * k, oy + (x + y) * HTH * k - (z || 0) * k];
  const cols = ['#BDB6A2', '#9C9480', '#C99257', '#8A5A2B', '#A9A291'];
  for(let n = 0; n < 12; n++){ const front = R() < 0.6, u = 0.06 + R() * 0.88, x = front ? u * W : W - 0.04 - R() * 0.14, y = front ? Dd - 0.04 - R() * 0.14 : u * Dd, s = 0.06 + R() * 0.09, hz = 3 + R() * 5;
    const c = cols[(R() * cols.length) | 0], a = V(x - s, y, 0), b = V(x, y + s, 0), c2 = V(x + s, y, 0), top = V(x, y, hz);
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c2[0], c2[1]); g.lineTo(top[0] + s * 9 * k, top[1]); g.lineTo(top[0] - s * 7 * k, top[1] - 1 * k); g.closePath(); g.fillStyle = sh(c, R() < 0.5 ? 0.12 : -0.12); g.fill(); g.strokeStyle = EDGE; g.lineWidth = 0.8 * k; g.stroke(); }
  const u = 0.2 + R() * 0.4, p0 = V(u * W, Dd + 0.08, 0), p1 = V(u * W + 0.5, Dd + 0.02, 14);   // one fallen plank leaning on the wall
  g.strokeStyle = '#8A6A44'; g.lineWidth = 3.4 * k; g.lineCap = 'butt'; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke(); g.strokeStyle = 'rgba(42,28,20,0.4)'; g.lineWidth = 0.8 * k; g.stroke(); }

/* ---------- 🌳 organic props + their shared condition fallback (bare tree · twig bush · wilted tuft) ---------- */
function bareTree(g, x, y, k, h, v, c){ const R = rnd(31 + v * 97), H = h * 0.94, bark = c && c.broken ? '#6E5E50' : '#7E5A3A', ends = [];
  g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = bark; g.fillStyle = bark;
  const snap = c && c.broken, T0 = snap ? H * 0.5 : H * 0.42;
  g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(-4, -T0 * 0.5, -2.6, -T0); if(snap){ g.lineTo(-1, -T0 - 6); g.lineTo(0.6, -T0 + 1); g.lineTo(2, -T0 - 8); g.lineTo(3, -T0 - 1); } else g.lineTo(2.6, -T0);
  g.quadraticCurveTo(4, -T0 * 0.5, 6, 0); g.lineTo(10, 2); g.lineTo(4, -3); g.lineTo(-4, -3); g.lineTo(-10, 2); g.closePath(); g.fill();
  function br(x0, y0, ang, len, w, d){ const x1 = x0 + Math.sin(ang) * len, y1 = y0 - Math.cos(ang) * len; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0);
    g.quadraticCurveTo(x0 + Math.sin(ang) * len * 0.5 + (R() - 0.5) * 5, y0 - Math.cos(ang) * len * 0.5, x1, y1); g.stroke();
    if(d > 0){ const n = 2 + (R() < 0.35 ? 1 : 0); for(let i = 0; i < n; i++) br(x1, y1, ang + (i - (n - 1) / 2) * 0.75 + (R() - 0.5) * 0.35, len * (0.6 + R() * 0.14), Math.max(1.2, w * 0.6), d - 1); } else ends.push([x1, y1]); }
  if(snap){ br(-1.5, -T0 * 0.72, -0.9, H * 0.2, 3, 1); br(1.5, -T0 * 0.55, 1.1, H * 0.14, 2.4, 0); }
  else { const L = H * 0.27; br(-1.5, -T0 + 2, -0.45, L, 4.2, 2); br(1.5, -T0 + 2, 0.5, L * 0.95, 4, 2); br(0, -T0, 0.05, L * 1.05, 3.4, 2); }
  const lv = c ? c.leaves : 0; if(lv > 0){ const cols = ['#C98A3A', '#B5652A', '#D9A441', '#9C6A2E']; ends.forEach(([ex, ey], i) => { if(R() > lv * 1.6) return; g.fillStyle = cols[i % cols.length]; for(let n = 0; n < 3; n++){ g.beginPath(); ell(g, ex + (R() - 0.5) * 7, ey + (R() - 0.5) * 6, 3, 2, R() * 3); g.fill(); } }); }
  g.restore(); }
function bareBush(g, x, y, k, h, v, c){ const R = rnd(53 + v * 31), H = h * (c && c.broken ? 0.55 : 0.85); g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round'; g.strokeStyle = '#8A6A44';
  for(let i = 0; i < 11; i++){ const a = (i / 10 - 0.5) * 2.2 + (R() - 0.5) * 0.2, L = H * (0.6 + R() * 0.45), x1 = Math.sin(a) * L, y1 = -Math.cos(a) * L * 0.95; g.lineWidth = 1.8; g.beginPath(); g.moveTo((R() - 0.5) * 6, 0); g.quadraticCurveTo(x1 * 0.4, y1 * 0.6, x1, y1); g.stroke();
    if(R() < 0.6){ g.lineWidth = 1.1; g.beginPath(); g.moveTo(x1 * 0.7, y1 * 0.7); g.lineTo(x1 * 0.7 + Math.sin(a + 0.8) * 6, y1 * 0.7 - Math.cos(a + 0.8) * 6); g.stroke(); } }
  if(c && c.leaves > 0){ g.fillStyle = '#C98A3A'; for(let n = 0; n < 5; n++){ g.beginPath(); ell(g, (R() - 0.5) * H * 1.1, -R() * H * 0.8, 2.6, 1.8, R() * 3); g.fill(); } }
  g.restore(); }
function wiltTuft(g, x, y, k, h, v, c){ const R = rnd(71 + v * 13); g.save(); g.translate(x, y); g.scale(k, k); g.lineCap = 'round';
  for(let i = 0; i < 7; i++){ const bx = (R() - 0.5) * 30, by = (R() - 0.5) * 10, s = R() < 0.5 ? 1 : -1, L = 6 + R() * 4; g.strokeStyle = '#9A8048'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + s * 2, by - L, bx + s * 5, by - L * 0.55); g.stroke();
    g.fillStyle = c && c.broken ? '#6E5E50' : '#A86A3A'; g.beginPath(); ell(g, bx + s * 5, by - L * 0.5, 1.8, 1.4); g.fill(); }
  g.restore(); }
const FALLBACK = {tree: bareTree, bush: bareBush, tuft: wiltTuft};
function deadOf(def){ if(def.dead) return def.dead; if(def.kind === 'tree') return 'tree'; if(def.kind === 'bush') return 'bush'; if(def.tags.indexOf('plant') >= 0) return 'tuft'; return 'keep'; }
// an organic prop = a billboard at the footprint centre; paint(g, x, y, k, t, v, look) — the condition is handled here (own def.conds[key] first)
function organic(set, key, o, fn){ const def = add(set, key, Object.assign({organic: true, kind: 'tree'}, o));
  def.build = (B, v, L) => B.bill(def.foot[0] / 2, def.foot[1] / 2, 0, (g, x, y, k, t) => { const c = L.cond;
    if(c){ const own = def.conds && (def.conds[c.key] || def.conds['*']); if(own) return own(g, x, y, k, t, v, c, L);
      const dead = deadOf(def); if(dead !== 'keep' && c.leaves < 1) return FALLBACK[dead](g, x, y, k, def.h, v, c); }
    fn(g, x, y, k, t, v, L); });
  return def; }

/* ---------- 📚 catalogue ---------- */
const SETS = {}, DEFS = {};
function addSet(key, o){ SETS[key] = Object.assign({key, props: []}, o); return SETS[key]; }
function add(set, key, def){ def = Object.assign({key, set, kind: 'building', foot: [1, 1], h: 40, variants: 1, block: true, turns: 4, organic: false, tags: []}, def); DEFS[key] = def; (SETS[set] || addSet(set, {name: set})).props.push(key); return def; }
/* 🌳 IsoProps — starter catalogue draft (IP-0). Every prop follows the 13 rules: corners = iso parts on the grid, tile light,
   one silhouette rim (from the bake — painters here draw NO rim of their own), organic = billboards on a 2 : 1 shadow, drawn signs (no emoji),
   variants by seed, a front (+y) that turn 0–3 repaints. Walkers on prop maps = Iso.avatar size 0.6 (≈ 48 px at zoom 1) → doors ≈ 42 px. */
(function(){   // 📚 starter catalogue (IP-0 drafts → ip-1)
'use strict';
const K = {add, addSet, MAT, DEFS, organic}, D = PD, M = K.MAT, TAU = Math.PI * 2, sh = D.sh;
const S = (set, o) => K.addSet(set, o);
S('jungle', {name: 'Jungle', icon: '🌴', accent: '#4CB13A'});
S('village', {name: 'Village', icon: '🏘️', accent: '#E2553A'});
S('temple', {name: 'Temple', icon: '🛕', accent: '#F2B731'});
S('bits', {name: 'Game bits', icon: '🎯', accent: '#3A8DFF'});
S('landmark', {name: 'Landmark', icon: '🐘', accent: '#9B5DE5'});
const piece = (g, parts) => D.piece(g, parts, '#000', 0);   // no own rim: the bake draws ONE silhouette rim
const mid = (def) => [def.foot[0] / 2, def.foot[1] / 2];

/* ================= 🌴 jungle (organic = billboards) ================= */
function palm(g, x, y, k, t, v){ const lean = [0, 0.12, -0.1][v % 3], sw = Math.sin(t * 1.5) * 0.05; g.save(); g.translate(x, y); g.scale(k, k);
  piece(g, [{path: g => { g.moveTo(-3, 0); g.quadraticCurveTo(-6 + lean * 40, -34, 4 + lean * 60, -66); g.lineTo(9 + lean * 60, -65); g.quadraticCurveTo(lean * 40, -34, 3, 0); g.closePath(); }, fill: g => D.lin(g, -4, 0, 6, 0, ['#D9A26A', '#8A5A2B'])}]);
  g.strokeStyle = 'rgba(42,28,20,0.22)'; g.lineWidth = 1; for(let i = 1; i < 7; i++){ const yy = -i * 9; g.beginPath(); g.moveTo(-3 + lean * i * 8, yy); g.lineTo(5 + lean * i * 8, yy - 2); g.stroke(); }
  g.translate(6 + lean * 60, -66); g.rotate(sw);
  for(let i = 0; i < 7; i++){ const a = -Math.PI / 2 + (i - 3) * 0.55; piece(g, [{path: g => { g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a - 0.3) * 20, Math.sin(a - 0.3) * 20 - 7, Math.cos(a) * 33, Math.sin(a) * 28 + 9); g.quadraticCurveTo(Math.cos(a + 0.3) * 17, Math.sin(a + 0.3) * 17, 0, 0); }, fill: i % 2 ? '#4CB13A' : '#62CC4C'}]); }
  g.fillStyle = '#7A4A22'; [[-2, 3], [3, 4], [0, 6]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 3, 3); g.fill(); }); g.restore(); }
function canopy(g, x, y, k, c, s, fruit, seed){ g.save(); g.translate(x, y); g.scale(k * s, k * s);
  piece(g, [{path: g => { g.moveTo(-6, 0); g.lineTo(-3.5, -30); g.lineTo(3.5, -30); g.lineTo(6, 0); g.closePath(); g.moveTo(-6, 0); g.lineTo(-11, 2); g.lineTo(-4, -5); g.moveTo(6, 0); g.lineTo(11, 2); g.lineTo(4, -5); }, fill: '#8A5A2B'},
    {path: g => { [[-13, -36, 14], [11, -38, 14], [0, -52, 17], [-7, -29, 12], [9, -27, 11]].forEach(p => { g.moveTo(p[0] + p[2], p[1]); g.arc(p[0], p[1], p[2], 0, TAU); }); }, fill: g => D.rad(g, -5, -54, 3, 38, [c[2], c[0], c[1]])}]);
  g.fillStyle = 'rgba(255,255,255,0.2)'; g.beginPath(); D.ell(g, -5, -56, 9, 4.5, -0.3); g.fill();
  if(fruit){ const r = D.rnd(seed || 5); for(let i = 0; i < 6; i++){ g.fillStyle = r() < 0.5 ? '#FFB21A' : '#FF8A2A'; g.beginPath(); D.ell(g, (r() - 0.5) * 36, -(26 + r() * 30), 3.2, 3.9); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); D.ell(g, (r() - 0.5) * 2, 0, 0, 0); } }
  g.restore(); }
const HUES = [['#3FA34D', '#2E8540', '#5CC062'], ['#58B83F', '#3C8F2C', '#7DD05A'], ['#2F9A6A', '#22764F', '#4FC08A']];
function banana(g, x, y, k, t){ g.save(); g.translate(x, y); g.scale(k, k);
  for(let i = 0; i < 6; i++){ const a = -Math.PI / 2 + (i - 2.5) * 0.5; piece(g, [{path: g => { g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a) * 11 - 6, Math.sin(a) * 26, Math.cos(a) * 20, Math.sin(a) * 33); g.quadraticCurveTo(Math.cos(a) * 13 + 6, Math.sin(a) * 19, 0, 0); }, fill: i % 2 ? '#7FD35A' : '#5DC94A'}]); }
  g.fillStyle = '#FFD23F'; [[4, -14], [7, -12], [5, -10]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 2.2, 4.4, 0.5); g.fill(); }); g.restore(); }
function bamboo(g, x, y, k, c){ g.save(); g.translate(x, y); g.scale(k, k); const snap = c && c.broken;   /* ip-3: c = 🍂 condition → straw canes, no leaves · ruined = snapped */
  [[-7, 50], [0, 62], [7, 44], [-2, 36]].forEach((b, i) => { const H = snap ? b[1] * [0.45, 0.6, 0.35, 0.5][i] : b[1]; piece(g, [{path: g => { if(snap){ g.moveTo(b[0] - 2.6, 0); g.lineTo(b[0] - 2.6, -H); g.lineTo(b[0], -H - 4); g.lineTo(b[0] + 2.6, -H + 1); g.lineTo(b[0] + 2.6, 0); g.closePath(); } else D.rr(g, b[0] - 2.6, -H, 5.2, H, 2); }, fill: c ? '#CDB872' : '#8FCB4A'}]);
    g.strokeStyle = c ? 'rgba(120,96,50,0.55)' : 'rgba(60,90,30,0.55)'; g.lineWidth = 1; for(let yy = -8; yy > -H; yy -= 10){ g.beginPath(); g.moveTo(b[0] - 2.6, yy); g.lineTo(b[0] + 2.6, yy); g.stroke(); } if(!c){ g.fillStyle = '#6FCB4A'; g.beginPath(); D.ell(g, b[0] + 5, -b[1] + 5, 5.5, 2.2, -0.5); g.fill(); } });
  g.restore(); }
function bush(g, x, y, k, v){ const c = HUES[v % 3]; g.save(); g.translate(x, y); g.scale(k, k);
  piece(g, [{path: g => { [[-10, -9, 10], [9, -10, 10], [0, -17, 12]].forEach(p => { g.moveTo(p[0] + p[2], p[1]); g.arc(p[0], p[1], p[2], 0, TAU); }); g.rect(-18, -9, 36, 9); }, fill: g => D.rad(g, -4, -22, 2, 24, [c[2], c[0], c[1]])}]);
  if(v % 2){ g.fillStyle = '#FF8FB0'; [[-8, -14], [6, -19], [10, -7]].forEach(p => { g.beginPath(); D.ell(g, p[0], p[1], 2.4, 2.4); g.fill(); }); } g.restore(); }
function rock(g, x, y, k, v){ g.save(); g.translate(x, y); g.scale(k, k); const sz = [1, 0.8, 1.15][v % 3];
  piece(g, [{path: g => { g.moveTo(-17 * sz, 0); g.quadraticCurveTo(-19 * sz, -14 * sz, -6 * sz, -20 * sz); g.quadraticCurveTo(8 * sz, -24 * sz, 15 * sz, -12 * sz); g.quadraticCurveTo(20 * sz, -3 * sz, 16 * sz, 0); g.closePath(); }, fill: g => D.lin(g, -16, -20, 16, 0, ['#D6D0C2', '#A9A291', '#857E6E'])}]);
  g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); D.ell(g, -6 * sz, -15 * sz, 5 * sz, 2.4 * sz, -0.3); g.fill(); g.fillStyle = '#6BBB4C'; g.beginPath(); D.ell(g, 8 * sz, -15 * sz, 5 * sz, 2.2 * sz); g.fill(); g.restore(); }
function flowers(g, x, y, k, v){ const r = D.rnd(11 + v * 7), cols = [['#FF8FB0', '#FFD23F'], ['#FFFFFF', '#FF7A5A'], ['#B48CFF', '#FFD23F'], ['#FF5A5A', '#FFFFFF']][v % 4];
  for(let i = 0; i < 6; i++){ const xx = x + (r() - 0.5) * 30 * k, yy = y + (r() - 0.5) * 12 * k; g.strokeStyle = '#4CA83A'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, yy - 7 * k); g.stroke();
    g.fillStyle = cols[i % 2]; g.beginPath(); for(let p = 0; p < 5; p++){ const a = p * TAU / 5; D.ell(g, xx + Math.cos(a) * 2 * k, yy - 8 * k + Math.sin(a) * 1.6 * k, 1.6 * k, 1.3 * k); } g.fill(); g.fillStyle = '#FFB21A'; g.beginPath(); D.ell(g, xx, yy - 8 * k, 1 * k, 1 * k); g.fill(); } }
const bill = (fn) => (B, v, pal, def) => B.bill(def.foot[0] / 2, def.foot[1] / 2, 0, (g, x, y, k, t) => fn(g, x, y, k, t, v));
const addOrganic = (set, key, o, fn) => K.organic(set, key, o, fn);   // ip-3: the core wrapper handles 🍂 conditions (own def.conds or the shared fallback)
addOrganic('jungle', 'palm', {name: 'Palm', h: 82, variants: 3, tags: ['tree', 'beach']}, (g, x, y, k, t, v) => palm(g, x, y, k, t, v));
addOrganic('jungle', 'jtree', {name: 'Jungle tree', h: 72, variants: 3, tags: ['tree']}, (g, x, y, k, t, v) => canopy(g, x, y, k, HUES[v % 3], 1.08));
addOrganic('jungle', 'mango', {name: 'Mango tree', h: 78, variants: 2, tags: ['tree', 'fruit']}, (g, x, y, k, t, v) => canopy(g, x, y, k, ['#4CA83A', '#2E7A26', '#7CCB55'], 1.12, true, 3 + v));
addOrganic('jungle', 'banana', {name: 'Banana', h: 36, kind: 'bush', tags: ['plant', 'fruit']}, (g, x, y, k, t) => banana(g, x, y, k, t));
addOrganic('jungle', 'bamboo', {name: 'Bamboo', h: 64, tags: ['plant']}, (g, x, y, k) => bamboo(g, x, y, k)).conds = {'*': (g, x, y, k, t, v, c) => bamboo(g, x, y, k, c)};
addOrganic('jungle', 'bush', {name: 'Bush', h: 30, kind: 'bush', variants: 4, tags: ['plant']}, (g, x, y, k, t, v) => bush(g, x, y, k, v));
addOrganic('jungle', 'rock', {name: 'Rock', h: 24, kind: 'deco', variants: 3, tags: ['stone']}, (g, x, y, k, t, v) => rock(g, x, y, k, v));
addOrganic('jungle', 'flowers', {name: 'Flowers', h: 12, kind: 'deco', variants: 4, block: false, shadowA: 0.08, tags: ['plant']}, (g, x, y, k, t, v) => flowers(g, x, y, k, v));
// a log is round but LONG → it lies along the grid and turns with it (custom painter in model space)
(function(){ const def = K.add('jungle', 'log', {name: 'Log', foot: [1, 1], h: 16, kind: 'deco', organic: true, tags: ['wood']});
  def.build = (B) => B.custom(0.5, 0.5, (g, P, k) => { const a = P(0.16, 0.5, 7), b = P(0.84, 0.5, 7), r = 7 * k, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    g.save(); g.translate(a[0], a[1]); g.rotate(ang); const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    g.fillStyle = D.lin(g, 0, -r, 0, r, ['#C99257', '#8A5A2B']); g.beginPath(); g.moveTo(0, -r); g.lineTo(L, -r); g.lineTo(L, r); g.lineTo(0, r); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(42,28,20,0.25)'; g.lineWidth = k; g.beginPath(); g.moveTo(4 * k, -r * 0.3); g.lineTo(L - 6 * k, -r * 0.2); g.stroke();
    const cap = Math.cos(ang) > 0 ? L : 0; g.fillStyle = '#E8C08A'; g.beginPath(); D.ell(g, cap, 0, r * 0.45, r); g.fill(); g.strokeStyle = 'rgba(138,90,43,0.6)'; g.beginPath(); D.ell(g, cap, 0, r * 0.22, r * 0.5); g.stroke();
    g.fillStyle = '#6BBB4C'; g.beginPath(); D.ell(g, L * 0.4, -r, 4 * k, 2 * k); g.fill(); g.restore(); }); })();

/* ================= 🏘️ village (corners on the grid) ================= */
(function(){ const def = K.add('village', 'stilt', {name: 'Stilt house', foot: [2, 2], h: 100, variants: 6, door: [1, 2], tags: ['house', 'home']});
  def.build = (B, v, L) => { const wall = L.walls[v % L.walls.length], roof = L.roofs[v % L.roofs.length], lift = L.stilts ? 14 : 0;
    if(lift){ [[0.18, 0.18], [1.66, 0.18], [0.18, 1.66], [1.66, 1.66]].forEach(p => B.box(p[0], p[1], 0, 0.16, 0.16, 14, L.trim));
      B.box(0.85, 1.82, 0, 0.42, 0.34, 4, M.plank); B.box(0.85, 1.82, 4, 0.42, 0.18, 4, M.plank); B.box(0.85, 1.82, 8, 0.42, 0.06, 6, M.plank); }   // steps up to the door
    else B.box(0.1, 0.1, 0, 1.8, 1.8, 4, M.stone);
    const b = B.box(0.15, 0.15, lift || 4, 1.7, 1.7, 46, wall, {trim: 9});
    B.door(b, 'front', 0.86, 0.4, 40, {fill: L.trim}); B.win(b, 'front', 0.3, 0.32, 18, 13); if(v % 2) B.win(b, 'front', 1.4, 0.26, 18, 13); B.win(b, 'right', 0.45, 0.34, 18, 13); B.win(b, 'right', 1.1, 0.3, 18, 13); B.win(b, 'back', 0.6, 0.4, 18, 13);
    const z = (lift || 4) + 46;
    if(L.flat){ B.box(0.1, 0.1, z, 1.8, 1.8, 6, roof, {trim: 0}); B.box(0.25, 0.25, z + 6, 0.5, 0.5, 10, wall); B.drum(1.4, 1.4, z + 6, 0.2, 12, L.accent, {topFill: sh(L.accent, 0.3)}); return; }
    B.roof(0.15, 0.15, z, 1.7, 1.7, L.curve ? 30 : 34, roof, {stripes: L.curve ? 0 : 7, ov: L.curve ? 0.28 : 0.2, ridge: v % 2 ? 'y' : 'x', finials: !!L.curve});
    if(L.snow) B.custom(1, 1, (g, P, k) => { const r = v % 2 ? 'y' : 'x', a = 0.15 - 0.2, b2 = 1.85 + 0.2; g.fillStyle = '#F7FBFF'; g.beginPath();
      if(r === 'x'){ [P(a, 1, z + 34), P(b2, 1, z + 34), P(b2, 1.35, z + 22), P(a, 1.35, z + 22)].forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); }
      else { [P(1, a, z + 34), P(1, b2, z + 34), P(1.35, b2, z + 22), P(1.35, a, z + 22)].forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); }
      g.closePath(); g.fill(); }, {layer: 3}); }; })();
(function(){ const def = K.add('village', 'inn', {name: 'Inn', foot: [3, 2], h: 112, door: [1, 2], tags: ['house', 'big', 'rest']});
  def.build = (B) => { const b = B.box(0.12, 0.12, 0, 2.76, 1.76, 52, M.wood, {trim: 10});
    B.door(b, 'front', 1.25, 0.46, 42); B.win(b, 'front', 0.35, 0.4, 20, 14); B.win(b, 'front', 2.1, 0.4, 20, 14); B.win(b, 'right', 0.45, 0.36, 20, 14); B.win(b, 'right', 1.05, 0.36, 20, 14); B.win(b, 'back', 1.2, 0.4, 20, 14);
    B.roof(0.12, 0.12, 52, 2.76, 1.76, 42, M.thatch, {stripes: 9, ov: 0.24});
    B.box(2.2, 0.35, 66, 0.3, 0.3, 40, M.stone, {layer: 1, dz: -3});   // chimney
    B.custom(1.48, 2, (g, P, k) => { const a = P(1.05, 1.92, 58), b2 = P(1.95, 1.92, 58), c = P(1.5, 1.92, 58); g.strokeStyle = '#5A3418'; g.lineWidth = 1.4 * k; g.beginPath(); g.moveTo(a[0], a[1] - 6 * k); g.lineTo(c[0], c[1] - 10 * k); g.lineTo(b2[0], b2[1] - 6 * k); g.stroke();
      const w = 34 * k, h = 16 * k; D.card(g, c[0] - w / 2, c[1] - 6 * k, w, h, {fill: '#FFF6E4', r: 4 * k, shadow: false, line: '#5A3418', lw: 1.4 * k}); D.txt(g, 'INN', c[0], c[1] + 6.5 * k, {size: 10.5 * k, align: 'center', col: '#2A1C14', w: 700}); }, {layer: 2}); }; })();
(function(){ const def = K.add('village', 'stall', {name: 'Market stall', foot: [2, 1], h: 58, door: [1, 1], tags: ['shop']});
  def.build = (B, v) => { const aw = ['#2EC4B6', '#E2553A', '#9B5DE5'][v % 3];
    [[0.1, 0.08], [1.78, 0.08], [0.1, 0.78], [1.78, 0.78]].forEach(p => B.box(p[0], p[1], 0, 0.12, 0.12, 46, M.dark));
    const c = B.box(0.12, 0.2, 0, 1.76, 0.66, 20, M.wood, {trim: 7});
    B.custom(1, 0.5, (g, P, k) => { const goods = [[0.4, '#FF5A5A', 'ball'], [0.75, '#FFB21A', 'ball'], [1.05, '#6BC95A', 'ball'], [1.35, '#3A8DFF', 'pot'], [1.62, '#B8BCC6', 'shield']];
      goods.forEach(gd => { const p = P(gd[0], 0.55, 24); g.fillStyle = gd[1]; g.strokeStyle = 'rgba(42,28,20,0.5)'; g.lineWidth = k;
        if(gd[2] === 'ball'){ for(let i = 0; i < 3; i++){ g.beginPath(); D.ell(g, p[0] + (i - 1) * 3.5 * k, p[1] - (i === 1 ? 3 : 0) * k, 3.2 * k, 3 * k); g.fill(); g.stroke(); } }
        else if(gd[2] === 'pot'){ g.beginPath(); D.ell(g, p[0], p[1] - 3 * k, 4 * k, 4.4 * k); g.fill(); g.stroke(); g.fillStyle = '#E8E1D2'; g.fillRect(p[0] - 1.5 * k, p[1] - 11 * k, 3 * k, 4 * k); }
        else { g.beginPath(); g.moveTo(p[0] - 5 * k, p[1] - 10 * k); g.lineTo(p[0] + 5 * k, p[1] - 10 * k); g.lineTo(p[0] + 4 * k, p[1] - 2 * k); g.lineTo(p[0], p[1] + 1 * k); g.lineTo(p[0] - 4 * k, p[1] - 2 * k); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#F2B731'; g.fillRect(p[0] - 0.8 * k, p[1] - 9 * k, 1.6 * k, 8 * k); } }); }, {layer: 1});
    B.custom(1, 0.5, (g, P, k) => { const z0 = 44, z1 = 56, n = 8; for(let i = 0; i < n; i++){ const u0 = -0.05 + 2.1 * i / n, u1 = -0.05 + 2.1 * (i + 1) / n;
        const pts = [P(u0, 0.0, z1), P(u1, 0.0, z1), P(u1, 1.02, z0), P(u0, 1.02, z0)]; g.beginPath(); pts.forEach((q, j) => j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fillStyle = i % 2 ? '#FFFFFF' : aw; g.fill(); g.strokeStyle = 'rgba(42,28,20,0.18)'; g.lineWidth = k; g.stroke();
        const a = P(u0, 1.02, z0), b = P(u1, 1.02, z0); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 6 * k, b[0], b[1]); g.closePath(); g.fill(); } }, {layer: 3}); }; })();
(function(){ const def = K.add('village', 'smithy', {name: 'Blacksmith', foot: [2, 2], h: 104, door: [0.86, 2], tags: ['shop', 'forge']});
  def.build = (B) => { const b = B.box(0.12, 0.12, 0, 1.76, 1.76, 44, M.stone, {trim: 11});
    B.decal(b, 'front', 0.55, 0.62, 0, 30, '#2B2D42', {paint: (g, Q, k) => { const f = Q(0.5, 6); D.glow(g, f[0], f[1], 20 * k, '#FF7A2E', 0.75); g.fillStyle = '#FF9A3E'; g.beginPath(); D.ell(g, f[0], f[1] + 2 * k, 9 * k, 4 * k); g.fill(); }});
    B.win(b, 'right', 0.5, 0.4, 18, 12);
    B.roof(0.12, 0.12, 44, 1.76, 1.76, 30, '#5A5470', {kind: 'hip', ov: 0.18});
    B.box(1.2, 0.25, 50, 0.36, 0.36, 46, M.stone, {layer: 1, trim: 8});
    B.box(0.55, 1.95, 0, 0.36, 0.22, 10, M.dark, {layer: 1}); B.box(0.5, 1.95, 10, 0.46, 0.22, 6, M.iron, {layer: 1});   // anvil out front
    B.custom(1.4, 0.4, (g, P, k, t) => { const c = P(1.38, 0.43, 100); g.fillStyle = 'rgba(220,220,228,0.75)'; for(let i = 0; i < 3; i++){ g.beginPath(); D.ell(g, c[0] + i * 4 * k, c[1] - i * 9 * k - ((t || 0) * 10 % 6) * k, (4 + i * 2) * k, (3 + i) * k); g.fill(); } }, {layer: 4}); }; })();
(function(){ const def = K.add('village', 'qboard', {name: 'Quest board', foot: [1, 1], h: 48, tags: ['quest']});
  def.build = (B) => { [0.12, 0.8].forEach(x => B.box(x, 0.45, 0, 0.1, 0.1, 40, M.dark));
    const b = B.box(0.08, 0.5, 14, 0.86, 0.1, 24, M.wood);
    B.decal(b, 'front', 0.16, 0.2, 9, 11, '#FFF3DC'); B.decal(b, 'front', 0.42, 0.22, 5, 13, '#FFF3DC'); B.decal(b, 'front', 0.7, 0.18, 10, 10, '#FFF3DC');
    B.box(0.02, 0.48, 38, 0.98, 0.16, 4, M.clay);
    B.custom(0.5, 0.6, (g, P, k) => { const c = P(0.5, 0.6, 52); D.card(g, c[0] - 8 * k, c[1] - 12 * k, 16 * k, 16 * k, {fill: '#FFC21A', r: 8 * k, shadow: false}); D.txt(g, '!', c[0], c[1] + 1.5 * k, {size: 13 * k, align: 'center', col: '#fff', w: 800, font: '"Baloo 2"'}); }, {layer: 2}); }; })();
(function(){ const def = K.add('village', 'well', {name: 'Well', foot: [1, 1], h: 56, tags: ['water']});
  def.build = (B) => { B.drum(0.5, 0.5, 0, 0.36, 16, M.stone, {rings: 2, topFill: '#3A8FBF'});
    [[0.2, 0.46], [0.74, 0.46]].forEach(p => B.box(p[0], p[1], 14, 0.07, 0.07, 26, M.dark, {layer: 1}));
    B.roof(0.16, 0.3, 40, 0.68, 0.4, 14, M.clay, {layer: 2, ov: 0.08}); }; })();
(function(){ const def = K.add('village', 'lantern', {name: 'Lantern post', foot: [1, 1], h: 50, kind: 'post', block: false, tags: ['light', 'night']});
  def.build = (B) => { B.box(0.44, 0.44, 0, 0.12, 0.12, 40, M.dark); B.box(0.36, 0.36, 0, 0.28, 0.28, 4, M.stone);
    B.box(0.41, 0.41, 36, 0.18, 0.18, 10, '#FFD23F', {topFill: '#5A3418'}); B.bill(0.5, 0.5, 41, (g, x, y, k) => D.glow(g, x, y, 16 * k, '#FFD23F', 0.45), {layer: 2}); }; })();
(function(){ const def = K.add('village', 'fence', {name: 'Fence', foot: [2, 1], h: 20, kind: 'fence', tags: ['wall']});
  def.build = (B) => { [0.05, 0.65, 1.25, 1.85].forEach(x => B.box(x, 0.45, 0, 0.1, 0.1, 20, M.wood)); B.box(0.02, 0.47, 7, 1.96, 0.06, 4, M.plank, {dz: 0.01}); B.box(0.02, 0.47, 14, 1.96, 0.06, 4, M.plank, {dz: 0.01}); }; })();
(function(){ const def = K.add('village', 'crates', {name: 'Crates', foot: [1, 1], h: 32, kind: 'thing', variants: 3, tags: ['cargo']});
  def.build = (B, v) => { const plank = c => ({trim: 6}); if(v === 0){ B.box(0.12, 0.3, 0, 0.5, 0.5, 16, M.plank, plank()); B.box(0.55, 0.1, 0, 0.38, 0.38, 12, M.plank, plank()); B.box(0.2, 0.36, 16, 0.36, 0.36, 12, M.wood, plank()); }
    else if(v === 1){ B.box(0.2, 0.2, 0, 0.6, 0.6, 18, M.wood, plank()); B.drum(0.78, 0.78, 0, 0.13, 14, '#B07842', {rings: 2}); }
    else { B.box(0.1, 0.1, 0, 0.4, 0.4, 14, M.plank, plank()); B.box(0.5, 0.5, 0, 0.42, 0.42, 14, M.plank, plank()); B.box(0.5, 0.1, 0, 0.4, 0.38, 12, M.wood, plank()); } }; })();
(function(){ const def = K.add('village', 'signpost', {name: 'Signpost', foot: [1, 1], h: 46, kind: 'post', block: false, tags: ['way']});
  def.build = (B) => { B.box(0.46, 0.46, 0, 0.09, 0.09, 42, M.dark);
    B.custom(0.5, 0.5, (g, P, k) => { [[[0.5, 0.5, 34], [1.05, 0.5, 34], '#E2B07A'], [[0.5, 0.5, 24], [0.5, 1.05, 24], '#C99257']].forEach(s => { const a = P(...s[0]), b = P(...s[1]), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, h = 5 * k;
      const tip = [b[0] + ux * 6 * k, b[1] + uy * 6 * k]; g.beginPath(); g.moveTo(a[0], a[1] - h); g.lineTo(b[0], b[1] - h); g.lineTo(tip[0], tip[1]); g.lineTo(b[0], b[1] + h); g.lineTo(a[0], a[1] + h); g.closePath(); g.fillStyle = s[2]; g.fill(); g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = k; g.stroke();
      g.fillStyle = '#5A3418'; for(let i = 1; i <= 3; i++){ g.beginPath(); g.arc(a[0] + dx * i / 4, a[1] + dy * i / 4, 1.3 * k, 0, TAU); g.fill(); } }); }, {layer: 1}); }; })();
(function(){ const def = K.add('village', 'dock', {name: 'Dock + boat', foot: [2, 2], h: 34, kind: 'bridge', block: false, tags: ['water', 'boat']});
  def.build = (B, v) => { [[0.1, 0.1], [0.1, 0.8], [1.8, 0.1], [1.8, 0.8]].forEach(p => B.box(p[0], p[1], -6, 0.12, 0.12, 16, M.dark));
    B.box(0, 0.05, 6, 2, 0.95, 4, M.plank, {trim: 0});
    B.custom(1, 1.45, (g, P, k, t) => { const bob = Math.sin((t || 0) * 2) * 1.2, z = 3 + bob, x0 = 0.2, x1 = 1.85, ym = 1.45, N = 14;
      const u2x = u => x0 + (x1 - x0) * u, wid = u => 0.27 * Math.pow(Math.sin(Math.PI * u), 0.7), lift = u => 7 * Math.pow(Math.abs(2 * u - 1), 3);
      const rim = side => { const a = []; for(let i = 0; i <= N; i++){ const u = i / N; a.push(P(u2x(u), ym + side * wid(u), z + 6 + lift(u))); } return a; };
      const keel = []; for(let i = 0; i <= N; i++){ const u = i / N; keel.push(P(u2x(u), ym + wid(u) * 0.35, z - 3 + lift(u) * 0.8)); }
      const L = rim(1), R = rim(-1), path = pts => { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); };
      path(R.concat(L.slice().reverse())); g.fillStyle = '#7A4A22'; g.fill();                                   // inside of the boat
      for(let i = 3; i < N; i += 4){ const u = i / N; const a = P(u2x(u), ym - wid(u) * 0.9, z + 5), b = P(u2x(u), ym + wid(u) * 0.9, z + 5); g.strokeStyle = '#C99257'; g.lineWidth = 2.4 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }   // seats
      path(L.concat(keel.slice().reverse())); g.fillStyle = D.sh(['#E2553A', '#2EC4B6', '#FFB21A'][v % 3], 0.12); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = k; g.stroke();   // outer hull (left-lit)
      g.strokeStyle = '#FFF3DC'; g.lineWidth = 1.6 * k; g.beginPath(); L.forEach((q, i) => i ? g.lineTo(q[0], q[1] + 2.5 * k) : g.moveTo(q[0], q[1] + 2.5 * k)); g.stroke();
      const m = P(1.0, ym, z + 5); g.strokeStyle = '#5A3418'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(m[0], m[1]); g.lineTo(m[0], m[1] - 30 * k); g.stroke();
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(m[0] + 1.5 * k, m[1] - 29 * k); g.quadraticCurveTo(m[0] + 17 * k, m[1] - 18 * k, m[0] + 1.5 * k, m[1] - 6 * k); g.closePath(); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.3)'; g.lineWidth = k; g.stroke(); }, {layer: 1}); }; def.variants = 3; })();
(function(){ const def = K.add('village', 'bridge', {name: 'Rope bridge', foot: [3, 1], h: 30, kind: 'bridge', block: false, tags: ['bridge']});
  def.build = (B) => { [[0.05, 0.1], [0.05, 0.82], [2.83, 0.1], [2.83, 0.82]].forEach(p => B.box(p[0], p[1], 0, 0.12, 0.12, 26, M.dark));
    for(let i = 0; i < 12; i++){ const x = 0.18 + i * 0.22, sag = Math.sin(Math.PI * (i + 0.5) / 12) * 5; B.box(x, 0.16, -sag, 0.17, 0.72, 3, i % 3 ? M.plank : M.wood, {dz: -0.5}); }
    B.custom(1.5, 0.5, (g, P, k) => { [0.16, 0.86].forEach(y => { g.strokeStyle = '#8A5A2B'; g.lineWidth = 1.6 * k; g.beginPath(); for(let i = 0; i <= 16; i++){ const x = 0.11 + 2.78 * i / 16, z = 22 - Math.sin(Math.PI * i / 16) * 7, q = P(x, y, z); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.stroke();
      g.lineWidth = k; for(let i = 1; i < 8; i++){ const x = 0.11 + 2.78 * i / 8, s0 = Math.sin(Math.PI * i / 8), a = P(x, y, 22 - s0 * 7), b = P(x, y, -s0 * 5 + 3); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); } }); }, {layer: 2}); }; })();

/* ================= 🛕 temple ================= */
(function(){ const def = K.add('temple', 'prang', {name: 'Boss temple', foot: [3, 3], h: 160, kind: 'landmark', door: [1.5, 3], tags: ['boss', 'temple']});
  def.build = (B) => { const st = '#CBBE9E';
    const a = B.box(0.05, 0.05, 0, 2.9, 2.9, 14, st, {trim: 7}); B.box(0.4, 0.4, 14, 2.2, 2.2, 14, st, {trim: 7}); const c = B.box(0.75, 0.75, 28, 1.5, 1.5, 22, st, {trim: 11});
    B.box(1.25, 2.95, 0, 0.5, 0.05, 2, st);
    B.decal(c, 'front', 1.22, 0.56, 0, 18, '#2B1D14', {k: 'door', paint: (g, Q, k) => { const f = Q(0.5, 10); D.glow(g, f[0], f[1], 26 * k, '#9B5DE5', 0.55); }}); B.decal(c, 'right', 1.25, 0.5, 0, 18, '#2B1D14', {k: 'door'});
    B.drum(1.5, 1.5, 50, 0.6, 22, st, {rings: 2}); B.drum(1.5, 1.5, 72, 0.5, 20, st, {rings: 2}); B.drum(1.5, 1.5, 92, 0.38, 18, st, {rings: 2}); B.cone(1.5, 1.5, 110, 0.3, 30, st, {stripes: 5});
    B.bill(1.5, 1.5, 138, (g, x, y, k) => { g.fillStyle = '#F2B731'; g.beginPath(); g.moveTo(x - 2.5 * k, y + 2 * k); g.lineTo(x, y - 22 * k); g.lineTo(x + 2.5 * k, y + 2 * k); g.closePath(); g.fill(); g.beginPath(); D.ell(g, x, y - 23 * k, 2.6 * k, 2.6 * k); g.fill(); }, {layer: 1});
    B.bill(0.45, 2.55, 14, (g, x, y, k) => { g.fillStyle = '#4CB13A'; g.beginPath(); D.ell(g, x, y, 7 * k, 3 * k, 0.3); g.fill(); }, {layer: 1}); B.bill(2.4, 0.6, 28, (g, x, y, k) => { g.fillStyle = '#5DC94A'; g.beginPath(); D.ell(g, x, y, 6 * k, 2.6 * k, -0.3); g.fill(); }, {layer: 1}); }; })();
(function(){ const def = K.add('temple', 'shrine', {name: 'Spirit shrine', foot: [1, 1], h: 64, tags: ['temple', 'small']});
  def.build = (B) => { B.box(0.36, 0.36, 0, 0.28, 0.28, 4, M.stone); B.box(0.45, 0.45, 4, 0.1, 0.1, 22, M.white);
    B.box(0.2, 0.2, 26, 0.6, 0.6, 4, M.white); const h = B.box(0.27, 0.27, 30, 0.46, 0.46, 16, '#FFF3DC'); B.door(h, 'front', 0.15, 0.16, 12, {fill: '#C0392B'});
    B.roof(0.27, 0.27, 46, 0.46, 0.46, 10, M.red, {ov: 0.08, gable: M.gold, finials: true}); B.roof(0.32, 0.32, 54, 0.36, 0.36, 9, '#2E8F86', {ov: 0.05, finials: true, layer: 1}); }; })();
(function(){ const def = K.add('temple', 'stairs', {name: 'Stone stairs', foot: [1, 2], h: 26, kind: 'thing', block: false, tags: ['path', 'climb']});
  def.build = (B) => { for(let i = 0; i < 5; i++) B.box(0.05, 0.05 + i * 0.38, 0, 0.9, 0.4, 24 - i * 5, '#CBBE9E', {dz: i * 0.01}); }; })();
(function(){ const def = K.add('temple', 'guardian', {name: 'Lion guardian', foot: [1, 1], h: 58, tags: ['statue', 'temple']});
  def.build = (B) => { B.box(0.15, 0.15, 0, 0.7, 0.7, 16, '#CBBE9E', {trim: 8});
    B.bill(0.5, 0.5, 16, (g, x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); const st = g => D.lin(g, -14, -40, 14, 0, ['#E4DCC6', '#B8AC8E']);
      piece(g, [{path: g => { D.rr(g, -12, -16, 24, 16, 6); }, fill: st}, {path: g => { D.ell(g, 0, -28, 13, 13); }, fill: st}, {path: g => { for(let i = 0; i < 9; i++){ const a = i * TAU / 9; g.moveTo(Math.cos(a) * 16, -28 + Math.sin(a) * 16); g.arc(Math.cos(a) * 12, -28 + Math.sin(a) * 12, 5, 0, TAU); } }, fill: '#D9CDAE'}, {path: g => D.ell(g, 0, -27, 10, 10), fill: st}]);
      g.fillStyle = '#2A1C14'; [-4, 4].forEach(ex => { g.beginPath(); D.ell(g, ex, -30, 1.8, 2.2); g.fill(); }); g.strokeStyle = 'rgba(42,28,20,0.5)'; g.lineWidth = 1.2; g.beginPath(); g.arc(0, -24, 3.5, 0.2, Math.PI - 0.2); g.stroke(); g.fillStyle = '#F2B731'; g.beginPath(); D.ell(g, 0, -13, 3, 3); g.fill(); g.restore(); }); }; })();
(function(){ const def = K.add('temple', 'gate', {name: 'Temple gate', foot: [3, 1], h: 88, kind: 'gate', door: [1.5, 1], block: 'posts', tags: ['temple', 'entrance']});
  def.build = (B) => { [0.1, 2.5].forEach(x => { B.box(x, 0.25, 0, 0.4, 0.5, 8, '#CBBE9E'); B.box(x + 0.06, 0.31, 8, 0.28, 0.38, 52, M.red, {trim: 13}); });
    const lt = B.box(0.05, 0.22, 60, 2.9, 0.56, 8, M.red); B.decal(lt, 'front', 1.05, 0.9, 1.5, 5, M.gold); B.roof(0.05, 0.22, 68, 2.9, 0.56, 16, '#2E8F86', {ov: 0.1, finials: true, gable: M.gold}); }; })();
(function(){ const def = K.add('temple', 'bell', {name: 'Temple bell', foot: [1, 1], h: 56, tags: ['temple', 'sound']});
  def.build = (B) => { [[0.12, 0.45], [0.8, 0.45]].forEach(p => B.box(p[0], p[1], 0, 0.1, 0.1, 46, M.red)); B.box(0.06, 0.42, 46, 0.88, 0.16, 6, M.dark);
    B.bill(0.5, 0.5, 44, (g, x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = '#5A3418'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 4); g.stroke();
      piece(g, [{path: g => { g.moveTo(-3, 4); g.quadraticCurveTo(-9, 8, -10, 22); g.lineTo(10, 22); g.quadraticCurveTo(9, 8, 3, 4); g.closePath(); }, fill: g => D.lin(g, -10, 0, 10, 0, ['#F6C95A', '#C98A1E', '#8E5E12'])}]);
      g.strokeStyle = 'rgba(42,28,20,0.3)'; g.beginPath(); g.moveTo(-9, 16); g.lineTo(9, 16); g.stroke(); g.restore(); }, {layer: 1}); }; })();

/* ================= 🎯 game bits ================= */
(function(){ const def = K.add('bits', 'stop', {name: 'Stop pad', foot: [1, 1], h: 40, kind: 'thing', block: false, variants: 3, tags: ['path', 'quest']});
  def.build = (B, v) => { B.drum(0.5, 0.5, 0, 0.36, 4, v === 1 ? '#FFE58A' : '#E8E1D2'); B.box(0.46, 0.46, 4, 0.08, 0.08, 34, M.dark);
    B.bill(0.5, 0.5, 36, (g, x, y, k) => { const col = ['#3A8DFF', '#4CC764', '#FF5A5A'][v % 3]; g.beginPath(); g.moveTo(x + 1.5 * k, y); g.lineTo(x + 22 * k, y + 5 * k); g.lineTo(x + 1.5 * k, y + 12 * k); g.closePath(); g.fillStyle = col; g.fill();
      D.txt(g, String(v + 1), x + 9 * k, y + 9.5 * k, {size: 9 * k, align: 'center', col: '#fff', w: 700}); if(v === 1){ g.fillStyle = '#FFC21A'; g.beginPath(); D.star(g, x, y + 30 * k, 5 * k, 2.2 * k); g.fill(); } }, {layer: 1}); }; })();
(function(){ const def = K.add('bits', 'chest', {name: 'Brain chest', foot: [1, 1], h: 34, kind: 'thing', variants: 2, tags: ['reward', 'puzzle']});
  def.build = (B, v) => { const b = B.box(0.2, 0.3, 0, 0.6, 0.4, 14, '#B07842'); B.decal(b, 'front', 0.44, 0.12, 6, 7, M.gold); B.decal(b, 'right', 0.3, 0.06, 0, 14, M.gold); B.decal(b, 'front', 0.22, 0.05, 0, 14, M.gold); B.decal(b, 'front', 0.73, 0.05, 0, 14, M.gold);
    B.roof(0.2, 0.3, 14, 0.6, 0.4, 8, '#C99257', {ov: 0.02, ridge: 'x', kind: 'gable'});
    if(v === 1) B.bill(0.5, 0.5, 30, (g, x, y, k) => { D.glow(g, x, y, 18 * k, '#9B5DE5', 0.55); g.save(); g.translate(x, y - 6 * k); g.scale(k, k); g.fillStyle = '#B48CFF'; g.strokeStyle = 'rgba(42,28,20,0.5)'; g.lineWidth = 1;   // a drawn puzzle piece
      g.beginPath(); g.moveTo(-6, -6); g.lineTo(-2, -6); g.arc(0, -7, 2.4, Math.PI, 0); g.lineTo(6, -6); g.lineTo(6, -2); g.arc(7, 0, 2.4, -Math.PI / 2, Math.PI / 2); g.lineTo(6, 6); g.lineTo(-6, 6); g.closePath(); g.fill(); g.stroke(); g.restore(); }, {layer: 1}); }; })();
(function(){ const SIDES = ['#E2553A', '#3A8DFF', '#4CC764', '#FFB21A', '#9B5DE5', '#2EC4B6', '#FF7AB6', '#7D8AA0'];
  const def = K.add('bits', 'campflag', {name: 'Camp flag', foot: [1, 1], h: 50, kind: 'post', block: false, variants: 8, tags: ['side', 'camp']});
  def.build = (B, v) => { B.drum(0.5, 0.5, 0, 0.16, 5, M.stone); B.box(0.47, 0.47, 5, 0.06, 0.06, 44, M.dark);
    B.bill(0.5, 0.5, 47, (g, x, y, k, t) => { const w = Math.sin((t || 0) * 4) * 2 * k; g.beginPath(); g.moveTo(x + 1.5 * k, y); g.quadraticCurveTo(x + 12 * k, y - 3 * k + w, x + 26 * k, y + 3 * k); g.lineTo(x + 19 * k, y + 8 * k); g.lineTo(x + 26 * k, y + 14 * k); g.quadraticCurveTo(x + 12 * k, y + 12 * k - w, x + 1.5 * k, y + 15 * k); g.closePath(); g.fillStyle = SIDES[v % 8]; g.fill();
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); D.star(g, x + 11 * k, y + 7.5 * k, 4.2 * k, 1.9 * k); g.fill(); }, {layer: 1}); }; })();
(function(){ const def = K.add('bits', 'marker', {name: 'Warning marker', foot: [1, 1], h: 34, kind: 'thing', block: false, tags: ['danger', 'event']});
  def.build = (B) => { B.flat(0.08, 0.08, 0.84, 0.84, '#FFD23F', {fill: 'rgba(255,90,90,0.28)'}); B.drum(0.5, 0.5, 0, 0.26, 4, '#5A5470');
    B.bill(0.5, 0.5, 6, (g, x, y, k) => { D.glow(g, x, y - 14 * k, 18 * k, '#FF5A5A', 0.4); g.beginPath(); g.moveTo(x, y - 28 * k); g.lineTo(x + 13 * k, y - 4 * k); g.lineTo(x - 13 * k, y - 4 * k); g.closePath(); g.fillStyle = '#FFD23F'; g.fill(); g.strokeStyle = '#E2553A'; g.lineWidth = 2 * k; g.stroke();
      D.txt(g, '!', x, y - 7.5 * k, {size: 15 * k, align: 'center', col: '#2A1C14', w: 800, font: '"Baloo 2"'}); }, {layer: 1}); }; })();

/* ================= 🐘 landmark ================= */
(function(){ const def = K.add('landmark', 'elephant', {name: 'Walking temple', foot: [3, 2], h: 186, kind: 'landmark', organic: true, wide: 20, tags: ['creature', 'temple', 'boss']});
  const leg = (g, x, y, w, h) => D.rr(g, x - w / 2, y - h, w, h, w / 2.4);
  def.build = (B) => B.bill(1.5, 1, 0, (g, x, y, k, t) => { const st = Math.sin(t * 1.6) * 2; g.save(); g.translate(x, y + 4 * k); g.scale(k * 1.12, k * 1.12);
    const grey = g => D.lin(g, 0, -90, 0, 0, ['#C9C3D6', '#9C95AE', '#7A7392']);
    piece(g, [{path: g => { leg(g, -36, st, 18, 40); leg(g, -14, -st, 18, 38); leg(g, 18, st, 18, 40); leg(g, 38, -st, 18, 38); }, fill: '#8E87A2'},
      {path: g => { g.moveTo(-54, -36); g.quadraticCurveTo(-60, -84, -10, -86); g.quadraticCurveTo(44, -88, 52, -48); g.quadraticCurveTo(50, -28, 30, -26); g.lineTo(-40, -26); g.quadraticCurveTo(-54, -26, -54, -36); g.closePath(); }, fill: grey},
      {path: g => D.ell(g, 58, -64, 20, 22), fill: grey},
      {path: g => { g.moveTo(70, -56); g.bezierCurveTo(84, -44, 80, -20, 88, -8); g.lineTo(80, -6); g.bezierCurveTo(72, -18, 72, -36, 62, -48); g.closePath(); }, fill: grey},
      {path: g => { g.moveTo(44, -80); g.quadraticCurveTo(30, -60, 42, -40); g.quadraticCurveTo(56, -46, 54, -70); g.closePath(); }, fill: '#B5AEC6'},
      {path: g => { g.moveTo(-34, -84); g.lineTo(28, -86); g.lineTo(30, -60); g.quadraticCurveTo(0, -52, -32, -60); g.closePath(); }, fill: g => D.lin(g, 0, -86, 0, -54, ['#E63946', '#B5172A'])},
      {path: g => D.rr(g, -26, -112, 48, 28, 3), fill: '#FFF3DC'},
      {path: g => { g.moveTo(-36, -110); g.lineTo(-2, -134); g.lineTo(32, -110); g.lineTo(26, -106); g.lineTo(-30, -106); g.closePath(); }, fill: g => D.lin(g, 0, -134, 0, -106, ['#FF7A4A', '#C0392B'])},
      {path: g => { g.moveTo(-26, -128); g.lineTo(-2, -148); g.lineTo(22, -128); g.lineTo(18, -124); g.lineTo(-22, -124); g.closePath(); }, fill: g => D.lin(g, 0, -148, 0, -124, ['#4CB8A8', '#1F7A6E'])},
      {path: g => { g.moveTo(-5, -146); g.lineTo(-2, -172); g.lineTo(1, -146); g.closePath(); }, fill: '#FFC21A'}]);
    g.fillStyle = '#FFC21A'; [[-36, -110], [32, -110], [-26, -128], [22, -128]].forEach((p, i) => { g.beginPath(); g.moveTo(p[0], p[1]); g.quadraticCurveTo(p[0] + (i % 2 ? 6 : -6), p[1] - 8, p[0] + (i % 2 ? 2 : -2), p[1] - 12); g.lineTo(p[0], p[1] - 4); g.fill(); });
    g.fillStyle = '#7A4A22'; D.rr(g, -8, -104, 12, 20, 6); g.fill(); g.strokeStyle = '#FFC21A'; g.lineWidth = 2; g.beginPath(); g.moveTo(-34, -64); g.quadraticCurveTo(0, -56, 30, -64); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(66, -50); g.quadraticCurveTo(80, -48, 82, -38); g.quadraticCurveTo(74, -44, 64, -44); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); D.ell(g, 64, -68, 3.2, 3.6); g.fill(); g.fillStyle = '#2A1C14'; g.beginPath(); D.ell(g, 63.4, -67.6, 2, 2.4); g.fill(); g.restore(); }); })();
/* 🎬 live layer (rule 8): period = the painter's own t cycle → Props.tick picks one of 6 baked frames */
[['palm', 2 * Math.PI / 1.5], ['smithy', 0.6], ['dock', Math.PI], ['campflag', Math.PI / 2], ['elephant', 2 * Math.PI / 1.6]].forEach(([k, p]) => { K.DEFS[k].live = {period: p, frames: 6}; });
})();
/* 📦 ip-4a LOOK FILES — IsoProps = the ENGINE (rules · builder · light · rim · 🍂 conditions · place / town / grow · the 🏘️ village + 🌴 jungle
   starter set every look falls back to) + ONE small file per look: IsoLook_<name>.html (Aowu 2026-11-17 21:5x "engine + per-look").
   Pages still write ONLY include('IsoProps'). Then:
     Props.need(['coral', 'castle'], start)   → downloads just those look files (once), then start(ok); also returns a Promise(ok).
                                               Already there (the 📲 offline app + the tests inline every file) → start(true) at once.
     Props.sources({coral: {src, alt, integrity}, …})   ← written by Code.gs include('IsoProps') online (INCLUDE_LAZY_), never by a page
     Props.has('coral') · Props.files() → {coral: 'ip-4a', …} (what is loaded) · Props.FILES (every look file there is) · Props.fileOf('machiya') → 'cherry'
   A look or a prop used before its file is there → ONE clear console warning (the look falls back to the village buildings; an unknown prop
   still throws as before, now with the file to ask for). 🔁 One round only (ip-4a): jungle + farm + grow still come with include('IsoProps')
   online too, until 🏰 TD-Stories + 🧳 Avateer call Props.need — then they go on demand like the rest. */
const FILES = ['jungle', 'cherry', 'desert', 'snow', 'farm', 'grow', 'lava', 'coral', 'moon', 'castle', 'realm', 'raptor', 'bolt', 'wild', 'kitchen', 'horde', 'monster', 'myth', 'reef', 'cloud', 'wizard', 'gear', 'detective', 'toybox', 'dust'];
/* 🏰⚔️ ar-1: a look file may NEED another first (AvataRealm sides build on realm = teams · slots · 🏗️ site · 🪙🧱 · 🟩 floors).
   Props.need(['raptor']) loads realm first by itself. Team / build / kerb may be passed as plain options: Props.pic(key, {team: 'red', build: 33})
   = {pal: {team: 'red', build: 33}} (same picture, same cache). */
const DEPS = {raptor: ['realm'], bolt: ['realm'], wild: ['realm'], kitchen: ['realm'], horde: ['realm'], monster: ['realm'], myth: ['realm'], reef: ['realm'], cloud: ['realm'], wizard: ['realm'], gear: ['realm'], toybox: ['realm'], dust: ['realm']};   // 🐾 ar-7: the Wild Realm file builds on realm too · 🍳🍽️ ip-4b: the 2 sides of matchup ① · 👹🦄 ip-4c: matchup ③
const HAVE = {}, SRC = {}, WAIT = {}, WARNED = {};
let FILE_OF = {};   // prop key → look file (filled at build time: Props._fileMap)
function warnOnce(id, msg){ if(WARNED[id]) return; WARNED[id] = 1; try { console.warn('🌳 IsoProps: ' + msg); } catch(e){} }
function loaded(name, round){ HAVE[name] = round || true; const w = WAIT[name]; delete WAIT[name]; if(w) w.forEach(f => f(true)); }
function sources(map){ Object.keys(map || {}).forEach(k => { SRC[k] = map[k]; }); return Object.assign({}, SRC); }
function has(name){ return !!HAVE[name]; }
function fileOf(key){ return FILE_OF[key] || null; }
function loadOne(name, done){
  if(HAVE[name]) return done(true);
  const dep = (DEPS[name] || []).filter(d => !HAVE[d]);   // 🏰⚔️ ar-1: its base file first (one after the other)
  if(dep.length) return loadOne(dep[0], ok => ok ? loadOne(name, done) : (warnOnce('dep:' + name, 'IsoLook_' + name + ' needs IsoLook_' + dep[0] + ' (it did not load)'), done(false)));
  if(WAIT[name]) return WAIT[name].push(done);
  const s = SRC[name];
  if(!s){ warnOnce('src:' + name, FILES.indexOf(name) < 0 ? 'no look file "' + name + '" (files: ' + FILES.join(', ') + ')'
    : 'the look file "' + name + '" has no source here — add IsoLook_' + name + ' to Code.gs INCLUDE_ALSO_ / INCLUDE_LAZY_ (IsoProps)'); return done(false); }
  WAIT[name] = [done];
  const fail = () => { const w = WAIT[name] || []; delete WAIT[name]; warnOnce('fail:' + name, 'IsoLook_' + name + ' did not load (site + backup copy)'); w.forEach(f => f(false)); };
  const tag = (url, next) => { if(!url) return next(); const el = document.createElement('script'); el.charset = 'utf-8'; el.async = false;
    if(s.integrity){ el.integrity = s.integrity; el.crossOrigin = 'anonymous'; }
    el.onload = () => { if(!HAVE[name]) next(); }; el.onerror = () => { if(el.parentNode) el.parentNode.removeChild(el); next(); };
    el.src = url; (document.head || document.documentElement).appendChild(el); };
  tag(s.src, () => tag(s.alt, fail));
}
function need(names, cb){
  const list = [].concat(names == null ? [] : names).map(String).filter((n, i, a) => n && a.indexOf(n) === i);
  return new Promise(res => { let left = list.length, ok = true; const fin = () => { if(typeof cb === 'function') cb(ok); res(ok); };
    if(!left) return fin(); list.forEach(n => loadOne(n, r => { ok = ok && r; if(--left === 0) fin(); })); });
}
// a look asked for by name whose file is not there yet → one warning (it falls back to the village buildings until the file is loaded)
function wantLook(look){ if(look && FILES.indexOf(look) >= 0 && !HAVE[look]) warnOnce('look:' + look, 'look "' + look + '" is not loaded — call Props.need([\'' + look + '\'], start) first (until then it falls back to the village buildings)'); }
// a look that does not exist yet (its file is not loaded) is dropped for this call → the village look, and pictures are cached as that (never a stale 'lava' picture)
const PAL_OPTS = ['team', 'build', 'kerb', 'by', 'cap'];   // 🏰⚔️ ar-1: plain options that really live in the look palette · ar-4: ⭐ shrine capture {by, cap}
function palIn(o){ if(!o || !PAL_OPTS.some(k => o[k] !== undefined)) return o; const pal = Object.assign({}, o.pal); o = Object.assign({}, o);
  PAL_OPTS.forEach(k => { if(o[k] !== undefined){ pal[k] = o[k]; delete o[k]; } }); o.pal = pal; return o; }
function lookIn(o){ o = palIn(o); if(o && o.look){ wantLook(o.look); if(!LOOKS[o.look]){ o = Object.assign({}, o); delete o.look; } } return o; }
// an unknown prop key: name the file it lives in when we know it
function noProp(key){ const f = FILE_OF[key]; if(f && !HAVE[f]) return new Error('IsoProps: prop "' + key + '" lives in IsoLook_' + f + ' — call Props.need([\'' + f + '\'], start) first');
  return new Error('IsoProps: no prop "' + key + '"'); }
/* 🧰 IsoProps TOOLS (ip-4, 🌳 IsoProps chat) — small shared painters every LOOK file uses (Props._K.T): dome · frustum · puffs · bubbles · bang · innBoard ·
   glowAt · halo (✨ fx glow painted after the rim) · anvil · porthole · ports · archDoor · F (whole-face decal) · line · polyP · ph (live phase) · lightOf (🍂 light level) */
const TOOLS = (function(){
const M = MAT, S2 = Math.SQRT2;
const vis = (T, nx, ny) => sideOf(T.nrm(nx, ny));
const F = (b, s) => s === 'front' || s === 'back' ? [b.x, b.w] : [b.y, b.d];   // a decal over a whole face (decal 'a' is a MODEL coordinate, not 0..1)
const line = (g, a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
const polyP = (g, pts) => { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); };
const ph = (t, period) => ((t || 0) / period) * TAU;   // live phase: use sin θ + cos θ together (a sin 2θ alone repeats inside one period → equal frames)
const lightOf = c => !c ? 1 : c.broken ? 0 : 0.5;     // 🍂 a light: fresh full · dry dim · ruined out

/* ---------- shared painters (world space through P, or screen space at a model point) ---------- */
// a dome sitting on z (2 : 1 base ellipse), light from the upper left like the tiles
function dome(g, P, k, cx, cy, z, r, h, col, o){ o = o || {}; const c = P(cx, cy, z), rx = r * HTW * k * S2, ry = rx / 2, hh = h * k, C = lit(col);
  g.beginPath(); g.moveTo(c[0] + rx, c[1]); g.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI, false); g.ellipse(c[0], c[1], rx, hh, 0, Math.PI, TAU, false); g.closePath();
  g.fillStyle = D.rad(g, c[0] - rx * 0.35, c[1] - hh * 0.62, 1, rx * 1.5, [[0, o.hi || C.top], [0.45, C.L], [1, C.R]]); g.fill(); g.strokeStyle = 'rgba(42,28,20,0.26)'; g.lineWidth = k; g.stroke(); return {c, rx, ry, hh}; }
// a cut cone (volcano, fountain tiers, tower bases): bottom radius r0 → top r1 over h px
function frustum(g, P, k, cx, cy, z, r0, r1, h, col, o){ o = o || {}; const c0 = P(cx, cy, z), c1 = [c0[0], c0[1] - h * k], a = r0 * HTW * k * S2, b = r1 * HTW * k * S2, C = lit(col);
  g.beginPath(); g.ellipse(c0[0], c0[1], a, a / 2, 0, 0, Math.PI); g.lineTo(c1[0] - b, c1[1]); g.ellipse(c1[0], c1[1], b, b / 2, 0, Math.PI, 0, true); g.closePath();
  const gr = g.createLinearGradient(c0[0] - a, 0, c0[0] + a, 0); gr.addColorStop(0, C.L); gr.addColorStop(0.45, sh(C.base, 0.05)); gr.addColorStop(1, C.R); g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(42,28,20,0.26)'; g.lineWidth = k; g.stroke();
  if(o.top !== false){ g.beginPath(); g.ellipse(c1[0], c1[1], b, b / 2, 0, 0, TAU); g.fillStyle = o.topFill || C.top; g.fill(); g.stroke(); } return {c0, c1, a, b}; }
function puffs(g, x, y, k, t, o){ o = o || {}; const p = (t || 0) / (o.period || 1.4) % 1; g.fillStyle = o.col || 'rgba(255,255,255,0.72)';
  for(let i = 0; i < (o.n || 3); i++){ const f = (i + p) / (o.n || 3); g.beginPath(); D.ell(g, x + Math.sin(f * 6 + i) * 2.6 * k + f * (o.drift || 4) * k, y - f * (o.rise || 18) * k, ((o.r || 2) + f * 3.2) * k, ((o.r || 2) * 0.8 + f * 2.2) * k); g.fill(); } }
function bubbles(g, x, y, k, t, o){ o = o || {}; const p = (t || 0) / (o.period || 1.6) % 1; g.strokeStyle = 'rgba(255,255,255,0.9)'; g.fillStyle = 'rgba(200,245,255,0.35)'; g.lineWidth = 0.9 * k;
  for(let i = 0; i < (o.n || 4); i++){ const f = (i / (o.n || 4) + p) % 1, r = (1.2 + i % 3 * 0.7 + f) * k; g.beginPath(); g.arc(x + Math.sin(f * 7 + i * 2) * 3 * k + (i - 1.5) * 2 * k, y - f * (o.rise || 26) * k, r, 0, TAU); g.fill(); g.stroke(); } }
// the "!" a quest board carries (drawn — rule 7)
function bang(g, x, y, k, o){ o = o || {}; D.txt(g, '!', x, y + (o.size || 12) * 0.36 * k, {size: (o.size || 12) * k, align: 'center', col: o.col || '#FFFFFF', w: 800, font: '"Baloo 2"'}); }
// INN board hanging from two ropes at a model point on the front (shape per country)
function innBoard(B, x, y, z, o){ o = o || {}; B.custom(x, y, (g, P, k, t, T) => { if(!vis(T, 0, 1) && !o.any) return; const c = P(x, y, z), w = (o.w || 32) * k, h = (o.h || 14) * k, top = c[1] - 4 * k, x0 = c[0] - w / 2;
  g.strokeStyle = o.rope || '#3A2A20'; g.lineWidth = 1.1 * k; line(g, [x0 + w * 0.15, c[1] - 9 * k], [x0 + w * 0.15, top]); line(g, [x0 + w * 0.85, c[1] - 9 * k], [x0 + w * 0.85, top]);
  g.fillStyle = o.fill || '#FFF6E4'; g.beginPath();
  if(o.shape === 'shell'){ g.moveTo(x0, top + h * 0.2); g.quadraticCurveTo(c[0], top - h * 0.8, x0 + w, top + h * 0.2); g.lineTo(x0 + w * 0.9, top + h); g.lineTo(x0 + w * 0.1, top + h); g.closePath(); }
  else if(o.shape === 'panel'){ D.rr(g, x0, top, w, h, h / 2); }
  else if(o.shape === 'shield'){ g.moveTo(x0, top); g.lineTo(x0 + w, top); g.lineTo(x0 + w, top + h * 0.6); g.quadraticCurveTo(x0 + w, top + h, c[0], top + h * 1.3); g.quadraticCurveTo(x0, top + h, x0, top + h * 0.6); g.closePath(); }
  else D.rr(g, x0, top, w, h, 3 * k);
  g.fill(); if(o.edge){ g.strokeStyle = o.edge; g.lineWidth = 1.3 * k; g.stroke(); }
  D.txt(g, 'INN', c[0], top + h * 0.5 + 3.6 * k, {size: (o.size || 10) * k, align: 'center', col: o.ink || '#2A1C14', w: 700}); }, {layer: o.layer == null ? 4 : o.layer});
  if(o.glow) halo(B, x, y, z, (o.w || 32) * 0.7, o.glow, 0.3, {dy: (o.h || 14) / 2 - 4}); }
function glowAt(B, x, y, z, r, col, a, layer){ B.custom(x, y, (g, P, k) => { const c = P(x, y, z); D.glow(g, c[0], c[1], r * k, col, a == null ? 0.7 : a); }, {fx: true, layer: layer == null ? 9 : layer}); }
// ✨ a glow at a model point (+ screen offset in px at zoom 1, + an optional pulse / bob by time) — {fx: true}: painted AFTER the rim, so a big glow never makes a dark halo
function halo(B, x, y, z, r, col, a, o){ o = o || {}; B.custom(x, y, (g, P, k, t) => { const c = P(x, y, z), f = o.pulse ? o.pulse(t || 0) : 1, dy = o.dyT ? o.dyT(t || 0) : 0; D.glow(g, c[0] + (o.dx || 0) * k, c[1] + ((o.dy || 0) + dy) * k, r * k * f, col, a); }, {fx: true, layer: 9}); }
function anvil(B, x, y, col){ B.box(x, y, 0, 0.3, 0.2, 8, col || M.wood, {layer: 1}); B.box(x - 0.04, y - 0.02, 8, 0.38, 0.24, 5, M.iron, {layer: 1}); }
// a round window (porthole) on a face at u (0..1 along), z — drawn as a 2 : 1-ish ellipse leaning with the face
function porthole(g, Q, k, u, z, r, rim, glass){ const c = Q(u, z), q = Q(u + 0.08, z), dx = q[0] - c[0], dy = q[1] - c[1], ang = Math.atan2(dy, dx);
  g.save(); g.translate(c[0], c[1]); g.transform(1, Math.tan(ang), 0, 1, 0, 0); g.fillStyle = rim; g.beginPath(); D.ell(g, 0, 0, r * k * 0.8, r * k); g.fill(); g.fillStyle = glass; g.beginPath(); D.ell(g, 0, 0, r * k * 0.58, r * k * 0.74); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); D.ell(g, -r * k * 0.2, -r * k * 0.25, r * k * 0.16, r * k * 0.22); g.fill(); g.restore(); }
// an arched doorway painted on a face (for round / stone things): the Q of a decal
function archDoor(fill, frame){ return (g, Q, k) => { const a = Q(0, 0), b = Q(1, 0), top = Q(0.5, 30), sp = Q(0, 20), sq = Q(1, 20);
  g.fillStyle = fill; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(sp[0], sp[1]); g.quadraticCurveTo(top[0] - (b[0] - a[0]) * 0.5, top[1] + (b[1] - a[1]) * 0.1, top[0], top[1]); g.quadraticCurveTo(top[0] + (b[0] - a[0]) * 0.5, top[1] - (b[1] - a[1]) * 0.1, sq[0], sq[1]); g.lineTo(b[0], b[1]); g.closePath(); g.fill();
  if(frame){ g.strokeStyle = frame; g.lineWidth = 2 * k; g.stroke(); } }; }
const ports = (list, rim, c) => (g, Q, k) => list.forEach(([u, z, r]) => porthole(g, Q, k, u, z, r || 5, rim, c ? (c.broken ? '#2A2A30' : '#8A9AA0') : '#9EE8F2'));
return {vis, F, line, polyP, ph, lightOf, dome, frustum, puffs, bubbles, bang, innBoard, glowAt, halo, anvil, porthole, archDoor, ports};
})();
/* ---------- 🖼️ pictures: model → canvas with ONE silhouette rim (zoom k, device scale s) ---------- */
// geometry at zoom 1: the picture is (W + Dd)·32 + 2·MX wide; anchor = the footprint's BACK corner (= IsoKit item x, y)
const MX = 34, MT = 26, MB = 12;
function geom(def, turn){ const T = turner(def.foot[0], def.foot[1], turn), W = T.W, Dd = T.D, top = def.h + MT + (def.over || 0);
  return {W, Dd, w: (W + Dd) * HTW + 2 * MX + (def.wide || 0) * 2, h: top + (W + Dd) * HTH + MB, ax: Dd * HTW + MX + (def.wide || 0), ay: top}; }
const hasDoc = typeof document !== 'undefined';
function mkCanvas(w, h){ const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; }
// 🗺️ a look may swap an organic prop for its own (palm → date palm on a desert map); a prop's own home look never swaps
function swapKey(key, look){ const L = LOOKS[look], d = DEFS[key]; if(!L || !L.swap || !d || d.look === look) return key; const k2 = L.swap[key]; return k2 && DEFS[k2] ? k2 : key; }
// 🔀 ip-3b STATES — a prop with def.states (['down', 'lifted'] · ['closed', 'open', 'new'] · [1 … 12]) REBUILDS its model per state, like a turn:
//   o.state picks one (unknown → def.state, else the first) · build(B, v, look) reads look.state · Props.setState(it, state, map) flips a placed one
function stateOf(def, s){ const S = def.states; if(!S) return null; if(s != null){ const i = S.indexOf(s), j = i < 0 ? S.indexOf(+s) : i; if(j >= 0) return S[j]; } return def.state != null ? def.state : S[0]; }
// 🪧 ip-3b TEXT — a prop with def.text draws a short word at bake (o.text, ≤ 10 letters, never emoji — rule 7); it re-bakes when the web font lands
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu;
function textOf(def, t){ if(def.text == null) return null; return String(t == null ? def.text : t).replace(EMOJI, '').trim().slice(0, 10) || String(def.text); }
// 🌱 ip-3c GROWING props (def.grow): the state IS the stage — '1' seed · '2' sprout · '3' young · '4a' / '5a' branch ① grown / giant · '4b' / '5b' branch ②.
//   {stage: 1–5, branch: 'a' | 'b' (also 1 | 2)} is sugar for that state in pic / item / place / canvas; stages 1–3 have no branch; 4–5 without a branch = 'a'
function branchOf(b){ return b === 'b' || b === 2 || b === '2' || b === 'B' ? 'b' : b == null ? null : 'a'; }
function growKey(def, stage, branch){ if(!def || !def.grow) return null; const n = Math.max(1, Math.min(def.grow.stages || 5, Math.round(+stage) || 1)); return n < (def.grow.branchAt || 4) ? String(n) : n + (branchOf(branch) || 'a'); }
function growInfo(def, st){ if(!def || !def.grow || st == null) return null; const s = String(st), n = parseInt(s, 10); return {stage: n, branch: s.length > 1 ? s.slice(1) : null}; }
function growOpt(def, o){ if(!def || !def.grow || !o || (o.stage == null && o.branch == null)) return o; const cur = growInfo(def, stateOf(def, o.state));
  return Object.assign({}, o, {state: growKey(def, o.stage != null ? o.stage : cur.stage, o.branch != null ? o.branch : cur.branch)}); }
// 🎬 the live layer only in the states that move (a growing plant sways once it is grown: def.liveStates)
function liveIn(def, st){ return !!def.live && (!def.liveStates || def.liveStates.indexOf(st) >= 0); }
// paint once (no cache): o = {v, turn, look, pal, t, k, s, rim, cond, state, text}
function paint(def, o){ o = o || {}; const turn = ((o.turn | 0) % 4 + 4) % 4, v = (o.v | 0) % Math.max(1, def.variants), s = o.s || 1, k = o.k || 1, G = geom(def, turn);
  const t0 = performance.now(), cw = Math.ceil(G.w * k * s), ch = Math.ceil(G.h * k * s);
  const out = mkCanvas(cw, ch), og = out.getContext('2d'), body = mkCanvas(cw, ch), bg = body.getContext('2d');
  og.scale(s, s); footShadow(og, G.ax * k, G.ay * k, k, G.W, G.Dd, def.organic, def.shadowA);
  bg.scale(s, s); TEXT_USED = false; const cond = condOf(o.cond), model = builder(), look = Object.assign({}, LOOKS[o.look || def.look || 'jungle'] || LOOKS.jungle, o.pal || {}, {cond, state: stateOf(def, o.state), text: textOf(def, o.text)});
  def.build(model, v, look); const fxParts = model.parts.filter(p => p.fx); if(fxParts.length) model.parts = model.parts.filter(p => !p.fx);   // ✨ ip-4: glow parts {fx: true} are painted AFTER the rim (a big glow made a dark halo)
  const ro = {ox: G.ax * k, oy: G.ay * k, k, turn, t: cond && cond.still ? 0 : o.t || 0, v, w: def.foot[0], d: def.foot[1], cond}; render(bg, model, ro);
  if(cond && cond.rubble && !def.organic && def.block === true && def.kind !== 'thing' && def.kind !== 'fence' && !def.noRubble) rubble(bg, G.ax * k, G.ay * k, k, G.W, G.Dd, 97 + v * 13 + turn);
  grade(body, cond); if(look.snow && def.snowcap !== false) snowcap(body, 3 * k * s);
  if(TEXT_USED) def._text = true; out._text = TEXT_USED;
  if(o.rim !== false){ const sil = mkCanvas(cw, ch), sg = sil.getContext('2d'); sg.drawImage(body, 0, 0); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = RIM; sg.fillRect(0, 0, cw, ch);
    const r = 1.5 * k * s; for(let i = 0; i < 8; i++){ const a = i * TAU / 8; og.setTransform(1, 0, 0, 1, 0, 0); og.drawImage(sil, Math.cos(a) * r, Math.sin(a) * r); } }
  og.setTransform(1, 0, 0, 1, 0, 0); og.drawImage(body, 0, 0);
  if(fxParts.length){ const fx = mkCanvas(cw, ch), fg = fx.getContext('2d'); fg.scale(s, s); render(fg, {parts: fxParts}, ro); og.drawImage(fx, 0, 0); }
  out._ms = performance.now() - t0; out._g = G; out._k = k; out._s = s; out._pad = 0; return out; }
// cached canvas (cards, thumbnails, sheets) — a small LRU so a catalogue page never grows memory forever
const CACHE = new Map(), CACHE_MAX = 240;
function canvasOf(def, o){ o = lookIn(o || {}); if(o.look) def = DEFS[swapKey(def.key, o.look)]; o = growOpt(def, o); const id = [def.key, o.cond || '', o.turn | 0, (o.v | 0) % Math.max(1, def.variants), o.s || 1, o.k || 1, o.t || 0, o.rim === false ? 0 : 1, o.look || '', o.pal ? JSON.stringify(o.pal) : '', stateOf(def, o.state) == null ? '' : stateOf(def, o.state), textOf(def, o.text) || ''].join('|');
  let c = CACHE.get(id); if(c){ CACHE.delete(id); CACHE.set(id, c); return c; }
  c = paint(def, o); CACHE.set(id, c); if(CACHE.size > CACHE_MAX) CACHE.delete(CACHE.keys().next().value); return c; }
// an IsoKit picture (duck-types Iso.sprite: bake(step, lazy) → canvas with _s / _pad). Same prop + variant + turn + look = ONE shared picture.
const PICTS = new Map(), PICT_MAX = 600; let bakeT = 0, bakeN = 0;
function pic(key, o){ o = lookIn(o || {}); if(!DEFS[key]) throw noProp(key); if(o.look) key = swapKey(key, o.look); const def = DEFS[key]; o = growOpt(def, o);
  const turn = ((o.turn | 0) % 4 + 4) % 4, v = (o.v | 0) % Math.max(1, def.variants), look = o.look || def.look || 'jungle', cond = condOf(o.cond), t = cond && cond.still ? 0 : o.t || 0, st = stateOf(def, o.state), tx = textOf(def, o.text);
  const id = 'ip:' + key + ':' + turn + ':' + v + ':' + look + ':' + t + (cond ? ':' + cond.key : '') + (o.pal ? ':' + JSON.stringify(o.pal) : '') + (st != null ? ':s=' + st : '') + (tx != null ? ':w=' + tx : ''); let P = PICTS.get(id); if(P) return P;
  const G = geom(def, turn), po = {turn, v, look, t, pal: o.pal, cond: cond ? cond.key : null, state: st, text: tx};
  P = {key: id, prop: key, w: G.w, h: G.h, ax: G.ax, ay: G.ay, by: new Map(), def, o: po};
  P.bake = (s, lazy) => { let c = P.by.get(s); if(c) return c;
    if(lazy && P.by.size){ const n = performance.now(); if(n - bakeT > 12){ bakeT = n; bakeN = 0; } if(bakeN >= 4) return P.by.values().next().value; }   // a few new bakes a frame; stretch the rest
    bakeN++; c = paint(def, Object.assign({}, po, {s, k: 1})); P.by.set(s, c); if(P.by.size > 3){ const first = P.by.keys().next().value; if(first !== s) P.by.delete(first); } return c; };
  PICTS.set(id, P); if(PICTS.size > PICT_MAX) PICTS.delete(PICTS.keys().next().value); return P; }
// 🔤 words on signs: bake again once the web font has landed (a picture baked with the fall-back font would keep it)
function fontsLanded(){ PICTS.forEach(P => { if(P.def._text) P.by.clear(); }); for(const [id, c] of [...CACHE]) if(c._text) CACHE.delete(id); MASKS.clear(); }
if(hasDoc && document.fonts){ try{ document.fonts.ready.then(fontsLanded); document.fonts.addEventListener('loadingdone', fontsLanded); }catch(e){} }

/* ---------- 🧍 on a map: items, footprints, doors ---------- */
function doorOf(def, T, i, j){ if(!def.door) return null; const p = T.pt(def.door[0], def.door[1]), W = T.W, Dd = T.D, e = 1e-6;
  const onY = Math.abs(p[1]) < e || Math.abs(p[1] - Dd) < e, s = onY ? (p[1] > Dd / 2 ? 1 : -1) : (p[0] > W / 2 ? 1 : -1);
  const a = Math.max(0, Math.min(Math.floor((onY ? p[0] : p[1]) + e), (onY ? W : Dd) - 1));
  const inn = onY ? [a, s > 0 ? Dd - 1 : 0] : [s > 0 ? W - 1 : 0, a], out = onY ? [a, s > 0 ? Dd : -1] : [s > 0 ? W : -1, a];
  return {i: i + inn[0], j: j + inn[1], out: {i: i + out[0], j: j + out[1]}}; }
// footprint cells in WORLD cells, each marked: does it block walkers?
function cellsOf(def, T, i, j){ const out = [], w = def.foot[0], d = def.foot[1];
  for(let mx = 0; mx < w; mx++) for(let my = 0; my < d; my++){ const q = T.pt(mx + 0.5, my + 0.5), a = i + Math.floor(q[0]), b = j + Math.floor(q[1]);
    const blk = def.block === true || (def.block === 'posts' && (mx === 0 || mx === w - 1)); out.push([a, b, blk]); }
  return out; }
// 🎯 ip-3b ANCHORS (TD-Stories book 2): def.stand = [x, y, zPx] where a hero stands ON the prop · def.aim = [x, y, zPx] where shots start (default = stand)
//   → it.stand / it.aim = {x, y, z} in WORLD units (z in IsoKit levels, 16 px each, ground height included), turned with the prop · it.mid = the footprint centre
function anchors(it, def, T){ const at = a => { const q = T.pt(a[0], a[1]); return {x: it.x + q[0], y: it.y + q[1], z: (it.z || 0) + (a[2] || 0) / 16}; };
  it.mid = {x: it.x + it.w / 2, y: it.y + it.d / 2, z: it.z || 0};
  const aim = (def.aims && it.state != null && def.aims[it.state]) || def.aim || def.stand;   // 🌱 ip-3c: a growing plant shoots from its top — def.aims[state]
  if(def.stand) it.stand = at(def.stand); if(aim) it.aim = at(aim); return it; }
function item(key, i, j, o){ o = lookIn(o || {}); if(!DEFS[key]) throw noProp(key); const asked = key; if(o.look) key = swapKey(key, o.look); const def = DEFS[key]; o = growOpt(def, o);
  const turn = ((o.turn | 0) % 4 + 4) % 4, T = turner(def.foot[0], def.foot[1], turn), v = (o.v | 0) % Math.max(1, def.variants), look = o.look || def.look || 'jungle', cond = condOf(o.cond);
  const it = {x: i, y: j, z: o.z || 0, w: T.W, d: T.D, pic: null, prop: key, asked, v, turn, look, cond: cond ? cond.key : null, pal: o.pal, tall: def.h >= 50, alpha: 1, door: doorOf(def, T, i, j),
    state: stateOf(def, o.state), text: textOf(def, o.text)};
  const gi = growInfo(def, it.state); if(gi){ it.stage = gi.stage; it.branch = gi.branch; it.grow = def.grow; }
  anchors(it, def, T);
  const po = {turn, v, look, pal: o.pal, cond: it.cond, state: it.state, text: it.text};
  if(liveIn(def, it.state) && !(cond && cond.still)){ const N = def.live.frames || 6; it.frames = []; for(let n = 0; n < N; n++) it.frames.push(pic(key, Object.assign({}, po, {t: Math.round(def.live.period * n / N * 1000) / 1000})));
    it.frames.forEach(P => { P.sib = it.frames; }); it.pic = it.frames[0]; }
  else it.pic = pic(key, po);
  return it; }
// 🌊 cells a prop may stand on: walkable ground; bridges + docks may also stand on water
function liquidAt(M, a, b){ const c = M.get(a, b); return !!c && (c.t === 'water' || c.t === 'moat' || c.t === 'lava'); }
function fits(M, key, i, j, o){ o = lookIn(o || {}); if(o.look && DEFS[key]) key = swapKey(key, o.look); const def = DEFS[key]; if(!def){ if(FILE_OF[key]) warnOnce('prop:' + key, noProp(key).message.replace('IsoProps: ', '')); return false; } const T = turner(def.foot[0], def.foot[1], o.turn), cells = cellsOf(def, T, i, j), occ = M._props || {};
  let h = null; for(const [a, b] of cells){ if(!M.inside(a, b)) return false; if(occ[b * M.w + a] && occ[b * M.w + a] !== o.ignore) return false;
    const c = M.get(a, b); if(c.t === 'void') return false; const wet = liquidAt(M, a, b);
    if(wet ? !(def.kind === 'bridge') : !M.walk(a, b)) return false;
    const hh = wet ? 0 : c.h; if(h == null) h = hh; else if(hh !== h && !wet) return false; }   // flat ground only
  return true; }
function place(M, key, i, j, o){ o = lookIn(o || {}); if(!fits(M, key, i, j, o)) return null; const def = DEFS[o.look ? swapKey(key, o.look) : key], T = turner(def.foot[0], def.foot[1], o.turn); o = growOpt(def, o);
  const cells = cellsOf(def, T, i, j); let z = 0; cells.forEach(([a, b]) => { if(!liquidAt(M, a, b)) z = Math.max(z, M.get(a, b).h || 0); });
  const it = item(key, i, j, Object.assign({}, o, {z})); M._props = M._props || {}; it.cells = []; const walkNow = !!def.walkStates && def.walkStates.indexOf(it.state) >= 0;   // 🌾 a flattened bale / an open gate lets walkers through
  cells.forEach(([a, b, blk]) => { const k = b * M.w + a, isDoor = it.door && it.door.i === a && it.door.j === b, c0 = M.get(a, b), prev = c0.block || 0;
    M._props[k] = it; it.cells.push([a, b, prev, c0.cost]); if(blk && !walkNow && !isDoor && !liquidAt(M, a, b)) M.set(a, b, {block: 1});
    if(def.cost && !liquidAt(M, a, b)) M.set(a, b, {cost: def.cost}); });   // 🐷 ip-3b: mud slows walkers (IsoKit paths read the cost)
  it.map = M; deckCells(M, it, def); return it; }
// 🌉 ip-3b a DECK prop (plank bridge) makes the water under it walkable while its state is in def.deck ('down'); lifted → blocked again
function deckCells(M, it, def){ if(!def.deck || !it.cells) return; const on = def.deck.indexOf(it.state) >= 0; it.cells.forEach(([a, b]) => { if(liquidAt(M, a, b)) M.set(a, b, {block: on ? 0 : 1}); }); }
function remove(M, it){ if(!it || !it.cells) return; it.cells.forEach(([a, b, prev, cost]) => { const k = b * M.w + a; if(M._props && M._props[k] === it) delete M._props[k]; if(!M.inside(a, b)) return;
    if((M.get(a, b).block || 0) !== prev) M.set(a, b, {block: prev}); if(cost != null && M.get(a, b).cost !== cost) M.set(a, b, {cost}); }); it.cells = null; it.map = null; }
// 🔀 ip-3b flip a placed (or plain) item to another state in place: new picture(s), anchors, and its map cells (a lifted bridge blocks again)
function setState(it, state, M){ const def = DEFS[it.prop]; if(!def || !def.states) return it; const st = stateOf(def, state); if(st === it.state) return it; M = M || it.map;
  const o = {v: it.v, turn: it.turn, look: it.look, z: it.z, cond: it.cond, pal: it.pal, state: st, text: it.text};
  const fresh = n => { ['frames', 'stand', 'aim', 'stage', 'branch'].forEach(f => { if(!(f in n)) delete it[f]; }); };   // ip-3c: a stage without a live layer must not keep the old frames
  if(M && it.cells){ remove(M, it); const n = place(M, it.prop, it.x, it.y, o); if(n){ const keep = {alpha: it.alpha, role: it.role, popT: it.popT, morph: it.morph}; fresh(n); Object.assign(it, n, keep); it.cells.forEach(([a, b]) => { M._props[b * M.w + a] = it; }); return it; } }
  const n = item(it.prop, it.x, it.y, o); fresh(n); ['state', 'pic', 'frames', 'stand', 'aim', 'mid', 'stage', 'branch'].forEach(f => { if(f in n) it[f] = n[f]; }); return it; }
// 🌱 ip-3c grow a placed (or plain) growing prop to a stage (1–5) on a branch ('a' | 'b', kept when left out): same footprint, new shape + aim;
//   it.morph = {from, to, t0} for the game's ✨ morph moment (Props.morphFx). Not a growing prop → unchanged. Returns it.
function grow(it, stage, branch, M){ const def = DEFS[it.prop]; if(!def || !def.grow) return it; const to = growKey(def, stage, branch != null ? branch : it.branch), from = it.state;
  if(to === from) return it; setState(it, to, M); it.morph = {from, to: it.state, t0: typeof performance !== 'undefined' ? performance.now() / 1000 : 0}; return it; }
// the stages of a growing prop as data (cards, upgrade sheets): [{state, stage, branch, name, col (SkillKit letter), colHex, h, aim}]
function stages(key){ const def = DEFS[key]; if(!def || !def.grow) return []; const G = def.grow;
  return def.states.map(st => { const i = growInfo(def, st); return {state: st, stage: i.stage, branch: i.branch, name: G.names[st], col: G.col[st] || null, colHex: G.colHex[st] || null, h: G.h[st], aim: def.aims ? def.aims[st].slice() : null}; }); }
// ✨ ip-3c the MORPH moment (🐣 rule): a white silhouette of the NEW shape swells, then bursts into sparkles + confetti in the branch colour.
//   Call in Iso.frame's overlay / airFx with p = 0 → 1 over the moment (rule: 1.2 s; 🌱 Basic 0.6 s with o.flash = false = no white flash). Returns p < 1.
const SIL = new WeakMap();
function morphFx(g, view, it, p, o){ o = o || {}; if(p < 0 || p >= 1) return false; const def = DEFS[it.prop]; if(!def) return false; const z = view.zoom, s = view.dpr || 1;
  const c = canvasOf(def, {v: it.v, turn: it.turn, look: it.look, cond: it.cond, state: it.state, text: it.text, k: z, s}), q = view.toScreen(it.x, it.y, it.z || 0), G = c._g;
  const x0 = q.x - G.ax * z, y0 = q.y - G.ay * z, w = c.width / s, h = c.height / s, gp = view.toScreen(it.x + it.w / 2, it.y + it.d / 2, it.z || 0), top = (G.ay - (def.grow ? def.grow.h[it.state] || def.h : def.h)) * z;
  const col = o.color || (def.grow && def.grow.colHex[it.state]) || '#FFD34D';
  if(o.flash !== false){ let W = SIL.get(c); if(!W){ W = mkCanvas(c.width, c.height); const wg = W.getContext('2d'); wg.drawImage(c, 0, 0); wg.globalCompositeOperation = 'source-in'; wg.fillStyle = '#FFFFFF'; wg.fillRect(0, 0, W.width, W.height); SIL.set(c, W); }
    const a = p < 0.45 ? 0.25 + 0.65 * p / 0.45 : 0.9 * (1 - (p - 0.45) / 0.55), sc = 1 + 0.2 * (p < 0.45 ? p / 0.45 : 1 - (p - 0.45) / 0.55);
    g.save(); g.globalAlpha = Math.max(0, a); g.translate(gp.x, gp.y); g.scale(sc, sc); g.translate(-gp.x, -gp.y); g.drawImage(W, x0, y0, w, h); g.restore(); }
  if(p >= 0.4){ const b = (p - 0.4) / 0.6, cy = y0 + (top + G.ay * z) / 2, R = (14 + 46 * b) * z, R2 = D.rnd(7 + (it.x * 31 + it.y * 17 | 0));
    g.save(); g.globalAlpha = 1 - b * b;
    for(let i = 0; i < 10; i++){ const a = i / 10 * TAU + 0.3, r = R * (0.75 + R2() * 0.4), x = gp.x + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.7, sz = (3 + R2() * 3) * z * (1 - b * 0.5);
      g.fillStyle = i % 3 ? '#FFF4B8' : '#FFFFFF'; g.beginPath(); D.star(g, x, y, sz, sz * 0.32, 4, b * 2); g.fill(); }
    for(let i = 0; i < 12; i++){ const a = R2() * TAU, r = R * (0.3 + R2() * 0.7), x = gp.x + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.6 + b * b * 18 * z;
      g.fillStyle = i % 2 ? col : '#FFD34D'; g.fillRect(x - 1.6 * z, y - 1 * z, 3.2 * z, 2 * z); }
    g.restore(); }
  return true; }
// 🎯 ip-3b range ring for tower placing: the ground circle of `range` tiles round it.aim (or the centre), as the screen ellipse of the view
//   → {x, y, rx, ry, cx, cy, range, has(x, y)}; with o.g (the groundFx / airFx context of Iso.frame) it also draws it (o.color, o.fill, o.dash, o.width)
function ring(view, it, range, o){ o = o || {}; const a = it.aim || it.mid || {x: it.x + it.w / 2, y: it.y + it.d / 2}, z = it.z || 0, c = view.toScreen(a.x, a.y, z), rx = range * HTW * Math.SQRT2 * view.zoom, ry = rx / 2;
  const R = {x: c.x, y: c.y, rx, ry, cx: a.x, cy: a.y, range, has: (x, y) => Math.hypot(x - a.x, y - a.y) <= range};
  if(o.g){ const g = o.g, col = o.color || '#FFC845'; g.save(); g.beginPath(); g.ellipse(c.x, c.y, rx, ry, 0, 0, TAU); g.fillStyle = o.fill || rgbaHex(col, 0.16); g.fill();
    g.setLineDash(o.dash || [10, 7]); g.lineWidth = o.width || 2.5; g.strokeStyle = col; g.stroke(); g.setLineDash([]); g.restore(); }
  return R; }
function rgbaHex(h, a){ return D.rgba(h, a); }
// which placed prop covers a cell (for taps)
function at(M, a, b){ return (M._props || {})[b * M.w + a] || null; }

/* ---------- 🫥 never lose your hero: a tall prop drawn AFTER a walker fades only when its PAINTED pixels cover the walker ---------- */
const MASKS = new Map();
function maskOf(it){ const P = it.pic; let m = MASKS.get(P.key); if(m) return m; const c = paint(DEFS[it.prop], Object.assign({}, P.o, {s: 0.5, k: 1})), w = c.width, h = c.height, d = c.getContext('2d').getImageData(0, 0, w, h).data, a = new Uint8Array(w * h);
  for(let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] > 140 ? 1 : 0; m = {w, h, a, s: 0.5}; MASKS.set(P.key, m); if(MASKS.size > 300) MASKS.delete(MASKS.keys().next().value); return m; }
function covers(it, wk, view, hy){ const z = view.zoom, m = maskOf(it), q = view.toScreen(it.x, it.y, it.z || 0), p = view.toScreen(wk.x, wk.y, wk.z || 0);
  let hit = 0; for(const f of [0.25, 0.55, 0.85]){ const sx = p.x, sy = p.y - hy * f * z, u = Math.round(((sx - q.x) / z + it.pic.ax) * m.s), v = Math.round(((sy - q.y) / z + it.pic.ay) * m.s);
    if(u >= 0 && v >= 0 && u < m.w && v < m.h && m.a[v * m.w + u]) hit++; } return hit >= 1; }
function seeThrough(view, items, walkers, o){ o = o || {}; const a = o.alpha == null ? 0.45 : o.alpha, hy = o.h || 48; let n = 0;
  items.forEach(it => { if(!it.prop) return; it.alpha = 1; if(!it.tall) return;
    for(const w of walkers){ if(Iso.drawOrder(w, it) < 0 && Math.abs(w.x - it.x - it.w / 2) < it.w / 2 + 3 && Math.abs(w.y - it.y - it.d / 2) < it.d / 2 + 3 && covers(it, w, view, hy)){ it.alpha = a; n++; break; } } });
  return n; }
// 👆 which prop is under a screen point (CSS px in the view) — by its PAINTED pixels, front-most first (tap a roof → that house)
function hit(view, items, px, py){ for(let n = items.length - 1; n >= 0; n--){ const it = items[n]; if(!it.prop || it.hidden) continue;
    const m = maskOf(it), q = view.toScreen(it.x, it.y, it.z || 0), z = view.zoom, u = Math.round(((px - q.x) / z + it.pic.ax) * m.s), v = Math.round(((py - q.y) / z + it.pic.ay) * m.s);
    if(u >= 0 && v >= 0 && u < m.w && v < m.h && m.a[v * m.w + u]) return it; }
  return null; }
// 🎬 the tiny live layer: palm sway · flags · smoke · boat bob · elephant steps (frames baked like any picture; still when the budget is low)
function tick(items, t){ const calm = typeof Iso !== 'undefined' && Iso.budget && Iso.budget.fx < 0.6;
  for(const it of items){ if(!it.frames) continue; const L = DEFS[it.prop].live, N = it.frames.length; it.pic = calm ? it.frames[0] : it.frames[Math.floor(((t % L.period) + L.period) % L.period / L.period * N) % N]; } }
function warm(items, view, o){ const set = new Set(); items.forEach(it => { if(it.frames) it.frames.forEach(P => set.add(P)); else if(it.pic && it.prop) set.add(it.pic); }); return Iso.warm([...set], view, o || {}); }

/* ---------- 🍂 the ground follows the condition too (Aowu: "no life feeling" — a dead town on bright green grass is not dead) ----------
   Props.ground(theme, cond) → an IsoKit theme key '<theme>~<cond>' (grass → straw / ash, water → murky, snow → dirty) registered once with IsoKit's
   PUBLIC Iso.addTheme — IsoKit's own file is untouched. Use it when you make the map: Iso.map({theme: Props.ground('meadow', 'ruined'), …}).
   A condition may carry its own ground: addCondition(key, {ground: {grass: {top, top2, lip, side, deco}, …}}). */
const GROUND_FX = {
  dry: {grass: {top: '#CBBE70', top2: '#BDB062', lip: '#A89A52', deco: 'dot'}, flower: {top: '#CFC274', top2: '#C1B466', lip: '#A89A52', deco: 'dot'}, lawn: {top: '#C2B86E', top2: '#B4AA60'},
    water: {top: '#93B2A2', top2: '#84A494'}, moat: {top: '#93B2A2', top2: '#84A494'}, sand: {top: '#F2DDA8', top2: '#E8D096'}, dirt: {top: '#C9A672', top2: '#BC9864'}},
  ruined: {grass: {top: '#9C9486', top2: '#8E8678', lip: '#7C7468', side: '#6E6052', deco: 'crack'}, flower: {top: '#A0988A', top2: '#928A7C', lip: '#7C7468', side: '#6E6052', deco: 'crack'}, lawn: {top: '#98907F', top2: '#8A8272'},
    path: {top: '#B9AC94', top2: '#AB9E86'}, sand: {top: '#CEC2A2', top2: '#C2B694', deco: 'crack'}, dirt: {top: '#8E7C66', top2: '#82705A'}, stone: {top: '#A8A49C', top2: '#9A968E'},
    water: {top: '#6E7468', top2: '#62685C'}, moat: {top: '#6E7468', top2: '#62685C'}, snow: {top: '#D9D6D0', top2: '#CCC8C0', deco: 'crack'}},
};
const SNOWY = {dry: {}, ruined: {top: '#D9D6D0', top2: '#CCC8C0', lip: '#BDB8B0', deco: 'crack'}};
function ground(theme, cond){ theme = theme || 'meadow'; const c = condOf(cond); if(!c || typeof Iso === 'undefined' || !Iso.addTheme) return theme; const key = theme + '~' + c.key; if(Iso.THEMES[key]) return key;
  const base = Iso.THEMES[theme] || Iso.THEMES.meadow, kind = c.holes ? 'ruined' : 'dry', fx = c.ground || GROUND_FX[c.key] || GROUND_FX[kind], tile = {};
  const snowy = t => { const o = (base.tile || {})[t]; return !!o && !!o.top && parseInt(o.top.slice(1, 3), 16) > 215 && parseInt(o.top.slice(5, 7), 16) > 215; };   // a snow map's grass is white: it gets dirty, never straw
  const bare = t => { const o = (base.tile || {})[t]; if(!o || !o.top || snowy(t)) return false; const n = parseInt(o.top.slice(1), 16), r = n >> 16 & 255, gg = n >> 8 & 255, b = n & 255; return !(gg > r && gg > b); };   // ip-4: rock / dust ground (lava, moon) has no grass to dry out → keeps its own tiles
  Object.keys(fx).forEach(t => { if(bare(t) && !c.ground) return; tile[t] = Object.assign({}, (base.tile || {})[t] || {}, snowy(t) ? (c.ground ? fx[t] : SNOWY[kind]) : fx[t]); });
  Iso.addTheme(key, {tile, bg: kind === 'ruined' ? ['#9AA0A8', '#D8D4CE'] : ['#F2D8A8', '#FFF4DC']}, theme); return key; }

/* ---------- 📚 the catalogue as data + 📏 rule checks ---------- */
const KINDS = {deco: [0, 24], post: [0, 50], sign: [0, 50], thing: [0, 50], fence: [0, 50], bridge: [0, 50], bush: [20, 36], tree: [50, 90], building: [0, 140], gate: [0, 140], landmark: [0, 200], grow: [0, 110]};
function sizeRange(def){ if(def.tags.indexOf('house') >= 0 && def.tags.indexOf('big') < 0) return [70, 110]; return KINDS[def.kind] || [0, 200]; }
function meta(def){ return {key: def.key, name: def.name, set: def.set, look: def.look || null, kind: def.kind, foot: def.foot.slice(), h: def.h, variants: def.variants, block: def.block, door: def.door || null, tags: def.tags.slice(), organic: !!def.organic, live: !!def.live,
  states: def.states ? def.states.slice() : null, state: def.states ? stateOf(def) : null, text: def.text == null ? null : def.text, stand: !!def.stand, aim: !!(def.aim || def.stand || def.aims), cost: def.cost || 1, deck: def.deck ? def.deck.slice() : null, grow: def.grow ? {line: def.grow.line, cost: def.grow.cost, stages: def.grow.stages, branchAt: def.grow.branchAt} : null}; }
function list(f){ f = f || {}; const keys = f.set ? (SETS[f.set] || {props: []}).props : Object.keys(DEFS);
  return keys.map(k => DEFS[k]).filter(d => (!f.kind || d.kind === f.kind) && (!f.tag || d.tags.indexOf(f.tag) >= 0)).map(meta); }
// a prop's rule check: size range for its kind · nothing clipped at any turn / variant · the rim is there · bake time
function check(key){ const def = DEFS[key], problems = []; if(!def) return {ok: false, problems: ['no prop ' + key]};
  const r = sizeRange(def); if(def.h < r[0] || def.h > r[1]) problems.push('height ' + def.h + ' outside ' + r[0] + '–' + r[1] + ' for a ' + (r[0] === 70 ? 'house' : def.kind));
  const times = []; let rim = false;
  for(const state of (def.states || [null])) for(let turn = 0; turn < 4; turn++) for(let v = 0; v < def.variants; v++){ const c = paint(def, {turn, v, k: 1, s: 1, state}); times.push(c._ms);
    const g = c.getContext('2d'), W = c.width, H = c.height, d = g.getImageData(0, 0, W, H).data, A = (x, y) => d[(y * W + x) * 4 + 3];
    let edge = 0; for(let x = 0; x < W; x++){ if(A(x, 0) > 30) edge++; if(A(x, H - 1) > 30) edge++; } for(let y = 0; y < H; y++){ if(A(0, y) > 30) edge++; if(A(W - 1, y) > 30) edge++; }
    if(edge) problems.push('clipped at turn ' + turn + ' v' + v + (state != null ? ' state ' + state : '') + ' (' + edge + ' px on the edge)');
    if(!rim) for(let i = 0; i < d.length; i += 4) if(d[i + 3] > 200 && Math.abs(d[i] - 42) < 6 && Math.abs(d[i + 1] - 28) < 6 && Math.abs(d[i + 2] - 20) < 6){ rim = true; break; } }
  times.sort((x, y) => x - y); const ms = times[times.length >> 1];   // the usual bake (median — one slow frame of the browser is not the prop)
  if(!rim) problems.push('no rim'); if(ms > 12) problems.push('bake ' + ms.toFixed(1) + ' ms (> 12)');
  return {ok: !problems.length, problems, ms, msMax: times[times.length - 1]}; }
/* ---------- 🔍 ip-5 DIFFS — which changes of a prop are FAIR for spot-the-difference (🌳 IsoProps chat, 2026-11-20, for 🔍 Pokadif — and any game) ----------
   A prop may list what a game is allowed to change:  def.diffs = [{by: 'state', a, b, level: 'bold' | 'quiet', name} · {by: 'v', level, name} · {by: 'text', level, name}]
   (no list → every state vs its default + every variant vs v 0 + a text prop's one-letter change, level 'auto').
   EVERY prop also offers the generic changes (Aowu 11:41 "Pokadif can use any part of the iso"): 'gone' (the prop is there ↔ not there — also = 'extra' read the other way) ·
   'turn' (a building rebuilt facing the next way; moves: true when its footprint is not square) · 'cond' (fresh ↔ dry quiet · fresh ↔ ruined bold).
   Props.diffs(key, {turn, look, cond, v, state, text, pal, k: zoom, kinds: ['state', 'v', 'text', 'gone', 'turn', 'cond'], ground: [r, g, b]})
     → [{by, a, b, level, name, px, box: [x, y, w, h], c: [x, y], r, ok, A, B, moves}]   (px measured at the zoom k the game paints at; box / c / r in the A picture's frame
        from its anchor = Props.canvas(...)._g.ax / ay × k; ok = px ≥ Props.DIFF_MIN — a game takes only the ok ones; A / B = the options to paint each side)
   Props.diffPair(key, optsA, optsB | null) → {px, box, c, r}  ·  Props.DIFF_MIN = 45 (Pokadif's law: ≥ 45 changed px, nothing else changes)
   A pixel counts when, laid on the same ground colour, one colour channel moves ≥ 14 (Pokadif's quiet colour step ≈ ΔE 8–12 also counts). Results are cached. */
const DIFF_MIN = 45, DIFF_STEP = 14, DIFF_GROUND = [156, 203, 140], DIFF_CACHE = new Map();
function diffPix(cv){ return cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; }
function diffPair(key, A, B, ground){ const GR = ground || DIFF_GROUND, ca = canvasOf(DEFS[key], Object.assign({t: 0}, A, {s: 1})), cb = B ? canvasOf(DEFS[key], Object.assign({t: 0}, B, {s: 1})) : null;
  const k = (A && A.k) || 1, ga = ca._g, gb = cb ? cb._g : ga, ax = ga.ax * k, ay = ga.ay * k, bx = cb ? gb.ax * k : ax, by = cb ? gb.ay * k : ay;
  // one frame round both pictures, lined up on their anchors
  const ox = Math.max(ax, bx), oy = Math.max(ay, by), W = Math.ceil(ox + Math.max(ca.width - ax, cb ? cb.width - bx : 0)), H = Math.ceil(oy + Math.max(ca.height - ay, cb ? cb.height - by : 0));
  const da = diffPix(ca), db = cb ? diffPix(cb) : null, dxa = Math.round(ox - ax), dya = Math.round(oy - ay), dxb = Math.round(ox - bx), dyb = Math.round(oy - by);
  const at = (d, w, h, x, y) => { if(!d || x < 0 || y < 0 || x >= w || y >= h) return GR; const i = (y * w + x) * 4, a = d[i + 3] / 255; return [d[i] * a + GR[0] * (1 - a), d[i + 1] * a + GR[1] * (1 - a), d[i + 2] * a + GR[2] * (1 - a)]; };
  let px = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, sx = 0, sy = 0;
  for(let y = 0; y < H; y++) for(let x = 0; x < W; x++){ const p = at(da, ca.width, ca.height, x - dxa, y - dya), q = cb ? at(db, cb.width, cb.height, x - dxb, y - dyb) : GR;
    if(Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[2] - q[2])) >= DIFF_STEP){ px++; sx += x; sy += y; if(x < x0) x0 = x; if(y < y0) y0 = y; if(x > x1) x1 = x; if(y > y1) y1 = y; } }
  const box = px ? [x0 - ox, y0 - oy, x1 - x0 + 1, y1 - y0 + 1] : null;
  return {px, box, c: px ? [sx / px - ox, sy / px - oy] : null, r: box ? Math.max(13, Math.hypot(box[2], box[3]) / 2 + 3) : 0}; }
function oneLetter(s){ s = String(s); const i = s.length >> 1, ch = s[i], nx = ch === 'Z' ? 'Y' : ch === 'O' ? 'Q' : ch === 'E' ? 'F' : ch === 'I' ? 'L' : ch === 'S' ? '5' : String.fromCharCode(ch.charCodeAt(0) + 1); return s.slice(0, i) + nx + s.slice(i + 1); }
function diffList(def, o){ const out = [], base = {turn: o.turn | 0, look: o.look, cond: o.cond, pal: o.pal, k: o.k || 1}, st0 = stateOf(def, o.state), v0 = o.v | 0, side = (x) => Object.assign({}, base, {v: v0, state: st0, text: o.text}, x);
  const want = o.kinds || ['state', 'v', 'text', 'gone', 'turn', 'cond'], has = k => want.indexOf(k) >= 0, list = def.diffs || [];
  if(list.length) list.forEach(d => { if(!has(d.by)) return;
    if(d.by === 'state') out.push(Object.assign({}, d, {A: side({state: d.a}), B: side({state: d.b})}));
    else if(d.by === 'v') for(let v = 0; v < def.variants; v++){ if(v !== v0) out.push(Object.assign({}, d, {a: 'v' + v0, b: 'v' + v, A: side({}), B: side({v})})); }
    else if(d.by === 'text' && def.text != null){ const t0 = textOf(def, o.text); out.push(Object.assign({}, d, {a: t0, b: oneLetter(t0), A: side({text: t0}), B: side({text: oneLetter(t0)})})); } });
  else { if(def.states && has('state')) def.states.filter(s => s !== st0).forEach(s => out.push({by: 'state', a: st0, b: s, level: 'auto', name: 'state', A: side({}), B: side({state: s})}));
    if(has('v')) for(let v = 0; v < def.variants; v++){ if(v !== v0) out.push({by: 'v', a: 'v' + v0, b: 'v' + v, level: 'auto', name: 'variant', A: side({}), B: side({v})}); }
    if(def.text != null && has('text')){ const t0 = textOf(def, o.text); out.push({by: 'text', a: t0, b: oneLetter(t0), level: 'auto', name: 'sign word', A: side({text: t0}), B: side({text: oneLetter(t0)})}); } }
  if(has('gone')) out.push({by: 'gone', a: 'there', b: 'gone', level: 'bold', name: 'gone (or extra, the other way)', A: side({}), B: null});
  if(has('turn') && !def.organic && (def.turns || 4) > 1){ const t1 = ((o.turn | 0) + 1) % 4; out.push({by: 'turn', a: o.turn | 0, b: t1, level: 'bold', name: 'turned', A: side({}), B: side({turn: t1}), moves: def.foot[0] !== def.foot[1]}); }
  if(has('cond') && !o.cond) [['dry', 'quiet'], ['ruined', 'bold']].forEach(([c, lv]) => out.push({by: 'cond', a: 'fresh', b: c, level: lv, name: c === 'dry' ? 'dried up' : 'ruined', A: side({}), B: side({cond: c})}));
  return out; }
function diffs(key, o){ o = o || {}; let def = DEFS[key]; if(!def) throw noProp(key); if(o.look) def = DEFS[swapKey(key, o.look)] || def;
  const id = def.key + '|' + JSON.stringify(o); if(DIFF_CACHE.has(id)) return DIFF_CACHE.get(id).map(m => Object.assign({}, m));
  const res = diffList(def, o).map(d => { const m = diffPair(def.key, d.A, d.B, o.ground); return Object.assign({}, d, {px: m.px, box: m.box, c: m.c, r: m.r, ok: m.px >= DIFF_MIN}); });
  if(DIFF_CACHE.size > 400) DIFF_CACHE.clear(); DIFF_CACHE.set(id, res); return res.map(m => Object.assign({}, m)); }
/* ---------- 🏘️ town helper (ip-2): one call lays out a whole village on an IsoKit map ----------
   T = Props.town(map, {set: 'village', size: 'hamlet' | 'village' | 'town', seed, look, roads: 'auto' | 'cross' | 'ring' | 'street',
                        area: {i, j, w, d}, avoid: [[i, j]], roles: {inn: 'myInn', …}, trees: 0–2, roadTile: 'path', plazaTile: 'stone'})
     → {items, plaza: {i, j, w, d}, roads: [[i, j]], doors: [{i, j, out, key, role}], exits: [{i, j}], spawn: {x, y}, missed: [], style, seed, count}
   Props.town.remove(map, T) → props gone, ground tiles + blocked cells back to how they were.
   🎲 roads 'auto' (Aowu 2026-11-17 "D — not all towns are perfect, mix and match"): each seed mixes the styles inside ONE town —
   a straight main road meets a bendy lane, short alleys branch off, a ring road may have a gap, houses sit a step back now and then.
   🏘️ TOWN RULES  T1 every door is reachable from the plaza · T2 doors face a road (or a short front path) · T3 one free tile between buildings ·
   T4 tall buildings at the back (top of the screen), small ones in front · T5 trees at the edges, never on a road / the plaza / a door's front ·
   T6 same seed = same town, a look only re-skins it · T7 hamlet ≤ 60 items · village ≤ 120 · town ≤ 200 */
const TOWN_SIZES = {
  hamlet:  {n: 14, plaza: 3, homes: [4, 6],   shops: 1, inn: 0, smith: 0, temple: 0, spokes: [2, 3], alleys: [0, 1], cap: 60},
  village: {n: 20, plaza: 4, homes: [7, 10],  shops: 2, inn: 1, smith: 1, temple: 0, spokes: [3, 4], alleys: [1, 2], cap: 120},
  town:    {n: 28, plaza: 5, homes: [12, 18], shops: 4, inn: 1, smith: 1, temple: 1, spokes: [4, 4], alleys: [3, 6], cap: 200, wide: true}};
const TOWN_ROLES = {village: {centre: 'well', light: 'lantern', board: 'qboard', inn: 'inn', smith: 'smithy', shop: 'stall', home: 'stilt', fence: 'fence',
  cargo: 'crates', sign: 'signpost', dock: 'dock', shrine: 'shrine', bell: 'bell', statue: 'guardian',
  tall: ['palm', 'jtree', 'mango', 'bamboo', 'jtree', 'palm'], small: ['bush', 'bush', 'banana', 'flowers', 'flowers', 'rock', 'log']}};
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
function town(M, o){ o = o || {}; wantLook(o.look); const seed = o.seed == null ? 1 : (o.seed | 0), R = rnd(seed * 7919 + 101), chance = p => R() < p, pick = a => a[Math.floor(R() * a.length)];
  const shuf = a => { for(let n = a.length - 1; n > 0; n--){ const m = Math.floor(R() * (n + 1)), t = a[n]; a[n] = a[m]; a[m] = t; } return a; };   /* never sort(() => R() − 0.5): a random comparator made the same seed give two towns */
  const between = (a, b) => a + Math.floor(R() * (b - a + 1)), sizeKey = TOWN_SIZES[o.size] ? o.size : 'village', SZ = TOWN_SIZES[sizeKey];
  const look = o.look || 'jungle', cond = o.cond || null, roles = Object.assign({}, TOWN_ROLES[o.set] || TOWN_ROLES.village, (LOOKS[look] || {}).roles || {}, o.roles || {}), roadT = o.roadTile || 'path', plazaT = o.plazaTile || 'stone';
  const A = o.area || {i: 1, j: 1, w: M.w - 2, d: M.h - 2}, K = (i, j) => j * M.w + i, avoid = new Set((o.avoid || []).map(c => K(c[0], c[1])));
  const T = {seed, size: sizeKey, style: '', items: [], roads: [], plaza: null, doors: [], exits: [], spawn: null, missed: [], tiles: [], count: {homes: 0, shops: 0, trees: 0, deco: 0}};
  const inA = (i, j) => i >= A.i && j >= A.j && i < A.i + A.w && j < A.j + A.d;
  const ROAD = new Set(), PLAZA = new Set(), BLD = new Set(), FRONT = new Set(), RESERVE = new Set(), prev = new Map();
  let H0 = 0;
  const free = (i, j, any) => M.inside(i, j) && (any || inA(i, j)) && !avoid.has(K(i, j)) && M.get(i, j).t !== 'void' && M.walk(i, j) && !at(M, i, j) && (M.get(i, j).h | 0) === H0;
  const wet = (i, j) => M.inside(i, j) && liquidAt(M, i, j);
  const open = (i, j) => free(i, j) && !RESERVE.has(K(i, j)) && !ROAD.has(K(i, j)) && !PLAZA.has(K(i, j)) && !FRONT.has(K(i, j));   /* a free spot for a little thing: off every road, the plaza and door fronts */
  function paint(i, j, t, cost){ const k = K(i, j); if(!prev.has(k)){ const c = M.get(i, j); prev.set(k, {i, j, t: c.t, cost: c.cost}); } M.set(i, j, {t, cost}); }
  function road(i, j){ const k = K(i, j); if(ROAD.has(k) || PLAZA.has(k)) return; ROAD.add(k); T.roads.push([i, j]); paint(i, j, roadT, 0.6); }
  function add(key, i, j, po, role){ const it = place(M, key, i, j, Object.assign({look, cond}, po || {})); if(!it) return null;
    if(role !== 'tree' && role !== 'plant' && it.cells.some(([a, b]) => !inA(a, b) && !liquidAt(M, a, b))){ remove(M, it); return null; }   /* only trees may grow outside the town's area */ it.role = role || ''; T.items.push(it); return it; }
  function drop(it){ remove(M, it); const n = T.items.indexOf(it); if(n >= 0) T.items.splice(n, 1); it.cells = null; }

  /* ⛲ 1. the plaza — a little off-centre, sometimes not square (no town is perfect) */
  const pw = Math.max(3, SZ.plaza + (chance(0.3) ? -1 : 0)), pd = Math.max(3, pw + (chance(0.45) ? (chance(0.5) ? 1 : -1) : 0));
  const cx = A.i + Math.floor(A.w / 2) + Math.round((R() - 0.5) * A.w * 0.16), cy = A.j + Math.floor(A.d / 2) + Math.round((R() - 0.5) * A.d * 0.16);
  H0 = M.inside(cx, cy) ? (M.get(cx, cy).h | 0) : 0;
  let P = null; for(let r = 0; r <= 5 && !P; r++) for(let dy = -r; dy <= r && !P; dy++) for(let dx = -r; dx <= r && !P; dx++){ if(Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const i0 = cx + dx - (pw >> 1), j0 = cy + dy - (pd >> 1); let ok = true; for(let a = -1; a <= pw && ok; a++) for(let b = -1; b <= pd && ok; b++){ const fi = i0 + a, fj = j0 + b, edge = a < 0 || b < 0 || a === pw || b === pd;
      if(!(edge ? M.inside(fi, fj) && !wet(fi, fj) : free(fi, fj))) ok = false; }
    if(ok) P = {i: i0, j: j0, w: pw, d: pd}; }
  if(!P){ T.missed.push('plaza'); return finish(); }
  T.plaza = P; for(let a = 0; a < P.w; a++) for(let b = 0; b < P.d; b++){ PLAZA.add(K(P.i + a, P.j + b)); paint(P.i + a, P.j + b, plazaT, 0.5); }
  const PC = {i: P.i + (P.w - 1) / 2, j: P.j + (P.d - 1) / 2};

  /* 🛤️ 2. roads — a lane walker that may bend (a sideways step = a staircase lane on the diamond grid) */
  function lane(i, j, d, lo){ lo = lo || {}; const [di, dj] = DIRS[d], cells = []; let steps = 0, last = -9, why = 'len';
    while(steps < (lo.len || 99)){ const ni = i + di, nj = j + dj;
      if(!free(ni, nj, lo.any) && !(ROAD.has(K(ni, nj)))){ why = !M.inside(ni, nj) ? 'map' : wet(ni, nj) ? 'water' : !inA(ni, nj) ? 'edge' : 'blocked'; break; }
      i = ni; j = nj; if((ROAD.has(K(i, j)) || PLAZA.has(K(i, j))) && steps > 0 && lo.join !== false){ why = 'join'; break; }
      cells.push([i, j]); steps++;
      if(lo.bend && steps - last > 2 && R() < lo.bend){ const s = lo.side || (R() < 0.5 ? 1 : -1), si = i - dj * s, sj = j + di * s; if(free(si, sj, lo.any)){ i = si; j = sj; cells.push([i, j]); last = steps; } } }
    cells.forEach(c => road(c[0], c[1]));
    if(lo.wide && cells.length){ const s = R() < 0.5 ? 1 : -1; cells.forEach(([a, b]) => { const wi = a - dj * s, wj = b + di * s; if(free(wi, wj)) road(wi, wj); }); }
    return {cells, end: [i, j], d, why}; }
  // a door on each plaza side (its middle, nudged ±1)
  const sideStart = d => { const [di, dj] = DIRS[d]; let i, j; if(di){ i = di > 0 ? P.i + P.w - 1 : P.i; j = P.j + Math.max(0, Math.min(P.d - 1, (P.d >> 1) + between(-1, 1))); }
    else { j = dj > 0 ? P.j + P.d - 1 : P.j; i = P.i + Math.max(0, Math.min(P.w - 1, (P.w >> 1) + between(-1, 1))); } return [i, j]; };
  const ends = [];
  let style = o.roads && o.roads !== 'auto' ? o.roads : pick(['cross', 'cross', 'ring', 'street', 'street']); T.style = style;
  const order = shuf([0, 1, 2, 3]);
  if(style === 'cross'){ const n = between(SZ.spokes[0], SZ.spokes[1]);
    order.slice(0, n).forEach((d, k) => { const [i, j] = sideStart(d); ends.push(lane(i, j, d, {bend: k === 0 ? 0 : 0.22, wide: SZ.wide && k < 2})); }); }
  else if(style === 'street'){ const ax = chance(0.5) ? 0 : 1;
    [ax, ax + 2].forEach((d, k) => { const [i, j] = sideStart(d); ends.push(lane(i, j, d, {bend: 0.3, wide: SZ.wide})); });
    if(SZ.spokes[1] >= 4 && chance(0.6)){ const d = ax + 1 + (chance(0.5) ? 2 : 0), [i, j] = sideStart(d % 4); ends.push(lane(i, j, d % 4, {bend: 0.25, len: between(3, 6)})); } }
  else { const r = 2 + (sizeKey === 'town' ? 1 : 0) + (chance(0.4) ? 1 : 0), gap = between(0, 3), skip = chance(0.6) ? Math.floor(R() * 4) : -1;
    const x0 = P.i - r, y0 = P.j - r, x1 = P.i + P.w - 1 + r, y1 = P.j + P.d - 1 + r, ring = [];
    for(let x = x0; x <= x1; x++) ring.push([x, y0, 3]); for(let y = y0; y <= y1; y++) ring.push([x1, y, 0]); for(let x = x1; x >= x0; x--) ring.push([x, y1, 1]); for(let y = y1; y >= y0; y--) ring.push([x0, y, 2]);
    const cut = (x, y) => (x === x0 || x === x1) && (y === y0 || y === y1) && chance(0.5);   // corners cut round now and then
    ring.forEach(([x, y, side]) => { if(side === skip && gap){ const mid = side % 2 ? (x0 + x1) >> 1 : (y0 + y1) >> 1, at2 = side % 2 ? x : y; if(Math.abs(at2 - mid) < gap) return; }
      if(cut(x, y)) return; if(free(x, y)) road(x, y); });
    order.slice(0, between(2, 4)).forEach(d => { const [i, j] = sideStart(d); const L = lane(i, j, d, {join: false, bend: 0.15, len: r + 1});
      ends.push(lane(L.end[0], L.end[1], d, {bend: 0.25})); }); }
  // 🎲 mix: short alleys off any road (any style) — the "this and that" of a real town
  function growAlley(){ const pool = T.roads.filter(([a, b]) => Math.abs(a - PC.i) + Math.abs(b - PC.j) > 3 && inA(a, b)); if(!pool.length) return null;
    for(let n = 0; n < 8; n++){ const [a, b] = pick(pool), d = Math.floor(R() * 4), [di, dj] = DIRS[d]; if(!free(a + di, b + dj) || ROAD.has(K(a + di, b + dj)) || !free(a + 2 * di, b + 2 * dj)) continue;
      const L = lane(a, b, d, {bend: 0.35, len: between(3, 6), join: true}); L.cells.forEach(([x, y]) => RESERVE.add(K(x, y))); if(L.cells.length >= 2) return L; }
    return null; }
  for(let n = between(SZ.alleys[0], SZ.alleys[1]); n > 0; n--) growAlley();
  T.style = style + '+alleys';
  // roads that reach the town's edge carry on to the map edge (the way in) → an exit
  ends.forEach(L => { if(L.why === 'edge'){ T.exits.push({i: L.end[0], j: L.end[1], d: L.d}); const out = lane(L.end[0], L.end[1], L.d, {any: true, bend: 0.2, join: false});
      out.cells.forEach(([a, b]) => { RESERVE.add(K(a, b)); }); }
    else if(L.why === 'water') T.exits.push({i: L.end[0], j: L.end[1], d: L.d, water: true}); });
  T.roads.forEach(([a, b]) => RESERVE.add(K(a, b)));

  /* 🧭 reach check (T1): from the plaza over walkable cells */
  const spawn = () => { let best = null, bd = 1e9; PLAZA.forEach(k => { const i = k % M.w, j = (k / M.w) | 0; if(!M.walk(i, j)) return; const dd = Math.abs(i - PC.i) + Math.abs(j - PC.j); if(dd < bd){ bd = dd; best = [i, j]; } }); return best; };
  function reach(){ const s = spawn(), seen = new Uint8Array(M.w * M.h); if(!s) return seen; const q = [s]; seen[K(s[0], s[1])] = 1;
    while(q.length){ const [i, j] = q.pop(); for(const [di, dj] of DIRS){ const a = i + di, b = j + dj; if(!M.inside(a, b) || seen[K(a, b)] || !M.walk(a, b)) continue; seen[K(a, b)] = 1; q.push([a, b]); } }
    return seen; }
  const targets = () => T.doors.map(d => [d.out.i, d.out.j]).concat(T.exits.filter(e => !e.water).map(e => [e.i, e.j]));
  const allReach = () => { const s = reach(); return targets().every(([a, b]) => s[K(a, b)]); };
  // put a blocking thing down only if every door + exit can still be reached
  function addSafe(key, i, j, po, role){ const it = add(key, i, j, po, role); if(!it) return null; if(!allReach()){ drop(it); return null; } return it; }

  /* 🏠 3. buildings — each gets a job and a spot that faces a road */
  const rel = {}; function doorRel(key, turn){ const id = key + turn; if(!(id in rel)){ const it = item(key, 0, 0, {turn}); rel[id] = it.door; } return rel[id]; }
  const tooClose = (cells, ownFront) => cells.some(([a, b]) => { for(let x = -1; x <= 1; x++) for(let y = -1; y <= 1; y++) if(BLD.has(K(a + x, b + y))) return true; return FRONT.has(K(a, b)) && K(a, b) !== ownFront; });
  function spotFor(key, role, prefer){ const def = DEFS[key], cand = [], tall = def.h >= 100, plazaOk = role !== 'home';
    const doors = []; ROAD.forEach(k => doors.push(k)); if(plazaOk) PLAZA.forEach(k => doors.push(k));
    for(const k of doors){ const ri = k % M.w, rj = (k / M.w) | 0;
      for(let turn = 0; turn < 4; turn++){ let dr = doorRel(key, turn);
        if(!dr){ if(turn) continue; const dd = DIRS[Math.floor(R() * 4)]; dr = {i: 0, j: 0, out: {i: dd[0], j: dd[1]}}; if(def.foot[0] > 1 || def.foot[1] > 1) continue; }   // a doorless 1 × 1 thing: right beside the road
        const ux = dr.out.i - dr.i, uy = dr.out.j - dr.j;
        for(const back of (role === 'home' ? [0, 1] : [0])){ const oi = ri - ux * back - dr.out.i, oj = rj - uy * back - dr.out.j, fi = oi + dr.out.i, fj = oj + dr.out.j;
          if(back && !free(fi, fj)) continue;
          if(!fits(M, key, oi, oj, {turn})) continue; const T2 = turner(def.foot[0], def.foot[1], turn), cells = cellsOf(def, T2, oi, oj);
          if(cells.some(([a, b]) => !inA(a, b) || RESERVE.has(K(a, b)) || ROAD.has(K(a, b)) || PLAZA.has(K(a, b)) || avoid.has(K(a, b)))) continue;
          if(tooClose(cells, K(fi, fj))) continue;
          const mx = oi + T2.W / 2, my = oj + T2.D / 2, dist = Math.hypot(mx - PC.i - 0.5, my - PC.j - 0.5);
          let sc = prefer(dist, mx, my) + R() * 1.6 - back * 0.4 + (turn < 2 ? 0.5 : 0);
          if(tall) sc += Math.max(-2, Math.min(3, ((PC.i + PC.j) - (mx + my)) * 0.35));   // T4 tall at the back
          cand.push({sc, oi, oj, turn, back, fi, fj, cells}); } } }
    cand.sort((a, b) => b.sc - a.sc); return cand; }
  function build(key, role, prefer, po){ if(!DEFS[key]) { T.missed.push(role + ':' + key); return null; }
    const cand = spotFor(key, role, prefer); for(let n = 0; n < Math.min(6, cand.length); n++){ const c = cand[n];
      const it = add(key, c.oi, c.oj, Object.assign({turn: c.turn}, po || {}), role); if(!it) continue;
      if(c.back) road(c.fi, c.fj);   // the short front path
      if(!it.door){ if(!allReach()){ drop(it); continue; } it.cells.forEach(([a, b]) => BLD.add(K(a, b))); return it; }   // a doorless thing (shrine)
      T.doors.push({i: it.door.i, j: it.door.j, out: {i: it.door.out.i, j: it.door.out.j}, key, role, it});
      if(!allReach()){ T.doors.pop(); drop(it); continue; }
      it.cells.forEach(([a, b]) => BLD.add(K(a, b))); FRONT.add(K(it.door.out.i, it.door.out.j)); return it; }
    if((role === 'home' || role === 'shrine') && grown < (sizeKey === 'town' ? 14 : 6) && (!po || (po._again | 0) < 2)){ grown++; if(growAlley()) return build(key, role, prefer, Object.assign({}, po || {}, {_again: ((po && po._again) | 0) + 1})); }   // a crowded street grows one more lane
    T.missed.push(role + ':' + key); return null; }
  let grown = 0;
  const nearPlaza = d => -d, midRing = target => d => -Math.abs(d - target) * 0.9;
  const vars = (key) => { const n = DEFS[key] ? DEFS[key].variants : 1, list = []; for(let i = 0; i < n; i++) list.push(i); return shuf(list); };
  if(SZ.inn && roles.inn) build(roles.inn, 'inn', nearPlaza);
  for(let n = 0; n < SZ.shops; n++) if(build(roles.shop, 'shop', d => -d + (n % 2 ? 0.8 : 0), {v: n % (DEFS[roles.shop] ? DEFS[roles.shop].variants : 1)})) T.count.shops++;
  if(SZ.smith && roles.smith && build(roles.smith, 'smith', midRing(P.w / 2 + 3))) T.count.shops++;
  if(SZ.temple && roles.shrine && chance(0.85)){ const sh = build(roles.shrine, 'shrine', (d, x, y) => d * 0.4 - (x + y) * 0.5);   // a little temple corner at the back
    if(sh){ const near = [[sh.x - 1, sh.y], [sh.x + 1, sh.y], [sh.x, sh.y - 1], [sh.x, sh.y + 1]].filter(([a, b]) => open(a, b));
      near.slice(0, 2).forEach(([a, b], n) => { const k = n === 0 ? roles.statue : roles.bell; if(k && addSafe(k, a, b, {turn: 0}, n ? 'bell' : 'statue')) T.count.deco++; }); } }
  const HK = [].concat(roles.home), HV = {}; HK.forEach(k => { if(!HV[k]) HV[k] = vars(k); });   /* ip-3: a look may list several home shapes (cabin · A-frame · igloo …); one home key = the same random steps as ip-2 → old towns stay the same */
  const homes = between(SZ.homes[0], SZ.homes[1]);
  for(let n = 0; n < homes; n++){ if(T.items.length > SZ.cap * 0.55) break; const hk = HK[n % HK.length], hv = HV[hk]; const it = build(hk, 'home', midRing(P.w / 2 + 2 + R() * 4), {v: hv[Math.floor(n / HK.length) % hv.length]}); if(it) T.count.homes++; }

  /* ⛲ 4. the plaza + little things: well in the middle (a bit off), lanterns on some corners, the quest board, signposts, docks, fences, crates */
  if(roles.centre){ const ci = P.i + ((P.w - 1) >> 1) + (P.w % 2 ? 0 : (chance(0.5) ? 1 : 0)), cj = P.j + ((P.d - 1) >> 1) + (P.d % 2 ? 0 : (chance(0.5) ? 1 : 0)); addSafe(roles.centre, ci, cj, {}, 'centre'); }
  const corners = [[P.i, P.j], [P.i + P.w - 1, P.j], [P.i, P.j + P.d - 1], [P.i + P.w - 1, P.j + P.d - 1]]; shuf(corners);
  if(roles.board){ for(const [a, b] of corners){ if(addSafe(roles.board, a, b, {turn: b > PC.j ? 0 : 1}, 'board')){ corners.splice(corners.findIndex(c => c[0] === a && c[1] === b), 1); break; } } }
  corners.slice(0, between(1, 3)).forEach(([a, b]) => { if(roles.light) add(roles.light, a, b, {}, 'light'); });
  // a lantern at a few road bends / joins (walk-on, never blocks)
  T.roads.filter(() => chance(0.06)).forEach(([a, b]) => { for(const [di, dj] of DIRS){ const x = a + di, y = b + dj; if(open(x, y) && add(roles.light, x, y, {}, 'light')) break; } });
  T.exits.forEach(e => { if(e.water){ if(!roles.dock) return; const [di, dj] = DIRS[e.d]; for(const [a, b] of [[e.i + di, e.j + dj], [e.i + di - 1, e.j + dj], [e.i + di, e.j + dj - 1], [e.i + di - 1, e.j + dj - 1]]) if(add(roles.dock, a, b, {turn: (e.d + 3) % 4}, 'dock')) break; return; }
    if(!roles.sign || !chance(0.85)) return; const [di, dj] = DIRS[e.d]; for(const s of [1, -1]){ const x = e.i - dj * s, y = e.j + di * s; if(open(x, y) && add(roles.sign, x, y, {turn: e.d % 2 ? 0 : 1}, 'sign')) break; } });
  // fences behind some homes (T3 keeps a lane between houses; a fence that would cut a door off is taken away again)
  T.doors.filter(d => d.role === 'home' && chance(0.45)).forEach(d => { const it = d.it, ux = d.out.i - d.i, uy = d.out.j - d.j;
    const spot = uy > 0 ? [it.x, it.y - 1, 0] : uy < 0 ? [it.x, it.y + it.d, 0] : ux > 0 ? [it.x - 1, it.y, 1] : [it.x + it.w, it.y, 1];
    if(roles.fence && open(spot[0], spot[1]) && open(spot[0] + (spot[2] ? 0 : 1), spot[1] + (spot[2] ? 1 : 0)) && addSafe(roles.fence, spot[0], spot[1], {turn: spot[2]}, 'fence')) T.count.deco++; });
  // crates beside the shops
  T.doors.filter(d => d.role === 'shop' || d.role === 'smith').forEach(d => { if(!roles.cargo || !chance(0.75)) return; const it = d.it;
    const ring = []; for(let x = it.x - 1; x <= it.x + it.w; x++) for(let y = it.y - 1; y <= it.y + it.d; y++) if(x < it.x || y < it.y || x >= it.x + it.w || y >= it.y + it.d) ring.push([x, y]);
    shuf(ring); for(const [x, y] of ring){ if(open(x, y) && addSafe(roles.cargo, x, y, {v: Math.floor(R() * 3)}, 'cargo')){ T.count.deco++; break; } } });

  /* 🌳 5. trees at the edges (T5): thicker further out, in clumps, tall ones at the back, small ones in front */
  const dist = new Int16Array(M.w * M.h).fill(-1), q = [];
  for(let j = 0; j < M.h; j++) for(let i = 0; i < M.w; i++){ const k = K(i, j); if(ROAD.has(k) || PLAZA.has(k) || BLD.has(k) || RESERVE.has(k) || at(M, i, j)){ dist[k] = 0; q.push(k); } }
  for(let h = 0; h < q.length; h++){ const k = q[h], i = k % M.w, j = (k / M.w) | 0; for(const [di, dj] of DIRS){ const a = i + di, b = j + dj; if(!M.inside(a, b) || dist[K(a, b)] >= 0) continue; dist[K(a, b)] = dist[k] + 1; q.push(K(a, b)); } }
  const clump = (i, j) => { const f = (x, y) => { let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const x = i / 3.2, y = j / 3.2, x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, s = t => t * t * (3 - 2 * t);
    const a = f(x0, y0) + (f(x0 + 1, y0) - f(x0, y0)) * s(fx), b = f(x0, y0 + 1) + (f(x0 + 1, y0 + 1) - f(x0, y0 + 1)) * s(fx); return a + (b - a) * s(fy); };
  const many = o.trees == null ? 1 : +o.trees, cap = SZ.cap;
  const spots = []; for(let j = 0; j < M.h; j++) for(let i = 0; i < M.w; i++) spots.push([i, j]);
  for(let n = spots.length - 1; n > 0; n--){ const m = Math.floor(R() * (n + 1)), t = spots[n]; spots[n] = spots[m]; spots[m] = t; }
  // 🌼 little gardens: flowers / a bush beside some homes (never on a road or a door's front)
  T.doors.filter(d => d.role === 'home' && chance(0.4)).forEach(d => { const it = d.it; for(let n = 0; n < 6; n++){ const x = it.x - 1 + Math.floor(R() * (it.w + 2)), y = it.y - 1 + Math.floor(R() * (it.d + 2));
      if(open(x, y)){ const k = chance(0.6) ? 'flowers' : 'bush'; if(DEFS[k] && add(k, x, y, {v: Math.floor(R() * DEFS[k].variants)}, 'garden')){ T.count.deco++; break; } } } });
  if(many > 0) for(const [i, j] of spots){ if(T.items.length >= cap) break; const d = dist[K(i, j)]; if(d < 2 || avoid.has(K(i, j))) continue;
    const c = clump(i, j), p = (d === 2 ? 0.1 : Math.min(0.55, 0.2 + 0.08 * (d - 3))) * (0.25 + 1.3 * c) * many; if(R() >= p) continue;
    const front = (i + j) - (PC.i + PC.j), small = d === 2 || (front > 5 && chance(0.7)) || chance(0.18), key = small ? pick(roles.small) : pick(roles.tall);
    if(!DEFS[key]) continue; const it = add(key, i, j, {v: Math.floor(R() * DEFS[key].variants)}, small ? 'plant' : 'tree'); if(it){ if(small) T.count.deco++; else T.count.trees++; } }
  return finish();
  function finish(){ T.tiles = [...prev.values()]; const s = spawn(); T.spawn = s ? {x: s[0] + 0.5, y: s[1] + 0.5} : null;
    if(T.plaza){ const ok = reach(); T.doors.forEach(d => { if(!ok[K(d.out.i, d.out.j)]) T.missed.push('unreached:' + d.key); }); }
    T.doors.forEach(d => { delete d.it; }); T.count.items = T.items.length; return T; } }
town.remove = function(M, T){ if(!T) return; [...T.items].reverse().forEach(it => remove(M, it)); T.items = []; (T.tiles || []).forEach(c => M.set(c.i, c.j, {t: c.t, cost: c.cost})); T.tiles = []; };
town.SIZES = TOWN_SIZES; town.ROLES = TOWN_ROLES;
window.Props = {version: 'ip-4g', RIM, LIGHT, MAT, KINDS, SETS, DEFS, LOOKS, CONDS, addLook, addCondition, ground, addSet, add, organic, swapKey, list, check, lit, geom, turner, builder,
  pic, item, canvas: (key, o) => { if(!DEFS[key]) throw noProp(key); return canvasOf(DEFS[key], o); }, place, fits, remove, setState, ring, grow, stages, growKey: (key, st, br) => growKey(DEFS[key], st, br), morphFx, diffs, diffPair: (key, A, B, ground) => diffPair(key, A, B, ground), DIFF_MIN, stateOf: (key, st) => stateOf(DEFS[key], st), town, at, hit, seeThrough, tick, warm, sizeRange, _paint: paint, _fontsLanded: fontsLanded,
  need, sources, has, files: () => Object.assign({}, HAVE), FILES: FILES.slice(), DEPS: JSON.parse(JSON.stringify(DEPS)), fileOf, _fileMap: m => { FILE_OF = Object.assign({}, m || {}); },   // 📦 ip-4a: one IsoLook_<name> file per look
  _K: {HTW, LOOKS, DEFS, MAT, PD, add, lit, sideOf, sh, rnd, addLook, addSet, organic, bareTree, FONT, T: TOOLS, loaded}};   // what the IsoLook_<name> files need from inside the kit (ip-3d IsoPropsWorld → ip-4a look files)
})();
/* 📦 ip-4a: which look file has which prop (made by build_isoprops.py) */
window.Props._fileMap({"inn_thai":"jungle","smithy_thai":"jungle","well_thai":"jungle","stall_thai":"jungle","qboard_thai":"jungle","lantern_thai":"jungle","blossom":"cherry","maple":"cherry","petalbush":"cherry","machiya":"cherry","teahouse":"cherry","pagoda":"cherry","stonelantern":"cherry","archgate":"cherry","koipond":"cherry","archbridge":"cherry","inn_ryokan":"cherry","smithy_katana":"cherry","well_ido":"cherry","stall_yatai":"cherry","qboard_ema":"cherry","datepalm":"desert","cactus":"desert","roundcactus":"desert","mesarock":"desert","mudhouse":"desert","domehouse":"desert","tent":"desert","oasis":"desert","pots":"desert","hitch":"desert","pyramid":"desert","inn_caravan":"desert","smithy_dome":"desert","well_mosaic":"desert","qboard_scroll":"desert","lantern_brass":"desert","pine":"snow","baretree":"snow","icecrystal":"snow","cabin":"snow","aframe":"snow","igloo":"snow","snowman":"snow","sled":"snow","firepit":"snow","aurorapost":"snow","inn_chalet":"snow","smithy_nordic":"snow","well_log":"snow","stall_chalet":"snow","qboard_rune":"snow","farmhouse":"farm","barn":"farm","silo":"farm","coop":"farm","haybale":"farm","scarecrow":"farm","corn":"farm","sunflower":"farm","pumpkins":"farm","mushtree":"farm","pigpen":"farm","beehive":"farm","rainbarrel":"farm","trough":"farm","windmill":"farm","pond":"farm","barn2":"farm","farmsign":"farm","mudpit":"farm","pumpkinpile":"farm","farmgate":"farm","plankbridge":"farm","wheelbarrow":"farm","tilled":"farm","flowerpatch":"farm","inn_country":"farm","smithy_horseshoe":"farm","well_pump":"farm","stall_farm":"farm","qboard_barn":"farm","lantern_hurricane":"farm","growmush":"grow","growcorn":"grow","growsun":"grow","growpepper":"grow","growpump":"grow","basalthouse":"lava","emberdome":"lava","inn_ember":"lava","smithy_lava":"lava","well_geyser":"lava","stall_ember":"lava","qboard_ember":"lava","lantern_magma":"lava","embertree":"lava","firebloom":"lava","obsidian":"lava","volcano":"lava","shellhouse":"coral","coralhouse":"coral","inn_pearl":"coral","smithy_vent":"coral","well_clam":"coral","stall_reef":"coral","qboard_drift":"coral","lantern_jelly":"coral","coraltree":"coral","kelp":"coral","anemone":"coral","pearlspire":"coral","moondome":"moon","moonpod":"moon","inn_orbit":"moon","smithy_robo":"moon","well_ice":"moon","stall_space":"moon","qboard_holo":"moon","lantern_beacon":"moon","moonrock":"moon","crystaltree":"moon","moongarden":"moon","rocket":"moon","tudor":"castle","towerhouse":"castle","inn_tavern":"castle","smithy_armory":"castle","fountain_royal":"castle","stall_fair":"castle","qboard_herald":"castle","lantern_torch":"castle","oak":"castle","topiary":"castle","rosebush":"castle","castlekeep":"castle","coinrock":"realm","bricktree":"realm","realm_wall":"realm","realm_gate":"realm","realm_tallwall":"realm","realm_tallgate":"realm","realm_shrine":"realm","gemore":"realm","raptor_house":"raptor","raptor_camp":"raptor","raptor_ride":"raptor","raptor_nest":"raptor","raptor_care":"raptor","raptor_workshop":"raptor","raptor_tower":"raptor","raptor_wardrobe":"raptor","raptor_spell":"raptor","raptor_hideout":"raptor","raptor_den":"raptor","raptor_wall":"raptor","raptor_gate":"raptor","raptor_tallwall":"raptor","raptor_tallgate":"raptor","raptor_relic":"raptor","bolt_house":"bolt","bolt_camp":"bolt","bolt_ride":"bolt","bolt_nest":"bolt","bolt_care":"bolt","bolt_workshop":"bolt","bolt_tower":"bolt","bolt_wardrobe":"bolt","bolt_spell":"bolt","bolt_hideout":"bolt","bolt_den":"bolt","bolt_wall":"bolt","bolt_gate":"bolt","bolt_tallwall":"bolt","bolt_tallgate":"bolt","bolt_relic":"bolt","wild_den":"wild","wild_lair":"wild","wild_relic":"wild","wild_drop":"wild","wild_warn":"wild","wild_egg":"wild","kitchen_house":"kitchen","kitchen_camp":"kitchen","kitchen_ride":"kitchen","kitchen_nest":"kitchen","kitchen_care":"kitchen","kitchen_workshop":"kitchen","kitchen_tower":"kitchen","kitchen_wardrobe":"kitchen","kitchen_spell":"kitchen","kitchen_hideout":"kitchen","kitchen_den":"kitchen","kitchen_coin":"kitchen","kitchen_brick":"kitchen","kitchen_gem":"kitchen","kitchen_wall":"kitchen","kitchen_gate":"kitchen","kitchen_tallwall":"kitchen","kitchen_tallgate":"kitchen","kitchen_relic":"kitchen","horde_house":"horde","horde_camp":"horde","horde_ride":"horde","horde_nest":"horde","horde_care":"horde","horde_workshop":"horde","horde_tower":"horde","horde_wardrobe":"horde","horde_spell":"horde","horde_hideout":"horde","horde_den":"horde","horde_coin":"horde","horde_brick":"horde","horde_gem":"horde","horde_wall":"horde","horde_gate":"horde","horde_tallwall":"horde","horde_tallgate":"horde","horde_relic":"horde","monster_house":"monster","monster_camp":"monster","monster_ride":"monster","monster_nest":"monster","monster_care":"monster","monster_workshop":"monster","monster_tower":"monster","monster_wardrobe":"monster","monster_spell":"monster","monster_hideout":"monster","monster_den":"monster","monster_coin":"monster","monster_brick":"monster","monster_gem":"monster","monster_wall":"monster","monster_gate":"monster","monster_tallwall":"monster","monster_tallgate":"monster","monster_relic":"monster","myth_house":"myth","myth_camp":"myth","myth_ride":"myth","myth_nest":"myth","myth_care":"myth","myth_workshop":"myth","myth_tower":"myth","myth_wardrobe":"myth","myth_spell":"myth","myth_hideout":"myth","myth_den":"myth","myth_coin":"myth","myth_brick":"myth","myth_gem":"myth","myth_wall":"myth","myth_gate":"myth","myth_tallwall":"myth","myth_tallgate":"myth","myth_relic":"myth","reef_house":"reef","reef_camp":"reef","reef_ride":"reef","reef_nest":"reef","reef_care":"reef","reef_workshop":"reef","reef_tower":"reef","reef_wardrobe":"reef","reef_spell":"reef","reef_hideout":"reef","reef_den":"reef","reef_coin":"reef","reef_brick":"reef","reef_gem":"reef","reef_wall":"reef","reef_gate":"reef","reef_tallwall":"reef","reef_tallgate":"reef","reef_relic":"reef","cloud_house":"cloud","cloud_camp":"cloud","cloud_ride":"cloud","cloud_nest":"cloud","cloud_care":"cloud","cloud_workshop":"cloud","cloud_tower":"cloud","cloud_wardrobe":"cloud","cloud_spell":"cloud","cloud_hideout":"cloud","cloud_den":"cloud","cloud_coin":"cloud","cloud_brick":"cloud","cloud_gem":"cloud","cloud_wall":"cloud","cloud_gate":"cloud","cloud_tallwall":"cloud","cloud_tallgate":"cloud","cloud_relic":"cloud","wizard_house":"wizard","wizard_camp":"wizard","wizard_ride":"wizard","wizard_nest":"wizard","wizard_care":"wizard","wizard_workshop":"wizard","wizard_tower":"wizard","wizard_wardrobe":"wizard","wizard_spell":"wizard","wizard_hideout":"wizard","wizard_den":"wizard","wizard_coin":"wizard","wizard_brick":"wizard","wizard_gem":"wizard","wizard_wall":"wizard","wizard_gate":"wizard","wizard_tallwall":"wizard","wizard_tallgate":"wizard","wizard_relic":"wizard","gear_house":"gear","gear_camp":"gear","gear_ride":"gear","gear_nest":"gear","gear_care":"gear","gear_workshop":"gear","gear_tower":"gear","gear_wardrobe":"gear","gear_spell":"gear","gear_hideout":"gear","gear_den":"gear","gear_coin":"gear","gear_brick":"gear","gear_gem":"gear","gear_wall":"gear","gear_gate":"gear","gear_tallwall":"gear","gear_tallgate":"gear","gear_relic":"gear","det_agency":"detective","det_museum":"detective","det_kiosk":"detective","det_clueboard":"detective","det_clockpost":"detective","det_gaslamp":"detective","det_tape":"detective","det_crates":"detective","det_signpost":"detective","det_townhouse":"detective","det_cottage":"detective","det_mansion":"detective","det_lighthouse":"detective","det_clocktower":"detective","det_prints":"detective","det_bike":"detective","det_catwall":"detective","det_basket":"detective","det_plane":"detective","det_hedge":"detective","det_planter":"detective","toybox_house":"toybox","toybox_camp":"toybox","toybox_ride":"toybox","toybox_nest":"toybox","toybox_care":"toybox","toybox_workshop":"toybox","toybox_tower":"toybox","toybox_wardrobe":"toybox","toybox_spell":"toybox","toybox_hideout":"toybox","toybox_den":"toybox","toybox_coin":"toybox","toybox_brick":"toybox","toybox_gem":"toybox","toybox_relic":"toybox","toybox_wall":"toybox","toybox_gate":"toybox","toybox_tallwall":"toybox","toybox_tallgate":"toybox","dust_house":"dust","dust_camp":"dust","dust_ride":"dust","dust_nest":"dust","dust_care":"dust","dust_workshop":"dust","dust_tower":"dust","dust_wardrobe":"dust","dust_spell":"dust","dust_hideout":"dust","dust_den":"dust","dust_coin":"dust","dust_brick":"dust","dust_gem":"dust","dust_relic":"dust","dust_wall":"dust","dust_gate":"dust","dust_tallwall":"dust","dust_tallgate":"dust"});
