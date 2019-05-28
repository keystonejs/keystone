/** @jsx jsx */

import { useState, useEffect } from 'react';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import Head from 'next/head';
import { jsx } from '@emotion/core';

import { useAuth } from '../lib/authetication';
import { Container, H1 } from '../primitives';
import { Button, Field, Label, Input } from '../primitives/forms';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { gridSize, colors } from '../theme';
import gql from 'graphql-tag';

export const CREATE_FOGOT_PASSWORD_TOKEN = gql`
  mutation startPasswordRecovery($email: String!) {
    startPasswordRecovery(email: $email) {
      id
    }
  }
`;

export default () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSubmit = startPasswordRecovery => event => {
    event.preventDefault();
    startPasswordRecovery({ variables: { email } });
  };

  // if the user is logged in, redirect to the homepage
  useEffect(() => {
    if (isAuthenticated) {
      Router.push('/');
    }
  }, [isAuthenticated]);

  return (
    <>
      <Head>
        <title>Forgot password</title>
      </Head>
      <Navbar background="white" foreground={colors.greyDark} />
      <Mutation
        mutation={CREATE_FOGOT_PASSWORD_TOKEN}
        onCompleted={() => {
          setEmailSent(true);
        }}
      >
        {(startPasswordRecovery, { error: mutationError, loading }) => {
          return (
            <Container css={{ marginTop: gridSize * 3 }}>
              <H1>Forgot password</H1>
              {mutationError && (
                <p css={{ color: colors.red }}>There is no account with the email {email}</p>
              )}

              <form
                css={{ marginTop: gridSize * 3 }}
                noValidate
                onSubmit={handleSubmit(startPasswordRecovery)}
              >
                <Field>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    required
                    type="text"
                    autoFocus
                    autoComplete="email"
                    placeholder="you@awesome.com"
                    disabled={isAuthenticated}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </Field>
                {loading ? (
                  <Button disabled>Sending email...</Button>
                ) : emailSent ? (
                  <Button disabled css={{ background: colors.greyLight, color: colors.greyMedium }}>
                    Email sent
                  </Button>
                ) : (
                  <Button type="submit">Send recovery email</Button>
                )}
              </form>
            </Container>
          );
        }}
      </Mutation>
      <Footer callToAction={false} />
    </>
  );
};
