import { ApolloLink, Observable } from 'apollo-link';
import { createUploadLink } from 'apollo-upload-client';
import { withClientState } from 'apollo-link-state';
import { onError } from 'apollo-link-error';

import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';

// This shouldn't be necessary, but it silences an annoying error from Apollo
// Client: https://github.com/apollographql/apollo-client/issues/3397#issuecomment-421433032
const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    __schema: {
      types: [],
    },
  },
});

const fetch = require('cross-fetch');

// Ejected from apollo-boost v0.1.4:
// https://github.com/apollographql/apollo-client/tree/4e2b2b90b181d9c1927a721de4e26e4ed3c86637/packages/apollo-boost
// (with Typescriptyness removed)
// Then modified to replace apollo-link-http with apollo-upload-client:
// https://github.com/jaydenseric/apollo-upload-client

class BoostClientWithUpload extends ApolloClient {
  constructor(config) {
    const cache =
      config && config.cacheRedirects
        ? new InMemoryCache({ fragmentMatcher, cacheRedirects: config.cacheRedirects })
        : new InMemoryCache({ fragmentMatcher });

    const stateLink =
      config && config.clientState ? withClientState({ ...config.clientState, cache }) : false;

    const errorLink =
      config && config.onError
        ? onError(config.onError)
        : onError(({ graphQLErrors, networkError }) => {
            if (graphQLErrors) {
              graphQLErrors.map(({ message, locations, path }) =>
                console.log(
                  `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
                )
              );
            }
            if (networkError) {
              console.log(`[Network error]: ${networkError}`);
            }
          });

    const requestHandler =
      config && config.request
        ? new ApolloLink(
            (operation, forward) =>
              new Observable(observer => {
                let handle: any;
                Promise.resolve(operation)
                  .then(oper => config.request(oper))
                  .then(() => {
                    handle = forward(operation).subscribe({
                      next: observer.next.bind(observer),
                      error: observer.error.bind(observer),
                      complete: observer.complete.bind(observer),
                    });
                  })
                  .catch(observer.error.bind(observer));

                return () => {
                  if (handle) {
                    return handle.unsubscribe;
                  }
                };
              })
          )
        : false;

    const httpLink = createUploadLink({
      uri: (config && config.uri) || '/graphql',
      fetch, // support mocking `fetch` in Cypress tests. See https://github.com/cypress-io/cypress/issues/687#issuecomment-384953881
      fetchOptions: (config && config.fetchOptions) || {},
      credentials: 'same-origin',
    });

    const link = ApolloLink.from([errorLink, requestHandler, stateLink, httpLink].filter(x => x));

    // super hacky, we will fix the types eventually
    super({ cache, link });
  }
}

export default BoostClientWithUpload;
