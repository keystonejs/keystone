import * as React from 'react';
import { createIcon } from '../Icon';
export const ExternalLinkIcon = createIcon(
  <React.Fragment>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1={10} y1={14} x2={21} y2={3} />
  </React.Fragment>,
  'ExternalLinkIcon'
);
