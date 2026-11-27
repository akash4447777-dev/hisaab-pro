/* v3.43 STOCK SUGGESTIONS BEGIN
   Local suggestions are visible choices, never permission to bypass a source,
   unit/variant check, OCR review or the existing audited save/consent guards.
   Dictionary abbreviations may qualify at >=75%; initials are suggestions ONLY. */
const SSX_WORDS=Object.freeze({scbd:'scoreboard',scorebd:'scoreboard',scorebrd:'scoreboard',adj:'adjuster',adjstr:'adjuster',brkt:'bracket',brckt:'bracket',tri:'triangle',plas:'plastic',sm:'small',med:'medium',lg:'large',alum:'aluminium',ss:'steel',wd:'wood'});
function ssxName(value){return stfName(value).split(' ').map(w=>Object.hasOwn(SSX_WORDS,w)?SSX_WORDS[w]:w).join(' ');}
function ssxScore(query,name){
  const raw=stfScore(query,name),q=ssxName(query),n=ssxName(name),expanded=stfScore(q,n),autoScore=Math.max(raw,expanded);
  const initials=n.split(' ').map(w=>w[0]).join(''),compact=q.replace(/ /g,'');
  if(compact.length>=2&&compact===initials&&autoScore<.82)return {score:.82,autoScore,method:'Initials / abbreviation — review only'};
  return {score:autoScore,autoScore,method:expanded>raw+1e-12?'Abbreviation / spelling normalized':'Local name similarity'};
}
function ssxRank(query,unit,stock,search=false){
  if(typeof query!=='string'||query.length>90||typeof unit!=='string'||unit.length>18)throw new Error('Product search maximum 90 characters ka rakhein.');
  const q=ssxName(query);
  const rows=stock.products.map(p=>{
    const x=q?ssxScore(query,p.name):{score:0,autoScore:0,method:'Catalogue'},n=ssxName(p.name),words=q.split(' ').filter(Boolean);
    const prefix=!!q&&(n.startsWith(q)||words.every(word=>n.split(' ').some(part=>part.startsWith(word))));
    const variant=sapVariant(query,p.name)||sapVariant(ssxName(query),ssxName(p.name)),wrongUnit=!!unit&&sapUnit(unit)!==sapUnit(p.unit);
    return {id:p.id,name:p.name,unit:p.unit,score:x.score,autoScore:x.autoScore,percent:Math.floor(x.score*100+1e-9),method:x.method,rank:search&&prefix?Math.max(x.score,.96):x.score,eligible:!variant&&!wrongUnit,variant,sameUnit:!wrongUnit,reason:wrongUnit?'Unit conflict — no conversion':variant?'Different '+variant:''};
  }).filter(p=>!q&&search||p.rank>=(search?.32:.55));
  rows.sort((a,b)=>Number(b.eligible)-Number(a.eligible)||b.rank-a.rank||b.score-a.score||a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
  return rows;
}
function ssxCandidates(query,unit='',stock=stkData(),search=false){
  const inventory=new Map(stkInventory({settings:{stockInventory:stock}}).map(p=>[p.id,p]));
  return ssxRank(query,unit,stock,search).map(p=>({...p,available:inventory.get(p.id)?.available||0}));
}
function ssxMatch(name,unit,stock){
  if(typeof name!=='string'||name.length>90||typeof unit!=='string'||unit.length>18)return {id:'',kind:'Unmatched — product name / unit missing or too long.',candidates:[],suggestions:[]};
  const canonical={...stock,products:stock.products.map(p=>({...p,unit:sapUnit(p.unit)}))};
  const known=stfExactMatch({name,unit:sapUnit(unit)},canonical);
  // Exact names / deliberately accepted historical aliases retain precedence,
  // including explicit UNIT CONFLICT and conflicting-alias diagnostics.
  if(known.id||known.kind.startsWith('Conflicting matches'))return known;
  const candidates=ssxRank(name,unit,stock).map(p=>({...p,score:p.autoScore})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  const summary={candidates,suggestions:candidates.filter(c=>c.eligible).slice(0,4).map(c=>c.id)};
  const compatible=candidates.filter(c=>c.eligible),best=compatible[0],wrong=candidates.find(c=>!c.sameUnit&&!c.variant&&c.score>=STF_MIN);
  if(wrong&&(!best||wrong.score>best.score+STF_GAP))return {...summary,id:'',kind:'UNIT CONFLICT — naam milta hai lekin source aur saved unit alag; conversion nahi hogi.'};
  if(best&&best.score>=STF_MIN){
    const family=s=>stfFamily(ssxName(s)).split(' ').filter(w=>!['plastic','wood','wooden','leather','steel','brass','rubber','aluminium','aluminum','round','square','triangular','original','copy','good','premium','medium'].includes(w)).join(' ');
    const missing=compatible.slice(1).some(c=>sapVariant(ssxName(best.name),ssxName(c.name))&&family(best.name)&&family(best.name)===family(c.name)),rival=compatible[1];
    if(missing||rival&&best.score-rival.score<=STF_GAP+1e-12)return {...summary,id:'',kind:'Conflicting close matches — do products / variants milte hain; sahi product ek tap mein chunein.'};
    const percent=Math.floor(best.score*100+1e-9);
    return {...summary,id:best.id,method:'fuzzy',score:best.score,percent,kind:percent+'% naam match — product apne-aap chuna; original name / unit aur highlighted choice dekhein.'};
  }
  const variant=candidates.find(c=>c.sameUnit&&c.variant&&c.score>=STF_MIN);
  return {...summary,id:'',kind:variant?'Naam milta hai, lekin '+variant.variant+' — actual product confirm karein.':'Unmatched / below 75% / initials only — closest saved product explicitly chunein.'};
}
function stmMatch(block,stock){return ssxMatch(block.name,block.unit,stock);}
function sapMatch(name,unit,stock){return ssxMatch(name,unit,stock);}
function ssxNeedsPanel(block,originalName=block.name){
  const selected=stkData().products.find(p=>p.id===block.productId);
  return !selected||stmKey(originalName)!==stmKey(selected.name)||!!block.unit&&sapUnit(block.unit)!==sapUnit(selected.unit);
}
function ssxSuggestionsHTML(block,phase,originalName=block.name){
  if(!ssxNeedsPanel(block,originalName))return '';
  const stock=stkData(),selected=stock.products.find(p=>p.id===block.productId),source=block.name||'',unit=block.unit||'';
  const ranked=source.length<=90&&unit.length<=18?ssxCandidates(source,unit,stock):[],choices=ranked.filter(p=>p.eligible).slice(0,4),blocked=ranked.filter(p=>!p.eligible).slice(0,2);
  if(selected&&!choices.some(p=>p.id===selected.id)&&(!unit||sapUnit(unit)===sapUnit(selected.unit))){const x=ssxScore(source,selected.name);choices.push({...selected,...x,percent:Math.floor(x.score*100),available:stkInventory().find(p=>p.id===selected.id)?.available||0,method:'Explicit saved choice / alias'});}
  return '<section class="ssx-panel'+(!choices.length?' ssx-unmatched':'')+'" data-ssx-panel="'+phase+':'+block.index+'" aria-label="Suggested product matches"><div class="ssx-heading"><b>'+(choices.length?'✦ Suggested matches':'! Unmatched — no suitable saved product')+'</b><span>'+choices.length+' review choices</span></div><div class="ssx-original"><span>Original item</span><strong>'+esc(originalName||'Name unclear')+'</strong><small>Source unit: '+esc(unit||'not given — must clarify')+(originalName!==source?' · Current corrected name: '+esc(source):'')+'</small></div>'+
    (choices.length?'<div class="ssx-choices">'+choices.map((p,i)=>'<button type="button" class="ssx-choice'+(!i?' ssx-best':'')+(p.id===block.productId?' ssx-selected':'')+'" data-ssx="choose" data-phase="'+phase+'" data-block="'+block.index+'" data-product="'+esc(p.id)+'" aria-pressed="'+(p.id===block.productId)+'"><span class="ssx-choice-top"><b>'+esc(p.name)+'</b><strong>'+p.percent+'%</strong></span><span>Available <b>'+stkFmt(p.available)+' '+esc(p.unit)+'</b></span><span class="ssx-choice-foot"><small>'+esc(p.method)+'</small><b>'+(p.id===block.productId?'✓ Selected':!i?'Best suggestion · '+(phase==='smart'?'Use & process':'Use product'):phase==='smart'?'Use & process':'Use product')+'</b></span></button>').join('')+'</div>':'<p>Wrong product auto-select nahi hua. Original name/unit sudharein, ya genuinely distinct new Stock In product confirm karein.</p>')+
    (blocked.length?'<p class="ssx-blocked">Not interchangeable: '+blocked.map(p=>esc(p.name)+' ('+esc(p.reason)+')').join(' · ')+'</p>':'')+'<small class="ssx-score-note">Local name score, not an accuracy guarantee. Units / variants are not interchangeable. Original date, quantity, review and stock checks still apply.</small></section>';
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-ssx="choose"]');if(!button||button.disabled)return;event.preventDefault();
  try{
    const phase=button.dataset.phase,index=Number(button.dataset.block),id=button.dataset.product;
    if(phase==='review'){
      const e=stmEditor;if(!stmCurrent(e)||e.busy||!e.plan)return;stkCheck(e.context);
      const block=e.plan.blocks.find(b=>b.index===index);if(!block||!ssxCandidates(block.name,block.unit).some(p=>p.id===id&&p.eligible))throw new Error('Suggested product / source badal gaya. Fresh preview karein.');
      const select=e.element.querySelector('[data-stm-match="'+index+'"]');if(!select)throw new Error('Current product control missing.');select.value=id;select.dispatchEvent(new Event('change',{bubbles:true}));
    }else if(phase==='smart'){
      const e=sapEditor;if(!sapCurrent(e)||e.busy||!e.plan)return;stkCheck(e.context);
      const block=e.plan.blocks.find(b=>b.index===index),fix=e.options.fixes[index]||{};
      if(!block||block.status!=='unresolved'||!ssxCandidates(fix.name??block.name,fix.unit??block.unit).some(p=>p.id===id&&p.eligible))throw new Error('Current unresolved item / compatible choice badal gayi. Fresh process karein.');
      const select=e.element.querySelector('[data-sap-match="'+index+'"]');if(!select)throw new Error('Current product control missing.');select.value=id;sapField(e,select);sapRun();
    }
  }catch(error){if(button.dataset.phase==='smart')sapStatus(error.message,true);else stmError(error.message);}
});
/* v3.43 STOCK SUGGESTIONS END */
