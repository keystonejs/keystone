/** @jsx jsx */

import { useState, useEffect } from 'react';
import Router from 'next/router';
import Head from 'next/head';
import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import { useAuth } from '../lib/authetication';
import { Link } from '../../routes';
import { Container, H1 } from '../primitives';
import { Button, Field, Label, Input } from '../primitives/forms';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { gridSize, colors } from '../theme';

const { publicRuntimeConfig } = getConfig();

export default () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const { isAuthenticated, signin } = useAuth();
  const { meetup } = publicRuntimeConfig;

  const handleSubmit = async event => {
    event.preventDefault();
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
        <title>Sign in | {meetup.name}</title>
      </Head>
      <Navbar background="white" />
      <Container css={{ marginTop: gridSize * 3 }}>
        <H1>Sign in</H1>

        {errorState && (
          <p css={{ color: colors.red }}>Please check your email and password then try again.</p>
        )}

        <form css={{ marginTop: gridSize * 3 }} noValidate onSubmit={handleSubmit}>
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
          <Link route="forgot-password">
            <a
              css={{
                color: 'inherit',
                textDecoration: 'none',
                cursor: 'pointer',
                display: 'block',
                margin: '10px 0',

                ':hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot password
            </a>
          </Link>
          {isLoading ? (
            <Button disabled>Signing in...</Button>
          ) : (
            <Button type="submit">Sign in</Button>
          )}
        </form>
      </Container>
      <Footer callToAction={false} />
    </>
  );
};
