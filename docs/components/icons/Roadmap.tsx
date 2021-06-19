/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Grad } from './util';

export function Roadmap({ grad, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 18"
      aria-label="Roadmap"
      role="img"
      fill="none"
      {...props}
    >
      <Grad name="Roadmap" />
      <path
        stroke={grad ? `url(#Roadmap-${grad})` : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 1L7 4M7 17L1.553 14.276C1.38692 14.193 1.24722 14.0654 1.14955 13.9075C1.05188 13.7496 1.0001 13.5677 1 13.382V2.618C1.00009 2.44761 1.04372 2.28007 1.12674 2.13127C1.20977 1.98248 1.32944 1.85736 1.47439 1.76781C1.61935 1.67825 1.78479 1.62721 1.95501 1.61955C2.12522 1.61188 2.29458 1.64784 2.447 1.724L7 4V17ZM7 17L13 14L7 17ZM7 17V4V17ZM13 14L17.553 16.276C17.7054 16.3522 17.8748 16.3881 18.045 16.3805C18.2152 16.3728 18.3806 16.3218 18.5256 16.2322C18.6706 16.1426 18.7902 16.0175 18.8733 15.8687C18.9563 15.7199 18.9999 15.5524 19 15.382V4.618C18.9999 4.43234 18.9481 4.25037 18.8504 4.09247C18.7528 3.93458 18.6131 3.80699 18.447 3.724L13 1V14ZM13 14V1V14Z"
      />
    </svg>
  );
}
