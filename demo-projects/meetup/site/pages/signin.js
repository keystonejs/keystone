import React, { useState, useEffect } from 'react';
import Router from 'next/router';
import { useAuth } from '../lib/authetication';

export default () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const { isAuthenticated, isLoading, signin } = useAuth();

  const handleSubmit = () => {
    event.preventDefault();
    signin({ email, password });
  };

  // if login success - redirect to homepage
  useEffect(() => {
    if (isAuthenticated) {
      Router.push('/');
    }
  });

  return (
    <>
      <p>Sign in to continue to create, collaborate, and discover.</p>

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
          <label htmlFor="password">Passwor</label>
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
        {/* <a href="/forgot">Forgot password?</a> */}
        {isLoading ? (
          <button disabled>Signing in...</button>
        ) : (
          <button type="submit">Sign in</button>
        )}
      </form>
    </>
  );
};
