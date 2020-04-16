const { createError } = require('apollo-errors');

module.exports = {
  NestedError: createError('NestedError', {
    message: 'Nested errors occurred',
    options: {
      showPath: true,
    },
  }),
};
