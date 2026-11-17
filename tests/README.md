# Hisaab Pro — tests (developer only)

Ye folder **app ke liye zaroori nahi**. `hisaab_v3.html` / `Hisaab-Pro-v3.18.html` akeli file me chalti hai —
kisi install ki zaroorat nahi. Ye tests sirf tab chalao jab code me change kiya ho aur check karna ho
ki **Canteen module**, salary, PDF, loader aur **cross-device cloud sync** toot to nahi gaye.

## Chalane ka tarika

```bash
cd tests
npm ci               # lockfile se jsdom install hota hai
npm test             # 537 checks: canteen 406 + loader 29 + PDF 26 + cloud 76
node canteen.test.js ../Hisaab-Pro-v3.18.html   # kisi aur file par chalana ho
node loader.test.js  # sirf index.html loader ke tests
node pdf.test.js     # fonts + bottom geometry + multi-page
node cloud.test.js   # fake backend + independent browser stores, 76 sync checks
HISAAB_HTML=../Hisaab-Pro-v3.18.html node cloud.test.js  # exact release bhi check karein
node pdf.test.js --artifacts ../.cache/pdf-qa # optional local sample PDFs
```

Sab theek ho to aakhri line aati hai: `✅ SAB CHECKS PASS` / `✅ LOADER SAB TESTS PASS`

## Kya-kya test hota hai

| Area | Checks |
|---|---|
| PDF summary labels (v3.18) | screenshot ke Bikri/Kharcha labels blank, zero aur nonzero amounts same right-aligned positions par; saare 6 templates ke day/month drawing ops v3.17 se identical (sirf 2 labels/version differ); print + WhatsApp PDF bhi same; app labels/data unchanged |
| Safe cloud sync (v3.17) | canteen-only/records/rates/log/settings-only login, demo suppression, stale demo flags, no echo, independent changes + first-insert/CAS races, financial/worker-delete-v-salary/payment conflicts, exact-value re-approval, in-flight edits/save failures, offline reload + online retry, legacy missing/empty snapshots, RLS/read/write failures, null stamp, account/project/logout/late-session guards, cross-tab stale writes, corrupt JSON/cache, quota rollback, photo dedup, scoped recovery, no fake success, modal baseline guard |
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
| Canteen-only wipe | sirf canteen erase, workers safe, undo |
| Regression | hisaab / ledger / workers / records / dashboard pehle jaise |

Font analysis, embedding notices aur locally licensed input se rebuild: [`PDF-FONTS.md`](../PDF-FONTS.md).
PDF fixtures optionally `.cache/` me bante hain; Git me nahi jaate.


## Cloud test setup aur limits

`cloud.test.js` independent jsdom browser stores ko ek deterministic, RLS-scoped fake Supabase server se connect karta hai. Har account ka row alag; reads/writes/auth ko delay/fail kar sakte hain. Compare-and-set filter, unique insert race, pending disk cache aur exact payloads assert hote hain—sirf status text nahi. Har test ke timers/windows close hote hain aur **saare browsers** ke runtime errors aggregate hote hain.

Tests **real Supabase project, email password ya customer data** use nahi karte. Physical devices/live RLS config ka test nahi hai. Chromium smoke QA do separate desktop/mobile-size browser processes, real UI login/entry forms, offline reload, reconnect+merge, financial conflict choice aur recovery list par mock backend ke saath ki gayi. Optional browser/PDF artifacts `.cache/` me hain, Git me nahi.

Existing project ko reset nahi karna; update/recovery, backend schema + RLS expectations aur known limits: [`CLOUD-SYNC.md`](../CLOUD-SYNC.md). **Sab clients update karein**—old cached clients ke unsafe writes ko is client-side fix se server par reject nahi kiya ja sakta. localStorage rollback best-effort/finite hai, historical backup ka substitute nahi.
