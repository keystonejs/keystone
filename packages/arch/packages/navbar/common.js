// @flow

import React from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';

export const NAV_GUTTER = 20;
type ItemProps = { isSelected?: Boolean, to?: String, href?: String };

export const ItemElement = ({ isSelected, ...props }: ItemProps) => {
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button type="button" {...props} />;
};

export const FlexProvider = styled.div({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  marginLeft: -NAV_GUTTER,
  marginRight: -NAV_GUTTER,
  width: '100%',
});
export const NavGroup = styled.div({
  alignItems: 'center',
  display: 'flex',
});
export const NavSeparator = styled.div(({ isSelected }) => ({
  borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
  height: 20,
  opacity: isSelected ? 0 : 1,
}));
