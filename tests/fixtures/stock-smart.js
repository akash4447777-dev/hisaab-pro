/* Synthetic only. No business exports, real names, screenshots or account data. */
const incoming=`25/11/2026
Stock In
Plastc score board 3 Boxes
Cloth sample (green) 2 rolls
@Sales Employee @Delivery Employee`;
const mixed=`23/11/2026 Example buyer
Salesperson: Sales Employee
Delivery: Delivery Employee
Purpose: Office display
1- Plastic scoreboard
Pichle bache box 10
21/11 ko aaye +5
Aaj sold -2
Available box 13
2- Cloth sample (green)
Pichle bache roll 10
Aaj out -1
Available roll 9
Driver number +91 9000-000000
@Sales Employee @Delivery Employee @Accounts Employee`;
const partial=`Date: 25-11-2026
Type: Received
Plastic scoreboard 3 boxes
Cloth sample (green) 0 rolls
Maple hanger 4 sets`;
const catalogue=[['Plastic scoreboard','box'],['Cloth sample (green)','roll'],['Maple hanger','set']];
const formats=[
 ['plain list','25/11/2026\nStock In\nPlastic scoreboard 3 Boxes'],
 ['hyphen date','25-11-2026\nReceived\nPlastic scoreboard 3 box'],
 ['ISO date','2026-11-25\nIncoming\nPlastic scoreboard 3 box'],
 ['dotted date','25.11.2026\nPurchase\nPlastic scoreboard 3 box'],
 ['named month','25 November 2026\nRecieved\n3 Boxes of Plastic scoreboard'],
 ['natural sentence','Received Plastic scoreboard 3 Boxes on 25/11/2026'],
 ['middle movement word','25 Nov 2026\nPlastic scoreboard received 3 boxes'],
 ['reordered sentence','3 boxes Plastic scoreboard received on 25 Nov 2026'],
 ['quantity after unit','Product: Plastic scoreboard\nQuantity: 3\nUnit: Boxes\nDate: 25/11/2026\nType: in'],
 ['reordered labelled block','Date:25/11/2026\nType: received\nProduct: Plastic scoreboard\nUnit:Boxes\nQuantity:3'],
 ['inline labelled fields','Qty:3 | Unit:Boxes | Product:Plastic scoreboard | Date:25-11-2026 | Type:in'],
 ['Excel TSV','Qty\tProduct\tUnit\tType\tDate\n3\tPlastic scoreboard\tBoxes\treceived\t25-11-2026'],
 ['reordered CSV','Date,Type,Unit,Product,Qty\n25/11/2026,In,Boxes,Plastic scoreboard,3'],
 ['quoted CSV headers','"Date","Type","Unit","Product","Qty"\n"25/11/2026","In","Boxes","Plastic scoreboard","3"'],
 ['Markdown table','| Product | Qty | Unit | Type | Date |\n|---|---:|---|---|---|\n|Plastic scoreboard|3|Boxes|In|2026-11-25|'],
 ['JSON row array',JSON.stringify([{quantity:3,product:'Plastic scoreboard',date:'2026-11-25',unit:'Boxes',type:'Received'}])],
 ['numbered WhatsApp','Photo\n25/11/2026 Example supplier\n1- Plastic scoreboard\nAaye +3 box\n4:53 pm\n👍'],
 ['wrapped quantity','25/11/2026\n1- Plastic scoreboard\nAaye +\n3 box'],
 ['spelling and spacing','\ufeff25/11/2026\r\n  stock in  \r\n • Plastc   score board  3   boex  '],
 ['Hindi movement / numeral / unit','२५/११/२०२६\nआए\nPlastic scoreboard ३ बॉक्स']
];
module.exports={incoming,mixed,partial,catalogue,formats};
