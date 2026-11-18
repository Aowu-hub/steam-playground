
SciLab.css('quantum', "/* 📏 s2c quantum#16 */\n  .pick.soonpick{opacity:.6;filter:saturate(.5);} .pick.soonpick .nm::after{content:' 🔜';}\n/* 📏 s2c quantum#17 */\n  .am-now{font-weight:900;font-size:clamp(.85rem,.6vw + .9vh,1.2rem);border-radius:12px;padding:3px 12px;background:rgba(255,255,255,0.1);color:#FFE08A;}\n/* 📏 s2c quantum#18 */\n  .am-row.hide{display:none;}\n/* 📏 s2c quantum#19 */\n  .led-stage{display:flex;align-items:stretch;justify-content:center;gap:clamp(10px,3vw,40px);padding:4px 0;}\n/* 📏 s2c quantum#20 */\n  .ladder .elec{position:absolute;right:10px;width:clamp(26px,5vmin,40px);height:clamp(26px,5vmin,40px);transition:top .45s cubic-bezier(.5,0,.6,1.4);pointer-events:none;z-index:2;}\n  .bulbbox{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;}\n/* 📏 s2c quantum#21 */\n  .bulb-legs{width:40%;height:clamp(14px,3vmin,26px);border-left:5px solid #9AA6B8;border-right:5px solid #9AA6B8;margin-top:-6px;}\n  .bulbbox small{font-weight:900;color:#C9D6EA;font-size:clamp(.72rem,1.4vmin,.95rem);text-align:center;}\n  .photon{position:absolute;font-size:clamp(18px,3.4vmin,30px);pointer-events:none;animation:photon .6s ease-out forwards;z-index:3;}\n/* 📏 s2c quantum#22 */\n  .legend2 .rb{background:linear-gradient(90deg,#FF3B30,#FF9500,#FFD60A,#34C759,#0A84FF,#AF52DE);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.6);}\n  .chips2{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;}\n/* 📏 s2c quantum#23 */\n  .holdbtn{touch-action:none;user-select:none;}\n  .holdbtn.down{transform:translateY(2px);filter:brightness(1.2);}\n/* 📏 s2c quantum#24 */\n  .cats div.aw{background:rgba(255,200,69,0.35);}\n/* 📏 s2c quantum#25 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx{--gl-ts:-1.5px -1.5px 0 var(--gl-ink),1.5px -1.5px 0 var(--gl-ink),-1.5px 1.5px 0 var(--gl-ink),1.5px 1.5px 0 var(--gl-ink),0 2px 0 var(--gl-ink),0 -2px 0 var(--gl-ink),2px 0 0 var(--gl-ink),-2px 0 0 var(--gl-ink),0 0 10px var(--gl-g1),0 0 22px var(--gl-g2);\n    --gl-ts-s:-1px -1px 0 var(--gl-ink),1px -1px 0 var(--gl-ink),-1px 1px 0 var(--gl-ink),1px 1px 0 var(--gl-ink),0 1.5px 0 var(--gl-ink),0 -1.5px 0 var(--gl-ink),1.5px 0 0 var(--gl-ink),-1.5px 0 0 var(--gl-ink),0 0 8px var(--gl-g1);isolation:isolate;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx::before,:is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:-1;animation:var(--gl-anim) var(--gl-dur) ease-in-out infinite;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx::after{animation-duration:calc(var(--gl-dur) * 1.27);animation-delay:-2.1s;}\n/* 📏 s2c quantum#26 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-top{background:linear-gradient(160deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.03) 55%,rgba(255,255,255,0.08) 100%);box-shadow:inset 0 0 0 1.5px var(--gl-rim),0 0 0 1px var(--gl-rim2),0 14px 40px rgba(0,0,0,0.45),0 0 34px var(--gl-glow);border-radius:24px;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-top::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0.4;animation:gl-tw 3.8s ease-in-out infinite;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-goal{position:relative;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-goal i{color:var(--gl-hi);text-shadow:var(--gl-ts-s);letter-spacing:0.12em;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-goal > b{color:#fff;text-shadow:var(--gl-ts);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-goal .am-need{color:#fff;background:linear-gradient(160deg,var(--gl-box),var(--gl-box2));box-shadow:inset 0 0 0 1.5px var(--gl-rim),0 0 18px var(--gl-glow);text-shadow:var(--gl-ts-s);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-goal .am-need b{color:var(--gl-hi);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-goal small:not(:empty){position:relative;color:#fff;text-shadow:var(--gl-ts-s);background:var(--gl-note);box-shadow:inset 0 0 0 1.5px var(--gl-notec);border-radius:16px;padding:0.35em 0.85em;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-goal small:not(:empty)::after{content:'';position:absolute;right:18px;bottom:-7px;width:12px;height:12px;background:var(--gl-note);box-shadow:1.5px 1.5px 0 var(--gl-notec);transform:rotate(45deg);}\n/* 📏 s2c quantum#27 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick{gap:12px;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick .chip3{--a:var(--gl-c1a);--b:var(--gl-c1b);--g:var(--gl-c1g);color:#fff;border:0;border-radius:999px;min-height:clamp(54px,8vmin,72px);padding:8px 28px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:clamp(1.15rem,3vmin,1.7rem);\n    background:linear-gradient(135deg,var(--a),var(--b));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.4),inset 0 10px 14px -8px rgba(255,255,255,0.45),0 6px 22px var(--g),0 4px 0 rgba(0,0,0,0.35);text-shadow:var(--gl-ts-s);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick .chip3:nth-child(4n+2){--a:var(--gl-c2a);--b:var(--gl-c2b);--g:var(--gl-c2g);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick .chip3:nth-child(4n+3){--a:var(--gl-c3a);--b:var(--gl-c3b);--g:var(--gl-c3g);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick .chip3:nth-child(4n+4){--a:var(--gl-c4a);--b:var(--gl-c4b);--g:var(--gl-c4g);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick .chip3 small{color:rgba(255,255,255,0.88);}\n/* 📏 s2c quantum#28 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick div.chip3{background:linear-gradient(160deg,var(--gl-box),var(--gl-box2));box-shadow:inset 0 0 0 2px var(--gl-rim),0 0 18px var(--gl-glow);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick .chip3 .tnum[style]{color:#fff !important;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick .chip3.on{background:linear-gradient(135deg,var(--a),var(--b));box-shadow:0 0 0 3px #fff,0 0 26px rgba(255,255,255,0.65),0 4px 0 rgba(0,0,0,0.35);filter:brightness(1.12);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick .chip3:disabled{opacity:0.38;filter:saturate(0.35);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.3);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick .chip3:active{transform:translateY(3px);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-act .sp-btn.sp-primary,:is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick .sp-btn.sp-primary{border:0;border-radius:999px;color:#fff;font-family:'Fredoka',sans-serif;background:linear-gradient(90deg,var(--gl-ok1),var(--gl-ok2) 60%,var(--gl-ok3));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.45),0 8px 30px var(--gl-glow),0 4px 0 rgba(0,0,0,0.35);text-shadow:var(--gl-ts-s);padding-left:1.8em;padding-right:1.8em;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-act .sp-btn.sp-primary{min-height:clamp(52px,7.5vmin,68px);font-size:clamp(1.15rem,2.8vmin,1.6rem);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick .sp-btn.sp-primary{min-height:clamp(48px,7vmin,62px);font-size:clamp(1.05rem,2.6vmin,1.45rem);}\n/* 📏 s2c quantum#29 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-msg{color:#fff;text-shadow:var(--gl-ts-s);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-msg:not(:empty){background:rgba(255,255,255,0.07);box-shadow:inset 0 0 0 1.5px var(--gl-rim);border-radius:20px;padding:8px 16px;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-msg.gm{display:flex;flex-direction:column;align-items:center;gap:4px;max-width:820px;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-msg.ok{background:linear-gradient(135deg,var(--gl-okb1),var(--gl-okb3));box-shadow:inset 0 0 0 1.5px var(--gl-okr),0 10px 30px var(--gl-glow);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-msg.try{background:var(--gl-tryb);box-shadow:inset 0 0 0 1.5px var(--gl-tryr);display:block;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-msg.end{background:var(--gl-endb);box-shadow:inset 0 0 0 1.5px var(--gl-endr);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .gm-top{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .gm-h{display:inline-block;font-family:'Fredoka',sans-serif;font-weight:700;font-size:1.25em;line-height:1.2;padding:0.06em 0.6em;border-radius:12px;background:linear-gradient(90deg,var(--gl-ok1),var(--gl-ok2));box-shadow:0 0 18px var(--gl-okr);transform:rotate(-3deg);animation:gl-stamp .45s cubic-bezier(.2,1.6,.4,1) both;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-msg.try .gm-h{background:linear-gradient(90deg,var(--gl-try1),var(--gl-try2));box-shadow:0 0 16px var(--gl-tryr);font-size:1.05em;margin-right:4px;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .gm-nb{font-weight:900;font-size:0.82em;padding:2px 10px;border-radius:99px;background:rgba(255,255,255,0.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.3);white-space:nowrap;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .gm-nb.new{background:linear-gradient(90deg,var(--gl-nb1),var(--gl-nb3));animation:gl-stamp .5s .15s cubic-bezier(.2,1.6,.4,1) both;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .gm-l{font-weight:900;font-size:0.8em;letter-spacing:0.12em;text-transform:uppercase;color:var(--gl-hi);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .gm-t{font-weight:800;line-height:1.3;text-wrap:balance;font-size:1.12em;}\n/* 📏 s2c quantum#30 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .gl-trip i.done{background:linear-gradient(135deg,var(--gl-ok1),var(--gl-ok2));box-shadow:0 0 8px var(--gl-ok1);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .gl-trip i.miss{background:linear-gradient(135deg,var(--gl-try1),var(--gl-try2));}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .gl-trip i.cur{filter:drop-shadow(0 0 6px var(--gl-g1));}\n  @media (max-height:520px){ :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .gm-l{display:none;} :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-msg:not(:empty){padding:4px 12px;} :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .gm-h{font-size:1.05em;} :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick .chip3{min-height:40px;padding:4px 16px;font-size:1rem;} :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-act .sp-btn.sp-primary,:is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .l3-pick .sp-btn.sp-primary{min-height:42px;font-size:1.05rem;} :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .gm-t{font-size:1em;} :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-goal small:not(:empty)::after{display:none;} }\n  @media (max-aspect-ratio:4/5){ :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-goal small:not(:empty)::after{display:none;} }\n  @media (prefers-reduced-motion:reduce){ :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx::before,:is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx::after{animation-name:gl-tw;} }\n/* 📏 s2c quantum#31 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-msg:not(:empty){flex-shrink:0;}\n/* 📏 s2c quantum#32 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat) .gl-trip{display:flex;align-items:center;min-width:86px;height:26px;padding:0 4px;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat) .gl-trip i{width:11px;height:11px;border-radius:50%;flex:none;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-style:normal;font-size:16px;line-height:1;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat) .gl-trip i.cur{width:20px;height:20px;background:transparent;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat) .gl-trip u{flex:1 1 4px;min-width:3px;height:0;border-top:2px dotted rgba(255,255,255,0.55);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat) .gl-trip b{font-size:15px;line-height:1;margin-left:1px;filter:drop-shadow(0 0 6px var(--gl-g1));}\n/* 📏 s2c quantum#33 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-now{color:#fff;background:linear-gradient(160deg,var(--gl-box),var(--gl-box2));box-shadow:inset 0 0 0 1.5px var(--gl-rim);text-shadow:var(--gl-ts-s);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-now.ok{background:linear-gradient(135deg,var(--gl-okb1),var(--gl-okb3));box-shadow:inset 0 0 0 1.5px var(--gl-okr);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .qk-sum{color:var(--gl-hi);text-shadow:var(--gl-ts-s);}\n/* 📏 s2c quantum#34 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-row,:is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .guess{background:linear-gradient(160deg,var(--gl-box),var(--gl-box2));color:#fff;box-shadow:inset 0 0 0 1.5px var(--gl-rim),0 0 18px var(--gl-glow),0 4px 0 rgba(0,0,0,0.3);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-row .lab,:is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .guess span{color:#fff;text-shadow:var(--gl-ts-s);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-row b,:is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .guess b{color:#fff;text-shadow:var(--gl-ts);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-row button.tminus,:is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .guess button.tminus{background:linear-gradient(135deg,#FF7A9C,#E5426B);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.45),0 0 14px rgba(255,90,140,0.55),0 3px 0 #8E1D3E;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-row button.tplus,:is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .guess button.tplus{background:linear-gradient(135deg,#4DF5C8,#11A8A0);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.45),0 0 14px rgba(60,240,200,0.55),0 3px 0 #0B6E68;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .am-row button,:is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .guess button{text-shadow:0 1px 2px rgba(0,0,0,0.45);}\n/* 📏 s2c quantum#35 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .ladder button{background:rgba(255,255,255,0.07);color:#fff;text-shadow:var(--gl-ts-s);box-shadow:inset 0 0 0 1.5px var(--gl-rim2);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .ladder button::after{background:var(--gl-c1a);opacity:0.6;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .ladder button.here{background:linear-gradient(90deg,var(--gl-okb1),var(--gl-okb3));box-shadow:inset 0 0 0 1.5px var(--gl-rim),0 0 18px var(--gl-glow);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .ladder button.below:hover{background:rgba(255,255,255,0.14);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .bulbbox small{color:var(--gl-hi);text-shadow:var(--gl-ts-s);}\n/* 📏 s2c quantum#36 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .legend2 span{color:#16233A;box-shadow:0 0 0 1.5px rgba(255,255,255,0.7),0 0 12px var(--gl-glow);font-weight:900;}\n/* 📏 s2c quantum#37 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx :is(.chips2,.xopts){gap:12px;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx :is(.chips2,.xopts) button{--a:var(--gl-c1a);--b:var(--gl-c1b);--g:var(--gl-c1g);color:#fff;border:0;border-radius:999px;min-height:clamp(48px,7vmin,64px);padding:6px 22px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:clamp(1rem,2.6vmin,1.45rem);outline:0;\n    background:linear-gradient(135deg,var(--a),var(--b));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.4),inset 0 10px 14px -8px rgba(255,255,255,0.45),0 6px 22px var(--g),0 4px 0 rgba(0,0,0,0.35);text-shadow:var(--gl-ts-s);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx :is(.chips2,.xopts) button:nth-child(4n+2){--a:var(--gl-c2a);--b:var(--gl-c2b);--g:var(--gl-c2g);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx :is(.chips2,.xopts) button:nth-child(4n+3){--a:var(--gl-c3a);--b:var(--gl-c3b);--g:var(--gl-c3g);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx :is(.chips2,.xopts) button:nth-child(4n+4){--a:var(--gl-c4a);--b:var(--gl-c4b);--g:var(--gl-c4g);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx :is(.chips2 button.on,.xopts button.yes){box-shadow:0 0 0 3px #fff,0 0 26px rgba(255,255,255,0.65),0 4px 0 rgba(0,0,0,0.35);filter:brightness(1.12);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .xopts button.no{filter:saturate(0.3) brightness(0.8);opacity:1;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .xopts button:disabled:not(.yes):not(.no){opacity:0.45;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx :is(.chips2,.xopts) button:active{transform:translateY(3px);}\n/* 📏 s2c quantum#38 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .qk-kit button{background:linear-gradient(160deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04));color:#fff;box-shadow:inset 0 0 0 1.5px var(--gl-rim),0 6px 18px rgba(0,0,0,0.35),0 0 16px var(--gl-glow);border-radius:999px;text-shadow:var(--gl-ts-s);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .qk-kit button small{color:var(--gl-hi);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .qk-kit button b{box-shadow:0 0 12px rgba(255,255,255,0.35);}\n/* 📏 s2c quantum#39 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-act .sp-btn.sp-secondary{border:0;border-radius:999px;color:#fff;font-family:'Fredoka',sans-serif;background:linear-gradient(90deg,var(--gl-c2a),var(--gl-c2b));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.45),0 8px 26px var(--gl-c2g),0 4px 0 rgba(0,0,0,0.35);text-shadow:var(--gl-ts-s);min-height:clamp(48px,7vmin,64px);font-size:clamp(1.05rem,2.6vmin,1.45rem);padding-left:1.4em;padding-right:1.4em;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-act .sp-btn.sp-ghost{color:#fff;text-shadow:var(--gl-ts-s);box-shadow:inset 0 0 0 1.5px var(--gl-rim);border-radius:999px;background:rgba(255,255,255,0.06);}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx .fm-act .sp-btn:disabled{opacity:0.45;filter:saturate(0.4);}\n/* 📏 s2c quantum#40 */\n  #scr-cat.glx .cats div{box-shadow:inset 0 -3px 0 rgba(0,0,0,0.25),0 0 14px var(--gl-glow);}\n  #scr-cat.glx .cats div.aw{background:linear-gradient(135deg,rgba(255,216,74,0.55),rgba(255,159,28,0.35));box-shadow:0 0 18px rgba(255,210,80,0.6);}\n/* 📏 s2c quantum#41 */\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx.acc-q{--gl-ink:#02101C;--gl-g1:rgba(110,235,255,0.8);--gl-g2:rgba(150,120,255,0.5);--gl-hi:#A8F0FF;--gl-rim:rgba(130,235,255,0.55);--gl-rim2:rgba(150,130,255,0.22);--gl-glow:rgba(70,220,255,0.22);--gl-box:rgba(8,40,66,0.92);--gl-box2:rgba(22,28,78,0.92);--gl-note:rgba(10,46,72,0.95);--gl-notec:rgba(160,150,255,0.55);--gl-ok1:#5CF2FF;--gl-ok2:#3A9BFF;--gl-ok3:#8C6BFF;--gl-try1:#FF8AC8;--gl-try2:#B07CFF;--gl-c1a:#4FE3FF;--gl-c1b:#2F7BFF;--gl-c1g:rgba(47,123,255,0.45);--gl-c2a:#B58CFF;--gl-c2b:#6B4DFF;--gl-c2g:rgba(107,77,255,0.45);--gl-c3a:#3DF2C0;--gl-c3b:#14A8B8;--gl-c3g:rgba(20,168,184,0.45);--gl-c4a:#FFD84A;--gl-c4b:#FF9F1C;--gl-c4g:rgba(255,159,28,0.45);--gl-okb1:rgba(92,242,255,0.22);--gl-okb3:rgba(140,107,255,0.22);--gl-okr:rgba(92,242,255,0.65);--gl-tryb:rgba(255,138,200,0.14);--gl-tryr:rgba(255,138,200,0.58);--gl-endb:rgba(176,124,255,0.16);--gl-endr:rgba(176,124,255,0.58);--gl-nb1:rgba(92,242,255,0.4);--gl-nb3:rgba(140,107,255,0.4);--gl-s1:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cellipse cx='12' cy='12' rx='10.5' ry='4' fill='none' stroke='%237FEFFF' stroke-width='1.5' transform='rotate%2830 12 12%29'/%3E%3Cellipse cx='12' cy='12' rx='10.5' ry='4' fill='none' stroke='%237FEFFF' stroke-width='1.5' transform='rotate%28-30 12 12%29'/%3E%3Ccircle cx='12' cy='12' r='2.6' fill='%237FEFFF'/%3E%3C/svg%3E\");--gl-s2:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 0C12.9 8.2 15.8 11.1 24 12C15.8 12.9 12.9 15.8 12 24C11.1 15.8 8.2 12.9 0 12C8.2 11.1 11.1 8.2 12 0Z' fill='%23FFFFFF'/%3E%3C/svg%3E\");--gl-s3:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cellipse cx='12' cy='12' rx='10.5' ry='4' fill='none' stroke='%23B9A4FF' stroke-width='1.5' transform='rotate%2830 12 12%29'/%3E%3Cellipse cx='12' cy='12' rx='10.5' ry='4' fill='none' stroke='%23B9A4FF' stroke-width='1.5' transform='rotate%28-30 12 12%29'/%3E%3Ccircle cx='12' cy='12' r='2.6' fill='%23B9A4FF'/%3E%3C/svg%3E\");--gl-s4:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 0C12.9 8.2 15.8 11.1 24 12C15.8 12.9 12.9 15.8 12 24C11.1 15.8 8.2 12.9 0 12C8.2 11.1 11.1 8.2 12 0Z' fill='%23A8F0FF'/%3E%3C/svg%3E\");--gl-anim:gl-pulse;--gl-dur:3.4s;background:radial-gradient(70% 45% at 10% 8%,rgba(60,220,255,0.28),transparent 70%),radial-gradient(60% 45% at 95% 62%,rgba(110,90,255,0.26),transparent 70%),radial-gradient(60% 40% at 45% 108%,rgba(40,255,200,0.18),transparent 70%),#030E1C;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx.acc-q::before{background:var(--gl-s1) 61.4% 31.4% / 13px 13px no-repeat, var(--gl-s2) 29.6% 4.6% / 13px 13px no-repeat, var(--gl-s3) 85.3% 58.3% / 13px 13px no-repeat, var(--gl-s4) 93.0% 34.1% / 13px 13px no-repeat, var(--gl-s1) 15.7% 56.1% / 20px 20px no-repeat, var(--gl-s2) 81.2% 86.1% / 20px 20px no-repeat, var(--gl-s3) 14.4% 82.9% / 13px 13px no-repeat, var(--gl-s4) 28.6% 74.9% / 16px 16px no-repeat, var(--gl-s1) 81.7% 8.6% / 20px 20px no-repeat, radial-gradient(1.6px 1.6px at 86.9% 75.4%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 9.4% 20.3%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 1.1% 76.0%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 1.7% 88.5%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 39.8% 84.0%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 83.9% 28.4%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 94.9% 26.0%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 64.6% 13.7%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 85.5% 51.7%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 74.9% 85.6%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 57.5% 93.8%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 76.9% 80.6%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 14.5% 16.5%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 11.9% 85.3%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 95.8% 44.8%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 62.3% 30.7%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 33.7% 19.8%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 69.5% 7.0%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 29.2% 46.6%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 6.5% 2.9%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 4.2% 14.0%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 71.3% 42.5%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 49.3% 95.8%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 96.5% 38.8%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 57.8% 60.3%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 31.9% 34.5%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx.acc-q::after{background:var(--gl-s1) 51.0% 38.8% / 13px 13px no-repeat, var(--gl-s2) 15.7% 52.1% / 9px 9px no-repeat, var(--gl-s3) 57.0% 90.9% / 16px 16px no-repeat, var(--gl-s4) 63.8% 82.0% / 13px 13px no-repeat, var(--gl-s1) 26.8% 80.4% / 13px 13px no-repeat, var(--gl-s2) 4.4% 70.6% / 11px 11px no-repeat, var(--gl-s3) 14.0% 30.6% / 11px 11px no-repeat, var(--gl-s4) 5.0% 12.5% / 9px 9px no-repeat, var(--gl-s1) 13.9% 63.5% / 16px 16px no-repeat, radial-gradient(1px 1px at 47.5% 92.7%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 66.4% 45.4%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 28.7% 2.0%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 78.4% 63.4%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 87.7% 89.6%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 73.6% 53.9%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 63.8% 35.9%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 24.8% 84.7%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 12.8% 3.0%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 7.9% 24.0%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 23.4% 54.9%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 29.1% 83.1%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 38.6% 52.0%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 41.9% 12.0%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 74.3% 77.5%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 45.3% 89.2%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 9.2% 29.2%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 50.2% 37.2%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat;}\n  :is(#scr-atom,#scr-led,#scr-glow,#scr-cat).glx.acc-q .am-top::before{background:var(--gl-s1) 79.5% 26.0% / 11px 11px no-repeat, var(--gl-s2) 34.3% 80.1% / 9px 9px no-repeat, var(--gl-s3) 25.9% 86.9% / 20px 20px no-repeat, var(--gl-s4) 62.3% 58.4% / 11px 11px no-repeat, var(--gl-s1) 95.7% 29.8% / 20px 20px no-repeat, var(--gl-s2) 6.5% 63.6% / 11px 11px no-repeat, var(--gl-s3) 24.6% 11.1% / 9px 9px no-repeat, radial-gradient(1.3px 1.3px at 33.3% 28.7%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 49.0% 44.5%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 62.1% 6.8%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 19.2% 65.5%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 86.9% 43.2%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 62.1% 89.7%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 60.8% 77.4%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 93.4% 83.5%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 83.7% 44.3%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 67.7% 76.8%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat;}\n");
/* 📏 s2c quantum#1 */

/* ================= ⚛️ QUANTUM (sc-2b) — Atom builder + 🎨 atom looks =================
   The protons decide the element (the name changes as you add them) · electrons fill the real shells (ChemTable shells of the element with that many electrons)
   · neutrons + protons = the mass number · protons − electrons = the charge (neutral / ion). Saves through sciChemSave(kind 'atom'). */
// most common isotope: neutrons for Z = 1…36 (index = Z)
const NEUT = [0, 0, 2, 4, 5, 6, 6, 7, 8, 10, 10, 12, 12, 14, 14, 16, 16, 18, 22, 20, 20, 24, 26, 28, 28, 30, 30, 32, 30, 34, 34, 38, 42, 42, 46, 44, 48];
const IONS = [[11, 1], [17, -1], [12, 2], [8, -2], [19, 1], [20, 2], [9, -1], [3, 1], [13, 3], [16, -2]];   // [Z, charge] kid-friendly ions
/* 📏 s2c quantum#2 */
const ABAR = UI.gameBar($('abar'), {game: GAME_ID, icon: '⚛️', name: 'Atom builder', levelId: 'atom-level', levels: () => leaveQuantum(true), playing: () => !!(AG && !AG.done), onLeave: () => { if(AG) AG.done = true; }, scoreMin: '5ch', onFit: () => drawAtomNow()});
ABAR.score(0); ABAR.miss(0); ABAR.count('atom', '⚛️', '1/5', 'Atom');

// ---------- hub ----------
function openQuantum(lv){
  SET.level = lv; const U = LEVEL_UI[lv];
  $('qhub-sub').textContent = U.emoji + ' ' + U.name + ' · ' + QUANT_LVL[lv][0];
  $('qhub-count').innerHTML = '<span>⚛️ ' + (CHEM.a || []).length + ' atoms built</span><span>📇 ' + CHEM.all.length + ' / 118 element cards</span>';
  const H = [['atom', '⚛️', 'Atom builder', 'Snap protons, neutrons + electrons into 5 real atoms', 0], ['led', '💡', 'LED colours', 'Drop an electron down the energy ladder — bigger drop, bluer light', 0], ['glow', '✨', 'Glow charge-up', 'Pick a light, charge the glow star, lights off!', 0], ['cat', '🐱', 'Cat in the box', 'Napping or awake? Guess how many before you look', 0]];
  $('qhub-hub').innerHTML = H.map((h, i) => '<button class="pick' + (h[4] ? ' soonpick' : '') + '" data-g="' + h[0] + '" data-sound="' + (h[4] ? 'none' : 'pop') + '" style="animation:sc-pop .4s ' + (i * 0.08) + 's both"><div class="big">' + h[1] + '</div><div class="nm">' + h[2] + '</div><div class="sub">' + h[3] + '</div></button>').join('');
  $('qhub-hub').querySelectorAll('[data-g]').forEach(b => b.onclick = () => { if(b.classList.contains('soonpick')){ UISound.play('error'); UI.toast('🔜 Coming in the next lab update'); return; } ({atom: startAtom, led: startLed, glow: startGlow, cat: startCat}[b.dataset.g] || startAtom)(); });
  renderSkins('qhub-skins'); showScreen('qhub');
  if(lv === 0) setTimeout(() => { if(!$('scr-qhub').classList.contains('hidden')){ const b = $('qhub-hub').querySelector('[data-g="atom"]'); b.classList.add('glow-next'); labHand(b); } }, 400 * SCI_FX);
}
/* 📏 s2c quantum#3 */

// ---------- a round ----------
function atomTargets(lv){
  const pool = shuffle(lv === 0 ? rangeN(1, 10) : lv === 1 ? rangeN(1, 18) : lv <= 3 ? rangeN(1, 20) : rangeN(1, 36)), out = [];
  const ions = lv >= 4 ? shuffle(IONS.slice()) : [];
  for(let i = 0; i < 5; i++){
    if(lv >= 4 && (i === 1 || i === 3)){ const io = ions.shift(); out.push({z: io[0], n: NEUT[io[0]], e: io[0] - io[1], q: io[1]}); continue; }
    const z = pool.shift(); out.push({z, n: NEUT[z] || 0, e: z, q: 0});
  }
  return out;
}
function startAtom(){
  const lv = SET.level;
  AG = {lv, list: atomTargets(lv), i: 0, p: 0, n: 0, e: 0, tries: 0, first: 0, score: 0, miss: 0, atoms: [], t0: Date.now(), done: false, solved: false};
  hideResult(); labHand(null); showScreen('atom'); ABAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); ABAR.score(0); ABAR.miss(0); ABAR.fit();
  try{ if(ABUD) ABUD.stop(); ABUD = UI.buddy ? UI.buddy($('am-buddy'), {name: S.player + '·lab', av: suitAv(S.player)}, {per: 2}) : null; }catch(e){ ABUD = null; }
  atomNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'quantum'); gcEmit('start', {game: 'atom'});
  atomLoop();
}
/* 📏 s2c quantum#4 */
function ionTxt(q){ return q === 0 ? '' : (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '⁺' : '⁻'); }
function atomNext(){
  if(!AG || AG.done) return; clearTimeout(AG.tm);
  if(AG.i >= AG.list.length) return atomEnd();
  const T = AG.list[AG.i], e = EL[T.z - 1], lv = AG.lv; AG.p = 0; AG.n = 0; AG.e = 0; AG.tries = 0; AG.solved = false; AG.hint = lv <= 2; AG.usedHint = false;
  ABAR.count('atom', '⚛️', (AG.i + 1) + '/' + AG.list.length, 'Atom');
  const mass = T.z + T.n, name = e.name + (T.q ? ' ion ' + e.sym + ionTxt(T.q) : '');
  $('am-name').textContent = (lv >= 2 ? name + (T.q ? '' : '-' + mass) : name);
  $('am-need').innerHTML = atomNeed(T);
  $('am-hint').textContent = lv === 0 ? '👆 Tap the glowing + buttons' : lv === 1 ? 'Atomic number = protons · a neutral atom has as many electrons' : lv === 2 ? 'Mass number ' + mass + ' = protons + neutrons' : T.q ? (T.q > 0 ? 'An ion that LOST ' + T.q + ' electron' + (T.q > 1 ? 's' : '') : 'An ion that GAINED ' + (-T.q) + ' electron' + (T.q < -1 ? 's' : '')) : lv === 5 ? '⏱️ 30 s · one check' : 'Mass number ' + mass;
  $('am-msg').className = 'fm-msg'; $('am-msg').textContent = '';
  atomRender();
  if(lv === 5) AG.tm = setTimeout(() => { if(AG && !AG.done && !AG.solved){ AG.miss++; ABAR.miss(AG.miss); UISound.play('error'); atomShowAnswer('⏱️ Time! '); } }, 30000);
}
function atomNeed(T){
  const lv = AG.lv, e = EL[T.z - 1];
  if(lv === 0) return '🔴 ' + T.z + ' protons · 🔵 ' + T.e + ' electrons';
  if(lv === 1) return 'Atomic number ' + T.z;
  if(lv === 2) return 'Atomic number ' + T.z + ' · mass ' + (T.z + T.n);
  if(lv === 3) return AG.hint ? 'Atomic number ' + T.z + ' · mass ' + (T.z + T.n) : 'Mass ' + (T.z + T.n) + ' · atomic number ❓';
  return 'Mass ' + (T.z + T.n) + (T.q ? ' · charge ' + (T.q > 0 ? '+' : '−') + Math.abs(T.q) : '') + (AG.hint ? ' · atomic number ' + T.z : '');
}
function atomRender(){
  const lv = AG.lv, T = AG.list[AG.i], nx = lv === 0 && !AG.solved ? (AG.p < T.z ? 'p' : AG.e < T.e ? 'e' : '') : '';
  const row = (k, lab, sym, col, v, hide) => '<div class="am-row' + (hide ? ' hide' : '') + '" data-k="' + k + '"><span class="lab"><img src="' + AtomSkins.url(sym, col, atomSkin(), 48) + '" alt="">' + lab + '</span>' +
    '<button class="tminus" data-d="-1" data-sound="tap" aria-label="Take one ' + lab + ' away">−</button><b>' + v + '</b><button class="tplus' + (nx === k ? ' kglow' : '') + '" data-d="1" data-sound="tap" aria-label="Add one ' + lab + '">+</button></div>';
  $('am-rows').innerHTML = row('p', 'Protons', '+', AtomSkins.colour('p+'), AG.p) + row('n', 'Neutrons', '', AtomSkins.colour('n'), AG.n, lv < 2) + row('e', 'Electrons', '−', AtomSkins.colour('e-'), AG.e);
  $('am-rows').querySelectorAll('.am-row').forEach(r => r.querySelectorAll('button').forEach(b => b.onclick = () => atomAdd(r.dataset.k, Number(b.dataset.d))));
  const act = $('am-act');
  if(AG.solved) act.innerHTML = '<button class="sp-btn sp-primary sp-lg" id="am-next" data-sound="pop">' + (AG.i + 1 < AG.list.length ? 'Next atom ▶' : '📋 Finish') + '</button>';
  else act.innerHTML = ((lv === 3 || lv === 4) && !AG.hint ? '<button class="sp-btn sp-ghost" id="am-hintb" data-sound="tap">💡 Show its number (−40)</button>' : '') + '<button class="sp-btn sp-primary sp-lg" id="am-check" data-sound="none"' + (AG.p + AG.e + AG.n ? '' : ' disabled') + '>✅ Check</button>';
  if($('am-next')) $('am-next').onclick = () => { if(!AG || !AG.solved) return; AG.i++; atomNext(); };
  if($('am-hintb')) $('am-hintb').onclick = () => { AG.hint = true; AG.usedHint = true; $('am-need').innerHTML = atomNeed(T); atomRender(); };
  if($('am-check')) $('am-check').onclick = atomCheck;
  atomNow(); drawAtomNow();
}
function atomNow(){   // the live read-out: what your protons make + the charge
  const el = $('am-now'), p = AG.p, q = AG.p - AG.e;
  if(!p){ el.className = 'am-now'; el.textContent = AG.e ? 'No protons = no element yet' : 'Add protons to start'; return; }
  const e = EL[p - 1], name = e ? e.name + ' (' + e.sym + ')' : 'element ' + p;
  el.className = 'am-now' + (q === 0 ? ' ok' : ''); el.textContent = p + ' proton' + (p > 1 ? 's' : '') + ' → ' + name + ' · ' + (q === 0 ? '⚖️ neutral' : (q > 0 ? '+' : '−') + Math.abs(q) + ' ion');
}
function atomAdd(k, d){
  if(!AG || AG.solved || AG.done) return; const max = {p: 36, n: 48, e: 40}[k], was = AG[k]; AG[k] = Math.max(0, Math.min(max, AG[k] + d)); UISound.play(d > 0 ? 'tap' : 'pop');
  if(d > 0 && AG[k] > was) labCarry(ABUD, $('am-buddy'), document.querySelector('#am-rows .am-row[data-k="' + k + '"] .lab img'), () => k === 'e' ? centreXY('am-atom', 0.12) : centreXY('am-atom'), AtomSkins.url(k === 'p' ? '+' : k === 'e' ? '−' : '', AtomSkins.colour(k === 'p' ? 'p+' : k === 'e' ? 'e-' : 'n'), atomSkin(), 64));
  if(k === 'p' && AG.lv < 2) AG.n = NEUT[AG.p] || 0;   // 🌱 🐣: neutrons come along by themselves
  atomRender();
}
function atomCheck(){
  if(!AG || AG.solved) return; const T = AG.list[AG.i], lv = AG.lv, e = EL[T.z - 1];
  const okP = AG.p === T.z, okN = lv < 2 || AG.n === T.n, okE = AG.e === T.e;
  if(okP && okN && okE){
    let pts = [100, 60, 30][Math.min(2, AG.tries)]; if(AG.usedHint) pts = Math.max(10, pts - 40);
    AG.score += pts; if(AG.tries === 0) AG.first++; AG.solved = true; AG.atoms.push(T.z); clearTimeout(AG.tm);
    UISound.play('success'); if(ABUD) ABUD.react('joy'); ABAR.score(Math.round(AG.score * SCI_MULT(lv)));
    $('am-msg').className = 'fm-msg ok'; $('am-msg').textContent = '✅ Built it! ' + e.name + (T.q ? ' ion' : '') + ' · ' + e.shells.length + ' shell' + (e.shells.length > 1 ? 's' : '') + ' · +' + pts + (chemGot(T.z) ? '' : ' · 📇 new card');
    AG.pop = performance.now(); atomRender(); gcEmit('right', {z: T.z}); return;
  }
  AG.tries++; AG.miss++; ABAR.miss(AG.miss); UISound.play('error'); if(ABUD) ABUD.react('miss'); gcEmit('wrong', {z: T.z});
  if(lv === 5) return atomShowAnswer('❌ ');
  let m;
  if(lv <= 2){
    if(!okP) m = e.name + ' needs ' + T.z + ' protons — you have ' + AG.p + '.';
    else if(!okN) m = e.name + '-' + (T.z + T.n) + ' needs ' + T.n + ' neutrons (' + (T.z + T.n) + ' − ' + T.z + ') — you have ' + AG.n + '.';
    else m = (T.q ? 'This ion needs ' + T.e : 'A neutral atom has as many electrons as protons: ' + T.e) + ' — you have ' + AG.e + '.';
  } else m = 'Not quite — count protons, neutrons and electrons again.' + (!AG.hint && (lv === 3 || lv === 4) && AG.tries >= 2 ? ' Try 💡.' : '');
  $('am-msg').className = 'fm-msg'; $('am-msg').textContent = '🤔 ' + m;
}
function atomShowAnswer(pre){ const T = AG.list[AG.i]; AG.p = T.z; AG.n = T.n; AG.e = T.e; AG.solved = true; AG.hint = true; $('am-need').innerHTML = atomNeed(T); $('am-msg').className = 'fm-msg'; $('am-msg').textContent = pre + 'It is ' + T.z + ' protons · ' + T.n + ' neutrons · ' + T.e + ' electrons.'; atomRender(); }
function atomEnd(){
  AG.done = true; stopAtom(); const total = AG.list.length, acc = AG.first / total, stars = acc >= 0.8 ? 3 : acc >= 0.6 ? 2 : 1;
  chemSave('atom', {found: AG.atoms.slice(), built: [], atoms: AG.atoms.slice(), right: AG.first, total, score: Math.round(AG.score * SCI_MULT(AG.lv)), stars, timeSec: Math.round((Date.now() - AG.t0) / 1000)});
}
// ---------- the atom picture: nucleus (protons + neutrons) + shells with electrons ----------
function atomLoop(){ cancelAnimationFrame(AT_RAF); if(!AG || AG.done) return; drawAtomNow(); if(SCI_FX) AT_RAF = requestAnimationFrame(atomLoop); }
function drawAtomNow(){
  const cv = $('am-atom'); if(!cv || !AG) return; const r = cv.getBoundingClientRect(); if(r.width < 10 || r.height < 10) return;
  const dpr = Math.min(2, devicePixelRatio || 1); if(cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)){ cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, r.width, r.height);
  const W = r.width, H = r.height, cx = W / 2, cy = H / 2, sk = atomSkin(), t = SCI_FX ? performance.now() / 1000 : 0.6, R = Math.min(W, H) / 2 - 6;
  const shells = AG.e > 0 && EL[AG.e - 1] ? EL[AG.e - 1].shells : [], nucl = AG.p + AG.n;
  const pr = Math.max(4, Math.min(14, R * 0.075)), nr = nucl ? pr * (1.1 + Math.sqrt(nucl) * 0.62) : 0;
  const ns = shells.length, inner = Math.max(nr + pr * 1.6, R * 0.32), step = ns > 1 ? (R - pr - inner) / (ns - 1) : 0;
  // shells
  shells.forEach((k, i) => { const rr = ns > 1 ? inner + step * i : (inner + R) / 2; g.strokeStyle = 'rgba(126,219,196,0.4)'; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.stroke();
    for(let j = 0; j < k; j++){ const a = j / k * Math.PI * 2 + t * (0.5 / (i + 1)) + i; AtomSkins.draw(g, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, Math.max(3, pr * (k > 12 ? 0.55 : 0.7)), pr >= 9 ? '−' : '', AtomSkins.colour('e-'), sk, t + j); } });
  // nucleus: sunflower packing, protons + neutrons mixed
  const parts = []; for(let i = 0; i < AG.p; i++) parts.push('p'); for(let i = 0; i < AG.n; i++) parts.push('n');
  const mixd = parts.map((k, i) => [k, (i * 0.618) % 1]).sort((a, b) => a[1] - b[1]).map(x => x[0]), pop = AG.pop ? Math.min(1, (performance.now() - AG.pop) / 600) : 1, sc = AG.solved ? 1 + Math.sin(pop * Math.PI) * 0.18 : 1;
  mixd.forEach((k, i) => { const d = pr * 1.05 * Math.sqrt(i) * sc, a = i * 2.39996; AtomSkins.draw(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, pr, k === 'p' && pr >= 9 ? '+' : '', AtomSkins.colour(k === 'p' ? 'p+' : 'n'), sk, t + i); });
  if(!nucl && !AG.e){ g.fillStyle = 'rgba(255,255,255,0.35)'; g.font = '800 ' + Math.round(R * 0.16) + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('⚛️ empty', cx, cy); }
  if(AG.solved && AG.p){ const e = EL[AG.p - 1], lr = Math.max(14, R * 0.17); AtomSkins.draw(g, cx + R * 0.72, cy - R * 0.72, lr, e.sym, CPK[e.sym] || AtomSkins.colour(e.sym), sk, t); }
}
/* 📏 s2c quantum#5 */
if(window.ResizeObserver){ const ro = new ResizeObserver(() => { if(LG && !$('scr-led').classList.contains('hidden')) ledPlace(); if(WG && !$('scr-glow').classList.contains('hidden')) drawGlow(); if(CG && !$('scr-cat').classList.contains('hidden')) layoutCats(); });
  setTimeout(() => ['led-stage', 'glow-cv', 'cat-stage'].forEach(id => { if($(id)) ro.observe($(id)); }), 0); }
/* 📏 s2c quantum#6 */

// ---------- 💡 LED colours ----------
// drop size → colour (1 step = red … 6 steps = violet) · LED chips are made of gallium + arsenic + phosphorus (red–yellow) or indium + gallium + nitrogen (green–violet)
const LED_COL = [null, {k: 'red', name: 'Red', icon: '🔴', col: '#FF3B30', el: [31, 33, 15]}, {k: 'orange', name: 'Orange', icon: '🟠', col: '#FF9500', el: [31, 33, 15]}, {k: 'yellow', name: 'Yellow', icon: '🟡', col: '#FFD60A', el: [31, 33, 15]},
  {k: 'green', name: 'Green', icon: '🟢', col: '#34C759', el: [49, 31, 7]}, {k: 'blue', name: 'Blue', icon: '🔵', col: '#0A84FF', el: [49, 31, 7]}, {k: 'violet', name: 'Violet', icon: '🟣', col: '#AF52DE', el: [49, 31, 7]}];
const LED_MIX = [{k: 'magenta', name: 'Magenta (pink-purple)', icon: '🩷', col: '#FF2D95', set: [1, 5]}, {k: 'cyan', name: 'Cyan (sky blue)', icon: '🩵', col: '#32D2F5', set: [4, 5]}, {k: 'white', name: 'White', icon: '⚪', col: '#FFFFFF', set: [1, 4, 5]}];
const LED_THINGS = [['🚦 the STOP light', 1], ['🎃 a pumpkin night-light', 2], ['⚠️ a yellow warning light', 3], ['🚦 the GO light', 4], ['🔋 a blue charging light', 5], ['🔮 a purple party light', 6]];
/* 📏 s2c quantum#7 */
const LBAR = qBar('lbar', '💡', 'LED colours', 'led-level', () => LG, () => { if(LG) LG.done = true; }, () => ledPlace());
LBAR.count('led', '💡', '1/5', 'LED');
function startLed(){
  const lv = SET.level, ds = shuffle([1, 2, 3, 4, 5, 6]), list = [];
  for(let i = 0; i < 5; i++){
    if(lv >= 4 && (i === 2 || i === 4)){ list.push(Object.assign({mix: true}, LED_MIX[(i === 2 ? 0 : 1 + (Math.random() < 0.5 ? 0 : 1))])); continue; }
    const d = ds[i % 6], th = lv >= 3 ? LED_THINGS.find(t => t[1] === d) : null; list.push({d, thing: th ? th[0] : '', k: LED_COL[d].k});
  }
  LG = {lv, list, i: 0, start: 6, at: 6, drops: [], tries: 0, first: 0, score: 0, miss: 0, found: [], t0: Date.now(), done: false, solved: false};
  hideResult(); labHand(null); showScreen('led'); LBAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); LBAR.score(0); LBAR.miss(0); LBAR.fit();
  LBUD = qBuddy(LBUD, 'led-buddy'); ledNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'quantum'); gcEmit('start', {game: 'led'});
}
/* 📏 s2c quantum#8 */
function ledTargetCol(T){ return T.mix ? T : LED_COL[T.d]; }
function ledNext(){
  if(!LG || LG.done) return; clearTimeout(LG.tm); clearTimeout(LG.gt); if(LG.i >= LG.list.length) return ledEnd();
  const T = LG.list[LG.i], lv = LG.lv, C = ledTargetCol(T), need = T.mix ? Math.max(...T.set) : T.d;
  LG.start = lv === 0 ? 6 : need + Math.floor(Math.random() * (7 - need)); LG.at = LG.start; LG.drops = []; LG.tries = 0; LG.solved = false; LG.glowStep = -1;
  LBAR.count('led', '💡', (LG.i + 1) + '/' + LG.list.length, 'LED');
  $('led-name').innerHTML = T.mix ? 'Mix ' + C.icon + ' ' + UI.esc(C.name) + ' light' : T.thing ? UI.esc(T.thing) : C.icon + ' ' + C.name;
  $('led-need').textContent = T.mix ? 'Use ' + T.set.length + ' electron drops — the light mixes' : lv <= 1 ? 'Drop the electron ' + T.d + ' step' + (T.d > 1 ? 's' : '') + ' down' : 'Pick how far it falls';
  $('led-hint').textContent = lv === 0 ? '👆 Tap the glowing step' : T.mix ? '🔴 + 🔵 = magenta · 🟢 + 🔵 = cyan · all three = white' : 'A bigger drop gives bluer light';
  $('led-msg').className = 'fm-msg'; $('led-msg').textContent = '';
  $('led-legend').innerHTML = lv <= 1 ? LED_COL.slice(1).map((c, i) => '<span style="background:' + c.col + '">' + (i + 1) + ' step' + (i ? 's' : '') + ' = ' + c.name + '</span>').join('') : '<span class="rb">small drop 🔴 🟠 🟡 🟢 🔵 🟣 big drop</span>' + (lv >= 4 ? '<span style="background:#fff">mix: 🔴+🟢+🔵 = ⚪</span>' : '');
  ledBulb(null); ledRender();
  if(lv === 0) LG.gt = setTimeout(() => { if(LG && !LG.solved){ LG.glowStep = LG.start - T.d; ledRender(); } }, 6000 * SCI_FX);
  if(lv === 5) LG.tm = setTimeout(() => { if(LG && !LG.done && !LG.solved){ LG.miss++; LBAR.miss(LG.miss); UISound.play('error'); ledAnswer('⏱️ Time! '); } }, 20000);
}
function ledRender(){
  const L = $('led-ladder'); let h = '';
  for(let st = 6; st >= 0; st--) h += '<button data-st="' + st + '" data-sound="none" class="' + (st === LG.at ? 'here' : st < LG.at ? 'below' : '') + (st === LG.glowStep ? ' kglow' : '') + '">' + (st === 0 ? 'ground' : 'step ' + st) + '</button>';
  L.innerHTML = h + '<img class="elec" id="led-elec" src="' + AtomSkins.url('−', AtomSkins.colour('e-'), atomSkin(), 48) + '" alt="electron">';
  L.querySelectorAll('button').forEach(b => b.onclick = () => ledTap(Number(b.dataset.st)));
  ledPlace();
  const act = $('led-act'); act.innerHTML = LG.solved ? '<button class="sp-btn sp-primary sp-lg" id="led-next" data-sound="pop">' + (LG.i + 1 < LG.list.length ? 'Next LED ▶' : '📋 Finish') + '</button>' : '';
  if($('led-next')) $('led-next').onclick = () => { if(!LG || !LG.solved) return; LG.i++; ledNext(); };
}
function ledPlace(){ const L = $('led-ladder'), e = $('led-elec'); if(!L || !e || !LG) return; const b = L.querySelector('[data-st="' + LG.at + '"]'); if(!b) return; e.style.top = (b.offsetTop + b.offsetHeight / 2 - e.offsetHeight / 2) + 'px'; }
function ledBulb(col){ const b = $('led-bulb'); b.style.background = col ? 'radial-gradient(circle at 40% 35%, #fff, ' + col + ' 55%)' : '#2A3A52'; b.style.boxShadow = col ? '0 0 30px 12px ' + col + ', 0 0 80px 30px ' + col + '88' : 'none'; }
function ledMix(drops){ const rgb = [0, 0, 0]; drops.forEach(d => { const c = LED_COL[d].col.replace('#', ''); for(let i = 0; i < 3; i++) rgb[i] = Math.min(255, rgb[i] + parseInt(c.substr(i * 2, 2), 16)); }); return 'rgb(' + rgb.join(',') + ')'; }
function ledTap(st){
  if(!LG || LG.solved || LG.done) return; const T = LG.list[LG.i];
  if(st >= LG.at){ UISound.play('error'); $('led-msg').className = 'fm-msg'; $('led-msg').textContent = '⬇️ An electron gives light when it falls DOWN — tap a lower step.'; return; }
  const d = LG.at - st; LG.at = st; ledPlace(); UISound.play('pop'); ledPhoton(LED_COL[d].col);
  if(!T.mix){ ledBulb(LED_COL[d].col); $('led-bulbtxt').textContent = LED_COL[d].icon + ' ' + LED_COL[d].name; return ledJudge([d]); }
  LG.drops.push(d); ledBulb(ledMix(LG.drops)); $('led-bulbtxt').textContent = LG.drops.map(x => LED_COL[x].icon).join(' + ');
  if(LG.drops.length < T.set.length){ $('led-msg').className = 'fm-msg'; $('led-msg').textContent = '⚡ ' + LG.drops.length + ' of ' + T.set.length + ' drops — the electron jumps back up for the next one'; setTimeout(() => { if(LG && !LG.solved){ LG.at = LG.start; ledPlace(); ledRender(); } }, 500 * SCI_FX); return; }
  ledJudge(LG.drops.slice());
}
function ledPhoton(col){ const st = $('led-stage'), e = $('led-elec'), b = $('led-bulb'); if(!st || !e || !b || !SCI_FX) return; const r0 = st.getBoundingClientRect(), r1 = e.getBoundingClientRect(), r2 = b.getBoundingClientRect();
  const p = document.createElement('div'); p.className = 'photon'; p.textContent = '〰️'; p.style.color = col; p.style.left = (r1.left - r0.left) + 'px'; p.style.top = (r1.top - r0.top) + 'px'; p.style.setProperty('--dx', (r2.left - r1.left) + 'px'); p.style.setProperty('--dy', (r2.top - r1.top) + 'px'); st.appendChild(p); setTimeout(() => p.remove(), 700); }
function ledJudge(drops){
  const T = LG.list[LG.i], lv = LG.lv, want = T.mix ? T.set.slice().sort() : [T.d], got = drops.slice().sort(), ok = want.join() === got.join();
  if(ok){
    const pts = qPts(LG.tries); LG.score += pts; if(LG.tries === 0) LG.first++; LG.solved = true; clearTimeout(LG.tm); clearTimeout(LG.gt);
    (T.mix ? T.set : [T.d]).forEach(d => LED_COL[d].el.forEach(n => { if(LG.found.indexOf(n) < 0) LG.found.push(n); }));
    UISound.play('success'); if(LBUD) LBUD.react('joy'); LBAR.score(Math.round(LG.score * SCI_MULT(lv))); if(T.mix) ledBulb(T.col);
    $('led-msg').className = 'fm-msg ok'; $('led-msg').textContent = '✅ ' + (T.mix ? ledTargetCol(T).name + ' light!' : LED_COL[T.d].name + '! A ' + T.d + '-step drop') + ' · +' + pts; ledRender(); gcEmit('right', {led: T.k}); return;
  }
  LG.tries++; LG.miss++; LBAR.miss(LG.miss); UISound.play('error'); if(LBUD) LBUD.react('miss'); gcEmit('wrong', {led: T.k});
  if(lv === 5) return ledAnswer('❌ ');
  let m;
  if(T.mix) m = got.map(d => LED_COL[d].icon).join(' + ') + ' makes a different colour. ' + ledTargetCol(T).name + ' = ' + T.set.map(d => LED_COL[d].icon).join(' + ') + (lv >= 5 ? '' : '');
  else { const d = got[0]; m = 'That ' + d + '-step drop made ' + LED_COL[d].icon + ' ' + LED_COL[d].name + '. ' + (lv <= 2 ? (T.d > d ? 'Bluer light needs a BIGGER drop.' : 'Redder light needs a SMALLER drop.') : 'Bigger drop = bluer light.'); }
  if(lv === 0 || (lv <= 2 && LG.tries >= 2)) LG.glowStep = LG.start - (T.mix ? T.set[0] : T.d);
  $('led-msg').className = 'fm-msg'; $('led-msg').textContent = '🤔 ' + m;
  setTimeout(() => { if(LG && !LG.solved){ LG.at = LG.start; LG.drops = []; ledBulb(null); $('led-bulbtxt').textContent = 'LED'; ledRender(); } }, 700 * SCI_FX);
}
function ledAnswer(pre){ const T = LG.list[LG.i]; LG.solved = true; ledBulb(ledTargetCol(T).col); $('led-msg').className = 'fm-msg'; $('led-msg').textContent = pre + (T.mix ? ledTargetCol(T).name + ' = ' + T.set.map(d => LED_COL[d].icon).join(' + ') : 'It was a ' + T.d + '-step drop → ' + LED_COL[T.d].name); ledRender(); }
function ledEnd(){ LG.done = true; const res = {found: LG.found.slice(), built: [], right: LG.first, total: LG.list.length, score: Math.round(LG.score * SCI_MULT(LG.lv)), stars: qStars(LG.first, LG.list.length), timeSec: Math.round((Date.now() - LG.t0) / 1000)}; stopLed(); chemSave('led', res); }
/* 📏 s2c quantum#9 */
const GLOW_SEC = 12, GLOW_T = [[3, 4, 5], [4, 5, 6], [5, 7, 8], [6, 8, 9], [8, 9, 10], [8, 9, 10]], GLOW_LIMIT = [0, 0, 0, 2.5, 2, 1.6];
/* 📏 s2c quantum#10 */
const WBAR = qBar('wbar', '✨', 'Glow charge-up', 'glow-level', () => WG, () => { if(WG) WG.done = true; }, () => drawGlow());
WBAR.count('glow', '✨', '1/3', 'Star');
function startGlow(){
  const lv = SET.level; WG = {lv, list: GLOW_T[lv].slice(), i: 0, light: lv === 0 ? 'blue' : '', charge: 0, shone: 0, tries: 0, first: 0, score: 0, miss: 0, t0: Date.now(), done: false, solved: false, phase: 'charge'};
  hideResult(); labHand(null); showScreen('glow'); WBAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); WBAR.score(0); WBAR.miss(0); WBAR.fit();
  WBUD = qBuddy(WBUD, 'glow-buddy'); glowNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'quantum'); gcEmit('start', {game: 'glow'}); glowLoop();
}
/* 📏 s2c quantum#11 */
function glowNext(){
  if(!WG || WG.done) return; if(WG.i >= WG.list.length) return glowEnd();
  const tg = WG.list[WG.i], lim = GLOW_LIMIT[WG.lv]; WG.charge = 0; WG.shone = 0; WG.tries = 0; WG.solved = false; WG.phase = 'charge'; WG.glowLeft = 0; if(WG.lv > 0) WG.light = '';
  WBAR.count('glow', '✨', (WG.i + 1) + '/' + WG.list.length, 'Star');
  $('glow-name').textContent = 'Glow for ' + tg + ' seconds'; $('glow-need').textContent = lim ? '⏱️ You may shine for ' + lim + ' s only' : 'Shine, then switch the lights off';
  $('glow-hint').textContent = WG.lv === 0 ? '👆 Hold ☀️ Shine, then tap 🌙 Lights off' : 'Light lifts the glow paint’s electrons — in the dark they drop back and glow';
  $('glow-msg').className = 'fm-msg'; $('glow-msg').textContent = ''; glowRender();
}
function glowRender(){
  const lv = WG.lv;
  $('glow-lights').innerHTML = Object.keys(LIGHTS).map(k => '<button data-k="' + k + '" data-sound="tap" class="' + (WG.light === k ? 'on' : '') + '">' + LIGHTS[k].icon + ' ' + LIGHTS[k].name + '</button>').join('');
  $('glow-lights').querySelectorAll('button').forEach(b => b.onclick = () => { if(!WG || WG.phase !== 'charge') return; WG.light = b.dataset.k; glowRender(); });
  const act = $('glow-act');
  if(WG.solved) act.innerHTML = '<button class="sp-btn sp-primary sp-lg" id="glow-next" data-sound="pop">' + (WG.i + 1 < WG.list.length ? 'Next star ▶' : '📋 Finish') + '</button>';
  else if(WG.phase === 'charge') act.innerHTML = '<button class="sp-btn sp-secondary sp-lg holdbtn' + (lv === 0 && !WG.shone ? ' glow-next' : '') + '" id="glow-shine" data-sound="none"' + (WG.light ? '' : ' disabled') + '>☀️ Hold to shine</button><button class="sp-btn sp-primary sp-lg' + (lv === 0 && WG.charge > 0.45 ? ' glow-next' : '') + '" id="glow-off" data-sound="tap"' + (WG.shone ? '' : ' disabled') + '>🌙 Lights off</button>';
  else act.innerHTML = '';
  if($('glow-next')) $('glow-next').onclick = () => { if(!WG || !WG.solved) return; WG.i++; glowNext(); };
  const sh = $('glow-shine'); if(sh){ const on = ev => { ev.preventDefault(); if(!WG.light) return; WG.shining = true; sh.classList.add('down'); }, off = () => { if(WG) WG.shining = false; sh.classList.remove('down'); };
    sh.addEventListener('pointerdown', on); ['pointerup', 'pointerleave', 'pointercancel'].forEach(e => sh.addEventListener(e, off)); }
  if($('glow-off')) $('glow-off').onclick = glowOff;
  drawGlow();
}
function glowCharge(sec){   // light shines for sec seconds (also used by tests)
  if(!WG || WG.phase !== 'charge' || !WG.light) return; const lim = GLOW_LIMIT[WG.lv], L = LIGHTS[WG.light];
  let t = sec; if(lim) t = Math.max(0, Math.min(t, lim - WG.shone)); WG.shone += sec; WG.charge = Math.min(1, WG.charge + L.rate * t);
  if(L.rate === 0 && WG.shone > 0.6 && !WG.redSaid){ WG.redSaid = true; $('glow-msg').className = 'fm-msg'; $('glow-msg').textContent = '🔴 Red light can’t charge glow paint — its light bits are too weak! Try another colour.'; }
  if(lim && WG.shone >= lim && !WG.limSaid){ WG.limSaid = true; $('glow-msg').className = 'fm-msg'; $('glow-msg').textContent = '⏱️ Shine time is up — switch the lights off!'; }
  if(!$('glow-off') || $('glow-off').disabled !== !WG.shone) glowRender();
}
function glowOff(){
  if(!WG || WG.phase !== 'charge' || !WG.shone) return; const tg = WG.list[WG.i], secs = WG.charge * GLOW_SEC; WG.phase = 'dark'; WG.glowLeft = secs; WG.darkT = performance.now(); glowRender(); UISound.play('pop');
  setTimeout(() => glowJudge(secs, tg), Math.min(secs, tg + 0.5) * 1000 * SCI_FX);
}
function glowJudge(secs, tg){
  if(!WG || WG.done) return; const lv = WG.lv;
  if(secs >= tg){ const pts = qPts(WG.tries); WG.score += pts; if(WG.tries === 0) WG.first++; WG.solved = true; UISound.play('success'); if(WBUD) WBUD.react('joy'); WBAR.score(Math.round(WG.score * SCI_MULT(lv)));
    $('glow-msg').className = 'fm-msg ok'; $('glow-msg').textContent = '✅ It glowed ' + secs.toFixed(1) + ' s with ' + LIGHTS[WG.light].icon + ' ' + LIGHTS[WG.light].name + ' light · +' + pts; WG.phase = 'done'; glowRender(); gcEmit('right', {light: WG.light}); return; }
  WG.tries++; WG.miss++; WBAR.miss(WG.miss); UISound.play('error'); if(WBUD) WBUD.react('miss'); gcEmit('wrong', {light: WG.light});
  const L = LIGHTS[WG.light], m = L.rate === 0 ? 'Red light can’t lift the electrons — no glow at all.' : 'It only glowed ' + secs.toFixed(1) + ' s — ' + (GLOW_LIMIT[lv] ? 'use a STRONGER light (bluer = more energy).' : 'shine longer or use a stronger light.');
  if(lv === 5){ WG.solved = true; WG.phase = 'done'; $('glow-msg').className = 'fm-msg'; $('glow-msg').textContent = '❌ ' + m + ' 🟣 UV charges fastest.'; glowRender(); return; }
  $('glow-msg').className = 'fm-msg'; $('glow-msg').textContent = '🤔 ' + m; WG.phase = 'charge'; WG.charge = 0; WG.shone = 0; WG.redSaid = false; WG.limSaid = false; glowRender();
}
function glowLoop(){ cancelAnimationFrame(W_RAF); if(!WG || WG.done) return; const now = performance.now(), dt = WG.lastT ? Math.min(0.1, (now - WG.lastT) / 1000) : 0; WG.lastT = now;
  if(WG.shining) glowCharge(dt); if(WG.phase === 'dark') WG.glowLeft = Math.max(0, WG.charge * GLOW_SEC - (now - WG.darkT) / 1000);
  drawGlow(); if(SCI_FX) W_RAF = requestAnimationFrame(glowLoop); }
function drawGlow(){
  const cv = $('glow-cv'); if(!cv || !WG) return; const r = cv.getBoundingClientRect(); if(r.width < 10 || r.height < 10) return;
  const dpr = Math.min(2, devicePixelRatio || 1); if(cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)){ cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
  const g = cv.getContext('2d'), W = r.width, H = r.height, cx = W / 2, cy = H / 2 + 6, R = Math.min(W, H) * 0.32; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  const dark = WG.phase === 'dark' || WG.phase === 'done', lvl = dark ? (WG.phase === 'done' ? WG.charge : WG.glowLeft / GLOW_SEC) : WG.charge, L = WG.light ? LIGHTS[WG.light] : null;
  if(WG.shining && L){ const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, L.col + 'AA'); gr.addColorStop(1, L.col + '00'); g.fillStyle = gr; g.beginPath(); g.moveTo(W * 0.35, 0); g.lineTo(W * 0.65, 0); g.lineTo(W * 0.85, H); g.lineTo(W * 0.15, H); g.closePath(); g.fill(); }
  const star = (rr) => { g.beginPath(); for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? rr * 0.45 : rr; i ? g.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q) : g.moveTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } g.closePath(); };
  if(dark && lvl > 0){ g.save(); g.shadowColor = '#7CFFB2'; g.shadowBlur = 40 * lvl; star(R); g.fillStyle = 'rgba(124,255,178,' + (0.25 + 0.75 * lvl) + ')'; g.fill(); g.restore(); }
  else { star(R); g.fillStyle = dark ? '#2A3A52' : '#E9F5DA'; g.fill(); }
  g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,0.5)'; star(R); g.stroke();
  const n = Math.round(lvl * 12); for(let i = 0; i < 12; i++){ const a = i / 12 * Math.PI * 2, up = i < n; AtomSkins.draw(g, cx + Math.cos(a) * R * (up ? 1.25 : 0.55), cy + Math.sin(a) * R * (up ? 1.25 : 0.55), Math.max(4, R * 0.07), '', AtomSkins.colour('e-'), atomSkin(), i); }
  g.fillStyle = '#fff'; g.font = '800 ' + Math.round(Math.max(13, R * 0.18)) + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
  g.fillText(dark ? (WG.phase === 'dark' ? '🌙 glowing… ' + WG.glowLeft.toFixed(1) + ' s' : '🌙 ' + (WG.charge * GLOW_SEC).toFixed(1) + ' s of glow') : '⚡ charge ' + Math.round(WG.charge * 100) + ' %', cx, 6);
}
function glowEnd(){ WG.done = true; const res = {found: [38, 13, 8, 63], built: [], right: WG.first, total: WG.list.length, score: Math.round(WG.score * SCI_MULT(WG.lv)), stars: qStars(WG.first, WG.list.length), timeSec: Math.round((Date.now() - WG.t0) / 1000)}; stopGlow(); chemSave('glow', res); }

// ---------- 🐱 Cat in the box ----------
// kid-safe version of a famous thought experiment: each cat naps or is awake by chance; you can't know ONE box until you look, but many boxes average out
const CAT_SET = [[[10, 1, 2]], [[10, 1, 2]], [[12, 1, 4], [12, 3, 4]], [[20, 1, 4], [20, 1, 2], [20, 3, 4], [20, 1, 5]], [[30, 1, 3], [30, 2, 3], [30, 1, 10], [30, 3, 10]], [[40, 1, 4], [40, 3, 8], [40, 7, 10]]];
/* 📏 s2c quantum#12 */
const CBAR = qBar('cbar', '🐱', 'Cat in the box', 'cat-level', () => CG, () => { if(CG) CG.done = true; }, () => layoutCats());
CBAR.count('cat', '🐱', '1/3', 'Round');
function startCat(){
  const lv = SET.level, list = []; for(let i = 0; i < 3; i++){ const c = CAT_SET[lv][i % CAT_SET[lv].length]; list.push({n: c[0], a: c[1], b: c[2]}); }
  CG = {lv, list: shuffle(list), i: 0, guess: 0, tries: 0, first: 0, score: 0, miss: 0, t0: Date.now(), done: false, solved: false};
  hideResult(); labHand(null); showScreen('cat'); CBAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); CBAR.score(0); CBAR.miss(0); CBAR.fit();
  CBUD = qBuddy(CBUD, 'cat-buddy'); catNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'quantum'); gcEmit('start', {game: 'cat'});
}
/* 📏 s2c quantum#13 */
function catTol(T){ return Math.max(1, Math.round(T.n * 0.1)); }
function catNext(){
  if(!CG || CG.done) return; if(CG.i >= CG.list.length) return catEnd();
  const T = CG.list[CG.i], lv = CG.lv; CG.guess = Math.round(T.n / 2); CG.solved = false; CG.opened = 0; CG.cats = null;
  CBAR.count('cat', '🐱', (CG.i + 1) + '/' + CG.list.length, 'Round');
  $('cat-name').textContent = T.n + ' boxes, one napping cat in each'; $('cat-need').textContent = 'Each cat is awake: ' + T.a + ' in ' + T.b;
  $('cat-hint').textContent = lv === 0 ? '👆 ' + T.a + ' in ' + T.b + ' of ' + T.n + ' cats = about ' + Math.round(T.n * T.a / T.b) + ' — set your guess, then open' : 'Use the chance to guess — you can\u2019t see inside a box until you open it';
  $('cat-msg').className = 'fm-msg'; $('cat-msg').textContent = ''; $('cat-grid').innerHTML = ''; layoutCats(); catRender();
}
function catRender(){
  const T = CG.list[CG.i];
  $('cat-guess').innerHTML = '<div class="guess"><span>Awake cats:</span><button class="tminus" data-d="-1" data-sound="tap" aria-label="One fewer">−</button><b id="cat-g">' + CG.guess + '</b><button class="tplus" data-d="1" data-sound="tap" aria-label="One more">+</button></div>';
  $('cat-guess').querySelectorAll('button').forEach(b => b.onclick = () => { if(CG.solved) return; CG.guess = Math.max(0, Math.min(T.n, CG.guess + Number(b.dataset.d))); $('cat-g').textContent = CG.guess; });
  const act = $('cat-act');
  act.innerHTML = CG.solved ? '<button class="sp-btn sp-primary sp-lg" id="cat-next" data-sound="pop">' + (CG.i + 1 < CG.list.length ? 'Next boxes ▶' : '📋 Finish') + '</button>' : '<button class="sp-btn sp-primary sp-lg' + (CG.lv === 0 ? ' glow-next' : '') + '" id="cat-open" data-sound="pop">📦 Open the boxes!</button>';
  if($('cat-next')) $('cat-next').onclick = () => { if(!CG || !CG.solved) return; CG.i++; catNext(); };
  if($('cat-open')) $('cat-open').onclick = catOpen;
}
function layoutCats(){
  if(!CG) return; const T = CG.list[CG.i], grid = $('cat-grid'), st = $('cat-stage'); if(!grid || !st || !T) return; const r = st.getBoundingClientRect(); if(r.width < 10) return;
  let best = 1, cols = 1; for(let c = 1; c <= T.n; c++){ const rows = Math.ceil(T.n / c), sz = Math.min(r.width / c, r.height / rows) * 0.9; if(sz > best){ best = sz; cols = c; } }
  const sz = Math.floor(Math.min(90, best)); grid.style.gridTemplateColumns = 'repeat(' + cols + ', ' + sz + 'px)'; grid.style.gridAutoRows = sz + 'px';
  if(grid.children.length !== T.n) grid.innerHTML = Array.from({length: T.n}, (_, i) => '<div data-i="' + i + '"><span>📦</span></div>').join('');
  grid.querySelectorAll('div').forEach(d => { d.style.fontSize = Math.round(sz * 0.62) + 'px'; });
  grid.style.maxHeight = r.height + 'px';
}
function catOpen(){
  if(!CG || CG.solved || CG.done) return; const T = CG.list[CG.i];
  CG.cats = Array.from({length: T.n}, () => Math.random() < T.a / T.b); const awake = CG.cats.filter(Boolean).length, tol = catTol(T), off = Math.abs(CG.guess - awake);
  CG.solved = true; catRender(); const boxes = [...$('cat-grid').children];
  boxes.forEach((d, i) => setTimeout(() => { if(!CG || CG.done) return; d.classList.add('open'); if(CG.cats[i]) d.classList.add('aw'); d.firstChild.textContent = CG.cats[i] ? '😺' : '😴'; if(i % 3 === 0) UISound.play('tap'); }, i * Math.min(60, 1200 / T.n) * SCI_FX));
  // a good guess = close to what the chances say (the science answer); landing near the real count is a bonus — the boxes are a surprise
  const exp = T.n * T.a / T.b, offE = Math.abs(CG.guess - exp), ok = offE <= tol + 0.01, pts = (ok ? Math.round(100 - 40 * offE / (tol + 0.5)) : 10) + (off <= tol ? 20 : 0);
  CG.score += pts; if(ok) CG.first++; else { CG.miss++; CBAR.miss(CG.miss); }
  setTimeout(() => { if(!CG || CG.done) return; UISound.play(ok ? 'success' : 'error'); if(CBUD) CBUD.react(ok ? 'joy' : 'miss'); CBAR.score(Math.round(CG.score * SCI_MULT(CG.lv)));
    const ex = Math.round(exp * 10) / 10;
    $('cat-msg').className = 'fm-msg' + (ok ? ' ok' : ''); $('cat-msg').textContent = (ok ? '✅ Smart guess! ' : '🤔 ') + '😺 ' + awake + ' awake · 😴 ' + (T.n - awake) + ' napping. The chances said about ' + ex + (off <= tol ? ' — and you were close to the real count too' : ' — the boxes surprised us') + '. +' + pts;
    gcEmit(ok ? 'right' : 'wrong', {awake, guess: CG.guess}); }, (T.n * Math.min(60, 1200 / T.n) + 200) * SCI_FX);
}
function catEnd(){ CG.done = true; const res = {found: [], built: [], right: CG.first, total: CG.list.length, score: Math.round(CG.score * SCI_MULT(CG.lv)), stars: qStars(CG.first, CG.list.length), timeSec: Math.round((Date.now() - CG.t0) / 1000)}; stopCat(); chemSave('cat', res); }
/* 📏 s2c quantum#14 */
(function(){   // 📏 s2c: ⚛️ Quantum's own wraps (they travel with SciLab_quantum)
  const after = (f, fn) => function(){ const r = f.apply(this, arguments); try{ fn(); }catch(e){} return r; };
  atomNext = after(atomNext, () => qpTrip('atom')); ledNext = after(ledNext, () => qpTrip('led')); glowNext = after(glowNext, () => qpTrip('glow'));
  catNext = after(catNext, () => qpTrip('cat'));
  // ✨ light words on the 4 canvases: dark outline, then the lab's glow
  const lit = (f, k, id) => function(){ const cv = $(id); if(cv && qpGlass(k)){ glxText(cv.getContext('2d')); window.L3GLOW = QP_GLASS[k].glow; } try{ return f.apply(this, arguments); } finally { window.L3GLOW = false; } };
  drawAtomNow = lit(drawAtomNow, 'atom', 'am-atom'); drawGlow = lit(drawGlow, 'glow', 'glow-cv');
})();
/* 📏 s2c quantum#15 */
(function(){
  // 🔴 red can't charge glow paint — finding that out is a page too
  const gc = glowCharge; glowCharge = function(){ const was = WG && WG.redSaid, r = gc.apply(this, arguments); try{ if(WG && !was && WG.redSaid) qNoteAdd('glow', 'red'); }catch(e){} return r; };
  // the pages travel with the save (sciChemSave keeps "<kind>.<page>" for any kind)
  const cs = chemSave; chemSave = function(kind, res){ try{ if(QN_KINDS[kind] && res && !res.learn){ const G = QN_G[kind](); res.learn = (G && G.learn || []).slice(); } }catch(e){} return cs.apply(this, arguments); };
})();
SciLab.loaded('quantum', 's2c');
