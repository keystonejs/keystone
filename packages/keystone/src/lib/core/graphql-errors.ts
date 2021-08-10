import { ApolloError } from 'apollo-server-errors';

export const accessDeniedError = () => new ApolloError('You do not have access to this resource');

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
