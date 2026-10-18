import type {MouseEvent} from 'react';
import {ArrowRight} from 'lucide-react';
import {SocialLinks} from './social-links';

type Destination='home'|'about'|'materials'|'helper'|'case';
type Props={hasCase:boolean;onStart:()=>void;onNavigate:(view:Destination)=>void;onSupport:()=>void};

export function SiteFooter({hasCase,onStart,onNavigate,onSupport}:Props){
 const navigate=(event:MouseEvent<HTMLAnchorElement>,view:Destination)=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();onNavigate(view);
 };
 return <footer className="site-footer editorial-footer">
  <div className="footer-brand-row"><a href="./" aria-label="Берег — главная" onClick={event=>navigate(event,'home')}><img src="./logo-light.svg" alt="Берег" width="228" height="64"/></a></div>
  <div className="footer-grid">
   <nav className="footer-pages" aria-label="Навигация в подвале"><h2>Разделы</h2><a href="?view=about" onClick={event=>navigate(event,'about')}>О нас</a><a href="?view=materials" onClick={event=>navigate(event,'materials')}>Статьи</a><a href="?view=helper" onClick={event=>navigate(event,'helper')}>Помогаю близкому</a></nav>
   <section className="footer-invitation" aria-labelledby="footer-invitation-title"><h2 id="footer-invitation-title">Понятные действия<br/>после обмана.</h2><div className="footer-actions"><button className="button footer-primary" onClick={onStart}>{hasCase?'Продолжить':'Составить план действий'}<ArrowRight size={17} aria-hidden="true"/></button><button className="footer-support" onClick={onSupport}>Мне сейчас тяжело<ArrowRight size={16} aria-hidden="true"/></button></div><SocialLinks/></section>
   <div className="footer-case"><h2>Мой случай</h2><p>Ответы, документы и отметки сохраняются в этом браузере.</p><a href="?view=case" onClick={event=>navigate(event,'case')}>Открыть мой случай<ArrowRight size={16} aria-hidden="true"/></a></div>
  </div>
  <p className="footer-signoff">Берег · Помощь после финансового обмана</p>
 </footer>;
}
