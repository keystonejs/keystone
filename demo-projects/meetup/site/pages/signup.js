/** @jsx jsx */

import { useState, useEffect } from 'react';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import Head from 'next/head';
import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import { useAuth } from '../lib/authetication';
import { Container, H1 } from '../primitives';
import { Button, Field, Label, Input } from '../primitives/forms';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { gridSize, colors } from '../theme';
import { CREATE_USER } from '../graphql/users';

const { publicRuntimeConfig } = getConfig();

export default () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const { isAuthenticated, signin } = useAuth();
  const { meetup } = publicRuntimeConfig;

  const handleSubmit = createUser => event => {
    event.preventDefault();
    createUser({ variables: { name, email, password } });
  };

  const handleSignin = async () => {
    setIsLoading(true);
    const result = await signin({ email, password });
    setIsLoading(false);
    if (!result.success) {
      setErrorState(true);
    } else {
      setErrorState(false);
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
      <Head>
        <title>Join | {meetup.name}</title>
      </Head>
      <Navbar background="white" foreground={colors.greyDark} />
      <Mutation
        mutation={CREATE_USER}
        onCompleted={() => {
          handleSignin();
        }}
      >
        {(createUser, { error: mutationError }) => {
          return (
            <Container css={{ marginTop: gridSize * 3 }}>
              <H1>Join</H1>
              {mutationError && (
                <p css={{ color: colors.red }}>The email provided is already in use.</p>
              )}
              {errorState && <p css={{ color: colors.red }}>An unknown error has occured</p>}

              <form
                css={{ marginTop: gridSize * 3 }}
                noValidate
                onSubmit={handleSubmit(createUser)}
              >
                <Field>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    required
                    type="text"
                    autoFocus
                    autoComplete="name"
                    placeholder="full name"
                    disabled={isLoading || isAuthenticated}
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </Field>
                <Field>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    required
                    type="text"
                    autoFocus
                    autoComplete="email"
                    placeholder="you@awesome.com"
                    disabled={isLoading || isAuthenticated}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </Field>
                <Field>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    required
                    type="password"
                    id="password"
                    minLength="8"
                    placeholder="supersecret"
                    autoComplete="password"
                    disabled={isLoading || isAuthenticated}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </Field>
                {isLoading ? (
                  <Button disabled>Creating account...</Button>
                ) : (
                  <Button type="submit">Sign up</Button>
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
