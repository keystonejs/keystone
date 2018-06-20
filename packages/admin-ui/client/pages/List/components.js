import React from 'react';
import { colors, gridSize } from '@keystonejs/ui/src/theme';

export const OptionPrimitive = ({
  children,
  isDisabled,
  isFocused,
  isSelected,
  innerProps: { innerRef, ...innerProps },
}) => {
  const hoverAndFocusStyles = {
    backgroundColor: colors.B.L90,
    color: colors.primary,
  };
  const focusedStyles = isFocused && !isDisabled ? hoverAndFocusStyles : null;
  const selectedStyles =
    isSelected && !isDisabled
      ? {
          '&, &:hover, &:focus, &:active': {
            backgroundColor: colors.primary,
            color: 'white',
          },
        }
      : null;

  return (
    <div
      ref={innerRef}
      css={{
        alignItems: 'center',
        backgroundColor: colors.N05,
        borderRadius: 3,
        color: isDisabled ? colors.N60 : null,
        cursor: 'pointer',
        display: 'flex',
        fontSize: '0.9em',
        justifyContent: 'space-between',
        marginBottom: 4,
        opacity: isDisabled ? 0.6 : null,
        outline: 0,
        padding: `${gridSize}px ${gridSize * 1.5}px`,
        pointerEvents: isDisabled ? 'none' : null,

        ':active': {
          backgroundColor: colors.B.L80,
          color: colors.primary,
        },

        ...focusedStyles,
        ...selectedStyles,
      }}
      {...innerProps}
    >
      {children}
    </div>
  );
};
