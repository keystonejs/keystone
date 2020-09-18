import * as React from 'react';
import { createIcon } from '../Icon';
export const SidebarIcon = createIcon(
  <React.Fragment>
    <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
    <line x1={9} y1={3} x2={9} y2={21} />
  </React.Fragment>,
  'SidebarIcon'
);
