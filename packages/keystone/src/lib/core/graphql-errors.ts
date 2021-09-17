import { ApolloError } from 'apollo-server-errors';

export const userInputError = (msg: string) => new ApolloError(`Input error: ${msg}`);

export const accessDeniedError = (msg: string) => new ApolloError(`Access denied: ${msg}`);

export const prismaError = (err: Error) => {
  return new ApolloError(
    `Prisma error: ${err.message.split('\n').slice(-1)[0].trim()}`,
    'INTERNAL_SERVER_ERROR',
    { prisma: { ...err } }
  );
};

export const validationFailureError = (messages: string[]) => {
  const s = messages.map(m => `  - ${m}`).join('\n');
  return new ApolloError(`You provided invalid data for this operation.\n${s}`);
};

export const extensionError = (extension: string, things: { error: Error; tag: string }[]) => {
  const s = things.map(t => `  - ${t.tag}: ${t.error.message}`).join('\n');
  return new ApolloError(
    `An error occured while running "${extension}".\n${s}`,
    'INTERNAL_SERVER_ERROR',
    // Make the original stack traces available.
    { debug: things.map(t => ({ stacktrace: t.error.stack, message: t.error.message })) }
  );
};

// FIXME: In an upcoming PR we will use these args to construct a better
// error message, so leaving the, here for now. - TL
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const limitsExceededError = (args: { type: string; limit: number; list: string }) =>
  new ApolloError('Your request exceeded server limits');

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
    )}.`
  );
