/** @jsx jsx */
import { jsx } from '@emotion/core';
import { forwardRef } from 'react';
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

function makeVariant({
  appearance = 'default',
  isActive,
  isBlock,
  isHover,
  isFocus,
  isDisabled,
  isSelected,
  variant = 'bold',
  spacing = 'comfortable',
}) {
  let variantStyles;
  const config = { appearance, isDisabled, isActive, isHover, isFocus, isSelected };
  if (variant === 'subtle') {
    variantStyles = makeSubtleVariant(config);
  } else if (variant === 'nuance') {
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
function ButtonElementComponent(props, ref) {
  const { isDisabled, isActive, isFocus, isHover, isSelected, focusOrigin, ...rest } = props;
  const variant = makeVariant(props);

  if (rest.to) {
    return <Link ref={ref} css={variant} {...rest} />;
  }

  if (rest.href) {
    return <a css={variant} {...rest} ref={ref} />;
  }
  return <button type="button" disabled={isDisabled} css={variant} ref={ref} {...rest} />;
}

const ButtonElement = forwardRef(ButtonElementComponent);

export const Button = withPseudoState(ButtonElement);
