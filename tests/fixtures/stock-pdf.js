/* Synthetic design / pagination data only; not a customer's catalogue. */
const {legacy,clone,product,movement,blank}=require('./stock');
const EXAMPLE_ROWS=[
  ['Practice cue', 'box', 120, 10, 20, 10],
  ['Pool ball sample', 'box', 60, 5, 10, 8],
  ['Cloth sample', 'roll', 18, 2, 4, 3],
  ['Table brush sample', 'pcs', 80, 8, 12, 10],
  ['Pocket sample', 'set', 25, 3, 4, 5],
  ['Chalk sample', 'box', 30, 4, 20, 10],
  ['Case sample', 'box', 40, 5, 10, 5],
  ['Railing sample', 'set', 16, 2, 4, 2]
];
function overview() {
  const data=clone(legacy),s=blank();
  data.settings.shopName='EXAMPLE BILLIARDS';data.settings.address='Sample report for design verification';data.settings.ownerName='';data.settings.phone='';
  EXAMPLE_ROWS.forEach(([name,unit,totalIn,out,sale,minQty],i)=>{
    const id='design-product-'+i;s.products.push(product(id,{name,unit,minQty}));
    s.transactions.push(movement('design-opening-'+i,id,'in',totalIn,'2026-11-01',{productName:name,unit,source:'opening',purpose:'Opening stock',note:'Synthetic opening',sequence:100+i*3}));
    s.transactions.push(movement('design-out-'+i,id,'out',out,'2026-11-02',{productName:name,unit,purpose:'Sample usage',note:'Synthetic usage',sequence:101+i*3}));
    s.transactions.push(movement('design-sale-'+i,id,'sale',sale,'2026-11-03',{productName:name,unit,note:'Synthetic sale',sequence:102+i*3}));
  });
  data.settings.stockInventory=s;return data;
}
function many(count=128,options={}) {
  const data=overview(),s=blank();
  for(let i=0;i<count;i++){
    const id='many-product-'+String(i).padStart(4,'0'),unit=options.manyUnits?'custom unit '+String(i).padStart(3,'0'):['box','pcs','roll','bundle'][i%4],name='Example product '+String(i).padStart(4,'0')+(options.long?' '+('Wide W product ').repeat(4).trim():'');
    const p=product(id,{name:name.slice(0,90),unit,minQty:i%9===0?21:0});s.products.push(p);
    s.transactions.push(movement('many-in-'+i,id,'in',20,'2026-11-01',{productName:p.name,unit,source:'opening',purpose:'Opening stock',sequence:100+i}));
  }
  data.settings.stockInventory=s;return data;
}
module.exports={overview,many,EXAMPLE_ROWS};
