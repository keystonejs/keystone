// @flow

import React, { type Node } from 'react';
import styled from '@emotion/styled';

import { borderRadius, colors, gridSize } from '../../theme';
import { ItemElement } from './common';

export const FlexProvider = styled.div({
  alignItems: 'flex-start',
  display: 'flex',
  flexFlow: 'column nowrap',
  height: ' 100vh',
  justifyContent: 'flex-start',
  width: '100%',
});

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

const Wrapper = styled.nav({
  backgroundColor: 'rgb(244, 245, 247)',
  boxSizing: 'border-box',
  display: 'flex',
  flexFlow: 'column nowrap',
  fontSize: '0.9rem',
  fontWeight: 500,
  minHeight: '100vh',
  overflowY: 'auto',
  position: 'fixed',
});
const Inner = styled.div({
  minWidth: 140,
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

type Props = { children: Node };

export const PrimaryNav = ({ children, style }: Props) => (
  <Wrapper style={style}>
    <Inner>
      <FlexProvider>{children}</FlexProvider>
    </Inner>
  </Wrapper>
);
