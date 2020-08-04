const { DateTime } = require('@keystonejs/fields');
const { composeHook } = require('../utils');

const _atTracking = ({ created = true, updated = true }) => ({
  updatedAtField = 'updatedAt',
  createdAtField = 'createdAt',
  ...atFieldOptions
} = {}) => ({ fields = {}, hooks = {}, ...rest }) => {
  const dateTimeOptions = {
    type: DateTime,
    format: 'MMMM do, yyyy - h:mm a',
    access: {
      read: true,
      create: false,
      update: false,
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

  const newResolveInput = ({ resolvedData, operation }) => {
    const dateNow = new Date().toISOString();
    if (operation === 'create') {
      // create mode
      if (created) {
        resolvedData[createdAtField] = dateNow;
      }
      if (updated) {
        resolvedData[updatedAtField] = dateNow;
      }
    }
    if (operation === 'update') {
      // update mode

      if (created) {
        delete resolvedData[createdAtField]; // createdAtField No longer sent by api/admin, but access control can be skipped!
      }
      if (updated) {
        resolvedData[updatedAtField] = dateNow;
      }
    }
    return resolvedData;
  };
  const originalResolveInput = hooks.resolveInput;
  hooks.resolveInput = composeHook(originalResolveInput, newResolveInput);
  return { fields, hooks, ...rest };
};

const createdAt = options => _atTracking({ created: true, updated: false })(options);
const updatedAt = options => _atTracking({ created: false, updated: true })(options);
const atTracking = options => _atTracking({ created: true, updated: true })(options);

module.exports = { createdAt, updatedAt, atTracking };
