
/* 📏 s3: 🎛️ GAME BAR · 🧭 navBar / navScreen — moved from UiKit.html (the header comment there explains the API; the 🧭 back
   trail + 🔘 .sp-btn button styles stay in UiKit core, reached through UI._trail) */
(function(){
  if(!window.UI || UI.gameBar) return;
  const T = UI._trail || {}, {back, backLabel, backPage, base, gameroomUrl, goHome, here, pageName, player, sq} = T;   // 📏 s3: the 🧭 back trail lives in UiKit core
  // ---------- CSS ----------
  let cssDone = false;
  function addCss(){
    if(cssDone) return; cssDone = true;
    const F = 'var(--font-display,"Fredoka",sans-serif)';
    const css =
      ''   /* 📏 s3: 🔘 .sp-btn buttons → UiKit core (#ui-spbtn-css) */
      /* 🧭 top nav (start pages) */
      + '.sp-topnav{position:fixed;top:calc(10px + env(safe-area-inset-top));left:calc(10px + env(safe-area-inset-left));z-index:300;display:flex;gap:6px;align-items:center;}'
      + '.sp-topnav.hidden{display:none !important;}'
      + '.sp-topnav > .top-btn{position:static !important;top:auto !important;left:auto !important;margin:0 !important;}'
      + '.sp-topnav > .sp-home{min-width:40px;justify-content:center;}'
      /* 🎛️ game bar — design (p1a-2, Aowu 2026-11-13 "polish the looks"): buttons in joined toolbars (.gb-seg), the numbers in one
         dark SCOREBOARD tinted with the game's colour (.gb-board), drawn icons for 🎚️ Levels (stairs) and ⏸ (bars) */
      + '.gb{--gb-a:var(--game-a,var(--terracotta,#E8734A));--gb-b:var(--game-b,var(--mustard,#F2B33D));--gb-ink:#2B2440;--gb-h:40px;display:flex;flex-wrap:nowrap;align-items:center;gap:8px;box-sizing:border-box;width:100%;min-width:0;'
      + 'padding:calc(7px + env(safe-area-inset-top)) max(8px, env(safe-area-inset-right)) 6px max(8px, env(safe-area-inset-left));position:relative;z-index:6;flex:none;font-family:' + F + ';contain:inline-size;}'   /* p1b: the bar never widens its parent (Code the Robot grid) */
      + '.gb-g{display:flex;align-items:center;gap:6px;flex:none;min-width:0;}'
      /* joined toolbars */
      + '.gb-seg{gap:2px;padding:3px;border-radius:17px;background:rgba(255,255,255,.96);box-shadow:0 3px 0 color-mix(in srgb,var(--gb-a) 40%,rgba(0,0,0,.28)),0 6px 14px rgba(0,0,0,.10);}'
      + '.gb-b{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:5px;box-sizing:border-box;min-width:var(--gb-h);min-height:var(--gb-h);padding:0 12px;border:0;border-radius:13px;background:transparent;color:var(--gb-ink);'
      + 'font-family:' + F + ';font-weight:700;font-size:.95rem;cursor:pointer;white-space:nowrap;transform:translateZ(0);-webkit-tap-highlight-color:transparent;transition:background .12s;}'
      + '.gb-b:hover{background:color-mix(in srgb,var(--gb-a) 12%,transparent);} .gb-b:active{background:color-mix(in srgb,var(--gb-a) 24%,transparent);transform:translateZ(0) scale(.93);}'
      + '.gb-b:focus-visible{outline:3px solid color-mix(in srgb,var(--gb-a) 70%,#fff);outline-offset:1px;}'
      + '.gb-seg > .gb-b + .gb-b::before{content:"";position:absolute;left:-2px;top:22%;bottom:22%;width:1px;background:rgba(43,36,64,.13);}'
      + '.gb-b.gb-i{padding:0;width:var(--gb-h);font-size:1.12rem;}'
      + '.gb-arr{color:var(--gb-a);font-size:1.05rem;line-height:1;filter:saturate(1.2);}'
      + '.gb-stairs{display:inline-flex;align-items:flex-end;gap:2px;height:17px;flex:none;} .gb-stairs i{display:block;width:5px;border-radius:2px;background:linear-gradient(180deg,var(--gb-b),var(--gb-a));}'
      + '.gb-stairs i:nth-child(1){height:7px;} .gb-stairs i:nth-child(2){height:12px;} .gb-stairs i:nth-child(3){height:17px;}'
      + '.gb-pzi{display:inline-flex;gap:4px;} .gb-pzi i{display:block;width:5px;height:16px;border-radius:2px;background:var(--gb-ink);}'
      + '.gb-b.hidden,.gb-s.hidden,.gb-pls.hidden{display:none !important;}'
      /* title: icon tile · name · level chip */
      + '.gb-title{flex:0 1 auto;font-weight:700;font-size:1.05rem;white-space:nowrap;overflow:hidden;color:inherit;gap:7px;}'
      + '.gb-ic{display:flex;align-items:center;justify-content:center;flex:none;width:36px;height:36px;border-radius:12px;font-size:1.35rem;line-height:1;background:rgba(255,255,255,.8);box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--gb-a) 30%,transparent),0 2px 0 rgba(0,0,0,.12);}'
      + '.gb-nm{overflow:hidden;text-overflow:ellipsis;min-width:0;letter-spacing:.2px;}'
      + '.gb-lvg{flex:none;}'
      + '.gb-lv{flex:none;padding:5px 12px;border-radius:999px;background:linear-gradient(135deg,var(--gb-a),var(--gb-b));color:#fff;font-size:.84rem;font-weight:700;text-shadow:0 1px 1px rgba(0,0,0,.3);white-space:nowrap;'
      + 'box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 2px 0 rgba(0,0,0,.18);}'
      + '.gb-lv.hc{background:linear-gradient(135deg,#B3122B,#3A0A10);} .gb-lv.tg{background:linear-gradient(135deg,#2E7D5B,#2EC4B6);} .gb-lv:empty{display:none;}'
      /* scoreboard */
      + '.gb-stats{flex:1 1 auto;justify-content:center;}'
      + '.gb-board{display:inline-flex;align-items:center;gap:3px;padding:3px;border-radius:18px;color:#fff;'
      + 'background:linear-gradient(180deg,color-mix(in srgb,var(--gb-a) 30%,#2C2244),color-mix(in srgb,var(--gb-a) 16%,#19132B));'
      + 'box-shadow:0 3px 0 rgba(0,0,0,.30),0 6px 16px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.16);}'
      + '.gb-board:empty{display:none;}'
      + '.gb-s{display:inline-flex;align-items:center;gap:5px;box-sizing:border-box;min-height:calc(var(--gb-h) - 2px);padding:2px 11px;border-radius:14px;background:rgba(255,255,255,.08);color:#fff;font-weight:700;font-size:.92rem;'
      + 'font-variant-numeric:tabular-nums;white-space:nowrap;transform:translateZ(0);}'
      + '.gb-s b{font-weight:700;}'
      + '.gb-score,.gb-pl{--glow:color-mix(in srgb,var(--gb-b) 62%,#fff);}'
      + '.gb-score b,.gb-pl b{color:var(--glow);text-shadow:0 0 12px color-mix(in srgb,var(--gb-b) 55%,transparent),0 2px 0 rgba(0,0,0,.35);}'
      + '.gb-score{order:1;padding:2px 13px 2px 9px;background:rgba(255,255,255,.13);} .gb-score i{font-style:normal;font-size:1.2rem;} .gb-score b{font-size:1.75rem;line-height:1;min-width:1.6em;text-align:center;font-variant-numeric:tabular-nums;}'
      + '.gb-pls{order:2;display:flex;gap:3px;align-items:center;}'
      + '.gb-pl{padding:2px 11px 2px 3px;}'
      + '.gb-pl .av{width:32px;height:34px;border-radius:10px;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-size:1.45rem;line-height:1;flex:none;overflow:hidden;} .gb-pl canvas{width:30px;height:34px;display:block;}'
      + '.gb-pl .nm{font-size:.78rem;max-width:6.5em;overflow:hidden;text-overflow:ellipsis;color:rgba(255,255,255,.78);}'
      + '.gb-pl b{font-size:1.65rem;line-height:1;min-width:1.4em;text-align:center;}'
      /* p1a-3 (Aowu: "a little distinctive between player score"): every player has a seat colour (--pc) — tint, edge stripe,
         avatar ring, score digits; the player whose turn it is glows gold + a bit bigger, the others dim; "VS" between 2 players */
      + '.gb-pl{--pc:#4DA3FF;position:relative;background:linear-gradient(180deg,color-mix(in srgb,var(--pc) 44%,transparent),color-mix(in srgb,var(--pc) 20%,transparent));box-shadow:inset 4px 0 0 var(--pc);transition:opacity .2s,filter .2s;}'
      + '.gb-pl .av{background:color-mix(in srgb,var(--pc) 28%,rgba(255,255,255,.08));box-shadow:inset 0 0 0 2px var(--pc);}'
      + '.gb-pl .nm{color:color-mix(in srgb,var(--pc) 35%,#fff);}'
      + '.gb-pl b{color:color-mix(in srgb,var(--pc) 42%,#fff);text-shadow:0 0 12px color-mix(in srgb,var(--pc) 65%,transparent),0 2px 0 rgba(0,0,0,.35);}'
      + '.gb-pl.on{box-shadow:inset 4px 0 0 var(--pc),inset 0 0 0 2px #FFC845,0 0 16px rgba(255,200,69,.45);transform:translateZ(0) scale(1.05);z-index:1;}'
      + '.gb-pls.has-on .gb-pl:not(.on){opacity:.78;filter:saturate(.8);}'
      + '.gb-pls.two{gap:9px;} .gb-pls.two .gb-pl + .gb-pl::before{content:"VS";position:absolute;left:-12px;top:50%;margin-top:-9px;width:18px;height:18px;border-radius:50%;background:#fff;color:#2B2440;'
      + 'font-family:' + F + ';font-weight:700;font-size:.52rem;line-height:18px;text-align:center;letter-spacing:-.3px;box-shadow:0 1px 3px rgba(0,0,0,.4);z-index:2;pointer-events:none;}'
      + '.gb-miss{order:3;} .gb-miss b{font-size:1.3rem;line-height:1;} .gb-miss.bad{background:#E5484D;box-shadow:inset 0 -2px 0 rgba(0,0,0,.2);}'
      + '.gb-s{position:relative;} .gb-bdg{position:absolute;right:1px;bottom:-9px;background:#FF4D6D;color:#fff;border-radius:9px;padding:0 5px;font-style:normal;font-weight:700;font-size:.64rem;line-height:1.45;box-shadow:0 2px 0 rgba(0,0,0,.25);pointer-events:none;white-space:nowrap;z-index:2;} '
      + '.gb-nano .gb-score b{font-size:1.3rem;} .gb-nano .gb-score{padding:0 9px 0 7px;} .gb-nano .gb-score i{font-size:1rem;} .gb-nano .gb-s{padding:0 7px;gap:3px;} .gb-nano .gb-lvg{flex:0 1 auto;min-width:0;} .gb-nano .gb-lv{max-width:7em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;} .gb-nano .gb-board{gap:3px;} '
      + '.gb-pli{display:inline-block;width:0;height:0;border-left:13px solid var(--gb-ink);border-top:8px solid transparent;border-bottom:8px solid transparent;margin-left:3px;} .gb-b.gb-on{background:#FFE7A3;} '
      + '.gb-ad{white-space:nowrap;} .gb-s.gb-ad.low,.gb-s.gb-ad.hot,.gb-s.gb-ad.warn,.gb-s.gb-ad.on{background:#FFB020;color:#3B2400;} '
      + '.gb-cu{display:flex;align-items:center;min-width:0;flex:1 1 auto;} .gb-cu.hidden{display:none;} '
      + '.gb-meter{order:7;gap:5px;} .gb-mt{display:inline-block;width:56px;height:10px;border-radius:6px;background:rgba(255,255,255,.22);overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.35);} .gb-mt u{display:block;height:100%;width:0;background:linear-gradient(90deg,#3DDC97,#FFD23F);border-radius:6px;transition:width .3s;} .gb-meter.full .gb-mt u{background:linear-gradient(90deg,#FFD23F,#FF9F1C);} .gb-tiny .gb-mt{width:40px;} .gb-nano .gb-mt{width:28px;} .gb-nano .gb-time{min-width:3.4em;} '
      + '.gb-lives{order:4;} .gb-time{order:5;min-width:4.7em;justify-content:center;} .gb-round{order:6;} .gb-cnt{order:7;} .gb-left{order:8;} .gb-s.warn{background:#FFB020;color:#3B2400;}'
      + '.gb-b.gb-k{padding:0 10px;font-size:1.02rem;} .gb-b:disabled{opacity:.38;cursor:default;transform:translateZ(0);} .gb-k.done-btn{background:linear-gradient(135deg,#2EC4B6,#4CB963);color:#fff;}'
      + '.gb-lv.ch{background:linear-gradient(135deg,#7A5CFA,#C04BFF);} .gb-tight .gb-k .gt{display:none;}'
      + '.gb-pop{animation:gbpop .5s cubic-bezier(.2,1.6,.4,1);} @keyframes gbpop{0%{transform:translateZ(0) scale(1);}35%{transform:translateZ(0) scale(1.3);}100%{transform:translateZ(0) scale(1);}}'
      + '.gb-shake{animation:gbshake .5s;} @keyframes gbshake{0%,100%{transform:translateZ(0);}20%{transform:translateX(-5px) rotate(-5deg);}40%{transform:translateX(5px) rotate(5deg);}60%{transform:translateX(-4px);}80%{transform:translateX(3px);}}'
      /* fit stages */
      + '.gb-br{display:none;flex:0 0 100%;height:0;order:8;}'
      + '.gb-two{flex-wrap:wrap;row-gap:6px;} .gb-two .gb-br{display:block;} .gb-two .gb-stats{order:10;flex:1 1 auto;} .gb-two .gb-tools{order:5;margin-left:auto;}'
      + '.gb-tools{margin-left:auto;}'
      + '.gb-slim .gb-nm,.gb-slim .gb-x,.gb-slim .gb-pl .nm{display:none !important;}'
      + '.gb-tight .gb-lvg{order:9;} .gb-tight .gb-nm,.gb-tight .gb-x{display:none !important;} .gb-tight .gb-b{padding:0 9px;} .gb-tight .gb-b.gb-i{padding:0;}'
      + '.gb-tiny .gb-pl .nm,.gb-tiny .gb-title{display:none !important;} .gb-micro .gb-lvb .gt{display:none !important;} .gb-micro .gb-back .gt{max-width:5.5em;overflow:hidden;text-overflow:ellipsis;}'
      /* short screens (old phones, phone on its side): a lower bar so the board keeps its room */
      + '.gb.gb-short{--gb-h:36px;padding-top:calc(4px + env(safe-area-inset-top));padding-bottom:4px;gap:6px;} .gb-short.gb-two{row-gap:4px;} .gb-short .gb-ic{width:32px;height:32px;font-size:1.2rem;}'
      + '.gb.gb-xs{--gb-h:36px;padding-top:calc(2px + env(safe-area-inset-top));padding-bottom:2px;gap:5px;} .gb-xs.gb-two{row-gap:2px;} .gb-xs .gb-seg{padding:1px;border-radius:14px;} .gb-xs .gb-board{padding:2px;border-radius:15px;} .gb-xs .gb-ic{width:28px;height:28px;font-size:1.05rem;}'
      + '.gb-xs.gb-two{row-gap:2px;padding-bottom:2px;} .gb-xs.gb-two .gb-s{min-height:26px;padding:0 8px;} .gb-xs.gb-two .gb-pl .av{height:24px;width:24px;} .gb-xs.gb-two .gb-pl canvas{height:24px;width:21px;} .gb-xs.gb-two .gb-score b,.gb-xs.gb-two .gb-pl b{font-size:1.25rem;} .gb-xs.gb-two .gb-lv{padding:2px 9px;}'
      + '.gb-xs .gb-s{min-height:30px;} .gb-xs .gb-score b{font-size:1.35rem;} .gb-xs .gb-pl b{font-size:1.3rem;} .gb-xs .gb-pl .av{height:28px;width:28px;} .gb-xs .gb-pl canvas{height:28px;width:25px;} .gb-xs .gb-lv{padding:3px 10px;font-size:.78rem;}'
      + '.gb-short .gb-score b{font-size:1.5rem;} .gb-short .gb-pl b{font-size:1.45rem;} .gb-short .gb-pl .av{height:30px;} .gb-short .gb-pl canvas{height:30px;width:27px;} .gb-short .gb-s{padding:1px 9px;}'
      + '.gb-menu{position:absolute;right:8px;top:calc(100% - 2px);z-index:60;background:#fff;color:#2B2440;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.28);padding:6px;display:flex;flex-direction:column;gap:4px;min-width:190px;}'
      + '.gb-menu.hidden{display:none;}'
      + '.gb-fx{display:none;font-size:.7rem;opacity:.7;margin-left:1px;} .gb-fold .gb-fx{display:inline;} .gb-fold .gb-back .gt,.gb-fold .gb-lvb,.gb-fold .gb-home,.gb-fold .gb-title,.gb-fold .gb-lvg,.gb-fold .gb-x{display:none !important;} .gb-fold .gb-back{padding:0 9px;} .gb.gb-fold{gap:5px;padding-left:6px;padding-right:6px;} .gb.gb-fold{--gb-h:38px;} .gb-fold .gb-pl{padding:2px 6px 2px 2px;} .gb-fold .gb-s{padding-left:6px;padding-right:6px;} .gb-fold .gb-pls,.gb-fold .gb-board{gap:2px;} .gb-fslack .gb-stats{padding-right:18px;}'
      /* 📱 24g-f (Aowu 2026-11-18 12:42): on every phone the way-out group = ONE round ◀ icon top-left; tap = a pop-out of the ways back */
      + '.gb-fold .gb-nav{border-radius:999px;padding:3px;} .gb-fold .gb-back{width:var(--gb-h);min-width:var(--gb-h);padding:0;border-radius:50%;}'
      + '.gb-fold .gb-back .gb-arr{font-size:1.15rem;margin-left:-2px;} .gb-fold .gb-fx{position:absolute;right:-3px;bottom:-3px;width:15px;height:15px;border-radius:50%;background:var(--gb-a);color:#fff;font-size:.5rem;line-height:15px;text-align:center;opacity:1;margin:0;box-shadow:0 1px 2px rgba(0,0,0,.3);}'
      + '.gb-fold .gb-back.gb-on{background:linear-gradient(135deg,var(--gb-a),var(--gb-b));} .gb-fold .gb-back.gb-on .gb-arr{color:#fff;} .gb-fold .gb-back.gb-on .gb-fx{transform:rotate(180deg);background:#fff;color:var(--gb-a);}'
      + '.gb-fold .gb-room{display:none !important;} .gb-b.gb-room{font-size:1.05rem;}'
      + '.gb-fmenu:not(.hidden){animation:gbfpop .16s ease-out;transform-origin:18px 0;} @keyframes gbfpop{from{opacity:0;transform:translateY(-6px) scale(.9);}}'
      + '.gb-haslv .gb-lv{background:linear-gradient(135deg,var(--lv-a,var(--gb-a)),var(--lv-b,var(--gb-b)));}'   /* 🎨 24g-f: level chip + ⭐ score card in the level's colour */
      + '.gb-haslv .gb-score{background:linear-gradient(135deg,var(--lv-a,var(--gb-a)),var(--lv-b,var(--gb-b)));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.28),0 2px 0 rgba(0,0,0,.25);} .gb-haslv .gb-score b{color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.28),0 0 10px rgba(255,255,255,.25);}'
      + '.gb-haslv:not(.gb-sc) .gb-board{box-shadow:inset 0 0 0 2.5px var(--lv-a,var(--gb-a)),0 0 0 1px rgba(255,255,255,.35),0 3px 0 rgba(0,0,0,.30),0 6px 16px rgba(0,0,0,.14);}'   /* 🎨 24g-f: no ⭐ card → the scoreboard wears a level-colour ring */
      + '.gb.gb-fopen{z-index:960;}'   /* 📱 24g-f: open list above every game pad / stick (pause card 900 + confirm stay above when they open) */
      + '.gb-tstart{cursor:pointer;border-radius:12px;} .gb-tstart:hover .gb-nm{text-decoration:underline;text-underline-offset:3px;} .gb-tstart:active{transform:scale(.97);}'
      + '.gb.gb-xs.gb-fold{--gb-h:36px;} .gb.gb-short.gb-fold:not(.gb-xs){--gb-h:38px;}'
      + '.gb-fmenu{left:8px;right:auto;} .gb-fhd{padding:4px 10px 2px;font-weight:700;font-size:.82rem;opacity:.75;} .gb-fmenu .gb-fback{background:linear-gradient(135deg,var(--gb-a),var(--gb-b));color:#fff;}'
      + '.gb-menu button{display:flex;align-items:center;gap:10px;min-height:44px;padding:0 12px;border:0;border-radius:12px;background:#F4F1FA;font-family:' + F + ';font-weight:700;font-size:.95rem;color:inherit;cursor:pointer;text-align:left;}'
      + '.gb-menu button .gi{font-size:1.2rem;width:1.5em;text-align:center;}'
      + '.gb-pause{position:fixed;inset:0;z-index:900;background:rgba(20,16,40,.55);display:flex;align-items:center;justify-content:center;padding:16px;}'
      + '.gb-pause-card{background:var(--card,#fff);color:var(--ink,#2B2440);border-radius:22px;padding:18px 18px 16px;width:min(340px,100%);box-sizing:border-box;text-align:center;box-shadow:0 14px 40px rgba(0,0,0,.35);animation:gbpop .35s ease;}'
      + '.gb-pause-card h3{margin:0 0 12px;font-family:' + F + ';font-size:1.5rem;}'
      + '.gb-pause-card .row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}';
    const st = document.createElement('style'); st.id = 'ui-gamebar-css'; st.textContent = css; const sb = document.getElementById('ui-spbtn-css'); if(sb && sb.parentNode) sb.parentNode.insertBefore(st, sb.nextSibling); else document.head.appendChild(st);   /* 📏 s3: right after the 🔘 button sheet = its old cascade place */
  }

  // ---------- 🧭 a page's top button → ◀ Back + 🏠 ----------
  function navBar(btn, o){
    o = o || {}; if(!btn || btn.dataset.spNav) return btn; addCss(); btn.dataset.spNav = '1';
    btn.textContent = backLabel(o.fallback); btn.title = 'Back to where you came from'; btn.setAttribute('data-sound', 'none');   // p1a-2: "◀ Algebros" 
    if(o.onclick !== false) btn.onclick = () => back(o.fallback, o.kind);
    btn._spOuter = btn.onclick; btn._spFallback = o.fallback;
    const box = document.createElement('div'); box.className = 'sp-topnav'; box.id = (btn.id || 'top') + '-nav';
    btn.parentNode.insertBefore(box, btn); box.appendChild(btn);
    if(o.home !== false){
      const h = document.createElement('button'); h.type = 'button'; h.className = btn.className.replace(/\bhidden\b/g, '') + ' sp-home'; h.id = 'home-btn';
      h.textContent = '🏠'; h.title = 'Dashboard'; h.setAttribute('aria-label', 'Dashboard'); h.setAttribute('data-sound', 'none'); h.onclick = goHome; box.appendChild(h);
    }
    const sync = () => box.classList.toggle('hidden', btn.classList.contains('hidden') || btn.style.display === 'none');
    sync(); new MutationObserver(sync).observe(btn, {attributes: true, attributeFilter: ['class', 'style']});
    return btn;
  }

  // p1b: pages with inner screens (Maze 🎨 theme, Checkers 👫 friend…): ONE back per screen — on an inner screen the top button names the
  // page's main screen and goes there ('◀ Maze'), on the main screens it leaves the page (UI.backLabel). Call from showScreen(name).
  function navScreen(btn, name, inner){
    if(!btn) return; if(!btn._spOuter) btn._spOuter = btn.onclick || (() => back());
    const i = inner && inner[name];
    if(i){ btn.textContent = i[0]; btn.onclick = i[1]; btn.title = 'Back'; }
    else { btn.textContent = backLabel(btn._spFallback); btn.onclick = btn._spOuter; btn.title = 'Back to where you came from'; }
  }

  // ---------- 🎛️ the bar ----------
  const fmt = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const SEAT_COLS = ['#4DA3FF', '#FF6B9A', '#3DDC97', '#FFB020'], BOT_COL = '#A78BFA';   // p1a-3: player 1 blue · 2 pink · 3 green · 4 amber · 🤖 violet
  // 📱 24g-f: a phone = a touch screen whose short side is < 600 px (held upright OR sideways); tablets + computers keep the open row
  const GB_ALL = [];
  // 🎨 24g-f: the 6 levels' colours — 🌱 Basic green · 🐣 Junior blue · Intermediate amber · Hard orange · Extreme purple · 💀 Hardcore dark red (unknown names = the game's colours)
  const LV_COLS = [[/hardcore|💀/i, ['#C8193A', '#4A0B14']], [/extreme/i, ['#9B6BFF', '#6A3FE0']], [/intermediate/i, ['#FFB020', '#F07C1E']], [/\bhard\b/i, ['#FF7A45', '#E5484D']],
    [/junior/i, ['#4DA3FF', '#2F6BFF']], [/basic/i, ['#3DDC97', '#1FA971']]];
  const LV_CLS = {hc: ['#C8193A', '#4A0B14'], tg: ['#2E7D5B', '#2EC4B6'], ch: ['#7A5CFA', '#C04BFF']};
  function levelColour(text, cls){ if(cls && LV_CLS[cls]) return LV_CLS[cls]; const t = String(text || ''); for(const [re, c] of LV_COLS) if(re.test(t)) return c; return null; }
  function isPhone(){ if(window.UI_GBPHONE != null) return !!window.UI_GBPHONE;
    let touch = false; try{ touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0; }catch(e){}
    return touch && Math.min(innerWidth, innerHeight) < 600; }
  // 📱 24g-f (Aowu 13:04 "a"): a tap OUTSIDE an open fold only folds it back — the game never gets that tap (no move / drop by accident).
  // ONE capture listener, added when UiKit loads (before any game listener): it closes the fold and eats that touch until the finger lifts (+ its click).
  const GB_EAT = {id: null, until: 0};
  const eatIt = e => { e.stopImmediatePropagation(); if(e.cancelable && e.type !== 'touchstart') e.preventDefault(); };
  document.addEventListener('pointerdown', e => {
    const open = GB_ALL.filter(b => b.isOpen()); if(!open.length) return;
    const inBar = open.some(b => b.el.contains(e.target)); open.forEach(b => { if(!b.el.contains(e.target)) b.fold(); });
    if(inBar) return;   /* a tap on the bar itself (⏸ ❓ …) still works */
    GB_EAT.id = e.pointerId; GB_EAT.until = performance.now() + 5000; eatIt(e);
  }, true);
  ['pointerup', 'pointercancel', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'contextmenu'].forEach(t => document.addEventListener(t, e => {
    if(performance.now() > GB_EAT.until) return;
    if((t === 'pointerup' || t === 'pointercancel') && e.pointerId === GB_EAT.id) GB_EAT.until = performance.now() + 450;   /* finger up → eat only its click / mouse copies now */
    eatIt(e);
  }, {capture: true, passive: false}));
  function gameBar(el, o){
    o = o || {}; addCss();
    if(!el) return null;
    el.classList.add('gb'); el.innerHTML = '';
    const mk = (tag, cls, html) => { const e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; };
    const btn = (cls, html, title, fn, snd) => { const b = mk('button', 'gb-b ' + cls, html); b.type = 'button'; if(title){ b.title = title; b.setAttribute('aria-label', title); } b.setAttribute('data-sound', snd || 'tap');
      b.onclick = e => { e.stopPropagation(); closeMenu(); if(fn) fn(e); }; return b; };
    const paused = () => { try{ o.pause && o.pause.pause && o.pause.pause(); }catch(e){} try{ UISound.moodPause(true, 'bar'); }catch(e){} };   // 🎵 24u-a
    const resumed = () => { try{ o.pause && o.pause.resume && o.pause.resume(); }catch(e){} try{ UISound.moodPause(false, 'bar'); }catch(e){} };
    const playing = () => { try{ return !!(o.playing && o.playing()); }catch(e){ return false; } };
    function leave(then){
      const go = () => { try{ o.onLeave && o.onLeave(); }catch(e){} then(); };
      if(!playing()) return go();
      paused();
      UI.confirm({icon: '◀', title: 'Leave the game?', body: 'This game will not be saved.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(ok) go(); else resumed(); });
    }
    const doBack = () => leave(() => back(o.fallback));
    const doHome = () => leave(goHome);

    // ◀ Back · 🎚️ Levels · 🏠
    const nav = mk('div', 'gb-g gb-seg gb-nav');
    const bBack = btn('gb-back', '<span class="gb-arr">◀</span><span class="gt"></span><span class="gb-fx" aria-hidden="true">▾</span>', 'Back to where you came from', () => el.classList.contains('gb-fold') ? toggleFold() : doBack(), 'none');   // 🔘 gb-1: folded = ◀ opens "where to go"
    bBack.querySelector('.gt').textContent = ' ' + backLabel(o.fallback).slice(2);   // p1a-2: names where it goes — "◀ Gameroom", "◀ Artifactory" …
    nav.appendChild(bBack);
    let bLv = null;
    if(o.levels){ bLv = btn('gb-lvb', '<span class="gb-stairs" aria-hidden="true"><i></i><i></i><i></i></span><span class="gt"> Levels</span>', 'Pick another level', () => o.levels(), 'tap'); nav.appendChild(bLv); }
    const toRoom = here() !== 'gameroom' && backPage(o.fallback) !== 'gameroom';   /* 📱 24g-f (Aowu 12:51): a range of ways back — 🎴 only when ◀ goes somewhere else */
    const doRoom = () => leave(() => UI.go(gameroomUrl(), 'rooms'));
    const doStart = () => leave(() => UI.go(base() + '?page=' + encodeURIComponent(here()) + sq(), UI.KINDS && UI.KINDS[o.game] ? o.game : 'nav'));   /* the game's own start page (cover / modes) */
    let bRoom = null; if(toRoom){ bRoom = btn('gb-i gb-room', '🎴', 'Gameroom', doRoom, 'none'); nav.appendChild(bRoom); }
    const bHome = btn('gb-i gb-home', '🏠', 'Home', doHome, 'none'); nav.appendChild(bHome);
    // icon · name · level
    const title = mk('div', 'gb-g gb-title');
    title.innerHTML = '<span class="gb-ic"></span><span class="gb-nm"></span>';
    title.querySelector('.gb-ic').textContent = o.icon || '🎮'; title.querySelector('.gb-nm').textContent = o.name || '';
    if(here() !== 'home' && here() !== 'gameroom'){ title.classList.add('gb-tstart'); title.title = (o.name || pageName(here())) + ' start'; title.setAttribute('role', 'button'); title.tabIndex = 0;
      title.onclick = e => { e.stopPropagation(); closeMenu(); doStart(); }; title.onkeydown = e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); doStart(); } }; }   /* 📱 24g-f */
    const lvg = mk('div', 'gb-g gb-lvg', '<span class="gb-lv"></span>'), lvEl = lvg.firstChild; if(o.levelId) lvEl.id = o.levelId;
    const br = mk('i', 'gb-br');
    function lvTint(text, cls){ const c = levelColour(text, cls); el.classList.toggle('gb-haslv', !!text); if(c){ el.style.setProperty('--lv-a', c[0]); el.style.setProperty('--lv-b', c[1]); } else { el.style.removeProperty('--lv-a'); el.style.removeProperty('--lv-b'); } }   /* 🎨 24g-f */
    // numbers
    const stats = mk('div', 'gb-g gb-stats'), board = mk('div', 'gb-board'); stats.appendChild(board);
    // ⏸ ❓ extras ⚙️
    const tools = mk('div', 'gb-g gb-seg gb-tools');
    let bPause = null;
    if(o.pause && o.pauseButton){ bPause = btn('gb-i gb-pz', '<span class="gb-pzi" aria-hidden="true"><i></i><i></i></span>', 'Pause', () => pauseCard(), 'tap'); tools.appendChild(bPause); }
    // 🎵 24u-a: music chip — shows only while this page plays a mood; tap = on / off + volume for this player
    let bMus = null;
    if(o.music !== false && window.UISound && UISound.music){
      UISound.music.css();
      bMus = btn('gb-i gb-mus hidden', '🎵', 'Music', () => UISound.music.sheet(bMus), 'tap'); tools.appendChild(bMus);
      const paintMus = (st, first) => { const show = !!st.live, was = !bMus.classList.contains('hidden'); bMus.classList.toggle('hidden', !show); bMus.classList.toggle('gb-mus-off', !st.on);
        bMus.title = st.on ? 'Music: on' : 'Music: off'; bMus.setAttribute('aria-label', bMus.title); if(!first && show !== was) needFit(); };
      paintMus(UISound.music.state(), true); UISound.music.watch(st => paintMus(st));
    }
    let bHelp = null;
    if(o.help !== false){
      bHelp = btn('gb-i gb-help', '❓', 'How to play', () => {
        const fn = typeof o.help === 'function' ? o.help : null;
        if(fn) return fn();
        const h = UI.gameHelp && UI.gameHelp(o.game, o.name, o.icon); if(!h) return;
        paused(); UI.guide([h]).then(resumed, resumed);
      }, 'tap');
      bHelp.setAttribute('data-howto', '1'); tools.appendChild(bHelp);
    }
    const extras = {}; const xs = (o.extras || []).filter(x => !x.keep), keeps = (o.extras || []).filter(x => x.keep);
    // p1b: "keep" extras = the game's own action buttons (↶ Undo, 💡 Hint, ⏸ Pause, 🏁 Finish, 🔄 New maze): always visible, real <button>s
    // with the game's id, so the game's old code (textContent / disabled / .hidden) keeps working unchanged
    keeps.forEach(x => { const b = btn('gb-k', '', x.label, () => x.onClick && x.onClick(), x.sound || 'tap'); if(x.id) b.id = x.id; b.innerHTML = x.html || ''; if(!x.html) b.textContent = x.icon || '•'; if(x.cls) b.className += ' ' + x.cls; if(x.hidden) b.classList.add('hidden'); tools.appendChild(b); });
    xs.forEach(x => { const b = btn('gb-i gb-x', '', x.label, () => x.onClick && x.onClick(), 'tap'); b.id = x.id ? x.id : ''; extras[x.id] = {x: x, b: b}; tools.appendChild(b); });
    let bGear = null, menu = null;
    if(xs.length){
      bGear = btn('gb-i gb-gear', '⚙️', 'More', () => toggleMenu(), 'tap'); tools.appendChild(bGear);
      menu = mk('div', 'gb-menu hidden');
      xs.forEach(x => { const r = mk('button', '', ''); r.type = 'button'; r.setAttribute('data-sound', 'tap'); r.onclick = e => { e.stopPropagation(); closeMenu(); x.onClick && x.onClick(); }; extras[x.id].r = r; menu.appendChild(r); });
    }
    function paintExtra(id){ const E = extras[id]; if(!E) return; E.b.textContent = E.x.icon || '•'; E.b.title = E.x.label || ''; E.b.setAttribute('aria-label', E.x.label || '');
      E.b.classList.toggle('hidden', !!E.x.hidden); if(E.r){ E.r.innerHTML = '<span class="gi"></span><span></span>'; E.r.firstChild.textContent = E.x.icon || '•'; E.r.lastChild.textContent = E.x.label || ''; E.r.style.display = E.x.hidden ? 'none' : ''; } }
    Object.keys(extras).forEach(paintExtra);
    // 🔘 gb-1 (Aowu 2026-11-16 08:56 / 09:53): a narrow screen folds ◀ Back · 🎚️ Levels · 🏠 into ONE ◀ pill → tap = this "where to go" list (+ the level),
    // so the score / players / helpers / ⚙️ fit the top row (one row instead of two on an upright phone)
    const fmenu = mk('div', 'gb-menu gb-fmenu hidden');
    const fhd = mk('div', 'gb-fhd'); fmenu.appendChild(fhd);
    const fitem = (icon, label, fn, snd) => { const r = mk('button', '', '<span class="gi"></span><span></span>'); r.type = 'button'; r.setAttribute('data-sound', snd || 'tap'); r.firstChild.textContent = icon; r.lastChild.textContent = label;
      r.onclick = e => { e.stopPropagation(); closeMenu(); fn(); }; fmenu.appendChild(r); return r; };
    /* 📱 24g-f (Aowu 14:07 / 14:2x): one step up per line — ◀ where you came from (only when it is not a line below: a game crossed over, the Archive …)
       · 🎚️ Levels (this mode) · <icon> <Game> start (the game's own start page) · 🎴 Gameroom · 🏠 Home. The line ◀ really goes to keeps class gb-fback. */
    const bp = backPage(o.fallback), startOk = here() !== 'home' && here() !== 'gameroom';
    let fBack = null;
    if(bp !== 'gameroom' && bp !== 'home'){ fBack = fitem('◀', backLabel(o.fallback).slice(2), doBack, 'none'); fBack.className = 'gb-fback'; }
    if(o.levels){ const r = fitem('🎚️', 'Levels', () => o.levels()); r.className = 'gb-flv'; r.firstChild.innerHTML = '<span class="gb-stairs" aria-hidden="true"><i></i><i></i><i></i></span>'; }   /* same drawn stairs as the open row */
    if(startOk) fitem(o.icon || '🎮', (o.name || pageName(here())) + ' start', doStart, 'none').className = 'gb-fstart';
    fitem('🎴', 'Gameroom', bp === 'gameroom' ? doBack : doRoom, 'none').className = 'gb-froom' + (bp === 'gameroom' ? ' gb-fback' : '');
    fitem('🏠', 'Home', bp === 'home' ? doBack : doHome, 'none').className = 'gb-fhome' + (bp === 'home' ? ' gb-fback' : '');
    let foldT = 0; const FOLD_MS = () => (window.UI_GBFOLD_MS > 0 ? window.UI_GBFOLD_MS : 4000);   /* 📱 24g-f: folds back by itself after ~4 s */
    const foldLater = () => { clearTimeout(foldT); foldT = setTimeout(closeFold, FOLD_MS()); };
    function openFold(){ if(menu) menu.classList.add('hidden'); fhd.textContent = lvEl.dataset.full || lvEl.textContent || ''; fhd.style.display = fhd.textContent ? '' : 'none'; fmenu.classList.remove('hidden'); bBack.classList.add('gb-on'); bBack.setAttribute('aria-expanded', 'true'); el.classList.add('gb-fopen'); foldLater(); }
    function closeFold(){ clearTimeout(foldT); fmenu.classList.add('hidden'); bBack.classList.remove('gb-on'); bBack.setAttribute('aria-expanded', 'false'); el.classList.remove('gb-fopen'); }
    function toggleFold(){ if(fmenu.classList.contains('hidden')) openFold(); else closeFold(); }
    fmenu.addEventListener('pointerdown', foldLater);
    function toggleMenu(){ if(!menu) return; closeFold(); menu.classList.toggle('hidden'); }
    function closeMenu(){ if(menu) menu.classList.add('hidden'); closeFold(); }
    document.addEventListener('pointerdown', e => { if(menu && !menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== bGear) closeMenu();
      }, true);   /* 📱 24g-f: an open fold is closed by the ONE listener under GB_EAT (a tap on the game only folds it back) */
    el.appendChild(nav); el.appendChild(title); el.appendChild(lvg); el.appendChild(br); el.appendChild(stats); el.appendChild(tools); if(menu) el.appendChild(menu); el.appendChild(fmenu);

    // ⏸ pause card
    function pauseCard(){
      paused();
      const m = mk('div', 'gb-pause'); m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
      m.innerHTML = '<div class="gb-pause-card"><h3>⏸ Paused</h3><div class="row"></div></div>';
      const row = m.querySelector('.row'), close = () => { m.remove(); document.removeEventListener('keydown', onKey); };
      const add = (cls, txt, fn) => { const b = mk('button', 'sp-btn ' + cls, ''); b.type = 'button'; b.textContent = txt; b.onclick = () => { close(); fn(); }; row.appendChild(b); return b; };
      add('sp-secondary', '◀ Back', () => { resumed(); doBack(); });
      if(o.levels) add('sp-secondary', '🎚️ Levels', () => { resumed(); o.levels(); });
      const go = add('sp-primary sp-lg', '▶ Resume', resumed);
      const onKey = e => { if(e.key === 'Escape' || e.key === 'Enter'){ e.preventDefault(); close(); resumed(); } };
      document.addEventListener('keydown', onKey); document.body.appendChild(m); try{ go.focus(); }catch(e){}
    }

    // ---------- slots ----------
    const slots = {};
    function slot(key, cls, html){ let s = slots[key]; if(!s){ s = mk('span', 'gb-s ' + cls, html); s.dataset.k = key; slots[key] = s;   /* p1c: data-k = the slot's key (tests: [data-k="c:rows"]) */ board.appendChild(s); needFit(); } return s; }
    function pop(e, cls){ e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); }
    function setNum(e, v, popCls){ const b = e.querySelector('b'), was = b.textContent, nv = String(v); if(was === nv) return false; b.textContent = nv; if(was !== '' && popCls) pop(e, popCls);
      if(was.length !== nv.length && mode && el.offsetParent) requestAnimationFrame(() => { if(over()) fit(true); });   // a number got a digit longer → only re-fit if it no longer fits
      return true; }
    let plBox = null; const pls = {};
    const bar = {
      el: el,
      level(text, cls){ lvTint(text, cls); lvEl.dataset.full = text || ''; lvEl.title = text || ''; lvEl.textContent = el.classList.contains('gb-nano') ? glyph1(text || '') : (text || ''); lvEl.className = 'gb-lv' + (cls ? ' ' + cls : ''); needFit(); return bar; },
      score(n){ el.classList.add('gb-sc'); const s = slot('score', 'gb-score', '<i>⭐</i><b></b>'); s.title = 'Score'; const sb = s.querySelector('b'); if(o.scoreMin && !s.dataset.mw){ s.dataset.mw = 1; Object.assign(sb.style, {minWidth: o.scoreMin, maxWidth: o.scoreMin, display: 'inline-block', whiteSpace: 'nowrap', overflow: 'visible', transformOrigin: '0 50%'}); }   /* p1c: scoreMin (e.g. '8ch') = a FIXED room for the score from the start → the bar never changes size while the score grows */
        if(o.scoreMin){ const N = parseFloat(o.scoreMin) || 8, len = String(n == null ? 0 : n).length, t = len > N ? 'scale(' + (N / len).toFixed(3) + ')' : ''; if(sb.style.transform !== t) sb.style.transform = t; }   /* longer than the room → the digits shrink a little instead */ s.classList.remove('hidden'); setNum(s, n == null ? 0 : n, 'gb-pop'); return bar; },
      players(list){
        if(!plBox){ plBox = mk('div', 'gb-pls'); board.appendChild(plBox); }
        const keep = {}; let seat = 0;
        (list || []).forEach(p => {
          const k = String(p.k != null ? p.k : p.name); keep[k] = 1; let c = pls[k];
          if(!c){ c = mk('span', 'gb-s gb-pl', '<span class="av"></span><span class="nm"></span><b></b>'); c.dataset.k = k; pls[k] = c; plBox.appendChild(c); needFit(); }
          if(p.av !== undefined){ const av = c.querySelector('.av'); av.innerHTML = ''; if(p.av && p.av.nodeType) av.appendChild(p.av); else av.textContent = p.av || ''; }
          if(p.name !== undefined) c.querySelector('.nm').textContent = p.name;
          if(p.score !== undefined) setNum(c, p.score, 'gb-pop');
          if(p.on !== undefined) c.classList.toggle('on', !!p.on);
          if(p.col || p.bot !== undefined || !c.style.getPropertyValue('--pc')) c.style.setProperty('--pc', p.col || (p.bot ? BOT_COL : SEAT_COLS[seat % SEAT_COLS.length]));
          if(!p.bot) seat++;
        });
        plBox.classList.toggle('two', Object.keys(pls).length === 2); plBox.classList.toggle('has-on', !!plBox.querySelector('.gb-pl.on'));
        if(list && list.length) Object.keys(pls).forEach(k => { if(!keep[k] && list.full !== false){ pls[k].remove(); delete pls[k]; needFit(); } });
        return bar;
      },
      on(k){ Object.keys(pls).forEach(x => pls[x].classList.toggle('on', x === String(k))); if(plBox) plBox.classList.toggle('has-on', !!plBox.querySelector('.gb-pl.on')); return bar; },
      miss(n){ const s = slot('miss', 'gb-miss', '❌ <b></b>'); s.title = 'Mistakes'; const was = Number(s.querySelector('b').textContent) || 0; setNum(s, n || 0); s.classList.toggle('bad', n > 0); if(n > was) pop(s, 'gb-shake'); return bar; },
      lives(n, warn){ const s = slot('lives', 'gb-lives', '❤️ <b></b>'); s.title = 'Lives'; const was = Number(s.querySelector('b').textContent); setNum(s, n); s.classList.toggle('warn', !!warn); s.classList.remove('hidden'); if(n < was) pop(s, 'gb-shake'); return bar; },   // p1c: warn (last life)
      time(v, warn){ const s = slot('time', 'gb-time', '⏱ <b></b>'); s.title = 'Time'; setNum(s, typeof v === 'number' ? fmt(v) : (v || '0:00')); s.classList.toggle('warn', !!warn); s.classList.remove('hidden'); return bar; },
      round(a, b){ const s = slot('round', 'gb-round', '🔁 <b></b>'); s.title = 'Round'; setNum(s, a + '/' + b); return bar; },
      count(key, icon, v, title, warn){ const s = slot('c:' + key, 'gb-cnt', '<i style="font-style:normal"></i> <b></b>'); s.querySelector('i').textContent = icon; if(title) s.title = title; setNum(s, v); s.classList.toggle('warn', !!warn); s.classList.remove('hidden'); return bar; },
      meter(key, icon, frac, title, warn){ const s = slot('m:' + key, 'gb-meter', '<i style="font-style:normal"></i><span class="gb-mt"><u></u></span>'); s.querySelector('i').textContent = icon; if(title) s.title = title;   // p1c: a little progress bar (Stack It! tower → 🏁)
        const w = Math.round(Math.max(0, Math.min(1, frac || 0)) * 100) + '%', u = s.querySelector('u'); if(u.style.width !== w) u.style.width = w; s.classList.toggle('full', frac >= 1); s.classList.toggle('warn', !!warn); s.classList.remove('hidden'); return bar; },
      badge(key, text){ const s = slots[key] || slots['c:' + key] || slots['m:' + key]; if(!s) return bar; let e = s.querySelector('.gb-bdg');   // p1c: a small badge ON a slot (🔥 combo) — never changes the bar's size
        if(!text){ if(e) e.remove(); return bar; } if(!e){ e = mk('em', 'gb-bdg', ''); s.appendChild(e); } if(e.textContent !== String(text)){ e.textContent = text; pop(e, 'gb-pop'); } return bar; },
      adopt(key, node){ if(!node) return bar; const k = 'a:' + key; if(slots[k]) return bar;   // p1d: a game's OWN info pill moves into the scoreboard (its id + the game's code stay)
        node.classList.remove('pill', 'grow'); node.classList.add('gb-s', 'gb-ad'); node.dataset.k = k; slots[k] = node; board.appendChild(node); needFit(); return bar; },
      keepBtn(b){ if(!b) return bar; b.classList.remove('pill', 'big'); b.classList.add('gb-b', 'gb-k'); if(!b.type) b.type = 'button'; tools.insertBefore(b, tools.firstChild); needFit(); return bar; },   // p1d: a game's own button joins the toolbar as it is
      custom(key, node){ let s = slots['u:' + key]; if(!s){ s = mk('div', 'gb-cu', ''); s.dataset.k = 'u:' + key; slots['u:' + key] = s; stats.appendChild(s); needFit(); }   // p1c: a game's own HUD art (🥊 fighter bars, 🗺️ hero cards) inside the bar
        if(node && node.parentNode !== s){ s.innerHTML = ''; s.appendChild(node); needFit(); } return bar; },
      left(ms, warn){ const s = slot('left', 'gb-left', '⌛ <b></b>'); s.title = 'Play time left'; setNum(s, fmt(ms / 1000)); s.classList.toggle('warn', !!warn); return bar; },
      hide(key, h){ const s = slots[key] || slots['c:' + key] || slots['m:' + key] || slots['u:' + key] || slots['a:' + key]; if(s) s.classList.toggle('hidden', h !== false); needFit(); return bar; },
      extra(id, ch){ const E = extras[id]; if(!E) return bar; Object.assign(E.x, ch || {}); paintExtra(id); return bar; },
      back: doBack, home: doHome, leave: leave, fit: () => fit(true), pauseCard: pauseCard,
      buttons: {back: bBack, levels: bLv, room: bRoom, home: bHome, help: bHelp, pause: bPause, gear: bGear},
      folded(){ return el.classList.contains('gb-fold'); },   /* 📱 24g-f */
      isOpen(){ return !fmenu.classList.contains('hidden'); },
      unfold(){ if(!el.classList.contains('gb-fold')) return false; openFold(); return true; },
      fold(){ closeFold(); return bar; }
    };
    GB_ALL.push(bar);

    // ---------- fit: one row → two rows → icons ----------
    let mode = '', lastW = -1, fitTimer = 0, foldW = '';
    function over(){
      if(el.scrollWidth > el.clientWidth + 1) return true;
      for(const g of [nav, title, lvg, stats, board, tools]) if(g.scrollWidth > g.clientWidth + 1) return true;
      const nm = title.querySelector('.gb-nm'); if(nm.textContent && nm.offsetParent && nm.scrollWidth > nm.clientWidth + 1) return true;
      const mid = g => g.offsetTop + g.offsetHeight / 2, row = mid(nav);   // same row = same centre line (items are centred, tops differ)
      const shown = g => g.offsetParent !== null || getComputedStyle(g).display !== 'none';   // gb-1: a folded-away group has no row
      if(Math.abs(mid(tools) - row) > 6 || (shown(title) && Math.abs(mid(title) - row) > 6)) return true;
      if(!el.classList.contains('gb-tight') && lvEl.textContent && shown(lvg) && Math.abs(mid(lvg) - row) > 6) return true;
      if(!el.classList.contains('gb-two') && Math.abs(mid(stats) - row) > 6) return true;
      if(el.classList.contains('gb-tight') && lvEl.textContent && Math.abs(mid(lvg) - mid(stats)) > 6 && !el.classList.contains('gb-nano')) return true;   // row 2 = level + numbers (p1c: micro too — only nano may give the level its own row)
      return false;
    }
    function fit(force){
      if(!el.offsetParent && getComputedStyle(el).position !== 'fixed') return;
      const w = el.clientWidth + 'x' + innerHeight; if(!force && w === lastW) return; lastW = w; const h0 = el.offsetHeight;
      const was = mode;
      // short screens (phone on its side) keep ONE row as long as they can: hide the name / extras / player names first
      el.classList.toggle('gb-short', innerHeight < 700); el.classList.toggle('gb-xs', innerHeight < 620);   // p1b: very short screens (375×560, phone on its side) = a lower bar
      const STAGES = ['gb-two', 'gb-tight', 'gb-tiny', 'gb-micro', 'gb-nano'];   // (slim + 🔘 fold are tried before these, below)   // p1c: nano = smaller numbers, level chip shortens
      el.classList.remove('gb-slim', 'gb-two', 'gb-tight', 'gb-tiny', 'gb-micro', 'gb-nano', 'gb-fold'); mode = 'one';
      if(lvEl.dataset.full != null && lvEl.textContent !== lvEl.dataset.full) lvEl.textContent = lvEl.dataset.full;
      // 🔘 gb-1: too wide for one row → first fold ◀ · Levels · 🏠 (+ the level chip) into the ◀ pill; still too wide → player names / icon go (tiny); only then a 2nd row
      if(innerHeight < 520 && over()){ el.classList.add('gb-slim'); mode = 'slim'; }   // short screens: names / extras hide first (as before)
      const foldPhone = isPhone();   /* 📱 24g-f (Aowu 2026-11-18 12:42): EVERY phone folds — no game opt-in needed (fold: true / 'short' still work) */
      const foldShort = foldPhone || (o.fold === 'short' && innerHeight < 520 && innerWidth > innerHeight);   // 📱 pd-10 (Aowu 2026-11-17 20:11): opt-in `fold: 'short'` = a phone on its side ALWAYS folds ◀ · Levels · 🏠 → the score sits in the same row (one row on every iPhone font)
      if((foldShort || (over() && el.clientWidth < 560 && (o.fold === true || window.UI_GBFOLD === true))) && window.UI_GBFOLD !== false && o.fold !== false){   // opt-in per game for now (opts.fold: true) — 24g rolls it out game by game with each game's tests   // phones only (a tablet keeps its 2 rows + the names)
        el.classList.add('gb-fold'); mode = 'fold';
        // keep ~3 digits of room so a growing score never pops the bar to 2 rows mid-game (the bar height must stay put); no single row even folded → no fold (old 2 rows)
        const keep = was.startsWith('fold') && foldW === w;   // same screen, numbers only grew → stay folded if it still fits at all (no jump to 2 rows mid-game)
        const overS = () => { if(keep) return over(); el.classList.add('gb-fslack'); const r = over(); el.classList.remove('gb-fslack'); return r; };
        if(overS()){ el.classList.add('gb-tiny'); if(!overS()) mode = 'fold-tiny'; else { el.classList.add('gb-nano'); if(!overS()) mode = 'fold-nano'; else { el.classList.remove('gb-tiny', 'gb-nano'); if(!foldPhone){ el.classList.remove('gb-fold'); mode = 'one'; } } } } }   /* 📱 24g-f: a phone stays folded even when it needs 2 rows */
      if(!el.classList.contains('gb-fold')) fmenu.classList.add('hidden');
      for(const c of (over() ? STAGES : [])){ if(!over()) break; el.classList.add(c); mode = c.slice(3); if(c === 'gb-nano' && lvEl.dataset.full) lvEl.textContent = glyph1(lvEl.dataset.full); }   // p1c: nano = the level chip keeps only its icon (🐣), full name on hover
      if(el.classList.contains('gb-fold') && !mode.startsWith('fold')) mode = 'fold2-' + mode;   /* 📱 24g-f: folded phone in 2 rows = 'fold2-two' … 'fold2-nano' */
      el.dataset.fit = mode; if(mode.startsWith('fold')) foldW = w;
      if((was !== mode || Math.abs(el.offsetHeight - h0) > 1) && o.onFit) try{ o.onFit(mode); }catch(e){}   // bar got taller / lower (also the FIRST fit, after the game's first layout — p1b) → re-lay the board
    }
    function glyph1(t){ try{ if(window.Intl && Intl.Segmenter){ for(const x of new Intl.Segmenter(undefined, {granularity: 'grapheme'}).segment(t)) return x.segment; } }catch(e){} return Array.from(t)[0] || ''; }
    function needFit(){ clearTimeout(fitTimer); fitTimer = setTimeout(() => fit(true), 0); }
    try{ new ResizeObserver(() => fit(false)).observe(el); }catch(e){ addEventListener('resize', () => fit(false)); }
    return bar;
  }

  // p1d: turn a game's EXISTING top bar (◀ pill + info pills + buttons) into the shared bar in place — the game's ids and code keep working:
  //   the ◀ pill's click = 🎚️ Levels (the game's own leave / level-picker step), a ❓ button = the bar's ❓, info pills (span) → scoreboard slots,
  //   other boxes (meters, clocks) → custom slots, other buttons → toolbar buttons. opts as gameBar (+ levels to override).
  function gameBarFrom(el, o){
    o = Object.assign({}, o || {}); if(!el) return null; if(el._gb) return el._gb;
    const kids = [...el.children], isBtn = k => k.tagName === 'BUTTON';
    const back = kids.find(k => isBtn(k) && /^\s*[◀⬅]\s*$/.test(k.textContent)), help = kids.find(k => isBtn(k) && /^\s*❓\s*$/.test(k.textContent));
    if(!o.levels && back) o.levels = () => back.click();
    if(o.help === undefined && help) o.help = () => help.click();
    const slotBtn = k => isBtn(k) && k.dataset.gb === 'slot';   // a button that SHOWS something (Mini games' stage picker) → a scoreboard slot
    const keep = kids.filter(k => isBtn(k) && k !== back && k !== help && !slotBtn(k)), info = kids.filter(k => (!isBtn(k) || slotBtn(k)) && !k.classList.contains('sp'));
    kids.forEach(k => { if(k !== back && k !== help) k.remove(); });
    [back, help].forEach(k => { if(k){ k.remove(); k.style.display = 'none'; document.body.appendChild(k); } });   // kept (hidden) so .click() still runs the game's handler
    const bar = gameBar(el, o);
    info.forEach((k, i) => { if(k.tagName === 'SPAN' || slotBtn(k)) bar.adopt(k.id || ('i' + i), k); else bar.custom(k.id || ('u' + i), k); });
    keep.reverse().forEach(b => bar.keepBtn(b));
    el._gb = bar; return bar;
  }
  // p1c: a game's own ⏸ / ▶ button (Snakize, Soul Bopper…) shows the same drawn icons as the bar — call instead of setting '⏸' / '▶' text
  function pauseIcon(btn, paused){ if(!btn) return; const h = paused ? '<span class="gb-pli" aria-hidden="true"></span>' : '<span class="gb-pzi" aria-hidden="true"><i></i><i></i></span>'; if(btn.innerHTML !== h) btn.innerHTML = h; btn.title = paused ? 'Play on (P)' : 'Pause (P)'; btn.classList.toggle('gb-on', !!paused); }
  gameBar.isPhone = isPhone;   /* 📱 24g-f: tests — UI.gameBar.unfold() opens the fold of the bar on screen (false = not folded), UI.gameBar.fold() closes it */
  gameBar.unfold = () => { const b = GB_ALL.filter(x => x.el.isConnected && x.el.offsetParent !== null).pop(); return b ? b.unfold() : false; };
  gameBar.fold = () => { GB_ALL.forEach(x => x.fold()); return true; };
  Object.assign(window.UI, {gameBar: gameBar, navBar: navBar, navScreen: navScreen, spBarCss: addCss, pauseIcon: pauseIcon, gameBarFrom: gameBarFrom});   // 📏 s3: back · backInfo · backLabel · pageName · goHome · spButtonsCss come from UiKit core
  addCss();
})();
/* ================= 📏 PAGE ROWS (p2 — Polish Sprint P2, Aowu 2026-11-12 F3: "no sideways scrolling buttons — all must show on screen") =================
   A row of chips / cards / skins NEVER scrolls sideways. It wraps into lines; when it would need more than `rows` lines it turns into
   PAGES with ‹ · dots · › under it (and a sideways swipe on the row flips the page). Kids see every choice, nothing hides off the edge.

   UI.pageRow(el, {rows: 2, swipe: true}) → {lay(), go(n), page(), pages()}   — one row (re-calling it re-lays the same row)
   UI.pageRows(selector, opts)                                                — every row matching the selector, now AND later (rows built by
                                                                                the game after the page loads are picked up automatically)
   • the page that holds the picked item (.on / .sel / .picked / .active / aria-pressed / aria-selected) is shown after each re-lay
   • re-lays itself when the row's width changes or the game rebuilds its children; a hidden row lays out when it appears
   • rows: how many lines one page may use (chips: 3 = usually no pages at all; skins: 2)
   • nav: false = no ‹ · › bar (the game already has its own ⬅️ ➡️ and calls row.__pr.lay(true) when the pick moves — WisDeck 📚 Learn strip)
   • edge: true = the ‹ › sit INSIDE the row on its left / right edge (no dots, no extra height) — for rows inside a tight play layout
     (Stack It! shelf: pieces keep their size, ‹ › flip the pieces)
   • swipe: false for rows whose items are dragged (Stack It! shelf) — then only ‹ › and the dots flip pages
   • the row keeps its own classes / ids, so game code + tests still find their chips; items on other pages get .ui-pr-off (display:none)
*/
(function(){
  if (window.UI && UI.pageRow) return;
  const SEL = '.on, .sel, .picked, .active, .selected, [aria-pressed="true"], [aria-selected="true"]';
  function css(){
    if (document.getElementById('ui-pr-css')) return;
    const st = document.createElement('style'); st.id = 'ui-pr-css';
    st.textContent =
      '.ui-pr.ui-pr-row{flex-wrap:wrap !important;overflow-x:hidden !important;scroll-snap-type:none !important;justify-content:center !important;max-width:100%;}' +
      '.ui-pr > *{scroll-snap-align:none !important;}' +
      '.ui-pr > .ui-pr-off{display:none !important;}' +
      '.ui-prn{display:flex;align-items:center;justify-content:center;gap:4px;margin:2px auto 6px;min-height:36px;}' +
      '.ui-prn[hidden]{display:none !important;}' +
      '.ui-pr.ui-pre-on{position:relative;padding-left:42px !important;padding-right:42px !important;}' +
      '.ui-prn.ui-pre{position:absolute;left:2px;right:2px;top:50%;transform:translateY(-50%);margin:0;justify-content:space-between;pointer-events:none;min-height:0;}' +
      '.ui-prn.ui-pre .ui-pra{pointer-events:auto;} .ui-prn.ui-pre .ui-prd, .ui-prn.ui-pre .ui-prc{display:none;}' +
      '.ui-prn button{all:unset;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent;display:inline-flex;align-items:center;justify-content:center;}' +
      '.ui-prn .ui-pra{width:36px;height:36px;border-radius:50%;background:var(--card,#fff);color:var(--ink,#2b2b2b);font:800 1.15rem/1 Fredoka,Nunito,sans-serif;box-shadow:0 2px 0 rgba(0,0,0,.18);}' +
      '.ui-prn .ui-pra:disabled{opacity:.3;cursor:default;}' +
      '.ui-prn .ui-prd{width:22px;height:30px;}' +
      '.ui-prn .ui-prd::after{content:"";width:9px;height:9px;border-radius:50%;background:var(--ink-soft,#8a8a8a);opacity:.45;transition:transform .15s,opacity .15s;}' +
      '.ui-prn .ui-prd.on::after{opacity:1;transform:scale(1.35);background:var(--terracotta,#e07a5f);}' +
      '.ui-prn .ui-prc{font:700 .78rem/1 Nunito,sans-serif;color:var(--ink-soft,#777);margin:0 4px;min-width:2.6em;text-align:center;}' +
      '@keyframes uiPrIn{from{opacity:.25;transform:translateX(var(--pr-dx,0))}to{opacity:1;transform:none}}' +
      '.ui-pr.ui-pr-flip > :not(.ui-pr-off){animation:uiPrIn .22s ease-out;}' +
      '@media (prefers-reduced-motion:reduce){.ui-pr.ui-pr-flip > *{animation:none;}}';
    (document.head || document.documentElement).appendChild(st);
  }
  function pageRow(el, o){
    if (!el) return null;
    if (el.__pr) { if (o) Object.assign(el.__pr.o, o); el.__pr.lay(true); return el.__pr; }
    css();
    o = Object.assign({rows: 2, swipe: true}, o || {});
    el.classList.add('ui-pr');
    const nav = document.createElement('div'); nav.className = 'ui-prn'; nav.hidden = true; nav.setAttribute('role', 'group'); nav.setAttribute('aria-label', 'More choices');
    if (o.edge) { nav.classList.add('ui-pre'); el.appendChild(nav); } else el.insertAdjacentElement('afterend', nav);
    let page = 0, pages = 1, map = new Map(), lastW = -1, busy = false, raf = 0;
    const kids = () => [...el.children].filter(c => c !== nav);
    function lay(keepSel){
      busy = true;
      if (o.edge && nav.parentNode !== el) el.appendChild(nav);
      const all = kids(); all.forEach(c => c.classList.remove('ui-pr-off'));
      if (/^column/.test(getComputedStyle(el).flexDirection)) {        // a column (Stack It! shelf on a phone held sideways) is not a row: leave it
        el.classList.remove('ui-pr-row', 'ui-pre-on'); map = new Map(); pages = 1; page = 0; paint(); lastW = el.clientWidth; busy = false; return;
      }
      el.classList.add('ui-pr-row'); if (o.edge) el.classList.add('ui-pre-on');
      const shown = all.filter(c => c.getClientRects().length && getComputedStyle(c).display !== 'none');
      map = new Map(); let line = -1, bottom = -1e9;
      for (const c of shown) {                                   // a new line starts below the lowest item of the line before
        const t = c.offsetTop, b = t + c.offsetHeight;
        if (line < 0 || t >= bottom - 2) { line++; bottom = b; } else bottom = Math.max(bottom, b);
        map.set(c, Math.floor(line / Math.max(1, o.rows)));
      }
      pages = shown.length ? Math.floor(line / Math.max(1, o.rows)) + 1 : 1;
      if (o.edge && pages <= 1) el.classList.remove('ui-pre-on');
      if (keepSel || page >= pages) { const s = shown.find(c => c.matches(SEL) || c.querySelector(SEL)); page = s ? map.get(s) : Math.min(page, pages - 1); }
      paint(); lastW = el.clientWidth;
      busy = false;
    }
    function paint(){
      for (const [c, p] of map) c.classList.toggle('ui-pr-off', p !== page);
      el.dataset.page = page; el.dataset.pages = pages;
      nav.hidden = pages <= 1 || o.nav === false;
      if (pages <= 1 || o.nav === false) { nav.innerHTML = ''; return; }
      let h = '<button type="button" class="ui-pra" data-pr="-1" aria-label="Back a page"' + (page ? '' : ' disabled') + '>‹</button>';
      if (pages <= 8) for (let i = 0; i < pages; i++) h += '<button type="button" class="ui-prd' + (i === page ? ' on' : '') + '" data-pg="' + i + '" aria-label="Page ' + (i + 1) + '"></button>';
      else h += '<span class="ui-prc">' + (page + 1) + ' / ' + pages + '</span>';
      h += '<button type="button" class="ui-pra" data-pr="1" aria-label="Next page"' + (page < pages - 1 ? '' : ' disabled') + '>›</button>';
      nav.innerHTML = h;
    }
    function go(n, dir){
      n = Math.max(0, Math.min(pages - 1, n)); if (n === page) return;
      busy = true; page = n; paint();
      el.style.setProperty('--pr-dx', (dir || 1) * 18 + 'px'); el.classList.remove('ui-pr-flip'); void el.offsetWidth; el.classList.add('ui-pr-flip');
      busy = false;
      if (window.UISound && UISound.play) try { UISound.play('tick'); } catch (e) {}
    }
    nav.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return; e.preventDefault(); e.stopPropagation();
      if (b.dataset.pr) go(page + Number(b.dataset.pr), Number(b.dataset.pr)); else go(Number(b.dataset.pg), Number(b.dataset.pg) > page ? 1 : -1);
    });
    if (o.swipe) {                                               // a clear sideways swipe on the row flips the page; taps still tap
      let sx = 0, sy = 0, st = 0, eat = 0;
      el.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; st = 1; }, {passive: true});
      el.addEventListener('pointerup', e => { if (!st || pages <= 1) return; st = 0; const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) { go(page + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); eat = performance.now(); } }, {passive: true});
      el.addEventListener('pointercancel', () => { st = 0; }, {passive: true});
      el.addEventListener('click', e => { if (performance.now() - eat < 350) { e.preventDefault(); e.stopPropagation(); } }, true);
    }
    const later = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; lay(true); }); };
    if (window.ResizeObserver) new ResizeObserver(() => { if (!busy && el.clientWidth !== lastW) later(); }).observe(el);
    new MutationObserver(() => { if (!busy) later(); }).observe(el, {childList: true});
    const api = {o, lay, go: n => go(n), page: () => page, pages: () => pages, nav};
    el.__pr = api; lay(true);
    return api;
  }
  // every row that matches, now and later
  const WATCH = [];
  function pageRows(sel, o){
    css(); WATCH.push([sel, o]);
    const scan = root => { for (const [s, oo] of WATCH) { if (root.matches && root.matches(s)) pageRow(root, oo); if (root.querySelectorAll) root.querySelectorAll(s).forEach(e => { if (!e.__pr) pageRow(e, oo); }); } };
    if (!pageRows.mo) {
      pageRows.mo = new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && !(n.classList && n.classList.contains('ui-prn'))) scan(n); });
      const start = () => pageRows.mo.observe(document.body, {childList: true, subtree: true});
      if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
    }
    const go = () => scan(document.body || document.documentElement);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }
  // a game can ask: is this item on the page shown now? (tests + "jump to my pick")
  function pageRowShow(item){ const row = item && item.parentElement, pr = row && row.__pr; if (!pr) return false; pr.lay();
    for (let i = 0; i < pr.pages() && item.classList.contains('ui-pr-off'); i++) pr.go(i);
    return !item.classList.contains('ui-pr-off'); }
  // how many pictures / letters a short text shows (❌⭕ = 2, 👨‍👩‍👧 = 1)
  function glyphs(t){ t = String(t || ''); try { if (window.Intl && Intl.Segmenter) return [...new Intl.Segmenter().segment(t)].length; } catch (e) {}
    return Array.from(t).filter(c => !/[\uFE0F\u200D\u{1F3FB}-\u{1F3FF}]/u.test(c)).length; }
  window.UI = window.UI || {};
  Object.assign(window.UI, {pageRow: pageRow, pageRows: pageRows, pageRowShow: pageRowShow, glyphs: glyphs});
})();
/* ================= 📏 PAGE ROWS END (p2) ================= */
/* ================= 🏷️ CLASSIC TILE POINTS PICK (p4c) ================= */
(function(){
  window.UI = window.UI || {};
  const key = n => 'sp_ptab:' + (n || '');
  function get(n){ try{ return localStorage.getItem(key(n)) === 'small' ? 'small' : 'tab'; }catch(e){ return 'tab'; } }
  function set(n, v){ try{ localStorage.setItem(key(n), v === 'small' ? 'small' : 'tab'); }catch(e){} }
  function apply(n){ document.documentElement.classList.toggle('ui-pt-small', get(n) === 'small'); }
  function chips(box, n){ if(!box) return; const cur = get(n);
    box.innerHTML = [['tab', '<span class="ui-ptab">3</span>', 'Dark tab'], ['small', '<span class="old">3</span>', 'Small number']].map(([k, mini, label]) =>
      '<button class="chip ui-ptab-pick' + (k === cur ? ' on' : '') + '" data-pt="' + k + '" data-sound="tap"><span class="ui-ptab-mini">' + mini + '</span>' + label + '</button>').join('');
    box.querySelectorAll('[data-pt]').forEach(b => b.onclick = () => { set(n, b.dataset.pt); apply(n); chips(box, n); }); }
  UI.ptab = {get, set, apply, chips};
})();
/* ================= 🏷️ CLASSIC TILE POINTS PICK END (p4c) ================= */
/* ================= 🧑 GAME BUDDY (p6 — the player's avatar beside a game: idle loop + reactions, cached pictures) ================= */
(function(){
  window.UI = window.UI || {};
  const MOODS = ['idle', 'happy', 'joy', 'miss', 'win', 'lose', 'surprise', 'close'];
  const CHOSEN = {};   // player → {mood: [act keys]} — picked once per page so every canvas of that player agrees
  const ric = window.requestIdleCallback ? (f => requestIdleCallback(f, {timeout: 700})) : (f => setTimeout(f, 60));
  function choose(who, per){ const k = who.name || ''; if(CHOSEN[k]) return CHOSEN[k]; const c = {};
    MOODS.forEach(m => { const L = []; for(let i = 0; i < (m === 'idle' ? 3 : per) + 2 && L.length < (m === 'idle' ? 3 : per); i++){ const a = Acting.pick(m, {who: k + '|bd', avoid: L}); if(a && !L.includes(a)) L.push(a); } c[m] = L.length ? L : ['idle']; });
    return (CHOSEN[k] = c); }
  function buddy(cv, who, o){
    o = o || {}; if(!cv || !window.Acting || typeof drawAvatar !== 'function' || !who || !who.av) return null;
    try { if(who.name && !o.noKeep){ const j = JSON.stringify(who.av); if(j.length < 6000) localStorage.setItem('sp_avc:' + who.name, j); } } catch(e){}   // 🚪 24p: the door welcome on the next page
    const set = choose(who, o.per || 2), ready = {}, dpr = Math.min(2, window.devicePixelRatio || 1);
    const st = {act: set.idle[0], until: 0, idleAt: performance.now(), i: 0, timer: null, w: 0, h: 0, shown: ''};
    const opt = (w, h) => ({w, h, n: o.n || 8, loop: o.loop || 1.2, dpr, dir: o.dir || 1});
    const size = () => { const r = cv.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; };
    const key = (a, w, h) => a + '|' + w + 'x' + h;
    function warm(list){ const [w, h] = size(); if(w < 8 || h < 8) return; const todo = list.filter(a => !ready[key(a, w, h)]);
      const step = () => { const a = todo.shift(); if(a == null) return; try{ Acting.frames(who, a, opt(w, h)); ready[key(a, w, h)] = true; }catch(e){} if(todo.length) ric(step); };
      if(todo.length) ric(step); }
    const all = () => [].concat(...MOODS.map(m => set[m]));
    const nextIdle = () => set.idle[(set.idle.indexOf(st.act) + 1) % set.idle.length] || set.idle[0];
    function tick(){
      if(!cv.isConnected){ stop(); return; }
      if(cv.offsetParent === null || document.hidden) return;
      const now = performance.now(), [w, h] = size(); if(w < 8 || h < 8) return;
      if(w !== st.w || h !== st.h){ st.w = w; st.h = h; warm(o.hold ? set[o.hold].concat(set.idle) : all()); }
      if(st.until && now > st.until){ st.until = 0; st.idleAt = now; st.act = nextIdle(); st.i = 0; }
      else if(!st.until && now - st.idleAt > (o.idleMs || 6500)){ st.idleAt = now; st.act = nextIdle(); st.i = 0; }
      let a = st.act; if(!ready[key(a, w, h)]) a = set.idle.find(x => ready[key(x, w, h)]); if(a == null) return;
      const fr = Acting.frames(who, a, opt(w, h)), f = fr[st.i++ % fr.length]; st.shown = a;
      if(cv.width !== f.width || cv.height !== f.height){ cv.width = f.width; cv.height = f.height; }
      const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); g.drawImage(f, 0, 0);
    }
    function react(kind, ms){ const L = set[kind] || []; const [w, h] = size(); const okL = L.filter(a => ready[key(a, w, h)]); if(!okL.length) return false;
      const cur = okL.indexOf(st.act); st.act = okL[(cur + 1) % okL.length]; st.until = performance.now() + (ms || 1800); st.i = 0; tick(); return st.act; }
    function stop(){ clearInterval(st.timer); st.timer = null; }
    if(o.hold){ st.act = set[o.hold][0]; st.until = Infinity; }
    st.timer = setInterval(tick, 1000 / (o.fps || 8)); setTimeout(tick, 0);
    return {react, stop, state: st, moods: set, isReady: a => { const [w, h] = size(); return !!ready[key(a, w, h)]; }};
  }
  UI.buddy = buddy;
})();
/* ================= 🧑 GAME BUDDY END (p6) ================= */
/* ================= 🏷️ RACK TAB SIZE (24e2) =================
   Sets --rt-w = the width of the first .rt tile on every element that holds .rt tiles (racks), so `.rt > .pt` (the 🏷️ point tab)
   can be sized from the rack tile itself. A ResizeObserver per rack (rotate / resize) + a light MutationObserver (new racks). Off: window.UI_RACKTAB = false. */
(function(){
  if(window.UI_RACKTAB === false || !window.ResizeObserver || !window.MutationObserver) return;
  const seen = new WeakSet(), put = el => { const t = el.querySelector(':scope > .rt'); if(!t) return; const w = t.offsetWidth; if(w > 4) el.style.setProperty('--rt-w', w.toFixed(1) + 'px'); };
  const ro = new ResizeObserver(es => es.forEach(e => put(e.target)));
  let q = 0; const scan = () => { q = 0; document.querySelectorAll('.rt').forEach(t => { const p = t.parentElement; if(!p) return; if(!seen.has(p)){ seen.add(p); ro.observe(p); } put(p); }); };
  const soon = () => { if(!q) q = requestAnimationFrame(scan); };
  const go = () => { scan(); new MutationObserver(ms => { for(const m of ms) for(const n of m.addedNodes) if(n.nodeType === 1 && (n.classList.contains('rt') || (n.querySelector && n.querySelector('.rt')))) return soon(); }).observe(document.body, {childList: true, subtree: true}); };
  if(document.body) go(); else document.addEventListener('DOMContentLoaded', go);
})();
/* ================= 🏷️ RACK TAB SIZE END ================= */
/* ================= 🪑 TABLE SCENE (24h) =================
   Board games seat the players at a table instead of a bench (Aowu 2026-11-16 08:56 + his picture 12:59 + 13:17 "take some 2.5D from IsoKit" + 13:28 "room corner").
   Same 2:1 diamond as IsoKit (sx = (x − y)·TW/2 · sy = (x + y)·TH/2 − z): a room corner (two walls, plank floor, skirting), a rainbow rug,
   a wooden table with the board (grid + coloured squares) and a few tiles on it, a chair per player, ⏳ hourglass on the side whose turn it is,
   pink ▼ over the current player. 2 players face each other across the table; 3–4 = a second chair on each side.
   People: the comic table poses from AvatarActing (`comic.sit-table`, the current player reaches in with `comic.move-piece`), clipped at the seat + legs drawn
   over the chair; a robot = its emoji, bobbing on its turn; `away` = 💨 on an empty chair. Window + book shelf on wide strips.
   API: seats = UI.tableScene.draw(g, w, h, players [{name, bot, icon, away}], cur, t, {emo(g, ch, x, y, size), av(name)}) → [{i, x, y}] (seat points, e.g. for 📡 bubbles).
   Off: window.UI_TABLE = false (the game keeps its old bench). */
(function(){
  window.UI = window.UI || {};
  const TW = 64, TH = 32;
  function draw(g, w, h, ps, cur, t, o){
    o = o || {};
    const T = 1.6;                                            // table size in tiles (square → a diamond on screen)
    const u = Math.min(w * 0.5 / (T * TW), h / (0.8 * T * TH + 135));   // zoom: the table diamond ≈ 40 % of the strip wide, everyone fits in the height
    const R = T * 1.6, ox = w / 2, oy = h * 0.975 - R * TH / 2 * u;
    const P = (x, y, z) => [ox + (x - y) * TW / 2 * u, oy + (x + y) * TH / 2 * u - (z || 0) * u];
    const poly = (pts, c) => { g.fillStyle = c; g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fill(); };
    const box = (x, y, bw, bd, bh, top, left, right, z) => { z = z || 0;
      poly([P(x, y + bd, z), P(x + bw, y + bd, z), P(x + bw, y + bd, z + bh), P(x, y + bd, z + bh)], left);
      poly([P(x + bw, y, z), P(x + bw, y + bd, z), P(x + bw, y + bd, z + bh), P(x + bw, y, z + bh)], right);
      poly([P(x, y, z + bh), P(x + bw, y, z + bh), P(x + bw, y + bd, z + bh), P(x, y + bd, z + bh)], top); };
    // 🏠 room corner (Aowu 13:28): two walls meeting behind the table + a plank floor, in the same 2:1 diamond
    const E = Math.max(1.4, (oy - h * 0.32) / (TH * u)), F = 60;   // back corner (−E, −E) · far end of the floor (off the strip)
    poly([P(-E, -E), P(F, -E), P(F, F), P(-E, F)], '#CFA06A');   // floor
    g.strokeStyle = 'rgba(110,65,25,.22)'; g.lineWidth = Math.max(0.6, u * 1.2);
    for(let i = -E; i < F; i += 0.5){ const A = P(i, -E), B = P(i, F); g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke(); }   // planks
    const WH = 400;   // walls up past the top of the strip
    poly([P(-E, -E), P(-E, F), P(-E, F, WH), P(-E, -E, WH)], '#F6E3C4');   // left wall
    poly([P(-E, -E), P(F, -E), P(F, -E, WH), P(-E, -E, WH)], '#FBEEDA');   // right wall (lighter = the window side)
    const cn = P(-E, -E); g.strokeStyle = 'rgba(160,110,60,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cn[0], cn[1]); g.lineTo(cn[0], 0); g.stroke();   // the corner line
    poly([P(-E, -E), P(-E, F), P(-E + 0.04, F, 6), P(-E + 0.04, -E, 6)], '#C99A68'); poly([P(-E, -E), P(F, -E), P(F, -E + 0.04, 6), P(-E, -E + 0.04, 6)], '#D8AB78');   // skirting boards
    if(w > 1.5 * h){   // a window on the right wall, a shelf with books on the left wall
      const wz = 70, wl = 1.1; poly([P(0.4, -E, wz), P(0.4 + wl, -E, wz), P(0.4 + wl, -E, wz + 60), P(0.4, -E, wz + 60)], '#FFFFFF');
      g.strokeStyle = '#E0C9A4'; g.lineWidth = Math.max(1, u * 3); [[P(0.4 + wl / 2, -E, wz), P(0.4 + wl / 2, -E, wz + 60)], [P(0.4, -E, wz + 30), P(0.4 + wl, -E, wz + 30)]].forEach(([A, B]) => { g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke(); });
      poly([P(-E, 0.9, 60), P(-E, 2.3, 60), P(-E + 0.25, 2.3, 60), P(-E + 0.25, 0.9, 60)], '#B07A45');
      ['#5B8DEF', '#E76F51', '#8AB17D', '#F4A261', '#C8A2E8'].forEach((c, i) => { const y0 = 1.0 + i * 0.25, ht = 26 + (i % 2) * 6; poly([P(-E + 0.04, y0, 60), P(-E + 0.04, y0 + 0.18, 60), P(-E + 0.04, y0 + 0.18, 60 + ht), P(-E + 0.04, y0, 60 + ht)], c); });
    }
    // 🟥 rug: a diamond of colour bands under the table
    const cols = ['#E76F51', '#F4A261', '#E9C46A', '#8AB17D', '#2A9D8F', '#6C8EBF'];
    for(let i = 0; i < cols.length; i++){ const a = -R / 2 + i * R / cols.length, b = a + R / cols.length; g.globalAlpha = 0.7; poly([P(a, -R / 2), P(b, -R / 2), P(b, R / 2), P(a, R / 2)], cols[i]); } g.globalAlpha = 1;
    const H = 40;                                             // table height (iso px)
    const legs = () => { const l = 0.14; [[-T / 2 + 0.06, -T / 2 + 0.06], [T / 2 - 0.2, -T / 2 + 0.06], [-T / 2 + 0.06, T / 2 - 0.2], [T / 2 - 0.2, T / 2 - 0.2]].forEach(([x, y]) => box(x, y, l, l, H - 6, '#8C5A2E', '#7A4E28', '#6A4222')); };
    const top = () => { box(-T / 2, -T / 2, T, T, 6, '#B98049', '#9C6B3C', '#875C33', H - 6);
      // the board on the table: a diamond with a grid + coloured squares
      const b = T * 0.36, z = H + 0.6, q = (x, y) => P(x, y, z);
      poly([q(-b, -b), q(b, -b), q(b, b), q(-b, b)], '#F4E3C3');
      const n = 9, st = 2 * b / n; [[1, 1, '#E05A4F'], [4, 4, '#F7C948'], [7, 2, '#5B8DEF'], [2, 6, '#F08DB0'], [6, 7, '#7FC8F8'], [0, 8, '#E05A4F'], [8, 0, '#E05A4F']].forEach(([i, j, c]) => poly([q(-b + i * st, -b + j * st), q(-b + (i + 1) * st, -b + j * st), q(-b + (i + 1) * st, -b + (j + 1) * st), q(-b + i * st, -b + (j + 1) * st)], c));
      g.strokeStyle = 'rgba(80,50,20,.3)'; g.lineWidth = Math.max(0.4, u * 0.8);
      for(let i = 0; i <= n; i++){ let A = q(-b + i * st, -b), B = q(-b + i * st, b); g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke(); A = q(-b, -b + i * st); B = q(b, -b + i * st); g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke(); }
      // a few tiles in front of each player (small boxes)
      for(let i = 0; i < 3; i++){ box(-T / 2 + 0.08, -0.3 + i * 0.22, 0.16, 0.16, 3, '#FBEFD3', '#E4CFA6', '#D6BE92', H); box(T / 2 - 0.24, -0.3 + i * 0.22, 0.16, 0.16, 3, '#FBEFD3', '#E4CFA6', '#D6BE92', H); }
    };
    // ⏳ hourglass on the current player's side of the board
    const n2 = ps.length, sideOf = i => (n2 <= 2 ? (i === 0 ? -1 : 1) : (i % 2 ? 1 : -1));
    const hour = () => { const sd = sideOf(cur), [hx, hy] = P(sd * T * 0.36, -sd * T * 0.36, H), hh = 22 * u, hw = 10 * u, f = (t * 0.25) % 1;
      g.fillStyle = '#C8A2E8'; g.fillRect(hx - hw / 2 - 1, hy - hh - 2 * u, hw + 2, 3 * u); g.fillRect(hx - hw / 2 - 1, hy - 2 * u, hw + 2, 3 * u);
      g.fillStyle = 'rgba(225,242,255,.9)'; g.beginPath(); g.moveTo(hx - hw / 2, hy - hh); g.lineTo(hx + hw / 2, hy - hh); g.lineTo(hx + 1, hy - hh / 2); g.lineTo(hx + hw / 2, hy - 2 * u); g.lineTo(hx - hw / 2, hy - 2 * u); g.lineTo(hx - 1, hy - hh / 2); g.closePath(); g.fill();
      g.fillStyle = '#F4A261'; const a = (1 - f) * hh * 0.38, b2 = f * hh * 0.38; g.beginPath(); g.moveTo(hx - hw * 0.45 * a / (hh * 0.4), hy - hh / 2 - a); g.lineTo(hx + hw * 0.45 * a / (hh * 0.4), hy - hh / 2 - a); g.lineTo(hx, hy - hh / 2); g.closePath(); g.fill();
      g.fillRect(hx - hw / 2 + 1, hy - 2 * u - b2, hw - 2, b2); };
    // seats: left corner of the diamond (screen left) and right corner (screen right); 3–4 players → second chair behind / in front
    const seatW = 0.55, seats = ps.map((P0, i) => { const sd = sideOf(i), row = n2 <= 2 ? 0 : Math.floor(i / 2), off = T / 2 + 0.42, sh = (row ? 0.75 : 0) * (sd < 0 ? 1 : -1);
      return {P: P0, i, sd, wx: sd * off + sh, wy: -sd * off + sh}; });
    const chairs = (front) => seats.forEach(S => { const back = S.sd < 0; if(back === front) return;
      const H2 = 22, x = S.wx - seatW / 2, y = S.wy - seatW / 2;
      // back rest on the far side from the table
      if(S.sd < 0) box(x - 0.08, y, 0.1, seatW, H2 + 26, '#A8723F', '#8C5A2E', '#7A4E28'); else box(x + seatW, y, 0.1, seatW, H2 + 26, '#A8723F', '#8C5A2E', '#7A4E28');
      box(x, y, seatW, seatW, 5, '#C58A52', '#A3703F', '#8E6035', H2 - 5); box(x + 0.04, y + seatW - 0.1, 0.07, 0.07, H2 - 5, '#7A4E28', '#6A4222', '#5C391D'); box(x + seatW - 0.1, y + seatW - 0.1, 0.07, 0.07, H2 - 5, '#7A4E28', '#6A4222', '#5C391D'); });
    const people = (front) => seats.forEach(S => { const back = S.sd < 0; if(back === front) return;
      const me = S.i === cur, dir = S.sd < 0 ? 1 : -1, [sx, sy] = P(S.wx, S.wy, 22), k = (h * (o.K || 0.5)) / 100;
      if(S.P.away){ const sz = h * 0.26; o.emo(g, '💨', sx, sy - sz * 0.6, sz); return; }   // running along the sentence → empty chair
      if(S.P.bot){ const sz = h * 0.32; o.emo(g, S.P.icon || '🦉', sx + dir * 2 * u, sy - sz * 0.4 - (me ? Math.abs(Math.sin(t * 4)) * 3 : 0), sz); return; }
      const act = me && Math.floor(t / 1.8) % 2 === 0 ? 'comic.move-piece' : 'comic.sit-table';
      g.save(); g.beginPath(); g.rect(0, 0, w, sy + 1); g.clip();
      try { Acting.draw(g, {name: S.P.name, av: o.av(S.P.name), dir}, sx + dir * 2 * u, sy + k * 100 * (o.FYO != null ? o.FYO : 0), k, act, {t, dir}); } catch(e){}
      g.restore();
      const fyy = P(S.wx, S.wy, 0)[1], kx = sx + dir * h * 0.09; g.strokeStyle = '#46507A'; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = Math.max(2, h * 0.045);
      g.beginPath(); g.moveTo(sx - dir * h * 0.01, sy - h * 0.015); g.lineTo(kx, sy - h * 0.015); g.lineTo(kx + dir * h * 0.01, fyy - h * 0.03); g.stroke();
      g.fillStyle = '#2B2F45'; g.beginPath(); g.ellipse(kx + dir * h * 0.035, fyy - h * 0.02, h * 0.04, h * 0.02, 0, 0, 7); g.fill(); });
    // paint back → front: far chairs + people (left side is "back" in this view), table legs + top, then the near side
    chairs(false); people(false); legs(); top(); hour(); chairs(true); people(true);
    const C = seats.find(S => S.i === cur); if(C){ const [ax] = P(C.wx, C.wy, 0); g.fillStyle = '#FF4D8D'; g.beginPath(); g.moveTo(ax - 6, 3); g.lineTo(ax + 6, 3); g.lineTo(ax, 10); g.fill(); }
    return seats.map(S => { const q = P(S.wx, S.wy, 22); return {i: S.i, x: q[0], y: q[1]}; });
  }
  UI.tableScene = {draw};
})();
/* ================= 🪑 TABLE SCENE END ================= */
/* ================= 🕹️ PAD SIZE (pz-1 — ✨ polish chat 2026-11-16; Aowu: "proposed sizes" · "spacing and arrangement" · "appeal, usable, practical") =================
   ONE size + layout rule for every on-screen joystick and button (Game Baseline plan §11c, Run Order 24d).
   • CSS vars on <html>, set by device (screen short side: phone < 500 px · iPad ≥ 700 px · scaled between), recomputed on resize:
       --pad-stick (stick base Ø) · --pad-main (main button Ø) · --pad-btn (other buttons Ø) · --pad-gap (≥ 3 mm) · --pad-edge (≥ 4 mm)
       --pad-safe-l / -r / -b (iPhone notch + home bar) · --pad-hit (hit area grows 6 px past the drawing)
       ✚ arrow cross = ONE movement control (left thumb): --pad-dpad (whole cross, 1.2 × stick) · --pad-arrow (each arrow, ≥ 56 px) · --pad-dgap
     UI.pad.dress(btn, icon, label, rim, main) · UI.pad.fan(box, main, others) + UI.pad.arcAll(root) = the ring for a game's own buttons.
     phone sideways 150 / 92 / 68 px · upright 160 / 92 / 74 · iPad 170 / 96 / 74 · gap 18 (iPad 20) · edge 24 (iPad 26).
     Short phones shrink stick + buttons together (gap + edge stay), never a button below 56 px (≈ 9 mm).
   • 👍 THUMB ARC — UI.pad.arc(box, main, others, {side: 'right' | 'left', lift}) places the buttons absolutely inside `box`:
       main = the biggest, on the corner diagonal · others (≤ 4, most used first) = a tight 🌼 ring around the main, one gap from it and
       from each other (one thumb roll from the main), first = ← left, 2nd = ↑ above, then ↙ / ↗; the main sits in from the corner just
       enough for the ring. opt.fit = the box shrinks to the footprint. UI.pad.stickFor(W, fanW) = the stick size that never touches it. side 'left' = the same mirrored (2nd player). Re-run it on resize (the game's own resize code).
     UI.pad.geo(W, H, n, opt) = the same geometry without the DOM → {cx, cy, R, pts, w, h} (w / h = the footprint from the corner, for keeping
     the play picture clear of the thumbs).
   • 🕹️ UI.pad.stick(stick, zone) — the stick base comes to where the left thumb lands inside `zone` (left-bottom of the play
     area), then slides home when the thumb lifts; the game's own stick code keeps working (the press is handed on).
   • 🎨 shared look: .pz-btn (+ .ic icon + .nm one-word label, --rim colour) · .pz-main (bigger + glow ring) · .pz-down / :active
     (squash + light-up) · .pz-glow (pulse: "press me") · UI.pad.cool(btn, 0…1) (the same cooldown sweep everywhere).
     A game keeps its colours; layout + size + feel are shared. Off: window.UI_PADSIZE = false (vars stay at the phone values).
   • 🌸 pz-2 PETAL RING (Aowu 2026-11-16 14:57 drawing, "go A" 15:01 — Game Baseline plan §11c): UI.pad.arc / fan now draw the other buttons as
     wedges round the main, 2 mm apart (--pad-pgap), every petal touching the main. Slot k = same place in every game: 1 ← · 2 ↖ · 3 ↙ · 4 ↗ ·
     5 → · 6 ↓ (5 + 6 cut straight by the screen edges), mirrored for side 'left' (type 2 = two rings, e.g. Tricks Battle). arc(box, main,
     [b1…b6]) fills slots in order · UI.pad.petals(box, main, [b1, null, b3 …]) leaves a slot empty without moving the others (Brawl 1v1: no 🔁).
     👆 Every .pz-btn reacts while held: fills with its colour, white rim, sinks toward the main, glow + tiny click + buzz (UI_PADCLICK = false = silent).
     UI.pad.petalGeo(W, H, slots, opt) = the geometry without the DOM · stickFor keeps the stick clear of the ring (narrow upright phones shrink
     the petals, never below 56 px deep). Off: window.UI_PETALS = false or opt.round → the round 🌼 ring. */
(function(){
  if(!window.UI) return;
  const PH_L = {stick: 150, main: 92, btn: 68, gap: 18, edge: 24}, PH_P = {stick: 160, main: 92, btn: 74, gap: 18, edge: 24}, PAD = {stick: 170, main: 96, btn: 74, gap: 20, edge: 26};
  const MIN_BTN = 56;
  let probe = null;
  function safe(){
    try{ if(!probe){ probe = document.createElement('div'); probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px);'; (document.body || document.documentElement).appendChild(probe); }
      const cs = getComputedStyle(probe); return {l: parseFloat(cs.paddingLeft) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0};
    }catch(e){ return {l: 0, r: 0, b: 0}; }
  }
  function sizes(w, h){
    w = w || innerWidth; h = h || innerHeight; const s = Math.min(w, h), land = w > h;
    const t = Math.max(0, Math.min(1, (s - 500) / 200)), P = land ? PH_L : PH_P, o = {};
    Object.keys(P).forEach(k => { o[k] = P[k] + (PAD[k] - P[k]) * t; });
    if(t === 0){ const f = Math.max(0.78, Math.min(1, s / (land ? 430 : 400)));   // short phones: stick + buttons shrink together, gap + edge stay
      ['stick', 'main', 'btn'].forEach(k => { o[k] *= f; }); }
    o.btn = Math.max(MIN_BTN, o.btn); o.main = Math.max(MIN_BTN + 8, o.main); o.stick = Math.max(110, o.stick);
    Object.keys(o).forEach(k => { o[k] = Math.round(o[k]); });
    o.dgap = 6; o.dpad = Math.round(Math.max(o.stick * 1.2, 3 * MIN_BTN + 2 * o.dgap)); o.arrow = Math.floor((o.dpad - 2 * o.dgap) / 3);   // ✚ arrow cross = ONE movement control
    o.mm = 6.4 - 1.2 * t; o.pgap = Math.round(2 * o.mm);   // 🌸 pz-2: CSS px per mm (phones ≈ 6.4, iPad ≈ 5.2) · petal gap = 2 mm (Aowu 14:57)
    o.hit = 6; o.cls = t === 0 ? (land ? 'phoneL' : 'phoneP') : t === 1 ? 'ipad' : 'mid'; return o;
  }
  let last = '';
  function apply(){
    if(window.UI_PADSIZE === false) return null;
    const o = sizes(), sa = safe(), k = JSON.stringify([o, sa]); if(k === last) return o; last = k;
    const st = document.documentElement.style;
    ['stick', 'main', 'btn', 'gap', 'edge', 'hit', 'dpad', 'arrow', 'dgap', 'pgap'].forEach(n => st.setProperty('--pad-' + n, o[n] + 'px'));
    st.setProperty('--pad-safe-l', sa.l + 'px'); st.setProperty('--pad-safe-r', sa.r + 'px'); st.setProperty('--pad-safe-b', sa.b + 'px');
    document.documentElement.dataset.pad = o.cls; return o;
  }
  const px = n => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad-' + n)) || sizes()[n];
  // 👍 the thumb arc: angles in screen degrees (180 = left of the main, 90 = straight above), mirrored for side 'left'
  //   geo(W, H, n, opt) = the pure geometry (no DOM): centres of the main + n others, and the footprint {w, h} from the corner
  function geo(W, H, n, opt){
    // 🌼 a ring around the MAIN button (pz-1 v3, Aowu 02:43 "lob too spread out, power too high"): every other button one gap away from
    // the main and from its neighbours, the ring centred on the corner diagonal; the main moves in from the corner just enough that the
    // ring keeps ≥ --pad-edge from both screen edges. Places: n = 1 ↖ · 2 ← ↑ · 3 ← ↑ ↖ · 4 ← ↑ ↙ ↗ (most used first = the easiest reach).
    opt = opt || {}; const sa = opt.noSafe ? {l: 0, r: 0, b: 0} : safe(), right = opt.side !== 'left';
    const m = opt.main || px('main'), b = opt.btn || px('btn'), g = px('gap'), e = px('edge'), lift = opt.lift || 0, D = Math.PI / 180;
    const R = m / 2 + g + b / 2, step = n > 1 ? 2 * Math.asin(Math.min(1, (b + g) / (2 * R))) / D : 0, hi = 135 + step * (n - 1) / 2;
    const ang = []; for(let i = 0; i < n; i++) ang.push(n === 1 ? (opt.a1 == null ? 135 : opt.a1) : hi - step * i);   // opt.a1 = the single button's place (90 = straight above, for narrow side panels)   // left-low → up-right along the ring
    const PICK = {1: [0], 2: [0, 1], 3: [0, 2, 1], 4: [1, 2, 0, 3]}[n] || ang.map((x, i) => i);   // which ring place the 1st, 2nd … button gets
    let offR = m / 2, offB = m / 2; ang.forEach(a => { offR = Math.max(offR, b / 2 + R * Math.cos(a * D)); offB = Math.max(offB, b / 2 - R * Math.sin(a * D)); });
    const px0 = right ? W - sa.r : sa.l, py0 = H - sa.b - lift, ox = e + Math.max(offR, m * 0.58), oy = e + Math.max(offB, m * 0.58);
    const cx = right ? px0 - ox : px0 + ox, cy = py0 - oy;
    const pts = PICK.map(k => { const a = ang[k], dx = Math.cos(a * D) * R; return {x: right ? cx + dx : cx - dx, y: cy - Math.sin(a * D) * R, a}; });
    let minX = cx - m / 2, maxX = cx + m / 2, minY = cy - m / 2; pts.forEach(p => { minX = Math.min(minX, p.x - b / 2); maxX = Math.max(maxX, p.x + b / 2); minY = Math.min(minY, p.y - b / 2); });
    return {cx, cy, R, main: m, btn: b, gap: g, edge: e, pts, w: Math.ceil(right ? W - minX : maxX), h: Math.ceil(H - minY)};
  }
  // the stick shrinks only when it would touch the right-thumb group (narrow upright phones): ≥ 120 px, one gap away — stickFor is in the 🌸 petal block below
  function arcRound(box, main, others, opt){
    opt = opt || {}; apply(); if(!box || !main) return null; others = (others || []).filter(Boolean);
    const o = Object.assign({}, opt, {main: main.offsetWidth || px('main'), btn: others.length ? Math.max(...others.map(x => x.offsetWidth || px('btn'))) : px('btn')});
    if(opt.fit){ const F = geo(4000, 4000, others.length, o); box.style.width = F.w + 'px'; box.style.height = F.h + 'px'; }   // the box = just the footprint, anchored in its corner
    const G = geo(box.clientWidth, box.clientHeight, others.length, o);
    const place = (el, x, y) => { const w = el.offsetWidth, h = el.offsetHeight; el.style.position = 'absolute'; el.style.right = el.style.bottom = 'auto';
      el.style.left = Math.round(x - w / 2) + 'px'; el.style.top = Math.round(y - h / 2) + 'px'; el.style.margin = '0'; };
    place(main, G.cx, G.cy); others.forEach((el, i) => place(el, G.pts[i].x, G.pts[i].y));
    homeSoon(); return G;
  }
  // 🌸 pz-2 PETAL RING (Aowu 14:57 drawing + "go A" 15:01): the other buttons are wedges round the main, 2 mm apart, every petal touches the
  // main; slot k always sits in the same place (1 ← · 2 ↖ · 3 ↙ · 4 ↗ · 5 → · 6 ↓, mirrored for side 'left'); 5 + 6 are cut straight by the
  // screen edges (the corner Aowu circled). An empty slot keeps its place. Off: window.UI_PETALS = false (the round 🌼 ring of pz-1 comes back).
  const SLOTS = {1: [150, 210], 2: [90, 150], 3: [210, 270], 4: [30, 90], 5: [-30, 30], 6: [-90, -30]};
  const petalsOn = () => window.UI_PETALS !== false;
  // clip a polygon to the rectangle x0..x1 × y0..y1 (Sutherland–Hodgman)
  function clipRect(P, x0, y0, x1, y1){
    const edge = (pts, inside, cut) => { const out = []; for(let i = 0; i < pts.length; i++){ const a = pts[i], b = pts[(i + 1) % pts.length], ia = inside(a), ib = inside(b);
      if(ia) out.push(a); if(ia !== ib) out.push(cut(a, b)); } return out; };
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    P = edge(P, p => p[0] >= x0, (a, b) => lerp(a, b, (x0 - a[0]) / (b[0] - a[0])));
    P = edge(P, p => p[0] <= x1, (a, b) => lerp(a, b, (x1 - a[0]) / (b[0] - a[0])));
    P = edge(P, p => p[1] >= y0, (a, b) => lerp(a, b, (y0 - a[1]) / (b[1] - a[1])));
    P = edge(P, p => p[1] <= y1, (a, b) => lerp(a, b, (y1 - a[1]) / (b[1] - a[1])));
    return P;
  }
  // petalGeo(W, H, slots, opt) → {cx, cy, r0, r1, gap, w, h, petals: {k: {pts, box: {x, y, w, h}, d (path inside its box), lx, ly, a}}}
  //   slots = list of slot numbers in use · opt.side 'left' · opt.main / opt.btn (px) · opt.a1 (one petal centred on that angle) · opt.maxW
  function petalGeo(W, H, slots, opt){
    opt = opt || {}; const right = opt.side !== 'left', sa = opt.noSafe ? {l: 0, r: 0, b: 0} : safe(), S = sizes(), D = Math.PI / 180;
    const g = S.pgap, e = px('edge'); slots = (slots || []).filter(k => SLOTS[k]);
    let m = opt.main || px('main'), dep = Math.round((opt.btn || px('btn')) * 1.08);
    const shapes = () => { const r0 = m / 2 + g, r1 = r0 + dep, out = {};   // every petal around (0, 0), x toward the screen edge = +, y down = +
      slots.forEach(k => { let [a, b] = SLOTS[k]; if(slots.length === 1 && opt.a1 != null){ a = opt.a1 - 30; b = opt.a1 + 30; }
        const dl = r => Math.asin(Math.min(1, g / 2 / r)) / D, N = 20, pts = [];
        for(let i = 0; i <= N; i++){ const t = (a + dl(r1)) + ((b - dl(r1)) - (a + dl(r1))) * i / N; pts.push([r1 * Math.cos(t * D), -r1 * Math.sin(t * D)]); }
        for(let i = 0; i <= N; i++){ const t = (b - dl(r0)) - ((b - dl(r0)) - (a + dl(r0))) * i / N; pts.push([r0 * Math.cos(t * D), -r0 * Math.sin(t * D)]); }
        out[k] = {pts, a: (a + b) / 2}; });
      // the main sits in from the corner: un-cut petals fit inside the edge margin; 5 (→) and 6 (↓) may be cut by the edge but keep ≥ 0.8 of their depth
      let oR = m * 0.58, oB = m * 0.58; Object.keys(out).forEach(k => { const P = out[k].pts;
        if(+k !== 5) oR = Math.max(oR, ...P.map(q => q[0])); else oR = Math.max(oR, r0 + 0.8 * dep);
        if(+k !== 6) oB = Math.max(oB, ...P.map(q => q[1])); else oB = Math.max(oB, r0 + 0.8 * dep); });
      let L = m / 2, T = m / 2; Object.values(out).forEach(o => o.pts.forEach(q => { L = Math.max(L, -q[0]); T = Math.max(T, -q[1]); }));
      return {r0, r1, out, oR: oR + e, oB: oB + e, w: Math.ceil(oR + e + L), h: Math.ceil(oB + e + T)}; };
    let F = shapes();
    if(opt.maxW > 0){ while(F.w > opt.maxW && dep > 56){ dep--; F = shapes(); } while(F.w > opt.maxW && m > 72){ m--; F = shapes(); } }
    const ox = right ? W - sa.r : sa.l, oy = H - sa.b - (opt.lift || 0), cx = right ? ox - F.oR : ox + F.oR, cy = oy - F.oB;
    const x0 = right ? -1e4 : sa.l + e, x1 = right ? W - sa.r - e : 1e4, y1 = oy - e;
    const petals = {};
    Object.keys(F.out).forEach(k => { const o = F.out[k];
      const P = clipRect(o.pts.map(q => [right ? cx + q[0] : cx - q[0], cy + q[1]]), x0, -1e4, x1, y1); if(P.length < 3) return;
      let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; P.forEach(p => { bx0 = Math.min(bx0, p[0]); by0 = Math.min(by0, p[1]); bx1 = Math.max(bx1, p[0]); by1 = Math.max(by1, p[1]); });
      bx0 = Math.floor(bx0) - 3; by0 = Math.floor(by0) - 3; bx1 = Math.ceil(bx1) + 3; by1 = Math.ceil(by1) + 3;   // 3 px room for the rim stroke
      let A = 0, Cx = 0, Cy = 0; for(let i = 0; i < P.length; i++){ const p = P[i], q = P[(i + 1) % P.length], c = p[0] * q[1] - q[0] * p[1]; A += c; Cx += (p[0] + q[0]) * c; Cy += (p[1] + q[1]) * c; }
      A /= 2; const lx = A ? Cx / (6 * A) : (bx0 + bx1) / 2, ly = A ? Cy / (6 * A) : (by0 + by1) / 2;
      petals[k] = {pts: P, a: right ? o.a : 180 - o.a, box: {x: bx0, y: by0, w: bx1 - bx0, h: by1 - by0}, lx: lx - bx0, ly: ly - by0,
        d: 'M' + P.map(p => (p[0] - bx0).toFixed(1) + ',' + (p[1] - by0).toFixed(1)).join('L') + 'Z'};
    });
    return {cx, cy, r0: F.r0, r1: F.r1, main: m, depth: dep, gap: g, edge: e, petals, w: F.w, h: F.h};
  }
  let footW = 0;   // the last petal ring's width (stickFor keeps the stick clear of it)
  const STICK_MIN = 140;   // 🕹️ pz-3: the stick never goes under 140 px (≈ 22 mm) — on narrow upright phones the 🌸 ring shrinks first
  function maxWFor(){ const sa = safe(); return innerHeight > innerWidth ? innerWidth - STICK_MIN - px('gap') - px('edge') - sa.l : 0; }
  function petalFoot(){ return petalGeo(4000, 4000, [1, 2, 3, 4, 5, 6], {maxW: maxWFor()}).w; }
  function stickFor(W, fanW){ const sa = safe(), e = px('edge'), g = px('gap'); if(petalsOn() && footW && footW.k === innerWidth + 'x' + innerHeight) fanW = Math.max(fanW || 0, footW.v);   // pz-3: only this screen's ring (a turn never keeps the old one)
    return Math.max(STICK_MIN, Math.min(px('stick'), Math.floor(W - fanW - g - e - sa.l))); }
  const NS = 'http://www.w3.org/2000/svg';
  function petalize(el, P, rightSide){
    if(!el.__pzSz) el.__pzSz = el.offsetWidth || px('btn');
    el.classList.add('pz-btn', 'pz-pet'); el.classList.remove('pz-main');
    let sv = el.querySelector(':scope > svg.pz-shape'); if(!sv){ sv = document.createElementNS(NS, 'svg'); sv.setAttribute('class', 'pz-shape'); sv.innerHTML = '<path class="pz-pf"></path>'; el.insertBefore(sv, el.firstChild); }
    const B = P.box; sv.setAttribute('width', B.w); sv.setAttribute('height', B.h); sv.setAttribute('viewBox', '0 0 ' + B.w + ' ' + B.h); sv.firstChild.setAttribute('d', P.d);
    const s = el.style; s.position = 'absolute'; s.right = s.bottom = 'auto'; s.margin = '0'; s.left = B.x + 'px'; s.top = B.y + 'px'; s.width = B.w + 'px'; s.height = B.h + 'px';
    const D = Math.PI / 180; s.setProperty('--sz', Math.round(Math.min(el.__pzSz, Math.max(56, Math.min(B.w, B.h) * 0.9))) + 'px');
    s.setProperty('--lx', (P.lx - B.w / 2).toFixed(1) + 'px'); s.setProperty('--ly', (P.ly - B.h / 2).toFixed(1) + 'px');
    s.setProperty('--sx', (-Math.cos(P.a * D) * 4).toFixed(1) + 'px'); s.setProperty('--sy', (Math.sin(P.a * D) * 4).toFixed(1) + 'px');
    s.setProperty('--pd', "path('" + P.d + "')"); el.dataset.slot = P.k; el.__pzPts = P.pts.map(q => [q[0] - B.x, q[1] - B.y]);
  }
  function unpetal(el){ if(!el || !el.classList.contains('pz-pet')) return; el.classList.remove('pz-pet'); const sv = el.querySelector(':scope > svg.pz-shape'); if(sv) sv.remove();
    ['width', 'height', '--sz', '--lx', '--ly', '--sx', '--sy', '--pd'].forEach(p => el.style.removeProperty(p)); delete el.dataset.slot; }
  // petals(box, main, slots, opt): slots = [el or null, …] for slot 1, 2, … (null = empty, keeps its place) — the game's own listeners stay
  function petals(box, main, slots, opt){
    opt = opt || {}; apply(); if(!box || !main) return null; slots = (slots || []).slice(0, 6);
    const used = []; slots.forEach((el, i) => { if(el) used.push(i + 1); });
    if(!main.__pzSz) main.__pzSz = main.offsetWidth || px('main');
    const o = Object.assign({}, opt, {main: main.__pzSz, btn: Math.max(56, ...slots.filter(Boolean).map(x => x.__pzSz || x.offsetWidth || px('btn'))), maxW: opt.maxW != null ? opt.maxW : maxWFor()});
    if(opt.fit){ const F = petalGeo(4000, 4000, used, o); box.style.width = F.w + 'px'; box.style.height = F.h + 'px'; }
    const G = petalGeo(box.clientWidth, box.clientHeight, used, o); footW = {k: innerWidth + 'x' + innerHeight, v: Math.max(G.w, footW && footW.k === innerWidth + 'x' + innerHeight ? footW.v : 0)};
    const mz = Math.round(G.main); main.classList.add('pz-btn', 'pz-main'); main.style.setProperty('--sz', mz + 'px');
    const ms = main.style; ms.position = 'absolute'; ms.right = ms.bottom = 'auto'; ms.margin = '0'; ms.left = Math.round(G.cx - mz / 2) + 'px'; ms.top = Math.round(G.cy - mz / 2) + 'px'; ms.width = ms.height = mz + 'px';
    slots.forEach((el, i) => { if(!el) return; const P = G.petals[i + 1]; if(!P){ el.style.display = 'none'; return; } P.k = i + 1; el.style.display = ''; petalize(el, P, opt.side !== 'left'); });
    box.classList.add('pz-petals'); homeSoon(); return G;
  }
  function arc(box, main, others, opt){
    if(!petalsOn() || (opt && opt.round)){ (others || []).forEach(unpetal); if(box) box.classList.remove('pz-petals'); return arcRound(box, main, others, opt); }
    return petals(box, main, (others || []).filter(Boolean), opt);
  }
  // 📐 shape helpers (tests + games): UI.pad.shape(el) = the control's outline in screen px (petal = its wedge, round = a circle, else its box);
  //   UI.pad.gap(a, b) = the real gap between two controls (≤ 0 = they touch / overlap) — boxes of petals overlap, their shapes never do
  function shape(el){
    const r = el.getBoundingClientRect();
    if(el.__pzPts && el.classList.contains('pz-pet')) return el.__pzPts.map(p => [r.left + p[0], r.top + p[1]]);
    if(el.classList.contains('pz-btn') || el.classList.contains('tpad') || el.classList.contains('stick') || el.classList.contains('joy')){
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = Math.min(r.width, r.height) / 2, o = []; for(let i = 0; i < 36; i++){ const t = i / 36 * 2 * Math.PI; o.push([cx + R * Math.cos(t), cy + R * Math.sin(t)]); } return o; }
    return [[r.left, r.top], [r.right, r.top], [r.right, r.bottom], [r.left, r.bottom]];
  }
  function inPoly(p, P){ let c = false; for(let i = 0, j = P.length - 1; i < P.length; j = i++){ const a = P[i], b = P[j]; if((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  function segD(p, a, b){ const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0; return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); }
  function polyGap(A, B){ if(A.some(p => inPoly(p, B)) || B.some(p => inPoly(p, A))) return 0; let d = Infinity;
    const run = (X, Y) => X.forEach(p => { for(let i = 0; i < Y.length; i++) d = Math.min(d, segD(p, Y[i], Y[(i + 1) % Y.length])); }); run(A, B); run(B, A); return d; }
  function gap(a, b){ return polyGap(a.nodeType ? shape(a) : a, b.nodeType ? shape(b) : b); }
  // 👆 press reaction for every pad button (Aowu 14:57): lights up while held (+ a tiny click + a short buzz where the phone allows it)
  function pressFx(){
    if(window.__pzPress) return; window.__pzPress = true;
    const on = new Map();
    addEventListener('pointerdown', ev => { const b = ev.target && ev.target.closest && ev.target.closest('.pz-btn'); if(!b) return; b.classList.add('pz-down'); on.set(ev.pointerId, b);
      if(window.UI_PADCLICK !== false){ try{ if(window.UISound && UISound.tap) UISound.tap(); }catch(e){} try{ if(navigator.vibrate) navigator.vibrate(8); }catch(e){} } }, true);
    const up = ev => { const b = on.get(ev.pointerId); if(!b) return; on.delete(ev.pointerId); if(![...on.values()].includes(b)) b.classList.remove('pz-down'); };
    ['pointerup', 'pointercancel'].forEach(t => addEventListener(t, up, true));
  }
  // 🕹️ STICK HOME (pz-3, Aowu 2026-11-16 17:32): both thumbs rest at the same height — the stick's centre moves (CSS `translate`, the game's own
  //   left / bottom stay) to the height of the main button. One stick + one main only (2 players on one screen keep their places); never below the
  //   edge margin, never above 30 % of the screen; the floating stick (UI.pad.stick) drops the offset while a thumb holds it. Off: UI_PADHOME = false.
  const STICK_SEL = '.pads .stick, .tpad, .joy:not(.hidden), .pz-stick';
  function stickHome(){
    if(window.UI_PADHOME === false) return;
    const vis = e => e.offsetParent !== null && e.getBoundingClientRect().width > 4;
    const mains = [...document.querySelectorAll('.pz-main')].filter(vis), sts = [...document.querySelectorAll(STICK_SEL)].filter(vis);
    const clear = s => { if(s.__pzTy){ s.__pzTy = 0; s.style.translate = ''; } };
    if(mains.length !== 1 || sts.length !== 1){ sts.forEach(clear); return; }
    const st = sts[0]; if(st.__pzHeld) return;
    const r = st.getBoundingClientRect(), m = mains[0].getBoundingClientRect(), now = st.__pzTy || 0, sa = safe(), e = px('edge');
    const top0 = r.top - now, bot0 = r.bottom - now; let dy = (m.top + m.height / 2) - (top0 + r.height / 2);
    dy = Math.min(dy, innerHeight - sa.b - e - bot0); dy = Math.max(dy, innerHeight * 0.3 - top0); dy = Math.round(dy);
    if(Math.abs(dy - now) < 2) return; st.__pzTy = dy; st.style.translate = dy ? '0 ' + dy + 'px' : '';
  }
  let homeQ = 0; function homeSoon(){ if(homeQ) return; homeQ = requestAnimationFrame(() => { homeQ = 0; stickHome(); setTimeout(stickHome, 250); }); }
  // 🕹️ floating stick: the base jumps to the thumb inside the zone, the press is handed to the stick's own handlers
  function stick(st, zone, opt){
    opt = opt || {}; if(!st || !zone || st.__pzFloat) return; st.__pzFloat = true;
    let home = null, on = null;
    zone.addEventListener('pointerdown', ev => {
      if(ev.target !== zone || on != null) return; if(ev.pointerType === 'mouse' && !opt.mouse) return;
      st.__pzHeld = true; st.style.translate = '';   // pz-3: the jump uses the real spot (no home offset while held)
      const zr = zone.getBoundingClientRect(), sr = st.getBoundingClientRect(), d = sr.width;
      if(!home) home = {left: st.style.left, top: st.style.top, right: st.style.right, bottom: st.style.bottom, tr: st.style.transition};
      const pr = st.offsetParent ? st.offsetParent.getBoundingClientRect() : {left: 0, top: 0};
      const x = Math.max(zr.left + d / 2, Math.min(zr.right - d / 2, ev.clientX)), y = Math.max(zr.top + d / 2, Math.min(zr.bottom - d / 2, ev.clientY));
      st.style.transition = 'none'; st.style.right = st.style.bottom = 'auto'; st.style.left = (x - d / 2 - pr.left) + 'px'; st.style.top = (y - d / 2 - pr.top) + 'px';
      on = ev.pointerId; ev.preventDefault();
      try{ st.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, cancelable: true, pointerId: ev.pointerId, pointerType: ev.pointerType, isPrimary: ev.isPrimary, clientX: ev.clientX, clientY: ev.clientY, screenX: ev.screenX, screenY: ev.screenY, button: 0, buttons: 1})); }catch(e){}
    });
    const back = ev => { if(ev.pointerId !== on) return; on = null; st.__pzHeld = false; if(st.__pzTy) st.style.translate = '0 ' + st.__pzTy + 'px'; if(!home) return; st.style.transition = 'left .18s ease, top .18s ease';
      st.style.left = home.left; st.style.top = home.top; st.style.right = home.right; st.style.bottom = home.bottom; setTimeout(() => { if(on == null) st.style.transition = home ? home.tr : ''; }, 220); };
    ['pointerup', 'pointercancel'].forEach(t => { st.addEventListener(t, back); window.addEventListener(t, back); });
  }
  // 🎨 dress a game's button in the shared look (keeps its listeners) · 🌼 make a box a ring group · re-place every group on resize
  function dress(b, ic, nm, rim, main){ if(!b) return b; b.classList.add('pz-btn'); if(main) b.classList.add('pz-main'); if(rim) b.style.setProperty('--rim', rim);
    if(ic != null) b.innerHTML = '<span class="ic">' + ic + '</span>' + (nm ? '<span class="nm">' + nm + '</span>' : ''); return b; }
  function fan(box, main, others, opt){ if(!box || !main) return null; box.classList.add('pz-fan'); box.__pzArc = () => arc(box, main, others, Object.assign({fit: true}, opt || {})); return box; }
  function arcAll(root){ (root || document).querySelectorAll('.pz-fan').forEach(b => { if(b.__pzArc && b.offsetParent !== null) b.__pzArc(); }); }
  function cool(btn, frac){ if(!btn) return; let sw = btn.querySelector(':scope > .pz-sweep'); if(!(frac > 0)){ if(sw) sw.remove(); btn.classList.remove('pz-cool'); return; }
    if(!sw){ sw = document.createElement('i'); sw.className = 'pz-sweep'; btn.appendChild(sw); } btn.classList.add('pz-cool'); sw.style.setProperty('--cd', Math.min(1, frac)); }
  function css(){ if(document.getElementById('pz-css')) return; const s = document.createElement('style'); s.id = 'pz-css';
    s.textContent = ':root{--pad-stick:150px;--pad-main:92px;--pad-btn:68px;--pad-gap:18px;--pad-edge:24px;--pad-hit:6px;--pad-dpad:180px;--pad-arrow:56px;--pad-dgap:6px;--pad-safe-l:0px;--pad-safe-r:0px;--pad-safe-b:0px;}'
      + '.pz-btn{--rim:#FFFFFF;--sz:var(--pad-btn);position:absolute;width:var(--sz);height:var(--sz);border-radius:50%;border:none;padding:0;margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;'
      + 'color:#fff;font-family:"Fredoka",sans-serif;cursor:pointer;pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;'
      + 'background:radial-gradient(circle at 50% 35%,rgba(255,255,255,0.28),rgba(14,24,48,0.9) 62%);box-shadow:inset 0 0 0 4px var(--rim),inset 0 -6px 0 rgba(0,0,0,0.28),0 6px 0 rgba(0,0,0,0.3),0 10px 16px rgba(0,0,0,0.25);transition:transform .08s ease,box-shadow .08s ease,filter .08s ease;}'
      + '.pz-btn::before{content:"";position:absolute;inset:calc(-1 * var(--pad-hit));border-radius:50%;}'
      + '.pz-btn.pz-main{--sz:var(--pad-main);box-shadow:inset 0 0 0 5px var(--rim),inset 0 -7px 0 rgba(0,0,0,0.28),0 0 0 3px rgba(255,255,255,0.18),0 0 18px var(--rim),0 7px 0 rgba(0,0,0,0.3),0 12px 18px rgba(0,0,0,0.25);}'
      + '.pz-btn .ic{font-size:calc(var(--sz) * 0.4);line-height:1;pointer-events:none;}'
      + '.pz-btn .nm{font-size:max(10px,calc(var(--sz) * 0.15));font-weight:700;line-height:1;margin-top:2px;letter-spacing:.2px;text-shadow:0 1px 0 rgba(0,0,0,0.5);white-space:nowrap;pointer-events:none;}'
      + '.pz-btn.pz-down,.pz-btn:active{transform:translateY(4px) scale(.93);filter:brightness(1.3);box-shadow:inset 0 0 0 4px var(--rim),inset 0 -2px 0 rgba(0,0,0,0.28),0 1px 0 rgba(0,0,0,0.3),0 0 18px var(--rim);}'
      + '.pz-btn.pz-glow{animation:pz-glow .8s ease-in-out infinite;}'
      + '@keyframes pz-glow{50%{transform:scale(1.07);box-shadow:inset 0 0 0 4px #FFF,0 0 0 4px var(--rim),0 0 24px var(--rim),0 6px 0 rgba(0,0,0,0.3);}}'
      + '.pz-btn .pz-sweep{position:absolute;inset:0;border-radius:50%;pointer-events:none;background:conic-gradient(rgba(10,14,30,0.62) calc(var(--cd,0) * 360deg),transparent 0);}'
      + '.pz-btn.pz-cool{filter:saturate(.6);}'
      + '.pz-fan{position:relative;display:block;flex:0 0 auto;}'
      + 'html .pz-btn.pz-pet{background:none!important;box-shadow:none!important;border:0!important;border-radius:0!important;padding:0!important;pointer-events:none;filter:none;transition:transform .07s ease;}'
      + '.pz-btn.pz-pet::before{display:none;}'
      + '.pz-pet>svg.pz-shape{position:absolute;left:0;top:0;overflow:visible;pointer-events:none;transition:filter .07s ease;}'
      + '.pz-pet .pz-pf{pointer-events:visiblePainted;fill:rgba(14,24,48,0.9);stroke:var(--rim);stroke-width:4;stroke-linejoin:round;transition:fill .07s ease,fill-opacity .07s ease;}'
      + '.pz-pet>span{position:relative;transform:translate(var(--lx,0px),var(--ly,0px));z-index:1;}'
      + 'html .pz-btn.pz-pet.pz-down,html .pz-btn.pz-pet:active{transform:translate(var(--sx,0px),var(--sy,0px));box-shadow:none!important;filter:none;}'
      + '.pz-pet.pz-down .pz-pf,.pz-pet:active .pz-pf{fill:var(--rim);fill-opacity:.78;stroke:#fff;stroke-width:5;}'
      + '.pz-pet.pz-down>svg.pz-shape,.pz-pet:active>svg.pz-shape{filter:drop-shadow(0 0 9px var(--rim));}'
      + '.pz-pet.pz-glow{animation:none;}.pz-pet.pz-glow .pz-pf{animation:pz-pglow .8s ease-in-out infinite;}@keyframes pz-pglow{50%{stroke:#fff;stroke-width:6;fill:var(--rim);fill-opacity:.35;}}'
      + '.pz-pet .pz-sweep{border-radius:0;clip-path:var(--pd);}'
      + '.pz-pet.pz-cool{filter:saturate(.6);}'
      + '.pz-btn.pz-main.pz-down{background:radial-gradient(circle at 50% 40%,rgba(255,255,255,0.55),var(--rim) 72%);}';
    { const at = document.getElementById('ui-applogo-css') || document.getElementById('ui-tx-css'); if(at && at.parentNode) at.parentNode.insertBefore(s, at); else (document.head || document.documentElement).appendChild(s); }   /* 📏 s3: before the core sheets that came after it in one UiKit */ }
  css(); apply(); pressFx();
  addEventListener('resize', () => apply(), true); addEventListener('orientationchange', () => setTimeout(apply, 60));
  if(window.ResizeObserver) try{ new ResizeObserver(() => apply()).observe(document.documentElement); }catch(e){}
  UI.pad = {sizes, apply, px, geo, arc, arcRound, petals, petalGeo, SLOTS, shape, gap, polyGap, stickHome, STICK_MIN, stick, stickFor, dress, fan, arcAll, cool, safe};
})();
/* ================= 🕹️ PAD SIZE END ================= */
