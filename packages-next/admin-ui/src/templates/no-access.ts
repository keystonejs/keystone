import type { KeystoneSystem } from '@keystone-next/types';

export const noAccessTemplate = (system: KeystoneSystem) => {
  // -- TEMPLATE START
  return `
import React from 'react';

import { NoAccessPage } from '@keystone-next/admin-ui/pages/NoAccessPage';

export default function Home() {
  return <NoAccessPage sessionsEnabled={${!!system.config.session}} />;
}
  `;
  // -- TEMPLATE END
};
