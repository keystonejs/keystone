const { Relationship } = require('@keystone-alpha/fields');

const fields = ['createdBy', 'updatedBy'];

module.exports = (listConfig, { chainResolveInputHook = true, userList = 'User' } = {}) => {
  const resultConfig = { ...listConfig };
  fields.forEach(field => {
    if (!resultConfig.fields[field]) {
      resultConfig.fields[field] = {
        type: Relationship,
        ref: userList,
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
    const { authedItem: { id = null } = {} } = context;
    if (existingItem === undefined) {
      // create mode
      resolvedData[fields[0]] = id;
      resolvedData[fields[1]] = id;
    } else {
      // update mode
      delete resolvedData[fields[0]]; // TODO: delete incoming updatedAt field due to no availability of readonly field.
      resolvedData[fields[1]] = id;
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
