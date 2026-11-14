# Hisaab Pro — auto-update system (v2.0)

## Ab kaise kaam karta hai

Repo me **`index.html` ek chhota "loader" hai**. Ye har baar khulte hi check karta hai ki repo me
sabse naya version kaun sa hai, aur **seedha usi ko khol deta hai**.

Iska matlab: **link kabhi nahi badalta, `index.html` bhi kabhi nahi badalna.**

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

> `index.html` ko dobara chhune ki zaroorat kabhi nahi. Purane version files bhi repo me pade rehne do —
> loader apne aap sabse naya uthata hai. (Chaho to purane delete bhi kar sakte ho, koi dikkat nahi.)

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
| Internet slow | Loader GitHub ki file-list 1 baar padhta hai; fail hone par purana cached version khol deta hai |

## Version history

| Version | Date | Kya badla | File |
|---|---|---|---|
| v3.5 | 2026-11-14 | **📋 Paste se entries (bulk).** Word / WhatsApp / parche se poora text ek saath paste karo — **har item ki alag-alag entry** ban jati hai (chaaho to toggle se “sab lines = ek entry”). Line format: `naam qty unit price` (aakhri number = poori line ka total), `@ 42` ya `4x90` = per-unit rate, `1,740` jaise comma chalega, date wali line (`14/11/2026`) = uske baad ki entries us date par. Save se pehle **preview table** (kitni lines, kitna total, kaun si line skip hui), save ke baad **undo**. Rate list bhi apne aap update. Purana data untouched. | `Hisaab-Pro-v3.5.html` |
| v3.4 | 2026-11-14 | **Canteen photo + PDF + unit auto.** ① Entry ke saath **bill/parche ki 📷 photo** lagao (camera ya gallery) — photo compress ho kar entry ke saath save hoti hai, din ke ledger aur entries table me 📷 tag, tap karke badi khulti hai; photo me rate na ho to “Σ Ek saath pura total” me sirf amount likh do. ② **📄 PDF** button — din ka ledger aur mahine ka ledger seedha PDF file (party-wise + item-wise tables ke saath). ③ **Unit auto**: item ka naam likhte hi unit apne aap (doodh→ltr, kesar/dhaniya→gram, anda→dozen, biscuit→pkt, aata/sabzi→kg); rate list me rate ho to wahi priority; khud unit chuno to auto-guess band. **Purana data bilkul safe** — photo field nayi entries me optional hai, purani entries jaisi thi waisi. | `Hisaab-Pro-v3.4.html` |
| v3.3 | 2026-11-14 | **Gram / poori-line smart default.** Nayi item line ab seedha **`₹ poori line`** par khulti hai — parche wala total (jaise **600 gram = ₹45**) bas likh do, total ₹45 hi judega (**27,000 nahi**), per-unit rate **₹0.075/gram** apne aap niklega. Item ka rate Rate list me maujood ho to naam likhte hi line apne aap **`₹ / unit`** par palat kar rate + unit bhar leti hai. ₹1 se chhote rate ab 4 decimal tak safe (0.075 → 0.08 nahi tootta). Purani entries aur per-unit flow bilkul unchanged. | `Hisaab-Pro-v3.3.html` |
| v3.2 | 2026-11-14 | **Canteen rate fix — "poori line ka total" mode.** Har item line par ab select hai: **`₹ / unit`** (default, pehle jaisa) ya **`₹ poori line`**. `4 kg Maggi = ₹360` likhne par ab total **₹360** hi judta hai (pehle galat 4 × 360 = ₹1440 ho jata tha) aur per-unit rate **₹90/kg apne aap** nikal kar amount ke neeche dikhta hai. Rate list, auto-fill, din/mahine ke ledger aur CSV — sab jagah **per-unit rate** hi rehta hai. Purani saved entries ka hisaab **bilkul nahi badla**. CSV me naya `Price mode` column. | `Hisaab-Pro-v3.2.html` |
| v3.1 | 2026-11-14 | **Naya Canteen module** — saman entry (rate-wise **ya** ek-saath pura total), bikri/kharcha, **din ka ledger**, **mahine ka ledger**, rate list, udhaar/baki, poori activity log, CSV + print + WhatsApp. Dashboard par canteen card, Settings me canteen card. **Loader `index.html` wapas add hua** (root URL ka 404 fix). | `Hisaab-Pro-v3.1.html` + `index.html` |
| v3.0 | — | v3 UI, dark mode, ledger (advances), worker profile drawer, CSV & WhatsApp share, cloud login/sync | `hisaab_v3.html` |
| v2.0 | 2026-11-11 | Auto-update loader + fixed working hours/overtime removed. Hourly worker = rate × total hours (naya Hours column). Monthly = ÷30 fixed, Sunday auto-exclude. Version badge. | `Hisaab-Pro-v2.0.html` |

> **File ka rule:** `hisaab_v3.html` = working/source file (yahan change hota hai).
> `Hisaab-Pro-v3.5.html` = usi ka release copy, taaki upar wala loader apne aap sabse naya version utha le.
> Dono ka content abhi **bilkul same** hai. Purane `Hisaab-Pro-v3.1.html` / `v2.0` repo me pade rehne do.

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

## 3. 📋 Paste se entries (v3.5)

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

`tests/` folder me jsdom smoke tests hain (~244 canteen + ~27 loader checks) — app ke liye zaroori nahi, sirf
change ke baad verify karne ke liye. Details: `tests/README.md`.
