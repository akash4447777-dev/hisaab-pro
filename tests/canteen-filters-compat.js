/* Narrow v3.31 allowances for prior exact-source regression guards.
   Reverse ONLY the enumerated party/report integration hooks, then compare the
   whole preexisting source. The independent new module has its own behavior,
   PDF geometry, persistence/cloud, stale-state and native-browser tests. */
const assert = require('node:assert/strict');
const hooks = [
  [
    "        const keepParties = d.settings?.canteenParties === undefined && previous.settings.canteenParties !== undefined;\n        const settings = { ...(d.settings || {}), ...(keepParties ? { canteenParties: syncClone(previous.settings.canteenParties) } : {}) };\n        Store.data = normalizeData({ ...d, settings, attendance: d.attendance === undefined ? previous.attendance : d.attendance });",
    "        Store.data = normalizeData({ ...d, attendance: d.attendance === undefined ? previous.attendance : d.attendance });",
    1
  ],
  [
    "        render(); toast((d.attendance === undefined && att().managers.length ? \"Backup restored · purane backup me Attendance nahi thi; existing Attendance kept\" : \"Backup restored — cloud status check karein\") + (keepParties ? \" · purane backup me saved parties nahi thi; existing parties kept\" : \"\"), \"ok\");",
    "        render(); toast(d.attendance === undefined && att().managers.length ? \"Backup restored · purane backup me Attendance nahi thi; existing Attendance kept\" : \"Backup restored — cloud status check karein\", \"ok\");",
    1
  ],
  [
    "  const savedParties = ctSavedPartyRows().length, context = ctDataContext();\n  if (!C.entries.length",
    "  const savedParties = ctSavedPartyRows().length;\n  if (!C.entries.length",
    1
  ],
  [
    "    \"Canteen data erase\", () => {\n      try { ctCheckContext(context); } catch (e) { toast(e.message, \"bad\"); return; }\n      const snap",
    "    \"Canteen data erase\", () => {\n      const snap",
    1
  ],
  [
    "if (parties !== undefined) Store.data.settings.canteenParties = { ...parties, ...(Store.data.settings.canteenParties || {}) }; if (!Store.saveChange())",
    "if (parties !== undefined) Store.data.settings.canteenParties = parties; if (!Store.saveChange())",
    1
  ],
  [
    "const APP_VERSION = \"3.31\";",
    "const APP_VERSION = \"3.30\";",
    1
  ],
  [
    "try { attValidate(this.data.attendance); ctValidateParties(this.data); } catch (e)",
    "try { attValidate(this.data.attendance); } catch (e)",
    1
  ],
  [
    "function openModal(html, opts) {\n  ctReportState = null;\n  attRevokeDownloads();",
    "function openModal(html, opts) {\n  attRevokeDownloads();",
    1
  ],
  [
    "function closeModal() {\n  ctReportState = null;\n  attRevokeDownloads();",
    "function closeModal() {\n  attRevokeDownloads();",
    1
  ],
  [
    "    entries: (c.entries || []).length, rates: (c.rates || []).length, log: (c.log || []).length, parties: ctSavedPartyRows(d).length,",
    "    entries: (c.entries || []).length, rates: (c.rates || []).length, log: (c.log || []).length,",
    1
  ],
  [
    "  return Object.keys(s).some((key) => key !== \"canteenParties\" && syncStable(s[key]) !== syncStable(DEFAULT_SETTINGS[key])) ||",
    "  return Object.keys(s).some((key) => syncStable(s[key]) !== syncStable(DEFAULT_SETTINGS[key])) ||",
    1
  ],
  [
    " + n.rates + \" rates · \" + n.parties + \" saved parties · \" + n.managers",
    " + n.rates + \" rates · \" + n.managers",
    1
  ],
  [
    "  ctValidateParties(d);\n  attValidate(d.attendance, d.attendance && d.attendance.managers === undefined);",
    "  attValidate(d.attendance, d.attendance && d.attendance.managers === undefined);",
    1
  ],
  [
    "return { workers: d && d.workers || [], records: d && d.records || [], entries: c.entries || [], rates: c.rates || [], parties: ctSavedPartyRows(d),",
    "return { workers: d && d.workers || [], records: d && d.records || [], entries: c.entries || [], rates: c.rates || [],",
    1
  ],
  [
    "    UI.ct.edit = null; UI.ct.bulk = null; UI.ct.party = \"all\"; ctPartyViewContext = null; UI.att = null; attEditor = null; attBackupScope = \"\";",
    "    UI.ct.edit = null; UI.ct.bulk = null; UI.att = null; attEditor = null; attBackupScope = \"\";",
    1
  ],
  [
    "[\"day\", \"month\", \"entries\", \"parties\", \"rates\", \"activity\"].indexOf(u.tab)",
    "[\"day\", \"month\", \"entries\", \"rates\", \"activity\"].indexOf(u.tab)",
    1
  ],
  [
    "  if (u.q == null) u.q = \"\";\n  if (typeof u.party !== \"string\") u.party = \"all\";",
    "  if (u.q == null) u.q = \"\";",
    1
  ],
  [
    "  if (u.kind !== \"all\") list = list.filter((e) => e.kind === u.kind);\n  if (u.party !== \"all\") list = list.filter((e) => ctPartyMatches(e, u.party));",
    "  if (u.kind !== \"all\") list = list.filter((e) => e.kind === u.kind);",
    1
  ],
  [
    "  return ctPartyChoices(Array.from(s));\n}\n/* signed money",
    "  return Array.from(s).sort();\n}\n/* signed money",
    1
  ],
  [
    "    [\"entries\", \"🧾 Sab entries\"],\n    [\"parties\", \"👥 Parties\"],",
    "    [\"entries\", \"🧾 Sab entries\"],",
    1
  ],
  [
    "        '<button class=\"btn sm\" data-act=\"ctReportOpen\">📄 PDF · Date / Party</button>' +\n        '<button class=\"btn sm\" data-act=\"ctBulk\" title=\"Word/WhatsApp",
    "        '<button class=\"btn sm\" data-act=\"ctBulk\" title=\"Word/WhatsApp",
    1
  ],
  [
    "  else if (u.tab === \"entries\") body = ctEntriesView();\n  else if (u.tab === \"parties\") body = ctPartiesView();",
    "  else if (u.tab === \"entries\") body = ctEntriesView();",
    1
  ],
  [
    "        '<select class=\"inp\" id=\"ctPartyFilter\" aria-label=\"Filter entries by party\" style=\"width:auto;max-width:100%;min-width:150px\">' + ctPartyOptions(u.party, true) + '</select>' +\n        '<input class=\"inp\" id=\"ctSearch\" placeholder=\"Party, item, bill no. dhoondo…\"",
    "        '<input class=\"inp\" id=\"ctSearch\" placeholder=\"Party, item, bill no. dhoondo…\"",
    1
  ],
  [
    "        (u.q || u.from || u.to || u.kind !== \"all\" || u.party !== \"all\" || u.scope !== \"month\"",
    "        (u.q || u.from || u.to || u.kind !== \"all\" || u.scope !== \"month\"",
    1
  ],
  [
    "            '<select class=\"inp\" id=\"ctPartySelect\" aria-label=\"Saved or existing party\" style=\"margin-bottom:7px\">' + ctPartyOptions(ctPartyKey(d.party) ? ctPartyToken(d.party) : \"\", false) + '</select>' +\n            '<input class=\"inp\" id=\"ctParty\" maxlength=\"90\" list=\"ctPartyList\" value=\"",
    "            '<input class=\"inp\" id=\"ctParty\" list=\"ctPartyList\" value=\"",
    1
  ],
  [
    "  const savedParties = ctSavedPartyRows().length;\n  if (!C.entries.length && !C.rates.length && !C.log.length && !savedParties) return toast(\"Canteen me erase karne ko kuch nahi hai\");",
    "  if (!C.entries.length && !C.rates.length && !C.log.length) return toast(\"Canteen me erase karne ko kuch nahi hai\");",
    1
  ],
  [
    " + C.log.length + \" activity events</b> aur <b>\" + savedParties + \" saved parties</b> delete ho jayenge.<br>\"",
    " + C.log.length + \" activity events</b> delete ho jayenge.<br>\"",
    1
  ],
  [
    "      const snap = JSON.parse(JSON.stringify(Store.data.canteen)), parties = syncClone(Store.data.settings.canteenParties);\n      Store.data.canteen = blankCanteen();\n      if (parties !== undefined) Store.data.settings.canteenParties = {};",
    "      const snap = JSON.parse(JSON.stringify(Store.data.canteen));\n      Store.data.canteen = blankCanteen();",
    1
  ],
  [
    "setUndo(() => { Store.data.canteen = snap; if (parties !== undefined) Store.data.settings.canteenParties = parties; if (!Store.saveChange())",
    "setUndo(() => { Store.data.canteen = snap; if (!Store.saveChange())",
    1
  ],
  [
    "const u = ctUI(); u.q = \"\"; u.kind = \"all\"; u.party = \"all\"; u.from = \"\"; u.to = \"\"; u.scope = \"month\";",
    "const u = ctUI(); u.q = \"\"; u.kind = \"all\"; u.from = \"\"; u.to = \"\"; u.scope = \"month\";",
    1
  ],
  [
    "case \"ctPrintDay\": ctReportOpen(\"day\", \"print\"); break;",
    "case \"ctPrintDay\": ctPrintDay(); break;",
    1
  ],
  [
    "case \"ctPrintMonth\": ctReportOpen(\"month\", \"print\"); break;",
    "case \"ctPrintMonth\": ctPrintMonth(); break;",
    1
  ],
  [
    "case \"ctPdfDay\": ctReportOpen(\"day\", \"download\"); break;",
    "case \"ctPdfDay\": ctPdfDay(ctUI().date); break;",
    1
  ],
  [
    "case \"ctPdfMonth\": ctReportOpen(\"month\", \"download\"); break;",
    "case \"ctPdfMonth\": ctPdfMonth(UI.year, UI.month); break;",
    1
  ],
  [
    "case \"ctSharePdfDay\": ctReportOpen(\"day\", \"share\"); break;",
    "case \"ctSharePdfDay\": ctSharePdf(\"day\", ctUI().date); break;",
    1
  ],
  [
    "case \"ctSharePdfMonth\": ctReportOpen(\"month\", \"share\"); break;",
    "case \"ctSharePdfMonth\": ctSharePdf(\"month\", null, UI.year, UI.month); break;",
    1
  ],
  [
    "             parties: ctParties, savedParties: ctSavedPartyNames, saveParty: ctSavePartyName, partyToken: ctPartyToken,\n             report: ctReportQuery, reportOpen: ctReportOpen, reportOutput: ctReportOutput, pdfRangeStr: ctPdfRangeStr, printRangeHTML: ctPrintRangeHTML,\n             pdfCols: { rangeEntries: CT_REPORT_ENTRY_COLS, day: CT_COLS_DAY",
    "             pdfCols: { day: CT_COLS_DAY",
    1
  ],
  [
    "      'v3.31 — <b style=\"color:var(--ink)\">Canteen: saved parties + Date / Party PDF</b>: Canteen → Parties me naam ek baar save karein; entry me saved / purani party select karein. Har PDF / WhatsApp PDF / Print se pehle From Date, To Date aur Party Selection. Dono date boundaries included; sirf matching entries, original item lines aur unhi ke din / party totals, Paid / Baki / Net. No matches / invalid dates par export blocked. All six styles, company logo aur purani entries safe. Party names JSON / cloud / safety copies me saved.<br>'+\n      'v3.30 — <b style=\"color:var(--ink)\">PDF se Bikri / Kharcha columns removed",
    "      'v3.30 — <b style=\"color:var(--ink)\">PDF se Bikri / Kharcha columns removed",
    1
  ]
];
function withoutPartyReports(source) {
  const start = '/* v3.31 CANTEEN PARTIES / FILTERED REPORTS BEGIN', end = '/* v3.31 CANTEEN PARTIES / FILTERED REPORTS END */';
  if (!source.includes(start)) return source;
  assert.equal(source.split(start).length - 1, 1, 'one independent party/report module');
  assert.equal(source.split(end).length - 1, 1, 'one bounded module end');
  source = source.slice(0, source.indexOf(start)) + source.slice(source.indexOf(end) + end.length + 2);
  for (const [from, to, count] of hooks) {
    assert.equal(source.split(from).length - 1, count, 'exact v3.31 integration: ' + from.slice(0, 90));
    source = source.split(from).join(to);
  }
  assert.ok(!source.includes('ctReport') && !source.includes('canteenParties') && !source.includes('ctSavedParty'), 'all and only specified new hooks reversed');
  return source;
}
module.exports = { withoutPartyReports };
