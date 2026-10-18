import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {searchArticles} from '../lib/article-search.ts';
import {guides} from '../lib/article-content.ts';
test('search covers full article text, keywords, Russian inflections, case and е/ё',()=>{
 const expected:Record<string,string[]>={'банк':['first','return'],'полиция':['first','evidence'],'полицию':['first','evidence'],'заявление':['first','evidence'],'кредит':['return','restore'],'долг':['restore'],'стыдно':['feelings','helper'],'списали':['first','return'],'близкий':['helper','feelings']};
 for(const [query,ids] of Object.entries(expected)){const result=searchArticles(query).map(a=>a.id);assert.ok(ids.some(id=>result.includes(id)),query);}
 assert.deepEqual(searchArticles('  БАНК  '),searchArticles('банк'));assert.deepEqual(searchArticles('заём'),searchArticles('заем'));assert.equal(searchArticles('несуществующееабракадабра').length,0);assert.equal(searchArticles('').length,7);
 assert.ok(searchArticles('лекарства').some(a=>a.id==='restore'));assert.ok(searchArticles('хронологию').some(a=>a.id==='evidence'));
});
test('all seven articles contain actionable opening, no quiz and no mandatory reading total',()=>{
 for(const guide of Object.values(guides)){assert.ok(guide.quick.length>=3);assert.equal('quiz' in guide,false);assert.ok(guide.sections.map(s=>s.paragraphs.join(' ')).join(' ').length>500);}
 const component=readFileSync(new URL('../components/bereg-content.tsx',import.meta.url),'utf8');assert.doesNotMatch(component,/guide\.quiz|quiz-feedback|из \{articles.length\}/);assert.ok(component.indexOf('className="article-quick"')<component.indexOf('className="guide-cover"'));
});
test('Metrika init actually disables replay and clickmap while preserving anonymous funnel events',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');const source=html.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/)![1];
 const calls:unknown[][]=[];const window={ym:(...args:unknown[])=>calls.push(args)};
 const document={scripts:[],referrer:'',createElement:()=>({}),getElementsByTagName:()=>[{parentNode:{insertBefore(){}}}]};
 vm.runInNewContext(source,{window,document,location:{href:'https://beregryadom.ru/'},ym:window.ym,Date});
 const init=calls.find(call=>call[1]==='init')![2] as Record<string,unknown>;assert.equal(init.webvisor,false);assert.equal(init.clickmap,false);assert.equal(init.trackLinks,true);assert.ok(!('params' in init));
 const privateComponents=['case-intake.tsx','draft-editor.tsx','bereg-features.tsx'];for(const file of privateComponents){const source=readFileSync(new URL('../components/'+file,import.meta.url),'utf8');assert.match(source,/ym-hide-content/);assert.match(source,/ym-disable-keys/)}
});
test('corrected normal text contrast pairs meet AA',()=>{
 function luminance(hex:string){const values=hex.match(/\w\w/g)!.map(value=>parseInt(value,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*values[0]+.7152*values[1]+.0722*values[2]}
 const ratio=(a:string,b:string)=>{const values=[luminance(a),luminance(b)].sort((a,b)=>b-a);return(values[0]+.05)/(values[1]+.05)};
 assert.ok(ratio('52634d','eff4e7')>=4.5);assert.ok(ratio('ffffff','00804c')>=4.5);assert.ok(ratio('001f3f','dbe64c')>=4.5);assert.ok(ratio('9b3038','ffffff')>=4.5);
});
