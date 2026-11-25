/* Exact v3.34 allowance: recover ENTIRE immutable v3.33 before older guards. */
const assert = require('node:assert/strict');
const { withoutStockMessage } = require('./stock-message-compat');
const hooks = [
  [
    'try { stklBoot = Promise.resolve(Cloud.boot()).catch(() => false); } catch (e) {}',
    'try { Cloud.boot(); } catch (e) {}',
    1
  ],
  [
    "      'v3.34 — <b style=\"color:var(--ink)\">Private one-click Stock link</b>: File choose kiye bina local-only private link ka complete preview. Confirmed import-day / chosen date, account review aur ek Haan click se guarded opening import. Link kholne se save nahi; same-name skip / unit conflict / required safety copy / atomic audit retained. Private inventory public release me nahi hai.<br>'+\n      'v3.33 — <b style=\"color:var(--ink)\">Stock opening import</b>",
    "      'v3.33 — <b style=\"color:var(--ink)\">Stock opening import</b>",
    1
  ],
  [
    "    openingImport: { parse: stkiParse, plan: stkiPlan, apply: stkiApply, open: stkiOpen },\n    openingLink: { parse: stklParse, open: stklOpen } },",
    "    openingImport: { parse: stkiParse, plan: stkiPlan, apply: stkiApply, open: stkiOpen } },",
    1
  ],
  [
    "function openModal(html, opts) {\n  stklCancel();\n  stkiCancel();",
    "function openModal(html, opts) {\n  stkiCancel();",
    1
  ],
  [
    "function closeModal() {\n  stklCancel(true);\n  stkiCancel();",
    "function closeModal() {\n  stkiCancel();",
    1
  ],
  [
    "const APP_VERSION = \"3.34\";",
    "const APP_VERSION = \"3.33\";",
    1
  ]
];
function withoutStockLink(source) {
  source = withoutStockMessage(source);
  if (!source.includes('/* v3.34 PRIVATE STOCK LINK BEGIN')) return source;
  for (const [start,end] of [['/* v3.34 PRIVATE STOCK LINK BEGIN','/* v3.34 PRIVATE STOCK LINK END */'],['/* v3.34 STOCK LINK STYLE BEGIN */','/* v3.34 STOCK LINK STYLE END */']]) {
    assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
    let tail=source.indexOf(end)+end.length;if(source[tail]==='\n')tail++;if(start.includes('PRIVATE')&&source[tail]==='\n')tail++;
    source=source.slice(0,source.indexOf(start))+source.slice(tail);
  }
  for(const [from,to,count] of hooks){assert.equal(source.split(from).length-1,count,'exact link hook: '+from.slice(0,90));source=source.split(from).join(to);}
  return source;
}
module.exports={withoutStockLink,hooks};
