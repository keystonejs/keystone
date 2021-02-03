import * as React from 'react';
import { createIcon } from '../Icon';
export const AwardIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={8} r={7} />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </React.Fragment>,
  'AwardIcon'
);
