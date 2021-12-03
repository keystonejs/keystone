import React from 'react';
import { NavItem, ListNavItems, NavigationContainer } from '@keystone-6/core/admin-ui/components';
import type { NavigationProps } from '@keystone-6/core/admin-ui/components';

export function CustomNavigation({ lists, authenticatedItem }: NavigationProps) {
  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      <NavItem href="/">Dashboard</NavItem>
      <ListNavItems lists={lists} />
      <NavItem href="/custom-page">Custom Page</NavItem>
    </NavigationContainer>
  );
}
