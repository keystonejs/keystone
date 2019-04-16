// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { type Node, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { withPseudoState } from 'react-pseudo-state';

import { gridSize } from '@arch-ui/theme';
import { uniformHeight } from '@arch-ui/common';
import {
  makeSubtleVariant,
  makeNuanceVariant,
  makeGhostVariant,
  makeBoldVariant,
} from './variants';

const SPACING_OPTION = {
  comfortable: `${gridSize}px ${gridSize * 1.5}px`,
  cozy: '2px 6px',
  cramped: '1px 2px',
};

export type ButtonProps = {
  appearance: 'default' | 'primary' | 'warning' | 'danger',
  children: Node,
  href?: string,
  isBlock?: boolean,
  isDisabled: boolean,
  isActive: boolean,
  isHover: boolean,
  isFocus: boolean,
  isSelected?: boolean,
  focusOrigin: 'mouse' | 'keyboard',
  spacing: 'comfortable' | 'cozy' | 'cramped',
  to?: string,
  variant: 'bold' | 'ghost' | 'subtle',
};

function makeVariant({
  appearance,
  isActive,
  isBlock,
  isHover,
  isFocus,
  isDisabled,
  isSelected,
  variant,
  spacing,
}) {
  let variantStyles;
  const config = { appearance, isDisabled, isActive, isHover, isFocus, isSelected };
  if (variant === 'subtle') {
    variantStyles = makeSubtleVariant(config);
  } else if (variant === 'nuance') {
    // $FlowFixMe
    variantStyles = makeNuanceVariant(config);
  } else if (variant === 'bold') {
    variantStyles = makeBoldVariant(config);
  } else if (variant === 'ghost') {
    variantStyles = makeGhostVariant(config);
  }

  return {
    ...uniformHeight,
    cursor: isDisabled ? 'default' : 'pointer',
    display: isBlock ? 'block' : 'inline-block',
    opacity: isDisabled ? 0.66 : null,
    outline: 0,
    padding: SPACING_OPTION[spacing],
    pointerEvents: isDisabled ? 'none' : null,
    textAlign: 'center',
    touchAction: 'manipulation', // Disables "double-tap to zoom" for mobile; removes delay on click events
    userSelect: 'none',
    width: isBlock ? '100%' : null,

    // override possible anchor styles
    ':hover': {
      textDecoration: 'none',
    },

    // apply appearance styles
    ...variantStyles,
  };
}

// remove props that will create react DOM warnings
const ButtonElement = forwardRef<ButtonProps, HTMLAnchorElement | HTMLButtonElement>(
  (props, ref) => {
    const { isDisabled, isActive, isFocus, isHover, isSelected, focusOrigin, ...rest } = props;
    const variant = makeVariant(props);

    if (rest.to) {
      return <Link innerRef={ref} css={variant} {...rest} />;
    }

    if (rest.href) {
      return (
        <a
          css={variant}
          {...rest}
          // $FlowFixMe
          ref={ref}
        />
      );
    }
    return (
      <button
        type="button"
        disabled={isDisabled}
        css={variant}
        {...rest}
        // $FlowFixMe
        ref={ref}
      />
    );
  }
);

// $FlowFixMe
ButtonElement.defaultProps = {
  appearance: 'default',
  spacing: 'comfortable',
  variant: 'bold',
};

export const Button = withPseudoState(ButtonElement);
