/* global KEYSTONE_ADMIN_META */
import ApolloClient from 'apollo-boost';

const { apiPath } = KEYSTONE_ADMIN_META;

export default new ApolloClient({
  uri: apiPath,
});
