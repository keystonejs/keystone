import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import Nav from '../components/Nav';
import { Page } from '@keystone/ui/src/primitives/layout';
import { Title } from '@keystone/ui/src/primitives/typography';

const InvalidRoutePage = () => (
  <Fragment>
    <Nav />
    <Page>
      <Title>404</Title>
      <Link to="/admin">Go Home</Link>
    </Page>
  </Fragment>
);

export default InvalidRoutePage;
