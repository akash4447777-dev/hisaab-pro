#!/usr/bin/env node
/* Developer-only, local hand-off. Requires `npm ci --prefix tests`.
   Never uploads inventory, creates a public file, or writes an account. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),{gzipSync}=require('node:zlib');
const ROOT=path.resolve(__dirname,'..'),PRIVATE=path.join(ROOT,'private-imports');
const version=fs.readFileSync(path.join(ROOT,'hisaab_v3.html'),'utf8').match(/const APP_VERSION = "([\d.]+)";/)[1];
const DEFAULT_BASE='https://akash4447777-dev.github.io/hisaab-pro/Hisaab-Pro-v'+version+'.html';
function createStockLink(opening,{base=DEFAULT_BASE,date,encoding='gzip'}={}) {
  const target=new URL(base);
  if(target.origin!=='https://akash4447777-dev.github.io'||!['/hisaab-pro/Hisaab-Pro-v'+version+'.html','/hisaab-pro/hisaab_v3.html'].includes(target.pathname)||target.search||target.hash||target.username||target.password) throw new Error('Use the current same-origin Hisaab panel HTML URL, without a query or fragment.');
  if(typeof date!=='string') throw new Error('Choose --date import-day, ask, or an explicit YYYY-MM-DD.');
  if(!['gzip','raw'].includes(encoding)) throw new Error('Encoding must be gzip or raw.');
  const packet={format:'hisaab-stock-link',version:1,date:date==='ask'?'':date,opening};
  const text=JSON.stringify(packet);
  // Reuse the ACTUAL release parser in a disposable, offline, memory-only DOM.
  // The fixed test clock is irrelevant: the encoded import-day remains a policy,
  // not a precomputed date. No fixture rows are included in the output packet.
  const {boot,devices}=require('../tests/stock-qa');let device,parsed;
  try {device=boot();parsed=device.I.openingLink.parse(text);}
  finally {if(device){device.close();devices.splice(devices.indexOf(device),1);}}
  const bytes=Buffer.from(text,'utf8'),token=(encoding==='gzip'?'g1.':'j1.')+(encoding==='gzip'?gzipSync(bytes,{level:9}):bytes).toString('base64url');
  if(token.length>131072) throw new Error('Link exceeds the bounded token size; use the existing file importer for this larger catalogue.');
  target.hash='stock-opening='+token;
  return {url:target.href,rows:parsed.rows.length,positive:parsed.rows.filter(r=>r.quantity>0).length,characters:target.href.length,encoding,date:packet.date};
}
function writePrivateLink(result,destination) {
  const output=path.resolve(ROOT,destination);
  if(!output.startsWith(PRIVATE+path.sep)||path.extname(output)!=='.md') throw new Error('Output must be a .md file inside ignored private-imports/; never publish it.');
  fs.mkdirSync(path.dirname(output),{recursive:true});
  const physical=fs.realpathSync(path.dirname(output));
  if(physical!==PRIVATE&&!physical.startsWith(PRIVATE+path.sep)) throw new Error('Private output folder must not point outside private-imports/.');
  const raw=output.slice(0,-3)+'.url.txt';
  if(fs.existsSync(output)||fs.existsSync(raw)) throw new Error('Output already exists. Choose a fresh private output name.');
  const dateText=result.date==='import-day'?'Aapki choice ke mutabik opening date link kholne wale din ki device date hogi.':result.date?'Opening date: '+result.date+'.':'Panel me opening date chunein.';
  const markdown='# Apna stock jodo\n\n'+
    '## [Stock jodo — apna Hisaab panel kholo]('+result.url+')\n\n'+
    '**File select nahi karni.** Upar ka link usi browser me kholein jahan aapka Hisaab data/account hai.\n\n'+
    result.rows+' products ka preview khulega. Account, date aur units dekhkar **“Haan, … products jodo”** dabayein. '+dateText+'\n\n'+
    'Box box rahega, pcs pcs. Pehle se maujood products skip honge; link dobara kholne se quantity double nahi hogi.\n\n'+
    'Link kholne se stock save nahi hota—**Haan** dabane ke baad hi add hoga. Yeh private link hai; forward na karein.\n';
  fs.writeFileSync(output,markdown,{encoding:'utf8',mode:0o600,flag:'wx'});
  fs.writeFileSync(raw,result.url+'\n',{encoding:'utf8',mode:0o600,flag:'wx'});
  return {output,raw};
}
function main(args) {
  if(args.length===0||args.includes('--help')) {console.log('Local private Stock link (never uploads inventory):\nnode scripts/create-stock-link.js --input private-imports/opening.json --date import-day --output private-imports/add-stock.md\n--date import-day | ask | YYYY-MM-DD; optional --encoding gzip | raw; optional --base CURRENT_PANEL_HTML_URL\nInstall validation dependencies first: npm ci --prefix tests. Output includes private Markdown + URL text; keep both out of Git/Pages.');return;}
  const options={};for(let i=0;i<args.length;i+=2){const key=args[i];if(!['--input','--date','--output','--base','--encoding'].includes(key)||!args[i+1]||Object.hasOwn(options,key))throw new Error('Invalid/missing/repeated CLI argument. See --help.');options[key]=args[i+1];}
  if(!options['--input']||!options['--output'])throw new Error('--input and --output are required.');
  const input=path.resolve(ROOT,options['--input']);if(fs.statSync(input).size>5*1024*1024)throw new Error('Opening file exceeds 5 MB.');
  let opening;try{opening=JSON.parse(fs.readFileSync(input,'utf8').replace(/^\uFEFF/,''));}catch(error){throw new Error('Opening file must be valid versioned JSON.');}
  const result=createStockLink(opening,{date:options['--date'],base:options['--base'],encoding:options['--encoding']}),files=writePrivateLink(result,options['--output']);
  console.log('Private hand-off written locally: '+path.relative(ROOT,files.output)+'\n'+result.rows+' rows; '+result.positive+' positive openings; '+result.characters+' URL characters; '+result.encoding+'.\nNo account was modified. Link/payload deliberately omitted from console. Do not commit or publicly serve these files.');
}
if(require.main===module){try{main(process.argv.slice(2));}catch(error){console.error('Stock link not generated: '+error.message);process.exitCode=1;}}
module.exports={createStockLink,writePrivateLink,DEFAULT_BASE};
