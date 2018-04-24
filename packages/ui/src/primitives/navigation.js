// @flow

import React, { type Node } from 'react';
import { Link } from 'react-router-dom';
import styled from 'react-emotion';

import { Container } from './layout';
import { colors } from '../theme';

const padding = 20;

const Wrapper = styled.div({
  backgroundColor: colors.primary,
  color: 'white',
});
const FlexProvider = styled.div({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  marginLeft: -padding,
  marginRight: -padding,
});
const ItemElement = props => {
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button type="button" {...props} />;
};

export const NavGroup = styled.div({
  alignItems: 'center',
  display: 'flex',
});
export const NavSeparator = styled.div({
  borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
  height: 20,
});
export const NavItem = styled(ItemElement)({
  color: 'white',
  padding: padding,
  textDecoration: 'none',

  ':hover': {
    textDecoration: 'underline',
  },
});
export const Navbar = ({ children }: { children: Node }) => (
  <Wrapper>
    <Container>
      <FlexProvider>{children}</FlexProvider>
    </Container>
  </Wrapper>
);
