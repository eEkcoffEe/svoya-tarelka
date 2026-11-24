'use strict';
const stores=['Пятёрочка','Магнит','Дикси','Чижик','Светофор','Перекрёсток','Лента','Ашан','Метро','ВкусВилл','Азбука вкуса','Яндекс Лавка','Самокат','Другой магазин'];
const mealNames=['Завтрак','Обед','Ужин'], equipment=['Плита','Духовка','Микроволновка','Мультиварка','Аэрогриль','Блендер','Пароварка','Сковорода-гриль'];
const allergies=['Орехи','Арахис','Молоко','Яйца','Глютен','Рыба','Морепродукты','Соя','Мёд','Цитрусовые','Кунжут'];
const defaults={shop:'',budget:5000,adults:1,kids:[],meals:['Завтрак','Обед','Ужин'],family:[],allergy:[],avoid:[],custom:'',gear:['Плита'],checked:[],seed:0};
const key='svoya-tarelka-v1';
let d=structuredClone(defaults),step=-1,shopping=false;
try{const saved=JSON.parse(localStorage.getItem(key));if(saved){d={...d,...saved.d};step=Math.max(-1,Math.min(7,saved.step))}}catch{}
const app=document.querySelector('#app');
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(key,JSON.stringify({step,d}))}catch{}}
const steps=['Магазин и бюджет','Состав семьи','Приёмы пищи','Аллергены','Стоп-продукты','Кухня','Проверка'];
const days=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
const opts=(items,field)=>'<div class="opts">'+items.map(v=>`<button class="opt" data-field="${field}" data-val="${esc(v)}" aria-pressed="${Array.isArray(d[field])?d[field].includes(v):d[field]===v}">${esc(v)}</button>`).join('')+'</div>';
const btn=(label,act,cl='primary')=>`<button class="${cl}" data-act="${act}">${label}</button>`;
function page(title,desc,body){return `<section class="panel"><div class="eyebrow">Шаг ${step+1} из 7 · ${steps[step]}</div><div class="progress"><div style="width:${100*(step+1)/7}%"></div></div><h2>${title}</h2><p>${desc}</p>${body}<div class="alert" role="alert"></div><div class="nav">${btn('Назад','back','secondary')}${btn(step===6?'Собрать меню':'Далее','next')}</div></section>`}
function num(label,field,min,max,value){return `<label class="field">${label}<input required type="number" data-input="${field}" min="${min}" max="${max}" value="${esc(value)}"></label>`}
function render(){
if(step<0){app.innerHTML=`<section class="hero"><div class="copy"><div class="eyebrow">Меню на 7 дней</div><h1>Ваша неделя <i>на тарелке</i></h1><p>Соберите меню под свой бюджет, любимые продукты и привычки семьи. Список покупок уже будет под рукой.</p>${btn('Собрать рацион','next')}<div class="under">Около 2 минут · Без регистрации</div></div><div class="photo" role="img" aria-label="Салат из свежих овощей и зелени"><span class="phototag">Рацион на неделю</span></div></section><section class="features"><article><span class="ico">◷</span><h3>Меню на каждый день</h3><p>Завтраки, обеды и ужины в вашем ритме.</p></article><article><span class="ico">♧</span><h3>По вашему вкусу</h3><p>Учитываем технику и исключённые продукты.</p></article><article><span class="ico">☷</span><h3>Один список покупок</h3><p>Количество продуктов сразу на всю неделю.</p></article></section>`;return}
if(step===7){result();return}
const count=d.adults+d.kids.length;
const screens=[
()=>page('Где покупаете продукты?','Выберите магазин для списка покупок и укажите бюджет на неделю.',opts(stores,'shop')+num('Бюджет на неделю, ₽','budget',100,1000000,d.budget)),
()=>page('На кого готовим?','Укажите взрослых и детей, чтобы рассчитать объём закупки.',num('Взрослые','adults',1,20,d.adults)+d.kids.map((age,i)=>num('Возраст ребёнка, лет','kid-'+i,1,17,age)+btn('Убрать ребёнка','remove-'+i,'secondary')).join('')+btn('Добавить ребёнка','add','secondary')),
()=>page('Какие приёмы пищи включить?','Отметьте блюда, которые хотите видеть в плане.',opts(mealNames,'meals')+(count>1?'<h3>Готовим на всю семью</h3><p>Остальные приёмы рассчитаны на одну порцию.</p>'+opts(d.meals,'family'):'')),
()=>page('Есть ли аллергии?','Отметьте группы продуктов, которые нужно исключить. Если ограничений нет, переходите дальше.',opts(allergies,'allergy')),
()=>page('Что вы не едите?','Выберите продукты или впишите ингредиенты через запятую.',opts(['Свинина','Говядина','Грибы','Лук','Баклажаны','Кинза','Оливки','Творог','Печень','Тофу','Перловка'],'avoid')+`<label class="field">Другие продукты<input data-input="custom" value="${esc(d.custom)}" placeholder="Например, рис, морковь"></label>`),
()=>page('Что есть на кухне?','Выберите доступную технику. Можно оставить только блюда без нагрева.',opts(equipment,'gear')),
()=>page('Всё верно?','По этим настройкам соберём меню на семь дней.',`<p><b>Магазин</b> · ${esc(d.shop)}<br><b>Бюджет</b> · ${d.budget} ₽<br><b>Семья</b> · взрослых ${d.adults}, детей ${d.kids.length}<br><b>Приёмы пищи</b> · ${d.meals.join(', ')}<br><b>Исключения</b> · ${esc([...d.allergy,...d.avoid,d.custom].filter(Boolean).join(', ')||'нет')}<br><b>Техника</b> · ${d.gear.join(', ')||'без нагрева'}</p>`)
];app.innerHTML=screens[step]()}
// Ориентировочные цены в рублях за килограмм. Массы в рецептах указаны в граммах.
const prices={'Гречка':110,'Рис':120,'Яблоко':140,'Банан':150,'Творог':390,'Йогурт':240,'Морковь':65,'Свёкла':55,'Огурец':190,'Капуста':60,'Картофель':68,'Фасоль консервированная':220,'Куриное филе':400,'Рыба':480,'Грибы':310,'Кабачок':145,'Тофу':410,'Лук':65,'Помидор':230,'Груша':195,'Яйца':190,'Чечевица':190,'Овсяные хлопья':125};
const tag={'Йогурт':'Молоко','Творог':'Молоко','Овсяные хлопья':'Глютен','Тофу':'Соя','Рыба':'Рыба','Яйца':'Яйца'};
const hot=['Плита','Мультиварка'],bake=['Духовка','Аэрогриль'],steam=['Пароварка','Мультиварка'];
const recipes=[];
function recipe(name,type,tools,how,items){recipes.push({name,type,tools,how,items})}
recipe('Рисовая каша с яблоком','b',hot,'Сварите рис на воде и добавьте нарезанное яблоко.',{Рис:60,Яблоко:100});
recipe('Гречка с грушей','b',hot,'Сварите гречку и подайте с ломтиками груши.',{Гречка:65,Груша:110});
recipe('Творог с бананом','b',[],'Нарежьте банан и добавьте к творогу.',{Творог:150,Банан:90});
recipe('Яблоко с йогуртом','b',[],'Нарежьте яблоко и смешайте с йогуртом.',{Яблоко:150,Йогурт:150});
recipe('Фруктовый салат','b',[],'Нарежьте фрукты небольшими кусочками и перемешайте.',{Яблоко:110,Груша:90,Банан:80});
recipe('Овсянка с бананом','b',[...hot,'Микроволновка'],'Приготовьте хлопья на воде по инструкции на упаковке. Добавьте банан.',{'Овсяные хлопья':65,Банан:100});
recipe('Фруктовый смузи','b',['Блендер'],'Взбейте фрукты с йогуртом.',{Банан:100,Груша:80,Йогурт:150});
recipe('Салат из капусты с фасолью','m',[],'Нашинкуйте капусту, натрите морковь и добавьте промытую фасоль.',{Капуста:130,Морковь:55,'Фасоль консервированная':140});
recipe('Овощной салат с тофу','m',[],'Нарежьте овощи и тофу, перемешайте.',{Огурец:100,Помидор:100,Тофу:125});
recipe('Рис с чечевицей','m',hot,'Сварите крупу и чечевицу по инструкции, добавьте тушёную морковь.',{Рис:55,Чечевица:55,Морковь:80});
recipe('Гречка с грибами','m',hot,'Сварите гречку, потушите нарезанные грибы и лук, соедините.',{Гречка:75,Грибы:120,Лук:40});
recipe('Рыба с кабачком','m',[...bake,...steam],'Разделите рыбу и кабачок на порции и запеките или приготовьте на пару до готовности.',{Рыба:150,Кабачок:160});
recipe('Курица с картофелем','m',[...bake,...hot],'Нарежьте ингредиенты, запеките или потушите до полной готовности.',{'Куриное филе':140,Картофель:170,Морковь:60});
recipe('Картофель с фасолью','m',[...hot,'Микроволновка'],'Приготовьте картофель до мягкости и добавьте прогретую фасоль.',{Картофель:190,'Фасоль консервированная':130});
recipe('Кабачки с тофу на гриле','m',['Сковорода-гриль',...bake],'Нарежьте пластинками и обжарьте на гриле или запеките.',{Кабачок:190,Тофу:140});
recipe('Свекольный салат с яблоком','m',[],'Натрите очищенные сырые свёклу и яблоко. Добавьте промытую фасоль.',{Свёкла:100,Яблоко:80,'Фасоль консервированная':130});
Object.assign(prices,{Пшено:115,Тыква:110,Шпинат:470,Брокколи:265,Кефир:100,Кукуруза:230,Укроп:650,Макароны:130,Индейка:495,Перловка:85,'Нут консервированный':245});
Object.assign(tag,{Кефир:'Молоко',Макароны:'Глютен',Перловка:'Глютен'});
recipe('Пшённая каша с тыквой','b',hot,'Промойте пшено. Нарежьте тыкву кубиками и сварите с крупой на воде до мягкости.',{Пшено:60,Тыква:140});
recipe('Омлет со шпинатом','b',[...hot,...bake],'Взбейте яйца с ложкой воды, вмешайте нарезанный шпинат. Готовьте под крышкой или в форме до схватывания яиц.',{Яйца:110,Шпинат:55});
recipe('Ночная овсянка с грушей','b',[],'Залейте тонкие хлопья кефиром и оставьте в холодильнике на ночь. Утром добавьте кусочки груши.',{'Овсяные хлопья':55,Кефир:160,Груша:85});
recipe('Творожная намазка с огурцами','b',[],'Разомните творог с йогуртом и укропом. Нарежьте огурец кружками и выложите сверху намазку.',{Творог:130,Йогурт:25,Укроп:4,Огурец:100});
recipe('Яблоки с творожной начинкой','b',bake,'Удалите сердцевину яблока, наполните творогом и запеките при 180 °C до мягкости.',{Яблоко:180,Творог:100});
recipe('Банановые оладьи','b',['Плита'],'Разомните банан, вмешайте яйцо и мелкие хлопья. Дайте постоять 10 минут и испеките небольшие оладьи на антипригарной сковороде с обеих сторон.',{Банан:100,Яйца:55,'Овсяные хлопья':40});
recipe('Гречневая каша с яйцом','b',hot,'Сварите гречку. Вмешайте взбитое яйцо в горячую крупу и прогревайте при помешивании до полного схватывания. Добавьте укроп.',{Гречка:65,Яйца:55,Укроп:3});
recipe('Хрустящие лодочки с нутом','b',[],'Разомните промытый нут с мякотью помидора. Разрежьте огурец вдоль, удалите семена и наполните начинкой.',{'Нут консервированный':120,Огурец:130,Помидор:60});
recipe('Чечевичный суп с тыквой','m',hot,'Нарежьте тыкву и лук, залейте водой. Добавьте промытую чечевицу и варите до мягкости.',{Чечевица:65,Тыква:150,Лук:35});
recipe('Индейка с брокколи на пару','m',steam,'Нарежьте индейку тонкими ломтиками и готовьте на пару. Ближе к концу добавьте соцветия брокколи. Доведите птицу до полной готовности.',{Индейка:150,Брокколи:160});
recipe('Макароны с томатами и нутом','m',hot,'Сварите макароны и слейте воду. Потушите нарезанные помидоры с нутом и перемешайте с макаронами.',{Макароны:75,Помидор:140,'Нут консервированный':80});
recipe('Перловка с курицей','m',hot,'Сварите перловку по инструкции. Потушите кусочки курицы с морковью до полной готовности и перемешайте с крупой.',{Перловка:65,'Куриное филе':130,Морковь:65});
recipe('Фаршированный кабачок','m',bake,'Разрежьте кабачок вдоль. Измельчите мякоть, смешайте с раскрошенным тофу и томатом. Наполните половинки и запеките до мягкости.',{Кабачок:220,Тофу:120,Помидор:65});
recipe('Салат из нута с кукурузой','m',[],'Промойте нут и слейте жидкость с консервированной кукурузы. Смешайте с нарезанным огурцом и укропом.',{'Нут консервированный':130,Кукуруза:70,Огурец:90,Укроп:3});
recipe('Запечённая рыба с тыквой','m',bake,'Нарежьте тыкву тонкими ломтиками и запеките почти до мягкости. Добавьте рыбное филе и запекайте до готовности.',{Рыба:155,Тыква:175});
recipe('Картофельное пюре с брокколи','m',hot,'Отварите картофель, добавив брокколи в конце. Разомните овощи с частью отвара. Подайте с прогретой фасолью.',{Картофель:150,Брокколи:100,'Фасоль консервированная':95});
recipe('Холодный огуречный суп','m',[],'Натрите огурец, смешайте с кефиром, творогом и рубленым укропом. Подавайте охлаждённым.',{Огурец:160,Кефир:180,Творог:80,Укроп:5});
recipe('Тушёная капуста с индейкой','m',hot,'Нарежьте индейку небольшими кусочками. Нашинкуйте капусту и морковь, добавьте немного воды и тушите с индейкой до готовности.',{Индейка:135,Капуста:170,Морковь:50});
recipe('Грибы с картофелем в духовке','m',bake,'Нарежьте картофель тонкими дольками, грибы половинками, лук кольцами. Добавьте немного воды и запеките под крышкой, в конце подрумяньте.',{Картофель:200,Грибы:125,Лук:35});
recipe('Рисовый суп с рыбой','m',hot,'В кипящую воду положите рис и мелко нарезанную морковь. Когда рис почти готов, добавьте кусочки рыбного филе и доварите.',{Рис:45,Морковь:65,Рыба:130});
recipe('Тёплая чечевица со свёклой','m',hot,'Нарежьте очищенную свёклу мелкими кубиками и потушите. Добавьте промытую чечевицу, воду и готовьте до мягкости.',{Свёкла:135,Чечевица:75,Лук:30});
recipe('Гречневый суп с грибами','m',hot,'Нарежьте грибы и картофель. Залейте водой, добавьте промытую гречку и варите до готовности. Посыпьте укропом.',{Гречка:40,Грибы:110,Картофель:100,Укроп:3});
recipe('Яичная запеканка с брокколи','m',bake,'Мелко нарежьте брокколи, выложите в форму. Смешайте яйца с творогом, залейте овощи и запекайте до схватывания середины.',{Брокколи:145,Яйца:110,Творог:55});
recipe('Рулетики из капусты с фасолью','m',[],'Возьмите мягкие внутренние листья капусты. Разомните промытую фасоль с помидором, добавьте тёртую морковь и заверните начинку в листья.',{Капуста:90,'Фасоль консервированная':140,Помидор:65,Морковь:45});
const unitPrice=product=>localQuote(d.shop,product)?.rate ?? prices[product];
const cost=r=>Object.entries(r.items).reduce((n,[p,g])=>n+unitPrice(p)*g/1000,0);
function buildPlan(){
 const excluded=[...d.avoid,...d.custom.split(',')].map(s=>s.trim().toLowerCase()).filter(Boolean);
 const allowed=recipes.filter(r=>(!r.tools.length||r.tools.some(t=>d.gear.includes(t)))&&Object.keys(r.items).every(p=>!d.allergy.includes(tag[p])&&!excluded.some(x=>p.toLowerCase().includes(x))));
 const portions=m=>d.family.includes(m)?d.adults+d.kids.reduce((n,a)=>n+(a<7?.5:a<13?.75:1),0):1;
 const target=d.budget/(7*d.meals.reduce((n,m)=>n+portions(m),0));
 const used={b:0,m:0};
 const list={},week=days.map(()=>d.meals.map(m=>{
 const type=m==='Завтрак'?'b':'m';
 const group=allowed.filter(r=>r.type===type).sort((a,b)=>cost(a)-cost(b));
 const cheap=group.filter(r=>cost(r)<=target);
 const pool=cheap.length?cheap:group.slice(0,1);
 const r=pool[(used[type]++ + d.seed)%pool.length];if(r)for(const [p,g] of Object.entries(r.items))list[p]=(list[p]||0)+g*portions(m);
 return {m,r};
 }));
 return {week,list,total:Math.ceil(Object.entries(list).reduce((n,[p,g])=>n+unitPrice(p)*g/1000,0))};
}
function result(){const {week,list,total}=buildPlan();
const menu=week.map((row,i)=>`<section class="day"><h3>${days[i]}</h3>${row.map(({m,r})=>r?`<details class="meal"><summary>${m} · ${r.name}</summary><p>${r.how}</p><small>На порцию · ${Object.entries(r.items).map(([p,g])=>p+' '+g+' г').join(', ')}</small></details>`:`<p>${m} · Подходящих блюд нет. Измените настройки подбора.</p>`).join('')}</section>`).join('');
const money=v=>v.toLocaleString('ru-RU',{maximumFractionDigits:2});
const basket=Object.entries(list).map(([p,g])=>{
 const quote=localQuote(d.shop,p);
 const note=quote?`<a href="${quote.url}" target="_blank" rel="noopener noreferrer">${quote.label}</a>`:'Справочная оценка';
 return `<label><input type="checkbox" data-buy="${p}" ${d.checked.includes(p)?'checked':''}> <span>${p} · ${Math.ceil(g)} г · ${money(unitPrice(p)*g/1000)} ₽</span></label><small>${money(unitPrice(p))} ₽/кг · ${note}</small>`}).join('');
app.innerHTML=`<section class="panel"><div class="eyebrow">Ваш рацион · 7 дней</div><h2>${shopping?'Список покупок':'Меню на неделю'}</h2><p>${esc(d.shop)} · ориентировочно ${total} ₽ при бюджете ${d.budget} ₽. Расчёт по весу ингредиентов. Тюмень. Цены выбранной сети доступны для ${Object.keys(list).filter(p=>localQuote(d.shop,p)).length} из ${Object.keys(list).length} позиций. Остальные рассчитаны по справочнику. Покупка целых упаковок может изменить сумму.</p>${total>d.budget?'<p class="alert">Даже самые доступные подходящие блюда превышают заданный бюджет.</p>':''}<div class="opts switch">${btn('Меню','menu',shopping?'secondary':'primary')}${btn('Список покупок','basket',shopping?'primary':'secondary')}</div>${shopping?'<div class="shopping">'+(basket||'Список пуст')+'</div>':menu}<div class="nav">${btn('Изменить ответы','edit','secondary')}${btn('Печать','print','secondary')}${btn('Другой вариант','shuffle','secondary')}</div></section>`}
app.addEventListener('input',e=>{const k=e.target.dataset.input;if(!k)return;const v=e.target.type==='number'?Number(e.target.value):e.target.value;if(k.startsWith('kid-'))d.kids[Number(k.slice(4))]=v;else d[k]=v;save()});
app.addEventListener('change',e=>{const p=e.target.dataset.buy;if(p){d.checked=e.target.checked?[...d.checked,p]:d.checked.filter(x=>x!==p);save()}});
app.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const {act,field,val}=b.dataset;
if(field){if(Array.isArray(d[field]))d[field]=d[field].includes(val)?d[field].filter(x=>x!==val):[...d[field],val];else d[field]=val;if(field==='meals')d.family=d.family.filter(m=>d.meals.includes(m));}
else if(act==='next'){for(const el of app.querySelectorAll('input[type=number]'))if(!el.reportValidity())return;const error=step===0&&!d.shop?'Выберите магазин.':step===2&&!d.meals.length?'Выберите хотя бы один приём пищи.':'';if(error){app.querySelector('.alert').textContent=error;return}if(step===6)d.checked=[];step++}
else if(act==='back')step--;else if(act==='edit')step=0;else if(act==='add')d.kids.push(7);else if(act.startsWith('remove-'))d.kids.splice(Number(act.slice(7)),1);else if(act==='menu'||act==='basket')shopping=act==='basket';else if(act==='shuffle'){d.seed++;d.checked=[]}else if(act==='print'){window.print();return}
save();render();if(['next','back','edit','menu','basket'].includes(act))window.scrollTo(0,0);if(field)Array.from(app.querySelectorAll('[data-field]')).find(x=>x.dataset.field===field&&x.dataset.val===val)?.focus()});
function firstQuestion(){
 step=0;
 shopping=false;
 save();
 render();
 app.focus({preventScroll:true});
 window.scrollTo(0,0);
}
document.querySelector('.brand').addEventListener('click',event=>{
 if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 event.preventDefault();
 firstQuestion();
});
if(location.hash==='#start'){
 history.replaceState(null,'',location.pathname+location.search);
 firstQuestion();
}else render();
