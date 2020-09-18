import * as React from 'react';
import { createIcon } from '../Icon';
export const MinusSquareIcon = createIcon(
  <React.Fragment>
    <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
    <line x1={8} y1={12} x2={16} y2={12} />
  </React.Fragment>,
  'MinusSquareIcon'
);
