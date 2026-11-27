/* Exact v3.41 presentation-only reversal to EVERY immutable v3.40 byte.
   Prior source guards still cover all finance, stock, cloud, fonts and receipts. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createHash}=require('node:crypto');
const hooks=[
  [
    "const APP_VERSION = \"3.41\";",
    "const APP_VERSION = \"3.40\";",
    1
  ],
  [
    "      'v3.41 — <b style=\"color:var(--ink)\">Premium Stock PDF design</b>: Approved navy / emerald header, saved company logo on every page, real summary cards / stock-health ring, readable highlighted balances / minimum warnings, exact unit-wise totals aur compact continuation pages. Available Stock, filtered History aur one-combo PDFs; original dates, source notes, tags, filters aur download/share guards retained. Stock / financial data mein koi migration ya badlav nahi.<br>'+\n      'v3.40 — <b style=\"color:var(--ink)\">Private received-stock list link</b>",
    "      'v3.40 — <b style=\"color:var(--ink)\">Private received-stock list link</b>",
    1
  ],
  [
    "Naya navy / emerald design · Company logo apne-aap. Saare matching pages included.</p>",
    "Company logo apne-aap. Saare matching pages included.</p>",
    1
  ]
];
function withoutStockPdf(source){
 const start='/* v3.41 PREMIUM STOCK PDF BEGIN',end='/* v3.41 PREMIUM STOCK PDF END */';
 if(!source.includes(start))return source;
 assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
 const original=fs.readFileSync(path.join(__dirname,'..','Hisaab-Pro-v3.40.html'),'utf8');
 assert.equal(createHash('sha256').update(original).digest('hex'),"e85d8df64c37119655f8cc5e75b2024b9614217108d09543f71fc4c3aad2abb3");
 const premium=fs.readFileSync(path.join(__dirname,'..','scripts/stock-pdf/stock-pdf.js'),'utf8').trimEnd()+'\n';
 assert.equal(createHash('sha256').update(premium).digest('hex'),"20df1c7dde1f991df5e637103d256734cf16e862c3e1f1c08f9276469145985a");
 const from=source.indexOf(start),to=source.indexOf(end)+end.length+1;
 assert.equal(source.slice(from,to),premium,'exact bounded approved PDF renderer');
 const oldFrom=original.indexOf('function stePdfString(report) {'),oldTo=original.indexOf('function steScreenFilters()',oldFrom);
 source=source.slice(0,from)+original.slice(oldFrom,oldTo)+source.slice(to);
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact Stock PDF hook: '+from.slice(0,100));source=source.split(from).join(to);}
 return source;
}
module.exports={withoutStockPdf,hooks};
