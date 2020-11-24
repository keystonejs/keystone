/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import { HTMLAttributes, forwardRef, useEffect, useRef } from 'react';

type Props = {
  direction?: 'row' | 'column';
  onClickOutside?: () => void;
  placement?: 'center' | 'left' | 'right';
} & HTMLAttributes<HTMLElement>;

export const Hoverable = forwardRef(
  ({
    direction = 'row',
    onBlur,
    onFocus,
    onClickOutside,
    placement = 'center',
    ...props
  }: Props) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const { radii, spacing } = useTheme();
    const placements = {
      center: {
        left: '50%',
        transform: `translateX(-50%)`,
      },
      left: {
        left: 0,
      },
      right: {
        right: 0,
      },
    };

    useEffect(() => {
      const handleClick = (event: MouseEvent) => {
        if (
          elementRef.current &&
          !elementRef?.current.contains(event.target as Node) &&
          onClickOutside
        ) {
          onClickOutside();
        }
      };
      document.addEventListener('mousedown', handleClick);

      return () => {
        document.removeEventListener('mousedown', handleClick);
      };
    }, []);

    return (
      <div
        ref={elementRef}
        contentEditable={false}
        css={{
          background: 'white',
          borderRadius: radii.small,
          boxShadow: `rgba(9, 30, 66, 0.31) 0px 0px 1px, rgba(9, 30, 66, 0.25) 0px 4px 8px -2px`,
          display: 'flex',
          flexDirection: direction,
          marginTop: spacing.xsmall,
          padding: spacing.small,
          position: 'absolute',
          top: '100%',
          userSelect: 'none',
          zIndex: 1,
          ...placements[placement],
        }}
        {...props}
      />
    );
  }
);
