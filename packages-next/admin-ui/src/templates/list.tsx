import type { KeystoneSystem } from '@keystone-next/types';

type ListPageTemplateOptions = {
  list: KeystoneSystem['adminMeta']['lists'][string];
};

export const listTemplate = (system: KeystoneSystem, { list }: ListPageTemplateOptions) => {
  // -- TEMPLATE START
  return `
import React from 'react';

import { ListPage } from '@keystone-next/admin-ui/pages/ListPage';

export default function List() {
  return <ListPage listKey="${list.key}" />;
}
  `;
  // -- TEMPLATE END
};
