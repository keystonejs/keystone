import * as React from 'react';
import { createIcon } from '../Icon';
export const ShareIcon = createIcon(
  <React.Fragment>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1={12} y1={2} x2={12} y2={15} />
  </React.Fragment>,
  'ShareIcon'
);
