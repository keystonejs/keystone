import * as React from 'react';
import { createIcon } from '../Icon';
export const ShoppingCartIcon = createIcon(
  <React.Fragment>
    <circle cx={9} cy={21} r={1} />
    <circle cx={20} cy={21} r={1} />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </React.Fragment>,
  'ShoppingCartIcon'
);
