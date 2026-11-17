#!/usr/bin/env python3
"""Rebuild Attendance-only, offline Hindi UI/PDF font subsets (SIL OFL 1.1).

Input is the unmodified Google Fonts NotoSansDevanagari[wdth,wght].ttf.
No network access; the full source font is deliberately not checked into Git.
Run with FontTools 4.68.0 + Brotli 1.2.1 for byte-identical subset output.
This does NOT touch the established salary/canteen PDF font block.
"""
import argparse
import base64
import hashlib
import io
import json
from pathlib import Path
import re

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

SOURCE_SHA256 = "14ec4af41f27482216d1c2229f417ff9b1425e1babb014e57d1d40d03229853e"
SOURCE_BLOB = "163f04bddc5a96fc523e4080466cac5c588f6594"
BLOCK = re.compile(r'(<script id="hisaab-attendance-font" type="application/json">)(.*?)(</script>)', re.S)
UNICODES = (list(range(0x20, 0x100)) + list(range(0x900, 0x980))
            + list(range(0x1CD0, 0x1D00)) + list(range(0x2000, 0x2070))
            + [0x20B9] + list(range(0xA8E0, 0xA900)))


def rebuild(source):
    if hashlib.sha256(source.read_bytes()).hexdigest() != SOURCE_SHA256:
        raise SystemExit("Unexpected source font. Review font provenance/license before updating its hash.")
    fonts = {}
    for weight in (400, 700):
        font = TTFont(source, recalcTimestamp=False)
        font = instantiateVariableFont(font, {"wght": weight, "wdth": 100}, inplace=True)
        font.recalcTimestamp = False
        options = subset.Options()
        options.flavor = "woff2"
        options.layout_features = ["*"]  # retain Devanagari shaping/substitution/positioning
        worker = subset.Subsetter(options=options)
        worker.populate(unicodes=UNICODES)
        worker.subset(font)
        font.flavor = "woff2"
        output = io.BytesIO()
        font.save(output)
        fonts[str(weight)] = base64.b64encode(output.getvalue()).decode("ascii")
    return {"family": "Noto Sans Devanagari", "license": "SIL Open Font License 1.1",
            "source": "google/fonts/ofl/notosansdevanagari", "sourceBlob": SOURCE_BLOB,
            "sourceSha256": SOURCE_SHA256, "fonts": fonts}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="local, unmodified Google Fonts source .ttf")
    parser.add_argument("--html", type=Path, default=Path("hisaab_v3.html"))
    parser.add_argument("--check", action="store_true", help="verify without editing the HTML")
    args = parser.parse_args()
    text = args.html.read_text()
    match = BLOCK.search(text)
    if not match:
        raise SystemExit("Attendance font JSON block not found")
    data = rebuild(args.source)
    if args.check:
        if json.loads(match[2]) != data:
            raise SystemExit("Attendance font subsets differ; rebuild or use the documented tool versions")
        print("Attendance font subsets are byte-identical")
    else:
        text = text[:match.start(2)] + json.dumps(data, separators=(",", ":")) + text[match.end(2):]
        args.html.write_text(text)
        print("Updated Attendance font subsets only:", args.html)


if __name__ == "__main__":
    main()
