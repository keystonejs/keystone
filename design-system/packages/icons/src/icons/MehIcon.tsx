import * as React from 'react';
import { createIcon } from '../Icon';
export const MehIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <line x1={8} y1={15} x2={16} y2={15} />
    <line x1={9} y1={9} x2={9.01} y2={9} />
    <line x1={15} y1={9} x2={15.01} y2={9} />
  </React.Fragment>,
  'MehIcon'
);
