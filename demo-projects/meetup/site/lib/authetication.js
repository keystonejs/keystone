import React, { Component, createContext, useContext } from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

/**
 * AuthContext
 * -----------
 * This is the base react context instance. It should not be used
 * directly but is exported here to simplify testing.
 */
export const AuthContext = createContext();

/**
 * useAuth
 * -------
 * A hook which provides access to the AuthContext
 */
export const useAuth = () => useContext(AuthContext);

const userFragment = `
  id
`;

/**
 * AuthProvider
 * ------------
 * AuthProvider is a component which keeps track of the user's
 * authenticated state and provides methods for managing the auth state.
 */
class AuthProviderClass extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: props.initialUserValue,
      isLoading: true,
    };
  }

  componentDidMount() {
    this.checkSession();
  }

  setUserData = user => {
    this.setState({
      isInitialising: false,
      isLoading: false,
      isAuthenticated: !!user,
      user,
    });
  };

  checkSession = async () => {
    // Avoid an extra re-render
    const { isLoading } = this.state;
    if (!isLoading) {
      this.setState({ isLoading: true });
    }

    return this.props.client
      .query({
        query: gql`
          query {
            authenticatedUser {
              ${userFragment}
            }
          }
        `,
        fetchPolicy: 'no-cache',
      })
      .then(({ data: { authenticatedUser }, error }) => {
        if (error) {
          throw error;
        }
        this.setUserData(authenticatedUser);
      })
      .catch(error => {
        console.error(error);
        this.setState({ error, isLoading: false });
        throw error;
      });
  };

  signin = async ({ email, password }) => {
    this.setState({ error: null, isLoading: true });
    // NOTE: We are not capturing the `token` here on purpose; The GraphQL API
    // will set a `keystone.sid` cookie on its domain, which will be
    // automatically read for each subsequent query.
    return this.props.client
      .mutate({
        mutation: gql`
          mutation signin($email: String, $password: String) {
            authenticateUserWithPassword(email: $email, password: $password) {
              item {
                ${userFragment}
              }
            }
          }
        `,
        fetchPolicy: 'no-cache',
        variables: { email, password },
      })
      .then(async ({ data: { authenticateUserWithPassword }, error }) => {
        if (error) {
          throw error;
        }
        // Ensure there's no old unauthenticated data hanging around
        await this.props.client.resetStore();
        if (authenticateUserWithPassword && authenticateUserWithPassword.item) {
          this.setUserData(authenticateUserWithPassword.item);
        }
      })
      .catch(error => {
        console.error(error);
        this.setState({ error, isLoading: false });
        throw error;
      });
  };

  signout = async () => {
    this.setState({ error: null, isLoading: true });
    return this.props.client
      .mutate({
        mutation: gql`
          mutation {
            unauthenticateUser {
              success
            }
          }
        `,
        fetchPolicy: 'no-cache',
      })
      .then(async ({ data: { unauthenticateUser }, error }) => {
        if (error) {
          throw error;
        }
        // Ensure there's no old authenticated data hanging around
        await this.props.client.resetStore();
        if (unauthenticateUser && unauthenticateUser.success) {
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
    const { user, isLoading, isAuthenticated } = this.state;
    return (
      <AuthContext.Provider
        value={{
          isAuthenticated,
          isLoading,
          signin: this.signin,
          signout: this.signout,
          user,
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

export const AuthProvider = withApollo(AuthProviderClass);
