import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {articles,buildDraft,emptyAnswers,generatePlan} from '../lib/bereg.ts';
import {guides} from '../lib/article-content.ts';
import {loadArticleProgress,saveArticleProgress,readArticleIds} from '../lib/article-progress.ts';
import {legalContext} from '../lib/legal-help.ts';

const store=new Map<string,string>();
let blocked=false;let dispatched=0;
Object.assign(globalThis,{window:{location:{href:'https://example.github.io/bereg/?view=article&article=feelings'},localStorage:{getItem:(key:string)=>store.get(key)??null,setItem:(key:string,value:string)=>{if(blocked)throw new Error('blocked');store.set(key,value)}},dispatchEvent:()=>{dispatched++;return true}}});

test('reading marks are separate for each article and stay out of the case record',()=>{
 const value={checked:['0','2'],answer:2,read:true};
 saveArticleProgress('feelings',value);
 assert.deepEqual(loadArticleProgress('feelings'),value);
 assert.deepEqual(loadArticleProgress('return'),{checked:[],answer:null,read:false});
 assert.deepEqual(readArticleIds(),['feelings']);assert.equal(dispatched,1);
 assert.ok(store.has('bereg:reading:v1:/bereg/'));assert.ok(!store.has('bereg:case:v1:/bereg/'));
 blocked=true;assert.throws(()=>saveArticleProgress('feelings',{...value,read:false}));blocked=false;
 assert.equal(loadArticleProgress('feelings').read,true);
});

test('corrupt reading progress cannot inflate counts or prevent opening an article',()=>{
 store.set('bereg:reading:v1:/bereg/',JSON.stringify({feelings:{checked:['0','0','999',7,'1'],answer:8,read:false}}));
 assert.deepEqual(loadArticleProgress('feelings'),{checked:['0','1'],answer:null,read:false});
 store.set('bereg:reading:v1:/bereg/','bad json');assert.deepEqual(loadArticleProgress('feelings'),{checked:[],answer:null,read:false});
});

test('each published article has complete content, real local photography, and usable sources',()=>{
 assert.equal(articles.length,7);
 const credits=JSON.parse(fs.readFileSync(new URL('../public/images/photo-credits.json',import.meta.url),'utf8')) as {filename:string;author:string;sourceUrl:string}[];
 assert.equal(new Set(articles.map(article=>guides[article.id].photo)).size,articles.length);
 for(const article of articles){const guide=guides[article.id];assert.ok(guide.photoAlt.length>10);const credit=credits.find(photo=>photo.filename===guide.photo);assert.ok(credit?.author);assert.ok(credit?.sourceUrl.startsWith('https://www.pexels.com/photo/'))}
 for(const article of articles){const guide=guides[article.id];assert.ok(guide);assert.equal(guide.sections.length,4);assert.ok(guide.sources.length>=2);assert.equal(guide.checklist.length,3);assert.equal(guide.quiz.options.length,3);assert.ok(guide.quiz.correct>=0&&guide.quiz.correct<3);assert.ok(fs.existsSync(new URL('../public/images/'+guide.photo,import.meta.url)));assert.ok(guide.sources.every(s=>s.url.startsWith('https://')))}
});

test('the requested own-savings transfer scenario gets a budget-aware legal path and accurate drafts',()=>{
 const a={...emptyAnswers,risk:'yes',timing:'today',kind:'transfer',money:'own',impact:'savings',amount:'under50',mood:'anxious',support:'yes'};
 const plan=generatePlan(a);assert.equal(plan[0].id,'security');assert.ok(plan.some(s=>s.id==='police'));assert.ok(!plan.some(s=>s.id==='debt'));
 assert.match(legalContext(a).budget,/50 000/);
 const bank=buildDraft('bank',a);assert.match(bank,/подтвердил\(а\) самостоятельно/);assert.doesNotMatch(bank,/согласия на неё не давал/);
 const police=buildDraft('police',a);assert.match(police,/Подпись:/);assert.match(police,/Дата:/);assert.doesNotMatch(police,/предупреждён/);
});
