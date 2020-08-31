/** @jsx jsx */

import { useEffect } from 'react';
import Router from 'next/router';
import { jsx } from '@emotion/core';

import Signin from '../components/auth/signin';
import { useAuth } from '../lib/authentication';
import { Container, H1 } from '../primitives';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Meta from '../components/Meta';
import { gridSize } from '../theme';

export default () => {
  const { isAuthenticated } = useAuth();

  // if the user is logged in, redirect to the homepage
  useEffect(() => {
    if (isAuthenticated) {
      Router.push('/');
    }
  }, [isAuthenticated]);

  return (
    <>
      <Meta title="Sign in" />
      <Navbar background="white" />
      <Container width={420} css={{ marginTop: gridSize * 3 }}>
        <H1>Sign in</H1>
        <Signin />
      </Container>
      <Footer callToAction={false} />
    </>
  );
};
