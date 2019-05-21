/** @jsx jsx */

import { useEffect } from 'react';
import Router from 'next/router';
import Head from 'next/head';
import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import { useAuth } from '../lib/authetication';
import { Container } from '../primitives';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const { publicRuntimeConfig } = getConfig();

export default () => {
  const { isAuthenticated, signout } = useAuth();
  const { meetup } = publicRuntimeConfig;

  useEffect(() => {
    if (!isAuthenticated) {
      Router.push('/');
      return;
    }
    signout();
  }, [isAuthenticated]);

  return (
    <>
      <Head>
        <title>Sign out | {meetup.name}</title>
      </Head>
      <Navbar background="white" />
      <Container>
        <p css={{ margin: '100px', textAlign: 'center' }}>Signing you out...</p>
      </Container>
      <Footer callToAction={false} />
    </>
  );
};
