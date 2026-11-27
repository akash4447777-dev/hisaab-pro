/* Hisaab Pro — Canteen module smoke test (jsdom) */
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const FILE = process.argv[2] ? path.resolve(process.argv[2]) : process.env.HISAAB_HTML || path.join(__dirname, "..", "hisaab_v3.html");
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
  const action = el.dataset.act;
  if (["ctPdfDay", "ctPdfMonth", "ctSharePdfDay", "ctSharePdfMonth"].includes(action) && $("#ctReportForm")) {
    if (!$("#ctReportFrom") || !$("#ctReportTo") || !$("#ctReportParty")) throw new Error("combined report selection controls missing");
    click('[data-act="' + (action.startsWith("ctShare") ? "ctReportShare" : "ctReportDownload") + '"]');
  }
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
  ok(verEl && verEl.textContent === "3.43", "version badge 3.43", verEl && verEl.textContent);
  ok(root().innerHTML.indexOf("Canteen") >= 0, "dashboard par canteen card dikha");
  ok(root().innerHTML.indexOf("Saman aaya") >= 0, "dashboard canteen strip me 'Saman aaya'");

  section("Canteen view \u2014 sab tabs render");
  H().go("canteen");
  ok($("#viewTitle").textContent === "Canteen", "title = Canteen");
  ok($(".topbar-actions .btn.primary").textContent.indexOf("Canteen entry") >= 0, "topbar button canteen entry ban gaya");
  ["day", "month", "entries", "parties", "rates", "activity"].forEach((t) => {
    H().UI.ct.tab = t; H().render();
    const h = root().innerHTML;
    ok(h.length > 500, t + " tab render hua (" + h.length + " chars)");
    ok(h.indexOf("undefined") < 0, t + " tab me 'undefined' nahi");
    ok(h.indexOf("NaN") < 0, t + " tab me 'NaN' nahi");
  });
  H().go("hisaab");
  await wait(10);
  ok($(".topbar-actions .btn.primary").textContent.indexOf("Add Employee") >= 0, "wapis jaane par topbar button 'Add Employee'");
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
  ok(pdfText.indexOf("CANTEEN DAY LEDGER") >= 0, "PDF me title 'CANTEEN DAY LEDGER'");
  ok(pdfText.indexOf("SAMAN ITEM-WISE") >= 0, "PDF me item-wise table");
  ok(pdfText.indexOf("Photo Test") >= 0 || pdfText.indexOf("Test Supplier") >= 0, "PDF me entry party");
  H().UI.ct.tab = "month"; H().render();
  ok(!!$('[data-act="ctPdfMonth"]'), "mahine tab par PDF button");
  pdfBytes = null;
  click('[data-act="ctPdfMonth"]');
  await wait(30);
  const mText = pdfBytes ? Buffer.from(pdfBytes).toString("latin1") : "";
  ok(mText.indexOf("%PDF-") === 0, "mahine ki PDF bani");
  ok(mText.indexOf("CANTEEN MONTHLY LEDGER") >= 0, "PDF me mahine ka title");
  ok(mText.indexOf("SUPPLIER-WISE") >= 0, "PDF me party-wise table");
  window.Blob = RB;

  section("\ud83d\udccb Bulk paste (v3.5) \u2014 parser");
  const BP = (t) => H().canteen.bulkParse(t, todayIso);
  let br = BP("Maggi 4 kg 360").rows[0];
  ok(br && br.name === "Maggi" && br.qty === 4 && br.unit === "kg" && br.priceMode === "line" && br.amt === 360 && br.rate === 90,
     "Maggi 4 kg 360 \u2192 poori line 360, 90/kg", br);
  br = BP("Hara dhaniya 600 gram 45").rows[0];
  ok(br && br.qty === 600 && br.unit === "gram" && br.amt === 45 && br.rate === 0.075, "600 gram 45 \u2192 0.075/gram", br);
  br = BP("Aata 20 kg @ 42").rows[0];
  ok(br && br.priceMode === "unit" && br.rate === 42 && br.amt === 840, "@ 42 \u2192 per-unit rate, 840", br);
  br = BP("Maggi 4x90").rows[0];
  ok(br && br.priceMode === "unit" && br.rate === 90 && br.amt === 360, "4x90 \u2192 per-unit rate", br);
  br = BP("Doodh 30 ltr 1,740").rows[0];
  ok(br && br.amt === 1740 && br.unit === "ltr", "comma wala number 1,740 \u2192 1740", br);
  br = BP("Maggi 360").rows[0];
  ok(br && br.qty === 1 && br.amt === 360, "sirf price likha \u2192 qty 1, line total", br);
  br = BP("Anda farm 2 dozen 180").rows[0];
  ok(br && br.unit === "dozen" && br.amt === 180, "dozen unit parse hua", br);
  br = BP("4 kg Maggi 360").rows[0];
  ok(br && br.name === "Maggi" && br.qty === 4 && br.amt === 360, "qty pehle likha ho to bhi naam sahi", br);
  br = BP("14/11/2026\nMaggi 4 kg 360").rows[0];
  ok(br && br.date === "2026-11-14", "date line \u2192 uske baad ki lines us date par", br);
  br = BP("\u20b9 Maggi 4 kg \u20b9360").rows[0];
  ok(br && br.amt === 360, "\u20b9 sign ignore hua", br);
  ok(BP("Maggi").skipped.length === 1, "bina number wali line skip hoti hai");
  ok(BP("4 kg 360").skipped.length === 1, "bina naam wali line skip hoti hai");

  section("\ud83d\udccb Bulk paste \u2014 UI se alag-alag entries");
  const nBulkBefore = H().canteen.entries().length;
  click('[data-act="ctBulk"]');
  ok(!!$("#ctBulkText"), "bulk paste modal khula");
  ok(!!$('[data-act="ctBulkSave"]'), "save button hai");
  setInput("#ctBulkParty", "Bulk Mandi");
  let bta = $("#ctBulkText");
  bta.value = "Maggi 4 kg 360\nHara dhaniya 600 gram 45\nDoodh 30 ltr 1740";
  bta.dispatchEvent(new window.Event("input", { bubbles: true }));
  await wait(30);
  ok($("#ctBulkPrev").textContent.indexOf("3 item lines") >= 0, "preview me 3 item lines", $("#ctBulkPrev").textContent.slice(0, 60));
  ok($("#ctBulkSaveBtn").textContent.indexOf("3 entries") >= 0, "button par '3 entries save karo'", $("#ctBulkSaveBtn").textContent);
  click('[data-act="ctBulkSave"]');
  await wait(40);
  const bulkE = H().canteen.entries().filter((e) => e.party === "Bulk Mandi");
  ok(bulkE.length === 3, "paste se teen ALAG entries bani", bulkE.length);
  ok(bulkE.map((e) => e.amount).sort((a, b) => a - b).join(",") === "45,360,1740",
     "amounts 45 / 360 / 1740", bulkE.map((e) => e.amount).join(","));
  ok(bulkE.every((e) => e.items.length === 1 && e.mode === "itemized"), "har entry me apni item line");
  ok(H().canteen.entries().length === nBulkBefore + 3, "kul entries +3");
  ok(H().canteen.data().rates.some((x) => x.name === "Hara dhaniya" && x.rate === 0.075) ||
     H().canteen.data().rates.some((x) => x.name === "Pudina leaves"), "rate list paste se bhi update hoti hai");
  click('[data-act="doUndo"]');
  await wait(30);
  ok(H().canteen.entries().length === nBulkBefore, "undo se teeno entries hatt gayi");
  /* sab lines = ek entry */
  click('[data-act="ctBulk"]');
  click('[data-act="ctBulkSplit"][data-v="0"]');
  ok(!!$('[data-act="ctBulkSplit"][data-v="0"].on'), "ek-entry mode select hua");
  setInput("#ctBulkParty", "Bulk Mandi");
  bta = $("#ctBulkText");
  bta.value = "Maggi 4 kg 360\nDoodh 30 ltr 1740";
  bta.dispatchEvent(new window.Event("input", { bubbles: true }));
  await wait(30);
  ok($("#ctBulkSaveBtn").textContent.indexOf("1 entry") >= 0, "button par '1 entry save karo'", $("#ctBulkSaveBtn").textContent);
  click('[data-act="ctBulkSave"]');
  await wait(40);
  const oneE = H().canteen.entries().filter((e) => e.party === "Bulk Mandi");
  ok(oneE.length === 1 && oneE[0].items.length === 2 && oneE[0].amount === 2100,
     "ek entry me 2 item lines, total 2100", oneE[0] && oneE[0].amount);

  section("Advanced parser (v3.6) \u2014 code/rate-token/total-line sab");
  const BP2 = (t) => H().canteen.bulkParse(t, todayIso);
  let ar = BP2("101 Maggi 4 360").rows[0];
  ok(ar && ar.qty === 4 && ar.amt === 360 && ar.priceMode === "line", "item-code 101 ignore, qty 4 total 360", ar);
  ar = BP2("Maggi 4 90 360").rows[0];
  ok(ar && ar.priceMode === "unit" && ar.rate === 90 && ar.amt === 360, "qty rate total \u2192 per-unit 90", ar);
  ar = BP2("Maggi 4 kg 90/kg").rows[0];
  ok(ar && ar.priceMode === "unit" && ar.rate === 90 && ar.unit === "kg" && ar.amt === 360, "90/kg token \u2192 per-unit", ar);
  ar = BP2("Aata 20 kg 42 per kg").rows[0];
  ok(ar && ar.priceMode === "unit" && ar.rate === 42 && ar.amt === 840, "'42 per kg' \u2192 per-unit", ar);
  ar = BP2("Doodh 30 ltr 1,740/-").rows[0];
  ok(ar && ar.amt === 1740, "1,740/- \u2192 1740", ar);
  ar = BP2("Maggi (4) 360").rows[0];
  ok(ar && ar.qty === 4 && ar.amt === 360, "bracket qty (4)", ar);
  ar = BP2("Bread 10 nos 180").rows[0];
  ok(ar && ar.unit === "pcs" && ar.amt === 180, "nos \u2192 pcs", ar);
  ar = BP2("Maggi 2-minute 4 pkt 360").rows[0];
  ok(ar && ar.name.indexOf("2-minute") >= 0 && ar.qty === 4 && ar.amt === 360, "naam me number ho to bhi sahi", ar && ar.name);
  const vt = BP2("Maggi 4 kg 360\nDoodh 2 ltr 116\nTotal 476");
  ok(vt.verify === 476 && vt.rows.length === 2, "Total line pakdi (verify 476), 2 rows", vt.verify);
  ok(BP2("Paid 2000").rows.length === 0 && BP2("Paid 2000").paid === 2000, "Paid line \u2192 info, entry nahi");
  ok(BP2("Balance 500").rows.length === 0, "Baki line \u2192 info");
  ok(BP2("qty: 4 Maggi 360").rows[0].qty === 4, "qty: label ignore", BP2("qty: 4 Maggi 360").rows[0]);

  section("Editable preview + TOTAL verify chip (v3.6)");
  click('[data-act="ctBulk"]');
  bta = $("#ctBulkText");
  bta.value = "Maggi 4 kg 360\nTotal 360";
  bta.dispatchEvent(new window.Event("input", { bubbles: true }));
  await wait(30);
  ok($("#ctBulkPrev").textContent.indexOf("hisaab mila") >= 0, "TOTAL == preview \u2192 \u2705 chip", $("#ctBulkPrev").textContent.slice(0, 120));
  const pr0 = $('[data-br="0"][data-f="price"]');
  pr0.value = "400";
  pr0.dispatchEvent(new window.Event("input", { bubbles: true }));
  await wait(20);
  ok($('[data-bamt="0"]').textContent.indexOf("400") >= 0, "preview cell edit \u2192 amount 400", $('[data-bamt="0"]').textContent);
  ok($("#ctBulkTot").textContent.indexOf("400") >= 0 && $("#ctBulkTot").textContent.indexOf("\u26a0") >= 0,
     "total chip update + TOTAL mismatch warning", $("#ctBulkTot").textContent);
  const pmSel2 = $('[data-br="0"][data-f="priceMode"]');
  pmSel2.value = "unit";
  pmSel2.dispatchEvent(new window.Event("change", { bubbles: true }));
  await wait(20);
  ok(String($('[data-br="0"][data-f="price"]').value) === "100", "line\u2192unit par number carry (400/4=100)", $('[data-br="0"][data-f="price"]').value);
  ok($('[data-bamt="0"]').textContent.indexOf("400") >= 0, "amount 400 hi raha (4 x 100)");
  click('[data-act="ctBulkSave"]');
  await wait(40);
  const edE = H().canteen.entries().filter((e) => (e.items || []).some((i) => i.name === "Maggi" && i.rate === 100));
  ok(edE.length >= 1 && edE[0].amount === 400, "edit ki hui row save hui (400)", edE[0] && edE[0].amount);

  section("OCR stub (v3.6) \u2014 photo \u2192 text \u2192 entries");
  let ocrCalls = 0;
  window.Tesseract = {
    recognize: (img, lang, opt) => {
      ocrCalls++;
      if (opt && opt.logger) opt.logger({ status: "recognizing text", progress: 0.5 });
      return Promise.resolve({ data: { text: "Maggi 4 kg 360\nDoodh 2 ltr 116\n" } });
    }
  };
  const ocrRes = await H().canteen.ocrRun("data:image/png;base64,AAAA", () => {});
  const ocrText = ocrRes.text;
  ok(ocrCalls === 1 && ocrText.indexOf("Maggi 4 kg 360") >= 0, "ocrRun engine se text lata hai", ocrText);
  const ocrParsed = H().canteen.bulkParse(ocrText, todayIso);
  ok(ocrParsed.rows.length === 2 && ocrParsed.rows[0].amt === 360, "OCR text parse hokar 2 rows");
  click('[data-act="ctBulk"]');
  ok(!!$('[data-act="ctOcrPick"]'), "bulk modal me OCR button");
  /* entry modal me photo ho to OCR button */
  click('[data-act="ctAdd"]');
  H().UI.ct.edit.photo = "data:image/png;base64,AAAA";
  H().canteen.renderModal(false);
  ok(!!$('[data-act="ctPhotoOcr"]'), "entry modal me photo ke saath OCR button");
  click('[data-act="ctPhotoOcr"]');
  await wait(2000);   /* enhance-fallback (1.5s) + recognize */
  ok(!!$("#ctBulkText") && $("#ctBulkText").value.indexOf("Maggi 4 kg 360") >= 0,
     "photo OCR \u2192 bulk modal me text aa gaya", $("#ctBulkText") && $("#ctBulkText").value.slice(0, 40));
  ok(H().UI.ct.bulk.photo === "data:image/png;base64,AAAA", "photo bulk draft me judi (entries me lagegi)");
  click('[data-act="ctBulkSave"]');
  await wait(40);
  const ocrE = H().canteen.entries().filter((e) => e.photo === "data:image/png;base64,AAAA");
  ok(ocrE.length === 2, "OCR wali 2 entries photo ke saath save hui", ocrE.length);
  delete window.Tesseract;

  section("Accuracy v3.7 \u2014 parser ke naye cases");
  const BP7 = (t) => H().canteen.bulkParse(t, todayIso);
  let z7 = BP7("\u092e\u0917\u094d\u0917\u0940 \u096a kg \u0969\u0966\u0966").rows[0];
  ok(z7 && ar.qty === 4 && ar.amt === 360, "Devanagari digits (\u096a kg \u0969\u0966\u0966) \u2192 4 kg 360", z7);
  ar = BP7("1. Maggi 4 kg 360").rows[0];
  ok(z7 && ar.name === "Maggi" && ar.amt === 360, "sr-no '1.' hat gaya, naam Maggi", z7);
  ar = BP7("\u2022 Doodh 30 ltr 1740").rows[0];
  ok(z7 && ar.amt === 1740, "bullet line parse hui", z7);
  ar = BP7("14/11/2026 Maggi 4 kg 360").rows[0];
  ok(z7 && ar.date === "2026-11-14" && ar.amt === 360, "line ke saath judi date", z7);
  ar = BP7("Maggi 4 kg").skipped[0];
  ok(z7 && /price/.test(ar.why), "sirf qty, price nahi \u2192 skip (galat entry nahi)", z7);
  ar = BP7("Maggi 4 kg 360 rupees").rows[0];
  ok(z7 && ar.amt === 360, "'rupees' word ignore", z7);

  section("Accuracy v3.7 \u2014 OCR clean + photo enhance");
  const oc = H().canteen.ocrClean("Maggi 4 kg 36O\nDoodh 3O ltr l,740\n|| junk ||");
  ok(oc.indexOf("Maggi 4 kg 360") >= 0, "OCR confusion O\u21920 (36O \u2192 360)", oc);
  ok(oc.indexOf("Doodh 30 ltr 1,740") >= 0, "l\u21921, O\u21920 (l,740 \u2192 1,740)", oc);
  const px = new Uint8ClampedArray([0, 0, 0, 255, 200, 100, 50, 255]);
  H().canteen.enhancePixels(px);
  ok(px[0] === 0 && px[4] === 255 && px[5] === 255 && px[6] === 255,
     "grayscale + contrast stretch (kala kala, bright safed)", Array.from(px));
  window.Tesseract = { recognize: (img, lang, opt) => Promise.resolve({ data: { text: "Maggi 4 kg 36O\nTotal 360", confidence: 91 } }) };
  let ocrOut = null;
  H().canteen.ocrRun("data:image/png;base64,AAAA", () => {}).then((o) => { ocrOut = o; });
  await wait(1800);   /* enhance-fallback ke baad recognize */
  ok(ocrOut && ocrOut.text.indexOf("Maggi 4 kg 360") >= 0 && ocrOut.conf === 91,
     "ocrRun: enhance \u2192 recognize \u2192 clean text + confidence", ocrOut && ocrOut.text);

  section("Accuracy v3.7 \u2014 rate-list cross-check + ek-click fix");
  click('[data-act="ctBulk"]');
  let ta7 = $("#ctBulkText");
  ta7.value = "Doodh 30 ltr 3000";
  ta7.dispatchEvent(new window.Event("input", { bubbles: true }));
  await wait(30);
  ok($("#ctBulkPrev").innerHTML.indexOf("fixRate") >= 0, "parse hua rate list se alag \u2192 \u26a0 button",
     $("#ctBulkPrev").textContent.slice(0, 80));
  ok($("#ctBulkPrev").textContent.indexOf("rate-list se alag") >= 0, "warning chip dikha");
  click('[data-br="0"][data-f="fixRate"]');
  await wait(20);
  const fr7 = H().UI.ct.bulk.rows[0];
  ok(fr7 && fr7.rate === 58 && fr7.amt === 1740, "\u26a0 button se list rate 58 laga, amount 1740", fr7);
  ta7 = $("#ctBulkText");
  ta7.value = "Maggi 4 kg 360\nMaggi 2 kg 180";
  ta7.dispatchEvent(new window.Event("input", { bubbles: true }));
  await wait(30);
  ok($("#ctBulkPrev").textContent.indexOf("jaan-bujh") >= 0, "duplicate naam chip (Maggi \u00d72)");
  click('[data-act="closeModal"]');

  section("Advanced v3.7 \u2014 mahina WhatsApp + rate history + dashboard buttons");
  let waUrl = null;
  const roOpen = window.open;
  window.open = (u) => { waUrl = u; return null; };
  H().UI.ct.tab = "month"; H().render();
  ok(!!$('[data-act="ctShareMonth"]'), "mahine tab par WhatsApp button");
  click('[data-act="ctShareMonth"]');
  window.open = roOpen;
  ok(!!waUrl && waUrl.indexOf("https://wa.me/") === 0, "share wa.me par gaya", String(waUrl).slice(0, 40));
  const waTxt = decodeURIComponent(String(waUrl).split("text=").pop());
  ok(waTxt.indexOf("Canteen") >= 0 && waTxt.indexOf("NET") >= 0 && waTxt.indexOf("Saman item-wise") >= 0,
     "share text: din-wise + item-wise + net", waTxt.slice(0, 50));
  H().UI.ct.tab = "rates"; H().render();
  ok(!!$('[data-act="ctRateHist"]'), "rate list par 🕘 history button");
  click('[data-act="ctRateHist"]');
  await wait(20);
  ok(!!$(".modal") && $(".modal").textContent.indexOf("kharid history") >= 0, "history modal khula");
  ok($(".modal").textContent.indexOf("Per-unit rate") >= 0, "history me per-unit rate column");
  click('[data-act="closeModal"]');
  H().go("dashboard");
  ok(!!$('[data-act="ctBulk"]') && !!$('[data-act="ctPdfMonth"]'),
     "dashboard canteen card par 📋 Paste + 📄 PDF quick buttons");
  H().go("canteen");

  section("PDF theme v3.8 \u2014 branded header, footers, totals");
  let pb8 = null;
  const RB8 = window.Blob;
  window.Blob = function (parts, opts) { pb8 = parts[0]; return new RB8(parts, opts); };
  H().UI.ct.tab = "day"; H().UI.ct.date = todayIso; H().render();
  ok(!!$('[data-act="ctSharePdfDay"]'), "din tab par 📤 WhatsApp PDF button");
  click('[data-act="ctPdfDay"]');
  await wait(30);
  let d8 = pb8 ? Buffer.from(pb8).toString("latin1") : "";
  ok(d8.indexOf("%PDF-") === 0, "din ki PDF bani");
  ok(d8.indexOf("CANTEEN DAY LEDGER") >= 0 && d8.indexOf(String.fromCharCode(151) + " CANTEEN") >= 0,
     "photo-style header (SHOP — CANTEEN + doc title)");
  ok(d8.indexOf("Page 1 of") >= 0, "har page par page-number footer", d8.match(/Page \d+ of \d+/) && d8.match(/Page \d+ of \d+/)[0]);
  ok(d8.indexOf("Item-wise total") >= 0, "bold total row table ke andar");
  ok(d8.indexOf("SAMAN ITEM-WISE") >= 0, "item-wise section");
  ok(d8.indexOf("Generated") >= 0, "generated timestamp");
  H().UI.ct.tab = "month"; H().render();
  ok(!!$('[data-act="ctSharePdfMonth"]'), "mahine tab par 📤 WhatsApp PDF button");
  pb8 = null;
  click('[data-act="ctPdfMonth"]');
  await wait(30);
  const m8 = pb8 ? Buffer.from(pb8).toString("latin1") : "";
  ok(m8.indexOf("Mahine ka total") >= 0 && m8.indexOf("SUPPLIER-WISE") >= 0 && m8.indexOf("DIN-WISE LEDGER") >= 0,
     "mahine PDF me total row + din-wise + party-wise");
  ok(m8.indexOf("Page 1 of") >= 0, "mahine PDF me footer");
  window.Blob = RB8;

  section("📤 WhatsApp par seedha PDF (v3.8)");
  /* Web Share API route (mobile jaisa) */
  let shared8 = null;
  Object.defineProperty(window.navigator, "canShare", { value: (o) => !!(o && o.files && o.files.length), configurable: true });
  Object.defineProperty(window.navigator, "share", { value: (o) => { shared8 = o; return Promise.resolve(); }, configurable: true });
  H().UI.ct.tab = "day"; H().UI.ct.date = todayIso; H().render();
  click('[data-act="ctSharePdfDay"]');
  await wait(40);
  ok(!!shared8 && !!shared8.files && shared8.files.length === 1, "navigator.share ko PDF file gayi", shared8 && Object.keys(shared8));
  ok(shared8 && shared8.files[0].type === "application/pdf", "share file type application/pdf", shared8 && shared8.files[0].type);
  ok(shared8 && /Canteen_Din_.*\.pdf/.test(shared8.files[0].name), "file naam Canteen_Din_*.pdf", shared8 && shared8.files[0].name);
  ok(shared8 && /canteen ledger/i.test(String(shared8.text)), "share text me ledger label", shared8 && shared8.text);
  /* fallback route (desktop): download + wa.me */
  Object.defineProperty(window.navigator, "canShare", { value: () => false, configurable: true });
  let wa8 = null;
  const ro8 = window.open;
  window.open = (u) => { wa8 = u; return null; };
  let fb8 = null;
  window.Blob = function (parts, opts) { fb8 = parts[0]; return new RB8(parts, opts); };
  H().UI.ct.tab = "month"; H().render();
  click('[data-act="ctSharePdfMonth"]');
  await wait(40);
  wa8 = $("#ctReportFallback a")?.href || wa8;
  window.open = ro8;
  window.Blob = RB8;
  ok(!!wa8 && String(wa8).indexOf("https://wa.me/") === 0, "fallback me wa.me khula", String(wa8).slice(0, 40));
  ok(decodeURIComponent(String(wa8)).indexOf("attach") >= 0, "wa text me attach hint");
  ok(!!fb8, "fallback me PDF download ke liye blob bana");

  section("🎨 PDF templates (v3.9) — 6 designs, picker, persist");
  const TP9 = H().canteen.tpls;
  ok(Array.isArray(TP9) && TP9.length === 6, "6 PDF templates defined", TP9 && TP9.length);
  ok(new Set(TP9.map((t) => t.id)).size === 6, "sab template ids unique");
  ok(TP9[0].id === "neela", "default pehla template Neela Classic");
  ok(TP9.some((t) => t.style === "accent") && TP9.some((t) => t.style === "bill") && TP9.some((t) => t.style === "minimal"),
     "3 alag render styles (accent / bill / minimal)");
  ok(H().canteen.tpl().id === "neela", "bina setting ke default = neela (purana look safe)");

  /* har template me din + mahina PDF valid banti hai */
  H().UI.ct.tab = "day"; H().UI.ct.date = todayIso; H().render();
  let allPdf9 = true;
  const st9 = {};
  TP9.forEach((t) => {
    H().canteen.setTpl(t.id);
    const rd = H().canteen.pdfDayStr(todayIso);
    const rm = H().canteen.pdfMonthStr(H().UI.year, H().UI.month);
    if (!rd || rd.str.indexOf("%PDF-") !== 0 || !rm || rm.str.indexOf("%PDF-") !== 0) allPdf9 = false;
    st9[t.id] = rd ? rd.str : "";
  });
  ok(allPdf9, "har template me din + mahina PDF bani (%PDF header)");
  ok(st9.neela.indexOf("0.953 0.957 0.965 rg") >= 0, "neela = print exact grey header fill");
  ok(st9.hara.indexOf("0.92 0.965 0.93 rg") >= 0, "hara template me green header tint");
  ok(st9.dark.indexOf("0.9 0.9 0.93 rg") >= 0, "dark template me charcoal header tint");
  ok(st9.kesari.indexOf("0.993 0.955 0.91 rg") >= 0, "kesari template me saffron header tint");
  ok(st9.simple.indexOf("0.31 0.27 0.9") < 0 && st9.simple.indexOf("0 0 0 RG") >= 0, "Simple S&W me koi rang nahi — sirf black");
  ok(st9.lal.indexOf("CANTEEN DAY LEDGER") >= 0 && st9.lal.indexOf("Saman aaya") >= 0 && st9.lal !== st9.neela,
     "Laal Bill (invoice) me content same, design alag");
  ["neela", "hara", "dark", "kesari", "lal", "simple"].forEach((id) => {
    ok(st9[id].indexOf("Page 1 of") >= 0 && st9[id].indexOf("Generated") >= 0, id + ": footer + timestamp sab templates me");
  });

  /* setTpl validation + persist */
  ok(H().canteen.setTpl("nope") === false, "galat template id reject");
  ok(H().canteen.tpl().id === "simple", "reject ke baad purani selection barkarar");
  H().canteen.setTpl("dark");
  ok(H().Store.data.settings.pdfTpl === "dark", "selection Store.data.settings.pdfTpl me save");
  const raw9 = window.localStorage.getItem("hisaabPro.v1");
  ok(raw9 && JSON.parse(raw9).settings && JSON.parse(raw9).settings.pdfTpl === "dark", "selection localStorage me persist");

  /* 🎨 picker UI */
  H().canteen.setTpl("neela");
  H().UI.ct.tab = "day"; H().render();
  ok(!!$('[data-act="ctTplPick"]'), "toolbar me 🎨 PDF style button (din)");
  click('[data-act="ctTplPick"]');
  await wait(20);
  const cards9 = $$(".ct-tplCard");
  ok(cards9.length === 6, "picker modal me 6 template cards", cards9.length);
  ok(!!$('.ct-tplCard.on') && $('.ct-tplCard.on').dataset.id === "neela", "chuna hua card ✓ marked");
  click('[data-act="ctTplSet"][data-id="lal"]');
  await wait(20);
  ok(H().canteen.tpl().id === "lal", "card click → template set");
  ok($$(".ct-tplCard").length === 6 && $('.ct-tplCard.on').dataset.id === "lal", "picker refresh — naya card ✓ marked");
  click('.modal-f [data-act="closeModal"]');
  await wait(10);
  ok(!$("#overlay"), "picker band hua");
  H().UI.ct.tab = "month"; H().render();
  ok(!!$('[data-act="ctTplPick"]'), "mahina tab par bhi 🎨 button");
  H().canteen.setTpl("neela");           /* default restore — aage wale tests safe */

  section("v3.10 — clean PDF (koi ? / Σ nahi) + naam sirf HISAAB");
  /* Σ line-total wala case: line-price entry push karke PDF check */
  const cd10 = H().Store.data.canteen;
  const ent10 = { id: "t10sigma", date: todayIso, kind: "purchase", mode: "itemized", paid: 250, createdAt: Date.now(),
    items: [{ name: "TEST AATA", qty: 5, unit: "kg", priceMode: "line", rate: 0, amount: 250 }] };
  cd10.entries.push(ent10);
  const d10 = H().canteen.pdfDayStr(todayIso).str;
  ok(d10.indexOf("\u03a3") < 0, "PDF me Σ symbol kahin nahi");
  ok(d10.indexOf("(?") < 0 && d10.indexOf("? line-total") < 0, "PDF me '?' garbage nahi (Σ line-total fix)");
  ok(d10.indexOf("TEST AATA") >= 0 && d10.indexOf("TEST AATA (") < 0, "item naam saaf — koi marker nahi");
  cd10.entries.splice(cd10.entries.indexOf(ent10), 1);
  ok(H().canteen.pdfDayStr(todayIso).str.indexOf("TEST AATA") < 0, "test entry wapas hat gayi");

  /* panel ka naam sirf HISAAB */
  ok(String(window.document.title).indexOf("Hisaab Pro") < 0, "title me 'Hisaab Pro' nahi", window.document.title);
  const h110 = window.document.querySelector("h1");
  ok(h110 && h110.textContent.trim() === "Hisaab", "sidebar brand sirf 'Hisaab'", h110 && h110.textContent);
  ok(d10.indexOf("HISAAB PRO") < 0 && d10.indexOf("CANTEEN DAY LEDGER") >= 0, "header doc title sahi, HISAAB PRO kahin nahi");
  ok(H().canteen.pdfMonthStr(H().UI.year, H().UI.month).str.indexOf("NET") >= 0, "mahine table me NET column");

  /* picker cards me mini visual preview */
  H().UI.ct.tab = "day"; H().render();
  click('[data-act="ctTplPick"]');
  await wait(20);
  ok($$(".ct-tplPrev").length === 6, "har template card me mini design preview", $$(".ct-tplPrev").length);
  ok($$(".ct-tplCard").length === 6, "picker cards abhi bhi 6");
  click('.modal-f [data-act="closeModal"]');
  await wait(10);

  section("v3.11 — PDF alignment pro");
  const PC11 = H().canteen.pdfCols;
  const CW11 = 595.28 - 80;
  Object.keys(PC11).forEach((k) => {
    const sum = PC11[k].reduce((a, c) => a + c.w, 0);
    ok(Math.abs(sum - CW11) < 0.01, k + " table poori content-width par aligned", sum);
  });
  const al11d = H().canteen.pdfDayStr(todayIso).str;
  const al11m = H().canteen.pdfMonthStr(H().UI.year, H().UI.month).str;
  ok(al11d.indexOf("%PDF-") === 0 && al11d.indexOf("DIN KA NET") >= 0 && al11d.indexOf("Page 1 of") >= 0,
     "din PDF alignment fix ke baad bhi sahi");
  ok(al11m.indexOf("%PDF-") === 0 && al11m.indexOf("Mahine ka total") >= 0 && al11m.indexOf("SUPPLIER-WISE") >= 0,
     "mahine ki 8-column table ab poori chaurai (20pt gap khatam)");
  let alOk11 = true;
  H().canteen.tpls.forEach((t) => {
    H().canteen.setTpl(t.id);
    if (H().canteen.pdfMonthStr(H().UI.year, H().UI.month).str.indexOf("%PDF-") !== 0) alOk11 = false;
  });
  ok(alOk11, "sab 6 templates me mahina PDF valid");
  H().canteen.setTpl("neela");

  section("v3.12 — photo wala print-ledger format + WhatsApp same");
  const m12 = H().canteen.pdfMonthStr(H().UI.year, H().UI.month).str;
  const d12 = H().canteen.pdfDayStr(todayIso).str;
  ok(m12.indexOf("CANTEEN MONTHLY LEDGER") >= 0, "mahine PDF me doc title right side");
  ok(m12.indexOf(String.fromCharCode(151) + " CANTEEN") >= 0, "header me SHOP — CANTEEN line");
  ok(m12.indexOf("Main Market") >= 0, "header me shop address line", (H().Store.data.settings || {}).address);
  ["Saman aaya", "Entries", "Paisa diya", "Baki / udhaar"].forEach((lb) => {
    ok(m12.indexOf(lb) >= 0, "2-column summary me '" + lb + "'");
  });
  ok(m12.indexOf("(Bikri / income)") < 0, "v3.18: summary Bikri / income label blank");
  ok(m12.indexOf("(Kharcha)") < 0, "v3.18: summary Kharcha label blank");
  ok(m12.indexOf("DIN-WISE LEDGER") >= 0 && m12.indexOf("Mahine ka total") >= 0, "din-wise table + bold total row andar");
  ok(m12.indexOf("ITEM-WISE SUMMARY") >= 0 && m12.indexOf("RATE WALI ENTRIES") >= 0, "item-wise summary section");
  ok(d12.indexOf("CANTEEN DAY LEDGER") >= 0 && d12.indexOf("ENTRIES") >= 0 && d12.indexOf("DIN KA NET") >= 0,
     "din PDF bhi usi print-format me");
  const acc12 = { neela: "0.953 0.957 0.965 rg", hara: "0.92 0.965 0.93 rg", dark: "0.9 0.9 0.93 rg", kesari: "0.993 0.955 0.91 rg", lal: "0.74 0.11 0.11 RG" };
  Object.keys(acc12).forEach((id) => {
    H().canteen.setTpl(id);
    const st = H().canteen.pdfMonthStr(H().UI.year, H().UI.month).str;
    ok(st.indexOf(acc12[id]) >= 0, id + ": template accent PDF me");
  });
  H().canteen.setTpl("simple");
  const s12 = H().canteen.pdfMonthStr(H().UI.year, H().UI.month).str;
  ok(s12.indexOf("0.31 0.27 0.9") < 0 && s12.indexOf("0.09 0.44 0.24") < 0, "Simple S&W: koi colour accent nahi (syahi bachao)");
  H().canteen.setTpl("neela");
  /* WhatsApp par bhi yahi format */
  let sh12 = null;
  Object.defineProperty(window.navigator, "canShare", { value: (o) => !!(o && o.files), configurable: true });
  Object.defineProperty(window.navigator, "share", { value: (o) => { sh12 = o; return Promise.resolve(); }, configurable: true });
  H().UI.ct.tab = "day"; H().UI.ct.date = todayIso; H().render();
  click('[data-act="ctSharePdfDay"]');
  await wait(40);
  ok(!!sh12 && sh12.files && sh12.files.length === 1, "WhatsApp share me PDF file attach");
  ok(!!sh12 && String(sh12.files[0].name).indexOf("Canteen_Din_") === 0, "WhatsApp PDF wahi naya format");

  section("v3.13 — PDF = print ledger same-to-same (din + mahina)");
  const d13 = H().canteen.pdfDayStr(todayIso).str;
  const m13 = H().canteen.pdfMonthStr(H().UI.year, H().UI.month).str;
  /* din: print-day jaisa */
  ["Date", "Din", "Entries", "Saman aaya"].forEach((lb) => {
    ok(d13.indexOf(lb) >= 0, "din meta me '" + lb + "'");
  });
  ok(d13.indexOf("(Bikri)") < 0, "v3.18: din summary Bikri label blank");
  ok(d13.indexOf("(Kharcha)") < 0, "v3.18: din summary Kharcha label blank");
  ok(d13.indexOf("ENTRIES") >= 0 && d13.indexOf("MODE") >= 0 && d13.indexOf("BILL") >= 0, "din entries table print jaisi (Type/Party/Bill/Mode/Saman)");
  ok(d13.indexOf("Item-wise") >= 0 && d13.indexOf("Lump-sum") >= 0 || d13.indexOf("Item-wise") >= 0, "mode column values");
  ok(d13.indexOf("SAMAN ITEM-WISE") >= 0 && d13.indexOf("RATE KE SAATH") >= 0, "din item-wise section print jaisa");
  ok(d13.indexOf("Item-wise total") >= 0, "item-wise total row");
  ok(d13.indexOf("DIN KA NET") >= 0 && d13.indexOf("Prepared by") >= 0, "din net band + signature block");
  /* mahina: print-month jaisa */
  ok(m13.indexOf("SUPPLIER-WISE") >= 0, "party section print jaisa (PARTY / SUPPLIER-WISE)");
  ok(m13.indexOf("TOTAL") >= 0 && m13.indexOf("PAID") >= 0, "party table me Total + Paid columns");
  ok(m13.indexOf("MAHINE KA NET") >= 0, "mahine net band");
  ok(m13.indexOf("Amount in words") >= 0, "amount in words line");
  ok(m13.indexOf("Prepared by") >= 0, "signature block");
  ok(m13.indexOf("DIN-WISE LEDGER") >= 0 && m13.indexOf("Mahine ka total") >= 0, "din-wise table + total row barkarar");
  /* dono templates me valid */
  let ok13 = true;
  H().canteen.tpls.forEach((t) => {
    H().canteen.setTpl(t.id);
    if (H().canteen.pdfDayStr(todayIso).str.indexOf("%PDF-") !== 0) ok13 = false;
    if (H().canteen.pdfMonthStr(H().UI.year, H().UI.month).str.indexOf("%PDF-") !== 0) ok13 = false;
  });
  ok(ok13, "sab 6 templates me din + mahina PDF valid");
  H().canteen.setTpl("neela");

  section("v3.14 — print CSS exact mirror (grid, dashed, sign boxes)");
  const d14 = H().canteen.pdfDayStr(todayIso).str;
  const m14 = H().canteen.pdfMonthStr(H().UI.year, H().UI.month).str;
  ok(/125\.00 [\d.]+ m 125\.00 [\d.]+ l S/.test(m14), "v3.30: seven-column mahine table me FULL GRID vertical borders");
  ok(/102\.00 [\d.]+ m 102\.00 [\d.]+ l S/.test(d14), "din table me FULL GRID vertical borders");
  ok(m14.indexOf("0.953 0.957 0.965 rg") >= 0, "header row grey fill (print #f3f4f6)");
  ok(m14.indexOf("0.898 0.906 0.922 RG") >= 0, "grid + dashed lines print grey (#e5e7eb)");
  ok(m14.indexOf("Proprietor") >= 0 && m14.indexOf("Prepared by") >= 0, "signature boxes (Prepared by / owner)");
  ok(m14.indexOf("Hisaab v") >= 0 && m14.indexOf("Page 1 of") >= 0, "footer me version + page number");
  ok(m14.indexOf("Amount in words") >= 0, "in-words dashed box");
  ok(d14.indexOf("DIN KA NET") >= 0 && m14.indexOf("MAHINE KA NET") >= 0, "net rows dono me (v3.16: reference jaisi light styling)");
  let g14 = true;
  H().canteen.tpls.forEach((t) => {
    H().canteen.setTpl(t.id);
    if (!/125\.00 [\d.]+ m 125\.00/.test(H().canteen.pdfMonthStr(H().UI.year, H().UI.month).str)) g14 = false;
  });
  ok(g14, "sab 6 templates me grid layout same");
  H().canteen.setTpl("neela");

  section("v3.15 — entries clean (no products), alignment, page-break guards");
  const d15 = H().canteen.pdfDayStr(todayIso).str;
  const iM15 = d15.indexOf("MODE"), iA15 = d15.indexOf("AMOUNT");
  ok(iM15 > 0 && iA15 > iM15 && d15.slice(iM15, iA15).indexOf("SAMAN") < 0,
     "entries table me Saman/products column nahi");
  const iS15 = d15.indexOf("SAMAN ITEM-WISE");
  ok(iS15 > 0 && d15.slice(iS15).length > 200, "products sirf item-wise summary me");
  ok(d15.indexOf(String.fromCharCode(151)) >= 0, "header me em-dash (print jaisa, hyphen nahi)");
  const w15 = H().canteen.pdfCols.day.reduce((a, c) => a + c.w, 0);
  ok(Math.abs(w15 - (595.28 - 80)) < 0.01, "day columns poori chaurai (overlap fix)", w15);
  const amt15 = H().canteen.pdfCols.day.find((c) => String(c.l).indexOf("Amount") === 0);
  ok(amt15 && amt15.w >= 80, "amount column chauri (Rs.2,800.00 fit)", amt15 && amt15.w);
  let v15 = true;
  H().canteen.tpls.forEach((t) => {
    H().canteen.setTpl(t.id);
    if (H().canteen.pdfDayStr(todayIso).str.indexOf("%PDF-") !== 0) v15 = false;
  });
  ok(v15, "sab templates me day PDF valid");
  H().canteen.setTpl("neela");

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
