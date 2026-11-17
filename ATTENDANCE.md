# HISAAB v3.21 — manager Attendance

**Attendance is a tab inside the existing Hisaab Panel**, not a separate app.
Manager profiles, attendance, credit settings and history share the panel’s
existing local save, JSON backup and configured cloud sync. **Attendance never
changes worker salaries, wages, advances, deductions or payments.**

## What changed in v3.21

- **Working hours are not fixed at 8 or 12 hours.** Enter actual arrival and departure.
- **No Unpaid break minutes input and no break deduction**, including old records.
- No schedule/target presets, automatic overtime, lateness, early-exit or hour-based
  Half day. **Half day is a manual Tap mark.**
- A separate **Sundays** tab lists **which Sundays each manager attended**, with
  dates/counts. The individual ledger, PDF and Excel include these visits too.
- The PDF now has clear summary cards, a dated Sunday section and a readable
  six-column daily ledger, instead of the crowded old calculation table.

**Existing users: take a JSON backup first.** Original clocks, day offsets,
record IDs and history are not rewritten. Older break/target/schedule metadata
remains in JSON/history for compatibility and validation, **not arithmetic**.
Consequently, old timed entries now display their **full in → out hours** and
completed valid Time entries display Present, rather than the old target-based
classification. Previous printed totals can differ; keep previous reports if needed.
Update all devices/tabs to v3.21 for consistent calculations; do not clear storage.

## Start here

1. Settings → **Backup (JSON)**. Open the latest panel and confirm **Panel v3.21**.
   See [safe device sync](CLOUD-SYNC.md).
2. Sidebar → **Attendance** → **Add manager**. Enter a name and unique code,
   choose **Day / Night**, and optionally add role, phone, employment dates and notes.
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

New records have **blank clocks**, not fixed shift timings. Day/Night only suggests
which morning/night and same/next-day choices to start with; verify each choice.

- Use a **1–12 clock**: `9`, `9:30`, `12:15`. Numeric entry supports `930` / `0930`
  → `9:30`, `9` → `9:00` on leaving the field, and Hindi digits such as `९३०`.
  A 24-hour input such as `21:30` is rejected, not silently converted.
- Each clock has **Same day morning**, **Same day night**, **Next day morning**,
  **Next day night**. Shift names remain **Day / Night**.
- **Same day** means the selected **Attendance date**. **Next day** means the
  following date. The live timeline shows the actual two dates.
- Morning = midnight to before noon; Night = noon, afternoon, evening and night.
  **12 morning = midnight; 12 night = noon.** A reminder appears for 12 o’clock.
- A Night entry of `9:30` + **Same day night** → `7:30` + **Next day morning** is
  **10h 00m**, with no deduction. A `9` → `11:30` morning entry is **2h 30m**;
  it does not automatically become Half day, Short hours or Absent.
- A completed span must be positive and at most **24 hours** (an input-safety
  limit, not a daily working-hours target). Correct the day/period if departure
  is before arrival.
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
hardware. **Credits are per saved shift, not payroll days:** Day + Night can earn
two credits while representing one attended date.

## Sundays — kis-kis Sunday ko aaye

Open **Attendance → Sundays**, then choose a month/week/day/custom range,
manager, shift or name/code/note search. Each manager has a dated list and count.
The selected manager’s **Ledger & reports** also shows the Sunday list.

- **Time:** use the actual **check-in date**, including next-day arrival.
  Saturday night → Sunday morning checkout is **not** a Sunday arrival.
  An after-midnight Sunday check-in saved under Saturday **is** a Sunday visit.
- **Tap:** only Present / Half day counts. Absent, Leave, Holiday, Week off and
  Unmarked are **not** visits, regardless of any paid-credit setting.
- Day + Night on the same Sunday counts **once per manager**; both shifts are listed.
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
2. Choose **one manager**, inclusive **From / To**, and **All shifts / Day / Night**.
   Split ranges longer than 3,660 days.
3. **Download PDF** / **Download Excel**. If an automatic download is blocked,
   tap the generated **Save PDF / Save Excel workbook** link before closing the dialog.

**PDF:** manager/range at the top; Actual hours, Days attended, Sundays attended
and Open shifts cards; separately dated Sundays; then six columns — Date/day,
Shift, Attendance, Check-in, Check-out, Actual hours. Clocks include full same/next-day
morning/night captions. Notes span the row; totals and verification lines stay
together, with continuation headers/page numbers. No break/target/OT columns.
Hindi uses bundled offline shaping with Unicode `ActualText`; copy/search support
for that image-backed text varies by PDF viewer/parser. Excel/JSON retain literal
Unicode. See [fonts and notices](PDF-FONTS.md).

**Excel:** a genuine offline `.xlsx`, not renamed CSV. Four sheets: **Summary**,
**Daily attendance**, **Change history**, **Sundays attended**. Actual hours and
credits are numeric. Clock/context columns and history use readable 12-hour text;
Sunday dates are independently listed. Daily/history/Sunday headers are frozen and
filterable. User names/notes are literal strings, never spreadsheet formulas.

Unmarked is **not** Absent. Dates outside employment are shown separately. Reports
include only the selected manager/range/shifts; history follows attendance dates.

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
