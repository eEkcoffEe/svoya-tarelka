// Значения в строке идут в порядке products. Для фасованных продуктов
// указана цена упаковки, kg содержит её массу в килограммах.
const tyumenCatalog = [
  {
    date: '21.11.2026', source: 'https://tumen.shopoclick.ru/borshchevoy-nabor',
    products: ['Картофель','Капуста','Свёкла','Морковь','Лук'], kg: [1,1,1,1,1],
    shops: {
      'Магнит':[38,27,36,32,37], 'Чижик':[49,29,29,29,39],
      'Пятёрочка':[42,39,38,40,39], 'Лента':[42,33,37,41,46],
      'Метро':[45,35,71,37,43], 'Ашан':[50,39,48,39,57],
      'Перекрёсток':[60,56,66,72,44], 'Самокат':[73,68,138,99,99]
    }
  },
  {
    date:'12.11.2026', source:'https://tumen.shopoclick.ru/otchet',
    products:['Гречка','Рис','Творог','Макароны'], kg:[1,1,0.2,0.45],
    note:'Собственные марки', formats:{'Магнит':'Магнит Семейный','Лента':'Лента Гипер'},
    shops:{
      'Перекрёсток':[122,144,73,22], 'Магнит':[74,125,62,19],
      'Метро':[61,69,63,33], 'Лента':[54,110,57,28],
      'Самокат':[128,143,116,78], 'Ашан':[57,46,72,23], 'Пятёрочка':[93,44,58,20]
    }
  },
  {
    date:'21.11.2026', source:'https://tumen.shopoclick.ru/olivye',
    products:['Куриное филе'],kg:[1],shops:{
      'Магнит':[445],'Пятёрочка':[500],'Чижик':[449],'Метро':[549],
      'Перекрёсток':[540],'Лента':[515],'Ашан':[756],'Самокат':[523]
    }
  },
  {
    date:'проверено 24.11.2026', source:'https://www.perekrestok.ru/shops/shop/324',
    note:'Акция, ул. 50 лет Октября, 14',details:['Ред Чиф','Конференс'],
    products:['Яблоко','Груша'],kg:[1,1],shops:{'Перекрёсток':[129.99,299.99]}
  }
];

function localQuote(shop,product){
  for(const entry of tyumenCatalog){
    const index=entry.products.indexOf(product);
    const value=entry.shops[shop]?.[index];
    if(value===undefined)continue;
    return {rate:value/entry.kg[index],url:entry.source,
      label:[entry.formats?.[shop]||shop,entry.date,entry.note,entry.details?.[index]].filter(Boolean).join(' · ')};
  }
  return null;
}
