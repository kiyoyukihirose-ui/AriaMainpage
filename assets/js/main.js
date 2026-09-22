document.documentElement.classList.add('js');

(function () {
  function drawWaveConnector() {
    var wave = document.querySelector('.e-wave');
    if (!wave) return;
    var svg = wave.querySelector('.e-wave-connector');
    var path = svg && svg.querySelector('path');
    if (!path) return;
    var circles = wave.querySelectorAll('.circle-num');
    if (circles.length < 2) return;
    var waveRect = wave.getBoundingClientRect();
    var pts = Array.prototype.map.call(circles, function (c) {
      var r = c.getBoundingClientRect();
      return [r.left + r.width / 2 - waveRect.left, r.top + r.height / 2 - waveRect.top];
    });
    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      d += ' L' + pts[i][0] + ',' + pts[i][1];
    }
    path.setAttribute('d', d);
  }
  // 控えめなカウントアップ（WHAT WE DO 実績数字）
  function initCountUp() {
    var box = document.querySelector('.wwd-stats');
    if (!box) return;
    var isFigmaCapture = window.location.hash.indexOf('figmacapture=') !== -1;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nums = box.querySelectorAll('.count');
    // Figma captures the whole page before scroll-triggered elements enter the viewport.
    // Keep the normal page animation, but render its completed state for design export.
    if (isFigmaCapture) {
      box.classList.add('is-visible');
      Array.prototype.forEach.call(box.querySelectorAll('.wwd-stat'), function (el) {
        el.style.transition = 'none';
      });
      Array.prototype.forEach.call(nums, function (el) {
        el.textContent = el.getAttribute('data-target');
      });
      return;
    }
    function run() {
      box.classList.add('is-visible');
      if (reduce) return;
      var dur = 1200, start = null;
      Array.prototype.forEach.call(nums, function (el) { el.textContent = '0'; });
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        Array.prototype.forEach.call(nums, function (el) {
          el.textContent = String(Math.round(parseFloat(el.getAttribute('data-target')) * e));
        });
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { box.classList.add('is-visible'); return; }
    var done = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting && !done) { done = true; run(); io.disconnect(); } });
    }, { threshold: 0.4 });
    io.observe(box);
    // 保険: 3秒以内に表示されなければ（全ページ撮影・印刷等）アニメーションなしで即表示
    setTimeout(function () { if (!done) { done = true; box.classList.add('is-visible'); io.disconnect(); } }, 3000);
  }

  function initScrollReveals() {
    var groups = [
      '#who-we-are h2, #who-we-are .lead',
      '#what-we-do .intro-panel h2, #what-we-do .intro-panel .lead',
      '#what-we-do .radial .center',
      '#what-we-do .node.commerce h3, #what-we-do .node.commerce p',
      '#what-we-do .node.education h3, #what-we-do .node.education p',
      '#what-we-do .node.legal h3, #what-we-do .node.legal p',
      '#what-we-do .biz-note',
      '#mission-vision .mv-half.navy .eyebrow, #mission-vision .mv-half.navy h3',
      '#mission-vision .mv-half.cobalt .eyebrow, #mission-vision .mv-half.cobalt h3',
      '#how-we-work .intro-panel h2, #how-we-work .intro-panel .lead',
      '#how-we-work .grid3 .item',
      '#how-we-work .hww-band .closing',
      '#where-were-going h2, #where-were-going .chapter-label, #where-were-going .lead',
      '#where-were-going .stack-item',
      '#partnerships .intro-panel h2, #partnerships .intro-panel .mag-body p',
      '#partnerships .detail-wrap > .section-label',
      '#partnerships .e-wave .item',
      '#partnerships .closing-center .cta-call, #partnerships .closing-center .cta-btn',
      '#careers .intro-panel h2, #careers .intro-panel .lead',
      '#careers .careers-band > .wrap > .section-label',
      '#careers .stack-item',
      '#careers .careers-photos, #careers .careers-apply',
      '#contact-band .contact-band-en, #contact-band .contact-band-lead, #contact-band .contact-band-btn',
      '#contact h2, #contact .company-table, #contact .legal-links'
    ];
    var targets = [];
    groups.forEach(function (selector) {
      Array.prototype.forEach.call(document.querySelectorAll(selector), function (el, index) {
        el.classList.add('scroll-reveal');
        el.style.setProperty('--reveal-delay', (index * 0.14) + 's');
        targets.push(el);
      });
    });
    if (!targets.length) return;

    var isFigmaCapture = window.location.hash.indexOf('figmacapture=') !== -1;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isFigmaCapture || reduce || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { observer.observe(el); });
  }

  function initMobileMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');
    if (!button || !nav) return;

    function closeMenu() {
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'メニューを開く');
      nav.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    }

    button.addEventListener('click', function () {
      var willOpen = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(willOpen));
      button.setAttribute('aria-label', willOpen ? 'メニューを閉じる' : 'メニューを開く');
      nav.classList.toggle('is-open', willOpen);
      document.body.classList.toggle('menu-open', willOpen);
    });

    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) closeMenu();
    });
  }

  function initOrbitMotion() {
    var section = document.querySelector('#what-we-do');
    if (!section) return;
    if (!('IntersectionObserver' in window)) {
      section.classList.add('is-orbit-active');
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        section.classList.add('is-orbit-active');
        observer.disconnect();
      });
    }, { threshold: 0.18 });
    observer.observe(section);
  }

  function initPageMotion() {
    initCountUp();
    initScrollReveals();
    initMobileMenu();
    initOrbitMotion();
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initPageMotion); } else { initPageMotion(); }
  window.addEventListener('load', drawWaveConnector);
  window.addEventListener('resize', drawWaveConnector);
})();
