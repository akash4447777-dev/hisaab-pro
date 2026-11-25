const { withoutStock } = require('./stock-compat');
/* v3.27 — Employee wording throughout; legacy worker keys stay compatible.
   This suite exercises visible text, real CRUD/import/export actions and exact
   v3.26 data/calculation/report compatibility. No customer data or network. */
const { withoutLogoHeader } = require('./logo-compat');
const { withoutPartyReports } = require('./canteen-filters-compat');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync(process.env.HISAAB_HTML || path.join(__dirname, '..', 'hisaab_v3.html'), 'utf8');
const previous = fs.readFileSync(path.join(__dirname, '..', 'Hisaab-Pro-v3.26.html'), 'utf8');
const KEY = 'hisaabPro.v1', copy = value => JSON.parse(JSON.stringify(value));
const windows = [], errors = []; let passed = 0, failed = 0;
const fixture = { settings: { shopName: 'Employee QA shop', ownerName: 'Owner' }, workers: [
  { id: 'legacy-person-a', name: 'Aarav Sharma', role: 'Tailor', type: 'monthly', rate: 18000, active: true, note: 'Original profile' },
  { id: 'legacy-person-b', name: 'Neha Singh', role: 'Helper', type: 'hourly', rate: 125, active: true, note: 'Hourly profile' }
], records: [
  { id: 'legacy-month-a', workerId: 'legacy-person-a', year: 2026, month: 10, presentDays: 24, absentDays: 2, advances: [{ id: 'old-advance', n: 'Cash', amt: 1200 }], deductions: [{ id: 'old-deduction', n: 'Other', amt: 100 }], bonus: 300, status: 'pending' },
  { id: 'legacy-month-b', workerId: 'legacy-person-b', year: 2026, month: 10, presentDays: 20, totalHours: 156.5, advances: [], deductions: [], status: 'paid', paidOn: '2026-11-14' }
], canteen: { entries: [{ id: 'original-bill', date: '2026-11-14', kind: 'purchase', mode: 'total', amount: 500, paid: 250, party: 'Test supplier', createdAt: 1, updatedAt: 1 }], rates: [], log: [], demo: false } };
function boot(payload = fixture, source = html) {
  // Test-only access to pure renderers; the shipped app API is not changed.
  const hook = 'window.Hisaab = { Store,';
  assert.equal(source.split(hook).length, 2);
  source = source.replace(hook, 'window.Hisaab = { terminologyQA: { conflictRows, dataCountText, loginScreenHTML, drawStatement, drawSummaryPage, rowsForMonth }, Store,');
  const vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message));
  const files = [], blobs = new Map(), opened = [];
  const dom = new JSDOM(source, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.test/hisaab/', virtualConsole: vc,
    beforeParse(w) {
      w.scrollTo = () => {}; w.print = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
      w.URL.createObjectURL = blob => { const url = 'blob:qa-' + blobs.size; blobs.set(url, blob); return url; };
      w.URL.revokeObjectURL = () => {};
      w.HTMLAnchorElement.prototype.click = function () { files.push({ name: this.download, blob: blobs.get(this.href) }); };
      w.open = (...args) => { opened.push(args); return null; };
      w.localStorage.setItem(KEY, JSON.stringify(payload));
    } });
  windows.push(dom); const w = dom.window, H = w.Hisaab; assert.ok(H);
  H.UI.year = 2026; H.UI.month = 10; H.attendance.setDate('2026-11-14'); H.go('dashboard');
  return { w, H, S: H.Store, files, opened, $: selector => w.document.querySelector(selector) };
}
const d = boot(), old = boot(fixture, previous);
function action(act, attrs = {}, device = d) {
  const b = device.w.document.createElement('button'); b.dataset.act = act; Object.assign(b.dataset, attrs);
  device.w.document.body.appendChild(b); b.click(); b.remove();
}
function close(device = d) { action('closeModal', {}, device); }
function text(device = d) {
  const doc = device.w.document, walker = doc.createTreeWalker(doc.body, device.w.NodeFilter.SHOW_TEXT); let node, out = '';
  while ((node = walker.nextNode())) if (!node.parentElement.closest('script,style')) out += ' ' + node.textContent;
  for (const el of doc.querySelectorAll('[title],[placeholder],[aria-label]')) out += ' ' + ['title', 'placeholder', 'aria-label'].map(a => el.getAttribute(a) || '').join(' ');
  return out;
}
function noOldLabels(device = d) { assert.doesNotMatch(text(device), /\bworkers?\b/i); }
const snapshot = device => JSON.stringify({ data: device.S.data, disk: Object.fromEntries(Object.keys(device.w.localStorage).sort().map(k => [k, device.w.localStorage.getItem(k)])), dirty: device.H.Cloud.dirty });
const readBlob = (blob, device = d) => new Promise((resolve, reject) => { const reader = new device.w.FileReader(); reader.onload = () => resolve(Buffer.from(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsArrayBuffer(blob); });
async function test(label, fn) { try { await fn(); passed++; console.log('  ✅ ' + label); } catch (e) { failed++; console.error('  ❌ ' + label + '\n' + e.stack); } }
(async () => {
  console.log('\n▸ Employee terminology — whole-panel UI and legacy-data compatibility');
  await test('legacy raw JSON and normalized salary/canteen/attendance data load without migration', () => {
    assert.equal(d.w.localStorage.getItem(KEY), JSON.stringify(fixture)); assert.deepEqual(copy(d.S.data), copy(old.S.data));
    assert.equal(d.S.data.workers.length, 2); assert.equal('employees' in d.S.data, false); assert.equal(d.S.data.records[0].workerId, 'legacy-person-a');
  });
  await test('monthly/hourly salary arithmetic and saved advances/deductions remain exactly the same', () => {
    for (const person of d.S.data.workers) { const r = d.S.record(person.id, 2026, 10); assert.deepEqual(copy(d.H.calc(person, r, d.S.data.settings)), copy(old.H.calc(old.S.worker(person.id), old.S.record(person.id, 2026, 10), old.S.data.settings))); }
    assert.deepEqual(copy(d.S.data.records), copy(old.S.data.records));
  });
  await test('sidebar, top add button, headings and active count use Employee/Employees', () => {
    assert.equal(d.$('#nav [data-view="workers"]').textContent.trim(), '☰Employees'); assert.match(text(), /Add Employee/); assert.match(text(), /2 active employees/); noOldLabels();
  });
  const beforeViews = snapshot(d);
  for (const view of ['dashboard', 'hisaab', 'workers', 'ledger', 'records', 'settings', 'canteen', 'attendance']) await test(view + ' has no old system labels/placeholders/tooltips', () => { d.H.UI.search = ''; d.H.go(view); noOldLabels(); });
  await test('viewing all pages never rewrites original data/storage or marks cloud dirty', () => assert.equal(snapshot(d), beforeViews));
  await test('keyboard g+w keeps the stable route while showing Employees', () => {
    for (const key of ['g', 'w']) d.w.document.dispatchEvent(new d.w.KeyboardEvent('keydown', { key, bubbles: true }));
    assert.equal(d.H.UI.view, 'workers'); assert.match(d.$('#viewRoot').textContent, /Employees/); noOldLabels();
  });
  await test('command palette labels and search help use employee; navigation actions stay compatible', () => {
    action('openCmdk'); assert.ok(d.$('#cmdkInp')); assert.match(d.$('#cmdkInp').placeholder, /employee/); assert.match(d.$('#cmdkList').textContent, /Employees/); noOldLabels();
    d.w.document.dispatchEvent(new d.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });
  await test('add form, active label, hourly hint and validation message use employee', () => {
    action('addWorker'); assert.equal(d.$('#modalRoot h3').textContent, 'Add new employee'); assert.match(d.$('#modalRoot').textContent, /Employee name/); assert.match(d.$('#modalRoot').textContent, /Active employee/);
    d.$('#typeSeg [data-type="hourly"]').click(); assert.match(d.$('#rateHint').textContent, /Hourly employee/); d.$('#wSave').click(); assert.equal(d.$('#toast').textContent, "Please enter the employee's name"); noOldLabels(); close();
  });
  await test('real add action stores employees under the original workers collection and reports success', () => {
    action('addWorker'); d.$('#wName').value = 'Kiran Patel'; d.$('#wRate').value = '16000'; d.$('#wSave').click();
    assert.equal(d.S.data.workers.length, 3); assert.equal('employees' in JSON.parse(d.w.localStorage.getItem(KEY)), false); assert.equal(d.$('#toast').textContent, 'Employee added — hisaab ready');
  });
  await test('real edit action keeps stable ID, salary links and original form actions', () => {
    const id = d.S.data.workers[0].id, rec = JSON.stringify(d.S.data.records); action('editWorker', { wid: id }); assert.equal(d.$('#modalRoot h3').textContent, 'Edit employee'); d.$('#wName').value = 'Aarav S.'; d.$('#wSave').click();
    assert.equal(d.S.worker(id).name, 'Aarav S.'); assert.equal(JSON.stringify(d.S.data.records), rec); assert.equal(d.$('#toast').textContent, 'Employee updated');
  });
  for (const [act, pattern, attrs] of [
    ['delWorker', /Delete employee/, { wid: 'legacy-person-a' }], ['autoFillAll', /active employee/, {}], ['markAllPaid', /every employee/, {}],
    ['ctWipe', /Employees aur salary records/, {}], ['loadSample', /employees/, {}], ['wipeData', /employees/, {}]
  ]) await test(act + ' confirmation uses employee without executing a destructive action', () => {
    const before = snapshot(d); action(act, attrs); assert.ok(d.$('#modalRoot .modal')); assert.match(d.$('#modalRoot').textContent, pattern); noOldLabels(); close(); assert.equal(snapshot(d), before);
  });
  await test('browser-print salary statements use Employee and Employee signature', () => {
    const before = snapshot(d); action('printRec', { wid: 'legacy-person-a' }); assert.match(d.$('#print-root').textContent, /Employee signature/); assert.doesNotMatch(d.$('#print-root').textContent, /\bworkers?\b/i); assert.equal(snapshot(d), before);
  });
  await test('salary PDF summary and signature change labels only, retaining drawing operations/amounts', () => {
    const draw = device => { const p = new device.H.PdfDoc(), Q = device.H.terminologyQA, rows = Q.rowsForMonth(2026, 10); Q.drawSummaryPage(p, rows, 2026, 10); p.newPage(); Q.drawStatement(p, rows[0].w, rows[0].rec, rows[0].c); return p.build(); };
    // Use identical original fixtures, not the intentionally edited CRUD data.
    const current = boot(); const pdf = draw(current), prior = draw(old); assert.ok(pdf.includes('(Employee signature)')); assert.ok(pdf.includes('(All employees - ')); assert.doesNotMatch(pdf, /\bworkers?\b/i);
    const operations = value => [...value.matchAll(/stream\n([\s\S]*?)\nendstream/g)].map(m => m[1]).filter(x => x.includes('BT /F'));
    assert.deepEqual(operations(pdf), operations(prior).map(s => s.replace(/\bWorker\b/g, 'Employee').replace(/\bworkers\b/g, 'employees').replace(/\bWORKER\b/g, 'EMPLOYEE')));
  });
  await test('downloaded salary CSV uses Employee header, with unchanged numeric/data columns', async () => {
    const current = boot(), before = snapshot(current); action('exportCsv', {}, current); const out = current.files.at(-1); assert.ok(out?.name.endsWith('.csv')); const csv = (await readBlob(out.blob, current)).toString('utf8');
    action('exportCsv', {}, old); const previousCsv = (await readBlob(old.files.at(-1).blob, old)).toString('utf8'); assert.equal(csv, previousCsv.replace('Worker,', 'Employee,')); assert.equal(snapshot(current), before);
  });
  await test('salary sharing text uses Employee without claiming an automatic send', () => {
    const before = snapshot(d); action('shareWa', { wid: 'legacy-person-a' }); const url = new URL(d.opened.at(-1)[0]), body = url.searchParams.get('text'); assert.match(body, /Employee: Aarav S\./); assert.doesNotMatch(body, /\bworkers?\b/i); assert.match(d.$('#toast').textContent, /khol rahe/); assert.equal(snapshot(d), before);
  });
  await test('cloud/recovery counts and conflict display alias employees but retain machine paths', () => {
    assert.match(d.H.terminologyQA.dataCountText(d.S.data), /^3 employees/);
    const pending = { details: [{ path: 'workers[legacy-person-a].rate', local: '18000', remote: '19000' }], remote: { payload: copy(fixture) } }, before = JSON.stringify(pending);
    const rendered = d.H.terminologyQA.conflictRows(pending); assert.match(rendered, /employees\[legacy-person-a\]\.rate/); assert.doesNotMatch(rendered, /\bworkers?\b/i); assert.equal(JSON.stringify(pending), before);
    const merged = d.H.sync.merge(copy(fixture), copy(fixture), copy(fixture)); assert.equal('employees' in merged.data, false); assert.deepEqual(copy(merged.data.workers), fixture.workers); assert.deepEqual(copy(merged.data.records), fixture.records); assert.equal(merged.conflicts.length, 0);
  });
  await test('login fallback and attendance profile explanation use employee wording', () => {
    const current = boot(); current.S.data.settings.shopName = ''; assert.match(current.H.terminologyQA.loginScreenHTML(), /Employee Salary Panel/);
    current.H.attendance.openManager(); assert.match(current.$('#modalRoot').textContent, /independent of salary employees/); noOldLabels(current);
  });
  await test('legacy JSON restore still reads workers/workerId instead of requiring a new schema', async () => {
    const current = boot(); let input; const proto = current.w.HTMLInputElement.prototype, click = proto.click;
    proto.click = function () { if (this.type === 'file') input = this; else click.call(this); };
    try { action('importData', {}, current); } finally { proto.click = click; }
    assert.ok(input); Object.defineProperty(input, 'files', { value: [new current.w.File([JSON.stringify(fixture)], 'old-backup.json', { type: 'application/json' })] });
    const read = current.w.FileReader.prototype.readAsText; let timer;
    try { await new Promise((resolve, reject) => { timer = setTimeout(() => reject(Error('import did not complete')), 3000); current.w.FileReader.prototype.readAsText = function (...args) { this.addEventListener('loadend', resolve, { once: true }); return read.apply(this, args); }; input.dispatchEvent(new current.w.Event('change')); }); }
    finally { clearTimeout(timer); current.w.FileReader.prototype.readAsText = read; }
    assert.equal(current.S.data.workers.length, 2); assert.equal(current.S.data.records[0].workerId, 'legacy-person-a'); assert.deepEqual(copy(current.S.data), copy(old.S.data));
  });
  await test('customer-entered Worker names/roles/notes/shop names are not silently renamed', () => {
    const custom = copy(fixture); Object.assign(custom.workers[0], { name: 'Worker Welfare', role: 'Worker representative', note: 'Two workers requested this' }); custom.settings.shopName = 'Workers Cooperative';
    const current = boot(custom); assert.equal(current.w.localStorage.getItem(KEY), JSON.stringify(custom)); current.H.go('workers'); assert.match(current.$('#viewRoot').textContent, /Worker Welfare/); assert.equal(current.S.data.settings.shopName, 'Workers Cooperative'); assert.equal(current.S.data.workers[0].note, custom.workers[0].note);
  });
  await test('legacy storage/merge/finance/attendance/CSS/fonts stay exact after enumerated Stock and logo hooks', () => {
    for (const name of ['normalizeData', 'blankData', 'syncView', 'mergeSyncData', 'dataCounts', 'calc', 'ctTotals', 'attCalculate', 'attSummary', 'attReport', 'attBonus', 'attBonusMonths', 'attLateOut', 'attTransaction', 'attClockIn', 'attClockOut', 'attRegisterSheet', 'attXlsxBytes', 'attPdfString', 'attPdfLayout']) {
      const re = new RegExp('^function ' + name + '\\([\\s\\S]*?^\\}', 'm'), a = withoutPartyReports(html).match(re), b = previous.match(re); assert.ok(a && b, name); assert.equal(name === 'attPdfLayout' ? withoutLogoHeader(a[0]) : a[0], b[0], name);
    }
    assert.deepEqual(withoutStock(html).match(/<style[\s\S]*?<\/style>/g), previous.match(/<style[\s\S]*?<\/style>/g));
    for (const tag of ['hisaab-pdf-fonts', 'hisaab-attendance-font', 'hisaab-attendance-font-license']) { const re = new RegExp('<script[^>]*id="' + tag + '"[^>]*>([\\s\\S]*?)<\\/script>'); assert.equal(html.match(re)[1], previous.match(re)[1]); }
  });
  await test('all label/CRUD/import/export tests finish without uncaught JavaScript errors', () => assert.deepEqual(errors, []));
  for (const dom of windows) dom.window.close();
  console.log(`\n${failed ? '❌' : '✅'} EMPLOYEES: ${passed} checks pass${failed ? ', ' + failed + ' FAIL' : ''}`); process.exitCode = failed ? 1 : 0;
})().catch(e => { console.error(e); for (const dom of windows) dom.window.close(); process.exitCode = 1; });
