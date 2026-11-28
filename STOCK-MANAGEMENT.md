# Hisaab Pro v3.44 — Stock Management

Stock Management existing Hisaab panel ka **alag tab** hai: products/photo, Stock In,
purpose-wise Stock Out, customer-wise Sales, live availability, date-wise history,
changes ka audit aur minimum-stock warnings. **Available quantity manually adjust
nahi karni**; har saved transaction se balance apne-aap calculate hota hai.

## Bulk Item Add via Paste + intelligent Smart Paste (v3.44)

**Stock Management → ＋ Bulk Item Add via Paste** opens a dedicated **Stock In only**
surface. Paste the complete received-item list; clear rows save automatically.
Typing stays a draft until **Process & save**. This is the same audited inventory,
not a second ledger or an opening/Available overwrite.

1. **Date / unit already written?** Paste as-is. If absent, optional **Actual received
   date** / **Common actual unit** fills only missing values once for the list.
   Both start blank. Explicit item dates/units are retained; an invalid date or
   conflicting unit must be corrected, not silently replaced by a common default.
   Supplier and actual bill reference are optional. Choosing this surface explicitly
   means incoming stock; **a pasted Sale / Out / Gaye is held**, never converted to In
   or silently deducted. Use existing **Smart Paste** for mixed movements.
2. No mandatory template: plain/numbered/labelled Hindi-English lists, quantity
   before/after a known unit, `Boxes 3`, combined `Qty: 3 Boxes`, copied Excel,
   headed or uniquely mappable **headerless TSV/CSV/pipe/semicolon columns** work.
   Headerless cells may be in different orders with optional actual date/type.
   Two possible quantities, missing/extra cells, unlabelled people or unknown units
   are held instead of guessing a column shift. Quoted CSV preserves commas.
3. Safe mistakes are corrected and reported: spacing/Unicode digits/grouped numbers,
   known unit plurals/spellings, whitelisted header typos (`Prodcut`, `Quanity`,
   `Unti`), explicit `Qty (Boxes)`, labelled serial-number columns, and uniquely
   misplaced **Qty↔Unit / Date↔Type** cells. Source values are retained. O/I digits,
   minus signs, pack conversions and missing quantities are **not invented**.
4. **Existing product:** same shared local matcher, exact/accepted aliases first,
   then a unique safe **raw ≥75%** spelling/known-abbreviation match, five-point
   ambiguity margin and unit/model/colour/material/quality guards. Stock **increases
   through an ordinary dated audited Stock In**; saved name/photo/minimum/opening/
   exact unit label are not overwritten. Missing unit is never assumed from a match.
5. **New product:** clear genuinely new incoming names create one zero-opening
   catalogue product plus actual receipt movements. Matching now also examines
   **every eligible new name in this paste before saving**: safe spelling variants
   share one product; different quantities remain separate movements. Every pair
   in an auto-group must meet the safe threshold—no transitive A→B→C guessing.
   A literal, more complete source spelling is retained, not an invented brand/model.
   Future sibling variants are visible before a generic name is mapped, including
   a new variant beside an existing saved one. Generic/initials/below-threshold
   ambiguity waits for clarification; distinct explicit variants never collapse.
   Same-name/incompatible-unit and historical deleted/renamed identities do not
   silently become duplicate products. New dates come from actually saved receipts.
6. Result separates **Saved / Already recorded, repeated or explicitly skipped /
   Clarification / New products**. Each product visibly shows **Before + received −
   outgoing = Available now**, separately in its exact saved unit. Running totals
   use ledger-scale integers, including balances larger than a single-entry limit;
   no mixed-unit grand quantity. Available includes all saved dates, not just today.
7. Correct only unresolved fields, or expand **✎ Puri galat row yahin correct
   karein** to fix one malformed row without repasting the saved list. The original
   bad row, explicit correction, known date/unit and original source identity are
   retained. A row replacement cannot inject extra products/movement indexes or
   change already-saved facts. One-tap **Similar items in THIS paste** can resolve an
   ambiguous generic name. **Process & save** appends only newly resolved receipts
   to the **same combo**, with no duplicated stock. A product explicitly created
   without an opening does not demand a fictitious same-day opening attestation;
   genuine opening snapshots retain their original checks. The no-opening exception
   requires the actual deterministic creator snapshot plus its first dated receipt
   audit, not merely a copied reason string; ambiguous history still asks.
8. Same receipt/re-paste/edited/deleted history and within-list repetition are
   checked before writing. Identical product/date/quantity repeats count once;
   genuinely separate identical-quantity deliveries need an **actual unique
   reference + explicit separate-delivery confirmation**. Existing opening cutoffs,
   source arithmetic, full dated/future ledger and no-oversell checks remain.
   Cross-device chronology/source conflicts still pause for a coherent choice;
   they do not multiply stock or silently merge incompatible audit facts.

**Reports / safety:** the local result download includes saved/skipped/unresolved
reasons, exact-unit balance changes and original private source. The existing
approved **Combo PDF** exports only saved rows, exact dates/units/roles/tags/IDs and
actual saved logo/company. Pending corrections remain open; exports never write.
**Agla paste** keeps Bulk mode but clears old facts/corrections. Close/navigation
cancels pending work, not a completed save. Stale account/tab/disk, revoked consent,
failed mandatory checkpoint or storage quota refuse/roll back the whole attempted
subset; no false green Saved message. **Local Saved ≠ Cloud synced**.

Bounds remain **20,000 characters / 50 items / 8 movements per item**; no silent
truncation. A row correction is bounded at 4,000 characters; saved original-plus-
corrected notes/details retain the existing 500-character limits. An
oversized/unrepresentable source is reported, never silently shortened. Processing
is local/offline with no AI service/upload, dependency, schema/key migration,
financial integration or bundled customer catalogue. Existing Smart Paste receives
these parser/same-batch/correction improvements; **Message / screenshot · review**,
priced Sales, opening import and typed received-stock links remain available.

## Stock Sale / custom combo — search → select → confirm once (v3.43)

**Stock Management → Stock Sale**, product row ka **Sale**, ya **Stock Sale / combo**
tab ek hi **inline cart** kholta hai—per-item pop-up nahi. Naya Sale tab tak **draft**
hai jab tak **Confirm sale & reduce stock** nahi dabate.

1. Actual **customer/party, date, local sale time, salesperson aur delivery person**
   bharein. Date/time device ki local clock se start hote hain aur editable hain;
   actual past sale ho to uski date/time badlein. **Combo/package name optional** hai.
   Delivery phone/address/vehicle aur note optional details mein hain.
2. Product name/model type karein. Saved names ke saath typos, extra spaces,
   familiar abbreviations (`Plas scbd`, `adjstr sm`, `brkt`) ke local auto-suggestions
   turant aate hain. Har choice mein **available stock + Sale-date sellable stock
   + exact saved unit** hai. Tap ya ↑/↓ + Enter se add karein. Search Enter sirf add
   karta hai, Sale confirm nahi. Search kabhi doosra product silently sell nahi karta.
3. Har selected product ki **quantity, actual ₹/unit price aur discount** independently
   editable hain. Discount **% per line** ya **₹ per line** chunein; ₹ discount poori
   line par hai, per unit nahi. **Change / Remove** se confirmation se pehle line
   badlein/hatayein. Ek hi product alag qty/price ke saath alag lines mein reh sakta
   hai; woh collapse nahi hoti. **Use last recorded price** explicit optional tap hai,
   silent price guess nahi. New line ka price blank hai; genuine free item ke liye
   explicitly0 likhein. Maximum50 lines; quantity3 decimals, ₹ price/discount2 decimals.
4. **All selected products** summary mein product, quantity/unit, actual rate,
   discount aur final line amount saaf hain. Subtotal, total discount aur final amount
   automatically calculate hote hain. **Total quantity by exact unit** alag hai:
   `2 Boxes · 1.25 sets`, misleading `3.25 items` nahi. Integer paise/hundredth percent/
   thousandth quantity arithmetic; har subtotal aur discount half-up ₹0.01 round hota
   hai. Udaharan: `₹263.00 − ₹12.53 = ₹250.47`.
5. **Confirm once** par poora Sale ek mandatory-recovery-copy, audited atomic save
   mein commit hota hai. Kisi ek line ki kami/overdraw se **koi product partially
   minus nahi hota**. Same product ki saari selected lines milakar check hoti hain.
   Full dated ledger + future saved commitments checked: later receipt se backdated
   sale fund nahi ho sakti, even if current Available bada hai. Error par original
   saved stock/audit unchanged aur draft retained hai; false green Saved nahi.

**History / receipt:** poora Sale ek card mein product-wise quantities, original
units, prices, discount, final amount, actual date/time, party, roles aur saved IDs
ke saath rehta hai. **Edit Sale** poora saved Sale kholta hai; confirm par old qty
replace hoti hai, double-subtract nahi, old/new audit retained. Remove/replace line
bhi whole-sale edit mein hi. **Delete Sale…** explicit confirmation ke baad saari
lines ek saath restore karta hai; individual line/product delete se package adhoora
nahi hota. **Use combo again** editable new draft copy hai—new actual customer/roles
blank, fresh date/time/identity aur current stock rechecked, no automatic sale.

**PDF / sync / old records:** approved navy/emerald + saved actual logo ka **Sale
PDF** whole saved Sale ke prices/discount/date/time/party ko export karta hai.
Filtered **History PDF** matches-only prices/totals dikhata hai; whole-sale action
scope clearly labelled hai. Unsaved cart/edit PDF mein nahi aata; PDF zero-write hai.
Old sales **unpriced hi rehti hain**, fabricated₹0/discount/time ya migration nahi.
Salary/Canteen/payment/tax/invoice write nahi. Compatible independent-device Sales
normal sync se merge; conflicting prices/quantities/deletion ko **whole Sale** choose
karna hota hai, half-price/half-quantity hybrid nahi. Missing-data recovery bhi
incompatible Sale versions silently combine nahi karti. **Local Saved ≠ Cloud synced**.

Draft same-account navigation mein memory mein rehta hai, reload par saved nahi
hota. Visible meaningful cart cloud apply ko pause karta hai; navigation away ke
baad sync ho to old cart stale rahega—**Refresh stock** same account par typed values
rakhta hai aur quantities rechecks. Account switch par old account ka draft clear.
**Clear draft / Cancel edit** unsaved fields hi hataate hain, confirmed Sale nahi.

## Message / Screenshot — highlighted suggested matches (v3.43)

Nonexact pasted/OCR item ke paas ab **distinct background + thick coloured border**
mein **✦ Suggested matches** khula dikhta hai—collapsed dropdown ke andar nahi.
**Original item** unchanged naam ke saath har candidate ka **saved product name,
current available stock/exact unit aur local name similarity %** hai; best-first
ranking aur **Best suggestion / Selected / Use product** clear indicators hain.

- Unique safe **≥75%** spelling/spacing/order/known-abbreviation match automatic
  mapping rakhta hai; **74.7% ko75% round karke select nahi**. Pure initials (jaise
  `PS`) sirf review suggestions hain. Missing size/model, close candidates within
  five points, colour/material/shape/quality differences aur wrong units silently
  choose/convert nahi hote. Wrong variant/unit **Not interchangeable** warning hai.
- **Unsuitable → Unmatched — no suitable saved product**, not a weak first guess.
  Exact saved name ko extra noisy panel nahi. Local score accuracy guarantee ya
  OCR-confidence nahi; original image/text aur actual facts review karein.
- **Message / screenshot · review:** candidate par **one tap** dropdown map + replan
  karta hai, purana consent reset. Is tap se stock save nahi hota; actual roles,
  source arithmetic/opening/date checks aur newly reviewed final Save retained.
- **Smart Paste:** unclear product par **Use & process** ka **one tap** explicit mapping
  aur safe processing karta hai. Sirf valid resolved row save; already-saved rows
  repeat nahi, remaining row **usi source combo** mein. Missing quantity/date/unit/
  roles/opening attestation ko product selection invent/bypass nahi karti.
- Matching local/offline hai; product search, text ya screenshot external AI service
  par upload nahi. Existing optional OCR engine/model static downloads unchanged.

## Smart Paste — paste → pehchaan → check → automatic save (v3.42 retained)

**Stock Management → ⚡ Smart Paste** mein poora copied message / list / table
Paste karein. Is surface ko kholne par **Paste karte hi clear entries SAVE hongi**
ki notice aur actual account dikhta hai. Ab har list ke liye Message → Review →
checkbox → Save zaroori nahi. **Khud type kar rahe hon to woh draft hai**; complete
hone par ek **Process & save** tap karein. Phone/WhatsApp apne-aap read nahi hota.

- Fixed template ya exact spelling zaroori nahi. Plain / numbered lists,
  Hindi-English wording, spacing/sequence differences, labelled fields (quantity
  product se pehle bhi), combined `Qty: 3 Boxes`, copied Excel/TSV, CSV/semicolon/
  pipe/Markdown tables, mixed text + table + tagged footer, quoted commas/multiline
  cells aur ordinary row JSON local parser pehchaanta hai. Multiple/repeated table
  headings product nahi bante. Unknown/conflicting columns safely stop/report hote
  hain, quietly shift nahi hote. Maximum **20,000 characters / 50 items / 8
  movements per item**; oversized sources truncate karke save nahi hote.
- **Saaf, valid entries apne-aap ek atomic save mein** ordinary dated Stock In /
  Sale / Out banti hain. One paste = **one party / one combo**, na ki alag unrelated
  History cards. Har item ki actual date, quantity aur exact saved unit alag rehti
  hai. Invalid independent rows hold/report hoti hain; actual saved subset ka
  complete chronological nonnegative ledger dobara validate hota hai. Dependent
  invalid product ledger ka arbitrary balancing subset nahi chuna jata. Conflicting
  common party/count/source details hon to affected processing pehle clarify hoga.
- Result mein **✓ Saved**, **↪ Already recorded / repeated / explicitly skipped**,
  **? Clarification** aur **New products** alag counts hain. Sirf unresolved items
  ke actual missing/wrong fields dikhte hain; source line aur original text bhi.
  Ek shared year/type/actual role ek baar bharein. Captured tagged names par
  **Salesperson / Delivery** tap kar sakte hain; tag order se role kabhi nahi lagta.
- Jo valid tha woh **save ho chuka hai**. Unclear quantity/date/unit/product ko ek
  baar clarify karke **bache hue save karo** tap karein; pehle saved rows repeat
  nahi hoti aur remaining rows **usi combo** mein judti hain. Saved original source
  locked rehta hai; **Agla paste** doosre message ke liye hai. **Close / navigation
  pending processing cancel karta hai, completed save undo nahi.** Saved correction
  ke liye History ka audited Edit/Delete use karein, source dobara badal kar nahi.
- Safe fixes hi automatic: case/spacing/Unicode digits, unambiguous grouped numbers,
  familiar unit spellings/plurals (`Boxes` → box for matching, **old `Boxes` saved
  label unchanged**), date formatting aur **unique safe ≥75% name match (known abbreviations included)**. Close
  candidates within five points, explicit model/colour/size/material/shape/quality
  differences, omitted sibling variants aur unit conflicts clarification maangte
  hain. Box ↔ pcs / set / bundle conversions ya quantity multiplications nahi.
- **Missing date/year/quantity/unit/type/person/purpose invent nahi hote.** Ek actual
  full date se isi source ka unambiguous year mil sakta hai; device today, screenshot
  filename ya chat sender/timestamp actual receipt date nahi. `Gaye / dispatch`
  outgoing hai lekin Sale ya Out aur actual roles explicitly clear hone chahiye.
  Bare Out needs purpose; explicit Used/Damage wording apna actual purpose de sakti
  hai. O/I ko digit banana, minus/sign repair ya contradictory repeated fields par
  last-value-wins save nahi hota. Source Previous / Available checks hain, new stock
  ya overwrite values nahi.
- Genuinely distinct **clear dated Stock In** ka new product automatic ban sakta
  hai: source unit, earliest **actually saved receipt** date, minimum0, no photo aur
  **koi fake opening movement nahi**. Same-name/different-unit, ambiguous saved
  variant, outgoing-only ya deleted/renamed historical product auto-create nahi.
  Purane openings, metadata, saved units/minima/photos aur all-time balances retained.
- Re-paste / alternate layout / prior confirmed correction / edited/deleted history
  ordinary semantic movement IDs aur audit provenance se detect hote hain. Manual
  same-date/qty means **possible duplicate**, not automatic add or an unasked Skip.
  Sirf genuinely separate delivery ka actual unique reference **plus explicit
  separate confirmation** use karein. Included/opening Skip optional aur unticked
  hai. Before-opening still blocked; same-day needs actual **snapshot ke BAAD**
  attestation. Random reference, guessed opening inclusion ya fake adjustment nahi.
- **↓ Result report** saved/skipped/unresolved reasons aur private source text ka
  local download hai. **↓ Combo PDF** mein currently saved combo ke saare original
  dates/units/roles/tags/IDs/source aur approved premium design/saved logo hain;
  unresolved items stock/PDF rows nahi bante. PDF/report export zero-write hai aur
  unresolved correction draft open rehta hai. Report/source private rakhein.
- Existing account/scope/disk/version/unsaved-data checks, cancellation during
  hashing, required pre-change recovery copy aur full quota rollback still apply.
  All-recorded/no-valid batches save/checkpoint nahi karte. Processing already-open
  panel mein **offline/local**, no external AI/text/image upload, new library/schema/
  key/backend or financial/Canteen/Attendance migration. Ordinary saved rows existing
  configured cloud sync mein jaati hain; **local Saved ≠ Cloud synced**.

**Screenshot unclear hai ya pehle review chahiye?** Separate **Message / screenshot
· review** button (Smart Paste footer se bhi) unchanged review-only flow kholta hai;
OCR text ko dekhna/sudharna aur original explicit Save ab bhi zaroori hai. Screenshot
reading apne-aap Smart Paste write nahi banti. Neeche section1c isi optional path
ko explain karta hai.

## Naya premium Stock PDF (v3.41)

Approved preview ka **navy / emerald design** ab existing **↓ Stock PDF** action
mein default hai; koi theme setup, import, product re-entry ya logo upload nahi.

- **Available Stock:** bold branded header, real matching product / unit-type /
  low-stock counts, healthy-vs-low product ring, readable In / Out / Sales columns
  aur highlighted Available. Har product ki original opening date aur exact saved
  minimum retained. Sirf genuinely below-minimum rows amber; min0 koi fake alert nahi.
- **Available by unit:** har exact saved unit ka alag total. `box`, `pcs`, `roll`,
  `set`, `bundle`, legacy case aur custom units never converted/merged. Thousandths
  exact rehte hain; large cross-product totals ke liye integer BigInt grouping hai.
  Mixed-unit grand quantity ya money/invoice total kabhi nahi.
- **History / combo:** same premium branding/table theme. History ke combined
  product/date/party/salesperson/type/search filters ke sirf matches; full-ledger
  balances remain. Combo action ab bhi **one whole saved combo** hai, including
  every original item/date/unit/supplier, shared party/roles/tags, original source
  notes and saved IDs. Movement totals keep In / Out / Sales separate per unit;
  repeated running balances ko total nahi karte. In mein matched openings included.
- Actual **saved company logo** proportional form mein **har page** par, embedded
  once. Preview ka sample monogram / names / quantities ship nahi hote. Long
  product/company/party text wraps without loss; Hindi shapes locally on the actual
  navy/amber/mint background with Unicode ActualText. Continuation pages compact
  hain; saare matching products/movements export hote hain, sirf visible screen nahi.
- Available means **all saved dates, future-dated entries samet**, not an invented
  as-of cutoff. Counts/health/totals bhi report ke actual filtered rows se aate hain.
  Saved/opening/receipt dates ya Available manually overwrite nahi hote.
- Download / Share ke existing consent, font wait, account/context/stale-data,
  cancellation aur Blob cleanup guards unchanged. Offline already-open export
  supported; OS share destinations user chooses—automatic delivery claim nahi.

**PDF export presentation-only hai.** PDF banana, dekhna, share ya cancel karna
Stock, audit, cloud data, company settings, Canteen, Employee, Attendance ya salary
mein write/migration nahi karta. Same browser/site par **Panel v3.43** dekhein.

## 1. Pehli baar

1. Jis **same browser/site** par asli data hai, Settings → **Backup (JSON)** download karein.
2. Updated panel me **Panel v3.43** confirm karein. Storage clear, entries re-enter
   ya company logo dobara upload karne ki zaroorat nahi.
3. Sidebar → **Stock Management** kholein. Phone par upar navigation ko sideways
   scroll kar sakte hain. Keyboard shortcut: **g**, phir **i**.
4. **Add product** dabayein: unique product name, Unit dropdown (box / set / bundle / pcs…), date,
   opening quantity aur minimum-stock limit bharein. Photo aur note optional hain.
5. **Save product** ke baad product aur, opening quantity positive ho to, usi date
   ki **Opening / Stock In** entry save hoti hai. Zero opening par fake entry nahi banti.

### Add product: 30 unit choices (v3.39)

**Stock Management → Add product → Unit** ab ek visible dropdown hai:

| Group | Exact unit labels |
|---|---|
| Count / packing | `pcs`, `box`, `set`, `bundle`, `roll`, `packet`, `pack`, `carton`, `pair`, `dozen`, `bag`, `gaddi`, `table`, `unit`, `bottle`, `can`, `drum` |
| Weight | `kg`, `g`, `quintal`, `tonne` |
| Volume | `litre`, `ml` |
| Length / area | `metre`, `cm`, `mm`, `feet`, `inch`, `sqft`, `sqm` |

- Apni doosri unit ke liye **Other / custom unit…** chunein, phir exact label
  likhein (maximum 18 characters). Khaali custom unit save nahi hogi.
- New product ka default `pcs` hai. Purane products ki spelling/case/custom labels
  **apne-aap nahi badalti**; existing custom label Edit mein wahi khulta hai.
- **Koi pack conversion nahi:** 1 box ko pcs, set ya bundle mein convert nahi
  karte. Har product ki ek exact unit aur usi unit mein dated quantity rehti hai.
- Opening / koi movement banne ke baad product ki unit change karna ab bhi blocked
  hai. Alag unit ke liye alag product banayein; old stock ko rename/convert na karein.
- Dropdown/custom selection sirf draft hai; **Save product** se pehle ya Cancel par
  stock nahi badalta. Canteen ka unit selector is change se alag/unchanged hai.

Purana version khule ya **Import stock** button na dikhe to [normal panel link](https://akash4447777-dev.github.io/hisaab-pro/)
dobara kholkar refresh karein aur **Panel v3.43** dekhein. **Browser ka site data /
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
   **Panel v3.43** confirm karein. Same account/project use karein; storage clear na karein.
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

## 1b(ii). Private received-stock link — naya Stock In (v3.40)

**Naya maal aaya hai, total available / opening nahi?** Uske liye alag typed
**`#stock-in=`** hand-off hai. Upar wala `#stock-opening=` link **mat use karein**:
woh existing products skip karta hai, unmein receipts add nahi karta.

1. Prepared private **Stock In list** link **usi browser/site/account** mein kholein
   jahan asli Stock saved hai. Normal login/initial sync ka wait hota hai; koi JSON
   chooser, Settings Restore ya har product ki manual entry nahi.
2. Review mein **actual account, explicit receipt date, saare source names, incoming
   quantities aur units** dikhte hain. Device ka today / filename / opening-date
   policy receipt ki date ko change nahi karti.
3. Unique **raw 75%+ name match** saved product select karta hai, lekin save nahi.
   Saved identity / exact unit / match % visible hain. **Product check / badlein**
   se choice badal sakte hain. Close/model/variant/unit ambiguity unresolved rehti
   hai. Jahan credible saved match nahi hai, **Naya product banega** clearly dikhta
   hai; final Haan us catalogue creation ko bhi approve karta hai. Existing exact
   name ko doosri unit mein duplicate create karna blocked hai.
4. Existing product mein received quantity **ADD** hoti hai; balance overwrite,
   opening change, box/set/pcs conversion ya item-name ke pack-number se multiply
   nahi hota. Existing saved unit spelling/case unchanged. New products ke liye
   familiar source labels `Boxes` → `box`, `Sets` → `set` sirf unit spelling aliases
   hain, quantity conversion nahi. New catalogue record receipt date se shuru hota
   hai, **koi fake zero/positive opening movement nahi**—sirf actual Stock In.
5. Warnings resolve karein. Receipt **opening se pehle** ho to add blocked; date ko
   galat backdate ya imaginary reference se force na karein. Same-day EXISTING
   opening/zero-opening catalogue ke liye unticked **snapshot ke BAAD** confirmation
   chahiye. Pehle se included ho to Skip. Manual/edited/deleted duplicate ke liye
   Skip, ya sach mein alag delivery ka actual distinct reference **aur explicit
   New** chahiye; random reference mat banayein. Choice/reference edit purana
   same-day confirmation reset karta hai.
6. Sirf **Haan, … Stock In save karo** se poora reviewed combo **ek atomic save**
   mein, required pre-change safety copy aur har new product / In ka independent
   before→after audit ke saath save hota hai. Unknown supplier/roles blank rehte
   hain. Ek bhi unresolved/invalid item ho to partial save nahi.
7. History mein **1 combo** aur **Is combo ka PDF** milta hai. Har product ki apni
   actual date/unit/quantity rehti hai; mixed-unit total nahi. Whole-combo Edit /
   Delete aur dated nonnegative/dependent-stock guards wahi hain. Same list dobara
   kholne par saved/edited/deleted receipts duplicate ya resurrect nahi hote.
   Local save ke baad configured account ka **Cloud synced**, live quantities aur
   **Backup (JSON)** check karein.

Open/parse/match/preview/Cancel/Escape zero-write. Account/data/disk/version/consent
badle, required recovery fail ho ya quota lage to poora save refused/rolled back;
successful **pre-change** safety copy akeli advance ho sakti hai. This adds no new
schema, backend, availability counter, storage key, runtime library or automatic
migration; saved rows use ordinary Stock/cloud/JSON and semantic message IDs.

Private fragments reuse the same early hash scrubber and bounded local UTF-8/gzip
transport as opening links. **Not encryption / expiry / authorization**; forward,
public PR/issue/server ya URL shortener mein na daalein. No chat access / image/text
upload / catalogue lookup service. Limit **1–50 positive rows**, explicit valid
`YYYY-MM-DD`, name ≤90, unit ≤18, actual reference ≤80, optional original source
≤20,000 characters, 5 MB expanded JSON / 131,072-character encoded token. Missing
Previous/Available is explicitly disclosed as absent checks, never fabricated.

Developer-only example (generic, not a customer's inventory):

```json
{"format":"hisaab-stock-in","version":1,"date":"2026-11-25","rows":[
  {"name":"Example received product","quantity":3,"unit":"Boxes"}
]}
```

Optional `supplier`, `reference`, `source` contain only actual supplied context.
Keep the manifest and generated one-click hand-off private:

```bash
npm ci --prefix tests
node scripts/create-stock-receipt-link.js --input private-imports/receipt.json --output private-imports/add-receipt.md
```

The local generator validates against the actual current parser in an isolated
DOM; optional `--encoding raw` avoids compression. It writes owner-readable `.md`
+ `.url.txt` **only under ignored `private-imports/`**, refuses old/foreign/root/
query/hash targets and existing output files, and does not print tokens, upload
anything or write any customer account. Publishing the app is not an account save.

## 1c. Message / screenshot se In, Sale ya Out

### Optional reviewed flow (v3.36+, combo v3.37): Message → Dekho → Save

**Ek-ek item bharna nahi. Ek poora message paste YA screenshot chuno. Chat mein
har message bhejna zaroori nahi; phone/WhatsApp apne-aap read nahi hota.**

1. Same asli-data wale browser/account mein **Panel v3.43 → Stock Management →
   Message / screenshot · review**. Upar account/local-browser label check karo.
   Yeh optional reviewed path hai; automatic Smart Paste ka flow upar alag hai.
2. **Pehli screen:** WhatsApp ka poora numbered message Paste karo, ya bada
   **Screenshot chuno** button dabao. PNG/JPG/WebP, maximum **5 MB / 20 megapixels**.
   Photo aur usse nikla text draft hain; text offline bhi chalega. Photo ki pehli
   English OCR engine/model download ke liye internet chahiye; reading browser mein
   hoti hai, image/text kisi upload/AI/chat service ko nahi bheja jata.
3. **Message ka saal khud chuno:** number likho ya year button tap karo, phir
   **Agla: combo dekho →**. Year blank se shuru hota hai; year button bhi aapka
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
6. **Saare items, dates, quantities aur units check karo.** Naam same-to-same hona
   zaroori nahi: **unique 75%+ naam match** par saved product apne-aap chunta hai.
   Typos, word order, spacing, common plurals aur chhoote descriptive words handle
   hote hain. Compact summary mein **match % + saved product / unit** dikhenge;
   **badlein** se apna doosra product chun sakte ho. Exact/confirmed alias ko priority.
   Do candidates five percentage points ke andar hon, size/model/colour/half-full
   alag ho, ya omitted size/colour ke do actual variants hon, toh **Choose product**
   khula rahega—pehla/random product nahi chuna jayega. **75% name score hai, stock
   sahi hone ki probability nahi**; complete review ab bhi zaroori hai.
   Box/pcs/roll/bundle/pack conversion kabhi nahi. `ps`/`pc`/`pcs` same-count
   spelling aliases hain. Missing product silently create nahi hota: Cancel → actual
   opening/date ke saath Add product → fresh preview. Product aliases audited save
   ke baad yaad rehte hain; conflicting aliases dobara explicit choice maangte hain.
   OCR/source galat ho to **Message sudharo** se pehli screen aur original screenshot
   par jao. Har edit/role/name/Skip change purana review invalidate karta hai.
7. Warnings aur duplicate/opening choices resolve karke **Maine … dekh liya** tick
   karo → **Haan, 1 combo save karo**. Saare products ek combo ke andar, ek guarded
   atomic save + mandatory safety copy aur per-movement audit ke saath save hote hain.
   Koi invalid row ho to partial save nahi. Save ke baad History mein **Is combo ka PDF** aur **Agla combo**
   milenge. Cancel/Escape/failed OCR/quota/stale account/data se stock nahi badalta.
   Local saved ≠ Cloud synced; configured account par sync confirm karke JSON backup lo.

Optional supplier / genuine separate-delivery reference **Extra options** mein hain.
Same-day opening attestation sirf applicable rows par dikhai deti hai aur kabhi
pre-ticked nahi hoti. Matched product/actions ki details collapsed ho sakti hain,
lekin original item aur har movement ki date/quantity/unit poori preview mein rehti hai.
**Pehle se recorded message mein extra tag jodkar stock dobara save mat karein**;
old combo correction History → **Edit combo** mein karein; individual row ka apna
Edit retained hai. v3.35 ke note-only tags bhi ab History/PDF mein padhe jaate hain,
bina old records rewrite kiye.

### Naam ka 75% automatic match (v3.38)

- Text aur actual screenshot/OCR draft **usi local matcher** se guzarte hain. Koi
  AI/product-lookup service, external catalogue, image upload ya naya library nahi.
- Score: normalized common-word Dice aur original/sorted-word character edit
  similarity mein se highest. Case/punctuation, number-letter spacing (`9mm` /
  `9 mm`), limited common plurals, `gray/grey` / `golden/gold` normalize sirf lookup
  ke liye; saved/source naam, actual numbers aur original units nahi badalte.
- **Raw/known-abbreviation-normalized score >= 0.75** chahiye (initials-only review): 74.7% ko round karke automatic 75% nahi banate.
  Exact normalized name + original unit / earlier reviewed alias first; conflicting
  aliases kabhi fuzzy score se chupaye nahi jate. Unknown/low match manual select.
- Explicit mismatched sizes/model-number order, colour, half/full, small/medium/large,
  left/right aur male/female automatic substitution nahi. Same-family variants mein
  missing detail ho toh bhi review, even if shorter model thoda higher score le.
- Is optional reviewed path mein matching **product dropdown + highlighted choices** bharta hai. Preview/Cancel zero-save; Save ke
  liye original year, type, roles, warnings aur final consent ab bhi chahiye.
  Apni selection badalne par purana tick reset hota hai; manually chosen product par
  purane different product ka % nahi dikhate. Reviewed save ke baad alias audit mein
  yaad rehta hai. Source/canonical names, tags, combo/PDF/audit alag-alag retained.
- **Opening/date aur source maths ke errors isse remove nahi hote.** Pre-opening
  movements ko backdate karke ya galat Skip se force na karein. Source Available
  check galat ho sakta hai ya OCR reading; asli text/stock reconcile karein. Is build
  mein historical-record-only combo / stock-neutral archive add nahi hua hai.

### Ek party, ek message, ek combo (v3.37)

**Ek paste / screenshot = ek party ki ONE combo entry.** Misal: 5 products hain to
History mein **1 combo · 5 products**, na ki 5 unrelated entries. Party, tagged log,
chosen Salesperson / Delivery / Receiver ek jagah; **Combo PDF** mein saare products.
Ek product ke do dated movements (jaise pehle In, phir Sale) hon to woh usi combo ke
andar hain—quantity/unit/date apni-apni, fake combined quantity nahi.

- History ka combo expand karke har product ki **actual date, quantity, exact unit
  aur full-ledger balance** dekho. Previous / Available ab bhi checks hain, new
  movements ya manually adjustable stock nahi. Earlier In ka actual supplier
  outgoing common customer/driver se replace nahi hota.
- Preview, Save, receipt aur primary count **combo / products / stock movements**
  ka farq saaf rakhte hain. Skipped/already included items dobara stock nahi badhate;
  combo History/PDF mein sirf currently saved movements hain, deleted/unsaved rows nahi.
- Purane v3.35/v3.36 message imports bhi **source create-audit batch** se automatically
  ek card mein dikhte hain, bina re-import/migration/storage rewrite. **Same party ya
  date se unrelated deliveries merge nahi hoti.** Manual/opening rows individual
  rehti hain; missing/conflicting source identity ko guess karke group nahi karte.
- **Edit combo:** common party/actual roles ek baar, sabhi items ki quantity/date
  neeche. Missing person **Naam jodo** se saare items par. Original tags/source notes
  retained; original unit ya product silently convert/remap nahi hota. Added name ya
  edited field purana consent reset karta hai. Alag saved optional values wale blank
  field ko edit na kiya ho to purani values retained; silently clear nahi hoti.
  Bina change kiye reviewed Save bhi no-op hai, including older note-only tags.
- **Delete combo:** confirmation mein poore combo ke **saare current items** dikhte
  hain; check + explicit Haan ke bina kuch nahi hatega. Products/openings/baaki
  messages retained; har removed movement ka independent before/after audit retained.
  Dependent later stock negative hota ho to poori deletion refused, partial nahi.
- Whole-combo Edit/Delete bhi ek existing guarded atomic Stock save + mandatory
  pre-change safety copy use karte hain. Koi item invalid, storage full, stale
  account/disk/data ya recovery failure ho to **poora action refused**. Sirf modal
  kholne, draft badalne, naam jodne ya Cancel se canonical stock/audit nahi badalta.
- Combined filters lagne par card **matching / total movements** batata hai. Neeche
  matching items, lekin **Combo PDF / Edit combo / Delete combo poore combo par**—
  scope warning aur full confirmation dekho. **↓ Stock PDF → Stock History** sirf
  combined-filter matches export karta hai. Pagination whole combos ko pages mein
  rakhti hai; kisi combo ke products ko alag pages/cards mein nahi baantti.
- Rare old advanced corrections se saved parties alag ho gayi hon to warning dikhegi;
  nayi common party guess/overwrite nahi hoti. Edit combo mein actual common party
  explicitly likhkar resolve karein. Ek item ki exceptional correction **Source /
  item correction → Edit this item** mein hai; whole-combo ka default action alag hai.

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
| **Stock Sale** | One/multiple products ki quantity, actual ₹price/discount, date/time, **party/customer, salesperson aur delivery-person name zaroori**; package name optional | Confirm once par all selected quantities subtract |

Sale me delivery phone aur address / vehicle / gate details bhi likh sakte hain.
Product row ke **In / Out / Sale** shortcuts wahi product pehle se select karte hain.
In/Out ordinary single-product forms hain; **Sale ab inline multi-product cart** hai
(top section dekhein). Saved movement har line ka alag auditable row rehta hai, lekin
Sale identity poora combo jodti hai. Existing unpriced Sale/Message records ka format
ya amounts change nahi hota. Actual INR pricing optional Sale metadata hai; invoice,
tax, payment ya salary/Canteen financial write nahi.

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
  pages** export hote hain, sirf on-screen 40 combos / individual entries nahi. Each original movement,
  quantity/unit, full-ledger balance, party/purpose, salesperson, delivery/phone,
  all tagged people aur source notes included. Filtered quantity ko live balance
  nahi kaha jata. Invalid/no-match selection par error, all-data fallback nahi.
- **Is combo ka PDF / Combo PDF:** save ke turant baad receipt se, ya History ke
  combo card se. **1 combo · N products · M stock movements**; party/tags/chosen roles
  ek common block mein, saare products/dates/units/full-ledger balances neeche aur
  original source notes retained. Earlier dated In supplier distinct rehta hai.
  Skipped/deleted/unsaved draft rows nahi. Combo PDF par partial screen filters apply
  nahi hote; PDF dialog aur filtered card scope batate hain. Non-message manual row
  ka PDF sirf woh row; no-match/conflicting source se doosra batch export nahi hota.
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
- Ordinary product delete uski **saari dependent movements** bhi delete karta hai;
  confirmation me exact count dikhta hai. **Priced Sale mein used product** ka direct
  delete blocked hai—pehle complete Sale review/delete karein, package adhoora nahi.
  Current ledger se rows hatengi, audit se nahi.
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
- Saare editing devices/tabs **v3.43** par update karein. Local save cloud ACK nahi:
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
