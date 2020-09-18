import * as React from 'react';
import { createIcon } from '../Icon';
export const PlusSquareIcon = createIcon(
  <React.Fragment>
    <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
    <line x1={12} y1={8} x2={12} y2={16} />
    <line x1={8} y1={12} x2={16} y2={12} />
  </React.Fragment>,
  'PlusSquareIcon'
);
