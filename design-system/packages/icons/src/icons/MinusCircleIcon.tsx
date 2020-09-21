import * as React from 'react';
import { createIcon } from '../Icon';
export const MinusCircleIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <line x1={8} y1={12} x2={16} y2={12} />
  </React.Fragment>,
  'MinusCircleIcon'
);
