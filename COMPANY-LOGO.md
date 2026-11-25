# Hisaab Pro v3.29 — ek logo upload, sabhi naye PDFs

**Current panel v3.32:** separate [Stock Management](STOCK-MANAGEMENT.md) tab added.
Product photos company logo ko replace nahi karti; saved logo PDF resource aur
previous report rules retained. Logo dobara upload nahi karna.

**v3.31:** saved Canteen parties aur combined From Date / To Date ×
Party PDF selection. Six themes me sirf matching data; har direct-PDF continuation
par wahi saved logo. Removed Bikri/Kharcha columns stay removed. Logo handling,
item prices/occurrences and financial/Attendance data retained; saved logo ko dobara
upload nahi karna. [Date / Party instructions](CANTEEN-REPORTS.md).

## Kaise use karein

1. Jis browser/site par asli data hai, pehle **Settings → Backup (JSON)** lein.
2. Panel **v3.31** (ya newer) kholein. **Settings → Company logo → Upload logo** dabayein.
3. **PNG, JPG/JPEG ya WebP**, maximum **5 MB**, chunein. Preview aur **“Logo saved”** aane par logo automatically save ho gaya; alag **Save settings** zaroori nahi.
4. Ab normal PDF download/share karein. Har baar image select karne ki zaroorat nahi.

**Change logo** se replace karein. **Remove logo** confirmation ke baad sirf naye
reports se logo hatata hai; salary, Canteen aur Attendance entries nahi mitti.
Upload fail/cancel hone par pehle se saved logo aur original data rakhe jaate hain.
Doosre tab/account ka data badle ya local save pending/fail ho to naya logo save
rok diya jata hai; pehle backup/status check karke reload/retry karein.

## Kahan automatic aayega

| Report | Saved logo |
|---|---|
| Individual Employee salary statement | Har generated PDF page |
| Full payroll / monthly summary + Employee statements | Har generated PDF page, continuation samet |
| Canteen day / month / Date × Party ledger, saare six templates | Har generated PDF page, repeated-item continuation samet |
| Canteen / Attendance WhatsApp PDF file | Wahi saved logo; existing share/manual-attachment flow |
| Attendance individual / monthly / custom-date PDF | Har generated page; Hindi text/images bhi retained |
| Salary + Canteen browser print / Save as PDF | Har report ka business header |

Purani downloaded/shared PDF apne aap edit **nahi** hoti. Logo add/change/remove
ke baad **nayi PDF dobara download** karein. Excel aur CSV me images nahi jodi
gayi; unke original details/numeric values unchanged hain. Attendance ki readable
**maximum two-page** safety ab bhi lagu hai; oversized selection ke liye complete
Excel ya shorter PDF date range use karein.

## Save, backup aur doosra device

- Logo existing **Settings** me ek optional `companyLogo` value hai. Purana JSON
  bina is field ke seedha khulta hai; opening se koi financial migration/write nahi.
- Saved image browser ke local data me rehti hai; same site/browser par reload
  ke baad bhi available. Already-open standalone panel bina internet branded
  PDFs bana sakta hai. Remote image link/CDN/logo hosting ki zaroorat nahi.
- **JSON backup me logo included hai.** Us backup ko restore karne par upload
  dobara nahi chahiye. Browser data clear/Erase all data karne se local logo bhi
  hat sakta hai; backup sambhal kar rakhein. Logo se purana backup us image ko
  contain nahi karega.
- Agar existing cloud sync configured hai, same project/account par logo bhi
  Settings ke saath sync hota hai; nayi table/account/service nahi chahiye.
  **Cloud synced** confirm karein. Local save ko cloud ACK na samjhein.
- Do devices alag logos replace/remove karein to existing conflict review me
  explicit local/cloud choice mangi jaati hai. Logo ek atomic setting hai; parts
  ko mila kar kharab image nahi banayi jaati. Removal explicit empty string hai.
- Branding dekhne ke liye sabhi active devices/tabs ko **v3.30** par update karein.
  Logo support v3.29 se hai; v3.28 aur usse purane clients ke PDF generators me ye feature nahi hai.

## Image handling aur unchanged data

Uploads browser me decode/re-encode hote hain: proportion retained, transparent
background **white**, maximum **640 px** long side aur bounded JPEG data URL
**120,000 characters** (image payload under 90 KB). Large pixel dimensions,
unsupported/corrupt/empty files aur failed encoding/storage report hote hain;
SVG, PDF, arbitrary URL ya active markup ko logo ki tarah store/run nahi kiya jata.
Original upload metadata/EXIF ko report me forward nahi kiya jata.

Shared PDF writer image ko document me **ek baar** embed karta hai, phir har page
par proportional header slot me draw karta hai. Company/name/address aur continued
Attendance date header us slot ke bahar rehte hain. Hindi Attendance text ke
JPEG/Unicode ActualText resources isi single XObject dictionary ke saath coexist
karte hain; duplicate dictionaries ya UTF-8-corrupted xref offsets nahi.

Salary/paid/advance/bonus math, original repeated Canteen lines and own prices,
Attendance clocks/day flags/Sundays/monthly bonus, five-sheet Excel, record IDs,
storage keys, normalization, cloud protocol, recovery, panel stylesheet aur
embedded fonts/licenses unchanged. **No AI integration added.**

## Verification

- `npm test --prefix tests`: existing regressions plus **63 logo + six additional
  cloud checks**; real native decode/canvas is separately covered in Chromium.
- `npm run test:logo:browser --prefix tests`: real chooser, PNG/JPG/WebP, preview,
  auto-save/reload/replace/remove, 320/390px controls, corrupt/large/SVG errors,
  actual quota rollback, backup/restore, offline PDFs, all six Canteen templates,
  salary/payroll/120-advance continuation, 100 original Canteen rows, wrapped
  business headers and two-page/Hindi Attendance; actual download/share File bytes.
- Native print/share destinations are stubbed. No physical-phone, Safari,
  actual WhatsApp delivery, desktop Excel or live customer cloud-backend claim.

See [PDF fonts](PDF-FONTS.md), [Attendance](ATTENDANCE.md),
[safe cloud/recovery](CLOUD-SYNC.md) and [test guide](tests/README.md).
