var i = 0;
var string = '/interface/api/{xxx:zzz}/dist';
var reg = /\{[^\}]+\}/;
var time = 100000000;
var x = new Map();
var y = {};
x.set('eee', 1000);
x.set('dafdsfdsafdsafa', 1000);
y.dafdsfdsafdsafa = 1000;
var t = Date.now();
for (i = 0; i < time; i++) {
  x.get('dafdsfdsafdsafa');
}
console.log(Date.now() - t);
t = Date.now();
for (i = 0; i < time; i++) {
  y.dafdsfdsafdsafa;
}
console.log(Date.now() - t);
console.log(x.keys().next(0).value)