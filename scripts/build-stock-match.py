#!/usr/bin/env python3
"""Deterministic v3.38 name-matching release. Immutable v3.37 is the input.
Python standard library only; never run an older builder over a published input.
"""
from pathlib import Path
import hashlib
import json
R = Path(__file__).resolve().parent.parent
base = (R / 'Hisaab-Pro-v3.37.html').read_bytes()
assert hashlib.sha256(base).hexdigest() == '369f7415b0a7eaa42a4fc63e05a33b2b7f25f13feded9cd323e5c184bd0bae06'
s = base.decode()
hooks = []
def change(old, new, count=1):
    global s
    assert s.count(old) == count, (old[:160], s.count(old), count)
    s = s.replace(old, new)
    hooks.append([new, old, count])
change('const APP_VERSION = "3.37";', 'const APP_VERSION = "3.38";')
old = "      'v3.37 — <b style=\"color:var(--ink)\">Ek party, ek message, ek combo</b>"
change(old, "      'v3.38 — <b style=\"color:var(--ink)\">75% naam match par product apne-aap</b>: Same-to-same spelling zaroori nahi. Typos, word order aur chhoote descriptive words par unique 75%+ match select; percent visible, badalne ka option. Close matches / alag size, model, colour ya unit par review; exact units, dates, opening aur maths safety unchanged.<br>'+\n" + old)
change('function stmMatch(block, s) {', 'function stfExactMatch(block, s) {')
change("esc(block.match.kind) + '</small></label>'", "esc(stfMatchNote(block)) + '</small></label>'")
change("<span class=\"ste-status\">✓ Product matched</span> ", "<span class=\"ste-status\">' + esc(stfStatus(block)) + '</span> ")
change('<h4 class="stm-step">Saare items — date, quantity aur unit dekh lo</h4>', '<h4 class="stm-step">Saare items — date, quantity aur unit dekh lo</h4><p class="stm-help stf-help">Naam bilkul same hona zaroori nahi: unique 75%+ naam match par product apne-aap select hoga. Match % aur saved naam dekhein; badlein se doosra product chun sakte hain. Close matches / alag size, model, colour ya unit par pehle review.</p>')
marker = '/* ----------------------------- 17. BOOTSTRAP ---------------------------- */'
assert s.count(marker) == 1
s = s.replace(marker, (R / 'scripts/stock-match/match.js').read_text().rstrip() + '\n\n' + marker)
for name in ['hisaab_v3.html', 'Hisaab-Pro-v3.38.html']:
    (R / name).write_text(s)
compat = '''/* Exact v3.38 matching allowlist. Recover EVERY immutable v3.37 byte
   before older combo/easy/message/source guards; no old guard is removed. */
const assert=require('node:assert/strict');
const hooks=''' + json.dumps(hooks, ensure_ascii=False, indent=2) + ''';
function withoutStockMatch(source){
 const start='/* v3.38 STOCK NAME MATCH BEGIN',end='/* v3.38 STOCK NAME MATCH END */';
 if(!source.includes(start))return source;
 assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
 let tail=source.indexOf(end)+end.length;if(source[tail]==='\\n')tail++;if(source[tail]==='\\n')tail++;
 source=source.slice(0,source.indexOf(start))+source.slice(tail);
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact name match hook: '+from.slice(0,100));source=source.split(from).join(to);}
 return source;
}
module.exports={withoutStockMatch,hooks};
'''
(R / 'tests/stock-match-compat.js').write_text(compat)
print('v3.38:', len(hooks), 'exact hooks;', len(s.encode()), 'bytes;', hashlib.sha256(s.encode()).hexdigest())
