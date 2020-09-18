import * as React from 'react';
import { createIcon } from '../Icon';
export const ArrowUpCircleIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <polyline points="16 12 12 8 8 12" />
    <line x1={12} y1={16} x2={12} y2={8} />
  </React.Fragment>,
  'ArrowUpCircleIcon'
);
