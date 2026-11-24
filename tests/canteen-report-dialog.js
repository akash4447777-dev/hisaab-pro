/* Accept the real v3.31 From/To/Party form in legacy-output browser suites.
   Does not bypass validation or call a builder. Old archive pages remain one
   click; new filter suites fill/validate the form explicitly instead. */
const assert = require('node:assert/strict');
const actions = new Set(['ctPdfDay', 'ctPdfMonth', 'ctSharePdfDay', 'ctSharePdfMonth', 'ctPrintDay', 'ctPrintMonth']);
async function acceptCanteenReport(page, action) {
  if (!actions.has(action)) return;
  const current = (await page.locator('[data-ver]').first().textContent()) === '3.31';
  if (!await page.locator('#ctReportForm').count()) { assert.ok(!current, 'current Canteen export MUST offer date/party selection first'); return; }
  assert.equal(await page.locator('#ctReportForm input[type="date"]').count(), 2);
  assert.equal(await page.locator('#ctReportParty').count(), 1);
  const output = action.includes('Print') ? 'ctReportPrint' : action.includes('Share') ? 'ctReportShare' : 'ctReportDownload';
  await page.locator('[data-act="' + output + '"]').click();
  await page.waitForFunction(() => !document.querySelector('#ctReportForm') || !!document.querySelector('#ctReportFallback a'), null, { timeout: 20000 });
}
async function clickCanteenAction(page, selector) {
  await page.locator(selector).first().click();
  const match = /data-act="([^"]+)"/.exec(selector);
  if (match) await acceptCanteenReport(page, match[1]);
}
module.exports = { acceptCanteenReport, clickCanteenAction };
