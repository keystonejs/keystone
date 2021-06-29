/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function GraphQl({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 44 50"
      aria-label="GraphQl"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="GraphQl" />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M2.38664 36.795L4.18359 37.8325L24.2023 3.16003L22.4054 2.12253L2.38664 36.795Z"
      />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M42.0131 34.025H1.97559V36.1H42.0131V34.025Z"
      />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M2.76769 35.1908L22.7939 46.7533L23.8314 44.9564L3.80519 33.3939L2.76769 35.1908Z"
      />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M20.1642 5.05579L40.1904 16.6183L41.2279 14.8213L21.2017 3.25884L20.1642 5.05579Z"
      />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M2.77305 14.8134L3.81055 16.6104L23.8368 5.04786L22.7993 3.25091L2.77305 14.8134Z"
      />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M19.8026 3.16041L39.8213 37.8329L41.6182 36.7954L21.5995 2.12291L19.8026 3.16041Z"
      />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M5.6375 13.4375H3.5625V36.5625H5.6375V13.4375Z"
      />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M40.4373 13.4375H38.3623V36.5625H40.4373V13.4375Z"
      />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M21.5342 44.3053L22.4404 45.8749L39.8579 35.8186L38.9516 34.249L21.5342 44.3053Z"
      />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M43.188 37.2375C41.988 39.325 39.313 40.0375 37.2255 38.8375C35.138 37.6375 34.4255 34.9625 35.6255 32.875C36.8255 30.7875 39.5005 30.075 41.588 31.275C43.688 32.4875 44.4005 35.15 43.188 37.2375Z"
      />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M8.36279 17.125C7.16279 19.2125 4.48778 19.925 2.40028 18.725C0.312782 17.525 -0.399718 14.85 0.800282 12.7625C2.00028 10.675 4.67528 9.96246 6.76278 11.1625C8.85028 12.375 9.56279 15.0375 8.36279 17.125Z"
      />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M0.812977 37.2375C-0.387023 35.15 0.325477 32.4875 2.41298 31.275C4.50048 30.075 7.16298 30.7875 8.37548 32.875C9.57548 34.9625 8.86298 37.625 6.77548 38.8375C4.67548 40.0375 2.01298 39.325 0.812977 37.2375Z"
      />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M35.6382 17.125C34.4382 15.0375 35.1507 12.375 37.2382 11.1625C39.3257 9.96246 41.9882 10.675 43.2007 12.7625C44.4007 14.85 43.6882 17.5125 41.6007 18.725C39.5132 19.925 36.8382 19.2125 35.6382 17.125Z"
      />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M22.0002 49.475C19.5877 49.475 17.6377 47.525 17.6377 45.1125C17.6377 42.7 19.5877 40.75 22.0002 40.75C24.4127 40.75 26.3627 42.7 26.3627 45.1125C26.3627 47.5125 24.4127 49.475 22.0002 49.475Z"
      />
      <path
        fill={grad ? `url(#GraphQl-${grad})` : 'currentColor'}
        d="M22.0002 9.25002C19.5877 9.25002 17.6377 7.30002 17.6377 4.88752C17.6377 2.47502 19.5877 0.525024 22.0002 0.525024C24.4127 0.525024 26.3627 2.47502 26.3627 4.88752C26.3627 7.30002 24.4127 9.25002 22.0002 9.25002Z"
      />
    </svg>
  );
}
