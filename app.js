'use strict';
const stores=['Пятёрочка','Магнит','Дикси','Чижик','Светофор','Перекрёсток','Лента','Ашан','Метро','ВкусВилл','Азбука вкуса','Яндекс Лавка','Самокат','Другой магазин'];
const mealNames=['Завтрак','Второй завтрак','Обед','Полдник','Ужин','Поздний ужин'], equipment=['Плита','Духовка','Микроволновка','Мультиварка','Аэрогриль','Блендер','Пароварка','Сковорода-гриль'];
const allergies=['Орехи','Арахис','Молоко','Яйца','Глютен','Рыба','Морепродукты','Соя','Мёд','Цитрусовые','Кунжут'];
const defaults={shop:'',budget:5000,adults:1,kids:[],meals:['Завтрак','Обед','Ужин'],family:[],allergy:[],avoid:[],custom:'',gear:['Плита'],checked:[],seed:0,program:'Лайт',choices:{},budgetPilot:false,budgetPrices:{},demoBudgetPrices:false};
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
if(step<0){app.innerHTML=`<section class="hero"><div class="copy"><div class="eyebrow">Меню на 7 дней</div><h1>Ваша неделя <i>на тарелке</i></h1><p>Выберите приёмы пищи и ограничения. Соберите недельный план и список продуктов по составам блюд.</p>${btn('Собрать рацион','next')}<div class="under">Около 2 минут · Без регистрации</div></div><div class="photo" role="img" aria-label="Салат из свежих овощей и зелени"><span class="phototag">Рацион на неделю</span></div></section><section class="features"><article><span class="ico">◷</span><h3>Меню на каждый день</h3><p>Выберите до шести приёмов пищи на день.</p></article><article><span class="ico">♧</span><h3>По вашему вкусу</h3><p>Учитываем технику и исключённые продукты.</p></article><article><span class="ico">☷</span><h3>Один список покупок</h3><p>Продукты из состава выбранных блюд.</p></article></section>`;return}
if(step===7){result();return}
const count=d.adults+d.kids.length;
const screens=[
()=>page('Где покупаете продукты?','Выберите магазин для списка покупок и укажите бюджет на неделю.',opts(stores,'shop')+num('Бюджет на неделю, ₽','budget',100,1000000,d.budget)),
()=>page('На кого готовим?','Укажите взрослых и детей, чтобы рассчитать количество порций.',num('Взрослые','adults',1,20,d.adults)+d.kids.map((age,i)=>num('Возраст ребёнка, лет','kid-'+i,1,17,age)+btn('Убрать ребёнка','remove-'+i,'secondary')).join('')+btn('Добавить ребёнка','add','secondary')),
()=>page('Какие приёмы пищи включить?','Отметьте блюда, которые хотите видеть в плане.',opts(mealNames,'meals')+(count>1?'<h3>Готовим на всю семью</h3><p>Остальные приёмы рассчитаны на одну порцию.</p>'+opts(d.meals,'family'):'')),
()=>page('Есть ли аллергии?','Отметьте группы продуктов, которые нужно исключить. Если ограничений нет, переходите дальше.',opts(allergies,'allergy')),
()=>page('Что вы не едите?','Выберите продукты или впишите ингредиенты через запятую.',opts(['Свинина','Говядина','Грибы','Лук','Баклажаны','Кинза','Оливки','Творог','Печень','Тофу','Перловка'],'avoid')+`<label class="field">Другие продукты<input data-input="custom" value="${esc(d.custom)}" placeholder="Например, рис, морковь"></label>`),
()=>page('Что есть на кухне?','Выберите доступную технику. Фильтр учитывает способы приготовления, указанные в названиях блюд.',opts(equipment,'gear')),
()=>page('Всё верно?','По этим настройкам соберём меню на семь дней.',`<p><b>Магазин</b> · ${esc(d.shop)}<br><b>Бюджет</b> · ${d.budget} ₽<br><b>Семья</b> · взрослых ${d.adults}, детей ${d.kids.length}<br><b>Приёмы пищи</b> · ${d.meals.join(', ')}<br><b>Исключения</b> · ${esc([...d.allergy,...d.avoid,d.custom].filter(Boolean).join(', ')||'нет')}<br><b>Техника</b> · ${d.gear.join(', ')||'без нагрева'}</p>`)
];app.innerHTML=screens[step]()}
const catalogUrl=new URL('menus/index.json',document.currentScript.src);
let catalog;
let catalogRequest;
let catalogError=false;

async function fetchJson(url){
  const response=await fetch(url);
  if(!response.ok)throw new Error('Не удалось загрузить меню');
  return response.json();
}

function loadCatalog(){
  if(catalogRequest)return;
  catalogRequest=fetchJson(catalogUrl).then(index=>{
    if(!Array.isArray(index.menus)||!index.menus.length)throw new Error('Каталог пуст');
    return Promise.all(index.menus.map(file=>fetchJson(new URL(file,catalogUrl))));
  }).then(menus=>{
    catalog=menus;
  }).catch(()=>{
    catalogError=true;
  }).finally(()=>{
    catalogRequest=null;
    if(step===7)render();
  });
}

const fold=value=>value.toLowerCase().replaceAll('ё','е');
const allergyPatterns={
  'Орехи':/орех|миндал|макадами|песто/,
  'Арахис':/арахис/,
  'Молоко':/молок|творо|сметан|йогур|кефир|сливк|сливочн|кисломолоч|моцарелл|пармезан|халуми|томмит|сыр(?!ой|ым|ая|ые)|голландск.*соус|бешамел/,
  'Яйца':/яйц|яиц|омлет|белок варен|голландск.*соус/,
  'Глютен':/пшен|ржан|овся|геркулес|ячнев|полб|булгур|кускус|мука|хлеб|булоч|паст[ауы]|лапш|тальятелле|терияки|соев.{0,8}соус/,
  'Рыба':/лосос|треск|судак|тунец|тунца|кет[ау]|кижуч|форел|горбуш|сибас|дорадо|нерк|окун|палтус|икра/,
  'Морепродукты':/морепродукт|морск.{0,5}коктейл|кревет|кальмар|миди|гребеш/,
  'Соя':/соев|со[яи](?![а-я])|тофу|терияки|мисо/,
  'Мёд':/(?:^|[^а-я])мед(?:ом|а)?(?![а-я])/,
  'Цитрусовые':/апельсин|лимон|лайм|грейпфрут|мандарин/,
  'Кунжут':/кунжут/,
};
const foodPatterns={
  'Свинина':/свинин|свиной/,
  'Говядина':/говядин|говяж|теляч|бифштекс/,
  'Грибы':/гриб|шампиньон|шиитаке|вешен/,
  'Лук':/лук(?!аго)/,
  'Баклажаны':/баклажан/,
  'Кинза':/кинз/,
  'Оливки':/оливк|маслин/,
  'Творог':/творо/,
  'Печень':/печен[ьи](?![а-я])/,
  'Тофу':/тофу/,
  'Перловка':/перлов/,
};
const simpleProducts={
  'Абрикос':'Абрикосы',
  'Нектарин':'Нектарины',
  'Черешня':'Черешня',
  'Мякоть апельсина':'Апельсины',
  'Мякоть грейпфрута':'Грейпфруты',
  'Белок варёного куриного яйца':'Яйца',
};
const readyProducts=new Set(['Сыр Томмит','Хлебцы','Булочка ржаная','Шоколад горький','Конфеты фруктово-ягодные','Кисломолочный напиток']);

function equipmentFor(dish){
  const name=fold(dish.name);
  if(/на пару|паровых/.test(name))return ['Пароварка','Мультиварка','Плита'];
  if(/запечен|в пергаменте|запеканка|пирог|печенье|лазанья/.test(name))return ['Духовка','Аэрогриль'];
  if(/на гриле|гриль/.test(name))return ['Сковорода-гриль','Аэрогриль','Духовка'];
  if(/смузи/.test(name))return ['Блендер'];
  if(/^(?:каша|борщ|омлет|гуляш|суп(?! «гаспачо))|тушенн|отварн|карамелиз/.test(name))return ['Плита','Мультиварка'];
  return [];
}

function fits(dish,excluded,pilotIngredients=[]){
  const text=fold([dish.name,...dish.ingredients,...pilotIngredients].join(' '));
  const gear=equipmentFor(dish);
  if(gear.length&&!gear.some(tool=>d.gear.includes(tool)))return false;
  if(d.allergy.length&&!dish.ingredients.length&&!Object.hasOwn(simpleProducts,dish.name))return false;
  if(d.allergy.some(name=>allergyPatterns[name]?.test(text)))return false;
  if(d.avoid.some(name=>foodPatterns[name]?.test(text)))return false;
  return !excluded.some(word=>text.includes(word));
}

function buildPlan(grams){
  const excluded=d.custom.split(',').map(word=>fold(word.trim())).filter(Boolean);
  const options=catalog.filter(menu=>menu.name===d.program);
  const set=Math.floor(d.seed/2)%Math.ceil(options.length/7);
  const list=new Map();
  const missing=new Set();
  const week=options.slice(set*7,set*7+7).map((menu,day)=>({
    meals:menu.meals.filter(meal=>d.meals.includes(meal.name)).map(meal=>{
      const allowed=dish=>fits(dish,excluded,Object.keys(grams?.[menu.id]?.[dish.name]||{}));
      const dishes=meal.dishes.filter(allowed);
      const hot=meal.hotChoices.filter(allowed);
      const choiceKey=menu.id+'|'+meal.name;
      const selected=hot.find(dish=>dish.name===d.choices[choiceKey])||hot[(d.seed+day)%hot.length];
      const portions=d.family.includes(meal.name)?d.adults+d.kids.reduce((sum,age)=>sum+(age<7?.5:age<13?.75:1),0):1;
      for(const dish of [...dishes,...(selected?[selected]:[])]){
        const product=simpleProducts[dish.name]||(readyProducts.has(dish.name)?dish.name:null);
        const items=[...(product?[product]:[]),...dish.ingredients];
        if(!items.length)missing.add(dish.name);
        for(const item of items){
          const normalized=fold(item);
          if(!list.has(normalized))list.set(normalized,{name:item,uses:0});
          list.get(normalized).uses++;
        }
      }
      return {menuId:menu.id,name:meal.name,dishes,hot,choiceKey,selected,portions};
    })
  }));
  return {week,list:[...list.values()].sort((a,b)=>a.name.localeCompare(b.name,'ru')),missing};
}

const numberRu=value=>value.toLocaleString('ru-RU',{maximumFractionDigits:2});
const priceProductAliases={
  'капуста белокочанная':'Капуста',
  'белокочанная капуста':'Капуста',
  'лук репчатый':'Лук',
  'яблоки':'Яблоко',
  'груши':'Груша',
  'филе куриное':'Куриное филе',
};

function shoppingRates(name,showMissing=true){
  const normalized=fold(name);
  const product=priceProductAliases[normalized]||name.charAt(0).toUpperCase()+name.slice(1);
  const quotes=localQuotes(product);
  const selected=quotes.find(quote=>quote.shop===d.shop);
  const best=quotes[0];
  const rate=quote=>numberRu(quote.rate)+' ₽/кг';
  const selectedRate=selected?`${esc(selected.shop)} · ${rate(selected)}`:`${esc(d.shop)} · цены нет`;
  return best?`<details class="shopping-rates">
    <summary>${selectedRate}${best!==selected?` · от ${rate(best)} в «${esc(best.shop)}»`:''}
      · ${quotes.length>1?'сравнить цены':'источник цены'}</summary>
    <ul>${quotes.map(quote=>`<li>${rate(quote)} · <a href="${esc(quote.url)}" target="_blank"
      rel="noopener noreferrer">${esc(quote.label)}</a></li>`).join('')}</ul>
  </details>`:showMissing?'<small class="shopping-rates">В справочнике нет цены.</small>':'';
}

function shoppingItem({name,uses}){
  return `<div class="shopping-item"><label><input type="checkbox" data-buy="${esc(name)}"
    ${d.checked.includes(name)?'checked':''}> <span>${esc(name)} <small>· в блюдах: ${uses}</small></span></label>
    ${shoppingRates(name)}</div>`;
}

function dishDetails(dish){
  const {proteinG,fatG,carbohydratesG,kcal}=dish.nutrition;
  const portion=dish.servingG.length?'Выход порции · '+dish.servingG.join(' / ')+' г':'';
  const energy=kcal===null?'':numberRu(kcal)+' ккал';
  const macros=[proteinG,fatG,carbohydratesG].every(value=>value!==null)?
    'Б / Ж / У · '+[proteinG,fatG,carbohydratesG].map(numberRu).join(' / ')+' г':'';
  const composition=dish.ingredients.length?'Состав · '+dish.ingredients.join(', '):'Состав в источнике не указан.';
  return `<details class="meal"><summary>${esc(dish.name)}</summary><p>${esc(composition)}</p>
    <small>${esc([portion,energy,macros].filter(Boolean).join(' · '))}</small>
    ${dish.sourceNote?`<p><small>${esc(dish.sourceNote)}</small></p>`:''}</details>`;
}

const budgetUrl=new URL('budget-pilot.json',document.currentScript.src);
let pilotGrams;
let pilotRequest;
let pilotError=false;

function loadBudgetPilot(){
  if(pilotRequest)return;
  pilotRequest=fetchJson(budgetUrl).then(data=>{
    pilotGrams=data;
  }).catch(()=>{
    pilotError=true;
  }).finally(()=>{
    pilotRequest=null;
    if(step===7)render();
  });
}

function budgetQuote(product){
  const entered=d.budgetPrices[d.shop]?.[product];
  if(entered)return {...entered,kind:'manual'};
  const quote=localQuotes(product).find(entry=>entry.shop===d.shop);
  if(quote){
    return {kind:'catalog',packG:quote.packG,kopecks:Math.round(quote.price*100),
      url:quote.url,label:quote.label};
  }
  return d.demoBudgetPrices?{kind:'demo',packG:0,kopecks:exampleRate(product)*100}:null;
}

function budgetSummary(plan){
  const rubles=numberRu(plan.subtotal/100)+' ₽';
  const missing=plan.missing||plan.unmeasured||plan.emptyMeals;
  const totalLabel=missing?'Учтённая часть корзины':'Ориентировочная стоимость корзины';
  let message='';
  if(plan.missing)message+=` Без цены: ${plan.missing} поз.`;
  if(plan.unmeasured)message+=' Для части блюд нет граммовок.';
  if(plan.emptyMeals)message+=` Без подходящих блюд: ${plan.emptyMeals} приёмов пищи.`;
  if(plan.matches===true)message+=' Меню укладывается в бюджет по этим ценам.';
  if(plan.matches===false)message+=` Самый дешёвый вариант с полными ценами выше бюджета на ${numberRu((plan.subtotal-Math.round(d.budget*100))/100)} ₽.`;
  if(plan.matches===null&&plan.missing)message+=' Чтобы проверить бюджет, добавьте недостающие цены или включите тестовые.';
  if(plan.partialOptions)message+=' У некоторых вариантов горячего нет полных цен.';
  if(plan.demo)message+=' В расчёте есть тестовые цены.';
  return `<p role="status"><strong>${totalLabel} · ${rubles}</strong>${message}</p>`;
}

function budgetPriceForm(products,quotes){
  const saved=d.budgetPrices[d.shop]||{};
  const rows=products.map(product=>{
    const manual=saved[product];
    const quote=quotes.get(product);
    const placeholder=quote?.kind==='catalog'?quote.kopecks/100:'';
    return `<div class="budget-price-row" data-price-product="${esc(product)}">
      <strong>${esc(product)}</strong>
      <label>Цена, ₽<input type="number" min="0.01" max="1000000" step="0.01" data-price
        value="${manual?manual.kopecks/100:''}" placeholder="${placeholder}"></label>
      <label>Упаковка, г<input type="number" min="1" max="100000" step="1" data-pack
        value="${manual?.packG||''}" placeholder="${quote?.kind==='catalog'?quote.packG||'':''}"></label>
    </div>`;
  }).join('');
  return `<details class="budget-price-form">
    <summary>Ввести цены для магазина «${esc(d.shop)}»</summary>
    <form data-budget-prices>
      <p>Для весового товара укажите цену за килограмм. Для фасованного товара укажите цену и вес упаковки. Чтобы удалить ручную цену, очистите оба поля.</p>
      <div class="budget-price-grid">${rows}</div>
      <p role="alert"></p>
      <button class="primary" type="submit">Сохранить цены</button>
    </form>
  </details>`;
}

function budgetShoppingItem({name,g,quote,cost}){
  const amount=numberRu(g)+' г';
  const packs=quote?.packG?` · ${Math.ceil(g/quote.packG)} уп. × ${quote.packG} г`:'';
  const price=cost===null?'цена не указана':numberRu(cost/100)+' ₽';
  const source={manual:'введено вручную',demo:'тестовая цена'}[quote?.kind];
  const info=quote?.url?`<a href="${esc(quote.url)}" target="_blank" rel="noopener noreferrer">${esc(quote.label)}</a>`:(source||'');
  return `<div class="shopping-item"><label><input type="checkbox" data-buy="${esc(name)}"
    ${d.checked.includes(name)?'checked':''}> <span>${esc(name)} · ${amount}${packs} · ${price}</span></label>
    ${info?`<small class="shopping-rates">${info}</small>`:''}${shoppingRates(name,false)}</div>`;
}

app.addEventListener('submit',event=>{
  const form=event.target;
  if(!form.hasAttribute('data-budget-prices'))return;
  event.preventDefault();
  const prices={...d.budgetPrices[d.shop]};
  const error=form.querySelector('[role="alert"]');
  error.textContent='';
  for(const row of form.querySelectorAll('[data-price-product]')){
    const price=row.querySelector('[data-price]');
    const pack=row.querySelector('[data-pack]');
    if(pack.value&&!price.value){
      error.textContent='Укажите цену упаковки для позиции «'+row.dataset.priceProduct+'».';
      price.focus();
      return;
    }
    if(price.value)prices[row.dataset.priceProduct]={kopecks:Math.round(price.valueAsNumber*100),packG:pack.valueAsNumber||0};
    else delete prices[row.dataset.priceProduct];
  }
  d.budgetPrices[d.shop]=prices;
  d.checked=[];
  save();
  result();
  app.querySelector('.budget-price-form summary')?.focus();
});

function result(){
  if(!catalog){
    app.innerHTML=catalogError
      ? `<section class="panel"><p role="alert">Не удалось загрузить каталог меню.</p>${btn('Повторить','retry')}</section>`
      : '<section class="panel"><p role="status">Загружаем меню…</p></section>';
    if(!catalogError)loadCatalog();
    return;
  }
  const pilotAvailable=d.program==='Лайт'&&Math.floor(d.seed/2)%2===0;
  const pilotActive=pilotAvailable&&d.budgetPilot;
  if(pilotActive&&!pilotGrams&&!pilotError)loadBudgetPilot();
  const grams=pilotActive&&pilotGrams;
  const {week,list,missing}=buildPlan(grams);
  const products=grams?budgetProducts(week,grams):[];
  const quotes=new Map();
  for(const product of products){
    const quote=budgetQuote(product);
    if(quote)quotes.set(product,quote);
  }
  const budgetPlan=grams?planBudget(week,grams,quotes,Math.round(d.budget*100)):null;
  const menu=week.map(({meals},day)=>`<section class="day"><h3>${days[day]}</h3>
    ${meals.map(({name,dishes,hot,choiceKey,selected,portions})=>{
      const chosen=budgetPlan?.selection.get(choiceKey)||selected;
      const select=!budgetPlan&&hot.length>1?`<label class="field">Горячее на выбор
        <select data-hot="${esc(choiceKey)}">${hot.map(dish=>`<option ${dish===selected?'selected':''}>${esc(dish.name)}</option>`).join('')}</select>
      </label>`:'';
      const portionsText=d.family.includes(name)?` · порции ${numberRu(portions)}`:'';
      const details=[...dishes,...(chosen?[chosen]:[])].map(dishDetails).join('');
      return `<section class="meal-group"><h4>${name}${portionsText}</h4>${select}${details||'<p>По выбранным ограничениям блюда не найдены.</p>'}</section>`;
    }).join('')}</section>`).join('');
  const basket=shopping?(budgetPlan?budgetPlan.items.map(budgetShoppingItem):list.map(shoppingItem)).join(''):'';
  const controls=opts(['Лайт','Детокс'],'program');
  const allergyNote=d.allergy.length?'<p>Фильтр ищет совпадения в названиях и указанном составе. Перед выбором блюда с аллергией проверьте полный состав.</p>':'';
  const shoppingNote=shopping&&!budgetPlan?`<p>Справочные цены в Тюмени указаны за килограмм. Дату и источник можно посмотреть у каждой цены. Для расчёта стоимости всей корзины нужны граммовки продуктов.</p>
    ${missing.size?`<details><summary>Блюда без списка ингредиентов · ${missing.size}</summary><p>${esc([...missing].join(', '))}</p></details>`:''}`:'';
  const pilotButton=btn(pilotActive?'Выключить подбор по бюджету':'Попробовать подбор по бюджету · Лайт','budget-pilot','secondary');
  const pilotInfo=budgetPlan?`<p>Пилот для первой недели «Лайт». Вес ингредиентов на порцию ориентировочный. По бюджету меняются варианты горячих блюд.</p>
    ${budgetSummary(budgetPlan)}
    ${btn(d.demoBudgetPrices?'Выключить тестовые цены':'Заполнить пробелы тестовыми ценами','budget-demo','secondary')}
    ${budgetPriceForm(products,quotes)}`:
    pilotActive?`<p role="status">${pilotError?'Не удалось загрузить граммовки.':'Загружаем граммовки…'}</p>
      ${pilotError?btn('Повторить','budget-retry','secondary'):''}`:'';
  app.innerHTML=`<section class="panel"><div class="eyebrow">Ваш рацион · 7 дней</div><h2>${shopping?'Список покупок':'Меню на неделю'}</h2>
    <p>${esc(d.shop)} · бюджет на неделю ${numberRu(d.budget)} ₽</p>${controls}${allergyNote}${pilotButton}${pilotInfo}
    <div class="opts switch">${btn('Меню','menu',shopping?'secondary':'primary')}${btn('Список покупок','basket',shopping?'primary':'secondary')}</div>
    ${shoppingNote}${shopping?'<div class="shopping">'+(basket||'<p>Список пуст.</p>')+'</div>':menu}
    <div class="nav">${btn('Изменить ответы','edit','secondary')}${btn('Печать','print','secondary')}${btn('Другой вариант','shuffle','secondary')}</div></section>`;
}
app.addEventListener('input',e=>{const k=e.target.dataset.input;if(!k)return;const v=e.target.type==='number'?Number(e.target.value):e.target.value;if(k.startsWith('kid-'))d.kids[Number(k.slice(4))]=v;else d[k]=v;save()});
app.addEventListener('change',e=>{const p=e.target.dataset.buy;if(p){d.checked=e.target.checked?[...d.checked,p]:d.checked.filter(x=>x!==p);save()}
 const hot=e.target.dataset.hot;
 if(hot){d.choices[hot]=e.target.value;d.checked=[];save();result();
   Array.from(app.querySelectorAll('[data-hot]')).find(el=>el.dataset.hot===hot)?.focus();}
});
app.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const {act,field,val}=b.dataset;if(!act&&!field)return;
if(field){if(Array.isArray(d[field]))d[field]=d[field].includes(val)?d[field].filter(x=>x!==val):[...d[field],val];else d[field]=val;if(field==='program')d.checked=[];if(field==='meals')d.family=d.family.filter(m=>d.meals.includes(m));}
else if(act==='next'){for(const el of app.querySelectorAll('input[type=number]'))if(!el.reportValidity())return;const error=step===0&&!d.shop?'Выберите магазин.':step===2&&!d.meals.length?'Выберите хотя бы один приём пищи.':'';if(error){app.querySelector('.alert').textContent=error;return}if(step===6)d.checked=[];step++}
else if(act==='budget-pilot'){
  if(d.program!=='Лайт'||Math.floor(d.seed/2)%2!==0){d.program='Лайт';d.seed=0;d.budgetPilot=true}
  else d.budgetPilot=!d.budgetPilot;
  d.checked=[];
}
else if(act==='budget-demo'){d.demoBudgetPrices=!d.demoBudgetPrices;d.checked=[]}
else if(act==='budget-retry'){pilotError=false}
else if(act==='retry'){catalogError=false}else if(act==='back')step--;else if(act==='edit')step=0;else if(act==='add')d.kids.push(7);else if(act.startsWith('remove-'))d.kids.splice(Number(act.slice(7)),1);else if(act==='menu'||act==='basket')shopping=act==='basket';else if(act==='shuffle'){d.seed++;d.checked=[];d.choices={}}else if(act==='print'){window.print();return}
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
  step=-1;
  shopping=false;
  save();
  render();
  app.focus({preventScroll:true});
  window.scrollTo(0,0);
});
if(location.hash==='#start'){
 history.replaceState(null,'',location.pathname+location.search);
 firstQuestion();
}else render();
