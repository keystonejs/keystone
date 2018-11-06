// @flow

import React, { type Node } from 'react';
import styled from '@emotion/styled';

import { Container } from '../layout';
import { colors, gridSize } from '../../theme';
import { FlexProvider, ItemElement } from './common';

const Wrapper = styled.nav({
  borderBottom: `1px solid ${colors.N10}`,
  color: colors.text,
  fontSize: '0.85em',
});
export const SecondaryNavItem = styled(ItemElement)(({ isSelected }) => ({
  display: 'inline-block',
  boxShadow: `inset 0 ${isSelected ? -2 : 0}px 0 currentColor`,
  color: isSelected ? colors.text : colors.N60,
  cursor: 'pointer',
  marginRight: gridSize,
  paddingBottom: gridSize * 1.5,
  paddingTop: gridSize * 1.5,
  transition: 'box-shadow 200ms',

  ':hover': {
    color: colors.text,
    textDecoration: 'none',
  },
}));

type Props = { children: Node };

export const SecondaryNav = ({ children }: Props) => (
  <Wrapper>
  {children}
  </Wrapper>
);
