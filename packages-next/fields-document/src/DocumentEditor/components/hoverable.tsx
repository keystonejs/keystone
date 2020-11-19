/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { HTMLAttributes, ReactNode, Ref, forwardRef } from 'react';

// Column layout options toolbar
const Hoverable = ({
  children,
  styles = {},
  onBlur,
  onFocus,
}: {
  children: ReactNode;
  styles?: any;
  onFocus?: () => void;
  onBlur?: () => void;
}) => (
  <span
    contentEditable={false}
    css={{
      userSelect: 'none',
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: `translateX(-50%)`,
      zIndex: 1,
      ...styles,
    }}
    onFocus={onFocus}
    onBlur={onBlur}
  >
    <HoverableElement>{children}</HoverableElement>
  </span>
);

export const HoverableElement = forwardRef(
  (props: HTMLAttributes<HTMLElement>, ref: Ref<HTMLElement>) => {
    return (
      <span
        ref={ref}
        css={{
          display: 'flex',
          marginTop: 8,
          padding: 6,
          background: 'white',
          borderRadius: 6,
          paddingLeft: 10,
          border: '1px solid rgba(0, 0, 0, 0.3)',
          boxShadow: `
0 2.4px 10px rgba(0, 0, 0, 0.09),
0 19px 80px rgba(0, 0, 0, 0.18)`,
          top: 0,
        }}
        {...props}
      />
    );
  }
);

export { Hoverable };
