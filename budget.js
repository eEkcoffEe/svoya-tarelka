'use strict';

const fold=value=>String(value).toLowerCase().replaceAll('ё','е').replace(/[^а-яa-z0-9]+/g,' ').trim();
const portionFor=(meal,answers)=>answers.family.includes(meal)
  ? answers.adults+answers.kids.reduce((sum,age)=>sum+(age<7?.5:age<13?.75:1),0)
  : 1;

function wordStem(word){
  if(word.length<4)return word;
  return word.replace(/(?:иями|ями|ами|ого|ему|ому|ими|ыми|ами|ова|евы|ой|ый|ая|ое|ые|ие|ов|ев|ей|ам|ям|ом|ем|ах|ях|[аяыиуео])$/,'');
}

function productExcluded(product,words){
  const names=[product.name,...(product.aliases||[])].map(fold);
  return words.some(exclusion=>{
    const parts=exclusion.split(' ').map(wordStem);
    return names.some(name=>{
      if(name===exclusion)return true;
      const tokens=name.split(' ').map(wordStem);
      return parts.every(part=>tokens.some(token=>token===part||part.length>=5&&token.startsWith(part)));
    });
  });
}

function eligibleRecipes(catalog,answers){
  const exclusions=[...answers.avoid,...answers.custom.split(/[,;\n]+/)].map(value=>fold(value).replace(/^(?:без |не (?:ем|едим) )/,'')).filter(Boolean);
  const banned=new Set(Object.entries(catalog.products).filter(([,product])=>
    product.allergens?.some(allergen=>answers.allergy.includes(allergen))||productExcluded(product,exclusions)
  ).map(([id])=>id));
  const candidates=[];
  for(const recipe of catalog.recipes){
    if(Object.keys(recipe.ingredients).some(id=>banned.has(id)))continue;
    const method=recipe.methods.find(entry=>entry.equipment.every(tool=>answers.gear.includes(tool)));
    if(method)candidates.push({...recipe,method});
  }
  return candidates;
}

function plannerQuotes(products,answers){
  const prices=answers.budgetPrices[answers.shop]||{};
  return new Map(Object.entries(products).map(([id,product])=>{
    const manual=prices[product.name];
    if(manual && Number.isFinite(manual.kopecks) && manual.kopecks>0 &&
       Number.isFinite(manual.packG) && manual.packG>=0)return [id,{...manual,kind:'manual'}];
    if(id==='water')return [id,{kopecks:0,packG:0,kind:'estimate'}];
    const quote=localQuotes(product.name).find(entry=>entry.shop===answers.shop);
    if(quote)return [id,{...quote,kind:'catalog',kopecks:Math.round(quote.price*100)}];
    const packG=product.estimatePackG||0;
    return [id,{kind:'estimate',packG,kopecks:Math.round(product.estimatePerKg*(packG||1000)/10)}];
  }));
}

function purchaseCost(grams,quote){
  return quote.packG
    ? Math.ceil(grams/quote.packG)*quote.kopecks
    : Math.round(grams*quote.kopecks/1000);
}

function buildPlan(catalog,answers){
  const eligible=eligibleRecipes(catalog,answers);
  const quotes=plannerQuotes(catalog.products,answers);
  const budget=Math.round(answers.budget*100);
  const pool=new Map(answers.meals.map(meal=>{
    const portions=portionFor(meal,answers);
    return [meal,eligible.filter(recipe=>recipe.meals.includes(meal)).map(recipe=>{
      const items=Object.entries(recipe.ingredients).map(([id,g])=>[id,g*portions]);
      const proportional=items.reduce((total,[id,g])=>{
        const quote=quotes.get(id);
        return total+g*quote.kopecks/(quote.packG||1000);
      },0);
      return {recipe,items,proportional};
    })];
  }));
  const days=Array.from({length:7},()=>answers.meals.map(meal=>({
    name:meal,portions:portionFor(meal,answers),candidates:pool.get(meal),selected:null,
  })));
  const slots=days.flat().filter(slot=>slot.candidates.length);
  const missingMeals=answers.meals.filter(meal=>!pool.get(meal).length);
  const quantities=new Map();
  const counts=new Map();
  let total=0;

  function additionalCost(candidate,sign=1){
    return candidate.items.reduce((delta,[id,grams])=>{
      const previous=quantities.get(id)||0;
      const quote=quotes.get(id);
      return delta+purchaseCost(previous+sign*grams,quote)-purchaseCost(previous,quote);
    },0);
  }

  function change(candidate,sign){
    if(!candidate)return;
    total+=additionalCost(candidate,sign);
    for(const [id,grams] of candidate.items){
      const next=(quantities.get(id)||0)+sign*grams;
      if(next)quantities.set(id,next);
      else quantities.delete(id);
    }
    const id=candidate.recipe.id;
    counts.set(id,(counts.get(id)||0)+sign);
  }

  function select(slot,candidate){
    change(slot.selected,-1);
    slot.selected=candidate;
    change(candidate,1);
  }

  function ordered(slot,index){
    const offset=(answers.seed+index)%slot.candidates.length;
    return [...slot.candidates.slice(offset),...slot.candidates.slice(0,offset)];
  }

  function best(options,score){
    let chosen;
    let value=Infinity;
    for(const option of options){
      const number=score(option);
      if(number<value){chosen=option;value=number}
    }
    return chosen;
  }

  // Start both with proportional prices and with a pack-aware greedy fill.
  const starts=[option=>option.proportional,option=>additionalCost(option)];
  let cheapestTotal=Infinity;
  let cheapest=[];
  for(const score of starts){
    slots.forEach((slot,index)=>{
      select(slot,null);
      select(slot,best(ordered(slot,index),score));
    });
    for(let pass=0;pass<3;pass++){
      const before=total;
      slots.forEach((slot,index)=>{
        const previous=slot.selected;
        select(slot,null);
        const candidate=best(ordered(slot,index),option=>additionalCost(option));
        select(slot,additionalCost(candidate)<additionalCost(previous)?candidate:previous);
      });
      if(before===total)break;
    }
    if(total<cheapestTotal){
      cheapestTotal=total;
      cheapest=slots.map(slot=>slot.selected);
    }
    slots.forEach(slot=>select(slot,null));
  }

  slots.forEach((slot,i)=>select(slot,cheapest[i]));
  if(total<=budget){
    // Replace repeated dishes with less-used options whenever the full basket still fits.
    for(let pass=0;pass<2;pass++){
      slots.forEach((slot,index)=>{
        const previous=slot.selected;
        select(slot,null);
        const previousCount=counts.get(previous.recipe.id)||0;
        const alternatives=ordered(slot,index).filter(option=>
          (counts.get(option.recipe.id)||0)<previousCount&&total+additionalCost(option)<=budget
        );
        const candidate=best(alternatives,option=>counts.get(option.recipe.id)||0);
        select(slot,candidate||previous);
      });
    }
  }

  const basket=[...quantities].filter(([id])=>id!=='water').map(([id,grams])=>{
    const product=catalog.products[id];
    const quote=quotes.get(id);
    return {id,name:product.name,grams,quote,cost:purchaseCost(grams,quote)};
  }).sort((a,b)=>a.name.localeCompare(b.name,'ru'));
  return {days,basket,total,budget,missingMeals,
    status:missingMeals.length?'incomplete':total<=budget?'within':'over',
    estimates:basket.filter(item=>item.quote.kind==='estimate').length};
}
