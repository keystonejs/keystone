import * as React from 'react';
import { createIcon } from '../Icon';
export const ServerIcon = createIcon(
  <React.Fragment>
    <rect x={2} y={2} width={20} height={8} rx={2} ry={2} />
    <rect x={2} y={14} width={20} height={8} rx={2} ry={2} />
    <line x1={6} y1={6} x2={6.01} y2={6} />
    <line x1={6} y1={18} x2={6.01} y2={18} />
  </React.Fragment>,
  'ServerIcon'
);
