import * as React from 'react';
import { createIcon } from '../Icon';
export const LayoutIcon = createIcon(
  <React.Fragment>
    <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
    <line x1={3} y1={9} x2={21} y2={9} />
    <line x1={9} y1={21} x2={9} y2={9} />
  </React.Fragment>,
  'LayoutIcon'
);
