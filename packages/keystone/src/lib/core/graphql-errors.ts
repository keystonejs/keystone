import { ApolloError } from 'apollo-server-errors';

export const accessDeniedError = () => new ApolloError('You do not have access to this resource');

export const validationFailureError = () =>
  new ApolloError('You attempted to perform an invalid mutation');

// FIXME: In an upcoming PR we will use these args to construct a better
// error message, so leaving the, here for now. - TL
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const limitsExceededError = (args: { type: string; limit: number; list: string }) =>
  new ApolloError('Your request exceeded server limits');
