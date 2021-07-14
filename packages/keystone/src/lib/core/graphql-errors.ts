import { ApolloError } from 'apollo-server-errors';

export const AccessDeniedError = () =>
  new ApolloError('You do not have access to this resource', 'KS_ACCESS_DENIED');

export const ValidationFailureError = (extensions: {
  data: { errors: { msg: string; data: Record<string, any> }[] };
}) =>
  new ApolloError(
    'You attempted to perform an invalid mutation',
    'KS_VALIDATION_FAILURE',
    extensions
  );

export const LimitsExceededError = (data: {
  listKey: string;
  type: 'maxResults' | 'maxTotalResults';
  limit: number;
}) => new ApolloError('Your request exceeded server limits', 'KS_LIMITS_EXCEEDED', { data });

export const NestedError = (msg: string) =>
  new ApolloError(
    'An error occured while performing a mutation on a related item',
    'KS_NESTED_ERROR',
    { msg }
  );

export const MutationError = (errors: any[]) =>
  new ApolloError('One or more errors while attempting to perform mutation', 'KS_MUTATION_ERROR', {
    errors,
  });
