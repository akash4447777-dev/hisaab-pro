#!/usr/bin/env python3
"""Optional independent Stock PDF validation; requires PyMuPDF (not app runtime).
Generate browser/unit artifacts first. Example from the repository root:
 python3 tests/stock-combo-pdfs.py .cache/stock-combo-native .cache/stock-easy-native
Only reads supplied PDFs/expected JSON. --render writes chosen QA PNGs/summary.
"""
import argparse
import json
import re
from pathlib import Path
import pymupdf as pdf

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('folders',nargs='+',type=Path)
parser.add_argument('--version',default='3.37')
parser.add_argument('--render',type=Path)
a=parser.parse_args()
files=sorted({file.resolve() for folder in a.folders for file in folder.glob('*.pdf')})
assert files, 'Generate actual PDF artifacts first'
if a.render:a.render.mkdir(parents=True,exist_ok=True)
summary={'pdfs':0,'pages':0,'logo_pages':0,'combo_pdfs':0,'files':[]}
compact=lambda value:re.sub(r'\s+','',value)
for file in files:
    doc=pdf.open(file)
    assert not doc.is_repaired and not doc.is_encrypted and len(doc)>0,(file,'repair/encryption/empty')
    text='\n'.join(page.get_text() for page in doc)
    is_combo='Stock Combo' in text
    if is_combo:
        summary['combo_pdfs']+=1
        assert '1 combo' in text and 'stock movements' in text,(file,'combo count')
        assert len(re.findall(r'Party / message context:',text))==1,(file,'one shared party block')
        assert len(re.findall(r'(?m)^Salesperson:',text))<=1,(file,'one common salesperson block')
        assert len(re.findall(r'(?m)^Tagged members:',text))<=1,(file,'one common tagged block')
    branded='logo' in file.name
    for i,page in enumerate(doc):
        assert abs(page.rect.width-595.28)<.1 and abs(page.rect.height-841.89)<.1,(file,i,'A4')
        page_text=page.get_text()
        assert 'Stock report · not an invoice' in page_text,(file,i,'report footer')
        assert 'Hisaab v'+a.version in page_text and f'Page {i+1} of {len(doc)}' in page_text,(file,i,'page/version footer')
        spans=[span for block in page.get_text('dict')['blocks'] if block['type']==0 for line in block['lines'] for span in line['spans'] if span['text'].strip()]
        for span in spans:
            r=pdf.Rect(span['bbox'])
            assert 39.6<=r.x0<=r.x1<=555.65 and 14.9<=r.y0<=r.y1<=813.3,(file,i,'printable bounds',span)
        logos=[image for image in page.get_images(full=True) if image[7]=='CompanyLogo']
        if branded:assert len(logos)==1,(file,i,'logo resource')
        for image in logos:
            rects=page.get_image_rects(image[0]);assert len(rects)==1,(file,i,'one proportional logo')
            r=rects[0];assert abs(r.width/r.height-image[2]/image[3])<.004,(file,i,'logo aspect ratio')
            assert all((r & pdf.Rect(span['bbox'])).get_area()<.35 for span in spans),(file,i,'text overlaps logo')
            summary['logo_pages']+=1
        # Only horizontal stroke rules; table header fills are intentionally behind text.
        for drawing in page.get_drawings():
            r=drawing['rect']
            if drawing['type']!='s' or r.width<300 or r.height>.01:continue
            for span in spans:
                b=pdf.Rect(span['bbox'])
                if min(r.x1,b.x1)-max(r.x0,b.x0)>.5:
                    assert not b.y0+.15<r.y0<b.y1-.15,(file,i,'rule crosses text',r,span)
        page.get_pixmap(matrix=pdf.Matrix(.75,.75),alpha=False)  # actually render every page
        summary['pages']+=1
    # Exact row completeness for full-history stress fixtures, not a visible-page count.
    for count in [55,84,85]:
        if f'{count}-' in file.name:
            numbers=[int(n) for n in re.findall(r'Movement (\d+) of '+str(count)+r'\b',text)]
            assert numbers==list(range(1,count+1)),(file,'every matching original history row',numbers)
    if file.name in ['four-product-five-movement-combo-logo.pdf','corrected-whole-combo-logo.pdf','one-party-combo.pdf','mixed-message.pdf']:
        ids=re.findall(r'Saved item · (smsg1_[a-f0-9]{64})',text)
        assert len(ids)==len(set(ids))==5,(file,'five distinct saved rows')
        assert '2026-11-21' in text and '+200 box' in text,(file,'independent receipt date/qty')
        assert '4 products' in text and '5 stock movements' in text,(file,'one four-product combo')
        assert all(name in text for name in ['Half cue sample 10mm','Carton sample','Cloth sample (green)']),(file,'every product')
        if file.name.startswith('corrected-'):
            assert '2026-11-22' in text and '−49 pcs' in text and '331 pcs' in text,(file,'corrected actual date/qty/full-ledger balance')
            assert 'Corrected common buyer' in text and 'Original message: 23/11 Example buyer' in text,(file,'new shared party / original source retained')
    if file.name=='one-filtered-movement-logo.pdf':
        assert len(re.findall(r'Movement \d+ of 1\b',text))==1 and '2026-11-21' not in text,(file,'exactly one filter match')
    if '50-product-combo' in file.name:
        expected=json.loads((file.parent/'50-product-combo-expected.json').read_text())
        assert all(compact(name) in compact(text) for name in expected['names']+expected['members']+[expected['party']]),(file,'complete long product/party/Hindi text')
        ids=re.findall(r'Saved item · (smsg1_[a-f0-9]{64})',text)
        assert len(ids)==50 and set(ids)==set(expected['ids']),(file,'all 50 rows, no duplicates')
        assert len(re.findall(r'(?m)^2026-11-28$',text))==50,(file,'all 50 actual table dates')
        for unit,count in [('box',13),('pcs',13),('roll',12),('bundle',12)]:
            assert len(re.findall(r'(?m)^19 '+unit+r'$',text))==count,(file,'per-product available / exact unit',unit)
    summary['pdfs']+=1
    summary['files'].append({'name':file.name,'pages':len(doc),'combo':is_combo})
    if a.render and is_combo:
        for i in sorted({0,len(doc)-1}):doc[i].get_pixmap(matrix=pdf.Matrix(1.1,1.1),alpha=False).save(a.render/(file.stem+f'-page-{i+1}.png'))
    print('PASS',file.name,len(doc),'pages')
if a.render:(a.render/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(summary,ensure_ascii=False,indent=2))
