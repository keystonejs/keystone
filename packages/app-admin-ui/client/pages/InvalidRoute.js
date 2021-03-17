import React from 'react';

import { Button } from '@arch-ui/button';
import PageError from '../components/PageError';

import { useAdminMeta } from '../providers/AdminMeta';

const InvalidRoutePage = () => {
  const { adminPath } = useAdminMeta();

  return (
    <PageError>
      <p>Page Not Found (404)</p>
      <Button to={adminPath}>Go Home</Button>
    </PageError>
  );
};

export default InvalidRoutePage;
