/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Prisma({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      aria-label="Prisma"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Prisma" />
      <path
        fill={grad ? `url(#Prisma-${grad})` : 'currentColor'}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M28.727 1.57683L49.3624 38.0932C49.7894 38.8487 49.796 39.7191 49.3811 40.4797C48.9649 41.2398 48.1694 41.8133 47.1968 42.0531L15.4417 49.8797C15.1126 49.9609 14.7779 50 14.4451 50C13.2709 50 12.1412 49.5121 11.4892 48.6691L0.549502 34.5471C-0.16956 33.6171 -0.183153 32.4561 0.510127 31.5147L22.8901 1.30769C23.5248 0.448707 24.6498 -0.0559801 25.9056 0.00495735C27.1295 0.0608168 28.2095 0.663942 28.727 1.57683ZM17.7986 46.3004L44.7419 39.6598C45.5069 39.4715 45.8903 38.7698 45.5542 38.1749L27.7323 6.63738C27.3564 5.97215 26.1648 6.08621 25.9848 6.80457L16.3595 45.2184C16.1865 45.9102 16.9754 46.5035 17.7986 46.3004Z"
      />
    </svg>
  );
}
