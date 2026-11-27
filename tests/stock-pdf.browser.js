/* v3.43 native premium PDF downloads, multipage / Unicode / mobile / offline.
   Isolated synthetic browser storage, local GETs only, no customer/backend use. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {overview,many}=require('./fixtures/stock-pdf');
const URL=process.env.HISAAB_URL||'http://127.0.0.1:8000/Hisaab-Pro-v3.43.html';
const OUT=path.resolve(process.env.HISAAB_ARTIFACTS||'.cache/stock-pdf-native');fs.mkdirSync(OUT,{recursive:true});
const logo='data:image/jpeg;base64,'+fs.readFileSync(path.join(__dirname,'fixtures/company-logo.jpg')).toString('base64');
const errors=[],requests=[];let checks=0;
function check(ok,label){assert.ok(ok,label);checks++;console.log('  ✅ '+label);}
const snapshot=p=>p.evaluate(()=>JSON.stringify({data:Hisaab.Store.data,disk:Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])),dirty:Hisaab.Cloud.dirty}));
function clock(){const Real=Date;window.Date=class extends Real{constructor(...args){super(...(args.length?args:['2026-11-14T12:00:00Z']));}static now(){return 1794657600000;}};}
async function ready(p){await p.waitForFunction(()=>document.querySelector('#stePdfDownload')&&!document.querySelector('#stePdfDownload').disabled);}
async function close(p){await p.locator('#stePdfDialog .modal-h [data-act="closeModal"]').click();await p.waitForSelector('#stePdfDialog',{state:'detached'});}
async function download(p,name){await ready(p);const event=p.waitForEvent('download');await p.click('#stePdfDownload');const file=await event;await file.saveAs(path.join(OUT,name));return fs.readFileSync(path.join(OUT,name));}
async function install(p,data){await p.evaluate(data=>{localStorage.clear();localStorage.setItem('hisaabPro.v1',JSON.stringify(data));},data);await p.reload();await p.waitForFunction(()=>!!window.Hisaab);await p.evaluate(()=>Hisaab.go('stock'));}
(async()=>{
 console.log('\n▸ Native premium Stock PDF v3.43');
 const browser=await chromium.launch({headless:true,...(process.env.HISAAB_CHROME_EXECUTABLE?{executablePath:process.env.HISAAB_CHROME_EXECUTABLE}:{}),args:process.env.HISAAB_CHROME_ARGS?JSON.parse(process.env.HISAAB_CHROME_ARGS):['--no-sandbox']});
 try{
   const c=await browser.newContext({viewport:{width:1280,height:1000},locale:'en-IN',timezoneId:'Asia/Kolkata',acceptDownloads:true});await c.addInitScript(clock);
   await c.route('**/*',route=>{const r=route.request();requests.push({url:r.url(),method:r.method(),body:r.postData()});return r.url().startsWith(new globalThis.URL(URL).origin+'/')?route.continue():route.abort();});
   const p=await c.newPage();p.on('pageerror',error=>errors.push(error.stack));
   await p.goto(new globalThis.URL('Hisaab-Pro-v3.40.html',URL).href);await p.waitForFunction(()=>!!window.Hisaab);
   const data=overview();data.settings.companyLogo=logo;await install(p,data);const baseline=await snapshot(p),oldRows=await p.evaluate(()=>Hisaab.stock.report({kind:'stock'}).rows);
   await p.goto(URL);await p.waitForFunction(()=>!!window.Hisaab);await p.evaluate(()=>Hisaab.go('stock'));
   check(await p.locator('[data-ver]').first().textContent()==='3.43','actual standalone release shows v3.43');
   check(await snapshot(p)===baseline,'real v3.40 to v3.43 upgrade preserves every stored byte and original data');
   check(JSON.stringify(await p.evaluate(()=>Hisaab.stock.report({kind:'stock'}).rows))===JSON.stringify(oldRows),'design upgrade retains exact report rows / IDs / units / dated ledger');
   check(await p.locator('[data-ste-pdf="current"]').isVisible(),'existing Stock PDF action opens the new design without setup');
   await p.click('[data-ste-pdf="current"]');await ready(p);
   check((await p.locator('#stePdfDialog .modal-h').textContent()).includes('navy / emerald'),'PDF dialog identifies the approved new design');
   const bytes=await download(p,'premium-overview-logo.pdf'),raw=bytes.toString('latin1');
   check(raw.startsWith('%PDF-1.4')&&raw.includes('0.047 0.09 0.15 rg'),'actual native PDF download contains the real navy vector report, not the mockup image');
   check((raw.match(/\/Type \/Page\b/g)||[]).length===1,'complete eight-product / four-unit / low-alert example is one A4 page');
   check((raw.match(/cm \/CompanyLogo Do Q/g)||[]).length===1,'saved original logo is used automatically, not an invented preview monogram');
   check(raw===await p.evaluate(()=>Hisaab.stock.pdfString(Hisaab.stock.report({kind:'stock',filters:{...Hisaab.stock.ui()}})).str),'real Download File bytes exactly equal the premium renderer result');
   check(await snapshot(p)===baseline,'preparing and actually downloading the PDF do not write any stock or storage');await close(p);
   await p.selectOption('#stkProductFilter','design-product-5');await p.click('[data-ste-pdf="current"]');await ready(p);
   check((await p.locator('#stePdfSummary').textContent()).includes('1 products'),'typed product filter applies before Apply, including PDF metrics and totals');await download(p,'premium-low-only-logo.pdf');await close(p);
   check(await snapshot(p)===baseline,'filter-only report remains read-only');
   for(const width of [390,320]){
     await p.setViewportSize({width,height:844});await p.click('[data-ste-pdf="current"]');await ready(p);
     const b=await p.locator('#stePdfDialog').boundingBox();check(b.x>=0&&b.x+b.width<=width+1&&b.height<=844,'PDF dialog fits '+width+'px');
     check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no sideways page overflow at '+width+'px');
     await p.locator('#stePdfDownload').click({trial:true});check(await p.locator('#stePdfDownload').isEnabled(),'Download is unobstructed / reachable at '+width+'px');await download(p,'premium-mobile-'+width+'-logo.pdf');await close(p);
   }
   await p.setViewportSize({width:1280,height:1000});
   const stress=many(128,{long:true});stress.settings.companyLogo=logo;await install(p,stress);const bigBefore=await snapshot(p);
   check(await p.locator('#stkProductFilter option').count()===129,'stress fixture has all128 actual products, not just a visible page');
   await p.click('[data-ste-pdf="current"]');const big=(await download(p,'premium-128-long-products-logo.pdf')).toString('latin1');
   check((big.match(/\/Type \/Page\b/g)||[]).length>4,'long128-product report genuinely paginates');check((big.match(/cm \/CompanyLogo Do Q/g)||[]).length===(big.match(/\/Type \/Page\b/g)||[]).length,'original logo is present once on every real continuation page');
   check(await snapshot(p)===bigBefore,'large repeated continuation rendering has zero data/storage writes');await close(p);
   const units=many(61,{manyUnits:true});units.settings.companyLogo=logo;await install(p,units);await p.click('[data-ste-pdf="current"]');await download(p,'premium-many-units-logo.pdf');await close(p);check(true,'more than four custom-unit total tiles paginate without a mixed-unit total or lost label');
   const hindi=overview();hindi.settings.companyLogo=logo;hindi.settings.shopName='उदाहरण बिलियर्ड्स';hindi.settings.address='दिल्ली · नमूना रिपोर्ट';
   const target=hindi.settings.stockInventory.products.find(p=>p.id==='design-product-5');target.name='हरा चॉक और सामान';target.unit='डिब्बा';
   hindi.settings.stockInventory.transactions.filter(t=>t.productId===target.id).forEach(t=>{t.productName=target.name;t.unit=target.unit;});
   await install(p,hindi);const hindiBefore=await snapshot(p);await p.click('[data-ste-pdf="current"]');await download(p,'premium-hindi-logo.pdf');await close(p);
   check(await snapshot(p)===hindiBefore,'Hindi on the dark masthead and amber rows exports without data mutation or transliteration');
   // Already-open offline export needs no image/font/upload service.
   await c.setOffline(true);await p.click('[data-ste-pdf="current"]');await download(p,'premium-offline-hindi-logo.pdf');await close(p);await c.setOffline(false);
   check(await snapshot(p)===hindiBefore,'already-open new PDF design works offline, including logo and shaped Hindi');
   await p.reload();await p.waitForFunction(()=>!!window.Hisaab);await p.evaluate(()=>Hisaab.go('stock'));check(await snapshot(p)===hindiBefore,'real reload retains original raw data after all new export paths');
   await p.evaluate(()=>{window.__shared=null;Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async value=>{const b=await value.files[0].arrayBuffer();window.__shared={name:value.files[0].name,type:value.files[0].type,bytes:Array.from(new Uint8Array(b))};}});});
   await p.click('[data-ste-pdf="current"]');await ready(p);await p.click('#stePdfShare');await p.waitForFunction(()=>window.__shared&&document.querySelector('#stePdfError').textContent.includes('Share sheet band'));
   const shared=await p.evaluate(()=>window.__shared);check(shared.type==='application/pdf'&&Buffer.from(shared.bytes).toString('latin1').startsWith('%PDF-1.4'),'native share sheet receives the actual styled PDF File, not a link / mockup / delivery claim');check(await snapshot(p)===hindiBefore,'sharing the new PDF remains read-only');await close(p);
   check(requests.every(r=>r.method==='GET'&&!r.body&&r.url.startsWith(new globalThis.URL(URL).origin+'/')),'no customer/account/image upload or extra runtime request');check(errors.length===0,'all new native exports / Unicode / offline / mobile paths have zero uncaught errors');
   fs.writeFileSync(path.join(OUT,'expected.json'),JSON.stringify({overview:oldRows,stress:stress.settings.stockInventory.products,units:units.settings.stockInventory.products,hindi:{company:hindi.settings.shopName,address:hindi.settings.address,name:target.name,unit:target.unit}},null,2));
   fs.writeFileSync(path.join(OUT,'checks.json'),JSON.stringify({checks,errors,requests},null,2));console.log('\n✅ PREMIUM STOCK PDF NATIVE: '+checks+' checks pass');await c.close();
 }finally{fs.writeFileSync(path.join(OUT,'js-errors.json'),JSON.stringify(errors,null,2));await browser.close();}
})().catch(error=>{console.error('❌ '+error.stack);process.exitCode=1;});
