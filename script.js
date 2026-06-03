/* ============================================================
   Эдгар Каграманян — интерактив лендинга
   Загружается с атрибутом defer, поэтому DOM уже готов.
   ============================================================ */

// ---- mobile menu toggle ----
(function(){
  var t=document.querySelector('.nav-toggle');
  var m=document.getElementById('mobileMenu');
  var bd=document.getElementById('menuBackdrop');
  if(!t||!m) return;

  function close(){
    m.classList.remove('open');
    t.classList.remove('open');
    t.setAttribute('aria-expanded','false');
    if(bd){bd.classList.remove('open');bd.setAttribute('aria-hidden','true');}
    document.body.style.overflow='';
  }

  t.addEventListener('click',function(){
    var open=m.classList.toggle('open');
    t.classList.toggle('open',open);
    t.setAttribute('aria-expanded',open?'true':'false');
    if(bd){bd.classList.toggle('open',open);bd.setAttribute('aria-hidden',open?'false':'true');}
    // lock body scroll so content behind the open menu can't scroll (mobile)
    document.body.style.overflow=open?'hidden':'';
  });

  // tap the backdrop to close
  if(bd) bd.addEventListener('click',close);

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
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
})();

// ---- reviews carousel ----
(function(){
  var track = document.getElementById('reviewTrack');
  var prev  = document.getElementById('reviewPrev');
  var next  = document.getElementById('reviewNext');
  var dotsEl= document.getElementById('reviewDots');
  if(!track) return;

  var cards = Array.from(track.querySelectorAll('.review-card'));
  var dots  = [];

  // build dots
  cards.forEach(function(_, i){
    var btn = document.createElement('button');
    btn.className = 'carousel-dot' + (i===0?' active':'');
    btn.setAttribute('aria-label', 'Отзыв ' + (i+1));
    btn.addEventListener('click', function(){ scrollTo(i); });
    dotsEl.appendChild(btn);
    dots.push(btn);
  });

  function getCardWidth(){
    return cards[0] ? cards[0].offsetWidth + parseInt(getComputedStyle(track).gap||'0') : 0;
  }

  function scrollTo(i){
    track.scrollTo({left: i * getCardWidth(), behavior:'smooth'});
  }

  function currentIndex(){
    var w = getCardWidth();
    return w ? Math.round(track.scrollLeft / w) : 0;
  }

  var carousel = track.parentElement;

  function updateDots(){
    var idx = currentIndex();
    dots.forEach(function(d,i){ d.classList.toggle('active', i===idx); });
    var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
    carousel.classList.toggle('scrolled', track.scrollLeft > 20);
    carousel.classList.toggle('at-end', atEnd);
  }

  prev.addEventListener('click', function(){ scrollTo(Math.max(0, currentIndex()-1)); });
  next.addEventListener('click', function(){ scrollTo(Math.min(cards.length-1, currentIndex()+1)); });

  track.addEventListener('scroll', updateDots, {passive:true});

  // keyboard navigation when carousel is focused
  track.setAttribute('tabindex','0');
  track.addEventListener('keydown', function(e){
    if(e.key==='ArrowLeft'){scrollTo(Math.max(0,currentIndex()-1));e.preventDefault();}
    if(e.key==='ArrowRight'){scrollTo(Math.min(cards.length-1,currentIndex()+1));e.preventDefault();}
  });
})();

// ---- before / after comparison sliders ----
(function(){
  var finePointer = window.matchMedia('(pointer:fine)');

  function clamp(v){ return Math.max(2, Math.min(98, v)); }

  document.querySelectorAll('.ba-slider').forEach(function(slider){
    var handle = slider.querySelector('.ba-handle');
    var dragging = false;

    function setPos(clientX){
      var r = slider.getBoundingClientRect();
      var p = clamp((clientX - r.left) / r.width * 100);
      slider.style.setProperty('--pos', p + '%');
      if(handle) handle.setAttribute('aria-valuenow', Math.round(p));
    }

    // grip is always draggable (works on touch too)
    handle.addEventListener('pointerdown', function(e){
      dragging = true;
      try{ handle.setPointerCapture(e.pointerId); }catch(_){}
      e.preventDefault();
    });

    // on devices with a precise pointer, dragging anywhere on the photo works
    slider.addEventListener('pointerdown', function(e){
      if(e.target.closest('.ba-handle')) return;
      if(finePointer.matches){ dragging = true; setPos(e.clientX); }
    });

    window.addEventListener('pointermove', function(e){ if(dragging) setPos(e.clientX); });
    window.addEventListener('pointerup',   function(){ dragging = false; });

    // keyboard control
    handle.addEventListener('keydown', function(e){
      var cur = parseFloat(getComputedStyle(slider).getPropertyValue('--pos')) || 50;
      if(e.key==='ArrowLeft'){ slider.style.setProperty('--pos', clamp(cur-4)+'%'); handle.setAttribute('aria-valuenow',Math.round(clamp(cur-4))); e.preventDefault(); }
      if(e.key==='ArrowRight'){ slider.style.setProperty('--pos', clamp(cur+4)+'%'); handle.setAttribute('aria-valuenow',Math.round(clamp(cur+4))); e.preventDefault(); }
    });
  });
})();

// ---- shared: horizontal scroller (dots + arrows) ----
function buildScroller(track, dotsEl){
  var items = Array.prototype.slice.call(track.children);
  if(items.length < 2) return null;            // нечего листать

  var ARROW = function(d){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="'
      + (d === 'prev' ? '15 18 9 12 15 6' : '9 18 15 12 9 6') + '"/></svg>';
  };
  var prev = document.createElement('button');
  prev.type = 'button'; prev.className = 'scroller-arrow'; prev.setAttribute('aria-label', 'Назад'); prev.innerHTML = ARROW('prev');
  var next = document.createElement('button');
  next.type = 'button'; next.className = 'scroller-arrow'; next.setAttribute('aria-label', 'Вперёд'); next.innerHTML = ARROW('next');
  var dotsWrap = document.createElement('div'); dotsWrap.className = 'scroller-dots';

  function step(){ return items[0].offsetWidth + parseInt(getComputedStyle(track).gap || '0', 10); }
  var dots = [];
  items.forEach(function(_, i){
    var d = document.createElement('button'); d.type = 'button';
    d.className = 'works-dot' + (i===0 ? ' active' : '');
    d.setAttribute('aria-label', 'Слайд ' + (i+1));
    d.addEventListener('click', function(){ track.scrollTo({ left: i * step(), behavior: 'smooth' }); });
    dotsWrap.appendChild(d); dots.push(d);
  });
  dotsEl.appendChild(prev); dotsEl.appendChild(dotsWrap); dotsEl.appendChild(next);

  function curIdx(){ return Math.round(track.scrollLeft / step()); }
  prev.addEventListener('click', function(){ track.scrollTo({ left: Math.max(0, curIdx()-1) * step(), behavior: 'smooth' }); });
  next.addEventListener('click', function(){ track.scrollTo({ left: (curIdx()+1) * step(), behavior: 'smooth' }); });

  function update(){
    var idx = curIdx();
    dots.forEach(function(d, n){ d.classList.toggle('active', n === idx); });
    var atStart = track.scrollLeft <= 2;
    var atEnd   = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    prev.disabled = atStart; next.disabled = atEnd;
  }
  track.addEventListener('scroll', update, { passive:true });
  window.addEventListener('resize', update);
  requestAnimationFrame(update);
  return update;
}

// ---- works: горизонтальный скролл ----
(function(){
  var track  = document.getElementById('worksGrid');
  var dotsEl = document.getElementById('worksDots');
  if(track && dotsEl) buildScroller(track, dotsEl);
})();

// ---- gallery: category tabs + lightbox ----
(function(){
  var tabsEl = document.getElementById('galTabs');
  var panels = document.getElementById('galPanels');
  var lb      = document.getElementById('lightbox');
  if(!tabsEl || !panels || !lb) return;

  var tabs   = Array.from(tabsEl.querySelectorAll('.gal-tab'));
  var panelEls = Array.from(panels.querySelectorAll('.gal-panel'));
  var lbImg  = document.getElementById('lbImg');
  var btnClose = lb.querySelector('.lb-close');
  var btnPrev  = lb.querySelector('.lb-prev');
  var btnNext  = lb.querySelector('.lb-next');

  // ---- tab switching (одна категория видна за раз) ----
  function activate(cat){
    tabs.forEach(function(t){
      var on = t.dataset.cat === cat;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    panelEls.forEach(function(p){
      var on = p.dataset.cat === cat;
      p.classList.toggle('is-active', on);
      if(on){ p.removeAttribute('hidden'); } else { p.setAttribute('hidden',''); }
    });
    // пересчитать точки/затухание для показанной панели (ширина теперь известна)
    if(panelUpd[cat]) requestAnimationFrame(panelUpd[cat]);
  }
  tabsEl.addEventListener('click', function(e){
    var tab = e.target.closest('.gal-tab');
    if(tab) activate(tab.dataset.cat);
  });

  // клавиатура: ←/→ между вкладками, Home/End — к краям (как ожидает role="tablist")
  tabsEl.addEventListener('keydown', function(e){
    var i = tabs.indexOf(document.activeElement);
    if(i < 0) return;
    var to = -1;
    if(e.key === 'ArrowRight') to = (i + 1) % tabs.length;
    else if(e.key === 'ArrowLeft') to = (i - 1 + tabs.length) % tabs.length;
    else if(e.key === 'Home') to = 0;
    else if(e.key === 'End') to = tabs.length - 1;
    if(to < 0) return;
    e.preventDefault();
    tabs[to].focus();
    activate(tabs[to].dataset.cat);
  });

  // ---- per-panel horizontal scroll (dots + arrows) ----
  var panelUpd = {};
  panelEls.forEach(function(panel){
    var track = panel.querySelector('.gal-grid');
    if(!track) return;
    var dotsEl = document.createElement('div');
    dotsEl.className = 'gal-dots';
    panel.appendChild(dotsEl);
    var upd = buildScroller(track, dotsEl);
    if(upd) panelUpd[panel.dataset.cat] = upd;
    else dotsEl.remove();                       // одна карточка — управление не нужно
  });

  // ---- lightbox (листание в пределах активной категории) ----
  var current = -1;            // index within `visible`
  var visible = [];            // items of the active panel

  function show(i){
    if(!visible.length) return;
    current = (i + visible.length) % visible.length;   // wrap around
    var img = visible[current].querySelector('img');
    lbImg.src = img.currentSrc || img.src;   // переиспользуем уже загруженный webp
    lbImg.alt = img.alt;
  }
  function open(item){
    var panel = item.closest('.gal-panel');
    visible = Array.from(panel.querySelectorAll('.gal-shot, .gal-single'));
    var i = visible.indexOf(item);
    if(i < 0) return;
    show(i);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function close(){
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    current = -1;
  }

  panels.querySelectorAll('.gal-shot, .gal-single').forEach(function(it){
    it.addEventListener('click', function(){ open(it); });
  });
  btnPrev.addEventListener('click', function(e){ e.stopPropagation(); show(current-1); });
  btnNext.addEventListener('click', function(e){ e.stopPropagation(); show(current+1); });
  btnClose.addEventListener('click', close);
  // click on backdrop (not on the photo/buttons) closes
  lb.addEventListener('click', function(e){ if(e.target === lb) close(); });

  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('open')) return;
    if(e.key === 'Escape')     close();
    if(e.key === 'ArrowLeft')  show(current-1);
    if(e.key === 'ArrowRight') show(current+1);
  });

  // swipe inside lightbox (mobile)
  var sx=null, sy=null;
  lb.addEventListener('touchstart', function(e){ sx=e.touches[0].clientX; sy=e.touches[0].clientY; }, {passive:true});
  lb.addEventListener('touchend', function(e){
    if(sx===null) return;
    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    if(Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)){ show(dx < 0 ? current+1 : current-1); }
    sx = null;
  }, {passive:true});
})();

(function(){
  var nav=document.querySelector('nav');
  if(!nav) return;
  addEventListener('scroll',function(){
    if(scrollY>30){nav.style.boxShadow='0 20px 44px -26px rgba(44,53,59,.6)';nav.style.background='rgba(255,255,255,.92)';}
    else{nav.style.boxShadow='0 14px 30px -22px rgba(44,53,59,.5)';nav.style.background='rgba(255,255,255,.74)';}
  },{passive:true});
})();
