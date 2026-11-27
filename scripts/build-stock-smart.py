#!/usr/bin/env python3
"""Build v3.42 Smart Stock Paste from the immutable, approved v3.41 release.
Only counted UI/lifecycle/API hooks plus bounded local JS/CSS. No account access,
schema migration, archived-release rebuild, backend or shared-finance change.
"""
from pathlib import Path
import hashlib
import json
R=Path(__file__).resolve().parent.parent
BASE_SHA='ee4a46e611e239f054fda659a9271f0cc259243d09140be3cb12b014ce873d6a'
base=(R/'Hisaab-Pro-v3.41.html').read_bytes()
assert hashlib.sha256(base).hexdigest()==BASE_SHA
s=base.decode()
hooks=[]
def change(old,new,count=1):
    global s
    assert s.count(old)==count,(old[:100],s.count(old),count)
    s=s.replace(old,new)
    hooks.append([new,old,count])
change('const APP_VERSION = "3.41";','const APP_VERSION = "3.42";')
old="      'v3.41 — <b style=\"color:var(--ink)\">Premium Stock PDF design</b>"
change(old,"      'v3.42 — <b style=\"color:var(--ink)\">Smart Paste: automatic Stock entry</b>: Smart Paste mein user Paste kare toh clear text / lists / tables ko pehchaan, 75%+ safe product matching, asli dates / exact units, duplicate aur complete dated-ledger checks ke baad valid entries ek combo mein apne-aap save. Sirf genuinely unclear items ki clarification, partial-success report + same-combo retry, result download aur approved premium PDF. Missing date / year / unit / quantity / roles, ambiguous variants aur opening inclusion guess nahi. Old review / screenshot / links unchanged; no AI upload, schema change ya data migration.<br>'+\n"+old)
change('function go(view) {\n  UI.view = view;','function go(view) {\n  if (view !== "stock" && sapEditor) closeModal();\n  UI.view = view;')
change('  sirCancel();\n  stcCancel();\n  stePdfCancel();','  sapCancel();\n  sirCancel();\n  stcCancel();\n  stePdfCancel();',2)
change("function stkResetSession() { stcCancel();", "function stkResetSession() { sapCancel(); stcCancel();")
change('<button class="btn primary" data-stm="open">＋ Combo / message</button>', '<button class="btn primary" data-sap="open">⚡ Smart Paste</button><button class="btn" data-stm="open">Message / screenshot · review</button>')
change('    messageImport: { parse: stmParse, plan: stmPlan, apply: stmApply, open: stmOpen, members: steMemberNames },','    smartPaste: { parse:sapParse, plan:sapPlan, apply:sapApply, process:sapProcess, open:sapOpen },\n    messageImport: { parse: stmParse, plan: stmPlan, apply: stmApply, open: stmOpen, members: steMemberNames },')
js=(R/'scripts/stock-smart/smart.js').read_text().rstrip()+'\n'
css=(R/'scripts/stock-smart/smart.css').read_text().rstrip()+'\n'
marker='/* ----------------------------- 17. BOOTSTRAP ---------------------------- */'
assert s.count(marker)==1 and s.count('</style>')==1
s=s.replace(marker,js+'\n'+marker).replace('</style>',css+'</style>')
for name in ['hisaab_v3.html','Hisaab-Pro-v3.42.html']:(R/name).write_text(s)
compat='''/* Exact v3.42 Smart Paste integration reversal to EVERY immutable v3.41
   byte. The approved PDF renderer, review / OCR / receipt links, stock writer,
   salary, Canteen, Attendance, sync / recovery and auth remain source-guarded. */
const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const hooks='''+json.dumps(hooks,ensure_ascii=False,indent=2)+''';
const modules='''+json.dumps([
    ['/* v3.42 SMART STOCK PASTE BEGIN','/* v3.42 SMART STOCK PASTE END */',hashlib.sha256(js.encode()).hexdigest(),True],
    ['/* v3.42 SMART STOCK PASTE STYLE BEGIN */','/* v3.42 SMART STOCK PASTE STYLE END */',hashlib.sha256(css.encode()).hexdigest(),False]
],ensure_ascii=False,indent=2)+''';
function withoutStockSmart(source){
 if(!source.includes('/* v3.42 SMART STOCK PASTE BEGIN'))return source;
 for(const[start,end,sha,gap]of modules){
  assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
  const from=source.indexOf(start),to=source.indexOf(end)+end.length+1;
  assert.equal(createHash('sha256').update(source.slice(from,to)).digest('hex'),sha,'exact bounded Smart Paste module');
  if(gap)assert.equal(source[to],'\\n');source=source.slice(0,from)+source.slice(to+(gap?1:0));
 }
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact Smart Paste hook: '+from.slice(0,100));source=source.split(from).join(to);}
 assert.equal(createHash('sha256').update(source).digest('hex'),'''+json.dumps(BASE_SHA)+''','EVERY immutable v3.41 byte including premium PDFs');
 return source;
}
module.exports={withoutStockSmart,hooks,modules};
'''
(R/'tests/stock-smart-compat.js').write_text(compat)
print('v3.42:',len(hooks),'hooks /',sum(h[2] for h in hooks),'locations + bounded JS/CSS;',len(s.encode()),'bytes;',hashlib.sha256(s.encode()).hexdigest())
