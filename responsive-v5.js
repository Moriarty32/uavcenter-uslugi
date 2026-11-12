(() => {
 'use strict';
 const mobile=matchMedia('(max-width:760px)');
 const price=document.getElementById('price'),home=document.createComment('Desktop price position');
 price.before(home);
 const explanation=document.querySelector('.price-explanation'),projectFields=document.querySelector('.mobile-project-fields');
 const explanationHome=document.createComment('Desktop explanation position');explanation.before(explanationHome);
 function prioritize(){
  if(mobile.matches){document.querySelector('.page-nav').after(price);document.querySelector('#estimate-form').after(explanation);}else{home.after(price);explanationHome.after(explanation);}
  explanation.open=!mobile.matches;projectFields.open=!mobile.matches;
 }
 mobile.addEventListener('change',prioritize);prioritize();
 // Preserve native controls as the single form value, and enhance only when supported.
 if(!('showPopover' in HTMLElement.prototype))return;
 let opened=null;
 document.querySelectorAll('select').forEach((select,index)=>{
  const id=select.id||`select-${index}`;select.id=id;
  const sourceLabel=select.labels?.[0];const clone=sourceLabel?.cloneNode(true);clone?.querySelectorAll('select,input,textarea').forEach(el=>el.remove());
  const label=clone?.textContent.replace(/\s+/g,' ').trim()||select.name;
  const wrap=document.createElement('span');wrap.className='design-select';
  const trigger=document.createElement('button');trigger.type='button';trigger.className='design-select-trigger';trigger.setAttribute('role','combobox');trigger.setAttribute('aria-label',label);trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-controls',`${id}-options`);
  const value=document.createElement('span'),arrow=document.createElement('span');arrow.className='design-select-arrow';arrow.setAttribute('aria-hidden','true');trigger.append(value,arrow);
  const list=document.createElement('div');list.id=`${id}-options`;list.className='design-select-list';list.setAttribute('role','listbox');list.setAttribute('aria-label',label);list.setAttribute('popover','manual');
  const options=[...select.options].map((option,i)=>{const el=document.createElement('div');el.id=`${id}-option-${i}`;el.className='design-select-option';el.setAttribute('role','option');el.textContent=option.textContent.trim();el.addEventListener('pointerdown',e=>e.preventDefault());el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();commit(i);});list.append(el);return el;});
  select.after(wrap);wrap.append(trigger,list);select.hidden=true;select.tabIndex=-1;
  // An explicit label avoids the new button being activated as an implicit label target twice.
  if(sourceLabel)sourceLabel.htmlFor=id;
  let active=select.selectedIndex,search='',searchTimer;
  function sync(){value.textContent=select.selectedOptions[0]?.textContent.trim()||'';trigger.disabled=select.disabled;options.forEach((el,i)=>el.setAttribute('aria-selected',String(i===select.selectedIndex)));}
  function close(){if(list.matches(':popover-open'))list.hidePopover();trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant');if(opened?.trigger===trigger)opened=null;}
  function highlight(i){active=Math.max(0,Math.min(options.length-1,i));options.forEach((el,j)=>el.classList.toggle('is-active',j===active));trigger.setAttribute('aria-activedescendant',options[active].id);options[active].scrollIntoView({block:'nearest'});}
  function position(){const r=trigger.getBoundingClientRect();const height=Math.min(280,options.length*49+14);const below=innerHeight-r.bottom-12;const above=r.top-12;const up=below<height&&above>below;const available=up?above:below;const h=Math.min(height,Math.max(100,available));list.style.width=`${Math.min(Math.max(r.width,130),innerWidth-24)}px`;list.style.maxHeight=`${h}px`;list.style.left=`${Math.max(12,Math.min(r.left,innerWidth-parseFloat(list.style.width)-12))}px`;list.style.top=`${up?Math.max(8,r.top-h-6):r.bottom+6}px`;}
  function open(){if(trigger.disabled)return;if(opened)opened.close();sync();position();list.showPopover();trigger.setAttribute('aria-expanded','true');opened={trigger,list,close};highlight(select.selectedIndex);}
  function commit(i){select.selectedIndex=i;sync();close();select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));trigger.focus({preventScroll:true});}
  trigger.addEventListener('click',()=>trigger.getAttribute('aria-expanded')==='true'?close():open());
  trigger.addEventListener('keydown',e=>{
   const expanded=trigger.getAttribute('aria-expanded')==='true';
   if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();if(!expanded)open();else highlight(e.key==='Home'?0:e.key==='End'?options.length-1:active+(e.key==='ArrowDown'?1:-1));}
   else if(e.key==='Enter'||e.key===' '){e.preventDefault();expanded?commit(active):open();}
   else if(e.key==='Escape'&&expanded){e.preventDefault();e.stopImmediatePropagation();close();}
   else if(e.key==='Tab'){close();}
   else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey){clearTimeout(searchTimer);search+=e.key.toLocaleLowerCase('ru');const found=options.findIndex(el=>el.textContent.toLocaleLowerCase('ru').startsWith(search));if(found>=0){if(!expanded)open();highlight(found);}searchTimer=setTimeout(()=>{search='';},600);}
  });
  select.addEventListener('change',sync);select.form?.addEventListener('reset',()=>setTimeout(sync,0));new MutationObserver(sync).observe(select,{attributes:true,attributeFilter:['disabled']});
  select.form?.addEventListener('change',sync);sync();
 });
 document.addEventListener('pointerdown',e=>{if(opened&&!opened.list.contains(e.target)&&!opened.trigger.contains(e.target))opened.close();});
 document.addEventListener('focusin',e=>{if(opened&&e.target!==opened.trigger&&!opened.list.contains(e.target))opened.close();});
 document.addEventListener('scroll',e=>{if(opened&&!opened.list.contains(e.target))opened.close();},true);
 window.addEventListener('resize',()=>opened?.close());
 document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>opened?.close()));
})();
