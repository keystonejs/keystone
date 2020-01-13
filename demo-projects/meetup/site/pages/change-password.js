/** @jsx jsx */

import { useState, useEffect, Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import Router from 'next/router';
import { jsx } from '@emotion/core';

import { useAuth } from '../lib/authentication';
import { Container, H1, Loading, Error } from '../primitives';
import { Button, Field, Label, Input } from '../primitives/forms';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Meta from '../components/Meta';
import { gridSize, colors } from '../theme';
import gql from 'graphql-tag';

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

export default class ChangePassword extends Component {
  static async getInitialProps(context) {
    const token = context.query.key;
    const accessedAt = new Date().toISOString();
    return { token, accessedAt };
  }

  render() {
    const { token, accessedAt } = this.props;
    return <ChangePasswordForm token={token} accessedAt={accessedAt} />;
  }
}

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

  return (
    <>
      <Meta title="Change password" />
      <Navbar background="white" foreground={colors.greyDark} />
      <Query query={GET_PASSWORD_TOKEN} variables={{ token, accessedAt }}>
        {({ data, loading, error }) => {
          if (loading && !data) {
            return <Loading isCentered size="xlarge" />;
          }
          if (error || !data.passwordTokens || !data.passwordTokens.length) {
            return <Error message="Invalid or expired token" />;
          }

          return (
            <Mutation
              mutation={CHANGE_PASSWORD}
              onCompleted={() => {
                Router.push('/signin');
              }}
            >
              {(startPasswordRecovery, { error: mutationError }) => {
                return (
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
                );
              }}
            </Mutation>
          );
        }}
      </Query>
      <Footer callToAction={false} />
    </>
  );
};
