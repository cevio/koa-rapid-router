# Get started

它的编写方式基本和`koa-router`的区别不大。细小的区别在于

- `Koa-router`采用`path-to-regexp`这个库来格式化路由(整体格式化)，而我们使用自己编写的`string-to-regexp`来格式化路由(局部格式化)。
- `koa-rapid-router`通过`router.create`创建子路由，而`koa-router`则使用`new Router()`创建路由。
- `koa-rapid-router`通过`route.Koa()`方法导入中间件，而`koa-router`则使用`route.routes()`和`route.allowedMethods()`导入中间件。

## Install

```bash
$ npm i koa-rapid-router
```

## Usage

```javascript
const Koa = require('koa');
const Router = require('koa-rapid-router')
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
// 链接中间件到KOA
app.use(routerContianer.Koa());
// 启动服务
app.listen(3000, err => {
  if (err) throw err;
  console.log('Server run at 3000');
});
```

请看清楚以上的变量对象，在下面的讲解中，我将直接使用变量来解释。

## Prefix

我们可以设定一些前缀，前缀不一定是静态的，可以是动态的，比如：

```javascript
routerContianer.create('/interface/api');
routerContianer.create('/interface/xyz-{uid:number}-user');
```

## Middlewares

中间件的理念还是与`koa-router`保持一致，也就说明我们可以使用`KOA`的生态。

### RouterContianer Middlwares

使用委托型中间件，这样的话，只要匹配到这个路由前缀，都会自动加载这些中间件

```javascript
RouterContianer.use(async (ctx, next) => {
  // ...
}).use(...);
```

### Router Middlewares

使用普通的中间件

```javascript
router.get(
  '/h_{uid:number}_dist/xxx', 
  async (ctx, next) => await next(),
  async (ctx, next) => await next(),
  // ...
  async ctx => ctx.body = 'Hello world!'
);
```

## Router Path Rule

新的路由规则，你可以像写Typescript一样书写变量。

```javascript
router.get('/interface/api/{name:string}', ...);
router.get('/interface/api/{name:number}', ...);
router.get('/interface/api/{name:any}', ...);
router.get('/interface/api/{name?:string}', ...);
router.get('/interface/api/{name?:number}', ...);
router.get('/interface/api/{name?:any}', ...);
```

> 注意`{xxx:ddd}`大括号里不允许有空格

- `xxx:zzz` 表示`xxx`这个变量必须遵守`zzz`规则。
- `xxx?:zzz` 表示`xxx`这个变量如果存在，则遵守`zzz`规则，否则可以不存在。

> 注意：有一个比较特殊`{xxx?:any}`只能使用一次，而且必须放在末尾，它表示我贪婪匹配后面所有，比如我们的规则是 `/interface/api/x-{abc?:any}`，而我们进入的路由是`/interface/api/x-abda/daf/dsaf/x/dasf`，那么`abc`的值就是`abda/daf/dsaf/x/dasf`。

我们默认的数据类型只有3种：

- **string** `[a-zA-Z0-9]+` 
- **number** `\\d+`
- **any** `.+`

## Add Your Own Data Type

自定义你的数据类型。

```javascript
// 只允许使用 x y z 三个字母组成的字符串
routerContianer.expression('xyz', '[x-z]+');
```

它是由字符串正则组合而成的。

```javascript
router.get('/uuid/{uid:xyz}', async ctx => {
  ctx.body = ctx.params.uid;
});
```
一般来说，我们使用默认的3中就已经足够来。除非你需要非常严格地定义路由。

## Request Methods

请求类型，支持所有node支持的请求类型。一般只用到`get` `post` `put` `delete`。

```javascript
router.get('/interface/api/{name:string}', ...);
router.post('/interface/api/{name:number}', ...);
router.put('/interface/api/{name:any}', ...);
router.delete('/interface/api/{name?:string}', ...);
// ...
```

## Injection

我们可以使用此路由接入其他的架构，比如说，我们接入`http`原生服务。

```javascript
const http = require('http');
http.createServer((req, res) => {
  // middlewares: 路由经过时候的中间件集合，它是一个数组
  // params: 路由变量格式化后的params列表
  const { middlewares, params } = routerContianer.find(req.method, req.url);
  req.params = params;
  // 我们可以通过 middlewares, params 来自由处理逻辑
  // 这里可以发挥想象
}).listen(9006, err => {
  if (err) throw err;
  console.log('http run at 9006');
});
```

我们着重说明下`routerContianer.find`方法，它接受2个参数

- **method** `string` 当前请求的方法类型。必须是大写。
- **pathname** `string` 当前请求的pathname，而不是href，因为我们只对`pathname`进行格式化。

如上代码中的`req.url`其实是错误的，只是我们在测试的时候不会传递`querystring`而勉强正确。

## End

`koa-rapid-router`不仅仅对KOA进行路由，通过Injection可以使用到任何的服务架构中去，我们只要知道当前的`request`就可以处理了。如何灵活使用，各位小伙伴可以发挥自己的想象去造轮子了。在此，非常感谢大家阅读完教程，祝使用愉快！！