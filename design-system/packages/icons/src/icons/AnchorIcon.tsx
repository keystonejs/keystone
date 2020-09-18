import * as React from 'react';
import { createIcon } from '../Icon';
export const AnchorIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={5} r={3} />
    <line x1={12} y1={22} x2={12} y2={8} />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
  </React.Fragment>,
  'AnchorIcon'
);
