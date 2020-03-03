const { createError } = require('apollo-errors');

const AccessDeniedError = createError('AccessDeniedError', {
  message: 'You do not have access to this resource',
  options: { showPath: true },
});
const ValidationFailureError = createError('ValidationFailureError', {
  message: 'You attempted to perform an invalid mutation',
  options: { showPath: true },
});
const LimitsExceededError = createError('LimitsExceededError', {
  message: 'Your request exceeded server limits',
  options: { showPath: true },
});

const throwAccessDenied = (type, context, target, extraInternalData = {}, extraData = {}) => {
  throw new AccessDeniedError({
    data: { type, target, ...extraData },
    internalData: {
      authedId: context.authedItem && context.authedItem.id,
      authedListKey: context.authedListKey,
      ...extraInternalData,
    },
  });
};

module.exports = {
  AccessDeniedError,
  ValidationFailureError,
  LimitsExceededError,
  throwAccessDenied,
};
