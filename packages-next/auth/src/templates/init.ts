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

  const mutation = gql\`mutation($data: CreateInitial${listKey}Input!) {
    createInitial${listKey}(data: $data) {
      ... on UserAuthenticationWithPasswordSuccess {
        item {
          id
        }
      }
    }
  }\`

  export default function Init() {
    return <InitPage fields={fieldsMeta} showKeystoneSignup={${JSON.stringify(
      !initFirstItem.skipKeystoneSignup
    )}} mutation={mutation} />
  }
  `;
  // -- TEMPLATE END
};
