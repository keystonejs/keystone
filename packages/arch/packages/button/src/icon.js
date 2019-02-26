// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { type ComponentType, forwardRef } from 'react';
import { Button, type ButtonProps } from './primitives';

type IconProps = ButtonProps & {
  icon: ComponentType<*>,
  title?: string,
};

export const IconButton = forwardRef<IconProps, Button>(
  ({ children, icon: Icon, title, ...props }, ref) => (
    <Button ref={ref} {...props}>
      <span css={{ display: 'flex', alignItems: 'center' }}>
        <Icon css={children ? { marginRight: '0.5em' } : null} title={title} />
        {children}
      </span>
    </Button>
  )
);
