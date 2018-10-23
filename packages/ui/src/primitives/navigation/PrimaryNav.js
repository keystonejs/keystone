// @flow

import React, { type Node } from 'react';
import styled from '@emotion/styled';

import { Container } from '../layout';
import { colors, gridSize } from '../../theme';
import { FlexProvider, ItemElement, NAV_GUTTER } from './common';

const Wrapper = styled.nav({
  backgroundColor: colors.primary,
  color: 'white',
  minHeight: '100vh',
  width: '25vh',
  minWidth: '220px',
});

export const PrimaryNavItem = styled(ItemElement)(({ isSelected }) => ({
  background: isSelected ? colors.B.D10 : 'none',
  border: 0,
  borderRadius: '0.25em',
  color: 'white',
  marginRight: -1,
  paddingLeft: NAV_GUTTER,
  paddingRight: NAV_GUTTER,
  paddingBottom: gridSize * 1.5,
  paddingTop: gridSize * 1.5,
  position: isSelected ? 'relative' : null,
  textDecoration: 'none',

  ':hover': {
    textDecoration: isSelected ? 'none' : 'underline',
  },
}));

type Props = { children: Node };

export const PrimaryNav = ({ children }: Props) => (
  <Wrapper>
    <Container>
      <FlexProvider>{children}</FlexProvider>
    </Container>
  </Wrapper>
);
