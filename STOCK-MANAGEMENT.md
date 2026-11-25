# Hisaab Pro v3.33 — Stock Management

Stock Management existing Hisaab panel ka **alag tab** hai: products/photo, Stock In,
purpose-wise Stock Out, customer-wise Sales, live availability, date-wise history,
changes ka audit aur minimum-stock warnings. **Available quantity manually adjust
nahi karni**; har saved transaction se balance apne-aap calculate hota hai.

## 1. Pehli baar

1. Jis **same browser/site** par asli data hai, Settings → **Backup (JSON)** download karein.
2. Updated panel me **Panel v3.33** confirm karein. Storage clear, entries re-enter
   ya company logo dobara upload karne ki zaroorat nahi.
3. Sidebar → **Stock Management** kholein. Phone par upar navigation ko sideways
   scroll kar sakte hain. Keyboard shortcut: **g**, phir **i**.
4. **Add product** dabayein: unique product name, unit (pcs / kg / metre…), date,
   opening quantity aur minimum-stock limit bharein. Photo aur note optional hain.
5. **Save product** ke baad product aur, opening quantity positive ho to, usi date
   ki **Opening / Stock In** entry save hoti hai. Zero opening par fake entry nahi banti.

Photo camera/gallery se PNG, JPG ya WebP ho sakti hai, maximum **5 MB** input.
Browser ise locally bounded JPEG me compress karta hai; koi image-upload service
nahi. Invalid image par purani photo/data retained. Photo choose karna abhi draft
hai—**Save product** ke bina save nahi hota. Company logo alag rehta hai.

## 1a. Purane panel se available stock lana (v3.33)

**Yeh opening-stock snapshot hai, purane receipts / Out / Sales ka history nahi.**
Old panel me jo available quantity hai wahi chosen cut-over date ki Opening banti
hai. Box ko box, pcs ko pcs rakhein—pack size ya box → pcs conversion guess nahi hoti.

1. Pehle same asli-data wale browser/site par **Settings → Backup (JSON)** lein aur
   **Panel v3.33** confirm karein. Same account/project use karein; storage clear na karein.
2. **Stock Management → Import stock** → apni prepared `.json` / UTF-8 `.csv` file chunein.
   **Partial opening file ko Settings → Restore me mat daalein**; woh whole-backup
   replacement hai. Stock importer full Settings backups accept nahi karta.
3. **Opening / cut-over date** khud chunein. Date blank se shuru hoti hai; screenshot
   filename / today ko original stock date nahi maana jata. Snapshot lene ke baad hui
   movements ko double-count na karein; actual physical stock/date reconcile karein.
4. Poora preview dekhein: **name, quantity, unit, note/photo, New / Skip / Blocked**.
   Phone par opening quantity/unit aur result naam ke neeche bhi dikhte hain; full
   table ko sideways aur vertically scroll kar sakte hain.
5. Review checkbox tick karke **Import new products** dabayein. Saare new products +
   positive dated openings **ek atomic save** me aate hain, har row ka Before → After
   audit aur file-name provenance ke saath. Zero-stock products bhi rehte hain, bina
   fake zero movement ke. Pehle valid safety copy save na ho sake to import blocked.
6. Product-wise live quantities verify karke naya **Backup (JSON)** lein. Configured
   cloud ho to **Cloud synced** confirm karein, phir doosra updated device kholein.
   Same batch ko alag offline devices par saath import na karein; same-name creations
   conflict bana sakti hain.

**Existing records kabhi overwrite / double-add nahi hote.** Normalized same-name +
exact same-unit product **skip unchanged** hota hai, file ki quantity alag hone par
bhi; preview actual existing balance batata hai. Same-name + different unit par
**poora batch blocked**, partial import nahi. File ke duplicate names (case / extra
spaces samet) refuse hote hain. Sab rows existing hon to strict no-op. Cancel / bad
file / failed save se confirmed inventory aur financial data unchanged rehte hain;
stale account/tab/edited preview ko fresh open + review chahiye.

Maximum **5 MB / 2,000 rows**. CSV header: `name,quantity,unit`; optional `minQty,note,photo`.
Quoted commas, doubled quotes, multiline notes, BOM / CRLF supported; unknown or
duplicate columns refused. Names ≤90 characters, units ≤18, notes ≤500. Numeric
quantities use the same nonnegative / 3-decimal bounds as ordinary Stock.
`minQty` absent/blank ho to **0** (warning off)—yeh unknown historical minimum ko
invent nahi karta. Unit labels file se exactly retained; spelling aliases ko
prepared file me explicitly review karein. Optional photo sirf bounded embedded
JPEG data URL hai, external URL / SVG nahi; ordinary Add product photo chooser alag hai.

JSON shape (generic example only; `minQty`, `note`, `photo` optional):

```json
{"format":"hisaab-stock-opening","version":1,"rows":[
  {"name":"Example product","quantity":12,"unit":"box","minQty":0,"note":"Opening snapshot"}
]}
```

**CSV example** button generic template download karta hai, customer inventory seed
nahi karta. Release / public tests me private catalogue ya screenshots bundled nahi.
Selected file browser me parse hoti hai; koi third-party file/image-upload service
nahi. Saved Stock records normal existing account-cloud sync me shamil hote hain.
Import purana salary, Attendance, Canteen, saved parties ya company logo replace nahi karta.

## 2. Stock In, Stock Out aur Stock Sale

| Action | Kya bharein | Quantity par asar |
|---|---|---|
| **Stock In** | Product, quantity, date; supplier/party aur note optional | Quantity add |
| **Stock Out** | Product, quantity, date aur **purpose zaroori** | Quantity subtract |
| **Stock Sale** | Product, quantity, date, **party/customer, salesperson aur delivery-person name zaroori** | Quantity subtract |

Sale me delivery phone aur address / vehicle / gate details bhi likh sakte hain.
Product row ke **In / Out / Sale** shortcuts wahi product pehle se select karte hain.
Har transaction ek product ki hoti hai; alag products ke liye alag entries karein.
Is tab me pricing, invoice, payment ya salary/Canteen financial write nahi hai.

**Formula:**

```text
Opening Stock + Stock In − Stock Out − Stock Sales = Available Stock
100 + 25.5 − 10.25 − 20 = 95.25
```

Opening khud ek dated Stock In entry hai; formula me do baar count nahi hota.
Har product apni unit me calculate hota hai—kg aur pcs ka misleading combined
quantity total nahi. Quantity maximum **3 decimal places**: `0.001`, `10.25`,
`25.5` allowed; minus, comma, exponent aur extra decimals refused. Har entry / minimum
limit maximum `999999999.999`; safe aggregate ceiling `999999999999.999`.

**Poora dated ledger validate hota hai**, sirf final balance nahi. Backdated Sale/Out
baad ki receipt se stock borrow nahi kar sakti. Receipt edit/delete se kisi bhi
subsequent date par stock negative hoga to operation refuse hota hai; previous
saved data unchanged. Ek hi date ki entries stable saved order me chalti hain.
Future-dated saved entries bhi inventory me included hain; ye reservations ya
"sirf aaj tak" view nahi hai.

## 3. Live availability aur minimum warning

- **Products & Live Stock** me opening + In, Out, Sales, Available, Minimum aur status.
- **Available all saved dates ka balance hai**, History ke date filters ka partial
  result nahi. Phone par primary available/minimum product naam ke neeche bhi dikhta hai.
- Available **minimum se strictly neeche** ho to automatic warning, low-stock count
  aur navigation badge. Equal minimum par low warning nahi.
- **Low stock only** / **View low stock** se warning wale products dekhein.
- Minimum `0` rakhne se us product ka low-stock warning disable. Zero availability
  phir bhi **Zero stock** dikha sakti hai.

## 4. Stock History, search aur combined filters

**Stock History** me har Opening / In / Out / Sale ki date, product, quantity,
transaction ke baad balance, party, purpose aur complete sales/delivery details.
Newest/oldest ordering aur **Previous / Next** pages se poori history available hai.

Product, **Party / customer**, **Salesperson**, **From Date**, **To Date** aur entry
type ko saath select karke **Apply filters** dabayein. Dono date boundaries included.
Top search product, party, salesperson, delivery details, purpose aur notes me
search karta hai aur filters ke saath combine hota hai. Invalid/reversed date range
error dikhata hai; secretly all data nahi dikhata. **Reset** se filters/search clear.

Products tab all-time inventory hai; party/salesperson/date/type filters History
ke liye hain, available quantity ko manually change nahi karte. Product row ka
**History** shortcut us product ki entries kholta hai.

## 5. Edit / delete aur Change Audit

- Product **Edit** se naam, date, minimum, note/photo badlein; available quantity ka
  manual field nahi. Movements wale product ki unit badalna refused—automatic
  kg↔pcs conversion nahi hoti.
- Opening quantity sudharni ho to **Stock History → Opening entry → Edit** karein.
- Har entry **Edit / Delete** ho sakti hai; save/delete ke baad complete inventory
  dobara calculate aur validate hoti hai. Delete confirmation cancel = no change.
- Product delete uski **saari dependent movements** bhi delete karta hai; confirmation
  me exact count dikhta hai. Current ledger se rows hatengi, audit se nahi.
- **Change Audit → Details** me who/when, action aur full **Before → After** snapshots.
  Deleted entries, previous product names/photos aur delivery details bhi retained.
  Audit ke dates **change ki date** par filter hote hain; History me entry ki date.

Audit app-level history hai, cryptographically tamper-proof compliance log nahi.
Original transactions apna entry-time product/unit/photo snapshot rakhte hain;
product rename/photo replacement purani history ko rewrite nahi karta.

## 6. Save, backup, recovery aur cloud

- Existing browser auto-save, **Settings → Backup (JSON)**, imports, configured
  same-account cloud aur **Data safety copies** me Stock/products/photos/audit included.
- Purane JSON/cloud me Stock field **missing** ho to current Stock retained. New
  backup ka explicit empty Stock deliberate clear ho sakta hai—pehle current backup.
- **Erase all data** Stock/photos/audit bhi clear karta hai aur confirmation me batata
  hai. **Sample data** existing Stock ko replace nahi karta. Canteen-only erase alag hai.
- **Missing data jodo** dependencies aur dated balances validate karta hai; invalid
  combination ko silently clamp/discard nahi karta. Existing browser/account ki
  safety copies limited hain—regular external JSON backups rakhein.
- Failed local save/quota/stale tab/account par success assume na karein; error padhein.
  Draft memory me ho sakta hai. Purane confirmed Stock/available/audit rollback rehte
  hain; successful pre-change safety copy alag se ban sakti hai.
- Saare editing devices/tabs **v3.33** par update karein. Local save cloud ACK nahi:
  doosre device par jaane se pehle **Cloud synced** confirm karein.

Independent devices ki compatible entries merge ho sakti hain. Lekin Stock 100 par
alag offline devices ki Sale 70 + Sale 50 milkar negative banati hain to **sync
pause** hota hai, silent overselling nahi. Affected product ka coherent product +
movement set choose karna padta hai; losing rows safety copies/audit me retained,
independent products merge hote hain. Conflicting values dekhein aur actual physical
stock reconcile karein. [Safe sync / recovery details](CLOUD-SYNC.md).

> Purana salary, Employee wording, Attendance clocks/hours/Sundays/bonus, five-sheet
> Excel, Canteen saved parties/combined date × party PDF, separate original item
> lines, seven-column ledger aur saved company logo retained. Re-entry/migration ya
> nayi backend table nahi. [Canteen](CANTEEN-REPORTS.md) · [Attendance](ATTENDANCE.md).

Developer validation/reproduction: [tests](tests/README.md). Native QA uses isolated
Chromium fixtures, not a customer backend or physical phone; no actual WhatsApp
delivery / Safari / desktop-Excel verification claim.
