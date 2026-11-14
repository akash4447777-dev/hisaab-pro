# Hisaab Pro — tests (developer only)

Ye folder **app ke liye zaroori nahi**. `hisaab_v3.html` / `Hisaab-Pro-v3.2.html` akeli file me chalti hai —
kisi install ki zaroorat nahi. Ye tests sirf tab chalao jab code me change kiya ho aur check karna ho
ki **Canteen module** (aur purane salary features) toot to nahi gaye.

## Chalane ka tarika

```bash
cd tests
npm install          # ek hi baar (jsdom install hota hai)
npm test             # canteen module (~174 checks) + loader (~27 checks)
node canteen.test.js ../Hisaab-Pro-v3.2.html   # kisi aur file par chalana ho
node loader.test.js  # sirf index.html loader ke tests
```

Sab theek ho to aakhri line aati hai: `✅ SAB CHECKS PASS` / `✅ LOADER SAB TESTS PASS`

## Kya-kya test hota hai

| Area | Checks |
|---|---|
| Boot | sidebar me Canteen, `Store.data.canteen`, sample data, version badge, dashboard card |
| Tabs | day / month / entries / rates / activity — sab render, koi `NaN`/`undefined` nahi |
| Item-wise entry | qty × rate ka total, paid/baki, rate list me auto-add |
| Ek-saath total | lump-sum amount, rate column disabled, rate list untouched |
| Line-total price mode (v3.2) | `₹ poori line` select: 4 × ₹360 → total ₹360, per-unit ₹90 derive, amount ke neeche `= ₹90/kg`, rate list me 90/kg, edit me mode/lineTotal wapas, line↔unit toggle par number carry, ledger me Σ chip |
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
