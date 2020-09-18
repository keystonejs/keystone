import * as React from 'react';
import { createIcon } from '../Icon';
export const XSquareIcon = createIcon(
  <React.Fragment>
    <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
    <line x1={9} y1={9} x2={15} y2={15} />
    <line x1={15} y1={9} x2={9} y2={15} />
  </React.Fragment>,
  'XSquareIcon'
);
