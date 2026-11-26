/* Optional v3.28 native Chromium regression: repeated canteen item lines.
   Same HISAAB_URL / HISAAB_CHROME_* / HISAAB_ARTIFACTS controls as the other
   browser suites. Actual forms/downloads/reload; print/share destinations are
   stubbed. Disposable isolated QA data only — never a customer account. */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const { clickCanteenAction } = require('./canteen-report-dialog');
const URL = process.env.HISAAB_URL || 'http://127.0.0.1:8000/hisaab_v3.html';
const OUT = path.resolve(process.env.HISAAB_ARTIFACTS || path.join(__dirname, '..', '.cache', 'canteen-lines-browser-qa'));
const DATE = '2026-11-14', errors = [];
fs.mkdirSync(OUT, { recursive: true }); let checks = 0;
function check(value, label) { assert.ok(value, label); checks++; console.log('  ✅ ' + label); }
const countQty = (pdf, qty) => (pdf.toString('latin1').match(new RegExp('\\(' + qty + '\\) Tj ET', 'g')) || []).length;
async function goCanteen(page) {
  await page.evaluate(date => { Hisaab.UI.year = 2026; Hisaab.UI.month = 10; Hisaab.UI.ct.date = date; Hisaab.UI.ct.tab = 'day'; Hisaab.go('canteen'); }, DATE);
}
async function dataSnapshot(page) {
  return page.evaluate(() => JSON.stringify({ data: Hisaab.Store.data, disk: Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])), dirty: Hisaab.Cloud.dirty }));
}
async function itemRows(page) {
  return page.evaluate(() => {
    const card = [...document.querySelectorAll('#viewRoot .card')].find(c => /^(Saman item-wise|Item-wise summary)/.test(c.querySelector('h3')?.textContent || ''));
    return [...card.querySelectorAll('tbody tr')].map(r => [...r.cells].map(c => c.textContent));
  });
}
async function download(page, action, name) {
  const event = page.waitForEvent('download'); await clickCanteenAction(page, '[data-act="' + action + '"]');
  const file = await event; await file.saveAs(path.join(OUT, name));
  check(file.suggestedFilename().endsWith('.pdf'), name + ': actual native .pdf filename');
  const bytes = fs.readFileSync(path.join(OUT, name)); check(bytes.toString('latin1').startsWith('%PDF-1.4'), name + ': real PDF bytes'); return bytes;
}
async function addEntry(page, bill, totals = [37.5]) {
  await page.locator('[data-act="ctAdd"]').first().click();
  await page.fill('#ctDateM', DATE); await page.fill('#ctParty', 'Native vegetable supplier'); await page.fill('#ctBill', bill);
  for (let i = 0; i < totals.length; i++) {
    if (i) await page.locator('[data-act="ctAddItem"]').click();
    const field = f => `[data-ct-item="${i}"][data-ct-f="${f}"]`;
    await page.locator(field('name')).fill('Hara dhaniya'); await page.locator(field('qty')).fill('500');
    await page.locator(field('unit')).selectOption('gram'); await page.locator(field('priceMode')).selectOption('line');
    await page.locator(field('lineTotal')).fill(String(totals[i]));
  }
  await page.locator('[data-act="ctSave"]').click();
  await page.waitForSelector('[data-act="ctSave"]', { state: 'detached', timeout: 3000 }).catch(async e => {
    throw Error('Canteen save failed: ' + await page.locator('#toast').textContent() + '\n' + e);
  });
}
(async () => {
  const b = await chromium.launch({ headless: true, ...(process.env.HISAAB_CHROME_EXECUTABLE ? { executablePath: process.env.HISAAB_CHROME_EXECUTABLE } : {}),
    args: process.env.HISAAB_CHROME_ARGS ? JSON.parse(process.env.HISAAB_CHROME_ARGS) : ['--no-sandbox'] });
  try {
    const page = await b.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata', acceptDownloads: true });
    page.on('pageerror', e => errors.push(e.stack));
    await page.goto(new globalThis.URL('Hisaab-Pro-v3.27.html', URL).href); await page.waitForFunction(() => !!window.Hisaab);
    // Use old-release real forms to create the exact two-entry bug. Existing
    // salary/Attendance fixture records are preserved and compared at the end.
    await page.evaluate(() => { Hisaab.Store.data.settings.demo = false; Hisaab.Store.data.canteen = Hisaab.canteen.blank(); Hisaab.Store.data.canteen.demo = false; if (!Hisaab.Store.save(true)) throw Error('Fixture save failed'); });
    await goCanteen(page); await addEntry(page, 'QA-1'); await addEntry(page, 'QA-2');
    const saved = await dataSnapshot(page);
    check(await page.evaluate(() => Hisaab.canteen.entries().length === 2 && Hisaab.canteen.entries().every(e => e.items[0].qty === 500 && e.amount === 37.5)), 'v3.27 real forms save two independent 500g / 37.50 entries');
    const legacy = await download(page, 'ctPdfDay', 'legacy-merged-day.pdf');
    check(countQty(legacy, 1000) === 1 && countQty(legacy, 500) === 0, 'native old-release PDF reproduces the combined 1000g row');
    await page.goto(URL); await page.waitForFunction(() => !!window.Hisaab); await goCanteen(page);
    check(await page.locator('[data-ver]').first().textContent() === '3.39', 'native current release reports Panel v3.39');
    check(await dataSnapshot(page) === saved, 'v3.27 → v3.39 preserves every raw-storage byte, original entry and financial/Attendance record');
    let rows = await itemRows(page);
    check(rows.length === 2 && rows.every(r => r[1] === '500'), 'native daily item table has two separate 500g rows, not one 1000g row');
    check(rows[0][0].includes('QA-1') && rows[1][0].includes('QA-2') && rows.every(r => r.join(' ').includes('37.50')), 'native daily rows retain their own amount and original bill references');
    await page.evaluate(() => { window.__prints = 0; window.print = () => { window.__prints++; }; window.__opened = []; window.open = url => { window.__opened.push(url); return null; }; });
    for (const which of ['day', 'month']) {
      await page.locator('[data-act="ctTab"][data-tab="' + which + '"]').click();
      rows = await itemRows(page); check(rows.length === 2 && rows.every(r => r[1] === '500'), 'native ' + which + ' UI retains both original quantities');
      const pdf = await download(page, which === 'day' ? 'ctPdfDay' : 'ctPdfMonth', 'native-repeated-' + which + '.pdf');
      check(countQty(pdf, 500) === 2 && countQty(pdf, 1000) === 0, 'native ' + which + ' download contains two 500g rows, each with its own amount');
      const n = await page.evaluate(() => window.__prints);
      await clickCanteenAction(page, '[data-act="' + (which === 'day' ? 'ctPrintDay' : 'ctPrintMonth') + '"]');
      await page.waitForFunction(n => window.__prints > n, n);
      check(await page.evaluate(() => { const h = [...document.querySelectorAll('#print-root h4.sec')].find(h => /item-wise/i.test(h.textContent)); return [...h.nextElementSibling.querySelectorAll('tbody tr')].filter(r => !r.textContent.includes('Item-wise total')).filter(r => r.cells[1].textContent === '500').length === 2; }), 'native ' + which + ' browser-print DOM keeps two original rows');
      await page.pdf({ path: path.join(OUT, 'native-print-' + which + '.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
      // Capture actual File bytes without invoking an OS chooser or recipient.
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
        Object.defineProperty(navigator, 'share', { configurable: true, value: data => { window.__shared = data; return Promise.resolve(); } });
      });
      await clickCanteenAction(page, '[data-act="' + (which === 'day' ? 'ctSharePdfDay' : 'ctSharePdfMonth') + '"]');
      const shared = await page.evaluate(async () => { const f = window.__shared.files[0]; return { name: f.name, type: f.type, bytes: [...new Uint8Array(await f.arrayBuffer())] }; });
      fs.writeFileSync(path.join(OUT, 'native-shared-' + which + '.pdf'), Buffer.from(shared.bytes));
      check(shared.type === 'application/pdf' && shared.name.endsWith('.pdf') && countQty(Buffer.from(shared.bytes), 500) === 2, 'native ' + which + ' WhatsApp-share File is a real PDF with both 500g lines (share API stubbed)');
    }
    await page.locator('[data-act="ctShareMonth"]').first().click();
    check(await page.evaluate(() => { const text = new globalThis.URL(window.__opened.at(-1)).searchParams.get('text'); return (text.match(/500 gram/g) || []).length === 2 && !text.includes('1000 gram'); }), 'native monthly WhatsApp text also preserves two separate item occurrences');
    await page.locator('[data-act="ctTab"][data-tab="rates"]').click();
    check(await page.evaluate(() => [...document.querySelectorAll('#viewRoot tr')].some(r => r.textContent.includes('Hara dhaniya') && r.textContent.includes('1000 gram'))), 'native rate catalog remains intentionally cumulative, not changed by detail reports');
    check(await dataSnapshot(page) === saved, 'all native read-only reports/downloads/print/share retain the complete original data and disk snapshot');
    await page.locator('[data-act="ctTab"][data-tab="day"]').click(); await addEntry(page, 'QA-3', [37.5, 50]);
    check(await page.evaluate(() => { const e = Hisaab.canteen.entries().find(e => e.billNo === 'QA-3'); return e.items.length === 2 && e.items.every(i => i.qty === 500) && e.amount === 87.5 && Hisaab.canteen.totals(Hisaab.canteen.entries()).purchase === 162.5; }), 'native form saves two matching lines in one bill independently, with original 37.50 / 50 prices and correct grand total');
    rows = await itemRows(page); check(rows.length === 4 && rows.every(r => r[1] === '500'), 'native daily detail now shows all four original 500g occurrences');
    for (const which of ['day', 'month']) {
      await page.locator('[data-act="ctTab"][data-tab="' + which + '"]').click();
      const pdf = await download(page, which === 'day' ? 'ctPdfDay' : 'ctPdfMonth', 'native-own-rates-' + which + '.pdf');
      check(countQty(pdf, 500) === 4 && pdf.toString('latin1').includes('(' + String.fromCharCode(128) + '0.1) Tj ET'), 'native ' + which + ' PDF keeps all four quantities and each line’s own rate');
    }
    const afterForms = await dataSnapshot(page); await page.reload(); await page.waitForFunction(() => !!window.Hisaab); await goCanteen(page);
    check(await dataSnapshot(page) === afterForms && (await itemRows(page)).length === 4, 'native reload retains all separate items, original IDs and raw saved data');
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      for (const which of ['day', 'month']) {
        await page.locator('[data-act="ctTab"][data-tab="' + which + '"]').click();
        rows = await itemRows(page); check(rows.length === 4 && rows.every(r => r[1] === '500'), width + 'px ' + which + ' table keeps every saved item row');
        check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('#viewRoot .twrap')].every(n => n.getBoundingClientRect().right <= innerWidth + 1)), width + 'px ' + which + ' screen fits; only table wrappers scroll horizontally');
        if (process.env.HISAAB_SCREENSHOTS === '1') {
          const card = page.locator('#viewRoot .card').filter({ has: page.locator('h3').filter({ hasText: which === 'day' ? 'Saman item-wise' : 'Item-wise summary' }) });
          await card.scrollIntoViewIfNeeded(); await page.screenshot({ path: path.join(OUT, 'native-' + which + '-' + width + '.png') });
        }
      }
    }
    const before = JSON.parse(saved).data, after = JSON.parse(await dataSnapshot(page)).data;
    for (const key of ['workers', 'records', 'attendance']) assert.deepEqual(after[key], before[key]);
    for (const e of before.canteen.entries) assert.deepEqual(after.canteen.entries.find(x => x.id === e.id), e);
    check(true, 'new-form saves, exports and mobile navigation preserve every original salary/Attendance record and both legacy canteen entries');
    // Stress the actual native download path with more repeated rows than fit
    // on a page. A second isolated browser context has no access to the first.
    const many = await b.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true }); many.on('pageerror', e => errors.push(e.stack));
    await many.goto(URL); await many.waitForFunction(() => !!window.Hisaab);
    await many.evaluate(date => { const c = Hisaab.canteen.blank(); c.entries = [{ id: 'many', date, kind: 'purchase', mode: 'itemized', party: 'Native QA supplier', billNo: 'HUNDRED', amount: 3750, paid: 0, createdAt: 1, items: Array.from({ length: 100 }, () => ({ name: 'Hara dhaniya', qty: 500, unit: 'gram', priceMode: 'line', lineTotal: 37.5, rate: .075 })) }]; Hisaab.Store.data.settings.demo = false; Hisaab.Store.data.canteen = c; if (!Hisaab.Store.save(true)) throw Error('Large fixture save failed'); }, DATE);
    await goCanteen(many); const manyBefore = await dataSnapshot(many);
    for (const which of ['day', 'month']) {
      await many.locator('[data-act="ctTab"][data-tab="' + which + '"]').click();
      const pdf = await download(many, which === 'day' ? 'ctPdfDay' : 'ctPdfMonth', 'native-100-repeated-' + which + '.pdf');
      check(countQty(pdf, 500) === 100 && countQty(pdf, 50000) === 0 && (pdf.toString('latin1').match(/\/Type \/Page\b/g) || []).length > 2, 'native ' + which + ' download paginates all 100 occurrences without truncation/merging');
    }
    check(await dataSnapshot(many) === manyBefore, 'native 100-row report generation preserves its complete storage and financial data');
    check(errors.length === 0, 'no uncaught native JavaScript errors');
  } finally { await b.close(); }
  console.log('\n✅ CANTEEN LINES BROWSER: ' + checks + ' checks pass. Artifacts: ' + OUT);
})().catch(e => { console.error(e); console.error(errors); process.exitCode = 1; });
