/* v3.39 native product-unit picker: real forms, legacy/custom labels, mobile,
   exact save/reload/ledger and guarded refusal. Isolated synthetic data only. */
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const {chromium} = require('playwright');
const {legacy} = require('./fixtures/stock');
const URL = process.env.HISAAB_URL || 'http://127.0.0.1:8000/hisaab_v3.html';
const OUT = path.resolve(process.env.HISAAB_ARTIFACTS || '.cache/stock-units-native');
const units = ['pcs','box','set','bundle','roll','packet','pack','carton','pair','dozen','bag','gaddi','table','unit','bottle','can','drum','kg','g','quintal','tonne','litre','ml','metre','cm','mm','feet','inch','sqft','sqm'];
const errors = [], requests = [];
let checks = 0, activePage = null, completed = false;
fs.mkdirSync(OUT, {recursive:true});
function check(value, label) { assert.ok(value, label); checks++; console.log('  ✅ ' + label); }
const snapshot = p => p.evaluate(() => JSON.stringify({data:Hisaab.Store.data, disk:Object.fromEntries(Object.keys(localStorage).sort().map(k => [k,localStorage.getItem(k)])), dirty:Hisaab.Cloud.dirty}));
async function open(p, name='Unit draft sample', qty='1.125') {
  await p.locator('.topbar-actions [data-act="stkAdd"]').click();
  // The retained product editor intentionally focuses the name after 60 ms.
  // Wait for that real ready state before filling later fields.
  await p.waitForFunction(()=>document.activeElement?.id==='stkPName');
  await p.fill('#stkPName',name); await p.fill('#stkPOpening',qty);
  await p.fill('#stkPDate','2026-11-01'); await p.fill('#stkPMin','0');
}
async function choose(p, unit) {
  await p.selectOption('#stkPUnitChoice',units.includes(unit)?unit:'__custom__');
  if (!units.includes(unit)) await p.fill('#stkPUnit',unit);
}
async function save(p) {
  await p.click('#stkProductSave');
  await p.waitForSelector('#stkProductForm',{state:'detached',timeout:5000});
}
async function close(p) {
  await p.locator('#overlay .modal-h [data-act="closeModal"]').click();
  await p.waitForSelector('#overlay',{state:'detached'});
}
async function edit(p,id) {
  await p.locator('[data-stk="productEdit"][data-id="'+id+'"]').click();
  await p.waitForFunction(()=>document.activeElement?.id==='stkPName');
}
function clock() {
  const D=Date; window.Date=class extends D {
    constructor(...args) { super(...(args.length?args:['2026-11-14T12:00:00Z'])); }
    static now() { return 1794657600000; }
  };
}
(async () => {
  console.log('\n▸ Native Stock unit choices v3.39 — product forms, custom labels and persistence');
  const browser=await chromium.launch({headless:true, executablePath:process.env.HISAAB_CHROME_EXECUTABLE||undefined, args:process.env.HISAAB_CHROME_ARGS?JSON.parse(process.env.HISAAB_CHROME_ARGS):['--no-sandbox']});
  try {
    const c=await browser.newContext({viewport:{width:1280,height:950},locale:'en-IN',timezoneId:'Asia/Kolkata',acceptDownloads:true});
    await c.addInitScript(clock);
    const p=await c.newPage(); activePage=p; p.on('pageerror',e=>errors.push(e.stack)); p.on('request',r=>requests.push(r.url()));
    await p.goto(new globalThis.URL('Hisaab-Pro-v3.38.html',URL).href);
    await p.evaluate(data=>{localStorage.clear();localStorage.setItem('hisaabPro.v1',JSON.stringify(data));},legacy);
    await p.reload(); await p.waitForFunction(()=>!!window.Hisaab);
    const saved=await p.evaluate(()=>['box','set','bundle','BOX','sq ft','crate'].map((unit,i)=>Hisaab.stock.saveProduct({name:'Legacy unit '+i,unit,date:'2026-11-01',openingQty:7.125,minQty:0})));
    const original=await snapshot(p), finance=await p.evaluate(()=>JSON.stringify({workers:Hisaab.Store.data.workers,records:Hisaab.Store.data.records,canteen:Hisaab.Store.data.canteen,attendance:Hisaab.Store.data.attendance}));
    await p.goto(URL); await p.waitForFunction(()=>!!window.Hisaab); await p.evaluate(()=>Hisaab.go('stock'));
    check(await p.locator('[data-ver]').first().textContent()==='3.39','exact native release reports v3.39');
    check(await snapshot(p)===original,'v3.38 → v3.39 preserves every raw stored byte, ID, opening, legacy unit and unrelated row');
    for (const product of saved) {
      await edit(p,product.id);
      const known=units.includes(product.unit);
      check(await p.locator('#stkPUnitChoice').inputValue()===(known?product.unit:'__custom__') && await p.locator('#stkPUnit').inputValue()===product.unit && await p.locator('#stkPUnit').isVisible()===!known,'existing '+product.unit+' opens without renaming/case-folding/replacing the saved unit');
      await close(p);
    }
    check(await snapshot(p)===original,'opening and cancelling all six existing product editors is a strict no-write operation');
    await open(p);
    check(await p.getByLabel('Unit *',{exact:true}).count()===1 && await p.locator('#stkPUnitChoice optgroup').count()===4,'visible Unit label is associated with a real four-group native dropdown');
    assert.deepEqual(await p.locator('#stkPUnitChoice optgroup option').evaluateAll(os=>os.map(o=>o.value)),units);
    check(await p.locator('#stkPUnitChoice').inputValue()==='pcs' && !await p.locator('#stkPUnit').isVisible(),'all 30 unique choices are present; new product defaults to pcs without an extra custom field');
    await p.locator('#stkPUnitChoice').focus(); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
    check(await p.locator('#stkPUnitChoice').inputValue()==='box' && await p.locator('#stkPUnit').inputValue()==='box','keyboard selection of box updates the exact submitted unit');
    await p.selectOption('#stkPUnitChoice','__custom__');
    check(await p.locator('#stkPUnit').isVisible() && await p.locator('#stkPUnit').inputValue()==='' && await p.locator('#stkPUnit').evaluate(el=>el===document.activeElement),'Other/custom reveals and focuses a blank editable unit, never silently reusing pcs/box');
    const beforeBlank=await snapshot(p); await p.click('#stkProductSave');
    check(await p.locator('#stkProductForm').count()===1 && !await p.locator('#stkPUnit').evaluate(el=>el.checkValidity()) && await snapshot(p)===beforeBlank,'native required validation blocks blank custom unit without a save or hidden-focus error');
    await p.fill('#stkPUnit','crate'); await choose(p,'bundle'); await p.selectOption('#stkPUnitChoice','__custom__');
    check(await p.locator('#stkPUnit').inputValue()==='crate' && await p.locator('#stkPName').inputValue()==='Unit draft sample' && await p.locator('#stkPOpening').inputValue()==='1.125','switching preset/custom restores this draft only and leaves other fields unchanged');
    await p.fill('#stkPUnit','abcdefghijklmnopqrstuvw');
    check((await p.locator('#stkPUnit').inputValue()).length===18,'actual browser enforces the existing 18-character custom-unit limit');
    await p.keyboard.press('Escape'); await p.waitForSelector('#stkProductForm',{state:'detached'});
    check(await snapshot(p)===original,'Escape after preset/custom/keyboard edits keeps all saved Stock and recovery keys unchanged');
    for (const unit of units) {
      await open(p,'Native choice '+unit); await choose(p,unit); await save(p);
      check(await p.evaluate(unit=>{const s=Hisaab.stock.data(),p=s.products.find(p=>p.name==='Native choice '+unit),t=s.transactions.find(t=>t.productId===p.id);return p.unit===unit && t.unit===unit && t.qty===1.125 && t.date==='2026-11-01' && t.source==='opening' && Hisaab.stock.inventory().find(x=>x.id===p.id).available===1.125;},unit),'real Add → select → Save retains exact '+unit+' and 1.125 dated opening, with no conversion');
    }
    await open(p,'Native custom sample'); await choose(p,'Crate A'); await save(p);
    const custom=await p.evaluate(()=>Hisaab.stock.data().products.find(p=>p.name==='Native custom sample'));
    check(custom.unit==='Crate A','new arbitrary custom spelling/case/spaces save exactly alongside the presets');
    await edit(p,custom.id); const beforeLock=await snapshot(p); await choose(p,'set'); await p.click('#stkProductSave');
    check((await p.locator('#stkFormError').textContent()).includes('unit') && await snapshot(p)===beforeLock,'changing a custom product to set after movements is atomically blocked, not converted');
    await p.selectOption('#stkPUnitChoice','__custom__'); await p.fill('#stkPNote','Metadata-only update'); await save(p);
    check(await p.evaluate(id=>{const p=Hisaab.stock.data().products.find(p=>p.id===id);return p.unit==='Crate A'&&p.note==='Metadata-only update'&&Hisaab.stock.inventory().find(p=>p.id===id).available===1.125;},custom.id),'restoring its exact custom unit permits a metadata-only edit with unchanged availability');
    const beforeMobile=await snapshot(p);
    for (const width of [390,320]) for (const theme of ['light','dark']) {
      await p.setViewportSize({width,height:844}); await p.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
      await open(p); await choose(p,'bundle');
      check(await p.evaluate(()=>{const r=document.querySelector('#stkPUnitChoice').getBoundingClientRect(),m=document.querySelector('.stk-dialog').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth+1 && r.left>=0 && r.right<=innerWidth && m.left>=0 && m.right<=innerWidth+1 && m.height<=innerHeight;}),'preset dropdown and scrollable Add dialog fit '+width+'px '+theme+' viewport');
      await p.selectOption('#stkPUnitChoice','__custom__'); await p.fill('#stkPUnit','crate');
      await p.locator('#stkPUnit').scrollIntoViewIfNeeded();
      check(await p.evaluate(()=>{const r=document.querySelector('#stkPUnit').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&document.documentElement.scrollWidth<=innerWidth+1;}),'custom label/text input remain visible without page overflow at '+width+'px '+theme);
      await p.waitForFunction(()=>!document.querySelector('#toast')?.classList.contains('show'));
      await p.screenshot({path:path.join(OUT,'add-unit-'+width+'-'+theme+'.png')});
      await p.locator('#stkProductSave').scrollIntoViewIfNeeded();
      await p.locator('#stkProductSave').click({trial:true});
      check(await p.locator('#stkProductSave').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&!el.disabled;}),'Save is reachable inside '+width+'px '+theme+' custom-unit form');
      await close(p);
    }
    check(await snapshot(p)===beforeMobile,'all four phone/light/dark custom drafts cancel without storage changes');
    await p.setViewportSize({width:1280,height:950}); await p.evaluate(()=>document.documentElement.dataset.theme='light');
    await c.setOffline(true); await open(p,'Native offline bundle','2.5'); await choose(p,'bundle'); await save(p); await c.setOffline(false);
    check(await p.evaluate(()=>Hisaab.stock.inventory().some(p=>p.name==='Native offline bundle'&&p.unit==='bundle'&&p.available===2.5)),'new dropdown and exact bundle saving work offline in an already-open panel');
    const beforeReload=await snapshot(p); await p.reload(); await p.waitForFunction(()=>!!window.Hisaab); await p.evaluate(()=>Hisaab.go('stock'));
    check(await snapshot(p)===beforeReload,'all 30 presets, new custom label and offline product survive full reload without a rewrite');
    await edit(p,custom.id);
    check(await p.locator('#stkPUnitChoice').inputValue()==='__custom__' && await p.locator('#stkPUnit').inputValue()==='Crate A','custom saved label is still editable/literal after reload'); await close(p);
    await open(p); await choose(p,'set'); await p.evaluate(()=>Hisaab.Cloud.epoch++); const stale=await snapshot(p); await p.click('#stkProductSave');
    check(await p.locator('#stkProductForm').count()===1 && !!await p.locator('#stkFormError').textContent() && await snapshot(p)===stale,'new preset cannot bypass the original stale-context save guard'); await close(p);
    await open(p); await choose(p,'box'); const quota=JSON.parse(await snapshot(p));
    await p.evaluate(()=>{window.__unitSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='hisaabPro.v1')throw new DOMException('Synthetic QA quota','QuotaExceededError');return window.__unitSetItem.call(this,k,v);};});
    await p.click('#stkProductSave'); const afterQuota=JSON.parse(await snapshot(p));
    check(await p.locator('#stkProductForm').count()===1 && !!await p.locator('#stkFormError').textContent() && JSON.stringify(afterQuota.data)===JSON.stringify(quota.data) && afterQuota.disk['hisaabPro.v1']===quota.disk['hisaabPro.v1'] && afterQuota.dirty===quota.dirty,'native quota refusal rolls back product/opening/audit and keeps the exact previous canonical data');
    check([...new Set([...Object.keys(quota.disk),...Object.keys(afterQuota.disk)])].filter(k=>quota.disk[k]!==afterQuota.disk[k]).every(k=>k.startsWith('hisaabPro.recovery.v1.')),'only the required pre-change safety copy may advance on a failed unit save');
    await p.evaluate(()=>{Storage.prototype.setItem=window.__unitSetItem;}); await close(p);
    check(await p.evaluate(expected=>JSON.stringify({workers:Hisaab.Store.data.workers,records:Hisaab.Store.data.records,canteen:Hisaab.Store.data.canteen,attendance:Hisaab.Store.data.attendance})===expected,finance),'all unit operations leave salary/Employee/Attendance/Canteen data intact');
    check(requests.every(url=>url.startsWith(new globalThis.URL(URL).origin+'/')||url.startsWith('data:')),'unit choice/custom/save makes no external request, conversion or upload');
    check(errors.length===0,'all native product-unit/validation/phone/offline/reload/refusal paths have zero uncaught errors');
    await c.close();
    console.log('\n✅ STOCK UNITS NATIVE: '+checks+' checks pass'); completed=true;
  } finally {
    if (!completed && activePage && !activePage.isClosed()) {
      fs.writeFileSync(path.join(OUT,'failure-state.json'),await activePage.evaluate(()=>JSON.stringify({stock:Hisaab.stock.data(),form:document.querySelector('#stkProductForm')?.outerHTML,error:document.querySelector('#stkFormError')?.textContent,toast:document.querySelector('#toast')?.textContent},null,2)));
      await activePage.screenshot({path:path.join(OUT,'failure.png')});
    }
    fs.writeFileSync(path.join(OUT,'checks.json'),JSON.stringify({checks,errors,requests},null,2));
    await browser.close();
  }
})().catch(error=>{console.error('❌ '+error.stack);process.exitCode=1;});
