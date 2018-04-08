import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import Nav from '../components/Nav';
import { Page } from '../primitives/layout';
import { H1 } from '../primitives/typography';

const InvalidRoute = () => (
  <Fragment>
    <Nav />
    <Page>
      <H1>404</H1>
      <Link to="/admin">Go Home</Link>
    </Page>
  </Fragment>
);

export default InvalidRoute;
