import test,{beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {emptyAnswers,generatePlan,buildDraft,initiallyCompleted,isIntakeComplete,type Answers} from '../lib/bereg.ts';
import {replaceDraft,syncDraftVersions,draftNeedsReview,acknowledgeDraft} from '../lib/draft-versions.ts';
import {loadLocalCase,loadLocalCases,saveLocalCase,createLocalCase,activateLocalCase,removeLocalCase,exportStoredData} from '../lib/local-case.ts';
import {bankScript,emptyBankCall} from '../lib/bank-help.ts';
import {getPlanProgress} from '../lib/plan-progress.ts';
const records=new Map<string,string>();let blocked=false,quota=false;
Object.assign(globalThis,{window:{location:{href:'https://beregryadom.ru/'},localStorage:{getItem:(k:string)=>{if(blocked)throw Error();return records.get(k)??null},setItem:(k:string,v:string)=>{if(blocked||quota)throw Error();records.set(k,v)},removeItem:(k:string)=>records.delete(k)}}});
const a:Answers={...emptyAnswers,risk:'yes',kind:'transfer',money:'own',impact:'savings',notes:'Вымышленный перевод после звонка'};
const legacy='bereg:case:v1:/',current='bereg:cases:v2:/';
beforeEach(()=>{records.clear();blocked=false;quota=false});
test('both drafts survive changed mechanism, risk and description; stale state and history persist across reload',()=>{
 for(const type of ['bank','police'] as const){
  const initial=replaceDraft(type,{}, {},a);initial.documents[type]='Моя правка. '+initial.documents[type];
  const updated={...a,kind:'card',risk:'no',notes:'Иное описание: списание без участия'};
  const versions=syncDraftVersions(initial.documents,initial.documentVersions,updated);
  assert.equal(draftNeedsReview(type,versions,updated),true);
  saveLocalCase({answers:updated,documents:initial.documents,documentVersions:versions,focusStep:null});
  const loaded=loadLocalCase()!;assert.equal(loaded.documents[type],initial.documents[type]);assert.equal(draftNeedsReview(type,loaded.documentVersions!,updated),true);
  const renewed=replaceDraft(type,loaded.documents,loaded.documentVersions!,updated);
  assert.match(renewed.documents[type],/без моего согласия/);assert.ok(renewed.documents[type].includes(updated.notes));assert.doesNotMatch(renewed.documents[type],/сделан мной под влиянием/);
  assert.equal(renewed.documentVersions[type]!.history[0].text,initial.documents[type]);
  saveLocalCase({...loaded,...renewed});assert.equal(loadLocalCase()!.documentVersions![type]!.history[0].text,initial.documents[type]);
  const kept=acknowledgeDraft(type,versions,updated);assert.equal(draftNeedsReview(type,kept,updated),false);assert.equal(initial.documents[type].startsWith('Моя правка.'),true);
  for(const changed of [{...a,kind:'card'},{...a,risk:'no'},{...a,notes:'Другая история'}])assert.equal(draftNeedsReview(type,syncDraftVersions(initial.documents,initial.documentVersions,changed),changed),true);
 }
});
test('legacy record migrates without mutating its bytes or losing text, identity, notes or progress',()=>{
 const old={id:'legacy-1',updatedAt:'2026-10-17T10:00:00.000Z',answers:{...a,kind:'investment',timing:'week',amount:'under50',mood:'anxious',support:'yes',already:['police','evidence']},documents:{bank:'Старый отредактированный текст',police:''},completedSteps:['restore'],focusStep:null,bankCall:{...emptyBankCall,bankId:'tbank',reference:'TEST-41',nextAction:'Вымышленная заметка'}};
 const raw=JSON.stringify(old);records.set(legacy,raw);const loaded=loadLocalCase()!;
 assert.equal(records.get(legacy),raw);assert.equal(records.has(current),false);assert.equal(loaded.id,old.id);assert.deepEqual(loaded.answers,old.answers);assert.deepEqual(loaded.documents,old.documents);assert.equal(loaded.bankCall!.reference,'TEST-41');
 assert.deepEqual(new Set(loaded.completedSteps),new Set(['police','evidence','restore']));assert.equal(loaded.documentVersions!.bank!.needsReview,true);
 saveLocalCase(loaded);assert.equal(records.get(legacy),raw);assert.equal(loadLocalCase()!.documents.bank,old.documents.bank);
});
test('own and helper cases keep separate answers, documents, notes, goal flags and task completion',()=>{
 const self=saveLocalCase({answers:a,documents:{bank:'Собственный текст'},focusStep:null,completedSteps:['bank'],bankCall:{...emptyBankCall,reference:'SELF'},role:'self',goalProgress:{onboardingStarted:true,planReceived:true}});
 const helper=createLocalCase('helper');assert.notEqual(helper.id,self.id);assert.deepEqual(helper.answers,emptyAnswers);assert.deepEqual(helper.documents,{});assert.deepEqual(helper.completedSteps,[]);assert.equal(helper.goalProgress,undefined);
 saveLocalCase({...helper,answers:{...a,kind:'card'},documents:{police:'Текст близкого'},bankCall:{...emptyBankCall,reference:'HELPER'}});
 const restored=activateLocalCase(self.id);assert.equal(restored.documents.bank,'Собственный текст');assert.equal(restored.bankCall!.reference,'SELF');assert.deepEqual(restored.completedSteps,['bank']);assert.equal(restored.role,'self');assert.equal(loadLocalCases().length,2);
 removeLocalCase(helper.id);assert.equal(loadLocalCases().length,1);assert.equal(loadLocalCase()!.id,self.id);
});
test('damaged storage and blocked reads cannot be overwritten, and quota errors retain the prior version',()=>{
 records.set(legacy,'{broken');const before=exportStoredData();assert.throws(()=>loadLocalCase(),/не удалены/);assert.throws(()=>saveLocalCase({answers:a,documents:{},focusStep:null}));assert.equal(exportStoredData(),before);
 records.clear();saveLocalCase({answers:a,documents:{bank:'Сохранить'},focusStep:null});const good=records.get(current);quota=true;assert.throws(()=>saveLocalCase({answers:{...a,notes:'Новая правка'},documents:{},focusStep:null}),/Не удалось сохранить/);assert.equal(records.get(current),good);quota=false;
 blocked=true;assert.throws(()=>loadLocalCase(),/запрещает/);assert.throws(()=>saveLocalCase({answers:a,documents:{},focusStep:null}));blocked=false;assert.equal(records.get(current),good);
 records.set(current,'not json');assert.throws(()=>saveLocalCase({answers:a,documents:{},focusStep:null}));assert.equal(records.get(current),'not json');
});
test('deleting a migrated test case does not resurrect its legacy version',()=>{
 records.set(legacy,JSON.stringify({id:'test-delete',updatedAt:'2026-10-17T10:00:00.000Z',answers:a,documents:{bank:'Тестовый документ'},focusStep:null}));
 const loaded=loadLocalCase()!;saveLocalCase(loaded);removeLocalCase(loaded.id);assert.equal(loadLocalCase(),null);assert.equal(records.has(legacy),false);
});
test('repeat bank call uses reference when present and supports a call without a reference',()=>{
 const repeat={...a,already:['bank']};assert.match(bankScript(repeat,{...emptyBankCall,reference:'TEST-123'}),/TEST-123/);assert.match(bankScript(repeat),/Номер обращения пока неизвестен/);assert.doesNotMatch(bankScript(repeat),/Прошу зарегистрировать сообщение/);
});
test('scenario matrix keeps instructions accessible, separates credit facts and never puts emotional help first',()=>{
 for(const risk of ['yes','no','unsure'])for(const kind of ['transfer','card','other'])for(const money of ['own','borrowed','both'])for(const impact of ['savings','living','debt'])for(const context of ['general','investment','earnings']){
  const answers={...a,risk,kind,money,impact,context,credit:money==='own'?'':'deceived',mood:'overwhelmed',already:['bank','police','evidence']};const plan=generatePlan(answers);const ids=plan.map(s=>s.id);
  assert.equal(new Set(ids).size,ids.length);assert.ok(ids.includes('police')&&ids.includes('evidence')&&ids.includes('bankReply'));assert.notEqual(plan[0].id,'support');assert.equal(ids.includes('security'),risk!=='no');assert.equal(ids.includes('investment'),context!=='general');assert.equal(ids.includes('debt'),money!=='own'||impact==='debt');
  const progress=getPlanProgress(plan,initiallyCompleted(answers));assert.ok(progress.completed.includes('police'));assert.ok(!progress.completed.includes('bankReply'));assert.equal(isIntakeComplete(answers),true);
 }
 assert.match(generatePlan({...a,money:'borrowed',credit:'unauthorized'}).find(s=>s.id==='debt')!.actions[0],/не подавали заявку/);
 assert.match(generatePlan({...a,money:'borrowed',credit:'deceived'}).find(s=>s.id==='debt')!.actions[0],/не отменяет обязательства/);
 assert.match(buildDraft('bank',{...a,kind:'other'}),/требует уточнения/);
});
