import * as React from 'react';
import { createIcon } from '../Icon';
export const PauseCircleIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <line x1={10} y1={15} x2={10} y2={9} />
    <line x1={14} y1={15} x2={14} y2={9} />
  </React.Fragment>,
  'PauseCircleIcon'
);
