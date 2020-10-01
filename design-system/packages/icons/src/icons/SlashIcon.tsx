import * as React from 'react';
import { createIcon } from '../Icon';
export const SlashIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <line x1={4.93} y1={4.93} x2={19.07} y2={19.07} />
  </React.Fragment>,
  'SlashIcon'
);
