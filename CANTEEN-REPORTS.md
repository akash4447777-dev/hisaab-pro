# Hisaab Pro v3.32 — Saved parties + Date × Party PDF

**v3.32:** alag [Stock Management](STOCK-MANAGEMENT.md) tab added. Canteen saved
parties, combined date × party selection, six templates, logo, individual original
item lines aur seven-column ledger retained; Stock operations Canteen amounts ya
entries nahi badalti. Neeche v3.31 se available Canteen workflow wahi hai.

## 1. Party ka naam ek baar save karein

1. Apne asli data wale **same browser/site** par Settings → **Backup (JSON)** lein.
2. Latest panel refresh karke **Panel v3.32** confirm karein. Storage clear / entries re-enter na karein.
3. **Canteen → Parties** kholein, party ka naam likhein aur **Save party** dabayein.
4. **Canteen entry** me saved-party dropdown se naam chunein. Party row ka **＋ Entry** bhi wahi naam preselect karta hai. Phone par wide table ko sideways scroll karke row actions dekh sakte hain.

Naam save karne se koi dummy bill, amount, payment ya Attendance record nahi banta.
Zero entries wali party bhi reload ke baad available rehti hai. Naam ke starting/ending
spaces, repeated spaces aur letter-case se duplicate parties nahi banti. Saved naam
1–90 characters ka hota hai; blank/invalid name ya failed storage par save success nahi dikhayi jati.

Purani entries ki free-text parties bhi dropdown/list me milengi. **Save name** se
unhe entries delete hone ke baad bhi yaad rakh sakte hain. Entry ka optional free-text
field retained hai. Purani spelling, IDs, bills, dates, prices aur amounts ko mass-rename
nahi kiya jata. Is release me party rename/delete ya entry-party-ID migration nahi hai.

## 2. Date aur party ko ek saath select karke PDF

1. Canteen me **PDF · Date / Party**, din/mahine ka **PDF**, **WhatsApp PDF** ya **Print** dabayein.
2. **From Date** aur **To Date** chunein. **Dono boundary dates included** hain. Ek din ke liye dono me wahi date chunein; range alag mahine/saal me bhi ja sakti hai.
3. **Party Selection** me party chunein:
   - **All parties** = selected dates ki sab parties.
   - **No party / unassigned** = blank/whitespace party wali entries.
   - **Party: [naam]** = sirf us naam ki party; case/extra-space variants saath aati hain.
4. Preview me dates, selected naam, matching entries/days aur **Saman / Paid / Baki / Net** check karein.
5. Six PDF designs me se design chunein; **Download PDF**, **WhatsApp PDF**, ya **Print / Save as PDF** karein.

**Date × Party intersection hi export hota hai.** Kisi aur party, range ke pehle/baad,
ya invalid-calendar-date ki entries aur unka paisa report me nahi aata. Din-wise ledger,
entry/bill/note details, original item occurrences, party summary aur closing totals
sab usi matching selection se bante hain. Screen ke search/type filters alag hain;
PDF dialog ka **From / To / Party aur uska preview** final PDF selection hai.

Invalid/blank/reversed dates, stale/unknown party aur **no matching entries** par output
rok diya jata hai. Chupke se All parties ya poora month export nahi hota. Agar kisi
asli party ka naam hi “All parties” hai to woh **Party: All parties** option hai, unrestricted
**All parties** se alag. Party ke PDF shortcut me naam preselected hota hai; dates editable hain.

## 3. Purane PDF features retained

- Saved company logo automatically included; dobara upload nahi karna. Direct PDFs me har continuation page par proportional logo.
- Same item ke do 500g rows **do alag 500g rows**, apne original rate/amount aur bill reference ke saath. Grand totals sahi judte hain.
- Seven-column ledger **Date | Din | Entries | Saman | Net | Paid | Baki**; removed Bikri/Kharcha PDF columns/summary slots wapas nahi aate. Original sale/expense entry types aur arithmetic retained.
- Hindi party/item/note ke liye bundled shaped-text renderer; print me bundled Indic font pehle choose hota hai, empty Latin-subset glyphs nahi. Bundled fonts ready na ho to direct PDF refuses instead of silently dropping the text. PDF viewers ki image-backed copy/search support vary kar sakti hai.
- Filename me selected ISO dates aur portable party label hota hai. Pure non-ASCII naam ke liye `Selected_Party.pdf` suffix ho sakta hai; PDF ke **andar asli Hindi naam** rehta hai.
- New report generation read-only hai. PDF design change sirf existing saved design preference ko update karta hai. Already-downloaded PDFs ko naye filters nahi lagte—**naya PDF download** karein.

## 4. WhatsApp: genuine file ya explicit manual attachment

Supported browser native share sheet ko actual selected **PDF File** milti hai.
Recipient aur final Send aap choose/confirm karte hain. Share cancelled ho to forced
download/send nahi hota. Unsupported/rejected file sharing par same selected PDF
download hoti hai aur manual instructions/link milta hai: **WhatsApp → Attach → Document**.
Link apne aap PDF attach/send nahi karta; panel delivery ka false success claim nahi karta.

## 5. Backup, sync, erase aur recovery

Saved names optional `settings.canteenParties` map me rehte hain; existing storage keys,
backend/table aur entry party strings retained. JSON backup/restore, same-account scoped
pending cache/cloud merge aur safety copies catalog include karte hain. Saved-party-only
account bhi real data count hota hai. Missing field wala old cloud/JSON payload existing
catalog ko silently clear nahi karta; explicit empty map deliberate clear hai. Malformed
catalog overwrite se pehle refuse hota hai. **Local saved** cloud acknowledgement nahi hai.

Canteen-only erase confirmation me saved parties ka count bhi aata hai; erase se entries,
rates, activity **aur saved parties** clear hoti hain, salary/Attendance/logo nahi. Prior
safety copy aur Undo retained; baad me add hui nayi party ko catalog Undo overwrite nahi
karta. Settings → Data safety copies → **Missing data jodo** missing names recover karta hai,
current names/financial values retained. Full reset/account switch apne existing scope
rules follow karte hain. Stale form, account/data/tab changes ya unconfirmed local save
par save/export blocked hota hai—close, check backup/status, reload, dobara select karein.

Har editing device/tab par v3.31 use karein. Old versions/safety notices:
[CLOUD-SYNC.md](CLOUD-SYNC.md) · [Company logo](COMPANY-LOGO.md) · [Attendance](ATTENDANCE.md).

## Verification (developer evidence)

- Exact release: **1,203 offline checks**, including **102** new party/report checks and **126** synthetic-cloud checks (**17** added for this feature).
- **515 native Chromium checks**: filters 130 + existing lines 49 + PDF columns 106 + logo 78 + Employee 26 + Attendance 126. Real chooser/import/downloads, shared File bytes, filtered print, Hindi, offline, blocked storage, recovery, 320/390px forms; share/print destinations stubbed.
- Independent PyMuPDF/openpyxl: **185 PDFs / 288 pages / 10 XLSX** (one legacy-bug reproduction included), all PDFs unrepaired/rendered/in bounds; 52 combined-selection outputs, 160 exact selected ledger rows, 120 proportional non-overlapping direct-PDF logo pages; 100 original lines over six pages, Hindi print glyphs/ActualText, all five workbook sheets and blank manual Advances.
- Main script: 557 pre-existing statements, **536 byte-identical / 21 enumerated hooks changed**, plus 43 bounded feature-module statements. Reversing 38 exact integration edits/removing the module recovers the entire immutable v3.30 source. Original stylesheet, embedded fonts/license and all 33 pre-existing archive/legacy HTML files unchanged.
- No live customer backend, physical phone/Safari/desktop Excel or actual WhatsApp-delivery claim. See [tests/README.md](tests/README.md).

`Hisaab-Pro-v3.31.html` = `hisaab_v3.html`, **1,047,678 bytes**.
SHA-256: `e77b65440b0f93216f055442232426a785862a25b34899cf0eefe82b66f77e51`.
