import type { KeystoneSystem } from '@keystone-next/types';

export const homeTemplate = (lists: KeystoneSystem['adminMeta']['lists']) =>
  `
import React from 'react';

import { HomePage } from '@keystone-next/admin-ui/pages/HomePage';
import { gql } from '@keystone-next/admin-ui/apollo';

export default function Home() {
  return <HomePage query={gql\`
    query {
      keystone {
        adminMeta {
          lists {
            key
            fields {
              path
              createView {
                fieldMode
              }
            }
          }
        }
      }
      ${Object.entries(lists)
        .map(([listKey, list]) => `${listKey}: ${list.gqlNames.listQueryMetaName} { count }`)
        .join('\n')}
    }\`} />;
}`;
