import React, { Component, createContext, useContext } from 'react';

const apiEndpoint = 'http://localhost:3000/api';

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
export class AuthProvider extends Component {
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
    const { user } = await checkSession();
    this.setState({
      user: user,
      isLoading: false,
    });
  };

  signin = async ({ email, password }) => {
    this.setState({ isLoading: true });
    const res = await signInWithEmail({ email, password });

    if (!res.success) {
      this.setState({ isLoading: false });
      return res;
    }

    const { authenticated } = await this.checkSession();
    if (authenticated) {
      return { success: true };
    } else {
      // This could be a cookie related error, or some other blocker.
      return { success: false };
    }
  };

  signout = async () => {
    this.setState({ isLoading: true });
    const res = await signout();
    if (res.success) {
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

const signInWithEmail = async ({ email, password }) => {
  try {
    const res = await fetch(`${apiEndpoint}/email/signin`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ email, password }),
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
    }).then(r => r.json());
    return {
      success: res.success === true,
    };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false };
  }
};

const checkSession = async () => {
  try {
    const res = await fetch(`${apiEndpoint}/session`, {
      method: 'GET',
      credentials: 'same-origin',
    }).then(r => r.json());

    console.log(res);

    if (res.isSignedIn) {
      return {
        isSignedIn: true,
        user: res.user,
      };
    } else {
      return { isSignedIn: false };
    }
  } catch (error) {
    console.error('Error checking session:', error);
    return { success: false, error: error.message };
  }
};
