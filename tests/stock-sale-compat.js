/* Exact v3.43 optional Sale + highlighted suggestions reversal. Restore EVERY
   immutable v3.42 byte before the entire existing compatibility guard chain.
   Old inventory/history/finance/fonts/auth/receipts stay source-guarded. */
const assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const hooks=[
  [
    "const APP_VERSION = \"3.43\";",
    "const APP_VERSION = \"3.42\";",
    1
  ],
  [
    "      'v3.43 — <b style=\"color:var(--ink)\">Smart Stock Sale + highlighted product matches</b>: Fast local search / suggestions, one multi-product Sale or named custom package, editable quantities / actual INR prices / line discounts, exact-unit quantities and automatic totals. Confirm once for atomic dated-ledger stock deduction; complete price-aware Sale History, whole-sale Edit / Delete / reuse / premium PDF. Message / Screenshot / Smart Paste show original nonexact names beside highlighted ranked choices with available stock and similarity; one-tap selection. Unique safe 75%+ spelling / abbreviation matches retained; ambiguous units / models / variants never silently chosen. Old unpriced entries stay unpriced, no migration or seed; finance / customer accounts untouched.<br>'+\n      'v3.42 — <b style=\"color:var(--ink)\">Smart Paste: automatic Stock entry</b>",
    "      'v3.42 — <b style=\"color:var(--ink)\">Smart Paste: automatic Stock entry</b>",
    1
  ],
  [
    "\"note\", \"source\", \"createdAt\", \"updatedAt\", \"sale\"], \"transaction\");",
    "\"note\", \"source\", \"createdAt\", \"updatedAt\"], \"transaction\");",
    1
  ],
  [
    "  if (products && (!products.has(t.productId) || products.get(t.productId).unit !== t.unit)) throw new Error(\"Stock transaction ka product / unit missing ya badal gaya. Product aur movements saath restore karein.\");\n  if (t.sale !== undefined) ssaValidateLine(t);",
    "  if (products && (!products.has(t.productId) || products.get(t.productId).unit !== t.unit)) throw new Error(\"Stock transaction ka product / unit missing ya badal gaya. Product aur movements saath restore karein.\");",
    1
  ],
  [
    "  ssaValidateGroups(s); stkLedger(s); return true;",
    "  stkLedger(s); return true;",
    1
  ],
  [
    "function stkRecoveryCheck(recovered, before, copy) {\n  ssaRecoverySafety(recovered,before,copy);",
    "function stkRecoveryCheck(recovered, before, copy) {",
    1
  ],
  [
    "  if (!stkDate(next.date)) throw new Error(\"Stock entry ki valid date chunein (1900–9998).\");\n  ssaMovement(next, input, old); return next;",
    "  if (!stkDate(next.date)) throw new Error(\"Stock entry ki valid date chunein (1900–9998).\");\n  return next;",
    1
  ],
  [
    "function stkSaveMovement(input, context) {\n  return stkAtomic(s => {\n    ssaLegacyWrite(input);",
    "function stkSaveMovement(input, context) {\n  return stkAtomic(s => {",
    1
  ],
  [
    "    const old = s.transactions.find(t => t.id === id); if (!old) throw new Error(\"Stock entry nahi mili. Current history check karein.\");\n    ssaProtectDelete(old);",
    "    const old = s.transactions.find(t => t.id === id); if (!old) throw new Error(\"Stock entry nahi mili. Current history check karein.\");",
    1
  ],
  [
    "    const old = s.products.find(p => p.id === id); if (!old) throw new Error(\"Product nahi mila. Current list check karein.\");\n    ssaProtectProductDelete(id);",
    "    const old = s.products.find(p => p.id === id); if (!old) throw new Error(\"Product nahi mila. Current list check karein.\");",
    1
  ],
  [
    "  ssaMergeSafety(s, b, l, r, preference, conflict, eq);\n  const fields = [\"productId\", \"productName\", \"unit\", \"photoId\", \"type\", \"qty\", \"date\", \"sequence\", \"source\"];",
    "  const fields = [\"productId\", \"productName\", \"unit\", \"photoId\", \"type\", \"qty\", \"date\", \"sequence\", \"source\"];",
    1
  ],
  [
    "  ssaConnectSales([s,l,r,b], connect);\n  const visited = new Set();\n  for (const id of graph.keys()) {",
    "  const visited = new Set();\n  for (const id of graph.keys()) {",
    1
  ],
  [
    "if (($(\"#overlay\") || ssaHasDraft()) && !samePayload(before, next)) {",
    "if ($(\"#overlay\") && !samePayload(before, next)) {",
    1
  ],
  [
    "this.offlineMode || $(\"#overlay\") || ssaHasDraft()) return false;",
    "this.offlineMode || $(\"#overlay\")) return false;",
    1
  ],
  [
    "Stock conflict: Sale prices / discounts / membership changed, ya combined entries se negative balance, duplicate product / changed unit ho sakta hai. Complete conflicting Sale aur affected product ki poori dependent entry-set selected device se li jayegi; losing rows safety copy aur audit mein retained. Independent products merge honge.",
    "Stock conflict: combined entries se negative balance, duplicate product ya changed product/unit ho sakta hai. Affected product ki poori dependent entry-set selected device se li jayegi; losing rows safety copy aur audit me rahengi. Independent products merge honge.",
    1
  ],
  [
    "t.source === \"opening\" ? \"opening stock\" : \"\", t.sale?.label, t.sale?.id, t.sale?.time].join(\" \"), f.q)",
    "t.source === \"opening\" ? \"opening stock\" : \"\"].join(\" \"), f.q)",
    1
  ],
  [
    "const STK_LABELS = { sale: \"Sale / price / line discount\", name:",
    "const STK_LABELS = { name:",
    1
  ],
  [
    "  if (key === \"sale\") return ssaAuditValue(value);\n  if (key === \"type\") return STK_KINDS[value] || String(value);",
    "  if (key === \"type\") return STK_KINDS[value] || String(value);",
    1
  ],
  [
    "else if (UI.view === \"stock\") { root.innerHTML = viewStock(); ssaAfterRender(); }",
    "else if (UI.view === \"stock\") root.innerHTML = viewStock();",
    1
  ],
  [
    "const tabs = [[\"products\", \"▣ Products & Live Stock\"], [\"sale\", \"＋ Stock Sale / combo\"], [\"history\",",
    "const tabs = [[\"products\", \"▣ Products & Live Stock\"], [\"history\",",
    1
  ],
  [
    "u.tab === \"products\" ? stkInventoryHTML() : u.tab === \"sale\" ? ssaHTML() : u.tab === \"history\" ? stkMovementHTML() : stkAuditHTML();",
    "u.tab === \"products\" ? stkInventoryHTML() : u.tab === \"history\" ? stkMovementHTML() : stkAuditHTML();",
    1
  ],
  [
    "+ '</div>' + (u.tab === 'sale' ? '' : stkFiltersHTML()) + content +",
    "+ '</div>' + stkFiltersHTML() + content +",
    1
  ],
  [
    "case 'movement': stkCheck(stkViewContext || stkContext()); if(button.dataset.type === 'sale') ssaOpen(button.dataset.product); else stkOpenMovement(button.dataset.type, button.dataset.product); break;",
    "case 'movement': stkCheck(stkViewContext || stkContext()); stkOpenMovement(button.dataset.type, button.dataset.product); break;",
    1
  ],
  [
    "  if (id && !old) throw new Error(\"Stock entry nahi mili. Current history kholein.\");\n  if (old?.sale) { ssaOpenSaved(id); return; }",
    "  if (id && !old) throw new Error(\"Stock entry nahi mili. Current history kholein.\");",
    1
  ],
  [
    "  if (!p) throw new Error('Entry nahi mili. Current list check karein.');\n  if (kind !== 'product' && p.sale) { stcOpen(id, 'delete'); return; }\n  if (kind === 'product') ssaProtectProductDelete(id);\n  const count =",
    "  if (!p) throw new Error('Entry nahi mili. Current list check karein.');\n  const count =",
    1
  ],
  [
    "function stkResetSession() { ssaReset(); sapCancel();",
    "function stkResetSession() { sapCancel();",
    1
  ],
  [
    "UI.view === \"stock\" ? (stkUI().tab === \"sale\" ? ssaState?.query || \"\" : stkUI().q) : UI.view === \"attendance\" ? attUI().q : UI.search;",
    "UI.view === \"stock\" ? stkUI().q : UI.view === \"attendance\" ? attUI().q : UI.search;",
    1
  ],
  [
    "  if (e.target.id !== \"gSearch\") return;\n  if (UI.view === \"stock\" && stkUI().tab === \"sale\" && ssaState && !ssaState.receipt) { ssaState.query=e.target.value.slice(0,90); ssaState.active=0; if($(\"#ssaSearch\")) $(\"#ssaSearch\").value=ssaState.query; ssaSearchRender(); return; }\n  UI.search = e.target.value;",
    "  if (e.target.id !== \"gSearch\") return;\n  UI.search = e.target.value;",
    1
  ],
  [
    "    const meta = stmMeta(h) || ssaOrigin(h); if (!meta) return;",
    "    const meta = stmMeta(h); if (!meta) return;",
    1
  ],
  [
    "  s.transactions.filter(t=>t.sale).forEach(t=>{if(!candidates.has(t.id))candidates.set(t.id,new Set());candidates.get(t.id).add('sale:'+t.sale.id);});\n  // Conflicting source identities are not silently combined into either batch.",
    "  // Conflicting source identities are not silently combined into either batch.",
    1
  ],
  [
    "delivery:stcUnique(outgoing,'deliveryName'), phones:stcUnique(outgoing,'deliveryPhone'), purposes:stcUnique(outgoing,'purpose'), ...ssaDescribe(ordered)};",
    "delivery:stcUnique(outgoing,'deliveryName'), phones:stcUnique(outgoing,'deliveryPhone'), purposes:stcUnique(outgoing,'purpose')};",
    1
  ],
  [
    "function stcCardHTML(group) {\n  if(group.sale)return ssaCardHTML(group);\n  const partial=",
    "function stcCardHTML(group) {\n  const partial=",
    1
  ],
  [
    "  const group=stcGet(entryId);if(!group.isCombo)throw new Error('Yeh message combo nahi hai. Individual Edit use karein.');\n  if(group.sale)throw new Error('Priced Sale ko complete Sale Edit se badlein; prices / discounts saath retained rahenge.');",
    "  const group=stcGet(entryId);if(!group.isCombo)throw new Error('Yeh message combo nahi hai. Individual Edit use karein.');",
    1
  ],
  [
    "  stkCheck(stkViewContext||stkContext());const group=stcGet(entryId);if(!group.isCombo)throw new Error('Current message combo chunein.');\n  if(group.sale&&mode!=='delete'){ssaOpenSaved(entryId);return;}",
    "  stkCheck(stkViewContext||stkContext());const group=stcGet(entryId);if(!group.isCombo)throw new Error('Current message combo chunein.');",
    1
  ],
  [
    "    if(group.isCombo){report.combo=group;report.title='Stock Combo';report.rows=group.rows.map(row=>({...row,members:steTaggedMembers(row)}));report.labels=['1 combo · '+group.productCount+' products · '+group.rows.length+' saved stock movements. Sirf is combo ki abhi saved rows; skipped / deleted nahi. Screen filters apply nahi.'];}\n    if(group.sale){report.title='Stock Sale';report.labels=['1 saved Sale / combo · '+group.productCount+' products · '+group.rows.length+' lines. Actual INR prices, line discounts and exact saved date/time. Whole Sale; screen filters / unsaved drafts excluded.'];}",
    "    if(group.isCombo){report.combo=group;report.title='Stock Combo';report.rows=group.rows.map(row=>({...row,members:steTaggedMembers(row)}));report.labels=['1 combo · '+group.productCount+' products · '+group.rows.length+' saved stock movements. Sirf is combo ki abhi saved rows; skipped / deleted nahi. Screen filters apply nahi.'];}",
    1
  ],
  [
    "function stcPdfCount(report) {\n  if(report.combo?.sale)return '1 Sale · '+report.combo.productCount+' products · '+report.rows.length+' saved lines';\n  return report.combo?",
    "function stcPdfCount(report) {\n  return report.combo?",
    1
  ],
  [
    "function steScreenFilters() {\n  if(stkUI().tab==='sale')return {type:'sale',order:'newest'};\n  const filters=",
    "function steScreenFilters() {\n  const filters=",
    1
  ],
  [
    "stock?'OVERVIEW':report.combo?.sale?'SALE':report.combo?'COMBO':'HISTORY'",
    "stock?'OVERVIEW':report.combo?'COMBO':'HISTORY'",
    1
  ],
  [
    "report.combo?.sale?'ONE SALE':report.combo?'ONE COMBO':'HISTORY'",
    "report.combo?'ONE COMBO':'HISTORY'",
    1
  ],
  [
    "unitSummary();(report.combo.sale?ssaPdfBody:stcPdfBody)(report,{paragraph,tableHeader,tableRow,space:",
    "unitSummary();stcPdfBody(report,{paragraph,tableHeader,tableRow,space:",
    1
  ],
  [
    "        ssaPdfLine(row,paragraph);\n        if(row.members.length)paragraph('Tagged members: '",
    "        if(row.members.length)paragraph('Tagged members: '",
    1
  ],
  [
    "      });unitSummary();ssaPdfTotals(report,paragraph);",
    "      });unitSummary();",
    1
  ],
  [
    "function ssxLegacyMatch(block, s) {",
    "function stmMatch(block, s) {",
    1
  ],
  [
    "function ssxLegacySmartMatch(name,unit,stock){",
    "function sapMatch(name,unit,stock){",
    1
  ],
  [
    "        ssxSuggestionsHTML(block,'review') + (matched ? '<details class=\"ste-product\">",
    "        (matched ? '<details class=\"ste-product\">",
    1
  ],
  [
    "  if(fields.has('product')||fields.has('unit')||ssxNeedsPanel(b,e.plan.parsed.blocks[b.index]?.name||b.name)){",
    "  if(fields.has('product')||fields.has('unit')){",
    1
  ],
  [
    "</pre></details>'+ssxSuggestionsHTML(b,'smart',e.plan.parsed.blocks[b.index]?.name||b.name)+'<div class=\"sap-fields\">'+form+'</div><label class=\"stm-check sap-skip\">",
    "</pre></details><div class=\"sap-fields\">'+form+'</div><label class=\"stm-check sap-skip\">",
    1
  ],
  [
    "    sale: { id:ssaId, plan:ssaPlan, save:ssaSave, totals:ssaTotals, lineTotal:ssaLineTotal, money:ssaMoney, percent:ssaPercent, capacity:ssaCapacity, rows:id=>syncClone(ssaSaleRows(id)), open:ssaOpen, edit:ssaOpenSaved },\n    suggestions: { rank:ssxCandidates, score:ssxScore, match:ssxMatch },\n    smartPaste: { parse:sapParse, plan:sapPlan, apply:sapApply, process:sapProcess, open:sapOpen },",
    "    smartPaste: { parse:sapParse, plan:sapPlan, apply:sapApply, process:sapProcess, open:sapOpen },",
    1
  ]
];
const modules=[
  [
    "/* v3.43 STOCK SALE CORE BEGIN",
    "/* v3.43 STOCK SALE CORE END */",
    "5cb98ccba09ccc0b58ba8e5746a7962b3e987688eb870162a471138392388ae6",
    true
  ],
  [
    "/* v3.43 STOCK SUGGESTIONS BEGIN",
    "/* v3.43 STOCK SUGGESTIONS END */",
    "e677ea6df099db5fe1cf666b60e2f6976d2eaace80751e7335067387f408760b",
    true
  ],
  [
    "/* v3.43 STOCK SALE UI BEGIN",
    "/* v3.43 STOCK SALE UI END */",
    "484f0a4391c05c6359efaab1afe29b027cb50f10cb47713a1a45d2047ce0a92c",
    true
  ],
  [
    "/* v3.43 STOCK SALE STYLE BEGIN */",
    "/* v3.43 STOCK SALE STYLE END */",
    "f65ed33eb32a8b43d5afcbf29217b3ab8651e97ad3dbc6d6ca6e8c89e2397031",
    false
  ]
];
function withoutStockSale(source){
 source=require('./stock-bulk-compat').withoutStockBulk(source);
 if(!source.includes('/* v3.43 STOCK SALE CORE BEGIN'))return source;
 for(const[start,end,sha,gap]of modules){
  assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
  const from=source.indexOf(start),to=source.indexOf(end)+end.length+1;
  assert.equal(createHash('sha256').update(source.slice(from,to)).digest('hex'),sha,'exact bounded Sale / suggestions module');
  if(gap)assert.equal(source[to],'\n');source=source.slice(0,from)+source.slice(to+(gap?1:0));
 }
 for(const[from,to,count]of [...hooks].reverse()){assert.equal(source.split(from).length-1,count,'exact Sale integration hook: '+from.slice(0,100));source=source.split(from).join(to);}
 assert.equal(createHash('sha256').update(source).digest('hex'),"2e5241116916a1732acdba7fec1fd04de03b7fb6bd3749832ea01f88c935bc30",'EVERY immutable v3.42 byte');
 return source;
}
module.exports={withoutStockSale,hooks,modules};
