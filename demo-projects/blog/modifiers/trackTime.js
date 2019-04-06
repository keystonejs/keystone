const { DateTime } = require('@keystone-alpha/fields');

const fields = ['whenCreated', 'whenUpdated'];

module.exports = (listKey, listConfig) => {
  fields.forEach(field => {
    if(!listConfig.fields[field]) {
      listConfig.fields[field] = {
        type: DateTime,
        format: 'MM/DD/YYYY h:mm A',
        access: {
          read: true,
          create: false,
          update: false,
        },
      };
      const beforeChangeHook = listConfig.hooks && listConfig.hooks.beforeChange;
      listConfig.hooks = {
        beforeChange: async ({
          resolvedData,
          existingItem,
          originalInput,
          context,
          list,
        }) => {
          if(originalInput === 'create') {
            resolvedData[fields[0]] = new Date().toISOString();
          }
          if(originalInput === 'update') {
            resolvedData[fields[1]] = new Date().toISOString();
          }
          if(beforeChangeHook) {
            return await beforeChangeHook({
              resolvedData,
              existingItem,
              originalInput,
              context,
              list,
            });
          }
        },
      };
    }
  });
};
