/** @jsx jsx */

import { useEffect } from 'react';
import Router from 'next/router';
import Head from 'next/head';
import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import Signin from '../components/auth/signin';
import { useAuth } from '../lib/authetication';
import { Container, H1 } from '../primitives';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { gridSize } from '../theme';

const { publicRuntimeConfig } = getConfig();

export default () => {
  const { isAuthenticated } = useAuth();
  const { meetup } = publicRuntimeConfig;

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
      <Container width={420} css={{ marginTop: gridSize * 3 }}>
        <H1>Sign in</H1>
        <Signin />
      </Container>
      <Footer callToAction={false} />
    </>
  );
};
