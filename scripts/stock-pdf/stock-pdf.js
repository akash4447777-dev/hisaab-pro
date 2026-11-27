/* v3.41 PREMIUM STOCK PDF BEGIN
   Approved navy / emerald report design. Presentation-only: the existing report
   snapshot, exact units, dated ledger, filters, combo provenance and export guards
   remain authoritative. No seed, migration, store write or network request.
*/
function spdSummary(report) {
  const stock = report.kind === 'stock', units = new Map(), products = new Set();
  let low = 0;
  report.rows.forEach(row => {
    products.add(stock ? row.id : row.productId);
    if (stock && row.low) low++;
    if (!units.has(row.unit)) units.set(row.unit, {unit:row.unit, available:0n, in:0n, out:0n, sale:0n});
    const total = units.get(row.unit);
    // Per-product ledger values are safe integer thousandths; cross-product
    // totals can exceed Number.MAX_SAFE_INTEGER. Never round a grouped total.
    const amount = BigInt(Math.round((stock ? row.available : row.qty) * STK_SCALE));
    if (stock) total.available += amount;
    else total[row.type] += amount;
  });
  return {products:products.size, movements:report.rows.length, low, healthy:report.rows.length-low,
    units:Array.from(units.values()).sort((a,b)=>a.unit.localeCompare(b.unit))};
}
function spdQuantity(scaled) {
  const negative = scaled < 0n; if (negative) scaled = -scaled;
  const fraction = String(scaled % 1000n).padStart(3,'0').replace(/0+$/,'');
  return (negative ? '−' : '') + (scaled / 1000n).toLocaleString('en-IN') + (fraction ? '.'+fraction : '');
}
/* The common Indic renderer deliberately uses white JPEG backgrounds. Stock's
   coloured masthead / rows need the same shaped text and Unicode ActualText on
   their actual background, without changing any other module's PDF writer. */
function spdText(p, x, y, size, value, options={}) {
  value = String(value == null ? '' : value);
  if (!options.background || !attPdfNeedsImage(value)) return attPdfText(p,x,y,size,value,options);
  let width = attPdfMeasure(value,size,options.bold);
  if (options.maxWidth && width > options.maxWidth) { size *= options.maxWidth/width; width = options.maxWidth; }
  const scale=4, canvas=document.createElement('canvas'), ctx=canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot render Unicode PDF text.');
  ctx.font=attCanvasFont(size*scale,options.bold);
  const measure=ctx.measureText(value), ascent=Math.ceil(measure.actualBoundingBoxAscent||size*scale), descent=Math.ceil(measure.actualBoundingBoxDescent||size*scale*.3), pad=2;
  canvas.width=Math.ceil(measure.width)+pad*2; canvas.height=ascent+descent+pad*2;
  const rgb=c=>'rgb('+c.map(v=>Math.round(v*255)).join(',')+')';
  ctx.fillStyle=rgb(options.background);ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.font=attCanvasFont(size*scale,options.bold);ctx.fillStyle=rgb(options.color||[.06,.09,.16]);ctx.textBaseline='alphabetic';ctx.fillText(value,pad,pad+ascent);
  const bytes=atob(canvas.toDataURL('image/jpeg',.98).split(',')[1]);
  p.attImages=p.attImages||[];const name='ATT'+(p.attImages.length+1);p.attImages.push({name,width:canvas.width,height:canvas.height,bytes});
  let xx=x-pad/scale;if(options.align==='right')xx-=width;else if(options.align==='center')xx-=width/2;
  const actual=Array.from(value,ch=>{const n=ch.codePointAt(0);if(n<=65535)return n.toString(16).padStart(4,'0');const c=n-65536;return (0xd800+(c>>10)).toString(16)+(0xdc00+(c&1023)).toString(16);}).join('');
  p.op('/Span << /ActualText <FEFF'+actual+'> >> BDC q '+(canvas.width/scale).toFixed(2)+' 0 0 '+(canvas.height/scale).toFixed(2)+' '+xx.toFixed(2)+' '+(y-(descent+pad)/scale).toFixed(2)+' cm /'+name+' Do Q EMC');
}
function stePdfString(report) {
  const p=new PdfDoc();p.logo=companyLogoData(report.settings.companyLogo||'');p.pages=[];
  const summary=spdSummary(report), stock=report.kind==='stock';
  const navy=[.047,.09,.15], emerald=[.04,.67,.42], green=[.035,.34,.24], ink=[.07,.12,.18], muted=[.36,.42,.47], line=[.85,.89,.90], white=[1,1,1], mint=[.92,.98,.95], paper=[.985,.985,.976], amber=[.70,.37,.035], paleAmber=[1,.967,.90];
  const bottom=71, companyName=String(report.settings.shopName||'Hisaab');
  const company=[report.settings.address,report.settings.phone?'Ph: '+report.settings.phone:'',report.settings.ownerName].filter(Boolean).join(' · ');
  const companyX=M+(p.logo?60:0), companyWidth=RIGHT-companyX-126;
  const nameLines=attPdfWrap(companyName,12,companyWidth,true), companyLines=attPdfWrap(company,7,companyWidth,false);
  const text=(x,yy,size,value,opt={})=>spdText(p,x,yy,size,value,{color:ink,...opt});
  const wrap=(value,size,width,bold)=>attPdfWrap(String(value),size,width,bold);
  let y=0, tableIndex=0;
  const round=(x,yy,w,h,r,fill,stroke)=>{
    r=Math.min(r,w/2,h/2);const k=r*.55228475,n=v=>Number(v).toFixed(2);
    p.op('q [] 0 d .6 w '+fill.join(' ')+' rg '+(stroke||fill).join(' ')+' RG '+[
      n(x+r),n(yy),'m',n(x+w-r),n(yy),'l',n(x+w-r+k),n(yy),n(x+w),n(yy+r-k),n(x+w),n(yy+r),'c',
      n(x+w),n(yy+h-r),'l',n(x+w),n(yy+h-r+k),n(x+w-r+k),n(yy+h),n(x+w-r),n(yy+h),'c',
      n(x+r),n(yy+h),'l',n(x+r-k),n(yy+h),n(x),n(yy+h-r+k),n(x),n(yy+h-r),'c',
      n(x),n(yy+r),'l',n(x),n(yy+r-k),n(x+r-k),n(yy),n(x+r),n(yy),'c h B Q'].join(' '));
  };
  const arc=(cx,cy,r,start,end,color,width)=>{
    const parts=Math.max(1,Math.ceil(Math.abs(end-start)/.14)),points=[];
    for(let i=0;i<=parts;i++){const a=start+(end-start)*i/parts;points.push((cx+r*Math.cos(a)).toFixed(2)+' '+(cy+r*Math.sin(a)).toFixed(2)+(i?' l':' m'));}
    p.op('q [] 0 d '+width+' w '+color.join(' ')+' RG '+points.join(' ')+' S Q');
  };
  const dot=(cx,cy,color,r=2)=>{arc(cx,cy,r/2,0,Math.PI*2,color,r);};
  const icon=(x,yy,color)=>{
    p.line(x,yy+4,x+5,yy+7,color,.7);p.line(x+5,yy+7,x+10,yy+4,color,.7);p.line(x+10,yy+4,x+5,yy+1,color,.7);p.line(x+5,yy+1,x,yy+4,color,.7);
    p.line(x,yy+4,x,yy-3,color,.7);p.line(x,yy-3,x+5,yy-6,color,.7);p.line(x+5,yy-6,x+10,yy-3,color,.7);p.line(x+10,yy-3,x+10,yy+4,color,.7);p.line(x+5,yy+1,x+5,yy-6,color,.7);
  };
  const newPage=()=>{
    const first=p.pages.length===0;p.newPage();
    // The shared writer inserts the saved logo at fixed proportional coordinates.
    // Paint the masthead BEFORE it, not over it; embed/draw exactly once per page.
    const logoOps=p.cur.splice(0);
    p.rect(0,0,595.28,841.89,paper);p.rect(0,first?620:751,595.28,first?221.89:90.89,navy);p.rect(0,838.89,595.28,3,emerald);
    if(first){arc(565,718,60,-Math.PI/2,Math.PI/2,[.10,.18,.24],.7);arc(565,718,88,-Math.PI/2,Math.PI/2,[.10,.18,.24],.7);}
    if(p.logo){round(M-1,792,50,36,4,white);p.cur.push(...logoOps);}
    nameLines.slice(0,2).forEach((value,i)=>text(companyX,811-i*15,12,value,{bold:true,color:white,background:navy}));
    companyLines.slice(0,2).forEach((value,i)=>text(companyX,778-i*10,7,value,{color:[.72,.81,.83],background:navy}));
    text(RIGHT,811,7,'INTERNAL STOCK RECORD',{align:'right',color:[.69,.81,.80]});
    text(RIGHT,797,8,report.generated,{align:'right',bold:true,color:white});
    if(!first){text(M,735,11,report.title+' · continued',{bold:true});text(RIGHT,735,7,stcPdfCount(report),{align:'right',color:muted,maxWidth:220});y=716;return;}
    p.line(M,754,RIGHT,754,[.14,.23,.28],.6);
    text(M,714,33,'STOCK',{bold:true,color:white});
    text(M,679,30,stock?'OVERVIEW':report.combo?'COMBO':'HISTORY',{bold:true,color:emerald});
    text(M,661,8,report.title+' · '+stcPdfCount(report),{color:[.76,.88,.85],maxWidth:280});
    text(338,722,6.5,'REPORT SCOPE',{color:[.63,.75,.78]});
    text(338,708,9,stock?'All saved dates':'Original movement dates',{bold:true,color:white});
    text(338,686,6.5,'SELECTION',{color:[.63,.75,.78]});
    text(338,673,8,report.combo?'1 saved combo':report.labels.length===1&&report.labels[0].startsWith('All matching')?'All matching records':'Current report filters',{color:white});
    const cards=[{w:108,n:summary.products,label:'PRODUCTS'},{w:108,n:summary.units.length,label:'UNIT TYPES'},
      {w:108,n:stock?summary.low:summary.movements,label:stock?'LOW STOCK':'MOVEMENTS'}];
    let x=M;
    cards.forEach((card,index)=>{
      round(x,585,card.w,62,6,white,line);text(x+12,611,24,String(card.n).padStart(2,'0'),{bold:true,color:ink});
      text(x+12,597,7,card.label,{color:muted});dot(x+card.w-13,632,index===2&&stock&&summary.low?amber:emerald,2.4);x+=card.w+8;
    });
    const w=RIGHT-x;round(x,585,w,62,6,navy,emerald);
    if(stock){
      arc(x+28,617,15,0,Math.PI*2,emerald,5);
      if(summary.low)arc(x+28,617,15,Math.PI/2,Math.PI/2+Math.PI*2*summary.low/summary.movements,amber,5);
      text(x+53,632,6.8,'STOCK HEALTH',{color:[.69,.81,.80]});text(x+53,618,8,summary.healthy+' Healthy / '+summary.low+' Low',{bold:true,color:white,maxWidth:w-60});
      text(x+53,604,6.3,'Matching products only',{color:[.69,.81,.80],maxWidth:w-60});
    }else{
      text(x+12,630,6.8,'REPORT TYPE',{color:[.69,.81,.80]});text(x+12,611,13,report.combo?'ONE COMBO':'HISTORY',{bold:true,color:white});
      text(x+12,597,6.8,'Exact dates · exact units',{color:[.69,.81,.80]});
    }
    y=562;
  };
  const paragraph=(value,{size=8.5,bold=false,color=ink,inset=0}={})=>{
    wrap(value,size,CW-inset,bold).forEach(value=>{if(y-size-4<bottom)newPage();text(M+inset,y,size,value,{bold,color});y-=size+4;});y-=5;
  };
  const section=(title,caption)=>{
    if(y-40<bottom)newPage();text(M,y,12,title,{bold:true});y-=16;
    if(caption)paragraph(caption,{size:7,color:muted});else y-=5;
  };
  const tableHeader=cols=>{
    const labels=cols.map(col=>wrap(col.label,7,col.w-12,true)),height=Math.max(29,...labels.map(ls=>ls.length*8.5+12));
    if(y-height-30<bottom)newPage();round(M,y-height,CW,height,5,navy);let x=M;
    cols.forEach((col,i)=>{labels[i].forEach((value,j)=>text(x+6,y-12-j*8.5,7,value,{bold:true,color:white}));x+=col.w;});y-=height;tableIndex=0;
  };
  const tableRow=(cols,values)=>{
    const cells=values.map((value,i)=>wrap(value,8,cols[i].w-12,i===0)),length=Math.max(1,...cells.map(cell=>cell.length));let offset=0;
    if(y-Math.min(length,5)*11-14<bottom){newPage();tableHeader(cols);}
    while(offset<length){
      let capacity=Math.floor((y-bottom-14)/11);if(capacity<1){newPage();tableHeader(cols);capacity=Math.floor((y-bottom-14)/11);}
      const count=Math.min(length-offset,capacity),h=count*11+14,bg=tableIndex%2?paper:white;let x=M;
      p.rect(M,y-h,CW,h,bg);
      cols.forEach((col,i)=>{
        const numeric=/Qty|Balance/.test(col.label),isBalance=/Balance/.test(col.label),fill=isBalance?mint:bg;
        if(isBalance)p.rect(x,y-h,col.w,h,fill);
        cells[i].slice(offset,offset+count).forEach((value,j)=>text(numeric?x+col.w-6:x+6,y-13-j*11,8,value,{bold:i===0||isBalance,align:numeric?'right':'left',color:isBalance?green:ink,background:fill}));x+=col.w;
      });
      p.line(M,y-h,RIGHT,y-h,line,.45);y-=h;offset+=count;tableIndex++;
    }
  };
  const stockCols=[{label:'PRODUCT',w:183},{label:'UNIT',w:45},{label:'TOTAL IN · incl. opening',w:74},{label:'OUT',w:50},{label:'SALES',w:50},{label:'AVAILABLE',w:CW-402}];
  const stockRow=row=>{
    const name=wrap(row.name,8.5,stockCols[0].w-34,true),unit=wrap(row.unit,8,stockCols[1].w-12,false);
    const min=wrap('Min: '+stkFmt(row.minQty)+' '+row.unit,6.8,stockCols[5].w-16,false);
    const h=Math.max(34,name.length*11+21,unit.length*11+13,26+min.length*8);
    if(y-h<bottom){newPage();tableHeader(stockCols);}
    const bg=row.low?paleAmber:tableIndex%2?paper:white,balanceBg=row.low?paleAmber:mint;
    p.rect(M,y-h,CW,h,bg);p.rect(RIGHT-stockCols[5].w,y-h,stockCols[5].w,h,balanceBg);
    round(M+5,y-24,19,19,4,row.low?[1,.92,.77]:[.86,.96,.91]);icon(M+9.5,y-15,row.low?amber:green);
    name.forEach((value,i)=>text(M+29,y-14-i*11,8.5,value,{bold:true,background:bg}));
    const details=y-14-name.length*11;text(M+29,details,6.8,'Opening: '+row.date,{color:muted,background:bg});
    if(row.low)text(M+stockCols[0].w-8,details,6.3,'LOW STOCK',{bold:true,align:'right',color:amber,background:bg});
    let x=M+stockCols[0].w;
    unit.forEach((value,i)=>text(x+6,y-14-i*11,8,value,{color:muted,background:bg}));x+=stockCols[1].w;
    [row.totalIn,row.totalOut,row.totalSale].forEach((value,i)=>{text(x+stockCols[i+2].w-8,y-14,9,stkFmt(value),{align:'right',maxWidth:stockCols[i+2].w-12,background:bg});x+=stockCols[i+2].w;});
    text(RIGHT-14,y-16,12,stkFmt(row.available),{bold:true,align:'right',color:row.low?amber:green,maxWidth:stockCols[5].w-24,background:balanceBg});dot(RIGHT-7,y-12,row.low?amber:emerald,1.8);
    min.forEach((value,i)=>text(RIGHT-14,y-28-i*8,6.8,value,{align:'right',color:muted,background:balanceBg}));
    p.line(M,y-h,RIGHT,y-h,line,.45);y-=h;tableIndex++;
  };
  const unitSummary=()=>{
    y-=15;const title=stock?'AVAILABLE BY UNIT':'MATCHING MOVEMENTS BY UNIT',groups=summary.units,cols=stock?4:3,gap=8,w=(CW-gap*(cols-1))/cols;
    const tileLines=groups.map(group=>wrap(group.unit,7,w-20,true));
    const height=stock?Math.max(58,...tileLines.map(ls=>37+ls.length*9)):Math.max(80,...tileLines.map(ls=>57+ls.length*9));
    const heading=()=>{if(y-height-25<bottom)newPage();text(M,y,9,title,{bold:true});y-=18;};heading();
    for(let i=0;i<groups.length;i+=cols){
      if(y-height<bottom){newPage();heading();}
      groups.slice(i,i+cols).forEach((group,j)=>{
        const x=M+j*(w+gap);round(x,y-height,w,height,5,white,line);
        if(stock){text(x+10,y-26,20,spdQuantity(group.available),{bold:true,color:green,maxWidth:w-20});tileLines[i+j].forEach((value,k)=>text(x+10,y-42-k*9,7,value,{bold:true,color:muted}));}
        else{
          tileLines[i+j].forEach((value,k)=>text(x+10,y-14-k*9,7,value,{bold:true,color:green}));
          const base=y-14-tileLines[i+j].length*9;
          [['In',group.in],['Out',group.out],['Sales',group.sale]].forEach(([label,value],k)=>{text(x+10,base-k*12,7,label,{color:muted});text(x+w-10,base-k*12,8,spdQuantity(value),{bold:true,align:'right',maxWidth:w-47});});
        }
      });y-=height+8;
    }
    paragraph('Exact saved units kept separate. No conversion or mixed-unit grand total.',{size:7,color:muted});
  };
  newPage();
  if(nameLines.length>2)paragraph('Company: '+companyName,{size:9,bold:true});
  if(companyLines.length>2)paragraph('Company details: '+company,{size:8,color:muted});
  report.labels.forEach(value=>paragraph(value,{size:7.5,color:muted}));
  if(stock){
    section('Inventory details','Opening + In − Out − Sales = Available · All saved dates, including future-dated entries.');
    tableHeader(stockCols);report.rows.forEach(stockRow);unitSummary();
    if(summary.low){
      const note='REORDER WATCH: '+summary.low+' product'+(summary.low===1?'':'s')+' below minimum. Amber rows show available stock and the saved minimum.';
      const lines=wrap(note,7,CW-22,true),h=lines.length*10+14;if(y-h<bottom)newPage();round(M,y-h,CW,h,4,paleAmber);
      lines.forEach((value,i)=>text(M+11,y-12-i*10,7,value,{bold:true,color:amber}));y-=h+8;
    }
  }else{
    paragraph(report.combo?'Product balances use the full dated ledger. Shared party / tags / roles appear once; each original date, unit and distinct In supplier is retained.':'Balances use the full chronological ledger, not a filtered subtotal. Every matching movement, original note and tagged name is retained.',{size:7.5,color:muted});
    if(report.combo){
      unitSummary();stcPdfBody(report,{paragraph,tableHeader,tableRow,space:minimum=>{if(y<minimum)newPage();},advance:amount=>{y-=amount;}});
    }else{
      const cols=[{label:'Date',w:65},{label:'Product',w:125},{label:'Type',w:65},{label:'Qty / unit',w:75},{label:'Balance',w:70},{label:'Party',w:CW-400}];
      report.rows.forEach((row,index)=>{
        if(y<155)newPage();tableHeader(cols);
        tableRow(cols,[row.date,row.currentProductName+(row.currentProductName!==row.productName?'\nAt entry: '+row.productName:''),row.source==='opening'?'Opening / In':STK_KINDS[row.type],(row.type==='in'?'+':'−')+stkFmt(row.qty)+' '+row.unit,stkFmt(row.balance)+' '+row.unit,row.party||'—']);y-=12;
        [row.salesperson?'Salesperson: '+row.salesperson:'',row.deliveryName?'Delivery / receiver: '+row.deliveryName:'',row.deliveryPhone?'Phone: '+row.deliveryPhone:'',row.purpose?'Purpose: '+row.purpose:''].filter(Boolean).forEach(value=>paragraph(value,{inset:8}));
        if(row.members.length)paragraph('Tagged members: '+row.members.map(name=>'@'+name).join(' · '),{bold:true,inset:8});
        const details=String(row.deliveryDetails||'').split('\n').filter(value=>!/^Tagged members:/.test(value)).join('\n');
        if(details)paragraph('Delivery details: '+details,{inset:8});
        if(row.note)paragraph('Source / note: '+row.note,{size:8,color:muted,inset:8});
        paragraph((report.kind==='history'?'Movement ':'Entry ')+(index+1)+' of '+report.rows.length+' · '+row.id,{size:7,color:muted,inset:8});y-=5;
      });unitSummary();
    }
  }
  const last=p.cur,total=p.pages.length;
  p.pages.forEach((ops,index)=>{p.cur=ops;p.line(M,45,RIGHT,45,line,.6);text(M,31,6.8,'Stock report · not an invoice',{color:muted});text(RIGHT,31,6.8,'Hisaab v'+APP_VERSION+' · Page '+(index+1)+' of '+total,{align:'right',color:muted});});p.cur=last;
  return {str:p.build(),name:'Stock_'+report.kind+'_'+report.from+'_to_'+report.to+'.pdf'};
}
/* v3.41 PREMIUM STOCK PDF END */
