const { Relationship } = require('@keystone-alpha/fields');

const composeResolveInput = (originalHook, newHook) => async params => {
  const resolvedData = await originalHook(params);
  return newHook({ ...params, resolvedData });
};

const _byTracking = ({ created = true, updated = true }) => ({
  updatedByField = 'updatedBy',
  createdByField = 'createdBy',
  trackingListName = 'User',
  ...byFieldOptions
} = {}) => ({ fields = {}, hooks = {}, ...rest }) => {
  const relationshipOptions = {
    type: Relationship,
    ref: trackingListName,
    access: {
      read: true,
      create: true, // TODO: revert to false when read only fields are available
      update: true, // TODO: revert to false when read only fields are available
    },
    ...byFieldOptions,
  };

  if (updated) {
    fields[updatedByField] = {
      ...relationshipOptions,
    };
  }

  if (created) {
    fields[createdByField] = {
      ...relationshipOptions,
    };
  }

  const originalResolveInput = hooks.resolveInput || (({ resolvedData }) => resolvedData); // possible to have no hooks provided
  const newResolveInput = ({ resolvedData, existingItem, originalInput, context }) => {
    if (Object.keys(originalInput).length === 0) {
      return resolvedData;
    }
    const { authedItem: { id = null } = {} } = context;
    if (existingItem === undefined) {
      // create mode
      if (created) {
        resolvedData[createdByField] = id;
      }
      if (updated) {
        resolvedData[updatedByField] = id;
      }
    } else {
      // update mode
      if (created) {
        delete resolvedData[createdByField]; // This is a bug?, data for createdAtField should not be sent
      }
      if (updated) {
        resolvedData[updatedByField] = id;
      }
    }
    return resolvedData;
  };
  hooks.resolveInput = composeResolveInput(originalResolveInput, newResolveInput);
  return { fields, hooks, ...rest };
};

const createdBy = options => _byTracking({ created: true, updated: false })(options);
const updatedBy = options => _byTracking({ created: false, updated: true })(options);
const byTracking = options => _byTracking({ created: true, updated: true })(options);

module.exports = { createdBy, updatedBy, byTracking };
