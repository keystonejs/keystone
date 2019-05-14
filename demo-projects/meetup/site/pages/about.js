/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Container, H2 } from '../primitives';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { colors, gridSize } from '../theme';

export default function About() {
  return (
    <>
      <Navbar background="white" foreground={colors.greyDark} />
      <Container css={{ marginTop: gridSize * 3 }}>
        <H2>About Page</H2>
      </Container>
      <Footer />
    </>
  );
}
