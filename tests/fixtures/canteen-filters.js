/* Synthetic date × party intersections. Never use a real customer backup. */
const { fixture: base } = require('./canteen-pdf');
const copy = x => JSON.parse(JSON.stringify(x));
const FROM = '2026-10-31', TO = '2026-12-02', DATE = '2026-11-14';
const A = 'Gupta Kirana', B = 'Verma Dairy', FRESH = 'Saved without entries';
const item = (name, amount, qty = 500) => ({ name, qty, unit: qty === 500 ? 'gram' : 'pcs', priceMode: 'line', lineTotal: amount, rate: amount / qty });
const entry = (id, date, party, kind, amount, paid, items = [], extra = {}) => ({
  id, date, party, kind, mode: items.length ? 'itemized' : 'total', amount, paid, items,
  billNo: 'BILL-' + id, note: 'Original note ' + id, payMode: 'cash', photo: '', createdAt: 10, updatedAt: 11, ...extra
});
const entries = [
  entry('A-BEFORE', '2026-10-30', A, 'purchase', 901, 901, [item('EXCLUDED-A-BEFORE', 901)]),
  entry('B-BEFORE', '2026-10-30', B, 'expense', 902, 0),
  entry('A-START', FROM, A, 'purchase', 100.25, 25, [item('Hara dhaniya', 37.5), item('Hara dhaniya', 62.75)]),
  entry('B-START', FROM, B, 'purchase', 9000, 8999.5, [item('EXCLUDED-B-START', 9000)]),
  entry('A-MIDDLE', DATE, '  gUPTA   KIRANA  ', 'purchase', 50, 10, [item('Hara dhaniya', 50)]),
  entry('B-MIDDLE', DATE, B, 'sale', 7000, 7000, [item('EXCLUDED-B-MIDDLE', 7000)]),
  entry('A-EXPENSE', '2026-11-15', A, 'expense', 20.5, 0, [item('HIDDEN-LUMP-ITEM', 999)], { mode: 'total' }),
  entry('A-END', TO, A, 'sale', 80.75, 80.75, [item('Selected tea', 80.75, 3)]),
  entry('B-END', TO, B, 'expense', 6000, 0),
  entry('A-AFTER', '2026-12-03', A, 'purchase', 903, 903, [item('EXCLUDED-A-AFTER', 903)]),
  entry('UNASSIGNED', DATE, '', 'purchase', 13, 3),
  entry('SPACES-ONLY', '2026-11-16', '   ', 'purchase', 7, 0),
  entry('LITERAL-ALL', DATE, 'All parties', 'expense', 9, 0),
  entry('INVALID-DATE', '2026-11-31', A, 'purchase', 777777, 0, [item('INVALID-DATE-ITEM', 777777)]),
  entry('LEAP-DAY', '2024-02-29', A, 'purchase', 10, 10),
  entry('YEAR-END', '2026-12-31', A, 'purchase', 14, 4),
  entry('YEAR-START', '2027-01-01', A, 'purchase', 22, 2)
];
const fixture = copy(base);
fixture.settings = { ...fixture.settings, shopName: 'Filtered Report QA', ownerName: 'Authorised Owner', canteenParties: { 'p:gupta kirana': A, 'p:verma dairy': B, 'p:saved without entries': FRESH } };
fixture.canteen = { entries, rates: copy(base.canteen.rates), log: [], demo: false };
const idsA = ['A-START', 'A-MIDDLE', 'A-EXPENSE', 'A-END'];
const totalsA = { count: 4, purchase: 150.25, sale: 80.75, expense: 20.5, net: -90, paid: 115.75, balance: 135.75 };
module.exports = { FROM, TO, DATE, A, B, FRESH, fixture, entry, item, idsA, totalsA };
