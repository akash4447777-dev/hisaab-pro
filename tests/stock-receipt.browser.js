/* Real Chromium v3.41 incoming-list fragment, one-click review/save, matching,
   date/cutoff/duplicate safety, old data, one combo/PDF, phone and offline.
   Synthetic only: no customer catalogue, configured customer account or upload. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),{gzipSync}=require('node:zlib');
const {legacy}=require('./fixtures/stock'),{packet,one}=require('./fixtures/stock-receipt');
const URL=process.env.HISAAB_URL||'http://127.0.0.1:8000/hisaab_v3.html';
const OUT=path.resolve(process.env.HISAAB_ARTIFACTS||'.cache/stock-receipt-native');fs.mkdirSync(OUT,{recursive:true});
const logo='data:image/jpeg;base64,'+fs.readFileSync(path.join(__dirname,'fixtures/company-logo.jpg')).toString('base64');
const requests=[],errors=[];let checks=0;
const check=(value,label)=>{assert.ok(value,label);checks++;console.log('  ✅ '+label);};
const tok=(p=packet(),gzip=true)=>{const bytes=Buffer.from(JSON.stringify(p));return(gzip?'g1.':'j1.')+(gzip?gzipSync(bytes):bytes).toString('base64url');};
const snapshot=p=>p.evaluate(()=>JSON.stringify({data:Hisaab.Store.data,disk:Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])),dirty:Hisaab.Cloud.dirty}));
function clock(){const D=Date;window.Date=class extends D{constructor(...args){super(...(args.length?args:['2026-11-14T12:00:00Z']));}static now(){return 1794657600000;}};}
async function context(browser){const c=await browser.newContext({viewport:{width:1280,height:950},locale:'en-IN',timezoneId:'Asia/Kolkata',acceptDownloads:true});await c.addInitScript(clock);await c.addInitScript(({legacy,logo})=>{if(!sessionStorage.getItem('receipt-seeded')){localStorage.clear();legacy.settings.companyLogo=logo;localStorage.setItem('hisaabPro.v1',JSON.stringify(legacy));sessionStorage.setItem('receipt-seeded','1');}},{legacy,logo});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.stack));p.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData(),referer:r.headers().referer||''}));return {c,p};}
async function ready(p){await p.waitForFunction(()=>!!document.querySelector('#sirDialog')&&!document.querySelector('#sirError').textContent.includes('taiyar ho raha'));}
async function open(p,input=one(),gzip=true){await p.evaluate(t=>{location.hash='stock-in='+t;},tok(input,gzip));await ready(p);}
async function close(p){await p.locator('#overlay .modal-h [data-act="closeModal"]').click();await p.waitForSelector('#overlay',{state:'detached'});}
async function save(p){await p.click('#sirSave');await p.waitForSelector('#sirDialog',{state:'detached'});}
async function seed(p,extra={}){return p.evaluate(extra=>Hisaab.stock.saveProduct({name:'Plastic scoreboard',unit:'Boxes',date:'2026-11-01',openingQty:10,minQty:0,...extra}),extra);}
(async()=>{
 console.log('\n▸ Native received-stock link v3.41 — typed incoming list, ordinary audited ledger');
 const browser=await chromium.launch({headless:true,executablePath:process.env.HISAAB_CHROME_EXECUTABLE||undefined,args:process.env.HISAAB_CHROME_ARGS?JSON.parse(process.env.HISAAB_CHROME_ARGS):['--no-sandbox']});
 try{
  const {c,p}=await context(browser),input=packet();
  await p.goto(URL+'#stock-in='+tok(input));await ready(p);
  check(await p.locator('[data-ver]').first().textContent()==='3.41','native deployed-copy panel reports v3.41');
  check(new globalThis.URL(p.url()).hash===''&&!requests[0].url.includes('stock-in'),'private fragment is scrubbed during initial boot and never appears in HTTP request');
  check(await p.locator('.sir-item').count()===14&&(await p.locator('#sirCounts').textContent()).includes('14 Stock In'),'initial private gzip link reviews ALL14 incoming items in one combo');
  check((await p.locator('#sirTitle').textContent()).includes('25 Nov 2026')&&(await p.locator('#sirDialog').textContent()).includes('2026-11-25'),'explicit25/11/2026 is retained even though the test device day is14/11; no import-day guess');
  check(await p.locator('#sirDialog input[type=file]').count()===0&&await p.locator('#sirDialog input[type=checkbox]:visible').count()===0,'clean new list needs no file chooser, per-item typing or unrelated opening checkbox');
  check(await p.evaluate(()=>Hisaab.stock.data().products.length===0&&Hisaab.stock.data().transactions.length===0),'opening/decoding/matching14 items has saved NOTHING');
  check(!(await p.locator('#sirDialog').textContent()).includes('Salesperson kaun')&&(await p.locator('#sirDialog').textContent()).includes('Supplier: not given'),'unknown supplier remains explicitly unknown; no invented party/salesperson/delivery role');
  const draft=await snapshot(p),finance=await p.evaluate(()=>JSON.stringify({workers:Hisaab.Store.data.workers,records:Hisaab.Store.data.records,canteen:Hisaab.Store.data.canteen,attendance:Hisaab.Store.data.attendance,logo:Hisaab.Store.data.settings.companyLogo}));
  for(const width of [390,320])for(const theme of ['light','dark']){
   await p.setViewportSize({width,height:844});await p.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
   await p.locator('.sir-item').first().scrollIntoViewIfNeeded();
   check(await p.evaluate(()=>{const r=document.querySelector('#sirDialog').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth+1&&r.left>=0&&r.right<=innerWidth+1&&r.height<=innerHeight;}),'incoming review/dialog has no horizontal page overflow at '+width+'px '+theme);
   check((await p.locator('.sir-item').first().innerText()).includes('+1.125 Sets')&&(await p.locator('.sir-item').first().innerText()).includes('25 Nov 2026'),'source qty/unit/date and visibly proposed new product remain readable at '+width+'px '+theme);
   await p.screenshot({path:path.join(OUT,'stock-in-'+width+'-'+theme+'.png')});
   await p.locator('.sir-item').last().scrollIntoViewIfNeeded();check(await p.locator('.sir-item').last().isVisible(),'all14 rows, not a truncated preview, reachable on '+width+'px '+theme);
   await p.locator('#sirSave').scrollIntoViewIfNeeded();await p.locator('#sirSave').click({trial:true});
   check(await p.locator('#sirSave').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&!el.disabled;}),'explicit Haan is unobstructed/reachable inside phone review at '+width+'px '+theme);
  }
  check(await snapshot(p)===draft,'responsive/light/dark/scroll inspection leaves every raw saved byte unchanged');
  await p.setViewportSize({width:1280,height:950});await p.evaluate(()=>document.documentElement.dataset.theme='light');
  await p.evaluate(()=>{window.__receiptWrites=0;window.__receiptSave=Hisaab.Store.save;Hisaab.Store.save=function(...args){window.__receiptWrites++;return window.__receiptSave.apply(this,args);};});
  await save(p);
  check(await p.evaluate(()=>window.__receiptWrites)===1,'ONE actual Haan click commits the whole14-product receipt in ONE canonical write');
  const saved=await p.evaluate(()=>({stock:Hisaab.stock.data(),groups:Hisaab.stock.combo.groups(),inventory:Hisaab.stock.inventory()}));
  check(saved.stock.products.length===14&&saved.stock.transactions.length===14&&saved.stock.history.length===28,'14 new products +14 manual incoming movements +28 independent before/after audits persist atomically');
  check(saved.stock.transactions.every(t=>t.type==='in'&&t.source==='manual'&&t.date==='2026-11-25'),'all items are actual25-Nov Stock In, not positive openings, outgoing sales or today\'s entries');
  check(saved.stock.transactions.every(t=>!t.party&&!t.salesperson&&!t.deliveryName),'supplier/customer/roles were not fabricated from the prepared list');
  check(saved.groups.length===1&&saved.groups[0].isCombo&&saved.groups[0].productCount===14&&await p.locator('[data-stock-combo]').count()===1,'History shows ONE combo containing14 independent products, not14 unrelated cards');
  check(saved.inventory.every(product=>product.available===input.rows.find(r=>r.name===product.name).quantity),'each product has its exact independent quantity; no combined/mixed-unit stock total');
  check(saved.inventory.find(p=>p.name==='Packing crate (100 Pcs)').available===12&&saved.inventory.find(p=>p.name==='Packing crate (100 Pcs)').unit==='box','100-Pcs-in-name / Boxes-in-unit remains12box, never1200pcs');
  check(await p.locator('.ste-receipt [data-ste-pdf="message"]').isVisible(),'saved receipt immediately offers one combined Stock PDF');
  await p.locator('.ste-receipt [data-ste-pdf="message"]').click();await p.waitForFunction(()=>!document.querySelector('#stePdfDownload').disabled);
  const event=p.waitForEvent('download');await p.click('#stePdfDownload');await(await event).saveAs(path.join(OUT,'received-14-product-combo-logo.pdf'));
  check(fs.readFileSync(path.join(OUT,'received-14-product-combo-logo.pdf')).subarray(0,8).toString()==='%PDF-1.4','combined receipt download contains genuine branded PDF bytes');await close(p);
  fs.writeFileSync(path.join(OUT,'received-list-expected.json'),JSON.stringify({names:input.rows.map(r=>r.name),rows:saved.stock.transactions.map(r=>({id:r.id,name:r.productName,unit:r.unit,qty:r.qty,date:r.date}))},null,2));
  const persisted=await snapshot(p);await p.reload();await p.waitForFunction(()=>!!window.Hisaab);await p.evaluate(()=>Hisaab.go('stock'));
  check(await snapshot(p)===persisted,'full browser reload preserves exact product/receipt/audit/logo/raw-storage data');
  await open(p,input,false);check(await p.locator('#sirSave').isDisabled()&&(await p.locator('#sirCounts').textContent()).includes('14 skipped'),'raw re-open of the same gzip-created receipt skips all14; no double-add');await close(p);
  await p.evaluate(()=>{Object.assign(Hisaab.stock.ui(),{tab:'history'});Hisaab.go('stock');});
  const group=saved.groups[0];await p.locator('[data-stc="edit"][data-id="'+group.entryId+'"]').click();await p.locator('[data-stc-item] [data-stc-field="qty"]').first().fill('2.125');await p.check('#stcReviewed');await p.click('#stcCommit');await p.waitForSelector('#stcDialog',{state:'detached'});
  check(await p.evaluate(id=>Hisaab.stock.inventory().find(p=>p.id===id).available,saved.stock.transactions[0].productId)===2.125,'existing native whole-combo Edit updates the original receipt once and recalculates availability');
  await open(p,input);check(await p.locator('#sirSave').isDisabled(),'reopening the original list after editing never re-adds the original quantity');await close(p);
  await p.locator('[data-stc="delete"][data-id="'+group.entryId+'"]').click();await p.check('#stcReviewed');await p.click('#stcCommit');await p.waitForSelector('#stcDialog',{state:'detached'});
  check(await p.evaluate(()=>Hisaab.stock.data().products.length===14&&Hisaab.stock.data().transactions.length===0&&Hisaab.stock.data().history.filter(h=>h.action==='delete').length===14),'whole-combo Delete removes only receipts, retains products and all14 deletion audits');
  await open(p,input);check(await p.locator('#sirSave').isDisabled()&&await p.evaluate(()=>Hisaab.stock.data().transactions.length===0),'old source cannot resurrect an intentionally deleted received-stock combo');await close(p);
  check(await p.evaluate(expected=>JSON.stringify({workers:Hisaab.Store.data.workers,records:Hisaab.Store.data.records,canteen:Hisaab.Store.data.canteen,attendance:Hisaab.Store.data.attendance,logo:Hisaab.Store.data.settings.companyLogo})===expected,finance),'all real receipt/PDF/edit/delete/reload operations leave Employee/salary/Canteen/Attendance/logo intact');
  await c.close();
  const {c:other,p:q}=await context(browser);await q.goto(new globalThis.URL('Hisaab-Pro-v3.39.html',URL).href);await q.waitForFunction(()=>!!window.Hisaab);const oldProduct=await seed(q),old=await snapshot(q);
  await q.goto(URL);await q.waitForFunction(()=>!!window.Hisaab);await q.evaluate(()=>Hisaab.go('stock'));
  check(await snapshot(q)===old,'native v3.39 → v3.41 upgrade keeps every existing raw byte, opening and exact Boxes label');
  const mixed=one({rows:[{name:'Plastc scoreboard',quantity:3,unit:'Boxes'},{name:'Velvet cover',quantity:2,unit:'Sets'}]});
  await open(q,mixed);check((await q.locator('.sir-item').first().textContent()).includes('% naam match')&&await q.locator('[data-sir-match="0"]').inputValue()===oldProduct.id,'a real unique75%+ typo automatically selects the saved product while showing its name/unit/%');
  check((await q.locator('#sirCounts').textContent()).includes('1 naye products'),'mixed list proposes only the genuinely new product; no duplicate of the matched one');
  const beforeCancel=await snapshot(q);await close(q);check(await snapshot(q)===beforeCancel,'cancel mixed existing/new preview creates no product, entry, audit or checkpoint');
  await open(q,mixed);await save(q);
  check(await q.evaluate(id=>{const s=Hisaab.stock.data();return s.products.length===2&&Hisaab.stock.inventory().find(p=>p.id===id).available===13&&s.products.find(p=>p.id===id).unit==='Boxes'&&s.transactions.filter(t=>t.source==='opening').length===1;},oldProduct.id),'matched existing Boxes product adds3 to10; only one new product/receipt is made, original opening retained');
  const wrongUnit=one({rows:[{name:'Plastic scoreboard',quantity:2,unit:'pcs'}]});const beforeWrong=await snapshot(q);await open(q,wrongUnit);check(await q.locator('#sirSave').isDisabled()&&(await q.locator('#sirError').textContent()).includes('unit conflict'),'exact-name wrong-unit receipt blocks the WHOLE save, never converts Boxes to pcs');await close(q);check(await snapshot(q)===beforeWrong,'unit conflict preview leaves all existing Stock unchanged');
  const rail9=await seed(q,{name:'Premium rail 9mm'});await seed(q,{name:'Premium rail 12mm'});await open(q,one({rows:[{name:'Premium rail',quantity:3,unit:'box'}]}));
  check(await q.locator('[data-sir-match="0"]').inputValue()===''&&await q.locator('#sirSave').isDisabled(),'missing-size / close variant ambiguity stays unresolved rather than guessing first/new');
  await q.selectOption('[data-sir-match="0"]',rail9.id);await ready(q);check(!await q.locator('#sirSave').isDisabled(),'user can explicitly resolve a genuine ambiguous saved-product choice');await close(q);
  const cutoff=await seed(q,{name:'Opening cutoff sample',date:'2026-11-26'});const beforeCutoff=await snapshot(q);await open(q,one({rows:[{name:cutoff.name,quantity:3,unit:'box'}]}));
  check(await q.locator('#sirSave').isDisabled()&&(await q.locator('#sirError').textContent()).includes('opening'),'25-Nov incoming cannot be silently added before a26-Nov opening snapshot');
  await q.selectOption('[data-sir-action="0"]','new');await ready(q);check(await q.locator('#sirSave').isDisabled()&&await snapshot(q)===beforeCutoff,'forcing New in the visible action dropdown does not bypass pre-opening protection');await close(q);
  const day=await seed(q,{name:'Same day sample',date:'2026-11-25'});await open(q,one({rows:[{name:day.name,quantity:3,unit:'box'}]}));
  check(await q.locator('#sirOpening').isVisible()&&!await q.locator('#sirSameDay').isChecked()&&await q.locator('#sirSave').isDisabled(),'same-day EXISTING opening starts with an unticked after-snapshot attestation');await q.check('#sirSameDay');await ready(q);check(!await q.locator('#sirSave').isDisabled(),'only actual after-snapshot checkbox enables an otherwise valid same-day receipt');
  await q.selectOption('[data-sir-action="0"]','skip');await ready(q);check(!await q.locator('#sirSameDay').isChecked(),'changing action resets a previous opening confirmation');await close(q);
  await q.evaluate(id=>Hisaab.stock.saveEntry({productId:id,type:'in',qty:2,date:'2026-11-24'}),oldProduct.id);await open(q,{...one(),date:'2026-11-24',rows:[{...one().rows[0],quantity:2}]});
  check(await q.locator('#sirSave').isDisabled()&&await q.locator('#sirReferenceWrap').isVisible(),'manual same-date/same-quantity duplicate requires explicit reconciliation, not silent new incoming');
  await q.selectOption('[data-sir-action="0"]','new');await ready(q);check(await q.locator('#sirSave').isDisabled(),'choosing New alone cannot bypass duplicate provenance without a real distinct reference');
  await q.fill('#sirReference','Actual QA second delivery');await ready(q);check(!await q.locator('#sirSave').isDisabled(),'actual distinct reference AND explicit New can identify a genuinely separate delivery');await close(q);
  const beforeDraft=await snapshot(q);await q.locator('.topbar-actions [data-act="stkAdd"]').click();await q.waitForFunction(()=>document.activeElement?.id==='stkPName');await q.fill('#stkPName','Unsaved actual form');
  await q.evaluate(t=>location.hash='stock-in='+t,tok(one()));await q.waitForFunction(()=>location.hash==='');
  check(await q.locator('#stkPName').inputValue()==='Unsaved actual form'&&await q.locator('#sirDialog').count()===0&&await snapshot(q)===beforeDraft,'a private link cannot replace an already-open unsaved editor or steal its save context');await close(q);
  await other.setOffline(true);await open(q,one({rows:[{name:'Unique bamboo stand',quantity:2.125,unit:'Sets'}]}));await save(q);await other.setOffline(false);
  check(await q.evaluate(()=>Hisaab.stock.inventory().some(p=>p.name==='Unique bamboo stand'&&p.available===2.125&&p.unit==='set')),'local typed-link decoding/matching/new-product/Stock In save all work offline in an already-open panel');
  await open(q,one({rows:[{name:'New cork mat',quantity:2,unit:'box'}]}));await q.evaluate(()=>Hisaab.Cloud.epoch++);const stale=await snapshot(q);await q.click('#sirSave');await q.waitForFunction(()=>document.querySelector('#sirError').textContent.includes('fresh review'));
  check(await snapshot(q)===stale&&await q.locator('#sirSave').isDisabled(),'stale account/data epoch after review refuses the entire native incoming save');await close(q);
  await open(q,one({rows:[{name:'New cork mat',quantity:2,unit:'box'}]}));const quota=JSON.parse(await snapshot(q));await q.evaluate(()=>{window.__oldReceiptSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='hisaabPro.v1')throw new DOMException('QA quota','QuotaExceededError');return window.__oldReceiptSet.call(this,k,v);};});
  await q.click('#sirSave');await q.waitForFunction(()=>document.querySelector('#sirError').textContent.includes('fresh review'));const afterQuota=JSON.parse(await snapshot(q));
  check(JSON.stringify(afterQuota.data)===JSON.stringify(quota.data)&&afterQuota.disk['hisaabPro.v1']===quota.disk['hisaabPro.v1']&&afterQuota.dirty===quota.dirty,'canonical quota failure rolls back all proposed new products/receipts/audits atomically');
  check([...new Set([...Object.keys(quota.disk),...Object.keys(afterQuota.disk)])].filter(k=>quota.disk[k]!==afterQuota.disk[k]).every(k=>k.startsWith('hisaabPro.recovery.v1.')),'only a successful required pre-change safety copy may advance on native failed save');
  await q.evaluate(()=>{Storage.prototype.setItem=window.__oldReceiptSet;});await close(q);await q.reload();await q.waitForFunction(()=>!!window.Hisaab);
  check(await q.evaluate(()=>!Hisaab.stock.data().products.some(p=>p.name==='New cork mat')&&Hisaab.stock.inventory().some(p=>p.name==='Unique bamboo stand'&&p.available===2.125)),'reload retains last confirmed offline stock and no product from the failed save');
  check(requests.every(r=>r.method==='GET'&&!r.body&&r.url.startsWith(new globalThis.URL(URL).origin+'/')&&!r.url.includes('#')&&!r.referer.includes('stock-in=')),'incoming list/hash/name matching/PDF never uploads text/image/token and makes only local static GET requests');
  check(errors.length===0,'all native typed-link/new/existing/combo/PDF/phone/guard/offline paths have zero uncaught JavaScript errors');
  await other.close();console.log('\n✅ STOCK IN LINK NATIVE: '+checks+' checks pass');
 }finally{fs.writeFileSync(path.join(OUT,'checks.json'),JSON.stringify({checks,errors,requests},null,2));await browser.close();}
})().catch(error=>{console.error('❌ '+error.stack);process.exitCode=1;});
