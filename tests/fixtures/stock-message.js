/* Synthetic message-format examples. Never copy a customer screenshot/catalogue. */
const simple = `Quoted Factory Employee
Photo
21/11 Example customer
1- LED sample 2x3
Pichle bache ps 500
Aaj gai. -40
Available ps. 460

2- Short rubber sample
Pichle bache bundle 16
Aaj gaye. -1
Available bundle. 15

3- Long rubber sample
Pichle bache bundle 28
Aaj gaye. -2
Available bundle. 26
@Sales Employee @Delivery Employee @Informed
Employee
4:53 pm
👍`;
const mixed = `Quoted Factory Employee
Video (0:20)
23/11 Example buyer
1- Half cue sample 10mm
Pichle bache box 90
21/11 ko aaye. +200
Aaj gaya. -20
Available box 270

2- 8” brush sample
Pichle bache box 14
Aaj gaye. -4
Available box. 10

3- Cloth sample (green)
Pichle bache roll 7
Aaj gaya. -1
Available roll. 6

4- Carton sample
Pichle bache ps 380
Aaj gaye. -50
Available ps. 330
@Sales Employee @~Office Employee @Accounts Employee
6:05 pm`;
const office = `Quoted Factory Employee
Video (0:18)
25/11 office gaya (Example employee)
1- Large cue sample 13mm
Pichle bache box 25
21/11 ko aaye. +85
Aaj gaye. -5
Available box. 105

2- Plastic sample triangle
Pichle bache ps 300
Aaj gaye. -50
Available ps. 250

3- Small leather sample
Pichle bache box 12
Aaj gaye. -1
Available box. 11
Driver number +91 9000-000000
@Accounts Employee @~Office Employee
2:14 pm`;
const catalogue = [
  ['LED sample 2x3','pcs',500], ['Short rubber sample','bundle',16], ['Long rubber sample','bundle',28],
  ['Half cue sample 10mm','box',90], ['8" brush sample','box',14], ['Cloth sample (green)','roll',7], ['Carton sample','pcs',380],
  ['Large cue sample 13mm','box',25], ['Plastic sample triangle','pcs',300], ['Small leather sample','box',12]
];
const saleOptions = {year:'2026',type:'sale',salesperson:'Sales Employee',deliveryName:'Delivery Employee'};
const outOptions = {year:'2026',type:'out',purpose:'Office transfer',deliveryName:'Office Employee'};
module.exports = {simple,mixed,office,catalogue,saleOptions,outOptions};
