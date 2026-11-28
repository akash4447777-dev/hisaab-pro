/* Deliberately synthetic; never a customer inventory/export or receipt. */
const formats=[
 ['headerless TSV','Plastic scoreboard\t3\tBoxes'],
 ['headerless reversed TSV','Boxes\tPlastic scoreboard\t3'],
 ['headerless pipe','3 | Boxes | Plastic scoreboard'],
 ['headerless semicolon','Plastic scoreboard;Boxes;3'],
 ['headerless CSV','Boxes,3,Plastic scoreboard'],
 ['combined quantity TSV','Plastic scoreboard\t3 Boxes'],
 ['reversed combined quantity TSV','Boxes 3\tPlastic scoreboard'],
 ['unit before quantity','Plastic scoreboard Boxes 3'],
 ['reordered labels','Quanity:3\nProdcut:Plastic scoreboard\nUnti:Boxes'],
 ['typo table labels','Sr.No.,Prodcut,Quanity,Unti\n1,Plastic scoreboard,3,Boxes'],
 ['explicit unit header','Product,Qty (Boxes)\nPlastic scoreboard,3'],
 ['typed cell repair','Product,Qty,Unit\nPlastic scoreboard,Boxes,3'],
 ['date/type cell repair','Product,Qty,Unit,Date,Type\nPlastic scoreboard,3,Boxes,Recived,25/11/2026'],
 ['unit-first quantity cell','Product,Qty\nPlastic scoreboard,Boxes 3'],
 ['reordered full columns','Boxes\t25/11/2026\tPlastic scoreboard\t3\tRecived'],
 ['quoted headerless CSV','"Plastic scoreboard","3","Boxes"'],
 ['Hindi quantities','Plastic scoreboard\t३\tबॉक्स'],
 ['table column synonyms','Item Description\tReceived Qty\tUnit of measure\nPlastic scoreboard\t3\tBoxes']
];
const partial=`25/11/2026
Plas scbd 3 boxes
Ceramic marker 2 pcs
Ceramc marker 4 pieces
Maple hanger 0 sets`;
const malformed=`Product,Qty,Unit,Date
Plastic scoreboard,3,box,2026-11-25
Maple hanger,wrong,set,2026-11-25`;
module.exports={formats,partial,malformed};
