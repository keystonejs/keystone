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

export const FlexProvider = styled.div(({ isSecondary }) => ({
  width: '100%',
  display: 'flex',
  flexFlow: 'column nowrap',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  minHeight: isSecondary ? 'auto' : '100vh',
  height: ' 100%',
}));
export const NavGroupIcons = styled.div({
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const NavGroup = styled.div({
  display: 'flex',
  flexFlow: 'column nowrap',
  width: '100%',
  flex: 1,
});
export const NavSeparator = styled.div(({ isSelected }) => ({
  borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
  height: 20,
  opacity: isSelected ? 0 : 1,
}));
