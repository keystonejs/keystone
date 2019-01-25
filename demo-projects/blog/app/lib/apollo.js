import { withData } from 'next-apollo';
import { HttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';

// can also be a function that accepts a `context` object (SSR only) and returns a config
const config = {
  link: new HttpLink({ uri: '/admin/api', fetch }),
  onError: e => {
    console.error(e.graphQLErrors);
  },
};

export default withData(config);
