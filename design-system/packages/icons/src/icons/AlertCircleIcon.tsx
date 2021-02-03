import * as React from 'react';
import { createIcon } from '../Icon';
export const AlertCircleIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <line x1={12} y1={8} x2={12} y2={12} />
    <line x1={12} y1={16} x2={12.01} y2={16} />
  </React.Fragment>,
  'AlertCircleIcon'
);
