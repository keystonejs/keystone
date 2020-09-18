import * as React from 'react';
import { createIcon } from '../Icon';
export const FlagIcon = createIcon(
  <React.Fragment>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1={4} y1={22} x2={4} y2={15} />
  </React.Fragment>,
  'FlagIcon'
);
