
/* 📏 s4a words#1 */
// TWO-step templates make their own numbers (cap X.C). ops = the signs inside (the series picker keeps a story when its sign is in it).
// hold = who holds the answer → how a 3rd step is told (🌋 💀) · q3e / q3t = the question after a 3rd step when it must change
const STORY_TWO = [
  {id: 'ms', ops: ['mul', 'sub'], hold: 'has', mk: X => { const [a, b] = X.mulPair(), c = X.r(1, a * b - 1);
    return {e: [X.p[0] + ' has ' + X.eGroups(a, b) + '.', X.p[0] + ' gives ' + fN(c) + ' to ' + X.p[1] + '.'], qe: 'How many ' + X.N.ep + ' does ' + X.p[0] + ' have now?',
      t: [X.pt[0] + 'มี' + X.tGroups(a, b), 'ให้' + X.pt[1] + 'ไป ' + X.tn(c)], qt: 'ตอนนี้' + X.pt[0] + 'มี' + X.N.t + 'กี่' + X.N.c, steps: [stp(a, 'mul', b), stp(a * b, 'sub', c)]}; }},
  {id: 'as', ops: ['add', 'sub'], hold: 'has', mk: X => { const a = X.r(STORY_LO[X.lvl], X.C / 2), b = X.r(1, X.C - a), c = X.r(1, a + b - 1);
    return {e: [X.p[0] + ' has ' + X.en(a) + '.', X.p[1] + ' gives ' + X.p[0] + ' ' + fN(b) + ' more.', 'Then ' + X.p[0] + ' gives ' + fN(c) + ' to ' + X.p[2] + '.'], qe: 'How many ' + X.N.ep + ' does ' + X.p[0] + ' have now?',
      t: [X.pt[0] + 'มี' + X.N.t + ' ' + X.tn(a), X.pt[1] + 'ให้มาอีก ' + X.tn(b), 'แล้ว' + X.pt[0] + 'ให้' + X.pt[2] + 'ไป ' + X.tn(c)], qt: 'ตอนนี้' + X.pt[0] + 'มี' + X.N.t + 'กี่' + X.N.c, steps: [stp(a, 'add', b), stp(a + b, 'sub', c)]}; }},
  {id: 'sa', ops: ['sub', 'add'], hold: 'in', mk: X => { const a = X.r(STORY_LO[X.lvl], X.C), b = X.r(1, a - 1), c = X.r(1, Math.max(1, Math.min(X.C - (a - b), Math.round(X.C / 2))));
    return {e: ['There ' + X.be(a) + ' ' + X.en(a) + ' ' + X.inB() + '.', fN(b) + ' ' + X.out(b) + '.', 'Then ' + fN(c) + ' ' + X.come(c) + '.'], qe: 'How many ' + X.N.ep + ' are ' + X.inB() + ' now?',
      t: [X.tinB() + 'มี' + X.N.t + ' ' + X.tn(a), X.tOut() + ' ' + X.tn(b), 'แล้ว' + X.tCome() + 'อีก ' + X.tn(c)], qt: 'ตอนนี้' + X.tinB() + 'มี' + X.N.t + 'กี่' + X.N.c, steps: [stp(a, 'sub', b), stp(a - b, 'add', c)]}; }},
  {id: 'ma', ops: ['mul', 'add'], hold: 'has', mk: X => { const [a, b] = X.mulPair(), c = X.r(1, Math.max(1, Math.min(X.C - a * b, Math.round(X.C / 4))));
    return {e: [X.p[0] + ' has ' + X.eGroups(a, b) + '.', X.p[0] + ' also has ' + fN(c) + ' more ' + (c === 1 ? X.N.e : X.N.ep) + '.'], qe: 'How many ' + X.N.ep + ' does ' + X.p[0] + ' have altogether?', q3e: 'How many ' + X.N.ep + ' does ' + X.p[0] + ' have now?',
      t: [X.pt[0] + 'มี' + X.tGroups(a, b), 'และมี' + X.N.t + 'อีก ' + X.tn(c)], qt: X.pt[0] + 'มี' + X.N.t + 'ทั้งหมดกี่' + X.N.c, q3t: 'ตอนนี้' + X.pt[0] + 'มี' + X.N.t + 'กี่' + X.N.c, steps: [stp(a, 'mul', b), stp(a * b, 'add', c)]}; }},
  {id: 'da', ops: ['div', 'add'], hold: 'each', mk: X => { const b = X.r(2, X.C > 100 ? 12 : 9), q = X.r(2, Math.max(2, Math.floor(X.C * 0.8 / b))), c = X.r(1, X.C > 100 ? 40 : 9);
    return {e: [X.p[0] + ' shares ' + X.en(b * q) + ' equally among ' + fN(b) + ' friends.', 'Then each friend gets ' + fN(c) + ' more from ' + X.p[1] + '.'], qe: 'How many ' + X.N.ep + ' does each friend have now?',
      t: [X.pt[0] + 'แบ่ง' + X.N.t + ' ' + X.tn(b * q) + ' ให้เพื่อน ' + fN(b) + ' คนเท่า ๆ กัน', 'แล้ว' + X.pt[1] + 'ให้เพิ่มอีกคนละ ' + X.tn(c)], qt: 'ตอนนี้เพื่อนแต่ละคนมี' + X.N.t + 'กี่' + X.N.c, steps: [stp(b * q, 'div', b), stp(q, 'add', c)]}; }},
  {id: 'ds', ops: ['div', 'sub'], hold: 'each', mk: X => { const b = X.r(2, X.C > 100 ? 12 : 9), q = X.r(3, Math.max(3, Math.floor(X.C * 0.8 / b))), c = X.r(1, q - 1);
    return {e: [X.p[0] + ' shares ' + X.en(b * q) + ' equally among ' + fN(b) + ' friends.', 'Each friend gives ' + fN(c) + ' to ' + X.p[1] + '.'], qe: 'How many ' + X.N.ep + ' does each friend have left?', q3e: 'How many ' + X.N.ep + ' does each friend have now?',
      t: [X.pt[0] + 'แบ่ง' + X.N.t + ' ' + X.tn(b * q) + ' ให้เพื่อน ' + fN(b) + ' คนเท่า ๆ กัน', 'แล้วแต่ละคนให้' + X.pt[1] + 'ไปคนละ ' + X.tn(c)], qt: 'เพื่อนแต่ละคนเหลือ' + X.N.t + 'กี่' + X.N.c, q3t: 'ตอนนี้เพื่อนแต่ละคนมี' + X.N.t + 'กี่' + X.N.c, steps: [stp(b * q, 'div', b), stp(q, 'sub', c)]}; }},
  {id: 'md', ops: ['mul', 'div'], hold: 'each', q3: 1, mk: X => { for(let k = 0; k < 40; k++){ const [a, b] = X.mulPair(), t = a * b, fr = [2, 3, 4, 5, 6, 8].filter(f => t % f === 0 && t / f >= 2 && f !== a && f !== b); if(!fr.length) continue; const f = pick(fr);
      return {e: [X.p[0] + ' has ' + X.eGroups(a, b) + '.', X.p[0] + ' shares them all equally among ' + fN(f) + ' friends.'], qe: 'How many ' + X.N.ep + ' does each friend get?',
        q3e: 'How many ' + X.N.ep + ' does each friend have now?', t: [X.pt[0] + 'มี' + X.tGroups(a, b), 'แบ่งทั้งหมดให้เพื่อน ' + fN(f) + ' คนเท่า ๆ กัน'], qt: 'เพื่อนได้คนละกี่' + X.N.c, q3t: 'ตอนนี้เพื่อนแต่ละคนมี' + X.N.t + 'กี่' + X.N.c,
        steps: [stp(a, 'mul', b), stp(t, 'div', f)]}; } return null; }},
  {id: 'ch', ops: ['mul', 'sub'], buy: 1, hold: 'baht', unit: 'baht', mk: X => { const big = X.C > 100, k = X.r(2, big ? 9 : 5), p = X.r(big ? 5 : 2, big ? 150 : 25), cost = k * p, notes = (big ? [100, 500, 1000] : [20, 50, 100]).filter(m => m > cost); if(!notes.length) return null; const m = pick(notes);
    return {e: [X.p[0] + ' has ' + fN(m) + ' baht.', X.p[0] + ' buys ' + X.en(k) + ' at ' + fN(p) + ' baht each.'], qe: 'How much change does ' + X.p[0] + ' get?', q3e: 'How many baht does ' + X.p[0] + ' have now?',
      t: [X.pt[0] + 'มีเงิน ' + fN(m) + ' บาท', 'ซื้อ' + X.N.t + ' ' + X.tn(k) + ' ' + X.N.c + 'ละ ' + fN(p) + ' บาท'], qt: 'จะได้เงินทอนกี่บาท', q3t: 'ตอนนี้' + X.pt[0] + 'มีเงินกี่บาท', steps: [stp(k, 'mul', p), stp(m, 'sub', cost)]}; }},
  {id: 'sh', ops: ['add', 'sub'], buy: 1, hold: 'baht', unit: 'baht', mk: X => { const big = X.C > 100, M = pick(X.SW.nouns.filter(n => n.buy && n !== X.N)); if(!M) return null;
    const x = X.r(big ? 20 : 3, big ? 400 : 40), y = X.r(big ? 20 : 3, big ? 400 : 40), notes = (big ? [500, 1000] : [50, 100]).filter(m => m > x + y); if(!notes.length) return null; const m = pick(notes);
    return {e: [X.p[0] + ' has ' + fN(m) + ' baht.', X.p[0] + ' buys ' + (/^[aeiou]/.test(X.N.e) ? 'an ' : 'a ') + X.N.e + ' for ' + fN(x) + ' baht and ' + (/^[aeiou]/.test(M.e) ? 'an ' : 'a ') + M.e + ' for ' + fN(y) + ' baht.'], qe: 'How much change does ' + X.p[0] + ' get?', q3e: 'How many baht does ' + X.p[0] + ' have now?',
      t: [X.pt[0] + 'มีเงิน ' + fN(m) + ' บาท', 'ซื้อ' + X.N.t + ' ราคา ' + fN(x) + ' บาท และ' + M.t + ' ราคา ' + fN(y) + ' บาท'], qt: 'จะได้เงินทอนกี่บาท', q3t: 'ตอนนี้' + X.pt[0] + 'มีเงินกี่บาท', steps: [stp(x, 'add', y), stp(m, 'sub', x + y)]}; }},
  {id: 'tl', ops: ['sub'], hold: 'min', unit: 'min', s3: 'sub', mk: X => { const [A, B] = shuffle(X.SW.acts.slice()), a = X.C > 100 ? X.r(60, 240) : pick([30, 40, 45, 50, 60, 90]), b = X.minutes(), c = X.minutes(); if(b + c >= a) return null;
    return {e: [X.p[0] + ' has ' + fN(a) + ' minutes of free time.', X.p[0] + ' ' + A.e + ' for ' + fN(b) + ' minutes and ' + B.e + ' for ' + fN(c) + ' minutes.'], qe: 'How many minutes are left?',
      t: [X.pt[0] + 'มีเวลาว่าง ' + fN(a) + ' นาที', A.t + ' ' + fN(b) + ' นาที และ' + B.t + ' ' + fN(c) + ' นาที'], qt: 'เหลือเวลาอีกกี่นาที', steps: [stp(a, 'sub', b), stp(a - b, 'sub', c)]}; }},
  {id: 'ta', ops: ['add'], hold: 'min', unit: 'min', s3: 'add', mk: X => { const [A, B, D] = shuffle(X.SW.acts.slice()), a = X.minutes(), b = X.minutes(), c = X.minutes(); if(a + b + c > X.C) return null;
    return {e: [X.p[0] + ' ' + A.e + ' for ' + fN(a) + ' minutes, ' + B.e + ' for ' + fN(b) + ' minutes, then ' + D.e + ' for ' + fN(c) + ' minutes.'], qe: 'How many minutes is that in all?',
      t: [X.pt[0] + A.t + ' ' + fN(a) + ' นาที ' + B.t + ' ' + fN(b) + ' นาที แล้ว' + D.t + 'อีก ' + fN(c) + ' นาที'], qt: 'รวมใช้เวลากี่นาที', steps: [stp(a, 'add', b), stp(a + b, 'add', c)]}; }},
  {id: 'mt', ops: ['add'], hold: 'together', q3: 1, mk: X => { const a = X.r(Math.max(2, Math.round(STORY_LO[X.lvl] / 2)), Math.floor(X.C / 3)), b = X.r(1, Math.floor(X.C / 3));
    return {e: [X.p[0] + ' has ' + X.en(a) + '.', X.p[1] + ' has ' + fN(b) + ' more than ' + X.p[0] + '.'], qe: 'How many ' + X.N.ep + ' do they have together?', q3e: 'How many ' + X.N.ep + ' do they have together now?',
      t: [X.pt[0] + 'มี' + X.N.t + ' ' + X.tn(a), X.pt[1] + 'มีมากกว่า' + X.pt[0] + ' ' + X.tn(b)], qt: 'ทั้งสองคนมี' + X.N.t + 'รวมกันกี่' + X.N.c, q3t: 'ตอนนี้ทั้งสองคนมี' + X.N.t + 'รวมกันกี่' + X.N.c, steps: [stp(a, 'add', b), stp(a, 'add', a + b)]}; }},
  {id: 'ft', ops: ['sub', 'add'], hold: 'together', q3: 1, mk: X => { const a = X.r(Math.max(3, STORY_LO[X.lvl]), Math.floor(X.C / 2)), b = X.r(1, a - 1);
    return {e: [X.p[0] + ' has ' + X.en(a) + '.', X.p[1] + ' has ' + fN(b) + ' fewer than ' + X.p[0] + '.'], qe: 'How many ' + X.N.ep + ' do they have together?', q3e: 'How many ' + X.N.ep + ' do they have together now?',
      t: [X.pt[0] + 'มี' + X.N.t + ' ' + X.tn(a), X.pt[1] + 'มีน้อยกว่า' + X.pt[0] + ' ' + X.tn(b)], qt: 'ทั้งสองคนมี' + X.N.t + 'รวมกันกี่' + X.N.c, q3t: 'ตอนนี้ทั้งสองคนมี' + X.N.t + 'รวมกันกี่' + X.N.c, steps: [stp(a, 'sub', b), stp(a, 'add', a - b)]}; }}
];
// 3rd step (🌋 💀): one more sentence, told the way the holder of the answer works
function storyThird(X, st, hold, sign){
  const r = st.steps[st.steps.length - 1].r, N = X.N;
  if(!sign) sign = r >= 2 && Math.random() < 0.5 ? 'sub' : 'add';
  if(sign === 'sub' && r < 2) return false;
  const d = sign === 'sub' ? X.r(1, r - 1) : X.r(1, Math.max(1, Math.min(X.C - r, X.C > 100 ? 200 : 20)));
  if(sign === 'add' && r + d > X.C) return false;
  const plus = sign === 'add', E = {
    has: plus ? 'Later ' + X.p[0] + (N.alive ? ' gets ' : ' finds ') + fN(d) + ' more.' : 'Later ' + X.p[0] + (N.alive ? ' gives ' + fN(d) + ' to ' + X.p[2] : ' loses ' + fN(d)) + '.',
    in: 'Later ' + fN(d) + ' ' + (plus ? X.come(d) : 'more ' + X.out(d).replace(/^(is|are) /, d === 1 ? 'is ' : 'are ')) + '.',
    each: plus ? 'Later each friend gets ' + fN(d) + ' more.' : 'Later each friend gives ' + fN(d) + ' away.',
    together: plus ? 'Later ' + X.p[2] + ' gives them ' + fN(d) + ' more.' : 'Later they lose ' + fN(d) + '.',
    baht: plus ? 'Later Grandma gives ' + X.p[0] + ' ' + fN(d) + ' baht.' : 'Later ' + X.p[0] + ' spends ' + fN(d) + ' baht on a drink.',
    min: plus ? 'After that, ' + X.p[0] + ' rests for ' + fN(d) + ' minutes.' : X.p[0] + ' also ' + X.SW.acts[2].e + ' for ' + fN(d) + ' minutes.'}[hold];
  const T = {
    has: plus ? 'ต่อมา' + X.pt[0] + (N.alive ? 'ได้มา' : 'หาเจอ') + 'อีก ' + X.tn(d) : 'ต่อมา' + (N.alive ? 'ให้' + X.pt[2] + 'ไปอีก ' : 'ทำหายไป ') + X.tn(d),
    in: 'ต่อมา' + (plus ? X.tCome() : X.tOut()) + 'อีก ' + X.tn(d),
    each: plus ? 'ต่อมาได้เพิ่มอีกคนละ ' + X.tn(d) : 'ต่อมาแต่ละคนให้คนอื่นไปคนละ ' + X.tn(d),
    together: plus ? 'ต่อมา' + X.pt[2] + 'ให้เพิ่มอีก ' + X.tn(d) : 'ต่อมาทำหายไป ' + X.tn(d),
    baht: plus ? 'ต่อมาคุณยายให้เงินอีก ' + fN(d) + ' บาท' : 'ต่อมาซื้อน้ำอีก ' + fN(d) + ' บาท',
    min: plus ? 'หลังจากนั้นพักอีก ' + fN(d) + ' นาที' : 'แล้ว' + X.SW.acts[2].t + 'อีก ' + fN(d) + ' นาที'}[hold];
  if(!E || !T) return false;
  st.e.push(E); st.t.push(T); st.steps.push(stp(r, sign, d));
  if(st.q3e){ st.qe = st.q3e; st.qt = st.q3t; }
  return true;
}
function storySteps(lvl){ return lvl <= 2 ? 1 : lvl === 3 ? 2 : lvl === 4 ? (Math.random() < 0.5 ? 3 : 2) : 3; }
// 📖 one story question for the 📖 / 📜 modes (ser = the series picker; 🔀 mixes the signs)
function makeStoryQ(mode, ser, lvl, world, age, L){
  const lang = mode === 'storyth' ? 'th' : 'en', n = storySteps(lvl);
  for(let tries = 0; tries < 60; tries++){
    let st = null, tpl = null, X = null, nums = null;
    if(n === 1){
      const op = ser === 'mix' ? pick(lvl === 0 ? ['add', 'sub', 'add', 'sub', 'mul', 'div'] : OPS) : ser;
      let pool = STORY_ONE.filter(t => t.op === op && t.lv <= lvl);
      if(lvl === 2 && Math.random() < 0.6){ const think = pool.filter(t => t.lv === 2); if(think.length) pool = think; }   // 🔦: wording that doesn't say "more / left"
      tpl = pick(pool); X = storyX(world, lvl); nums = makeNums(op, lvl, L); st = tpl.mk(X, nums.a, nums.b, nums.ans);
    } else {
      const pool = STORY_TWO.filter(t => ser === 'mix' || t.ops.includes(ser));
      tpl = pick(pool); X = storyX(world, lvl, tpl.buy); st = tpl.mk(X);
      if(st && n === 3 && !storyThird(X, st, tpl.hold, tpl.s3)) st = null;
    }
    if(!st) continue;
    const ans = st.steps[st.steps.length - 1].r;
    if(!st.steps.every(z => Number.isInteger(z.r) && z.r >= 0 && z.a >= 0 && z.b >= 0)) continue;
    if(n > 1 && st.steps.some(z => z.r > X.C)) continue;
    // 🙈 an extra number that doesn't matter (🌋 half the time · 💀 always)
    let extra = 0;
    if(lvl === 5 || (lvl === 4 && Math.random() < 0.5)){
      const used = new Set([ans].concat(...st.steps.map(z => [z.a, z.b, z.r]))), age = Math.random() < 0.4;
      for(let k = 0; k < 20 && !extra; k++){ const x = age ? X.r(6, 12) : X.r(3, X.C > 100 ? 90 : 30); if(!used.has(x)) extra = x; }
      if(extra){
        st.e.splice(1 + rnd(st.e.length), 0, age ? X.p[0] + ' is ' + extra + ' years old.' : X.SW.extra.e.replace('{n}', extra));
        st.t.splice(1 + rnd(st.t.length), 0, age ? X.pt[0] + 'อายุ ' + extra + ' ขวบ' : X.SW.extra.t.replace('{n}', extra)); }
    }
    const last = st.steps[st.steps.length - 1], u = tpl.unit || 'n';
    const q = {op: last.op, a: last.a, b: last.b, ans, ask: ans, missing: '', story: true, lang, mode, tpl: tpl.id, steps: st.steps, extra, vis: null, noun: X.N, n: n, world,
      unit: u === 'baht' ? {e: 'baht', t: 'บาท'} : u === 'min' ? {e: 'minutes', t: 'นาที'} : u === 'box' ? {e: X.B.ep, t: X.B.c} : {e: X.N.ep, t: X.N.c}};
    const lines = lang === 'th' ? st.t : st.e, ask = lang === 'th' ? st.qt : st.qe;
    q.word = lines.join(' ') + ' ' + ask;
    const bold = x => UI.esc(x).replace(/[0-9][0-9,]*/g, m => '<b>' + m + '</b>');
    q.storyHtml = lines.map(bold).join(' ') + ' <span class="sq">' + bold(ask) + '</span>';
    if(n === 1 && tpl.pic && pictures(lvl, age)) q.vis = visFor({op: tpl.op, a: nums.a, b: nums.b, ans: nums.ans}, {items: [X.N.i]}, lvl);
    q.choices = storyChoices(q, L.choices);
    q.key = 'st' + tpl.id + '-' + st.steps.map(z => z.a + '_' + z.b).join('_') + (extra ? 'x' + extra : '');
    return q;
  }
  const q = makeNums(ser === 'mix' ? 'add' : ser, lvl, L);   // never reached in practice — a plain sum keeps the round going
  return Object.assign(q, {missing: '', word: '', vis: null, lang, mode, ask: q.ans, choices: choicesFor(Object.assign(q, {ask: q.ans, missing: ''}), L.choices), key: qKey(q)});
}
// answer buttons for a story: the right one + the real mistakes (stopped a step early, the wrong sign on the last step, used the extra number)
function storyChoices(q, n){
  const r = q.ask, set = new Set([r]), traps = [], L = q.steps[q.steps.length - 1];
  q.steps.slice(0, -1).forEach(z => traps.push(z.r));
  if(L.op === 'sub') traps.push(L.a + L.b); if(L.op === 'add') traps.push(Math.abs(L.a - L.b)); if(L.op === 'mul') traps.push(L.a + L.b); if(L.op === 'div') traps.push(L.a - L.b);
  if(q.extra) traps.push(r + q.extra, Math.abs(r - q.extra));
  const near = [r + 1, r - 1, r + 2, r - 2].concat(r >= 20 ? [r + 10, r - 10] : []);
  shuffle(traps).slice(0, n - 2).concat(shuffle(near), shuffle(traps)).forEach(v => { if(set.size < n && Number.isInteger(v) && v >= 0 && v !== r) set.add(v); });
  let k = 3; while(set.size < n){ const v = r + (Math.random() < 0.5 ? -1 : 1) * k++; if(v >= 0) set.add(v); }
  return shuffle([...set]);
}
/* 📏 s4a words#2 */
window.addEventListener('resize', () => { if(G && G.q && (G.q.story || G.q.trick || G.q.test)) fitStory(); });
/* ================= 🤔 TRICK QUESTIONS (➗ mq-w3, plan §6) ================= */
// Each trick: id · lv [from, to] (levels it can show on) · mk(R) → {q, a (right), t (THE trap), o [others], tl (🤔 why it's a trap), w (✅ why the answer is right)}
// or null when the numbers rolled don't work (R gives new numbers). Numbers are swapped where the trick allows it; Thai tricks are written for Thai kids.
const TK_DAYS = {en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], th: ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์']};
/* 📏 s4a words#3 */
const TK_GIRLS = {en: ['Mali', 'Ploy', 'Lily', 'Fah'], th: ['น้องมะลิ', 'น้องพลอย', 'น้องลิลลี่', 'น้องฟ้า']};
/* 📏 s4a words#4 */
function trickR(lang){ const D = TK_DAYS[lang]; return {r: randInt, pick, name: () => pick(TK_NAMES[lang]), girl: () => pick(TK_GIRLS[lang]), day: i => D[((i % 7) + 7) % 7], ord: tkOrd}; }
const TRICKS_EN = [
  {id: 'e01', lv: [0, 2], mk: R => { const a = R.r(3, 9), N = R.name(); return {q: `${N} has ${a} apples and eats none. How many apples does ${N} have?`, a, t: 0, o: [a - 1, a + 1], tl: '“Eats” sounds like a take-away — but none were eaten.', w: `Nothing was eaten, so all ${a} apples are still there.`}; }},
  {id: 'e02', lv: [0, 2], mk: R => { const k = R.r(1, 5); return {q: `Which is heavier: ${k} kg of feathers or ${k} kg of stones?`, a: 'Both the same', t: 'The stones', o: ['The feathers', "You can't tell"], tl: `Stones feel heavy — but both weigh ${k} kg.`, w: `${k} kg is ${k} kg, feathers or stones.`}; }},
  {id: 'e03', lv: [0, 2], mk: R => { const a = R.r(2, 6); return {q: `A cat has ${a} kittens. Each kitten has 1 tail. How many tails do the kittens have?`, a, t: a + 1, o: [a * 2, a - 1], tl: "Don't count the mother cat — the question is about the kittens.", w: `${a} kittens × 1 tail = ${a} tails.`}; }},
  {id: 'e04', lv: [0, 2], mk: R => { const a = R.r(3, 9), N = R.name(); return {q: `There are ${a} birds on a fence. ${N} counts them two times. How many birds are on the fence?`, a, t: a * 2, o: [a + 2, a - 1], tl: "Counting two times doesn't make more birds.", w: `No bird came or flew away — still ${a}.`}; }},
  {id: 'e05', lv: [0, 2], mk: R => { const a = R.r(2, 5); return {q: `How many legs do ${a} chickens have?`, a: 2 * a, t: 4 * a, o: [a, 2 * a + 1], tl: 'Chickens are not cows — a chicken has 2 legs, not 4.', w: `${a} × 2 legs = ${2 * a} legs.`}; }},
  {id: 'e06', lv: [0, 2], mk: R => { const a = R.r(2, 6), b = R.r(2, 6), N = R.name(); return {q: `${N} has ${a} red balls and ${b} blue balls. How many green balls does ${N} have?`, a: 0, t: a + b, o: [a, b, 1], tl: 'Adding the numbers is the trap — the question asks about GREEN balls.', w: 'Only red and blue balls — so 0 green ones.'}; }},
  {id: 'e07', lv: [1, 3], mk: R => { const k = R.r(2, 3); return {q: `A spider has 8 legs. How many legs do ${k} spiders have?`, a: 8 * k, t: 8 + k, o: [8, 8 * k + 2], tl: `Don't add the ${k} — every spider has its own 8 legs.`, w: `${k} × 8 = ${8 * k} legs.`}; }},
  {id: 'e08', lv: [0, 2], mk: R => { const a = R.r(2, 5), b = R.r(1, 4), N = R.name(); return {q: `${N} has ${a} sweets and gives none away. Then a friend gives ${N} ${b} more. How many sweets now?`, a: a + b, t: a, o: [a + b + 1, b], tl: '“Gives none away” means nothing was taken.', w: `${a} + ${b} = ${a + b} sweets.`}; }},
  {id: 'e09', lv: [0, 2], mk: R => ({q: 'How many corners does a circle have?', a: 0, t: 1, o: [4, 2], tl: 'A circle is one round line.', w: 'There is nowhere for a corner — 0 corners.'})},
  {id: 'e10', lv: [0, 2], mk: R => { const a = R.r(4, 9), N = R.name(); return {q: `${a} children stand in a line. ${N} is at the front. How many children are behind ${N}?`, a: a - 1, t: a, o: [a + 1, a - 2], tl: `${N} is one of the ${a} — don't count ${N} as behind.`, w: `${a} − 1 = ${a - 1} children.`}; }},
  {id: 'e11', lv: [1, 3], mk: R => { const a = R.r(6, 20), b = R.r(2, 5); return {q: `A bus has ${a} people. At a stop, ${b} get off and ${b} get on. How many people are on the bus now?`, a, t: a - b, o: [a + b, a - 1], tl: 'Off and on are the same number — they cancel out.', w: `${a} − ${b} + ${b} = ${a} people.`}; }},
  {id: 'e12', lv: [2, 3], mk: R => { const a = R.r(8, 15), b = R.r(2, 6); return {q: `A farmer has ${a} sheep. All but ${b} run away. How many sheep are left?`, a: b, t: a - b, o: [a, b + 1], tl: `“All but ${b}” does not mean take away ${b}.`, w: `All of them ran away except ${b} — so ${b} are left.`}; }},
  {id: 'e13', lv: [2, 3], mk: R => { const a = R.r(7, 15), b = R.r(2, 5); return {q: `There are ${a} sweets in a jar. You take ${b}. How many sweets do YOU have?`, a: b, t: a - b, o: [a, a + b], tl: 'The question asks what YOU have, not what is left in the jar.', w: `You took ${b}, so you have ${b}.`}; }},
  {id: 'e14', lv: [3, 5], mk: R => { const k = R.r(3, 8), N = R.name(); return {q: `${N} is ${R.ord(k)} from the front and ${R.ord(k)} from the back of a line. How many children are in the line?`, a: 2 * k - 1, t: 2 * k, o: [k, 2 * k + 1], tl: `${N} was counted two times.`, w: `${k} + ${k} − 1 = ${2 * k - 1} children.`}; }},
  {id: 'e15', lv: [2, 4], mk: R => { const a = R.r(4, 10); return {q: `A boat has a ladder with ${a} steps above the water. The water rises 1 metre. How many steps are above the water now?`, a, t: a - 2, o: [a - 1, a + 1], tl: 'The boat floats — it goes up with the water.', w: `The ladder rises with the boat, so ${a} steps are still above the water.`}; }},
  {id: 'e16', lv: [3, 4], mk: R => ({q: 'How many months of the year have 28 days?', a: 'All 12', t: '1', o: ['2', '6'], tl: 'You think of February — but every month has at least 28 days.', w: 'All 12 months have 28 days (most have more).'})},
  {id: 'e17', lv: [2, 4], mk: R => { const a = R.r(2, 5), G = R.girl(); return {q: `${G} has ${a} brothers. Each brother has 1 sister. How many girls are in the family?`, a: 1, t: a, o: [a + 1, 0], tl: 'The brothers all share the SAME sister.', w: `That one sister is ${G} — 1 girl.`}; }},
  {id: 'e18', lv: [2, 4], mk: R => { const a = 2 * R.r(5, 10); return {q: `How many times can you take 2 away from ${a}?`, a: 'Once', t: String(a / 2), o: ['Twice', String(a / 2 - 1)], tl: `${a} ÷ 2 = ${a / 2} is the trap.`, w: `After one take-away it is ${a - 2}, not ${a} any more — so only once.`}; }},
  {id: 'e19', lv: [2, 3], mk: R => { const a = R.r(5, 12), b = R.r(1, 4); return {q: `A box has ${a} cups. ${b} of them are cracked. How many cups are in the box?`, a, t: a - b, o: [b, a + b], tl: 'Cracked cups are still cups.', w: `Nothing left the box — still ${a} cups.`}; }},
  {id: 'e21', lv: [3, 4], mk: R => { const k = R.r(2, 5); return {q: `In a race you pass the runner in ${R.ord(k)} place. What place are you in now?`, a: R.ord(k), t: R.ord(k - 1), o: [R.ord(k + 1), '1st', R.ord(k + 2)], tl: `You took the ${R.ord(k)} runner's place — you did not pass the one in front of them.`, w: `You are now ${R.ord(k)}.`}; }},
  {id: 'e22', lv: [3, 4], mk: R => { const d = R.r(0, 6); return {q: `If yesterday was ${R.day(d)}, what day is tomorrow?`, a: R.day(d + 2), t: R.day(d + 1), o: [R.day(d), R.day(d + 3)], tl: `${R.day(d + 1)} is TODAY.`, w: `Yesterday ${R.day(d)} → today ${R.day(d + 1)} → tomorrow ${R.day(d + 2)}.`}; }},
  {id: 'e23', lv: [3, 4], mk: R => { const d = R.r(0, 6), k = R.pick([7, 14]); return {q: `Today is ${R.day(d)}. What day will it be in ${k} days?`, a: R.day(d), t: R.day(d + 1), o: [R.day(d + 6), R.day(d + 2)], tl: `${k} days is ${k === 7 ? 'one whole week' : 'two whole weeks'}.`, w: `After whole weeks it is ${R.day(d)} again.`}; }},
  {id: 'e24', lv: [3, 4], mk: R => { const half = Math.random() < 0.5; return {q: `How many minutes are in ${half ? 'half' : 'a quarter'} of an hour?`, a: half ? 30 : 15, t: half ? 50 : 25, o: [60, half ? 40 : 20], tl: 'An hour has 60 minutes, not 100.', w: `60 ÷ ${half ? 2 : 4} = ${half ? 30 : 15} minutes.`}; }},
  {id: 'e25', lv: [3, 4], mk: R => { const a = R.r(5, 9); return {q: `Which is heavier: 1 kg of rice or ${a}00 g of rice?`, a: '1 kg', t: `${a}00 g`, o: ['They are the same', "You can't tell"], tl: `${a}00 is a big number, but grams are tiny.`, w: `1 kg = 1,000 g — more than ${a}00 g.`}; }},
  {id: 'e26', lv: [3, 4], mk: R => { const a = R.r(5, 9); return {q: `Which is longer: 1 metre or ${a}0 centimetres?`, a: '1 metre', t: `${a}0 cm`, o: ['They are the same', "You can't tell"], tl: `${a}0 looks bigger than 1 — but centimetres are tiny.`, w: `1 metre = 100 cm — longer than ${a}0 cm.`}; }},
  {id: 'e28', lv: [4, 5], mk: R => { const a = R.r(5, 20), s = R.pick([1, 2, 5]); return {q: `A fence is ${a * s} m long. A post goes every ${s} m, at both ends too. How many posts?`, a: a + 1, t: a, o: [a - 1, a + 2], tl: `${a * s} ÷ ${s} = ${a} counts the gaps, not the posts.`, w: `${a} gaps need ${a + 1} posts (one more at the end).`}; }},
  {id: 'e29', lv: [4, 5], mk: R => { const a = R.r(3, 10); return {q: `You cut a log into ${a} pieces. Each cut takes 1 minute. How many minutes does it take?`, a: a - 1, t: a, o: [a + 1, a - 2], tl: `${a} pieces need fewer than ${a} cuts.`, w: `${a} pieces = ${a - 1} cuts = ${a - 1} minutes.`}; }},
  {id: 'e30', lv: [4, 5], mk: R => { const x = 2 * R.r(1, 10), y = 2 * R.r(1, 5); return {q: `What is half of ${x}, plus ${y}?`, a: x / 2 + y, t: (x + y) / 2, o: [x + y, x / 2 + y + 1], tl: `Halving ${x} + ${y} together is the trap.`, w: `Half of ${x} is ${x / 2}, then + ${y} = ${x / 2 + y}.`}; }},
  {id: 'e31', lv: [4, 5], mk: R => { const a = R.r(3, 12); return {q: `${a} + ${a} × 0 = ?`, a, t: 0, o: [a * 2, 1], tl: 'Going left to right gives 0 — but × comes before +.', w: `${a} × 0 = 0, then ${a} + 0 = ${a}.`}; }},
  {id: 'e32', lv: [4, 5], mk: R => { const a = R.r(15, 30), b = R.r(2, 9), c = R.r(2, 9); return {q: `${a} − ${b} + ${c} = ?`, a: a - b + c, t: a - b - c, o: [a + b - c, a - b + c + 1], tl: `Doing ${b} + ${c} first is the trap.`, w: `Left to right: ${a} − ${b} = ${a - b}, then + ${c} = ${a - b + c}.`}; }},
  {id: 'e33', lv: [4, 5], mk: R => { const a = R.r(10, 20); return {q: `It takes ${a} steps to walk from floor 1 to floor 2. How many steps from floor 1 to floor 3?`, a: 2 * a, t: 3 * a, o: [a, 2 * a + 1], tl: 'Floor 1 to floor 3 is not 3 sets of stairs.', w: `1 → 2 → 3 is 2 sets of stairs: 2 × ${a} = ${2 * a} steps.`}; }},
  {id: 'e34', lv: [4, 5], mk: R => { const h = R.r(5, 10); return {q: `A snail climbs a ${h} m wall. Each day it goes up 3 m, each night it slides down 2 m. On which day does it reach the top?`, a: `Day ${h - 2}`, t: `Day ${h}`, o: [`Day ${h - 1}`, `Day ${h + 1}`], tl: '1 m a day for the whole wall is the trap.', w: `After ${h - 3} days it is at ${h - 3} m — the next day it climbs 3 m and reaches the top: day ${h - 2}.`}; }},
  {id: 'e35', lv: [4, 5], mk: R => { const a = R.r(6, 12), b = R.r(2, 4); return {q: `${a} candles are burning. ${b} are blown out. How many candles are left at the end?`, a: b, t: a - b, o: [a, 0], tl: 'The candles that keep burning are the ones that melt away.', w: `The ${b} blown-out candles stay; the other ${a - b} burn away.`}; }},
  {id: 'e36', lv: [5, 5], mk: R => { const k = R.r(2, 4), cols = ['red and blue', 'red, blue and green', 'red, blue, green and yellow'][k - 2]; return {q: `Socks in ${cols} are mixed in a dark drawer. How many socks must you take out to be SURE of a pair?`, a: k + 1, t: 2, o: [k * 2, k + 2], tl: 'Two socks could be different colours.', w: `With ${k} colours, ${k} socks could all be different — sock number ${k + 1} must match one.`}; }},
  {id: 'e37', lv: [5, 5], mk: R => { const d = R.r(2, 9); return {q: `How many times do you write the digit ${d} when you write the numbers 1 to 100?`, a: 20, t: 10, o: [11, 19], tl: `Counting only ${d}, 1${d}, 2${d}… misses ${d}0 to ${d}9.`, w: '10 in the ones place + 10 in the tens place = 20.'}; }},
  {id: 'e38', lv: [4, 5], mk: R => { const k = R.pick([6, 9]); return {q: `At 3 o'clock a clock chimes 3 times in 2 seconds. At ${k} o'clock, how many seconds do the ${k} chimes take?`, a: k - 1, t: 2 * k / 3, o: [k, k - 2], tl: 'Counting the chimes instead of the gaps between them is the trap.', w: `3 chimes have 2 gaps of 1 second; ${k} chimes have ${k - 1} gaps = ${k - 1} seconds.`}; }},
  {id: 'e39', lv: [5, 5], mk: R => { const a = R.r(3, 6); return {q: `${a} cats catch ${a} mice in ${a} minutes. How many cats are needed to catch 100 mice in 100 minutes?`, a, t: 100, o: [a * 2, 10], tl: 'All the 100s make 100 look right.', w: `The same ${a} cats catch 1 mouse a minute together — in 100 minutes, 100 mice.`}; }},
  {id: 'e40', lv: [5, 5], mk: R => { const k = R.r(5, 20); return {q: `A bat and a ball cost ${100 + 2 * k} baht together. The bat costs 100 baht more than the ball. How much is the ball?`, a: `${k} baht`, t: `${2 * k} baht`, o: [`${k + 5} baht`, `${100 + k} baht`], tl: `With a ${2 * k}-baht ball the bat is ${2 * k + 100} — together ${4 * k + 100} baht.`, w: `Ball ${k} + bat ${k + 100} = ${2 * k + 100} baht.`}; }},
  {id: 'e41', lv: [2, 5], mk: R => ({q: 'A rooster lays an egg on top of a roof. Which way does the egg roll?', a: 'There is no egg', t: 'Down the left side', o: ['Down the right side', 'Off the front'], tl: 'Thinking about which side is the trap.', w: "Roosters don't lay eggs — hens do!"})},
  {id: 'e42', lv: [2, 4], mk: R => { const a = R.r(2, 6), b = R.r(2, 5); return {q: `${a} fish and ${b} ducks are in a pond. How many legs are in the pond?`, a: 2 * b, t: 2 * (a + b), o: [4 * b, a + b], tl: 'Fish have no legs.', w: `Only the ducks have legs: ${b} × 2 = ${2 * b}.`}; }},
  {id: 'e43', lv: [4, 5], mk: R => { const d = 2 * R.r(5, 15); return {q: `Water plants double every day and cover the whole pond on day ${d}. On which day was the pond half covered?`, a: `Day ${d - 1}`, t: `Day ${d / 2}`, o: [`Day ${d - 2}`, `Day ${d / 2 + 1}`], tl: `Half of ${d} days is the trap.`, w: `They double every day, so the day before it was full (day ${d - 1}) it was half covered.`}; }},
  {id: 'e44', lv: [4, 5], mk: R => { const a = R.r(3, 6); return {q: `${a} friends each shake hands with every other friend once. How many handshakes?`, a: a * (a - 1) / 2, t: a * (a - 1), o: [a, a * a], tl: `${a} × ${a - 1} counts every handshake two times.`, w: `${a} × ${a - 1} ÷ 2 = ${a * (a - 1) / 2} handshakes.`}; }},
  {id: 'e45', lv: [1, 3], mk: R => { const a = R.r(5, 12), b = R.r(2, 4); return {q: `A mango tree has ${a} mangoes. The wind blows ${b} coconuts down from the palm next to it. How many mangoes are on the mango tree?`, a, t: a - b, o: [a + b, b], tl: 'The wind blew down COCONUTS, not mangoes.', w: `No mango fell — still ${a}.`}; }}
];
const TRICKS_TH = [
  {id: 't01', lv: [0, 2], mk: R => { const a = R.r(3, 9), N = R.name(); return {q: `${N}มีแอปเปิล ${a} ลูก ไม่ได้กินเลยสักลูก ${N}มีแอปเปิลกี่ลูก`, a, t: 0, o: [a - 1, a + 1], tl: 'คำว่า “กิน” ทำให้คิดว่าต้องลบ แต่ไม่ได้กินเลย', w: `ไม่ได้กินเลย จึงยังมี ${a} ลูกเท่าเดิม`}; }},
  {id: 't02', lv: [0, 2], mk: R => { const k = R.r(1, 5); return {q: `ขนนก ${k} กิโลกรัม กับหิน ${k} กิโลกรัม อะไรหนักกว่ากัน`, a: 'หนักเท่ากัน', t: 'หินหนักกว่า', o: ['ขนนกหนักกว่า', 'บอกไม่ได้'], tl: `หินดูหนัก แต่ทั้งสองอย่างหนัก ${k} กิโลกรัมเท่ากัน`, w: `${k} กิโลกรัมก็คือ ${k} กิโลกรัม ไม่ว่าจะเป็นอะไร`}; }},
  {id: 't03', lv: [0, 2], mk: R => { const a = R.r(2, 6); return {q: `แม่แมวมีลูก ${a} ตัว ลูกแมวแต่ละตัวมีหาง 1 หาง ลูกแมวมีหางรวมกี่หาง`, a, t: a + 1, o: [a * 2, a - 1], tl: 'อย่านับแม่แมวด้วย โจทย์ถามแค่ลูกแมว', w: `ลูกแมว ${a} ตัว ตัวละ 1 หาง = ${a} หาง`}; }},
  {id: 't04', lv: [0, 2], mk: R => { const a = R.r(3, 9), N = R.name(); return {q: `บนรั้วมีนก ${a} ตัว ${N}นับนก 2 รอบ บนรั้วมีนกกี่ตัว`, a, t: a * 2, o: [a + 2, a - 1], tl: 'นับ 2 รอบ นกก็ไม่ได้เพิ่มขึ้น', w: `ไม่มีนกบินมาหรือบินไป ยังมี ${a} ตัว`}; }},
  {id: 't05', lv: [0, 2], mk: R => { const a = R.r(2, 5); return {q: `ไก่ ${a} ตัว มีขารวมกี่ขา`, a: 2 * a, t: 4 * a, o: [a, 2 * a + 1], tl: 'ไก่ไม่ใช่วัว ไก่มี 2 ขา ไม่ใช่ 4 ขา', w: `${a} × 2 = ${2 * a} ขา`}; }},
  {id: 't06', lv: [0, 2], mk: R => { const a = R.r(2, 6), b = R.r(2, 6), N = R.name(); return {q: `${N}มีลูกบอลสีแดง ${a} ลูก และสีฟ้า ${b} ลูก ${N}มีลูกบอลสีเขียวกี่ลูก`, a: 0, t: a + b, o: [a, b, 1], tl: 'เอาตัวเลขมาบวกกันคือกับดัก โจทย์ถามลูกบอลสีเขียว', w: 'มีแค่สีแดงกับสีฟ้า สีเขียวจึงมี 0 ลูก'}; }},
  {id: 't07', lv: [1, 3], mk: R => { const k = R.r(2, 3); return {q: `แมงมุม 1 ตัวมี 8 ขา แมงมุม ${k} ตัวมีขารวมกี่ขา`, a: 8 * k, t: 8 + k, o: [8, 8 * k + 2], tl: `อย่าเอา ${k} ไปบวก แมงมุมทุกตัวมี 8 ขาของตัวเอง`, w: `${k} × 8 = ${8 * k} ขา`}; }},
  {id: 't08', lv: [0, 2], mk: R => { const a = R.r(2, 5), b = R.r(1, 4), N = R.name(); return {q: `${N}มีขนม ${a} ชิ้น ไม่ได้แบ่งให้ใครเลย แล้วเพื่อนให้มาอีก ${b} ชิ้น ตอนนี้${N}มีขนมกี่ชิ้น`, a: a + b, t: a, o: [a + b + 1, b], tl: '“ไม่ได้แบ่งให้ใคร” แปลว่าไม่มีอะไรหายไป', w: `${a} + ${b} = ${a + b} ชิ้น`}; }},
  {id: 't09', lv: [0, 2], mk: R => ({q: 'วงกลมมีมุมกี่มุม', a: 0, t: 1, o: [4, 2], tl: 'วงกลมเป็นเส้นโค้งเส้นเดียว', w: 'ไม่มีตรงไหนเป็นมุมเลย จึงมี 0 มุม'})},
  {id: 't10', lv: [0, 2], mk: R => { const a = R.r(4, 9), N = R.name(); return {q: `เด็ก ${a} คนเข้าแถว ${N}ยืนหัวแถว ข้างหลัง${N}มีเด็กกี่คน`, a: a - 1, t: a, o: [a + 1, a - 2], tl: `${N}ก็เป็น 1 ใน ${a} คน อย่านับ${N}ด้วย`, w: `${a} − 1 = ${a - 1} คน`}; }},
  {id: 't11', lv: [1, 3], mk: R => { const a = R.r(6, 20), b = R.r(2, 5); return {q: `บนรถเมล์มีคน ${a} คน ถึงป้ายหนึ่ง ลงไป ${b} คน แล้วขึ้นมา ${b} คน ตอนนี้บนรถเมล์มีกี่คน`, a, t: a - b, o: [a + b, a - 1], tl: 'ลงกับขึ้นจำนวนเท่ากัน หักล้างกันพอดี', w: `${a} − ${b} + ${b} = ${a} คน`}; }},
  {id: 't12', lv: [2, 3], mk: R => { const a = R.r(8, 15), b = R.r(2, 6); return {q: `ชาวนามีแกะ ${a} ตัว หนีไปหมดยกเว้น ${b} ตัว เหลือแกะกี่ตัว`, a: b, t: a - b, o: [a, b + 1], tl: `“ยกเว้น ${b} ตัว” ไม่ได้แปลว่าหนีไป ${b} ตัว`, w: `หนีไปหมด เหลือแค่ ${b} ตัวที่ไม่หนี`}; }},
  {id: 't13', lv: [2, 3], mk: R => { const a = R.r(7, 15), b = R.r(2, 5); return {q: `ในโหลมีลูกอม ${a} เม็ด เธอหยิบไป ${b} เม็ด เธอมีลูกอมกี่เม็ด`, a: b, t: a - b, o: [a, a + b], tl: 'โจทย์ถามว่า “เธอ” มีกี่เม็ด ไม่ได้ถามว่าในโหลเหลือกี่เม็ด', w: `เธอหยิบมา ${b} เม็ด เธอจึงมี ${b} เม็ด`}; }},
  {id: 't14', lv: [3, 5], mk: R => { const k = R.r(3, 8), N = R.name(); return {q: `${N}ยืนเป็นคนที่ ${k} นับจากหัวแถว และเป็นคนที่ ${k} นับจากท้ายแถว แถวนี้มีกี่คน`, a: 2 * k - 1, t: 2 * k, o: [k, 2 * k + 1], tl: `${N}ถูกนับ 2 ครั้ง`, w: `${k} + ${k} − 1 = ${2 * k - 1} คน`}; }},
  {id: 't15', lv: [2, 4], mk: R => { const a = R.r(4, 10); return {q: `เรือลำหนึ่งมีบันไดโผล่เหนือน้ำ ${a} ขั้น น้ำขึ้นสูงอีก 1 เมตร ตอนนี้บันไดโผล่เหนือน้ำกี่ขั้น`, a, t: a - 2, o: [a - 1, a + 1], tl: 'เรือลอยน้ำ เรือจึงลอยสูงขึ้นตามน้ำ', w: `บันไดสูงขึ้นพร้อมเรือ จึงยังโผล่ ${a} ขั้นเท่าเดิม`}; }},
  {id: 't16', lv: [3, 4], mk: R => ({q: 'ใน 1 ปี มีกี่เดือนที่มีวันที่ 28', a: 'ทุกเดือน (12)', t: '1 เดือน', o: ['2 เดือน', '6 เดือน'], tl: 'เรานึกถึงเดือนกุมภาพันธ์ แต่ทุกเดือนมีวันที่ 28', w: 'ทั้ง 12 เดือนมีวันที่ 28 (ส่วนใหญ่มีมากกว่านั้นอีก)'})},
  {id: 't17', lv: [2, 4], mk: R => { const a = R.r(2, 5), G = R.girl(); return {q: `${G}มีพี่ชาย ${a} คน พี่ชายแต่ละคนมีน้องสาว 1 คน บ้านนี้มีลูกผู้หญิงกี่คน`, a: 1, t: a, o: [a + 1, 0], tl: 'พี่ชายทุกคนมีน้องสาวคนเดียวกัน', w: `น้องสาวคนนั้นก็คือ${G} มีลูกผู้หญิง 1 คน`}; }},
  {id: 't18', lv: [2, 4], mk: R => { const a = 2 * R.r(5, 10); return {q: `เอา 2 ออกจาก ${a} ได้กี่ครั้ง`, a: 'ครั้งเดียว', t: `${a / 2} ครั้ง`, o: ['2 ครั้ง', `${a / 2 - 1} ครั้ง`], tl: `${a} ÷ 2 = ${a / 2} คือกับดัก`, w: `เอาออกครั้งแรกแล้วจะเหลือ ${a - 2} ไม่ใช่ ${a} อีกต่อไป`}; }},
  {id: 't19', lv: [2, 3], mk: R => { const a = R.r(5, 12), b = R.r(1, 4); return {q: `ในกล่องมีแก้ว ${a} ใบ เป็นแก้วร้าว ${b} ใบ ในกล่องมีแก้วกี่ใบ`, a, t: a - b, o: [b, a + b], tl: 'แก้วร้าวก็ยังเป็นแก้ว', w: `ไม่มีแก้วออกจากกล่อง ยังมี ${a} ใบ`}; }},
  {id: 't21', lv: [3, 4], mk: R => { const k = R.r(2, 5); return {q: `วิ่งแข่ง เธอวิ่งแซงคนที่ ${k} ได้ ตอนนี้เธออยู่ที่เท่าไร`, a: `ที่ ${k}`, t: `ที่ ${k - 1}`, o: [`ที่ ${k + 1}`, 'ที่ 1', `ที่ ${k + 2}`], tl: `เธอแซงคนที่ ${k} จึงได้ที่ของเขาแทน ไม่ได้แซงคนข้างหน้าเขา`, w: `ตอนนี้เธออยู่ที่ ${k}`}; }},
  {id: 't22', lv: [3, 4], mk: R => { const d = R.r(0, 6); return {q: `ถ้าเมื่อวานเป็น${R.day(d)} พรุ่งนี้เป็นวันอะไร`, a: R.day(d + 2), t: R.day(d + 1), o: [R.day(d), R.day(d + 3)], tl: `${R.day(d + 1)}คือ “วันนี้”`, w: `เมื่อวาน${R.day(d)} → วันนี้${R.day(d + 1)} → พรุ่งนี้${R.day(d + 2)}`}; }},
  {id: 't23', lv: [3, 4], mk: R => { const d = R.r(0, 6), k = R.pick([7, 14]); return {q: `วันนี้เป็น${R.day(d)} อีก ${k} วันจะเป็นวันอะไร`, a: R.day(d), t: R.day(d + 1), o: [R.day(d + 6), R.day(d + 2)], tl: `${k} วันคือ ${k / 7} สัปดาห์พอดี`, w: `ครบสัปดาห์ก็กลับมาเป็น${R.day(d)}อีก`}; }},
  {id: 't24', lv: [3, 4], mk: R => { const half = Math.random() < 0.5; return {q: half ? 'ครึ่งชั่วโมงมีกี่นาที' : 'หนึ่งในสี่ของชั่วโมงมีกี่นาที', a: half ? 30 : 15, t: half ? 50 : 25, o: [60, half ? 40 : 20], tl: '1 ชั่วโมงมี 60 นาที ไม่ใช่ 100 นาที', w: `60 ÷ ${half ? 2 : 4} = ${half ? 30 : 15} นาที`}; }},
  {id: 't25', lv: [3, 4], mk: R => { const a = R.r(5, 9); return {q: `ข้าวสาร 1 กิโลกรัม กับข้าวสาร ${a}00 กรัม อะไรหนักกว่ากัน`, a: '1 กิโลกรัม', t: `${a}00 กรัม`, o: ['หนักเท่ากัน', 'บอกไม่ได้'], tl: `${a}00 เป็นเลขเยอะ แต่กรัมเป็นหน่วยเล็ก`, w: `1 กิโลกรัม = 1,000 กรัม มากกว่า ${a}00 กรัม`}; }},
  {id: 't26', lv: [3, 4], mk: R => { const a = R.r(5, 9); return {q: `1 เมตร กับ ${a}0 เซนติเมตร อะไรยาวกว่ากัน`, a: '1 เมตร', t: `${a}0 เซนติเมตร`, o: ['ยาวเท่ากัน', 'บอกไม่ได้'], tl: `${a}0 ดูมากกว่า 1 แต่เซนติเมตรเป็นหน่วยเล็ก`, w: `1 เมตร = 100 เซนติเมตร ยาวกว่า ${a}0 เซนติเมตร`}; }},
  {id: 't28', lv: [4, 5], mk: R => { const a = R.r(5, 20), s = R.pick([1, 2, 5]); return {q: `รั้วยาว ${a * s} เมตร ปักเสาทุก ${s} เมตร รวมหัวและท้ายด้วย ต้องใช้เสากี่ต้น`, a: a + 1, t: a, o: [a - 1, a + 2], tl: `${a * s} ÷ ${s} = ${a} คือจำนวนช่อง ไม่ใช่จำนวนเสา`, w: `${a} ช่อง ต้องใช้เสา ${a + 1} ต้น (เพิ่มอีก 1 ต้นตรงปลาย)`}; }},
  {id: 't29', lv: [4, 5], mk: R => { const a = R.r(3, 10); return {q: `ตัดท่อนไม้ให้เป็น ${a} ท่อน ตัดครั้งละ 1 นาที ใช้เวลากี่นาที`, a: a - 1, t: a, o: [a + 1, a - 2], tl: `${a} ท่อน ไม่ต้องตัดถึง ${a} ครั้ง`, w: `${a} ท่อน ตัด ${a - 1} ครั้ง = ${a - 1} นาที`}; }},
  {id: 't30', lv: [4, 5], mk: R => { const x = 2 * R.r(1, 10), y = 2 * R.r(1, 5); return {q: `ครึ่งหนึ่งของ ${x} แล้วบวก ${y} ได้เท่าไร`, a: x / 2 + y, t: (x + y) / 2, o: [x + y, x / 2 + y + 1], tl: `เอา ${x} + ${y} แล้วค่อยแบ่งครึ่งคือกับดัก`, w: `ครึ่งหนึ่งของ ${x} คือ ${x / 2} แล้วบวก ${y} = ${x / 2 + y}`}; }},
  {id: 't31', lv: [4, 5], mk: R => { const a = R.r(3, 12); return {q: `${a} + ${a} × 0 = ?`, a, t: 0, o: [a * 2, 1], tl: 'คิดจากซ้ายไปขวาจะได้ 0 แต่ต้องคูณก่อนบวก', w: `${a} × 0 = 0 แล้ว ${a} + 0 = ${a}`}; }},
  {id: 't32', lv: [4, 5], mk: R => { const a = R.r(15, 30), b = R.r(2, 9), c = R.r(2, 9); return {q: `${a} − ${b} + ${c} = ?`, a: a - b + c, t: a - b - c, o: [a + b - c, a - b + c + 1], tl: `บวก ${b} กับ ${c} ก่อนคือกับดัก`, w: `คิดจากซ้ายไปขวา: ${a} − ${b} = ${a - b} แล้ว + ${c} = ${a - b + c}`}; }},
  {id: 't33', lv: [4, 5], mk: R => { const a = R.r(10, 20); return {q: `เดินขึ้นบันไดจากชั้น 1 ไปชั้น 2 ใช้ ${a} ขั้น จากชั้น 1 ไปชั้น 3 ต้องเดินกี่ขั้น`, a: 2 * a, t: 3 * a, o: [a, 2 * a + 1], tl: 'ชั้น 1 ไปชั้น 3 ไม่ใช่บันได 3 ช่วง', w: `1 → 2 → 3 คือบันได 2 ช่วง: 2 × ${a} = ${2 * a} ขั้น`}; }},
  {id: 't34', lv: [4, 5], mk: R => { const h = R.r(5, 10); return {q: `หอยทากปีนกำแพงสูง ${h} เมตร กลางวันปีนขึ้น 3 เมตร กลางคืนไถลลง 2 เมตร จะถึงยอดในวันที่เท่าไร`, a: `วันที่ ${h - 2}`, t: `วันที่ ${h}`, o: [`วันที่ ${h - 1}`, `วันที่ ${h + 1}`], tl: 'คิดว่าขึ้นได้วันละ 1 เมตรตลอดทางคือกับดัก', w: `ครบ ${h - 3} วันอยู่ที่ ${h - 3} เมตร วันต่อมาปีนอีก 3 เมตรก็ถึงยอด คือวันที่ ${h - 2}`}; }},
  {id: 't35', lv: [4, 5], mk: R => { const a = R.r(6, 12), b = R.r(2, 4); return {q: `จุดเทียนไว้ ${a} เล่ม เป่าดับไป ${b} เล่ม สุดท้ายจะเหลือเทียนกี่เล่ม`, a: b, t: a - b, o: [a, 0], tl: 'เทียนที่ยังติดไฟอยู่คือเล่มที่จะละลายหมด', w: `เทียน ${b} เล่มที่ดับแล้วยังอยู่ อีก ${a - b} เล่มไหม้จนหมด`}; }},
  {id: 't36', lv: [5, 5], mk: R => { const k = R.r(2, 4), cols = ['สีแดงกับสีฟ้า', 'สีแดง สีฟ้า และสีเขียว', 'สีแดง สีฟ้า สีเขียว และสีเหลือง'][k - 2]; return {q: `ถุงเท้า${cols}ปนกันในลิ้นชักมืด ๆ ต้องหยิบอย่างน้อยกี่ข้าง ถึงจะได้คู่สีเดียวกันแน่ ๆ`, a: k + 1, t: 2, o: [k * 2, k + 2], tl: 'หยิบ 2 ข้างอาจได้คนละสี', w: `มี ${k} สี หยิบ ${k} ข้างอาจได้สีไม่ซ้ำกันเลย ข้างที่ ${k + 1} ต้องซ้ำสีใดสีหนึ่งแน่นอน`}; }},
  {id: 't37', lv: [5, 5], mk: R => { const d = R.r(2, 9); return {q: `เขียนเลข 1 ถึง 100 จะต้องเขียนเลข ${d} กี่ตัว`, a: 20, t: 10, o: [11, 19], tl: `นับแค่ ${d}, 1${d}, 2${d}… จะลืม ${d}0 ถึง ${d}9`, w: 'หลักหน่วย 10 ตัว + หลักสิบ 10 ตัว = 20 ตัว'}; }},
  {id: 't38', lv: [4, 5], mk: R => { const k = R.pick([6, 9]); return {q: `ตอน 3 โมง นาฬิกาตี 3 ครั้งใช้เวลา 2 วินาที ตอน ${k} โมง นาฬิกาตี ${k} ครั้งใช้เวลากี่วินาที`, a: k - 1, t: 2 * k / 3, o: [k, k - 2], tl: 'นับจำนวนครั้งที่ตี แทนที่จะนับช่วงห่างระหว่างครั้ง คือกับดัก', w: `ตี 3 ครั้งมี 2 ช่วง ช่วงละ 1 วินาที ตี ${k} ครั้งมี ${k - 1} ช่วง = ${k - 1} วินาที`}; }},
  {id: 't39', lv: [5, 5], mk: R => { const a = R.r(3, 6); return {q: `แมว ${a} ตัว จับหนูได้ ${a} ตัว ใน ${a} นาที ต้องใช้แมวกี่ตัว จึงจะจับหนูได้ 100 ตัว ใน 100 นาที`, a, t: 100, o: [a * 2, 10], tl: 'เลข 100 หลายตัวทำให้คิดว่าคำตอบคือ 100', w: `แมว ${a} ตัวชุดเดิมจับได้นาทีละ 1 ตัว ใน 100 นาทีก็จับได้ 100 ตัว`}; }},
  {id: 't40', lv: [5, 5], mk: R => { const k = R.r(5, 20); return {q: `ปากกากับยางลบราคารวม ${100 + 2 * k} บาท ปากกาแพงกว่ายางลบ 100 บาท ยางลบราคากี่บาท`, a: `${k} บาท`, t: `${2 * k} บาท`, o: [`${k + 5} บาท`, `${100 + k} บาท`], tl: `ถ้ายางลบ ${2 * k} บาท ปากกาจะเป็น ${2 * k + 100} บาท รวมเป็น ${4 * k + 100} บาท`, w: `ยางลบ ${k} + ปากกา ${k + 100} = ${2 * k + 100} บาท`}; }},
  {id: 't41', lv: [2, 5], mk: R => ({q: 'ไก่ตัวผู้ออกไข่บนหลังคาบ้าน ไข่จะกลิ้งลงทางไหน', a: 'ไม่มีไข่', t: 'กลิ้งลงทางซ้าย', o: ['กลิ้งลงทางขวา', 'กลิ้งลงข้างหน้า'], tl: 'การคิดว่าไข่กลิ้งทางไหนคือกับดัก', w: 'ไก่ตัวผู้ออกไข่ไม่ได้ ไก่ตัวเมียต่างหากที่ออกไข่!'})},
  {id: 't42', lv: [2, 4], mk: R => { const a = R.r(2, 6), b = R.r(2, 5); return {q: `ในบ่อมีปลา ${a} ตัว และเป็ด ${b} ตัว ในบ่อมีขารวมกี่ขา`, a: 2 * b, t: 2 * (a + b), o: [4 * b, a + b], tl: 'ปลาไม่มีขา', w: `มีแต่ขาเป็ด: ${b} × 2 = ${2 * b} ขา`}; }},
  {id: 't43', lv: [4, 5], mk: R => { const d = 2 * R.r(5, 15); return {q: `จอกแหนในบ่อเพิ่มขึ้นเป็น 2 เท่าทุกวัน และเต็มบ่อในวันที่ ${d} บ่อเต็มครึ่งหนึ่งในวันที่เท่าไร`, a: `วันที่ ${d - 1}`, t: `วันที่ ${d / 2}`, o: [`วันที่ ${d - 2}`, `วันที่ ${d / 2 + 1}`], tl: `ครึ่งหนึ่งของ ${d} วันคือกับดัก`, w: `จอกแหนเพิ่มเป็น 2 เท่าทุกวัน วันก่อนเต็มบ่อ (วันที่ ${d - 1}) จึงมีแค่ครึ่งบ่อ`}; }},
  {id: 't44', lv: [4, 5], mk: R => { const a = R.r(3, 6); return {q: `เพื่อน ${a} คน จับมือกันทุกคู่ คู่ละ 1 ครั้ง จับมือกันทั้งหมดกี่ครั้ง`, a: a * (a - 1) / 2, t: a * (a - 1), o: [a, a * a], tl: `${a} × ${a - 1} นับการจับมือซ้ำ 2 รอบ`, w: `${a} × ${a - 1} ÷ 2 = ${a * (a - 1) / 2} ครั้ง`}; }},
  {id: 't45', lv: [1, 3], mk: R => { const a = R.r(5, 12), b = R.r(2, 4); return {q: `ต้นมะม่วงมีมะม่วง ${a} ลูก ลมพัดมะพร้าวจากต้นข้าง ๆ ตกลงมา ${b} ลูก บนต้นมะม่วงเหลือมะม่วงกี่ลูก`, a, t: a - b, o: [a + b, b], tl: 'ที่ตกลงมาคือมะพร้าว ไม่ใช่มะม่วง', w: `มะม่วงไม่ได้ตกเลย ยังมี ${a} ลูก`}; }}
];
/* 📏 s4a words#5 */
// answer buttons: the right one + THE trap + others (numbers fill up with near numbers), never two the same
function trickChoices(it, n){
  const S = x => String(x), right = S(it.a), out = [{w: right, ok: true}, {w: S(it.t), trap: true}], has = new Set([right, S(it.t)]);
  (it.o || []).forEach(x => { const w = S(x); if(out.length < n && !has.has(w) && !(typeof x === 'number' && x < 0)){ has.add(w); out.push({w}); } });
  for(let k = 1; out.length < n && /^\d+$/.test(right) && k < 20; k++) [Number(right) + k, Number(right) - k].forEach(v => { const w = S(v); if(out.length < n && v >= 0 && !has.has(w)){ has.add(w); out.push({w}); } });
  return shuffle(out);
}
// 🤔 one trick for this level: never one from this round, and (per player) none seen before until this level's pool is used up — then it starts again
function makeTrickQ(mode, lvl, L){
  const lang = mode === 'trickth' ? 'th' : 'en', bank = lang === 'th' ? TRICKS_TH : TRICKS_EN, pool = bank.filter(t => lvl >= t.lv[0] && lvl <= t.lv[1]);
  if(!pool.length) return null;
  const used = (G && G.mode === mode && G.tkUsed) || new Set(), seen = new Set(trickSeen[lang] || []);
  let fresh = pool.filter(t => !seen.has(t.id) && !used.has(t.id));
  if(!fresh.length){ const ids = new Set(pool.map(t => t.id)); trickSeen[lang] = (trickSeen[lang] || []).filter(id => !ids.has(id) || used.has(id)); fresh = pool.filter(t => !used.has(t.id)); }
  if(!fresh.length) fresh = pool;
  for(let k = 0; k < 40; k++){
    const t = pick(fresh), it = t.mk(trickR(lang));
    if(!it || String(it.a) === String(it.t)) continue;
    const ch = trickChoices(it, L.choices); if(ch.length < 3) continue;
    const bold = x => UI.esc(x).replace(/[0-9][0-9,]*/g, m => '<b>' + m + '</b>');
    return {trick: true, id: t.id, lang, mode, op: 'add', a: 0, b: 0, ans: 0, ask: 0, missing: '', wordAns: true, wchoices: ch, choices: ch.map(c => c.w),
      right: String(it.a), trapW: String(it.t), trapLine: it.tl, why: it.w, word: it.q, storyHtml: bold(it.q), vis: null,
      key: 'tk' + t.id + '-' + ((it.q.match(/[0-9]+/g) || []).join('_') || '0')};
  }
  return null;
}
GameParts.loaded('MathQuest_words', 's4a');
