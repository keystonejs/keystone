import * as React from 'react';
import { createIcon } from '../Icon';
export const UnderlineIcon = createIcon(
  <React.Fragment>
    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
    <line x1={4} y1={21} x2={20} y2={21} />
  </React.Fragment>,
  'UnderlineIcon'
);
