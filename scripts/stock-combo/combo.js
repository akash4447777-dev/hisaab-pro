/* v3.37 STOCK COMBO BEGIN
   One reviewed message / one party / one combo. Existing audited product-level
   movements remain the ONLY stock ledger. Grouping is derived, never migrated,
   guessed from a party/date, or persisted as a second available-stock counter. */
let stcEditor = null;
function stcCancel() { stcEditor = null; }
function stcIndex(s) {
  const candidates = new Map(), origins = new Map();
  s.history.forEach(h => {
    const meta = stmMeta(h); if (!meta) return;
    if (!candidates.has(h.entityId)) candidates.set(h.entityId, new Set());
    candidates.get(h.entityId).add(meta.b);
    const previous = origins.get(h.entityId);
    if (!previous || h.sequence < previous.sequence || h.sequence === previous.sequence && h.id < previous.id) origins.set(h.entityId, h);
  });
  // Conflicting source identities are not silently combined into either batch.
  const batches = new Map(); candidates.forEach((values,id) => { if (values.size === 1) batches.set(id,[...values][0]); });
  return {batches,origins};
}
function stcEntryCount() {
  const s=stkData(),index=stcIndex(s);
  return new Set(s.transactions.map(row=>index.batches.has(row.id)?'combo:'+index.batches.get(row.id):'entry:'+row.id)).size;
}
function stcUnique(rows, field) { return [...new Set(rows.map(row => row[field]).filter(Boolean))]; }
function stcDescribe(rows, batch, index) {
  const ordered = rows.slice().sort(stkSort), outgoing = ordered.filter(row => row.type !== 'in');
  const parties = stcUnique(outgoing,'party'), source = index.origins.get(ordered[0].id)?.after;
  const raw = String(source?.note || '').split('\n')[0], header = /^(\d{1,2}\/\d{1,2}(?:\/\d{4})?)\s+(.+)$/.exec(raw);
  const members = steMemberNames(ordered.flatMap(row => steTaggedMembers(row).map(name => '@'+name)));
  return {key:batch ? 'combo:'+batch : 'entry:'+ordered[0].id, batch:batch || '', isCombo:!!batch, entryId:ordered[0].id,
    rows:ordered, productCount:new Set(ordered.map(row=>row.productId)).size, members,
    party:parties.length === 1 ? parties[0] : parties.length > 1 ? 'Alag parties — items check karein' : header?.[2] || ordered[0].party || 'Party not given',
    mixedParty:parties.length>1, sourceHeader:header ? raw : '', from:ordered[0].date, to:ordered.at(-1).date,
    salespeople:stcUnique(outgoing,'salesperson'), delivery:stcUnique(outgoing,'deliveryName'), phones:stcUnique(outgoing,'deliveryPhone'), purposes:stcUnique(outgoing,'purpose')};
}
function stcGroups(filters = {}, data) {
  const d=data===undefined?Store.data:data,s=stkData(d);stkValidate(s);stkFilterValid(filters,s);
  const index=stcIndex(s),all=stkQuery({order:'oldest'},d),full=new Map();
  all.forEach(row=>{const batch=index.batches.get(row.id),key=batch?'combo:'+batch:'entry:'+row.id;if(!full.has(key))full.set(key,[]);full.get(key).push(row);});
  const groups=new Map();
  stkQuery(filters,d).forEach(row=>{
    const batch=index.batches.get(row.id),key=batch?'combo:'+batch:'entry:'+row.id;
    if(!groups.has(key))groups.set(key,{...stcDescribe(full.get(key),batch,index),matchedRows:[]});
    groups.get(key).matchedRows.push(row);
  });
  return syncClone([...groups.values()]);
}
function stcGet(entryId, data) {
  const d=data===undefined?Store.data:data,s=stkData(d);stkValidate(s);
  if(!s.transactions.some(row=>row.id===entryId))throw new Error('Yeh saved entry ab nahi hai. Current History dobara kholein.');
  const index=stcIndex(s),batch=index.batches.get(entryId),rows=stkQuery({order:'oldest'},d).filter(row=>batch?index.batches.get(row.id)===batch:row.id===entryId);
  return syncClone(stcDescribe(rows,batch,index));
}
function stcTagsHTML(members) { return members.length?'<div class="ste-saved-tags"><b>Tagged:</b> '+members.map(name=>'<span>'+esc(name)+'</span>').join(' ')+'</div>':''; }
function stcRolesHTML(group) {
  return [['Salesperson',group.salespeople],['Delivery / receiver',group.delivery],['Phone',group.phones],['Purpose',group.purposes]].filter(([,names])=>names.length).map(([label,names])=>'<div><b>'+label+':</b> '+names.map(esc).join(' · ')+'</div>').join('');
}
function stcItemHTML(row, group) {
  return '<div class="stc-item" data-stock-entry="'+esc(row.id)+'"><div><b>'+esc(row.currentProductName)+'</b>'+(row.currentProductName!==row.productName?'<small>At entry: '+esc(row.productName)+'</small>':'')+'<small>'+esc(ctPretty(row.date))+' · '+esc(row.source==='opening'?'Opening / In':STK_KINDS[row.type])+'</small>'+(row.type==='in'?'<small>Supplier: '+esc(row.party||'not given')+'</small>':group.mixedParty?'<small>Party: '+esc(row.party||'not given')+'</small>':'')+'</div><div class="stc-quantity"><strong>'+(row.type==='in'?'+':'−')+stkFmt(row.qty)+' '+esc(row.unit)+'</strong><small>Balance after: '+stkFmt(row.balance)+' '+esc(row.unit)+'</small></div><details class="stc-original"><summary>Source / item correction</summary><p>Sirf is item ki advanced correction; poore combo ke liye upar Edit combo use karein.</p><pre>'+esc(row.note||'No source note')+'</pre><div>'+esc(row.deliveryDetails||'')+'</div><div class="row-actions"><button class="btn xs" data-stk="entryEdit" data-id="'+esc(row.id)+'">Edit this item</button><button class="btn xs danger" data-stk="entryDelete" data-id="'+esc(row.id)+'">Delete this item…</button></div></details></div>';
}
function stcCardHTML(group) {
  const partial=group.matchedRows.length!==group.rows.length,rows=group.matchedRows.slice().sort(stkSort),names=stcUnique(rows,'currentProductName'),recent=stkUI().lastMessage?.ids?.some(id=>group.rows.some(row=>row.id===id));
  if(!group.isCombo){const row=rows[0];return '<article class="card stc-single" data-stock-entry="'+esc(row.id)+'"><div class="stc-top"><div><span class="badge">Individual entry</span><h4>'+esc(row.currentProductName)+'</h4><p>'+esc(ctPretty(row.date))+' · '+esc(row.source==='opening'?'Opening / In':STK_KINDS[row.type])+' · '+esc(row.party||'Party not given')+'</p><strong>'+(row.type==='in'?'+':'−')+stkFmt(row.qty)+' '+esc(row.unit)+'</strong><small>Balance after: '+stkFmt(row.balance)+' '+esc(row.unit)+'</small></div><div class="row-actions"><button class="btn sm" data-ste-pdf="message" data-id="'+esc(row.id)+'">PDF</button><button class="btn sm" data-stk="entryEdit" data-id="'+esc(row.id)+'">Edit</button><button class="btn sm danger" data-stk="entryDelete" data-id="'+esc(row.id)+'">Delete…</button></div></div><div class="stc-common">'+stcRolesHTML(group)+stcTagsHTML(group.members)+'</div><details class="stc-original"><summary>Note / delivery details</summary><pre>'+esc([row.purpose,row.deliveryDetails,row.note].filter(Boolean).join('\n'))+'</pre></details></article>';}
  return '<article class="card stc-combo" data-stock-combo="'+esc(group.batch)+'"><div class="stc-top"><div><span class="badge green">1 combo entry</span><h4>'+esc(group.party)+'</h4><p>'+esc(group.from===group.to?ctPretty(group.to):ctPretty(group.from)+' → '+ctPretty(group.to))+' · '+group.productCount+' products · '+group.rows.length+' stock movements</p>'+(group.sourceHeader?'<small>Original message: '+esc(group.sourceHeader)+'</small>':'')+'</div><div class="row-actions"><button class="btn primary sm" data-ste-pdf="message" data-id="'+esc(group.entryId)+'">↓ Combo PDF</button><button class="btn sm" data-stc="edit" data-id="'+esc(group.entryId)+'">Edit combo</button><button class="btn sm danger" data-stc="delete" data-id="'+esc(group.entryId)+'">Delete combo…</button></div></div><div class="stc-common">'+stcRolesHTML(group)+stcTagsHTML(group.members)+'</div>'+(group.mixedParty?'<p class="banner warn">Saved items ki parties alag hain. Automatic merge/overwrite nahi hua. Edit combo mein actual common party explicitly choose karein.</p>':'')+(partial?'<p class="stc-filter-note" role="status">Filters: '+rows.length+' / '+group.rows.length+' movements match. Neeche sirf matching items; <b>Combo PDF / Edit / Delete poore '+group.rows.length+' movements</b> par hain. Filtered History PDF mein sirf matches aayenge.</p>':'')+'<details class="stc-items"'+(recent||partial?' open':'')+'><summary>'+names.length+' products / items dekho <span>'+rows.length+' stock movements · '+names.slice(0,3).map(esc).join(' · ')+(names.length>3?' · …':'')+'</span></summary><div>'+rows.map(row=>stcItemHTML(row,group)).join('')+'</div></details></article>';
}
function stkMovementHTML() {
  const u=stkUI(),groups=stcGroups(u);
  if(!groups.some(group=>group.isCombo))return stcLegacyHistoryHTML();
  const page=stkPageRows(groups),count=groups.reduce((n,group)=>n+group.matchedRows.length,0);
  return '<div class="stc-history"><div class="card-h"><div><h3>Stock History <span class="muted">('+groups.length+' combo / individual entries)</span></h3><div class="sub">Ek message = ek party ka ek combo · '+count+' matching product movements · original units aur dates retained</div></div><select class="inp stk-select" id="stkOrder" aria-label="History order"><option value="newest"'+(u.order==='newest'?' selected':'')+'>Newest date first</option><option value="oldest"'+(u.order==='oldest'?' selected':'')+'>Oldest date first</option></select></div>'+page.map(stcCardHTML).join('')+stkPager(groups.length,u.page)+'</div>';
}
function stcEdit(entryId, changes, context) {
  stkCheck(context||stkContext());stkObject(changes,['party','salesperson','deliveryName','deliveryPhone','purpose','members','rows'],'combo edit');
  const group=stcGet(entryId);if(!group.isCombo)throw new Error('Yeh message combo nahi hai. Individual Edit use karein.');
  const patch={};
  [['party',90],['salesperson',90],['deliveryName',90],['deliveryPhone',35],['purpose',250]].forEach(([key,max])=>{if(Object.hasOwn(changes,key))patch[key]=stkText(changes[key],max,false,key);});
  const members=changes.members===undefined?null:steCheckedMembers(group.members.map(name=>'@'+name),changes.members);
  const rowChanges=new Map();
  if(changes.rows!==undefined){
    if(!Array.isArray(changes.rows)||changes.rows.length!==group.rows.length||Object.keys(changes.rows).length!==changes.rows.length)throw new Error('Poore combo ke saare current items review karein; partial save nahi hoga.');
    changes.rows.forEach(row=>{stkObject(row,['id','qty','date'],'combo item');if(!group.rows.some(old=>old.id===row.id)||rowChanges.has(row.id)||!Object.hasOwn(row,'qty')||!Object.hasOwn(row,'date'))throw new Error('Combo item missing / duplicate / changed. Fresh combo kholein.');rowChanges.set(row.id,row);});
  }
  const nextRows=group.rows.map(row=>{
    const old=stkData().transactions.find(t=>t.id===row.id),change=rowChanges.get(row.id),input={...old,qty:change?change.qty:old.qty,date:change?change.date:old.date};
    if(old.type!=='in')Object.assign(input,patch);
    const savedMembers=steTaggedMembers(old).map(stkKey).sort();
    // Project old note-only tags without rewriting them on an unchanged Edit.
    if(members&&syncStable(savedMembers)!==syncStable(members.map(stkKey).sort()))input.deliveryDetails=[...String(old.deliveryDetails||'').split('\n').filter(line=>!/^Tagged members:\s*/i.test(line)),members.length?'Tagged members: '+members.map(name=>'@'+name).join(' '):''].filter(Boolean).join('\n');
    const next=stkMakeMovement(input,stkData());
    return {old,next,changed:syncStable({...old,updatedAt:0})!==syncStable({...next,updatedAt:0})};
  });
  if(new Set(nextRows.filter(({next})=>next.type!=='in').map(({next})=>next.party)).size>1)throw new Error('Ek combo ki ek hi party chahiye. Common party explicitly likhein.');
  const changed=nextRows.filter(row=>row.changed);if(!changed.length)return {changed:0};
  return stkAtomic(s=>{
    changed.forEach(({old,next})=>{s.transactions[s.transactions.findIndex(row=>row.id===old.id)]=next;stkAudit(s,'transaction',old,next,'edit','Combo edit '+group.batch+'; complete dated ledger rechecked');});
    return {changed:changed.length};
  },context,true);
}
function stcDelete(entryId,context) {
  stkCheck(context||stkContext());const group=stcGet(entryId);if(!group.isCombo)throw new Error('Yeh message combo nahi hai. Individual Delete use karein.');
  return stkAtomic(s=>{const ids=new Set(group.rows.map(row=>row.id));s.transactions=s.transactions.filter(row=>!ids.has(row.id));group.rows.forEach(row=>{const original=stkData().transactions.find(old=>old.id===row.id);stkAudit(s,'transaction',original,null,'delete','Whole combo deleted '+group.batch+'; stock recomputed');});return {deleted:ids.size};},context,true);
}
function stcCurrent(e) { return !!e && stcEditor===e && $('#stcDialog')===e.element; }
function stcMembers(e) {
  if(!stcCurrent(e))return;
  $('#stcMembers').innerHTML=stcTagsHTML(e.group.members.concat(e.members))+(e.members.length?'<p class="stk-note">Naye added names: '+e.members.map((name,i)=>esc(name)+' <button type="button" class="btn xs" data-stc="removeName" data-index="'+i+'" aria-label="Remove added name '+esc(name)+'">✕</button>').join(' · ')+'</p>':'');
}
function stcInvalidate(e) { if(stcCurrent(e)){$('#stcReviewed').checked=false;$('#stcCommit').disabled=true;} }
function stcOpen(entryId, mode='edit') {
  stkCheck(stkViewContext||stkContext());const group=stcGet(entryId);if(!group.isCombo)throw new Error('Current message combo chunein.');
  const remove=mode==='delete',outgoing=group.rows.filter(row=>row.type!=='in'),hasSale=outgoing.some(row=>row.type==='sale'),hasOut=outgoing.some(row=>row.type==='out');
  const common=key=>{const values=[...new Set(outgoing.map(row=>row[key]))];return values.length===1?values[0]:'';};
  const input=(key,label,max,required=false)=>stkField(label,'<input class="inp" id="stc_'+key+'" maxlength="'+max+'"'+(required?' required':'')+' value="'+esc(common(key))+'" placeholder="'+(outgoing.length&&new Set(outgoing.map(row=>row[key])).size>1?'Alag saved values — actual common value likhein':'')+'">');
  openModal('<div class="modal stk-dialog stc-dialog" id="stcDialog" role="dialog" aria-modal="true" aria-labelledby="stcTitle"><form id="stcForm"><div class="modal-h"><div><h3 id="stcTitle">'+(remove?'Poora combo delete karein?':'Ek party · Edit combo')+'</h3><p>'+esc(group.party)+' · '+group.productCount+' products / '+group.rows.length+' movements</p></div><button class="x" type="button" data-act="closeModal" aria-label="Close combo">✕</button></div><div class="modal-b"><p class="banner '+(remove?'warn':'info')+'">'+(remove?'Neeche ke SAARE items aur dated In / Out / Sales remove honge, chahe History filters kuch hi items dikhate hon. Products/openings/baaki combos nahi hatenge. Audit aur pre-change safety copy retained.':'Ek baar common details, neeche har item ki quantity/date. Saare changes ek saath save honge. Original source note/history retained; old Available se stock overwrite nahi hoga.')+'</p>'+(!remove&&outgoing.length?'<div class="stk-form-grid">'+input('party','Combo ki ek party'+(hasSale?' *':''),90,hasSale)+input('salesperson','Salesperson'+(hasSale?' *':''),90,hasSale)+input('deliveryName','Delivery / receiver'+(hasSale?' *':''),90,hasSale)+input('deliveryPhone','Driver / delivery phone',35)+(hasOut?input('purpose','Stock Out purpose *',250,true):'')+'</div><p class="stk-note">Common party / roles sirf outgoing items par. Alag dated In ka actual supplier aur receipt details unchanged rahenge. Alag saved values wala optional field bina edit kiye blank chhodne par purani values retained hain.</p>':'')+(!remove?'<section class="stc-edit-members"><h4>Saare tagged log</h4><div id="stcMembers"></div><div class="ste-add-person"><input class="inp" id="stcName" maxlength="92" placeholder="Chhoota naam jodo" aria-label="Add combo tagged person"><button type="button" class="btn sm" data-stc="addName">＋ Naam jodo</button></div></section>':'')+'<div class="stc-edit-items">'+group.rows.map(row=>'<section class="stc-edit-item" data-stc-item="'+esc(row.id)+'"><div><b>'+esc(row.currentProductName)+'</b><small>'+esc(STK_KINDS[row.type])+' · original unit '+esc(row.unit)+(row.type==='in'?' · supplier '+esc(row.party||'not given'):'')+'</small></div>'+(remove?'<div><b>'+(row.type==='in'?'+':'−')+stkFmt(row.qty)+' '+esc(row.unit)+'</b> · '+esc(ctPretty(row.date))+'</div>':stkField('Quantity · '+row.unit,'<input class="inp" data-stc-field="qty" required inputmode="decimal" maxlength="13" value="'+esc(row.qty)+'">')+stkField('Actual date','<input class="inp" data-stc-field="date" required type="date" min="1900-01-01" max="9998-12-31" value="'+esc(row.date)+'">'))+'</section>').join('')+'</div><label class="stm-check ste-consent"><input id="stcReviewed" type="checkbox"><span>'+ (remove?'Maine poore combo ke saare items dekhe hain. Isi poore combo ko delete karo.':'Maine common party, saare items/units, actual dates aur tags check kiye hain. Poora combo ek saath save karo.')+'</span></label><p id="stcError" class="stk-error" role="alert" tabindex="-1"></p></div><div class="modal-f"><button class="btn" type="button" data-act="closeModal">Cancel</button><button class="btn '+(remove?'danger':'primary')+'" type="submit" id="stcCommit" disabled>'+(remove?'Haan, poora combo delete karo':'Poora combo save karo')+'</button></div></form></div>',{sticky:true});
  stcEditor={element:$('#stcDialog'),context:stkContext(),group,mode,members:[],fields:new Set()};if(!remove)stcMembers(stcEditor);
}
function stcSubmit() {
  const e=stcEditor;if(!stcCurrent(e)||!$('#stcReviewed').checked||$('#stcName')?.value.trim())return;
  try {
    stkCheck(e.context);let result;
    if(e.mode==='delete')result=stcDelete(e.group.entryId,e.context);
    else{
      const changes={members:e.members,rows:$$('[data-stc-item]',e.element).map(el=>({id:el.dataset.stcItem,qty:$('[data-stc-field="qty"]',el).value,date:$('[data-stc-field="date"]',el).value}))};
      ['party','salesperson','deliveryName','deliveryPhone','purpose'].forEach(key=>{if(e.fields.has(key)&&$('#stc_'+key))changes[key]=$('#stc_'+key).value;});
      result=stcEdit(e.group.entryId,changes,e.context);
    }
    closeModal();render();toast(e.mode==='delete'?'Poora combo deleted · audit retained':result.changed?'1 combo updated · stock recalculated':'Koi change nahi · combo unchanged','ok');
  } catch(error){if(stcCurrent(e)){stcInvalidate(e);$('#stcError').textContent=error.message;$('#stcError').focus();}}
}
function steReport(options={},data) {
  const report=stcLegacyReport(options,data);
  if(report.kind==='history')report.labels=report.labels.map(label=>label.replace('All matching entries','All matching stock movements'));
  if(report.kind==='message'){
    const group=stcGet(options.entryId,data);
    if(!group.isCombo && stcIndex(stkData(data===undefined?Store.data:data)).origins.has(options.entryId))throw new Error('Is entry ki source identity conflicting hai. Audit / JSON backup compare karein; combo PDF nahi banayi.');
    if(group.isCombo){report.combo=group;report.title='Stock Combo';report.rows=group.rows.map(row=>({...row,members:steTaggedMembers(row)}));report.labels=['1 combo · '+group.productCount+' products · '+group.rows.length+' saved stock movements. Sirf is combo ki abhi saved rows; skipped / deleted nahi. Screen filters apply nahi.'];}
  }
  return report;
}
function stcPdfBody(report, ctx) {
  const group=report.combo,{paragraph,tableHeader,tableRow,space,advance}=ctx;
  paragraph('Party / message context: '+group.party,{size:11,bold:true});
  if(group.sourceHeader)paragraph('Original message: '+group.sourceHeader,{size:8});
  [['Salesperson',group.salespeople],['Delivery / receiver',group.delivery],['Driver / delivery phone',group.phones],['Purpose',group.purposes]].forEach(([label,values])=>{if(values.length)paragraph(label+': '+values.join(' · '));});
  if(group.members.length)paragraph('Tagged members: '+group.members.map(name=>'@'+name).join(' · '),{bold:true});
  if(group.mixedParty)paragraph('Saved parties differ — actual row parties are listed below. No automatic overwrite.',{bold:true});
  paragraph('ONE COMBO · Saare products neeche. Har product ki apni unit / original movement date; In supplier alag rahega. No mixed-unit total.',{size:8});
  const cols=[{label:'Date',w:65},{label:'Product',w:145},{label:'Type',w:65},{label:'Qty / unit',w:80},{label:'Balance / unit',w:80},{label:group.mixedParty?'Party / supplier':'In supplier',w:80.28}];
  tableHeader(cols);
  // The outgoing party is shared above, not repeated as fifty separate entries.
  // Distinct receipt suppliers and genuinely conflicting old parties stay literal.
  report.rows.forEach(row=>tableRow(cols,[row.date,row.currentProductName+(row.currentProductName!==row.productName?' (at entry: '+row.productName+')':''),STK_KINDS[row.type],(row.type==='in'?'+':'−')+stkFmt(row.qty)+' '+row.unit,stkFmt(row.balance)+' '+row.unit,group.mixedParty||row.type==='in'?row.party||'not given':'—']));
  advance(12);space(110);paragraph('Source / note: original message items',{bold:true});
  const notes=new Set();
  report.rows.forEach(row=>{
    // Full original notes remain, but a receipt/outgoing pair with the same source
    // block is not printed twice. Never omit differing corrections/details.
    if(row.note&&!notes.has(row.note)){notes.add(row.note);paragraph(row.note,{size:8});}
    const details=String(row.deliveryDetails||'').split('\n').filter(value=>!/^Tagged members:/i.test(value)).join('\n');
    if(details&&!notes.has(details)){notes.add(details);paragraph('Delivery details: '+details,{size:8});}
    paragraph('Saved item · '+row.id,{size:7});
  });
}
function stcReview(plan) {
  const products=plan.blocks.length;
  $('#stmTitle').textContent='Ek party · 1 combo check karo';
  $('#steMessageSummary').innerHTML='<b>1 combo · '+esc(ctPretty(plan.parsed.header.date))+' · '+esc(plan.parsed.header.party)+'</b><span>'+products+' products · '+plan.added+' nayi stock movements · '+plan.skipped+' already included / skipped</span><small>Saare products ek hi entry ke andar save honge. Har item ki apni unit aur actual movement date rahegi.</small><button type="button" class="btn xs" data-ste="back">Message / date badlo</button>';
  $('#stmSave').textContent=plan.added?'Haan, 1 combo save karo':'Koi naya combo nahi';
}
function steReceiptHTML() {
  const receipt=stkUI().lastMessage,anchor=receipt?.ids?.find(id=>stkData().transactions.some(row=>row.id===id));if(!anchor)return '';
  const group=stcGet(anchor);
  return '<div class="ste-receipt card" role="status"><div><b>✓ 1 combo entry save ho gayi</b><p>'+esc(receipt.party)+' · '+group.productCount+' products / '+group.rows.length+' stock movements · saare tagged log saath</p></div><div class="row-actions"><button class="btn" data-ste-pdf="message" data-id="'+esc(anchor)+'">↓ Is combo ka PDF</button><button class="btn primary" data-ste="newMessage">＋ Agla combo</button><button class="btn sm" data-ste="dismissReceipt" aria-label="Dismiss saved combo">✕</button></div></div>';
}
function stcPdfCount(report) {
  return report.combo?'1 combo · '+report.combo.productCount+' products · '+report.rows.length+' stock movements':report.rows.length+' '+(report.kind==='stock'?'products':report.kind==='history'?'stock movements':'saved entries');
}
function stcPdfSummary(report,kind) {
  return '<b>'+stcPdfCount(report)+'</b><p>'+report.labels.map(esc).join('<br>')+'</p><p>'+(kind==='stock'?'Har product ki original unit + live available quantity.':report.combo?'Ek party ka poora combo: saare products, tags, roles aur original dates.':'Har stock movement ki quantity, balance, party, tagged log, roles aur source note.')+'</p>';
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-stc]');if(!button||button.disabled)return;event.preventDefault();
  try{
    const action=button.dataset.stc;
    if(action==='edit'||action==='delete'){stcOpen(button.dataset.id,action);return;}
    const e=stcEditor;if(!stcCurrent(e)||e.mode==='delete')return;
    if(action==='addName'){
      const name=$('#stcName').value.trim(),all=steCheckedMembers(e.group.members.map(value=>'@'+value),e.members.concat(name));
      e.members=all.filter(value=>!e.group.members.some(old=>stkKey(old)===stkKey(value)));$('#stcName').value='';stcInvalidate(e);stcMembers(e);
    }
    if(action==='removeName'){e.members.splice(Number(button.dataset.index),1);stcInvalidate(e);stcMembers(e);}
  }catch(error){if($('#stcError'))$('#stcError').textContent=error.message;else toast(error.message,'bad');}
});
document.addEventListener('submit',event=>{if(event.target.id==='stcForm'){event.preventDefault();stcSubmit();}});
function stcFieldChanged(e,target) {
  if(!stcCurrent(e))return;
  if(target.id.startsWith('stc_'))e.fields.add(target.id.slice(4));
  stcInvalidate(e);
}
document.addEventListener('input',event=>{if(event.target.id!=='stcReviewed'&&event.target.closest('#stcDialog'))stcFieldChanged(stcEditor,event.target);});
document.addEventListener('change',event=>{
  const e=stcEditor;if(!stcCurrent(e)||!event.target.closest('#stcDialog'))return;
  if(event.target.id==='stcReviewed')$('#stcCommit').disabled=!event.target.checked||!!$('#stcName')?.value.trim();else stcFieldChanged(e,event.target);
});
document.addEventListener('keydown',event=>{if(event.target.id==='stcName'&&event.key==='Enter'){event.preventDefault();$('[data-stc="addName"]')?.click();}});
/* v3.37 STOCK COMBO END */
