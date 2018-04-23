import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import Nav from '../components/Nav';
import { Container } from '@keystonejs/ui/src/primitives/layout';
import { Title } from '@keystonejs/ui/src/primitives/typography';

const ListNotFoundPage = ({ listKey, adminPath }) => (
  <Fragment>
    <Nav />
    <Container>
      <Title>Invalid List.</Title>
      <p>The list {listKey} hasn't been defined.</p>
      <Link to={adminPath}>Go Home</Link>
    </Container>
  </Fragment>
);

export default ListNotFoundPage;
