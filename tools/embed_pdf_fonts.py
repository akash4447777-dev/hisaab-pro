#!/usr/bin/env python3
"""Rebuild the document-embedded Segoe UI subsets in a standalone Hisaab HTML.

Developer-only: pip install fonttools. Supply locally licensed Regular, Bold and
Black TrueType files; full desktop font files are deliberately not kept in Git.
Existing Microsoft copyright/name/licensing records are retained in each subset.
See PDF-FONTS.md. Runtime PDF generation needs no Python, CDN or font download.
"""
import argparse
import base64
import io
import json
import re
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

# A single-byte document encoding, with two unused/overridden WinAnsi positions.
# The PDF /Differences and /ToUnicode tables use exactly this same map.
CODEPOINTS = []
for byte in range(32, 256):
    try:
        char = bytes([byte]).decode("cp1252")
        code = ord(char) if byte != 127 else 0
    except UnicodeDecodeError:
        code = 0
    CODEPOINTS.append(code)
CODEPOINTS[128 - 32] = 0x20B9  # real Indian rupee, not "Rs."
CODEPOINTS[129 - 32] = 0x2212  # mathematical minus, as in the reference PDF


def font_payload(path, weight):
    font = TTFont(path, recalcTimestamp=False)
    flags = font["OS/2"].fsType
    if flags & (0x0002 | 0x0100 | 0x0200):
        raise ValueError(f"{path}: embedding/subsetting not permitted (fsType={flags})")
    name = font["name"].getDebugName(6)
    options = subset.Options()
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 8, 9, 13, 14, 16, 17]
    options.name_legacy = True
    options.name_languages = [0x409]
    options.glyph_names = True
    options.recalc_timestamp = False
    sub = subset.Subsetter(options=options)
    sub.populate(unicodes=set(CODEPOINTS) - {0})
    sub.subset(font)
    cmap = font.getBestCmap()
    missing = [hex(c) for c in CODEPOINTS if c and c not in cmap]
    if missing:
        raise ValueError(f"{path}: missing document characters: {missing}")
    scale = 1000 / font["head"].unitsPerEm
    widths = [round(font["hmtx"][cmap[c]][0] * scale, 3) if c else 0 for c in CODEPOINTS]
    head, hhea, os2 = font["head"], font["hhea"], font["OS/2"]
    stream = io.BytesIO()
    font.save(stream)
    return {
        "name": name,
        "weight": weight,
        "widths": widths,
        "bbox": [round(getattr(head, key) * scale) for key in ("xMin", "yMin", "xMax", "yMax")],
        "ascent": round(hhea.ascent * scale),
        "descent": round(hhea.descent * scale),
        "capHeight": round(getattr(os2, "sCapHeight", head.unitsPerEm * .7) * scale),
        "data": base64.b64encode(stream.getvalue()).decode("ascii"),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("html", type=Path)
    for name in ("regular", "bold", "black"):
        parser.add_argument("--" + name, type=Path, required=True)
    args = parser.parse_args()
    data = {name: font_payload(getattr(args, name), weight)
            for name, weight in (("regular", 400), ("bold", 700), ("black", 900))}
    data["codepoints"] = CODEPOINTS
    block = '<script id="hisaab-pdf-fonts" type="application/json">\n' + json.dumps(data, ensure_ascii=True, indent=2) + '\n</script>'
    html = args.html.read_text(encoding="utf-8")
    pattern = r'<script id="hisaab-pdf-fonts" type="application/json">.*?</script>'
    if re.search(pattern, html, re.S):
        html = re.sub(pattern, lambda _: block, html, count=1, flags=re.S)
    else:
        html = html.replace("<script>", block + "\n<script>", 1)
    args.html.write_text(html, encoding="utf-8")
    for name in ("regular", "bold", "black"):
        print(name, data[name]["name"], len(base64.b64decode(data[name]["data"])), "embedded bytes")


if __name__ == "__main__":
    main()
