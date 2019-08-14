const { DateTime } = require('@keystone-alpha/fields');

const fields = ['createdAt', 'updatedAt'];

module.exports = (listConfig, { chainResolveInputHook = true } = {}) => {
  const resultConfig = { ...listConfig };
  fields.forEach(field => {
    if (!resultConfig.fields[field]) {
      resultConfig.fields[field] = {
        type: DateTime,
        format: 'MM/DD/YYYY h:mm A',
        access: {
          read: true,
          create: true, // TODO: revert to false when read only fields are available
          update: true, // TODO: revert to false when read only fields are available
        },
      };
    }
  });
  const resolveInputHook = resultConfig.hooks && resultConfig.hooks.resolveInput;
  resultConfig.hooks = resultConfig.hooks || {};
  resultConfig.hooks.resolveInput = async ({
    resolvedData,
    existingItem,
    originalInput,
    context,
    list,
  }) => {
    if (Object.keys(originalInput).length === 0) {
      return;
    }
    if (existingItem === undefined) {
      // create mode
      const createdAt = new Date().toISOString();
      resolvedData[fields[0]] = createdAt;
      resolvedData[fields[1]] = createdAt;
    } else {
      // update mode
      delete resolvedData[fields[0]]; // TODO: delete incoming updatedAt field due to no availability of readonly field.
      resolvedData[fields[1]] = new Date().toISOString();
    }
    if (chainResolveInputHook && resolveInputHook) {
      await resolveInputHook({
        resolvedData,
        existingItem,
        originalInput,
        context,
        list,
      });
    }
    return resolvedData;
  };
  return resultConfig;
};
