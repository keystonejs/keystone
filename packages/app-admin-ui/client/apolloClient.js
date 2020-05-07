import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createUploadLink } from 'apollo-upload-client';
import { onError } from 'apollo-link-error';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';

import fetch from 'cross-fetch';

// This shouldn't be necessary, but it silences an annoying error from Apollo
// Client: https://github.com/apollographql/apollo-client/issues/3397#issuecomment-421433032
const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    __schema: {
      types: [],
    },
  },
});

export const initApolloClient = ({ uri }) => {
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      );
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
  });

  const httpLink = createUploadLink({
    uri,
    fetch, // support mocking `fetch` in Cypress tests. See https://github.com/cypress-io/cypress/issues/687#issuecomment-384953881
    credentials: 'same-origin',
  });

  return new ApolloClient({
    link: ApolloLink.from([errorLink, httpLink]),
    cache: new InMemoryCache({ fragmentMatcher }),
  });
};
