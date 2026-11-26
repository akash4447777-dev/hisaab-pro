/* Exact v3.38 matching allowlist. Recover EVERY immutable v3.37 byte
   before older combo/easy/message/source guards; no old guard is removed. */
const assert=require('node:assert/strict');
const hooks=[
  [
    "const APP_VERSION = \"3.38\";",
    "const APP_VERSION = \"3.37\";",
    1
  ],
  [
    "      'v3.38 — <b style=\"color:var(--ink)\">75% naam match par product apne-aap</b>: Same-to-same spelling zaroori nahi. Typos, word order aur chhoote descriptive words par unique 75%+ match select; percent visible, badalne ka option. Close matches / alag size, model, colour ya unit par review; exact units, dates, opening aur maths safety unchanged.<br>'+\n      'v3.37 — <b style=\"color:var(--ink)\">Ek party, ek message, ek combo</b>",
    "      'v3.37 — <b style=\"color:var(--ink)\">Ek party, ek message, ek combo</b>",
    1
  ],
  [
    "function stfExactMatch(block, s) {",
    "function stmMatch(block, s) {",
    1
  ],
  [
    "esc(stfMatchNote(block)) + '</small></label>'",
    "esc(block.match.kind) + '</small></label>'",
    1
  ],
  [
    "<span class=\"ste-status\">' + esc(stfStatus(block)) + '</span> ",
    "<span class=\"ste-status\">✓ Product matched</span> ",
    1
  ],
  [
    "<h4 class=\"stm-step\">Saare items — date, quantity aur unit dekh lo</h4><p class=\"stm-help stf-help\">Naam bilkul same hona zaroori nahi: unique 75%+ naam match par product apne-aap select hoga. Match % aur saved naam dekhein; badlein se doosra product chun sakte hain. Close matches / alag size, model, colour ya unit par pehle review.</p>",
    "<h4 class=\"stm-step\">Saare items — date, quantity aur unit dekh lo</h4>",
    1
  ]
];
function withoutStockMatch(source){
 const start='/* v3.38 STOCK NAME MATCH BEGIN',end='/* v3.38 STOCK NAME MATCH END */';
 if(!source.includes(start))return source;
 assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
 let tail=source.indexOf(end)+end.length;if(source[tail]==='\n')tail++;if(source[tail]==='\n')tail++;
 source=source.slice(0,source.indexOf(start))+source.slice(tail);
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact name match hook: '+from.slice(0,100));source=source.split(from).join(to);}
 return source;
}
module.exports={withoutStockMatch,hooks};
