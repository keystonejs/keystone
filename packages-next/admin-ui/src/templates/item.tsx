export const itemTemplate = (listKey: string) =>
  `
import React from 'react';

import { ItemPage } from '@keystone-next/admin-ui/pages/ItemPage';

export default function Item() {
  return <ItemPage listKey="${listKey}" />;
}
  `;
