import React, { Component, createContext, useContext } from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

const apiEndpoint = 'http://localhost:3000/admin';

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

  checkSession = async () => {
    if (!this.state.isLoading) {
      this.setState({ isLoading: true });
    }
    const result = await checkSession(this.props.client);
    const { user, isSignedIn } = result;
    this.setState({
      user,
      isSignedIn,
      isLoading: false,
    });
    return result;
  };

  signin = async ({ email, password }) => {
    this.setState({ isLoading: true });
    const result = await signInWithEmail({ email, password });

    if (!result.success) {
      this.setState({ isLoading: false });
      return { success: false };
    }

    return this.checkSession(this.props.client);
  };

  signout = async () => {
    this.setState({ isLoading: true });
    const result = await signout();
    if (result.success) {
      this.setState({
        user: undefined,
        isLoading: false,
      });
      return { success: true };
    } else {
      return { success: false };
    }
  };

  render() {
    const { user, isLoading } = this.state;
    return (
      <AuthContext.Provider
        value={{
          isAuthenticated: !!user,
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

const signInWithEmail = async ({ email, password }) => {
  try {
    const res = await fetch(`${apiEndpoint}/signin`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json; charset=utf-8', Accept: 'application/json' },
      body: JSON.stringify({ username: email, password }),
    }).then(r => r.json());

    if (res.success) {
      return { success: true };
    } else {
      return { success: false, message: res.message };
    }
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false };
  }
};

const signout = async () => {
  try {
    const res = await fetch(`${apiEndpoint}/signout`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    }).then(r => r.json());

    return {
      success: res.success === true,
    };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false };
  }
};

const checkSession = async apolloClient => {
  try {
    const {
      data: { authenticatedUser },
    } = await apolloClient.query({
      query: gql`
        query {
          authenticatedUser {
            id
            name
            isAdmin
          }
        }
      `,
      fetchPolicy: 'network-only',
    });

    if (authenticatedUser) {
      return { success: true, isSignedIn: true, user: authenticatedUser };
    } else {
      return { success: true, isSignedIn: false };
    }
  } catch (error) {
    console.error('Error checking session:', error);
    return { success: false, error: error.message };
  }
};
