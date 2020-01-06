import { createError } from 'apollo-errors';

export const ParameterError = createError('ParameterError', {
  message: 'Incorrect parameters supplied',
  options: {
    showPath: true,
  },
});
