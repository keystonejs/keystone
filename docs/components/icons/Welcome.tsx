/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Welcome({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      aria-label="Welcome"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Welcome" />
      <path
        stroke={grad ? `url(#Welcome-${grad})` : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 13.9991C11.0607 13.9991 12.0779 13.5779 12.828 12.828L11.7727 13.5849L10.5878 13.9557L10 13.9991ZM10 13.9991C8.93934 13.9991 7.92211 13.5779 7.172 12.828L7.5 13.1217L8.32161 13.63L10 13.9991ZM7 8H7.01M13 8H13.01M19 10C19 11.1819 18.7672 12.3522 18.3149 13.4442C17.8626 14.5361 17.1997 15.5282 16.364 16.364C15.5282 17.1997 14.5361 17.8626 13.4442 18.3149C12.3522 18.7672 11.1819 19 10 19C8.8181 19 7.64778 18.7672 6.55585 18.3149C5.46392 17.8626 4.47177 17.1997 3.63604 16.364C2.80031 15.5282 2.13738 14.5361 1.68508 13.4442C1.23279 12.3522 1 11.1819 1 10C1 7.61305 1.94821 5.32387 3.63604 3.63604C5.32387 1.94821 7.61305 1 10 1C12.3869 1 14.6761 1.94821 16.364 3.63604C18.0518 5.32387 19 7.61305 19 10Z"
      />
    </svg>
  );
}
