import { ApolloError } from 'apollo-server-errors';

export const userInputError = (msg: string) =>
  new ApolloError(`Input error: ${msg}`, 'KS_USER_INPUT_ERROR');

export const accessDeniedError = (msg: string) =>
  new ApolloError(`Access denied: ${msg}`, 'KS_ACCESS_DENIED');

export const prismaError = (err: Error) => {
  if ((err as any).code === undefined) {
    return new ApolloError(`Prisma error`, 'KS_PRISMA_ERROR', {
      debug: {
        message: err.message,
      },
    });
  }
  return new ApolloError(
    `Prisma error: ${err.message.split('\n').slice(-1)[0].trim()}`,
    'KS_PRISMA_ERROR',
    { prisma: { ...err } }
  );
};

export const validationFailureError = (messages: string[]) => {
  const s = messages.map(m => `  - ${m}`).join('\n');
  return new ApolloError(
    `You provided invalid data for this operation.\n${s}`,
    'KS_VALIDATION_FAILURE'
  );
};

export const extensionError = (extension: string, things: { error: Error; tag: string }[]) => {
  const s = things.map(t => `  - ${t.tag}: ${t.error.message}`).join('\n');
  return new ApolloError(
    `An error occured while running "${extension}".\n${s}`,
    'KS_EXTENSION_ERROR',
    // Make the original stack traces available.
    { debug: things.map(t => ({ stacktrace: t.error.stack, message: t.error.message })) }
  );
};

export const resolverError = (things: { error: Error; tag: string }[]) => {
  const s = things.map(t => `  - ${t.tag}: ${t.error.message}`).join('\n');
  return new ApolloError(
    `An error occured while resolving input fields.\n${s}`,
    'KS_RESOLVER_ERROR',
    // Make the original stack traces available.
    { debug: things.map(t => ({ stacktrace: t.error.stack, message: t.error.message })) }
  );
};

export const relationshipError = (things: { error: Error; tag: string }[]) => {
  const s = things.map(t => `  - ${t.tag}: ${t.error.message}`).join('\n');
  return new ApolloError(
    `An error occured while resolving relationship fields.\n${s}`,
    'KS_RELATIONSHIP_ERROR',
    // Make the original stack traces available.
    { debug: things.map(t => ({ stacktrace: t.error.stack, message: t.error.message })) }
  );
};

export const accessReturnError = (things: { tag: string; returned: string }[]) => {
  const s = things.map(t => `  - ${t.tag}: Returned: ${t.returned}. Expected: boolean.`).join('\n');
  return new ApolloError(
    `Invalid values returned from access control function.\n${s}`,
    'KS_ACCESS_RETURN_ERROR'
  );
};

// FIXME: In an upcoming PR we will use these args to construct a better
// error message, so leaving the, here for now. - TL
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const limitsExceededError = (args: { type: string; limit: number; list: string }) =>
  new ApolloError('Your request exceeded server limits', 'KS_LIMITS_EXCEEDED');

export const filterAccessError = ({
  operation,
  fieldKeys,
}: {
  operation: 'filter' | 'orderBy';
  fieldKeys: string[];
}) =>
  new ApolloError(
    `You do not have access to perform '${operation}' operations on the fields ${JSON.stringify(
      fieldKeys
    )}.`,
    'KS_FILTER_DENIED'
  );
