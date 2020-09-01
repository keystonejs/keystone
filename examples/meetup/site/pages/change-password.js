/** @jsx jsx */

import { useState, useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import Router from 'next/router';
import { jsx } from '@emotion/core';

import { useAuth } from '../lib/authentication';
import { Container, H1, Loading, Error } from '../primitives';
import { Button, Field, Label, Input } from '../primitives/forms';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Meta from '../components/Meta';
import { gridSize, colors } from '../theme';

const CHANGE_PASSWORD = gql`
  mutation ChangePasswordWithToken($token: String!, $password: String!) {
    changePasswordWithToken(token: $token, password: $password) {
      id
    }
  }
`;

const GET_PASSWORD_TOKEN = gql`
  query allForgottenPasswordTokens($token: String!, $accessedAt: DateTime) {
    passwordTokens: allForgottenPasswordTokens(
      where: { token: $token, expiresAt_gte: $accessedAt }
    ) {
      id
    }
  }
`;

const ChangePassword = ({ token, accessedAt }) => {
  return <ChangePasswordForm token={token} accessedAt={accessedAt} />;
};

ChangePassword.getInitialProps = async context => {
  const token = context.query.key;
  const accessedAt = new Date().toISOString();
  return { token, accessedAt };
};

export default ChangePassword;

const ChangePasswordForm = ({ token, accessedAt }) => {
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [errorState, setErrorState] = useState('');
  const { isAuthenticated } = useAuth();

  const minPasswordLength = 8;

  const handleSubmit = changePasswordWithToken => event => {
    event.preventDefault();
    if (password !== confirmedPassword) {
      setErrorState('Passwords do not match');
    } else if (password.length < minPasswordLength) {
      setErrorState('Passwords must be longer than 8 characters');
    } else {
      setErrorState('');
      changePasswordWithToken({ variables: { token, password } });
    }
  };

  // if the user is logged in, redirect to the homepage
  useEffect(() => {
    if (isAuthenticated) {
      Router.push('/');
    }
  }, [isAuthenticated]);

  const { data, loading, error } = useQuery(GET_PASSWORD_TOKEN, {
    variables: { token, accessedAt },
  });

  const [startPasswordRecovery, { error: mutationError }] = useMutation(CHANGE_PASSWORD, {
    onCompleted: () => {
      Router.push('/signin');
    },
  });

  return (
    <>
      <Meta title="Change password" />
      <Navbar background="white" foreground={colors.greyDark} />
      {loading && !data ? (
        <Loading isCentered size="xlarge" />
      ) : error || !data.passwordTokens || !data.passwordTokens.length ? (
        <Error message="Invalid or expired token" />
      ) : (
        <Container css={{ marginTop: gridSize * 3 }}>
          <H1>Change password</H1>
          {mutationError && <p css={{ color: colors.red }}>Failed to change password</p>}

          <form
            css={{ marginTop: gridSize * 3 }}
            noValidate
            onSubmit={handleSubmit(startPasswordRecovery)}
          >
            <Field>
              <Label htmlFor="password">Password</Label>
              <Input
                required
                type="password"
                id="password"
                minLength={minPasswordLength}
                autoFocus
                autoComplete="password"
                placeholder="supersecret"
                disabled={isAuthenticated}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="confirmedPassword">Confirm password</Label>
              <Input
                required
                type="password"
                id="confirmedPassword"
                minLength={minPasswordLength}
                autoComplete="password"
                placeholder="supersecret"
                disabled={isAuthenticated}
                value={confirmedPassword}
                onChange={e => setConfirmedPassword(e.target.value)}
              />
            </Field>
            {errorState ? <p css={{ color: colors.red }}>{errorState}</p> : null}
            <Button type="submit">Change password</Button>
          </form>
        </Container>
      )}
      <Footer callToAction={false} />
    </>
  );
};
