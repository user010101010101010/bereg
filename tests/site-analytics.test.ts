import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {funnelGoals,sendFunnelGoal,sendPageView,type FunnelGoal} from '../lib/site-analytics.ts';

test('HTML initializes the shared layer before counters and installs pixel 3805761 once without a placeholder user ID',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const sources=[...html.matchAll(/<script type="text\/javascript">([\s\S]*?)<\/script>/g)].map(match=>match[1]);
 assert.equal(sources.length,2);
 const layer=[{event:'existing'}];const queue:Record<string,unknown>[]=[];const calls:unknown[][]=[];
 const window={dataLayer:layer,_tmr:queue,ym:(...args:unknown[])=>calls.push(args)};
 const installed=new Map<string,Record<string,unknown>>();const inserted:Record<string,unknown>[]=[];
 const document={scripts:[],referrer:'',getElementById:(id:string)=>installed.get(id),createElement:()=>({}),
  getElementsByTagName:()=>[{parentNode:{insertBefore:(script:Record<string,unknown>)=>{inserted.push(script);if(script.id)installed.set(String(script.id),script)}}}]};
 const context=vm.createContext({window,document,location:{href:'https://beregryadom.ru/'},ym:window.ym,Date});
 vm.runInContext(sources[0],context);assert.equal(window.dataLayer,layer);assert.deepEqual(layer,[{event:'existing'}]);
 assert.equal((calls[0][2] as Record<string,unknown>).ecommerce,'dataLayer');
 vm.runInContext(sources[1],context);assert.equal(window._tmr,queue);assert.equal(queue.length,1);
 assert.deepEqual(Object.keys(queue[0]).sort(),['id','start','type']);assert.equal(queue[0].id,'3805761');assert.equal(queue[0].type,'pageView');assert.equal(typeof queue[0].start,'number');
 const script=installed.get('tmr-code')!;assert.equal(script.src,'https://top-fwz1.mail.ru/js/code.js');assert.equal(script.async,true);
 vm.runInContext(sources[1],context);assert.equal(queue.length,1);assert.equal(inserted.filter(s=>s.id==='tmr-code').length,1);
 assert.doesNotMatch(html,/USER_ID|pid\s*:/);assert.match(html,/<noscript>.*https:\/\/top-fwz1\.mail\.ru\/counter\?id=3805761;js=na.*<\/noscript>/);
});

test('funnel events contain only allowlisted names in dataLayer, preserve Metrika and do not double-send to VK',()=>{
 const calls:unknown[][]=[];const dataLayer:{event:FunnelGoal}[]=[];const _tmr:unknown[]=[];
 Object.assign(globalThis,{window:{ym:(...args:unknown[])=>calls.push(args),dataLayer,_tmr,localStorage:{getItem:()=>{throw new Error('analytics must not read case storage')}}}});
 for(const goal of funnelGoals)sendFunnelGoal(goal);
 assert.deepEqual(dataLayer,funnelGoals.map(event=>({event})));
 assert.deepEqual(calls,funnelGoals.map(goal=>[113661127,'reachGoal',goal]));assert.deepEqual(_tmr,[]);
 sendFunnelGoal('untrusted event' as FunnelGoal);assert.equal(dataLayer.length,3);assert.equal(calls.length,3);
});

test('SPA views use the existing loaded SDK object with the correct referrer and no personal payload',()=>{
 const pixel:Record<string,unknown>[]=[];const metrika:unknown[][]=[];
 const loaded={push:(event:Record<string,unknown>)=>pixel.push(event)};
 Object.assign(globalThis,{window:{_tmr:loaded,ym:(...args:unknown[])=>metrika.push(args)}});
 sendPageView('https://beregryadom.ru/?view=about','https://beregryadom.ru/','О нас · Берег');
 assert.deepEqual(metrika,[[113661127,'hit','https://beregryadom.ru/?view=about',{title:'О нас · Берег',referer:'https://beregryadom.ru/'}]]);
 assert.equal(pixel.length,1);const {start,...event}=pixel[0];assert.equal(typeof start,'number');
 assert.deepEqual(event,{id:'3805761',type:'pageView',url:'https://beregryadom.ru/?view=about',referrer:'https://beregryadom.ru/'});
 assert.equal((globalThis as any).window._tmr,loaded);
});

test('queues accept early events and analytics failure never blocks another channel or the app',()=>{
 const browser:any={ym:()=>{throw new Error('blocked')}};Object.assign(globalThis,{window:browser});
 assert.doesNotThrow(()=>sendFunnelGoal('onboarding_start'));assert.deepEqual(browser.dataLayer,[{event:'onboarding_start'}]);
 assert.doesNotThrow(()=>sendPageView('https://beregryadom.ru/?view=plan','https://beregryadom.ru/','Берег'));assert.equal(browser._tmr[0].id,'3805761');
 let received=0;browser.ym=()=>received++;browser.dataLayer={push:()=>{throw new Error('blocked')}};browser._tmr={push:()=>{throw new Error('blocked')}};
 assert.doesNotThrow(()=>sendFunnelGoal('plan_received'));assert.doesNotThrow(()=>sendPageView('url','referrer','title'));assert.equal(received,2);
 delete (globalThis as any).window;assert.doesNotThrow(()=>sendFunnelGoal('plan_received'));assert.doesNotThrow(()=>sendPageView('url','referrer','title'));
});
