/* Native v3.39: actual fuzzy dropdown/review/save, phone layout, combined PDF,
   offline text and actual locally fulfilled Tesseract/WASM/model OCR. Synthetic. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),{legacy}=require('./fixtures/stock');
const URL=process.env.HISAAB_URL||'http://127.0.0.1:8000/hisaab_v3.html';
const OUT=path.resolve(process.env.HISAAB_ARTIFACTS||'.cache/stock-match-native'),ASSETS=path.resolve(process.env.HISAAB_OCR_ASSETS||'.cache/qa/node_modules');fs.mkdirSync(OUT,{recursive:true});
const logo='data:image/jpeg;base64,'+fs.readFileSync(path.join(__dirname,'fixtures/company-logo.jpg')).toString('base64');
const requests=[],errors=[];let checks=0;
const check=(value,label)=>{assert.ok(value,label);checks++;console.log('  ✅ '+label);};
const snapshot=p=>p.evaluate(()=>JSON.stringify({data:Hisaab.Store.data,disk:Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])),dirty:Hisaab.Cloud.dirty}));
function clock(){const D=Date;window.Date=class extends D{constructor(...args){super(...(args.length?args:['2026-11-14T12:00:00Z']));}static now(){return 1794657600000;}};}
const knownRoute=url=>{const name=new globalThis.URL(url).pathname.split('/').at(-1);if(url.startsWith('https://cdn.jsdelivr.net/npm/tesseract.js@')&&['tesseract.min.js','worker.min.js'].includes(name))return path.join(ASSETS,'tesseract.js/dist',name);if(url.startsWith('https://cdn.jsdelivr.net/npm/tesseract.js-core@')&&/^tesseract-core(?:-simd)?(?:-lstm)?\.wasm(?:\.js)?$/.test(name))return path.join(ASSETS,'tesseract.js-core',name);if((url.startsWith('https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/')||url.startsWith('https://tessdata.projectnaptha.com/'))&&name==='eng.traineddata.gz')return path.join(ASSETS,'@tesseract.js-data/eng',url.includes('best_int')?'4.0.0_best_int':'4.0.0','eng.traineddata.gz');return null;};
async function context(browser){const c=await browser.newContext({viewport:{width:1280,height:950},locale:'en-IN',timezoneId:'Asia/Kolkata',acceptDownloads:true});await c.addInitScript(clock);await c.route('**/*',route=>{const r=route.request(),url=r.url();requests.push({url,method:r.method(),body:r.postData()});if(url.startsWith(new globalThis.URL(URL).origin+'/'))return route.continue();const file=knownRoute(url);if(file){assert.ok(fs.existsSync(file),file);return route.fulfill({body:fs.readFileSync(file),headers:{'Content-Type':file.endsWith('.js')?'application/javascript':file.endsWith('.wasm')?'application/wasm':'application/octet-stream','Access-Control-Allow-Origin':'*'}});}return route.abort();});return c;}
async function page(c){const p=await c.newPage();p.on('pageerror',e=>errors.push(e.stack));await p.goto(URL);await p.waitForFunction(()=>!!window.Hisaab);await p.evaluate(({legacy,logo})=>{localStorage.clear();legacy.settings.companyLogo=logo;localStorage.setItem('hisaabPro.v1',JSON.stringify(legacy));},{legacy,logo});await p.reload();await p.waitForFunction(()=>!!window.Hisaab);return p;}
async function seed(p,rows){return p.evaluate(rows=>rows.map(([name,unit='box',date='2026-11-01'])=>Hisaab.stock.saveProduct({name,unit,date,openingQty:10,minQty:0})),rows);}
async function stock(p){await p.evaluate(()=>Hisaab.go('stock'));}
async function ready(p){await p.waitForFunction(()=>!!document.querySelector('.stm-heading')&&!document.querySelector('#stmError').textContent.includes('Preview taiyar'));}
async function preview(p,text){await stock(p);await p.click('[data-stm="open"]');await p.fill('#stmText',text);await p.fill('#stmYear','2026');await p.click('#stmPreviewButton');await ready(p);}
async function close(p){await p.locator('#modalRoot .modal-h [data-act="closeModal"]').click();await p.waitForSelector('#modalRoot .modal',{state:'detached'});}
async function sale(p){await p.selectOption('#stmType','sale');await p.locator('[data-ste="role"][data-role="salesperson"][data-person="0"]').click();await p.locator('[data-ste="role"][data-role="deliveryName"][data-person="1"]').click();await p.waitForFunction(()=>document.querySelector('#stmError').textContent.startsWith('Ready.'));}
const msg=name=>'23/11 Example buyer\n1- '+name+'\nPichle bache box 10\nAaj gaye -2\nAvailable box 8\n@Sales Employee @Delivery Employee';
const combo='23/11 Example buyer\n1- Plastc scoreboard\nPichle bache ps 10\nAaj gaye -2\nAvailable ps 8\n2- alpha beta gamma\nPichle bache box 10\nAaj gaye -2\nAvailable box 8\n@Sales Employee @Delivery Employee';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.HISAAB_CHROME_EXECUTABLE||undefined,args:process.env.HISAAB_CHROME_ARGS?JSON.parse(process.env.HISAAB_CHROME_ARGS):['--no-sandbox']});
 try{
  const c=await context(browser),p=await page(c);
  await p.goto(new globalThis.URL('Hisaab-Pro-v3.37.html',URL).href);await p.waitForFunction(()=>!!window.Hisaab);
  const products=await seed(p,[['Plastic scoreboard','pcs'],['alpha beta gamma delta epsilon','box'],['Wooden tray','pcs']]);const baseline=await snapshot(p);
  await p.goto(URL);await p.waitForFunction(()=>!!window.Hisaab);await stock(p);
  check(await p.locator('[data-ver]').first().textContent()==='3.39','native panel is v3.39');
  check(await snapshot(p)===baseline,'v3.37 → v3.39 preserves every raw saved byte, product, unit, quantity and unrelated module');
  await preview(p,combo);
  check(await p.locator('[data-stm-match="0"]').inputValue()===products[0].id,'a real typo automatically selects its saved pcs product without exact spelling');
  check(await p.locator('[data-stm-match="1"]').inputValue()===products[1].id,'exactly 75% name similarity automatically selects the saved box product');
  check((await p.locator('.ste-product>summary').nth(1).textContent()).includes('75% naam match'),'75% match is visible in the compact summary, not hidden in advanced options');
  check(await p.locator('.ste-product').count()===2&&await p.locator('.ste-product[open]').count()===0,'both automatic selections start compact but remain changeable');
  check((await p.locator('#steMessageSummary').textContent()).includes('1 combo')&&(await p.locator('#steMessageSummary').textContent()).includes('2 products'),'two fuzzy products are still ONE party / ONE combo');
  check(await p.locator('#stmSave').isDisabled()&&await snapshot(p)===baseline,'automatic product choice is NOT an automatic stock save or guessed role');
  for(const width of [390,320]){
   await p.setViewportSize({width,height:844});await p.locator('.ste-product').nth(1).scrollIntoViewIfNeeded();
   check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal page overflow at '+width+'px');
   check(await p.locator('.ste-product>summary').nth(1).isVisible()&&(await p.locator('.ste-product>summary').nth(1).innerText()).includes('75%'),'selected product and match % remain visible at '+width+'px');
   await p.screenshot({path:path.join(OUT,'fuzzy-review-'+width+'.png')});
  }
  await p.evaluate(()=>document.documentElement.dataset.theme='dark');await p.screenshot({path:path.join(OUT,'fuzzy-review-320-dark.png')});
  await p.evaluate(()=>document.documentElement.dataset.theme='light');await p.setViewportSize({width:1280,height:950});
  await sale(p);await p.check('#stmReviewed');
  await p.locator('.ste-product>summary').first().click();await p.selectOption('[data-stm-match="0"]',products[2].id);await p.waitForFunction(()=>document.querySelector('.ste-product>summary')?.textContent.includes('Aapne'));
  check(!await p.locator('#stmReviewed').isChecked()&&await p.locator('#stmSave').isDisabled(),'changing the automatic product resets prior reviewed consent');
  check(!(await p.locator('.ste-product>summary').first().textContent()).includes('%'),'manual replacement never displays the original different product\'s score');
  await close(p);check(await snapshot(p)===baseline,'changing and cancelling the complete review leaves all saved data unchanged');
  await preview(p,combo);await sale(p);await p.evaluate(()=>{window.__writes=0;window.__save=Hisaab.Store.save;Hisaab.Store.save=function(...a){window.__writes++;return window.__save.apply(this,a);};});
  await p.check('#stmReviewed');await p.click('#stmSave');await p.waitForSelector('#stmDialog',{state:'detached'});
  check(await p.evaluate(()=>window.__writes)===1,'one genuine final checkbox + Save commits the whole fuzzy-matched combo in ONE canonical write');
  const data=await p.evaluate(()=>({inventory:Hisaab.stock.inventory(),groups:Hisaab.stock.combo.groups().filter(g=>g.isCombo),rows:Hisaab.stock.data().transactions.filter(t=>t.id.startsWith('smsg1_'))}));
  check(data.groups.length===1&&data.groups[0].rows.length===2,'History saves one combo with both original products');
  check(data.inventory.find(p=>p.id===products[0].id).available===8&&data.inventory.find(p=>p.id===products[1].id).available===8&&data.inventory.find(p=>p.id===products[2].id).available===10,'only the correctly selected independent products are reduced; no other stock changes');
  check(data.rows.some(r=>r.unit==='pcs')&&data.rows.some(r=>r.unit==='box')&&data.rows.every(r=>r.qty===2&&r.date==='2026-11-23'),'exact units, original movement dates and quantities are preserved without conversion');
  await p.locator('.ste-receipt [data-ste-pdf="message"]').click();await p.waitForFunction(()=>!document.querySelector('#stePdfDownload').disabled);
  const event=p.waitForEvent('download');await p.click('#stePdfDownload');const pdf=await event;await pdf.saveAs(path.join(OUT,'fuzzy-two-product-combo-logo.pdf'));
  check(fs.readFileSync(path.join(OUT,'fuzzy-two-product-combo-logo.pdf')).subarray(0,8).toString()==='%PDF-1.4','genuine combined PDF download contains PDF/File bytes, not HTML');await close(p);
  const report=await p.evaluate(id=>Hisaab.stock.report({kind:'message',entryId:id}),data.groups[0].entryId);
  check(report.rows.length===2&&report.rows.some(r=>r.productName==='Plastic scoreboard')&&report.rows.some(r=>r.note.includes('Plastc scoreboard')),'Combo PDF source retains canonical product identity AND the original misspelled source');
  await p.reload();await p.waitForFunction(()=>!!window.Hisaab);const afterReload=await snapshot(p);await preview(p,combo);
  check(await p.locator('[data-stm-match="0"]').inputValue()===products[0].id&&(await p.locator('.ste-product').first().textContent()).includes('Previously confirmed'),'reviewed fuzzy aliases are remembered after a real browser reload');
  check(await p.locator('#stmSave').isDisabled()&&await snapshot(p)===afterReload,'re-pasting the same combo cannot double-subtract its stock');await close(p);
  await c.setOffline(true);const offline='24/11 Example buyer\n1- Plastc scoreboad\nPichle bache pcs 8\nAaj gaye -1\nAvailable pcs 7\n@Sales Employee @Delivery Employee';await preview(p,offline);await sale(p);await p.check('#stmReviewed');await p.click('#stmSave');await p.waitForSelector('#stmDialog',{state:'detached'});
  check(await p.evaluate(id=>Hisaab.stock.inventory().find(p=>p.id===id).available,products[0].id)===7,'new fuzzy name matching, review and atomic save work completely offline in an already-open panel');await c.setOffline(false);
  const variants=await seed(p,[['Premium cue 9mm'],['Premium cue 12mm']]);const beforeAmbiguous=await snapshot(p);await preview(p,msg('Premium cue'));
  check(await p.locator('[data-stm-match="0"]').inputValue()===''&&(await p.locator('#stmPreview').textContent()).includes('Conflicting close'),'omitted-size ambiguity stays unselected, even when the shorter model has a slightly higher character score');
  check(await p.locator('#stmSave').isDisabled()&&await snapshot(p)===beforeAmbiguous,'ambiguous product review cannot silently choose first / write anything');
  await p.selectOption('[data-stm-match="0"]',variants[0].id);await sale(p);
  check(await p.locator('[data-stm-match="0"]').inputValue()===variants[0].id&&(await p.locator('.stm-item small').textContent()).includes('Aapne product chuna'),'user can explicitly resolve an ambiguous match in the normal review');await close(p);
  await seed(p,[['Premium cue M9B']]);
  const guarded=await p.evaluate(async texts=>{const options={year:'2026',type:'sale',salesperson:'Sales Employee',deliveryName:'Delivery Employee'};return Promise.all(texts.map(text=>Hisaab.stock.messageImport.plan(text,options)));},[msg('Premium cue M9A'),msg('Premium cue 9cm')]);
  check(guarded[0].blocks[0].productId===''&&!guarded[0].valid,'high-similarity alphanumeric model M9A never silently selects M9B');
  check(guarded[1].blocks[0].productId===''&&!guarded[1].valid,'9cm is not silently treated as 9mm merely because the names are similar');
  await seed(p,[['Premium marker','box','2026-11-25']]);await preview(p,msg('Premum marker'));
  check((await p.locator('#stmError').textContent()).includes('opening snapshot se pehle')&&await p.locator('#stmSave').isDisabled(),'75% name selection does NOT bypass the original pre-opening stock protection');await close(p);
  // Actual screenshot → actual local Tesseract, not an OCR-recognition stub.
  const o=await context(browser),q=await page(o);const [ocrProduct]=await seed(q,[['Plastic scoreboard']]);await stock(q);
  const text=msg('Plastc scoreboard'),png=Buffer.from(await q.evaluate(text=>{const lines=text.split('\n'),cv=document.createElement('canvas');cv.width=1120;cv.height=lines.length*48+70;const cx=cv.getContext('2d');cx.fillStyle='#252828';cx.fillRect(0,0,cv.width,cv.height);cx.font='600 34px Arial';lines.forEach((line,i)=>{cx.fillStyle=line.startsWith('@')?'#22c765':'#fafafa';cx.fillText(line,40,52+i*48);});return cv.toDataURL('image/png').split(',')[1];},text),'base64');fs.writeFileSync(path.join(OUT,'synthetic-fuzzy-message.png'),png);
  const beforeOcr=await snapshot(q);await q.click('[data-stm="open"]');await q.fill('#stmYear','2026');const chooser=q.waitForEvent('filechooser');await q.click('[data-stm="photo"]');await (await chooser).setFiles({name:'synthetic-fuzzy-message.png',mimeType:'image/png',buffer:png});
  await q.waitForFunction(()=>/OCR draft taiyar|OCR nahi hua|OCR timeout/.test(document.querySelector('#stmOcrStatus').textContent),null,{timeout:150000});
  check((await q.locator('#stmOcrStatus').textContent()).includes('OCR draft taiyar'),'real browser English engine / WASM / model reads the actual synthetic misspelled-name screenshot');await ready(q);
  const draft=await q.locator('#stmText').inputValue();fs.writeFileSync(path.join(OUT,'actual-ocr-draft.txt'),draft);
  check(await q.locator('[data-stm-match="0"]').inputValue()===ocrProduct.id,'actual OCR draft uses the same 75% matcher and selects the correct saved product');
  check((await q.locator('.ste-product>summary').textContent()).includes('% naam match'),'actual screenshot review displays the name-match percentage independently of OCR confidence');
  check(await snapshot(q)===beforeOcr&&await q.locator('#stmSave').isDisabled(),'OCR extraction and automatic fuzzy selection still save NOTHING before explicit roles/consent');await sale(q);await close(q);
  check(await snapshot(q)===beforeOcr,'cancelling real OCR preview leaves original stock and every saved byte intact');
  check(requests.every(r=>r.method==='GET'&&!r.body),'all name matching/preview/save/PDF/OCR traffic is static GET only; no source/image uploads');
  check(requests.every(r=>r.url.startsWith(new globalThis.URL(URL).origin+'/')||!!knownRoute(r.url)),'no AI, chat, product-search, contact or other third-party lookup service is used');
  check(errors.length===0,'all native matching/phone/actual OCR/download/offline/refusal paths have zero uncaught errors');
  console.log('\n✅ STOCK NAME MATCH NATIVE: '+checks+' checks pass');
 }finally{fs.writeFileSync(path.join(OUT,'checks.json'),JSON.stringify({checks,errors,requests:requests.length},null,2));fs.writeFileSync(path.join(OUT,'network.json'),JSON.stringify(requests,null,2));await browser.close();}
})().catch(error=>{console.error('❌ '+error.stack);process.exitCode=1;});
