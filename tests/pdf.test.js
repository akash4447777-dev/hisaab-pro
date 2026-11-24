/* PDF v3.16 — real font embedding, measured reference closing, pagination.
   No network/browser/Python needed. Optional: --artifacts <ignored-output-dir>
   HISAAB_HTML=/path/to/release.html node pdf.test.js checks a release copy. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM, VirtualConsole } = require("jsdom");

const FILE = process.env.HISAAB_HTML || path.join(__dirname, "..", "hisaab_v3.html");
const html = fs.readFileSync(FILE, "utf8");
const artifactsArg = process.argv.indexOf("--artifacts");
const outDir = artifactsArg >= 0 ? path.resolve(process.argv[artifactsArg + 1]) : null;
if (outDir) fs.mkdirSync(outDir, { recursive: true });
const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errors.push(e.message));
const dom = new JSDOM(html, {
  runScripts: "dangerously", url: "https://example.com/hisaab/", virtualConsole: vc,
  beforeParse(w) {
    w.scrollTo = () => {};
    w.print = () => {};
    w.URL.createObjectURL = () => "blob:test";
    w.URL.revokeObjectURL = () => {};
  }
});
const w = dom.window, H = w.Hisaab, P = H.PdfDoc, C = H.canteen;
const fonts = JSON.parse(w.document.getElementById("hisaab-pdf-fonts").textContent);
const DATE = "2026-11-14", YEAR = 2026, MONTH = 10;
const NOTE = "This is a computer-generated salary statement. Please verify all figures before payment.";
H.Store.data.settings.ownerName = "Proprietor";
H.Store.data.settings.statementNote = NOTE;
H.UI.year = YEAR; H.UI.month = MONTH; H.UI.ct.date = DATE;
let passed = 0, failed = 0;
function check(label, run) {
  try { run(); passed++; console.log("  ✅ " + label); }
  catch (err) { failed++; console.error("  ❌ " + label + "\n     " + err.message); }
}
function close(a, b, eps = .025) { assert.ok(Math.abs(a - b) <= eps, `${a} != ${b}`); }
function artifact(name, data) { if (outDir) fs.writeFileSync(path.join(outDir, name), data, "latin1"); }
function entry(id, amount, extra = {}) {
  return { id, date: DATE, kind: "purchase", party: "KIRANA STORE", billNo: "", mode: "total",
    amount, paid: amount, items: [], createdAt: 1, ...extra };
}
function fixture(list) { H.Store.data.canteen.entries = list; C.setTpl("neela"); }
function day() { return C.pdfDayStr(DATE).str; }
function month() { return C.pdfMonthStr(YEAR, MONTH).str; }
function encoded(text) { return P.encode(text); }

// Read the writer's real xref table rather than guessing page boundaries by text.
function pages(pdf) {
  const xrefAt = Number(pdf.match(/startxref\s+(\d+)\s+%%EOF$/)[1]);
  assert.equal(pdf.slice(xrefAt, xrefAt + 4), "xref");
  const tail = pdf.slice(xrefAt).split("\n"), count = Number(tail[1].split(" ")[1]);
  const objects = new Map();
  for (let id = 1; id < count; id++) {
    const pos = Number(tail[id + 2].slice(0, 10));
    assert.equal(pdf.slice(pos, pos + `${id} 0 obj`.length), `${id} 0 obj`, "valid byte offset for object " + id);
    const end = pdf.indexOf("\nendobj", pos);
    objects.set(id, pdf.slice(pos, end));
  }
  const result = [];
  for (const body of objects.values()) {
    if (!/\/Type \/Page\b/.test(body)) continue;
    const content = objects.get(Number(body.match(/\/Contents (\d+) 0 R/)[1]));
    const start = content.indexOf("stream\n") + 7, length = Number(content.match(/\/Length (\d+)/)[1]);
    const ops = content.slice(start, start + length);
    assert.equal(content.slice(start + length, start + length + 10), "\nendstream");
    const texts = [];
    const rx = /BT \/F([123]) ([\d.eE+-]+) Tf ([\d.eE+-]+) Tc ([\d.]+) ([\d.]+) ([\d.]+) rg 1 0 0 1 ([-\d.]+) ([-\d.]+) Tm \(((?:\\.|[^\\])*?)\) Tj ET/g;
    let m;
    while ((m = rx.exec(ops))) texts.push({
      font: Number(m[1]), size: Number(m[2]), spacing: Number(m[3]),
      color: m.slice(4, 7).map(Number), x: Number(m[7]), y: Number(m[8]),
      text: m[9].replace(/\\([\\()])/g, "$1")
    });
    result.push({ ops, texts });
  }
  return result;
}
function find(page, text) {
  const found = page.texts.find((t) => t.text.includes(encoded(text)));
  assert.ok(found, "missing text: " + text);
  return found;
}
function last(pdf) { return pages(pdf).at(-1); }
function closing(pdf) {
  const ps = pages(pdf), page = ps.at(-1);
  const label = page.texts.find((t) => /^(DIN|MAHINE) KA NET/.test(t.text));
  assert.ok(label, "net label must be on final page");
  const words = find(page, "Amount in words:");
  const prepared = find(page, "Prepared by"), owner = page.texts.find((t) => t.text === "Proprietor");
  assert.ok(owner, "signature owner, not the address header");
  const footer = find(page, "Hisaab v3.31"), note = find(page, "This is a computer-generated");
  const value = page.texts.find((t) => t.font === 3 && t.y < label.y && t.y > words.y);
  assert.ok(value, "16.5pt Black net value");
  close(label.size, 8.25); close(label.spacing, .825);
  close(value.size, 16.5); close(words.size, 8.625); close(prepared.size, 8.25); close(footer.size, 7.5);
  label.color.forEach((c) => close(c, 171 / 255, .00001));
  close(label.y - value.y, 9);
  close(label.y - words.y, 48);
  close(words.y - prepared.y, 64.5);
  close(prepared.y, owner.y);
  close(prepared.y - footer.y, 38.25);
  close(note.y, footer.y);
  assert.ok(footer.y >= 64, "closing stays clear of page bottom");
  assert.ok(!footer.text.includes("Page"), "final footer matches reference: version only");
  assert.ok(page.ops.includes("[2.25 1.5] 0 d"), "rounded dashed in-words border");
  const ending = page.ops.slice(page.ops.indexOf("(" + label.text.replace(/[()\\]/g, "\\$&") + ")"));
  assert.ok(!/515\.28 28\.00 re f/.test(ending), "no dark net rectangle");
  return { page, label, words, prepared, footer, value };
}
// v3.30 removes the whole sale/expense summary rows, not only their labels.
function purchaseSummary(pdf, which, amount) {
  const page = pages(pdf)[0], labelX = which === "day" ? 312.64 : 40;
  const rows = page.texts.filter((t) => t.font === 1 && t.size === 8.625 &&
    Math.abs(t.x - labelX) < .01 && [768, 754, 740].includes(t.y));
  assert.equal(rows.length, 1, "only the purchase summary label is drawn");
  assert.ok(rows[0].text.startsWith("Saman aaya"));
  const right = labelX + 242.64;
  const values = page.texts.filter((t) => t.font === 2 && t.size === 8.625 && [768, 754, 740].includes(t.y) &&
    Math.abs(t.x + P.measure(t.text, t.size, true) - right) < .02);
  const text = encoded("₹" + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  assert.deepEqual(values.map((t) => [t.y, t.text]), [[768, text]], "no orphan sale/expense amounts");
  assert.ok(!page.texts.some(t => /bikri|kharcha/i.test(t.text)), "category columns/formula words removed");
}

function bodyBounds(pdf) {
  for (const page of pages(pdf)) for (const t of page.texts) {
    if (/ · Page \d+ of \d+$/.test(t.text)) continue;
    assert.ok(t.y >= 64 && t.y <= 820, `text outside safe page area: ${t.y} ${t.text.slice(0, 70)}`);
    const width = P.measure(t.text, t.size, t.font === 3 ? "black" : t.font === 2 ? true : false) + Math.max(0, t.text.length - 1) * t.spacing;
    assert.ok(t.x >= 39.97 && t.x + width <= 555.32, `text outside content width: ${t.x} ${width} ${t.text.slice(0, 60)}`);
  }
}

(async () => {
  console.log("\n▸ v3.18 — reference PDF font + closing geometry");
  check("Segoe UI Regular/Bold/Black embedded, not a Helvetica substitute", () => {
    assert.deepEqual([fonts.regular.name, fonts.bold.name, fonts.black.name], ["SegoeUI", "SegoeUI-Bold", "SegoeUIBlack"]);
    for (const key of ["regular", "bold", "black"]) {
      assert.ok(Buffer.from(fonts[key].data, "base64").length > 20000);
      for (let code = 32; code < 127; code++) assert.ok(fonts[key].widths[code - 32] > 0, `${key}: ASCII ${code}`);
    }
  });
  check("metrics match the reference: rupee amounts in Regular and Black", () => {
    close(P.measure("₹3,438.00", 9), 37.863, .005);
    close(P.measure("−₹6,466.00", 16.5, "black"), 91.904, .005);
  });
  check("all three print weights use inline fonts (offline / Android safe)", () => {
    const css = w.document.getElementById("hisaab-document-fonts").textContent;
    assert.equal((css.match(/@font-face/g) || []).length, 3);
    assert.equal((css.match(/data:font\/ttf;base64,/g) || []).length, 3);
    assert.ok(css.includes('font-weight:900') && css.includes('.stmt{font-family:"Hisaab Segoe"'));
  });
  fixture([entry("ref1", 3438), entry("ref2", 2800, { kind: "expense", party: "GAS AGENCY" }), entry("ref3", 228, { kind: "expense", party: "Misc" })]);
  const referenceDay = day(), referenceMonth = month();
  artifact("Hisaab-v3.18-day-preview.pdf", referenceDay);
  artifact("Hisaab-v3.18-format-preview.pdf", referenceMonth);
  check("₹ / minus / em dash have correct ToUnicode mappings (copy/search works)", () => {
    for (const str of ["<80> <20b9>", "<81> <2212>", "<97> <2014>"]) assert.ok(referenceMonth.includes(str));
    assert.ok(referenceMonth.includes("(" + encoded("−₹6,466.00") + ") Tj"));
    assert.ok(!referenceMonth.includes("/Helvetica"));
    const title = find(pages(referenceMonth)[0], "CANTEEN MONTHLY LEDGER");
    assert.equal(title.font, 3, "reference header also uses genuine Black");
    close(title.size, 10.5);
    assert.equal((referenceMonth.match(/\/FontFile2 /g) || []).length, 3);
  });
  check("month: exact reference sizes, grey/white row and vertical spacing", () => { closing(referenceMonth); bodyBounds(referenceMonth); });
  check("day: same closing, words, writing space and flowing note/version footer", () => { closing(referenceDay); bodyBounds(referenceDay); });
  check("amount in words stays bold, not a single regular-weight line", () => {
    const line = find(last(referenceMonth), "Rupees Six Thousand Four Hundred Sixty Six Only");
    assert.equal(line.font, 2); close(line.size, 8.625);
  });
  check("PDF object byte offsets/stream lengths valid and every byte is Latin-1", () => {
    pages(referenceDay); pages(referenceMonth);
    assert.ok([...referenceMonth].every((ch) => ch.charCodeAt(0) <= 255));
  });
  check("PDF generation does not mutate saved canteen/salary data", () => {
    const before = JSON.stringify(H.Store.data); day(); month();
    assert.equal(JSON.stringify(H.Store.data), before);
  });
  check("six templates keep their table designs and the same reference closing", () => {
    for (const tpl of C.tpls) { C.setTpl(tpl.id); closing(day()); closing(month()); }
    C.setTpl("neela");
  });
  check("v3.30: summary has one purchase row, no zero-value sale/expense slots", () => {
    fixture([entry("screenshot", 228)]);
    purchaseSummary(day(), "day", 228); purchaseSummary(month(), "month", 228);
    artifact("Hisaab-v3.30-summary-preview.pdf", day());
  });
  check("v3.30: all six templates remove category columns/amount slots while preserving nonzero net", () => {
    fixture([entry("purchase", 228), entry("sale", 910, { kind: "sale" }), entry("expense", 47, { kind: "expense" })]);
    assert.deepEqual(Array.from(C.pdfCols.month, c => c.l), ["Date", "Din", "Entries", "Saman", "Net", "Paid", "Baki"]);
    for (const tpl of C.tpls) {
      C.setTpl(tpl.id);
      const d = day(), m = month();
      purchaseSummary(d, "day", 228); purchaseSummary(m, "month", 228);
      for (const pdf of [d, m]) {
        assert.ok(!pages(pdf).some(pg => pg.texts.some(t => /bikri|kharcha/i.test(t.text))));
        assert.ok(pdf.includes("(" + encoded("₹635.00") + ") Tj"), "910 − 228 − 47 still equals 635");
        bodyBounds(pdf); closing(pdf);
      }
    }
    C.setTpl("neela");
  });
  check("v3.30: print/save-as-PDF removes complete summary slots; source data and app labels remain intact", () => {
    const before = JSON.stringify(H.Store.data);
    for (const which of ["day", "month"]) {
      if (which === "day") C.printDay(); else C.printMonth();
      const root = w.document.querySelector("#print-root"), column = root.querySelector(".meta").children[which === "day" ? 1 : 0];
      assert.equal(column.querySelectorAll(".r").length, 1);
      assert.deepEqual(Array.from(column.querySelectorAll(".r > b"), el => el.textContent), ["₹228.00"]);
      assert.ok(!/bikri|kharcha/i.test(root.textContent));
      if (which === "month") assert.deepEqual(Array.from(root.querySelectorAll("table thead tr:first-child th"), el => el.textContent).slice(0, 7), ["Date", "Din", "Entries", "Saman", "Net", "Paid", "Baki"]);
    }
    assert.equal(JSON.stringify(H.Store.data), before);
    H.go("canteen");
    assert.ok(w.document.getElementById("viewRoot").textContent.includes("Bikri"));
    assert.ok(w.document.getElementById("viewRoot").textContent.includes("Kharcha"));
  });
  check("all ASCII letters/digits work in each weight, not just the PDF's subset", () => {
    const p = new P(), text = "QVXZ jqxz 1234567890 ₹ − — –";
    for (const [i, opt] of [{}, { bold: true }, { black: true }].entries()) p.text(40, 780 - i * 30, 9, text, opt);
    const proof = p.build();
    assert.equal(pages(proof)[0].texts.filter((t) => t.text === encoded(text)).length, 3);
    artifact("font-coverage.pdf", proof);
  });
  check("large amounts fit inside their own cells", () => {
    fixture([entry("large", 999999999999.99)]);
    bodyBounds(day()); bodyBounds(month());
  });

  // More than 60 products / 30 parties exercises real continuation tables.
  fixture(Array.from({ length: 91 }, (_, i) => entry("multi" + i, 10 + i, {
    party: "Supplier " + String(i).padStart(3, "0"), mode: "itemized",
    items: [{ name: "Product " + String(i).padStart(3, "0"), qty: 1, unit: "pcs", rate: 10 + i, priceMode: "unit" }]
  })));
  const multiDay = day(), multiMonth = month();
  artifact("multipage-day.pdf", multiDay); artifact("multipage-month.pdf", multiMonth);
  check("multipage: continuation rows restart at the TOP (not old bottom y)", () => {
    for (const pdf of [multiDay, multiMonth]) {
      const ps = pages(pdf); assert.ok(ps.length >= 3);
      for (const pg of ps.slice(1)) assert.ok(Math.max(...pg.texts.map((t) => t.y)) >= 750);
      bodyBounds(pdf);
    }
  });
  check("multipage: no products/parties silently cut at 60/30", () => {
    const text = pages(multiMonth).flatMap((p) => p.texts.map((t) => t.text)).join("\n");
    for (let i = 0; i < 91; i++) {
      assert.ok(text.includes("Product " + String(i).padStart(3, "0")));
      assert.ok(text.includes("Supplier " + String(i).padStart(3, "0")));
    }
  });
  check("multipage: net + words + signatures + footer all on ONE final page", () => { closing(multiDay); closing(multiMonth); });
  check("multipage: earlier sheets have page markers, final footer is reference-style", () => {
    const ps = pages(multiMonth);
    ps.slice(0, -1).forEach((pg, i) => find(pg, "Page " + (i + 1) + " of " + ps.length));
    assert.ok(!find(ps.at(-1), "Hisaab v3.31").text.includes("Page"));
  });
  check("entries table contains no products; item-wise summary still has them", () => {
    const text = pages(multiDay).map((pg) => pg.texts.map((t) => t.text).join("\n")).join("\n");
    const summary = text.indexOf("SAMAN ITEM-WISE");
    assert.ok(summary > 0 && !text.slice(0, summary).includes("Product "));
    assert.ok(text.slice(summary).includes("Product 090"));
  });

  // A single row much taller than a page must be split safely, not overflow it.
  check("a very long party field also paginates without negative coordinates", () => {
    fixture([entry("tall", 250, { party: "Long supplier name ".repeat(120) })]);
    const pdf = day(); bodyBounds(pdf); closing(pdf);
    assert.ok(pages(pdf).length >= 2); artifact("tall-row.pdf", pdf);
  });
  check("long owner, multi-line amount words and custom footer wrap without overlap", () => {
    fixture([entry("wrap", 987654321.99)]);
    H.Store.data.settings.ownerName = "A very long authorised proprietor and business signatory name";
    H.Store.data.settings.statementNote = (NOTE + " ").repeat(4);
    const pdf = month(), pg = last(pdf);
    bodyBounds(pdf);
    const words = find(pg, "Amount in words:"), prepared = find(pg, "Prepared by");
    const wordsLast = pg.texts.filter((t) => t.font === 2 && t.size === 8.625).at(-1);
    assert.ok(words.y >= wordsLast.y && wordsLast.y - prepared.y >= 64.4);
    const foot = find(pg, "Hisaab v3.31");
    assert.ok(prepared.y - foot.y >= 38.25);
    assert.ok(pg.texts.filter((t) => t.size === 7.5).length > 2);
    artifact("wrapped-closing.pdf", pdf);
    H.Store.data.settings.ownerName = "Proprietor"; H.Store.data.settings.statementNote = NOTE;
  });

  fixture([entry("share", 6466)]);
  let shared = null, blobBytes = null;
  const RealBlob = w.Blob;
  w.Blob = function (parts, opt) { blobBytes = Buffer.from(parts[0]); return new RealBlob(parts, opt); };
  Object.defineProperty(w.navigator, "canShare", { configurable: true, value: () => true });
  Object.defineProperty(w.navigator, "share", { configurable: true, value: (data) => { shared = data; return Promise.resolve(); } });
  C.sharePdf("month", null, YEAR, MONTH);
  await Promise.resolve();
  check("WhatsApp receives the actual embedded-font PDF, not a different format", () => {
    assert.ok(shared && shared.files.length === 1 && blobBytes);
    const pdf = blobBytes.toString("latin1"); closing(pdf);
    assert.equal(shared.files[0].type, "application/pdf");
    assert.ok(pdf.includes("/BaseFont /SegoeUIBlack") && pdf.includes("/FontFile2"));
  });
  check("v3.30: WhatsApp day AND month PDFs omit the same category slots", () => {
    for (const which of ["day", "month"]) {
      shared = null; blobBytes = null; C.sharePdf(which, DATE, YEAR, MONTH);
      assert.ok(shared && blobBytes); purchaseSummary(blobBytes.toString("latin1"), which, 6466);
    }
  });
  await Promise.resolve();
  w.Blob = RealBlob;
  C.printDay();
  const dayPrint = w.document.getElementById("print-root").innerHTML;
  const dayHeaderColumns = w.document.querySelector("#print-root table thead tr").children.length;
  C.printMonth();
  check("browser print uses the same closing wrapper and genuine font family", () => {
    assert.ok(!dayPrint.includes("Σ"), "no old sigma marker / fallback font");
    assert.equal(dayHeaderColumns, 7, "print entries also have no products column");
    const root = w.document.getElementById("print-root");
    assert.equal(root.querySelectorAll(".ct-closing").length, 1);
    assert.ok(root.querySelector(".ct-closing .net + .inwords + .sign + .ft"));
    assert.ok(html.includes("setTimeout(pdfPrintWhenReady, 60)"));
    assert.ok(html.includes("setTimeout(pdfPrintWhenReady, 80)"));
    assert.ok(!/setTimeout\(\(\) => window\.print/.test(html));
    assert.ok(html.includes('.ct-stmt .net{background:#fff;color:#ababab'));
  });
  check("no runtime JS errors", () => assert.deepEqual(errors, []));
  dom.window.close();
  console.log(`\n${failed ? "❌" : "✅"} PDF: ${passed} checks pass${failed ? `, ${failed} FAIL` : ""}`);
  process.exitCode = failed ? 1 : 0;
})().catch((err) => { console.error(err); dom.window.close(); process.exitCode = 1; });
