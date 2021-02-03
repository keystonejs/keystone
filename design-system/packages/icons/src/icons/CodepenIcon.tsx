import * as React from 'react';
import { createIcon } from '../Icon';
export const CodepenIcon = createIcon(
  <React.Fragment>
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
    <line x1={12} y1={22} x2={12} y2={15.5} />
    <polyline points="22 8.5 12 15.5 2 8.5" />
    <polyline points="2 15.5 12 8.5 22 15.5" />
    <line x1={12} y1={2} x2={12} y2={8.5} />
  </React.Fragment>,
  'CodepenIcon'
);
