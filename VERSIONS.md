# Hisaab Pro — auto-update system (v2.0)

## Ab kaise kaam karta hai

Repo me **`index.html` ek chhota "loader" hai** (9 KB). Ye har baar khulte hi check karta hai ki repo me
sabse naya version kaun sa hai, aur **seedha usi ko khol deta hai**.

Iska matlab: **link kabhi nahi badalta, `index.html` bhi kabhi nahi badalna.**

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
| Internet slow | Loader GitHub ki file-list 1 baar padhta hai; fail hone par purana cached version khol deta hai |

## Version history

| Version | Date | Kya badla | File |
|---|---|---|---|
| v3.1 | 2026-11-14 | **Naya Canteen module** — saman entry (rate-wise **ya** ek-saath pura total), bikri/kharcha, **din ka ledger**, **mahine ka ledger**, rate list, udhaar/baki, poori activity log, CSV + print + WhatsApp. Dashboard par canteen card, Settings me canteen card. | `Hisaab-Pro-v3.1.html` |
| v3.0 | — | v3 UI, dark mode, ledger (advances), worker profile drawer, CSV & WhatsApp share, cloud login/sync | `hisaab_v3.html` |
| v2.0 | 2026-11-11 | Auto-update loader + fixed working hours/overtime removed. Hourly worker = rate × total hours (naya Hours column). Monthly = ÷30 fixed, Sunday auto-exclude. Version badge. | `Hisaab-Pro-v2.0.html` |

> **File ka rule:** `hisaab_v3.html` = working/source file (yahan change hota hai).
> `Hisaab-Pro-v3.1.html` = usi ka release copy, taaki upar wala loader apne aap sabse naya version utha le.
> Dono ka content abhi **bilkul same** hai.

---

# 🍽 Canteen module (v3.1) — kaise use karein

Sidebar me **Canteen** dabao (ya keyboard par `g` phir `c`).

## 1. Entry add karna — do tarah se

**＋ Entry add karo** dabao. Ek hi modal me teen type:

| Type | Kya | Ledger me |
|---|---|---|
| ⬇ **Saman aaya** | canteen me aaya saaman (purchase) | − (minus) |
| ⬆ **Bikri / income** | chai-nashta-khana jo becha | + (plus) |
| ↯ **Kharcha** | gas, bijli, mazdoori, misc | − (minus) |

Saman ka hisaab likhne ke **do mode** hain:

1. **₹ Item-wise rate** — har item ka `naam · qty · unit · rate`. Total apne aap banta hai.
   *Item ka naam likhte hi Rate list se rate aur unit apne aap bhar jata hai.*
2. **Σ Ek saath pura total** — single-single item ka price **nahi** likhna, to bill/parche ka
   **ek saath pura total** daal do. Rate column band rehta hai; chaaho to sirf naam-qty
   yaad rakhne ke liye likh sakte ho. Dono mode ledger me barabar judte hain.

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

## 3. Udhaar / baki

Har entry par `total − paid = baki`. Baki wali entries par **₹ Paid likho** button —
kitna aur diya wo daalo, baki apne aap ghat jayega. Sidebar me Canteen ke aage
red badge = is mahine kitni entries ka paisa baki hai.

## 4. Data

- Sab kuch **usi browser** me save hota hai (`localStorage`) — workers/records ke saath.
- Cloud login on ho to canteen data bhi sync hota hai.
- **⤓ Canteen CSV** — item-level rows (Date, Day, Type, Party, Bill, Mode, Item, Qty, Unit, Rate, Item amount, Entry total, Paid, Balance, Pay mode, Note) + totals.
- **🖨 Print din / Print mahina** — A4 ledger, shop details ke saath.
- Settings → **🗑 Sirf canteen data erase** (workers/salary safe, undo milta hai).
- Purana backup (jis me canteen key nahi) restore karne par canteen apne aap khaali ban jata hai — kuch tootta nahi.

## 5. Developer tests

`tests/` folder me jsdom smoke tests hain (~150 checks) — app ke liye zaroori nahi, sirf
change ke baad verify karne ke liye. Details: `tests/README.md`.
