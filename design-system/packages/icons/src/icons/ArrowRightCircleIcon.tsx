import * as React from 'react';
import { createIcon } from '../Icon';
export const ArrowRightCircleIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <polyline points="12 16 16 12 12 8" />
    <line x1={8} y1={12} x2={16} y2={12} />
  </React.Fragment>,
  'ArrowRightCircleIcon'
);
