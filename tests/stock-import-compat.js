/* Exact v3.33 allowance; recover all immutable v3.32 bytes, not a loose regex. */
const assert = require('node:assert/strict');
const hooks = [
  [
    "      'v3.33 — <b style=\"color:var(--ink)\">Stock opening import</b>: CSV / JSON file se products, available quantity aur exact unit ka preview; cut-over date aur review ke baad ek atomic save. Existing products skip, unit mismatch / duplicate file rows refused. Zero-stock items, optional photos / notes, before-after audit aur required safety copy; salary / Canteen / Attendance unchanged. Private inventory release me bundled nahi hai.<br>'+\n      'v3.32 — <b style=\"color:var(--ink)\">Stock Management</b>",
    "      'v3.32 — <b style=\"color:var(--ink)\">Stock Management</b>",
    1
  ],
  [
    "    ui: stkUI, context: stkContext, openProduct: stkOpenProduct, openEntry: stkOpenMovement,\n    openingImport: { parse: stkiParse, plan: stkiPlan, apply: stkiApply, open: stkiOpen } },",
    "    ui: stkUI, context: stkContext, openProduct: stkOpenProduct, openEntry: stkOpenMovement },",
    1
  ],
  [
    "<div class=\"row-actions\"><button class=\"btn\" data-stki=\"open\">Import stock</button><button class=\"btn\" data-stk=\"movement\" data-type=\"in\">＋ Stock In</button>",
    "<div class=\"row-actions\"><button class=\"btn\" data-stk=\"movement\" data-type=\"in\">＋ Stock In</button>",
    1
  ],
  [
    "  stkiCancel();\n  stkEditor = null;\n  ctReportState = null;",
    "  stkEditor = null;\n  ctReportState = null;",
    2
  ],
  [
    "const APP_VERSION = \"3.33\";",
    "const APP_VERSION = \"3.32\";",
    1
  ]
];
function withoutStockImport(source) {
  if (!source.includes('/* v3.33 STOCK OPENING IMPORT BEGIN')) return source;
  for (const [start,end] of [['/* v3.33 STOCK OPENING IMPORT BEGIN','/* v3.33 STOCK OPENING IMPORT END */'],['/* v3.33 STOCK IMPORT STYLE BEGIN */','/* v3.33 STOCK IMPORT STYLE END */']]) {
    assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
    let tail=source.indexOf(end)+end.length;if(source[tail]==='\n')tail++;if(start.includes('OPENING')&&source[tail]==='\n')tail++;
    source=source.slice(0,source.indexOf(start))+source.slice(tail);
  }
  for(const [from,to,count] of hooks){assert.equal(source.split(from).length-1,count,'exact import hook: '+from.slice(0,90));source=source.split(from).join(to);}
  return source;
}
module.exports={withoutStockImport,hooks};
