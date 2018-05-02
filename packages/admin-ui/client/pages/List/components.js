import styled from 'react-emotion';

import { colors, gridSize } from '@keystonejs/ui/src/theme';

export const OptionPrimitive = styled.div(({ isFocused, isSelected }) => {
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

  return {
    alignItems: 'center',
    backgroundColor: colors.N05,
    borderRadius: 3,
    cursor: 'pointer',
    display: 'flex',
    fontSize: '0.9em',
    justifyContent: 'space-between',
    marginBottom: 2,
    padding: `${gridSize}px ${gridSize * 1.5}px`,

    ':active': {
      backgroundColor: colors.B.L80,
      color: colors.primary,
    },

    ...focusedStyles,
    ...selectedStyles,
  };
});
