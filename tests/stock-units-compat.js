/* Exact v3.39 product-unit picker allowlist. Recover EVERY immutable v3.38
   byte before prior name/combo/easy/message/source guards; no guard is removed. */
const assert=require('node:assert/strict');
const hooks=[
  [
    "const APP_VERSION = \"3.39\";",
    "const APP_VERSION = \"3.38\";",
    1
  ],
  [
    "      'v3.39 — <b style=\"color:var(--ink)\">Add product mein 30 unit choices</b>: Box, set, bundle, roll, pcs, carton, pair aur weight/volume/length units ab visible dropdown mein. Other / custom unit bhi retained; purane unit labels, stock, unit-lock, message combos aur 75% matching unchanged. Koi automatic conversion nahi.<br>'+\n      'v3.38 — <b style=\"color:var(--ink)\">75% naam match par product apne-aap</b>",
    "      'v3.38 — <b style=\"color:var(--ink)\">75% naam match par product apne-aap</b>",
    1
  ],
  [
    "    stuFieldHTML(p?.unit || 'pcs') +",
    "    stkField('Unit *', '<input class=\"inp\" id=\"stkPUnit\" required maxlength=\"18\" value=\"' + esc(p?.unit || 'pcs') + '\" list=\"stkUnits\"><datalist id=\"stkUnits\"><option value=\"pcs\"><option value=\"kg\"><option value=\"metre\"><option value=\"box\"><option value=\"litre\"></datalist>', 'Ek product ki ek unit. Movements ke baad unit lock rahegi.') +",
    1
  ]
];
function withoutStockUnits(source){
 source=require('./stock-receipt-compat').withoutStockReceipt(source);
 if(!source.includes('/* v3.39 STOCK UNIT CHOICES BEGIN'))return source;
 for(const[start,end]of [['/* v3.39 STOCK UNIT CHOICES BEGIN','/* v3.39 STOCK UNIT CHOICES END */'],['/* v3.39 STOCK UNIT STYLE BEGIN */','/* v3.39 STOCK UNIT STYLE END */']]){
  assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
  let tail=source.indexOf(end)+end.length;if(source[tail]==='\n')tail++;if(start.includes('CHOICES')&&source[tail]==='\n')tail++;
  source=source.slice(0,source.indexOf(start))+source.slice(tail);
 }
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact product-unit hook: '+from.slice(0,100));source=source.split(from).join(to);}
 return source;
}
module.exports={withoutStockUnits,hooks};
