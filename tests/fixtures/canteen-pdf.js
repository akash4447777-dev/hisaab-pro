/* Synthetic, isolated v3.30 report data. Never an actual customer account.
   Nonzero categories deliberately stay in saved entries and net calculations. */
const DATE = '2026-11-14';
const item = total => ({ name: 'Hara dhaniya', qty: 500, unit: 'gram', priceMode: 'line', lineTotal: total, rate: total / 500 });
const entry = (id, date, kind, amount, paid, extra = {}) => ({ id, date, kind, amount, paid, mode: 'total', party: 'Supplier ' + id, billNo: 'QA-' + id, items: [], createdAt: 1, updatedAt: 1, ...extra });
const fixture = {
  settings: { shopName: 'Canteen PDF QA', ownerName: 'Authorised Owner', address: 'Main Market, Delhi', phone: '1234567890', statementNote: 'Verify all original entries before payment.', demo: false },
  workers: [{ id: 'original-employee', name: 'Original Employee', type: 'monthly', rate: 18000, active: true }],
  records: [{ id: 'original-salary', workerId: 'original-employee', year: 2026, month: 10, presentDays: 24, absentDays: 2, advances: [], deductions: [], bonus: 200, status: 'pending' }],
  canteen: { demo: false, rates: [], log: [], entries: [
    entry('p1', DATE, 'purchase', 87.5, 37.5, { mode: 'itemized', items: [item(37.5), item(50)] }),
    entry('s1', DATE, 'sale', 250, 100),
    entry('e1', DATE, 'expense', 20, 20),
    entry('p2', '2026-11-15', 'purchase', 1000, 150),
    entry('e2', '2026-11-15', 'expense', 50, 0),
    entry('s2', '2026-11-16', 'sale', 100, 100),
    entry('e3', '2026-11-17', 'expense', 10, 10),
    entry('outside', '2026-10-31', 'purchase', 123456, 0)
  ] }
};
const columns = ['Date', 'Din', 'Entries', 'Saman', 'Net', 'Paid', 'Baki'];
// The existing dense-ledger ₹0-decimal display is intentional; exact two-decimal
// purchase/net values remain in the summary and closing, not recalculated here.
const monthRows = [
  ['14 Nov 2026', 'Sat', '3', '₹88', '₹143', '₹158', '₹200'],
  ['15 Nov 2026', 'Sun', '2', '₹1,000', '−₹1,050', '₹150', '₹900'],
  ['16 Nov 2026', 'Mon', '1', '₹0', '₹100', '₹100', '-'],
  ['17 Nov 2026', 'Tue', '1', '₹0', '−₹10', '₹10', '-']
];
const totalRow = ['Mahine ka total', '', '7', '₹1,088', '−₹818', '₹418', '₹1,100'];
module.exports = { DATE, fixture, columns, monthRows, totalRow, entry };
