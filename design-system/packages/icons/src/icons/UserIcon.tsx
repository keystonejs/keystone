import * as React from 'react';
import { createIcon } from '../Icon';
export const UserIcon = createIcon(
  <React.Fragment>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx={12} cy={7} r={4} />
  </React.Fragment>,
  'UserIcon'
);
