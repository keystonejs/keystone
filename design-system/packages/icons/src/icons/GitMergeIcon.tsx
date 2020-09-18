import * as React from 'react';
import { createIcon } from '../Icon';
export const GitMergeIcon = createIcon(
  <React.Fragment>
    <circle cx={18} cy={18} r={3} />
    <circle cx={6} cy={6} r={3} />
    <path d="M6 21V9a9 9 0 0 0 9 9" />
  </React.Fragment>,
  'GitMergeIcon'
);
