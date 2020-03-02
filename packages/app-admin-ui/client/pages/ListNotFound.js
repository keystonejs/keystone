import React from 'react';

import PageError from '../components/PageError';
import { Button } from '@arch-ui/button';
import { IssueOpenedIcon } from '@arch-ui/icons';

import { useAdminMeta } from '../providers/AdminMeta';

const ListNotFoundPage = ({ listKey }) => {
  const { adminPath } = useAdminMeta();

  return (
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
  );
};

export default ListNotFoundPage;
