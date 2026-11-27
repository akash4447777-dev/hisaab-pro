#!/usr/bin/env python3
"""Deterministic v3.43 sale / suggestions release, ONLY from immutable v3.42.
Count every integration hook, hash bounded modules, reverse to every input byte.
No customer account access, old-release rewrites, stock migration or new ledger.
"""
from pathlib import Path
import hashlib
import json
R=Path(__file__).resolve().parent.parent
BASE_SHA='2e5241116916a1732acdba7fec1fd04de03b7fb6bd3749832ea01f88c935bc30'
base=(R/'Hisaab-Pro-v3.42.html').read_bytes()
assert hashlib.sha256(base).hexdigest()==BASE_SHA
s=base.decode()
hooks=[]
def change(old,new,count=1):
    global s
    assert s.count(old)==count,(old[:150],s.count(old),count)
    s=s.replace(old,new)
    hooks.append([new,old,count])
change('const APP_VERSION = "3.42";','const APP_VERSION = "3.43";')
old="      'v3.42 — <b style=\"color:var(--ink)\">Smart Paste: automatic Stock entry</b>"
change(old,"      'v3.43 — <b style=\"color:var(--ink)\">Smart Stock Sale + highlighted product matches</b>: Fast local search / suggestions, one multi-product Sale or named custom package, editable quantities / actual INR prices / line discounts, exact-unit quantities and automatic totals. Confirm once for atomic dated-ledger stock deduction; complete price-aware Sale History, whole-sale Edit / Delete / reuse / premium PDF. Message / Screenshot / Smart Paste show original nonexact names beside highlighted ranked choices with available stock and similarity; one-tap selection. Unique safe 75%+ spelling / abbreviation matches retained; ambiguous units / models / variants never silently chosen. Old unpriced entries stay unpriced, no migration or seed; finance / customer accounts untouched.<br>'+\n"+old)
# Optional validated metadata on the SAME ordinary audited movement.
change('"note", "source", "createdAt", "updatedAt"], "transaction");','"note", "source", "createdAt", "updatedAt", "sale"], "transaction");')
old='  if (products && (!products.has(t.productId) || products.get(t.productId).unit !== t.unit)) throw new Error("Stock transaction ka product / unit missing ya badal gaya. Product aur movements saath restore karein.");'
change(old,old+'\n  if (t.sale !== undefined) ssaValidateLine(t);')
change('  stkLedger(s); return true;','  ssaValidateGroups(s); stkLedger(s); return true;')
change('function stkRecoveryCheck(recovered, before, copy) {','function stkRecoveryCheck(recovered, before, copy) {\n  ssaRecoverySafety(recovered,before,copy);')
change('  if (!stkDate(next.date)) throw new Error("Stock entry ki valid date chunein (1900–9998).");\n  return next;','  if (!stkDate(next.date)) throw new Error("Stock entry ki valid date chunein (1900–9998).");\n  ssaMovement(next, input, old); return next;')
change('function stkSaveMovement(input, context) {\n  return stkAtomic(s => {','function stkSaveMovement(input, context) {\n  return stkAtomic(s => {\n    ssaLegacyWrite(input);')
old='    const old = s.transactions.find(t => t.id === id); if (!old) throw new Error("Stock entry nahi mili. Current history check karein.");'
change(old,old+'\n    ssaProtectDelete(old);')
old='    const old = s.products.find(p => p.id === id); if (!old) throw new Error("Product nahi mila. Current list check karein.");'
change(old,old+'\n    ssaProtectProductDelete(id);')
# Whole-sale financial / membership conflicts cannot field-merge into a hybrid.
old='  const fields = ["productId", "productName", "unit", "photoId", "type", "qty", "date", "sequence", "source"];'
change(old,'  ssaMergeSafety(s, b, l, r, preference, conflict, eq);\n'+old)
old='  const visited = new Set();\n  for (const id of graph.keys()) {'
change(old,'  ssaConnectSales([s,l,r,b], connect);\n'+old)
change('if ($("#overlay") && !samePayload(before, next)) {','if (($("#overlay") || ssaHasDraft()) && !samePayload(before, next)) {')
change('this.offlineMode || $("#overlay")) return false;','this.offlineMode || $("#overlay") || ssaHasDraft()) return false;')
change('Stock conflict: combined entries se negative balance, duplicate product ya changed product/unit ho sakta hai. Affected product ki poori dependent entry-set selected device se li jayegi; losing rows safety copy aur audit me rahengi. Independent products merge honge.','Stock conflict: Sale prices / discounts / membership changed, ya combined entries se negative balance, duplicate product / changed unit ho sakta hai. Complete conflicting Sale aur affected product ki poori dependent entry-set selected device se li jayegi; losing rows safety copy aur audit mein retained. Independent products merge honge.')
# Search / Audit retain the full optional price and package information.
change('t.source === "opening" ? "opening stock" : ""].join(" "), f.q)','t.source === "opening" ? "opening stock" : "", t.sale?.label, t.sale?.id, t.sale?.time].join(" "), f.q)')
change('const STK_LABELS = { name:', 'const STK_LABELS = { sale: "Sale / price / line discount", name:')
change('  if (key === "type") return STK_KINDS[value] || String(value);','  if (key === "sale") return ssaAuditValue(value);\n  if (key === "type") return STK_KINDS[value] || String(value);')
# Inline Sale tab and one confirmation; old unpriced edit/API stays available.
change('else if (UI.view === "stock") root.innerHTML = viewStock();','else if (UI.view === "stock") { root.innerHTML = viewStock(); ssaAfterRender(); }')
change('const tabs = [["products", "▣ Products & Live Stock"], ["history",','const tabs = [["products", "▣ Products & Live Stock"], ["sale", "＋ Stock Sale / combo"], ["history",')
change('u.tab === "products" ? stkInventoryHTML() : u.tab === "history" ? stkMovementHTML() : stkAuditHTML();','u.tab === "products" ? stkInventoryHTML() : u.tab === "sale" ? ssaHTML() : u.tab === "history" ? stkMovementHTML() : stkAuditHTML();')
change("+ '</div>' + stkFiltersHTML() + content +","+ '</div>' + (u.tab === 'sale' ? '' : stkFiltersHTML()) + content +")
change("case 'movement': stkCheck(stkViewContext || stkContext()); stkOpenMovement(button.dataset.type, button.dataset.product); break;","case 'movement': stkCheck(stkViewContext || stkContext()); if(button.dataset.type === 'sale') ssaOpen(button.dataset.product); else stkOpenMovement(button.dataset.type, button.dataset.product); break;")
old='  if (id && !old) throw new Error("Stock entry nahi mili. Current history kholein.");'
change(old,old+'\n  if (old?.sale) { ssaOpenSaved(id); return; }')
old="  if (!p) throw new Error('Entry nahi mili. Current list check karein.');\n  const count ="
change(old,"  if (!p) throw new Error('Entry nahi mili. Current list check karein.');\n  if (kind !== 'product' && p.sale) { stcOpen(id, 'delete'); return; }\n  if (kind === 'product') ssaProtectProductDelete(id);\n  const count =")
change('function stkResetSession() { sapCancel();','function stkResetSession() { ssaReset(); sapCancel();')
change('UI.view === "stock" ? stkUI().q : UI.view === "attendance" ? attUI().q : UI.search;','UI.view === "stock" ? (stkUI().tab === "sale" ? ssaState?.query || "" : stkUI().q) : UI.view === "attendance" ? attUI().q : UI.search;')
old='  if (e.target.id !== "gSearch") return;\n  UI.search = e.target.value;'
change(old,'  if (e.target.id !== "gSearch") return;\n  if (UI.view === "stock" && stkUI().tab === "sale" && ssaState && !ssaState.receipt) { ssaState.query=e.target.value.slice(0,90); ssaState.active=0; if($("#ssaSearch")) $("#ssaSearch").value=ssaState.query; ssaSearchRender(); return; }\n  UI.search = e.target.value;')
# Explicit, unique Sale identity augments (never guesses) message provenance.
change('    const meta = stmMeta(h); if (!meta) return;','    const meta = stmMeta(h) || ssaOrigin(h); if (!meta) return;')
old='  // Conflicting source identities are not silently combined into either batch.'
change(old,"  s.transactions.filter(t=>t.sale).forEach(t=>{if(!candidates.has(t.id))candidates.set(t.id,new Set());candidates.get(t.id).add('sale:'+t.sale.id);});\n"+old)
change("delivery:stcUnique(outgoing,'deliveryName'), phones:stcUnique(outgoing,'deliveryPhone'), purposes:stcUnique(outgoing,'purpose')};","delivery:stcUnique(outgoing,'deliveryName'), phones:stcUnique(outgoing,'deliveryPhone'), purposes:stcUnique(outgoing,'purpose'), ...ssaDescribe(ordered)};")
change('function stcCardHTML(group) {\n  const partial=', 'function stcCardHTML(group) {\n  if(group.sale)return ssaCardHTML(group);\n  const partial=')
old="  const group=stcGet(entryId);if(!group.isCombo)throw new Error('Yeh message combo nahi hai. Individual Edit use karein.');"
change(old,old+"\n  if(group.sale)throw new Error('Priced Sale ko complete Sale Edit se badlein; prices / discounts saath retained rahenge.');")
old="  stkCheck(stkViewContext||stkContext());const group=stcGet(entryId);if(!group.isCombo)throw new Error('Current message combo chunein.');"
change(old,old+"\n  if(group.sale&&mode!=='delete'){ssaOpenSaved(entryId);return;}")
# Saved-only premium PDF, exact INR / line discounts; legacy remains unpriced.
old="    if(group.isCombo){report.combo=group;report.title='Stock Combo';report.rows=group.rows.map(row=>({...row,members:steTaggedMembers(row)}));report.labels=['1 combo · '+group.productCount+' products · '+group.rows.length+' saved stock movements. Sirf is combo ki abhi saved rows; skipped / deleted nahi. Screen filters apply nahi.'];}"
change(old,old+"\n    if(group.sale){report.title='Stock Sale';report.labels=['1 saved Sale / combo · '+group.productCount+' products · '+group.rows.length+' lines. Actual INR prices, line discounts and exact saved date/time. Whole Sale; screen filters / unsaved drafts excluded.'];}")
change('function stcPdfCount(report) {\n  return report.combo?',"function stcPdfCount(report) {\n  if(report.combo?.sale)return '1 Sale · '+report.combo.productCount+' products · '+report.rows.length+' saved lines';\n  return report.combo?")
change('function steScreenFilters() {\n  const filters=',"function steScreenFilters() {\n  if(stkUI().tab==='sale')return {type:'sale',order:'newest'};\n  const filters=")
change("stock?'OVERVIEW':report.combo?'COMBO':'HISTORY'","stock?'OVERVIEW':report.combo?.sale?'SALE':report.combo?'COMBO':'HISTORY'")
change("report.combo?'ONE COMBO':'HISTORY'","report.combo?.sale?'ONE SALE':report.combo?'ONE COMBO':'HISTORY'")
change('unitSummary();stcPdfBody(report,{paragraph,tableHeader,tableRow,space:','unitSummary();(report.combo.sale?ssaPdfBody:stcPdfBody)(report,{paragraph,tableHeader,tableRow,space:')
change("        if(row.members.length)paragraph('Tagged members: '","        ssaPdfLine(row,paragraph);\n        if(row.members.length)paragraph('Tagged members: '")
change('      });unitSummary();','      });unitSummary();ssaPdfTotals(report,paragraph);')
# Extended local matching + prominent cards, outside collapsed legacy controls.
change('function stmMatch(block, s) {','function ssxLegacyMatch(block, s) {')
change('function sapMatch(name,unit,stock){','function ssxLegacySmartMatch(name,unit,stock){')
change("        (matched ? '<details class=\"ste-product\">", "        ssxSuggestionsHTML(block,'review') + (matched ? '<details class=\"ste-product\">")
change("  if(fields.has('product')||fields.has('unit')){","  if(fields.has('product')||fields.has('unit')||ssxNeedsPanel(b,e.plan.parsed.blocks[b.index]?.name||b.name)){")
old="</pre></details><div class=\"sap-fields\">'+form+'</div><label class=\"stm-check sap-skip\">"
new="</pre></details>'+ssxSuggestionsHTML(b,'smart',e.plan.parsed.blocks[b.index]?.name||b.name)+'<div class=\"sap-fields\">'+form+'</div><label class=\"stm-check sap-skip\">"
change(old,new)
change('    smartPaste: { parse:sapParse, plan:sapPlan, apply:sapApply, process:sapProcess, open:sapOpen },',
'''    sale: { id:ssaId, plan:ssaPlan, save:ssaSave, totals:ssaTotals, lineTotal:ssaLineTotal, money:ssaMoney, percent:ssaPercent, capacity:ssaCapacity, rows:id=>syncClone(ssaSaleRows(id)), open:ssaOpen, edit:ssaOpenSaved },
    suggestions: { rank:ssxCandidates, score:ssxScore, match:ssxMatch },
    smartPaste: { parse:sapParse, plan:sapPlan, apply:sapApply, process:sapProcess, open:sapOpen },''')
modules=[]
marker='/* ----------------------------- 17. BOOTSTRAP ---------------------------- */'
for filename,start,end,gap in [
 ('sales.js','/* v3.43 STOCK SALE CORE BEGIN','/* v3.43 STOCK SALE CORE END */',True),
 ('suggestions.js','/* v3.43 STOCK SUGGESTIONS BEGIN','/* v3.43 STOCK SUGGESTIONS END */',True),
 ('composer.js','/* v3.43 STOCK SALE UI BEGIN','/* v3.43 STOCK SALE UI END */',True),
 ('sale.css','/* v3.43 STOCK SALE STYLE BEGIN */','/* v3.43 STOCK SALE STYLE END */',False)]:
    text=(R/'scripts/stock-sale'/filename).read_text().rstrip()+'\n'
    assert text.startswith(start) and text.endswith(end+'\n')
    modules.append([start,end,hashlib.sha256(text.encode()).hexdigest(),gap])
    at=marker if gap else '</style>'
    assert s.count(at)==1 and start not in s
    s=s.replace(at,text+('\n' if gap else '')+at)
for name in ['hisaab_v3.html','Hisaab-Pro-v3.43.html']:(R/name).write_text(s)
compat='''/* Exact v3.43 optional Sale + highlighted suggestions reversal. Restore EVERY
   immutable v3.42 byte before the entire existing compatibility guard chain.
   Old inventory/history/finance/fonts/auth/receipts stay source-guarded. */
const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const hooks='''+json.dumps(hooks,ensure_ascii=False,indent=2)+''';
const modules='''+json.dumps(modules,ensure_ascii=False,indent=2)+''';
function withoutStockSale(source){
 if(!source.includes('/* v3.43 STOCK SALE CORE BEGIN'))return source;
 for(const[start,end,sha,gap]of modules){
  assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
  const from=source.indexOf(start),to=source.indexOf(end)+end.length+1;
  assert.equal(createHash('sha256').update(source.slice(from,to)).digest('hex'),sha,'exact bounded Sale / suggestions module');
  if(gap)assert.equal(source[to],'\\n');source=source.slice(0,from)+source.slice(to+(gap?1:0));
 }
 for(const[from,to,count]of [...hooks].reverse()){assert.equal(source.split(from).length-1,count,'exact Sale integration hook: '+from.slice(0,100));source=source.split(from).join(to);}
 assert.equal(createHash('sha256').update(source).digest('hex'),'''+json.dumps(BASE_SHA)+''','EVERY immutable v3.42 byte');
 return source;
}
module.exports={withoutStockSale,hooks,modules};
'''
(R/'tests/stock-sale-compat.js').write_text(compat)
print('v3.43:',len(hooks),'hooks /',sum(h[2] for h in hooks),'locations + 3 JS / 1 CSS modules;',len(s.encode()),'bytes;',hashlib.sha256(s.encode()).hexdigest())
