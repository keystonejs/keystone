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

    if (
      // if it's just created - we reset updatedBy field
      operation === 'create' &&
      updated
    ) {
      resolvedData[updatedByField] = null;
    }

    if (
      // if it's updated - we set current user to updatedBy field
      operation === 'update' &&
      updated &&
      // but if nothing is changed we keep existing item as well
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
