/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import withPseudoState from 'react-pseudo-state';

import { PlusIcon } from '@voussoir/icons';
import { colors, borderRadius, gridSize } from '@voussoir/ui/src/theme';
import { LoadingIndicator } from '@voussoir/ui/src/primitives/loading';
import { A11yText } from '@voussoir/ui/src/primitives/typography';

const BOX_GUTTER = `${gridSize * 2}px`;

const BoxElement = styled(Link)`
  background-color: white;
  border-radius: ${borderRadius}px;
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

export const BoxComponent = ({
  isActive,
  isHover,
  isFocus,
  list,
  meta,
  onCreateClick,
  ...props
}) => {
  const { label, singular } = list;

  return (
    <BoxElement title={`Go to ${label}`} {...props}>
      <A11yText>Go to {label}</A11yText>
      <Name isHover={isHover || isFocus}>{label}</Name>
      <Count meta={meta} />
      <CreateButton
        title={`Create ${singular}`}
        isHover={isHover || isFocus}
        onClick={onCreateClick}
      >
        <PlusIcon />
        <A11yText>Create {singular}</A11yText>
      </CreateButton>
    </BoxElement>
  );
};

export const Box = withPseudoState(BoxComponent);

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
  const isLoading = meta === undefined;
  const count = (meta && meta.count) || 0;

  return isLoading ? (
    <div css={{ height: '0.85em' }}>
      <LoadingIndicator />
    </div>
  ) : (
    <div css={{ fontSize: '0.85em' }}>
      {count} Item
      {count !== 1 ? 's' : ''}
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
