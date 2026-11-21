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
// Inspect the workbook actually downloaded by Chromium, using the browser's
// XML parser. This does not call the application's workbook builder again.
async function downloadedRegister(page, bytes) {
  const files = {}; let at = 0;
  while (bytes.readUInt32LE(at) === 0x04034b50) {
    assert.equal(bytes.readUInt16LE(at + 8), 0, 'stored ZIP entry');
    const size=bytes.readUInt32LE(at+18),nameSize=bytes.readUInt16LE(at+26),extra=bytes.readUInt16LE(at+28),start=at+30+nameSize+extra;
    files[bytes.subarray(at+30,at+30+nameSize).toString('utf8')]=bytes.subarray(start,start+size).toString('utf8');at=start+size;
  }
  return page.evaluate(files => {
    const parse=text=>new DOMParser().parseFromString(text,'application/xml'),doc=parse(files['xl/worksheets/sheet5.xml']),sty=parse(files['xl/styles.xml']);
    const parts=/^A(\d+):I(\d+)$/.exec(doc.querySelector('autoFilter').getAttribute('ref')),header=Number(parts[1]),last=Number(parts[2]),first=header+1;
    const get=(col,row)=>doc.querySelector('c[r="'+col+row+'"]')?.textContent||'';
    const metrics={};Array.from(doc.querySelectorAll('row')).filter(row=>Number(row.getAttribute('r'))<header).forEach(row=>Array.from(row.children).forEach((c,i,cells)=>{if(c.textContent&&cells[i+2])metrics[c.textContent]=cells[i+2].textContent;}));
    const style=sty.querySelector('cellXfs').children[Number(doc.querySelector('c[r="A'+first+'"]').getAttribute('s'))],border=sty.querySelector('borders').children[Number(style.getAttribute('borderId'))];
    return {header,count:last-header,headers:Array.from(doc.querySelector('row[r="'+header+'"]').children,c=>c.textContent),metrics,blankAdvance:Array.from({length:last-first+1},(_,i)=>get('E',first+i)).every(v=>v==='')&&get('E',last+1)==='',pane:doc.querySelector('pane').getAttribute('topLeftCell'),blackGrid:!!border.querySelector('color[rgb="FF374151"]'),fiveSheets:parse(files['xl/workbook.xml']).querySelectorAll('sheet').length===5};
  },files);
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
    const choices = ["Same day morning", "Same day afternoon", "Same day evening", "Same day night", "Next day morning", "Next day afternoon", "Next day evening", "Next day night"];
    for (const id of ["attRInWhen", "attROutWhen"]) check(JSON.stringify(await page.locator('#' + id + ' option').allTextContents()) === JSON.stringify(choices), id + " offers all eight same/next-day Morning/Afternoon/Evening/Night choices");
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
    check((await page.locator('#attFormError').textContent()).includes('time period'), "checkout before arrival stays open with a helpful day/period error");
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
    await click(page, '[data-att-act="recordMode"][data-value="time"]'); await page.fill('#attRIn', '12'); await page.selectOption('#attRInWhen', 'same-afternoon'); await page.fill('#attROut', '12'); await page.selectOption('#attROutWhen', 'next-night');
    check((await page.locator('#attTimeJourney').textContent()).includes('12 night = midnight · 12 afternoon = noon'), "12 o’clock displays a visible noon/midnight explanation");
    await saveForm(page, 'attRecordForm');
    check(await page.evaluate(() => { const A = Hisaab.attendance, r = A.data().records.find((r) => r.date === '2026-11-16'); return r.checkIn === '12:00' && r.checkOut === '00:00' && r.outNextDay && A.calculate(r).workedMinutes === 720; }), "12 afternoon to next-day 12 night saves noon-to-midnight, exactly 12 hours");
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
    await page.fill('#attRIn', '10:32'); await page.selectOption('#attRInWhen', 'same-morning'); await page.fill('#attROut', '1:33'); await page.selectOption('#attROutWhen', 'next-afternoon');
    check((await page.locator('#attCalcPreview').textContent()).includes('27h 01m') && (await page.locator('#attTimeJourney').textContent()).includes('6 Nov 2026 → 7 Nov 2026'), "screenshot's 6th morning → 7th afternoon correctly previews 27h 01m");
    await screenshot(page, '11-long-shift-form.png'); await saveForm(page, 'attRecordForm');
    check(await page.evaluate(() => { const A = Hisaab.attendance, r = A.data().records.find((r) => r.date === '2026-11-06'); return r && r.checkIn === '10:32' && r.checkOut === '13:33' && !r.inNextDay && r.outNextDay && r.breakMinutes === 0 && A.calculate(r).workedMinutes === 1621 && A.calculate(r).credit === 1 && A.calculate(r).overtimeMinutes === 0; }), "native Save persists the full 27h 01m with canonical clocks and no new target/deduction");
    await page.evaluate(() => { const A = Hisaab.attendance; A.openRecord(A.data().records.find((r) => r.date === '2026-11-06').id); });
    check(await page.evaluate(() => document.querySelector('#attRDate').value === '2026-11-06' && document.querySelector('#attRIn').value === '10:32' && document.querySelector('#attROut').value === '1:33' && document.querySelector('#attROutWhen').value === 'next-afternoon'), "long saved shift reopens with its correct next-day afternoon label without changing its saved time");
    await page.selectOption('#attROutWhen', 'same-night'); await page.locator('#attRecordForm button[type="submit"]').click();
    check((await page.locator('#attFormError').textContent()).includes('after check-in') && await page.evaluate(() => { const A = Hisaab.attendance; return A.calculate(A.data().records.find((r) => r.date === '2026-11-06')).workedMinutes === 1621; }), "removing the 24-hour cap does not allow a reversed edit to overwrite the saved entry");
    await page.selectOption('#attROutWhen', 'next-afternoon'); await saveForm(page, 'attRecordForm');
    await page.evaluate(() => { const A = Hisaab.attendance; A.openExport(A.data().managers.find((m) => m.code === 'M-001').id); });
    await page.fill('#attEFrom', '2026-11-06'); await page.fill('#attETo', '2026-11-07');
    const longShift = await exportFile(page, 'pdf', 'Long-shift-manager'); await exportFile(page, 'xlsx', 'Long-shift-manager');
    check(['(27h 01m)', '(10:32 morning)', '(1:33 afternoon +1d *)'].every((text) => longShift.toString('latin1').includes(text)), "native long-shift PDF includes full actual hours and the chosen next-day period");
    check(await page.evaluate((before) => JSON.stringify({ workers: Hisaab.Store.data.workers, records: Hisaab.Store.data.records, canteen: Hisaab.Store.data.canteen }) === before, financeBeforeLongShift), "long shift, re-edit and report downloads leave salary/canteen data unchanged");
    await click(page, '#modalRoot [data-act="closeModal"]');
    // A short actual Sunday shift is Present without an hours threshold.
    await page.evaluate(() => { const A = Hisaab.attendance; A.openRecord(null, A.data().managers.find((m) => m.code === 'M-002').id, '2026-11-15', 'night'); });
    await click(page, '[data-att-act="recordMode"][data-value="time"]');
    check(await page.locator('#attRBreak, #attRStandard, #attRHalf, [data-att-act="recordDefaults"]').count() === 0, "time editor has no break/target inputs or fixed-clock preset");
    await page.fill('#attRIn', '1:15'); await page.selectOption('#attRInWhen', 'same-afternoon'); await page.fill('#attROut', '5'); await page.selectOption('#attROutWhen', 'same-evening');
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
    check(['(9:30 night)', '(7:30 morning +1d *)', '+1d = next day'].every((text) => overnight.toString('latin1').includes(text)) && !overnight.toString('latin1').includes('(21:30)'), "downloaded overnight PDF shows compact 12-hour clocks with full morning/night and explicit next-day markers");
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
    const monthPdf = await exportFile(reportPage, 'pdf', 'Monthly-register'), monthBook = await exportFile(reportPage, 'xlsx', 'Monthly-register');
    const monthRegister=await downloadedRegister(reportPage,monthBook);
    check(monthRegister.header>10&&monthRegister.metrics['Total present days']==='31'&&monthRegister.metrics['Leave days (0 marks)']==='0'&&monthRegister.metrics['Sundays actually attended']==='4','native Excel download has present days, leaves and actual Sunday count ABOVE the date register');
    check(JSON.stringify(monthRegister.headers.slice(0,5))===JSON.stringify(['Date','Lokesh Verma\nAttendance','Check-in time','Check-out time','Advance'])&&monthRegister.blackGrid&&monthRegister.blankAdvance,'native Excel matches reference column order/black grid and never invents Advance amounts');
    check(monthRegister.fiveSheets&&monthRegister.count===31,'native reference-format workbook still has every selected date and all five detail sheets');
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
    const twoRegister=await downloadedRegister(reportPage,twoBook);check(twoRegister.count===62&&twoRegister.metrics['Total present days']==='31'&&twoRegister.metrics['Present shifts']==='62','native two-shift month preserves all 62 rows without double-counting the 31 present days');
    for(const width of [390,320]){
      await reportPage.setViewportSize({width,height:844});
      // Native resize/CSS layout is asynchronous; don't sample the previous
      // viewport's dialog frame immediately after setViewportSize resolves.
      const fit = await reportPage.waitForFunction(() => {const d=document.querySelector('.att-dialog'),h=d.querySelector('.modal-h').getBoundingClientRect(),f=d.querySelector('.modal-f').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth+1&&h.top>=0&&f.bottom<=innerHeight}, null, {timeout:5000});
      check(await fit.jsonValue(), width+'px report studio fits without horizontal overflow and keeps both downloads visible'); await fit.dispose();
      if(width===390)await screenshot(reportPage,'12-report-studio-mobile.png');
    }
    await reportPage.setViewportSize({width:1440,height:1000});await screenshot(reportPage,'13-report-studio-desktop.png');
    await reportPage.fill('#attEFrom','2026-01-01');await reportPage.locator('#attEFrom').dispatchEvent('change');await reportPage.fill('#attETo','2026-12-31');await reportPage.locator('#attETo').dispatchEvent('change');
    check(await reportPage.locator('#attExportPreview').getAttribute('data-state')==='too-large' && (await reportPage.locator('#attExportCapacity').textContent()).includes('Excel includes the complete selection'), 'large date range gives an honest two-page-capacity warning without hiding any details');
    const unexpected=[];reportPage.on('download',d=>unexpected.push(d));
    await reportPage.locator('[name="format"][value="pdf"]').click();await reportPage.waitForFunction(()=>document.querySelector('#attFormError')?.textContent.includes('2 readable PDF pages'));
    check(unexpected.length===0, 'oversized PDF refuses a misleading or third-page download with a clear shorter-range / Excel message');
    const fullYearBook=await exportFile(reportPage,'xlsx','Full-year-register'),fullYearRegister=await downloadedRegister(reportPage,fullYearBook);check(fullYearRegister.count===396&&fullYearRegister.header>25&&fullYearRegister.pane==='C4','native full-year workbook keeps its complete summary/396 rows without freezing the long summary over the table');
    check(await reportPage.locator('#attFormError').textContent()==='' && await reportPage.evaluate((before)=>JSON.stringify({data:Hisaab.Store.data,disk:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])),dirty:Hisaab.Cloud.dirty})===before,beforeReports), 'previews, successful PDF/XLSX and oversized-PDF failure leave the full saved JSON/history/storage and cloud dirty flag unchanged');
    // User-requested extension, exercised through real forms. The shell/CSS is unchanged.
    const featurePage=await pageFor(b);
    await addManager(featurePage,'Shift Manager','FOUR-01','morning');
    check(await featurePage.evaluate(()=>Hisaab.attendance.data().managers[0].defaultShift==='morning'),'Morning profile is saved with its own shift key');
    const clocks=[['morning','6','same-morning','10','same-morning'],['afternoon','12','same-afternoon','4','same-afternoon'],['evening','5','same-evening','11:46','same-night'],['night','9','same-night','6','next-morning']];
    async function saveShift(day,shift,ins,iw,outs,ow){await featurePage.evaluate(({day,shift})=>{const A=Hisaab.attendance;A.openRecord(null,A.data().managers[0].id,'2026-11-'+day,shift);},{day,shift});await click(featurePage,'[data-att-act="recordMode"][data-value="time"]');await featurePage.fill('#attRIn',ins);await featurePage.selectOption('#attRInWhen',iw);await featurePage.fill('#attROut',outs);await featurePage.selectOption('#attROutWhen',ow);await saveForm(featurePage,'attRecordForm');}
    for(const [shift,ins,iw,outs,ow]of clocks){await saveShift('14',shift,ins,iw,outs,ow);check(await featurePage.evaluate(shift=>Hisaab.attendance.data().records.some(r=>r.shift===shift),shift),'real '+shift+' time form preserves its shift');}
    check(await featurePage.evaluate(()=>{const A=Hisaab.attendance;return A.data().records.length===4&&A.bonus(A.data().managers[0].id,'2026-11-01','2026-11-30')[0].count===2;}),'Evening 11:46 PM and next-morning Night OUT count; Morning/Afternoon OUTs do not');
    await saveShift('15','evening','5','same-evening','11:46','same-night');
    check(await featurePage.evaluate(()=>{const A=Hisaab.attendance;return A.bonus(A.data().managers[0].id,'2026-11-01','2026-11-30')[0].percent===1;}),'third qualifying OUT automatically earns the first 1%');
    await saveShift('16','evening','5','same-evening','11:46','same-night');await saveShift('17','evening','5','same-evening','11:46','same-night');await saveShift('18','evening','5','same-evening','11:45','same-night');
    check(await featurePage.evaluate(()=>{const A=Hisaab.attendance,b=A.bonus(A.data().managers[0].id,'2026-11-01','2026-11-30')[0];return b.count===5&&b.percent===2;}),'five qualifying OUTs earn 2%; exactly 11:45 PM remains excluded');
    const beforeFeatureReports=await featurePage.evaluate(()=>{const A=Hisaab.attendance;A.openExport(A.data().managers[0].id);return JSON.stringify({data:Hisaab.Store.data,disk:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])),dirty:Hisaab.Cloud.dirty});});
    await featurePage.fill('#attEFrom','2026-11-14');await featurePage.fill('#attETo','2026-11-18');
    const fourPdf=await exportFile(featurePage,'pdf','Four-shift-manager'),fourBook=await exportFile(featurePage,'xlsx','Four-shift-manager');
    const fourRegister=await downloadedRegister(featurePage,fourBook);check(fourRegister.metrics['2026-11 · qualifying OUTs']==='5'&&fourRegister.metrics['2026-11 · extra bonus']==='0.02'&&fourRegister.metrics['Total present days']==='5','native Excel places five qualifying OUTs / genuine numeric 2% and five present days above all eight shift rows');
    check(['Morning','Afternoon','Evening','Night','EXTRA BONUS','5 qualifying OUTs','2% extra','11:45 PM'].every(t=>fourPdf.toString('latin1').includes(t)),'reference-style PDF contains every shift, qualifying OUT count, exact rule and 2% bonus');
    await featurePage.selectOption('#attEShift','morning');
    check(await featurePage.evaluate(()=>{const A=Hisaab.attendance,r=A.report(A.data().managers[0].id,'2026-11-14','2026-11-14','morning');return r.rows.length===1&&r.bonus[0].count===5&&r.bonus[0].percent===2;}),'partial/shift-filtered report retains the correct full-month all-shift bonus basis');
    await featurePage.selectOption('#attEShift','all');
    await featurePage.evaluate(()=>{window.__shared=[];Object.defineProperty(navigator,'canShare',{configurable:true,value:({files})=>files.length===1});Object.defineProperty(navigator,'share',{configurable:true,value:async payload=>{const f=payload.files[0];window.__shared.push({name:f.name,type:f.type,bytes:Array.from(new Uint8Array(await f.arrayBuffer()))});}});window.__opened=[];window.open=(...args)=>{window.__opened.push(args);return null;};});
    await featurePage.locator('[name="format"][value="whatsapp"]').click();await featurePage.waitForFunction(()=>window.__shared.length===1);
    const shared=await featurePage.evaluate(()=>window.__shared[0]);fs.writeFileSync(path.join(OUT,'WhatsApp-native.pdf'),Buffer.from(shared.bytes));
    check(shared.type==='application/pdf'&&shared.name.includes('Shift_Manager')&&Buffer.from(shared.bytes).subarray(0,8).toString()==='%PDF-1.4','WhatsApp action gives the native share API a real named manager PDF File, not a text URL');
    check(Buffer.from(shared.bytes).includes(Buffer.from('2% extra'))&&await featurePage.evaluate(()=>window.__opened.length===0),'native PDF sharing keeps the same calculated bonus and does not open a duplicate WhatsApp popup');
    await featurePage.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('Cancelled','AbortError');}}));
    await featurePage.locator('[name="format"][value="whatsapp"]').click();await featurePage.waitForFunction(()=>document.querySelector('#toast').textContent.includes('cancelled'));
    check(await featurePage.evaluate(()=>window.__opened.length===0),'native share cancellation does not pretend the PDF was sent or fall through to WhatsApp');
    await featurePage.evaluate(()=>Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false}));
    const fallbackDownload=featurePage.waitForEvent('download');await featurePage.locator('[name="format"][value="whatsapp"]').click();const downloaded=await fallbackDownload;await downloaded.saveAs(path.join(OUT,'WhatsApp-fallback.pdf'));
    check((await featurePage.locator('#attShareHint').textContent()).includes('not automatically attached or sent')&&await featurePage.locator('#attWhatsAppLink').getAttribute('href').then(v=>v.startsWith('https://wa.me/?text=')),'unsupported browser downloads the real PDF and clearly explains manual WhatsApp Document attachment');
    check(await featurePage.evaluate(before=>JSON.stringify({data:Hisaab.Store.data,disk:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])),dirty:Hisaab.Cloud.dirty})===before,beforeFeatureReports),'native/fallback/cancelled sharing and all bonus reports leave the complete stored JSON/history/financial data unchanged');
    await click(featurePage,'#modalRoot [data-act="closeModal"]');await featurePage.reload();await featurePage.waitForFunction(()=>!!window.Hisaab);
    check(await featurePage.evaluate(()=>{const A=Hisaab.attendance,b=A.bonus(A.data().managers[0].id,'2026-11-01','2026-11-30')[0];return A.data().records.length===8&&new Set(A.data().records.map(r=>r.shift)).size===4&&b.count===5&&b.percent===2;}),'real reload retains all four shift keys, eight original records and the derived 2% bonus');
    // Regression for the user's screenshot: these are the TWO CLOCK dropdowns,
    // not the independent shift selector. Use all eight actual day/period values.
    const periodPage=await pageFor(b);await addManager(periodPage,'Clock Period QA','CLK-01','day');
    const periodCases=[
      ['10:18','same-morning','1:33','same-afternoon','10:18','13:33',195],
      ['1:15','same-afternoon','6:30','same-evening','13:15','18:30',315],
      ['6:30','same-evening','11:46','same-night','18:30','23:46',316],
      ['11:30','same-night','1:33','next-night','23:30','01:33',123],
      ['1:33','next-night','6:30','next-morning','01:33','06:30',297],
      ['1:15','next-afternoon','6:30','next-evening','13:15','18:30',315]
    ];
    for(const [i,[ins,iw,outs,ow,canonicalIn,canonicalOut,minutes]]of periodCases.entries()){
      await periodPage.evaluate(day=>{const A=Hisaab.attendance;A.ui().mode='time';A.openRecord(null,A.data().managers[0].id,'2026-11-'+day,'day');},18+i);
      if(i===0){
        for(const id of ['attRInWhen','attROutWhen'])check(JSON.stringify(await periodPage.locator('#'+id+' option').allTextContents())===JSON.stringify(choices),'screenshot '+id+' includes Same/Next day Morning, Afternoon, Evening and Night');
      }
      await periodPage.fill('#attRIn',ins);await periodPage.selectOption('#attRInWhen',iw);await periodPage.fill('#attROut',outs);await periodPage.selectOption('#attROutWhen',ow);
      if(i===0&&CAPTURE){
        await periodPage.evaluate(()=>document.documentElement.setAttribute('data-theme','dark'));
        await screenshot(periodPage,'14-four-period-form-desktop.png');
        await periodPage.locator('#attROutWhen').click();await periodPage.screenshot({path:path.join(OUT,'15-four-period-dropdown-desktop.png')});await periodPage.keyboard.press('Escape');
      }
      await saveForm(periodPage,'attRecordForm');
      check(await periodPage.evaluate(({i,canonicalIn,canonicalOut,iw,ow,minutes})=>{const A=Hisaab.attendance,r=A.data().records.find(r=>r.date==='2026-11-'+(18+i));return r.checkIn===canonicalIn&&r.checkOut===canonicalOut&&r.inNextDay===iw.startsWith('next-')&&r.outNextDay===ow.startsWith('next-')&&A.calculate(r).workedMinutes===minutes;},{i,canonicalIn,canonicalOut,iw,ow,minutes}),'native '+ins+' '+iw+' → '+outs+' '+ow+' saves exact clocks, days and '+minutes+' minutes');
    }
    await periodPage.evaluate(()=>{const A=Hisaab.attendance;A.openRecord(A.data().records[0].id);});
    check(await periodPage.inputValue('#attROutWhen')==='same-afternoon'&&await periodPage.inputValue('#attROut')==='1:33','saved 13:33 reopens as 1:33 afternoon, never as early-morning Night');
    const beforeBadPeriod=await periodPage.evaluate(()=>JSON.stringify({data:Hisaab.Store.data,disk:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])),dirty:Hisaab.Cloud.dirty}));
    await periodPage.fill('#attROut','6');await periodPage.selectOption('#attROutWhen','same-night');await periodPage.locator('#attRecordForm button[type="submit"]').click();
    check((await periodPage.locator('#attFormError').textContent()).includes('does not match Night')&&await periodPage.evaluate(before=>JSON.stringify({data:Hisaab.Store.data,disk:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])),dirty:Hisaab.Cloud.dirty})===before,beforeBadPeriod),'native incompatible clock/period is refused without changing one byte of saved JSON/history/storage');
    await click(periodPage,'#modalRoot [data-act="closeModal"]');
    await periodPage.evaluate(()=>{const A=Hisaab.attendance;A.openRecord(null,A.data().managers[0].id,'2026-11-24','day');});
    await periodPage.fill('#attRIn','1:15');await periodPage.selectOption('#attRInWhen','same-afternoon');await periodPage.fill('#attROut','6:30');await periodPage.selectOption('#attROutWhen','same-evening');await periodPage.selectOption('#attRShift','night');
    check(await periodPage.inputValue('#attRInWhen')==='same-afternoon'&&await periodPage.inputValue('#attROutWhen')==='same-evening','changing the independent Shift selector never reinterprets either typed clock period');
    for(const width of [390,320]){
      await periodPage.setViewportSize({width,height:844});
      const fit = await periodPage.waitForFunction(()=>{const d=document.querySelector('.att-dialog'),h=d.querySelector('.modal-h').getBoundingClientRect(),f=d.querySelector('.modal-f').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth+1&&h.top>=0&&f.bottom<=innerHeight&&[...document.querySelectorAll('#attRInWhen,#attROutWhen')].every(s=>s.options.length===8)}, null, {timeout:5000});
      check(await fit.jsonValue(),width+'px form retains all eight clock choices without overflow; title and Save stay visible'); await fit.dispose();
      if(width===390)await screenshot(periodPage,'16-four-period-form-mobile.png');
    }
    // A real navigation from the historical release retains same-origin raw
    // storage. Never "fix" 13:33 into 01:33 when old labels become four periods.
    const legacyPage=await b.newPage({viewport:{width:1440,height:1000},locale:'en-IN',timezoneId:'Asia/Kolkata'});legacyPage.on('pageerror',e=>errors.push(e.stack));
    await legacyPage.goto(new globalThis.URL('Hisaab-Pro-v3.24.html',URL).href);await legacyPage.waitForFunction(()=>!!window.Hisaab);
    const legacySnapshot=await legacyPage.evaluate(()=>{const A=Hisaab.attendance,m=A.saveManager({name:'Original saved manager',code:'OLD-01',defaultShift:'day',joinedOn:'2026-11-01'});A.saveRecord({managerId:m.id,date:'2026-11-06',shift:'day',mode:'time',checkIn:'10:32',checkOut:'13:33',outNextDay:true,breakMinutes:60,note:'Do not reinterpret'});return JSON.stringify({data:Hisaab.Store.data,disk:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))});});
    await legacyPage.goto(URL);await legacyPage.waitForFunction(()=>!!window.Hisaab);
    check(await legacyPage.evaluate(before=>JSON.stringify({data:Hisaab.Store.data,disk:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))})===before,legacySnapshot),'real v3.24 → updated-page navigation preserves the complete original storage/history/financial payload byte-for-byte');
    await legacyPage.evaluate(()=>{const A=Hisaab.attendance;A.openRecord(A.data().records[0].id);});
    check(await legacyPage.inputValue('#attROutWhen')==='next-afternoon'&&(await legacyPage.locator('#attCalcPreview').textContent()).includes('27h 01m'),'legacy next-day 13:33 displays Afternoon with its original 27h 01m, not a silently changed 15h 01m');
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
