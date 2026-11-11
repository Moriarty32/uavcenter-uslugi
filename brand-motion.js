(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(min-width: 900px) and (pointer: fine)');
  const headings = [...document.querySelectorAll('h1,h2')];
  // Preserve each heading's accessible name; only visual words are split.
  headings.forEach(heading => {
    if (!heading.hasAttribute('aria-label')) {
      const copy = heading.cloneNode(true);
      copy.querySelectorAll('br').forEach(br => br.replaceWith(' '));
      heading.setAttribute('aria-label', copy.textContent.replace(/\s+/g,' ').trim());
    }
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let index = 0;
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(word => {
        if (!word.trim()) {fragment.append(document.createTextNode(word));return;}
        const clip = document.createElement('span');
        clip.className = 'motion-word';
        clip.setAttribute('aria-hidden','true');
        clip.style.setProperty('--word-order',String(Math.min(index++,5)));
        const inner = document.createElement('span');
        inner.className = 'motion-inner';
        inner.textContent = word;
        clip.append(inner);fragment.append(clip);
      });
      node.replaceWith(fragment);
    });
    heading.classList.add('motion-title');
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add(entry.target.matches('h1,h2') ? 'motion-entered' : 'image-entered');
      observer.unobserve(entry.target);
    }),{threshold:.15});
    [...headings,...document.querySelectorAll('.case-img,.trust-photo')].forEach(el => observer.observe(el));
  }
  // Match the reference's scroll-linked photography without altering native scrolling.
  const hero = document.querySelector('.hero');
  const photo = document.querySelector('.hero-photo');
  let frame = 0;
  function paintPhoto() {
    frame = 0;
    if (reduced.matches || !finePointer.matches || document.hidden) {
      photo.style.removeProperty('--photo-shift');return;
    }
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    photo.style.setProperty('--photo-shift', `${Math.max(-16,Math.min(36,-rect.top*.075)).toFixed(2)}px`);
  }
  function schedule() {if (!frame) frame=requestAnimationFrame(paintPhoto);}
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  reduced.addEventListener('change',schedule);
  finePointer.addEventListener('change',schedule);
  schedule();
})();
