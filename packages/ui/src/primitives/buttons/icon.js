// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
// $FlowFixMe
import { type ComponentType, forwardRef } from 'react';
import { Button, type ButtonProps } from './primitives';

type IconProps = ButtonProps & {
  icon: ComponentType<*>,
};

export const IconButton = forwardRef(({ children, icon: Icon, ...props }: IconProps, ref) => (
  <Button ref={ref} {...props}>
    <span css={{ display: 'flex', alignItems: 'center' }}>
      <Icon css={children ? { marginRight: '0.5em' } : null} />
      {children}
    </span>
  </Button>
));
