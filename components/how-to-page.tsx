import {useEffect,useRef,useState} from 'react';
import {ArrowRight,ChevronDown,Users} from 'lucide-react';

export const howSections=[
 {id:'how-intake',label:'Как составить план'},
 {id:'how-plan',label:'Как пользоваться планом'},
 {id:'how-step',label:'Как выполнить шаг'},
 {id:'how-draft',label:'Как подготовить обращение'},
 {id:'how-case',label:'Где найти записи'},
 {id:'how-helper',label:'Если помогаете близкому'},
 {id:'how-faq',label:'Частые вопросы'},
] as const;
export const howQuestions=[
 ['Сервис сам отправит обращение?','Нет. Сообщение нужно самостоятельно отправить в банк, а заявление — подать в полицию. Перед отправкой проверьте факты и требования получателя.'],
 ['«Берег» может вернуть деньги?','Нет. Сервис помогает составить план и подготовить документы, но не возвращает деньги и не гарантирует возврат.'],
 ['Можно изменить ответы?','Да. В опросе нажмите «Назад» или название пройденного этапа. На телефоне список этапов раскрывается над вопросом. Из плана выберите «Изменить ответы». План обновится по новым ответам.'],
 ['Где сохраняются мои записи?','В этом браузере на этом устройстве. Проверяйте надпись «Сохранено в этом браузере». Очистка данных сайта удалит записи. В приватном режиме они могут исчезнуть после закрытия окна. Если вы выбрали «Продолжить без сохранения», данные останутся только до закрытия страницы: заранее скачайте нужные документы.'],
 ['Можно продолжить с другого устройства?','Автоматической синхронизации нет. Чтобы продолжить с сохранёнными записями, откройте сайт на том же устройстве и в том же браузере.'],
 ['Что произойдёт, если удалить свой случай?','После подтверждения из текущего браузера удалятся ответы этого случая, отметки задач, заметки о банке, черновики и их прежние версии. Другие случаи останутся. Перед удалением можно скачать данные. Скачанные файлы и сведения в сторонних сервисах не удаляются.'],
 ['Что делать, если подходящего ответа нет?','Выберите «Не знаю» или «Пока неясно…», если такой вариант есть. Необязательный вопрос можно пропустить. Если ни один вариант не подходит, не отмечайте неверный ответ: статьи доступны и без завершения опроса.'],
] as const;

export const howShots=[
 {src:'./images/how/intake-mobile.jpg',width:750,height:936,alt:'Мобильная анкета: вопрос о безопасности и варианты ответа о доступе к деньгам и аккаунтам.',caption:'Выберите подходящий ответ.'},
 {src:'./images/how/plan-mobile.jpg',width:750,height:936,alt:'Мобильный план действий: ближайший шаг в карточке «Дальше» и список остальных задач.',caption:'Ближайшее действие — в карточке «Дальше».'},
 {src:'./images/how/bank-mobile.jpg',width:750,height:936,alt:'Мобильная инструкция банковского шага: выбор банка и его официальный телефон для обращения.',caption:'Выберите банк и проверьте официальный контакт.'},
 {src:'./images/how/draft-mobile.jpg',width:750,height:936,alt:'Мобильный редактор сообщения для банка с вымышленным текстом и действиями копирования и скачивания.',caption:'Проверьте текст, затем скопируйте или скачайте его.'},
 {src:'./images/how/case-mobile.jpg',width:750,height:936,alt:'Мобильный раздел «Мой случай»: сохранённое сообщение в банк и черновик заявления в полицию.',caption:'Сохранённые тексты — в блоке «Черновики».'},
] as const;
type Props={primaryLabel:string;onPrimary:()=>void;loading:boolean;onMaterials:()=>void;onHelper:()=>void};

export function HowToPage({primaryLabel,onPrimary,loading,onMaterials,onHelper}:Props){
 const [active,setActive]=useState<string>(howSections[0].id);const mobileToc=useRef<HTMLDetailsElement>(null);const showPrimary=primaryLabel!=='Открыть мой случай';
 useEffect(()=>{
  let pending=0;
  const update=()=>{pending=0;let current:string=howSections[0].id;for(const section of howSections){const el=document.getElementById(section.id);if(el&&el.getBoundingClientRect().top<=155)current=section.id}setActive(current)};
  const schedule=()=>{if(!pending)pending=window.requestAnimationFrame(update)};
  update();const initial=window.location.hash.slice(1);if(howSections.some(section=>section.id===initial))jump(initial);window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  return()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);if(pending)window.cancelAnimationFrame(pending)};
 },[]);
 function jump(id:string){
  if(mobileToc.current)mobileToc.current.open=false;
  window.requestAnimationFrame(()=>{const section=document.getElementById(id);if(!section)return;section.scrollIntoView({block:'start',behavior:'instant'});section.focus({preventScroll:true});setActive(id);const url=new URL(window.location.href);url.hash=id;window.history.replaceState(null,'',url.pathname+url.search+url.hash)});
 }
 const contents=<ol>{howSections.map((section,i)=><li key={section.id}><a href={'#'+section.id} aria-current={active===section.id?'location':undefined} onClick={event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();jump(section.id)}}>{i<5&&<span aria-hidden="true">{i+1}.</span>}{section.label}</a></li>)}</ol>;
 const shot=(index:number)=><figure className="how-shot"><div className="how-shot-frame"><img src={howShots[index].src} alt={howShots[index].alt} loading="lazy" width={howShots[index].width} height={howShots[index].height}/></div><figcaption>{howShots[index].caption}</figcaption></figure>;
 return <article className="how-page" aria-labelledby="how-title">
  <header className="how-heading"><div><h1 id="how-title">Как пользоваться «Берегом»</h1><p>Как составить план, подготовить обращения и вернуться к своим записям. Выберите нужный раздел ниже.</p></div>{showPrimary&&<button className="button primary" onClick={onPrimary} disabled={loading}>{primaryLabel}<ArrowRight size={18} aria-hidden="true"/></button>}</header>
  <div className="how-layout">
   <nav className="how-toc" aria-label="Разделы инструкции"><div className="how-toc-desktop"><h2>Что нужно узнать?</h2>{contents}</div><details ref={mobileToc} className="how-toc-mobile"><summary>Перейти к разделу<ChevronDown size={18} aria-hidden="true"/></summary>{contents}</details></nav>
   <div className="how-content">
    <section className="how-section" id="how-intake" tabIndex={-1} aria-labelledby="how-intake-title"><div className="how-section-copy"><span className="how-number" aria-hidden="true">01</span><h2 id="how-intake-title">Расскажите, что произошло</h2><p>Ответьте на несколько вопросов о случившемся. По ответам «Берег» составит план действий.</p><ol className="how-actions"><li>Выберите ответы об операции и потерянных деньгах.</li><li>Укажите, что беспокоит вас больше всего.</li><li>Нажимайте «Продолжить», а в конце — «Получить план действий».</li></ol><p className="how-location">Вопросы с пометкой «Необязательно» можно пропустить.</p><p className="how-note">Не вводите пароли, коды подтверждения и полные реквизиты карты.</p></div>{shot(0)}</section>
    <section className="how-section" id="how-plan" tabIndex={-1} aria-labelledby="how-plan-title"><div className="how-section-copy"><span className="how-number" aria-hidden="true">02</span><h2 id="how-plan-title">Откройте свой план</h2><p>План учитывает ваши ответы и то, что вы уже сделали.</p><ol className="how-actions"><li>В карточке «Дальше» показан ближайший шаг. Нажмите «Открыть инструкцию».</li><li>Чтобы выбрать другой шаг, нажмите на его название ниже. Можно открывать шаги в удобном порядке.</li></ol><details className="how-more"><summary>Как вернуться к выполненному</summary><p>Раскройте «Вы уже сделали». Инструкции доступны и после выполнения, отметки можно снять. План можно скачать кнопкой «Скачать план (PDF)».</p></details></div>{shot(1)}</section>
    <section className="how-section" id="how-step" tabIndex={-1} aria-labelledby="how-step-title"><div className="how-section-copy"><span className="how-number" aria-hidden="true">03</span><h2 id="how-step-title">Выполните один шаг</h2><p>Например, в банковском шаге есть контакт, начало разговора и поля для результата.</p><ol className="how-actions"><li>Выберите банк и проверьте номер по ссылке «Проверить номер на сайте».</li><li>Прочитайте начало разговора. После звонка заполните поля «Запишите ответ банка».</li><li>Когда действие сделано, поставьте отметку «Этот шаг выполнен» внизу инструкции.</li></ol><p className="how-location">Заметки о звонке появятся в «Моём случае».</p></div>{shot(2)}</section>
    <section className="how-section" id="how-draft" tabIndex={-1} aria-labelledby="how-draft-title"><div className="how-section-copy"><span className="how-number" aria-hidden="true">04</span><h2 id="how-draft-title">Подготовьте обращение</h2><p>Черновик можно отредактировать под свои обстоятельства.</p><ol className="how-actions"><li>В банковском шаге нажмите «Подготовить сообщение», в шаге заявления в полицию — «Заполнить черновик».</li><li>Проверьте, всё ли верно, и при необходимости измените текст. Заполните места в квадратных скобках.</li><li>Нажмите «Скопировать текст» или «Скачать TXT».</li></ol><p className="how-note">Сообщение нужно самостоятельно отправить в банк, а заявление — подать в полицию.</p><details className="how-more"><summary>Если изменились ответы</summary><p>Если новые ответы повлияют на документ, «Берег» предложит проверить черновик. Выберите «Создать новый черновик» или, после проверки, «Оставить мой текст». Предыдущая версия сохранится в разделе «Прежние версии».</p></details><details className="how-more"><summary>Если текст не копируется</summary><p>Выделите текст в редакторе и скопируйте вручную. Если показано предупреждение о прежних данных, сначала проверьте черновик.</p></details></div>{shot(3)}</section>
    <section className="how-section" id="how-case" tabIndex={-1} aria-labelledby="how-case-title"><div className="how-section-copy"><span className="how-number" aria-hidden="true">05</span><h2 id="how-case-title">Вернитесь к своим записям</h2><p>В «Моём случае» находятся ответы, черновики и заметки о банке.</p><ol className="how-actions"><li>Откройте «Мой случай» в шапке. На телефоне этот пункт также есть в меню.</li><li>Нажмите «Продолжить опрос» или «Открыть план действий». Сохранённые тексты — в блоке «Черновики».</li></ol><p className="how-note">Проверяйте надпись «Сохранено в этом браузере». Если появилась ошибка, скачайте документы перед закрытием страницы.</p><p className="how-location">Чтобы продолжить позже, откройте сайт на том же устройстве и в том же браузере.</p><details className="how-more"><summary>Как скачать копию данных</summary><p>В «Моём случае» раскройте «Хранение и удаление данных» и нажмите «Скачать данные случая (JSON)». Это копия для отдельного хранения: загрузить JSON обратно в сервис сейчас нельзя.</p></details></div>{shot(4)}</section>
    <section className="how-section how-text-section" id="how-helper" tabIndex={-1} aria-labelledby="how-helper-title"><span className="how-section-icon" aria-hidden="true"><Users size={24}/></span><h2 id="how-helper-title">Если вы помогаете близкому</h2><p>В разделе «Помогаю близкому» нажмите «Пройти опрос вместе». Заполняйте ответы с согласия человека: решения о деньгах и аккаунтах остаются за ним.</p><p>Если свой случай уже существует, выберите создание отдельного случая для близкого. Ответы и документы не смешаются.</p><button className="text-button how-inline-action" onClick={onHelper}>Перейти в «Помогаю близкому»<ArrowRight size={17} aria-hidden="true"/></button></section>
    <section className="how-faq" id="how-faq" tabIndex={-1} aria-labelledby="how-faq-title"><h2 id="how-faq-title">Частые вопросы</h2>{howQuestions.map(([question,answer],i)=><details key={question}><summary>{question}</summary><p>{answer}</p>{i===6&&<button className="text-button how-inline-action" onClick={onMaterials}>Открыть статьи<ArrowRight size={17} aria-hidden="true"/></button>}</details>)}</section>
    {showPrimary&&<div className="how-finish"><button className="button primary" onClick={onPrimary} disabled={loading}>{primaryLabel}<ArrowRight size={18} aria-hidden="true"/></button></div>}
   </div>
  </div>
 </article>;
}
