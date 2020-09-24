import * as React from 'react';
import { createIcon } from '../Icon';
export const LogOutIcon = createIcon(
  <React.Fragment>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1={21} y1={12} x2={9} y2={12} />
  </React.Fragment>,
  'LogOutIcon'
);
