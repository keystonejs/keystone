const { DateTime } = require('@keystone-alpha/fields');

const fields = ['createdAt', 'updatedAt'];

module.exports = (listConfig, { chainBeforeChangeHook = true } = {}) => {
  const resultConfig = { ...listConfig };
  fields.forEach(field => {
    if (!resultConfig.fields[field]) {
      resultConfig.fields[field] = {
        type: DateTime,
        format: 'MM/DD/YYYY h:mm A',
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
    if (originalInput === 'create') {
      const createdAt = new Date().toISOString();
      resolvedData[fields[0]] = createdAt;
      resolvedData[fields[1]] = createdAt;
    }
    if (originalInput === 'update') {
      resolvedData[fields[1]] = new Date().toISOString();
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
