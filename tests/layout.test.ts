import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';

// Parse the actual stylesheet using the existing Tailwind/PostCSS dependency.
// These are CSS contract tests, not browser measurements or screenshot tests.
const postcss=createRequire(import.meta.resolve('@tailwindcss/postcss'))('postcss');
const source=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
const stylesheet=postcss.parse(source);
type CssNode={type:string;name?:string;params?:string;parent?:CssNode;selector?:string;nodes?:CssNode[];prop?:string;value?:string;important?:boolean};
const widths=[320,360,390,430,768,1280,1440,1920];
function active(rule:CssNode,width:number){
 for(let node=rule.parent;node;node=node.parent){
  if(node.type==='atrule'&&node.name==='media'){
   for(const match of (node.params||'').matchAll(/\((min|max)-width:\s*(\d+)px\)/g))if(match[1]==='max'?width>Number(match[2]):width<Number(match[2]))return false;
  }
 }
 return true;
}
function declarations(selector:string,width=1440):Record<string,string>{
 const result:Record<string,{value:string;important:boolean}>={};
 stylesheet.walkRules((rule:CssNode)=>{
  if(!active(rule,width)||!postcss.list.comma(rule.selector).includes(selector))return;
  for(const item of rule.nodes||[])if(item.type==='decl'&&item.prop&&item.value){
   if(result[item.prop]?.important&&!item.important)continue;
   result[item.prop]={value:item.value,important:!!item.important};
  }
 });
 return Object.fromEntries(Object.entries(result).map(([key,entry])=>[key,entry.value]));
}

test('task checkboxes remain 22px squares, separate from the expanding instruction button, at every requested width',()=>{
 assert.doesNotMatch(source,/\.compact-step\s*>\s*button\s*\{/);
 for(const width of widths){
  const row=declarations('.compact-step',width),check=declarations(".compact-step-check>[data-slot='checkbox']",width),target=declarations('.compact-step-check',width);
  assert.equal(row.display,'grid');assert.equal(row['grid-template-columns'],'44px minmax(0,1fr)');
  assert.equal(check.width,'22px');assert.equal(check.height,'22px');assert.equal(check['min-height'],'22px');assert.equal(check.flex,'0 0 22px');assert.equal(check.padding,'0');
  assert.equal(target.width,'44px');assert.equal(target.height,'44px');
  const open=declarations('.compact-step-open',width);assert.equal(open.display,'flex');assert.equal(open['align-items'],'center');assert.equal(open['min-width'],'0');
 }
 const checked=declarations(".compact-step-check>[data-slot='checkbox'][data-state='checked']");assert.equal(checked.background,'var(--green)');assert.equal(checked.width,undefined);assert.equal(checked.height,undefined);
});

test('the global button reset excludes UI controls instead of removing checkbox and radio borders',()=>{
 stylesheet.walkRules((rule:CssNode)=>{
  for(const selector of postcss.list.comma(rule.selector))if(selector.startsWith('button:not(')&&rule.nodes?.some(item=>item.prop==='border'&&item.value==='0'))assert.ok(selector.includes(':not([data-slot])'));
 });
});

test('disclosure headers center their text, wrap naturally and expose a single consistent arrow',()=>{
 const selector=':where(.completed-history,.bank-extra,.storage-details,.draft-history,.external-legal,.guide-toc,.article-legal-details)>summary';
 for(const width of widths){const summary=declarations(selector,width);assert.equal(summary.display,'flex');assert.equal(summary['align-items'],'center');assert.equal(summary['min-height'],'44px');assert.equal(summary['list-style'],'none');assert.equal(summary.height,undefined);assert.equal(summary['overflow-wrap'],'anywhere')}
 assert.equal(declarations(selector+'::after').transform,'rotate(45deg)');
 assert.equal(declarations(selector.replace('>summary','[open]>summary')+'::after').transform,'rotate(225deg)');
 assert.equal(declarations('.bank-extra').padding,'8px 17px');
});

test('responsive CSS provides single-column forms and materials on phones, and clears the sticky header on desktop',()=>{
 for(const width of widths){
  assert.equal(declarations('.call-note-grid',width)['grid-template-columns'],width<=768?'minmax(0,1fr)':'repeat(2,minmax(0,1fr))');
  assert.equal(declarations('.article-grid',width)['grid-template-columns'],width<=768?'minmax(0,1fr)':'repeat(3,1fr)');
  if(width<=768)assert.equal(declarations('.plan-aside',width)['grid-template-columns'],'minmax(0,1fr)');
  if(width>1000){assert.equal(declarations('.plan-aside',width).position,'sticky');assert.equal(declarations('.plan-aside',width).top,'110px')}
 }
 for(const width of [769,900,1000]){assert.equal(declarations('.plan-aside',width).position,'static');assert.equal(declarations('.article-grid',width)['grid-template-columns'],'repeat(2,minmax(0,1fr))')}
 assert.equal(declarations('.search-field input')['min-width'],'0');
});

test('long dialog contents cannot flex-shrink fields, notices or instruction sections',()=>{
 const content=declarations("[data-slot='dialog-content']");assert.equal(content['overflow-y'],'auto');assert.ok(content['max-height'].includes('var(--viewport-height,100dvh)'));
 const children=declarations("[data-slot='dialog-content']>:not([data-slot='dialog-close'])");assert.equal(children['flex-shrink'],'0');assert.equal(children['min-width'],'0');
 const close=declarations("[data-slot='dialog-content']>[data-slot='dialog-close']");assert.equal(close.position,'sticky');assert.equal(close['min-height'],'44px');
});
test('next-action artwork has its own grid track and leaves the full title and controls width on phones',()=>{
 for(const width of widths){
  const card=declarations('.next-step',width),art=declarations('.step-artwork',width);assert.equal(card.display,'grid');
  assert.equal(card['grid-template-columns'],width<=600?'minmax(0,1fr) 72px':width<=768?'minmax(0,1fr) 136px':'minmax(0,1fr) 176px');
  assert.equal(art.width,width<=600?'72px':width<=768?'136px':'176px');assert.equal(art.height,art.width);assert.equal(art['pointer-events'],'none');
  if(width<=600){assert.equal(declarations('.next-step-heading h2',width)['grid-column'],'1/-1');assert.equal(declarations('.next-step-actions',width)['grid-column'],'1/-1');assert.equal(art['grid-row'],'1')}
 }
 assert.equal(declarations('.compact-step-category').display,'flex');assert.equal(declarations('.compact-step-category>svg')['flex-shrink'],'0');
});
test('shore practice uses readable text and places actions before the scene on phones, with reduced-motion overrides',()=>{
 for(const width of [320,360,390,430,768,1440]){
  assert.ok(parseFloat(declarations('.shore-prompt p',width)['font-size'])>=16);assert.equal(declarations('.shore-feedback>label',width)['font-size'],'16px');assert.equal(declarations('.shore-primary-actions>.button',width)['font-size'],'16px');
  assert.equal(declarations('.shore-dialog',width)['max-width'],'720px');assert.equal(declarations('.shore-feedback>label',width)['min-height'],'48px');
  if(width<=600){assert.equal(declarations('.shore-session>.shore-scene',width).order,'6');assert.equal(declarations('.shore-practice-controls',width).order,'5');assert.equal(declarations('.shore-offer',width)['grid-template-columns'],'minmax(0,1fr)')}
 }
 assert.equal(declarations(".shore-scene[data-motion='off'] *").animation,'none');assert.match(source,/@media\(prefers-reduced-motion:reduce\)\{\.shore-scene \*\{animation:none!important;transition:none!important\}\}/);
});
test('how-to keeps a readable single column on phones and tablet with keyboard-visible section targets',()=>{
 for(const width of [320,390,768,1440]){
  assert.equal(declarations('.how-section p',width)['font-size'],'16px');assert.equal(declarations('.how-actions li',width)['font-size'],'16px');assert.equal(declarations('.how-faq p',width)['font-size'],'16px');
  assert.equal(declarations('.how-toc a',width)['min-height'],'44px');assert.equal(declarations('.how-faq summary',width)['min-height'],'48px');assert.equal(declarations('.how-section',width)['scroll-margin-top'],'120px');
  if(width<=768){assert.equal(declarations('.how-layout',width)['grid-template-columns'],'minmax(0,1fr)');assert.equal(declarations('.how-toc',width).position,'static');assert.equal(declarations('.how-toc a',width)['font-size'],'16px')}
  else{assert.equal(declarations('.how-layout',width)['grid-template-columns'],'220px minmax(0,1fr)');assert.equal(declarations('.how-toc',width).position,'sticky')}
 }
 assert.equal(declarations('.how-section:focus-visible').outline,'3px solid var(--green)');assert.equal(declarations('.view-how~.floating-support').display,'none');
});
