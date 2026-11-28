/* Native v3.44: ONE party/message/combo, whole-combo correction, actual combined
   PDF downloads and phone layout. Only disposable synthetic browser accounts. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {legacy}=require('./fixtures/stock');
const {mixed,catalogue,saleOptions}=require('./fixtures/stock-message');
const URL=process.env.HISAAB_URL||'http://127.0.0.1:8000/hisaab_v3.html';
const OUT=path.resolve(process.env.HISAAB_ARTIFACTS||'.cache/stock-combo-native');fs.mkdirSync(OUT,{recursive:true});
const logo='data:image/jpeg;base64,'+fs.readFileSync(path.join(__dirname,'fixtures/company-logo.jpg')).toString('base64');
const errors=[],requests=[];let checks=0;
function check(value,label){assert.ok(value,label);checks++;console.log('  ✅ '+label);}
function clock(){const D=Date;window.Date=class extends D{constructor(...args){super(...(args.length?args:['2026-11-14T12:00:00Z']));}static now(){return 1794657600000;}};}
const snapshot=p=>p.evaluate(()=>JSON.stringify({data:Hisaab.Store.data,disk:Object.fromEntries(Object.keys(localStorage).sort().map(key=>[key,localStorage.getItem(key)])),dirty:Hisaab.Cloud.dirty}));
const finance=p=>p.evaluate(()=>JSON.stringify({workers:Hisaab.Store.data.workers,records:Hisaab.Store.data.records,canteen:Hisaab.Store.data.canteen,attendance:Hisaab.Store.data.attendance,settings:Object.fromEntries(Object.entries(Hisaab.Store.data.settings).filter(([key])=>key!=='stockInventory'))}));
const groups=p=>p.evaluate(()=>Hisaab.stock.combo.groups().filter(g=>g.isCombo));
const get=(p,id)=>p.evaluate(id=>Hisaab.stock.combo.get(id),id);
async function history(p,filters={}){await p.evaluate(filters=>{Object.assign(Hisaab.stock.ui(),{tab:'history',product:'all',from:'',to:'',party:'',salesperson:'',type:'all',q:'',page:0,...filters});Hisaab.go('stock');},filters);}
async function close(p){await p.locator('#modalRoot .modal-h [data-act="closeModal"]').click();await p.waitForSelector('#modalRoot .modal',{state:'detached'});}
async function apply(p,text,options=saleOptions){return p.evaluate(async({text,options})=>{const I=Hisaab.stock,plan=await I.messageImport.plan(text,options);if(!plan.valid)throw Error(plan.errors.join('\n'));return I.messageImport.apply(text,options,I.context(),plan.signature);},{text,options});}
async function source(p,text){await p.click('[data-stm="open"]');await p.fill('#stmText',text);await p.fill('#stmYear','2026');await p.click('#stmPreviewButton');await p.waitForFunction(()=>!!document.querySelector('.stm-heading'));}
async function sale(p){await p.selectOption('#stmType','sale');await p.locator('[data-ste="role"][data-role="salesperson"][data-person="0"]').click();await p.locator('[data-ste="role"][data-role="deliveryName"][data-person="1"]').click();await p.waitForFunction(()=>document.querySelector('#stmError').textContent.startsWith('Ready.'));}
async function writes(p){await p.evaluate(()=>{window.__comboWrites=0;if(window.__comboSave)return;window.__comboSave=Hisaab.Store.save;Hisaab.Store.save=function(...args){window.__comboWrites++;return window.__comboSave.apply(this,args);};});}
async function confirmMessage(p){await p.check('#stmReviewed');await p.click('#stmSave');await p.waitForSelector('#stmDialog',{state:'detached'});}
async function confirmCombo(p){await p.check('#stcReviewed');await p.click('#stcCommit');await p.waitForSelector('#stcDialog',{state:'detached'});}
async function download(p,name){await p.waitForFunction(()=>!document.querySelector('#stePdfDownload').disabled);const event=p.waitForEvent('download');await p.click('#stePdfDownload');const file=await event;await file.saveAs(path.join(OUT,name));check(fs.readFileSync(path.join(OUT,name)).subarray(0,8).toString()==='%PDF-1.4','actual downloaded '+name+' is a PDF, not HTML or a sent-text claim');}
async function shot(p,name){await p.waitForTimeout(150);await p.screenshot({path:path.join(OUT,name)});}
async function context(browser){const c=await browser.newContext({viewport:{width:1280,height:1000},locale:'en-IN',timezoneId:'Asia/Kolkata',acceptDownloads:true});await c.addInitScript(clock);await c.route('**/*',route=>{const r=route.request();requests.push({url:r.url(),method:r.method(),body:r.postData()});return r.url().startsWith(new globalThis.URL(URL).origin+'/')?route.continue():route.abort();});return c;}
async function page(c){const p=await c.newPage();p.on('pageerror',error=>errors.push(error.stack));await p.goto(URL);await p.waitForFunction(()=>!!window.Hisaab);await p.evaluate(({legacy,logo})=>{localStorage.clear();legacy.settings.companyLogo=logo;localStorage.setItem('hisaabPro.v1',JSON.stringify(legacy));},{legacy,logo});await p.reload();await p.waitForFunction(()=>!!window.Hisaab);return p;}
(async()=>{
 console.log('\n▸ Native single-party Stock combos v3.44');
 const browser=await chromium.launch({headless:true,...(process.env.HISAAB_CHROME_EXECUTABLE?{executablePath:process.env.HISAAB_CHROME_EXECUTABLE}:{}),args:process.env.HISAAB_CHROME_ARGS?JSON.parse(process.env.HISAAB_CHROME_ARGS):['--no-sandbox']});
 try{
  const c=await context(browser),p=await page(c);
  // Save in the immutable OLD client first: upgrading must not re-save anything.
  await p.goto(new globalThis.URL('Hisaab-Pro-v3.36.html',URL).href);await p.waitForFunction(()=>!!window.Hisaab);
  await p.evaluate(rows=>rows.forEach(([name,unit,openingQty])=>Hisaab.stock.saveProduct({name,unit,openingQty,minQty:0,date:'2026-11-01'})),catalogue);
  await apply(p,mixed);const baseline=await snapshot(p),originalFinance=await finance(p);
  await p.goto(URL);await p.waitForFunction(()=>!!window.Hisaab);await history(p);
  check(await snapshot(p)===baseline,'v3.36 → v3.44 groups existing saved messages with NO migration, storage write or quantity change');
  check(await p.locator('[data-ver]').first().textContent()==='3.44','exact native panel reports v3.44');
  const original=(await groups(p))[0],originalId=original.entryId;
  check(original.productCount===4&&original.rows.length===5,'the old four-product / five-dated-movement message is ONE combo');
  check(await p.locator('[data-stock-combo]').count()===1,'History shows ONE combo card, not five unrelated product entries');
  check(await p.locator('[data-stock-combo] .stc-common').count()===1&&await p.locator('[data-stock-combo] .ste-saved-tags span').count()===3,'party, exact chosen roles and ALL three tagged people have one common visible block');
  check(!await p.locator('[data-stock-combo] .stc-items').evaluate(el=>el.open),'old combos start compact, with all products expandable inside the card');
  await p.locator('[data-stock-combo] .stc-items>summary').click();
  check(await p.locator('[data-stock-combo] .stc-item').count()===5&&(await p.locator('[data-stock-combo] .stc-item').first().textContent()).includes('21 Nov 2026'),'expanding the combo preserves earlier In and every actual product date/unit');
  check((await p.locator('.stk-metrics .card').nth(1).textContent()).includes('Combos / entries')&&(await p.locator('.stk-metrics .card').nth(1).textContent()).includes('15 stock movements'),'primary count separates user-facing entries from internal stock movements');
  await p.locator('[data-stock-combo]').scrollIntoViewIfNeeded();await shot(p,'01-existing-one-combo-desktop.png');

  const next='24/11 Example second buyer\n1- Half cue sample 10mm\nPichle bache box 270\nAaj gaye -2\nAvailable box 268\n2- Carton sample\nPichle bache ps 330\nAaj gaye -3\nAvailable ps 327\n@Sales Employee @Delivery Employee @Accounts Employee';
  const beforeDraft=await snapshot(p);await source(p,next);
  check((await p.locator('#steMessageSummary').textContent()).includes('1 combo')&&(await p.locator('#steMessageSummary').textContent()).includes('2 products'),'complete preview explicitly says ONE combo with two products');
  check((await p.locator('#stmSave').textContent())==='Haan, 1 combo save karo'&&await p.locator('#stmSave').isDisabled(),'a per-movement count is never labelled separate entries or a premature Save');
  await sale(p);await p.fill('#steMemberInput','Additional informed person');await p.press('#steMemberInput','Enter');await p.waitForFunction(()=>document.querySelector('#stmError').textContent.startsWith('Ready.'));
  check(await snapshot(p)===beforeDraft,'source / product review / roles / extra tag still perform ZERO saves');
  await writes(p);await confirmMessage(p);
  check(await p.evaluate(()=>window.__comboWrites)===1,'explicit final confirmation saves the ENTIRE new combo in exactly ONE canonical write');
  check((await p.locator('.ste-receipt').textContent()).includes('1 combo entry save ho gayi')&&(await p.locator('.ste-receipt').textContent()).includes('2 products / 2 stock movements'),'receipt says ONE combo, not two new entries');
  check((await groups(p)).length===2,'old and new messages remain two independent combo cards');
  const second=(await groups(p)).find(g=>g.party==='Example second buyer'),secondId=second.entryId;
  check(second.rows.every(row=>row.party==='Example second buyer')&&second.members.includes('Additional informed person'),'shared party and extra informed-only tag persist on the whole saved combo');
  await p.locator('.ste-receipt [data-ste-pdf="message"]').click();
  check((await p.locator('#stePdfSummary').textContent()).includes('1 combo · 2 products · 2 stock movements'),'immediate PDF preview identifies one full combo / two products');
  await download(p,'two-product-combo-logo.pdf');await close(p);
  await apply(p,'24/11 Example second buyer\n1- Carton sample\nAaj gaye -1 pcs\n@Sales Employee @Delivery Employee');await history(p);
  check((await groups(p)).length===3,'another message with the SAME party and date is not accidentally merged');
  check(await finance(p)===originalFinance,'combo saves and real PDF download preserve every unrelated module and saved logo');

  // Use actual combined filter controls. Combo actions must still show ALL rows.
  const carton=original.rows.find(row=>row.currentProductName==='Carton sample').productId;
  await p.selectOption('#stkProductFilter',carton);await p.fill('#stkPartyFilter','Example buyer');await p.fill('#stkSalespersonFilter','Sales Employee');await p.fill('#stkFrom','2026-11-23');await p.fill('#stkTo','2026-11-23');await p.selectOption('#stkTypeFilter','sale');await p.locator('#stkFilters button[type="submit"]').click();
  check(await p.locator('[data-stock-combo]').count()===1&&await p.locator('[data-stock-combo] .stc-item').count()===1,'combined product/party/salesperson/date/type filters show only the matching child');
  check((await p.locator('.stc-filter-note').textContent()).includes('1 / 5')&&(await p.locator('.stc-filter-note').textContent()).includes('poore 5'),'a visible warning says Combo PDF/Edit/Delete affect ALL five current rows');
  await p.click('[data-ste-pdf="current"]');check((await p.locator('#stePdfSummary').textContent()).includes('1 stock movements'),'filtered History PDF stays exactly ONE matching ledger row, not the whole combo');await download(p,'one-filtered-movement-logo.pdf');await close(p);
  await p.click('[data-stock-combo] [data-ste-pdf="message"]');check((await p.locator('#stePdfSummary').textContent()).includes('1 combo · 4 products · 5 stock movements'),'explicit Combo PDF ignores partial History filters and includes the entire combo');await download(p,'four-product-five-movement-combo-logo.pdf');await close(p);

  for(const width of [390,320]){
    await p.setViewportSize({width,height:844});await p.locator('[data-stock-combo]').scrollIntoViewIfNeeded();
    check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'combo History has no page-level horizontal overflow at '+width+'px');
    const box=await p.locator('[data-stock-combo]').boundingBox();check(box.x>=0&&box.x+box.width<=width+1,'party/items/common tag combo card fits '+width+'px');
    const buttons=await p.locator('[data-stock-combo] .stc-top .btn').evaluateAll(els=>els.map(el=>{const b=el.getBoundingClientRect();return {x:b.x,right:b.right,w:b.width,h:b.height};}));
    check(buttons.every(b=>b.x>=0&&b.right<=width+1&&b.w>=65&&b.h>=38),'whole-combo PDF/Edit/Delete remain visible and tappable at '+width+'px');
    await shot(p,'02-filtered-combo-'+width+'.png');const before=await snapshot(p);await p.click('[data-stock-combo] [data-stc="edit"]');
    check(await p.locator('[data-stc-item]').count()===5&&await p.locator('#stc_party').inputValue()==='Example buyer','filtered Edit opens all five items and ONE common party at '+width+'px');
    const dialog=await p.locator('#stcDialog').boundingBox();check(dialog.x>=0&&dialog.x+dialog.width<=width+1&&dialog.height<=844,'whole-combo editor fits '+width+'px viewport');
    await p.fill('#stc_party','Not saved buyer');await p.fill('#stcName','Draft only person');await p.press('#stcName','Enter');await p.locator('[data-stc-item]').last().scrollIntoViewIfNeeded();
    const controls=await p.locator('[data-stc-field]').evaluateAll(els=>els.map(el=>{const b=el.getBoundingClientRect();return {x:b.x,right:b.right,w:b.width};}));check(controls.every(b=>b.x>=0&&b.right<=width+1&&b.w>=80),'every independent quantity/date field fits without sideways scrolling at '+width+'px');
    check(await p.locator('[data-stc-field="date"]').evaluateAll(els=>els.every(el=>el.getBoundingClientRect().width>=200&&/^2026-11-\d\d$/.test(el.value))),'full actual date including year has a wide readable phone field at '+width+'px');
    check(await p.locator('#stcCommit').isDisabled(),'editing common party/tags cannot reuse old consent at '+width+'px');await p.check('#stcReviewed');await p.locator('#stcCommit').scrollIntoViewIfNeeded();const save=await p.locator('#stcCommit').boundingBox();check(save.y>=0&&save.y+save.height<=844&&await p.locator('#stcCommit').isEnabled(),'reviewed whole-combo Save remains reachable at '+width+'px');
    await shot(p,'03-edit-combo-'+width+'.png');await close(p);check(await snapshot(p)===before,'Cancel on '+width+'px does not save ANY child/common/tag change');
  }
  await p.setViewportSize({width:1280,height:1000});
  const beforeEdit=await p.evaluate(id=>Hisaab.stock.inventory().find(row=>row.id===id).available,carton),sourceNotes=original.rows.map(row=>row.note);
  await p.click('[data-stock-combo] [data-stc="edit"]');await p.fill('#stc_party','Corrected common buyer');await p.fill('#stc_deliveryName','Actual chosen delivery');
  const cartonRow=original.rows.find(row=>row.productId===carton),brushRow=original.rows.find(row=>row.currentProductName==='8" brush sample');
  await p.fill('[data-stc-item="'+cartonRow.id+'"] [data-stc-field="qty"]','49');await p.fill('[data-stc-item="'+brushRow.id+'"] [data-stc-field="date"]','2026-11-22');await p.check('#stcReviewed');await p.fill('#stcName','Corrected informed person');
  check(await p.locator('#stcCommit').isDisabled()&&!await p.locator('#stcReviewed').isChecked(),'a new uncommitted person invalidates the old reviewed Edit immediately');
  await p.press('#stcName','Enter');await writes(p);await confirmCombo(p);
  const changed=await get(p,originalId);
  check(await p.evaluate(()=>window.__comboWrites)===1,'all shared details / two independent corrections / tags commit in ONE write');
  check(changed.rows.filter(row=>row.type!=='in').every(row=>row.party==='Corrected common buyer'&&row.deliveryName==='Actual chosen delivery'),'common party and actual delivery update ALL outgoing children together');
  check(changed.rows.find(row=>row.type==='in').party===''&&changed.rows.find(row=>row.type==='in').date==='2026-11-21','older incoming supplier and actual receipt date are not replaced by the outgoing party/driver');
  check(changed.rows.find(row=>row.id===brushRow.id).date==='2026-11-22'&&await p.evaluate(id=>Hisaab.stock.inventory().find(row=>row.id===id).available,carton)===beforeEdit+1,'item date/quantity corrections recalculate the dated ledger, not an adjustable balance');
  check(changed.rows.every(row=>sourceNotes.includes(row.note))&&changed.rows.every(row=>row.deliveryDetails.includes('Corrected informed person')),'original source notes and all informed-only tags remain intact after a common-party correction');
  check(await finance(p)===originalFinance,'whole-combo Edit leaves Employee, Canteen, Attendance, salary, pricing and branding untouched');
  await history(p);await p.locator('[data-stock-combo="'+original.batch+'"] [data-ste-pdf="message"]').click();await download(p,'corrected-whole-combo-logo.pdf');await close(p);

  // A later row depends on the combo receipt. Whole deletion must fail atomically.
  const half=original.rows[0].productId,dependent=await p.evaluate(id=>Hisaab.stock.saveEntry({productId:id,type:'out',qty:100,date:'2026-11-26',purpose:'Depends on combo receipt'}).id,half);
  await history(p,{product:carton,party:'Corrected common buyer',from:'2026-11-23',to:'2026-11-23',type:'sale'});await p.click('[data-stock-combo] [data-stc="delete"]');
  check(await p.locator('[data-stc-item]').count()===5&&await p.locator('#stcCommit').isDisabled(),'partial-filter Delete shows ALL five rows and requires separate explicit consent');
  const beforeRefusal=await snapshot(p);await p.check('#stcReviewed');await p.click('#stcCommit');await p.waitForFunction(()=>document.querySelector('#stcError').textContent.includes('negative'));
  check(await snapshot(p)===beforeRefusal&&await p.locator('#stcDialog').count()===1,'dependent later stock refuses the ENTIRE combo Delete without removing any child/audit');
  check(!await p.locator('#stcReviewed').isChecked()&&await p.locator('#stcCommit').isDisabled(),'failed whole-combo Delete resets consent instead of allowing blind repeated confirmation');await close(p);
  await p.evaluate(id=>Hisaab.stock.deleteEntry(id,Hisaab.stock.context()),dependent);await history(p,{product:carton,party:'Corrected common buyer'});
  const cancel=await snapshot(p);await p.click('[data-stock-combo] [data-stc="delete"]');await close(p);check(await snapshot(p)===cancel,'closing whole-combo Delete is a complete no-op');
  await p.click('[data-stock-combo] [data-stc="delete"]');await writes(p);await confirmCombo(p);
  check(await p.evaluate(()=>window.__comboWrites)===1,'confirmed entire-combo Delete is one canonical save, never five separate saves');
  check(await p.evaluate(ids=>ids.every(id=>!Hisaab.stock.data().transactions.some(row=>row.id===id)),original.rows.map(row=>row.id)),'ALL five selected-combo movements are deleted together');
  check(await p.evaluate(ids=>Hisaab.stock.data().history.filter(h=>h.action==='delete'&&ids.includes(h.entityId)).length===5,original.rows.map(row=>row.id)),'each deleted child keeps its exact before snapshot and independent audit');
  await history(p);check((await groups(p)).length===2&&await p.evaluate(()=>Hisaab.stock.data().products.length)===10,'products/openings and the other TWO combos survive whole-combo deletion');
  const afterDelete=await snapshot(p),duplicate=await p.evaluate(async({mixed,saleOptions})=>{const plan=await Hisaab.stock.messageImport.plan(mixed,saleOptions);return {added:plan.added,skipped:plan.skipped};},{mixed,saleOptions});
  check(duplicate.added===0&&duplicate.skipped===5&&await snapshot(p)===afterDelete,'re-pasting the deleted old source cannot resurrect any combo movement');
  await p.reload();await p.waitForFunction(()=>!!window.Hisaab);await history(p);check(await snapshot(p)===afterDelete&&(await groups(p)).length===2,'reload preserves exact confirmed data and re-derives the same two remaining combos');
  await p.locator('[data-stock-combo="'+second.batch+'"] [data-ste-pdf="message"]').click();await download(p,'reloaded-two-product-combo-logo.pdf');await close(p);
  await p.locator('[data-stock-combo="'+second.batch+'"] [data-stc="edit"]').click();await p.fill('#stc_party','Stale edit must not save');await p.check('#stcReviewed');await p.evaluate(()=>Hisaab.Cloud.epoch++);const stale=await snapshot(p);await p.click('#stcCommit');await p.waitForFunction(()=>document.querySelector('#stcError').textContent.includes('badal'));
  check(await snapshot(p)===stale,'account/data epoch changes refuse the whole reviewed Edit with no partial writes');await close(p);await p.reload();await p.waitForFunction(()=>!!window.Hisaab);await history(p);
  for(const theme of ['light','dark']){await p.setViewportSize({width:390,height:844});await p.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);await p.locator('[data-stock-combo]').first().scrollIntoViewIfNeeded();await shot(p,'04-combo-mobile-'+theme+'.png');}
  check(await finance(p)===originalFinance,'success/refusal/cancel/reload combo paths preserve all unrelated financial modules');
  await c.close();

  // Real long Unicode/common-role layout + per-page logo. One message, 50 products.
  const large=await context(browser),q=await page(large);
  const names=Array.from({length:50},(_,i)=>'Bulk combo sample '+String(i+1).padStart(2,'0')+' '+(i%4===0?'W'.repeat(63):'item'));
  const units=names.map((_,i)=>['box','pcs','roll','bundle'][i%4]);
  await q.evaluate(({names,units})=>names.forEach((name,i)=>Hisaab.stock.saveProduct({name,unit:units[i],openingQty:20,minQty:0,date:'2026-11-01'})),{names,units});
  const party='उदाहरण ग्राहक '+'W'.repeat(65),text='28/11 '+party+'\n'+names.map((name,i)=>(i+1)+'- '+name+'\nPichle bache '+units[i]+' 20\nAaj gaye -1\nAvailable '+units[i]+' 19').join('\n')+'\n@राहुल शर्मा @अमित गुप्ता @लेखा कर्मचारी';
  await apply(q,text,{...saleOptions,salesperson:'Sales '+'W'.repeat(84),deliveryName:'Delivery '+'W'.repeat(81)});await history(q);
  const big=(await groups(q))[0];check(big.productCount===50&&big.rows.length===50&&await q.locator('[data-stock-combo]').count()===1,'maximum-size 50-product message is ONE combo even beyond the old 40-row page limit');
  check(big.members.join('|')==='राहुल शर्मा|अमित गुप्ता|लेखा कर्मचारी','common Hindi tags retain every syllable and are not inferred as actual roles');
  check(await q.evaluate(()=>Hisaab.stock.inventory().every(row=>row.available===19)),'all 50 products retain independent exact unit/quantity stock');
  fs.writeFileSync(path.join(OUT,'50-product-combo-expected.json'),JSON.stringify({party,names,units,ids:big.rows.map(row=>row.id),members:big.members},null,2));
  await q.click('[data-stock-combo] [data-ste-pdf="message"]');await download(q,'50-product-combo-logo-hindi.pdf');await close(q);
  await large.setOffline(true);await q.click('[data-stock-combo] [data-ste-pdf="message"]');await download(q,'offline-50-product-combo-logo-hindi.pdf');await close(q);
  check(await q.evaluate(()=>Hisaab.stock.combo.groups().filter(g=>g.isCombo).length===1),'offline combined PDF never saves, splits or recreates the combo');
  await large.setOffline(false);
  // Distinct references explicitly mean physically separate deliveries, same date/party.
  const paged=await context(browser),r=await page(paged);await r.evaluate(()=>['First paged sample','Second paged sample'].forEach(name=>Hisaab.stock.saveProduct({name,unit:'pcs',openingQty:100,minQty:0,date:'2026-11-01'})));
  const msg='23/11 Same date buyer\n1- First paged sample\nAaj gaye -1 pcs\n2- Second paged sample\nAaj gaye -1 pcs';
  for(let i=0;i<42;i++)await apply(r,msg,{...saleOptions,reference:'Explicit distinct delivery '+i,actions:{'0:0':'new','1:0':'new'}});await history(r,{type:'sale'});
  check(await r.locator('[data-stock-combo]').count()===40&&await r.locator('[data-stock-combo] [data-stock-entry]').count()===80,'History paginates 40 WHOLE two-product combos, never 40 ledger children');
  await r.locator('[data-stk="page"][data-value="1"]').click();check(await r.locator('[data-stock-combo]').count()===2&&await r.locator('[data-stock-combo] [data-stock-entry]').count()===4,'page two retains the other two complete combos without splitting either');
  await r.click('[data-ste-pdf="current"]');check((await r.locator('#stePdfSummary').textContent()).includes('84 stock movements'),'combined-filter History PDF still includes every matching movement on ALL combo pages');await download(r,'42-combo-84-movement-filtered-history-logo.pdf');await close(r);
  await large.close();await paged.close();
  check(requests.every(r=>r.method==='GET'&&!r.body&&r.url.startsWith(new globalThis.URL(URL).origin+'/')),'combo UI, tags, corrections and PDFs make NO chat/contact/AI/third-party upload');
  check(errors.length===0,'all native combo/phone/Unicode/download/offline/refusal/pagination paths have zero uncaught JavaScript errors');
  fs.writeFileSync(path.join(OUT,'checks.json'),JSON.stringify({checks,errors,requests:requests.length},null,2));console.log('\n✅ STOCK COMBO NATIVE: '+checks+' checks pass');
 }finally{fs.writeFileSync(path.join(OUT,'requests.json'),JSON.stringify(requests,null,2));fs.writeFileSync(path.join(OUT,'js-errors.json'),JSON.stringify(errors,null,2));await browser.close();}
})().catch(error=>{console.error('❌ '+error.stack);process.exitCode=1;});
