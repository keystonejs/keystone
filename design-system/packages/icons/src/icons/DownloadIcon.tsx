import * as React from 'react';
import { createIcon } from '../Icon';
export const DownloadIcon = createIcon(
  <React.Fragment>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1={12} y1={15} x2={12} y2={3} />
  </React.Fragment>,
  'DownloadIcon'
);
