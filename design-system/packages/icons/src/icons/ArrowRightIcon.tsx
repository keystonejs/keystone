import * as React from 'react';
import { createIcon } from '../Icon';
export const ArrowRightIcon = createIcon(
  <React.Fragment>
    <line x1={5} y1={12} x2={19} y2={12} />
    <polyline points="12 5 19 12 12 19" />
  </React.Fragment>,
  'ArrowRightIcon'
);
