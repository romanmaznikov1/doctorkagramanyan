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
  document.querySelectorAll('.svc-grid .reveal, .stats .reveal').forEach(function(el,i){el.dataset.d=(i%3)*90});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
})();

// ---- works gallery (tabs + case cards) ----
(function(){
  /* ---- DATA ---- */
  var CATS = [
    {key:'Аутотрансплантация',             label:'Аутотрансплантация'},
    {key:'Имплантация',                     label:'Имплантация'},
    {key:'Костная пластика',                label:'Костная пластика'},
    {key:'Пластика + имплантация',          label:'Пластика + имплантация'},
    {key:'Одномоментная имплантация',       label:'Одномоментная'},
    {key:'Ортодонтические имплантаты',      label:'Ортодонт. имплантаты'},
    {key:'Тотальная реабилитация',          label:'Тотальная реабилитация'},
    {key:'Тотальные работы',                label:'Тотальные работы'},
    {key:'Удаление + аутотрансплантация',   label:'Удаление + аутотрансп.'},
    {key:'Удаление инородного тела',        label:'Удаление инородного тела'},
    {key:'Удаление зубов мудрости',         label:'Удаление зубов мудрости'},
  ];

  function ph(file, label){ return {f: file, label: label}; }
  var CASES = [
    // Аутотрансплантация
    {cat:'Аутотрансплантация', desc:'Кейс 1', photos:[
      ph('Аутотрансплантация1_3.jpeg','До'),
      ph('Аутотрансплантация1_1.jpeg','После'),
      ph('Аутотрансплантация1_2.jpeg','Этап'),
    ]},
    {cat:'Аутотрансплантация', desc:'Кейс 2', photos:[
      ph('Аутотрансплантация2_1.jpeg','До'),
      ph('Аутотрансплантация2_2.jpeg','После'),
    ]},
    {cat:'Аутотрансплантация', desc:'Кейс 3', photos:[
      ph('Аутотрансплантация3_1.jpeg','До'),
      ph('Аутотрансплантация3_2.jpeg','После'),
    ]},
    {cat:'Аутотрансплантация', desc:'Кейс 4', photos:[
      ph('Аутотрансплантация4_1.jpeg','До'),
      ph('Аутотрансплантация4_2.jpeg','После'),
    ]},
    // Имплантация
    {cat:'Имплантация', desc:'Эстетическая зона', photos:[
      ph('Имплантация в эстетически значимой зоне1_2.jpeg','До'),
      ph('Имплантация в эстетически значимой зоне1_1.jpeg','После'),
    ]},
    // Костная пластика
    {cat:'Костная пластика', desc:'Кейс 1', photos:[
      ph('Костная пластика1_1.jpeg','До'),
      ph('Костная пластика1_2.jpeg','После'),
    ]},
    // Пластика + имплантация
    {cat:'Пластика + имплантация', desc:'Кейс 1', photos:[
      ph('Костная пластика + имплантация1_3.jpeg','До'),
      ph('Костная пластика + имплантация1_1.jpeg','Этап'),
      ph('Костная пластика + имплантация1_2.jpeg','После'),
    ]},
    // Одномоментная имплантация
    {cat:'Одномоментная имплантация', desc:'Кейс 1', photos:[
      ph('Одномоментная имплантация2.jpeg','Результат'),
      ph('Одномоментная имплантация3.jpeg','Результат'),
      ph('Одномоментная имплантация1.jpeg','Результат'),
      ph('Одномоментная имплантация4.jpeg','Результат'),
    ]},
    // Ортодонтические имплантаты
    {cat:'Ортодонтические имплантаты', desc:'Кейс 1', photos:[
      ph('Ортодонтические имплантаты1_2.jpeg','До'),
      ph('Ортодонтические имплантаты1_1.jpeg','После'),
    ]},
    {cat:'Ортодонтические имплантаты', desc:'Кейс 2', photos:[
      ph('Ортодонтические имплантаты2_1.jpeg','До'),
      ph('Ортодонтические имплантаты2_2.jpeg','После'),
    ]},
    {cat:'Ортодонтические имплантаты', desc:'Кейс 3', photos:[
      ph('Ортодонтические имплантаты3.jpeg','Результат'),
    ]},
    // Тотальная реабилитация
    {cat:'Тотальная реабилитация', desc:'Нижняя челюсть', photos:[
      ph('Тотальная реабилитация на нижней челюсти1_2.jpeg','До'),
      ph('Тотальная реабилитация на нижней челюсти1_1.jpeg','После'),
    ]},
    // Тотальные работы
    {cat:'Тотальные работы', desc:'Кейс 1', photos:[
      ph('Тотальные работы на имплантатах1_1.jpeg','До'),
      ph('Тотальные работы на имплантатах1_2.jpeg','После'),
    ]},
    {cat:'Тотальные работы', desc:'Кейс 2', photos:[
      ph('Тотальные работы на имплантатах2_1.jpeg','До'),
      ph('Тотальные работы на имплантатах2_2.jpeg','После'),
    ]},
    {cat:'Тотальные работы', desc:'Кейс 3', photos:[
      ph('Тотальные работы на имплантатах3_2.jpeg','До'),
      ph('Тотальные работы на имплантатах3_1.jpeg','После'),
    ]},
    // Удаление + аутотрансплантация
    {cat:'Удаление + аутотрансплантация', desc:'Кейс 1', photos:[
      ph('Удаление зубов мудрости и аутотрансплантация1_1.jpeg','До'),
      ph('Удаление зубов мудрости и аутотрансплантация1_2.jpeg','После'),
    ]},
    // Удаление инородного тела
    {cat:'Удаление инородного тела', desc:'Верхнечелюстная пазуха', photos:[
      ph('Удаление инородного тела из верхнечелюстной пазухи1_1.jpeg','До'),
      ph('Удаление инородного тела из верхнечелюстной пазухи1_2.jpeg','После'),
    ]},
    // Удаление зубов мудрости
    {cat:'Удаление зубов мудрости', desc:'Сложные зубы', photos:[
      ph('Удаление сложных зубов мудрости1_1.jpeg','До'),
      ph('Удаление сложных зубов мудрости1_2.jpeg','После'),
    ]},
  ];

  var gallery  = document.getElementById('worksGallery');
  var tabsEl   = document.getElementById('worksTabs');
  if(!gallery || !tabsEl) return;

  /* ---- build case cards ---- */
  var cardEls = [];
  CASES.forEach(function(cas, cIdx){
    var card = document.createElement('div');
    card.className = 'case-card reveal';
    card.dataset.cat = cas.cat;

    // photo images
    var imgs = cas.photos.map(function(p,i){
      return '<img class="cp-img' + (i===0?' active':'') + '" src="images/'+p.f+'" alt="'+cas.cat+' — '+p.label+'" loading="lazy" decoding="async">';
    }).join('');

    // dots (only if more than 1 photo)
    var dots = '';
    if(cas.photos.length > 1){
      dots = '<div class="cp-dots">' +
        cas.photos.map(function(_,i){
          return '<button class="cp-dot'+(i===0?' active':'')+'" aria-label="Фото '+(i+1)+'"></button>';
        }).join('') +
        '</div>';
    }

    // zoom icon
    var zoomSvg =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>' +
        '<line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>' +
      '</svg>';

    card.innerHTML =
      '<div class="case-photo">' +
        imgs +
        '<div class="cp-overlay">' + zoomSvg + '</div>' +
        dots +
      '</div>' +
      '<div class="case-cap">' +
        '<span class="case-tag">' + cas.cat + '</span>' +
        '<p class="case-desc">' + cas.desc + '</p>' +
      '</div>';

    // dots switching
    if(cas.photos.length > 1){
      var dotBtns  = card.querySelectorAll('.cp-dot');
      var imgEls   = card.querySelectorAll('.cp-img');
      dotBtns.forEach(function(dot, i){
        dot.addEventListener('click', function(e){
          e.stopPropagation();
          imgEls.forEach(function(im,j){ im.classList.toggle('active', j===i); });
          dotBtns.forEach(function(d,j){ d.classList.toggle('active', j===i); });
        });
      });
    }

    // click → lightbox
    card.addEventListener('click', function(){ openLightbox(cIdx, 0); });

    gallery.appendChild(card);
    cardEls.push(card);
  });

  /* ---- staggered reveal ---- */
  var galIO = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        var d = en.target.dataset.d || 0;
        setTimeout(function(){ en.target.classList.add('in'); }, d);
        galIO.unobserve(en.target);
      }
    });
  },{threshold:.1,rootMargin:'0px 0px -5% 0px'});
  cardEls.forEach(function(c,i){ c.dataset.d = (i % 3) * 55; galIO.observe(c); });

  /* ---- tabs ---- */
  var activeCat = CATS[0].key;

  function renderTabs(){
    tabsEl.innerHTML = '';
    CATS.forEach(function(c){
      var btn = document.createElement('button');
      btn.className = 'works-tab' + (c.key === activeCat ? ' active' : '');
      btn.textContent = c.label;
      btn.dataset.cat = c.key;
      tabsEl.appendChild(btn);
    });
  }

  function applyFilter(){
    cardEls.forEach(function(c){
      c.classList.toggle('hidden', c.dataset.cat !== activeCat);
    });
  }

  tabsEl.addEventListener('click', function(e){
    var btn = e.target.closest('.works-tab');
    if(!btn) return;
    activeCat = btn.dataset.cat;
    tabsEl.querySelectorAll('.works-tab').forEach(function(b){
      b.classList.toggle('active', b.dataset.cat === activeCat);
    });
    applyFilter();
  });

  renderTabs();
  applyFilter();

  /* ---- lightbox ---- */
  var lb      = document.getElementById('lightbox');
  var lbImg   = lb.querySelector('.lb-img');
  var lbTag   = lb.querySelector('.lb-tag');
  var lbDesc  = lb.querySelector('.lb-desc');
  var lbClose = lb.querySelector('.lb-close');
  var lbPrev  = lb.querySelector('.lb-prev');
  var lbNext  = lb.querySelector('.lb-next');
  var lbCase  = null;
  var lbIdx   = 0;

  function openLightbox(cIdx, pIdx){
    lbCase = CASES[cIdx];
    lbIdx  = pIdx || 0;
    showLb();
    lb.classList.add('open');
    lb.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox(){
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  function showLb(){
    var p = lbCase.photos[lbIdx];
    lbImg.src = 'images/' + p.f;
    lbImg.alt = lbCase.cat + ' — ' + lbCase.desc;
    lbTag.textContent  = lbCase.cat + ' · ' + lbCase.desc;
    lbDesc.textContent = '';
    lbPrev.disabled = lbIdx <= 0;
    lbNext.disabled = lbIdx >= lbCase.photos.length - 1;
  }

  lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', function(e){ if(e.target === lb) closeLightbox(); });
  lbPrev.addEventListener('click', function(){ if(lbIdx > 0){ lbIdx--; showLb(); }});
  lbNext.addEventListener('click', function(){
    if(lbIdx < lbCase.photos.length-1){ lbIdx++; showLb(); }
  });

  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('open')) return;
    if(e.key==='Escape') closeLightbox();
    if(e.key==='ArrowLeft'  && lbIdx > 0)                         { lbIdx--; showLb(); }
    if(e.key==='ArrowRight' && lbIdx < lbCase.photos.length-1)    { lbIdx++; showLb(); }
  });

  // swipe
  var tsX = 0;
  lb.addEventListener('touchstart', function(e){ tsX = e.touches[0].clientX; },{passive:true});
  lb.addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX - tsX;
    if(Math.abs(dx) > 50){
      if(dx < 0 && lbIdx < lbCase.photos.length-1){ lbIdx++; showLb(); }
      if(dx > 0 && lbIdx > 0)                      { lbIdx--; showLb(); }
    }
  },{passive:true});
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

(function(){
  var nav=document.querySelector('nav');
  if(!nav) return;
  addEventListener('scroll',function(){
    if(scrollY>30){nav.style.boxShadow='0 20px 44px -26px rgba(44,53,59,.6)';nav.style.background='rgba(255,255,255,.92)';}
    else{nav.style.boxShadow='0 14px 30px -22px rgba(44,53,59,.5)';nav.style.background='rgba(255,255,255,.74)';}
  },{passive:true});
})();
