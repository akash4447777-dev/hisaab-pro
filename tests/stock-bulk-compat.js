/* Exact v3.44 Smart / Bulk Paste reversal to EVERY immutable v3.43 byte.
   All existing matcher / Sales / OCR / PDF / stock writer / finance / sync
   integration remains protected by the complete older compatibility chain. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const BASE_SHA="58e76b330ffbd6137fef3467b232e8293d8119448aaa00aff7c8d06974ced9e8";
const hooks=[
  [
    "const APP_VERSION = \"3.44\";",
    "const APP_VERSION = \"3.43\";",
    1
  ],
  [
    "      'v3.44 — <b style=\"color:var(--ink)\">Intelligent Smart Paste + Bulk Item Add via Paste</b>: Incoming-only bulk surface, optional common actual date/unit, flexible headed/headerless copied columns and whitelisted spelling/cell-order repairs. Saved-product stock ADD through the same dated audited writer; safe same-paste fuzzy new-name grouping prevents duplicate catalogue items, without transitive / unit / variant guesses. Invalid rows held with editable per-row corrections and same-source continuation; visible before + In - Out = available, saved/recorded/unresolved report and premium saved-only PDF. Original sources, exact units, opening/dated ledger/dedup/account/cancel/rollback guards retained. No migration, second ledger, external AI upload or finance change.<br>'+\n      'v3.43 — <b style=\"color:var(--ink)\">Smart Stock Sale + highlighted product matches</b>",
    "      'v3.43 — <b style=\"color:var(--ink)\">Smart Stock Sale + highlighted product matches</b>",
    1
  ],
  [
    "<button class=\"btn primary\" data-sbp=\"open\">＋ Bulk Item Add via Paste</button><button class=\"btn\" data-sap=\"open\">⚡ Smart Paste</button><button class=\"btn\" data-stm=\"open\">Message / screenshot · review</button>",
    "<button class=\"btn primary\" data-sap=\"open\">⚡ Smart Paste</button><button class=\"btn\" data-stm=\"open\">Message / screenshot · review</button>",
    1
  ],
  [
    "    bulkPaste: { parse:(text,options={},data)=>sapParse(text,sbpOptions(options),data), plan:async(text,options={},data)=>sapPlan(text,sbpOptions(options),data), apply:async(text,options,context,signature,consent)=>sapApply(text,sbpOptions(options),context,signature,consent), process:async(text,options={},context=stkContext(),consent)=>sapProcess(text,sbpOptions(options),context,consent), open:sbpOpen },\n    smartPaste: { parse:sapParse, plan:sapPlan, apply:sapApply, process:sapProcess, open:sapOpen },",
    "    smartPaste: { parse:sapParse, plan:sapPlan, apply:sapApply, process:sapProcess, open:sapOpen },",
    1
  ]
];
const modules=[
  [
    "/* v3.44 SMART BULK PASTE BEGIN",
    "/* v3.44 SMART BULK PASTE END */",
    "4a89b24300d69021c2a9db0a5d465134ac9ff0f56a662c38aaefeffbe6c6cfaf",
    "/* v3.42 SMART STOCK PASTE BEGIN",
    "/* v3.42 SMART STOCK PASTE END */",
    "498bf234956beb2eef29e1c70c4782d368631dac790f9948cb01d278e171bb1d"
  ],
  [
    "/* v3.44 SMART BULK PASTE STYLE BEGIN */",
    "/* v3.44 SMART BULK PASTE STYLE END */",
    "df0966a004019d576f8d469df292a23027eef9be2d732ecb83e2a4d44a3dd60b",
    "/* v3.42 SMART STOCK PASTE STYLE BEGIN */",
    "/* v3.42 SMART STOCK PASTE STYLE END */",
    "71fc1a7e50d421f1946ec109d0b13659e274b5bd499a0240bb3c50277963be39"
  ],
  [
    "/* v3.44 BULK PASTE HELPERS BEGIN",
    "/* v3.44 BULK PASTE HELPERS END */",
    "4855671f38ad33e1a08d42420572db91034ada66fab5f1adc37ad381241bbf8f",
    null,
    null,
    null
  ],
  [
    "/* v3.44 BULK PASTE UI BEGIN",
    "/* v3.44 BULK PASTE UI END */",
    "0b42a365e74fed6278067e1ae4fa7ea76661476add73bc746b5fab08db757b22",
    null,
    null,
    null
  ]
];
const digest=text=>createHash('sha256').update(text).digest('hex');
function section(source,start,end){
 assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
 const from=source.indexOf(start),to=source.indexOf(end,from)+end.length+1;
 assert.equal(source[to-1],'\n');return {from,to,text:source.slice(from,to)};
}
function withoutStockBulk(source){
 if(!source.includes('/* v3.44 SMART BULK PASTE BEGIN'))return source;
 const baseline=fs.readFileSync(path.join(__dirname,'..','Hisaab-Pro-v3.43.html'),'utf8');assert.equal(digest(baseline),BASE_SHA,'immutable v3.43 archive');
 for(const[start,end,sha,oldStart,oldEnd,oldSha]of modules){
  const current=section(source,start,end);assert.equal(digest(current.text),sha,'exact bounded Smart / Bulk Paste module');
  let original='',gap=0;
  if(oldStart){original=section(baseline,oldStart,oldEnd).text;assert.equal(digest(original),oldSha,'immutable original Smart module');}
  else{assert.equal(source[current.to],'\n');gap=1;}
  source=source.slice(0,current.from)+original+source.slice(current.to+gap);
 }
 for(const[from,to,count]of [...hooks].reverse()){assert.equal(source.split(from).length-1,count,'exact Bulk integration hook: '+from.slice(0,100));source=source.split(from).join(to);}
 assert.equal(digest(source),BASE_SHA,'EVERY immutable v3.43 byte, including stock writer / Sale / PDFs / account safety');return source;
}
module.exports={withoutStockBulk,hooks,modules};
