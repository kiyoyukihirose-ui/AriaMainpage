document.documentElement.classList.add('js');

(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observeOnce = (element, callback, threshold = 0.18) => {
    if (!('IntersectionObserver' in window)) return callback();
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      callback();
    }, { threshold });
    observer.observe(element);
  };

  const initCountUp = () => {
    const box = document.querySelector('.wwd-stats');
    if (!box) return;
    const numbers = [...box.querySelectorAll('.count')];

    observeOnce(box, () => {
      box.classList.add('is-visible');
      if (reducedMotion) return;
      numbers.forEach(number => { number.textContent = '0'; });
      const startedAt = performance.now();
      const tick = now => {
        const progress = Math.min((now - startedAt) / 1200, 1);
        const eased = 1 - (1 - progress) ** 3;
        numbers.forEach(number => {
          number.textContent = Math.round(Number(number.dataset.target) * eased);
        });
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 0.4);
  };

  const revealGroups = [
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

  const initScrollReveals = () => {
    const targets = revealGroups.flatMap(selector =>
      [...document.querySelectorAll(selector)].map((element, index) => {
        element.classList.add('scroll-reveal');
        element.style.setProperty('--reveal-delay', `${index * 0.14}s`);
        return element;
      })
    );
    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(element => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(element => observer.observe(element));
  };

  const initMobileMenu = () => {
    const button = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');
    if (!button || !nav) return;

    const setMenu = open => {
      const english = document.documentElement.lang === 'en';
      button.setAttribute('aria-expanded', open);
      button.setAttribute('aria-label', english
        ? `${open ? 'Close' : 'Open'} menu`
        : `メニューを${open ? '閉じる' : '開く'}`);
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
    };

    button.addEventListener('click', () => setMenu(button.getAttribute('aria-expanded') !== 'true'));
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
    addEventListener('resize', () => { if (innerWidth > 768) setMenu(false); });
  };

  const initOrbitMotion = () => {
    const section = document.querySelector('#what-we-do');
    if (section) observeOnce(section, () => section.classList.add('is-orbit-active'));
  };

  const initIOSBackgroundMotion = () => {
    const isIOSWebKit = CSS.supports?.('-webkit-touch-callout', 'none')
      && matchMedia('(max-width: 768px)').matches;
    const preview = new URLSearchParams(location.search).has('ios-preview')
      && matchMedia('(max-width: 768px)').matches;
    if ((!isIOSWebKit && !preview) || reducedMotion) return;

    const targets = [...document.querySelectorAll([
      '.hero-photo', '#who-we-are .intro-panel', '#what-we-do',
      '#mission-vision .mv-split', '#how-we-work .intro-panel',
      '#partnerships .intro-panel', '#careers .intro-panel'
    ].join(','))];
    if (!targets.length) return;
    const overscan = 48;
    const maxShift = 40;

    const layers = targets.map(element => {
      const style = getComputedStyle(element);
      if (style.backgroundImage === 'none') return null;
      const layer = document.createElement('span');
      layer.className = 'ios-parallax-layer';
      layer.setAttribute('aria-hidden', 'true');
      layer.style.backgroundImage = style.backgroundImage;
      layer.style.backgroundPosition = style.backgroundPosition;
      element.classList.add('ios-parallax-host');
      element.prepend(layer);
      return { element, layer };
    }).filter(Boolean);
    if (!layers.length) return;

    let queued = false;
    const render = () => {
      queued = false;
      layers.forEach(({ element, layer }) => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < -overscan || rect.top > innerHeight + overscan) return;
        const distance = innerHeight / 2 - (rect.top + rect.height / 2);
        const shift = Math.max(-maxShift, Math.min(maxShift, distance * 0.14));
        layer.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
      });
    };
    const requestRender = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(render);
    };
    addEventListener('scroll', requestRender, { passive: true });
    addEventListener('resize', requestRender, { passive: true });
    render();
  };

  const initLanguagePositionSwitch = () => {
    const storageKey = 'aria-language-position';
    const links = [...document.querySelectorAll('.lang-switch a:not([aria-current])')];

    links.forEach(link => link.addEventListener('click', () => {
      const center = scrollY + innerHeight / 2;
      const section = [...document.querySelectorAll('main > section[id]')]
        .find(item => center >= item.offsetTop && center < item.offsetTop + item.offsetHeight);
      if (!section) return;
      const progress = Math.max(0, Math.min(1, (center - section.offsetTop) / section.offsetHeight));
      try {
        sessionStorage.setItem(storageKey, JSON.stringify({ id: section.id, progress, savedAt: Date.now() }));
      } catch {}
      link.href = `${link.getAttribute('href').split('#')[0]}#${section.id}`;
    }));

    let saved;
    try { saved = JSON.parse(sessionStorage.getItem(storageKey)); } catch {}
    if (!saved?.id || Date.now() - saved.savedAt > 60000 || location.hash !== `#${saved.id}`) return;

    const restore = () => {
      const section = document.getElementById(saved.id);
      if (!section) return;
      const root = document.documentElement;
      const behavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      scrollTo(0, Math.max(0, section.offsetTop + section.offsetHeight * saved.progress - innerHeight / 2));
      root.style.scrollBehavior = behavior;
    };

    requestAnimationFrame(() => requestAnimationFrame(restore));
    addEventListener('load', () => {
      restore();
      try { sessionStorage.removeItem(storageKey); } catch {}
    }, { once: true });
  };

  const init = () => {
    initLanguagePositionSwitch();
    initCountUp();
    initScrollReveals();
    initMobileMenu();
    initOrbitMotion();
    initIOSBackgroundMotion();
  };

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
