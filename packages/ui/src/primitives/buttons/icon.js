// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { type ComponentType } from 'react';
import { Button, type ButtonProps } from './primitives';

type IconProps = ButtonProps & {
  icon: ComponentType<*>,
};

export const IconButton = ({ children, icon: Icon, ...props }: IconProps) => (
  <Button {...props}>
    <span css={{ display: 'flex', alignItems: 'center' }}>
      <Icon css={children ? { marginRight: '0.5em' } : null} />
      {children}
    </span>
  </Button>
);
