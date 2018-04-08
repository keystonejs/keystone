import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import Nav from '../components/Nav';
import { Page } from '../primitives/layout';
import { H1 } from '../primitives/typography';

const ListNotFound = ({ listKey }) => (
  <Fragment>
    <Nav />
    <Page>
      <H1>Invalid List.</H1>
      <p>The list {listKey} hasn't been defined.</p>
      <Link to="/admin">Go Home</Link>
    </Page>
  </Fragment>
);

export default ListNotFound;
