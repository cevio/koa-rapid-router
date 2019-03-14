const FIND_CHILDREN = Symbol('Server#find_children');
const FIND = Symbol('Server#find');
const compose = require('koa-compose');
const Router = require('./router');

module.exports = class Server {
  constructor() {
    this.features = {};
    this.vars = {};
    this.expressions = {};
  }

  expression(key, value) {
    this.expressions[key] = value;
    return this;
  }

  create(prefix) {
    const router = new Router(this);
    if (prefix) router.prefix(prefix);
    return router;
  }

  Koa() {
    return async (ctx, next) => {
      const { middlewares, params } = this[FIND](ctx.method, ctx.path) || [];
      ctx.params = params;
      const fn = compose(middlewares);
      await fn(ctx, next);
    }
  }

  [FIND](method, url) {
    const target = this.features[method];
    const middlewares = [...target.__MIDDLEWARES__];
    url = url.replace(/^\//, '').replace(/\/$/, '');
    if (!url) return {
      middlewares: middlewares, 
      params: {}
    };
    const params = {};
    this[FIND_CHILDREN](url, target, middlewares, params);
    return {
      middlewares,
      params
    };
  }

  [FIND_CHILDREN](url, target, middlewares, params) {
    let l = url, r = null;
    const i = url.indexOf('/');
    if (i > -1) {
      l = url.substring(0, i);
      r = url.substring(i + 1);
    }
    if (target[l]) {
      if (!r) return middlewares.push(...target[l].__MIDDLEWARES__);;
      return this[FIND_CHILDREN](r, target[l], middlewares, params);
    } else {
      const REGEXPS = target.__REGEXPS__;
      for (let j = 0; j < REGEXPS.length; j++) {
        const regexp = REGEXPS[j];
        const reg = this.vars[regexp];
        if (!reg) continue;
        if (reg.greedy) {
          if (reg.match(url)) {
            reg.exec(url, (key, value) => params[key] = value);
            if (!r) return middlewares.push(...target[regexp].__MIDDLEWARES__);
          }
        } else {
          if (!reg.match(l)) continue;
          reg.exec(l, (key, value) => params[key] = value);
          if (!r) return middlewares.push(...target[regexp].__MIDDLEWARES__);
          return this[FIND_CHILDREN](r, target[l], middlewares, params);
        }
      }
    }
  }
}