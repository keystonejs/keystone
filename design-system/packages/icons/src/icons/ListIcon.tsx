import * as React from 'react';
import { createIcon } from '../Icon';
export const ListIcon = createIcon(
  <React.Fragment>
    <line x1={8} y1={6} x2={21} y2={6} />
    <line x1={8} y1={12} x2={21} y2={12} />
    <line x1={8} y1={18} x2={21} y2={18} />
    <line x1={3} y1={6} x2={3.01} y2={6} />
    <line x1={3} y1={12} x2={3.01} y2={12} />
    <line x1={3} y1={18} x2={3.01} y2={18} />
  </React.Fragment>,
  'ListIcon'
);
