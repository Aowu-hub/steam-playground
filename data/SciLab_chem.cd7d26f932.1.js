
SciLab.css('chem', "/* 📏 s2c chem#15 */\n  .xmeter{display:inline-flex;align-items:center;gap:8px;font-weight:900;color:#C9D6EA;font-size:clamp(.75rem,1.5vmin,1rem);}\n  .xmeter b{display:inline-block;width:clamp(80px,14vmin,160px);height:12px;border-radius:8px;background:rgba(255,255,255,0.15);overflow:hidden;position:relative;}\n  .xmeter b::after{content:'';position:absolute;inset:0;width:var(--f,0%);background:linear-gradient(90deg,#7EDBC4,#22C3A1);transition:width .4s;}\n  .xsafe{font-weight:800;font-size:.85rem;color:var(--ink-soft);text-align:center;margin:-6px 0 10px;}\n/* 📏 s2c chem#16 */\n  .ptable{position:relative;margin:0 auto;}\n  .pt-cell{position:absolute;border:0;border-radius:6px;padding:0;cursor:pointer;color:#16233A;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;\n    box-shadow:inset 0 -2px 0 rgba(0,0,0,0.14);transform:translateZ(0);font-family:'Fredoka',sans-serif;overflow:hidden;}\n  .pt-cell b{font-weight:700;} .pt-cell i{font-style:normal;font-weight:800;opacity:.65;font-family:'Nunito',sans-serif;}\n  .pt-cell.no{filter:saturate(.25) brightness(1.08);opacity:.55;} .pt-cell.got::after{content:'⭐';position:absolute;top:0;right:1px;font-size:.6em;}\n/* 📏 s2c chem#17 */\n  .pt-ph{position:absolute;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:900;color:var(--ink-soft);border:2px dashed rgba(86,102,127,0.35);border-radius:6px;}\n  .legend{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin:0 0 10px;}\n  .legend span{border-radius:10px;padding:3px 9px;font-weight:800;font-size:0.72rem;color:#16233A;}\n  .pt-wrap{background:var(--card);border-radius:18px;padding:10px;min-height:260px;}\n  .pt-wrap .ptable{width:100%;}\n  .stamps{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:12px;}\n  .stamps span{background:var(--card);border-radius:12px;padding:4px 10px;font-weight:800;font-size:0.76rem;} .stamps span.done{background:#FFF1C9;}\n/* 📏 s2c chem#18 */\n  .clue-t{flex:0 1 700px !important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;text-align:center;font-size:clamp(.95rem,2.8vw,1.3rem) !important;box-shadow:0 5px 0 rgba(0,0,0,0.25);animation:sc-pop .35s both;}\n  .clue-t .ctag{display:inline-block;background:#16233A;color:#fff;border-radius:10px;padding:1px 10px;font-family:'Nunito',sans-serif;font-weight:900;font-size:.6em;letter-spacing:.03em;}\n  .clue-t .cmain{font-family:'Fredoka',sans-serif;font-weight:700;font-size:1em;line-height:1.15;text-wrap:balance;}\n  .clue-t .csub{display:block;margin:0;font-family:'Nunito',sans-serif;font-weight:800;font-size:.68em;line-height:1.25;color:#56667F;text-wrap:balance;}\n  .clue-t .cfb{font-family:'Nunito',sans-serif;font-weight:900;font-size:.66em;line-height:1.3;border-radius:10px;padding:1px 10px;}\n  .clue-t .cfb:empty{display:none;} .clue-t .cfb.ok{background:#D9FBEF;color:#0D6B50;} .clue-t .cfb.bad{background:#FFE1E0;color:#A12A26;}\n/* 📏 s2c chem#19 */\n  .clue.ingap .clue-t{flex:1 1 auto !important;align-self:stretch;font-size:var(--cf,18px) !important;border-radius:clamp(10px,1.4vw,22px);padding:.3em .8em;overflow:hidden;}\n/* 📏 s2c chem#20 */\n  .clue-t{flex:1;background:rgba(255,255,255,0.95);color:#16233A;border-radius:14px;padding:6px 12px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:clamp(.9rem,2.6vw,1.12rem);line-height:1.2;}\n  .clue-t small{display:block;margin-top:2px;font-family:'Nunito',sans-serif;font-weight:800;font-size:.75em;color:#56667F;} .clue-t{text-wrap:balance;}\n/* 📏 s2c chem#21 */\n  .pt-box{position:relative;flex:1;min-height:0;margin:0 6px calc(var(--safe-b, 18px) - 8px);}\n/* 📏 s2c chem#22 */\n  .fm > *{width:100%;max-width:900px;}\n/* 📏 s2c chem#23 */\n  .fm-top canvas#fm-buddy{grid-area:bud;width:56px;height:70px;align-self:end;justify-self:end;}\n/* 📏 s2c chem#24 */\n  .fm-goal span sub{font-size:.6em;}\n  .fm-goal small{font-weight:800;color:#C9D6EA;font-size:clamp(.82rem,2.2vw,.98rem);line-height:1.3;text-wrap:balance;}\n  .fm-goal small:empty{display:none;}\n  .fm-top{position:relative;}\n/* 📏 s2c chem#25 */\n  .fm-tray .empty{color:#8FA3BF;font-weight:800;font-size:.85rem;}\n/* 📏 s2c chem#26 */\n  .fm-tray{gap:8px 10px !important;padding:8px 10px !important;}\n  .fm-tray .cap,.fm-kit .cap{flex:0 0 100%;text-align:center;font-weight:900;font-size:.74rem;letter-spacing:.04em;color:#8FA3BF;margin-bottom:-2px;}\n  .tchip{gap:7px !important;padding:4px !important;border-radius:28px !important;box-shadow:0 3px 0 rgba(0,0,0,0.25);}\n  .tchip .ball{width:38px !important;height:38px !important;font-size:.95rem !important;}\n  .tchip b{font-family:'Fredoka',sans-serif;font-weight:700;font-size:1.2rem;min-width:2.3ch;text-align:center;}\n  .tchip .need{font-size:.78rem !important;font-weight:900;color:#56667F;margin-left:-4px;}\n  .tchip button.tminus,.tchip button.tplus{width:40px !important;height:40px !important;border-radius:50% !important;color:#fff !important;font-size:1.55rem !important;font-weight:900;line-height:1;display:flex;align-items:center;justify-content:center;padding:0 0 3px;transition:transform .1s;}\n  .tchip button.tminus{background:#F25F5C !important;box-shadow:0 3px 0 #B8322F;} .tchip button.tplus{background:#22C3A1 !important;box-shadow:0 3px 0 #138A71;}\n  .tchip button.tminus:active,.tchip button.tplus:active{transform:translateY(2px);box-shadow:none;}\n  .fm-eye{font-style:normal;font-weight:900;font-size:clamp(.7rem,.5vw + .6vh,.92rem);letter-spacing:.08em;text-transform:uppercase;color:#8FA3BF;}\n  .fm-goal b{font-size:clamp(1.15rem,1.5vw + 1.2vh,2.5rem) !important;}\n  .fm-goal span{font-size:clamp(1.5rem,2vw + 2vh,3.3rem) !important;align-self:flex-start;background:rgba(126,219,196,0.13);border-radius:16px;padding:.1em .45em .14em;}\n  .fm-goal small{font-size:clamp(.85rem,.6vw + .8vh,1.2rem) !important;}\n  @media (max-aspect-ratio:4/5){ .fm-goal span{align-self:center;} }\n/* 📏 s2c chem#27 */\n  .fm-goal{align-items:center;text-align:center;justify-self:center;max-width:100%;}\n  .fm-goal span{align-self:center !important;}\n/* 📏 s2c chem#28 */\n  .fm-kit button .ball{width:clamp(48px,9vmin,92px) !important;height:clamp(48px,9vmin,92px) !important;font-size:clamp(1.15rem,2.6vmin,1.9rem) !important;}\n  .fm-kit button{font-size:clamp(.68rem,1.4vmin,.95rem) !important;}\n  .tchip .ball{width:clamp(38px,5vmin,54px) !important;height:clamp(38px,5vmin,54px) !important;font-size:clamp(.95rem,1.8vmin,1.3rem) !important;}\n  .tchip button.tminus,.tchip button.tplus{width:clamp(40px,5.2vmin,56px) !important;height:clamp(40px,5.2vmin,56px) !important;font-size:clamp(1.55rem,3vmin,2.1rem) !important;}\n  .tchip b{font-size:clamp(1.2rem,2.4vmin,1.7rem);} .fm-tray .cap,.fm-kit .cap{font-size:clamp(.74rem,1.5vmin,1rem);}\n/* 📏 s2c chem#29 */\n  @media (max-height:520px){ .fm-tray .cap,.fm-kit .cap,.fm-eye{display:none;} .tchip .ball{width:30px !important;height:30px !important;} .tchip button.tminus,.tchip button.tplus{width:32px !important;height:32px !important;font-size:1.25rem !important;} .tchip b{font-size:1rem;} }\n  .tchip{display:inline-flex;align-items:center;gap:4px;background:#fff;color:#16233A;border-radius:22px;padding:3px 4px 3px 3px;font-weight:900;animation:sc-pop .3s both;}\n  .tchip .ball{width:30px;height:30px;font-size:.8rem;} .tchip button{border:0;background:#E4EEFB;border-radius:50%;width:30px;height:30px;font-weight:900;cursor:pointer;color:#16233A;}\n  .tchip .need{font-size:.72rem;color:#56667F;}\n/* 📏 s2c chem#30 */\n  .fm-kit{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;}\n  .fm-kit button{border:0;background:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;color:#C9D6EA;font-weight:800;font-size:.68rem;transform:translateZ(0);}\n/* 📏 s2c chem#31 */\n  .fm-kit button:active .ball{transform:scale(.9);} .fm-kit button.kglow .ball{animation:pt-glow .9s ease-in-out infinite;}\n/* 📏 s2c chem#32 */\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx{--gl-ts:-1.5px -1.5px 0 var(--gl-ink),1.5px -1.5px 0 var(--gl-ink),-1.5px 1.5px 0 var(--gl-ink),1.5px 1.5px 0 var(--gl-ink),0 2px 0 var(--gl-ink),0 -2px 0 var(--gl-ink),2px 0 0 var(--gl-ink),-2px 0 0 var(--gl-ink),0 0 10px var(--gl-g1),0 0 22px var(--gl-g2);\n    --gl-ts-s:-1px -1px 0 var(--gl-ink),1px -1px 0 var(--gl-ink),-1px 1px 0 var(--gl-ink),1px 1px 0 var(--gl-ink),0 1.5px 0 var(--gl-ink),0 -1.5px 0 var(--gl-ink),1.5px 0 0 var(--gl-ink),-1.5px 0 0 var(--gl-ink),0 0 8px var(--gl-g1);isolation:isolate;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx::before,:is(#scr-exp,#scr-formula,#scr-hunt).glx::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:-1;animation:var(--gl-anim) var(--gl-dur) ease-in-out infinite;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx::after{animation-duration:calc(var(--gl-dur) * 1.27);animation-delay:-2.1s;}\n/* 📏 s2c chem#33 */\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .am-top{background:linear-gradient(160deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.03) 55%,rgba(255,255,255,0.08) 100%);box-shadow:inset 0 0 0 1.5px var(--gl-rim),0 0 0 1px var(--gl-rim2),0 14px 40px rgba(0,0,0,0.45),0 0 34px var(--gl-glow);border-radius:24px;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .am-top::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0.4;animation:gl-tw 3.8s ease-in-out infinite;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .am-goal{position:relative;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .am-goal i{color:var(--gl-hi);text-shadow:var(--gl-ts-s);letter-spacing:0.12em;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .am-goal > b{color:#fff;text-shadow:var(--gl-ts);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .am-goal .am-need{color:#fff;background:linear-gradient(160deg,var(--gl-box),var(--gl-box2));box-shadow:inset 0 0 0 1.5px var(--gl-rim),0 0 18px var(--gl-glow);text-shadow:var(--gl-ts-s);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .am-goal .am-need b{color:var(--gl-hi);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .am-goal small:not(:empty){position:relative;color:#fff;text-shadow:var(--gl-ts-s);background:var(--gl-note);box-shadow:inset 0 0 0 1.5px var(--gl-notec);border-radius:16px;padding:0.35em 0.85em;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .am-goal small:not(:empty)::after{content:'';position:absolute;right:18px;bottom:-7px;width:12px;height:12px;background:var(--gl-note);box-shadow:1.5px 1.5px 0 var(--gl-notec);transform:rotate(45deg);}\n/* 📏 s2c chem#34 */\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick{gap:12px;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick .chip3{--a:var(--gl-c1a);--b:var(--gl-c1b);--g:var(--gl-c1g);color:#fff;border:0;border-radius:999px;min-height:clamp(54px,8vmin,72px);padding:8px 28px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:clamp(1.15rem,3vmin,1.7rem);\n    background:linear-gradient(135deg,var(--a),var(--b));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.4),inset 0 10px 14px -8px rgba(255,255,255,0.45),0 6px 22px var(--g),0 4px 0 rgba(0,0,0,0.35);text-shadow:var(--gl-ts-s);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick .chip3:nth-child(4n+2){--a:var(--gl-c2a);--b:var(--gl-c2b);--g:var(--gl-c2g);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick .chip3:nth-child(4n+3){--a:var(--gl-c3a);--b:var(--gl-c3b);--g:var(--gl-c3g);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick .chip3:nth-child(4n+4){--a:var(--gl-c4a);--b:var(--gl-c4b);--g:var(--gl-c4g);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick .chip3 small{color:rgba(255,255,255,0.88);}\n/* 📏 s2c chem#35 */\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick div.chip3{background:linear-gradient(160deg,var(--gl-box),var(--gl-box2));box-shadow:inset 0 0 0 2px var(--gl-rim),0 0 18px var(--gl-glow);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick .chip3 .tnum[style]{color:#fff !important;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick .chip3.on{background:linear-gradient(135deg,var(--a),var(--b));box-shadow:0 0 0 3px #fff,0 0 26px rgba(255,255,255,0.65),0 4px 0 rgba(0,0,0,0.35);filter:brightness(1.12);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick .chip3:disabled{opacity:0.38;filter:saturate(0.35);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.3);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick .chip3:active{transform:translateY(3px);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .fm-act .sp-btn.sp-primary,:is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick .sp-btn.sp-primary{border:0;border-radius:999px;color:#fff;font-family:'Fredoka',sans-serif;background:linear-gradient(90deg,var(--gl-ok1),var(--gl-ok2) 60%,var(--gl-ok3));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.45),0 8px 30px var(--gl-glow),0 4px 0 rgba(0,0,0,0.35);text-shadow:var(--gl-ts-s);padding-left:1.8em;padding-right:1.8em;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .fm-act .sp-btn.sp-primary{min-height:clamp(52px,7.5vmin,68px);font-size:clamp(1.15rem,2.8vmin,1.6rem);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick .sp-btn.sp-primary{min-height:clamp(48px,7vmin,62px);font-size:clamp(1.05rem,2.6vmin,1.45rem);}\n/* 📏 s2c chem#36 */\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .fm-msg{color:#fff;text-shadow:var(--gl-ts-s);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .fm-msg:not(:empty){background:rgba(255,255,255,0.07);box-shadow:inset 0 0 0 1.5px var(--gl-rim);border-radius:20px;padding:8px 16px;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .fm-msg.gm{display:flex;flex-direction:column;align-items:center;gap:4px;max-width:820px;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .fm-msg.ok{background:linear-gradient(135deg,var(--gl-okb1),var(--gl-okb3));box-shadow:inset 0 0 0 1.5px var(--gl-okr),0 10px 30px var(--gl-glow);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .fm-msg.try{background:var(--gl-tryb);box-shadow:inset 0 0 0 1.5px var(--gl-tryr);display:block;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .fm-msg.end{background:var(--gl-endb);box-shadow:inset 0 0 0 1.5px var(--gl-endr);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .gm-top{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .gm-h{display:inline-block;font-family:'Fredoka',sans-serif;font-weight:700;font-size:1.25em;line-height:1.2;padding:0.06em 0.6em;border-radius:12px;background:linear-gradient(90deg,var(--gl-ok1),var(--gl-ok2));box-shadow:0 0 18px var(--gl-okr);transform:rotate(-3deg);animation:gl-stamp .45s cubic-bezier(.2,1.6,.4,1) both;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .fm-msg.try .gm-h{background:linear-gradient(90deg,var(--gl-try1),var(--gl-try2));box-shadow:0 0 16px var(--gl-tryr);font-size:1.05em;margin-right:4px;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .gm-nb{font-weight:900;font-size:0.82em;padding:2px 10px;border-radius:99px;background:rgba(255,255,255,0.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.3);white-space:nowrap;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .gm-nb.new{background:linear-gradient(90deg,var(--gl-nb1),var(--gl-nb3));animation:gl-stamp .5s .15s cubic-bezier(.2,1.6,.4,1) both;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .gm-l{font-weight:900;font-size:0.8em;letter-spacing:0.12em;text-transform:uppercase;color:var(--gl-hi);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .gm-t{font-weight:800;line-height:1.3;text-wrap:balance;font-size:1.12em;}\n/* 📏 s2c chem#37 */\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .gl-trip i.done{background:linear-gradient(135deg,var(--gl-ok1),var(--gl-ok2));box-shadow:0 0 8px var(--gl-ok1);}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .gl-trip i.miss{background:linear-gradient(135deg,var(--gl-try1),var(--gl-try2));}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx .gl-trip i.cur{filter:drop-shadow(0 0 6px var(--gl-g1));}\n  @media (max-height:520px){ :is(#scr-exp,#scr-formula,#scr-hunt).glx .gm-l{display:none;} :is(#scr-exp,#scr-formula,#scr-hunt).glx .fm-msg:not(:empty){padding:4px 12px;} :is(#scr-exp,#scr-formula,#scr-hunt).glx .gm-h{font-size:1.05em;} :is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick .chip3{min-height:40px;padding:4px 16px;font-size:1rem;} :is(#scr-exp,#scr-formula,#scr-hunt).glx .fm-act .sp-btn.sp-primary,:is(#scr-exp,#scr-formula,#scr-hunt).glx .l3-pick .sp-btn.sp-primary{min-height:42px;font-size:1.05rem;} :is(#scr-exp,#scr-formula,#scr-hunt).glx .gm-t{font-size:1em;} :is(#scr-exp,#scr-formula,#scr-hunt).glx .am-goal small:not(:empty)::after{display:none;} }\n  @media (max-aspect-ratio:4/5){ :is(#scr-exp,#scr-formula,#scr-hunt).glx .am-goal small:not(:empty)::after{display:none;} }\n  @media (prefers-reduced-motion:reduce){ :is(#scr-exp,#scr-formula,#scr-hunt).glx::before,:is(#scr-exp,#scr-formula,#scr-hunt).glx::after{animation-name:gl-tw;} }\n/* 📏 s2c chem#38 */\n  :is(#scr-l3.glx,#scr-l3.acc-c,#scr-exp.glx,#scr-formula.glx) .fm-msg:not(:empty){flex-shrink:0;}\n/* 📏 s2c chem#39 */\n  :is(#scr-exp,#scr-formula,#scr-hunt) .gl-trip{display:flex;align-items:center;min-width:86px;height:26px;padding:0 4px;}\n  :is(#scr-exp,#scr-formula,#scr-hunt) .gl-trip i{width:11px;height:11px;border-radius:50%;flex:none;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-style:normal;font-size:16px;line-height:1;}\n  :is(#scr-exp,#scr-formula,#scr-hunt) .gl-trip i.cur{width:20px;height:20px;background:transparent;}\n  :is(#scr-exp,#scr-formula,#scr-hunt) .gl-trip u{flex:1 1 4px;min-width:3px;height:0;border-top:2px dotted rgba(255,255,255,0.55);}\n  :is(#scr-exp,#scr-formula,#scr-hunt) .gl-trip b{font-size:15px;line-height:1;margin-left:1px;filter:drop-shadow(0 0 6px rgba(200,255,140,0.9));}\n/* 📏 s2c chem#40 */\n  #scr-exp.glx .xopts{gap:12px;}\n  #scr-exp.glx .xopts button{--a:var(--gl-c1a);--b:var(--gl-c1b);--g:var(--gl-c1g);color:#fff;border:0;border-radius:999px;min-height:clamp(52px,7.5vmin,68px);padding:6px 24px;font-family:'Fredoka',sans-serif;font-weight:700;font-size:clamp(1.05rem,2.8vmin,1.55rem);\n    background:linear-gradient(135deg,var(--a),var(--b));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.4),inset 0 10px 14px -8px rgba(255,255,255,0.45),0 6px 22px var(--g),0 4px 0 rgba(0,0,0,0.35);text-shadow:var(--gl-ts-s);}\n  #scr-exp.glx .xopts button:nth-child(4n+2){--a:var(--gl-c2a);--b:var(--gl-c2b);--g:var(--gl-c2g);}\n  #scr-exp.glx .xopts button:nth-child(4n+3){--a:var(--gl-c3a);--b:var(--gl-c3b);--g:var(--gl-c3g);}\n  #scr-exp.glx .xopts button:nth-child(4n+4){--a:var(--gl-c4a);--b:var(--gl-c4b);--g:var(--gl-c4g);}\n  #scr-exp.glx .xopts button.yes{box-shadow:0 0 0 3px #fff,0 0 26px rgba(255,255,255,0.65),0 4px 0 rgba(0,0,0,0.35);filter:brightness(1.12);}\n  #scr-exp.glx .xopts button.no{filter:saturate(0.3) brightness(0.8);}\n  #scr-exp.glx .xopts button:disabled:not(.yes):not(.no){opacity:0.45;}\n  #scr-exp.glx .legend2 span{color:#16233A;box-shadow:0 0 0 1.5px rgba(255,255,255,0.7),0 0 12px var(--gl-glow);font-weight:900;}\n  #scr-exp.glx .xmeter{color:#fff;text-shadow:var(--gl-ts-s);}\n  #scr-exp.glx .fm-act .sp-btn.sp-secondary{border:0;border-radius:999px;color:#fff;font-family:'Fredoka',sans-serif;background:linear-gradient(90deg,var(--gl-c2a),var(--gl-c2b));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.45),0 8px 26px var(--gl-c2g),0 4px 0 rgba(0,0,0,0.35);text-shadow:var(--gl-ts-s);min-height:clamp(52px,7.5vmin,68px);font-size:clamp(1.05rem,2.6vmin,1.45rem);padding-left:1.6em;padding-right:1.6em;}\n/* 📏 s2c chem#41 */\n  #scr-formula.glx .fm-top{background:linear-gradient(160deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.03) 55%,rgba(255,255,255,0.08) 100%);box-shadow:inset 0 0 0 1.5px var(--gl-rim),0 0 0 1px var(--gl-rim2),0 14px 40px rgba(0,0,0,0.45),0 0 34px var(--gl-glow);border-radius:24px;}\n  #scr-formula.glx .fm-top::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0.4;animation:gl-tw 3.8s ease-in-out infinite;background:var(--gl-L3, none);}\n  #scr-formula.glx .fm-goal i{color:var(--gl-hi);text-shadow:var(--gl-ts-s);letter-spacing:0.12em;}\n  #scr-formula.glx .fm-goal > b{color:#fff;text-shadow:var(--gl-ts);}\n  #scr-formula.glx #fm-formula{color:#fff;background:linear-gradient(160deg,var(--gl-box),var(--gl-box2));box-shadow:inset 0 0 0 1.5px var(--gl-rim),0 0 18px var(--gl-glow);text-shadow:var(--gl-ts-s);}\n  #scr-formula.glx .fm-goal small{color:#fff;text-shadow:var(--gl-ts-s);}\n  #scr-formula.glx .fm-tray{background:linear-gradient(160deg,var(--gl-box),var(--gl-box2));box-shadow:inset 0 0 0 1.5px var(--gl-rim),0 0 18px var(--gl-glow);}\n  #scr-formula.glx .fm-tray .cap,#scr-formula.glx .fm-kit .cap{color:var(--gl-hi);text-shadow:var(--gl-ts-s);}\n  #scr-formula.glx .fm-tray .tchip{color:#fff;text-shadow:var(--gl-ts-s);}\n  #scr-formula.glx .fm-kit button{background:linear-gradient(160deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04));box-shadow:inset 0 0 0 1.5px var(--gl-rim),0 6px 18px rgba(0,0,0,0.35),0 0 16px var(--gl-glow);border-radius:20px;}\n  #scr-formula.glx .fm-kit .knm{color:#fff;text-shadow:var(--gl-ts-s);}\n  #scr-formula.glx .fm-act .sp-btn.sp-ghost{color:#fff;text-shadow:var(--gl-ts-s);box-shadow:inset 0 0 0 1.5px var(--gl-rim);border-radius:999px;}\n/* 📏 s2c chem#42 */\n  #scr-hunt.glx .clue-t{background:linear-gradient(160deg,var(--gl-box),var(--gl-box2)) !important;color:#fff;box-shadow:inset 0 0 0 1.5px var(--gl-rim),0 0 24px var(--gl-glow),0 8px 24px rgba(0,0,0,0.4) !important;}\n  #scr-hunt.glx .clue-t .ctag{background:linear-gradient(90deg,var(--gl-ok1),var(--gl-ok2));color:#fff;text-shadow:var(--gl-ts-s);}\n  #scr-hunt.glx .clue-t .cmain{color:#fff;text-shadow:var(--gl-ts);}\n  #scr-hunt.glx .clue-t .csub{color:var(--gl-hi);text-shadow:var(--gl-ts-s);}\n  #scr-hunt.glx .clue-t .cfb.ok{background:linear-gradient(90deg,var(--gl-okb1),var(--gl-okb3));color:#fff;box-shadow:inset 0 0 0 1.5px var(--gl-okr);text-shadow:var(--gl-ts-s);}\n  #scr-hunt.glx .clue-t .cfb.bad{background:var(--gl-tryb);color:#fff;box-shadow:inset 0 0 0 1.5px var(--gl-tryr);text-shadow:var(--gl-ts-s);}\n  #scr-hunt.glx .clue-t.ok,#scr-hunt.glx .clue-t.bad{background:linear-gradient(160deg,var(--gl-box),var(--gl-box2)) !important;}\n/* 📏 s2c chem#43 */\n  .fm-top{overflow:hidden;}\n  .fm > :not(.fm-top){position:relative;z-index:2;}\n  .fm-top canvas#fm-mol{contain:size;align-self:stretch;justify-self:stretch;}\n/* 📏 s2c chem#44 */\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx.acc-x{--gl-ink:#04130A;--gl-g1:rgba(175,255,120,0.8);--gl-g2:rgba(90,230,210,0.5);--gl-hi:#C8FF8A;--gl-rim:rgba(190,255,140,0.55);--gl-rim2:rgba(110,230,210,0.22);--gl-glow:rgba(150,235,90,0.22);--gl-box:rgba(18,52,26,0.92);--gl-box2:rgba(14,44,52,0.92);--gl-note:rgba(20,56,30,0.95);--gl-notec:rgba(120,240,210,0.55);--gl-ok1:#B8F55A;--gl-ok2:#3FD49A;--gl-ok3:#2FA8E0;--gl-try1:#FF9AB8;--gl-try2:#B07CFF;--gl-c1a:#9BE15D;--gl-c1b:#3FB76A;--gl-c1g:rgba(63,183,106,0.45);--gl-c2a:#3DE0C8;--gl-c2b:#1F8FD0;--gl-c2g:rgba(31,143,208,0.45);--gl-c3a:#B58CFF;--gl-c3b:#6B4DFF;--gl-c3g:rgba(107,77,255,0.45);--gl-c4a:#FFC24D;--gl-c4b:#FF8A3D;--gl-c4g:rgba(255,138,61,0.45);--gl-okb1:rgba(184,245,90,0.22);--gl-okb3:rgba(47,168,224,0.22);--gl-okr:rgba(184,245,90,0.65);--gl-tryb:rgba(255,154,184,0.14);--gl-tryr:rgba(255,154,184,0.58);--gl-endb:rgba(176,124,255,0.16);--gl-endr:rgba(176,124,255,0.58);--gl-nb1:rgba(184,245,90,0.4);--gl-nb3:rgba(47,168,224,0.4);--gl-s1:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23B8FF8A' fill-opacity='.32' stroke='%23B8FF8A' stroke-width='1.6'/%3E%3Ccircle cx='13.5' cy='13' r='3.4' fill='%23B8FF8A' fill-opacity='.7'/%3E%3Ccircle cx='8' cy='7.6' r='2.2' fill='white' fill-opacity='.85'/%3E%3C/svg%3E\");--gl-s2:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='9' fill='none' stroke='%237FF0E0' stroke-width='2.4'/%3E%3Ccircle cx='12' cy='12' r='4.5' fill='none' stroke='%237FF0E0' stroke-width='1.6' stroke-opacity='.6'/%3E%3C/svg%3E\");--gl-s3:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 0C12.9 8.2 15.8 11.1 24 12C15.8 12.9 12.9 15.8 12 24C11.1 15.8 8.2 12.9 0 12C8.2 11.1 11.1 8.2 12 0Z' fill='%23F0FFE0'/%3E%3C/svg%3E\");--gl-s4:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23C9A4FF' fill-opacity='.32' stroke='%23C9A4FF' stroke-width='1.6'/%3E%3Ccircle cx='13.5' cy='13' r='3.4' fill='%23C9A4FF' fill-opacity='.7'/%3E%3Ccircle cx='8' cy='7.6' r='2.2' fill='white' fill-opacity='.85'/%3E%3C/svg%3E\");--gl-anim:gl-rise;--gl-dur:6.8s;background:radial-gradient(70% 45% at 10% 8%,rgba(150,235,90,0.26),transparent 70%),radial-gradient(60% 45% at 95% 62%,rgba(60,220,200,0.22),transparent 70%),radial-gradient(60% 40% at 45% 108%,rgba(170,110,255,0.22),transparent 70%),#04120B;;--gl-L3:var(--gl-s1) 41.1% 7.0% / 9px 9px no-repeat, var(--gl-s2) 32.1% 40.6% / 16px 16px no-repeat, var(--gl-s3) 11.6% 54.0% / 13px 13px no-repeat, var(--gl-s4) 42.8% 80.2% / 9px 9px no-repeat, var(--gl-s1) 21.7% 39.2% / 11px 11px no-repeat, var(--gl-s2) 66.8% 31.6% / 11px 11px no-repeat, var(--gl-s3) 43.5% 45.0% / 13px 13px no-repeat, radial-gradient(1.6px 1.6px at 5.5% 2.8%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 91.0% 4.0%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 76.0% 86.6%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 50.7% 89.1%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 11.3% 28.5%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 33.1% 57.2%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 82.0% 94.3%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 90.7% 49.5%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 42.1% 17.3%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 10.1% 65.3%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx.acc-x::before{background:var(--gl-s1) 60.3% 72.7% / 9px 9px no-repeat, var(--gl-s2) 47.4% 31.1% / 16px 16px no-repeat, var(--gl-s3) 41.9% 52.5% / 11px 11px no-repeat, var(--gl-s4) 25.5% 57.1% / 9px 9px no-repeat, var(--gl-s1) 81.5% 20.3% / 13px 13px no-repeat, var(--gl-s2) 20.2% 17.0% / 20px 20px no-repeat, var(--gl-s3) 15.1% 36.9% / 13px 13px no-repeat, var(--gl-s4) 91.9% 8.8% / 9px 9px no-repeat, var(--gl-s1) 16.4% 27.6% / 11px 11px no-repeat, radial-gradient(1px 1px at 42.4% 84.1%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 61.1% 40.4%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 91.4% 6.4%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 97.3% 96.6%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 23.9% 56.4%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 89.8% 78.6%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 67.9% 78.7%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 86.8% 51.2%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 38.3% 60.8%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 49.5% 39.4%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 68.1% 91.9%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 23.6% 93.0%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 88.1% 29.3%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 63.0% 93.3%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 91.0% 90.4%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 92.1% 41.7%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 44.7% 75.6%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 83.8% 73.4%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 15.8% 63.7%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 25.1% 33.3%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 10.1% 88.3%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 53.8% 34.4%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 33.7% 14.8%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 85.6% 16.2%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 6.9% 70.7%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 60.7% 17.3%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx.acc-x::after{background:var(--gl-s1) 87.8% 41.7% / 11px 11px no-repeat, var(--gl-s2) 75.5% 19.2% / 9px 9px no-repeat, var(--gl-s3) 25.9% 63.9% / 13px 13px no-repeat, var(--gl-s4) 3.2% 87.2% / 11px 11px no-repeat, var(--gl-s1) 17.9% 16.6% / 11px 11px no-repeat, var(--gl-s2) 24.6% 39.7% / 11px 11px no-repeat, var(--gl-s3) 61.5% 14.4% / 9px 9px no-repeat, var(--gl-s4) 93.2% 59.6% / 9px 9px no-repeat, var(--gl-s1) 64.3% 43.6% / 16px 16px no-repeat, radial-gradient(1.3px 1.3px at 35.8% 87.4%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 39.7% 23.9%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 61.5% 91.8%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 58.1% 23.0%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 95.9% 94.6%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 26.4% 71.0%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 27.0% 12.4%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 55.2% 20.7%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 33.9% 5.9%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 16.1% 32.2%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 78.1% 38.3%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 20.4% 46.5%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 40.9% 79.4%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 60.3% 23.3%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 82.2% 8.9%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 94.8% 6.2%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 12.2% 35.6%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 24.6% 44.8%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat;}\n  :is(#scr-exp,#scr-formula,#scr-hunt).glx.acc-x .am-top::before{background:var(--gl-s1) 41.1% 7.0% / 9px 9px no-repeat, var(--gl-s2) 32.1% 40.6% / 16px 16px no-repeat, var(--gl-s3) 11.6% 54.0% / 13px 13px no-repeat, var(--gl-s4) 42.8% 80.2% / 9px 9px no-repeat, var(--gl-s1) 21.7% 39.2% / 11px 11px no-repeat, var(--gl-s2) 66.8% 31.6% / 11px 11px no-repeat, var(--gl-s3) 43.5% 45.0% / 13px 13px no-repeat, radial-gradient(1.6px 1.6px at 5.5% 2.8%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 91.0% 4.0%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 76.0% 86.6%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 50.7% 89.1%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 11.3% 28.5%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.6px 1.6px at 33.1% 57.2%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 82.0% 94.3%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 90.7% 49.5%, rgba(255,255,255,0.55) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1px 1px at 42.1% 17.3%, rgba(255,255,255,0.7) 99%, transparent) 0 0 / 100% 100% no-repeat, radial-gradient(1.3px 1.3px at 10.1% 65.3%, rgba(255,255,255,0.9) 99%, transparent) 0 0 / 100% 100% no-repeat;}\n/* 📏 s2c chem#45 */\n  #scr-formula .fm-tray,#scr-formula .fm-kit,#scr-formula .fm-msg:not(:empty){flex-shrink:0;}\n/* 📏 s2c chem#46 */\n  @media (max-width:430px){ #scr-formula .fm-tray{gap:6px 8px !important;padding:6px 6px !important;} #scr-formula .tchip{gap:4px !important;}\n    #scr-formula .tchip .ball{width:32px !important;height:32px !important;font-size:.85rem !important;}\n    #scr-formula .tchip button.tminus,#scr-formula .tchip button.tplus{width:36px !important;height:36px !important;font-size:1.35rem !important;}\n    #scr-formula .tchip b{font-size:1.05rem;min-width:2ch;} }\n");
/* 📏 s2c chem#1 */
const BYSYM = {}; EL.forEach(e => { BYSYM[e.sym] = e; });
/* 📏 s2c chem#2 */
const COMPS = CT.comps.map(a => ({id: a[0], name: a[1], f: a[2], icon: a[3], where: a[4], tier: a[5], cnt: a[6]}));
/* 📏 s2c chem#3 */
const DARK = {C: 1, N: 1, Br: 1, I: 1, K: 1, Na: 1, Ca: 1, W: 1, Zn: 1};
const STATE = {s: ['🧊', 'Solid'], l: ['💧', 'Liquid'], g: ['💨', 'Gas'], '?': ['❔', 'Nobody knows yet']};
const FAMOUS = [1, 2, 6, 7, 8, 11, 12, 13, 14, 17, 19, 20, 26, 29, 30, 47, 50, 79, 80, 82];
/* 📏 s2c chem#4 */
let HG = null, FG = null, HBUD = null, FBUD = null, PT_LAST = {};
/* 📏 s2c chem#5 */
function ballHtml(sym, size){ if(window.AtomSkins) return '<img class="ball" src="' + AtomSkins.url(sym, CPK[sym] || AtomSkins.colour(sym), atomSkin(), 64) + '" alt="' + sym + '"' + (size ? ' style="width:' + size + 'px;height:' + size + 'px"' : '') + '>';   // 🎨 sc-2b
   const c = CPK[sym] || '#F5A3C7'; return '<span class="ball' + (DARK[sym] ? ' dark' : '') + '" style="background:' + c + (size ? ';width:' + size + 'px;height:' + size + 'px' : '') + '">' + sym + '</span>'; }
const HBAR = UI.gameBar($('hbar'), {game: GAME_ID, icon: '🔍', name: 'Element hunt', levelId: 'hunt-level', levels: () => leaveChem(true), playing: () => !!(HG && !HG.done), onLeave: () => { if(HG) HG.done = true; }, scoreMin: '5ch', onFit: () => layoutHunt()});
HBAR.score(0); HBAR.miss(0); HBAR.count('clue', '🔍', '1/8', 'Clue');
const FBAR = UI.gameBar($('fbar'), {game: GAME_ID, icon: '⚛️', name: 'Formula builder', levelId: 'fm-level', levels: () => leaveChem(true), playing: () => !!(FG && !FG.done), onLeave: () => { if(FG) FG.done = true; }, scoreMin: '5ch', onFit: () => drawMol()});
FBAR.score(0); FBAR.miss(0); FBAR.count('mol', '⚛️', '1/5', 'Molecule');

// ---------- hub ----------
function openChem(lv){
  SET.level = lv; const U = LEVEL_UI[lv];
  $('chem-sub').textContent = U.emoji + ' ' + U.name + ' · ' + {0: '🔤 match the letters — the table glows to help you', 1: '🔤 find the letters', 2: '🔢 find the numbers', 3: '📛 names only', 4: '💡 facts, the name hidden', 5: '💡 facts against the clock'}[lv];
  $('chem-count').innerHTML = '<span>📇 ' + CHEM.all.length + ' / 118 element cards</span><span>⚛️ ' + CHEM.c.length + ' / ' + COMPS.length + ' molecules</span>';
  const H = [['hunt', '🔍', 'Element hunt', 'Find 8 elements on the table from clues — each find = a 📇 card'], ['formula', '⚛️', 'Formula builder', 'Snap atoms together into 5 real molecules'], ['table', '🧪', 'Periodic table', 'All 118 elements — your ⭐ cards + every fact'], ['xlab', '🧫', 'Kitchen lab', '5 safe experiments — colours, crystals, fizz + rust']];
  $('chem-hub').innerHTML = H.map((h, i) => '<button class="pick" data-g="' + h[0] + '" data-sound="pop" style="animation:sc-pop .4s ' + (i * 0.08) + 's both"><div class="big">' + h[1] + '</div><div class="nm">' + h[2] + '</div><div class="sub">' + h[3] + '</div></button>').join('');
  $('chem-hub').querySelectorAll('[data-g]').forEach(b => b.onclick = () => { const g = b.dataset.g; if(g === 'hunt') startHunt(); else if(g === 'formula') startFormula(); else if(g === 'xlab') openXhub(); else openTable(); });
  renderSkins('chem-skins'); showScreen('chem');
  if(lv === 0) setTimeout(() => { if(!$('scr-chem').classList.contains('hidden')){ const b = $('chem-hub').querySelector('[data-g="hunt"]'); b.classList.add('glow-next'); labHand(b); } }, 400 * SCI_FX);
}
function leaveChem(toLevels){ stopHunt(); stopFormula(); stopExp(); hideResult(); labHand(null); if(toLevels){ renderMenu(); showScreen('menu'); } else openChem(SET.level); }

// ---------- the table painter: one layout for explore + hunt (sideways on tall screens) ----------
function rowY(r){ return r <= 7 ? r - 1 : r === 9 ? 7.35 : 8.35; }
function drawTable(box, opt){
  opt = opt || {}; PT_LAST[box.id] = opt;
  const host = opt.host || box.parentElement, R = host.getBoundingClientRect(), pad = 4;
  const W = Math.max(60, R.width - pad * 2), Hh = Math.max(60, (opt.maxH || R.height) - pad * 2);
  const csN = Math.floor(Math.min(W / 18, Hh / 9.35)), csF = Math.floor(Math.min(W / 9.35, Hh / 18)), flip = opt.flip !== false && csF > csN * 1.3;   // sc-2a2: turn sideways only when it gives MUCH bigger squares (phones held upright) — the normal table is easier to read
  const cs = flip ? csF : csN, gw = flip ? cs * 9.35 : cs * 18, gh = flip ? cs * 18 : cs * 9.35;
  box.style.width = gw + 'px'; box.style.height = gh + 'px'; box.dataset.flip = flip ? 1 : 0; box.dataset.cs = cs;
  if(opt.center !== false){ box.style.top = Math.max(0, (R.height - gh) / 2) + 'px'; }
  const g = 2, at = (r, c) => flip ? [(r <= 7 ? r + 1.35 : r - 9) * cs, (r <= 7 ? c - 1 : c - 2) * cs] : [(c - 1) * cs, rowY(r) * cs]; // sideways: the two f-block rows stand on the left, so He (bottom) stays clear of the 💬 bubble
  let h = '';
  [[6, '57–71'], [7, '89–103']].forEach(p => { const xy = at(p[0], 3); h += '<div class="pt-ph" style="left:' + xy[0] + 'px;top:' + xy[1] + 'px;width:' + (cs - g) + 'px;height:' + (cs - g) + 'px">' + (cs >= 34 ? p[1] : '') + '</div>'; });
  const fs = Math.max(9, cs * 0.42), nfs = Math.max(opt.num === 'big' ? 9 : 7, cs * (opt.num === 'big' ? 0.3 : 0.24)), showN = opt.num === 'none' ? false : opt.num === 'big' ? cs >= 18 : cs >= 30;   // sc-2a2: 🔥 numbers always shown · 💀 none
  EL.forEach(e => { const xy = at(e.row, e.col), got = chemGot(e.n), cls = 'pt-cell' + (opt.mode === 'explore' ? (got ? ' got' : ' no') : '');
    h += '<button class="' + cls + '" data-n="' + e.n + '" data-sound="none" aria-label="' + e.name + '" style="left:' + xy[0] + 'px;top:' + xy[1] + 'px;width:' + (cs - g) + 'px;height:' + (cs - g) + 'px;background:' + CATS[e.cat].col + ';font-size:' + fs + 'px">' +
      (showN ? '<i style="font-size:' + nfs + 'px">' + e.n + '</i>' : '') + '<b>' + e.sym + '</b></button>'; });
  box.innerHTML = h;
  box.querySelectorAll('.pt-cell').forEach(b => b.onclick = () => (opt.onTap || openElement)(Number(b.dataset.n), b));
}
function chemResize(){
  if(!$('scr-hunt').classList.contains('hidden')) layoutHunt();
  if(!$('scr-table').classList.contains('hidden')) drawExplore();
  if(!$('scr-formula').classList.contains('hidden')) drawMol();
}

// ---------- 🧪 explore + 📇 cards ----------
function openTable(){
  showScreen('table'); labHand(null);
  $('pt-legend').innerHTML = CT.cats.map(c => '<span style="background:' + c[2] + '" title="' + UI.esc(c[3]) + '">' + UI.esc(c[1]) + '</span>').join('');
  $('table-sub').textContent = '📇 ' + CHEM.all.length + ' / 118 are yours (⭐) — tap any element to see its card';
  drawExplore();
  $('pt-stamps').innerHTML = CT.cats.map(c => { const all = EL.filter(e => e.cat === c[0]), got = all.filter(e => chemGot(e.n)).length; return '<span class="' + (got === all.length ? 'done' : '') + '">' + (got === all.length ? '🏅 ' : '') + UI.esc(c[1]) + ' ' + got + '/' + all.length + '</span>'; }).join('');
}
function drawExplore(){ const box = $('pt-explore'); drawTable(box, {mode: 'explore', host: box.parentElement, maxH: Math.max(300, innerHeight - 220), flip: false, center: false}); box.parentElement.style.minHeight = box.style.height; }
function matsWith(n){ const out = []; Object.keys(CHEM.mats || {}).forEach(m => { if((CHEM.mats[m] || []).indexOf(n) >= 0){ const M = META().mats[m]; out.push((M ? M.icon + ' ' + M.name : m)); } }); return out; }
function openElement(n){
  const e = EL[n - 1]; if(!e) return; const C = CATS[e.cat], got = chemGot(n), mats = matsWith(n), st = STATE[e.state];
  const how = CHEM.craft.indexOf(n) >= 0 ? 'you crafted with it in 🏭 Artifactory' : CHEM.e.indexOf(n) >= 0 ? 'you found it in the lab' : '';
  $('elc-card').innerHTML = '<button class="x" data-sound="tap" aria-label="Close">✖</button><div class="elc-top"><div class="elc-tile" style="background:' + C.col + '"><i>' + e.n + '</i><b>' + e.sym + '</b><small>' + UI.esc(e.name) + '</small></div>' +
    '<div><h3>' + UI.esc(e.name) + '</h3><p>' + UI.esc(C.name) + ' · ' + UI.esc(C.what) + '</p></div></div>' +
    '<div class="row"><span>' + st[0] + ' ' + st[1] + ' at room temperature</span><span>🔢 Atomic number ' + e.n + '</span><span>' + (e.row <= 7 ? '↔️ Row ' + e.row + ' · column ' + e.col : '🧲 ' + (e.row === 9 ? 'Lanthanide' : 'Actinide') + ' row') + '</span></div>' +
    '<div class="txt">💡 ' + UI.esc(e.fact) + '<br>📍 Where you meet it: ' + UI.esc(e.where) + '</div>' +
    (mats.length ? '<div class="row"><span>🏭 In Artifactory: ' + mats.map(UI.esc).join(' · ') + '</span></div>' : '') +
    '<canvas id="elc-atom" width="760" height="240"></canvas><div class="row"><span>⚛️ Electrons per shell: ' + e.shells.join(' · ') + '</span></div>' +
    '<div class="got' + (got ? '' : ' no') + '">' + (got ? '📇 ⭐ In your collection — ' + how : '🔒 Not yours yet — find it in 🔍 Element hunt' + (mats.length ? ' or craft with ' + mats[0] : '')) + '</div>';
  $('elc').classList.remove('hidden'); $('elc-card').querySelector('.x').onclick = closeElement; $('elc').onclick = ev => { if(ev.target.id === 'elc') closeElement(); };
  drawAtom($('elc-atom'), e, 0);
  gcEmit('element', {n: e.n, sym: e.sym});
}
/* 📏 s2c chem#6 */
// a little Bohr atom: nucleus + one ring per shell, electrons as dots
function drawAtom(cv, e, t){
  if(!cv) return; const g = cv.getContext('2d'), W = cv.width, H = cv.height, cx = W / 2, cy = H / 2, n = e.shells.length, rmax = H * 0.46;
  g.clearRect(0, 0, W, H); g.fillStyle = '#F25F5C'; g.beginPath(); g.arc(cx, cy, 14, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '800 14px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e.sym, cx, cy + 1);
  e.shells.forEach((k, i) => { const rx = 24 + (W * 0.42 - 24) * (i + 1) / n, ry = 18 + (rmax - 18) * (i + 1) / n; g.strokeStyle = 'rgba(126,219,196,0.45)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.stroke();
    for(let j = 0; j < k; j++){ const a = j / k * Math.PI * 2 + t * (0.6 / (i + 1)) + i; g.fillStyle = '#FFC845'; g.beginPath(); g.arc(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, k > 18 ? 2.6 : 4, 0, 7); g.fill(); } });
}

// ---------- 🔍 ELEMENT HUNT ----------
function huntPool(lv){   // sc-2a2 ladder: who you hunt grows with the level (famous → first rows → everything)
  if(lv === 0) return FAMOUS.slice(); if(lv === 1) return FAMOUS.concat([3, 9, 10, 15, 16, 18, 22, 24, 27, 28, 53, 54, 74, 78, 86, 92]);
  if(lv === 2) return rangeN(1, 56); if(lv === 3) return rangeN(1, 56).concat([74, 78, 79, 80, 82, 86, 92]); if(lv === 4) return rangeN(1, 86).concat([92, 94]); return rangeN(1, 118); }
function clueOf(e, lv){   // sc-2a2: difficulty = what the clue gives you → {tag, main, sub}
  const fam = CATS[e.cat].name, hide = t => t.replace(new RegExp(e.name, 'ig'), '___');
  if(lv === 0) return {tag: '🔤 Match the letters', main: 'Find ' + e.name + ' — ' + e.sym, sub: 'Look in ' + rowText(e)};
  if(lv === 1) return {tag: '🔤 Letters', main: 'Find ' + e.sym + ' — ' + e.name, sub: 'Look for the big letters ' + e.sym};
  if(lv === 2) return {tag: '🔢 Number', main: 'Find number ' + e.n, sub: 'The small numbers count up row by row'};
  if(lv === 3) return {tag: '📛 Name only', main: 'Find ' + e.name, sub: 'Family: ' + fam};
  if(lv === 4) return {tag: '💡 Fact', main: hide(e.fact), sub: 'Family: ' + fam};
  return {tag: '💡 Fact · ⏱️ 15 s', main: hide(e.fact), sub: 'No numbers on the squares — think!'};
}
function rowText(e){ return e.row <= 7 ? 'row ' + e.row : e.row === 9 ? 'the lanthanide row (under the table)' : 'the actinide row (under the table)'; }
function moreHelp(e, lv, tries){   // one more help after each miss
  if(lv === 0) return {cell: true};
  if(lv === 1) return tries === 1 ? {sub: 'It is in ' + rowText(e), row: true} : {cell: true};
  if(lv === 2) return tries === 1 ? {sub: 'Number ' + e.n + ' is in ' + rowText(e), row: true} : {cell: true};
  if(lv === 3) return tries === 1 ? {sub: 'Its symbol is ' + e.sym} : {sub: 'Its symbol is ' + e.sym + ' · ' + rowText(e), row: true};
  if(lv === 4) return tries === 1 ? {sub: 'It is ' + e.name + ' (' + e.sym + ')'} : {sub: 'It is ' + e.name + ' (' + e.sym + ') · ' + rowText(e), row: true};
  return tries === 1 ? {sub: 'Family: ' + CATS[e.cat].name} : {sub: 'It is ' + e.name};
}
function startHunt(){
  const lv = SET.level, pool = shuffle(huntPool(lv)), fresh = pool.filter(n => !chemGot(n)), old = pool.filter(n => chemGot(n));
  const targets = []; while(targets.length < 8 && (fresh.length || old.length)){ const take = (targets.length % 2 === 0 ? fresh : old).length ? (targets.length % 2 === 0 ? fresh : old) : fresh.length ? fresh : old; targets.push(take.shift()); }
  HG = {lv, targets, i: 0, tries: 0, first: 0, score: 0, miss: 0, found: [], t0: Date.now(), done: false, tm: 0};
  hideResult(); labHand(null); showScreen('hunt'); HBAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); HBAR.score(0); HBAR.miss(0); HBAR.fit();
  try{ if(HBUD) HBUD.stop(); HBUD = UI.buddy ? UI.buddy($('hunt-buddy'), {name: S.player + '·lab', av: suitAv(S.player)}, {per: 2}) : null; }catch(e){ HBUD = null; }
  layoutHunt(); huntNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'chem'); gcEmit('start', {game: 'hunt'});
}
function stopHunt(){ if(HG){ HG.done = true; clearTimeout(HG.tm); clearTimeout(HG.gt); clearTimeout(HG.gt2); } if(HBUD){ HBUD.stop(); HBUD = null; } $('hunt-hand').classList.add('hidden'); huntClueOff(); }   // sc-2a2
function layoutHunt(){   // sc-2a2: wide table → the clue sits in the table's empty middle; tall phones → on top
  if(!HG) return; const cl = $('hunt-clue'), box = $('pt-hunt'), o = {mode: 'hunt', host: $('hunt-box'), onTap: huntTap, num: HG.lv === 2 ? 'big' : HG.lv === 5 ? 'none' : ''};
  cl.classList.add('ingap'); cl.removeAttribute('style'); drawTable(box, o);
  if(box.dataset.flip === '1' || +box.dataset.cs < 26){ cl.classList.remove('ingap'); cl.removeAttribute('style'); drawTable(box, o); }
  placeClue(); huntGuide();
}
function placeClue(){
  const cl = $('hunt-clue'), box = $('pt-hunt'), t = $('hunt-text');
  if(!cl.classList.contains('ingap')){ t.style.fontSize = ''; return; }
  const cs = +box.dataset.cs, r = box.getBoundingClientRect(), f = Math.max(13, Math.min(42, cs * 0.44));
  Object.assign(cl.style, {left: (r.left + 2 * cs + 2) + 'px', top: (r.top + 2) + 'px', width: (10 * cs - 6) + 'px', height: (3 * cs - 6) + 'px'});
  cl.style.setProperty('--cf', f + 'px'); fitClue();
}
function fitClue(){   // shrink a long fact until it fits the card
  const cl = $('hunt-clue'), t = $('hunt-text'); if(!cl.classList.contains('ingap')) return;
  let f = parseFloat(cl.style.getPropertyValue('--cf')) || 18; t.style.setProperty('font-size', f + 'px', 'important');
  for(let i = 0; i < 10 && t.scrollHeight > t.clientHeight + 1; i++){ f *= 0.9; t.style.setProperty('font-size', f + 'px', 'important'); }
}
function huntNext(){
  if(!HG || HG.done) return; clearTimeout(HG.tm); clearTimeout(HG.gt); clearTimeout(HG.gt2);
  if(HG.i >= HG.targets.length) return huntEnd();
  const e = EL[HG.targets[HG.i] - 1], c = clueOf(e, HG.lv); HG.tries = 0; HG.clueT = Date.now();
  const t = $('hunt-text'); t.className = 'clue-t'; void t.offsetWidth;
  t.innerHTML = '<span class="ctag">' + UI.esc(c.tag) + '</span><b class="cmain">' + UI.esc(c.main) + '</b><small class="csub" id="hunt-sub">' + UI.esc(c.sub) + '</small><span class="cfb" id="hunt-fb"></span>';
  fitClue(); HBAR.count('clue', '🔍', (HG.i + 1) + '/' + HG.targets.length, 'Clue');
  HG.rowOn = false; HG.cellOn = false; huntGuide();
  // 🌱 Basic gives time to look first: the row glows after 3 s, the square + 👆 after 8 s · 🐣 the row after 10 s
  if(HG.lv === 0){ HG.gt = setTimeout(() => { if(HG){ HG.rowOn = true; huntGuide(); } }, 3000 * SCI_FX); HG.gt2 = setTimeout(() => { if(HG){ HG.cellOn = true; huntGuide(); } }, 8000 * SCI_FX); }
  if(HG.lv === 1) HG.gt = setTimeout(() => { if(HG){ HG.rowOn = true; huntGuide(); } }, 10000 * SCI_FX);
  if(HG.lv === 5) HG.tm = setTimeout(() => { if(HG && !HG.done && HG.targets[HG.i] === e.n){ HG.miss++; HBAR.miss(HG.miss); huntSay('⏱️ Time! It was ' + e.name + ' (' + e.sym + ')', 'bad'); flashCell(e.n, 'hit'); HG.i++; HG.wait = true; setTimeout(() => { if(HG){ HG.wait = false; huntNext(); } }, 1400 * SCI_FX); } }, 15000);
}
function huntGuide(){
  if(!HG || HG.i >= HG.targets.length) return; const e = EL[HG.targets[HG.i] - 1];
  document.querySelectorAll('#pt-hunt .pt-cell').forEach(b => { const x = EL[b.dataset.n - 1]; b.classList.toggle('rowglow', !!HG.rowOn && x.row === e.row); b.classList.toggle('glow', !!HG.cellOn && x.n === e.n); });
  const hand = $('hunt-hand'); if(HG.cellOn){ const b = document.querySelector('#pt-hunt [data-n="' + e.n + '"]'); if(b){ const r = b.getBoundingClientRect(); hand.style.left = (r.left + r.width * 0.5) + 'px'; hand.style.top = (r.top + r.height * 0.5) + 'px'; hand.classList.remove('hidden'); } } else hand.classList.add('hidden');
}
function flashCell(n, cls){ const b = document.querySelector('#pt-hunt [data-n="' + n + '"]'); if(!b) return; b.classList.remove(cls); void b.offsetWidth; b.classList.add(cls); setTimeout(() => b.classList.remove(cls), 800); }
function huntSay(t, mood){ const el = $('hunt-fb'); if(!el) return; el.className = 'cfb ' + (mood || ''); el.textContent = t; fitClue(); }   // sc-2a2: the clue stays, the answer goes in the strip under it
function huntTap(n){
  if(!HG || HG.done || HG.i >= HG.targets.length || HG.wait) return; const want = HG.targets[HG.i], e = EL[want - 1];
  if(n === want){
    const pts = [100, 50, 20][Math.min(2, HG.tries)]; HG.score += pts; if(HG.tries === 0) HG.first++; HG.found.push(n); UISound.play('success'); flashCell(n, 'hit'); if(HBUD) HBUD.react('joy');
    const isNew = !chemGot(n) && HG.found.indexOf(n) === HG.found.length - 1;
    huntSay('✅ ' + e.name + ' (' + e.sym + ')! ' + (isNew ? '📇 New card! ' : '') + '+' + pts, 'ok'); HBAR.score(Math.round(HG.score * SCI_MULT(HG.lv))); gcEmit('right', {n});
    HG.i++; HG.wait = true; clearTimeout(HG.tm); clearTimeout(HG.gt); clearTimeout(HG.gt2); HG.cellOn = true; huntGuideAt(e);   // the found square stays lit while the kid looks
    setTimeout(() => { if(HG){ HG.wait = false; huntNext(); } }, (HG.lv <= 1 ? 1600 : 1100) * SCI_FX);
  } else {
    const x = EL[n - 1]; HG.tries++; HG.miss++; HBAR.miss(HG.miss); UISound.play('error'); flashCell(n, 'miss'); if(HBUD) HBUD.react('miss');
    huntSay('That is ' + x.name + ' (' + x.sym + ', ' + x.n + ') — try again!', 'bad'); gcEmit('wrong', {n});
    const h = moreHelp(e, HG.lv, HG.tries); if(h.sub && $('hunt-sub')) $('hunt-sub').textContent = h.sub; if(h.row) HG.rowOn = true; if(h.cell){ HG.rowOn = true; HG.cellOn = true; } huntGuide(); fitClue();
  }
}
function huntGuideAt(e){ document.querySelectorAll('#pt-hunt .pt-cell').forEach(b => { b.classList.toggle('rowglow', false); b.classList.toggle('glow', +b.dataset.n === e.n); }); $('hunt-hand').classList.add('hidden'); }
/* 📏 s2c chem#7 */
function huntEnd(){
  HG.done = true; clearTimeout(HG.tm); $('hunt-hand').classList.add('hidden');
  const total = HG.targets.length, acc = HG.first / total, stars = acc >= 0.9 ? 3 : acc >= 0.6 ? 2 : 1, score = Math.round(HG.score * SCI_MULT(HG.lv));
  chemSave('hunt', {found: HG.found, built: [], right: HG.first, total, score, stars, timeSec: Math.round((Date.now() - HG.t0) / 1000)});
}

// ---------- ⚛️ FORMULA BUILDER ----------
const FM_TIERS = [[0], [0, 1, 1], [1, 2, 2], [2, 3, 3], [3, 4, 4], [4, 5, 5]];
function startFormula(){
  const lv = SET.level, tiers = FM_TIERS[lv], list = [], used = {};
  for(let i = 0; i < 5; i++){ const t = tiers[i % tiers.length]; const pool = shuffle(COMPS.filter(c => c.tier === t && !used[c.id])); const c = pool[0] || shuffle(COMPS.filter(c => !used[c.id] && c.tier <= Math.max(...tiers)))[0]; used[c.id] = 1; list.push(c); }
  FG = {lv, list, i: 0, tries: 0, first: 0, score: 0, miss: 0, built: [], found: [], t0: Date.now(), done: false};
  hideResult(); labHand(null); showScreen('formula'); FBAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); FBAR.score(0); FBAR.miss(0); FBAR.fit();
  try{ if(FBUD) FBUD.stop(); FBUD = UI.buddy ? UI.buddy($('fm-buddy'), {name: S.player + '·lab', av: suitAv(S.player)}, {per: 2}) : null; }catch(e){ FBUD = null; }
  fmNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'chem'); gcEmit('start', {game: 'formula'});
}
function stopFormula(){ if(FG) FG.done = true; if(FBUD){ FBUD.stop(); FBUD = null; } }
function fmNext(){
  if(!FG || FG.done) return; if(FG.i >= FG.list.length) return fmEnd();
  const c = FG.list[FG.i], need = Object.keys(c.cnt), decoyN = [0, 1, 2, 2, 3, 3][FG.lv], pool = shuffle(['H', 'C', 'N', 'O', 'Na', 'Cl', 'S', 'Ca', 'Fe', 'K', 'Mg', 'Si', 'Cu'].filter(x => need.indexOf(x) < 0));
  FG.kit = shuffle(need.concat(pool.slice(0, decoyN))); FG.tray = {}; FG.tries = 0; FG.hint = FG.lv <= 2; FG.solved = false;
  FBAR.count('mol', '⚛️', (FG.i + 1) + '/' + FG.list.length, 'Molecule');
  $('fm-name').textContent = c.icon + ' ' + c.name; $('fm-where').textContent = FG.lv >= 4 ? '' : '📍 ' + c.where; fmFormula();
  $('fm-msg').className = 'fm-msg'; $('fm-msg').textContent = FG.lv === 0 ? '👆 Tap the glowing atom to add it' : '';
  fmRender();
}
function fmFormula(){ const c = FG.list[FG.i]; $('fm-formula').innerHTML = FG.hint || FG.solved ? sub(c.f) : '❓'; }
function fmRender(){
  const c = FG.list[FG.i], keys = Object.keys(FG.tray).filter(k => FG.tray[k] > 0);
  $('fm-tray').innerHTML = '<span class="cap">🧪 Your molecule</span>' + (keys.length ? keys.map(k => '<span class="tchip" data-k="' + k + '"><button class="tminus" data-minus="' + k + '" data-sound="tap" aria-label="Take one ' + k + ' out">−</button>' + ballHtml(k) + '<b>×' + FG.tray[k] + '</b>' + (FG.lv === 0 && c.cnt[k] ? '<span class="need">/' + c.cnt[k] + '</span>' : '') + '<button class="tplus" data-plus="' + k + '" data-sound="tap" aria-label="Add one more ' + k + '">+</button></span>').join('') : '<span class="empty">Empty — tap an atom below</span>');
  $('fm-tray').querySelectorAll('[data-plus]').forEach(b => b.onclick = () => fmAdd(b.dataset.plus, 1));
  $('fm-tray').querySelectorAll('[data-minus]').forEach(b => b.onclick = () => fmAdd(b.dataset.minus, -1));
  const next = FG.lv === 0 && !FG.solved ? Object.keys(c.cnt).find(k => (FG.tray[k] || 0) < c.cnt[k]) : null;
  $('fm-kit').innerHTML = '<span class="cap">👇 Tap an atom to add it</span>' + FG.kit.map(k => '<button data-k="' + k + '" data-sound="none" class="' + (k === next ? 'kglow' : '') + '">' + ballHtml(k) + '<span class="knm">' + UI.esc((BYSYM[k] || {}).name || k) + '</span></button>').join('');
  $('fm-kit').querySelectorAll('[data-k]').forEach(b => b.onclick = () => fmAdd(b.dataset.k, 1));
  const act = $('fm-act');
  if(FG.solved) act.innerHTML = '<button class="sp-btn sp-primary sp-lg" id="fm-next" data-sound="pop">' + (FG.i + 1 < FG.list.length ? 'Next molecule ▶' : '📋 Finish') + '</button>';
  else act.innerHTML = (FG.lv >= 3 && FG.lv < 5 && !FG.hint ? '<button class="sp-btn sp-ghost" id="fm-hint" data-sound="tap">💡 Show formula (−40)</button>' : '') + '<button class="sp-btn sp-primary sp-lg" id="fm-check" data-sound="none"' + (keys.length ? '' : ' disabled') + '>✅ Check</button>';
  if($('fm-next')) $('fm-next').onclick = () => { if(!FG || !FG.solved) return; FG.solved = false; FG.i++; fmNext(); };
  if($('fm-hint')) $('fm-hint').onclick = () => { FG.hint = true; FG.usedHint = true; fmFormula(); fmRender(); };
  if($('fm-check')) $('fm-check').onclick = fmCheck;
  drawMol();
}
function fmAdd(k, d){ if(!FG || FG.solved) return; const was = FG.tray[k] || 0, v = Math.max(0, Math.min(24, was + d)); FG.tray[k] = v; UISound.play('tap');
  if(d > 0 && v > was) labCarry(FBUD, $('fm-buddy'), document.querySelector('#fm-kit [data-k="' + k + '"] .ball, #fm-tray [data-k="' + k + '"] .ball'), () => centreXY('fm-mol'), AtomSkins.url(k, CPK[k] || AtomSkins.colour(k), atomSkin(), 64));
  fmRender(); }
function fmCheck(){
  if(!FG || FG.solved) return; const c = FG.list[FG.i], keys = Object.keys(Object.assign({}, c.cnt, FG.tray)).filter(k => (FG.tray[k] || 0) || c.cnt[k]);
  const bad = keys.find(k => (FG.tray[k] || 0) !== (c.cnt[k] || 0));
  if(!bad){
    let pts = [100, 60, 30][Math.min(2, FG.tries)]; if(FG.usedHint && FG.lv >= 3) pts = Math.max(10, pts - 40); FG.usedHint = false;
    FG.score += pts; if(FG.tries === 0) FG.first++; FG.solved = true; FG.built.push(c.id); Object.keys(c.cnt).forEach(k => { const n = BYSYM[k].n; if(FG.found.indexOf(n) < 0) FG.found.push(n); });
    UISound.play('success'); if(FBUD) FBUD.react('joy'); FBAR.score(Math.round(FG.score * SCI_MULT(FG.lv)));
    fmSay('ok', 'Built it! ' + UI.esc(c.name) + ' = ' + sub(c.f) + ' · ' + UI.esc(c.where), pts, c); $('fm-where').textContent = '📍 ' + c.where; fmFormula(); FG.spin = performance.now(); fmRender(); gcEmit('right', {id: c.id}); return;
  }
  FG.tries++; FG.miss++; FBAR.miss(FG.miss); UISound.play('error'); if(FBUD) FBUD.react('miss'); gcEmit('wrong', {id: c.id});
  const have = FG.tray[bad] || 0, want = c.cnt[bad] || 0, nm = (BYSYM[bad] || {}).name || bad;
  if(FG.lv === 5){ fmSay('end', '❌ Not quite — it is ' + sub(c.f) + '. One check only on 💀 Hardcore!'); FG.tray = Object.assign({}, c.cnt); FG.solved = true; FG.hint = true; fmFormula(); fmRender(); return; }
  if(FG.lv <= 2) fmSay('try', UI.esc(want === 0 ? 'There is no ' + nm + ' in ' + c.name + ' — take the ' + bad + ' out.' : c.name + ' needs ' + want + ' ' + bad + ' — you have ' + have + '.'));
  else fmSay('try', 'Not quite — count each kind of atom again.' + (FG.lv >= 3 && FG.tries >= 2 && !FG.hint ? ' Try 💡 Show formula.' : ''));
}
// the molecule as balls: the rarest heavy atom in the middle, the rest in rings (hydrogens outside)
function drawMol(){
  const cv = $('fm-mol'); if(!cv || !FG) return; const r = cv.getBoundingClientRect(); if(r.width < 10) return;
  const dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const W = r.width, H = r.height, cx = W / 2, cy = H / 2, atoms = [];
  Object.keys(FG.tray).forEach(k => { for(let i = 0; i < (FG.tray[k] || 0); i++) atoms.push(k); });
  if(!atoms.length){ g.fillStyle = 'rgba(255,255,255,0.35)'; g.font = '800 14px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('⚛️', cx, cy); return; }
  const heavy = atoms.filter(a => a !== 'H'), order = heavy.slice().sort((a, b) => FG.tray[a] - FG.tray[b]), centre = order[0] || atoms[0], rest = atoms.slice(); rest.splice(rest.indexOf(centre), 1);
  rest.sort((a, b) => (a === 'H') - (b === 'H'));
  const R0 = Math.min(W, H) * 0.5, br = Math.max(7, Math.min(Math.max(36, H * 0.12), R0 / (2 + Math.sqrt(atoms.length) * 0.9))), rings = [], cap = [6, 12, 18, 99]; let i = 0;
  cap.forEach((c, ri) => { if(i < rest.length){ rings.push(rest.slice(i, i + c)); i += c; } });
  const t = FG.spin ? Math.min(1, (performance.now() - FG.spin) / 900) : 1, rot = FG.solved ? (1 - t) * 2 : 0, pos = [[cx, cy, centre]];
  rings.forEach((ring, ri) => { const rr = br * 2.3 * (ri + 1); ring.forEach((a, j) => { const ang = j / ring.length * Math.PI * 2 + ri * 0.4 + rot; pos.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 0.82, a]); }); });
  g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = Math.max(2, br * 0.3);
  pos.slice(1).forEach((p, j) => { const ri = rings.findIndex((ring, k) => j < rings.slice(0, k + 1).reduce((s, x) => s + x.length, 0)); const from = ri <= 0 ? pos[0] : pos[1 + (j % Math.max(1, rings[0].length))]; g.beginPath(); g.moveTo(from[0], from[1]); g.lineTo(p[0], p[1]); g.stroke(); });
  if(window.AtomSkins){ const sk = atomSkin(); pos.forEach(p => { const k = p[2], rad = k === 'H' ? br * 0.75 : br; AtomSkins.draw(g, p[0], p[1], rad, rad >= 11 ? k : '', CPK[k] || AtomSkins.colour(k), sk, 0.6); }); if(FG.solved && t < 1 && SCI_FX) requestAnimationFrame(drawMol); return; }   // 🎨 sc-2b
  pos.forEach(p => { const k = p[2], rad = k === 'H' ? br * 0.75 : br, col = CPK[k] || '#F5A3C7'; const gr = g.createRadialGradient(p[0] - rad * 0.35, p[1] - rad * 0.35, rad * 0.1, p[0], p[1], rad); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.35, col); gr.addColorStop(1, shade(col, 0.6));
    g.fillStyle = gr; g.beginPath(); g.arc(p[0], p[1], rad, 0, 7); g.fill(); if(rad >= 11){ g.fillStyle = DARK[k] ? '#fff' : '#16233A'; g.font = '800 ' + Math.round(rad * 0.75) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(k, p[0], p[1] + 1); } });
  if(FG.solved && t < 1 && SCI_FX) requestAnimationFrame(drawMol);
}
function fmEnd(){
  FG.done = true; const total = FG.list.length, acc = FG.first / total, stars = acc >= 0.8 ? 3 : acc >= 0.6 ? 2 : 1;
  chemSave('formula', {found: FG.found, built: FG.built, right: FG.first, total, score: Math.round(FG.score * SCI_MULT(FG.lv)), stars, timeSec: Math.round((Date.now() - FG.t0) / 1000)});
}
/* 📏 s2c chem#8 */

/* ================= 🧫 KITCHEN LAB (sc-2c) — 5 kid-safe experiments on one bench =================
   Each round: a question (or a job), the bench shows the glasses, you pick / do it, the bench plays what really happens, the message says why.
   Rounds marked once = predict → watch (one answer, the bench then shows the truth). Others: try again with a hint. */
Object.assign(KIND_UI, {ph: ['🌈 Colours tested!', () => startExp('ph'), 'right first time', 2], crystal: ['💎 Crystals grown!', () => startExp('crystal'), 'right first time', 2],
  dissolve: ['🧂 Races watched!', () => startExp('dissolve'), 'right predictions', 2], mix: ['🫧 Mixes sorted!', () => startExp('mix'), 'right first time', 2], rust: ['🌧️ Rust lab done!', () => startExp('rust'), 'right first time', 2]});
const XEXP = [['ph', '🌈', 'pH colours', 'Red-cabbage juice changes colour — sour, plain or soapy?'], ['crystal', '💎', 'Crystal garden', 'Fill the water with salt or sugar, hang a string, wait a week'],
  ['dissolve', '🧂', 'Dissolving race', 'Which glass dissolves first? Size, warmth + stirring'], ['mix', '🫧', 'Mix or react?', 'Just mixed, or new stuff made? Look for the signs'], ['rust', '🌧️', 'Rust lab', 'What rusts, what turns green, what stays shiny']];
/* 📏 s2c chem#9 */
const LIQ = {lemon: {i: '🍋', n: 'Lemon juice', t: 'acid', ph: 2, col: '#E5306A', b: 'citric'}, vinegar: {i: '🍶', n: 'Vinegar', t: 'acid', ph: 3, col: '#EC4C86', b: 'vinegar'}, apple: {i: '🍎', n: 'Apple juice', t: 'acid', ph: 4, col: '#C2468F', b: 'citric'},
  water: {i: '💧', n: 'Water', t: 'neutral', ph: 7, col: CABBAGE, b: 'water'}, soda: {i: '🧁', n: 'Baking soda water', t: 'base', ph: 9, col: '#3A7FC8', b: 'soda'}, soap: {i: '🧼', n: 'Soap water', t: 'base', ph: 10, col: '#2FA68A', b: ''}};
const PHT = {acid: ['🩷', 'PINK', 'an ACID (sour, like lemon)'], neutral: ['🟣', 'PURPLE', 'NEUTRAL (plain, like water)'], base: ['🟢', 'BLUE-GREEN', 'a BASE (slippery, like soap)']};
const CRY = {salt: {i: '🧂', n: 'Salt', shape: 'cube', b: 'salt', el: [11, 17], cap: [3, 4]}, sugar: {i: '🍬', n: 'Sugar', shape: 'chunk', b: 'sucrose', el: [6, 1, 8], cap: [4, 7]}, epsom: {i: '🫙', n: 'Epsom salt', shape: 'needle', b: 'epsom', el: [12, 16, 8], cap: [3, 6]}};
const SHAPES = {cube: ['🧊', 'little cubes'], needle: ['🪡', 'long needles'], chunk: ['💎', 'big chunky crystals']};
const PAIRS = {fizz: ['🧁', 'Baking soda', '🍶', 'Vinegar', 1, '🫧 bubbles of a NEW gas (carbon dioxide)', 'fizz', ['soda', 'vinegar', 'co2'], [11, 6, 8, 1], '#F3EBD0'],
  sand: ['🏖️', 'Sand', '💧', 'Water', 0, 'the sand just sinks — pour the water off and it is still sand', 'sand', ['sand', 'water'], [14, 8], WATER],
  salt: ['🧂', 'Salt', '💧', 'Water', 0, 'the salt hides in the water — let it dry and the salt comes back', 'dissolve', ['salt', 'water'], [11, 17], WATER],
  oil: ['🫒', 'Cooking oil', '💧', 'Water', 0, 'two layers — the oil floats on top, nothing new is made', 'layer', ['water'], [6, 1], WATER],
  curd: ['🍋', 'Lemon juice', '🥛', 'Milk', 1, '🧀 soft lumps (curds) — new stuff', 'lumps', ['citric'], [20, 8], '#F8F5EE'],
  cabbage: ['🍋', 'Lemon juice', '🟣', 'Cabbage juice', 1, '🎨 a brand-new colour', 'colour', ['citric'], [6, 1, 8], CABBAGE],
  sugar: ['🍬', 'Sugar', '💧', 'Water', 0, 'the sugar dissolves — it is still sugar + water', 'dissolve', ['sucrose', 'water'], [6, 1, 8], WATER],
  yeast: ['🍞', 'Yeast + sugar', '♨️', 'Warm water', 1, '🫧 slow foam — the yeast makes a gas (it can blow up a balloon!)', 'foam', ['co2', 'glucose'], [6, 8], '#D9C7A0'],
  chalk: ['🖍️', 'Chalk', '🍶', 'Vinegar', 1, '🫧 fizz — the chalk is slowly eaten away', 'chalkfizz', ['chalk', 'co2'], [20, 6, 8], '#F3EBD0'],
  paint: ['🔵', 'Blue paint', '🔴', 'Red paint', 0, 'it looks new, but it’s a MIXTURE — the red and blue bits are both still there', 'paint', [], [], '#E0393E']};
const XSIGNS = '<span style="background:#fff">Signs of NEW stuff: 🫧 bubbles · 🎨 new colour · 🧀 lumps · 🌡️ gets warm</span>';
const XITEM = {nail: ['🔩', 'Iron nail'], coin: ['🪙', 'Copper coin'], ring: ['💍', 'Gold ring'], spoon: ['🥄', 'Plastic spoon'], pnail: ['🎨', 'Painted nail']};
let XG = null, XBUD = null, X_RAF = 0;
const XBAR = qBar('xbar', '🧫', 'Kitchen lab', 'exp-level', () => XG, () => { if(XG) XG.done = true; }, () => drawBench());
XBAR.count('exp', '🧪', '1/5', 'Test');

function openXhub(){
  stopExp(); const lv = SET.level, U = LEVEL_UI[lv];
  $('xhub-sub').textContent = U.emoji + ' ' + U.name + ' · ' + ['the answer glows to help you', 'hints if you miss', 'guess first, then watch', 'no colour charts', 'tricky ones', 'against the clock — one try'][lv];
  $('xhub-count').innerHTML = '<span>📇 ' + CHEM.all.length + ' / 118 element cards</span><span>⚛️ ' + CHEM.c.length + ' / ' + COMPS.length + ' molecules</span>';
  $('xhub-hub').innerHTML = XEXP.map((h, i) => '<button class="pick" data-g="' + h[0] + '" data-sound="pop" style="animation:sc-pop .4s ' + (i * 0.08) + 's both"><div class="big">' + h[1] + '</div><div class="nm">' + h[2] + '</div><div class="sub">' + h[3] + '</div></button>').join('');
  $('xhub-hub').querySelectorAll('[data-g]').forEach(b => b.onclick = () => startExp(b.dataset.g));
  showScreen('xhub');
  if(lv === 0) setTimeout(() => { if(!$('scr-xhub').classList.contains('hidden')){ const b = $('xhub-hub').querySelector('[data-g="ph"]'); b.classList.add('glow-next'); labHand(b); } }, 400 * SCI_FX);
}
function leaveXlab(){ stopExp(); hideResult(); labHand(null); openXhub(); }
/* 📏 s2c chem#10 */
function xRounds(exp, lv){
  const R = [], once = lv >= 2;
  if(exp === 'ph'){
    const chart = lv <= 1, kinds = lv === 0 ? ['make', 'make', 'make', 'make', 'make'] : lv === 1 ? ['make', 'make', 'predict', 'make', 'predict'] : lv === 2 ? ['predict', 'make', 'predict', 'make', 'predict'] : lv === 3 ? ['sort', 'predict', 'sort', 'sort', 'predict'] : lv === 4 ? ['sort', 'neutral', 'predict', 'sort', 'neutral'] : ['predict', 'sort', 'neutral', 'make', 'sort'];
    const types = shuffle(['acid', 'base', 'neutral', 'acid', 'base']);
    kinds.forEach((k, i) => {
      const tp = types[i], pool = Object.keys(LIQ).filter(x => LIQ[x].t === tp), liq = pool[Math.floor(Math.random() * pool.length)];
      const base = {eye: '🌈 pH colours · red-cabbage juice', legend: chart ? Object.keys(PHT).map(t => '<span style="background:' + (t === 'acid' ? '#F7A1BE' : t === 'neutral' ? '#C7A8E8' : '#9ED9C8') + '">' + PHT[t][0] + ' ' + PHT[t][1] + ' = ' + PHT[t][2].split(' (')[0] + '</span>').join('') : '', found: [6, 1, 8], cups: [cup({label: '🟣 cabbage juice', col: CABBAGE})]};
      if(k === 'make'){
        const opts = shuffle(lv === 0 ? ['lemon', 'water', 'soap'] : shuffle(Object.keys(LIQ).filter(x => LIQ[x].t === tp)).slice(0, 1).concat(shuffle(Object.keys(LIQ).filter(x => LIQ[x].t !== tp)).slice(0, 3)));
        R.push(Object.assign(base, {q: 'Make it ' + PHT[tp][0] + ' ' + PHT[tp][1], need: 'Pour in one kitchen liquid', hint: lv === 0 ? '👆 ' + PHT[tp][1].toLowerCase() + ' = ' + PHT[tp][2] : 'Which liquid is ' + PHT[tp][2].split(' (')[0].toLowerCase() + '?',
          opts: opts.map(x => ({k: x, i: LIQ[x].i, t: LIQ[x].n})), ok: x => LIQ[x].t === tp, showWrong: true, play: x => xPour(x), why: x => LIQ[x].i + ' ' + LIQ[x].n + ' made it ' + PHT[LIQ[x].t][1].toLowerCase() + ' — it is ' + PHT[LIQ[x].t][2] + '. ' + PHT[tp][1] + ' needs ' + PHT[tp][2] + '.',
          good: x => LIQ[x].i + ' ' + LIQ[x].n + ' is ' + PHT[tp][2] + ' → ' + PHT[tp][0] + ' ' + PHT[tp][1].toLowerCase() + '!', built: x => [LIQ[x].b].filter(Boolean)}));
      } else if(k === 'predict' || k === 'sort'){
        const L = LIQ[liq], pred = k === 'predict';
        R.push(Object.assign(base, {q: pred ? 'What colour will ' + L.i + ' ' + L.n + ' make?' : 'Is ' + L.i + ' ' + L.n + ' an acid, neutral or a base?', need: pred ? 'Guess, then watch it pour' : 'pH ' + L.ph + (lv >= 3 ? '' : ''), hint: k === 'sort' ? 'pH under 7 = acid · 7 = neutral · over 7 = base' : lv <= 2 ? 'Sour things → pink · plain → purple · soapy → blue-green' : '', once: once,
          opts: pred ? Object.keys(PHT).map(t => ({k: t, i: PHT[t][0], t: PHT[t][1].charAt(0) + PHT[t][1].slice(1).toLowerCase()})) : [{k: 'acid', i: '🍋', t: 'Acid'}, {k: 'neutral', i: '💧', t: 'Neutral'}, {k: 'base', i: '🧼', t: 'Base'}],
          ok: x => x === L.t, playAns: () => xPour(liq), why: () => L.i + ' ' + L.n + ' has pH ' + L.ph + ' → ' + PHT[L.t][2] + ' → ' + PHT[L.t][0] + ' ' + PHT[L.t][1].toLowerCase() + '.', good: () => L.i + ' ' + L.n + ' (pH ' + L.ph + ') is ' + PHT[L.t][2] + ' → ' + PHT[L.t][0] + '!', built: () => [L.b].filter(Boolean)}));
      } else {
        const n = 2 + Math.floor(Math.random() * 3);
        R.push(Object.assign(base, {q: 'Make the pink juice 🟣 PURPLE again', need: 'Add baking soda, one spoon at a time', hint: 'Acid + base cancel out → neutral. Stop when it is purple!', stepper: 'neutral', n, good: () => 'Purple = neutral! ' + n + ' spoons of baking soda cancelled the lemon\u2019s acid (the fizz was carbon dioxide).', cups: [cup({label: '🟣 + 🍋', col: LIQ.lemon.col})], found: [6, 1, 8, 11], builtAns: ['soda', 'co2', 'citric']}));
      }
    });
  } else if(exp === 'crystal'){
    const list = lv === 3 ? ['q-warm', 'sugar', 'salt'] : lv === 4 ? ['q-shape', 'epsom', 'sugar'] : ['salt', 'sugar', 'epsom'];
    list.forEach(k => {
      if(k === 'q-warm') return R.push({eye: '💎 Crystal garden', q: 'Which glass can hold MORE sugar?', need: 'Before it gets full', hint: 'A grown-up pours the warm water', once: true,
        opts: [{k: 'cold', i: '❄️', t: 'Cold water'}, {k: 'warm', i: '♨️', t: 'Warm water'}, {k: 'same', i: '🤝', t: 'The same'}], ok: x => x === 'warm', cups: [cup({label: '❄️ cold'}), cup({label: '♨️ warm', warm: true})],
        playAns: () => { XG.cups[0].solid = {kind: 'pile', amt: 1, to: 0.6, rate: 1}; XG.cups[1].solid = {kind: 'pile', amt: 1, to: 0, rate: 1}; return 1200; },
        why: () => 'Warm water holds much more sugar — its busy little bits make room for more.', good: () => 'Warm water holds about twice as much sugar!', found: [6, 1, 8], built: () => ['sucrose']});
      if(k === 'q-shape'){ const c = ['salt', 'epsom', 'sugar'][Math.floor(Math.random() * 3)], C = CRY[c];
        return R.push({eye: '💎 Crystal garden', q: 'What crystals does ' + C.i + ' ' + C.n + ' grow?', need: 'Each stuff has its own crystal shape', hint: '', once: true, opts: Object.keys(SHAPES).map(x => ({k: x, i: SHAPES[x][0], t: SHAPES[x][1]})), ok: x => x === C.shape,
          cups: [cup({label: C.i + ' ' + C.n, string: true, shape: C.shape})], playAns: () => { XG.cups[0].cryTo = 1; XG.dayTo = 7; return 1600; }, why: () => C.n + ' grows ' + SHAPES[C.shape][1] + ' ' + SHAPES[C.shape][0] + ' — its tiny bits always stack the same way.', good: () => SHAPES[C.shape][1] + ' ' + SHAPES[C.shape][0] + '!', found: C.el, built: () => [C.b]}); }
      const C = CRY[k], warm = k !== 'salt', cap = C.cap[warm ? 1 : 0];
      R.push({eye: '💎 Crystal garden', q: 'Grow ' + C.i + ' ' + C.n + ' crystals', need: (warm ? '♨️ warm' : '❄️ cold') + ' water · fill it up', hint: lv <= 1 ? 'Add spoons until a little stays at the bottom — then the water is full' : 'Crystals only grow from FULL (saturated) water', stepper: 'crystal', cap, meter: lv <= 1, good: () => (cap + 1) + ' spoons filled the water — a week later ' + C.n + ' grew ' + SHAPES[C.shape][1] + ' ' + SHAPES[C.shape][0] + '!',
        cups: [cup({label: C.i + ' ' + C.n + ' · ' + (warm ? '♨️ warm' : '❄️ cold'), warm, shape: C.shape})], found: C.el, builtAns: [C.b, 'water']});
    });
  } else if(exp === 'dissolve'){
    const F = {size: ['✨ grains', '🧊 cube'], temp: ['♨️ warm', '❄️ cold'], stir: ['🥄 stirred', '✋ still']}, rounds = [];
    const one = () => shuffle(['size', 'temp', 'stir']).slice(0, 1);
    for(let i = 0; i < 4; i++){
      let A = {size: 1, temp: 1, stir: 1}, B = {size: 1, temp: 1, stir: 1}; ['size', 'temp', 'stir'].forEach(f => { A[f] = B[f] = Math.random() < 0.5 ? 0 : 1; });
      if(lv <= 2 && !(lv === 2 && i === 3)) one().forEach(f => { A[f] = 0; B[f] = 1; });
      else if(lv === 2) { /* a fair 'same' round: only the cup colour differs */ }
      else if(lv === 3) shuffle(['size', 'temp', 'stir']).slice(0, 2).forEach(f => { A[f] = 0; B[f] = 1; });
      else { const fs = shuffle(['size', 'temp', 'stir']); A[fs[0]] = 0; B[fs[0]] = 1; A[fs[1]] = 1; B[fs[1]] = 0; if(i % 2) { A[fs[2]] = 0; B[fs[2]] = 1; } }
      if(Math.random() < 0.5){ const t = A; A = B; B = t; }
      const sp = c => (c.size ? 1 : 3) * (c.temp ? 1 : 2) * (c.stir ? 1 : 2), sa = sp(A), sb = sp(B), ans = sa > sb ? 'A' : sb > sa ? 'B' : 'same';
      const lab = c => F.size[c.size] + '\n' + F.temp[c.temp] + '\n' + F.stir[c.stir];
      rounds.push({eye: '🧂 Dissolving race · sugar', q: 'Which sugar dissolves first?', need: '🅰️ vs 🅱️ — look under each glass', hint: lv <= 1 ? 'Small bits, warm water and stirring all make sugar dissolve faster' : '', once: lv >= 2,
        opts: [{k: 'A', i: '🅰️', t: 'Glass A'}, {k: 'B', i: '🅱️', t: 'Glass B'}, {k: 'same', i: '🤝', t: 'Same time'}], ok: x => x === ans,
        cups: [cup({label: '🅰️', sub: lab(A), warm: !A.temp, stir: !A.stir, solid: {kind: A.size ? 'cube' : 'grains', amt: 1}}), cup({label: '🅱️', sub: lab(B), warm: !B.temp, stir: !B.stir, solid: {kind: B.size ? 'cube' : 'grains', amt: 1}})],
        playAns: () => { XG.cups[0].solid.to = 0; XG.cups[0].solid.rate = sa / 3.2; XG.cups[1].solid.to = 0; XG.cups[1].solid.rate = sb / 3.2; return 3200 / Math.min(sa, sb) + 400; },
        hintWhy: () => 'Look at what is different: ' + ['size', 'temp', 'stir'].filter(f => A[f] !== B[f]).map(f => XHELP[f].replace(/ \(.*/, '') + ' dissolves sugar faster').join(' · ') + '.',
        why: () => ans === 'same' ? 'Both glasses have exactly the same helpers, so they tie.' : 'Glass ' + ans + ' won — ' + xWhy(ans === 'A' ? A : B, ans === 'A' ? B : A), good: () => ans === 'same' ? 'A tie — a fair test changes only one thing!' : 'Glass ' + ans + ' won — ' + xWhy(ans === 'A' ? A : B, ans === 'A' ? B : A), found: [6, 1, 8], built: () => ['sucrose']});
    }
    R.push.apply(R, rounds);
  } else if(exp === 'mix'){
    const pool = lv <= 1 ? ['fizz', 'sand', 'oil', 'curd', 'salt'] : lv <= 3 ? ['fizz', 'sand', 'oil', 'curd', 'salt', 'sugar', 'yeast', 'cabbage'] : ['paint', 'salt', 'cabbage', 'chalk', 'yeast', 'oil', 'sugar', 'curd'];
    shuffle(pool).slice(0, 5).forEach(k => { const p = PAIRS[k];
      R.push({eye: '🫧 Mix or react?', q: p[0] + ' ' + p[1] + ' + ' + p[2] + ' ' + p[3], need: lv <= 1 ? 'Mix them, watch, then sort it' : 'Guess first, then mix', hint: lv <= 1 ? 'A reaction makes NEW stuff' : '', legend: lv <= 2 ? XSIGNS : '', watch: lv <= 1, once: lv >= 2,
        opts: [{k: 'mix', i: '🔀', t: 'Just a mixture'}, {k: 'react', i: '⚗️', t: 'A reaction'}], ok: x => (x === 'react') === !!p[4], cups: [cup({label: p[2] + ' ' + p[3], col: p[9]})],
        playAns: () => xMixFx(p[6]), why: () => (p[4] ? 'A reaction: ' : 'Just a mixture: ') + p[5] + '.', good: () => (p[4] ? '⚗️ Reaction — ' : '🔀 Mixture — ') + p[5] + '.', found: p[8], built: () => p[7]}); });
  } else {
    const L = lv === 0 ? ['which2', 'copper', 'which3'] : lv === 1 ? ['which4', 'copper', 'fastest'] : lv === 2 ? ['which4', 'fastest', 'copper'] : lv === 3 ? ['fastest', 'paint', 'copper'] : ['paint', 'needs', 'fastest'];
    L.forEach(k => {
      const base = {eye: '🌧️ Rust lab · two weeks in a wet dish', once: lv >= 2, found: [26, 8], built: () => ['rust']};
      if(/^which/.test(k)){ const items = k === 'which2' ? ['nail', 'ring'] : k === 'which3' ? ['nail', 'ring', 'spoon'] : ['nail', 'coin', 'ring', 'spoon']; const its = shuffle(items);
        return R.push(Object.assign(base, {q: 'Which one will RUST?', need: 'Two weeks in water + air', hint: lv === 0 ? 'Rust is orange-brown — it grows on iron' : '', opts: its.map(x => ({k: x, i: XITEM[x][0], t: XITEM[x][1]})), ok: x => x === 'nail',
          cups: its.map(x => cup({label: XITEM[x][0], lvl: 0.35, item: {kind: x}})), playAns: () => xDays(14, its.map(x => x === 'nail' ? [1, 0] : x === 'coin' ? [0, 0.7] : [0, 0])),
          why: x => XITEM[x][1] + ' doesn’t rust. Only IRON rusts — water + air turn it into orange-brown rust (iron oxide).', good: () => 'Iron + water + air → rust (iron oxide)!'})); }
      if(k === 'copper') return R.push(Object.assign(base, {q: 'What colour does a 🪙 copper coin turn?', need: 'After a long time outside', hint: lv === 0 ? 'Old copper roofs + statues show it' : '', opts: [{k: 'green', i: '🟢', t: 'Green'}, {k: 'rust', i: '🟤', t: 'Rusty orange'}, {k: 'shiny', i: '✨', t: 'Stays shiny'}], ok: x => x === 'green',
        cups: [cup({label: '🪙 outside', lvl: 0.2, item: {kind: 'coin'}})], playAns: () => xDays(14, [[0, 1]]), why: () => 'Copper turns GREEN (patina) — like the famous green statues. Only iron makes orange rust.', good: () => 'Copper patina is green!', found: [29, 8, 6], built: () => ['patina']}));
      if(k === 'fastest'){ const d = shuffle(['dry', 'tap', 'salt']); const D = {dry: ['🏜️', 'Dry jar', 0, 0.15], tap: ['💧', 'Tap water', 0.4, 0.55], salt: ['🧂', 'Salt water', 0.4, 1]};
        return R.push(Object.assign(base, {q: 'Which nail rusts FASTEST?', need: 'Same nails, different jars', hint: lv <= 1 ? 'Salt helps rust grow — that’s why cars rust near the sea' : '', opts: d.map(x => ({k: x, i: D[x][0], t: D[x][1]})), ok: x => x === 'salt',
          cups: d.map(x => cup({label: D[x][0] + ' ' + D[x][1], lvl: D[x][2], col: x === 'salt' ? '#C6E4EE' : WATER, item: {kind: 'nail'}})), playAns: () => xDays(14, d.map(x => [D[x][3], 0])), why: () => 'Salt water rusts iron fastest — the salt helps the water and air work. A dry nail hardly rusts.', good: () => 'Salt speeds rust up!', found: [26, 8, 11, 17]})); }
      if(k === 'paint'){ const d = shuffle(['bare', 'paint', 'salt']); const D = {bare: ['🔩', 'Bare nail in water', 0.75, 'nail'], paint: ['🎨', 'Painted nail in water', 0, 'pnail'], salt: ['🧂', 'Bare nail in salt water', 1, 'nail']};
        return R.push(Object.assign(base, {q: 'Which nail will NOT rust?', need: 'Two weeks in a jar', hint: '', opts: d.map(x => ({k: x, i: D[x][0], t: D[x][1]})), ok: x => x === 'paint',
          cups: d.map(x => cup({label: D[x][0], lvl: 0.4, item: {kind: D[x][3]}})), playAns: () => xDays(14, d.map(x => [D[x][2], 0])), why: () => 'Paint keeps water + air away from the iron — no rust. That’s why bikes and bridges are painted.', good: () => 'Paint is a raincoat for iron!'})); }
      R.push(Object.assign(base, {q: 'What does iron need to rust?', need: 'Think of a nail on a dry shelf vs in the rain', hint: '', opts: [{k: 'wa', i: '💧', t: 'Water + air'}, {k: 'a', i: '🌬️', t: 'Air only'}, {k: 'h', i: '🔥', t: 'Heat'}], ok: x => x === 'wa',
        cups: [cup({label: '🏜️ dry', lvl: 0, item: {kind: 'nail'}}), cup({label: '🌧️ wet', lvl: 0.35, item: {kind: 'nail'}})], playAns: () => xDays(14, [[0.1, 0], [0.9, 0]]), why: () => 'Iron needs BOTH water and air to rust — the dry nail stays shiny.', good: () => 'Water + air → rust!'}));
    });
  }
  return R;
}
const XHELP = {size: '✨ small grains (×3)', temp: '♨️ warm water (×2)', stir: '🥄 stirring (×2)'};
function xWhy(W, Lo){ const wh = ['size', 'temp', 'stir'].filter(f => !W[f] && Lo[f]).map(f => XHELP[f]), lh = ['size', 'temp', 'stir'].filter(f => !Lo[f] && W[f]).map(f => XHELP[f]);
  return 'it had ' + wh.join(' + ') + (lh.length ? ', which beat ' + lh.join(' + ') + ' in the other glass.' : '.'); }

// ---------- bench actions (set where things go; the loop moves them there) ----------
function xPour(k){ const c = XG.cups[0]; c.col = LIQ[k].col; c.lvlTo = Math.min(0.8, c.lvl + 0.1); return 900; }
function xMixFx(fx){ const c = XG.cups[0];
  if(fx === 'fizz' || fx === 'chalkfizz'){ c.bub = fx === 'fizz' ? 40 : 14; c.foamTo = fx === 'fizz' ? 1 : 0.4; if(fx === 'chalkfizz') c.solid = {kind: 'cube', amt: 1, to: 0.6, rate: 0.2}; setTimeout(() => { if(XG && XG.cups[0] === c){ c.bub = 3; c.foamTo = 0.2; } }, 1600 * SCI_FX); }
  else if(fx === 'sand'){ c.cloud = 1; c.sandTo = 1; }
  else if(fx === 'dissolve'){ c.solid = {kind: 'grains', amt: 1, to: 0, rate: 0.8}; }
  else if(fx === 'layer'){ c.layerTo = 1; }
  else if(fx === 'lumps'){ c.lumpsTo = 1; c.col = '#F1EBD8'; }
  else if(fx === 'colour'){ c.col = LIQ.lemon.col; }
  else if(fx === 'foam'){ c.bub = 8; c.foamTo = 0.8; }
  else if(fx === 'paint'){ c.col = '#7B3F9E'; }
  return 1700; }
function xDays(n, rg){ XG.dayTo = n; XG.cups.forEach((c, i) => { if(c.item){ c.item.rustTo = rg[i][0]; c.item.greenTo = rg[i][1]; } }); return 2000; }

// ---------- game flow ----------
function startExp(exp){
  stopExp(); const lv = SET.level, list = xRounds(exp, lv), X = XEXP.find(e => e[0] === exp);
  XG = {exp, lv, list, i: 0, tries: 0, first: 0, score: 0, miss: 0, found: [], built: [], t0: Date.now(), done: false, solved: false};
  hideResult(); labHand(null); showScreen('exp'); XBAR.level(LEVEL_UI[lv].emoji + ' ' + LEVEL_UI[lv].name); XBAR.score(0); XBAR.miss(0); XBAR.fit();
  XBUD = qBuddy(XBUD, 'x-buddy'); xNext(); if(UI.modeTried) UI.modeTried(S.player, GAME_ID, 'chem'); gcEmit('start', {game: exp}); xLoop();
}
function stopExp(){ if(XG){ XG.done = true; clearTimeout(XG.tm); clearTimeout(XG.gt); clearTimeout(XG.pt); } if(XBUD){ XBUD.stop(); XBUD = null; } cancelAnimationFrame(X_RAF); }
function xNext(){
  if(!XG || XG.done) return; clearTimeout(XG.tm); clearTimeout(XG.gt); clearTimeout(XG.pt); if(XG.i >= XG.list.length) return xEnd();
  const r = XG.list[XG.i], lv = XG.lv; XG.tries = 0; XG.solved = false; XG.watched = !r.watch; XG.busy = false; XG.picked = null; XG.spoons = 0; XG.day = 0; XG.dayTo = 0; XG.glowK = null;
  XG.cups = r.cups.map(c => Object.assign({}, JSON.parse(JSON.stringify(c)), {cur: c.col, bubs: [], bub: 0, foam: 0, foamTo: 0, lumps: 0, lumpsTo: 0, layer: 0, layerTo: 0, cloud: 0, sand: 0, sandTo: 0, cry: 0, cryTo: 0, lvlTo: c.lvl}));
  XG.cups.forEach(c => { if(c.item){ c.item.rust = 0; c.item.green = 0; c.item.rustTo = 0; c.item.greenTo = 0; } if(c.solid){ c.solid.to = c.solid.amt; c.solid.rate = 0; } });
  XBAR.count('exp', '🧪', (XG.i + 1) + '/' + XG.list.length, 'Test');
  $('x-eye').textContent = r.eye; $('x-name').textContent = r.q; $('x-need').textContent = r.need; $('x-hint').textContent = r.hint || ''; $('x-legend').innerHTML = r.legend || '';
  $('x-msg').className = 'fm-msg'; $('x-msg').textContent = '';
  xRender(); drawBench();
  if(lv === 0 && !r.stepper) XG.gt = setTimeout(() => { if(XG && !XG.solved && XG.watched){ XG.glowK = r.opts.find(o => r.ok(o.k)).k; xRender(); } }, 6000 * SCI_FX);
  if(lv === 5) XG.tm = setTimeout(() => { if(XG && !XG.done && !XG.solved){ XG.miss++; XBAR.miss(XG.miss); UISound.play('error'); xAnswer('⏱️ Time! '); } }, 15000);
}
function xRender(){
  const r = XG.list[XG.i], lv = XG.lv, opts = $('x-opts'), act = $('x-act');
  if(r.stepper){ opts.innerHTML = r.meter ? '<span class="xmeter">💧 Water full <b style="--f:' + Math.min(100, Math.round(XG.spoons / r.cap * 100)) + '%"></b> ' + Math.min(100, Math.round(XG.spoons / r.cap * 100)) + ' %</span>' : '<span class="xmeter">🥄 ' + XG.spoons + ' spoon' + (XG.spoons === 1 ? '' : 's') + ' in</span>'; }
  else if(!XG.watched) opts.innerHTML = '';
  else { opts.innerHTML = r.opts.map(o => '<button data-k="' + o.k + '" data-sound="tap" class="' + (o.k === XG.glowK && !XG.solved ? 'kglow' : '') + (XG.solved ? (r.ok(o.k) ? ' yes' : o.k === XG.picked ? ' no' : '') : '') + '"' + (XG.solved || XG.busy ? ' disabled' : '') + '><i>' + o.i + '</i>' + UI.esc(o.t) + '</button>').join('');
    opts.querySelectorAll('button').forEach(b => b.onclick = () => xPick(b.dataset.k)); }
  let h = '';
  if(XG.solved) h = '<button class="sp-btn sp-primary sp-lg" id="x-next" data-sound="pop">' + (XG.i + 1 < XG.list.length ? 'Next test ▶' : '📋 Finish') + '</button>';
  else if(r.watch && !XG.watched) h = '<button class="sp-btn sp-primary sp-lg glow-next" id="x-mix" data-sound="pop">🥄 Mix them!</button>';
  else if(r.stepper === 'crystal'){ const full = XG.spoons > r.cap; h = '<button class="sp-btn sp-secondary sp-lg' + (lv <= 1 && !full ? ' glow-next' : '') + '" id="x-add" data-sound="pop"' + (XG.busy ? ' disabled' : '') + '>🥄 Add a spoon</button><button class="sp-btn sp-primary sp-lg' + (lv <= 1 && full ? ' glow-next' : '') + '" id="x-hang" data-sound="pop"' + (XG.busy || !XG.spoons ? ' disabled' : '') + '>🧵 Hang a string + wait</button>'; }
  else if(r.stepper === 'neutral') h = '<button class="sp-btn sp-secondary sp-lg" id="x-add" data-sound="pop"' + (XG.busy ? ' disabled' : '') + '>🧁 Add a spoon</button><button class="sp-btn sp-primary sp-lg" id="x-stop" data-sound="pop"' + (XG.busy || !XG.spoons ? ' disabled' : '') + '>🛑 Stop — it’s purple!</button>';
  act.innerHTML = h;
  if($('x-next')) $('x-next').onclick = () => { if(!XG || !XG.solved) return; XG.i++; xNext(); };
  if($('x-mix')) $('x-mix').onclick = () => { if(XG.busy) return; XG.busy = true; xRender(); const ms = r.playAns(); UISound.play('pop'); XG.pt = setTimeout(() => { if(!XG || XG.done) return; XG.busy = false; XG.watched = true; $('x-msg').className = 'fm-msg'; $('x-msg').textContent = '👀 What happened? Is there NEW stuff?'; xRender();
    if(XG.lv === 0) XG.gt = setTimeout(() => { if(XG && !XG.solved){ XG.glowK = r.opts.find(o => r.ok(o.k)).k; xRender(); } }, 6000 * SCI_FX); }, ms * SCI_FX); };
  if($('x-add')) $('x-add').onclick = () => xSpoon();
  if($('x-hang')) $('x-hang').onclick = () => xHang();
  if($('x-stop')) $('x-stop').onclick = () => xStop();
}
function xPick(k){
  if(!XG || XG.solved || XG.busy || XG.done) return; const r = XG.list[XG.i], right = r.ok(k); XG.picked = k;
  if(r.once){ XG.busy = true; xRender(); $('x-msg').className = 'fm-msg'; $('x-msg').textContent = '👀 Watch…'; const ms = r.playAns ? r.playAns() : 600; XG.pt = setTimeout(() => { if(!XG || XG.done) return; XG.busy = false; xJudge(right, k); }, ms * SCI_FX); return; }
  if(right){ XG.busy = true; xRender(); const ms = r.play ? r.play(k) : r.playAns && XG.watched && !r.watch ? r.playAns() : 300; XG.pt = setTimeout(() => { if(!XG || XG.done) return; XG.busy = false; xJudge(true, k); }, ms * SCI_FX); return; }
  if(r.showWrong && r.play){ XG.busy = true; xRender(); const ms = r.play(k); XG.pt = setTimeout(() => { if(!XG || XG.done) return; XG.busy = false; xJudge(false, k); XG.pt = setTimeout(() => { if(XG && !XG.solved){ XG.cups[0].col = CABBAGE; xRender(); } }, 1400 * SCI_FX); }, ms * SCI_FX); return; }
  xJudge(false, k);
}
function xGot(r, k){ (r.found || []).forEach(n => { if(XG.found.indexOf(n) < 0) XG.found.push(n); }); (r.builtAns || (r.built ? r.built(k) : [])).forEach(b => { if(b && XG.built.indexOf(b) < 0) XG.built.push(b); }); }
function xJudge(right, k){
  const r = XG.list[XG.i], lv = XG.lv;
  if(right){ const pts = qPts(XG.tries); XG.score += pts; if(XG.tries === 0) XG.first++; XG.solved = true; clearTimeout(XG.tm); clearTimeout(XG.gt); xGot(r, k);
    UISound.play('success'); if(XBUD) XBUD.react('joy'); XBAR.score(Math.round(XG.score * SCI_MULT(lv)));
    xSay('ok', r.good ? r.good(k) : 'Right!', pts); xRender(); gcEmit('right', {exp: XG.exp}); return; }
  XG.tries++; XG.miss++; XBAR.miss(XG.miss); UISound.play('error'); if(XBUD) XBUD.react('miss'); gcEmit('wrong', {exp: XG.exp});
  if(r.once || lv === 5){ XG.score += 10; XG.solved = true; clearTimeout(XG.tm); clearTimeout(XG.gt); xGot(r, k); if(!r.once && r.playAns) r.playAns(); xSay('end', (r.why ? r.why(k) : '') + ' · +10 for watching'); xRender(); return; }
  if(lv <= 2 && XG.tries >= 2 && r.opts) XG.glowK = r.opts.find(o => r.ok(o.k)).k;
  xSay('try', (r.hintWhy ? r.hintWhy(k) : r.why ? r.why(k) : 'Not quite.') + (lv <= 2 ? ' Try again!' : '')); xRender();
}
function xAnswer(pre){ const r = XG.list[XG.i]; XG.solved = true; clearTimeout(XG.gt); if(r.playAns) r.playAns(); if(r.stepper === 'crystal'){ XG.cups[0].string = true; XG.cups[0].cryTo = 1; XG.dayTo = 7; } if(r.stepper === 'neutral') XG.cups[0].col = CABBAGE;
  xSay('end', pre + (r.stepper === 'crystal' ? 'It needed ' + (r.cap + 1) + ' spoons — the water was full when one stayed at the bottom.' : r.stepper === 'neutral' ? 'It needed ' + r.n + ' spoons of baking soda to be neutral purple.' : r.good ? 'Answer: ' + r.good() : '')); xRender(); }
// 💎 / 🌈 stepper jobs
function xSpoon(){
  if(!XG || XG.solved || XG.busy) return; const r = XG.list[XG.i], c = XG.cups[0]; XG.spoons++; UISound.play('pop');
  if(r.stepper === 'crystal'){ const left = Math.max(0, XG.spoons - r.cap); c.solid = {kind: 'pile', amt: (c.solid ? c.solid.amt : 0) + 1, to: left * 0.5, rate: 1.4};
    $('x-msg').className = 'fm-msg'; $('x-msg').textContent = left ? (left === 1 ? '👀 A little stays at the bottom now — the water is FULL!' : '🥄 More is piling up at the bottom — the water can’t take any more.') : '✨ It disappeared into the water — the water can still take more.'; }
  else { const n = r.n, s = XG.spoons; c.col = s < n ? hexLerp(LIQ.lemon.col, CABBAGE, s / n) : s === n ? CABBAGE : hexLerp(CABBAGE, LIQ.soda.col, Math.min(1, (s - n) / 2)); c.bub = 18; setTimeout(() => { if(c) c.bub = 0; }, 900 * SCI_FX);
    $('x-msg').className = 'fm-msg'; $('x-msg').textContent = '🫧 Fizz! ' + (s < n ? 'Still a bit pink…' : s === n ? 'Look at the colour now…' : 'Hmm, the colour is changing again…'); }
  xRender();
}
function xHang(){
  if(!XG || XG.solved || XG.busy || !XG.spoons) return; const r = XG.list[XG.i], c = XG.cups[0], full = XG.spoons > r.cap; c.string = true; XG.busy = true; XG.day = 0; XG.dayTo = 7; c.cryTo = full ? 1 : 0; xRender();
  XG.pt = setTimeout(() => { if(!XG || XG.done) return; XG.busy = false;
    if(full) return xJudge(true);
    XG.tries++; XG.miss++; XBAR.miss(XG.miss); UISound.play('error'); if(XBUD) XBUD.react('miss'); gcEmit('wrong', {exp: XG.exp});
    if(XG.lv === 5) return xAnswer('❌ Nothing grew. ');
    c.string = false; XG.day = 0; XG.dayTo = 0; xSay('try', 'A week later… nothing grew. The water could still take more — keep adding until a little stays at the bottom.'); xRender(); }, 2200 * SCI_FX);
}
function xStop(){
  if(!XG || XG.solved || XG.busy || !XG.spoons) return; const r = XG.list[XG.i], s = XG.spoons;
  if(s === r.n) return xJudge(true);
  XG.tries++; XG.miss++; XBAR.miss(XG.miss); UISound.play('error'); if(XBUD) XBUD.react('miss'); gcEmit('wrong', {exp: XG.exp});
  if(XG.lv === 5) return xAnswer('❌ ');
  xSay('try', s < r.n ? 'Still pink = still an acid. Add more baking soda until it is purple.' : 'Too much — blue-green means a BASE now. Just the right amount makes neutral purple. Let’s start again!');
  if(s > r.n){ XG.spoons = 0; XG.cups[0].col = LIQ.lemon.col; } xRender();
}
function xEnd(){ XG.done = true; const res = {found: XG.found.slice(), built: XG.built.slice(), right: XG.first, total: XG.list.length, score: Math.round(XG.score * SCI_MULT(XG.lv)), stars: qStars(XG.first, XG.list.length), timeSec: Math.round((Date.now() - XG.t0) / 1000)}; const k = XG.exp; stopExp(); chemSave(k, res); }
/* 📏 s2c chem#11 */
function xLoop(){ cancelAnimationFrame(X_RAF); if(!XG || XG.done) return; const now = performance.now(), dt = XG.lastT ? Math.min(0.1, (now - XG.lastT) / 1000) : 0; XG.lastT = now; xStep(dt); drawBench(); if(SCI_FX) X_RAF = requestAnimationFrame(xLoop); }
function xStep(dt){   // dt = 0 → jump straight to the end (tests, SCI_FX 0)
  if(!XG || !XG.cups) return; const k = dt ? Math.min(1, dt * 3) : 1, mv = (v, to, sp) => dt ? (v < to ? Math.min(to, v + sp * dt) : Math.max(to, v - sp * dt)) : to;
  XG.day = mv(XG.day || 0, XG.dayTo || 0, (XG.dayTo || 1) / 1.6);
  XG.cups.forEach(c => { c.cur = dt ? hexLerp(c.cur, c.col, k) : c.col; c.lvl = mv(c.lvl, c.lvlTo, 0.4); c.foam = mv(c.foam, c.foamTo, 0.8); c.lumps = mv(c.lumps, c.lumpsTo, 0.6); c.layer = mv(c.layer, c.layerTo, 0.8); c.sand = mv(c.sand, c.sandTo, 0.7); c.cloud = mv(c.cloud, 0, 0.5); c.cry = mv(c.cry, c.cryTo, 0.6);
    if(c.solid) c.solid.amt = dt ? mv(c.solid.amt, c.solid.to, c.solid.rate || 1) : c.solid.to;
    if(c.item){ const f = XG.dayTo ? XG.day / XG.dayTo : 0; c.item.rust = (c.item.rustTo || 0) * (dt ? f : 1); c.item.green = (c.item.greenTo || 0) * (dt ? f : 1); }
    if(dt && c.bub > 0){ c.bubT = (c.bubT || 0) + dt * c.bub; while(c.bubT > 1){ c.bubT--; c.bubs.push({x: Math.random(), y: 1, r: 0.02 + Math.random() * 0.04, v: 0.4 + Math.random() * 0.6}); } }
    c.bubs = c.bubs.filter(b => (b.y -= b.v * dt) > 0).slice(-80); });
}
function drawBench(){
  const cv = $('x-cv'); if(!cv || !XG || !XG.cups) return; if(!SCI_FX) xStep(0); const r = cv.getBoundingClientRect(); if(r.width < 10 || r.height < 10) return;
  const dpr = Math.min(2, devicePixelRatio || 1); if(cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)){ cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
  const g = cv.getContext('2d'), W = r.width, H = r.height, n = XG.cups.length; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  const lab = n > 1 && XG.cups.some(c => c.sub), fs = Math.max(11, Math.min(18, H * 0.06)), top = XG.dayTo ? fs * 1.8 : 6, bottom = fs * (lab ? 4.6 : 1.7);
  const rows = n >= 3 && H > W * 0.9 ? 2 : 1, cols = Math.ceil(n / rows), Wd = W < 520 ? W - 58 : W, cellW = Wd / cols, cellH = (H - top) / rows;   // tall phones: 2 rows of glasses, room for the lab buddy
  const ch = Math.max(30, Math.min(cellH - bottom - 8, cellW * 0.8 * 1.3)), cw = ch / 1.3;
  if(XG.dayTo){ g.fillStyle = '#FFE08A'; g.font = '900 ' + fs + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText('📅 Day ' + Math.round(XG.day) + (XG.day >= XG.dayTo - 0.01 ? ' ✓' : ' …'), W / 2, 4); }
  XG.cups.forEach((c, i) => { const row = Math.floor(i / cols), col = i % cols, inRow = row === rows - 1 ? n - cols * (rows - 1) : cols, off = (Wd - inRow * cellW) / 2;
    const x = off + col * cellW + (cellW - cw) / 2, y = top + row * cellH + (cellH - ch - bottom) / 2; drawCup(g, x, y, cw, ch, c, i);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'top'; xFit(g, c.label, cellW * 0.95, fs, '900'); g.fillText(c.label, x + cw / 2, y + ch + 4);
    if(lab){ g.fillStyle = '#C9D6EA'; String(c.sub).split('\n').forEach((ln, j) => { xFit(g, ln, cellW * 0.95, fs * 0.8, '800'); g.fillText(ln, x + cw / 2, y + ch + 4 + fs * (1.25 + 0.95 * j)); }); } });
}
function xFit(g, txt, w, fs, wt){ let f = fs; g.font = wt + ' ' + f + 'px Nunito, sans-serif'; while(f > 8 && g.measureText(txt).width > w){ f -= 1; g.font = wt + ' ' + f + 'px Nunito, sans-serif'; } }
function drawCup(g, x, y, w, h, c, idx){
  const glass = () => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w * 0.92, y + h - 10); g.quadraticCurveTo(x + w * 0.9, y + h, x + w * 0.8, y + h); g.lineTo(x + w * 0.2, y + h); g.quadraticCurveTo(x + w * 0.1, y + h, x + w * 0.08, y + h - 10); g.closePath(); };
  if(c.warm){ g.fillStyle = 'rgba(255,140,60,0.18)'; g.fillRect(x - 4, y + h - 6, w + 8, 8); }
  g.save(); glass(); g.clip();
  g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(x, y, w, h);
  const ly = y + h * (1 - c.lvl);
  if(c.lvl > 0.01){ g.globalAlpha = 0.85; g.fillStyle = c.cur; g.fillRect(x, ly, w, h); g.globalAlpha = 1;
    if(c.layer > 0){ g.fillStyle = 'rgba(232,197,71,' + (0.85 * c.layer) + ')'; g.fillRect(x, ly - h * 0.12 * c.layer, w, h * 0.14 * c.layer); }
    if(c.cloud > 0){ g.fillStyle = 'rgba(194,160,110,' + (0.5 * c.cloud) + ')'; g.fillRect(x, ly, w, h); }
    if(c.foam > 0){ g.fillStyle = 'rgba(255,255,255,0.9)'; for(let k = 0; k < 9; k++){ g.beginPath(); g.arc(x + w * (k + 0.5) / 9, ly - 2, w * 0.07 * (0.6 + c.foam), 0, Math.PI * 2); g.fill(); } } }
  if(c.sand > 0){ g.fillStyle = '#D2B48C'; g.fillRect(x, y + h - h * 0.14 * c.sand, w, h); }
  if(c.lumps > 0){ g.fillStyle = 'rgba(255,255,255,0.95)'; for(let k = 0; k < 10; k++){ const a = (k * 97 % 100) / 100, b = (k * 53 % 100) / 100; g.beginPath(); g.arc(x + w * (0.18 + 0.64 * a), ly + (y + h - ly) * (0.15 + 0.7 * b), w * 0.05 * c.lumps, 0, Math.PI * 2); g.fill(); } }
  if(c.solid && c.solid.amt > 0.01){ const a = c.solid.amt;
    if(c.solid.kind === 'cube'){ const s = w * 0.3 * Math.cbrt(Math.min(1, a)); g.fillStyle = '#FFFFFF'; g.strokeStyle = '#B7C6D6'; g.lineWidth = 2; g.fillRect(x + w / 2 - s / 2, y + h - s - 3, s, s); g.strokeRect(x + w / 2 - s / 2, y + h - s - 3, s, s); }
    else if(c.solid.kind === 'grains'){ g.fillStyle = '#FFFFFF'; const m = Math.round(40 * Math.min(1, a)); for(let k = 0; k < m; k++){ const a1 = (k * 37 % 41) / 41, b1 = (k * 17 % 23) / 23; g.fillRect(x + w * (0.25 + 0.5 * a1), y + h - 5 - h * 0.12 * b1 * Math.min(1, a), 3, 3); } }
    else { const rr = w * 0.16 * Math.sqrt(Math.min(3, a)); g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(x + w / 2, y + h - 2, rr * 1.4, rr, 0, Math.PI, 0); g.fill(); } }
  c.bubs.forEach(b => { g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1.5; g.beginPath(); g.arc(x + w * (0.15 + 0.7 * b.x), ly + (y + h - ly) * b.y, w * b.r, 0, Math.PI * 2); g.stroke(); });
  if(c.item){ const it = c.item, cx = x + w / 2, by = y + h - 6;
    if(it.kind === 'nail' || it.kind === 'pnail'){ const nl = h * 0.62, nw = Math.max(5, w * 0.08); g.fillStyle = it.kind === 'pnail' ? '#3F6FD8' : '#9AA3AD'; g.fillRect(cx - nw / 2, by - nl, nw, nl - nw); g.beginPath(); g.moveTo(cx - nw / 2, by - nw); g.lineTo(cx + nw / 2, by - nw); g.lineTo(cx, by); g.fill(); g.fillRect(cx - nw * 1.4, by - nl - nw * 0.6, nw * 2.8, nw * 0.7);
      if(it.rust > 0){ g.fillStyle = 'rgba(176,84,34,' + Math.min(1, it.rust) + ')'; for(let k = 0; k < 9; k++){ g.beginPath(); g.arc(cx + (k % 2 ? 1 : -1) * nw * 0.25, by - nl * (0.08 + 0.1 * k), nw * (0.25 + 0.3 * it.rust), 0, Math.PI * 2); g.fill(); } } }
    else if(it.kind === 'coin'){ const rr = w * 0.22; g.fillStyle = hexLerp('#C87533', '#4FB89A', it.green || 0); g.beginPath(); g.ellipse(cx, by - rr * 0.4, rr, rr * 0.45, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.25)'; g.stroke(); }
    else if(it.kind === 'ring'){ const rr = w * 0.18; g.strokeStyle = '#E6B422'; g.lineWidth = Math.max(4, w * 0.06); g.beginPath(); g.ellipse(cx, by - rr * 0.5, rr, rr * 0.5, 0, 0, Math.PI * 2); g.stroke(); }
    else { g.fillStyle = '#5DADE2'; g.beginPath(); g.ellipse(cx - w * 0.18, by - 8, w * 0.12, w * 0.08, 0, 0, Math.PI * 2); g.fill(); g.fillRect(cx - w * 0.08, by - 11, w * 0.34, 6); } }
  if(c.string){ g.strokeStyle = '#EDE3C7'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + w / 2, y + 4); g.lineTo(x + w / 2, y + h * 0.75); g.stroke();
    const m = Math.round(12 * c.cry); for(let k = 0; k < m; k++){ const yy = y + h * (0.22 + 0.042 * k), xx = x + w / 2 + (k % 2 ? 1 : -1) * w * (0.03 + 0.05 * ((k * 7) % 3)), sz = w * (0.035 + 0.05 * c.cry) * (0.8 + 0.4 * ((k * 5) % 3) / 2);
      g.fillStyle = 'rgba(235,248,255,0.95)'; g.strokeStyle = '#9CC9E8'; g.lineWidth = 1.5;
      if(c.shape === 'needle'){ g.save(); g.translate(xx, yy); g.rotate((k % 3 - 1) * 0.6); g.fillRect(-sz * 0.12, -sz, sz * 0.24, sz * 2); g.strokeRect(-sz * 0.12, -sz, sz * 0.24, sz * 2); g.restore(); }
      else if(c.shape === 'chunk'){ g.beginPath(); for(let q = 0; q < 6; q++){ const an = q / 6 * Math.PI * 2; g.lineTo(xx + Math.cos(an) * sz, yy + Math.sin(an) * sz * 0.8); } g.closePath(); g.fill(); g.stroke(); }
      else { g.fillRect(xx - sz / 2, yy - sz / 2, sz, sz); g.strokeRect(xx - sz / 2, yy - sz / 2, sz, sz); } } }
  g.restore();
  if(c.string){ g.fillStyle = '#C08A4E'; g.fillRect(x - w * 0.1, y - 4, w * 1.2, 7); }
  if(c.stir){ g.save(); g.translate(x + w * 0.7, y - 4); g.rotate(0.35 + (SCI_FX ? Math.sin(performance.now() / 160) * 0.2 : 0)); g.fillStyle = '#C0C7D1'; g.fillRect(-3, 0, 6, h * 0.8); g.restore(); }
  glass(); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,0.65)'; g.stroke();
}
/* 📏 s2c chem#12 */
function chemGlassMark(){ ['scr-exp', 'scr-formula', 'scr-hunt'].forEach(id => { const s = $(id); if(s) s.classList.add('glx', 'acc-x'); }); }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chemGlassMark); else chemGlassMark();
/* 📏 s2c chem#13 */
function chemMolChip(built){ const have = CHEM.c || [], fresh = (built || []).filter((id, i, a) => have.indexOf(id) < 0 && a.indexOf(id) === i), of = typeof COMPS !== 'undefined' ? COMPS.length : 51;
  return {isNew: fresh.length > 0, t: '⚛️ ' + (fresh.length ? 'New molecule! ' : '') + (have.length + fresh.length) + ' / ' + of}; }
// 🧫 Kitchen lab messages
function xSay(kind, msg, pts){ const el = $('x-msg');
  if(!chemGlass('scr-exp')){ el.className = 'fm-msg' + (kind === 'ok' ? ' ok' : ''); el.textContent = kind === 'ok' ? '✅ ' + msg + ' · +' + pts : kind === 'try' ? '🤔 ' + msg : msg; return; }
  gSay(el, kind, UI.esc(msg), pts, kind === 'ok' ? chemCardChip(XG && XG.found) : null); }
// ⚛️ Formula builder messages
function fmSay(kind, html, pts, c){ const el = $('fm-msg');
  if(!chemGlass('scr-formula')){ el.className = 'fm-msg' + (kind === 'ok' ? ' ok' : ''); el.innerHTML = (kind === 'ok' ? '✅ ' : kind === 'try' ? '🤔 ' : '') + html + (kind === 'ok' && pts ? ' · +' + pts : ''); return; }
  gSay(el, kind, html, pts, kind === 'ok' && c ? chemMolChip(FG ? FG.built : [c.id]) : null); }
/* 📏 s2c chem#14 */
function xTrip(){ if(XG && XG.list) chemTrip('xbar', XBAR, 'exp', XG.i, XG.list.length, XG.solved, XG.okAt || {}); }
function fmTrip(){ if(FG && FG.list) chemTrip('fbar', FBAR, 'mol', FG.i, FG.list.length, FG.solved, FG.okAt || {}); }
function huntTrip(){ if(HG && HG.targets) chemTrip('hbar', HBAR, 'clue', HG.i, HG.targets.length, false, HG.okAt || {}); }
(function(){ const wrap = (f, after) => function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; };
  xNext = wrap(xNext, xTrip);
  xJudge = (f => function(right){ const was = XG && XG.solved, r = f.apply(this, arguments); try{ if(XG && right && !was && XG.solved){ XG.okAt = XG.okAt || {}; XG.okAt[XG.i] = true; } xTrip(); }catch(e){} return r; })(xJudge);
  xAnswer = wrap(xAnswer, xTrip); xHang = wrap(xHang, xTrip); xStop = wrap(xStop, xTrip);
  fmNext = wrap(fmNext, fmTrip);
  fmCheck = (f => function(){ const m = FG ? FG.miss : 0, was = FG && FG.solved, r = f.apply(this, arguments); try{ if(FG && !was && FG.solved && FG.miss === m){ FG.okAt = FG.okAt || {}; FG.okAt[FG.i] = true; } fmTrip(); }catch(e){} return r; })(fmCheck);
  huntNext = wrap(huntNext, huntTrip);
  huntTap = (f => function(n){ const i = HG ? HG.i : -1, r = f.apply(this, arguments); try{ if(HG && HG.i > i){ HG.okAt = HG.okAt || {}; HG.okAt[i] = true; } huntTrip(); }catch(e){} return r; })(huntTap);
  // ✨ light words on the bench canvas: dark outline, then the lime glow
  const db = drawBench; drawBench = function(){ const cv = $('x-cv'); if(cv && chemGlass('scr-exp')){ glxText(cv.getContext('2d')); window.L3GLOW = CHEM_GLOW; } try{ return db.apply(this, arguments); } finally { window.L3GLOW = false; } };
})();
SciLab.loaded('chem', 's2c');
