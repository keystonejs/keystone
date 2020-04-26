const { composeHook, composeAccess } = require('../utils');

exports.singleton = ({ preventDelete = true }) => ({
  key,
  keystone,
  access,
  hooks = {},
  adminConfig = {},
  ...rest
}) => {
  const newResolveInput = async ({ resolvedData, operation }) => {
    if (operation === 'create') {
      const list = keystone.getListByKey(key);
      const query = `{${list.gqlNames.listQueryMetaName} { count }}`;
      const {
        data: { [list.gqlNames.listQueryMetaName]: listQuery } = {},
        errors,
      } = await keystone.executeQuery(query);
      if (errors) {
        throw errors;
      }
      if (listQuery && listQuery.count && listQuery.count > 0) {
        throw new Error(`ItemLimit reached, This Singleton list can not add more item`);
      }
    }
    return resolvedData;
  };

  let listAccess = access || {};
  if (preventDelete) {
    listAccess = composeAccess(listAccess, { delete: false }, keystone.defaultAccess.list);
  }
  const originalResolveInput = hooks.resolveInput;
  hooks.resolveInput = composeHook(originalResolveInput, newResolveInput);
  return {
    key,
    keystone,
    access: listAccess,
    hooks,
    adminConfig: { ...adminConfig, singleton: true },
    ...rest,
  };
};
