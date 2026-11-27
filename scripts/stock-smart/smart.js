/* v3.42 SMART STOCK PASTE BEGIN
   Local, bounded paste-and-process automation. ONLY the deliberately opened
   Smart Paste surface auto-saves a user paste. Existing review / OCR / links
   stay review-only. Clear facts may be normalised; dates, quantities, units,
   variant identities, missing roles and opening inclusion are NEVER invented.
*/
const SAP_MAX_TEXT=20000, SAP_MAX_ITEMS=50;
const SAP_UNIT_ALIASES=Object.freeze({boxes:'box',box:'box',bx:'box',bxs:'box',boex:'box',pcs:'pcs',pc:'pcs',ps:'pcs',piece:'pcs',pieces:'pcs',pcss:'pcs',sets:'set',set:'set',rolls:'roll',roll:'roll',bundles:'bundle',bundle:'bundle',packets:'packet',packs:'pack',cartons:'carton',pairs:'pair',bags:'bag',bottles:'bottle',cans:'can',drums:'drum',tables:'table',units:'unit',kgs:'kg',kilogram:'kg',kilograms:'kg',grams:'g',gram:'g',litres:'litre',liters:'litre',liter:'litre',meters:'metre',meter:'metre',metres:'metre',ft:'feet',foot:'feet',inches:'inch','बॉक्स':'box','बाक्स':'box','डिब्बा':'box','डिब्बे':'box','पीस':'pcs','नग':'pcs','सेट':'set','रोल':'roll','बंडल':'bundle','किलो':'kg','किलोग्राम':'kg','ग्राम':'g'});
const SAP_FIELDS=Object.freeze({product:'name',productname:'name','product name':'name',item:'name','item name':'name',name:'name','सामान':'name','प्रोडक्ट':'name',quantity:'qty',qty:'qty',qnty:'qty','मात्रा':'qty',unit:'unit',uom:'unit','इकाई':'unit',date:'date',dated:'date',tarikh:'date',tareekh:'date','तारीख':'date','दिनांक':'date',type:'type',movement:'type',action:'type',customer:'party',buyer:'party',party:'party',supplier:'supplier',vendor:'supplier',salesperson:'salesperson','sales person':'salesperson',salesman:'salesperson','sold by':'salesperson',deliveryname:'deliveryName',delivery:'deliveryName','delivery by':'deliveryName','delivery person':'deliveryName',receiver:'deliveryName','received by':'deliveryName',purpose:'purpose',reason:'purpose',reference:'reference',ref:'reference','bill no':'reference','invoice no':'reference',prior:'prior',previous:'prior','previous stock':'prior','previous balance':'prior','pichle bache':'prior','पिछले बचे':'prior',available:'available',balance:'available','available stock':'available','बचा':'available','बचे':'available'});
let sapEditor=null;
function sapUnit(value){const key=stkName(value).normalize('NFKC').toLocaleLowerCase('en').replace(/\.$/,'');return Object.hasOwn(SAP_UNIT_ALIASES,key)?SAP_UNIT_ALIASES[key]:stmUnit(key);}
function sapClean(value){return String(value).normalize('NFKC').replace(/[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g,'').replace(/[०-९]/g,d=>String('०१२३४५६७८९'.indexOf(d))).replace(/[−–—]/g,'-').replace(/\r\n?/g,'\n');}
function sapIssue(code,message,field=''){return {code,message,field};}
function sapNumber(value,zero=false){
  let text=sapClean(value).trim(),sign='';
  if(/^[+-]/.test(text)){sign=text[0];text=text.slice(1).trim();}
  const original=text;
  if(text.includes(',')){
    if(!/^(?:\d{1,3}(?:,\d{3})+|\d{1,2}(?:,\d{2})*,\d{3})(?:\.\d{1,3})?$/.test(text))throw new Error('Quantity mein comma grouping unclear hai; decimal / quantity confirm karein.');
    text=text.replace(/,/g,'');
  }
  return {qty:stkQty(text,zero),sign,corrected:text!==original};
}
function sapDate(value,year){
  const raw=sapClean(value).trim().replace(/^(?:date|dated|दिनांक|तारीख)\s*[:=-]?\s*/i,'');let date;
  const iso=/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(raw),local=/^(\d{1,2})[-/.](\d{1,2})(?:[-/.](\d{4}))?$/.exec(raw);
  const months={jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,jun:6,june:6,jul:7,july:7,aug:8,august:8,sep:9,sept:9,september:9,oct:10,october:10,nov:11,november:11,dec:12,december:12};
  const named=/^(\d{1,2})\s*[- /]?\s*([a-z]+)(?:\s*[- /]?\s*(\d{4}))?$/i.exec(raw);
  if(iso)date=iso[1]+'-'+iso[2].padStart(2,'0')+'-'+iso[3].padStart(2,'0');
  else if(local||named){const m=local||named,y=m[3]||year;if(!/^\d{4}$/.test(String(y||'')))throw new Error('Message ka saal clear nahi hai. Ek baar Year confirm karein; aaj ka saal guess nahi hoga.');const month=local?m[2]:String(months[m[2].toLowerCase()]||'');date=String(y)+'-'+month.padStart(2,'0')+'-'+m[1].padStart(2,'0');}
  else throw new Error('Actual date clear nahi hai. DD/MM/YYYY, YYYY-MM-DD ya 25 Nov 2026 likhein.');
  if(!stkDate(date))throw new Error('Invalid calendar date: '+raw);return date;
}
function sapType(value){
  const s=stkKey(sapClean(value)).replace(/[._-]/g,' ').replace(/\s+/g,' ');
  if(/^(?:stock\s*)?(?:in|received|receive|recieved|recevied|receipt|incoming|purchase|purchased|aaye|aye|aay[aei]|aai|aayi|aya|aaya|आए|आये|आया|आई|प्राप्त|खरीद)$/.test(s))return 'in';
  if(/^(?:stock\s*)?(?:sale|sales|sold|becha|beche|bika|biki|बिक्री|बेचा|बेचे|बिका)$/.test(s))return 'sale';
  if(/^(?:stock\s*)?(?:out|used|usage|consumed|damage|damaged|office transfer|transfer|निकासी|खर्च|इस्तेमाल)$/.test(s))return 'out';
  if(/^(?:take|gaye|gai|gaya|gayi|dispatch|dispatched|sent|गए|गये|गया|गई)$/.test(s))return 'take';return '';
}
function sapVariant(a,b){
  const old=stfVariant(a,b);if(old)return old;
  const groups=[['aluminium','wood','plastic','leather','steel','brass','rubber'],['round','square','triangular'],['original','copy'],['good','medium','premium']];
  const words=s=>stfName(s).split(' ').map(w=>({aluminum:'aluminium',wooden:'wood'}[w]||w)),left=words(a),right=words(b);
  for(const group of groups){const x=[...new Set(left.filter(w=>group.includes(w)))].sort(),y=[...new Set(right.filter(w=>group.includes(w)))].sort();if(x.length&&y.length&&x.join('|')!==y.join('|'))return 'material / shape / quality / explicit variant unclear';}
  return '';
}
function sapOptions(options={}){
  stkObject(options,['year','date','type','unit','party','supplier','salesperson','deliveryName','purpose','reference','sameDay','countConfirmed','matches','fixes','separate','included','origin'],'Smart Paste options');
  const result={};
  for(const [key,max]of [['year',4],['date',30],['type',16],['unit',18],['party',90],['supplier',90],['salesperson',90],['deliveryName',90],['purpose',250],['reference',80],['origin',64]])if(options[key]!==undefined)result[key]=stkText(options[key],max,false,key);
  if(result.origin&&!/^[a-f0-9]{64}$/.test(result.origin))throw new Error('Smart Paste source identity invalid hai. Fresh paste karein.');
  if(result.year&&!/^\d{4}$/.test(result.year))throw new Error('Year chaar digits mein chahiye.');
  if(result.type&&!['in','out','sale'].includes(result.type))throw new Error('Valid Stock In / Out / Sale type chunein.');
  for(const key of ['sameDay','countConfirmed']){if(options[key]!==undefined&&typeof options[key]!=='boolean')throw new Error(key+' boolean hona chahiye.');result[key]=options[key]===true;}
  for(const key of ['matches','fixes','separate','included']){const value=options[key]||{};stkObject(value,Array.from({length:SAP_MAX_ITEMS},(_,i)=>String(i)),key);result[key]=syncClone(value);}
  Object.values(result.matches).forEach(v=>{if(typeof v!=='string'||v!==''&&v!=='__new__'&&!stkId(v))throw new Error('Saved product choice invalid hai.');});
  Object.values(result.included).forEach(v=>{if(typeof v!=='boolean')throw new Error('Included / skip confirmation boolean honi chahiye.');});
  Object.values(result.separate).forEach(v=>{if(typeof v!=='boolean')throw new Error('Separate delivery confirmation boolean honi chahiye.');});
  Object.values(result.fixes).forEach(fix=>{
    stkObject(fix,['name','unit','date','type','qty','prior','available','reference','events'],'Smart item correction');
    for(const [key,max]of [['name',90],['unit',18],['date',30],['type',16],['qty',24],['prior',24],['available',24],['reference',80]])if(fix[key]!==undefined&&typeof fix[key]!=='string')throw new Error('Correction fields text honi chahiye.');else if(fix[key]!==undefined)stkText(fix[key],max,false,key);
    if(fix.type&&!['in','out','sale'].includes(fix.type))throw new Error('Correction ka type invalid hai.');
    if(fix.events!==undefined){stkObject(fix.events,Array.from({length:8},(_,i)=>String(i)),'event corrections');Object.values(fix.events).forEach(e=>{stkObject(e,['qty','date','type'],'event correction');for(const [k,v]of Object.entries(e)){if(typeof v!=='string')throw new Error('Event correction text honi chahiye.');stkText(v,k==='date'?30:24,false,k);}if(e.type&&!['in','out','sale'].includes(e.type))throw new Error('Event correction type invalid hai.');});}
  });return result;
}
function sapCSV(text,delimiter){
  const rows=[];let row=[],cell='',quoted=false,ended=false,start=0,lineNumber=1,recordLine=1;
  const field=()=>{row.push(cell.trim());cell='';ended=false;};
  const line=end=>{field();if(row.some(Boolean)){Object.defineProperties(row,{raw:{value:text.slice(start,end)},line:{value:recordLine}});rows.push(row);}row=[];start=end+1;recordLine=lineNumber+1;if(rows.length>500)throw new Error('Table bahut badi hai; maximum 50 Stock items per paste.');};
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;ended=true;}}else{cell+=c;if(c==='\n')lineNumber++;}}
    else if(c===delimiter)field();
    else if(c==='\n'){line(i);lineNumber++;}
    else if(c==='"'){if(cell||ended)throw new Error('Quoted table format unclear hai.');quoted=true;}
    else if(ended&&!/\s/.test(c))throw new Error('Quoted column ke baad separator chahiye.');
    else if(!ended)cell+=c;
  }
  if(quoted)throw new Error('Table ka closing quote missing hai.');line(text.length);return rows;
}
function sapParse(text,options={},data,depth=0){
  if(!Number.isInteger(depth)||depth<0||depth>SAP_MAX_ITEMS)throw new Error('Bahut zyada mixed sections hain; maximum 50 Stock items ki complete list paste karein.');
  options=sapOptions(options);if(typeof text!=='string'||!text.trim()||text.length>SAP_MAX_TEXT||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text))throw new Error('1–20,000 characters ka complete Stock text paste karein.');
  const stock=data===undefined?stkData():data,clean=sapClean(text),result={text,format:'text',blocks:[],issues:[],warnings:[],corrections:[],ignored:[],context:{},tags:[],phone:'',declaredCount:null};
  const context=result.context,add=(code,message,field)=>result.issues.push(sapIssue(code,message,field));
  const make=(name,raw,line,extra={})=>({index:result.blocks.length,name:stkName(name),raw,line,events:[],prior:null,available:null,unit:context.unit||'',context:{...context},issues:[],corrections:[],...extra});
  const push=block=>{if(!block)return;if(block.events.length>8)throw new Error('Ek product ke maximum 8 movement lines allowed hain.');if(result.blocks.length>=SAP_MAX_ITEMS)throw new Error('Maximum 50 items per paste.');block.index=result.blocks.length;result.blocks.push(block);};
  const fieldKey=s=>{const key=stkKey(s).replace(/[_-]/g,' ').replace(/\s+/g,' ');return Object.hasOwn(SAP_FIELDS,key)?SAP_FIELDS[key]:undefined;};
  const objectRow=(row,i,common={})=>{
    if(!row||typeof row!=='object'||Array.isArray(row))throw new Error('Table / JSON item object chahiye.');
    const mapped={},unknown=[];for(const [key,value]of Object.entries(row)){const field=fieldKey(key);if(!field){unknown.push(key);continue;}if(Object.hasOwn(mapped,field))unknown.push('duplicate '+key);if(value!==null&&!['string','number'].includes(typeof value))unknown.push('invalid '+key);mapped[field]=value==null?'':String(value);}
    const quantity=/^([+-]?\s*\d[\d,]*(?:\.\d+)?)\s*(.+)$/.exec(mapped.qty||'');let quantityUnit='';
    if(quantity&&[...STU_UNITS,...Object.keys(SAP_UNIT_ALIASES),...stock.products.map(p=>p.unit)].some(u=>sapUnit(u)===sapUnit(quantity[2]))){quantityUnit=quantity[2];mapped.qty=quantity[1];}
    const block=make(mapped.name||'',JSON.stringify(row),i+1,{context:{...common},unit:mapped.unit||quantityUnit||common.unit||'',prior:mapped.prior??null,available:mapped.available??null});
    if(quantityUnit&&(mapped.unit||common.unit)&&sapUnit(quantityUnit)!==sapUnit(mapped.unit||common.unit))block.issues.push(sapIssue('unit','Quantity aur labelled / common unit alag hain. Actual unit confirm karein.','unit'));
    for(const key of ['party','supplier','salesperson','deliveryName','purpose','reference'])if(mapped[key])block.context[key]=mapped[key];
    block.events.push({qty:mapped.qty??'',unit:mapped.unit||quantityUnit||common.unit||'',date:mapped.date||common.date||'',type:mapped.type||common.type||'',raw:JSON.stringify(row)});
    if(unknown.length)block.issues.push(sapIssue('columns','Unknown / duplicate columns: '+unknown.join(', ')));
    push(block);
  };
  if(/^\s*[\[{]/.test(clean)&&!/^\s*\[\d/.test(clean)){
    let input;try{input=JSON.parse(clean);}catch(error){throw new Error('JSON incomplete / invalid hai; kuch save nahi hua.');}
    result.format='json';
    if(Array.isArray(input)){if(!input.length||input.length>SAP_MAX_ITEMS)throw new Error('1–50 stock row objects chahiye.');input.forEach((row,i)=>objectRow(row,i));}
    else if(input?.format==='hisaab-stock-in'){
      const packet=sirParse(JSON.stringify(input));Object.assign(context,{date:packet.date,type:'in',supplier:packet.supplier,reference:packet.reference});packet.rows.forEach((r,i)=>objectRow({name:r.name,qty:r.quantity,unit:r.unit},i,context));
    }else throw new Error('Yeh incoming Stock row list nahi hai. Full backup / opening JSON auto-paste se import nahi hota.');
    return result;
  }
  const complete=()=>{
    if(!result.blocks.length)add('rows','Koi Stock item nahi mila. Snapshot / totals ko naya received stock nahi maana jayega.');
    if(result.declaredCount!==null&&result.declaredCount!==result.blocks.length&&!options.countConfirmed)add('count','Source total '+result.declaredCount+' items hai; '+result.blocks.length+' items mile. Poora count confirm karein.','countConfirmed');
    return result;
  };
  const mergeSection=(section,offset)=>{
    section.blocks.forEach(block=>push({...block,line:Math.max(1,block.line+offset)}));
    result.issues.push(...section.issues.filter(i=>!['rows','count'].includes(i.code)));result.warnings.push(...section.warnings);result.ignored.push(...section.ignored);result.tags.push(...section.tags);
    if(section.phone){if(result.phone&&result.phone!==section.phone)add('phone','Driver phone conflicting hai.');result.phone=section.phone;}
    if(section.declaredCount!==null){if(result.declaredCount!==null&&result.declaredCount!==section.declaredCount)add('count','Do alag total-item counts mile. Poora count confirm karein.','countConfirmed');result.declaredCount=section.declaredCount;}
    Object.assign(context,section.context);
  };
  // A copied table may sit between a date / movement header and tagged footer,
  // or between plain-text items. Parse those sections without inventing a
  // single field or treating the column header as another product.
  const physical=clean.split('\n');let tableHeader=null;
  for(let i=0;i<physical.length&&!tableHeader;i++)for(const delimiter of ['\t','|',',',';']){
    const line=physical[i];if(!line.includes(delimiter))continue;
    const keys=line.split(delimiter).filter(v=>v.trim()).map(v=>fieldKey(v.replace(/^\s*"|"\s*$/g,'')));
    if(keys.includes('name')&&keys.some(k=>['qty','prior','available'].includes(k))){tableHeader={index:i,delimiter};break;}
  }
  if(tableHeader){
    const {index,delimiter}=tableHeader,prefix=physical.slice(0,index).join('\n');
    if(prefix.trim())mergeSection(sapParse(prefix,options,stock,depth+1),0);
    const table=physical.slice(index).map(line=>delimiter==='|'?line.replace(/^\s*\|/,'').replace(/\|\s*$/,''):line).join('\n'),records=sapCSV(table,delimiter),head=records.shift(),keys=head.map(fieldKey);
    if(keys.some(k=>!k)||new Set(keys).size!==keys.length)throw new Error('Table header mein unknown / duplicate column hai. Product, Qty, Unit, Date, Type aur labelled roles use karein.');
    result.format=index?'mixed-table':delimiter==='\t'?'tsv':'table';let suffixAt=-1;
    for(let i=0;i<records.length;i++){
      const row=records[i],columns=row.map(fieldKey),repeated=columns.length===keys.length&&columns.every((k,j)=>k===keys[j]);
      if(repeated||row.every(cell=>/^:?-{2,}:?$/.test(cell))){result.ignored.push({line:index+row.line,text:row.raw,reason:'Repeated table heading / display separator'});continue;}
      if(row.length===1||columns.includes('name')&&columns.some(k=>['qty','prior','available'].includes(k))){suffixAt=i;break;}
      const object=Object.fromEntries(head.map((h,j)=>[h,row[j]||'']));objectRow(object,index+row.line-1,context);result.blocks.at(-1).raw=row.raw;
      if(row.length!==head.length)result.blocks.at(-1).issues.push(sapIssue('columns','Column count header se match nahi hai.'));
    }
    if(suffixAt>=0){
      const inherited=Object.entries(context).filter(([,v])=>v).map(([k,v])=>({deliveryName:'Delivery'}[k]||k)+': '+v),suffix=records.slice(suffixAt).map(row=>row.raw).join('\n');
      mergeSection(sapParse(inherited.concat(suffix).join('\n'),options,stock,depth+1),index+records[suffixAt].line-1-inherited.length);result.format='mixed-table';
    }
    return complete();
  }
  const unitNames=new Set([...STU_UNITS,...Object.keys(SAP_UNIT_ALIASES),...stock.products.map(p=>p.unit)]);
  const escaped=[...unitNames].filter(Boolean).sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+'));
  const unitPattern='(?:'+escaped.join('|')+')',number='[+-]?\\s*\\d[\\d,]*(?:\\.\\d+)?';
  const pairEnd=new RegExp('('+number+')\\s*('+unitPattern+')\\.?\\s*$','iu');
  const pairStart=new RegExp('^('+number+')\\s*('+unitPattern+')\\.?\\s+(?:[-:|]\\s*)?(.+)$','iu');
  const datePattern='(?:\\d{4}[-/.]\\d{1,2}[-/.]\\d{1,2}|\\d{1,2}[-/.]\\d{1,2}(?:[-/.]\\d{4})?|\\d{1,2}\\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Sept|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\\s+\\d{4})?)';
  const dateStart=new RegExp('^('+datePattern+')(?=$|\\s)(?:\\s+(?:ko\\s+)?)?(.*)$','i'),dateEnd=new RegExp('^(.*?)\\s+('+datePattern+')$','i');
  const typePattern='(?:stock[ -]*(?:in|out|sale)|office transfer|received|receive|recieved|recevied|receipt|incoming|purchased|purchase|aaye|aaya|aayi|aai|aay[aei]|aye|aya|sale[s]?|sold|becha|beche|bika|biki|out|used|usage|consumed|damaged|damage|transfer|in|gaye|gai|gaya|gayi|dispatch(?:ed)?|sent|आए|आये|आया|आई|प्राप्त|खरीद|बिक्री|बेचा|बेचे|बिका|निकासी|खर्च|इस्तेमाल|गए|गये|गया|गई)';
  const typeStart=new RegExp('^(?:aaj\\s+|today\\s+)?('+typePattern+')(?![\\p{L}\\p{M}\\p{N}])\\s*[.:=]?\\s*(.*)$','iu');
  const typeEnd=new RegExp('^(.*?)\\s+('+typePattern+')(?:\\s+(?:hai|hain|hua|hue|है|हैं))?\\s*$','iu');
  const escapedFields=Object.keys(SAP_FIELDS).sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'\\s+'));
  const inlineLabels=new RegExp('(?:^|[ |,])('+escapedFields.join('|')+')\\s*[:=]\\s*','giu');
  const wordsOnly=s=>/^[\p{L}\p{M}\p{N} ()'"&+/.\-]+$/u.test(s);
  let current=null,tagActive=false;
  const finish=()=>{push(current);current=null;};
  const lines=[];
  clean.split('\n').forEach((raw,i)=>{
    // Semicolons are row separators in informal lists, not decimal separators.
    raw.split(/\s*;\s*/).filter(Boolean).forEach(value=>lines.push({raw:value,line:i+1}));
  });
  const metricValue=value=>{
    let s=value.trim(),unit='',m=pairEnd.exec(s);
    if(m&&m.index===0)return {qty:m[1],unit:m[2]};
    const prefix=new RegExp('^('+unitPattern+')\\.?\\s+('+number+')$','iu').exec(s);
    if(prefix)return {qty:prefix[2],unit:prefix[1]};
    return {qty:s,unit};
  };
  const sameLabel=(key,a,b)=>{
    if(key==='type'&&sapType(a))return sapType(a)===sapType(b);
    if(key==='date'){try{return sapDate(a,options.year)===sapDate(b,options.year);}catch(error){}}
    return stkKey(a)===stkKey(b);
  };
  const labelledValue=(key,value,raw)=>{
    const specialises=old=>key==='type'&&sapType(old)==='take'&&['sale','out'].includes(sapType(value));
    current.labelledFields||={};
    if(current.labelledFields[key]&&!sameLabel(key,current.labelledFields[key],value)&&!specialises(current.labelledFields[key]))current.issues.push(sapIssue(key,'Labelled '+key+' do alag values mein diya hai. Actual value clarify karein.',key));
    current.labelledFields[key]=value;current.context[key]=value;current.raw+='\n'+raw;
    current.events.forEach(ev=>{
      if(ev[key+'Explicit']&&!sameLabel(key,ev[key],value)&&!specialises(ev[key]))current.issues.push(sapIssue(key,'Labelled '+key+' aur explicit movement line alag hai. Actual value clarify karein.',key));
      else{ev[key]=value;ev[key+'Explicit']=true;}
    });
  };
  for(const entry of lines){
    let line=entry.raw.trim().replace(/[ \t]+/g,' ');if(!line)continue;
    const original=line;
    const chrome=/^\[(?:\d{1,2}[:.]\d{2}[^\]]*|\d{1,2}[/.-]\d{1,2}[^\]]*)\]\s*[^:]{1,100}:\s*(.*)$/.exec(line);
    if(chrome){line=chrome[1].trim();result.ignored.push({line:entry.line,text:original.slice(0,original.length-line.length),reason:'Chat timestamp/sender is not the receipt date'});if(!line)continue;}
    if(/^(?:forwarded(?: many times)?|quoted [^:]+|photo|video(?:\s*\([^)]*\))?|image omitted|<media omitted>|\d{1,2}:\d{2}\s*(?:am|pm)?\s*[✓✔]*|[✓✔👍✅\uFE0F ]+)$/i.test(line)){result.ignored.push({line:entry.line,text:original,reason:'Chat chrome'});continue;}
    if(/^(?:Driver\s*(?:number|phone|mobile)|Delivery\s*(?:phone|number))\s*[:.-]?\s*/i.test(line)){
      finish();const phone=line.replace(/^(?:Driver\s*(?:number|phone|mobile)|Delivery\s*(?:phone|number))\s*[:.-]?\s*/i,'').trim();if(result.phone&&result.phone!==phone)add('phone','Driver phone conflicting hai.');result.phone=phone;continue;
    }
    if(tagActive&&/^[\p{L}\p{M} @~.'()-]+$/u.test(line)&&! /^(?:Driver|Delivery|Reference|Salesperson|Purpose|Date|Type|Stock|Received|Aaye|Total)\b/i.test(line)){result.tags[result.tags.length-1]+=' '+line;continue;}
    tagActive=false;
    const count=/^(?:total|कुल)\s*[:=-]?\s*(\d+)\s*(?:items?|products?|सामान)\s*$/i.exec(line);
    if(count){finish();if(result.declaredCount!==null&&result.declaredCount!==Number(count[1]))add('count','Do alag total-item counts mile. Count confirm karein.','countConfirmed');result.declaredCount=Number(count[1]);continue;}
    if(/^(?:grand\s+)?total\b|^कुल\b/i.test(line)){finish();result.warnings.push('Summary / total ko movement nahi maana: '+line);continue;}
    if(/^(?:tags?|tagged(?: members)?|cc)\s*:/i.test(line))line=line.replace(/^[^:]+:\s*/,'');
    if(line.startsWith('@')){finish();result.tags.push(line.replace(/\s+\d{1,2}:\d{2}\s*(?:am|pm)\s*[✓✔]*$/i,''));tagActive=true;continue;}
    const inline=[...line.matchAll(inlineLabels)];
    if(inline.length>=2){
      const row={},duplicate=[];inline.forEach((match,i)=>{const key=fieldKey(match[1]);if(Object.hasOwn(row,key))duplicate.push(key);row[key]=line.slice(match.index+match[0].length,inline[i+1]?.index??line.length).replace(/[ |,]+$/,'').trim();});
      if(row.name!==undefined||row.qty!==undefined){
        if(row.name===undefined&&current){
          current.raw+='\n'+original;if(row.unit!==undefined){if(current.unit&&sapUnit(current.unit)!==sapUnit(row.unit))current.issues.push(sapIssue('unit','Source mein conflicting units hain. Actual unit confirm karein.','unit'));current.unit=row.unit;}
          for(const key of ['date','type','party','supplier','salesperson','deliveryName','purpose','reference'])if(row[key]!==undefined)current.context[key]=row[key];
          if(row.qty!==undefined){const value=metricValue(row.qty);if(value.unit){if(current.unit&&sapUnit(current.unit)!==sapUnit(value.unit))current.issues.push(sapIssue('unit','Quantity aur labelled unit alag hain. Actual unit confirm karein.','unit'));current.unit=value.unit;}current.events.push({qty:value.qty,unit:row.unit||current.unit,date:row.date||current.context.date||'',type:row.type||current.context.type||'',raw:original,dateExplicit:!!row.date,typeExplicit:!!row.type});}
          for(const key of ['prior','available'])if(row[key]!==undefined)current[key]=row[key];
          if(duplicate.length)current.issues.push(sapIssue('columns','Repeated labelled fields: '+duplicate.join(', ')));
        }else{finish();const canonical=Object.fromEntries(Object.entries(row).map(([k,v])=>[({name:'product',deliveryName:'delivery'}[k]||k),v]));objectRow(canonical,entry.line-1,context);result.blocks.at(-1).raw=original;if(duplicate.length)result.blocks.at(-1).issues.push(sapIssue('columns','Repeated labelled fields: '+duplicate.join(', ')));}
      }else{for(const [key,value]of Object.entries(row)){if(current&&(current.labelled||!current.name)&&['date','type'].includes(key)){labelledValue(key,value,original);continue;}if(context[key]&&context[key]!==value&&!['date','type'].includes(key))add('context','Conflicting '+key+' mila. Actual common detail confirm karein.',key);context[key]=value;}if(duplicate.length)add('columns','Repeated labelled fields: '+duplicate.join(', '));}
      continue;
    }
    const label=/^([^:=|]{1,30})\s*[:=|]\s*(.*)$/.exec(line),field=label&&fieldKey(label[1]);
    if(field&&['name','qty','unit','prior','available'].includes(field)){
      if(field==='name'){if(current&&!current.name){current.name=stkName(label[2]);current.labelled=true;current.raw+='\n'+original;current.issues=current.issues.filter(i=>i.code!=='name');}else{finish();current=make(label[2],original,entry.line,{labelled:true});}continue;}
      if(field==='unit'&&!current){if(context.unit&&sapUnit(context.unit)!==sapUnit(label[2]))add('unit','Common header ki conflicting units hain; actual unit clarify karein.','unit');context.unit=label[2];continue;}
      if(!current){current=make('',original,entry.line);current.issues.push(sapIssue('name','Product ka naam clear nahi hai.','name'));}else current.raw+='\n'+original;
      if(field==='prior'||field==='available'){const value=metricValue(label[2]);if(current[field]!==null)current.issues.push(sapIssue('check','Ek balance check do baar diya hai.',field));current[field]=value.qty;if(value.unit){if(current.unit&&sapUnit(current.unit)!==sapUnit(value.unit))current.issues.push(sapIssue('unit','Source mein alag units hain.','unit'));current.unit=value.unit;}continue;}
      if(field==='unit'){if(current.unit&&sapUnit(current.unit)!==sapUnit(label[2]))current.issues.push(sapIssue('unit','Source mein conflicting units hain. Actual unit confirm karein.','unit'));current.unit=label[2];continue;}
      if(current.events.length)current.issues.push(sapIssue('qty','Quantity do baar mili; actual quantity confirm karein.','qty'));
      else{const value=metricValue(label[2]);if(value.unit){if(current.unit&&sapUnit(current.unit)!==sapUnit(value.unit))current.issues.push(sapIssue('unit','Quantity / field ki units alag hain.','unit'));current.unit=value.unit;}current.events.push({qty:value.qty,unit:current.unit,date:current.context.date||'',type:current.context.type||'',raw:original,dateExplicit:!!current.labelledFields?.date,typeExplicit:!!current.labelledFields?.type});}continue;
    }
    if(field&&['date','type','party','supplier','salesperson','deliveryName','purpose','reference'].includes(field)){
      if(['date','type'].includes(field)&&current&&(current.labelled||!current.name)){labelledValue(field,label[2],original);continue;}
      if(['date','type'].includes(field)&&current&&!current.events.length){if(current.context[field]&&current.context[field]!==label[2])current.issues.push(sapIssue(field,'Source mein conflicting '+field+' hai. Actual value confirm karein.',field));current.context[field]=label[2];current.raw+='\n'+original;continue;}
      const value=label[2];if(context[field]&&context[field]!==value&&['party','salesperson','deliveryName','reference'].includes(field))add('context','Conflicting '+field+' mila. Ek party / actual shared details confirm karein.',field);
      context[field]=value;
      // Explicit footer roles apply to the message, not just its last item.
      if(field==='date'||field==='type')finish();continue;
    }
    const numbered=!new RegExp('^'+datePattern+'(?:\\s|$)','i').test(line)&&/^\s*\d{1,3}\s*[.)-](?!\d)\s*/.test(line);
    if(numbered)finish();
    line=(numbered?line.replace(/^\s*\d{1,3}\s*[.)-](?!\d)\s*/,''):(/^-\s*\d/.test(line)?line:line.replace(/^[•*▪●-]\s+/, ''))).trim();
    let date='',type='',purpose='';
    const wholeEnd=pairEnd.exec(line),wholeStart=pairStart.exec(line),literalName=wholeEnd?line.slice(0,wholeEnd.index).replace(/\s*[-:=|,]\s*$/,'').trim():wholeStart?wholeStart[3]:line;
    const literal=stock.products.some(p=>stmKey(p.name)===stmKey(literalName));
    const ds=!literal&&dateStart.exec(line);if(ds&&!/^(?:mm|cm|inch(?:es)?|ft|feet|metre|meter)\b/i.test(ds[2])){date=ds[1];line=ds[2].trim();}
    const de=!date&&!literal&&dateEnd.exec(line);if(de){date=de[2];line=de[1].replace(/\s+(?:on|dated|ko|तारीख)\s*[:=-]?$/i,'').trim();}
    const ts=!literal&&typeStart.exec(line);if(ts){type=sapType(ts[1]);line=ts[2].trim();if(/office|used|usage|consumed|damage|transfer|इस्तेमाल|खर्च/i.test(ts[1]))purpose=ts[1];}
    if(!type&&!literal){const middle=new RegExp('^(.+?)\\s+('+typePattern+')\\s*[.:=]?\\s*('+number+'\\s*'+unitPattern+'\\.?)$','iu').exec(line);if(middle){type=sapType(middle[2]);line=middle[1]+' '+middle[3];}}
    const te=!literal&&typeEnd.exec(line);if(!type&&te){type=sapType(te[2]);line=te[1].trim();if(/office|used|usage|consumed|damage|transfer|इस्तेमाल|खर्च/i.test(te[2]))purpose=te[2];}
    if(!line&&type&&current&&!/^stock\b/i.test(original)&&(!current.events.length||/^(?:aaj|today)\b/i.test(original))){current.raw+='\n'+original;current.events.push({qty:'',unit:'',date:date||current.context.date||'',type,raw:original,pending:true});continue;}
    if(!line&&(date||type)){finish();if(date)context.date=date;if(type)context.type=type;if(purpose)context.purpose=purpose;continue;}
    if(date&&!type&&line&&!pairEnd.test(line)&&!pairStart.test(line)&&wordsOnly(line)&&!/(?:qty|previous|available|balance)/i.test(line)){
      finish();context.date=date;if(context.party&&stkKey(context.party)!==stkKey(line))add('party','Ek paste mein alag party headers mile. Party confirm karein ya alag message paste karein.','party');context.party=line;continue;
    }
    const metric=/^(previous(?:\s+(?:stock|balance|left))?|pichh?l[ea]\s+bach[ea]|available(?:\s+stock)?|balance|पिछले\s+बचे|बचे|बचा)\s*[:.=-]?\s*(.*)$/i.exec(line);
    if(metric){if(!current)current=make('',original,entry.line);else current.raw+='\n'+original;const field=/previous|pich|पिछले/i.test(metric[1])?'prior':'available',value=metricValue(metric[2]);if(current[field]!==null)current.issues.push(sapIssue('check','Repeated '+field+' check.',field));current[field]=value.qty;if(value.unit){if(current.unit&&sapUnit(current.unit)!==sapUnit(value.unit))current.issues.push(sapIssue('unit','Balance / movement ki units alag hain.','unit'));current.unit=value.unit;}continue;}
    // A complete saved product name (including a trailing model / size) is
    // never split into an invented quantity.
    if(!type&&stock.products.some(p=>stmKey(p.name)===stmKey(line))){finish();current=make(line,original,entry.line);if(date)current.context.date=date;continue;}
    const pair=pairEnd.exec(line);let name='',qty='',unit='';
    if(pair){
      // A packing description such as (100 Pcs) is part of the model/name.
      const before=line.slice(0,pair.index);if((before.match(/\(/g)||[]).length===(before.match(/\)/g)||[]).length){name=before.replace(/\s*[-:=|,]\s*$/,'').trim();qty=pair[1];unit=pair[2];}
    }
    if(!qty){const prefix=pairStart.exec(line);if(prefix&&!/^(?:mm|cm|inch|inches|ft|feet|metre|meter|sqm|sqft)$/i.test(prefix[2])){qty=prefix[1];unit=prefix[2];name=prefix[3].replace(/^(?:of|के|का)\s+/i,'').trim();}}
    if(!qty&&(type||current)&&/^[+-]?\s*\d[\d,]*(?:\.\d+)?$/.test(line)){qty=line;name='';}
    if(!qty){
      // Headerless simple columns (name, qty, unit), in any of these three
      // unambiguous orders. Quoted CSV uses the table path above.
      const cells=line.split(/\s*[|,]\s*/);
      if(cells.length===3){for(const [n,q,u]of [[0,1,2],[0,2,1],[2,0,1]]){if(new RegExp('^'+unitPattern+'\\.?$','iu').test(cells[u])&&/^[+-]?\d[\d,]*(?:\.\d+)?$/.test(cells[q])){name=cells[n];qty=cells[q];unit=cells[u];break;}}}
    }
    if(!qty){
      const tail=/^(.*?)\s+(?:qty\s*[:=]?\s*)?([+-]?\s*\d[\d,]*(?:\.\d+)?)$/i.exec(line);
      if(tail&&!stock.products.some(p=>stmKey(p.name)===stmKey(line))){name=tail[1].replace(/\s*[-:=|]\s*$/,'').trim();qty=tail[2];}
    }
    if(qty&&name&&/^(?:mm|cm|inch|inches|ft|feet|metre|meter|sqm|sqft)$/.test(unit)&&!type&&!/[=:|]/.test(line)&&!stock.products.some(p=>stmKey(p.name)===stmKey(name)&&sapUnit(p.unit)===sapUnit(unit))){
      finish();current=make(line,original,entry.line);if(date)current.context.date=date;current.issues.push(sapIssue('unreadable','Size / model aur quantity unclear hain. Actual product, quantity aur unit confirm karein.'));continue;
    }
    if(qty){
      if(name){finish();current=make(name,original,entry.line);}
      else if(!current)current=make('',original,entry.line);
      else current.raw+='\n'+original;
      if(unit){if(current.unit&&sapUnit(current.unit)!==sapUnit(unit))current.issues.push(sapIssue('unit','Ek item mein alag units hain.','unit'));current.unit=unit;}
      const pending=!name&&current.events.at(-1)?.pending?current.events.pop():null;
      current.events.push({qty:pending?.qty?pending.qty+' '+qty:qty,unit,date:date||pending?.date||current.context.date||'',type:type||pending?.type||current.context.type||'',purpose:purpose||'',raw:pending?pending.raw+'\n'+original:original,dateExplicit:!!date||!!pending?.date,typeExplicit:!!type||!!pending?.type});
      if(current.events.length>8)throw new Error('Ek product ke maximum 8 movement lines allowed hain.');continue;
    }
    if(type&&current){current.raw+='\n'+original;current.events.push({qty:line,unit:'',date:date||current.context.date||'',type,raw:original,pending:/^[+-]$/.test(line)});continue;}
    if(current&&!current.events.length&&wordsOnly(line)&&!date&&!type){current.name=stkName(current.name+' '+line);current.raw+='\n'+original;continue;}
    finish();current=make(line,original,entry.line);if(date)current.context.date=date;if(type){current.context.type=type;current.issues.push(sapIssue('unreadable','Movement mein clear product / quantity nahi mili.'));}
    if(!wordsOnly(line)||/\b(?:qty|quantity|aaye|received|recieved|sold|gaye)\b/i.test(line))current.issues.push(sapIssue('unreadable','Line ko safely map nahi kar paaye. Quantity / product confirm karein.'));
  }
  finish();return complete();
}
function sapMatch(name,unit,stock){
  const canonical={...stock,products:stock.products.map(p=>({...p,unit:sapUnit(p.unit)}))},block={name,unit};
  const base=stmMatch(block,canonical);
  // Explicit names and previously accepted aliases retain precedence. They
  // cannot hide a different unit. Never rename an existing catalogue entry.
  if(base.id&&base.method!=='fuzzy'||base.kind.startsWith('Conflicting matches'))return base;
  const candidates=stock.products.map(p=>({id:p.id,score:stfScore(name,p.name),sameUnit:sapUnit(p.unit)===unit,variant:sapVariant(name,p.name)}))
    .filter(c=>c.score>=.55).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  const summary={candidates,suggestions:candidates.slice(0,3).map(c=>c.id)},compatible=candidates.filter(c=>c.sameUnit&&!c.variant),best=compatible[0],wrong=candidates.find(c=>!c.sameUnit&&!c.variant&&c.score>=STF_MIN);
  if(wrong&&(!best||wrong.score>best.score+STF_GAP))return {...summary,id:'',kind:'UNIT CONFLICT — source aur saved unit alag hain; conversion nahi hogi.'};
  if(best&&best.score>=STF_MIN){
    const nameOf=id=>stock.products.find(p=>p.id===id).name,bestName=nameOf(best.id),rival=compatible[1];
    const family=s=>stfFamily(s).split(' ').filter(w=>!['plastic','wood','wooden','leather','steel','brass','rubber','aluminium','aluminum','round','square','original','copy'].includes(w)).join(' ');
    const missing=compatible.slice(1).some(c=>sapVariant(bestName,nameOf(c.id))&&family(bestName)&&family(bestName)===family(nameOf(c.id)));
    if(missing||rival&&best.score-rival.score<=STF_GAP+1e-12)return {...summary,id:'',kind:'Do close products / variants milte hain. Sahi product ek baar chunein.'};
    return {...summary,id:best.id,method:'fuzzy',score:best.score,percent:Math.floor(best.score*100+1e-9),kind:Math.floor(best.score*100+1e-9)+'% naam match'};
  }
  return {...summary,id:'',kind:candidates.length?'Naam / model / colour / material unclear. Sahi saved ya distinct naya product chunein.':'Koi saved product match nahi mila.'};
}
function sapRowOrder(a,b){return a.date.localeCompare(b.date)||a.block-b.block||a.event-b.event;}
function sapSourceYear(parsed,options){
  const years=new Set();
  for(const block of parsed.blocks)for(const value of [block.context.date,...block.events.map(e=>e.date)]){
    try{const date=sapDate(value);years.add(date.slice(0,4));}catch(error){}
  }
  try{years.add(sapDate(parsed.context.date).slice(0,4));}catch(error){}
  return options.year||(years.size===1?[...years][0]:'');
}
async function sapPlan(text,input={},data){
  const options=sapOptions(input),stock=syncClone(data===undefined?stkData():data);stkValidate(stock);
  const parsed=sapParse(text,options,stock),year=sapSourceYear(parsed,options),issues=parsed.issues.filter(i=>!i.field||!options[i.field]);
  const plan={parsed,year,batch:'',origin:'',rows:[],blocks:[],newProducts:[],issues,warnings:[...parsed.warnings],corrections:[],unresolved:[],added:0,skipped:0,valid:false,signature:''};
  const common={...parsed.context},members=steCheckedMembers(parsed.tags),known=stock.transactions.concat(stock.history.filter(h=>h.entity==='transaction').flatMap(h=>[h.before,h.after].filter(Boolean)));
  for(const key of ['date','type'])if(new Set(parsed.blocks.map(b=>b.context[key]).concat(common[key]).filter(Boolean)).size>1)common[key]='';
  if(parsed.tags.some(tag=>tag.split('@').slice(1).some(part=>!/[\p{L}\p{N}]/u.test(part))))issues.push(sapIssue('tags','Har @ ke baad poora tagged naam chahiye. Source tags sudharein.'));
  if(parsed.phone&&!/^\+?[\d ()-]{6,35}$/.test(parsed.phone))issues.push(sapIssue('phone','Driver phone clear nahi hai. Source phone sudharein.'));
  const globalReference=stkText(options.reference===undefined?common.reference:options.reference,80,false,'Delivery reference');
  const sourceHash=(await stmHash(JSON.stringify(stmClean(text)))).slice(0,16);
  plan.origin=options.origin||await stmHash(JSON.stringify(['smart-paste-v1',stmClean(text),year,globalReference,options.date||'',options.party||'']));plan.batch=plan.origin.slice(0,32);
  const batchHistory=stock.history.filter(h=>stmMeta(h)?.b===plan.batch);
  if(options.origin&&batchHistory.some(h=>{const m=stmMeta(h);return m.s!=='sap1'||m.h!==sourceHash;}))issues.push(sapIssue('origin','Saved combo ki source identity is paste se alag hai. Agla paste / fresh source se process karein.'));
  const origins=batchHistory.filter(h=>{const m=stmMeta(h);return m.s==='sap1'&&m.h===sourceHash;});
  const staged=new Map(),seen=new Map(),matchCache=new Map(),outgoingParties=new Set();
  const fail=(b,code,message,field='',event=null)=>b.issues.push({...sapIssue(code,message,field),event});
  for(const source of parsed.blocks){
    const fix=options.fixes[source.index]||{},unit=sapUnit(fix.unit===undefined?source.unit||options.unit||'':fix.unit),name=stkName(fix.name===undefined?source.name:fix.name);
    const b={...source,name,unit,events:[],issues:source.issues.filter(i=>!(i.field&&(Object.hasOwn(fix,i.field)||i.field==='qty'&&fix.events?.[0]?.qty))&&!(i.code==='unreadable'&&fix.name&&fix.unit&&(fix.qty||fix.events?.[0]?.qty))),corrections:[],productId:'',productName:'',match:null,newProduct:false,status:'unresolved',rows:[]};
    plan.blocks.push(b);
    const priorSource=origins.filter(h=>stmMeta(h).i===b.index),eventCount=Math.max(1,source.events.length);
    if(priorSource.length&&Array.from({length:eventCount},(_,j)=>j).every(j=>priorSource.some(h=>stmMeta(h).e===j))){
      b.issues=[];
      for(let j=0;j<eventCount;j++){
        const h=priorSource.find(h=>stmMeta(h).e===j),t=h.after,row={block:b.index,event:j,index:b.index+':'+j,id:t.id,existingId:t.id,productId:t.productId,productName:t.productName,unit:t.unit,date:t.date,qty:t.qty,type:t.type,direction:t.type==='in'?'in':'take',action:'skip',exact:true,skipReason:'Isi original source ki pehle confirmed entry / correction audit mein recorded hai. Edit / delete bhi checked; dobara add nahi hua.'};
        b.rows.push(row);plan.rows.push(row);b.events.push({event:j,date:t.date,qty:t.qty,type:t.type,direction:row.direction,raw:source.events[j]?.raw||source.raw});
      }
      b.productId=b.rows[0].productId;b.productName=b.rows[0].productName;b.unit=b.rows[0].unit;continue;
    }
    if(options.included[b.index]){const row={block:b.index,event:0,index:b.index+':skip',action:'skip',exact:false,id:'',existingId:'',productId:'',productName:name,unit,qty:null,date:'',skipReason:'Aapne explicitly already recorded / opening mein included bataya; sirf Skip, koi stock change nahi.'};b.rows.push(row);plan.rows.push(row);b.issues=[];continue;}
    try{stkText(name,90,true,'Product name');}catch(error){fail(b,'name',error.message,'name');}
    try{stkText(unit,18,true,'Actual unit');}catch(error){fail(b,'unit','Actual unit missing / unclear hai. Saved unit assume nahi hogi.','unit');}
    if(source.unit&&unit!==source.unit)b.corrections.push('Unit spelling / plural: '+source.unit+' → '+unit+' (conversion nahi)');
    if(Object.keys(fix).length)b.corrections.push('Aapki explicit correction lagi; original source note retained.');
    const context={};
    for(const [key,max]of [['party',90],['supplier',90],['salesperson',90],['deliveryName',90],['purpose',250],['reference',80]]){
      try{context[key]=stkText(Object.hasOwn(options,key)?options[key]:source.context[key]||common[key],max,false,key);}catch(error){fail(b,key,error.message,key);context[key]='';}
    }
    if(fix.reference!==undefined)context.reference=fix.reference;
    const rawEvents=source.events.length?source.events:[{qty:'',date:source.context.date||'',type:source.context.type||'',unit,raw:source.raw}];
    for(let j=0;j<rawEvents.length;j++){
      const original=rawEvents[j],patch=fix.events?.[j]||{},eventFix={...fix,...patch};
      let type=sapType(eventFix.type||original.type||source.context.type||common.type||options.type||''),date='',qty=null,sign='';
      if(type==='take')type=['sale','out'].includes(options.type)?options.type:'';
      if(!['in','out','sale'].includes(type))fail(b,'type','Stock In, Sale ya Stock Out? Gaye / dispatch se role guess nahi hoga.','type',j);
      const rawDate=eventFix.date||original.date||source.context.date||common.date||options.date||'';
      try{date=sapDate(rawDate,year);if(rawDate!==date)b.corrections.push('Date format: '+rawDate+' → '+date);}catch(error){fail(b,/saal|Year/.test(error.message)?'year':'date',error.message,/saal|Year/.test(error.message)?'year':'date',j);}
      try{
        if(rawEvents.length>1&&fix.qty!==undefined&&!patch.qty)throw new Error('Multiple movements hain; har unclear line ki alag quantity confirm karein.');
        const number=sapNumber(patch.qty===undefined?(fix.qty===undefined?String(original.qty):fix.qty):patch.qty);qty=number.qty;sign=number.sign;
        if(number.corrected)b.corrections.push('Quantity comma grouping safely normalised: '+String(original.qty)+' → '+qty);
        if(type==='in'&&sign==='-'||['sale','out'].includes(type)&&sign==='+')throw new Error('Quantity ka + / - sign movement se ulta hai. Actual quantity / type confirm karein.');
      }catch(error){fail(b,'qty',error.message,'qty',j);}
      if(original.unit&&fix.unit===undefined&&sapUnit(original.unit)!==unit)fail(b,'unit','Movement aur source balance ki units alag hain. Actual unit confirm karein.','unit',j);
      const sourceType=eventFix.type||original.type||source.context.type||common.type||options.type||'';
      const event={event:j,date,type,qty,raw:original.raw,direction:type==='in'?'in':'take',purpose:context.purpose||original.purpose||(type==='out'&&/^(?:used|usage|consumed|damage[ds]?|office transfer|transfer|खर्च|इस्तेमाल)$/i.test(sourceType)?sourceType:'')};b.events.push(event);
      if(type==='sale'){
        for(const key of ['party','salesperson','deliveryName'])if(!context[key])fail(b,key,({party:'Actual customer / party',salesperson:'Salesperson ka actual naam',deliveryName:'Delivery person ka actual naam'})[key]+' chahiye. Tags se role assume nahi hoga.',key,j);
      }
      if(type==='out'&&!event.purpose)fail(b,'purpose','Stock Out ka actual purpose chahiye.','purpose',j);
      if(type!=='in'&&context.party)outgoingParties.add(stkKey(context.party));
    }
    let headerDate='';try{headerDate=sapDate(source.context.date||common.date||options.date,year);}catch(error){}
    if(headerDate&&b.events.some(e=>e.date&&e.date>headerDate))fail(b,'date','Movement date message header ke baad hai. Actual dates confirm karein.','date');
    b.asOf=headerDate||b.events.map(e=>e.date).filter(Boolean).sort().at(-1)||'';
    for(const field of ['prior','available']){
      const raw=fix[field]===undefined?source[field]:fix[field];b[field]=null;
      if(raw!==null&&raw!==undefined){try{const value=sapNumber(String(raw),true);if(value.sign==='-')throw new Error('Balance minus nahi ho sakta.');b[field]=value.qty;}catch(error){fail(b,field,'Source '+field+': '+error.message,field);}}
    }
    if(b.prior!==null&&b.available!==null&&b.events.every(e=>e.qty!==null&&e.type)){
      const expected=stkUnits(b.prior,true)+b.events.reduce((sum,e)=>sum+stkUnits(e.qty,false)*(e.type==='in'?1:-1),0);
      if(expected!==stkUnits(b.available,true))fail(b,'math','Source maths mismatch: previous + In − outgoing, Available se match nahi hai. Actual source quantities / balances confirm karein.','checks');
    }else if(b.prior===null||b.available===null)plan.warnings.push((name||'Item '+(b.index+1))+': complete Previous / Available checks nahi diye. Actual movements hi add honge, available overwrite nahi.');
    let product=null;
    if(name&&unit){
      const key=JSON.stringify([name,unit]);if(!matchCache.has(key))matchCache.set(key,sapMatch(name,unit,stock));const match=b.match=matchCache.get(key);
      const chosen=Object.hasOwn(options.matches,b.index)?options.matches[b.index]:match.id||(!match.suggestions?.length&&!match.candidates?.length?'__new__':'');
      product=stock.products.find(p=>p.id===chosen)||null;
      if(chosen==='__new__'){
        const historical=stock.history.some(h=>h.entity==='product'&&[h.before,h.after].some(p=>p&&stmKey(p.name)===stmKey(name)));
        if(stock.products.some(p=>stmKey(p.name)===stmKey(name)))fail(b,'product','Isi naam ka saved product hai. Doosri unit / duplicate product auto-create nahi hoga.','product');
        else if(historical)fail(b,'product','Is naam ka product audit history mein hai. Deleted / renamed product ko auto-recreate nahi karenge; History / restore se resolve karein.','product');
        else if(!b.events.every(e=>e.type==='in'&&e.date))fail(b,'product','Naya product sirf clear dated Stock In se banega. Outgoing ke liye actual saved product chunein.','product');
        else{
          const id='sinp1_'+await stmHash(JSON.stringify([stkKey(name),unit]));
          if(stock.products.some(p=>p.id===id))fail(b,'product','Product identity conflict; current inventory check karein.','product');
          else{
            if(!staged.has(id))staged.set(id,{id,name,unit,date:b.events.map(e=>e.date).sort()[0],minQty:0,photoId:'',note:'Created from Smart Paste Stock In; no opening movement',createdAt:Date.now(),updatedAt:Date.now()});
            product=staged.get(id);product.date=[product.date,...b.events.map(e=>e.date)].sort()[0];b.newProduct=true;
          }
        }
      }else if(!product)fail(b,'product',chosen?'Selected product ab nahi hai. Fresh inventory check karein.':match.kind,'product');
      if(product&&sapUnit(product.unit)!==unit)fail(b,'unit','Source '+unit+' / saved '+product.unit+' — unit conflict. Koi conversion nahi hogi.','unit');
      if(product){b.productId=product.id;b.productName=product.name;if(match.method==='fuzzy'&&match.id===product.id)b.corrections.push(match.percent+'% naam match: '+source.name+' → '+product.name);}
    }
    if(!product)continue;
    const openings=stock.transactions.filter(t=>t.productId===product.id&&t.source==='opening').map(t=>t.date).sort(),cutover=openings.at(-1)||product.date;
    const [yyyy,mm,dd]=(b.asOf||'').split('-'),header=b.asOf?dd+'/'+mm+'/'+yyyy+' '+(context.party||context.supplier||'Party not given'):'';
    const note=[header,source.raw].filter(Boolean).join('\n'),details=[members.length?'Tagged members: '+members.map(n=>'@'+n).join(' '):'',context.reference?'Message reference: '+context.reference:''].filter(Boolean).join('\n');
    for(const event of b.events){
      const row={...event,block:b.index,index:b.index+':'+event.event,productId:product.id,productName:product.name,unit:product.unit,reference:context.reference,party:event.type==='in'?context.supplier:context.party,cutover,action:'unresolved',exact:false,similar:false,id:''};plan.rows.push(row);b.rows.push(row);
      if(!row.date||row.qty===null||!row.type)continue;
      row.id='smsg1_'+await stmHash(JSON.stringify([product.id,row.date,row.direction,stkUnits(row.qty,true),row.direction==='in'?'':stkKey(row.party),row.reference]));
      const savedOrigin=origins.find(h=>{const m=stmMeta(h);return m.i===b.index&&m.e===row.event;});
      row.exact=!!savedOrigin||known.some(t=>t.id===row.id);
      if(row.exact){row.action='skip';row.existingId=savedOrigin?.entityId||row.id;row.skipReason='Pehle se recorded (edit / delete history bhi checked); dobara add nahi hua.';continue;}
      row.similar=known.some(t=>t.source!=='opening'&&t.productId===product.id&&t.date===row.date&&(t.type==='in'?'in':'take')===row.direction&&t.qty===row.qty);
      if(row.date<cutover)fail(b,'opening','Opening / cut-over '+cutover+' se pehle ki movement hai. Inclusion ka andaaza nahi hoga; alag reconciliation zaroori hai.','opening',row.event);
      else if(!b.newProduct&&row.date===cutover&&!options.sameDay)fail(b,'sameDay','Opening isi din ki hai. Sirf snapshot ke BAAD ka naya stock hone ki pushti chahiye.','sameDay',row.event);
      if(row.similar&&!(options.separate[b.index]&&row.reference))fail(b,'duplicate','Same date / quantity current ya edited / deleted history mein milti hai. Alag real delivery ho tab actual unique reference aur separate-entry confirmation dein.','duplicate',row.event);
      row.input={productId:product.id,type:row.type,qty:row.qty,date:row.date,party:row.party,salesperson:row.type==='sale'?context.salesperson:'',deliveryName:row.type==='in'?'':context.deliveryName,deliveryPhone:row.type==='in'?'':parsed.phone,deliveryDetails:details,purpose:row.type==='out'?event.purpose:'',note};
      row.reason=STM_PREFIX+JSON.stringify({b:plan.batch,n:stmKey(source.name).length<=90?stmKey(source.name):'',u:unit,s:'sap1',i:b.index,e:row.event,h:sourceHash});
      try{stkText(row.reason,250,true,'Source provenance');const draft={...stock,products:stock.products.concat([...staged.values()])};stkMakeMovement(row.input,draft);}catch(error){fail(b,'value',error.message,'',row.event);}
      row.action='candidate';
    }
    // Saved rows are never reinterpreted because a user later changes a fix.
    // Other genuinely unclear events still require clarification as a block.
    if(b.rows.length&&b.rows.every(r=>r.action==='skip'&&!r.repeated))b.issues=[];
  }
  if(outgoingParties.size>1)issues.push(sapIssue('party','Ek paste mein alag outgoing parties hain. Ek party ka ek combo rakhein; source ko parties ke hisaab se alag karein.','party'));
  const candidates=()=>plan.rows.filter(r=>r.action==='candidate'&&!issues.length&&!plan.blocks[r.block].issues.some(i=>i.event==null||i.event===r.event));
  for(const row of candidates()){
    if(seen.has(row.id)){row.action='skip';row.repeated=true;row.duplicateOf=seen.get(row.id).index;row.skipReason='Isi paste mein same product / date / quantity repeated hai; ek hi baar liya.';}else seen.set(row.id,row);
  }
  // Product ledgers are independent; quarantine a whole affected product rather
  // than arbitrarily saving just an In/Out subset that happens to balance.
  const groups=new Map();candidates().forEach(r=>{if(!groups.has(r.productId))groups.set(r.productId,[]);groups.get(r.productId).push(r);});
  for(const [id,rows]of groups){
    const product=stock.products.find(p=>p.id===id)||staged.get(id),draft={...stock,products:[product],transactions:stock.transactions.filter(t=>t.productId===id).map(t=>({...t})),history:[],images:stock.images};
    try{
      rows.sort(sapRowOrder).forEach(r=>{const movement=stkMakeMovement(r.input,draft);movement.id=r.id;draft.transactions.push(movement);});stkLedger(draft);
      for(const b of plan.blocks.filter(b=>b.productId===id&&b.available!==null&&rows.some(r=>r.block===b.index))){
        const ledger=stkLedger({...draft,transactions:draft.transactions.filter(t=>t.date<=b.asOf)}),available=(ledger.balances.get(id)||0)/1000;
        if(stkUnits(available,true)!==stkUnits(b.available,true))throw new Error('Panel ka '+b.asOf+' balance '+stkFmt(available)+' '+product.unit+' / source Available '+stkFmt(b.available)+' alag hai. Opening / included entries reconcile karein; automatic adjustment nahi hoga.');
      }
    }catch(error){for(const b of plan.blocks.filter(b=>b.productId===id&&rows.some(r=>r.block===b.index)))fail(b,'ledger',error.message,'ledger');}
  }
  candidates().forEach(r=>r.action='new');
  plan.rows.filter(r=>r.action==='candidate').forEach(r=>r.action='unresolved');
  plan.rows.filter(r=>r.repeated).forEach(r=>{if(!plan.rows.some(master=>master.index===r.duplicateOf&&master.action==='new')){r.action='unresolved';fail(plan.blocks[r.block],'duplicate','Repeated row ki original bhi unresolved hai; kuch dobara / adhura nahi joda.','duplicate',r.event);}});
  const used=new Set(plan.rows.filter(r=>r.action==='new').map(r=>r.productId));plan.newProducts=[...staged.values()].filter(p=>used.has(p.id)).map(p=>({...p,date:plan.rows.filter(r=>r.action==='new'&&r.productId===p.id).map(r=>r.date).sort()[0]}));
  for(const b of plan.blocks){
    b.issues=[...new Map(b.issues.map(i=>[JSON.stringify(i),i])).values()];
    b.status=issues.length||b.issues.length||!b.rows.length||b.rows.some(r=>r.action==='unresolved')?'unresolved':b.rows.some(r=>r.action==='new')?'ready':'recorded';
    if(b.status==='unresolved')plan.unresolved.push({index:b.index,name:b.name||'Item '+(b.index+1),line:b.line,raw:b.raw,issues:b.issues.length?b.issues:issues.length?[...issues]:[sapIssue('fields','Product / date / quantity / unit clear nahi hai.') ]});
    plan.corrections.push(...b.corrections.map(message=>({block:b.index,message})));
  }
  plan.added=plan.rows.filter(r=>r.action==='new').length;plan.skipped=plan.rows.filter(r=>r.action==='skip').length;plan.valid=plan.added>0&&!issues.length;
  // Revalidate the complete prospective inventory, not just product summaries.
  if(plan.valid){const draft=syncClone(stock);draft.products.push(...plan.newProducts);plan.rows.filter(r=>r.action==='new').sort(sapRowOrder).forEach(r=>{const t=stkMakeMovement(r.input,draft);t.id=r.id;draft.transactions.push(t);});stkValidate(draft);}
  plan.warnings=[...new Set(plan.warnings)];plan.errors=[...new Set(issues.map(i=>i.message).concat(plan.unresolved.flatMap(b=>b.issues.map(i=>b.name+': '+i.message))))];
  plan.signature=await stmHash(JSON.stringify([text,options,plan.origin,syncStable(stock),plan.rows.map(r=>[r.id,r.action,r.input||null]),plan.newProducts.map(p=>[p.id,p.name,p.unit,p.date]),plan.errors]));
  return plan;
}
async function sapApply(text,options,context,signature,consent){
  stkCheck(context);const plan=await sapPlan(text,options);stkCheck(context);
  if(consent&&!consent())throw new Error('Smart Paste cancel / draft badla; kuch save nahi hua.');
  if(!signature||signature!==plan.signature)throw new Error('Stock / clarification badli. Fresh process karein; purana plan save nahi hua.');
  const result={imported:0,products:0,skipped:plan.skipped,unresolved:plan.unresolved.length,ids:[],batch:plan.batch,origin:plan.origin};
  if(!plan.valid)return result;
  return stkAtomic(stock=>{
    plan.newProducts.forEach(p=>{stock.products.push(p);stkAudit(stock,'product',null,p,'create','Smart Paste: clear Stock In, new product; no opening movement');});
    plan.rows.filter(r=>r.action==='new').sort(sapRowOrder).forEach(r=>{
      if(stock.transactions.some(t=>t.id===r.id))throw new Error('Entry already saved. Fresh process karein.');
      const t=stkMakeMovement(r.input,stock);t.id=r.id;stock.transactions.push(t);stkAudit(stock,'transaction',null,t,'create',r.reason);result.ids.push(t.id);
    });
    return {...result,imported:plan.added,products:plan.newProducts.length};
  },context,true);
}
async function sapProcess(text,options={},context=stkContext(),consent){
  stkCheck(context);const plan=await sapPlan(text,options);stkCheck(context);
  if(consent&&!consent())throw new Error('Smart Paste cancelled; nothing saved.');
  const result=await sapApply(text,options,context,plan.signature,consent);return {plan,result};
}
function sapClearFiles(e){if(!e)return;(e.urls||[]).forEach(url=>URL.revokeObjectURL(url));e.urls=[];if(sapCurrent(e)&&$('#sapFiles'))$('#sapFiles').innerHTML='';}
function sapCancel(){if(sapEditor){sapEditor.serial++;clearTimeout(sapEditor.timer);sapClearFiles(sapEditor);}sapEditor=null;}
function sapFile(e,blob,name){
  if(!sapCurrent(e))return;stkCheck(e.context);sapClearFiles(e);
  const url=URL.createObjectURL(blob);e.urls.push(url);const a=document.createElement('a');a.href=url;a.download=name;a.className='btn sm';a.textContent='↓ '+name+' · yahan se save karein';
  a.addEventListener('click',event=>{try{if(!sapCurrent(e))throw new Error('Result band ho gaya.');stkCheck(e.context);}catch(error){event.preventDefault();sapStatus(error.message,true);}});
  $('#sapFiles').appendChild(a);if(!navigator.userActivation||navigator.userActivation.isActive)a.click();
}
async function sapPdf(e,id){
  const serial=e.serial;try{stkCheck(e.context);const report=steReport({kind:'message',entryId:id});
    if(document.fonts?.load)await Promise.all([400,700].map(weight=>document.fonts.load(weight+' 16px "Hisaab Indic"')));
    if(!sapCurrent(e)||e.serial!==serial)return;stkCheck(e.context);const out=stePdfString(report);stkCheck(e.context);sapFile(e,pdfBlob(out.str),out.name);sapStatus('Combo PDF ready. Sirf saved items hain; unresolved items is PDF mein nahi. Neeche ka download use karein.');
  }catch(error){if(sapCurrent(e)&&e.serial===serial)sapStatus(error.message,true);}
}
function sapCurrent(e){return !!e&&sapEditor===e&&$('#sapDialog')===e.element&&UI.view==='stock';}
function sapStatus(message,error=false){const el=$('#sapStatus');if(el){el.textContent=message;el.classList.toggle('sap-error',error);}}
function sapOpen(){
  stkCheck(stkContext());go('stock');
  openModal(`<div class="modal stk-dialog sap-dialog" id="sapDialog" role="dialog" aria-modal="true" aria-labelledby="sapTitle">
    <div class="modal-h"><div><span class="sap-eyebrow">PASTE → PEHCHAAN → CHECK → SAVE</span><h3 id="sapTitle">Smart Paste · automatic Stock entry</h3><p>Format fix karne ki zaroorat nahi. Ek paste, ek party ka ek combo.</p></div><button class="x" type="button" data-act="closeModal" aria-label="Close Smart Paste">✕</button></div>
    <div class="modal-b"><div class="sap-notice"><b>Yahan Paste karte hi clear entries apne-aap SAVE hongi.</b><span>75%+ safe name match, asli dates / units, duplicate aur poora ledger check. Sirf unclear items rukenge. Naya, clear Stock In product zero opening se ban sakta hai; old available overwrite nahi.</span></div>
      <p class="stm-account"><b>Account:</b> ${esc(Cloud.user?.email||'Is browser ka local data')} · Local processing, koi AI upload nahi.</p>
      <label class="stk-field"><span>Poora message, list ya copied table Paste karein</span><textarea class="inp sap-text" id="sapText" rows="7" maxlength="20000" spellcheck="false" placeholder="Date, product, quantity, unit aur movement jaise likhe hain waise Paste…&#10;Numbered / plain list, Hindi / English, Excel table ya labelled fields.&#10;Full date se year apne-aap; missing year guess nahi hoga."></textarea></label>
      <p class="sap-help">Paste = process + safe save. Khud type kiya hai? Neeche <b>Process & save</b> dabayein. Sirf totals / Available ko naya received stock nahi maana jayega.</p>
      <p id="sapStatus" class="sap-status" role="status" aria-live="polite" tabindex="-1">Ready to paste. Abhi kuch save nahi hua.</p>
      <section id="sapSummary" class="sap-summary" hidden aria-label="Processing result"></section>
      <section id="sapClarify" hidden><h4>Sirf ye details clear karein</h4><p class="sap-help">Jo sahi tha woh save ho chuka hai. Neeche ki clarification se sirf bache hue valid items judenge; saved items dobara nahi.</p><div id="sapGlobalFields" class="sap-fields"></div><div id="sapRolePeople"></div><div id="sapUnresolved"></div></section>
      <div id="sapResults"></div><div id="sapWarnings"></div><div id="sapFiles" class="row-actions"></div>
    </div><div class="modal-f sap-footer"><button class="btn" type="button" data-act="closeModal">Close</button><button class="btn sm" type="button" data-sap="review" id="sapReview">Screenshot / manual review</button><button class="btn sm" type="button" data-sap="report" id="sapReport" hidden>↓ Result report</button><button class="btn" type="button" data-sap="next" id="sapNext" hidden>＋ Agla paste</button><button class="btn primary" type="button" data-sap="process" id="sapProcess">Process & save</button></div></div>`,{sticky:true});
  sapEditor={element:$('#sapDialog'),context:stkContext(),serial:0,busy:false,options:{matches:{},fixes:{},separate:{},included:{}},saved:[],products:0,sourceText:'',plan:null,result:null,timer:null,urls:[]};$('#sapText').focus();
}
function sapTypeOptions(value,allowIn=true){return '<option value="">Actual type chunein…</option>'+[['in','Stock In — naya aaya stock'],['sale','Stock Sale — customer ko becha'],['out','Stock Out — office / doosra purpose']].filter(([v])=>v!=='in'||allowIn).map(([v,label])=>'<option value="'+v+'"'+(value===v?' selected':'')+'>'+esc(label)+'</option>').join('');}
function sapGlobalHTML(e,plan){
  const needed=new Set(plan.issues.concat(plan.unresolved.flatMap(b=>b.issues)).map(i=>i.field)),value=key=>e.options[key]??plan.parsed.context[key]??'';
  const field=(key,label,max,extra='')=>'<label class="stk-field"'+extra+'><span>'+esc(label)+'</span><input class="inp" data-sap-global="'+key+'" id="sap_'+key+'" maxlength="'+max+'" value="'+esc(value(key))+'"'+(key==='year'?' inputmode="numeric"':'')+'></label>';
  let out='';
  if(needed.has('year'))out+=field('year','Message ka actual year · ek baar',4);
  const missingType=needed.has('type');
  if(missingType)out+='<label class="stk-field"><span>Jahan type unclear hai: Stock In / Sale / Out?</span><select class="inp" data-sap-global="type" id="sap_type">'+sapTypeOptions(value('type'),plan.blocks.some(b=>b.issues.some(i=>i.field==='type')&&!plan.parsed.blocks[b.index].events.every(ev=>sapType(ev.type)==='take')))+'</select></label>';
  for(const [key,label,max]of [['party','Actual party / customer',90],['salesperson','Salesperson ka actual naam',90],['deliveryName','Delivery person ka actual naam',90],['purpose','Stock Out ka actual purpose',250]]){
    if(needed.has(key)||missingType){const role=key==='purpose'?'out':'sale',hidden=missingType&&!needed.has(key)&&value('type')!==role;out+=field(key,label,max,' data-sap-for="'+role+'"'+(hidden?' hidden':''));}
  }
  if(needed.has('sameDay'))out+='<label class="stm-check sap-wide"><input type="checkbox" data-sap-global="sameDay" id="sap_sameDay"'+(e.options.sameDay?' checked':'')+'><span>Pushti: isi din ki opening snapshot ke BAAD ka naya stock hai; opening mein pehle se included NAHI hai.</span></label>';
  if(needed.has('countConfirmed'))out+='<label class="stm-check sap-wide"><input type="checkbox" data-sap-global="countConfirmed"'+(e.options.countConfirmed?' checked':'')+'><span>Poora original source / item count check kiya; isi pasted list ko process karein.</span></label>';
  if(plan.issues.length)out+='<div class="sap-wide sap-problems" role="alert">'+plan.issues.map(i=>'<p>'+esc(i.message)+'</p>').join('')+'</div>';
  return out;
}
function sapItemHTML(e,b){
  const fields=new Set(b.issues.map(i=>i.field)),fix=e.options.fixes[b.index]||{},unreadable=b.issues.some(i=>i.code==='unreadable'),all=unreadable||fields.has('ledger'),products=stkData().products;
  const input=(key,label,value,max=90,event=null)=>'<label class="stk-field"><span>'+esc(label)+'</span><input class="inp" data-sap-fix="'+b.index+'" data-key="'+key+'"'+(event===null?'':' data-event="'+event+'"')+' maxlength="'+max+'" value="'+esc(value??'')+'"'+(['qty','prior','available'].includes(key)?' inputmode="decimal"':'')+'></label>';
  let form='';
  if(all||fields.has('name')||fields.has('product')||fields.has('unit'))form+=input('name','Actual product name',fix.name??b.name);
  if(all||fields.has('unit'))form+=input('unit','Actual unit · conversion nahi',fix.unit??b.unit,18);
  if(fields.has('product')||fields.has('unit')){
    const selected=e.options.matches[b.index]??(b.newProduct?'__new__':b.productId);
    form+='<label class="stk-field sap-wide"><span>Actual saved product / genuinely distinct new product</span><select class="inp" data-sap-match="'+b.index+'"><option value="">Sahi product chunein…</option><option value="__new__"'+(selected==='__new__'?' selected':'')+'>Genuinely naya product · sirf Stock In</option>'+products.map(p=>'<option value="'+esc(p.id)+'"'+(selected===p.id?' selected':'')+'>'+esc(p.name)+' · '+esc(p.unit)+'</option>').join('')+'</select></label>';
  }
  for(let j=0;j<b.events.length;j++){
    const ev=b.events[j],source=e.plan.parsed.blocks[b.index].events[j]||{},patch=fix.events?.[j]||{},issue=field=>b.issues.some(i=>i.field===field&&(i.event==null||i.event===j));
    if(b.rows.some(r=>r.event===j&&r.action==='skip'&&!r.repeated)||e.saved.some(id=>b.rows.some(r=>r.event===j&&r.id===id)))continue;
    if(b.events.length>1&&(all||issue('qty')||issue('date')||fields.has('checks')))form+='<p class="sap-wide sap-help">Movement '+(j+1)+' · '+esc(source.raw||'Source line')+'</p>';
    if(all||issue('qty')||fields.has('checks'))form+=input('qty','Actual quantity'+(b.events.length>1?' · line '+(j+1):''),patch.qty??(b.events.length===1?fix.qty:undefined)??source.qty??'',24,j);
    if(all||issue('date')||fields.has('opening')||fields.has('checks'))form+=input('date','Actual source date · YYYY-MM-DD',patch.date??fix.date??ev.date??'',30,j);
    if(unreadable)form+='<label class="stk-field"><span>Actual movement type</span><select class="inp" data-sap-fix="'+b.index+'" data-key="type" data-event="'+j+'">'+sapTypeOptions(patch.type??fix.type??ev.type)+'</select></label>';
  }
  if(fields.has('checks')||fields.has('prior'))form+=input('prior','Source Previous · actual value',fix.prior??e.plan.parsed.blocks[b.index].prior,24);
  if(fields.has('checks')||fields.has('available'))form+=input('available','Source Available · actual value',fix.available??e.plan.parsed.blocks[b.index].available,24);
  if(fields.has('duplicate'))form+=input('reference','Sirf real alag delivery ka actual bill / reference',fix.reference??e.options.reference??e.plan.parsed.blocks[b.index].context.reference??'',80)+'<label class="stm-check sap-wide"><input type="checkbox" data-sap-separate="'+b.index+'"'+(e.options.separate[b.index]?' checked':'')+'><span>Pushti: yeh alag REAL delivery hai, pehle wali entry nahi. Upar actual unique reference diya hai; random reference nahi.</span></label>';
  return '<article class="sap-item" data-sap-item="'+b.index+'"><div class="sap-item-head"><b>'+esc(b.name||'Unclear item '+(b.index+1))+'</b><span>Source line '+b.line+'</span></div><ul class="sap-problems">'+[...new Set(b.issues.map(i=>i.message))].map(message=>'<li>'+esc(message)+'</li>').join('')+'</ul><details class="sap-source"><summary>Original source dekhein</summary><pre>'+esc(b.raw)+'</pre></details><div class="sap-fields">'+form+'</div><label class="stm-check sap-skip"><input type="checkbox" data-sap-included="'+b.index+'"'+(e.options.included[b.index]?' checked':'')+'><span>Sirf agar sach hai: yeh pehle se recorded / opening mein included hai. <b>Skip</b> karein; naya stock mat jodein.</span></label></article>';
}
function sapRender(e,plan,result){
  if(!sapCurrent(e))return;e.plan=plan;e.result=result;
  const saved=new Set(e.saved),recorded=plan.rows.filter(r=>r.action==='skip'&&!saved.has(r.existingId||r.id)),unresolved=plan.unresolved.length;
  $('#sapSummary').hidden=false;$('#sapSummary').innerHTML=[['✓ Saved',e.saved.length],['↪ Recorded / repeated / skipped',recorded.length],['? Clarification',unresolved],['＋ New products',e.products]].map(([label,n])=>'<div><b>'+n+'</b><span>'+esc(label)+'</span></div>').join('');
  $('#sapClarify').hidden=!unresolved&&!plan.issues.length;$('#sapGlobalFields').innerHTML=sapGlobalHTML(e,plan);
  $('#sapRolePeople').innerHTML=steMemberNames(plan.parsed.tags).length&&(['salesperson','deliveryName','type'].some(key=>!!$('#sap_'+key)))?'<div class="sap-role-people"><p class="sap-help">Tagged log — actual role par tap karein, apne-aap koi role nahi laga:</p>'+steMemberNames(plan.parsed.tags).map((name,i)=>'<div><b>'+esc(name)+'</b>'+[['salesperson','Salesperson'],['deliveryName','Delivery']].filter(([key])=>!!$('#sap_'+key)).map(([key,label])=>'<button type="button" class="btn xs" data-sap="role" data-role="'+key+'" data-person="'+i+'">'+label+'</button>').join('')+'</div>').join('')+'</div>':'';
  $('#sapUnresolved').innerHTML=plan.blocks.filter(b=>b.status==='unresolved').map(b=>sapItemHTML(e,b)).join('');
  const live=stkData().transactions,rows=e.saved.map(id=>live.find(t=>t.id===id)).filter(Boolean),anchor=rows[0]?.id;
  $('#sapResults').innerHTML=(rows.length?'<section class="sap-saved"><div class="sap-item-head"><h4>✓ '+rows.length+' movements saved · 1 combo</h4><button type="button" class="btn sm" data-sap="pdf" data-id="'+esc(anchor)+'">↓ Combo PDF</button></div><p class="sap-help">Asli dates / units neeche. Same paste ki baad mein clear hui entries isi combo mein judengi.</p><div class="twrap"><table class="tbl"><thead><tr><th>Product</th><th>Date</th><th>Type</th><th class="num">Quantity / unit</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+esc(r.productName)+'</td><td>'+esc(r.date)+'</td><td>'+esc(STK_KINDS[r.type])+'</td><td class="num">'+(r.type==='in'?'+':'−')+stkFmt(r.qty)+' '+esc(r.unit)+'</td></tr>').join('')+'</tbody></table></div></section>':'')+(recorded.length?'<details class="sap-recorded"><summary>'+recorded.length+' already recorded / repeated / explicitly skipped · unchanged</summary><ul>'+recorded.map(r=>'<li><b>'+esc(r.productName)+'</b>'+ (r.qty===null?'':' · '+stkFmt(r.qty)+' '+esc(r.unit)+' · '+esc(r.date))+' — '+esc(r.skipReason)+'</li>').join('')+'</ul></details>':'');
  $('#sapWarnings').innerHTML=(plan.corrections.length?'<details><summary>Auto mapping / safe corrections ('+plan.corrections.length+')</summary><ul>'+[...new Set(plan.corrections.map(c=>c.message))].map(c=>'<li>'+esc(c)+'</li>').join('')+'</ul></details>':'')+(plan.warnings.length?'<details><summary>Checks / notes ('+plan.warnings.length+')</summary><ul>'+plan.warnings.map(w=>'<li>'+esc(w)+'</li>').join('')+'</ul></details>':'')+(plan.parsed.tags.length?'<div class="ste-saved-tags"><b>Source tagged people:</b> '+steMemberNames(plan.parsed.tags).map(n=>'<span>'+esc(n)+'</span>').join(' ')+'</div>':'')+(plan.parsed.ignored.length?'<details><summary>'+plan.parsed.ignored.length+' chat / display lines ignored (not Stock)</summary><ul>'+plan.parsed.ignored.map(i=>'<li>'+esc(i.text)+' — '+esc(i.reason)+'</li>').join('')+'</ul></details>':'');
  $('#sapText').readOnly=e.saved.length>0;$('#sapNext').hidden=false;$('#sapReport').hidden=false;$('#sapProcess').hidden=!unresolved&&!plan.issues.length;$('#sapProcess').textContent='Clarification laga kar bache hue save karo';
  sapStatus((result.imported?'✓ '+result.imported+' nayi movements safely save ho gayi. ':e.saved.length?'Saved items safe hain. ':'Koi naya stock save nahi hua. ')+(unresolved?unresolved+' items neeche clear karein.':'Sab clear / pehle se recorded. Dobara add nahi hoga.'));
}
async function sapRun(){
  const e=sapEditor;if(!sapCurrent(e)||e.busy)return;
  const text=$('#sapText').value,options=syncClone(e.options),serial=++e.serial;e.busy=true;sapClearFiles(e);$('#sapProcess').disabled=true;sapStatus('Pehchaan, duplicate aur dated ledger check ho rahe hain…');
  const consent=()=>sapCurrent(e)&&e.serial===serial&&$('#sapText').value===text&&JSON.stringify(e.options)===JSON.stringify(options);
  try{
    stkCheck(e.context);const {plan,result}=await sapProcess(text,options,e.context,consent);if(!consent())return;
    e.saved=[...new Set(e.saved.concat(result.ids))];e.products+=result.products;e.sourceText=text;if(e.saved.length)e.options.origin=result.origin;
    // Our own successful atomic write changes the context; accept ONLY that
    // transition, not an unrelated account / storage / tab update.
    e.context=stkContext();e.busy=false;$('#sapProcess').disabled=false;
    if(result.imported){const t=stkData().transactions.find(t=>t.id===e.saved[0]);Object.assign(stkUI(),{tab:'history',q:'',page:0,product:'all',party:'',salesperson:'',from:'',to:'',type:'all',order:'newest',lastMessage:{ids:[...e.saved],date:t.date,party:t.party||plan.parsed.context.party||'Party not given'}});render();}
    sapRender(e,plan,result);
  }catch(error){if(sapCurrent(e)&&e.serial===serial){e.busy=false;e.plan=null;$('#sapProcess').disabled=false;$('#sapProcess').hidden=false;$('#sapProcess').textContent='Dobara process & save';sapStatus(error.message+'\nIs attempt ka stock save nahi hua.',true);$('#sapStatus').focus();}}
}
function sapDraftChanged(e,target){
  if(!sapCurrent(e))return;e.serial++;e.busy=false;sapClearFiles(e);$('#sapProcess').disabled=false;$('#sapProcess').hidden=false;$('#sapProcess').textContent=e.saved.length?'Bache hue process & save':'Process & save';
  if(target.id==='sapText'){
    if(e.saved.length){target.value=e.sourceText;sapStatus('Original paste saved source ke saath locked hai. Neeche sirf unresolved items clear karein, ya Agla paste chunein.');return;}
    e.options={matches:{},fixes:{},separate:{},included:{}};e.plan=null;e.result=null;$('#sapSummary').hidden=true;$('#sapClarify').hidden=true;$('#sapResults').innerHTML='';$('#sapWarnings').innerHTML='';
  }else if(target.dataset.sapGlobal!=='sameDay'&&target.dataset.sapGlobal!=='countConfirmed'&&!target.hasAttribute('data-sap-separate')&&!target.hasAttribute('data-sap-included')){
    e.options.sameDay=false;if($('#sap_sameDay'))$('#sap_sameDay').checked=false;
    const index=target.dataset.sapFix??target.dataset.sapMatch;if(index!==undefined){e.options.separate[index]=false;const check=e.element.querySelector('[data-sap-separate="'+index+'"]');if(check)check.checked=false;}
  }
  sapStatus(e.saved.length?'Saved items unchanged. Clarification bhar kar bache hue save karein.':'Draft taiyar. Process & save se sirf clear entries save hongi.');
}
function sapField(e,target){
  sapDraftChanged(e,target);
  if(target.hasAttribute('data-sap-global'))e.options[target.dataset.sapGlobal]=target.type==='checkbox'?target.checked:target.value;
  else if(target.hasAttribute('data-sap-match'))e.options.matches[target.dataset.sapMatch]=target.value;
  else if(target.hasAttribute('data-sap-separate'))e.options.separate[target.dataset.sapSeparate]=target.checked;
  else if(target.hasAttribute('data-sap-included'))e.options.included[target.dataset.sapIncluded]=target.checked;
  else if(target.hasAttribute('data-sap-fix')){
    const index=target.dataset.sapFix,key=target.dataset.key,fix=e.options.fixes[index]||={};
    if(target.dataset.event!==undefined){fix.events||={};fix.events[target.dataset.event]||={};fix.events[target.dataset.event][key]=target.value;}
    else fix[key]=target.value;
  }
  if(target.dataset.sapGlobal==='type')$$('[data-sap-for]',e.element).forEach(el=>el.hidden=el.dataset.sapFor!==target.value);
}
function sapReportText(e){
  if(!e.plan)return '';
  const plan=e.plan,saved=stkData().transactions.filter(t=>e.saved.includes(t.id)),lines=['HISAAB — SMART PASTE RESULT','Account: '+(Cloud.user?.email||'Local browser data'),'Combo source: '+plan.batch,'Saved movements: '+saved.length,'Unresolved items: '+plan.unresolved.length,'','SAVED (original units / dates):',...saved.map(t=>[t.productName,t.date,STK_KINDS[t.type],t.qty+' '+t.unit,t.id].join(' | ')),'','ALREADY RECORDED / REPEATED / EXPLICITLY SKIPPED:',...plan.rows.filter(r=>r.action==='skip'&&!e.saved.includes(r.existingId||r.id)).map(r=>r.productName+' | '+r.skipReason),'','UNRESOLVED — NOT SAVED:',...plan.unresolved.flatMap(b=>[b.name+' · source line '+b.line,...b.issues.map(i=>'  - '+i.message),'  Original: '+b.raw]),...plan.issues.map(i=>i.message),'','SAFE MAPPING / CORRECTIONS:',...plan.corrections.map(c=>c.message),'','CHECKS / WARNINGS:',...plan.warnings,'','Original paste (private; do not forward without checking):',e.sourceText];return lines.join('\n');
}
document.addEventListener('paste',event=>{
  if(event.target.id!=='sapText'||!sapCurrent(sapEditor))return;
  const e=sapEditor,target=event.target,text=event.clipboardData?.getData('text/plain');
  if(typeof text!=='string'||!text){event.preventDefault();sapStatus('Plain text copy/paste karein. Screenshot ke liye Screenshot / manual review chunein.',true);return;}
  event.preventDefault();if(e.saved.length){sapStatus('Agli list ke liye Agla paste chunein. Saved source mein doosra message mix nahi hoga.',true);return;}
  const next=target.value.slice(0,target.selectionStart)+text+target.value.slice(target.selectionEnd);
  if(next.length>SAP_MAX_TEXT){sapDraftChanged(e,target);sapStatus('Paste 20,000 characters se bada hai. Truncate / partial save nahi hua; message ko complete lists mein baantein.',true);return;}
  target.setRangeText(text,target.selectionStart,target.selectionEnd,'end');sapDraftChanged(e,target);
  const serial=e.serial;clearTimeout(e.timer);e.timer=setTimeout(()=>{if(sapCurrent(e)&&e.serial===serial)sapRun();},0);
});
document.addEventListener('input',event=>{const e=sapEditor,target=event.target;if(!sapCurrent(e)||!target.closest('#sapDialog')||target.type==='checkbox'||target.tagName==='SELECT')return;if(target.id==='sapText')sapDraftChanged(e,target);else sapField(e,target);});
document.addEventListener('change',event=>{const e=sapEditor,target=event.target;if(sapCurrent(e)&&target.closest('#sapDialog')&&(target.type==='checkbox'||target.tagName==='SELECT'))sapField(e,target);});
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-sap]');if(!button||button.disabled)return;event.preventDefault();
  try{
    const action=button.dataset.sap;if(action==='open'||action==='next'){sapOpen();return;}
    const e=sapEditor;if(!sapCurrent(e))return;
    if(action==='process')sapRun();
    if(action==='role'){const input=$('#sap_'+button.dataset.role),name=steMemberNames(e.plan?.parsed.tags||[])[Number(button.dataset.person)];if(input&&name){input.value=name;sapField(e,input);}}
    if(action==='review'){if(e.busy)return;const text=e.saved.length?'':$('#sapText').value;sapCancel();stmOpen();if(text)$('#stmText').value=text;}
    if(action==='report'){stkCheck(e.context);const text=sapReportText(e);if(text)sapFile(e,new Blob([text],{type:'text/plain;charset=utf-8'}),'Smart-Stock-result.txt');}
    if(action==='pdf')sapPdf(e,button.dataset.id);
  }catch(error){sapStatus(error.message,true);}
});
/* v3.42 SMART STOCK PASTE END */
