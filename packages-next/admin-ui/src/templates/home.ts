import type { KeystoneSystem } from '@keystone-next/types';

export const homeTemplate = (keystone: KeystoneSystem) => {
  let query = `query {
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
`;
  for (const listKey in keystone.adminMeta.lists) {
    query += `${listKey}: ${keystone.adminMeta.lists[listKey].gqlNames.listQueryMetaName} { count }\n`;
  }
  query += '}';
  // -- TEMPLATE START
  return `
import React from 'react';

import { HomePage } from '@keystone-next/admin-ui/pages/HomePage';
import { gql } from '@keystone-next/admin-ui/apollo';

export default function Home() {
  return <HomePage query={gql\`${query}\`} />;
}
  `;
  // -- TEMPLATE END
};
