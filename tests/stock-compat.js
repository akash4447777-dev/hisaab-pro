/* v3.32 exact integration allowance: strip only the bounded Stock module and
   scoped CSS, then reverse each enumerated hook to immutable v3.31. Existing
   regression suites keep comparing the ENTIRE preexisting program. */
const assert = require('node:assert/strict');
const { withoutStockImport } = require('./stock-import-compat');
const hooks = [
  [
    "      'v3.32 — <b style=\"color:var(--ink)\">Stock Management</b>: Products + photo + opening entry; Stock In / purpose-wise Out / customer, salesperson aur delivery details wali Sale. Live stock transactions se auto-calculate; date / product / party / salesperson filters, full history, audited edit/delete aur minimum-stock warnings. Negative dated balance par save blocked; JSON / configured cloud / safety copies included. Purana salary, Canteen aur Attendance data unchanged.<br>'+\n      'v3.31 — <b style=\"color:var(--ink)\">Canteen: saved parties + Date / Party PDF",
    "      'v3.31 — <b style=\"color:var(--ink)\">Canteen: saved parties + Date / Party PDF",
    1
  ],
  [
    "  stock: { data: stkData, blank: stkBlank, validate: stkValidate, quantity: stkQty, inventory: stkInventory, query: stkQuery, ledger: stkLedger,\n    saveProduct: stkSaveProduct, deleteProduct: stkDeleteProduct, saveEntry: stkSaveMovement, deleteEntry: stkDeleteMovement,\n    ui: stkUI, context: stkContext, openProduct: stkOpenProduct, openEntry: stkOpenMovement },\n  /* canteen module API */\n  canteen:",
    "  /* canteen module API */\n  canteen:",
    1
  ],
  [
    "    if (UI.view === \"stock\") { stkUI().q = UI.search; stkUI().page = 0; }\n    if (UI.view !== \"stock\" && UI.view !== \"attendance\" && UI.view !== \"hisaab\"",
    "    if (UI.view !== \"attendance\" && UI.view !== \"hisaab\"",
    1
  ],
  [
    "a: \"attendance\", c: \"canteen\", i: \"stock\", r: \"records\"",
    "a: \"attendance\", c: \"canteen\", r: \"records\"",
    1
  ],
  [
    "        stkResetSession(); render(); toast(\"Data cleared — safety copy available; cloud status check karein\");\n      }, true); break;\n    }",
    "        render(); toast(\"Data cleared — safety copy available; cloud status check karein\");\n      }, true); break;",
    1
  ],
  [
    "        try { stkCheck(context); } catch (e) { toast(e.message, \"bad\"); return; }\n        const previous = Store.data; Store.data = stkPreserve(previous, blankData(), true);",
    "        const previous = Store.data; Store.data = blankData();",
    1
  ],
  [
    "saare employees, salary records, canteen, manager attendance aur Stock Management (photos / audit samet)</b>",
    "saare employees, salary records, canteen aur manager attendance</b>",
    1
  ],
  [
    "    case \"wipeData\": {\n      const context = stkContext();\n      confirmDialog",
    "    case \"wipeData\":\n      confirmDialog",
    1
  ],
  [
    "Store.data = stkPreserve(previous, { ...sampleData(), attendance: previous.attendance });",
    "Store.data = { ...sampleData(), attendance: previous.attendance };",
    1
  ],
  [
    "\"Current employees, salary records aur canteen data demo se replace honge. Manager attendance aur Stock Management safe rahenge.",
    "\"Current employees, salary records aur canteen data demo se replace honge. Manager attendance safe rahegi.",
    1
  ],
  [
    "    case \"stkAdd\": try { stkOpenProduct(); } catch(e) { toast(e.message, \"bad\"); } break;\n    case \"attAdd\": attOpenRecord(); break;",
    "    case \"attAdd\": attOpenRecord(); break;",
    1
  ],
  [
    "      (stkHasConflict(pending) ? \"Stock conflict: combined entries se negative balance, duplicate product ya changed product/unit ho sakta hai. Affected product ki poori dependent entry-set selected device se li jayegi; losing rows safety copy aur audit me rahengi. Independent products merge honge.\" : \"Dono devices ne same fields badli hain. Alag entries dono taraf ki rahengi — sirf conflicting values ke liye choice hai.\"))",
    "      \"Dono devices ne same fields badli hain. Alag entries dono taraf ki rahengi — sirf conflicting values ke liye choice hai.\")",
    1
  ],
  [
    "      if (value.products) return value.products.map(p => p.name).join(\", \") + \" · \" + (value.transactions || []).length + \" stock entries\";\n      if (value.productName) return value.productName + \" · \" + (STK_KINDS[value.type] || \"Stock\") + \" · \" + stkFmt(value.qty) + \" \" + (value.unit || \"\") + \" · \" + (value.date || \"\");\n      if (value.worker) return value.worker.name",
    "      if (value.worker) return value.worker.name",
    1
  ],
  [
    "        if (choiceValid && result.conflicts.some(path => path.startsWith(\"settings.stockInventory\"))) stkResolutionAudit(result.data, local, rdata, options.preference);\n        const storedRemote = remote ? syncView(remote.payload) : rdata;",
    "        const storedRemote = remote ? syncView(remote.payload) : rdata;",
    1
  ],
  [
    "    attValidate(data.attendance); stkValidate(stkData(data));\n    const next",
    "    attValidate(data.attendance);\n    const next",
    1
  ],
  [
    "UI.ct.party = \"all\"; ctPartyViewContext = null; UI.att = null; attEditor = null; attBackupScope = \"\"; stkResetSession();",
    "UI.ct.party = \"all\"; ctPartyViewContext = null; UI.att = null; attEditor = null; attBackupScope = \"\";",
    1
  ],
  [
    "      try { attValidate(recovered.attendance); stkRecoveryCheck(recovered, before, copy.payload); } catch (e)",
    "      try { attValidate(recovered.attendance); } catch (e)",
    1
  ],
  [
    "    managers: (d && d.attendance || {}).managers || [], attendance: (d && d.attendance || {}).records || [],\n    stockProducts: stkData(d).products, stockEntries: stkData(d).transactions, stockHistory: stkData(d).history, stockImages: stkData(d).images };",
    "    managers: (d && d.attendance || {}).managers || [], attendance: (d && d.attendance || {}).records || [] };",
    1
  ],
  [
    "  attValidate(d.attendance);\n  stkValidate(stkData(d));\n  return syncView(d);",
    "  attValidate(d.attendance);\n  return syncView(d);",
    1
  ],
  [
    "  ctValidateParties(d);\n  stkValidate(stkData(d));\n  attValidate",
    "  ctValidateParties(d);\n  attValidate",
    1
  ],
  [
    "  attMergeSafety(data, base, local, remote, preference, conflict, eq);\n  stkMergeSafety(data, base, local, remote, preference, conflict, eq);",
    "  attMergeSafety(data, base, local, remote, preference, conflict, eq);",
    1
  ],
  [
    "    if (path.startsWith(\"settings.stockInventory.history[\") || path.startsWith(\"settings.stockInventory.images[\")) {\n      conflicts.push(path); details.push({ path, local: syncStable(l), remote: syncStable(r) }); return syncClone(preference === \"remote\" ? r : l);\n    }\n    if (path.endsWith(\".updatedAt\")) return Math.max(num(l), num(r));",
    "    if (path.endsWith(\".updatedAt\")) return Math.max(num(l), num(r));",
    1
  ],
  [
    " + n.attendance + \" attendance\" + (n.stockProducts || n.stockEntries || n.stockHistory || n.stockImages ? \" · \" + n.stockProducts + \" stock products · \" + n.stockEntries + \" stock entries · \" + n.stockHistory + \" stock audit · \" + n.stockImages + \" stock photos\" : \"\");",
    " + n.attendance + \" attendance\";",
    1
  ],
  [
    "key !== \"canteenParties\" && key !== \"stockInventory\" && syncStable(s[key])",
    "key !== \"canteenParties\" && syncStable(s[key])",
    1
  ],
  [
    "    managers: ((d && d.attendance || {}).managers || []).length, attendance: ((d && d.attendance || {}).records || []).length, attendanceHistory: ((d && d.attendance || {}).history || []).length,\n    stockProducts: stkData(d).products.length, stockEntries: stkData(d).transactions.length, stockHistory: stkData(d).history.length, stockImages: stkData(d).images.length };",
    "    managers: ((d && d.attendance || {}).managers || []).length, attendance: ((d && d.attendance || {}).records || []).length, attendanceHistory: ((d && d.attendance || {}).history || []).length };",
    1
  ],
  [
    "      } catch (e) { toast(e.message || \"Invalid backup file\", \"bad\"); }",
    "      } catch (e) { toast(\"Invalid backup file\", \"bad\"); }",
    1
  ],
  [
    "        stkImportSettings(settings, d, previous);\n        Store.data = normalizeData({ ...d, settings, attendance: d.attendance === undefined ? previous.attendance : d.attendance });",
    "        Store.data = normalizeData({ ...d, settings, attendance: d.attendance === undefined ? previous.attendance : d.attendance });",
    1
  ],
  [
    "        stkCheck(importContext);\n        const d = JSON.parse(rd.result);\n        validateRemote",
    "        const d = JSON.parse(rd.result);\n        validateRemote",
    1
  ],
  [
    "function importData() {\n  const importContext = stkContext();\n  const inp",
    "function importData() {\n  const inp",
    1
  ],
  [
    "function closeModal() {\n  stkEditor = null;\n  ctReportState = null;",
    "function closeModal() {\n  ctReportState = null;",
    1
  ],
  [
    "function openModal(html, opts) {\n  stkEditor = null;\n  ctReportState = null;",
    "function openModal(html, opts) {\n  ctReportState = null;",
    1
  ],
  [
    "    { t:\"Stock Management — inventory, history & audit\", k:\"g i\", act:\"nav\", v:\"stock\", ic:\"▣\" },\n    { t:\"Records & History\", k:\"g r\",",
    "    { t:\"Records & History\", k:\"g r\",",
    1
  ],
  [
    "  const monthControls = $(\".topbar-actions .mp\");\n  if (monthControls) monthControls.style.display = UI.view === \"stock\" ? \"none\" : \"\";\n  /* on phones the top bar scrolls sideways — keep the active tab visible */",
    "  /* on phones the top bar scrolls sideways — keep the active tab visible */",
    1
  ],
  [
    "  if (globalSearch) { globalSearch.placeholder = UI.view === \"stock\" ? \"Search product / party / salesperson…\" : UI.view === \"attendance\" ? \"Search managers / attendance…\" : \"Dhoondo…\"; globalSearch.value = UI.view === \"stock\" ? stkUI().q : UI.view === \"attendance\" ? attUI().q : UI.search; }",
    "  if (globalSearch) { globalSearch.placeholder = UI.view === \"attendance\" ? \"Search managers / attendance…\" : \"Dhoondo…\"; globalSearch.value = UI.view === \"attendance\" ? attUI().q : UI.search; }",
    1
  ],
  [
    "    else if (UI.view === \"canteen\") { topAdd.dataset.act = \"ctAdd\"; topAdd.textContent = \"＋ Canteen entry\"; }\n    else if (UI.view === \"stock\") { topAdd.dataset.act = \"stkAdd\"; topAdd.textContent = \"＋ Add product\"; }",
    "    else if (UI.view === \"canteen\") { topAdd.dataset.act = \"ctAdd\"; topAdd.textContent = \"＋ Canteen entry\"; }",
    1
  ],
  [
    "  else if (UI.view === \"stock\") root.innerHTML = viewStock();\n  else if (UI.view === \"records\") root.innerHTML = viewRecords();",
    "  else if (UI.view === \"records\") root.innerHTML = viewRecords();",
    1
  ],
  [
    "  stock:     [\"Stock Management\", \"Products · Stock In / Out / Sales · live availability · complete history & audit\"],\n  records:   [\"Records & History\",",
    "  records:   [\"Records & History\",",
    1
  ],
  [
    "    (ctCount ? \" · \" + ctCount + \" canteen\" : \"\") + (att().managers.length ? \" · \" + att().managers.length + \" managers\" : \"\") + (stkData().products.length ? \" · \" + stkData().products.length + \" products\" : \"\");\n  stkNavBadge();",
    "    (ctCount ? \" · \" + ctCount + \" canteen\" : \"\") + (att().managers.length ? \" · \" + att().managers.length + \" managers\" : \"\");",
    1
  ],
  [
    "try { attValidate(this.data.attendance); ctValidateParties(this.data); stkValidate(stkData(this.data)); } catch (e)",
    "try { attValidate(this.data.attendance); ctValidateParties(this.data); } catch (e)",
    1
  ],
  [
    "      <button data-view=\"stock\"><span class=\"ico\">▣</span>Stock Management<span class=\"nav-badge\" id=\"navStockLow\" style=\"display:none\">0</span></button>\n      <button data-view=\"records\"><span class=\"ico\">◷</span>Records</button>",
    "      <button data-view=\"records\"><span class=\"ico\">◷</span>Records</button>",
    1
  ],
  [
    "<span>Salary · Attendance · Canteen · Stock</span>",
    "<span>Salary · Attendance · Canteen</span>",
    1
  ],
  [
    "<title>Hisaab — Salary, Attendance, Canteen &amp; Stock Panel</title>",
    "<title>Hisaab — Salary, Attendance &amp; Canteen Panel</title>",
    1
  ],
  [
    "const APP_VERSION = \"3.32\";",
    "const APP_VERSION = \"3.31\";",
    1
  ]
];
function withoutStock(source) {
  source = withoutStockImport(source);
  if (!source.includes('/* v3.32 STOCK MANAGEMENT BEGIN')) return source;
  for (const [start,end] of [['/* v3.32 STOCK MANAGEMENT BEGIN','/* v3.32 STOCK MANAGEMENT END */'],['/* v3.32 STOCK STYLE BEGIN */','/* v3.32 STOCK STYLE END */']]) {
    assert.equal(source.split(start).length-1,1,'one Stock module start');
    assert.equal(source.split(end).length-1,1,'one Stock module end');
    let tail=source.indexOf(end)+end.length; if(source[tail]==='\n')tail++; if(start.includes('MANAGEMENT')&&source[tail]==='\n')tail++;
    source=source.slice(0,source.indexOf(start))+source.slice(tail);
  }
  for (const [from,to,count] of hooks) {
    assert.equal(source.split(from).length-1,count,'exact Stock hook: '+from.slice(0,90)); source=source.split(from).join(to);
  }
  return source;
}
module.exports = { withoutStock, hooks };
