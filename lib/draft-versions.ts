import {buildDraft,type Answers} from './bereg.ts';
export type DocumentType='bank'|'police';
export type DraftVersion={text:string;fingerprint:string;createdAt:string};
export type DraftMeta={fingerprint:string;needsReview:boolean;history:DraftVersion[]};
export type DocumentVersions=Partial<Record<DocumentType,DraftMeta>>;

// Store the exact source facts, not a hash with collision or encoding ambiguity.
// This value stays in browser storage and is never sent to analytics.
export function draftFingerprint(type:DocumentType,a:Answers){return JSON.stringify({type,kind:a.kind,context:a.context||'',credit:a.credit||'',money:a.money,risk:a.risk,notes:a.notes.trim()})}
export function syncDraftVersions(documents:Record<string,string>,versions:DocumentVersions={},answers:Answers):DocumentVersions{
 const next={...versions};
 for(const type of ['bank','police'] as const){
  if(!Object.hasOwn(documents,type))continue;
  const meta=next[type];
  next[type]=meta?{...meta,needsReview:meta.needsReview||meta.fingerprint!==draftFingerprint(type,answers)}:{fingerprint:'',needsReview:true,history:[]};
 }
 return next;
}
export function draftNeedsReview(type:DocumentType,versions:DocumentVersions,answers:Answers){const meta=versions[type];return !meta||meta.needsReview||meta.fingerprint!==draftFingerprint(type,answers)}
export function acknowledgeDraft(type:DocumentType,versions:DocumentVersions,answers:Answers):DocumentVersions{
 return {...versions,[type]:{fingerprint:draftFingerprint(type,answers),needsReview:false,history:versions[type]?.history||[]}};
}
export function replaceDraft(type:DocumentType,documents:Record<string,string>,versions:DocumentVersions,answers:Answers,text=buildDraft(type,answers)){
 const meta=versions[type];const history=[...(meta?.history||[])];
 if(Object.hasOwn(documents,type))history.push({text:documents[type],fingerprint:meta?.fingerprint||'',createdAt:new Date().toISOString()});
 return {documents:{...documents,[type]:text},documentVersions:{...versions,[type]:{fingerprint:draftFingerprint(type,answers),needsReview:false,history}}};
}
