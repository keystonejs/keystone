const { humanize, resolveAllKeys, arrayToObject } = require('@keystone-next/utils-legacy');

const keyToLabel = str => {
  let label = humanize(str);

  // Retain the leading underscore for auxiliary lists
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

const mapToFields = (fields, action) =>
  resolveAllKeys(arrayToObject(fields, 'path', action)).catch(error => {
    if (!error.errors) {
      throw error;
    }
    const errorCopy = new Error(error.message || error.toString());
    errorCopy.errors = Object.values(error.errors);
    throw errorCopy;
  });

module.exports = { keyToLabel, labelToPath, labelToClass, opToType, mapToFields };
