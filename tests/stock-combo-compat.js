/* Exact v3.37 combo allowlist; all original v3.36 bytes must be recovered
   before any earlier compatibility check. No old source guard is removed. */
const assert=require('node:assert/strict');
const hooks=[
  [
    "const APP_VERSION = \"3.37\";",
    "const APP_VERSION = \"3.36\";",
    1
  ],
  [
    "      'v3.37 — <b style=\"color:var(--ink)\">Ek party, ek message, ek combo</b>: Pasted message ke saare products ab ek History combo ke andar; common party / tagged log / roles, poore combo ka ek PDF. Ek saath Edit / Delete, original product units aur dated In / Out / Sale ledger safe. Purane audited messages bina re-save grouped; alag messages party/date milne par bhi merge nahi hote.<br>'+\n      'v3.36 — <b style=\"color:var(--ink)\">Aasaan Stock + tagged log + PDF</b>",
    "      'v3.36 — <b style=\"color:var(--ink)\">Aasaan Stock + tagged log + PDF</b>",
    1
  ],
  [
    "function openModal(html, opts) {\n  stcCancel();\n  stePdfCancel();",
    "function openModal(html, opts) {\n  stePdfCancel();",
    1
  ],
  [
    "function closeModal() {\n  stcCancel();\n  stePdfCancel();",
    "function closeModal() {\n  stePdfCancel();",
    1
  ],
  [
    "function stkResetSession() { stcCancel(); UI.stock = null;",
    "function stkResetSession() { UI.stock = null;",
    1
  ],
  [
    "function stcLegacyHistoryHTML() {",
    "function stkMovementHTML() {",
    1
  ],
  [
    "function stcLegacyReport(options = {}, data) {",
    "function steReport(options = {}, data) {",
    1
  ],
  [
    "function stcLegacyReceiptHTML() {",
    "function steReceiptHTML() {",
    1
  ],
  [
    ">＋ Combo / message<",
    ">＋ Message / screenshot<",
    1
  ],
  [
    "<span>Combos / entries</span><b>' + stcEntryCount() + '</b><small>' + stkData().transactions.length + ' stock movements</small>",
    "<span>Stock entries</span><b>' + stkData().transactions.length + '</b>",
    1
  ],
  [
    "Ek paste = ek party ki 1 combo entry. Saare products usi ke andar.",
    "Ek message se saare items. Ek-ek entry bharni nahi.",
    1
  ],
  [
    "Agla: combo dekho →",
    "Agla: entries dekho →",
    2
  ],
  [
    "Ek party · 1 combo check karo",
    "Entries dekhkar save karo",
    1
  ],
  [
    "Is ek combo ki sirf nayi movements save karo; already included / skipped dobara nahi.",
    "Sirf nayi entries save karo.",
    1
  ],
  [
    "Nayi stock movement ✓ · badlein",
    "Nayi entry ✓ · badlein",
    1
  ],
  [
    "'Generated '+report.generated+' · '+stcPdfCount(report)",
    "'Generated '+report.generated+' · '+report.rows.length+' '+(report.kind==='stock'?'products':'saved entries')",
    1
  ],
  [
    "report.combo?'Product balances use the full dated ledger. One common party / tags / chosen roles above the items; original movement dates and distinct In suppliers are retained.':report.kind==='history'?'Balance after each product movement uses the full chronological ledger, not a filtered subtotal. Details below are stock movements, not separate combo entries.':'Balance after entry is from the full chronological ledger, not the filtered subtotal. All tagged names, roles and original source notes follow each entry.'",
    "'Balance after entry is from the full chronological ledger, not the filtered subtotal. All tagged names, roles and original source notes follow each entry.'",
    1
  ],
  [
    "paragraph((report.kind==='history'?'Movement ':'Entry ')+(index+1)+' of '+report.rows.length",
    "paragraph('Entry '+(index+1)+' of '+report.rows.length",
    1
  ],
  [
    "  stcReview(plan); stmEnable();",
    "  $('#stmSave').textContent = plan.added ? 'Haan, ' + plan.added + (plan.added === 1 ? ' entry' : ' entries') + ' save karo' : 'Koi nayi entry nahi'; stmEnable();",
    1
  ],
  [
    "toast('1 combo saved · ' + result.imported + ' stock movements; ' + result.skipped + ' skipped', 'ok');",
    "toast(result.imported + ' Stock entries saved; ' + result.skipped + ' skipped', 'ok');",
    1
  ],
  [
    "  }else if(report.combo){\n    stcPdfBody(report,{paragraph,tableHeader,tableRow,space:minimum=>{if(y<minimum)newPage();},advance:amount=>{y-=amount;}});\n  }else{\n    const cols=[{label:'Date',w:65}",
    "  }else{\n    const cols=[{label:'Date',w:65}",
    1
  ],
  [
    "    $('#stePdfSummary').innerHTML=stcPdfSummary(report,kind);",
    "    $('#stePdfSummary').innerHTML='<b>'+report.rows.length+' '+(kind==='stock'?'products':'saved entries')+'</b><p>'+report.labels.map(esc).join('<br>')+'</p><p>'+ (kind==='stock'?'Har product ki original unit + live available quantity.':'Har entry ki quantity, balance, party, tagged log, roles aur source note.')+'</p>';",
    1
  ],
  [
    "    taggedMembers: steTaggedMembers, report: steReport, pdfString: stePdfString, openPdf: stePdfOpen,\n    combo: { groups:stcGroups, get:stcGet, edit:stcEdit, remove:stcDelete, open:stcOpen } },",
    "    taggedMembers: steTaggedMembers, report: steReport, pdfString: stePdfString, openPdf: stePdfOpen },",
    1
  ]
];
function withoutStockCombo(source){
 if(!source.includes('/* v3.37 STOCK COMBO BEGIN'))return source;
 for(const[start,end]of [['/* v3.37 STOCK COMBO BEGIN','/* v3.37 STOCK COMBO END */'],['/* v3.37 STOCK COMBO STYLE BEGIN */','/* v3.37 STOCK COMBO STYLE END */']]){
  assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
  let tail=source.indexOf(end)+end.length;if(source[tail]==='\n')tail++;if(!start.includes('STYLE')&&source[tail]==='\n')tail++;
  source=source.slice(0,source.indexOf(start))+source.slice(tail);
 }
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact combo hook: '+from.slice(0,100));source=source.split(from).join(to);}
 return source;
}
module.exports={withoutStockCombo,hooks};
