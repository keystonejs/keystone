import type { Keystone } from '@keystone-spike/types';

type ListPageTemplateOptions = {
  list: Keystone['adminMeta']['lists'][string];
};

export const listTemplate = (keystone: Keystone, { list }: ListPageTemplateOptions) => {
  // -- TEMPLATE START
  return `
import React from 'react';

import { ListPage } from '@keystone-spike/admin-ui';

export default function List() {
  return <ListPage listKey="${list.key}" />;
}
  `;
  // -- TEMPLATE END
};
