const express = require('express');

class SchemaRouterApp {
  constructor({ apiPath = '/admin/api', routerFn = () => {}, apps = {} } = {}) {
    this.apiPath = apiPath;
    this.routerFn = routerFn;
    this.apps = apps;
  }

  /**
   * @return Array<middlewares>
   */
  prepareMiddleware({ keystone, dev }) {
    const attachRouterId = express().use(this.apiPath, (req, res, next) => {
      req.routerId = this.routerFn(req, res);
      next();
    });

    const conditionalApps = [
      Object.entries(this.apps).map(([routerId, app]) =>
        conditionalMiddleware({ routerId, middleware: app.prepareMiddleware({ keystone, dev }) })
      ),
    ];

    return [attachRouterId, ...conditionalApps];
  }

  /**
   * @param Options { distDir }
   */
  build() {}
}

const conditionalMiddleware = ({ routerId, middleware }) =>
  express
    .Router()
    .use([
      (req, res, next) => next(req.routerId && req.routerId === routerId ? null : 'router'),
      middleware,
    ]);

module.exports = {
  SchemaRouterApp,
};
