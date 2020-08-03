// Derived from https://github.com/zeit/next.js/tree/2789e7e0c25c72fbf6be3ef070e530186af14430/examples/with-apollo
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import fetch from 'isomorphic-unfetch';

let isBrowser = typeof window !== 'undefined';

// TODO: server-side requests must have an absolute URI. We should find a way
// to make this part of the project config, seems highly opinionated here
const uriHost = !isBrowser ? 'http://localhost:3000' : '';
const uri = `${uriHost}/admin/api`;

export default function createApolloClient(initialState, ctx) {
  // The `ctx` (NextPageContext) will only be present on the server.
  // use it to extract auth headers (ctx.req) or similar.
  return new ApolloClient({
    ssrMode: Boolean(ctx),
    link: createUploadLink({
      uri,
      credentials: 'same-origin', // Additional fetch() options like `credentials` or `headers`
      fetch,
    }),
    cache: new InMemoryCache().restore(initialState),
  });
}
