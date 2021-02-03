/** @jsx jsx */

import { SVGAttributes, forwardRef, ReactNode } from 'react';
import { ResponsiveProp, jsx, mapResponsiveProp } from '@keystone-ui/core';

export type IconProps = SVGAttributes<SVGSVGElement> & {
  /** The color for the SVG fill property. */
  color?: string;
  /** The size key for the icon. */
  size?: ResponsiveProp<keyof typeof sizeMap> | number;
};

// TODO: Move to theme?
const sizeMap = {
  small: 16,
  smallish: 20,
  medium: 24,
  largish: 28,
  large: 32,
};

export const createIcon = (children: ReactNode, name: string) => {
  let Icon = forwardRef<SVGSVGElement, IconProps>(
    ({ size = 'medium', color, ...props }: IconProps, ref: any) => {
      const resolvedSize = typeof size === 'number' ? size : mapResponsiveProp(size, sizeMap);

      return (
        <svg
          aria-hidden="true"
          focusable="false"
          css={{
            verticalAlign: 'text-bottom', // removes whitespace inside buttons
            fill: 'none',
            stroke: color || 'currentColor',
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
            strokeWidth: 2,
          }}
          height={`${resolvedSize}px`}
          width={`${resolvedSize}px`}
          ref={ref}
          role="img"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          {children}
        </svg>
      );
    }
  );
  Icon.displayName = name;
  return Icon;
};
