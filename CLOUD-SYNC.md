# HISAAB v3.22 — safe login, device sync aur recovery

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
clients to v3.22**: earlier clients can reject/stop syncing a span over 24 hours;
there is no automatic rewrite into shorter records.
[Attendance guide, Sunday date rules and backup advice](ATTENDANCE.md).

## Pehle ye karein (existing users)

1. **Jis phone/laptop par asli data abhi dikh raha hai, uska Settings → Backup (JSON) download karein.** Salary, canteen aur saved Attendance sab isi backup me aate hain. Doosre device par bhi bacha data ho to uska alag backup rakhein.
2. **Dono devices aur saare purane tabs par v3.22 kholein:**
   [Hisaab-Pro-v3.22.html](https://akash4447777-dev.github.io/hisaab-pro/Hisaab-Pro-v3.22.html).
   Sidebar me **Panel v3.22** confirm karein. Browser/site storage clear, uninstall, “Erase all data” ya “Sample data” mat karein.
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
- Same financial field ke alag amounts, salary edit-v-delete, worker delete ke saath nayi salary, ya amount-v-payment inconsistency par sync **rukta hai**. Clock/time ko dekhkar financial winner choose nahi hota.
- Dialog me **device aur cloud ke conflicting values** dekhein. **Device ki conflicting values** / **Cloud ki conflicting values** ka selection sirf matching conflicts par hai; independent rows ko discard nahi karta. Worker deletion select karna us worker ki dependent salary deletion bhi hai.
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

Purana login sirf `payload.workers.length` se cloud ko populated maanta tha. Canteen-only account (0 workers, real bills) ko empty samajhkar fresh-device demo data ka unconditional `upsert` ho jata tha. Original device agle pull me replacement adopt kar leta tha. Remote adoption bhi dobara save/push schedule kar sakti thi.

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
  `settings`; salary workers/records are not reused or recalculated. An
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
