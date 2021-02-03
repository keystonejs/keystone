export const listTemplate = (listKey: string) =>
  `
import React from 'react';

import { ListPage } from '@keystone-next/admin-ui/pages/ListPage';

export default function List() {
  return <ListPage listKey="${listKey}" />;
}
  `;
