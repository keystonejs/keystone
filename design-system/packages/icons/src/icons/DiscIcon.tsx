import * as React from 'react';
import { createIcon } from '../Icon';
export const DiscIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <circle cx={12} cy={12} r={3} />
  </React.Fragment>,
  'DiscIcon'
);
