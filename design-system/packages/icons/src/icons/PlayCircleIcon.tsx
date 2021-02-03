import * as React from 'react';
import { createIcon } from '../Icon';
export const PlayCircleIcon = createIcon(
  <React.Fragment>
    <circle cx={12} cy={12} r={10} />
    <polygon points="10 8 16 12 10 16 10 8" />
  </React.Fragment>,
  'PlayCircleIcon'
);
