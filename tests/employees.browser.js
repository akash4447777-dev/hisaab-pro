/* Optional native Chromium QA for v3.27 Employee labels and original data.
   Same HISAAB_URL / HISAAB_CHROME_* / HISAAB_ARTIFACTS options as attendance.browser.js.
   Real download bytes are checked; WhatsApp navigation/print are stubbed, not sent. */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const URL = process.env.HISAAB_URL || 'http://127.0.0.1:8000/hisaab_v3.html';
const OUT = path.resolve(process.env.HISAAB_ARTIFACTS || path.join(__dirname, '..', '.cache', 'employees-browser-qa'));
fs.mkdirSync(OUT, { recursive: true }); let checks = 0; const errors = [];
function check(value, label) { assert.ok(value, label); checks++; console.log('  ✅ ' + label); }
(async () => {
  const b = await chromium.launch({ headless: true, ...(process.env.HISAAB_CHROME_EXECUTABLE ? { executablePath: process.env.HISAAB_CHROME_EXECUTABLE } : {}), args: process.env.HISAAB_CHROME_ARGS ? JSON.parse(process.env.HISAAB_CHROME_ARGS) : ['--no-sandbox'] });
  try {
    const page = await b.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'en-IN', timezoneId: 'Asia/Kolkata', acceptDownloads: true });
    page.on('pageerror', e => errors.push(e.stack));
    await page.goto(new globalThis.URL('Hisaab-Pro-v3.26.html', URL).href); await page.waitForFunction(() => !!window.Hisaab);
    // Treat the historical fixture as real saved data. Existing Store.save
    // intentionally clears demo flags on the first edit in both releases.
    const saved = await page.evaluate(() => { Hisaab.Store.data.settings.demo = false; Hisaab.Store.data.canteen.demo = false; if (!Hisaab.Store.save(true)) throw Error('Historical fixture save failed'); return JSON.stringify({ data: Hisaab.Store.data, disk: Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])) }); });
    await page.goto(URL); await page.waitForFunction(() => !!window.Hisaab);
    check(await page.evaluate(before => JSON.stringify({ data: Hisaab.Store.data, disk: Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])) }) === before, saved), 'native v3.26 → v3.27 navigation preserves complete original data/raw storage');
    check((await page.locator('#nav [data-view="workers"]').textContent()).includes('Employees') && (await page.locator('[data-act="addWorker"]').first().textContent()).includes('Add Employee'), 'native navigation and topbar use Employees / Add Employee');
    for (const view of ['dashboard', 'hisaab', 'workers', 'ledger', 'records', 'settings', 'canteen', 'attendance']) {
      await page.evaluate(view => { Hisaab.UI.search = ''; Hisaab.go(view); }, view);
      check(await page.evaluate(() => !/\bworkers?\b/i.test(document.querySelector('#viewRoot').innerText + ' ' + [...document.querySelectorAll('#viewRoot [title],#viewRoot [placeholder]')].map(n => (n.title || '') + ' ' + (n.placeholder || '')).join(' '))), 'native ' + view + ' visible labels, placeholders and tooltips use employee');
    }
    await page.keyboard.press('Control+k'); await page.locator('#cmdkInp').fill('employee');
    check((await page.locator('#cmdkList').textContent()).includes('Employees') && !(await page.locator('#cmdkList').textContent()).match(/\bworkers?\b/i), 'native employee command-palette search finds renamed navigation/actions');
    await page.keyboard.press('Escape');
    await page.evaluate(() => Hisaab.go('workers')); await page.locator('.topbar-actions [data-act="addWorker"]').click();
    check((await page.locator('#modalRoot h3').textContent()) === 'Add new employee' && (await page.locator('#modalRoot').textContent()).includes('Employee name'), 'native add form uses Employee labels');
    // The existing modal schedules its autofocus. Wait for that real focus
    // before filling so the delayed focus cannot interrupt a native insertText.
    await page.waitForFunction(() => document.activeElement?.id === 'wName');
    await page.fill('#wName', 'Native Employee QA'); await page.fill('#wRate', '16000'); await page.click('#wSave');
    await page.waitForSelector('#wSave', { state: 'detached', timeout: 3000 }).catch(async error => { throw Error('Employee form did not save: ' + JSON.stringify(await page.evaluate(() => ({ toast: document.querySelector('#toast').textContent, name: document.querySelector('#wName')?.value, rate: document.querySelector('#wRate')?.value, unsaved: Hisaab.Store.unsaved, people: Hisaab.Store.data.workers.map(p => p.name) }))) + '\n' + error); });
    const id = await page.evaluate(() => Hisaab.Store.data.workers.find(p => p.name === 'Native Employee QA').id);
    check((await page.locator('#toast').textContent()).includes('Employee added') && await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('hisaabPro.v1')); return Array.isArray(d.workers) && !('employees' in d); }), 'native add saves under original workers schema with an Employee success message');
    await page.locator('[data-act="editWorker"][data-wid="' + id + '"]').click(); await page.waitForFunction(() => document.activeElement?.id === 'wName'); await page.fill('#wName', 'Native Employee Edited'); await page.click('#wSave'); await page.waitForSelector('#wSave', { state: 'detached' });
    check(await page.evaluate(id => Hisaab.Store.worker(id).name === 'Native Employee Edited', id) && (await page.locator('#toast').textContent()).includes('Employee updated'), 'native edit retains original ID and reports Employee updated');
    await page.reload(); await page.waitForFunction(() => !!window.Hisaab);
    check(await page.evaluate(id => Hisaab.Store.worker(id).name === 'Native Employee Edited', id), 'native employee CRUD persists across a real browser reload');
    await page.evaluate(() => { Hisaab.UI.year = 2026; Hisaab.UI.month = 10; Hisaab.go('hisaab'); });
    async function download(selector, name) { const event = page.waitForEvent('download'); await page.locator(selector).first().click(); const file = await event, output = path.join(OUT, name); await file.saveAs(output); return fs.readFileSync(output); }
    const csv = await download('[data-act="exportCsv"]', 'Employee-payroll.csv');
    check(csv.toString('utf8').replace(/^\uFEFF/, '').startsWith('Employee,Type,Rate,') && csv.toString('utf8').includes('Native Employee Edited'), 'native salary CSV download has Employee header and complete employee data');
    const pdf = await download('[data-act="pdfAll"]', 'Employee-payroll.pdf'); const pdfText = pdf.toString('latin1');
    check(pdfText.startsWith('%PDF-1.4') && pdfText.includes('(EMPLOYEE)') && pdfText.includes('(Employee signature)') && !/\bworkers?\b/i.test(pdfText), 'native payroll PDF uses EMPLOYEE summary / Employee signature, not old labels');
    await page.evaluate(() => { window.print = () => {}; }); await page.locator('[data-act="printRec"][data-wid="' + id + '"]').click();
    check((await page.locator('#print-root').textContent()).includes('Employee signature') && !(await page.locator('#print-root').textContent()).match(/\bworkers?\b/i), 'native browser print statement uses Employee signature');
    await page.evaluate(() => { window.__wa = []; window.open = url => { window.__wa.push(url); return null; }; Hisaab.go('workers'); });
    await page.locator('[data-act="openProfile"][data-wid="' + id + '"]').click(); await page.locator('#modalRoot [data-act="shareWa"]').click();
    check(await page.evaluate(() => { const t = new globalThis.URL(window.__wa[0]).searchParams.get('text'); return t.includes('Employee: Native Employee Edited') && !/\bworkers?\b/i.test(t); }), 'native salary share action builds Employee text without opening a recipient or sending');
    await page.locator('#modalRoot [data-act="closeDrawer"]').click();
    await page.locator('[data-act="delWorker"][data-wid="' + id + '"]').click();
    check((await page.locator('#modalRoot h3').textContent()).includes('Delete employee?'), 'native delete confirmation says employee; original data is not deleted');
    await page.locator('#modalRoot [data-act="closeModal"]').first().click();
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 }); await page.evaluate(() => Hisaab.go('workers'));
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.querySelector('.topbar-actions [data-act="addWorker"]').getBoundingClientRect().right <= innerWidth + 1), width + 'px Employees view and Add Employee button fit without horizontal overflow');
      await page.locator('.topbar-actions [data-act="addWorker"]').click();
      check(await page.evaluate(() => { const m = document.querySelector('#modalRoot .modal').getBoundingClientRect(); return m.left >= 0 && m.right <= innerWidth + 1 && document.querySelector('#modalRoot h3').textContent === 'Add new employee'; }), width + 'px Add new employee form fits without truncating its heading');
      if (process.env.HISAAB_SCREENSHOTS === '1') {
        await page.evaluate(async () => { const root = document.querySelector('#modalRoot'); await Promise.all(root.getAnimations({ subtree: true }).filter(a => Number.isFinite(a.effect.getComputedTiming().endTime)).map(a => a.finished.catch(() => {}))); });
        await page.screenshot({ path: path.join(OUT, 'employee-form-' + width + '.png') });
      }
      await page.locator('#modalRoot [data-act="closeModal"]').first().click();
    }
    const after = await page.evaluate(() => Hisaab.Store.data), original = JSON.parse(saved).data;
    fs.writeFileSync(path.join(OUT, 'legacy-before.json'), JSON.stringify(original, null, 2)); fs.writeFileSync(path.join(OUT, 'legacy-after.json'), JSON.stringify(after, null, 2));
    for (const section of ['workers', 'records', 'canteen', 'attendance']) assert.deepEqual(section === 'workers' ? after.workers.filter(x => x.name !== 'Native Employee Edited') : after[section], original[section], 'original ' + section + ' preserved');
    check(true, 'native rename, CRUD of one new employee and exports preserve every original profile/salary/canteen/attendance record');
    check(errors.length === 0, 'no uncaught native JavaScript errors');
  } finally { await b.close(); }
  console.log('\n✅ EMPLOYEES BROWSER: ' + checks + ' checks pass. Artifacts: ' + OUT);
})().catch(e => { console.error(e); console.error(errors); process.exitCode = 1; });
