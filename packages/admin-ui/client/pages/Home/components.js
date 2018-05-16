import React from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';
import { colors, gridSize } from '@keystonejs/ui/src/theme';
import { LoadingIndicator } from '@keystonejs/ui/src/primitives/loading';

const BOX_GUTTER = `${gridSize * 2}px`;

export const Box = styled(Link)`
  background-color: white;
  border-radius: 3px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.075), 0 0 0 1px rgba(0, 0, 0, 0.1);
  color: ${colors.N40};
  display: block;
  line-height: 1.1;
  padding: ${BOX_GUTTER};
  position: relative;
  transition: box-shadow 80ms linear;

  &:hover,
  &:focus {
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.075), 0 0 0 1px ${colors.B.A60};
    outline: 0;
    text-decoration: none;
  }
`;

export const Name = styled.span(
  ({ isHover }) => `
  border-bottom: 1px solid ${isHover ? colors.B.A50 : 'transparent'};
  color: ${colors.primary};
  display: inline-block;
  font-size: 1.1em;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: border-color 80ms linear;
  white-space: nowrap;
`
);
export const Count = ({ meta }) => {
  const count = meta && meta.count;

  return count ? (
    <div css={{ fontSize: '0.85em' }}>
      {count} Item{count !== 1 ? 's' : ''}
    </div>
  ) : (
    <div css={{ height: '0.85em' }}>
      <LoadingIndicator />
    </div>
  );
};
export const CreateButton = styled.button(
  ({ isHover }) => `
  align-items: center;
  background-color: ${isHover ? colors.N20 : colors.N10};
  border-radius: 2px;
  border: 0;
  color: white;
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: center;
  outline: 0;
  position: absolute;
  right: ${BOX_GUTTER};
  top: ${BOX_GUTTER};
  transition: background-color 80ms linear;
  width: 24px;

  &:hover, &:focus {
    background-color: ${colors.create};
  }
`
);
