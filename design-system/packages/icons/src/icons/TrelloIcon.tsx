import * as React from 'react';
import { createIcon } from '../Icon';
export const TrelloIcon = createIcon(
  <React.Fragment>
    <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
    <rect x={7} y={7} width={3} height={9} />
    <rect x={14} y={7} width={3} height={5} />
  </React.Fragment>,
  'TrelloIcon'
);
