#!/usr/bin/env node
/* Local-only reviewed Stock In hand-off. No uploads or account writes.
   Incoming quantities ADD to matched products; never use the opening-link
   generator for this task, because existing products are skipped by that flow. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),{gzipSync}=require('node:zlib');
const ROOT=path.resolve(__dirname,'..'),PRIVATE=path.join(ROOT,'private-imports');
const version=fs.readFileSync(path.join(ROOT,'hisaab_v3.html'),'utf8').match(/const APP_VERSION = "([\d.]+)";/)[1];
const DEFAULT_BASE='https://akash4447777-dev.github.io/hisaab-pro/Hisaab-Pro-v'+version+'.html';
function createReceiptLink(packet,{base=DEFAULT_BASE,encoding='gzip'}={}) {
  const target=new URL(base);
  if(target.origin!=='https://akash4447777-dev.github.io'||!['/hisaab-pro/Hisaab-Pro-v'+version+'.html','/hisaab-pro/hisaab_v3.html'].includes(target.pathname)||target.search||target.hash||target.username||target.password)throw new Error('Current same-origin panel HTML URL required, without query/fragment.');
  if(!['gzip','raw'].includes(encoding))throw new Error('Encoding must be gzip or raw.');
  const text=JSON.stringify(packet),{boot,devices}=require('../tests/stock-qa');let device,parsed;
  try{device=boot();parsed=device.I.receiptLink.parse(text);}finally{if(device){device.close();devices.splice(devices.indexOf(device),1);}}
  const bytes=Buffer.from(text,'utf8'),token=(encoding==='gzip'?'g1.':'j1.')+(encoding==='gzip'?gzipSync(bytes,{level:9}):bytes).toString('base64url');
  if(token.length>131072)throw new Error('Incoming list link exceeds token bound. Use a smaller complete delivery.');
  target.hash='stock-in='+token;
  return {url:target.href,rows:parsed.rows.length,date:parsed.date,characters:target.href.length,encoding};
}
function writePrivateReceiptLink(result,destination) {
  const output=path.resolve(ROOT,destination);
  if(!output.startsWith(PRIVATE+path.sep)||path.extname(output)!=='.md')throw new Error('Output must be .md under ignored private-imports/. Never publish inventory.');
  fs.mkdirSync(path.dirname(output),{recursive:true,mode:0o700});
  const physical=fs.realpathSync(path.dirname(output));
  if(physical!==PRIVATE&&!physical.startsWith(PRIVATE+path.sep))throw new Error('Private output folder must not point outside private-imports/.');
  const raw=output.slice(0,-3)+'.url.txt';
  if(fs.existsSync(output)||fs.existsSync(raw))throw new Error('Output already exists. Use a fresh private filename.');
  const markdown='# Stock In — '+result.date+'\n\n## [Stock In list kholo — review karke Haan dabayein]('+result.url+')\n\n'+
    result.rows+' items, actual receipt date **'+result.date+'**. Us browser/account mein kholein jahan asli Stock data hai. File choose / per-item typing nahi.\n\n'+
    'Existing matched product par received quantity ADD hogi, available overwrite nahi. Clearly shown new products may be created with no opening movement. Name/unit/date and every warning review karein; **Haan** se hi ek guarded combo save hoga. Opening/date and duplicate conflicts cannot be bypassed.\n\n'+
    '**Abhi account mein kuch add nahi hua.** Open/Cancel/reopen preview zero-save hai. Supplier unknown ho toh blank rahega; box/set/pcs conversion nahi. Same saved receipt dobara add nahi hoti.\n\n'+
    'Private link inventory carry karta hai: encrypted/expiring/authenticated secret nahi. Forward, public post ya URL shortener mein na daalein. Local save ke baad configured account par Cloud synced aur JSON backup check karein.\n';
  fs.writeFileSync(output,markdown,{encoding:'utf8',mode:0o600,flag:'wx'});fs.writeFileSync(raw,result.url+'\n',{encoding:'utf8',mode:0o600,flag:'wx'});
  return {output,raw};
}
function main(args) {
  if(!args.length||args.includes('--help')){console.log('Local-only incoming Stock In link. Requires npm ci --prefix tests.\nnode scripts/create-stock-receipt-link.js --input private-imports/receipt.json --output private-imports/add-receipt.md\nTyped format: hisaab-stock-in version1, explicit date YYYY-MM-DD, rows [{name,quantity,unit}]. Optional supplier/reference/source. Optional --encoding raw|gzip, --base current same-origin panel HTML. Never publish input/output or treat this as an opening snapshot.');return;}
  const opts={};for(let i=0;i<args.length;i+=2){const key=args[i];if(!['--input','--output','--base','--encoding'].includes(key)||!args[i+1]||Object.hasOwn(opts,key))throw new Error('Invalid / missing / repeated CLI argument. See --help.');opts[key]=args[i+1];}
  if(!opts['--input']||!opts['--output'])throw new Error('--input and --output are required.');
  const input=path.resolve(ROOT,opts['--input']);if(fs.statSync(input).size>5*1024*1024)throw new Error('Stock In input exceeds 5 MB.');
  const packet=JSON.parse(fs.readFileSync(input,'utf8').replace(/^\uFEFF/,''));
  const result=createReceiptLink(packet,{base:opts['--base'],encoding:opts['--encoding']}),files=writePrivateReceiptLink(result,opts['--output']);
  console.log('Private Stock In hand-off written locally: '+path.relative(ROOT,files.output)+'\n'+result.rows+' items; '+result.date+'; '+result.characters+' URL characters; '+result.encoding+'.\nNo account modified. Link / payload deliberately omitted. Never commit or publicly serve private outputs.');
}
if(require.main===module){try{main(process.argv.slice(2));}catch(error){console.error('Stock In link not generated: '+error.message);process.exitCode=1;}}
module.exports={createReceiptLink,writePrivateReceiptLink,DEFAULT_BASE};
