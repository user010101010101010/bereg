export type CaseGoal = 'onboarding_start' | 'plan_received' | 'plan_step_done';
export type GoalProgress = {onboardingStarted:boolean;planReceived:boolean};

export function sendCaseGoal(goal:CaseGoal) {
 if(typeof window==='undefined')return;
 const ym=(window as unknown as {ym?:(counter:number,method:string,goal:CaseGoal)=>void}).ym;
 // Analytics must never interrupt answering questions or saving the case.
 try {if(typeof ym==='function')ym(113661127,'reachGoal',goal)}catch{}
}

export function createCaseGoalTracker(send:(goal:CaseGoal)=>void=sendCaseGoal) {
 let progress:GoalProgress={onboardingStarted:false,planReceived:false};
 return {
  restore(value:GoalProgress){progress={...value}},
  snapshot():GoalProgress{return {...progress}},
  reset(){progress={onboardingStarted:false,planReceived:false}},
  firstAnswer(){
   if(progress.onboardingStarted)return false;
   progress.onboardingStarted=true;
   send('onboarding_start');return true;
  },
  planShown(){
   if(progress.planReceived)return false;
   progress.planReceived=true;
   send('plan_received');return true;
  },
  stepChanged(wasCompleted:boolean,checked:boolean){
   if(checked&&!wasCompleted)send('plan_step_done');
  },
 };
}
