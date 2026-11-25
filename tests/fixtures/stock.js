/* Synthetic inventory only. No customer data, photo service, or stock pricing. */
const { fixture: legacy } = require('./canteen-filters');
const clone = value => JSON.parse(JSON.stringify(value));
const DATE = '2026-11-01';
const product = (id='cloth', extra={}) => ({id,name:id==='cloth'?'Cotton Fabric':'Packing Box',unit:id==='cloth'?'metre':'pcs',date:DATE,minQty:10,photoId:'',note:'Original product note',createdAt:100,updatedAt:100,...extra});
const movement = (id, productId='cloth', type='in', qty=100, date=DATE, extra={}) => ({id,productId,productName:productId==='cloth'?'Cotton Fabric':'Packing Box',unit:productId==='cloth'?'metre':'pcs',photoId:'',type,qty,date,sequence:100,party:type==='sale'?'Gupta Traders':'',salesperson:type==='sale'?'Amit':'',deliveryName:type==='sale'?'Ravi':'',deliveryPhone:type==='sale'?'9876500000':'',deliveryDetails:type==='sale'?'Delhi warehouse · Van QA-01':'',purpose:type==='out'?'Production':'',note:'Original transaction note',source:'manual',createdAt:100,updatedAt:100,...extra});
const audit = (id, entity, before, after, action='create', extra={}) => ({id,at:200,sequence:200,date:DATE,entity,entityId:(after||before).id,action,actor:'Fixture device',reason:'Synthetic audit',before:before?clone(before):null,after:after?clone(after):null,...extra});
function blank() {return {v:1,products:[],transactions:[],images:[],history:[]};}
function stock() {
  const s=blank(); s.products=[product(),product('box')];
  s.transactions=[movement('opening','cloth','in',100,DATE,{source:'opening',purpose:'Opening stock'}),movement('receipt','cloth','in',25.5,'2026-11-03',{sequence:101,party:'Supplier QA'}),movement('production','cloth','out',10.25,'2026-11-04',{sequence:102}),movement('sale','cloth','sale',20,'2026-11-05',{sequence:103}),movement('boxes','box','in',50,DATE,{sequence:104})];
  s.history=s.products.map((p,i)=>audit('hp-'+p.id,'product',null,p,'create',{sequence:200+i})).concat(s.transactions.map((t,i)=>audit('ht-'+t.id,'transaction',null,t,'create',{sequence:210+i})));
  return s;
}
function payload(s=stock()) {const d=clone(legacy);d.settings.stockInventory=clone(s);return d;}
module.exports={DATE,product,movement,audit,blank,stock,payload,legacy,clone};
