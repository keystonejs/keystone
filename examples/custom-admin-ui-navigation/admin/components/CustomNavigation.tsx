import React from 'react';

import {
  ListNavItems,
  NavigationContainer,
  NavItem,
} from '@keystone-next/keystone/admin-ui/components';

import type { NavigationProps } from '@keystone-next/keystone/admin-ui/components';

export function CustomNavigation({ lists, authenticatedItem }: NavigationProps) {
  console.log(lists);
  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      <NavItem href="/">Dashboard</NavItem>
      <ListNavItems lists={lists} />
      <NavItem href="https://keystonejs.com">Keystone Docs</NavItem>
    </NavigationContainer>
  );
}
