// @flow
import * as React from 'react';
import { Control, type ControlProps } from './control';

type Props = $Diff<ControlProps, { svg: string, type: string }>;

export const CheckboxPrimitive = ({ innerRef, ...props }: Props) => (
  <Control
    ref={innerRef}
    svg={`<g fillRule="evenodd">
        <rect class="outer-stroke" fill="transparent" x="6" y="6" width="12" height="12" rx="2" />
        <rect class="inner-stroke" fill="currentColor" x="6" y="6" width="12" height="12" rx="2" />
        <path
          d="M9.707 11.293a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 1 0-1.414-1.414L11 12.586l-1.293-1.293z"
          fill="inherit"
        />
      </g>`}
    type="checkbox"
    {...props}
  />
);

export const RadioPrimitive = ({ innerRef, ...props }: Props) => (
  <Control
    ref={innerRef}
    svg={`<g fillRule="evenodd">
      <circle class="outer-stroke" fill="transparent" cx="12" cy="12" r="7" />
      <circle class="inner-stroke" fill="currentColor" cx="12" cy="12" r="7" />
      <circle fill="inherit" cx="12" cy="12" r="2" />
    </g>`}
    type="radio"
    {...props}
  />
);
