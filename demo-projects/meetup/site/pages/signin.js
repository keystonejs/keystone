import React, { useState, useEffect } from 'react';
import Router from 'next/router';

import { useAuth } from '../lib/authetication';
import { Container } from '../primitives';

export default () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const { isAuthenticated, isLoading, signin } = useAuth();

  const handleSubmit = () => {
    event.preventDefault();
    signin({ email, password });
  };

  // if login success - redirect to profile
  useEffect(() => {
    if (isAuthenticated) {
      Router.push('/profile');
    }
  });

  return (
    <Container>
      <p>Sign in</p>

      <form noValidate onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            required
            type="text"
            autoComplete="email"
            placeholder="you@awesome.com"
            disabled={isLoading}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            required
            type="password"
            id="password"
            minLength="8"
            placeholder="supersecret"
            autoComplete="new-password"
            disabled={isLoading}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        {isLoading ? (
          <button disabled>Signing in...</button>
        ) : (
          <button type="submit">Sign in</button>
        )}
        <p>
          Don't have an account? <a href="/signup">Join SydJS</a>
        </p>
        <br />
        <a href="/forgot">Forgot password?</a>
      </form>
    </Container>
  );
};
