// @flow

import React, { type Node } from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';

import { colors } from '../theme';
import { alpha, darken, lighten } from '../theme/color-utils';
import { buttonAndInputBase } from './forms';
import { LoadingIndicator, LoadingSpinner } from './loading';

type Props = {
  appearance: 'default' | 'primary' | 'warning' | 'danger',
  children: Node,
  href?: string,
  isDisabled: boolean,
  to?: string,
  variant: 'bold' | 'subtle',
};

const ButtonElement = (props: Props) => {
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button type="button" disabled={props.isDisabled} {...props} />;
};

const subtleAppearance = {
  default: {
    text: colors.N40,
    textHover: colors.text,
  },
  primary: {
    text: colors.N40,
    textHover: colors.primary,
  },
  warning: {
    text: colors.N40,
    textHover: colors.danger,
  },
  danger: {
    text: colors.danger,
    textHover: colors.danger,
    isSolidOnHover: true,
  },
};
const boldAppearance = {
  default: {
    bg: colors.N05,
    border: colors.N20,
    focusRing: colors.primary,
    text: colors.text,
  },
  primary: {
    bg: colors.primary,
    border: darken(colors.primary, 16),
    text: 'white',
  },
  create: {
    bg: colors.create,
    border: darken(colors.create, 16),
    text: 'white',
  },
  danger: {
    bg: colors.danger,
    border: darken(colors.danger, 8),
    text: 'white',
  },
  warning: {
    bg: colors.warning,
    border: darken(colors.warning, 12),
    text: 'white',
  },
};

export const Button = styled(ButtonElement)(
  ({ appearance, isDisabled, variant }) => {
    const variantStyles =
      variant === 'subtle'
        ? makeLinkVariant({ appearance, isDisabled })
        : makeSolidVariant({ appearance, isDisabled });
    return {
      ...buttonAndInputBase,
      cursor: isDisabled ? 'default' : 'pointer',
      display: 'inline-block',
      opacity: isDisabled ? 0.66 : null,
      pointerEvents: isDisabled ? 'none' : null,
      textAlign: 'center',
      touchAction: 'manipulation', // Disables "double-tap to zoom" for mobile; removes delay on click events
      userSelect: 'none',

      '&:hover': {
        backgroundRepeat: 'repeat-x',
        textDecoration: 'none',
      },

      '&:focus': {
        outline: 0,
      },

      // apply appearance styles
      ...variantStyles,
    };
  }
);
Button.defaultProps = {
  appearance: 'default',
  variant: 'bold',
};

// ==============================
// Loading Variant
// ==============================

const LoadingButtonWrapper = styled(Button)({ position: 'relative' });
const LoadingIndicatorWrapper = styled.div({
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
});

function getAppearance(appearance) {
  if (appearance === 'default') return 'dark';
  return 'inverted';
}

type Loading = Props & {
  isLoading: boolean,
  indicatorVariant: 'spinner' | 'dots',
};
export const LoadingButton = ({
  children,
  indicatorVariant,
  isLoading,
  ...props
}: Loading) => {
  const appearance = getAppearance(props.appearance);
  const textCSS = isLoading ? { visibility: 'hidden' } : null;
  const isSpinner = indicatorVariant === 'spinner';

  return (
    <LoadingButtonWrapper {...props} isDisabled={isLoading}>
      {isLoading ? (
        <LoadingIndicatorWrapper>
          {isSpinner ? (
            <LoadingSpinner appearance={appearance} size={16} />
          ) : (
            <LoadingIndicator appearance={appearance} size={4} />
          )}
        </LoadingIndicatorWrapper>
      ) : null}
      <span css={textCSS}>{children}</span>
    </LoadingButtonWrapper>
  );
};
LoadingButton.defaultProps = {
  appearance: 'default',
  isLoading: false,
  variant: 'bold',
  indicatorVariant: 'dots',
};

function makeLinkVariant({ appearance, isDisabled }) {
  const { text, textHover, isSolidOnHover } = subtleAppearance[appearance];

  return {
    color: text,

    ':hover, :focus': isSolidOnHover
      ? makeSolidVariant({ appearance, isDisabled })
      : {
          color: textHover,
          textDecoration: 'underline',
        },
  };
}
function makeSolidVariant({ appearance, isDisabled }) {
  const { bg, border, focusRing, text } = boldAppearance[appearance];
  const bgTop = lighten(bg, 10);
  const bgBottom = darken(bg, 10);
  const borderTop = lighten(border, 8);
  const borderBottom = darken(border, 16);
  const activeBg = darken(bg, 12);
  const textShadow =
    appearance === 'default'
      ? '0 1px 0 rgba(255, 255, 255, 0.5)'
      : '0 -1px 0 rgba(0, 0, 0, 0.25)';

  return {
    backgroundColor: bgBottom,
    background: isDisabled
      ? null
      : `linear-gradient(to bottom, ${bgTop} 0%, ${bgBottom} 100%)`,
    borderColor: isDisabled ? null : `${borderTop} ${border} ${borderBottom}`,
    color: text,
    fontWeight: 500,
    textShadow,

    ':hover, :focus': {
      borderColor: `${darken(borderTop, 8)} ${darken(border, 8)} ${darken(
        borderBottom,
        8
      )}`,
      background: `linear-gradient(to bottom, ${lighten(
        bgTop,
        10
      )} 0%, ${lighten(bgBottom, 8)} 100%)`,
    },
    ':hover': {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
    },
    ':focus': {
      borderColor: focusRing,
      boxShadow: `0 0 0 3px ${alpha(focusRing || bg, 0.2)}`,
    },
    ':active': {
      background: activeBg,
      borderColor: `${darken(border, 24)} ${darken(border, 16)} ${darken(
        border,
        12
      )}`,
      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.12)',
    },
  };
}
