/* v3.29 native Chromium: real file chooser/canvas, saved Settings, native PDF
   downloads, backup restore and print images. Isolated QA records only. Web
   Share/print destinations are stubbed; this never sends data to WhatsApp/cloud.
   Same HISAAB_URL, HISAAB_CHROME_*, HISAAB_ARTIFACTS and HISAAB_SCREENSHOTS
   controls as attendance.browser.js; Playwright is an optional scratch install. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const URL=process.env.HISAAB_URL||'http://127.0.0.1:8000/hisaab_v3.html';
const OUT=path.resolve(process.env.HISAAB_ARTIFACTS||path.join(__dirname,'..','.cache','company-logo-browser-qa'));
const FIX=path.join(__dirname,'fixtures'),KEY='hisaabPro.v1',DATE='2026-11-14',errors=[];
fs.mkdirSync(OUT,{recursive:true});let checks=0;
function check(value,label){assert.ok(value,label);checks++;console.log('  ✅ '+label);}
const fixture={settings:{shopName:'Logo QA Company',ownerName:'Authorised Owner',address:'Main Market, Delhi',phone:'1234567890',demo:false},workers:[{id:'salary-person',name:'Original Employee',type:'monthly',rate:18000,active:true},{id:'hourly-person',name:'Hourly Employee',type:'hourly',rate:125,active:true}],records:[{id:'salary-row',workerId:'salary-person',year:2026,month:10,presentDays:24,absentDays:2,advances:[],deductions:[],bonus:200,status:'pending'},{id:'hourly-row',workerId:'hourly-person',year:2026,month:10,presentDays:20,totalHours:156.5,advances:[],deductions:[],status:'paid',paidOn:DATE}],canteen:{entries:[1,2].map(i=>({id:'bill'+i,date:DATE,kind:'purchase',mode:'itemized',party:'Supplier',billNo:'B'+i,amount:37.5,paid:0,createdAt:i,updatedAt:i,items:[{name:'Hara dhaniya',qty:500,unit:'gram',priceMode:'line',lineTotal:37.5,rate:.075}]})),rates:[],log:[],demo:false}};
const copy=x=>JSON.parse(JSON.stringify(x));
async function snapshot(page){return page.evaluate(()=>JSON.stringify({data:Hisaab.Store.data,disk:Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])),dirty:Hisaab.Cloud.dirty}));}
async function go(page,view){await page.evaluate(view=>{Hisaab.UI.year=2026;Hisaab.UI.month=10;Hisaab.UI.ct.date='2026-11-14';Hisaab.go(view);},view);}
async function upload(page,file,expect='saved'){
  const chooser=page.waitForEvent('filechooser');await page.locator('[data-act="companyLogoChoose"]').click();await (await chooser).setFiles(file);
  await page.waitForFunction(expect=>{const t=document.getElementById('companyLogoStatus')?.textContent||'';return expect==='saved'?t.includes('Logo saved'):t.includes(expect);},expect);
}
function logoPDF(bytes,logo){
  const pdf=bytes.toString('latin1');assert.ok(pdf.startsWith('%PDF-1.4'));const at=Number(pdf.match(/startxref\s+(\d+)\s+%%EOF$/)[1]);assert.equal(pdf.slice(at,at+4),'xref');const x=pdf.slice(at).split('\n'),count=Number(x[1].split(' ')[1]),objects=[];
  for(let id=1;id<count;id++){const start=Number(x[id+2].slice(0,10)),end=id+1<count?Number(x[id+3].slice(0,10)):at;assert.ok(pdf.slice(start).startsWith(id+' 0 obj\n'));const raw=pdf.slice(start,end);objects.push(raw.slice(raw.indexOf('\n')+1,raw.lastIndexOf('\nendobj')));}
  const pages=objects.filter(o=>/^<< \/Type \/Page\b/.test(o));assert.ok(pages.length);assert.equal((pdf.match(/cm \/CompanyLogo Do Q/g)||[]).length,pages.length);
  for(const p of pages){assert.equal((p.match(/\/XObject <</g)||[]).length,1);assert.ok(p.includes('/CompanyLogo '));}
  assert.equal(objects.filter(o=>/^<< \/Type \/XObject/.test(o)&&o.includes(Buffer.from(logo.split(',')[1],'base64').toString('latin1'))).length,1);
  return pages.length;
}
async function download(page,selector,name,logo){const ready=page.waitForEvent('download');await page.locator(selector).first().click();const file=await ready;await file.saveAs(path.join(OUT,name));const bytes=fs.readFileSync(path.join(OUT,name));if(logo)check(logoPDF(bytes,logo)>0,name+': native PDF has one shared logo drawn on every page');return bytes;}
async function reportDownload(page,format,name,logo){
  const expected=page.waitForEvent('download',{timeout:6000}).catch(()=>null);await page.locator('[name="format"][value="'+format+'"]').click();let file=await expected;
  if(!file){const ready=page.waitForEvent('download');await page.locator('[data-att-file="'+format+'"]').click();file=await ready;}
  await file.saveAs(path.join(OUT,name));const bytes=fs.readFileSync(path.join(OUT,name));check(format==='pdf'?logoPDF(bytes,logo)<=2:bytes.readUInt32LE()===0x04034b50,name+': actual '+format+' download, complete format');return bytes;
}
async function report(page,id,from,to,shift='all'){await page.evaluate(({id,from,to,shift})=>{Hisaab.go('attendance');Hisaab.attendance.ui().shift=shift;Hisaab.attendance.openExport(id);for(const [k,v]of [['attEFrom',from],['attETo',to]]){const e=document.getElementById(k);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));}},{id,from,to,shift});}
async function shareCapture(page,selector,name,logo){
  await page.evaluate(()=>{window.__shared=null;Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async o=>{window.__shared={name:o.files[0].name,type:o.files[0].type,bytes:[...new Uint8Array(await o.files[0].arrayBuffer())]};}});});
  await page.locator(selector).first().click();await page.waitForFunction(()=>window.__shared||document.getElementById('attShareReady'));
  if(!await page.evaluate(()=>!!window.__shared))await page.locator('#attShareReady').click();await page.waitForFunction(()=>!!window.__shared);
  const shared=await page.evaluate(()=>window.__shared),bytes=Buffer.from(shared.bytes);fs.writeFileSync(path.join(OUT,name),bytes);check(shared.type==='application/pdf'&&shared.name.endsWith('.pdf')&&logoPDF(bytes,logo)>0,name+': actual native share File has the saved logo (destination stubbed)');
}
async function settings(page){await go(page,'settings');await page.locator('#companyLogoCard').scrollIntoViewIfNeeded();}
(async()=>{
 const b=await chromium.launch({headless:true,...(process.env.HISAAB_CHROME_EXECUTABLE?{executablePath:process.env.HISAAB_CHROME_EXECUTABLE}:{}),args:process.env.HISAAB_CHROME_ARGS?JSON.parse(process.env.HISAAB_CHROME_ARGS):['--no-sandbox']});
 try{
  const context=await b.newContext({viewport:{width:1440,height:1000},locale:'en-IN',timezoneId:'Asia/Kolkata',acceptDownloads:true});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));await page.goto(new globalThis.URL('Hisaab-Pro-v3.28.html',URL).href);await page.waitForFunction(()=>!!window.Hisaab);
  await page.evaluate(payload=>{localStorage.setItem('hisaabPro.v1',JSON.stringify(payload));},fixture);await page.reload();await page.waitForFunction(()=>!!window.Hisaab);
  const ids=await page.evaluate(()=>{
    const A=Hisaab.attendance,latin=A.saveManager({name:'Latin Manager',code:'LOGO-L',defaultShift:'day',joinedOn:'2026-12-01'}),hindi=A.saveManager({name:'आरव शर्मा',code:'LOGO-H',defaultShift:'night',joinedOn:'2026-11-01',note:'संपूर्ण प्रोफाइल नोट'});
    for(let d=1;d<=31;d++)for(const shift of ['day','night'])A.saveRecord({managerId:latin.id,date:'2026-12-'+String(d).padStart(2,'0'),shift,mode:'time',checkIn:shift==='day'?'09:00':'21:00',checkOut:shift==='day'?'18:00':'06:00',outNextDay:shift==='night',note:d===31&&shift==='night'?'Every last original note remains complete':''});
    for(let d=14;d<=18;d++)A.saveRecord({managerId:hindi.id,date:'2026-11-'+d,shift:'night',mode:'time',checkIn:'21:00',checkOut:'06:00',outNextDay:true,note:'संपूर्ण समय और रविवार की उपस्थिति'});
    return {latin:latin.id,hindi:hindi.id};
  });
  const original=await snapshot(page);await page.goto(URL);await page.waitForFunction(()=>!!window.Hisaab);check(await snapshot(page)===original,'native v3.28 → v3.29 preserves every saved record, ID, clock, note, amount and storage byte');
  await settings(page);check(await page.locator('[data-act="companyLogoChoose"]').textContent()==='Upload logo','Settings offers a real upload button without requiring a logo file in the app');
  await page.fill('#sShop','Unsaved typed company');await upload(page,path.join(FIX,'company-logo.png'));
  let logo=await page.evaluate(()=>Hisaab.Store.data.settings.companyLogo);check(/^data:image\/jpeg;base64,/.test(logo)&&logo.length<=120000,'real transparent PNG decodes/canvas-encodes to a bounded self-contained JPEG');
  check(await page.inputValue('#sShop')==='Unsaved typed company','upload repaints only the logo card and never discards typed unsaved shop details');
  check(await page.evaluate(()=>{const s=Hisaab.Store.data.settings;return s.shopName==='Logo QA Company'&&s.companyLogo===JSON.parse(localStorage.getItem('hisaabPro.v1')).settings.companyLogo;}),'upload auto-saves only the logo; no separate Save settings press is necessary');
  const geometry=await page.locator('#companyLogoCard img').evaluate(async img=>{await img.decode();return {w:img.naturalWidth,h:img.naturalHeight};});check(geometry.w===128&&geometry.h===80,'PNG proportions remain 128 × 80, without stretching');
  fs.writeFileSync(path.join(OUT,'logo.jpg'),Buffer.from(logo.split(',')[1],'base64'));
  if(process.env.HISAAB_SCREENSHOTS==='1')await page.locator('#companyLogoCard').screenshot({path:path.join(OUT,'settings-desktop.png')});
  await page.reload();await page.waitForFunction(()=>!!window.Hisaab);await settings(page);check(await page.evaluate(v=>Hisaab.Store.data.settings.companyLogo===v,logo)&&await page.locator('#companyLogoCard img').count()===1,'real reload remembers the saved logo without another upload');
  for(const width of [390,320]){
    await page.setViewportSize({width,height:844});await page.locator('#companyLogoCard').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth+1);
    check(await page.locator('#companyLogoCard').evaluate(card=>card.getBoundingClientRect().right<=innerWidth+1&&[...card.querySelectorAll('button')].every(b=>b.getBoundingClientRect().right<=innerWidth+1)),width+'px logo preview and upload/change/remove controls fit without page overflow');
    if(process.env.HISAAB_SCREENSHOTS==='1')await page.screenshot({path:path.join(OUT,'settings-'+width+'.png')});
  }
  await page.setViewportSize({width:1440,height:1000});
  const saved=await snapshot(page);await go(page,'hisaab');await download(page,'[data-act="pdfRec"][data-wid="salary-person"]','salary.pdf',logo);await download(page,'[data-act="pdfAll"]','payroll.pdf',logo);
  for(const tpl of await page.evaluate(()=>Hisaab.canteen.tpls.map(t=>t.id))){
    await page.evaluate(tpl=>Hisaab.canteen.setTpl(tpl),tpl);
    await go(page,'canteen');for(const which of ['day','month']){await page.locator('[data-act="ctTab"][data-tab="'+which+'"]').click();const bytes=await download(page,'[data-act="'+(which==='day'?'ctPdfDay':'ctPdfMonth')+'"]','canteen-'+tpl+'-'+which+'.pdf',logo);check((bytes.toString('latin1').match(/\(500\) Tj ET/g)||[]).length===2,'native '+tpl+' '+which+' PDF still has two original 500g rows');}
  }
  for(const which of ['day','month']){await page.locator('[data-act="ctTab"][data-tab="'+which+'"]').click();await shareCapture(page,'[data-act="'+(which==='day'?'ctSharePdfDay':'ctSharePdfMonth')+'"]','shared-canteen-'+which+'.pdf',logo);}
  await report(page,ids.latin,'2026-12-01','2026-12-31');
  check((await page.locator('#attExportCapacity').textContent()).includes('2 pages'),'62 saved shifts still preview as two readable PDF pages with branding');
  await reportDownload(page,'pdf','attendance-two-pages.pdf',logo);await reportDownload(page,'xlsx','attendance-two-pages.xlsx');await page.locator('[data-act="closeModal"]').first().click();
  await report(page,ids.hindi,'2026-11-14','2026-11-18');const hindi=await reportDownload(page,'pdf','attendance-hindi.pdf',logo);check(hindi.toString('latin1').includes('/ActualText')&&hindi.toString('latin1').includes('/ATT1 '),'Hindi shaped text and company logo share valid image resources, without losing Unicode metadata');
  await reportDownload(page,'xlsx','attendance-hindi.xlsx');await shareCapture(page,'[name="format"][value="whatsapp"]','shared-attendance-hindi.pdf',logo);await page.locator('[data-act="closeModal"]').first().click();
  // Browser print / Save-as-PDF waits for local logo decoding too. Never opens
  // an actual print dialog or a delivery destination in this test.
  await page.evaluate(()=>{window.__printed=0;window.print=()=>window.__printed++;});await go(page,'hisaab');await page.locator('[data-act="printRec"][data-wid="salary-person"]').click();await page.waitForFunction(()=>window.__printed>0);
  check(await page.locator('#print-root img[data-company-logo]').evaluate(img=>img.complete&&img.naturalWidth>0),'salary print is invoked only after the saved local logo is decoded');
  await page.emulateMedia({media:'print'});await page.pdf({path:path.join(OUT,'print-salary.pdf'),format:'A4',printBackground:true});await page.emulateMedia({media:'screen'});
  await go(page,'canteen');for(const which of ['day','month']){await page.locator('[data-act="ctTab"][data-tab="'+which+'"]').click();const n=await page.evaluate(()=>window.__printed);await page.evaluate(which=>which==='day'?Hisaab.canteen.printDay():Hisaab.canteen.printMonth(),which);await page.waitForFunction(n=>window.__printed>n,n);check(await page.locator('#print-root img[data-company-logo]').count()===1,'native '+which+' print uses the same saved logo');await page.emulateMedia({media:'print'});await page.pdf({path:path.join(OUT,'print-canteen-'+which+'.pdf'),format:'A4',printBackground:true});await page.emulateMedia({media:'screen'});}
  // Template selection is an intentional persisted preference. Compare every
  // original financial/Attendance section, not that one changed setting.
  const afterReports=JSON.parse(await snapshot(page)),beforeReports=JSON.parse(saved);for(const k of ['workers','records','canteen','attendance'])assert.deepEqual(afterReports.data[k],beforeReports.data[k]);check(true,'all branded exports preserve every original financial/Attendance row, clock and history');
  await settings(page);const beforeBad=await snapshot(page);
  await upload(page,{name:'broken.jpg',mimeType:'image/jpeg',buffer:Buffer.from('not a jpeg')},'kharab');check(await snapshot(page)===beforeBad,'a corrupt native image reports an error and retains the previous saved logo/data');
  await upload(page,{name:'unsafe.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg onload="alert(1)"></svg>')},'Sirf PNG');check(await snapshot(page)===beforeBad,'native SVG upload is refused rather than storing or executing active content');
  await upload(page,{name:'large.png',mimeType:'image/png',buffer:Buffer.alloc(5*1024*1024+1)},'5 MB');check(await snapshot(page)===beforeBad,'native >5 MB upload is refused without touching any saved setting or record');
  await upload(page,path.join(FIX,'company-logo-alt.jpg'));const portrait=await page.evaluate(()=>Hisaab.Store.data.settings.companyLogo);check(portrait!==logo&&await page.locator('#companyLogoCard img').evaluate(async img=>{await img.decode();return img.naturalWidth===72&&img.naturalHeight===120;}),'Change logo saves a new portrait JPG without stretching it');await go(page,'hisaab');await download(page,'[data-act="pdfRec"][data-wid="salary-person"]','salary-portrait.pdf',portrait);await settings(page);
  const wide=Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=4000;c.height=1000;const x=c.getContext('2d');x.fillStyle='#2463b2';x.fillRect(0,0,c.width,c.height);x.fillStyle='#fff';x.font='200px sans-serif';x.fillText('WIDE COMPANY LOGO',100,600);return c.toDataURL('image/png').split(',')[1];}),'base64');
  await upload(page,{name:'wide.png',mimeType:'image/png',buffer:wide});const wideLogo=await page.evaluate(()=>Hisaab.Store.data.settings.companyLogo);check(await page.locator('#companyLogoCard img').evaluate(async img=>{await img.decode();return img.naturalWidth===640&&img.naturalHeight===160;}),'a 4000 × 1000 native PNG is safely downsized to 640 × 160');await go(page,'hisaab');await download(page,'[data-act="pdfRec"][data-wid="salary-person"]','salary-wide.pdf',wideLogo);await settings(page);
  await upload(page,path.join(FIX,'company-logo.webp'));check(await page.locator('#companyLogoCard img').evaluate(async img=>{await img.decode();return img.naturalWidth===80&&img.naturalHeight===128;}),'native WebP upload is decoded, safely rasterised and saved');
  await upload(page,path.join(FIX,'company-logo.png'));logo=await page.evaluate(()=>Hisaab.Store.data.settings.companyLogo);const beforeBackup=await snapshot(page),backup=await download(page,'[data-act="exportData"]','logo-backup.json');check(JSON.parse(backup).settings.companyLogo===logo&&await snapshot(page)===beforeBackup,'actual JSON backup includes the logo and every saved record without mutating the panel');
  const restoredContext=await b.newContext({viewport:{width:1280,height:900}}),restored=await restoredContext.newPage();restored.on('pageerror',e=>errors.push(e.stack));await restored.goto(URL);await restored.waitForFunction(()=>!!window.Hisaab);await settings(restored);const choose=restored.waitForEvent('filechooser');await restored.locator('[data-act="importData"]').click();await (await choose).setFiles(path.join(OUT,'logo-backup.json'));await restored.waitForFunction(logo=>Hisaab.Store.data.settings.companyLogo===logo,logo);check(await restored.locator('#companyLogoCard img').count()===1,'a fresh isolated browser restores the real backup with its logo, without uploading it again');await go(restored,'hisaab');await download(restored,'[data-act="pdfRec"][data-wid="salary-person"]','restored-salary.pdf',logo);
  // Actual localStorage transaction failure, not a mocked Store.save result.
  await settings(restored);const beforeFailure=await snapshot(restored);await restored.evaluate(()=>{window.__setItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='hisaabPro.v1')throw new DOMException('QA quota','QuotaExceededError');return window.__setItem.call(this,k,v);};});await upload(restored,path.join(FIX,'company-logo-alt.jpg'),'NAHIN');await restored.evaluate(()=>{Storage.prototype.setItem=window.__setItem;});check(await snapshot(restored)===beforeFailure,'real storage-quota failure rolls back the logo and every persisted record');await restoredContext.close();
  await page.locator('[data-act="companyLogoRemove"]').click();check(await page.locator('#cfmOk').count()===1,'Remove logo first asks for confirmation');await page.locator('[data-act="closeModal"]').first().click();check(await page.evaluate(v=>Hisaab.Store.data.settings.companyLogo===v,logo),'Cancel removal keeps the saved logo intact');await page.locator('[data-act="companyLogoRemove"]').click();await page.locator('#cfmOk').click();check(await page.locator('#companyLogoCard img').count()===0&&await page.evaluate(()=>JSON.parse(localStorage.getItem('hisaabPro.v1')).settings.companyLogo===''),'confirmed removal updates the preview and persists an explicit removal');
  await go(page,'hisaab');const noLogo=await download(page,'[data-act="pdfRec"][data-wid="salary-person"]','salary-removed.pdf');check(!noLogo.toString('latin1').includes('/CompanyLogo'),'subsequent salary PDFs no longer include the removed logo');
  await page.reload();await page.waitForFunction(()=>!!window.Hisaab);await settings(page);check(await page.locator('#companyLogoCard img').count()===0,'confirmed logo removal survives a real reload');await upload(page,path.join(FIX,'company-logo.png'));
  // Continue locally with the network disabled: no CDN/logo URL is needed.
  await context.setOffline(true);await go(page,'hisaab');await download(page,'[data-act="pdfRec"][data-wid="salary-person"]','salary-offline.pdf',logo);check(true,'already-open panel can generate branded PDFs fully offline');await context.setOffline(false);
  // Long branding text must wrap beside the logo and leave tables below it.
  await settings(page);await page.fill('#sShop','North Delhi Manufacturing and Logistics Services Private Limited');await page.fill('#sAddress','Plot 77, Industrial Area, Main Market, North Delhi, Delhi, India — Dispatch Office and Company Headquarters');await page.locator('[data-act="saveSettings"]').click();
  check(await page.evaluate(logo=>Hisaab.Store.data.settings.companyLogo===logo,logo),'ordinary Save settings retains the company logo when business name/address change');
  // Long repeated reports: all continuation pages and source rows are retained.
  await page.evaluate(()=>{const S=Hisaab.Store;S.data.canteen.entries[0].items=Array.from({length:100},()=>({...S.data.canteen.entries[0].items[0]}));S.data.canteen.entries[0].amount=3750;S.data.canteen.entries.splice(1);S.data.records[0].advances=Array.from({length:120},(_,i)=>({id:'qa-advance-'+i,date:'2026-11-14',note:'Advance '+String(i+1).padStart(3,'0'),amount:10}));if(!S.save(true))throw Error('QA save');});const beforeLong=await snapshot(page);await go(page,'canteen');for(const which of ['day','month']){await page.locator('[data-act="ctTab"][data-tab="'+which+'"]').click();const bytes=await download(page,'[data-act="'+(which==='day'?'ctPdfDay':'ctPdfMonth')+'"]','canteen-100-'+which+'.pdf',logo);check(logoPDF(bytes,logo)>2&&(bytes.toString('latin1').match(/\(500\) Tj ET/g)||[]).length===100,'native '+which+' long PDF retains all 100 quantities with logos on every continuation');}check(await snapshot(page)===beforeLong,'long branded PDF generation leaves complete raw saved data and sync state untouched');
  await go(page,'hisaab');const continued=await download(page,'[data-act="pdfRec"][data-wid="salary-person"]','salary-continued.pdf',logo);check(logoPDF(continued,logo)>2&&(continued.toString('latin1').match(/\(Advance \d{3}\)/g)||[]).length===120,'salary continuation pages retain all 120 advances and repeat the logo with wrapped company details');
  await report(page,ids.latin,'2026-12-01','2026-12-31');await reportDownload(page,'pdf','attendance-long-header.pdf',logo);await page.locator('[data-act="closeModal"]').first().click();check(await snapshot(page)===beforeLong,'wrapped-header salary and Attendance exports preserve the full saved data snapshot');
  fs.writeFileSync(path.join(OUT,'saved-final.json'),JSON.stringify(await page.evaluate(()=>Hisaab.Store.data),null,2));check(errors.length===0,'all logo scenarios finish without uncaught native JavaScript errors');await context.close();console.log('\n✅ COMPANY LOGO BROWSER: '+checks+' checks pass. Artifacts: '+OUT);
 }finally{await b.close();}
})().catch(e=>{console.error(e);console.error(errors);process.exitCode=1;});
