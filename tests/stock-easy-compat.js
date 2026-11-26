/* Exact v3.36 presentation/member/PDF integration allowlist. Reverse to the
   immutable v3.35 in full before running all older source compatibility guards.
   No original archive, financial, cloud, report, font or ledger guard is waived. */
const assert=require('node:assert/strict');
const hooks=[
  [
    "const APP_VERSION = \"3.36\";",
    "const APP_VERSION = \"3.35\";",
    1
  ],
  [
    "      'v3.36 — <b style=\"color:var(--ink)\">Aasaan Stock + tagged log + PDF</b>: Message/photo se do-screen review, saare tagged naam alag dikhte aur save hote hain; ek tap se explicit Salesperson / Delivery / Receiver choice. Naam manually jod sakte hain. Available Stock, combined-filter History aur saved message ke logo-wale local PDF / file-share. Date/year, units, duplicates, opening checks aur atomic save guards unchanged.<br>'+\n      'v3.35 — <b style=\"color:var(--ink)\">Message / screenshot se Stock</b>",
    "      'v3.35 — <b style=\"color:var(--ink)\">Message / screenshot se Stock</b>",
    1
  ],
  [
    "function openModal(html, opts) {\n  stePdfCancel();\n  stmCancel();",
    "function openModal(html, opts) {\n  stmCancel();",
    1
  ],
  [
    "function closeModal() {\n  stePdfCancel();\n  stmCancel();",
    "function closeModal() {\n  stmCancel();",
    1
  ],
  [
    "<button class=\"btn primary\" data-stm=\"open\">＋ Message / screenshot</button><button class=\"btn\" data-ste-pdf=\"current\">↓ Stock PDF</button><button class=\"btn\" data-stki=\"open\">Import stock</button>",
    "<button class=\"btn primary\" data-stm=\"open\">Message / screenshot</button><button class=\"btn\" data-stki=\"open\">Import stock</button>",
    1
  ],
  [
    "    steReceiptHTML() + '<div class=\"stk-metrics\"><div class=\"card\"><span>Products</span>",
    "    '<div class=\"stk-metrics\"><div class=\"card\"><span>Products</span>",
    1
  ],
  [
    "(t.note ? '<div class=\"stk-note\">' + esc(t.note) + '</div>' : '') + steTagsHTML(t) + '</td><td>' + esc(t.salesperson || '—')",
    "(t.note ? '<div class=\"stk-note\">' + esc(t.note) + '</div>' : '') + '</td><td>' + esc(t.salesperson || '—')",
    1
  ],
  [
    "<div class=\"row-actions\"><button class=\"btn xs\" data-ste-pdf=\"message\" data-id=\"' + esc(t.id) + '\">PDF</button><button class=\"btn xs\" data-stk=\"entryEdit\" data-id=\"' + esc(t.id) + '\">Edit</button>",
    "<div class=\"row-actions\"><button class=\"btn xs\" data-stk=\"entryEdit\" data-id=\"' + esc(t.id) + '\">Edit</button>",
    1
  ],
  [
    "return text.replace(/[\\u200b-\\u200f\\u202a-\\u202e\\u2066-\\u2069\\ufeff]/g, '').replace(/\\r\\n?/g, '\\n').replace(/[०-९]/g, d => String('०१२३४५६७८९'.indexOf(d)))",
    "return text.replace(/\\r\\n?/g, '\\n').replace(/[०-९]/g, d => String('०१२३४५६७८९'.indexOf(d)))",
    1
  ],
  [
    "    let line = lines[i].replace(/^(?:Tagged members|Tagged|Tags|Tag|Cc)\\s*:\\s*(?=@)/i, '');\n    const item =",
    "    let line = lines[i];\n    const item =",
    1
  ],
  [
    "if (footer && result.tags.length && /^[\\p{L}\\p{M} @~.'()-]+$/u.test(line))",
    "if (footer && result.tags.length && /^[\\p{L} ~.'()-]+$/u.test(line))",
    1
  ],
  [
    "if (!/[\\p{L}\\p{N}]/u.test(line) && !line.startsWith('@')) { result.ignored.push(line); continue; }",
    "if (!/[\\p{L}\\p{N}]/u.test(line)) { result.ignored.push(line); continue; }",
    1
  ],
  [
    "['year','reference','type','supplier','salesperson','deliveryName','purpose','sameDay','matches','actions','members']",
    "['year','reference','type','supplier','salesperson','deliveryName','purpose','sameDay','matches','actions']",
    1
  ],
  [
    "  const parsed = stmParse(text, options.year), errors = [...parsed.errors], warnings = [...parsed.warnings];\n  const members = steCheckedMembers(parsed.tags, options.members);\n  if (parsed.tags.some(tag => tag.split('@').slice(1).some(part => !/[\\p{L}\\p{N}]/u.test(part)))) errors.push('Tagged person ka naam saaf nahi mila. Message mein har @ ke baad poora naam likhein.');\n  const addedMembers = members.filter(name => !steMemberNames(parsed.tags).some(original => stkKey(original) === stkKey(name)));",
    "  const parsed = stmParse(text, options.year), errors = [...parsed.errors], warnings = [...parsed.warnings];",
    1
  ],
  [
    "  const selected = options.matches || {}, actions = options.actions || {};\n  const importedRows = s.history.filter(h => stmMeta(h)?.b === batch);",
    "  const imported = s.history.some(h => stmMeta(h)?.b === batch), selected = options.matches || {}, actions = options.actions || {};",
    1
  ],
  [
    "  const plan = { parsed, batch, reference, members, blocks:[], rows:[], errors, warnings, valid:false, signature:'', added:0, skipped:0 };",
    "  const plan = { parsed, batch, reference, blocks:[], rows:[], errors, warnings, valid:false, signature:'', added:0, skipped:0 };",
    1
  ],
  [
    "      // Provenance belongs to a SAVED source row, not every row of the batch.\n      // Retrying a deliberately skipped row still needs all ordinary checks.\n      const exact = known.some(t => t.id === id) || importedRows.some(h => {\n        const meta = stmMeta(h), old = h.after;\n        return (meta.n === stmKey(block.name) || !meta.n && old.productId === product.id) && meta.u === block.unit && old.date === event.date && old.qty === event.qty && (old.type === 'in' ? 'in' : 'take') === event.direction;\n      });",
    "      const exact = imported || known.some(t => t.id === id);",
    1
  ],
  [
    "      const note = [parsed.header.raw, block.raw, ...parsed.tags, addedMembers.length ? 'Added tags: ' + addedMembers.map(name => '@' + name).join(' ') : '', parsed.phone ? 'Source message driver number ' + parsed.phone : '', reference ? 'Reference ' + reference : ''].filter(Boolean).join('\\n');",
    "      const note = [parsed.header.raw, block.raw, ...parsed.tags, parsed.phone ? 'Source message driver number ' + parsed.phone : '', reference ? 'Reference ' + reference : ''].filter(Boolean).join('\\n');",
    1
  ],
  [
    "deliveryDetails:[members.length ? 'Tagged members: ' + members.map(name => '@' + name).join(' ') : '', reference ? 'Message reference: ' + reference : ''].filter(Boolean).join('\\n'),",
    "deliveryDetails:reference ? 'Message reference: ' + reference : '',",
    1
  ],
  [
    "    matches:{ ...e.matches }, actions:{ ...e.actions }, members:[...(e.members || [])] };",
    "    matches:{ ...e.matches }, actions:{ ...e.actions } };",
    1
  ],
  [
    "!e.plan?.valid || !$('#stmReviewed')?.checked || !!$('#steMemberInput')?.value.trim();",
    "!e.plan?.valid || !$('#stmReviewed')?.checked;",
    1
  ],
  [
    "  if ($('#stmReviewed')) $('#stmReviewed').disabled = !!e?.busy || !e?.plan?.valid;\n  if ($('#stmPreviewButton')) $('#stmPreviewButton').disabled = !!e?.busy;",
    "  if ($('#stmPreviewButton')) $('#stmPreviewButton').disabled = !!e?.busy;",
    1
  ],
  [
    "  if (clear) { e.matches = {}; e.actions = {}; $('#stmPreview').innerHTML = ''; steRefreshPeople(e); }",
    "  if (clear) { e.matches = {}; e.actions = {}; $('#stmPreview').innerHTML = ''; }",
    1
  ],
  [
    "function stmOpen() { return steOpen(); }",
    "function stmOpen() {\n  stkCheck(stkContext());\n  openModal(`<div class=\"modal stk-dialog stm-dialog\" id=\"stmDialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"stmTitle\">\n    <div class=\"modal-h\"><div><h3 id=\"stmTitle\">Message / screenshot se Stock</h3><p>Text YA photo → complete preview → Confirm</p></div><button class=\"x\" type=\"button\" data-act=\"closeModal\" aria-label=\"Close message import\">✕</button></div>\n    <div class=\"modal-b\">\n      <div class=\"banner info\">Message yahin paste / upload karein; chat me bhejna zaroori nahi. <b>Preview se stock save nahi hota.</b> Phone / WhatsApp apne-aap read nahi hota.</div>\n      <p class=\"stm-account\"><b>Account:</b> ${esc(Cloud.user?.email || 'Is browser ka local data')}</p>\n      <h4 class=\"stm-step\">1 · Message ya screenshot</h4>\n      <div class=\"stm-controls\">\n        <label class=\"stk-field\"><span>Message year — khud confirm karein *</span><input id=\"stmYear\" class=\"inp\" type=\"number\" inputmode=\"numeric\" min=\"1900\" max=\"9998\" placeholder=\"YYYY\"><small>DD/MM me year diya nahi hota. Photo filename / today se guess nahi. Full DD/MM/YYYY ho to wahi year.</small></label>\n        <label class=\"stk-field\"><span>Message / delivery reference (optional)</span><input id=\"stmReference\" class=\"inp\" maxlength=\"80\" placeholder=\"Bill / delivery reference\"><small>Same date/qty ki alag real delivery ho to unique reference.</small></label>\n      </div>\n      <label class=\"stk-field\"><span>Ek poora numbered message paste karein *</span><textarea id=\"stmText\" class=\"inp stm-text\" rows=\"9\" maxlength=\"20000\" placeholder=\"23/11 Example party&#10;1- Example product&#10;Pichle bache box 12&#10;21/11 ko aaye +8&#10;Aaj gaye -3&#10;Available box 17&#10;@Salesperson @Delivery person\"></textarea></label>\n      <div class=\"stm-input-actions\"><button class=\"btn\" type=\"button\" data-stm=\"photo\">📷 Screenshot se text</button><input id=\"stmPhoto\" type=\"file\" accept=\"image/png,image/jpeg,image/webp\" hidden><button class=\"btn primary\" type=\"button\" id=\"stmPreviewButton\" data-stm=\"preview\">Entries taiyar / preview karo</button><button class=\"btn\" type=\"button\" id=\"stmStopOcr\" data-stm=\"stop\" hidden>OCR rok do</button></div>\n      <div id=\"stmOcrStatus\" class=\"stm-help\" role=\"status\">Text paste offline bhi chalega. Photo locally read hogi (PNG/JPG/WebP, max 5 MB); pehli OCR engine/model download ke liye internet chahiye. Koi image-upload / AI service nahi.</div>\n      <div id=\"stmImage\"></div>\n      <h4 class=\"stm-step\">2 · Entry details — ek baar per message</h4>\n      <div class=\"stm-controls\">\n        <label class=\"stk-field\"><span>Gaye = kya record karna hai? *</span><select id=\"stmType\" class=\"inp\"><option value=\"\">Sale / Stock Out choose karein</option><option value=\"sale\">Stock Sale — customer ko gaya</option><option value=\"out\">Stock Out — office transfer / other purpose</option></select><small>Office ko automatic sale nahi maana jata.</small></label>\n        <label class=\"stk-field\"><span>Out purpose (Stock Out me required)</span><input id=\"stmPurpose\" class=\"inp\" maxlength=\"250\" placeholder=\"e.g. Office transfer\"></label>\n        <label class=\"stk-field\"><span>Salesperson (Sale me required)</span><input id=\"stmSalesperson\" class=\"inp\" list=\"stmMembers\" maxlength=\"90\" placeholder=\"Tag se choose ya naam likhein\"></label>\n        <label class=\"stk-field\"><span>Delivery / office receiver name</span><input id=\"stmDelivery\" class=\"inp\" list=\"stmMembers\" maxlength=\"90\" placeholder=\"Sale me required; Out me optional\"></label>\n        <label class=\"stk-field\"><span>Stock In supplier (optional)</span><input id=\"stmSupplier\" class=\"inp\" maxlength=\"90\" placeholder=\"Na diya ho to blank; header party guess nahi\"></label>\n      </div><datalist id=\"stmMembers\"></datalist>\n      <p class=\"stm-help\">Tags sab source note me rahenge. Kaun salesperson / receiver hai, aap choose karein—multiple tags se role guess nahi hota. Confirmed product-name matches future messages ke liye yaad rehte hain.</p>\n      <label class=\"stm-check\"><input id=\"stmSameDay\" type=\"checkbox\"><span>Same-day opening ho to: yeh <b>opening snapshot ke BAAD</b> ki nayi movements hain; opening me pehle se included nahi.</span></label>\n      <h4 class=\"stm-step\">3 · Poora preview review karein</h4>\n      <p class=\"stm-help\">Sirf <b>aaye = In</b> aur <b>gaye = Sale / Out</b>. Pichhle bache / Available checks hain, nayi opening ya manual balance nahi. OCR me date, party ya quantity galat ho? <button type=\"button\" class=\"btn xs\" data-stm=\"edit\">Upar text sudharein</button> aur Preview dobara karein.</p>\n      <div id=\"stmPreview\" aria-live=\"polite\"></div>\n      <p id=\"stmError\" class=\"stk-error stm-errors\" role=\"alert\" tabindex=\"-1\"></p>\n      <label class=\"stm-check\"><input id=\"stmReviewed\" type=\"checkbox\"><span>Maine source text / OCR, <b>dates + year</b>, party, products/units, In / Sale / Out, tagged-member roles aur duplicate / opening checks review kiye. Sirf preview ki nayi entries save karni hain.</span></label>\n    </div>\n    <div class=\"modal-f\"><button class=\"btn\" type=\"button\" data-act=\"closeModal\">Abhi nahi</button><button class=\"btn primary\" type=\"button\" id=\"stmSave\" data-stm=\"save\" disabled>Confirm entries</button></div>\n  </div>`, { sticky:true });\n  stmEditor = { element:$('#stmDialog'), context:stkContext(), serial:0, busy:false, phase:'', matches:{}, actions:{}, plan:null, worker:null, reader:null };\n  $('#stmText').focus();\n}",
    1
  ],
  [
    "function stmRender(plan) { return steRender(plan); }",
    "function stmRender(plan) {\n  const p = plan.parsed, products = stkData().products;\n  const option = (id, name, selected) => '<option value=\"' + esc(id) + '\"' + (selected ? ' selected' : '') + '>' + esc(name) + '</option>';\n  const displayQty = value => value === null ? 'not given' : stkFmt(value);\n  $('#stmPreview').innerHTML = `<div class=\"stm-heading\"><b>${esc(p.header.date)} · ${esc(p.header.party)}</b><p>${plan.added} nayi movements · ${plan.skipped} skipped · ${plan.errors.length} issues</p><p>Driver phone: ${esc(p.phone || 'not given')} · Tags: ${esc(p.tags.join(' ') || 'not given')}</p></div>` +\n    (p.preamble.length || p.ignored.length ? '<details class=\"stm-source\"><summary>Quoted sender / photo / footer chrome (entry nahi)</summary><pre>' + esc(p.preamble.concat(p.ignored).join('\\n')) + '</pre></details>' : '') +\n    (plan.warnings.length ? '<div class=\"banner warn stm-warnings\">' + plan.warnings.map(esc).join('<br>') + '</div>' : '') +\n    plan.blocks.map(block => `<section class=\"stm-item\"><div class=\"stm-item-title\"><b>${esc(block.name)}</b><span>Previous ${displayQty(block.prior)} → Available ${displayQty(block.available)} ${esc(block.unit)}</span></div>\n      <label class=\"stk-field\"><span>Saved product / unit *</span><select class=\"inp\" data-stm-match=\"${block.index}\">${option('', 'Choose product', !block.productId)}${products.map(product => option(product.id, (block.match.suggestions?.includes(product.id) ? 'Suggested: ' : '') + product.name + ' · ' + product.unit, product.id === block.productId)).join('')}</select><small>${esc(block.match.kind)}</small></label>\n      <details class=\"stm-source\"><summary>Original item text</summary><pre>${esc(p.header.raw + '\\n' + block.raw)}</pre></details>\n      <div class=\"stm-rows\">${plan.rows.filter(row => row.block === block.index).map(row => `<div class=\"stm-row\" data-stm-row=\"${esc(row.index)}\"><div><b>${esc(row.date)} · ${row.direction === 'in' ? '+' : '−'}${stkFmt(row.qty)} ${esc(row.unit)}</b><span>${esc(row.direction === 'in' ? 'Stock In' : row.type === 'sale' ? 'Stock Sale' : row.type === 'out' ? 'Stock Out' : 'Outgoing type required')} · ${esc(row.party || 'supplier not given')}</span>${row.before ? '<span>Opening snapshot: ' + esc(row.cutover) + ' — isse pehle ka history yahan add nahi hoga.</span>' : ''}${row.similar && !row.exact ? '<span>Same product / date / quantity current ya edited/deleted audit history me hai. Alag real entry ho tabhi reference + New choose karein.</span>' : ''}</div>${row.exact ? '<span class=\"badge\">Already recorded / processed — skip</span>' : '<label><span>Action</span><select class=\"inp\" aria-label=\"Movement action ' + esc(row.index) + '\" data-stm-action=\"' + esc(row.index) + '\">' + (row.similar || row.before ? option('', 'Resolve before saving', !row.action) : '') + (!row.before ? option('new', row.similar ? 'Alag real movement — unique reference' : 'Nayi movement', row.action === 'new') : '') + option('skip', row.before ? 'Opening me already included — skip' : 'Already included / skip', row.action === 'skip') + '</select></label>'}</div>`).join('')}</div>\n      </section>`).join('');\n  stmError(plan.errors.length ? plan.errors.join('\\n') : !plan.added ? 'Sab movements pehle se recorded / processed / skipped hain. Stock dobara add / minus nahi hua. Correction ke liye Stock History dekhein.' : 'Ready. Review checkbox tick karke Confirm karein.');\n  $('#stmSave').textContent = plan.added ? 'Confirm ' + plan.added + ' entries' : 'Koi nayi entry nahi'; stmEnable();\n}",
    1
  ],
  [
    "    steRefreshPeople(e);",
    "    const tags = parsed.tags.join(' ').split('@').map(x => x.trim().replace(/^~/, '')).filter(Boolean);\n    const previous = stkData().transactions.flatMap(t => [t.salesperson, t.deliveryName]).filter(Boolean);\n    $('#stmMembers').innerHTML = [...new Set(tags.concat(previous))].slice(0, 150).map(name => '<option value=\"' + esc(name) + '\"></option>').join('');",
    1
  ],
  [
    "if (stmCurrent(e) && e.serial === serial) { $('#stmPreview').innerHTML = ''; stmError(error.message); if (/year|saal/.test(error.message)) { steStep(e, 1); $('#stmYear').focus(); } stmEnable(); }",
    "if (stmCurrent(e) && e.serial === serial) { $('#stmPreview').innerHTML = ''; stmError(error.message); stmEnable(); }",
    1
  ],
  [
    "    const receipt = { ids:e.plan.rows.filter(row => row.action === 'new').map(row => row.id), date:e.plan.parsed.header.date, party:e.plan.parsed.header.party };\n    closeModal(); Object.assign(stkUI(), { tab:'history', q:'', page:0, product:'all', party:'', salesperson:'', from:'', to:'', type:'all', order:'newest', lastMessage:receipt });",
    "    closeModal(); Object.assign(stkUI(), { tab:'history', q:'', page:0, product:'all', party:'', salesperson:'', from:'', to:'', type:'all', order:'newest' });",
    1
  ],
  [
    "    if (action === 'edit') { stmInvalidate(stmEditor, false); steStep(stmEditor, 1); $('#stmText').focus(); $('#stmText').scrollIntoView({ block:'center', behavior:'smooth' }); }",
    "    if (action === 'edit') { $('#stmText').focus(); $('#stmText').scrollIntoView({ block:'center', behavior:'smooth' }); }",
    1
  ],
  [
    "  if (target.id === 'steMemberInput') { stmEnable(); return; }\n  if (target.matches('input,textarea')) stmInvalidate(e, target.id === 'stmText');",
    "  if (target.matches('input,textarea')) stmInvalidate(e, target.id === 'stmText');",
    1
  ],
  [
    "  if (target.id === 'stmPhoto') { stmPhoto(target); return; }\n  if (target.id === 'steMemberInput') return;",
    "  if (target.id === 'stmPhoto') { stmPhoto(target); return; }",
    1
  ],
  [
    "    messageImport: { parse: stmParse, plan: stmPlan, apply: stmApply, open: stmOpen, members: steMemberNames },\n    taggedMembers: steTaggedMembers, report: steReport, pdfString: stePdfString, openPdf: stePdfOpen },",
    "    messageImport: { parse: stmParse, plan: stmPlan, apply: stmApply, open: stmOpen } },",
    1
  ]
];
function withoutStockEasy(source){
 if(!source.includes('/* v3.36 STOCK EASY BEGIN'))return source;
 for(const[start,end]of [['/* v3.36 STOCK EASY BEGIN','/* v3.36 STOCK EASY END */'],['/* v3.36 STOCK EASY STYLE BEGIN */','/* v3.36 STOCK EASY STYLE END */']]){
  assert.equal(source.split(start).length-1,1);assert.equal(source.split(end).length-1,1);
  let tail=source.indexOf(end)+end.length;if(source[tail]==='\n')tail++;if(!start.includes('STYLE')&&source[tail]==='\n')tail++;
  source=source.slice(0,source.indexOf(start))+source.slice(tail);
 }
 for(const[from,to,count]of hooks){assert.equal(source.split(from).length-1,count,'exact easy Stock hook: '+from.slice(0,100));source=source.split(from).join(to);}return source;
}
module.exports={withoutStockEasy,hooks};
