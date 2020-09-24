import * as React from 'react';
import { createIcon } from '../Icon';
export const SendIcon = createIcon(
  <React.Fragment>
    <line x1={22} y1={2} x2={11} y2={13} />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </React.Fragment>,
  'SendIcon'
);
