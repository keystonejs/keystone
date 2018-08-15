import React, { Fragment } from 'react';

import Nav from '../components/Nav';
import PageError from '../components/PageError';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { IssueOpenedIcon } from '@keystonejs/icons';

const ListNotFoundPage = ({ listKey, adminPath }) => (
  <Fragment>
    <Nav />
    <PageError Icon={IssueOpenedIcon}>
      <p>
        The list &ldquo;
        {listKey}
        &rdquo; doesn&apos;t exist
      </p>
      <Button to={adminPath} variant="ghost">
        Go Home
      </Button>
    </PageError>
  </Fragment>
);

export default ListNotFoundPage;
