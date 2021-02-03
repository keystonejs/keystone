import type { KeystoneConfig } from '@keystone-next/types';

export const noAccessTemplate = (session: KeystoneConfig['session']) =>
  `
import React from 'react';

import { NoAccessPage } from '@keystone-next/admin-ui/pages/NoAccessPage';

export default function Home() {
  return <NoAccessPage sessionsEnabled={${!!session}} />;
}
  `;
