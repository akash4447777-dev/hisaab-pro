/* v3.44 BULK PASTE UI BEGIN
   The dedicated incoming-only surface shares Smart Paste cancellation, consent,
   atomic writer, audited source identity, result report and saved-only PDF. */
function sbpDraftOptions(mode='smart',element){
  const options={mode,matches:{},fixes:{},separate:{},included:{}};
  if(mode==='bulk-in'){
    options.type='in';
    if(element)element.querySelectorAll('[data-sbp-common]').forEach(input=>{if(input.value)options[input.dataset.sapGlobal]=input.value;});
  }
  return options;
}
function sbpCommonHTML(){
  return '<section class="sbp-common" aria-label="Bulk incoming stock details"><div class="sap-item-head"><h4>＋ Multiple items · add received stock</h4><span>Maximum 50 items</span></div><p class="sap-help">List mein date / unit hai toh wahi use hoga. Missing ho toh common actual value ek baar bharein. Aaj ki date ya saved unit apne-aap assume nahi hogi. Bulk mode Stock In ka explicit choice hai; source mein Sale / Out ho toh woh hold hoga.</p><div class="sap-fields"><label class="stk-field"><span>Actual received date · only for missing dates</span><input class="inp" type="date" min="1900-01-01" max="9998-12-31" id="sbp_date" data-sap-global="date" data-sbp-common></label><label class="stk-field"><span>Common actual unit · only if missing</span><input class="inp" maxlength="18" placeholder="box / pcs / set / original custom unit" list="sbpUnitList" id="sbp_unit" data-sap-global="unit" data-sbp-common><datalist id="sbpUnitList">'+STU_UNITS.map(u=>'<option value="'+esc(u)+'"></option>').join('')+'</datalist></label></div><details class="sbp-optional"><summary>Supplier / actual bill reference (optional)</summary><div class="sap-fields"><label class="stk-field"><span>Supplier · optional</span><input class="inp" maxlength="90" id="sbp_supplier" data-sap-global="supplier" data-sbp-common></label><label class="stk-field"><span>Actual bill / delivery reference · optional</span><input class="inp" maxlength="80" id="sbp_reference" data-sap-global="reference" data-sbp-common></label></div></details><p class="sbp-example">Example: <code>Plastic scoreboard 3 boxes</code> or copied Excel rows in any clear column order. Sirf received quantity paste karein, total Available nahi.</p></section>';
}
function sbpRowHTML(b,fix){
  return '<details class="sbp-row-editor"'+(fix.row?' open':'')+'><summary>✎ Puri galat row yahin correct karein</summary><p class="sap-help">Sirf isi ek product ki corrected line / labelled details likhein. Original source retained rahega; saved rows dobara nahi judengi. Phir Process & save dabayein.</p><label class="stk-field"><span>Corrected row · product, quantity, unit; actual missing date / type</span><textarea class="inp" rows="3" maxlength="4000" data-sap-fix="'+b.index+'" data-key="row" spellcheck="false">'+esc(fix.row||'')+'</textarea></label></details>';
}
function sbpBatchHTML(b){
  if(!b.batchCandidates?.length)return '';
  return '<section class="sbp-batch" aria-label="Possible duplicate names in this paste"><b>Similar items in THIS paste</b><p class="sap-help">Ye names isi source mein hain. Agar same actual product hai toh uska exact name ek tap mein use karein. Different units / variants interchangeable nahi.</p>'+b.batchCandidates.map(c=>{const compatible=sapUnit(c.unit)===b.unit&&!sapVariant(ssxName(b.name),ssxName(c.name));return '<div><span><b>'+esc(c.name)+'</b><small>Source item '+(c.index+1)+' · '+esc(c.unit)+'</small></span>'+(compatible?'<button type="button" class="btn sm" data-sbp="same" data-block="'+b.index+'" data-source="'+c.index+'">Use this name & process</button>':'<small>Different unit / variant — correct actual name</small>')+'</div>';}).join('')+'</section>';
}
function sbpBalanceRows(e,rows){
  const inventory=new Map(stkInventory().map(p=>[p.id,p])),changes=new Map();
  for(const row of rows){
    if(!changes.has(row.productId)){const p=inventory.get(row.productId);changes.set(row.productId,{id:row.productId,name:p?.name||row.productName,unit:row.unit,before:e.before.get(row.productId)??0,inUnits:0,outUnits:0,after:p?.available??0});}
    const change=changes.get(row.productId),key=row.type==='in'?'inUnits':'outUnits';change[key]+=stkUnits(row.qty,false);
  }
  return [...changes.values()].map(({inUnits,outUnits,...c})=>({...c,inQty:inUnits/STK_SCALE,outQty:outUnits/STK_SCALE}));
}
function sbpBalanceHTML(e,rows){
  if(!rows.length)return '';
  return '<section class="sbp-balances" aria-label="Verified stock changes"><h4>Stock update · exact saved units</h4><p class="sap-help">Before + received − outgoing = Available now. Har product alag; mixed units ka galat grand total nahi. Available mein saari saved dates ki movements included hain.</p><div>'+sbpBalanceRows(e,rows).map(c=>'<article class="sbp-change" data-sbp-change="'+esc(c.id)+'"><b>'+esc(c.name)+'</b><div><span>Before <strong>'+stkFmt(c.before)+' '+esc(c.unit)+'</strong></span><span class="sbp-in">＋ Received <strong>'+stkFmt(c.inQty)+' '+esc(c.unit)+'</strong></span>'+(c.outQty?'<span>− Out / Sale <strong>'+stkFmt(c.outQty)+' '+esc(c.unit)+'</strong></span>':'')+'<span class="sbp-after">Available now <strong>'+stkFmt(c.after)+' '+esc(c.unit)+'</strong></span></div></article>').join('')+'</div></section>';
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-sbp]');if(!button||button.disabled)return;event.preventDefault();
  try{
    if(button.dataset.sbp==='open'){sbpOpen();return;}
    const e=sapEditor;if(!sapCurrent(e)||e.busy||!e.plan)return;stkCheck(e.context);
    if(button.dataset.sbp==='same'){
      const b=e.plan.blocks.find(b=>b.index===Number(button.dataset.block)),source=b?.batchCandidates?.find(c=>c.index===Number(button.dataset.source)),fix=e.options.fixes[b?.index]||{};
      if(!b||!source||b.status!=='unresolved'||(fix.name??b.name)!==b.name||sapUnit(fix.unit??b.unit)!==b.unit||sapUnit(source.unit)!==b.unit||sapVariant(ssxName(b.name),ssxName(source.name)))throw new Error('Current row / compatible source name badal gaya. Fresh process karein.');
      e.options.fixes[b.index]={...fix,name:source.name};delete e.options.matches[b.index];e.options.sameDay=false;e.options.separate[b.index]=false;e.serial++;sapRun();
    }
  }catch(error){sapStatus(error.message,true);}
});
/* v3.44 BULK PASTE UI END */
