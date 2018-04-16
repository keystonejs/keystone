import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import Nav from '../components/Nav';
import { Container } from '@keystonejs/ui/src/primitives/layout';
import { Title } from '@keystonejs/ui/src/primitives/typography';

const InvalidRoutePage = () => (
  <Fragment>
    <Nav />
    <Container>
      <Title>404</Title>
      <Link to="/admin">Go Home</Link>
    </Container>
  </Fragment>
);

export default InvalidRoutePage;
