(function (root, factory) {
  const api = factory(root);

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  root.PepSite = Object.assign(root.PepSite || {}, api);
  api.boot();
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  function setMenuState(button, menu, openIcon, closeIcon, isOpen) {
    if (!button || !menu) {
      return;
    }

    menu.classList.toggle('hidden', !isOpen);
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    if (openIcon) {
      openIcon.classList.toggle('hidden', isOpen);
    }

    if (closeIcon) {
      closeIcon.classList.toggle('hidden', !isOpen);
    }
  }

  function createMobileMenuController(options) {
    const button = options && options.button;
    const menu = options && options.menu;
    const openIcon = options && options.openIcon;
    const closeIcon = options && options.closeIcon;
    const menuLinks =
      menu && typeof menu.querySelectorAll === 'function' ? Array.from(menu.querySelectorAll('a')) : [];

    if (!button || !menu) {
      return null;
    }

    function isOpen() {
      return !menu.classList.contains('hidden');
    }

    function openMenu() {
      setMenuState(button, menu, openIcon, closeIcon, true);
    }

    function closeMenu() {
      setMenuState(button, menu, openIcon, closeIcon, false);
    }

    function toggleMenu() {
      setMenuState(button, menu, openIcon, closeIcon, !isOpen());
    }

    function bind() {
      if (button.dataset.mobileMenuBound === 'true') {
        setMenuState(button, menu, openIcon, closeIcon, isOpen());
        return;
      }

      button.dataset.mobileMenuBound = 'true';
      button.addEventListener('click', toggleMenu);
      menuLinks.forEach((link) => link.addEventListener('click', closeMenu));
      setMenuState(button, menu, openIcon, closeIcon, isOpen());
    }

    return {
      bind,
      openMenu,
      closeMenu,
      toggleMenu,
    };
  }

  function initMobileMenu(doc) {
    if (!doc || typeof doc.getElementById !== 'function') {
      return null;
    }

    const controller = createMobileMenuController({
      button: doc.getElementById('mobile-menu-button'),
      menu: doc.getElementById('mobile-menu'),
      openIcon: doc.getElementById('mobile-menu-open-icon'),
      closeIcon: doc.getElementById('mobile-menu-close-icon'),
    });

    if (!controller) {
      return null;
    }

    controller.bind();
    return controller;
  }

  function setChevronState(chevron, isHidden) {
    if (!chevron) {
      return;
    }

    chevron.classList.toggle('opacity-0', isHidden);
  }

  function createChevronScrollController(options) {
    const chevron = options && options.chevron;
    const rootLike = options && options.root;
    const threshold = options && typeof options.threshold === 'number' ? options.threshold : 24;

    if (!chevron || !rootLike || typeof rootLike.addEventListener !== 'function') {
      return null;
    }

    function sync() {
      setChevronState(chevron, Number(rootLike.scrollY) > threshold);
    }

    function bind() {
      if (chevron.dataset.chevronScrollBound === 'true') {
        sync();
        return;
      }

      chevron.dataset.chevronScrollBound = 'true';
      rootLike.addEventListener('scroll', sync, { passive: true });
      sync();
    }

    return {
      bind,
      sync,
    };
  }

  function initChevronScroll(doc, rootLike) {
    if (!doc || typeof doc.getElementById !== 'function') {
      return null;
    }

    const controller = createChevronScrollController({
      chevron: doc.getElementById('pep-chevron'),
      root: rootLike || root,
    });

    if (!controller) {
      return null;
    }

    controller.bind();
    return controller;
  }

  function createGlossaryLinkController(options) {
    const doc = options && options.doc;
    const rootLike = (options && options.root) || root;
    const links =
      doc && typeof doc.querySelectorAll === 'function'
        ? Array.from(doc.querySelectorAll('.hub-glossary-link'))
        : [];
    let activeHighlightTimeoutId = null;

    if (!doc || links.length === 0) {
      return null;
    }

    function clearHighlight(target) {
      if (!target) {
        return;
      }

      target.classList.remove('hub-glossary-term--highlighted');
    }

    function highlightTarget(target) {
      if (!target) {
        return;
      }

      if (activeHighlightTimeoutId !== null && typeof rootLike.clearTimeout === 'function') {
        rootLike.clearTimeout(activeHighlightTimeoutId);
      }

      target.classList.add('hub-glossary-term--highlighted');

      if (typeof rootLike.setTimeout === 'function') {
        activeHighlightTimeoutId = rootLike.setTimeout(() => {
          clearHighlight(target);
          activeHighlightTimeoutId = null;
        }, 1800);
      }
    }

    function openAndScrollToTarget(target) {
      if (!target) {
        return;
      }

      target.open = true;

      if (typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      highlightTarget(target);
    }

    function bind() {
      links.forEach((link) => {
        if (link.dataset.glossaryLinkBound === 'true') {
          return;
        }

        link.dataset.glossaryLinkBound = 'true';
        link.addEventListener('click', (event) => {
          const href = typeof link.getAttribute === 'function' ? link.getAttribute('href') : '';

          if (!href || href.charAt(0) !== '#') {
            return;
          }

          const target = typeof doc.getElementById === 'function' ? doc.getElementById(href.slice(1)) : null;

          if (!target) {
            return;
          }

          event.preventDefault();
          openAndScrollToTarget(target);
        });
      });
    }

    return {
      bind,
      openAndScrollToTarget,
    };
  }

  function initGlossaryLinks(doc, rootLike) {
    if (!doc || typeof doc.querySelectorAll !== 'function') {
      return null;
    }

    const controller = createGlossaryLinkController({
      doc,
      root: rootLike || root,
    });

    if (!controller) {
      return null;
    }

    controller.bind();
    return controller;
  }

  // const RotatingStatCards = {
  //   mounted() {
  //     this.cards = Array.from(this.el.querySelectorAll('[data-rotating-card]'));
  //     if (this.cards.length === 0) return;
  
  //     this.activeIndex = 0;
  //     this.intervalMs = Number(this.el.dataset.intervalMs) || 4000;
  //     this.toggles = Array.from(this.el.querySelectorAll('[data-rotating-toggle]'));
  
  //     this.applyState = (activeIndex) => {
  //       this.cards.forEach((card, index) => {
  //         const isActive = index === activeIndex;
  //         card.classList.toggle('opacity-100', isActive);
  //         card.classList.toggle('opacity-0', !isActive);
  //         card.classList.toggle('pointer-events-none', !isActive);
  //         card.style.zIndex = isActive ? '20' : '10';
  //       });
  
  //       this.toggles.forEach((toggle, index) => {
  //         const isActive = index === activeIndex;
  //         toggle.classList.toggle('bg-zenith-black/20', !isActive);
  //         toggle.classList.toggle('bg-zenith-black', isActive);
  //         toggle.setAttribute('aria-current', isActive ? 'true' : 'false');
  //       });
  //     };
  
  //     this.goTo = (index) => {
  //       this.activeIndex = index;
  //       this.applyState(this.activeIndex);
  
  //       if (this.intervalId) {
  //         window.clearInterval(this.intervalId);
  //         this.startAutoRotate();
  //       }
  //     };
  
  //     this.onToggleClick = (event) => {
  //       const button = event.target.closest('[data-rotating-toggle-index]');
  //       if (!button) return;
  
  //       const index = Number(button.dataset.rotatingToggleIndex);
  //       if (!Number.isInteger(index) || index < 0 || index >= this.cards.length) return;
  //       this.goTo(index);
  //     };
  
  //     this.el.addEventListener('click', this.onToggleClick);
  
  //     window.requestAnimationFrame(() => {
  //       this.applyState(0);
  //     });
  
  //     this.startAutoRotate = () => {
  //       this.intervalId = window.setInterval(() => {
  //         this.activeIndex = (this.activeIndex + 1) % this.cards.length;
  //         this.applyState(this.activeIndex);
  //       }, this.intervalMs);
  //     };
  
  //     if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || this.cards.length < 2) return;
  //     this.startAutoRotate();
  //   },
  
  //   destroyed() {
  //     if (this.intervalId) window.clearInterval(this.intervalId);
  //     if (this.onToggleClick) this.el.removeEventListener('click', this.onToggleClick);
  //   },
  // };

  function initRotatingStatCards(doc, rootLike) {
    if (!doc || typeof doc.getElementById !== 'function') {
      return null;
    }

    const controller = createRotatingStatCardsController({
      cards: doc.getElementById('rotating-stat-cards'),
      root: rootLike || root,
    });

    if (!controller) {
      return null;
    }

    controller.bind();
    return controller;
  }

  function createRotatingStatCardsController(options) {
    const cards = options && options.cards;
    const rootLike = (options && options.root) || root;

    if (!cards || !rootLike) {
      return null;
    }

    const cardElements =
      typeof cards.querySelectorAll === 'function'
        ? Array.from(cards.querySelectorAll('[data-rotating-card]'))
        : [];
    const toggles =
      typeof cards.querySelectorAll === 'function'
        ? Array.from(cards.querySelectorAll('[data-rotating-toggle]'))
        : [];
    const intervalMs = Number(cards.dataset.intervalMs) || 4000;
    let activeIndex = 0;
    let intervalId = null;

    if (cardElements.length === 0) {
      return null;
    }

    function applyState(index) {
      cardElements.forEach((card, cardIndex) => {
        const isActive = cardIndex === index;
        card.classList.toggle('opacity-100', isActive);
        card.classList.toggle('opacity-0', !isActive);
        card.classList.toggle('pointer-events-none', !isActive);
        card.style.zIndex = isActive ? '20' : '10';
      });

      toggles.forEach((toggle, toggleIndex) => {
        const isActive = toggleIndex === index;
        toggle.classList.toggle('bg-zenith-black/20', !isActive);
        toggle.classList.toggle('bg-zenith-black', isActive);
        toggle.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    }

    function stopAutoRotate() {
      if (intervalId !== null && typeof rootLike.clearInterval === 'function') {
        rootLike.clearInterval(intervalId);
      }

      intervalId = null;
    }

    function startAutoRotate() {
      if (cardElements.length < 2 || typeof rootLike.setInterval !== 'function') {
        return;
      }

      stopAutoRotate();
      intervalId = rootLike.setInterval(() => {
        activeIndex = (activeIndex + 1) % cardElements.length;
        applyState(activeIndex);
      }, intervalMs);
    }

    function goTo(index) {
      if (!Number.isInteger(index) || index < 0 || index >= cardElements.length) {
        return;
      }

      activeIndex = index;
      applyState(activeIndex);

      if (intervalId !== null) {
        startAutoRotate();
      }
    }

    function bind() {
      if (cards.dataset.rotatingStatCardsBound === 'true') {
        applyState(activeIndex);
        return;
      }

      cards.dataset.rotatingStatCardsBound = 'true';

      toggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
          const index = Number(toggle.dataset.rotatingToggleIndex);
          goTo(index);
        });
      });

      const raf =
        typeof rootLike.requestAnimationFrame === 'function'
          ? rootLike.requestAnimationFrame.bind(rootLike)
          : (callback) => callback();
      raf(() => {
        applyState(activeIndex);
      });

      const reduceMotion =
        typeof rootLike.matchMedia === 'function' &&
        rootLike.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!reduceMotion && cardElements.length > 1) {
        startAutoRotate();
      }
    }

    return {
      bind,
      goTo,
      applyState,
      startAutoRotate,
      stopAutoRotate,
    };
  }
  
  function bootAnalytics() {
    if (!root.PepAnalytics || typeof root.PepAnalytics.boot !== 'function') {
      return;
    }

    root.PepAnalytics.boot();
  }

  function boot() {
    bootAnalytics();

    if (root.document) {
      initChevronScroll(root.document, root);
      initGlossaryLinks(root.document, root);
      initMobileMenu(root.document);
      initRotatingStatCards(root.document, root);
    }
  }

  return {
    boot,
    createChevronScrollController,
    createGlossaryLinkController,
    createMobileMenuController,
    createRotatingStatCardsController,
    initChevronScroll,
    initGlossaryLinks,
    initMobileMenu,
    initRotatingStatCards,
  };
});
