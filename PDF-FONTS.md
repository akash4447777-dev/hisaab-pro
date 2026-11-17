# HISAAB PDF fonts — Canteen reference + Attendance Hindi

Canteen’s reference-matched Segoe PDFs (v3.16+) and Attendance’s separate
Hindi-capable report renderer (v3.19+) are described below. Attendance does not
change the existing salary/canteen PDF font payloads, drawing geometry, six
templates or WhatsApp file generation. The indicated Bikri/Kharcha summary-label
spaces remain blank as shipped in v3.18, with amounts and rows unchanged.

## Canteen reference (v3.16)

## Re-analysis ka result

Attached Windows/Chrome PDF (`Skia/PDF m157`) me Helvetica nahi thi:

| Use | Actual embedded font | Size |
|---|---|---|
| Body / caption / signature | Segoe UI Regular | body 9pt; signature 8.25pt |
| Net heading / amount in words | Segoe UI Bold | 8.25pt / 8.625pt |
| Large net value | Segoe UI Black | 16.5pt |
| Footer note / version | Segoe UI Regular | 7.5pt |

Reference ke 67 Regular, 57 Bold aur 26 Black mapped glyphs ke decomposed
outlines supplied fonts se compare kiye — **har reference glyph identical**.
Rupee amounts ki advance widths bhi reference se match karti hain. Sirf
Helvetica ka dash ya font-size badalne se ye match nahi milta tha.

## Runtime

- Teen TrueType **document subsets** HTML me inline hain: printable WinAnsi,
  saare ASCII letters/digits, asli `₹`, mathematical minus `−`, en/em dash.
  Reference PDF ka incomplete subset seedha reuse nahi kiya: usme kai letters
  aur Bold/Black digits nahi the; naye party/item names toot jaate.
- PDF me `/FontFile2`, real `/Widths`, custom encoding aur `/ToUnicode` CMap.
  Copy/search me `₹`/`−`/`—` wapas proper Unicode nikalta hai.
- Print me wahi inline fonts `@font-face` se load hote hain. Print dialog font
  ready hone ke baad khulta hai. Koi font CDN, runtime fetch ya browser/system
  font par dependency nahi — downloaded single HTML bhi self-contained hai.
- 6 table templates aur WhatsApp download/share same PDF builder use karte hain.
- **Canteen’s existing renderer:** unsupported non-Latin scripts pehle ki tarah
  cleanly drop hote hain; the v3.16 reference renderer does not implement Hindi
  shaping. This does **not** describe the separate v3.19 Attendance renderer below.

## Bottom block (Canteen)

Dark rectangle hata kar reference ka **white / #ababab net row** use hota hai.
Uske neeche rounded dashed white in-words box, 39pt (=52px) writing gap,
135pt (=180px) signature lines, phir statement note left aur version right.
Footer fixed page-bottom par nahi; signatures ke baad normal flow me aata hai.

Poore closing block ki actual height (wrapped words, owner name aur custom
note samet) measure karke ek saath next page par bhejte hain. Continuation
sheets par compact page markers rehte hain; final footer reference jaisa
sirf `Hisaab v3.16` dikhata hai. Table continuation y-coordinate bhi reset hota
hai; 60-item/30-party silent caps nahi hain. Saved amounts/data nahi badalte.

Existing ledger column widths/margins retain hain: bottom unhi table edges
par align hota hai. Text weights, box/signature dimensions aur vertical
spacing supplied reference se measured hain.

## Font notices / rebuilding

**Segoe UI is proprietary Microsoft font software, not an MIT/OFL font.**
Segoe is a trademark of the Microsoft group of companies. Regular/Bold source
notices: © 2022 Microsoft Corporation. Black source notice: © 2025 Microsoft
Corporation. All Rights Reserved. Existing copyright, name and license records
are retained in the document-embedded subsets. No application/software license
should be read as relicensing these fonts or granting standalone font rights.

The font embedding flag is `fsType=8` (editable document embedding). Microsoft
supplied-font terms permit embedding in content subject to the applicable
Microsoft-product license and embedding restrictions. Full desktop font files
are **not** checked into this repository or offered as a separate download.
Font source notice/terms remain in the font name tables. Maintainers rebuilding
or redistributing should ensure their applicable font-use rights.

Development inputs used for matching were Segoe UI Regular/Bold 5.67 (font
package `@fontpkg/segoe-ui` 5.67.0) and Segoe UI Black 5.71 (SegoeUI-Font source).
Their referenced glyph outlines match the older 5.62 / Black 2.02 fonts in the
user-supplied PDF. Public package/repository availability is not a font license.

Rebuild from **locally licensed** font files, without committing those inputs:

```bash
python3 -m venv .venv
.venv/bin/pip install fonttools
.venv/bin/python tools/embed_pdf_fonts.py hisaab_v3.html \
  --regular /local/licensed/segoeui.ttf \
  --bold /local/licensed/segoeuib.ttf \
  --black /local/licensed/seguibl.ttf
```

The generator checks embedding/subsetting flags and required glyph coverage.
It preserves name/copyright/license records and emits deterministic inline data.
After changing the main file, create a **new** release HTML; never overwrite an
older release.

## Verification

```bash
cd tests
npm ci
npm test
# Optional local PDF examples / pagination stress fixtures (not for Git):
node pdf.test.js --artifacts ../.cache/pdf-qa
# Check a release copy as well:
HISAAB_HTML=../Hisaab-Pro-v3.20.html node pdf.test.js
```

`pdf.test.js` checks real embedded-font payloads, full ASCII coverage,
rupee/minus/em-dash mappings, xref byte offsets, stream lengths, exact closing
geometry, six templates, large numbers, 91 products/parties, a row taller than
a page, custom wrapped notes/names, browser print structure, data non-mutation,
and the actual WhatsApp file bytes. PyMuPDF rendering/text extraction was also
used during reference comparison; it is not a runtime or npm-test dependency.

Real Chromium smoke check bhi pass: teen inline font weights load, white/grey
print styles, browser PDF download, mobile-viewport WhatsApp file, aur network
blocked `file://` standalone HTML. Browser console me runtime errors nahi.


## Attendance Hindi renderer (v3.19)

Attendance reports do not route Hindi names/notes through WinAnsi. Their Latin
text still uses the established embedded vector Segoe font. A line containing
unsupported complex-script Unicode is shaped by the browser’s Canvas text engine
with the bundled **Noto Sans Devanagari** static 400/700 WOFF2 subsets (CSS alias
`Hisaab Indic`). Layout/shaping tables are retained. Fonts are loaded before PDF
creation; no font CDN/network connection is needed.

The shaped line is embedded as a 4× high-DPI JPEG image with UTF-16BE PDF
`ActualText` (including surrogate pairs), so Hindi appearance is preserved and
text remains extractable/searchable in supporting PDF readers. Grapheme-aware
wrapping avoids splitting Devanagari combining syllables. This is not a claim of
vector Indic glyphs or guaranteed embedded coverage for every world script/emoji:
other scripts rely on available browser fallback fonts. Excel stores Unicode
text directly. Existing canteen PDF/print/WhatsApp paths are unchanged.

### Noto notice and pinned source

Copyright 2022 The Noto Project Authors
(https://github.com/notofonts/devanagari). **SIL Open Font License 1.1.**
Full notice/license: [`assets/OFL-NotoSansDevanagari.txt`](assets/OFL-NotoSansDevanagari.txt).
The **complete notice is also inline** as `#hisaab-attendance-font-license` in each
new source/release HTML, so distributing a single offline HTML retains it.
The Noto subsets remain under OFL, not the proprietary Segoe terms above.

- Source: Google Fonts `ofl/notosansdevanagari/NotoSansDevanagari[wdth,wght].ttf`.
- Immutable GitHub blob: `163f04bddc5a96fc523e4080466cac5c588f6594`
  ([API](https://api.github.com/repos/google/fonts/git/blobs/163f04bddc5a96fc523e4080466cac5c588f6594)).
- Source SHA-256: `14ec4af41f27482216d1c2229f417ff9b1425e1babb014e57d1d40d03229853e`.
- Static normal-width subsets: **54,276 bytes (400)** / **57,748 bytes (700)**.
  Printable Latin, Devanagari/extended/Vedic marks, punctuation and rupee are kept.
  Full upstream TTF and generated standalone subset files are not committed.

Rebuild/check with the pinned local source font (no network inside the tool):

```bash
.venv/bin/pip install fonttools==4.68.0 brotli==1.2.1
.venv/bin/python tools/embed_attendance_font.py /local/NotoSansDevanagari.ttf --check
# To replace only Attendance’s inline JSON font data:
.venv/bin/python tools/embed_attendance_font.py /local/NotoSansDevanagari.ttf
```

The tool verifies the source hash, fixes width/weight, subsets without timestamp
changes and records source provenance. Its `--check` result is byte-identical
with these tool versions. It never rewrites the established salary/canteen font
block. After rebuilding, make a new release copy and run the full suite.

### Attendance verification

`attendance.test.js` checks both offline WOFF2 signatures/provenance/full notice,
PDF xrefs/stream lengths/text bounds/pagination, real XLSX ZIP/CRC/XML/numeric cells,
Unicode and literal formula-looking text, native Blob names/MIME, blocked-download
ready links and unchanged salary/canteen data. Optional `attendance.browser.js`
uses real Chromium forms and native Latin/Hindi PDF/XLSX downloads. A browser
without current user activation gets a persistent **Save PDF** link instead of a
false successful-download claim; close/regeneration revokes the old Blob URLs.

Native Hindi reports for **अजय कुमार / प्रबंधक**, with the note **रात्रि पाली पूरी हुई**,
were independently rendered/extracted with PyMuPDF and opened with openpyxl;
Hindi shaping/text, totals, three sheets, freeze/filter headers and numeric types
were checked. Artifacts stay in ignored `.cache/`; these Python tools and
Playwright are optional developer QA, not app runtime dependencies.
