import type { KeystoneSystem } from '@keystone-next/types';

type ItemPageTemplateOptions = {
  list: KeystoneSystem['adminMeta']['lists'][string];
};

export const itemTemplate = (keystone: KeystoneSystem, { list }: ItemPageTemplateOptions) => {
  // -- TEMPLATE START
  return `
import React from 'react';

import { ItemPage } from '@keystone-next/admin-ui/pages/ItemPage';

export default function Item() {
  return <ItemPage listKey="${list.key}" />;
}
  `;
  // -- TEMPLATE END
};
