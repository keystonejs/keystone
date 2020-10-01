import * as React from 'react';
import { createIcon } from '../Icon';
export const LayersIcon = createIcon(
  <React.Fragment>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </React.Fragment>,
  'LayersIcon'
);
