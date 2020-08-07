// Derived from https://github.com/zeit/next.js/tree/2789e7e0c25c72fbf6be3ef070e530186af14430/examples/with-apollo
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import createApolloClient from '../apolloClient';

// On the client, we store the Apollo Client in the following variable.
// This prevents the client from reinitializing between page transitions.
let globalApolloClient = null;

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 * @param  {NormalizedCacheObject} initialState
 * @param  {NextPageContext} ctx
 */
const initApolloClient = (initialState, ctx) => {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === 'undefined') {
    return createApolloClient(initialState, ctx);
  }

  // Reuse client on the client-side
  if (!globalApolloClient) {
    globalApolloClient = createApolloClient(initialState, ctx);
  }

  return globalApolloClient;
};

/**
 * Creates a withApollo HOC
 * that provides the apolloContext
 * to a next.js Page or AppTree.
 * @returns {(PageComponent: ReactNode) => ReactNode}
 */
export const withApollo = PageComponent => {
  const WithApollo = ({ apolloClient, apolloState, ...pageProps }) => {
    let client;
    if (apolloClient) {
      // Happens on: getDataFromTree & next.js ssr
      client = apolloClient;
    } else {
      // Happens on: next.js csr
      client = initApolloClient(apolloState, undefined);
    }

    return (
      <ApolloProvider client={client}>
        <PageComponent {...pageProps} />
      </ApolloProvider>
    );
  };

  // Set the correct displayName in development
  if (process.env.NODE_ENV !== 'production') {
    const displayName = PageComponent.displayName || PageComponent.name || 'Component';
    WithApollo.displayName = `withApollo(${displayName})`;
  }

  return WithApollo;
};
