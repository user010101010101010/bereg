import {generatePlan,answerLabel,initiallyCompleted,type Answers} from './bereg.ts';
import {banks,bankScript,bankQuestions,type BankCall} from './bank-help.ts';
import {brandWidth,brandHeight,brandPdfPath} from './brand-art.ts';
import {policeGuidance,policeOnline,legalProviders,legalContext} from './legal-help.ts';

// A small PDF writer with an embedded TrueType font. The plan stays on the device.
const encoder=new TextEncoder();
const bytes=(s:string)=>encoder.encode(s);
const join=(parts:Uint8Array[])=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let at=0;for(const p of parts){out.set(p,at);at+=p.length}return out};
const hex=(s:string)=>Array.from(s).map(c=>c.charCodeAt(0).toString(16).padStart(4,'0')).join('');
function fontMetrics(font:Uint8Array){
 const d=new DataView(font.buffer,font.byteOffset,font.byteLength);const tables:Record<string,number>={};
 for(let i=0;i<d.getUint16(4);i++){const at=12+i*16;tables[String.fromCharCode(...font.slice(at,at+4))]=d.getUint32(at+8)}
 const head=tables.head,hhea=tables.hhea,units=d.getUint16(head+18),hmtx=tables.hmtx,number=d.getUint16(hhea+34),cmap=tables.cmap;
 let fmt4=0;for(let i=0;i<d.getUint16(cmap+2);i++){const sub=cmap+d.getUint32(cmap+4+i*8+4);if(d.getUint16(sub)===4)fmt4=sub}
 if(!fmt4)throw new Error('В шрифте нет таблицы кириллицы.');
 const seg=d.getUint16(fmt4+6)/2,end=fmt4+14,start=end+seg*2+2,delta=start+seg*2,range=delta+seg*2;
 function glyph(code:number){for(let i=0;i<seg;i++){if(code>d.getUint16(end+i*2)||code<d.getUint16(start+i*2))continue;const shift=d.getInt16(delta+i*2),off=d.getUint16(range+i*2);if(!off)return(code+shift)&65535;const val=d.getUint16(range+i*2+off+(code-d.getUint16(start+i*2))*2);return val?(val+shift)&65535:0}return 0}
 const width=(code:number)=>d.getUint16(hmtx+Math.min(glyph(code),number-1)*4)/units*1000;
 return {glyph,width,ascent:d.getInt16(hhea+4)/units*1000,descent:d.getInt16(hhea+6)/units*1000,bbox:[36,38,40,42].map(o=>d.getInt16(head+o)/units*1000)};
}
export function createPlanPdf(a:Answers,completed:string[],font:Uint8Array,call?:BankCall,date=new Date()):Uint8Array{
 const metrics=fontMetrics(font),chars=new Set<number>(),pages:string[][]=[],links:{page:number;x:number;y:number;w:number;url:string}[]=[];
 const green='0 .502 .298',navy='0 .122 .247',muted='.34 .40 .36',cream='.965 .969 .929',lime='.859 .902 .298';let page:string[]=[],y=0;
 function rect(x:number,top:number,w:number,h:number,color:string){page.push(`${color} rg ${x} ${842-top-h} ${w} ${h} re f`)}
 function text(s:string,x:number,top:number,size=11,color=navy){for(const c of s)chars.add(c.charCodeAt(0));page.push(`BT /F1 ${size} Tf ${color} rg 1 0 0 1 ${x} ${842-top-size} Tm <${hex(s)}> Tj ET`)}
 function wrap(s:string,size:number,max:number){const lines:string[]=[];let current='';const measure=(v:string)=>Array.from(v).reduce((n,c)=>n+metrics.width(c.charCodeAt(0))*size/1000,0);const words:string[]=[];for(const raw of s.split(/\s+/)){if(measure(raw)<=max){words.push(raw);continue}let piece='';for(const c of raw){if(measure(piece+c)>max&&piece){words.push(piece);piece=''}piece+=c}if(piece)words.push(piece)}for(const word of words){const next=current?`${current} ${word}`:word;const width=Array.from(next).reduce((n,c)=>n+metrics.width(c.charCodeAt(0))*size/1000,0);if(width>max&&current){lines.push(current);current=word}else current=next}if(current)lines.push(current);return lines}
 function newPage(label:string){page=[];pages.push(page);rect(0,0,595,842,cream);page.push(`q .58 0 0 .58 36 ${842-26-brandHeight*.58} cm ${brandPdfPath} Q`);text(label,36,79,9,muted);y=108}
 function ensure(h:number){if(y+h>780)newPage('ВАШ ПЛАН · ПРОДОЛЖЕНИЕ')}
 function paragraph(s:string,size=11,color=navy,gap=10){const lines=wrap(s,size,511);for(const line of lines){ensure(size*1.6);text(line,42,y,size,color);y+=size*1.55}y+=gap}
 function title(s:string){paragraph(s,25,navy,16)}
 function caption(s:string){ensure(33);text(s,42,y,10,green);y+=27}
 function link(label:string,url:string){ensure(25);text(label,42,y,9,green);links.push({page:pages.length-1,x:42,y:842-y-14,w:510,url});y+=22}
 completed=[...new Set([...completed,...initiallyCompleted(a)])];
 const plan=generatePlan(a),remaining=plan.filter(s=>!completed.includes(s.id)),done=plan.filter(s=>completed.includes(s.id));
 newPage('ПЕРСОНАЛЬНЫЙ ПЛАН · '+date.toLocaleDateString('ru-RU'));
 title('Ваш план действий');paragraph('После финансового обмана',16,green,22);
 rect(36,y,523,78,lime);text(`Впереди ${remaining.length} · Отмечено ${done.length} из ${plan.length}`,52,y+14,16);text('Отметки показывают выполненные задачи, а не исход обращения.',52,y+47,9);y+=105;
 paragraph(answerLabel('kind',a.kind),11,muted,18);
 caption('ВАШ ЧЕК-ЛИСТ');
 for(const [i,step] of plan.entries()){const lines=wrap(step.title,12,465);ensure(lines.length*19+25);rect(42,y+4,12,12,completed.includes(step.id)?green:'.85 .89 .82');if(completed.includes(step.id))page.push(`1 1 1 RG 1.4 w 44 ${842-y-10} m 47 ${842-y-13} l 52 ${842-y-7} l S`);for(const [j,line] of lines.entries())text((j===0?`${i+1}. `:'')+line,66,y+j*19,12,completed.includes(step.id)?muted:navy);y+=lines.length*19+16}
 paragraph('Далее - подробности только для ещё не отмеченных шагов. Отметка означает ваше действие, а не гарантированный результат разбирательства.',10,muted);
 if(y<710){page.push(`${green} rg 36 72 m 155 132 303 36 559 87 c 559 48 l 36 48 l f`)}
 if(!remaining.length)paragraph('Вы отметили все шаги. Можно сделать паузу. Материалы и черновики остаются в «Моём случае».',13,green);
 for(const step of remaining){
  newPage(step.category.toUpperCase());title(step.title);
  if(step.id==='bank'||step.id==='bankReply'){
   caption('ОФИЦИАЛЬНЫЙ КОНТАКТ');
   const selected=banks.find(bank=>bank.id===call?.bankId);
   if(selected){paragraph(selected.name+' · '+selected.phone,16,green);paragraph(selected.note,10,muted);link('Проверить номер на сайте банка',selected.url)}
   else {paragraph('Откройте поддержку в приложении или найдите номер на карте. Если вашего банка нет ниже, используйте только контакт, найденный самостоятельно.',11,muted);for(const bank of banks){paragraph(bank.name+' · '+bank.phone,12,green,2);link('Проверить на сайте банка',bank.url)}}
   paragraph('Контакты сверены 18.10.2026. Условия звонка зависят от оператора и страны.',9,muted);
   if(a.kind==='card')paragraph('Сообщите о списании без согласия без промедления. Уточните, как подать уведомление способом из договора: звонок может не заменять письменное заявление.',11,green);
   caption('НАЧАЛО РАЗГОВОРА');paragraph(bankScript(a,call),11);
   caption('ЗАПИШИТЕ ОТВЕТ БАНКА');
   paragraph('Номер обращения: '+(call?.reference||'[уточните у банка]'));
   paragraph('Дата разговора: '+(call?.date||'[дата]'));
   paragraph('Дальнейшее действие: '+(call?.nextAction||'[что нужно сделать]'));
   paragraph('Когда и как будет ответ: '+(call?.responseDue||'[уточните у сотрудника]'));
   caption('ПРИ НЕОБХОДИМОСТИ УТОЧНИТЕ');for(const q of bankQuestions)paragraph('• '+q,10,navy,9);
   paragraph('Не сообщайте ПИН, CVC/CVV, пароли и коды подтверждения операций. Не переводите деньги на «безопасный счёт».',10,green);
   continue;
  }
  paragraph(step.summary,12,muted,14);caption('ЧТО ПОДГОТОВИТЬ');paragraph(step.prepare.join(' · '),10,muted,18);
  caption('ДЕЙСТВИЯ');for(const [i,action] of step.actions.entries())paragraph((i+1)+'. '+action,11,navy,12);
  if(step.id==='police'){paragraph('Для личной подачи можно подготовить печатный текст, распечатать и подписать. Полностью писать от руки не требуется.',10,muted);link(policeGuidance.label,policeGuidance.url);link(policeOnline.label,policeOnline.url)}
  caption('КОГДА ЗАДАЧА ВЫПОЛНЕНА');paragraph(step.result,11,green);if(step.source)link(step.source.label,step.source.url);
  if(step.id==='police'){
   newPage('ЕСЛИ НУЖЕН ЮРИСТ');title('Внешняя юридическая помощь');
   paragraph('Контакты отобраны по опубликованным направлениям работы. Качество услуг, статус в реестре и готовность принять ваш случай не проверены. Бесплатный фонд и платные услуги указаны отдельно.',10,muted);
   paragraph(legalContext(a).budget,11,muted);
   for(const provider of legalProviders){caption(provider.name);paragraph(provider.price+' · '+provider.priceDetail,11,green,6);paragraph(provider.first,10,navy,6);paragraph(provider.contact,10,muted,6);link(provider.id==='fpp'?'Как получить помощь':'Услуги и условия на сайте',provider.url)}
   paragraph('Публичные цены сверены 18.10.2026. Уточняйте приём случая, объём помощи и цену напрямую. Фонд просит обращаться письменно; рассмотрение может занять до 60 календарных дней. Обращения в банк и полицию не нужно откладывать.',10,muted);
  }
 }
 for(let i=0;i<pages.length;i++){page=pages[i];rect(36,805,523,1,'.82 .86 .79');text('Берег рядом · Информация помогает сориентироваться; исход зависит от случая.',36,815,8,muted);text(`${i+1} / ${pages.length}`,520,815,8,muted)}
 const objects:Uint8Array[]=[];const add=(b:string|Uint8Array)=>{objects.push(typeof b==='string'?bytes(b):b);return objects.length};
 const stream=(data:Uint8Array,extra='')=>join([bytes(`<< /Length ${data.length} ${extra} >>\nstream\n`),data,bytes('\nendstream')]);
 add('');add('');add('');const fileId=add(stream(font,`/Length1 ${font.length}`));
 const descriptor=add(`<< /Type /FontDescriptor /FontName /Onest /Flags 32 /FontBBox [${metrics.bbox.join(' ')}] /ItalicAngle 0 /Ascent ${metrics.ascent} /Descent ${metrics.descent} /CapHeight ${metrics.ascent} /StemV 80 /FontFile2 ${fileId} 0 R >>`);
 const cidMap=new Uint8Array(131072);for(const c of chars){const gid=metrics.glyph(c);cidMap[c*2]=gid>>8;cidMap[c*2+1]=gid&255}const mapId=add(stream(cidMap));
 const widths=[...chars].sort((x,z)=>x-z).map(c=>`${c} [${Math.round(metrics.width(c))}]`).join(' ');
 const descendant=add(`<< /Type /Font /Subtype /CIDFontType2 /BaseFont /Onest /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${descriptor} 0 R /DW 1000 /W [${widths}] /CIDToGIDMap ${mapId} 0 R >>`);
 const mappings=[...chars].map(c=>`<${c.toString(16).padStart(4,'0')}> <${c.toString(16).padStart(4,'0')}>`);let cmap='/CIDInit /ProcSet findresource begin 12 dict begin begincmap /CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def /CMapName /OnestUnicode def /CMapType 2 def 1 begincodespacerange <0000> <FFFF> endcodespacerange\n';for(let i=0;i<mappings.length;i+=90){const part=mappings.slice(i,i+90);cmap+=`${part.length} beginbfchar\n${part.join('\n')}\nendbfchar\n`}cmap+='endcmap CMapName currentdict /CMap defineresource pop end end';const unicodeId=add(stream(bytes(cmap)));
 objects[2]=bytes(`<< /Type /Font /Subtype /Type0 /BaseFont /Onest /Encoding /Identity-H /DescendantFonts [${descendant} 0 R] /ToUnicode ${unicodeId} 0 R >>`);
 const kids:number[]=[];for(const [i,commands] of pages.entries()){const content=add(stream(bytes(commands.join('\n'))));const annotations=links.filter(l=>l.page===i).map(l=>add(`<< /Type /Annot /Subtype /Link /Rect [${l.x} ${l.y} ${l.x+l.w} ${l.y+15}] /Border [0 0 0] /A << /S /URI /URI (${l.url.replace(/[()\\]/g,'\\$&')}) >> >>`));kids.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${content} 0 R /Annots [${annotations.map(n=>`${n} 0 R`).join(' ')}] >>`))}
 objects[0]=bytes('<< /Type /Catalog /Pages 2 0 R >>');objects[1]=bytes(`<< /Type /Pages /Count ${kids.length} /Kids [${kids.map(n=>`${n} 0 R`).join(' ')}] >>`);
 const parts=[bytes('%PDF-1.7\n')],offsets=[0];let length=parts[0].length;for(const [i,o] of objects.entries()){offsets.push(length);const block=join([bytes(`${i+1} 0 obj\n`),o,bytes('\nendobj\n')]);parts.push(block);length+=block.length}parts.push(bytes(`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(o=>`${String(o).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${length}\n%%EOF\n`));return join(parts);
}
