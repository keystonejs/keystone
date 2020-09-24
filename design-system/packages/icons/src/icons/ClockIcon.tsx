import * as React from 'react';
import { createIcon } from '../Icon';
export const ClockIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <polyline points="12 6 12 12 16 14" />
  </React.Fragment>,
  'ClockIcon'
);
