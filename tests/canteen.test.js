/* Hisaab Pro — Canteen module smoke test (jsdom) */
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const FILE = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, "..", "hisaab_v3.html");
const html = fs.readFileSync(FILE, "utf8");

const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errors.push("jsdomError: " + (e && e.message)));
vc.on("error", (...a) => errors.push("console.error: " + a.join(" ")));

function stubs(w) {
  w.print = () => {};
  w.scrollTo = () => {};
  w.URL.createObjectURL = () => "blob:fake";
  w.URL.revokeObjectURL = () => {};
}

const dom = new JSDOM(html, {
  runScripts: "dangerously", pretendToBeVisual: true,
  url: "https://example.com/hisaab_v3.html", virtualConsole: vc,
  beforeParse: stubs
});
const window = dom.window;

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

let fails = 0;
function ok(cond, label, extra) {
  if (cond) console.log("  \u2705 " + label);
  else { fails++; console.log("  \u274C " + label + (extra !== undefined ? "  \u2192 " + JSON.stringify(extra) : "")); }
}
function section(t) { console.log("\n\u25b8 " + t); }

const $ = (s) => window.document.querySelector(s);
const $$ = (s) => Array.from(window.document.querySelectorAll(s));
const root = () => window.document.getElementById("viewRoot");
const H = () => window.Hisaab;

function click(sel) {
  const el = typeof sel === "string" ? $(sel) : sel;
  if (!el) throw new Error("click: element not found -> " + sel);
  el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  return el;
}
function setName(sel, val) { setInput(sel, val); $(sel).dispatchEvent(new window.Event("change", { bubbles: true })); }
function setInput(sel, val, evt) {
  const el = typeof sel === "string" ? $(sel) : sel;
  if (!el) throw new Error("setInput: not found -> " + sel);
  el.value = val;
  el.dispatchEvent(new window.Event(evt || "input", { bubbles: true }));
  return el;
}
const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

(async function run() {
  await wait(350);

  section("Boot");
  ok(!!window.Hisaab, "window.Hisaab exposed");
  ok(!!H().canteen, "canteen API exposed");
  ok(!!$('[data-view="canteen"]'), "sidebar me Canteen button hai");
  ok(H().Store.data.canteen && Array.isArray(H().Store.data.canteen.entries), "Store.data.canteen bana");
  ok(H().Store.data.canteen.entries.length > 0, "sample canteen entries load hui (" + H().Store.data.canteen.entries.length + ")");
  ok(H().Store.data.workers.length === 4, "workers safe (4 demo)");
  const verEl = $("[data-ver]");
  ok(verEl && verEl.textContent === "3.4", "version badge 3.4", verEl && verEl.textContent);
  ok(root().innerHTML.indexOf("Canteen") >= 0, "dashboard par canteen card dikha");
  ok(root().innerHTML.indexOf("Saman aaya") >= 0, "dashboard canteen strip me 'Saman aaya'");

  section("Canteen view \u2014 sab tabs render");
  H().go("canteen");
  ok($("#viewTitle").textContent === "Canteen", "title = Canteen");
  ok($(".topbar-actions .btn.primary").textContent.indexOf("Canteen entry") >= 0, "topbar button canteen entry ban gaya");
  ["day", "month", "entries", "rates", "activity"].forEach((t) => {
    H().UI.ct.tab = t; H().render();
    const h = root().innerHTML;
    ok(h.length > 500, t + " tab render hua (" + h.length + " chars)");
    ok(h.indexOf("undefined") < 0, t + " tab me 'undefined' nahi");
    ok(h.indexOf("NaN") < 0, t + " tab me 'NaN' nahi");
  });
  H().go("hisaab");
  await wait(10);
  ok($(".topbar-actions .btn.primary").textContent.indexOf("Add Worker") >= 0, "wapis jaane par topbar button 'Add Worker'");
  H().go("canteen");

  section("Din ka ledger \u2014 math");
  const todayIso = iso(new Date());
  H().UI.ct.tab = "day"; H().UI.ct.date = todayIso; H().render();
  const dt = H().canteen.totals(H().canteen.onDate(todayIso));
  ok(dt.net === Math.round((dt.sale - dt.purchase - dt.expense) * 100) / 100, "net = sale - purchase - expense", dt);
  ok(root().innerHTML.indexOf("Din ka net") >= 0, "'Din ka net' KPI dikha");
  ok(root().innerHTML.indexOf("Saman item-wise") >= 0, "item-wise saman card dikha");
  ok(root().innerHTML.indexOf("Ek-saath total") >= 0 || root().innerHTML.indexOf("total likha hai") >= 0,
     "total-mode entry ka note dikha");

  section("Item-wise (rate) entry add karo");
  click('[data-act="ctAdd"]');
  ok(!!$("#ctKindSeg"), "entry modal khula");
  ok($$("#ctItemsWrap .ct-row").length === 1, "ek item line default");
  setInput("#ctParty", "Test Supplier");
  setName('[data-ct-item="0"][data-ct-f="name"]', "Aata");
  setInput('[data-ct-item="0"][data-ct-f="qty"]', "10");
  setInput('[data-ct-item="0"][data-ct-f="rate"]', "45");
  click('[data-act="ctAddItem"]');
  ok($$("#ctItemsWrap .ct-row").length === 2, "dusri item line add hui");
  ok($('[data-ct-item="0"][data-ct-f="name"]').value === "Aata", "pehli line ka data repaint ke baad bhi hai");
  setName('[data-ct-item="1"][data-ct-f="name"]', "Cheeni");
  setInput('[data-ct-item="1"][data-ct-f="qty"]', "5");
  setInput('[data-ct-item="1"][data-ct-f="rate"]', "48");
  ok($("#ctTotalBig").textContent.replace(/,/g, "").indexOf("690") >= 0, "modal total = 10x45 + 5x48 = 690", $("#ctTotalBig").textContent);
  setInput("#ctPaid", "500");
  ok($("#ctBal").value.replace(/[^\d.]/g, "") === "190.00" || $("#ctBal").value.indexOf("190") >= 0, "baki 190 dikha", $("#ctBal").value);
  click('[data-act="ctSave"]');
  await wait(40);
  const added = H().canteen.entries().filter((e) => e.party === "Test Supplier");
  ok(added.length === 1, "entry save hui");
  ok(added[0] && added[0].amount === 690, "amount 690", added[0] && added[0].amount);
  ok(added[0] && added[0].paid === 500 && added[0].mode === "itemized", "paid 500 / mode itemized");
  ok(H().canteen.data().rates.some((r) => r.name === "Cheeni" && r.rate === 48), "rate list me Cheeni auto-add (48)");
  ok(H().canteen.data().rates.some((r) => r.name === "Aata" && r.rate === 45), "rate list me Aata update (45)");

  section("Ek-saath TOTAL mode entry (bina item rate)");
  click('[data-act="ctAdd"]');
  click('[data-act="ctSetMode"][data-mode="total"]');
  ok(!!$("#ctLump"), "lump-sum total input dikha");
  ok($$('#ctItemsWrap input[disabled]').length >= 1, "rate column disabled (total mode)");
  setInput("#ctLump", "3450");
  setInput("#ctParty", "Kirana Bhaiya");
  setInput('[data-ct-item="0"][data-ct-f="name"]', "Tel namak masala");
  setInput('[data-ct-item="0"][data-ct-f="qty"]', "1");
  ok($("#ctTotalBig").textContent.replace(/,/g, "").indexOf("3450") >= 0, "total 3450 dikha", $("#ctTotalBig").textContent);
  click('[data-act="ctPayFull"]');
  click('[data-act="ctSave"]');
  await wait(40);
  const lump = H().canteen.entries().filter((e) => e.party === "Kirana Bhaiya");
  ok(lump.length === 1 && lump[0].amount === 3450 && lump[0].mode === "total", "lump entry 3450 / total mode");
  ok(lump[0].paid === 3450, "poora paid");
  ok(!H().canteen.data().rates.some((r) => /tel namak/i.test(r.name)), "total-mode item rate list me nahi gaya");

  section("Line-total price mode \u2014 4 kg Maggi = \u20b9360 (poori line ka daam)");
  click('[data-act="ctAdd"]');
  ok(!!$('[data-ct-item="0"][data-ct-f="priceMode"]'), "har line par price-mode select hai");
  ok($('[data-ct-item="0"][data-ct-f="priceMode"]').value === "line", "nayi khaali line ka default = \u20b9 poori line");
  setInput('[data-ct-item="0"][data-ct-f="name"]', "Maggi Test Pack");
  setInput('[data-ct-item="0"][data-ct-f="qty"]', "4");
  setInput("#ctParty", "Line Test");
  ok($('[data-ct-item="0"][data-ct-f="priceMode"]').value === "line",
     "rate list me naye item par line mode hi rahe (auto-flip nahi)");
  /* per-unit flow select se: */
  const pm0 = $('[data-ct-item="0"][data-ct-f="priceMode"]');
  pm0.value = "unit";
  pm0.dispatchEvent(new window.Event("change", { bubbles: true }));
  await wait(20);
  ok(!!$('[data-ct-item="0"][data-ct-f="rate"]'), "unit mode me rate input wapas");
  /* purana galat behaviour confirm: unit mode me 4 x 360 = 1440 */
  setInput('[data-ct-item="0"][data-ct-f="rate"]', "360");
  ok($("#ctTotalBig").textContent.replace(/,/g, "").indexOf("1440") >= 0,
     "unit mode me 4 x 360 = 1440 (purana hisaab)", $("#ctTotalBig").textContent);
  /* ab poori line chuno */
  const pmSel = $('[data-ct-item="0"][data-ct-f="priceMode"]');
  pmSel.value = "line";
  pmSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  await wait(20);
  ok(!!$('[data-ct-item="0"][data-ct-f="lineTotal"]'), "line mode me price input lineTotal se juda");
  ok($('[data-ct-item="0"][data-ct-f="lineTotal"]').value === "1440", "purana amount carry hua (1440)");
  setInput('[data-ct-item="0"][data-ct-f="lineTotal"]', "360");
  ok($("#ctTotalBig").textContent.replace(/,/g, "").indexOf("360") >= 0,
     "entry total ab 360 hai (1440 nahi)", $("#ctTotalBig").textContent);
  const amtCell = $('.ct-row .amt');
  ok(amtCell.textContent.indexOf("360") >= 0, "row amount 360", amtCell.textContent);
  ok(amtCell.textContent.indexOf("90") >= 0, "per-unit rate 360/4 = 90 dikha", amtCell.textContent);
  setInput("#ctPaid", "360");
  click('[data-act="ctSave"]');
  await wait(40);
  const mag = H().canteen.entries().find((e) => e.party === "Line Test");
  ok(!!mag, "line-mode entry save hui");
  ok(mag && mag.amount === 360, "entry amount 360 (4x360 nahi)", mag && mag.amount);
  const mi = mag && mag.items.find((i) => i.name === "Maggi Test Pack");
  ok(mi && mi.priceMode === "line" && mi.lineTotal === 360, "item par priceMode=line, lineTotal=360", mi);
  ok(mi && mi.rate === 90, "per-unit rate 90 derive hua", mi && mi.rate);
  ok(H().canteen.data().rates.some((r) => r.name === "Maggi Test Pack" && r.rate === 90),
     "rate list me 90/kg gaya (360 nahi)");
  /* edit karke wapas kholo */
  H().canteen.openModal(mag.id);
  await wait(20);
  ok($('[data-ct-item="0"][data-ct-f="priceMode"]').value === "line", "edit me line mode selected");
  ok(String($('[data-ct-item="0"][data-ct-f="lineTotal"]').value) === "360", "edit me 360 dikha");
  const pm2 = $('[data-ct-item="0"][data-ct-f="priceMode"]');
  pm2.value = "unit";
  pm2.dispatchEvent(new window.Event("change", { bubbles: true }));
  await wait(20);
  ok(String($('[data-ct-item="0"][data-ct-f="rate"]').value) === "90", "unit mode par rate 90 aaya");
  ok($("#ctTotalBig").textContent.replace(/,/g, "").indexOf("360") >= 0, "amount 360 hi raha (4 x 90)");
  click('[data-act="closeModal"]');
  /* day ledger me item-wise table me per-unit avg 90 */
  H().UI.ct.tab = "day"; H().UI.ct.date = mag.date; H().render();
  ok(root().innerHTML.indexOf("90") >= 0, "din ke item-wise table me 90/kg dikha");
  ok(root().innerHTML.indexOf("\u03a3") >= 0, "line-total wali line par \u03a3 chip");

  section("Gram / chhota unit \u2014 600 gram = \u20b945 (poori line, 27,000 nahi)");
  click('[data-act="ctAdd"]');
  ok(!!$('[data-ct-item="0"][data-ct-f="lineTotal"]'), "khaali line par price input = poori line wala");
  setName('[data-ct-item="0"][data-ct-f="name"]', "Pudina leaves");
  setInput('[data-ct-item="0"][data-ct-f="qty"]', "600");
  const u0 = $('[data-ct-item="0"][data-ct-f="unit"]');
  u0.value = "gram";
  u0.dispatchEvent(new window.Event("change", { bubbles: true }));
  await wait(20);
  ok($('.ct-row .ct-pm option[value="unit"]').textContent.indexOf("gram") >= 0, "mode select ka label \u20b9 / gram hua");
  setInput('[data-ct-item="0"][data-ct-f="lineTotal"]', "45");
  const t45 = $("#ctTotalBig").textContent;
  ok(t45.replace(/,/g, "").indexOf("45") >= 0 && t45.indexOf("27,000") < 0,
     "total \u20b945 hai (600 x 45 = 27,000 nahi)", t45);
  const ac = $('.ct-row .amt');
  ok(ac.textContent.indexOf("45") >= 0 && ac.textContent.indexOf("0.075") >= 0,
     "amount 45 + neeche = \u20b90.075/gram", ac.textContent);
  setInput("#ctParty", "Gram Test");
  click('[data-act="ctSave"]');
  await wait(40);
  const ge = H().canteen.entries().find((e) => e.party === "Gram Test");
  ok(ge && ge.amount === 45, "entry amount 45", ge && ge.amount);
  const gi = ge && ge.items[0];
  ok(gi && gi.lineTotal === 45 && gi.rate === 0.075 && gi.priceMode === "line",
     "item: lineTotal 45, per-unit 0.075/gram (round nahi toda)", gi);
  ok(H().canteen.data().rates.some((r) => r.name === "Pudina leaves" && r.rate === 0.075),
     "rate list me Pudina leaves 0.075/gram");
  /* agni baar naam likhte hi per-unit auto-fill + mode flip */
  click('[data-act="ctAdd"]');
  setName('[data-ct-item="0"][data-ct-f="name"]', "Pudina leaves");
  await wait(20);
  ok($('[data-ct-item="0"][data-ct-f="priceMode"]').value === "unit",
     "rate list me mile item par line apne aap \u20b9 / unit par pali");
  ok(String($('[data-ct-item="0"][data-ct-f="rate"]').value) === "0.075", "rate 0.075 auto-fill",
     $('[data-ct-item="0"][data-ct-f="rate"]').value);
  setInput('[data-ct-item="0"][data-ct-f="qty"]', "600");
  const u1 = $('[data-ct-item="0"][data-ct-f="unit"]');
  ok(u1.value === "gram", "unit gram auto-fill", u1.value);
  ok($("#ctTotalBig").textContent.replace(/,/g, "").indexOf("45") >= 0,
     "600 x 0.075 = 45 total", $("#ctTotalBig").textContent);
  click('[data-act="closeModal"]');

  section("Validation \u2014 khaali entry");
  click('[data-act="ctAdd"]');
  click('[data-act="ctSave"]');
  await wait(20);
  ok(!!$("#ctKindSeg"), "khaali entry save nahi hui (modal khula raha)");
  ok($("#toast").textContent.length > 3, "toast warning: " + $("#toast").textContent);
  click('[data-act="closeModal"]');
  ok(!$("#overlay"), "modal band hua");

  section("Validation \u2014 item likha par rate nahi");
  click('[data-act="ctAdd"]');
  setInput('[data-ct-item="0"][data-ct-f="name"]', "Bina rate");
  setInput('[data-ct-item="0"][data-ct-f="qty"]', "4");
  click('[data-act="ctSave"]');
  await wait(20);
  ok(!!$("#ctKindSeg") && $("#toast").textContent.indexOf("total") >= 0,
     "rate ke bina rok diya + total mode ka hint", $("#toast").textContent);
  click('[data-act="closeModal"]');

  section("Bikri (sale) \u2192 din ka net");
  const before = H().canteen.totals(H().canteen.onDate(todayIso));
  H().canteen.openModal(null, todayIso);
  click('[data-act="ctSetKind"][data-kind="sale"]');
  click('[data-act="ctSetMode"][data-mode="total"]');
  setInput("#ctLump", "1000");
  setInput("#ctPaid", "1000");
  setInput("#ctParty", "Counter bikri");
  click('[data-act="ctSave"]');
  await wait(40);
  const after = H().canteen.totals(H().canteen.onDate(todayIso));
  ok(after.sale === before.sale + 1000, "bikri +1000 judi", { before: before.sale, after: after.sale });
  ok(after.net === before.net + 1000, "din ka net +1000", { before: before.net, after: after.net });

  section("Payment \u2014 baki chukta");
  const withBal = H().canteen.entries().find((e) => e.party === "Test Supplier");
  const balBefore = Math.round((withBal.amount - withBal.paid) * 100) / 100;
  H().UI.ct.tab = "day"; H().UI.ct.date = withBal.date; H().render();
  click('[data-act="ctPay"][data-id="' + withBal.id + '"]');
  ok(!!$("#ctPayAmt"), "payment modal khula");
  ok(Math.abs(Number($("#ctPayAmt").value) - balBefore) < 0.01, "baki amount prefilled (" + balBefore + ")", $("#ctPayAmt").value);
  setInput("#ctPayAmt", String(balBefore));
  click('[data-act="ctPaySave"]');
  await wait(40);
  const e2 = H().canteen.entries().find((e) => e.party === "Test Supplier");
  ok(e2.paid === e2.amount, "baki zero ho gaya", { paid: e2.paid, amount: e2.amount });
  ok(H().canteen.data().log.some((l) => l.action === "payment"), "payment activity log me darj hua");

  section("Delete \u2192 Undo");
  H().UI.ct.tab = "entries"; H().render();
  const target = H().canteen.entries().find((e) => e.party === "Kirana Bhaiya");
  ok(!!$('[data-act="ctDel"][data-id="' + target.id + '"]'), "entries table me delete button");
  const nBefore = H().canteen.entries().length;
  click('[data-act="ctDel"][data-id="' + target.id + '"]');
  ok(!!$("#cfmOk"), "confirm dialog aaya");
  click("#cfmOk");
  await wait(40);
  ok(H().canteen.entries().length === nBefore - 1, "entry delete hui");
  ok(!!$('[data-act="doUndo"]'), "toast me Undo link");
  click('[data-act="doUndo"]');
  await wait(40);
  ok(H().canteen.entries().length === nBefore, "Undo se entry wapas aa gayi");

  section("Activity log + Restore");
  H().UI.ct.logScope = "all"; H().UI.ct.tab = "activity"; H().render();
  const logCount = H().canteen.data().log.length;
  ok(logCount > 8, "activity log me events hain (" + logCount + ")");
  const ah = root().innerHTML;
  ok(ah.indexOf("deleted") >= 0, "delete event dikha");
  ok(ah.indexOf("payment") >= 0 || ah.indexOf("Payment") >= 0, "payment event dikha");
  ok(ah.indexOf("Restore") < 0, "undo ke baad Restore button nahi (entry maujood hai) — sahi");
  const t2 = H().canteen.entries().find((e) => e.party === "Kirana Bhaiya");
  H().UI.ct.tab = "entries"; H().render();
  const nA = H().canteen.entries().length;
  click('[data-act="ctDel"][data-id="' + t2.id + '"]');
  click("#cfmOk");
  await wait(40);
  ok(H().canteen.entries().length === nA - 1, "dobara delete hui");
  H().UI.ct.tab = "activity"; H().render();
  const rb = $('[data-act="ctRestore"]');
  ok(!!rb, "Activity me Restore button mila");
  if (rb) { click(rb); await wait(40); ok(H().canteen.entries().length === nA, "Restore se entry wapas aa gayi"); }

  section("Duplicate entry");
  H().UI.ct.tab = "entries"; H().render();
  const src1 = H().canteen.entries().find((e) => e.party === "Test Supplier");
  click('[data-act="ctDup"][data-id="' + src1.id + '"]');
  await wait(20);
  ok(!!$("#ctKindSeg"), "duplicate ka modal khula");
  ok($("#ctParty").value === "Test Supplier", "party copy hui");
  ok($("#ctDateM").value === todayIso, "date aaj ho gayi");
  ok($("#ctPaid").value === "" || Number($("#ctPaid").value) === 0, "paid reset (0)");
  click('[data-act="ctSave"]');
  await wait(40);
  ok(H().canteen.entries().filter((e) => e.party === "Test Supplier").length === 2, "duplicate save hui");

  section("Mahine ka ledger");
  H().UI.ct.tab = "month"; H().render();
  const mh = root().innerHTML;
  ok(mh.indexOf("Din-wise ledger") >= 0, "din-wise ledger table");
  ok(mh.indexOf("6 mahine ka trend") >= 0, "6-month trend chart");
  ok(mh.indexOf("Item-wise summary") >= 0, "item-wise summary");
  ok(mh.indexOf("Party / supplier-wise") >= 0, "party-wise summary");
  ok(mh.indexOf("ct-2bar") >= 0, "grouped bars render hue");
  ok(mh.indexOf("Mahine ka total") >= 0, "tfoot me mahine ka total");
  const drow = $('[data-act="ctOpenDay"]');
  ok(!!drow, "din ki row clickable");
  if (drow) { click(drow); await wait(20); ok(H().UI.ct.tab === "day", "row click \u2192 day ledger khula"); }

  section("Din badalna (prev/next/aaj)");
  const d0 = H().UI.ct.date;
  click('[data-act="ctDayShift"][data-d="-1"]');
  ok(H().UI.ct.date === iso(new Date(new Date(d0 + "T12:00:00").getTime() - 86400000)), "pichhla din", H().UI.ct.date);
  click('[data-act="ctDayShift"][data-d="1"]');
  ok(H().UI.ct.date === d0, "agla din wapas");
  click('[data-act="ctGoToday"]');
  ok(H().UI.ct.date === todayIso, "Aaj button");
  setInput("#ctDatePick", todayIso, "change");
  await wait(20);
  ok(H().UI.ct.date === todayIso, "date picker se din chuna");

  section("Entries tab \u2014 filter & search");
  H().UI.ct.tab = "entries"; H().render();
  ok(!!$("#ctSearch"), "search box hai");
  ok($("#ctEntriesBody").innerHTML.indexOf("Test Supplier") >= 0, "list me party dikhi");
  setInput("#ctSearch", "kirana");
  await wait(20);
  ok($("#ctEntriesBody").innerHTML.indexOf("Test Supplier") < 0, "search se filter hua");
  ok($("#ctSearch").value === "kirana", "search value preserved (focus nahi toota)");
  setInput("#ctSearch", "");
  await wait(20);
  setInput("#ctKindSel", "sale", "change");
  await wait(20);
  ok(H().UI.ct.kind === "sale", "kind filter laga");
  ok($("#ctEntriesBody").innerHTML.indexOf("Counter bikri") >= 0, "sirf sale entries dikhi");
  click('[data-act="ctScope"][data-scope="all"]');
  await wait(20);
  ok(H().UI.ct.scope === "all", "sab-time scope");
  click('[data-act="ctResetFilter"]');
  await wait(20);
  ok(H().UI.ct.kind === "all" && H().UI.ct.q === "" && H().UI.ct.scope === "month", "filter reset");

  section("Rate list");
  H().UI.ct.tab = "rates"; H().render();
  ok(!!$("#nrName"), "rate add form hai");
  const ratesBefore = H().canteen.data().rates.length;
  setInput("#nrName", "Test Doodh");
  setInput("#nrRate", "62");
  $("#nrUnit").value = "ltr";
  click('[data-act="ctRateAdd"]');
  await wait(30);
  ok(H().canteen.data().rates.length === ratesBefore + 1, "naya item add hua");
  const tr = H().canteen.data().rates.find((r) => r.name === "Test Doodh");
  ok(tr && tr.rate === 62 && tr.unit === "ltr", "rate + unit sahi", tr);
  click('[data-act="ctAdd"]');
  const nm = $('[data-ct-item="0"][data-ct-f="name"]');
  setInput(nm, "Test Doodh");
  nm.dispatchEvent(new window.Event("change", { bubbles: true }));
  await wait(20);
  ok(Number($('[data-ct-item="0"][data-ct-f="rate"]').value) === 62, "rate list se rate auto-fill (62)");
  ok($('[data-ct-item="0"][data-ct-f="unit"]').value === "ltr", "unit bhi auto-fill (ltr)");
  setInput('[data-ct-item="0"][data-ct-f="qty"]', "3");
  ok($("#ctTotalBig").textContent.replace(/,/g, "").indexOf("186") >= 0, "3 x 62 = 186 total", $("#ctTotalBig").textContent);
  click('[data-act="closeModal"]');
  const delBtn = $('[data-act="ctRateDel"][data-id="' + tr.id + '"]');
  ok(!!delBtn, "rate delete button");
  click(delBtn);
  await wait(30);
  ok(H().canteen.data().rates.length === ratesBefore, "rate delete ho gaya");
  click('[data-act="doUndo"]');
  await wait(30);
  ok(H().canteen.data().rates.length === ratesBefore + 1, "rate undo se wapas");

  section("Bill photo (v3.4) \u2014 upload box, save, lightbox, hatao");
  const PH = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  click('[data-act="ctAdd"]');
  ok(!!$('[data-ct-photo]'), "modal me photo upload input hai");
  ok(!!$(".ct-phDrop"), "photo lagane ka box dikha");
  ok($(".ct-phDrop").textContent.indexOf("Ek saath pura total") >= 0, "box me total-mode ka hint");
  /* jsdom me camera/canvas nahi \u2014 draft me photo seedha karke UI render karo */
  H().UI.ct.edit.photo = PH;
  H().canteen.renderModal(false);
  ok(!!$(".ct-phThumb"), "photo judne par thumbnail dikha");
  ok(!$('[data-ct-photo]'), "upload input hat gaya (photo lagi hai)");
  ok(!!$('[data-act="ctPhotoDel"]'), "photo hatane ka button");
  click('[data-act="ctSetMode"][data-mode="total"]');
  setInput("#ctLump", "500");
  setInput("#ctParty", "Photo Test");
  click('[data-act="ctSave"]');
  await wait(40);
  const ph = H().canteen.entries().find((e) => e.party === "Photo Test");
  ok(!!ph && ph.photo === PH, "entry ke saath photo save hui", ph && String(ph.photo).slice(0, 24));
  ok(JSON.parse(JSON.stringify(H().Store.data.canteen)).entries.some((e) => e.party === "Photo Test" && e.photo === PH),
     "localStorage data me bhi photo hai");
  H().UI.ct.tab = "day"; H().UI.ct.date = ph.date; H().render();
  ok(!!$(".ct-phTag"), "din ke ledger me \ud83d\udcf7 photo tag");
  click(".ct-phTag");
  await wait(10);
  ok(!!$(".ct-lb"), "photo tap karne par lightbox khula");
  ok($(".ct-lb img").getAttribute("src") === PH, "lightbox me wahi photo");
  $(".ct-lb").click();
  await wait(10);
  ok(!$(".ct-lb"), "lightbox band hua");
  /* photo hatao */
  H().canteen.openModal(ph.id);
  await wait(20);
  ok(!!$(".ct-phThumb"), "edit modal me photo dikhi");
  click('[data-act="ctPhotoDel"]');
  ok(!!$('[data-ct-photo]'), "photo hatane par upload box wapas");
  click('[data-act="ctSave"]');
  await wait(40);
  ok(H().canteen.entries().find((e) => e.id === ph.id).photo === "", "photo entry se hat gayi");

  section("Unit auto from naam (v3.4) \u2014 naam likhte hi unit");
  click('[data-act="ctAdd"]');
  setName('[data-ct-item="0"][data-ct-f="name"]', "Kesar");
  ok($('[data-ct-item="0"][data-ct-f="unit"]').value === "gram", "Kesar \u2192 gram", $('[data-ct-item="0"][data-ct-f="unit"]').value);
  ok($('.ct-row .ct-pm option[value="unit"]').textContent.indexOf("gram") >= 0, "mode label \u20b9 / gram");
  setName('[data-ct-item="0"][data-ct-f="name"]', "Til ka tel");
  ok($('[data-ct-item="0"][data-ct-f="unit"]').value === "ltr", "Til ka tel \u2192 ltr", $('[data-ct-item="0"][data-ct-f="unit"]').value);
  setName('[data-ct-item="0"][data-ct-f="name"]', "Anda farm");
  ok($('[data-ct-item="0"][data-ct-f="unit"]').value === "dozen", "Anda \u2192 dozen", $('[data-ct-item="0"][data-ct-f="unit"]').value);
  setName('[data-ct-item="0"][data-ct-f="name"]', "Marie biscuit");
  ok($('[data-ct-item="0"][data-ct-f="unit"]').value === "pkt", "biscuit \u2192 pkt", $('[data-ct-item="0"][data-ct-f="unit"]').value);
  setName('[data-ct-item="0"][data-ct-f="name"]', "Aata");
  ok($('[data-ct-item="0"][data-ct-f="unit"]').value === "kg", "rate list wala item \u2192 uski unit (kg)");
  ok(String($('[data-ct-item="0"][data-ct-f="rate"]').value) === "45", "Aata ka rate auto-fill (45)");
  const uu = $('[data-ct-item="0"][data-ct-f="unit"]');
  uu.value = "pcs"; uu.dispatchEvent(new window.Event("change", { bubbles: true }));
  await wait(15);
  setName('[data-ct-item="0"][data-ct-f="name"]', "Kesar");
  ok($('[data-ct-item="0"][data-ct-f="unit"]').value === "pcs", "user ki chuni unit par auto-guess nahi chalta");
  click('[data-act="closeModal"]');

  section("PDF export (v3.4) \u2014 din + mahina");
  let pdfBytes = null;
  const RB = window.Blob;
  window.Blob = function (parts, opts) { pdfBytes = parts[0]; return new RB(parts, opts); };
  H().UI.ct.tab = "day"; H().UI.ct.date = todayIso; H().render();
  ok(!!$('[data-act="ctPdfDay"]'), "din tab par PDF button");
  click('[data-act="ctPdfDay"]');
  await wait(30);
  let pdfText = pdfBytes ? Buffer.from(pdfBytes).toString("latin1") : "";
  ok(pdfText.indexOf("%PDF-") === 0, "din ki PDF file bani", pdfText.slice(0, 8));
  ok(pdfText.indexOf("Din ka ledger") >= 0, "PDF me title 'Din ka ledger'");
  ok(pdfText.indexOf("Saman item-wise") >= 0, "PDF me item-wise table");
  ok(pdfText.indexOf("Photo Test") >= 0 || pdfText.indexOf("Test Supplier") >= 0, "PDF me entry party");
  H().UI.ct.tab = "month"; H().render();
  ok(!!$('[data-act="ctPdfMonth"]'), "mahine tab par PDF button");
  pdfBytes = null;
  click('[data-act="ctPdfMonth"]');
  await wait(30);
  const mText = pdfBytes ? Buffer.from(pdfBytes).toString("latin1") : "";
  ok(mText.indexOf("%PDF-") === 0, "mahine ki PDF bani");
  ok(mText.indexOf("Mahine ka ledger") >= 0, "PDF me mahine ka title");
  ok(mText.indexOf("Party-wise") >= 0, "PDF me party-wise table");
  window.Blob = RB;

  section("CSV export");
  let csvText = "";
  const RealBlob = window.Blob;
  window.Blob = function (parts, opts) { csvText = String(parts.join("")); return new RealBlob(parts, opts); };
  H().UI.ct.tab = "month"; H().render();
  H().canteen.csv();
  await wait(20);
  window.Blob = RealBlob;
  ok(csvText.replace(/^\ufeff/, "").indexOf("Date,Day,Type,Party") === 0, "CSV header sahi (BOM ke saath)", csvText.slice(0, 60));
  ok(csvText.split("\n").length > 8, "CSV me rows hain (" + csvText.split("\n").length + ")");
  ok(csvText.indexOf("Lump-sum total") >= 0, "total-mode row CSV me");
  ok(csvText.indexOf("Item-wise rate") >= 0, "itemized row CSV me");
  ok(csvText.indexOf("TOTALS") >= 0, "CSV me totals block");
  ok(csvText.indexOf("Aata") >= 0, "item ka naam CSV me");
  ok(csvText.indexOf("Price mode") >= 0, "CSV header me 'Price mode' column", csvText.split("\n")[0]);
  ok(csvText.indexOf("Rate (per unit)") >= 0, "CSV header me 'Rate (per unit)'");
  const lineRow = csvText.split("\n").filter((l) => l.indexOf("Maggi Test Pack") >= 0)[0] || "";
  ok(lineRow.indexOf("Poori line ka total") >= 0, "line-mode item row CSV me mode likha", lineRow);
  ok(/,90,360,/.test(lineRow) || (lineRow.indexOf("90") >= 0 && lineRow.indexOf("360") >= 0),
     "line row: per-unit 90 + amount 360", lineRow);
  ok(lineRow.split(",").length === csvText.replace(/^\ufeff/, "").split("\n")[0].split(",").length,
     "item row ki columns header jitni hain (" + lineRow.split(",").length + ")");

  section("Print (din + mahina)");
  H().UI.ct.tab = "day"; H().UI.ct.date = todayIso; H().render();
  H().canteen.printDay();
  await wait(20);
  const pr = window.document.getElementById("print-root").innerHTML;
  ok(pr.indexOf("CANTEEN DAY LEDGER") >= 0, "day print HTML bana");
  ok(pr.indexOf("stmt") >= 0, "statement styling");
  ok(pr.indexOf("Din ka net") >= 0 || pr.indexOf("net") >= 0, "net box print me");
  H().canteen.printMonth();
  await wait(20);
  const pm = window.document.getElementById("print-root").innerHTML;
  ok(pm.indexOf("CANTEEN MONTHLY LEDGER") >= 0, "month print HTML bana");
  ok(pm.indexOf("Din-wise ledger") >= 0 || pm.indexOf("sec") >= 0, "month print me ledger");

  section("WhatsApp share (din)");
  let opened = "";
  const realOpen = window.open;
  window.open = (u) => { opened = String(u); return null; };
  H().UI.ct.tab = "day"; H().UI.ct.date = todayIso; H().render();
  click('[data-act="ctShareDay"]');
  await wait(20);
  window.open = realOpen;
  ok(opened.indexOf("wa.me") === 0 || opened.indexOf("https://wa.me") >= 0, "wa.me link bana");
  ok(decodeURIComponent(opened).indexOf("Canteen Ledger") >= 0, "message me 'Canteen Ledger'");

  section("Settings me canteen card");
  H().go("settings");
  await wait(20);
  const sh = root().innerHTML;
  ok(sh.indexOf("Canteen \u2014 saman aur ledger") >= 0, "canteen settings card");
  ok(sh.indexOf("Do tarah se entry hoti hai") >= 0, "dono mode ka explanation");
  ok(!!$('[data-act="ctCsv"]'), "canteen CSV button");
  ok(!!$('[data-act="ctWipe"]'), "canteen-only erase button");
  ok(sh.indexOf("v3.1") >= 0, "footer me v3.1");

  section("Keyboard + command palette");
  H().go("dashboard");
  await wait(10);
  const kd = (k) => window.document.dispatchEvent(new window.KeyboardEvent("keydown", { key: k, bubbles: true }));
  kd("g"); kd("c");
  await wait(20);
  ok(H().UI.view === "canteen", "g + c \u2192 canteen view", H().UI.view);

  window.document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
  await wait(30);
  ok(!!$("#cmdk"), "Ctrl+K command palette khula");
  ok($("#cmdkList").innerHTML.indexOf("Canteen") >= 0, "palette me canteen commands");
  const pal = $$("#cmdkList .cmdk-item").find((el) => el.textContent.indexOf("rate list") >= 0);
  ok(!!pal, "palette me 'rate list' item");
  if (pal) { click(pal); await wait(30); ok(H().UI.view === "canteen" && H().UI.ct.tab === "rates", "palette se rate list khula"); }

  section("Persistence (localStorage)");
  const raw = window.localStorage.getItem("hisaabPro.v1");
  ok(!!raw, "localStorage me save hua");
  const parsed = JSON.parse(raw);
  ok(parsed.canteen && parsed.canteen.entries.length === H().canteen.entries().length, "canteen entries persisted",
     { saved: parsed.canteen && parsed.canteen.entries.length, live: H().canteen.entries().length });
  ok(parsed.canteen && Array.isArray(parsed.canteen.rates) && Array.isArray(parsed.canteen.log), "rates + log persisted");
  ok(parsed.workers.length === 4 && parsed.records.length > 0, "salary data bhi persisted");

  section("Purana backup (bina canteen key) restore");
  const oldBackup = JSON.stringify({ settings: parsed.settings, workers: parsed.workers, records: parsed.records });
  const dom2 = new JSDOM(html, {
    runScripts: "dangerously", pretendToBeVisual: true, url: "https://example.com/old.html", virtualConsole: vc,
    beforeParse(w) { stubs(w); w.localStorage.setItem("hisaabPro.v1", oldBackup); }
  });
  await wait(300);
  const H2 = dom2.window.Hisaab;
  ok(!!H2, "purane backup se app boot hui");
  ok(H2.Store.data.canteen && Array.isArray(H2.Store.data.canteen.entries), "canteen key auto-create hui");
  ok(H2.Store.data.canteen.entries.length === 0, "canteen khaali (purana backup)");
  ok(H2.Store.data.workers.length === 4, "workers intact");
  H2.go("canteen");
  await wait(30);
  ok(dom2.window.document.getElementById("viewRoot").innerHTML.indexOf("Din ka net") >= 0, "khaali canteen bhi render hota hai");
  ok(dom2.window.document.getElementById("viewRoot").innerHTML.indexOf("NaN") < 0, "khaali state me NaN nahi");
  dom2.window.close();

  section("Canteen-only wipe (settings se)");
  H().go("settings");
  await wait(20);
  const workersBefore = H().Store.data.workers.length;
  const ctBefore = H().canteen.entries().length;
  click('[data-act="ctWipe"]');
  ok(!!$("#cfmOk"), "wipe confirm dialog");
  click("#cfmOk");
  await wait(40);
  ok(H().canteen.entries().length === 0 && H().canteen.data().log.length === 0, "canteen data erase hua");
  ok(H().Store.data.workers.length === workersBefore, "workers safe rahe");
  ok(!!$('[data-act="doUndo"]'), "wipe ke baad undo mila");
  click('[data-act="doUndo"]');
  await wait(40);
  ok(H().canteen.entries().length === ctBefore, "undo se canteen wapas", H().canteen.entries().length);

  section("Salary features abhi bhi kaam kar rahe hain");
  H().go("hisaab");
  await wait(20);
  ok(root().innerHTML.indexOf("Auto-fill") >= 0 || root().innerHTML.length > 2000, "monthly hisaab render");
  H().go("ledger");
  await wait(20);
  ok(root().innerHTML.indexOf("Advances") >= 0, "purana ledger (advances) render");
  H().go("workers");
  await wait(20);
  ok(root().innerHTML.indexOf("Ramesh Kumar") >= 0, "workers render");
  H().go("records");
  await wait(20);
  ok(root().innerHTML.length > 500, "records render");
  H().go("dashboard");
  await wait(20);
  ok(root().innerHTML.indexOf("Net payable") >= 0, "dashboard render");
  ok(root().innerHTML.indexOf("NaN") < 0, "dashboard me NaN nahi");

  section("Console errors");
  const real = errors.filter((e) => !/Not implemented|Could not load|supabase|Failed to load|blob:fake/i.test(e));
  ok(real.length === 0, "koi JS error nahi", real.slice(0, 8));

  console.log("\n" + (fails ? "\u274C " + fails + " checks FAIL" : "\u2705 SAB CHECKS PASS"));
  window.close();
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error("HARNESS ERROR:", e && e.message); console.error(errors.slice(0, 6)); process.exit(2); });
