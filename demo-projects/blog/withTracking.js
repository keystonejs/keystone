const { DateTime } = require('@keystone-alpha/fields');

const fields = ['createdAt', 'updatedAt'];

module.exports = (listConfig) => {
  const resultConfig = { ...listConfig };
  fields.forEach(field => {
    if(!resultConfig.fields[field]) {
      resultConfig.fields[field] = {
        type: DateTime,
        format: 'MM/DD/YYYY h:mm A',
        access: {
          read: true,
          create: false,
          update: false,
        },
      };
      resultConfig.hooks = {
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

  return resultConfig;
};
