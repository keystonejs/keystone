import * as React from 'react';
import { createIcon } from '../Icon';
export const CopyIcon = createIcon(
  <React.Fragment>
    <rect x={9} y={9} width={13} height={13} rx={2} ry={2} />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </React.Fragment>,
  'CopyIcon'
);
