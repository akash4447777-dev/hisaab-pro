/* v3.36 STOCK EASY BEGIN
   Progressive message review, explicit member roles and local Stock PDFs.
   Everything here is a draft or a read-only projection of ordinary Stock rows.
   No schema, storage key, contact upload, chat access or financial integration. */
let stePdfEditor = null;
function steMemberNames(lines) {
  const names = new Map();
  (lines || []).forEach(line => {
    String(line || '').replace(/^(?:Tagged members|Added tags|Tagged|Tags|Tag|Cc)\s*:\s*/i, '').split('@').forEach(part => {
      const name = stkName(part.replace(/^[\s~]+/, ''));
      if (name && !names.has(stkKey(name))) names.set(stkKey(name), name);
    });
  });
  return [...names.values()];
}
function steCheckedMembers(tags, additions) {
  if (additions !== undefined && (!Array.isArray(additions) || additions.length > 20 || Object.keys(additions).length !== additions.length)) throw new Error('Tagged names ki valid list chahiye (maximum 20).');
  const extra = Array.from(additions || []).map(name => {
    const value = stkText(name, 92, true, 'Tagged person').replace(/^@?\s*~?\s*/, '');
    if (value.includes('@') || /[\r\n]/.test(value)) throw new Error('Har tagged person ka alag, poora naam likhein.');
    return stkText(stkName(value), 90, true, 'Tagged person');
  });
  const members = steMemberNames((tags || []).concat(extra));
  members.forEach(name => stkText(name, 90, true, 'Tagged person'));
  if (members.length > 20 || members.map(name => '@' + name).join(' ').length > 400) throw new Error('Tagged names maximum 20 / 400 characters tak rakhein.');
  return members;
}
function steSourceTags(text) {
  const tags = []; let active = false;
  stmClean(String(text || '')).forEach(line => {
    line = line.replace(/^(?:Tagged members|Tagged|Tags|Tag|Cc)\s*:\s*(?=@)/i, '').replace(/\s+\d{1,2}:?\d{2}\s*(?:am|pm)(?:\s*[✓✔]*)?$/i, '');
    if (line.startsWith('@')) { tags.push(line); active = true; }
    else if (active && /^[\p{L}\p{M} @~.'()\-]+$/u.test(line) && !/^(?:Driver|Delivery|Reference|Added tags)\b/i.test(line)) tags[tags.length - 1] += ' ' + line;
    else if (active) active = false;
  });
  return tags;
}
function steTaggedMembers(t) {
  return steMemberNames(String(t?.deliveryDetails || '').split('\n').filter(line => /^Tagged members:\s*@/i.test(line))
    .concat(steSourceTags(t?.note || ''), String(t?.note || '').split('\n').filter(line => /^Added tags:\s*@/i.test(line))));
}
function steTagsHTML(t) {
  const members = steTaggedMembers(t);
  return members.length ? '<div class="ste-saved-tags"><b>Tagged:</b> ' + members.map(name => '<span>' + esc(name) + '</span>').join(' ') + '</div>' : '';
}
function stePeople(e) {
  return steMemberNames(steSourceTags($('#stmText')?.value || '').concat(e.members || []));
}
function steRefreshPeople(e) {
  if (!stmCurrent(e)) return;
  const members = stePeople(e), type = $('#stmType').value;
  $('#stePeopleCount').textContent = members.length ? members.length + ' tagged log mil gaye' : 'Tagged log';
  $('#stePeople').innerHTML = members.length ? members.map((name, index) => {
    const sales = $('#stmSalesperson').value === name, delivery = $('#stmDelivery').value === name;
    return '<div class="ste-person"><div><b>' + esc(name) + '</b><small>Tag entry aur PDF mein rahega' + (sales ? ' · Salesperson ✓' : '') + (delivery ? ' · Delivery / receiver ✓' : '') + '</small></div><div class="row-actions">' +
      (type === 'sale' ? '<button type="button" class="btn xs' + (sales ? ' primary' : '') + '" data-ste="role" data-role="salesperson" data-person="' + index + '" aria-pressed="' + sales + '">Salesperson</button>' : '') +
      (type ? '<button type="button" class="btn xs' + (delivery ? ' primary' : '') + '" data-ste="role" data-role="deliveryName" data-person="' + index + '" aria-pressed="' + delivery + '">' + (type === 'out' ? 'Receiver' : 'Delivery') + '</button>' : '') +
      ((e.members || []).some(extra => stkKey(extra) === stkKey(name)) && !steMemberNames(steSourceTags($('#stmText').value)).some(base => stkKey(base) === stkKey(name)) ? '<button type="button" class="btn xs" data-ste="removeMember" data-person="' + index + '" aria-label="Remove added tag ' + esc(name) + '">✕</button>' : '') + '</div></div>';
  }).join('') : '<p class="stm-help">Message mein @naam ho to yahan aayega. Photo mein tag chhoot gaya? Neeche naam jod sakte hain.</p>';
  const previous = stkData().transactions.flatMap(t => [t.salesperson, t.deliveryName, ...steTaggedMembers(t)]).filter(Boolean);
  $('#stmMembers').innerHTML = [...new Set(members.concat(previous))].slice(0, 150).map(name => '<option value="' + esc(name) + '"></option>').join('');
  $('#steSalesField').hidden = type !== 'sale';
  $('#steDeliveryField').hidden = !type;
  $('#stePurposeField').hidden = type !== 'out';
  $('#steDeliveryLabel').textContent = type === 'out' ? 'Office mein kisne liya? (optional)' : 'Delivery kisne ki? *';
}
function steStep(e, step) {
  if (!stmCurrent(e)) return;
  e.step = step;
  $('#steSource').hidden = step !== 1; $('#steReview').hidden = step !== 2;
  $('#steBack').hidden = step !== 2; $('#stmSave').hidden = step !== 2; $('#steCancel').hidden = step === 2;
  e.element.dataset.step = String(step);
  $('#stmPreviewButton').textContent = step === 1 ? 'Agla: entries dekho →' : 'Dobara check karo';
  $$('#steProgress li').forEach((li, i) => { li.classList.toggle('active', i === step - 1); if (i === step - 1) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
  $('#stmTitle').textContent = step === 1 ? 'Message ya screenshot daalo' : 'Entries dekhkar save karo';
}
function steOpen() {
  stkCheck(stkContext());
  const year = new Date().getFullYear();
  openModal(`<div class="modal stk-dialog stm-dialog ste-dialog" id="stmDialog" role="dialog" aria-modal="true" aria-labelledby="stmTitle">
    <div class="modal-h"><div><h3 id="stmTitle">Message ya screenshot daalo</h3><p>Ek message se saare items. Ek-ek entry bharni nahi.</p></div><button class="x" type="button" data-act="closeModal" aria-label="Close message import">✕</button></div>
    <div class="modal-b">
      <ol id="steProgress" class="ste-progress" aria-label="Stock entry steps"><li class="active" aria-current="step"><b>1</b> Message</li><li><b>2</b> Dekho</li><li><b>3</b> Save</li></ol>
      <p class="stm-account"><b>Account:</b> ${esc(Cloud.user?.email || 'Is browser ka local data')}</p>
      <section id="steSource">
        <button class="btn ste-photo" type="button" data-stm="photo">📷 Screenshot chuno</button><input id="stmPhoto" type="file" accept="image/png,image/jpeg,image/webp" hidden>
        <div class="ste-or">ya WhatsApp ka poora message paste karo</div>
        <label class="stk-field"><span>Message</span><textarea id="stmText" class="inp stm-text" rows="8" maxlength="20000" placeholder="WhatsApp mein message Copy karo, phir yahan Paste…&#10;&#10;23/11 Example party&#10;1- Example product&#10;Aaj gaye -2 box&#10;@Salesperson @Delivery person"></textarea></label>
        <div class="ste-year"><label class="stk-field"><span>Message kis saal ka hai? *</span><input id="stmYear" class="inp" type="number" inputmode="numeric" min="1900" max="9998" placeholder="Saal, jaise ${year}"><small>Poora DD/MM/YYYY likha ho to alag se saal nahi chahiye.</small></label><div class="row-actions"><button class="btn sm" type="button" data-ste="year" data-year="${year}">${year}</button><button class="btn sm" type="button" data-ste="year" data-year="${year - 1}">${year - 1}</button></div></div>
        <div id="stmOcrStatus" class="stm-help" role="status">Text paste sabse aasaan hai. Photo ki pehli reading ke liye internet chahiye. Photo browser mein hi padhi jayegi.</div><button class="btn sm" type="button" id="stmStopOcr" data-stm="stop" hidden>Reading rok do</button>
        <div id="stmImage"></div>
        <p class="ste-safe">Abhi kuch save nahi hoga. WhatsApp apne-aap read nahi hota.</p>
      </section>
      <section id="steReview" hidden>
        <div id="steMessageSummary" class="ste-summary"></div>
        <div id="steOutgoing"><label class="stk-field"><span>Jo maal gaye, woh kahan gaya? *</span><select id="stmType" class="inp"><option value="">Ek option chuno…</option><option value="sale">Customer ko becha — Stock Sale</option><option value="out">Office / doosre kaam ke liye — Stock Out</option></select></label></div>
        <div id="stePurposeField" class="ste-purpose" hidden><label class="stk-field"><span>Kis kaam ke liye? *</span><input id="stmPurpose" class="inp" maxlength="250" placeholder="Purpose likho"></label><button class="btn sm" type="button" data-ste="office">Office transfer</button></div>
        <section class="ste-members"><h4 id="stePeopleCount">Tagged log</h4><p class="stm-help">Saare tags saath save honge. Sale chuna ho to naam ke paas se Salesperson aur Delivery chuno; role apne-aap nahi lagega.</p><div id="stePeople"></div><div class="ste-add-person"><input id="steMemberInput" class="inp" maxlength="92" list="stmMembers" placeholder="Koi tag chhoot gaya? Naam likho" aria-label="Add tagged person"><button type="button" class="btn sm" data-ste="addMember">＋ Naam jodo</button></div><p id="steMemberError" class="stk-error" role="alert"></p></section>
        <div class="stm-controls ste-roles"><label id="steSalesField" class="stk-field" hidden><span>Salesperson kaun hai? *</span><input id="stmSalesperson" class="inp" list="stmMembers" maxlength="90" placeholder="Upar naam par tap ya yahan likho"></label><label id="steDeliveryField" class="stk-field" hidden><span id="steDeliveryLabel">Delivery kisne ki? *</span><input id="stmDelivery" class="inp" list="stmMembers" maxlength="90" placeholder="Upar naam par tap ya yahan likho"></label></div><datalist id="stmMembers"></datalist>
        <details id="steMore" class="ste-more"><summary>Extra options: supplier / delivery reference</summary><div class="stm-controls"><label class="stk-field"><span>Stock In supplier (optional)</span><input id="stmSupplier" class="inp" maxlength="90" placeholder="Pata ho to hi naam likho"></label><label class="stk-field"><span>Alag delivery ka reference (optional)</span><input id="stmReference" class="inp" maxlength="80" placeholder="Bill / delivery number"></label></div></details>
        <label class="stm-check ste-opening" id="steOpening" hidden><input id="stmSameDay" type="checkbox"><span>Opening isi din ki hai: yeh movements <b>opening snapshot ke BAAD</b> hui hain aur usme pehle se shamil nahi hain.</span></label>
        <h4 class="stm-step">Saare items — date, quantity aur unit dekh lo</h4>
        <div id="stmPreview" aria-live="polite"></div>
        <p class="stm-help">Aaye = In; gaye = Sale / Out. Pichhle bache / Available sirf checks hain. Galti ho to <button type="button" class="btn xs" data-stm="edit">Message sudharo</button>.</p>
        <label class="stm-check ste-consent"><input id="stmReviewed" type="checkbox"><span>Maine date + saal, products, quantity/unit, tags/roles aur warnings dekh li hain. Sirf nayi entries save karo.</span></label>
      </section>
      <p id="stmError" class="stk-error stm-errors" role="alert" tabindex="-1"></p>
    </div>
    <div class="modal-f"><button class="btn" type="button" id="steCancel" data-act="closeModal">Abhi nahi</button><button class="btn" type="button" id="steBack" data-ste="back" hidden>← Message</button><button class="btn primary" type="button" id="stmPreviewButton" data-stm="preview">Agla: entries dekho →</button><button class="btn primary" type="button" id="stmSave" data-stm="save" disabled hidden>Haan, save karo</button></div>
  </div>`, {sticky:true});
  stmEditor = { element:$('#stmDialog'), context:stkContext(), serial:0, busy:false, phase:'', matches:{}, actions:{}, members:[], step:1, plan:null, worker:null, reader:null };
  steRefreshPeople(stmEditor); $('#stmText').focus();
}
function steRender(plan) {
  const e = stmEditor, p = plan.parsed, products = stkData().products;
  const option = (id, name, selected) => '<option value="' + esc(id) + '"' + (selected ? ' selected' : '') + '>' + esc(name) + '</option>';
  const displayQty = value => value === null ? 'not given' : stkFmt(value);
  steStep(e, 2); steRefreshPeople(e);
  $('#steOutgoing').hidden = !p.blocks.some(block => block.events.some(event => event.direction === 'take'));
  $('#steOpening').hidden = !plan.rows.some(row => row.date === row.cutover && row.action !== 'skip');
  $('#steMessageSummary').innerHTML = '<b>' + esc(ctPretty(p.header.date)) + ' · ' + esc(p.header.party) + '</b><span>' + plan.added + ' nayi entries · ' + plan.skipped + ' pehle se / skipped</span><button type="button" class="btn xs" data-ste="back">Message / date badlo</button>';
  $('#stmPreview').innerHTML = '<div class="stm-heading"><b>' + esc(p.header.date) + ' · ' + esc(p.header.party) + '</b><p>' + plan.added + ' nayi movements · ' + plan.skipped + ' skipped · ' + plan.errors.length + ' issues</p><p>Tagged: ' + esc(p.tags.concat((e.members || []).map(name => '@' + name)).join(' ') || 'Koi naam nahi') + '</p><p>Driver phone: ' + esc(p.phone || 'not given') + '</p></div>' +
    (p.preamble.length || p.ignored.length ? '<details class="stm-source"><summary>Message ka baaki text (entry nahi)</summary><pre>' + esc(p.preamble.concat(p.ignored).join('\n')) + '</pre></details>' : '') +
    (plan.warnings.length ? '<div class="banner warn stm-warnings">' + plan.warnings.map(esc).join('<br>') + '</div>' : '') +
    plan.blocks.map(block => {
      const saved = products.find(product => product.id === block.productId), matched = !!saved && !/CONFLICT|Conflicting/.test(block.match.kind) && stmUnit(saved.unit) === block.unit;
      const select = '<label class="stk-field"><span>Saved product / unit *</span><select class="inp" data-stm-match="' + block.index + '">' + option('', 'Choose product', !block.productId) + products.map(product => option(product.id, (block.match.suggestions?.includes(product.id) ? 'Suggested: ' : '') + product.name + ' · ' + product.unit, product.id === block.productId)).join('') + '</select><small>' + esc(block.match.kind) + '</small></label>';
      return '<section class="stm-item"><div class="stm-item-title"><b>' + esc(block.name) + '</b><span>Previous ' + displayQty(block.prior) + ' → Available ' + displayQty(block.available) + ' ' + esc(block.unit) + '</span></div>' +
        (matched ? '<details class="ste-product"><summary><span class="ste-status">✓ Product matched</span> ' + esc(saved.name + ' · ' + saved.unit) + ' <span class="muted">— badlein</span></summary>' + select + '</details>' : select) +
        '<div class="stm-rows">' + plan.rows.filter(row => row.block === block.index).map(row => {
          const actions = '<label><span>Action</span><select class="inp" aria-label="Movement action ' + esc(row.index) + '" data-stm-action="' + esc(row.index) + '">' + (row.similar || row.before ? option('', 'Resolve before saving', !row.action) : '') + (!row.before ? option('new', row.similar ? 'Alag real movement — unique reference' : 'Nayi movement', row.action === 'new') : '') + option('skip', row.before ? 'Opening me already included — skip' : 'Already included / skip', row.action === 'skip') + '</select></label>';
          return '<div class="stm-row" data-stm-row="' + esc(row.index) + '"><div><b>' + esc(row.date) + ' · ' + (row.direction === 'in' ? '+' : '−') + stkFmt(row.qty) + ' ' + esc(row.unit) + '</b><span>' + esc(row.direction === 'in' ? 'Stock In' : row.type === 'sale' ? 'Stock Sale' : row.type === 'out' ? 'Stock Out' : 'Outgoing type required') + ' · ' + esc(row.party || 'supplier not given') + '</span>' + (row.before ? '<span>Opening snapshot: ' + esc(row.cutover) + ' — purani movement dobara add nahi hogi.</span>' : '') + (row.similar && !row.exact ? '<span>Isi product/date/quantity ki entry milti hai. Pehle se included ho to Skip chuno.</span>' : '') + '</div>' +
            (row.exact ? '<span class="badge">Already recorded / processed — skip</span>' : row.similar || row.before ? actions : '<details class="ste-action"><summary>' + (row.action === 'skip' ? 'Skip chuna hai — badlein' : 'Nayi entry ✓ · badlein') + '</summary>' + actions + '</details>') + '</div>';
        }).join('') + '</div><details class="stm-source"><summary>Original item text</summary><pre>' + esc(p.header.raw + '\n' + block.raw) + '</pre></details></section>';
    }).join('');
  stmError(plan.errors.length ? plan.errors.join('\n') : !plan.added ? 'Sab movements pehle se recorded / processed / skipped hain. Stock dobara add / minus nahi hua. Correction ke liye Stock History dekhein.' : 'Ready. Sab dekh liya ho to neeche tick karke Haan dabao.');
  $('#stmSave').textContent = plan.added ? 'Haan, ' + plan.added + (plan.added === 1 ? ' entry' : ' entries') + ' save karo' : 'Koi nayi entry nahi'; stmEnable();
}
function steReceiptHTML() {
  const receipt = stkUI().lastMessage;
  if (!receipt || !receipt.ids?.some(id => stkData().transactions.some(t => t.id === id))) return '';
  return '<div class="ste-receipt card" role="status"><div><b>✓ Message ki ' + receipt.ids.length + ' entries save ho gayi</b><p>' + esc(ctPretty(receipt.date) + ' · ' + receipt.party) + ' · saare tagged naam entries ke saath hain</p></div><div class="row-actions"><button class="btn" data-ste-pdf="message" data-id="' + esc(receipt.ids[0]) + '">↓ Is message ka PDF</button><button class="btn primary" data-ste="newMessage">＋ Agla message</button><button class="btn sm" data-ste="dismissReceipt" aria-label="Dismiss saved message">✕</button></div></div>';
}
function stePdfCancel() {
  const old = stePdfEditor; stePdfEditor = null;
  if (old) { old.serial++; if (old.url) URL.revokeObjectURL(old.url); }
}
function steReport(options = {}, data) {
  stkObject(options, ['kind','filters','entryId'], 'PDF options');
  const kind = options.kind || 'history';
  if (!['stock','history','message'].includes(kind)) throw new Error('Available Stock, History ya saved Message PDF chunein.');
  const d = data === undefined ? Store.data : data, s = syncClone(stkData(d)), filters = syncClone(options.filters || {});
  stkValidate(s); stkFilterValid(filters, s);
  let rows, title;
  if (kind === 'stock') {
    if (filters.from || filters.to || filters.party || filters.salesperson || filters.type && filters.type !== 'all') throw new Error('Available Stock all saved dates ka snapshot hai. Date / party / salesperson filters ke liye History PDF chunein.');
    rows = stkInventory({settings:{stockInventory:s}}).filter(p => (!filters.product || filters.product === 'all' || filters.product === p.id) && (!filters.low || p.low) && (!filters.q || stkKey(p.name + ' ' + p.note + ' ' + p.unit).includes(stkKey(filters.q)))).sort((a,b) => a.name.localeCompare(b.name));
    title = 'Available Stock';
  } else {
    rows = stkQuery(kind === 'message' ? {order:'oldest'} : filters, {settings:{stockInventory:s}});
    if (kind === 'message') {
      const audit = s.history.find(h => h.entityId === options.entryId && stmMeta(h)), meta = audit && stmMeta(audit);
      const ids = new Set(meta ? s.history.filter(h => stmMeta(h)?.b === meta.b).map(h => h.entityId) : [options.entryId]);
      rows = rows.filter(t => ids.has(t.id));
      if (!rows.length || !rows.some(t => t.id === options.entryId)) throw new Error('Yeh saved entry ab nahi hai. Current History dobara kholein.');
    }
    rows = rows.map(t => ({...t, members:steTaggedMembers(t)})); title = kind === 'message' ? 'Stock Message' : 'Stock History';
  }
  if (!rows.length) throw new Error('In filters mein koi entry / product nahi. Filters check karo; khaali PDF nahi bani.');
  const labels = [];
  if (kind === 'message') labels.push('Sirf is message ki abhi saved entries; skipped / deleted rows nahi. Screen filters apply nahi.');
  else {
    if (filters.product && filters.product !== 'all') labels.push('Product: ' + s.products.find(p => p.id === filters.product).name);
    if (filters.from || filters.to) labels.push('Dates: ' + (filters.from || 'Start') + ' to ' + (filters.to || 'Latest'));
    if (filters.party) labels.push('Party: ' + filters.party);
    if (filters.salesperson) labels.push('Salesperson: ' + filters.salesperson);
    if (filters.type && filters.type !== 'all') labels.push('Type: ' + STK_KINDS[filters.type]);
    if (filters.q) labels.push('Search: ' + filters.q);
    if (kind === 'stock' && filters.low) labels.push('Low stock only');
  }
  const dates = rows.map(r => r.date).sort();
  return {kind, title, filters, labels:labels.length ? labels : ['All matching ' + (kind === 'stock' ? 'products' : 'entries') + ' · saare pages included'], rows:syncClone(rows), settings:syncClone(d.settings || {}), generated:isoDate(new Date()), from:dates[0], to:dates.at(-1)};
}
function stePdfString(report) {
  const p = new PdfDoc(); p.logo = companyLogoData(report.settings.companyLogo || ''); p.pages = []; p.newPage();
  const ink = [0.10,0.15,0.22], muted = [0.38,0.43,0.49], brand = [0.12,0.35,0.34], line = [0.84,0.88,0.89], fill = [0.94,0.97,0.97];
  let y = 0;
  const companyName = String(report.settings.shopName || 'Hisaab');
  const company = [report.settings.address,report.settings.phone ? 'Ph: '+report.settings.phone : '',report.settings.ownerName].filter(Boolean).join(' · ');
  const headerWidth = CW - (p.logo ? 60 : 0), nameLines = attPdfWrap(companyName,14,headerWidth,true), companyLines = attPdfWrap(company,8,headerWidth,false);
  const text = (x,yy,size,value,opt={}) => attPdfText(p,x,yy,size,value,{color:ink,...opt});
  const newPage = () => {
    if (y) p.newPage();
    const x = p.logo ? M + 60 : M;
    y = 811;
    nameLines.slice(0,2).forEach(value => {text(x,y,14,value,{bold:true,color:brand});y-=18;});
    companyLines.slice(0,2).forEach(value=>{text(x,y,8,value,{color:muted});y-=11;});
    y = Math.min(y - 9, p.logo ? 772 : 781);
    text(M,y,12,report.title,{bold:true,color:brand}); y-=16;
    text(M,y,8,'Generated '+report.generated+' · '+report.rows.length+' '+(report.kind==='stock'?'products':'saved entries'),{color:muted});y-=10;
    p.line(M,y,RIGHT,y,line,.7);y-=15;
  };
  const paragraph = (value, {size=8.5,bold=false,color=ink,inset=0}={}) => {
    const lines = attPdfWrap(String(value),size,CW-inset,bold);
    lines.forEach(value=>{if(y<69)newPage();text(M+inset,y,size,value,{bold,color});y-=size+3.5;});y-=4;
  };
  const tableHeader = cols => {
    if(y<100)newPage();
    p.rect(M,y-20,CW,24,fill);let x=M;
    cols.forEach(col=>{const ls=attPdfWrap(col.label,7,col.w-10,true);ls.forEach((value,i)=>text(x+5,y-5-i*8,7,value,{bold:true,color:brand}));x+=col.w;});y-=27;
  };
  const tableRow = (cols,values) => {
    const cells=values.map((value,i)=>attPdfWrap(String(value),8,cols[i].w-10,i===0)),length=Math.max(1,...cells.map(cell=>cell.length));let offset=0;
    if(y-Math.min(length,5)*11-10<64){newPage();tableHeader(cols);}
    while(offset<length){let capacity=Math.floor((y-64-10)/11);if(capacity<1){newPage();tableHeader(cols);capacity=Math.floor((y-64-10)/11);}
      const count=Math.min(length-offset,capacity),h=count*11+10;let x=M;
      cols.forEach((col,i)=>{cells[i].slice(offset,offset+count).forEach((value,j)=>text(x+5,y-10-j*11,8,value,{bold:i===0}));x+=col.w;});
      p.line(M,y-h+3,RIGHT,y-h+3,line,.5);y-=h;offset+=count;
    }
  };
  newPage();
  if(nameLines.length>2)paragraph('Company: '+companyName,{size:9,bold:true});
  if(companyLines.length>2)paragraph('Company details: '+company,{size:8,color:muted});
  report.labels.forEach(value=>paragraph(value,{size:8,color:muted}));
  paragraph(report.kind==='stock'?'Opening + In − Out − Sales = Available · All saved dates, including future-dated saved entries. Units are never converted or added together.':'Balance after entry is from the full chronological ledger, not the filtered subtotal. All tagged names, roles and original source notes follow each entry.',{size:8,color:muted});
  if(report.kind==='stock'){
    const cols=[{label:'Product / opening date',w:160},{label:'Unit',w:40},{label:'Opening + In',w:70},{label:'Out',w:55},{label:'Sales',w:55},{label:'Available',w:75},{label:'Minimum',w:60.28}];
    tableHeader(cols);report.rows.forEach(row=>tableRow(cols,[row.name+'\n'+row.date+(row.low?'\nLOW STOCK':''),row.unit,stkFmt(row.totalIn),stkFmt(row.totalOut),stkFmt(row.totalSale),stkFmt(row.available),stkFmt(row.minQty)]));
  }else{
    const cols=[{label:'Date',w:65},{label:'Product',w:125},{label:'Type',w:65},{label:'Qty / unit',w:75},{label:'Balance',w:70},{label:'Party',w:115.28}];
    report.rows.forEach((row,index)=>{
      if(y<155)newPage();tableHeader(cols);
      tableRow(cols,[row.date,row.currentProductName+(row.currentProductName!==row.productName?'\nAt entry: '+row.productName:''),row.source==='opening'?'Opening / In':STK_KINDS[row.type],(row.type==='in'?'+':'−')+stkFmt(row.qty)+' '+row.unit,stkFmt(row.balance)+' '+row.unit,row.party||'—']);
      // Leave a real baseline gap below the row separator, including shaped
      // Hindi text images; detail labels must never sit on the table rule.
      y-=10;
      const roles=[row.salesperson?'Salesperson: '+row.salesperson:'',row.deliveryName?'Delivery / receiver: '+row.deliveryName:'',row.deliveryPhone?'Phone: '+row.deliveryPhone:'',row.purpose?'Purpose: '+row.purpose:''].filter(Boolean);
      roles.forEach(value=>paragraph(value,{inset:8}));
      if(row.members.length)paragraph('Tagged members: '+row.members.map(name=>'@'+name).join(' · '),{bold:true,inset:8});
      const details=String(row.deliveryDetails||'').split('\n').filter(value=>!/^Tagged members:/.test(value)).join('\n');
      if(details)paragraph('Delivery details: '+details,{inset:8});
      if(row.note)paragraph('Source / note: '+row.note,{size:8,color:muted,inset:8});
      paragraph('Entry '+(index+1)+' of '+report.rows.length+' · '+row.id,{size:7,color:muted,inset:8});y-=5;
    });
  }
  const last=p.cur,total=p.pages.length;
  p.pages.forEach((ops,index)=>{p.cur=ops;p.line(M,45,RIGHT,45,line,.7);text(M,31,7,'Stock report · not an invoice',{color:muted});text(RIGHT,31,7,'Hisaab v'+APP_VERSION+' · Page '+(index+1)+' of '+total,{align:'right',color:muted});});p.cur=last;
  return {str:p.build(),name:'Stock_'+report.kind+'_'+report.from+'_to_'+report.to+'.pdf'};
}
function steScreenFilters() {
  const filters={...stkUI()};delete filters.lastMessage;
  // Products do not display the history-only controls. Never let those hidden
  // old values block or silently narrow the current-stock snapshot.
  if(stkUI().tab==='products') ['from','to','party','salesperson','type'].forEach(key=>delete filters[key]);
  $$('#stkFilters [name]').forEach(input=>{filters[input.name]=input.value.trim();});
  return filters;
}
function stePdfCurrent(e) {return !!e && stePdfEditor===e && $('#stePdfDialog')===e.element;}
async function stePdfPrepare() {
  const e=stePdfEditor;if(!stePdfCurrent(e))return;
  const serial=++e.serial;$('#stePdfDownload').disabled=true;$('#stePdfShare').disabled=true;$('#stePdfFiles').innerHTML='';
  if(e.url)URL.revokeObjectURL(e.url);e.url='';e.blob=null;
  try{
    stkCheck(e.context);
    const kind=$('#steReportKind')?.value||e.kind,filters={...e.filters};
    // A current-stock snapshot cannot pretend to apply historical party/dates.
    const report=steReport({kind,filters,entryId:e.entryId});
    $('#stePdfSummary').innerHTML='<b>'+report.rows.length+' '+(kind==='stock'?'products':'saved entries')+'</b><p>'+report.labels.map(esc).join('<br>')+'</p><p>'+ (kind==='stock'?'Har product ki original unit + live available quantity.':'Har entry ki quantity, balance, party, tagged log, roles aur source note.')+'</p>';
    $('#stePdfError').textContent='PDF taiyar ho rahi hai…';
    if(document.fonts?.load)await Promise.all([400,700].map(weight=>document.fonts.load(weight+' 16px "Hisaab Indic"')));
    if(!stePdfCurrent(e)||serial!==e.serial)return;stkCheck(e.context);
    const out=stePdfString(report);if(!stePdfCurrent(e)||serial!==e.serial)return;stkCheck(e.context);
    e.blob=pdfBlob(out.str);e.name=out.name;e.report=report;e.url=URL.createObjectURL(e.blob);
    $('#stePdfError').textContent='PDF ready. Download ya Share dabao. Stock mein koi badlav nahi hua.';
    $('#stePdfDownload').disabled=false;$('#stePdfShare').disabled=false;
  }catch(error){if(stePdfCurrent(e)&&serial===e.serial){$('#stePdfSummary').textContent='Current selection se PDF nahi bani.';$('#stePdfError').textContent=error.message;}}
}
function stePdfOpen(kind, entryId) {
  stkCheck(stkViewContext || stkContext());
  const filters=steScreenFilters(),selected=['stock','history','message'].includes(kind)?kind:stkUI().tab==='products'?'stock':'history';
  openModal('<div class="modal stk-dialog ste-pdf-dialog" id="stePdfDialog" role="dialog" aria-modal="true" aria-labelledby="stePdfTitle"><div class="modal-h"><div><h3 id="stePdfTitle">Stock ka PDF</h3><p>Company logo apne-aap. Saare matching pages included.</p></div><button type="button" class="x" data-act="closeModal" aria-label="Close Stock PDF">✕</button></div><div class="modal-b">'+(selected==='message'?'<p>Sirf is message ki saved entries ka PDF.</p>':'<label class="stk-field"><span>Kaunsa PDF chahiye?</span><select class="inp" id="steReportKind"><option value="stock"'+(selected==='stock'?' selected':'')+'>Available Stock — abhi kitna maal hai</option><option value="history"'+(selected==='history'?' selected':'')+'>Stock History — In / Out / Sales</option></select></label>')+'<div id="stePdfSummary" class="ste-summary"></div><p id="stePdfError" class="stm-help" role="status"></p><div id="stePdfFiles" class="row-actions"></div><p class="stm-help">Report local browser mein banti hai. Share par aap recipient aur app chunenge; kuch apne-aap nahi bheja jayega.</p></div><div class="modal-f"><button type="button" class="btn" data-act="closeModal">Band karo</button><button type="button" class="btn" id="stePdfShare" data-ste="sharePdf" disabled>Share PDF</button><button type="button" class="btn primary" id="stePdfDownload" data-ste="downloadPdf" disabled>↓ Download PDF</button></div></div>',{sticky:true});
  stePdfEditor={element:$('#stePdfDialog'),context:stkContext(),kind:selected,filters:selected==='message'?{}:filters,entryId,serial:0,url:'',blob:null};stePdfPrepare();
}
function steDownloadPdf(e) {
  if(!stePdfCurrent(e)||!e.blob)return false;stkCheck(e.context);
  const root=$('#stePdfFiles');root.innerHTML='<a class="btn" id="steSavePdf" download="'+esc(e.name)+'" href="'+esc(e.url)+'">PDF yahan se save karo</a>';
  const a=$('#steSavePdf');a.addEventListener('click',event=>{try{if(!stePdfCurrent(e))throw new Error('Report band ho gayi. Current PDF dobara kholein.');stkCheck(e.context);}catch(error){event.preventDefault();toast(error.message,'bad');}});
  if(!navigator.userActivation||navigator.userActivation.isActive)a.click();
  $('#stePdfError').textContent='PDF ready. Download shuru na ho to “PDF yahan se save karo” dabao.';return true;
}
async function steSharePdf() {
  const e=stePdfEditor;if(!stePdfCurrent(e)||!e.blob)return;
  try{
    stkCheck(e.context);
    const file=typeof File==='function'?new File([e.blob],e.name,{type:'application/pdf'}):null;
    if(file&&navigator.share&&navigator.canShare?.({files:[file]})){
      if(navigator.userActivation&&!navigator.userActivation.isActive){$('#stePdfError').textContent='PDF ready. Share PDF dobara dabakar app chuno.';return;}
      await navigator.share({files:[file],title:e.report.title,text:'Stock report · '+e.report.from+' to '+e.report.to});
      if(stePdfCurrent(e)){stkCheck(e.context);$('#stePdfError').textContent='Share sheet band hui. Bhejne ki pushti apni app mein check karein.';}
    }else{steDownloadPdf(e);$('#stePdfError').textContent='Is browser mein file sharing supported nahi. PDF save karo, phir WhatsApp mein Attach → Document se bhejo. PDF apne-aap attach / send nahi hui.';}
  }catch(error){if(stePdfCurrent(e))$('#stePdfError').textContent=error.name==='AbortError'?'Share cancel hua. Koi automatic send / download nahi hua.':error.message;}
}
document.addEventListener('click',event=>{
  const pdf=event.target.closest('[data-ste-pdf]');
  if(pdf){event.preventDefault();try{stePdfOpen(pdf.dataset.stePdf,pdf.dataset.id);}catch(error){toast(error.message,'bad');}return;}
  const button=event.target.closest('[data-ste]');if(!button||button.disabled)return;event.preventDefault();
  try{
    const action=button.dataset.ste;
    if(action==='downloadPdf'){steDownloadPdf(stePdfEditor);return;}
    if(action==='sharePdf'){steSharePdf();return;}
    if(action==='dismissReceipt'){delete stkUI().lastMessage;render();return;}
    if(action==='newMessage'){stmOpen();return;}
    const e=stmEditor;if(!stmCurrent(e))return;
    if(action==='back'){stmInvalidate(e,false);steStep(e,1);$('#stmText').focus();return;}
    if(action==='year'){$('#stmYear').value=button.dataset.year;stmInvalidate(e,false);return;}
    if(action==='office'){$('#stmPurpose').value='Office transfer';stmInvalidate(e,false);stmPreview();return;}
    if(action==='role'){
      const name=stePeople(e)[Number(button.dataset.person)];if(!name)return;
      const input=button.dataset.role==='salesperson'?$('#stmSalesperson'):$('#stmDelivery');input.value=input.value===name?'':name;
      stmInvalidate(e,false);steRefreshPeople(e);stmPreview();return;
    }
    if(action==='addMember'){
      const input=$('#steMemberInput'),name=input.value.trim();
      try{const all=steCheckedMembers(steSourceTags($('#stmText').value),(e.members||[]).concat(name));e.members=all.filter(member=>!steMemberNames(steSourceTags($('#stmText').value)).some(base=>stkKey(base)===stkKey(member)));input.value='';$('#steMemberError').textContent='';stmInvalidate(e,false);steRefreshPeople(e);stmPreview();}
      catch(error){$('#steMemberError').textContent=error.message;}return;
    }
    if(action==='removeMember'){
      const name=stePeople(e)[Number(button.dataset.person)];e.members=e.members.filter(member=>stkKey(member)!==stkKey(name));
      ['stmSalesperson','stmDelivery'].forEach(id=>{if($('#'+id).value===name)$('#'+id).value='';});stmInvalidate(e,false);steRefreshPeople(e);stmPreview();
    }
  }catch(error){const box=$('#stePdfError');if(box)box.textContent=error.message;else toast(error.message,'bad');}
});
document.addEventListener('keydown',event=>{if(event.target.id==='steMemberInput'&&event.key==='Enter'){event.preventDefault();$('[data-ste="addMember"]')?.click();}});
document.addEventListener('change',event=>{if(event.target.id==='steReportKind')stePdfPrepare();});
/* v3.36 STOCK EASY END */
