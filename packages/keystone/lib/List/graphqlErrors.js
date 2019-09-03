const { createError } = require('apollo-errors');

module.exports = {
  AccessDeniedError: createError('AccessDeniedError', {
    message: 'You do not have access to this resource',
    options: {
      showPath: true,
    },
  }),
  ValidationFailureError: createError('ValidationFailureError', {
    message: 'You attempted to perform an invalid mutation',
    options: {
      showPath: true,
    },
  }),
  LimitsExceededError: createError('LimitsExceededError', {
    message: 'Your request exceeded server limits',
    options: {
      showPath: true,
    },
  }),
};
