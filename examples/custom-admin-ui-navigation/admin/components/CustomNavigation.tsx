import React from 'react';

import {
  ListNavItems,
  ListNavItem,
  NavigationContainer,
  NavItem,
} from '@keystone-next/keystone/admin-ui/components';

import type { NavigationProps } from '@keystone-next/keystone/admin-ui/components';

export function CustomNavigation({ lists, authenticatedItem }: NavigationProps) {
  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      <NavItem href="/">Dashboard</NavItem>
      {/* <ListNavItems lists={lists} include={['Task']} /> */}
      {lists.map(list => (
        <ListNavItem list={list} key={list.key} />
      ))}
      <NavItem href="https://keystonejs.com">Keystone Docs</NavItem>
    </NavigationContainer>
  );
}
