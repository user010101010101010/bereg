import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {funnelGoals,sendFunnelGoal,sendPageView,type FunnelGoal} from '../lib/site-analytics.ts';

const source=readFileSync(new URL('../public/analytics-consent.js',import.meta.url),'utf8');
const key='bereg:analytics-consent:v1';
function runtime(records=new Map<string,string>(),blocked=false){
 const inserted:Record<string,any>[]=[];const calls:unknown[][]=[];const listeners=new Map<string,(event:any)=>void>();
 const window:any={localStorage:{getItem:(k:string)=>{if(blocked)throw Error('denied');return records.get(k)??null},setItem:(k:string,v:string)=>{if(blocked)throw Error('quota');records.set(k,v)}},location:{href:'https://beregryadom.ru/?view=how'},addEventListener:(name:string,callback:(event:any)=>void)=>listeners.set(name,callback),dispatchEvent(){},ym:(...args:unknown[])=>calls.push(args)};
 const document={referrer:'https://example.org/',head:{appendChild:(script:Record<string,unknown>)=>inserted.push(script)},getElementById:(id:string)=>inserted.find(s=>s.id===id),createElement:()=>({})};
 const context=vm.createContext({window,document,Date,CustomEvent:class{type:string;detail:unknown;constructor(type:string,detail:unknown){this.type=type;this.detail=detail}}});
 vm.runInContext(source,context);
 return {window,inserted,calls,records,choose:(choice:string)=>window.beregAnalytics.choose(choice),rerun:()=>vm.runInContext(source,context),storage:()=>listeners.get('storage')!({key})};
}
test('first visit, refusal, corrupt consent and unavailable storage do not load either counter',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/<script src="\.\/analytics-consent.js"><\/script>/);assert.doesNotMatch(html,/mc\.yandex\.ru|top-fwz1\.mail\.ru|<noscript>|USER_ID|pid\s*:/);
 for(const stored of [undefined,'denied','broken','true']){const r=runtime(new Map(stored?[[key,stored]]:[]));assert.equal(r.inserted.length,0);assert.equal(r.calls.length,0);assert.equal(r.window.beregAnalytics.allowed,false)}
 const denied=runtime();denied.choose('denied');assert.equal(denied.inserted.length,0);assert.equal(denied.window.beregAnalytics.getChoice(),'denied');assert.equal(runtime(denied.records).inserted.length,0);
 const blocked=runtime(new Map(),true);assert.equal(blocked.inserted.length,0);assert.equal(blocked.choose('accepted').persisted,false);assert.equal(blocked.window.beregAnalytics.getChoice(),'accepted');assert.equal(blocked.inserted.length,2);
});
test('explicit acceptance loads each SDK once, preserves layers and remembers the decision across reloads',()=>{
 const r=runtime();const layer=[{event:'existing'}];r.window.dataLayer=layer;const result=r.choose('accepted');assert.equal(result.persisted,true);assert.equal(result.needsReload,false);assert.equal(r.window.dataLayer,layer);assert.equal(r.window.beregAnalytics.allowed,true);
 assert.deepEqual(r.inserted.map(s=>s.src),['https://mc.yandex.ru/metrika/tag.js?id=113661127','https://top-fwz1.mail.ru/js/code.js']);assert.ok(r.inserted.every(s=>s.async));assert.equal(r.calls.length,1);
 const init=r.calls[0][2] as Record<string,unknown>;assert.equal(init.webvisor,false);assert.equal(init.clickmap,false);assert.equal(init.ecommerce,'dataLayer');assert.equal(init.url,r.window.location.href);
 assert.equal(r.window._tmr.length,1);assert.deepEqual(Object.keys(r.window._tmr[0]).sort(),['id','start','type']);r.choose('accepted');r.rerun();assert.equal(r.inserted.length,2);assert.equal(r.window._tmr.length,1);
 const resumed=runtime(r.records);assert.equal(resumed.window.beregAnalytics.getChoice(),'accepted');assert.equal(resumed.inserted.length,2);
});
test('consent does not touch cases and revocation blocks app events before a deliberate reload',()=>{
 const original='{"documents":{"bank":"fictional private text"}}';const records=new Map([['bereg:cases:v2:/',original]]);const r=runtime(records);r.choose('accepted');assert.equal(r.choose('denied').needsReload,true);assert.equal(r.window.beregAnalytics.allowed,false);assert.equal(r.window.disableYaCounter113661127,true);assert.equal(records.get('bereg:cases:v2:/'),original);assert.equal(runtime(records).inserted.length,0);assert.equal(r.calls.at(-1)![1],'destruct');
 Object.assign(globalThis,{window:r.window});const before=r.calls.length;sendFunnelGoal('plan_received');sendPageView('url','ref','title');assert.equal(r.calls.length,before);assert.equal(r.window.dataLayer.length,0);
});
test('revocation in another tab prevents new app events',()=>{
 const r=runtime(new Map([[key,'accepted']]));r.records.set(key,'denied');r.storage();assert.equal(r.window.beregAnalytics.allowed,false);assert.equal(r.window.beregAnalytics.getChoice(),'denied');assert.equal(r.window.disableYaCounter113661127,true);
});
test('events before consent and after refusal are dropped, never queued for later replay',()=>{
 for(const choice of [undefined,'denied']){const r=runtime(new Map(choice?[[key,choice]]:[]));Object.assign(globalThis,{window:r.window});sendFunnelGoal('onboarding_start');sendPageView('url','ref','title');assert.equal(r.window.dataLayer,undefined);assert.equal(r.window._tmr,undefined);assert.equal(r.calls.length,0);r.choose('accepted');assert.equal(r.window.dataLayer.length,0);assert.equal(r.window._tmr.length,1)}
 Object.assign(globalThis,{window:{ym:()=>{throw Error('must not run')}}});assert.doesNotThrow(()=>sendFunnelGoal('plan_received'));
});
test('consented events contain only allowlisted names and one route view per counter',()=>{
 const calls:unknown[][]=[];const dataLayer:{event:FunnelGoal}[]=[];const pixel:Record<string,unknown>[]=[];const browser={beregAnalytics:{allowed:true},ym:(...args:unknown[])=>calls.push(args),dataLayer,_tmr:{push:(event:Record<string,unknown>)=>pixel.push(event)}};Object.assign(globalThis,{window:browser});for(const goal of funnelGoals)sendFunnelGoal(goal);
 assert.deepEqual(dataLayer,funnelGoals.map(event=>({event})));assert.deepEqual(calls,funnelGoals.map(goal=>[113661127,'reachGoal',goal]));assert.equal(pixel.length,0);sendFunnelGoal('private text' as FunnelGoal);assert.equal(dataLayer.length,3);
 sendPageView('https://beregryadom.ru/?view=about','https://beregryadom.ru/','О нас · Берег');assert.equal(pixel.length,1);const {start,...event}=pixel[0];assert.equal(typeof start,'number');assert.deepEqual(event,{id:'3805761',type:'pageView',url:'https://beregryadom.ru/?view=about',referrer:'https://beregryadom.ru/'});
});
test('blocked counters never interrupt another channel or the app',()=>{
 const r=runtime();r.window.ym=()=>{throw Error('blocked SDK')};assert.doesNotThrow(()=>r.choose('accepted'));assert.equal(r.window.beregAnalytics.allowed,true);assert.ok(r.inserted.some(s=>s.id==='tmr-code'));
 const browser:any={beregAnalytics:{allowed:true},ym:()=>{throw Error('blocked')}};Object.assign(globalThis,{window:browser});assert.doesNotThrow(()=>sendFunnelGoal('onboarding_start'));assert.deepEqual(browser.dataLayer,[{event:'onboarding_start'}]);assert.doesNotThrow(()=>sendPageView('url','ref','title'));assert.equal(browser._tmr[0].id,'3805761');delete (globalThis as any).window;assert.doesNotThrow(()=>sendFunnelGoal('plan_received'));assert.doesNotThrow(()=>sendPageView('url','ref','title'));
});
