const { composeHook, composeAccess } = require('../utils');

exports.singleton = () => (
  { hooks = {}, access = {}, adminConfig = {}, ...rest },
  { listKey, keystone }
) => {
  const newResolveInput = async ({ context, resolvedData, operation }) => {
    if (operation === 'create') {
      const list = keystone.getListByKey(listKey);
      const query = `{${list.gqlNames.listQueryMetaName} { count }}`;
      const {
        data: { [list.gqlNames.listQueryMetaName]: listQuery } = {},
        errors,
      } = await context.executeGraphQL({
        context: context.createContext({ skipAccessControl: true }),
        query,
      });
      if (errors) {
        throw errors;
      }
      if (listQuery && listQuery.count && listQuery.count > 0) {
        throw new Error(`ItemLimit reached, This Singleton list can not add more item`);
      }
    }
    return resolvedData;
  };

  const listAccess = composeAccess(access, { delete: false }, keystone.defaultAccess.list);
  const originalResolveInput = hooks.resolveInput;
  hooks.resolveInput = composeHook(originalResolveInput, newResolveInput);
  return {
    access: listAccess,
    hooks,
    adminConfig: { ...adminConfig, singleton: true },
    ...rest,
  };
};
