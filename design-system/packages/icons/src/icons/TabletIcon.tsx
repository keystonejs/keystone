import * as React from 'react';
import { createIcon } from '../Icon';
export const TabletIcon = createIcon(
  <React.Fragment>
    <rect x={4} y={2} width={16} height={20} rx={2} ry={2} />
    <line x1={12} y1={18} x2={12.01} y2={18} />
  </React.Fragment>,
  'TabletIcon'
);
