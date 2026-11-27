/* Exact v3.40 receipt-link integration allowlist: restore EVERY immutable
   v3.39 byte before prior units/name/combo/message/opening/source guards. */
const assert=require('node:assert/strict');
const hooks=[
  [
    "const APP_VERSION = \"3.40\";",
    "const APP_VERSION = \"3.39\";",
    1
  ],
  [
    "      'v3.40 — <b style=\"color:var(--ink)\">Private received-stock list link</b>: Explicit date par naya Stock In, existing 75% product matching / visible new products, ek combo + PDF, one guarded atomic save. Opening / available overwrite nahi; duplicate, opening cutoff, exact units aur account guards retained. Link kholne se save nahi hota.<br>'+\n      'v3.39 — <b style=\"color:var(--ink)\">Add product mein 30 unit choices</b>",
    "      'v3.39 — <b style=\"color:var(--ink)\">Add product mein 30 unit choices</b>",
    1
  ],
  [
    "  sirCancel();\n  stcCancel();\n  stePdfCancel();",
    "  stcCancel();\n  stePdfCancel();",
    2
  ],
  [
    "function stklConsumeHash() { return sirConsumeHash(STKL_PREFIX); }",
    "function stklConsumeHash() {\n  if (!location.hash.startsWith(STKL_PREFIX)) return null;\n  const token = location.hash.slice(STKL_PREFIX.length), clean = new URL(location.href); clean.hash = '';\n  history.replaceState(history.state, '', clean.href); return token;\n}",
    1
  ],
  [
    "    const incoming = typeof token === 'string' && token.startsWith('in.');\n    const text = await stklDecode(incoming ? token.slice(3) : token, job); if (stklPending !== job) return false;\n    stkCheck(job.context);\n    if (incoming) await sirShow(sirParse(text), job.context);\n    else stklShow(stklParse(text, openedOn), job.context);\n    return true;",
    "    const text = await stklDecode(token, job); if (stklPending !== job) return false;\n    stkCheck(job.context); const packet = stklParse(text, openedOn); stklShow(packet, job.context); return true;",
    1
  ],
  [
    "    openingLink: { parse: stklParse, open: stklOpen },\n    receiptLink: { parse:sirParse, plan:sirPlan, apply:sirApply, open:token=>stklOpen('in.'+token) },",
    "    openingLink: { parse: stklParse, open: stklOpen },",
    1
  ]
];
function withoutStockReceipt(source){
 source=require('./stock-pdf-compat').withoutStockPdf(source);
 if(!source.includes('/* v3.40 REVIEWED STOCK IN LINK BEGIN'))return source;
 for(const[start,end]of [['/* v3.40 REVIEWED STOCK IN LINK BEGIN','/* v3.40 REVIEWED STOCK IN LINK END */'],['/* v3.40 STOCK IN LINK STYLE BEGIN */','/* v3.40 STOCK IN LINK STYLE END */']]){
  assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
  let tail=source.indexOf(end)+end.length;if(source[tail]==='\n')tail++;if(start.includes('REVIEWED')&&source[tail]==='\n')tail++;
  source=source.slice(0,source.indexOf(start))+source.slice(tail);
 }
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact receipt hook: '+from.slice(0,110));source=source.split(from).join(to);}
 return source;
}
module.exports={withoutStockReceipt,hooks};
