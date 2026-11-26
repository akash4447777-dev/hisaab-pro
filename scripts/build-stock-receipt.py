#!/usr/bin/env python3
"""Build v3.40 typed, reviewed incoming-stock link from immutable v3.39.
Standard library only. No customer list / fragment belongs in these sources.
"""
from pathlib import Path
import hashlib
import json
R=Path(__file__).resolve().parent.parent
base=(R/'Hisaab-Pro-v3.39.html').read_bytes()
assert hashlib.sha256(base).hexdigest()=='d766a63254008ed8b0aed2e7f234b84a3da54756b217cd988fd49b626a5a2c86'
s=base.decode()
hooks=[]
def change(old,new,count=1):
 global s
 assert s.count(old)==count,(old[:150],s.count(old),count)
 s=s.replace(old,new)
 hooks.append([new,old,count])
change('const APP_VERSION = "3.39";','const APP_VERSION = "3.40";')
old="      'v3.39 — <b style=\"color:var(--ink)\">Add product mein 30 unit choices</b>"
change(old,"      'v3.40 — <b style=\"color:var(--ink)\">Private received-stock list link</b>: Explicit date par naya Stock In, existing 75% product matching / visible new products, ek combo + PDF, one guarded atomic save. Opening / available overwrite nahi; duplicate, opening cutoff, exact units aur account guards retained. Link kholne se save nahi hota.<br>'+\n"+old)
change('  stcCancel();\n  stePdfCancel();','  sirCancel();\n  stcCancel();\n  stePdfCancel();',2)
old="""function stklConsumeHash() {
  if (!location.hash.startsWith(STKL_PREFIX)) return null;
  const token = location.hash.slice(STKL_PREFIX.length), clean = new URL(location.href); clean.hash = '';
  history.replaceState(history.state, '', clean.href); return token;
}"""
change(old,"function stklConsumeHash() { return sirConsumeHash(STKL_PREFIX); }")
change("    const text = await stklDecode(token, job); if (stklPending !== job) return false;\n    stkCheck(job.context); const packet = stklParse(text, openedOn); stklShow(packet, job.context); return true;",
"    const incoming = typeof token === 'string' && token.startsWith('in.');\n    const text = await stklDecode(incoming ? token.slice(3) : token, job); if (stklPending !== job) return false;\n    stkCheck(job.context);\n    if (incoming) await sirShow(sirParse(text), job.context);\n    else stklShow(stklParse(text, openedOn), job.context);\n    return true;")
old='    openingLink: { parse: stklParse, open: stklOpen },'
change(old,old+"\n    receiptLink: { parse:sirParse, plan:sirPlan, apply:sirApply, open:token=>stklOpen('in.'+token) },")
marker='/* ----------------------------- 17. BOOTSTRAP ---------------------------- */'
assert s.count(marker)==1
s=s.replace(marker,(R/'scripts/stock-receipt/receipt.js').read_text().rstrip()+'\n\n'+marker)
marker='/* v3.39 STOCK UNIT STYLE END */\n'
assert s.count(marker)==1
s=s.replace(marker,marker+(R/'scripts/stock-receipt/receipt.css').read_text())
for name in ['hisaab_v3.html','Hisaab-Pro-v3.40.html']:(R/name).write_text(s)
compat='''/* Exact v3.40 receipt-link integration allowlist: restore EVERY immutable
   v3.39 byte before prior units/name/combo/message/opening/source guards. */
const assert=require('node:assert/strict');
const hooks='''+json.dumps(hooks,ensure_ascii=False,indent=2)+''';
function withoutStockReceipt(source){
 if(!source.includes('/* v3.40 REVIEWED STOCK IN LINK BEGIN'))return source;
 for(const[start,end]of [['/* v3.40 REVIEWED STOCK IN LINK BEGIN','/* v3.40 REVIEWED STOCK IN LINK END */'],['/* v3.40 STOCK IN LINK STYLE BEGIN */','/* v3.40 STOCK IN LINK STYLE END */']]){
  assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
  let tail=source.indexOf(end)+end.length;if(source[tail]==='\\n')tail++;if(start.includes('REVIEWED')&&source[tail]==='\\n')tail++;
  source=source.slice(0,source.indexOf(start))+source.slice(tail);
 }
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact receipt hook: '+from.slice(0,110));source=source.split(from).join(to);}
 return source;
}
module.exports={withoutStockReceipt,hooks};
'''
(R/'tests/stock-receipt-compat.js').write_text(compat)
print('v3.40:',len(hooks),'exact hooks;',len(s.encode()),'bytes;',hashlib.sha256(s.encode()).hexdigest())
