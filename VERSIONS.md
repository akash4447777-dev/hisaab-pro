# Hisaab Pro — auto-update system (v2.0)

> **Latest v3.40 — Private received-stock list link.** Explicit date ka naya **Stock In** existing products mein ADD hota hai, opening/available overwrite nahi. Actual-account review mein 75% unique matching / saved identity / exact units aur visibly proposed new products; **Haan** se hi one guarded atomic combo save + combined PDF. Opening cutoff, same-day consent, duplicate/reference, context/recovery/quota guards retained. Link preparation/opening is not an account save. 30 grouped/custom product-unit choices retained. [Stock guide](STOCK-MANAGEMENT.md).
>
> **Purana data/features retained:** 75% unique name matching, one party / one message / one combo / one PDF, original units/quantities, dated Stock In / Out / Sales / derived availability / audit / minimum warnings, message year/type/role/arithmetic/duplicate/opening/atomic guards, opening links/import, Canteen parties/filtered PDFs/original item occurrences, logo, Employee wording, salary aur Attendance/five-sheet Excel. Same browser/site mein **Panel v3.40** confirm karein—entries re-enter, storage clear ya logo dobara upload na karein. [Canteen](CANTEEN-REPORTS.md) · [Attendance](ATTENDANCE.md) · [Safe sync/recovery](CLOUD-SYNC.md).

## Ab kaise kaam karta hai

Repo me **`index.html` ek chhota "loader" hai**. Ye har baar khulte hi check karta hai ki repo me
sabse naya version kaun sa hai, aur **seedha usi ko khol deta hai**.

Iska matlab: **user ka root link nahi badalta**. Loader sabse naya release chunta hai;
maintainers naye release par known fallback list bhi update karte hain.

> ⚠️ **v3.1 me loader wapas aaya.** Pehle `index.html` repo se delete ho gaya tha, isi liye
> `https://<username>.github.io/<repo>/` par **404 "File not found"** aa raha tha
> (GitHub Pages root URL ke liye `index.html` maangta hai). Ab loader dobara repo me hai.
>
> Loader kaise chunta hai: GitHub API se file-list → sabse bada `Hisaab-Pro-v<major>.<minor>.html`.
> API na chale to pichhla chuna hua naam (localStorage cache) aur phir jaane hue naam HEAD-probe.
> Kuch na mile to screen par direct links + retry. `file://` (Android download) par seedha file-chooser.

```
https://<username>.github.io/<repo>/        <- yahi link hamesha
        |
        +-- index.html (loader, 9 KB, ek baar daalna hai)
        |
        +-- Hisaab-Pro-v2.0.html   <- asli panel (140 KB)
        +-- Hisaab-Pro-v2.1.html   <- jab naya version aaye, bas ye upload karo
        +-- Hisaab-Pro-v2.2.html   <- ... aur ye
```

## Ab ek baar (sirf pehli baar) — 4 steps

1. GitHub repo kholo → **Add file → Upload files**
2. Ye **do** files select karo aur upload karo:
   - `index.html` *(loader — purane index.html ko replace kar dega)*
   - `Hisaab-Pro-v2.0.html` *(asli panel)*
3. **Commit changes** dabao
4. 1–2 min baad apna normal link kholo: `https://<username>.github.io/<repo>/`
   → panel khulega, sidebar me **`Panel v2.0`** dikhega ✅

## Uske baad har naye change par — sirf 3 steps

1. Main naya file dunga, jaise **`Hisaab-Pro-v2.1.html`**
2. Repo → **Add file → Upload files** → bas wahi ek file upload → **Commit changes**
3. Link refresh karo (wahi purana link) → **panel khud naya version khol lega**
   *(sidebar me `Panel v2.1` likha milega = confirm)*

> Purane version files ko historical releases ki tarah unchanged rakhein. Loader API se
> latest chunta hai; API fail ho to latest known release ko older cached build se pehle probe karta hai.

## Naam ka rule (important)

File ka naam me version hona chahiye: **`Hisaab-Pro-v<number>.<number>.html`**
- Android jab download kare aur naam `Hisaab-Pro-v2.1 (1).html` ho jaye — **phir bhi chalega**
- Agar naam me version nahi mila, to loader **sabse badi HTML file** ko app maan leta hai (jo ki panel hi hoti hai)

## Agar naya version na dikhe

| Problem | Solution |
|---|---|
| Purana panel khul raha hai | Page refresh karo; 10–20 sec baad phir try karo (GitHub Pages ko build hone me 1–2 min lagta hai) |
| Sidebar me version nahi dikh raha | Purana build chal raha hai — loader wala naya `index.html` upload hua ya nahi check karo |
| "App file nahi mili" screen | Repo me `Hisaab-Pro-vX.Y.html` upload karo, ya naam me version daalo |
| Root URL par **404 "File not found"** | Repo me `index.html` (loader) maujood hona chahiye — ye v3.1 me wapas add hua |
| Internet slow | Loader GitHub ki file-list padhta hai; fail hone par newest known/cached release pehle probe karta hai |

## Version history

| Version | Date | Kya badla | File |
|---|---|---|---|
| v3.40 | — | **Private typed received-stock list (`#stock-in=`), not an opening snapshot.** Explicit receipt date, full actual-account source/matched/new-product review, unique75%+ local matching/manual ambiguity, exact saved units and independent quantities; existing stock ADD only, visibly approved new catalogue products with no fabricated openings. One Haan / one atomic required-checkpoint save / per-product and In audit; one History combo + branded PDF/Edit/Delete. Before-opening/same-day attestation, real-reference/manual/edited/deleted/cross-message dedup, originally skipped retries, every stale/async-cancel/quota/ledger guard retained. Early bounded local raw/gzip scrub and normal login wait; local-only developer generator writes ignored owner-readable private hand-offs without publishing lists or remotely saving accounts. No migration/schema/key/backend/library/financial/Canteen/Attendance change. Six exact hooks/seven locations + bounded JS/CSS restore EVERY immutable v3.39 byte; all42 older HTMLs untouched. **1,934 offline + 1,078 native Chromium checks** (86 +65 new), independent **25 Stock PDFs /84 A4 pages**, retained **171 PDFs /10 five-sheet XLSX /603 blank Advances**. Synthetic/mock QA only, not a customer-account save or live-backend/physical-phone/Safari/desktop-Excel/WhatsApp-delivery proof. [Verification](tests/README.md) · [Guide](STOCK-MANAGEMENT.md). | `Hisaab-Pro-v3.40.html` |
| v3.39 | — | **30 visible grouped Stock product-unit choices** including box, set, bundle, roll, pcs, carton, pair, bag, weight/volume/length units. Other/custom retains arbitrary 18-character labels, existing spelling/case and original quantities; no pack conversion. Default pcs, accessible native keyboard dropdown, phone-friendly custom field. Existing guarded Save, movement-based unit lock, audit/ledger, one-party combos/PDF/75% matching, cloud/recovery and all other modules unchanged. Three counted hooks + bounded JS/CSS restore EVERY immutable v3.38 byte; prior guards still run and all 41 older HTMLs retained. **1,848 offline + 1,013 native Chromium checks** (54 + 72 new unit checks); independent 24 Stock PDFs / 82 pages plus retained 171 PDFs / 10 five-sheet XLSX / 603 blank Advances. [Verification](tests/README.md) · [Guide](STOCK-MANAGEMENT.md). | `Hisaab-Pro-v3.39.html` |
| v3.38 | — | **Unique 75%+ local product-name auto-selection.** Exact spelling no longer required: normalized word Dice / character edit similarity handles typos, word order, spacing, common plurals and omitted descriptors. Actual raw >=75%, not rounded up; visible match percentage, saved product/unit and editable choice. Exact names/confirmed audit aliases retain priority. Close runners-up within five points, explicit number/size/model/colour/variant differences, omitted-detail same-family variants and unit conflicts remain manual. No stock conversion, new product, silent Save or API/library. One party/message/combo/PDF, independent exact units/dates, source notes, audit/aliases, opening/maths/dedup/atomic/stale/quota/negative safety and all other modules unchanged. Six counted integration hooks + bounded readable matcher restore EVERY immutable v3.37 byte; older guards chain and all 40 old archive/legacy HTMLs retained. **1,794 offline + 941 native Chromium checks**, including 43 matcher + 38 actual UI/OCR/offline/PDF checks. Independent **24 Stock PDFs / 82 A4 pages / 61 logo pages**, plus retained **171 PDFs / 256 pages / 10 XLSX / 50 sheets / 603 blank Advances**. Synthetic storage/mock accounts only; no live-customer/physical-phone/Safari/CDN/desktop-Excel/WhatsApp-delivery claim. [Verification](tests/README.md) · [Guide](STOCK-MANAGEMENT.md). | `Hisaab-Pro-v3.38.html` |
| v3.37 | — | **One pasted message / one party / ONE Stock combo entry.** All products live inside one expandable History card with shared party, tagged people/explicit roles and one branded combined PDF; exact units/actual In/Out/Sale dates/full-ledger product balances retained. Whole-combo reviewed Edit/Delete use one atomic safety-checkpoint save with independent child audits, no partial invalid/negative/stale/quota action; unchanged legacy note-only tags are a strict no-op. Counts distinguish combos/products/movements; partial filters warn that combo actions affect all children, while filtered History PDF remains matches-only. Whole-combo pagination, old audited-message grouping without migration, no same-party/date guessed merges or manual-row grouping. No schema/storage key/backend/financial/Attendance/Canteen/font rewrite. Reproducible immutable-v3.36-based builder with 23 exact reversal hooks; every prior archive retained. **1,751 offline + 903 native Chromium checks** (47 combo + 78 native combo), including real OCR, 320/390px review, full 50-product/Hindi/logo/offline PDFs and 42 whole-combo pagination. Independent **23 Stock PDFs / 81 A4 pages / 60 logo pages**, plus retained **171 PDFs / 256 pages / 10 XLSX / 50 sheets / 603 blank Advances**. Synthetic accounts only; no customer-backend/physical-phone/Safari/desktop-Excel/WhatsApp-delivery claim. [Guide](STOCK-MANAGEMENT.md) · [Verification](tests/README.md). | `Hisaab-Pro-v3.37.html` |
| v3.36 | — | **Simpler Stock review, every tagged person and branded Stock PDFs.** Progressive source/year → complete editable review → explicit atomic Save; exact product matches/actions compact, ambiguity/warnings/opening checks visible. Individual Unicode/wrapped @tags, explicit one-tap roles, missing-name Add/Enter/remove and uncommitted-name guard; all informed-only people persist in ordinary notes/delivery details, no Employee/profile/schema migration. Saved tag chips and immediate message-PDF receipt; legacy note-only tags read without rewrite. Audited saved-row provenance permits safe retry of deliberately skipped partial-batch rows without replaying recorded/remapped/manual/edited/deleted movements. Available Stock in exact units, every combined-filter History row with full-ledger balance, and one audited message's current rows; local paginated logo-every-page PDFs with complete roles/tags/source, bounded long headers, Hindi shaping, actual PDF file share/manual fallback/cancel/stale-context cleanup. Read-only reports, no pricing/invoice/service, no financial/cloud/Attendance/old-PDF/font rewrite. 32 exact integration reversals + bounded JS/CSS restore every immutable v3.35 byte; all older HTMLs retained. **1,704 offline + 825 native Chromium checks**, including real OCR, persisted tags/explicit roles, 320/390px review and complete offline/filtered/Hindi/logo PDFs. Independently opened/rendered **14 Stock PDFs / 41 pages / 20 proportional logo pages**, plus retained **171 PDFs / 256 pages / 10 XLSX / 50 sheets / 603 blank Advances**. Reproducible standard-library builder. Isolated synthetic accounts/storage; no physical-phone/Safari/public-CDN/customer-backend/desktop-Excel/WhatsApp-delivery claim. [Guide](STOCK-MANAGEMENT.md). | `Hisaab-Pro-v3.36.html` |
| v3.35 | — | **Reviewed message / screenshot → Stock In / Sale / Out.** One complete pasted message or local browser OCR image prepares every dated movement; original header/party/item/tags/driver context retained. Explicit blank-by-default year, type/purpose and salesperson/delivery/office-recipient review; conservative exact name/unit + confirmed audit aliases, no fuzzy auto-match/pack conversion, no quoted-sender or role guessing. Previous/Available are exact checks, not openings/manual adjustments. Semantic IDs and current/edited/deleted audit comparison guard repeated messages/receipts/manual entries; opening cutoffs/after-snapshot attestation and explicit unique-reference New decisions prevent silent replay. One complete guarded atomic save + required recovery copy + independent audit, cancellation/stale async/account/disk/quota rollback; text offline and honest local OCR confidence/model failures. No automatic inventory migration or schema/storage-key/backend/financial/report/font rewrite; six exact integration reversals + bounded module/style restore **every immutable v3.34 byte**, all 37 old archives unchanged. **1,643 offline + 772 native Chromium checks** (116 message + 75 native message), including real browser OCR, corrupt/network/model failures and 320/390px previews. Native QA uses isolated Chromium/mock accounts and locally fulfilled real engine/WASM/model assets; no customer backend, physical-phone/Safari/desktop-Excel/WhatsApp-delivery claim. [Guide](STOCK-MANAGEMENT.md). | `Hisaab-Pro-v3.35.html` |
| v3.34 | — | **Private one-confirmation Stock hand-off, no file chooser.** Current same-origin panel locally scrubs and decodes a bounded UTF-8/gzip fragment, waits for normal cloud boot/login, then previews every exact product/quantity/unit/photo with account and opening date. Explicit import-day means local day at link open, retained across midnight/login delay; explicit/blank date also supported. One Haan delegates to existing additive atomic Stock opening save, required safety checkpoint and independent provenance audits; skip actual existing same-unit balance, whole-batch unit conflict, strict re-open no-op, stale-data/account/disk/quota/cancel/late-reader protection. Local developer generator writes only ignored private hand-off files, never publishes catalogue or remotely modifies an account; links are not encryption/authorization. Original schema, runtime dependencies, Stock/financial/Canteen/Attendance/reports/fonts unchanged. **1,527 offline + 697 native Chromium checks** (70 link/generator + 57 native link); fresh independent **171 PDFs / 256 A4 pages / 102 non-overlapping logo pages / 10 XLSX / 50 sheets / 603 blank Advances**. Six exact integration hooks plus bounded link JS/CSS reverse to all immutable v3.33 HTML; 685 of 691 original statements byte-identical, 20 new statements, all 36 pre-existing HTMLs unchanged. No customer session/backend/physical-phone/Safari/desktop-Excel/WhatsApp delivery claim. [Guide](STOCK-MANAGEMENT.md). | `Hisaab-Pro-v3.34.html` |
| v3.33 | — | **Safe additive Stock opening-file import.** UTF-8 CSV / versioned JSON, 5 MB / 2,000 rows, full read-only preview including exact opening quantity/unit and actual skip balance, explicit blank-by-default cut-over date and resettable review confirmation. Same-name/same-unit skip unchanged; mismatched unit or duplicate file names refuse the whole batch, no conversion/overwrite/double-add. One guarded atomic Stock save with required safety copy, new products + positive dated opening In, zero-stock products without fake movements, optional deduplicated embedded JPEG/notes and independent before/after file-provenance audit. Cancel/invalid/failed/stale-account/disk/async-reader paths remain safe. Ordinary Stock schema/cloud/recovery reused; no financial integration, new service/key/table or bundled customer inventory. Mobile quantity/unit/result visible next to each product. **1,457 offline + 640 native Chromium checks** on identical canonical/release (89 importer unit + 43 importer native; includes real file/date/review, full batch, photo, reimport, conflicts, quota, mobile and offline cases). Existing salary/Canteen/Attendance/export suite and independent **171 PDFs / 256 rendered pages / 10 XLSX / 50 sheets / 603 blank manual Advances** pass. Exact five integration hooks (six locations) + bounded importer JS/CSS recover all v3.32 bytes; 668 of 674 existing statements unchanged, 17 new statements, all 33 release archives + two other legacy HTMLs retained. No customer account imported or live backend/physical-phone/Safari/Excel/WhatsApp delivery claimed. [Guide](STOCK-MANAGEMENT.md). | `Hisaab-Pro-v3.33.html` |
| v3.32 | — | **Stock Management: automatic derived inventory, complete history and audited changes.** Separate shell tab with optional local product photos, dated opening entries, Stock In, required-purpose Stock Out, and Sale with customer/salesperson/delivery name, phone and address/vehicle details. Per-product 3-decimal Opening + In − Out − Sales; full dated-ledger validation after every CRUD, never a manual available counter or silent negative balance. Inclusive combined product/party/salesperson/date/type/search filters, full pagination, strict-below-minimum warnings, before/after audit including cascade deletion and historical images. Existing optional `settings.stockInventory` integrates JSON/old-missing-field preservation, account-scoped cache, CAS/cloud conflict checks, atomic rollback, confirmed erase and dependency-aware recovery; concurrent overselling pauses for a coherent product-ledger choice. No pricing/financial integration or new backend/storage key. **1,368 offline + 597 native Chromium checks** on identical canonical/release bytes (129 Stock + 36 synthetic Stock-cloud; 82 Stock native). Includes 400 deterministic adversarial offline pairs × 3 merge preferences, concurrent photo conflicts and photo-only payload safety. Independent **171 PDFs / 256 rendered pages / 10 XLSX / 50 sheets / 603 register rows**, 40 selected outputs and 102 proportional non-overlapping direct-PDF logo pages. AST: 575 of 600 original statements byte-identical; 25 enumerated integration statements, 74 new statements. Reverse 43 exact hooks + bounded Stock module/CSS to recover entire immutable v3.31; all 32 release archives and two other legacy HTMLs unchanged. Original Canteen/Attendance/financial/report functions, fonts and license retained. [Guide](STOCK-MANAGEMENT.md). No live customer backend/physical-phone/Safari/desktop-Excel/WhatsApp-delivery claim. | `Hisaab-Pro-v3.32.html` |
| v3.31 | 2026-11-24 | **Saved Canteen parties and combined From Date / To Date × Party PDFs.** Add independent names (including zero-entry parties), reuse them in the real entry selector/free text, view party-wise entries, and choose inclusive validated dates + exact canonical party in every download/WhatsApp PDF/print dialog. One detached matching snapshot drives entries/bills/notes, every original own-price item occurrence, day/party summaries and Net/Paid/Baki; invalid, no-match, unknown/stale account/data selections refuse rather than broadening. Six templates/saved logos/seven-column ledger retained; real Hindi shaped PDF + Indic-first print and portable `.pdf` filenames. Genuine shared File/manual Document attachment/cancel semantics. Optional `settings.canteenParties` integrates validation/counts/merge/deletion safeguards, old-missing-field JSON/cloud preservation, confirmed erase/Undo and actual safety-copy recovery without entry string/ID migration, backend/storage-key or financial/Attendance changes. **1,203 offline + 515 native Chromium checks** on the exact release (102 targeted + 17 new synthetic-cloud; 130 targeted native). Independent **185 PDFs / 288 pages / 10 XLSX**, including one legacy-bug PDF: 52 selected outputs / 160 exact ledger rows, 120 proportional non-overlapping direct-PDF logo pages, all pages rendered/unrepaired/in bounds, complete six-page/100-line report, Hindi and five-sheet numeric workbooks/blank Advances. AST: 536 of 557 original statements byte-identical, 21 enumerated integration statements plus 43 new module statements; reversing 38 exact hooks restores entire v3.30. Original CSS/fonts/license and all 33 archive/legacy HTML files unchanged. Legacy native fixture now reloads immutable v3.28 before comparison because its existing history tie-sort is nondeterministic for fast same-millisecond synthetic seeds; no app behavior changed to suppress it. No live customer backend/physical-phone/Safari/desktop-Excel/WhatsApp-delivery claim. [Guide](CANTEEN-REPORTS.md). | `Hisaab-Pro-v3.31.html` |
| v3.30 | 2026-11-14 | **Remove complete Bikri / Kharcha columns and summary slots from all Canteen PDF formats.** Seven-column daily monthly ledger (Date / Din / Entries / Saman / Net / Paid / Baki), wider full-A4 cells, matching merged total, no orphan category values/underlines or formula words. All six day/month templates, genuine WhatsApp PDF Files/manual fallback and matching browser-print PDFs. Saved sale/expense entries and every net/paid/balance calculation, app/CSV, separate 500g occurrences/own prices, company-logo resources, salary/Attendance/five-sheet Excel, fonts/CSS and sync/recovery untouched; re-download old PDFs, no migration/re-entry. Exact whole-HTML regression permits only audited report edits/version/note; independent AST: **551 of 557 statements byte-identical**, only version, note, three report builders and monthly column constant changed. **1,080 offline checks** (previous 1,030 + 50 targeted) and **385 native Chromium checks** (previous 279 + 106 targeted). Independent PyMuPDF/openpyxl: **154 PDFs / 216 pages / 10 XLSX** (includes one legacy-bug PDF), 67 real seven-column ledgers, exact original native daily cells/closing values, 100 branded direct-PDF pages proportional/non-overlapping, every page rendered/in bounds, all five sheets and blank Advances. Two pre-existing native viewport probes now await real asynchronous resize/layout with the same strict bounds; no app/CSS change. No live customer cloud/physical-phone/Safari/desktop-Excel/WhatsApp-delivery claim. | `Hisaab-Pro-v3.30.html` |
| v3.29 | 2026-11-14 | **One-time company logo in Settings → all new PDFs automatically.** Native PNG/JPG/WebP upload/preview/auto-save/replace/confirmed-remove, ≤5 MB input, bounded locally rasterised JPEG ≤640 px / 120,000-character data URL, white transparency, no image service. Optional Settings field persists through reload, JSON backup/restore and existing scoped cloud; explicit removal and competing-logo conflict choices. Processing/cancel/invalid-file/quota/stale-data/account guards keep the previous logo/data. One shared JPEG XObject drawn proportionally on every salary/payroll/Canteen/Attendance PDF page, including continuations and WhatsApp Files; one resource dictionary coexists with shaped Hindi/ActualText images. Conditional header/date/signatory wrapping prevents overlap/clipping; logo-free legacy salary/PDF/Attendance/Excel compatibility checked. Browser print waits for logo decoding. Financial/storage/cloud/recovery engines, 36 protected function bodies, original item rows, clock/Sunday/bonus rules, complete CSS/fonts/licenses and all old archives unchanged. **1,030 offline checks** (406 Canteen + 51 lines + 29 loader + 26 PDF + 109 cloud + 313 Attendance + 33 Employee + 63 logo); **279 native Chromium checks** (49 + 126 + 26 + 78 logo). Independent PyMuPDF/openpyxl: **81 PDFs / 11 XLSX**, including 44 branded direct-PDF pages with no image/text overlap, four-page/120-advance salary, six-page/100-line Canteen, long headers, two-page/Hindi Attendance, genuine numeric five-sheet exports and blank Advances. [Guide](COMPANY-LOGO.md). No physical-phone/Safari/desktop-Excel/live-customer-cloud/WhatsApp-delivery claim. | `Hisaab-Pro-v3.29.html` |
| v3.28 | 2026-11-14 | **Canteen repeated item lines no longer merge in daily/monthly PDF, print or item detail.** A read-only original-line query replaces name/unit grouping only in detailed reports; each saved occurrence keeps its quantity, unit, own rate/amount and source date/type/party/bill/reference, including matching lines in the same bill. Date/save order and original within-entry order; lump-sum items are not invented. Grand totals/paid/baki/net, original entries/raw JSON/CSV/history, rate-catalog/history cumulative analytics, storage/cloud/financial/Attendance functions and full stylesheet/fonts are unchanged. Monthly UI remains an explicitly limited 14-line preview; text share an explicit six-line preview; PDF/print include every saved line with continuation headers and one final closing. **961 automated checks** = 406 canteen + 29 loader + 26 PDF + 103 cloud + 313 Attendance + 33 Employee + 51 repeated-item checks; **201 native Chromium checks** = 49 repeated-item + 126 Attendance + 26 Employee. Native v3.27 forms reproduce 1000g before the fix, navigate without any raw-storage rewrite, and download/share two 500g rows after; same-bill own rates, 100 repeated rows, reload and 320/390px tables checked. Independent PyMuPDF/openpyxl validation of **41 PDFs / eight XLSX workbooks** includes the legacy reproduction, actual own-rate/amount cells, all continuation rows/closing, page bounds and unchanged numeric Attendance exports. Historical archives unchanged; no customer backend, physical-phone or WhatsApp-delivery claim. | `Hisaab-Pro-v3.28.html` |
| v3.27 | 2026-11-14 | **Employee / Employees wording throughout the panel.** Renamed 108 JS UI literals plus static navigation/add labels: dashboard/Hisaab/employee/ledger/history/settings/Attendance explanations, search/help/validation, CRUD/bulk/reset confirmations, toasts, command palette, salary CSV, salary PDF summary/signatures, print and salary sharing. Display-only cloud conflict collection alias; persisted paths, `workers` / `workerId` keys, actions/routes/selectors, custom names/notes and every original data payload remain. No salary/canteen/Attendance arithmetic, clock, bonus, Excel-layout, storage/cloud/merge/recovery or stylesheet/font change; no AI added. Whole-script AST comparison permits only audited labels, version/note and display alias; 20 protected core/report functions and original fonts/CSS compared byte-for-byte. **910 automated checks** = 406 canteen + 29 loader + 26 PDF + 103 cloud + 313 Attendance + 33 Employee; **152 native Chromium checks** = 126 Attendance + 26 Employee, with real v3.26 storage navigation/CRUD/reload/CSV/PDF/print/share and 320/390px labels. Independent **10 PDF / 8 XLSX** validation includes six-page payroll label bounds plus unchanged numeric Attendance exports. Historical archives untouched; no real-device/WhatsApp-delivery/backend testing claim. | `Hisaab-Pro-v3.27.html` |
| v3.26 | 2026-11-14 | **Excel first-sheet summary above the user's photo-style date register.** Numeric distinct Present days (not shift count), leave/absent/half/holiday/week-off dates with saved mark counts, actual arrival days, every actual attended Sunday date/count, hours/credits/open/saved/unmarked/calendar/Tap/Time counts; separate full-month/all-shift qualifying OUT count, real numeric bonus % and next threshold for each month. Below: Date / manager-status / actual IN / actual OUT / blank Advance / shift / numeric elapsed hours / credit / full remarks; black grid, white rows, yellow calendar Sundays, total row. Advance is optional manual export space, no linked salary-worker join, guessed amount/zero/total or write-back. Every selected row and all five sheets retained; four detail-sheet XMLs and Attendance PDF byte-identical to v3.25 under a fixed timestamp except PDF version footer. Only identity rows 1–3/date-status columns pinned, so long summaries do not obscure the table; real table filters and print settings. Data/history/storage/cloud/clock/bonus/financial functions and panel stylesheet/fonts unchanged. **877 automated checks** (406 canteen + 29 loader + 26 PDF + 103 cloud + 313 Attendance), **126 native Chromium checks**; independent **18 PDF / 18 XLSX** validation including top metrics/percentage/dates, blank Advances, full raw timings/remarks/history, long summaries and Unicode. FileReader QA now waits for real completion rather than a race-prone sleep. No real-device Excel/WhatsApp/Safari/customer-backend test claim. | `Hisaab-Pro-v3.26.html` |
| v3.25 | 2026-11-14 | **Screenshot correction: Morning / Afternoon / Evening / Night in both Check-in and Check-out clock dropdowns**, each retaining Same day / Next day (8 choices). Natural clock bands with explicit help: Morning 05:00–11:59, Afternoon 12:00–16:59, Evening 17:00–20:59, Night 21:00–04:59; clock labels, not fixed shift schedules. 12 afternoon=noon, 12 night=midnight; day offset is independent. Reject mismatched periods rather than guessing. Shift/profile suggestions affect blank clocks only. Old canonical 13:33 now reopens as 1:33 afternoon with the original 27h 01m; 01:33 remains 15h 01m from 10:32 morning next day. Consistent board/history/PDF/Excel labels; no saved data/history/financial/storage/cloud-schema rewrite. Existing panel stylesheet/fonts, reference report design/two-page guard, automatic bonus and WhatsApp PDF behavior retained. **863 automated checks** (406 canteen + 29 loader + 26 PDF + 103 cloud + 299 Attendance), **120 native Chromium checks**; independent **18 PDF / 17 XLSX** validation including clock boundaries/long labels. Exhaustive 1,440-minute bare/same/next-day round-trips and real v3.24→v3.25 byte-identical storage navigation. No physical-phone or real WhatsApp-delivery claim. | `Hisaab-Pro-v3.25.html` |
| v3.24 | 2026-11-14 | **Reference-style Attendance ledger PDF, four shifts, derived monthly bonus and individual WhatsApp PDF.** Original Segoe Regular/Bold/Black, split shop/report header, ruled key/value totals, light seven-column register, full notes, dated Sundays, atomic actual-hour total / outlined bonus explanation / signatures; 1 page where practical, hard maximum 2 with full-Excel/shorter-range refusal for oversized details. Morning/Afternoon/Evening/Night keys across forms/bulk/filter/history/export; legacy Day/Night not remapped. Strictly after arrival-day 23:45 completed OUTs: 0–2 = 0%, 3–4 = 1%, 5–6 = 2%, then +1% per 2. Full calendar month/all shifts even for partial reports; attendance-date month, next-morning eligible, one count per saved OUT, no history duplicates. Numeric Excel bonus Summary; percentage only, no salary/payment mutation. Real PDF file to supported share sheet; honest manual-attachment fallback/cancel/fresh-gesture/stale-account guards. Panel stylesheet, embedded fonts, actual-hour/storage/cloud/financial core unchanged; update all clients for new shift values. **845 automated checks** (406 canteen + 29 loader + 26 PDF + 103 cloud + 281 Attendance), **105 native Chromium checks**; independent **15 PDF / 14 XLSX** validation. Native share API is stubbed in QA; no physical-phone/WhatsApp delivery verification. | `Hisaab-Pro-v3.24.html` |
| v3.23 | 2026-11-14 | **Compact report studio, PDF hard maximum 2 pages and advanced Excel register.** Quiet manager header, seven-column date-wise table, explicit morning/night + next-day markers, gold calendar Sundays, separately dated actual Sunday visits, complete numbered notes and atomic totals/signatures. Full 31-day single-shift month fits 1 page; 62 Day/Night entries fit 2. If all details cannot fit legibly, refuse PDF with shorter-range/full-Excel guidance, never silently omit or shrink body below 8.5pt. New primary Attendance register: merged headings, borders/status colours, genuine Excel dates, numeric `[h]:mm` durations/totals, credits, full wrapped notes, frozen columns/header bands, filters and print settings; four existing detail sheets retained. Live page/totals preview and stale-ready-link removal. **Export-only, data/calculation/storage/cloud core functions unchanged.** **796 automated checks** (406 canteen + 29 loader + 26 PDF + 100 cloud + 235 Attendance), **85 native Chromium checks**; independent 12 PDF / 13 XLSX validation. | `Hisaab-Pro-v3.23.html` |
| v3.22 | 2026-11-14 | **24-hour Attendance cap removed.** Same/next-day positive spans over 24h now preview/save/clock-out/reopen/restore/sync/export correctly, including 10:32 morning → next-day 1:33 night = **27h 01m**. Equal/reversed clocks still rejected, no automatic day/period guessing. Full actual hours, one credit per completed record, Sunday arrival-date rules and 12-hour controls retained. No storage/schema migration or salary/canteen changes. **771 automated checks** (406 canteen + 29 loader + 26 PDF + 100 cloud + 210 Attendance), **64 native browser checks**, plus independent PDF/XLSX validation of the screenshot span. Update all clients; older versions can reject >24h spans. | `Hisaab-Pro-v3.22.html` |
| v3.21 | 2026-11-14 | **Variable actual hours, Sunday visits aur redesigned Attendance PDF.** No fixed day/half-day threshold, schedule default or break input/deduction; completed valid Time = Present, manual Tap Half day, no auto OT/late/early. Separate manager Sunday dates/count in app/ledger/PDF/4-sheet Excel, actual arrival date + open check-ins + two-shift dedup. PDF uses summary cards, Sunday section, six readable columns, full-date/12-hour captions and atomic totals/signatures. Original records/audit/legacy metadata and backups retained; old Attendance totals now show full actual hours. Salary/canteen/blank PDF labels unchanged. **756 automated checks** (406 canteen + 29 loader + 26 PDF + 99 cloud + 196 Attendance) + **54 native Chromium checks**; independent PDF/XLSX QA. [Guide](ATTENDANCE.md). | `Hisaab-Pro-v3.21.html` |
| v3.20 | 2026-11-14 | **Attendance Time mode ab easy 12-hour.** 1–12 clock + Same day morning / Same day night / Next day morning / Next day night; mobile/Hindi numeric entry, overnight presets, actual-date timeline, visible noon/midnight reminder, live hours/OT/late/early preview, compact expandable help and scrollable form with visible Save/Close. Shift rules, board, ledger/history and individual PDF/Excel use the same readable format. Existing canonical saved times/day flags/snapshots and cloud schema unchanged; no record migration or salary/canteen changes; v3.18 blank summary labels retained. **730 checks:** 406 canteen + 29 loader + 26 PDF + 99 cloud + 170 Attendance; optional real Chromium **45 checks**. [Use guide](ATTENDANCE.md). | `Hisaab-Pro-v3.20.html` |
| v3.19 | 2026-11-14 | **Manager Attendance existing panel me integrated.** Dynamic profiles; Day/Night; one-tap Present/Absent/Half/Leave/Week off/Holiday; 24-hour Time mode + overnight check-in/out, breaks, saved rule snapshots, hours/OT/late/early. Daily board, calendar, weekly/monthly/custom ledger, search/filter/sort, bulk skip/explicit overwrite, duplicate prevention, history + dashboard. Real individual custom-range PDF (Hindi shaping) + 3-sheet Excel, persistent ready-file download links. Existing auto-save/JSON/safety copies/account-scoped conditional cloud merge includes Attendance; salary calculations and v3.18 blank canteen summary labels unchanged. **696 checks:** 406 canteen + 29 loader + 26 PDF + 99 cloud + 136 Attendance; optional real Chromium **27 checks**. [Use guide](ATTENDANCE.md). | `Hisaab-Pro-v3.19.html` |
| v3.18 | 2026-11-14 | **Sirf PDF summary labels blank.** Screenshot wale Bikri / income aur Kharcha labels din + mahina summary me khaali; amounts (₹0.00 bhi), dashed rows, spacing, totals, fonts aur baaki format unchanged. Print/save-as-PDF aur WhatsApp attachment same. App entries, table columns aur v3.17 cloud safety unchanged. Tests: 406 canteen + 29 loader + 26 PDF + 76 cloud = **537**. | `Hisaab-Pro-v3.18.html` |
| v3.17 | 2026-11-14 | **Cross-device data-loss fix.** Canteen-only / salary / settings data ko populated maana jata hai; fresh demo/empty login se cloud overwrite nahi. Durable offline working/base + account/project isolation; three-way merge; conditional update/unique insert (no upsert), races par retry. Financial/edit-v-delete/dependent salary conflicts par explicit values + choice, failed saves par honest status/retry banner. Suspicious legacy missing data protected; last 3 local safety copies + JSON/missing-data recovery. Loader API fail par cached old build se pehle known latest fix. Existing key, salary/canteen, Segoe PDF, 6 templates aur WhatsApp safe. **533 checks:** 406 canteen + 29 loader + 22 PDF + 76 cloud. [Guide](CLOUD-SYNC.md). | `Hisaab-Pro-v3.17.html` |
| v3.16 | 2026-11-14 | **Reference PDF re-analysis: asli Segoe UI Regular/Bold/Black embedded**, offline bhi same fonts, asli ₹ / minus, real glyph widths + ToUnicode. Bottom screenshot jaisa: white/light-grey net row (dark band nahi), rounded dashed amount-in-words box, 52px writing gap, Prepared by / owner lines, phir flowing note + version. Poora closing ek page par; continuation table top se restart; saare items/parties include. 6 templates, WhatsApp aur saved data safe. Tests: 406 canteen + 25 loader + 22 PDF. | `Hisaab-Pro-v3.16.html` |
| v3.15 | 2026-11-16 | **Entries clean + alignment.** Din ki entries table me products list khatam (sirf item-wise summary me); Amount/Paid/Baki columns chauri — koi overlap nahi; page-2 par net band/in-words/signature footer se kabhi nahi takrate (auto page-break); header me em-dash print jaisa. | `Hisaab-Pro-v3.15.html` |
| v3.14 | 2026-11-16 | **PDF = print CSS exact mirror.** Tables full-grid (har cell border + grey header fill #f3f4f6) jaisa print me; meta rows dashed underline; section titles solid underline; Amount-in-words dashed box; signature do boxes (top border); footer me version + page; fontsizes print px→pt exact. Default template print-exact; 5 templates colour tint. | `Hisaab-Pro-v3.14.html` |
| v3.13 | 2026-11-16 | **PDF = print same-to-same (din + mahina).** User ki bheji PDF jaisa exact: din wali PDF me Date/Din/Entries + Saman/Bikri/Kharcha meta, ENTRIES table (Type/Party/Bill/Mode/Saman/Amount/Paid/Baki), SAMAN ITEM-WISE (RATE KE SAATH) + Item-wise total row, lump-sum note, DIN KA NET dark band, Prepared by signature; mahine me PARTY / SUPPLIER-WISE (Total/Paid/Baki), MAHINE KA NET band, Amount in words. Templates + WhatsApp same. | `Hisaab-Pro-v3.13.html` |
| v3.12 | 2026-11-16 | **Print-ledger PDF format (user ki pasand wali photo jaisa).** Header: shop name + address left, CANTEEN MONTHLY/DAY LEDGER + month + generated right; 2-column summary (saman/bikri/kharcha \| entries/paid/baki); DIN-WISE LEDGER table + bold 'Mahine ka total' row andar; ITEM-WISE SUMMARY (rate wali entries); PARTY-WISE SUMMARY. 🎨 6 templates barkarar (accent/boxed/plain) aur 📤 WhatsApp par bhi yahi PDF format. | `Hisaab-Pro-v3.12.html` |
| v3.11 | 2026-11-16 | **PDF alignment pro.** Sab PDF tables ab poori page-chaurai par exact align (mahine ki 8-column table ka 20pt right-gap khatam); row rhythm symmetric (text ke upar/neeche barabari space, hairlines exact boundary par); invoice-box ka bottom kinara aakhri row-line par exact; uniform 6pt column padding; totals hairlines centred; section titles table-text ke saath aligned. | `Hisaab-Pro-v3.11.html` |
| v3.10 | 2026-11-16 | **Clean PDF + naam HISAAB.** PDF design naya: hairline tables (box/zebra clutter khatam), totals invoice-summary style right side me + NET highlight band, header accent bar. **Σ/? jaisa koi unwanted symbol PDF me nahi** — "(Σ line-total)" marker hata aur WinAnsi-me-na-hone-wale characters drop. Picker cards me har template ka **mini visual preview**. Panel ka naam ab sirf **HISAAB**. | `Hisaab-Pro-v3.10.html` |
| v3.9 | 2026-11-15 | **🎨 PDF templates (6 design).** Canteen PDF ab apni pasand ke design me: **Neela Classic**, **Hara Bahi-Khata**, **Dark Premium** (kaala band + golden tag), **Kesariya Dukaan**, **Laal Bill** (invoice style — boxed tables, beech ka header, right-side totals) aur **Simple S&W** (bina rang — syahi bachao). Toolbar me **🎨 PDF style** button — picker me card chuno, ✓ lag jata hai, pasand save rehti hai; 📄 PDF aur 📤 WhatsApp PDF dono usi template me banti hain. | `Hisaab-Pro-v3.9.html` |
| v3.8 | 2026-11-15 | **PDF pro theme + WhatsApp PDF.** Canteen PDF ab branded design me: upar shop-name ka colour band, title + generated time, tables me **zebra stripes + colour header**, totals **colour cards** (saman/bikri/kharcha/net/paid/baki), har page ke neeche **footer + Page x of y**, page break par header repeat. Aur naya **📤 WhatsApp PDF** button (din + mahina): mobile par **Web Share API se PDF seedha WhatsApp par** chali jaati hai (file attach); desktop par PDF download + WhatsApp khul jaata hai (📎 se attach). | `Hisaab-Pro-v3.8.html` |
| v3.7 | 2026-11-14 | **Accuracy Pro.** ① OCR se pehle photo **auto-enhance** (grayscale + contrast stretch + upscale) aur baad me **confidence %** — kam ho to saaf warning “preview check karo”; OCR text me `O→0`, `l→1` jaise confusion apne aap thik. ② Paste parser: **Devanagari digits** (४→4), sr-no `1.` / bullets, line ke saath judi date (`14/11/2026 Maggi 4 kg 360`), **sirf-qty lines skip** (galat entry nahi banti), `rupees` ignore. ③ **Rate-list cross-check**: parse hua per-unit rate list se 35%+ alag ho to row par **⚠ list ₹X** button — ek click me sahi rate + amount. Duplicate item lines par info-chip. ④ Naye: **🕘 item kharid history** (rate list se), **✆ WhatsApp mahina** (din-wise + item-wise summary), dashboard canteen card par **📋 Paste / 📄 PDF** quick buttons. Purana data safe. | `Hisaab-Pro-v3.7.html` |
| v3.6 | 2026-11-14 | **Photo OCR + paste accuracy.** ① Bill photo par **🔍 OCR se entries** — photo ka text browser me hi padha jata hai (tesseract.js CDN se, offline ho to saaf toast), text seedha bulk modal me aakar **entries** banta hai; photo bhi entries ke saath judi rehti hai. ② Paste parser **scoring** wala: item-code (`101 Maggi 4 360`), `qty rate total`, `90/kg`, `42 per kg`, `(4)`, `nos`, `1,740/-`, naam me number (`Maggi 2-minute`) — sab sahi parse. ③ **Total line verify**: paste me `Total 476` likha ho to preview me ✅/⚠ chip batata hai hisaab mila ya nahi; `Paid`/`Baki` lines info me jaati hain, entry nahi banti. ④ **Preview table editable** — OCR/paste ka koi bhi cell (item, qty, unit, mode, price) save se pehle yahin sudhar lo; mode badalne par number carry hota hai. | `Hisaab-Pro-v3.6.html` |
| v3.5 | 2026-11-14 | **📋 Paste se entries (bulk).** Word / WhatsApp / parche se poora text ek saath paste karo — **har item ki alag-alag entry** ban jati hai (chaaho to toggle se “sab lines = ek entry”). Line format: `naam qty unit price` (aakhri number = poori line ka total), `@ 42` ya `4x90` = per-unit rate, `1,740` jaise comma chalega, date wali line (`14/11/2026`) = uske baad ki entries us date par. Save se pehle **preview table** (kitni lines, kitna total, kaun si line skip hui), save ke baad **undo**. Rate list bhi apne aap update. Purana data untouched. | `Hisaab-Pro-v3.5.html` |
| v3.4 | 2026-11-14 | **Canteen photo + PDF + unit auto.** ① Entry ke saath **bill/parche ki 📷 photo** lagao (camera ya gallery) — photo compress ho kar entry ke saath save hoti hai, din ke ledger aur entries table me 📷 tag, tap karke badi khulti hai; photo me rate na ho to “Σ Ek saath pura total” me sirf amount likh do. ② **📄 PDF** button — din ka ledger aur mahine ka ledger seedha PDF file (party-wise + item-wise tables ke saath). ③ **Unit auto**: item ka naam likhte hi unit apne aap (doodh→ltr, kesar/dhaniya→gram, anda→dozen, biscuit→pkt, aata/sabzi→kg); rate list me rate ho to wahi priority; khud unit chuno to auto-guess band. **Purana data bilkul safe** — photo field nayi entries me optional hai, purani entries jaisi thi waisi. | `Hisaab-Pro-v3.4.html` |
| v3.3 | 2026-11-14 | **Gram / poori-line smart default.** Nayi item line ab seedha **`₹ poori line`** par khulti hai — parche wala total (jaise **600 gram = ₹45**) bas likh do, total ₹45 hi judega (**27,000 nahi**), per-unit rate **₹0.075/gram** apne aap niklega. Item ka rate Rate list me maujood ho to naam likhte hi line apne aap **`₹ / unit`** par palat kar rate + unit bhar leti hai. ₹1 se chhote rate ab 4 decimal tak safe (0.075 → 0.08 nahi tootta). Purani entries aur per-unit flow bilkul unchanged. | `Hisaab-Pro-v3.3.html` |
| v3.2 | 2026-11-14 | **Canteen rate fix — "poori line ka total" mode.** Har item line par ab select hai: **`₹ / unit`** (default, pehle jaisa) ya **`₹ poori line`**. `4 kg Maggi = ₹360` likhne par ab total **₹360** hi judta hai (pehle galat 4 × 360 = ₹1440 ho jata tha) aur per-unit rate **₹90/kg apne aap** nikal kar amount ke neeche dikhta hai. Rate list, auto-fill, din/mahine ke ledger aur CSV — sab jagah **per-unit rate** hi rehta hai. Purani saved entries ka hisaab **bilkul nahi badla**. CSV me naya `Price mode` column. | `Hisaab-Pro-v3.2.html` |
| v3.1 | 2026-11-14 | **Naya Canteen module** — saman entry (rate-wise **ya** ek-saath pura total), bikri/kharcha, **din ka ledger**, **mahine ka ledger**, rate list, udhaar/baki, poori activity log, CSV + print + WhatsApp. Dashboard par canteen card, Settings me canteen card. **Loader `index.html` wapas add hua** (root URL ka 404 fix). | `Hisaab-Pro-v3.1.html` + `index.html` |
| v3.0 | — | v3 UI, dark mode, ledger (advances), worker profile drawer, CSV & WhatsApp share, cloud login/sync | `hisaab_v3.html` |
| v2.0 | 2026-11-11 | Auto-update loader + fixed working hours/overtime removed. Hourly worker = rate × total hours (naya Hours column). Monthly = ÷30 fixed, Sunday auto-exclude. Version badge. | `Hisaab-Pro-v2.0.html` |

> **File ka rule:** `hisaab_v3.html` = working/source file (yahan change hota hai).
> `Hisaab-Pro-v3.40.html` = usi ka release copy, taaki upar wala loader apne aap sabse naya version utha le.
> Dono ka content abhi **bilkul same** hai. Purane `Hisaab-Pro-v3.1.html` / `v2.0` repo me pade rehne do.

---

# Stock Management (v3.40) — kaise use karein

**Combo / message → Agla: combo dekho → shared party/tags/actual roles choose → review →
Haan, 1 combo save karo.** Saare products ek History combo mein; **Is combo ka PDF**,
**Edit combo / Delete combo**. Current stock ya filtered
History ke liye **↓ Stock PDF**. Sirf preview/photo/Cancel se stock nahi badalta.

Old panel se lana ho: **Stock Management → Import stock** → file → true opening date
→ complete preview + review → **Import new products**. Existing stock overwrite nahi
hota; opening file ko Settings Restore me mat daalein.

Manual product ke liye **Add product**. Opening quantity dated Stock In
me aati hai; aage **Stock In / Stock Out / Stock Sale** se availability auto-update.
Products & Live Stock, Stock History aur Change Audit; minimum warning, combined
filters, photos, edit/delete aur backup/sync details: **[poora guide](STOCK-MANAGEMENT.md)**.
Koi manual available adjustment, price/invoice ya salary/Canteen financial write nahi.

---

# Manager Attendance (v3.33) — kaise use karein

Sidebar → **Attendance** → **Add manager** → Tap/Time mode. Koi fixed hours ya
break deduction ya 24-hour cap nahi. Morning/Afternoon/Evening/Night shifts + legacy Day,
aur **dono Check-in/Check-out clocks me Same/Next day ke saath chaaron periods**.
**Sundays** me actual attended dates aur count. Calendar, ledger, bulk,
compact 1–2-page PDF/5-sheet Excel (summary upar, photo-style register neeche), auto-save aur limits: **[poora guide](ATTENDANCE.md)**.
Attendance salary calculations ko nahi badalta.

---

# 🍽 Canteen module (v3.1+, price-mode fix v3.2) — kaise use karein

Sidebar me **Canteen** dabao (ya keyboard par `g` phir `c`).

## v3.30 — PDF se Bikri / Kharcha hata diye

- **Canteen → din / mahina → PDF** ya **WhatsApp PDF**: saare six templates me same removal. **Print / Save as PDF** me bhi.
- Monthly ledger: **Date, Din, Entries, Saman, Net, Paid, Baki**. Header, har daily row aur total se matching category cells removed; bachi columns ko poori width di gayi hai.
- Purchase summary rakhi hai; unlabeled sale/expense values aur unki underline rows bhi removed. Net closing ab sirf **Din ka net / Mahine ka net**; amount, words aur signatures same.
- Nonzero sale/expense entries **delete nahi hoti**; saved financial math aur Net / Paid / Baki unchanged. Day entries ki original Sale / Expense records, supplier/item detail aur customer-entered names/notes intentionally retained. App screen aur CSV full data ke saath pehle jaise.
- Logo ek baar wala hi reuse hota hai; item occurrences ab bhi separate. Purani downloaded PDFs edit nahi hoti—**Panel v3.30 me naya PDF download/share** karein, entries/previous logo dobara add na karein.

## v3.29 — apna company logo sirf ek baar

Settings → **Company logo → Upload logo** → PNG/JPG/WebP (maximum 5 MB) chunein.
“Logo saved” ke baad har naye PDF par automatic; change/remove bhi isi card me.
JSON backup/restore aur configured same-account cloud me logo included. Purana
financial/Attendance data safe; old PDF ko dobara download karein. Image handling,
report coverage, offline/cross-device limits aur instructions: [Company logo](COMPANY-LOGO.md).

## v3.28 — same item do baar? Dono lines report me alag

- `500 gram Hara dhaniya` + `500 gram Hara dhaniya` → **do alag 500 gram rows**, kabhi ek 1000 gram row nahi. Dono ka amount apni line par; grand total dono ko jodta hai.
- Same entry ke andar bhi ek jaise items separate rehte hain. Different rates, dates, units, suppliers ya purchase/sale/expense lines ko ek average row me nahi milaya jata.
- Day/month PDF aur Print me **poori detail** hai. Line ke neeche/saath date, type, party aur bill ka reference; `#2.1` = is report ki date/save-order wali doosri entry ki pehli item line. Ye sirf report-local reference hai, saved ID/schema nahi badla.
- Monthly screen pe pehli 14 item lines ka preview; zyada hon to count + PDF/Print ka hint. Monthly WhatsApp **text** pe pehli six lines + remaining count; full detail **WhatsApp PDF**/download/Print me.
- **Rate list / rate history** ka total quantity/amount aur average rate ab bhi cumulative hai; woh catalog analytics hai, original-line report nahi.
- **Purani entries dobara add na karein.** Same site/browser me Panel v3.28 kholkar naya PDF download karein. Existing PDF file apne aap nahi badalti. Grand totals, saved entries, backups, CSV aur cloud ke liye koi migration nahi.

## 1. Entry add karna — do tarah se

**＋ Entry add karo** dabao. Ek hi modal me teen type:

| Type | Kya | Ledger me |
|---|---|---|
| ⬇ **Saman aaya** | canteen me aaya saaman (purchase) | − (minus) |
| ⬆ **Bikri / income** | chai-nashta-khana jo becha | + (plus) |
| ↯ **Kharcha** | gas, bijli, mazdoori, misc | − (minus) |

Saman ka hisaab likhne ke **do mode** hain:

1. **₹ Item-wise rate** — har item ka `naam · qty · unit · price`. Total apne aap banta hai.
   *Item ka naam likhte hi Rate list se rate aur unit apne aap bhar jata hai.*
2. **Σ Ek saath pura total** — single-single item ka price **nahi** likhna, to bill/parche ka
   **ek saath pura total** daal do. Rate column band rehta hai; chaaho to sirf naam-qty
   yaad rakhne ke liye likh sakte ho. Dono mode ledger me barabar judte hain.

### v3.2 — price kis cheez ka hai? (har line par select)

Item-wise mode me har line ke price box ke saath ek chhota select hai:

| Select | Matlab | Amount | Rate list / ledger me |
|---|---|---|---|
| **`₹ / kg`** | price = **1 unit ka daam** | `qty × price` | wahi price |
| **`₹ poori line`** (nayi line ka **default**) | price = **poori line ka total** (jaise parche par likha `4 kg Maggi = ₹360`, `600 gram = ₹45`) | **₹360 / ₹45 hi** (qty se multiply nahi hota) | `360 ÷ 4 = ₹90/kg`, `45 ÷ 600 = ₹0.075/gram` apne aap |

> **Smart default (v3.3):** nayi khaali line `₹ poori line` par khulti hai — parche wala total seedha likho.
> Jis item ka rate Rate list me pahle se hai, uska **naam likhte hi** line apne aap `₹ / unit` par palat
> jaati hai aur rate + unit bhar jata hai (kyunki tab per-unit hisaab sahi rehta hai).
> Mode kabhi bhi select se badlo — likha hua number saath chala jata hai.

- Line mode me amount ke neeche chhota **`= ₹90/kg`** dikhta hai, aur item-wise table/summary me
  us line ke naam ke aage **Σ** chip lagta hai.
- Mode badalne par likha hua number **saath chalta hai**: `₹ / kg` → `₹ poori line` karne par
  `qty × rate` line total ban jata hai; wapas `₹ / kg` karne par line total ÷ qty = rate.
- **Purani entries safe** — jinme `priceMode` nahi tha wo `₹ / unit` maani jati hain, hisaab wahi purana.
- CSV me item rows par naya **`Price mode`** column hai (`Per unit (1 kg)` / `Poori line ka total`)
  aur `Rate (per unit)` column me hamesha per-unit rate hi jata hai.

Payment section me: kitna diya, kaise diya (Cash / UPI / Bank / Udhaar), aur **baki** apne aap.
`✔ Poora paid` aur `📒 Poora udhaar` quick buttons bhi hain.

## 2. Paanch tab

| Tab | Kya milega |
|---|---|
| **📅 Din ka ledger** | koi bhi din chuno (‹ › / Aaj / date picker) — us din ki saari entries, saman item-wise rate ke saath, din ka net, paid aur baki. Print + WhatsApp. |
| **🗓 Mahine ka ledger** | din-wise table (Date · Din · Saman · Bikri · Kharcha · Net · Paid · Baki) + mahine ka total, 6 mahine ka trend chart, paisa-kahan-gaya donut, item-wise aur party-wise summary, sab-time ka udhaar. Kisi din par tap = us din ka ledger. |
| **🧾 Sab entries** | poori list — search (party/item/bill), type filter, is mahine / sab time / custom date range. Edit, duplicate, delete, paid likho. |
| **🏷 Rate list** | har item ka default rate + aakhri kharida rate + ab tak ki qty/amount. Rate-wise entry save karte hi list **apne aap** banti/tazaa hoti hai. |
| **🕘 Activity** | har add / edit / delete / payment / rate change — time ke saath, din-wise grouped. Delete ki hui entry yahan se **↺ Restore** kar sakte ho. |

## 3. 📋 Paste / 🔍 OCR se entries (v3.5 + v3.6)

Canteen toolbar me **📋 Paste se entries** dabao:

Canteen ke toolbar me **📋 Paste se entries** dabao:

1. Word/WhatsApp/notes se lines copy karke box me paste karo — **ek line = ek item**:
   - `Maggi 4 kg 360` → poori line ka total ₹360 (rate ₹90/kg apne aap)
   - `Aata 20 kg @ 42` ya `Maggi 4x90` → per-unit rate
   - `Doodh 30 ltr 1,740` → comma wale number chalega
   - `Maggi 360` → qty 1, line total
   - `14/11/2026` → is line ke baad jo likhoge wo us date ki entry banegi
2. **Preview** me dekho: item, qty, unit, mode, amount, date — galat lines skip list me.
3. Default: **har line = alag entry** (jaise tumne kaha); toggle se “sab lines = ek entry” bhi kar sakte ho.
4. **✅ Save** → entries aa gayi; galti ho to toast wala **undo** sab wapas hata deta hai.

### v3.6 — accuracy features

- **📷 Photo se text (OCR)**: bulk modal me button — bill photo lo, text apne aap box me aa jayega
  (progress % dikhta hai). Entry modal me photo lagi ho to **🔍 OCR se entries** button bhi hai.
  OCR ke liye internet chahiye (engine browser me download hota hai); na ho to text paste ka raasta khula hai.
- **Total verify**: paste me `Total 476` / `Grand Total …` likha ho to preview me chip:
  **✅ hisaab mila** ya **⚠ alag** — save toast me bhi yahi batata hai.
- **Paid / Baki lines** entry nahi banti — chip me yaad dilata hai ki ₹ button se laga lena.
- **Preview editable**: har row me item/qty/unit/mode/price ke box — galat OCR/paste cell yahin sudharo,
  amount aur total turant update. Mode badalne par likha number carry hota hai (360 line → 90/kg unit).
- Parser ab ye sab samajhta hai: `101 Maggi 4 360` (code ignore), `Maggi 4 90 360` (qty-rate-total),
  `90/kg`, `42 per kg`, `Maggi (4) 360`, `Bread 10 nos 180`, `1,740/-`, `Maggi 2-minute 4 pkt 360`,
  `qty: 4 …` labels, `₹` sign, comma, ulta order.

## 4. 📷 Bill photo + 📄 PDF (v3.4)

- **Entry modal me sabse upar “Bill / parche ki photo lagao”** — camera (phone par seedha camera khulta hai)
  ya gallery se photo chuno. Photo chhoti karke save hoti hai (storage nahi bharega).
- Photo judi ho to thumbnail dikhta hai — **👀 Badi dekho** se poori photo, **🗑 Photo hatao** se hat jaati hai.
- Save ke baad **din ke ledger** aur **sab entries** me party ke naam ke aage **📷 photo** tag — tap = badi photo.
- **Photo me single item ke rate na ho?** Koi baat nahi — “Σ Ek saath pura total” chuno aur sirf amount likh do
  (“kitne ka saman aaya”). Photo saboot ke liye judi rahegi.
- **📄 PDF din / 📄 PDF mahina** button (ledger ke upar toolbar me): A4 PDF file download hoti hai —
  entries table, totals (saman/bikri/kharcha/net/paid/baki), item-wise aur party-wise summary.
- **Unit auto:** naya item likhte hi unit apne aap chun jaati hai — `doodh/pani/tel` → ltr,
  `kesar/dhaniya/adrak/masala` → gram, `anda` → dozen, `biscuit/namkeen` → pkt, `bread/cup/cylinder` → pcs,
  `aata/chawal/dal/sabzi/maggi` → kg. Rate list me rate pahle se ho to rate-list wali unit + rate aata hai.
  Unit khud badloge to app dobara andaza nahi lagata.

## 5. Udhaar / baki

Har entry par `total − paid = baki`. Baki wali entries par **₹ Paid likho** button —
kitna aur diya wo daalo, baki apne aap ghat jayega. Sidebar me Canteen ke aage
red badge = is mahine kitni entries ka paisa baki hai.

## 6. Data

- Sab kuch **usi browser** me save hota hai (`localStorage`) — workers/records ke saath.
- Cloud login on ho to canteen data bhi sync hota hai.
- **⤓ Canteen CSV** — item-level rows (Date, Day, Type, Party, Bill, Mode, Item, Qty, Unit, **Price mode**, Rate (per unit), Item amount, Entry total, Paid, Balance, Pay mode, Note) + totals.
- **🖨 Print din / Print mahina** — A4 ledger, shop details ke saath.
- Settings → **🗑 Sirf canteen data erase** (workers/salary safe, undo milta hai).
- Purana backup (jis me canteen key nahi) restore karne par canteen apne aap khaali ban jata hai — kuch tootta nahi.

## 7. Developer tests

`tests/` folder me **961 offline checks** (canteen/salary, repeated item lines, loader,
PDF, cloud, Attendance aur Employee) + optional **201 real Chromium checks** hain. App ke liye test dependencies
zaroori nahi. Commands, fixtures aur QA limits: [`tests/README.md`](tests/README.md).
