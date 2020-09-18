import * as React from 'react';
import { createIcon } from '../Icon';
export const SunriseIcon = createIcon(
  <React.Fragment>
    <path d="M17 18a5 5 0 0 0-10 0" />
    <line x1={12} y1={2} x2={12} y2={9} />
    <line x1={4.22} y1={10.22} x2={5.64} y2={11.64} />
    <line x1={1} y1={18} x2={3} y2={18} />
    <line x1={21} y1={18} x2={23} y2={18} />
    <line x1={18.36} y1={11.64} x2={19.78} y2={10.22} />
    <line x1={23} y1={22} x2={1} y2={22} />
    <polyline points="8 6 12 2 16 6" />
  </React.Fragment>,
  'SunriseIcon'
);
