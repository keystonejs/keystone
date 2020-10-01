import * as React from 'react';
import { createIcon } from '../Icon';
export const XCircleIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <line x1={15} y1={9} x2={9} y2={15} />
    <line x1={9} y1={9} x2={15} y2={15} />
  </React.Fragment>,
  'XCircleIcon'
);
