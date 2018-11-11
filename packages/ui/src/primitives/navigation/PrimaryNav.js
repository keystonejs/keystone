// @flow

import styled from '@emotion/styled';

import { borderRadius, colors, gridSize } from '../../theme';
import { ItemElement } from './common';

const GUTTER = gridSize * 2;

export const NavGroupIcons = styled.div({
  alignItems: 'center',
  alignSelf: 'stretch',
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  padding: gridSize * 2,
});

export const NavGroup = styled.div(({ isScrollable }) => ({
  boxSizing: 'border-box',
  boxShadow: isScrollable ? 'inset 0 -2px 0 rgba(0, 0, 0, 0.1)' : null,
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  paddingBottom: GUTTER,
  paddingLeft: GUTTER,
  paddingRight: GUTTER,
  width: '100%',
}));

export const PrimaryNav = styled.nav({
  backgroundColor: colors.N10,
  boxSizing: 'border-box',
  display: 'flex',
  flexFlow: 'column nowrap',
  fontSize: '0.9rem',
  fontWeight: 500,
  height: '100vh',
  overflow: 'hidden',
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
