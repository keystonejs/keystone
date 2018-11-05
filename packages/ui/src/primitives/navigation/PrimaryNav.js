// @flow

import React, { type Node } from 'react';
import styled from '@emotion/styled';

import { borderRadius, colors, gridSize } from '../../theme';
import { FlexProvider, ItemElement } from './common';

const Wrapper = styled.nav({
  // backgroundColor: colors.N90,
  // color: 'white',
  display: 'flex',
  flexFlow: 'column nowrap',
  fontSize: '0.9rem',
  fontWeight: 500,
  minHeight: '100vh',
  overflowY: 'auto',
  position: 'fixed',
});
const Inner = styled.div({
  minHeight: '100vh',
  minWidth: 100,
  paddingLeft: gridSize * 2,
  paddingRight: gridSize * 2,
});

export const BrandItem = styled.h2({
  fontSize: '1rem',
  fontWeight: 'bold',
  margin: 0,
  // padding: gridSize * 2,
  paddingBottom: gridSize * 2,
  paddingTop: gridSize * 2,
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
    marginBottom: 2,
    paddingLeft: gridSize * 2,
    paddingRight: gridSize * 2,
    paddingBottom: gridSize,
    paddingTop: gridSize,
    textDecoration: 'none',

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
