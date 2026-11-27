/* v3.31 native Chromium: actual party form/select/reload/import and real
   date × party PDF downloads, shared Files, print, Unicode, mobile, offline,
   no-match and blocked storage. All synthetic; no real backend or recipient.
   Optional Playwright install and HISAAB_* variables match other browser QA. */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const { FROM, TO, DATE, A, B, FRESH, fixture, entry, item, idsA } = require('./fixtures/canteen-filters');
const URL = process.env.HISAAB_URL || 'http://127.0.0.1:8000/hisaab_v3.html';
const OUT = path.resolve(process.env.HISAAB_ARTIFACTS || path.join(__dirname, '..', '.cache', 'canteen-filters-browser-qa'));
fs.mkdirSync(OUT, { recursive: true }); const errors = [], copy = x => JSON.parse(JSON.stringify(x)); let checks = 0;
const check = (v, label) => { assert.ok(v, label); checks++; console.log('  ✅ ' + label); };
const KEY = 'hisaabPro.v1', A_TOKEN = 'name:gupta kirana', B_TOKEN = 'name:verma dairy';
async function snapshot(page) { return page.evaluate(() => JSON.stringify({ data: Hisaab.Store.data, disk: Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])), dirty: Hisaab.Cloud.dirty })); }
async function finance(page) { return page.evaluate(() => JSON.stringify({ workers: Hisaab.Store.data.workers, records: Hisaab.Store.data.records, canteen: Hisaab.Store.data.canteen, attendance: Hisaab.Store.data.attendance })); }
async function go(page, tab = 'day') { await page.evaluate(({ tab, date }) => { Hisaab.UI.year = 2026; Hisaab.UI.month = 10; Hisaab.UI.ct.date = date; Hisaab.UI.ct.tab = tab; Hisaab.go('canteen'); }, { tab, date: DATE }); }
async function close(page) { if (await page.locator('#overlay').count()) await page.locator('.modal-f [data-act="closeModal"], .modal-h [data-act="closeModal"]').first().click(); }
async function select(page, from = FROM, to = TO, party = A_TOKEN) {
  await page.locator('[data-act="ctReportOpen"]').click(); await page.fill('#ctReportFrom', from); await page.fill('#ctReportTo', to); await page.selectOption('#ctReportParty', party);
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#ctReportForm').closest('.modal')).opacity === '1');
}
async function download(page, name, act = 'ctReportDownload') {
  const ready = page.waitForEvent('download', { timeout: 20000 }); await page.locator('[data-act="' + act + '"]').click();
  const file = await ready; await file.saveAs(path.join(OUT, name)); const bytes = fs.readFileSync(path.join(OUT, name));
  check(bytes.subarray(0, 8).toString() === '%PDF-1.4' && file.suggestedFilename().endsWith('.pdf'), name + ': actual PDF download, not text/CSV');
  return { bytes, name: file.suggestedFilename() };
}
function selected(bytes, branded = false, ids = idsA) {
  const s = bytes.toString('latin1'); assert.ok(s.startsWith('%PDF-1.4'));
  for (const id of ids) assert.ok(s.includes('BILL-' + id), id + ' appears');
  for (const bad of ['BILL-B-', 'EXCLUDED', 'BILL-A-BEFORE', 'BILL-A-AFTER', 'UNASSIGNED', 'LITERAL-ALL', 'INVALID-DATE', 'HIDDEN-LUMP']) assert.ok(!s.includes(bad), bad + ' does not leak');
  for (const amount of ['150.25', '115.75', '135.75', '251.50', '90.00']) assert.ok(s.includes(amount));
  assert.equal((s.match(/\(500\) Tj ET/g) || []).length, 3); assert.ok(s.includes('(0.075)') || s.includes(String.fromCharCode(128) + '0.075'));
  assert.ok(!/Bikri|Kharcha/.test(s)); assert.equal((s.match(/cm \/CompanyLogo Do Q/g) || []).length, branded ? (s.match(/\/Type \/Page\b/g) || []).length : 0);
  return true;
}
async function seed(page, payload = fixture) { await page.evaluate(({ payload, key }) => { localStorage.setItem(key, JSON.stringify(payload)); }, { payload, key: KEY }); await page.reload(); await page.waitForFunction(() => !!window.Hisaab); await go(page); }
async function importJson(page, payload, name = 'synthetic-party-backup.json') {
  await page.evaluate(() => { Hisaab.go('settings'); window.__restoreRead = FileReader.prototype.readAsText; window.__restoreDone = false; FileReader.prototype.readAsText = function (...args) { this.addEventListener('loadend', () => { window.__restoreDone = true; }, { once: true }); return window.__restoreRead.apply(this, args); }; });
  try {
    const ready = page.waitForEvent('filechooser'); await page.locator('[data-act="importData"]').first().click();
    await (await ready).setFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(payload)) });
    await page.waitForFunction(() => window.__restoreDone);
  } finally { await page.evaluate(() => { FileReader.prototype.readAsText = window.__restoreRead; }); }
}
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.HISAAB_CHROME_EXECUTABLE ? { executablePath: process.env.HISAAB_CHROME_EXECUTABLE } : {}), args: process.env.HISAAB_CHROME_ARGS ? JSON.parse(process.env.HISAAB_CHROME_ARGS) : ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata', acceptDownloads: true });
    await context.addInitScript(() => {
      const RealDate = Date; window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2026-11-14T12:00:00Z'])); } static now() { return 1794657600000; } };
      window.__prints = 0; window.print = () => { window.__prints++; }; window.__shares = [];
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true }); Object.defineProperty(navigator, 'share', { configurable: true, value: async data => { const f = data.files[0]; window.__shares.push({ name: f.name, type: f.type, bytes: [...new Uint8Array(await f.arrayBuffer())] }); } });
    });
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.stack));
    await page.goto(new globalThis.URL('Hisaab-Pro-v3.30.html', URL).href); await page.waitForFunction(() => !!window.Hisaab); await seed(page); const old = await snapshot(page);
    await page.goto(URL); await page.waitForFunction(() => !!window.Hisaab); await go(page);
    check(await snapshot(page) === old, 'native v3.30 → v3.42 keeps every raw byte, record, ID, amount, party and line item');
    check(await page.locator('[data-ver]').first().textContent() === '3.42', 'native panel reports v3.42');
    const originalFinance = await finance(page); await page.locator('[data-act="ctTab"][data-tab="parties"]').click();
    check(await page.locator('#ctPartyForm').count() === 1 && (await page.locator('#viewRoot').textContent()).includes(FRESH), 'Parties tab shows a labelled save form and already-saved names with zero entries');
    await page.fill('#ctPartyNew', '  Native   Fresh Shop  '); await page.locator('#ctPartyForm button[type="submit"]').click();
    check(await page.evaluate(() => Hisaab.Store.data.settings.canteenParties['p:native fresh shop'] === 'Native Fresh Shop') && await finance(page) === originalFinance, 'real party form saves the trimmed reusable name without adding/repricing any financial entry');
    const afterParty = await snapshot(page); await page.fill('#ctPartyNew', 'NATIVE FRESH SHOP'); await page.locator('#ctPartyForm button[type="submit"]').click(); check(await snapshot(page) === afterParty, 'duplicate-name form submission is a no-op, not a duplicate party');
    await page.reload(); await page.waitForFunction(() => !!window.Hisaab); await go(page, 'parties');
    check((await page.locator('#viewRoot').textContent()).includes('Native Fresh Shop') && await snapshot(page) === afterParty, 'saved name survives native reload independently of entries');
    await page.locator('[data-act="ctPartyEntry"][data-party="name:native fresh shop"]').click();
    check(await page.locator('#ctParty').inputValue() === 'Native Fresh Shop' && await page.locator('#ctPartySelect').inputValue() === 'name:native fresh shop', 'party Entry action preselects the saved name in both actual controls');
    await page.selectOption('#ctPartySelect', B_TOKEN); check(await page.locator('#ctParty').inputValue() === B, 'actual entry dropdown switches to a saved party');
    await page.locator('[data-act="ctSetMode"][data-mode="total"]').click(); await page.fill('#ctLump', '12.5'); await page.fill('#ctBill', 'NATIVE-ENTRY-ONLY'); await page.locator('[data-act="ctSave"]').click();
    check(await page.evaluate(() => Hisaab.canteen.entries().find(e => e.billNo === 'NATIVE-ENTRY-ONLY')?.party === 'Verma Dairy'), 'real entry Save persists the selected party string and normal bill values');
    // Return to the adversarial fixed fixture before comparing exact report bytes.
    await seed(page); const tpls = await page.evaluate(() => Hisaab.canteen.tpls.map(t => t.id));
    for (const branded of [false, true]) {
      if (branded) {
        await page.evaluate(() => Hisaab.go('settings')); const chooser = page.waitForEvent('filechooser'); await page.locator('[data-act="companyLogoChoose"]').click(); await (await chooser).setFiles(path.join(__dirname, 'fixtures/company-logo.png'));
        await page.waitForFunction(() => document.querySelector('#companyLogoStatus')?.textContent.includes('Logo saved')); await go(page);
        check(await page.evaluate(() => !!Hisaab.Store.data.settings.companyLogo), 'one Settings upload automatically brands every selected report');
      }
      for (const tpl of tpls) {
        await select(page); await page.selectOption('#ctReportTpl', tpl);
        check(await page.locator('#ctReportPreview').getAttribute('data-count') === '4' && /₹115.75/.test(await page.locator('#ctReportPreview').textContent()), tpl + (branded ? ' logo' : '') + ': combined preview counts only the four matching rows and exact paid amount');
        const before = await snapshot(page), tag = tpl + (branded ? '-logo' : '');
        const file = await download(page, tag + '-selected.pdf'); check(selected(file.bytes, branded), tag + ': all report sections and totals exclude other parties, out-of-range and invalid-date data');
        check(file.name === 'Canteen_2026-10-31_to_2026-12-02_Gupta_Kirana.pdf', tag + ': download filename states selected period and party');
        await select(page); const count = await page.evaluate(() => window.__shares.length); await page.locator('[data-act="ctReportShare"]').click(); await page.waitForFunction(n => window.__shares.length > n, count); await page.waitForSelector('#ctReportForm', { state: 'detached' });
        const shared = await page.evaluate(() => window.__shares.at(-1)); fs.writeFileSync(path.join(OUT, tag + '-shared.pdf'), Buffer.from(shared.bytes));
        check(shared.type === 'application/pdf' && shared.name === file.name && Buffer.from(shared.bytes).equals(file.bytes), tag + ': actual share File is byte-for-byte the same selected PDF (OS recipient stubbed)');
        await select(page); const prints = await page.evaluate(() => window.__prints); await page.locator('[data-act="ctReportPrint"]').click(); await page.waitForFunction(n => window.__prints > n, prints); await page.waitForSelector('#ctReportForm', { state: 'detached' });
        const state = await page.evaluate(() => { const root = document.querySelector('#print-root'), tables = root.querySelectorAll('table'); return { text: root.textContent, headers: [...tables[0].querySelectorAll('th')].map(n => n.textContent), entries: tables[1].querySelectorAll('tbody tr').length, quantities: [...tables[2].rows].filter(r => r.cells[1]?.textContent === '500').length, net: root.querySelector('.net .v').textContent, logos: root.querySelectorAll('[data-company-logo]').length }; });
        check(state.headers.join('|') === 'Date|Din|Entries|Saman|Net|Paid|Baki' && state.entries === 5 && state.quantities === 3 && state.net === '−₹90.00' && state.logos === (branded ? 1 : 0) && !/EXCLUDED|Verma|INVALID-DATE|Bikri|Kharcha/.test(state.text), tag + ': native print DOM has the identical filtered ledger, entries, original lines, totals and branding');
        await page.pdf({ path: path.join(OUT, tag + '-print.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
        check(await snapshot(page) === before, tag + ': report downloads, native share and print are read-only for storage/cloud/financial data');
      }
    }
    await select(page, FROM, TO, 'name:saved without entries');
    check(await page.locator('#ctReportPreview').getAttribute('data-count') === '0' && await page.locator('[data-act="ctReportDownload"]').isDisabled() && await page.locator('[data-act="ctReportShare"]').isDisabled() && await page.locator('[data-act="ctReportPrint"]').isDisabled(), 'saved party without matches disables all outputs instead of exporting another party');
    await page.fill('#ctReportFrom', TO); await page.fill('#ctReportTo', FROM); check(await page.locator('#ctReportPreview').getAttribute('data-state') === 'invalid' && await page.locator('[data-act="ctReportDownload"]').isDisabled(), 'native reversed dates are rejected, not swapped or silently broadened');
    await page.fill('#ctReportFrom', ''); check(await page.locator('#ctReportPreview').getAttribute('data-state') === 'invalid', 'native missing From date remains invalid'); await close(page);
    await select(page, DATE, DATE, A_TOKEN); const one = await download(page, 'single-day-one-party.pdf');
    check(one.bytes.toString('latin1').includes('BILL-A-MIDDLE') && !one.bytes.toString('latin1').includes('BILL-A-START') && !one.bytes.toString('latin1').includes('BILL-B-MIDDLE'), 'same-day From=To includes only the selected party, not another same-date bill');
    await select(page, FROM, TO, 'none'); const blank = await download(page, 'unassigned-only.pdf'); check(blank.bytes.toString('latin1').includes('BILL-UNASSIGNED') && blank.bytes.toString('latin1').includes('BILL-SPACES-ONLY') && !blank.bytes.toString('latin1').includes('BILL-A-'), 'unassigned filter includes blank/whitespace parties but no named party');
    await select(page, FROM, TO, 'name:all parties'); const literal = await download(page, 'literal-all-parties.pdf'); check(literal.bytes.toString('latin1').includes('BILL-LITERAL-ALL') && !literal.bytes.toString('latin1').includes('BILL-A-'), 'literal party called All parties is not confused with the unrestricted option');
    // Native fallback and rejection must not claim a PDF was auto-attached.
    await page.evaluate(() => Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false })); await select(page); const manual = await download(page, 'manual-selected.pdf', 'ctReportShare');
    check(selected(manual.bytes, true) && /automatically attached \/ sent nahi/.test(await page.locator('#ctReportFallback').textContent()) && (await page.locator('#ctReportFallback a').getAttribute('href')).startsWith('https://wa.me/'), 'unsupported share downloads only the selected report and exposes explicit manual WhatsApp Document instructions');
    await page.selectOption('#ctReportParty', B_TOKEN); check(await page.locator('#ctReportFallback').textContent() === '', 'changing party clears an obsolete manual-attachment link'); await close(page);
    await page.evaluate(() => { Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true }); Object.defineProperty(navigator, 'share', { configurable: true, value: () => Promise.reject(new DOMException('Cancelled', 'AbortError')) }); });
    await select(page); await page.locator('[data-act="ctReportShare"]').click(); await page.waitForFunction(() => document.querySelector('#toast')?.textContent.includes('Sharing cancelled')); check(await page.locator('#ctReportFallback').textContent() === '', 'native share cancellation leaves no automatic download/manual-send fallback'); await close(page);
    // Same host/offline browser state; no PDF library or image fetch required.
    const beforeOffline = await snapshot(page); await context.setOffline(true); await select(page); const offline = await download(page, 'offline-selected.pdf'); check(selected(offline.bytes, true) && await snapshot(page) === beforeOffline, 'an already-open app exports exact selected logo PDFs fully offline without changing saved data'); await context.setOffline(false);
    // Hindi saved parties use the existing bundled Unicode renderer, not blank names.
    const hindi = copy(fixture), name = 'गुप्ता किराना', other = 'अन्य दुकान'; hindi.settings.companyLogo = await page.evaluate(() => Hisaab.Store.data.settings.companyLogo);
    hindi.settings.canteenParties['p:' + name] = name; hindi.settings.canteenParties['p:' + other] = other;
    hindi.canteen.entries = [entry('HINDI-SELECTED', DATE, name, 'purchase', 37.5, 10, [item('हरा धनिया', 37.5)], { note: 'चुनी हुई दुकान का पूरा विवरण' }), entry('HINDI-EXCLUDED', DATE, other, 'purchase', 999, 0, [item('दूसरा सामान', 999)])];
    await seed(page, hindi); await page.locator('[data-act="ctTab"][data-tab="parties"]').click(); check((await page.locator('#viewRoot').textContent()).includes(name), 'saved Hindi party remains literal and selectable');
    await select(page, DATE, DATE, 'name:' + name); const hindiPdf = await download(page, 'hindi-selected-logo.pdf'); const hs = hindiPdf.bytes.toString('latin1');
    check(hs.includes('/ActualText <FEFF') && hs.includes('/ATT1 ') && hs.includes('/CompanyLogo ') && hindiPdf.name === 'Canteen_2026-11-14_to_2026-11-14_Selected_Party.pdf' && hs.includes('BILL-HINDI-SELECTED') && !hs.includes('BILL-HINDI-EXCLUDED'), 'actual Hindi PDF has shaped name/item/note images, Unicode ActualText and logo, while excluding the other Hindi party');
    await select(page, DATE, DATE, 'name:' + name); const np = await page.evaluate(() => window.__prints); await page.locator('[data-act="ctReportPrint"]').click(); await page.waitForFunction(n => window.__prints > n, np); await page.pdf({ path: path.join(OUT, 'hindi-selected-print.pdf'), format: 'A4', printBackground: true });
    check(fs.readFileSync(path.join(OUT, 'hindi-selected-print.pdf')).toString('latin1').includes('NotoSansDevanagari') && await page.locator('#print-root .stmt').evaluate(el => el.style.fontFamily.startsWith('"Hisaab Indic"')), 'actual Hindi print PDF embeds the bundled Indic glyphs instead of searchable but visibly blank Latin-subset names');
    // Real import via file chooser: independent catalog, legacy optionality and explicit clear.
    await importJson(page, fixture); check(await page.evaluate(() => Hisaab.canteen.savedParties().length === 3 && Hisaab.canteen.savedParties().includes('Gupta Kirana')), 'real JSON file restore retains saved names independently of entries');
    const oldBackup = copy(fixture); delete oldBackup.settings.canteenParties; await importJson(page, oldBackup, 'pre-party-version.json'); check(await page.evaluate(() => Hisaab.canteen.savedParties().length === 3), 'pre-party backup lacking the optional field keeps the existing saved catalog');
    const bad = copy(fixture); bad.settings.canteenParties = ['invalid catalog']; const beforeBad = await snapshot(page); await importJson(page, bad, 'invalid-catalog.json'); check(await snapshot(page) === beforeBad, 'malformed imported catalog refuses the entire restore without overwriting good data');
    const clear = copy(fixture); clear.settings.canteenParties = {}; await importJson(page, clear); check(await page.evaluate(() => Hisaab.canteen.savedParties().length === 0 && Hisaab.Recovery.list().some(c => c.payload.settings.canteenParties && Object.keys(c.payload.settings.canteenParties).length)), 'explicit empty catalog in a backup clears names only with a recoverable previous copy');
    const beforeRecoveryFinance = await finance(page);
    await page.evaluate(() => { Hisaab.canteen.saveParty('Added after clear'); const saved = Hisaab.Recovery.list().find(c => c.payload.settings.canteenParties?.['p:gupta kirana']); Hisaab.Recovery.merge(saved.id); });
    await page.locator('#cfmOk').click();
    check(await page.evaluate(() => ['Gupta Kirana', 'Verma Dairy', 'Saved without entries', 'Added after clear'].every(name => Hisaab.canteen.savedParties().includes(name))) && await finance(page) === beforeRecoveryFinance, 'native Missing data jodo confirmation restores erased saved names, keeps new names and leaves every financial record intact');
    await seed(page); const fixedFinance = await finance(page);
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 }); await go(page, 'parties');
      await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth + 1, null, { timeout: 5000 });
      check(await page.evaluate(() => document.querySelector('#ctPartyNew').getBoundingClientRect().right <= innerWidth + 1 && document.querySelector('#ctPartyForm button').getBoundingClientRect().right <= innerWidth + 1), width + 'px Party Management input/save button fit within the screen');
      if (process.env.HISAAB_SCREENSHOTS === '1') await page.screenshot({ path: path.join(OUT, 'parties-' + width + '.png') });
      await select(page); await page.waitForFunction(() => { const m = document.querySelector('#ctReportForm').closest('.modal'), r = m.getBoundingClientRect(); return r.left >= -1 && r.right <= innerWidth + 1 && [...m.querySelectorAll('input,select,button')].every(n => { const b = n.getBoundingClientRect(); return b.left >= -1 && b.right <= innerWidth + 1; }); }, null, { timeout: 5000 });
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), width + 'px report From/To/Party/style/actions have no horizontal overflow');
      if (process.env.HISAAB_SCREENSHOTS === '1') await page.screenshot({ path: path.join(OUT, 'report-' + width + '.png') });
      const mobile = await download(page, 'mobile-' + width + '-selected.pdf'); check(selected(mobile.bytes), width + 'px native report still contains only the combined matching data');
    }
    await page.setViewportSize({ width: 1440, height: 1000 }); await go(page, 'parties'); const beforeBlocked = await snapshot(page);
    await page.evaluate(() => { window.__write = Storage.prototype.setItem; Storage.prototype.setItem = function (key, value) { if (key === 'hisaabPro.v1') throw new DOMException('Full', 'QuotaExceededError'); return window.__write.call(this, key, value); }; });
    await page.fill('#ctPartyNew', 'Never falsely saved'); await page.locator('#ctPartyForm button[type="submit"]').click();
    check(await page.locator('#ctPartyError').textContent() && !await page.evaluate(() => Hisaab.canteen.savedParties().includes('Never falsely saved')), 'real party form reports blocked storage and rolls back the catalog');
    await page.evaluate(() => { Storage.prototype.setItem = window.__write; });
    check(await page.evaluate(() => JSON.stringify(Hisaab.Store.data.settings.canteenParties)) === JSON.stringify(JSON.parse(beforeBlocked).data.settings.canteenParties), 'failed native save preserves the exact previously saved catalog');
    check(await finance(page) === fixedFinance, 'mobile/offline/failed catalog writes preserve every original payroll, Attendance and Canteen financial record');
    check(errors.length === 0, 'native filter/party flows finish without uncaught JavaScript errors');
    console.log(`\n✅ CANTEEN FILTERS BROWSER: ${checks} checks pass. Artifacts: ${OUT}`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); console.error(errors); process.exitCode = 1; });
