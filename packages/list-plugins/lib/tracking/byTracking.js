const { AuthedRelationship } = require('@keystonejs/fields-authed-relationship');
const { composeHook } = require('../utils');

const _byTracking = ({ created = true, updated = true }) => ({
  updatedByField = 'updatedBy',
  createdByField = 'createdBy',
  ...byFieldOptions
} = {}) => ({ fields = {}, hooks = {}, ...rest }) => {
  const relationshipOptions = {
    type: AuthedRelationship,
    ref: 'User',
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

  const newResolveInput = ({ resolvedData, operation, context }) => {
    if (
      // opted-in to updatedBy tracking
      updated &&
      // this is an update
      operation === 'update'
    ) {
      // If not logged in, the id is set to `null`
      const { authedItem: { id = null } = {} } = context;
      resolvedData[updatedByField] = id;
    }

    return resolvedData;
  };
  const originalResolveInput = hooks.resolveInput;
  hooks.resolveInput = composeHook(originalResolveInput, newResolveInput);
  return { fields, hooks, ...rest };
};

const createdBy = options => _byTracking({ created: true, updated: false })(options);
const updatedBy = options => _byTracking({ created: false, updated: true })(options);
const byTracking = options => _byTracking({ created: true, updated: true })(options);

module.exports = { createdBy, updatedBy, byTracking };
