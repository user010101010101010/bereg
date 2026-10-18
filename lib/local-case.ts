import {z} from 'zod';
import {choices,emptyAnswers,generatePlan,initiallyCompleted,steps,type SavedCase} from './bereg.ts';
import {getPlanProgress} from './plan-progress.ts';
import {syncDraftVersions} from './draft-versions.ts';

const suffix=()=>new URL('.',window.location.href).pathname;
const legacyKey=()=>`bereg:case:v1:${suffix()}`;
const storageKey=()=>`bereg:cases:v2:${suffix()}`;
const choice=(key:keyof typeof choices)=>z.string().refine(value=>(key!=='already'&&value==='')||choices[key].some(([id])=>id===value)||(key==='kind'&&['investment','credit'].includes(value)));
const draftMeta=z.object({fingerprint:z.string().max(20000),needsReview:z.boolean(),history:z.array(z.object({text:z.string().max(12000),fingerprint:z.string().max(20000),createdAt:z.string()}))});
const payloadSchema=z.object({
 answers:z.object({risk:choice('risk'),timing:choice('timing'),kind:choice('kind'),context:choice('context').optional(),credit:choice('credit').optional(),money:choice('money'),impact:choice('impact'),amount:choice('amount'),already:z.array(choice('already')).max(4),mood:choice('mood'),support:choice('support'),notes:z.string().max(4000)}).strict(),
 documents:z.record(z.enum(['bank','police']),z.string().max(12000)),
 documentVersions:z.object({bank:draftMeta.optional(),police:draftMeta.optional()}).optional(),
 focusStep:z.string().max(40).nullable(),
 completedSteps:z.array(z.string().refine(id=>Object.hasOwn(steps,id))).max(32).default([]),
 questionnaireStep:z.number().int().min(0).max(4).default(0),
 intakeFurthest:z.number().int().min(0).max(4).default(0),
 intakeCompleted:z.boolean().optional(),
 role:z.enum(['self','helper']).default('self'),
 goalProgress:z.object({onboardingStarted:z.boolean(),planReceived:z.boolean()}).optional(),
 shorePractice:z.enum(['shown','collapsed','completed']).optional(),
 bankCall:z.object({bankId:z.enum(['','other','sber','vtb','alfa','tbank','gpb']).default(''),reference:z.string().max(160),date:z.string().max(40),nextAction:z.string().max(2000),responseDue:z.string().max(160).optional()}).default({bankId:'',reference:'',date:'',nextAction:''}),
});
const storedSchema=payloadSchema.extend({id:z.string(),updatedAt:z.string().datetime()});
const envelopeSchema=z.object({version:z.literal(2),activeId:z.string().nullable(),cases:z.array(storedSchema)});
type Envelope={version:2;activeId:string|null;cases:SavedCase[]};
export type CaseInput=Omit<SavedCase,'id'|'updatedAt'|'completedSteps'>&{id?:string;completedSteps?:string[]};
function normalize(value:SavedCase):SavedCase{
 const plan=generatePlan(value.answers);
 return {...value,focusStep:plan.some(s=>s.id===value.focusStep)?value.focusStep:null,
  intakeCompleted:value.intakeCompleted??['risk','timing','kind','money','impact','amount','mood','support'].every(key=>Boolean(value.answers[key as keyof typeof value.answers])),
  completedSteps:getPlanProgress(plan,[...value.completedSteps,...initiallyCompleted(value.answers)]).completed,
  documentVersions:syncDraftVersions(value.documents,value.documentVersions,value.answers)};
}
function readEnvelope():Envelope{
 let raw:string|null,legacy:string|null;
 try{raw=window.localStorage.getItem(storageKey());legacy=raw?null:window.localStorage.getItem(legacyKey())}
 catch{throw new Error('Браузер запрещает хранение данных. Можно продолжить без сохранения и скачать результат.')}
 try{
  if(raw){const data=envelopeSchema.parse(JSON.parse(raw));if(data.activeId&&!data.cases.some(c=>c.id===data.activeId))throw new Error();return data}
  if(legacy){const value=storedSchema.parse(JSON.parse(legacy));return {version:2,activeId:value.id,cases:[value]}}
  return {version:2,activeId:null,cases:[]};
 }catch{throw new Error('Не удалось прочитать сохранённые данные. Они не удалены и не перезаписаны. Скачайте копию и попробуйте открыть сайт в прежнем браузере.')}
}
function writeEnvelope(data:Envelope){
 try{window.localStorage.setItem(storageKey(),JSON.stringify(data))}
 catch{throw new Error('Не удалось сохранить изменения. Скачайте данные или разрешите хранение для этого сайта в настройках браузера.')}
}
export function loadLocalCases():SavedCase[]{return readEnvelope().cases.map(value=>normalize(value as SavedCase))}
export function loadLocalCase():SavedCase|null{const data=readEnvelope();const value=data.cases.find(c=>c.id===data.activeId);return value?normalize(value as SavedCase):null}
export function saveLocalCase(input:CaseInput):SavedCase{
 const data=payloadSchema.parse(input);
 const envelope=readEnvelope();
 const id=input.id||envelope.activeId||crypto.randomUUID();
 if(input.id&&!envelope.cases.some(c=>c.id===input.id))throw new Error('Этот случай больше не сохранён. Скачайте текущие данные перед созданием нового.');
 const value=normalize({...data,id,updatedAt:new Date().toISOString()} as SavedCase);
 if(value.focusStep!==data.focusStep&&data.focusStep)throw new Error('Этот шаг больше не входит в план. Откройте список задач заново.');
 const cases=envelope.cases.some(c=>c.id===id)?envelope.cases.map(c=>c.id===id?value:c):[...envelope.cases,value];
 writeEnvelope({version:2,activeId:id,cases});return value;
}
export function createLocalCase(role:'self'|'helper'):SavedCase{
 const envelope=readEnvelope();const value:SavedCase={id:crypto.randomUUID(),answers:{...emptyAnswers,already:[]},documents:{},documentVersions:{},focusStep:null,completedSteps:[],role,questionnaireStep:0,intakeFurthest:0,updatedAt:new Date().toISOString()};
 value.intakeCompleted=false;writeEnvelope({...envelope,activeId:value.id,cases:[...envelope.cases,value]});return value;
}
export function activateLocalCase(id:string){const envelope=readEnvelope();if(!envelope.cases.some(c=>c.id===id))throw new Error('Случай не найден. Обновите список.');writeEnvelope({...envelope,activeId:id});return loadLocalCase()!}
export function exportStoredData(){return JSON.stringify({current:window.localStorage.getItem(storageKey()),legacy:window.localStorage.getItem(legacyKey())},null,2)}
export function removeLocalCase(id?:string){
 const envelope=readEnvelope();const target=id||envelope.activeId;if(!target)return;
 const cases=envelope.cases.filter(c=>c.id!==target);
 writeEnvelope({version:2,activeId:cases.at(-1)?.id||null,cases});
 const legacy=window.localStorage.getItem(legacyKey());
 if(legacy){try{if(JSON.parse(legacy).id===target)window.localStorage.removeItem(legacyKey())}catch{/* Keep an unreadable legacy backup. */}}
}
