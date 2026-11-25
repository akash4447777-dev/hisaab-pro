/* Shared isolated jsdom / CAS backend for v3.32 inventory tests. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const {payload,clone}=require('./fixtures/stock');
const html=fs.readFileSync(process.env.HISAAB_HTML||path.join(__dirname,'..','hisaab_v3.html'),'utf8');
const KEY='hisaabPro.v1',OWNER='hisaabPro.owner.v1',CFG='hisaabPro.cloud.v1';
const A={id:'inventory-account-a',email:'stock-a@example.test'},B={id:'inventory-account-b',email:'stock-b@example.test'};
const PROJECT='https://inventory-qa.supabase.co';
const devices=[],errors=[];
const wait=(ms=0)=>new Promise(resolve=>setTimeout(resolve,ms));
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};}
class Server {
  constructor(data){this.rows=new Map();this.writes=[];this.attempts=[];this.reads=0;if(data)this.set(A,data);}
  set(user,data,stamp='2026-11-01T10:00:00.000Z'){this.rows.set(user.id,{user_id:user.id,payload:clone(data),updated_at:stamp});}
  get(user=A){const r=this.rows.get(user.id);return r&&clone(r);}
  client(){const db=this;let session=null;return {
    auth:{getSession:async()=>({data:{session:session?{user:session}:null},error:null}),signInWithPassword:async({email})=>{session=email===B.email?B:A;return {data:{user:session},error:null};},signOut:async()=>{session=null;return {error:null};}},
    from(table){assert.equal(table,'hisaab_data');return {
      mode:'read',filters:[],value:null,select(){return this;},eq(k,v){this.filters.push([k,v]);return this;},is(k,v){return this.eq(k,v);},update(v){this.mode='update';this.value=clone(v);return this;},insert(v){this.mode='insert';this.value=clone(v);return this;},
      async maybeSingle(){const userId=this.value?.user_id||this.filters.find(([k])=>k==='user_id')?.[1];if(!session||session.id!==userId)return {data:null,error:{code:'42501',message:'QA RLS denied'}};
        if(this.mode==='read'){db.reads++;await db.onRead?.({query:this,userId});if(db.failRead)return {data:null,error:db.failRead};const row=db.get({id:userId});return {data:row?{payload:row.payload,updated_at:row.updated_at}:null,error:null};}
        db.attempts.push({mode:this.mode,filters:clone(this.filters),value:clone(this.value)});await db.onWrite?.({query:this,userId});if(db.failWrite)return {data:null,error:db.failWrite};const row=db.rows.get(userId);
        if(this.mode==='insert'&&row)return {data:null,error:{code:'23505',message:'duplicate'}};
        if(this.mode==='update'&&(!row||this.filters.some(([k,v])=>row[k]!==v)))return {data:null,error:null};
        const next={user_id:userId,...clone(this.value)};db.rows.set(userId,next);db.writes.push(clone(next));return {data:{payload:clone(next.payload),updated_at:next.updated_at},error:null};
      }
    };}
  };}
}
function boot(data=payload(),options={}) {
  const vc=new VirtualConsole(),raw=JSON.stringify(data),source=options.source||html,db=options.db,client=db?.client();
  vc.on('jsdomError',error=>errors.push(error.message));const files=[],blobs=new Map();
  const stockHooks=source.includes('/* v3.32 STOCK MANAGEMENT BEGIN')?', stkImportSettings, stkRecoveryCheck, stkResolutionAudit, stkAuditRows, stkPickPhoto, stkMakeMovement, stkEnsureImages':'';
  const script=source.replace('window.Hisaab = { Store,','window.Hisaab = { stockQA: { importData, exportData, validateRemote, completeRemote, normalizeData, syncCollections, removedRows, unconfirmedRemoteLoss, dataCountText, hasRows, openModal, closeModal, stk: '+!!stockHooks+stockHooks+' }, Store,');
  const dom=new JSDOM(script,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.test/hisaab/',virtualConsole:vc,beforeParse(w){
    const RealDate=w.Date;w.Date=class extends RealDate{constructor(...args){super(...(args.length?args:['2026-11-14T12:00:00Z']));}static now(){return 1794657600000;}};
    w.scrollTo=()=>{};w.open=()=>null;w.print=()=>{};
    w.localStorage.setItem(KEY,options.raw??raw);
    if(options.storage)for(const[k,v]of Object.entries(options.storage))w.localStorage.setItem(k,v);
    if(db){w.localStorage.setItem(CFG,JSON.stringify({url:PROJECT,key:'synthetic-public-anon-key'}));w.supabase={createClient:()=>client};}
    w.URL.createObjectURL=blob=>{const id='blob:stock-'+blobs.size;blobs.set(id,blob);return id;};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){if(this.download)files.push({name:this.download,blob:blobs.get(this.href)});};
    options.before?.(w);
  }});
  const w=dom.window,H=w.Hisaab;assert.ok(H,'app booted');const d={dom,w,H,S:H.Store,C:H.Cloud,I:H.stock,Q:H.stockQA,raw,files,client,
    $:s=>w.document.querySelector(s),$$:s=>Array.from(w.document.querySelectorAll(s)),
    dump(){return Object.fromEntries(Object.keys(w.localStorage).sort().map(k=>[k,w.localStorage.getItem(k)]));},
    async login(user=A){await wait(1);return H.Cloud.signIn(user.email,'synthetic-password');},
    close(){H.Cloud.resetSession();w.close();}
  };devices.push(d);H.UI.year=2026;H.UI.month=10;H.go(H.stock?'stock':'dashboard');return d;
}
const same=(a,b,label)=>assert.deepEqual(clone(a),clone(b),label);
const snapshot=d=>JSON.stringify({data:d.S.data,disk:d.dump(),dirty:d.C.dirty});
const finance=d=>JSON.stringify({workers:d.S.data.workers,records:d.S.data.records,canteen:d.S.data.canteen,attendance:d.S.data.attendance,settings:Object.fromEntries(Object.entries(d.S.data.settings).filter(([k])=>k!=='stockInventory'))});
function click(d,selector){const el=d.$(selector);assert.ok(el,selector);el.click();}
function action(d,name,attributes={}){const el=d.w.document.createElement('button');el.dataset.act=name;Object.assign(el.dataset,attributes);d.w.document.body.appendChild(el);el.click();el.remove();}
function set(d,selector,value,kind='change'){const el=d.$(selector);assert.ok(el,selector);el.value=value;el.dispatchEvent(new d.w.Event(kind,{bubbles:true}));}
function submit(d,selector){const form=d.$(selector);assert.ok(form,selector);form.dispatchEvent(new d.w.Event('submit',{bubbles:true,cancelable:true}));}
function importStart(d,data){let input;const create=d.w.document.createElement.bind(d.w.document);d.w.document.createElement=function(tag,...args){const el=create(tag,...args);if(tag==='input'){input=el;el.click=()=>{};}return el;};try{d.Q.importData();}finally{d.w.document.createElement=create;}assert.ok(input);const file=new d.w.File([JSON.stringify(data)],'stock-backup.json',{type:'application/json'});Object.defineProperty(input,'files',{value:[file]});return ()=>new Promise(resolve=>{const Reader=d.w.FileReader;d.w.FileReader=class extends Reader{constructor(){super();this.addEventListener('loadend',()=>resolve());}};try{input.onchange();}finally{d.w.FileReader=Reader;}});}
async function importData(d,data){await importStart(d,data)();}
const blobBytes=(d,blob)=>new Promise((resolve,reject)=>{const reader=new d.w.FileReader();reader.onload=()=>resolve(Buffer.from(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsArrayBuffer(blob);});
module.exports={assert,fs,path,html,KEY,OWNER,CFG,A,B,PROJECT,devices,errors,wait,deferred,Server,boot,same,snapshot,finance,click,action,set,submit,importStart,importData,blobBytes};
