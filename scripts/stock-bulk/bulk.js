/* v3.44 BULK PASTE HELPERS BEGIN
   Deterministic, local corrections only. Whitelisted header mistakes and
   uniquely typed cells are repairable; numeric OCR, packing conversions and
   ambiguous facts are not. Uses the ONE existing matcher and stock ledger. */
const SBP_FIELD_ALIASES=Object.freeze({
  'productname':'name','itemname':'name','item description':'name','product description':'name','description':'name',
  'prodcut':'name','prouduct':'name','itme':'name','nmae':'name',
  'quanity':'qty','quntity':'qty','qunatity':'qty','quantiy':'qty','qnt':'qty','qt':'qty','received qty':'qty','received quantity':'qty','receipt qty':'qty','in qty':'qty',
  'unti':'unit','uinit':'unit','units':'unit','unit of measure':'unit','unit of measurement':'unit',
  'receipt date':'date','received date':'date','stock date':'date','dt':'date','movement type':'type','entry type':'type',
  's no':'__serial','sr no':'__serial','sl no':'__serial','serial':'__serial','serial no':'__serial','serial number':'__serial','#':'__serial'
});
function sbpField(value){
  const key=stkKey(value).replace(/[_\-.]/g,' ').replace(/\s+/g,' ').trim();
  if(Object.hasOwn(SAP_FIELDS,key))return SAP_FIELDS[key];
  if(Object.hasOwn(SBP_FIELD_ALIASES,key))return SBP_FIELD_ALIASES[key];
  const unit=/^(qty|quantity|quanity|received qty)\s*\(([^()]{1,18})\)$/.exec(key);
  if(unit)return 'qty';return undefined;
}
function sbpHeaderUnit(value,stock){
  const match=/\(([^()]{1,18})\)\s*$/.exec(value);
  return sbpField(value)==='qty'&&match&&sbpKnownUnit(match[1],stock)?match[1]:'';
}
function sbpKnownUnit(value,stock){
  if(typeof value!=='string'||!value.trim()||value.length>18)return false;
  return [...STU_UNITS,...Object.keys(SAP_UNIT_ALIASES),...stock.products.map(p=>p.unit)].some(u=>sapUnit(u)===sapUnit(value));
}
function sbpQuantity(value,stock){
  const number='[+-]?\\s*\\d[\\d,]*(?:\\.\\d+)?',raw=String(value??'').trim();
  let match=new RegExp('^('+number+')\\s*(.+)$','u').exec(raw);
  if(match&&sbpKnownUnit(match[2],stock))return {qty:match[1],unit:match[2]};
  match=new RegExp('^(.+?)\\s+('+number+')$','u').exec(raw);
  if(match&&sbpKnownUnit(match[1],stock))return {qty:match[2],unit:match[1]};
  return null;
}
function sbpNumeric(value){return /^[+-]?\s*\d[\d,]*(?:\.\d+)?$/.test(String(value??'').trim());}
function sbpDateShape(value){return /^(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}(?:[-/.]\d{4})?|\d{1,2}\s+[a-z]+(?:\s+\d{4})?)$/i.test(String(value??'').trim());}
function sbpRepair(mapped,stock){
  const corrections=[];
  if(sbpKnownUnit(mapped.qty,stock)&&sbpNumeric(mapped.unit)){
    [mapped.qty,mapped.unit]=[mapped.unit,mapped.qty];corrections.push('Misplaced Qty / Unit cells safely swapped; numeric quantity and known unit are unambiguous.');
  }
  if(sapType(mapped.date||'')&&sbpDateShape(mapped.type)){
    [mapped.date,mapped.type]=[mapped.type,mapped.date];corrections.push('Misplaced Date / Type cells safely swapped; source values retained.');
  }
  return corrections;
}
function sbpColumns(raw,stock){
  // An unheaded row is accepted ONLY when all nonempty cells have one unique
  // interpretation. Two numbers, names, units, dates or types remain unresolved.
  for(const delimiter of ['\t','|',';',',']){
    if(!raw.includes(delimiter))continue;
    let cells;try{const rows=sapCSV(raw,delimiter);if(rows.length!==1)continue;cells=rows[0];}catch(error){continue;}
    if(delimiter==='|'){if(!cells[0])cells.shift();if(!cells.at(-1))cells.pop();}
    if(cells.length<2||cells.length>6||cells.every(c=>sbpField(c)))continue;
    const row={},names=[];let conflict=false,evidence=0;
    for(const cell of cells){
      if(!cell){conflict=true;continue;}
      const pair=sbpQuantity(cell,stock);let field='',value=cell;
      if(pair){if(row.qty!==undefined||row.unit!==undefined)conflict=true;row.qty=pair.qty;row.unit=pair.unit;evidence+=2;continue;}
      if(sbpNumeric(cell))field='qty';else if(sbpKnownUnit(cell,stock))field='unit';else if(sbpDateShape(cell))field='date';else if(sapType(cell))field='type';
      if(field){evidence++;if(row[field]!==undefined)conflict=true;row[field]=value;}else names.push(cell);
    }
    if(!conflict&&names.length===1&&row.qty!==undefined&&row.unit){row.product=names[0];return {row,correction:'Headerless columns mapped by unique product / quantity / known unit'+(row.date?' / date':'')+(row.type?' / movement':'')+'.'};}
    if(cells.length>=3&&evidence>=2)return {error:'Copied columns have more than one possible mapping or a blank / missing cell. Correct this row; no column shift was guessed.'};
  }
  return null;
}
function sbpOptions(options={}){
  stkObject(options,['mode','year','date','type','unit','party','supplier','salesperson','deliveryName','purpose','reference','sameDay','countConfirmed','matches','fixes','separate','included','origin'],'Bulk Paste options');
  if(options.mode!==undefined&&options.mode!=='bulk-in')throw new Error('Bulk Item Add sirf incoming stock ke liye hai.');
  return {...options,mode:'bulk-in'};
}
function sbpOpen(){sapOpen('bulk-in');}
async function sbpSource(source,fix,options,stock,recorded){
  if(!fix.row)return source;
  if(recorded.length)throw new Error('Is item ki movement pehle save ho chuki hai. Puri row replace nahi hogi; sirf bachi hui movement ke individual fields correct karein.');
  const childOptions={...options,fixes:{},matches:{},included:{},separate:{}};
  const parsed=sapParse(fix.row,childOptions,stock);
  if(parsed.blocks.length!==1||parsed.issues.length||parsed.tags.length||parsed.phone||parsed.declaredCount!==null)throw new Error('Row correction mein sirf ISI ek product ki complete row / labelled details likhein. Multiple items / totals / footer yahan nahi.');
  const corrected=parsed.blocks[0];
  if(Math.max(1,corrected.events.length)!==Math.max(1,source.events.length))throw new Error('Row correction se movement lines add / remove nahi hongi. Isi item ki existing movement lines correct karein; real extra receipts ke liye Agla paste use karein.');
  const context={...source.context,...parsed.context,...corrected.context};
  const events=corrected.events.map((event,i)=>({...event,date:event.date||context.date||source.events[i]?.date||'',type:event.type||context.type||source.events[i]?.type||'',unit:event.unit||corrected.unit||source.events[i]?.unit||source.unit||''}));
  return {...corrected,index:source.index,line:source.line,unit:corrected.unit||source.unit,events,context,raw:source.raw+'\nExplicit corrected row: '+fix.row,corrections:[...source.corrections,...corrected.corrections,'Aapki corrected row lagi; original source, clear date / unit facts aur source identity retained.']};
}
function sbpHasCandidates(match){return !!(match.suggestions?.length||match.candidates?.length);}
async function sbpProducts(plan,stock,options,staged,fail){
  const active=plan.blocks.filter(b=>!b.rows.length),groups=new Map();
  const family=name=>stfFamily(ssxName(name)).split(' ').filter(w=>!['plastic','wood','wooden','leather','steel','brass','rubber','aluminium','aluminum','round','square','triangular','original','copy','good','premium','medium'].includes(w)).join(' ');
  for(const b of active){
    if(!b.name||!b.unit||b.issues.some(i=>['name','unit','row'].includes(i.code)))continue;
    b.match=sapMatch(b.name,b.unit,stock);
    if(b.match.id&&b.match.method==='fuzzy'&&!Object.hasOwn(options.matches,b.index)){
      const selected=stock.products.find(p=>p.id===b.match.id),rivals=active.filter(c=>c!==b&&c.name&&c.name.length<=90&&c.unit===b.unit&&!c.issues.some(i=>['name','unit','row'].includes(i.code))&&ssxScore(b.name,c.name).autoScore>=.55&&!sapVariant(ssxName(b.name),ssxName(c.name))&&family(c.name)&&family(c.name)===family(selected.name)&&sapVariant(ssxName(selected.name),ssxName(c.name)));
      if(rivals.length){b.batchCandidates=rivals.map(c=>({index:c.index,name:c.name,unit:c.unit}));fail(b,'batch','Saved product aur isi paste ka doosra explicit variant dono is generic naam se milte hain. Actual product ek baar choose karein.','product');continue;}
    }
    b.choice=Object.hasOwn(options.matches,b.index)?options.matches[b.index]:b.match.id||(!sbpHasCandidates(b.match)?'__new__':'');
    if(b.choice!=='__new__')continue;
    if(stock.products.some(p=>stmKey(p.name)===stmKey(b.name))){fail(b,'product','Isi naam ka saved product hai. Doosri unit / duplicate product auto-create nahi hoga.','product');continue;}
    if(stock.history.some(h=>h.entity==='product'&&[h.before,h.after].some(p=>p&&stmKey(p.name)===stmKey(b.name)))){fail(b,'product','Is naam ka product audit history mein hai. Deleted / renamed product auto-recreate nahi hoga; History / restore use karein.','product');continue;}
    if(!b.events.every(e=>e.type==='in'&&e.date)){fail(b,'product','Naya product sirf clear dated Stock In se banega. Outgoing ke liye actual saved product chunein.','product');continue;}
    // Invalid rows may later MATCH a valid new item, but may not establish a
    // guessed spelling / unit / identity for otherwise complete rows.
    if(b.issues.length||b.events.some(e=>e.qty===null))continue;
    const key=JSON.stringify([stmKey(b.name),b.unit]);
    if(!groups.has(key))groups.set(key,{id:'batch_'+b.index,name:b.name,unit:b.unit,blocks:[]});
    groups.get(key).blocks.push(b);
  }
  const nodes=[...groups.values()],blocked=new Set(),edges=new Map(nodes.map(n=>[n.id,new Set()]));
  const conflict=(node,others,message)=>{blocked.add(node.id);for(const b of node.blocks){b.batchCandidates=others.flatMap(n=>n.blocks.map(x=>({index:x.index,name:x.name,unit:x.unit})));fail(b,'batch',message,'product');}};
  const ranks=new Map(nodes.map(node=>[node.id,ssxRank(node.name,node.unit,{...stock,products:nodes.filter(n=>n!==node),history:[]})]));
  // Inspect ALL future siblings before making any choice. A generic source is
  // not allowed to become the canonical product just because it appeared first.
  const generic=new Set();
  for(const node of nodes){
    const eligible=ranks.get(node.id).filter(c=>c.eligible);
    if(eligible.some((c,i)=>eligible.slice(i+1).some(d=>family(c.name)&&family(c.name)===family(d.name)&&sapVariant(ssxName(c.name),ssxName(d.name)))))generic.add(node.id);
  }
  for(const node of nodes){
    const others=nodes.filter(n=>n!==node),all=ranks.get(node.id);
    if(generic.has(node.id)){conflict(node,others.filter(n=>all.some(c=>c.id===n.id&&c.eligible)),'Isi paste mein is naam ke multiple model / colour / material variants hain. Actual product choose / correct karein; generic naam se variant guess nahi hoga.');continue;}
    const ranked=all.filter(c=>!generic.has(c.id)),compatible=ranked.filter(c=>c.eligible&&c.autoScore>=STF_MIN);
    const unitConflict=ranked.filter(c=>!c.sameUnit&&!c.variant&&c.autoScore>=STF_MIN);
    if(unitConflict.length){conflict(node,others.filter(n=>unitConflict.some(c=>c.id===n.id)),'Isi paste mein similar naam ki alag units hain. Box / pcs convert ya same-name duplicate create nahi hoga; actual name / unit clear karein.');continue;}
    const review=ranked.filter(c=>c.eligible&&c.autoScore<STF_MIN);
    if(!compatible.length&&review.length&&!node.blocks.every(b=>options.matches[b.index]==='__new__')){conflict(node,others.filter(n=>review.some(c=>c.id===n.id)),'Isi paste mein initials / below-75% close name hai. Saved product ki tarah yahan bhi actual identity clear karein; possible duplicate auto-create nahi hoga.');continue;}
    compatible.forEach(c=>edges.get(node.id).add(c.id));
  }
  const visited=new Set();
  for(const node of nodes){
    if(visited.has(node.id)||blocked.has(node.id))continue;
    const component=[],queue=[node];
    while(queue.length){const next=queue.pop();if(visited.has(next.id)||blocked.has(next.id))continue;visited.add(next.id);component.push(next);for(const id of edges.get(next.id))queue.push(nodes.find(n=>n.id===id));}
    const clique=component.every(a=>component.every(b=>a===b||edges.get(a.id).has(b.id)&&edges.get(b.id).has(a.id)));
    if(!clique){component.forEach(n=>conflict(n,component.filter(x=>x!==n),'Isi paste mein overlapping close names hain, lekin har naam ek hi product ka safe 75%+ match nahi. Actual names correct karein; transitive fuzzy duplicates nahi banenge.'));continue;}
    // A literal, deterministic source spelling is kept; no invented brand/model.
    const canonical=[...component].sort((a,b)=>ssxName(b.name).length-ssxName(a.name).length||stkKey(a.name).localeCompare(stkKey(b.name),'en')||a.name.localeCompare(b.name,'en'))[0],name=canonical.name,unit=canonical.unit;
    const id='sinp1_'+await stmHash(JSON.stringify([stkKey(name),unit]));
    if(stock.products.some(p=>p.id===id)){component.forEach(n=>conflict(n,[],'Product identity conflict; fresh inventory / History check karein.'));continue;}
    const blocks=component.flatMap(n=>n.blocks),date=blocks.flatMap(b=>b.events.map(e=>e.date)).sort()[0],now=Date.now();
    const product={id,name,unit,date,minQty:0,photoId:'',note:'Created from Smart / Bulk Paste Stock In; no opening movement',createdAt:now,updatedAt:now};staged.set(id,product);
    blocks.forEach(b=>{b.product=product;b.newProduct=true;if(component.length>1)b.corrections.push('Same-paste safe name match: '+b.name+' → '+name+'; one new product, separate valid quantities.');});
  }
  const pool={...stock,products:stock.products.concat([...staged.values()])};
  for(const b of active){
    if(b.rows.length||b.issues.some(i=>['name','unit','row','batch'].includes(i.code)))continue;
    if(!b.product){
      const match=b.choice==='__new__'?sapMatch(b.name,b.unit,pool):b.match;
      if(!match)continue;
      const chosen=b.choice==='__new__'?match.id:b.choice;
      b.product=pool.products.find(p=>p.id===chosen)||null;
      if(b.product&&staged.has(b.product.id))b.newProduct=true;
      if(!b.product){if(!b.issues.length||b.choice!=='__new__')fail(b,'product',b.choice&&b.choice!=='__new__'?'Selected product ab nahi hai. Fresh inventory check karein.':match.kind,'product');continue;}
      if(match.method==='fuzzy'&&match.id===b.product.id)b.corrections.push(match.percent+'% naam match: '+b.name+' → '+b.product.name);
    }
    if(sapUnit(b.product.unit)!==b.unit){fail(b,'unit','Source '+b.unit+' / saved '+b.product.unit+' — unit conflict. Koi conversion nahi hogi.','unit');b.product=null;continue;}
    b.productId=b.product.id;b.productName=b.product.name;
    if(b.match?.method==='fuzzy'&&b.match.id===b.product.id&&!b.corrections.some(c=>c.includes('% naam match')))b.corrections.push(b.match.percent+'% naam match: '+b.name+' → '+b.product.name);
  }
}
async function sbpOpeningSnapshot(product,stock,openings){
  if(openings.length||stock.history.some(h=>h.entity==='transaction'&&[h.before,h.after].some(t=>t?.productId===product.id&&t.source==='opening')))return true;
  // A reason string alone is NOT proof of a zero-opening creator. Require its
  // deterministic product identity, actual creator snapshot and corresponding
  // audited first receipt (retained even when later edited / deleted). Ambiguous
  // imported history conservatively keeps the normal opening confirmation.
  const creators={
    'Smart Paste: clear Stock In, new product; no opening movement':['Created from Smart Paste Stock In; no opening movement','Created from Smart / Bulk Paste Stock In; no opening movement'],
    'Reviewed Stock In list: new product, no opening movement':['Created from reviewed Stock In list; no opening movement']
  };
  for(const h of stock.history){
    const p=h.after;
    if(h.entity!=='product'||h.entityId!==product.id||h.action!=='create'||h.before!==null||!p||!Object.hasOwn(creators,h.reason)||!creators[h.reason].includes(p.note)||p.minQty!==0||p.photoId!==''||p.createdAt!==p.updatedAt||p.createdAt!==product.createdAt||p.date!==product.date||p.unit!==product.unit)continue;
    if(p.id!=='sinp1_'+await stmHash(JSON.stringify([stkKey(p.name),p.unit])))continue;
    if(stock.history.some(receipt=>{const t=receipt.after,m=stmMeta(receipt);return !!m&&receipt.before===null&&receipt.sequence>h.sequence&&t.productId===p.id&&t.productName===p.name&&t.unit===p.unit&&t.date===p.date&&t.type==='in'&&t.source==='manual'&&t.id.startsWith('smsg1_')&&sapUnit(m.u)===sapUnit(p.unit)&&(h.reason.startsWith('Smart Paste:')?m.s==='sap1':m.s===undefined);}))return false;
  }
  return true;
}
function sbpChanges(stock,plan){
  const balances=stkLedger(stock).balances,changes=new Map();
  for(const row of plan.rows.filter(r=>r.action==='new')){
    if(!changes.has(row.productId))changes.set(row.productId,{productId:row.productId,name:row.productName,unit:row.unit,beforeUnits:balances.get(row.productId)||0,inUnits:0,outUnits:0,newProduct:plan.newProducts.some(p=>p.id===row.productId)});
    const change=changes.get(row.productId),key=row.type==='in'?'inUnits':'outUnits';change[key]+=stkUnits(row.qty,false);
  }
  // Derived totals can legitimately exceed the PER-MOVEMENT nine-digit limit.
  // Keep ledger-scale integers throughout; never reparse a running total as qty.
  return [...changes.values()].map(({beforeUnits,inUnits,outUnits,...change})=>({...change,before:beforeUnits/STK_SCALE,inQty:inUnits/STK_SCALE,outQty:outUnits/STK_SCALE,after:(beforeUnits+inUnits-outUnits)/STK_SCALE}));
}
/* v3.44 BULK PASTE HELPERS END */
