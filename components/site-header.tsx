import type {MouseEvent} from 'react';
import {Bookmark,HeartHandshake,Menu,X} from 'lucide-react';

type HeaderDestination='home'|'materials'|'about'|'case';
type Props={view:string;menuOpen:boolean;onMenuChange:(open:boolean)=>void;onNavigate:(view:HeaderDestination)=>void;onSupport:()=>void};

export function SiteHeader({view,menuOpen,onMenuChange,onNavigate,onSupport}:Props){
 const current=view==='article'?'materials':['intake','plan','helper','protect','check'].includes(view)?'home':view;
 const navigate=(event:MouseEvent<HTMLAnchorElement>,destination:HeaderDestination)=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();onMenuChange(false);onNavigate(destination);
 };
 return <header className="site-header capsule-header" onKeyDown={event=>{if(event.key==='Escape')onMenuChange(false)}}>
  <a className="header-brand" href="./" aria-label="Берег — главная" onClick={event=>navigate(event,'home')}><img src="./logo.svg" alt="Берег" width="148" height="42"/></a>
  <nav id="primary-navigation" className={`header-nav${menuOpen?' open':''}`} aria-label="Основная навигация">
   {([{view:'home',label:'Получить помощь',href:'./'},{view:'materials',label:'Материалы',href:'?view=materials'},{view:'about',label:'О нас',href:'?view=about'}] as const).map(item=><a key={item.view} href={item.href} aria-current={current===item.view?'page':undefined} onClick={event=>navigate(event,item.view)}>{item.label}</a>)}
  </nav>
  <div className="header-actions">
   <button className="header-support" onClick={onSupport} aria-label="Мне сейчас тяжело" title="Мне сейчас тяжело"><HeartHandshake size={19} strokeWidth={1.7}/></button>
   <a className="header-case" href="?view=case" aria-label="Мой случай" aria-current={view==='case'?'page':undefined} onClick={event=>navigate(event,'case')}><Bookmark size={17} strokeWidth={1.7}/><span>Мой случай</span></a>
   <button className="header-menu" onClick={()=>onMenuChange(!menuOpen)} aria-label={menuOpen?'Закрыть меню':'Открыть меню'} aria-expanded={menuOpen} aria-controls="primary-navigation">{menuOpen?<X size={21}/>:<Menu size={21}/>}</button>
  </div>
 </header>;
}
