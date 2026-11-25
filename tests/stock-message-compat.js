/* Narrow v3.35 allowlist: restore every immutable v3.34 byte, then older guards. */
const assert=require('node:assert/strict');
const hooks=[
  [
    "const APP_VERSION = \"3.35\";",
    "const APP_VERSION = \"3.34\";",
    1
  ],
  [
    "      'v3.35 — <b style=\"color:var(--ink)\">Message / screenshot se Stock</b>: Message paste ya local screenshot OCR se dated In / Sale / Out draft; party, original item text aur tags retained. Explicit type/roles/unit/year review, message maths + panel balance checks, duplicate/opening safeguards aur ek guarded atomic confirmation. Pichhle / Available se fake stock nahi banta. Extraction se save nahi; AI/chat access nahi.<br>'+\n      'v3.34 — <b style=\"color:var(--ink)\">Private one-click Stock link</b>",
    "      'v3.34 — <b style=\"color:var(--ink)\">Private one-click Stock link</b>",
    1
  ],
  [
    "<div class=\"row-actions\"><button class=\"btn primary\" data-stm=\"open\">Message / screenshot</button><button class=\"btn\" data-stki=\"open\">Import stock</button>",
    "<div class=\"row-actions\"><button class=\"btn\" data-stki=\"open\">Import stock</button>",
    1
  ],
  [
    "function openModal(html, opts) {\n  stmCancel();\n  stklCancel();",
    "function openModal(html, opts) {\n  stklCancel();",
    1
  ],
  [
    "function closeModal() {\n  stmCancel();\n  stklCancel(true);",
    "function closeModal() {\n  stklCancel(true);",
    1
  ],
  [
    "    openingLink: { parse: stklParse, open: stklOpen },\n    messageImport: { parse: stmParse, plan: stmPlan, apply: stmApply, open: stmOpen } },",
    "    openingLink: { parse: stklParse, open: stklOpen } },",
    1
  ]
];
function withoutStockMessage(source){
 if(!source.includes('/* v3.35 STOCK MESSAGE BEGIN'))return source;
 for(const[start,end]of [['/* v3.35 STOCK MESSAGE BEGIN','/* v3.35 STOCK MESSAGE END */'],['/* v3.35 STOCK MESSAGE STYLE BEGIN */','/* v3.35 STOCK MESSAGE STYLE END */']]){
  assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);let tail=source.indexOf(end)+end.length;if(source[tail]==='\n')tail++;if(!start.includes('STYLE')&&source[tail]==='\n')tail++;source=source.slice(0,source.indexOf(start))+source.slice(tail);
 }
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact message hook: '+from.slice(0,90));source=source.split(from).join(to);}return source;
}
module.exports={withoutStockMessage,hooks};
