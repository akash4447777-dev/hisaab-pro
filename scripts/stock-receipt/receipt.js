/* v3.40 REVIEWED STOCK IN LINK BEGIN
   A typed incoming list, NOT an opening snapshot. Private fragment data is local
   input only. Delegate matching, cutoffs, semantic IDs and ledger validation to
   the existing message planner; create any explicitly previewed new products and
   all reviewed In movements in ONE ordinary guarded Stock transaction. */
let sirEditor = null;
function sirCancel() { if (sirEditor) sirEditor.serial++; sirEditor = null; }
function sirConsumeHash(openingPrefix) {
  // Called before bootstrap; use literals, not a later-initialized const.
  const incoming = location.hash.startsWith('#stock-in=');
  if (!incoming && !location.hash.startsWith(openingPrefix)) return null;
  const token = location.hash.slice(incoming ? '#stock-in='.length : openingPrefix.length);
  const clean = new URL(location.href); clean.hash = '';
  history.replaceState(history.state, '', clean.href);
  return (incoming ? 'in.' : '') + token;
}
function sirParse(text) {
  if (typeof text !== 'string' || new Blob([text]).size > STKI_MAX_BYTES) throw new Error('Stock In link maximum 5 MB data rakh sakta hai.');
  let data; try { data = JSON.parse(text); } catch (error) { throw new Error('Valid Stock In list link chahiye.'); }
  stkObject(data, ['format','version','date','supplier','reference','source','rows'], 'Stock In list');
  if (data.format !== 'hisaab-stock-in' || data.version !== 1 || !stkDate(data.date)) throw new Error('Stock In format / explicit YYYY-MM-DD date valid nahi hai. Opening / backup yahan allowed nahi.');
  if (!Array.isArray(data.rows) || !data.rows.length || data.rows.length > 50 || Object.keys(data.rows).length !== data.rows.length) throw new Error('Stock In list me 1–50 complete items chahiye.');
  const names = new Set();
  const rows = Array.from(data.rows, (row, index) => {
    stkObject(row, ['name','quantity','unit'], 'Stock In item ' + (index + 1));
    const name = stkName(row.name), unit = stkName(row.unit);
    stkText(name, 90, true, 'Product name'); stkText(unit, 18, true, 'Unit');
    if (names.has(stkKey(name))) throw new Error('Stock In list me repeated product: ' + name);
    names.add(stkKey(name));
    return {name, unit, quantity:stkQty(row.quantity, false)};
  });
  return {format:'hisaab-stock-in',version:1,date:data.date,
    supplier:stkText(data.supplier,90,false,'Actual supplier'), reference:stkText(data.reference,80,false,'Actual delivery reference'),
    source:stkText(data.source,20000,false,'Original list'), rows};
}
function sirText(packet) {
  const [year,month,day] = packet.date.split('-');
  // A transparent unknown-supplier context, not a fabricated customer/person.
  return day + '/' + month + '/' + year + ' ' + (packet.supplier || 'Supplier not given') + '\n' +
    packet.rows.map((row,i) => (i+1) + '- ' + row.name + '\nAaye +' + row.quantity + ' ' + row.unit).join('\n');
}
function sirChoices(options, count) {
  stkObject(options, ['matches','actions','sameDay','reference'], 'Stock In choices');
  if (options.sameDay !== undefined && typeof options.sameDay !== 'boolean') throw new Error('Opening confirmation boolean honi chahiye.');
  const result = {matches:{},actions:{},sameDay:options.sameDay === true};
  for (const field of ['matches','actions']) {
    const map = options[field] === undefined ? {} : options[field]; stkObject(map, Array.from({length:count},(_,i)=>String(i)), 'Stock In ' + field);
    Object.entries(map).forEach(([key,value]) => {
      if (typeof value !== 'string' || field === 'actions' && !['','new','skip'].includes(value)) throw new Error('Stock In choice valid nahi hai.');
      result[field][key] = value;
    });
  }
  if (options.reference !== undefined) result.reference = stkText(options.reference,80,false,'Actual delivery reference');
  return result;
}
async function sirPlan(input, options = {}, data) {
  const packet = sirParse(JSON.stringify(input)), choices = sirChoices(options,packet.rows.length);
  const stock = syncClone(data === undefined ? stkData() : data); stkValidate(stock);
  const next = syncClone(stock), selected = {}, newProducts = [], details = [], issues = [];
  for (let i=0;i<packet.rows.length;i++) {
    const row=packet.rows[i], unit=stmUnit(row.unit), match=stmMatch({name:row.name,unit},stock);
    const suggested=match.suggestions?.length || match.candidates?.length || match.kind.startsWith('Conflicting');
    const choice=Object.hasOwn(choices.matches,i) ? choices.matches[i] : match.id || (suggested ? '' : '__new__');
    let product=stock.products.find(p=>p.id===choice);
    if (choice === '__new__') {
      if (stock.products.some(p=>stkKey(p.name)===stkKey(row.name))) issues.push(row.name + ': isi naam ka product hai; naya duplicate / doosri unit nahi banegi. Sahi saved product choose karein.');
      else {
        const id='sinp1_'+await stmHash(JSON.stringify([stkKey(row.name),unit]));
        if (next.products.some(p=>p.id===id)) issues.push(row.name+': product identity conflict. Current inventory review karein.');
        else {
          product={id,name:row.name,unit,date:packet.date,minQty:0,photoId:'',note:'Created from reviewed Stock In list; no opening movement',createdAt:Date.now(),updatedAt:Date.now()};
          next.products.push(product); newProducts.push(product);
        }
      }
    } else if (choice && !product) issues.push(row.name+': selected product ab nahi hai. Fresh preview karein.');
    selected[i]=product?.id || '';
    details.push({index:i,source:row,match,choice,productId:product?.id || '',newProduct:!!product&&newProducts.some(p=>p.id===product.id)});
  }
  const actions=Object.fromEntries(Object.entries(choices.actions).map(([index,action])=>[index+':0',action]));
  const reference=choices.reference === undefined ? packet.reference : choices.reference;
  // Newly previewed products have no previous opening. Existing products still
  // require the exact same same-day attestation below; pre-opening is NEVER bypassed.
  const plan=await stmPlan(sirText(packet),{year:packet.date.slice(0,4),supplier:packet.supplier,reference,matches:selected,actions,sameDay:true},next);
  const sameDay=plan.rows.filter(row=>stock.products.some(p=>p.id===row.productId)&&row.action==='new'&&!row.before&&row.date===row.cutover);
  if (sameDay.length&&!choices.sameDay) issues.push('Opening isi din ki hai: sirf snapshot ke BAAD ka naya aaya stock confirm karein. Opening me already included ho toh Skip.');
  plan.errors=[...new Set(plan.errors.concat(issues))]; plan.valid=!plan.errors.length&&plan.added>0;
  const used=new Set(plan.rows.filter(row=>row.action==='new').map(row=>row.productId));
  plan.newProducts=newProducts.filter(p=>used.has(p.id)); plan.details=details; plan.packet=packet; plan.sameDay=sameDay.length>0;
  plan.signature=await stmHash(JSON.stringify([packet,choices,plan.signature,plan.errors,plan.newProducts.map(p=>[p.id,p.name,p.unit,p.date])]));
  return plan;
}
async function sirApply(packet, choices, context, signature, consent) {
  stkCheck(context); const plan=await sirPlan(packet,choices); stkCheck(context);
  if (consent&&!consent()) throw new Error('Stock In review cancel / badal gaya; kuch save nahi hua.');
  if (!signature||signature!==plan.signature) throw new Error('Fresh Stock In preview aur confirmation chahiye.');
  if (plan.errors.length) throw new Error(plan.errors.join('\n'));
  if (!plan.added) return {imported:0,products:0,skipped:plan.skipped};
  return stkAtomic(stock=>{
    plan.newProducts.forEach(product=>{
      stock.products.push(product); stkAudit(stock,'product',null,product,'create','Reviewed Stock In list: new product, no opening movement');
    });
    plan.rows.filter(row=>row.action==='new').sort(stmRowOrder).forEach(row=>{
      if (stock.transactions.some(t=>t.id===row.id)) throw new Error('Stock In already saved. Fresh review karein.');
      const movement=stkMakeMovement(row.input,stock); movement.id=row.id; stock.transactions.push(movement);
      stkAudit(stock,'transaction',null,movement,'create',row.reason);
    });
    return {imported:plan.added,products:plan.newProducts.length,skipped:plan.skipped};
  },context,true);
}
function sirCurrent(e) { return !!e&&sirEditor===e&&$('#sirDialog')===e.element; }
function sirOptions(e) { return {matches:{...e.matches},actions:{...e.actions},sameDay:!!$('#sirSameDay')?.checked,reference:$('#sirReference')?.value || ''}; }
function sirError(message) { const box=$('#sirError'); if(box)box.textContent=message||''; }
async function sirRefresh(e) {
  if (!sirCurrent(e)) return;
  const serial=++e.serial; e.plan=null; $('#sirSave').disabled=true; sirError('Stock In preview taiyar ho raha hai…');
  try {
    stkCheck(e.context); const plan=await sirPlan(e.packet,sirOptions(e));
    if(!sirCurrent(e)||serial!==e.serial)return; stkCheck(e.context); e.plan=plan;
    const inventory=stkInventory(), products=stkData().products;
    $('#sirCounts').textContent='1 combo · '+e.packet.rows.length+' products · '+plan.added+' Stock In · '+plan.skipped+' skipped · '+plan.newProducts.length+' naye products';
    $('#sirItems').innerHTML=plan.details.map(detail=>{
      const row=detail.source, movement=plan.rows.find(r=>r.block===detail.index), product=products.find(p=>p.id===detail.productId), current=inventory.find(p=>p.id===detail.productId)?.available || 0;
      const kind=detail.newProduct?'Naya product banega':product?(detail.match.method==='fuzzy'&&detail.match.id===product.id?detail.match.percent+'% naam match':detail.match.id===product.id?detail.match.kind:'Aapne saved product chuna'):detail.match.kind;
      const status=movement?.exact?'Pehle se recorded — Skip':movement?.before?'Opening se pehle — review zaroori':movement?.similar?'Possible duplicate — review zaroori':movement?.action==='skip'?'Skip — stock unchanged':'Naya Stock In';
      const selected=detail.newProduct?'__new__':detail.productId;
      return '<section class="sir-item" data-sir-item="'+detail.index+'"><h4>'+esc(row.name)+'</h4><strong>+'+stkFmt(row.quantity)+' '+esc(row.unit)+' · '+esc(ctPretty(e.packet.date))+'</strong><p>'+esc(kind)+(product?' · Saved: '+esc(product.name)+' / '+esc(product.unit):detail.newProduct?' · '+esc(stmUnit(row.unit)):'')+'</p>'+(movement?'<p>'+esc(status)+' · '+(movement.action==='new'?'Available: '+stkFmt(current)+' → '+stkFmt((Math.round(current*1000)+stkUnits(row.quantity,false))/1000)+' '+esc(product?.unit||stmUnit(row.unit)):'Stock unchanged')+'</p>':'')+
        '<details'+(!selected?' open':'')+'><summary>Product check / badlein</summary><label class="stk-field"><span>'+esc(row.name)+' — saved / new product</span><select class="inp" data-sir-match="'+detail.index+'"><option value="">Sahi product chuno…</option><option value="__new__"'+(selected==='__new__'?' selected':'')+'>Naya product: '+esc(row.name)+' · '+esc(stmUnit(row.unit))+'</option>'+products.map(p=>'<option value="'+esc(p.id)+'"'+(selected===p.id?' selected':'')+'>'+esc(p.name)+' · '+esc(p.unit)+'</option>').join('')+'</select></label></details>'+
        (movement?'<label class="stk-field sir-action"><span>Is item ki entry</span><select class="inp" data-sir-action="'+detail.index+'"'+(movement.exact?' disabled':'')+'><option value=""'+(!movement.action?' selected':'')+'>Duplicate / opening pehle resolve karein…</option><option value="new"'+(movement.action==='new'?' selected':'')+'>Naya received stock jodo</option><option value="skip"'+(movement.action==='skip'?' selected':'')+'>Pehle se included — Skip</option></select></label>':'')+'</section>';
    }).join('');
    $('#sirOpening').hidden=!plan.sameDay; $('#sirReferenceWrap').hidden=!plan.rows.some(r=>r.similar)||!!e.packet.reference;
    sirError(plan.errors.length?plan.errors.join('\n'):!plan.added?'Sab movements recorded / skipped hain. Kuch dobara add nahi hoga.':'Ready. Stock In quantities add hongi; total available overwrite nahi hoga.');
    $('#sirSave').textContent=plan.added?'Haan, '+plan.added+' Stock In save karo':'Kuch naya add nahi hoga';
    $('#sirSave').disabled=e.busy||!plan.valid;
  } catch(error) { if(sirCurrent(e)&&serial===e.serial){sirError(error.message);$('#sirSave').disabled=true;} }
}
function sirShow(packet,context) {
  go('stock'); stkCheck(context);
  openModal('<div class="modal stk-dialog sir-dialog" id="sirDialog" role="dialog" aria-modal="true" aria-labelledby="sirTitle"><div class="modal-h"><div><h3 id="sirTitle">Stock In · '+esc(ctPretty(packet.date))+'</h3><p>Ek list, ek combo. Poore products neeche check karein.</p></div><button class="x" type="button" data-act="closeModal" aria-label="Close Stock In">✕</button></div><div class="modal-b"><div class="banner info"><b>Naya aaya stock add hoga — opening / available overwrite nahi.</b> Saved product par quantity judegi. Jahan match nahi hai wahan visibly reviewed naya product ban sakta hai; uski opening zero, sirf yeh Stock In. Box / set / pcs conversion nahi. Abhi kuch save nahi hua.</div><p class="stkl-account"><b>Is panel ka account:</b> '+esc(Cloud.user?.email||'Is browser ka local data')+'<br>Sirf actual-data wale browser / account mein confirm karein. Private link forward na karein.</p><p><b>Actual date:</b> '+esc(packet.date)+' · <b>Supplier:</b> '+esc(packet.supplier||'not given')+'</p><p id="sirCounts" class="stkl-counts" aria-live="polite"></p><div id="sirItems" aria-live="polite"></div><label id="sirOpening" class="stm-check" hidden><input id="sirSameDay" type="checkbox"><span>Isi din ki opening snapshot ke BAAD yeh naya stock aaya tha aur opening mein pehle se included nahi hai.</span></label><label class="stk-field" id="sirReferenceWrap" hidden><span>Sirf sach mein alag same-date / quantity delivery ka actual bill / reference</span><input class="inp" id="sirReference" maxlength="80" value="'+esc(packet.reference)+'"><small>Guess / random reference mat banayein. Existing receipt ho toh Skip chunein.</small></label>'+(packet.source?'<details class="sir-source"><summary>Original list dekho</summary><pre>'+esc(packet.source)+'</pre></details>':'')+'<p class="stk-note">Previous / Available checks is list mein nahi hain. Quantity aur actual receipt date verify karein; opening cutoff, duplicates aur poora dated nonnegative ledger phir bhi mandatory hain.</p><p class="stk-error" id="sirError" role="alert" tabindex="-1"></p><p class="sir-consent">Neeche <b>Haan</b> ka matlab: maine account, date, saare source / matched names, exact units, quantities, naye products aur warnings dekhe hain. Sirf reviewed naya Stock In jodo. Poora save ek saath aur required safety copy ke baad hoga.</p></div><div class="modal-f"><button class="btn" type="button" data-act="closeModal">Abhi nahi</button><button class="btn primary" type="button" id="sirSave" data-sir="save" disabled>Preview check ho raha hai…</button></div></div>',{sticky:true});
  const e=sirEditor={element:$('#sirDialog'),context,packet,matches:{},actions:{},serial:0,busy:false,plan:null};
  return sirRefresh(e);
}
async function sirSave() {
  const e=sirEditor; if(!sirCurrent(e)||e.busy||!e.plan?.valid)return;
  const options=sirOptions(e),signature=e.plan.signature,serial=e.serial,plan=e.plan;
  e.busy=true;$('#sirSave').disabled=true;
  try {
    const result=await sirApply(e.packet,options,e.context,signature,()=>sirCurrent(e)&&e.serial===serial&&e.plan?.signature===signature&&JSON.stringify(sirOptions(e))===JSON.stringify(options));
    if(!sirCurrent(e))return;
    const receipt={ids:plan.rows.filter(row=>row.action==='new').map(row=>row.id),date:e.packet.date,party:e.packet.supplier||'Supplier not given'};
    closeModal();Object.assign(stkUI(),{tab:'history',q:'',page:0,product:'all',party:'',salesperson:'',from:'',to:'',type:'all',order:'newest',lastMessage:receipt});
    go('stock');toast('1 combo · '+result.imported+' Stock In saved · '+result.products+' new products · '+result.skipped+' skipped','ok');
  } catch(error) { if(sirCurrent(e)){e.busy=false;e.plan=null;sirError(error.message+'\nLink dobara kholkar fresh review karein.');$('#sirSave').disabled=true;$('#sirError').focus();} }
}
document.addEventListener('change',event=>{
  const e=sirEditor,target=event.target;if(!sirCurrent(e))return;
  if(target.hasAttribute('data-sir-match'))e.matches[target.dataset.sirMatch]=target.value;
  else if(target.hasAttribute('data-sir-action'))e.actions[target.dataset.sirAction]=target.value;
  else if(target.id!=='sirSameDay'&&target.id!=='sirReference')return;
  if(target.hasAttribute('data-sir-match'))delete e.actions[target.dataset.sirMatch];
  if(target.id!=='sirSameDay')$('#sirSameDay').checked=false;
  sirRefresh(e);
});
document.addEventListener('input',event=>{if(event.target.id==='sirReference'&&sirCurrent(sirEditor)){$('#sirSameDay').checked=false;sirRefresh(sirEditor);}});
document.addEventListener('click',event=>{if(event.target.closest('[data-sir="save"]')){event.preventDefault();sirSave();}});
/* v3.40 REVIEWED STOCK IN LINK END */
