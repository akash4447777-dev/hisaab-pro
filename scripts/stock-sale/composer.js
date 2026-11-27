/* v3.43 STOCK SALE UI BEGIN
   One inline cart, one explicit Confirm sale, no review pop-up or auto-sale.
   Draft changes never write. Saved totals always derive from saved line values. */
function ssaClock(){const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function ssaNewState(){return {context:stkContext(),draft:{id:ssaId(),edit:false,label:'',date:isoDate(new Date()),time:ssaClock(),party:'',salesperson:'',deliveryName:'',deliveryPhone:'',deliveryDetails:'',note:'',rows:[]},query:'',active:0,replace:'',message:'',preserve:new Set(),touched:new Set(),busy:false,receipt:null};}
function ssaCurrent(e){return !!e&&ssaState===e&&UI.view==='stock'&&stkUI().tab==='sale'&&!!$('#ssaSale');}
function ssaOpen(productId){
  stkCheck(stkViewContext||stkContext());closeModal();
  if(!ssaState||ssaState.receipt)ssaState=ssaNewState();
  Object.assign(stkUI(),{tab:'sale',page:0});go('stock');
  if(productId)ssaAddProduct(productId);else $('#ssaSearch')?.focus();
}
function ssaDraftPayload(e){
  const input={...e.draft,rows:e.draft.rows.map(({key,unit,...line})=>line)};
  for(const key of e.preserve)if(!e.touched.has(key))delete input[key];return input;
}
function ssaOpenSaved(entryId,reuse=false){
  stkCheck(stkViewContext||stkContext());const group=stcGet(entryId),first=group.rows[0];
  if(!first?.sale)throw new Error('Yeh priced Sale nahi hai. Original stock entry Edit use karein.');
  const rows=ssaSaleRows(first.sale.id);if(!rows.length)throw new Error('Sale ab nahi hai.');
  closeModal();const e=ssaNewState(),common=key=>{const values=[...new Set(rows.map(t=>t[key]))];return values.length===1?values[0]:'';};
  e.draft={...e.draft,id:reuse?e.draft.id:first.sale.id,edit:!reuse,label:first.sale.label,date:reuse?e.draft.date:first.date,time:reuse?e.draft.time:first.sale.time,
    party:reuse?'':first.party,salesperson:reuse?'':first.salesperson,deliveryName:reuse?'':first.deliveryName,deliveryPhone:reuse?'':common('deliveryPhone'),deliveryDetails:reuse?'':common('deliveryDetails'),note:reuse?'':common('note'),
    rows:rows.map(t=>({key:uid(),...(reuse?{}:{id:t.id}),productId:t.productId,unit:t.unit,qty:String(t.qty),rate:ssaInputMoney(t.sale.rate),discountType:t.sale.discountType,discount:ssaInputMoney(t.sale.discount)}))};
  if(!reuse)for(const key of ['deliveryPhone','deliveryDetails','note'])if(new Set(rows.map(t=>t[key])).size>1)e.preserve.add(key);
  e.message=reuse?'Previous combo copied as an UNSAVED draft. Current stock, actual prices, party and roles dobara check karein.':'Editing complete saved Sale. Changes Confirm par ek saath save hongi; old values audit mein retained.';
  ssaState=e;Object.assign(stkUI(),{tab:'sale',page:0});go('stock');$('#ssaSearch')?.focus();
}
function ssaQuote(e){
  const stock=stkData(),rows=[],issues=new Map(),used=new Map(),input=e.draft;
  input.rows.forEach(line=>{
    try{
      const p=stock.products.find(p=>p.id===line.productId);if(!p||line.unit&&line.unit!==p.unit)throw new Error('Saved product / exact unit missing or changed. Replace ya remove karein; conversion nahi hogi.');
      const qty=stkQty(line.qty,false);used.set(p.id,(used.get(p.id)||0)+stkUnits(qty,false));
      const rate=ssaMoney(line.rate),discountType=line.discountType,value=line.discount===''?'0':line.discount;
      const discount=discountType==='percent'?ssaPercent(value):ssaMoney(value,'Line discount');
      ssaLineTotal(qty,rate,discountType,discount);rows.push({productId:p.id,qty,unit:p.unit,sale:{rate,discountType,discount}});
    }catch(error){issues.set(line.key,error.message);}
  });
  for(const [id,quantity]of used){const capacity=ssaCapacity(id,input.date,stock,input.edit?input.id:'');if(capacity!==null&&quantity>stkUnits(capacity,true))input.rows.filter(t=>t.productId===id).forEach(t=>issues.set(t.key,'Sale-date sellable: '+stkFmt(capacity)+' '+stock.products.find(p=>p.id===id).unit+' for ALL selected lines together. Later commitments bhi checked; overselling blocked.'));}
  let totals=null;try{if(rows.length===input.rows.length&&rows.length)totals=ssaTotals(rows);}catch(error){issues.set('total',error.message);}
  const errors=[];
  try{stkCheck(e.context);}catch(error){errors.push(error.message+' Refresh stock (same account) ya New Sale use karein.');}
  if(!input.rows.length)errors.push('Search se kam se kam ek product add karein.');
  if(input.rows.length>SSA_MAX_LINES)errors.push('Maximum 50 lines per Sale.');
  if(!stkDate(input.date))errors.push('Valid actual Sale date chunein.');
  if(! /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.time))errors.push('Valid local Sale time chunein.');
  for(const key of ['party','salesperson','deliveryName'])try{stkText(input[key],90,true,key);}catch(error){errors.push(error.message);}
  for(const [key,max]of [['label',90],['deliveryPhone',35],['deliveryDetails',500],['note',500]])try{stkText(input[key],max,false,key);}catch(error){errors.push(error.message);}
  return {totals,issues,errors,valid:!!totals&&!issues.size&&!errors.length};
}
function ssaLineHTML(line,index){
  const p=stkData().products.find(p=>p.id===line.productId),name=p?.name||'Product no longer available',unit=p?.unit||line.unit||'';
  const field=(key,label,max=13)=>'<label class="stk-field"><span>'+esc(label)+'</span><input class="inp" data-ssa-line="'+esc(line.key)+'" data-key="'+key+'" inputmode="decimal" maxlength="'+max+'" value="'+esc(line[key])+'" aria-label="'+esc(label+' · '+name)+'"></label>';
  const last=stkData().transactions.filter(t=>t.productId===line.productId&&t.sale).sort((a,b)=>b.createdAt-a.createdAt||b.sequence-a.sequence)[0];
  return '<article class="ssa-line" data-ssa-row="'+esc(line.key)+'"><div class="ssa-line-head"><div><small>ITEM '+(index+1)+' · '+esc(unit)+'</small><b>'+esc(name)+'</b><span class="ssa-line-stock"></span></div><div class="row-actions"><button class="btn xs" type="button" data-ssa="replace" data-key="'+esc(line.key)+'">Change</button><button class="btn xs danger" type="button" data-ssa="remove" data-key="'+esc(line.key)+'" aria-label="Remove '+esc(name)+'">Remove</button></div></div><div class="ssa-line-fields">'+field('qty','Quantity · '+unit)+field('rate','Price ₹ / '+unit,12)+'<label class="stk-field"><span>Discount type</span><select class="inp" data-ssa-line="'+esc(line.key)+'" data-key="discountType" aria-label="Discount type · '+esc(name)+'"><option value="percent"'+(line.discountType==='percent'?' selected':'')+'>% per line</option><option value="amount"'+(line.discountType==='amount'?' selected':'')+'>₹ per line</option></select></label>'+field('discount','Discount '+(line.discountType==='percent'?'%':'₹ / line'),12)+'</div>'+
    (last?'<button type="button" class="btn xs ssa-last-price" data-ssa="lastPrice" data-key="'+esc(line.key)+'">Use last recorded price ₹'+ssaRupees(last.sale.rate)+' / '+esc(unit)+'</button>':'<small class="ssa-price-help">Enter actual price. ₹0 is allowed only if genuinely free; old unpriced sales are not treated as zero.</small>')+'<div class="ssa-line-money" aria-live="polite"></div><p class="ssa-line-error" role="status"></p></article>';
}
function ssaPeopleLists(){
  return [['party','ssaParties'],['salesperson','ssaSalespeople'],['deliveryName','ssaDeliveryPeople']].map(([key,id])=>'<datalist id="'+id+'">'+[...new Set(stkData().transactions.map(t=>t[key]).filter(Boolean))].sort().slice(0,200).map(v=>'<option value="'+esc(v)+'"></option>').join('')+'</datalist>').join('');
}
function ssaHTML(){
  if(!ssaState)ssaState=ssaNewState();const e=ssaState;
  if(e.receipt){const anchor=e.receipt.ids.find(id=>stkData().transactions.some(t=>t.id===id));return '<section id="ssaSale" class="ssa-sale"><div class="ssa-intro"><div><span class="ssa-kicker">SALE SAVED · STOCK UPDATED</span><h3>✓ One sale. All selected products.</h3><p>Product-wise stock and complete dated ledger checked. Prices/discounts/date/time/party audit mein saved.</p></div><div class="row-actions"><button class="btn primary" data-ssa="new">＋ New Sale</button><button class="btn" data-ssa="history">All Sale History</button></div></div>'+(anchor?ssaCardHTML(stcGet(anchor)):'<p class="banner warn">Saved Sale changed / removed. Current History dekhein.</p>')+'</section>';}
  const d=e.draft,field=(key,label,max=90,extra='')=>'<label class="stk-field"><span>'+esc(label)+'</span><input class="inp" data-ssa-field="'+key+'" id="ssa_'+key+'" maxlength="'+max+'" value="'+esc(d[key])+'" '+extra+(['party','date','time','salesperson','deliveryName'].includes(key)?' required':'')+'>'+ (e.preserve.has(key)?'<small>Different saved values — preserved unless you explicitly edit this field.</small>':'')+'</label>';
  const out='<section id="ssaSale" class="ssa-sale"><div class="ssa-intro"><div><span class="ssa-kicker">SMART SEARCH · CUSTOM COMBO · ONE SAVE</span><h3>'+(d.edit?'Edit complete Sale':'Stock Sale / custom combo')+'</h3><p>Select products, edit quantities/prices/discounts, then confirm once. No stock changes before confirmation.</p></div><div class="row-actions"><button type="button" class="btn sm" data-ssa="refresh">↻ Refresh stock</button><button type="button" class="btn sm" data-ssa="history">Sale History</button>'+'<button type="button" class="btn sm" data-ssa="new">'+(d.edit?'Cancel edit / New Sale':'Clear draft')+'</button>'+'</div></div><p class="ssa-account"><b>Account:</b> '+esc(Cloud.user?.email||'Is browser ka local data')+' · ₹ INR · local clock as entered</p>'+(e.message?'<p class="banner info ssa-message">'+esc(e.message)+'</p>':'')+'<form id="ssaForm"><div class="ssa-header-fields">'+field('party','Customer / party *',90,'list="ssaParties" autocomplete="off"')+field('label','Combo / package name (optional)')+field('date','Actual sale date *',10,'type="date" min="1900-01-01" max="9998-12-31"')+field('time','Sale time · local clock *',5,'type="time" step="60"')+field('salesperson','Salesperson *',90,'list="ssaSalespeople"')+field('deliveryName','Delivery person *',90,'list="ssaDeliveryPeople"')+'</div>'+ssaPeopleLists()+'<div class="ssa-workspace"><div class="ssa-products"><div class="ssa-search-box"><label for="ssaSearch"><b>Find & add products</b><span>Names, abbreviations, typos or model · click / ↑ ↓ + Enter</span></label><input id="ssaSearch" class="inp" type="search" maxlength="90" value="'+esc(e.query)+'" autocomplete="off" role="combobox" aria-autocomplete="list" aria-controls="ssaSuggestions" aria-expanded="true" placeholder="Search product…"><p id="ssaSearchStatus" role="status"></p><div id="ssaSuggestions" role="listbox" aria-label="Product suggestions"></div></div><div class="ssa-cart-head"><h4>Selected products <span id="ssaLineCount"></span></h4><span>Exact units retained · separate lines keep their own prices</span></div><div id="ssaLines">'+(d.rows.length?d.rows.map(ssaLineHTML).join(''):'<div class="ssa-empty"><b>Your sale is empty</b><p>Search above and tap a product to build any combo/package. Nothing is saved yet.</p></div>')+'</div><details class="ssa-extra"><summary>Delivery details / note (optional)</summary><div class="ssa-header-fields">'+field('deliveryPhone','Delivery phone',35)+field('deliveryDetails','Delivery / address / vehicle',500)+field('note','Sale note',500)+'</div></details></div><aside class="ssa-summary" aria-label="Complete sale summary"><span class="ssa-kicker">SALE SUMMARY</span><h4>All selected products</h4><div id="ssaSummaryItems"></div><div id="ssaQuantities"></div><dl><div><dt>Subtotal</dt><dd id="ssaGross">—</dd></div><div><dt>Discount</dt><dd id="ssaDiscount">—</dd></div><div class="ssa-final"><dt>Final amount</dt><dd id="ssaNet">—</dd></div></dl><p class="ssa-rounding">Line subtotals and discounts round half-up to ₹0.01. Mixed units stay separate; no tax, payment or salary entry.</p><p id="ssaError" class="stk-error" role="status" tabindex="-1"></p><button class="btn primary" type="button" id="ssaCommit" data-ssa="commit">'+(d.edit?'Confirm changes':'Confirm sale & reduce stock')+'</button><p class="ssa-confirm-note">One confirmation · one audited atomic save · no overselling</p></aside></div></form></section>';
  return out;
}
function ssaSearchRender(){
  const e=ssaState;if(!ssaCurrent(e)||e.receipt)return;
  const list=$('#ssaSuggestions'),all=ssxCandidates(e.query,'',stkData(),true).filter(p=>p.eligible),shown=all.slice(0,10);e.searchRows=shown;
  e.active=Math.max(0,Math.min(e.active,shown.length-1));
  $('#ssaSearchStatus').textContent=e.replace?'Choose replacement product. This is still an unsaved draft.':shown.length?(all.length>10?'Top 10 of '+all.length+' matches. Refine search for more.':all.length+' matching products'):'No suitable product. Check name/model; nothing auto-selected.';
  list.innerHTML=shown.map((p,i)=>{const cap=ssaCapacity(p.id,e.draft.date,stkData(),e.draft.edit?e.draft.id:''),zero=cap!==null&&cap<=0;return '<button type="button" class="ssa-suggestion'+(i===e.active?' ssa-active':'')+'" id="ssaOption'+i+'" role="option" aria-selected="'+(i===e.active)+'" data-ssa="add" data-product="'+esc(p.id)+'"'+(zero?' disabled':'')+'><span><b>'+esc(p.name)+'</b><small>Available '+stkFmt(p.available)+' '+esc(p.unit)+(cap!==null?' · Sale-date sellable '+stkFmt(cap)+' '+esc(p.unit):'')+'</small></span><span class="ssa-suggestion-end">'+(e.query?'<small>'+p.percent+'% · '+esc(p.method)+'</small>':'')+'<b>'+(zero?'Out of stock':e.replace?'Replace':'＋ Add')+'</b></span></button>';}).join('');
  $('#ssaSearch').setAttribute('aria-activedescendant',shown.length?'ssaOption'+e.active:'');
}
function ssaUpdate(){
  const e=ssaState;if(!ssaCurrent(e)||e.receipt)return;const quote=ssaQuote(e),d=e.draft;
  $('#ssaLineCount').textContent='('+d.rows.length+')';
  d.rows.forEach(line=>{
    const el=e.element?.querySelector('[data-ssa-row="'+line.key+'"]')||$('#ssaLines').querySelector('[data-ssa-row="'+line.key+'"]');if(!el)return;
    const p=stkData().products.find(p=>p.id===line.productId),capacity=p?ssaCapacity(p.id,d.date,stkData(),d.edit?d.id:''):null;
    $('.ssa-line-stock',el).textContent=p?(capacity===null?'Choose valid date':'Sale-date sellable '+stkFmt(capacity)+' '+p.unit+' · all selected lines checked together'):'Product missing';
    $('.ssa-line-error',el).textContent=quote.issues.get(line.key)||'';el.classList.toggle('ssa-invalid',quote.issues.has(line.key));
    let money='';try{const x=ssaLineTotal(line.qty,ssaMoney(line.rate),line.discountType,line.discountType==='percent'?ssaPercent(line.discount||'0'):ssaMoney(line.discount||'0'));money='Subtotal ₹'+ssaRupees(x.gross)+' − discount ₹'+ssaRupees(x.discount)+' = ₹'+ssaRupees(x.net);}catch(error){money='Amount pending · actual quantity / price / discount required';}
    $('.ssa-line-money',el).textContent=money;
  });
  const q=quote.totals;$('#ssaGross').textContent=q?'₹'+ssaRupees(q.gross):'—';$('#ssaDiscount').textContent=q?'−₹'+ssaRupees(q.discount):'—';$('#ssaNet').textContent=q?'₹'+ssaRupees(q.net):'—';
  $('#ssaQuantities').innerHTML='<b>Total quantity by exact unit</b><span>'+(q?q.quantities.map(x=>stkFmt(x.qty)+' '+esc(x.unit)).join(' · '):'Complete quantities / prices first')+'</span>';
  $('#ssaSummaryItems').innerHTML=d.rows.map(line=>{const p=stkData().products.find(p=>p.id===line.productId);let price='Amount pending';try{const x=ssaLineTotal(line.qty,ssaMoney(line.rate),line.discountType,line.discountType==='percent'?ssaPercent(line.discount||'0'):ssaMoney(line.discount||'0'));price='₹'+ssaRupees(ssaMoney(line.rate))+' / '+(p?.unit||line.unit)+' − ₹'+ssaRupees(x.discount)+' discount = ₹'+ssaRupees(x.net);}catch(error){}return '<div><span>'+esc(p?.name||'Missing product')+'</span><b>'+esc(line.qty||'—')+' '+esc(p?.unit||line.unit)+'</b><small>'+esc(price)+'</small></div>';}).join('')||'<p>No products selected</p>';
  $('#ssaError').textContent=e.error||quote.errors.slice(0,3).join('\n')||(quote.issues.size?'Fix the highlighted product line(s). Nothing saved yet.':'Ready · confirm once to save all products.');
  $('#ssaError').classList.toggle('ssa-ready',quote.valid&&!e.error);
  $('#ssaCommit').disabled=e.busy||!quote.valid;
}
function ssaAfterRender(){if(ssaCurrent(ssaState)&&!ssaState.receipt){ssaSearchRender();ssaUpdate();}}
function ssaAddProduct(id){
  const e=ssaState;if(!ssaCurrent(e)||e.receipt||e.busy)return;stkCheck(e.context);
  const p=stkData().products.find(p=>p.id===id);if(!p)throw new Error('Current saved product chunein.');
  if(ssaCapacity(id,e.draft.date,stkData(),e.draft.edit?e.draft.id:'')===0)throw new Error('Sale date par sellable stock zero hai. Product silently add nahi hua.');
  const line={key:uid(),productId:p.id,unit:p.unit,qty:'1',rate:'',discountType:'percent',discount:'0'};
  if(e.replace){const at=e.draft.rows.findIndex(x=>x.key===e.replace);if(at<0)throw new Error('Replacement line changed.');e.draft.rows[at]=line;e.replace='';}
  else{if(e.draft.rows.length>=SSA_MAX_LINES)throw new Error('Maximum 50 lines.');e.draft.rows.push(line);}
  e.query='';e.active=0;e.error='';render();$('#ssaSearch')?.focus();
}
function ssaCardHTML(group){
  const sale=group.sale||ssaDescribe(group.rows).sale;if(!sale)return '';
  const partial=group.matchedRows&&group.matchedRows.length!==group.rows.length,rows=group.matchedRows||group.rows;
  return '<article class="card ssa-saved-sale" data-stock-sale="'+esc(sale.id)+'"><div class="ssa-saved-head"><div><span class="badge green">1 Sale / combo</span><h4>'+esc(sale.label||'Custom sale')+'</h4><b>'+esc(group.party)+'</b><p>'+esc(group.from)+' · '+esc(sale.time)+' (local clock as entered) · '+sale.products+' products / '+sale.lines+' lines</p></div><div class="ssa-saved-total"><small>Whole-sale final amount</small><strong>₹'+ssaRupees(sale.net)+'</strong><div class="row-actions"><button class="btn primary sm" data-ste-pdf="message" data-id="'+esc(group.entryId)+'">↓ Sale PDF</button><button class="btn sm" data-ssa="edit" data-id="'+esc(group.entryId)+'">Edit Sale</button><button class="btn sm" data-ssa="reuse" data-id="'+esc(group.entryId)+'">Use combo again</button><button class="btn sm danger" data-stc="delete" data-id="'+esc(group.entryId)+'">Delete Sale…</button></div></div></div><div class="stc-common">'+stcRolesHTML(group)+stcTagsHTML(group.members)+'</div>'+(partial?'<p class="banner info">Filters match '+rows.length+' / '+group.rows.length+' lines. Final amount above and Sale PDF/Edit/Delete refer to the WHOLE sale. Filtered History PDF remains matches-only.</p>':'')+'<div class="ssa-saved-lines">'+rows.map(t=>{const x=ssaLineTotal(t.qty,t.sale.rate,t.sale.discountType,t.sale.discount);return '<div data-stock-entry="'+esc(t.id)+'"><div><b>'+esc(t.currentProductName||t.productName)+'</b>'+(t.currentProductName&&t.currentProductName!==t.productName?'<small>At sale: '+esc(t.productName)+'</small>':'')+'<span>'+stkFmt(t.qty)+' '+esc(t.unit)+' × ₹'+ssaRupees(t.sale.rate)+' / '+esc(t.unit)+'</span><small>Discount '+(t.sale.discountType==='percent'?ssaInputMoney(t.sale.discount)+'%':'₹'+ssaRupees(t.sale.discount)+' / line')+' (₹'+ssaRupees(x.discount)+') · balance after '+stkFmt(t.balance)+' '+esc(t.unit)+'</small></div><strong>₹'+ssaRupees(x.net)+'</strong></div>';}).join('')+'</div><div class="ssa-saved-summary"><span>Subtotal ₹'+ssaRupees(sale.gross)+'</span><span>Discount −₹'+ssaRupees(sale.discount)+'</span><b>Quantity: '+sale.quantities.map(x=>stkFmt(x.qty)+' '+esc(x.unit)).join(' · ')+'</b></div><details class="stc-original"><summary>Saved details / IDs / original notes</summary>'+group.rows.map(t=>'<p><b>'+esc(t.productName)+'</b> · '+esc(t.id)+'<br>Recorded '+esc(new Date(t.createdAt).toLocaleString('en-IN'))+'</p><pre>'+esc([t.note,t.deliveryDetails].filter(Boolean).join('\n'))+'</pre>').join('')+'</details></article>';
}
function ssaPdfBody(report,ctx){
  const {paragraph,tableHeader,tableRow,advance}=ctx,g=report.combo,x=ssaTotals(report.rows),first=report.rows[0];
  paragraph('Customer / party: '+g.party,{size:11,bold:true});paragraph('Sale: '+(first.sale.label||'Custom combo')+' · '+first.date+' · '+first.sale.time+' (local clock as entered)',{bold:true});
  [['Salesperson',g.salespeople],['Delivery person',g.delivery],['Delivery phone',g.phones]].forEach(([label,values])=>{if(values.length)paragraph(label+': '+values.join(' · '));});
  if(g.members.length)paragraph('Tagged members: '+g.members.join(' · '));
  const cols=[{label:'Product',w:155},{label:'Qty / unit',w:90},{label:'Price ₹ / unit',w:90},{label:'Discount ₹ / line',w:85},{label:'Final amount ₹',w:95.28}];tableHeader(cols);
  report.rows.forEach(t=>{const y=ssaLineTotal(t.qty,t.sale.rate,t.sale.discountType,t.sale.discount);tableRow(cols,[t.currentProductName+(t.currentProductName!==t.productName?' (at sale: '+t.productName+')':''),stkFmt(t.qty)+' '+t.unit,ssaRupees(t.sale.rate)+' / '+t.unit,ssaRupees(y.discount)+(t.sale.discountType==='percent'?' ('+ssaInputMoney(t.sale.discount)+'%)':''),ssaRupees(y.net)]);});
  advance(12);paragraph('Subtotal ₹'+ssaRupees(x.gross)+' · Discount ₹'+ssaRupees(x.discount)+' · FINAL AMOUNT ₹'+ssaRupees(x.net),{bold:true,size:11});
  paragraph('Total quantity by exact unit: '+x.quantities.map(q=>stkFmt(q.qty)+' '+q.unit).join(' · '),{bold:true});
  paragraph('INR only. Each line subtotal and discount rounds half-up to ₹0.01. No mixed-unit quantity, tax, payment or invoice is invented.',{size:7});
  report.rows.forEach(t=>{paragraph('Saved item · '+t.id,{size:7});paragraph('Original date/time: '+t.date+' '+t.sale.time+' · Recorded '+new Date(t.createdAt).toISOString(),{size:7});if(t.note)paragraph('Note: '+t.note,{size:8});if(t.deliveryDetails)paragraph('Delivery: '+t.deliveryDetails,{size:8});});
}
function ssaPdfLine(row,paragraph){if(row.sale){const x=ssaLineTotal(row.qty,row.sale.rate,row.sale.discountType,row.sale.discount);paragraph('Sale pricing: ₹'+ssaRupees(row.sale.rate)+' / '+row.unit+' · Subtotal ₹'+ssaRupees(x.gross)+' · Discount ₹'+ssaRupees(x.discount)+' · Final ₹'+ssaRupees(x.net)+' · '+row.sale.time+' (local clock)'+(row.sale.label?' · '+row.sale.label:''),{size:8,inset:8});}}
function ssaPdfTotals(report,paragraph){const rows=report.rows.filter(t=>t.sale);if(!rows.length)return;const x=ssaTotalsExact(rows),all=report.rows.filter(t=>t.type==='sale').length;paragraph('PRICED MATCHING SALE ROWS: '+rows.length+' of '+all+'. Subtotal ₹'+ssaRupees(x.gross)+' · Discount ₹'+ssaRupees(x.discount)+' · Final ₹'+ssaRupees(x.net)+'. Unpriced legacy sales are excluded from money totals, not treated as ₹0.',{size:8,bold:true});}
document.addEventListener('input',event=>{
  const e=ssaState,t=event.target;if(!ssaCurrent(e)||!t.closest('#ssaSale')||e.receipt)return;
  if(t.id==='ssaSearch'){e.query=t.value;e.active=0;ssaSearchRender();return;}
  if(t.dataset.ssaField!==undefined&&['party','label','date','time','salesperson','deliveryName','deliveryPhone','deliveryDetails','note'].includes(t.dataset.ssaField)){e.draft[t.dataset.ssaField]=t.value;e.touched.add(t.dataset.ssaField);e.error='';if(t.dataset.ssaField==='date')ssaSearchRender();ssaUpdate();}
  if(t.dataset.ssaLine!==undefined&&['qty','rate','discount'].includes(t.dataset.key)){const row=e.draft.rows.find(x=>x.key===t.dataset.ssaLine);if(row){row[t.dataset.key]=t.value;e.error='';ssaUpdate();}}
});
document.addEventListener('change',event=>{
  const e=ssaState,t=event.target;if(!ssaCurrent(e)||e.receipt)return;
  if(t.dataset.ssaLine!==undefined&&t.dataset.key==='discountType'){
    const row=e.draft.rows.find(x=>x.key===t.dataset.ssaLine);if(row){row.discountType=t.value;row.discount='0';e.error='';render();}
  }else if(t.dataset.ssaField!==undefined)t.dispatchEvent(new Event('input',{bubbles:true}));
});
document.addEventListener('keydown',event=>{
  const e=ssaState,t=event.target;if(!ssaCurrent(e)||e.receipt||!t.closest('#ssaForm'))return;
  if(t.id==='ssaSearch'&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();const n=e.searchRows?.length||0;if(n){e.active=(e.active+(event.key==='ArrowDown'?1:-1)+n)%n;ssaSearchRender();$('#ssaOption'+e.active)?.scrollIntoView({block:'nearest'});}}
  if(event.key==='Enter'&&['INPUT','SELECT'].includes(t.tagName)){event.preventDefault();if(t.id==='ssaSearch'){const id=e.searchRows?.[e.active]?.id;if(id)try{ssaAddProduct(id);}catch(error){e.error=error.message;ssaUpdate();}}}
  if(t.id==='ssaSearch'&&event.key==='Escape'){event.preventDefault();e.query='';e.replace='';t.value='';ssaSearchRender();}
});
document.addEventListener('submit',event=>{if(event.target.id==='ssaForm')event.preventDefault();});
document.addEventListener('click',event=>{
  const b=event.target.closest('[data-ssa]');if(!b||b.disabled)return;event.preventDefault();
  try{
    const action=b.dataset.ssa;
    if(action==='open'){ssaOpen(b.dataset.product);return;}
    if(action==='edit'||action==='reuse'){ssaOpenSaved(b.dataset.id,action==='reuse');return;}
    if(action==='history'){stkCheck(stkContext());Object.assign(stkUI(),{tab:'history',type:'sale',product:'all',q:'',party:'',salesperson:'',from:'',to:'',page:0});go('stock');return;}
    if(action==='new'){stkCheck(stkContext());ssaState=ssaNewState();Object.assign(stkUI(),{tab:'sale',page:0});go('stock');$('#ssa_party')?.focus();return;}
    const e=ssaState;if(!ssaCurrent(e)||e.receipt||e.busy)return;
    if(action==='refresh'){if(e.context.scope!==Cloud.scope||e.context.epoch!==Cloud.epoch)throw new Error('Account badla. New Sale kholein.');stkCheck(stkContext());e.context=stkContext();e.error='';e.message='Current stock refreshed. Check available quantities and confirm your draft once.';render();}
    if(action==='add')ssaAddProduct(b.dataset.product);
    if(action==='remove'){e.draft.rows=e.draft.rows.filter(x=>x.key!==b.dataset.key);e.error='';render();}
    if(action==='replace'){e.replace=b.dataset.key;e.query='';$('#ssaSearch').value='';ssaSearchRender();$('#ssaSearch').focus();}
    if(action==='lastPrice'){const row=e.draft.rows.find(x=>x.key===b.dataset.key),last=stkData().transactions.filter(t=>t.productId===row?.productId&&t.sale).sort((a,b)=>b.createdAt-a.createdAt||b.sequence-a.sequence)[0];if(row&&last){row.rate=ssaInputMoney(last.sale.rate);e.error='';render();}}
    if(action==='commit'){
      const quote=ssaQuote(e);if(!quote.valid)throw new Error(quote.errors.concat([...quote.issues.values()]).join('\n'));
      e.busy=true;ssaUpdate();const result=ssaSave(ssaDraftPayload(e),e.context);
      e.busy=false;e.receipt=result;e.context=stkContext();e.error='';render();toast(e.draft.edit?'Sale updated · stock / pricing recalculated':'Sale saved · all products / prices / discounts retained','ok');
    }
  }catch(error){if(ssaCurrent(ssaState)&&!ssaState.receipt){ssaState.busy=false;ssaState.error=error.message;ssaUpdate();$('#ssaError')?.focus();}else toast(error.message,'bad');}
});
/* v3.43 STOCK SALE UI END */
