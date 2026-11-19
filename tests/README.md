# Hisaab Pro — tests (developer only)

Ye folder **app ke liye zaroori nahi**. `hisaab_v3.html` / `Hisaab-Pro-v3.28.html` akeli file me chalti hai —
kisi install ki zaroorat nahi. Ye tests sirf tab chalao jab code me change kiya ho aur check karna ho
ki **Attendance**, **Canteen**, salary, PDF, loader aur **cross-device cloud sync** toot to nahi gaye.
Attendance use/rule details: [`ATTENDANCE.md`](../ATTENDANCE.md).

## Chalane ka tarika

```bash
cd tests
npm ci               # lockfile se jsdom install hota hai
npm test             # 961: canteen 406 + lines 51 + loader 29 + PDF 26 + cloud 103 + Attendance 313 + Employee 33
node canteen.test.js ../Hisaab-Pro-v3.28.html   # kisi aur file par chalana ho
node loader.test.js  # sirf index.html loader ke tests
node pdf.test.js     # fonts + bottom geometry + multi-page
node cloud.test.js   # fake backend + independent browser stores, 103 sync checks
node attendance.test.js # calculation, forms, backup, exports: 313 checks
node employees.test.js  # 33 whole-panel labels + legacy data/exports/CRUD checks
node canteen-lines.test.js # 51 original-line, report/data-safety checks
node canteen-lines.test.js --artifacts ../.cache/canteen-lines-qa # optional real PDFs
HISAAB_HTML=../Hisaab-Pro-v3.28.html npm test  # exact release, all 961 checks
node attendance.test.js --artifacts ../.cache/attendance-qa # real fixture PDF + .xlsx
node pdf.test.js --artifacts ../.cache/pdf-qa # optional local sample PDFs
```

Sab theek ho to aakhri line aati hai: `✅ SAB CHECKS PASS` / `✅ LOADER SAB TESTS PASS`

## Kya-kya test hota hai

| Area | Checks |
|---|---|
| Canteen item lines (v3.28), 51 | exact two × 500g reproduction against v3.27; every saved line/own rate/amount/source retained, duplicate lines in one entry, dates/case/units/kinds/lump-sum/zero/precision/order/escaping, non-mutating frozen input, daily/monthly UI + full print + all six PDF templates, 100-row continuation, honest 14-/6-line previews, real shared PDF File bytes, preserved cumulative rate analytics/CSV and complete raw storage/data/cloud state; 23 core/report function bodies plus full CSS unchanged |
| Optional Canteen Chromium (49, not in npm test) | real old-release forms/PDF reproduce merged 1000g, byte-identical v3.27→v3.28 storage navigation, native 500g per-row downloads/print/share Files, same-bill 37.50/50 own rates, correct grand total, 100 repeated rows, reload, cumulative catalog, 320/390px scrolling tables and every original salary/Attendance/canteen entry retained; print/share destinations stubbed |
| Employee terminology (v3.27), 33 | whole-panel visible text/placeholders/tooltips, Employee navigation/add/edit/validation/statuses, stable g+w route and command search, destructive confirmations cancelled, unchanged monthly/hourly salary math/advances/deductions, salary PDF drawing ops differ only in labels, real CSV/print/share text, cloud display-only alias, old JSON import and raw-data compatibility, customer-entered names/notes/shop names untouched, 20 byte-identical core/report functions plus original CSS/fonts |
| Attendance (v3.27), 313 | dynamic profiles/unique codes/same-name resolution, active/employment rules, Tap/Time + Morning/Afternoon/Evening/Night and legacy Day, strict post-11:45-PM monthly bonus thresholds/exclusions/full-month all-shift basis/next-morning/attendance-month attribution and duplicate-history exclusion, 12-hour Morning/Afternoon/Evening/Night clocks in both Check-in/Check-out, all eight same/next-day choices, exhaustive 1,440-minute round-trips with bare/same/next-day prefixes, clock-band boundaries/mismatch rejection, 12 afternoon=noon / 12 night=midnight, blank-only suggestions, v3.24 raw-storage reopening without time/history/financial mutation, invalid 24-hour input rejection, old record reopening, blank clocks/period suggestions, mobile numeric/Hindi entry, actual durations including 24h 01m / screenshot 27h 01m / 36h / 47h 59m, exact same/next-day combinations, reversed/equal rejection, no deductions/automatic target classification, manual half-day/credit snapshots, open check-ins, Sunday status/date/shift dedup, month/year boundaries, filters/search/pagination, duplicate prevention, bulk skip/overwrite, actual forms, calendar/ledger/day/week/month/custom/search/sort, dashboard/settings/keyboard, escaped text, history/actor/before-after, stale editor/account/disk guards, quota rollback, local reload, old JSON/demo/reset/recovery preservation, 250 managers + 750 records pagination and 2,000-history limit |
| Attendance exports (included above) | top first-sheet summary with numeric distinct present/status days, all actual Sunday dates, per-month full-basis numeric bonus rates; photo-style Date / manager-status / IN / OUT / blank Advance / Shift / Hours / Credit / Notes grid; no fabricated advance amounts, totals or salary-employee joins; empty/partial/multi-month/long-summary/profile-newline safety; unchanged four v3.25 detail XMLs and Attendance PDF (except version footer), genuine individual PDF + 5-sheet OOXML XLSX; chosen manager/shift/custom dates, unmarked vs absent, xrefs/stream lengths/paper bounds, one/two-page monthly layouts and explicit oversized-range refusal, bundled Hindi font + complete OFL notice, ZIP/CRC/XML/numeric hours, Unicode/emoji/formula-safe literal text, reference-style ruled 7-column ledger + dated Sunday list + outlined bonus/rule box + numeric Excel bonus Summary, styled primary register (real dates / `[h]:mm`, borders, gold Sundays, status colours, merges, pinned identity/date columns, actual table filters and identity print titles), atomic totals/signatures, original history/legacy metadata, actual Blob MIME/filenames/ready-file links/no-gesture fallback/failure reporting and full Store/localStorage/history/sync-state invariance, nine byte-identical storage/cloud/financial/clock-action core function bodies plus unchanged attCalculate arithmetic (only three error messages updated), byte-identical v3.23 stylesheet/embedded fonts/shared PDF engine, and salary/canteen non-mutation |
| Attendance cloud (27 of the 103 cloud checks) | four-shift cloud adoption/concurrent merge/offline reload with legacy Day/Night intact and no salary bonus writes, long-shift upload/adoption/re-edit, independent records, same-natural-key dedup/conflict, note+clock merges vs atomic competing clock spans, profile/record deletion dependencies, duplicate code/moved-key collisions, full and partial legacy payloads, proven deletion vs unproven empties, durable offline reload, open-editor/account reset, invalid-cloud/quota rollback/recovery and rule conflicts |
| Optional Employee Chromium (26, not in npm test) | real v3.26→v3.27 navigation with byte-identical raw data, eight live view label/tooltip audits, command search, add/edit/reload persistence under original keys, real salary CSV/six-page payroll PDF/download/print/share text, cancelled delete, 320/390px view/form bounds, every original employee/salary/canteen/Attendance record retained, no JS errors; print/WhatsApp navigation stubbed, never delivery |
| Optional Attendance Chromium (126, not in npm test) | six actual downloaded-XLSX checks: top summary, reference column order/black grid/blank Advance, five-sheet completeness, 62 shifts vs 31 distinct days, long-summary visibility and real numeric 2% bonus, eight exact clock-dropdown choices, native afternoon/evening/after-midnight saves and explicit day flags, mismatched clock/period refusal with full storage invariance, blank-only shift/profile suggestions, real v3.24→v3.26 navigation with byte-identical raw storage and original 27h 01m, real four-shift forms/reload, 3→1% / 5→2% bonus and exact 11:45 exclusion, real PDF File payload to stubbed native share API/cancel/manual-fallback download, real profile/record/bulk forms, exact 12-hour options/blank clocks/validation, actual overnight hours/reopening, screenshot long-shift save/re-edit/download, 31-day / 62-shift PDF cap and styled-register downloads, full-year Excel after honest oversized-PDF failure, report-studio 320/390px layout, and full saved-data/history/storage invariance, Sunday tab/count/dedup/filters, noon/midnight conversion, duplicate UI error, calendar day, custom-range Latin/overnight/Hindi PDF/XLSX native downloads/headers, 320/390px mobile controls/no-overflow/navigation, visible dialog title/Save buttons, real reload persistence, bundled Hindi fonts/ActualText and no uncaught JS errors; optional desktop/mobile/modal/calendar/dark screenshots |
| PDF summary labels (v3.18) | screenshot ke Bikri/Kharcha labels blank, zero aur nonzero amounts same right-aligned positions par; saare 6 templates ke day/month drawing ops v3.17 se identical (sirf 2 labels/version differ); print + WhatsApp PDF bhi same; app labels/data unchanged |
| Safe cloud sync (v3.17) | canteen-only/records/rates/log/settings-only login, demo suppression, stale demo flags, no echo, independent changes + first-insert/CAS races, financial/employee-delete-v-salary/payment conflicts, exact-value re-approval, in-flight edits/save failures, offline reload + online retry, legacy missing/empty snapshots, RLS/read/write failures, null stamp, account/project/logout/late-session guards, cross-tab stale writes, corrupt JSON/cache, quota rollback, photo dedup, scoped recovery, no fake success, modal baseline guard |
| Loader safety (v3.17) | API list + latest release, API failure par cached older build se pehle known data-safety fix, future cached release aur missing-cache fallback, file chooser |
| Boot | sidebar me Canteen, `Store.data.canteen`, sample data, version badge, dashboard card |
| Tabs | day / month / entries / rates / activity — sab render, koi `NaN`/`undefined` nahi |
| Item-wise entry | qty × rate ka total, paid/baki, rate list me auto-add |
| Ek-saath total | lump-sum amount, rate column disabled, rate list untouched |
| Line-total price mode (v3.2) | `₹ poori line` select: 4 × ₹360 → total ₹360, per-unit ₹90 derive, amount ke neeche `= ₹90/kg`, rate list me 90/kg, edit me mode/lineTotal wapas, line↔unit toggle par number carry, ledger me Σ chip |
| Bulk accuracy + OCR (v3.6) | scoring parser (code/qty-rate-total/90kg/per kg/(4)/nos/1,740/-/naam-me-number), total-verify chip, paid/baki info, editable preview + carry, OCR stub se photo→text→entries+photo |
| Reference fonts + bottom (v3.16) | Segoe UI Regular/Bold/Black embedded, real ₹/minus, widths + ToUnicode, measured light net / rounded dashed box / 52px writing gap / flowing note/version, atomic closing, 91-item/party continuation, tall rows, wrapped notes, large amounts, actual WhatsApp file, data non-mutation |
| Entries clean + alignment (v3.15) | no products in entries table, wide amount cols, page-break guards, em-dash |
| Print CSS exact mirror (v3.14) | full grid tables, dashed meta/box lines, sign boxes, footer version, px→pt sizes |
| PDF = print same-to-same (v3.13) | din+mahina PDF print-view mirror: meta KV, entries/items/party tables, net band, in-words, signature |
| Print-ledger format (v3.12) | photo wala layout: head/summary/din-wise+total row/item-wise/party-wise, 6 template accents, WhatsApp same format |
| PDF alignment pro (v3.11) | sab tables CW-full width, symmetric row rhythm, frame/hairline exact, uniform padding, 6 templates me valid |
| Clean PDF + HISAAB rename (v3.10) | koi Σ/? garbage nahi, item naam saaf, title/brand HISAAB, NET band, picker mini-previews ×6 |
| PDF templates (v3.9) | 6 templates × din+mahina PDF, colour operators, setTpl validation/persist, 🎨 picker modal cards ✓ |
| PDF theme + WhatsApp PDF (v3.8) | branded header/zebra/totals cards/page footers; 📤 share: Web Share file route + desktop fallback (download + wa.me) |
| Accuracy pro (v3.7) | Devanagari/sr-no/bullet/inline-date/sirf-qty skip; OCR clean (O→0,l→1) + enhancePixels + confidence; rate-list ⚠ cross-check + ek-click fix; duplicate chip; WhatsApp mahina; rate history; dashboard quick buttons |
| Bulk paste (v3.5) | parser formats (line-total, @/x rate, comma, dozen, date line, skip rules) + UI: preview, 3 alag entries, amounts, undo, ek-entry mode |
| Bill photo + PDF + unit auto (v3.4) | photo upload box → thumb → save → 📷 tag → lightbox → delete; PDF din/mahina (%PDF, tables); naam se unit auto (gram/ltr/dozen/pkt/kg) + user-unit respect |
| Gram / smart default (v3.3) | khaali line default `₹ poori line`; 600 gram = ₹45 → total 45 (27,000 nahi), `= ₹0.075/gram`; rate list me 0.075 safe; naam likhte hi known item par mode flip + rate/unit auto-fill |
| Validation | khaali entry, bina rate wali entry |
| Ledger math | `net = bikri − saman − kharcha`, din/mahine ka roll-up |
| Payment | baki chukta, activity log |
| Delete / Undo / Restore | toast undo + Activity se restore |
| Duplicate | entry copy, date aaj, paid reset |
| Filters | search (focus safe), type, month/all/custom range |
| Rate list | add / edit / delete / undo, entry me rate auto-fill |
| CSV · Print · WhatsApp | header (naya `Price mode` column), lump-sum vs item-wise rows, line-mode row, day + month print |
| Persistence | localStorage me canteen + salary data |
| Purana backup | bina `canteen` key wala JSON restore → key auto-create |
| Canteen-only wipe | sirf canteen erase, employees safe, undo |
| Regression | hisaab / ledger / employees / records / dashboard pehle jaise |

Font analysis, embedding notices aur locally licensed input se rebuild: [`PDF-FONTS.md`](../PDF-FONTS.md).
PDF fixtures optionally `.cache/` me bante hain; Git me nahi jaate.


## Optional real-browser Attendance QA

The regular suite only needs locked jsdom dependencies. Native browser QA is
separate so a Chromium download is not required for every `npm test` run:

```bash
# In tests/, after npm ci (does not change package.json/lockfile):
npm install --no-save --package-lock=false playwright
npx playwright install chromium
# In another terminal, serve the repository root; default script port is 8000:
# python3 -m http.server 8000 --bind 0.0.0.0
HISAAB_URL=http://127.0.0.1:8000/hisaab_v3.html npm run test:attendance:browser
# Exact release and screenshots:
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.28.html HISAAB_SCREENSHOTS=1 npm run test:attendance:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.28.html HISAAB_SCREENSHOTS=1 npm run test:employees:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.28.html HISAAB_SCREENSHOTS=1 npm run test:canteen:browser
```

`127.0.0.1` here is only the **local test runner**, never a browser-facing app API.
The test runs on a local server or a `file:///absolute/path/...html` URL. It opens
isolated **browser processes**, uses disposable fixtures, and never touches a
customer account. `HISAAB_ARTIFACTS` changes the output folder (default ignored
`.cache/attendance-browser-qa`). `HISAAB_CHROME_EXECUTABLE` and
`HISAAB_CHROME_ARGS` (JSON array) support a supplied browser. `NODE_PATH` can point
at scratch-installed Playwright instead of adding it to the locked dependencies.
On a serverless Chromium build, software `--disable-gpu` rendering was used for
stable captures; serverless SwiftShader/single-process flags were omitted.

Review native form inputs/download events as well as API fixtures. Inspect PDFs
with PyMuPDF and workbooks with openpyxl if export code changes. Hindi image-backed
ActualText is checked separately: copy/search support varies by PDF parser/viewer.
v3.28 adds **51 offline + 49 native** repeated-item regressions; the complete suite
is **961 offline + 201 native** checks. Template selection intentionally saves
Settings, so its tests use a separate fixture; report read-only/raw-storage
assertions remain strict. PDF geometry checks account for the existing y=22
continuation-only footer and y=64..820 body, including measured/aligned widths.
Fixtures use actual original-line amounts (legacy normalization deliberately
preserves explicit entry totals; this fix never recalculates saved finances).
The old-release 1000g PDF and fixed two-500g real downloads are independently
parsed alongside 100-row documents. PyMuPDF/openpyxl reparse **41 PDFs + eight
XLSX workbooks** (including that one legacy-PDF reproduction): actual quantity/
unit/own-rate/own-amount cells, no clipped glyph/image bounds, repeated headers,
all 100 rows, closing on final page only, Attendance two-page maximum, six-page
Employee payroll, complete numeric five-sheet workbooks and blank Advances.
QA screenshots/artifacts remain ignored.

v3.27 QA independently parsed/rendered **10 PDFs + 8 XLSX workbooks** from native
downloads. PyMuPDF confirms unrepaired A4 output, page/text bounds, the new EMPLOYEE
payroll column within its original width and all five Employee signature labels
within the original lines (six-page full payroll), plus the unchanged maximum-two-
page Attendance reports. openpyxl checks all five sheets, real numeric date/hour/
credit/bonus values, original totals, full-year 396 rows, C4 freeze/identity print
rows, black grids/yellow Sundays and genuinely blank manual Advance cells/totals.
Whole-script AST comparison against v3.26 accounts only for audited UI literals,
version/note and the display-only cloud path alias: identifiers, arithmetic,
operators, callback/control-flow structure and data keys stay identical. The new
unit suite also checks 20 core/report function bodies plus complete CSS/fonts.
Native screenshots wait for modal animations; add/edit tests await the existing
scheduled autofocus before native insertText. The historical fixture is marked
non-demo before editing, because both releases intentionally clear demo flags on
first save. No data-invariance assertion is weakened for demo status.
Generated QA artifacts/dependencies stay ignored, not in Git. The old FileReader
fixture tests still await real loadend, not a race-prone fixed sleep.
The native share API is stubbed; tests validate actual PDF File bytes and honest
cancellation/manual-attachment fallback, **not an OS chooser, WhatsApp recipient or delivery**.
This is desktop/mobile-viewport Chromium testing, **not physical-phone, Safari,
or live customer Supabase testing**.

## Cloud test setup aur limits

`cloud.test.js` independent jsdom browser stores ko ek deterministic, RLS-scoped fake Supabase server se connect karta hai. Har account ka row alag; reads/writes/auth ko delay/fail kar sakte hain. Compare-and-set filter, unique insert race, pending disk cache aur exact payloads assert hote hain—sirf status text nahi. Har test ke timers/windows close hote hain aur **saare browsers** ke runtime errors aggregate hote hain.

Tests **real Supabase project, email password ya customer data** use nahi karte. Physical devices/live RLS config ka test nahi hai. Chromium smoke QA do separate desktop/mobile-size browser processes, real UI login/entry forms, offline reload, reconnect+merge, financial conflict choice aur recovery list par mock backend ke saath ki gayi. Optional browser/PDF artifacts `.cache/` me hain, Git me nahi.

Existing project ko reset nahi karna; update/recovery, backend schema + RLS expectations aur known limits: [`CLOUD-SYNC.md`](../CLOUD-SYNC.md). **Sab clients update karein**—old cached clients ke unsafe writes ko is client-side fix se server par reject nahi kiya ja sakta. localStorage rollback best-effort/finite hai, historical backup ka substitute nahi.
