
window.WelcomeShow = (function(){
  'use strict';
  // ---------- ws-2 MOODS: 6 moods, picked at random, never the same twice in a row ----------
  // entry = how avatars arrive · parts = mood particles · sil = colours for the scene-of-the-day shapes
  const MOODS = {
    candy: {icon: '🍬', name: 'Cute × bouncy', hop: 1, entry: 'run', parts: 'confetti', confetti: ['#FF6FA8', '#FFC23D', '#46D3A6', '#7AA8FF', '#C38BFF'], stickers: ['🍭', '⭐', '🎈', '🍬', '🌈', '💖'],
      gests: ['wave', 'jump', 'dance', 'cheer', 'hop', 'clap'], sil: ['rgba(255,111,168,0.22)', 'rgba(70,211,166,0.22)'], night: false},
    cozy: {icon: '☕', name: 'Cozy × lo-fi', hop: 0, entry: 'stroll', parts: 'fairy', confetti: ['#FFD89A', '#FFB38A', '#F6E7C1'], stickers: ['☕', '🌙', '🍪', '📚'],
      gests: ['wave', 'stretch', 'read', 'yawn', 'think', 'heart'], sil: ['rgba(20,12,30,0.35)', 'rgba(255,190,140,0.16)'], night: true},
    epic: {icon: '🎬', name: 'Epic movie intro', hop: 0, entry: 'land', parts: 'beams', confetti: ['#FFD45A', '#FFF2B0', '#B8860B'], stickers: ['✨', '🎬', '⭐'],
      gests: ['flex', 'herolanding', 'kungfu', 'cheer', 'bow'], sil: ['rgba(10,8,30,0.55)', 'rgba(120,100,220,0.18)'], night: true},
    apoc: {icon: '☄️', name: 'Apocalypse (kid-friendly)', hop: 0.6, entry: 'dodge', parts: 'comets', confetti: ['#FFB347', '#FF7A2E', '#FFE08A'], stickers: ['☄️', '🌋', '💨'],
      gests: ['flex', 'herolanding', 'jump', 'cheer', 'kungfu'], sil: ['rgba(40,10,6,0.5)', 'rgba(255,140,60,0.18)'], night: true},
    ride: {icon: '🚲', name: 'Chill ride', hop: 0, entry: 'ride', parts: 'road', confetti: ['#FFFFFF', '#FFE29F'], stickers: ['🌴', '☁️', '🌅'],
      gests: ['wave', 'cheer', 'heart', 'clap'], sil: ['rgba(120,60,90,0.22)', 'rgba(255,255,255,0.28)'], night: false},
    play: {icon: '🛝', name: 'Playground fun', hop: 1.4, entry: 'bounce', parts: 'park', confetti: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF'], stickers: ['🎈', '🫧', '🪁', '⚽'],
      gests: ['cartwheel', 'jump', 'hop', 'spin', 'starjump', 'cheer'], sil: ['rgba(30,90,160,0.2)', 'rgba(255,255,255,0.35)'], night: false}
  };
  const MOOD_KEYS = Object.keys(MOODS);
  function pickMood(last, rand){ rand = rand || Math.random; const opts = MOOD_KEYS.filter(k => k !== last); return opts[Math.floor(rand() * opts.length)]; }

  // ---------- 🎨 scene of the day (6 house themes, one per day) + 🎉 special days (they win) ----------
  const SCENES = [
    {k: 'jungle', icon: '🦖', name: 'Jungle + volcano'}, {k: 'sea', icon: '🐙', name: 'Underwater'}, {k: 'disco', icon: '🪩', name: 'Disco lights'},
    {k: 'lab', icon: '🤖', name: 'Robot lab'}, {k: 'space', icon: '🪐', name: 'Space'}, {k: 'olympus', icon: '☁️', name: 'Clouds + Olympus'}];
  function today(){ const f = window.WS_DATE; if(f && /^\d{4}-\d{2}-\d{2}$/.test(f)){ const a = f.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2], 9); } return new Date(); }
  function sceneOfDay(d){ d = d || today(); const n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); return SCENES[((n % 6) + 6) % 6]; }
  // Loy Krathong = full moon of the 12th Thai month (calendars differ by a day → a 3-day window around it)
  const LOY_KRATHONG = {2025: '11-05', 2026: '11-24', 2027: '11-13', 2028: '11-01', 2029: '11-20', 2030: '11-09', 2031: '10-30', 2032: '11-17', 2033: '11-06', 2034: '11-25', 2035: '11-15'};
  function md(d){ return String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function nearDay(d, mmdd, span){ if(!mmdd) return false; const a = mmdd.split('-').map(Number), x = new Date(d.getFullYear(), a[0] - 1, a[1], 9); return Math.abs(Math.round((d - x) / 86400000)) <= span; }
  // birthdays = {name: 'MM-DD'} → today's special day (or null)
  function specialFor(d, birthdays){
    d = d || today(); const m = md(d);
    const bd = Object.keys(birthdays || {}).filter(n => birthdays[n] === m);
    if(bd.length) return {k: 'birthday', icon: '🎂', who: bd[0], all: bd, title: 'Happy birthday, ' + bd.join(' & ') + '! 🎂'};
    if(m === '12-31' || m === '01-01') return {k: 'newyear', icon: '🎆', title: 'Happy New Year! 🎆'};
    if(m === '12-24' || m === '12-25') return {k: 'christmas', icon: '🎄', title: 'Merry Christmas! 🎄'};
    if(m === '10-31') return {k: 'halloween', icon: '🎃', title: 'Happy Halloween! 🎃'};
    if(m >= '04-13' && m <= '04-15') return {k: 'songkran', icon: '💦', title: 'Happy Songkran! 💦'};
    if(nearDay(d, LOY_KRATHONG[d.getFullYear()], 1)) return {k: 'loykrathong', icon: '🪷', title: 'Happy Loy Krathong! 🪷'};
    return null;
  }
  // ---------- funny loading lines per real step ----------
  const STEPS = [
    {k: 'boot', at: 0.08, lines: ['Waking up the robot… 🤖', 'Switching on the lights… 💡', 'Opening the toy box… 🧸']},
    {k: 'ask', at: 0.22, lines: ['Calling the family… 📞', 'Knocking on the playground gate… 🚪', 'Asking the owl for news… 🦉']},
    {k: 'players', at: 0.62, lines: ['Feeding the dinos… 🦖', 'Counting the players… 🔢', 'Brushing the avatars\' hair… 💇']},
    {k: 'news', at: 0.8, lines: ['Polishing the trophies… 🏆', 'Reading the news… 📣', 'Sorting the stickers… ⭐']},
    {k: 'looks', at: 0.92, lines: ['Tuning the piano… 🎹', 'Painting the walls… 🎨', 'Pumping up the balloons… 🎈']},
    {k: 'done', at: 1, lines: ['Ready to play! 🚀']}
  ];
  const FUN_NAMES = ['Captain Noodle', 'Zippy Zebra', 'Professor Pickle', 'Bubbles McGee', 'Sir Wobble', 'Dizzy Dino', 'Lady Sprinkles', 'Turbo Toast', 'Mango Moon', 'Pogo Penguin', 'Cosmo Cupcake', 'Waffle Wizard', 'Jelly Jet', 'Coco Comet', 'Biscuit Bolt', 'Pip Pancake'];
  const LETTER_FX = ['flask', 'gears', 'blocks', 'paint', 'numbers'];
  // 🃏 Did you know? — short facts from the WisDeck cards (rebuild: node build_ws_facts.js in the Test Harness folder)
  const WS_FACTS = [["🚩","Thailand","Thailand's flag has five stripes: blue for the King, white for religion, red for the nation."],["🚩","Japan","Japan's flag is a red circle on white that stands for the rising sun."],["🚩","USA","The US flag has 50 stars, one for each state, and 13 red and white stripes."],["🧩","Thailand","Thai people say Thailand looks like an axe; some say it looks like an elephant's head."],["🧩","Japan","Japan is a long curved chain of islands with four big main islands."],["🧩","USA","Florida sticks out at the bottom of the USA like a big thumb."],["🗺️","Thailand","Thailand is in Southeast Asia, next to Myanmar, Laos, Cambodia and Malaysia."],["🗺️","Japan","Japan is a group of islands in the Pacific Ocean, east of China and Korea."],["🗺️","USA","The USA is in North America, between Canada and Mexico."],["🏙️","Bangkok","Bangkok's full Thai name is the longest city name in the world!"],["🏙️","Tokyo","Tokyo used to have a different name, Edo, long ago."],["🏙️","Beijing","Beijing has the Forbidden City, a giant palace with almost 1,000 buildings."],["🗼","Eiffel Tower","It was built for a big fair in 1889 and was meant to be taken down later!"],["🗼","Statue of Liberty","It was a gift from France and turned green as its copper skin aged."],["🗼","Great Wall of China","It is thousands of kilometres long and took hundreds of years to build."],["🍜","Pizza","Pizza as we know it first became popular in Naples, Italy."],["🍜","Ice cream","In Thailand, some ice cream is served inside a soft bread bun!"],["🍜","Hamburger","Hamburgers are named after Hamburg, a city in Germany."],["⚽","Football","Football is the most popular sport in the world, played in over 200 countries!"],["⚽","Basketball","Basketball was invented in 1891, using a peach basket as the hoop!"],["⚽","Swimming","Freestyle is the fastest swimming stroke, and butterfly is the second fastest."],["👩‍🚒","Doctor","Doctors listen to your heart and lungs with a tool called a stethoscope."],["👩‍🚒","Teacher","In Thailand, students thank their teachers every year on Wai Khru Day."],["👩‍🚒","Police officer","In Thailand, you can call 191 to reach the police in an emergency."],["🎺","Drum","Drums are among the oldest instruments, played for thousands of years."],["🎺","Piano","A piano has 88 keys: 52 white ones and 36 black ones."],["🎺","Guitar","Most guitars have six strings that you strum or pluck with your fingers."],["🦖","T. rex","T. rex had teeth as big as bananas and one of the strongest bites ever!"],["🦖","Triceratops","Triceratops had three horns on its face and a big bony frill on its neck."],["🦖","Stegosaurus","Stegosaurus had big plates on its back and sharp spikes on its tail."],["🦴","Homo sapiens","We are Homo sapiens, which means \"wise human\", and we live all over the world."],["🦴","Chimpanzee","Chimpanzees are our closest living cousins and share about 98% of our DNA."],["🦴","Gorilla","Gorillas are the biggest apes alive today and are close cousins of humans."],["🏛️","Ancient Egypt","Ancient Egyptians built giant pyramids and wrapped their kings as mummies."],["🏛️","Ancient Rome","The Romans built long straight roads and huge arenas like the Colosseum."],["🏛️","Ancient Greece","The first Olympic Games were held in ancient Greece to honour the god Zeus."],["🕰️","3 o'clock","At 3 o'clock the short hand points to 3 and the long hand points straight up to 12."],["🕰️","7 o'clock","Many kids wake up and brush their teeth at about 7 o'clock in the morning."],["🕰️","Day","One day is the time Earth takes to spin around once, giving us day and night."],["🦉","Zeus","Zeus was the king of the Greek gods and threw lightning bolts from the sky."],["🦉","Hercules","Hercules was the strongest hero and had to finish twelve very hard tasks."],["🦉","Aesop","Aesop told fables like The Tortoise and the Hare, each with a lesson."],["🐉","Thor","In Norse stories, Thor made thunder by swinging his magic hammer, Mjolnir."],["🐉","Hanuman","Hanuman, the brave white monkey of the Ramayana and Ramakien, could leap across the sea."],["🐉","Sun Wukong","The Monkey King Sun Wukong rode on a cloud and had a stick that could grow or shrink."],["🧑‍🔬","Albert Einstein","Einstein imagined riding on a beam of light, which helped him find new ideas about time."],["🧑‍🔬","Thomas Edison","Edison made a long-lasting light bulb and also invented a machine that recorded sound."],["🧑‍🔬","Isaac Newton","Newton said watching an apple fall helped him think about gravity."],["🧭","Neil Armstrong","In 1969 Neil Armstrong became the first person ever to walk on the Moon."],["🧭","Christopher Columbus","In 1492 Columbus sailed across the Atlantic Ocean with three small wooden ships."],["🧭","Yuri Gagarin","In 1961 Yuri Gagarin became the first human in space, circling Earth in 108 minutes."],["🏯","Bangkok founded","Bangkok became the capital in 1782, and its full name is one of the longest in the world."],["🏯","Ayutthaya founded","King U Thong founded Ayutthaya in 1351 on an island where three rivers meet."],["🏯","Thai alphabet","King Ramkhamhaeng created the Thai letters in 1283, and we still use them today."],["🏝️","Taipei 101","Taipei 101 opened in 2004 and was the tallest building in the world for about six years."],["🏝️","Bubble tea","Bubble tea with chewy tapioca pearls was invented in Taiwan in the 1980s."],["🏝️","Night markets","Shilin Night Market in Taipei began in 1909 and is full of tasty snacks."],["🛶","Longship","Viking longships were so light that the crew could carry them over land between rivers."],["🛶","Viking helmet","Real Viking helmets were round and had NO horns, unlike in cartoons!"],["🛶","Leif Erikson","Leif Erikson sailed to North America about 500 years before Columbus."],["🐘","Lion","A lion's roar can be heard up to 8 kilometers away!"],["🐘","Tiger","Every tiger has its own stripe pattern, like our fingerprints!"],["🐘","Asian Elephant","Elephants drink by sucking water into their trunks, then squirting it into their mouths."],["🦜","Emperor Penguin","Emperor penguin dads keep the egg warm on their feet for about two months!"],["🦜","Barn Owl","Barn owls can find mice in total darkness just by listening."],["🦜","Bald Eagle","Bald eagles aren't really bald; their heads are covered in white feathers."],["🐊","Saltwater Crocodile","Saltwater crocodiles are the biggest reptiles alive and can swim out to sea."],["🐊","Green Sea Turtle","Green sea turtles are named for the green-colored fat under their shells."],["🐊","Bullfrog","Bullfrogs are amphibians, not reptiles, and their call sounds like a mooing cow!"],["🐄","Cow","Cows have four parts to their stomach to help digest grass."],["🐄","Chicken","Chickens are some of the closest living relatives of the T. rex!"],["🐄","Dog","A dog's sense of smell is thousands of times stronger than ours."],["🐼","Giant panda","Giant pandas can spend up to 14 hours a day eating bamboo!"],["🐼","Tiger","No two tigers have the same stripes, just like our fingerprints!"],["🐼","Asian elephant","Elephants use their long trunks like a hand to grab food and spray water!"],["🐞","Butterfly","Butterflies taste their food by standing on it with their feet!"],["🐞","Ant","Ants can carry things many times heavier than their own bodies!"],["🐞","Honeybee","Honeybees do a wiggle dance to tell friends where the flowers are!"],["🐳","Blue whale","The blue whale is the biggest animal that has ever lived on Earth!"],["🐳","Great white shark","Great white sharks grow new teeth all their lives, thousands in total!"],["🐳","Dolphin","Dolphins sleep with half their brain awake so they remember to breathe!"],["🪐","Sun","Sunlight takes about eight minutes to travel all the way from the Sun to Earth!"],["🪐","Moon","Astronauts' footprints on the Moon can last millions of years because there is no wind there."],["🪐","Earth","Earth is the only planet we know that has living things and oceans of liquid water."],["🌻","Sunflower","Young sunflowers turn their faces to follow the sun across the sky!"],["🌻","Rose","Roses have sharp prickles on their stems to stop animals from eating them."],["🌻","Banana plant","A banana plant is not really a tree, it is a giant herb!"],["🫀","Heart","Your heart beats about 100,000 times every day without you even thinking about it!"],["🫀","Eye","You blink about 15 to 20 times every minute to keep your eyes clean and wet."],["🫀","Nose","Your nose can tell apart thousands of different smells, and it also warms the air you breathe."],["🧪","Water","Water is found naturally on Earth as solid ice, liquid water, and gassy steam."],["🧪","Table Salt","Salt is made of sodium and chlorine, which are dangerous alone but tasty together!"],["🧪","Oxygen","Plants make the oxygen we breathe, and people and most animals need it to live."],["🦠","Human","Your body is made of about 30 trillion tiny cells all working together!"],["🦠","Ant","Ants can carry things many times heavier than their own bodies!"],["🦠","Blue Whale","Blue whales eat tiny krill, gulping down several tonnes of them in a single day!"],["🧲","Snail","A snail's slime helps it grip and glide, so it can crawl over sharp, rough ground."],["🧲","Walking Person","When you walk, friction between your shoes and the ground pushes you forward."],["🧲","Car","Seat belts matter because your body keeps moving forward when a car stops suddenly."],["🪨","Diamond","Diamond is the hardest natural material, and it is made of the same stuff as pencil lead!"],["🪨","Gold","Gold is so soft that one tiny bead can be hammered into a huge, super thin sheet!"],["🪨","Silver","Silver is the best metal of all at carrying electricity and heat."],["🌪️","Lightning","A lightning bolt is about five times hotter than the surface of the Sun!"],["🌪️","Thunderstorm","When you hear thunder, go indoors and stay inside until the storm passes."],["🌪️","Flood","Floods happen when heavy rain makes rivers overflow, so families move to higher ground."],["📐","Circle","A circle has no corners at all, so wheels and Thai coins are round and roll smoothly!"],["📐","Square","A square has four equal sides, and a chessboard is made of 64 little squares."],["📐","Triangle","In this triangle all three sides are the same length, and every corner is the same size."],["🏺","Pottery","Soft clay becomes hard as stone when it is baked in a very hot fire!"],["🏺","Origami","In Japan, people say folding 1,000 paper cranes can make a wish come true!"],["🏺","Sewing","The very first needles were made from animal bones, with a tiny hole for thread."],["💡","Wheel","The first wheels were used for making pots before they were put on carts!"],["💡","Light bulb","Thomas Edison tested thousands of materials before finding one that glowed for a long time."],["💡","Telephone","The first phone call was \"Mr. Watson, come here, I want to see you.\""],["🚂","Car","The first cars, over 130 years ago, were slower than a running horse."],["🚂","Bicycle","The very first bicycles had no pedals, so riders pushed along with their feet."],["🚂","Bus","A double-decker bus has two floors, so it can carry lots of people."],["📏","Metre","A metre was first set as one ten-millionth of the way from the North Pole to the equator."],["📏","Centimetre","Your fingernail is about one centimetre wide, and a hundred centimetres make one metre."],["📏","Kilogram","One litre of water weighs almost exactly one kilogram!"],["⚖️","Stop sign","The first stop sign went up in Detroit, USA, and it was white with black letters."],["⚖️","Traffic light","The first traffic light, in London, used gas lamps and was turned by a policeman."],["⚖️","Zebra crossing","Zebra crossings are named after their black and white stripes, just like a zebra!"],["🎎","Songkran","At Songkran, people splash water for fun and pour water on elders' hands for blessings."],["🎎","Loy Krathong","People float little banana-leaf boats with candles and flowers on rivers under the full moon."],["🎎","Christmas","Families decorate trees with lights and give each other presents on 25 December."],["🕊️","Loving-kindness","Buddhists teach metta: wishing that all living beings are happy, safe and well."],["🕊️","Generosity","Buddhists teach dana, the joy of giving, like sharing food with monks or friends."],["🕊️","Gratitude","Buddhists teach katannu: remember and thank the people who helped you, especially parents."],["👘","T-shirt","T-shirts got their name because they look like a capital letter T when laid flat!"],["👘","Jeans","Jeans were first made strong for miners and workers, with little metal rivets on the pockets."],["👘","Pajamas","The word pajamas comes from old Persian and Hindi words meaning leg clothes."],["💇","Ponytail","A ponytail is named after a pony's tail, and it swishes the same way when you run!"],["💇","Pigtails","Pigtails are two bunches or braids, one on each side of the head."],["💇","Braid","A very old stone statue, about 30,000 years old, seems to show a braided hairstyle."],["🧱","Ice","Ice is lighter than liquid water, so ice cubes float in your drink!"],["🧱","Candle wax","A candle flame melts the wax, and the wick soaks it up to burn as fuel."],["🧱","Glass","Glass is mostly made from sand melted in a super hot furnace."]];   // 138 facts from the WisDeck cards (build_ws_facts.js)
  function pickTip(rand){ rand = rand || Math.random;
    if(rand() < 0.6 && WS_FACTS.length){ const f = WS_FACTS[Math.floor(rand() * WS_FACTS.length)]; return {kind: 'fact', icon: f[0], name: f[1], text: f[2]}; }
    return {kind: 'tip', text: window.UI && UI.randomTip ? UI.randomTip() : 'Tap your avatar to start!'}; }

  // ---------- small pure helpers (also used by the harness) ----------
  function dayKey(d){ d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function isPhone(){ return Math.min(innerWidth, innerHeight) < 500; }
  function shuffle(a, rand){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(rand() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // ≤ max names, a new random mix each time, the last player always in (and in the middle of the line).
  function pickParade(names, last, max, rand){
    rand = rand || Math.random; names = (names || []).filter(Boolean);
    if(!names.length) return [];
    if(names.indexOf(last) < 0) last = names[0];
    const others = shuffle(names.filter(n => n !== last), rand).slice(0, Math.max(0, max - 1));
    const out = others.slice(), mid = Math.floor(out.length / 2 + (rand() < 0.5 ? 0 : 0.5));
    out.splice(Math.min(out.length, mid), 0, last);
    return out;
  }
  function guestCrew(rand){
    rand = rand || Math.random;
    const n = 3 + Math.floor(rand() * 3), names = shuffle(FUN_NAMES, rand).slice(0, n);
    return names.map(name => ({name: name, av: (typeof randomAvatar === 'function' ? randomAvatar() : {}), guest: true}));
  }
  function reduceMotion(){ try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){ return false; } }
  function store(k, v){ try { if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(e){ return null; } }

  // ---------- state ----------
  const S = {el: null, on: false, mode: 'short', mood: 'candy', scene: null, special: null, settings: null, dur: 1, t0: 0, now: 0, ready: false, readyAt: 0, skipped: false, done: false, out: false,
    actors: [], last: null, guest: false, steps: [], stepAt: {}, real: 0, shown: 0, lineQ: [], line: '', lineUntil: 0, rm: false, cv: null, g: null, dpr: 1,
    rects: null, letters: [], fx: [], parts: [], raf: 0, endedAt: 0, events: []};
  const R = (a, b) => a + Math.random() * (b - a);

  function mount(){
    const el = document.getElementById('welcome-loading'); if(!el) return null;
    el.className = 'welcome-loading ws m-' + S.mood;
    el.innerHTML = '<div class="ws-cur l"></div><div class="ws-cur r"></div><canvas class="ws-cv" aria-hidden="true"></canvas><div class="ws-day" id="ws-day"></div>' +
      '<div class="ws-main"><div class="ws-logo" aria-label="STEAM Playground"><div class="ws-steam">' + 'STEAM'.split('').map((c, i) => '<span class="ws-l' + (i === 0 ? ' fill' : '') + '" data-fx="' + LETTER_FX[i] + '">' + c + '</span>').join('') + '</div>' +
      '<div class="ws-pg">Playground</div></div><div class="ws-stage"></div><div class="ws-hi" id="ws-hi"></div>' +
      '<div class="ws-barbox"><div class="ws-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i></i></div><div class="ws-step" id="ws-step"></div></div><div class="ws-tip" id="welcome-tip"></div></div>' +
      '<div class="ws-skip">👆 Tap anywhere to skip</div><button class="ws-jg" id="ws-jg" type="button" aria-pressed="false"></button>';
    S.cv = el.querySelector('.ws-cv'); S.g = S.cv.getContext('2d');
    S.letters = Array.from(el.querySelectorAll('.ws-l'));
    appLogo(el);   // 🎮 ap-1: the code-drawn app logo (when the page has GameLogos)
    el.addEventListener('pointerdown', skip);
    const jg = el.querySelector('.ws-jg');
    jg.addEventListener('pointerdown', e => e.stopPropagation());
    jg.addEventListener('click', e => { e.stopPropagation(); jingleToggle(); });
    document.addEventListener('keydown', onKey);
    return el;
  }
  // 🎮 ap-1: the code-drawn app logo pops in (0.4 s) where the STEAM letters were, its ring glows twice, then the show goes on as before
  function appLogo(el){
    const lg = el.querySelector('.ws-logo'); if(!lg || !window.UI || !UI.appLogo || !UI.appLogo.has()) return;
    const W = innerWidth, H = innerHeight, land = H <= 520 && W >= H * 4 / 3, base = Math.min(W, H) >= 700 ? 312 : 240;
    const px = Math.round(Math.max(140, Math.min(base, land ? H * 0.6 / 0.913 : H * 0.33 / 0.913, W * 0.86)));
    lg.classList.add('ws-app'); lg.style.setProperty('--wsp', px + 'px'); S.app = {px: px, at: null};
    const go = () => { if(!S.el || S.app.at != null) return; let url = ''; try { url = GameLogos.url('app', 'main', document.documentElement.getAttribute('data-theme') || 'classic', px); } catch(e){}
      if(!url){ lg.classList.remove('ws-app'); S.app = null; if(S.on) measure(); return; }
      lg.style.backgroundImage = 'url("' + url + '")'; lg.style.setProperty('--wsd', Math.max(0, letterAt(0) - elapsed()).toFixed(2) + 's');
      lg.classList.add('ws-app-in'); S.app.at = elapsed(); S.events.push({k: 'applogo', t: S.app.at, px: px}); };
    UI.appLogo.fonts().then(go);
  }
  function onKey(e){ if(S.on && !S.out && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) skip(); }
  function measure(){
    if(!S.el) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = innerWidth, h = innerHeight;
    if(S.cv.width !== Math.round(w * dpr) || S.cv.height !== Math.round(h * dpr)){ S.cv.width = Math.round(w * dpr); S.cv.height = Math.round(h * dpr); }
    S.dpr = dpr;
    const st = S.el.querySelector('.ws-stage').getBoundingClientRect();
    S.rects = {stage: {x: st.left, y: st.top, w: st.width, h: st.height}, letters: S.letters.map(l => { const r = l.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; })};
    placeActors();
  }

  // ---------- the cast ----------
  function cast(players, avatarOf, settings){
    if(!S.on || S.out) return;
    const names = (players || []).map(p => p && (p.Name || p.name || p)).filter(Boolean);
    if(settings && !S.settings){ S.settings = settings; setSpecial(names, settings); }
    const guest = !!window.SP_GUEST || !names.length;
    if(S.actors.length && S.guest === guest) return;       // keep the first cast (no jumping when the server answer follows the cache)
    S.guest = guest;
    let crew;
    if(guest) crew = guestCrew();
    else {
      const max = isPhone() ? 3 : 5, bday = S.special && S.special.k === 'birthday' ? S.special.who : null, hero = bday && names.indexOf(bday) >= 0 ? bday : names[0];
      const pick = pickParade(names, hero, max);
      S.last = names[0]; S.hero = hero;
      crew = pick.map(n => ({name: n, av: (function(){ try { return avatarOf ? avatarOf(n) : defaultAvatar(n); } catch(e){ return defaultAvatar(n); } })(), last: n === hero, bday: S.special && S.special.all && S.special.all.indexOf(n) >= 0}));
    }
    const t = elapsed(), late = S.mode === 'full' ? t > 0.4 : true;
    S.actors = crew.map((a, i) => Object.assign(a, {i: i, side: i < crew.length / 2 ? -1 : 1, delay: late ? Math.min(0.25, i * 0.05) : 0.2 + i * 0.14, enter: t,
      gest: null, gt: 0, nextG: R(0.4, 1.4), x: 0, tx: 0, k: 1, feet: 0}));
    placeActors();
    const hi = document.getElementById('ws-hi');
    if(MOODS[S.mood].entry === 'ride') S.actors.forEach(a => { a.av = Object.assign({}, a.av); const eq = Object.assign({}, a.av.eq || {}); if(!eq.ride) eq.ride = {id: 'coolboards', v: a.i % 2 ? 1 : 0}; a.av.eq = eq; });   // 🚲 own ride-on, or a scooter / skates for the show
    if(hi){ hi.textContent = guest ? 'Meet the guest crew! 👋' : S.special && S.special.k === 'birthday' && S.special.all.indexOf(S.hero) >= 0 ? S.special.title : 'Welcome back, ' + S.last + '! 👋'; }
    S.events.push({k: 'cast', t: t, names: S.actors.map(a => a.name), guest: guest});
  }
  function setSpecial(names, settings){
    const b = {}; (names || []).forEach(n => { const v = settings && settings['Birthday_' + n]; if(/^\d{2}-\d{2}$/.test(String(v || ''))) b[n] = String(v); });
    S.special = specialFor(today(), b);
    const day = document.getElementById('ws-day'); if(day) day.textContent = S.special ? S.special.title : '';
    S.events.push({k: 'special', special: S.special ? S.special.k : null});
  }
  function placeActors(){
    if(!S.rects || !S.actors.length) return;
    const st = S.rects.stage, n = S.actors.length;
    const k = Math.max(0.42, Math.min(2.2, (st.h - 26) * 0.8 / 100));
    const gap = Math.min(st.w / n, Math.max(86 * k, S.guest ? 150 : 96)), x0 = st.x + st.w / 2 - gap * (n - 1) / 2;
    S.actors.forEach((a, i) => { a.k = k; a.tx = x0 + gap * i; a.feet = st.y + st.h - 24; a.sx = a.side < 0 ? -60 : innerWidth + 60; });
  }

  // ---------- progress ----------
  function step(k){
    if(!S.on) return;
    const s = STEPS.find(x => x.k === k); if(!s || S.stepAt[k] != null) return;
    S.stepAt[k] = elapsed(); S.steps.push(k);
    S.real = Math.max(S.real, s.at);
    S.lineQ.push(s.lines[Math.floor(Math.random() * s.lines.length)]);
  }
  function ready(){
    if(!S.on) return;
    if(!S.ready){ S.ready = true; S.readyAt = elapsed(); ['players', 'news', 'looks'].forEach(step); step('done'); }
    if(S.skipped) finish();
  }
  function skip(e){
    if(!S.on || S.out) return;
    if(S.jingleWait) jinglePlay('tap');   // the first tap lets the browser play sound
    if(e && e.type === 'pointerdown' && e.button > 0) return;
    S.skipped = true; S.events.push({k: 'skip', t: elapsed()});
    S.letters.forEach(l => l.classList.add('on'));
    const pg = S.el.querySelector('.ws-pg'); if(pg) pg.classList.add('on');
    const hi = document.getElementById('ws-hi'); if(hi && hi.textContent) hi.classList.add('on');
    if(S.ready) finish();
  }
  function elapsed(){ return (performance.now() - S.t0) / 1000; }

  // ---------- start ----------
  function start(opt){
    opt = opt || {};
    S.rm = reduceMotion();
    const dk = dayKey(), seen = store('sp_ws_day') === dk;
    let mode = seen ? 'short' : 'full';
    if(navigator.webdriver && !window.WS_FORCE) mode = 'short';   // test browsers: quick, unless a test asks (WS_FORCE = 'full' | 'short' | 'auto' = the real once-a-day rule)
    if(window.WS_FORCE === 'full' || window.WS_FORCE === 'short') mode = window.WS_FORCE;
    store('sp_ws_day', dk);
    S.mode = mode; S.dur = mode === 'full' ? 3.0 : 1.0;
    const lastMood = store('sp_ws_mood');
    S.mood = MOODS[window.WS_MOOD] ? window.WS_MOOD : pickMood(lastMood);
    store('sp_ws_mood', S.mood);
    S.scene = sceneOfDay();
    S.special = specialFor(today(), {});   // fixed-date days now; birthdays once the players are known (cast)
    S.el = mount(); if(!S.el) return;
    const day = document.getElementById('ws-day'); if(day) day.textContent = S.special ? S.special.title : '';
    S.on = true; S.t0 = performance.now();
    const tip = document.getElementById('welcome-tip'), tp = pickTip(); S.tip = tp;
    if(tip){ if(tp.kind === 'fact'){ tip.classList.add('fact'); tip.innerHTML = '<b>🃏 Did you know?</b>' + tp.icon + ' ' + tp.text.replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c])); } else tip.textContent = '💡 ' + tp.text; }
    jingleChip();
    if(jingleOn()) jinglePlay('start');
    measure();
    addEventListener('resize', measure);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    step('boot');
    holdToasts();
    seedParticles();
    S.events.push({k: 'start', t: 0, mode: mode, mood: S.mood, scene: S.scene.k, special: S.special ? S.special.k : null});
    S.raf = requestAnimationFrame(frame);
  }

  // A toast that pops while the show is on would sit on top of it: keep the newest one and show it after the show.
  function holdToasts(){
    if(!window.UI || typeof UI.toast !== 'function' || UI.toast.wsHeld) return;
    const orig = UI.toast, held = function(m, ty){ if(S.on){ S.toastQ = [m, ty]; return; } return orig.apply(this, arguments); };
    held.wsHeld = true; held.orig = orig; UI.toast = held;
  }
  function releaseToasts(){
    if(!window.UI || !UI.toast || !UI.toast.wsHeld) return;
    const orig = UI.toast.orig; UI.toast = orig;
    if(S.toastQ){ const q = S.toastQ; S.toastQ = null; setTimeout(() => orig(q[0], q[1]), 250); }
  }

  // ---------- ws-3 JINGLES: one short tune per mood (OFF by default, follows the 🔊 setting, needs a first tap) ----------
  const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
  const JINGLES = {   // [midi or 0 = noise, start s, length s, wave, gain, slideTo midi]
    candy: [[84, 0, 0.14, 'triangle', 0.3], [88, 0.1, 0.14, 'triangle', 0.3], [91, 0.2, 0.14, 'triangle', 0.3], [96, 0.3, 0.3, 'triangle', 0.32], [72, 0.62, 0.1, 'sine', 0.3, 84]],
    cozy: [[60, 0, 1.1, 'sine', 0.12], [64, 0.02, 1.1, 'sine', 0.1], [67, 0.04, 1.1, 'sine', 0.1], [71, 0.06, 1.1, 'sine', 0.08], [57, 0.55, 1.0, 'sine', 0.1], [64, 0.6, 0.9, 'sine', 0.08]],
    epic: [[0, 0, 0.5, 'noise', 0.4], [36, 0, 0.45, 'sine', 0.5, 28], [43, 0.32, 0.6, 'sawtooth', 0.12], [55, 0.32, 0.6, 'sawtooth', 0.1], [0, 0.35, 0.35, 'whoosh', 0.3]],
    apoc: [[31, 0, 0.9, 'sawtooth', 0.14, 26], [0, 0.05, 0.7, 'noise', 0.3], [28, 0.55, 0.5, 'sine', 0.5, 22], [0, 0.55, 0.5, 'noise', 0.4]],
    ride: [[67, 0, 0.22, 'triangle', 0.25], [72, 0.15, 0.22, 'triangle', 0.25], [76, 0.3, 0.22, 'triangle', 0.25], [81, 0.45, 0.35, 'triangle', 0.25], [76, 0.7, 0.22, 'triangle', 0.2], [79, 0.85, 0.4, 'triangle', 0.22]],
    play: [[72, 0, 0.55, 'sine', 0.25, 91], [91, 0.62, 0.5, 'sine', 0.22], [96, 0.66, 0.5, 'sine', 0.16]]
  };
  function soundOn(){ try { return !window.UISound || UISound.get().enabled; } catch(e){ return true; } }
  function jingleOn(){ return store('sp_ws_jingle') === '1' && soundOn(); }
  function jingleChip(){
    const b = document.getElementById('ws-jg'); if(!b) return;
    if(!soundOn()){ b.textContent = '🔇 Sound off'; b.disabled = true; b.classList.remove('on'); return; }
    const on = store('sp_ws_jingle') === '1'; b.disabled = false; b.textContent = on ? '🎵 Jingle on' : '🎵 Jingle off'; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function jingleToggle(){ store('sp_ws_jingle', store('sp_ws_jingle') === '1' ? '0' : '1'); jingleChip(); S.events.push({k: 'jingle-switch', on: jingleOn()}); if(jingleOn()){ S.jinglePlayed = false; jinglePlay('switch'); } }
  function jinglePlay(why){
    if(!jingleOn() || S.jinglePlayed) return;
    const c = window.UISound && UISound.wake ? UISound.wake() : null;
    if(!c || (c.state !== 'running' && why === 'start')){ S.jingleWait = true; S.events.push({k: 'jingle-wait'}); return; }   // browsers only play sound after a tap
    S.jingleWait = false; S.jinglePlayed = true; S.events.push({k: 'jingle', mood: S.mood, why: why, notes: JINGLES[S.mood].length});
    const vol = (window.UISound ? UISound.get().volume : 0.6) * 0.8, t0 = c.currentTime + 0.03;
    JINGLES[S.mood].forEach(n => { try {
      const g = c.createGain(), at = t0 + n[1], end = at + n[2], peak = Math.max(0.0001, n[4] * vol);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak, at + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, end); g.connect(c.destination);
      if(n[3] === 'noise' || n[3] === 'whoosh'){ const len = Math.floor(c.sampleRate * n[2]), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0); for(let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const src = c.createBufferSource(), f = c.createBiquadFilter(); src.buffer = buf; f.type = n[3] === 'noise' ? 'lowpass' : 'bandpass'; f.frequency.setValueAtTime(n[3] === 'noise' ? 220 : 400, at); if(n[3] === 'whoosh') f.frequency.exponentialRampToValueAtTime(3000, end);
        src.connect(f); f.connect(g); src.start(at); src.stop(end + 0.02); }
      else { const o = c.createOscillator(); o.type = n[3]; o.frequency.setValueAtTime(NOTE(n[0]), at); if(n[5]) o.frequency.exponentialRampToValueAtTime(NOTE(n[5]), end); o.connect(g); o.start(at); o.stop(end + 0.02); }
    } catch(e){} });
  }

  // ---------- timeline ----------
  function letterAt(i){ return S.mode === 'full' ? 0.15 + i * 0.3 : 0.02 + i * 0.06; }
  function letterLen(){ return S.mode === 'full' ? 0.8 : 0.35; }
  function frame(){
    if(!S.on) return;
    const t = elapsed(); S.now = t;
    // letters on
    S.letters.forEach((l, i) => { if(!l.classList.contains('on') && (S.rm || t >= letterAt(i) + letterLen() * 0.55)){ l.classList.add('on'); l.dataset.onAt = t; } });
    if(S.mood === 'apoc' && !S.rm && !S.shook && t >= letterAt(4) + letterLen() * 0.6){ S.shook = true; const mn = S.el.querySelector('.ws-main'); if(mn) mn.classList.add('shake'); }
    const allOn = letterAt(4) + letterLen();
    const pg = S.el.querySelector('.ws-pg'); if(pg && !pg.classList.contains('on') && t >= allOn - 0.2) pg.classList.add('on');
    const steam = S.el.querySelector('.ws-steam'); if(steam && !S.rm && !steam.classList.contains('shine') && t >= allOn + (S.mode === 'full' ? 0.15 : 0)){ steam.classList.add('shine'); S.letters.forEach((l, i) => { setTimeout(() => l.classList.add('glint'), i * 90); setTimeout(() => l.classList.remove('glint'), i * 90 + 260); }); }
    const hi = document.getElementById('ws-hi'); if(hi && hi.textContent && !hi.classList.contains('on') && t >= heroAt()) hi.classList.add('on');
    // progress: creep toward the next step while waiting, ease the shown bar toward it
    const next = STEPS.find(s => s.at > S.real); const goal = next ? S.real + (next.at - S.real) * Math.min(0.9, 1 - Math.exp(-(t - (S.stepAt[S.steps[S.steps.length - 1]] || 0)) * 0.7)) : S.real;
    S.shown += (goal - S.shown) * Math.min(1, (S.mode === 'full' ? 3.2 : 9) * (1 / 60));
    if(S.ready && S.real >= 1 && S.shown > 0.985) S.shown = 1;
    const bar = S.el.querySelector('.ws-bar'); if(bar){ bar.firstChild.style.width = (S.shown * 100).toFixed(1) + '%'; bar.setAttribute('aria-valuenow', Math.round(S.shown * 100)); }
    if(S.lineQ.length && t >= S.lineUntil){ S.line = S.lineQ.shift(); S.lineUntil = t + (S.mode === 'full' ? 0.42 : 0.14); const sl = document.getElementById('ws-step'); if(sl) sl.textContent = S.line; }
    draw(t);
    // the end: show time done AND data in AND bar full (or skipped)
    if(!S.out && S.ready && (S.skipped || (t >= S.dur && S.shown >= 1 && !S.lineQ.length))) finish();
    if(S.on) S.raf = requestAnimationFrame(frame);
  }
  function heroAt(){ return S.mode === 'full' ? 1.9 : 0.25; }

  // ---------- drawing (one canvas) ----------
  function seedParticles(){
    const M = MOODS[S.mood]; S.parts = [];
    const n = M.parts === 'confetti' ? (isPhone() ? 22 : 40) : M.parts === 'park' ? (isPhone() ? 10 : 18) : (isPhone() ? 12 : 22);
    S.fxp = [];
    for(let i = 0; i < 26; i++) S.fxp.push({x: Math.random(), y: Math.random(), s: R(0.5, 1.5), sp: R(0, 6.28), v: R(0.6, 1.4)});
    for(let i = 0; i < n; i++) S.parts.push({x: Math.random(), y: Math.random(), vy: R(0.03, 0.09), sp: R(0, 6.28), w: R(5, 10), c: M.confetti[i % M.confetti.length], r: R(0, 6.28), vr: R(-3, 3)});
    for(let i = 0; i < (isPhone() ? 4 : 7); i++) S.parts.push({sticker: M.stickers[i % M.stickers.length], x: R(0.04, 0.96), y: R(0.05, 0.95), sp: R(0, 6.28), s: R(20, 34)});
  }
  function draw(t){
    const g = S.g, dpr = S.dpr; if(!g) return;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S.cv.width, S.cv.height); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = innerWidth, H = innerHeight, still = S.rm;
    // 🎨 the scene of the day (or 🎉 the special day) at the back, then the mood's own particles
    backLayer(g, W, H, t, still);
    S.parts.forEach(p => {
      if(MOODS[S.mood].parts !== 'confetti' && !p.sticker){ moodPart(g, p, W, H, t, still); return; }
      if(p.sticker){ const bob = still ? 0 : Math.sin(t * 2.2 + p.sp) * 6; emo(g, p.sticker, p.x * W, p.y * H + bob, p.s, 0.55); return; }
      const y = still ? p.y * H : ((p.y + t * p.vy) % 1.08 - 0.04) * H, x = p.x * W + (still ? 0 : Math.sin(t * 1.6 + p.sp) * 12);
      g.save(); g.translate(x, y); g.rotate(p.r + (still ? 0 : t * p.vr)); g.fillStyle = p.c; g.globalAlpha = 0.7;
      if(p.w > 8){ g.beginPath(); g.arc(0, 0, p.w * 0.45, 0, 6.29); g.fill(); } else g.fillRect(-p.w / 2, -p.w * 0.3, p.w, p.w * 0.6);
      g.restore();
    });
    g.globalAlpha = 1;
    if(!still && !S.skipped && S.rects) S.rects.letters.forEach((r, i) => { const p = (t - letterAt(i)) / letterLen(); if(p > 0 && p < 1.25) LETTER_PAINT[LETTER_FX[i]](g, r, Math.min(1, p), t, i); });
    if(!still && S.rects){ const sh = (t - (letterAt(4) + letterLen())) ; if(sh > 0 && sh < 0.9) sparkle(g, S.rects.letters, sh / 0.9, t); }
    if(!still && S.rects) shockwaves(g, t);
    if(!still && S.rects && S.mood === 'ride') logoTruck(g, t);
    drawParade(g, t);
    frontLayer(g, W, H, t, still);
  }
  // 🎬 a ring + flash where an epic letter lands; ☄️ cracks round a rock letter
  function shockwaves(g, t){
    if(S.mood !== 'epic' && S.mood !== 'apoc') return;
    S.letters.forEach((l, i) => { const at = Number(l.dataset.onAt); if(!(at >= 0)) return; const q = (t - at) / 0.55; if(q < 0 || q > 1) return; const r = S.rects.letters[i]; if(!r) return;
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2; g.save();
      if(S.mood === 'epic'){ g.strokeStyle = 'rgba(255,220,120,' + (1 - q) * 0.8 + ')'; g.lineWidth = 4 * (1 - q) + 1; g.beginPath(); g.ellipse(cx, cy, r.w * (0.4 + q * 1.4), r.h * (0.3 + q * 0.7), 0, 0, 6.29); g.stroke(); }
      else { g.strokeStyle = 'rgba(70,40,30,' + (1 - q) * 0.8 + ')'; g.lineWidth = 2; for(let c = 0; c < 6; c++){ const a = c * 1.05 + i, l1 = r.h * (0.25 + q * 0.4); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * l1 * 0.5, cy + Math.sin(a) * l1 * 0.5 + 3); g.lineTo(cx + Math.cos(a + 0.2) * l1, cy + Math.sin(a + 0.2) * l1); g.stroke(); }
        g.fillStyle = 'rgba(120,90,70,' + (1 - q) * 0.7 + ')'; for(let c = 0; c < 8; c++){ const a = c * 0.8, d = q * r.w; g.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d + q * q * 40, 5, 5); } }
      g.restore(); });
  }
  function logoTruck(g, t){   // 🚲 ws-2b: the logo rides in on a little truck that drives on and off
    const L = S.rects.letters, a = L[0], b = L[4]; if(!a || !b) return;
    const w = b.x + b.w - a.x + 40, y = a.y + a.h * 0.98, end = letterAt(4) + letterLen() + 0.3, q = Math.min(1, t / Math.max(0.3, end - 0.2));
    let x = a.x - 20 - (1 - (1 - Math.pow(1 - q, 3))) * (a.x + w + 40); if(t > end) x += (t - end) * 900; if(x > innerWidth + 40) return;
    g.save(); g.globalAlpha = 0.95; g.fillStyle = '#E8436F'; rrect(g, x, y, w, a.h * 0.12, 6); g.fill();
    g.fillStyle = '#2E86DE'; rrect(g, x + w, y - a.h * 0.18, a.h * 0.3, a.h * 0.3, 8); g.fill(); g.fillStyle = '#CFE8FF'; rrect(g, x + w + a.h * 0.08, y - a.h * 0.13, a.h * 0.15, a.h * 0.12, 3); g.fill();
    g.fillStyle = '#333'; [0.12, 0.5, 0.88].forEach(f => { g.beginPath(); g.arc(x + w * f, y + a.h * 0.14, a.h * 0.08, 0, 6.29); g.fill(); }); g.beginPath(); g.arc(x + w + a.h * 0.18, y + a.h * 0.14, a.h * 0.08, 0, 6.29); g.fill();
    g.restore();
  }
  // the mood's own particles (confetti is drawn inline above)
  function moodPart(g, p, W, H, t, still){
    const M = MOODS[S.mood], tt = still ? 0 : t;
    if(M.parts === 'fairy'){ // ☕ fairy lights: a string across the top + soft rain
      const i = S.parts.indexOf(p), n = S.parts.filter(q => !q.sticker).length, x = (i + 0.5) / n * W, y = 26 + Math.sin(i / n * Math.PI) * 34;
      g.fillStyle = M.confetti[i % M.confetti.length]; g.globalAlpha = 0.55 + 0.45 * Math.sin(tt * 2 + i); g.beginPath(); g.arc(x, y, 5, 0, 6.29); g.fill();
      g.globalAlpha = 0.18; g.beginPath(); g.arc(x, y, 14, 0, 6.29); g.fill();
      g.globalAlpha = 0.25; g.strokeStyle = '#CFE3FF'; g.lineWidth = 1.2; const rx = p.x * W, ry = ((p.y + tt * 0.5) % 1) * H; g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx - 3, ry + 14); g.stroke();
    } else if(M.parts === 'beams'){ // 🎬 light beams from below + drifting sparks
      const i = S.parts.indexOf(p); if(i < 4){ const a = -Math.PI / 2 + (i - 1.5) * 0.35 + Math.sin(tt * 0.8 + i) * 0.18; g.save(); g.translate(W * (0.2 + i * 0.2), H + 20); g.rotate(a + Math.PI / 2);
        const gr = g.createLinearGradient(0, 0, 0, -H * 1.1); gr.addColorStop(0, 'rgba(255,230,160,0.28)'); gr.addColorStop(1, 'rgba(255,230,160,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(-18, 0); g.lineTo(18, 0); g.lineTo(90, -H * 1.1); g.lineTo(-90, -H * 1.1); g.closePath(); g.fill(); g.restore(); }
      else { g.fillStyle = '#FFE6A0'; g.globalAlpha = 0.6; g.fillRect(p.x * W, ((p.y - tt * p.vy) % 1 + 1) % 1 * H, 2, 2); }
    } else if(M.parts === 'comets'){ // ☄️ comets streak by (friendly — no impacts)
      const q = ((p.y + tt * p.vy * 2.2) % 1), x = (p.x + q * 0.5) * W, y = q * H * 0.75;
      const gr = g.createLinearGradient(x, y, x - 70, y - 50); gr.addColorStop(0, 'rgba(255,230,160,0.9)'); gr.addColorStop(1, 'rgba(255,120,40,0)');
      g.strokeStyle = gr; g.lineWidth = 4; g.globalAlpha = 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 70, y - 50); g.stroke(); g.fillStyle = '#FFF4D0'; g.beginPath(); g.arc(x, y, 3.5, 0, 6.29); g.fill();
    } else if(M.parts === 'road'){ // 🚲 drifting clouds (the road + hills are in the back layer)
      const x = ((p.x - tt * 0.02 * p.vy * 20) % 1 + 1) % 1 * (W + 120) - 60, y = 30 + p.y * H * 0.3; g.fillStyle = '#fff'; g.globalAlpha = 0.55;
      g.beginPath(); g.arc(x, y, 14, 0, 6.29); g.arc(x + 16, y - 6, 18, 0, 6.29); g.arc(x + 34, y, 13, 0, 6.29); g.fill();
    } else if(M.parts === 'park'){ // 🛝 bubbles + balloons
      const i = S.parts.indexOf(p), y = ((p.y - tt * p.vy * 0.8) % 1 + 1) % 1 * H, x = p.x * W + Math.sin(tt * 1.5 + p.sp) * 14;
      if(i % 3 === 0){ g.fillStyle = M.confetti[i % 4]; g.globalAlpha = 0.85; g.beginPath(); g.ellipse(x, y, 11, 14, 0, 0, 6.29); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + 14); g.lineTo(x + 3, y + 34); g.stroke(); }
      else { g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1.5; g.globalAlpha = 0.7; g.beginPath(); g.arc(x, y, p.w * 1.3, 0, 6.29); g.stroke(); }
    }
    g.globalAlpha = 1;
  }

  // ---------- 🎨 back layer: scene of the day, or the special day (special days win) ----------
  function backLayer(g, W, H, t, still){
    const tt = still ? 0 : t, M = MOODS[S.mood], sp = S.special, gy = H * 0.86;
    g.save();
    if(sp) SPECIAL_BACK[sp.k] && SPECIAL_BACK[sp.k](g, W, H, tt, M);
    else SCENE_PAINT[S.scene.k](g, W, H, M.entry === 'ride' ? tt * 60 : 0, tt, M);
    if(M.entry === 'ride') roadLayer(g, W, H, tt);
    if(M.parts === 'park') parkLayer(g, W, H, tt);
    if(S.mood === 'apoc'){ g.fillStyle = 'rgba(40,14,8,0.55)'; g.fillRect(0, gy, W, H - gy); g.strokeStyle = 'rgba(255,120,40,0.7)'; g.lineWidth = 2; g.beginPath(); for(let x = 0; x < W; x += 60){ g.moveTo(x, gy + 10); g.lineTo(x + 20, gy + 26); g.lineTo(x + 34, gy + 18); } g.stroke(); }
    g.restore(); g.globalAlpha = 1;
  }
  function frontLayer(g, W, H, t, still){
    const sp = S.special; if(!sp || !SPECIAL_FRONT[sp.k]) return;
    g.save(); SPECIAL_FRONT[sp.k](g, W, H, still ? 0 : t); g.restore(); g.globalAlpha = 1;
  }
  const wrapX = (x, W) => ((x % (W + 200)) + W + 200) % (W + 200) - 100;
  const SCENE_PAINT = {
    jungle(g, W, H, off, t, M){ // 🦖 volcano + palms + a dino strolling
      const c = M.sil; g.fillStyle = c[0]; g.beginPath(); g.moveTo(W * 0.62, H * 0.86); g.lineTo(W * 0.78, H * 0.44); g.lineTo(W * 0.84, H * 0.44); g.lineTo(W * 1.02, H * 0.86); g.fill();
      g.fillStyle = 'rgba(255,120,40,0.45)'; g.beginPath(); g.ellipse(W * 0.81, H * 0.44, W * 0.03, 6, 0, 0, 6.29); g.fill();
      for(let i = 0; i < 4; i++){ const y = H * 0.4 - ((t * 18 + i * 30) % 120); g.fillStyle = 'rgba(255,255,255,' + (0.35 - i * 0.07) + ')'; g.beginPath(); g.arc(W * 0.81 + Math.sin(t + i) * 8, y, 12 + i * 4, 0, 6.29); g.fill(); }
      [0.06, 0.2, 0.92].forEach((p, i) => emo(g, '🌴', wrapX(W * p - off, W), H * 0.74, 70 + i * 10, 0.55));
      emo(g, '🦖', wrapX(W * 0.3 + t * 22 - off, W), H * 0.8, 46, 0.7, true);
    },
    sea(g, W, H, off, t, M){ // 🐙 seaweed + bubbles + fish
      g.fillStyle = 'rgba(40,120,200,0.12)'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(30,140,90,0.45)'; g.lineWidth = 7; g.lineCap = 'round';
      for(let i = 0; i < 9; i++){ const x = wrapX(W * (i / 9 + 0.03) - off, W); g.beginPath(); g.moveTo(x, H); for(let y = 0; y < 6; y++) g.lineTo(x + Math.sin(t * 1.6 + y + i) * 10, H - y * 22 - 10); g.stroke(); }
      for(let i = 0; i < 14; i++){ g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1.5; g.beginPath(); g.arc(W * ((i * 0.137) % 1), H - ((t * 40 + i * 70) % H), 3 + i % 4, 0, 6.29); g.stroke(); }
      emo(g, '🐙', wrapX(W * 0.86 - off, W), H * 0.78 + Math.sin(t * 2) * 6, 56, 0.75);
      emo(g, '🐠', wrapX(W * 0.1 + t * 30 - off, W), H * 0.3, 36, 0.7, true); emo(g, '🐟', wrapX(W * 0.7 - t * 24 - off, W), H * 0.22, 30, 0.6);
    },
    disco(g, W, H, off, t, M){ // 🪩 ball + spinning light dots
      const cols = ['#FF4D8D', '#3D8BFD', '#FFD93D', '#46D3A6', '#C38BFF'];
      for(let i = 0; i < 26; i++){ const a = t * 0.6 + i * 0.7, r = (0.2 + (i % 5) * 0.16) * Math.max(W, H) * 0.5; g.fillStyle = cols[i % 5]; g.globalAlpha = 0.28 + 0.2 * Math.sin(t * 3 + i);
        g.beginPath(); g.arc(W / 2 + Math.cos(a) * r, H * 0.1 + Math.abs(Math.sin(a)) * r, 9, 0, 6.29); g.fill(); }
      g.globalAlpha = 1; g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(W * 0.1, 0); g.lineTo(W * 0.1, 40); g.stroke(); emo(g, '🪩', W * 0.1, 64, 46);
    },
    lab(g, W, H, off, t, M){ // 🤖 gears + screens + pipes
      const c = M.sil; g.save(); g.globalAlpha = 1;
      [[0.05, 0.25, 54, 1], [0.95, 0.7, 66, -1], [0.9, 0.18, 34, 1]].forEach(([x, y, r, d]) => gear(g, wrapX(W * x - off, W), H * y, r, 10, t * 0.7 * d, c[0]));
      g.strokeStyle = c[0]; g.lineWidth = 8; g.beginPath(); g.moveTo(0, H * 0.9); g.lineTo(W * 0.15, H * 0.9); g.lineTo(W * 0.15, H * 0.55); g.stroke();
      for(let i = 0; i < 3; i++){ const x = wrapX(W * (0.08 + i * 0.06) - off, W), y = H * 0.42 + i * 4; g.fillStyle = 'rgba(30,40,60,0.35)'; rrect(g, x, y, 34, 24, 4); g.fill(); g.fillStyle = (Math.floor(t * 3 + i) % 2) ? 'rgba(70,255,160,0.8)' : 'rgba(255,90,120,0.8)'; g.fillRect(x + 6, y + 8, 6, 6); }
      emo(g, '🤖', wrapX(W * 0.88 - off, W), H * 0.86 - 30, 48, 0.75); emo(g, '🔬', wrapX(W * 0.78 - off, W), H * 0.86 - 22, 32, 0.6); g.restore();
    },
    space(g, W, H, off, t, M){ // 🪐 stars + planets + a rocket
      for(let i = 0; i < 50; i++){ g.fillStyle = '#fff'; g.globalAlpha = 0.25 + 0.35 * Math.abs(Math.sin(t * 1.5 + i)); g.fillRect(((i * 97.3) % W + W - off * 0.3) % W, (i * 53.7) % (H * 0.8), 2, 2); }
      g.globalAlpha = 0.55; g.fillStyle = '#7B6CF6'; g.beginPath(); g.arc(wrapX(W * 0.86 - off * 0.5, W), H * 0.24, 38, 0, 6.29); g.fill();
      g.strokeStyle = 'rgba(255,220,150,0.8)'; g.lineWidth = 4; g.beginPath(); g.ellipse(wrapX(W * 0.86 - off * 0.5, W), H * 0.24, 62, 14, -0.3, 0, 6.29); g.stroke();
      g.fillStyle = '#FF9F68'; g.beginPath(); g.arc(wrapX(W * 0.12 - off * 0.5, W), H * 0.7, 24, 0, 6.29); g.fill(); g.globalAlpha = 1;
      emo(g, '🚀', wrapX(W * 0.1 + t * 40 - off, W), H * 0.35 - t * 10, 38, 0.8);
    },
    olympus(g, W, H, off, t, M){ // ☁️ clouds + columns + lightning
      g.fillStyle = 'rgba(255,255,255,0.55)';
      for(let i = 0; i < 6; i++){ const x = wrapX(W * (i / 6) + t * 10 - off, W), y = H * (0.18 + (i % 3) * 0.2); g.beginPath(); g.arc(x, y, 22, 0, 6.29); g.arc(x + 26, y - 10, 28, 0, 6.29); g.arc(x + 54, y, 20, 0, 6.29); g.fill(); }
      [0.04, 0.12, 0.88, 0.96].forEach(p => { const x = wrapX(W * p - off, W); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x - 10, H * 0.5, 20, H * 0.36); g.fillRect(x - 15, H * 0.48, 30, 8); g.fillRect(x - 15, H * 0.85, 30, 8); });
      if(Math.floor(t * 1.3) % 4 === 0) emo(g, '⚡', W * 0.84, H * 0.16, 40, 0.8);
      emo(g, '🏛️', wrapX(W * 0.5 - off, W), H * 0.9, 50, 0.35);
    }
  };
  // 🚲 road + rolling hills that slide sideways; 🛝 slide + swings + seesaw
  function roadLayer(g, W, H, t){
    const gy = H * 0.68; g.fillStyle = 'rgba(70,140,90,0.55)';
    g.beginPath(); g.moveTo(0, gy); for(let x = 0; x <= W; x += 20) g.lineTo(x, gy - 30 - Math.sin((x + t * 40) / 120) * 22); g.lineTo(W, gy); g.fill();
    const ry = H * 0.88; g.fillStyle = 'rgba(60,60,80,0.55)'; g.fillRect(0, ry - 16, W, 34);
    g.fillStyle = 'rgba(255,255,255,0.85)'; for(let x = -((t * 160) % 80); x < W; x += 80) g.fillRect(x, ry, 40, 4);
    g.fillStyle = 'rgba(255,240,180,0.9)'; g.beginPath(); g.arc(W * 0.82, H * 0.3, 40, 0, 6.29); g.fill();
  }
  function parkLayer(g, W, H, t){
    const gy = H * 0.86, c = 'rgba(255,90,90,0.55)', b = 'rgba(60,110,200,0.5)';
    // slide (left)
    g.strokeStyle = b; g.lineWidth = 6; g.beginPath(); g.moveTo(W * 0.05, gy); g.lineTo(W * 0.05, gy - 120); g.moveTo(W * 0.1, gy); g.lineTo(W * 0.1, gy - 120); g.stroke();
    g.strokeStyle = c; g.lineWidth = 12; g.beginPath(); g.moveTo(W * 0.1, gy - 118); g.quadraticCurveTo(W * 0.17, gy - 90, W * 0.22, gy - 4); g.stroke();
    // swings (right)
    g.strokeStyle = b; g.lineWidth = 6; g.beginPath(); g.moveTo(W * 0.78, gy); g.lineTo(W * 0.82, gy - 130); g.lineTo(W * 0.96, gy - 130); g.lineTo(W * 1.0, gy); g.stroke();
    [0.855, 0.925].forEach((x, i) => { const a = Math.sin(t * 2.2 + i * 2) * 0.35, px = W * x, py = gy - 130; g.save(); g.translate(px, py); g.rotate(a); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-8, 0); g.lineTo(-8, 92); g.moveTo(8, 0); g.lineTo(8, 92); g.stroke(); g.fillStyle = c; g.fillRect(-12, 90, 24, 6); g.restore(); });
    // seesaw (front, middle-left)
    const a = Math.sin(t * 2.6) * 0.18, sx = W * 0.3; g.save(); g.translate(sx, gy - 16); g.rotate(a); g.fillStyle = c; rrect(g, -70, -4, 140, 8, 4); g.fill(); g.restore();
    g.fillStyle = b; g.beginPath(); g.moveTo(sx - 12, gy); g.lineTo(sx, gy - 16); g.lineTo(sx + 12, gy); g.fill();
  }
  // ---------- 🎉 special days (back + front layers) ----------
  const SPECIAL_BACK = {
    birthday(g, W, H, t){ // bunting + balloons + a big cake
      const cols = ['#FF4D8D', '#FFD93D', '#3D8BFD', '#46D3A6', '#C38BFF'];
      for(let i = 0; i < 18; i++){ const x = i / 17 * W, y = 18 + Math.sin(i / 17 * Math.PI) * 30; g.fillStyle = cols[i % 5]; g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x + 14, y); g.lineTo(x, y + 26); g.fill(); }
      for(let i = 0; i < 7; i++){ const x = W * ((i * 0.153 + 0.04) % 1), y = H - ((t * 30 + i * 140) % (H + 60)); emo(g, '🎈', x, y, 34, 0.75); }
      emo(g, '🎂', W * 0.1, H * 0.78, 70, 0.95); emo(g, '🎁', W * 0.9, H * 0.8, 50, 0.9);
    },
    songkran(g, W, H, t){ // water arcs + splashes
      g.strokeStyle = 'rgba(80,170,255,0.55)'; g.lineWidth = 5;
      for(let i = 0; i < 3; i++){ const x0 = i % 2 ? W : 0, d = i % 2 ? -1 : 1, ph = (t * 0.9 + i * 0.33) % 1; g.beginPath(); for(let q = 0; q <= ph; q += 0.05){ const x = x0 + d * q * W * 0.45, y = H * (0.75 - i * 0.15) - Math.sin(q * Math.PI) * H * 0.25; q === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
      emo(g, '🐘', W * 0.08, H * 0.8, 60, 0.85); emo(g, '💦', W * 0.92, H * 0.78, 44, 0.85);
    },
    loykrathong(g, W, H, t){ // full moon + river + floating krathongs + rising lanterns
      g.fillStyle = 'rgba(10,20,50,0.45)'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#FFF4C2'; g.globalAlpha = 0.9; g.beginPath(); g.arc(W * 0.85, H * 0.16, 34, 0, 6.29); g.fill();
      g.globalAlpha = 0.35; g.fillStyle = '#2B5C9E'; g.fillRect(0, H * 0.84, W, H * 0.16); g.globalAlpha = 1;
      for(let i = 0; i < 6; i++){ const x = wrapX(W * (i / 6) + t * 14, W), y = H * 0.89 + Math.sin(t * 1.5 + i) * 3; g.fillStyle = 'rgba(255,200,90,0.35)'; g.beginPath(); g.arc(x, y - 18, 16, 0, 6.29); g.fill(); emo(g, '🪷', x, y, 30, 0.95); }
      for(let i = 0; i < 9; i++){ const x = W * ((i * 0.117 + 0.05) % 1) + Math.sin(t + i) * 10, y = H * 0.8 - ((t * 22 + i * 60) % (H * 0.8)); g.fillStyle = 'rgba(255,170,60,0.85)'; rrect(g, x - 7, y - 10, 14, 18, 5); g.fill(); g.fillStyle = 'rgba(255,220,120,0.3)'; g.beginPath(); g.arc(x, y, 14, 0, 6.29); g.fill(); }
    },
    newyear(g, W, H, t){ g.fillStyle = 'rgba(10,10,40,0.4)'; g.fillRect(0, 0, W, H); },
    halloween(g, W, H, t){ // moon, pumpkins, bats, a friendly ghost
      g.fillStyle = 'rgba(40,20,70,0.4)'; g.fillRect(0, 0, W, H); g.fillStyle = '#FFE9A8'; g.globalAlpha = 0.85; g.beginPath(); g.arc(W * 0.86, H * 0.16, 36, 0, 6.29); g.fill(); g.globalAlpha = 1;
      for(let i = 0; i < 5; i++) emo(g, '🦇', wrapX(W * (i / 5) + t * 50, W), H * (0.12 + (i % 3) * 0.08) + Math.sin(t * 6 + i) * 6, 26, 0.8, i % 2 === 0);
      emo(g, '🎃', W * 0.08, H * 0.82, 56); emo(g, '🎃', W * 0.94, H * 0.84, 44); emo(g, '👻', W * 0.15, H * 0.4 + Math.sin(t * 2) * 10, 44, 0.8);
    },
    christmas(g, W, H, t){ emo(g, '🎄', W * 0.09, H * 0.76, 90); emo(g, '🎁', W * 0.92, H * 0.82, 46); emo(g, '⛄', W * 0.86, H * 0.78, 58, 0.95); }
  };
  const SPECIAL_FRONT = {
    newyear(g, W, H, t){ // fireworks bursts
      const cols = ['#FFD93D', '#FF4D8D', '#46D3A6', '#7AA8FF', '#fff'];
      for(let b = 0; b < 5; b++){ const ph = (t * 0.75 + b * 0.21) % 1, cx = W * (0.1 + b * 0.2), cy = H * (0.16 + (b % 2) * 0.14); g.globalAlpha = Math.min(1, (1 - ph) * 1.4);
        for(let k = 0; k < 18; k++){ const a = k / 18 * 6.283, d = ph * 95; g.strokeStyle = cols[(b + k) % 5]; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + Math.cos(a) * d * 0.7, cy + Math.sin(a) * d * 0.7 + ph * ph * 24); g.lineTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d + ph * ph * 24); g.stroke(); } }
    },
    christmas(g, W, H, t){ g.fillStyle = '#fff'; g.strokeStyle = 'rgba(110,150,210,0.7)'; g.lineWidth = 1; for(let i = 0; i < 70; i++){ const x = (i * 71.3 + Math.sin(t + i) * 20) % W, y = ((i * 37.1 + t * 40 * (0.6 + (i % 4) * 0.2)) % (H + 10)); g.globalAlpha = 0.95; g.beginPath(); g.arc(x, y, 2.2 + (i % 3) * 1.2, 0, 6.29); g.fill(); g.stroke(); } },   // ws-2b: outlined flakes show on light moods too
    songkran(g, W, H, t){ g.fillStyle = 'rgba(90,180,255,0.75)'; for(let i = 0; i < 40; i++){ const x = (i * 53.1) % W, y = ((i * 29.7 + t * 260) % (H + 20)) - 10; g.beginPath(); g.ellipse(x, y, 2, 5, 0, 0, 6.29); g.fill(); } }
  };
  function col(i){ return getComputedStyle(S.el).getPropertyValue('--ws-l' + (i + 1)).trim() || '#FF4D8D'; }
  const LETTER_PAINT = {
    // 🧪 S: a little flask outline around the letter + bubbles rising out of it
    flask(g, r, p, t, i){
      const c = col(i), a = Math.max(0, 1 - Math.max(0, p - 0.7) / 0.3);
      g.save(); g.globalAlpha = a * 0.55; g.strokeStyle = c; g.lineWidth = 3;
      const cx = r.x + r.w / 2, top = r.y + r.h * 0.05, bot = r.y + r.h * 0.95, bw = r.w * 0.75;
      g.beginPath(); g.moveTo(cx - r.w * 0.16, top); g.lineTo(cx - r.w * 0.16, r.y + r.h * 0.38); g.lineTo(cx - bw, bot); g.lineTo(cx + bw, bot); g.lineTo(cx + r.w * 0.16, r.y + r.h * 0.38); g.lineTo(cx + r.w * 0.16, top); g.stroke();
      g.globalAlpha = a; g.fillStyle = c;
      for(let b = 0; b < 9; b++){ const q = (p * 1.6 + b / 9) % 1, x = cx + Math.sin(b * 2.3 + t * 4) * r.w * 0.3, y = bot - q * r.h * 1.15, s = 2 + (b % 3) * 1.8;
        g.globalAlpha = a * (1 - q) * 0.85; g.beginPath(); g.arc(x, y, s, 0, 6.29); g.fill(); }
      g.restore();
    },
    // ⚙️ T: gears spin in from both sides and click together
    gears(g, r, p, t, i){
      const c = col(i), e = 1 - Math.pow(1 - Math.min(1, p / 0.6), 3), a = Math.max(0, 1 - Math.max(0, p - 0.65) / 0.35);
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2, R0 = r.h * 0.2;
      g.save(); g.globalAlpha = a;
      gear(g, cx - r.w * 0.25 - (1 - e) * r.w * 1.2, cy - r.h * 0.12, R0, 10, t * 5, c);
      gear(g, cx + r.w * 0.25 + (1 - e) * r.w * 1.2, cy - r.h * 0.12, R0 * 0.8, 8, -t * 6.2, shadeHex(c));
      gear(g, cx, cy + r.h * 0.22 + (1 - e) * r.h, R0 * 0.7, 7, t * 7, c);
      g.restore();
    },
    // 🧱 E: blocks drop from above and stack into an E
    blocks(g, r, p, t, i){
      const c = col(i), cells = [[0,0],[1,0],[2,0],[0,1],[0,2],[1,2],[0,3],[0,4],[1,4],[2,4]], cw = r.w * 0.24, ch = r.h * 0.15, x0 = r.x + r.w * 0.16, y0 = r.y + r.h * 0.13;
      const a = Math.max(0, 1 - Math.max(0, p - 0.72) / 0.28);
      g.save(); g.globalAlpha = a;
      cells.slice().reverse().forEach(([cx, cy], n) => {
        const q = Math.max(0, Math.min(1, (p * 1.5 - n * 0.06) / 0.5)); if(q <= 0) return;
        const land = y0 + cy * ch, y = land - (1 - easeOutBounce(q)) * r.h * 1.2;
        g.fillStyle = n % 2 ? c : shadeHex(c); rrect(g, x0 + cx * cw + 1, y + 1, cw - 2, ch - 2, 4); g.fill();
      });
      g.restore();
    },
    // 🎨 A: paint splashes out from the middle (blobs + drips)
    paint(g, r, p, t, i){
      const c = col(i), cx = r.x + r.w / 2, cy = r.y + r.h * 0.55, e = 1 - Math.pow(1 - Math.min(1, p / 0.45), 3), a = Math.max(0, 1 - Math.max(0, p - 0.6) / 0.4);
      g.save(); g.globalAlpha = a * 0.9; g.fillStyle = c;
      for(let b = 0; b < 11; b++){ const ang = b * 2.4 + i, d = e * r.w * (0.45 + (b % 4) * 0.18), s = r.h * (0.05 + (b % 3) * 0.03) * (0.6 + e * 0.6);
        const x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d * 0.8; g.beginPath(); g.arc(x, y, s, 0, 6.29); g.fill();
        if(b % 3 === 0){ g.fillRect(x - s * 0.3, y, s * 0.6, s * 2.2 * e); } }
      g.beginPath(); g.arc(cx, cy, r.h * 0.22 * e, 0, 6.29); g.fill();
      g.restore();
    },
    // 🔢 M: numbers rain down into the letter
    numbers(g, r, p, t, i){
      const c = col(i), a = Math.max(0, 1 - Math.max(0, p - 0.7) / 0.3);
      g.save(); g.fillStyle = c; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 ' + Math.round(r.h * 0.2) + "px 'Fredoka',sans-serif";
      for(let n = 0; n < 12; n++){ const q = Math.max(0, Math.min(1, p * 1.4 - n * 0.04)); if(q <= 0) continue;
        const x = r.x + r.w * (0.12 + (n % 4) * 0.25), y = r.y - r.h * 0.6 + q * r.h * (0.9 + (n % 3) * 0.2);
        g.globalAlpha = a * (q < 0.9 ? 1 : (1 - q) * 10); g.fillText(String((n * 7 + 3) % 10), x, y); }
      g.restore();
    }
  };
  function sparkle(g, rects, p, t){
    g.save();
    rects.forEach((r, i) => { const s = Math.sin(p * Math.PI) * r.h * 0.12, x = r.x + r.w * (0.2 + (i % 2) * 0.6), y = r.y + r.h * 0.18;
      g.globalAlpha = Math.sin(p * Math.PI); g.fillStyle = '#fff';
      g.beginPath(); for(let k = 0; k < 8; k++){ const a = k * Math.PI / 4 + t * 2, rr = k % 2 ? s * 0.3 : s; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); });
    g.restore();
  }
  function gear(g, x, y, r, teeth, rot, c){
    g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = c; g.beginPath();
    for(let k = 0; k < teeth * 2; k++){ const a0 = k * Math.PI / teeth, a1 = (k + 1) * Math.PI / teeth, rr = k % 2 ? r : r * 1.28; g.arc(0, 0, rr, a0, a1); }
    g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.arc(0, 0, r * 0.35, 0, 6.29); g.fill(); g.restore();
  }
  function shadeHex(c){ return /^#[0-9a-f]{6}$/i.test(c) && typeof shade === 'function' ? shade(c, 0.78) : c; }
  function easeOutBounce(x){ const n = 7.5625, d = 2.75; if(x < 1 / d) return n * x * x; if(x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if(x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; }

  function drawParade(g, t){
    if(!S.actors.length || !S.rects) return;
    const M = MOODS[S.mood], run = S.mode === 'full' ? 0.85 : 0.3, hero = heroAt();
    // ground line
    const st = S.rects.stage; g.save(); g.globalAlpha = 0.18; g.fillStyle = '#000'; g.beginPath(); g.ellipse(st.x + st.w / 2, S.actors[0].feet + 2, st.w * 0.48, 7, 0, 0, 6.29); g.fill(); g.restore();
    const order = S.actors.slice().sort((a, b) => (a.last ? 1 : 0) - (b.last ? 1 : 0));
    order.forEach(a => {
      const lt = t - a.enter - a.delay; if(lt < 0 && !S.rm && !S.skipped) return;
      const p = S.rm || S.skipped ? 1 : Math.min(1, lt / run), e = 1 - Math.pow(1 - p, 2);
      let x = a.sx + (a.tx - a.sx) * e, feet = a.feet, k = a.k, dir = a.side < 0 ? 1 : -1;
      const walking = p < 1;
      let hopY = walking && !S.rm ? Math.abs(Math.sin(lt * 9)) * 12 * a.k * M.hop : 0;
      if(walking && !S.rm){   // how this mood's avatars arrive
        if(M.entry === 'land'){ x = a.tx; hopY = (1 - e) * 260; }                                   // 🎬 drop from the sky like heroes
        else if(M.entry === 'bounce'){ x = a.tx; hopY = Math.abs(Math.cos(p * Math.PI * 2.5)) * (1 - p) * 180; }   // 🛝 trampoline
        else if(M.entry === 'dodge'){ hopY = Math.max(0, Math.sin(p * Math.PI * 2)) * 40; }        // ☄️ jump over a comet trail
        else if(M.entry === 'stroll'){ x = a.sx + (a.tx - a.sx) * p; }                            // ☕ slow walk
      }
      let gest = null;
      if(!walking){
        dir = a.tx < st.x + st.w / 2 - 4 ? 1 : a.tx > st.x + st.w / 2 + 4 ? -1 : 1;
        if(a.last && !S.guest){ const s = Math.min(1, Math.max(0, (t - hero) / 0.35)); k *= 1 + 0.16 * s; feet += 3 * s; }
        if(!S.rm){
          a.gt = t - (a.gStart || 0);
          if(!a.gest || a.gt > a.gest.d + 0.3){
            if(t >= (a.gNext || 0)){ const key = a.last && !S.guest && !a.waved && t >= hero ? 'wave' : M.gests[Math.floor(Math.random() * M.gests.length)];
              a.gest = GESTURES.find(x => x.k === key) || null; a.gStart = t; a.gt = 0; a.waved = a.waved || key === 'wave'; a.gNext = t + (a.gest ? a.gest.d : 1) + R(0.3, 1.2); }
            else a.gest = null;
          }
          gest = a.gest ? {g: a.gest, t: a.gt} : null;
        }
      }
      const riding = M.entry === 'ride';
      try { drawAvatar(g, {name: a.name, av: a.av, dir: riding ? 1 : dir, walkT: (walking || riding) && !S.rm ? lt + 0.01 : 0, gest: gest, jumpH: hopY / Math.max(0.3, a.k), land: M.entry === 'land' && p >= 1 && lt - run < 0.15 ? 0.15 - (lt - run) : 0}, x, feet, k, {t: S.rm ? 1 : t, noShadow: false}); }
      catch(err){ emo(g, '🙂', x, feet - 40 * k, 40 * k); }
      if(a.bday) partyHat(g, x, feet - (hopY + 84) * k, k);
      if(S.guest || S.actors.length > 1){ g.save(); g.font = '800 ' + Math.max(10, Math.round(11 * Math.min(1.4, a.k))) + "px 'Nunito',sans-serif"; g.textAlign = 'center'; g.textBaseline = 'top';
        const label = a.name.length > 14 ? a.name.slice(0, 13) + '…' : a.name, tw = g.measureText(label).width + 10;
        g.globalAlpha = walking ? 0 : 0.9; g.fillStyle = a.last ? '#FF4D8D' : 'rgba(255,255,255,0.85)'; rrect(g, x - tw / 2, feet + 4, tw, 16, 8); g.fill();
        g.fillStyle = a.last ? '#fff' : '#5B2A4A'; g.fillText(label, x, feet + 6); g.restore(); }
    });
  }

  function partyHat(g, x, y, k){
    g.save(); g.translate(x, y); g.fillStyle = '#FF4D8D'; g.beginPath(); g.moveTo(-10 * k, 0); g.lineTo(10 * k, 0); g.lineTo(0, -24 * k); g.closePath(); g.fill();
    g.fillStyle = '#FFD93D'; g.beginPath(); g.moveTo(-6.5 * k, -8 * k); g.lineTo(6.5 * k, -8 * k); g.lineTo(5 * k, -12 * k); g.lineTo(-5 * k, -12 * k); g.fill();
    g.beginPath(); g.arc(0, -25 * k, 3.5 * k, 0, 6.29); g.fill(); g.restore();
  }

  // ---------- exit: logo flies into the Dashboard corner, curtain opens ----------
  function finish(){
    if(S.out || !S.on) return;
    S.out = true; S.events.push({k: 'exit', t: elapsed()});
    S.letters.forEach(l => l.classList.add('on'));
    const logo = S.el.querySelector('.ws-logo'), target = document.querySelector('.dash-head .brand') || document.querySelector('.brand');
    let fly = null;
    if(logo && target && !S.rm && logo.animate){
      const a = logo.getBoundingClientRect(), b = target.getBoundingClientRect();
      if(a.width && b.width){
        const sc = Math.max(0.12, Math.min(1, b.height / a.height * 1.1)), dx = (b.left + b.height * 0.5 + a.width * sc / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
        S.fly = {from: {x: a.left, y: a.top, w: a.width, h: a.height}, to: {x: b.left, y: b.top, w: b.width, h: b.height}, dx: dx, dy: dy, sc: sc};
        fly = logo.animate([{transform: 'none', opacity: 1}, {transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc + ')', opacity: 0.85, offset: 0.85}, {transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc + ')', opacity: 0}], {duration: 680, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards'});
      }
    } else if(logo){ logo.style.transition = 'opacity .3s'; logo.style.opacity = '0'; }
    S.el.classList.add('out');
    setTimeout(end, S.rm ? 380 : 700);
  }
  function end(){
    if(!S.on) return;
    S.on = false; S.endedAt = elapsed(); cancelAnimationFrame(S.raf);
    removeEventListener('resize', measure); document.removeEventListener('keydown', onKey);
    S.el.classList.add('hidden'); S.done = true;
    releaseToasts();
    S.events.push({k: 'done', t: S.endedAt});
    try { document.dispatchEvent(new CustomEvent('ws:done', {detail: state()})); } catch(e){}
  }
  function state(){
    return {on: S.on, done: S.done, out: S.out, mode: S.mode, mood: S.mood, scene: S.scene ? S.scene.k : null, special: S.special ? S.special.k : null, specialWho: S.special && S.special.all || null, hero: S.hero || null, hiText: (document.getElementById('ws-hi') || {}).textContent || '', tip: S.tip || null, jingle: {on: jingleOn(), played: !!S.jinglePlayed, waiting: !!S.jingleWait}, dayText: (document.getElementById('ws-day') || {}).textContent || '', dur: S.dur, ready: S.ready, readyAt: S.readyAt, skipped: S.skipped, guest: S.guest,
      parade: S.actors.map(a => a.name), last: S.last, steps: S.steps.slice(), stepAt: Object.assign({}, S.stepAt), shown: S.shown, endedAt: S.endedAt, fly: S.fly || null, rm: S.rm, app: S.app || null, events: S.events.slice()};
  }
  function whenDone(){ return new Promise(res => { if(S.done || !S.el) res(state()); else document.addEventListener('ws:done', () => res(state()), {once: true}); }); }

  return {start, cast, step, ready, skip, state, whenDone, pickParade, guestCrew, dayKey, isPhone, pickMood, sceneOfDay, specialFor, MOODS, MOOD_KEYS, SCENES, STEPS, FUN_NAMES, LOY_KRATHONG, WS_FACTS, JINGLES, pickTip};
})();
