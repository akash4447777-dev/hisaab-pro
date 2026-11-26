/* v3.38 STOCK NAME MATCH BEGIN
   Local name similarity only. The ordinary reviewed plan/apply path remains the
   sole stock writer. Scores are not probabilities; units are never converted. */
const STF_MIN = 0.75, STF_GAP = 0.05;
const STF_WORDS = Object.freeze({sticks:'stick',cues:'cue',balls:'ball',boards:'board',rolls:'roll',bundles:'bundle',sets:'set',boxes:'box',pieces:'piece',tables:'table',bags:'bag',brushes:'brush',triangles:'triangle',lights:'light',gray:'grey',golden:'gold'});
function stfName(value) {
  return String(value || '').normalize('NFKC').toLocaleLowerCase('en')
    .replace(/[०-९]/g, d => String('०१२३४५६७८९'.indexOf(d)))
    .replace(/([\p{N}])([\p{L}])/gu, '$1 $2').replace(/([\p{L}])([\p{N}])/gu, '$1 $2')
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ').split(' ')
    .map(word => Object.hasOwn(STF_WORDS, word) ? STF_WORDS[word] : word).join(' ');
}
function stfEdit(a, b) {
  const x = Array.from(a), y = Array.from(b);
  if (!x.length || !y.length) return x.length === y.length ? 1 : 0;
  let previous = Array.from({length:y.length + 1}, (_, i) => i);
  for (let i = 0; i < x.length; i++) {
    const next = [i + 1];
    for (let j = 0; j < y.length; j++) next.push(Math.min(next[j] + 1, previous[j + 1] + 1, previous[j] + (x[i] === y[j] ? 0 : 1)));
    previous = next;
  }
  return 1 - previous[y.length] / Math.max(x.length, y.length);
}
function stfScore(a, b) {
  const left = stfName(a), right = stfName(b);
  if (!left || !right) return 0;
  const x = left.split(' '), y = right.split(' '), remaining = [...y]; let common = 0;
  for (const word of x) { const at = remaining.indexOf(word); if (at >= 0) { common++; remaining.splice(at, 1); } }
  // Token Dice accepts omitted descriptive words/reordered names. Character edit
  // similarity accepts typos and spacing differences; neither rewrites the name.
  return Math.max(2 * common / (x.length + y.length), stfEdit(left.replace(/ /g, ''), right.replace(/ /g, '')),
    stfEdit([...x].sort().join(''), [...y].sort().join('')));
}
function stfVariant(a, b) {
  const left = stfName(a), right = stfName(b);
  const numbers = text => text.match(/\d+/g) || [];
  const x = numbers(left), y = numbers(right);
  if (x.length && y.length && x.join('|') !== y.join('|')) return 'size / model number alag';
  const dimensions = text => (text.match(/\d+\s+(?:mm|cm|m|inch|inches|ft|feet|foot)\b/g) || []).map(part => part.replace(/inches/g, 'inch').replace(/feet|foot/g, 'ft'));
  const firstSize = dimensions(left), secondSize = dimensions(right);
  if (firstSize.length && secondSize.length && firstSize.join('|') !== secondSize.join('|')) return 'size ki unit alag';
  const codes = value => String(value).normalize('NFKC').toLocaleLowerCase('en').replace(/[०-९]/g, d => String('०१२३४५६७८९'.indexOf(d)))
    .match(/[\p{L}\p{N}]+/gu)?.filter(word => /\p{L}/u.test(word) && /\p{N}/u.test(word)) || [];
  const firstCode = codes(a), secondCode = codes(b);
  if (firstCode.length && secondCode.length && firstCode.join('|') !== secondCode.join('|')) return 'model code alag';
  const groups = [
    ['black','white','red','blue','green','yellow','orange','brown','pink','purple','grey','gold','silver'],
    ['half','full'], ['small','medium','large'], ['left','right'], ['male','female']
  ];
  const l = left.split(' '), r = right.split(' ');
  for (let i = 0; i < groups.length; i++) {
    const first = [...new Set(l.filter(word => groups[i].includes(word)))].sort(), second = [...new Set(r.filter(word => groups[i].includes(word)))].sort();
    if (first.length && second.length && first.join('|') !== second.join('|')) return i ? 'product variant alag' : 'colour alag';
  }
  return '';
}
function stfFamily(value) {
  const variants = new Set(['mm','cm','inch','inches','ft','feet','foot','black','white','red','blue','green','yellow','orange','brown','pink','purple','grey','gold','silver','half','full','small','medium','large','left','right','male','female']);
  return stfName(value).split(' ').filter(word => !/\d/.test(word) && !variants.has(word)).join(' ');
}
function stmMatch(block, s) {
  // Exact normalized name + exact unit and previously reviewed aliases retain
  // precedence, including old alias conflicts and explicit unit-conflict errors.
  const known = stfExactMatch(block, s);
  if (known.id || known.kind.startsWith('Conflicting')) return known;
  const unit = stmUnit(block.unit);
  const candidates = s.products.map(product => ({id:product.id, score:stfScore(block.name, product.name),
    sameUnit:stmUnit(product.unit) === unit, variant:stfVariant(block.name, product.name)}))
    .filter(candidate => candidate.score >= 0.55)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const compatible = candidates.filter(candidate => candidate.sameUnit && !candidate.variant), best = compatible[0];
  const wrongUnit = candidates.find(candidate => !candidate.sameUnit && !candidate.variant && candidate.score >= STF_MIN);
  const percent = score => Math.floor(score * 100 + 1e-9);
  const summary = {suggestions:candidates.slice(0, 3).map(candidate => candidate.id), candidates};
  if (wrongUnit && (!best || wrongUnit.score > best.score + STF_GAP)) return {...summary, id:'', kind:'UNIT CONFLICT — naam ' + percent(wrongUnit.score) + '% milta hai, lekin unit alag hai. Product / original unit check karein.'};
  if (best && best.score >= STF_MIN) {
    const rival = compatible[1], bestName = s.products.find(product => product.id === best.id).name;
    const missingVariant = compatible.slice(1).some(candidate => {
      const other = s.products.find(product => product.id === candidate.id).name;
      return stfVariant(bestName, other) && stfFamily(bestName) && stfFamily(bestName) === stfFamily(other);
    });
    // A shorter numeric model must not win merely because its number has fewer
    // characters when the source omitted size/colour and both variants fit.
    if (missingVariant || rival && best.score - rival.score <= STF_GAP + 1e-12)
      return {...summary, id:'', kind:'Conflicting close matches — do products / variants milte hain; sahi product chuno.'};
    return {...summary, id:best.id, method:'fuzzy', score:best.score, percent:percent(best.score),
      kind:percent(best.score) + '% naam match — product apne-aap chuna. Naam / unit dekhkar badal sakte hain.'};
  }
  const variant = candidates.find(candidate => candidate.sameUnit && candidate.variant && candidate.score >= STF_MIN);
  return {...summary, id:'', kind:variant ? 'Naam milta hai, lekin ' + variant.variant + ' — sahi product confirm karein.' : '75% se kam / unclear naam match — saved product chuno.'};
}
function stfStatus(block) {
  if (block.productId !== block.match.id) return '✓ Aapne product chuna';
  return block.match.method === 'fuzzy' ? '✓ ' + block.match.percent + '% naam match' : '✓ Product matched';
}
function stfMatchNote(block) {
  return block.productId && block.productId !== block.match.id ? 'Aapne product chuna. Original quantity / unit aur date dekhkar confirm karein.' : block.match.kind;
}
/* v3.38 STOCK NAME MATCH END */
