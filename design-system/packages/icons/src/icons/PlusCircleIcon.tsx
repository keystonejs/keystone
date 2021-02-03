import * as React from 'react';
import { createIcon } from '../Icon';
export const PlusCircleIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <line x1={12} y1={8} x2={12} y2={16} />
    <line x1={8} y1={12} x2={16} y2={12} />
  </React.Fragment>,
  'PlusCircleIcon'
);
