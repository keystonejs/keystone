// @flow

import React from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

import { gridSize } from '../../theme';
export const NAV_GUTTER = 16;
type ItemProps = { isSelected?: boolean, to?: string, href?: string };

export const ItemElement = ({ isSelected, ...props }: ItemProps) => {
  if (props.to) return <Link {...props} />;
  if (props.href) return <a {...props} />;
  return <button type="button" {...props} />;
};

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
