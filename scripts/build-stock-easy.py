#!/usr/bin/env python3
"""Rebuild v3.36 plus its exact integration compatibility allowlist.

Developer-only, standard Python library. Run from any working directory.
The immutable v3.35 release is the base; financial/cloud/ledger/report/font code
outside the counted integration hooks is never rewritten. Output is deterministic.
"""
from pathlib import Path
import json
R=Path(__file__).resolve().parent.parent
base=(R/'Hisaab-Pro-v3.35.html').read_text()
s=base
hooks=[]
def change(old,new,count=1):
 global s
 assert s.count(old)==count,(old[:160],s.count(old),count)
 s=s.replace(old,new)
 hooks.append([new,old,count])
def function(name,new,next_name):
 start=s.index('function '+name+'(')
 end=s.index('function '+next_name+'(',start)
 if s[end-6:end]=='async ': end-=6
 old=s[start:end].rstrip('\n')
 change(old,new.rstrip('\n'))
change('const APP_VERSION = "3.35";','const APP_VERSION = "3.36";')
change("      'v3.35 — <b style=\"color:var(--ink)\">Message / screenshot se Stock</b>","      'v3.36 — <b style=\"color:var(--ink)\">Aasaan Stock + tagged log + PDF</b>: Message/photo se do-screen review, saare tagged naam alag dikhte aur save hote hain; ek tap se explicit Salesperson / Delivery / Receiver choice. Naam manually jod sakte hain. Available Stock, combined-filter History aur saved message ke logo-wale local PDF / file-share. Date/year, units, duplicates, opening checks aur atomic save guards unchanged.<br>'+\n      'v3.35 — <b style=\"color:var(--ink)\">Message / screenshot se Stock</b>")
change('function openModal(html, opts) {\n  stmCancel();','function openModal(html, opts) {\n  stePdfCancel();\n  stmCancel();')
change('function closeModal() {\n  stmCancel();','function closeModal() {\n  stePdfCancel();\n  stmCancel();')
change('<button class="btn primary" data-stm="open">Message / screenshot</button><button class="btn" data-stki="open">Import stock</button>','<button class="btn primary" data-stm="open">＋ Message / screenshot</button><button class="btn" data-ste-pdf="current">↓ Stock PDF</button><button class="btn" data-stki="open">Import stock</button>')
change("    '<div class=\"stk-metrics\"><div class=\"card\"><span>Products</span>","    steReceiptHTML() + '<div class=\"stk-metrics\"><div class=\"card\"><span>Products</span>")
change("(t.note ? '<div class=\"stk-note\">' + esc(t.note) + '</div>' : '') + '</td><td>' + esc(t.salesperson || '—')", "(t.note ? '<div class=\"stk-note\">' + esc(t.note) + '</div>' : '') + steTagsHTML(t) + '</td><td>' + esc(t.salesperson || '—')")
change("<div class=\"row-actions\"><button class=\"btn xs\" data-stk=\"entryEdit\" data-id=\"' + esc(t.id) + '\">Edit</button>","<div class=\"row-actions\"><button class=\"btn xs\" data-ste-pdf=\"message\" data-id=\"' + esc(t.id) + '\">PDF</button><button class=\"btn xs\" data-stk=\"entryEdit\" data-id=\"' + esc(t.id) + '\">Edit</button>")
change("return text.replace(/\\r\\n?/g, '\\n').replace(/[०-९]/g, d => String('०१२३४५६७८९'.indexOf(d)))", "return text.replace(/[\\u200b-\\u200f\\u202a-\\u202e\\u2066-\\u2069\\ufeff]/g, '').replace(/\\r\\n?/g, '\\n').replace(/[०-९]/g, d => String('०१२३४५६७८९'.indexOf(d)))")
change('    let line = lines[i];\n    const item =',"    let line = lines[i].replace(/^(?:Tagged members|Tagged|Tags|Tag|Cc)\\s*:\\s*(?=@)/i, '');\n    const item =")
change("if (footer && result.tags.length && /^[\\p{L} ~.'()-]+$/u.test(line))", "if (footer && result.tags.length && /^[\\p{L}\\p{M} @~.'()-]+$/u.test(line))")
change("if (!/[\\p{L}\\p{N}]/u.test(line)) { result.ignored.push(line); continue; }", "if (!/[\\p{L}\\p{N}]/u.test(line) && !line.startsWith('@')) { result.ignored.push(line); continue; }")
change("['year','reference','type','supplier','salesperson','deliveryName','purpose','sameDay','matches','actions']", "['year','reference','type','supplier','salesperson','deliveryName','purpose','sameDay','matches','actions','members']")
change("  const parsed = stmParse(text, options.year), errors = [...parsed.errors], warnings = [...parsed.warnings];", "  const parsed = stmParse(text, options.year), errors = [...parsed.errors], warnings = [...parsed.warnings];\n  const members = steCheckedMembers(parsed.tags, options.members);\n  if (parsed.tags.some(tag => tag.split('@').slice(1).some(part => !/[\\p{L}\\p{N}]/u.test(part)))) errors.push('Tagged person ka naam saaf nahi mila. Message mein har @ ke baad poora naam likhein.');\n  const addedMembers = members.filter(name => !steMemberNames(parsed.tags).some(original => stkKey(original) === stkKey(name)));")
change("  const imported = s.history.some(h => stmMeta(h)?.b === batch), selected = options.matches || {}, actions = options.actions || {};", "  const selected = options.matches || {}, actions = options.actions || {};\n  const importedRows = s.history.filter(h => stmMeta(h)?.b === batch);")
change("  const plan = { parsed, batch, reference, blocks:[], rows:[], errors, warnings, valid:false, signature:'', added:0, skipped:0 };", "  const plan = { parsed, batch, reference, members, blocks:[], rows:[], errors, warnings, valid:false, signature:'', added:0, skipped:0 };")
change("      const exact = imported || known.some(t => t.id === id);", "      // Provenance belongs to a SAVED source row, not every row of the batch.\n      // Retrying a deliberately skipped row still needs all ordinary checks.\n      const exact = known.some(t => t.id === id) || importedRows.some(h => {\n        const meta = stmMeta(h), old = h.after;\n        return (meta.n === stmKey(block.name) || !meta.n && old.productId === product.id) && meta.u === block.unit && old.date === event.date && old.qty === event.qty && (old.type === 'in' ? 'in' : 'take') === event.direction;\n      });")
change("      const note = [parsed.header.raw, block.raw, ...parsed.tags, parsed.phone ? 'Source message driver number ' + parsed.phone : '', reference ? 'Reference ' + reference : ''].filter(Boolean).join('\\n');", "      const note = [parsed.header.raw, block.raw, ...parsed.tags, addedMembers.length ? 'Added tags: ' + addedMembers.map(name => '@' + name).join(' ') : '', parsed.phone ? 'Source message driver number ' + parsed.phone : '', reference ? 'Reference ' + reference : ''].filter(Boolean).join('\\n');")
change("deliveryDetails:reference ? 'Message reference: ' + reference : '',", "deliveryDetails:[members.length ? 'Tagged members: ' + members.map(name => '@' + name).join(' ') : '', reference ? 'Message reference: ' + reference : ''].filter(Boolean).join('\\n'),")
change("    matches:{ ...e.matches }, actions:{ ...e.actions } };", "    matches:{ ...e.matches }, actions:{ ...e.actions }, members:[...(e.members || [])] };")
change("!e.plan?.valid || !$('#stmReviewed')?.checked;", "!e.plan?.valid || !$('#stmReviewed')?.checked || !!$('#steMemberInput')?.value.trim();")
change("  if ($('#stmPreviewButton')) $('#stmPreviewButton').disabled = !!e?.busy;", "  if ($('#stmReviewed')) $('#stmReviewed').disabled = !!e?.busy || !e?.plan?.valid;\n  if ($('#stmPreviewButton')) $('#stmPreviewButton').disabled = !!e?.busy;")
change("  if (clear) { e.matches = {}; e.actions = {}; $('#stmPreview').innerHTML = ''; }", "  if (clear) { e.matches = {}; e.actions = {}; $('#stmPreview').innerHTML = ''; steRefreshPeople(e); }")
function('stmOpen', 'function stmOpen() { return steOpen(); }', 'stmRender')
function('stmRender', 'function stmRender(plan) { return steRender(plan); }', 'stmPreview')
change("    const tags = parsed.tags.join(' ').split('@').map(x => x.trim().replace(/^~/, '')).filter(Boolean);\n    const previous = stkData().transactions.flatMap(t => [t.salesperson, t.deliveryName]).filter(Boolean);\n    $('#stmMembers').innerHTML = [...new Set(tags.concat(previous))].slice(0, 150).map(name => '<option value=\"' + esc(name) + '\"></option>').join('');", "    steRefreshPeople(e);")
change("if (stmCurrent(e) && e.serial === serial) { $('#stmPreview').innerHTML = ''; stmError(error.message); stmEnable(); }", "if (stmCurrent(e) && e.serial === serial) { $('#stmPreview').innerHTML = ''; stmError(error.message); if (/year|saal/.test(error.message)) { steStep(e, 1); $('#stmYear').focus(); } stmEnable(); }")
change("    closeModal(); Object.assign(stkUI(), { tab:'history', q:'', page:0, product:'all', party:'', salesperson:'', from:'', to:'', type:'all', order:'newest' });", "    const receipt = { ids:e.plan.rows.filter(row => row.action === 'new').map(row => row.id), date:e.plan.parsed.header.date, party:e.plan.parsed.header.party };\n    closeModal(); Object.assign(stkUI(), { tab:'history', q:'', page:0, product:'all', party:'', salesperson:'', from:'', to:'', type:'all', order:'newest', lastMessage:receipt });")
change("    if (action === 'edit') { $('#stmText').focus(); $('#stmText').scrollIntoView({ block:'center', behavior:'smooth' }); }", "    if (action === 'edit') { stmInvalidate(stmEditor, false); steStep(stmEditor, 1); $('#stmText').focus(); $('#stmText').scrollIntoView({ block:'center', behavior:'smooth' }); }")
change("  if (target.matches('input,textarea')) stmInvalidate(e, target.id === 'stmText');", "  if (target.id === 'steMemberInput') { stmEnable(); return; }\n  if (target.matches('input,textarea')) stmInvalidate(e, target.id === 'stmText');")
change("  if (target.id === 'stmPhoto') { stmPhoto(target); return; }", "  if (target.id === 'stmPhoto') { stmPhoto(target); return; }\n  if (target.id === 'steMemberInput') return;")
change("    messageImport: { parse: stmParse, plan: stmPlan, apply: stmApply, open: stmOpen } },", "    messageImport: { parse: stmParse, plan: stmPlan, apply: stmApply, open: stmOpen, members: steMemberNames },\n    taggedMembers: steTaggedMembers, report: steReport, pdfString: stePdfString, openPdf: stePdfOpen },")
# Added modules are independently bounded, with their entire integration listed above.
js=(R/'scripts/stock-easy/review-and-pdf.js').read_text().rstrip()+'\n\n'
css=(R/'scripts/stock-easy/review-and-pdf.css').read_text()
s=s.replace('/* ----------------------------- 17. BOOTSTRAP ---------------------------- */',js+'/* ----------------------------- 17. BOOTSTRAP ---------------------------- */')
s=s.replace('/* v3.35 STOCK MESSAGE STYLE END */\n','/* v3.35 STOCK MESSAGE STYLE END */\n'+css)
(R/'hisaab_v3.html').write_text(s)
(R/'Hisaab-Pro-v3.36.html').write_text(s)
compat='''/* Exact v3.36 presentation/member/PDF integration allowlist. Reverse to the
   immutable v3.35 in full before running all older source compatibility guards.
   No original archive, financial, cloud, report, font or ledger guard is waived. */
const assert=require('node:assert/strict');
const hooks='''+json.dumps(hooks,ensure_ascii=False,indent=2)+''';
function withoutStockEasy(source){
 if(!source.includes('/* v3.36 STOCK EASY BEGIN'))return source;
 for(const[start,end]of [['/* v3.36 STOCK EASY BEGIN','/* v3.36 STOCK EASY END */'],['/* v3.36 STOCK EASY STYLE BEGIN */','/* v3.36 STOCK EASY STYLE END */']]){
  assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
  let tail=source.indexOf(end)+end.length;if(source[tail]==='\\n')tail++;if(!start.includes('STYLE')&&source[tail]==='\\n')tail++;
  source=source.slice(0,source.indexOf(start))+source.slice(tail);
 }
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact easy Stock hook: '+from.slice(0,100));source=source.split(from).join(to);}return source;
}
module.exports={withoutStockEasy,hooks};
'''
(R/'tests/stock-easy-compat.js').write_text(compat)
print('Wrote',len(hooks),'explicit integration hooks;',len(s.encode()),'release bytes')
