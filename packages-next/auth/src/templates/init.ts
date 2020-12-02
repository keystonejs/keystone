import { BaseGeneratedListTypes, SerializedFieldMeta } from '@keystone-next/types';
import { AuthConfig } from '../types';

type InitTemplateArgs = {
  listKey: string;
  initFirstItem: NonNullable<AuthConfig<BaseGeneratedListTypes>['initFirstItem']>;
  fields: Record<string, SerializedFieldMeta>;
};

export const initTemplate = ({ listKey, initFirstItem, fields }: InitTemplateArgs) => {
  // -- TEMPLATE START
  return `import { InitPage } from '@keystone-next/auth/pages/InitPage';
  import React from 'react';
  import { gql } from '@keystone-next/admin-ui/apollo';

  const fieldsMeta = ${JSON.stringify(fields)}

  export default function Init() {
    return <InitPage listKey="${listKey}" fields={fieldsMeta} showKeystoneSignup={${JSON.stringify(
    !initFirstItem.skipKeystoneSignup
  )}} />
  }
  `;
  // -- TEMPLATE END
};
