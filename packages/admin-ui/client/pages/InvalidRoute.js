import React, { Fragment } from 'react';

import Nav from '../components/Nav';
import PageError from '../components/PageError';
import { Button } from '@voussoir/ui/src/primitives/buttons';

const InvalidRoutePage = ({ adminPath }) => (
  <Fragment>
    <Nav />
    <PageError>
      <p>Page Not Found (404)</p>
      <Button to={adminPath}>Go Home</Button>
    </PageError>
  </Fragment>
);

export default InvalidRoutePage;
