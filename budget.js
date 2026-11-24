'use strict';

// All costs in this file are integer kopecks. Ingredient quantities are raw grams.
function purchaseCost(grams,quote){
  if(quote.packG)return Math.ceil(grams/quote.packG)*quote.kopecks;
  return Math.round(grams*quote.kopecks/1000);
}

function budgetProducts(week,grams){
  const products=new Set();
  for(const meal of week.flatMap(day=>day.meals)){
    for(const dish of [...meal.dishes,...meal.hot]){
      for(const name of Object.keys(grams[meal.menuId]?.[dish.name]||{}))products.add(name);
    }
  }
  return [...products].sort((a,b)=>a.localeCompare(b,'ru'));
}

function planBudget(week,grams,quotes,budget){
  const quantities=new Map();
  const options=[];
  let unmeasured=0;
  let emptyMeals=0;

  function portion(meal,dish){
    const recipe=grams[meal.menuId]?.[dish.name];
    if(!recipe)unmeasured++;
    return Object.entries(recipe||{}).map(([name,g])=>[name,g*meal.portions]);
  }

  function adjust(items,sign){
    let delta=0;
    for(const [name,g] of items){
      const previous=quantities.get(name)||0;
      const next=previous+sign*g;
      const quote=quotes.get(name);
      if(quote)delta+=purchaseCost(next,quote)-purchaseCost(previous,quote);
      if(next)quantities.set(name,next);
      else quantities.delete(name);
    }
    return delta;
  }

  let subtotal=0;
  for(const meal of week.flatMap(day=>day.meals)){
    if(!meal.dishes.length&&!meal.hot.length)emptyMeals++;
    for(const dish of meal.dishes)subtotal+=adjust(portion(meal,dish),1);
    if(meal.hot.length){
      const candidates=meal.hot.map(dish=>({dish,items:portion(meal,dish)}));
      const priced=candidates.filter(option=>option.items.every(([name])=>quotes.has(name)));
      options.push({meal,candidates,priced});
    }
  }
  const partialOptions=options.some(({candidates,priced})=>priced.length<candidates.length);
  const fixedPriced=[...quantities.keys()].every(name=>quotes.has(name));

  let best=null;
  const trial=[];
  // Search every priced combination of the first Light week's hot alternatives.
  function search(index,total,changes){
    if(index===options.length){
      const fits=total<=budget;
      const priority=fits?changes:Infinity;
      if(!best||priority<best.priority||priority===best.priority&&total<best.total){
        best={priority,total,fits,choices:trial.slice()};
      }
      return;
    }
    for(const candidate of options[index].priced){
      const extra=adjust(candidate.items,1);
      trial.push(candidate);
      search(index+1,total+extra,changes+Number(candidate.dish!==options[index].meal.selected));
      trial.pop();
      adjust(candidate.items,-1);
    }
  }

  if(!unmeasured&&fixedPriced&&options.every(option=>option.priced.length))search(0,subtotal,0);
  const selection=new Map();
  for(const [index,{meal,candidates}] of options.entries()){
    const chosen=best?.choices[index]||candidates.find(option=>option.dish===meal.selected)||candidates[0];
    subtotal+=adjust(chosen.items,1);
    selection.set(meal.choiceKey,chosen.dish);
  }
  const items=[...quantities].sort(([a],[b])=>a.localeCompare(b,'ru')).map(([name,g])=>{
    const quote=quotes.get(name);
    return {name,g,quote,cost:quote?purchaseCost(g,quote):null};
  });
  return {
    items,subtotal,selection,unmeasured,partialOptions,emptyMeals,
    missing:items.filter(item=>item.cost===null).length,
    demo:items.some(item=>item.quote?.kind==='demo'),
    matches:emptyMeals?null:best?.fits??null,
  };
}

function exampleRate(product){
  const name=product.toLowerCase();
  if(/палтус|лосось|нерка|гребешок|орех кедровый|кревет|сибас/.test(name))return 1300;
  if(/говя|утки|утиное|кролик|судак|треск|окунь|горбуш|кета|кальмар|индейк|морской коктейль|сыр|семена|орех|агар|годжи|ванилин|тимьян|базилик|киноа|шоколад|масло оливковое/.test(name))return 720;
  if(/лук|картофель|морковь|свёкл|свекл|капуста белокочанная|^капуста$|молоко|мука|пшено|крупа/.test(name))return 110;
  return 350;
}
