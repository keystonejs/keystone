import React, { createContext, useContext, useState } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks';
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
  name
  isAdmin
`;

const USER_QUERY = gql`
  query {
    authenticatedUser {
      ${userFragment}
    }
  }
`;

const AUTH_MUTATION = gql`
  mutation signin($email: String, $password: String) {
    authenticateUserWithPassword(email: $email, password: $password) {
      item {
        ${userFragment}
      }
    }
  }
`;

const UNAUTH_MUTATION = gql`
  mutation {
    unauthenticateUser {
      success
    }
  }
`;

/**
 * AuthProvider
 * ------------
 * AuthProvider is a component which keeps track of the user's
 * authenticated state and provides methods for managing the auth state.
 */
export const AuthProvider = ({ children, initialUserValue }) => {
  const [user, setUser] = useState(initialUserValue);
  const client = useApolloClient();

  const { loading: userLoading } = useQuery(USER_QUERY, {
    fetchPolicy: 'no-cache',
    onCompleted: ({ authenticatedUser, error }) => {
      if (error) {
        throw error;
      }

      setUser(authenticatedUser);
    },
    onError: console.error,
  });

  const [signin, { loading: authLoading }] = useMutation(AUTH_MUTATION, {
    onCompleted: async ({ authenticateUserWithPassword: { item } = {}, error }) => {
      if (error) {
        throw error;
      }

      // Ensure there's no old unauthenticated data hanging around
      await client.resetStore();

      if (item) {
        setUser(item);
      }
    },
    onError: console.error,
  });

  const [signout, { loading: unauthLoading }] = useMutation(UNAUTH_MUTATION, {
    onCompleted: async ({ unauthenticateUser: { success } = {}, error }) => {
      if (error) {
        throw error;
      }

      // Ensure there's no old authenticated data hanging around
      await client.resetStore();

      if (success) {
        setUser(null);
      }
    },
    onError: console.error,
  });

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading: userLoading || authLoading || unauthLoading,
        signin,
        signout,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
