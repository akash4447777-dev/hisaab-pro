/* v3.39 STOCK UNIT CHOICES BEGIN
   Product-form convenience only. Existing validation, exact stored unit labels,
   movement locks, dated quantities and atomic saves remain the source of truth. */
const STU_GROUPS = Object.freeze([
  ['Count / packing', ['pcs','box','set','bundle','roll','packet','pack','carton','pair','dozen','bag','gaddi','table','unit','bottle','can','drum']],
  ['Weight', ['kg','g','quintal','tonne']],
  ['Volume', ['litre','ml']],
  ['Length / area', ['metre','cm','mm','feet','inch','sqft','sqm']]
].map(([name, units]) => Object.freeze([name, Object.freeze(units)])));
const STU_UNITS = Object.freeze(STU_GROUPS.flatMap(group => group[1]));
function stuFieldHTML(value) {
  const known = STU_UNITS.includes(value);
  return '<div class="stk-field stu-field"><label for="stkPUnitChoice">Unit *</label><select class="inp" id="stkPUnitChoice" aria-describedby="stuUnitHelp">' +
    STU_GROUPS.map(([label, units]) => '<optgroup label="' + esc(label) + '">' + units.map(unit => '<option value="' + esc(unit) + '"' + (value === unit ? ' selected' : '') + '>' + esc(unit) + '</option>').join('') + '</optgroup>').join('') +
    '<option value="__custom__"' + (!known ? ' selected' : '') + '>Other / custom unit…</option></select>' +
    '<label class="stk-field stu-custom" id="stuCustomUnit"' + (known ? ' hidden' : '') + '><span>Custom unit *</span><input class="inp" id="stkPUnit" required maxlength="18" value="' + esc(value) + '" placeholder="e.g. crate / your unit" aria-describedby="stuUnitHelp"></label>' +
    '<small class="muted" id="stuUnitHelp">Unit chuno, ya Other / custom unit mein apni unit likho. Box / pcs / set ki conversion nahi hogi. Ek product ki ek unit; movements ke baad unit lock rahegi.</small></div>';
}
document.addEventListener('change', event => {
  const choice = event.target;
  if (choice.id !== 'stkPUnitChoice' || !choice.isConnected) return;
  const form = choice.closest('#stkProductForm'), input = form?.querySelector('#stkPUnit'), custom = form?.querySelector('#stuCustomUnit');
  if (!input || !custom) return;
  if (choice.value === '__custom__') {
    if (custom.hidden) input.value = input.dataset.stuCustom || '';
    custom.hidden = false; input.focus();
  } else if (STU_UNITS.includes(choice.value)) {
    if (!custom.hidden) input.dataset.stuCustom = input.value;
    input.value = choice.value; custom.hidden = true;
  }
});
/* v3.39 STOCK UNIT CHOICES END */
