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
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
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
    await click(page, '[data-att-act="recordAdd"]'); await page.fill("#attRManager", "Priya Mehta · M-002"); await page.locator("#attRManager").press("Tab"); await page.fill("#attRDate", "2026-11-14"); await page.selectOption("#attRShift", "night"); await click(page, '[data-att-act="recordMode"][data-value="time"]'); await page.fill("#attRIn", "2130"); await page.fill("#attROut", "0730"); await page.selectOption("#attROutDay", "1"); await page.fill("#attRBreak", "60");
    check((await page.locator("#attRIn").inputValue()) === "21:30", "mobile-style digits format into unambiguous 24-hour clocks");
    const preview = await page.locator("#attCalcPreview").textContent(); check(preview.includes("9h 00m"), "native overnight preview calculates working time: " + preview);
    await page.locator('#attRecordForm button[type="submit"]').click(); await page.waitForSelector("#attRecordForm", { state: "detached" });
    check(await page.evaluate(() => { const A = Hisaab.attendance, r = A.data().records.find((x) => x.shift === "night"); return A.calculate(r).overtimeMinutes === 60 && A.calculate(r).lateMinutes === 20; }), "night hours, overtime and grace are persisted correctly");
    // Prevent a duplicate through the real form, not just the public API.
    await click(page, '[data-att-act="recordAdd"]'); await page.fill("#attRManager", "Priya Mehta · M-002"); await page.locator("#attRManager").press("Tab"); await page.fill("#attRDate", "2026-11-14"); await page.selectOption("#attRShift", "night"); await page.locator('#attRecordForm button[type="submit"]').click();
    check((await page.locator("#attFormError").textContent()).includes("already exists"), "native duplicate submission stays open with a clear error");
    await click(page, '#modalRoot [data-act="closeModal"]');
    await page.evaluate(() => { const A = Hisaab.attendance; A.ui().shift = "day"; A.setDate("2026-11-15"); Hisaab.render(); });
    await click(page, '[data-att-act="bulk"]'); await page.selectOption("#attBStatus", "half"); await page.locator('#attBulkForm button[type="submit"]').click(); await page.waitForSelector("#attBulkForm", { state: "detached" });
    check(await page.evaluate(() => Hisaab.attendance.data().records.length === 3), "native bulk selection saves only the checked roster");
    await page.selectOption("#attShiftFilter", "all");
    await click(page, '[data-att-act="tab"][data-value="calendar"]');
    check(await page.locator(".att-cal-cell").count() === 42, "calendar renders the complete monthly grid");
    await screenshot(page, "02-calendar-desktop.png"); await click(page, '.att-cal-cell[data-date="2026-11-14"]');
    check(await page.locator(".att-person").count() === 2, "calendar day opens the editable daily board");
    await click(page, '[data-att-act="tab"][data-value="records"]'); await click(page, '[data-att-act="period"][data-value="custom"]'); await page.fill("#attFrom", "2026-11-14"); await page.locator("#attFrom").dispatchEvent("change"); await page.fill("#attTo", "2026-11-16"); await page.locator("#attTo").dispatchEvent("change");
    await click(page, '[data-att-act="export"]'); await page.fill("#attEManager", "Aarav Sharma · M-001"); await page.locator("#attEManager").press("Tab"); await page.fill("#attEFrom", "2026-11-14"); await page.fill("#attETo", "2026-11-16");
    const latin = await exportFile(page, "pdf", "Latin-manager"); await exportFile(page, "xlsx", "Latin-manager");
    check(latin.toString("latin1").includes("(2026-11-16)"), "custom final report date is present in the actual PDF"); await click(page, '#modalRoot [data-act="closeModal"]');
    // Extra profiles here are disposable QA fixtures, never production samples.
    await page.evaluate(() => { const A = Hisaab.attendance; ["Kabir Singh", "Neha Gupta", "Vikram Patel", "Riya Kapoor", "Arjun Verma", "Meera Nair"].forEach((name, i) => A.saveManager({ name, code: "QA-" + i, department: "Operations", defaultShift: i % 3 ? "day" : "night", joinedOn: "2026-11-01" })); A.ui().tab = "board"; A.ui().shift = "all"; A.ui().manager = "all"; A.ui().q = ""; A.setDate("2026-11-14"); Hisaab.render(); });
    await screenshot(page, "03-board-desktop.png", true);
    await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => Hisaab.render()); await screenshot(page, "04-board-mobile.png");
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "390px daily board has no page-level horizontal overflow");
    check(await page.locator('#nav [data-view="attendance"]').evaluate((el) => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }), "mobile navigation scrolls the active Attendance tab into view");
    await click(page, '[data-att-act="recordAdd"]'); await click(page, '[data-att-act="recordMode"][data-value="time"]'); await page.waitForTimeout(250); if (CAPTURE) await page.screenshot({ path: path.join(OUT, "05-time-form-mobile.png") });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "mobile time form fits the viewport"); await click(page, '#modalRoot [data-act="closeModal"]');
    await click(page, '[data-att-act="tab"][data-value="calendar"]'); await screenshot(page, "06-calendar-mobile.png"); check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "mobile calendar fits all seven weekdays");
    await page.setViewportSize({ width: 1440, height: 1000 }); await click(page, '[data-att-act="tab"][data-value="board"]'); await click(page, '[data-act="toggleThemeIcon"]'); await screenshot(page, "07-board-dark.png");
    const before = await page.evaluate(() => JSON.stringify(Hisaab.sync.view(Hisaab.Store.data).attendance)); await page.reload(); await page.waitForFunction(() => !!window.Hisaab); await page.evaluate(() => Hisaab.go("attendance")); check(await page.evaluate((value) => JSON.stringify(Hisaab.sync.view(Hisaab.Store.data).attendance) === value, before), "profiles, snapshots, records and history survive a real page reload");
  } finally { await b.close(); }
  // Separate browser process, not just another context: serverless Chromium's
  // single-process mode can share browser state between nominal contexts.
  const hindiBrowser = await browser();
  try {
    const page = await pageFor(hindiBrowser);
    await page.evaluate(() => { const A = Hisaab.attendance, m = A.saveManager({ name: "अजय कुमार", code: "M-HI", department: "प्रबंधक", defaultShift: "night", joinedOn: "2026-11-01" }); A.saveRecord({ managerId: m.id, date: "2026-11-14", shift: "night", mode: "time", checkIn: "21:00", checkOut: "06:00", outNextDay: true, breakMinutes: 60, note: "रात्रि पाली पूरी हुई" }); A.setDate("2026-11-14"); Hisaab.render(); });
    await click(page, '[data-att-act="export"]'); await page.fill("#attEManager", "अजय कुमार · M-HI"); await page.locator("#attEManager").press("Tab"); await page.fill("#attEFrom", "2026-11-01"); await page.fill("#attETo", "2026-11-30");
    const pdf = await exportFile(page, "pdf", "Hindi-manager"); await exportFile(page, "xlsx", "Hindi-manager");
    check(pdf.toString("latin1").includes("/ActualText <FEFF"), "Hindi PDF has extractable Unicode text, not dropped manager names");
    check(await page.evaluate(() => document.fonts.check('400 16px "Hisaab Indic"') && document.fonts.check('700 16px "Hisaab Indic"')), "both bundled Hindi font weights load without a font CDN");
    await screenshot(page, "08-ready-report-links.png");
  } finally { await hindiBrowser.close(); }
  check(errors.length === 0, "no uncaught JavaScript errors in either real browser");
  console.log("\n✅ ATTENDANCE BROWSER: " + checks + " checks pass. Artifacts: " + OUT);
})().catch((error) => { console.error(error); console.error(errors); process.exitCode = 1; });
