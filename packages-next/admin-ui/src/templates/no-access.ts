import type { KeystoneConfig } from '@keystone-next/types';

export const noAccessTemplate = (session: KeystoneConfig['session']) => {
  // -- TEMPLATE START
  return `
import React from 'react';

import { NoAccessPage } from '@keystone-next/admin-ui/pages/NoAccessPage';

export default function Home() {
  return <NoAccessPage sessionsEnabled={${!!session}} />;
}
  `;
  // -- TEMPLATE END
};
