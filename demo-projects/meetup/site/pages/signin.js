/** @jsx jsx */

import { useState, useEffect } from 'react';
import Router from 'next/router';
import { jsx } from '@emotion/core';

import { useAuth } from '../lib/authetication';
import { Container, H2 } from '../primitives';
import { Button, Field, Label, Input } from '../primitives/forms';
import { gridSize } from '../theme';

export default () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const { isAuthenticated, signin } = useAuth();

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
    <Container css={{ marginTop: gridSize * 3 }}>
      <H2>Sign in</H2>

      {errorState && (
        <>
          <p>An error occurred signing you in.</p>
          <p>Please check your email and password then try again.</p>
        </>
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
        {isLoading ? (
          <Button disabled>Signing in...</Button>
        ) : (
          <Button type="submit">Sign in</Button>
        )}
      </form>
    </Container>
  );
};
