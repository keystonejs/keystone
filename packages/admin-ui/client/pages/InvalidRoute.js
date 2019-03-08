import React from 'react';
import { Button } from '@arch-ui/button';

import PageError from '../components/PageError';
import { Link } from '../providers/Router';

const InvalidRoutePage = ({ statusCode }) => (
  <PageError>
    <p>{statusCode === 404 ? 'Page Not Found (404)' : 'Internal Server Error'}</p>
    <Link passHref route="index">
      <Button as="a">Go Home</Button>
    </Link>
  </PageError>
);

export default InvalidRoutePage;
