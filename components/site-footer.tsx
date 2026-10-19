import type {MouseEvent} from 'react';
import {ArrowRight} from 'lucide-react';
import {SocialLinks} from './social-links';

type Destination='home'|'about'|'materials'|'helper'|'case';
type Props={onNavigate:(view:Destination)=>void};

export function SiteFooter({onNavigate}:Props){
 const navigate=(event:MouseEvent<HTMLAnchorElement>,view:Destination)=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();onNavigate(view);
 };
 return <footer className="site-footer editorial-footer">
  <div className="footer-brand-row"><a href="./" aria-label="Берег — главная" onClick={event=>navigate(event,'home')}><img src="./logo-light.svg" alt="Берег" width="228" height="64"/></a></div>
  <div className="footer-grid">
   <section className="footer-invitation" aria-labelledby="footer-invitation-title"><h2 id="footer-invitation-title">Понятные действия<br/>после обмана.</h2><SocialLinks/></section>
   <nav className="footer-pages" aria-label="Навигация в подвале"><h2>Разделы</h2><a href="?view=about" onClick={event=>navigate(event,'about')}>О нас</a><a href="?view=materials" onClick={event=>navigate(event,'materials')}>Статьи</a><a href="?view=helper" onClick={event=>navigate(event,'helper')}>Помогаю близкому</a></nav>
   <div className="footer-case"><h2>Мой случай</h2><p>Ответы, документы и отметки сохраняются в этом браузере.</p><a href="?view=case" onClick={event=>navigate(event,'case')}>Открыть мой случай<ArrowRight size={16} aria-hidden="true"/></a></div>
  </div>
  <p className="footer-signoff">Берег · Помощь после финансового обмана</p>
 </footer>;
}
