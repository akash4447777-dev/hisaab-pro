# HISAAB v3.19 — manager Attendance

**Attendance is a tab inside the existing Hisaab Panel**, not a separate app.
Manager profiles, attendance, rules and history are stored alongside the existing
salary/canteen data. **Attendance never changes worker salary records, wages,
advances, deductions or payments.**

## Start here

1. Existing users: Settings → **Backup (JSON)** first. Open the latest panel and
   confirm **Panel v3.19**. Update other devices/tabs too; see [cloud safety](CLOUD-SYNC.md).
2. Sidebar → **Attendance** → **Add manager**. Enter a name and a unique manager
   code, choose **Day** or **Night**, and optionally add role, phone, employment
   dates and notes. Codes distinguish managers with the same name. No real
   manager names or sample attendance are preloaded.
3. Open **Shift & credit rules** and review the starting defaults below before use.
4. Pick the date, manager and shift. Use **Tap mode** for a status, or **Time mode**
   for actual clock times. Saved records immediately update the board, calendar,
   ledger and summaries.

### Configurable starting defaults — not an approved workplace policy

| Rule | Initial value |
|---|---|
| Day shift | 09:00–18:00 |
| Night shift | 21:00–06:00 next day |
| Full-day / half-day net targets | 8 hours / 4 hours |
| Unpaid break | 60 minutes; editable on each time record |
| Late grace / early-exit grace | 10 minutes / 0 minutes |
| Leave / holiday / week-off credits | 1 / 1 / 0 |

These are editable starting settings, **not assumptions about your business**.
No holidays, weekly offs or absences are created automatically. Rules apply to
new records; each saved record retains its own rule snapshot. When editing an
older record, **Recalculate this record with today’s shift rules** explicitly
opts that one record into the current rules.

## Tap mode

- **Present**, **Absent**, **Half day** and **Leave** are one-tap buttons on a
  manager’s daily card. **More / Edit** also offers **Week off** and **Holiday**.
- Present = 1 attendance credit; Half day = 0.5; Absent = 0. Leave, Holiday and
  Week off use the saved configurable credit switches.
- A tap mark records a status/credit, **not invented check-in times or worked hours**.
- Repeating the same mark does nothing. Changing an existing mark asks before
  replacement. Replacing a time entry with a tap mark clears its clock fields;
  prior values remain in history and a safety copy.

## Time mode and overnight attendance

- Enter **24-hour HH:MM**, such as `09:00` or `21:00`; numeric mobile input also
  accepts `2100` → `21:00`, `900` → `09:00` on leaving the field, and Hindi digits.
  Shift labels are always **Day / Night**, never twelve-hour suffixes.
- The attendance date is the **shift-start date**. A Night shift starting on
  14 November and ending at 06:00 on 15 November is dated **14 November**;
  select **Next day** for check-out. After-midnight arrivals can also use
  **Next day** for check-in. The form shows an immediate calculation preview.
- Leave check-out empty for an open shift. The daily Time-mode card also has
  **Check in now / Check out now** using the device’s local clock.
- A completed span must be positive and at most 24 hours; the unpaid break must
  be a whole number of minutes shorter than that span.

Calculations:

```text
Worked minutes = check-out − check-in − unpaid break
Overtime       = max(0, worked minutes − saved full-day target)
Late minutes   = max(0, arrival − scheduled start − saved late grace)
Early minutes  = max(0, scheduled end − departure − saved early grace)
```

Net work at/above the full-day target = Present (1 credit); at/above the
half-day target = Half day (0.5); below it = Short hours (0 credits, **not an
Absent mark**). Open shifts have no completed worked hours/overtime/credits yet.
Calculations use local wall-clock minutes, not timezone-tracked punch hardware.

**Credits are per recorded shift.** A manager with both Day and Night records
on the same date may have two credits; these are not automatically payroll days.

## Views, filters and editing

| View | Use |
|---|---|
| **Daily board** | Roster plus recorded shifts for a date, quick marks, clock actions, edit, bulk marking and shift pulse. |
| **Calendar** | Monthly seven-day grid, manager/shift filters and day totals. Tap a date to open its daily board. |
| **Ledger & reports** | Daily, Monday–Sunday weekly, monthly or custom inclusive ranges; search/status/shift filters, sort, edit/delete and an individual manager ledger. |
| **Managers** | Add/edit profiles, search/filter, change default shift, deactivate, individual ledger/report, or explicitly delete. |
| **History** | Time, actor, action and before/after values for retained changes; filter by manager/date and open details. Workspace rule edits are labelled separately. |

- Manager selectors search by name/code. Same-name managers require their unique
  code. Joined/last-working dates prevent new attendance outside employment dates.
- **Inactive** removes a manager from new attendance while retaining existing
  records and reports. **Delete manager** explicitly removes that profile and
  its attendance; it warns and saves a safety copy first.
- Only **one record per manager + date + shift** is allowed. Edit the existing
  record rather than adding a duplicate; Day and Night on the same date are allowed.
- **Bulk mark** defaults to the selected shift’s roster and skips existing records.
  Select/deselect managers as needed. **Replace existing attendance too** is an
  explicit overwrite option, including replacement of time records with tap marks.
- Board cards paginate at 24; ledger/history at 40. Statistics use the complete
  filtered selection, not just the visible page. Browser storage is still finite.
- History retains the **latest 2,000 actions per workspace**. It is an editable
  local/cloud audit aid, not an immutable or tamper-proof compliance record.

## Individual PDF and Excel downloads

1. Click **Individual report**, or a manager’s report button.
2. Select **one manager**, **From**, **To**, and **All shifts / Day / Night**.
   Dates are inclusive; shortcuts are provided. Split ranges longer than 3,660 days.
3. Choose **Download PDF** or **Download Excel**. If the browser blocks an
   automatic download, the generated **Save PDF / Save Excel workbook** link
   remains in the dialog: tap it directly before closing the dialog.

**PDF:** individual profile, range, KPI totals, every date, Day/Night, clock
in/out with next-day flags, breaks, worked/overtime hours, late/early minutes,
credits, notes, saved time rules, totals, verification lines and page footers.
Hindi names/notes use bundled Devanagari shaping plus searchable/extractable
Unicode text; see [font implementation and notices](PDF-FONTS.md).

**Excel:** a genuine offline `.xlsx` workbook, not renamed CSV. It contains
**Summary**, **Daily attendance**, and **Change history** sheets. Hours and credits
are numeric; daily/history headers are frozen and filterable. Hindi/emoji/user
text are stored as literal strings, never spreadsheet formulas.

An **Unmarked** day means no saved record for the selected shift(s) on that date;
it is not an absence. Dates outside employment are shown separately. Reports
contain only the selected manager/range/shifts; retained history is filtered by
manager and attendance date, and may include profile actions in that date range.

## Saving, backup and device sync

- Successful saves use the existing `hisaabPro.v1` localStorage key, the same
  JSON backup and, when configured/signed in, the same account’s cloud payload.
- Attendance takes an automatic local safety copy before its first change each
  day/account, plus checkpoints for destructive/replacement operations. Existing
  safety storage retains up to **3 distinct copies**, subject to browser space.
  It is **not** an external backup service: download JSON backups regularly.
- A failed/quota-blocked save rolls the Attendance operation back and shows an
  error. A stale editing tab/account/editor is blocked, not silently accepted.
- Old JSON backups without Attendance preserve existing Attendance. Backups that
  include Attendance can replace it after validation and a safety copy. Explicit
  **Erase everything** includes Attendance; canteen-only erase/demo actions do not.
- Different device records merge; conflicting marks for the same manager/date/shift,
  competing clock spans and delete/dependency conflicts require a safe choice.
  Existing read-before-write/conditional cloud protection also covers Attendance.
  See [CLOUD-SYNC.md](CLOUD-SYNC.md) for recovery and limitations.

Verified with automated offline tests and real Chromium desktop/mobile-size forms,
reloads, PDF/XLSX downloads and independent PDF/workbook parsers. This is not a
claim of physical-phone testing or live customer Supabase/RLS verification.
