const { Relationship } = require('@keystone-alpha/fields');
const { composeResolveInput } = require('../utils');

const _byTracking = ({ created = true, updated = true }) => ({
  updatedByField = 'updatedBy',
  createdByField = 'createdBy',
  ...byFieldOptions
} = {}) => ({ fields = {}, hooks = {}, ...rest }) => {
  const relationshipOptions = {
    type: Relationship,
    ref: 'User',
    access: {
      read: true,
      create: false,
      update: false,
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
  const originalResolveInput = hooks.resolveInput;
  hooks.resolveInput = composeResolveInput(originalResolveInput, newResolveInput);
  return { fields, hooks, ...rest };
};

const createdBy = options => _byTracking({ created: true, updated: false })(options);
const updatedBy = options => _byTracking({ created: false, updated: true })(options);
const byTracking = options => _byTracking({ created: true, updated: true })(options);

module.exports = { createdBy, updatedBy, byTracking };
