import {useEffect,useId,useReducer,useRef} from 'react';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import {DialogTitle,DialogDescription} from './ui/dialog';
import {createShoreSession,shoreReducer,shoreSteps,type ShorePracticeStatus,type ShoreFeeling} from '../lib/shore-practice.ts';

export function ShoreScene({revealed=0,mini=false,stopped=false}:{revealed?:number;mini?:boolean;stopped?:boolean}){
 return <div className={'shore-scene'+(mini?' shore-scene-mini':'')} aria-hidden="true" data-motion={stopped?'off':'soft'}>
  <svg viewBox="0 0 640 260" fill="none" focusable="false" preserveAspectRatio={mini?'xMidYMid slice':'xMidYMid meet'}>
   <path fill="var(--cream)" d="M0 0h640v260H0z"/>
   <circle cx="547" cy="56" r="24" fill="var(--lime)" opacity=".7"/>
   <path d="M0 61C113 27 152 130 295 97S445 84 640 22V260H0Z" fill="#d4e5dd"/>
   <path d="M640 63C479 92 459 178 301 156S106 105 0 161V260H640Z" fill="var(--grass)" opacity=".48"/>
   <path d="M0 103C141 53 171 167 319 128S479 130 640 82V260H0Z" fill="var(--green)" opacity=".85"/>
   <path d="M640 97C494 121 516 188 366 183S160 176 109 260H640Z" fill="#e9efdf"/>
   <path className="shore-water-line" d="M27 166C111 140 163 185 238 171M12 213C74 190 118 220 168 210" stroke="var(--cream)" strokeWidth="3" strokeLinecap="round" opacity=".65"/>
   <path d="M580 145C579 130 584 120 591 115M580 145C567 136 565 129 566 121" stroke="var(--green)" strokeWidth="4" strokeLinecap="round"/>
   {revealed>=1&&<g className="shore-scene-addition" data-shore-element="stones"><ellipse cx="346" cy="205" rx="22" ry="12" fill="#8d9e97"/><ellipse cx="394" cy="216" rx="16" ry="9" fill="#aebcb0"/><ellipse cx="365" cy="235" rx="13" ry="7" fill="var(--navy)" opacity=".57"/></g>}
   {revealed>=2&&<g className="shore-scene-addition" data-shore-element="plants" stroke="var(--green)" strokeWidth="5" strokeLinecap="round"><path d="M475 198C473 177 478 161 489 152M475 198C457 185 452 171 455 163M475 198C490 185 502 182 511 183"/><path d="M540 234C538 218 544 205 553 200M540 234C526 225 522 218 524 209"/></g>}
   {revealed>=3&&<g className="shore-scene-addition" data-shore-element="path"><path d="M637 229C562 208 516 225 463 244S381 252 349 259" stroke="var(--cream)" strokeWidth="18" strokeLinecap="round"/><path d="M637 229C562 208 516 225 463 244S381 252 349 259" stroke="#bac9ae" strokeWidth="2" strokeDasharray="4 10" strokeLinecap="round"/></g>}
  </svg>
 </div>;
}

export function ShorePracticeOffer({status,onOpen,onCollapse,prominent=false}:{status?:ShorePracticeStatus;onOpen:()=>void;onCollapse:()=>void;prominent?:boolean}){
 const collapsed=status==='collapsed'||status==='completed';const openButton=useRef<HTMLButtonElement>(null);
 const dismiss=()=>{onCollapse();window.requestAnimationFrame?.(()=>openButton.current?.focus({preventScroll:true}))};
 return <div className={'shore-offer'+(collapsed?' is-collapsed':'')+(prominent?' is-prominent':'')}>
  <div className="shore-offer-copy">{!collapsed&&<span className="eyebrow">Эмоциональная поддержка</span>}<h3>{collapsed?'Практика «Найти берег»':'Можно немного передохнуть'}</h3>
   {!collapsed&&<p>Попробуйте короткую практику: заметить, что вокруг, почувствовать опору и затем вернуться к своим делам.</p>}
   {status==='completed'&&<p className="field-note">Практика завершена. Её можно открыть снова.</p>}
   <div className="shore-offer-actions"><button ref={openButton} className={'button '+(collapsed?'secondary':'primary')} onClick={onOpen}>{collapsed?'Открыть практику':'Попробовать практику'}<ArrowRight size={16}/></button>{!collapsed&&<button className="text-button" onClick={dismiss}>Продолжить без паузы</button>}</div>
  </div>{!collapsed&&<ShoreScene revealed={3} mini stopped/>}
 </div>;
}

export function ShorePracticeSession({onClose,onComplete,onSupport,returnLabel='Вернуться к плану'}:{onClose:()=>void;onComplete:()=>void;onSupport:()=>void;returnLabel?:string}){
 const [session,dispatch]=useReducer(shoreReducer,undefined,createShoreSession);
 const prompt=useRef<HTMLDivElement>(null);const notified=useRef(false);const feelingName=useId();
 useEffect(()=>{prompt.current?.focus({preventScroll:true});prompt.current?.scrollIntoView({block:'nearest',behavior:'instant'})},[session.step]);
 useEffect(()=>{if(session.finished&&!notified.current){notified.current=true;onComplete()}},[session.finished,onComplete]);
 const instruction=shoreSteps[Math.min(session.step,2)];
 return <div className="shore-session ym-hide-content">
  <header><DialogTitle className="dialog-title">Найти берег</DialogTitle><DialogDescription>Короткая практика. Можно вернуться назад, пропустить её или закрыть окно в любой момент.</DialogDescription></header>
  <div className="shore-prompt" data-shore-prompt="" ref={prompt} tabIndex={-1} role="group" aria-labelledby={feelingName+'-title'} aria-describedby={feelingName+'-stage '+feelingName+'-text'}>
   {session.step<3?<><span id={feelingName+'-stage'} className="shore-stage">{session.step+1} из 3</span><h3 id={feelingName+'-title'}>{instruction.title}</h3><p id={feelingName+'-text'}>{instruction.text}</p></>:<><span id={feelingName+'-stage'} className="shore-stage">Пауза завершена</span><h3 id={feelingName+'-title'}>Как вам сейчас?</h3><p id={feelingName+'-text'}>Можно выбрать ответ или сразу вернуться к своим делам.</p></>}
  </div>
  <ShoreScene revealed={session.revealed} stopped={session.motionStopped}/>
  {session.step===3&&<fieldset className="shore-feedback ym-hide-content"><legend className="sr-only">Как вам сейчас? Необязательно</legend>{([['lighter','Немного легче'],['same','Примерно так же'],['uncomfortable','Стало некомфортно']] as [ShoreFeeling,string][]).map(([value,label])=><label key={value}><input className="ym-disable-keys" type="radio" name={feelingName} autoComplete="off" checked={session.feeling===value} onChange={()=>dispatch({type:'feeling',value})}/><span>{label}</span></label>)}</fieldset>}
  {session.feeling==='uncomfortable'&&<p className="shore-discomfort" role="status">Можно завершить практику и вернуться к своим делам или посмотреть варианты поддержки.</p>}
  <div className="shore-practice-controls">
   <div className="shore-primary-actions">{session.step<3?<button className="button primary" onClick={()=>dispatch({type:'next'})}>{instruction.action}<ArrowRight size={17}/></button>:<><button className="button primary" onClick={onClose}>{returnLabel}</button><button className="button secondary" onClick={onSupport}>Посмотреть варианты поддержки</button></>}</div>
   <div className="shore-secondary-actions"><button className="text-button" onClick={()=>session.step===0?onClose():dispatch({type:'back'})}><ArrowLeft size={16}/>Назад</button>{session.step<3&&<button className="text-button" onClick={onClose}>Пропустить практику</button>}</div>
  </div>
 </div>;
}
