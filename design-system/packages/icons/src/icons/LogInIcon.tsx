import * as React from 'react';
import { createIcon } from '../Icon';
export const LogInIcon = createIcon(
  <React.Fragment>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1={15} y1={12} x2={3} y2={12} />
  </React.Fragment>,
  'LogInIcon'
);
