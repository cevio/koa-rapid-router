const FIND_CHILDREN = Symbol('Server#find_children');
const FIND_MIDDLEWARES = Symbol('Server#find_middlewares');
const LRU = Symbol('Server#lru');
const compose = require('koa-compose');
const Router = require('./router');

module.exports = class Server {
  constructor(options = {}) {
    this.features = {};
    this.vars = {};
    this.statics = {};
    this.expressions = {};
    this.callbacks = {};
    this.cache = options.cache || 0;
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
      const { middlewares, params } = this.find(ctx.method, ctx.path) || [];
      ctx.params = params;
      const fn = compose(middlewares);
      await fn(ctx, next);
    }
  }

  find(method, url) {
    if (this.statics[method] && this.statics[method][url]) {
      return {
        middlewares: this[FIND_MIDDLEWARES](this.statics[method][url]),
        params: {}
      }
    }
    const target = this.features[method];
    if (!target) return {
      middlewares: [], 
      params: {}
    }
    url = url.replace(/^\//, '').replace(/\/$/, '');
    if (!url) return {
      middlewares: this[FIND_MIDDLEWARES](target.__MIDDLEWARES__), 
      params: {}
    };
    const params = {};
    const middlewares = target.__MIDDLEWARES__.slice();
    this[FIND_CHILDREN](url, target, middlewares, params);
    return {
      middlewares:  this[FIND_MIDDLEWARES](middlewares),
      params
    };
  }

  [FIND_MIDDLEWARES](middlewares) {
    return middlewares.map(middleware => this.callbacks[middleware]);
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
      if (this.cache) {
        const cache_url = target.__CACHES__.has(url) ? url : (target.__CACHES__.has(l) ? l : null);
        if (cache_url) {
          const item = target.__CACHES__.get(cache_url);
          Object.assign(params, item.params);
          return middlewares.push(...item.middlewares);
        }
      }
      const REGEXPS = target.__REGEXPS__;
      for (let j = 0; j < REGEXPS.length; j++) {
        const regexp = REGEXPS[j];
        const reg = this.vars[regexp];
        if (!reg) continue;
        if (reg.greedy) {
          if (reg.match(url)) {
            const _params = reg.exec(url, (key, value) => params[key] = value);
            if (!r) {
              const _middlewares = target[regexp].__MIDDLEWARES__;
              if (this.cache) {
                target.__CACHES__.set(url, {
                  middlewares: _middlewares,
                  params: _params
                });
                this[LRU](target);
              }
              return middlewares.push(..._middlewares);
            }
          }
        } else {
          if (!reg.match(l)) continue;
          const _params = reg.exec(l, (key, value) => params[key] = value);
          if (!r) {
            const _middlewares = target[regexp].__MIDDLEWARES__;
            if (this.cache) {
              target.__CACHES__.set(l, {
                middlewares: _middlewares,
                params: _params
              });
              this[LRU](target);
            }
            return middlewares.push(..._middlewares);
          }
          return this[FIND_CHILDREN](r, target[l], middlewares, params);
        }
      }
    }
  }

  [LRU](target) {
    if (target.__CACHES__.size > this.cache) {
      target.__CACHES__.delete(target.__CACHES__.keys().next(0).value);
    }
  }
}