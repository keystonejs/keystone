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

  const newResolveInput = ({ resolvedData, operation, originalInput, context }) => {
    // for anonymous mutation, we set the user to null
    const userId = context.authedItem === undefined ? null : context.authedItem.id;
    // if nothing change we keep existing item as well
    if (
      // this is an update
      operation === 'update' &&
      // opted-in to updatedBy tracking
      updated &&
      // is not empty
      Object.keys(originalInput).length !== 0
    ) {
      resolvedData[updatedByField] = userId;
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
