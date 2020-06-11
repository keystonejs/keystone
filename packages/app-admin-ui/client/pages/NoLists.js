import React from 'react';

import DocTitle from '../components/DocTitle';
import PageError from '../components/PageError';

import { InfoIcon } from '@primer/octicons-react';

const NoListsPage = () => {
  return (
    <PageError icon={InfoIcon}>
      <DocTitle title="Home" />
      <p>
        No lists defined.{' '}
        <a target="_blank" href="https://keystonejs.com/tutorials/add-lists">
          Get started by creating your first list.
        </a>
      </p>
    </PageError>
  );
};

export default NoListsPage;
