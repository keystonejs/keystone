import * as React from 'react';
import { createIcon } from '../Icon';
export const LifeBuoyIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <circle cx={12} cy={12} r={4} />
    <line x1={4.93} y1={4.93} x2={9.17} y2={9.17} />
    <line x1={14.83} y1={14.83} x2={19.07} y2={19.07} />
    <line x1={14.83} y1={9.17} x2={19.07} y2={4.93} />
    <line x1={14.83} y1={9.17} x2={18.36} y2={5.64} />
    <line x1={4.93} y1={19.07} x2={9.17} y2={14.83} />
  </React.Fragment>,
  'LifeBuoyIcon'
);
