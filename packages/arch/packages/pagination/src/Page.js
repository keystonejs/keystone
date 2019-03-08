// @flow
import * as React from 'react';
import styled from '@emotion/styled';

import { colors } from '@arch-ui/theme';
import type { LabelType, OnChangeType } from './types';

export type PagePrimitiveProps = {
  children: React.Node,
  as: React.Node,
  href?: string,
  isDisabled: boolean,
  isSelected: boolean,
  to?: string,
};
type PageProps = PagePrimitiveProps & {
  ariaLabel: LabelType,
  children: React.Node,
  isSelected: boolean,
  onClick: OnChangeType,
  value: number,
};

const PageButton = ({ isDisabled, current, props }) => (
  <button type="button" disabled={isDisabled} aria-current={current} {...props} />
);

// Element Switch
// remove props that will create react DOM warnings
// ------------------------------

const PagePrimitive = ({ isSelected, as: Tag, ...props }: PagePrimitiveProps) => {
  const current = isSelected ? 'page' : null;
  if (Tag) return <Tag aria-current={current} {...props} />;
  return <PageButton {...props} />;
};
PagePrimitive.defaultProps = {
  isDisabled: false,
  isSelected: false,
};

// Primitive
// ------------------------------

const PageElement = styled(PagePrimitive)(({ isDisabled, isSelected }: PageProps) => {
  const disabledStyles = isDisabled
    ? {
        color: colors.N40,
        cursor: 'default',
      }
    : null;
  const selectedStyles = isSelected
    ? {
        '&, &:hover, &:focus': {
          backgroundColor: colors.N10,
          borderColor: 'transparent',
          color: colors.N80,
          cursor: 'default',
        },
      }
    : null;

  return {
    appearance: 'none',
    background: 0,
    border: '1px solid transparent',
    borderRadius: 3,
    color: colors.N60,
    cursor: 'pointer',
    fontSize: 'inherit',
    marginRight: '.1em',
    padding: '0.25em 0.7em',
    textDecoration: 'none',

    '&:hover, &:focus': {
      backgroundColor: 'white',
      borderColor: colors.N20,
      color: colors.N80,
      outline: 'none',
    },

    ...selectedStyles,
    ...disabledStyles,
  };
});

const Page = (props: { value: number, onClick: number => void }) => {
  return (
    <PageElement
      {...props}
      onClick={() => {
        if (props.onClick) {
          props.onClick(props.value);
        }
      }}
    />
  );
};

export default Page;
