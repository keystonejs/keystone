import { withApollo } from 'react-apollo';
import { Component } from 'react';
import gql from 'graphql-tag';

import { withAdminMeta } from './AdminMeta';

const userFragment = `
  id
`;

class Session extends Component {
  state = {
    error: null,
    session: {},
    isLoading: true,
    isInitialising: true,
    isSignedIn: false,
    user: null,
  };

  componentDidMount() {
    const { autoSignout } = this.props;
    if (autoSignout) {
      this.signOut();
    } else {
      this.getSession();
    }
  }

  setUserData = user => {
    this.setState({
      isInitialising: false,
      isLoading: false,
      isSignedIn: !!user,
      user,
    });
  };

  getSession = () => {
    // Avoid an extra re-render
    const { isLoading } = this.state;
    if (!isLoading) {
      this.setState({ isLoading: true });
    }

    return this.props.client
      .query({
        query: gql`
          query {
            user: authenticated${this.props.adminMeta.authStrategy.listKey} {
              ${userFragment}
            }
          }
        `,
        fetchPolicy: 'no-cache',
      })
      .then(({ data: { user }, error }) => {
        if (error) {
          throw error;
        }
        this.setUserData(user);
      })
      .catch(error => {
        console.error(error);
        this.setState({ error, isLoading: false });
        throw error;
      });
  };

  signIn = ({ identity, secret }) => {
    this.setState({ error: null, isLoading: true });
    const { listKey, identityField, secretField } = this.props.adminMeta.authStrategy;
    // NOTE: We are not capturing the `token` here on purpose; The GraphQL API
    // will set a `keystone.sid` cookie on its domain, which will be
    // automatically read for each subsequent query.
    return this.props.client
      .mutate({
        mutation: gql`
          mutation signin($identity: String, $secret: String) {
            authenticate: authenticate${listKey}WithPassword(${identityField}: $identity, ${secretField}: $secret) {
              item {
                ${userFragment}
              }
            }
          }
        `,
        fetchPolicy: 'no-cache',
        variables: { identity, secret },
      })
      .then(({ data: { authenticate }, error }) => {
        if (error) {
          throw error;
        }
        // Ensure there's no old unauthenticated data hanging around
        this.props.client.resetStore();
        if (authenticate && authenticate.item) {
          this.setUserData(authenticate.item);
        }
      })
      .catch(error => {
        console.error(error);
        this.setState({ error, isLoading: false });
        throw error;
      });
  };

  signOut = () => {
    this.setState({ error: null, isLoading: true });
    const { listKey } = this.props.adminMeta.authStrategy;
    return this.props.client
      .mutate({
        mutation: gql`
        mutation {
          unauthenticate: unauthenticate${listKey} {
            success
          }
        }
      `,
        fetchPolicy: 'no-cache',
      })
      .then(({ data: { unauthenticate }, error }) => {
        if (error) {
          throw error;
        }
        // Ensure there's no old authenticated data hanging around
        this.props.client.resetStore();
        if (unauthenticate && unauthenticate.success) {
          this.setUserData(null);
        }
      })
      .catch(error => {
        console.error(error);
        this.setState({ error, isLoading: false });
        throw error;
      });
  };

  render() {
    const { signIn, signOut } = this;
    const { children } = this.props;
    const { error, user, isSignedIn, isInitialising, isLoading } = this.state;

    return children({
      error,
      isInitialising,
      isLoading,
      isSignedIn,
      signIn,
      signOut,
      user,
    });
  }
}

export default withAdminMeta(withApollo(Session));
