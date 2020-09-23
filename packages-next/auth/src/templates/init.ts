import { BaseGeneratedListTypes, SerializedFieldMeta } from '@keystone-spike/types';
import { AuthConfig } from '../types';

type InitTemplateArgs = {
  config: AuthConfig<BaseGeneratedListTypes>;
  fields: Record<string, SerializedFieldMeta>;
};

export const initTemplate = ({ config, fields }: InitTemplateArgs) => {
  if (!config.initFirstItem) return '';

  // -- TEMPLATE START
  return `import { InitPage } from '@keystone-spike/auth/pages/InitPage';
  import React from 'react';
  import { gql } from '@keystone-spike/admin-ui/apollo';

  const fieldsMeta = ${JSON.stringify(fields)}

  const mutation = gql\`mutation($data: CreateInitial${config.listKey}Input!) {
    createInitial${config.listKey}(data: $data) {
      ... on UserAuthenticationWithPasswordSuccess {
        item {
          id
        }
      }
    }
  }\`

  export default function Init() {
    return <InitPage fields={fieldsMeta} showKeystoneSignup={${JSON.stringify(
      !config.initFirstItem.skipKeystoneSignup
    )}} mutation={mutation} />
  }
  `;
  // -- TEMPLATE END
};
