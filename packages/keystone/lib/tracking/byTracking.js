const { Relationship } = require('@keystone-alpha/fields');

const fields = ['createdBy', 'updatedBy'];

module.exports = (listConfig, { chainBeforeChangeHook = true, userList = 'User' } = {}) => {
  const resultConfig = { ...listConfig };
  fields.forEach(field => {
    if (!resultConfig.fields[field]) {
      resultConfig.fields[field] = {
        type: Relationship,
        ref: userList,
        access: {
          read: true,
          create: false,
          update: false,
        },
      };
    }
  });
  const beforeChangeHook = resultConfig.hooks && resultConfig.hooks.beforeChange;
  resultConfig.hooks = resultConfig.hooks || {};
  resultConfig.hooks.beforeChange = async ({
    resolvedData,
    existingItem,
    originalInput,
    context,
    list,
  }) => {
    const { authedItem: { id = null } = {} } = context;
    if (originalInput === 'create') {
      resolvedData[fields[0]] = id;
      resolvedData[fields[1]] = id;
    }
    if (originalInput === 'update') {
      resolvedData[fields[1]] = id;
    }
    if (chainBeforeChangeHook && beforeChangeHook) {
      return await beforeChangeHook({
        resolvedData,
        existingItem,
        originalInput,
        context,
        list,
      });
    }
  };
  return resultConfig;
};
