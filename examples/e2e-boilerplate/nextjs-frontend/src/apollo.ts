import { ApolloClient, createHttpLink, InMemoryCache, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const API_URI = process.env.API_URI || 'http://localhost:3000/api/graphql';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  }
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const httpLink = createHttpLink({
  uri: API_URI,
  credentials: 'same-origin',
});

export function createApolloClient() {
  const client = new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
  });

  return client;
}
