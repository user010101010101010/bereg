export type ArticleProgress={checked:string[];answer:number|null;read:boolean};
export const emptyArticleProgress:ArticleProgress={checked:[],answer:null,read:false};
const key=()=>`bereg:reading:v1:${new URL('.',window.location.href).pathname}`;
function all():Record<string,ArticleProgress>{
 try {const value=JSON.parse(window.localStorage.getItem(key())||'{}');if(!value||typeof value!=='object'||Array.isArray(value))return {};return value} catch{return {}}
}
export function loadArticleProgress(id:string):ArticleProgress{
 const value=all()[id];if(!value||typeof value!=='object')return {...emptyArticleProgress,checked:[]};
 return {checked:Array.isArray(value.checked)?[...new Set<string>(value.checked.filter((x:unknown)=>typeof x==='string'&&['0','1','2'].includes(x)))]:[],answer:typeof value.answer==='number'&&Number.isInteger(value.answer)&&value.answer>=0&&value.answer<3?value.answer:null,read:value.read===true};
}
export function saveArticleProgress(id:string,value:ArticleProgress){
 const records=all();window.localStorage.setItem(key(),JSON.stringify({...records,[id]:value}));window.dispatchEvent(new Event('bereg:reading'));return value;
}
export function readArticleIds(){return Object.entries(all()).filter(([,v])=>v&&v.read===true).map(([id])=>id)}
