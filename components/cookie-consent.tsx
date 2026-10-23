import {useEffect,useRef,useState} from 'react';
import {Cookie} from 'lucide-react';
import type {ConsentChoice} from '@/lib/site-analytics';

export function CookieConsent({onReload}:{onReload:()=>void}){
 const [open,setOpen]=useState(()=>typeof window!=='undefined'&&!window.beregAnalytics?.getChoice());
 const [error,setError]=useState('');const [reload,setReload]=useState(false);const [persisted,setPersisted]=useState(true);
 const panel=useRef<HTMLElement>(null);const origin=useRef<HTMLElement|null>(null);
 useEffect(()=>{
  const show=()=>{origin.current=document.activeElement instanceof HTMLElement?document.activeElement:null;setOpen(true);requestAnimationFrame(()=>panel.current?.focus({preventScroll:true}))};
  const changed=(event:Event)=>{setReload(Boolean((event as CustomEvent).detail?.needsReload));setOpen(!window.beregAnalytics?.getChoice()||Boolean((event as CustomEvent).detail?.needsReload))};
  window.addEventListener('bereg:cookie-settings',show);window.addEventListener('bereg:consent-changed',changed);
  return()=>{window.removeEventListener('bereg:cookie-settings',show);window.removeEventListener('bereg:consent-changed',changed)};
 },[]);
 useEffect(()=>{
  if(!open){document.documentElement.style.setProperty('--cookie-banner-height','0px');return}
  const update=()=>document.documentElement.style.setProperty('--cookie-banner-height',`${(panel.current?.getBoundingClientRect().height||0)+24}px`);
  update();const observer=new ResizeObserver(update);if(panel.current)observer.observe(panel.current);
  return()=>{observer.disconnect();document.documentElement.style.setProperty('--cookie-banner-height','0px')};
 },[open]);
 function choose(choice:ConsentChoice){
  const manager=window.beregAnalytics;
  if(!manager){setError('Не удалось применить выбор. Обновите страницу и попробуйте ещё раз.');return}
  const result=manager.choose(choice);setReload(result.needsReload);setPersisted(result.persisted);
  if(!result.persisted){setError('Браузер не сохранил выбор. В этом окне он действует, но при следующем посещении плашка может появиться снова.');return}
  setError('');if(!result.needsReload){setOpen(false);origin.current?.focus({preventScroll:true})}
 }
 if(!open)return null;
 return <section ref={panel} className="cookie-banner ym-hide-content" aria-labelledby="cookie-title" tabIndex={-1}>
  <Cookie size={24} className="cookie-icon" aria-hidden="true"/>
  <div className="cookie-copy"><h2 id="cookie-title">Cookie и статистика</h2><p>С вашего согласия используем cookie Яндекс Метрики и Top.Mail.Ru/VK для статистики посещений.</p>
   <details><summary>Какие данные используются</summary><div className="cookie-details"><p>Счётчики получают сведения об устройстве, браузере, просмотренных страницах и действиях на сайте. Ответы анкеты, записи и черновики мы не передаём в события аналитики. Вебвизор выключен.</p><p>Ответы и документы сохраняются отдельно в этом браузере. Выбор по аналитике на их сохранение не влияет. Его можно изменить через «Настройки cookie» внизу сайта. После очистки данных браузера выбор потребуется сделать снова.</p><a href="https://yandex.ru/support/metrica/ru/general/cookie-usage" target="_blank" rel="noopener noreferrer">О cookie Яндекс Метрики ↗</a><a href="https://top.mail.ru/help/ru/" target="_blank" rel="noopener noreferrer">О счётчике Top.Mail.Ru ↗</a></div></details>
   {error&&<p className="cookie-message" role="status">{error}</p>}
   {reload&&<p className="cookie-message" role="status">Выбор изменён. Обновите страницу, чтобы применить его к уже загруженным счётчикам.</p>}
  </div>
  <div className="cookie-actions">{reload?<><button className="button primary" disabled={!persisted} onClick={()=>{try{onReload()}catch{setError('Не удалось сохранить текущий случай перед обновлением. Сначала скачайте важные записи и документы.')}}}>Сохранить и обновить</button>{!persisted&&<button className="text-button" onClick={()=>choose(window.beregAnalytics?.getChoice()||'denied')}>Попробовать сохранить выбор</button>}</>:<><button className="button primary" onClick={()=>choose('accepted')}>Согласиться</button><button className="button secondary" onClick={()=>choose('denied')}>Без аналитики</button>{error&&<button className="text-button" onClick={()=>setOpen(false)}>Продолжить в этом окне</button>}</>}</div>
 </section>;
}
