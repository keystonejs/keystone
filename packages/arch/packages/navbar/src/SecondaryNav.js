import React from 'react';
import styled from '@emotion/styled';

import { colors, gridSize } from '@arch-ui/theme';
import { ItemElement } from './common';

const Wrapper = styled.nav({
  borderBottom: `1px solid ${colors.N10}`,
  color: colors.text,
  fontSize: '0.85em',
});
export const SecondaryNavItem = styled(ItemElement)(({ isSelected }) => ({
  boxShadow: `inset 0 ${isSelected ? -2 : 0}px 0 currentColor`,
  color: isSelected ? colors.text : colors.N60,
  cursor: 'pointer',
  display: 'inline-block',
  marginRight: gridSize,
  paddingBottom: gridSize * 2,
  paddingTop: gridSize * 2,
  transition: 'box-shadow 200ms',

  ':hover': {
    color: colors.text,
    textDecoration: 'none',
  },
}));

export const SecondaryNav = ({ children }) => <Wrapper>{children}</Wrapper>;
