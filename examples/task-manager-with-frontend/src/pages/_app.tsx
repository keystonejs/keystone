import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import type { AppProps } from 'next/app';

const client = new ApolloClient({
  uri: process.env.GRAPHQL_API || 'http://localhost:3001/api/graphql',
  cache: new InMemoryCache(),
  credentials: 'same-origin',
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default MyApp;
