/* Exact v3.42 Smart Paste integration reversal to EVERY immutable v3.41
   byte. The approved PDF renderer, review / OCR / receipt links, stock writer,
   salary, Canteen, Attendance, sync / recovery and auth remain source-guarded. */
const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const hooks=[
  [
    "const APP_VERSION = \"3.42\";",
    "const APP_VERSION = \"3.41\";",
    1
  ],
  [
    "      'v3.42 — <b style=\"color:var(--ink)\">Smart Paste: automatic Stock entry</b>: Smart Paste mein user Paste kare toh clear text / lists / tables ko pehchaan, 75%+ safe product matching, asli dates / exact units, duplicate aur complete dated-ledger checks ke baad valid entries ek combo mein apne-aap save. Sirf genuinely unclear items ki clarification, partial-success report + same-combo retry, result download aur approved premium PDF. Missing date / year / unit / quantity / roles, ambiguous variants aur opening inclusion guess nahi. Old review / screenshot / links unchanged; no AI upload, schema change ya data migration.<br>'+\n      'v3.41 — <b style=\"color:var(--ink)\">Premium Stock PDF design</b>",
    "      'v3.41 — <b style=\"color:var(--ink)\">Premium Stock PDF design</b>",
    1
  ],
  [
    "function go(view) {\n  if (view !== \"stock\" && sapEditor) closeModal();\n  UI.view = view;",
    "function go(view) {\n  UI.view = view;",
    1
  ],
  [
    "  sapCancel();\n  sirCancel();\n  stcCancel();\n  stePdfCancel();",
    "  sirCancel();\n  stcCancel();\n  stePdfCancel();",
    2
  ],
  [
    "function stkResetSession() { sapCancel(); stcCancel();",
    "function stkResetSession() { stcCancel();",
    1
  ],
  [
    "<button class=\"btn primary\" data-sap=\"open\">⚡ Smart Paste</button><button class=\"btn\" data-stm=\"open\">Message / screenshot · review</button>",
    "<button class=\"btn primary\" data-stm=\"open\">＋ Combo / message</button>",
    1
  ],
  [
    "    smartPaste: { parse:sapParse, plan:sapPlan, apply:sapApply, process:sapProcess, open:sapOpen },\n    messageImport: { parse: stmParse, plan: stmPlan, apply: stmApply, open: stmOpen, members: steMemberNames },",
    "    messageImport: { parse: stmParse, plan: stmPlan, apply: stmApply, open: stmOpen, members: steMemberNames },",
    1
  ]
];
const modules=[
  [
    "/* v3.42 SMART STOCK PASTE BEGIN",
    "/* v3.42 SMART STOCK PASTE END */",
    "1e750e14988ddfd5f4d1c3ec3c12603df1187206481fc1a1098c78590855a0a1",
    true
  ],
  [
    "/* v3.42 SMART STOCK PASTE STYLE BEGIN */",
    "/* v3.42 SMART STOCK PASTE STYLE END */",
    "71fc1a7e50d421f1946ec109d0b13659e274b5bd499a0240bb3c50277963be39",
    false
  ]
];
function withoutStockSmart(source){
 source=require('./stock-sale-compat').withoutStockSale(source);
 if(!source.includes('/* v3.42 SMART STOCK PASTE BEGIN'))return source;
 for(const[start,end,sha,gap]of modules){
  assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
  const from=source.indexOf(start),to=source.indexOf(end)+end.length+1;
  assert.equal(createHash('sha256').update(source.slice(from,to)).digest('hex'),sha,'exact bounded Smart Paste module');
  if(gap)assert.equal(source[to],'\n');source=source.slice(0,from)+source.slice(to+(gap?1:0));
 }
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact Smart Paste hook: '+from.slice(0,100));source=source.split(from).join(to);}
 assert.equal(createHash('sha256').update(source).digest('hex'),"ee4a46e611e239f054fda659a9271f0cc259243d09140be3cb12b014ce873d6a",'EVERY immutable v3.41 byte including premium PDFs');
 return source;
}
module.exports={withoutStockSmart,hooks,modules};
