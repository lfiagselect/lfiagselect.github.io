/* ============================================
   LFIAGtube — Netflix Overlay v1
   Surcouche DOM. Aucune modif app.js / app.min.js.
   Active: body.netflix-overlay-on
   ============================================ */
(function(){
  'use strict';

  // Posters portrait pour Top 10 (mapping catégories prod → fichiers v2-poster)
  var POSTERS = {
    "1985 - 1990 Les débuts":          "/images/categories-v2-poster/1985_-_1990_Les_dbuts.webp",
    "1991 - 1993 Lara Fabian (Français)":"/images/categories-v2-poster/1991_-_1993_Lara_Fabian_Franais.webp",
    "1994 - 1995 Carpe Diem":          "/images/categories-v2-poster/1994_-_1995_Carpe_Diem.webp",
    "1996 - 1999 Pure":                "/images/categories-v2-poster/1996_-_1999_Pure.webp",
    "1999 -2001 Lara Fabian (Anglais)":"/images/categories-v2-poster/1999_-2001_Lara_Fabian_Anglais.webp",
    "2001 - 2003 Nue & ETI":           "/images/categories-v2-poster/2001_-_2003_Nue__ETI.webp",
    "2004 A Wonderful Life":           "/images/categories-v2-poster/2004_A_Wonderful_Life.webp",
    "2005 - 2008 9":                   "/images/categories-v2-poster/2005_-_2008_9.webp",
    "2009 - 2010 TLFM & EWIM":         "/images/categories-v2-poster/2009_-_2010_TLFM__EWIM.webp",
    "2010 - 2012 Mademoiselle Zhivago":"/images/categories-v2-poster/2010_-_2012_Mademoiselle_Zhivago.webp",
    "2013 - 2014 Le Secret":           "/images/categories-v2-poster/2013_-_2014_Le_Secret.webp",
    "2015 - 2016 Ma Vie dans La Tienne":"/images/categories-v2-poster/2015_-_2016_Ma_Vie_dans_La_Tienne.webp",
    "2017 - 2018 Camouflage":          "/images/categories-v2-poster/2017_-_2018_Camouflage.webp",
    "2019 - 2021 Papillon":            "/images/categories-v2-poster/2019_-_2021_Papillon.webp",
    "2024 - Aujourd’hui":         "/images/categories-v2-poster/2024_-_Aujourdhui.webp",
    "2024 - Aujourd'hui":              "/images/categories-v2-poster/2024_-_Aujourdhui.webp",
    "L’Effet Lara - 2026":        "/images/categories-v2-poster/LEffet_Lara_-_2026.webp",
    "L'Effet Lara - 2026":             "/images/categories-v2-poster/LEffet_Lara_-_2026.webp",
    "Lara Fabian - Concerts":          "/images/categories-v2-poster/Lara_Fabian_-_Concerts.webp",
    "Lara Fabian - Divers":            "/images/categories-v2-poster/Lara_Fabian_-_Divers.webp",
    "Lara Fabian - Livres":            "/images/categories-v2-poster/Lara_Fabian_-_Livres.webp",
    "Lara Fabian Documentaires":       "/images/categories-v2-poster/Lara_Fabian_Documentaires.webp",
    "Lara Fabian au Cinéma":           "/images/categories-v2-poster/Lara_Fabian_au_Cinma.webp",
    "Lara Fabian aux Enfoirés":        "/images/categories-v2-poster/Lara_Fabian_aux_Enfoirs.webp",
    "Star Academie 2025":              "/images/categories-v2-poster/Star_Acadmie_2025.webp",
    "Star Academy France":             "/images/categories-v2-poster/Star_Acadmie_2025.webp",
    "The Voice 2026":                  "/images/categories-v2-poster/The_Voice_2026.webp",
    "The Voice Kids 2024":             "/images/categories-v2-poster/The_Voice_Kids_2024.webp"
  };

  var BILLBOARD_SLIDES = [
    { cat:'The Voice 2026', tag:'★ Top 1 · Cette semaine', title:'The Voice 2026', match:'98% Recommandé', year:'2026', badge:'TF1', sub:'Saison en cours',
      desc:"Lara Fabian sublime la nouvelle saison de The Voice. Diffusion tous les samedis à 21h10 sur TF1.",
      bg:'/images/categories-v2/The_Voice_2026.webp', vid:'/images/alune-thevoice-preview.mp4', rating:'TV-G' },
    { cat:"L'Effet Lara - 2026", tag:'✦ Nouveauté 2026', title:"L'Effet Lara", match:'95% Recommandé', year:'2026', badge:'TVA', sub:'Saison 1',
      desc:"Lara Fabian au cœur d'une nouvelle aventure musicale. Diffusion dès le dimanche 12 avril sur TVA.",
      bg:'/images/categories-v2/LEffet_Lara_-_2026.webp', vid:'/images/alune-effetlara-preview.mp4', rating:'TV-G' },
    { cat:'Star Academie 2025', tag:'⚡ Phénomène', title:'Star Académie 2025', match:'97% Recommandé', year:'2025', badge:'TVA', sub:'Édition complète',
      desc:"Revivez la 7e Académie québécoise avec Lara Fabian au piano.",
      bg:'/images/categories-v2/Star_Acadmie_2025.webp', rating:'TV-G' }
  ];

  var rm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var _bbInstalled = false, _top10Installed = false;

  function escAttr(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function escHtml(s){ return String(s==null?'':s).replace(/[&<>]/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}); }

  // App home rend `.cat-grid` (coverflow) ET `.alune-section`. On lit cats depuis [data-cat].
  function readCatsFromDom(){
    // App.js crée: #catGrid > .cov-stage.swiper > .swiper-slide.cov-card[data-cat]
    var nodes = document.querySelectorAll('#catGrid .cov-card[data-cat], .cov-card[data-cat], [data-cat]');
    var seen = {};
    var cats = [];
    nodes.forEach(function(n){
      var c = n.getAttribute('data-cat');
      if (!c) return;
      // Skip non-category data-cat (alune cards, billboard, etc.)
      if (c === '__new__' || c === 'Tout') return;
      if (!seen[c]) { seen[c] = 1; cats.push(c); }
    });
    return cats;
  }
  function hasRenderedContent(){
    return readCatsFromDom().length >= 3;
  }
  function getInsertionPoint(){
    // Inserts top10 row AVANT le coverflow .cat-grid-section
    return document.getElementById('catGridSection') || document.querySelector('.cat-grid-section') || document.querySelector('.alune-section');
  }
  function selectCat(cat){
    if (typeof window.setAluneCategory === 'function') return window.setAluneCategory(cat);
    if (typeof window.selectCatFromGrid === 'function') return window.selectCatFromGrid(cat);
  }

  // ── BILLBOARD ──────────────────────────────
  function installBillboard(){
    if (_bbInstalled) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (!hasRenderedContent()) return;
    var domCats = readCatsFromDom();
    var slides = BILLBOARD_SLIDES.filter(function(s){ return domCats.indexOf(s.cat) !== -1; });
    // Fallback: si aucune cat match strict, montre les slides quand même (la nav par cat fail mais visuel OK)
    if (!slides.length) slides = BILLBOARD_SLIDES.slice();

    var bb = document.createElement('section');
    bb.className = 'nfx-billboard';
    bb.setAttribute('aria-label', 'Sélection en vedette');

    var html = slides.map(function(s, i){
      var vidHtml = s.vid ? '<video class="nfx-bb-vid" muted loop playsinline preload="metadata" data-src="'+escAttr(s.vid)+'"></video>' : '';
      return '<div class="nfx-billboard-slide'+(i===0?' active':'')+'" data-slide="'+i+'" data-cat="'+escAttr(s.cat)+'">'
        + '<div class="nfx-bb-bg" style="background-image:url(\''+escAttr(s.bg)+'\')"></div>'
        + vidHtml
        + '<div class="nfx-bb-content">'
        +   '<div class="nfx-bb-tag">'+escHtml(s.tag)+'</div>'
        +   '<h1 class="nfx-bb-title">'+escHtml(s.title)+'</h1>'
        +   '<div class="nfx-bb-meta">'
        +     '<span class="match">'+escHtml(s.match)+'</span>'
        +     '<span>'+escHtml(s.year)+'</span>'
        +     '<span class="badge">'+escHtml(s.badge)+'</span>'
        +     '<span>'+escHtml(s.sub)+'</span>'
        +   '</div>'
        +   '<p class="nfx-bb-desc">'+escHtml(s.desc)+'</p>'
        +   '<div class="nfx-bb-actions">'
        +     '<button class="nfx-bb-btn nfx-bb-btn-play" data-cat="'+escAttr(s.cat)+'" type="button"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Lecture</button>'
        +     '<button class="nfx-bb-btn nfx-bb-btn-info" data-cat="'+escAttr(s.cat)+'" type="button"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> Plus d\'infos</button>'
        +   '</div>'
        + '</div>'
        + (s.vid ? '<button class="nfx-bb-mute" type="button" aria-label="Activer/désactiver le son"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg></button>' : '')
        + '<div class="nfx-bb-rating">'+escHtml(s.rating)+'</div>'
        + '</div>';
    }).join('') + '<div class="nfx-bb-dots">' + slides.map(function(_,i){return '<button type="button" class="'+(i===0?'active':'')+'" data-dot="'+i+'" aria-label="Diapo '+(i+1)+'"></button>'}).join('') + '</div>';

    bb.innerHTML = html;
    hero.style.display = 'none';
    hero.parentNode.insertBefore(bb, hero);

    var slidesEl = bb.querySelectorAll('.nfx-billboard-slide');
    var dots = bb.querySelectorAll('.nfx-bb-dots button');
    var bbIdx = 0, bbTimer = null;

    function bbGo(i){
      var oldEl = slidesEl[bbIdx];
      oldEl.classList.remove('active');
      if (dots[bbIdx]) dots[bbIdx].classList.remove('active');
      var oldVid = oldEl.querySelector('video');
      if (oldVid) try{ oldVid.pause(); oldVid.classList.remove('show'); }catch(_){}
      bbIdx = ((i % slidesEl.length) + slidesEl.length) % slidesEl.length;
      var newEl = slidesEl[bbIdx];
      newEl.classList.add('active');
      if (dots[bbIdx]) dots[bbIdx].classList.add('active');
      var newVid = newEl.querySelector('video');
      if (newVid && newVid.dataset.src && !newVid.src) newVid.src = newVid.dataset.src;
      if (newVid && !rm){
        setTimeout(function(){
          if (newEl.classList.contains('active')){
            try{ newVid.currentTime = 0; newVid.play().then(function(){ newVid.classList.add('show'); }).catch(function(){}); }catch(_){}
          }
        }, 1800);
      }
    }
    function restartTimer(){ clearInterval(bbTimer); if (rm) return; bbTimer = setInterval(function(){ bbGo(bbIdx+1); }, 9000); }

    dots.forEach(function(d, i){ d.addEventListener('click', function(){ bbGo(i); restartTimer(); }); });
    bb.querySelectorAll('.nfx-bb-mute').forEach(function(btn){
      btn.addEventListener('click', function(){
        var slide = btn.closest('.nfx-billboard-slide');
        var v = slide.querySelector('video');
        if (v) v.muted = !v.muted;
      });
    });
    bb.querySelectorAll('.nfx-bb-btn').forEach(function(btn){
      btn.addEventListener('click', function(){ selectCat(btn.dataset.cat); });
    });

    if (!rm) setTimeout(function(){ bbGo(0); }, 200);
    restartTimer();
    _bbInstalled = true;
  }

  // ── TOP 10 ROW ─────────────────────────────
  function installTop10(){
    if (_top10Installed) return;
    var insertBefore = getInsertionPoint();
    if (!insertBefore) return;
    var cats = readCatsFromDom();
    if (cats.length < 3) return;
    cats = cats.slice(0, 10);

    var imageMap = window.CAT_IMAGES || {};
    var cards = cats.map(function(cat, i){
      var poster = POSTERS[cat] || (imageMap[cat]||'').replace('/categories-v2/','/categories-v2-poster/');
      return '<div class="nfx-top10-card" data-cat="'+escAttr(cat)+'" tabindex="0" role="button" aria-label="'+escAttr(cat+' · classement '+(i+1))+'">'
        + '<span class="nfx-top10-num" aria-hidden="true">'+(i+1)+'</span>'
        + '<div class="nfx-top10-poster"><img src="'+escAttr(poster)+'" alt="'+escAttr(cat)+'" loading="lazy"></div>'
        + '</div>';
    }).join('');

    var section = document.createElement('section');
    section.className = 'nfx-top10-row';
    section.innerHTML = '<div class="sp-row-head"><span class="sp-row-title">★ Top 10 LFIAGtube · Cette semaine</span></div>'
      + '<div class="nfx-top10-track">'
      +   '<div class="nfx-top10-scroll">'+cards+'</div>'
      + '</div>';

    insertBefore.parentNode.insertBefore(section, insertBefore);

    section.querySelectorAll('.nfx-top10-card').forEach(function(card){
      card.addEventListener('click', function(){ selectCat(card.dataset.cat); });
      card.addEventListener('keydown', function(e){ if (e.key==='Enter') selectCat(card.dataset.cat); });
    });

    _top10Installed = true;
  }

  function enableHoverExpand(){
    document.body.classList.add('netflix-overlay-on');
  }

  function apply(){
    try { installBillboard(); } catch(e){ console.warn('[netflix-overlay] billboard:', e); }
    try { installTop10();    } catch(e){ console.warn('[netflix-overlay] top10:', e); }
    try { enableHoverExpand(); } catch(e){}
  }

  document.addEventListener('lfiag:ready', function(){
    setTimeout(apply, 200);
  });

  var poll = 0;
  var pollIv = setInterval(function(){
    poll++;
    if (_bbInstalled && _top10Installed) { clearInterval(pollIv); return; }
    if (poll > 60) { clearInterval(pollIv); return; }
    if (hasRenderedContent()) {
      apply();
      if (_bbInstalled && _top10Installed) clearInterval(pollIv);
    }
  }, 500);

  var mo = new MutationObserver(function(){
    if (hasRenderedContent() && (!_bbInstalled || !_top10Installed)) apply();
  });
  if (document.body) mo.observe(document.body, {childList:true, subtree:true});
  else document.addEventListener('DOMContentLoaded', function(){ mo.observe(document.body, {childList:true, subtree:true}); });
})();
