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
