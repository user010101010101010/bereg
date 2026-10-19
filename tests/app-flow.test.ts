import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as bereg from '../lib/bereg.ts';
import * as storage from '../lib/local-case.ts';
import * as drafts from '../lib/draft-versions.ts';
import * as bank from '../lib/bank-help.ts';
import * as goals from '../lib/case-goals.ts';
import * as analytics from '../lib/site-analytics.ts';
import * as planProgress from '../lib/plan-progress.ts';
import * as search from '../lib/article-search.ts';
import * as shore from '../lib/shore-practice.ts';

// Executes the real app handlers and effects with in-memory browser storage.
// This is a controller regression test, not a browser or layout test.
function app(records=new Map<string,string>(),initialUrl='https://beregryadom.ru/'){
 let cursor=0,dirty=false;const hooks:any[]=[];let pending:(()=>void)[]=[];let tree:any;let timerId=0;
 const timers=new Map<number,{callback:()=>void;delay:number}>();const calls:unknown[][]=[];let clipboardBlocked=false,storageFailed=false;const copied:string[]=[];
 const timer=(callback:()=>void,delay:number)=>{timers.set(++timerId,{callback,delay});return timerId};
 const location={href:initialUrl,get search(){return new URL(this.href).search}};
 const listeners=new Map<string,()=>void>();
 const dataLayer:{event:string}[]=[];const pixelViews:Record<string,unknown>[]=[];
 const scrollPosition={left:0,top:0};
 const window={location,dataLayer,_tmr:pixelViews,localStorage:{getItem:(k:string)=>records.get(k)??null,setItem:(k:string,v:string)=>{if(storageFailed)throw new Error('quota');records.set(k,v)},removeItem:(k:string)=>records.delete(k)},history:{pushState:(_a:unknown,_b:string,url:string)=>{location.href=new URL(url,location.href).href}},get scrollX(){return scrollPosition.left},get scrollY(){return scrollPosition.top},scrollTo(value:{top?:number;left?:number}){if(value.top!==undefined)scrollPosition.top=value.top;if(value.left!==undefined)scrollPosition.left=value.left},innerHeight:800,setTimeout:timer,clearTimeout:(id:number)=>timers.delete(id),addEventListener:(name:string,callback:()=>void)=>listeners.set(name,callback),removeEventListener:(name:string)=>listeners.delete(name),ym:(...args:unknown[])=>calls.push(args)};
 Object.assign(globalThis,{window});
 const document={title:'',visibilityState:'visible',documentElement:{style:{setProperty(){}}},querySelector:()=>null,addEventListener(){},removeEventListener(){},createElement:()=>({click(){}})};
 Object.defineProperty(window,'scrollY',{get:()=>scrollPosition.top});
 Object.assign(window,{requestAnimationFrame:(callback:()=>void)=>timer(callback,0),cancelAnimationFrame:(id:number)=>timers.delete(id)});
 const stub=(name:string)=>Object.assign(function Component(){},{displayName:name});
 const React={Fragment:'fragment',createElement:(type:any,props:any,...children:any[])=>({type,props:{...props,children}}),
  useState:(initial:any)=>{const i=cursor++;if(!(i in hooks))hooks[i]=typeof initial==='function'?initial():initial;return [hooks[i],(value:any)=>{const next=typeof value==='function'?value(hooks[i]):value;if(!Object.is(next,hooks[i])){hooks[i]=next;dirty=true}}]},
  useRef:(value:any)=>{const i=cursor++;if(!(i in hooks))hooks[i]={current:value};return hooks[i]},
  useMemo:(factory:()=>unknown)=>{cursor++;return factory()},
  useEffect:(callback:()=>void|(()=>void),deps:unknown[])=>{const i=cursor++;const previous=hooks[i];if(!previous||deps.some((v,j)=>!Object.is(v,previous.deps[j]))){pending.push(()=>{previous?.cleanup?.();hooks[i]={deps,cleanup:callback()}})}},
 };
 const modules:Record<string,unknown>={'react':React,'@/lib/bereg':bereg,'@/lib/local-case':storage,'@/lib/plan-progress':planProgress,'@/lib/case-goals':goals,'@/lib/site-analytics':analytics,'@/lib/bank-help':bank,'@/lib/draft-versions':drafts,'@/lib/article-search':search,'@/lib/shore-practice':shore};
 const require=(name:string)=>{if(name in modules)return modules[name];if(name.includes('photo-credits'))return {default:[]};return new Proxy({},{get:(_target,key)=>key==='__esModule'?true:key==='canAdvance'?(a:bereg.Answers,i:number)=>i===0?!!a.risk:i===1?!!a.kind&&!!a.money:i===2?!!a.impact:true:stub(String(key))})};
 const exports:any={};const source=readFileSync(new URL('../app/bereg-app.tsx',import.meta.url),'utf8');
 const js=ts.transpileModule('import * as __BeregReact from "react";\n'+source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React,jsxFactory:'__BeregReact.createElement',jsxFragmentFactory:'__BeregReact.Fragment'}}).outputText;
 vm.runInNewContext(js,{exports,require,window,document,URL,URLSearchParams,crypto,AbortController,Blob,Error,setTimeout:timer,clearTimeout:window.clearTimeout,navigator:{clipboard:{writeText:async(value:string)=>{if(clipboardBlocked)throw new Error('denied');copied.push(value)}}}});
 function render(){for(let n=0;n<30;n++){dirty=false;cursor=0;pending=[];tree=exports.default();const effects=pending;pending=[];effects.forEach(effect=>effect());if(!dirty)return}throw Error('App did not settle')}
 const name=(element:any)=>typeof element?.type==='string'?element.type:element?.type?.displayName||element?.type?.name;
 function nodes(element=tree):any[]{if(!element||typeof element!=='object')return [];if(Array.isArray(element))return element.flatMap(item=>nodes(item));if(name(element)==='Dialog'&&element.props.open===false)return [element];return [element,...nodes(element.props?.children)]}
 const text=(element:any):string=>Array.isArray(element)?element.map(text).join(''):typeof element==='string'||typeof element==='number'?String(element):element?.props?text(element.props.children):'';
 const find=(type:string)=>{const found=nodes().find(element=>name(element)===type);assert.ok(found,'Missing component '+type);return found.props};
 function click(label:string){const button=nodes().find(element=>name(element)==='button'&&text(element).trim()===label);assert.ok(button,'Missing button '+label);button.props.onClick();render()}
 function flush(){for(const [id,value] of [...timers])if(value.delay<=200){timers.delete(id);value.callback()}render()}
 const navigate=(view:string)=>{find('SiteHeader').onNavigate(view);render()};
 render();return {has:(type:string)=>nodes().some(element=>name(element)===type),nodeList:()=>nodes(),setScroll:(top:number,left=0)=>{scrollPosition.top=top;scrollPosition.left=left},getScroll:()=>({...scrollPosition}),find,click,render,flush,navigate,records,calls,dataLayer,pixelViews,listeners,copied,failStorage:(value:boolean)=>{storageFailed=value},blockClipboard:()=>{clipboardBlocked=true},visibleText:()=>text(tree)};
}
const complete={...bereg.emptyAnswers,risk:'yes',kind:'transfer',money:'own',impact:'savings',notes:'Вымышленная история для регрессии'};
function finish(h:ReturnType<typeof app>){h.click('Составить план действий');h.find('CaseIntake').onChange(complete);h.render();h.find('CaseIntake').onPlan();h.render();h.flush()}
test('how-to page preserves a partial questionnaire, its stage and scroll; reload offers a safe return',()=>{
 const h=app();h.click('Составить план действий');h.find('CaseIntake').onChange({...complete,kind:'',impact:''});h.render();h.find('CaseIntake').onStage(1);h.render();h.flush();h.setScroll(470);
 const before=storage.loadLocalCase()!;h.click('Как пользоваться');h.flush();assert.equal(h.find('SiteHeader').view,'how');assert.equal(h.find('HowToPage').primaryLabel,'Вернуться к опросу');assert.ok(String(h.pixelViews.at(-1)?.url).endsWith('?view=how&returnTo=intake'));
 h.find('HowToPage').onPrimary();h.render();h.flush();assert.equal(h.find('CaseIntake').stage,1);assert.deepEqual(h.find('CaseIntake').answers,before.answers);assert.equal(h.getScroll().top,470);
 h.click('Как пользоваться');h.flush();const resumed=app(h.records,'https://beregryadom.ru/?view=how&returnTo=intake');resumed.flush();assert.equal(resumed.find('HowToPage').primaryLabel,'Вернуться к опросу');resumed.find('HowToPage').onPrimary();resumed.render();resumed.flush();assert.equal(resumed.find('CaseIntake').stage,1);assert.deepEqual(storage.loadLocalCase()!.answers,before.answers);
});
test('plan, checked steps, edited draft, bank notes and practice status survive how-to navigation and reload',()=>{
 const h=app();finish(h);const first=h.find('StepChecklist').plan[0];h.find('StepChecklist').onToggle(first.id,true);h.render();h.find('ShorePracticeOffer').onCollapse();h.render();
 h.navigate('case');h.find('CaseDashboard').onDraft('bank');h.render();h.find('DraftEditor').onChange('ТЕСТ: отредактированный текст, не отправлять');h.render();h.find('DraftEditor').onClose();h.render();
 h.find('CaseDashboard').onOpenStep(bereg.generatePlan(complete).find(s=>s.id==='bank'));h.render();h.find('BankSupport').onChange({...bank.emptyBankCall,reference:'TEST-HOW-17',nextAction:'Только тестовая заметка'});h.render();
 h.navigate('plan');h.flush();const before=storage.loadLocalCase()!;h.setScroll(640);h.click('Как пользоваться');h.flush();assert.equal(h.find('HowToPage').primaryLabel,'Вернуться к плану');assert.equal(h.find('HowToPage').onBack,undefined);h.find('HowToPage').onPrimary();h.render();h.flush();assert.equal(h.find('SiteHeader').view,'plan');assert.equal(h.getScroll().top,640);
 for(const key of ['answers','documents','documentVersions','completedSteps','bankCall','shorePractice'] as const)assert.deepEqual(storage.loadLocalCase()![key],before[key]);
 h.click('Как пользоваться');h.flush();const resumed=app(h.records,'https://beregryadom.ru/?view=how&returnTo=plan');resumed.flush();resumed.find('HowToPage').onPrimary();resumed.render();resumed.flush();assert.equal(resumed.find('SiteHeader').view,'plan');assert.deepEqual(resumed.dataLayer,[]);assert.equal(storage.loadLocalCase()!.documents.bank,before.documents.bank);
});
test('how-to is voluntary, available directly and in the footer, and its entry actions do not invent a case',()=>{
 const h=app(undefined,'https://beregryadom.ru/?view=how&returnTo=https://invalid.example');h.flush();assert.equal(h.find('SiteHeader').view,'how');assert.equal(h.find('HowToPage').backLabel,undefined);assert.equal(h.find('HowToPage').primaryLabel,'Составить план действий');assert.equal(storage.loadLocalCase(),null);
 h.find('HowToPage').onMaterials();h.render();assert.equal(h.find('SiteHeader').view,'materials');h.find('SiteFooter').onNavigate('how');h.render();h.find('HowToPage').onHelper();h.render();assert.equal(h.find('SiteHeader').view,'helper');assert.equal(storage.loadLocalCase(),null);
 h.find('SiteFooter').onNavigate('how');h.render();assert.equal(h.find('HowToPage').onSupport,undefined);assert.equal(h.find('HowToPage').onPractice,undefined);assert.equal(storage.loadLocalCase(),null);
 h.find('HowToPage').onPrimary();h.render();assert.equal(h.find('SiteHeader').view,'intake');assert.equal(storage.loadLocalCase(),null);
});
test('shore offer appears only in the finished plan; security stays first; declining survives reload without blocking work',()=>{
 const h=app();assert.equal(h.has('ShorePracticeOffer'),false);assert.equal(h.has('ShorePracticeSession'),false);
 h.click('Составить план действий');h.find('CaseIntake').onChange({...complete,mood:'overwhelmed'});h.render();h.flush();assert.equal(h.has('ShorePracticeOffer'),false);
 h.find('CaseIntake').onPlan();h.render();h.flush();assert.equal(h.find('SiteHeader').view,'plan');assert.equal(h.has('ShorePracticeSession'),false);assert.equal(h.find('ShorePracticeOffer').prominent,true);
 const nodes=h.nodeList();assert.ok(nodes.findIndex(n=>n.props?.className==='next-step lime')<nodes.findIndex(n=>n.type?.displayName==='ShorePracticeOffer'));
 assert.equal(storage.loadLocalCase()!.shorePractice,'shown');const before=storage.loadLocalCase()!;
 h.find('ShorePracticeOffer').onCollapse();h.render();h.flush();assert.equal(storage.loadLocalCase()!.shorePractice,'collapsed');assert.deepEqual(storage.loadLocalCase()!.completedSteps,before.completedSteps);
 const resumed=app(h.records);resumed.click('Продолжить план действий');assert.equal(resumed.find('ShorePracticeOffer').status,'collapsed');assert.equal(resumed.has('ShorePracticeSession'),false);assert.ok(resumed.has('StepChecklist'));
 resumed.find('ShorePracticeOffer').onOpen();resumed.render();assert.equal(resumed.has('ShorePracticeSession'),true);resumed.find('Dialog').onOpenChange(false);resumed.render();resumed.flush();assert.equal(storage.loadLocalCase()!.shorePractice,'collapsed');
});
test('shore completion preserves the exact plan, drafts, funnel events and return position; support remains available',()=>{
 const h=app();finish(h);const list=h.nodeList();assert.ok(list.findIndex(n=>n.type?.displayName==='StepChecklist')<list.findIndex(n=>n.type?.displayName==='ShorePracticeOffer'));
 h.navigate('case');h.find('CaseDashboard').onDraft('bank');h.render();h.find('DraftEditor').onChange('Закрытый тестовый черновик');h.render();h.flush();h.find('DraftEditor').onClose();h.render();h.navigate('plan');
 const before=storage.loadLocalCase()!,events=JSON.stringify([h.calls,h.dataLayer]);h.setScroll(620,4);h.find('ShorePracticeOffer').onOpen();h.render();assert.equal(h.find('SiteHeader').view,'plan');
 const restore=h.find('DialogContent').onCloseAutoFocus;assert.equal(h.find('ShorePracticeSession').returnLabel,'Вернуться к плану');h.find('ShorePracticeSession').onComplete();h.render();h.flush();
 const after=storage.loadLocalCase()!;assert.equal(after.shorePractice,'completed');assert.deepEqual(after.answers,before.answers);assert.deepEqual(after.documents,before.documents);assert.deepEqual(after.completedSteps,before.completedSteps);assert.equal(JSON.stringify([h.calls,h.dataLayer]),events);
 h.find('ShorePracticeSession').onSupport();h.render();assert.equal(h.has('ShorePracticeSession'),false);assert.match(h.visibleText(),/Психологическая помощь МЧС/);h.find('Dialog').onOpenChange(false);h.render();h.setScroll(0);restore();assert.deepEqual(h.getScroll(),{left:4,top:620});
 h.find('ShorePracticeOffer').onOpen();h.render();h.find('ShorePracticeSession').onClose();h.render();h.flush();assert.equal(storage.loadLocalCase()!.shorePractice,'completed');
});
test('practice is manually accessible in support before intake without creating a case, and each new case has its own offer',()=>{
 const h=app();h.find('SiteHeader').onSupport();h.render();h.click('Открыть практику «Найти берег»');assert.equal(h.has('ShorePracticeSession'),true);h.find('ShorePracticeSession').onComplete();h.render();h.find('ShorePracticeSession').onClose();h.render();h.flush();assert.equal(storage.loadLocalCase(),null);
 finish(h);h.find('ShorePracticeOffer').onCollapse();h.render();h.flush();const self=storage.loadLocalCase()!;
 h.navigate('home');h.click('Помогаю близкому');h.click('Пройти опрос вместе');h.click('Создать отдельный случай для близкого');h.flush();assert.equal(storage.loadLocalCase()!.shorePractice,undefined);
 h.find('CaseIntake').onChange(complete);h.render();h.find('CaseIntake').onPlan();h.render();h.flush();assert.equal(storage.loadLocalCase()!.shorePractice,'shown');assert.equal(storage.loadLocalCases().find(c=>c.id===self.id)!.shorePractice,'collapsed');
});
test('failed practice-status persistence leaves previous data intact and retry saves the current choice',()=>{
 const h=app();finish(h);const before=storage.loadLocalCase()!;h.failStorage(true);h.find('ShorePracticeOffer').onCollapse();h.render();h.flush();assert.equal(storage.loadLocalCase()!.shorePractice,'shown');assert.equal(h.find('ShorePracticeOffer').status,'collapsed');assert.match(h.visibleText(),/Не удалось сохранить/);
 h.failStorage(false);h.click('Проверить сохранение снова');h.flush();assert.equal(storage.loadLocalCase()!.shorePractice,'collapsed');assert.deepEqual(storage.loadLocalCase()!.answers,before.answers);
});
test('removed secondary scenarios have no home entries and old URLs safely open home',()=>{
 for(const view of ['check','protect']){const h=app(undefined,'https://beregryadom.ru/?view='+view);assert.equal(h.find('SiteHeader').view,'home');assert.doesNotMatch(h.visibleText(),/Хочу разобраться в подозрительной ситуации|Восстановление и защита|Посмотреть ориентиры/)}
 const source=readFileSync(new URL('../app/bereg-app.tsx',import.meta.url),'utf8');assert.doesNotMatch(source,/secondary-entries|view==='check'|view==='protect'|checkedSigns|signsResult/);
});
test('next-action artwork follows the current step and saved completion after reload',()=>{
 const h=app();finish(h);const first=h.find('StepChecklist').plan[0];assert.equal(h.find('StepArtwork').stepId,first.id);
 h.find('StepChecklist').onToggle(first.id,true);h.render();h.flush();const next=h.find('StepArtwork').stepId;assert.notEqual(next,first.id);
 const resumed=app(h.records);resumed.click('Продолжить план действий');assert.equal(resumed.find('StepArtwork').stepId,next);assert.deepEqual(resumed.dataLayer,[]);
});
test('real app: pixel tracks route transitions once and shares the existing anonymous funnel lifecycle',()=>{
 const h=app();assert.equal(h.pixelViews.length,0); // HTML already counts the initial page.
 h.navigate('about');assert.equal(h.pixelViews.length,1);assert.equal(h.pixelViews[0].url,'https://beregryadom.ru/?view=about');assert.equal(h.pixelViews[0].referrer,'https://beregryadom.ru/');
 h.render();h.navigate('about');assert.equal(h.pixelViews.length,1);assert.deepEqual(h.dataLayer,[]);
 h.navigate('home');finish(h);assert.deepEqual(h.dataLayer,[{event:'onboarding_start'},{event:'plan_received'}]);
 const step=h.find('StepChecklist').plan[0];h.find('StepChecklist').onToggle(step.id,true);h.render();h.find('StepChecklist').onToggle(step.id,true);h.render();h.find('StepChecklist').onToggle(step.id,false);h.render();
 assert.deepEqual(h.dataLayer,[{event:'onboarding_start'},{event:'plan_received'},{event:'plan_step_done'}]);
 h.navigate('case');h.find('CaseDashboard').onDraft('bank');h.render();const before=h.pixelViews.length;h.find('DraftEditor').onChange('Вымышленный закрытый текст');h.render();assert.equal(h.pixelViews.length,before);
 assert.doesNotMatch(JSON.stringify([h.dataLayer,h.pixelViews]),/Вымышленная история|Вымышленный закрытый текст|notes|documents|userid|pid/);h.flush();
 const resumed=app(h.records);resumed.click('Продолжить план действий');assert.deepEqual(resumed.dataLayer,[]);
});
test('real app: incomplete intake resumes, plan counts only on explicit completion, drafts become stale after facts change',()=>{
 const h=app();h.click('Составить план действий');h.find('CaseIntake').onChange(complete);h.render();h.flush();assert.equal(storage.loadLocalCase()!.intakeCompleted,false);assert.equal(h.calls.some(call=>call[2]==='plan_received'),false);
 const resumed=app(h.records);resumed.click('Продолжить опрос');assert.equal(resumed.find('CaseIntake').answers.notes,complete.notes);resumed.find('CaseIntake').onPlan();resumed.render();resumed.flush();assert.equal(storage.loadLocalCase()!.intakeCompleted,true);assert.equal(resumed.calls.filter(call=>call[2]==='plan_received').length,1);
 resumed.navigate('case');resumed.find('CaseDashboard').onDraft('bank');resumed.render();resumed.find('DraftEditor').onChange('Мой отредактированный текст');resumed.render();resumed.flush();resumed.find('DraftEditor').onClose();resumed.render();resumed.find('CaseDashboard').onResume();resumed.render();resumed.click('Изменить ответы');resumed.find('CaseIntake').onChange({...complete,kind:'card',notes:'Новая вымышленная история'});resumed.render();resumed.flush();
 const value=storage.loadLocalCase()!;assert.equal(value.documents.bank,'Мой отредактированный текст');assert.equal(drafts.draftNeedsReview('bank',value.documentVersions!,value.answers),true);
 const after=app(h.records);after.navigate('case');after.find('CaseDashboard').onDraft('bank');after.render();after.find('DraftEditor').onNew();after.render();after.flush();const renewed=storage.loadLocalCase()!;assert.match(renewed.documents.bank,/без моего согласия/);assert.equal(renewed.documentVersions!.bank!.history[0].text,'Мой отредактированный текст');
 assert.doesNotMatch(JSON.stringify([...h.calls,...resumed.calls,...after.calls]),/Вымышленная история|Мой отредактированный текст|Новая вымышленная история/);
});
test('real app: clipboard reports actual success or denied access with manual selection fallback',async()=>{
 const h=app();finish(h);h.navigate('case');h.find('CaseDashboard').onDraft('bank');h.render();await h.find('DraftEditor').onCopy('Вымышленный текст');h.render();assert.deepEqual(h.copied,['Вымышленный текст']);assert.match(h.visibleText(),/Текст скопирован/);h.blockClipboard();await h.find('DraftEditor').onCopy('Не скопируется');h.render();assert.equal(h.copied.length,1);assert.match(h.visibleText(),/Можно выделить текст вручную/);
});
test('real app: retry after quota failure saves current edits instead of restoring an older record',()=>{
 const h=app();finish(h);h.click('Изменить ответы');h.find('CaseIntake').onChange({...complete,notes:'Новая несохранённая правка'});h.render();h.failStorage(true);h.flush();assert.match(h.visibleText(),/Не удалось сохранить изменения/);assert.equal(storage.loadLocalCase()!.answers.notes,complete.notes);h.failStorage(false);h.click('Проверить сохранение снова');h.flush();assert.equal(storage.loadLocalCase()!.answers.notes,'Новая несохранённая правка');assert.equal(h.find('CaseIntake').answers.notes,'Новая несохранённая правка');
});
test('real app: damaged record remains byte-for-byte intact when continuing without storage',()=>{
 const records=new Map([['bereg:case:v1:/','{damaged-test-record']]);const h=app(records);assert.match(h.visibleText(),/не удалены и не перезаписаны/);h.click('Продолжить без сохранения');finish(h);assert.equal(records.get('bereg:case:v1:/'),'{damaged-test-record');assert.equal(records.has('bereg:cases:v2:/'),false);assert.match(h.visibleText(),/Не сохраняется: скачайте результат/);
});
test('real app: helper entry requires a choice; cancel/resume preserves self; new case stays separate; deletion has cancel',()=>{
 const h=app();finish(h);const self=storage.loadLocalCase()!;
 h.navigate('home');h.click('Помогаю близкому');h.click('Пройти опрос вместе');assert.equal(storage.loadLocalCase()!.role,'self');h.click('Продолжить открытый случай');assert.equal(storage.loadLocalCase()!.id,self.id);
 h.navigate('home');h.click('Помогаю близкому');h.click('Пройти опрос вместе');h.click('Создать отдельный случай для близкого');h.flush();const helper=storage.loadLocalCase()!;assert.notEqual(helper.id,self.id);assert.equal(helper.role,'helper');assert.deepEqual(helper.documents,{});assert.deepEqual(helper.completedSteps,[]);assert.equal(storage.loadLocalCases().length,2);
 h.navigate('case');h.find('CaseDashboard').onDelete();h.render();const before=JSON.stringify([...h.records]);h.click('Отмена');assert.equal(JSON.stringify([...h.records]),before);h.find('CaseDashboard').onDelete();h.render();h.click('Удалить этот случай');h.flush();assert.equal(storage.loadLocalCases().length,1);assert.equal(storage.loadLocalCase()!.id,self.id);assert.equal(storage.loadLocalCase()!.answers.notes,complete.notes);
});
