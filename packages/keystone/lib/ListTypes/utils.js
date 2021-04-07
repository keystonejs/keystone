const { upcase, resolveAllKeys, arrayToObject } = require('@keystone-next/utils-legacy');

const preventInvalidUnderscorePrefix = str => str.replace(/^__/, '_');
/** what we actually want is
 * check for the first capital letter
 * if its a succession of capital letters
 * lazily collect all upper case letters till you reach the end
 */

const keyToLabel = str => {
  let label = str
    .replace(/([a-z])([A-Z]+)/g, '$1 $2 ')
    .split(/\s|_|\-/)
    .filter(i => i)
    .reduce((acc, curr) => {
      // check if the array is initially empty
      if (acc.length === 0) {
        // if it is proceed to push in the first item.
        acc.push(curr);
        return acc;
      }

      // if its not
      // pop out the last character
      //

      const lastChar = acc.pop();
      if (lastChar.length === 1 && lastChar === lastChar.toUpperCase()) {
        acc.push(lastChar + curr);
      } else {
        acc.push(lastChar, curr);
      }
      return acc;
    }, [])
    .map(upcase)
    .map(i => {
      if (i === 'Id') {
        return i.toUpperCase();
      }
      return i;
    })
    .join(' ');

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
