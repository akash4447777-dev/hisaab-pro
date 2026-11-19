/* v3.28 — each original canteen item line must survive UI / PDF / print.
   No live backend/customer data. Includes the reported two × 500g regression. */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync(process.env.HISAAB_HTML || path.join(__dirname, '..', 'hisaab_v3.html'), 'utf8');
const previous = fs.readFileSync(path.join(__dirname, '..', 'Hisaab-Pro-v3.27.html'), 'utf8');
const artifactsArg = process.argv.indexOf('--artifacts');
const outDir = artifactsArg >= 0 ? path.resolve(process.argv[artifactsArg + 1]) : null;
if (outDir) fs.mkdirSync(outDir, { recursive: true });
function artifact(name, pdf) { if (outDir) fs.writeFileSync(path.join(outDir, name), pdf.str, 'latin1'); }
const DATE = '2026-11-14', KEY = 'hisaabPro.v1', errors = [], windows = [], copy = x => JSON.parse(JSON.stringify(x));
// Compare JSON payload values across isolated browser realms, not Array prototypes.
const same = (a, b, why) => assert.deepEqual(copy(a), copy(b), why);
const item = (extra = {}) => ({ name: 'Hara dhaniya', qty: 500, unit: 'gram', priceMode: 'line', lineTotal: 37.5, rate: .075, ...extra });
const entry = (id, extra = {}) => ({ id, date: DATE, kind: 'purchase', mode: 'itemized', party: 'Vegetable supplier', billNo: 'B-' + id, items: [item()], amount: 37.5, paid: 0, createdAt: Number(id.replace(/\D/g, '')) || 1, updatedAt: 1, ...extra });
const payload = entries => ({ settings: { shopName: 'Canteen QA', ownerName: 'Owner', statementNote: 'Check original entries before payment.' },
  workers: [{ id: 'original-salary-person', name: 'Original Employee', type: 'monthly', rate: 18000, active: true }],
  records: [{ id: 'original-salary', workerId: 'original-salary-person', year: 2026, month: 10, presentDays: 24, absentDays: 2, advances: [], deductions: [], bonus: 200, status: 'pending' }],
  canteen: { entries, rates: [{ id: 'catalog-rate', name: 'Hara dhaniya', unit: 'gram', rate: .075 }], log: [], demo: false } });
function boot(entries = [entry('e1'), entry('e2')], source = html) {
  const raw = JSON.stringify(payload(entries)), vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message));
  const files = [], opened = [], blobs = new Map();
  const dom = new JSDOM(source, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.test/hisaab/', virtualConsole: vc,
    beforeParse(w) { w.localStorage.setItem(KEY, raw); w.scrollTo = () => {}; w.print = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.URL.createObjectURL = blob => { const url = 'blob:line-' + blobs.size; blobs.set(url, blob); return url; }; w.URL.revokeObjectURL = () => {};
      w.HTMLAnchorElement.prototype.click = function () { files.push({ name: this.download, blob: blobs.get(this.href) }); };
      w.open = (...args) => { opened.push(args); return null; };
    } });
  windows.push(dom); const w = dom.window, H = w.Hisaab; assert.ok(H); H.UI.year = 2026; H.UI.month = 10; H.UI.ct.date = DATE; H.go('canteen');
  return { dom, w, H, C: H.canteen, S: H.Store, files, opened, raw, $: s => w.document.querySelector(s) };
}
const d = boot(), old = boot(undefined, previous);
const snapshot = x => JSON.stringify({ data: x.S.data, disk: Object.fromEntries(Object.keys(x.w.localStorage).sort().map(k => [k, x.w.localStorage.getItem(k)])), dirty: x.H.Cloud.dirty });
function draw(x, which = 'day') {
  const texts = [], proto = x.H.PdfDoc.prototype, original = proto.text;
  proto.text = function (x, y, size, value, options) { texts.push({ x, y, size, text: String(value), options }); return original.apply(this, arguments); };
  try { const out = which === 'day' ? x.C.pdfDayStr(DATE) : x.C.pdfMonthStr(2026, 10); return { ...out, texts }; } finally { proto.text = original; }
}
function bodyBounds(x, pdf) {
  // PdfDoc coordinates start at the bottom. Body is y=64..820; the existing
  // continuation-only page marker intentionally sits below it, at y=22.
  for (const t of pdf.texts) {
    const o = t.options || {}, P = x.H.PdfDoc, encoded = P.encode(t.text);
    const weight = o.black ? 'black' : !!o.bold, spacing = o.charSpace || 0;
    let size = t.size, width = P.measure(encoded, size, weight) + Math.max(0, encoded.length - 1) * spacing;
    if (o.maxWidth && width > o.maxWidth) {
      size *= Math.max(.01, o.maxWidth - Math.max(0, encoded.length - 1) * spacing) / Math.max(.01, P.measure(encoded, size, weight));
      width = P.measure(encoded, size, weight) + Math.max(0, encoded.length - 1) * spacing;
    }
    const left = t.x - (o.align === 'right' ? width : o.align === 'center' ? width / 2 : 0);
    assert.ok(left >= 39.97 && left + width <= 555.32, `out of content width: ${left} + ${width}: ${t.text}`);
    if (/^Hisaab v[\d.]+ · Page \d+ of \d+$/.test(t.text)) assert.equal(t.y, 22);
    else assert.ok(t.y >= 64 && t.y <= 820, `out of safe body: y=${t.y}: ${t.text}`);
  }
}
function uiItemRows(x = d) { const cards = [...x.w.document.querySelectorAll('#viewRoot .card')], card = cards.find(c => /^(Saman item-wise|Item-wise summary)/.test(c.querySelector('h3')?.textContent || '')); assert.ok(card); return [...card.querySelectorAll('tbody tr')]; }
function printedItemRows(x) { const root = x.$('#print-root'), heading = [...root.querySelectorAll('h4.sec')].find(h => /item-wise/i.test(h.textContent)); assert.ok(heading); return [...heading.nextElementSibling.querySelectorAll('tbody tr')].filter(r => !r.textContent.includes('Item-wise total')); }
const blobBytes = (blob, x) => new Promise((resolve, reject) => {
  const r = new x.w.FileReader(), timer = setTimeout(() => reject(Error('PDF/CSV FileReader did not finish')), 3000);
  r.onloadend = () => { clearTimeout(timer); r.error ? reject(r.error) : resolve(Buffer.from(r.result)); };
  r.readAsArrayBuffer(blob);
});
let passed = 0, failed = 0;
async function test(label, fn) { try { await fn(); passed++; console.log('  ✅ ' + label); } catch (e) { failed++; console.error('  ❌ ' + label + '\n' + e.stack); } }
(async () => {
  console.log('\n▸ Canteen original item lines — no merging repeated 500g entries');
  await test('reproduces v3.27 combined 1000g row and proves v3.28 has two original 500g rows', () => {
    const before = draw(old), after = draw(d); assert.equal(before.texts.filter(t => t.text === '1000').length, 1); assert.equal(before.texts.filter(t => t.text === '500').length, 0);
    assert.equal(after.texts.filter(t => t.text === '500').length, 2); assert.equal(after.texts.filter(t => t.text === '1000').length, 0);
  });
  await test('old raw JSON and normalized financial data load byte-for-byte without migration', () => { assert.equal(d.w.localStorage.getItem(KEY), d.raw); same(copy(d.S.data), copy(old.S.data)); assert.equal(d.C.entries().length, 2); });
  await test('two saved entries retain independent quantities, amounts, own rates and source IDs', () => {
    const rows = d.C.itemLines(d.C.onDate(DATE)); same(copy(rows.map(i => [i.entryId, i.itemIndex, i.qty, i.unit, i.rate, i.amt])), [['e1', 0, 500, 'gram', .075, 37.5], ['e2', 0, 500, 'gram', .075, 37.5]]);
  });
  await test('duplicate lines within a single entry are separate too', () => { const rows = d.C.itemLines([entry('bill', { items: [item(), item()], amount: 75 })]); assert.equal(rows.length, 2); same(rows.map(i => i.itemIndex), [0, 1]); same(rows.map(i => i.qty), [500, 500]); same(rows.map(i => i.amt), [37.5, 37.5]); });
  await test('same-name same-amount items on different dates stay separate', () => { const rows = d.C.itemLines([entry('e2', { date: '2026-11-15' }), entry('e1')]); same(rows.map(i => i.date), [DATE, '2026-11-15']); assert.equal(rows.length, 2); });
  await test('different suppliers and bill numbers are retained, never folded into a name key', () => { const rows = d.C.itemLines([entry('e1', { party: 'Supplier A', billNo: 'A' }), entry('e2', { party: 'Supplier B', billNo: 'B' })]); same(copy(rows.map(i => [i.party, i.billNo])), [['Supplier A', 'A'], ['Supplier B', 'B']]); });
  await test('case/whitespace variants do not merge and original name casing stays intact', () => { const rows = d.C.itemLines([entry('e1'), entry('e2', { items: [item({ name: ' HARA DHANIYA ' })] })]); same(rows.map(i => i.name), ['Hara dhaniya', 'HARA DHANIYA']); assert.equal(rows.length, 2); });
  await test('gram/kg and other units stay as saved without automatic conversion', () => { const rows = d.C.itemLines([entry('e1', { items: [item(), item({ qty: .5, unit: 'kg' }), item({ qty: 1, unit: 'bundle' })] })]); same(copy(rows.map(i => [i.qty, i.unit])), [[500, 'gram'], [.5, 'kg'], [1, 'bundle']]); });
  await test('fractional quantities are not rounded to two decimal places', () => { const rows = d.C.itemLines([entry('e1', { items: [item({ qty: .005, unit: 'kg', lineTotal: .5 })] })]); assert.equal(rows[0].qty, .005); assert.equal(rows[0].amt, .5); assert.equal(rows[0].rate, 100); });
  await test('different per-line totals retain different own rates instead of an average', () => { const rows = d.C.itemLines([entry('e1'), entry('e2', { items: [item({ lineTotal: 50 })] })]); same(copy(rows.map(i => [i.rate, i.amt])), [[.075, 37.5], [.1, 50]]); });
  await test('unit-price and whole-line price modes keep their original amount arithmetic', () => { const rows = d.C.itemLines([entry('e1', { items: [item({ priceMode: 'unit', qty: 2, unit: 'kg', rate: 90 }), item({ qty: 4, unit: 'kg', lineTotal: 360 })] })]); same(copy(rows.map(i => [i.qty, i.rate, i.amt])), [[2, 90, 180], [4, 90, 360]]); });
  await test('purchase, sale and expense item lines remain separate and explicitly typed', () => { const rows = d.C.itemLines(['purchase', 'sale', 'expense'].map((kind, i) => entry('e' + i, { kind }))); same(rows.map(i => i.kind), ['purchase', 'sale', 'expense']); same(rows.map(i => i.qty), [500, 500, 500]); });
  await test('lump-sum entries do not invent item quantities even with stale hidden items', () => { const list = [entry('e1', { mode: 'total', amount: 100 }), entry('e2')]; assert.equal(d.C.itemLines(list).length, 1); const totals = d.C.totals(list); assert.equal(totals.purchase, 137.5); assert.equal(totals.totalModeAmt, 100); });
  await test('unnamed item slots are ignored but named free/zero-rate lines are retained', () => { const rows = d.C.itemLines([entry('e1', { items: [item({ name: '' }), item({ name: 'Free coriander', lineTotal: 0 }), item({ qty: 0, lineTotal: 5 })] })]); assert.equal(rows.length, 2); assert.equal(rows[0].amt, 0); assert.equal(rows[1].qty, 0); assert.equal(rows[1].amt, 5); });
  await test('date/save-time order is deterministic, with original within-entry line order', () => { const list = [entry('e3', { date: '2026-11-15' }), entry('e2', { items: [item({ name: 'Second' }), item({ name: 'Third' })] }), entry('e1', { items: [item({ name: 'First' })] })]; same(d.C.itemLines(list).map(i => i.name), ['First', 'Second', 'Third', 'Hara dhaniya']); });
  await test('read-only flattening never sorts/mutates the caller input or aliases original items', () => {
    const input = [entry('e2'), entry('e1')], before = JSON.stringify(input); for (const e of input) { Object.freeze(e.items[0]); Object.freeze(e.items); Object.freeze(e); } Object.freeze(input);
    const rows = d.C.itemLines(input); rows[0].qty = 9; rows[0].name = 'Report edit'; assert.equal(JSON.stringify(input), before); assert.equal(input[1].items[0].qty, 500);
  });
  await test('all grand totals, paid/baki, sale/expense signs and salary data remain unchanged', () => { same(copy(d.C.totals(d.C.entries())), copy(old.C.totals(old.C.entries()))); const t = d.C.totals(d.C.entries()); assert.equal(t.purchase, 75); assert.equal(t.net, -75); assert.equal(t.balance, 75); same(copy(d.S.data.records), copy(old.S.data.records)); });
  await test('day item table displays two 500g lines, separate amounts and source references', () => { d.H.UI.ct.tab = 'day'; d.H.render(); const rows = uiItemRows(); assert.equal(rows.length, 2); same(rows.map(r => r.cells[1].textContent), ['500', '500']); assert.ok(rows[0].textContent.includes('B-e1')); assert.ok(rows[1].textContent.includes('B-e2')); same(rows.map(r => r.cells[5].textContent), ['1.1', '2.1']); });
  await test('monthly item preview keeps repeated rows separate instead of showing 1000g', () => { d.H.UI.ct.tab = 'month'; d.H.render(); const rows = uiItemRows(); assert.equal(rows.length, 2); same(rows.map(r => r.cells[1].textContent), ['500', '500']); assert.ok(rows.every(r => r.cells[0].textContent.includes('14 Nov'))); });
  for (const which of ['day', 'month']) await test(which + ' print statement retains each 500g row and each line amount', () => { which === 'day' ? d.C.printDay() : d.C.printMonth(); const rows = printedItemRows(d); assert.equal(rows.length, 2); same(rows.map(r => r.cells[1].textContent), ['500', '500']); assert.ok(rows.every(r => r.textContent.includes('37.50'))); assert.ok(rows.every(r => r.textContent.includes('0.075'))); });
  // Template selection is an intentional Settings save in BOTH versions. Keep
  // it in its own fixture so read-only/raw-storage checks below remain strict.
  const templates = boot();
  for (const tpl of templates.C.tpls) for (const which of ['day', 'month']) await test(tpl.id + ' ' + which + ' PDF keeps both quantities/own rates without a combined row', () => {
    templates.C.setTpl(tpl.id); const pdf = draw(templates, which); assert.ok(pdf.str.startsWith('%PDF-1.4')); assert.equal(pdf.texts.filter(t => t.text === '500').length, 2); assert.equal(pdf.texts.filter(t => t.text === '1000').length, 0);
    assert.equal(pdf.texts.filter(t => t.text === 'gram').length, 2); assert.ok(pdf.texts.some(t => t.text.includes('B-e1'))); assert.ok(pdf.texts.some(t => t.text.includes('B-e2'))); assert.ok(pdf.texts.some(t => t.text === '−₹75.00')); bodyBounds(templates, pdf);
    artifact(`repeated-${tpl.id}-${which}.pdf`, pdf);
  });
  await test('different-amount PDF rows use their own prices, not the old weighted average', () => {
    const x = boot([entry('e1'), entry('e2', { items: [item({ lineTotal: 50 })], amount: 50 })]);
    for (const which of ['day', 'month']) {
      const pdf = draw(x, which); assert.equal(pdf.texts.filter(t => t.text === '500').length, 2);
      assert.ok(pdf.texts.some(t => t.text === '₹0.075')); assert.ok(pdf.texts.some(t => t.text === '₹0.1'));
      assert.equal(pdf.texts.some(t => t.text.includes('0.0875')), false); bodyBounds(x, pdf); artifact(`own-rates-${which}.pdf`, pdf);
    }
  });
  await test('100 repeated rows are all paginated, never truncated or collapsed', () => {
    const x = boot([entry('big', { items: Array.from({ length: 100 }, () => item()), amount: 3750 })]);
    for (const which of ['day', 'month']) { const pdf = draw(x, which); assert.equal(pdf.texts.filter(t => t.text === '500').length, 100); assert.equal(pdf.texts.some(t => t.text === '50000'), false); assert.ok((pdf.str.match(/\/Type \/Page\b/g) || []).length > 2); assert.ok(pdf.texts.some(t => t.text.includes('#1.100'))); bodyBounds(x, pdf); artifact(`100-repeated-${which}.pdf`, pdf); }
  });
  await test('two identical lines inside one saved bill survive both actual PDF tables', () => {
    const x = boot([entry('bill', { items: [item(), item()], amount: 75 })]);
    for (const which of ['day', 'month']) {
      const pdf = draw(x, which); assert.equal(pdf.texts.filter(t => t.text === '500').length, 2);
      assert.ok(pdf.texts.some(t => t.text.includes('#1.1'))); assert.ok(pdf.texts.some(t => t.text.includes('#1.2')));
      assert.ok(pdf.texts.some(t => t.text === '−₹75.00')); bodyBounds(x, pdf);
    }
  });
  await test('unit-priced saved 500g rows retain each original rate/amount in actual PDFs', () => {
    const x = boot([entry('e1', { amount: 40, items: [item({ priceMode: 'unit', rate: .08 })] }), entry('e2', { amount: 50, items: [item({ priceMode: 'unit', rate: .1 })] })]);
    for (const which of ['day', 'month']) {
      const pdf = draw(x, which); assert.equal(pdf.texts.filter(t => t.text === '500').length, 2);
      for (const text of ['₹0.08', '₹0.1', '₹40.00', '₹50.00', '−₹90.00']) assert.ok(pdf.texts.some(t => t.text === text), text);
    }
  });
  await test('monthly PDF retains each same-name date while day export includes only its own date', () => {
    const x = boot([entry('e2', { date: '2026-11-15' }), entry('e1')]), month = draw(x, 'month'), day = draw(x);
    assert.equal(month.texts.filter(t => t.text === '500').length, 2); assert.equal(day.texts.filter(t => t.text === '500').length, 1);
    assert.ok(month.texts.some(t => t.text.includes('15 Nov'))); assert.equal(day.texts.some(t => t.text.includes('15 Nov')), false);
  });
  await test('mixed-kind PDFs exclude lump-sum hidden items and keep all old net/paid/baki totals', () => {
    const list = [entry('p1', { paid: 20 }), entry('p2', { date: '2026-11-15', amount: 50, items: [item({ lineTotal: 50 })], paid: 25 }),
      entry('s3', { kind: 'sale', amount: 60, items: [item({ lineTotal: 60 })], paid: 60 }), entry('x4', { kind: 'expense', amount: 10, items: [item({ lineTotal: 10 })] }),
      entry('l5', { mode: 'total', amount: 100, items: [item({ qty: 999 })], paid: 40 })];
    const x = boot(list), prior = boot(list, previous), before = snapshot(x);
    same(x.C.totals(x.C.entries()), prior.C.totals(prior.C.entries()));
    const t = x.C.totals(x.C.entries()); same([t.purchase, t.sale, t.expense, t.net, t.paid, t.balance], [187.5, 60, 10, -137.5, 145, 112.5]);
    for (const which of ['day', 'month']) {
      const pdf = draw(x, which); assert.equal(pdf.texts.filter(t => t.text === '500').length, which === 'day' ? 3 : 4);
      assert.equal(pdf.texts.some(t => t.text === '999'), false); assert.ok(pdf.texts.some(t => t.text === (which === 'day' ? '−₹87.50' : '−₹137.50')));
      for (const kind of ['Purchase', 'Sale', 'Expense']) assert.ok(pdf.texts.some(t => t.text.includes(kind)), kind);
      bodyBounds(x, pdf); artifact(`mixed-kinds-${which}.pdf`, pdf);
    }
    assert.equal(snapshot(x), before);
  });
  await test('long item/supplier/bill references wrap without clipping or losing either occurrence', () => {
    const x = boot([entry('e1', { party: 'S'.repeat(90), billNo: 'B'.repeat(36), items: [item({ name: 'Long coriander ' + 'X'.repeat(65) }), item({ name: 'Long coriander ' + 'X'.repeat(65) })] })]);
    for (const which of ['day', 'month']) {
      const pdf = draw(x, which); assert.equal(pdf.texts.filter(t => t.text === '500').length, 2);
      assert.ok(pdf.texts.some(t => t.text.includes('#1.1'))); assert.ok(pdf.texts.some(t => t.text.includes('#1.2')));
      bodyBounds(x, pdf); artifact(`long-references-${which}.pdf`, pdf);
    }
  });
  await test('monthly UI preview discloses extra rows while PDF retains all 20 repeated items', () => { const x = boot([entry('many', { items: Array.from({ length: 20 }, () => item()), amount: 750 })]); x.H.UI.ct.tab = 'month'; x.H.render(); assert.equal(uiItemRows(x).length, 14); assert.ok(x.$('#viewRoot').textContent.includes('6 item lines')); assert.equal(draw(x, 'month').texts.filter(t => t.text === '500').length, 20); });
  await test('monthly amount bars scale to the largest original line, including prices below one rupee', () => {
    const x = boot([entry('e1', { amount: .2, items: [item({ lineTotal: .2 })] }), entry('e2', { amount: .5, items: [item({ lineTotal: .5 })] })]);
    x.H.UI.ct.tab = 'month'; x.H.render();
    const rows = uiItemRows(x); same(rows.map(r => r.querySelector('.ct-hbar i').style.width), ['40%', '100%']);
  });
  await test('item/source text is escaped in UI and print, never interpreted as HTML', () => { const x = boot([entry('unsafe', { party: '<img src=x onerror=alert(1)>', billNo: '<script>bad()</script>', items: [item({ name: '<b>Literal item</b>' })] })]); assert.ok(x.$('#viewRoot').textContent.includes('<b>Literal item</b>')); assert.equal(x.$('#viewRoot img[onerror],#viewRoot script'), null); x.C.printDay(); assert.ok(x.$('#print-root').textContent.includes('<script>bad()</script>')); assert.equal(x.$('#print-root script,#print-root img'), null); });
  await test('monthly text sharing keeps two 500g/own-amount lines, not a 1000g aggregate', () => { d.C.shareMonth(); const text = new URL(d.opened.at(-1)[0]).searchParams.get('text'); assert.equal((text.match(/500 gram/g) || []).length, 2); assert.equal(text.includes('1000 gram'), false); assert.ok(text.includes('B-e1') && text.includes('B-e2')); });
  await test('monthly text preview honestly points to PDF/print for more than six lines', () => { const x = boot([entry('many', { items: Array.from({ length: 9 }, () => item()), amount: 337.5 })]); x.C.shareMonth(); const text = new URL(x.opened.at(-1)[0]).searchParams.get('text'); assert.equal((text.match(/500 gram/g) || []).length, 6); assert.ok(text.includes('3 item lines. Poora detail PDF / Print me.')); });
  await test('actual WhatsApp PDF files contain two original quantity rows for day and month', async () => {
    for (const which of ['day', 'month']) { let shared; const names = ['canShare', 'share'], saved = names.map(k => Object.getOwnPropertyDescriptor(d.w.navigator, k));
      Object.defineProperty(d.w.navigator, 'canShare', { configurable: true, value: () => true }); Object.defineProperty(d.w.navigator, 'share', { configurable: true, value: x => { shared = x; return Promise.resolve(); } });
      try { d.C.sharePdf(which, DATE, 2026, 10); assert.equal(shared.files[0].type, 'application/pdf'); const text = (await blobBytes(shared.files[0], d)).toString('latin1'); assert.equal((text.match(/\(500\) Tj ET/g) || []).length, 2); assert.equal((text.match(/\(1000\) Tj ET/g) || []).length, 0); }
      finally { names.forEach((k, i) => saved[i] ? Object.defineProperty(d.w.navigator, k, saved[i]) : delete d.w.navigator[k]); }
    }
  });
  await test('existing rate-catalog/history aggregation still gives cumulative 1000g / 75', () => {
    d.H.UI.ct.tab = 'rates'; d.H.render(); const row = [...d.w.document.querySelectorAll('#viewRoot tr')].find(r => r.textContent.includes('Hara dhaniya')); assert.ok(row); assert.ok(row.textContent.includes('1000 gram')); assert.ok(row.textContent.includes('75')); assert.equal(d.C.itemLines(d.C.entries()).length, 2);
  });
  await test('CSV entries and old JSON shape remain unchanged by the report-only fix', async () => { d.C.csv(); old.C.csv(); const a = (await blobBytes(d.files.at(-1).blob, d)).toString('utf8'), b = (await blobBytes(old.files.at(-1).blob, old)).toString('utf8'); assert.equal(a, b); assert.equal(d.w.localStorage.getItem(KEY), d.raw); assert.equal(JSON.stringify(d.S.data.canteen).includes('entryNo'), false); });
  await test('UI/PDF/print/sharing never rewrites saved entries/history or cloud dirty state', () => { const before = snapshot(d); d.C.dayLedger(); d.C.monthLedger(); d.C.itemLines(d.C.entries()); d.C.pdfDayStr(DATE); d.C.pdfMonthStr(2026, 10); d.C.printDay(); d.C.printMonth(); d.C.shareMonth(); assert.equal(snapshot(d), before); });
  await test('normalization, financial math, catalog aggregation, save/sync and Attendance stay byte-identical', () => {
    for (const name of ['normCtItem', 'normCtEntry', 'normCanteen', 'ctItemAmt', 'ctItemUnitRate', 'ctTotals', 'ctItemAgg', 'ctPartyAgg', 'ctSave', 'ctRatesView', 'ctRateHist', 'ctSharePdf', 'normalizeData', 'syncView', 'mergeSyncData', 'calc', 'attCalculate', 'attSummary', 'attReport', 'attRegisterSheet', 'attXlsxBytes', 'attPdfString', 'attPdfLayout']) { const re = new RegExp('^function ' + name + '\\([\\s\\S]*?^\\}', 'm'); assert.ok(html.match(re) && previous.match(re), name); assert.equal(html.match(re)[0], previous.match(re)[0], name); }
    same(html.match(/<style[\s\S]*?<\/style>/g), previous.match(/<style[\s\S]*?<\/style>/g));
  });
  await test('all repeated-item regression tests finish without uncaught JavaScript errors', () => same(errors, []));
  for (const dom of windows) dom.window.close(); console.log(`\n${failed ? '❌' : '✅'} CANTEEN LINES: ${passed} checks pass${failed ? ', ' + failed + ' FAIL' : ''}`); process.exitCode = failed ? 1 : 0;
})().catch(e => { console.error(e); for (const dom of windows) dom.window.close(); process.exitCode = 1; });
