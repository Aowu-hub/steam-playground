
const TableSkins = (() => {
  // a = near half · b = far half · side = the table's edge band · line = the white edge line · pat = the pattern painted on top
  const SKINS = [
    {k: 'classic', name: 'Classic blue', a: '#2F7BEA', b: '#1E66D0', side: '#1B2A55', line: '#FFFFFF', net: '#DDE6F5', legs: '#2B2F3A', pat: ''},
    {k: 'wood', name: 'Wood', a: '#C88A4A', b: '#B97A3C', side: '#7A4A1E', line: '#FFF3D6', net: '#F4E3C2', legs: '#5A3416', pat: 'grain'},
    {k: 'chalk', name: 'Chalkboard', a: '#2E5A45', b: '#28513E', side: '#4E3018', line: '#F4F4EC', net: '#E8E8DA', legs: '#3A2410', pat: 'chalk'},
    {k: 'candy', name: 'Candy', a: '#FF8FC8', b: '#FF78B6', side: '#C2457F', line: '#FFFFFF', net: '#FFE3F2', legs: '#B33A73', pat: 'dots'},
    {k: 'marble', name: 'Marble', a: '#EEEAE3', b: '#E2DDD4', side: '#A8A196', line: '#C9A13B', net: '#F6F2EA', legs: '#8E877C', pat: 'veins'},
    {k: 'ice', name: 'Ice', a: '#BFEFFF', b: '#A6E2F8', side: '#5FA9C9', line: '#FFFFFF', net: '#E9FBFF', legs: '#4A8CAB', pat: 'frost'},
    {k: 'lava', name: 'Lava', a: '#43201A', b: '#3A1A14', side: '#1E0C08', line: '#FF8A1F', net: '#FFB36B', legs: '#1A0A06', pat: 'cracks'},
    {k: 'neon', name: 'Neon grid', a: '#1C1046', b: '#170D3C', side: '#0B0620', line: '#3CF2FF', net: '#FF4FD8', legs: '#0B0620', pat: 'grid'},
    {k: 'gold', name: 'Gold', a: '#F2C94C', b: '#E3B53A', side: '#9C7416', line: '#FFF8DC', net: '#FFF1B8', legs: '#7A5A10', pat: 'shine'},
    {k: 'galaxy', name: 'Galaxy', a: '#2A1E66', b: '#211756', side: '#0E0A2B', line: '#E9D8FF', net: '#C9B6FF', legs: '#0E0A2B', pat: 'stars'},
    {k: 'rainbow', name: 'Rainbow', a: '#FF5E5E', b: '#5EB0FF', side: '#4A3A8A', line: '#FFFFFF', net: '#FFFFFF', legs: '#3A2E6E', pat: 'rainbow'}
  ];
  const NAMES = SKINS.slice(1).map(s => s.name);   // = the Collection steps (Classic is free)
  const ART_KINDS = ['board', 'stand', 'sign', 'frame'];
  const WOODY = /wood|oak|pine|maple|walnut|cherry|teak|birch|bamboo|ebony|mahogany|cedar|ash|beech/i, METAL = /steel|iron|copper|brass|bronze|gold|silver|alu|tin|zinc|titan|chrome|metal/i, STONE = /granite|marble|jade|stone|slate|crystal|ruby|sapphire/i;
  function artList(kinds){ let L = []; try{ L = JSON.parse(localStorage.getItem('sp_artskins') || '{}').list || []; }catch(e){} return L.filter(a => a && a.id && /^[a-z0-9]+$/i.test(a.id) && (!kinds || kinds.indexOf(a.k) >= 0)).slice(0, 24); }
  function hex(h, f){ h = /^#[0-9a-f]{6}$/i.test(h || '') ? h : '#C08A4E'; const n = parseInt(h.slice(1), 16), m = c => Math.max(0, Math.min(255, Math.round(f > 0 ? c + (255 - c) * f : c * (1 + f)))); return '#' + ((1 << 24) + (m(n >> 16) << 16) + (m((n >> 8) & 255) << 8) + m(n & 255)).toString(16).slice(1); }
  function light(h){ h = /^#[0-9a-f]{6}$/i.test(h || '') ? h : '#888888'; const n = parseInt(h.slice(1), 16); return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) > 150; }
  function craftLink(){ const base = typeof WEBAPP_URL !== 'undefined' ? WEBAPP_URL : '', who = typeof CURRENT_PLAYER !== 'undefined' && CURRENT_PLAYER ? '&player=' + encodeURIComponent(CURRENT_PLAYER) : ''; const u = base + '?page=artifactory&mode=planer' + who; if(window.UI && UI.go) UI.go(u, 'craft', 'Opening Artifactory'); else location.href = u; }
  function artOf(id){ return typeof id === 'string' && id.indexOf('art:') === 0 ? artList(ART_KINDS).find(a => a.id === id.slice(4)) : null; }
  // id = 'classic' · a SKINS key · a step number (Collection) · 'art:<id>'
  function look(id){
    if(typeof id === 'number') return SKINS[id + 1] || SKINS[0];
    const a = artOf(id);
    if(a){ const m = a.m || '', c = a.col || '#C08A4E', pat = WOODY.test(m) ? 'grain' : METAL.test(m) ? 'shine' : STONE.test(m) ? 'veins' : a.c2 ? 'dots' : '';
      return {k: id, name: (a.n || 'Crafted table').replace(/^✨ /, ''), a: c, b: hex(c, -0.08), side: hex(c, -0.45), line: light(c) ? '#3A2A1A' : '#FFFFFF', net: hex(c, 0.6), legs: hex(c, -0.6), pat, c2: a.c2 || '', art: true, by: a.by || ''}; }
    return SKINS.find(s => s.k === id) || SKINS[0];
  }
  function nameOf(id){ return look(id).name; }
  // what this player may pick: Classic + the first `n` looks (server count) + everything crafted in Artifactory (the family shares crafts)
  function owned(n){ return ['classic'].concat(SKINS.slice(1, 1 + Math.max(0, Math.min(NAMES.length, n | 0))).map(s => s.k)).concat(artList(ART_KINDS).map(a => 'art:' + a.id)); }
  function key(name){ return 'sp_tableskin:' + (name || ''); }
  function get(name, n){ let v = 'classic'; try{ v = localStorage.getItem(key(name)) || 'classic'; }catch(e){} return n == null || owned(n).indexOf(v) >= 0 ? v : 'classic'; }
  function set(name, id){ try{ localStorage.setItem(key(name), id || 'classic'); }catch(e){} }
  // a tiny stable random (patterns must not flicker frame to frame)
  function rnd(seed){ let s = seed >>> 0 || 7; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
  /* paintHalf(g, pts, L, half, t): fill one half of the table top (pts = the projected outline) + its pattern.
     half 0 = near / left, 1 = far / right. Patterns are drawn in screen space inside the outline's box (cheap: ≤ 24 strokes). */
  function paintHalf(g, pts, L, half, t){
    L = L && L.a ? L : look(L);
    g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath();
    let fill = half ? L.b : L.a;
    if(L.pat === 'rainbow'){ let x0 = 1e9, x1 = -1e9; pts.forEach(p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); }); const gr = g.createLinearGradient(x0, 0, x1, 0); (half ? ['#4CD964', '#5EB0FF', '#9B7BFF'] : ['#FF5E5E', '#FF9F1C', '#FFD23F']).forEach((c, i) => gr.addColorStop(i / 2, c)); fill = gr; }
    g.fillStyle = fill; g.fill();
    if(!L.pat || L.pat === 'rainbow') return;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; pts.forEach(p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    const w = x1 - x0, h = y1 - y0; if(w < 4 || h < 2) return;
    const r = rnd(half * 977 + 13), u = Math.max(1, Math.min(w, h * 4) / 40);
    g.save(); g.clip(); t = t || 0;
    if(L.pat === 'grain'){ g.strokeStyle = 'rgba(90,50,20,0.28)'; g.lineWidth = Math.max(1, u * 0.6); for(let i = 0; i < 9; i++){ const y = y0 + h * (i + 0.5) / 9; g.beginPath(); g.moveTo(x0, y); for(let x = 0; x <= 8; x++) g.lineTo(x0 + w * x / 8, y + Math.sin(x * 1.3 + i * 2.1) * h * 0.03); g.stroke(); } }
    else if(L.pat === 'chalk'){ g.strokeStyle = 'rgba(255,255,255,0.13)'; g.lineWidth = Math.max(1, u * 0.8); for(let i = 0; i < 7; i++){ const x = x0 + r() * w, y = y0 + r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * w * 0.4, y + (r() - 0.5) * h * 0.5); g.stroke(); } }
    else if(L.pat === 'dots'){ g.fillStyle = L.c2 || 'rgba(255,255,255,0.55)'; for(let i = 0; i < 22; i++){ g.beginPath(); g.arc(x0 + r() * w, y0 + r() * h, Math.max(1.2, u * 1.1), 0, 7); g.fill(); } }
    else if(L.pat === 'veins'){ g.strokeStyle = L.art ? 'rgba(0,0,0,0.18)' : 'rgba(120,110,100,0.35)'; g.lineWidth = Math.max(1, u * 0.5); for(let i = 0; i < 4; i++){ let x = x0 + r() * w, y = y0; g.beginPath(); g.moveTo(x, y); for(let k = 0; k < 6; k++){ x += (r() - 0.4) * w * 0.12; y += h / 6; g.lineTo(x, y); } g.stroke(); } }
    else if(L.pat === 'frost'){ g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = Math.max(1, u * 0.5); for(let i = 0; i < 6; i++){ const x = x0 + r() * w, y = y0 + r() * h, s = Math.max(3, u * 3); for(let k = 0; k < 3; k++){ const a = k * Math.PI / 3; g.beginPath(); g.moveTo(x - Math.cos(a) * s, y - Math.sin(a) * s * 0.5); g.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s * 0.5); g.stroke(); } } }
    else if(L.pat === 'cracks'){ g.strokeStyle = 'rgba(255,' + Math.round(120 + 40 * Math.sin(t * 3)) + ',30,0.85)'; g.lineWidth = Math.max(1.2, u * 0.8); for(let i = 0; i < 5; i++){ let x = x0 + r() * w, y = y0 + r() * h; g.beginPath(); g.moveTo(x, y); for(let k = 0; k < 4; k++){ x += (r() - 0.5) * w * 0.25; y += (r() - 0.5) * h * 0.5; g.lineTo(x, y); } g.stroke(); } }
    else if(L.pat === 'grid'){ g.strokeStyle = 'rgba(60,242,255,' + (0.3 + 0.12 * Math.sin(t * 2)) + ')'; g.lineWidth = Math.max(1, u * 0.45); for(let i = 1; i < 8; i++){ const x = x0 + w * i / 8; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); } for(let i = 1; i < 4; i++){ const y = y0 + h * i / 4; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); } }
    else if(L.pat === 'shine'){ const s = (t * 0.25 + half * 0.5) % 1.6 - 0.3, gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(Math.max(0, Math.min(1, s)), 'rgba(255,255,255,0)'); gr.addColorStop(Math.max(0, Math.min(1, s + 0.12)), 'rgba(255,255,255,0.45)'); gr.addColorStop(Math.max(0, Math.min(1, s + 0.24)), 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x0, y0, w, h); }
    else if(L.pat === 'stars'){ for(let i = 0; i < 18; i++){ const x = x0 + r() * w, y = y0 + r() * h, tw = 0.45 + 0.45 * Math.sin(t * 3 + i * 1.7); g.fillStyle = 'rgba(255,255,255,' + tw.toFixed(2) + ')'; g.beginPath(); g.arc(x, y, Math.max(0.8, u * (i % 4 ? 0.5 : 1)), 0, 7); g.fill(); } g.fillStyle = 'rgba(190,120,255,0.18)'; g.beginPath(); g.ellipse(x0 + w * 0.5, y0 + h * 0.5, w * 0.3, h * 0.25, 0.3, 0, 7); g.fill(); }
    g.restore();
  }
  // a small table picture (Collection, pickers): two halves, the edge band, the net, two legs
  function preview(c, v, t){
    const g = c.getContext('2d'), W = c.width, H = c.height, L = look(v == null ? 'classic' : v);
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    const x0 = W * 0.1, x1 = W * 0.9, yN = H * 0.66, yF = H * 0.4, sk = W * 0.1, mid = (x0 + x1) / 2;
    const q = (x, near) => [x + (near ? 0 : sk), near ? yN : yF];
    g.strokeStyle = L.legs; g.lineWidth = Math.max(2, W * 0.035); [[x0 + W * 0.08, yN], [x1 - W * 0.08, yN]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + H * 0.22); g.stroke(); });
    g.fillStyle = L.side; g.fillRect(x0, yN, x1 - x0, Math.max(3, H * 0.06));
    paintHalf(g, [q(x0, true), q(mid, true), q(mid, false), q(x0, false)], L, 0, t || 1);
    paintHalf(g, [q(mid, true), q(x1, true), q(x1, false), q(mid, false)], L, 1, t || 1);
    g.strokeStyle = L.line; g.lineWidth = Math.max(1.5, W * 0.02); g.beginPath(); [q(x0, true), q(x1, true), q(x1, false), q(x0, false)].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.stroke();
    const nb = q(mid, true), nf = q(mid, false), nh = H * 0.12;
    g.fillStyle = 'rgba(15,20,40,0.5)'; g.beginPath(); g.moveTo(nb[0], nb[1]); g.lineTo(nf[0], nf[1]); g.lineTo(nf[0], nf[1] - nh); g.lineTo(nb[0], nb[1] - nh); g.closePath(); g.fill();
    g.strokeStyle = L.net; g.lineWidth = Math.max(1.5, W * 0.02); g.beginPath(); g.moveTo(nb[0], nb[1] - nh); g.lineTo(nf[0], nf[1] - nh); g.stroke();
  }
  const URL = {};
  function url(id, px){ px = px || 64; const k = id + '|' + px; if(URL[k]) return URL[k]; if(typeof document === 'undefined') return ''; const c = document.createElement('canvas'); c.width = c.height = px; preview(c, id); try{ return (URL[k] = c.toDataURL()); }catch(e){ return ''; } }
  return {SKINS, NAMES, count: NAMES.length, ART_KINDS, artList: () => artList(ART_KINDS), craftLink, look, nameOf, owned, get, set, paintHalf, preview, url, line: 'tableskin'};
})();
if(typeof window !== 'undefined') window.TableSkins = TableSkins;   // Collection checks window.TableSkins
