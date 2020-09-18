import { ApolloError, DocumentNode, useQuery, ApolloClient } from '../apollo';

export type AuthenticatedItem =
  | { state: 'unauthenticated'; refetch: () => void }
  | { state: 'authenticated'; label: string; id: string; listKey: string; refetch: () => void }
  | { state: 'loading' }
  | { state: 'error'; error: ApolloError; refetch: () => void };

export function useAuthenticatedItem(
  query: DocumentNode,
  client: ApolloClient<any>
): AuthenticatedItem {
  let { data, refetch: _refetch, error } = useQuery(query, { client });
  let refetch = () => {
    _refetch();
  };
  if (error) {
    return {
      state: 'error',
      error,
      refetch,
    };
  }
  if (data) {
    if (
      !data.authenticatedItem ||
      // this is for the case where there is a new type
      // in the AuthenticatedItem union and the query
      // that the admin ui has doesn't get the _label_
      // yes, this is another reason why there should be a ListItem interface or something like that
      // (yes, undefined is very specific and very intentional, it should not be checking for null)
      data.authenticatedItem.id === undefined
    ) {
      console.log(data);
      return {
        state: 'unauthenticated',
        refetch,
      };
    }
    return {
      state: 'authenticated',
      id: data.authenticatedItem.id,
      label: data.authenticatedItem._label_ ?? data.authenticatedItem.id,
      listKey: data.authenticatedItem.__typename,
      refetch,
    };
  }

  return {
    state: 'loading',
  };
}
