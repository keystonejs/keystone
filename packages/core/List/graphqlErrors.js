const { createError } = require('apollo-errors');

module.exports = {
  AccessDeniedError: createError('AccessDeniedError', {
    message: 'You do not have access to this resource',
    options: {
      showPath: true,
    },
  }),
};
