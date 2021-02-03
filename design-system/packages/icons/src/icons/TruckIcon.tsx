import * as React from 'react';
import { createIcon } from '../Icon';
export const TruckIcon = createIcon(
  <React.Fragment>
    <rect x={1} y={3} width={15} height={13} />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx={5.5} cy={18.5} r={2.5} />
    <circle cx={18.5} cy={18.5} r={2.5} />
  </React.Fragment>,
  'TruckIcon'
);
