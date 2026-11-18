# Hisaab Pro — auto-update system (v2.0)

> **Latest v3.24 — reference-style Attendance PDF, automatic extra bonus, four shifts and WhatsApp PDF:** supplied ledger-style split header, ruled summary, light table, full remarks, Sundays, totals/signatures and **maximum 2 readable pages**; oversized selection → full Excel / shorter dates, never hidden details. Morning / Afternoon / Evening / Night added; saved Day/Night retained. After arrival-day 11:45 PM: **3 qualifying OUTs → 1%, each further 2 → +1%**; full-calendar-month/all-shift basis, exact 11:45 excluded, next-morning included. PDF/Excel show count + percentage; no invented rupee bonus. [Attendance guide](ATTENDANCE.md).
>
> **Existing data/panel:** saved clocks/day flags, entries, history and salary/canteen data are not rewritten; panel stylesheet/fonts unchanged. This release is **not just export-only**: new shift enum values are supported, but bonus/report/share remain derived/read-only. Pehle JSON backup lein, same browser/site par **Panel v3.24** confirm karein, aur **sab devices/tabs update karein** (old clients reject new shifts). Storage clear mat karein. WhatsApp uses the device file-share chooser when supported; otherwise download + manual Document attachment, not automatic delivery. [Safe sync/recovery](CLOUD-SYNC.md).

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
> `Hisaab-Pro-v3.23.html` = usi ka release copy, taaki upar wala loader apne aap sabse naya version utha le.
> Dono ka content abhi **bilkul same** hai. Purane `Hisaab-Pro-v3.1.html` / `v2.0` repo me pade rehne do.

---

# Manager Attendance (v3.23) — kaise use karein

Sidebar → **Attendance** → **Add manager** → Tap/Time mode. Koi fixed hours ya
break deduction ya 24-hour cap nahi. Day/Night shifts aur same/next day morning/night controls
retained; **Sundays** me actual attended dates aur count. Calendar, ledger, bulk,
compact 1–2-page PDF/5-sheet styled Excel, auto-save aur limits: **[poora guide](ATTENDANCE.md)**.
Attendance salary calculations ko nahi badalta.

---

# 🍽 Canteen module (v3.1+, price-mode fix v3.2) — kaise use karein

Sidebar me **Canteen** dabao (ya keyboard par `g` phir `c`).

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

`tests/` folder me **730 offline checks** (canteen/salary, loader, PDF, cloud aur
Attendance) + optional **45 real Chromium checks** hain. App ke liye test dependencies
zaroori nahi. Commands, fixtures aur QA limits: [`tests/README.md`](tests/README.md).
