class SessionManager {
  constructor(keystone) {
    this.keystone = keystone;
    this.populateAuthedItemMiddleware = this.populateAuthedItemMiddleware.bind(this);
  }

  async populateAuthedItemMiddleware(req, res, next) {
    if (!req.session || !req.session.keystoneItemId) {
      return next();
    }
    const list = this.keystone.lists[req.session.keystoneListKey];
    if (!list) {
      // TODO: probably destroy the session
      return next();
    }
    const item = await list.adapter.findById(req.session.keystoneItemId);
    if (!item) {
      // TODO: probably destroy the session
      return next();
    }
    req.user = item;
    req.authedListKey = list.key;

    next();
  }

  startAuthedSession(req, { item, list }) {
    return new Promise((resolve, reject) =>
      req.session.regenerate(err => {
        if (err) return reject(err);
        req.session.keystoneListKey = list.key;
        req.session.keystoneItemId = item.id;
        resolve();
      })
    );
  }

  endAuthedSession(req) {
    return new Promise((resolve, reject) =>
      req.session.regenerate(err => {
        if (err) return reject(err);
        resolve({ success: true });
      })
    );
  }
}

module.exports = SessionManager;
