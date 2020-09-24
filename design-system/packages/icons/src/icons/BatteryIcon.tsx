import * as React from 'react';
import { createIcon } from '../Icon';
export const BatteryIcon = createIcon(
  <React.Fragment>
    <rect x={1} y={6} width={18} height={12} rx={2} ry={2} />
    <line x1={23} y1={13} x2={23} y2={11} />
  </React.Fragment>,
  'BatteryIcon'
);
