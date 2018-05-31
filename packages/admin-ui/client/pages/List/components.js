import React from 'react';
import { colors, gridSize } from '@keystonejs/ui/src/theme';

export const OptionPrimitive = ({
  children,
  isFocused,
  isSelected,
  innerProps: { innerRef, ...innerProps },
}) => {
  const hoverAndFocusStyles = {
    backgroundColor: colors.B.L90,
    color: colors.primary,
  };
  const focusedStyles = isFocused ? hoverAndFocusStyles : null;
  const selectedStyles = isSelected
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
        cursor: 'pointer',
        display: 'flex',
        fontSize: '0.9em',
        justifyContent: 'space-between',
        marginBottom: 4,
        outline: 0,
        padding: `${gridSize}px ${gridSize * 1.5}px`,

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
