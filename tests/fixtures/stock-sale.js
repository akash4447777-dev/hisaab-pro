/* Synthetic Sale / package fixtures ONLY. No account, product or customer seed
   is embedded in the application. Prices are sample INR for arithmetic tests. */
const {legacy,clone,product,movement,audit,blank}=require('./stock');
const catalogue=[['scoreboard','Plastic scoreboard','Boxes',10],['hanger','Maple hanger','sets',20],['cloth','Cloth sample green','rolls',5]];
function data(){
 const d=clone(legacy),s=blank();d.settings.shopName='EXAMPLE SALE QA';d.settings.demo=false;
 catalogue.forEach(([id,name,unit,qty],i)=>{
  const p=product(id,{name,unit,minQty:0}),t=movement('opening-'+id,id,'in',qty,'2026-11-01',{productName:name,unit,source:'opening',purpose:'Opening stock',sequence:100+i,note:'Synthetic opening'});
  s.products.push(p);s.transactions.push(t);s.history.push(audit('hp-'+id,'product',null,p,'create',{sequence:200+i}),audit('ht-'+id,'transaction',null,t,'create',{sequence:210+i}));
 });d.settings.stockInventory=s;return d;
}
function input(id='sale1_fixtureSale00001',extra={}){
 return {id,label:'Starter package',date:'2026-11-14',time:'17:30',party:'Example buyer',salesperson:'Sales Employee',deliveryName:'Delivery Employee',deliveryPhone:'+91 9000-000000',deliveryDetails:'Sample address · Gate 2',note:'Synthetic sale note',rows:[
  {productId:'scoreboard',qty:'2',rate:'100.25',discountType:'percent',discount:'5'},
  {productId:'hanger',qty:'1.25',rate:'50',discountType:'amount',discount:'2.50'}
 ],...extra};
}
function edit(saved,patch={}){return input(saved[0].sale.id,{edit:true,label:saved[0].sale.label,date:saved[0].date,time:saved[0].sale.time,party:saved[0].party,salesperson:saved[0].salesperson,deliveryName:saved[0].deliveryName,rows:saved.map(t=>({id:t.id,productId:t.productId,qty:String(t.qty),rate:(t.sale.rate/100).toFixed(2),discountType:t.sale.discountType,discount:(t.sale.discount/100).toFixed(2)})),...patch});}
module.exports={catalogue,data,input,edit};
