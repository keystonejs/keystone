import React from 'react';

import {
  ListNavItems,
  NavigationContainer,
  NavItem,
} from '@keystone-next/keystone/admin-ui/components';
import type { NavigationProps } from '@keystone-next/keystone/admin-ui/components';

export function CustomNavigation({ routes, authenticatedItem }: NavigationProps) {
  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      <ListNavItems routes={routes} />
      <NavItem href="https://keystonejs.com/guides/custom-navigation-guide">
        Navigation Guide
      </NavItem>
    </NavigationContainer>
  );
}
