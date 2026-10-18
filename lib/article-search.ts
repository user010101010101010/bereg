import {articles} from './bereg.ts';
import {guides} from './article-content.ts';
export const normalizeSearch=(value:string)=>value.toLocaleLowerCase('ru-RU').replaceAll('ё','е').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
function stem(word:string){
 if(/^стыд/.test(word))return 'стыд';
 if(/^спис[аы]/.test(word))return 'спис';
 if(/^близ/.test(word))return 'близ';
 return word.length>4?word.replace(/(иями|ями|ами|ого|ему|ому|ыми|ими|иях|ах|ях|ией|иям|ию|ия|ие|ии|ий|ый|ой|ая|ое|ые|ов|ев|ам|ом|ем|ы|а|я|у|ю|е|и|о)$/u,''):word;
}
const words=(value:string)=>normalizeSearch(value).split(' ').filter(Boolean).map(stem);
export function searchArticles(query:string){
 const terms=words(query).filter(w=>w.length>1);if(!terms.length)return articles;
 return articles.map(article=>{
  const guide=guides[article.id];const title=words(article.title+' '+article.summary+' '+guide.keywords.join(' '));
  const body=words(guide.quick.join(' ')+' '+guide.sections.map(section=>section.title+' '+section.paragraphs.join(' ')+' '+(section.list||[]).join(' ')).join(' '));
  const matches=(term:string,list:string[])=>list.some(word=>word===term||(term.length>=4&&word.length>=4&&(word.startsWith(term)||term.startsWith(word))));
  const found=terms.every(term=>matches(term,title)||matches(term,body));
  return {article,score:found?terms.reduce((score,term)=>score+(matches(term,title)?4:1),0):0};
 }).filter(value=>value.score>0).sort((a,b)=>b.score-a.score).map(value=>value.article);
}
