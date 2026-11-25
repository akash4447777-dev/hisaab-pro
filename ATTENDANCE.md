# HISAAB v3.32 — manager Attendance

**Attendance is a tab inside the existing Hisaab Panel**, not a separate app.
Manager profiles, attendance, credit settings and history share the panel’s
existing local save, JSON backup and configured cloud sync. **Attendance never
changes employee salaries, wages, advances, deductions or payments.**

**v3.32:** separate **Stock Management** tab: transaction-derived availability,
photos, In / Out / Sales, minimum warnings and complete audited history. Optional
Stock payload existing JSON/cloud/recovery me included. Attendance clocks/day flags,
actual hours/Sunday/bonus calculations, two-page PDF, five-sheet Excel and financial
records unchanged. [Stock guide](STOCK-MANAGEMENT.md).

**v3.31:** saved Canteen parties aur From / To Date × Party PDFs added. Sirf selected
matching Canteen data report hota hai; optional catalog existing backup/cloud/recovery
me included. No Attendance record, clock/day flag, hours/Sunday/bonus, PDF/Excel or
salary change. [Canteen guide](CANTEEN-REPORTS.md). Existing names/entries/logo re-enter
ya storage clear na karein.

**v3.30:** sirf Canteen PDF/print ke Bikri / Kharcha columns/summary slots removed.
Attendance clocks, actual hours, Sundays, bonus, two-page PDF, saved company logo
and five-sheet Excel are unchanged. Existing records are never re-entered or migrated.

## v3.29 — saved company logo in every Attendance PDF

Settings → **Company logo** me PNG/JPG/WebP ek baar upload/save karein. Individual,
monthly, custom-range aur WhatsApp PDF ke har page par automatic proportional
logo; changed business/address and continuation name/date headers reserve its
slot. Hindi shaped-text/ActualText images coexist in the same valid PDF resources.
No fixed schedules, clock reinterpretation, changed hours/credit/Sunday/bonus,
payroll join, history migration or Excel image/layout change. The complete-details
**maximum two-page** guard remains; oversized ranges still offer full Excel or a
shorter PDF selection. JSON backup/restore and configured same-account cloud also
include the logo. See [Company logo instructions and limits](COMPANY-LOGO.md).

## v3.28 — Canteen item-report correction; Attendance unchanged

Daily/monthly Canteen item reports retain every original saved line instead of
merging matching item names/units. No Attendance function, clock choice, Sunday
or bonus rule, export layout, salary calculation, storage/history or cloud schema
changes. The v3.26 full-summary/photo-style five-sheet Excel and readable maximum-
two-page Attendance PDF are retained. No migration/re-entry or storage clearing.

## v3.27 — Employee naming throughout the panel

The salary module now consistently says **Employee / Employees** in navigation,
headings, forms, search/help, confirmations, messages, CSV, salary PDF/print and
sharing. This is **wording only**. Existing profile IDs, salary links, rates,
advances, records, canteen, Attendance data/history and custom names/notes are
unchanged. Technical `workers` / `workerId` keys and routes stay compatible with
old JSON backups and cloud payloads; there is no migration or re-entry required.
Manager Attendance remains separate. The v3.26 Excel format, clock choices,
actual-hour/Sunday rules, monthly bonus and Attendance PDF remain unchanged.

## v3.26 — Excel summary above the photo-style date register

**Only Excel presentation changes.** The existing panel stylesheet, entry clocks,
Attendance PDF design, bonus arithmetic, storage/cloud schema and all original
salary/canteen/Attendance records and history stay unchanged. The photo is a
**format reference**, not data to import or a new advance/payroll policy.

The **Attendance register** opens first, with all requested information **above**
the lower date table:

- **Total present days** — distinct selected **Attendance dates** with a completed
  Time entry or a Tap Present mark; five shifts on one date still count as one
  present day. **Present shifts** is shown separately, not mislabeled as days.
- Leave, absent, half-day, holiday and week-off **distinct dates**, with the saved
  **mark counts** beside their labels. Different statuses across shifts on one
  date can overlap; do not add these categories as mutually exclusive payroll days.
- Actual arrival-date count, **Sundays actually attended and every attended Sunday
  date**, actual working hours, credits, open/saved shifts, unmarked/outside-employment
  dates, calendar days and Tap/Time counts. Open / Half day can be actual visits
  without being a full Present day. Sunday and arrival rules have not changed.
- **Extra bonus** — a separate row per calendar month, full-month/all-shift
  qualifying OUT count, genuine numeric Excel **percentage** and OUTs remaining
  for the next +1%. Partial/shift-filtered exports retain the existing full-month
  bonus basis, explicitly labeled; rates across months are never added together.

**Below the summary**, the photo-style black-grid register has white rows,
yellow calendar Sundays, a header and a totals row:

| Date | Manager name / Attendance | Check-in time | Check-out time | Advance | Shift | Actual hours | Credit | Notes / remarks |
|---|---|---|---|---|---|---|---|---|

The reference's time columns show the **actual check-in / check-out**, including
Morning / Afternoon / Evening / Night and explicit Same day / Next day captions;
there is no forced morning arrival or night departure. Every selected date/shift
and full note remains; multiple saved shifts on one date remain separate rows.

**Advance is intentionally blank**, including its total: it is optional manual
space in the exported file. Attendance has no linked manager advance field, so
no salary-employee match by name, guessed zero/amount or salary/payment update is
introduced. Editing the downloaded workbook does **not** write back into the app.

The original **Summary, Daily attendance, Change history and Sundays attended**
sheets remain unchanged: **five sheets**, with their IDs/detail columns and
original numeric Summary total cells retained. Real dates, numeric `[h]:mm`
elapsed times, literal notes and numeric credits/percentages are preserved.
Only the first three identity rows and first two date/status columns are frozen
and identity rows repeat for printing; a long Sunday/monthly summary cannot
freeze the whole register out of view. Filters start at the actual table header,
not at the top summary. Large Excel selections remain complete, even where the
unchanged two-page PDF guard honestly refuses an oversized selection.

## v3.25 — four periods in both Check-in / Check-out dropdowns

The screenshot correction is in **both clock dropdowns**, not just the separate
Shift selector. Each now has **eight options**: Same day / Next day × **Morning,
Afternoon, Evening, Night**. The existing form, panel layout and stylesheet stay
unchanged; Tap mode and the separate shift choices remain available.

| Clock period | Display/entry meaning |
|---|---|
| Morning | 5:00 AM–11:59 AM |
| Afternoon | 12:00 noon–4:59 PM |
| Evening | 5:00 PM–8:59 PM |
| Night | 9:00 PM–4:59 AM; 12 night = midnight |

These are **clock-label boundaries, not workplace schedules or fixed hours**.
**12 afternoon = noon; 12 night = midnight.** Night 9–11 is before midnight,
Night 1–4 is after midnight. **Night never automatically advances the date**:
choose Same day / Next day explicitly. Incompatible clock/period combinations
show a clear error, not a guessed time or date.

Saved canonical `HH:MM`, both day flags, IDs, notes, history, salary and canteen
data are **not rewritten**. Only the old human-readable labels change: stored
`13:33` now opens as **1:33 afternoon**, while `01:33` is **1:33 night**. Thus
10:32 morning → next-day 13:33 still means **27h 01m**, while next-day 01:33
means **15h 01m**. Opening an old record does not change either span.

Shift/profile changes suggest periods only for blank fields, never reinterpret
an already typed clock. Board, ledger/history, PDF and Excel use the same four
period labels. The reference PDF design/two-page guard, Sunday rules, monthly
bonus and WhatsApp file-sharing behavior from v3.24 are retained. No storage,
cloud-schema, duration-arithmetic or financial migration is introduced. Update
all devices/tabs to **v3.25** for consistent clock labels; do not clear storage.

## v3.24 — reference ledger PDF, four shifts, automatic bonus and WhatsApp

**The existing panel layout and stylesheet are unchanged.** This update adds
shift choices and a WhatsApp PDF action to existing controls, and replaces only
the Attendance PDF design with the supplied reference's ledger style: split shop /
report header, ruled summary pairs, light bordered table, full remarks, clear total,
outlined bonus explanation and verification lines. The reference is **design only**;
no canteen amounts, employee values or accounting rules are imported from it.

- **Morning, Afternoon, Evening and Night** are distinct shift choices throughout
  profiles, forms, bulk marking, filters, calendar, ledger, Sundays and reports.
  **Day (existing)** remains available. Existing `day` / `night` values are never
  renamed, combined or migrated. There can be one record per manager/date/shift.
- The PDF still includes every selected row and remark within **1 or maximum 2
  readable pages**; overlarge selections get a shorter-range/full-Excel message,
  never a partial report. A 31-day single-shift month fits one page; a two-shift
  month or a month of full remarks can use two.
- Automatic late-OUT **count and extra percentage** appear in the PDF, including
  a monthly breakdown and the next threshold. Excel Summary includes genuine
  numeric count/percentage/remaining cells without moving the old total cells.
- **WhatsApp PDF** prepares the selected individual's real PDF file. Where file
  sharing is supported, choose WhatsApp and the recipient in the device share
  sheet. Otherwise download the PDF and attach it manually as a **Document**.
  A text-only WhatsApp link cannot attach a PDF or confirm delivery.
- Existing timings, day flags, entries, retained history and salary/canteen records
  are not rewritten. Bonus is derived from the same saved Attendance records,
  not stored as a salary/payment change. No schema migration or new table.

### Automatic extra bonus — exact rule and current defaults

| Qualifying completed OUTs in a calendar month | Extra bonus |
|---|---|
| 0–2 | 0% |
| 3–4 | 1% |
| 5–6 | 2% |
| 7–8 | 3% |
| Each further 2 | another +1% |

A valid, completed **Time-mode** OUT qualifies when it is **strictly after
11:45 PM on the actual arrival day**. Exactly 11:45 PM is excluded. An evening
arrival followed by an OUT at next-day midnight / morning qualifies. An arrival
itself at next-day 1 AM followed by 6 AM on that same arrival day does **not**
yet pass that day's 11:45 PM. Tap marks, open shifts and invalid spans do not count.
No break, target-hour or salary arithmetic is used for this test.

**Implementation defaults:** reset the count each calendar month; assign the
occasion to the record's saved **Attendance date**, not the checkout date; include
next-morning OUTs as described above. Count each saved completed OUT once, not
its edits/history. Two qualifying shift records on one date are two occasions.
The defaults were used pending a different workplace policy; no salary base was
provided, so the output is **percentage only**, not a fabricated rupee amount.

Bonus always uses the individual's **whole calendar month across all shifts**,
even if the exported dates or shift filter show only part of that month. The
summary distinguishes qualifying OUTs **in the selection** from the full-month
bonus box. For example, five qualifying OUTs in December still show **2%** in a
December 3 Evening-only report with one selected row. Multiple months have
separate rates; percentages are not added together. An asterisk beside a PDF OUT
marks a qualifying selected row. Intentional saved edits/deletions automatically
recalculate the derived count; merely opening/exporting/sharing does not save data.

**Update every device/tab to v3.24 before using the new shifts.** v3.23 and earlier
do not understand Morning/Afternoon/Evening keys and can refuse to load/sync them.
In the regression test v3.23 blocks saving rather than silently converting the
new raw storage into Day. Do not use old clients to edit the account. Take JSON
backups on surviving devices and keep the same browser/site; do not clear storage.

## v3.23 — compact PDF and a styled Excel register (export-only)

**No saved entries, canonical clocks/day flags, notes, IDs, policy snapshots,
history, salary/canteen data or calculations are rewritten.** No migration,
reset, import or new cloud table is required. Back up JSON before updating as usual.

- A compact **A4 portrait PDF, 1 page where practical and never more than 2**:
  quiet manager header, small totals strip, seven-column date-wise register,
  gold calendar-Sunday rows, separately dated Sunday visits, full notes and a
  single final totals/verification block. The body stays at least **8.5 pt**.
- A tested 31-day single-shift month fits **1 page**; 62 Day/Night entries fit
  **2 pages**. More notes can require the second page.
- **No silent truncation, missing rows/notes or microscopic third-page squeeze.**
  If all selected attendance details cannot fit two readable pages, PDF gives a
  clear **shorter date range / complete Excel** message and does not download
  a partial file. Large custom ranges remain available in full in Excel.
- Excel opens on the new **Attendance register**: merged manager headings,
  bordered date-wise rows, gold Sundays, status colours, full clock/context
  labels, wrapped notes, numeric elapsed time and credits, a totals row,
  frozen date columns/header bands, filters and landscape print setup.
- The original **Summary, Daily attendance, Change history and Sundays attended**
  sheets remain: **five sheets in total**, no invented advance/payroll column.
- **Report studio** shows live hours, visits, Sundays, open shifts, row count and
  actual PDF page/capacity preview. Changing a selection removes outdated
  ready-file links so a previous range is not accidentally downloaded.

## v3.22 — next-day checkout can exceed 24 hours

The old 24-hour span restriction is removed. The screenshot’s **6 November,
10:32 Same day morning → 7 November, 1:33 Next day night** now previews/saves
**27h 01m**, not an error or a clamped 24 hours. Here Night includes afternoon:
`1:33 night` was the old label for 13:33. **In v3.25 the same saved 13:33 is
1:33 afternoon**; 01:33 displays as 1:33 night. The original clocks/day flags and
27h 01m duration are unchanged.

Only a checkout **equal to or before** arrival is rejected. Keep the correct
same/next-day choices; the app does not silently guess another day or period.
The full duration is retained in reload/JSON/cloud/ledger/PDF/Excel. One completed
entry still earns **one credit/arrival**, not extra payroll days for crossing midnight.
Controls continue to cover the attendance date and following date; arbitrary
later checkout dates are not introduced by this update. **Update all devices to
v3.22 or later** before syncing long entries: clients older than v3.22 can reject spans over 24 hours.

## Retained v3.21 improvements

- **Working hours are not fixed at 8 or 12 hours.** Enter actual arrival and departure.
- **No Unpaid break minutes input and no break deduction**, including old records.
- No schedule/target presets, automatic overtime, lateness, early-exit or hour-based
  Half day. **Half day is a manual Tap mark.**
- A separate **Sundays** tab lists **which Sundays each manager attended**, with
  dates/counts. The individual ledger, PDF and Excel include these visits too.
- Dated Sunday visits, actual hours and manual credits are retained in the
  new compact PDF and styled workbook.

**Existing users: take a JSON backup first.** Original clocks, day offsets,
record IDs and history are not rewritten. Older break/target/schedule metadata
remains in JSON/history for compatibility and validation, **not arithmetic**.
Consequently, old timed entries now display their **full in → out hours** and
completed valid Time entries display Present, rather than the old target-based
classification. Previous printed totals can differ; keep previous reports if needed.
Use v3.30 on all devices/tabs for the latest Excel format and consistent clock labels; do not clear storage.

## Start here

1. Settings → **Backup (JSON)**. Open the latest panel and confirm **Panel v3.30**.
   See [safe device sync](CLOUD-SYNC.md).
2. Sidebar → **Attendance** → **Add manager**. Enter a name and unique code,
   choose **Morning / Afternoon / Evening / Night** (or **Day (existing)**),
   and optionally add role, phone, employment dates and notes.
   No real managers or sample attendance are preloaded.
3. Pick the date, manager and shift. Use **Tap mode** for a status, or **Time mode**
   for actual check-in/out. Saves immediately update the board, calendar and ledger.
4. **Attendance settings** contains only the manual credit switches:
   Leave = 1 credit (initially on), Holiday = 1 (on), Week off = 1 (off).
   These are configurable defaults, not an approved workplace/payroll policy.

## Tap mode

- **Present**, **Absent**, **Half day** and **Leave** are quick buttons on each
  manager’s daily card. **More / Edit** also offers **Week off** and **Holiday**.
- Present = 1 credit, Half day = 0.5, Absent = 0. Leave/Holiday/Week off use the
  record’s saved credit switches. Settings changes affect new records; an older
  record’s **Use current leave / holiday credit settings** checkbox explicitly
  updates only that record’s snapshot.
- Tap records attendance, **not invented times or working hours**.
- Repeating a mark is a no-op. Replacing a different mark asks first. Replacing
  Time with Tap clears its clocks; prior values remain in retained history/safety copies.

## Time mode — actual, variable hours

New records have **blank clocks**, not fixed shift timings. The chosen shift only
suggests periods for blank fields; verify each choice. Morning suggests same-day
morning / afternoon; Afternoon suggests afternoon / evening; Evening suggests
evening / night; Night suggests same-day night / next-day morning. Legacy Day
suggests morning / evening. No clock or fixed working duration is filled in,
and changing shift/profile does not change already typed clocks or their periods.

- Use a **1–12 clock**: `9`, `9:30`, `12:15`. Numeric entry supports `930` / `0930`
  → `9:30`, `9` → `9:00` on leaving the field, and Hindi digits such as `९३०`.
  A 24-hour input such as `21:30` is rejected, not silently converted.
- Each clock has **Same day morning / afternoon / evening / night** and
  **Next day morning / afternoon / evening / night** — eight choices in both
  Check-in and Check-out. These are separate from the Shift selector; Day
  remains a legacy shift, and actual clocks need not match a shift name.
- **Same day** means the selected **Attendance date**. **Next day** means the
  following date. The live timeline shows the actual two dates.
- Morning 5–11:59 AM; Afternoon 12–4:59 PM; Evening 5–8:59 PM; Night 9 PM–4:59 AM.
  **12 night = midnight; 12 afternoon = noon.** A reminder appears for 12 o’clock.
  Night does not change the chosen date. A clock outside the selected period
  gives an error; choose the correct period instead of guessing another day.
- A Night entry of `9:30` + **Same day night** → `7:30` + **Next day morning** is
  **10h 00m**, with no deduction. A `9` → `11:30` morning entry is **2h 30m**;
  it does not automatically become Half day, Short hours or Absent.
- A completed span must be **positive**. There is **no 24-hour cap**: a
  following-day checkout can be more than 24 hours after arrival. Correct the
  day/period if departure is equal to or before arrival.
- Leave check-out blank for an **open shift**. A valid check-in counts as a visit,
  but there are **zero completed hours/credits** until checkout is saved.
- **Check in now / Check out now** uses the device’s local clock. Night check-in
  before noon is grouped under the preceding attendance date with a next-day flag;
  the actual arrival date is still preserved for visit/Sunday counts. Use the
  editor for a different attendance-date grouping.
- The dialog body scrolls while its title, Close and Save controls remain visible.

```text
Actual working minutes = check-out − check-in (including explicit day offsets)
Completed valid Time record → Present, 1 credit
Open Time record            → Checked in, no completed hours or credit
Tap Half day                → manual 0.5 credit, no invented hours
```

There is no fixed daily target, break deduction or automatic OT/late/early
classification. Minutes use local wall-clock times, not timezone-tracked punch
hardware. **Credits are per saved shift, not payroll days:** multiple shifts can earn
multiple credits while representing one attended date. The late-OUT bonus is the
separate derived rule above; it does not reclassify hours or write salary amounts.

## Sundays — kis-kis Sunday ko aaye

Open **Attendance → Sundays**, then choose a month/week/day/custom range,
manager, shift or name/code/note search. Each manager has a dated list and count.
The selected manager’s **Ledger & reports** also shows the Sunday list.

- **Time:** use the actual **check-in date**, including next-day arrival.
  Saturday night → Sunday morning checkout is **not** a Sunday arrival.
  An after-midnight Sunday check-in saved under Saturday **is** a Sunday visit.
- **Tap:** only Present / Half day counts. Absent, Leave, Holiday, Week off and
  Unmarked are **not** visits, regardless of any paid-credit setting.
- All shifts on the same Sunday count **once per manager**; their shift names are listed.
- Open valid Sunday check-ins are included and labelled **Checked in**.
- Range boundaries use the **actual arrival date** for visits. The daily ledger
  and actual-hours total use the saved **Attendance date**. Thus a prior-month
  Night record can contribute a Sunday visit to this month without moving its
  hours/daily row into this month. Reports explain the two date bases.
- No missing Sunday is automatically marked Absent. No Sunday deduction or
  salary effect is introduced.

## Views, editing and scale

| View | Use |
|---|---|
| **Daily board** | Roster + recorded shifts, quick statuses, clock actions, edit, bulk marking and shift pulse. |
| **Calendar** | Monthly grid, manager/shift filters and saved-day totals; tap a date to edit. |
| **Ledger & reports** | Day, Monday–Sunday week, month or custom inclusive range; filters/search/sort, edit/delete and individual day-by-day ledger. |
| **Sundays** | Manager-by-manager Sunday dates, deduplicated counts and filters. |
| **Managers** | Dynamic profiles, unique codes, employment dates, active/inactive, ledger/report and explicit delete. |
| **History** | Retained time/actor/action and readable before/after details; original canonical JSON stays intact. |

- Smart manager selectors search name/code. Duplicate names require unique codes.
- Only **one manager + date + shift** record is allowed; edit it instead of duplicating.
- Joined/last-working dates prevent new marks outside employment. Inactive keeps
  historical records/reports while blocking new attendance. Delete explicitly
  removes the manager and their records after a warning/safety copy.
- **Bulk mark** selects the shift’s roster, skips existing records by default,
  and requires **Replace existing attendance too** for intentional overwrites.
- Board/Sunday manager lists paginate at 24; ledger/history at 40. Totals use
  the complete selection. Browser storage remains finite.
- History retains the latest **2,000 actions**; it is not tamper-proof or immutable.

## Individual PDF and Excel

1. **Individual report** / a manager’s **Report** button.
2. Choose **one manager**, inclusive **From / To**, and **All shifts** or one saved shift
   (**Morning / Afternoon / Evening / Night / Day (existing)**).
   Split ranges longer than 3,660 days.
3. **Download PDF** / **Download Excel** / **WhatsApp PDF**. If an automatic download is blocked,
   tap the generated **Save PDF / Save Excel workbook** link before closing the dialog.

**PDF:** compact manager/range/profile header; Actual hours, Arrival dates,
Sundays attended and Open shifts strip; separately dated Sunday attendance;
seven columns — Date/day, Shift, Attendance, Check-in, Check-out, Actual hours,
Credit. Notes use numbered references and are included **in full**, followed by
atomic totals, the monthly **extra-bonus count/rate/rule**, verification lines and
page numbers. No break/target/OT columns.

Clock example: `9:30 night` → `7:30 morning +1d`. **`+1d` means next day;
otherwise the clock is on the attendance date.** The report includes the
noon/midnight legend. The v3.25 controls add the four periods; saved canonical
clocks/day flags and the existing report design are unchanged.
Gold rows indicate **calendar Sundays**, not automatic presence or Sunday pay;
the separate dated Sunday list uses actual arrival dates, as before.

**Every produced PDF has at most 2 pages.** If the range or notes need more,
choose a shorter range or Excel: the app refuses a partial/cut-down PDF. There
is no universal way to fit unlimited records/notes legibly on two sheets.
Hindi uses bundled offline shaping with Unicode `ActualText`; copy/search support
for that image-backed text varies by PDF viewer/parser. Excel/JSON retain literal
Unicode. See [fonts and notices](PDF-FONTS.md).

**Excel:** a genuine offline `.xlsx`, not renamed CSV. Five sheets:

1. **Attendance register** — opens first. **Summary and monthly bonus above**;
   below, Date, manager/status, Check-in, Check-out, blank Advance, Shift, Actual
   hours, Credit, full Notes. Photo-style black borders, white rows and yellow
   calendar Sundays; full actual period/day captions stay beside each clock.
   Frozen identity rows 1–3 / date-status columns A–B, real table filters,
   repeated identity print rows, landscape A4 fit-to-width and page footers.
   Body dates are not merged, so filters work.
2. **Summary** — original manager/profile, numeric decimal-hour totals, arrival
   dates, Sunday count, statuses, credits, explanations and profile note. Includes
   the full-month all-shift qualifying OUT count, extra bonus (%) and remaining
   OUTs for the next +1%, plus the percentage-only/no-payment disclaimer.
3. **Daily attendance** — complete selected rows with original IDs, readable
   clocks/context, numeric decimal hours, notes and update time.
4. **Change history** — retained before/after readable values and actors.
5. **Sundays attended** — independent dated/deduplicated actual Sunday visits.

Register durations/totals are **numeric Excel time fractions formatted `[h]:mm`**,
so e.g. 27h 01m displays as **27:01**, not a wrapped 3:01 or rounded decimal.
Summary/Daily attendance retain their numeric **decimal hours** for compatibility.
Credits are numeric. Names/notes are **literal strings, never spreadsheet formulas**;
no macros or external workbook links are added. Totals are the exported snapshot,
not a new payroll calculation or a write-back into the app. The first-sheet Advance
column is blank manual space, not a linked financial record; advance/salary/canteen
records are not added to, modified by or inferred from this attendance register.

Unmarked is **not** Absent. Dates outside employment are shown separately. Reports
include only the selected manager/range/shifts; history follows attendance dates.
**Exception explicitly labelled:** bonus uses the full months/all shifts described above.

### Share an individual's PDF to WhatsApp

1. Open **Individual report**, choose one manager, dates and shift selection.
2. Tap **WhatsApp PDF**. If PDF preparation outlasts the browser's user gesture,
   tap the new **Share PDF · choose WhatsApp** button when the PDF is ready.
3. In a supported device share sheet, select WhatsApp, then the recipient and Send.
   The app cannot select a private chat or verify that the recipient received it.
4. If file sharing is unsupported/rejected, use **Save PDF**, then **Open WhatsApp**
   and **Attach → Document** to select the downloaded PDF. A blocked popup still
   leaves the link visible. The PDF is **not automatically attached or sent**.

Cancelling the share chooser does not trigger an automatic download or claim a
send. Changing manager/dates/shift or closing the report removes stale prepared
links. The two-page guard applies to shared PDFs too; a partial PDF is never sent.
Web Share support depends on the browser/OS and a secure context; real WhatsApp
chooser/recipient behavior needs a physical-device check. Automated sharing QA
stubs the native API while verifying real PDF `File` bytes and fallback downloads.

## Saving, backup and sync safety

- Same `hisaabPro.v1` storage key, JSON backup and configured account cloud payload;
  no new account, table, backend or record migration is needed.
- Automatic local safety copy before the first Attendance change each day/account,
  plus destructive/replacement checkpoints. Up to **3 distinct copies**, subject
  to available storage; download regular external JSON backups too.
- Quota/save failure rolls the whole Attendance change back with an error. Stale
  editor/account/disk baselines are blocked instead of silently overwriting.
- Old JSON without Attendance preserves current Attendance. Included Attendance
  can replace it after validation/safety copy. Full erase includes Attendance;
  canteen-only erase/demo actions do not.
- Different records merge. Same-date/shift conflicts, competing clock spans,
  delete dependencies and malformed legacy metadata require a safe choice or
  block unsafe adoption. Existing cloud CAS/account guards remain in place.
  See [CLOUD-SYNC.md](CLOUD-SYNC.md).

QA covers automated offline tests, real Chromium desktop/mobile-size forms,
reloads/downloads, PDF rendering/geometry and independent workbook parsing.
This is not physical-phone, Safari or live customer Supabase/RLS verification.
