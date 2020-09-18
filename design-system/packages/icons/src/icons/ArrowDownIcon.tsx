import * as React from 'react';
import { createIcon } from '../Icon';
export const ArrowDownIcon = createIcon(
  <React.Fragment>
    <line x1={12} y1={5} x2={12} y2={19} />
    <polyline points="19 12 12 19 5 12" />
  </React.Fragment>,
  'ArrowDownIcon'
);
