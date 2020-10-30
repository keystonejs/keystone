import type { Keystone } from '@keystone-next/types';

export const noAccessTemplate = (keystone: Keystone) => {
  // -- TEMPLATE START
  return `
import React from 'react';

import { NoAccessPage } from '@keystone-next/admin-ui';

export default function Home() {
  return <NoAccessPage sessionsEnabled={${!!keystone.config.session}} />;
}
  `;
  // -- TEMPLATE END
};
