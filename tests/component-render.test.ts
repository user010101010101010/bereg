import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as icons from 'lucide-react';
import * as bank from '../lib/bank-help.ts';
import * as bereg from '../lib/bereg.ts';
import * as drafts from '../lib/draft-versions.ts';
import * as plan from '../lib/plan-progress.ts';
import * as shore from '../lib/shore-practice.ts';
function load(file:string,react:unknown=React){
 const source=readFileSync(new URL('../components/'+file,import.meta.url),'utf8');const exports:any={};
 const primitives={Dialog:({open,children}:any)=>open?children:null,DialogContent:({children,...props}:any)=>React.createElement('section',{...props,role:'dialog'},children),DialogTitle:({children}:any)=>React.createElement('h2',null,children),DialogDescription:({children}:any)=>React.createElement('p',null,children),Checkbox:({checked,...props}:any)=>React.createElement('button',{'data-slot':'checkbox',role:'checkbox','aria-checked':checked,'aria-label':props['aria-label']}),Progress:()=>React.createElement('div'),RadioGroup:({children}:any)=>React.createElement('div',null,children),RadioGroupItem:({value}:any)=>React.createElement('input',{type:'radio',value,readOnly:true})};
 const require=(name:string)=>name==='react'?react:name==='lucide-react'?icons:name.includes('bank-help')?bank:name.endsWith('/bereg')?bereg:name.includes('draft-versions')?drafts:name.includes('plan-progress')?plan:name.includes('/lib/shore-practice')?shore:name.endsWith('/step-visual')?load('step-visual.tsx'):primitives;
 const js=ts.transpileModule('import * as __BeregReact from "react";\n'+source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React,jsxFactory:'__BeregReact.createElement',jsxFragmentFactory:'__BeregReact.Fragment'}}).outputText;
 vm.runInNewContext(js,{exports,require});return exports;
}
const a={...bereg.emptyAnswers,risk:'yes',kind:'transfer',money:'own',impact:'savings'};
test('how-to renders real captures, active anchor semantics and one primary entry without adjacent duplicate return buttons',()=>{
 const {HowToPage,howSections,howQuestions,howShots}=load('how-to-page.tsx');
 const html=renderToStaticMarkup(React.createElement(HowToPage,{primaryLabel:'Вернуться к плану',loading:false,onPrimary(){},onSupport(){},onPractice(){},onMaterials(){},onHelper(){},onCase(){}}));
 assert.match(html,/Как пользоваться «Берегом»/);assert.equal(howQuestions.length,7);
 for(const section of howSections){assert.ok(html.includes('href="#'+section.id+'"'));assert.ok(html.includes('id="'+section.id+'"'));}
 for(const [question] of howQuestions)assert.ok(html.includes('<summary>'+question+'</summary>'));assert.doesNotMatch(html,/<input|placeholder=|скриншот появится|онбординг|не переживайте|интуитивно понятный|how-back|переставлять карточки нельзя|Завершение не отмечает|К инструкции можно вернуться/);
 assert.equal((html.match(/<figure class="how-shot"/g)||[]).length,5);assert.equal((html.match(/aria-current="location"/g)||[]).length,2);
 for(const shot of howShots){assert.ok(shot.alt.length>35);assert.ok(html.includes(shot.preview));for(const asset of [shot.src,shot.preview])assert.ok(readFileSync(new URL('../public/'+asset.slice(2),import.meta.url)).byteLength>1000)}
 const heading=html.match(/<header class="how-heading">([\s\S]*?)<\/header>/)![1];assert.equal((heading.match(/<button/g)||[]).length,1);assert.doesNotMatch(heading,/Составить план действий|eyebrow/);
 for(const label of ['Получить план действий','Открыть инструкцию','Этот шаг выполнен','Скачать TXT','Скопировать текст','Хранение и удаление данных','Найти берег'])assert.ok(html.includes(label));
 assert.match(html,/самостоятельно отправить в банк/);assert.match(html,/Автоматической синхронизации нет/);assert.match(html,/загрузить JSON обратно в сервис сейчас нельзя/);
 const disabled=renderToStaticMarkup(React.createElement(HowToPage,{primaryLabel:'Открыть мой случай',loading:true,onPrimary(){},onSupport(){},onPractice(){},onMaterials(){},onHelper(){},onCase(){}}));assert.equal((disabled.match(/disabled=""/g)||[]).length,2);
});
test('pending and completed rows separate the checkbox hit area from the instruction button and do not render empty lists',()=>{
 const {StepChecklist}=load('bereg-features.tsx');const steps=bereg.generatePlan(a);
 const render=(completed:string[],omitNext=true)=>renderToStaticMarkup(React.createElement(StepChecklist,{plan:steps,completed,omitNext,onToggle(){},onOpen(){}}));
 const pending=render([],false);assert.equal((pending.match(/class="compact-step-check"/g)||[]).length,steps.length);assert.equal((pending.match(/class="compact-step-open"/g)||[]).length,steps.length);
 assert.equal((pending.match(/<label class="compact-step-check"><button data-slot="checkbox"/g)||[]).length,steps.length);
 assert.equal((pending.match(/<button class="compact-step-open"[^>]*><span class="compact-step-copy">/g)||[]).length,steps.length);
 for(const label of pending.matchAll(/<label class="compact-step-check">([\s\S]*?)<\/label>/g))assert.doesNotMatch(label[1],/compact-step-open/);
 const done=render(steps.map((step:bereg.Step)=>step.id));assert.doesNotMatch(done,/aria-label="Оставшиеся задачи"/);assert.match(done,/aria-label="Выполненные задачи"/);assert.equal((done.match(/aria-checked="true"/g)||[]).length,steps.length);
 const oneRemaining=render(steps.slice(1).map((step:bereg.Step)=>step.id));assert.doesNotMatch(oneRemaining,/aria-label="Оставшиеся задачи"/);
});
test('every plan step has a decorative themed icon, including in completed history',()=>{
 const {StepIcon,StepArtwork}=load('step-visual.tsx');const {StepChecklist}=load('bereg-features.tsx');
 const shapes=new Map<string,string>();
 for(const id of Object.keys(bereg.steps)){
  const icon=renderToStaticMarkup(React.createElement(StepIcon,{stepId:id}));assert.ok(icon.includes('data-step-icon="'+id+'"'));assert.match(icon,/aria-hidden="true"/);assert.match(icon,/stroke-width="1.7"/);shapes.set(id,icon.match(/class="([^"]+)"/)![1]);
  const artwork=renderToStaticMarkup(React.createElement(StepArtwork,{stepId:id}));assert.ok(artwork.includes('data-step-artwork="'+id+'"'));assert.match(artwork,/<figure class="step-artwork" aria-hidden="true"/);assert.match(artwork,/step-artwork-waves/);assert.doesNotMatch(artwork,/<img|<button/);
 }
 assert.ok(new Set(shapes.values()).size>=8);
 const steps=bereg.generatePlan(a);const html=renderToStaticMarkup(React.createElement(StepChecklist,{plan:steps,completed:steps.map(s=>s.id),onToggle(){},onOpen(){}}));
 for(const step of steps)assert.ok(html.includes('data-step-icon="'+step.id+'"'));
});
test('shore scene adds exactly three stones, plants and a path; the optional offer collapses without losing its entry',()=>{
 const {ShoreScene,ShorePracticeOffer,ShorePracticeSession}=load('shore-practice.tsx');
 for(let revealed=0;revealed<=3;revealed++){
  const html=renderToStaticMarkup(React.createElement(ShoreScene,{revealed}));assert.match(html,/aria-hidden="true"/);
  assert.equal(html.includes('data-shore-element="stones"'),revealed>=1);assert.equal((html.match(/<ellipse/g)||[]).length,revealed>=1?3:0);
  assert.equal(html.includes('data-shore-element="plants"'),revealed>=2);assert.equal(html.includes('data-shore-element="path"'),revealed>=3);
 }
 const render=(status?:shore.ShorePracticeStatus)=>renderToStaticMarkup(React.createElement(ShorePracticeOffer,{status,onOpen(){},onCollapse(){}}));
 assert.match(render(),/Можно немного передохнуть/);assert.match(render(),/Продолжить без паузы/);
 assert.doesNotMatch(render('collapsed'),/Продолжить без паузы|Попробуйте короткую практику/);assert.match(render('collapsed'),/Открыть практику/);assert.match(render('completed'),/Практика завершена/);
 const initial=renderToStaticMarkup(React.createElement(ShorePracticeSession,{onClose(){},onComplete(){},onSupport(){}}));assert.match(initial,/role="group"/);assert.match(initial,/aria-describedby=/);assert.match(initial,/ym-hide-content/);assert.match(initial,/Пропустить практику/);assert.doesNotMatch(initial,/Заметьте один звук|Почувствуйте опору|<input|<audio|<video/);
});
test('bank instruction renders no default bank, all five verified contacts, another-bank guidance and editable repeat reference',()=>{
 const {BankSupport}=load('bereg-features.tsx');
 const render=(value:bank.BankCall,answers=a)=>renderToStaticMarkup(React.createElement(BankSupport,{answers,value,onChange(){},onCopy(){}}));
 const initial=render(bank.emptyBankCall);assert.match(initial,/<option value="" selected="">Выберите банк/);assert.match(initial,/<option value="other">Другой банк/);assert.doesNotMatch(initial,/href="tel:/);
 for(const b of bank.banks){const html=render({...bank.emptyBankCall,bankId:b.id});assert.ok(html.includes('href="tel:'+b.tel+'"'));assert.ok(html.includes('href="'+b.url.replaceAll('&','&amp;')+'"'));assert.ok(html.indexOf('class="bank-contact"')<html.indexOf('class="call-script"'));assert.ok(html.indexOf('class="call-notes"')<html.indexOf('class="bank-extra"'));}
 const other=render({...bank.emptyBankCall,bankId:'other'});assert.match(other,/обратной стороне карты/);assert.doesNotMatch(other,/href="tel:/);
 const repeat=render({...bank.emptyBankCall,reference:'TEST-RETURN'}, {...a,already:['bank']});assert.match(repeat,/Повторный разговор/);assert.match(repeat,/value="TEST-RETURN"/);assert.match(repeat,/Номер обращения — TEST-RETURN/);
});
test('stale document visibly warns and blocks copy/TXT until an explicit choice; previous versions remain downloadable',()=>{
 const {DraftEditor}=load('draft-editor.tsx');const first=drafts.replaceDraft('bank',{}, {},a);const answers={...a,kind:'card'};const versions=drafts.syncDraftVersions(first.documents,first.documentVersions,answers);
 const props={type:'bank',answers,documents:first.documents,versions,onClose(){},onChange(){},onNew(){},onKeep(){},onDownload(){},onCopy(){},saveLabel:'Сохранено в этом браузере'};
 const html=renderToStaticMarkup(React.createElement(DraftEditor,props));assert.ok(html.indexOf('В черновике остались прежние данные')<html.indexOf('Скачать TXT'));assert.match(html,/Создать новый черновик/);assert.match(html,/Оставить мой текст/);assert.equal((html.match(/disabled=""/g)||[]).length,2);
 const renewed=drafts.replaceDraft('bank',first.documents,versions,answers);const current=renderToStaticMarkup(React.createElement(DraftEditor,{...props,documents:renewed.documents,versions:renewed.documentVersions}));assert.doesNotMatch(current,/disabled=""/);assert.match(current,/Прежние версии/);assert.match(current,/Скачать прежнюю версию TXT/);
});
test('browser storage disclosure appears before the first answer and uncertain access exposes short protection actions',()=>{
 const {CaseIntake,canAdvance}=load('case-intake.tsx');const html=renderToStaticMarkup(React.createElement(CaseIntake,{answers:{...a,risk:'unsure'},onChange(){},stage:0,furthest:0,onStage(){},onPlan(){},onUrgent(){},role:'self',saveLabel:'Сохранено'}));assert.ok(html.indexOf('Ответы сохраняются в этом браузере')<html.indexOf('<fieldset'));assert.match(html,/Открыть короткую инструкцию/);assert.equal(canAdvance({...a,kind:'',money:''},1),false);assert.equal(canAdvance({...a,mood:'',support:''},4),true);
});
