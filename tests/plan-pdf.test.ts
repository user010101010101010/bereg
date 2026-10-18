import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPlanPdf} from '../lib/plan-pdf.ts';
import {emptyAnswers,generatePlan} from '../lib/bereg.ts';
const font=new Uint8Array(readFileSync(new URL('../public/fonts/Onest-PDF.ttf',import.meta.url)));
const answers={...emptyAnswers,risk:'yes',kind:'card',money:'own',impact:'savings',already:['bank','evidence']};
function pdfText(data:Uint8Array){const source=new TextDecoder().decode(data);return {source,text:[...source.matchAll(/<([0-9a-f]+)> Tj/g)].map(match=>String.fromCharCode(...match[1].match(/.{4}/g)!.map(code=>parseInt(code,16)))).join('\n')}}
test('PDF shares plan titles, initial completion, repeat call, Cyrillic and official links',()=>{
 const {source,text}=pdfText(createPlanPdf(answers,[],font,{bankId:'tbank',reference:'TEST-PDF-1',date:'2026-10-18',nextAction:'Тестовая запись',responseDue:'Тестовый срок'},new Date('2026-10-18T12:00:00Z')));
 assert.ok(source.startsWith('%PDF-1.7'));assert.match(source,/\/FontFile2/);assert.match(source,/\/ToUnicode/);assert.match(source,/https:\/\/www.tbank.ru\/bank\/help\/protect-money\//);assert.match(text,/Ваш план действий/);assert.match(text,/Отмечено 2 из/);assert.match(text,/TEST-PDF-1/);assert.match(text,/Тестовый срок/);assert.match(text,/У меня уже было обращение/);assert.doesNotMatch(text,/Создайте отдельную папку/);
 assert.ok(text.indexOf('ОФИЦИАЛЬНЫЙ КОНТАКТ')<text.indexOf('НАЧАЛО РАЗГОВОРА'));
});
test('fully completed plan exports checklist without pending instructions',()=>{
 const ids=generatePlan(answers).map(s=>s.id);const {text}=pdfText(createPlanPdf(answers,ids,font));assert.match(text,/Впереди 0/);assert.match(text,/Вы отметили все шаги/);assert.doesNotMatch(text,/НАЧАЛО РАЗГОВОРА|ДЕЙСТВИЯ\n/);
});
