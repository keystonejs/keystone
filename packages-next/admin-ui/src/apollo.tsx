/**
 * This file is exposed by the /apollo entrypoint, and helps ensure that other
 * packages import the same instance of apollo.
 */

// not using export * because Rollup emits CJS code that redefines __esModule which causes problems because __esModule generally isn't a configurable property
export {
  useQuery,
  useMutation,
  useLazyQuery,
  gql,
  ApolloError,
  InMemoryCache,
  ApolloClient,
  ApolloProvider,
} from '@apollo/client';
export type {
  ServerError,
  ServerParseError,
  QueryResult,
  DocumentNode,
  TypedDocumentNode,
} from '@apollo/client';
