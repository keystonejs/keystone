import * as React from 'react';
import { createIcon } from '../Icon';
export const DivideIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={6} r={2} />
    <line x1={5} y1={12} x2={19} y2={12} />
    <circle cx={12} cy={18} r={2} />
  </React.Fragment>,
  'DivideIcon'
);
