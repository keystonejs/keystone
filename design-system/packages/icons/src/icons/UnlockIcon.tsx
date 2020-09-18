import * as React from 'react';
import { createIcon } from '../Icon';
export const UnlockIcon = createIcon(
  <React.Fragment>
    <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </React.Fragment>,
  'UnlockIcon'
);
