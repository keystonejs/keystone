/** @jsx jsx */

import Head from 'next/head';
import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import { Container, H1 } from '../primitives';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { gridSize } from '../theme';
import Signup from '../components/auth/signup';

const { publicRuntimeConfig } = getConfig();

export default () => {
  const { meetup } = publicRuntimeConfig;

  return (
    <>
      <Head>
        <title>Join | {meetup.name}</title>
      </Head>
      <Navbar background="white" />
      <Container width={420} css={{ marginTop: gridSize * 3 }}>
        <H1>Join</H1>
        <Signup />
      </Container>
      <Footer callToAction={false} />
    </>
  );
};
