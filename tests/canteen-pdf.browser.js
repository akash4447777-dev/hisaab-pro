/* Optional v3.30 native Chromium QA: six real template choices, day/month
   downloads, genuine shared PDF Files and Chromium print/Save-as-PDF.
   HISAAB_URL / HISAAB_CHROME_* / HISAAB_ARTIFACTS as in attendance.browser.js.
   Disposable fixture data only. OS print/share destinations are stubbed, never sent. */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const { clickCanteenAction } = require('./canteen-report-dialog');
const { DATE, fixture, columns, monthRows } = require('./fixtures/canteen-pdf');
const URL = process.env.HISAAB_URL || 'http://127.0.0.1:8000/hisaab_v3.html';
const OUT = path.resolve(process.env.HISAAB_ARTIFACTS || path.join(__dirname, '..', '.cache', 'canteen-pdf-browser-qa'));
fs.mkdirSync(OUT, { recursive: true }); const errors = []; let checks = 0;
const check = (value, label) => { assert.ok(value, label); checks++; console.log('  ✅ ' + label); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
async function snapshot(page) { return page.evaluate(() => JSON.stringify({ data: Hisaab.Store.data, disk: Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])), dirty: Hisaab.Cloud.dirty })); }
async function go(page, which = 'day') { await page.evaluate(({ date, which }) => { Hisaab.UI.year = 2026; Hisaab.UI.month = 10; Hisaab.UI.ct.date = date; Hisaab.UI.ct.tab = which; Hisaab.go('canteen'); }, { date: DATE, which }); }
async function download(page, act, name) {
  const ready = page.waitForEvent('download'); await clickCanteenAction(page, '[data-act="' + act + '"]'); const f = await ready;
  await f.saveAs(path.join(OUT, name)); return { name: f.suggestedFilename(), bytes: fs.readFileSync(path.join(OUT, name)) };
}
function updated(pdf, which, branded) {
  const s = pdf.toString('latin1'); assert.ok(s.startsWith('%PDF-1.4'));
  assert.ok(!/\([^\n]*?(?:bikri|kharcha)[^\n]*?\) Tj ET/i.test(s), 'no panel-authored category columns, labels or net-formula words');
  const net = which === 'day' ? String.fromCharCode(128) + '142.50' : String.fromCharCode(129) + String.fromCharCode(128) + '817.50';
  assert.ok(s.includes('(' + net + ') Tj'), 'exact original signed closing net');
  assert.equal((s.match(/\(500\) Tj ET/g) || []).length, 2, 'both 500g occurrences still separate');
  if (which === 'month') for (const label of columns) assert.ok(s.includes('(' + label.toUpperCase() + ') Tj ET'), 'seven-column header ' + label);
  assert.equal((s.match(/cm \/CompanyLogo Do Q/g) || []).length, branded ? (s.match(/\/Type \/Page\b/g) || []).length : 0, 'saved logo on every PDF page only when configured');
  return true;
}
async function printState(page) {
  return page.evaluate(() => {
    const root = document.querySelector('#print-root'), table = root.querySelector('table');
    return { text: root.textContent, headers: [...table.querySelectorAll('thead th')].map(t => t.textContent), rows: [...table.querySelectorAll('tbody tr')].map(r => [...r.cells].map(c => c.textContent)), spans: [...table.querySelectorAll('tbody tr:last-child td')].map(c => c.colSpan),
      meta: [...root.querySelectorAll('.meta > div')].map(c => [...c.querySelectorAll('.r')].map(r => r.textContent)), net: root.querySelector('.ct-closing .net .v').textContent, label: root.querySelector('.ct-closing .net .l').textContent,
      logos: root.querySelectorAll('img[data-company-logo]').length };
  });
}
(async () => {
  const b = await chromium.launch({ headless: true, ...(process.env.HISAAB_CHROME_EXECUTABLE ? { executablePath: process.env.HISAAB_CHROME_EXECUTABLE } : {}), args: process.env.HISAAB_CHROME_ARGS ? JSON.parse(process.env.HISAAB_CHROME_ARGS) : ['--no-sandbox'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata', acceptDownloads: true });
    await ctx.addInitScript(() => {
      const RealDate = Date; window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2026-11-14T12:00:00Z'])); } static now() { return 1794657600000; } };
      window.__prints = 0; window.print = () => { window.__prints++; }; window.__opened = []; window.open = url => { window.__opened.push(url); return null; };
      window.__shared = []; Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
      Object.defineProperty(navigator, 'share', { configurable: true, value: async data => { const f = data.files[0]; window.__shared.push({ name: f.name, type: f.type, bytes: [...new Uint8Array(await f.arrayBuffer())] }); } });
    });
    const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.stack));
    await page.goto(new globalThis.URL('Hisaab-Pro-v3.29.html', URL).href); await page.waitForFunction(() => !!window.Hisaab);
    await page.evaluate(data => localStorage.setItem('hisaabPro.v1', JSON.stringify(data)), fixture); await page.reload(); await page.waitForFunction(() => !!window.Hisaab);
    const original = await snapshot(page);
    await page.goto(URL); await page.waitForFunction(() => !!window.Hisaab); await go(page);
    check(await snapshot(page) === original, 'native v3.29 → v3.39 preserves every original saved entry, salary record and raw-storage byte');
    check(await page.locator('[data-ver]').first().textContent() === '3.39', 'native release shows Panel v3.39');
    const beforeEntries = await page.evaluate(() => JSON.stringify({ canteen: Hisaab.Store.data.canteen, workers: Hisaab.Store.data.workers, records: Hisaab.Store.data.records, attendance: Hisaab.Store.data.attendance }));
    const tpls = await page.evaluate(() => Hisaab.canteen.tpls.map(t => t.id));
    for (const branded of [false, true]) {
      if (branded) {
        await page.evaluate(() => Hisaab.go('settings'));
        const chooser = page.waitForEvent('filechooser'); await page.locator('[data-act="companyLogoChoose"]').click();
        await (await chooser).setFiles(path.join(__dirname, 'fixtures/company-logo.png'));
        await page.waitForFunction(() => document.querySelector('#companyLogoStatus')?.textContent.includes('Logo saved'));
        const saved = await snapshot(page); await page.reload(); await page.waitForFunction(() => !!window.Hisaab);
        check(await snapshot(page) === saved && await page.evaluate(() => !!Hisaab.Store.data.settings.companyLogo), 'native one-time Settings upload/reload remains available in all updated report formats');
      }
      await go(page);
      for (const tpl of tpls) {
        await page.locator('[data-act="ctTplPick"]').first().click(); await page.locator('[data-act="ctTplSet"][data-id="' + tpl + '"]').click(); await page.locator('.modal-f [data-act="closeModal"]').click();
        const tag = tpl + (branded ? '-logo' : ''), before = await snapshot(page);
        for (const which of ['day', 'month']) {
          await page.locator('[data-act="ctTab"][data-tab="' + which + '"]').click();
          const file = await download(page, which === 'day' ? 'ctPdfDay' : 'ctPdfMonth', tag + '-' + which + '.pdf');
          check(file.name.endsWith('.pdf') && updated(file.bytes, which, branded), tag + ' ' + which + ': real download has the new fields, correct net and both original item rows');
          const count = await page.evaluate(() => window.__shared.length);
          await clickCanteenAction(page, '[data-act="' + (which === 'day' ? 'ctSharePdfDay' : 'ctSharePdfMonth') + '"]');
          await page.waitForFunction(n => window.__shared.length > n, count);
          const shared = await page.evaluate(() => window.__shared.at(-1)), sharedBytes = Buffer.from(shared.bytes); fs.writeFileSync(path.join(OUT, tag + '-shared-' + which + '.pdf'), sharedBytes);
          check(shared.type === 'application/pdf' && shared.name === file.name && sharedBytes.equals(file.bytes), tag + ' ' + which + ': native-share File is the exact updated PDF, not text or an old format');
          const prints = await page.evaluate(() => window.__prints); await clickCanteenAction(page, '[data-act="' + (which === 'day' ? 'ctPrintDay' : 'ctPrintMonth') + '"]');
          await page.waitForFunction(n => window.__prints > n, prints); const state = await printState(page);
          check(!/bikri|kharcha/i.test(state.text) && state.meta[which === 'day' ? 1 : 0].length === 1 && state.net === (which === 'day' ? '₹142.50' : '−₹817.50') && state.label === (which === 'day' ? 'Din ka net' : 'Mahine ka net') && state.logos === (branded ? 1 : 0), tag + ' ' + which + ': print/Save-as-PDF removes the whole summary slots and formula words, retaining exact net and saved logo');
          if (which === 'month') {
            const printRows = monthRows.map(r => r.map(v => v === '-' ? '₹0' : v));
            check(same(state.headers, columns) && same(state.rows.slice(0, 4), printRows) && same(state.rows[4], ['Mahine ka total', '7', '₹1,088', '−₹818', '₹418', '₹1,100']) && same(state.spans, [2, 1, 1, 1, 1, 1]), tag + ': native print has exactly seven columns, every original daily value and a correctly merged total');
          }
          await page.pdf({ path: path.join(OUT, tag + '-print-' + which + '.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
        }
        check(await snapshot(page) === before, tag + ': all downloads, print PDFs and shared Files leave data/disk/cloud state unchanged');
      }
    }
    await go(page, 'month'); await page.evaluate(() => Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false }));
    const fallback = await download(page, 'ctSharePdfMonth', 'manual-fallback-month.pdf');
    check(updated(fallback.bytes, 'month', true) && (await page.locator('#ctReportFallback a').getAttribute('href')).startsWith('https://wa.me/'), 'unsupported native share downloads the updated PDF and exposes only the honest manual-attachment link');
    await page.locator('.modal-f [data-act="closeModal"]').click();
    const beforeOffline = await snapshot(page); await ctx.setOffline(true);
    const offline = await download(page, 'ctPdfMonth', 'offline-month.pdf'); check(updated(offline.bytes, 'month', true), 'already-open panel creates the updated logo PDF completely offline');
    check(await snapshot(page) === beforeOffline, 'offline reports preserve the complete saved JSON and pending cloud state'); await ctx.setOffline(false);
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 }); await go(page, 'month');
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), width + 'px panel has no page-level overflow; report changes do not alter the mobile screen ledger');
    }
    await page.reload(); await page.waitForFunction(() => !!window.Hisaab);
    check(await page.evaluate(before => JSON.stringify({ canteen: Hisaab.Store.data.canteen, workers: Hisaab.Store.data.workers, records: Hisaab.Store.data.records, attendance: Hisaab.Store.data.attendance }) === before, beforeEntries), 'native reports/reload keep all original nonzero sale/expense entries, salary data and separate own-price items');
    check(errors.length === 0, 'no uncaught native JavaScript errors');
    console.log(`\n✅ CANTEEN PDF COLUMNS BROWSER: ${checks} checks pass. Artifacts: ${OUT}`);
  } finally { await b.close(); }
})().catch(e => { console.error(e); console.error(errors); process.exitCode = 1; });
