import { createError } from 'apollo-errors';
import { opToType } from './utils';

export const AccessDeniedError = createError('AccessDeniedError', {
  message: 'You do not have access to this resource',
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

type ValueOf<T> = T[keyof T];
export const throwAccessDenied = (
  type: ValueOf<typeof opToType>,
  target?: string,
  internalData = {},
  extraData = {}
): never => {
  throw new AccessDeniedError({ data: { type, target, ...extraData }, internalData });
};

export const accessDeniedError = (
  type: ValueOf<typeof opToType>,
  target?: string,
  internalData = {},
  extraData = {}
) => {
  return new AccessDeniedError({ data: { type, target, ...extraData }, internalData });
};
