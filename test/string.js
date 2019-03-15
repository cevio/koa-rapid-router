var t = Date.now();
var i = 0;
var string = '/interface/api/{xxx:zzz}/dist';
var reg = /\{[^\}]+\}/;
var time = 100000000;
for (i = 0; i < time; i++) {
  reg.test(string);
}
console.log(Date.now() - t);
t = Date.now();
for (i = 0; i < time; i++) {
  string.indexOf('{') > -1 && string.indexOf('}') > -1;
}
console.log(Date.now() - t);