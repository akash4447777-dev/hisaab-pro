#!/usr/bin/env python3
"""Optional independent Stock PDF validation; requires PyMuPDF (not app runtime).
Generate browser/unit artifacts first. Example from the repository root:
 python3 tests/stock-combo-pdfs.py .cache/stock-combo-native .cache/stock-easy-native
Only reads supplied PDFs/expected JSON. --render writes chosen QA PNGs/summary.
"""
import argparse
import json
import re
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
import pymupdf as pdf

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('folders',nargs='+',type=Path)
parser.add_argument('--version',default='3.44')
parser.add_argument('--render',type=Path)
a=parser.parse_args()
files=sorted({file.resolve() for folder in a.folders for file in folder.glob('*.pdf')})
assert files, 'Generate actual PDF artifacts first'
if a.render:a.render.mkdir(parents=True,exist_ok=True)
summary={'pdfs':0,'pages':0,'logo_pages':0,'combo_pdfs':0,'sale_pdfs':0,'files':[]}
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
    is_sale='Stock Sale · 1 Sale' in text
    if is_sale:summary['sale_pdfs']+=1
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
    # v3.41 native design fixtures: independently extract actual rendered cells,
    # not just a renderer trace or the presence of numbers somewhere in the PDF.
    if file.name.startswith('premium-') and (file.parent/'expected.json').exists():
        expected=json.loads((file.parent/'expected.json').read_text())
        assert 'OVERVIEW' in text and 'STOCK HEALTH' in text,(file,'approved premium overview')
        assert 'SAMPLE DATA - DESIGN PREVIEW' not in text and 'DESIGN CONCEPT' not in text,(file,'not the mockup image')
        if file.name=='premium-overview-logo.pdf':
            assert len(doc)==1 and '7 Healthy / 1 Low' in text,(file,'eight-row one-page layout / actual health')
            page=doc[0]
            for row in expected['overview']:
                matches=page.search_for(row['name']);assert len(matches)==1,(file,'one product row',row['name'])
                row_spans=[s for b in page.get_text('dict')['blocks'] if b['type']==0 for line in b['lines'] for s in line['spans']]
                baseline=next(s['origin'][1] for s in row_spans if s['text']==row['name'])
                cell=lambda left,right:compact(''.join(s['text'] for s in row_spans if left<=(s['bbox'][0]+s['bbox'][2])/2<right and abs(s['origin'][1]-baseline)<=3))
                assert cell(223,268)==row['unit'],(file,row['name'],'exact unit cell')
                for left,right,key in [(268,342,'totalIn'),(342,392,'totalOut'),(392,442,'totalSale'),(442,548,'available')]:
                    assert cell(left,right)==str(row[key]),(file,row['name'],key,cell(left,right),row[key])
                assert 'Min: '+str(row['minQty'])+' '+row['unit'] in text,(file,'saved minimum')
            assert len(re.findall(r'Opening: 2026-11-01',text))==8,(file,'eight real dated products')
            assert all(value in text for value in ['AVAILABLE BY UNIT','166','60','12','28','REORDER WATCH: 1 product']),(file,'exact separate unit totals / warning')
        if file.name=='premium-128-long-products-logo.pdf':
            assert len(re.findall(r'Opening: 2026-11-01',text))==128,(file,'all128 dated products')
            assert all(compact(row['name']) in compact(text) for row in expected['stress']),(file,'all128 complete long names')
            assert text.count('OVERVIEW')==1 and text.count('Available Stock · continued')==len(doc)-1,(file,'compact continuation headers')
        if file.name=='premium-many-units-logo.pdf':
            assert len(re.findall(r'Opening: 2026-11-01',text))==61,(file,'all61 products')
            for row in expected['units']:
                assert compact(text).count(compact(row['unit']))>=3,(file,'unit row + minimum + total tile',row['unit'])
        if 'hindi' in file.name:
            assert all(compact(value) in compact(text) for value in expected['hindi'].values()),(file,'full shaped Hindi company / address / product / exact unit')
            # Header JPEG-backed Indic text must be flattened onto navy, not onto
            # a white rectangle that would spoil the approved dark masthead.
            checked=0
            for image in doc[0].get_images(full=True):
                if not image[7].startswith('ATT'):continue
                rects=doc[0].get_image_rects(image[0])
                if not rects:continue  # shared resource drawn on another page
                r=rects[0]
                if r.y0<100:
                    rgb=pdf.Pixmap(doc,image[0]).pixel(0,0)
                    assert all(abs(v-w)<12 for v,w in zip(rgb[:3],(12,23,38))),(file,'Indic masthead image background',rgb)
                    checked+=1
            assert checked>=2,(file,'native shaped company name and address')
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
    if file.name=='fuzzy-two-product-combo-logo.pdf':
        ids=re.findall(r'Saved item · (smsg1_[a-f0-9]{64})',text)
        assert len(ids)==len(set(ids))==2,(file,'two saved fuzzy rows, not extra products')
        assert '2 products' in text and '2 stock movements' in text,(file,'one combined combo')
        assert all(value in compact(text) for value in map(compact,['Plastic scoreboard','Plastc scoreboard','alpha beta gamma delta epsilon','Sales Employee','Delivery Employee','2026-11-23','−2 pcs','−2 box','8 pcs','8 box'])),(file,'canonical names, original misspelled source, shared roles and independent exact units/dates/ledger')
    if file.name=='received-14-product-combo-logo.pdf':
        expected=json.loads((file.parent/'received-list-expected.json').read_text())
        assert '14 products' in text and '14 stock movements' in text,(file,'one complete received-stock combo')
        assert all(compact(name) in compact(text) for name in expected['names']),(file,'every exact received product name')
        ids=re.findall(r'Saved item · (smsg1_[a-f0-9]{64})',text)
        assert len(ids)==len(set(ids))==14 and set(ids)=={row['id'] for row in expected['rows']},(file,'all14 saved receipts exactly once')
        assert len(re.findall(r'(?m)^2026-11-25$',text))==14,(file,'all14 explicit receipt dates in the table')
        assert all(compact('+'+str(row['qty'])+' '+row['unit']) in compact(text) for row in expected['rows']),(file,'every independent exact received quantity/unit')
        assert 'Salesperson:' not in text and 'Delivery / receiver:' not in text,(file,'incoming-only receipt has no invented outgoing roles')
        assert 'Supplier not given' in text and 'not given' in text,(file,'missing supplier is transparent')
        assert 'Packingcrate(100Pcs)' in compact(text) and '+12box' in compact(text),(file,'pack number is not a conversion')
    if '50-product-combo' in file.name:
        expected=json.loads((file.parent/'50-product-combo-expected.json').read_text())
        assert all(compact(name) in compact(text) for name in expected['names']+expected['members']+[expected['party']]),(file,'complete long product/party/Hindi text')
        ids=re.findall(r'Saved item · (smsg1_[a-f0-9]{64})',text)
        assert len(ids)==50 and set(ids)==set(expected['ids']),(file,'all 50 rows, no duplicates')
        assert len(re.findall(r'(?m)^2026-11-28$',text))==50,(file,'all 50 actual table dates')
        for unit,count in [('box',13),('pcs',13),('roll',12),('bundle',12)]:
            assert len(re.findall(r'(?m)^19 '+unit+r'$',text))==count,(file,'per-product available / exact unit',unit)
    # v3.44: verify the REAL bulk PDF table and independently derive each
    # per-product balance/unit total. Original spelling rows stay in the source;
    # an unresolved item is not permitted to appear in the saved-only PDF.
    if file.name in ['bulk-partial-logo.pdf','bulk-complete-logo.pdf']:
        expected=json.loads((file.parent/'expected-bulk.json').read_text())
        rows=expected['partial' if 'partial' in file.name else 'complete']
        ids=re.findall(r'Saved item · (smsg1_[a-f0-9]{64})',text)
        assert len(ids)==len(set(ids))==len(rows) and set(ids)=={r['id'] for r in rows},(file,'all actual saved bulk receipts exactly once')
        balances={};units={}
        number=lambda n:format(Decimal(str(n)).normalize(),'f')
        for row in rows:
            assert row['type']=='in' and row['date']=='2026-11-25',(file,'actual incoming date, not a guessed opening')
            key=row['productId'];unit=row['unit'];quantity=Decimal(str(row['qty']))
            before=balances.get(key,Decimal('10') if row['productName'] in ['Plastic scoreboard','Maple hanger'] else Decimal('0'))
            balances[key]=before+quantity;units[unit]=units.get(unit,Decimal('0'))+quantity
            cells=row['date']+row['productName']+'Stock In'+'+'+number(quantity)+' '+unit+number(balances[key])+' '+unit+'not given'
            assert compact(cells) in compact(text),(file,'exact real product/date/type/quantity/unit/full-ledger balance table cells',row['productName'],quantity)
        for unit,total in units.items():
            assert compact(unit+'In'+number(total)+'Out0Sales0') in compact(text),(file,'independent exact-unit quantity total',unit)
        assert text.count('Ceramic marker')==3,(file,'two separate canonical movement rows, one literal source line; no duplicated product')
        assert 'Ceramc marker 4 pieces' in text,(file,'original uncorrected source spelling retained')
        assert 'Salesperson:' not in text and 'Delivery / receiver:' not in text,(file,'no invented outgoing roles')
        if 'partial' in file.name:assert 'Maple hanger' not in text and len(rows)==3,(file,'unresolved zero quantity NOT exported as stock')
        else:assert len(rows)==4 and 'Maple hanger 0 sets' in text,(file,'explicit corrected qty2 in table, original bad qty0 in provenance only')
    # v3.43: independently recompute real PDF price cells/totals with Decimal,
    # not the application's BigInt implementation or its quoted total trace.
    if file.name in ['sale-package-logo.pdf','sale-50-products-logo.pdf']:
        expected=json.loads((file.parent/('sale-50-products-expected.json' if '50-products' in file.name else 'expected-sale.json')).read_text())
        rows=expected['rows'];gross_total=discount_total=net_total=0
        money=lambda n:f'{n//100:,}.{n%100:02d}'
        for row in rows:
            sale=row['sale'];gross=int((Decimal(str(row['qty']))*sale['rate']).quantize(Decimal('1'),rounding=ROUND_HALF_UP))
            off=int((Decimal(gross)*sale['discount']/10000).quantize(Decimal('1'),rounding=ROUND_HALF_UP)) if sale['discountType']=='percent' else sale['discount']
            net=gross-off;gross_total+=gross;discount_total+=off;net_total+=net
            percentage=f" ({sale['discount']//100}.{sale['discount']%100:02d}%)" if sale['discountType']=='percent' else ''
            cells=row['productName']+str(row['qty'])+' '+row['unit']+money(sale['rate'])+' / '+row['unit']+money(off)+percentage+money(net)
            assert compact(cells) in compact(text),(file,'complete actual product + ORIGINAL qty/unit + independently calculated rate/discount/net cells',row['productName'])
        assert compact(f'Subtotal ₹{money(gross_total)} · Discount ₹{money(discount_total)} · FINAL AMOUNT ₹{money(net_total)}') in compact(text),(file,'exact independently rounded money totals')
        ids=re.findall(r'Saved item · (sl_[a-zA-Z0-9_-]+)',text)
        assert len(ids)==len(set(ids))==len(rows) and set(ids)=={r['id'] for r in rows},(file,'all saved priced lines exactly once')
        assert 'Customer / party: '+rows[0]['party'] in text and '17:30 (local clock as entered)' in text,(file,'actual shared date/time/party')
        assert 'No mixed-unit quantity' in text and 'not an invoice' in text,(file,'no invented invoice/payment/unit conversion')
        if '50-products' in file.name:
            assert len(doc)>2 and compact('उदाहरण बिलियर्ड्स') in compact(text),(file,'multi-page / original shaped Hindi company')
            assert len(re.findall(r'(?m)^Salesperson:',text))==1 and len(re.findall(r'(?m)^Customer / party:',text))==1,(file,'one common customer / roles, not repeated per product')
    if file.name=='sale-filtered-history-logo.pdf':
        assert '1 stock movements' in text and compact('−2 Boxes') in compact(text) and 'Maple hanger' not in text,(file,'ONLY matching original product/quantity')
        assert compact('Sale pricing: ₹100.25 / Boxes · Subtotal ₹200.50 · Discount ₹10.03 · Final ₹190.47') in compact(text),(file,'correct matching line price')
        assert compact('PRICED MATCHING SALE ROWS: 1 of 1. Subtotal ₹200.50 · Discount ₹10.03 · Final ₹190.47.') in compact(text),(file,'filtered financial totals, not whole Sale totals')
    if file.name=='sale-unsaved-draft-excluded-history.pdf':
        assert '2 stock movements' in text and compact('−2 Boxes') in compact(text) and compact('−1.25 sets') in compact(text),(file,'only two persisted quantities, not the unsaved3')
        assert compact('PRICED MATCHING SALE ROWS: 2 of 2. Subtotal ₹263.00 · Discount ₹12.53 · Final ₹250.47.') in compact(text),(file,'saved-only money totals')
        assert '345.71' not in text and compact('−3 Boxes') not in compact(text),(file,'unsaved quantity/price changes excluded')
    summary['pdfs']+=1
    summary['files'].append({'name':file.name,'pages':len(doc),'combo':is_combo,'sale':is_sale})
    if a.render and (is_combo or is_sale):
        for i in sorted({0,len(doc)-1}):doc[i].get_pixmap(matrix=pdf.Matrix(1.1,1.1),alpha=False).save(a.render/(file.stem+f'-page-{i+1}.png'))
    print('PASS',file.name,len(doc),'pages')
if a.render:(a.render/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(summary,ensure_ascii=False,indent=2))
