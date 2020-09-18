import * as React from 'react';
import { createIcon } from '../Icon';
export const CameraIcon = createIcon(
  <React.Fragment>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx={12} cy={13} r={4} />
  </React.Fragment>,
  'CameraIcon'
);
