declare module 'koa-rapid-router' {
  import * as Koa from 'koa';

  interface IKoaRapidRouterOptions {
    cache?: number;
  }

  class SubRouter {
    constructor(server: KoaRapidRouter);
    public prefix(prefix: string): SubRouter;
    public use(...middlewares: Koa.Middleware[]): SubRouter;
  }

  class KoaRapidRouter {
    constructor(options?: IKoaRapidRouterOptions);
    public expression(key: string, value: string): KoaRapidRouter;
    public create(prefix?: string): SubRouter;
    public Koa(): Koa.Middleware;
    public find(method: string, url: string): { middlewares: Koa.Middleware[]; params: object };
  }

  namespace KoaRapidRouter {
    type Router = SubRouter;
  }

  export = KoaRapidRouter;
}
