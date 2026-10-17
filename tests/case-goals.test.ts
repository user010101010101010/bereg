import assert from 'node:assert/strict';
import test from 'node:test';
import {createCaseGoalTracker,sendCaseGoal,type CaseGoal} from '../lib/case-goals.ts';
import {emptyAnswers} from '../lib/bereg.ts';
import {loadLocalCase,saveLocalCase,removeLocalCase} from '../lib/local-case.ts';

const records=new Map<string,string>();
const browser={location:{href:'https://beregryadom.ru/'},localStorage:{
 getItem:(key:string)=>records.get(key)??null,
 setItem:(key:string,value:string)=>records.set(key,value),
 removeItem:(key:string)=>records.delete(key),
},ym:undefined as undefined|((...args:unknown[])=>void)};
Object.assign(globalThis,{window:browser});

test('the first answer counts once, including after saving and resuming an unfinished intake',()=>{
 records.clear();const sent:CaseGoal[]=[];
 const tracker=createCaseGoalTracker(goal=>sent.push(goal));
 assert.equal(sent.length,0); // Opening the questionnaire does not start it.
 tracker.firstAnswer();tracker.firstAnswer();
 saveLocalCase({answers:{...emptyAnswers,risk:'yes'},documents:{},focusStep:null,goalProgress:tracker.snapshot()});
 const resumed=createCaseGoalTracker(goal=>sent.push(goal));
 resumed.restore(loadLocalCase()!.goalProgress!);resumed.firstAnswer();
 assert.deepEqual(sent,['onboarding_start']);
 assert.equal(resumed.snapshot().planReceived,false);
});

test('a new plan counts on its first display, with no repeat on re-render, reopening, or reload',()=>{
 const sent:CaseGoal[]=[];const tracker=createCaseGoalTracker(goal=>sent.push(goal));
 tracker.firstAnswer();assert.deepEqual(sent,['onboarding_start']);
 tracker.planShown();tracker.planShown();
 const resumed=createCaseGoalTracker(goal=>sent.push(goal));
 resumed.restore(tracker.snapshot());resumed.planShown();
 assert.deepEqual(sent,['onboarding_start','plan_received']);
 // Restoring flags is passive and cannot emit historical conversions.
 resumed.restore({onboardingStarted:true,planReceived:true});
 assert.deepEqual(sent,['onboarding_start','plan_received']);
});

test('step completion counts only a change from unchecked to checked',()=>{
 const sent:CaseGoal[]=[];const tracker=createCaseGoalTracker(goal=>sent.push(goal));
 tracker.stepChanged(false,true);
 tracker.stepChanged(true,true);tracker.stepChanged(true,false);tracker.stepChanged(false,false);
 assert.deepEqual(sent,['plan_step_done']);
 tracker.stepChanged(false,true); // A deliberate new completion after undo is a new action.
 assert.deepEqual(sent,['plan_step_done','plan_step_done']);
});

test('deleting the previous case allows a new intake and new plan to count',()=>{
 const sent:CaseGoal[]=[];const tracker=createCaseGoalTracker(goal=>sent.push(goal));
 tracker.restore({onboardingStarted:true,planReceived:true});tracker.reset();
 tracker.firstAnswer();tracker.planShown();
 assert.deepEqual(sent,['onboarding_start','plan_received']);
});

test('goal flags persist in the case without requiring them in legacy records',()=>{
 records.clear();
 const legacy=saveLocalCase({answers:{...emptyAnswers,risk:'no'},documents:{},focusStep:null});
 assert.equal(loadLocalCase()!.goalProgress,undefined);
 saveLocalCase({...legacy,goalProgress:{onboardingStarted:true,planReceived:true}});
 assert.deepEqual(loadLocalCase()!.goalProgress,{onboardingStarted:true,planReceived:true});
 removeLocalCase();assert.equal(loadLocalCase(),null);
});

test('goals use the supplied Metrika counter and contain no questionnaire or document data',()=>{
 const sent:unknown[][]=[];browser.ym=(...args)=>{sent.push(args)};
 sendCaseGoal('onboarding_start');sendCaseGoal('plan_received');sendCaseGoal('plan_step_done');
 assert.deepEqual(sent,[[113661127,'reachGoal','onboarding_start'],[113661127,'reachGoal','plan_received'],[113661127,'reachGoal','plan_step_done']]);
 browser.ym=undefined;assert.doesNotThrow(()=>sendCaseGoal('plan_received'));
 browser.ym=()=>{throw new Error('blocked')};assert.doesNotThrow(()=>sendCaseGoal('plan_received'));
 browser.ym=undefined;
});
