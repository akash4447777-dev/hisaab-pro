#!/usr/bin/env python3
"""Build v3.41's approved premium Stock PDF design from immutable v3.40.
Presentation only. Never read customer data or rerun prior release builders.
"""
from pathlib import Path
import hashlib
import json
R=Path(__file__).resolve().parent.parent
base=(R/'Hisaab-Pro-v3.40.html').read_bytes()
BASE_SHA='e85d8df64c37119655f8cc5e75b2024b9614217108d09543f71fc4c3aad2abb3'
assert hashlib.sha256(base).hexdigest()==BASE_SHA
s=base.decode()
hooks=[]
def change(old,new,count=1):
    global s
    assert s.count(old)==count,(old[:100],s.count(old),count)
    s=s.replace(old,new)
    hooks.append([new,old,count])
change('const APP_VERSION = "3.40";','const APP_VERSION = "3.41";')
old="      'v3.40 — <b style=\"color:var(--ink)\">Private received-stock list link</b>"
change(old,"      'v3.41 — <b style=\"color:var(--ink)\">Premium Stock PDF design</b>: Approved navy / emerald header, saved company logo on every page, real summary cards / stock-health ring, readable highlighted balances / minimum warnings, exact unit-wise totals aur compact continuation pages. Available Stock, filtered History aur one-combo PDFs; original dates, source notes, tags, filters aur download/share guards retained. Stock / financial data mein koi migration ya badlav nahi.<br>'+\n"+old)
change('Company logo apne-aap. Saare matching pages included.</p>', 'Naya navy / emerald design · Company logo apne-aap. Saare matching pages included.</p>')
start=s.index('function stePdfString(report) {')
end=s.index('function steScreenFilters()',start)
premium=(R/'scripts/stock-pdf/stock-pdf.js').read_text().rstrip()+'\n'
s=s[:start]+premium+s[end:]
for name in ['hisaab_v3.html','Hisaab-Pro-v3.41.html']:
    (R/name).write_text(s)
compat='''/* Exact v3.41 presentation-only reversal to EVERY immutable v3.40 byte.
   Prior source guards still cover all finance, stock, cloud, fonts and receipts. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createHash}=require('node:crypto');
const hooks='''+json.dumps(hooks,ensure_ascii=False,indent=2)+''';
function withoutStockPdf(source){
 const start='/* v3.41 PREMIUM STOCK PDF BEGIN',end='/* v3.41 PREMIUM STOCK PDF END */';
 if(!source.includes(start))return source;
 assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
 const original=fs.readFileSync(path.join(__dirname,'..','Hisaab-Pro-v3.40.html'),'utf8');
 assert.equal(createHash('sha256').update(original).digest('hex'),'''+json.dumps(BASE_SHA)+''');
 const premium=fs.readFileSync(path.join(__dirname,'..','scripts/stock-pdf/stock-pdf.js'),'utf8').trimEnd()+'\\n';
 assert.equal(createHash('sha256').update(premium).digest('hex'),'''+json.dumps(hashlib.sha256(premium.encode()).hexdigest())+''');
 const from=source.indexOf(start),to=source.indexOf(end)+end.length+1;
 assert.equal(source.slice(from,to),premium,'exact bounded approved PDF renderer');
 const oldFrom=original.indexOf('function stePdfString(report) {'),oldTo=original.indexOf('function steScreenFilters()',oldFrom);
 source=source.slice(0,from)+original.slice(oldFrom,oldTo)+source.slice(to);
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact Stock PDF hook: '+from.slice(0,100));source=source.split(from).join(to);}
 return source;
}
module.exports={withoutStockPdf,hooks};
'''
(R/'tests/stock-pdf-compat.js').write_text(compat)
print('v3.41:',len(hooks),'exact hooks + one replaced renderer;',len(s.encode()),'bytes;',hashlib.sha256(s.encode()).hexdigest())
