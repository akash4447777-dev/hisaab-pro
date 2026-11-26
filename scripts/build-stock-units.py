#!/usr/bin/env python3
"""Deterministic v3.39 product-unit picker release; immutable v3.38 input.
Standard library only. Never rebuild an old published release with changed inputs.
"""
from pathlib import Path
import hashlib
import json
R = Path(__file__).resolve().parent.parent
base = (R / 'Hisaab-Pro-v3.38.html').read_bytes()
assert hashlib.sha256(base).hexdigest() == 'a580c59a7aaef274c19a77a14d9f8ac0b827f94d3073cc3d99fe70480bc32bb1'
s = base.decode()
hooks = []
def change(old, new, count=1):
    global s
    assert s.count(old) == count, (old[:180], s.count(old), count)
    s = s.replace(old, new)
    hooks.append([new, old, count])
change('const APP_VERSION = "3.38";', 'const APP_VERSION = "3.39";')
old = "      'v3.38 — <b style=\"color:var(--ink)\">75% naam match par product apne-aap</b>"
change(old, "      'v3.39 — <b style=\"color:var(--ink)\">Add product mein 30 unit choices</b>: Box, set, bundle, roll, pcs, carton, pair aur weight/volume/length units ab visible dropdown mein. Other / custom unit bhi retained; purane unit labels, stock, unit-lock, message combos aur 75% matching unchanged. Koi automatic conversion nahi.<br>'+\n" + old)
old = next(line for line in s.splitlines() if "stkField('Unit *', '<input" in line and 'stkPUnit' in line)
change(old, "    stuFieldHTML(p?.unit || 'pcs') +")
marker = '/* ----------------------------- 17. BOOTSTRAP ---------------------------- */'
assert s.count(marker) == 1
s = s.replace(marker, (R / 'scripts/stock-units/units.js').read_text().rstrip() + '\n\n' + marker)
marker = '/* v3.37 STOCK COMBO STYLE END */\n'
assert s.count(marker) == 1
s = s.replace(marker, marker + (R / 'scripts/stock-units/units.css').read_text())
for name in ['hisaab_v3.html', 'Hisaab-Pro-v3.39.html']:
    (R / name).write_text(s)
compat = '''/* Exact v3.39 product-unit picker allowlist. Recover EVERY immutable v3.38
   byte before prior name/combo/easy/message/source guards; no guard is removed. */
const assert=require('node:assert/strict');
const hooks=''' + json.dumps(hooks, ensure_ascii=False, indent=2) + ''';
function withoutStockUnits(source){
 if(!source.includes('/* v3.39 STOCK UNIT CHOICES BEGIN'))return source;
 for(const[start,end]of [['/* v3.39 STOCK UNIT CHOICES BEGIN','/* v3.39 STOCK UNIT CHOICES END */'],['/* v3.39 STOCK UNIT STYLE BEGIN */','/* v3.39 STOCK UNIT STYLE END */']]){
  assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
  let tail=source.indexOf(end)+end.length;if(source[tail]==='\\n')tail++;if(start.includes('CHOICES')&&source[tail]==='\\n')tail++;
  source=source.slice(0,source.indexOf(start))+source.slice(tail);
 }
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact product-unit hook: '+from.slice(0,100));source=source.split(from).join(to);}
 return source;
}
module.exports={withoutStockUnits,hooks};
'''
(R / 'tests/stock-units-compat.js').write_text(compat)
print('v3.39:', len(hooks), 'exact hooks;', len(s.encode()), 'bytes;', hashlib.sha256(s.encode()).hexdigest())
