# Hisaab Pro — tests (developer only)

Ye folder **app ke liye zaroori nahi**. `hisaab_v3.html` / `Hisaab-Pro-v3.1.html` akeli file me chalti hai —
kisi install ki zaroorat nahi. Ye tests sirf tab chalao jab code me change kiya ho aur check karna ho
ki **Canteen module** (aur purane salary features) toot to nahi gaye.

## Chalane ka tarika

```bash
cd tests
npm install          # ek hi baar (jsdom install hota hai)
npm test             # canteen module (~150 checks) + loader (~25 checks)
node canteen.test.js ../Hisaab-Pro-v3.1.html   # kisi aur file par chalana ho
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
| Validation | khaali entry, bina rate wali entry |
| Ledger math | `net = bikri − saman − kharcha`, din/mahine ka roll-up |
| Payment | baki chukta, activity log |
| Delete / Undo / Restore | toast undo + Activity se restore |
| Duplicate | entry copy, date aaj, paid reset |
| Filters | search (focus safe), type, month/all/custom range |
| Rate list | add / edit / delete / undo, entry me rate auto-fill |
| CSV · Print · WhatsApp | header, lump-sum vs item-wise rows, day + month print |
| Persistence | localStorage me canteen + salary data |
| Purana backup | bina `canteen` key wala JSON restore → key auto-create |
| Canteen-only wipe | sirf canteen erase, workers safe, undo |
| Regression | hisaab / ledger / workers / records / dashboard pehle jaise |
