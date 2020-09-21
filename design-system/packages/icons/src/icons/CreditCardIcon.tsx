import * as React from 'react';
import { createIcon } from '../Icon';
export const CreditCardIcon = createIcon(
  <React.Fragment>
    <rect x={1} y={4} width={22} height={16} rx={2} ry={2} />
    <line x1={1} y1={10} x2={23} y2={10} />
  </React.Fragment>,
  'CreditCardIcon'
);
