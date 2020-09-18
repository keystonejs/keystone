import * as React from 'react';
import { createIcon } from '../Icon';
export const ShoppingBagIcon = createIcon(
  <React.Fragment>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1={3} y1={6} x2={21} y2={6} />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </React.Fragment>,
  'ShoppingBagIcon'
);
