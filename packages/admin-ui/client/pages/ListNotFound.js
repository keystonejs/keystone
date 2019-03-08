import React from 'react';

import PageError from '../components/PageError';
import { Button } from '@arch-ui/button';
import { IssueOpenedIcon } from '@arch-ui/icons';
import { Link } from '../providers/Router';

const ListNotFoundPage = ({ listKey }) => (
  <PageError Icon={IssueOpenedIcon}>
    <p>
      The list &ldquo;
      {listKey}
      &rdquo; doesn&apos;t exist
    </p>
    <Link passHref route="index">
      <Button as="a" variant="ghost">
        Go Home
      </Button>
    </Link>
  </PageError>
);

export default ListNotFoundPage;
