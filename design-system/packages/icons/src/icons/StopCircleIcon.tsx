import * as React from 'react';
import { createIcon } from '../Icon';
export const StopCircleIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <rect x={9} y={9} width={6} height={6} />
  </React.Fragment>,
  'StopCircleIcon'
);
