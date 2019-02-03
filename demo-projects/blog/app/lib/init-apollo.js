import { ApolloClient, InMemoryCache } from 'apollo-boost';
import { createUploadLink } from 'apollo-upload-client';
import fetch from 'isomorphic-unfetch';

let apolloClient = null;

let isBrowser = typeof window !== 'undefined';

function create(initialState) {
  return new ApolloClient({
    connectToDevTools: isBrowser,
    ssrMode: !isBrowser,
    link: createUploadLink({ uri: '/admin/api', fetch }),
    cache: new InMemoryCache().restore(initialState || {}),
  });
}

export default function initApollo(initialState) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!isBrowser) {
    return create(initialState);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState);
  }

  return apolloClient;
}
