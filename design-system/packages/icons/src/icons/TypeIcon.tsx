import * as React from 'react';
import { createIcon } from '../Icon';
export const TypeIcon = createIcon(
  <React.Fragment>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1={9} y1={20} x2={15} y2={20} />
    <line x1={12} y1={4} x2={12} y2={20} />
  </React.Fragment>,
  'TypeIcon'
);
