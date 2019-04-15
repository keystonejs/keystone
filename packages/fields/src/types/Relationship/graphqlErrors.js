import { createError } from 'apollo-errors';

module.exports = {
  ParameterError: createError('ParameterError', {
    message: 'Incorrect paramters supplied',
    options: {
      showPath: true,
    },
  }),
};
