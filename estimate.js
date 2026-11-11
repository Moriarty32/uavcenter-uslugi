(() => {
  'use strict';
  const dialog=document.getElementById('estimate-dialog');
  const form=document.getElementById('project-estimate');
  const sections=[...form.querySelectorAll('[data-estimate-step]')];
  const next=form.querySelector('.estimate-next');
  const back=form.querySelector('.estimate-back');
  const submit=form.querySelector('.estimate-submit');
  const error=form.querySelector('.estimate-error');
  const complete=form.querySelector('.estimate-complete');
  const controls=form.querySelector('.estimate-controls');
  let step=0,opener,previousOverflow;
  const numbers=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:4});
  function hectares(){const n=Number(form.elements.area.value);return n*({ha:1,m2:.0001,km2:100}[form.elements.unit.value]);}
  function areaText(){return form.elements.unknownArea.checked?'Площадь уточняется':`${numbers.format(hectares())} га (${numbers.format(hectares()*10000)} м²)`;}
  function syncArea(){
    const unknown=form.elements.unknownArea.checked;
    form.elements.area.disabled=unknown;form.elements.area.required=!unknown;form.elements.unit.disabled=unknown;
    const valid=form.elements.area.value!==''&&form.elements.area.checkValidity();
    form.querySelector('.area-conversion').textContent=unknown?'Уточним площадь по границам объекта.':valid?`${numbers.format(hectares())} га = ${numbers.format(hectares()*10000)} м² = ${numbers.format(hectares()/100)} км²`:'Укажите положительную площадь объекта.';
  }
  function entries(){return [['Расположение',form.elements.region.value.trim()],['Объект',form.elements.object.value],['Площадь',areaText()],['Результат',[...form.querySelectorAll('[name=product]:checked')].map(e=>e.value).join('; ')],['Масштаб',form.elements.scale.value],['Условия',form.elements.terrain.value],['Сроки',form.elements.deadline.value],['Требования',form.elements.requirements.value.trim()||'Уточняются'],['Исходные данные',form.elements.source.value.trim()||'Предоставим отдельно']];}
  function summary(){const target=form.querySelector('.estimate-summary');target.replaceChildren();const list=document.createElement('dl');entries().slice(0,7).forEach(([name,value])=>{const row=document.createElement('div');const dt=document.createElement('dt');dt.textContent=name;const dd=document.createElement('dd');dd.textContent=value;row.append(dt,dd);list.append(row);});target.append(list);}
  function showStep(index,focus=true){
    step=index;error.hidden=true;error.textContent='';complete.hidden=true;controls.hidden=false;
    sections.forEach((section,i)=>{section.hidden=i!==step;});
    dialog.querySelectorAll('.estimate-steps li').forEach((li,i)=>{li.classList.toggle('current',i===step);li.classList.toggle('done',i<step);if(i===step)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
    back.hidden=step===0;next.hidden=step===2;submit.hidden=step!==2;
    if(step===2)summary();
    if(focus){sections[step].querySelector('h3').focus({preventScroll:true});dialog.scrollTop=0;form.scrollTop=0;}
  }
  function validate(){
    error.hidden=true;
    if(step===1&&!form.querySelector('[name=product]:checked')){error.textContent='Выберите результат или помощь инженера.';error.hidden=false;form.querySelector('[name=product]').focus();return false;}
    if(step===2){const v=form.elements.contact.value.trim();const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);const phone=/^[+()\d\s.-]+$/.test(v)&&v.replace(/\D/g,'').length>=10&&v.replace(/\D/g,'').length<=15;form.elements.contact.setCustomValidity(email||phone?'':'Укажите корректный телефон или e-mail.');}
    const invalid=[...sections[step].querySelectorAll('input,select,textarea')].find(el=>!el.checkValidity());
    if(invalid){invalid.reportValidity();return false;}
    return true;
  }
  document.querySelectorAll('[data-estimate-open]').forEach(trigger=>trigger.addEventListener('click',event=>{
    event.preventDefault();opener=trigger;previousOverflow=document.body.style.overflow;
    showStep(step,false);dialog.showModal();document.body.style.overflow='hidden';
    sections[step].querySelector('h3').focus({preventScroll:true});
  }));
  dialog.querySelector('.estimate-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{
    document.body.style.overflow=previousOverflow||'';
    const summary=opener?.closest('.nav-group')?.querySelector('summary');
    const target=opener?.checkVisibility()?opener:summary?.checkVisibility()?summary:document.querySelector('.mobile-menu');
    target?.focus({preventScroll:true});
  });
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  next.addEventListener('click',()=>{if(validate())showStep(step+1);});
  back.addEventListener('click',()=>showStep(Math.max(0,step-1)));
  form.addEventListener('submit',event=>{event.preventDefault();if(!validate())return;if(step<2){showStep(step+1);return;}sections.forEach(section=>{section.hidden=true;});controls.hidden=true;complete.hidden=false;complete.focus({preventScroll:true});form.scrollTop=0;dialog.scrollTop=0;});
  form.addEventListener('input',()=>{form.elements.contact.setCustomValidity('');error.hidden=true;syncArea();});
  form.addEventListener('change',syncArea);
  form.querySelectorAll('[data-area]').forEach(button=>button.addEventListener('click',()=>{form.elements.unknownArea.checked=false;form.elements.unit.value='ha';form.elements.area.value=button.dataset.area;syncArea();form.elements.unit.dispatchEvent(new Event('change',{bubbles:true}));}));
  form.querySelector('.estimate-edit').addEventListener('click',()=>showStep(2));
  form.querySelector('.estimate-download').addEventListener('click',()=>{
    const content=['Запрос на расчёт аэрофотосъёмки — Центр беспилотных технологий','',...entries().map(([k,v])=>`${k}: ${v}`),'',`Имя: ${form.elements.name.value.trim()||'Не указано'}`,`Контакт: ${form.elements.contact.value.trim()}`,'','Стоимость и сроки: индивидуально после проверки объекта.','Сформировано в демонстрации. Заявка не отправлена.'].join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+content],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='UAVCenter-запрос-на-расчёт.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  syncArea();
})();
