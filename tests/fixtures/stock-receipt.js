/* Synthetic incoming list. Never put a customer's catalogue in public tests. */
const names=['Maple hanger','Velvet cover','Zinc bracket','Canvas screen','Graphite pointer','Resin marker','Compact cap','Rubber bumper','Bronze fastener','Cotton ribbon','Packing crate (100 Pcs)','Granite slab','Aluminium channel (8 FT)','Microfiber pad'];
const units=['Sets','Boxes','Boxes','Sets','Boxes','Boxes','Bundles','pcs','Boxes','roll','Boxes','kg','Sets','metre'];
const packet=()=>({format:'hisaab-stock-in',version:1,date:'2026-11-25',supplier:'',reference:'',source:'Synthetic incoming list. Date and quantities explicitly reviewed.',rows:names.map((name,i)=>({name,unit:units[i],quantity:i===0?1.125:i+2}))});
const one=(extra={})=>({format:'hisaab-stock-in',version:1,date:'2026-11-25',rows:[{name:'Plastic scoreboard',quantity:3,unit:'Boxes'}],...extra});
module.exports={names,units,packet,one};
