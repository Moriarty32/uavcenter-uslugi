(() => {
 'use strict';
 const root=document.documentElement,header=document.querySelector('.header'),nav=document.querySelector('.page-nav');
 function measure(){
  root.style.setProperty('--service-header-height',header.getBoundingClientRect().height+'px');
  root.style.setProperty('--service-nav-height',nav.checkVisibility()?nav.getBoundingClientRect().height+'px':'0px');
 }
 const observer=new ResizeObserver(measure);observer.observe(header);observer.observe(nav);
 addEventListener('resize',measure,{passive:true});document.fonts.ready.then(measure);measure();
})();
