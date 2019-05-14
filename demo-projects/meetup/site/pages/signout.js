/** @jsx jsx */

import { useEffect } from 'react';
import Router from 'next/router';
import { jsx } from '@emotion/core';

import { useAuth } from '../lib/authetication';
import { Container } from '../primitives';

export default () => {
  const { isAuthenticated, signout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      Router.push('/');
      return;
    }
    signout();
  }, [isAuthenticated]);

  return (
    <Container>
      <p css={{ margin: '100px', textAlign: 'center' }}>Signing you out...</p>
    </Container>
  );
};
