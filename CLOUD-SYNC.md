# HISAAB v3.36 — safe login, device sync aur recovery

v3.17’s data-safety protocol remains in place. v3.19 extends the same protection
to the integrated manager Attendance tab; no new Supabase table/project is needed.
v3.21 keeps the easy 12-hour entry and now measures **actual out − in hours**, with
no fixed target or break deduction (including old records), plus dated Sunday visits
and clearer reports. Original clocks, day offsets, archived policies/history and
the cloud schema are retained; no migration is required. Old Attendance hours/status
summaries can change because retired calculations are no longer applied. Update all
clients for consistent results. Salary/canteen calculations remain independent.
v3.22 removes the old 24-hour duration cap for same/next-day attendance (e.g.
27h 01m). Stored clocks/day flags and the cloud schema are unchanged. **Update all
clients to v3.22 or later**: clients older than v3.22 can reject/stop syncing a span over 24 hours;
there is no automatic rewrite into shorter records.
v3.23 changes **only Attendance report presentation**: compact 1–2-page PDF,
styled five-sheet Excel and report preview/capacity messages. The calculation,
record/schema, save/import, recovery and cloud merge functions are unchanged.
Report preview/success/failure do not save, migrate, delete or resync entries.
A range too large for two PDF pages is refused without editing data; the full
Excel selection is still available.
v3.24 extends only the Attendance shift enum (Morning/Afternoon/Evening/Night;
saved Day/Night retained) and derives the monthly late-OUT bonus from existing
records. The reference-style 1–2-page PDF and individual WhatsApp PDF sharing are
read-only. No salary/payment write, storage-key change, record migration, or new
backend table is introduced. **Update every client to v3.24 before using new shift
keys**: v3.23 and earlier reject Morning/Afternoon/Evening, so they can stop loading
or syncing. The v3.23 raw-storage regression confirms saving is blocked, not
silently rewritten into Day; do not keep editing with older clients.
v3.25 corrects **both Check-in / Check-out period dropdowns** to eight Same/Next
day × Morning/Afternoon/Evening/Night choices. Saved canonical clocks/day flags,
history, storage keys, normalization, recovery, merge and financial functions
are unchanged; no migration or server change. Only clock labels/entry validation
change: saved 13:33 becomes 1:33 afternoon, **not** 01:33 or a different duration.
Night 1–4 is after midnight; the explicit day flag is never guessed. Use **v3.25
on every device/tab** for matching labels; the v3.24 minimum for new shift keys
still applies. Opening the new build does not rewrite the raw v3.24 payload.
v3.26 changes **only the exported Excel presentation**: summary/actual Sunday
dates/monthly bonus above a photo-style date register; all five sheets retained.
Distinct present/status dates are export-only display counts, not new payroll
rules. Advance is blank manual space in the downloaded workbook, never linked
to salary employees by name or written back. No original record/history, clock,
PDF design, bonus arithmetic, storage key, recovery/merge function or schema
change. v3.25 data is read without migration; use v3.26 to export the new format.
v3.27 consistently labels the salary module **Employee / Employees**. Displayed
cloud counts/conflict collection labels use the same wording; internal
`workers` / `workerId` paths, merge decisions, recovery snapshots, storage keys
and cloud payloads stay unchanged. Old JSON backups still import directly.
Customer-entered names/notes/shop names are never mass-renamed. No new server,
AI integration, migration or financial/attendance change is introduced.
v3.28 corrects **only Canteen detailed reports**: repeated same-name/unit items
remain separate saved-line rows, not one combined quantity/amount. Existing
entries/IDs, financial totals, rate-catalog/history analytics, CSV, storage keys,
normalization, save/import, recovery/merge functions, cloud payloads and all
Attendance reports/rules remain unchanged. No migration, server change or
re-entry. Re-download the PDF; do not duplicate old entries or clear storage.
[Attendance guide, Sunday date rules and backup advice](ATTENDANCE.md).

v3.29 adds an optional **company logo** to existing Settings. Upload once in
Settings; reload, JSON backup/restore, scoped pending cache and configured cloud
keep the bounded local image. A confirmed removal is an explicit empty value;
concurrent different replacements/removal pause for an explicit local/cloud
choice. No new storage key, backend/table or sync/recovery/financial change.
Bad/cancelled/stale-account uploads or failed local persistence retain the previous
logo/data; local save is never a cloud ACK. Update all devices/tabs to **v3.36** to
see branding on their PDFs. [Logo guide](COMPANY-LOGO.md).

v3.30 removes only Canteen PDF/print Bikri / Kharcha display columns and their
summary slots. It does **not** remove purchase/sale/expense records or alter
category totals, Net / Paid / Baki, payload/schema, storage, merge/recovery or
server rules. All previous item-line, logo and Attendance guarantees remain.
Re-download the report on the latest panel; never duplicate entries or clear storage.

v3.31 adds **saved Canteen parties** as an optional canonical-name map in existing
Settings. A saved-party-only account is real user data; names survive zero entries,
backup, scoped cache/offline reload and independent-device merges. Missing catalog
in old cloud/JSON snapshots preserves existing names; explicit empty catalog has
deletion intent/recovery safeguards. Malformed catalogs refuse overwrite. Canteen
wipe confirmation includes saved names; catalog Undo and Missing data jodo retain
newly added names. Existing merge engine, storage keys, backend/table, financial
records and Attendance schema remain. Date × party report selection is read-only,
context-checked and defers cloud adoption while its dialog is open. Design selection
only changes the existing PDF preference. Use v3.31 for the new selectors on every
device/tab; do not clear storage or re-enter entries. [Party / PDF guide](CANTEEN-REPORTS.md).

v3.32 adds **Stock Management** in optional `settings.stockInventory` (v1):
products, dated In/Out/Sale transactions, deduplicated local JPEG images and full
before/after history. Stock-only, history-only and photo-only payloads count as real
data; old missing-field backups/cloud snapshots retain current Stock. Explicit
empty Stock participates in deletion-intent/loss checks and recovery. No new table,
project or storage key. Existing employees, salary, Attendance, logo and Canteen
parties/reports stay intact. [Use guide](STOCK-MANAGEMENT.md).

Every local write/import/recovery/cloud candidate validates product/unit/image
references and the **whole chronological ledger**, not just final availability.
Independent valid movements merge; two offline sales that together oversell pause
for explicit choice. An affected product and its dependent movement set are chosen
coherently from the selected side, not mixed into a negative/orphan ledger. Losing
rows/images remain in audit and required safety copies; independent products still
merge. A later cloud change requires a fresh choice. Review physical quantities;
this is not a server-reserved multi-user warehouse lock.

Stock dialogs use the existing account/data/disk/edit-version guards. Failed
canonical persistence restores previous inventory/audit/dirty state; a successfully
saved **pre-change safety copy** may still advance. Global erase explicitly includes
Stock photos/audit; demo/sample and old backups without Stock preserve it. Recovery
adds missing dependencies or refuses an invalid dated combination, never clamps
available quantity. Update every editing client to **v3.36** before Stock use.
Synthetic CAS/RLS/adversarial tests are not live-customer backend verification.

## Opening-stock file import (v3.33+)

Stock → **Import stock** is an **additive opening snapshot**, not Settings backup
Restore. File selection / complete preview / explicit blank-by-default cut-over
date / review do not write app data. Confirming creates ordinary products and
positive opening In entries with independent audit rows in **one existing guarded
Stock transaction**, after a required pre-change safety copy. Zero-stock catalogue
items are retained; no past receipt/sale history, date or pack conversion is invented.

Same normalized name + exact unit is **skipped unchanged**, even if file quantity
differs; same name + different unit blocks **the whole batch**. Reimporting all
existing products writes nothing. Parser/file bounds, stale account/epoch/version/
disk/snapshot checks and cancelled-reader guards apply before commit. Failed save
rolls inventory/audit/photos back; a successful pre-change safety copy may advance.
Salary, Attendance, Canteen, other settings and the cloud schema remain untouched.

The selected file is parsed locally, never sent to a new upload service. Saved Stock
records use the **existing configured account-scoped sync**; local import success
is not cloud ACK. Import once on the actual-data device, verify the preview and
quantities, download a fresh JSON backup, then wait for **Cloud synced** before
using another updated device. Competing offline imports of the same new name pause
as a duplicate-name conflict instead of silently summing their openings. Use
**v3.36 on every tab/device**, the same project/account, and never clear storage.
Private catalogues/screenshots are not embedded in the public release/tests.
[File format, date/review and reimport rules](STOCK-MANAGEMENT.md).

## Private opening-stock link (v3.34)

No-file-chooser links are **local input, not automatic write authorization**. The
normal current panel removes the private fragment before bootstrap/cloud startup,
decodes locally under token/expanded-size bounds, and waits for initial cloud
boot/login before capturing the destination context. Full account/date/product/
quantity/unit preview requires **one explicit Haan click**; open/cancel/reload do
not import. The explicitly selected import-day policy uses link-opening local day,
including when login completes after midnight. No historical movement is invented.

Confirmation delegates to the same guarded additive Stock transaction as the file
importer: same-name/exact-unit skip, different-unit whole-batch refusal, required
checkpoint, atomic products/openings/photos/audit, stale account/disk and quota
rollback. Saved records use existing conditional sync, never a separate upload.
Duplicate openings on competing offline devices still need ordinary conflict review.

Private fragments are **not encrypted or expiring**; anyone with the link can read
its inventory. Never commit/publish/shorten it; no business catalogue is in public
HTML/tests. Use the actual-data browser and confirm the displayed account. Do not
confuse a local success with Cloud synced. [Link guide and local generator](STOCK-MANAGEMENT.md).

## Reviewed message / screenshot Stock entry (v3.35+, easier v3.36)

Stock → **Message / screenshot** accepts one explicitly pasted message or selected
raster image. No background WhatsApp/phone access, AI service or inventory seed.
Source extraction, OCR, year/type/roles/product matching and complete preview never
save. OCR uses the existing browser Tesseract5 English engine/core/model downloads;
images are processed locally, not posted to an image service. Text works offline.
Network/engine/model/decode failure leaves prior text usable, never a saved partial
batch; confidence/uncertainty and original screenshot are visible for review.

One review + explicit Confirm recomputes the plan and rechecks original account,
data identity/snapshot, epoch, edit version, owner and canonical disk both before
and after asynchronous hashing. Changed draft/roles/Skip decisions, replaced modal,
Escape/cancel or account change invalidate consent. Every new ordinary movement +
independent create audit is saved in **one existing Stock atomic checkpoint**;
failed recovery capture, quota, storage, required fields or any dated overdraw
refuse all rows. No schema/table/app-localStorage-key change, separate available
counter, salary/Canteen/Attendance/logo write or alternative cloud path.

Message provenance + confirmed product aliases live in normal create-audit reasons;
header/item text/tags in normal movement notes. v3.36 also keeps the complete
explicit member list in ordinary delivery-details text; all tags remain visible
in History/PDF, independently of the explicitly chosen salesperson/receiver roles.
No Employee/Attendance profile is created. Older note-only tags are read without
rewriting storage. Semantic movement IDs cover repeated
receipts across different messages, not only identical screenshots. Already saved,
edited/deleted imports and current/historical manual duplicates cannot silently
replay; genuine identical-looking separate deliveries require an explicit unique
reference/new decision and reconciled quantities. Batch provenance applies to each
actually saved source row, not all deliberately skipped rows of a partial batch;
retry still goes through the same duplicate/opening/ledger/consent safeguards.
Source previous/Available are
validation only, never replacements for ledger/opening quantities. Pre-opening
movements can only resolve to already-included Skip; same-day needs explicit
AFTER-opening confirmation. Unknown year/unit/member role never invents stock.

Saved rows/aliases/audits use the same existing account-scoped conditional sync,
backup/recovery and dependency-aware conflict path; local save is **not cloud ACK**.
Concurrent offline versions of the same semantic event share an ID; incompatible
values still require existing explicit conflict resolution. This is not a global
server-side stock reservation lock. Import once on the actual-data device; verify
live stock/History, take JSON backup, wait for **Cloud synced**, then use another
updated **v3.36** tab/device. No customer-account write was performed by shipping
this generic feature. [Formats, review and duplicate/opening rules](STOCK-MANAGEMENT.md#1c-message--screenshot-se-in-sale-ya-out).

## Read-only Stock PDFs (v3.36)

Available Stock, current combined-filter History and a saved message's current rows
have local branded PDFs. Every matching row/page, exact unit, full-ledger balance,
member tag/explicit role and source note is retained; no prices, invoice or new
storage schema. Product snapshots ignore hidden History controls and cannot pretend
to honor historical party/dates. Invalid/empty filters refuse, not broaden. Existing
account/data/owner/disk guards also protect prepare/download/share and late font
callbacks; modal close/selection changes revoke ready-file URLs. Real PDF file-share
is user-initiated; unsupported/cancelled sharing is not claimed as sent. No automatic
WhatsApp attachment, report upload, inventory write or alternative sync path. PDF
is a report, **not a JSON backup**. [Stock PDF guide](STOCK-MANAGEMENT.md#4a-stock-pdf--available-history-ya-ek-saved-message).

## Pehle ye karein (existing users)

1. **Jis phone/laptop par asli data abhi dikh raha hai, uska Settings → Backup (JSON) download karein.** Salary, canteen, saved Attendance aur Stock/photos/audit sab isi backup me aate hain. Doosre device par bhi bacha data ho to uska alag backup rakhein.
2. **Dono devices aur saare purane tabs par v3.36 kholein:**
   [Hisaab-Pro-v3.36.html](https://akash4447777-dev.github.io/hisaab-pro/Hisaab-Pro-v3.36.html).
   Sidebar me **Panel v3.36** confirm karein. Browser/site storage clear, uninstall, “Erase all data” ya “Sample data” mat karein.
3. Pehle bache-data wale device par **usi Supabase Project URL aur usi email/account** se sign in karein. Existing setup ko reset ya naya project/account banane ki zaroorat nahi.
4. Settings → **Sync now**. `Cloud synced` aane par doosre updated device par bhi same project/account se sign in karein. Pehli login par cloud read hota hai; naya khaali/demo device populated cloud ko replace nahi karta.
5. `Sync paused · data protected` aaye to neeche wali conflict/recovery choice dekhein. `Local saved · sync pending` ya `Offline · sync pending` ko cloud backup ki confirmation **na** maanein.

> **Purane versions ko band/update karna zaroori hai.** Unme unsafe whole-snapshot upsert tha; is client-only release se already-open purane clients ki writes server par block nahi hoti. Ek hi device/browser par ek active editing tab rakhna behtar hai. Naya version doosre tab ki persisted changes detect karke stale tab ko rokta hai, lekin localStorage koi transactional multi-tab database nahi hai.

## Status ka matlab

| Status | Kya karein |
|---|---|
| **Cloud synced** | Server read/write aur browser persistence confirm hui; koi known pending edit nahi. Doosra updated device ab sync kar sakta hai. Ye permanent historical backup ki guarantee nahi. |
| **Local saved · sync pending** | Is browser me save hua, abhi cloud ACK nahi mila. Device storage clear mat karein. |
| **Offline · sync pending** | Internet, session, permission ya cloud request fail hui. JSON backup lein; internet aane par retry hota hai, ya Sync now dabayein. Detailed error banner/Settings me dikhega. |
| **Sync paused · data protected** | Matching financial fields, edit-v-delete, ya suspicious missing data hai. Koi automatic winning-device choice nahi hoti. Resolve safely kholein. |
| **Save failed** | Browser storage full/blocked, corrupt local JSON/cache, ya doosre tab ne data badla. Success assume mat karein. **JSON backup** lein; eligible case me **Local save retry** karein. Stale-tab message ho to pehle us tab ka backup, phir reload. Corrupt-storage case me automatic overwrite blocked rehta hai. |
| **Sign in needed / Local only** | Cloud confirmation nahi hai. Data/pending cache browser me rehta hai. |

Network fail hone par successfully saved offline edits aur merge baseline account-wise browser cache me rehte hain. Reload/sign-in par wahi pending changes dobara compare hote hain. **Local save fail** hone par inline draft sirf memory me ho sakta hai: backup/retry ke bina page band/reload na karein. Bill/Paste modal ka failed save draft khula rakhta hai aur half-updated rates/log roll back karta hai. Failed destructive actions displayed data ko roll back karte hain.

## Conflict aaye to

- Alag devices ki **alag entries** automatically judti hain. Ek entry par non-conflicting field changes bhi jud sakte hain.
- Same financial field ke alag amounts, salary edit-v-delete, employee delete ke saath nayi salary, ya amount-v-payment inconsistency par sync **rukta hai**. Clock/time ko dekhkar financial winner choose nahi hota.
- Dialog me **device aur cloud ke conflicting values** dekhein. **Device ki conflicting values** / **Cloud ki conflicting values** ka selection sirf matching conflicts par hai; independent rows ko discard nahi karta. Employee deletion select karna us employee ki dependent salary deletion bhi hai.
- Choice ke waqt server dobara read hota hai. Conflicting values tab tak badal chuki hon to fresh choice aayegi.
- Suspicious empty/legacy-missing/demo cloud par **Bacha data safely cloud me jodo** additive recovery hai, blind full replacement nahi. Agar isme actual financial conflict ho to doosra choice dialog aayega.
- Dialog band karne par sync paused rehta hai. Banner/Settings → **Resolve safely** se wapas kholein. Pehle current JSON download kar sakte hain.

## Jo data pehle hi gayab ho chuka hai

Settings → **Data safety copies** me is browser/account ki available copies dekhein:

- **JSON backup**: pehle copy download karke rakh lein.
- **Missing data jodo**: current data me missing rows jodta hai; existing matching conflicting values ke liye current side ko rakhta hai. Matching salary me missing advances/deductions bhi jud sakti hain—totals verify karein.
- Current data export aur purane JSON ka **Restore** bhi available hai. Restore ek replacement operation hai; pehle current JSON lein, phir cloud conflict/status check karein.

v3.17 local delete/restore/import, cloud adoption/write aur conflict resolution se pehle safety copies banata hai. **Maximum 3 distinct copies per account/browser**, space kam ho to purani copies kam ho sakti hain. Full storage par required safety copy save nahi hui to overwrite rukta hai. Repeated bill-photo strings losslessly deduplicate hoti hain; storage unlimited nahi hai.

**Ye copies v3.17 use karne ke baad se banti hain.** Agar purane bug ne har device/cloud ko pehle hi overwrite kar diya, aur koi surviving device, JSON, safety copy ya provider/database backup nahi hai, to app purana data invent/recover nahi kar sakti. Surviving device ko clear mat karein; pehle backup lein. Is release me kisi real customer Supabase project ka data inspect/restore nahi kiya gaya.

## Developer note: bug aur fix

Purana login sirf `payload.workers.length` se cloud ko populated maanta tha. Canteen-only account (0 employees, real bills) ko empty samajhkar fresh-device demo data ka unconditional `upsert` ho jata tha. Original device agle pull me replacement adopt kar leta tha. Remote adoption bhi dobara save/push schedule kar sakti thi.

v3.17:

- Salary, canteen entries/rates/activity aur custom settings data detection; demo flags akele evidence nahi. Untouched generated sample ka signature pehchanta hai; real changes ko sample samajhkar discard nahi karta.
- First login: read + validate, **no unconditional upsert**. Account/project-specific durable working copy + baseline + dirty state. Existing main key `hisaabPro.v1` unchanged; exports ordinary JSON hi hain.
- Three-way field/ID merge. Known baseline se deliberate deletions; unknown absence deletion proof nahi. Legacy partial collections preserve/repair hoti hain. Financial and dependency guards prevent silent clamping/orphaned salaries.
- Single-flight sync, read-before-write, `UPDATE ... WHERE user_id = ... AND updated_at = observed` (legacy null stamp: `IS NULL`), missing row par unique-key `INSERT`. Lost race par re-fetch/re-merge; failure ko success ACK nahi milta. `_sync` metadata revision/version + explicit-clear/deleted-collection intent deta hai, financial totals ka hissa nahi.
- Client/user/scope/session epoch + persisted account-owner guards. Logout/account switch queued/late responses ko current account par apply nahi karte. In-flight successful/new edits dobara sync hote hain; in-flight failed saves ko synced nahi maana jata.
- Remote adoption/migration/theme renders echo uploads nahi banate. Online/focus/visibility aur periodic retries; open editors par background pull avoid hota hai.
- Local transaction rollback best-effort hai, browser storage finite hai. Local cache account-scoped hai, encrypted vault nahi; shared/untrusted browser ko authenticated isolation ka substitute na samjhein.

No salary/canteen schema reset, existing data-key change, PDF/font/template/WhatsApp-format change required.

## Attendance sync extension (v3.19)

- `payload.attendance` contains independent `managers`, `records`, `history` and
  `settings`; salary employees/records are not reused or recalculated. An
  Attendance-only/rules-only account counts as real populated data, not demo/empty.
- Stable IDs plus the natural key **manager ID + date + Day/Night shift** prevent
  duplicate marks. Independent records merge. Identical marks created under
  different IDs deduplicate; differing statuses for the same natural key require
  an explicit device/cloud choice. A note edit may merge with an independent
  clock edit, but competing clock spans/breaks/day offsets are chosen atomically.
- Manager deletion versus new/edited dependent attendance asks before keeping or
  removing the profile and records together. Duplicate codes, moved-key collisions,
  orphan references, invalid dates/clocks/rules/history and corrupt payloads block
  unsafe adoption/write. Global rule conflicts remain explicit; saved per-record
  rule snapshots are retained.
- An older/partial payload that omits Attendance collections is **not proof of
  deletion**. Known collections/rules/history are preserved; suspicious unproven
  empty collections pause for additive recovery. A proven deliberate deletion
  still propagates. **All devices must update**: old clients are not server-blocked
  and do not understand this new module.
- Same JSON backup, account-scoped pending/base cache, recovery copies and
  read-before-write/CAS apply. Local saves validate and roll back the whole
  Attendance operation on failure. Open dialogs block remote replacement;
  stale item/account/disk baselines block Attendance form saves. Account/project
  switching clears Attendance UI/editor state and pending report links.
- Existing old JSON backups **without** `attendance` keep the current Attendance;
  explicit full wipe includes it and retains a safety copy. Canteen-only erase,
  loading sample data and clearing sample data do not remove Attendance.
- Automatic local Attendance safety copies/checkpoints share the existing
  **maximum 3 distinct copies** and finite browser storage. History keeps the most
  recent **2,000 actions**; neither is an external or tamper-proof backup.

`cloud.test.js` now has **99 checks**, including 23 Attendance merge/race/recovery
scenarios; `attendance.test.js` adds 170 calculation/UI/storage/export checks (including 12-hour round-trips).
Real Chromium form/reload/download QA is separate. Tests use disposable fixtures
and a deterministic mock backend, **not** customer Supabase credentials/live RLS
or physical phones. See [tests](tests/README.md).

## Supabase setup (sirf pehli baar / permissions error par)

**Already login chal raha tha? Existing project/table ko delete/recreate mat karein.** v3.17 wahi `hisaab_data` table, `user_id`, `payload`, `updated_at` columns use karta hai. `user_id` unique/primary key hona chahiye, `payload` JSON/JSONB, `updated_at` timestamp; authenticated own-row **SELECT, INSERT aur UPDATE** allowed hone chahiye. Missing SELECT ko app empty cloud nahi maanti—error par writes stop hoti hain.

Naye project ke owner ke liye minimal starting SQL (Supabase SQL editor; **existing policies ko review karke**):

```sql
create table if not exists public.hisaab_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz default now()
);
alter table public.hisaab_data enable row level security;

-- Run once on a NEW table. Existing same-name policies ho to pehle inspect karein.
create policy "hisaab_select_own" on public.hisaab_data
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "hisaab_insert_own" on public.hisaab_data
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "hisaab_update_own" on public.hisaab_data
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.hisaab_data to authenticated;
revoke all on public.hisaab_data from anon;
```

Policies permissive hoti hain: koi existing `USING (true)` policy all users ko data na khol rahi ho, ye project owner verify karein. Existing schema/trigger ko bina backup change na karein. `updated_at` ko concurrent writes par change hona chahiye; client supplied next stamp ya server trigger ka returned stamp compare-and-set ke liye use hota hai.

App Settings me Project URL aur **anon/publishable public key** browser me configure hoti hai. **Service-role/secret key, database password ya apna email password chat/Git/repo me na daalein.** Password sirf apne HISAAB/Supabase login form me use karein. Email confirmation enabled ho to pehle inbox link verify karein. Same email alag Supabase projects me alag data hota hai.

Verification: `cd tests && npm ci && npm test`. Cloud tests independent browser stores + deterministic fake RLS-scoped server use karte hain, real credentials/customer data nahi. Browser smoke QA Chromium ke desktop/mobile-size alag browser processes par mock backend se ki gayi; physical phone/live customer backend QA ka claim nahi hai.
