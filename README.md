
# koa-rapid-router

运算最快的路由，支持KOA。

## Install

```bash
npm i koa-rapid-router
```

## Usage

```javascript
const Koa = require('koa');
const Router = require('koa-rapid-router');
const app = new Koa();
const route = new Router();
const router = route.create('/interface/api');
router.get('/uuid/{uid:number}', async (ctx) => {
  ctx.body = ctx.params.uid;
});
app.use(route.Koa()).listen(3000, err => {
  if (err) throw err;
  console.log('app run at 3000');
});
```

## Test

性能大概是`koa-router`的90倍多。有图有真相：

![koa-rapid-router](./assets/1.png)

### Test Step

首先打开一个新的命令行

```bash
npm run dev
```

然后再新建命令行

```bash
npm run test
```

结果一定让人惊讶。