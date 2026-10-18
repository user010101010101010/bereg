import {useEffect,useRef,useState,type MouseEvent} from 'react';
import {Bookmark,HeartHandshake,Menu,X} from 'lucide-react';
import {createHeaderScrollState,updateHeaderScroll} from '../lib/header-scroll';

type HeaderDestination='home'|'materials'|'about'|'case';
type Props={view:string;menuOpen:boolean;onMenuChange:(open:boolean)=>void;onNavigate:(view:HeaderDestination)=>void;onSupport:()=>void};

export function SiteHeader({view,menuOpen,onMenuChange,onNavigate,onSupport}:Props){
 const header=useRef<HTMLElement>(null);const [hidden,setHidden]=useState(false);
 useEffect(()=>{
  let frame=0;let state=createHeaderScrollState(window.scrollY);
  const update=()=>{
   frame=0;
   const maxY=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
   const position=Math.min(window.scrollY,maxY);
   state=updateHeaderScroll(state,position,menuOpen||Boolean(header.current?.querySelector(':focus-visible')));
   setHidden(state.hidden);
  };
  const schedule=()=>{if(!frame)frame=window.requestAnimationFrame(update)};
  setHidden(false);
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  return()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);if(frame)window.cancelAnimationFrame(frame)};
 },[menuOpen]);
 const current=view==='article'?'materials':['intake','plan','helper'].includes(view)?'home':view;
 const navigate=(event:MouseEvent<HTMLAnchorElement>,destination:HeaderDestination)=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();onMenuChange(false);onNavigate(destination);
 };
 return <header ref={header} className={`site-header capsule-header${hidden?' header-hidden':''}`} onFocusCapture={event=>{if(event.target.matches(':focus-visible'))setHidden(false)}} onKeyDown={event=>{if(event.key==='Escape'&&menuOpen){onMenuChange(false);header.current?.querySelector<HTMLButtonElement>('.header-menu')?.focus()}}}>
  <a className="header-brand" href="./" aria-label="Берег — главная" onClick={event=>navigate(event,'home')}><img src="./logo.svg" alt="Берег" width="148" height="42"/></a>
  <nav id="primary-navigation" className={`header-nav${menuOpen?' open':''}`} aria-label="Основная навигация">
   {([{view:'home',label:'Получить помощь',href:'./'},{view:'materials',label:'Материалы',href:'?view=materials'},{view:'about',label:'О нас',href:'?view=about'}] as const).map(item=><a key={item.view} href={item.href} aria-current={current===item.view?'page':undefined} onClick={event=>navigate(event,item.view)}>{item.label}</a>)}
   <a className="mobile-navigation-extra" href="?view=case" onClick={event=>navigate(event,'case')}>Мой случай и документы</a><button className="mobile-navigation-extra menu-support" onClick={()=>{onMenuChange(false);onSupport()}}>Мне сейчас тяжело — пауза и поддержка</button>
  </nav>
  <div className="header-actions">
   <button className="header-support" onClick={onSupport} aria-label="Мне сейчас тяжело" title="Мне сейчас тяжело"><HeartHandshake size={19} strokeWidth={1.7}/></button>
   <a className="header-case" href="?view=case" aria-label="Мой случай" aria-current={view==='case'?'page':undefined} onClick={event=>navigate(event,'case')}><Bookmark size={17} strokeWidth={1.7}/><span>Мой случай</span></a>
   <button className="header-menu" onClick={()=>onMenuChange(!menuOpen)} aria-label={menuOpen?'Закрыть меню':'Открыть меню'} aria-expanded={menuOpen} aria-controls="primary-navigation">{menuOpen?<X size={21}/>:<Menu size={21}/>}<span>Меню</span></button>
  </div>
 </header>;
}
