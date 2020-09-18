import * as React from 'react';
import { createIcon } from '../Icon';
export const TargetIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <circle cx={12} cy={12} r={6} />
    <circle cx={12} cy={12} r={2} />
  </React.Fragment>,
  'TargetIcon'
);
