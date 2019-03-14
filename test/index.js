const Koa = require('koa');
const KOA_ROUTER = require('koa-router')
const Router = require('../');

const app_1 = new Koa();
const app_2 = new Koa();
const route_1 = new Router();
const route_2 = new KOA_ROUTER();

route_1.expression('xyz', '[a-c]+');

const router = route_1.create('/interface/api');


for (let i = 0; i < 10000; i++) {
  router.get('/uuid/' + (i + 1), async (ctx) => {
    ctx.body = 'ok';
  });
  route_2.get('/interface/api/uuid/' + (i + 1), async (ctx) => {
    ctx.body = 'ok';
  })
}

app_1.use(route_1.Koa()).listen(9008, err => {
  if (err) throw err;
  console.log('app run at 9008');
});
app_2.use(route_2.routes()).use(route_2.allowedMethods()).listen(9009, err => {
  if (err) throw err;
  console.log('app run at 9009');
});