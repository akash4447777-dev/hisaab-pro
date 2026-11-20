/* Narrow v3.29 allowances for old exact-source regression guards. No financial,
   row/clock/bonus/Excel logic is excluded: reverse ONLY these logo header/signature slots
   and the shared writer's three image hooks, then compare the entire old body. */
const assert = require('node:assert/strict');
function replaceExact(source, from, to, count) {
  assert.equal(source.split(from).length - 1, count, 'audited logo hook: ' + from.slice(0, 85));
  return source.split(from).join(to);
}
function withoutLogoHeader(source) {
  if (!source.includes('  const logoPad = companyLogoData() ? 58 : 0;')) return source;
  source=replaceExact(source,'  const logoPad = companyLogoData() ? 58 : 0;\n','',1);
  for(const [from,to,count] of [
    ['CW - 150 - logoPad, true','CW - 150, true',1],
    ['text(M + logoPad, y, 10, value','text(M, y, 10, value',1],
    ['text(M + logoPad, y - 1, 8.5, attNiceDate(report.from)','text(M, y - 1, 8.5, attNiceDate(report.from)',1],
    ['CW - 205 - logoPad','CW - 205',2],
    ['text(M + logoPad, y, 13, value, { bold: true, black: true })','text(M, y, 13, value, { bold: true, black: true })',1],
    ['text(M + logoPad, y, 8, value, { color: muted })','text(M, y, 8, value, { color: muted })',1]
  ]) source=replaceExact(source,from,to,count);
  assert.ok(!source.includes('logoPad')); return source;
}
function withoutLogoWriter(source) {
  if (!source.includes('this.logo = companyLogoData()')) return source;
  source=replaceExact(source,' this.logo = companyLogoData();','',1);
  source=replaceExact(source,'this.y = this.logo ? 780 : 800; companyLogoPdfPage(this);','this.y = 800;',1);
  source=replaceExact(source,'return pdfEmbedImages(out, (this.logo ? [this.logo] : []).concat(this.attImages || []));','return out;',1);
  return source;
}
function withoutLogoSignature(source) {
  if (!source.includes('  if (p.logo) {\n    const signature =')) return source;
  const oldLine = '  p.text(RIGHT - 170, sy - 11, 8, (d.ownerName || "Authorised signatory") + " / For " + (d.shopName || ""), { color: C.muted });';
  const block = `  if (p.logo) {
    const signature = (d.ownerName || "Authorised signatory") + " / For " + (d.shopName || "");
    p.wrap(signature, 8, 160).forEach((value, i) => p.text(RIGHT - 170, sy - 11 - i * 10, 8, value, { color: C.muted }));
  } else {
  ${oldLine}
  }`;
  return replaceExact(source, block, oldLine, 1);
}
module.exports={withoutLogoHeader,withoutLogoWriter,withoutLogoSignature};
