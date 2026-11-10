(() => {
  const icons = {
    accueil: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11.2 12 4l8.5 7.2"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-5.8h5V20"/></svg>',
    homme: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 4.5 6 6 3.5 9l3 2 1.2-1.5V20h8.6V9.5l1.2 1.5 3-2L18 6l-2.5-1.5C14.5 6 13.4 6.7 12 6.7S9.5 6 8.5 4.5Z"/></svg>',
    femme: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6l1 5 3 9H5l3-9 1-5Z"/><path d="M9 4c.5 1.7 1.5 2.5 3 2.5S14.5 5.7 15 4"/></svg>',
    bebe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M9 5.2C9 3.7 10.2 3 11.2 3c1.4 0 2.3 1.1 2.1 2.4"/><path d="M8.5 11h.01M15.5 11h.01"/><path d="M9.5 15c.8.7 1.6 1 2.5 1s1.7-.3 2.5-1"/><path d="M4.2 10.5H2.8M21.2 10.5h-1.4"/></svg>',
    maison: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14v12H5z"/><path d="M8 9c2-2 6-2 8 0 2 2 2 4 0 6-2 2-6 2-8 0-2-2-2-4 0-6Z"/><path d="M10 11.5c1-1 3-1 4 0"/></svg>',
    evenement: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v10H4zM12 10v10M4 14h16"/><path d="M12 10H8.5C6 10 6 6.5 8.5 6.5 10.5 6.5 12 10 12 10Zm0 0h3.5C18 10 18 6.5 15.5 6.5 13.5 6.5 12 10 12 10Z"/></svg>',
    realisations: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m5.5 17 4.2-4.2 3.1 3.1 2.3-2.3 3.4 3.4"/></svg>',
    apropos: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>',
    faq: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 0 1 4.6 1c0 1.8-2.4 2.1-2.4 3.6M12 17h.01"/></svg>',
    contact: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3z"/><path d="m4 6 8 7 8-7"/></svg>',
    default: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';

  const normalize = (value) => (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  function iconKey(text) {
    const t = normalize(text);
    if (t === 'accueil' || t === 'home' || t.includes('page d accueil')) return 'accueil';
    if (t.includes('homme')) return 'homme';
    if (t.includes('femme')) return 'femme';
    if (t.includes('bebe')) return 'bebe';
    if (t.includes('maison')) return 'maison';
    if (t.includes('evenement')) return 'evenement';
    if (t.includes('realisation')) return 'realisations';
    if (t.includes('propos')) return 'apropos';
    if (t.includes('faq') || t.includes('question')) return 'faq';
    if (t.includes('contact')) return 'contact';
    return 'default';
  }

  function decorateDrawer(drawer) {
    if (!drawer) return;

    const list = drawer.querySelector('.menu-drawer__navigation > .menu-drawer__menu, .menu-drawer__navigation > ul');
    if (!list) return;

    const items = Array.from(list.children).filter((node) => node.tagName === 'LI');
    let secondaryStarted = false;

    items.forEach((li) => {
      const link = li.querySelector('a.menu-drawer__menu-item--mainlist, summary.menu-drawer__menu-item--mainlist, a.menu-drawer__menu-item');
      if (!link) return;

      const textEl = link.querySelector('.menu-drawer__menu-item-text');
      const label = (textEl ? textEl.textContent : link.textContent).trim();
      const key = iconKey(label);
      const isCategory = ['accueil', 'homme', 'femme', 'bebe', 'maison', 'evenement', 'realisations', 'faq', 'contact'].includes(key);

      li.classList.toggle('celiart-menu-category', isCategory);
      li.classList.toggle('celiart-menu-secondary', !isCategory);

      if (!isCategory && !secondaryStarted) {
        li.classList.add('celiart-menu-secondary-first');
        secondaryStarted = true;
      }

      link.classList.add('celiart-menu-top-link');

      if (!link.querySelector('.celiart-menu-icon')) {
        const icon = document.createElement('span');
        icon.className = 'celiart-menu-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = icons[key] || icons.default;
        link.insertBefore(icon, link.firstChild);
      }

      if (isCategory && !link.querySelector('.celiart-menu-arrow')) {
        const chevron = document.createElement('span');
        chevron.className = 'celiart-menu-arrow';
        chevron.setAttribute('aria-hidden', 'true');
        chevron.innerHTML = arrow;
        link.appendChild(chevron);
      }
    });
  }

  function decorateAll() {
    document.querySelectorAll('header-drawer, .header-drawer').forEach(decorateDrawer);
  }

  decorateAll();
  document.addEventListener('DOMContentLoaded', decorateAll);
  document.addEventListener('shopify:section:load', decorateAll);
  document.addEventListener('click', (event) => {
    if (event.target.closest('header-drawer summary, .header-drawer summary')) {
      requestAnimationFrame(decorateAll);
      setTimeout(decorateAll, 80);
      setTimeout(decorateAll, 250);
    }
  });

  new MutationObserver(decorateAll).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
