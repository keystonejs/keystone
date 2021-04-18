import {
  createError,
  formatError as _formatError,
  isInstance as isApolloErrorInstance,
} from 'apollo-errors';
import { serializeError } from 'serialize-error';
import StackUtils from 'stack-utils';
import cuid from 'cuid';
import { omit } from '@keystone-next/utils-legacy';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

const stackUtil = new StackUtils({ cwd: process.cwd(), internals: StackUtils.nodeInternals() });

const cleanError = (maybeError: any) => {
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

const safeFormatError = (error: GraphQLError) => {
  const formattedError = _formatError(error, true);
  if (formattedError) {
    return cleanError(formattedError);
  }
  return serializeError(cleanError(error));
};

const duplicateError = (error: any, ignoreKeys: string[] = []) => {
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

const flattenNestedErrors = (error: any) =>
  (error.errors || []).reduce(
    (errors: any[], nestedError: Error) => [
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

export const formatError = (error: GraphQLError) => {
  const { originalError }: { originalError: any } = error;
  if (originalError && !originalError.path) {
    originalError.path = error.path;
  }
  // For correlating user error reports with logs
  // @ts-ignore
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
    // @ts-ignore
    if (error.uid) {
      // @ts-ignore
      formattedError.uid = error.uid;
    }

    return formattedError as GraphQLFormattedError;
  } catch (formatErrorError) {
    // NOTE: We don't log again here as we assume the earlier try/catch
    // correctly logged

    // Return the original error as a fallback so the client gets at
    // least some useful info
    return safeFormatError(error);
  }
};
