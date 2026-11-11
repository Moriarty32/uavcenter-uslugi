(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function activateTab(tab, focus = false) {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      const next = {ArrowDown:(index + 1) % tabs.length, ArrowRight:(index + 1) % tabs.length,
        ArrowUp:(index - 1 + tabs.length) % tabs.length, ArrowLeft:(index - 1 + tabs.length) % tabs.length,
        Home:0, End:tabs.length - 1}[event.key];
      if (next === undefined) return;
      event.preventDefault();
      activateTab(tabs[next], true);
    });
  });

  const menuButton = document.querySelector('.mobile-menu');
  const menu = document.getElementById('main-nav');
  const mobile = window.matchMedia('(max-width: 760px)');
  function closeMenu(returnFocus = false) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    menu.classList.remove('mobile-open');
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.classList.toggle('mobile-open', open);
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
  document.addEventListener('focusin', event => {
    if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
  mobile.addEventListener('change', () => closeMenu());

  const cases = [
    {title:'Топографическая основа для газопровода', meta:'Кемеровская область · 4 150 га · 94 дня · ООО «Аланс»',
      text:'Аэрофотосъёмка и создание топографической основы для газопровода высокого и среднего давления. По материалам компании, результат включал ортофотоплан, топоплан, цифровую модель местности и материалы для отчёта о геодезических изысканиях. 94 дня — срок полного комплекса этого проекта. График нового объекта рассчитывается отдельно.'},
    {title:'Данные для проектной документации', meta:'Комсомольск-на-Амуре · 2 208 га · ЗАО «Золотопроект»',
      text:'Комплекс инженерно-геодезических изысканий по существующим и строящимся объектам. В опубликованном проекте компании указаны инженерно-топографические планы масштабов 1:1000 и 1:2000 для подготовки проектной документации. Это результат комплекса работ, а не только аэрофотосъёмки.'},
    {title:'Топоплан для подсчёта горных работ', meta:'Дальнегорск · 200 га · ООО «Ваш Партнер Геодезист»',
      text:'Аэрофотосъёмка и обрисовка для подсчёта горных работ в масштабе 1:500 и отвальных работ в масштабе 1:2000. По материалам компании, результатом стал топографический план с высотными отметками.'}
  ];
  const dialog = document.getElementById('case-dialog');
  let dialogOpener;
  document.querySelectorAll('[data-case]').forEach(button => {
    button.addEventListener('click', () => {
      const item = cases[Number(button.dataset.case)];
      document.getElementById('case-title').textContent = item.title;
      document.getElementById('case-meta').textContent = item.meta;
      document.getElementById('case-text').textContent = item.text;
      dialogOpener = button;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    });
  });
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    dialogOpener?.focus({preventScroll:true});
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });

  document.querySelectorAll('.lead-form').forEach(form => {
    const contact = form.elements.contact;
    contact.addEventListener('input', () => contact.setCustomValidity(''));
    form.addEventListener('submit', event => {
      event.preventDefault();
      const value = contact.value.trim();
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const validPhone = /^[+()\d\s.-]+$/.test(value) && value.replace(/\D/g, '').length >= 10 && value.replace(/\D/g, '').length <= 15;
      contact.setCustomValidity(validEmail || validPhone ? '' : 'Укажите телефон с кодом города или корректный e-mail.');
      if (!form.reportValidity()) return;
      const status = form.querySelector('.form-status');
      status.replaceChildren();
      const heading = document.createElement('strong');
      heading.textContent = 'Форма заполнена. Заявка не отправлена.';
      status.append(heading, 'Это демонстрация страницы. Обсудить объект с командой: ');
      const phone = document.createElement('a');
      phone.href = 'tel:+73833830269';
      phone.textContent = '+7 (383) 383-02-69';
      const email = document.createElement('a');
      email.href = 'mailto:info@uavcenter.ru';
      email.textContent = 'info@uavcenter.ru';
      status.append(phone, ' или ', email, '.');
      status.classList.add('visible');
      status.scrollIntoView({behavior:reducedMotion.matches ? 'instant' : 'smooth', block:'nearest'});
    });
  });

  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        reveal.unobserve(entry.target);
      });
    }, {threshold:.12});
    document.querySelectorAll('.section-head,.quality-grid,.trust-panel,.process-step,.conditions-grid article').forEach(element => {
      element.classList.add('reveal');
      reveal.observe(element);
    });
    const navLinks = [...document.querySelectorAll('.page-nav a[href^="#"]')];
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin:'-15% 0px -60% 0px', threshold:0});
    navLinks.forEach(link => sectionObserver.observe(document.querySelector(link.hash)));
  }

  const mobileBar = document.querySelector('.mobile-cta');
  document.addEventListener('focusin', event => {
    if (!event.target.matches('input,textarea,select')) return;
    mobileBar.classList.add('is-hidden');
    mobileBar.inert = true;
  });
  document.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (document.activeElement.matches('input,textarea,select')) return;
      mobileBar.classList.remove('is-hidden');
      mobileBar.inert = false;
    });
  });
})();
