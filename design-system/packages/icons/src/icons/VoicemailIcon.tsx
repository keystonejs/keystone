import * as React from 'react';
import { createIcon } from '../Icon';
export const VoicemailIcon = createIcon(
  <React.Fragment>
    <circle cx={5.5} cy={11.5} r={4.5} />
    <circle cx={18.5} cy={11.5} r={4.5} />
    <line x1={5.5} y1={16} x2={18.5} y2={16} />
  </React.Fragment>,
  'VoicemailIcon'
);
