import * as React from 'react';
import { createIcon } from '../Icon';
export const MusicIcon = createIcon(
  <React.Fragment>
    <path d="M9 18V5l12-2v13" />
    <circle cx={6} cy={18} r={3} />
    <circle cx={18} cy={16} r={3} />
  </React.Fragment>,
  'MusicIcon'
);
