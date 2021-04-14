const {
  createError,
  formatError: _formatError,
  isInstance: isApolloErrorInstance,
} = require('apollo-errors');
const { serializeError } = require('serialize-error');
const StackUtils = require('stack-utils');
const cuid = require('cuid');
const { omit } = require('@keystone-next/utils-legacy');

const stackUtil = new StackUtils({ cwd: process.cwd(), internals: StackUtils.nodeInternals() });

const cleanError = maybeError => {
  if (!maybeError.stack) {
    return maybeError;
  }
  maybeError.stack = stackUtil.clean(maybeError.stack);
  return maybeError;
};

const NestedError = createError('NestedError', {
  message: 'Nested errors occurred',
  options: { showPath: true },
});

const safeFormatError = error => {
  const formattedError = _formatError(error, true);
  if (formattedError) {
    return cleanError(formattedError);
  }
  return serializeError(cleanError(error));
};

const duplicateError = (error, ignoreKeys = []) => {
  const newError = new error.constructor(error.message);
  if (error.stack) {
    if (isApolloErrorInstance(error)) {
      newError._stack = error.stack;
    } else {
      newError.stack = error.stack;
    }
  }
  if (error.code) {
    newError.code = error.code;
  }
  return Object.assign(newError, omit(error, ignoreKeys));
};

const flattenNestedErrors = error =>
  (error.errors || []).reduce(
    (errors, nestedError) => [
      ...errors,
      ...[duplicateError(nestedError, ['errors']), ...flattenNestedErrors(nestedError)].map(
        flattenedError => {
          // Ensure the path is complete
          if (Array.isArray(error.path) && Array.isArray(flattenedError.path)) {
            flattenedError.path = [...error.path, ...flattenedError.path];
          }
          return flattenedError;
        }
      ),
    ],
    []
  );

export const formatError = error => {
  const { originalError } = error;
  if (originalError && !originalError.path) {
    originalError.path = error.path;
  }
  // For correlating user error reports with logs
  error.uid = cuid();

  try {
    let formattedError;

    // Support throwing multiple errors
    if (originalError && originalError.errors) {
      // Format (aka; serialize) the error
      const multipleErrorContainer = new NestedError({
        data: { errors: flattenNestedErrors(originalError).map(safeFormatError) },
      });
      formattedError = safeFormatError(multipleErrorContainer);
    } else {
      formattedError = safeFormatError(error);
    }

    if (error.uid) {
      formattedError.uid = error.uid;
    }

    return formattedError;
  } catch (formatErrorError) {
    // NOTE: We don't log again here as we assume the earlier try/catch
    // correctly logged

    // Return the original error as a fallback so the client gets at
    // least some useful info
    return safeFormatError(error);
  }
};
