/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Keystone({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 35 34"
      aria-label="Keystone"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Keystone" />
      <path
        fill={grad ? `url(#Keystone-${grad})` : 'currentColor'}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.82812 0.125C3.3332 0.125 0.5 2.9582 0.5 6.45312V27.5469C0.5 31.0418 3.3332 33.875 6.82812 33.875H27.9219C31.4168 33.875 34.25 31.0418 34.25 27.5469V6.45312C34.25 2.9582 31.4168 0.125 27.9219 0.125H6.82812ZM14.5199 20.9221V25.9648H9.98395V8.12991H14.5199V15.7929H14.7548L20.6874 8.12991H25.5571L19.3896 16.003L25.9155 25.9648H20.5885L16.0896 18.9322L14.5199 20.9221Z"
      />
    </svg>
  );
}
