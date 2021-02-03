import { BaseGeneratedListTypes } from '@keystone-next/types';
import { AuthConfig } from '../types';

type InitTemplateArgs = {
  listKey: string;
  initFirstItem: NonNullable<AuthConfig<BaseGeneratedListTypes>['initFirstItem']>;
};

export const initTemplate = ({ listKey, initFirstItem }: InitTemplateArgs) => {
  // -- TEMPLATE START
  return `import { InitPage } from '@keystone-next/auth/pages/InitPage';
  import React from 'react';
  import { gql } from '@keystone-next/admin-ui/apollo';

  const fieldPaths = ${JSON.stringify(initFirstItem.fields)};

  export default function Init() {
    return <InitPage listKey="${listKey}" fieldPaths={fieldPaths} showKeystoneSignup={${JSON.stringify(
    !initFirstItem.skipKeystoneSignup
  )}} />
  }
  `;
  // -- TEMPLATE END
};
