import { createError } from 'apollo-errors';

export const ParameterError = createError('ParameterError', {
  message: 'Incorrect paramters supplied',
  options: {
    showPath: true,
  },
});
