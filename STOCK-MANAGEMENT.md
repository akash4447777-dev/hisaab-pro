# Hisaab Pro v3.36 — Stock Management

Stock Management existing Hisaab panel ka **alag tab** hai: products/photo, Stock In,
purpose-wise Stock Out, customer-wise Sales, live availability, date-wise history,
changes ka audit aur minimum-stock warnings. **Available quantity manually adjust
nahi karni**; har saved transaction se balance apne-aap calculate hota hai.

## 1. Pehli baar

1. Jis **same browser/site** par asli data hai, Settings → **Backup (JSON)** download karein.
2. Updated panel me **Panel v3.36** confirm karein. Storage clear, entries re-enter
   ya company logo dobara upload karne ki zaroorat nahi.
3. Sidebar → **Stock Management** kholein. Phone par upar navigation ko sideways
   scroll kar sakte hain. Keyboard shortcut: **g**, phir **i**.
4. **Add product** dabayein: unique product name, unit (pcs / kg / metre…), date,
   opening quantity aur minimum-stock limit bharein. Photo aur note optional hain.
5. **Save product** ke baad product aur, opening quantity positive ho to, usi date
   ki **Opening / Stock In** entry save hoti hai. Zero opening par fake entry nahi banti.

Purana version khule ya **Import stock** button na dikhe to [normal panel link](https://akash4447777-dev.github.io/hisaab-pro/)
dobara kholkar refresh karein aur **Panel v3.36** dekhein. **Browser ka site data /
local storage clear na karein**—isse unsynced entries hat sakti hain.

Photo camera/gallery se PNG, JPG ya WebP ho sakti hai, maximum **5 MB** input.
Browser ise locally bounded JPEG me compress karta hai; koi image-upload service
nahi. Invalid image par purani photo/data retained. Photo choose karna abhi draft
hai—**Save product** ke bina save nahi hota. Company logo alag rehta hai.

## 1a. Purane panel se available stock lana (v3.33 file import)

**Yeh opening-stock snapshot hai, purane receipts / Out / Sales ka history nahi.**
Old panel me jo available quantity hai wahi chosen cut-over date ki Opening banti
hai. Box ko box, pcs ko pcs rakhein—pack size ya box → pcs conversion guess nahi hoti.

1. Pehle same asli-data wale browser/site par **Settings → Backup (JSON)** lein aur
   **Panel v3.36** confirm karein. Same account/project use karein; storage clear na karein.
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

## 1b. Private Add stock link — file choose kiye bina (v3.34)

Prepared **private stock link** ko **usi browser/site/account** me kholein jahan
asli Hisaab data hai. Link seedha current normal panel me complete stock preview
kholta hai—file chooser, JSON paste ya Settings Restore nahi. Configured cloud ka
initial login/sync complete hone ka wait hota hai; sign-in chahiye to normal panel
login karein. Account/local-browser label aur **poori names/quantities/units list**
review karke sirf **“Haan, … products jodo”** dabayein. **Abhi nahi / Close / Escape**
cancel karta hai. Link kholna ya preview dekhna save permission nahi hai.

Opening date link ki explicitly chosen policy se aati hai: **import-day** ka matlab
link-opening waqt ki **device-local date**, UTC ya screenshot date nahi. Login me
midnight nikal jaye tab bhi opening waqt ki date retained; confirmation se pehle
editable hai. Explicit calendar date bhi supported; unspecified date blank hi hai.
Ordinary CSV/JSON file import ab bhi blank date + review-checkbox wala flow hai.

Same-name/exact-unit **skip unchanged**, different-unit **whole batch blocked**,
zero-stock products, required pre-change safety copy, **one atomic save** aur har
new product/positive opening ka independent audit file-import jaise hi hain.
Reopen par existing quantities na overwrite hoti hain na double-add. Account/data/
disk badalne ke baad purana reviewed Add blocked; fresh link + review karein.

**Privacy:** catalogue public release me embedded nahi. Data URL ke **fragment**
(`stock-opening`) me local hand-off hai; panel ise bootstrap/cloud se pehle address
se hata kar locally decode karta hai. HTTP request/Referer me fragment nahi jata,
koi compression/image/upload service nahi. **Yeh encryption, expiring secret ya
account authorization nahi**—link paane wala inventory dekh/copy kar sakta hai;
forward, public issue/PR, screenshot ya URL-shortener me na daalein. Browser/history/
chat copies par control ki guarantee nahi. Sirf aapka explicit Haan current local/
configured account me ordinary saved Stock banata hai; local save cloud ACK nahi.

Modern Chrome/Safari ka local UTF-8/gzip support chahiye; unsupported/corrupt link
save nahi karta. Token maximum **131,072 characters**, expanded JSON **5 MB** aur
existing **2,000-row** limits; gzip expansion bounded hai. Initial open aur same-tab
hash navigation dono supported, late decoding/replaced forms safely cancelled.

Developer-only local creation (prepared manifest private hi rahe):

```bash
npm ci --prefix tests
node scripts/create-stock-link.js --input private-imports/opening.json --date import-day --output private-imports/add-stock.md
```

`--date` explicit `import-day`, `ask` (blank), ya `YYYY-MM-DD`; optional `--encoding raw`
for uncompressed hand-off. Actual current parser validates in an isolated offline
DOM. Script only writes owner-readable Markdown + URL text under ignored
`private-imports/`, never uploads/adds account data or prints the token. Current
same-origin versioned HTML target required; loader/root URL is not used. Do not
publish these private outputs or run a preview server serving the repository root.

## 1c. Message / screenshot se In, Sale ya Out

### Aasaan flow (v3.36): Message → Dekho → Save

**Ek-ek item bharna nahi. Ek poora message paste YA screenshot chuno. Chat mein
har message bhejna zaroori nahi; phone/WhatsApp apne-aap read nahi hota.**

1. Same asli-data wale browser/account mein **Panel v3.36 → Stock Management →
   ＋ Message / screenshot**. Upar account/local-browser label check karo.
2. **Pehli screen:** WhatsApp ka poora numbered message Paste karo, ya bada
   **Screenshot chuno** button dabao. PNG/JPG/WebP, maximum **5 MB / 20 megapixels**.
   Photo aur usse nikla text draft hain; text offline bhi chalega. Photo ki pehli
   English OCR engine/model download ke liye internet chahiye; reading browser mein
   hoti hai, image/text kisi upload/AI/chat service ko nahi bheja jata.
3. **Message ka saal khud chuno:** number likho ya year button tap karo, phir
   **Agla: entries dekho →**. Year blank se shuru hota hai; year button bhi aapka
   explicit choice hai, automatic today/filename guess nahi. Full DD/MM/YYYY ho to
   source ka year use hota hai; cross-year receipt mein poora year likho.
4. **Doosri screen:** outgoing maal ho to **Customer ko becha — Sale** ya
   **Office / doosre kaam ke liye — Out** chuno. Out mein actual purpose zaroori hai;
   **Office transfer** shortcut sirf aapke tap par purpose bharta hai. Incoming-only
   message mein outgoing choices chhipi rehti hain. Unknown supplier optional hi hai.
5. **Saare tagged log alag dikhte hain.** Har captured tag entry/History/PDF mein
   rahega, chahe uska Sales/Delivery role na ho. Sale mein actual naam ke paas
   **Salesperson** aur **Delivery** tap karo; Out mein actual **Receiver** optional
   hai. Ek person sach mein dono roles mein ho to dono explicitly choose kar sakte
   ho. Koi role guessed nahi; driver number naam ki jagah nahi. Tag chhoot gaya ho
   to **Naam likho → ＋ Naam jodo** (Enter bhi chalega). Typed name ko jode bina Save
   enabled nahi hoga. Extra added naam hataya ja sakta hai; original tag text sudharne
   ke liye **← Message / Message sudharo**. Isse Employee/Attendance profile nahi banti.
6. **Saare items, dates, quantities aur units check karo.** Clear exact/confirmed
   name + unit match compact dikhta hai; **badlein** kholkar remap kar sakte ho.
   Unclear product ka **Choose product** khula rahega; fuzzy suggestion automatic
   match nahi. Box/pcs/roll/bundle/pack conversion kabhi nahi. `ps`/`pc`/`pcs` same-count
   spelling aliases hain. Missing product silently create nahi hota: Cancel → actual
   opening/date ke saath Add product → fresh preview. Product aliases audited save
   ke baad yaad rehte hain; conflicting aliases dobara explicit choice maangte hain.
   OCR/source galat ho to **Message sudharo** se pehli screen aur original screenshot
   par jao. Har edit/role/name/Skip change purana review invalidate karta hai.
7. Warnings aur duplicate/opening choices resolve karke **Maine … dekh liya** tick
   karo → **Haan, … entries save karo**. Puri batch ek guarded atomic save, mandatory
   safety copy aur per-movement audit mein aati hai; koi invalid row ho to partial
   save nahi. Save ke baad History mein **Is message ka PDF** aur **Agla message**
   milenge. Cancel/Escape/failed OCR/quota/stale account/data se stock nahi badalta.
   Local saved ≠ Cloud synced; configured account par sync confirm karke JSON backup lo.

Optional supplier / genuine separate-delivery reference **Extra options** mein hain.
Same-day opening attestation sirf applicable rows par dikhai deti hai aur kabhi
pre-ticked nahi hoti. Matched product/actions ki details collapsed ho sakti hain,
lekin original item aur har movement ki date/quantity/unit poori preview mein rehti hai.
**Pehle se recorded message mein extra tag jodkar stock dobara save mat karein**;
old entry correction History → Edit mein karein. v3.35 ke note-only tags bhi ab
History/PDF mein padhe jaate hain, bina old records rewrite kiye.

Supported familiar format (generic example, **customer data nahi**):

```text
23/11 Example customer
1- Example product
Pichle bache box 12
21/11 ko aaye +8
Aaj gaye -3
Available box 17
@Sales Employee @Delivery Employee @Informed Employee
```

- Header ki **date aur paas wala party text** retained. Quoted sender / Photo / Video /
  time / reaction stock party ya product nahi. Ignored chrome preview me reviewable hai.
- **Aaye → Stock In**, apni inline date par. **Aaj gaye → chosen Sale/Out**, header
  date par. Bare Aaye/Gaye bhi header date use karte hain. Header ke baad ki receipt
  date ya ambiguous year silently backdate nahi hota—source correct karna padega.
- **Pichhle bache / Available sirf checks**: fake opening, movement ya manually
  overwritten available counter nahi. Dono hon to exact thousandths arithmetic
  validate hota hai. New rows ke baad header-date tak panel ledger ka balance bhi
  message Available se match chahiye; mismatch par reconcile karein, fake In/Out
  bana kar force na karein. Missing checks visible warning hain, guessed quantities
  nahi; full nonnegative dated ledger har save par phir bhi mandatory hai.
- Header/item text aur saare captured tags saved movement note me rehte hain
  (maximum 500 characters per source note). Tagged names ka readable list existing
  delivery-details field mein bhi retained hai; manually added tags source note mein
  separately marked hain. Maximum 20 names / 400 tag characters; koi silent truncation nahi. Original photo sirf draft me hai,
  Stock product photo/company logo nahi banti. Historical receipt ke delivery fields
  me outgoing driver assign nahi hota; raw footer contextual source note me retained.
- Ek message per batch, **1–50 sequential numbered items**, ek product ek block,
  maximum **8 movements per item / 20,000 source characters**. Unknown lines,
  duplicate/cropped numbering, unclear O/I digits, mixed units aur mismatched signs
  review/correction maangte hain. Single-digit quantity ki alag line lose nahi hoti.

### Duplicate aur opening snapshot safety

**Purane messages ko nayi opening ke upar replay mat karein.** Opening me receipts /
Sales pehle se included ho sakti hain. New opening ki date se **purani movement yahan
add nahi hoti**—sirf explicitly **Opening me already included — Skip** resolve kar
sakte hain. Same-day movement ke liye **opening snapshot ke BAAD** wali explicit
attestation chahiye. Zero-opening catalogue ki product date bhi cutoff hai. Agar
asli historical ledger migrate karna hai to opening/history alag reconcile karein;
importer purani transactions ya opening balance invent/change nahi karta.

Saved source rows dobara kholne par skip hoti hain; partial batch ki pehle deliberately
Skipped row ko poori batch ka hash akela "imported" nahi banata. Retry par bhi actual
row provenance, current/audit duplicates, opening, maths aur dated balance checks
lagte hain; already saved row ko doosre product par remap karke replay nahi kar sakte.
Same processed movement dobara kholne par skip; edited/deleted imported
entries bhi old screenshot se resurrect nahi hoti. **Same dated receipt different
outgoing messages me repeated ho to bhi** product/date/quantity-based provenance
use karke skip hoti hai—sirf screenshot/file hash par bharosa nahi. Manual entries
(edited/deleted audit samet) ke same product/date/quantity par **possible duplicate**
choice chahiye; blank/different party ya Sale vs Out se warning bypass nahi hoti.

Sach me same date/qty ki **alag real delivery** ho to **unique message/delivery
reference + explicit New choice** aur correct source/panel balances chahiye. Source
facts ke bina importer dono ko alag delivery guess nahi karega. Already-included
rows ko Skip karein; all-skipped/processed batch strict no-op hai. Correction ke
liye existing **Stock History → Edit/Delete** + audit use karein, old message replay
nahi. Independent offline copies of one message share semantic movement IDs; any
remaining conflict uses the existing explicit cloud conflict/recovery flow, not a
second warehouse reservation service. Prefer importing once on the actual-data
device, then sync before opening another device.

## 2. Stock In, Stock Out aur Stock Sale

| Action | Kya bharein | Quantity par asar |
|---|---|---|
| **Stock In** | Product, quantity, date; supplier/party aur note optional | Quantity add |
| **Stock Out** | Product, quantity, date aur **purpose zaroori** | Quantity subtract |
| **Stock Sale** | Product, quantity, date, **party/customer, salesperson aur delivery-person name zaroori** | Quantity subtract |

Sale me delivery phone aur address / vehicle / gate details bhi likh sakte hain.
Product row ke **In / Out / Sale** shortcuts wahi product pehle se select karte hain.
Har transaction ek product ki hoti hai; manual forms me alag products ki alag entries
hain. Message / screenshot importer poore reviewed message ki rows ek saath taiyar karta hai.
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

## 4a. Stock PDF — Available, History ya ek saved message

- **Stock Management → ↓ Stock PDF**. Products tab se default **Available Stock**;
  History tab se default **Stock History**. PDF dialog mein count + active filters
  dekhkar **Download PDF** dabao. File na khule to visible **PDF yahan se save karo**.
- **Available Stock:** har matching product ka original unit, opening date,
  Opening + In / Out / Sales / Available / Minimum aur low flag. All saved dates
  (future-dated saved entries bhi), current Product/Search/Low-only filters. History
  ke invisible old dates/party filters is snapshot par nahi lagte. Alag units ko
  jodkar fake grand quantity total nahi banta.
- **Stock History:** visible Product + Party + Salesperson + From/To + Type + Search
  saath apply hote hain; PDF button current typed filter values bhi padhta hai,
  bhale Apply abhi na dabaya ho. Dono date boundaries included. **Saare matching
  pages** export hote hain, sirf on-screen 40 rows nahi. Each original movement,
  quantity/unit, full-ledger balance, party/purpose, salesperson, delivery/phone,
  all tagged people aur source notes included. Filtered quantity ko live balance
  nahi kaha jata. Invalid/no-match selection par error, all-data fallback nahi.
- **Is message ka PDF:** save ke turant baad card se, ya History row ke **PDF** se.
  Same source-batch ki abhi saved entries (alag dated In bhi) aati hain; skipped,
  deleted ya unsaved draft rows nahi. Row PDF par screen filters apply nahi hote;
  PDF dialog mein scope clear likha hai. Non-message manual row ka PDF sirf woh row.
- Saved company logo har PDF page par automatic, shop details + page numbers aur
  full continuation. Hindi names bundled Indic shaping se; purane salary/Canteen/
  Attendance PDF formats nahi badle. Yeh Stock report hai, price/invoice nahi.
- **Share PDF** supported browser mein real file wali share sheet kholta hai; app
  aur recipient aap choose karte hain. Unsupported ho to same PDF download aur
  **WhatsApp → Attach → Document** instructions; automatic attach/send nahi. Share
  cancel par surprise download nahi. Report account/data badle to stale export blocked.
- PDF banana/download/share stock save nahi karta, naye contacts create nahi karta,
  aur file kisi report service par upload nahi hoti. Already-open panel mein offline
  PDF bhi chalegi. **PDF backup/restore file nahi**; complete data/audit ke liye JSON lo.

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
- Saare editing devices/tabs **v3.36** par update karein. Local save cloud ACK nahi:
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
