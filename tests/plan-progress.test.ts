import assert from 'node:assert/strict';
import test from 'node:test';
import {emptyAnswers,generatePlan,buildDraft,isIntakeComplete,hasCaseAnswers} from '../lib/bereg.ts';
import {bankScript,banks} from '../lib/bank-help.ts';
import {getPlanProgress} from '../lib/plan-progress.ts';
import {loadLocalCase,saveLocalCase,removeLocalCase} from '../lib/local-case.ts';

const answers={...emptyAnswers,risk:'yes',timing:'today',kind:'transfer',money:'own',impact:'savings',amount:'50to200',mood:'anxious',support:'yes',already:[]};
const plan=generatePlan(answers);
const key='bereg:case:v1:/bereg/';
const records=new Map<string,string>();
let blocked=false;
Object.assign(globalThis,{window:{location:{href:'https://example.github.io/bereg/?view=plan'},localStorage:{
 getItem:(name:string)=>{if(blocked)throw new Error('blocked');return records.get(name)??null},
 setItem:(name:string,value:string)=>{if(blocked)throw new Error('blocked');records.set(name,value)},
 removeItem:(name:string)=>records.delete(name),
}}});

test('next step follows the checklist, including undo and all done',()=>{
 assert.equal(getPlanProgress(plan,[]).nextStep?.id,plan[0].id);
 const first=getPlanProgress(plan,[plan[0].id]);
 assert.equal(first.count,1);assert.equal(first.nextStep?.id,plan[1].id);
 const outOfOrder=getPlanProgress(plan,[plan[0].id,plan[2].id,plan[2].id,'unrelated']);
 assert.equal(outOfOrder.count,2);assert.equal(outOfOrder.nextStep?.id,plan[1].id);
 const done=getPlanProgress(plan,plan.map(step=>step.id));
 assert.equal(done.percent,100);assert.equal(done.nextStep,null);assert.equal(done.count,plan.length);
 const undone=getPlanProgress(plan,done.completed.filter(id=>id!==plan[1].id));
 assert.equal(undone.nextStep?.id,plan[1].id);assert.ok(undone.percent<100);
});

test('old saved cases migrate without losing answers or drafts',()=>{
 records.clear();const bank=buildDraft('bank',answers);
 records.set(key,JSON.stringify({id:'old-case',answers,documents:{bank},focusStep:plan[0].id,updatedAt:'2026-10-07T18:00:00.000Z'}));
 const restored=loadLocalCase()!;
 assert.deepEqual(restored.completedSteps,[]);assert.deepEqual(restored.answers,answers);assert.equal(restored.documents.bank,bank);
 saveLocalCase({...restored,completedSteps:[plan[0].id]});
 assert.equal(loadLocalCase()!.documents.bank,bank);assert.deepEqual(loadLocalCase()!.completedSteps,[plan[0].id]);
});

test('marks persist, can be removed, and survive document edits',()=>{
 records.clear();
 saveLocalCase({answers,documents:{bank:'Черновик'},focusStep:plan[0].id,completedSteps:[plan[0].id,plan[2].id]});
 const restored=loadLocalCase()!;
 assert.deepEqual(restored.completedSteps,[plan[0].id,plan[2].id]);
 saveLocalCase({...restored,documents:{bank:'Изменённый черновик'}});
 assert.deepEqual(loadLocalCase()!.completedSteps,restored.completedSteps);
 saveLocalCase({...loadLocalCase()!,completedSteps:[plan[2].id]});
 assert.deepEqual(loadLocalCase()!.completedSteps,[plan[2].id]);
});

test('edited answers keep only marks applicable to the regenerated plan',()=>{
 const completed=['security','evidence','debt','restore'];
 const edited={...answers,risk:'no',already:['evidence']};
 saveLocalCase({answers:edited,documents:{bank:'Сохранённый текст'},focusStep:null,completedSteps:completed});
 assert.deepEqual(loadLocalCase()!.completedSteps,['evidence','restore']);
 assert.equal(loadLocalCase()!.documents.bank,'Сохранённый текст');
});

test('invalid progress cannot overwrite a valid record',()=>{
 const prior=JSON.stringify([...records]);
 assert.throws(()=>saveLocalCase({answers,documents:{},focusStep:null,completedSteps:['made-up-step']}));
 assert.equal(JSON.stringify([...records]),prior);
 blocked=true;
 assert.throws(()=>saveLocalCase({answers,documents:{},focusStep:null,completedSteps:[plan[0].id]}),/запрещает хранение/);
 assert.equal(JSON.stringify([...records]),prior);blocked=false;
 removeLocalCase();assert.equal(loadLocalCase(),null);
});

test('unfinished intake resumes at the saved question without a complete plan',()=>{
 records.clear();
 assert.equal(hasCaseAnswers(emptyAnswers),false);
 const partial={...emptyAnswers,risk:'yes',timing:'today',notes:'Начал описание'};
 assert.equal(hasCaseAnswers(partial),true);assert.equal(isIntakeComplete(partial),false);
 const first=saveLocalCase({answers:partial,documents:{},focusStep:null,questionnaireStep:1,intakeFurthest:3,role:'helper'});
 const loaded=loadLocalCase()!;
 assert.equal(loaded.questionnaireStep,1);assert.equal(loaded.role,'helper');assert.deepEqual(loaded.answers,partial);
 assert.equal(loaded.intakeFurthest,3);
 const next=saveLocalCase({...loaded,answers,questionnaireStep:4});
 assert.equal(next.id,first.id);assert.equal(isIntakeComplete(next.answers),true);
});

test('call notes and an intentionally emptied draft survive autosave updates',()=>{
 const call={bankId:'tbank',reference:'123-456',date:'2026-10-17',nextAction:'Передать заявление через приложение'};
 saveLocalCase({answers,documents:{bank:''},focusStep:'bank',bankCall:call});
 const before=loadLocalCase()!;
 assert.deepEqual(before.bankCall,call);assert.equal(before.documents.bank,'');
 saveLocalCase({...before,completedSteps:['bank']});
 assert.equal(loadLocalCase()!.id,before.id);assert.deepEqual(loadLocalCase()!.bankCall,call);
 removeLocalCase();assert.equal(loadLocalCase(),null);
});

test('the call script preserves consent facts and contacts use explicit tel targets',()=>{
 assert.match(bankScript({...answers,kind:'card'}),/без моего согласия/);
 assert.match(bankScript({...answers,kind:'transfer'}),/сделан мной под влиянием обмана/);
 assert.match(bankScript({...answers,credit:'unauthorized'}),/кредит, который я не оформлял/);
 assert.doesNotMatch(bankScript({...answers,kind:'other'}),/сделан мной/);
 assert.match(bankScript({...answers,kind:'investment'}),/Пока неясно, как именно/);
 assert.equal(banks.length,5);assert.ok(banks.every(b=>/^\+?\d+$/.test(b.tel)&&b.url.startsWith('https://')));
});
