# Hisaab Pro — tests (developer only)

Ye folder **app ke liye zaroori nahi**. `hisaab_v3.html` / `Hisaab-Pro-v3.42.html` akeli file me chalti hai —
kisi install ki zaroorat nahi. Ye tests sirf tab chalao jab code me change kiya ho aur check karna ho
ki **Stock**, **Attendance**, **Canteen**, salary, PDF, loader aur **cross-device cloud sync** toot to nahi gaye.
Guides: [`STOCK-MANAGEMENT.md`](../STOCK-MANAGEMENT.md) · [`CANTEEN-REPORTS.md`](../CANTEEN-REPORTS.md) · [`ATTENDANCE.md`](../ATTENDANCE.md).

## Chalane ka tarika

```bash
cd tests
npm ci               # lockfile se jsdom install hota hai
npm test             # all current offline suites, ending with automatic Smart Stock Paste
node canteen.test.js ../Hisaab-Pro-v3.42.html   # kisi aur file par chalana ho
node stock.test.js      # 129 derived inventory/CRUD/audit/forms/import/recovery checks
node stock-cloud.test.js # 36 CAS/RLS/conflict/offline/adversarial/photo safety checks
npm run test:stock       # both original Stock targeted suites
npm run test:stock:import # 89 additive CSV/JSON opening-import checks
npm run test:stock:link   # 70 private fragment/consent/date/cloud/generator checks
npm run test:stock:message # 116 read-only parser/OCR/roles/dedup/cutoff/atomic/context/cloud checks
npm run test:stock:easy    # 61 progressive review/tags/PDF/atomic/context compatibility checks
npm run test:stock:combo   # one-party grouping / whole-combo atomic edit-delete / pagination checks
npm run test:stock:match   # 75% unique matching / ambiguity / unchanged stock guards
npm run test:stock:units   # grouped presets/custom/save/legacy/exact units and locks
npm run test:stock:pdf     # approved premium design / exact unit totals / read-only exports
npm run test:stock:smart   # automatic flexible paste / partial success / one-combo clarification / no-write refusals
npm run test:stock:receipt # typed incoming links: no opening/available overwrite, review/new/existing/date/dedup/atomic
node stock-combo.test.js --artifacts ../.cache/combo-pdf-qa # actual combined PDF
node stock-easy.test.js --artifacts ../.cache/stock-pdf-qa # actual read-only Stock PDFs
python3 ../scripts/build-stock-smart.py # current v3.42 deterministic build + exact v3.41 reversal; NEVER run older builders on canonical/published archives
node loader.test.js  # sirf index.html loader ke tests
node pdf.test.js     # fonts + bottom geometry + multi-page
node cloud.test.js   # fake backend + independent browser stores, 126 sync checks
node attendance.test.js # calculation, forms, backup, exports: 313 checks
node employees.test.js  # 33 whole-panel labels + legacy data/exports/CRUD checks
node canteen-lines.test.js # 51 original-line, report/data-safety checks
node canteen-pdf.test.js   # 50 seven-column/summary/full-source/data-safety checks
node canteen-filters.test.js # 102 saved-party/combined-range/Unicode/persistence/recovery/read-only checks
node canteen-filters.test.js --artifacts ../.cache/canteen-filters-qa # actual selected PDFs
node canteen-pdf.test.js --artifacts ../.cache/canteen-pdf-qa # optional actual PDFs
node company-logo.test.js  # 63 upload/persistence/all-PDF/header/data-safety checks
node canteen-lines.test.js --artifacts ../.cache/canteen-lines-qa # optional real PDFs
HISAAB_HTML="$(realpath ../Hisaab-Pro-v3.42.html)" npm test  # exact release, all current checks
node attendance.test.js --artifacts ../.cache/attendance-qa # real fixture PDF + .xlsx
node pdf.test.js --artifacts ../.cache/pdf-qa # optional local sample PDFs
```

Har suite ka PASS summary aur poore `npm test` ka exit code **0** zaroori hai.
Current full run ki aakhri line: `✅ SMART STOCK PASTE: 160 checks pass`; all retained premium-PDF/receipt/units/name-match/combo and earlier suites run before it.

## Kya-kya test hota hai

| Area | Checks |
|---|---|
| Smart Stock Paste (v3.42), 160 | literal-source-bound automatic one-write/checkpoint/ordinary audits, mixed-format + reordered fields/Excel/CSV/quoted multiline/repeated headings/bounded section recursion, exact actual dates/units/quantities/tags/explicit roles, ≥75% unique name match/variant/unit safety, safe formatting fixes only, clear incoming-only zero-opening new products with saved-only receipt date, saved/skipped/unresolved report, full saved-subset nonnegative dated ledger and coupled checks, partial same-combo continuation/corrected-source replay/edited-deleted/manual/cross-flow dedup, no guessed facts/opening/conversions, account/disk/epoch/context/cancel/quota/recovery refusal, local result/PDF download + retained unresolved draft, DOM escape/bounds, JSON/mock-cloud independent-device merge; seven hooks/eight locations + bounded JS/CSS restore EVERY immutable v3.41 byte |
| Optional Smart Paste Chromium | trusted navigator.clipboard + actual Ctrl+V automatic save with ZERO Preview/Save clicks, typed draft zero-write, real partial success + same-combo one-tap correction, native source lock/reload/corrected replay, tagged role taps, mixed tables/field order/conflicting labels, actual result/PDF/logo bytes and zero-write/draft-retaining exports, 320/390px cards/reachable controls/dark, exact v3.41 raw-byte upgrade, offline processing/opening/manual duplicate/new-product/year safety, navigation during hashing and actual quota rollback; only synthetic local data, no uploads/uncaught errors |
| Premium Stock PDF (v3.41), 22 | approved vector masthead/cards/health/rounded tables/low warnings; actual filtered metrics, exact fractional and above-safe-integer BigInt totals with no unit conversion; dates/minima/no preview data, one-page eight-product example, complete128 products/long names/61 custom-unit panels with all-page logo/compact continuations, snapshot-logo independence, exact download bytes/no store or mock-cloud writes; three strict hooks plus one renderer restore EVERY immutable v3.40 byte |
| Optional premium PDF Chromium (30) | actual v3.40→current raw-data upgrade, genuine downloaded PDF/File bytes, one-page eight-product/four-unit/minimum example, typed product filtering, 320/390px reachable Download,128 long products/61 unit types, Hindi company/address/amber product/exact unit on matching backgrounds, reload/offline/native share stub; no uploads/customer backend/uncaught errors |
| Reviewed incoming link (v3.40), 86 | strict typed positive receipt/date/row/choice bounds, early raw/gzip fragment scrub/login wait, zero-write preview/cancel, exact names/packing numbers and saved-unit preservation, additive existing / unique75% / ambiguous/manual / visibly new products without fake openings, one atomic checkpoint/audit save; before-opening and same-day attestation, real-reference/manual/edited/deleted/cross-message dedup, skipped-row retry, every stale context/async consent/quota/recovery rollback guard; JSON/old-client/CAS stable IDs; one combo/PDF/edit/delete/dependent ledger; escaped UI, local ignored owner-only generator and target validation; six counted hooks / seven locations + bounded JS/CSS recover EVERY immutable v3.39 byte |
| Optional incoming-link Chromium (65) | actual initial/same-tab gzip/raw link, explicit future receipt date not device today, all14 synthetic items / account / visible new identities, one genuine Haan / one write /14 In rows +28 audits / no openings or invented roles; new+75%-matched existing, exact Boxes label and additive10→13 balance; ambiguous model override, wrong-unit/pre-opening/unticked same-day/reference refusals, confirmation reset, duplicate/edit/delete/reload/stale/quota/unsaved editor/offline guards, one complete actual branded PDF; 320/390px × light/dark wrapping/scroll/reachable confirmation, only local static GETs and no uncaught errors |
| Product units (v3.39), 54 | 30 unique grouped native choices, default pcs/accessible label, exact old/custom label/raw-byte upgrade, all presets through genuine form Save/opening, custom/blank/18-character/escaping/switch/cancel/detached controls, movement unit lock and zero-opening deliberate change, independent set/bundle In/Out/Sale/combo/PDF, stale/checkpoint/quota/financial invariance; three exact hooks + bounded JS/CSS restore EVERY v3.38 byte |
| Optional unit Chromium (72) | all 30 real dropdown selections and Save/opening, keyboard selection, actual required/maxlength custom entry, arbitrary existing/custom labels, metadata and blocked unit change, 320/390px/light/dark field/dialog/reachable Save, cancel/Escape, offline product save/reload and stale/quota rollback; no external request or customer data |
| Product-name matcher (v3.38), 43 | unique raw 75%+ typo/order/plural/spacing/Hindi selection; exact threshold vs 74.7, close runners-up and omitted-size variants, exact-unit/model/colour safety, manual override/visible %/consent reset, alias reload/dedup, one-combo atomic save and all original refusal guards; six exact hooks reverse EVERY v3.37 byte |
| Optional name-match Chromium (38) | real 320/390px dropdown/percentage/override/review/Cancel/one-write Save, combined PDF/download, real reload/alias/dedup, offline match/save and actual pinned local Tesseract/WASM/model screenshot recognition; no customer data |
| Single-party Stock combos (v3.37), 47 | exact immutable-v3.36 reversal (23 counted hooks), no-write upgrades of old audited messages; one combo / shared party and roles / all tagged people / distinct product units and dates / derived stock; no party/date/note/ID-only guessed grouping, conflicting identity refusal, partial-batch retry, individual corrections/deletion and saved source provenance; complete filtered/matched-vs-full scope, whole-combo pagination (42 deliveries / 84 rows); atomic whole-combo edit/delete, final dated ledger/dependent-negative/checkpoint/quota rollback, every stale account/owner/disk/snapshot guard, strict no-op including legacy note-only tags, non-destructive mixed optional fields; dense/full/id/quantity/date field validation and no unit conversion, true checkbox clicks/review reset/pending name/cancel/Escape/detached editor; one combined PDF/common roles/source/actual bytes, XSS, JSON/reload/CAS cloud/old-client compatibility; no Employee/financial schema/storage changes |
| Optional combo Chromium (not in npm test) | actual v3.36 saved-message upgrade without raw-byte rewrite; one-party multi-product UI preview/one-write Save/receipt/common tags/combined real PDF download, no same-party/date merge; actual combined filter controls and full-combo scope, whole edit/delete review and one-save audits/negative dependence/refusal/cancel/stale epoch; 320/390px card/buttons/full-year date fields/scrollable review/reachable Save/light-dark; 50-product one-combo long-name/Hindi/all-page-logo/offline PDFs; 42 two-product deliveries paginate as 40+2 whole combos, while History PDF includes all84 matching movements; no chat/contact/AI/upload service or customer account |
| Easier Stock / people / PDFs (v3.36 retained), 61 | source → review/Back/Save, blank-by-default year, all detected/wrapped/labelled/zero-width/Hindi tags and individually explicit roles; add/Enter/remove/dedup/limits/sparse/malformed/pending-name/consent guards, informed-only tags really persisted in ordinary validated fields, read-only legacy tags, incoming-only/Office/after-opening conditional controls, no Employee/financial creation; partial-batch saved-row retry and other-product replay defenses, JSON/reload/CAS sync; exact combined filters/full-ledger balances/all85 rows/whole saved message/current deletion/no empty or broadened snapshot, invisible History controls excluded from Products snapshot, original box/pcs/roll and low flags; genuine paginated PDFs/xrefs/page bounds/all-page single-embedded logo/bounded long header/full notes, bold long-name wrapping and detail-rule spacing, real bytes/download/link/share/manual/cancel/late-font/Blob cleanup/stale scope/epoch/disk/identity guards, XSS; 32 exact hooks plus bounded JS/CSS recover the entire immutable v3.35, identical canonical/release |
| Optional easy Stock Chromium (53, not in npm test) | actual v3.35 raw-storage upgrade; source/review/Back/cancel and individually visible detected + manually added people, two actual role taps and explicit one-write Save, real persisted names/stock/History/reload/no profiles, uncommitted tag and consent checks; stable 320/390px modal/buttons/no sideways page scroll/reachable Save, light/dark; genuine message/reloaded-message/current snapshot/typed inclusive combined-filter/all55 rows/offline/native Hindi PDFs with saved logo; invalid historical snapshot and stale account guard, actual PDF/File bytes to stubbed native share and cancel, no third-party request/contact/image/AI upload/uncaught errors |
| Message / screenshot Stock (v3.35), 116 | strict local source/year/calendar/quantity/unit/bounds and complete dated parsing; separate receipts/header parties/tags/phone, no guessed roles/supplier/quoted sender, exact thousandths source arithmetic + as-of-header ledger, no previous/Available write; conservative exact/alias matching including collisions/prototype safety, no fuzzy numeric-spec matching; semantic repeated-message/receipt/edited-deleted/manual dedup, explicit unique reference, opening/zero-opening cutoffs and same-day attestation; one canonical save + mandatory checkpoint + per-row audit, every stale account/disk/snapshot/quota/async/cancel guard, genuine forms/source edits/review reset, raw single-digit OCR/confidence/engine/model failure + late-worker cancellation, XSS escaping, backup/cloud/reload and concurrent-device semantic-ID merges; six exact hooks + bounded JS/CSS restore every immutable v3.34 byte |
| Optional message Chromium (75, not in npm test) | actual v3.34→current raw-storage navigation; complete mixed message preview, unguessed year/roles/type, explicit office Out/purpose/receiver/driver details, source arithmetic/unit/cutoff/manual duplicate refusal, checkpoint/stale/quota rollback, one-save ordinary movements/audits, native alias persistence, cross-message receipt dedup, true offline paste, genuine JSON download; 320/390px date/qty/unit/action/Confirm without page overflow, light/dark; real browser Canvas PNG → Tesseract5 English SIMD WASM/model OCR (no fake OCR), preserved green tags/one-digit quantities/source/confidence/editable text, corrupt/SVG/oversized/static-engine and language-model download failure/fallback; only GET asset requests and no image/text upload; no customer login/backend |
| Private Stock link (v3.34), 70 | strict bounded raw/gzip/versioned fragment and expanded data, exact opening parser/date/unit/photo checks; initial and same-document hash scrub, no file chooser/extra checkbox, complete read-only preview and one Haan; link-opening local date including cross-midnight boot/login, normal sign-in/offline destination review, no auto-write, cancellation/Escape/replaced-modal/late-reader, all context/quota/checkpoint guards, exact93-product atomic audits/zero rows/photo/reload/reopen/cloud; local generator date/target/privacy/owner-only ignored output/CLI validation; six exact integration hooks + bounded module/style recover entire v3.33 |
| Optional private-link Chromium (57, not in npm test) | actual v3.33→current initial and same-tab gzip/raw hand-off, full93-row preview and decoded photo, native single Add with exact names/qty/unit/min/date/openings/audits, no file controls/automatic write, account/date display, cancel/Escape/reopen/actual skipped balance/unit conflict/stale/quota/reload/offline/full backup, 320/390px visible quantities and reachable Add, device-local midnight date, delayed mock cloud boot and real normal-login form followed by safe preview, no payload in HTTP URL/Referer or external upload; mock accounts only |
| Opening-stock import (v3.33), 89 | strict versioned JSON/quoted UTF-8 CSV, BOM/CRLF/multiline/header aliases, file/row/quantity/name/unit/note/photo/date bounds, unknown/full-backup refusal, duplicate names, exact unit fidelity/no pack conversion; full read-only detached preview with blank date/resettable review, existing same-unit skip with actual balance and mismatch blocking entire batch, strict reimport no-op; one atomic save + required checkpoint + independent audits, zero-stock catalogue, deduplicated photos/unchanged company logo/financial data, actual FileReader/form/download, malicious-text escaping, cancellation/late readers, account/epoch/disk/version/snapshot/unsaved/stale/quota guards, existing conditional cloud/reload and independent/concurrent-name imports; five exact hooks (six locations) plus bounded JS/CSS recover entire immutable v3.32 |
| Optional opening-import Chromium (43, not in npm test) | real v3.32→v3.33 raw-storage navigation, actual file chooser with full 93-row generic preview, decoded JPEG, explicit date/review/reset/cancel, wrong backup/negative quantity/unit mismatch/same-unit actual skipped balance, full quota rollback and only required pre-change recovery advancing, exact names/quantities/units/minima/dates/audits and reload, strict reimport, stale state, 320/390px bounds/reachable Import and visible opening quantity + unit + result without sideways scroll, genuine offline quoted multiline CSV and full JSON download, original financial/Attendance/Canteen/settings invariance, no external runtime/upload or uncaught error; optional private file runs locally in disposable browser only |
| Stock Management (v3.32), 129 | exact whole-source reversal to v3.31; old raw-JSON navigation; integer-thousandth Opening + In − Out − Sales, strict quantity/calendar/reference validation and aggregate ceiling; full chronological overdraw refusal, all CRUD/cascade recalculation, before/after actor/date audit, snapshots and retained photos, bounded draft-only images/stale decoders/company-logo coexistence; real forms, combined product/party/salesperson/date/type/search, pagination and all-time Products despite hidden History dates; storage/account/stale/modal guards, JSON/old-missing/explicit-clear/demo/erase/recovery and failed-save rollback; no salary/Canteen/Attendance mutation |
| Stock synthetic cloud (v3.32), 36 | independent products and compatible In/Out/Sales, overdrawn concurrent sales coherent product-set choices with losing-row audit, photo conflicts/all-image retention/photo-only first upload, edit/delete/unit/name dependencies, CAS retry/in-flight/stale approvals, old clients, scoped offline reload/account switching, corrupt/quota/RLS protection, dependency-aware recovery; 400 deterministic adversarial offline pairs × three merge preferences validate nonnegative/no-orphan/no-duplicate results |
| Optional Stock Chromium (82, not in npm test) | actual v3.31→current v3.42 raw-storage navigation; native product/photo/opening/In/Out/Sale/edit/delete/cascade forms and complete audit, real PNG/JPEG decoding and SVG/corrupt/>5MB refusals, required purpose/customer/salesperson/delivery, backdated overdraw and receipt-deletion refusal, combined inclusive filters/search, 50-row pagination, genuine JSON download/old import, 320/390px availability/navigation/scrollable Sale dialog/reachable Save, offline save/reload, actual erase/recovery and canonical-quota rollback; no external runtime request/uncaught error |
| Saved parties / filtered reports (v3.31), 102 + 17 cloud | independent zero-entry saved names; canonical case/space matching with untouched original party strings/IDs; actual save/entry/select shortcuts, date/type/party CSV intersection, inclusive cross-month/leap/year dates, exact date × party report snapshot/entry/bill/note/original-item/day/party/Net/Paid/Baki scope, unassigned/literal-All distinction, invalid/unknown/no-match refusal, six designs ± logo, original own prices, 100-line pagination and literal escaping; genuine downloaded/shared File/manual attachment/cancel, Unicode font refusal/Indic-first print, async selection/account/print races, blocked storage rollback, optional-field validation/counts/deletion intent, confirmed wipe/Undo/stale confirmation and actual Missing data jodo; 38 exact reversed hooks plus bounded module removal recover whole immutable v3.30 source |
| Optional filter Chromium (130, not in npm test) | actual Parties form/save/reload/zero entries and entry dropdown/save; real six-theme ± logo selected downloads/identical shared PDF File bytes and print; no-match/invalid dates, same-day/unassigned/literal-All, honest manual fallback/cancel, offline/logo, real Hindi shaped resources/ActualText + actual Indic font in print, portable `.pdf` name; actual JSON file chooser (catalog/old missing field/invalid/explicit clear), recovery confirmation preserving new names, 320/390px forms, actual quota failure and complete original financial/storage invariance; OS destinations stubbed |
| Canteen PDF columns (v3.30), 50 | exactly seven full-width/right-aligned headers, every daily row and merged total for all six day/month templates with/without logo, complete summary-slot/underline and formula-word removal, nonzero sale/expense/paid/partial balance and exact unchanged net, screenshot ₹59,038 / 26 entries, zero/sale-only/expense-only/empty cases, own-price separate 500g rows/100-line continuation, genuine download/shared File/manual-fallback bytes, unchanged app/CSV/customer-entered text/raw-storage/cloud state; exact counted presentation replacements plus entire remaining HTML/CSS/fonts/storage/cloud/salary/Attendance/logo byte comparison to immutable v3.29 |
| Optional PDF-columns Chromium (106, not in npm test) | actual v3.29→current v3.42 raw-storage navigation, all six real template-picker choices × day/month × saved/no logo, native downloads and exact real shared PDF File bytes, real Chromium print PDFs with seven columns/every daily amount/merged totals/no empty summary values, saved once/reloaded logo, correct original positive/negative net, manual share fallback, already-open offline download, 320/390px screen bounds and complete data/disk/cloud-state invariance; OS destinations stubbed, never delivery |
| Company logo (v3.29), 63 + 6 cloud | accessible Settings chooser/preview/auto-save, bounded raster data, metadata validation, PNG/JPG/WebP/white transparency, processing/cancel/error/oversized/stale-account/unsaved/quota guards, no old-data migration, reload/replace/confirmed-remove, all six Canteen day/month templates, separate 500g rows/100-line continuations, salary/payroll and two-page Attendance, one shared image per document/all pages, one XObject dictionary alongside shaped Hindi text, continued name/date slots, wrapped salary signatory, exact no-logo writer/salary/Attendance/Excel compatibility; real JSON backup + atomic cloud conflict/offline reload/confirmed removal |
| Optional logo Chromium (78, not in npm test) | real native chooser + PNG/JPG/WebP/canvas compression/shape/white background, auto-save without losing typed fields, v3.28 raw-storage navigation/reload, 320/390px controls, every report/template, genuine downloads and shared PDF Files, Hindi/62-shift two-page Attendance, browser print/decode wait, corrupt/SVG/>5 MB refusals, replacement/confirmed removal/reload, 4000×1000→640×160 resize, backup restore in fresh isolated browser, actual localStorage quota rollback, offline PDFs, ordinary Save settings, long business headers, four-page/120-advance salary and six-page/100-line Canteen |
| Canteen item lines (v3.28), 51 | exact two × 500g reproduction against v3.27; every saved line/own rate/amount/source retained, duplicate lines in one entry, dates/case/units/kinds/lump-sum/zero/precision/order/escaping, non-mutating frozen input, daily/monthly UI + full print + all six PDF templates, 100-row continuation, honest 14-/6-line previews, real shared PDF File bytes, preserved cumulative rate analytics/CSV and complete raw storage/data/cloud state; 23 core/report function bodies plus full CSS unchanged |
| Optional Canteen Chromium (49, not in npm test) | real old-release forms/PDF reproduce merged 1000g, byte-identical v3.27→current v3.42 storage navigation, native 500g per-row downloads/print/share Files, same-bill 37.50/50 own rates, correct grand total, 100 repeated rows, reload, cumulative catalog, 320/390px scrolling tables and every original salary/Attendance/canteen entry retained; print/share destinations stubbed |
| Employee terminology (v3.27), 33 | whole-panel visible text/placeholders/tooltips, Employee navigation/add/edit/validation/statuses, stable g+w route and command search, destructive confirmations cancelled, unchanged monthly/hourly salary math/advances/deductions, salary PDF drawing ops differ only in labels, real CSV/print/share text, cloud display-only alias, old JSON import and raw-data compatibility, customer-entered names/notes/shop names untouched, 20 byte-identical core/report functions plus original CSS/fonts |
| Attendance (v3.27), 313 | dynamic profiles/unique codes/same-name resolution, active/employment rules, Tap/Time + Morning/Afternoon/Evening/Night and legacy Day, strict post-11:45-PM monthly bonus thresholds/exclusions/full-month all-shift basis/next-morning/attendance-month attribution and duplicate-history exclusion, 12-hour Morning/Afternoon/Evening/Night clocks in both Check-in/Check-out, all eight same/next-day choices, exhaustive 1,440-minute round-trips with bare/same/next-day prefixes, clock-band boundaries/mismatch rejection, 12 afternoon=noon / 12 night=midnight, blank-only suggestions, v3.24 raw-storage reopening without time/history/financial mutation, invalid 24-hour input rejection, old record reopening, blank clocks/period suggestions, mobile numeric/Hindi entry, actual durations including 24h 01m / screenshot 27h 01m / 36h / 47h 59m, exact same/next-day combinations, reversed/equal rejection, no deductions/automatic target classification, manual half-day/credit snapshots, open check-ins, Sunday status/date/shift dedup, month/year boundaries, filters/search/pagination, duplicate prevention, bulk skip/overwrite, actual forms, calendar/ledger/day/week/month/custom/search/sort, dashboard/settings/keyboard, escaped text, history/actor/before-after, stale editor/account/disk guards, quota rollback, local reload, old JSON/demo/reset/recovery preservation, 250 managers + 750 records pagination and 2,000-history limit |
| Attendance exports (included above) | top first-sheet summary with numeric distinct present/status days, all actual Sunday dates, per-month full-basis numeric bonus rates; photo-style Date / manager-status / IN / OUT / blank Advance / Shift / Hours / Credit / Notes grid; no fabricated advance amounts, totals or salary-employee joins; empty/partial/multi-month/long-summary/profile-newline safety; unchanged four v3.25 detail XMLs and Attendance PDF (except version footer), genuine individual PDF + 5-sheet OOXML XLSX; chosen manager/shift/custom dates, unmarked vs absent, xrefs/stream lengths/paper bounds, one/two-page monthly layouts and explicit oversized-range refusal, bundled Hindi font + complete OFL notice, ZIP/CRC/XML/numeric hours, Unicode/emoji/formula-safe literal text, reference-style ruled 7-column ledger + dated Sunday list + outlined bonus/rule box + numeric Excel bonus Summary, styled primary register (real dates / `[h]:mm`, borders, gold Sundays, status colours, merges, pinned identity/date columns, actual table filters and identity print titles), atomic totals/signatures, original history/legacy metadata, actual Blob MIME/filenames/ready-file links/no-gesture fallback/failure reporting and full Store/localStorage/history/sync-state invariance, nine byte-identical storage/cloud/financial/clock-action core function bodies plus unchanged attCalculate arithmetic (only three error messages updated), byte-identical v3.23 stylesheet/embedded fonts/shared PDF engine except three narrowly reversed v3.29 logo hooks, and salary/canteen non-mutation |
| Attendance cloud (27 of the 126 cloud checks) | four-shift cloud adoption/concurrent merge/offline reload with legacy Day/Night intact and no salary bonus writes, long-shift upload/adoption/re-edit, independent records, same-natural-key dedup/conflict, note+clock merges vs atomic competing clock spans, profile/record deletion dependencies, duplicate code/moved-key collisions, full and partial legacy payloads, proven deletion vs unproven empties, durable offline reload, open-editor/account reset, invalid-cloud/quota rollback/recovery and rule conflicts |
| Optional Employee Chromium (26, not in npm test) | real v3.26→v3.27 navigation with byte-identical raw data, eight live view label/tooltip audits, command search, add/edit/reload persistence under original keys, real salary CSV/six-page payroll PDF/download/print/share text, cancelled delete, 320/390px view/form bounds, every original employee/salary/canteen/Attendance record retained, no JS errors; print/WhatsApp navigation stubbed, never delivery |
| Optional Attendance Chromium (126, not in npm test) | six actual downloaded-XLSX checks: top summary, reference column order/black grid/blank Advance, five-sheet completeness, 62 shifts vs 31 distinct days, long-summary visibility and real numeric 2% bonus, eight exact clock-dropdown choices, native afternoon/evening/after-midnight saves and explicit day flags, mismatched clock/period refusal with full storage invariance, blank-only shift/profile suggestions, real v3.24→v3.26 navigation with byte-identical raw storage and original 27h 01m, real four-shift forms/reload, 3→1% / 5→2% bonus and exact 11:45 exclusion, real PDF File payload to stubbed native share API/cancel/manual-fallback download, real profile/record/bulk forms, exact 12-hour options/blank clocks/validation, actual overnight hours/reopening, screenshot long-shift save/re-edit/download, 31-day / 62-shift PDF cap and styled-register downloads, full-year Excel after honest oversized-PDF failure, report-studio 320/390px layout, and full saved-data/history/storage invariance, Sunday tab/count/dedup/filters, noon/midnight conversion, duplicate UI error, calendar day, custom-range Latin/overnight/Hindi PDF/XLSX native downloads/headers, 320/390px mobile controls/no-overflow/navigation, visible dialog title/Save buttons, real reload persistence, bundled Hindi fonts/ActualText and no uncaught JS errors; optional desktop/mobile/modal/calendar/dark screenshots |
| PDF summary scope (v3.18 → v3.30) | v3.18 only blanked two labels; that old expectation is superseded by the explicit v3.30 removal of complete label/value/underline slots and monthly category columns. Reference fonts/closing/pagination/amounts/app data remain guarded; new full-source guards permit only the counted report presentation edits |
| Safe cloud sync (v3.17) | canteen-only/records/rates/log/settings-only login, demo suppression, stale demo flags, no echo, independent changes + first-insert/CAS races, financial/employee-delete-v-salary/payment conflicts, exact-value re-approval, in-flight edits/save failures, offline reload + online retry, legacy missing/empty snapshots, RLS/read/write failures, null stamp, account/project/logout/late-session guards, cross-tab stale writes, corrupt JSON/cache, quota rollback, photo dedup, scoped recovery, no fake success, modal baseline guard |
| Loader safety (v3.17) | API list + latest release, API failure par cached older build se pehle known data-safety fix, future cached release aur missing-cache fallback, file chooser |
| Boot | sidebar me Canteen, `Store.data.canteen`, sample data, version badge, dashboard card |
| Tabs | day / month / entries / parties / rates / activity — sab render, koi `NaN`/`undefined` nahi |
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


## Optional real-browser Stock / Attendance / Canteen QA

The regular suite only needs locked jsdom dependencies. Native browser QA is
separate so a Chromium download is not required for every `npm test` run:

```bash
# In tests/, after npm ci (does not change package.json/lockfile):
npm install --no-save --package-lock=false playwright
npx playwright install chromium
# Serve ONLY public HTML copies; do not expose private-imports/.cache/.git:
mkdir -p ../.cache/public-preview
cp ../*.html ../.cache/public-preview/
# In another terminal (from tests/; default script port is 8000):
# python3 -m http.server 8000 --bind 0.0.0.0 --directory ../.cache/public-preview
HISAAB_URL=http://127.0.0.1:8000/hisaab_v3.html npm run test:attendance:browser
# Exact release and screenshots:
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html HISAAB_SCREENSHOTS=1 npm run test:stock:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html HISAAB_SCREENSHOTS=1 npm run test:stock:import:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html HISAAB_SCREENSHOTS=1 npm run test:stock:link:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html npm run test:stock:message:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html npm run test:stock:easy:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html npm run test:stock:combo:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html npm run test:stock:match:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html npm run test:stock:units:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html npm run test:stock:receipt:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html npm run test:stock:pdf:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html npm run test:stock:smart:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html HISAAB_SCREENSHOTS=1 npm run test:attendance:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html HISAAB_SCREENSHOTS=1 npm run test:employees:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html HISAAB_SCREENSHOTS=1 npm run test:canteen:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html HISAAB_SCREENSHOTS=1 npm run test:logo:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html HISAAB_SCREENSHOTS=1 npm run test:canteen:pdf:browser
HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.42.html HISAAB_SCREENSHOTS=1 npm run test:canteen:filters:browser
```

`127.0.0.1` here is only the **local test runner**, never a browser-facing app API.
The test runs on a local server or a `file:///absolute/path/...html` URL. It opens
isolated **browser processes**, uses disposable fixtures, and never touches a
customer account. `HISAAB_ARTIFACTS` changes the output folder (default ignored
`.cache/attendance-browser-qa`). `HISAAB_CHROME_EXECUTABLE` and
`HISAAB_CHROME_ARGS` (JSON array) support a supplied browser. `NODE_PATH` can point
at scratch-installed Playwright instead of adding it to the locked dependencies.
For a supplied serverless Chromium, use its required local libraries / rendering
flags. The current run used bundled Chromium143 software rendering and **removed
`--single-process`** so suites opening multiple isolated contexts remain stable.
These QA tools/libraries are not application runtime dependencies.

Review native form inputs/download events as well as API fixtures. Inspect PDFs
with PyMuPDF and workbooks with openpyxl if export code changes. Hindi image-backed
ActualText is checked separately: copy/search support varies by PDF parser/viewer.
The optional independent combo validator opens/renders every supplied Stock PDF,
checks page bounds, row-rule/logo collisions, common role blocks, exact saved IDs,
50-product Unicode/unit completeness and full 55-/84-/85-row History exports:

```bash
# Optional Python environment (not an application dependency): pip install pymupdf
python3 tests/stock-combo-pdfs.py .cache/stock-combo-native .cache/stock-easy-native \
  --version 3.42 --render .cache/stock-pdf-inspection
```

### Current v3.42 evidence

**2,116 offline assertions /22 suites pass**, exact-release
`HISAAB_HTML="$PWD/Hisaab-Pro-v3.42.html" npm test --prefix tests` exit0
(785 seconds): retained1,956 + **160 Smart Paste checks**. All22 suites passed on
the final source/build, not an earlier parser revision. **358 native Chromium
checks /6 targeted suites pass**: **Smart Paste60**, premium PDF30, easy review/
PDF53, combos78, units72 and incoming receipts65. This release does not claim a
fresh run of every other optional native suite. Chromium143 / Playwright1.58.2;
all fixtures isolated/synthetic, all cloud/device interactions mocked.

Actual trusted clipboard **Ctrl+V** in the deliberately opened/notice-bearing
Smart Paste saves valid rows in **one Store.save with no Review or Save click**;
typing stays zero-write until Process. Partial success holds the zero-quantity
item, shows only its clarification and downloads saved/skipped/unresolved reasons.
One corrected quantity + one tap saves only that row into the **same** combo;
re-paste/reload of the original typo reuses audited corrections without duplicates.
Real mixed Excel/table/plain text/footer and reversed labels/dates-after-quantity
retain independent original dates/units, one combo and every informed tag. Actual
tagged-role taps do not infer people/order. Conflicting repeated date/type/unit,
missing year, manual duplicate and same-day opening remain honest refusals; clear
new incoming gets no fake opening. Already-open offline processing, native reload,
navigation during hashing and canonical-quota rollback all pass. A failed save
may advance only the required **pre-change** recovery copy, never the inventory.

**Independent PyMuPDF1.28:25 native Stock PDFs /99 rendered A4 pages /99
proportional logo pages /11 combo PDFs.** Every page renders unrepaired/in bounds,
with version/page footer and no logo/text or row-rule collision. Original premium
128-product/61-unit/Hindi/selected-cell/minimum totals and50-product combo/84-/55-
row History/14-item receipt checks still pass. Smart's actual saved-only PDF has
exactly the two actual saved IDs, source dates, +3box/+4set and saved original logo;
its unresolved item is absent. Result/PDF download has zero inventory/audit/disk
writes and keeps unresolved modal/draft open. 320/390px mobile cards show saved
product/date/type/quantity/unit without horizontal table scrolling; correction
and Process reachable in light/dark. Current desktop/mobile/dark and actual Smart
PDF render were visually inspected. Only local static GETs; no paste/catalogue/
image upload or uncaught browser errors. OS share targets remain stubbed; not
proof of physical-phone/Safari/WhatsApp delivery.

Canonical/release identical: **1,378,235 bytes**, SHA-256
`2e5241116916a1732acdba7fec1fd04de03b7fb6bd3749832ea01f88c935bc30`.
`scripts/build-stock-smart.py` pins immutable v3.41 SHA-256, applies only **seven
exact hooks /eight locations** plus bounded local JS/CSS, and generates the exact
compatibility reverser. `tests/stock-smart-compat.js` restores **EVERY v3.41 byte**
before the existing PDF/receipt/unit/match/combo and older source guards run.
Approved renderer/fonts/shared writer, storage/auth/cloud/recovery/finance/
Canteen/Employee/Attendance/five-sheet Excel code remains guarded prior source.
All44 prior release/legacy HTML archives untouched. No new runtime dependency,
backend/schema/table/storage key, migration, customer catalogue or screenshot.
No customer account/backend was read or written for this implementation/QA.

### Historical v3.41 evidence

**1,956 offline assertions / 21 suites pass**, full `npm test` exit0: all retained
1,934 checks plus **22 premium Stock PDF checks**. **298 native Chromium checks /
5 targeted suites pass**: premium PDF30, easy review/PDF53, combos78, units72 and
incoming receipts65. These are the recorded v3.41 release results, not a claim
of rerunning all optional native suites for the latest release. Chromium143 / Playwright1.58.2, isolated synthetic data only.

Native actual downloads prove the approved visual design is implemented in the
PDF writer, not pasted as the generated concept image. The eight-product / four-
unit / one-low-stock example fits one A4 page including exact unit tiles and the
reorder note. Metrics derive only from selected report rows; no sample values,
mockup monogram, fake as-of date, mixed-unit grand quantity or invented trends.
Stock shows original opening/minimum and all saved dates (including future rows).
History/combo movement summaries keep separate In/Out/Sales totals per exact unit;
running balances are never summed. Exact cross-product integer thousandths use
BigInt, including totals beyond Number.MAX_SAFE_INTEGER, without changing storage.

**Independent PyMuPDF1.28 validation:24 native Stock PDFs /98 rendered A4 pages /
98 proportional logo pages /10 combo PDFs.** The validator checks actual extracted
In/Out/Sales/Available/unit cells, all8 dated rows/minima and separate166box/60pcs/
12roll/28set sample totals. All128 full long names/dates and61 custom-unit labels/
minimums/summary tiles survive pagination. Hindi company/address/product/unit
ActualText is complete, and embedded header Indic images have navy backgrounds,
not white rectangles. Existing50-product Hindi combo,84-/55-movement History,
14-item receipt IDs/dates/quantities, original shared source/roles, bounds,
logo/row-rule collisions, font/xref rendering and every-page footer checks pass.
Share targets are stubbed; this is not proof of physical-phone/Safari/OS delivery.

Canonical/release identical: **1,291,098 bytes**, SHA-256
`ee4a46e611e239f054fda659a9271f0cc259243d09140be3cb12b014ce873d6a`.
`scripts/build-stock-pdf.py` pins immutable v3.40 SHA-256 and replaces only the
Stock renderer plus three exact hooks (version, one Settings note, dialog copy).
`tests/stock-pdf-compat.js` restores EVERY v3.40 byte before the chained receipt/
unit/match/combo/easy and older financial/cloud/font guards run. Old v3.40 and all
earlier archive HTMLs remain byte-identical. No runtime dependency/network/schema/
keys/backend changes, no customer catalogue/screenshot data in the release.

The existing native download/share/context/cancellation/filters/one-combo/date/
minimum/opening/negative-ledger/atomic/backup/quota protections remain; upgrading
or exporting changes no saved byte. No live account was logged into/read/written
for this design implementation or QA. Canteen, Employee, salary, Attendance,
five-sheet Excel, fonts/shared writer and cloud functions are exact prior source.

### Historical v3.40 evidence

**1,934 offline checks pass / 20 suites**, exact-release `npm test` exit 0 =
retained 1,848 + **86 incoming-link checks**. **1,078 native Chromium checks pass /
15 suites** = retained 1,013 + **65 typed incoming-link UI checks**. Every retained
JS numeric fixture/assertion literal is unchanged (26 edited test files audited);
version expectations advance and the previous source allowlists remain chained.
Chromium143 / Playwright1.58.2, isolated synthetic data and mock accounts only.

The actual gzip/raw initial/same-tab link requires no file chooser/per-item typing.
A complete synthetic 14-item received list retains its explicit 25-Nov-2026 date
on a 14-Nov test device, every independent name/quantity/unit, and one combo.
One real **Haan** performs one canonical save of 14 new products / 14 ordinary
Stock In rows / 28 audits, **no fake openings or outgoing roles**. Existing saved
`Boxes` identity/metadata/opening survives, and an actual unique75%+ typo receipt
adds 3 to 10 (13), never overwrites with 3 or creates another matched product.
Close model/unit ambiguity, explicit manual choice, pack-number non-conversion,
missing supplier, same-day confirmation/reset, before-opening, manual/reference/
current/edited/deleted/cross-flow duplicates, originally skipped row retry and
all-processed strict no-op are checked. New product IDs and ordinary receipt IDs
merge once across independent synthetic CAS devices; v3.39 reads the saved data
unchanged. JSON/reload, one-combo PDF/Edit/Delete, dependent later-stock refusal,
every scope/epoch/version/owner/disk/snapshot/identity/unsaved guard, hashing-time
cancel/replaced/edited consent, mandatory recovery and canonical-quota atomic
rollback all pass. Open/preview/cancel never writes customer inventory.

Native **320/390px × light/dark** complete review remains within the viewport;
all items scroll, quantity/unit/date and saved/new identity are readable, and the
persistent final Haan is reachable with an unobstructed trial-click. Offline
local decoding/planning/saving in an already-open panel and reload pass. Local
static GETs only; no source/token/image upload or external catalogue lookup.
Private developer output validation is isolated and owner-readable under ignored
`private-imports/`; test fixtures contain no customer's product list.

Independent PyMuPDF2.2 / MuPDF1.28.6 validation opens/renders **25 Stock PDFs /
84 A4 pages / 63 logo pages / 13 combo PDFs**. The new 14-product incoming PDF has
every exact saved ID/date/quantity/unit once, one transparent unknown-supplier
context, no invented sales/delivery roles, two complete pages and a proportional
non-overlapping logo on each page. All previous Stock Unicode/full-history/
50-product/75%-matched bounds and row-rule checks remain. Retained exports were
also freshly generated/reopened/rendered: **171 PDFs / 256 pages / 102 logo pages**,
**10 XLSX / 50 sheets / 603 blank manual-Advance date rows / 471 actual numeric
hours-credit OOXML cells**, with openpyxl3.1.5 and workbook relationship resolution.
Browser print's A4 quantization tolerance remains 1.1 pt; Stock bounds remain tighter.

Canonical/release identical: **1,279,331 bytes**, SHA-256
`e85d8df64c37119655f8cc5e75b2024b9614217108d09543f71fc4c3aad2abb3`.
`scripts/build-stock-receipt.py` pins immutable v3.39 by SHA-256; **six counted
hooks / seven locations + bounded JS/CSS** recover EVERY v3.39 byte before units
and prior guards run. Nested v3.38 reversal, deterministic rebuild, executable-only
Acorn parse, numeric/whitespace/privacy checks and all **42 older archive/legacy
HTML byte comparisons** pass, including v3.39 and `index (2).html`. Never rerun
older builders over published outputs; further app changes need a new release.

No customer account is authenticated or remotely modified by QA/link preparation.
A private hand-off must still be opened/reviewed/confirmed in the actual-data
browser/account. This is not physical-phone/Safari/live-backend/public-CDN/
desktop-Excel/WhatsApp-delivery proof; share destinations remain stubbed. Existing
financial/Canteen/Employee/Attendance/logo/cloud/schema/storage are unchanged.

### Historical v3.39 evidence

**1,848 offline checks pass**, all **19 suites**, exact-release `npm test` exit 0:
retained 1,794 + **54 product-unit checks**. **1,013 native Chromium checks pass**,
all **14 suites**: retained 941 + **72 genuine product-unit UI checks**. Retained
assertions/fixtures keep every numeric literal; only current version strings and
real unit-control interaction change. Prior source allowlists still chain unchanged.
Native QA used Chromium143 / Playwright1.58.2 and isolated synthetic storage.

New coverage saves **each of the 30 presets through the actual Add product form**
with its exact dated opening and no conversion. Existing v3.38 standard/custom/case/
space labels, IDs and all raw data survive upgrade without a write; custom labels
remain editable, arbitrary and bounded to 18 characters. The dropdown has a real
associated label and four native option groups. Keyboard selection, required blank
custom validation, native maxlength, preset/custom draft memory, Cancel/Escape,
custom-label escaping, metadata-only edits and the movement-based unit lock all pass.
A zero-opening/no-movement product may still deliberately change its unit; one with
movements cannot. Independent set/bundle In/Out/Sale/combo/PDF quantities stay exact.

Real **320/390px × light/dark** forms show both preset/custom fields without sideways
page overflow; dialog/body scroll and Save's unobstructed trial-click are verified.
Offline preset saving in an already-open panel and full reload retain every label.
Stale context, required checkpoint and canonical quota refusals preserve the original
Stock/audit/data; only a successful pre-change safety copy may advance. No new request,
conversion, financial write, runtime dependency, schema/key/backend or Canteen-unit
change. The complete retained OCR/75%-matching/one-party-combo/export suites also pass.

Fresh independent checks pass: **24 Stock PDFs / 82 rendered A4 pages / 61 logo
pages / 12 combined PDFs** (including 50-product Hindi and exact saved IDs/units,
75%-matched combined download, bounds, footer/version and matches-only History).
Retained exports were regenerated/reopened/rendered: **171 PDFs / 256 pages /
102 logo pages**, **10 XLSX / 50 sheets / 603 blank manual-Advance date rows /
471 genuinely numeric hours-credit OOXML cells**. PyMuPDF2.2 / MuPDF1.28.6 preserves
shaped-Hindi ActualText; openpyxl3.1.5 plus workbook relationships check real registers.
Chromium print's CSS-pixel A4 rounding is within 1.1 pt; local Stock writer A4 stays
exact and its existing tighter bounds/Unicode assertions are unchanged.

Canonical/release are identical **1,260,554 bytes**, SHA-256
`d766a63254008ed8b0aed2e7f234b84a3da54756b217cd988fd49b626a5a2c86`.
`scripts/build-stock-units.py` pins immutable v3.38 by SHA-256; **three counted
hooks + bounded unit JS/CSS** recover EVERY v3.38 byte before older guards run.
Deterministic rebuild, executable-script Acorn parse, exact/nested reversals,
whitespace/privacy/network checks pass. All **41 prior archive/legacy HTMLs**,
including v3.38 and `index (2).html`, remain byte-identical. Do not run older
builders over published outputs; future changes need a new release.

No customer account/private catalogue/screenshot was used or changed. This is not
live-customer-backend/public-CDN/physical-phone/Safari/desktop-Excel/WhatsApp-delivery
evidence; native share destinations remain isolated/stubbed. Existing opening-date,
source-maths, duplicate, explicit-role and negative-ledger guards remain unchanged.

### Historical v3.38 evidence

**1,794 offline checks pass**, all **18 suites**, `npm test` exit 0 = retained
1,751 + **43 product-name matching checks**. **941 native Chromium checks pass**,
all **13 suites** = retained 903 + **38 real name-match checks**. Retained tests
keep every original numeric fixture/assertion literal; exact source guards still
reverse all older modules. Native QA used Chromium143 and Playwright1.58.2.

New coverage: exact 75% auto-selection versus 74.7% refusal, typos, word order,
spacing, common plurals/omitted descriptors and Hindi; close ties including a
below-threshold runner-up, exact-name/confirmed-alias precedence, original-unit
conflict (no conversions), reordered numeric dimensions, 9mm vs9cm, M9A vsM9B,
colour/half-full/size/side variants and missing-size ambiguity. The visible dropdown
is actually selected, % stays visible at 320/390px/light/dark, manual replacement
resets consent and never shows another product's %, and Cancel/preview are no-ops.
One real Save remains one guarded write/one combo with exact units/dates, source
notes, chosen roles and audits. Actual reload retains reviewed aliases; repeated
messages never subtract twice; offline matching/save work in an already-open panel.
Opening/maths/negative/stale/required-checkpoint/quota/role refusal paths stay intact.

The new native suite also reads an actual synthetic misspelled-name PNG with real
pinned Tesseract5.1.1/English model/WASM, locally fulfilling matching static npm
assets (not recognition stubs), and auto-selects the saved product. Original image,
raw OCR and separate OCR confidence remain visible; no image/text upload or AI/
product-lookup service. The retained native OCR suite also passes in full.

Fresh independent Stock validation: **24 PDFs / 82 rendered A4 pages / 61
proportional logo pages / 12 combined PDFs**. The new real downloaded combo has
both canonical product identities AND original misspelled source, two distinct saved
IDs, common roles once, original dates, separate pcs/box quantities and full-ledger
balances. All prior 50-product/Hindi/55-/84-/85-row, footer/version, bounds/rule/logo
nonoverlap assertions still run. QA used **PyMuPDF2.2 / MuPDF1.28.6**; older1.26
renders the shaped image-backed Hindi but omits its ActualText from extracted text.
Use a current parser; do not waive Unicode completeness checks for that limitation.
This is an optional QA dependency, never a runtime dependency.

Fresh retained export reopening/rendering checks: **171 PDFs / 256 A4 pages**,
**10 XLSX / 50 sheets / 603 blank manual-Advance date rows**. Correct workbook
relationships locate the first displayed register (not an assumed sheet1.xml);
**471 actual hours/credit OOXML cells** are numeric. Existing native Canteen/logo/
Employee/Attendance/five-sheet/Sunday/bonus assertions also pass unchanged.

Canonical/release are identical **1,257,835 bytes**, SHA-256
`a580c59a7aaef274c19a77a14d9f8ac0b827f94d3073cc3d99fe70480bc32bb1`.
The standard-library `scripts/build-stock-match.py` uses immutable v3.37 with its
SHA-256 pinned; **six counted hooks + bounded readable matcher** reverse EVERY
v3.37 byte, then every older compatibility guard chains. Deterministic rebuild,
Acorn executable-script parse and whitespace checks pass. All **40 prior archive/
legacy HTMLs** remain byte-identical. Do not run older builders over their already
published inputs; create a new release for further changes.

All QA uses disposable synthetic browser storage/mock accounts. No customer data,
private catalogue/screenshot/fragment, new schema/key/backend/runtime dependency,
financial counter or historical-record-only combo mode was introduced. No live
customer backend/public-CDN availability, physical-phone/Safari, desktop Excel or
WhatsApp-delivery claim; real PDF/File/download/cancel paths are verified, while
OS share destinations remain isolated/stubbed. Name matching does not fix or bypass
an old message's opening-date/source-arithmetic errors.

### Historical v3.37 evidence

**1,751 offline checks pass** (`npm test` exit 0, all 17 suites): the retained
1,704 plus **47 one-party combo checks**. All **12 native Chromium suites pass
903** = prior 825 plus **78 genuine combo checks**. The retained native counts are
82 Stock + 43 opening import + 57 private link + 130 Canteen filters + 49 original
item lines + 106 seven-column PDFs + 78 logo + 26 Employee + 126 Attendance +
75 real message/OCR + 53 easier review/tag/PDF; no old assertion was dropped.

Native combo QA upgrades an actual v3.36-saved message without a raw-byte rewrite;
checks complete UI source/review/one-write Save/receipt, common party/tags/explicit
roles, real whole-combo PDF downloads, partial-filter/full-action scope, one-write
Edit/Delete/audits, dependent negative refusal, unchanged/no-op/cancel/stale-context
behavior, real reload, 320/390px/light/dark and full-year readable date fields.
A 50-product long-name/Hindi message remains ONE combo; 42 explicit same-party/date
two-product deliveries paginate as 40 + 2 whole combos. The matching History PDF
contains all84 movements. History PDF counts/indexes explicitly say movements,
not separate combo entries. Unicode/common roles/independent units and dates,
required explicit consent and every original source note remain covered.

Fresh independent PyMuPDF opens and actually renders **23 Stock PDFs / 81 A4
pages**, including **11 combined-combo PDFs** and **60 proportional logo pages**:
all unrepaired, exact version/page/report footers, no text/branding/table-rule
intersection or printable-bound clipping. Exact saved IDs/50 product rows/Hindi
names/per-unit quantities, both long 50-product eight-page PDFs, corrected original
movement dates/as-of-ledger balances and every 55-/84-/85-row filtered History row
are checked. `tests/stock-combo-pdfs.py` makes these independent checks reproducible;
its optional Python dependency is not an application dependency.

Retained exports were freshly regenerated/reopened too: **171 PDFs / 256 rendered
pages / 102 proportional logo pages**, including the intentional old merged-line
reproduction, and **10 genuine XLSX / 50 sheets / 603 blank manual-Advance rows**.
Openpyxl can decode duration-formatted numeric hours as `timedelta`; actual OOXML
hours/credits remain numeric. Existing original-line/amount/summary/clock/Sunday/
bonus/five-sheet assertions still run. None of these validators changes app data.

Canonical and release are identical **1,250,021 bytes**, SHA-256
`369f7415b0a7eaa42a4fc63e05a33b2b7f25f13feded9cd323e5c184bd0bae06`.
All **39 pre-existing archive/legacy HTMLs**, including published v3.36, retain
exact original bytes. **23 counted integration hooks** plus bounded combo JS/CSS
reverse the entire immutable v3.36 HTML; every earlier nested source guard then
runs unchanged. Executable JavaScript parses with Acorn; the standard-library
`scripts/build-stock-combo.py` deterministically rebuilds release + compatibility
map from immutable v3.36 and readable `scripts/stock-combo/` sources. Published
archives must not be overwritten by changed builder inputs; use a new release
version for subsequent feature work.

The complete native message suite still runs actual pinned Tesseract/WASM/model
recognition with matching static assets locally fulfilled, not recognition stubs.
No customer account/catalogue/private screenshot/fragment is in public fixtures,
exports or code; QA uses disposable synthetic storage/mock accounts only. No live
customer backend, physical-phone/Safari/public-CDN availability, desktop Excel or
WhatsApp-delivery claim. File-share destinations are isolated/stubbed; actual
PDF/File/download/cancel bytes and offline behavior are verified. No pricing,
financial/schema/storage-key/backend or new runtime dependency was introduced.

### Historical v3.36 evidence

**1,704 offline checks pass** (`npm test` exit 0): the retained 1,643 checks plus
**61 easier-Stock/member/PDF checks**. All **11 native Chromium suites pass 825**:
82 Stock + 43 opening import + 57 private link + 130 Canteen filters + 49 original
item lines + 106 seven-column PDFs + 78 logo + 26 Employee + 126 Attendance +
75 actual message/OCR + **53 progressive-review/tag/PDF checks**. The message suite
continues to use real browser Tesseract/WASM/model recognition, not an OCR stub;
matching static downloads are locally fulfilled. No customer account, backend,
physical-phone/Safari, public-CDN availability, desktop Excel or WhatsApp delivery
is claimed. Share/print OS destinations are isolated/stubbed; actual PDF/File bytes
and normal manual download/cancel behavior are verified.

Fresh independent PyMuPDF checks open and render **14 Stock PDFs / 41 A4 pages**:
all unrepaired, version/report footer on every page, every matching 55-/85-row
History entry, exact tagged names including Hindi, valid long-name wrapping,
**20 proportional logo pages**, no printable-bound/branding/table-rule overlap.
The earlier module suites also regenerate **171 PDFs / 256 rendered pages**
(including the deliberate legacy merged-line reproduction) and **10 genuine XLSX /
50 sheets / 603 blank manual-Advance date rows**, independently reopened with
PyMuPDF/openpyxl. Top summaries, numeric hours/bonus, all five detail sheets and
actual clock/day flags remain covered by the original export assertions.

Canonical and versioned release: **1,219,979 bytes** each; SHA-256
`68059762841a9d990cfd6191a8cde54aebba37e0628a1e4bf45dc2062496d5cb`.
All **38 pre-existing archive/legacy HTMLs** are byte-identical. Reversing exactly
32 enumerated integration hooks and bounded easy JS/CSS recovers every immutable
v3.35 byte; all older exact source guards then run unchanged. Embedded executable
JavaScript also parses with Acorn. `scripts/build-stock-easy.py` and the readable
`scripts/stock-easy/review-and-pdf.{js,css}` reproduce release + compatibility map
using only Python's standard library, without depending on ignored scratch files.

Test-only robustness fixes: the archived Attendance detail-sheet comparison seeds
distinct fixture timestamps (avoiding same-millisecond random audit-ID tie order;
no app behavior or equality assertion changed); private-link CLI/writer tests create
their own ignored, owner-only scratch parent on fresh checkouts. Current native
selectors follow the new source/review screens rather than interacting with hidden
inputs. No safety assertion or protected schema/financial/report/font guard removed.

### Historical v3.35 evidence

The **exact versioned release** passes all **1,643 offline checks** = historical
**1,527 + 116 message-entry checks**. All **ten native Chromium suites pass 772** =
historical **697 + 75 message checks**. Native forms use isolated storage and mock
accounts, never a customer backend. Message tests use synthetic names/numbers;
private screenshot/catalogue data is not in the app, public fixtures/outputs or PR.

Real browser OCR is exercised with the actual pinned **Tesseract 5.1.1 script,
worker + SIMD LSTM WASM and English 4.0.0_best_int model**. Network routes locally
fulfil matching npm files, not recognition results; the synthetic dark screenshot
is generated by browser Canvas. Complete stock quantities and green @tags survive;
raw OCR/confidence/source image remain reviewable, no O/I-to-digit guessing or
single-character-line loss. Actual corrupt/oversized/SVG images and failed engine
or model download preserve prior text; language rejection is caught without an
uncaught library exception/120-second hang, with a working text fallback. These
are not physical-phone/Safari, CDN-availability, WhatsApp or customer-backend tests.
The user's three supplied screenshots were additionally read in a disposable local
browser: all 12 item blocks / 14 movements and reviewed quantities/dates/units retained,
unclear footer-reaction symbols warned, no stock save. An explicit test year was
used, not inferred from the attachments. Those images/results remain
ignored private scratch and are deliberately not public fixtures.

Open/paste/photo/parse/preview/review never save. Tests exercise explicit type/
purpose/seller/delivery/receiver/year selection; all rows, source notes/tags,
read-only checks rather than fake openings, manual/edited/deleted/repeated receipt
and batch dedup, separate-reference New resolution, cutoff and same-day attestation,
one-write audited atomic save and whole-dated nonnegative ledger; required recovery,
stale account/data/disk, cancellation during hash/OCR, quota rollback, alias collisions,
real full backup/reload/offline and existing cloud/independent-device merge paths.

Source audit: **739 statements = 711 prior + 28 new**, **705 original statements
byte-identical**; only version, Settings note, Stock toolbar, both modal lifecycle
hooks and public Stock API change. Six exact counted hooks + bounded module/style
removal restore **the entire immutable v3.34 HTML** byte for byte, then every older
strict compatibility guard chains unchanged. **All 37 old HTML archives** retain
original bytes; no schema/table/app-localStorage-key or financial/Attendance/
Canteen/report/font rewrite. The canonical/new release are identical:
**1,186,303 bytes**, SHA-256
`db3c78c06eec679a166da09bf9273b6707e1d5209a083fa6e7598ed772ed050f`.
No private catalogue-name matches in public release/code/test/doc candidates.
Native original report/clock/logo/five-sheet-Excel suites were re-run; independent
PyMuPDF/openpyxl counts below are labelled **historical**, not a new external-parser
run for this feature. [Entry workflow / limits / duplicate rules](../STOCK-MANAGEMENT.md).

Real OCR suite setup, **from repository root** (optional scratch packages only):

```bash
npm install --prefix .cache/ocr-qa --no-save --package-lock=false --no-audit --no-fund playwright tesseract.js@5.1.1 @tesseract.js-data/eng@1.0.0
# Use an installed Playwright Chromium, or set HISAAB_CHROME_EXECUTABLE / ARGS.
# The public-only preview server described above must already be running.
NODE_PATH="$PWD/.cache/ocr-qa/node_modules" HISAAB_OCR_ASSETS="$PWD/.cache/ocr-qa/node_modules" HISAAB_URL=http://127.0.0.1:8000/Hisaab-Pro-v3.35.html HISAAB_SCREENSHOTS=1 node tests/stock-message.browser.js
```

Do not expose the repo, `.cache`, `.git`, tests or `private-imports` via the preview
server. OCR package files are served only through the isolated test's browser
request interception. Test screenshots/JSON backups under `.cache` are never
customer import files or release assets. No runtime install is needed for users.

### Historical v3.34 evidence

Exact versioned release passes **1,527 offline checks** = previous **1,457** +
**70 private-link/generator checks**. All **nine native Chromium suites pass 697** =
previous **640** + **57 private-link checks**. No private catalogue is used in the
normal suites. Optional locally selected manifests also pass the same native
workflow, never a customer session/backend. A generated Markdown-link click was
separately exercised against the exact target origin via local routed release
bytes: complete preview, original disk unchanged until one Haan, exact units/
quantities/zero rows/photo/audits; this is not a public-HTTP or phone-storage test.

The link tests cover both raw UTF-8 and actual browser gzip streams, initial and
same-document hash removal, all-row preview, account/date review without file or
extra checkbox, one atomic Add, existing actual-balance skip/different-unit whole
batch block, re-open no-op, stale context, checkpoint and native quota rollback,
cancel/Escape/replaced modal/late decoder, already-open offline use, full backup,
320/390px visible quantities and reachable confirmation. Delayed synthetic cloud
boot and the real normal-login form cannot target pre-login data; link-opening
local day survives midnight/login delay. HTTP URLs/Referers never contain the
fragment. Generator validates the actual parser, explicit date policy, current
same-origin target, bounded output, ignored owner-readable files, no overwrite,
no token console output, no network/account write.

Independent source audit: **711 statements = 691 previous + 20 new**; **685 original
statements byte-identical**. Only six integration statements change: version,
Settings note, both modal lifecycle hooks, awaiting the existing boot promise and
public test API. **Six exact hook reversals + bounded JS/CSS removal recover the
ENTIRE immutable v3.33 HTML**, then all older strict guards chain unchanged.
**36 pre-existing HTMLs**, original report/financial/Stock/cloud/storage/clock/
Excel functions, embedded fonts and notices remain intact; no new runtime service,
backend table or storage key. Public candidate files contain no exact private
catalogue names. Canonical and versioned release are identical: **1,141,305 bytes**,
SHA-256 `14af9a1b2c6c30a7b5a9deb265c60079429bf5843ed8824ac4ca0e93dfc9b3ea`.

Fresh independent PyMuPDF audit parses/renders **171 PDFs / 256 A4 pages**, no
repair/encryption/blank or out-of-bounds content; **102 logo pages** remain
proportional and non-overlapping with text. openpyxl/ZIP validates **10 XLSX /
50 sheets / 603 blank manual Advance rows**, summary above register, no error/
formula cells, external links or macros. A visually reviewed 390px private-link
preview shows the date/account, per-product quantity/unit/result and reachable
single Haan. No live customer backend, physical phone, Safari, desktop Excel or
actual WhatsApp delivery is claimed. [Stock/link guide](../STOCK-MANAGEMENT.md).

### Historical v3.33 evidence

Exact release invocation passes **1,457 offline checks**: **410 Canteen + 29 loader +
26 PDF + 126 existing cloud + 313 Attendance + 33 Employee + 51 lines + 63 logo +
50 PDF columns + 102 filters + 129 Stock + 36 Stock cloud + 89 opening import**.
All eight native suites pass **640**: **82 Stock + 130 filters + 49 lines + 106 columns
+ 78 logo + 26 Employee + 126 Attendance + 43 opening import**. The opening-import
suite uses a synthetic 93-row file by default, with two zero rows/one real JPEG;
every name/quantity/unit/minimum/date, opening count, audit and unchanged original
module is checked after actual file controls and full reload. Invalid files,
existing-name skipping, all-or-nothing unit conflicts, cancellation, quota rollback,
stale preview, offline multiline CSV and genuine full-backup download are covered.
Phone previews show quantity/unit/result beneath the name without needing sideways
scroll; full-table scrolling and a reachable confirmed Import remain available.

`HISAAB_IMPORT_FILE=/absolute/private/opening.json` optionally substitutes an
explicit local private manifest into **the same isolated native workflow**. It
never logs in to a customer account or writes a real backend. This opt-in's
screenshots/downloaded backups **contain the selected business data**: keep its
`HISAAB_ARTIFACTS` under ignored `.cache/`, never attach them to public PRs or serve
them. `private-imports/` is ignored; no private catalogue/photo/screenshot is seeded
in the app or committed fixtures. Normal tests use only synthetic data. Selecting
a file parses locally, while a user's eventual saved records use ordinary
configured Stock cloud sync; no new upload service/runtime request is introduced.

Independent Acorn audit: **691 statements = 674 previous + 17 bounded importer
statements**; **668 old statements byte-identical**. Only version, Settings release
note, Stock toolbar, both modal lifecycle hooks and public Stock test API change.
**Five exact integration hooks (six locations)** plus bounded importer JS/CSS
removal recover **the entire immutable v3.32 HTML**, then the existing strict 43
Stock reversals recover all v3.31 bytes. No historical guard was loosened. Original
Stock arithmetic/CRUD/cloud/recovery, financial/Attendance/Canteen/report/logo
functions and embedded fonts/licenses are unchanged; **33 release archives plus
two other legacy HTMLs** remain byte-identical. Canonical/release are identical:
**1,128,890 bytes**, SHA-256
`2923ef2c4928304c3128617540e1f92ffbd707fe51277cd24c4a9e71be914fd2`.

Fresh native-report audit parses and renders **171 PDFs / 256 A4 pages**, none
repaired/encrypted/blank or with out-of-bounds text/images. **102 direct-PDF logo
pages** remain proportional and do not overlap text. openpyxl/ZIP/XML verifies
**10 XLSX / 50 sheets / 603 register rows**, every manual Advance blank, summary
above the register, correct manager headers and no error/formula cells, external
links or macros. Existing report/clock/Sunday/bonus/Excel/financial requirements
remain covered. No live customer Supabase/physical-phone/Safari/desktop-Excel or
actual WhatsApp-delivery verification is claimed. [Import guide](../STOCK-MANAGEMENT.md).

### Historical v3.32 evidence

Exact release invocation passes **1,368 offline checks**: **410 Canteen + 29 loader +
26 PDF + 126 existing cloud + 313 Attendance + 33 Employee + 51 lines + 63 logo +
50 PDF columns + 102 filters + 129 Stock + 36 Stock cloud**. All seven native suites
pass **597**: **82 Stock + 130 filters + 49 lines + 106 columns + 78 logo + 26 Employee
+ 126 Attendance**. Every suite ran against the final versioned release, not only
canonical HTML. The Stock cloud suite includes 400 deterministic adversarial
local/remote pairs × local/remote/no preference; both valid inputs must produce a
valid coherent candidate or explicit conflict, never a negative/orphan ledger.

Stock photos use real file/canvas decoding in native QA. jsdom asynchronous photo
fixtures now await the actual FileReader→image-decoder event instead of a fixed
10ms sleep; closing/replacing the editor still invalidates late completions. On
serverless Chromium, full-page screenshots change the sticky horizontal nav offset
while temporarily resizing the visual viewport; mobile Stock screenshots therefore
capture the native viewport. Strict phone-navigation and Save-button bounds are
asserted independently before capture. No application navigation behavior changed
to accommodate screenshot artifacts.

Independent Acorn audit: **674 statements = 600 old + 74 new**. **575 original
statements byte-identical**, 25 integration statements changed. **43 exact counted
hook reversals** and bounded Stock module/CSS removal recover **all immutable
v3.31 HTML bytes**; older strict comparisons chain through this guard rather than
relaxing original expectations. **29 key financial/Canteen/Attendance/report/logo
function bodies**, original CSS, three font/license blocks, **32 release archives
plus two other legacy HTMLs** are unchanged. Canonical/release identical:
**1,113,221 bytes**, SHA-256
`13d56327e7f967abf639d4faf9373d342470f8ff07c11440545da94d575ffd4b`.
Only version-aware loader expectations/fallback and exact integration allowances
change in historical suites. No new app runtime dependency/request/backend/table.

Fresh native report audit: PyMuPDF parses and renders **171 PDFs / 256 pages**,
without repair/encryption/blank rendering/out-of-bounds text or images. **40 selected reports**
contain only matching sentinel bills; **102 direct-PDF logo pages** use the exact
proportional header geometry without text overlap. Representative Stock desktop,
phone, audit and Hindi print/Attendance pages visually reviewed. openpyxl opens
**10 XLSX / 50 sheets / 603 register rows**, with full summary above the register,
correct manager header, numeric hours/credits (**471 populated duration/credit
cells**), all manual Advances blank and no error/formula cells. ZIP CRCs/XML parse,
no external links/macros/media verified. QA artifacts remain ignored.
No live customer Supabase/physical-phone/Safari/desktop-Excel/actual WhatsApp
recipient verification is claimed. [Stock user guide](../STOCK-MANAGEMENT.md).

### Historical v3.31 evidence

Exact release invocation passes **1,203 offline checks**: **410 Canteen + 29 loader +
26 PDF + 126 cloud + 313 Attendance + 33 Employee + 51 lines + 63 logo + 50 PDF
columns + 102 saved-party/filtered-report checks**. Native **515** = **130 filters +
49 lines + 106 PDF columns + 78 logo + 26 Employee + 126 Attendance**. The added
17 synthetic-cloud cases include party-only upload/download, independent/concurrent
names, offline scoped reload/reconnect, old missing-field compatibility, accidental
loss protection/confirmed deletion, concurrent clear/add, display-name conflict
choices, open-report deferral, account isolation and malformed catalog refusal.
No customer backend or real recipient is involved.

The new browser suite uses actual controls, saved JSON file imports, downloaded
PDFs, real shared File bytes, print DOM + Chromium PDFs, Hindi glyphs/ActualText,
320/390px bounds, offline exports, localStorage quota rollback and actual recovery
confirmation; no builder/validation bypass. The reusable legacy-action helper
requires the current release's real two-date/party dialog before accepting its
current values. Unsupported Canteen sharing now asserts an **explicit manual
attachment link**, not automatic WhatsApp opening/delivery.

One pre-existing logo-browser fixture issue was reproduced with Date.now fixed:
its fast synchronous seed creates equal history timestamps; immutable v3.28
already sorts those rows by ID on load. Only history array order changed, every
row and the complete raw storage remained identical. The fixture now reloads
**v3.28 itself** before taking the strict migration baseline; the forced-tie case
and final unmodified 78-check suite pass. No application normalization or data
assertion was relaxed.

Independent Acorn audit: **600 statements = 557 pre-existing + 43 new bounded
module statements**. **536 pre-existing statements byte-identical**, 21 enumerated
integration statements changed; **424 of 440 old function declarations** unchanged.
The persistent compatibility guard reverses **38 exact integration edits** and
removes only the bounded module, reproducing **the entire immutable v3.30 HTML**.
Original CSS, all three embedded font/license blocks, and all **33 pre-existing
versioned/legacy HTML files** remain byte-identical. Loader only adds v3.31 first;
canonical and release are identical **1,047,678-byte** files, SHA-256
`e77b65440b0f93216f055442232426a785862a25b34899cf0eefe82b66f77e51`.
No new runtime request/dependency, direct storage write/key or backend/table.

Independent PyMuPDF/openpyxl parses/rasterises **185 PDFs / 288 pages / 10 XLSX**
(includes one intentional legacy-bug reproduction). No repaired/encrypted/blank
PDF pages, out-of-bounds text/images or logo/text overlaps. **52 combined-selection
outputs** exclude every sentinel other-party/outside-date bill; **160 actual
seven-column selected ledger rows** have exact expected cells. **120 direct-PDF
logo pages** are proportional/once-per-page/non-overlapping. Complete 100-occurrence
six-page selected report and long literals, genuine Hindi shaped images/UTF-16
ActualText and NotoSansDevanagari glyphs in print verified; representative pages
also visually inspected. Ten workbooks retain all **50 sheets**, **603 register rows**,
**1,161 numeric/duration cells**, top summary/Sundays/bonus, blank manual Advances,
valid ZIP CRCs and no external links/formulas/images. QA artifacts remain ignored;
no physical-phone/Safari/desktop-Excel/live-customer-cloud/WhatsApp-delivery claim.

### Historical v3.30 evidence

v3.30 added **50 offline + 106 native** targeted PDF-column checks. That release's
complete suite was **1,080 offline + 385 native**. Run the new native suite with
`node tests/canteen-pdf.browser.js` under the same browser/server environment
(or `npm run test:canteen:pdf:browser --prefix tests`). Native print/share destinations
are stubbed; actual saved PDF bytes are independently parsed. Superseded v3.18
summary-only expectations now assert removal of full slots, while retaining all
finance/source/reference-font/closing guards. Two native Attendance viewport checks
wait for their real resize/layout to satisfy the **same strict bounds** instead of
sampling an intermediate frame; no application or CSS change.

An independent full-script AST audit against v3.29 found **557 statements**, **551
byte-identical**. Only APP_VERSION, the one Settings release note, CT_COLS_MONTH,
ctPrintHTML, ctPdfDayStr and ctPdfMonthStr differ. The committed suite goes further:
it counts/reverses the exact allowed report edits and byte-compares the entire
remaining HTML. All 32 historical archives and locked dependencies are unchanged.
Independent PyMuPDF/openpyxl checks **154 PDFs / 216 pages / 10 XLSX**, including one
legacy-bug reproduction, **67 seven-column monthly ledgers** and **38 native fixture
ledgers** with exact daily values under the right headers. Every page is unrepaired,
A4, rasterised and within page bounds; **100 branded direct-PDF pages** have one
proportional non-overlapping logo. Original item occurrences/own prices, two-page
Attendance, all five workbook sheets and blank manual Advances remain complete.
Artifacts stay in ignored `.cache/`; no physical-phone/Safari/desktop-Excel/live
customer-backend or WhatsApp-delivery claim.

v3.29 adds **63 logo + six cloud offline checks** and **78 native logo checks**.
That release’s complete suite was **1,030 offline + 279 native**. Its full-script AST audit
against v3.28 allows only the logo helpers, Settings/events, image writer, conditional
report/print headers, wrapped signatory and version/note. **36 core function bodies
and the entire Store/Cloud/Recovery objects remain byte-identical**, as do CSS,
font/license blocks and old archives. `logo-compat.js` reverses only individually
counted, exact header/writer/signature slots before legacy whole-body comparisons;
it does not exclude any financial/storage/clock/bonus/row/Excel logic.

Native downloads plus deterministic fixtures are independently reparsed/rasterised
by PyMuPDF/openpyxl: **81 PDFs / 11 XLSX**. All 44 branded direct-PDF pages have one
proportional, non-overlapping logo; every document shares one image object. This
includes long business headers/continued dates, full Hindi image/ActualText content,
120 advances over four salary pages, 100 item quantities over six Canteen pages,
62-shift two-page Attendance, real browser-print logos and unchanged five-sheet
numeric workbooks/blank Advances. A sub-point continued-date/image intersection
was caught by geometric checks and fixed by reserving the horizontal logo slot;
long company signatory text wraps without altering the no-logo legacy path.
No physical-phone/Safari/desktop-Excel/live-customer-backend or delivery claim.

v3.28 added **51 offline + 49 native** repeated-item regressions; its complete suite
was **961 offline + 201 native** checks. Template selection intentionally saves
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

Regular tests **real Supabase project, email password ya customer data** use nahi karte. Optional `HISAAB_IMPORT_FILE` private-file audit sirf explicit local input ko disposable browser me test karta hai; uske outputs private/ignored rakhein, customer backend par nahi. Physical devices/live RLS config ka test nahi hai. Chromium smoke QA do separate desktop/mobile-size browser processes, real UI login/entry forms, offline reload, reconnect+merge, financial conflict choice aur recovery list par mock backend ke saath ki gayi. Optional browser/PDF artifacts `.cache/` me hain, Git me nahi.

Existing project ko reset nahi karna; update/recovery, backend schema + RLS expectations aur known limits: [`CLOUD-SYNC.md`](../CLOUD-SYNC.md). **Sab clients update karein**—old cached clients ke unsafe writes ko is client-side fix se server par reject nahi kiya ja sakta. localStorage rollback best-effort/finite hai, historical backup ka substitute nahi.
