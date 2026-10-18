import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as shore from '../lib/shore-practice.ts';
import {emptyAnswers} from '../lib/bereg.ts';
import {activateLocalCase,createLocalCase,loadLocalCase,loadLocalCases,saveLocalCase} from '../lib/local-case.ts';

// Executes the actual session handlers with a small hook harness, not a browser.
function session(){
 let cursor=0,dirty=false,tree:any;const hooks:any[]=[];let effects:(()=>void)[]=[];
 const calls:{complete:unknown[][];close:unknown[][];support:unknown[][];focus:unknown[]}={complete:[],close:[],support:[],focus:[]};
 const React={Fragment:'fragment',createElement:(type:any,props:any,...children:any[])=>{
  if(props?.['data-shore-prompt']!==undefined&&props.ref)props.ref.current={focus:(options:unknown)=>calls.focus.push(options),scrollIntoView(){}};
  return {type,props:{...props,children}};
 },useReducer:(reducer:any,arg:any,init:any)=>{const i=cursor++;if(!(i in hooks))hooks[i]=init(arg);return [hooks[i],(action:any)=>{hooks[i]=reducer(hooks[i],action);dirty=true}]},
 useRef:(initial:any)=>{const i=cursor++;if(!(i in hooks))hooks[i]={current:initial};return hooks[i]},useId:()=> 'private-shore-test',
 useEffect:(callback:()=>void,deps:unknown[])=>{const i=cursor++;if(!hooks[i]||deps.some((value,j)=>value!==hooks[i][j])){hooks[i]=deps;effects.push(callback)}},
 };
 const primitive=(name:string)=>Object.assign(function Component(){},{displayName:name});const exports:any={};
 const require=(name:string)=>name==='react'?React:name.includes('/lib/shore-practice')?shore:new Proxy({},{get:(_t,key)=>key==='__esModule'?true:primitive(String(key))});
 const source=readFileSync(new URL('../components/shore-practice.tsx',import.meta.url),'utf8');
 const js=ts.transpileModule('import * as __React from "react";\n'+source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React,jsxFactory:'__React.createElement',jsxFragmentFactory:'__React.Fragment'}}).outputText;
 vm.runInNewContext(js,{exports,require});
 const props={onComplete:(...args:unknown[])=>calls.complete.push(args),onClose:(...args:unknown[])=>calls.close.push(args),onSupport:(...args:unknown[])=>calls.support.push(args)};
 function render(){for(let pass=0;pass<10;pass++){cursor=0;dirty=false;effects=[];tree=exports.ShorePracticeSession(props);effects.forEach(effect=>effect());if(!dirty)return}throw Error('Session did not settle')}
 const name=(node:any)=>typeof node?.type==='string'?node.type:node?.type?.displayName||node?.type?.name;
 function nodes(node=tree):any[]{if(!node||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(n=>nodes(n));return [node,...nodes(node.props?.children)]}
 const text=(node:any):string=>Array.isArray(node)?node.map(text).join(''):typeof node==='string'||typeof node==='number'?String(node):node?.props?text(node.props.children):'';
 function click(label:string){const button=nodes().find(node=>name(node)==='button'&&text(node).trim()===label);assert.ok(button,'Missing button: '+label);button.props.onClick();render()}
 const scene=()=>nodes().find(node=>name(node)==='ShoreScene').props;
 const inputs=()=>nodes().filter(node=>name(node)==='input');
 render();return {click,render,calls,scene,inputs,text:()=>text(tree)};
}

test('three manual actions reveal the scene, back retains elements, completion fires once and feedback is optional',()=>{
 const h=session();assert.match(h.text(),/1 из 3/);assert.match(h.text(),/Найдите глазами три предмета/);assert.equal(h.scene().revealed,0);assert.equal(h.calls.complete.length,0);
 h.render();assert.equal(h.scene().revealed,0);h.click('Дальше');assert.match(h.text(),/2 из 3/);assert.equal(h.scene().revealed,1);
 h.click('Дальше');assert.match(h.text(),/3 из 3/);assert.equal(h.scene().revealed,2);h.click('Назад');assert.match(h.text(),/2 из 3/);assert.equal(h.scene().revealed,2);
 h.click('Дальше');h.click('Завершить паузу');assert.match(h.text(),/Как вам сейчас/);assert.equal(h.scene().revealed,3);assert.deepEqual(h.calls.complete,[[]]);
 assert.equal(h.inputs().length,3);assert.ok(h.inputs().every(input=>!input.props.checked&&!input.props.required));
 h.click('Назад');h.click('Завершить паузу');assert.equal(h.calls.complete.length,1);h.click('Вернуться к плану');assert.deepEqual(h.calls.close,[[]]);assert.ok(h.calls.focus.length>=5);
});

test('every instruction can be skipped; the first back action exits; reopening starts a fresh session',()=>{
 for(let step=0;step<3;step++){const h=session();for(let i=0;i<step;i++)h.click('Дальше');h.click('Пропустить практику');assert.deepEqual(h.calls.close,[[]]);assert.deepEqual(h.calls.complete,[])}
 const h=session();h.click('Назад');assert.equal(h.calls.close.length,1);const next=session();assert.match(next.text(),/1 из 3/);assert.equal(next.scene().revealed,0);
});

test('each feeling stays in the session; discomfort stops motion without restarting, and callbacks carry no answer',()=>{
 for(let choice=0;choice<3;choice++){
  const h=session();h.click('Дальше');h.click('Дальше');h.click('Завершить паузу');h.inputs()[choice].props.onChange();h.render();
  assert.equal(h.scene().stopped,choice===2);assert.deepEqual(h.calls.complete,[[]]);
  if(choice===2){assert.match(h.text(),/Можно завершить практику/);h.inputs()[1].props.onChange();h.render();assert.equal(h.scene().stopped,true)}
  h.click('Посмотреть варианты поддержки');assert.deepEqual(h.calls.support,[[]]);assert.equal(h.calls.complete.length,1);
 }
});

test('practice status belongs to each case, preserves drafts and progress, and rejects invalid persistence',()=>{
 const records=new Map<string,string>();Object.assign(globalThis,{window:{location:{href:'https://beregryadom.ru/'},localStorage:{getItem:(k:string)=>records.get(k)??null,setItem:(k:string,v:string)=>records.set(k,v),removeItem:(k:string)=>records.delete(k)}}});
 const answers={...emptyAnswers,risk:'yes',kind:'transfer',money:'own',impact:'savings',notes:'Тестовая история'};
 const own=saveLocalCase({answers,documents:{bank:'Тестовый черновик'},focusStep:'bank',completedSteps:['security'],intakeCompleted:true,shorePractice:'collapsed'});
 const beforeNotes=own.answers.notes;const helper=createLocalCase('helper');assert.equal(helper.shorePractice,undefined);assert.equal(loadLocalCase()!.id,helper.id);
 saveLocalCase({...helper,shorePractice:'shown'});activateLocalCase(own.id);assert.equal(loadLocalCase()!.shorePractice,'collapsed');
 saveLocalCase({...loadLocalCase()!,shorePractice:'completed'});assert.equal(loadLocalCases().find(c=>c.id===helper.id)!.shorePractice,'shown');
 const saved=loadLocalCase()!;assert.equal(saved.documents.bank,'Тестовый черновик');assert.equal(saved.answers.notes,beforeNotes);assert.deepEqual(saved.completedSteps,['security']);assert.equal(saved.focusStep,'bank');
 const raw=records.get('bereg:cases:v2:/');assert.throws(()=>saveLocalCase({...saved,shorePractice:'uncomfortable' as shore.ShorePracticeStatus}));assert.equal(records.get('bereg:cases:v2:/'),raw);
 const extra={...saved,feeling:'uncomfortable',session:shore.createShoreSession()};saveLocalCase(extra);assert.doesNotMatch(records.get('bereg:cases:v2:/')!,/uncomfortable|feeling|motionStopped|revealed/);
 assert.equal(shore.collapseShorePractice('completed'),'completed');assert.equal(shore.collapseShorePractice(undefined),'collapsed');
});

test('legacy cases need no destructive migration and practice content has no analytics or media APIs',()=>{
 const records=new Map<string,string>();const legacy={id:'legacy-shore-test',updatedAt:'2026-10-18T10:00:00.000Z',answers:{...emptyAnswers,risk:'no'},documents:{bank:'Старый текст'},focusStep:null,completedSteps:[]};const raw=JSON.stringify(legacy);records.set('bereg:case:v1:/',raw);
 Object.assign(globalThis,{window:{location:{href:'https://beregryadom.ru/'},localStorage:{getItem:(k:string)=>records.get(k)??null,setItem:(k:string,v:string)=>records.set(k,v),removeItem:(k:string)=>records.delete(k)}}});
 assert.equal(loadLocalCase()!.shorePractice,undefined);assert.equal(records.get('bereg:case:v1:/'),raw);assert.equal(records.has('bereg:cases:v2:/'),false);
 saveLocalCase({...loadLocalCase()!,shorePractice:'shown'});assert.equal(records.get('bereg:case:v1:/'),raw);assert.equal(loadLocalCase()!.documents.bank,'Старый текст');
 const source=readFileSync(new URL('../components/shore-practice.tsx',import.meta.url),'utf8');assert.doesNotMatch(source,/dataLayer|\bym\s*\(|_tmr|localStorage|sessionStorage|getUserMedia|<audio|<video|setTimeout|setInterval/);assert.match(source,/ym-hide-content/);assert.match(source,/ym-disable-keys/);assert.doesNotMatch(source,/Вы успокоились|Вы справились со стрессом|Теперь вы готовы мыслить рационально/);
});
