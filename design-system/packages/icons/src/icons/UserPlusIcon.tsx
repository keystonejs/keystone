import * as React from 'react';
import { createIcon } from '../Icon';
export const UserPlusIcon = createIcon(
  <React.Fragment>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx={8.5} cy={7} r={4} />
    <line x1={20} y1={8} x2={20} y2={14} />
    <line x1={23} y1={11} x2={17} y2={11} />
  </React.Fragment>,
  'UserPlusIcon'
);
