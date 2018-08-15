const noop = () => undefined;

const validate = keystone => ({ valid = noop, invalid = noop }) => async (req, res, next) => {
  if (!req.session || !req.session.keystoneItemId) {
    invalid({ req, reason: 'empty' });
    return next();
  }
  const list = keystone.lists[req.session.keystoneListKey];
  if (!list) {
    // TODO: probably destroy the session
    invalid({ req, reason: 'invalid-list' });
    return next();
  }
  const item = await list.adapter.findById(req.session.keystoneItemId);
  if (!item) {
    // TODO: probably destroy the session
    invalid({ req, reason: 'invalid-item' });
    return next();
  }
  valid({ req, list, item });
  next();
};

function create(req, { item, list }) {
  return new Promise((resolve, reject) =>
    req.session.regenerate(err => {
      if (err) return reject(err);
      req.session.keystoneListKey = list.key;
      req.session.keystoneItemId = item.id;
      resolve();
    })
  );
}
function destroy(req) {
  return new Promise((resolve, reject) =>
    req.session.regenerate(err => {
      if (err) return reject(err);
      resolve({ success: true });
    })
  );
}

module.exports = keystone => ({
  create: create,
  destroy: destroy,
  validate: validate(keystone),
});
