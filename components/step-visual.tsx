import {ArrowRight,BadgeRussianRuble,FileCheck2,FolderSearch,HeartHandshake,Landmark,MessagesSquare,ShieldCheck,TrendingUp,WalletCards,type LucideIcon} from 'lucide-react';

const stepIcons:Record<string,LucideIcon>={
 security:ShieldCheck,
 bank:Landmark,
 bankReply:MessagesSquare,
 evidence:FolderSearch,
 police:FileCheck2,
 debt:BadgeRussianRuble,
 investment:TrendingUp,
 restore:WalletCards,
 protect:ShieldCheck,
 support:HeartHandshake,
};

export function StepIcon({stepId,size=18}:{stepId:string;size?:number}){
 const Icon=stepIcons[stepId]||FileCheck2;
 return <Icon size={size} strokeWidth={1.7} aria-hidden="true" data-step-icon={stepId}/>;
}

// Decorative, code-native artwork uses the existing icon set and brand waves.
export function StepArtwork({stepId}:{stepId:string}){
 return <figure className="step-artwork" aria-hidden="true" data-step-artwork={stepId}>
  <svg className="step-artwork-waves" viewBox="0 0 200 200" fill="none"><path d="M0 118C54 67 98 161 200 91V200H0Z" fill="currentColor"/><path d="M0 150C72 100 119 186 200 126V200H0Z" fill="var(--green)"/></svg>
  <div className="step-artwork-paper"><span className="step-artwork-symbol"><StepIcon stepId={stepId} size={44}/></span><span className="step-artwork-line"/><span className="step-artwork-line short"/></div>
  <span className="step-artwork-badge"><ArrowRight size={23} strokeWidth={2}/></span>
 </figure>;
}
