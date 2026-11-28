/* v3.44 approved premium Stock PDF: presentation only, synthetic data only. */
const {assert,fs,path,html,KEY,devices,errors,boot,snapshot,same,click,wait,blobBytes,Server}=require('./stock-qa');
const {clone,product,movement,blank,legacy}=require('./fixtures/stock');
const {overview,many,EXAMPLE_ROWS}=require('./fixtures/stock-pdf');
const {withoutStockPdf,hooks}=require('./stock-pdf-compat');
const {createHash}=require('node:crypto');
const original=fs.readFileSync(path.join(__dirname,'..','Hisaab-Pro-v3.40.html'),'utf8');
const logo='data:image/jpeg;base64,'+fs.readFileSync(path.join(__dirname,'fixtures/company-logo.jpg')).toString('base64');
const altLogo='data:image/jpeg;base64,'+fs.readFileSync(path.join(__dirname,'fixtures/company-logo-alt.jpg')).toString('base64');
const arg=process.argv.indexOf('--artifacts'),OUT=arg<0?null:path.resolve(process.argv[arg+1]);if(OUT)fs.mkdirSync(OUT,{recursive:true});
let passed=0,failed=0;
async function test(label,fn){const at=devices.length;try{await fn();passed++;console.log('  ✅ '+label);}catch(error){failed++;console.error('  ❌ '+label+'\n'+error.stack);}finally{devices.splice(at).forEach(d=>{d.Q.closeModal();d.close();});}}
function start(data=overview(),options={}){
  const source=(options.source||html).replace('  stock: { data: stkData,','  designQA: { summary:spdSummary, quantity:spdQuantity },\n  stock: { data: stkData,');
  return boot(data,{...options,source});
}
const stats=(d,r)=>d.H.designQA.summary(r);
function trace(d,report){
  const texts=[],fills=[],ops=[],proto=d.H.PdfDoc.prototype,old={text:proto.text,rect:proto.rect,op:proto.op};
  proto.text=function(x,y,size,text,opt={}){texts.push({page:this.pages.indexOf(this.cur),x,y,size,text:String(text),opt});return old.text.apply(this,arguments);};
  proto.rect=function(x,y,w,h,color){fills.push({page:this.pages.indexOf(this.cur),x,y,w,h,color});return old.rect.apply(this,arguments);};
  proto.op=function(value){ops.push(value);return old.op.apply(this,arguments);};
  try{return {...d.I.pdfString(report),texts,fills,ops};}finally{Object.assign(proto,old);}
}
function checkPdf(out){
  assert.ok(out.str.startsWith('%PDF-1.4'));const at=Number(/startxref\s+(\d+)\s+%%EOF$/.exec(out.str)[1]);assert.equal(out.str.slice(at,at+4),'xref');
  const lines=out.str.slice(at).split('\n'),count=Number(lines[1].split(' ')[1]);for(let id=1;id<count;id++){const offset=Number(lines[id+2].slice(0,10));assert.ok(out.str.slice(offset).startsWith(id+' 0 obj\n'));}
  assert.ok(out.texts.every(t=>t.x>=40&&t.x<=555.29&&t.y>=31&&t.y<=811),'all text baselines inside paper/footer');
  assert.ok(!/\b(?:NaN|Infinity|undefined)\b/.test(out.ops.join('\n')));
}
function artifact(name,out){if(OUT)fs.writeFileSync(path.join(OUT,name),out.str,'latin1');}
const texts=out=>out.texts.map(t=>t.text);
async function ready(d){for(let i=0;i<200;i++){if(d.$('#stePdfDownload')&&!d.$('#stePdfDownload').disabled)return;await wait(5);}throw Error('PDF not ready: '+d.$('#stePdfError')?.textContent);}
(async()=>{
 console.log('\n▸ Premium Stock PDF v3.44 — approved design, exact numbers, no writes');
 await test('three exact hooks and one renderer restore EVERY immutable v3.40 byte; release equals canonical',()=>{
   assert.equal(hooks.length,3);assert.equal(withoutStockPdf(html),original);assert.equal(createHash('sha256').update(original).digest('hex'),'e85d8df64c37119655f8cc5e75b2024b9614217108d09543f71fc4c3aad2abb3');assert.equal(html,fs.readFileSync(path.join(__dirname,'..','Hisaab-Pro-v3.44.html'),'utf8'));
 });
 await test('upgrade preserves every raw saved byte, stock value, audit, logo and unrelated module',()=>{
   const data=overview();data.settings.companyLogo=logo;const old=boot(data,{source:original}),d=start(data);assert.equal(d.w.localStorage.getItem(KEY),old.w.localStorage.getItem(KEY));same(d.S.data,old.S.data);same(d.dump(),old.dump());assert.equal(d.$('[data-ver]').textContent,'3.44');
 });
 await test('summary cards and health use real matching product identities / exact units / saved minima',()=>{
   const d=start(),r=d.I.report({kind:'stock'}),s=stats(d,r);assert.equal(s.products,8);assert.equal(s.movements,8);assert.equal(s.units.length,4);assert.equal(s.low,1);assert.equal(s.healthy,7);
   same(s.units.map(t=>[t.unit,String(t.available)]),[['box','166000'],['pcs','60000'],['roll','12000'],['set','28000']]);
   EXAMPLE_ROWS.forEach(([name,unit,totalIn,out,sale,minQty])=>{const row=r.rows.find(p=>p.name===name);assert.equal(row.unit,unit);assert.equal(row.totalIn,totalIn);assert.equal(row.totalOut,out);assert.equal(row.totalSale,sale);assert.equal(row.available,totalIn-out-sale);assert.equal(row.minQty,minQty);});
 });
 await test('approved dark masthead / mint balances / ring / rounded cards replace the plain table using vector operations',()=>{
   const d=start(),before=snapshot(d),out=trace(d,d.I.report({kind:'stock'}));checkPdf(out);
   assert.ok(out.fills.some(f=>f.h>200&&f.color.join(',')==='0.047,0.09,0.15'));assert.ok(out.fills.some(f=>f.color.join(',')==='0.92,0.98,0.95'));assert.ok(out.ops.filter(s=>s.endsWith('c h B Q')).length>=10);assert.ok(out.ops.filter(s=>s.endsWith(' S Q')).length>10);
   for(const label of ['STOCK','OVERVIEW','STOCK HEALTH','7 Healthy / 1 Low','Inventory details','AVAILABLE BY UNIT','LOW STOCK','166','60','12','28'])assert.ok(texts(out).includes(label),label);
   assert.ok(!texts(out).some(t=>/DESIGN CONCEPT|SAMPLE DATA|LIVE BALANCE|14 NOV 2026/.test(t)),'no mockup labels, live claim or frozen date');assert.equal(snapshot(d),before);artifact('premium-overview.pdf',out);
 });
 await test('the complete eight-row design including four unit tiles and reorder note fits one A4 page',()=>{
   const d=start(),out=trace(d,d.I.report({kind:'stock'}));assert.equal((out.str.match(/\/Type \/Page\b/g)||[]).length,1);assert.ok(texts(out).some(t=>t.startsWith('REORDER WATCH: 1 product')));assert.equal(texts(out).filter(t=>t.startsWith('Opening:')).length,8);assert.equal(texts(out).filter(t=>t.startsWith('Min:')).length,8);
 });
 for(const [label,filters,count,low]of [['product',{product:'design-product-0'},1,0],['low',{low:true},1,1],['search',{q:'Cloth'},1,0],['combined',{q:'Chalk',low:true,product:'design-product-5'},1,1]])await test(label+' filters restrict ALL metrics, warnings, units and table to matching records',()=>{
   const d=start(),r=d.I.report({kind:'stock',filters}),s=stats(d,r),out=trace(d,r);assert.equal(s.products,count);assert.equal(s.low,low);assert.equal(s.units.length,1);assert.equal(texts(out).filter(t=>t.startsWith('Opening:')).length,count);assert.ok(texts(out).includes((count-low)+' Healthy / '+low+' Low'));checkPdf(out);artifact('premium-filtered-'+label+'.pdf',out);
 });
 await test('minimum equality is healthy, minimum zero is not an invented warning, zero stock remains explicit',()=>{
   const data=overview();for(const p of data.settings.stockInventory.products)p.minQty=0;const d=start(data);let r=d.I.report({kind:'stock'});assert.equal(stats(d,r).low,0);assert.equal(stats(d,r).healthy,8);let out=trace(d,r);assert.ok(!texts(out).some(t=>t.startsWith('REORDER WATCH')));
   const p=d.I.saveProduct({name:'Exact minimum',unit:'crate',openingQty:0,minQty:0,date:'2026-11-01'});r=d.I.report({kind:'stock',filters:{product:p.id}});assert.equal(stats(d,r).low,0);assert.equal(stats(d,r).units[0].available,0n);assert.ok(texts(trace(d,r)).includes('0'));
   d.I.saveProduct({...p,minQty:1});r=d.I.report({kind:'stock',filters:{product:p.id}});assert.equal(stats(d,r).low,1);assert.equal(stats(d,r).healthy,0);checkPdf(trace(d,r));
 });
 await test('fractions group in exact thousandths; arbitrary case-sensitive legacy/custom unit labels never merge',()=>{
   const data=clone(legacy),s=blank();['box','Box','custom unit','box'].forEach((unit,i)=>{const p=product('u'+i,{name:'Unit sample '+i,unit,minQty:0});s.products.push(p);s.transactions.push(movement('u-in'+i,p.id,'in',[.1,.4,2,.2][i],'2026-11-01',{productName:p.name,unit}));});data.settings.stockInventory=s;
   const d=start(data),summary=stats(d,d.I.report({kind:'stock'}));assert.equal(summary.units.length,3);assert.equal(summary.units.find(t=>t.unit==='box').available,300n);assert.equal(summary.units.find(t=>t.unit==='Box').available,400n);assert.equal(d.H.designQA.quantity(300n),'0.3');assert.equal(d.H.designQA.quantity(12345678901n),'1,23,45,678.901');assert.equal(d.H.designQA.quantity(1000n),'1');assert.equal(d.H.designQA.quantity(1n),'0.001');
 });
 await test('cross-product totals above MAX_SAFE_INTEGER retain every digit with BigInt, without mixed-unit arithmetic',()=>{
   const d=start(),r=d.I.report({kind:'stock'});r.rows=Array.from({length:100},(_,i)=>({...r.rows[0],id:'huge-'+i,available:999999999999.999,low:false}));const s=stats(d,r);assert.equal(s.units[0].available,99999999999999900n);assert.equal(d.H.designQA.quantity(s.units[0].available),'9,99,99,99,99,99,999.9');
 });
 await test('In / Out / Sales summaries preserve separate directions and use only filtered movements, never summed balances',()=>{
   const d=start(),r=d.I.report({kind:'history',filters:{from:'2026-11-02',to:'2026-11-03',product:'design-product-0'}}),s=stats(d,r);assert.equal(s.products,1);assert.equal(s.movements,2);assert.equal(s.units[0].in,0n);assert.equal(s.units[0].out,10000n);assert.equal(s.units[0].sale,20000n);const out=trace(d,r);assert.ok(texts(out).includes('MATCHING MOVEMENTS BY UNIT'));assert.ok(texts(out).includes('90 box'));checkPdf(out);artifact('premium-history.pdf',out);
 });
 await test('original product opening / current / future dates and original exact quantities are not replaced by design-preview values',()=>{
   const d=start(),p=d.I.data().products[0];d.I.saveEntry({productId:p.id,type:'in',qty:2.125,date:'2027-01-01',party:'Future supplier'});const before=snapshot(d),r=d.I.report({kind:'stock',filters:{product:p.id}}),out=trace(d,r);assert.equal(r.rows[0].available,92.125);assert.ok(texts(out).includes('Opening: 2026-11-01'));assert.ok(texts(out).includes('92.125'));assert.ok(texts(out).some(t=>t.includes('future-dated')));assert.equal(snapshot(d),before);
 });
 for(const [name,data]of [['128-products-logo',many(128)],['long-names-logo',many(65,{long:true})],['many-custom-units-logo',many(61,{manyUnits:true})]])await test(name+' uses compact continuation headers and keeps every product/date/unit/minimum/total',()=>{
   data.settings.companyLogo=logo;const d=start(data),before=snapshot(d),r=d.I.report({kind:'stock'}),out=trace(d,r),pages=(out.str.match(/\/Type \/Page\b/g)||[]).length;checkPdf(out);assert.ok(pages>1);assert.equal((out.str.match(/cm \/CompanyLogo Do Q/g)||[]).length,pages);assert.equal((out.str.match(/\/Subtype \/Image/g)||[]).length,1);assert.equal(texts(out).filter(t=>t.startsWith('Opening:')).length,r.rows.length);assert.equal(texts(out).filter(t=>t.startsWith('Min:')).length,r.rows.length);assert.equal(texts(out).filter(t=>t==='OVERVIEW').length,1);assert.equal(texts(out).filter(t=>t==='Available Stock · continued').length,pages-1);assert.equal(snapshot(d),before);artifact('premium-'+name+'.pdf',out);
 });
 await test('saved snapshot logo is used, even if global settings change; absent/invalid logos never become a fake JBB monogram',()=>{
   const data=overview();data.settings.companyLogo=logo;const d=start(data),r=d.I.report({kind:'stock'});d.S.data.settings.companyLogo=altLogo;let out=trace(d,r);assert.ok(out.str.includes(Buffer.from(logo.slice(23),'base64').toString('latin1')));assert.ok(!out.str.includes(Buffer.from(altLogo.slice(23),'base64').toString('latin1')));
   for(const value of ['',null,'https://example.test/logo.jpg']){r.settings.companyLogo=value;out=trace(d,r);assert.equal((out.str.match(/CompanyLogo Do/g)||[]).length,0);assert.ok(!texts(out).some(t=>/JAI BALAJI|JBB/.test(t)));}
 });
 await test('report inputs and all returned projections remain detached and unchanged by design rendering',()=>{
   const data=overview(),d=start(data),before=snapshot(d),r=d.I.report({kind:'stock'},data),copy=clone(r);trace(d,r);same(r,copy);same(data,overview());assert.equal(snapshot(d),before);
 });
 await test('real download obtains exactly the premium writer bytes with no storage / inventory / mocked-cloud writes',async()=>{
   const db=new Server(),d=start(overview(),{db});await d.login();d.H.go('stock');const before=snapshot(d),writes=db.writes.length;click(d,'[data-ste-pdf="current"]');await ready(d);const expected=d.I.pdfString(d.I.report({kind:'stock',filters:{...d.I.ui()}}));click(d,'#stePdfDownload');assert.equal(d.files.length,1);assert.equal((await blobBytes(d,d.files[0].blob)).toString('latin1'),expected.str);assert.equal(d.files[0].name,expected.name);assert.equal(snapshot(d),before);assert.equal(db.writes.length,writes);
 });
 await test('empty/inverted/deleted-product reports remain refused, not replaced by decorative sample content',()=>{
   const d=start(),before=snapshot(d);for(const options of [{kind:'stock',filters:{q:'NO SUCH PRODUCT'}},{kind:'stock',filters:{product:'deleted'}},{kind:'history',filters:{from:'2026-11-03',to:'2026-11-01'}}])assert.throws(()=>d.I.report(options));assert.equal(snapshot(d),before);
 });
 await test('all premium PDF / upgrade / export paths have no uncaught JavaScript errors',()=>same(errors,[]));
 console.log('\n'+(failed?'❌':'✅')+' PREMIUM STOCK PDF: '+passed+' checks pass'+(failed?', '+failed+' FAIL':''));process.exitCode=failed?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;});
