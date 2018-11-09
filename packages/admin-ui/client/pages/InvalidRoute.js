import React, { Fragment } from 'react';

import PageError from '../components/PageError';
import { Button } from '@voussoir/ui/src/primitives/buttons';

const InvalidRoutePage = ({ adminPath }) => (
  <PageError>
    <p>Page Not Found (404)</p>
    <Button to={adminPath}>Go Home</Button>
  </PageError>
);

export default InvalidRoutePage;
