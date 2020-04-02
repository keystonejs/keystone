/**
 * Create  an object out of a {field} array
 * @param {Array} fields
 * @returns {Object} Field object
 */
export const fieldsToMap = fields =>
  fields.reduce((obj, f) => {
    const [key, value] = (f.name || f).split('.');
    obj[key] = obj[key] || [];

    if (value) {
      obj[key].push(value);
    }

    return obj;
  }, {});

/**
 * Create a query body out of a fields array
 * @param {Array} fields
 * @returns {String} Query body
 */
export const buildQueryFragment = fields => {
  const objFields = fieldsToMap(fields);

  const query = Object.entries(objFields)
    .map(([key, value]) => {
      return `${key}${!value.length ? '' : `{${value.join(',')}}`}`;
    })
    .join(',');

  return query;
};
