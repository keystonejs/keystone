const { DateTime } = require('@keystone-alpha/fields');

const composeResolveInput = (originalHook, newHook) => async params => {
  const resolvedData = await originalHook(params);
  return newHook({ ...params, resolvedData });
};

const _atTracking = ({ created = true, updated = true }) => ({
  updatedAtField = 'updatedAt',
  createdAtField = 'createdAt',
  ...atFieldOptions
} = {}) => ({ fields = {}, hooks = {}, ...rest }) => {
  const dateTimeOptions = {
    type: DateTime,
    format: 'MM/DD/YYYY h:mm A',
    access: {
      read: true,
      create: true, // TODO: revert to false when read only fields are available
      update: true, // TODO: revert to false when read only fields are available
    },
    ...atFieldOptions,
  };

  if (updated) {
    fields[updatedAtField] = {
      ...dateTimeOptions,
    };
  }

  if (created) {
    fields[createdAtField] = {
      ...dateTimeOptions,
    };
  }

  const originalResolveInput = hooks.resolveInput || (({ resolvedData }) => resolvedData); // possible to have no hooks provided
  const newResolveInput = ({ resolvedData, existingItem, originalInput }) => {
    if (Object.keys(originalInput).length === 0) {
      return resolvedData;
    }
    const dateNow = new Date().toISOString();
    if (existingItem === undefined) {
      // create mode
      if (created) {
        resolvedData[createdAtField] = dateNow;
      }
      if (updated) {
        resolvedData[updatedAtField] = dateNow;
      }
    } else {
      // update mode
      if (created) {
        delete resolvedData[createdAtField]; // This is a bug?, data for createdAtField should not be sent
      }
      if (updated) {
        resolvedData[updatedAtField] = dateNow;
      }
    }
    return resolvedData;
  };
  hooks.resolveInput = composeResolveInput(originalResolveInput, newResolveInput);
  console.log({ fields, hooks, ...rest });
  return { fields, hooks, ...rest };
};

const createdAt = options => _atTracking({ created: true, updated: false })(options);
const updatedAt = options => _atTracking({ created: false, updated: true })(options);
const atTracking = options => _atTracking({ created: true, updated: true })(options);

module.exports = { createdAt, updatedAt, atTracking };
