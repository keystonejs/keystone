import * as React from 'react';
import { Control } from './control';

const CheckboxIcon = React.memo(props => (
  <svg focusable="false" height="24" role="presentation" viewBox="0 0 24 24" width="24" {...props}>
    <g fillRule="evenodd">
      <rect className="outer-stroke" fill="transparent" x="6" y="6" width="12" height="12" rx="2" />
      <rect
        className="inner-stroke"
        fill="currentColor"
        x="6"
        y="6"
        width="12"
        height="12"
        rx="2"
      />
      <path
        d="M9.707 11.293a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 1 0-1.414-1.414L11 12.586l-1.293-1.293z"
        fill="inherit"
      />
    </g>
  </svg>
));

const RadioIcon = React.memo(props => (
  <svg focusable="false" height="24" role="presentation" viewBox="0 0 24 24" width="24" {...props}>
    <g fillRule="evenodd">
      <circle className="outer-stroke" fill="transparent" cx="12" cy="12" r="7" />
      <circle className="inner-stroke" fill="currentColor" cx="12" cy="12" r="7" />
      <circle fill="inherit" cx="12" cy="12" r="2" />
    </g>
  </svg>
));

export const CheckboxPrimitive = props => (
  <Control icon={CheckboxIcon} type="checkbox" {...props} />
);

export const RadioPrimitive = props => <Control icon={RadioIcon} type="radio" {...props} />;
