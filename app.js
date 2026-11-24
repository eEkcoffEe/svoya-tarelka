'use strict';
const stores=['Пятёрочка','Магнит','Дикси','Чижик','Светофор','Перекрёсток','Лента','Ашан','Метро','ВкусВилл','Азбука вкуса','Яндекс Лавка','Самокат','Другой магазин'];
const mealNames=['Завтрак','Второй завтрак','Обед','Полдник','Ужин','Поздний ужин'], equipment=['Плита','Духовка','Микроволновка','Мультиварка','Аэрогриль','Блендер','Пароварка','Сковорода-гриль'];
const allergies=['Орехи','Арахис','Молоко','Яйца','Глютен','Рыба','Морепродукты','Соя','Мёд','Цитрусовые','Кунжут'];
const defaults={shop:'',budget:5000,adults:1,kids:[],meals:['Завтрак','Обед','Ужин'],family:[],allergy:[],avoid:[],custom:'',gear:['Плита'],checked:[],seed:0,budgetPrices:{}};
const key='svoya-tarelka-v1';
let d=structuredClone(defaults),step=-1,shopping=false;
try{const saved=JSON.parse(localStorage.getItem(key));if(saved){for(const field of Object.keys(defaults))if(Object.hasOwn(saved.d,field))d[field]=saved.d[field];step=Math.max(-1,Math.min(7,saved.step))}}catch{}
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
if(step<0){app.innerHTML=`<section class="hero"><div class="copy"><div class="eyebrow">Меню на 7 дней</div><h1>Ваша неделя <i>на тарелке</i></h1><p>Ответьте на вопросы о бюджете, семье и продуктах. Получите меню на неделю и список покупок.</p>${btn('Собрать рацион','next')}<div class="under">Около 2 минут · Без регистрации</div></div><div class="photo" role="img" aria-label="Салат из свежих овощей и зелени"><span class="phototag">Рацион на неделю</span></div></section><section class="features"><article><span class="ico">◷</span><h3>Меню на каждый день</h3><p>Выберите до шести приёмов пищи на день.</p></article><article><span class="ico">♧</span><h3>По вашему вкусу</h3><p>Учитываем технику и исключённые продукты.</p></article><article><span class="ico">☷</span><h3>Один список покупок</h3><p>Ингредиенты на неделю, количество упаковок и расчёт стоимости.</p></article></section>`;return}
if(step===7){result();return}
const count=d.adults+d.kids.length;
const screens=[
()=>page('Где покупаете продукты?','Выберите магазин и укажите бюджет на неделю. Для товаров без цены магазина используем справочную оценку.',opts(stores,'shop')+num('Бюджет на неделю, ₽','budget',100,1000000,d.budget)),
()=>page('На кого готовим?','Укажите взрослых и детей, чтобы рассчитать количество порций.',num('Взрослые','adults',1,20,d.adults)+d.kids.map((age,i)=>num('Возраст ребёнка, лет','kid-'+i,1,17,age)+btn('Убрать ребёнка','remove-'+i,'secondary')).join('')+btn('Добавить ребёнка','add','secondary')),
()=>page('Какие приёмы пищи включить?','Отметьте приёмы пищи, которые хотите видеть в плане.',opts(mealNames,'meals')+(count>1?'<h3>Готовим на всю семью</h3><p>Остальные приёмы рассчитаны на одну порцию. Детские порции учитываются по возрасту.</p>'+opts(d.meals,'family'):'')),
()=>page('Есть ли аллергии?','Отметьте группы продуктов, которые нужно исключить. Если ограничений нет, переходите дальше.',opts(allergies,'allergy')),
()=>page('Что вы не едите?','Выберите продукты или впишите ингредиенты через запятую.',opts(['Свинина','Говядина','Грибы','Лук','Баклажаны','Кинза','Оливки','Творог','Печень','Тофу','Перловка'],'avoid')+`<label class="field">Другие продукты<input data-input="custom" value="${esc(d.custom)}" placeholder="Например, рис, морковь"></label>`),
()=>page('Что есть на кухне?','Выберите доступную технику. Если ничего не выбрать, в меню попадут блюда без нагрева, для которых не нужна техника.',opts(equipment,'gear')),
()=>page('Всё верно?','По этим настройкам соберём меню на семь дней.',`<p><b>Магазин</b> · ${esc(d.shop)}<br><b>Бюджет</b> · ${d.budget} ₽<br><b>Семья</b> · взрослых ${d.adults}, детей ${d.kids.length}<br><b>Приёмы пищи</b> · ${d.meals.join(', ')}<br><b>На всю семью</b> · ${d.family.join(', ')||'не выбрано'}<br><b>Исключения</b> · ${esc([...d.allergy,...d.avoid,d.custom].filter(Boolean).join(', ')||'нет')}<br><b>Техника</b> · ${d.gear.join(', ')||'без нагрева'}</p>`)
];app.innerHTML=screens[step]()}
const catalogUrl=new URL('recipes.json',document.currentScript.src);
let catalog;
let catalogRequest;
let catalogError=false;

function loadCatalog(){
  if(catalogRequest)return;
  catalogRequest=fetch(catalogUrl).then(response=>{
    if(!response.ok)throw new Error('Не удалось загрузить рецепты');
    return response.json();
  }).then(data=>{
    if(!data.products||!Array.isArray(data.recipes)||!data.recipes.length)throw new Error('Каталог пуст');
    catalog=data;
  }).catch(()=>{
    catalogError=true;
  }).finally(()=>{
    catalogRequest=null;
    if(step===7)render();
  });
}

const numberRu=value=>value.toLocaleString('ru-RU',{maximumFractionDigits:2});
const money=kopecks=>numberRu(kopecks/100)+' ₽';

function planSummary(plan){
  let summary;
  if(plan.status==='within'){
    summary=`Расчётная корзина укладывается в бюджет. Остаток ${money(plan.budget-plan.total)}.`;
  }else if(plan.status==='over'){
    summary=`Подбор не нашёл меню в пределах бюджета. Показанный вариант дороже на ${money(plan.total-plan.budget)}.`;
  }else{
    summary=`Полное меню не получилось. Нет подходящих блюд для выбранных приёмов пищи: ${esc(plan.missingMeals.join(', '))}.`;
  }
  const label=plan.status==='incomplete'?'Учтённая часть корзины':'Стоимость корзины';
  const estimate=plan.estimates?` · справочная цена у ${plan.estimates} поз.`:'';
  return `<p class="plan-summary" role="status"><strong>${label} · ${money(plan.total)}</strong>${estimate}<br>${summary}</p>`;
}

function recipeDetails(meal){
  if(!meal.selected)return `<p class="meal"><strong>${esc(meal.name)}</strong> · нет подходящего блюда</p>`;
  const recipe=meal.selected.recipe;
  const ingredients=Object.entries(recipe.ingredients).map(([id,grams])=>
    `${catalog.products[id].name} ${numberRu(grams*meal.portions)} г`
  );
  const technique=recipe.method.equipment.join(', ')||'Без нагрева';
  return `<details class="meal"><summary>${esc(meal.name)} · ${esc(recipe.name)}</summary>
    <p><strong>Порции:</strong> ${numberRu(meal.portions)} · ${esc(technique)}</p>
    <p>${esc(ingredients.join(', '))}</p><p>${esc(recipe.method.steps)}</p></details>`;
}

function shoppingRates(name){
  const quotes=localQuotes(name);
  if(!quotes.length)return '';
  const selected=quotes.find(quote=>quote.shop===d.shop);
  const best=quotes[0];
  const rate=quote=>money(Math.round(quote.rate*100))+'/кг';
  const label=selected?`${esc(selected.shop)} · ${rate(selected)}`:`${esc(d.shop)} · цены в источнике нет`;
  return `<details class="shopping-rates"><summary>${label}${best!==selected?` · от ${rate(best)} в «${esc(best.shop)}»`:''}
    · ${quotes.length>1?'сравнить цены':'источник цены'}</summary>
    <ul>${quotes.map(quote=>`<li>${rate(quote)} · <a href="${esc(quote.url)}" target="_blank"
      rel="noopener noreferrer">${esc(quote.label)}</a></li>`).join('')}</ul></details>`;
}

function shoppingItem({name,grams,quote,cost}){
  const packs=quote.packG?` · ${Math.ceil(grams/quote.packG)} уп. × ${quote.packG} г`:'';
  const note={manual:'Цена введена вручную',estimate:'Справочная цена'}[quote.kind];
  return `<div class="shopping-item"><label><input type="checkbox" data-buy="${esc(name)}"
    ${d.checked.includes(name)?'checked':''}> <span>${esc(name)} · ${numberRu(grams)} г${packs} · ${money(cost)}</span></label>
    ${note?`<small class="shopping-rates">${note}</small>`:''}${shoppingRates(name)}</div>`;
}

function budgetPriceForm(plan){
  const saved=d.budgetPrices[d.shop]||{};
  const basketIds=new Set(plan.basket.map(item=>item.id));
  const rows=Object.entries(catalog.products).filter(([id])=>id!=='water')
    .sort(([a,x],[b,y])=>Number(basketIds.has(b))-Number(basketIds.has(a))||x.name.localeCompare(y.name,'ru'))
    .map(([,product])=>{
      const name=product.name;
      const manual=saved[name];
      const quote=localQuotes(name).find(entry=>entry.shop===d.shop);
      const estimatePack=product.estimatePackG||0;
      const price=quote?.price??Math.round(product.estimatePerKg*(estimatePack||1000)/10)/100;
      const packG=quote?.packG??estimatePack;
      return `<div class="budget-price-row" data-price-product="${esc(name)}">
        <strong>${esc(name)}</strong>
        <label>Цена, ₽<input type="number" min="0.01" max="1000000" step="0.01" data-price
          value="${manual?manual.kopecks/100:''}" placeholder="${price}"></label>
        <label>Упаковка, г<input type="number" min="1" max="100000" step="1" data-pack
          value="${manual?.packG||''}" placeholder="${packG||''}"></label>
      </div>`;
    }).join('');
  return `<details class="budget-price-form"><summary>Уточнить цены для «${esc(d.shop)}»</summary>
    <form data-budget-prices>
      <p>Введите цену за килограмм или цену и вес упаковки. Чтобы удалить свою цену, очистите оба поля. Продукты из корзины показаны первыми.</p>
      <div class="budget-price-grid">${rows}</div><p role="alert"></p>
      <button class="primary" type="submit">Сохранить цены и пересчитать меню</button>
    </form></details>`;
}

function result(){
  if(!catalog){
    app.innerHTML=catalogError
      ? `<section class="panel"><p role="alert">Не удалось загрузить каталог рецептов.</p>${btn('Повторить','retry')}</section>`
      : '<section class="panel"><p role="status">Загружаем рецепты…</p></section>';
    if(!catalogError)loadCatalog();
    return;
  }
  const plan=buildPlan(catalog,d);
  const menu=plan.days.map((meals,i)=>`<section class="day"><h3>${days[i]}</h3>${meals.map(recipeDetails).join('')}</section>`).join('');
  const basket=plan.basket.map(shoppingItem).join('');
  const allergyNote=d.allergy.length?'<p>При покупке проверьте состав и маркировку продуктов на упаковке.</p>':'';
  const fillNote='<p>Список рассчитан по весу ингредиентов и целым упаковкам, где фасовка известна. Для товаров без цены выбранного магазина используется справочная оценка.</p>';
  app.innerHTML=`<section class="panel"><div class="eyebrow">Ваш рацион · 7 дней</div>
    <h2>${shopping?'Список покупок':'Меню на неделю'}</h2>
    <p>${esc(d.shop)} · бюджет ${numberRu(d.budget)} ₽</p>${planSummary(plan)}${allergyNote}
    <div class="opts switch">${btn('Меню','menu',shopping?'secondary':'primary')}${btn('Список покупок','basket',shopping?'primary':'secondary')}</div>
    ${shopping?fillNote+'<div class="shopping">'+(basket||'<p>Список пока пуст.</p>')+'</div>'+budgetPriceForm(plan):menu}
    <div class="nav">${btn('Изменить ответы','edit','secondary')}${btn('Печать','print','secondary')}${btn('Другой вариант','shuffle','secondary')}</div></section>`;
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

app.addEventListener('input',event=>{
  const field=event.target.dataset.input;
  if(!field)return;
  const value=event.target.type==='number'?Number(event.target.value):event.target.value;
  if(field.startsWith('kid-'))d.kids[Number(field.slice(4))]=value;
  else d[field]=value;
  save();
});

app.addEventListener('change',event=>{
  const product=event.target.dataset.buy;
  if(!product)return;
  d.checked=event.target.checked?[...new Set([...d.checked,product])]:d.checked.filter(name=>name!==product);
  save();
});

app.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  const {act,field,val}=button.dataset;
  if(!act&&!field)return;

  if(field){
    if(Array.isArray(d[field])){
      d[field]=d[field].includes(val)?d[field].filter(value=>value!==val):[...d[field],val];
    }else d[field]=val;
    if(field==='meals')d.family=d.family.filter(meal=>d.meals.includes(meal));
  }else if(act==='next'){
    for(const input of app.querySelectorAll('input[type=number]'))if(!input.reportValidity())return;
    const error=step===0&&!d.shop?'Выберите магазин.':step===2&&!d.meals.length?'Выберите хотя бы один приём пищи.':'';
    if(error){app.querySelector('.alert').textContent=error;return}
    if(step===6)d.checked=[];
    step++;
  }else if(act==='retry')catalogError=false;
  else if(act==='back')step--;
  else if(act==='edit')step=0;
  else if(act==='add')d.kids.push(7);
  else if(act.startsWith('remove-'))d.kids.splice(Number(act.slice(7)),1);
  else if(act==='menu'||act==='basket')shopping=act==='basket';
  else if(act==='shuffle'){d.seed++;d.checked=[]}
  else if(act==='print'){window.print();return}

  save();
  render();
  if(['next','back','edit','menu','basket'].includes(act))window.scrollTo(0,0);
  if(field)Array.from(app.querySelectorAll('[data-field]')).find(item=>item.dataset.field===field&&item.dataset.val===val)?.focus();
});

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
