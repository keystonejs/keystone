import * as React from 'react';
import { createIcon } from '../Icon';
export const XOctagonIcon = createIcon(
  <React.Fragment>
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
    <line x1={15} y1={9} x2={9} y2={15} />
    <line x1={9} y1={9} x2={15} y2={15} />
  </React.Fragment>,
  'XOctagonIcon'
);
