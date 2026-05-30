/* ============================================================
   Эдгар Каграманян — интерактив лендинга
   Загружается с атрибутом defer, поэтому DOM уже готов.
   ============================================================ */

// ---- mobile menu toggle ----
(function(){
  var t=document.querySelector('.nav-toggle');
  var m=document.getElementById('mobileMenu');
  if(!t||!m) return;
  function close(){m.classList.remove('open');t.classList.remove('open');t.setAttribute('aria-expanded','false');}
  t.addEventListener('click',function(){
    var open=m.classList.toggle('open');
    t.classList.toggle('open',open);
    t.setAttribute('aria-expanded',open?'true':'false');
  });
  m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',close)});
  addEventListener('keydown',function(e){if(e.key==='Escape')close()});
})();

// ---- scroll reveal ----
(function(){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        setTimeout(function(){en.target.classList.add('in')}, (en.target.dataset.d||0));
        io.unobserve(en.target);
      }
    });
  },{threshold:.14,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.svc-grid .reveal, .stats .reveal, .story-col .reveal').forEach(function(el,i){el.dataset.d=(i%3)*90});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
})();

// ---- before / after comparison sliders ----
(function(){
  document.querySelectorAll('.ba').forEach(function(ba){
    var drag=false;
    function set(x){
      var r=ba.getBoundingClientRect();
      var p=(x-r.left)/r.width*100;
      ba.style.setProperty('--pos', Math.max(2,Math.min(98,p))+'%');
    }
    ba.addEventListener('pointerdown',function(e){drag=true;ba.setPointerCapture(e.pointerId);set(e.clientX)});
    ba.addEventListener('pointermove',function(e){if(drag)set(e.clientX)});
    ba.addEventListener('pointerup',function(){drag=false});
    ba.addEventListener('pointercancel',function(){drag=false});
    ba.addEventListener('keydown',function(e){
      var cur=parseFloat(ba.style.getPropertyValue('--pos'))||52;
      if(e.key==='ArrowLeft'){ba.style.setProperty('--pos',Math.max(2,cur-5)+'%');e.preventDefault();}
      if(e.key==='ArrowRight'){ba.style.setProperty('--pos',Math.min(98,cur+5)+'%');e.preventDefault();}
    });
  });
})();

// ---- nav shadow on scroll ----
(function(){
  var nav=document.querySelector('nav');
  if(!nav) return;
  addEventListener('scroll',function(){
    if(scrollY>30){nav.style.boxShadow='0 20px 44px -26px rgba(44,53,59,.6)';nav.style.background='rgba(255,255,255,.92)';}
    else{nav.style.boxShadow='0 14px 30px -22px rgba(44,53,59,.5)';nav.style.background='rgba(255,255,255,.74)';}
  });
})();
