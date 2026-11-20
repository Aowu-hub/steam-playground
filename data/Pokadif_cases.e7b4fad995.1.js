
// 📖 CASE DATA START — ✂️ pk-7a2: the 14 case books, moved word for word from the Pokadif engine (PK.addCases fills the shelf stubs)
PK.addCases([
    { id: 'magnet', n: 1, icon: '🧲', name: 'The Missing Magnet', theme: 'robot', topic: 'Magnets', place: 'the Robot Lab', owner: 'Professor Volt', thing: 'super magnet', walkTo: 'storeroom', dropAt: 'by the shelf',
      open: '🧲 Professor Volt\'s super magnet is GONE from the Robot Lab! Someone sneaked in last night…',
      suspects: [['🤖', 'Bolt the Robot'], ['🐱', 'Whiskers the Cat'], ['🧑‍🔬', 'Dr. Nutty'], ['🦜', 'Pip the Parrot'], ['🧒', 'Tinker the Helper']],
      drops: [['🍪', 'cookie crumbs'], ['🐟', 'a fish bone'], ['🍌', 'a banana peel'], ['🪶', 'a green feather'], ['🧦', 'a stripy sock'], ['🍬', 'a sweet wrapper']],
      clutter: ['gear', 'dice', 'hexagon', 'crystal', 'square', 'rocket', 'clip', 'nail'],
      count: '⚙️',
      chapters: [
        { title: 'The empty table', icon: '🧪', say: 'The magnet\'s table is empty — but the floor is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'The trail', icon: '👣', say: 'The footprints lead out of the lab. Follow them to the storeroom — then check the camera!', steps: ['walk', 'spot'] },
        { title: 'The locked box', icon: '🔐', say: 'A locked box in the storeroom… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🧲', title: 'Magnets pull iron', text: 'A magnet pulls things made of iron or steel — paper clips, nails, pins. Wood, plastic, glass and paper? Nothing happens!' },
        { icon: '🧭', title: 'Two poles: N and S', text: 'Every magnet has a North end and a South end. N + S pull together — N + N (or S + S) push apart!' },
        { icon: '🌍', title: 'The Earth is a magnet', text: 'The whole Earth is a giant magnet. That\'s why a compass needle always points North!' }
      ],
      quiz: { ask: 'The thief\'s magnet pulled something along the floor. Which one can a magnet pull?', nope: 'Which one will a magnet NOT pull?',
        yes: [['📎', 'paper clip'], ['🔩', 'steel bolt'], ['🧷', 'safety pin'], ['⛓️', 'iron chain'], ['🪛', 'screwdriver'], ['🪝', 'steel hook']],
        no: [['🦆', 'rubber duck'], ['🧸', 'teddy bear'], ['✏️', 'pencil'], ['🍎', 'apple'], ['📄', 'paper'], ['🎈', 'balloon'], ['🪵', 'wood block'], ['🥤', 'plastic cup']],
        trick: [['💍', 'gold ring'], ['🍪', 'cookie']], why: { yes: 'has iron in it — a magnet pulls it!', no: 'has no iron in it — a magnet can\'t pull it.' } },
      solved: 'The super magnet is back on its table — and it pulls every paper clip in the lab! 📎📎📎' },
    // 🦖 pk-3b
    { id: 'dino', n: 2, icon: '🦖', name: 'The Dino Egg Thief', theme: 'dino', topic: 'Fossils', place: 'the Dino Museum', owner: 'Ranger Rocky', thing: 'golden dino egg', walkTo: 'dig tent', dropAt: 'by the bones',
      open: '🦖 The golden dino egg is GONE from the Dino Museum! Ranger Rocky found muddy prints everywhere…',
      suspects: [['🦕', 'Dotty the Dino'], ['🐒', 'Mango the Monkey'], ['🧑‍🌾', 'Farmer Fern'], ['🦉', 'Hoot the Owl'], ['🐢', 'Shelly the Turtle']],
      drops: [['🍃', 'a big leaf'], ['🍌', 'a banana peel'], ['🌰', 'an acorn'], ['🪶', 'a brown feather'], ['🥕', 'a carrot top'], ['🍓', 'a strawberry']],
      clutter: ['bone', 'leaf', 'tree', 'mushroom', 'crystal', 'triangle', 'snail', 'flower'],
      count: '🥚',
      chapters: [
        { title: 'The empty nest', icon: '🪺', say: 'The golden egg\'s nest is empty — and the mud is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Into the jungle', icon: '🌴', say: 'The prints run into the jungle. Follow them to the dig tent — then check the dig camera!', steps: ['walk', 'spot'] },
        { title: 'The locked crate', icon: '🔐', say: 'A locked crate in the dig tent… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🦴', title: 'What is a fossil?', text: 'A fossil is a bone, shell or footprint from long, long ago that slowly turned into stone.' },
        { icon: '🪨', title: 'Layers of rock', text: 'Rock is made in layers, like a cake. The deeper the layer, the older the fossils inside it!' },
        { icon: '🦖', title: 'Dinosaurs were real', text: 'Dinosaurs lived millions of years ago. We know them from their fossils — bones, teeth, eggs and footprints!' }
      ],
      quiz: { ask: 'Ranger Rocky shows you some finds. Which one is a real fossil?', nope: 'Which one is NOT a fossil?',
        yes: [['🦴', 'dinosaur bone'], ['🦷', 'old dino tooth'], ['🐚', 'stone shell'], ['🌿', 'leaf print in rock'], ['🐾', 'footprint in stone'], ['🥚', 'stone egg']],
        no: [['🧸', 'teddy bear'], ['🍌', 'banana'], ['⚽', 'football'], ['🧦', 'sock'], ['🚗', 'toy car'], ['📱', 'phone'], ['🍕', 'pizza'], ['🎈', 'balloon']],
        trick: [['🪨', 'plain rock'], ['🦕', 'toy dinosaur']], why: { yes: 'is part of a living thing from long ago, turned to stone — a fossil!', no: 'was never a living thing from long ago — not a fossil.' } },
      solved: 'The golden egg is back in its nest — and it just started to wiggle! 🥚✨' },
    // 🐙 pk-3b
    { id: 'ship', n: 3, icon: '🐙', name: 'Secret of the Sunken Ship', theme: 'sea', topic: 'Floating + sinking', place: 'the Sunken Ship', owner: 'Captain Coral', thing: 'treasure map', walkTo: 'shipwreck', dropAt: 'by the treasure chest',
      open: '🐙 Captain Coral\'s treasure map has vanished from the Sunken Ship! Someone swam in at high tide…',
      suspects: [['🐙', 'Inky the Octopus'], ['🦀', 'Pinchy the Crab'], ['🐬', 'Splash the Dolphin'], ['🧜', 'Marina the Mermaid'], ['🐧', 'Waddles the Penguin']],
      drops: [['🐟', 'a fish bone'], ['🫧', 'a trail of bubbles'], ['🪸', 'a bit of coral'], ['🦐', 'a shrimp shell'], ['🌊', 'sea foam'], ['🧽', 'a sponge']],
      clutter: ['coin', 'shell', 'fish', 'star', 'boat', 'crystal', 'hexagon', 'snail'],
      count: '🐚',
      chapters: [
        { title: 'The empty chest', icon: '🧰', say: 'The map\'s treasure chest is empty — and the wet sand is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Down to the wreck', icon: '🚢', say: 'The prints lead down to the old shipwreck. Swim the way there — then check the reef camera!', steps: ['walk', 'spot'] },
        { title: 'The locked trunk', icon: '🔐', say: 'A locked trunk on the shipwreck… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🛟', title: 'Why things float', text: 'Light, airy things float. Heavy, solid things sink. Water pushes up on everything — that push is called buoyancy!' },
        { icon: '🚢', title: 'How ships float', text: 'A steel ship is heavy, but its shape is full of air — so the water can push it up. Shape matters!' },
        { icon: '🌊', title: 'Salty water', text: 'Salty sea water pushes up harder than fresh water — that is why it is easier to float in the sea!' }
      ],
      quiz: { ask: 'Captain Coral drops things into the water. Which one will float?', nope: 'Which one will NOT float — it sinks?',
        yes: [['🪵', 'wood log'], ['🦆', 'rubber duck'], ['🥥', 'coconut'], ['🏐', 'beach ball'], ['🧊', 'ice cube'], ['🍎', 'apple']],
        no: [['🪨', 'rock'], ['⚓', 'anchor'], ['🔑', 'key'], ['🔩', 'steel bolt'], ['💍', 'ring'], ['🪙', 'coin'], ['🧱', 'brick'], ['🥄', 'metal spoon']],
        trick: [['🥚', 'fresh egg'], ['🧲', 'magnet']], why: { yes: 'is light and full of air — it floats!', no: 'is heavy and solid — it sinks.' } },
      solved: 'The treasure map is back in Captain Coral\'s chest — X marks the spot! 🗺️' },
    // 🪩 pk-4b
    { id: 'disco', n: 4, icon: '🪩', name: 'The Stolen Disco Ball', theme: 'disco', topic: 'Light + colour', place: 'the Disco Hall', owner: 'DJ Sparkle', thing: 'disco ball', walkTo: 'light booth', dropAt: 'by the speakers',
      open: '🪩 The giant disco ball is GONE from the Disco Hall! DJ Sparkle found glittery footprints all over the dance floor…',
      suspects: [['🦩', 'Flick the Flamingo'], ['🐈', 'Neon the Cat'], ['🤖', 'Beep-Bop the Robot'], ['🦜', 'Rio the Parrot'], ['🐼', 'Bamboo the Panda']],
      drops: [['✨', 'some glitter'], ['🎧', 'a headphone pad'], ['🍭', 'a lollipop'], ['🎀', 'a ribbon'], ['🕶️', 'sunglasses'], ['🧃', 'a juice box']],
      clutter: ['star', 'diamond', 'balloon', 'heart', 'circle', 'crystal', 'hexagon', 'dice'],
      count: '💡',
      chapters: [
        { title: 'The empty stage', icon: '🎤', say: 'The disco ball is gone from the stage — and the dance floor is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Behind the lights', icon: '💡', say: 'The prints lead past the speakers. Find the way to the light booth — then check the stage camera!', steps: ['walk', 'spot'] },
        { title: 'The locked case', icon: '🔐', say: 'A locked case in the light booth… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🌈', title: 'White light is a rainbow', text: 'White light is really ALL the colours mixed. A raindrop or a prism splits it into a rainbow!' },
        { icon: '🪞', title: 'Mirrors bounce light', text: 'Light goes in straight lines. A mirror bounces it back — a disco ball is hundreds of tiny mirrors!' },
        { icon: '🎨', title: 'Mixing light', text: 'Red, green and blue light mix to make white. A TV screen makes every colour from just those three!' }
      ],
      quiz: { ask: 'DJ Sparkle turns off all the lights. Which one makes its OWN light?', nope: 'Which one does NOT make its own light?',
        yes: [['☀️', 'the Sun'], ['💡', 'light bulb'], ['🔦', 'torch'], ['🕯️', 'candle'], ['🔥', 'campfire'], ['⚡', 'lightning']],
        no: [['🧸', 'teddy bear'], ['🍎', 'apple'], ['📚', 'book'], ['⚽', 'football'], ['🥄', 'spoon'], ['🧦', 'sock'], ['🪨', 'rock'], ['🧢', 'cap']],
        trick: [['🌙', 'the Moon'], ['🪞', 'mirror']], why: { yes: 'makes its own light!', no: 'makes no light — we only see it when light bounces off it.' } },
      solved: 'The disco ball is spinning again — the whole hall sparkles! 🪩✨' },
    // 🪐 pk-4b
    { id: 'moon', n: 5, icon: '🪐', name: 'Moon Base Mystery', theme: 'space', topic: 'Gravity', place: 'Moon Base One', owner: 'Commander Luna', thing: 'shiny moon rock', walkTo: 'rocket dock', dropAt: 'by the airlock',
      open: '🪐 The shiny moon rock is missing from Moon Base One! Commander Luna found bouncy boot prints in the moon dust…',
      suspects: [['👽', 'Zib the Alien'], ['🐶', 'Laika the Space Dog'], ['🤖', 'Rover the Robot'], ['🧑‍🚀', 'Cadet Comet'], ['🐒', 'Astro the Monkey']],
      drops: [['🧃', 'a space juice pouch'], ['🔩', 'a loose bolt'], ['🍦', 'freeze-dried ice cream'], ['🧤', 'a space glove'], ['📡', 'a tiny antenna'], ['⭐', 'a star sticker']],
      clutter: ['planet', 'rocket', 'star', 'crystal', 'circle', 'gear', 'diamond', 'hexagon'],
      count: '🌑',
      chapters: [
        { title: 'The empty glass case', icon: '🗄️', say: 'The moon rock\'s glass case is empty — and the moon dust is full of boot prints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Across the craters', icon: '🌑', say: 'The prints bounce away across the craters. Find the way to the rocket dock — then check the base camera!', steps: ['walk', 'spot'] },
        { title: 'The locked locker', icon: '🔐', say: 'A locked locker at the rocket dock… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🍎', title: 'What is gravity?', text: 'Gravity is a pull. The Earth pulls everything down to the ground — that is why a dropped apple falls.' },
        { icon: '🪶', title: 'Feather and hammer', text: 'On the Moon there is no air. An astronaut dropped a hammer and a feather — they landed at the same time!' },
        { icon: '🌙', title: 'Big jumps on the Moon', text: 'The Moon pulls 6 times weaker than the Earth. You could jump 6 times higher there!' }
      ],
      quiz: { ask: 'Here on Earth, Commander Luna lets go of some things. Which one falls down FAST?', nope: 'Which one does NOT fall fast — the air slows it down?',
        yes: [['🪨', 'rock'], ['🍎', 'apple'], ['⚽', 'football'], ['🔑', 'key'], ['📚', 'book'], ['👟', 'shoe']],
        no: [['🪶', 'feather'], ['🍃', 'leaf'], ['🎈', 'balloon'], ['🫧', 'bubble'], ['❄️', 'snowflake'], ['☁️', 'cloud'], ['🧻', 'tissue'], ['🌬️', 'puff of wind']],
        trick: [['🪂', 'parachute'], ['🍂', 'big dry leaf']], why: { yes: 'is heavy and small — gravity pulls it down fast!', no: 'is light and catches the air — the air slows it down.' } },
      solved: 'The moon rock is back in its glass case — Commander Luna does a giant moon jump! 🌙🦘' },
    // ☁️ pk-4c
    { id: 'cloud', n: 6, icon: '☁️', name: 'The Cloud Castle Code', theme: 'sky', topic: 'Codes + patterns', place: 'the Cloud Castle', owner: 'Queen Nimbus', thing: 'rainbow crown', walkTo: 'tower top', dropAt: 'by the rainbow bridge',
      open: '☁️ Queen Nimbus\'s rainbow crown has vanished from the Cloud Castle! The thief left a secret code — and footprints in the fluffy clouds…',
      suspects: [['🦄', 'Sparkle the Unicorn'], ['🕊️', 'Pip the Dove'], ['🐉', 'Puff the Dragon'], ['🧚', 'Twinkle the Fairy'], ['🦅', 'Swoop the Eagle']],
      drops: [['🪶', 'a white feather'], ['🎀', 'a rainbow ribbon'], ['⭐', 'a star clip'], ['🍬', 'a sweet'], ['🎐', 'a wind chime'], ['🧁', 'a cupcake crumb']],
      clutter: ['cloud', 'bird', 'balloon', 'star', 'heart', 'diamond', 'hexagon', 'circle'],
      count: '🌈',
      chapters: [
        { title: 'The empty cushion', icon: '👑', say: 'The crown\'s cushion is empty — and the clouds are full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Up the rainbow', icon: '🌈', say: 'The prints climb the rainbow bridge. Find the way to the tower top — then check the castle camera!', steps: ['walk', 'spot'] },
        { title: 'The code door', icon: '🔐', say: 'A door with a secret code at the tower top… crack it, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🔁', title: 'Patterns repeat', text: 'A pattern is something that repeats: red, blue, red, blue… If you know the rule, you can guess what comes next!' },
        { icon: '🔐', title: 'Secret codes', text: 'A code swaps letters for numbers or pictures: A = 1, B = 2, C = 3… Spies and computers use codes to keep messages safe.' },
        { icon: '🐝', title: 'Patterns in nature', text: 'Bees build honeycomb from the same 6-sided shape again and again — and every snowflake has 6 arms!' }
      ],
      quiz: { ask: 'Queen Nimbus shows you some things. Which one has a pattern that REPEATS?', nope: 'Which one has NO repeating pattern?',
        yes: [['🦓', 'zebra stripes'], ['🐝', 'honeycomb'], ['❄️', 'snowflake'], ['🕸️', 'spider web'], ['🍍', 'pineapple'], ['🐯', 'tiger stripes']],
        no: [['🪨', 'pebble'], ['💧', 'water drop'], ['☁️', 'cloud'], ['🥔', 'potato'], ['🍞', 'bread'], ['🥚', 'egg'], ['🧈', 'butter'], ['🍦', 'ice cream']],
        trick: [['🧶', 'tangled wool'], ['🎨', 'paint splash']], why: { yes: 'has a pattern that repeats again and again!', no: 'has no repeating pattern — it is all mixed up.' } },
      solved: 'The rainbow crown is back on Queen Nimbus — and a rainbow shines over the castle! 👑🌈' },
    // 🌱 pk-4c
    { id: 'garden', n: 7, icon: '🌱', name: 'The Wilting Garden', theme: 'garden', topic: 'What plants need', place: 'the Greenhouse', owner: 'Grandma Bloom', thing: 'golden watering can', walkTo: 'tool shed', dropAt: 'by the tomato plants',
      open: '🌱 Grandma Bloom\'s golden watering can is gone — and her plants are drooping! Muddy footprints lead out of the Greenhouse…',
      suspects: [['🐌', 'Slowy the Snail'], ['🐰', 'Bun the Rabbit'], ['🐛', 'Wiggles the Caterpillar'], ['🐦', 'Chirp the Sparrow'], ['🦔', 'Spike the Hedgehog']],
      drops: [['🥕', 'a nibbled carrot'], ['🌰', 'a seed'], ['🍓', 'a strawberry'], ['🥬', 'a lettuce leaf'], ['🍄', 'a mushroom'], ['🌼', 'a petal']],
      clutter: ['flower', 'leaf', 'tree', 'mushroom', 'ladybug', 'snail', 'circle', 'heart'],
      count: '🌷',
      chapters: [
        { title: 'The dry pots', icon: '🪴', say: 'The watering can is gone and the pots are dry — the soil is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Through the veggie patch', icon: '🥕', say: 'The prints go through the veggie patch. Find the way to the tool shed — then check the garden camera!', steps: ['walk', 'spot'] },
        { title: 'The locked shed', icon: '🔐', say: 'The tool shed is locked… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '💧', title: 'Plants need water', text: 'Roots drink water from the soil and carry it all the way up to the leaves.' },
        { icon: '☀️', title: 'Food from light', text: 'Leaves use sunlight, air and water to make the plant\'s own food. That is why plants grow toward the light!' },
        { icon: '🪱', title: 'Good soil', text: 'Soil gives plants food and something to hold on to. Worms help by mixing it and making it soft.' }
      ],
      quiz: { ask: 'Grandma Bloom asks: which one does a plant NEED to grow?', nope: 'Which one does a plant NOT need to grow?',
        yes: [['💧', 'water'], ['☀️', 'sunlight'], ['🌬️', 'air'], ['🪱', 'good soil'], ['🌡️', 'warmth']],
        no: [['🍬', 'sweets'], ['🧃', 'juice'], ['🎮', 'video games'], ['🧸', 'teddy bear'], ['📺', 'TV'], ['🍕', 'pizza'], ['🎵', 'loud music'], ['👟', 'shoes']],
        trick: [['🥤', 'fizzy drink'], ['🧂', 'salt']], why: { yes: 'is something every plant needs to grow!', no: 'is not what a plant needs — water, light, air and soil are!' } },
      solved: 'The golden watering can is back — Grandma Bloom\'s flowers stand up tall again! 🌷💧' },
    // ⏰ pk-4c
    { id: 'clock', n: 8, icon: '⏰', name: 'The Clock That Ran Backwards', theme: 'clock', topic: 'Time + gears', place: 'the Clock Tower', owner: 'Mr Tick-Tock', thing: 'golden winding key', walkTo: 'gear room', dropAt: 'by the big bell',
      open: '⏰ The Clock Tower is ticking BACKWARDS! Someone took Mr Tick-Tock\'s golden winding key — dusty footprints climb the stairs…',
      suspects: [['🦉', 'Hoot the Owl'], ['🐭', 'Squeak the Mouse'], ['🦇', 'Flap the Bat'], ['🐿️', 'Nutty the Squirrel'], ['🧙', 'Wizard Whiz']],
      drops: [['🔩', 'a tiny screw'], ['⚙️', 'a little gear'], ['🧀', 'a cheese crumb'], ['🪶', 'a black feather'], ['🌰', 'an acorn'], ['🕯️', 'a candle stub']],
      clutter: ['gear', 'circle', 'star', 'house', 'diamond', 'hexagon', 'square', 'bird'],
      count: '🔔',
      chapters: [
        { title: 'The empty hook', icon: '🗝️', say: 'The golden key\'s hook is empty — and the dusty floor is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Up the stairs', icon: '🪜', say: 'The prints climb the winding stairs. Find the way to the gear room — then check the tower camera!', steps: ['walk', 'spot'] },
        { title: 'The locked clock case', icon: '🔐', say: 'The clock case is locked… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '⚙️', title: 'Gears turn each other', text: 'When one gear turns, the gear touching it turns the OTHER way. A clock uses lots of gears!' },
        { icon: '🕐', title: 'Hours and minutes', text: 'The short hand shows the hour, the long hand shows the minutes. One hour is 60 minutes.' },
        { icon: '🌍', title: 'The Earth is a clock', text: 'One spin of the Earth is one day. One trip all the way around the Sun is one year!' }
      ],
      quiz: { ask: 'Mr Tick-Tock asks: which one helps us tell the TIME?', nope: 'Which one does NOT tell the time?',
        yes: [['⏰', 'alarm clock'], ['⌚', 'watch'], ['⏳', 'sand timer'], ['🕰️', 'old clock'], ['📅', 'calendar'], ['⏱️', 'stopwatch']],
        no: [['🥄', 'spoon'], ['🧸', 'teddy bear'], ['🍎', 'apple'], ['👟', 'shoe'], ['🎈', 'balloon'], ['📚', 'book'], ['🧦', 'sock'], ['🪨', 'rock']],
        trick: [['🧭', 'compass'], ['🌡️', 'thermometer']], why: { yes: 'helps us tell the time!', no: 'does not tell the time.' } },
      solved: 'The golden key is back — tick, tock, the Clock Tower runs forwards again! ⏰✨' },
    // 🍰 pk-6b
    { id: 'cake', n: 9, icon: '🍰', name: 'The Great Cake Caper', theme: 'bakery', topic: 'Measuring + fractions', place: 'the Bakery', owner: 'Baker Bella', thing: 'prize-winning cake', walkTo: 'pantry', dropAt: 'by the big oven',
      open: '🍰 Baker Bella\'s prize-winning cake has vanished from the counter — just before the big contest! Floury footprints lead across the kitchen…',
      suspects: [['🐭', 'Nibbles the Mouse'], ['🐻', 'Honey the Bear'], ['🦊', 'Rusty the Fox'], ['🐷', 'Pinky the Pig'], ['🐒', 'Cheeky the Monkey']],
      drops: [['🍓', 'a strawberry'], ['🍫', 'a chocolate chip'], ['🧈', 'a pat of butter'], ['🥚', 'an eggshell'], ['🍒', 'a cherry'], ['🥄', 'a sticky spoon']],
      clutter: ['cupcake', 'donut', 'cherry', 'apple', 'mug', 'teapot', 'circle', 'heart'],
      count: '🧁',
      chapters: [
        { title: 'The empty cake stand', icon: '🎂', say: 'The cake stand is empty — and the floury floor is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Through the kitchen', icon: '🥐', say: 'The prints go past the ovens. Find the way to the pantry — then check the kitchen camera!', steps: ['walk', 'spot'] },
        { title: 'The locked pantry', icon: '🔐', say: 'The pantry door is locked… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '⚖️', title: 'Measuring', text: 'Bakers measure with scales, cups and spoons. The right amount of each thing makes the cake come out just right!' },
        { icon: '🍕', title: 'Halves and quarters', text: 'Cut a cake into 2 equal parts: each is a half. Cut it into 4 equal parts: each is a quarter. Equal means the same size!' },
        { icon: '🔥', title: 'Heat changes food', text: 'In the oven, runny batter turns into soft, spongy cake. Heat changed it — and it can\'t change back!' }
      ],
      quiz: { ask: 'Baker Bella asks: which one helps us MEASURE?', nope: 'Which one can NOT measure anything?',
        yes: [['⚖️', 'kitchen scale'], ['📏', 'ruler'], ['⏲️', 'timer'], ['🌡️', 'thermometer'], ['🥄', 'measuring spoon']],
        no: [['🎈', 'balloon'], ['🧸', 'teddy bear'], ['🎨', 'paint'], ['🍭', 'lollipop'], ['🧦', 'sock'], ['🎵', 'song'], ['🌸', 'flower'], ['🪁', 'kite']],
        trick: [['👀', 'just looking'], ['✋', 'a handful']], why: { yes: 'helps us measure, so the cake comes out right!', no: 'can\'t measure — a scale, a spoon, a ruler or a timer can!' } },
      solved: 'The prize cake is back on its stand — and it wins first prize! 🍰🏆' },
    // 🌋 pk-6b
    { id: 'volcano', n: 10, icon: '🌋', name: 'The Rumbling Mountain', theme: 'volcano', topic: 'Volcanoes + Earth layers', place: 'Volcano Village', owner: 'Professor Magma', thing: 'golden rumble-meter', walkTo: 'lookout hut', dropAt: 'by the hot spring',
      open: '🌋 The mountain is rumbling — and Professor Magma\'s golden rumble-meter is gone! Without it nobody knows if the volcano will wake up. Ashy footprints lead up the path…',
      suspects: [['🦎', 'Lizzy the Lizard'], ['🐐', 'Billy the Goat'], ['🦅', 'Sky the Eagle'], ['🐗', 'Tusk the Boar'], ['🐢', 'Shelly the Tortoise']],
      drops: [['🪨', 'a black pebble'], ['🌶️', 'a red chili'], ['🪶', 'a brown feather'], ['🍠', 'a sweet potato'], ['🧭', 'a little compass'], ['🥥', 'a coconut shell']],
      clutter: ['crystal', 'house', 'tree', 'mushroom', 'star', 'diamond', 'hexagon', 'circle'],
      count: '🔥',
      chapters: [
        { title: 'The empty desk', icon: '📟', say: 'The rumble-meter\'s desk is empty — and the ashy floor is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Up the mountain path', icon: '🥾', say: 'The prints climb the mountain path. Find the way to the lookout hut — then check the village camera!', steps: ['walk', 'spot'] },
        { title: 'The locked hut', icon: '🔐', say: 'The lookout hut is locked… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🌍', title: 'Layers of the Earth', text: 'The Earth has layers like a peach: a thin crust on the outside, a hot thick mantle under it, and a core in the middle.' },
        { icon: '🌋', title: 'What is a volcano?', text: 'Deep down, rock is so hot it melts — that is magma. When it pushes up through a crack and comes out, we call it lava.' },
        { icon: '🏝️', title: 'Volcanoes make land', text: 'Lava cools down and turns into new rock. Some islands were made by volcanoes, one eruption at a time!' }
      ],
      quiz: { ask: 'Professor Magma asks: which one comes OUT of a volcano?', nope: 'Which one does NOT come out of a volcano?',
        yes: [['🔥', 'hot lava'], ['💨', 'ash and smoke'], ['🪨', 'rocks'], ['♨️', 'steam'], ['🌫️', 'gas']],
        no: [['🍦', 'ice cream'], ['🧸', 'teddy bears'], ['🎈', 'balloons'], ['🍫', 'chocolate'], ['🐟', 'fish'], ['📚', 'books'], ['🌈', 'rainbows'], ['🎁', 'presents']],
        trick: [['❄️', 'snow'], ['💧', 'rain']], why: { yes: 'can come out of a volcano when it erupts!', no: 'does not come out of a volcano — lava, ash, rocks and steam do!' } },
      solved: 'The rumble-meter is back — it says the mountain is only snoring. Volcano Village can sleep again! 🌋😴' },
    // 🐝 pk-6b
    { id: 'bees', n: 11, icon: '🐝', name: 'Where Did the Bees Go?', theme: 'farm', topic: 'Pollination', place: 'Sunny Farm', owner: 'Farmer Fern', thing: 'golden honey pot', walkTo: 'big red barn', dropAt: 'by the beehives',
      open: '🐝 The bees of Sunny Farm have flown away — someone took Farmer Fern\'s golden honey pot, and now the flowers have no visitors! Sticky footprints lead across the field…',
      suspects: [['🐻', 'Bruno the Bear'], ['🦨', 'Stinky the Skunk'], ['🐦', 'Caw the Crow'], ['🦡', 'Bandit the Badger'], ['🐸', 'Hoppy the Frog']],
      drops: [['🌻', 'a sunflower seed'], ['🍯', 'a drop of honey'], ['🌾', 'a wheat stalk'], ['🥚', 'an egg'], ['🍎', 'an apple core'], ['🌼', 'a yellow petal']],
      clutter: ['flower', 'bee', 'butterfly', 'apple', 'tree', 'carrot', 'house', 'heart'],
      count: '🌻',
      chapters: [
        { title: 'The silent hives', icon: '🍯', say: 'The honey pot is gone and the hives are quiet — the muddy yard is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Across the fields', icon: '🌾', say: 'The prints cross the wheat field. Find the way to the big red barn — then check the farm camera!', steps: ['walk', 'spot'] },
        { title: 'The locked barn', icon: '🔐', say: 'The barn door is locked… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🌸', title: 'Flowers make seeds', text: 'To make seeds and fruit, a flower needs pollen — a yellow dust — from another flower of the same kind.' },
        { icon: '🐝', title: 'Bees carry pollen', text: 'When a fuzzy bee drinks nectar, pollen sticks to its body. At the next flower some of it rubs off. That is pollination!' },
        { icon: '🍎', title: 'No bees, no apples', text: 'Apples, strawberries and many other fruits only grow because bees and other visitors carry pollen between their flowers.' }
      ],
      quiz: { ask: 'Farmer Fern asks: which one helps carry POLLEN?', nope: 'Which one does NOT carry pollen?',
        yes: [['🐝', 'bee'], ['🦋', 'butterfly'], ['🐦', 'hummingbird'], ['🪲', 'beetle'], ['🦇', 'fruit bat']],
        no: [['🐟', 'fish'], ['🚗', 'car'], ['🧸', 'teddy bear'], ['🪨', 'rock'], ['📺', 'TV'], ['🍕', 'pizza'], ['🎈', 'balloon'], ['🧦', 'sock']],
        trick: [['🕷️', 'spider'], ['🐛', 'caterpillar']], why: { yes: 'visits flowers and carries pollen from one to the next!', no: 'does not carry pollen — bees, butterflies and hummingbirds do!' } },
      solved: 'The golden honey pot is home — the bees come buzzing back and the orchard is full of blossom! 🐝🌸' },
    // 🎵 pk-6c
    { id: 'orchestra', n: 12, icon: '🎵', name: 'The Silent Orchestra', theme: 'concert', topic: 'Sound + vibration', place: 'the Concert Hall', owner: 'Maestro Melody', thing: 'golden tuning fork', walkTo: 'backstage', dropAt: 'by the big drum',
      open: '🎵 The orchestra can\'t play a note — Maestro Melody\'s golden tuning fork is gone and every instrument is out of tune! Dusty footprints lead across the stage…',
      suspects: [['🦜', 'Polly the Parrot'], ['🐺', 'Howl the Wolf'], ['🦗', 'Chirpy the Cricket'], ['🐘', 'Trumpet the Elephant'], ['🐧', 'Waddles the Penguin']],
      drops: [['🎼', 'a page of music'], ['🪶', 'a feather'], ['🥁', 'a drumstick'], ['🎀', 'a ribbon'], ['🍬', 'a cough sweet'], ['🔔', 'a tiny bell']],
      clutter: ['star', 'heart', 'circle', 'diamond', 'crown', 'trophy', 'bird', 'balloon'],
      count: '🎵',
      chapters: [
        { title: 'The empty case', icon: '🎻', say: 'The tuning fork\'s velvet case is empty — and the stage is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Behind the curtain', icon: '🎭', say: 'The prints slip behind the curtain. Find the way backstage — then check the stage camera!', steps: ['walk', 'spot'] },
        { title: 'The locked dressing room', icon: '🔐', say: 'The dressing room is locked… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🔊', title: 'Sound is a wiggle', text: 'When something shakes back and forth very fast — vibrates — it pushes the air, and that wiggle is the sound we hear.' },
        { icon: '🎸', title: 'High and low', text: 'Short or tight strings vibrate fast and sound HIGH. Long or loose strings vibrate slowly and sound LOW.' },
        { icon: '👂', title: 'How we hear', text: 'The wiggling air reaches your ear and makes your eardrum wiggle too. Your brain turns that into music!' }
      ],
      quiz: { ask: 'Maestro Melody asks: which one makes a sound when it VIBRATES?', nope: 'Which one does NOT make a sound by vibrating?',
        yes: [['🥁', 'drum'], ['🎸', 'guitar string'], ['🔔', 'bell'], ['🎺', 'trumpet'], ['🗣️', 'voice']],
        no: [['🧽', 'sponge'], ['🧸', 'teddy bear'], ['🍞', 'bread'], ['🧦', 'sock'], ['🧶', 'wool'], ['☁️', 'cloud'], ['🍮', 'pudding'], ['🛏️', 'pillow']],
        trick: [['📷', 'a photo of a drum'], ['🔇', 'a muted speaker']], why: { yes: 'makes a sound when it vibrates!', no: 'stays quiet — drums, strings, bells and voices vibrate to make sound!' } },
      solved: 'The golden tuning fork is back — ting! Every instrument is in tune and the orchestra plays its best concert ever! 🎻🎶' },
    // 🏮 pk-6c
    { id: 'market', n: 13, icon: '🏮', name: 'Mystery at the Night Market', theme: 'market', topic: 'Money + counting change', place: 'the Night Market', owner: 'Auntie Malee', thing: 'golden coin box', walkTo: 'lantern stall', dropAt: 'by the mango sticky rice stall',
      open: '🏮 Auntie Malee\'s golden coin box is gone from her stall at the Night Market! Sticky footprints weave between the lanterns…',
      suspects: [['🐒', 'Mali the Monkey'], ['🐘', 'Chang the Elephant'], ['🐈', 'Maew the Cat'], ['🦎', 'Tukkae the Gecko'], ['🐓', 'Kai the Rooster']],
      drops: [['🥭', 'a mango slice'], ['🍢', 'a grilled skewer'], ['🌶️', 'a chili'], ['🥥', 'a coconut chip'], ['🪙', 'a coin'], ['🍡', 'a sweet dumpling']],
      clutter: ['donut', 'lollipop', 'balloon', 'apple', 'cherry', 'banana', 'mug', 'gift'],
      count: '🏮',
      chapters: [
        { title: 'The empty stall', icon: '🧺', say: 'The coin box is gone and the stall is a mess — the ground is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Through the lanterns', icon: '🏮', say: 'The prints weave between the stalls. Find the way to the lantern stall — then check the market camera!', steps: ['walk', 'spot'] },
        { title: 'The locked cart', icon: '🔐', say: 'The coin cart is locked… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🪙', title: 'Coins and notes', text: 'Thai money is the baht: coins of 1, 2, 5 and 10 baht and notes of 20, 50, 100 and more. A bigger number means more money — not a bigger coin!' },
        { icon: '➕', title: 'Adding it up', text: 'To find what to pay, add the prices: a mango for 20 baht and a skewer for 15 baht cost 20 + 15 = 35 baht.' },
        { icon: '🔙', title: 'Counting change', text: 'Pay 50 baht for something that costs 35? Count up: 35 → 40 → 50. That is 5 + 10 = 15 baht change.' }
      ],
      quiz: { ask: 'Auntie Malee asks: which one can you PAY with?', nope: 'Which one can you NOT pay with?',
        yes: [['🪙', 'coin'], ['💵', 'banknote'], ['💳', 'bank card'], ['📱', 'phone payment'], ['🎟️', 'gift voucher']],
        no: [['🍃', 'leaf'], ['🪨', 'pebble'], ['🧸', 'teddy bear'], ['🍬', 'sweet'], ['🧦', 'sock'], ['🔑', 'key'], ['📚', 'book'], ['🎈', 'balloon']],
        trick: [['🃏', 'a playing card'], ['🖼️', 'a picture of money']], why: { yes: 'can pay at the market!', no: 'can\'t pay — coins, notes, cards and phone payments can!' } },
      solved: 'The golden coin box is back — Auntie Malee gives everyone mango sticky rice to say thank you! 🥭🏮' },
    // 🧊 pk-6c
    { id: 'ice', n: 14, icon: '🧊', name: 'The Melting Ice Palace', theme: 'ice', topic: 'States of matter', place: 'the Ice Palace', owner: 'Queen Frost', thing: 'Frost Crystal', walkTo: 'frozen tower', dropAt: 'by the ice fountain',
      open: '🧊 The Ice Palace is MELTING! Queen Frost\'s Frost Crystal keeps it cold — and someone took it. Wet footprints lead down the icy hall…',
      suspects: [['🐧', 'Pip the Penguin'], ['🦭', 'Sammy the Seal'], ['🐻‍❄️', 'Polo the Polar Bear'], ['🦊', 'Flurry the Fox'], ['🦉', 'Tundra the Owl']],
      drops: [['🧤', 'a mitten'], ['🐟', 'a fish'], ['❄️', 'a snowflake'], ['🧣', 'a scarf thread'], ['🍫', 'a cocoa crumb'], ['🥕', 'a snowman\'s carrot']],
      clutter: ['snowman', 'penguin', 'crystal', 'diamond', 'star', 'cloud', 'hexagon', 'circle'],
      count: '❄️',
      chapters: [
        { title: 'The empty pedestal', icon: '💎', say: 'The Frost Crystal\'s pedestal is empty — and the wet floor is full of footprints. Which ones are the thief\'s?', steps: ['find', 'quiz'] },
        { title: 'Down the icy hall', icon: '🛷', say: 'The prints slide down the icy hall. Find the way to the frozen tower — then check the palace camera!', steps: ['walk', 'spot'] },
        { title: 'The locked tower', icon: '🔐', say: 'The frozen tower is locked… crack the code, then catch the thief!', steps: ['crack', 'accuse'] }
      ],
      lessons: [
        { icon: '🧊', title: 'Solid, liquid, gas', text: 'Ice is solid water, water is liquid water, and steam is water as a gas. The same stuff — three different forms!' },
        { icon: '🌡️', title: 'Heat melts, cold freezes', text: 'Add heat and ice melts into water. Take heat away and water freezes into ice again.' },
        { icon: '☁️', title: 'Water goes round', text: 'Puddles slowly turn into water vapour in the air, make clouds, and come back down as rain or snow.' }
      ],
      quiz: { ask: 'Queen Frost asks: which one is a LIQUID?', nope: 'Which one is NOT a liquid?',
        yes: [['💧', 'water'], ['🥛', 'milk'], ['🧃', 'juice'], ['🍯', 'honey'], ['🍵', 'tea']],
        no: [['🪨', 'rock'], ['🧸', 'teddy bear'], ['🍪', 'cookie'], ['🔑', 'key'], ['📚', 'book'], ['🧱', 'brick'], ['🥄', 'spoon'], ['👟', 'shoe']],
        trick: [['🧊', 'ice cube'], ['💨', 'steam']], why: { yes: 'is a liquid — it flows and takes the shape of its cup!', no: 'is not a liquid — a solid keeps its shape, a gas floats away!' } },
      solved: 'The Frost Crystal is back — the Ice Palace sparkles and freezes solid again! ❄️👑' }
]);
// 📖 CASE DATA END
/* 📏 pk-7a cases#1 */
const VERB_SAY = {find: '🔍 Find', quiz: '📜 Read', walk: '🚶 Walk', spot: '🖼️ Spot', crack: '🔐 Crack', accuse: '👉 Accuse'};
function caseOf(){ return PK.caseById(SET.caseId || 'magnet'); }
/* 📏 pk-7a cases#2 */
function caseSeenSave(o){ try{ localStorage.setItem(CASE_KEY + ':' + (S.player || ''), JSON.stringify(o)); }catch(e){} }
function lessonCount(){ return Object.keys(caseSeen()).filter(k => /^L:/.test(k)).length; }
/* 📏 pk-7a cases#3 */

/* ---------- start + steps ---------- */
function storyStart(lvl){
  const L = PK.LEVELS[lvl], St = PK.STORY[lvl];
  let K = null; for(let i = 0; i < 6 && (!K || !K.find || !K.walk); i++) K = PK.makeCase(PK.newSeed(), lvl, SET.caseId || 'magnet');
  G = {mode: 'detective', level: lvl, L, St, K, C: K.C, si: -1, pic: 0, over: false, paused: false, held: false, secs: 0, last: performance.now(), found: [], marks: [], scene: null, used: {}, lastTheme: '',
    lives: L.lives || 0, rounds: 3, A: null, timeLeft: 0, cps: 0, pics: 0, total: {found: 0, oops: 0, hints: 0, perfect: 0, quick: 0, points: 0}, picLog: [], busy: true, k: 1, dpr: Math.min(2, window.devicePixelRatio || 1),
    step: null, chapters: 0, lessons: [], clues: {}, hints: 0, pOops: 0, pHints: 0, pSecs: 0, lastFind: performance.now()};
  $('scr-play').dataset.mode = 'detective'; GC_LOG.length = 0;
  if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'detective');
  showScreen('play');
  BAR.level(L.name + (L.hardcore ? ' 💀' : ''));
  BAR.count('pic', '📖', '1/3', 'Chapter'); BAR.count('found', '🔎', '0', 'Found'); BAR.hide('found', true); BAR.miss(0);
  const hasSlot = k => !!document.querySelector('#scr-play .gb-' + k);
  if(lvl > 0) BAR.time(0); else if(hasSlot('time')) BAR.hide('time', true);
  $('tbar').classList.add('hidden');
  if(G.lives) BAR.lives(G.lives); else if(hasSlot('lives')) BAR.hide('lives', true);
  BAR.fit(); bdStart(); $('dots').innerHTML = ''; updHint(); layout(true); startTicker();
  moment('story', {case: K.id, level: lvl, thief: K.thief.name});
  goal('📖 ' + K.C.icon + ' ' + K.C.name);
  storyCard({icon: K.C.icon, kicker: '📖 Case ' + K.C.n, title: K.C.name, text: K.C.open, btn: '🕵️ Take the case!', kind: 'open'}).then(nextStep);
}
function nextStep(){
  if(!G || G.over) return;
  G.si++; const K = G.K;
  if(G.si >= K.steps.length) return caseSolved();
  const st = K.steps[G.si], ch = K.C.chapters[st.ch];
  const go = () => { if(!G || G.over) return; G.step = st; G.pOops = 0; G.pHints = 0; G.pSecs = 0; G.lastFind = performance.now(); G.hints = G.St.hints; G.glowAt = -1;
    BAR.count('pic', '📖', (st.ch + 1) + '/3', 'Chapter'); clearMarks(); hideHand(); $('sbox').innerHTML = ''; $('sbox').classList.remove('wide'); $('sbox').dataset.verb = st.verb;
    moment('step', {verb: st.verb, ch: st.ch});
    ({find: stepFind, quiz: stepQuiz, walk: stepWalk, spot: stepSpot, crack: stepCrack, accuse: stepAccuse})[st.verb](); updHint(); };
  if(st.first){ G.busy = true; moment('chapter', {i: st.ch, title: ch.title}); storyCard({icon: ch.icon, kicker: '📖 Chapter ' + (st.ch + 1) + ' of 3', title: ch.title, text: ch.say, btn: '▶ ' + VERB_SAY[st.verb], kind: 'chapter'}).then(go); }
  else go();
}
function stepDone(){
  if(!G || G.over) return; G.busy = true; hideHand();
  const st = G.step, secs = Math.round(G.pSecs), pts = PK.storyPoints(G.level, {oops: G.pOops, hints: G.pHints, secs});
  G.total.points += pts; if(!G.pOops && !G.pHints) G.total.perfect++;
  bigWord('✅ ' + VERB_SAY[st.verb] + ' — done!', '+' + pts + ' points', 'good'); bdReact('joy', 1600); UISound.play('unlock');
  G.marks.filter(m => m.cls === 'glow').forEach(dropMark);
  const K = G.K, C = K.C, cards = [];
  if(st.verb === 'find'){ G.clues.boot = K.thief.boot; cards.push({icon: '👣', kicker: '🧩 Clue 1', title: 'The thief wears ' + K.thief.boot[1] + ' boots!', text: 'Every one of those prints is a <b style="color:' + K.thief.boot[0] + '">' + K.thief.boot[1] + '</b> boot. Remember it!', btn: '📝 Got it', kind: 'clue', clue: 'boot'}); }
  if(st.verb === 'spot'){ G.clues.drop = K.thief.drop; cards.push({icon: K.thief.drop[0], kicker: '🧩 Clue 2', title: 'The camera saw ' + K.thief.drop[1] + '!', text: 'In picture B the thief dropped <b>' + K.thief.drop[0] + ' ' + K.thief.drop[1] + '</b> ' + C.dropAt + '. Who leaves that around?', btn: '📝 Got it', kind: 'clue', clue: 'drop'}); }
  if(st.last){ G.chapters++; const Ls = C.lessons[st.ch]; if(Ls){ G.lessons.push(st.ch); const seen = caseSeen(); seen['L:' + C.id + ':' + st.ch] = 1; caseSeenSave(seen);
    cards.push({icon: Ls.icon, kicker: '🎓 Lesson card ' + (st.ch + 1) + ' of 3 · ' + C.topic, title: Ls.title, text: Ls.text, btn: st.ch < 2 ? '▶ Next chapter' : '📁 Close the case', kind: 'lesson', lesson: st.ch}); } }
  moment('stepdone', {verb: st.verb, oops: G.pOops, hints: G.pHints, secs});
  const G0 = G, run = i => { if(!G || G.over || G !== G0) return; if(i >= cards.length) return nextStep(); const c = cards[i]; moment(c.kind, {i: c.lesson != null ? c.lesson : 0, clue: c.clue}); storyCard(c).then(() => run(i + 1)); };
  pkWait(st.verb === 'accuse' ? 900 : 1100).then(() => { if(!G || G.over || G !== G0) return; if(st.verb === 'accuse') return caseSolved(); run(0); });
}
function caseSolved(){
  if(!G || G.over) return; G.busy = true;
  const K = G.K, C = K.C; bigWord('📁 CASE CLOSED!', '', 'big', true); UISound.play('success'); confetti([C.icon, '🔍', '⭐', '🕵️'], 20);
  moment('caught', {thief: K.thief.name});
  const Ls = C.lessons[2]; G.chapters = 3; if(G.lessons.indexOf(2) < 0){ G.lessons.push(2); const seen = caseSeen(); seen['L:' + C.id + ':2'] = 1; caseSeenSave(seen); }
  const G0 = G; pkWait(1100).then(() => { if(!G || G.over || G !== G0) return; moment('lesson', {i: 2}); storyCard({icon: Ls.icon, kicker: '🎓 Lesson card 3 of 3 · ' + C.topic, title: Ls.title, text: Ls.text, btn: '📁 Close the case', kind: 'lesson', lesson: 2}).then(() => { if(G === G0) finishStory(true); }); });
}
/* 📏 pk-7a cases#4 */
function storyCard(o){
  if(G) G.busy = true; const box = $('scard');
  box.className = 'scard ' + (o.kind || ''); box.innerHTML = '<div class="sc-in"><div class="sc-ic">' + o.icon + '</div><div class="sc-k">' + UI.esc(o.kicker || '') + '</div><h3>' + UI.esc(o.title) + '</h3><p>' + o.text + '</p><button class="sp-btn sp-primary" id="scard-go" data-sound="pop">' + UI.esc(o.btn || '▶ Go') + '</button></div>';
  box.classList.remove('hidden'); if(o.kind === 'lesson' || o.kind === 'clue') UISound.play('unlock');
  return new Promise(res => { CARD_RES = () => { CARD_RES = null; box.classList.add('hidden'); box.innerHTML = ''; if(G) G.busy = false; res(); }; $('scard-go').onclick = () => { if(G && G.paused) return; CARD_RES && CARD_RES(); }; });
}

/* ---------- 🔍 FIND: the thief's footprints on a busy floor (one big picture) ---------- */
function stepFind(){
  const K = G.K, sc = K.find, n = sc.diffs.length; G.scene = sc; G.found = sc.diffs.map(() => false);
  BAR.hide('found', false); BAR.count('found', '👣', '0/' + n, 'Footprints'); $('dots').innerHTML = sc.diffs.map(() => '<i></i>').join('');
  layout(true); ['pic-a'].forEach(id => { const e = $(id); e.classList.remove('in'); void e.offsetWidth; e.classList.add('in'); });
  const chip = '<b class="chip" style="background:' + K.thief.boot[0] + '"></b>';
  goal(G.level === 0 ? '👣 Poke the ' + n + ' ' + chip + ' ' + K.thief.boot[1] + ' footprints!' : '🔍 Find ' + n + ' ' + chip + ' ' + K.thief.boot[1] + (G.St.look ? ' prints only!' : ' footprints!'));
  G.busy = false; if(G.St.guide) guideHand();
}
/* ---------- 🖼️ SPOT: the camera — before (A) and after (B) ---------- */
function stepSpot(){
  const K = G.K; let sc = null; for(let i = 0; i < 6 && !sc; i++) sc = PK.makeScene(i ? PK.newSeed() : K.spotSeed, G.level, K.C.theme, {n: G.St.spot});
  G.scene = sc; G.found = sc.diffs.map(() => false); const n = sc.diffs.length;
  BAR.hide('found', false); BAR.count('found', '🔎', '0/' + n, 'Found'); $('dots').innerHTML = sc.diffs.map(() => '<i></i>').join('');
  layout(true); ['pic-a', 'pic-b'].forEach(id => { const e = $(id); e.classList.remove('in'); void e.offsetWidth; e.classList.add('in'); });
  goal('📹 The camera: A = before, B = after. Find ' + n + ' changes!');
  G.busy = false;
}
/* ---------- 📜 READ: a question with picture cards ---------- */
function stepQuiz(){
  const Q = G.K.quiz; BAR.hide('found', true); $('dots').innerHTML = '';
  const box = $('sbox'); box.innerHTML = '<div class="sq">' + UI.esc(Q.q) + '</div><div class="sopts" id="sopts">' + Q.opts.map((o, i) => '<button class="sopt" data-i="' + i + '" data-sound="none"><span class="e">' + o.icon + '</span><span class="t">' + UI.esc(o.name) + '</span></button>').join('') + '</div>';
  box.querySelectorAll('.sopt').forEach(b => b.addEventListener('pointerdown', e => { if(e.isPrimary === false) return; e.preventDefault(); onQuiz(+b.dataset.i); }));
  layout(true); goal(Q.nope ? '📜 Careful — this time: which one is NOT?' : '📜 Read it, then poke your answer!');
  G.busy = false;
}
function onQuiz(i){
  if(!G || G.over || G.busy || G.paused || !G.step || G.step.verb !== 'quiz') return; hideHand();
  const Q = G.K.quiz, o = Q.opts[i], b = $('sopts').children[i];
  if(!b || b.classList.contains('out')) return;
  if(o.ok){ b.classList.add('right'); [...$('sopts').children].forEach((x, j) => { if(j !== i) x.classList.add('dim'); }); UISound.play('success'); bdReact('happy', 1300);
    goal('🎉 Yes! ' + o.icon + ' ' + o.name + ' ' + (Q.nope ? Q.why.no : Q.why.yes), 'yay'); moment('quiz', {right: true}); return stepDone(); }
  b.classList.add('out', 'nope'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
  goal('❌ ' + o.icon + ' ' + o.name + ' ' + (Q.nope ? Q.why.yes : Q.why.no), 'oops');
  moment('quiz', {right: false}); storyOops();
}
/* ---------- 🚶 WALK: follow the trail to the storeroom (🔑 first from Junior · 👟 step limit from Intermediate) ---------- */
function stepWalk(){
  const W = G.K.walk; G.walk = {pos: W.start.slice(), key: !W.key, steps: 0, trail: {}};
  const n = Math.round(W.path.length * G.St.trail); for(let i = 1; i < W.path.length - 1; i++) if(G.St.trail >= 1 || (i % 2 === 0 && i <= n * 2)) G.walk.trail[W.path[i].join(',')] = 1;
  BAR.hide('found', !W.limit); if(W.limit) BAR.count('found', '👟', '0/' + W.limit, 'Steps');
  const box = $('sbox'); box.innerHTML = '<div class="wmap" id="wmap"></div>';
  for(let y = 0; y < W.rows; y++) for(let x = 0; x < W.cols; x++){ const t = document.createElement('button'); t.className = 'wt' + (W.wall[y][x] ? ' wall' : ''); t.dataset.x = x; t.dataset.y = y; t.setAttribute('data-sound', 'none'); t.addEventListener('pointerdown', e => { if(e.isPrimary === false) return; e.preventDefault(); walkTo(x, y); }); $('wmap').appendChild(t); }
  drawWalk(); layout(true);
  const to = G.K.C.walkTo || 'storeroom';
  goal(W.key ? '🚶 Grab the 🔑 key, then walk to the 🚪 ' + to + '!' + (W.limit ? ' (' + W.limit + ' steps)' : '') : '🚶 Follow the 👣 trail to the 🚪 ' + to + '! Poke the next tile.');
  G.busy = false; if(G.St.guide) walkGlow();
}
function drawWalk(){
  const W = G.K.walk, P = G.walk, box = $('wmap'); if(!box) return;
  [...box.children].forEach(t => { const x = +t.dataset.x, y = +t.dataset.y, k = x + ',' + y; let s = '';
    if(W.wall[y][x]) s = '🧱'; else if(P.pos[0] === x && P.pos[1] === y) s = '🕵️'; else if(W.door[0] === x && W.door[1] === y) s = P.key ? '🚪' : '🔒'; else if(W.key && !P.key && W.key[0] === x && W.key[1] === y) s = '🔑'; else if(P.trail[k]) s = '<i class="tr" style="color:' + G.K.thief.boot[0] + '">👣</i>';
    t.innerHTML = s; t.classList.toggle('me', P.pos[0] === x && P.pos[1] === y); t.classList.remove('glow'); });
}
function walkNext(){ const W = G.K.walk, P = G.walk, goalT = P.key ? W.door : W.key, p = walkPath(P.pos, goalT); return p.length > 1 ? p[1] : null; }
function walkPath(a, b){ const W = G.K.walk, prev = {}, Q = [a], k = p => p[0] + ',' + p[1]; prev[k(a)] = null;
  while(Q.length){ const p = Q.shift(); if(p[0] === b[0] && p[1] === b[1]) break; [[1, 0], [0, 1], [0, -1], [-1, 0]].forEach(d => { const q = [p[0] + d[0], p[1] + d[1]]; if(q[0] < 0 || q[1] < 0 || q[0] >= W.cols || q[1] >= W.rows || W.wall[q[1]][q[0]] || prev[k(q)] !== undefined) return; prev[k(q)] = p; Q.push(q); }); }
  if(prev[k(b)] === undefined) return []; const out = []; let c = b; while(c){ out.unshift(c); c = prev[k(c)]; } return out; }
function walkGlow(){ const n = walkNext(); if(!n) return; const t = $('wmap') && $('wmap').querySelector('.wt[data-x="' + n[0] + '"][data-y="' + n[1] + '"]'); if(t) t.classList.add('glow'); G.glowAt = performance.now(); }
function walkTo(x, y){
  if(!G || G.over || G.busy || G.paused || !G.step || G.step.verb !== 'walk') return; hideHand();
  const W = G.K.walk, P = G.walk, dx = Math.abs(x - P.pos[0]), dy = Math.abs(y - P.pos[1]);
  if(dx + dy === 0) return;
  if(dx + dy !== 1){ UISound.play('tap'); goal('🚶 One step at a time — poke a tile right next to 🕵️.'); return; }
  if(W.wall[y][x]){ UISound.play('error'); goal('🧱 A wall! Find a way around.', 'oops'); return; }
  if(!P.key && W.door[0] === x && W.door[1] === y){ UISound.play('error'); goal('🔒 Locked! Grab the 🔑 key first.', 'oops'); return; }
  P.pos = [x, y]; P.steps++; G.lastFind = performance.now(); UISound.play('tap'); moment('walk', {x, y, steps: P.steps});
  if(W.key && !P.key && W.key[0] === x && W.key[1] === y){ P.key = true; UISound.play('success'); bdReact('happy', 1000); goal('🔑 Got the key! Now the 🚪 door.', 'yay'); }
  if(W.limit) BAR.count('found', '👟', P.steps + '/' + W.limit, 'Steps');
  drawWalk();
  if(P.key && W.door[0] === x && W.door[1] === y){ goal('🚪 The ' + (G.K.C.walkTo || 'storeroom') + '! Well walked.', 'yay'); return stepDone(); }
  if(W.limit && P.steps >= W.limit){ goal('🥵 Out of steps — back to the start. Try a shorter way!', 'oops'); P.pos = W.start.slice(); P.steps = 0; P.key = !W.key; BAR.count('found', '👟', '0/' + W.limit, 'Steps'); drawWalk(); storyOops(true); return; }
  if(G.St.guide) walkGlow();
}
/* ---------- 🔐 CRACK: the code lock — every number hides in a clue ---------- */
function stepCrack(){
  const D = G.K.crack.digits; G.code = D.map(() => null); G.ci = 0; BAR.hide('found', true); $('dots').innerHTML = '';
  const legend = D.some(d => d.kind === 'cipher') ? '<div class="cleg">🔤 A=1 · B=2 · C=3 · D=4 · E=5 · F=6 · G=7 · H=8 · I=9</div>' : '';
  $('sbox').innerHTML = '<div class="clock" id="clock"><div class="ctop">🔐</div><div class="cclues">' + D.map((d, i) => '<div class="cc" data-i="' + i + '"><div class="cq k-' + d.kind + '">' + UI.esc(d.q) + '</div><div class="cs" id="cs' + i + '"></div></div>').join('') + '</div>' + legend + '</div>'
    + '<div class="cpad" id="cpad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => '<button class="ck" data-n="' + n + '" data-sound="none">' + n + '</button>').join('') + '<button class="ck back" data-n="del" data-sound="none">⌫</button></div>';
  $('cpad').querySelectorAll('.ck').forEach(b => b.addEventListener('pointerdown', e => { if(e.isPrimary === false) return; e.preventDefault(); crackKey(b.dataset.n); }));
  drawCrack(); layout(true);
  goal(G.level === 0 ? '🔐 Count the things above each box — that\'s the number!' : '🔐 Crack the code: every number hides in its clue.');
  G.busy = false;
}
function drawCrack(){ const D = G.K.crack.digits; D.forEach((d, i) => { const s = $('cs' + i); if(!s) return; s.textContent = G.code[i] == null ? '' : G.code[i]; s.classList.toggle('on', i === G.ci); s.classList.remove('bad', 'good'); }); document.querySelectorAll('#cpad .ck').forEach(b => b.classList.remove('glow')); }
function crackKey(n){
  if(!G || G.over || G.busy || G.paused || !G.step || G.step.verb !== 'crack') return; hideHand(); G.lastFind = performance.now();
  const D = G.K.crack.digits;
  if(n === 'del'){ let i = G.ci < D.length && G.code[G.ci] == null ? G.ci - 1 : G.ci; if(i >= D.length) i = D.length - 1; if(i < 0) return; G.code[i] = null; G.ci = i; UISound.play('tap'); drawCrack(); return; }
  if(G.ci >= D.length) return; G.code[G.ci] = +n; UISound.play('tap'); moment('crack', {i: G.ci, n: +n});
  let nx = G.code.findIndex(v => v == null); G.ci = nx < 0 ? D.length : nx; drawCrack();
  if(nx < 0) crackCheck();
}
function crackCheck(){
  const D = G.K.crack.digits, bad = D.map((d, i) => G.code[i] !== d.a);
  if(!bad.some(Boolean)){ D.forEach((d, i) => $('cs' + i).classList.add('good')); $('clock').classList.add('open'); goal('🔓 Click! The box opens — and the ' + G.K.C.thing + ' is inside!', 'yay'); UISound.play('success'); return stepDone(); }
  const keep = G.level <= 2;
  D.forEach((d, i) => { const s = $('cs' + i); if(bad[i]){ s.classList.add('bad'); } else if(keep) s.classList.add('good'); });
  const wi = bad.indexOf(true), nth = ['1st', '2nd', '3rd', '4th'][wi];
  goal(keep ? '❌ The ' + nth + ' number isn\'t right — ' + ({count: 'count again', sum: 'add them up', minus: 'take away', pattern: 'what comes next?', cipher: 'A = 1, B = 2…'})[D[wi].kind] + '.' : '❌ Wrong code — check every clue again.', 'oops');
  storyOops();
  const G0 = G; pkWait(FX ? 700 : 0).then(() => { if(!G || G.over || G !== G0) return; D.forEach((d, i) => { if(bad[i] || !keep) G.code[i] = null; }); G.ci = G.code.findIndex(v => v == null); drawCrack(); });
}
function crackGlow(){ const D = G.K.crack.digits; if(G.ci >= D.length) return; const b = document.querySelector('#cpad .ck[data-n="' + D[G.ci].a + '"]'); if(b) b.classList.add('glow'); G.glowAt = performance.now(); }
/* ---------- 👉 ACCUSE: the suspect with BOTH clues ---------- */
function stepAccuse(){
  const K = G.K, c = G.clues; BAR.hide('found', true); $('dots').innerHTML = '';
  $('sbox').innerHTML = '<div class="sq">👉 Who did it? Your clues: <b class="chip" style="background:' + K.thief.boot[0] + '"></b> ' + K.thief.boot[1] + ' boots · ' + K.thief.drop[0] + ' ' + UI.esc(K.thief.drop[1]) + '</div><div class="sopts sus" id="sopts">'
    + K.people.map((p, i) => '<button class="sopt sp" data-i="' + i + '" data-sound="none"><span class="e">' + p.icon + '</span><span class="t">' + UI.esc(p.name) + '</span><span class="tr2"><b class="chip" style="background:' + p.boot[0] + '"></b> ' + p.boot[1] + ' · ' + p.drop[0] + '</span></button>').join('') + '</div>';
  $('sopts').querySelectorAll('.sopt').forEach(b => b.addEventListener('pointerdown', e => { if(e.isPrimary === false) return; e.preventDefault(); onAccuse(+b.dataset.i); }));
  layout(true); goal(G.St.twins ? '👉 Only ONE suspect matches BOTH clues — poke them!' : '👉 Who wears ' + K.thief.boot[1] + ' boots? Poke the thief!');
  G.busy = false; void c;
}
function onAccuse(i){
  if(!G || G.over || G.busy || G.paused || !G.step || G.step.verb !== 'accuse') return; hideHand();
  const K = G.K, p = K.people[i], b = $('sopts').children[i]; if(!b || b.classList.contains('out')) return;
  if(i === K.culprit){ b.classList.add('right'); [...$('sopts').children].forEach((x, j) => { if(j !== i) x.classList.add('dim'); }); UISound.play('success'); bdReact('win', 1800);
    goal('🎉 Caught! ' + p.icon + ' ' + p.name + ' has ' + p.boot[1] + ' boots AND ' + p.drop[1] + '!', 'yay'); moment('accuse', {right: true, who: p.name}); return stepDone(); }
  const m = PK.clueMatch(K, p); b.classList.add('out', 'nope'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
  goal('❌ ' + p.icon + ' ' + p.name + ': ' + (m.boot ? '✓ ' : '✗ ') + p.boot[1] + ' boots · ' + (m.drop ? '✓ ' : '✗ ') + p.drop[1] + ' — not our thief!', 'oops');
  moment('accuse', {right: false, who: p.name}); storyOops();
}
/* ---------- oops / hints / glow for the DOM steps ---------- */
function storyOops(soft){
  G.pOops++; G.total.oops++; BAR.miss(G.total.oops); if(!soft) UISound.play('error'); bdReact('miss', 1400);
  if(G.L.lives){ G.lives--; BAR.lives(Math.max(0, G.lives), G.lives <= 1); if(G.lives <= 0){ goal('💀 Out of oops — the thief got away this time.', 'oops'); G.busy = true; bdReact('lose', 2200); const G0 = G; pkWait(1400).then(() => { if(G && !G.over && G === G0) finishStory(false); }); } }
}
function storyHint(){
  const v = G.step && G.step.verb; G.hints--; G.pHints++; G.total.hints++; updHint(); UISound.play('whoosh'); moment('hint', {verb: v});
  if(v === 'walk'){ walkGlow(); goal('🔍 Step on the glowing tile!'); return; }
  if(v === 'crack'){ crackGlow(); goal('🔍 Press the glowing number!'); return; }
  const box = $('sopts'), list = v === 'quiz' ? G.K.quiz.opts.map((o, i) => o.ok ? -1 : i) : G.K.people.map((p, i) => i === G.K.culprit ? -1 : i);
  const i = list.find(j => j >= 0 && !box.children[j].classList.contains('out')); if(i == null) return;
  box.children[i].classList.add('out', 'dim'); goal('🔍 That one is not it — look at the others!');
}
function storyTick(now){
  const v = G.step && G.step.verb; if(!v || G.busy) return;
  const glowS = G.L.glow || (G.St.guide ? 6 : 0);
  if(v === 'walk' && glowS && now - G.lastFind > glowS * 1000 && !($('wmap') && $('wmap').querySelector('.glow'))){ walkGlow(); goal('✨ Psst — step where it glows!'); }
  if(v === 'crack' && G.L.glow && now - G.lastFind > (G.L.glow + 4) * 1000 && !document.querySelector('#cpad .glow')){ crackGlow(); goal('✨ Psst — try the glowing number!'); }
}
/* ---------- 📐 layout of the DOM steps (no scroll at any size) ---------- */
function layoutStory(W, H, gap){
  const v = G.step && G.step.verb, box = $('sbox'); box.style.setProperty('--gap', gap + 'px');
  if(v === 'quiz' || v === 'accuse'){
    const q = box.querySelector('.sq'), opts = $('sopts'); if(!opts) return; const n = opts.children.length, qh = (q ? q.offsetHeight : 40) + gap;
    let best = {s: 0, cols: 1}; for(let cols = 1; cols <= n; cols++){ const rows = Math.ceil(n / cols), s = Math.min((W - gap * (cols + 1)) / cols, (H - qh - gap * (rows + 1)) / rows / (v === 'accuse' ? 1.05 : 0.9)); if(s > best.s) best = {s, cols}; }
    const s = Math.floor(Math.min(best.s, 200)); opts.style.gridTemplateColumns = 'repeat(' + best.cols + ', ' + s + 'px)'; opts.style.gap = gap + 'px';
    [...opts.children].forEach(b => { b.style.width = s + 'px'; b.style.height = Math.round(s * (v === 'accuse' ? 1.05 : 0.9)) + 'px'; b.style.setProperty('--s', s + 'px'); });
    return;
  }
  if(v === 'walk'){ const Wk = G.K.walk, m = $('wmap'); if(!m) return; const t = Math.floor(Math.min((W - gap * 2) / Wk.cols, (H - gap * 2) / Wk.rows, 96));
    Object.assign(m.style, {gridTemplateColumns: 'repeat(' + Wk.cols + ', ' + t + 'px)', gridTemplateRows: 'repeat(' + Wk.rows + ', ' + t + 'px)'}); m.style.setProperty('--t', t + 'px'); return; }
  if(v === 'crack'){ const lk = $('clock'), pad = $('cpad'); if(!lk || !pad) return; const n = G.K.crack.digits.length, wide = W > H * 1.15; box.classList.toggle('wide', wide);
    const aw = wide ? (W - gap * 3) * 0.55 : W - gap * 2, ah = wide ? H - gap * 2 : (H - gap * 3) * 0.5;
    const cw = Math.floor(Math.min((aw - gap * (n - 1)) / n, ah / 1.75, 170)); lk.style.setProperty('--cw', cw + 'px');
    const pw = wide ? (W - gap * 3) * 0.45 : W - gap * 2, ph = wide ? H - gap * 2 : (H - gap * 3) * 0.5, k = Math.floor(Math.min((pw - gap * 4) / 5, (ph - gap * 3) / 2, 110));
    pad.style.setProperty('--k', k + 'px'); return; }
}

/* ---------- 📁 the end ---------- */
function finishStory(won){
  if(!G || G.over) return; G.over = true; stopTicker(); hideHand(); $('scard').classList.add('hidden');
  const L = G.L, T = G.total, K = G.K, C = K.C, secs = Math.round(G.secs), cleared = !!won;
  const stars = PK.starsFor({cleared, oops: T.oops, hints: T.hints}), score = cleared ? T.points + PK.caseBonus(G.level) : Math.round(T.points * 0.5);
  if(cleared){ const seen = caseSeen(); seen['C:' + C.id] = 1; caseSeenSave(seen); }
  NOTES.length = 0;
  let h = '<div class="res-det" id="res-det"><canvas id="res-av" width="240" height="264"></canvas><svg class="hat" viewBox="0 0 60 30" aria-hidden="true"><path d="M8 23 Q30 1 52 23 Z" fill="#8B5A2B" stroke="#3B2410" stroke-width="2"/><path d="M12 19 Q30 7 48 19" fill="none" stroke="#C99A5B" stroke-width="2" stroke-dasharray="3 3"/><path d="M3 24 H57" stroke="#3B2410" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="5" r="3" fill="#C99A5B"/></svg><span class="glass">' + C.icon + '</span></div>'
    + '<h2 class="' + (cleared ? 'cheer' : '') + '">' + (cleared ? '📁 Case closed!' : '🏃 The thief got away!') + '</h2>'
    + '<div class="note">📖 ' + C.icon + ' ' + UI.esc(C.name) + ' · ' + L.name + (L.hardcore ? ' 💀' : '') + '</div>'
    + (cleared ? '<div class="thief">' + K.thief.icon + ' It was <b>' + UI.esc(K.thief.name) + '</b>! <span class="chip" style="background:' + K.thief.boot[0] + '"></span> ' + K.thief.boot[1] + ' boots + ' + K.thief.drop[0] + ' ' + UI.esc(K.thief.drop[1]) + '</div><div class="note">' + UI.esc(C.solved) + '</div>' : '');
  h += '<div class="rating">' + [1, 2, 3].map(i => '<span class="st' + (i <= stars ? '' : ' off') + '">⭐</span>').join('') + '</div><div class="score-big">🏆 ' + score.toLocaleString() + '</div>';
  h += '<div class="stats"><span>📖 ' + G.chapters + '/3 chapters</span><span>🎓 ' + G.lessons.length + ' lesson card' + (G.lessons.length === 1 ? '' : 's') + '</span><span>❌ ' + T.oops + ' oops</span><span>🔍 ' + T.hints + ' hint' + (T.hints === 1 ? '' : 's') + '</span>' + (G.level > 0 ? '<span>⏱ ' + Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0') + '</span>' : '') + '</div>';
  h += '<div class="lessons">' + C.lessons.map((l, i) => '<span class="lc' + (G.lessons.indexOf(i) >= 0 ? ' on' : '') + '" title="' + UI.esc(l.title) + '">' + l.icon + ' ' + UI.esc(l.title) + '</span>').join('') + '</div>';
  h += '<div class="save-note" id="save-note">' + (S.player ? '💾 Saving…' : '') + '</div>';
  h += '<div class="res-btns" id="res-btns"><button class="sp-btn sp-secondary" id="res-levels" data-sound="tap">🎚️ Levels</button><button class="sp-btn sp-secondary" id="res-again" data-sound="pop">🔁 New case</button>'
    + (cleared && G.level < 5 ? '<button class="sp-btn sp-primary" id="res-next" data-sound="pop">Next level ▶</button>' : '') + '</div><div class="comics-slot" id="comic-strip-slot"></div>';
  showResult(h);
  if(BD.on) UI.buddy($('res-av'), BD.who, {hold: cleared ? 'win' : 'lose'}); else $('res-det').classList.add('hidden');
  $('res-levels').onclick = () => leavePlay();
  $('res-again').onclick = () => startCase(G ? G.level : SET.level);
  if($('res-next')) $('res-next').onclick = () => startCase(Math.min(5, (G ? G.level : SET.level) + 1));
  if(cleared){ confetti([C.icon, '📁', '⭐', '🕵️', '🎉'], 26); UISound.play('success'); } else bdReact('lose', 2000);
  moment(cleared ? 'win' : 'lose', {score, stars, secs, case: C.id, thief: K.thief.name});
  const stats = {games: 1, stories: cleared ? 1 : 0, chapters: G.chapters, lessons: lessonCount(), casebook: Object.keys(caseSeen()).filter(k => /^C:/.test(k)).length, oops: T.oops, hints: T.hints, perfect: T.perfect};
  if(S.player) saveWin(S.player, G.level, {score, stars, cleared, timeSec: secs, theme: '📖 ' + C.icon + ' ' + C.name, stats}, null, 0, CASE_ID);
  if(UI.alsoTry) UI.alsoTry({player: S.player, game: GAME_ID, at: () => $('res-btns'), current: SET.mode, open: id => { leavePlay(); msOpen(id); }});
  SET.level = G.level;
}
GameParts.loaded('Pokadif_cases', 'pk-7a2');
