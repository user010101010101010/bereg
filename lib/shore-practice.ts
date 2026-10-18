export type ShorePracticeStatus = 'shown' | 'collapsed' | 'completed';
export type ShoreFeeling = 'lighter' | 'same' | 'uncomfortable';
export const shoreSteps = [
 {title:'Посмотрите вокруг',text:'Найдите глазами три предмета рядом с вами. Можно просто мысленно назвать их.',action:'Дальше'},
 {title:'Заметьте один звук',text:'Обратите внимание на один звук вокруг. Если удобнее, можно заметить ещё один предмет.',action:'Дальше'},
 {title:'Почувствуйте опору',text:'Если удобно, почувствуйте, как стопы касаются пола или спина опирается на стул. Менять положение специально не нужно.',action:'Завершить паузу'},
] as const;

// Session details, including the optional feeling, exist only in memory.
export type ShoreSession = {step:0|1|2|3;revealed:number;finished:boolean;feeling:ShoreFeeling|null;motionStopped:boolean};
export type ShoreAction = {type:'next'} | {type:'back'} | {type:'feeling';value:ShoreFeeling};
export const createShoreSession = ():ShoreSession => ({step:0,revealed:0,finished:false,feeling:null,motionStopped:false});
export function shoreReducer(state:ShoreSession,action:ShoreAction):ShoreSession {
 if(action.type==='next'&&state.step<3){
  const step=(state.step+1) as ShoreSession['step'];
  return {...state,step,revealed:Math.max(state.revealed,step),finished:state.finished||step===3};
 }
 if(action.type==='back'&&state.step>0)return {...state,step:(state.step-1) as ShoreSession['step'],feeling:null};
 if(action.type==='feeling'&&state.step===3)return {...state,feeling:action.value,motionStopped:state.motionStopped||action.value==='uncomfortable'};
 return state;
}
export function collapseShorePractice(status:ShorePracticeStatus|undefined):ShorePracticeStatus {
 return status==='completed'?'completed':'collapsed';
}
