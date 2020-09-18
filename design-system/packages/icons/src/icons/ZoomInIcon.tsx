import * as React from 'react';
import { createIcon } from '../Icon';
export const ZoomInIcon = createIcon(
  <React.Fragment>
    <circle cx={11} cy={11} r={8} />
    <line x1={21} y1={21} x2={16.65} y2={16.65} />
    <line x1={11} y1={8} x2={11} y2={14} />
    <line x1={8} y1={11} x2={14} y2={11} />
  </React.Fragment>,
  'ZoomInIcon'
);
