import { createError } from 'apollo-errors';

export const AccessDeniedError = createError('AccessDeniedError', {
  message: 'You do not have access to this resource',
  options: { showPath: true },
});
export const NotFoundError = createError('NotFoundError', {
  message: 'Your requested resource could not be found',
  options: { showPath: true },
});
export const ValidationFailureError = createError('ValidationFailureError', {
  message: 'You attempted to perform an invalid mutation',
  options: { showPath: true },
});
export const LimitsExceededError = createError('LimitsExceededError', {
  message: 'Your request exceeded server limits',
  options: { showPath: true },
});

export const accessDeniedError = (
  type: 'query' | 'mutation',
  target?: string,
  internalData = {},
  extraData = {}
) => {
  return new AccessDeniedError({ data: { type, target, ...extraData }, internalData });
};

export const notFoundError = (
  type: 'query' | 'mutation',
  target?: string,
  internalData = {},
  extraData = {}
) => {
  return new NotFoundError({ data: { type, target, ...extraData }, internalData });
};
