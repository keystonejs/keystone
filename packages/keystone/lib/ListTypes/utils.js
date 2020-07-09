const { upcase, resolveAllKeys, arrayToObject } = require('@keystonejs/utils');
const { logger } = require('@keystonejs/logger');

const keystoneLogger = logger('keystone');

const preventInvalidUnderscorePrefix = str => str.replace(/^__/, '_');

const keyToLabel = str => {
  let label = str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/\s|_|\-/)
    .filter(i => i)
    .map(upcase)
    .join(' ');

  // Retain the leading underscore for auxiliary lists
  if (str[0] === '_') {
    label = `_${label}`;
  }
  return label;
};

const labelToPath = str =>
  str
    .split(' ')
    .join('-')
    .toLowerCase();

const labelToClass = str => str.replace(/\s+/g, '');

const opToType = {
  read: 'query',
  create: 'mutation',
  update: 'mutation',
  delete: 'mutation',
};

const mapNativeTypeToKeystoneType = (type, listKey, fieldPath) => {
  const { Text, Checkbox, Float } = require('@keystonejs/fields');

  const nativeTypeMap = new Map([
    [
      Boolean,
      {
        name: 'Boolean',
        keystoneType: Checkbox,
      },
    ],
    [
      String,
      {
        name: 'String',
        keystoneType: Text,
      },
    ],
    [
      Number,
      {
        name: 'Number',
        keystoneType: Float,
      },
    ],
  ]);

  if (!nativeTypeMap.has(type)) {
    return type;
  }

  const { name, keystoneType } = nativeTypeMap.get(type);

  keystoneLogger.warn(
    { nativeType: type, keystoneType, listKey, fieldPath },
    `Mapped field ${listKey}.${fieldPath} from native JavaScript type '${name}', to '${keystoneType.type.type}' from the @keystonejs/fields package.`
  );

  return keystoneType;
};

const getDefaultLabelResolver = labelField => item => {
  const value = item[labelField || 'name'];
  if (typeof value === 'number') {
    return value.toString();
  }
  return value || item.id;
};

const mapToFields = (fields, action) =>
  resolveAllKeys(arrayToObject(fields, 'path', action)).catch(error => {
    if (!error.errors) {
      throw error;
    }
    const errorCopy = new Error(error.message || error.toString());
    errorCopy.errors = Object.values(error.errors);
    throw errorCopy;
  });

module.exports = {
  preventInvalidUnderscorePrefix,
  keyToLabel,
  labelToPath,
  labelToClass,
  opToType,
  mapNativeTypeToKeystoneType,
  getDefaultLabelResolver,
  mapToFields,
};
