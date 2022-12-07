import React, { useState, useRef, useEffect } from 'react';
import { gql } from 'graphql-request';
import { client } from '../util/request';

export function Header() {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    getCurrentLoggedInUser()
      .then(data => {
        if (data?.authenticatedItem?.id) {
          setUser(data.authenticatedItem);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = () => {
    if (emailRef.current && passwordRef.current) {
      const email = emailRef.current.value;
      const password = passwordRef.current.value;

      authenticateUser({ email, password }).then(data => {
        if (data?.authenticateUserWithPassword?.item?.id) {
          window.location.reload();
        }
      });
    }
  };

  const logout = () => {
    endUserSession().then(data => {
      window.location.reload();
    });
  };

  if (isLoading) {
    // empty div to prevent layout jump
    return <div style={{ height: '2rem' }} />;
  }

  if (!user) {
    return (
      <div style={{ height: '2rem', display: 'flex', gap: '1em', alignItems: 'flex-end' }}>
        <label>
          email: <input name="email" type="email" ref={emailRef} placeholder="bruce@email.com" />
        </label>
        <label>
          password:{' '}
          <input name="password" type="password" ref={passwordRef} placeholder="passw0rd" />
        </label>
        <button onClick={login}>login</button>
      </div>
    );
  }

  return (
    <div style={{ height: '2rem', display: 'flex', justifyContent: 'space-between' }}>
      <div>Hello, {user.name}!</div>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function authenticateUser({ email, password }: { email: string; password: string }) {
  const mutation = gql`
    mutation authenticate($email: String!, $password: String!) {
      authenticateUserWithPassword(email: $email, password: $password) {
        ... on UserAuthenticationWithPasswordSuccess {
          item {
            id
            name
          }
        }
        ... on UserAuthenticationWithPasswordFailure {
          message
        }
      }
    }
  `;

  // session token is automatically saved to cookie
  return client.request(mutation, {
    email: email,
    password: password,
  });
}

function endUserSession() {
  const mutation = gql`
    mutation endUserSession {
      endSession
    }
  `;

  return client.request(mutation);
}

function getCurrentLoggedInUser() {
  const query = gql`
    query authenticate {
      authenticatedItem {
        __typename
        ... on User {
          id
          name
        }
      }
    }
  `;

  // session token is automatically accessed from cookie
  return client.request(query);
}
