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
import * as planProgress from '../lib/plan-progress.ts';
import * as search from '../lib/article-search.ts';

// Executes the real app handlers and effects with in-memory browser storage.
// This is a controller regression test, not a browser or layout test.
function app(records=new Map<string,string>()){
 let cursor=0,dirty=false;const hooks:any[]=[];let pending:(()=>void)[]=[];let tree:any;let timerId=0;
 const timers=new Map<number,{callback:()=>void;delay:number}>();const calls:unknown[][]=[];let clipboardBlocked=false,storageFailed=false;const copied:string[]=[];
 const timer=(callback:()=>void,delay:number)=>{timers.set(++timerId,{callback,delay});return timerId};
 const location={href:'https://beregryadom.ru/'};
 const listeners=new Map<string,()=>void>();
 const window={location,localStorage:{getItem:(k:string)=>records.get(k)??null,setItem:(k:string,v:string)=>{if(storageFailed)throw new Error('quota');records.set(k,v)},removeItem:(k:string)=>records.delete(k)},history:{pushState:(_a:unknown,_b:string,url:string)=>{location.href=new URL(url,location.href).href}},scrollTo(){},innerHeight:800,setTimeout:timer,clearTimeout:(id:number)=>timers.delete(id),addEventListener:(name:string,callback:()=>void)=>listeners.set(name,callback),removeEventListener:(name:string)=>listeners.delete(name),ym:(...args:unknown[])=>calls.push(args)};
 Object.assign(globalThis,{window});
 const document={title:'',visibilityState:'visible',documentElement:{style:{setProperty(){}}},addEventListener(){},removeEventListener(){},createElement:()=>({click(){}})};
 const stub=(name:string)=>Object.assign(function Component(){},{displayName:name});
 const React={Fragment:'fragment',createElement:(type:any,props:any,...children:any[])=>({type,props:{...props,children}}),
  useState:(initial:any)=>{const i=cursor++;if(!(i in hooks))hooks[i]=typeof initial==='function'?initial():initial;return [hooks[i],(value:any)=>{const next=typeof value==='function'?value(hooks[i]):value;if(!Object.is(next,hooks[i])){hooks[i]=next;dirty=true}}]},
  useRef:(value:any)=>{const i=cursor++;if(!(i in hooks))hooks[i]={current:value};return hooks[i]},
  useMemo:(factory:()=>unknown)=>{cursor++;return factory()},
  useEffect:(callback:()=>void|(()=>void),deps:unknown[])=>{const i=cursor++;const previous=hooks[i];if(!previous||deps.some((v,j)=>!Object.is(v,previous.deps[j]))){pending.push(()=>{previous?.cleanup?.();hooks[i]={deps,cleanup:callback()}})}},
 };
 const modules:Record<string,unknown>={'react':React,'@/lib/bereg':bereg,'@/lib/local-case':storage,'@/lib/plan-progress':planProgress,'@/lib/case-goals':goals,'@/lib/bank-help':bank,'@/lib/draft-versions':drafts,'@/lib/article-search':search};
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
 render();return {find,click,render,flush,navigate,records,calls,listeners,copied,failStorage:(value:boolean)=>{storageFailed=value},blockClipboard:()=>{clipboardBlocked=true},visibleText:()=>text(tree)};
}
const complete={...bereg.emptyAnswers,risk:'yes',kind:'transfer',money:'own',impact:'savings',notes:'Вымышленная история для регрессии'};
function finish(h:ReturnType<typeof app>){h.click('Составить план действий');h.find('CaseIntake').onChange(complete);h.render();h.find('CaseIntake').onPlan();h.render();h.flush()}
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
