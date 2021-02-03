import * as React from 'react';
import { createIcon } from '../Icon';
export const SpeakerIcon = createIcon(
  <React.Fragment>
    <rect x={4} y={2} width={16} height={20} rx={2} ry={2} />
    <circle cx={12} cy={14} r={4} />
    <line x1={12} y1={6} x2={12.01} y2={6} />
  </React.Fragment>,
  'SpeakerIcon'
);
