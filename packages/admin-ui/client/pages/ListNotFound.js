import React, { Fragment } from 'react';

import Nav from '../components/Nav';
import PageError from '../components/PageError';
import { Button } from '@voussoir/ui/src/primitives/buttons';
import { IssueOpenedIcon } from '@voussoir/icons';

const ListNotFoundPage = ({ listKey, adminPath }) => (
  <Fragment>
    <Nav>
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
    </Nav>
  </Fragment>
);

export default ListNotFoundPage;
