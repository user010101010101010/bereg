import{a as e,c as t,i as n,n as r,o as i,r as a,s as o,t as s}from"./index-D1z3PANO.js";var c=`q
14 0 m 50 0 l 57.732 0 64 6.268 64 14 c 64 50 l 64 57.732 57.732 64 50 64 c 14 64 l 6.268 64 0 57.732 0 50 c 0 14 l 0 6.268 6.268 0 14 0 c h W n
.455 .765 .396 rg 0 0 64 64 re f
.965 .969 .929 rg 0 40 m 26 54 37 18 64 28 c 64 0 l 0 0 l h f
0 .502 .298 rg 0 30 m 25 43 35 8 64 20 c 64 0 l 0 0 l h f
Q
0 .502 .298 rg
83.9200 16.0000 m
83.9200 56.3200 l
108.8212 56.3200 l
108.8212 52.3814 l
88.0266 52.3814 l
88.0266 40.6400 l
99.4880 40.6400 l
101.8163 40.6400 105.4304 40.0097 107.6219 38.3113 c
113.4832 33.7691 113.4926 22.8709 107.6313 18.3287 c
105.4444 16.6339 101.8641 16.0000 99.4880 16.0000 c
h
88.0266 19.9386 m
99.3760 19.9386 l
100.0604 19.9386 101.0186 20.0132 101.8773 20.1626 c
110.6421 21.8997 109.5820 36.0956 100.5613 36.6594 c
100.1133 36.6874 99.7182 36.7014 99.3760 36.7014 c
88.0266 36.7014 l
h
f
127.4506 15.1600 m
118.6400 15.1600 112.9840 21.3947 112.9840 30.9893 c
112.9840 40.9013 118.5653 47.0800 127.3013 47.0800 c
136.2613 47.0800 141.5159 40.6400 141.1986 29.9627 c
137.0081 29.9627 l
137.0081 31.4187 l
136.8587 39.2712 133.5982 43.3094 127.4133 43.3094 c
120.9048 43.3094 117.3519 38.9227 117.3519 31.1200 c
117.3519 23.4915 120.9421 19.0986 127.3013 19.0986 c
131.6320 19.0986 134.9174 21.1644 136.7841 24.9226 c
140.6293 23.4480 l
138.2275 18.1715 133.3244 15.1600 127.4506 15.1600 c
h
115.8959 29.9627 m
115.8959 33.4160 l
139.0053 33.4160 l
139.0053 29.9627 l
h
f
157.8866 15.1600 m
149.5426 15.1600 144.9880 22.1227 144.9880 31.1573 c
144.9880 40.3040 149.5426 47.0800 158.0546 47.0800 c
166.3613 47.0800 171.3079 40.1733 171.3079 31.1573 c
171.3079 22.0853 166.3800 15.1600 157.8866 15.1600 c
h
144.2973 2.5600 m
144.2973 46.2400 l
147.9932 46.2400 l
147.9932 23.4666 l
148.4226 23.4666 l
148.4226 2.5600 l
h
157.4760 18.9866 m
170.0434 18.9866 170.4655 43.2534 157.3827 43.2534 c
151.0919 43.2534 147.9932 38.2507 147.9932 31.1573 c
147.9932 24.1386 151.0359 18.9866 157.4760 18.9866 c
h
f
187.1746 15.1600 m
178.3640 15.1600 172.7080 21.3947 172.7080 30.9893 c
172.7080 40.9013 178.2893 47.0800 187.0253 47.0800 c
195.9853 47.0800 201.2399 40.6400 200.9226 29.9627 c
196.7321 29.9627 l
196.7321 31.4187 l
196.5827 39.2712 193.3222 43.3094 187.1373 43.3094 c
180.6288 43.3094 177.0759 38.9227 177.0759 31.1200 c
177.0759 23.4915 180.6661 19.0986 187.0253 19.0986 c
191.3560 19.0986 194.6414 21.1644 196.5081 24.9226 c
200.3533 23.4480 l
197.9515 18.1715 193.0484 15.1600 187.1746 15.1600 c
h
175.6199 29.9627 m
175.6199 33.4160 l
198.7293 33.4160 l
198.7293 29.9627 l
h
f
204.0400 16.0000 m
204.0400 46.2400 l
224.7600 46.2400 l
224.7600 42.3014 l
208.1466 42.3014 l
208.1466 16.0000 l
h
f`,l=new TextEncoder,u=e=>l.encode(e),d=e=>{let t=new Uint8Array(e.reduce((e,t)=>e+t.length,0)),n=0;for(let r of e)t.set(r,n),n+=r.length;return t},f=e=>Array.from(e).map(e=>e.charCodeAt(0).toString(16).padStart(4,`0`)).join(``);function p(e){let t=new DataView(e.buffer,e.byteOffset,e.byteLength),n={};for(let r=0;r<t.getUint16(4);r++){let i=12+r*16;n[String.fromCharCode(...e.slice(i,i+4))]=t.getUint32(i+8)}let r=n.head,i=n.hhea,a=t.getUint16(r+18),o=n.hmtx,s=t.getUint16(i+34),c=n.cmap,l=0;for(let e=0;e<t.getUint16(c+2);e++){let n=c+t.getUint32(c+4+e*8+4);t.getUint16(n)===4&&(l=n)}if(!l)throw Error(`В шрифте нет таблицы кириллицы.`);let u=t.getUint16(l+6)/2,d=l+14,f=d+u*2+2,p=f+u*2,m=p+u*2;function h(e){for(let n=0;n<u;n++){if(e>t.getUint16(d+n*2)||e<t.getUint16(f+n*2))continue;let r=t.getInt16(p+n*2),i=t.getUint16(m+n*2);if(!i)return e+r&65535;let a=t.getUint16(m+n*2+i+(e-t.getUint16(f+n*2))*2);return a?a+r&65535:0}return 0}return{glyph:h,width:e=>t.getUint16(o+Math.min(h(e),s-1)*4)/a*1e3,ascent:t.getInt16(i+4)/a*1e3,descent:t.getInt16(i+6)/a*1e3,bbox:[36,38,40,42].map(e=>t.getInt16(r+e)/a*1e3)}}function m(l,m,h,g,_=new Date){let v=p(h),y=new Set,b=[],x=[],S=`0 .502 .298`,C=`0 .122 .247`,w=`.34 .40 .36`,T=[],E=0;function D(e,t,n,r,i){T.push(`${i} rg ${e} ${842-t-r} ${n} ${r} re f`)}function O(e,t,n,r=11,i=C){for(let t of e)y.add(t.charCodeAt(0));T.push(`BT /F1 ${r} Tf ${i} rg 1 0 0 1 ${t} ${842-n-r} Tm <${f(e)}> Tj ET`)}function k(e,t,n){let r=[],i=``,a=e=>Array.from(e).reduce((e,n)=>e+v.width(n.charCodeAt(0))*t/1e3,0),o=[];for(let t of e.split(/\s+/)){if(a(t)<=n){o.push(t);continue}let e=``;for(let r of t)a(e+r)>n&&e&&(o.push(e),e=``),e+=r;e&&o.push(e)}for(let e of o){let a=i?`${i} ${e}`:e;Array.from(a).reduce((e,n)=>e+v.width(n.charCodeAt(0))*t/1e3,0)>n&&i?(r.push(i),i=e):i=a}return i&&r.push(i),r}function A(e){T=[],b.push(T),D(0,0,595,842,`.965 .969 .929`),T.push(`q .58 0 0 .58 36 ${816-64*.58} cm ${c} Q`),O(e,36,79,9,w),E=108}function j(e){E+e>780&&A(`ВАШ ПЛАН · ПРОДОЛЖЕНИЕ`)}function M(e,t=11,n=C,r=10){let i=k(e,t,511);for(let e of i)j(t*1.6),O(e,42,E,t,n),E+=t*1.55;E+=r}function N(e){M(e,25,C,16)}function P(e){j(33),O(e,42,E,10,S),E+=27}function F(e,t){j(25),O(e,42,E,9,S),x.push({page:b.length-1,x:42,y:842-E-14,w:510,url:t}),E+=22}let I=t(l),L=I.filter(e=>!m.includes(e.id)),R=I.filter(e=>m.includes(e.id));A(`ПЕРСОНАЛЬНЫЙ ПЛАН · `+_.toLocaleDateString(`ru-RU`)),N(`Один шаг за раз.`),M(`Ваши действия после мошенничества`,16,S,22),D(36,E,523,78,`.859 .902 .298`),O(`Впереди ${L.length} · Отмечено ${R.length} из ${I.length}`,52,E+14,16),O(`Можно действовать в своём темпе и делать паузы.`,52,E+47,10),E+=105,M(o(`kind`,l.kind),11,w,18),P(`ВАШ ЧЕК-ЛИСТ`);for(let[e,t]of I.entries()){let n=k(t.title,12,465);j(n.length*19+25),D(42,E+4,12,12,m.includes(t.id)?S:`.85 .89 .82`),m.includes(t.id)&&T.push(`1 1 1 RG 1.4 w 44 ${842-E-10} m 47 ${842-E-13} l 52 ${842-E-7} l S`);for(let[r,i]of n.entries())O((r===0?`${e+1}. `:``)+i,66,E+r*19,12,m.includes(t.id)?w:C);E+=n.length*19+16}M(`Далее - подробности только для ещё не отмеченных шагов. Отметка означает ваше действие, а не гарантированный результат разбирательства.`,10,w),E<710&&T.push(`${S} rg 36 72 m 155 132 303 36 559 87 c 559 48 l 36 48 l f`),L.length||M(`Вы отметили все шаги. Можно сделать паузу. Материалы и черновики остаются в «Моём случае».`,13,S);for(let t of L){A(t.category.toUpperCase()),N(t.title),M(t.summary,12,w,14),P(`ЧТО ПОДГОТОВИТЬ`),M(t.prepare.join(` · `),10,w,18),P(`ДЕЙСТВИЯ`);for(let[e,n]of t.actions.entries())M(`${e+1}. ${n}`,11,C,12);if(t.id===`police`&&(M(`Для личной подачи можно подготовить печатный текст, распечатать и подписать. Полностью писать от руки не требуется.`,9,w),F(a.label,a.url)),P(`КАК ПОНЯТЬ, ЧТО ШАГ СДЕЛАН`),M(t.result,11,S),t.source&&F(t.source.label,t.source.url),t.id===`police`){A(`ЮРИДИЧЕСКАЯ ПОМОЩЬ · ПУБЛИЧНЫЕ КОНТАКТЫ`),N(`Если нужен разбор документов`),M(s(l).budget,11,w);for(let e of r)P(e.name),M(e.price+` · `+e.priceDetail,11,S,6),M(e.first,10,C,6),M(e.contact,10,w,6),F(`Услуги и условия на сайте`,e.url);M(`Публичные цены сверены 17.10.2026. Подбор по заявленным направлениям не гарантирует результат. Приём случая, объём помощи и цену уточняйте напрямую. Фонд просит обращаться письменно; рассмотрение может занять до 60 дней. Банк и полицию не нужно откладывать.`,9,w)}if(t.id===`bank`||t.id===`bankReply`){A(`ПАМЯТКА ДЛЯ ЗВОНКА В БАНК`),N(`Сначала - связь с банком`),M(`Наберите номер сами или откройте поддержку в официальном приложении. Это общие линии поддержки: попросите зарегистрировать сообщение о мошенничестве.`,11,w);for(let e of i)M(`${e.name} · ${e.phone}`,12,S,2),F(`Официальная страница банка`,e.url);M(`Контакты проверены 17.10.2026. Условия звонков зависят от оператора и страны.`,9,w),P(`КАК НАЧАТЬ РАЗГОВОР`),M(e(l),11),A(`ПАМЯТКА ДЛЯ ЗВОНКА · ВОПРОСЫ И ЗАМЕТКИ`),N(`Что важно уточнить`);for(let e of n)M(`• `+e,10,C,9);(g?.reference||g?.nextAction)&&(P(`ВАШИ ЗАМЕТКИ`),g.reference&&M(`Номер обращения: `+g.reference),g.date&&M(`Дата: `+g.date),g.nextAction&&M(g.nextAction)),M(`Не сообщайте ПИН, CVC/CVV, пароли и коды подтверждения операций. Не переводите деньги на «безопасный счёт».`,10,S)}}for(let e=0;e<b.length;e++)T=b[e],D(36,805,523,1,`.82 .86 .79`),O(`Берег рядом · Информация помогает сориентироваться; исход зависит от случая.`,36,815,8,w),O(`${e+1} / ${b.length}`,520,815,8,w);let z=[],B=e=>(z.push(typeof e==`string`?u(e):e),z.length),V=(e,t=``)=>d([u(`<< /Length ${e.length} ${t} >>\nstream\n`),e,u(`
endstream`)]);B(``),B(``),B(``);let H=B(V(h,`/Length1 ${h.length}`)),U=B(`<< /Type /FontDescriptor /FontName /Onest /Flags 32 /FontBBox [${v.bbox.join(` `)}] /ItalicAngle 0 /Ascent ${v.ascent} /Descent ${v.descent} /CapHeight ${v.ascent} /StemV 80 /FontFile2 ${H} 0 R >>`),W=new Uint8Array(131072);for(let e of y){let t=v.glyph(e);W[e*2]=t>>8,W[e*2+1]=t&255}let G=B(V(W)),K=B(`<< /Type /Font /Subtype /CIDFontType2 /BaseFont /Onest /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${U} 0 R /DW 1000 /W [${[...y].sort((e,t)=>e-t).map(e=>`${e} [${Math.round(v.width(e))}]`).join(` `)}] /CIDToGIDMap ${G} 0 R >>`),q=[...y].map(e=>`<${e.toString(16).padStart(4,`0`)}> <${e.toString(16).padStart(4,`0`)}>`),J=`/CIDInit /ProcSet findresource begin 12 dict begin begincmap /CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def /CMapName /OnestUnicode def /CMapType 2 def 1 begincodespacerange <0000> <FFFF> endcodespacerange
`;for(let e=0;e<q.length;e+=90){let t=q.slice(e,e+90);J+=`${t.length} beginbfchar\n${t.join(`
`)}\nendbfchar\n`}J+=`endcmap CMapName currentdict /CMap defineresource pop end end`,z[2]=u(`<< /Type /Font /Subtype /Type0 /BaseFont /Onest /Encoding /Identity-H /DescendantFonts [${K} 0 R] /ToUnicode ${B(V(u(J)))} 0 R >>`);let Y=[];for(let[e,t]of b.entries()){let n=B(V(u(t.join(`
`)))),r=x.filter(t=>t.page===e).map(e=>B(`<< /Type /Annot /Subtype /Link /Rect [${e.x} ${e.y} ${e.x+e.w} ${e.y+15}] /Border [0 0 0] /A << /S /URI /URI (${e.url.replace(/[()\\]/g,`\\$&`)}) >> >>`));Y.push(B(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${n} 0 R /Annots [${r.map(e=>`${e} 0 R`).join(` `)}] >>`))}z[0]=u(`<< /Type /Catalog /Pages 2 0 R >>`),z[1]=u(`<< /Type /Pages /Count ${Y.length} /Kids [${Y.map(e=>`${e} 0 R`).join(` `)}] >>`);let X=[u(`%PDF-1.7
`)],Z=[0],Q=X[0].length;for(let[e,t]of z.entries()){Z.push(Q);let n=d([u(`${e+1} 0 obj\n`),t,u(`
endobj
`)]);X.push(n),Q+=n.length}return X.push(u(`xref\n0 ${z.length+1}\n0000000000 65535 f \n${Z.slice(1).map(e=>`${String(e).padStart(10,`0`)} 00000 n \n`).join(``)}trailer\n<< /Size ${z.length+1} /Root 1 0 R >>\nstartxref\n${Q}\n%%EOF\n`)),d(X)}export{m as createPlanPdf};