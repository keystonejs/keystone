import * as React from 'react';
import { createIcon } from '../Icon';
export const ArrowUpIcon = createIcon(
  <React.Fragment>
    <line x1={12} y1={19} x2={12} y2={5} />
    <polyline points="5 12 12 5 19 12" />
  </React.Fragment>,
  'ArrowUpIcon'
);
