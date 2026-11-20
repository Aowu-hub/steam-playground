
/* 🎬 Cover_avatarealm — 📏 b6a: the "avatarealm" cover block, moved word for word out of GameCovers.html (🧱 Baseline chat, 2026-11-20).
   It runs after GameCovers on GameCovers._K (the kit's helpers) and keeps its own Z (the cover logo's spot, 🏷️ 24j-e):
   the kit hands it over before every still / live / spots call, away() measures against it. */
(function(K){
  'use strict';
  if(!K) return;
  const {clamp, lerp, rng, hx, mix, shade, poly, sparkle, cloud, persp, pick3, root} = K;
  let Z = null;
  const away = (x, y, w, h, W, H, opt) => K.awayIn(Z, x, y, w, h, W, H, opt);
  const add = (id, def) => K.add(id, def, z => { Z = z; });
  // 🎬 COVER avatarealm START — 🏰⚔️ AvataRealm (🏰⚔️ AvataRealm chat, ar-r1c): cover B — your town's island left, the rival's right, a rope bridge for the
  // 🏆 champions, ▶ ⏩ 📂 centred under the logo (btns: 'centre'). The page bakes both showcase towns from IsoKit + IsoProps BEFORE it opens the cover and
  // hands them over as window.AR_COVER = {still, live, spots}; this block only passes them on (+ a sky fallback) so GameCovers stays small.
  add('avatarealm', {
    still(g, W, H, o){ const A = root.AR_COVER; if(A && A.still) return A.still(g, W, H, o);
      const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#6FC0FF'); sky.addColorStop(0.6, '#CDEBFF'); sky.addColorStop(1, '#FFE3B8'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
      cloud(g, W * 0.12, H * 0.25, Math.max(0.6, W / 1100), 0.9); cloud(g, W * 0.78, H * 0.18, Math.max(0.7, W / 900), 0.9); },
    live(g, W, H, t, o){ const A = root.AR_COVER; if(A && A.live) A.live(g, W, H, t, o); },
    spots(W, H){ const A = root.AR_COVER; if(A && A.spots) return A.spots(W, H); const k = clamp(H / 1000, 0.4, 0.8);
      return [{x: W * 0.5, y: H * 0.8, k}, {x: W * 0.42, y: H * 0.84, k: k * 0.95, from: -1}, {x: W * 0.58, y: H * 0.84, k: k * 0.95, from: 1, dir: -1}]; }
  });
  // 🎬 COVER avatarealm END
  K.loaded('avatarealm', 'b6a');
})(window.GameCovers && window.GameCovers._K);
