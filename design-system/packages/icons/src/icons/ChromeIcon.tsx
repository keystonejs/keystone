import * as React from 'react';
import { createIcon } from '../Icon';
export const ChromeIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <circle cx={12} cy={12} r={4} />
    <line x1={21.17} y1={8} x2={12} y2={8} />
    <line x1={3.95} y1={6.06} x2={8.54} y2={14} />
    <line x1={10.88} y1={21.94} x2={15.46} y2={14} />
  </React.Fragment>,
  'ChromeIcon'
);
