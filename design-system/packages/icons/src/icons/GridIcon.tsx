import * as React from 'react';
import { createIcon } from '../Icon';
export const GridIcon = createIcon(
  <React.Fragment>
    <rect x={3} y={3} width={7} height={7} />
    <rect x={14} y={3} width={7} height={7} />
    <rect x={14} y={14} width={7} height={7} />
    <rect x={3} y={14} width={7} height={7} />
  </React.Fragment>,
  'GridIcon'
);
