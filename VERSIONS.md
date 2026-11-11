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
| v2.0 | 2026-11-11 | Auto-update loader + fixed working hours/overtime removed. Hourly worker = rate × total hours (naya Hours column). Monthly = ÷30 fixed, Sunday auto-exclude. Version badge. | `Hisaab-Pro-v2.0.html` |
