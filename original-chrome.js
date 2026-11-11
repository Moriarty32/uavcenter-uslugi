(() => {
  'use strict';
  const groups = [...document.querySelectorAll('.nav-group')];
  const header = document.querySelector('.header');
  const fine = matchMedia('(min-width:761px) and (hover:hover) and (pointer:fine)');
  let leaveTimer;
  function measure() {document.documentElement.style.setProperty('--header-bottom',`${Math.max(0,header.getBoundingClientRect().bottom)}px`);}
  function closeAll() {clearTimeout(leaveTimer);groups.forEach(group => {group.open=false;});}
  function open(group) {clearTimeout(leaveTimer);measure();groups.forEach(other => {other.open=other===group;});}
  groups.forEach(group => {
    group.addEventListener('mouseenter',()=>{if(fine.matches)open(group);});
    group.addEventListener('mouseleave',()=>{if(fine.matches)leaveTimer=setTimeout(()=>{group.open=false;},180);});
    group.querySelector('summary').addEventListener('click',event=>{
      event.preventDefault();
      if(fine.matches && event.detail>0)open(group);
      else if(group.open)group.open=false;
      else open(group);
    });
    group.addEventListener('focusout',()=>setTimeout(()=>{if(!group.contains(document.activeElement)&&!group.matches(':hover'))group.open=false;},0));
  });
  document.addEventListener('click', event => {
    if(!event.target.closest('.nav-group')||event.target.closest('.nav-dropdown a'))closeAll();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const active = groups.find(group => group.open && group.contains(document.activeElement));
    closeAll();
    if (active && !matchMedia('(max-width:760px)').matches) active.querySelector('summary').focus();
  });
  window.addEventListener('scroll',()=>{if(fine.matches)closeAll();},{passive:true});
  window.addEventListener('resize',()=>{closeAll();measure();},{passive:true});
  measure();
})();
