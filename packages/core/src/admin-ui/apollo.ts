/**
 * This file is exposed by the /apollo entrypoint, and helps ensure that other
 * packages import the same instance of apollo.
 */

export * from '@apollo/client'
export {
  ApolloProvider,
  createQueryPreloader,
  getApolloContext,
  reactCompilerVersion,
  skipToken,
  useApolloClient,
  useBackgroundQuery,
  useFragment,
  useLazyQuery,
  useMutation,
  useQuery,
  useReactiveVar,
  useSubscription,
  useLoadableQuery,
  useQueryRefHandlers,
  useReadQuery,
  useSuspenseFragment,
  useSuspenseQuery,
} from '@apollo/client/react'
export type {
  ApolloContextValue,
  PreloadQueryFetchPolicy,
  PreloadQueryFunction,
  PreloadQueryOptions,
  PreloadedQueryRef,
  QueryRef,
  SkipToken,
} from '@apollo/client/react'
