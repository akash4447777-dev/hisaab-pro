# HISAAB v3.24 — manager Attendance

**Attendance is a tab inside the existing Hisaab Panel**, not a separate app.
Manager profiles, attendance, credit settings and history share the panel’s
existing local save, JSON backup and configured cloud sync. **Attendance never
changes worker salaries, wages, advances, deductions or payments.**

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
`1:33 night` is 1:33 in the afternoon; `1:33 morning` is after midnight.

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
Use v3.24 on all devices/tabs for compatible shift/report support; do not clear storage.

## Start here

1. Settings → **Backup (JSON)**. Open the latest panel and confirm **Panel v3.24**.
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
suggests morning/night and same/next-day choices to start with; verify each choice.
Morning suggests a same-day morning arrival, Afternoon/Evening a same-day night
arrival, and Night a same-day night arrival / next-day morning departure. No clock
value or fixed working duration is filled in.

- Use a **1–12 clock**: `9`, `9:30`, `12:15`. Numeric entry supports `930` / `0930`
  → `9:30`, `9` → `9:00` on leaving the field, and Hindi digits such as `९३०`.
  A 24-hour input such as `21:30` is rejected, not silently converted.
- Each clock has **Same day morning**, **Same day night**, **Next day morning**,
  **Next day night**. These clock-period labels are separate from the new
  **Morning / Afternoon / Evening / Night** shift names; Day remains a legacy shift.
- **Same day** means the selected **Attendance date**. **Next day** means the
  following date. The live timeline shows the actual two dates.
- Morning = midnight to before noon; Night = noon, afternoon, evening and night.
  **12 morning = midnight; 12 night = noon.** A reminder appears for 12 o’clock.
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
noon/midnight legend. Entry controls and saved canonical clocks are unchanged.
Gold rows indicate **calendar Sundays**, not automatic presence or Sunday pay;
the separate dated Sunday list uses actual arrival dates, as before.

**Every produced PDF has at most 2 pages.** If the range or notes need more,
choose a shorter range or Excel: the app refuses a partial/cut-down PDF. There
is no universal way to fit unlimited records/notes legibly on two sheets.
Hindi uses bundled offline shaping with Unicode `ActualText`; copy/search support
for that image-backed text varies by PDF viewer/parser. Excel/JSON retain literal
Unicode. See [fonts and notices](PDF-FONTS.md).

**Excel:** a genuine offline `.xlsx`, not renamed CSV. Five sheets:

1. **Attendance register** — opens first. Date, Day, Shift, Attendance,
   Check-in, Check-out, Actual hours, Credit, Notes. Real sortable Excel dates,
   status colours, gold calendar-Sunday rows and full wrapped notes. Full
   same/next-day morning/night captions stay beside each clock. Frozen first
   two columns / first seven rows, filters, repeated print headers, landscape
   A4 fit-to-width and page footers. Body dates are not merged, so filters work.
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
not a new payroll calculation or a write-back into the app. Advance/salary/canteen
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
