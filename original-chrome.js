(() => {
  'use strict';
  const groups = [...document.querySelectorAll('.nav-group')];
  groups.forEach(group => group.addEventListener('toggle', () => {
    if (group.open) groups.filter(other => other !== group).forEach(other => {other.open = false;});
  }));
  document.addEventListener('click', event => {
    groups.forEach(group => {if (!group.contains(event.target) || event.target.closest('a')) group.open = false;});
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const active = groups.find(group => group.open && group.contains(document.activeElement));
    groups.forEach(group => {group.open = false;});
    if (active && !matchMedia('(max-width:760px)').matches) active.querySelector('summary').focus();
  });
})();
