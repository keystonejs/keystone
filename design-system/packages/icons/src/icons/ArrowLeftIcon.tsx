import * as React from 'react';
import { createIcon } from '../Icon';
export const ArrowLeftIcon = createIcon(
  <React.Fragment>
    <line x1={19} y1={12} x2={5} y2={12} />
    <polyline points="12 19 5 12 12 5" />
  </React.Fragment>,
  'ArrowLeftIcon'
);
