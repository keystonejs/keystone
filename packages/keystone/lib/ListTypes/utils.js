const { humanize, resolveAllKeys, arrayToObject } = require('@keystone-next/utils-legacy');

const preventInvalidUnderscorePrefix = str => str.replace(/^__/, '_');

const keyToLabel = str => {
  let label = humanize(str);

  if (str[0] === '_') {
    label = `_${label}`;
  }
  return label;
};

const labelToPath = str => str.split(' ').join('-').toLowerCase();

const labelToClass = str => str.replace(/\s+/g, '');

const opToType = {
  read: 'query',
  create: 'mutation',
  update: 'mutation',
  delete: 'mutation',
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
  getDefaultLabelResolver,
  mapToFields,
};
