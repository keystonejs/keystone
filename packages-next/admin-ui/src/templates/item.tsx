import type { Keystone } from '@keystone-next/types';

type ItemPageTemplateOptions = {
  list: Keystone['adminMeta']['lists'][string];
};

export const itemTemplate = (keystone: Keystone, { list }: ItemPageTemplateOptions) => {
  // -- TEMPLATE START
  return `
import React from 'react';

import { ItemPage } from '@keystone-next/admin-ui';

export default function Item() {
  return <ItemPage listKey="${list.key}" />;
}
  `;
  // -- TEMPLATE END
};
