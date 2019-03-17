const Koa = require('koa');
const KOA_ROUTER = require('koa-router')
const Router = require('../');
const fastify = require('fastify')();
const http = require('http');
const compose = require('koa-compose');
const findMyWay = require('find-my-way')();

const app_1 = new Koa();
const app_2 = new Koa();
const route_1 = new Router();
const route_2 = new KOA_ROUTER();
const route_3 = new Router();

const router = route_1.create('/interface/api');
const vrouter = route_3.create('/interface/api');

for (let i = 0; i < 10000; i++) {
  router.get('/uuid/' + (i + 1), async (ctx) => ctx.body = 'ok');
  vrouter.get('/uuid/' + (i + 1), (res) => res.end('ok'));
  route_2.get('/interface/api/uuid/' + (i + 1), async (ctx) => ctx.body = 'ok');
  fastify.get('/interface/api/uuid/' + (i + 1), (request, reply) => reply.send('ok'));
  findMyWay.on('GET', '/interface/api/uuid/' + (i + 1), (req, res, params) => res.end('ok'));
}

router.get('/zzz/{a:number}', async (ctx) => ctx.body = 'ok');
vrouter.get('/zzz/{a:number}', (res) => res.end('ok'));
route_2.get('/interface/api/zzz/:a(\\d+)', async (ctx) => ctx.body = 'ok');
fastify.get('/interface/api/zzz/:a', (request, reply) => reply.send('ok'));
findMyWay.on('GET', '/interface/api/zzz/:a(\\d+)', (req, res, params) => res.end('ok'));

app_1.use(route_1.Koa()).listen(9008, err => {
  if (err) throw err;
  console.log('rapid run at 9008');
});
app_2.use(route_2.routes()).use(route_2.allowedMethods()).listen(9009, err => {
  if (err) throw err;
  console.log('koa run at 9009');
});
fastify.listen(9007, err => {
  if (err) throw err;
  console.log('fastify run at 9007');
});
http.createServer((req, res) => {
  const { middlewares, params } = route_3.find(req.method, req.url);
  req.params = params;
  const fn = compose(middlewares);
  fn(res);
}).listen(9006, err => {
  if (err) throw err;
  console.log('http run at 9006');
});
http.createServer((req, res) => {
  findMyWay.lookup(req, res);
}).listen(9005, err => {
  if (err) throw err;
  console.log('way run at 9005');
});