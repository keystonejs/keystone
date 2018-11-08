// @flow

import styled from '@emotion/styled';

import { borderRadius, colors, gridSize } from '../../theme';
import { ItemElement } from './common';

export const NavGroupIcons = styled.div({
  alignItems: 'center',
  alignSelf: 'stretch',
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  padding: gridSize * 2,
});

export const NavGroup = styled.div({
  boxSizing: 'border-box',
  flex: 1,
  overflowY: 'auto',
  paddingLeft: gridSize * 3,
  paddingRight: gridSize * 3,
  width: '100%',
});
export const NavSeparator = styled.div(({ isSelected }) => ({
  borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
  height: 20,
  opacity: isSelected ? 0 : 1,
}));

export const PrimaryNav = styled.nav({
  backgroundColor: colors.N10,
  boxSizing: 'border-box',
  display: 'flex',
  flexFlow: 'column nowrap',
  fontSize: '0.9rem',
  fontWeight: 500,
  minHeight: '100vh',
  overflowY: 'auto',
  position: 'fixed',
});

export const BrandItem = styled.h2({
  fontSize: 18,
  fontWeight: 500,
  margin: 0,
  paddingBottom: gridSize * 2,
});

export const PrimaryNavItem = styled(ItemElement)(({ isSelected }) => {
  const selectedStyles = isSelected
    ? {
        '&, :hover, :active, :focus': {
          backgroundColor: colors.N80,
          color: 'white',
        },
      }
    : {};

  return {
    border: 0,
    borderRadius,
    color: colors.N90,
    display: 'block',
    marginBottom: 2,
    overflow: 'hidden',
    paddingLeft: gridSize * 2,
    paddingRight: gridSize * 2,
    paddingBottom: gridSize,
    paddingTop: gridSize,
    textDecoration: 'none',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',

    ':hover, :focus': {
      backgroundColor: colors.B.L80,
      color: colors.B.D20,
      outline: 0,
      textDecoration: 'none',
    },
    ':active': {
      backgroundColor: colors.B.L70,
    },

    ...selectedStyles,
  };
});
