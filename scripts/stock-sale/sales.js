/* v3.43 STOCK SALE CORE BEGIN
   Optional, validated pricing on ordinary Sale movements. No second inventory,
   no price/discount migration, no salary/Canteen/payment/invoice integration.
   All quantities are thousandths; all money is integer INR paise. */
const SSA_MAX_LINES=50, SSA_MAX_MONEY=Number.MAX_SAFE_INTEGER;
let ssaState=null;
function ssaReset(){ssaState=null;}
function ssaId(){return 'sale1_'+uid()+uid();}
function ssaMoney(value,label='Price'){
  const text=typeof value==='number'&&Number.isFinite(value)?String(value):typeof value==='string'?value.trim():'';
  if(!/^\d{1,9}(?:\.\d{1,2})?$/.test(text))throw new Error(label+': actual rupees likhein, maximum 2 decimals; blank / minus / comma / exponent allowed nahi.');
  const [whole,part='']=text.split('.');return Number(whole)*100+Number(part.padEnd(2,'0'));
}
function ssaPercent(value){
  const text=typeof value==='number'?String(value):typeof value==='string'?value.trim():'';
  if(!/^\d{1,3}(?:\.\d{1,2})?$/.test(text))throw new Error('Discount percent 0–100, maximum 2 decimals hona chahiye.');
  const [whole,part='']=text.split('.'),n=Number(whole)*100+Number(part.padEnd(2,'0'));
  if(n>10000)throw new Error('Discount 100% se zyada nahi ho sakta.');return n;
}
function ssaRupees(paise){
  if(typeof paise!=='bigint'&&(!Number.isSafeInteger(paise)||paise<0)||typeof paise==='bigint'&&paise<0n)throw new Error('Invalid integer sale amount.');
  const n=BigInt(paise);return (n/100n).toLocaleString('en-IN')+'.'+String(n%100n).padStart(2,'0');
}
function ssaInputMoney(paise){return Math.floor(paise/100)+'.'+String(paise%100).padStart(2,'0');}
function ssaBound(n){if(n<0n||n>BigInt(SSA_MAX_MONEY))throw new Error('Sale amount safe numeric limit se bada hai.');return Number(n);}
function ssaLineTotal(qty,rate,discountType,discount){
  const units=stkUnits(qty,false);
  if(!Number.isSafeInteger(rate)||rate<0||rate>99999999999)throw new Error('Price integer paise mein valid hona chahiye.');
  if(!Number.isSafeInteger(discount)||discount<0||!['percent','amount'].includes(discountType)||discountType==='percent'&&discount>10000||discountType==='amount'&&discount>99999999999)throw new Error('Invalid Sale discount.');
  const gross=ssaBound((BigInt(units)*BigInt(rate)+500n)/1000n);
  const off=discountType==='percent'?ssaBound((BigInt(gross)*BigInt(discount)+5000n)/10000n):discount;
  if(off>gross)throw new Error('Line discount us item ke subtotal se zyada nahi ho sakta.');
  return {gross,discount:off,net:gross-off};
}
function ssaValidateLine(t){
  const x=t.sale;stkObject(x,['v','id','label','time','rate','discountType','discount'],'sale pricing');
  if(t.type!=='sale'||t.source!=='manual'||x.v!==1||typeof x.id!=='string'||!/^sale1_[a-zA-Z0-9_-]{12,80}$/.test(x.id)||typeof x.time!=='string'||! /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(x.time))throw new Error('Invalid priced Sale identity / time / type.');
  if(x.label!==stkName(x.label))throw new Error('Combo/package name normalized hona chahiye.');stkText(x.label,90,false,'Combo/package name');
  ssaLineTotal(t.qty,x.rate,x.discountType,x.discount);
}
function ssaHeader(t){return [t.date,t.party,t.salesperson,t.deliveryName,t.sale.label,t.sale.time];}
function ssaValidateGroups(stock){
  const groups=new Map(),origins=new Map();
  stock.history.filter(h=>ssaOrigin(h)).forEach(h=>{if(!origins.has(h.entityId))origins.set(h.entityId,[]);origins.get(h.entityId).push(h.after);});
  stock.transactions.forEach(t=>{
    if(origins.get(t.id)?.some(o=>!t.sale||o.sale.id!==t.sale.id||o.productId!==t.productId))throw new Error('Saved Sale identity / product cannot be stripped or reassigned. Complete Sale Edit use karein.');
    if(t.sale===undefined)return;const id=t.sale.id;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(t);
  });
  for(const rows of groups.values()){
    if(rows.length>SSA_MAX_LINES||rows.some(t=>syncStable(ssaHeader(t))!==syncStable(ssaHeader(rows[0]))))throw new Error('Ek priced Sale ki date/time, party, roles aur package common hone chahiye; complete Sale Edit karein.');
    ssaTotals(rows);
  }
}
function ssaLegacyWrite(input){
  if(input.sale!==undefined||input.id&&stkData().transactions.find(t=>t.id===input.id)?.sale)throw new Error('Priced Sale ko complete Sale Edit se badlein; individual writer pricing/group silently change nahi karega.');
}
function ssaProtectDelete(t){if(t?.sale)throw new Error('Yeh saved priced Sale ka item hai. History mein complete Sale Delete use karein; partial deletion nahi hui.');}
function ssaProtectProductDelete(id){if(stkData().transactions.some(t=>t.productId===id&&t.sale))throw new Error('Product saved priced Sale mein hai. Pehle History se complete Sale review/delete karein; baaki combo adhoora nahi hoga.');}
function ssaHasDraft(){return !!ssaState&&!ssaState.receipt&&UI.view==='stock'&&stkUI().tab==='sale'&&(ssaState.draft.rows.length>0||['party','label','salesperson','deliveryName','deliveryPhone','deliveryDetails','note'].some(k=>!!ssaState.draft[k]));}
function ssaMovement(next,input,old){
  const pricing=Object.hasOwn(input,'sale')?input.sale:old?.sale;
  if(old?.sale&&(pricing===undefined||pricing===null||pricing.id!==old.sale.id||next.productId!==old.productId))throw new Error('Saved priced Sale ki identity/product silently change nahi hogi. Complete Sale Edit se item replace karein.');
  if(pricing!==undefined){next.sale=syncClone(pricing);ssaValidateLine(next);}
}
function ssaTotalsExact(rows){
  let gross=0n,discount=0n,net=0n;const units=new Map();
  rows.forEach(t=>{const x=ssaLineTotal(t.qty,t.sale.rate,t.sale.discountType,t.sale.discount);gross+=BigInt(x.gross);discount+=BigInt(x.discount);net+=BigInt(x.net);units.set(t.unit,(units.get(t.unit)||0n)+BigInt(stkUnits(t.qty,false)));});
  return {gross,discount,net,units,lines:rows.length,products:new Set(rows.map(t=>t.productId)).size};
}
function ssaTotals(rows){
  const x=ssaTotalsExact(rows);return {gross:ssaBound(x.gross),discount:ssaBound(x.discount),net:ssaBound(x.net),quantities:[...x.units].map(([unit,quantity])=>({unit,qty:ssaBound(quantity)/1000})),lines:x.lines,products:x.products};
}
function ssaOrigin(h){return h.entity==='transaction'&&h.action==='create'&&h.after?.sale?{b:'sale:'+h.after.sale.id}:null;}
function ssaDescribe(rows){
  if(!rows.length||!rows.every(t=>t.sale&&t.sale.id===rows[0].sale.id))return {};
  return {sale:{id:rows[0].sale.id,label:rows[0].sale.label,time:rows[0].sale.time,...ssaTotals(rows)}};
}
function ssaSaleRows(id,stock=stkData()){return stock.transactions.filter(t=>t.sale?.id===id).sort(stkSort);}
function ssaCapacity(productId,date,stock=stkData(),excludeSale=''){
  if(!stkDate(date))return null;
  const p=stock.products.find(p=>p.id===productId);if(!p)return null;
  const rows=stock.transactions.filter(t=>t.productId===productId&&(!excludeSale||t.sale?.id!==excludeSale)).sort(stkSort);
  let balance=0,capacity=null;
  for(const t of rows){
    if(t.date>date&&capacity===null)capacity=balance;
    balance+=(t.type==='in'?1:-1)*stkUnits(t.qty,false);
    if(t.date>date)capacity=Math.min(capacity,balance);
  }
  return Math.max(0,capacity===null?balance:capacity)/1000;
}
function ssaPlan(input,data){
  stkObject(input,['id','edit','label','date','time','party','salesperson','deliveryName','deliveryPhone','deliveryDetails','note','rows'],'Sale');
  const stock=syncClone(data===undefined?stkData():data);stkValidate(stock);
  const id=input.id===undefined?ssaId():input.id;
  if(typeof id!=='string'||!/^sale1_[a-zA-Z0-9_-]{12,80}$/.test(id)||input.edit!==undefined&&typeof input.edit!=='boolean')throw new Error('Sale identity / edit mode invalid hai.');
  const previous=ssaSaleRows(id,stock),edit=input.edit===true;
  if(edit&&!previous.length)throw new Error('Saved Sale ab nahi hai. History dobara kholein; deleted sale recreate nahi hui.');
  if(!edit&&(previous.length||stock.history.some(h=>h.entity==='transaction'&&[h.before,h.after].some(t=>t?.sale?.id===id))))throw new Error('Yeh Sale pehle se recorded / edited / deleted hai. Dobara minus nahi hua; alag sale ke liye New Sale use karein.');
  if(!stkDate(input.date))throw new Error('Sale ki valid actual date chunein.');
  if(typeof input.time!=='string'||! /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.time))throw new Error('Actual Sale time HH:MM mein chunein.');
  const common={type:'sale',date:input.date};
  for(const [key,max,required]of [['party',90,true],['salesperson',90,true],['deliveryName',90,true],['deliveryPhone',35,false],['deliveryDetails',500,false],['note',500,false]])if(required||Object.hasOwn(input,key))common[key]=stkText(input[key],max,required,key);
  const label=stkName(stkText(input.label,90,false,'Combo/package name'));
  if(!Array.isArray(input.rows)||!input.rows.length||input.rows.length>SSA_MAX_LINES||Object.keys(input.rows).length!==input.rows.length)throw new Error('Sale mein 1–50 complete product lines chahiye.');
  const used=new Set(),changes=[],rows=[];
  input.rows.forEach((raw,i)=>{
    try{
      stkObject(raw,['id','productId','qty','rate','discountType','discount'],'Sale item');
      if(!stkId(raw.productId))throw new Error('Saved product chunein.');
      if(raw.id!==undefined&&!stkId(raw.id))throw new Error('Valid saved line identity required; replacement ke liye ID omit karein.');
      const old=raw.id?previous.find(t=>t.id===raw.id):null;
      if(raw.id&&(!old||used.has(raw.id)))throw new Error('Sale item missing / duplicate / deleted hai. Fresh Sale kholein.');
      if(old)used.add(old.id);
      const rate=ssaMoney(raw.rate),discountType=raw.discountType||'percent',value=raw.discount===undefined||raw.discount===''?'0':raw.discount;
      const discount=discountType==='percent'?ssaPercent(value):discountType==='amount'?ssaMoney(value,'Line discount'):(()=>{throw new Error('Percent ya rupee line discount chunein.');})();
      const t=stkMakeMovement({...old,...common,id:old?.id,productId:raw.productId,qty:raw.qty,sale:{v:1,id,label,time:input.time,rate,discountType,discount}},stock);
      if(!old){t.id='sl_'+uid()+uid();if(stock.transactions.some(x=>x.id===t.id)||stock.history.some(h=>h.entity==='transaction'&&h.entityId===t.id))throw new Error('New line identity conflict. Dobara kholein.');stock.transactions.push(t);}
      else stock.transactions[stock.transactions.findIndex(x=>x.id===old.id)]=t;
      rows.push(t);if(!old||syncStable({...old,updatedAt:0})!==syncStable({...t,updatedAt:0}))changes.push({old:old||null,next:t});
    }catch(error){throw new Error('Item '+(i+1)+': '+error.message);}
  });
  const removed=previous.filter(t=>!used.has(t.id));stock.transactions=stock.transactions.filter(t=>!removed.some(x=>x.id===t.id));
  stkValidate(stock);return {id,edit,rows:syncClone(rows),removed,changes,totals:ssaTotals(rows),valid:true};
}
function ssaSave(input,context=stkContext()){
  stkCheck(context);const plan=ssaPlan(input);stkCheck(context);
  if(!plan.changes.length&&!plan.removed.length)return {id:plan.id,ids:plan.rows.map(t=>t.id),changed:0,deleted:0,totals:plan.totals};
  return stkAtomic(stock=>{
    const gone=new Set(plan.removed.map(t=>t.id));stock.transactions=stock.transactions.filter(t=>!gone.has(t.id));
    plan.removed.forEach(t=>stkAudit(stock,'transaction',t,null,'delete','Sale item removed '+plan.id+'; full dated ledger rechecked'));
    plan.changes.forEach(({old,next})=>{
      const at=stock.transactions.findIndex(t=>t.id===next.id);if(old){if(at<0)throw new Error('Sale item badal gaya.');stock.transactions[at]=next;}else{if(at>=0)throw new Error('Sale already saved.');stock.transactions.push(next);}
      stkAudit(stock,'transaction',old,next,old?'edit':'create',(old?'Sale edited ':'Sale confirmed ')+plan.id+'; qty / INR price / discount / common party retained');
    });
    return {id:plan.id,ids:plan.rows.map(t=>t.id),changed:plan.changes.length,deleted:plan.removed.length,totals:plan.totals};
  },context,true);
}
function ssaMergeSafety(stock,base,local,remote,preference,conflict,eq){
  const ids=new Set([base,local,remote].flatMap(s=>s.transactions.filter(t=>t.sale).map(t=>t.sale.id)));
  for(const id of ids){
    const pick=s=>ssaSaleRows(id,s),b=pick(base),l=pick(local),r=pick(remote);
    if(eq(l,b)||eq(r,b)||eq(l,r))continue;
    conflict('settings.stockInventory.saleSet['+id+'].completeSale',l,r);
    const selected=preference==='remote'?r:l,oldIds=new Set(b.concat(l,r).map(t=>t.id));
    stock.transactions=stock.transactions.filter(t=>!oldIds.has(t.id)&&t.sale?.id!==id).concat(syncClone(selected));
  }
}
function ssaRecoverySafety(recovered,before,copy){
  const current=stkData(before),saved=stkData(copy),next=stkData(recovered);
  const ids=new Set([current,saved,next].flatMap(s=>s.transactions.filter(t=>t.sale).map(t=>t.sale.id)));
  for(const id of ids){
    const candidate=syncStable(ssaSaleRows(id,next));
    if(candidate!==syncStable(ssaSaleRows(id,current))&&candidate!==syncStable(ssaSaleRows(id,saved)))throw new Error('Stock recovery would combine different versions of one priced Sale. Complete Sale / JSON safety copies compare karein; partial prices / removed items silently restore nahi hue.');
  }
}
function ssaConnectSales(books,connect){
  const groups=new Map();books.forEach(s=>s.transactions.filter(t=>t.sale).forEach(t=>{if(!groups.has(t.sale.id))groups.set(t.sale.id,new Set());groups.get(t.sale.id).add(t.productId);}));groups.forEach(ids=>connect([...ids]));
}
function ssaAuditValue(x){return x?'Sale '+x.id+' · '+(x.label||'Custom sale')+' · '+x.time+' · ₹'+ssaRupees(x.rate)+'/unit · '+(x.discountType==='percent'?ssaInputMoney(x.discount)+'%':'₹'+ssaRupees(x.discount)+' per line'):'—';}
/* v3.43 STOCK SALE CORE END */
