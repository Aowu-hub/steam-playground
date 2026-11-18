/* r34: Safari-safe card pictures — every iPad / iPhone browser is Safari underneath; desktop Safari too; ?safe=1 to test anywhere */
(function(){ try{ var u = navigator.userAgent || '', ios = /iPad|iPhone|iPod/.test(u) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  safari = /Safari\//.test(u) && !/Chrome|Chromium|CriOS|Edg|OPR|Android|Firefox/.test(u);
  if(ios || safari || /[?&]safe=1/.test(location.search)) document.documentElement.classList.add('wk'); if(/[?&]anim=1/.test(location.search)) document.documentElement.classList.add('wk-anim'); }catch(e){} })();