import React from 'react';

import { ListNavItems, NavigationContainer } from '@keystone-next/keystone/admin-ui/components';
import type { NavigationProps } from '@keystone-next/keystone/admin-ui/components';

export function CustomNavigation({ routes, authenticatedItem }: NavigationProps) {
  return (
    <NavigationContainer authenticatedItem={authenticatedItem}>
      <ListNavItems routes={routes} />
    </NavigationContainer>
  );
}
