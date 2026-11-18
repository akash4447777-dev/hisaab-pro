/* Optional real Chromium QA, separate from the dependency-light npm suite.
   Start a local static server. Install Playwright in a scratch folder or in tests.
   NODE_PATH=<scratch>/node_modules HISAAB_URL=http://127.0.0.1:8000/hisaab_v3.html \
     node tests/attendance.browser.js
   HISAAB_CHROME_EXECUTABLE + HISAAB_CHROME_ARGS (JSON array) support a supplied
   browser binary. All data is disposable QA data in isolated browser processes.
   Artifacts default to ../.cache/attendance-browser-qa (never check into Git).
   Set HISAAB_SCREENSHOTS=1 to also capture images on a full browser build. */
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path");
const { chromium } = require("playwright");
const URL = process.env.HISAAB_URL || "http://127.0.0.1:8000/hisaab_v3.html";
const OUT = path.resolve(process.env.HISAAB_ARTIFACTS || path.join(__dirname, "..", ".cache", "attendance-browser-qa"));
fs.mkdirSync(OUT, { recursive: true });
const CAPTURE = process.env.HISAAB_SCREENSHOTS === "1";
const errors = []; let checks = 0;
function check(value, label) { assert.ok(value, label); checks++; console.log("  ✅ " + label); }
async function browser() {
  return chromium.launch({ headless: true, ...(process.env.HISAAB_CHROME_EXECUTABLE ? { executablePath: process.env.HISAAB_CHROME_EXECUTABLE } : {}),
    args: process.env.HISAAB_CHROME_ARGS ? JSON.parse(process.env.HISAAB_CHROME_ARGS) : ["--no-sandbox"] });
}
async function pageFor(b) {
  const page = await b.newPage({ viewport: { width: 1440, height: 1000 }, locale: "en-IN", timezoneId: "Asia/Kolkata", acceptDownloads: true });
  page.on("pageerror", (e) => errors.push(e.stack)); await page.goto(URL); await page.click('#nav [data-view="attendance"]'); return page;
}
async function click(page, selector) { await page.locator(selector).first().click(); }
async function screenshot(page, name, fullPage = false) {
  if (!CAPTURE) return;
  await page.evaluate(() => { window.scrollTo({ top: 0, behavior: "instant" }); const body = document.querySelector('.att-dialog .modal-b'); if (body) body.scrollTop = 0; });
  await page.waitForFunction(() => window.scrollY === 0); await page.waitForTimeout(280);
  await page.screenshot({ path: path.join(OUT, name), fullPage });
}
async function saveForm(page, id) {
  await page.locator("#" + id + ' button[type="submit"]').click();
  try { await page.waitForSelector("#" + id, { state: "detached", timeout: 3000 }); }
  catch (error) {
    const state = await page.evaluate((id) => { const f = document.getElementById(id); return f && { error: document.querySelector("#attFormError")?.textContent, valid: f.checkValidity(), active: document.activeElement?.id, controls: Array.from(f.querySelectorAll("input, select, textarea"), (el) => ({ id: el.id, value: el.value, disabled: el.disabled, valid: el.checkValidity(), message: el.validationMessage })), records: Hisaab.attendance.data().records.length, toast: document.querySelector("#toast")?.textContent }; }, id);
    throw new Error(id + " did not save: " + JSON.stringify(state));
  }
}
async function addManager(page, name, code, shift) {
  await click(page, '[data-att-act="managerAdd"]'); await page.fill("#attMName", name); await page.fill("#attMCode", code); await page.fill("#attMJoined", "2026-11-01"); await page.selectOption("#attMShift", shift); await page.locator('#attManagerForm button[type="submit"]').click();
  await page.waitForSelector("#attManagerForm", { state: "detached" });
}
async function exportFile(page, format, name) {
  let expected = page.waitForEvent("download", { timeout: 6000 }).catch(() => null);
  await page.locator('[name="format"][value="' + format + '"]').click({ noWaitAfter: true, timeout: 12000 }).catch(async (error) => {
    // Software-rendered complex script can outlast transient user activation.
    // The app must provide a real ready-file link rather than lose the report.
    if (!await page.locator('[data-att-file="' + format + '"]').count()) throw error;
  });
  let file = await expected;
  if (!file) { expected = page.waitForEvent("download", { timeout: 10000 }); await page.locator('[data-att-file="' + format + '"]').click({ noWaitAfter: true }); file = await expected; }
  const output = path.join(OUT, name + "." + format); await file.saveAs(output);
  check(file.suggestedFilename().endsWith("." + format), "native " + name + " " + format + " filename");
  const bytes = fs.readFileSync(output); check(format === "pdf" ? bytes.subarray(0, 8).toString() === "%PDF-1.4" : bytes.readUInt32LE() === 0x04034b50, name + " is an actual " + format + " file");
  return bytes;
}
(async () => {
  console.log("\n▸ Real browser: native forms, mobile layout, persistence and downloads");
  const b = await browser();
  try {
    const page = await pageFor(b);
    check(await page.locator(".att-page").count(), "Attendance route opens in the existing shell");
    await screenshot(page, "01-empty-desktop.png");
    await addManager(page, "Aarav Sharma", "M-001", "day"); await addManager(page, "Priya Mehta", "M-002", "night");
    check(await page.evaluate(() => Hisaab.attendance.data().managers.length === 2), "native manager forms add two dynamic profiles");
    await page.evaluate(() => Hisaab.attendance.setDate("2026-11-14")); await page.evaluate(() => Hisaab.render());
    await click(page, '[data-att-act="recordAdd"]'); await page.fill("#attRManager", "Aarav Sharma · M-001"); await page.locator("#attRManager").press("Tab"); await page.fill("#attRDate", "2026-11-14"); await page.selectOption("#attRShift", "day"); await page.selectOption("#attRStatus", "present"); await saveForm(page, "attRecordForm");
    check(await page.evaluate(() => Hisaab.attendance.data().records.length === 1), "native tap form saves exactly one record");
    await click(page, '[data-att-act="recordAdd"]'); await page.fill("#attRManager", "Priya Mehta · M-002"); await page.locator("#attRManager").press("Tab"); await page.fill("#attRDate", "2026-11-14"); await page.selectOption("#attRShift", "night"); await click(page, '[data-att-act="recordMode"][data-value="time"]');
    check(await page.evaluate(() => document.querySelector('#attRIn').value === '' && document.querySelector('#attRInWhen').value === 'same-night' && document.querySelector('#attROut').value === '' && document.querySelector('#attROutWhen').value === 'next-morning'), "new Night records suggest periods but never invent fixed working clocks");
    const choices = ["Same day morning", "Same day night", "Next day morning", "Next day night"];
    for (const id of ["attRInWhen", "attROutWhen"]) check(JSON.stringify(await page.locator('#' + id + ' option').allTextContents()) === JSON.stringify(choices), id + " offers the four exact morning/night day choices");
    await page.fill("#attRIn", "13:00"); await page.locator('#attRecordForm button[type="submit"]').click();
    check(await page.evaluate(() => !document.querySelector('#attRIn').checkValidity() && Hisaab.attendance.data().records.length === 1), "native validation blocks 13:00 instead of guessing a 12-hour time");
    await page.fill("#attRIn", "0930"); await page.selectOption("#attRInWhen", "same-night"); await page.fill("#attROut", "0730"); await page.selectOption("#attROutWhen", "next-morning");
    check((await page.locator("#attRIn").inputValue()) === "9:30", "mobile-style 0930 digits format into a 12-hour clock");
    check((await page.locator("#attTimeJourney").textContent()).includes('14 Nov 2026 → 15 Nov 2026'), "live timeline shows the actual two dates for an overnight shift");
    await screenshot(page, "00-time-form-desktop.png");
    check(await page.evaluate(() => { const header = document.querySelector('.att-dialog .modal-h').getBoundingClientRect(), footer = document.querySelector('.att-dialog .modal-f').getBoundingClientRect(); return header.top >= 0 && footer.bottom <= innerHeight; }), "desktop time dialog keeps its title and Save button visible while its body scrolls");
    const preview = await page.locator("#attCalcPreview").textContent(); check(preview.includes("10h 00m"), "native overnight preview calculates working time: " + preview);
    await page.locator('#attRecordForm button[type="submit"]').click(); await page.waitForSelector("#attRecordForm", { state: "detached" });
    check(await page.evaluate(() => { const A = Hisaab.attendance, r = A.data().records.find((x) => x.shift === "night"); return r.checkIn === '21:30' && r.checkOut === '07:30' && r.outNextDay && A.calculate(r).workedMinutes === 600 && A.calculate(r).overtimeMinutes === 0 && A.calculate(r).lateMinutes === 0 && r.breakMinutes === 0; }), "actual ten-hour overnight entry has no deduction, fixed target, OT or lateness");
    await page.evaluate(() => { const A = Hisaab.attendance; A.openRecord(A.data().records.find((r) => r.shift === 'night').id); });
    check(await page.evaluate(() => document.querySelector('#attRIn').value === '9:30' && document.querySelector('#attRInWhen').value === 'same-night' && document.querySelector('#attROut').value === '7:30' && document.querySelector('#attROutWhen').value === 'next-morning'), "saved overnight entry reopens with its correct 12-hour values and day/period choices");
    await page.selectOption('#attROutWhen', 'same-morning'); await page.locator('#attRecordForm button[type="submit"]').click();
    check((await page.locator('#attFormError').textContent()).includes('morning/night'), "checkout before arrival stays open with a helpful day/period error");
    await page.selectOption('#attROutWhen', 'next-morning'); await saveForm(page, 'attRecordForm');
    // Prevent a duplicate through the real form, not just the public API.
    await click(page, '[data-att-act="recordAdd"]'); await page.fill("#attRManager", "Priya Mehta · M-002"); await page.locator("#attRManager").press("Tab"); await page.fill("#attRDate", "2026-11-14"); await page.selectOption("#attRShift", "night"); await page.locator('#attRecordForm button[type="submit"]').click();
    check((await page.locator("#attFormError").textContent()).includes("already exists"), "native duplicate submission stays open with a clear error");
    await click(page, '#modalRoot [data-act="closeModal"]');
    await page.evaluate(() => { const A = Hisaab.attendance; A.ui().shift = "day"; A.setDate("2026-11-15"); Hisaab.render(); });
    await click(page, '[data-att-act="bulk"]'); await page.selectOption("#attBStatus", "half"); await page.locator('#attBulkForm button[type="submit"]').click(); await page.waitForSelector("#attBulkForm", { state: "detached" });
    check(await page.evaluate(() => Hisaab.attendance.data().records.length === 3), "native bulk selection saves only the checked roster");
    // Exercise noon/midnight through native validation and saving, not just helpers.
    await page.evaluate(() => { const A = Hisaab.attendance; A.openRecord(null, A.data().managers.find((m) => m.code === 'M-002').id, '2026-11-16', 'night'); });
    await click(page, '[data-att-act="recordMode"][data-value="time"]'); await page.fill('#attRIn', '12'); await page.selectOption('#attRInWhen', 'same-night'); await page.fill('#attROut', '12'); await page.selectOption('#attROutWhen', 'next-morning');
    check((await page.locator('#attTimeJourney').textContent()).includes('12 morning = midnight · 12 night = noon'), "12 o’clock displays a visible noon/midnight explanation");
    await saveForm(page, 'attRecordForm');
    check(await page.evaluate(() => { const A = Hisaab.attendance, r = A.data().records.find((r) => r.date === '2026-11-16'); return r.checkIn === '12:00' && r.checkOut === '00:00' && r.outNextDay && A.calculate(r).workedMinutes === 720; }), "12 night to next-day 12 morning saves noon-to-midnight, exactly 12 hours");
    await page.evaluate(() => { const A = Hisaab.attendance; A.deleteRecord(A.data().records.find((r) => r.date === '2026-11-16').id); A.setDate('2026-11-15'); Hisaab.render(); });
    await page.selectOption("#attShiftFilter", "all");
    await click(page, '[data-att-act="tab"][data-value="calendar"]');
    check(await page.locator(".att-cal-cell").count() === 42, "calendar renders the complete monthly grid");
    await screenshot(page, "02-calendar-desktop.png"); await click(page, '.att-cal-cell[data-date="2026-11-14"]');
    check(await page.locator(".att-person").count() === 2, "calendar day opens the editable daily board");
    // Reproduce the user's screenshot through native inputs, Save and downloads.
    const financeBeforeLongShift = await page.evaluate(() => JSON.stringify({ workers: Hisaab.Store.data.workers, records: Hisaab.Store.data.records, canteen: Hisaab.Store.data.canteen }));
    await page.evaluate(() => { const A = Hisaab.attendance; A.openRecord(null, A.data().managers.find((m) => m.code === 'M-001').id, '2026-11-06', 'day'); });
    await click(page, '[data-att-act="recordMode"][data-value="time"]');
    await page.fill('#attRIn', '10:32'); await page.selectOption('#attRInWhen', 'same-morning'); await page.fill('#attROut', '1:33'); await page.selectOption('#attROutWhen', 'next-night');
    check((await page.locator('#attCalcPreview').textContent()).includes('27h 01m') && (await page.locator('#attTimeJourney').textContent()).includes('6 Nov 2026 → 7 Nov 2026'), "screenshot's 6th morning → 7th afternoon correctly previews 27h 01m");
    await screenshot(page, '11-long-shift-form.png'); await saveForm(page, 'attRecordForm');
    check(await page.evaluate(() => { const A = Hisaab.attendance, r = A.data().records.find((r) => r.date === '2026-11-06'); return r && r.checkIn === '10:32' && r.checkOut === '13:33' && !r.inNextDay && r.outNextDay && r.breakMinutes === 0 && A.calculate(r).workedMinutes === 1621 && A.calculate(r).credit === 1 && A.calculate(r).overtimeMinutes === 0; }), "native Save persists the full 27h 01m with canonical clocks and no new target/deduction");
    await page.evaluate(() => { const A = Hisaab.attendance; A.openRecord(A.data().records.find((r) => r.date === '2026-11-06').id); });
    check(await page.evaluate(() => document.querySelector('#attRDate').value === '2026-11-06' && document.querySelector('#attRIn').value === '10:32' && document.querySelector('#attROut').value === '1:33' && document.querySelector('#attROutWhen').value === 'next-night'), "long saved shift reopens with its original next-day night choice");
    await page.selectOption('#attROutWhen', 'same-morning'); await page.locator('#attRecordForm button[type="submit"]').click();
    check((await page.locator('#attFormError').textContent()).includes('after check-in') && await page.evaluate(() => { const A = Hisaab.attendance; return A.calculate(A.data().records.find((r) => r.date === '2026-11-06')).workedMinutes === 1621; }), "removing the 24-hour cap does not allow a reversed edit to overwrite the saved entry");
    await page.selectOption('#attROutWhen', 'next-night'); await saveForm(page, 'attRecordForm');
    await page.evaluate(() => { const A = Hisaab.attendance; A.openExport(A.data().managers.find((m) => m.code === 'M-001').id); });
    await page.fill('#attEFrom', '2026-11-06'); await page.fill('#attETo', '2026-11-07');
    const longShift = await exportFile(page, 'pdf', 'Long-shift-manager'); await exportFile(page, 'xlsx', 'Long-shift-manager');
    check(['(27h 01m)', '(10:32 morning)', '(1:33 night +1d)'].every((text) => longShift.toString('latin1').includes(text)), "native long-shift PDF includes full actual hours and the chosen next-day period");
    check(await page.evaluate((before) => JSON.stringify({ workers: Hisaab.Store.data.workers, records: Hisaab.Store.data.records, canteen: Hisaab.Store.data.canteen }) === before, financeBeforeLongShift), "long shift, re-edit and report downloads leave salary/canteen data unchanged");
    await click(page, '#modalRoot [data-act="closeModal"]');
    // A short actual Sunday shift is Present without an hours threshold.
    await page.evaluate(() => { const A = Hisaab.attendance; A.openRecord(null, A.data().managers.find((m) => m.code === 'M-002').id, '2026-11-15', 'night'); });
    await click(page, '[data-att-act="recordMode"][data-value="time"]');
    check(await page.locator('#attRBreak, #attRStandard, #attRHalf, [data-att-act="recordDefaults"]').count() === 0, "time editor has no break/target inputs or fixed-clock preset");
    await page.fill('#attRIn', '1:15'); await page.selectOption('#attRInWhen', 'same-night'); await page.fill('#attROut', '5'); await page.selectOption('#attROutWhen', 'same-night');
    check((await page.locator('#attCalcPreview').textContent()).includes('3h 45m') && (await page.locator('#attCalcPreview').textContent()).includes('Present'), "a 3h 45m Sunday shift is actual hours, not auto Half day");
    await saveForm(page, 'attRecordForm');
    await page.evaluate(() => { const A = Hisaab.attendance; A.openRecord(null, A.data().managers.find((m) => m.code === 'M-002').id, '2026-11-15', 'day'); });
    await saveForm(page, 'attRecordForm');
    await click(page, '[data-att-act="tab"][data-value="sundays"]');
    check(await page.locator('.att-sunday-date').count() === 2, "Sundays tab lists only the two managers who attended, not Saturday check-outs");
    check((await page.locator('.att-sunday-person').filter({ hasText: 'Priya Mehta' }).textContent()).includes('Day + Night'), "Sunday Day + Night shifts are grouped into one dated visit");
    await screenshot(page, '09-sundays-desktop.png');
    await page.selectOption('#attShiftFilter', 'night');
    check(await page.locator('.att-sunday-person').count() === 1 && (await page.locator('.att-sundays').textContent()).includes('Sun, 15 Nov 2026'), "Sunday shift filter keeps only the recorded Night arrival");
    const priyaId = await page.evaluate(() => Hisaab.attendance.data().managers.find((m) => m.code === 'M-002').id);
    await page.selectOption('#attManagerFilter', priyaId); await page.selectOption('#attShiftFilter', 'all');
    check(await page.locator('.att-sunday-date').count() === 1 && (await page.locator('.att-sunday-count').textContent()) === '1', "selected-manager Sunday count deduplicates the two shifts");
    await page.setViewportSize({ width: 320, height: 780 });
    // Resizing crosses the shell's responsive transition; wait for settled layout.
    await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth + 1, null, { timeout: 3000 });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "320px Sunday list and date chips do not overflow");
    await screenshot(page, '10-sundays-mobile.png'); await page.setViewportSize({ width: 1440, height: 1000 });
    await page.selectOption('#attManagerFilter', 'all');
    await click(page, '[data-att-act="tab"][data-value="records"]'); await click(page, '[data-att-act="period"][data-value="custom"]'); await page.fill("#attFrom", "2026-11-14"); await page.locator("#attFrom").dispatchEvent("change"); await page.fill("#attTo", "2026-11-16"); await page.locator("#attTo").dispatchEvent("change");
    await click(page, '[data-att-act="export"]'); await page.fill("#attEManager", "Aarav Sharma · M-001"); await page.locator("#attEManager").press("Tab"); await page.fill("#attEFrom", "2026-11-14"); await page.fill("#attETo", "2026-11-16");
    const latin = await exportFile(page, "pdf", "Latin-manager"); await exportFile(page, "xlsx", "Latin-manager");
    check(latin.toString("latin1").includes("16 Nov 2026"), "custom final report date is present in the actual PDF");
    await page.fill("#attEManager", "Priya Mehta · M-002"); await page.locator("#attEManager").press("Tab");
    const overnight = await exportFile(page, "pdf", "Overnight-manager"); await exportFile(page, "xlsx", "Overnight-manager");
    check(['(9:30 night)', '(7:30 morning +1d)', '+1d = next day'].every((text) => overnight.toString('latin1').includes(text)) && !overnight.toString('latin1').includes('(21:30)'), "downloaded overnight PDF shows compact 12-hour clocks with full morning/night and explicit next-day markers");
    check(overnight.toString('latin1').includes('Sun, 15 Nov 2026') && overnight.toString('latin1').includes('(13h 45m)'), "downloaded PDF separately lists Sunday 15 November and the full 13h 45m total");
    await click(page, '#modalRoot [data-act="closeModal"]');
    // Extra profiles here are disposable QA fixtures, never production samples.
    await page.evaluate(() => { const A = Hisaab.attendance; ["Kabir Singh", "Neha Gupta", "Vikram Patel", "Riya Kapoor", "Arjun Verma", "Meera Nair"].forEach((name, i) => A.saveManager({ name, code: "QA-" + i, department: "Operations", defaultShift: i % 3 ? "day" : "night", joinedOn: "2026-11-01" })); A.ui().tab = "board"; A.ui().shift = "all"; A.ui().manager = "all"; A.ui().q = ""; A.setDate("2026-11-14"); Hisaab.render(); });
    await screenshot(page, "03-board-desktop.png", true);
    await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => Hisaab.render()); await screenshot(page, "04-board-mobile.png");
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "390px daily board has no page-level horizontal overflow");
    check(await page.locator('#nav [data-view="attendance"]').evaluate((el) => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }), "mobile navigation scrolls the active Attendance tab into view");
    await click(page, '[data-att-act="recordAdd"]'); await click(page, '[data-att-act="recordMode"][data-value="time"]'); await page.waitForTimeout(250); if (CAPTURE) await page.screenshot({ path: path.join(OUT, "05-time-form-mobile.png") });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "mobile time form fits the viewport");
    check(await page.evaluate(() => { const header = document.querySelector('.att-dialog .modal-h').getBoundingClientRect(), footer = document.querySelector('.att-dialog .modal-f').getBoundingClientRect(); return header.top >= 0 && footer.bottom <= innerHeight; }), "mobile time form keeps the close and Save buttons in the viewport");
    await page.setViewportSize({ width: 320, height: 780 });
    check(await page.evaluate(() => { const ids = ['attRIn', 'attRInWhen', 'attROut', 'attROutWhen']; return document.documentElement.scrollWidth <= innerWidth + 1 && ids.every((id) => { const r = document.getElementById(id).getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.width >= 180; }); }), "even a 320px mobile form keeps time inputs and full day/period controls inside the screen");
    await click(page, '#modalRoot [data-act="closeModal"]');
    await page.evaluate(() => Hisaab.attendance.openRules());
    check(await page.evaluate(() => { const form = document.querySelector('#attRulesForm'); return form && form.querySelectorAll('input').length === 3 && !form.querySelector('input[type=number]') && !form.querySelector('select') && form.textContent.includes('Working hours are not fixed') && form.getBoundingClientRect().right <= innerWidth; }), "mobile Attendance settings have manual credit switches only, never fixed clocks, targets or breaks");
    await click(page, '#modalRoot [data-act="closeModal"]'); await page.setViewportSize({ width: 390, height: 844 });
    await click(page, '[data-att-act="tab"][data-value="calendar"]'); await screenshot(page, "06-calendar-mobile.png"); check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "mobile calendar fits all seven weekdays");
    await page.setViewportSize({ width: 1440, height: 1000 }); await click(page, '[data-att-act="tab"][data-value="board"]'); await click(page, '[data-act="toggleThemeIcon"]'); await screenshot(page, "07-board-dark.png");
    const before = await page.evaluate(() => JSON.stringify(Hisaab.sync.view(Hisaab.Store.data).attendance)); await page.reload(); await page.waitForFunction(() => !!window.Hisaab); await page.evaluate(() => Hisaab.go("attendance")); check(await page.evaluate((value) => JSON.stringify(Hisaab.sync.view(Hisaab.Store.data).attendance) === value, before), "profiles, snapshots, records and history survive a real page reload");
    // Report-only redesign: real monthly inputs, downloads, capacity warning and data invariance.
    const reportPage = await pageFor(b);
    await reportPage.evaluate(() => {
      const A = Hisaab.attendance, m = A.saveManager({name:'Lokesh Verma',code:'REG-01',department:'Operations',phone:'9876543210',defaultShift:'day',joinedOn:'2026-11-01'});
      for (let d = 1; d <= 31; d++) A.saveRecord({managerId:m.id,date:'2026-12-'+String(d).padStart(2,'0'),shift:'day',mode:'time',checkIn:'09:17',checkOut:'18:42',note:d===31?'Last report date retained':''});
      A.setDate('2026-12-01'); A.ui().shift='all'; Hisaab.render(); A.openExport(m.id);
    });
    check((await reportPage.locator('#attExportPreview').textContent()).includes('31 date / shift rows') && (await reportPage.locator('#attExportCapacity').textContent()).includes('1 page'), 'native report studio previews all 31 dates in one PDF page');
    const monthPdf = await exportFile(reportPage, 'pdf', 'Monthly-register'); await exportFile(reportPage, 'xlsx', 'Monthly-register');
    check(/\/Type \/Pages[^\n]*\/Count 1\b/.test(monthPdf.toString('latin1')) && monthPdf.toString('latin1').includes('Last report date retained'), 'native one-page month PDF retains its final date and complete note');
    await click(reportPage, '#modalRoot [data-act="closeModal"]');
    const beforeReports = await reportPage.evaluate(() => {
      const A=Hisaab.attendance,m=A.data().managers[0];
      for(let d=1;d<=31;d++) A.saveRecord({managerId:m.id,date:'2026-12-'+String(d).padStart(2,'0'),shift:'night',mode:'time',checkIn:'21:15',checkOut:'05:47',outNextDay:true});
      A.openExport(m.id);
      return JSON.stringify({data:Hisaab.Store.data,disk:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])),dirty:Hisaab.Cloud.dirty});
    });
    check((await reportPage.locator('#attExportPreview').textContent()).includes('62 date / shift rows') && (await reportPage.locator('#attExportCapacity').textContent()).includes('2 pages'), 'native report studio updates to two pages for 62 Day/Night shifts');
    const twoPdf=await exportFile(reportPage,'pdf','Two-shift-register'),twoBook=await exportFile(reportPage,'xlsx','Two-shift-register');
    check(/\/Type \/Pages[^\n]*\/Count 2\b/.test(twoPdf.toString('latin1')) && twoPdf.toString('latin1').includes('(556h 27m)'), 'native two-page PDF retains all 62 entries and the full elapsed total');
    check(twoBook.toString('utf8').includes('sheet name="Attendance register"') && twoBook.toString('utf8').includes('[h]:mm'), 'native workbook includes the styled primary register and numeric elapsed-hour formatting');
    for(const width of [390,320]){
      await reportPage.setViewportSize({width,height:844});
      check(await reportPage.evaluate(() => {const d=document.querySelector('.att-dialog'),h=d.querySelector('.modal-h').getBoundingClientRect(),f=d.querySelector('.modal-f').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth+1&&h.top>=0&&f.bottom<=innerHeight}), width+'px report studio fits without horizontal overflow and keeps both downloads visible');
      if(width===390)await screenshot(reportPage,'12-report-studio-mobile.png');
    }
    await reportPage.setViewportSize({width:1440,height:1000});await screenshot(reportPage,'13-report-studio-desktop.png');
    await reportPage.fill('#attEFrom','2026-01-01');await reportPage.locator('#attEFrom').dispatchEvent('change');await reportPage.fill('#attETo','2026-12-31');await reportPage.locator('#attETo').dispatchEvent('change');
    check(await reportPage.locator('#attExportPreview').getAttribute('data-state')==='too-large' && (await reportPage.locator('#attExportCapacity').textContent()).includes('Excel includes the complete selection'), 'large date range gives an honest two-page-capacity warning without hiding any details');
    const unexpected=[];reportPage.on('download',d=>unexpected.push(d));
    await reportPage.locator('[name="format"][value="pdf"]').click();await reportPage.waitForFunction(()=>document.querySelector('#attFormError')?.textContent.includes('2 readable PDF pages'));
    check(unexpected.length===0, 'oversized PDF refuses a misleading or third-page download with a clear shorter-range / Excel message');
    await exportFile(reportPage,'xlsx','Full-year-register');
    check(await reportPage.locator('#attFormError').textContent()==='' && await reportPage.evaluate((before)=>JSON.stringify({data:Hisaab.Store.data,disk:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])),dirty:Hisaab.Cloud.dirty})===before,beforeReports), 'previews, successful PDF/XLSX and oversized-PDF failure leave the full saved JSON/history/storage and cloud dirty flag unchanged');
  } finally { await b.close(); }
  // Separate browser process, not just another context: serverless Chromium's
  // single-process mode can share browser state between nominal contexts.
  const hindiBrowser = await browser();
  try {
    const page = await pageFor(hindiBrowser);
    await page.evaluate(() => { const A = Hisaab.attendance, m = A.saveManager({ name: "अजय कुमार", code: "M-HI", department: "प्रबंधक", defaultShift: "night", joinedOn: "2026-11-01" }); A.saveRecord({ managerId: m.id, date: "2026-11-08", shift: "night", mode: "time", checkIn: "21:00", checkOut: "06:00", outNextDay: true, breakMinutes: 60, note: "रात्रि पाली पूरी हुई" }); A.setDate("2026-11-14"); Hisaab.render(); });
    await click(page, '[data-att-act="export"]'); await page.fill("#attEManager", "अजय कुमार · M-HI"); await page.locator("#attEManager").press("Tab"); await page.fill("#attEFrom", "2026-11-01"); await page.fill("#attETo", "2026-11-30");
    const pdf = await exportFile(page, "pdf", "Hindi-manager"); await exportFile(page, "xlsx", "Hindi-manager");
    const nameHex = Buffer.from("अजय कुमार", "utf16le").swap16().toString("hex");
    check(pdf.toString("latin1").includes("/ActualText <FEFF" + nameHex + ">") && pdf.toString("latin1").includes("/Subtype /Image"), "Hindi PDF keeps shaped text images and the original Unicode name metadata");
    check(await page.evaluate(() => document.fonts.check('400 16px "Hisaab Indic"') && document.fonts.check('700 16px "Hisaab Indic"')), "both bundled Hindi font weights load without a font CDN");
    check(pdf.toString('latin1').includes('Sun, 08 Nov 2026') && pdf.toString('latin1').includes('(9h 00m)'), "Hindi report includes its Sunday and ignores the archived sixty-minute deduction");
    check(/\/Type \/Pages[^\n]*\/Count 1\b/.test(pdf.toString("latin1")), "native Hindi monthly report fits one page without losing shaped names or notes");
    await screenshot(page, "08-ready-report-links.png");
  } finally { await hindiBrowser.close(); }
  check(errors.length === 0, "no uncaught JavaScript errors in either real browser");
  console.log("\n✅ ATTENDANCE BROWSER: " + checks + " checks pass. Artifacts: " + OUT);
})().catch((error) => { console.error(error); console.error(errors); process.exitCode = 1; });
