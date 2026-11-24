# HISAAB PDF fonts — Canteen reference + Attendance Hindi

Canteen’s reference-matched Segoe PDFs (v3.16+) and Attendance’s separate
Hindi-capable renderer (v3.19+) are described below. Current **v3.31** reuses that
bundled Unicode renderer only on a new filtered-report instance; shared PdfDoc,
salary/Attendance renderers and font payloads stay intact. v3.30 removed the full
Bikri/Kharcha summary slots and monthly columns (superseding the historical v3.18
label-only blanks). v3.31 retains that seven-column ledger in date × party reports.
[Saved parties / selected PDF instructions](CANTEEN-REPORTS.md).

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


## Company branding resources (v3.29)

Settings can now save an optional company logo once; see [Company logo](COMPANY-LOGO.md).
No font payload, glyph metric, panel stylesheet or license notice changed.
The shared vector writer has three audited image hooks: capture the saved logo,
draw it on each new page (body below the reserved slot), and repack optional JPEG
resources using real xref/stream boundaries. One logo image object is shared by
all pages. Attendance passes its existing shaped-text images into the same writer;
there is exactly one XObject dictionary, including both logo and text resources.
Raw Latin-1 Blob conversion retains valid binary lengths/xref offsets. With no
images, the old writer bytes are returned unchanged.

Conditional header/address/name/date slots and salary signatory wrapping prevent
logo/text overlap and long-company clipping; the no-logo path remains identical.
Browser salary/Canteen print inserts the saved raster image and waits for decode
plus the existing font-load Promise before printing. Report data and calculations
are not modified. New regression guards reverse only these exact image/header/
signature hooks, then compare the entire legacy body; finance/sync checks remain
strict. Independent QA reparses/rasterises 81 PDFs, including 44 branded direct-PDF
pages, long headings, four-page salary, six-page Canteen and Unicode/two-page
Attendance; original embedded font/license blocks are byte-compared to v3.28.


## Seven-column Canteen report presentation (v3.30)

Only the report builders and monthly column specification changed; the embedded
Segoe/Noto payloads, metrics/licenses, complete stylesheet, shared writer/table/
summary/closing primitives and company-logo resource/header helpers are byte-identical
to v3.29. Day/month summaries now draw one purchase row instead of three category
slots; no orphan sale/expense amounts or dashed underlines remain. Monthly
header/body/total all remove the same two columns; net closing labels omit the
category-formula words but **net arithmetic and original entries are unchanged**.

| Monthly PDF column | Width (pt) |
|---|---:|
| Date | 85 |
| Din | 40 |
| Entries | 50 |
| Saman | 85 |
| Net | 90 |
| Paid | 85 |
| Baki | 80.28 |
| **Total** | **515.28** |

This is the same full A4 content width (40 pt margins); money/count cells stay
right-aligned, and the monthly total merges only Date/Din. All six PDF designs,
day/month Web Share Files and browser print/Save-as-PDF are covered. Print keeps
its existing CSS layout/rounding and logo-decode/font-load wait. Customer-entered
names/notes, original sale/expense day records, separate item lines/own prices,
Net/Paid/Baki, amount words and signatures are deliberately retained. Existing
PDFs must be regenerated in Panel v3.30.

QA: **1,080 offline + 385 native** checks. Independent PyMuPDF/openpyxl reparses
**154 PDFs / 216 pages / 10 XLSX** (one PDF reproduces the legacy item-merge bug),
including 67 actual seven-column monthly ledgers, 38 native fixture ledgers with
exact cell values/order/geometry, and 100 proportional non-overlapping branded
direct-PDF pages. Every page rasterised/unrepaired/in bounds; five-sheet workbooks
and blank Advances retained. No app runtime dependency was added.


## v3.31 — combined date × party reports and actual Hindi print glyphs

The validated matching snapshot supplies every table and total in the new range
PDF, including each original item occurrence and own rate. All six themes and
saved company-logo resources use the existing table/header/closing helpers. Exact
valid, unfiltered day/month presets retain their legacy renderer; a malformed
calendar date in a legacy month forces the validated snapshot renderer, never
contaminating selected totals.

Only the filtered PdfDoc **instance** overrides text/wrap to call the existing
bundled Indic canvas/shaping/ActualText helpers when needed. Fonts warm in the
selection dialog and are awaited/rechecked at action time. Notes omitted by the
old default builders are excluded only from that legacy fast-path eligibility
check; new range reports include and render their full original notes. Hindi
names/items/notes are not transliterated or stripped.

The existing Latin-only Segoe subset can claim Indic code points with empty
glyphs. Merely appending an Indic fallback produced a searchable but visibly
blank print PDF in native QA. Unicode filtered print reports now choose
**Hisaab Indic before Hisaab Segoe** via a scoped inline family; the bundled
NotoSansDevanagari glyphs are actually embedded and visible. Font and logo-decode
waits, account/data/selection guards apply before printing. No global stylesheet
or embedded font/license changed. Direct PDFs retain shaped images with exact
UTF-16 ActualText; PDF viewers’ copy/search support varies.

Portable ASCII download filenames retain `.pdf` on Android/share targets that
can reject Unicode filenames; a pure Hindi party may use `Selected_Party` in
the filename, but its original Hindi name stays inside the PDF.

Independent current QA: **185 PDFs / 288 pages / 10 XLSX** including one legacy-bug
reproduction; all pages parsed unrepaired, rendered/in bounds. **52 combined-filter
PDFs**, **160 exact selected daily ledger rows**, **120 proportional non-overlapping
branded direct-PDF pages**, complete six-page/100-item report and Hindi direct/print
metadata/glyphs checked. Full release **1,203 offline + 515 native** checks;
[test guide](tests/README.md). Native OS share/print destinations are stubbed—no
actual delivery or physical-device/desktop-Excel/live-customer-cloud claim.
