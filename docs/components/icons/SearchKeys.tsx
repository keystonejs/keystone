/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Grad } from './util';

export function SearchKeys({ grad, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 23 12"
      aria-label="Search Keys"
      role="img"
      fill="none"
      {...props}
    >
      <Grad name="SearchKeys" />
      <g fill={grad ? `url(#SearchKeys-${grad})` : 'currentColor'} fillRule="nonzero">
        <path d="M3.47 4.9v2.2h-.96C1.37 7.12.43 8.02.43 9.17a2.08 2.08 0 104.16 0v-.95h2.18v.95a2.08 2.08 0 104.16 0c0-1.15-.93-2.05-2.08-2.05h-.96V4.89h.96c1.15 0 2.08-.9 2.08-2.05a2.08 2.08 0 00-4.16 0v.95H4.59v-.95a2.08 2.08 0 10-4.15 0c0 1.15.93 2.05 2.07 2.05h.96zm-.95-1.1a.97.97 0 01-.01-1.93c.52 0 .96.44.96.98v.96h-.95zm6.31 0H7.9v-.95c0-.54.44-.97.96-.97s.95.43.95.96-.43.97-.97.97zM4.6 7.13V4.89h2.18v2.23H4.59zM2.52 8.19h.95v.95c0 .54-.44.98-.96.98a.96.96 0 01.01-1.93zm6.31 0c.54 0 .97.44.97.96 0 .54-.43.97-.95.97a.97.97 0 01-.96-.98v-.95h.94zM14.93 11.06h1.57V7.69l1.14-1.29 3.4 4.66H23l-4.25-5.73L22.66.94H20.8l-4.19 4.78h-.11V.94h-1.57z" />
      </g>
    </svg>
  );
}
