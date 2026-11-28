#!/usr/bin/env python3
"""Deterministic v3.44 Smart / Bulk Paste from immutable approved v3.43.
Replaces ONLY the bounded Smart Paste JS/CSS; four counted shell/API/version
hooks and two bounded local helper modules. No schema migration, second stock
ledger, external AI dependency, account access or published archive rebuild.
"""
from pathlib import Path
import hashlib
import json
R = Path(__file__).resolve().parent.parent
BASE_SHA = '58e76b330ffbd6137fef3467b232e8293d8119448aaa00aff7c8d06974ced9e8'
base = (R / 'Hisaab-Pro-v3.43.html').read_bytes()
assert hashlib.sha256(base).hexdigest() == BASE_SHA
s = base.decode()
hooks, modules = [], []
def change(old, new, count=1):
    global s
    assert s.count(old) == count, (old[:120], s.count(old), count)
    s = s.replace(old, new)
    hooks.append([new, old, count])
def bounded(source, start, end):
    assert source.count(start) == source.count(end) == 1
    a = source.index(start)
    b = source.index(end, a) + len(end) + 1
    assert source[b-1] == '\n'
    return source[a:b]
change('const APP_VERSION = "3.43";', 'const APP_VERSION = "3.44";')
old = "      'v3.43 — <b style=\"color:var(--ink)\">Smart Stock Sale + highlighted product matches</b>"
change(old, "      'v3.44 — <b style=\"color:var(--ink)\">Intelligent Smart Paste + Bulk Item Add via Paste</b>: Incoming-only bulk surface, optional common actual date/unit, flexible headed/headerless copied columns and whitelisted spelling/cell-order repairs. Saved-product stock ADD through the same dated audited writer; safe same-paste fuzzy new-name grouping prevents duplicate catalogue items, without transitive / unit / variant guesses. Invalid rows held with editable per-row corrections and same-source continuation; visible before + In - Out = available, saved/recorded/unresolved report and premium saved-only PDF. Original sources, exact units, opening/dated ledger/dedup/account/cancel/rollback guards retained. No migration, second ledger, external AI upload or finance change.<br>'+\n" + old)
old = '<button class="btn primary" data-sap="open">⚡ Smart Paste</button><button class="btn" data-stm="open">Message / screenshot · review</button>'
change(old, '<button class="btn primary" data-sbp="open">＋ Bulk Item Add via Paste</button>' + old.replace('class="btn primary"', 'class="btn"', 1))
old = '    smartPaste: { parse:sapParse, plan:sapPlan, apply:sapApply, process:sapProcess, open:sapOpen },'
change(old, '''    bulkPaste: { parse:(text,options={},data)=>sapParse(text,sbpOptions(options),data), plan:async(text,options={},data)=>sapPlan(text,sbpOptions(options),data), apply:async(text,options,context,signature,consent)=>sapApply(text,sbpOptions(options),context,signature,consent), process:async(text,options={},context=stkContext(),consent)=>sapProcess(text,sbpOptions(options),context,consent), open:sbpOpen },
''' + old)
for file, start, end, old_start, old_end in [
    ('smart.js', '/* v3.44 SMART BULK PASTE BEGIN', '/* v3.44 SMART BULK PASTE END */', '/* v3.42 SMART STOCK PASTE BEGIN', '/* v3.42 SMART STOCK PASTE END */'),
    ('smart.css', '/* v3.44 SMART BULK PASTE STYLE BEGIN */', '/* v3.44 SMART BULK PASTE STYLE END */', '/* v3.42 SMART STOCK PASTE STYLE BEGIN */', '/* v3.42 SMART STOCK PASTE STYLE END */'),
    ('bulk.js', '/* v3.44 BULK PASTE HELPERS BEGIN', '/* v3.44 BULK PASTE HELPERS END */', None, None),
    ('ui.js', '/* v3.44 BULK PASTE UI BEGIN', '/* v3.44 BULK PASTE UI END */', None, None),
]:
    text = (R / 'scripts/stock-bulk' / file).read_text().rstrip() + '\n'
    assert text.startswith(start) and text.endswith(end + '\n')
    sha = hashlib.sha256(text.encode()).hexdigest()
    if old_start:
        original = bounded(s, old_start, old_end)
        old_sha = hashlib.sha256(original.encode()).hexdigest()
        s = s.replace(original, text)
    else:
        original, old_sha = '', None
        at = '/* ----------------------------- 17. BOOTSTRAP ---------------------------- */'
        assert s.count(at) == 1 and start not in s
        s = s.replace(at, text + '\n' + at)
    modules.append([start, end, sha, old_start, old_end, old_sha])
for name in ['hisaab_v3.html', 'Hisaab-Pro-v3.44.html']:
    (R / name).write_text(s)
compat = '''/* Exact v3.44 Smart / Bulk Paste reversal to EVERY immutable v3.43 byte.
   All existing matcher / Sales / OCR / PDF / stock writer / finance / sync
   integration remains protected by the complete older compatibility chain. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const BASE_SHA=''' + json.dumps(BASE_SHA) + ''';
const hooks=''' + json.dumps(hooks, ensure_ascii=False, indent=2) + ''';
const modules=''' + json.dumps(modules, ensure_ascii=False, indent=2) + ''';
const digest=text=>createHash('sha256').update(text).digest('hex');
function section(source,start,end){
 assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
 const from=source.indexOf(start),to=source.indexOf(end,from)+end.length+1;
 assert.equal(source[to-1],'\\n');return {from,to,text:source.slice(from,to)};
}
function withoutStockBulk(source){
 if(!source.includes('/* v3.44 SMART BULK PASTE BEGIN'))return source;
 const baseline=fs.readFileSync(path.join(__dirname,'..','Hisaab-Pro-v3.43.html'),'utf8');assert.equal(digest(baseline),BASE_SHA,'immutable v3.43 archive');
 for(const[start,end,sha,oldStart,oldEnd,oldSha]of modules){
  const current=section(source,start,end);assert.equal(digest(current.text),sha,'exact bounded Smart / Bulk Paste module');
  let original='',gap=0;
  if(oldStart){original=section(baseline,oldStart,oldEnd).text;assert.equal(digest(original),oldSha,'immutable original Smart module');}
  else{assert.equal(source[current.to],'\\n');gap=1;}
  source=source.slice(0,current.from)+original+source.slice(current.to+gap);
 }
 for(const[from,to,count]of [...hooks].reverse()){assert.equal(source.split(from).length-1,count,'exact Bulk integration hook: '+from.slice(0,100));source=source.split(from).join(to);}
 assert.equal(digest(source),BASE_SHA,'EVERY immutable v3.43 byte, including stock writer / Sale / PDFs / account safety');return source;
}
module.exports={withoutStockBulk,hooks,modules};
'''
(R / 'tests/stock-bulk-compat.js').write_text(compat)
print('v3.44:', len(hooks), 'hooks +', len(modules), 'hashed bounded modules;', len(s.encode()), 'bytes;', hashlib.sha256(s.encode()).hexdigest())
