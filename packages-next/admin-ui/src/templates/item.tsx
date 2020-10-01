import type { Keystone } from '@keystone-spike/types';

type ItemPageTemplateOptions = {
  list: Keystone['adminMeta']['lists'][string];
};

export const itemTemplate = (keystone: Keystone, { list }: ItemPageTemplateOptions) => {
  // -- TEMPLATE START
  return `
import React from 'react';

import { ItemPage } from '@keystone-spike/admin-ui';

export default function Item() {
  return <ItemPage listKey="${list.key}" />;
}
  `;
  // -- TEMPLATE END
};
