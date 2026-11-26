#!/usr/bin/env python3
"""Deterministic v3.37 combo release and exact integration allowlist.
Run from any directory. Immutable v3.36 is the base; Python stdlib only.
"""
from pathlib import Path
import json
R=Path(__file__).resolve().parent.parent
s=(R/'Hisaab-Pro-v3.36.html').read_text()
hooks=[]
def change(old,new,count=1):
    global s
    assert s.count(old)==count,(old[:180],s.count(old),count)
    s=s.replace(old,new)
    hooks.append([new,old,count])
change('const APP_VERSION = "3.36";','const APP_VERSION = "3.37";')
change("      'v3.36 — <b style=\"color:var(--ink)\">Aasaan Stock + tagged log + PDF</b>","      'v3.37 — <b style=\"color:var(--ink)\">Ek party, ek message, ek combo</b>: Pasted message ke saare products ab ek History combo ke andar; common party / tagged log / roles, poore combo ka ek PDF. Ek saath Edit / Delete, original product units aur dated In / Out / Sale ledger safe. Purane audited messages bina re-save grouped; alag messages party/date milne par bhi merge nahi hote.<br>'+\n      'v3.36 — <b style=\"color:var(--ink)\">Aasaan Stock + tagged log + PDF</b>")
change('function openModal(html, opts) {\n  stePdfCancel();','function openModal(html, opts) {\n  stcCancel();\n  stePdfCancel();')
change('function closeModal() {\n  stePdfCancel();','function closeModal() {\n  stcCancel();\n  stePdfCancel();')
change('function stkResetSession() { UI.stock = null;', 'function stkResetSession() { stcCancel(); UI.stock = null;')
change('function stkMovementHTML() {','function stcLegacyHistoryHTML() {')
change('function steReport(options = {}, data) {','function stcLegacyReport(options = {}, data) {')
change('function steReceiptHTML() {','function stcLegacyReceiptHTML() {')
change('>＋ Message / screenshot<','>＋ Combo / message<')
change("<span>Stock entries</span><b>' + stkData().transactions.length + '</b>","<span>Combos / entries</span><b>' + stcEntryCount() + '</b><small>' + stkData().transactions.length + ' stock movements</small>")
change('Ek message se saare items. Ek-ek entry bharni nahi.','Ek paste = ek party ki 1 combo entry. Saare products usi ke andar.')
change('Agla: entries dekho →','Agla: combo dekho →',2)
change('Entries dekhkar save karo','Ek party · 1 combo check karo')
change('Sirf nayi entries save karo.','Is ek combo ki sirf nayi movements save karo; already included / skipped dobara nahi.')
change('Nayi entry ✓ · badlein','Nayi stock movement ✓ · badlein')
change("'Generated '+report.generated+' · '+report.rows.length+' '+(report.kind==='stock'?'products':'saved entries')","'Generated '+report.generated+' · '+stcPdfCount(report)")
change("'Balance after entry is from the full chronological ledger, not the filtered subtotal. All tagged names, roles and original source notes follow each entry.'","report.combo?'Product balances use the full dated ledger. One common party / tags / chosen roles above the items; original movement dates and distinct In suppliers are retained.':report.kind==='history'?'Balance after each product movement uses the full chronological ledger, not a filtered subtotal. Details below are stock movements, not separate combo entries.':'Balance after entry is from the full chronological ledger, not the filtered subtotal. All tagged names, roles and original source notes follow each entry.'")
change("paragraph('Entry '+(index+1)+' of '+report.rows.length", "paragraph((report.kind==='history'?'Movement ':'Entry ')+(index+1)+' of '+report.rows.length")
old=next(line for line in s.splitlines() if "$('#stmSave').textContent = plan.added ?" in line)
change(old,'  stcReview(plan); stmEnable();')
change("toast(result.imported + ' Stock entries saved; ' + result.skipped + ' skipped', 'ok');", "toast('1 combo saved · ' + result.imported + ' stock movements; ' + result.skipped + ' skipped', 'ok');")
change("  }else{\n    const cols=[{label:'Date',w:65}","  }else if(report.combo){\n    stcPdfBody(report,{paragraph,tableHeader,tableRow,space:minimum=>{if(y<minimum)newPage();},advance:amount=>{y-=amount;}});\n  }else{\n    const cols=[{label:'Date',w:65}")
old=next(line for line in s.splitlines() if "$('#stePdfSummary').innerHTML='<b>'+report.rows.length" in line)
change(old,"    $('#stePdfSummary').innerHTML=stcPdfSummary(report,kind);")
change('    taggedMembers: steTaggedMembers, report: steReport, pdfString: stePdfString, openPdf: stePdfOpen },', '    taggedMembers: steTaggedMembers, report: steReport, pdfString: stePdfString, openPdf: stePdfOpen,\n    combo: { groups:stcGroups, get:stcGet, edit:stcEdit, remove:stcDelete, open:stcOpen } },')
js=(R/'scripts/stock-combo/combo.js').read_text().rstrip()+'\n\n'
css=(R/'scripts/stock-combo/combo.css').read_text()
marker='/* ----------------------------- 17. BOOTSTRAP ---------------------------- */'
assert s.count(marker)==1
s=s.replace(marker,js+marker)
marker='/* v3.36 STOCK EASY STYLE END */\n'
assert s.count(marker)==1
s=s.replace(marker,marker+css)
(R/'hisaab_v3.html').write_text(s)
(R/'Hisaab-Pro-v3.37.html').write_text(s)
compat='''/* Exact v3.37 combo allowlist; all original v3.36 bytes must be recovered
   before any earlier compatibility check. No old source guard is removed. */
const assert=require('node:assert/strict');
const hooks='''+json.dumps(hooks,ensure_ascii=False,indent=2)+''';
function withoutStockCombo(source){
 if(!source.includes('/* v3.37 STOCK COMBO BEGIN'))return source;
 for(const[start,end]of [['/* v3.37 STOCK COMBO BEGIN','/* v3.37 STOCK COMBO END */'],['/* v3.37 STOCK COMBO STYLE BEGIN */','/* v3.37 STOCK COMBO STYLE END */']]){
  assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
  let tail=source.indexOf(end)+end.length;if(source[tail]==='\\n')tail++;if(!start.includes('STYLE')&&source[tail]==='\\n')tail++;
  source=source.slice(0,source.indexOf(start))+source.slice(tail);
 }
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact combo hook: '+from.slice(0,100));source=source.split(from).join(to);}
 return source;
}
module.exports={withoutStockCombo,hooks};
'''
(R/'tests/stock-combo-compat.js').write_text(compat)
print('v3.37:',len(hooks),'exact hooks;',len(s.encode()),'bytes')
