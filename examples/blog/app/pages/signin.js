/** @jsx jsx */
import { jsx } from '@emotion/core';
import Link from 'next/link';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';

import styled from '@emotion/styled';

import Layout from '../templates/layout';
import { Banner } from '../components/banner';
import { withApollo } from '../lib/apollo';

const FormGroup = styled.div({
  display: 'flex',
  marginBottom: 8,
  width: '100%',
  maxWidth: 500,
});

const Label = styled.label({
  width: 200,
});

const Input = styled.input({
  width: '100%',
  padding: 8,
  fontSize: '1em',
  borderRadius: 4,
  border: '1px solid hsl(200,20%,70%)',
});

const AUTHENTICATE = gql`
  mutation authenticate($email: String!, $password: String!) {
    authenticateUserWithPassword(email: $email, password: $password) {
      item {
        id
      }
    }
  }
`;

const AUTHENTICATED_USER = gql`
  query authenticatedUser {
    authenticatedUser {
      id
    }
  }
`;

export default withApollo(() => {
  const [email, setEmail] = useState('user@keystonejs.com');
  const [password, setPassword] = useState('password');

  const { data: { authenticatedUser } = {}, loading, error } = useQuery(AUTHENTICATED_USER);
  const [authenticate, { loading: signingIn, error: signinError }] = useMutation(AUTHENTICATE, {
    refetchQueries: ['authenticatedUser'],
  });

  return (
    <Layout>
      <div css={{ margin: '48px 0' }}>
        <Link href="/" passHref>
          <a css={{ color: 'hsl(200,20%,50%)', cursor: 'pointer' }}>{'< Home'}</a>
        </Link>
        <h1>Sign In</h1>

        {loading || signingIn ? (
          <p>loading...</p>
        ) : error || signinError ? (
          <p>Error!</p>
        ) : authenticatedUser ? (
          <Banner style={'success'}>
            ✅ Signed In
            <br />
            <a href="/" as="/">
              Go home
            </a>{' '}
            |{' '}
            <a href="/post/new" as="/post/new">
              Create new post
            </a>
          </Banner>
        ) : (
          <form
            onSubmit={e => {
              e.preventDefault();
              authenticate({
                variables: {
                  email,
                  password,
                },
              });
            }}
          >
            <FormGroup>
              <Label htmlFor="email">Email:</Label>
              <Input
                type="text"
                name="email"
                value={email}
                onChange={event => {
                  setEmail(event.target.value);
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="password">Password:</Label>
              <Input
                type="password"
                name="password"
                value={password}
                onChange={event => {
                  setPassword(event.target.value);
                }}
              />
            </FormGroup>
            <input type="submit" value="submit" />
          </form>
        )}
      </div>
    </Layout>
  );
});
