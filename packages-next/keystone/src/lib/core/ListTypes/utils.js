import { humanize, resolveAllKeys, arrayToObject } from '@keystone-next/utils-legacy';

export const keyToLabel = str => {
  let label = humanize(str);

  // Retain the leading underscore for auxiliary lists
  if (str[0] === '_') {
    label = `_${label}`;
  }
  return label;
};

export const labelToPath = str => str.split(' ').join('-').toLowerCase();

export const labelToClass = str => str.replace(/\s+/g, '');

export const opToType = {
  read: 'query',
  create: 'mutation',
  update: 'mutation',
  delete: 'mutation',
};

export const mapToFields = (fields, action) =>
  resolveAllKeys(arrayToObject(fields, 'path', action)).catch(error => {
    if (!error.errors) {
      throw error;
    }
    const errorCopy = new Error(error.message || error.toString());
    errorCopy.errors = Object.values(error.errors);
    throw errorCopy;
  });
