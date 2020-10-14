import { GraphQLError } from 'graphql';
import { useMemo } from 'react';
import {
  DocumentNode,
  useQuery,
  ApolloClient,
  QueryResult,
  ServerError,
  ServerParseError,
} from '../apollo';
import { DeepNullable, makeDataGetter } from './dataGetter';

export type AuthenticatedItem =
  | { state: 'unauthenticated' }
  | { state: 'authenticated'; label: string; id: string; listKey: string }
  | { state: 'loading' }
  | { state: 'error'; error: Error | readonly [GraphQLError, ...GraphQLError[]] };

export type VisibleLists =
  | { state: 'loaded'; lists: ReadonlySet<string> }
  | { state: 'loading' }
  | { state: 'error'; error: Error | readonly [GraphQLError, ...GraphQLError[]] };

export function useAuthenticatedItemAndVisibleLists(
  query: DocumentNode,
  client: ApolloClient<any>
): {
  authenticatedItem: AuthenticatedItem;
  refetch: () => void;
  visibleLists: VisibleLists;
} {
  let result = useQuery(query, { client, errorPolicy: 'all' });

  return useMemo(() => {
    let refetch = () => {
      result.refetch();
    };
    let dataGetter = makeDataGetter<
      DeepNullable<{
        authenticatedItem:
          | {
              __typename: string;
              id: string;
              _label_: string;
            }
          | { __typename: string };
        keystone: {
          adminMeta: {
            lists: {
              key: string;
              isHidden: boolean;
            }[];
          };
        };
      }>
    >(result.data, result.error?.graphQLErrors);
    const authenticatedItemGetter = dataGetter.get('authenticatedItem');
    const keystoneMetaGetter = dataGetter.get('keystone');

    return {
      refetch,
      authenticatedItem: getAuthenticatedItem(
        result,
        authenticatedItemGetter.errors || (result.error?.networkError ?? undefined)
      ),
      visibleLists: getVisibleLists(
        result,
        keystoneMetaGetter.errors || (result.error?.networkError ?? undefined)
      ),
    };
  }, [result]);
}

function getVisibleLists(
  { data }: QueryResult,
  error?: Error | ServerParseError | ServerError | readonly [GraphQLError, ...GraphQLError[]]
): VisibleLists {
  if (error) {
    return {
      state: 'error',
      error,
    };
  }
  if (data) {
    const lists = new Set<string>();
    data.keystone.adminMeta.lists.forEach((list: any) => {
      if (!list.isHidden) {
        lists.add(list.key);
      }
    });
    return {
      state: 'loaded',
      lists,
    };
  }

  return {
    state: 'loading',
  };
}

function getAuthenticatedItem(
  { data }: QueryResult,
  error?: Error | ServerParseError | ServerError | readonly [GraphQLError, ...GraphQLError[]]
): AuthenticatedItem {
  if (error) {
    return {
      state: 'error',
      error,
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
      return {
        state: 'unauthenticated',
      };
    }
    return {
      state: 'authenticated',
      id: data.authenticatedItem.id,
      label: data.authenticatedItem._label_ ?? data.authenticatedItem.id,
      listKey: data.authenticatedItem.__typename,
    };
  }

  return {
    state: 'loading',
  };
}
