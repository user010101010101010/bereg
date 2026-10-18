import {ArrowUpRight,BookOpen,Send,UsersRound} from 'lucide-react';

const socials=[
 {name:'Telegram',url:'https://t.me/beregryadom',Icon:Send},
 {name:'VK',url:'https://vk.ru/beregryadom',Icon:UsersRound},
 {name:'Дзен',url:'https://dzen.ru/beregryadom',Icon:BookOpen},
];

export function SocialLinks({variant='compact'}:{variant?:'compact'|'cards'}){
 return <nav className={`social-links social-links-${variant}`} aria-label="Берег в социальных сетях">
  {socials.map(({name,url,Icon})=><a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} — Берег (откроется в новой вкладке)`}>
   <span className="social-link-icon"><Icon size={20} strokeWidth={1.6} aria-hidden="true"/></span>
   <span className="social-link-copy"><strong>{name}</strong>{variant==='cards'&&<span>@beregryadom</span>}</span>
   <ArrowUpRight className="social-link-arrow" size={17} strokeWidth={1.6} aria-hidden="true"/>
  </a>)}
 </nav>;
}
