import type { Keystone } from '@keystone-spike/types';

export const HomePageTemplate = (keystone: Keystone) => {
  // -- TEMPLATE START
  let query = `query {\n`;
  for (const listKey in keystone.adminMeta.lists) {
    query += `${listKey}: ${keystone.adminMeta.lists[listKey].gqlNames.listQueryMetaName} { count }\n`;
  }
  query += '}';
  return `
import React from 'react';

import { HomePage } from '@keystone-spike/admin-ui';
import { gql } from '@keystone-spike/admin-ui/apollo';

export default function Home() {
  return <HomePage query={gql\`${query}\`} />;
}
  `;
  // -- TEMPLATE END
};
