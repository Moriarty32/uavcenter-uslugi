(() => {
  'use strict';
  const namespace = 'http://www.w3.org/2000/svg';
  const outlines = new Map();

  function measure(button) {
    const {svg, rect} = outlines.get(button);
    const width = button.clientWidth;
    const height = button.clientHeight;
    if (!width || !height) return;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    rect.setAttribute('width', String(width - 1.5));
    rect.setAttribute('height', String(height - 1.5));
    rect.setAttribute('rx', String((height - 1.5) / 2));
  }

  document.querySelectorAll('.btn').forEach(button => {
    if (!button.querySelector('.roll-label')) {
      const nodes = [...button.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (nodes.length) {
        const label = document.createElement('span');
        const first = document.createElement('span');
        const second = document.createElement('span');
        label.className = 'roll-label';
        first.className = 'roll-primary';
        second.className = 'roll-secondary';
        second.setAttribute('aria-hidden', 'true');
        first.textContent = second.textContent = nodes.map(node => node.textContent).join('').trim();
        label.append(first, second);
        nodes[0].before(label);
        nodes.forEach(node => node.remove());
      }
    }
    const svg = document.createElementNS(namespace, 'svg');
    const rect = document.createElementNS(namespace, 'rect');
    svg.classList.add('button-outline');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    rect.setAttribute('x', '.75');
    rect.setAttribute('y', '.75');
    rect.setAttribute('pathLength', '1');
    svg.append(rect);
    button.append(svg);
    outlines.set(button, {svg, rect});
    measure(button);
  });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => measure(entry.target));
    });
    outlines.forEach((_, button) => observer.observe(button));
  } else {
    addEventListener('resize', () => outlines.forEach((_, button) => measure(button)), {passive:true});
  }
  document.fonts.ready.then(() => outlines.forEach((_, button) => measure(button)));
})();
