/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Grad } from './util';

export function Search({ grad, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      aria-label="Search"
      role="img"
      fill="none"
      {...props}
    >
      <Grad name="Search" />
      <path
        fill={grad ? `url(#Copy-${grad})` : 'currentColor'}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 9C2 5.13401 5.13401 2 9 2C12.866 2 16 5.13401 16 9C16 10.886 15.2542 12.5977 14.0413 13.8564C14.0071 13.8827 13.9742 13.9116 13.9429 13.9429C13.9116 13.9742 13.8828 14.0071 13.8565 14.0413C12.5978 15.2541 10.886 16 9 16C5.13401 16 2 12.866 2 9ZM14.6177 16.0319C13.078 17.2635 11.125 18 9 18C4.02944 18 0 13.9706 0 9C0 4.02944 4.02944 0 9 0C13.9706 0 18 4.02944 18 9C18 11.125 17.2635 13.078 16.0319 14.6177L19.7071 18.2929C20.0977 18.6834 20.0977 19.3166 19.7071 19.7071C19.3166 20.0976 18.6834 20.0976 18.2929 19.7071L14.6177 16.0319Z"
      />
    </svg>
  );
}
