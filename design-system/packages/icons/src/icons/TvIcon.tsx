import * as React from 'react';
import { createIcon } from '../Icon';
export const TvIcon = createIcon(
  <React.Fragment>
    <rect x={2} y={7} width={20} height={15} rx={2} ry={2} />
    <polyline points="17 2 12 7 7 2" />
  </React.Fragment>,
  'TvIcon'
);
