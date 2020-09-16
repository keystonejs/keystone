/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Container, H1 } from '../primitives';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Meta from '../components/Meta';
import { gridSize } from '../theme';
import Signup from '../components/auth/signup';

export default () => {
  return (
    <>
      <Meta title="Join" />
      <Navbar background="white" />
      <Container width={420} css={{ marginTop: gridSize * 3 }}>
        <H1>Join</H1>
        <Signup />
      </Container>
      <Footer callToAction={false} />
    </>
  );
};
