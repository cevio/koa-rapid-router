const Koa = require('koa');
const Router = require('..');
const body = require('koa-bodyparser');
// const convert = require('koa-convert');
// 创建服务对象容器
const app = new Koa();
const routerContianer = new Router();
// 生成路由对象
const router = routerContianer.create(/*prefix: default '/'*/);
// 注入中间件
router.use(async (ctx, next) => {
  console.log(ctx.path);
  await next();
});
// 注入路由
router.get('/', async ctx => ctx.body = 'Hello world!');
router.post('/api/x-{uid:number}', log('before'), body(), log('after'), async ctx => {
  console.log('in')
  ctx.body = {
    form: ctx.request.body,
    param: ctx.params
  }
});
// 链接中间件到KOA
app.use(routerContianer.Koa());
// 启动服务
app.listen(3000, err => {
  if (err) throw err;
  console.log('Server run at 3000');
});

function log(str) {
  return async function logAction(ctx, next) {
    console.log(str);
    await next();
  }
}