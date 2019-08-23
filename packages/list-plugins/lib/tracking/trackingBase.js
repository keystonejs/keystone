const { composeResolveInput } = require('../utils');

module.exports = ({
  createdField,
  updatedField,
  fieldConfig,
  createFieldFunc,
  updateFieldFunc,
  ...fieldOptions
} = {}) => ({ fields = {}, hooks = {}, ...rest }) => {
  if (!createdField && !updatedField) {
    throw new Error(
      '[list-plugins] [trackingBase] must provide one of `createdField` or `updatedField'
    );
  }

  const created = !!createdField;
  const updated = !!updatedField;

  if (created) {
    fields[createdField] = {
      access: {
        read: true,
        create: false,
        update: false,
      },
      ...fieldConfig,
      ...fieldOptions,
    };
  }

  if (updated) {
    fields[updatedField] = {
      access: {
        read: true,
        create: false,
        update: false,
      },
      ...fieldConfig,
      ...fieldOptions,
    };
  }

  const newResolveInput = resolveInputParams => {
    const { resolvedData, existingItem, originalInput } = resolveInputParams;
    if (Object.keys(originalInput).length === 0) {
      return resolvedData;
    }
    if (existingItem === undefined) {
      // create mode
      if (created) {
        const createValue = createFieldFunc(resolveInputParams);
        resolvedData[createdField] = createValue;
      }
      if (updated) {
        const updateValue = updateFieldFunc(resolveInputParams);
        resolvedData[updatedField] = updateValue;
      }
    } else {
      // update mode
      if (created) {
        delete resolvedData[createdField]; // createdAtField No longer sent by api/admin, but access control can be skipped!
      }
      if (updated) {
        const updateValue = updateFieldFunc(resolveInputParams);
        resolvedData[updatedField] = updateValue;
      }
    }
    return resolvedData;
  };
  const originalResolveInput = hooks.resolveInput;
  hooks.resolveInput = composeResolveInput(originalResolveInput, newResolveInput);
  return { fields, hooks, ...rest };
};
