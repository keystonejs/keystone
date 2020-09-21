import * as React from 'react';
import { createIcon } from '../Icon';
export const BatteryChargingIcon = createIcon(
  <React.Fragment>
    <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.19" />
    <line x1={23} y1={13} x2={23} y2={11} />
    <polyline points="11 6 7 12 13 12 9 18" />
  </React.Fragment>,
  'BatteryChargingIcon'
);
