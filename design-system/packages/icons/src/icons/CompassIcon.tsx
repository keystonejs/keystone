import * as React from 'react';
import { createIcon } from '../Icon';
export const CompassIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </React.Fragment>,
  'CompassIcon'
);
