// @flow

import React, { type Node } from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';
import withPseudoState from 'react-pseudo-state';

import { buttonAndInputBase } from '../forms';
import { makeSubtleVariant, makeBoldVariant } from './variants';

export type ButtonProps = {
  appearance: 'default' | 'primary' | 'warning' | 'danger',
  children: Node,
  href?: string,
  isDisabled: boolean,
  to?: string,
  variant: 'bold' | 'subtle',
};

// remove props that will create react DOM warnings
const ButtonElement = ({
  isDisabled,
  isActive,
  isFocus,
  isHover,
  ...props
}: ButtonProps) => {
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button type="button" disabled={isDisabled} {...props} />;
};

const ButtonComponent = styled(ButtonElement)(
  ({ appearance, isActive, isHover, isFocus, isDisabled, variant }) => {
    const variantStyles =
      variant === 'subtle'
        ? makeSubtleVariant({
            appearance,
            isDisabled,
            isActive,
            isHover,
            isFocus,
          })
        : makeBoldVariant({
            appearance,
            isDisabled,
            isActive,
            isHover,
            isFocus,
          });
    return {
      ...buttonAndInputBase,
      cursor: isDisabled ? 'default' : 'pointer',
      display: 'inline-block',
      opacity: isDisabled ? 0.66 : null,
      outline: 0,
      pointerEvents: isDisabled ? 'none' : null,
      textAlign: 'center',
      touchAction: 'manipulation', // Disables "double-tap to zoom" for mobile; removes delay on click events
      userSelect: 'none',

      // apply appearance styles
      ...variantStyles,
    };
  }
);
ButtonComponent.defaultProps = {
  appearance: 'default',
  variant: 'bold',
};

export const Button = withPseudoState(ButtonComponent);
