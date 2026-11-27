/* v3.31 — saved party catalog and one validated date × party snapshot.
   Isolated jsdom, synthetic records, genuine PDF/File bytes, no network/send. */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { JSDOM, VirtualConsole } = require('jsdom');
const { withoutPartyReports } = require('./canteen-filters-compat');
const { FROM, TO, DATE, A, B, FRESH, fixture, entry, item, idsA, totalsA } = require('./fixtures/canteen-filters');
const html = fs.readFileSync(process.env.HISAAB_HTML || path.join(__dirname, '..', 'hisaab_v3.html'), 'utf8');
const previous = fs.readFileSync(path.join(__dirname, '..', 'Hisaab-Pro-v3.30.html'), 'utf8');
const logo = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(__dirname, 'fixtures/company-logo.jpg')).toString('base64');
const at = process.argv.indexOf('--artifacts'), OUT = at < 0 ? null : path.resolve(process.argv[at + 1]);
if (OUT) fs.mkdirSync(OUT, { recursive: true });
const KEY = 'hisaabPro.v1', OWNER = 'hisaabPro.owner.v1', copy = x => JSON.parse(JSON.stringify(x)), same = (a, b, label) => assert.deepEqual(copy(a), copy(b), label);
const windows = [], errors = [], ids = report => Array.from(report.entries, e => e.id);
const A_TOKEN = 'name:gupta kirana', B_TOKEN = 'name:verma dairy';
function boot(payload = fixture, options = {}) {
  const raw = JSON.stringify(payload), files = [], blobs = new Map(), vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(e.message));
  const source = options.source || html.replace('window.Hisaab = { Store,', 'window.Hisaab = { filterQA: { ctReportFilename, ctReportDate, ctFilteredEntries, ctDataContext, ctCheckContext, validateRemote, syncCollections, removedRows, unconfirmedRemoteLoss, closeModal, openModal, ctReportRefresh, ctReportLegacy, ctPartyMatches, pdfWidth }, Store,');
  const dom = new JSDOM(source, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.test/hisaab/', virtualConsole: vc, beforeParse(w) {
    const RealDate = w.Date; w.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2026-11-14T12:00:00Z'])); } static now() { return 1794657600000; } };
    w.localStorage.setItem(KEY, raw); w.scrollTo = () => {}; w.print = () => { w.__prints = (w.__prints || 0) + 1; }; w.open = () => null;
    w.URL.createObjectURL = blob => { const id = 'blob:filter-' + blobs.size; blobs.set(id, blob); return id; }; w.URL.revokeObjectURL = () => {};
    w.HTMLAnchorElement.prototype.click = function () { if (this.download) files.push({ name: this.download, blob: blobs.get(this.href) }); };
    if (options.fonts) Object.defineProperty(w.document, 'fonts', { configurable: true, value: options.fonts });
  } });
  windows.push(dom); const w = dom.window, H = w.Hisaab; assert.ok(H, 'app booted');
  H.UI.year = 2026; H.UI.month = 10; H.UI.ct.date = DATE; H.go('canteen');
  return { dom, w, H, C: H.canteen, S: H.Store, Q: H.filterQA, raw, files, $: s => w.document.querySelector(s), $$: s => Array.from(w.document.querySelectorAll(s)) };
}
function action(d, name, attrs = {}) {
  const button = d.w.document.createElement('button'); button.dataset.act = name; for (const [k, v] of Object.entries(attrs)) button.dataset[k] = v;
  d.w.document.body.appendChild(button); button.click(); button.remove();
}
function set(d, selector, value, kind = 'change') { const el = d.$(selector); assert.ok(el, selector); el.value = value; el.dispatchEvent(new d.w.Event(kind, { bubbles: true })); }
function form(d, from = FROM, to = TO, party = A_TOKEN, preset = 'range') { d.C.reportOpen(preset); set(d, '#ctReportFrom', from); set(d, '#ctReportTo', to); set(d, '#ctReportParty', party); }
const snapshot = d => JSON.stringify({ data: d.S.data, disk: Object.fromEntries(Object.keys(d.w.localStorage).sort().map(k => [k, d.w.localStorage.getItem(k)])), dirty: d.H.Cloud.dirty });
const finance = d => JSON.stringify({ workers: d.S.data.workers, records: d.S.data.records, canteen: d.S.data.canteen, attendance: d.S.data.attendance });
const bytes = (d, blob) => new Promise((resolve, reject) => { const r = new d.w.FileReader(); r.onload = () => resolve(Buffer.from(r.result)); r.onerror = () => reject(r.error); r.readAsArrayBuffer(blob); });
const artifact = (name, str) => { if (OUT) fs.writeFileSync(path.join(OUT, name), str, 'latin1'); };
function trace(d, from = FROM, to = TO, party = A_TOKEN) {
  const texts = [], proto = d.H.PdfDoc.prototype, text = proto.text;
  proto.text = function (x, y, size, value, options) { texts.push({ page: this.pages.indexOf(this.cur), x, y, size, text: String(value), options: options || {} }); return text.apply(this, arguments); };
  try { return { ...d.C.pdfRangeStr(from, to, party), texts }; } finally { proto.text = text; }
}
function assertSelected(out) {
  assert.ok(out.str.startsWith('%PDF-1.4'));
  const all = out.texts.map(t => t.text).join('\n');
  for (const id of idsA) assert.ok(all.includes('BILL-' + id), id + ' included');
  for (const other of ['Verma', 'EXCLUDED', 'A-BEFORE', 'A-AFTER', 'UNASSIGNED', 'SPACES-ONLY', 'LITERAL-ALL', 'INVALID-DATE', 'HIDDEN-LUMP-ITEM', 'LEAP-DAY', 'YEAR-END', 'YEAR-START']) assert.ok(!all.includes(other), other + ' excluded');
  for (const value of ['₹150.25', '₹115.75', '₹135.75', '−₹90.00', '₹251.50']) assert.ok(out.texts.some(t => t.text === value), value + ' selected total');
  assert.equal(out.texts.filter(t => t.size === 9 && t.text === '500').length, 3, 'separate 500g lines');
  assert.ok(out.texts.some(t => t.text === '₹0.075') && out.texts.some(t => t.text === '₹0.1255') && out.texts.some(t => t.text === '₹0.1'), 'each own price');
  assert.ok(!/bikri|kharcha/i.test(all), 'no removed summary/category columns');
}
function bounds(d, out) {
  for (const t of out.texts) {
    const weight = t.options.black ? 'black' : !!t.options.bold, width = Math.min(t.options.maxWidth || Infinity, d.Q.pdfWidth(t.text, t.size, weight) + Math.max(0, t.text.length - 1) * (t.options.charSpace || 0));
    const left = t.options.align === 'right' ? t.x - width : t.options.align === 'center' ? t.x - width / 2 : t.x;
    assert.ok(left >= 39.9 && left + width <= 555.38 && t.y >= 20 && t.y <= 815, JSON.stringify(t));
    if (t.page && t.y > 780) assert.ok(t.text.startsWith('Hisaab v'), 'body below continuation logo');
  }
}
function printRoot(d, content) { const root = d.w.document.createElement('div'); root.innerHTML = content; return root; }
let passed = 0, failed = 0;
async function test(label, fn) { try { await fn(); passed++; console.log('  ✅ ' + label); } catch (e) { failed++; console.error('  ❌ ' + label + '\n' + e.stack); } }
(async () => {
  console.log('\n▸ Canteen v3.31 — independently saved parties and exact date × party reports');
  await test('all enumerated old-code hooks reverse EXACTLY to immutable v3.30, including all finance/cloud/Attendance/CSS/fonts', () => {
    assert.equal(withoutPartyReports(html), previous);
    assert.equal(crypto.createHash('sha256').update(previous).digest('hex'), '9e4e744ebd7cf6e92187d226caeb944eee0a04b9f635987350be781b9efb8501');
    assert.equal(html, fs.readFileSync(path.join(__dirname, '..', 'Hisaab-Pro-v3.43.html'), 'utf8'));
  });
  await test('old raw JSON boots without adding a party field, migrating data or changing any stored byte', () => {
    const payload = copy(fixture); delete payload.settings.canteenParties; const d = boot(payload);
    assert.equal(d.w.localStorage.getItem(KEY), JSON.stringify(payload)); assert.ok(!('canteenParties' in d.S.data.settings));
    same(d.S.data, boot(payload, { source: previous }).S.data, 'identical legacy normalization, no migration');
  });
  await test('Parties tab has a real labelled save form and both saved and legacy names, without touching records', () => {
    const d = boot(), before = snapshot(d); action(d, 'ctTab', { tab: 'parties' });
    assert.ok(d.$('#ctPartyForm label[for="ctPartyNew"]')); assert.equal(d.$('#ctPartyNew').maxLength, 90);
    for (const name of [A, B, FRESH, 'All parties']) assert.ok(d.$('#viewRoot').textContent.includes(name)); assert.equal(snapshot(d), before);
  });
  await test('saving a party without entries persists independently and creates no dummy finance/history rows', () => {
    const d = boot(), before = finance(d); action(d, 'ctTab', { tab: 'parties' }); set(d, '#ctPartyNew', '  New   Delhi Shop  ', 'input');
    d.$('#ctPartyForm').dispatchEvent(new d.w.Event('submit', { bubbles: true, cancelable: true }));
    assert.equal(d.S.data.settings.canteenParties['p:new delhi shop'], 'New Delhi Shop'); assert.equal(JSON.parse(d.w.localStorage.getItem(KEY)).settings.canteenParties['p:new delhi shop'], 'New Delhi Shop');
    assert.equal(finance(d), before); assert.match(d.$('#toast').textContent, /Party saved/);
  });
  await test('saved catalog survives reload, zero entries and a subsequent entry deletion', () => {
    const empty = copy(fixture); empty.canteen.entries = []; const d = boot(empty); d.C.saveParty('Independent Name');
    const restored = boot(JSON.parse(d.w.localStorage.getItem(KEY))); same(restored.C.savedParties(), [A, B, FRESH, 'Independent Name']);
    restored.S.data.canteen.entries = [entry('temporary', DATE, 'Independent Name', 'purchase', 1, 0)]; assert.equal(restored.S.saveChange(), true);
    restored.S.data.canteen.entries = []; assert.equal(restored.S.saveChange(), true); assert.ok(restored.C.savedParties().includes('Independent Name'));
  });
  await test('case/whitespace duplicate save is a no-op, while prototype/All-party-looking names are safe literal names', () => {
    const d = boot(), before = snapshot(d); same(d.C.saveParty('   GUPTA   KIRANA   '), { name: A, created: false }); assert.equal(snapshot(d), before);
    for (const name of ['__proto__', 'constructor', 'All parties', '<img src=x onerror=bad()>']) d.C.saveParty(name);
    assert.equal(Object.getPrototypeOf(d.S.data.settings.canteenParties), d.w.Object.prototype); action(d, 'ctTab', { tab: 'parties' }); assert.equal(d.$('#viewRoot img'), null);
    assert.ok(d.C.parties().includes('<img src=x onerror=bad()>')); assert.equal(d.C.report(DATE, DATE, 'name:all parties').entries[0].id, 'LITERAL-ALL');
  });
  for (const name of ['', '  ', 'x'.repeat(91), 'bad\u0000name', 42, null]) await test('invalid party refused without any mutation: ' + JSON.stringify(name).slice(0, 40), () => {
    const d = boot(), before = snapshot(d); assert.throws(() => d.C.saveParty(name), /1–90/); assert.equal(snapshot(d), before);
  });
  await test('remembering a legacy name does not rewrite its original spelling, IDs, amounts or item prices', () => {
    const d = boot(), before = finance(d); action(d, 'ctTab', { tab: 'parties' }); action(d, 'ctPartyRemember', { party: 'name:all parties' });
    assert.equal(d.S.data.settings.canteenParties['p:all parties'], 'All parties'); assert.equal(finance(d), before);
  });
  await test('entry editor offers a real saved-party select, keeps optional legacy free text and stores the chosen party', () => {
    const d = boot(); d.C.openModal(); set(d, '#ctPartySelect', 'name:saved without entries'); assert.equal(d.$('#ctParty').value, FRESH); assert.equal(d.H.UI.ct.edit.party, FRESH);
    set(d, '#ctParty', 'Custom legacy spelling', 'input'); assert.equal(d.$('#ctPartySelect').value, '');
    set(d, '#ctPartySelect', A_TOKEN); action(d, 'ctSetMode', { mode: 'total' }); set(d, '#ctLump', '42', 'input'); action(d, 'ctSave');
    const saved = d.C.entries().find(e => !fixture.canteen.entries.some(old => old.id === e.id)); assert.equal(saved.party, A); assert.equal(saved.amount, 42);
    d.C.openModal(saved.id); set(d, '#ctPartySelect', ''); assert.equal(d.$('#ctParty').value, ''); assert.equal(d.H.UI.ct.edit.party, '');
  });
  await test('Party → Entry shortcut preselects the correct name and Party → Entries applies an all-time exact-name filter', () => {
    const d = boot(); action(d, 'ctTab', { tab: 'parties' }); action(d, 'ctPartyEntry', { party: A_TOKEN }); assert.equal(d.$('#ctParty').value, A); d.Q.closeModal();
    action(d, 'ctPartyEntries', { party: A_TOKEN }); assert.equal(d.H.UI.ct.party, A_TOKEN); assert.equal(d.H.UI.ct.scope, 'all');
    assert.ok(d.Q.ctFilteredEntries().every(e => d.Q.ctPartyMatches(e, A_TOKEN))); assert.equal(d.$('#ctPartyFilter').value, A_TOKEN);
    action(d, 'ctResetFilter'); assert.equal(d.H.UI.ct.party, 'all');
  });
  await test('entry-screen date/type/party filters intersect without substring matches and CSV follows that intersection', async () => {
    const d = boot(); Object.assign(d.H.UI.ct, { tab: 'entries', scope: 'all', from: FROM, to: DATE, party: A_TOKEN, kind: 'purchase', q: '' }); d.H.render();
    same(d.Q.ctFilteredEntries().map(e => e.id).sort(), ['A-MIDDLE', 'A-START']); d.C.csv(); const csv = (await bytes(d, d.files.at(-1).blob)).toString('utf8');
    assert.ok(csv.includes('BILL-A-START') && csv.includes('BILL-A-MIDDLE')); assert.ok(!csv.includes('Verma') && !csv.includes('A-BEFORE'));
  });
  await test('date range and party selection produce precisely their intersection, including both boundaries', () => {
    const d = boot(), before = snapshot(d), r = d.C.report(FROM, TO, A_TOKEN); same(ids(r), idsA);
    for (const [key, value] of Object.entries(totalsA)) assert.equal(r.totals[key], value, key);
    same(r.days.map(day => day.iso), [FROM, DATE, '2026-11-15', TO]); same(r.parties, [{ name: A, n: 4, amt: 251.5, paid: 115.75, bal: 135.75 }]); assert.equal(snapshot(d), before);
  });
  await test('all parties, one party, unassigned and a literal “All parties” name have distinct exact semantics', () => {
    const d = boot(); assert.equal(d.C.report(FROM, TO, 'all').entries.length, 10); same(ids(d.C.report(FROM, TO, B_TOKEN)), ['B-START', 'B-MIDDLE', 'B-END']);
    same(ids(d.C.report(FROM, TO, 'none')), ['UNASSIGNED', 'SPACES-ONLY']); same(ids(d.C.report(FROM, TO, 'name:all parties')), ['LITERAL-ALL']);
    assert.equal(d.C.report(DATE, DATE, A_TOKEN).totals.purchase, 50); assert.equal(d.C.report(DATE, DATE, A_TOKEN).totals.sale, 0);
  });
  await test('all-party summaries include the unassigned group and sum to exactly the same financial totals', () => {
    const d = boot(), r = d.C.report(FROM, TO, 'all'), round = n => Math.round(n * 100) / 100;
    assert.equal(r.parties.find(p => p.name === 'No party / unassigned').n, 2); assert.equal(r.parties.reduce((n, p) => n + p.n, 0), r.totals.count);
    for (const [key, prop] of [['paid', 'paid'], ['balance', 'bal']]) assert.equal(round(r.parties.reduce((n, p) => n + p[prop], 0)), r.totals[key]);
    assert.equal(round(r.parties.reduce((n, p) => n + p.amt, 0)), round(r.totals.purchase + r.totals.sale + r.totals.expense));
  });
  await test('single-day, cross-month, leap-day and year-boundary reports remain inclusive, independent of UI month', () => {
    const d = boot(); d.H.UI.year = 1999; d.H.UI.month = 0;
    same(ids(d.C.report('2024-02-29', '2024-02-29', A_TOKEN)), ['LEAP-DAY']);
    same(ids(d.C.report('2026-12-31', '2027-01-01', A_TOKEN)), ['YEAR-END', 'YEAR-START']);
    assert.equal(d.C.report('2026-12-31', '2027-01-01', A_TOKEN).totals.balance, 30); same(ids(d.C.report(FROM, FROM, A_TOKEN)), ['A-START']);
  });
  for (const [from, to] of [['', TO], [FROM, ''], [TO, FROM], ['2026-02-29', TO], ['2026-11-31', TO], ['2026-13-01', TO], ['2026-01-00', TO], ['26-10-31', TO], ['0000-01-01', TO], ['2026-11-14T00:00:00Z', TO]]) await test('invalid/reversed/incomplete dates cannot silently broaden: ' + from + ' / ' + to, () => {
    const d = boot(), before = snapshot(d); assert.throws(() => d.C.report(from, to, A_TOKEN), /valid dates|baad/); assert.throws(() => d.C.pdfRangeStr(from, to, A_TOKEN)); assert.equal(snapshot(d), before);
  });
  for (const party of ['', 'gupta kirana', 'name:gupta', 'name:missing', 'ALL', '__proto__', null]) await test('unknown/stale party token is refused, never interpreted as All: ' + party, () => {
    const d = boot(); assert.throws(() => d.C.report(FROM, TO, party), /Party selection/); assert.equal(d.files.length, 0);
  });
  await test('a report snapshot is detached from saved entries and cannot modify live data', () => {
    const d = boot(), before = snapshot(d), r = d.C.report(FROM, TO, A_TOKEN); r.entries[0].items[0].qty = 123456; r.entries[0].party = 'changed'; assert.equal(snapshot(d), before);
  });
  const d = boot();
  for (const branded of [false, true]) {
    if (branded) { d.S.data.settings.companyLogo = logo; assert.equal(d.S.saveChange(), true); }
    for (const tpl of d.C.tpls) await test(tpl.id + (branded ? ' + logo' : '') + ': filtered PDF has ONLY matching details, own-price lines and all filtered summaries/totals', () => {
      assert.equal(d.C.setTpl(tpl.id), true); const before = snapshot(d), out = trace(d); assertSelected(out); bounds(d, out);
      const pages = (out.str.match(/\/Type \/Page\b/g) || []).length; assert.equal((out.str.match(/cm \/CompanyLogo Do Q/g) || []).length, branded ? pages : 0);
      const root = printRoot(d, d.C.printRangeHTML(FROM, TO, A_TOKEN));
      assert.equal(root.querySelectorAll('table')[0].querySelectorAll('thead th').length, 7); assert.equal(root.querySelectorAll('table')[1].querySelectorAll('tbody tr').length, 5);
      for (const id of idsA) assert.ok(root.textContent.includes('BILL-' + id)); assert.ok(!/EXCLUDED|Verma|A-AFTER|A-BEFORE|INVALID-DATE|UNASSIGNED|HIDDEN-LUMP/.test(root.textContent));
      assert.equal(root.querySelector('.ct-closing .v').textContent, '−₹90.00'); assert.equal(root.querySelectorAll('[data-company-logo]').length, branded ? 1 : 0);
      assert.equal(snapshot(d), before); artifact('selected-' + tpl.id + (branded ? '-logo' : '') + '.pdf', out.str);
    });
  }
  await test('filtered print keeps exact paise, seven full-width columns and original split items in every corresponding table', () => {
    const root = printRoot(d, d.C.printRangeHTML(FROM, TO, A_TOKEN)), tables = root.querySelectorAll('table');
    same(Array.from(tables[0].querySelectorAll('thead th'), n => n.textContent), ['Date', 'Din', 'Entries', 'Saman', 'Net', 'Paid', 'Baki']);
    same(Array.from(tables[0].rows[1].cells, n => n.textContent), ['31 Oct 2026', 'Sat', '1', '₹100.25', '−₹100.25', '₹25.00', '₹75.25']);
    const total = tables[0].rows[tables[0].rows.length - 1]; assert.equal(total.cells[0].colSpan, 2); same(Array.from(total.cells, n => n.textContent), ['Period ka total', '4', '₹150.25', '−₹90.00', '₹115.75', '₹135.75']);
    assert.equal(Array.from(tables[2].rows).filter(r => r.cells[1]?.textContent === '500').length, 3);
  });
  await test('every visible day/month PDF, WhatsApp PDF and print entrypoint first offers From / To / Party without exporting anything', () => {
    const x = boot(); for (const tab of ['day', 'month']) {
      x.H.UI.ct.tab = tab; x.H.render();
      for (const act of tab === 'day' ? ['ctPdfDay', 'ctSharePdfDay', 'ctPrintDay'] : ['ctPdfMonth', 'ctSharePdfMonth', 'ctPrintMonth']) {
        const before = snapshot(x); action(x, act); assert.ok(x.$('#ctReportForm')); assert.ok(x.$('label[for="ctReportFrom"]') && x.$('label[for="ctReportTo"]') && x.$('label[for="ctReportParty"]'));
        assert.equal(x.$('#ctReportFrom').value, tab === 'day' ? DATE : '2026-11-01'); assert.equal(x.$('#ctReportTo').value, tab === 'day' ? DATE : '2026-11-30');
        assert.equal(x.files.length, 0); assert.equal(x.w.__prints || 0, 0); assert.equal(snapshot(x), before); x.Q.closeModal();
      }
    }
  });
  await test('Party PDF shortcut preselects that party; entry-screen custom/all-time selections prefill the report coherently', () => {
    const x = boot(); action(x, 'ctTab', { tab: 'parties' }); action(x, 'ctPartyPdf', { party: A_TOKEN }); assert.equal(x.$('#ctReportParty').value, A_TOKEN); x.Q.closeModal();
    Object.assign(x.H.UI.ct, { tab: 'entries', from: FROM, to: TO, party: B_TOKEN }); x.H.render(); action(x, 'ctReportOpen'); same([x.$('#ctReportFrom').value, x.$('#ctReportTo').value, x.$('#ctReportParty').value], [FROM, TO, B_TOKEN]);
    x.Q.closeModal(); Object.assign(x.H.UI.ct, { from: '', to: '', scope: 'all' }); x.C.reportOpen(); same([x.$('#ctReportFrom').value, x.$('#ctReportTo').value], ['2024-02-29', '2027-01-01']);
  });
  await test('no matching entry disables every output, refuses direct PDF/print and never falls back to All parties', async () => {
    const x = boot(), before = snapshot(x); form(x, FROM, TO, 'name:saved without entries');
    assert.equal(x.$('#ctReportPreview').dataset.count, '0'); assert.equal(x.$('#ctReportPreview').dataset.state, 'empty');
    for (const act of ['ctReportDownload', 'ctReportShare', 'ctReportPrint']) assert.equal(x.$('[data-act="' + act + '"]').disabled, true);
    assert.equal(x.C.pdfRangeStr(FROM, TO, 'name:saved without entries'), null); assert.equal(x.C.printRangeHTML(FROM, TO, 'name:saved without entries'), null);
    assert.equal(await x.C.reportOutput('download'), false); assert.equal(x.files.length, 0); assert.equal(snapshot(x), before);
  });
  await test('changing dates and party refreshes one live preview; invalid date or stale party selections never become all-data output', async () => {
    const x = boot(); form(x); assert.equal(x.$('#ctReportPreview').dataset.count, '4'); set(x, '#ctReportParty', B_TOKEN); assert.equal(x.$('#ctReportPreview').dataset.count, '3');
    set(x, '#ctReportFrom', TO); set(x, '#ctReportTo', FROM); assert.equal(x.$('#ctReportPreview').dataset.state, 'invalid'); assert.equal(await x.C.reportOutput('download'), false);
    set(x, '#ctReportFrom', FROM); set(x, '#ctReportTo', TO); set(x, '#ctReportParty', 'name:deleted'); assert.equal(x.$('#ctReportPreview').dataset.state, 'invalid'); assert.equal(await x.C.reportOutput('download'), false); assert.equal(x.files.length, 0);
  });
  await test('actual Download PDF uses the selected query, produces a useful range/party filename and changes no saved data', async () => {
    const x = boot(), before = snapshot(x); form(x); assert.equal(await x.C.reportOutput('download'), true); assert.equal(x.$('#ctReportForm'), null);
    assert.equal(x.files.length, 1); assert.equal(x.files[0].name, 'Canteen_2026-10-31_to_2026-12-02_Gupta_Kirana.pdf'); assert.equal((await bytes(x, x.files[0].blob)).toString('latin1'), x.C.pdfRangeStr(FROM, TO, A_TOKEN).str); assert.equal(snapshot(x), before);
  });
  await test('native-share File is the identical filtered PDF, not text/unfiltered data; completion does not falsely claim delivery', async () => {
    const x = boot(), before = snapshot(x); let shared;
    Object.defineProperty(x.w.navigator, 'canShare', { configurable: true, value: () => true }); Object.defineProperty(x.w.navigator, 'share', { configurable: true, value: data => { shared = data; return Promise.resolve(); } });
    form(x); assert.equal(await x.C.reportOutput('share'), true); assert.equal(shared.files.length, 1); assert.equal(shared.files[0].type, 'application/pdf');
    assert.equal((await bytes(x, shared.files[0])).toString('latin1'), x.C.pdfRangeStr(FROM, TO, A_TOKEN).str); assert.equal(x.files.length, 0); assert.match(x.$('#toast').textContent, /Share sheet completed/); assert.equal(snapshot(x), before);
  });
  for (const mode of ['unsupported', 'throwing-canShare', 'rejected-share', 'synchronous-share-error']) await test(mode + ' exposes an honest manual attachment fallback and downloads ONLY the selected PDF', async () => {
    const x = boot(), before = snapshot(x);
    Object.defineProperty(x.w.navigator, 'canShare', { configurable: true, value: () => { if (mode === 'throwing-canShare') throw Error('not available'); return mode !== 'unsupported'; } });
    Object.defineProperty(x.w.navigator, 'share', { configurable: true, value: () => { if (mode === 'synchronous-share-error') throw Error('Not allowed'); return Promise.reject(Error('No sharing target')); } });
    form(x); assert.equal(await x.C.reportOutput('share'), true); assert.equal(x.files.length, 1); assert.equal((await bytes(x, x.files[0].blob)).toString('latin1'), x.C.pdfRangeStr(FROM, TO, A_TOKEN).str);
    assert.match(x.$('#ctReportFallback').textContent, /automatically attached \/ sent nahi/); const link = x.$('#ctReportFallback a'); assert.match(link.href, /^https:\/\/wa.me\//); assert.match(link.rel, /noopener/);
    const note = new URL(link.href).searchParams.get('text'); assert.ok(note.includes(FROM) && note.includes(TO) && note.includes(A)); assert.equal(snapshot(x), before);
    set(x, '#ctReportParty', B_TOKEN); assert.equal(x.$('#ctReportFallback').textContent, '', 'obsolete link cleared on selection change');
  });
  await test('native-share cancellation never triggers an unwanted download, wa.me send or success claim', async () => {
    const x = boot(); Object.defineProperty(x.w.navigator, 'canShare', { configurable: true, value: () => true }); Object.defineProperty(x.w.navigator, 'share', { configurable: true, value: () => Promise.reject(new x.w.DOMException('Cancelled', 'AbortError')) });
    form(x); assert.equal(await x.C.reportOutput('share'), false); assert.equal(x.files.length, 0); assert.equal(x.$('#ctReportFallback').textContent, ''); assert.match(x.$('#toast').textContent, /Sharing cancelled/);
  });
  await test('filtered Print / Save-as-PDF uses exactly the same selection, totals, logo and notes', async () => {
    const x = boot(), before = snapshot(x); form(x); assert.equal(await x.C.reportOutput('print'), true); assert.equal(x.w.__prints, 1);
    assert.equal(x.$('#print-root').innerHTML, printRoot(x, x.C.printRangeHTML(FROM, TO, A_TOKEN)).innerHTML); assert.equal(x.$('#ctReportForm'), null); assert.equal(snapshot(x), before);
  });
  await test('legacy full-month optimization cannot include an impossible-date entry or its money in totals', async () => {
    const x = boot(); x.C.reportOpen('month'); assert.equal(await x.C.reportOutput('download'), true); const pdf = (await bytes(x, x.files[0].blob)).toString('latin1');
    assert.ok(pdf.includes('CANTEEN PERIOD LEDGER')); assert.ok(!pdf.includes('INVALID-DATE') && !pdf.includes('777777')); assert.ok(pdf.includes('BILL-A-MIDDLE') && pdf.includes('BILL-B-MIDDLE'));
  });
  await test('design selection persists normally but keeps the date + party fields, preview and report context valid', async () => {
    const x = boot(), before = finance(x); form(x); set(x, '#ctReportTpl', 'hara'); assert.equal(x.C.tpl().id, 'hara'); same([x.$('#ctReportFrom').value, x.$('#ctReportTo').value, x.$('#ctReportParty').value], [FROM, TO, A_TOKEN]);
    assert.equal(x.$('#ctReportPreview').dataset.count, '4'); assert.equal(finance(x), before); assert.equal(await x.C.reportOutput('download'), true);
  });
  for (const change of ['data', 'save', 'epoch', 'scope', 'disk', 'owner', 'unsaved', 'storage', 'in-place']) await test('stale / unsaved ' + change + ' blocks report output without changing the chosen data', async () => {
    const x = boot(); form(x);
    if (change === 'data') x.S.data = copy(x.S.data);
    if (change === 'save') x.C.saveParty('Added meanwhile');
    if (change === 'epoch') x.H.Cloud.epoch++;
    if (change === 'scope') x.H.Cloud.scope = 'other-account';
    if (change === 'disk') x.w.localStorage.setItem(KEY, JSON.stringify({ ...x.S.data, workers: [] }));
    if (change === 'owner') x.w.localStorage.setItem(OWNER, 'other-account');
    if (change === 'unsaved') x.S.unsaved = true;
    if (change === 'storage') x.S.storageProblem = true;
    if (change === 'in-place') x.S.data.canteen.entries[0].amount++;
    const before = snapshot(x); assert.equal(await x.C.reportOutput('download'), false); assert.equal(x.files.length, 0); assert.match(x.$('#ctReportError').textContent, /badal|save|Doosre|storage/); assert.equal(snapshot(x), before);
  });
  await test('cancel / other modal replacement invalidates report state; a later export cannot use its detached form', async () => {
    const x = boot(); form(x); x.Q.closeModal(); assert.equal(await x.C.reportOutput('download'), false); assert.equal(x.files.length, 0);
    form(x); x.Q.openModal('<div class="modal">Different dialog</div>'); assert.equal(await x.C.reportOutput('share'), false); assert.equal(x.files.length, 0);
  });
  for (const race of ['selection', 'account', 'close', 'other-print']) await test('asynchronous print font wait rejects changed ' + race + ' and never prints a stale report', async () => {
    let release; const pending = new Promise(resolve => { release = resolve; }); const x = boot(fixture, { fonts: { load: () => pending, check: () => true } });
    form(x); const result = x.C.reportOutput('print');
    if (race === 'selection') set(x, '#ctReportParty', B_TOKEN);
    if (race === 'account') x.H.Cloud.epoch++;
    if (race === 'close') x.Q.closeModal();
    if (race === 'other-print') x.$('#print-root').innerHTML = 'Another report';
    release([]); assert.equal(await result, false); assert.equal(x.w.__prints || 0, 0); assert.equal(x.files.length, 0);
    if (race !== 'other-print') assert.equal(x.$('#print-root').innerHTML, ''); else assert.equal(x.$('#print-root').textContent, 'Another report');
  });
  await test('file-sharing failure after an account change never falls back to downloading the old account PDF', async () => {
    const x = boot(); let reject; Object.defineProperty(x.w.navigator, 'canShare', { configurable: true, value: () => true }); Object.defineProperty(x.w.navigator, 'share', { configurable: true, value: () => new Promise((resolve, no) => { reject = no; }) });
    form(x); const pending = x.C.reportOutput('share'); x.H.Cloud.epoch++; reject(Error('No target')); assert.equal(await pending, false); assert.equal(x.files.length, 0);
  });
  await test('blocked storage rolls a new party back and never announces it as saved', () => {
    const x = boot(), before = finance(x), saved = JSON.stringify(x.S.data.settings), disk = x.w.localStorage.getItem(KEY), proto = x.w.Storage.prototype, write = proto.setItem;
    proto.setItem = function (key, value) { if (key === KEY) throw new x.w.DOMException('Full', 'QuotaExceededError'); return write.call(this, key, value); };
    try { assert.throws(() => x.C.saveParty('Must not save'), /save NAHIN/); } finally { proto.setItem = write; }
    assert.equal(JSON.stringify(x.S.data.settings), saved); assert.equal(x.w.localStorage.getItem(KEY), disk); assert.equal(finance(x), before); assert.ok(!x.C.savedParties().includes('Must not save'));
  });
  await test('stale Parties form cannot save into a changed account or overwrite a second tab', () => {
    const x = boot(); action(x, 'ctTab', { tab: 'parties' }); set(x, '#ctPartyNew', 'Stale party', 'input'); x.H.Cloud.epoch++; const before = snapshot(x);
    x.$('#ctPartyForm').dispatchEvent(new x.w.Event('submit', { bubbles: true, cancelable: true })); assert.match(x.$('#ctPartyError').textContent, /badal/); assert.equal(snapshot(x), before);
  });
  await test('catalog-only data counts as real user rows; an explicit empty catalog does not fake user data', () => {
    const x = boot({ settings: {}, workers: [], records: [], canteen: { entries: [], rates: [], log: [], demo: false } }); assert.equal(x.H.sync.hasData(x.S.data), false);
    x.C.saveParty('Only Party'); assert.equal(x.H.sync.counts().parties, 0, 'missing input does not read the active account catalog'); assert.equal(x.Q.syncCollections().parties.length, 0); assert.equal(x.H.sync.counts(x.S.data).parties, 1); assert.equal(x.H.sync.hasData(x.S.data), true);
    x.S.data.settings.canteenParties = {}; assert.equal(x.H.sync.hasData(x.S.data), false);
  });
  await test('party-only erase has confirmation, a safety copy, explicit empty map and a working Undo without deleting salary/settings/logo', () => {
    const payload = copy(fixture); payload.canteen = { entries: [], rates: [], log: [], demo: false }; payload.settings.companyLogo = logo; const x = boot(payload), before = finance(x), names = copy(x.S.data.settings.canteenParties);
    action(x, 'ctWipe'); assert.match(x.$('#modalRoot').textContent, /3 saved parties/); x.$('#cfmOk').click(); same(x.S.data.settings.canteenParties, {}); assert.equal(x.S.data.settings.companyLogo, logo); assert.equal(finance(x), before);
    assert.ok(x.H.Recovery.list().some(c => c.payload.settings.canteenParties['p:gupta kirana'] === A)); action(x, 'doUndo'); same(x.S.data.settings.canteenParties, names);
  });
  await test('saved parties are included in actual JSON backup, recovery and per-collection deletion safeguards', async () => {
    const x = boot(), before = snapshot(x); action(x, 'exportData'); const payload = JSON.parse((await bytes(x, x.files.at(-1).blob)).toString('utf8')); same(payload.settings.canteenParties, fixture.settings.canteenParties); assert.equal(snapshot(x), before);
    const cleared = copy(x.S.data); cleared.settings.canteenParties = {}; assert.equal(x.Q.removedRows(x.S.data, cleared), true); assert.equal(x.Q.unconfirmedRemoteLoss(x.S.data, x.S.data, cleared, { v: 2 }), true);
    assert.equal(x.Q.unconfirmedRemoteLoss(x.S.data, x.S.data, cleared, { v: 2, deletedCollections: ['parties'] }), false);
    assert.equal(x.Q.syncCollections(x.S.data).parties.length, 3);
    assert.equal(x.H.Recovery.capture(x.S.data, 'Test saved party recovery'), true); same(x.H.Recovery.list()[0].payload.settings.canteenParties, fixture.settings.canteenParties);
  });
  for (const catalog of [null, [], 'bad', { 'p:bad': 42 }, { wrong: 'Name' }, { 'p:name': '' }, { 'p:name': ' Name ' }, { 'p:bad': 'bad\u0000' }, { ['p:' + 'x'.repeat(91)]: 'x'.repeat(91) }]) await test('malformed cloud/import party catalog is refused losslessly: ' + JSON.stringify(catalog).slice(0, 38), () => {
    const x = boot(), bad = copy(fixture); bad.settings.canteenParties = catalog; const before = snapshot(x); assert.throws(() => x.Q.validateRemote({ payload: bad }), /party list/); assert.equal(snapshot(x), before);
  });
  await test('100 repeated filtered item occurrences paginate completely, retaining own rates, closing total and logo on every page', () => {
    const payload = copy(fixture); payload.settings.companyLogo = logo;
    payload.canteen.entries = [entry('long', DATE, A, 'purchase', 3750, 1500, Array.from({ length: 100 }, () => item('Hara dhaniya', 37.5))), entry('excluded', DATE, B, 'purchase', 9999, 0, [item('EXCLUDED', 9999)])];
    const x = boot(payload), before = snapshot(x), out = trace(x); assert.equal(out.texts.filter(t => t.text === '500').length, 100); assert.ok(!out.texts.some(t => t.text.includes('EXCLUDED'))); assert.ok(out.texts.some(t => t.text === '−₹3,750.00'));
    assert.ok((out.str.match(/\/Type \/Page\b/g) || []).length > 3); bounds(x, out); artifact('100-selected-lines-logo.pdf', out.str); assert.equal(snapshot(x), before);
  });
  await test('long literal names, notes, bills and HTML-looking text remain complete, wrapped and escaped in selected outputs', () => {
    const payload = copy(fixture), name = 'S'.repeat(90), note = '<script>bad()</script>\n' + 'Long original note '.repeat(20);
    payload.canteen.entries = [entry('literal', DATE, name, 'purchase', 37.5, 10, [item('<b>Hara dhaniya</b> ' + 'X'.repeat(60), 37.5)], { note, billNo: 'B'.repeat(40) })];
    const x = boot(payload), out = trace(x, FROM, TO, 'name:' + name.toLowerCase()); bounds(x, out); const root = printRoot(x, x.C.printRangeHTML(FROM, TO, 'name:' + name.toLowerCase()));
    assert.equal(root.querySelector('script'), null); assert.ok(root.textContent.includes('<script>bad()</script>')); assert.ok(root.textContent.includes(note.replace('\n', ''))); artifact('long-selected-literals.pdf', out.str);
  });
  await test('a real party called All parties is visibly distinguished from the unrestricted dropdown option', () => {
    const x = boot(); form(x); assert.equal(x.$('#ctReportParty option[value="all"]').textContent, 'All parties'); assert.equal(x.$('#ctReportParty option[value="name:all parties"]').textContent, 'Party: All parties');
  });
  await test('Hindi names/items/notes in print explicitly choose the bundled Indic font before the Latin-only subset', () => {
    const payload = copy(fixture), name = 'गुप्ता किराना'; payload.canteen.entries = [entry('hindi', DATE, name, 'purchase', 37.5, 10, [item('हरा धनिया', 37.5)], { note: 'मूल विवरण' })];
    const x = boot(payload), root = printRoot(x, x.C.printRangeHTML(DATE, DATE, 'name:' + name));
    assert.ok(root.querySelector('.stmt').style.fontFamily.startsWith('"Hisaab Indic"')); assert.ok(root.textContent.includes(name) && root.textContent.includes('हरा धनिया') && root.textContent.includes('मूल विवरण'));
    assert.throws(() => x.C.pdfRangeStr(DATE, DATE, 'name:' + name), /Unicode PDF fonts ready nahi/); assert.equal(x.files.length, 0, 'no blank-name PDF if a browser cannot load fonts');
    assert.equal(x.Q.ctReportFilename(x.C.report(DATE, DATE, 'name:' + name)), 'Canteen_2026-11-14_to_2026-11-14_Selected_Party.pdf', 'portable filename preserves the PDF extension even on targets rejecting Unicode filenames');
  });
  await test('stale erase confirmation cannot erase names or entries after account/data changes', () => {
    const x = boot(), before = snapshot(x); action(x, 'ctWipe'); const confirm = x.$('#cfmOk'); x.H.Cloud.epoch++; confirm.click(); assert.equal(snapshot(x), before); assert.match(x.$('#toast').textContent, /badal/);
  });
  await test('Undo of catalog erase recovers missing old names but retains a newly saved party', () => {
    const payload = copy(fixture); payload.canteen = { entries: [], rates: [], log: [], demo: false }; const x = boot(payload);
    action(x, 'ctWipe'); x.$('#cfmOk').click(); x.C.saveParty('Added after erase'); action(x, 'doUndo');
    same(x.C.savedParties().sort(), [A, B, FRESH, 'Added after erase'].sort());
  });
  await test('Missing data jodo actually restores erased saved names while retaining current names and financial values', () => {
    const x = boot(), before = finance(x); x.S.data.settings.canteenParties = {}; assert.equal(x.S.saveChange(), true);
    x.C.saveParty('Added after erase'); const saved = x.H.Recovery.list().find(c => c.payload.settings.canteenParties?.['p:gupta kirana']); assert.ok(saved);
    x.H.Recovery.merge(saved.id); x.$('#cfmOk').click(); same(x.C.savedParties().sort(), [A, B, FRESH, 'Added after erase'].sort());
    assert.equal(finance(x), before); assert.match(x.$('#toast').textContent, /Safety copy ka data jod diya/);
  });
  await test('all added report/party regressions finish without uncaught JavaScript errors', () => same(errors, []));
  windows.forEach(w => w.window.close()); console.log(`\n${failed ? '❌' : '✅'} CANTEEN FILTERS: ${passed} checks pass${failed ? ', ' + failed + ' FAIL' : ''}`); process.exitCode = failed ? 1 : 0;
})().catch(e => { console.error(e); windows.forEach(w => w.window.close()); process.exitCode = 1; });
