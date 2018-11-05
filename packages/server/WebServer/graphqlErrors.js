const { createError } = require('apollo-errors');

module.exports = {
  NestedError: createError('NestedError', {
    message: 'Nested errors occured',
    options: {
      showPath: true,
    },
  }),
};
