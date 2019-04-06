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
      listConfig.hooks = {
        beforeChange: async ({
          resolvedData,
          originalInput,
        }) => {
          if(originalInput === 'create') {
            resolvedData[fields[0]] = new Date().toISOString();
          }
          if(originalInput === 'update') {
            resolvedData[fields[1]] = new Date().toISOString();
          }
        },
      };
    }
  });
};
