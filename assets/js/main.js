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
    initMobileMenu();
    initOrbitMotion();
  };

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
