/* v3.30 — remove complete Bikri/Kharcha report columns/slots, never data.
   Offline jsdom + genuine PDF/File bytes. No live backend or recipients.
   Optional --artifacts <ignored-dir>; HISAAB_HTML selects the release copy. */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { JSDOM, VirtualConsole } = require('jsdom');
const { withoutPartyReports } = require('./canteen-filters-compat');
const { DATE, fixture, columns, monthRows, totalRow, entry } = require('./fixtures/canteen-pdf');
const html = fs.readFileSync(process.env.HISAAB_HTML || path.join(__dirname, '..', 'hisaab_v3.html'), 'utf8');
const previous = fs.readFileSync(path.join(__dirname, '..', 'Hisaab-Pro-v3.29.html'), 'utf8');
const jpeg = fs.readFileSync(path.join(__dirname, 'fixtures/company-logo.jpg'));
const logo = 'data:image/jpeg;base64,' + jpeg.toString('base64');
const at = process.argv.indexOf('--artifacts'), OUT = at < 0 ? null : path.resolve(process.argv[at + 1]);
if (OUT) fs.mkdirSync(OUT, { recursive: true });
const KEY = 'hisaabPro.v1', copy = x => JSON.parse(JSON.stringify(x)), windows = [], errors = [];
const same = (a, b, why) => assert.deepEqual(copy(a), copy(b), why);
const artifact = (name, out) => { if (OUT) fs.writeFileSync(path.join(OUT, name), out.str, 'latin1'); };
function boot(payload = fixture, source = html) {
  const vc = new VirtualConsole(), raw = JSON.stringify(payload), files = [], blobs = new Map(), opened = [];
  vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(source, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.test/hisaab/', virtualConsole: vc,
    beforeParse(w) {
      const RealDate = w.Date; w.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2026-11-14T12:00:00Z'])); } static now() { return 1794657600000; } };
      w.localStorage.setItem(KEY, raw); w.scrollTo = () => {}; w.print = () => {};
      w.URL.createObjectURL = blob => { const url = 'blob:pdf-' + blobs.size; blobs.set(url, blob); return url; }; w.URL.revokeObjectURL = () => {};
      w.HTMLAnchorElement.prototype.click = function () { files.push({ name: this.download, blob: blobs.get(this.href) }); };
      w.open = url => { opened.push(url); return null; };
    } });
  windows.push(dom); const w = dom.window, H = w.Hisaab; assert.ok(H);
  H.UI.year = 2026; H.UI.month = 10; H.UI.ct.date = DATE; H.go('canteen');
  return { w, H, C: H.canteen, S: H.Store, raw, files, opened, $: s => w.document.querySelector(s) };
}
const snapshot = d => JSON.stringify({ data: d.S.data, disk: Object.fromEntries(Object.keys(d.w.localStorage).sort().map(k => [k, d.w.localStorage.getItem(k)])), dirty: d.H.Cloud.dirty });
function trace(d, which = 'month', date = DATE) {
  const texts = [], lines = [], proto = d.H.PdfDoc.prototype, text = proto.text, line = proto.line;
  proto.text = function (x, y, size, value, options) { texts.push({ page: this.pages.indexOf(this.cur), x, y, size, text: String(value), options: options || {} }); return text.apply(this, arguments); };
  proto.line = function (x1, y1, x2, y2) { lines.push({ page: this.pages.indexOf(this.cur), x1, y1, x2, y2 }); return line.apply(this, arguments); };
  try { return { ...(which === 'day' ? d.C.pdfDayStr(date) : d.C.pdfMonthStr(2026, 10)), texts, lines }; }
  finally { proto.text = text; proto.line = line; }
}
function ledger(out) {
  const a = out.texts.findIndex(t => t.size === 7.875 && t.text === 'DATE');
  const b = out.texts.findIndex(t => t.size === 9 && t.text === 'Mahine ka total');
  assert.ok(a >= 0 && b > a, 'complete ledger and total');
  const headers = out.texts.slice(a, a + 7), data = out.texts.slice(a + 7, b).filter(t => t.size === 9), rows = [];
  for (const t of data) {
    if (!rows.length || rows.at(-1)[0].page !== t.page || rows.at(-1)[0].y !== t.y) rows.push([]);
    rows.at(-1).push(t);
  }
  // The total's empty Din slot is a merged cell and is not drawn as text.
  const total = out.texts.slice(b).filter(t => t.size === 9 && t.page === out.texts[b].page && t.y === out.texts[b].y);
  return { headers, rows, total };
}
function purchaseSummary(out, which, branded) {
  const x = which === 'day' ? 312.64 : 40, y = branded ? 765 : 768;
  const cells = out.texts.filter(t => t.page === 0 && t.size === 8.625 && t.y <= y && t.y >= y - 28 && t.x >= x - .001 && t.x <= x + 242.641);
  assert.equal(cells.length, 2, 'exactly one label/value pair; no hidden category amounts');
  assert.ok(cells[0].text.startsWith('Saman aaya')); assert.equal(cells[0].y, y);
  assert.equal(cells[1].text, which === 'day' ? '₹87.50' : '₹1,087.50');
  // ctDash draws short line segments; count each row's first segment, not a
  // nonexistent solid underline spanning the whole summary column.
  assert.equal(out.lines.filter(l => l.page === 0 && Math.abs(l.x1 - x) < .001 && l.x2 > x && l.x2 < x + 3 && l.y1 <= y && l.y1 >= y - 33).length, 1, 'no empty category underline rows');
}
function print(d, which) { if (which === 'day') d.C.printDay(); else d.C.printMonth(); return d.$('#print-root'); }
const bytes = (d, blob) => new Promise((resolve, reject) => { const r = new d.w.FileReader(); r.onload = () => resolve(Buffer.from(r.result)); r.onerror = () => reject(r.error); r.readAsArrayBuffer(blob); });
function body(source, name) { const m = source.match(new RegExp('^function ' + name + '\\([\\s\\S]*?^\\}', 'gm')); assert.equal(m?.length, 1, name); return m[0]; }
function replaceExact(s, from, to, n = 1) { assert.equal(s.split(from).length - 1, n, from.slice(0, 95)); return s.split(from).join(to); }
// Whitelist exact presentation edits, not entire financial/report function bodies.
function expectedReport(name) {
  let s = body(previous, name);
  if (name === 'ctPrintHTML') {
    s = replaceExact(s, ' + mRow("", money(t.sale)) + mRow("", money(t.expense))', '', 2);
    s = replaceExact(s, '<th class="r">Saman</th><th class="r">Bikri</th>', '<th class="r">Saman</th>');
    s = replaceExact(s, '<th class="r">Kharcha</th>', '');
    s = replaceExact(s,
      `          '<td class="r">' + d.list.length + '</td><td class="r">' + money0(d.t.purchase) + '</td><td class="r">' + money0(d.t.sale) + "</td>" +
          '<td class="r">' + money0(d.t.expense) + '</td><td class="r"><b>' + (d.t.net < 0 ? "−" : "") + money0(Math.abs(d.t.net)) + "</b></td>" +`,
      `          '<td class="r">' + d.list.length + '</td><td class="r">' + money0(d.t.purchase) + "</td>" +
          '<td class="r"><b>' + (d.t.net < 0 ? "−" : "") + money0(Math.abs(d.t.net)) + "</b></td>" +`);
    s = replaceExact(s, `        '<td class="r"><b>' + money0(t.sale) + '</b></td><td class="r"><b>' + money0(t.expense) + "</b></td>" +\n`, '');
  } else if (name === 'ctPdfDayStr') {
    s = replaceExact(s, '[["Saman aaya", money(t.purchase)], ["", money(t.sale)], ["", money(t.expense)]]', '[["Saman aaya", money(t.purchase)]]');
  } else {
    s = replaceExact(s, '[["Saman aaya (purchase)", money(t.purchase)], ["", money(t.sale)], ["", money(t.expense)]]', '[["Saman aaya (purchase)", money(t.purchase)]]');
    s = replaceExact(s, 'money0(d.t.purchase), money0(d.t.sale), money0(d.t.expense),', 'money0(d.t.purchase),');
    s = replaceExact(s, 'String(t.count), money0(t.purchase), money0(t.sale), money0(t.expense),', 'String(t.count), money0(t.purchase),');
  }
  if (name !== 'ctPdfMonthStr') s = replaceExact(s, 'Din ka net (bikri − saman − kharcha)', 'Din ka net');
  if (name !== 'ctPdfDayStr') s = replaceExact(s, 'Mahine ka net (bikri − saman − kharcha)', 'Mahine ka net');
  return s;
}
let passed = 0, failed = 0;
async function test(label, run) { try { await run(); passed++; console.log('  ✅ ' + label); } catch (e) { failed++; console.error('  ❌ ' + label + '\n     ' + e.stack); } }
(async () => {
  const d = boot(), old = boot(fixture, previous);
  await test('v3.29 → v3.30 boot preserves every raw storage byte, financial/Attendance record and ID', () => {
    assert.equal(d.w.localStorage.getItem(KEY), d.raw); assert.equal(snapshot(d), snapshot(old));
  });
  await test('seven reflowed columns have fixed full-width geometry and right-aligned money', () => {
    same(d.C.pdfCols.month.map(c => c.l), columns); same(d.C.pdfCols.month.map(c => c.w), [85, 40, 50, 85, 90, 85, 80.28]);
    assert.equal(d.C.pdfCols.month.reduce((a, c) => a + c.w, 0), 515.28); same(d.C.pdfCols.month.slice(2).map(c => c.r), [1, 1, 1, 1, 1]);
  });
  await test('nonzero sale/expense categories still calculate exact original net/paid/balance', () => {
    const t = d.C.totals(d.C.inMonth(2026, 10)), dt = d.C.totals(d.C.onDate(DATE));
    same([t.count, t.purchase, t.sale, t.expense, t.net, t.paid, t.balance], [7, 1087.5, 350, 80, -817.5, 417.5, 1100]);
    same([dt.purchase, dt.sale, dt.expense, dt.net, dt.paid, dt.balance], [87.5, 250, 20, 142.5, 157.5, 200]);
    same(t, old.C.totals(old.C.inMonth(2026, 10)));
  });
  for (const branded of [false, true]) {
    if (branded) { d.S.data.settings.companyLogo = logo; old.S.data.settings.companyLogo = logo; }
    for (const tpl of d.C.tpls) {
      d.C.setTpl(tpl.id); old.C.setTpl(tpl.id);
      const tag = tpl.id + (branded ? ' logo' : ' no-logo'), before = snapshot(d);
      const day = trace(d, 'day'), month = trace(d), l = ledger(month);
      artifact(tpl.id + (branded ? '-logo' : '') + '-day.pdf', day); artifact(tpl.id + (branded ? '-logo' : '') + '-month.pdf', month);
      await test(tag + ': actual day/month PDFs omit all category slots/formula labels', () => {
        for (const [which, out] of [['day', day], ['month', month]]) {
          assert.ok(out.str.startsWith('%PDF-1.4')); assert.ok(!out.texts.some(t => /bikri|kharcha/i.test(t.text))); purchaseSummary(out, which, branded);
          assert.ok(out.texts.some(t => t.text === (which === 'day' ? '₹142.50' : '−₹817.50') && t.options.black));
          assert.equal((out.str.match(/cm \/CompanyLogo Do Q/g) || []).length, branded ? (out.str.match(/\/Type \/Page\b/g) || []).length : 0);
        }
      });
      await test(tag + ': every daily ledger cell and merged total is under the correct seven headers', () => {
        same(l.headers.map(t => t.text), columns.map(c => c.toUpperCase())); same(l.headers.map(t => t.x), [47, 132, 208, 293, 383, 468, 548.28]);
        same(l.rows.map(r => r.map(t => t.text)), monthRows); same(l.total.map(t => t.text), totalRow.filter((_, i) => i !== 1));
        const ys = l.rows.map(r => r[0].y); assert.ok(ys.every((y, i) => !i || y === ys[i - 1] - 20));
        for (const x of [40, 125, 165, 215, 300, 390, 475, 555.28]) assert.ok(month.lines.some(l => Math.abs(l.x1 - x) < .001 && Math.abs(l.x2 - x) < .001 && l.y1 !== l.y2), 'vertical grid border ' + x);
        assert.equal(month.texts.filter(t => t.size === 9 && t.text === '500').length, 2, 'both separate original 500g quantities');
      });
      await test(tag + ': full browser-print HTML differs only in the requested removals and version', () => {
        for (const which of ['day', 'month']) {
          const root = print(d, which), prior = print(old, which), summary = prior.querySelector('.meta').children[which === 'day' ? 1 : 0];
          [...summary.querySelectorAll('.r')].slice(1).forEach(r => r.remove());
          prior.querySelector('.ct-closing .net .l').textContent = which === 'day' ? 'Din ka net' : 'Mahine ka net';
          if (which === 'month') for (const row of prior.querySelector('table').rows) {
            const offset = row.cells[0].colSpan === 2 ? 1 : 0; row.cells[5 - offset].remove(); row.cells[4 - offset].remove();
          }
          assert.equal(root.innerHTML.replaceAll('Hisaab v3.39', 'Hisaab v3.29'), prior.innerHTML);
          assert.ok(!/bikri|kharcha/i.test(root.textContent));
          assert.equal(root.querySelectorAll('.meta > div')[which === 'day' ? 1 : 0].children.length, 1);
        }
        assert.equal(snapshot(d), before, 'PDF/print is read-only');
      });
    }
  }
  await test('download and Web Share day/month Files contain the same genuine updated PDF bytes', async () => {
    const before = snapshot(d); let shared;
    Object.defineProperty(d.w.navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(d.w.navigator, 'share', { configurable: true, value: data => { shared = data; return Promise.resolve(); } });
    for (const which of ['day', 'month']) {
      const expected = which === 'day' ? d.C.pdfDayStr(DATE) : d.C.pdfMonthStr(2026, 10);
      if (which === 'day') d.C.pdfDay(DATE); else d.C.pdfMonth(2026, 10);
      assert.equal(d.files.at(-1).name, expected.name); assert.equal((await bytes(d, d.files.at(-1).blob)).toString('latin1'), expected.str);
      d.C.sharePdf(which, DATE, 2026, 10); assert.equal(shared.files[0].type, 'application/pdf'); assert.equal(shared.files[0].name, expected.name);
      assert.equal((await bytes(d, shared.files[0])).toString('latin1'), expected.str);
    }
    assert.equal(snapshot(d), before);
  });
  await test('manual WhatsApp fallback downloads the same seven-column PDF without changing data', async () => {
    Object.defineProperty(d.w.navigator, 'canShare', { configurable: true, value: () => false }); const before = snapshot(d);
    d.C.sharePdf('month', DATE, 2026, 10); assert.equal(d.files.at(-1).blob.type, 'application/pdf');
    assert.equal((await bytes(d, d.files.at(-1).blob)).toString('latin1'), d.C.pdfMonthStr(2026, 10).str); assert.ok(d.opened.at(-1).startsWith('https://wa.me/')); assert.equal(snapshot(d), before);
  });
  await test('CSV, visible app categories, original duplicate lines and all finance data remain intact', async () => {
    const before = snapshot(d); d.C.csv(); old.C.csv(); assert.equal((await bytes(d, d.files.at(-1).blob)).toString('utf8'), (await bytes(old, old.files.at(-1).blob)).toString('utf8'));
    d.H.go('canteen'); assert.match(d.$('#viewRoot').textContent, /Bikri/); assert.match(d.$('#viewRoot').textContent, /Kharcha/);
    same(d.C.itemLines(d.C.onDate(DATE)).map(i => [i.qty, i.amt]), [[500, 37.5], [500, 50]]); assert.equal(snapshot(d), before);
  });
  await test('reported ₹59,038 / 26-entry example has seven cells and the identical negative net/paid/baki', () => {
    const f = copy(fixture); f.canteen.entries = Array.from({ length: 26 }, (_, i) => entry('screenshot' + i, DATE, 'purchase', i === 25 ? 2288 : 2270, i === 25 ? 2288 : 2270));
    const x = boot(f), out = trace(x), l = ledger(out); same(l.rows.map(r => r.map(t => t.text)), [['14 Nov 2026', 'Sat', '26', '₹59,038', '−₹59,038', '₹59,038', '-']]);
    same(l.total.map(t => t.text), ['Mahine ka total', '26', '₹59,038', '−₹59,038', '₹59,038', '-']); artifact('screenshot-seven-columns.pdf', out);
  });
  await test('zero amounts, expense-only and sale-only dates keep their original rows/net/balance', () => {
    const f = copy(fixture); f.canteen.entries = [entry('zero', DATE, 'purchase', 0, 0), entry('expense-only', '2026-11-15', 'expense', 43, 10), entry('sale-only', '2026-11-16', 'sale', 99, 99)];
    const x = boot(f), out = trace(x); same(ledger(out).rows.map(r => r.map(t => t.text)), [
      ['14 Nov 2026', 'Sat', '1', '₹0', '₹0', '₹0', '-'], ['15 Nov 2026', 'Sun', '1', '₹0', '−₹43', '₹10', '₹33'], ['16 Nov 2026', 'Mon', '1', '₹0', '₹99', '₹99', '-']]);
    artifact('zero-nonpurchase-month.pdf', out);
  });
  await test('empty data still refuses empty direct PDFs and print honestly, without replacing an existing report', () => {
    const f = copy(fixture); f.canteen.entries = []; const x = boot(f), before = snapshot(x), originalPrint = x.$('#print-root').innerHTML;
    assert.equal(x.C.pdfDayStr(DATE), null); assert.equal(x.C.pdfMonthStr(2026, 10), null);
    for (const which of ['day', 'month']) { const root = print(x, which); assert.equal(root.innerHTML, originalPrint); assert.match(x.$('#toast').textContent, /koi entry nahi/); } assert.equal(snapshot(x), before);
  });
  await test('customer-entered Bikri/Kharcha names/notes remain literal; only panel-authored report fields were removed', () => {
    const f = copy(fixture); f.settings.shopName = 'Bikri Kharcha Store'; f.settings.statementNote = 'Customer note: Bikri aur Kharcha'; f.canteen.entries[0].items[0].name = 'Kharcha customer item';
    const x = boot(f), before = snapshot(x), out = trace(x); assert.ok(out.texts.some(t => t.text.includes('Bikri Kharcha Store'))); assert.ok(out.texts.some(t => t.text.includes('Kharcha customer item'))); assert.ok(out.texts.some(t => t.text.includes(f.settings.statementNote))); assert.equal(snapshot(x), before);
  });
  await test('100 original rows continue completely with company logos and the requested seven-column monthly ledger', () => {
    const f = copy(fixture); f.settings.companyLogo = logo; f.canteen.entries = Array.from({ length: 100 }, (_, i) => entry('long' + i, DATE, 'purchase', 37.5, 0, { mode: 'itemized', items: [copy(fixture.canteen.entries[0].items[0])] }));
    const x = boot(f), before = snapshot(x); for (const which of ['day', 'month']) { const out = trace(x, which); assert.equal(out.texts.filter(t => t.size === 9 && t.text === '500').length, 100); assert.ok((out.str.match(/\/Type \/Page\b/g) || []).length >= 4); assert.ok(!out.texts.some(t => /bikri|kharcha/i.test(t.text))); artifact('100-lines-logo-' + which + '.pdf', out); } assert.equal(snapshot(x), before);
  });
  await test('all three report functions have ONLY the exact audited column/summary/formula removals', () => {
    for (const name of ['ctPrintHTML', 'ctPdfDayStr', 'ctPdfMonthStr']) assert.equal(body(html, name), expectedReport(name), name);
  });
  await test('entire app/storage/cloud/recovery/salary/Attendance/CSS/fonts/logo source is otherwise byte-identical to v3.29', () => {
    function normalize(source) {
      source = withoutPartyReports(source);
      for (const name of ['ctPrintHTML', 'ctPdfDayStr', 'ctPdfMonthStr']) source = source.replace(body(source, name), 'REPORT ' + name);
      const cols = source.match(/^const CT_COLS_MONTH = \[[\s\S]*?\];/m); assert.ok(cols); source = source.replace(cols[0], 'MONTH COLS');
      source = source.replace(/const APP_VERSION = "3\.(?:29|30)";/, 'VERSION');
      source = source.replace('/* Seven visible PDF columns still span the full A4 content width. */\n', '');
      source = source.replace('/* v3.18: summary ke sale/expense labels blank; amounts, rows aur hisaab unchanged. */\n', '');
      source = source.replace('/* v3.30: PDF/print omit sale/expense columns and summary slots entirely.\n   Original entries, category totals, net/paid/balance and app/CSV stay unchanged. */\n', '');
      return source.replace(/^      'v3\.30 — <b style="color:var\(--ink\)">PDF se Bikri \/ Kharcha columns removed<\/b>:[^\n]*\n/m, '');
    }
    assert.equal(normalize(html), normalize(previous));
    assert.equal(crypto.createHash('sha256').update(previous).digest('hex'), 'e0b41029bba0716924ef75b909c39c794d46bfd1fee19adeed4e5246d8b50831');
    assert.equal(html, fs.readFileSync(path.join(__dirname, '..', 'Hisaab-Pro-v3.39.html'), 'utf8'));
  });
  await test('all report regressions finish without uncaught JavaScript errors', () => same(errors, []));
  windows.forEach(w => w.window.close()); console.log(`\n${failed ? '❌' : '✅'} CANTEEN PDF COLUMNS: ${passed} checks pass${failed ? ', ' + failed + ' FAIL' : ''}`); process.exitCode = failed ? 1 : 0;
})().catch(e => { console.error(e); windows.forEach(w => w.window.close()); process.exitCode = 1; });
