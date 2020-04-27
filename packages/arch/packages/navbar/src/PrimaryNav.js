import styled from '@emotion/styled';

import { colors, gridSize } from '@arch-ui/theme';
import { ItemElement } from './common';

export const PRIMARY_NAV_GUTTER = gridSize * 2;

export const NavGroupIcons = styled.div({
  alignItems: 'center',
  alignSelf: 'stretch',
  display: 'flex',
  justifyContent: 'space-between',
});

export const PrimaryNav = styled.nav({
  backgroundColor: colors.page,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  position: 'fixed',
  zIndex: 2,
});

export const PrimaryNavScrollArea = styled.div(({ hasScroll, isBottom, isScrollable }) => {
  const divider = {
    backgroundColor: 'rgba(9, 30, 66, 0.1)',
    content: '" "',
    height: 2,
    left: PRIMARY_NAV_GUTTER,
    right: PRIMARY_NAV_GUTTER,
    position: 'absolute',
  };
  const before = hasScroll ? { ...divider, top: 0 } : null;
  const after = isScrollable && !isBottom ? { ...divider, bottom: 0 } : null;

  return {
    boxSizing: 'border-box',
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    minWidth: 140,
    paddingBottom: PRIMARY_NAV_GUTTER,
    width: '100%',

    ':before': before,
    ':after': after,
  };
});

export const BrandItem = styled.h2({
  fontSize: 18,
  fontWeight: 500,
  margin: 0,
  paddingBottom: PRIMARY_NAV_GUTTER,
});

export const PrimaryNavItem = styled(ItemElement)(({ depth, isSelected, mouseIsOverNav }) => {
  const selectedStyles = isSelected
    ? {
        '&, :hover, :active, :focus': {
          ':after': {
            backgroundColor: colors.primary,
          },
        },
      }
    : {};

  return {
    border: 0,
    borderRight: '1px solid transparent',
    color: isSelected ? colors.N90 : mouseIsOverNav ? colors.N70 : colors.N40,
    display: 'block',
    marginBottom: 2,
    overflow: 'hidden',
    padding: `${gridSize * 1.5}px`,
    paddingLeft: depth ? PRIMARY_NAV_GUTTER * depth : PRIMARY_NAV_GUTTER,
    position: 'relative',
    textDecoration: 'none',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    transition: 'color 110ms',
    fontWeight: isSelected ? 'bold' : 'normal',

    flexGrow: 1,
    flexBasis: '100%',

    ':hover, :focus': {
      backgroundColor: colors.N10,
      textDecoration: 'none',
    },
    ':active': {
      backgroundColor: colors.N10,
    },

    ':after': {
      borderRadius: 2,
      bottom: 2,
      content: '" "',
      pointerEvents: 'none',
      position: 'absolute',
      right: 6,
      top: 2,
      transition: 'background-color 110ms',
      width: 4,
    },

    ...selectedStyles,
  };
});

export const NavIcon = styled(ItemElement)(({ mouseIsOverNav }) => {
  return {
    color: mouseIsOverNav ? colors.N70 : colors.N40,
    padding: PRIMARY_NAV_GUTTER,
    textDecoration: 'none',
    flexGrow: 1,
    flexBasis: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ':hover, :focus': {
      backgroundColor: colors.N10,
      textDecoration: 'none',
    },
    ':active': {
      backgroundColor: colors.N10,
    },
  };
});

export const PrimaryNavHeading = styled.h3(({ depth }) => ({
  color: colors.N40,
  fontSize: '0.85em',
  fontWeight: 'bold',
  marginTop: '2em',
  paddingLeft: depth ? PRIMARY_NAV_GUTTER * depth : PRIMARY_NAV_GUTTER,
  paddingRight: PRIMARY_NAV_GUTTER,
  textTransform: 'uppercase',
}));
