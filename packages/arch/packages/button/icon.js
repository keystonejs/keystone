// @flow

import React, { type ComponentType } from 'react';
import { Button, type ButtonProps } from './primitives';

type IconProps = ButtonProps & {
  icon: ComponentType<*>,
};

export const IconButton = ({ children, icon: Icon, ...props }: IconProps) => (
  <Button {...props}>
    <span css={{ display: 'flex', alignItems: 'center' }}>
      <Icon css={{ marginRight: '0.5em' }} />
      {children}
    </span>
  </Button>
);
