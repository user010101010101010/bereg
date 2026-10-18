import {sendFunnelGoal,type FunnelGoal} from './site-analytics.ts';

export type CaseGoal = FunnelGoal;
export type GoalProgress = {onboardingStarted:boolean;planReceived:boolean};

export const sendCaseGoal=sendFunnelGoal;

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
